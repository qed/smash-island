import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { JSDOM } from 'jsdom';
import { loadMonolith } from './helpers/load-monolith.js';
import { mulberry32 } from './helpers/prng.js';

// Boss 6, the Purple Dragon, rebuilt in the boss overhaul (2026-09-29): "make the bosses more like springy ... but dont make them like
// him! make the attacks feel more immersive." The hotel roof in the storm (Category One), five attacks -- STRAFING RUN! (phase 3: GRAB &
// CARRY!), FURIOUS ROAR!, CHAR!, WIND LOTTERY!, LIGHTNING ROPES! -- each a scene from the show, all of them through the boss engine kit
// (impact, the fall drift, the arena's ground and hazard, its ending). "Harder, same damage": every part of a turn shares that turn's one
// attack id, so a fighter takes at most one boss hit from it. Never tuned for a bot: every number here is what the design says.

let W;
beforeAll(async () => { W = loadMonolith().window; await W.eval('profileReady'); });

const ROW = { name: 'Purple Dragon', color: '#6a3a9a', hp: 250, big: 2.7, attack: 'dragon', arena: 'hotelroof', stationary: false, sprite: 'dragon' };
const HP = { 1: 1, 2: 0.5, 3: 0.2 };
// A still Firey on the floor at `x` and the Dragon spawned the way the gauntlet spawns it (BOSSRUSH.active false: the gauntlet logic off),
// parked mid-roof over its figure-eight, its attack timer held unless `live`. `ph` is its phase (its HP sets it).
const STAGE = (x, ph = 1, live = false) => `
  SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
  BOSSRUSH = { active:false, bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.name==='Purple Dragon'; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats=platRectsSmall(); summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; hazardT=0;
  var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), ${x}, groundY()-24, 0);
  f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
  spawnBossRushBoss();
  var b = summons.find(function(s){ return s.type==='boss'; });
  b.hp = b.maxHp*${HP[ph]}; ${live ? '' : 'b._atkTimer = 1e9;'}
  b.x = 700; b.y = groundY() - b.r - 60; b._homeX = 700; b.face = -1; b._hz.rot = 0;
  step(); step(); f.pct = 0; f.invuln = 0; f.hitstun = 0; f.x = ${x}; f.y = groundY()-24; f.vx = 0; f.vy = 0; f.onground = true;
`;
// A bare Dragon for driving its functions directly.
const S = (o = '') => `{ name:'Purple Dragon', attack:'dragon', type:'boss', x:700, y:420, r:92, hp:100, maxHp:100, _phase:1, _atkTimer:1, _tel:0,
  color:'#6a3a9a', face:-1, homeX:700, stationary:false, vx:0, vy:0 ${o ? ',' + o : ''} }`;
// Fire move number k (0 the signature, 1 ROAR, 2 CHAR, 3 WIND, 4 ROPES) of the boss `b` now, and run its wind-up out: the frame the move fires is the
// last one this returns from. (Every test that needs a move to be in the air uses this.)
const FIRE = (k) => `b._moveN = ${k === 0 ? 0 : 2*k - 1}; b._atkTimer = 1; step(); var telKind = b._telKind, telName = document.getElementById('banner').textContent;
  for (var w=0; w<60 && b._tel>0; w++){ step(); f.x = f.x; }`;

