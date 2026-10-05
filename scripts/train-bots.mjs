// ============================================================================
//  train-bots.mjs -- the offline trainer for the per-fighter playbooks
// ============================================================================
// "Assign 1 bot to 1 fighter, and let them learn over time how to play well" (the owner, 2026-10-05). Each fighter has a PLAYBOOK
// (see PLAYBOOKS in artifacts/V1/index.html): a sparse vector of genes, each a delta on what the legacy AI plays. This script evolves
// them by bot-vs-bot matches on this PC, and writes what it finds into index.html between `// @playbooks:begin` and `// @playbooks:end`
// -- the only part of that file it ever touches -- so the game stays one self-contained file and the tests see the playbooks.
//
//   node scripts/train-bots.mjs run [--fighters all|"Firey,Pen"] [--workers N] [--embed] [--gens N] [--hours H]
//   node scripts/train-bots.mjs status
//   node scripts/train-bots.mjs embed [--target artifacts/V1/index.html]
//   node scripts/train-bots.mjs smoke            one generation on three fighters, in a scratch folder: proves the loop and prints matches a minute
//
// To leave it running for days, detached, from the repo root (PowerShell):
//   Start-Process -WindowStyle Hidden node -ArgumentList 'scripts/train-bots.mjs run --embed' -RedirectStandardOutput scripts/bot-training/out.log
// It saves after EVERY generation (scripts/bot-training/state.json, written atomically), so a reboot or a kill loses at most the generation in
// flight; run the same command again and it picks up where it stopped (the fighter with the fewest generations goes next, its pool of
// opponents is whatever the others have by then). Stop it cleanly with Ctrl-C, or by creating the file scripts/bot-training/STOP.
//
// ONE GENERATION of one fighter F:
//   1. K candidates: the champion playbook with 1-3 genes mutated (a move shift, a spacing delta, a kit knob, a matchup delta; now and then
//      a named-foe delta, the "counter", which is then tested against that foe alone).
//   2. A pool of opponents across the seven AI classes (the roster's `arch` through aiClass), each with ITS current playbook (none = today's
//      bot), all at Hard. For each pair i: an opponent, a seed and a side, and F's CHAMPION and every candidate play that same match.
//   3. A candidate is kept only if it wins clearly more: a paired sign test on the discordant pairs (candidate won where the champion lost,
//      b, against the reverse, c): z = (b - c) / sqrt(b + c). The test looks three times (32, 64, 96 pairs): it drops a candidate early when
//      it is not ahead, accepts early at z >= 2.6, and at the last look needs z >= 2.0 + 0.35 ln K and a net of 6 wins. A neutral change is
//      accepted about one time in twenty; the benchmark below catches the ones that were noise.
//   4. Every few generations the champion plays today's bot (F's own legacy self, Hard, sides alternating): that win rate is `wr`. A champion
//      that falls 15 points below its best is put back to the best.
//   5. Save: the generation, the matches played, `wr`.
// The dice of a generation (mutations, opponents, seeds) come from (seed, fighter, generation), so a generation replays identically.
//
// Matches run in worker threads, each with ONE jsdom copy of the game kept for hundreds of matches (re-seeded per match: a match depends on
// nothing but its seed and lineup, verified in test/bot-playbooks.test.js) -- the boot is a second a time and a match is about as long.
// The setup is the balance tournament's own (test/helpers/match-setup.js): the flat hazard-free stage, every fighter an AI, no items.
// The in-browser adaptation (BOT_ADAPT) is off here, as in every measurement context.
// ============================================================================
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { fileURLToPath, pathToFileURL } from 'node:url';
import os, { availableParallelism, tmpdir } from 'node:os';
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync, appendFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { loadMonolith } from '../test/helpers/load-monolith.js';
import { SETUP_SRC } from '../test/helpers/match-setup.js';
import { mulberry32 } from '../test/helpers/prng.js';

const SELF = fileURLToPath(import.meta.url);
const DEFAULT_DIR = path.join(path.dirname(SELF), 'bot-training');
const INDEX_HTML = 'artifacts/V1/index.html';

// jsdom's teardown leaves fire-and-forget boot tasks (refreshDailyCard and friends) holding a dead window; their rejection is noise, anything
// else is a real error and stops the run loudly. (The same guard scripts/balance-tournament.mjs carries.)
const TEARDOWN_RE = /Cannot read properties of (?:undefined|null) \(reading '(?:createElement|getElementById|body|querySelector[A-Za-z]*)'\)/;
// Installed only when this file runs as the trainer or as one of its workers, never when a test imports it (the test runner has its own).
function installGuard() {
  process.on('unhandledRejection', (err) => {
    const msg = (err && err.message) || String(err);
    if (TEARDOWN_RE.test(msg)) return;
    console.error('UNHANDLED REJECTION:', err);
    process.exit(1);
  });
}
const settle = async (turns = 3) => { for (let i = 0; i < turns; i++) await new Promise((r) => setTimeout(r, 0)); };

