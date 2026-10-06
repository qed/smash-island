import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { bootMonolith } from './helpers/smash-golden.js';
import { loadMonolith } from './helpers/load-monolith.js';
import { mulberry32 } from './helpers/prng.js';
import { bootValidating } from './helpers/validating-canvas.js';

// THE BOSS KIT (the boss overhaul, 2026-09-29: boss-overhaul-decisions.md). The engine the thirteen rebuilt bosses stand on,
// built before any of them, so six builders can work on the early six at once:
//   impact()            "Hits feel heavy: screen shake, dust, debris on big impacts."
//   the shake setting   "Screen shake: 'Add a toggle' -- on by default, an off switch in settings."
//   the fall drift      "add momentum to falling objects(they should move horizontaly while falling)" -- asked what it
//                       covers: "everything. bosses, characters, whatever."; asked which way: "The way it was thrown"
//   BOSS_ARENA_GROUND   every boss arena kept Goiky's green ground (boss-plan-early.md 2.4)
//   BOSS_ARENA_HAZARD   "if it makes sense for a hazard, reduce boss difficulty and add a hazard."
//   BOSS_ENDINGS        "Endings: 'All of them' -- every boss gets a short canon exit scene when beaten"
//   the slot markers    so the six builders' edits merge without a conflict
//   and the Announcer's phase-3 banner, which said "CAKE AT STAKE!" over CRUSHER ARM (boss-plan-early.md 2.1).

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// A still Firey on the floor at `x`, in Boss Rush with the gauntlet off, and the boss named `name` spawned the way the
// gauntlet spawns it, its attack timer parked.
const STAGE = (name, x) => `
  SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
  BOSSRUSH = { active:false, bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.name===${JSON.stringify(name)}; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; impactFxClear();
  var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), ${x}, groundY()-24, 0);
  f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
  spawnBossRushBoss();
  var b = summons.find(function(s){ return s.type==='boss'; });
  b._atkTimer = 1e9;
  step(); f.pct=0; f.invuln=0;
`;

// A boot whose canvas records every call with the fill and stroke in force, so a test can see what draw() painted. `pre`
// runs on the window before the page's script (a stored setting, say).
function bootRecording(pre) {
  const html = readFileSync('artifacts/V1/index.html', 'utf8');
  const log = [], state = { fillStyle: '#000000', strokeStyle: '#000000' }, grad = { addColorStop() {} };
  const rec = new Proxy({}, {
    get: (_t, p) => {
      if (p === 'measureText') return () => ({ width: 0 });
      if (p === 'canvas') return { width: 1100, height: 720 };
      if (p === 'getImageData') return () => ({ data: [] });
      if (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createConicGradient' || p === 'createPattern') return () => grad;
      if (Object.prototype.hasOwnProperty.call(state, p)) return state[p];
      return (...args) => { log.push({ op: String(p), args, fill: state.fillStyle, stroke: state.strokeStyle }); };
    },
    set: (_t, p, v) => { state[p] = v; return true; },
  });
  const dom = new JSDOM(html, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      if (pre) pre(window);
      window.HTMLCanvasElement.prototype.getContext = () => rec;
      window.Math.random = mulberry32(3);
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
    },
  });
  return { w: dom.window, log };
}

describe('impact(): one call for a heavy hit', () => {
  it('shakes up to the cap, rolls a low dust ring, throws debris, leaves a scar -- and never touches the dice or the particles', () => {
    const r = W.eval(`(function(){
      running=true; worldPlats=[]; projectiles=[]; summons=[]; particles=[]; impactFxClear(); shakeAmt=0;
      var gy = groundY(), n = 0, R = Math.random; Math.random = function(){ n++; return R(); };
      impact(500, gy, { shake:30, dust:2, debris:12, scar:true });
      Math.random = R;
      return { rand:n, shake:shakeAmt, dust:IMPACT_DUST.length, debris:IMPACT_DEBRIS.length, scars:IMPACT_SCARS.length, particles:particles.length,
        low: IMPACT_DUST.every(function(d){ return d.y <= gy && d.y > gy - 10 && Math.abs(d.vy) < 1; }),
        both: IMPACT_DUST.some(function(d){ return d.vx < 0; }) && IMPACT_DUST.some(function(d){ return d.vx > 0; }),
        long: IMPACT_DUST.every(function(d){ return d.life >= 30; }), scarAt: [IMPACT_SCARS[0].x, IMPACT_SCARS[0].y] };
    })()`);
    expect(r.rand, 'render-only: the sim\'s dice are untouched').toBe(0);
    expect(r.shake, 'shake(30) reaches shake()\'s 12 px cap').toBe(12);
    expect(r.dust).toBe(16);
    expect(r.low, 'the dust hugs the surface: low and slow').toBe(true);
    expect(r.both, 'a ring: it rolls out both ways').toBe(true);
    expect(r.long, 'and hangs longer than a puff (14-24 frames)').toBe(true);
    expect(r.debris).toBe(12);
    expect(r.scars).toBe(1);
    expect(r.scarAt).toEqual([500, W.eval('groundY()')]);
    expect(r.particles, 'none of it rides the particle list (or its snapshot)').toBe(0);
  });

  it('a chunk flies, falls, bounces once on the surface and lies still, then fades; a scar stays and fades', () => {
    const r = W.eval(`(function(){
      worldPlats=[]; impactFxClear(); var gy = groundY();
      impact(400, gy, { shake:0, dust:0, debris:6, scar:80 });
      var out = [];
      IMPACT_DEBRIS.forEach(function(c){ c.life = 400; });   // follow each one the whole way down
      var cs = IMPACT_DEBRIS.slice(), last = cs.map(function(c){ return c.vy; }), bounces = cs.map(function(){ return 0; });
      for (var i=0;i<200;i++){ stepImpactFx(); cs.forEach(function(c, k){ if (last[k] > 0 && c.vy < 0) bounces[k]++; last[k] = c.vy; }); }
      var scarW = IMPACT_SCARS[0].w;
      var lived = 0; while (IMPACT_SCARS.length && lived < 5000){ stepImpactFx(); lived++; }
      return { bounces: bounces, rest: cs.every(function(c){ return c.rest; }), onFloor: cs.every(function(c){ return Math.abs(c.y - gy) < 0.01; }),
               scarW: scarW, scarLived: lived + 200, scarLife: IMPACT_FX.scarLife };
    })()`);
    expect(r.bounces.every((n) => n === 1), `one bounce each: ${r.bounces}`).toBe(true);
    expect(r.rest && r.onFloor, 'then still, on the floor').toBe(true);
    expect(r.scarW).toBe(80);
    expect(r.scarLived, 'the scar stays its life, then goes').toBe(r.scarLife);
  });

  it('a chunk that flies off a platform lands on the floor under it, not in the air', () => {
    const r = W.eval(`(function(){
      var gy = groundY(); worldPlats = [{ x:380, y:gy-160, w:40, h:14 }]; impactFxClear();
      impact(400, gy-160, { shake:0, dust:0, debris:12 });
      IMPACT_DEBRIS.forEach(function(c){ c.life = 600; });
      for (var i=0;i<400;i++) stepImpactFx();
      var ys = IMPACT_DEBRIS.map(function(c){ return c.y; });
      worldPlats = []; impactFxClear();
      return { ys: ys, gy: gy, top: gy-160 };
    })()`);
    const on = (y, s) => Math.abs(y - s) < 0.01;
    expect(r.ys.every((y) => on(y, r.gy) || on(y, r.top)), `every chunk rests on a surface: ${r.ys}`).toBe(true);
    expect(r.ys.some((y) => on(y, r.gy)), 'and the ones thrown past the edge reached the floor').toBe(true);
    expect(r.ys.some((y) => on(y, r.top)), 'and the ones that came down on it stayed on the platform').toBe(true);
  });

  it('caps what is alive: 60 chunks, 24 scars (the oldest go), and a new match clears them', () => {
    const r = W.eval(`(function(){
      impactFxClear(); var gy = groundY();
      for (var i=0;i<10;i++) impact(100 + i*80, gy, { shake:0, debris:12, dust:0 });
      var debris = IMPACT_DEBRIS.length;
      for (var j=0;j<30;j++) impact(50 + j*30, gy, { shake:0, debris:0, dust:0, scar:true });
      var scars = IMPACT_SCARS.length, oldest = IMPACT_SCARS[0].x;
      return { debris: debris, max: IMPACT_FX.debrisMax, scars: scars, smax: IMPACT_FX.scarMax, oldest: oldest };
    })()`);
    expect(r.debris).toBe(r.max);
    expect(r.max).toBe(60);
    expect(r.scars).toBe(24);
    expect(r.oldest, 'the six oldest scars went').toBe(50 + 6 * 30);
    // beginMatchNow clears them (a real match start, on the harness that draws)
    const { window: w } = loadMonolith();
    const left = w.eval(`(function(){ SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow();
      impact(300, groundY(), { scar:true, debris:5 }); var had = IMPACT_SCARS.length + IMPACT_DEBRIS.length;
      running=false; beginMatchNow(); var after = IMPACT_SCARS.length + IMPACT_DEBRIS.length + IMPACT_DUST.length; running=false;
      return [had, after]; })()`);
    expect(left[0]).toBeGreaterThan(0);
    expect(left[1], 'nothing of the last match is left').toBe(0);
  });

  it("a netcode client plays the host's impact exactly, from one small entry in the snapshot", () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow();
      var gy = groundY(); NET.role = 'host';
      impact(420, gy, { shake:14, dust:1, debris:5, scar:true, color:'#aa5500' });
      var host = JSON.stringify({ d: IMPACT_DEBRIS, u: IMPACT_DUST, s: IMPACT_SCARS });
      var snap = JSON.parse(JSON.stringify(serializeState()));
      NET.role = 'solo'; impactFxClear(); shakeAmt = 0;
      applySnapshot(snap);
      var client = JSON.stringify({ d: IMPACT_DEBRIS, u: IMPACT_DUST, s: IMPACT_SCARS });
      var shook = shakeAmt, again = serializeState().imp;
      running = false;
      return { imp: snap.imp, same: host === client, shook: shook, again: again === undefined };
    })()`);
    expect(r.imp).toHaveLength(1);
    expect(JSON.stringify(r.imp).length, 'a few numbers, not the pieces').toBeLessThan(80);
    expect(r.same, 'the same dust, chunks and scar on the client').toBe(true);
    expect(r.shook, 'and its screen shakes too').toBeGreaterThan(0);
    expect(r.again, 'sent once').toBe(true);
  });

  it('a falling shot with landImpact plays one where it lands', () => {
    const r = W.eval(`(function(){ ${STAGE('Announcer', 300)}
      shakeAmt = 0; impactFxClear();
      var p = addProj(bossShot(b, { x:600, y:100, vx:0, vy:6, grav:true, warnX:600, warnY:groundY(), warn:20, bossAtk:++BOSS_ATK_ID, landImpact:{ shake:8, debris:4, scar:true } }));
      for (var i=0;i<80 && p.life>0;i++) step();
      var out = { debris: IMPACT_DEBRIS.length, scar: IMPACT_SCARS.map(function(s){ return [Math.round(s.x), s.y]; }), gy: groundY() };
      summons = []; projectiles = []; impactFxClear(); return out;
    })()`);
    expect(r.debris).toBe(4);
    expect(r.scar).toEqual([[600, r.gy]]);
  });
});

describe('the Screen shake setting', () => {
  it('is on by default, in Settings beside the other switches, and the default is not written down', () => {
    const { window: w } = loadMonolith();
    const btn = w.document.getElementById('shakeToggle');
    expect(w.eval('SHAKE_ON')).toBe(true);
    expect(btn.textContent).toBe('📳 Screen shake: On');
    expect(w.document.getElementById('options').contains(btn)).toBe(true);
    expect(btn.className).toBe(w.document.getElementById('soundToggle').className);
    expect(btn.getAttribute('onclick')).toBe('toggleShake()');
    expect(w.localStorage.getItem('bfsi:shake')).toBe(null);
  });

  it('off, neither shake() nor impact() moves the screen (the dust and debris still come), and it is saved', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      shakeAmt = 0; shake(10); var on = shakeAmt;
      toggleShake(); var cut = shakeAmt;
      shake(10); impact(300, groundY(), { shake:30, debris:3 });
      var off = shakeAmt, debris = IMPACT_DEBRIS.length;
      var saved = localStorage.getItem('bfsi:shake'), label = document.getElementById('shakeToggle').textContent;
      toggleShake(); shake(10);
      return { on: on, cut: cut, off: off, debris: debris, saved: saved, label: label, back: shakeAmt, saved2: localStorage.getItem('bfsi:shake') };
    })()`);
    expect(r.on).toBe(4);
    expect(r.cut, 'switching it off stops a shake already running').toBe(0);
    expect(r.off).toBe(0);
    expect(r.debris).toBe(3);
    expect(r.saved).toBe('0');
    expect(r.label).toBe('📳 Screen shake: Off');
    expect(r.back).toBe(4);
    expect(r.saved2).toBe('1');
  });

  it('a player who switched it off last session boots with it off, and the button says so', () => {
    const { w } = bootRecording((win) => { win.localStorage.setItem('bfsi:shake', '0'); });
    expect(w.eval('SHAKE_ON')).toBe(false);
    expect(w.document.getElementById('shakeToggle').textContent).toBe('📳 Screen shake: Off');
    expect(w.eval('shakeAmt = 0; shake(20); shakeAmt')).toBe(0);
  });
});

