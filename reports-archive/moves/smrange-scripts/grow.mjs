// GROW: finds, per own up / down smash, the smallest stretch of its hit area that reaches the generated move's coverage on the sides its idea covers.
// The stretch (the same one the props get): x' = x for |x| <= 12, else sign(x)*(12 + (|x| - 12)*kx); y' = y for y >= -24, else -24 + (y + 24)*ky;
// every radius * kr; a fan's outer radius r1' = r0 + (r1 - r0)*kr (angles kept). The fighter's own travel is recorded once from the real move and the
// stretched shapes are tested at those positions with the engine's swShapeAt / shapeHits on a still dummy grid (as reach.mjs).
// Run from the worktree root: node grow.mjs policy.json out.json
import fs from 'node:fs';
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/smrange/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/smrange/scripts/helpers/match-setup.js';
let LATE = 0; process.on('uncaughtException', (e) => { LATE++; console.error('UNCAUGHT', String(e && e.stack || e).slice(0, 300)); });
const POL = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const { window: w } = loadMonolith(0xBEEF);
w.eval(SETUP_SRC);
w.eval(`
window.__TR = null;
{ const orig = mvStrike; mvStrike = function(f, mv, b, gi){ if(window.__TR && f === window.__TR.f && !window.__TR.seen[mv.t]){ window.__TR.seen[mv.t] = 1; window.__TR.p.push([mv.t, f.x, f.y, f.face]); } return orig(f, mv, b, gi); }; }
window.__G = {};
window.__prep = function(name, dir){
  window.__setupCustomMatch([name, name === 'Coiny' ? 'Firey' : 'Coiny'], 99, 2, 0);
  const a = fighters[0], d = fighters[1]; for (const f of fighters) f.controller = 'still';
  for (let i = 0; i < 20; i++) step();
  for (const f of fighters){ f.invuln = 0; f.vx = 0; f.vy = 0; f.onground = true; f.face = 1; f.smCd = 0; f.atkCd = 0; f.pct = 0; f._mv = null; f.y = groundY() - f.r; }
  a.x = WW*0.5; d.x = a.x + 900;
  const x0 = a.x, S = DSM_OWN[name][dir > 0 ? 'up' : 'down'];
  window.__TR = { f:a, p:[], seen:{} }; dirSmash(a, dir);
  for (let t = 0; t < S.st + S.act + S.end + 2; t++) step();
  const p = window.__TR.p; window.__TR = null;
  window.__G = { a, d, x0, S, p, key: dir > 0 ? 'usmash' : 'dsmash' };
  return p.length;
};
function gsx(x, k){ const B = 12, s = x < 0 ? -1 : 1, m = Math.abs(x); return m <= B ? x : s*(B + (m - B)*k); }
function gsy(y, k){ const A = -24; return y >= A ? y : A + (y - A)*k; }
window.__xf = function(sh, P){
  if(sh.k === 'o') return MvO(gsx(sh.x, P.kx), gsy(sh.y, P.ky), sh.r*P.kr);
  if(sh.k === 'c') return MvC(gsx(sh.x1, P.kx), gsy(sh.y1, P.ky), gsx(sh.x2, P.kx), gsy(sh.y2, P.ky), sh.r*P.kr);
  return MvF(sh.r0, sh.r0 + (sh.r1 - sh.r0)*P.kr, sh.a0, sh.a1, gsy(sh.oy, P.ky), gsx(sh.ox, P.kx));
};
window.__rnd = function(sh){ const R = (v) => Math.round(v), H = (v) => Math.round(v*2)/2;
  if(sh.k === 'o') return MvO(R(sh.x), R(sh.y), H(sh.r));
  if(sh.k === 'c') return MvC(R(sh.x1), R(sh.y1), R(sh.x2), R(sh.y2), H(sh.r));
  return MvF(R(sh.r0), R(sh.r1), sh.a0, sh.a1, R(sh.oy), R(sh.ox)); };
window.__cells = function(P, step){ step = step || 6;
  const G = window.__G, S0 = G.S, a = G.a, d = G.d;
  const S = Object.assign({}, S0, { boxes: S0.boxes.map(b => Object.assign({}, b, { s: window.__rnd(window.__xf(b.s, P)), _swc: undefined })) });
  const kit = ocKitKey(a, G.key), shapes = [];
  for (const [t, x, y, face] of G.p){ const g = Object.create(a); g.x = x; g.y = y; g.face = face;
    for (const b of S.boxes){ const sh = swShapeAt(g, kit, G.key, S, b, t); if(sh) shapes.push(sh); } }
  const cells = [];
  for (let h = 0; h <= 264; h += step) for (let dx = -204; dx <= 204; dx += step){
    d.x = G.x0 + dx; d.y = groundY() - d.r - h;
    for (const sh of shapes){ if(shapeHits(sh, d)){ cells.push([dx, h]); break; } }
  }
  return JSON.stringify({ cells, boxes: S.boxes.map(b => b.s) });
};
`);
function summ(cells, dir) {
  const S = {}, has = (f) => cells.filter(f);
  const mx = (arr, k, sgn) => arr.length ? Math.max(...arr.map(c => sgn * c[k])) * sgn : null;
  if (dir > 0) { S.top = mx(has(c => Math.abs(c[0]) <= 24), 1, 1); S.topAny = mx(cells, 1, 1); const side = has(c => c[1] >= 48); S.fwd = mx(side, 0, 1); S.back = mx(side, 0, -1); }
  else { const fl = has(c => c[1] === 0); S.fwd = mx(fl.filter(c => c[0] > 0), 0, 1); S.back = mx(fl.filter(c => c[0] < 0), 0, -1); S.nearF = mx(fl.filter(c => c[0] > 0), 0, -1); S.nearB = mx(fl.filter(c => c[0] < 0), 0, 1); S.high = mx(has(c => Math.abs(c[0]) >= 36), 1, 1); }
  S.area = cells.length; return S;
}
function meets(S, need) {
  for (const k in need) { const v = S[k], t = need[k]; if (v == null) return false; if (k === 'back' ? -v < t : v < t) return false; }
  return true;
}
const out = [];
for (const m of POL) {
  const dir = m.dir; w.eval(`__prep(${JSON.stringify(m.n)}, ${dir})`);
  let P = { kx: 1, ky: 1, kr: 1 }, S = summ(JSON.parse(w.eval(`__cells(${JSON.stringify(P)})`)).cells, dir), note = '';
  const S0 = S;
  for (const ph of (m.phases || [])) {   // each phase: { w:[wx, wy, wr], need:{...} }; k grows in 0.02 steps to the cap
    if (meets(S, ph.need)) continue;
    const base = Object.assign({}, P), CP = ph.caps || { kx:2.2, ky:2.0, kr:1.8 };
    let cap = 9; for (const [i, d] of [[0, 'kx'], [1, 'ky'], [2, 'kr']]) if (ph.w[i] > 0) cap = Math.min(cap, 1 + (CP[d]/base[d] - 1)/ph.w[i]);
    cap = Math.max(1, Math.floor(cap*50)/50);
    const Qk = (k) => ({ kx: base.kx * (1 + (k - 1) * ph.w[0]), ky: base.ky * (1 + (k - 1) * ph.w[1]), kr: base.kr * (1 + (k - 1) * ph.w[2]) });
    const ev = (k, st) => summ(JSON.parse(w.eval(`__cells(${JSON.stringify(Qk(k))}, ${st})`)).cells, dir);
    let ok = meets(ev(cap, 12), ph.need), lo = 1, hi = cap;
    if (ok) { for (let i = 0; i < 6; i++) { const mid = (lo + hi) / 2; if (meets(ev(mid, 12), ph.need)) hi = mid; else lo = mid; } }
    let k = Math.round(hi * 50) / 50, T = ev(k, 6);
    if (!ok) { k = cap; T = ev(k, 6); }
    while (!meets(T, ph.need) && k < cap - 1e-9) { k = Math.round((k + 0.04) * 50) / 50; T = ev(k, 6); }
    ok = meets(T, ph.need); P = Qk(k); S = T;
    if (!ok) note += ' CAP(' + JSON.stringify(ph.need) + ')';
  }
  if (m.fixed) { P = m.fixed; S = summ(JSON.parse(w.eval(`__cells(${JSON.stringify(P)})`)).cells, dir); }
  const r2 = (v) => Math.round(v * 100) / 100;
  P = { kx: r2(P.kx), ky: r2(P.ky), kr: r2(P.kr) };
  const R = JSON.parse(w.eval(`__cells(${JSON.stringify(P)})`)); S = summ(R.cells, dir);
  out.push({ n: m.n, dir, P, before: S0, after: S, boxes: R.boxes, note });
  const f = (T) => dir > 0 ? `top ${T.top} fwd ${T.fwd} back ${T.back} area ${T.area}` : `fwd ${T.fwd} back ${T.back} near ${T.nearF}/${T.nearB} high ${T.high} area ${T.area}`;
  console.log(m.n.padEnd(12), dir > 0 ? 'UP  ' : 'DOWN', JSON.stringify(P).padEnd(34), 'before', f(S0).padEnd(44), 'after', f(S), note);
}
console.log('late', LATE);
fs.writeFileSync(process.argv[3], JSON.stringify(out));
try { w.close(); } catch {}