// ---------------------------------------------------------------------------
//  deterministic dice
// ---------------------------------------------------------------------------
export function deriveSeed(...parts) {
  let h = 2166136261 >>> 0;
  for (const p of parts) {
    const s = typeof p === 'string' ? p : String(p | 0);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    h ^= 0x9e37; h = Math.imul(h, 16777619) >>> 0; h ^= (h >>> 13);
  }
  return h >>> 0;
}
const rngOf = (...parts) => mulberry32(deriveSeed(...parts));
const gauss = (rng) => Math.sqrt(-2 * Math.log(1 - rng())) * Math.cos(2 * Math.PI * rng());

// ===========================================================================
//  WORKER: plays matches
// ===========================================================================
let W = null, playedHere = 0;
export async function closeWindow() { if (W) { await settle(); try { W.close(); } catch { /* teardown best-effort */ } W = null; } }
async function bootWindow(prizes) {
  await closeWindow();
  W = loadMonolith(1).window;
  if (prizes) W.eval('installPrizeKit(); PRIZE_ROSTER.forEach(function(r){ if(ROSTER.indexOf(r) < 0) ROSTER.push(r); });');
  playedHere = 0;
}
// One match. job = { names, pb, seed, stocks, maxFrames }: pb[i] is the playbook entry fighter i plays (null: today's bot), and every fighter
// plays at Hard. Returns the standings: the winner's index in `names`, the frames, whether it timed out, and the stocks and damage at the end.
export async function playMatch(job, prizes) {
  if (!W || playedHere >= 300) await bootWindow(prizes);   // a fresh copy every few hundred matches: nothing leaks that a long run could feel
  playedHere++;
  W.Math.random = mulberry32(job.seed);
  W.eval(SETUP_SRC);
  W.eval(`__setupCustomMatch(${JSON.stringify(job.names)}, ${job.stocks | 0}, 2, 0)`);
  W.eval(`(function(pbs){ for (var i = 0; i < fighters.length; i++){ fighters[i]._lvl = 2; fighters[i]._pbOverride = pbs[i]; } })(${JSON.stringify(job.pb)})`);
  let frames = 0;
  while (W.eval('running') && frames < job.maxFrames) { W.eval('step()'); frames++; }
  const timedOut = !!W.eval('running');
  const fs = JSON.parse(W.eval('JSON.stringify(fighters.map(function(f, i){ return { i: i, dead: !!f.dead, stocks: f.stocks === Infinity ? 999 : f.stocks, pct: Math.round(f.pct), placement: f.placement }; }))'));
  // the balance tournament's ranking: alive before dead; alive by stocks then lower damage; the dead by the later knockout
  fs.sort((a, b) => (a.dead !== b.dead) ? (a.dead ? 1 : -1) : !a.dead ? (b.stocks - a.stocks || a.pct - b.pct) : ((a.placement || 9999) - (b.placement || 9999)));
  await settle();   // recordMatch's storage writes land before the next match's setup
  const byIdx = [];
  for (const f of fs) byIdx[f.i] = f;
  return { winner: fs[0].i, frames, timedOut, stocks: byIdx.map((f) => f.stocks), pct: byIdx.map((f) => f.pct) };
}
if (!isMainThread && workerData && workerData.role === 'worker') {
  installGuard();
  parentPort.on('message', async (msg) => {
    if (msg === 'close') { await settle(); try { W && W.close(); } catch { /* */ } process.exit(0); }
    try { parentPort.postMessage({ id: msg.id, ...(await playMatch(msg.job, workerData.prizes)) }); }
    catch (e) { await closeWindow(); parentPort.postMessage({ id: msg.id, error: String((e && e.stack) || e) }); }   // a fresh copy of the game for the next match
  });
}

