// ============================================================================
//  balance-1v1.mjs -- the 1v1 balance run
// ============================================================================
// The owner, 2026-10-05: "ok. when running balance, do a 1v1." Every playable fighter plays `--opp` random opponents, each pairing
// TWICE with the spawn sides swapped, in real matches (balance-tournament.mjs's runMatch: the untouched game in jsdom, the real loop),
// Hard bots playing their trained playbooks. 50% is average. The prize rows are not in ROSTER at boot, so they are not in the run.
//
// Noise: a fighter's win rate over N games has a standard error of about 50/sqrt(N) points -- 5 at N=100 -- so a roster that is
// perfectly balanced still spreads about +-12 points at its extremes over ~100 fighters. A fighter is flagged only outside 50 +- 3 SE.
//
//   node scripts/balance-1v1.mjs --opp 50 --procs 10 --stocks 3 --seed 7 --out scripts/balance-1v1.json
//   node scripts/balance-1v1.mjs --opp 4 --procs 1 --only "Firey,Pen,Soap"      # a quick look
// Progress goes to stdout (one line per 100 matches); the report and the per-fighter table go to --out.
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => { if (x.startsWith('--')) a.push([x.slice(2), (arr[i + 1] && !arr[i + 1].startsWith('--')) ? arr[i + 1] : '1']); return a; }, []));
const SELF = fileURLToPath(import.meta.url);

function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

async function rosterNames(){
  await import('./balance-tournament.mjs');   // installs its jsdom teardown guard (a closed window's boot tasks must not kill the run)
  const { loadMonolith } = await import('../test/helpers/load-monolith.js');
  const { window: w } = loadMonolith(1);
  try { return w.eval('ROSTER.filter(function(r){ return r.play && !r.prize; }).map(function(r){ return r.name; })'); }
  finally { try { w.close && w.close(); } catch {} }
}

// Each round is a random perfect pairing, so every fighter meets one opponent a round; `opp` rounds give each `opp` opponents.
function schedule(names, opp, seed){
  const rnd = mulberry32(seed), out = [];
  for (let r = 0; r < opp; r++){
    const p = names.slice();
    for (let i = p.length - 1; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i + 1 < p.length; i += 2){
      const s = Math.floor(rnd() * 2 ** 31);
      out.push({ a: p[i], b: p[i + 1], seed: s });         // A on the left
      out.push({ a: p[i + 1], b: p[i], seed: s ^ 0x5bd1 }); // and swapped
    }
  }
  return out;
}

async function child(){
  const { runMatch } = await import('./balance-tournament.mjs');
  const sched = JSON.parse(readFileSync(args.sched, 'utf8'));
  const k = +args.child, of = +args.of, stocks = +(args.stocks || 3), maxFrames = +(args.frames || 9000);
  const lines = [];
  let n = 0;
  for (let i = k; i < sched.length; i += of){
    const m = sched[i];
    let r;
    try { r = await runMatch([m.a, m.b], { seed: m.seed, stocks, aiLevel: 2, maxFrames }); }
    catch (e) { lines.push(JSON.stringify({ i, a: m.a, b: m.b, err: String(e && e.message || e) })); continue; }
    const pa = r.perFighter[m.a] || {}, pb = r.perFighter[m.b] || {};
    lines.push(JSON.stringify({ i, a: m.a, b: m.b, w: r.winner, f: r.frames, to: !!r.timedOut, ka: pa.kos || 0, kb: pb.kos || 0, fa: pa.falls || 0, fb: pb.falls || 0 }));
    if (++n % 25 === 0){ writeFileSync(args.res, lines.join('\n') + '\n'); process.stdout.write(`chunk ${k}: ${n}\n`); }
  }
  writeFileSync(args.res, lines.join('\n') + '\n');
}

function report(results, names){
  const S = {};
  for (const nm of names) S[nm] = { games: 0, wins: 0, kos: 0, falls: 0, frames: 0, timeouts: 0, vs: {} };
  let errs = 0;
  for (const r of results){
    if (r.err){ errs++; continue; }
    for (const [me, foe, k, fl] of [[r.a, r.b, r.ka, r.fa], [r.b, r.a, r.kb, r.fb]]){
      const s = S[me]; if (!s) continue;
      s.games++; s.kos += k; s.falls += fl; s.frames += r.f; if (r.to) s.timeouts++;
      if (r.w === me) s.wins++;
      const v = s.vs[foe] || (s.vs[foe] = [0, 0]); v[1]++; if (r.w === me) v[0]++;
    }
  }
  const rows = names.map((nm) => { const s = S[nm], wr = s.games ? 100 * s.wins / s.games : 0, se = s.games ? 50 / Math.sqrt(s.games) : 99;
    return { name: nm, games: s.games, winRate: +wr.toFixed(1), se: +se.toFixed(1), kosPerGame: +(s.kos / Math.max(1, s.games)).toFixed(2),
      fallsPerGame: +(s.falls / Math.max(1, s.games)).toFixed(2), avgFrames: Math.round(s.frames / Math.max(1, s.games)), timeouts: s.timeouts,
      flag: s.games >= 20 && wr > 50 + 3 * se ? 'STRONG' : s.games >= 20 && wr < 50 - 3 * se ? 'WEAK' : '' }; })
    .sort((x, y) => y.winRate - x.winRate);
  const wrs = rows.filter((r) => r.games).map((r) => r.winRate), mean = wrs.reduce((a, b) => a + b, 0) / Math.max(1, wrs.length);
  const sd = Math.sqrt(wrs.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, wrs.length));
  const meanSE = rows.reduce((a, r) => a + r.se, 0) / Math.max(1, rows.length);
  return { when: new Date().toISOString(), matches: results.length, errors: errs, fighters: rows.length,
    spread: { mean: +mean.toFixed(1), sd: +sd.toFixed(1), nullSd: +meanSE.toFixed(1), note: 'a perfectly balanced roster would show an sd near nullSd' },
    strong: rows.filter((r) => r.flag === 'STRONG').map((r) => `${r.name} ${r.winRate}%`), weak: rows.filter((r) => r.flag === 'WEAK').map((r) => `${r.name} ${r.winRate}%`),
    rows, vs: Object.fromEntries(names.map((nm) => [nm, S[nm].vs])) };
}

