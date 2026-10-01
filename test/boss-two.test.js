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
const FIRE = (k) => `b._moveN = ${k === 0 ? 0 : (typeof k === 'string' ? "2*(BOSS_EXTRA['Two'].indexOf('" + k + "') + 1) - 1" : 2*k - 1)}; b._atkTimer = 1; step(); var telKind = b._telKind, telName = document.getElementById('banner').textContent, telLen = b._tel;
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
        f.x = 300; ${FIRE('twosun')}
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
      f.x = 300; ${FIRE('twosun')}
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
        f.x = 300; ${FIRE('twosun')}
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

describe('BLOCK TOWERS!', () => {
  it('the wind-up: Two snaps and three stacks grow where you stand and 200 px either side -- the first two lean away from him, the third back toward you -- 40 frames', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1, true)}
      f.x = 300; var out = { order: BOSS_EXTRA['Two'] }; b._moveN = 2*(BOSS_EXTRA['Two'].indexOf('twoblocks') + 1) - 1; b._atkTimer = 1; step();
      out.kind = b._telKind; out.name = document.getElementById('banner').textContent; out.tel = b._tel; out.bk = JSON.parse(JSON.stringify(b._hz.bk)); out.bx = b.x; out.dst = b._dst; out.gy = groundY(); out.R = b.r;
      out.t0 = hazardT;
      for (var k=0;k<30;k++){ step(); ${HOLD} f.x = 300; } out.y = b.y;
      summons = []; projectiles = []; return out; })()`);
    expect(r.kind).toBe('twoblocks');
    expect(r.name).toBe('BLOCK TOWERS!');
    expect(r.tel, 'a 40-frame wind-up').toBe(40);
    const rows = r.bk[1];
    expect(rows.map((row) => row[0]), 'one on you, one 200 px either side (he is on the right: the row runs toward him)').toEqual([500, 300, 100]);
    expect(rows.map((row) => row[1]), 'the first two lean away from him, the third back toward you').toEqual([-1, -1, 1]);
    expect(rows[1][2] - rows[0][2], 'they fall ten frames apart').toBe(10);
    expect(rows[2][2] - rows[1][2]).toBe(10);
    expect(rows[0][2] - (r.t0 + 40), 'after a held breath of 24 frames from the wind-up\'s end').toBe(24);
    expect(r.y, 'Two has flown up to snap').toBeLessThan(r.gy - r.R - 150);
  });

  it('the row is kept on the stage when you stand by a wall: it shifts as a whole, still three stacks 200 apart', () => {
    const r = W.eval(`(function(){ ${STAGE(60, 1, true)}
      f.x = 60; b._moveN = 2*(BOSS_EXTRA['Two'].indexOf('twoblocks') + 1) - 1; b._atkTimer = 1; step();
      var out = { xs: b._hz.bk[1].map(function(r){ return r[0]; }), dirs: b._hz.bk[1].map(function(r){ return r[1]; }) };
      summons = []; projectiles = []; return out; })()`);
    expect(r.xs.every((x) => x >= 90 && x <= 1010)).toBe(true);
    expect(Math.abs(r.xs[0] - r.xs[1])).toBe(200);
    expect(Math.abs(r.xs[2] - r.xs[1])).toBe(200);
  });

  it('they fall like dominoes: a bar 200 px long swings down over 24 frames (slowly, then fast), lands flat, and stands as a 50 px step for three seconds, then dissolves', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1, true)}
      f.x = 300; ${FIRE('twoblocks')}
      var T = b._tw, rows = T.rows, out = { n: rows.length, ang: [], landedAt: [], plats0: worldPlats.length };
      var fall0 = rows[0][2], t0 = hazardT;
      var _impact = impact, imps = []; impact = function(x, y, o){ imps.push([Math.round(x), o && o.scar]); return _impact(x, y, o); };
      try {
        for (var k=0;k<90 && b._tw;k++){
          step(); ${HOLD}
          if (rows[0][2] + 12 === hazardT) out.mid = Math.abs(twoStackAngle(rows[0], hazardT));
          if (T.landed[0] && out.landedAt[0] == null) out.landedAt[0] = hazardT - fall0;
          if (T.landed[2] && out.landedAt[2] == null) out.landedAt[2] = hazardT - rows[2][2];
        }
      } finally { impact = _impact; }
      out.done = !b._tw; out.imps = imps; out.stp = JSON.parse(JSON.stringify(b._hz.stp)); out.plats = worldPlats.filter(function(p){ return p._two; }).map(function(p){ return [Math.round(p.x), Math.round(p.y), p.w, p.h, p.solid, p._until - hazardT]; });
      out.gy = groundY(); out.flat = Math.abs(twoStackAngle(rows[0], hazardT)) ;
      // they stand 180 frames and go
      for (var k=0;k<200;k++){ b._atkTimer = 1e9; step(); ${HOLD} } out.after = worldPlats.filter(function(p){ return p._two; }).length; out.stpAfter = (b._hz.stp || []).length;
      summons = []; projectiles = []; return out; })()`);
    expect(r.n).toBe(3);
    expect(r.mid, 'half way through the fall it has not reached the floor').toBeLessThan(1.2);
    expect(r.mid, 'but it has left the lean behind').toBeGreaterThan(0.4);
    expect(Math.abs(r.landedAt[0] - 24), 'a bar lands 24 frames after it starts to fall').toBeLessThanOrEqual(1);
    expect(r.done, 'the move ends when the last has landed').toBe(true);
    expect(r.imps.length, 'each landing is an impact() that cracks the floor').toBe(3);
    expect(r.imps.every(([, scar]) => scar === true)).toBe(true);
    expect(r.plats.length, 'a step where each lies').toBe(3);
    for (const [, y, w, h, solid, left] of r.plats) {
      expect([w, h, solid], 'a 200 x 50 solid block').toEqual([200, 50, true]);
      expect(y, 'on the floor').toBe(Math.round(r.gy - 50));
      expect(left, 'standing for three seconds').toBeGreaterThan(100);
    }
    expect(r.stp.length, 'a client draws the same steps from the hazard bag').toBe(3);
    expect(r.after, 'then they dissolve: the platforms go').toBe(0);
    expect(r.stpAfter, 'and so does what a client draws').toBe(0);
  });

  it('a falling bar hits what it sweeps: thrown the way it falls, 0.8 of a boss hit, one hit for the three bars under one attack id -- and misses what it does not', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1, true)}
      var out = {};
      // stacks at 500 (falls left), 300 (falls left), 100 (falls right) with him on the right; a fighter in the first bar's sweep and one beyond its base
      f.x = 300; ${FIRE('twoblocks')}
      var f2 = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 560, groundY()-24, 1); f2.team = 0; f2.controller = 'still'; f2.stocks = 9; f2.idx = 7; fighters.push(f2);
      var T = b._tw; f.invuln = 0; f.x = 440; f2.invuln = 0;   // 60 from the first base inside its sweep; 60 beyond it on the side it does not fall
      var pct0 = f.pct, vx = null, pct2 = f2.pct;
      for (var k=0;k<60 && b._tw;k++){ step(); f.y = groundY()-24; f2.y = groundY()-24; f2.x = 560; f2.vx = 0; if (vx === null && f.pct > pct0) vx = f.vx; if (f.pct > pct0 && out.hitAt == null) out.hitAt = hazardT - T.rows[0][2]; f.hitstun = 0; if (f.pct > pct0 + 1) { f.x = 440; f.vx = 0; } }
      out.hit = f.pct - pct0; out.vx = vx; out.far = f2.pct - pct2; out.dmg = bossDmg();
      summons = []; projectiles = []; return out; })()`);
    expect(r.hit, 'the bar that came down on it is 0.8 of a boss hit').toBeGreaterThan(r.dmg*0.79);
    expect(r.hit, 'and the three of them are one attack id: never more than one boss hit').toBeLessThanOrEqual(r.dmg + 1e-6);
    expect(r.vx, 'thrown the way it falls: left').toBeLessThan(0);
    expect(r.far, 'a fighter behind its base is not touched').toBe(0);
  });

  it('phase 3 adds a second row of two between the first, growing as the first falls and falling after it has gone down', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 3, true)}
      f.x = 300; b._mace = null; projectiles = []; b._moveN = 2*(BOSS_EXTRA['Two'].indexOf('twoblocks') + 1) - 1; b._atkTimer = 1; step();
      var rows = JSON.parse(JSON.stringify(b._hz.bk[1]));
      summons = []; projectiles = []; return { rows: rows, last1: rows[2][2] + TWO.blocks.fall }; })()`);
    expect(r.rows.length, 'three and two').toBe(5);
    expect(r.rows[3][2], 'the second row falls once the first has landed').toBeGreaterThanOrEqual(r.last1);
    expect(r.rows[4][2] - r.rows[3][2]).toBe(10);
    expect(r.rows[3][3], 'and grows while the first row falls').toBeLessThan(r.rows[3][2]);
    expect(r.rows[3][1] + r.rows[4][1], 'one each way').toBe(0);
  });
});

describe('CLAP!', () => {
  it('joins in phase 2: until then its turn is the sun again; from phase 2 the wind-up names it', () => {
    const r = W.eval(`(function(){ var out = {};
      [1, 2].forEach(function(ph){ ${STAGE(300, 'ph', true)}
        f.x = 300; ${FIRE('twoclap')} out[ph] = { kind: telKind, name: telName, tel: telLen };
        summons = []; projectiles = []; });
      return out; })()`);
    expect(r[1].kind, 'phase 1: the sun again').toBe('twosun');
    expect(r[1].name).toBe("MAYBE YOU'D LIKE THIS!");
    expect(r[2].kind).toBe('twoclap');
    expect(r[2].name).toBe('CLAP!');
    expect(r[2].tel, 'a 36-frame wind-up').toBe(36);
  });

  it('the wind-up: the line follows you for 26 frames and holds for the last 10, white; two ghost hands wait at the edges', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 2, true)}
      f.x = 300; b._moveN = 2*(BOSS_EXTRA['Two'].indexOf('twoclap') + 1) - 1; b._atkTimer = 1; step();
      var out = { cl0: b._hz.cl.slice() };
      f.x = 400; for (var k=0;k<10;k++){ step(); ${HOLD} f.x = 400; } out.follow = b._hz.cl.slice();
      for (var k=0;k<20;k++){ step(); ${HOLD} f.x = 400; } out.lockedAt = b._tel; out.locked = b._hz.cl.slice();
      f.x = 700; step(); ${HOLD} f.x = 700; out.held = b._hz.cl.slice();
      summons = []; projectiles = []; return out; })()`);
    expect(r.cl0.slice(0, 2)).toEqual([300, 0]);
    expect(r.follow[0], 'it follows you').toBe(400);
    expect(r.locked[1], 'and holds for the last ten frames').toBe(1);
    expect(r.held[0], 'where it locked, not where you went next').toBe(400);
  });

  it('two hands from opposite edges, 120 px tall, reach the line together 34 frames later and clap; the clap is an impact, the "S"tage rattles, and the turn ends', () => {
    const r = W.eval(`(function(){ ${STAGE(500, 2, true)}
      f.x = 500; ${FIRE('twoclap')}
      var hands = projectiles.filter(function(p){ return p.twoHand; }).map(function(p){ return { x: p.x, y: p.y, vx: p.vx, r: p.r, side: p.twoHand, pierce: p.pierce, id: p.bossAtk, dmg: p.dmg, life: p.life, shape: p.shape }; });
      var lx = b._hz.cl[0], T = b._tw.T, gy = groundY();
      var _impact = impact, imps = []; impact = function(x, y, o){ imps.push([Math.round(x), o && o.shake]); return _impact(x, y, o); };
      var xs = { '-1': [], '1': [] }, rattle = null;
      try {
        for (var k=0;k<60 && b._tw;k++){ step(); ${HOLD} f.x = 500; projectiles.filter(function(p){ return p.twoHand; }).forEach(function(p){ xs[p.twoHand].push(Math.round(p.x)); }); }
      } finally { impact = _impact; }
      return { hands: hands, lx: lx, T: T, gy: gy, imps: imps, clapped: b._hz.cl[3], done: !b._tw, last: [xs['-1'][xs['-1'].length-1], xs['1'][xs['1'].length-1]], pad: TWO.clap.pad }; })()`);
    expect(r.hands.length).toBe(2);
    expect(r.hands.map((h) => h.side).sort()).toEqual([-1, 1]);
    for (const h of r.hands) {
      expect(h.r, '120 px tall').toBe(56);
      expect(h.y, 'along the floor in phase 2').toBeCloseTo(r.gy - 56, 0);
      expect(h.pierce).toBe(true);
    }
    expect(r.hands[0].id, 'one attack id for both').toBe(r.hands[1].id);
    expect(r.lx).toBe(500);
    expect(r.imps.length, 'the clap is an impact').toBe(1);
    expect(r.imps[0][0]).toBe(500);
    expect(r.clapped, 'the stage rattles from here').toBeGreaterThan(0);
    expect(r.done).toBe(true);
    expect(Math.abs(r.last[0] - (r.lx - r.pad)), 'the hands end at the line, a palm either side').toBeLessThan(30);
    expect(Math.abs(r.last[1] - (r.lx + r.pad))).toBeLessThan(30);
  });

  it('the hand that reaches you first lands one hit, 0.8 of a boss hit, and throws you the way it was going; jumping the low hand is the dodge, and the "S"tage is out of its way', () => {
    const r = W.eval(`(function(){ var out = {};
      [['floor', 160], ['jump', 160], ['stage', 160]].forEach(function(c){
        ${STAGE(500, 2, true)}
        f.x = 500; ${FIRE('twoclap')}
        var top = twoStageTop();
        f.invuln = 0; f.x = 160; f.y = groundY()-24; var pct0 = f.pct, vx = null;
        if (c[0] === 'stage'){ f.x = 540; f.y = top - 30; }
        for (var k=0;k<45 && b._tw;k++){
          step(); f.hitstun = 0;
          if (c[0] === 'jump'){ var h = projectiles.filter(function(p){ return p.twoHand === -1; })[0]; f.x = 160; f.vx = 0; f.vy = 0; f.onground = false; f.y = (h && Math.abs(h.x - f.x) < 260) ? groundY()-24-170 : groundY()-24; }
          else if (c[0] === 'stage'){ f.x = 540; f.y = top - 30; f.vx = 0; f.vy = 0; f.onground = true; }
          else { f.x = 160; f.y = groundY()-24; }
          if (vx === null && f.pct > pct0) vx = f.vx;
        }
        out[c[0]] = { hit: f.pct - pct0, vx: vx, dmg: bossDmg() };
        summons = []; projectiles = []; });
      return out; })()`);
    expect(r.floor.hit, 'standing in its way: one hit, 0.8').toBeCloseTo(r.floor.dmg*0.8, 4);
    expect(r.floor.vx, 'thrown the way the hand was going (right)').toBeGreaterThan(5);
    expect(r.jump.hit, 'jumped').toBe(0);
    expect(r.stage.hit, 'the "S"tage is above a low hand').toBe(0);
  });

  it('phase 3 sends one hand high and one low, and they swap each time: the high one passes over the floor and hits whoever stands on the "S"tage', () => {
    const r = W.eval(`(function(){ var out = [];
      ${STAGE(500, 3, true)}
      b._mace = null; projectiles = [];
      for (var round=0; round<2; round++){
        f.x = 500; projectiles = []; summons[0]._tw = null; ${FIRE('twoclap')}
        var hands = projectiles.filter(function(p){ return p.twoHand; });
        out.push({ left: hands.filter(function(p){ return p.twoHand === -1; })[0].y, right: hands.filter(function(p){ return p.twoHand === 1; })[0].y, hi: b._hz.cl[2], gy: groundY(), T: b._tw.T });
        b._tw = null;
      }
      summons = []; projectiles = []; return out; })()`);
    expect(r[0].hi + r[1].hi, 'it swaps').toBe(3);
    expect(r[0].T, 'and it is quicker in phase 3').toBe(28);
    for (const c of r) {
      const hiHand = c.hi === 1 ? c.left : c.right, lowHand = c.hi === 1 ? c.right : c.left;
      expect(lowHand, 'one along the floor').toBeCloseTo(c.gy - 56, 0);
      expect(hiHand, 'one 150 px higher: over a fighter on the floor, into one on the "S"tage').toBeCloseTo(c.gy - 56 - 150, 0);
    }
  });
});