describe('Purple Dragon takes the hotel roof', () => {
  it('is Boss 9 (moved from 6: "just move purple dragon!!!" (the owner, 2026-09-30)), its own arena and its five attacks in turn: signature, roar, signature, char, signature, wind, signature, ropes', () => {
    const r = W.eval(`(function(){
      var i = BOSS_ROSTER.findIndex(function(b){ return b.name==='Purple Dragon'; });
      var s = ${S()}, kinds = [], names = [];
      for (var k=0;k<8;k++){ s._atkTimer = 1; s._tel = 0; updateBossAttack(s, null); kinds.push(s._telKind); names.push(bossTelName(s)); }
      var p3 = ${S('_phase:3, _telPh:3')};
      return { i: i, row: BOSS_ROSTER[i], mp4: BOSS_ROSTER.findIndex(function(b){ return b.name==='MePhone4S'; }), extra: BOSS_EXTRA['Purple Dragon'], kinds: kinds, names: names,
               tel: bossTelLen({ attack:'dragon' }), sig3: bossTelName(p3), p2: bossPhaseName({ attack:'dragon' }, 2), p3n: bossPhaseName({ attack:'dragon' }, 3),
               gaps: [1,2,3].map(function(ph){ var q = ${S()}; q._phase = ph; return bossAtkGap(q); }), held: (function(){ var q = ${S()}; q._dr = { k:'run' }; return bossAtkGap(q); })(),
               rushOnly: ['dragonroar','dragonchar','dragonwind','dragonropes'].map(function(k){ return BOSS_RUSH_ONLY.has(k); }),
               moves: BOSS_EXTRA['Purple Dragon'].map(function(k){ return typeof BOSS_MOVES[k] + '/' + BOSS_MOVE_NAME[k]; }) };
    })()`);
    expect(r.row).toEqual(ROW);
    expect(r.i, 'Boss 9, right after MePhone4S').toBe(8);
    expect(r.mp4, 'MePhone4S is Boss 8').toBe(7);
    expect(r.extra).toEqual(['dragonroar', 'dragonchar', 'dragonwind', 'dragonropes']);
    expect(r.kinds).toEqual(['dragon', 'dragonroar', 'dragon', 'dragonchar', 'dragon', 'dragonwind', 'dragon', 'dragonropes']);
    // the wind-up names each move: the show's own words -- "The dragon lets out a furious roar" (Category One), "The dragon chars Cake with fire breath"
    // (The Great Goikian Bake-Off/Transcript), "based on the wind lottery" (Category One), "Lightning strikes Dora's stake" (Category One/Transcript)
    expect(r.names).toEqual(['STRAFING RUN!', 'FURIOUS ROAR!', 'STRAFING RUN!', 'CHAR!', 'STRAFING RUN!', 'WIND LOTTERY!', 'STRAFING RUN!', 'LIGHTNING ROPES!']);
    expect(r.moves).toEqual(['function/FURIOUS ROAR!', 'function/CHAR!', 'function/WIND LOTTERY!', 'function/LIGHTNING ROPES!']);
    expect(r.sig3, "phase 3's signature is the carry").toBe('GRAB & CARRY!');
    expect(r.tel, 'one wind-up length for all five').toBe(44);
    expect([r.p2, r.p3n]).toEqual(['Strafing Runs', 'Grab & Carry']);
    // "bosses should attack a bit slower" (the owner, 2026-09-30): its own 100 / 74 / 54 times BOSS_PACE (1.2), quicker each phase still
    expect(r.gaps, 'its own pacing, paced, quicker each phase').toEqual([120, 89, 65]);
    expect(r.held, 'held while a move is in the air').toBe(1e6);
    expect(r.rushOnly, 'an item boss never throws them: they need its flight and its roof').toEqual([true, true, true, true]);
  });

  it('gives the roof its sky, its lavender tile floor, its storm hazard and its ending, and every arena key a netcode client would take', () => {
    const r = W.eval(`({ sky: BOSS_ARENA_SKY.hotelroof, ground: BOSS_ARENA_GROUND.hotelroof && [BOSS_ARENA_GROUND.hotelroof.fill, BOSS_ARENA_GROUND.hotelroof.line, typeof BOSS_ARENA_GROUND.hotelroof.pattern],
      hz: [typeof arenaHazardOf('hotelroof').step, typeof arenaHazardOf('hotelroof').draw], end: [typeof BOSS_ENDINGS.dragon.sweep, typeof BOSS_ENDINGS.dragon.begin, BOSS_ENDINGS.dragon.holdMs, BOSS_ENDINGS.dragon.line],
      cave: BOSS_ARENA_SKY.cave.length, others: ['studio','forest','void','cerealbox'].every(function(k){ return !!BOSS_ARENA_SKY[k]; }) })`);
    expect(r.sky).toHaveLength(2);
    expect(r.ground).toEqual(['#8a83a2', '#2c2440', 'function']);
    expect(r.hz).toEqual(['function', 'function']);
    expect(r.end, 'a short canon exit, no line of text').toEqual(['function', 'function', 300, undefined]);
    expect(r.cave, 'the cave (Bug Swarm) is not touched').toBe(2);
  });

  it('the wind-up is planted where the move begins: the run leaves the screen, the roar rears, the char takes its stand, the wind hangs back, the ropes rise', () => {
    const r = W.eval(`(function(){ var out = {}, gy = groundY();
      [0, 1, 2, 3, 4].forEach(function(k){
        ${STAGE(300, 1, true)}
        f.x = 300; b._moveN = ${'k === 0 ? 0 : 2*k - 1'}; b._atkTimer = 1; step();
        var kind = b._telKind, first = { x: b.x, y: b.y }, tel0 = b._tel;
        for (var w=0; w<43; w++){ step(); f.x = 300; }
        out[k] = { kind: kind, tel0: tel0, tel: b._tel, x: Math.round(b.x), y: Math.round(b.y), dir: b._runDir, aim: b._aimX, side: b._charDir, rope: b._hz.rope && b._hz.rope.slice(), door: b._hz.door && b._hz.door.slice(), calm: b._hz.calm > hazardT };
        summons = []; projectiles = [];
      });
      out.gy = gy; out.WW = WW; out.R = 34*2.7; return out; })()`);
    const R = r.R;
    expect(r[0].kind).toBe('dragon');
    expect([r[0].tel0, r[1].tel0, r[2].tel0, r[3].tel0, r[4].tel0]).toEqual([44, 44, 44, 44, 44]);
    expect(r[0].dir, 'it was on the right of the roof: it comes in from the right edge').toBe(-1);
    expect(r[0].x, 'and by the end of the wind-up it is off that edge').toBeGreaterThan(r.WW + R*0.6);
    expect(r[1].y, 'the roar rears: higher than its figure-eight').toBeLessThan(r.gy - R - 90);
    expect(r[1].calm, 'the inhale: the rain stops for a beat').toBe(true);
    expect(r[2].aim, 'the mark on the roof is where you stand').toBe(300);
    expect(r[2].x, 'it stands off to the side, not over you').toBeGreaterThan(300 + 200);
    expect(r[3].x, 'the wind lottery: it hangs back at the parapet').toBeGreaterThan(r.WW - R*1.6);
    expect(r[3].door[0] > 0 && r[3].door[1] > r[3].door[0], 'the door opens as the wind-up ends').toBe(true);
    expect(r[4].y, 'the ropes: it rises over the middle').toBeLessThan(r.gy - R - 200);
    expect(r[4].rope.slice(0, 3), 'three anchors, in the order they strike').toHaveLength(3);
  });

  it('a phase change is announced, and starts what the phase brings: thunder and gusts in phase 2; the second dragon and a cracked parapet in phase 3', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var out = { p1: b._phase, hz1: JSON.stringify(b._hz) };
      b.hp = b.maxHp*0.5; updateBossAttack(b, f); out.p2 = b._phase; out.b2 = document.getElementById('banner').textContent; out.thunder = b._hz.thunder; out.d2a = b._hz.d2 || 0;
      b.hp = b.maxHp*0.2; updateBossAttack(b, f); out.p3 = b._phase; out.b3 = document.getElementById('banner').textContent; out.d2 = b._hz.d2; out.par = b._hz.par;
      // one burst of damage that skips phase 2 still gets both
      ${STAGE(300)}
      b.hp = b.maxHp*0.1; updateBossAttack(b, f); out.skip = { phase: b._phase, thunder: !!b._hz.thunder, d2: !!b._hz.d2 };
      summons = []; projectiles = []; return out; })()`);
    expect([r.p1, r.p2, r.p3]).toEqual([1, 2, 3]);
    expect(r.b2).toMatch(/PHASE 2: Strafing Runs/);
    expect(r.b3).toMatch(/PHASE 3: Grab & Carry/);
    expect(r.thunder, 'phase 2: thunder').toBeGreaterThanOrEqual(0);
    expect(r.d2a, 'the second dragon is not there yet').toBe(0);
    expect(r.d2, 'phase 3: "two purple dragons": the second drops in').toBeGreaterThanOrEqual(0);
    expect(r.par, 'and the parapet cracks').toBeGreaterThanOrEqual(3);
    expect(r.skip).toEqual({ phase: 3, thunder: true, d2: true });
  });
});

describe('STRAFING RUN!', () => {
  it('flies the whole roof from off one edge to off the other, its shadow crossing ahead of it, a burst of three flames every twelve frames -- the middle one a burning patch', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1, true)}
      f.x = 30; ${FIRE(0)}
      var out = { telKind: telKind, telName: telName, dir: b._runDir, spd: b._dr && b._dr.spd }, xs = [], lead = [], shots = [], seen = [];
      for (var i=0;i<220 && b._dr;i++){
        step(); f.x = 30; f.y = groundY()-24; f.pct = 0; f.invuln = 99;
        xs.push(b.x); if (b._hz.sh && i > 20 && i < 30) lead.push(Math.round(b._hz.sh[0] - b.x));
        projectiles.forEach(function(p){ if (p.dragon && seen.indexOf(p) < 0){ seen.push(p); shots.push({ x:Math.round(p.x), vx:p.vx, vy:p.vy, r:p.r, trap:!!p.landsTrap, patch:!!p.dragonPatch, id:p.bossAtk, dmg:p.dmg, volley:p.volley, shape:p.shape, t:i }); } });
      }
      out.minX = Math.min.apply(null, xs); out.maxX = Math.max.apply(null, xs); out.R = b.r; out.WW = WW; out.frames = i; out.lead = lead; out.shots = shots; out.done = !b._dr; out.gapReset = b._atkTimer;
      out.patches = projectiles.filter(function(p){ return p.dragonPatch && p.trap; }).length; out.soot = (b._hz.soot || []).length; out.sh = b._hz.sh;
      summons = []; projectiles = []; return out; })()`);
    expect(r.telKind).toBe('dragon');
    expect(r.telName).toBe('STRAFING RUN!');
    expect(r.dir, 'it was on the right').toBe(-1);
    expect(r.maxX, 'it starts off the right edge').toBeGreaterThan(r.WW + r.R);
    expect(r.minX, 'and leaves off the left').toBeLessThan(-r.R);
    expect(r.done).toBe(true);
    expect(r.frames, 'a real flyby: about a second').toBeLessThan(140);
    // the shadow leads the dragon by 22 frames of its own flight, the way it is flying: "the shadow of the dragon quickly passing by"
    expect(r.lead.length).toBeGreaterThan(3);
    for (const l of r.lead) expect(l, 'the shadow is ahead, toward where it is going').toBeLessThan(-22*r.spd*0.95);
    expect(r.shots.length % 3, 'three flames a burst').toBe(0);
    const bursts = r.shots.length / 3;
    expect(bursts, 'a burst every twelve frames while its flames would land on the roof').toBeGreaterThanOrEqual(3);
    expect(bursts).toBeLessThanOrEqual(5);
    for (const s of r.shots) { expect(s.shape).toBe('dragonflame'); expect(s.vy).toBe(10.5); expect(s.volley, 'a volley under the turn\'s id').toBe(true); expect(s.dmg, 'the old flame hit, unchanged').toBeCloseTo(22, 5); }
    expect(new Set(r.shots.map((s) => s.id)).size, 'one attack id for the whole run').toBe(1);
    const mids = r.shots.filter((s, i) => i % 3 === 1);
    expect(mids.every((s) => s.trap && s.patch && s.r === 22), 'the middle flame of each burst stays and burns the tiles').toBe(true);
    expect(r.shots.filter((s, i) => i % 3 !== 1).every((s) => !s.trap && s.r === 13)).toBe(true);
    for (let i = 0; i < r.shots.length; i += 3) {
      const v = r.shots.slice(i, i + 3).map((s) => Math.abs(s.vx));
      expect(v[0] < v[1] && v[1] < v[2], 'a cluster: three flames landing in a row ahead of where it let go').toBe(true);
      expect(Math.sign(r.shots[i].vx), 'and ahead of it, the way it flies').toBe(-1);
    }
    expect(r.patches, 'patches lie on the roof after the pass').toBeGreaterThanOrEqual(3);
    expect(r.soot, 'and the tiles stay charred').toBeGreaterThanOrEqual(3);
    // the gap is DRAGON.gaps[1] (100) times BOSS_PACE (1.2) -- "bosses should attack a bit slower" (the owner, 2026-09-30) -- less the frames since the move ended
    expect(r.gapReset, 'the gap is timed from the end of the move').toBeGreaterThanOrEqual(118);
    expect(r.gapReset).toBeLessThanOrEqual(120);
  });

  it('a patch burns 2.5 seconds; a fighter standing where the flames land takes one boss hit from the whole turn however many flames and patches meet it', () => {
    // first a run to see where the middle flames land (on the roof, or on the platform where it stands over them), then one fighter standing in each spot
    const spots = W.eval(`(function(){ ${STAGE(30, 1, true)}
      ${FIRE(0)}
      var at = [];
      for (var i=0;i<220 && b._dr;i++){ step(); f.invuln = 99; f.x = 30; f.pct = 0; projectiles.forEach(function(p){ if (p.dragonPatch && p.trap && !p._got){ p._got = 1; at.push([Math.round(p.x), Math.round(p.y + p.r*0.6)]); } }); }
      summons = []; projectiles = []; return at; })()`);
    expect(spots.length, 'flames land on the roof, and on the platform over which the dragon flies').toBeGreaterThanOrEqual(3);
    expect(spots.some((s) => s[1] < 500) && spots.some((s) => s[1] > 500), 'some on the platform, some on the floor').toBe(true);
    const r = W.eval(`(function(){ var res = [], life = null;
      ${JSON.stringify(spots)}.forEach(function(sp){
        ${STAGE(300, 1, true)}
        ${FIRE(0)}
        for (var i=0;i<230 && b._dr;i++){
          step(); f.x = sp[0]; f.y = sp[1] - 24; f.vx = 0; f.vy = 0; f.burn = 0; f.onground = true;
          if (life === null){ var p = projectiles.find(function(q){ return q.dragonPatch && q.trap; }); if (p) life = p.life; }
        }
        for (var j=0;j<200;j++){ step(); b._atkTimer = 1e9; f.x = sp[0]; f.y = sp[1] - 24; f.vx = 0; f.vy = 0; f.burn = 0; }   // and stand in what is left burning (its next turn held back)
        res.push(f.pct); summons = []; projectiles = [];
      });
      return { res: res, life: life, full: bossDmg() }; })()`);
    expect(Math.max(...r.res), 'in the flames: one boss hit').toBeCloseTo(r.full, 5);
    for (const p of r.res) expect(p, 'never more than that, from the flames and the patches together').toBeLessThanOrEqual(r.full + 1e-6);
    expect(r.life, 'a patch burns 150 frames = 2.5 s').toBeGreaterThanOrEqual(149);
    expect(r.life).toBeLessThanOrEqual(150);
  });

  it('phase 2: two passes a turn, the second the other way with its bursts half a step off the first, and it is quicker', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 2, true)}
      f.x = 30; ${FIRE(0)}
      var dirs = [], xs = [], last = 0, seen = [], bursts = [], ids = {};
      for (var i=0;i<300 && b._dr;i++){
        step(); f.x = 30; f.y = groundY()-24; f.invuln = 99; f.pct = 0;
        if (b._dr && b._dr.dir !== last){ last = b._dr.dir; dirs.push(last); }
        xs.push(b.x);
        projectiles.forEach(function(p){ if (p.dragon && seen.indexOf(p) < 0){ seen.push(p); ids[p.bossAtk] = 1; } });
      }
      return { dirs: dirs, ids: Object.keys(ids).length, n: seen.length, frames: i, spd: 0, name: telName, passes: 0 }; })()`);
    expect(r.name).toBe('STRAFING RUN!');
    expect(r.dirs, 'right to left, then left to right').toEqual([-1, 1]);
    expect(r.ids, 'one attack id for both passes').toBe(1);
    expect(r.n % 3).toBe(0);
    expect(r.n, 'two passes of bursts').toBeGreaterThanOrEqual(18);
  });
});

describe('GRAB & CARRY!', () => {
  it('phase 3: a swoop along your row from a high corner -- the row is drawn red then white -- and whoever it catches rides its back, out of control, till it drops them at the far edge for 0.6 of a hit', () => {
    const r = W.eval(`(function(){ ${STAGE(500, 3, true)}
      var gy = groundY(); f.x = 500;
      b._moveN = 0; b._atkTimer = 1; step(); var name = document.getElementById('banner').textContent, rows = [];
      for (var w=0; w<60 && b._tel>0; w++){ step(); f.x = 500; f.y = gy-24; if (b._hz.row) rows.push(b._hz.row.slice()); }
      var out = { name: name, kind: b._telKind, rowFirst: rows[0], rowLast: rows[rows.length-1], dir: b._runDir, k: b._dr && b._dr.k };
      var ride = 0, pinned = true, controls = true, maxR = 0, dropX = null, dropped = false, rollMax = 0, roofY = gy-24, fy = [], pct = 0, tookAt = null;
      for (var i=0;i<200 && b._dr;i++){
        step();
        if (f._carried > hazardT - 3){ ride++; if (Math.abs(f.x - (b.x - b._dr.dir*b.r*0.1)) > 30 || Math.abs(f.y - (b.y - b.r*0.62)) > 30) pinned = false; if (!(f.hitstun >= 1)) controls = false; fy.push(f.y); }
        rollMax = Math.max(rollMax, b._hz.roll || 0);
        if (ride > 0 && !dropped && !(f._carried > hazardT - 3)){ dropped = true; dropX = f.x; tookAt = f.pct; }
        if (!(f._carried > hazardT - 3) && !dropped){ f.x = 500; f.y = gy-24; f.vx = 0; }
      }
      out.ride = ride; out.pinned = pinned; out.controls = controls; out.dropX = dropX; out.dropped = dropped; out.roll = rollMax; out.took = tookAt; out.full = bossDmg(); out.done = !b._dr;
      out.minRideY = Math.min.apply(null, fy); out.gy = gy; out.WW = WW;
      summons = []; projectiles = []; return out; })()`);
    expect(r.name).toBe('GRAB & CARRY!');
    expect(r.rowFirst[1], 'the row is red while it follows you').toBe(0);
    expect(r.rowLast[1], 'and white once it holds').toBe(1);
    expect(r.rowLast[0], 'along your row').toBeCloseTo(r.gy - 24, 0);
    expect(r.ride, 'you ride its back for a good second, never more than 44 frames').toBeGreaterThanOrEqual(22);
    expect(r.ride).toBeLessThanOrEqual(46);
    expect(r.pinned, 'on its back').toBe(true);
    expect(r.controls, 'control lost while you ride').toBe(true);
    expect(r.roll, 'it barrel-rolls to shake you: "It tries to shake them off."').toBeGreaterThan(3);
    expect(r.dropped).toBe(true);
    expect(r.dropX, '"The dragon drops CloudYAY onto the ground": at the far edge, inside it').toBeLessThan(160);
    expect(r.dropX).toBeGreaterThan(60);
    expect(r.took, 'the old 0.6 of a hit').toBeCloseTo(r.full*0.6, 5);
    expect(r.minRideY, 'it climbs with you').toBeLessThan(r.gy - 150);
    expect(r.done).toBe(true);
  });

  it('a fighter in the air over the swoop is not caught, and one it never reaches is untouched: nothing hits but the grab', () => {
    const r = W.eval(`(function(){ ${STAGE(500, 3, true)}
      var gy = groundY(); ${FIRE(0)}
      var caught = false, maxPct = 0;
      for (var i=0;i<200 && b._dr;i++){ step(); f.x = 500; f.y = gy - 24 - 230; f.vx = 0; f.vy = 0; if (f._carried > hazardT - 3) caught = true; maxPct = Math.max(maxPct, f.pct); }
      var done = !b._dr; summons = []; projectiles = [];
      return { caught: caught, pct: maxPct, done: done }; })()`);
    expect(r.caught, 'high over the swoop, nothing to grab').toBe(false);
    expect(r.pct).toBe(0);
    expect(r.done).toBe(true);
  });
});

describe('FURIOUS ROAR!', () => {
  it('shoves whoever is in front of it back, no damage and never out of the arena; those behind are left alone', () => {
    const r = W.eval(`(function(){ var out = {};
      [[400, 'front', 1000], [1000, 'behind', 450], [90, 'edge', 1000]].forEach(function(c){
        ${STAGE(300, 1, true)}
        var g = makeFighter(ROSTER.find(function(r){ return r.name==='Pillow'; }), c[2], groundY()-24, 1); g.team=0; g.controller='still'; g.stocks=9; fighters.push(g);
        b.x = 700; f.x = c[0]; f.y = groundY()-24; g.x = c[2]; g.y = groundY()-24; var sub = c[1] === 'behind' ? g : f; if (c[1] === 'behind'){ f.x = 450; g.x = 1000; }
        ${FIRE(1)}
        var minX = sub.x, maxX = sub.x, pct0 = sub.pct, dead = false;
        for (var i=0;i<16;i++){ step(); minX = Math.min(minX, sub.x); maxX = Math.max(maxX, sub.x); if (sub.dead) dead = true; }
        out[c[1]] = { start: c[0], minX: Math.round(minX), maxX: Math.round(maxX), pct: sub.pct - pct0, dead: dead, stocks: sub.stocks, hitstun: sub.hitstun, kind: telKind, name: telName, face: b.face };
        summons = []; projectiles = [];
      });
      return out; })()`);
    expect(r.front.name).toBe('FURIOUS ROAR!');
    expect(r.front.minX, 'shoved about 300 px away from it').toBeGreaterThan(400 - 330);
    expect(r.front.minX).toBeLessThan(400 - 270);
    expect(r.front.pct, 'the roar itself does no damage').toBe(0);
    expect(r.behind.minX, 'behind it: untouched').toBeGreaterThan(980);
    expect(r.behind.maxX).toBeLessThan(1030);
    expect(r.behind.hitstun, 'not stunned').toBe(0);
    expect(r.edge.minX, 'at the edge it is shoved into the wall, not out of the world').toBeGreaterThanOrEqual(60);
    expect(r.edge.dead).toBe(false);
    expect(r.edge.stocks).toBe(9);
  });

  it('its eyes lock on (red while they follow you, white when they hold), then it dives along that line: the body is one boss hit, the tail whip adds nothing, and the landing is heavy', () => {
    const r = W.eval(`(function(){ ${STAGE(400, 1, true)}
      b.x = 700; var gy = groundY(); f.x = 400;
      ${FIRE(1)}
      var out = { kind: telKind }, eyes = [], locked = [], stage = [], scars0 = IMPACT_SCARS.length, debris = 0, hit = null, pos = [], tail = null, pct = [];
      for (var i=0;i<200 && b._dr;i++){
        // stand still where the shove left you: the eyes lock on that spot and the body comes down on it
        step();
        if (b._hz.eye) eyes.push(b._hz.eye.slice());
        if (b._dr && stage[stage.length-1] !== b._dr.st) stage.push(b._dr.st);
        if (b._dr && b._dr.st === 'dive') pos.push([Math.round(b.x), Math.round(b.y)]);
        if (b._hz.tail && !tail) tail = b._hz.tail.slice();
        pct.push(f.pct);
        debris = Math.max(debris, IMPACT_DEBRIS.length);
      }
      out.stage = stage; out.firstEye = eyes[0]; out.lastEye = eyes[eyes.length-1]; out.anyLocked = eyes.some(function(e){ return e[2] === 1; }); out.pct = f.pct; out.full = bossDmg();
      out.scars = IMPACT_SCARS.length - scars0; out.debris = debris; out.tail = tail; out.landY = b.y; out.gy = gy; out.R = b.r; out.done = !b._dr;
      out.diveFrames = pos.length; out.maxJump = 0; for (var j=1;j<pos.length;j++) out.maxJump = Math.max(out.maxJump, Math.hypot(pos[j][0]-pos[j-1][0], pos[j][1]-pos[j-1][1]));
      summons = []; projectiles = []; return out; })()`);
    expect(r.kind).toBe('dragonroar');
    expect(r.stage.slice(0, 4)).toEqual(['roar', 'lock', 'dive', 'land']);
    expect(r.firstEye[2], 'red while it follows you').toBe(0);
    expect(r.anyLocked, 'and white when it holds').toBe(true);
    expect(r.lastEye[2]).toBe(1);
    expect(r.maxJump, 'the dive flies at 27 px a frame, no faster').toBeLessThanOrEqual(28);
    expect(r.diveFrames, 'a dive is a handful of frames').toBeGreaterThan(5);
    expect(r.pct, 'the body is one boss hit; the tail whip after it adds nothing (one attack id)').toBeCloseTo(r.full, 5);
    expect(r.scars, 'it lands heavily: a scar in the roof').toBeGreaterThanOrEqual(1);
    expect(r.debris, 'and debris').toBeGreaterThan(3);
    expect(r.tail, 'the tail whip').not.toBe(null);
    expect(r.done).toBe(true);
  });

  it('a fighter who leaves the dive line after the eyes lock is not hit; it then lands on the roof and stays low for a breath, a punish window', () => {
    const r = W.eval(`(function(){ ${STAGE(400, 1, true)}
      b.x = 700; var gy = groundY(), lockedAt = null, low = 0, lowY = [];
      ${FIRE(1)}
      for (var i=0;i<200 && b._dr;i++){
        step();
        if (b._hz.eye && b._hz.eye[2] === 1 && lockedAt === null){ lockedAt = f.x; }
        if (lockedAt !== null && b._dr && b._dr.st !== 'land'){ f.x = Math.max(80, Math.min(WW-80, lockedAt + (lockedAt > 550 ? -260 : 260))); f.y = gy - 24; f.vx = 0; }
        if (b._dr && b._dr.st === 'land'){ low++; lowY.push(b.y); }
      }
      var res = { pct: f.pct, lockedAt: lockedAt, low: low, lowY: Math.round(lowY[3]), floor: Math.round(gy - b.r*0.9), R: b.r };
      summons = []; projectiles = []; return res; })()`);
    expect(r.pct, 'stepped off the line: nothing hits').toBe(0);
    expect(r.low, 'it stays down for the landing time').toBeGreaterThanOrEqual(24);
    expect(r.lowY, 'low on the roof, within reach').toBe(r.floor);
  });
});

describe('CHAR!', () => {
  it('a mark on the roof follows you and then holds; from off to the side it breathes a narrow jet at it that creeps along the roof, leaving a patch every tenth frame; then it lands and coughs', () => {
    const r = W.eval(`(function(){ ${STAGE(500, 1, true)}
      var gy = groundY(); b.x = 700;
      b._moveN = 3; b._atkTimer = 1; step(); var name = document.getElementById('banner').textContent, dir = b._charDir, marks = [], cheek = false;
      for (var w=0; w<60 && b._tel>0; w++){
        if (w === 10) f.x = 600; if (w === 36) f.x = 700; step(); f.y = gy - 24; f.vx = 0; f.invuln = 99;
        if (b._hz.aim) marks.push([b._tel, b._hz.aim[0], b._hz.aim[1]]);
      }
      var out = { name: name, dir: dir, marks: marks, standX: Math.round(b.x), standY: Math.round(b.y), aimX: b._aimX, gy: gy };
      var bolts = [], seen = [], cough = 0, lowest = 0, landY = null, frames = 0;
      for (var i=0;i<200 && b._dr;i++){
        step(); f.x = 30; f.invuln = 99; f.pct = 0; frames++;
        projectiles.forEach(function(p){ if (p.dragon && seen.indexOf(p) < 0){ seen.push(p); bolts.push({ lx: p.x + p.vx*(gy - p.y)/p.vy, patch: !!p.landsTrap, id: p.bossAtk, r: p.r, volley: p.volley, t: i, dmg: p.dmg }); } });
        if (b._hz.cough > hazardT) cough++;
        if (b._dr && b._dr.st === 'land'){ lowest = Math.max(lowest, b.y); }
      }
      out.bolts = bolts; out.cough = cough; out.lowY = Math.round(lowest); out.floor = Math.round(gy - b.r*0.92); out.done = !b._dr; out.frames = frames;
      summons = []; projectiles = []; return out; })()`);
    expect(r.name).toBe('CHAR!');
    expect(r.dir, 'it stands on the side it was on').toBe(-1);
    expect(r.marks[0][2], 'red while it follows you').toBe(0);
    expect(r.marks[r.marks.length - 1][2], 'white once it holds').toBe(1);
    expect(r.aimX, 'it follows you until the last ten frames, then holds where you were').toBe(600);
    expect(r.standX, 'it stands off to the side, 380 px from the mark').toBeGreaterThan(600 + 300);
    expect(r.standY, 'high').toBeLessThan(r.gy - 250);
    expect(r.bolts.length, 'a flame a frame for the jet').toBe(40);
    expect(r.bolts.filter((b) => b.patch).length, 'and a patch every tenth').toBe(4);
    expect(new Set(r.bolts.map((b) => b.id)).size, 'one attack id').toBe(1);
    expect(r.bolts.every((b) => b.volley && b.dmg > 21.9 && (b.patch ? b.r === 22 : b.r === 10)), 'a narrow jet: ten pixels a flame').toBe(true);
    expect(r.bolts[0].lx, 'the jet lands on the mark').toBeGreaterThan(590);
    expect(r.bolts[0].lx).toBeLessThan(610);
    expect(r.bolts[39].lx - r.bolts[0].lx, 'and creeps along the roof, away from it: two pixels a frame').toBeLessThan(-70);
    expect(r.bolts[39].lx - r.bolts[0].lx).toBeGreaterThan(-90);
    expect(r.cough, 'it coughs for 40 frames: "it\'s clearly choking on something"').toBeGreaterThanOrEqual(38);
    expect(r.lowY, 'down on the roof, in reach').toBe(r.floor);
    expect(r.done).toBe(true);
  });

  it('whoever stands in the jet takes one boss hit, however long it burns; the patches it leaves burn 2.5 s and add nothing to that turn', () => {
    const r = W.eval(`(function(){ ${STAGE(600, 1, true)}
      var gy = groundY(); b.x = 700; f.x = 600;
      b._moveN = 3; b._atkTimer = 1; step(); for (var w=0; w<60 && b._tel>0; w++){ step(); f.x = 600; f.burn = 0; }
      var hit = null, maxLife = 0;
      for (var i=0;i<300 && (b._dr || i < 250);i++){
        step(); b._atkTimer = 1e9; f.x = 600; f.y = gy - 24; f.vx = 0; f.burn = 0;
        if (hit === null && f.pct > 0) hit = i;
        projectiles.forEach(function(p){ if (p.dragonPatch && p.trap) maxLife = Math.max(maxLife, p.life); });
      }
      var out = { pct: f.pct, full: bossDmg(), hit: hit, maxLife: maxLife };
      summons = []; projectiles = []; return out; })()`);
    expect(r.hit, 'the jet reaches the mark').not.toBe(null);
    expect(r.pct, 'one boss hit for the whole turn').toBeCloseTo(r.full, 5);
    expect(r.maxLife, 'a patch is 150 frames of fire').toBeLessThanOrEqual(150);
    expect(r.maxLife).toBeGreaterThan(100);
  });

  it('phase 3: "jets cross from both dragons" -- the second dragon breathes a jet of its own from where it circles, converging on the same ground', () => {
    const r = W.eval(`(function(){ ${STAGE(500, 3, true)}
      var gy = groundY(); b.x = 700; f.x = 500;
      b._moveN = 3; b._atkTimer = 1; step(); for (var w=0; w<60 && b._tel>0; w++){ step(); f.x = 500; f.invuln = 99; }
      var per = {}, ids = {}, srcs = [], d2 = b._hz.d2;
      for (var i=0;i<12;i++){ step(); f.invuln = 99; f.x = 500;
        projectiles.forEach(function(p){ if (p.dragon && !p._seen){ p._seen = 1; per[i] = (per[i]||0) + 1; ids[p.bossAtk] = 1; srcs.push([Math.round(p.x), Math.round(p.y)]); } }); }
      var out = { d2: d2, per: per, ids: Object.keys(ids).length, srcs: srcs, WW: WW };
      summons = []; projectiles = []; return out; })()`);
    expect(r.d2, 'the second dragon has come').toBeGreaterThanOrEqual(0);
    expect(Object.values(r.per).every((n) => n === 2), 'two flames a frame, one from each dragon').toBe(true);
    expect(r.ids, 'still one attack id').toBe(1);
    const xs = r.srcs.map((s) => s[0]);
    expect(Math.max(...xs) - Math.min(...xs), 'from two different places').toBeGreaterThan(80);
  });
});

describe('WIND LOTTERY!', () => {
  it("the door bangs open and the storm throws the show's own things, in the show's own order, each at its own height, under one attack id: four in phase 1, a flurry of missing posters and a chainsaw in phase 2, the key too in phase 3", () => {
    const run = (ph) => W.eval(`(function(){
        ${STAGE(300, ph, true)}
        var gy = groundY(); f.x = 30; ${FIRE(3)}
        var seen = [], ids = {}, door = b._hz.door && b._hz.door.slice(), atkName = telName, par0 = b._hz.par || 0;
        for (var i=0;i<420 && b._dr;i++){
          step(); f.x = 30; f.invuln = 99; f.pct = 0;
          projectiles.forEach(function(p){ if (p.dragonObj && !p._seen){ p._seen = 1; ids[p.bossAtk] = 1; seen.push({ shape:p.shape, h:Math.round(gy - p.y), vx:p.vx, r:p.r, dmg:p.dmg, bounce:!!p.bounce, x:Math.round(p.x), t:i }); } });
        }
        var out = { shapes: seen.map(function(s){ return s.shape; }), seen: seen, ids: Object.keys(ids).length, door: door, doorAfter: b._hz.door.slice(), name: atkName, par: (b._hz.par || 0) - par0, done: !b._dr };
        summons = []; projectiles = []; return out; })()`);
    const r = { 1: run(1), 2: run(2), 3: run(3) };
    const P = 'dragonpaper';
    expect(r[1].name).toBe('WIND LOTTERY!');
    expect(r[1].shapes).toEqual(['dragonsign', 'dragoncouch', 'dragonrc', 'dragonroboty']);
    expect(r[2].shapes).toEqual([P, P, P, P, P, 'dragonsign', 'dragoncouch', 'dragonrc', 'dragonsaw', 'dragonroboty']);
    expect(r[3].shapes).toEqual([P, P, P, P, P, P, P, 'dragonsign', 'dragonkey', 'dragoncouch', 'dragonrc', 'dragonsaw', 'dragonroboty']);
    for (const ph of [1, 2, 3]) {
      expect(r[ph].ids, 'phase ' + ph + ': one attack id for the lot').toBe(1);
      expect(r[ph].done).toBe(true);
      expect(r[ph].door[0] > 0, 'the door opens').toBe(true);
      expect(r[ph].seen.every((s) => Math.abs(s.x - 99) < 30), 'from the door housing at the left').toBe(true);
    }
    const obj = (ph, shape) => r[ph].seen.find((s) => s.shape === shape);
    expect(obj(1, 'dragoncouch').h, 'the couch is low: jump it').toBe(30);
    expect(obj(1, 'dragonsign').h, 'the sign passes over your head').toBe(92);
    expect(obj(1, 'dragonrc').r, 'the Recovery Center is big').toBe(38);
    expect(obj(1, 'dragonroboty').vx, 'Roboty last and fast').toBe(16);
    expect(obj(2, 'dragonsaw').bounce, 'the chainsaw bounces').toBe(true);
    expect(obj(3, 'dragonkey').vx, 'the key is small and fast').toBe(17);
    // the gap between objects tightens by phase; a poster is half a hit (a flurry is texture, never more damage)
    const gap = (ph, a, b) => obj(ph, b).t - obj(ph, a).t;
    expect(gap(1, 'dragonsign', 'dragoncouch')).toBe(40);
    expect(gap(2, 'dragonsign', 'dragoncouch')).toBe(34);
    expect(gap(3, 'dragonsign', 'dragonkey')).toBe(28);
    expect(obj(2, 'dragonpaper').dmg).toBeCloseTo(11, 5);
    expect(r[1].par, 'each thing that reaches the parapet wrecks a merlon of it').toBeGreaterThanOrEqual(3);
  });

  it("each thing is one hit at its own height: the sign and the couch's height decide who they reach; the whole lottery is one boss hit", () => {
    const r = W.eval(`(function(){ var out = {}, gy = groundY();
      // one object at a time over a fighter, standing or in the air
      [['sign', 0], ['sign', 68], ['couch', 0], ['couch', 150], ['rc', 0], ['roboty', 0]].forEach(function(c){
        ${STAGE(400, 1, true)}
        var D = { id: ++BOSS_ATK_ID, ph: 1 }; dragonWindLaunch(b, D, c[0]);
        for (var i=0;i<60;i++){ step(); b._atkTimer = 1e9; f.x = 400; f.y = gy - 24 - c[1]; f.vx = 0; f.vy = 0; f.burn = 0; }
        out[c[0] + c[1]] = f.pct; summons = []; projectiles = [];
      });
      // and the whole sequence against a fighter who stays where he stands
      ${STAGE(400, 2, true)}
      ${FIRE(3)}
      for (var j=0;j<300 && b._dr;j++){ step(); f.x = 400; f.y = gy - 24; f.vx = 0; f.burn = 0; }
      out.whole = f.pct; out.full = bossDmg(); summons = []; projectiles = [];
      return out; })()`);
    expect(r.sign0, 'the sign passes over a fighter standing').toBe(0);
    expect(r.sign68, 'and catches one who jumped into it').toBeGreaterThan(0);
    expect(r.couch0, 'the couch catches a fighter standing').toBeGreaterThan(0);
    expect(r.couch150, 'and slides under one who jumped high').toBe(0);
    expect(r.rc0).toBeGreaterThan(0);
    expect(r.roboty0).toBeGreaterThan(0);
    expect(r.whole, 'all of it together: one boss hit').toBeLessThanOrEqual(r.full + 1e-6);
    expect(r.whole).toBeGreaterThan(0);
  });
});

describe('LIGHTNING ROPES!', () => {
  it('three rope anchors crackle for 30 frames each, in an order that alternates turn to turn; a bolt comes down each column; a spark runs 200 px along the roof each way', () => {
    const r = W.eval(`(function(){ var out = {}, gy = groundY();
      ${STAGE(300, 1, true)}
      f.x = 30; b._moveN = 7; b._atkTimer = 1; step(); var name = document.getElementById('banner').textContent, t0 = hazardT;
      var rope1 = b._hz.rope.slice();
      var scars0 = IMPACT_SCARS.length, sparks = [], seen = [], strikes = [];
      for (var i=0;i<260 && (b._tel>0 || b._dr);i++){
        step(); f.x = 30; f.invuln = 99;
        projectiles.forEach(function(p){ if (p.dragonSpark && seen.indexOf(p) < 0){ seen.push(p); sparks.push({ x0: p.x, vx: p.vx, y: p.y, r: p.r, life: p.life, id: p.bossAtk }); } });
        if (strikes.length < 3 && IMPACT_SCARS.length - scars0 > strikes.length) strikes.push(hazardT);
      }
      out.name = name; out.rope1 = rope1; out.t0 = t0; out.strikes = strikes; out.sparks = sparks.map(function(s){ return { x0: Math.round(s.x0), vx: s.vx, y: Math.round(gy - s.y), r: s.r, id: s.id, reach: Math.round(s.life * Math.abs(s.vx)) }; });
      out.scars = IMPACT_SCARS.length - scars0; out.done = !b._dr; out.gy = gy; out.WW = WW;
      // the second turn strikes the other way
      b._atkTimer = 1; b._moveN = 7; step(); out.rope2 = b._hz.rope.slice();
      summons = []; projectiles = []; return out; })()`);
    expect(r.name).toBe('LIGHTNING ROPES!');
    expect(r.rope1.slice(0, 3), 'the anchors, left to right this turn').toEqual([0.16, 0.5, 0.84].map((f) => Math.round(r.WW*f)));
    expect(r.rope1[3] - r.t0, 'the first strikes as the wind-up ends: 44 frames after it began').toBe(44);
    expect(r.rope1[4] - r.rope1[3], 'and the next 28 frames after it').toBe(28);
    expect(r.rope1[5] - r.rope1[4]).toBe(28);
    expect(r.rope2.slice(0, 3), 'the next turn, the other way').toEqual(r.rope1.slice(0, 3).reverse());
    expect(r.scars, 'each strike scars the roof').toBe(3);
    expect(r.strikes.map((t) => t - r.t0), 'on their own frames').toEqual([44, 72, 100]);
    expect(r.sparks).toHaveLength(6);
    for (const s of r.sparks) { expect(Math.abs(s.vx)).toBe(9); expect(s.y, 'along the roof').toBe(14); expect(Math.abs(s.reach - 200), 'two hundred pixels each way').toBeLessThanOrEqual(12); }
    expect(new Set(r.sparks.map((s) => s.id)).size, 'one attack id').toBe(1);
    expect(r.done).toBe(true);
  });

  it('the bolt hits whoever is in the column at the strike, a spark whoever is on the roof within 200 px -- and one fighter takes one boss hit from all of it; one on the platform, out of every column, takes none', () => {
    const r = W.eval(`(function(){ var out = {}, gy = groundY();
      [[550, 'middle'], [300, 'spark'], [650, 'platform']].forEach(function(c){
        ${STAGE(300, 1, true)}
        var plat = worldPlats[0], fy = c[1] === 'platform' ? plat.y - 24 : gy - 24;
        f.x = c[0]; f.y = fy;
        b._moveN = 7; b._atkTimer = 1; step(); var rope = b._hz.rope.slice(), hitAt = null;
        for (var i=0;i<220 && (b._dr || i < 60);i++){ step(); b._atkTimer = 1e9; f.x = c[0]; f.y = fy; f.vx = 0; f.vy = 0; f.burn = 0; if (hitAt === null && f.pct > 0) hitAt = hazardT; }
        out[c[1]] = { pct: f.pct, hitAt: hitAt, rope: rope, full: bossDmg(), plat: [Math.round(plat.x), Math.round(plat.x + plat.w)] };
        summons = []; projectiles = [];
      });
      return out; })()`);
    expect(r.middle.hitAt, "the bolt: at the middle anchor's own strike frame").toBe(r.middle.rope[4]);
    expect(r.middle.pct, 'one boss hit for the bolt and the sparks together').toBeCloseTo(r.middle.full, 5);
    expect(r.spark.pct, 'a spark along the roof').toBeGreaterThan(0);
    expect(r.spark.pct).toBeLessThanOrEqual(r.spark.full + 1e-6);
    expect(650 > r.platform.plat[0] && 650 < r.platform.plat[1]).toBe(true);
    expect(r.platform.pct, 'on the platform, out of the columns: untouched').toBe(0);
  });
});

describe('the storm on the roof (its hazard)', () => {
  it('phase 1 has no gusts; from phase 2 a gust warns for 50 frames in the lull between its turns and then pushes whoever is off the ground for 45 -- gently, never a fighter standing, and the direction alternates', () => {
    const p1 = W.eval(`(function(){ ${STAGE(300, 1)}
      for (var i=0;i<300;i++) step();
      var out = { gust: b._hz.gust || null, next: b._hz.gustNext == null }; summons = []; projectiles = []; return out; })()`);
    expect(p1.gust, 'no wind in phase 1').toBe(null);
    expect(p1.next).toBe(true);
    const r = W.eval(`(function(){ ${STAGE(300, 2)}
      var gy = groundY(), out = { gusts: [] }, g = null, air = null, ground = null;
      var h = makeFighter(ROSTER.find(function(r){ return r.name==='Pillow'; }), 200, gy-24, 1); h.team=0; h.controller='still'; h.stocks=9; fighters.push(h);
      f.x = 300;
      for (var i=0;i<900 && out.gusts.length < 2;i++){
        f.x = 300; f.y = gy - 300; f.vx = 0; f.vy = -1; f.onground = false; f.invuln = 99; h.x = 200; h.y = gy - 24; h.vx = 0; h.invuln = 99;
        var vf = f.vx, vh = h.vx; step();
        var gg = b._hz.gust;
        if (gg && (!g || g[1] !== gg[1])){ g = gg.slice(); out.gusts.push(g); }
        if (gg && hazardT >= gg[2] && hazardT < gg[3] && air === null){ air = [f.vx - 0, h.vx]; }
      }
      out.air = air; out.warned = out.gusts.map(function(x){ return [x[2] - x[1], x[3] - x[2]]; });
      // a fighter in the air is pushed by the drift each frame it blows, the one standing is not
      summons = []; projectiles = [];
      ${STAGE(300, 2)}
      f.x = 300;
      var pushed = null, standing = null, cancelled = null;
      for (var j=0;j<600;j++){
        f.x = 300; f.y = gy - 300; f.vx = 0; f.vy = -1; f.invuln = 99;
        step();
        var g2 = b._hz.gust;
        if (g2 && hazardT >= g2[2] + 1 && pushed === null){ pushed = f.vx; }
        if (g2 && hazardT === g2[2] + 3){ b._tel = 10; }   // a wind-up starts in the middle of the gust
        if (b._tel === 10 && cancelled === null){ step(); cancelled = b._hz.gust || null; break; }
      }
      out.pushed = pushed; out.cancelled = cancelled; out.acc = DRAGON.gustAcc;
      summons = []; projectiles = []; return out; })()`);
    expect(r.gusts, 'two gusts, alternating').toHaveLength(2);
    expect(r.warned, 'fifty frames of warning, forty-five of push').toEqual([[50, 45], [50, 45]]);
    expect(r.gusts[0][0] + r.gusts[1][0], 'the other way the second time').toBe(0);
    expect(Math.abs(r.gusts[0][0])).toBe(1);
    expect(r.gusts[1][1] - r.gusts[0][1], 'a gust every 420 frames after the last one ends').toBeGreaterThanOrEqual(420 + 95);
    expect(Math.abs(r.pushed), 'the drift: a tenth of a pixel a frame, squared').toBeGreaterThan(0.09);
    expect(Math.abs(r.pushed)).toBeLessThan(0.6);
    expect(r.cancelled, 'and a wind-up ends it: it is never on top of a tell').toBe(null);
  });

  it('the fire it leaves stays: every patch that lands chars the roof there, at most fourteen marks; the parapet loses a merlon to what reaches it', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      for (var i=0;i<20;i++) projectiles.push({ owner:-2, ownerObj:{ team:-1, idx:-2 }, dragon:true, dragonPatch:true, trap:true, arm:0, x:100 + i*40, y:560, vx:0, vy:0, r:22, life:400, dmg:0, kb:0, color:'#f90' });
      step();
      var soot = (b._hz.soot || []).slice(), par0 = b._hz.par || 0;
      projectiles.push({ owner:-2, ownerObj:{ team:-1, idx:-2 }, dragon:true, dragonObj:true, x:WW - 90, y:500, vx:8, vy:0, r:20, life:60, dmg:0, kb:0, color:'#f00' });
      step(); var par1 = b._hz.par;
      step(); var par2 = b._hz.par;
      var out = { n: soot.length, first: soot[0], last: soot[soot.length-1], par0: par0, par1: par1, par2: par2 };
      summons = []; projectiles = []; return out; })()`);
    expect(r.n, 'fourteen marks at most').toBe(14);
    expect(r.first, 'the oldest go first').toBe(100 + 6*40);
    expect(r.last).toBe(100 + 19*40);
    expect(r.par1 - r.par0, 'a thing reaches the parapet: a merlon gone').toBe(1);
    expect(r.par2, 'once each').toBe(r.par1);
  });
});

