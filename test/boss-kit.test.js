import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { bootMonolith } from './helpers/smash-golden.js';
import { loadMonolith } from './helpers/load-monolith.js';
import { mulberry32 } from './helpers/prng.js';

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

  it("a MePhone4S cookie falls on a slant and waits on its shadow; a mine that waits, a rising spike and Springy's marks are not falling", () => {
    const r = W.eval(`(function(){ ${STAGE('MePhone4S', 300)} ${FOLLOW}
      f.x = 100; f.invuln = 1e9; b.x = 200; b.face = 1; b._telX = 600; projectiles = [];
      BOSS_MOVES.cookies(b, null); var c = projectiles[2], cStart = { vx:c.vx, warnX:c.warnX };
      var ce = follow(c, 200);
      var cookieRest = { x:c.x, vx:c.vx, trap:!!c.trap };
      projectiles = [];
      var mine = addProj({ owner:f.idx, ownerObj:f, x:500, y:groundY()-10, vx:0, vy:0, trap:true, arm:24, _mine:true, r:14, life:100 });
      worldPlats = [{ x:300, y:groundY()-160, w:300, h:14 }];
      var spikes = []; s4DeathTrap(b, ++BOSS_ATK_ID); projectiles.forEach(function(p){ if (p.shape==='spike') spikes.push({ x:p.x, warnX:p.warnX, vx:p.vx }); });
      projectiles = []; springySlamStart(Object.assign({}, b, { attack:'springy', _telPh:1 }), { x:640, dead:false }, ++BOSS_ATK_ID);
      var mark = projectiles.find(function(p){ return p.springMark; }), hole = springyHole(333, 1, ++BOSS_ATK_ID);
      var out = { cStart: cStart, cookieRest: cookieRest, mineVx: mine.vx, mineX: mine.x, spikes: spikes, mark: [mark.x, mark.vx], hole: [hole.x, hole.vx] };
      summons = []; projectiles = []; worldPlats = [];
      return out;
    })()`);
    expect(r.cStart.vx).toBeGreaterThan(0);
    expect(r.cookieRest.trap, 'it landed and waits').toBe(true);
    expect(Math.abs(r.cookieRest.x - r.cStart.warnX), 'where its shadow was').toBeLessThan(1);
    expect(r.cookieRest.vx, 'and waiting, it does not slide').toBe(0);
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
    // 'soundwave', test/boss-puffball.test.js) -- so Springy's stays first and nothing but the early six's attack keys joins it.
    expect(r.keys[0], "Springy's is first").toBe('springy');
    expect(r.keys, 'the rebuilt ones have theirs').toEqual(expect.arrayContaining(['springy', 'announcer', 'firewall', 'swallow', 'swarm', 'soundwave']));
    expect(r.keys.filter((k) => k !== 'springy').every((k) => ['announcer', 'soundwave', 'firewall', 'swarm', 'swallow', 'dragon'].includes(k)), 'only the early six join him: ' + r.keys).toBe(true);
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
      b.hp = b.maxHp*0.2; b._phase = 3; b._moveN = 0; b._atkTimer = 1; b._tel = 0;
      window.__lastBanner = null; updateBossAttack(b, f);
      var out = { kind: b._telKind, text: window.__lastBanner && window.__lastBanner.text, telKind: window.__lastBanner && window.__lastBanner.kind };
      summons = []; projectiles = []; return out;
    })()`);
    expect(r).toEqual({ kind: 'announcer', text: 'CRUSHER ARM!', telKind: 'boss' });
  });
});

describe('the slot markers: six builders, one file, no conflicts', () => {
  const BOSSES = ['announcer', 'puffball', 'firey', 'swarm', 'purpleface', 'dragon'];
  const SLOTS = ['roster', 'extra', 'rushonly', 'movename', 'moves', 'helpers', 'spawn', 'move', 'tick', 'tel', 'fire', 'gap', 'tellen',
    'phase', 'phasename', 'telname', 'ending', 'hazard', 'netshot', 'net', 'shotdraw', 'fx', 'look', 'tell', 'body', 'sky', 'ground',
    'decor', 'sprite', 'flip', 'shape', 'art'];
  const MARK = /@boss:([a-z]+):(begin|end) ([a-z]+)/;

  function check(file, slots) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    const marks = [];
    lines.forEach((l, i) => { const m = l.match(MARK); if (m) marks.push({ i, boss: m[1], kind: m[2], slot: m[3], line: l.trim() }); });
    const problems = [];
    for (const m of marks) {
      if (!BOSSES.includes(m.boss)) problems.push(`${file}:${m.i + 1} unknown boss ${m.boss}`);
      if (!slots.includes(m.slot)) problems.push(`${file}:${m.i + 1} unknown slot ${m.slot}`);
      if (!/^(\/\/|<!--) @boss:[a-z]+:(begin|end) [a-z]+( -->)?$/.test(m.line)) problems.push(`${file}:${m.i + 1} a marker is alone on its line: "${m.line}"`);
    }
    for (const slot of slots) {
      let prevEnd = -1;
      for (const boss of BOSSES) {
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
    return { problems, count: marks.length };
  }

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
  for (const name of ['Announcer', 'Puffball Speaker Box', 'Firey Speaker Box', 'The Bug Swarm', 'Purple Face', 'Purple Dragon']) {
    it(`${name} still fights as it did, through its slots`, () => {
      const r = W.eval(`(function(){ ${STAGE(name, 500)}
        var out = { tel: [], shots: [], phase: null };
        b.x = 350; b._atkTimer = 1; b._moveN = 0;
        for (var t=0;t<3;t++){
          b._fs = null; b._fsQ = 0;   // Firey Speaker Box's moves run for seconds (fsbMove) and the next wind-up waits for the last: each turn here starts from a settled boss, as the game's do
          window.__lastBanner = null; b._atkTimer = 1; b._tel = 0; updateBossAttack(b, f);
          out.tel.push(window.__lastBanner && window.__lastBanner.text);
          projectiles = []; f.invuln = 0; b._tel = 1; updateBossAttack(b, f);
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