// ===========================================================================
//  MAIN
// ===========================================================================
// ---- the worker pool: a queue of match jobs spread over N threads ----
class Pool {
  constructor(n, prizes) {
    this.n = n; this.prizes = prizes; this.queue = []; this.pending = new Map(); this.nextId = 1; this.idle = []; this.workers = [];
    for (let i = 0; i < n; i++) this.spawn();
  }
  spawn() {
    const w = new Worker(SELF, { workerData: { role: 'worker', prizes: this.prizes } });
    w.on('message', (m) => {
      const p = this.pending.get(m.id); this.pending.delete(m.id);
      w._job = null; this.idle.push(w); this.pump();
      if (!p) return;
      if (m.error) p.reject(new Error(m.error)); else p.resolve(m);
    });
    w.on('error', (e) => { console.error('worker error:', e); const j = w._job; this.workers = this.workers.filter((x) => x !== w); if (j) { this.pending.delete(j.id); j.reject(e); } this.spawn(); });
    this.workers.push(w); this.idle.push(w);
  }
  run(job) { return new Promise((resolve, reject) => { this.queue.push({ id: this.nextId++, job, resolve, reject }); this.pump(); }); }
  pump() {
    while (this.idle.length && this.queue.length) {
      const w = this.idle.pop(), q = this.queue.shift();
      w._job = q; this.pending.set(q.id, q); w.postMessage({ id: q.id, job: q.job });
    }
  }
  async close() { for (const w of this.workers) { w.postMessage('close'); } await Promise.race([Promise.all(this.workers.map((w) => new Promise((r) => w.once('exit', r)))), new Promise((r) => setTimeout(r, 5000))]); for (const w of this.workers) w.terminate(); }
}

// ---- what the game says about itself: the genes, the roster, each fighter's AI class and the genes its kit reads ----
export async function readGame(prizes) {
  const w = loadMonolith(1).window;
  try {
    if (prizes) w.eval('installPrizeKit(); PRIZE_ROSTER.forEach(function(r){ if(ROSTER.indexOf(r) < 0) ROSTER.push(r); });');
    const info = JSON.parse(w.eval(`JSON.stringify({
      genes: PB_GENES, vsGenes: PB_VS_GENES, classCode: PB_CLASS_CODE, shipped: PLAYBOOKS,
      roster: ROSTER.filter(function(r){ return r.play; }).map(function(r){ var sp = r.kit && r.kit.special; return { name: r.name, cls: aiClass(r), sp: sp, kg: pbKitGenes(sp) }; }) })`));
    info.schema = deriveSeed(JSON.stringify(info.genes), JSON.stringify(info.vsGenes)).toString(16);
    return info;
  } finally { await settle(); try { w.close(); } catch { /* */ } }
}

// A match that fails (a game exception in some corner of some kit) must not end a run of days: it is logged and its pair counts for nothing.
const safely = (pool, job) => pool.run(job).catch((e) => ({ failed: true, error: String((e && e.message) || e).split('\n')[0] }));

// ---- the state file ----
const statePath = (dir) => path.join(dir, 'state.json');
export function loadState(dir) { try { return JSON.parse(readFileSync(statePath(dir), 'utf8')); } catch { return null; } }
export function saveState(dir, st) {
  st.updated = new Date().toISOString();
  if (st._clock) st.totals.wallMs = st._clock.wall0 + (Date.now() - st._clock.t0);   // the hours it has run, kept up to date in the file
  const tmp = statePath(dir) + '.tmp';
  writeFileSync(tmp, JSON.stringify(st));
  renameSync(tmp, statePath(dir));   // atomic: a kill mid-write leaves the last good state
}
export function freshFighter(seedBook) {
  return { gen: seedBook && seedBook.gen || 0, accepted: 0, matches: 0, v: { ...(seedBook && seedBook.v || {}) }, vs: JSON.parse(JSON.stringify(seedBook && seedBook.vs || {})),
           sigma: 1, wr: null, wrN: 0, wins: 0, best: null, vsStats: {}, history: [] };
}
const playbookOf = (fs) => (fs && (Object.keys(fs.v).length || Object.keys(fs.vs).length)) ? { v: fs.v, vs: fs.vs } : null;