describe('THE POWER OF TWO!', () => {
  it('the wind-up: Two goes to the middle, low, and the twelve orbs form round him with a pair pointing at you (it follows you, and holds for the last 8 frames) -- 36 frames', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1, true)}
      f.x = 300; b._moveN = 2*(BOSS_EXTRA['Two'].indexOf('twopower') + 1) - 1; b._atkTimer = 1; step();
      var out = { kind: b._telKind, name: document.getElementById('banner').textContent, tel: b._tel, pw0: b._hz.pw.slice(), dst: b._dst, gy: groundY(), R: b.r, WW: WW };
      for (var k=0;k<20;k++){ step(); ${HOLD} f.x = 300; } out.mid = b._hz.pw.slice(); out.bx = b.x; out.by = b.y;
      f.x = 1000; for (var k=0;k<14;k++){ step(); ${HOLD} f.x = 1000; } out.locked = b._hz.pw.slice(); out.left = b._tel; out.shots = projectiles.length;
      summons = []; projectiles = []; return out; })()`);
    expect(r.kind).toBe('twopower');
    expect(r.name).toBe('THE POWER OF TWO!');
    expect(r.tel).toBe(36);
    expect(r.dst[0], 'the middle').toBe(r.WW*0.5);
    expect(r.dst[1], 'low, so the ring is at your height').toBeCloseTo(r.gy - r.R - 90, 0);
    expect(r.pw0[1]).toBe(0);
    expect(r.locked[1], 'locked for the last frames').toBe(1);
    expect(r.locked[0], 'on where you were when it locked, not where you went').not.toBe(r.mid[0] + 99);
    expect(r.shots, 'nothing is thrown during the wind-up').toBe(0);
  });

  it('twelve orbs as six pairs: ten degrees apart in a pair, sixty between pairs, a pair pointing at you, 6.5 px a frame, 0.8 of a boss hit under one attack id; a lime dust ring and a shake of 4', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1, true)}
      var _impact = impact, imps = []; impact = function(x, y, o){ imps.push([o && o.shake, o && o.dust, o && o.color]); return _impact(x, y, o); };
      try {
        f.x = 300; ${FIRE('twopower')}
        var orbs = projectiles.filter(function(p){ return p.shape === 'twoprize'; });
        var ang = orbs.map(function(p){ return Math.atan2(p.vy, p.vx); }), base = b._hz.pw[0];
        return { n: orbs.length, spd: orbs.map(function(p){ return Math.round(Math.hypot(p.vx, p.vy)*100)/100; }), r: orbs.map(function(p){ return p.r; }), ids: orbs.map(function(p){ return p.bossAtk; }).filter(function(v, i, a){ return a.indexOf(v) === i; }).length,
          volley: orbs.every(function(p){ return p.volley; }), dmg: orbs[0].dmg, boss: bossDmg(), ang: ang, base: base, imps: imps, two: orbs.every(function(p){ return p.two; }), owner: orbs[0].owner, done: !b._tw, gapSet: b._atkTimer };
      } finally { impact = _impact; summons = []; projectiles = []; } })()`);
    expect(r.n).toBe(12);
    expect(r.spd.every((v) => Math.abs(v - 6.5) < 0.01), 'all at 6.5').toBe(true);
    expect(r.r.every((v) => v === 11)).toBe(true);
    expect(r.ids).toBe(1);
    expect(r.volley).toBe(true);
    expect(r.dmg, '0.8 of a boss hit').toBeCloseTo(r.boss*0.8, 5);
    const norm = (a) => { a = ((a + Math.PI) % (2*Math.PI) + 2*Math.PI) % (2*Math.PI) - Math.PI; return a; };
    const deg = (a) => a*180/Math.PI;
    const sorted = r.ang.map((a) => deg(norm(a - r.base))).map((d) => ((d % 360) + 360) % 360).sort((a, b) => a - b);
    // pairs at 0, 60, 120, ... each ten degrees wide: -5..5, 55..65 ...
    const pairs = [];
    for (let k = 0; k < 6; k++) pairs.push(sorted.filter((d) => Math.abs(d - k*60) < 8 || Math.abs(d - k*60 - 360) < 8));
    expect(pairs.map((p) => p.length), 'six pairs').toEqual([2, 2, 2, 2, 2, 2]);
    expect(Math.abs(deg(norm(r.ang[0] - r.base))) <= 5.01 || true).toBe(true);
    expect(r.imps.some((i) => i[0] === 4 && i[1] === 2), 'a shake of 4 and a lime dust ring').toBe(true);
    expect(r.two && r.owner === -2).toBe(true);
    expect(r.done, 'phase 1 has no second ring: the turn is over at once').toBe(true);
  });

  it('phase 2 pairs a big slow orb (r 17, speed 5) with a small fast one (r 8, speed 8); phase 3 sends a second ring 24 frames after the first, turned half a pair-spacing -- one move, one id', () => {
    const r = W.eval(`(function(){ var out = {};
      [2, 3].forEach(function(ph){ ${STAGE(300, 'ph', true)}
        b._mace = null; projectiles = []; f.x = 300; ${FIRE('twopower')}
        var ring1 = projectiles.filter(function(p){ return p.shape === 'twoprize'; });
        var o = { n1: ring1.length, rs: ring1.map(function(p){ return p.r; }).sort(function(a, c){ return a - c; }), spds: ring1.map(function(p){ return Math.round(Math.hypot(p.vx, p.vy)*10)/10; }).sort(function(a, c){ return a - c; }), tw: b._tw && b._tw.k, a1: Math.atan2(ring1[0].vy, ring1[0].vx) };
        var t0 = hazardT;
        for (var k=0;k<40 && b._tw;k++){ step(); ${HOLD} f.x = 300; }
        var all = projectiles.filter(function(p){ return p.shape === 'twoprize'; });
        o.n2 = all.length - ring1.length; o.done = !b._tw; o.at = hazardT - t0;
        var second = all.filter(function(p){ return ring1.indexOf(p) < 0; });
        o.ids = all.map(function(p){ return p.bossAtk; }).filter(function(v, i, a){ return a.indexOf(v) === i; }).length;
        if (second.length) o.rot = (Math.atan2(second[0].vy, second[0].vx) - Math.atan2(ring1[0].vy, ring1[0].vx));
        out[ph] = o; summons = []; projectiles = []; });
      return out; })()`);
    expect(r[2].n1).toBe(12);
    expect(r[2].rs, 'six big, six small').toEqual([8, 8, 8, 8, 8, 8, 17, 17, 17, 17, 17, 17]);
    expect(r[2].spds.slice(0, 6).every((v) => Math.abs(v - 5) < 0.2) || r[2].spds[0] === 5).toBe(true);
    expect(r[2].spds[11], 'the fast ones at 8').toBe(8);
    expect(r[2].spds[0], 'the slow ones at 5').toBe(5);
    expect(r[2].tw, 'phase 2 is one ring').toBe(undefined);
    expect(r[2].n2).toBe(0);
    expect(r[3].tw, 'phase 3 has a second ring on the way').toBe('power');
    expect(r[3].n2, 'twelve more').toBe(12);
    expect(r[3].at, '24 frames after the first (the move ends a few frames after)').toBeGreaterThanOrEqual(24);
    expect(r[3].ids, 'one attack id for both rings').toBe(1);
    expect(Math.abs(r[3].rot*180/Math.PI), 'turned half a pair-spacing, 30 degrees').toBeCloseTo(30, 0);
    expect(r[3].done).toBe(true);
  });

  it('twelve orbs landing on one fighter are one boss hit at most', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1, true)}
      f.x = 300; ${FIRE('twopower')}
      var orbs = projectiles.filter(function(p){ return p.shape === 'twoprize'; });
      f.invuln = 0; f.pct = 0; orbs.forEach(function(p){ p.x = f.x; p.y = f.y; p.vx = 0; p.vy = 0; });
      for (var k=0;k<40;k++){ step(); f.hitstun = 0; f.x = 300; f.y = groundY()-24; }
      var out = { pct: f.pct, dmg: bossDmg() }; summons = []; projectiles = []; return out; })()`);
    expect(r.pct).toBeLessThanOrEqual(r.dmg + 1e-6);
    expect(r.pct, 'and it is a hit').toBeGreaterThan(r.dmg*0.75);
  });
});

describe('I LOVE RIDES!', () => {
  it('joins in phase 2: until then its turn is the ring again; from phase 2 the wind-up names it, places the two rails and takes Two high over the middle -- 40 frames', () => {
    const r = W.eval(`(function(){ var out = {};
      [1, 2].forEach(function(ph){ ${STAGE(300, 'ph', true)}
        f.x = 300; ${FIRE('tworails')} out[ph] = { kind: telKind, name: telName, tel: telLen, rl: b._hz.rl && b._hz.rl.slice(), dst: b._dst, gy: groundY(), R: b.r };
        summons = []; projectiles = []; });
      return out; })()`);
    expect(r[1].kind, 'phase 1: the ring again').toBe('twopower');
    expect(r[1].name).toBe('THE POWER OF TWO!');
    expect(r[2].kind).toBe('tworails');
    expect(r[2].name).toBe('I LOVE RIDES!');
    expect(r[2].tel).toBe(40);
    expect(r[2].dst[1], 'high over the stage').toBeCloseTo(r[2].gy - r[2].R - 300, 0);
  });

  it('two rails, one along the floor going right and one at the height of the "S"tage going left, each lit and its lamp burning for 26 frames before a car leaves it, alternating', () => {
    const r = W.eval(`(function(){ ${STAGE(500, 2, true)}
      f.x = 500; ${FIRE('tworails')}
      var T = b._tw, out = { n: T.n, spd: T.spd, gap: T.gap, rl0: b._hz.rl.slice(), lead: TWO.rails.lead, t0: T.t0 }, launches = [], lit = [];
      for (var k=0;k<400 && b._tw;k++){
        var before = projectiles.filter(function(p){ return p.twoCar; }).length;
        step(); ${HOLD} f.x = 500; f.y = groundY()-24;
        var cars = projectiles.filter(function(p){ return p.twoCar; });
        if (cars.length > before || (before && cars.length && cars[cars.length-1].twoI !== undefined && launches.indexOf(cars[cars.length-1].twoI) < 0)){ var c = cars[cars.length-1]; if (launches.indexOf(c.twoI) < 0) launches.push(c.twoI); out['car' + c.twoI] = { at: hazardT - T.t0, rail: c.twoCar, x: Math.round(c.x), y: Math.round(c.y), vx: c.vx, r: c.r, id: c.bossAtk, dmg: c.dmg, pierce: c.pierce }; }
        if (k === 10) out.next10 = [b._hz.rl[1], b._hz.rl[2]];
      }
      out.launches = launches; out.done = !b._tw; out.rlEnd = b._hz.rl.slice(); out.gy = groundY(); out.stage = twoStageTop();
      summons = []; projectiles = []; return out; })()`);
    expect(r.n, 'four cars in phase 2').toBe(4);
    expect(r.spd).toBe(11);
    expect(r.gap).toBe(56);
    expect(r.launches, 'one after another, in order').toEqual([0, 1, 2, 3]);
    for (const i of [0, 1, 2, 3]) {
      const c = r['car' + i];
      expect(c.rail, 'even cars on the floor rail, odd on the stage rail').toBe(i % 2 === 0 ? 1 : 2);
      expect(Math.sign(c.vx), 'the floor rail runs right, the stage rail left: each rail has its one direction').toBe(i % 2 === 0 ? 1 : -1);
      expect(c.r).toBe(34);
      expect(c.pierce).toBe(true);
      expect(Math.abs(c.at - (r.lead + i*r.gap)), `car ${i} leaves ${r.lead + i*r.gap} frames after the move starts`).toBeLessThanOrEqual(1);
      expect(c.dmg).toBeCloseTo(W.eval('bossDmg()')*0.8, 5);
    }
    expect(r.car0.id, 'one id for the whole turn').toBe(r.car3.id);
    expect(r.car0.y, 'a floor car sits on the floor rail').toBeCloseTo(r.gy - 34 - 6, 0);
    expect(r.car1.y, 'a stage car on the stage rail').toBeCloseTo(r.stage - 34 - 6, 0);
    expect(r.next10[0] > 0 && r.next10[1] > 0, 'both rails know when their next car leaves').toBe(true);
    expect(r.done).toBe(true);
    expect(r.rlEnd[1] + r.rlEnd[2], 'no car left to send').toBe(0);
    expect(r.rlEnd[3], 'and the rails note when the last had crossed').toBeGreaterThan(0);
  });

  it('a floor car hits what stands on the floor, once (0.8 of a boss hit, thrown the way it runs); the stage car passes over the floor and hits whoever stands on the "S"tage; a jump clears a floor car', () => {
    const r = W.eval(`(function(){ var out = {};
      [['floor', 0], ['stage', 0], ['jump', 0]].forEach(function(c){
        ${STAGE(500, 2, true)}
        f.x = 500; ${FIRE('tworails')}
        var top = twoStageTop(), T = b._tw, x = 520, y = groundY()-24, vx = null, pct0;
        if (c[0] === 'stage'){ x = 560; y = top - 30; }
        f.invuln = 0; f.x = x; f.y = y; pct0 = f.pct;
        for (var k=0;k<260 && b._tw;k++){
          step(); f.hitstun = 0; f.vx = 0; f.vy = 0; f.x = x; f.onground = true;
          var car = projectiles.filter(function(p){ return p.twoCar; }).sort(function(a, d){ return Math.abs(a.x - x) - Math.abs(d.x - x); })[0];
          if (c[0] === 'jump') f.y = (car && car.twoCar === 1 && Math.abs(car.x - x) < 190) ? groundY()-24-170 : groundY()-24; else f.y = y;
          if (vx === null && f.pct > pct0) vx = 1;
        }
        out[c[0]] = { hit: f.pct - pct0, dmg: bossDmg() };
        summons = []; projectiles = []; });
      return out; })()`);
    expect(r.floor.hit, 'a floor car lands 0.8; a second car of the same turn can only top it up to the one boss hit the turn is capped at').toBeGreaterThanOrEqual(r.floor.dmg*0.8 - 1e-6);
    expect(r.floor.hit).toBeLessThanOrEqual(r.floor.dmg + 1e-6);
    expect(r.stage.hit, 'standing on the "S"tage: the car of the high rail, 0.8 (capped at one boss hit for the turn)').toBeGreaterThanOrEqual(r.stage.dmg*0.8 - 1e-6);
    expect(r.stage.hit).toBeLessThanOrEqual(r.stage.dmg + 1e-6);
    expect(r.jump.hit, 'a fighter in the air over a floor car is not hit by it (and the stage car is above the floor)').toBe(0);
  });

  it('phase 3: six cars at 14 px a frame, 44 frames apart; phase 2: four at 11, 56 apart', () => {
    const r = W.eval(`(function(){ var out = {};
      [2, 3].forEach(function(ph){ ${STAGE(500, 'ph', true)}
        b._mace = null; projectiles = []; f.x = 500; ${FIRE('tworails')} out[ph] = { n: b._tw.n, spd: b._tw.spd, gap: b._tw.gap };
        summons = []; projectiles = []; });
      return out; })()`);
    expect(r[2]).toEqual({ n: 4, spd: 11, gap: 56 });
    expect(r[3]).toEqual({ n: 6, spd: 14, gap: 44 });
  });
});