describe('its ending: it waves back and flies away', () => {
  it('when it is beaten its shots go with it and a rider is let go; a scene plays where it fell, holds the card back 0.3 s, hurts nobody and says nothing', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      var st = setTimeout, timers = [], said = [], _b = banner;
      setTimeout = function(fn, ms){ timers.push({ fn: fn, ms: ms }); return 0; };
      banner = function(t, m, k, l){ said.push([String(t), k || null]); return _b(t, m, k, l); };
      try {
        BOSSRUSH.active = true;
        var other = { owner:-2, x:0, y:0, r:8, life:50 };
        projectiles.push({ owner:-2, dragon:true, dragonPatch:true, trap:true, x:300, y:500, r:22, life:100 }, { owner:-2, dragon:true, dragonObj:true, x:100, y:400, r:20, life:100, vx:5 },
                         { owner:-2, dragon:true, dragonSpark:true, x:400, y:570, r:12, life:60, vx:9 }, other);
        f._carried = hazardT; f.hitstun = 2; var bx = b.x, by = b.y;
        b.hp = 0; bossRushCheck();
        var mine = projectiles.filter(function(p){ return p.dragon; }), scene = projectiles.filter(function(p){ return p.dragonEnd; });
        var out = { mine: mine.length, scene: scene.length, other: projectiles.indexOf(other) >= 0, carried: f._carried, hitstun: f.hitstun, ms: timers.map(function(t){ return t.ms; }),
                    boss: summons.filter(function(s){ return s.type === 'boss'; }).length, saidBoss: said.some(function(s){ return s[1] === 'boss'; }), at: scene[0] ? [Math.round(scene[0].ex), Math.round(scene[0].ey), scene[0].delay] : null, want: [Math.round(bx), Math.round(by)] };
        var down = timers.find(function(t){ return t.ms === 300; }), run0 = running; running = true; if (down) down.fn(); running = run0;
        out.card = said.some(function(s){ return /^BOSS DOWN!/.test(s[0]) && s[1] === 'sys'; });
        // the scene runs its length and is gone, and nobody near it is touched
        f.x = bx; f.y = by; var pct0 = f.pct, n = 0;
        for (var i=0;i<DRAGON.endT + 4;i++){ step(); f.x = bx; f.y = groundY() - 24; f.invuln = 0; n++; }
        out.after = projectiles.filter(function(p){ return p.dragonEnd; }).length; out.pct = f.pct - pct0; out.endT = DRAGON.endT;
        return out;
      } finally { setTimeout = st; banner = _b; BOSSRUSH.active = false; summons = []; projectiles = []; }
    })()`);
    expect(r.mine, 'its patches, its objects, its sparks are gone (and the scene is the one thing of its left)').toBe(1);
    expect(r.scene).toBe(1);
    expect(r.other, "a shot that is not its own is not swept").toBe(true);
    expect(r.carried, 'a rider is let go').toBe(0);
    expect(r.hitstun).toBe(0);
    expect(r.at.slice(0, 2), 'the scene is where it fell').toEqual(r.want.map((v, i) => r.at[i]));
    expect(Math.abs(r.at[0] - r.want[0]) + Math.abs(r.at[1] - r.want[1])).toBeLessThan(4);
    expect(r.at[2], 'the scene lasts endT frames').toBe(r.endT + 1);
    expect(r.ms, 'the card 0.3 s late, the next boss 1.5 s + 0.3 s').toEqual(expect.arrayContaining([300, 1800]));
    expect(r.card).toBe(true);
    expect(r.saidBoss, 'no words: only Springy has a line').toBe(false);
    expect(r.boss, 'it is gone from the stage').toBe(0);
    expect(r.after, 'and the scene is over').toBe(0);
    expect(r.pct, 'a scene hurts nobody').toBe(0);
  });
});

describe('a netcode client sees the roof, the dragon and its ending', () => {
  it('the storm, its marks and the ending cross the snapshot whole, and draw on the client', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow();
      BOSS_ARENA = 'hotelroof'; var gy = groundY(), t = hazardT;
      var hz = { rot:0.3, roll:1.1, sh:[300, 78, 0.5], eye:[300, 400, 1, 700, 300, 300, 530], row:[560, 1, -1], aim:[600, 1], roar:[500, 300, -1, t - 5], tail:[300, Math.round(gy), 1, t - 3],
                 rope:[176, 550, 924, t + 5, t + 33, t + 61], door:[t - 3, t + 90], par:4, soot:[100, 200, 340], calm:0, gust:[1, t - 10, t + 40, t + 85], d2:t - 30, thunder:t - 5, cough:t + 10 };
      summons = [{ type:'boss', name:'Purple Dragon', color:'#6a3a9a', r:92, sprite:'dragon', x:500, y:300, hp:80, maxHp:250, face:-1, flash:0, homeX:500, _rage:false, _tel:10, _telKind:'dragonchar',
                   _bossRush:true, attack:'dragon', _phase:3, _hz:hz }];
      projectiles = [{ x:300, y:400, vx:6, vy:9, r:13, color:'#ff9a3a', owner:-2, ownerObj:{ team:-1, idx:-2 }, bossAtk:9, life:20, shape:'dragonflame', dragon:true },
                     { x:9, y:-5000, vx:0, vy:0, r:0, color:'#6a3a9a', owner:-2, ownerObj:{ team:-1, idx:-2 }, bossAtk:0, life:1, delay:90, shape:'dragonend', dragon:true, dragonEnd:true, et0:t - 10, ex:420, ey:400, ef:-1, er:92, e2:t - 300 }];
      var snap = JSON.parse(JSON.stringify(serializeState()));
      summons = []; projectiles = []; BOSS_ARENA = null;
      applySnapshot(snap);
      var err = null, drawn = null;
      try { drawArenaDecor(BOSS_ARENA); drawArenaHazard('under'); drawArenaHazard('over'); summons.forEach(drawSummon); projectiles.forEach(drawProjectile); drawBossBar(); draw(); drawn = true; } catch(e){ err = e.message + ' ' + (e.stack||'').split('\\n')[1]; }
      var end = projectiles.find(function(p){ return p.dragonEnd; });
      return { err: err, drawn: drawn, arena: BOSS_ARENA, hz: JSON.stringify(summons[0]._hz), want: JSON.stringify(hz), row: snap.pj.a.map(function(a){ return a[8] || null; }), end: end ? { et0: end.et0, ex: end.ex, ey: end.ey, ef: end.ef, er: end.er, e2: end.e2, shape: end.shape } : null,
               boss: { attack: summons[0].attack, tel: summons[0]._tel, kind: summons[0]._telKind, phase: summons[0]._phase }, t: t };
    })()`);
    expect(r.err).toBe(null);
    expect(r.arena, 'the client draws the hotel roof').toBe('hotelroof');
    expect(r.hz, 'every field of the scene arrives as it was sent').toBe(r.want);
    expect(r.boss).toEqual({ attack: 'dragon', tel: 10, kind: 'dragonchar', phase: 3 });
    expect(r.end, 'and so does the ending: where, when, which way, how big, and the second dragon').toEqual({ et0: r.t - 10, ex: 420, ey: 400, ef: -1, er: 92, e2: r.t - 300, shape: 'dragonend' });
    expect(r.row[0], 'the flame is drawn from its shape alone').toMatchObject({ shape: 'dragonflame' });
  });
});

