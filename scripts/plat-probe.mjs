// ============================================================================
//  plat-probe.mjs -- how well do the match CPUs move around a stage?
// ============================================================================
// The owner, 2026-10-13: "the bots are DUMB at platforming." This plays CPU-only matches (the untouched game in jsdom, the real loop) on
// chosen stages and counts, per fighter and per match:
//   selfDestruct   a stock lost with no hit taken in the 2 s before (walked or jumped off, missed the ledge, wrong-way up-special)
//   recEpisodes    times a fighter was in the recovery zone (x<50, x>WW-50, or low) / recFailed  -- it died before getting back
//   recWasted      of those deaths, ones where the fighter still held a jump or a ready special at the end
//   stuckFrames    frames inside a run of 45+ pressing left/right on the ground with no progress, a foe 90+ px away
//   idleFarFrames  frames inside a run of 120+ standing still, a foe 200+ px away, free to move
//   chaseEpisodes  a foe on another level (|dy|>110) for 8 s straight, neither of us hit; chaseFrames = total frames in them
//   dropPit        a drop through a platform with nothing under the fighter to land on (teams arena only: the rest has a floor)
//   drops          drops through platforms in all
//
//   node scripts/plat-probe.mjs --stages goiky,yoyle --pairs 6 --seeds 2 --procs 3 --out probe.json
//   node scripts/plat-probe.mjs --mode teams --stages teams --pairs 4 --stocks 2
// Progress goes to stdout; the report goes to --out and a summary to stdout.
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => { if (x.startsWith('--')) a.push([x.slice(2), (arr[i + 1] && !arr[i + 1].startsWith('--')) ? arr[i + 1] : '1']); return a; }, []));
const SELF = fileURLToPath(import.meta.url);

