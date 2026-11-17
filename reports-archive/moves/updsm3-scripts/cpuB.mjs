// 6 CPU-vs-CPU matches (4-fighter free-for-all, 3 stocks, level 2): three lineups that cover the twelve, two seeds each. Counts errors, bad positions,
// the longest stand-still, and how many times each CPU pressed its up / down / neutral smash (f._used). Run from the worktree root: node cpu.mjs out.json
import fs from 'node:fs';
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/updsm3/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/updsm3/scripts/helpers/match-setup.js';
let LATE = 0; process.on('uncaughtException', () => { LATE++; });
const LINEUPS = [['Nickel', 'Donut', 'David', 'Lollipop'], ['Barf Bag', 'Lollipop', 'David', 'Donut']];
const MAXF = 5400, res = [];
for (let m = 0; m < 2; m++) {
  const errs = [], names = LINEUPS[m], seed = (0x5000 + m * 7919) >>> 0;
  const { window: w } = loadMonolith(seed);
  w.addEventListener('error', e => errs.push(String(e.message).slice(0, 100)));
  let k = 0, out = null;
  try {
    w.eval(SETUP_SRC);
    const order = names;
    w.eval(`window.__setupCustomMatch(${JSON.stringify(order)}, 3, 2, 0); window.__u = {}; window.__hit = {}; window.__still = {}; window.__stillMax = 0;`);
    while (w.eval('running') && k < MAXF) {
      w.eval(`step(); for (const f of fighters){ if(f.dead) continue; const U = f._used || {}; const o = window.__u[f.name] || (window.__u[f.name] = { usmash:0, dsmash:0, nsmash:0, smash:0 });
        o.usmash = Math.max(o.usmash, U.usmash || 0); o.dsmash = Math.max(o.dsmash, U.dsmash || 0); o.nsmash = Math.max(o.nsmash, U.nsmash || 0); o.smash = Math.max(o.smash, U.smash || 0);
        if(f._mv && (f._mv.key === 'usmash' || f._mv.key === 'dsmash') && f._mv.landed){ const h = window.__hit[f.name] || (window.__hit[f.name] = { usmash:new Set(), dsmash:new Set() }); h[f._mv.key].add(U[f._mv.key] || 0); }
        const s = window.__still[f.idx] || (window.__still[f.idx] = { x:f.x, y:f.y, n:0 }); if(Math.abs(f.x - s.x) < 0.01 && Math.abs(f.y - s.y) < 0.01) s.n++; else { s.x = f.x; s.y = f.y; s.n = 0; } if(s.n > window.__stillMax) window.__stillMax = s.n; }`);
      k++;
    }
    out = JSON.parse(w.eval(`JSON.stringify({ still: window.__stillMax, f: fighters.map(f => ({ n:f.name, stocks:f.stocks, pct:Math.round(f.pct), bad:!isFinite(f.x) || !isFinite(f.y), u:window.__u[f.name] || {}, hitU:(window.__hit[f.name] ? window.__hit[f.name].usmash.size : 0), hitD:(window.__hit[f.name] ? window.__hit[f.name].dsmash.size : 0) })) })`));
  } catch (e) { errs.push('THROW ' + String(e.message).slice(0, 160)); }
  res.push({ m, seed, frames: k, errs, out });
  console.log('match', m, 'frames', k, 'errors', errs.length ? errs.slice(0, 3) : 0, 'longest still', out && out.still,
    out ? out.f.map(f => f.n + ' st' + f.stocks + ' up ' + (f.u.usmash || 0) + ' (hit ' + f.hitU + ') down ' + (f.u.dsmash || 0) + ' (hit ' + f.hitD + ') neutral ' + ((f.u.nsmash || 0) + (f.u.smash || 0)) + (f.bad ? ' BADPOS' : '')).join(' | ') : '');
  fs.writeFileSync(process.argv[2], JSON.stringify(res));
  try { w.close(); } catch {}
}
console.log('late exceptions', LATE);
