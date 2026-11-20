import os from 'node:os'; try { os.setPriority(0, os.constants.priority.PRIORITY_LOW); } catch(e) {}
// Hooks check for batch 8 (offline, one jsdom page). Each move thrown by the fighter at a still Coiny placed at a spot; records what the hook claims.
// Run from the worktree root: node hooks8.mjs
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
  d.x = a.x + dx; d.y = groundY() - d.r + dy; d.pct = 60;
  const hold = dy < 0, S = dirSmashSpec(a, dir); dirSmash(a, dir);
  if(opts.counter) d.countering = 40; if(opts.armor) d.armor = 40; if(opts.shield){ d._zsOn = 1; d._zsM = 50; }
  const p0 = d.pct, hx = d.x, hy = d.y; let hitT = -1, vx = 0, vy = 0, fx = {}, path = [], aStun = 0;
  for (let t = 0; t < S.st + S.act + S.end + 4; t++){
    if(d.pct === p0){ d.x = hx; if(hold){ d.y = hy; d.vy = 0; d.onground = !!opts.shield; } d.vx = 0; if(opts.counter) d.countering = Math.max(d.countering, 2); if(opts.armor) d.armor = Math.max(d.armor, 2); } if(opts.shield && d.pct === p0 && !(a._zsBrk > 0)){ d._zsOn = 1; d._zsM = 50; }
    const before = d.pct; step();
    if(a._mv && a._mv.lasso >= 0) path.push([a._mv.t - 1, Math.round(d.x - a.x), Math.round(d.y - a.y)]);
    if(d.pct !== before && hitT < 0){ hitT = a._mv ? a._mv.t - 1 : -9; }
    if(d.pct !== before){ vx = d.vx; vy = d.vy; fx.stun = d.hitstun; fx.curse = d.curseStacks; fx.defined = d.defined; fx.rev = d.ctrlRev; fx.slow = d.slowed; }
    aStun = Math.max(aStun, a._zsBrk || 0);
  }
  return { took: Math.round((d.pct - p0)*10)/10, firstHitT: hitT, vx: Math.round(vx*10)/10, vy: Math.round(vy*10)/10, dX: Math.round(d.x - a.x), dYfeet: Math.round((d.y + d.r) - groundY()), fx, lassoPath: path.length ? path.filter((p, i) => i % 2 === 0) : undefined, bowStun: aStun || undefined, shieldLeft: opts.shield ? d._zsOn : undefined };
};`);
const go = (n, dir, dx, dy, o) => JSON.parse(w.eval(`JSON.stringify(__go(${JSON.stringify(n)}, ${dir}, ${dx}, ${dy}, ${JSON.stringify(o || {})}))`));
const P = (label, r) => console.log(label.padEnd(62), JSON.stringify(r));
P('Bow up: foe at -70 over her (caught, slammed in front: 14)', go('Bow', 1, 0, -70));
P('Bow up: foe 50 behind at -70 (caught, slammed in FRONT)', go('Bow', 1, -50, -70));
P('Bow up: foe standing 40 in front (miss)', go('Bow', 1, 40, 0));
P('Bow up: foe at -70 COUNTERING (caught anyway)', go('Bow', 1, 0, -70, { counter: true }));
P('Bow up: foe at -70 with ARMOUR (caught anyway)', go('Bow', 1, 0, -70, { armor: true }));
P('Bow up: foe at -70 (as on a platform) with a SHIELD up (broken, no catch, Bow stunned)', go('Bow', 1, 0, -70, { shield: true }));
P('Bow down: foe 40 in front (knocked down, small push)', go('Bow', -1, 40, 0));
P('Bow down: foe 40 behind at -30 (tails: up and back)', go('Bow', -1, -40, -30));
P('Clover up: foe 80 in front at -110 late (lingers)', go('Clover', 1, 80, -110));
P('Clover down: foe 100 in front (curse 12)', go('Clover', -1, 100, 0));
P('Fanny up: foe 30 in front at -60 (thrown forward, vx>0)', go('Fanny', 1, 30, -60));
P('Fanny up: foe 30 BEHIND at -60 (thrown back, vx<0)', go('Fanny', 1, -30, -60));
P('Fanny down: foe 60 in front (4 + 8 = 12)', go('Fanny', -1, 60, 0));
P('Fanny down: foe 60 behind (8)', go('Fanny', -1, -60, 0));
P('Grassy up: foe at -70 straight over her (miss)', go('Grassy', 1, 0, -70));
P('Grassy up: foe standing 70 beside (hit)', go('Grassy', 1, 70, 0));
P('Grassy down: foe 80 in front (scramble)', go('Grassy', -1, 80, 0));
P('Lifering up: foe at -100 (stun, small lift)', go('Lifering', 1, 0, -100));
P('Lifering down: foe 40 in front (carried: up to 19)', go('Lifering', -1, 40, 0));
P('Lifering down: foe 130 in front (only the break)', go('Lifering', -1, 130, 0));
P('Marker up: foe at -60 (carried up 3 times + popped = 15)', go('Marker', 1, 0, -60));
P('Marker down: foe 140 in front (marked)', go('Marker', -1, 140, 0));
P('Paper up: foe 50 in front at -74 (pulled in + snapped = 18)', go('Paper', 1, 50, -74));
P('Paper down: foe 100 in front (late, flat skid: vy small)', go('Paper', -1, 100, 0));
P('Saw up: foe 50 in front at -70 (4 strokes = 15)', go('Saw', 1, 50, -70));
P('Saw down: foe 80 in front (thrown BEHIND: vx<0)', go('Saw', -1, 80, 0));
P('Saw down: foe 60 behind (thrown behind: vx<0)', go('Saw', -1, -60, 0));
console.log('page errors', errs.length ? errs.slice(0, 5) : 0);
process.exit(0);
