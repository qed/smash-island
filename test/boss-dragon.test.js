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
  it('is Boss 6, its own arena and its five attacks in turn: signature, roar, signature, char, signature, wind, signature, ropes', () => {
    const r = W.eval(`(function(){
      var i = BOSS_ROSTER.findIndex(function(b){ return b.name==='Purple Dragon'; });
      var s = ${S()}, kinds = [], names = [];
      for (var k=0;k<8;k++){ s._atkTimer = 1; s._tel = 0; updateBossAttack(s, null); kinds.push(s._telKind); names.push(bossTelName(s)); }
      var p3 = ${S('_phase:3, _telPh:3')};
      return { i: i, row: BOSS_ROSTER[i], mp4: BOSS_ROSTER.findIndex(function(b){ return b.name==='MePhone4'; }), extra: BOSS_EXTRA['Purple Dragon'], kinds: kinds, names: names,
               tel: bossTelLen({ attack:'dragon' }), sig3: bossTelName(p3), p2: bossPhaseName({ attack:'dragon' }, 2), p3n: bossPhaseName({ attack:'dragon' }, 3),
               gaps: [1,2,3].map(function(ph){ var q = ${S()}; q._phase = ph; return bossAtkGap(q); }), held: (function(){ var q = ${S()}; q._dr = { k:'run' }; return bossAtkGap(q); })(),
               rushOnly: ['dragonroar','dragonchar','dragonwind','dragonropes'].map(function(k){ return BOSS_RUSH_ONLY.has(k); }),
               moves: BOSS_EXTRA['Purple Dragon'].map(function(k){ return typeof BOSS_MOVES[k] + '/' + BOSS_MOVE_NAME[k]; }) };
    })()`);
    expect(r.row).toEqual(ROW);
    expect(r.i, 'Boss 6, before MePhone4').toBe(5);
    expect(r.mp4).toBe(6);
    expect(r.extra).toEqual(['dragonroar', 'dragonchar', 'dragonwind', 'dragonropes']);
    expect(r.kinds).toEqual(['dragon', 'dragonroar', 'dragon', 'dragonchar', 'dragon', 'dragonwind', 'dragon', 'dragonropes']);
    // the wind-up names each move: the show's own words -- "The dragon lets out a furious roar" (Category One), "The dragon chars Cake with fire breath"
    // (The Great Goikian Bake-Off/Transcript), "based on the wind lottery" (Category One), "Lightning strikes Dora's stake" (Category One/Transcript)
    expect(r.names).toEqual(['STRAFING RUN!', 'FURIOUS ROAR!', 'STRAFING RUN!', 'CHAR!', 'STRAFING RUN!', 'WIND LOTTERY!', 'STRAFING RUN!', 'LIGHTNING ROPES!']);
    expect(r.moves).toEqual(['function/FURIOUS ROAR!', 'function/CHAR!', 'function/WIND LOTTERY!', 'function/LIGHTNING ROPES!']);
    expect(r.sig3, "phase 3's signature is the carry").toBe('GRAB & CARRY!');
    expect(r.tel, 'one wind-up length for all five').toBe(44);
    expect([r.p2, r.p3n]).toEqual(['Strafing Runs', 'Grab & Carry']);
    expect(r.gaps, 'its own pacing, quicker each phase').toEqual([100, 74, 54]);
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
    expect(r.gapReset, 'the gap is timed from the end of the move').toBeGreaterThanOrEqual(98);
    expect(r.gapReset).toBeLessThanOrEqual(100);
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

// ==== the moves, the storm, the ending, what a client sees, what is drawn ====