describe('the fall drift: everything that falls moves sideways and lands on its shadow', () => {
  // Follows a shot until it is spent (a drop stops at the surface it reaches), recording where it went.
  const FOLLOW = `function follow(p, n){ var xs = [p.x], vxs = [], moved = true;
      for (var i=0;i<(n||200) && p.life>0 && !p.trap;i++){ step(); xs.push(p.x); vxs.push(p.vx); }
      return { x0: xs[0], x: p.x, y: p.y, warnX: p.warnX, warnY: p.warnY, vxs: vxs, spent: p.life<=0 || !!p.trap }; }`;

  // "The way it was thrown" (the owner, 2026-09-29, Round 12): the way the thrower was facing or moving -- not toward the
  // target, never at random.
  it("a boss's sky drops drift the way it faces, a fifth across for every px down, and land exactly on their shadows", () => {
    const r = W.eval(`(function(){ ${STAGE('Announcer', 700)} ${FOLLOW}
      f.x = 700; b.x = 250; b.face = 1; b._telX = 700;
      projectiles = []; BOSS_MOVES.rain(b, f);
      var drops = projectiles.slice(), y0 = drops[0].y, warnY = drops[0].warnY;
      var starts = drops.map(function(p){ return { x:p.x, vx:p.vx, warnX:p.warnX, dmg:p.dmg }; });
      f.x = 100; f.invuln = 1e9;   // out of the way: follow them to the floor
      var ends = drops.map(function(p){ return follow(p); });
      // facing left, over the same spots to his right: they drift left, the way he faced -- not toward where they land
      ${STAGE('Announcer', 700)} b.x = 250; b.face = -1; b._telX = 700; projectiles = []; BOSS_MOVES.rain(b, f);
      var away = projectiles.map(function(p){ return { vx:p.vx, x:p.x, warnX:p.warnX }; });
      f.x = 100; f.invuln = 1e9; var awayEnds = projectiles.slice().map(function(p){ return follow(p); });
      summons = []; projectiles = [];
      return { starts: starts, ends: ends, away: away, awayEnds: awayEnds, fall: warnY - y0, bossDmg: bossDmg() };
    })()`);
    for (const s of r.starts) {
      expect(s.vx, 'the way he faced (right)').toBeGreaterThan(0);
      expect(s.x, 'it starts back along its drift').toBeLessThan(s.warnX);
      expect(Math.abs((s.warnX - s.x) - 0.2 * r.fall), 'a fifth of its fall').toBeLessThan(1);
      expect(s.dmg, 'damage untouched').toBeCloseTo(r.bossDmg * 0.8, 6);
    }
    for (const e of r.ends.concat(r.awayEnds)) {
      expect(e.spent, 'it landed').toBe(true);
      expect(e.x, 'the shadow is where it came down').toBe(e.warnX);
    }
    expect(r.ends.every((e) => e.vxs.slice(0, -1).every((v) => v > 0)), 'moving sideways the whole way down').toBe(true);
    expect(r.away.every((a) => a.vx < 0 && a.x > a.warnX), 'facing left, they drift left, though they land to his right').toBe(true);
  });

  it('a thrower with no facing drifts it the way it was moving; nobody threw it, toward the middle', () => {
    const r = W.eval(`(function(){ var gy = groundY(); projectiles = [];
      var moving = addProj(bossShot({ x:500, face:0, vx:-3, color:'#ffffff' }, { x:600, y:100, vx:0, vy:5, grav:true, warnX:600, warnY:gy, warn:20 }));
      var nobody = addProj({ owner:-2, ownerObj:{team:-1, idx:-2}, x:200, y:100, vx:0, vy:5, grav:true, warnX:200, warnY:gy, warn:20, r:10, life:100 });
      var right = addProj({ owner:-2, ownerObj:{team:-1, idx:-2}, x:WW-200, y:100, vx:0, vy:5, grav:true, warnX:WW-200, warnY:gy, warn:20, r:10, life:100 });
      projectiles = [];
      return [Math.sign(moving.vx), Math.sign(nobody.vx), Math.sign(right.vx)];
    })()`);
    expect(r).toEqual([-1, 1, -1]);
  });

  it("a fighter's drop (Blocky's anvil) drifts the way the fighter faced and lands on the platform its shadow is on", () => {
    const r = W.eval(`(function(){ ${FOLLOW}
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var platTop = groundY()-180; worldPlats = [{x:300, y:platTop, w:260, h:16}];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Blocky'; }), 420, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 480, platTop-24, 1);
      A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9; fighters=[A,D];
      for (var k=0;k<3;k++) step(); A.spCd=0; A.dropCd=0; projectiles=[];
      fireSpecial(A, {}); var p = projectiles.filter(function(q){ return q.owner===A.idx; })[0];
      var start = { x:p.x, vx:p.vx, warnX:p.warnX, warnY:p.warnY };
      D.x = 900; D.y = groundY()-24; D.invuln = 1e9;   // off the platform and out of its way
      var e = follow(p);
      // turned the other way, the same anvil on the same foe drifts left
      D.x = 480; D.y = platTop-24; A.face = -1; A.spCd = 0; A.dropCd = 0; projectiles = [];
      fireSpecial(A, {}); var q = projectiles.filter(function(z){ return z.owner===A.idx; })[0];
      var back = { vx:q.vx, warnX:q.warnX };
      worldPlats = []; projectiles = [];
      return { start: start, end: e, platTop: platTop, back: back };
    })()`);
    expect(r.start.vx, 'Blocky faced right').toBeGreaterThan(0);
    expect(r.start.warnY).toBe(r.platTop);
    expect(r.end.x).toBe(r.start.warnX);
    expect(r.end.y, 'stopped on the platform').toBeLessThanOrEqual(r.platTop);
    expect(r.back.vx, 'facing left, it drifts left onto the same foe').toBeLessThan(0);
    expect(r.back.warnX).toBe(r.start.warnX);
  });

  it("the shadow shows where it lands for a drop that already moves sideways, and for Springy's box, which stands where it lands", () => {
    const r = W.eval(`(function(){ ${STAGE('Springy', 300)} ${FOLLOW}
      f.x = 100; f.invuln = 1e9; b.x = 700; b.face = -1; projectiles = []; worldPlats = worldPlats.filter(function(p){ return !p._springy || p.bouncy; });
      springyDrop(b, 400, 'box', ++BOSS_ATK_ID);
      var box = projectiles[projectiles.length-1], boxStart = { x:box.x, vx:box.vx, warnX:box.warnX };
      var eb = follow(box);
      var wall = worldPlats.find(function(p){ return p._springy && p.solid; });
      projectiles = []; springyDrop(b, 500, 'clone', ++BOSS_ATK_ID);
      var cl = projectiles[projectiles.length-1], clStart = { x:cl.x, vx:cl.vx, warnX:cl.warnX }, firstLand = null;
      for (var i=0;i<200 && cl.life>0;i++){ step(); if (firstLand===null && (cl.bounces||0) >= 1) firstLand = cl.x; }
      summons = []; projectiles = []; worldPlats = [];
      return { boxStart: boxStart, boxEnd: eb, wallMid: wall ? wall.x + wall.w/2 : null, clStart: clStart, clLand: firstLand };
    })()`);
    expect(r.boxStart.vx, 'the way Springy faces (left)').toBeLessThan(0);
    expect(r.boxEnd.x).toBe(r.boxStart.warnX);
    expect(r.wallMid, 'and the wall stands on the shadow').toBe(r.boxStart.warnX);
    expect(r.clStart.vx, 'the Spring! Clone keeps its own hop').not.toBe(0);
    expect(Math.abs(r.clLand - r.clStart.warnX), 'and lands on its shadow (it used to land ~2.6 px a frame off it)').toBeLessThan(3);
  });

  // MePhone4S's POISONED COOKIES! fell on a slant and waited on their shadows; the owner cut them for HASTA LA VISTA! (boss-overhaul-decisions.md Round 8: "HASTA LA VISTA! (in place
  // of the cut POISONED COOKIES!)"), so what is left of this one is the rule for what is NOT a drop: a mine that waits, his rising spikes and lobbed lemon, Springy's marks.
  it("a mine that waits, a rising spike, MePhone4S's lobbed lemon and Springy's marks are not falling", () => {
    const r = W.eval(`(function(){ ${STAGE('MePhone4S', 300)} ${FOLLOW}
      f.x = 100; f.invuln = 1e9; b.x = 200; b.face = 1; b._s4 = null; b.y = groundY() - b.r; projectiles = [];   // (he is still dropping in from above when the stage is set)
      b._aimX = 600; b._aimY = groundY(); b._telPh = 1; b._s4 = { k:'vista' }; BOSS_MOVES.s4vista(b, null);
      var lemon = projectiles.find(function(p){ return p.shape==='lemon'; }), lemonSlant = lemon.x + lemon.vx*S4.lemon.T, lemonVy = lemon.vy;
      projectiles = []; b._s4 = null;
      var mine = addProj({ owner:f.idx, ownerObj:f, x:500, y:groundY()-10, vx:0, vy:0, trap:true, arm:24, _mine:true, r:14, life:100 });
      worldPlats = [{ x:300, y:groundY()-160, w:300, h:14 }];
      var spikes = []; s4DeathTrap(b, ++BOSS_ATK_ID); projectiles.forEach(function(p){ if (p.shape==='spike') spikes.push({ x:p.x, warnX:p.warnX, vx:p.vx }); });
      projectiles = []; springySlamStart(Object.assign({}, b, { attack:'springy', _telPh:1 }), { x:640, dead:false }, ++BOSS_ATK_ID);
      var mark = projectiles.find(function(p){ return p.springMark; }), hole = springyHole(333, 1, ++BOSS_ATK_ID);
      var out = { lemonSlant: lemonSlant, lemonVy: lemonVy, mineVx: mine.vx, mineX: mine.x, spikes: spikes, mark: [mark.x, mark.vx], hole: [hole.x, hole.vx] };
      summons = []; projectiles = []; worldPlats = [];
      return out;
    })()`);
    expect(r.lemonVy, 'thrown up and over, so no drop').toBeLessThan(0);
    expect(r.lemonSlant, 'and it lands where it was aimed with no fall drift on it: its start plus its speed over its flight is the spot').toBeCloseTo(600, 4);
    expect([r.mineVx, r.mineX], 'a mine set down to wait stays put').toEqual([0, 500]);
    expect(r.spikes.length).toBeGreaterThan(0);
    expect(r.spikes.every((s) => s.x === s.warnX && Math.abs(s.vx) === 0.6), 'a spike that rises keeps its own lean').toBe(true);
    expect(r.mark, 'his landing mark stays on its spot').toEqual([640, 0]);
    expect(r.hole).toEqual([333, 0]);
  });

  it("the crusher is a piston, not a fall (noDrift); Tree's branch still drops straight", () => {
    const r = W.eval(`(function(){ ${STAGE('Announcer', 700)}
      b.x = 300; b.hp = b.maxHp*0.2; b._phase = 3; projectiles = [];
      fireBossAttack(b, f);
      var crusher = projectiles.find(function(p){ return p.r===34; });
      SETTINGS.mode='ffa'; summons=[]; projectiles=[]; worldPlats=[];
      var T = makeFighter(ROSTER.find(function(r){ return r.name==='Tree'; }), 300, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 460, groundY()-24, 1);
      T.team=0; D.team=1; T.face=1; T.controller='still'; D.controller='still'; fighters=[T,D];
      step(); T.spCd=0; T.dropCd=0; projectiles=[];
      fireSpecial(T, {}); var branch = projectiles.filter(function(p){ return p.owner===T.idx && p.warnX!=null; })[0];
      var out = { crusher: crusher ? [crusher.vx, crusher.x === crusher.warnX] : null, branch: branch ? [branch.vx, branch.x === branch.warnX] : null };
      projectiles = []; return out;
    })()`);
    expect(r.crusher).toEqual([0, true]);
    expect(r.branch).toEqual([0, true]);
  });

  it('a loose item from the sky drifts toward the middle of the stage and lands on the spot it was rolled for', () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='ffa'; running=true; fighters=[]; summons=[]; projectiles=[]; worldPlats=[];
      var gy = groundY(), mk = function(x){ return itemFallDrift({ kind:'heal', x:x, y:-40, vx:0, vy:0, r:16, taken:false, life:1800, _land:false }, gy); };
      var L = mk(200), R = mk(WW-200), start = [L.x, L.vx, R.x, R.vx];
      items = [L, R]; var moving = true;
      for (var i=0;i<200 && !(L._land && R._land);i++){ updateItems(); if (!L._land && !(L.vx > 0)) moving = false; }
      var out = { start: start, L: [L.x, L.vx, L._land], R: [R.x, R.vx, R._land], moving: moving, WW: WW };
      items = []; return out;
    })()`);
    expect(r.start[1], 'the left one drifts right, toward the middle').toBeGreaterThan(0);
    expect(r.start[3], 'the right one left').toBeLessThan(0);
    expect(r.moving).toBe(true);
    expect(r.L[2] && r.R[2]).toBe(true);
    expect(Math.abs(r.L[0] - 200), 'on its spot').toBeLessThan(1);
    expect(Math.abs(r.R[0] - (r.WW - 200))).toBeLessThan(1);
    expect([r.L[1], r.R[1]], 'and still once it lands').toEqual([0, 0]);
  });
});

describe('BOSS_ARENA_GROUND: each arena its own ground', () => {
  it('an arena with an entry lays its fill, its floor line and its pattern; without one the ground is exactly as it was', () => {
    const { w, log } = bootRecording();
    const setup = `SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow(); running=false;`;
    w.eval(setup);
    const gy = w.eval('groundY()'), ground = w.eval('stage.ground');
    const groundFill = () => log.filter((e) => e.op === 'fillRect' && e.args[0] === -20 && e.args[1] === gy).map((e) => e.fill);
    const floorLine = () => log.filter((e) => e.op === 'stroke' && e.stroke !== undefined).map((e) => e.stroke);
    log.length = 0; w.eval('draw()');
    expect(groundFill()).toEqual([ground]);
    expect(w.eval('BOSS_ARENA_GROUND.studio'), 'no arena has one yet: the builders lay them').toBe(undefined);
    w.eval(`window.__pat = [];
      BOSS_ARENA_SKY.__kit = ['#101010', '#202020'];
      BOSS_ARENA_GROUND.__kit = { fill:'#123456', line:'#abcdef', pattern:function(c, gy, x0, x1, bottom, G){ window.__pat.push([gy, x0, x1, bottom > gy, G.fill]); c.fillRect(0, gy + 10, 5, 5); } };
      BOSS_ARENA = '__kit';`);
    log.length = 0; w.eval('draw()');
    expect(groundFill()).toEqual(['#123456']);
    expect(w.eval('window.__pat')).toEqual([[gy, -20, w.eval('WW') + 20, true, '#123456']]);
    expect(floorLine()).toContain('#abcdef');
    expect(w.eval('impactOpts({}).color === null && impactGroundColor() !== impactTint(stage.ground, 0.35)'), 'the dust takes the arena\'s ground').toBe(true);
    w.eval('BOSS_ARENA = null; delete BOSS_ARENA_GROUND.__kit; delete BOSS_ARENA_SKY.__kit;');
    log.length = 0; w.eval('draw()');
    expect(groundFill()).toEqual([ground]);
  });
});

describe('the stage\'s clouds stay out from under a roof', () => {
  it('a roofed arena (BOSS_ARENA_ROOFED) draws none of the four drifting clouds; an open arena and a plain stage keep them', () => {
    // Four's builder, after the late batch (2026-10-01): the stage's clouds drifted across Eternal Algebra Class, a room.
    // Every arena still paints its own sky; only the generic clouds stop where there is no open sky.
    const { w, log } = bootRecording();
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow(); running=false;`);
    const clouds = () => log.filter((e) => e.op === 'ellipse' && e.fill === '#ffffff55' && e.args[2] === 40 && e.args[3] === 18).length;
    log.length = 0; w.eval('draw()');
    expect(clouds(), 'a plain stage').toBe(4);
    for (const k of ['exitclass', 'fourest', 'warehouse', 'hive', 'meeplehq']) {
      w.eval(`BOSS_ARENA = '${k}'`); log.length = 0; w.eval('draw()');
      expect(clouds(), k).toBe(0);
    }
    w.eval(`BOSS_ARENA = 'volcano'`); log.length = 0; w.eval('draw()');
    expect(clouds(), 'the volcano is outdoors').toBe(4);
    w.eval('BOSS_ARENA = null');
  });
});