// ---- mutation ----
const snap = (x, step) => Number((Math.round(x / step) * step).toFixed(4));
const clampTo = (x, [lo, hi]) => Math.max(lo, Math.min(hi, x));
// One candidate: the champion with one to three genes moved. Returns { v, vs, desc, focus } (focus: the named foe a counter is tested against).
export function mutate(rng, champ, ctx) {
  const { info, fighter, sigma, counters, foes } = ctx;
  const v = { ...champ.v }, vs = JSON.parse(JSON.stringify(champ.vs || {}));
  const desc = [];
  let focus = null;
  const move = (name, spec, cur) => {
    const [lo, hi, step] = spec;
    let val;
    if (cur !== 0 && rng() < 0.12) val = 0;                                  // retire a gene: most of a long run's progress is finding what to drop
    else {
      const sd = Math.max(step, (hi - lo) / 8 * sigma);
      let d = Math.round(gauss(rng) * sd / step) * step;
      if (d === 0) d = (rng() < 0.5 ? -1 : 1) * step;
      val = snap(clampTo(cur + d, spec), step);
      if (val === cur) val = snap(clampTo(cur - d, spec), step);          // pushed into a bound (sJmp cannot go below 0): go the other way
    }
    return val;
  };
  const names = Object.keys(info.genes);
  const pools = {
    move: names.filter((n) => n[0] === 'm'), spacing: names.filter((n) => n[0] === 's'),
    gimmick: (fighter.kg || []), matchup: names.filter((n) => n[0] === 'x'),
  };
  const kinds = [['move', 0.50], ['spacing', 0.20], ['matchup', 0.15]];
  if (pools.gimmick.length) kinds.push(['gimmick', 0.10]);
  const withCounter = counters && foes.length ? kinds.concat([['counter', 0.05]]) : kinds;
  const pick = (from) => { const total = from.reduce((a, k) => a + k[1], 0); let r = rng() * total; for (const [k, w] of from) { if ((r -= w) < 0) return k; } return from[0][0]; };
  // A counter is its own candidate (one named-foe delta, tested against that foe alone); everything else moves one to three genes.
  const first = pick(withCounter);
  if (first === 'counter') {
    focus = foes[Math.floor(rng() * foes.length)];                          // one of the foes it loses to most
    const params = Object.keys(info.vsGenes), p = params[Math.floor(rng() * params.length)];
    const blk = vs[focus] || (vs[focus] = {});
    const val = move('vs.' + p, info.vsGenes[p], blk[p] || 0);
    if (val === 0) delete blk[p]; else blk[p] = val;
    if (!Object.keys(blk).length) delete vs[focus];
    desc.push(`vs.${focus}.${p}=${val}`);
    return { v, vs, desc, focus };
  }
  const n = rng() < 0.55 ? 1 : rng() < 0.67 ? 2 : 3, moved = new Set();
  for (let i = 0; i < n; i++) {
    const kind = i === 0 ? first : pick(kinds), list = pools[kind];
    let g = list[Math.floor(rng() * list.length)];
    if (moved.has(g)) { g = list.find((x) => !moved.has(x)); if (!g) continue; }   // three different genes, not one moved three times
    moved.add(g);
    const val = move(g, info.genes[g], v[g] || 0);
    if (val === 0) delete v[g]; else v[g] = val;
    desc.push(`${g}=${val}`);
  }
  return { v, vs, desc, focus };
}

// ---- the paired test (see the header) ----
export const TEST = { looks: [32, 64, 96], zEarly: 2.6, zAccept: 2.0, minNet: 6, zDrop: [0.3, 1.0] };
export function lookDecision(b, c, look, looks, cfg = TEST, k = 1) {
  const d = b - c, z = (b + c) ? d / Math.sqrt(b + c) : 0, last = look === looks;
  const zAcc = cfg.zAccept + 0.35 * Math.log(Math.max(1, k));
  if (d >= cfg.minNet && z >= (last ? zAcc : cfg.zEarly)) return { z, verdict: 'accept' };
  if (last) return { z, verdict: 'reject' };
  return { z, verdict: z < cfg.zDrop[Math.min(look - 1, cfg.zDrop.length - 1)] ? 'reject' : 'continue' };
}

// ---- the opponents of one generation: stratified over the seven AI classes, each with its current playbook ----
function opponentsFor(info, rng, fighter, n, foe) {
  if (foe) return Array.from({ length: n }, () => foe);
  const byClass = {};
  for (const r of info.roster) if (r.name !== fighter.name) (byClass[r.cls] || (byClass[r.cls] = [])).push(r.name);
  const classes = Object.keys(byClass).sort();
  const out = [];
  for (let i = 0; out.length < n; i++) {
    const c = classes[i % classes.length], list = byClass[c];
    out.push(list[Math.floor(rng() * list.length)]);
  }
  return out;
}