// FOCUS MODE: each `--focus` fighter plays every `--panel` fighter, both sides, `--reps` seeds each -- the same panel every round, so a balance step on
// the focus fighters is measured against a fixed yardstick (and costs focus x panel x 2 x reps matches, not a whole round robin).
function focusSchedule(focus, panel, reps, seed){
  const rnd = mulberry32(seed), out = [];
  for (const f of focus) for (const p of panel) { if (f === p) continue;
    for (let r = 0; r < reps; r++) { const s = Math.floor(rnd() * 2 ** 31); out.push({ a: f, b: p, seed: s }); out.push({ a: p, b: f, seed: s ^ 0x5bd1 }); } }
  return out;
}

async function main(){
  if (args.child != null) return child();
  let names = await rosterNames();
  // --report-from DIR: rebuild the report from a run's chunk files (a run that was stopped part-way still has every match it finished)
  if (args['report-from']) {
    const dir = args['report-from'], files = (await import('node:fs')).readdirSync(dir).filter((f) => f.startsWith('res-')).map((f) => path.join(dir, f));
    const results = files.flatMap((f) => readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)));
    const rep = report(results, names); rep.partialOf = dir;
    writeFileSync(args.out || 'scripts/balance-1v1.json', JSON.stringify(rep, null, 1));
    process.stdout.write(`report from ${results.length} matches: sd ${rep.spread.sd} vs null ${rep.spread.nullSd}\nSTRONG: ${rep.strong.join(', ') || '-'}\nWEAK: ${rep.weak.join(', ') || '-'}\n`);
    return;
  }
  if (args.only) { const want = args.only.split(',').map((s) => s.trim()); names = names.filter((n) => want.includes(n)); }
  const opp = +(args.opp || 50), procs = +(args.procs || 8), seed = +(args.seed || 7);
  let sched;
  if (args.focus) {
    const focus = args.focus.split(',').map((s) => s.trim()).filter((n) => names.includes(n)), panel = (args.panel || '').split(',').map((s) => s.trim()).filter((n) => names.includes(n));
    if (!focus.length || !panel.length) throw new Error('focus mode needs --focus and --panel fighter names that are in the roster');
    sched = focusSchedule(focus, panel, +(args.reps || 1), seed);
    names = [...new Set([...focus, ...panel])];
  } else sched = schedule(names, Math.min(opp, names.length - 1 || 1), seed);
  const dir = mkdtempSync(path.join(tmpdir(), 'bal1v1-'));
  const sf = path.join(dir, 'sched.json'); writeFileSync(sf, JSON.stringify(sched));
  process.stdout.write(`${names.length} fighters, ${sched.length} matches, ${procs} processes, stocks ${args.stocks || 3} (tmp ${dir})\n`);
  const t0 = Date.now(), files = [];
  await Promise.all(Array.from({ length: procs }, (_, k) => new Promise((res) => {
    const rf = path.join(dir, `res-${k}.jsonl`); files.push(rf);
    const c = spawn(process.execPath, [SELF, '--child', String(k), '--of', String(procs), '--sched', sf, '--res', rf, '--stocks', args.stocks || '3', '--frames', args.frames || '9000'], { stdio: ['ignore', 'pipe', 'inherit'] });
    c.stdout.on('data', (d) => { const s = String(d).trim(); if (s && /: (100|200|300|400|500|600|700|800|900|1000)\b/.test(s)) process.stdout.write(s + `  (${Math.round((Date.now() - t0) / 1000)} s)\n`); });
    c.on('exit', res);
  })));
  const results = files.filter(existsSync).flatMap((f) => readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)));
  const rep = report(results, names);
  rep.wallSeconds = Math.round((Date.now() - t0) / 1000); rep.args = { opp, procs, seed, stocks: +(args.stocks || 3) };
  writeFileSync(args.out || 'scripts/balance-1v1.json', JSON.stringify(rep, null, 1));
  process.stdout.write(`done: ${rep.matches} matches in ${rep.wallSeconds} s, ${rep.errors} errors; sd ${rep.spread.sd} vs null ${rep.spread.nullSd}\n`);
  process.stdout.write(`STRONG: ${rep.strong.join(', ') || '-'}\nWEAK: ${rep.weak.join(', ') || '-'}\n`);
}
main().catch((e) => { console.error(e); process.exit(1); });
