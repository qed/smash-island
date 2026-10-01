import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { JSDOM } from 'jsdom';
import { loadMonolith } from './helpers/load-monolith.js';
import { mulberry32 } from './helpers/prng.js';

// Boss 10, Two, rebuilt in the boss overhaul (2026-09-29): "make the bosses more like springy ... but dont make them like him! make the attacks
// feel more immersive." The A-twos-ment Park at sunset (Getting Puffball To Think About Rollercoasters), six attacks -- MIND READ!, MAYBE YOU'D LIKE
// THIS!, THE POWER OF TWO!, BLOCK TOWERS!, I LOVE RIDES!, CLAP! -- each a scene from the show, all of them through the boss engine kit (impact, the
// fall drift, the arena's ground and hazard, its ending). "Harder, same damage": every part of a turn shares that turn's one attack id, so a fighter
// takes at most one boss hit from it. Never tuned for a bot: every number here is what the design says.

let W;
beforeAll(async () => { W = loadMonolith().window; await W.eval('profileReady'); });

const ROW = { name: 'Two', color: '#44C549', hp: 285, big: 2.6, attack: 'two', arena: 'twopark', stationary: false, sprite: 'two' };
// A still Firey on the floor at `x` and Two spawned the way the gauntlet spawns him (BOSSRUSH.active false: the gauntlet logic off), parked over the middle of the
// park out of his pop, his attack timer held unless `live`. `ph` is his phase (his HP sets it).
const STAGE = (x, ph = 1, live = false) => `
  SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
  BOSSRUSH = { active:false, bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.name==='Two'; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats=platRectsSmall(); summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; hazardT=0;
  var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), ${x}, groundY()-24, 0);
  f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
  spawnBossRushBoss();
  var b = summons.find(function(s){ return s.type==='boss'; });
  b.hp = b.maxHp*[0, 1, 0.5, 0.2][${ph}]; ${live ? '' : 'b._atkTimer = 1e9;'}
  step(); step(); step();
  b._pop = null; b._popK = 1; b._dst = null; b.x = 700; b.y = groundY() - b.r - 60; b._homeX = 700; b.face = -1; b.vx = 0; b.vy = 0;
  f.pct = 0; f.invuln = 0; f.hitstun = 0; f.x = ${x}; f.y = groundY()-24; f.vx = 0; f.vy = 0; f.onground = true; projectiles = projectiles.filter(function(p){ return p.twoMace; }); b._hz = b._hz || {}; b._hz.pp = null;
`;
// Fire move number k (0 the signature, 1.. the second moves in order) of the boss `b` now, and run its wind-up out: the frame the move fires is the last one this
// returns from. (Every test that needs a move in the air starts here.)
const FIRE = (k) => `b._moveN = ${k === 0 ? 0 : 2*k - 1}; b._atkTimer = 1; step(); var telKind = b._telKind, telName = document.getElementById('banner').textContent, telLen = b._tel;
  for (var w=0; w<80 && b._tel>0; w++){ step(); f.invuln = 99; }`;
// A frame with the fighter held where the test wants them
const HOLD = `f.pct = 0; f.invuln = 99; f.hitstun = 0;`;