// ---- one generation of one fighter ----
export async function generation(ctx, name) {
  const { pool, st, cfg, info } = ctx;
  const F = st.fighters[name], fighter = info.roster.find((r) => r.name === name);
  const g = F.gen + 1, t0 = Date.now();
  const books = {};                                            // the pool: everyone's playbook as of now (null = today's bot)
  for (const r of info.roster) books[r.name] = playbookOf(st.fighters[r.name]);
  const champ = { v: { ...F.v }, vs: JSON.parse(JSON.stringify(F.vs)) };
  const champBook = playbookOf(F);
  const rng = rngOf(st.seed, name, g);
  const foes = Object.entries(F.vsStats).filter(([, s]) => s.n >= 6).sort((a, b) => (a[1].w / a[1].n) - (b[1].w / b[1].n)).map(([k]) => k).slice(0, 5);
  const cands = [];
  for (let k = 0; k < cfg.cands; k++) cands.push(mutate(rng, champ, { info, fighter, sigma: F.sigma, counters: cfg.counters, foes }));
  const alive = cands.map((c, k) => ({ k, c, b: 0, c0: 0, verdict: null, z: 0 }));
  let pairs = 0, matches = 0;
  const looks = cfg.looks;
  for (let li = 0; li < looks.length; li++) {
    const todo = alive.filter((a) => !a.verdict);
    if (!todo.length) break;
    const upTo = looks[li], from = pairs;
    // The arms: for each opponent list (the stratified pool, '*', and one per named foe a counter candidate is aimed at) the champion plays it,
    // and every candidate for that list plays the same opponents on the same seeds. Pair i of an arm set is one opponent, one seed, one side.
    const arms = [];
    for (const key of new Set(todo.map((a) => a.c.focus || '*'))) arms.push({ key, a: null });
    for (const a of todo) arms.push({ key: a.c.focus || '*', a });
    const jobs = [];
    for (const arm of arms) {
      const foe = arm.key === '*' ? null : arm.key;
      const opps = opponentsFor(info, rngOf(st.seed, name, g, 'opp', li, arm.key), fighter, upTo - from, foe);
      const mine = arm.a ? { v: arm.a.c.v, vs: arm.a.c.vs } : champBook;
      for (let i = from; i < upTo; i++) {
        const o = opps[i - from], side = i % 2;                  // F takes the left spawn on even pairs, the right on odd
        jobs.push({ arm, i, o, side, job: { names: side ? [o, name] : [name, o], pb: side ? [books[o], mine] : [mine, books[o]], seed: deriveSeed(st.seed, name, g, arm.key, i), stocks: cfg.stocks, maxFrames: cfg.maxFrames } });
      }
    }
    const res = await Promise.all(jobs.map((j) => safely(pool, j.job)));
    matches += res.length;
    const bad = res.filter((r) => r.failed);
    if (bad.length) ctx.log(`${name}: ${bad.length} of ${res.length} matches failed (${bad[0].error}); those pairs count for nothing`);
    const champWon = new Map();                                  // key:pair -> did the champion win that pair (a failed match is no result)
    jobs.forEach((j, x) => { if (!j.arm.a && !res[x].failed) champWon.set(j.arm.key + ':' + j.i, res[x].winner === (j.side ? 1 : 0)); });
    jobs.forEach((j, x) => {
      if (res[x].failed) return;
      const won = res[x].winner === (j.side ? 1 : 0);
      if (!j.arm.a) { const s = F.vsStats[j.o] || (F.vsStats[j.o] = { w: 0, n: 0 }); s.n++; if (won) s.w++; return; }
      const cw = champWon.get(j.arm.key + ':' + j.i);
      if (cw === undefined) return;
      if (won && !cw) j.arm.a.b++; else if (!won && cw) j.arm.a.c0++;
    });
    pairs = upTo;
    for (const a of todo) {
      const d = lookDecision(a.b, a.c0, li + 1, looks.length, cfg.test, cfg.cands);
      a.z = d.z; if (d.verdict !== 'continue') a.verdict = d.verdict;
    }
  }
  const won = alive.filter((a) => a.verdict === 'accept').sort((a, b) => b.z - a.z || (b.b - b.c0) - (a.b - a.c0))[0] || null;
  if (won) { F.v = won.c.v; F.vs = won.c.vs; F.accepted++; F.sigma = Math.min(3, F.sigma * 1.15); } else F.sigma = Math.max(0.5, F.sigma * 0.97);
  F.gen = g; F.matches += matches;
  // the benchmark: the champion against today's bot (its own legacy self, Hard), sides alternating
  let benchNote = '';
  // `wr` is the CURRENT champion's: a new champion starts unmeasured and is benchmarked at once, then every few generations adds to its figure.
  if (won) { F.wr = null; F.wrN = 0; F.wins = 0; }
  if (playbookOf(F) && cfg.bench > 0 && (g % cfg.benchEvery === 0 || won)) {
    const book = playbookOf(F), jobs = [];
    for (let j = 0; j < cfg.bench; j++) jobs.push({ names: [name, name], pb: j % 2 ? [null, book] : [book, null], seed: deriveSeed(st.seed, name, g, 'bench', j), stocks: cfg.stocks, maxFrames: cfg.maxFrames });
    const all = await Promise.all(jobs.map((j) => safely(pool, j)));
    matches += all.length; F.matches += all.length;
    let n = 0;
    all.forEach((r, j) => { if (r.failed) return; n++; if (r.winner === (j % 2 ? 1 : 0)) F.wins++; });
    F.wrN += n;
    if (F.wrN) F.wr = F.wins / F.wrN;
    if (F.wrN >= 24 && (!F.best || F.wr > F.best.wr)) F.best = { wr: F.wr, n: F.wrN, v: { ...F.v }, vs: JSON.parse(JSON.stringify(F.vs)) };
    else if (F.best && F.wrN >= 48 && F.wr < F.best.wr - 0.15) {
      F.v = { ...F.best.v }; F.vs = JSON.parse(JSON.stringify(F.best.vs)); F.wr = F.best.wr; F.wrN = F.best.n; F.wins = Math.round(F.best.wr * F.best.n);
      benchNote = ' (fell 15 points below its best: put back)';
    }
    if (F.wr !== null) benchNote = ` wr ${(F.wr * 100).toFixed(0)}% of ${F.wrN}` + benchNote;
  }
  F.history.push({ g, ok: !!won, n: pairs, z: Number((won ? won.z : Math.max(...alive.map((a) => a.z))).toFixed(2)), mut: (won || alive[0]).c.desc, ms: Date.now() - t0 });
  if (F.history.length > 30) F.history.shift();
  st.totals.matches += matches;
  saveState(ctx.dir, st);
  const top = alive.map((a) => `${a.c.desc.join('+')}:${a.b}-${a.c0}`).join(' | ');
  ctx.log(`${name} gen ${g}: ${won ? 'ACCEPT ' + won.c.desc.join(' ') : 'no change'} (${pairs} pairs, ${matches} matches, ${((Date.now() - t0) / 1000).toFixed(0)} s)  [${top}]${benchNote}`);
  if (won && ctx.embed) embedFile(ctx, ctx.target);
  return { won: !!won, matches };
}