describe('BOSS_ARENA_HAZARD: a clean way for an arena to run a hazard', () => {
  it('steps while its boss stands, draws under and over the fighters, and hurts only as a capped boss hit', () => {
    const r = W.eval(`(function(){ ${STAGE('Announcer', 500)}
      window.__hzDraw = [];
      BOSS_ARENA_HAZARD.__hz = {
        step: function(b, H, tgt){ H.n = (H.n||0) + 1; if (!H.id) H.id = ++BOSS_ATK_ID; if (tgt){ tgt.invuln = 0; if (arenaHazardHit(tgt, 0.6, 3, -8, H.id)) H.hits = (H.hits||0) + 1; } },
        draw: function(b, H, layer){ window.__hzDraw.push([layer, b ? b.name : null, H.n || 0]); } };
      BOSS_ARENA = '__hz'; f.pct = 0;
      for (var i=0;i<5;i++){ step(); f.invuln = 0; }
      var H = b._hz, pct = f.pct;
      drawArenaHazard('under'); drawArenaHazard('over');
      var snap = JSON.parse(JSON.stringify(serializeState())).summons.find(function(m){ return m.type==='boss'; });
      b.hp = 0; var n0 = H.n; arenaHazardStep(b, f);
      var dead = H.n === n0;
      summons = []; drawArenaHazard('under');
      var out = { n: n0, hits: H.hits, pct: pct, cap: bossDmg(), draws: window.__hzDraw, snapHz: snap._hz, dead: dead,
                  none: arenaHazardOf('studio') === null && arenaHazardOf(undefined) === null };
      delete BOSS_ARENA_HAZARD.__hz; BOSS_ARENA = null; projectiles = [];
      return out;
    })()`);
    expect(r.n, 'once a frame, five frames').toBe(5);
    expect(r.hits, 'it lands through applyHit...').toBeGreaterThan(1);
    expect(r.pct, '...under one attack id: at most one boss hit however long you stand in it').toBeCloseTo(r.cap, 6);
    expect(r.draws.slice(0, 2)).toEqual([['under', 'Announcer', 5], ['over', 'Announcer', 5]]);
    expect(r.draws[2], 'between bosses it is drawn with no boss').toEqual(['under', null, 0]);
    expect(r.snapHz, 'its state rides the snapshot').toMatchObject({ n: 5 });
    expect(r.dead, 'a fallen boss\'s hazard stops').toBe(true);
    expect(r.none).toBe(true);
  });

  it('draw() runs both layers of the arena hazard', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){ SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow(); running=false;
      var layers = []; BOSS_ARENA_SKY.__hz = ['#000000', '#111111'];
      BOSS_ARENA_HAZARD.__hz = { draw: function(b, H, layer){ layers.push(layer); } }; BOSS_ARENA = '__hz';
      draw(); delete BOSS_ARENA_HAZARD.__hz; delete BOSS_ARENA_SKY.__hz; BOSS_ARENA = null; return layers; })()`);
    expect(r).toEqual(['under', 'over']);
  });
});

describe('BOSS_ENDINGS: every boss gets an exit scene', () => {
  it("Springy's is his, exactly as before: the sweep, the lava and MeLife scene, his line and SPRINGY_SQUARE_MS", () => {
    const r = W.eval(`({ hold: BOSS_ENDINGS.springy.holdMs === SPRINGY_SQUARE_MS, line: BOSS_ENDINGS.springy.line, begin: BOSS_ENDINGS.springy.begin === springyEnding,
      keys: Object.keys(BOSS_ENDINGS) })`);
    expect(r.hold).toBe(true);
    expect(r.line).toBe("We're square.");
    expect(r.begin).toBe(true);
    // "Endings: 'All of them'" (the owner, 2026-09-29): the early six put theirs in their ENDING slots as they are rebuilt (the Announcer's is
    // 'announcer', test/boss-announcer.test.js; Firey Speaker Box's is 'firewall', "broken into 7 pieces", test/boss-firey-sb.test.js; Purple
    // Face's is 'swallow', test/boss-purple-face.test.js; the Bug Swarm's is 'swarm', test/boss-bug-swarm.test.js; Puffball Speaker Box's is
    // 'soundwave', test/boss-puffball.test.js; the Purple Dragon's is 'dragon', it waves back and flies away, test/boss-dragon.test.js) -- so Springy's stays first and nothing but the early six's attack keys joins it.
    expect(r.keys[0], "Springy's is first").toBe('springy');
    expect(r.keys, 'the rebuilt ones have theirs').toEqual(expect.arrayContaining(['springy', 'announcer', 'firewall', 'swallow', 'swarm', 'soundwave', 'dragon', 'mephone4s']));
    // ...and the late five as THEY are rebuilt: Evil Leafy's is 'evilleafy', she freezes and shatters ("Golf Ball uses freeze juice to freeze Evil Leafy ... Coiny ... throws [a monitor] at her, shattering and killing her", She Deserves This; test/boss-evilleafy.test.js)
    // ...and the late five's as they are rebuilt: MePhone4's is 'mephone', "Short-Circuited" while his Fist Thingy waves goodbye with a tissue (test/boss-mephone4.test.js)
    // ...and MePhone4S's is 'mephone4s': the Fist Thingy punches him into a cage (test/boss-mephone4s.test.js)
    expect(r.keys.filter((k) => k !== 'springy').every((k) => ['announcer', 'soundwave', 'firewall', 'swarm', 'swallow', 'dragon', 'four', 'two', 'evilleafy', 'mephone', 'mephone4s'].includes(k)), 'only the rebuilt bosses join him (the early six; Four, multiplied by zero, test/boss-four.test.js; Two, his landing pad, test/boss-two.test.js; Evil Leafy, frozen and shattered, test/boss-evilleafy.test.js; MePhone4, short-circuited, test/boss-mephone4.test.js; and MePhone4S, punched into a cage, test/boss-mephone4s.test.js): ' + r.keys).toBe(true);
  });

  it('an ending sweeps, plays where the boss fell, and holds the BOSS DOWN card and the next boss back by its length -- with no text', () => {
    const r = W.eval(`(function(){ ${STAGE('Purple Face', 300)}
      var st = setTimeout, timers = [], said = [], _b = banner;
      setTimeout = function(fn, ms){ timers.push({ fn: fn, ms: ms }); return 0; };
      banner = function(t, m, k, l){ said.push([String(t), k || null]); return _b(t, m, k, l); };
      try {
        BOSSRUSH.active = true; var swept = 0, fell = null;
        BOSS_ENDINGS.__end = { sweep: function(){ swept++; }, begin: function(boss){ fell = [boss.name, boss.x]; summons.push({ type:'__endfx', name:'', x:boss.x, y:boss.y, r:0, hp:0, maxHp:0, life:60 }); }, holdMs: 800 };
        b.attack = '__end'; b.hp = 0; bossRushCheck();
        var saidNow = said.slice(), ms = timers.map(function(t){ return t.ms; });
        var card = timers.find(function(t){ return t.ms === 800; }), run0 = running;
        running = true; if (card) card.fn(); running = run0;
        var out = { swept: swept, fell: fell, scene: summons.some(function(s){ return s.type==='__endfx'; }), ms: ms, saidNow: saidNow, after: said.slice(saidNow.length), bx: b.x };
        // and a boss with no ending: the card at once, the next boss after 1.5 s, as it always was. (This was the Bug Swarm until
        // he got his -- "Endings: 'All of them'" -- so it is any boss whose attack has no BOSS_ENDINGS row, whichever those are.)
        ${STAGE('Purple Face', 300)} b.attack = '__plain'; timers = []; said = []; BOSSRUSH.active = true; b.hp = 0; bossRushCheck();
        out.plainMs = timers.map(function(t){ return t.ms; }); out.plainSaid = said.slice();
        return out;
      } finally { setTimeout = st; banner = _b; delete BOSS_ENDINGS.__end; BOSSRUSH.active = false; summons = []; projectiles = []; }
    })()`);
    expect(r.swept).toBe(1);
    expect(r.fell).toEqual(['Purple Face', r.bx]);
    expect(r.scene, 'its scene is on the stage').toBe(true);
    expect(r.ms, 'the card after 0.8 s, the next boss after 1.5 + 0.8').toEqual(expect.arrayContaining([800, 2300]));
    expect(r.saidNow.some(([t]) => /BOSS DOWN/.test(t)), 'the card waits').toBe(false);
    expect(r.saidNow.some(([, k]) => k === 'boss'), 'no text: only Springy\'s ending has a line').toBe(false);
    expect(r.after.some(([t, k]) => /^BOSS DOWN!/.test(t) && k === 'sys')).toBe(true);
    expect(r.plainMs).toEqual(expect.arrayContaining([1500]));
    expect(r.plainMs).not.toContain(2300);
    expect(r.plainSaid.some(([t, k]) => /^BOSS DOWN!/.test(t) && k === 'sys'), 'at once').toBe(true);
  });
});

describe("the Announcer's phase-3 banner", () => {
  it('names CRUSHER ARM in phase 3 (it said CAKE AT STAKE!), BUDGET CUTS in 2, CAKE AT STAKE in 1', () => {
    const r = W.eval(`[1, 2, 3].map(function(ph){ return bossTelName({ attack:'announcer', _phase:ph }); })`);
    expect(r).toEqual(['CAKE AT STAKE!', 'BUDGET CUTS!', 'CRUSHER ARM!']);
  });

  it('and the wind-up an Announcer at a third of his HP starts is announced as CRUSHER ARM!', () => {
    const r = W.eval(`(function(){ ${STAGE('Announcer', 500)}
      b.hp = b.maxHp*0.2; b._phase = 3; b._pickForce = 'announcer'; b._atkLive = null; b._atkTimer = 1; b._tel = 0;   // (the signature asked for: his order is the picker's now, Round 17)
      window.__lastBanner = null; updateBossAttack(b, f);
      var out = { kind: b._telKind, text: window.__lastBanner && window.__lastBanner.text, telKind: window.__lastBanner && window.__lastBanner.kind };
      summons = []; projectiles = []; return out;
    })()`);
    expect(r).toEqual({ kind: 'announcer', text: 'CRUSHER ARM!', telKind: 'boss' });
  });
});

// THE SLOT MARKERS. The early six (the first batch) and the late five (the second: MePhone4, Evil Leafy, MePhone4S, Two and Four -- two of the names have
// a digit in them, so a marker's boss is [a-z0-9]+).
const EARLY = ['announcer', 'puffball', 'firey', 'swarm', 'purpleface', 'dragon'];
const LATE = ['mephone4', 'evilleafy', 'mephone4s', 'two', 'four'];
const SLOTS = ['roster', 'extra', 'rushonly', 'pick', 'movename', 'moves', 'helpers', 'spawn', 'move', 'tick', 'tel', 'fire', 'gap', 'tellen',
  'phase', 'phasename', 'telname', 'ending', 'hazard', 'netshot', 'net', 'shotdraw', 'fx', 'look', 'tell', 'body', 'sky', 'ground',
  'decor', 'sprite', 'flip', 'shape', 'art'];   // `pick` (the picker's tags and hooks, BOSS_PICK) is the owner's Round 17: "make the attacks based on fighter position."
const MARK = /@boss:([a-z0-9]+):(begin|end) ([a-z]+)/;

// Every marker in `file` must be a known boss's and slot's, alone on its line; and for each slot the pairs of `bosses` (the early six unless said) must be
// there once, begin before end, with no other marker inside, in the order given, and a line between a pair and the one before it.
function check(file, slots, bosses = EARLY) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  const marks = [];
  lines.forEach((l, i) => { const m = l.match(MARK); if (m) marks.push({ i, boss: m[1], kind: m[2], slot: m[3], line: l.trim() }); });
  const problems = [];
  for (const m of marks) {
    if (![...EARLY, ...LATE].includes(m.boss)) problems.push(`${file}:${m.i + 1} unknown boss ${m.boss}`);
    if (!slots.includes(m.slot)) problems.push(`${file}:${m.i + 1} unknown slot ${m.slot}`);
    if (!/^(\/\/|<!--) @boss:[a-z0-9]+:(begin|end) [a-z]+( -->)?$/.test(m.line)) problems.push(`${file}:${m.i + 1} a marker is alone on its line: "${m.line}"`);
  }
  for (const slot of slots) {
    let prevEnd = -1;
    for (const boss of bosses) {
      const b = marks.filter((m) => m.slot === slot && m.boss === boss && m.kind === 'begin');
      const e = marks.filter((m) => m.slot === slot && m.boss === boss && m.kind === 'end');
      if (b.length !== 1 || e.length !== 1) { problems.push(`${slot}/${boss}: ${b.length} begin, ${e.length} end`); continue; }
      const bi = b[0].i, ei = e[0].i;
      if (!(bi < ei)) problems.push(`${slot}/${boss}: end before begin`);
      const inside = marks.filter((m) => m.i > bi && m.i < ei);
      if (inside.length) problems.push(`${slot}/${boss}: another marker inside (${inside[0].line})`);
      if (!(bi > prevEnd)) problems.push(`${slot}/${boss}: out of order`);
      if (prevEnd >= 0 && bi - prevEnd < 2) problems.push(`${slot}/${boss}: no line between it and the pair before`);
      prevEnd = ei;
    }
  }
  return { problems, count: marks.filter((m) => bosses.includes(m.boss)).length };
}

describe('the slot markers: six builders, one file, no conflicts', () => {
  const BOSSES = EARLY;   // the late five have their own describe below

  it('index.html: every slot has one pair per boss, balanced, in gauntlet order, each on its own lines with a line between pairs', () => {
    const r = check('artifacts/V1/index.html', SLOTS);
    expect(r.problems).toEqual([]);
    expect(r.count).toBe(SLOTS.length * BOSSES.length * 2);
  });

  it('the art manifest and the credits have their pairs too', () => {
    const a = check('scripts/fetch-attack-sprites.mjs', ['picks']);
    const c = check('artifacts/V1/assets/sprites/CREDITS.md', ['credits']);
    expect(a.problems).toEqual([]);
    expect(c.problems).toEqual([]);
    expect([a.count, c.count]).toEqual([12, 12]);
  });

  it('the header at the top of the boss code lists every slot and states the rule', () => {
    const html = readFileSync('artifacts/V1/index.html', 'utf8');
    const head = html.slice(html.indexOf('// ==== BOSS SLOTS'), html.indexOf('const BOSS_ROSTER'));
    expect(head.replace(/\r?\n\/\/\s*/g, ' ')).toContain('THE RULE: a builder edits only inside its own markers');
    for (const s of SLOTS) expect(head, `the header names ${s}`).toMatch(new RegExp(`//\\s+${s}\\s{2,}`));
  });

  // With every slot still holding only what was there, the six fight exactly as they did: each signature and each second
  // move fires real boss shots (or, for Purple Face, swallows), a wind-up names the move, and a phase is announced.
  // (The Purple Dragon is not in this loop any more: "the bosses should have more attacks the later they get" -- its five are flights and scenes, a roar's shove
  // and dive, a run's shadow, a lottery's door, that land no shot on the frame the wind-up ends. test/boss-dragon.test.js reads each one over its whole length.)
  for (const name of ['Announcer', 'Puffball Speaker Box', 'Firey Speaker Box', 'The Bug Swarm', 'Purple Face']) {
    it(`${name} still fights as it did, through its slots`, () => {
      const r = W.eval(`(function(){ ${STAGE(name, 500)}
        var out = { tel: [], shots: [], phase: null };
        // the owner, 2026-10-01 (Round 17): "make the attacks based on fighter position." -- no fixed cycle (signature, second move, signature), so the three turns are forced: the same three as before
        var KS = bossPickMoves(b, 1), SEQ = [KS[0], KS[1], KS[0]];
        b.x = 350; b._atkTimer = 1;
        for (var t=0;t<3;t++){
          b._pickForce = SEQ[t]; b._atkLive = null;
          b._fs = null; b._fsQ = 0;   // Firey Speaker Box's moves run for seconds (fsbMove) and the next wind-up waits for the last: each turn here starts from a settled boss, as the game's do
          // the Announcer's next wind-up waits for the last threat of the turn before and for 30 frames more (the owner, 2026-10-01: "for the announcer "unavoidable hits", theyre unavoidable bcs they
          // barely have a moment where you can move to dodge."): this test fires turn after turn, so it settles him -- nothing of his going, and none for a long while -- as it does the two above
          if (b.attack === 'announcer') { projectiles = []; b._lanes = null; b._bl = null; b._q = []; b._calm = 999; b._hz.cc = 999; }
          window.__lastBanner = null; b._atkTimer = 1; b._tel = 0; updateBossAttack(b, f);
          out.tel.push(window.__lastBanner && window.__lastBanner.text);
          projectiles = []; f.invuln = 0; b._tel = 1e-3; updateBossAttack(b, f);   // (the last sliver of a wind-up: it fires on this update at any BOSS_TEL_PACE)
          // a rebuilt boss's turn can run for a while after it fires (Puffball Speaker Box dashes, then cuts): watch a second more
          var most = projectiles.filter(function(p){ return p.owner===-2; }).length;
          for (var k=0;k<60;k++){ updateBossAttack(b, f); most = Math.max(most, projectiles.filter(function(p){ return p.owner===-2; }).length); }
          out.shots.push(most + (f._swallow > 0 ? 100 : 0) + (b._pf && b._pf.lunge ? 1000 : 0));
          fighters.forEach(function(q){ q._swallow = 0; });
          if (b._pf) b._pf.lunge = null;   // Purple Face's AD BREAK! is a lunge that outlasts its turn (a lunge under way counts as landing: 1000) and the next wind-up waits for it; this test fires turn after turn, so it ends each one as it starts
        }
        window.__lastBanner = null; b.hp = b.maxHp*0.5; b._tel = 0; b._atkTimer = 999; updateBossAttack(b, f);
        out.phase = window.__lastBanner && window.__lastBanner.text;
        summons = []; projectiles = []; return out;
      })()`);
      expect(r.tel.every((t) => typeof t === 'string' && /!$/.test(t)), `each wind-up is named: ${r.tel}`).toBe(true);
      expect(r.shots.every((n) => n > 0), `each turn lands something: ${r.shots}`).toBe(true);
      expect(r.phase).toMatch(new RegExp(`^${name} — PHASE 2: `));
    });
  }
});

