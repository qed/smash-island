// Hooks check for batch 6 (offline, one jsdom page). Each move thrown by the fighter at a still Coiny placed at a spot; records what the hook claims.
// Run from the worktree root: node hooks.mjs
import os from 'node:os'; try { os.setPriority(0, os.constants.priority.PRIORITY_BELOW_NORMAL); } catch (e) {}
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island-work/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island-work/scripts/helpers/match-setup.js';
process.on('uncaughtException', () => {});
const { window: w } = loadMonolith(0xBEEF);
const errs = []; w.addEventListener('error', e => errs.push(String(e.message).slice(0, 120)));
w.eval(SETUP_SRC);
w.eval(`window.__go = function(name, dir, dx, dy, opts){ opts = opts || {};
  __setupCustomMatch([name, 'Coiny'], 99, 2, 0); for (const f of fighters){ f.controller = 'still'; f.invuln = 0; } for (let i = 0; i < 30; i++) step();
  const a = fighters[0], d = fighters[1];
  for (const f of fighters){ f.invuln = 0; f.x = WW*0.5; f.y = groundY() - f.r; f.vx = 0; f.vy = 0; f.onground = true; f.face = 1; f.smCd = 0; f.atkCd = 0; f.pct = 0; f._mv = null; }
  d.x = a.x + dx; d.y = groundY() - d.r + dy; d.pct = 60; if(opts.attack) { d._atkAnim = 10; }
  const hold = dy < 0, S = dirSmashSpec(a, dir); dirSmash(a, dir);
  const p0 = d.pct, hx = d.x, hy = d.y; let hitT = -1, vx = 0, vy = 0, minInv = 99, invAt = [], fx = {};
  for (let t = 0; t < S.st + S.act + S.end + 4; t++){
    if(d.pct === p0){ d.x = hx; if(hold){ d.y = hy; d.vy = 0; d.onground = false; } d.vx = 0; }
    if(opts.poke && t === opts.poke){ invAt.push(a.invuln); }
    step();
    if(d.pct !== p0 && hitT < 0){ hitT = a._mv ? a._mv.t - 1 : -9; vx = d.vx; vy = d.vy; fx.stun = d.hitstun; fx.weak = d.weakened; fx.defined = d.defined; fx.burn = d.burn; fx.ice = d.iceUntil; fx.track = a._g6track ? (a._g6track.idx === d.idx ? a._g6track.until - hazardT : 'other') : 0; }
  }
  return { took: Math.round((d.pct - p0)*10)/10, hitT, vx: Math.round(vx*10)/10, vy: Math.round(vy*10)/10, aFace: a.face, aX: Math.round(a.x - WW*0.5), dX: Math.round(d.x - a.x), fx, inv: invAt };
};`);
const go = (n, dir, dx, dy, o) => JSON.parse(w.eval(`JSON.stringify(__go(${JSON.stringify(n)}, ${dir}, ${dx}, ${dy}, ${JSON.stringify(o || {})}))`));
const P = (label, r) => console.log(label.padEnd(58), JSON.stringify(r));
P('Apple up: foe above (rear, launches up)', go('Apple', 1, 20, -70));
P('Apple up: foe on floor 60 in front (stamp, knockdown)', go('Apple', 1, 60, 0));
P('Apple down: foe in front 60 (ice frames)', go('Apple', -1, 60, 0));
P('Apple down: foe 110 in front', go('Apple', -1, 110, 0));
P('Apple down: foe behind -100', go('Apple', -1, -100, 0));
P('Bracelety up: foe in front 50 on floor (thrown behind: vx<0)', go('Bracelety', 1, 50, 0));
P('Bracelety up: foe above (vx<0)', go('Bracelety', 1, 10, -80));
P('Bracelety down: foe 120 in front (late hit)', go('Bracelety', -1, 120, 0));
P('Bracelety down: foe 60 behind', go('Bracelety', -1, -60, 0));
P('Firey Jr. up: foe over him at -70 (rocket + burst?)', go('Firey Jr.', 1, 0, -70));
P('Firey Jr. up: foe at -110', go('Firey Jr.', 1, 0, -110));
P('Firey Jr. down: foe 70 in front', go('Firey Jr.', -1, 70, 0));
P('MeTag up: foe at -100 (tracked frames)', go('MeTag', 1, 0, -100));
P('MeTag down: foe 80 in front (vx<0: inward)', go('MeTag', -1, 80, 0));
P('MeTag down: foe 80 behind (vx>0: inward)', go('MeTag', -1, -80, 0));
P('Pickle up: foe 50 in front (hit frame, should be 12+)', go('Pickle', 1, 50, -40));
P('Pickle down: foe 100 in front', go('Pickle', -1, 100, 0));
P('Pickle down: foe 0 above at -60 (spring)', go('Pickle', -1, 0, -60));
P('Poppy up: foe 60 in front on floor', go('Poppy', 1, 60, 0));
P('Poppy up: foe 60 in front at -100', go('Poppy', 1, 60, -100));
P('Poppy down: foe 100 in front (stun)', go('Poppy', -1, 100, 0));
P('Profily up: foe at -70 (defined = tag frames)', go('Profily', 1, 0, -70));
P('Profily down: foe 60 in front; invuln on frames 1,5,7,9', [1, 5, 7, 9].map(k => go('Profily', -1, 60, 0, { poke: k }).inv[0]));
P('Profily down: foe 60 behind', go('Profily', -1, -60, 0));
P('Silver Spoon up: foe standing 60 beside (lift + tip, vx<0)', go('Silver Spoon', 1, 60, 0));
P('Silver Spoon up: foe at -80, 60 in front', go('Silver Spoon', 1, 60, -80));
P('Silver Spoon down: foe 80 in front (weak frames)', go('Silver Spoon', -1, 80, 0));
P('Silver Spoon down: foe 80 behind', go('Silver Spoon', -1, -80, 0));
console.log('page errors', errs.length ? errs.slice(0, 5) : 0);
process.exit(0);