// ---- index.html's @playbooks block ----
export function formatBooks(entries) {
  const names = Object.keys(entries).sort();
  if (!names.length) return ['const PLAYBOOKS = {};'];
  const num = (x) => Number(Number(x).toFixed(4));
  const out = ['const PLAYBOOKS = {'];
  for (const n of names) {
    const e = entries[n], v = {}, vs = {};
    for (const k of Object.keys(e.v).sort()) v[k] = num(e.v[k]);
    for (const k of Object.keys(e.vs || {}).sort()) { vs[k] = {}; for (const p of Object.keys(e.vs[k]).sort()) vs[k][p] = num(e.vs[k][p]); }
    const meta = [];
    if (e.gen != null) meta.push(`"gen":${e.gen}`);
    if (e.n != null) meta.push(`"n":${e.n}`);
    if (e.wr != null) meta.push(`"wr":${Number(Number(e.wr).toFixed(3))}`);
    out.push(`  ${JSON.stringify(n)}: {${meta.join(',')}${meta.length ? ',' : ''}"v":${JSON.stringify(v)}${Object.keys(vs).length ? `,"vs":${JSON.stringify(vs)}` : ''}},`);
  }
  out.push('};');
  return out;
}
// Rewrites the `const PLAYBOOKS = ...;` statement between the two markers and nothing else: every byte outside it, line endings included, is kept.
export function embedPlaybooks(html, entries) {
  const nl = html.includes('\r\n') ? '\r\n' : '\n';
  const lines = html.split(nl);
  const at = (s) => lines.reduce((a, l, i) => (l.trim() === s ? a.concat(i) : a), []);
  const b = at('// @playbooks:begin'), e = at('// @playbooks:end');
  if (b.length !== 1 || e.length !== 1 || e[0] < b[0]) throw new Error('index.html needs exactly one // @playbooks:begin above one // @playbooks:end');
  const k = lines.findIndex((l, i) => i > b[0] && i < e[0] && l.startsWith('const PLAYBOOKS = '));
  if (k < 0) throw new Error('no `const PLAYBOOKS = ` line between the playbook markers');
  lines.splice(k, e[0] - k, ...formatBooks(entries));
  return lines.join(nl);
}
function entriesOf(st) {
  const out = {};
  for (const [name, F] of Object.entries(st.fighters)) {
    const b = playbookOf(F);
    if (b) out[name] = { gen: F.gen, n: F.matches, wr: F.wr, v: b.v, vs: b.vs };
  }
  return out;
}
function embedFile(ctx, target) {
  const html = readFileSync(target, 'utf8');
  const next = embedPlaybooks(html, entriesOf(ctx.st));
  if (next !== html) { writeFileSync(target + '.tmp', next); renameSync(target + '.tmp', target); }   // atomic: a worker booting the game never reads half a file
  return next !== html;
}

// ---- commands ----
function parseArgs(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const k = a.slice(2), v = argv[i + 1]; o[k] = (v !== undefined && !v.startsWith('--')) ? (i++, v) : true; }
    else o._.push(a);
  }
  return o;
}
const num = (x, d) => (x === undefined || x === true) ? d : Number(x);

function lockDir(dir) {
  const f = path.join(dir, 'trainer.lock');
  if (existsSync(f)) {
    const pid = Number(readFileSync(f, 'utf8'));
    let alive = false; try { process.kill(pid, 0); alive = pid !== process.pid; } catch { /* not running */ }
    if (alive) throw new Error(`another trainer (pid ${pid}) is writing ${dir}; stop it first (create ${path.join(dir, 'STOP')})`);
  }
  writeFileSync(f, String(process.pid));
  return () => { try { unlinkSync(f); } catch { /* */ } };
}

