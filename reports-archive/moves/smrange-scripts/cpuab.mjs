// RANGE PASS copy: base (HEAD before this branch's edits, base.html) against the new build, same seeds; lineups of grown fighters.
// (was: The CPU's up smash fix, before against after): 4 seeds x 2 builds = 8 CPU-vs-CPU matches (4-fighter free-for-all, 3 stocks, level 2, 5400 frames at most).
// "before" is the same file without the CPU fix (mid.html: the moves are the same in both builds). Counts per fighter: up / down / neutral smash presses, up smashes
// that landed, stocks lost; and errors. Run from the worktree root: node cpuab.mjs out.json
import fs from 'node:fs';
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/smrange/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/smrange/scripts/helpers/match-setup.js';
let LATE = 0; process.on('uncaughtException', () => { LATE++; });
const MID = fs.readFileSync('C:/Users/carad/AppData/Local/Temp/claude/f6b4fec287bd4976/82251bbe-13a2-473f-9c20-558b0b86c2bf/scratchpad/smrange/base.html', 'utf8');
const LINEUPS = [['Golf Ball','Bomby','Coiny','Tennis Ball','Puffball','Dora'], ['Bubble','Match','Pin','Barf Bag','Tree','Nickel'], ['Teardrop','Pen','Ice Cube','Ruby','Taco','Bell'], ['Gaty','Donut','Lollipop','Woody','Gelatin','Firey']];
const MAXF = 5400, STOCKS = 3, res = [];
for (let m = 0; m < 4; m++) for (const ver of ['before', 'after']) {
  const errs = [];
  const { window: w } = loadMonolith((0x9000 + m * 7919) >>> 0, ver === 'before' ? () => MID : undefined);
  w.addEventListener('error', e => errs.push(String(e.message).slice(0, 100)));
  let k = 0, out = null;
  try {
    w.eval(SETUP_SRC);
    w.eval(`window.__setupCustomMatch(${JSON.stringify(LINEUPS[m])}, ${STOCKS}, 2, 0); window.__u = {}; window.__hit = {}; window.__hitD = {};`);
    while (w.eval('running') && k < MAXF) {
      w.eval(`step(); for (const f of fighters){ if(f.dead) continue; const U = f._used || {}; const o = window.__u[f.name] || (window.__u[f.name] = { usmash:0, dsmash:0, nsmash:0, smash:0 });
        o.usmash = Math.max(o.usmash, U.usmash || 0); o.dsmash = Math.max(o.dsmash, U.dsmash || 0); o.nsmash = Math.max(o.nsmash, U.nsmash || 0); o.smash = Math.max(o.smash, U.smash || 0);
        if(f._mv && f._mv.key === 'usmash' && f._mv.landed){ const h = window.__hit[f.name] || (window.__hit[f.name] = new Set()); h.add(U.usmash || 0); } if(f._mv && f._mv.key === 'dsmash' && f._mv.landed){ const h = window.__hitD[f.name] || (window.__hitD[f.name] = new Set()); h.add(U.dsmash || 0); } }`);
      k++;
    }
    out = JSON.parse(w.eval(`JSON.stringify(fighters.map(f => ({ n:f.name, lost:${STOCKS} - Math.max(0, f.stocks), bad:!isFinite(f.x) || !isFinite(f.y), u:window.__u[f.name] || {}, hitU:(window.__hit[f.name] ? window.__hit[f.name].size : 0), hitD:(window.__hitD[f.name] ? window.__hitD[f.name].size : 0) })))`));
  } catch (e) { errs.push('THROW ' + String(e.message).slice(0, 160)); }
  res.push({ m, ver, frames: k, errs, out });
  const lost = out ? out.reduce((a, f) => a + f.lost, 0) : 0;
  console.log('seed', m, ver.padEnd(6), 'frames', k, 'errors', errs.length ? errs.slice(0, 3) : 0, '| stocks lost', lost, '=', (lost / (k / 3600)).toFixed(2), 'a minute |',
    out ? out.map(f => f.n + ' up ' + (f.u.usmash || 0) + ' (hit ' + f.hitU + ') down ' + (f.u.dsmash || 0) + ' (hit ' + f.hitD + ') neutral ' + ((f.u.nsmash || 0) + (f.u.smash || 0)) + ' lost ' + f.lost + (f.bad ? ' BADPOS' : '')).join(' | ') : '');
  fs.writeFileSync(process.argv[2], JSON.stringify(res));
  try { w.close(); } catch {}
}
for (const ver of ['before', 'after']) { const R = res.filter(r => r.ver === ver && r.out); let up = 0, hit = 0, dn = 0, dh = 0, ne = 0, lost = 0, fr = 0, er = 0;
  for (const r of R) { fr += r.frames; er += r.errs.length; for (const f of r.out) { up += f.u.usmash || 0; hit += f.hitU; dn += f.u.dsmash || 0; dh += f.hitD; ne += (f.u.nsmash || 0) + (f.u.smash || 0); lost += f.lost; } }
  console.log(ver.padEnd(6), 'TOTAL: up smash', up, '(landed ' + hit + ') | down smash', dn, '(landed ' + dh + ')', '| neutral smash', ne, '| stocks lost', lost, 'in', fr, 'frames =', (lost / (fr / 3600)).toFixed(2), 'a minute | errors', er); }
console.log('late exceptions', LATE);