// ---- THE LATE FIVE (the second batch: MePhone4, Evil Leafy, MePhone4S, Two and Four) ---------------------------------------
// The same kit the early six were rebuilt on: a pair of markers in every slot, so five builders can work at once and their work
// merges without a conflict. What each boss already had in a slot was moved inside its own pair and not otherwise touched.
describe("the late five's slots: MePhone4, Evil Leafy, MePhone4S, Two and Four, ready to be rebuilt the way the early six were", () => {
  const FILE = 'artifacts/V1/index.html';
  const lines = () => readFileSync(FILE, 'utf8').split(/\r?\n/);
  const at = (L, slot, boss, kind) => L.findIndex((l) => l.trim() === `// @boss:${boss}:${kind} ${slot}`);
  const body = (L, slot, boss) => L.slice(at(L, slot, boss, 'begin') + 1, at(L, slot, boss, 'end')).join('\n');

  it("every slot has one pair for each of the five, balanced, in the gauntlet's order, each on its own lines with a line between pairs -- after the early six's pairs", () => {
    const r = check(FILE, SLOTS, LATE);
    expect(r.problems).toEqual([]);
    expect(r.count).toBe(SLOTS.length * LATE.length * 2);
    expect(check(FILE, SLOTS, EARLY).count + r.count, 'the six, the five and nothing else').toBe(SLOTS.length * 11 * 2);
    const L = lines();
    for (const slot of SLOTS.filter((s) => s !== 'roster')) {
      expect(at(L, slot, 'mephone4', 'begin'), `${slot}: the five come after the Dragon's pair`).toBeGreaterThan(at(L, slot, 'dragon', 'end'));
    }
    // BOSS_ROSTER is the gauntlet itself, so its pairs keep the gauntlet's order: the Dragon is Boss 9, between MePhone4S and Two
    const gauntlet = ['announcer', 'puffball', 'firey', 'swarm', 'purpleface', 'mephone4', 'evilleafy', 'mephone4s', 'dragon', 'two', 'four'];
    const rows = gauntlet.map((b) => at(L, 'roster', b, 'begin'));
    expect(rows.every((n) => n > 0)).toBe(true);
    expect(rows, "the roster's pairs sit in the gauntlet's order").toEqual([...rows].sort((a, c) => a - c));
  });

  it('the art manifest and the credits have their five pairs too', () => {
    const a = check('scripts/fetch-attack-sprites.mjs', ['picks'], LATE);
    const c = check('artifacts/V1/assets/sprites/CREDITS.md', ['credits'], LATE);
    expect(a.problems).toEqual([]);
    expect(c.problems).toEqual([]);
    expect([a.count, c.count]).toEqual([10, 10]);
  });

  it('the header lists the five and what the gap slot is for', () => {
    const html = readFileSync(FILE, 'utf8');
    const head = html.slice(html.indexOf('// ==== BOSS SLOTS'), html.indexOf('const BOSS_ROSTER')).replace(/\r?\n\/\/\s*/g, ' ');
    for (const w of ['mephone4 (MePhone4)', 'evilleafy (Evil Leafy)', 'mephone4s (MePhone4S)', 'two (Two)', 'four (Four)']) expect(head, `the header names ${w}`).toContain(w);
    expect(head, 'the gap slot is in bossAtkGapBase; bossAtkGap is the paced one').toMatch(/gap\s+bossAtkGapBase: /);
  });

  // What each of the five already had in a slot is inside its own pair now: the lines were moved, not changed.
  const HOLDS = {
    roster: { mephone4: ['attack:"mephone",'], evilleafy: ['attack:"evilleafy",'], mephone4s: ['attack:"mephone4s",'], two: ['attack:"two",'], four: ['attack:"four",'] },
    extra: { mephone4: ['"MePhone4": ["melife", "portal", "boomerang", "maze"]'], evilleafy: ['"Evil Leafy": ["elpossess", "elhole", "elbehind"]'], mephone4s: ['"MePhone4S": ["s4prizes", "s4vista", "s4popup", "s4car", "s4shove"]'], two: ['"Two": ["twosun", "twopower", "twoblocks", "tworails", "twoclap"]'] },   // (Four's is rebuilt: test/boss-four.test.js)
    rushonly: { mephone4: ['"melife", "portal", "boomerang", "maze"'], mephone4s: ['"s4prizes", "s4vista", "s4popup", "s4car", "s4shove"'] },
    movename: { mephone4: ['melife:"MELIFE DOWNLOAD!"', 'portal:"REJECTION PORTAL!"', 'boomerang:"BOOMERANGS!"', 'maze:"MAZED AND CONFUSED!"'], mephone4s: ['s4prizes:"ONE OF EACH!"', 's4vista:"HASTA LA VISTA!"', 's4popup:"POP UP!"', 's4car:"I\'LL BE BACK!"', 's4shove:"QUICKSAND SHOVE!"'] },
    moves: { mephone4: ['melife(s, tgt){', 'portal(s, tgt){', 'boomerang(s, tgt){', 'maze(s, tgt){'], mephone4s: ['s4prizes(s, tgt){', 's4vista(s, tgt){', 's4popup(s, tgt){', 's4car(s, tgt){', 's4shove(s, tgt){'] },
    helpers: { mephone4: ['const MEPHONE_GLOVE = ', 'function meLifeDownload(', 'function mpPortalTick('], mephone4s: ['const S4 = ', 'function s4BeginTelegraph(', 'function s4DeathTrap('] },
    move: { evilleafy: ['if(s.attack==="evilleafy"){', 'elMove(s, tgt)', 'applyHit(f, bossDmg()*0.6'] },   // Evil Leafy: the phase-3 vine seeding is the vine curtains now (her hazard); her contact hit is as it was
    tick: { mephone4: ['if(s.attack==="mephone") mpTick(s, tgt);', 'MEPHONE_GLOVE.lock'], mephone4s: ['s4Tick(s, tgt)'], two: ['if(s.attack==="two" && s._ungrounded){'] },
    tel: { mephone4: ['mpBeginTelegraph(s, tgt)'], mephone4s: ['s4BeginTelegraph(s, tgt)'] },
    fire: {
      mephone4: ['if(s.attack==="mephone"){', 'MEPHONE_GLOVE'], evilleafy: ['if(s.attack==="evilleafy"){', 'elTendrilsFire('], mephone4s: ['if(s.attack==="mephone4s"){', 's4Gun('],
      two: ['if(s.attack==="two"){', 'POWER DRAIN!'],
    },
    gap: { mephone4: ['MEPHONE_GAPS[Math.min(3, s._phase||1)]'], evilleafy: ['EL.gaps[elPh(s)]'] },
    tellen: { evilleafy: ['EL.tel[s._telKind]'], mephone4s: ['s4TelLen(s)'] },
    phase: { mephone4: ['meLifeDownload(s, -(s.face||1))'], two: ['TWO SHRINKS!', 'POWER UNGROUNDED'] },
    phasename: { mephone4: ['mephone:'], evilleafy: ['evilleafy:'], mephone4s: ['mephone4s:'], two: ['two:'], four: ['four:'] },
    telname: { mephone4: ['FIST THINGY COMBO!'], evilleafy: ['TENDRILS!'], mephone4s: ['PUT THAT COOKIE DOWN!'], two: ['MIND READ!'] },
    fx: { evilleafy: ['drawTendrils()'] },
    sky: { mephone4: ['elimarea:'], evilleafy: ['forest:'], mephone4s: ['studio:', 'deathtrap:'] },
    decor: { mephone4: ['if(key==="elimarea")'], evilleafy: ['if(key==="forest") elDecor();'], mephone4s: ['if(key==="studio"){', 'if(key==="deathtrap")'] },
    sprite: { mephone4: ['mephone:'], evilleafy: ['evilleafy:'], mephone4s: ['mephone4s:'], two: ['two:'], four: ['four:'] },
    flip: { four: ['four:true'] },
    tell: { mephone4: ['mpDrawTell(s)', 'MEPHONE_GLOVE.lock'], mephone4s: ["typeof s._aimX==='number'"] },
    body: { mephone4: ['case "mephone": {'], evilleafy: ['case "evilleafy": {'], mephone4s: ['case "mephone4s": {'], two: ['case "two": {'], four: ['case "four": {'] },
    shape: { mephone4: ['fistthingy:'], mephone4s: ['s4gun:', 's4saw:', 's4lolli:', 'redcar:'] },
    net: { mephone4s: ['_aimX:m._aimX'] },   // (MePhone4's everything rides _hz: his net slot is a note)
  };

  it('each pair holds what its boss already had in that slot', () => {
    const L = lines(), problems = [];
    for (const slot of Object.keys(HOLDS)) for (const boss of Object.keys(HOLDS[slot])) {
      const text = body(L, slot, boss);
      for (const needle of HOLDS[slot][boss]) if (!text.includes(needle)) problems.push(`${slot}/${boss}: ${needle}`);
    }
    expect(problems).toEqual([]);
  });

  it("and the slots they do not use yet hold no code at all: spawn, shotdraw, ground, look, art, netshot, hazard and ending (Four's ending is a note, for the victory card)", () => {
    const L = lines(), strip = (s) => s.split('\n').map((l) => l.replace(/\/\/.*$/, '').trim()).filter(Boolean);
    // (a rebuilt boss fills the slots it uses: MePhone4S's spawn, shotdraw, ground, art, netshot, hazard and ending, test/boss-mephone4s.test.js)
    const IN_USE = { mephone4s: ['spawn', 'shotdraw', 'ground', 'art', 'netshot', 'hazard', 'ending'] };
    for (const slot of ['spawn', 'shotdraw', 'ground', 'look', 'art', 'netshot', 'hazard', 'ending']) for (const boss of LATE.filter((b) => b !== 'four')) {   // (Four is rebuilt: he uses every one of them)
      if (boss === 'two') continue;   // Two is rebuilt (the boss overhaul): every one of those is his now (test/boss-two.test.js)
      if (boss === 'evilleafy') continue;   // rebuilt (the boss overhaul): her ground, hazard, art and ending are in them (test/boss-evilleafy.test.js)
      if (boss === 'mephone4') continue;   // MePhone4 is rebuilt (the boss overhaul): test/boss-mephone4.test.js
      if ((IN_USE[boss] || []).includes(slot)) continue;
      expect(strip(body(L, slot, boss)), `${slot}/${boss}`).toEqual([]);
    }
  });

  it('the numbers and names the five had are the ones they have: the gaps before the pace, the wind-ups, the banners, the phase names and the second moves', () => {
    const r = W.eval(`(function(){
      var A = { mephone:'MePhone4', evilleafy:'Evil Leafy', mephone4s:'MePhone4S', two:'Two', four:'Four' }, out = {};
      Object.keys(A).forEach(function(k){
        out[k] = { base: [1,2,3].map(function(ph){ return bossAtkGapBase({ attack:k, _phase:ph }); }), tel: bossTelLen({ attack:k, _phase:1 }),
          name1: bossTelName({ attack:k, _phase:1, _telPh:1 }), name2: bossTelName({ attack:k, _phase:2, _telPh:2 }),
          p2: bossPhaseName({ attack:k }, 2), p3: bossPhaseName({ attack:k }, 3), extra: BOSS_EXTRA[A[k]] };
      });
      return out; })()`);
    // MePhone4: the glove is the combo from phase 1 -- "MePhone4: FIST THINGY! combo from P1" (the owner's difficulty picks, Round 17, 2026-10-01) -- so its warning names the combo in every phase
    // (name1 was 'FIST THINGY!' while phase 1 threw one glove)
    expect(r.mephone).toEqual({ base: [76, 56, 44], tel: 36, name1: 'FIST THINGY COMBO!', name2: 'FIST THINGY COMBO!', p2: 'Back and Forth', p3: 'Glitching', extra: ['melife', 'portal', 'boomerang', 'maze'] });
    // Evil Leafy, rebuilt: her own gaps (phase 3's 80, was 70: the vine curtains press for her -- "if it makes sense for a hazard, reduce boss difficulty and add a hazard", the owner), TENDRILS!'s
    // wind-up of 56 ("1 needs a better telegraph.") and her own three second moves in place of the shared SEEKERS! and GROUND POUND! (test/boss-evilleafy.test.js has the fight)
    expect(r.evilleafy).toEqual({ base: [130, 95, 80], tel: 56, name1: 'TENDRILS!', name2: 'TENDRILS!', p2: 'No Refuge', p3: 'Vine Coverage', extra: ['elpossess', 'elhole', 'elbehind'] });
    // rebuilt (the boss overhaul, Rounds 8 and 10), on the usual 100/72/52: his builder gave him a little longer for his hazard, but he then measured easier than
    // MePhone4 before him, and asked, the owner chose "Make MePhone4S harder" (2026-10-01) -- the usual gaps
    // -- and his five second moves are his own ("PUT THAT COOKIE DOWN! (redone), I'LL BE BACK!, ONE OF EACH!, HASTA LA VISTA!, POP UP!, QUICKSAND SHOVE!")
    expect(r.mephone4s).toEqual({ base: [100, 72, 52], tel: 42, name1: 'PUT THAT COOKIE DOWN!', name2: 'PUT THAT COOKIE DOWN!', p2: "I'll Be Back", p3: 'Super Death Trap', extra: ['s4prizes', 's4vista', 's4popup', 's4car', 's4shove'] });
    // Two, rebuilt: his phase-3 gap is 60, not 52 (the derailed coaster is the park's hazard now: "if it makes sense for a hazard, reduce boss difficulty and add a hazard.", the owner, 2026-09-29), and his second moves are his own five
    expect(r.two).toEqual({ base: [180, 150, 130],   // "nerf two": "Longer gaps between turns" (the owner, 2026-10-03; they were 100 / 72 / 60)
       tel: 36, name1: 'MIND READ!', name2: 'MIND READ!', p2: 'Size Shift', p3: 'Power Ungrounded — ground it to damage them!', extra: ['twosun', 'twopower', 'twoblocks', 'tworails', 'twoclap'] });
    // Four, rebuilt (the boss overhaul): his gaps eased a shade for the hills and sparks of his room ("if it makes sense for a hazard, reduce boss difficulty and add a hazard"), his own five
    expect(r.four).toEqual({ base: [104, 78, 56], tel: 50, name1: 'SCREECHY!', name2: 'SCREECHY!!', p2: 'Zap to Dust', p3: 'Reality Buckles', extra: ['fourbye', 'fourtower', 'fourido', 'fourhearts', 'fourcactus'] });
  });

  // With every slot holding what was there, the five fight as they did: a wind-up names the move, each turn lands something (a shot, a tendril, an add, a
  // portal), and a phase begins. (The early six have their own tests: test/boss-announcer.test.js and the rest.)
  // (Evil Leafy is not in this loop any more: rebuilt, her four are vines, a possessed platform, a void and a burst out of a tree that land no shot on the frame the wind-up ends --
  // test/boss-evilleafy.test.js reads each one over its whole length.)
  for (const name of ['MePhone4', 'MePhone4S', 'Two']) {   // (Four is rebuilt: test/boss-four.test.js reads each of his six over its whole length)
    it(`${name} still fights as he did, through his slots`, () => {
      const r = W.eval(`(function(){ ${STAGE(name, 500)}
        var out = { tel: [], landed: [], phase: null };
        // the owner, 2026-10-01 (Round 17): "make the attacks based on fighter position." -- no fixed cycle (signature, second move, signature), so the three turns are forced: the same three as before
        var KS = bossPickMoves(b, 1), SEQ = [KS[0], KS[1], KS[0]];
        b.x = 350; b._atkTimer = 1; b._s4 = null;   // (MePhone4S drops in from above and holds his timer for his scripted moves: each turn here starts from a settled one, as the game's do)
        for (var t=0;t<3;t++){
          b._pickForce = SEQ[t]; b._atkLive = null;
          window.__lastBanner = null; b._atkTimer = 1; b._tel = 0; b._s4 = null; b.hover = false; b.y = groundY() - b.r; updateBossAttack(b, f);
          out.tel.push(window.__lastBanner && window.__lastBanner.text);
          projectiles = []; tendrils = []; summons = summons.filter(function(s){ return s.type==='boss'; }); f.invuln = 0; f.pct = 0;
          b._tel = 1e-3; updateBossAttack(b, f);   // (the last sliver of a wind-up: it fires on this update at any BOSS_TEL_PACE)
          out.landed.push(projectiles.filter(function(p){ return p.owner===-2; }).length + tendrils.length + summons.filter(function(s){ return s.hostile; }).length + (b._portal ? 1 : 0));
          b._portal = null;
        }
        window.__lastBanner = null; b.hp = b.maxHp*0.5; b._tel = 0; b._atkTimer = 999; updateBossAttack(b, f);
        out.phase = b._phase;
        summons = []; projectiles = []; tendrils = []; return out;
      })()`);
      expect(r.tel.every((t) => typeof t === 'string' && /!$/.test(t)), `each wind-up is named: ${r.tel}`).toBe(true);
      expect(r.landed.every((n) => n > 0), `each turn lands something: ${r.landed}`).toBe(true);
      expect(r.phase).toBe(2);
    });
  }
});