export async function run(opts) {
  const dir = opts.dir || DEFAULT_DIR;
  mkdirSync(dir, { recursive: true });
  const unlock = lockDir(dir);
  const logFile = path.join(dir, 'train.log');
  const log = (m) => { const line = `[${new Date().toISOString().slice(11, 19)}] ${m}`; console.log(line); try { appendFileSync(logFile, line + '\n'); } catch { /* */ } };
  const prizes = !(opts['no-prizes'] || opts.prizes === false);
  const info = await readGame(prizes);
  let st = loadState(dir);
  if (st && st.schema !== info.schema) {
    if (!opts.migrate) throw new Error(`the playbook schema changed since ${statePath(dir)} was written (${st.schema} -> ${info.schema}); run again with --migrate to drop the genes that are gone and keep the rest`);
    for (const F of Object.values(st.fighters)) {
      for (const k of Object.keys(F.v)) if (!info.genes[k]) delete F.v[k];
      F.best = null;
    }
    st.schema = info.schema;
  }
  const resumed = !!st;
  if (!st) {
    st = { version: 1, schema: info.schema, seed: num(opts.seed, 20261005), created: new Date().toISOString(), totals: { matches: 0, wallMs: 0 }, fighters: {} };
  }
  // new fighters start from what the game ships (so the trainer can pick up from index.html when its own state is gone)
  for (const r of info.roster) if (!st.fighters[r.name]) st.fighters[r.name] = freshFighter(info.shipped[r.name] || (opts.seedBooks && opts.seedBooks[r.name]));
  const wanted = (opts.fighters && opts.fighters !== 'all' && opts.fighters !== true) ? String(opts.fighters).split(',').map((s) => s.trim()).filter(Boolean) : info.roster.map((r) => r.name);
  for (const n of wanted) if (!st.fighters[n]) throw new Error(`no such fighter: ${n}`);
  const workers = Math.max(1, num(opts.workers, Math.max(1, availableParallelism() - 2)));
  const lanes = Math.max(1, Math.min(wanted.length, num(opts.lanes, Math.max(1, Math.ceil(workers / 4)))));
  const test = { ...TEST };
  const pmax = num(opts['pairs-max'], 0), pstep = num(opts['pairs-step'], pmax);
  const looks = pmax ? Array.from({ length: Math.ceil(pmax / pstep) }, (_, i) => Math.min(pmax, (i + 1) * pstep)) : TEST.looks;
  const cfg = {
    cands: Math.max(1, num(opts.cands, 3)), stocks: num(opts.stocks, 2), maxFrames: num(opts.frames, 5400), looks,
    bench: num(opts.bench, 24), benchEvery: num(opts['bench-every'], 5), counters: !opts['no-counters'], test,
  };
  if (opts.minnet !== undefined) test.minNet = num(opts.minnet);
  if (opts['z-accept'] !== undefined) test.zAccept = num(opts['z-accept']);
  const target = opts.target || INDEX_HTML;
  log(`${resumed ? 'resuming' : 'starting'} ${dir}: ${wanted.length} fighters, ${workers} workers, ${lanes} lanes, ${cfg.cands} candidates a generation, looks at ${cfg.looks.join('/')} pairs${opts.embed ? ', embedding into ' + target : ''}`);
  // A run of days should not make the machine it runs on feel slow: below normal priority unless asked otherwise (worker threads share it).
  try { if (opts.priority !== 'normal') os.setPriority(process.pid, os.constants.priority.PRIORITY_BELOW_NORMAL); } catch { /* not allowed here: carry on */ }
  const pool = new Pool(workers, prizes);
  const ctx = { pool, st, cfg, info, dir, log, embed: !!opts.embed, target };
  let stop = false;
  const onSig = () => { if (stop) process.exit(1); stop = true; log('stopping after the generations in flight (again to stop now)'); };
  process.on('SIGINT', onSig); process.on('SIGTERM', onSig);
  const t0 = Date.now(), startGen = Object.fromEntries(wanted.map((n) => [n, st.fighters[n].gen]));
  Object.defineProperty(st, '_clock', { value: { t0, wall0: st.totals.wallMs }, enumerable: false, configurable: true });
  const stopFile = path.join(dir, 'STOP');
  if (existsSync(stopFile)) { unlinkSync(stopFile); log('removed an old STOP file'); }
  const deadline = opts.hours ? t0 + num(opts.hours) * 3600e3 : Infinity;
  const maxGens = opts.gens ? num(opts.gens) : Infinity;
  const busy = new Set();
  let generations = 0, matchesNow = 0;
  const lane = async () => {
    for (;;) {
      if (stop || Date.now() > deadline || existsSync(path.join(dir, 'STOP'))) return;
      const next = wanted.filter((n) => !busy.has(n) && st.fighters[n].gen - startGen[n] < maxGens).sort((a, b) => st.fighters[a].gen - st.fighters[b].gen || (a < b ? -1 : 1))[0];
      if (!next) return;
      busy.add(next);
      try { const r = await generation(ctx, next); generations++; matchesNow += r.matches; }
      finally { busy.delete(next); }
    }
  };
  try { await Promise.all(Array.from({ length: lanes }, lane)); }
  finally {
    saveState(dir, st);
    if (opts.embed) { const changed = embedFile(ctx, target); log(`index.html playbooks ${changed ? 'rewritten' : 'unchanged'}`); }
    await pool.close();
    unlock();
  }
  const wall = Date.now() - t0;
  log(`done: ${generations} generations, ${matchesNow} matches in ${(wall / 1000).toFixed(1)} s = ${(matchesNow / (wall / 60000)).toFixed(1)} matches a minute (${workers} workers)`);
  return { generations, matches: matchesNow, wallMs: wall, perMinute: matchesNow / (wall / 60000), st };
}