describe('Two takes the park: his row, his flight and his pops', () => {
  it('is Boss 10, his own arena, green (Skirret Green #44C549: "Two is green"), and flies -- no walk', () => {
    const r = W.eval(`(function(){
      var i = BOSS_ROSTER.findIndex(function(b){ return b.name==='Two'; });
      ${STAGE(300)}
      var out = { i: i, row: BOSS_ROSTER[i], dragon: BOSS_ROSTER.findIndex(function(b){ return b.name==='Purple Dragon'; }), springy: BOSS_ROSTER.findIndex(function(b){ return b.name==='Springy'; }),
                  hover: b.hover, y0: b.y, x0: b.x };
      b.stationary = false; var xs = []; for (var k=0;k<200;k++){ step(); ${HOLD} xs.push(b.x); }
      out.moved = Math.max.apply(null, xs) - Math.min.apply(null, xs); out.y1 = b.y; out.gy = groundY(); out.R = b.r;
      summons = []; projectiles = []; return out; })()`);
    expect(r.row).toEqual(ROW);
    expect(r.i, 'Boss 10, between the Dragon (9) and Springy (11)').toBe(9);
    expect([r.dragon, r.springy]).toEqual([8, 10]);
    expect(r.hover, 'the engine\'s gravity and floor are off for him').toBe(true);
    expect(r.y1, 'he floats over the floor, low enough to be hit from it').toBeLessThan(r.gy - r.R);
    expect(r.y1).toBeGreaterThan(r.gy - r.R - 200);
  });

  it('keeps the side of you he is on, an arm\'s length and more away, and follows you slowly -- a hit\'s shove settles', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var out = {};
      for (var k=0;k<220;k++){ step(); ${HOLD} }
      out.side = b._side; out.dx = b.x - f.x; out.stand = TWO.stand[1];
      b.vx = 14; var x0 = b.x; step(); out.shoved = b.x - x0; for (var k=0;k<60;k++){ step(); ${HOLD} } out.settled = Math.abs(b.vx);
      f.x = 900; f.y = groundY()-24; for (var k=0;k<400;k++){ step(); ${HOLD} f.x = 900; } out.dx2 = b.x - f.x;
      summons = []; projectiles = []; return out; })()`);
    expect(r.side, 'he is on the right of you').toBe(1);
    expect(Math.abs(r.dx - r.stand), 'he settles TWO.stand px off you').toBeLessThan(30);
    expect(r.shoved).toBeGreaterThan(8);
    expect(r.settled).toBeLessThan(0.1);
    expect(Math.abs(r.dx2), 'and he follows you across the park, on the side he was on').toBeGreaterThan(200);
  });

  it('floats up to the "S"tage when you stand on it (Jump-boost), and back to the floor when you leave it', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(), top = twoStageTop(), out = { top: top, gy: gy };
      for (var k=0;k<200;k++){ step(); ${HOLD} } out.yFloor = b.y;
      f.x = 540; f.y = top - 30; f.onground = true; f.vy = 0;
      for (var k=0;k<260;k++){ step(); ${HOLD} f.x = 540; f.y = top - 30; f.vy = 0; } out.yStage = b.y;
      summons = []; projectiles = []; return out; })()`);
    expect(r.yStage, 'he is higher over the stage').toBeLessThan(r.yFloor - 40);
  });

  it('pops: out in nine frames, a lime ring where he was and where he comes, back in nine -- and a move that begins far away is a pop', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var out = {}, x0 = b.x, y0 = b.y;
      twoPop(b, 150, 200);
      var ks = [], moved = null;
      for (var k=0;k<30;k++){ step(); ${HOLD} ks.push(Math.round((b._popK == null ? 1 : b._popK)*100)/100); if (moved === null && Math.abs(b.x - 150) < 1) moved = k; }
      out.ks = ks; out.moved = moved; out.rings = (b._hz.pp || []).length; out.at = [Math.round(b.x), Math.round(b.y)]; out.after = b._pop; out.k = b._popK;
      // a move that begins far away pops there; near, it glides
      b.x = 700; b.y = groundY() - b.r - 60; b._pop = null; twoGoTo(b, 720, b.y - 30); out.near = !!b._pop;
      b._dst = null; twoGoTo(b, 100, 150); out.far = !!b._pop;
      summons = []; projectiles = []; return out; })()`);
    expect(r.ks[0], 'it begins to shrink').toBeLessThan(1);
    expect(Math.min(...r.ks), 'and is nearly gone at the flash').toBeLessThan(0.15);
    expect(r.ks[r.ks.length - 1], 'whole again after').toBe(1);
    expect(r.moved, 'there nine frames in (he arrived at the far spot)').toBeGreaterThanOrEqual(9);
    expect(r.moved).toBeLessThanOrEqual(11);
    expect(r.rings, 'a ring at each end').toBe(2);
        expect(r.near, 'near is a glide').toBe(false);
    expect(r.far, 'far is a pop').toBe(true);
  });
});

describe('MIND READ!', () => {
  it('the wind-up: a lime ring follows you for 24 frames, then holds for the last 12 while a rift opens 220 px behind you, on the far side of you from Two', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1, true)}
      f.x = 300; b._moveN = 0; b._atkTimer = 1; step();
      var out = { kind: b._telKind, name: document.getElementById('banner').textContent, tel0: b._tel, rd0: b._hz.rd && b._hz.rd.slice() };
      f.x = 360; for (var k=0;k<10;k++){ step(); ${HOLD} f.x = 360; }
      out.followed = b._hz.rd.slice();
      for (var k=0;k<14;k++){ step(); ${HOLD} f.x = 360; }   // tel is now 11: it has locked
      f.x = 460; step(); ${HOLD} f.x = 460;
      out.locked = b._hz.rd.slice(); out.tel = b._tel; out.bx = b.x;
      summons = []; projectiles = []; return out; })()`);
    expect(r.kind).toBe('two');
    expect(r.name).toBe('MIND READ!');
    expect(r.tel0).toBe(36);
    expect(r.rd0.slice(0, 3), 'the ring is on you at once, unlocked').toEqual([300, expect.any(Number), 0]);
    expect(r.followed[0], 'and it follows you').toBe(360);
    expect(r.followed[2]).toBe(0);
    expect(r.locked[2], 'it holds for the last frames').toBe(1);
    expect(r.locked[0], 'where it locked, not where you went next').toBe(360);
    expect(Math.abs(r.locked[3] - 360), 'the rift is 220 px from you').toBe(220);
    expect(Math.sign(r.locked[3] - 360), 'on the far side of you from Two (he is on the right of you: it opens on the left)').toBe(Math.sign(360 - r.bx));
  });

  it('the copy wears your own last special -- its art where the game has one, else the green orb -- in a green halo, out of the rift behind you, leading your run', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1, true)}
      var out = { shapes: {} };
      ['ember', 'shatter', 'basic', 'nonesuch'].forEach(function(k){ out.shapes[k] = twoCopyShape(k); });
      f._lastSpecialKind = 'ember'; f.x = 300; ${FIRE(0)}
      var cp = projectiles.filter(function(p){ return p.twoCopy; });
      out.n = cp.length; out.c = cp[0] && { shape: cp[0].shape, color: cp[0].color, id: cp[0].bossAtk, volley: cp[0].volley, dmg: cp[0].dmg, r: cp[0].r, two: cp[0].two, owner: cp[0].owner, x: cp[0].x, y: cp[0].y, vx: cp[0].vx, vy: cp[0].vy };
      out.rd = b._hz.rd.slice(); out.dmg = bossDmg(); out.copied = b._copied; out.speed = cp[0] && Math.hypot(cp[0].vx, cp[0].vy); out.homing = cp[0] && cp[0].homing;
      summons = []; projectiles = []; return out; })()`);
    expect(r.shapes).toEqual({ ember: 'ember', shatter: 'shatter', basic: 'twoorb', nonesuch: 'twoorb' });
    expect(r.n).toBe(1);
    expect(r.c).toMatchObject({ shape: 'ember', color: '#44C549', volley: true, two: true, owner: -2 });
    expect(r.c.dmg, 'the signature is a full boss hit').toBe(r.dmg);
    expect(Math.hypot(r.c.x - r.rd[3], r.c.y - r.rd[4]), 'it leaves the rift (one frame of flight on)').toBeLessThan(14);
    expect(r.c.vx, 'and flies at you: you are to its right').toBeGreaterThan(0);
    expect(r.speed).toBeCloseTo(13, 1);
    expect(r.homing, 'phase 1 does not home').toBe(0);
    expect(r.copied).toBe('ember');
  });

  it('1, 2, then 3 copies by phase, a few frames apart, under one attack id; from phase 2 they home', () => {
    const r = W.eval(`(function(){ var out = {};
      [1, 2, 3].forEach(function(ph){ ${STAGE(300, 'ph', true)}
        f._lastSpecialKind = 'ember'; ${FIRE(0)}
        var cp = projectiles.filter(function(p){ return p.twoCopy; });
        out[ph] = { n: cp.length, ids: cp.map(function(p){ return p.bossAtk; }).filter(function(v, i, a){ return a.indexOf(v) === i; }).length, delays: cp.map(function(p){ return p.delay; }), homing: cp.map(function(p){ return p.homing; }) };
        summons = []; projectiles = []; });
      return out; })()`);
    expect(r[1]).toMatchObject({ n: 1, ids: 1, homing: [0] });
    expect(r[2]).toMatchObject({ n: 2, ids: 1, delays: [0, 5], homing: [0.06, 0.06] });
    expect(r[3]).toMatchObject({ n: 3, ids: 1, delays: [0, 5, 11], homing: [0.06, 0.06, 0.06] });
  });

  it('a hit from the copies is one boss hit at most, however many come; the drain is as it was (6% inside 260 px, 340 in phase 3, 25 meter, Two heals 60% of it)', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 3, true)}
      b.hp = b.maxHp*0.3; var hp0 = b.hp;
      f._lastSpecialKind = 'ember'; f.meter = 80; f.x = b.x - 300; f.y = b.y;   // inside 340, outside 260
      b._ungrounded = true; b._mace = null; projectiles = [];   // (the mace is its own test)
      ${FIRE(0)}
      var out = { pct: f.pct, meter: f.meter, healed: b.hp - hp0, tether: (b._hz.dr || []).length, R3: TWO.read.drain[3], R2: TWO.read.drain[2] };
      var ids = {}; projectiles.filter(function(p){ return p.twoCopy; }).forEach(function(p){ ids[p.bossAtk] = 1; });
      out.ids = Object.keys(ids).length;
      // the copies of the third phase landing together: the cap holds
      f.pct = 0; f.invuln = 0; f.hitstun = 0;
      var cps = projectiles.filter(function(p){ return p.twoCopy; });
      cps.forEach(function(p){ p.delay = 0; p.x = f.x; p.y = f.y; p.vx = 0; p.vy = 0; });
      for (var k=0;k<40;k++){ step(); f.hitstun = 0; f.invuln = Math.min(f.invuln, 0); }
      out.hit = f.pct; out.dmg = bossDmg();
      summons = []; projectiles = []; return out; })()`);
    expect(r.R3).toBe(340);
    expect(r.R2).toBe(260);
    expect(r.pct, 'the drain: 6%').toBe(6);
    expect(r.meter, 'and 25 off the meter').toBe(55);
    expect(r.healed, 'Two heals 60% of what he drained').toBe(Math.round(6*0.6));
    expect(r.tether, 'the tether is drawn').toBe(1);
    expect(r.ids, 'one attack id for the whole turn').toBe(1);
    expect(r.hit, 'three copies landing on one fighter is one boss hit').toBeLessThanOrEqual(r.dmg + 1e-6);
    expect(r.hit).toBeGreaterThan(r.dmg*0.9);
  });

  it('the sun dims a notch on each read (to three), and comes back a notch at a time', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1, true)}
      var out = [];
      for (var i=0;i<4;i++){ f._lastSpecialKind = 'ember'; ${FIRE(0)} out.push(b._hz.dm[0]); projectiles = []; b._tw = null; hazardT += 1; }
      var t0 = b._hz.dm[1];
      for (var k=0;k<TWO.read.dim.hold*2 + 10;k++){ b._atkTimer = 1e9; step(); ${HOLD} }
      out.push(b._hz.dm[0]);
      summons = []; projectiles = []; return out; })()`);
    expect(r.slice(0, 4), 'a notch a read, three at most').toEqual([1, 2, 3, 3]);
    expect(r[4], 'and it comes back').toBeLessThan(3);
  });
});

describe('MAYBE YOU\'D LIKE THIS!', () => {
  it('the wind-up: Two goes up toward the sun, the first landing is marked on the floor where you stood, and the sun is red and growing spikes', () => {
    const r = W.eval(`(function(){ ${STAGE(420, 1, true)}
      f.x = 420; b._moveN = 1; b._atkTimer = 1; step();
      var out = { kind: b._telKind, name: document.getElementById('banner').textContent, tel: b._tel, mk: b._hz.mk && b._hz.mk.slice(), dst: b._dst, gy: groundY(), sky: twoSkySun(1), sun: TWO.sun.r };
      for (var k=0;k<30;k++){ step(); ${HOLD} f.x = 420; }
      out.y = b.y; out.mkAfter = b._hz.mk && b._hz.mk.slice();
      summons = []; projectiles = []; return out; })()`);
    expect(r.kind).toBe('twosun');
    expect(r.name).toBe("MAYBE YOU'D LIKE THIS!");
    expect(r.tel, 'a 40-frame wind-up').toBe(40);
    expect(r.mk.slice(0, 2), 'the mark is on the floor under you').toEqual([420, Math.round(r.gy)]);
    expect(r.y, 'Two has flown up').toBeLessThan(r.gy - 250);
    expect(r.mkAfter[0]).toBe(420);
  });

  it('the ball drops from the sky onto its mark, bounces toward you 1, 2 then 3 more times by phase, a low hop each, and rises to be the sun again', () => {
    const r = W.eval(`(function(){ var out = {};
      [1, 2, 3].forEach(function(ph){ ${STAGE(300, 'ph', true)}
        f.x = 300; ${FIRE(1)}
        var T = b._tw, p = T.p, landings = 0, ys = [], n0 = T.n;
        for (var k=0;k<400 && b._tw;k++){
          var was = b._tw.st;
          step(); ${HOLD}
          if (b._tw && b._tw.st === 'fly' && b._tw.t === 0 && was === 'fly') landings++;   // a landing that plans another hop
          ys.push(p.y);
        }
        out[ph] = { n: n0, landings: landings, done: !b._tw, so: b._hz.so, sb: b._hz.sb, alive: p.life, lowest: Math.max.apply(null, ys), gy: groundY(), gap: b._atkTimer, mk: b._hz.mk || null };
        summons = []; projectiles = []; });
      return out; })()`);
    expect([r[1].n, r[2].n, r[3].n], 'one, two, then three more bounces').toEqual([1, 2, 3]);
    for (const ph of [1, 2, 3]) {
      expect(r[ph].done, `phase ${ph}: the move ends`).toBe(true);
      expect(r[ph].landings, `phase ${ph}: it lands once for every hop it plans`).toBe(r[ph].n);
      expect(r[ph].lowest, 'it lands on the floor: its centre a radius up').toBeCloseTo(r[ph].gy - 44, 0);
      expect(r[ph].mk, 'and its marks are gone').toBe(null);
    }
    expect(r[1].sb, 'the sky has its sun back').toBeGreaterThan(r[1].so);
    expect(r[1].alive, 'the carrier is gone with the move').toBe(0);
    expect(r[1].gap, 'and the turn\'s gap runs from here: 100, paced').toBeGreaterThan(110);
  });

  it('every bounce turns toward where you are NOW: the next mark is your position when it lands, at most 10.5 px a frame for 28 frames away', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 2, true)}
      f.x = 300; ${FIRE(1)}
      var T = b._tw, legs = [];
      for (var k=0;k<200 && b._tw;k++){
        var n0 = T.n;
        step(); ${HOLD}
        if (T.st === 'fly' && T.t === 0 && T.n < n0){ legs.push({ at: Math.round(T.x), mk: b._hz.mk[0], N: T.N, you: Math.round(f.x) }); f.x = T.x < 600 ? 1000 : 100; }
      }
      summons = []; projectiles = []; return { legs: legs, reach: TWO.sun.vmax*TWO.sun.leg, leg: TWO.sun.leg }; })()`);
    expect(r.legs.length, 'two hops in phase 2').toBe(2);
    expect(r.legs[0].N, 'every hop is 28 frames').toBe(r.leg);
    expect(r.legs[0].mk, 'the first hop goes to where you stood when it landed').toBe(r.legs[0].you);
    expect(Math.abs(r.legs[1].mk - r.legs[1].at), 'the second goes after you the other way, as far as one hop reaches').toBeLessThanOrEqual(r.reach + 1);
    expect(Math.sign(r.legs[1].mk - r.legs[1].at), 'toward your new place, across the park').toBe(Math.sign(r.legs[1].you - r.legs[1].at));
  });

  it('it is one full boss hit under one attack id, however long it overlaps you; every landing is an impact() that cracks the floor', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1, true)}
      var imps = [], _impact = impact; impact = function(x, y, o){ imps.push([Math.round(x), o && o.scar, o && o.shake]); return _impact(x, y, o); };
      try {
        f.x = 300; ${FIRE(1)}
        var T = b._tw, pct0 = f.pct;
        f.invuln = 0;
        for (var k=0;k<90;k++){ step(); f.hitstun = 0; f.y = groundY()-24; f.x = T.x2; f.vx = 0; }
        var out = { pct: f.pct - pct0, dmg: bossDmg(), imps: imps.length, scar: imps.every(function(i){ return i[1] === true; }), shake: imps.every(function(i){ return i[2] >= 7; }) };
        summons = []; projectiles = [];
      } finally { impact = _impact; }
      return out; })()`);
    expect(r.pct, 'one boss hit and no more').toBeLessThanOrEqual(r.dmg + 1e-6);
    expect(r.pct).toBeGreaterThan(r.dmg*0.9);
    expect(r.imps, 'a landing is an impact()').toBeGreaterThanOrEqual(1);
    expect(r.scar, 'and the tiles crack').toBe(true);
    expect(r.shake).toBe(true);
  });

  it('phase 3: the sun is Two\'s mace, circling them slowly, one 0.8 hit a revolution, and the move bashes out from it and back to its circle', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 3, true)}
      for (var k=0;k<60;k++){ b._atkTimer = 1e9; step(); ${HOLD} }
      var M = b._mace, out = { mace: !!M, shape: M && M.shape, r: M && M.r, inShots: projectiles.indexOf(M) >= 0 };
      var d = [], a0 = b._maceA;
      for (var k=0;k<120;k++){ b._atkTimer = 1e9; step(); ${HOLD} d.push(Math.hypot(M.x - b.x, M.y - b.y)); }
      out.dMin = Math.min.apply(null, d); out.dMax = Math.max.apply(null, d); out.turn = (b._maceA - a0)/120; out.R = b.r; out.k = TWO.sun.mace.k;
      // it hits: park it on a fighter
      f.invuln = 0; f.pct = 0; f.x = M.x; f.y = M.y; var id0 = b._maceId;
      step(); out.hit = f.pct; out.frac = bossDmg()*TWO.sun.mace.frac;
      // a sun attack bashes from the mace and then it circles again
      f.x = 300; f.y = groundY()-24; f.invuln = 99; b._moveN = 1; b._atkTimer = 1; step(); for (var k=0;k<50;k++){ step(); ${HOLD} f.x = 300; }
      out.tw = b._tw && b._tw.k; out.mace3 = b._tw && b._tw.mace;
      for (var k=0;k<400 && b._tw;k++){ step(); ${HOLD} f.x = 300 + (k%80<40?0:150); }
      out.after = !b._tw; out.back = Math.hypot(M.x - b.x, M.y - b.y); out.alive = M.life > 0 && projectiles.indexOf(M) >= 0;
      summons = []; projectiles = []; return out; })()`);
    expect(r.mace).toBe(true);
    expect(r.shape).toBe('twosun');
    expect(r.inShots, 'a carrier a client draws like any shot').toBe(true);
    expect(r.dMax, 'it circles at 1.6 of his radius, a little flattened').toBeGreaterThan(r.R*r.k*0.78);
    expect(r.dMax).toBeLessThan(r.R*r.k*1.05);
    expect(r.turn, 'slowly: 0.034 rad a frame').toBeCloseTo(0.034, 3);
    expect(r.hit, 'a hit is 0.8 of a boss hit').toBeCloseTo(r.frac, 5);
    expect(r.tw).toBe('sun');
    expect(r.mace3).toBe(true);
    expect(r.after).toBe(true);
    expect(r.alive, 'the mace is not spent by the bash').toBe(true);
    expect(r.back, 'it is back on its circle').toBeLessThan(r.R*r.k*1.1);
  });
});
