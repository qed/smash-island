// FAIRNESS: base build (base.html = HEAD before this branch's edits) against the new one. For every DSM_OWN row: every field except box shapes (s) must be
// identical (damage, launch, rad, stun, groups, t0/t1, st/act/end/land, mv, fx and dmgFn source, tot, names, words); and every other move table must be unchanged:
// all MOVESETS rows, NSM_MV, NSM_FIN, and the generated up/down smash of every fighter without an own row. Run from the worktree root: node fair.mjs
import fs from 'node:fs';
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/smrange/scripts/helpers/load-monolith.js';
let LATE = 0; process.on('uncaughtException', (e) => { LATE++; });
const BASE = fs.readFileSync('C:/Users/carad/AppData/Local/Temp/claude/f6b4fec287bd4976/82251bbe-13a2-473f-9c20-558b0b86c2bf/scratchpad/smrange/base.html', 'utf8');
const SRC = `(function(){
  const rep = (k, v) => typeof v === 'function' ? 'FN:' + String(v) : v;
  const own = {}, ownShapes = {};
  for (const n in DSM_OWN) for (const d of ['up', 'down']) { const S = DSM_OWN[n][d];
    own[n + '.' + d] = JSON.stringify(Object.assign({}, S, { boxes: S.boxes.map(b => { const o = Object.assign({}, b); delete o.s; delete o._swc; return o; }) }), rep);
    ownShapes[n + '.' + d] = JSON.stringify(S.boxes.map(b => b.s)); }
  const ms = {}; for (const k in MOVESETS) ms[k] = JSON.stringify(MOVESETS[k], (k2, v) => k2 === '_swc' ? undefined : rep(k2, v));
  const gen = {}; for (const c of ROSTER) { if(!c || !c.kit || DSM_OWN[c.name]) continue; const f = { name:c.name, kit:c.kit, r:c.r || 24 };
    try { gen[c.name] = JSON.stringify([dirSmashSpec(f, 1), dirSmashSpec(f, -1)], rep); } catch(e){ gen[c.name] = 'ERR ' + e.message; } }
  return JSON.stringify({ own, ownShapes, ms, nsm: JSON.stringify(NSM_MV, rep), fin: JSON.stringify(NSM_FIN, rep), gen });
})()`;
function grab(transform) { const { window: w } = loadMonolith(0xC0FFEE, transform); const o = JSON.parse(w.eval(SRC)); try { w.close(); } catch {} return o; }
const A = grab(() => BASE), B = grab();
let bad = 0, shapesChanged = 0;
for (const k in A.own) { if (A.own[k] !== B.own[k]) { bad++; console.log('ROW NUMBERS DIFFER', k); } if (A.ownShapes[k] !== B.ownShapes[k]) shapesChanged++; }
for (const k in B.own) if (!(k in A.own)) { bad++; console.log('NEW ROW', k); }
let msBad = 0; for (const k in A.ms) if (A.ms[k] !== B.ms[k]) { msBad++; console.log('MOVESET DIFFERS', k); }
const nsmBad = A.nsm !== B.nsm, finBad = A.fin !== B.fin;
let genBad = 0; for (const k in A.gen) if (A.gen[k] !== B.gen[k]) { genBad++; console.log('GENERATED DIFFERS', k); }
console.log('own rows', Object.keys(A.own).length, '| rows whose non-shape fields differ', bad, '| rows whose shapes changed', shapesChanged,
  '| MOVESETS kits differing', msBad, 'of', Object.keys(A.ms).length, '| NSM_MV differs', nsmBad, '| NSM_FIN differs', finBad, '| generated pairs differing', genBad, 'of', Object.keys(A.gen).length, '| late', LATE);