// ---- BOSS_PACE -------------------------------------------------------------------------------------------------------------
describe('BOSS_PACE: every Boss Rush boss waits a fifth longer between its attacks', () => {
  // The owner, 2026-09-30, verbatim: "bosses should attack a bit slower, the bullet pattern thing for the bug swarm(bug tunnel) is too hard. do the next batch."
  it('"bosses should attack a bit slower": one constant, 1.2, on whatever bossAtkGapBase says -- for every boss in the gauntlet, in every phase, the ones whose gaps live in their own slots too', () => {
    const r = W.eval(`(function(){
      var rows = [];
      BOSS_ROSTER.forEach(function(row){ [1,2,3].forEach(function(ph){
        var base = bossAtkGapBase({ attack:row.attack, _phase:ph }), paced = bossAtkGap({ attack:row.attack, _phase:ph });
        rows.push({ name:row.name, ph:ph, base:base, paced:paced, isPaced:bossPaced({ attack:row.attack }) });
      }); });
      return { pace: BOSS_PACE, rows: rows, held: bossAtkGap({ attack:'dragon', _phase:1, _dr:{ k:'run' } }) };
    })()`);
    expect(r.pace).toBe(1.2);
    expect(r.rows.length, 'every boss, three phases each').toBe(3 * 12);
    for (const x of r.rows) {
      expect(x.isPaced, `${x.name} is a Boss Rush boss`).toBe(true);
      expect(x.paced, `${x.name}, phase ${x.ph}: ${x.base} x 1.2`).toBe(Math.round(x.base * 1.2));
      expect(x.paced / x.base, `${x.name}, phase ${x.ph}: about a fifth more`).toBeGreaterThan(1.18);
      expect(x.paced / x.base).toBeLessThan(1.22);
    }
    expect(r.held, "a hold is no gap: the Dragon's 1e6 while a move is in the air is left as it is").toBe(1e6);
  });

  it('One and Steve Cobs are not Boss Rush bosses: they are not in the roster, run their own gaps, and are not slowed', () => {
    const r = W.eval(`({
      paced: ['one', 'cobs', 'cobsfight', 'basic', undefined].map(function(a){ return bossPaced({ attack:a }); }),
      cobs: [1,2,3].map(function(ph){ return [bossAtkGap({ attack:'cobs', _phase:ph }), COBS.gaps[ph]]; }),
      one: [0,1,2,3].map(function(m){ return [oneGap({ _marks:m }), [100, 72, 52, 52][m]]; }),
      oneReads: String(updateOne).indexOf('bossAtkGap'), cobsReads: String(updateCobs).indexOf('bossAtkGap'),
      inRoster: BOSS_ROSTER.some(function(r){ return r.attack === 'one' || r.attack === 'cobs' || r.attack === 'cobsfight'; })
    })`);
    expect(r.paced).toEqual([false, false, false, false, false]);
    for (const [got, want] of r.cobs) expect(got, 'his old Boss-11 gaps (COBS.gaps) are as they were').toBe(want);
    for (const [got, want] of r.one) expect(got, "One's own gaps are as they were").toBe(want);
    expect(r.oneReads, 'updateOne never reads bossAtkGap').toBe(-1);
    expect(r.cobsReads, 'updateCobs never reads bossAtkGap').toBe(-1);
    expect(r.inRoster).toBe(false);
  });

  it("it is applied in one place, and in no slot: bossAtkGap multiplies, and nothing between a pair's markers mentions BOSS_PACE", () => {
    const L = readFileSync('artifacts/V1/index.html', 'utf8').split(/\r?\n/);
    const strip = (l) => l.replace(/\/\/.*$/, '');
    const codeUses = L.filter((l) => /BOSS_PACE/.test(strip(l)));
    expect(codeUses.map((l) => l.trim()), 'the constant and the one place it is used').toEqual([
      'const BOSS_PACE = 1.2;',
      'return (bossPaced(s) && g < 1e5) ? Math.round(g*BOSS_PACE) : g;',
    ]);
    let inside = null; const leaks = [];
    L.forEach((l, i) => {
      const m = l.match(MARK);
      if (m && m[2] === 'begin') inside = m[1] + '/' + m[3];
      else if (m && m[2] === 'end') inside = null;
      else if (inside && /BOSS_PACE/.test(strip(l))) leaks.push(`${i + 1} (${inside})`);
    });
    expect(leaks, 'no slot puts the pace on its own number').toEqual([]);
  });

  it('end to end: when a turn ends, the next attack is a paced gap away -- MePhone4 76 x 1.2, Evil Leafy 130 x 1.2, 100 x 1.2 for MePhone4S, Two\'s own 180 x 1.2, and Four\'s own 104 x 1.2', () => {
    const r = W.eval(`(function(){ var out = {};
      ${STAGE('Four', 500)}
      ['MePhone4', 'Evil Leafy', 'MePhone4S', 'Two', 'Four'].forEach(function(name){
        BOSSRUSH.bossIdx = BOSS_ROSTER.findIndex(function(r){ return r.name === name; });
        summons = []; spawnBossRushBoss(); b = summons.find(function(s){ return s.type==='boss'; }); b._atkTimer = 1e9; b._tel = 1e-3; b._telKind = null;
        updateBossAttack(b, f);
        if (name === 'Evil Leafy'){ out['Evil Leafy held'] = b._atkTimer; elDone(b); }   // her turns run on past the wind-up: the gap is held (1e6) until the move is done, and elDone starts it
        if (name === 'MePhone4'){ out['MePhone4 held'] = b._atkTimer; projectiles = []; mpTick(b, f); }   // his glove turn runs on past the wind-up too since "FIST THINGY! combo from P1" (the owner, Round 17): the finisher waits in the wings, the gap is held (1e6), and mpTick starts it once nothing is left to come
        out[name] = b._atkTimer;
      });
      summons = []; projectiles = []; tendrils = []; return out; })()`);
    expect(r).toEqual({ MePhone4: 91, 'MePhone4 held': 1e6, 'Evil Leafy': 156, 'Evil Leafy held': 1e6, MePhone4S: 120, Two: 216, Four: 125 });   // Two: 180 x 1.2 since "nerf two" (2026-10-03)
  });
});

