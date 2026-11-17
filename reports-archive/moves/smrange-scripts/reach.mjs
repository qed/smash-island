// REACH: for every fighter with an own up / down smash (DSM_OWN), where a still dummy (Coiny; Firey for Coiny) is hit, against the GENERATED move it replaced
// (dirSmashSpec with the row taken out of DSM_OWN for the moment, in memory only). The move is thrown for real (dirSmash, facing right, on the flat floor of
// Goiky) and every shape mvStrike tests is recorded on the frame it tests it (so travel, sweeps and t0/t1 are the engine's own); then the dummy is put at each
// cell of a grid (dx between centres -204..204, its FEET h px above the floor 0..264, 6 px steps) and the real shapeHits says whether any recorded shape touches it.
// Run from the worktree root: node reach.mjs out.json
import fs from 'node:fs';
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/smrange/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/smrange/scripts/helpers/match-setup.js';
let LATE = 0; process.on('uncaughtException', (e) => { LATE++; console.error('UNCAUGHT', String(e && e.stack || e).slice(0, 300)); });
const { window: w } = loadMonolith(0xBEEF);
const errs = []; w.addEventListener('error', e => errs.push(String(e.message).slice(0, 120)));
w.eval(SETUP_SRC);
w.eval(`
window.__REC = null;
{ const orig = mvStrike; mvStrike = function(f, mv, b, gi){ if(window.__REC && f === window.__REC.f) window.__REC.sh.push(swShapeAt(f, ocKitKey(f, mv.key), mv.key, mv.s, b, mv.t) || mvShape(f, b.s)); return orig(f, mv, b, gi); }; }
window.__reach = function(name, dir, gen){
  window.__setupCustomMatch([name, name === 'Coiny' ? 'Firey' : 'Coiny'], 99, 2, 0);
  const a = fighters[0], d = fighters[1]; for (const f of fighters) f.controller = 'still';
  for (let i = 0; i < 20; i++) step();
  const own = DSM_OWN[name]; if(gen) delete DSM_OWN[name]; DSM_CACHE.clear();
  let S;
  try {
    for (const f of fighters){ f.invuln = 0; f.vx = 0; f.vy = 0; f.onground = true; f.face = 1; f.smCd = 0; f.atkCd = 0; f.pct = 0; f._mv = null; f.y = groundY() - f.r; }
    a.x = WW*0.5; d.x = a.x + 900;
    const x0 = a.x, y0 = a.y;
    S = dirSmashSpec(a, dir);
    window.__REC = { f:a, sh:[] };
    dirSmash(a, dir);
    for (let t = 0; t < S.st + S.act + S.end + 2; t++) step();
    const shapes = window.__REC.sh; window.__REC = null;
    const cells = [];
    for (let h = 0; h <= 264; h += 6) for (let dx = -204; dx <= 204; dx += 6){
      d.x = x0 + dx; d.y = groundY() - d.r - h;
      let hit = false; for (const sh of shapes){ if(shapeHits(sh, d)){ hit = true; break; } }
      if(hit) cells.push([dx, h]);
    }
    return JSON.stringify({ n:S.n, cells, nShapes:shapes.length, ar:a.r, dr:d.r });
  } finally { if(gen) DSM_OWN[name] = own; DSM_CACHE.clear(); }
};
`);
const NAMES = JSON.parse(w.eval('JSON.stringify(Object.keys(DSM_OWN))'));
function summ(cells, dir) {
  const S = {};
  const has = (f) => cells.filter(f);
  const mx = (arr, k, sgn) => arr.length ? Math.max(...arr.map(c => sgn * c[k])) * sgn : null;
  if (dir > 0) {
    S.top = mx(has(c => Math.abs(c[0]) <= 24), 1, 1);           // highest the dummy's feet can be and be hit, right over the fighter
    S.topAny = mx(cells, 1, 1);
    const side = has(c => c[1] >= 48);                          // above the fighter's head height
    S.fwd = mx(side, 0, 1); S.back = mx(side, 0, -1);
    S.air = side.length;
  } else {
    const fl = has(c => c[1] === 0);
    S.fwd = mx(fl.filter(c => c[0] > 0), 0, 1); S.back = mx(fl.filter(c => c[0] < 0), 0, -1);
    S.nearF = mx(fl.filter(c => c[0] > 0), 0, -1); S.nearB = mx(fl.filter(c => c[0] < 0), 0, 1);
    S.high = mx(has(c => Math.abs(c[0]) >= 36), 1, 1);
    S.floor = fl.length;
  }
  S.area = cells.length;
  return S;
}
const out = [];
for (const n of NAMES) for (const dir of [1, -1]) {
  const g = JSON.parse(w.eval(`__reach(${JSON.stringify(n)}, ${dir}, true)`));
  const o = JSON.parse(w.eval(`__reach(${JSON.stringify(n)}, ${dir}, false)`));
  const G = summ(g.cells, dir), O = summ(o.cells, dir);
  out.push({ n, dir, gen: { name: g.n, ...G }, own: { name: o.n, ...O }, ownCells: o.cells, genCells: g.cells, ar: o.ar });
  const f = (S) => dir > 0 ? `top ${S.top} any ${S.topAny} fwd ${S.fwd} back ${S.back} air ${S.air} area ${S.area}` : `fwd ${S.fwd} back ${S.back} near ${S.nearF}/${S.nearB} high ${S.high} floor ${S.floor} area ${S.area}`;
  console.log(n.padEnd(12), dir > 0 ? 'UP  ' : 'DOWN', ('"' + o.n + '"').padEnd(28), 'OWN', f(O).padEnd(52), '| GEN', f(G));
}
console.log('page errors', errs.length ? errs.slice(0, 5) : 0, 'late', LATE);
fs.writeFileSync(process.argv[2], JSON.stringify(out));
try { w.close(); } catch {}
