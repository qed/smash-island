// Two small measurements (offline, one page): (1) Ice Cube's Served Cold on a foe who was / was not the last to hit her; (2) how far Puffball's All Aboard lifts her
// and a foe over her, and where she is when the move ends. Run from the worktree root: node probe.mjs
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/updsm2/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/updsm2/scripts/helpers/match-setup.js';
process.on('uncaughtException', () => {});
const { window: w } = loadMonolith(0xABCD);
const errs = []; w.addEventListener('error', e => errs.push(String(e.message).slice(0, 120)));
w.eval(SETUP_SRC);
const setup = (n) => `window.__setupCustomMatch([${JSON.stringify(n)}, 'Coiny'], 99, 2, 0); for (const f of fighters){ f.controller = 'still'; f.invuln = 0; } for (let i = 0; i < 30; i++) step();
  var a = fighters[0], d = fighters[1]; for (const f of fighters){ f.invuln = 0; f.x = WW*0.5; f.y = groundY() - f.r; f.vx = 0; f.vy = 0; f.onground = true; f.face = 1; f.smCd = 0; f.atkCd = 0; f.pct = 0; f._mv = null; }
  d.y = groundY() - d.r - 70; d.pct = 60;`;
for (const last of [false, true]) {
  const r = w.eval(`(function(){ ${setup('Ice Cube')} a.lastHitBy = ${last ? 'd' : 'null'}; const p0 = d.pct, hy = d.y; dirSmash(a, 1);
    for (let t = 0; t < 40; t++){ if(d.pct === p0){ d.y = hy; d.vy = 0; d.vx = 0; d.onground = false; } step(); } return Math.round((d.pct - p0)*10)/10; })()`);
  console.log('Served Cold, the foe', last ? 'WAS the last to hit her:' : 'was not the last to hit her:', r);
}
const p = JSON.parse(w.eval(`(function(){ ${setup('Puffball')} const p0 = d.pct, hy = d.y, y0 = a.y; dirSmash(a, 1); let top = 0, dTop = 0, endY = null, landT = -1; const S = dirSmashSpec(a, 1), tot = S.st + S.act + S.end;
    for (let t = 0; t < 140; t++){ if(d.pct === p0){ d.y = hy; d.vy = 0; d.vx = 0; d.onground = false; } step(); top = Math.max(top, y0 - a.y); dTop = Math.max(dTop, hy - d.y); if(t === tot) endY = y0 - a.y; if(landT < 0 && t > 8 && a.onground) landT = t; }
    return JSON.stringify({ took: Math.round((d.pct - p0)*10)/10, sheRose: Math.round(top), foeRoseAtLeast: Math.round(dTop), heightWhenMoveEnds: Math.round(endY), backOnFloorAtFrame: landT, moveFrames: tot }); })()`));
console.log('All Aboard, a foe 70 px over her:', JSON.stringify(p));
const q = JSON.parse(w.eval(`(function(){ ${setup('Puffball')} d.y = groundY() - d.r; d.x = a.x + 400; const y0 = a.y; dirSmash(a, 1); let top = 0, landT = -1;
    for (let t = 0; t < 140; t++){ step(); top = Math.max(top, y0 - a.y); if(landT < 0 && t > 8 && a.onground) landT = t; } return JSON.stringify({ sheRoseOnAMiss: Math.round(top), backOnFloorAtFrame: landT }); })()`));
console.log('All Aboard, nobody there:', JSON.stringify(q));
console.log('errors', errs.length ? errs.slice(0, 3) : 0);
try { w.close(); } catch {}