// ---- FOUR'S VICTORY CARD ---------------------------------------------------------------------------------------------------
describe("Four's victory card waits for his ending (the hook; he has one of his own now, so this stands in a short one, and takes his away to see the card come at once)", () => {
  // showRushVictory pauses the game the moment it shows, so an ending for Four would play under it, frozen. When BOSS_ENDINGS.four exists the clear path
  // holds the card -- and the loop's own card with it -- back by its holdMs, the way it holds the BOSS DOWN card; the loop itself moves on at once.
  it('with no ending the card comes at once, as it always did; with one it comes after holdMs, naming the lap just beaten, and not at all if the run is over by then', async () => {
    const w = bootMonolith(); await w.eval('profileReady');   // its own page: the loop's awards write the profile
    const run = (ending, stillRunning) => w.eval(`(function(){ ${STAGE('Four', 500)}
      var st = setTimeout, timers = [], said = [], _b = banner, el = document.getElementById('rushVictory'), real = BOSS_ENDINGS.four;
      setTimeout = function(fn, ms){ timers.push({ fn: fn, ms: ms }); return 0; };
      banner = function(t, m, k, l){ said.push(String(t)); return _b(t, m, k, l); };
      try {
        el.style.display = 'none'; paused = false; BOSSRUSH.active = true; BOSSRUSH.frames = 600;
        ${ending ? 'BOSS_ENDINGS.four = { begin: function(boss){}, holdMs: 900 };' : 'delete BOSS_ENDINGS.four;'}
        b.hp = 0; bossRushCheck();
        var now = { paused: paused, card: !!BOSSRUSH.card, shown: el.style.display, loop: BOSSRUSH.loop, mult: BOSSRUSH.dmgMult, idx: BOSSRUSH.bossIdx, ms: timers.map(function(t){ return t.ms; }).sort(function(a, c){ return a - c; }),
          said: said.slice() };
        running = ${stillRunning}; timers.filter(function(t){ return t.ms === 900; }).forEach(function(t){ t.fn(); }); running = true;
        return { now: now, after: { paused: paused, card: !!BOSSRUSH.card, shown: el.style.display, sub: document.getElementById('rushVicSub').textContent, said: said.slice(now.said.length) } };
      } finally { setTimeout = st; banner = _b; BOSS_ENDINGS.four = real; BOSSRUSH.active = false; paused = false; el.style.display = 'none'; summons = []; projectiles = []; }
    })()`);
    const plain = run(false, true), held = run(true, true), over = run(true, false);
    // no ending: the card now, the loop's card now, the next boss after 1.5 s
    expect(plain.now.paused && plain.now.card && plain.now.shown === 'flex', 'the card is up at once, over a paused match').toBe(true);
    expect([plain.now.loop, plain.now.mult, plain.now.idx], 'the gauntlet starts again, twice as hard').toEqual([1, 2, 0]);
    expect(plain.now.ms, 'the next boss after 1.5 s (the rest are banner hide timers)').toContain(1500);
    expect(plain.now.ms.filter((m) => m === 900), 'and nothing waits').toEqual([]);
    expect(plain.now.said.some((t) => /GAUNTLET LOOP 2/.test(t))).toBe(true);
    expect(plain.after.paused, 'nothing was waiting').toBe(true);
    expect(plain.after.sub).toMatch(/^All \w+ bosses beaten in 0:10\./);
    // an ending of 900 ms: the match plays on under the scene, the loop is already counted, the cards wait, the next boss comes 1.5 s after them
    expect(held.now.paused, 'the match is not paused while the scene plays').toBe(false);
    expect(held.now.card).toBe(false);
    expect(held.now.shown).toBe('none');
    expect([held.now.loop, held.now.mult, held.now.idx], 'the loop moves on at once').toEqual([1, 2, 0]);
    expect(held.now.ms.filter((m) => m === 900), 'the BOSS DOWN card and the victory card both wait for the ending').toEqual([900, 900]);
    expect(held.now.ms, 'and the next boss comes 1.5 s after them, at 2400, not at 1500').toContain(2400);
    expect(held.now.ms).not.toContain(1500);
    expect(held.now.said.some((t) => /GAUNTLET LOOP|BOSS DOWN/.test(t)), 'no card yet').toBe(false);
    expect(held.after.paused && held.after.card && held.after.shown === 'flex', 'then the victory card, over a paused match').toBe(true);
    expect(held.after.sub, 'it names the lap just beaten, not the loop that has begun').toMatch(/^All \w+ bosses beaten in 0:10\./);
    expect(held.after.said.some((t) => /^BOSS DOWN!/.test(t)) && held.after.said.some((t) => /GAUNTLET LOOP 2/.test(t))).toBe(true);
    // the run ended while the scene played (a quit, a restart): no card over whatever came next
    expect(over.after.paused, 'no card if the run is over').toBe(false);
    expect(over.after.shown).toBe('none');
  });
});

