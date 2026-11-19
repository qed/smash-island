import os from 'node:os'; try { os.setPriority(0, os.constants.priority.PRIORITY_LOW); } catch(e) {}
// Hooks check for batch 6 (offline, one jsdom page). Each move thrown by the fighter at a still Coiny placed at a spot; records what the hook claims.
// Run from the worktree root: node hooks.mjs
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
  if(opts.apct) a.pct = opts.apct; const p0 = d.pct, hx = d.x, hy = d.y; let hitT = -1, vx = 0, vy = 0, minInv = 99, invAt = [], fx = {};
  for (let t = 0; t < S.st + S.act + S.end + 4; t++){
    if(d.pct === p0){ d.x = hx; if(hold){ d.y = hy; d.vy = 0; d.onground = false; } d.vx = 0; }
    if(opts.poke && t === opts.poke){ invAt.push(a.armor); }
    step();
    if(d.pct !== p0 && hitT < 0){ hitT = a._mv ? a._mv.t - 1 : -9; vx = d.vx; vy = d.vy; fx.stun = d.hitstun; fx.weak = d.weakened; fx.defined = d.defined; fx.burn = d.burn; fx.ice = d.iceUntil; fx.slow = d.slowed; fx.root = d.rooted; fx.rev = d.ctrlRev; fx.poison = d._poisonT; fx.burn = d.burn; }
  }
  return { aPct: Math.round(a.pct*10)/10, maxDy: 0, took: Math.round((d.pct - p0)*10)/10, hitT, vx: Math.round(vx*10)/10, vy: Math.round(vy*10)/10, aFace: a.face, aX: Math.round(a.x - WW*0.5), dX: Math.round(d.x - a.x), fx, inv: invAt };
};`);
const go = (n, dir, dx, dy, o) => JSON.parse(w.eval(`JSON.stringify(__go(${JSON.stringify(n)}, ${dir}, ${dx}, ${dy}, ${JSON.stringify(o || {})}))`));
const P = (label, r) => console.log(label.padEnd(60), JSON.stringify(r));
P('Balloon up: foe at -70 (3 pounds: 16)', go('Balloon', 1, 0, -70));
P('Balloon up: foe standing 40 beside (miss?)', go('Balloon', 1, 40, 0));
P('Balloon down: foe 100 in front (root frames)', go('Balloon', -1, 100, 0));
P('Bomb up: foe at -100, 80 in front (cap)', go('Bomb', 1, 80, -100));
P('Bomb up: foe at -80 (cap reach low edge)', go('Bomb', 1, 0, -80));
P('Bomb up: foe standing 40 beside (miss)', go('Bomb', 1, 40, 0));
P('Bomb down: foe 140 in front (late blast, hitT ~12)', go('Bomb', -1, 140, 0));
P('Bomb down: foe 50 in front (miss)', go('Bomb', -1, 50, 0));
P('Fern up: foe at -70; Fern armour on frames 1,5,9,12', [1, 5, 9, 12].map(k => go('Fern', 1, 0, -70, { poke: k }).inv[0]));
P('Fern down: foe 60 in front, Fern at 30% (heals 4)', go('Fern', -1, 60, 0, { apct: 30 }));
P('Goo up: foe at -80 (slow frames)', go('Goo', 1, 0, -80));
P('Goo down: foe 140 in front (dX after: smaller = dragged in)', go('Goo', -1, 140, 0));
P('Goo down: foe 140 behind', go('Goo', -1, -140, 0));
P('Microphone up: foe at -130 (scramble frames)', go('Microphone', 1, 0, -130));
P('Microphone down: foe 85 in front (out + echo = 15)', go('Microphone', -1, 85, 0));
P('Microphone down: foe 125 behind (out + echo)', go('Microphone', -1, -125, 0));
P('Pillow up: foe at -70 (vx>0: sideways)', go('Pillow', 1, 0, -70));
P('Pillow down: foe 50 in front (poison)', go('Pillow', -1, 50, 0));
P('Taco (II) up: foe at -170 (caught + bopped = 16)', go('Taco (II)', 1, 0, -170));
P('Taco (II) up: foe at -60 (bop only)', go('Taco (II)', 1, 0, -60));
P('Taco (II) down: foe 80 in front; aX = how far she skidded', go('Taco (II)', -1, 80, 0));
P('Taco (II) down: foe 70 behind (fan 8)', go('Taco (II)', -1, -70, 0));
P('Tea Kettle up: foe 60 in front at -70 (burn)', go('Tea Kettle', 1, 60, -70));
P('Tea Kettle down: foe 50 in front (knockdown, small vx)', go('Tea Kettle', -1, 50, 0));
console.log('page errors', errs.length ? errs.slice(0, 5) : 0);
process.exit(0);