function status(opts) {
  const dir = opts.dir || DEFAULT_DIR, st = loadState(dir);
  if (!st) { console.log(`no state in ${dir}`); return; }
  const rows = Object.entries(st.fighters).filter(([, F]) => F.gen > 0).sort((a, b) => b[1].gen - a[1].gen);
  console.log(`${dir}: ${rows.length} fighters trained, ${st.totals.matches} matches, ${(st.totals.wallMs / 3600e3).toFixed(1)} h, updated ${st.updated}`);
  for (const [n, F] of rows) {
    const genes = Object.keys(F.v).length + Object.values(F.vs).reduce((a, b) => a + Object.keys(b).length, 0);
    console.log(`  ${n.padEnd(14)} gen ${String(F.gen).padStart(4)}  kept ${String(F.accepted).padStart(3)}  genes ${String(genes).padStart(3)}  matches ${String(F.matches).padStart(6)}  vs today's bot ${F.wr === null ? '   -' : (F.wr * 100).toFixed(0).padStart(3) + '%'} of ${F.wrN}`);
  }
}

export async function smoke(opts) {
  const dir = opts.dir || path.join(tmpdir(), `bot-train-smoke-${process.pid}`);
  if (!opts.keep) rmSync(dir, { recursive: true, force: true });
  const fighters = opts.fighters && opts.fighters !== true ? String(opts.fighters) : 'Firey,Pen,Rocky';
  const n = fighters.split(',').length, pairs = num(opts.pairs, 4);
  console.log(`== SMOKE: one generation on ${n} fighter${n > 1 ? 's' : ''} (${fighters}) in ${dir} ==`);
  // Pen starts with a one-gene playbook, so the benchmark against today's bot runs as well as the candidates' pairs.
  const r = await run({ dir, fighters, gens: 1, workers: num(opts.workers, Math.min(4, availableParallelism())), lanes: n, cands: num(opts.cands, 2), 'pairs-max': pairs, 'pairs-step': pairs,
    bench: num(opts.bench, 4), 'bench-every': 1, frames: num(opts.frames, 1800), 'no-prizes': true, seed: num(opts.seed, 7), minnet: 1, priority: 'normal', seedBooks: { Pen: { v: { mJb: 0.25 } } } });
  console.log(`smoke: ${r.generations} generations, ${r.matches} matches, ${(r.wallMs / 1000).toFixed(1)} s, ${r.perMinute.toFixed(1)} matches a minute (state in ${statePath(dir)})`);
  return r;
}

async function main() {
  const args = parseArgs(process.argv.slice(2)), cmd = args._[0] || 'help';
  if (cmd === 'run') await run({ ...args, dir: args.dir });
  else if (cmd === 'status') status(args);
  else if (cmd === 'embed') {
    const dir = args.dir || DEFAULT_DIR, st = loadState(dir);
    if (!st) throw new Error(`no state in ${dir}`);
    const changed = embedFile({ st }, args.target || INDEX_HTML);
    console.log(`${args.target || INDEX_HTML}: playbooks ${changed ? 'rewritten' : 'unchanged'} (${Object.keys(entriesOf(st)).length} fighters)`);
  } else if (cmd === 'smoke') await smoke(args);
  else console.log('usage: node scripts/train-bots.mjs <run|status|embed|smoke> [--dir D] [--fighters all|A,B] [--workers N] [--lanes N] [--cands K] [--embed] [--gens N] [--hours H] [--pairs-max 96 --pairs-step 32] [--bench 24] [--bench-every 5] [--seed N] [--no-prizes]');
}
if (isMainThread && process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  installGuard();
  main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}