// ==== THE GLITCH PASS (2026-10-01) ===================================================================================================
// scripts/boss-glitch.mjs plays every boss with AI fighters and draws every frame (and every netcode snapshot, as a client) through a
// canvas that refuses what a real browser refuses (test/helpers/validating-canvas.js): jsdom accepts a negative arc radius, an alpha
// of 1.04 and a fill of `undefined`, a browser throws on the first and ignores the others. What it found in the shared code is here.

describe('the glitch pass: what every boss hit and every particle shares', () => {
  // A boss's shot names its owner {team:-1, idx:-2}: no colour, no body. A hazard's hit names nobody (null).
  const HIT = (extra = '', opts = '') => `(function(){
    SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
    worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; fighters=[];
    var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 500, groundY()-24, 0);
    f.team=0; f.controller='still'; f.stocks=9; fighters=[f]; ${extra}
    var owner = { team:-1, idx:-2 };
    projectiles.push({ owner:-2, ownerObj:owner, x:f.x, y:f.y, vx:0, vy:0, r:30, dmg:12, kb:6, life:10, bossAtk:++BOSS_ATK_ID, color:'#ff9a3a' });
    var p0 = f.pct; particles = []; step();
    return { took: f.pct - p0, owner: owner, parts: particles.map(function(p){ return { c: p.color, x: p.x, y: p.y }; }) ${opts} };
  })()`;

  it('a boss shot that lands throws sparks that have a colour and a place (its owner has neither: the sparks drew in whatever fill the last thing left, and a client was sent null)', async () => {
    const r = W.eval(HIT());
    expect(r.took, 'the hit lands').toBeGreaterThan(0);
    expect(r.parts.length, 'and there are sparks').toBeGreaterThan(0);
    expect(r.parts.every((p) => typeof p.c === 'string' && p.c.length > 0), 'every spark has a colour').toBe(true);
    expect(r.parts.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)), 'and a place').toBe(true);
    // the same, drawn, on a canvas that keeps the old fill for a fill it refuses
    const { w, errors } = await bootValidating();
    w.eval(HIT()); w.eval('draw()');
    expect(errors.filter((e) => e.kind === 'ctx-ignored' && /fillStyle/.test(e.key)), 'no fill the canvas ignores').toEqual([]);
  });

  it('a fighter in a counter stance blocks a boss shot and has nobody to punish: no hit on the shot\'s owner, no sparks at (undefined, undefined), none drawn at the corner of a client\'s world', () => {
    const r = W.eval(HIT('f.countering = 60; f.kit = { special: "basic" };', ', countering: f.countering'));
    expect(r.took, 'the stance took the hit').toBe(0);
    expect(r.countering, 'and is spent').toBe(0);
    expect(Object.keys(r.owner).sort(), 'the owner is only a name: nothing was done to it').toEqual(['idx', 'team']);
    expect(r.parts.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)), 'no spark has no place').toBe(true);
    // against a fighter the stance still punishes, as it always did
    const q = W.eval(`(function(){
      SETTINGS.mode='ffa'; running=true; projectiles=[]; particles=[]; summons=[];
      var a = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 400, groundY()-24, 0), b = makeFighter(ROSTER.find(function(r){ return r.name==='Pin'; }), 440, groundY()-24, 1);
      a.team=0; b.team=1; a.stocks=b.stocks=9; fighters=[a,b]; a.countering=60; a.kit={special:'basic'};
      var before = b.pct; applyHit(a, 10, 3, -2, b); return { atkr: b.pct - before, mine: a.pct }; })()`);
    expect(q.atkr, 'the one who hit a counter stance takes it back').toBeGreaterThan(0);
    expect(q.mine, 'and it took nothing').toBe(0);
  });

  it('a particle is drawn at an alpha the canvas keeps: a fresh puff lives up to 24 frames and its alpha was life / 22 (1.09), which a real canvas ignores', async () => {
    const { w, errors } = await bootValidating();
    w.eval(`(function(){ SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow(); particles = []; for (var i=0;i<6;i++) particles.push({ x:300+i*20, y:300, vx:0, vy:0, life:24 - i, r:4, color:'#fff' }); })()`);
    errors.length = 0;
    w.eval('draw()');
    expect(errors.filter((e) => e.kind === 'ctx-ignored' && e.key === 'globalAlpha'), 'no alpha the canvas ignores').toEqual([]);
  });
});