function mulberry32(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// The panel: one or two of every CPU class, so a class that plays a stage badly shows. Names that are not in ROSTER are skipped.
const PANEL = ['Firey','Ice Cube','Pin','Needle','Coiny','Snowball','Bubble','Golf Ball','Tennis Ball','Pen','Spongy','Teardrop','Leafy','Flower','Match','Rocky','Blocky','Eraser','Four','Woody'];

const SETUP = `
window.__platSetup = function(names, stocks, stageId, mode, teamKey, teamOf){
  if(typeof BOT_ADAPT!=='undefined') BOT_ADAPT.lock();
  TESTMODE.active=false; TOURNEY.active=false; TOURNEY_WATCHING=null;
  if(typeof BOSSRUSH!=='undefined') BOSSRUSH.active=false;
  CUSTOM_LEVEL=null; TOURNEY_MATCH_ACTIVE=false; PENDING_TOURNEY=null; window.__netRoster=null;
  SETTINGS.mode=mode; SETTINGS.count=names.length; SETTINGS.stocks=stocks; SETTINGS.itemRate=0; SETTINGS.teamKey=teamKey||'';
  AI_LEVEL=2; LOCAL_PLAYERS=1;
  if(stageId!=='teams') stage = STAGES.find(s=>s.id===stageId);
  if(!stage) throw new Error('unknown stage '+stageId);
  resize(); setupWorld();
  const N=names.length;
  if(mode==='teams'){
    chosen = ROSTER.find(r=>r.name===names[0]);
    LINEUP_MEMO = { key: lineupKey(N), names: names.slice(1), teamOf: teamOf.slice() };
    buildFighters();
    LINEUP_MEMO = null;
    fighters.forEach(function(f){ f.stocks=stocks; f.controller='ai'; f.you=false; f.you2=false; });
  } else {
    fighters=[];
    const big = isBigFFA();
    names.forEach(function(nm,i){
      const r = ROSTER.find(x=>x.name===nm);
      if(!r) throw new Error('unknown fighter: '+nm);
      const sx = big ? WW*(0.12+0.76*i/Math.max(1,N-1)) : WW*(0.08+0.84*i/Math.max(1,N-1));
      const f = makeFighter(Object.assign({}, r, {you:false}), sx, groundY()-60, i);
      f.stocks=stocks; f.team=i; f.homeBase=null; f.controller='ai'; f.you=false; f.you2=false;
      fighters.push(f);
    });
  }
  running=true; paused=false; hazardT=0;
  window.__elimSeq=0; lastKoFrame=0;
  try{ teamAiResetMatch(); }catch(e){}
  fighters.forEach(function(f){ f.placement=null; f._downOrder=0; f._kos=0; f._falls=0; f._dmgDealt=0; f._dmgTaken=0; });
  particles=[]; projectiles=[]; beams=[]; evil=null; items=[]; summons=[]; itemTimer=0; tendrils=[]; BOSS_ARENA=null;
  if(stage.hazard==='evilleafy'){ evil={x:WW*0.9,y:groundY()-40}; }
  // keep each frame's pressed keys, to read them from outside
  if(!window.__platWrapped){ window.__platWrapped = true; const o = aiThink; aiThink = function(f){ const i = o(f); f._pi = i; return i; }; }
  return fighters.length;
};
window.__platInfo = function(){ return { WW:WW, WH:WH, big:isBig(), bigFFA:isBigFFA(), gy:groundY(), plats:platRects().map(function(p){ return {x:p.x,y:p.y,w:p.w,h:p.h||16,solid:!!p.solid,rot:!!p.rot}; }) }; };
window.__platFrame = function(){
  return fighters.map(function(f){ const t=f.aiTarget; return { i:f.idx, n:f.name, tm:f.team, dead:!!f.dead, x:f.x, y:f.y, r:f.r, vx:f.vx, vy:f.vy, og:!!f.onground, hs:f.hitstun|0, pct:f.pct, fl:f._falls|0,
    j:f.jumps|0, sp:f.spCd|0, dr:f.dropping|0, st:f.stocks, atk:f.atkCd|0, cls:aiClass(f),
    L:!!(f._pi&&f._pi.left), R:!!(f._pi&&f._pi.right), tx:t?t.x:null, ty:t?t.y:null, td:t?!!t.dead:true, ths:t?(t.hitstun|0):0 }; });
};
`;

async function runOne(job){
  const { loadMonolith } = await import('../test/helpers/load-monolith.js');
  const { window: w } = loadMonolith(job.seed >>> 0);
  const names = job.names, stocks = job.stocks, maxFrames = job.frames;
  const out = { stage: job.stage, mode: job.mode, names, seed: job.seed, frames: 0, contact: null, fighters: {} };
  try {
    w.eval(SETUP);
    w.eval(`__platSetup(${JSON.stringify(names)}, ${stocks}, ${JSON.stringify(job.stage)}, ${JSON.stringify(job.mode)}, ${JSON.stringify(job.teamKey || '')}, ${JSON.stringify(job.teamOf || [])})`);
    const info = w.eval('__platInfo()');
    const WW = info.WW, WH = info.WH;
    const S = {};   // per fighter tracker
    const nf = names.length;
    for (let i = 0; i < nf; i++) S[i] = { lastHit: -9999, ctrl: 0, inZone: false, zoneFail: false, prev: null, stuckRun: 0, idleRun: 0, chaseRun: 0, chaseCounted: false, lastGround: -9999, lastX: null,
      rec: { selfDestruct: 0, recEpisodes: 0, recFailed: 0, recWasted: 0, stuckFrames: 0, idleFarFrames: 0, chaseEpisodes: 0, chaseFrames: 0, dropPit: 0, drops: 0, falls: 0, walkOff: 0, frames: 0, hitLoss: 0, ctrlDeaths: 0 } };
    let frames = 0;
    while (w.eval('running') && frames < maxFrames) {
      w.eval('step()');
      frames++;
      const fr = w.eval('__platFrame()');
      for (const f of fr) {
        const s = S[f.i]; if (!s) continue;
        const R = s.rec, p = s.prev;
        R.frames++;
        // a stock lost this frame?
        if (p && f.fl > p.fl) {
          R.falls++;
          const sinceHit = frames - s.lastHit;
          if (sinceHit > 120) { R.selfDestruct++; if (frames - s.lastGround < 90 && p.og !== undefined) R.walkOff++; }
          else R.hitLoss++;
          if (s.inZone) { R.recFailed++; s.inZone = false; if (p.j > 0 || p.sp <= 0) R.recWasted++; if (s.ctrl >= 20) R.ctrlDeaths++; }
          s.stuckRun = 0; s.idleRun = 0; s.chaseRun = 0; s.chaseCounted = false; s.lastX = null; s.prev = f; s.ctrl = 0;
          continue;
        }
        if (f.dead) { s.prev = f; continue; }
        // damage taken (a hit): hitstun or a jump in percent
        if (f.hs > 0 || (p && f.pct - p.pct >= 2)) s.lastHit = frames;
        if (out.contact == null && f.pct > 0) out.contact = frames;
        if (f.og) s.lastGround = frames;
        // recovery zone
        const inZone = f.x < 50 || f.x > WW - 50 || (f.y > WH - 90 && f.vy > 0);
        if (inZone && !s.inZone) { R.recEpisodes++; s.inZone = true; s.ctrl = 0; }
        else if (s.inZone && !inZone) { s.zoneBack = (s.zoneBack || 0) + 1; if (s.zoneBack > 30) { s.inZone = false; s.zoneBack = 0; } }
        else if (inZone) s.zoneBack = 0;
        if (s.inZone) { if (f.hs === 0) s.ctrl++; else s.ctrl = 0; }
        // stuck: pressing sideways on the ground, going nowhere, a foe 90+ px off
        const tdist = f.tx == null ? 0 : Math.hypot(f.tx - f.x, f.ty - f.y);
        const moved = s.lastX == null ? 99 : Math.abs(f.x - s.lastX);
        s.lastX = f.x;
        if ((f.L || f.R) && f.og && moved < 0.5 && tdist > 90 && f.hs === 0 && !f.td) { s.stuckRun++; if (s.stuckRun === 45) R.stuckFrames += 45; else if (s.stuckRun > 45) R.stuckFrames++; } else s.stuckRun = 0;
        if (moved < 0.3 && tdist > 200 && f.hs === 0 && !f.td) { s.idleRun++; if (s.idleRun === 120) R.idleFarFrames += 120; else if (s.idleRun > 120) R.idleFarFrames++; } else s.idleRun = 0;
        // chase: a foe on another level for 8 s
        if (f.tx != null && !f.td && Math.abs(f.ty - f.y) > 110 && f.hs === 0 && f.ths === 0) {
          s.chaseRun++;
          if (s.chaseRun === 480) { R.chaseEpisodes++; R.chaseFrames += 480; (out.chaseLog = out.chaseLog || []).push([frames, f.n, Math.round(f.x), Math.round(f.y), f.og ? 'G' : 'a', Math.round(f.tx), Math.round(f.ty)]); } else if (s.chaseRun > 480) R.chaseFrames++;
        } else s.chaseRun = 0;
        // drop through: dropping just started
        if (f.dr >= 8 && (!p || p.dr < 8)) {
          R.drops++;
          const feet = f.y + f.r;
          const under = info.plats.some(q => !q.rot && q.y > feet + 8 && f.x > q.x - 10 && f.x < q.x + q.w + 10) || !info.big;
          if (!under) R.dropPit++;
        }
        s.prev = f;
      }
    }
    out.frames = frames;
    out.timedOut = !!w.eval('running');
    for (let i = 0; i < nf; i++) out.fighters[names[i] + '#' + i] = Object.assign({ cls: S[i].prev ? S[i].prev.cls : null }, S[i].rec);
  } finally { try { w.close && w.close(); } catch {} }
  return out;
}

// RECOVERY TEST: one fighter is flung toward a side of the stage (a fixed launch, hitstun over 18 frames) while a still dummy stands in the middle.
// "survived" = alive and back on a surface well inside the stage 360 frames later. The launch is the same for every fighter, so a fighter or a
// class that fails it fails on what it does with its jumps and its up-special, not on its weight.
async function runRecovery(job){
  const { loadMonolith } = await import('../test/helpers/load-monolith.js');
  const { window: w } = loadMonolith(job.seed >>> 0);
  const out = { name: job.name, stage: job.stage, launches: [] };
  try {
    w.eval(SETUP);
    for (const L of job.launches) {
      const dummy = job.name === 'Pen' ? 'Firey' : 'Pen';
      w.eval(`__platSetup(${JSON.stringify([job.name, dummy])}, 3, ${JSON.stringify(job.stage)}, 'ffa', '', [])`);
      w.eval(`(function(){ var d=fighters[1]; d.controller='still'; var f=fighters[0]; var side=${L.side}; f.x = side<0 ? 130 : WW-130; f.y = ${L.y === 'floor' ? 'groundY()-f.r' : 'groundY()-f.r-' + L.y}; f.vx=side*${L.vx}; f.vy=${L.vy}; f.hitstun=18; f.onground=false; f.pct=60; d.x=WW/2; fighters[0].aiTarget=d; })()`);
      let frames = 0, back = null;
      const st0 = w.eval('fighters[0].stocks');
      while (frames < 360) {
        w.eval('step()'); frames++;
        const r = w.eval('(function(){var f=fighters[0];return {st:f.stocks,og:!!f.onground,x:f.x,y:f.y,WW:WW}})()');
        if (r.st < st0) break;
        if (r.og && r.x > 200 && r.x < r.WW - 200 && back == null) back = frames;
      }
      const end = w.eval('(function(){var f=fighters[0];return {st:f.stocks,x:f.x,y:f.y}})()');
      out.launches.push({ side: L.side, vx: L.vx, vy: L.vy, survived: end.st >= st0, back });
    }
  } finally { try { w.close && w.close(); } catch {} }
  return out;
}

async function child(){
  await import('./balance-tournament.mjs');   // jsdom teardown guard
  const jobs = JSON.parse(readFileSync(args.sched, 'utf8'));
  const k = +args.child, of = +args.of;
  const lines = [];
  for (let i = k; i < jobs.length; i += of) {
    try { lines.push(JSON.stringify(jobs[i].recovery ? await runRecovery(jobs[i]) : await runOne(jobs[i]))); }
    catch (e) { lines.push(JSON.stringify({ err: String(e && e.stack || e), job: jobs[i] })); }
    writeFileSync(args.res, lines.join('\n') + '\n');
    process.stdout.write(`chunk ${k}: ${lines.length}\n`);
  }
}

async function rosterOk(names){
  await import('./balance-tournament.mjs');
  const { loadMonolith } = await import('../test/helpers/load-monolith.js');
  const { window: w } = loadMonolith(1);
  try { const all = w.eval('ROSTER.filter(function(r){ return r.play && !r.prize; }).map(function(r){ return r.name; })'); return names.filter(n => all.includes(n)); }
  finally { try { w.close && w.close(); } catch {} }
}

function summarize(results){
  const keys = ['frames', 'falls', 'selfDestruct', 'walkOff', 'hitLoss', 'recEpisodes', 'recFailed', 'recWasted', 'ctrlDeaths', 'stuckFrames', 'idleFarFrames', 'chaseEpisodes', 'chaseFrames', 'drops', 'dropPit'];
  const zero = () => Object.fromEntries(keys.map(k => [k, 0]));
  const byStage = {}, byCls = {}, byFighter = {}, total = zero();
  let errs = 0, n = 0;
  for (const r of results) {
    if (r.err) { errs++; continue; }
    n++;
    for (const [id, v] of Object.entries(r.fighters)) {
      const name = id.replace(/#\d+$/, '');
      for (const [tgt, key] of [[byStage, r.stage], [byCls, v.cls], [byFighter, name], [{ all: total }, 'all']]) {
        const t = tgt[key] || (tgt[key] = zero());
        for (const k of keys) if (k !== 'frames') t[k] += v[k] || 0;
        t.frames += v.frames || 0;
      }
    }
  }
  const contacts = results.filter(r => !r.err).map(r => r.contact == null ? r.frames : r.contact); const meanContact = contacts.length ? Math.round(contacts.reduce((a, b) => a + b, 0) / contacts.length) : 0;
  const timeouts = results.filter(r => !r.err && r.timedOut).length;
  const per = (t) => { const mins = t.frames / 3600 || 1; const o = {}; for (const k of keys) if (k !== 'frames') o[k] = +(t[k] / mins).toFixed(2); o.mins = +mins.toFixed(1); return o; };
  return { matches: n, errs, meanContact, timeouts, total: per(total), byStage: Object.fromEntries(Object.entries(byStage).map(([k, v]) => [k, per(v)])), byCls: Object.fromEntries(Object.entries(byCls).map(([k, v]) => [k, per(v)])), byFighter: Object.fromEntries(Object.entries(byFighter).map(([k, v]) => [k, per(v)])), raw: { total, byStage, byCls } };
}

async function parent(){
  if (args.recovery) return recoveryParent();
  const stages = (args.stages || 'goiky').split(',');
  const mode = args.mode || 'ffa';
  const pairs = +(args.pairs || 6), seeds = +(args.seeds || 1), stocks = +(args.stocks || 3), frames = +(args.frames || 5400), procs = +(args.procs || 3), seed0 = +(args.seed || 11);
  const only = args.only ? args.only.split(',') : PANEL;
  const names = await rosterOk(only);
  const rnd = mulberry32(seed0), jobs = [];
  // the same pairings on every stage, so a stage is the only thing that differs
  const pick = [];
  for (let i = 0; i < pairs; i++) {
    const p = names.slice(); for (let j = p.length - 1; j > 0; j--) { const q = Math.floor(rnd() * (j + 1)); [p[j], p[q]] = [p[q], p[j]]; }
    pick.push(mode === 'teams' ? p.slice(0, 4) : p.slice(0, +(args.ffa || 2)));
  }
  for (const st of stages) for (let i = 0; i < pairs; i++) for (let s = 0; s < seeds; s++) {
    const job = { stage: st, mode, names: pick[i], seed: (seed0 * 1000 + i * 17 + s * 101 + 5) >>> 0, stocks, frames };
    if (mode === 'teams') { job.teamKey = '2v2'; job.teamOf = [0, 1, 0, 1]; }
    jobs.push(job);
  }
  const dir = mkdtempSync(path.join(tmpdir(), 'plat-'));
  const sched = path.join(dir, 'sched.json'); writeFileSync(sched, JSON.stringify(jobs));
  const res = []; const kids = [];
  for (let k = 0; k < procs; k++) {
    const rf = path.join(dir, `res${k}.jsonl`); res.push(rf);
    kids.push(new Promise((ok) => { const c = spawn(process.execPath, [SELF, '--child', String(k), '--of', String(procs), '--sched', sched, '--res', rf], { stdio: ['ignore', 'ignore', 'inherit'] }); c.on('exit', ok); }));
  }
  console.log(`${jobs.length} matches on ${procs} procs`);
  await Promise.all(kids);
  const results = [];
  for (const rf of res) { try { for (const l of readFileSync(rf, 'utf8').split('\n')) if (l.trim()) results.push(JSON.parse(l)); } catch {} }
  const rep = summarize(results);
  if (args.out) writeFileSync(args.out, JSON.stringify({ args, results, rep }, null, 1));
  const show = (o) => JSON.stringify(o);
  console.log('TOTAL (per fighter-minute)', show(rep.total), 'matches', rep.matches, 'errs', rep.errs, 'meanFirstContactFrame', rep.meanContact, 'timeouts', rep.timeouts);
  for (const [k, v] of Object.entries(rep.byStage)) console.log('stage', k.padEnd(11), show(v));
  for (const [k, v] of Object.entries(rep.byCls)) console.log('class', String(k).padEnd(7), show(v));
  const worst = Object.entries(rep.byFighter).map(([k, v]) => [k, v.selfDestruct + v.recFailed + v.stuckFrames / 60 + v.chaseFrames / 120]).sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log('worst fighters', show(worst));
  const bad = results.filter(r => r.err); for (const b of bad.slice(0, 2)) console.log('ERR', b.err.slice(0, 600));
}

async function recoveryParent(){
  const stages = (args.stages || 'goiky').split(','), procs = +(args.procs || 3);
  await import('./balance-tournament.mjs');
  const { loadMonolith } = await import('../test/helpers/load-monolith.js');
  const { window: w0 } = loadMonolith(1);
  const all = w0.eval('ROSTER.filter(function(r){ return r.play && !r.prize; }).map(function(r){ return r.name; })'); try { w0.close(); } catch {}
  const names = args.only ? args.only.split(',') : all;
  const launches = [];
  for (const side of [-1, 1]) for (const vx of [12, 16, 20]) launches.push({ side, vx, vy: -9, y: 'floor' });
  const jobs = [];
  for (const st of stages) for (const nm of names) jobs.push({ recovery: true, name: nm, stage: st, launches, seed: 77 });
  const dir = mkdtempSync(path.join(tmpdir(), 'platr-'));
  const sched = path.join(dir, 'sched.json'); writeFileSync(sched, JSON.stringify(jobs));
  const res = [], kids = [];
  for (let k = 0; k < procs; k++) {
    const rf = path.join(dir, `res${k}.jsonl`); res.push(rf);
    kids.push(new Promise((ok) => { const c = spawn(process.execPath, [SELF, '--child', String(k), '--of', String(procs), '--sched', sched, '--res', rf], { stdio: ['ignore', 'ignore', 'inherit'] }); c.on('exit', ok); }));
  }
  console.log(`${jobs.length} recovery jobs on ${procs} procs`);
  await Promise.all(kids);
  const results = [];
  for (const rf of res) { try { for (const l of readFileSync(rf, 'utf8').split(String.fromCharCode(10))) if (l.trim()) results.push(JSON.parse(l)); } catch {} }
  const byFighter = {}; let tot = 0, ok = 0; const byV = {};
  for (const r of results) { if (r.err) continue; for (const L of r.launches) { tot++; if (L.survived) ok++; const b = byFighter[r.name] || (byFighter[r.name] = [0, 0]); b[1]++; if (L.survived) b[0]++; const v = byV[L.vx] || (byV[L.vx] = [0, 0]); v[1]++; if (L.survived) v[0]++; } }
  if (args.out) writeFileSync(args.out, JSON.stringify({ args, results }, null, 1));
  console.log('RECOVERY survived', ok, '/', tot, (100 * ok / tot).toFixed(1) + '%', 'by launch speed', JSON.stringify(Object.fromEntries(Object.entries(byV).map(([k, v]) => [k, +(100 * v[0] / v[1]).toFixed(0)]))));
  const worst = Object.entries(byFighter).map(([k, v]) => [k, v[0] + '/' + v[1]]).sort((a, b) => parseInt(a[1]) - parseInt(b[1])).slice(0, 14);
  console.log('worst', JSON.stringify(worst));
  console.log('worst fighters');
}

if (args.child !== undefined) await child(); else await parent();