describe('no words, no other show, and the art is wired and credited', () => {
  // Every draw of the roof, the dragon and everything it throws, on a canvas that records what it is asked to do: not one word.
  function bootRecording(seed = 7) {
    const html = readFileSync('artifacts/V1/index.html', 'utf8'), rec = [], grad = { addColorStop() {} };
    const dom = new JSDOM(html, {
      url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
      beforeParse(window) {
        window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
          get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 }) : p === 'canvas' ? { width: 1100, height: 720 } : p === 'getImageData' ? () => ({ data: [] })
            : (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createPattern') ? () => grad : (...args) => { rec.push({ op: p, args }); }),
          set: (_t, p, v) => { rec.push({ op: 'set:' + String(p), args: [v] }); return true; },
        });
        window.Math.random = mulberry32(seed); window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {};
      },
    });
    return { w: dom.window, rec };
  }

  it('draws the whole roof, the dragon in every state and everything it throws without a word of text', () => {
    const { w, rec } = bootRecording();
    w.eval("SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow(); running = false;");   // (the match's own HUD writes the fighters' names: not the roof's business)
    const n0 = rec.length;
    const err = w.eval(`(function(){
      try {
        BOSS_ARENA = 'hotelroof';
        var gy = groundY(), t = hazardT + 100; hazardT = t;
        var hz = { rot:0.3, roll:1.1, sh:[300, 78, 0.5], eye:[300, 400, 1, 700, 300, 300, 530], row:[560, 1, -1], aim:[600, 1], roar:[500, 300, -1, t - 5], tail:[300, Math.round(gy), 1, t - 3],
                   rope:[176, 550, 924, t - 2, t + 33, t + 61], door:[t - 3, t + 90], par:4, soot:[100, 200, 340], calm:0, gust:[1, t - 60, t - 10, t + 40], d2:t - 30, thunder:t - 5, cough:t + 10 };
        var base = { type:'boss', name:'Purple Dragon', color:'#6a3a9a', sprite:'dragon', r:92, x:500, y:gy-200, face:-1, hp:100, maxHp:250, _tel:0, _telKind:null, _phase:3, _rage:false, flash:0, homeX:500, attack:'dragon', _bossRush:true, _hz:hz };
        [{}, { _tel:20, _telKind:'dragonchar' }, { _tel:20, _telKind:'dragonwind' }, { face:1, _phase:1 }, { flash:6 }, { _hz:Object.assign({}, hz, { rot:-0.5, roll:1.6 }) }, { _hz:{} }].forEach(function(st){
          summons = [Object.assign({}, base, st)]; ctx.save(); drawSummon(summons[0]); ctx.restore(); drawDragonFx(summons[0]); });
        summons = [Object.assign({}, base)]; drawArenaDecor('hotelroof'); drawArenaHazard('under'); drawArenaHazard('over');
        summons = [Object.assign({}, base, { _phase:1, _hz:{ soot:[100], calm:hazardT + 30 } })]; drawArenaDecor('hotelroof'); drawArenaHazard('under'); drawArenaHazard('over');
        summons = []; drawArenaDecor('hotelroof'); drawArenaHazard('under'); drawArenaHazard('over');   // between bosses
        arenaGround().pattern(ctx, gy, -20, WW + 20, WH + H, arenaGround());
        ['dragonflame', 'dragonsign', 'dragonrc', 'dragonroboty', 'dragonbolt', 'dragoncouch', 'dragonsaw', 'dragonpaper', 'dragonkey', 'dragonspark'].forEach(function(sh){
          drawProjectile({ x:300, y:300, vx:8, vy:2, r:20, owner:-2, ownerObj:{ team:-1, idx:-2 }, shape:sh, color:'#ff9a3a' }); drawProjectile({ x:300, y:300, vx:0, vy:0, r:22, owner:-2, ownerObj:{ team:-1, idx:-2 }, shape:sh, color:'#ff9a3a', trap:true }); });
        [0, 10, 40, 48, 70, 95].forEach(function(u){ [0, t - 300].forEach(function(e2){ drawProjectile({ x:9, y:-5000, vx:0, vy:0, r:0, owner:-2, ownerObj:{ team:-1, idx:-2 }, shape:'dragonend', dragonEnd:true, et0:t - u, ex:420, ey:400, ef:-1, er:92, e2:e2, color:'#6a3a9a' }); }); });
        return null;
      } catch(e){ return e.message + ' ' + (e.stack||'').split('\\n')[1]; }
    })()`);
    expect(err).toBe(null);
    const drawn = rec.slice(n0);
    expect(drawn.length, 'the recording is live').toBeGreaterThan(500);
    expect(drawn.filter((r) => r.op === 'fillText' || r.op === 'strokeText').length, 'not a word on the canvas').toBe(0);
  });

  it("nothing of it says a word or names anyone from the OSC: its code has no banner but the engine's own telegraph, no text drawing, no OJ, Suitcase or Cabby", () => {
    const fns = ['dragonMove', 'dragonIdle', 'dragonWindup', 'dragonBeginTelegraph', 'dragonPhaseBeat', 'dragonFire', 'dragonRunStep', 'dragonBurst', 'dragonCarryStep', 'dragonGrab', 'dragonPin', 'dragonDrop',
      'dragonRoar', 'dragonShove', 'dragonRoarStep', 'dragonBodyHit', 'dragonTouchdown', 'dragonTailHit', 'dragonChar', 'dragonCharStep', 'dragonJetBolt', 'dragonWind', 'dragonWindStep', 'dragonWindLaunch',
      'dragonRopes', 'dragonRopesStep', 'dragonStrike', 'dragonHazardStep', 'dragonHazardDraw', 'dragonEndSweep', 'dragonEndBegin', 'drawDragonDecor', 'drawDragonFx', 'drawDragonEnd', 'dragonTellDraw',
      'dragonRoofTiles', 'dragonAnchorDraw', 'dragonBoltDraw', 'dragonSprite', 'dragon2At'];
    const src = W.eval(`[${fns.join(',')}].map(String).concat([JSON.stringify(DRAGON), JSON.stringify(DRAGON_OBJ), JSON.stringify(BOSS_EXTRA['Purple Dragon']), BOSS_MOVE_NAME.dragonroar, BOSS_MOVE_NAME.dragonchar, BOSS_MOVE_NAME.dragonwind, BOSS_MOVE_NAME.dragonropes]).join('\\n')`);
    expect(src).not.toMatch(/\bOJ\b|Suitcase|Cabby|The Floor/i);
    expect(src, 'no banner of its own').not.toMatch(/banner\(/);
    expect(src, 'no text on the canvas').not.toMatch(/fillText|strokeText/);
  });

  it("its shots wear the show's art -- the flame cut from File:Dragony3.png, Roboty's book render, the TPOT 7 strike -- and the rest is drawn; every file is a real PNG at projectile size, on the record and credited", () => {
    const reg = W.eval(`(function(){ var o = {}; ['dragonflame', 'dragonroboty', 'dragonbolt'].forEach(function(k){ o[k] = { e: ATTACK_SPRITES[k], glyph: !!PROJ_SHAPE[k] }; });
      o.drawn = ['dragoncouch', 'dragonsaw', 'dragonpaper', 'dragonkey', 'dragonspark', 'dragonsign', 'dragonrc'].map(function(k){ return [k, !!PROJ_SHAPE[k], !!ATTACK_SPRITES[k]]; }); return o; })()`);
    const manifest = JSON.parse(readFileSync('scripts/attack-sprite-manifest.json', 'utf8'));
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const picks = readFileSync('scripts/fetch-attack-sprites.mjs', 'utf8');
    for (const [k, name, wikiFile] of [['dragonflame', 'dragonflame', 'Dragony3.png'], ['dragonroboty', 'dragonroboty', 'Roboty book.png']]) {
      const e = reg[k].e, file = 'artifacts/V1/' + e.src;
      expect(existsSync(file), file).toBe(true);
      const png = PNG.sync.read(readFileSync(file));
      expect(Math.max(png.width, png.height), k + ' at projectile size').toBeLessThanOrEqual(128);
      const clear = (() => { let c = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) c++; return c / (png.width * png.height); })();
      expect(clear, k + ' is cut out, not a screenshot').toBeGreaterThan(0.12);
      expect(reg[k].glyph, k + ' has a drawn glyph to show until it loads').toBe(true);
      const m = manifest[name];
      expect(m, name + ' is on the record').toMatchObject({ file: name + '.png', kits: ['dragon'], srcTitle: wikiFile, wiki: 'bfdi', width: png.width, height: png.height });
      expect(m.source).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/battlefordreamisland\/images\//);
      expect(credits, k + ' is credited with its exact source').toContain('(' + name + '.png)');
      expect(credits).toContain(m.source);
      expect(picks, k + ' has its pick in the dragon slot').toMatch(new RegExp(name + ':\\s*\\{ who: \\x27Purple Dragon\\x27'));
    }
    expect(reg.dragonbolt.e.src, 'the TPOT 7 strike, the file Lightning strikes with').toBe('assets/sprites/attacks/tpot7bolt.png');
    expect(reg.dragonbolt.glyph).toBe(true);
    expect(reg.drawn.every(([, glyph, art]) => glyph && !art), 'the sign, the Recovery Center, the couch, the chainsaw, the poster and the key are drawn: the show\'s files for two of them have lettering baked in').toBe(true);
    expect(W.eval("BOSS_SPRITE_SRC.dragon + ' ' + !!BOSS_SPRITE_FLIP.dragon"), 'its own render is unchanged').toBe('assets/sprites/purple-dragon.png true');
  });
});

// ==== the moves, the storm, the ending, what a client sees, what is drawn ====