describe('a fighter\'s lingering hitbox lands on a boss once', () => {
  it('Puffball\'s Meteor Puff hits a boss one time and ends, as it does on a fighter (it landed 22 a frame and felled bosses)', () => {
    // The owner (2026-10-02): "puffball multihitbox on smash. instakills bosses." A boss has no grace after a hit, so a hitbox that
    // follows her down every frame landed every frame.
    const r = W.eval(`(function(){ ${STAGE('Announcer', 2000)}
      var p = makeFighter(ROSTER.find(function(r){ return r.name==='Puffball'; }), b.x, b.y - b.r - 150, 0);
      p.team = 0; p.controller = 'still'; fighters = [p]; b._atkTimer = 1e9;
      var hp0 = b.hp; p.vx = 0; p.vy = 0; p.onground = false;
      SMASHES.fly(p);
      for (var i=0;i<60 && p._plunge;i++){ step(); b.x = p.x; b._atkTimer = 1e9; }
      var lost = hp0 - b.hp; summons = []; fighters = []; return { lost: lost, ended: !p._plunge };
    })()`);
    expect(r.ended, 'the plunge ended').toBe(true);
    expect(r.lost, 'one plunge hit, not one a frame').toBeGreaterThan(0);
    expect(r.lost).toBeLessThanOrEqual(22 + 26);   // at most the plunge's 22 and the point-blank hit
  });
});
