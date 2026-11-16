// Matches 7 and 8 of the 8 allowed: two 6-fighter CPU free-for-alls that cover the twelve, with ONE change to the page in memory (never on disk): the two dice in
// brainSmDir are removed, so whenever a CPU decides to smash and the foe is where an up smash (well above, close) or a down smash (close, level) is the right call,
// it asks for it every time instead of 70% / 18% of the time. The conditions themselves are untouched. This counts presses through the CPU's own smash path.
// Run from the worktree root: node cpu2.mjs out.json
import fs from 'node:fs';
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/updsm2/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/updsm2/scripts/helpers/match-setup.js';
let LATE = 0; process.on('uncaughtException', () => { LATE++; });
const LINEUPS = [['Pen', 'Pencil', 'Match', 'Ice Cube', 'Golf Ball', 'Rocky'], ['Woody', 'Book', 'Ruby', 'Puffball', 'Gelatin', 'Fries']];
const A = 'if(dy < -60 && dx < 90 && Math.random() < 0.7) d = 1;', B = 'else if(dx < f.r + (t.r || 24) + 40 && Math.abs(dy) < 40 && Math.random() < 0.18) d = -1;';
const MAXF = 5400, res = [];
for (let m = 0; m < 2; m++) {
  const errs = []; let patched = 0;
  const { window: w } = loadMonolith((0x7000 + m * 7919) >>> 0, (raw) => { if (raw.split(A).length !== 2 || raw.split(B).length !== 2) return raw; patched = 1; return raw.replace(A, A.replace(' && Math.random() < 0.7', '')).replace(B, B.replace(' && Math.random() < 0.18', '')); });
  if (!patched) { console.log('brainSmDir lines not found'); process.exit(1); }
  w.addEventListener('error', e => errs.push(String(e.message).slice(0, 100)));
  let k = 0, out = null;
  try {
    w.eval(SETUP_SRC);
    w.eval(`window.__setupCustomMatch(${JSON.stringify(LINEUPS[m])}, 3, 2, 0); window.__u = {}; window.__hit = {};`);
    while (w.eval('running') && k < MAXF) {
      w.eval(`step(); for (const f of fighters){ if(f.dead) continue; const U = f._used || {}; const o = window.__u[f.name] || (window.__u[f.name] = { usmash:0, dsmash:0, nsmash:0, smash:0 });
        o.usmash = Math.max(o.usmash, U.usmash || 0); o.dsmash = Math.max(o.dsmash, U.dsmash || 0); o.nsmash = Math.max(o.nsmash, U.nsmash || 0); o.smash = Math.max(o.smash, U.smash || 0);
        if(f._mv && (f._mv.key === 'usmash' || f._mv.key === 'dsmash') && f._mv.landed){ const h = window.__hit[f.name] || (window.__hit[f.name] = { usmash:new Set(), dsmash:new Set() }); h[f._mv.key].add(U[f._mv.key] || 0); } }`);
      k++;
    }
    out = JSON.parse(w.eval(`JSON.stringify(fighters.map(f => ({ n:f.name, stocks:f.stocks, bad:!isFinite(f.x) || !isFinite(f.y), u:window.__u[f.name] || {}, hitU:(window.__hit[f.name] ? window.__hit[f.name].usmash.size : 0), hitD:(window.__hit[f.name] ? window.__hit[f.name].dsmash.size : 0) })))`));
  } catch (e) { errs.push('THROW ' + String(e.message).slice(0, 160)); }
  res.push({ m, frames: k, errs, out });
  console.log('forced match', m, 'frames', k, 'errors', errs.length ? errs.slice(0, 3) : 0,
    out ? out.map(f => f.n + ' st' + f.stocks + ' up ' + (f.u.usmash || 0) + ' (hit ' + f.hitU + ') down ' + (f.u.dsmash || 0) + ' (hit ' + f.hitD + ') neutral ' + ((f.u.nsmash || 0) + (f.u.smash || 0)) + (f.bad ? ' BADPOS' : '')).join(' | ') : '');
  fs.writeFileSync(process.argv[2], JSON.stringify(res));
  try { w.close(); } catch {}
}
console.log('late exceptions', LATE);
