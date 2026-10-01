import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { JSDOM } from 'jsdom';
import { loadMonolith } from './helpers/load-monolith.js';
import { mulberry32 } from './helpers/prng.js';

// Boss 12, the final boss, Four, rebuilt in the boss overhaul (2026-09-29): "make the bosses more like springy ... but dont make them like him! make the attacks
// feel more immersive." Eternal Algebra Class Withfour (dimmed), torn away onto The Fourest in phase 3; six attacks -- SCREECHY!/ZAPPIES! (the signature), GO
// BYE-BYE!, TAKE THE TOWER!, LOVE HEARTS!, I DO THIS!, DON'T HUG THE CACTUS! -- each a scene from the show, through the boss engine kit (impact, the arena's ground and
// hazard, his ending). "Harder, same damage": every part of a turn shares that turn's one attack id, so a fighter takes at most one boss hit from it. Never tuned for a
// bot: every number here is what the design says.

let W;
beforeAll(async () => { W = loadMonolith().window; await W.eval('profileReady'); });

const HP = { 1: 1, 2: 0.5, 3: 0.2 };
const FOUR_CAC_POP = () => 14 + 180 - 2;   // FOUR.cacGrow + FOUR.cacLife: the frame it pops (a sixty-frame second is a hundred and eighty here)
// A still Firey on the floor at `x` and Four spawned the way the gauntlet spawns him (BOSSRUSH.active false: the gauntlet logic off), floating, his attack timer held
// unless `live`. `ph` is his phase (his HP sets it).
const STAGE = (x, ph = 1, live = false) => `
  SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
  BOSSRUSH = { active:false, bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.name==='Four'; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats=platRectsSmall(); summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; hazardT=0;
  var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), ${x}, groundY()-24, 0);
  f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
  spawnBossRushBoss();
  var b = summons.find(function(s){ return s.type==='boss'; });
  b.hp = b.maxHp*${HP[ph]}; ${live ? '' : 'b._atkTimer = 1e9;'}
  for (var w=0; w<70 && b._fr; w++) step();   // he has re-formed
  b._phase = ${ph}; b.x = 700; b._homeX = 700; b.y = groundY() - b.r - 40; b.face = -1;
  step(); step(); f.pct = 0; f.invuln = 0; f.hitstun = 0; f.x = ${x}; f.y = groundY()-24; f.vx = 0; f.vy = 0; f.onground = true;
`;
// A bare Four for driving his functions directly.
const S = (o = '') => `{ name:'Four', attack:'four', type:'boss', x:700, y:420, r:95, hp:100, maxHp:100, _phase:1, _atkTimer:1, _tel:0, color:'#3a6ad0', face:-1, homeX:700,
  stationary:false, vx:0, vy:0 ${o ? ',' + o : ''} }`;
// Start his move number k now (0: the signature, 1: his extras' turn, its `x`th) and run its wind-up out, with the fighter held where it stands: the frame the move fires
// is the last one this returns from. `sig` is 's' or 'z': the form the signature takes.
const TURN = (k, o = {}) => `b._tel = 0; b._fr = null; b._moveN = ${k === 0 ? 0 : 1}; ${o.sig ? `b._fSig = '${o.sig === 'z' ? 's' : 'z'}';` : ''} ${o.x != null ? `b._xN = ${o.x};` : ''}
  b._atkTimer = 1; step(); var telKind = b._telKind, telName = document.getElementById('banner').textContent, tel0 = b._tel;
  for (var w=0; w<90 && b._tel>0; w++){ step(); f.invuln = 0; f.hitstun = 0; }`;

describe('Four takes his classroom', () => {
  it('is Boss 12 and the last of the gauntlet, in his own place, floating: no longer the shared void, no longer a statue', () => {
    const r = W.eval(`(function(){ var i = BOSS_ROSTER.findIndex(function(b){ return b.name==='Four'; });
      return { i: i, n: BOSS_ROSTER.length, row: BOSS_ROSTER[i], two: BOSS_ROSTER.find(function(b){ return b.name==='Two'; }).arena,
        sky: [BOSS_ARENA_SKY.exitclass, BOSS_ARENA_SKY.fourest], ground: ['exitclass', 'fourest'].map(function(k){ var g = BOSS_ARENA_GROUND[k]; return g && [g.fill, g.line, typeof g.pattern]; }),
        hz: ['exitclass', 'fourest'].map(function(k){ var h = arenaHazardOf(k); return h && [typeof h.step, typeof h.draw]; }), void_: BOSS_ARENA_SKY.void.length }; })()`);
    expect(r.row).toEqual({ name: 'Four', color: '#3a6ad0', hp: 340, big: 2.8, attack: 'four', arena: 'exitclass', stationary: false, sprite: 'four' });
    expect(r.i, 'the final boss, last of the gauntlet').toBe(r.n - 1);
    expect(r.two, 'the void is left to Two').toBe('void');
    expect(r.void_).toBe(2);
    expect(r.sky.every((s) => s.length === 2)).toBe(true);
    expect(r.ground).toEqual([['#5a7396', '#14233d', 'function'], ['#1c2e50', '#06102a', 'function']]);
    expect(r.hz).toEqual([['function', 'function'], ['function', 'function']]);
  });

  it('spawns as a puddle in the middle of the floor and re-forms, then floats: his belly stays a hand over the floor, he sways and follows you', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      var out = { hover: b.hover };
      // a fresh spawn
      summons = []; spawnBossRushBoss(); var a = summons.find(function(s){ return s.type==='boss'; }); a._atkTimer = 1e9;
      var y0 = a.y, gy = groundY(), looks = [], ys = [];
      for (var i=0;i<FOUR.enterT + 4;i++){ step(); looks.push(a._hz.look); ys.push(Math.round(a.y)); }
      out.start = [Math.round(y0), Math.round(gy - FOUR.puddleY)];
      out.looks = [looks[2], looks[looks.length-1]];
      out.rose = ys[0] > ys[ys.length-1] + 40;
      // floating: sampled over a while, his belly stays within the band
      var lo = 1e9, hi = -1e9, x0 = a.x;
      for (var i=0;i<500;i++){ f.x = 200; step(); var belly = gy - (a.y + a.r); lo = Math.min(lo, belly); hi = Math.max(hi, belly); }
      out.belly = [Math.round(lo), Math.round(hi)]; out.band = FOUR.band; out.x = [Math.round(x0), Math.round(a.x)];
      summons = []; projectiles = []; return out; })()`);
    expect(r.hover, 'the engine leaves him to fourMove: no gravity, no floor snap').toBe(true);
    expect(r.start[0], 'he starts as a puddle on the floor').toBe(r.start[1]);
    expect(r.looks, 'the puddle render while he re-forms, then his own').toEqual(['fourpuddle', null]);
    expect(r.rose, 'and he floats up').toBe(true);
    expect(r.belly[0], 'his belly is never under the low edge of the band').toBeGreaterThanOrEqual(r.band[0] - 6);
    expect(r.belly[1], 'nor over the high edge').toBeLessThanOrEqual(r.band[1] + 6);
    expect(r.x[1], 'he follows the fighter, who stood at the left').toBeLessThan(r.x[0] - 20);
  });

  it('takes his turns: the signature, then a move of his own, the signature again in its other form, ... SCREECHY! and ZAPPIES! alternate, each with its own wind-up', () => {
    const r = W.eval(`(function(){
      var s = ${S()}, kinds = [], names = [], tels = [], sigs = [];
      for (var k=0;k<6;k++){ s._atkTimer = 1; s._tel = 0; s._fr = null; updateBossAttack(s, null); kinds.push(s._telKind); names.push(bossTelName(s)); tels.push(s._tel); sigs.push(s._hz.sig); }
      var p2 = ${S('_phase:2, _telPh:2')}, p3 = ${S('_phase:3, _telPh:3')};
      return { kinds: kinds, names: names, tels: tels, sigs: sigs, scr: [1, 2].map(function(ph){ return bossTelName(${S('_phase:ph, _telPh:ph')}); }), scr3: bossTelName(p3),
               len: bossTelLen({ attack:'four' }), gaps: [1,2,3].map(function(ph){ var q = ${S()}; q._phase = ph; return bossAtkGap(q); }),
               ph: [bossPhaseName({ attack:'four' }, 2), bossPhaseName({ attack:'four' }, 3)] };
    })()`);
    expect(r.kinds[0], 'the signature first').toBe('four');
    expect(r.kinds[2]).toBe('four');
    expect(r.kinds[4]).toBe('four');
    expect(r.names[0]).toBe('SCREECHY!');
    expect(r.names[2], 'then the other form of the signature').toBe('ZAPPIES!');
    expect(r.names[4]).toBe('SCREECHY!');
    expect(r.names[1], 'in between, a move of his own').toBe('GO BYE-BYE!');
    expect(r.tels.slice(0, 3), 'each has its own wind-up: the screech 50, the move 46, the zap 54').toEqual([50, 46, 54]);
    expect(r.scr, 'SCREECHY! gets a "!" more each phase').toEqual(['SCREECHY!', 'SCREECHY!!']);
    expect(r.scr3).toBe('SCREECHY!!!');
    expect(r.len, 'a bare signature winds up for 50').toBe(50);
    // "bosses should attack a bit slower" (the owner, 2026-09-30): his own 104 / 78 / 56 times BOSS_PACE (1.2); eased a shade over the shared 100 / 72 / 52 -- the hills and
    // the sparks of his room do part of the work ("if it makes sense for a hazard, reduce boss difficulty and add a hazard")
    expect(r.gaps).toEqual([125, 94, 67]);
    expect(r.ph).toEqual(['Zap to Dust', 'Reality Buckles']);
  });
});

describe('SCREECHY!', () => {
  it('is a ring of sound a degree at a time with evenly spaced gaps -- 5, 4, 3 by phase, slower than it was -- and phase 3 sends a second ring 24 frames behind, its gaps a half-gap off', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      var out = {};
      [1, 2, 3].forEach(function(ph){
        projectiles = []; b._fr = null; fourScreechy(b, f, 4242 + ph, ph);
        var shots = projectiles.filter(function(p){ return p.four && p.fourRing; });
        var now = shots.filter(function(p){ return !(p.delay > 0); }), late = shots.filter(function(p){ return p.delay > 0; });
        function gapsOf(list){
          var have = new Array(360).fill(0); list.forEach(function(p){ have[Math.round((Math.atan2(p.vy, p.vx)/Math.PI*180 + 360)) % 360] = 1; });
          var runs = [], start = have.indexOf(1), run = 0, c = [];
          for (var k=1;k<=360;k++){ var d = have[(start + k) % 360]; if (!d) run++; else { if (run) runs.push([ (start + k - run) % 360, run ]); run = 0; } }
          return runs;
        }
        out[ph] = { n: now.length, late: late.length, lateDelay: late.length ? late[0].delay : 0, spd: Math.max.apply(null, now.map(function(p){ return Math.hypot(p.vx, p.vy); })),
          ids: Array.from(new Set(shots.map(function(p){ return p.bossAtk; }))), gaps: gapsOf(now), gaps2: gapsOf(late), dmg: Array.from(new Set(shots.map(function(p){ return p.dmg; }))),
          volley: shots.every(function(p){ return p.volley; }), shape: Array.from(new Set(shots.map(function(p){ return p.shape; }))) };
      });
      b._fr = null; projectiles = []; return out; })()`);
    for (const [ph, gaps, spd] of [[1, 5, 6], [2, 4, 6.8], [3, 3, 7.5]]) {
      const o = r[ph];
      expect(o.gaps.length, `phase ${ph}: ${gaps} gaps`).toBe(gaps);
      expect(o.spd, `phase ${ph}: speed`).toBeCloseTo(spd, 5);
      expect(o.ids, 'one attack id, so the whole ring is at most one hit').toEqual([4242 + ph]);
      expect(o.dmg, 'a full boss hit').toEqual([22]);
      expect(o.volley, 'a volley: its running total is per id').toBe(true);
      expect(o.shape, 'drawn as a wavefront').toEqual(['fourwave']);
      const spacing = 360/gaps;
      for (let g = 1; g < o.gaps.length; g++) expect(Math.abs(((o.gaps[g][0] - o.gaps[g - 1][0] + 360) % 360) - spacing), 'evenly spaced').toBeLessThanOrEqual(3);
    }
    expect(r[1].late, 'only phase 3 has a second ring').toBe(0);
    expect(r[2].late).toBe(0);
    expect(r[3].lateDelay, 'twenty-four frames behind').toBe(24);
    expect(r[3].late, 'the same ring').toBe(r[3].n);
    // the second ring's gaps are a half gap-width on from the first: 0.18 rad = about 10 degrees, a lateral step the player has time for
    const shift = (((r[3].gaps2[0][0] + r[3].gaps2[0][1]/2) - (r[3].gaps[0][0] + r[3].gaps[0][1]/2)) % 120 + 120) % 120;
    expect(shift, 'its gaps are 10 degrees off').toBeGreaterThan(6);
    expect(shift).toBeLessThan(14);
  });

  it('the wind-up rears him up and shakes him (the screech render for the second half), the shots stop at the floor, and the turn is one hit for whoever stands in it', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      f.x = 120;
      ${TURN(0, { sig: 's' })}
      var out = { kind: telKind, name: telName, tel0: tel0, look: b._hz.look, y: Math.round(b.y), gy: groundY(), r: b.r, rot: b._hz.rot };
      // fired: the ring is out, the room jumps
      var n0 = projectiles.filter(function(p){ return p.fourRing; }).length;
      out.fired = n0; out.fr = b._fr && b._fr.k; out.sh = b._hz.sh; out.hold = b._atkTimer;
      var low = 0;
      for (var i=0;i<140;i++){ step(); f.hitstun = 0; projectiles.forEach(function(p){ if (p.fourRing && p.delay <= 0) low = Math.max(low, p.y); }); }
      out.pct = f.pct; out.low = Math.round(low); out.after = projectiles.filter(function(p){ return p.fourRing; }).length;
      summons = []; projectiles = []; return out; })()`);
    expect(r.kind).toBe('four');
    expect(r.name).toBe('SCREECHY!');
    expect(r.tel0).toBe(50);
    expect(r.fired, 'the ring is out the frame the wind-up ends').toBeGreaterThan(200);
    expect(r.look, 'the screech render').toBe('fourscreech');
    expect(r.gy - (r.y + r.r), 'he is reared up, high over the floor').toBeGreaterThan(80);
    expect(r.fr).toBe('screech');
    expect(r.sh, 'the desks start to rattle').toBeGreaterThan(0);
    expect(r.low, 'the shots are gone at the floor line (one step of the fastest, 7.5, past it at most)').toBeLessThanOrEqual(r.gy + 8);
    expect(r.pct, 'the whole ring is one boss hit: the fighter in its way takes 22, never more').toBeLessThanOrEqual(22.01);
  });
});

describe('ZAPPIES!', () => {
  it('a blue mark follows the fighter it is on, locks for the last 12 frames, and the bolt comes down on it as a column: the narrow one, the charged one, then a second on the spot you left', () => {
    const r = W.eval(`(function(){ var out = {};
      [1, 2, 3].forEach(function(ph){
        ${STAGE(300, 1)}
        b._phase = ph; b.hp = b.maxHp*[0, 1, 0.5, 0.2][ph];
        b._tel = 0; b._fr = null; b._moveN = 0; b._fSig = 's'; b._atkTimer = 1; step();
        var name = document.getElementById('banner').textContent, marks = [], looks = [];
        for (var w=0; w<90 && b._tel>0; w++){ f.x = 300 + Math.min(w, 30)*3; step(); f.invuln = 0; f.hitstun = 0; marks.push(b._hz.mk && b._hz.mk.map(function(m){ return m.slice(); })); looks.push(b._hz.look); }
        var lastMk = marks[marks.length - 2];
        var zp = b._hz.zp && b._hz.zp.map(function(z){ return z.slice(); });
        var hit = []; f.pct = 0;
        for (var i=0;i<60;i++){ step(); f.invuln = 0; f.hitstun = 0; f.x = 390; f.y = groundY() - 24; f.vx = 0; hit.push(f.pct); }
        out[ph] = { name: name, mk0: marks[0], mkMid: marks[20][0], lastMk: lastMk, zp: zp, w: b._fr ? b._fr.w : null, pct: f.pct, look: looks[20], fx: f.x };
        var fx2 = 0;
      });
      summons = []; projectiles = []; return out; })()`);
    for (const ph of [1, 2, 3]) {
      expect(r[ph].name).toBe('ZAPPIES!');
      expect(r[ph].mkMid[2], 'unlocked while it follows').toBe(0);
      expect(r[ph].look, 'the raised hand render').toBe('fourzap');
      expect(r[ph].lastMk[0][2], 'locked for the last frames').toBe(1);
    }
    expect(r[1].lastMk[0][0], 'it followed the fighter to where it stood at the lock').toBe(390);
    expect(r[1].lastMk, 'one mark in phases 1 and 2').toHaveLength(1);
    expect(r[3].lastMk, 'phase 3: a second mark, locked, where you were').toHaveLength(2);
    expect(r[3].lastMk[1][0], 'where the fighter stood 30 frames before the lock').toBeLessThan(r[3].lastMk[0][0] - 40);
    expect(r[1].zp.map((z) => z[1]), 'the narrow column').toEqual([26]);
    expect(r[2].zp.map((z) => z[1]), 'the charged, wide one').toEqual([44]);
    expect(r[3].zp.map((z) => z[1]), 'phase 3: two columns').toEqual([44, 44]);
    expect(r[3].zp[1][2] - r[3].zp[0][2], 'twenty frames apart').toBe(20);
    for (const ph of [1, 2, 3]) expect(r[ph].pct, `phase ${ph}: the fighter stood in the column and took one boss hit, 22`).toBeCloseTo(22, 5);
  });

  it('a fighter beside the column is not touched; one in it, at any height, is', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      var g = makeFighter(ROSTER.find(function(q){ return q.name==='Pen'; }), 900, groundY()-24, 1); g.team = 0; g.controller = 'still'; g.stocks = 9; fighters.push(g);
      b._fr = null; b._hz.sig = 'z'; b._zx = 500; fourZappies(b, f, 31, 1);
      for (var i=0;i<30;i++){ f.x = 500 + 90; g.x = 500; g.y = groundY() - 260; g.vy = 0; g.vx = 0; g.onground = true; f.y = groundY()-24; g.invuln = 0; f.invuln = 0; step(); }
      var out = { beside: f.pct, in: g.pct };
      summons = []; projectiles = []; return out; })()`);
    expect(r.beside, 'ninety pixels off a 26-wide column').toBe(0);
    expect(r.in, 'in the column, high up: a boss hit').toBeCloseTo(22, 5);
  });
});

describe('GO BYE-BYE!', () => {
  it('he drifts to the floor on the side you can run away from, smiling and waving, the EXIT door opens and the air starts to stream toward his mouth', () => {
    const r = W.eval(`(function(){ var out = {};
      [150, 550, 950].forEach(function(x){
        ${STAGE(300, 1)}
        f.x = x; ${TURN(1, { x: 0 })}
        out[x] = { kind: telKind, name: telName, tel0: tel0, bx: Math.round(b.x), by: Math.round(b.y), gy: groundY(), r: b.r, look: b._hz.look, door: b._hz.door && b._hz.door.slice(), inh: b._hz.inh && b._hz.inh.slice(), fr: b._fr && b._fr.k, WW: WW };
      });
      summons = []; projectiles = []; return out; })()`);
    for (const x of [150, 550, 950]) {
      expect(r[x].kind).toBe('fourbye');
      expect(r[x].name).toBe('GO BYE-BYE!');
      expect(r[x].tel0).toBe(46);
      expect(r[x].fr, 'the move is running').toBe('bye');
      expect(r[x].gy - (r[x].by + r[x].r), 'low: his belly is just off the floor').toBeLessThan(20);
      expect(r[x].door[1], 'the EXIT door is open for the whole move').toBeGreaterThan(r[x].door[0] + 150);
      expect(r[x].look, 'mouth wide').toBe('fourscreech');
    }
    // he stands on the side of them with LESS room, so they run off toward the room: at the left wall he is at it (they run right), in the middle on their left, at the right wall at that
    expect(r[150].bx, 'at the left wall he stands at it, to their left').toBeLessThan(150);
    expect(r[550].bx, 'in the middle, 300 px to their left').toBeLessThan(550 - 250);
    expect(r[950].bx, 'and at the right wall, to their right').toBeGreaterThan(950);
  });

  it('the pull drags whoever is in reach toward his mouth, a committed run beats it, and a fighter out of reach is left alone', () => {
    const r = W.eval(`(function(){ var out = {};
      ${STAGE(300, 1)}
      var gy = groundY(), R = b.r;
      b._fr = null; b._byeX = 700; b.x = 700; b.y = gy - R*0.95; b.face = -1; b._telPh = 1;
      var g = makeFighter(ROSTER.find(function(q){ return q.name==='Pen'; }), 1090, gy-24, 1); g.team = 0; g.controller = 'still'; g.stocks = 9; fighters.push(g);
      f.x = 480; f.y = gy - 24;
      fourBye(b, f);
      var x0 = [f.x, g.x];
      for (var i=0;i<20;i++){ step(); f.invuln = 0; g.invuln = 0; b.x = 700; }
      out.moved = [Math.round(f.x - x0[0]), Math.round(g.x - x0[1])];
      out.range = FOUR.byeRange[1]; out.inh = b._hz.inh && b._hz.inh.slice();
      // a runner: pulled at up to 4, running 6.4 away
      summons = []; ${STAGE(480, 1)}
      b._fr = null; b.x = 700; b._byeX = 700; b.y = gy - R*0.95; b._telPh = 1; f.x = 520; fourBye(b, f); var x1 = f.x;
      for (var i=0;i<40;i++){ f.vx = -6.4; step(); f.x = Math.max(60, f.x); b.x = 700; f.invuln = 0; }
      out.runner = Math.round(f.x - x1);
      summons = []; projectiles = []; return out; })()`);
    expect(r.moved[0], 'a fighter 220 px from his mouth is dragged toward it').toBeGreaterThan(25);
    expect(Math.abs(r.moved[1]), 'one 390 px away (the reach is 420), on the other side, is dragged toward it too, a little less').toBeGreaterThan(8);
    expect(r.moved[1], 'the other way').toBeLessThan(0);
    expect(Math.abs(r.moved[1])).toBeLessThan(r.moved[0]);
    expect(r.runner, 'running away at 6.4 against a pull of 4 or less: the runner gets away').toBeLessThan(-60);
  });

  it('whoever reaches his mouth is sucked up -- hidden, untouchable, 18 frames -- then spat out toward the middle for one hit of 0.8, and the whole move is one attack id', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      var gy = groundY(), R = b.r, out = {};
      b._fr = null; b._byeX = 150; b.x = 150; b.y = gy - R*0.95; b._telPh = 1; b._atkTimer = 1e9;
      f.x = 215; f.y = gy - 24;
      fourBye(b, f);
      var id = b._fr.id, caught = null, hides = [], frames = 0;
      for (var i=0;i<130;i++){
        step(); b.x = 150; frames++;
        if (b._hz.hide) hides.push(i);
        if (caught === null && f._byeHeld){ caught = i; out.heldAt = [Math.round(f.x), Math.round(f.y)]; out.mouth = [Math.round(fourMouth(b).x), Math.round(fourMouth(b).y)]; out.heldInvuln = f.invuln > 0; out.heldPct = f.pct; }
        if (caught !== null && i === caught + 10){ out.midPct = f.pct; out.midHeld = f._byeHeld; }
        if (caught !== null && !f._byeHeld && out.spitAt === undefined){ out.spitAt = i - caught; out.spitX = Math.round(f.x); out.spitPct = f.pct; out.spitVx = f.vx; }
        f.invuln = f.invuln > 3 ? 3 : f.invuln;
        if (b._fr === null || b._fr.k !== 'bye') break;
      }
      out.caught = caught; out.hides = [hides[0], hides[hides.length-1]]; out.final = f.pct; out.id = id; out.hold = FOUR.byeHold;
      out.hidden = null; out.bossBox = [Math.round(b.x)];
      summons = []; projectiles = []; return out; })()`);
    expect(r.caught, 'he caught the fighter standing at his mouth').not.toBe(null);
    expect(Math.abs(r.heldAt[0] - r.mouth[0]) + Math.abs(r.heldAt[1] - r.mouth[1]), 'held at his mouth (to the pixel the rounding allows)').toBeLessThanOrEqual(3);
    expect(r.heldPct, 'caught, not yet hurt').toBe(0);
    expect(r.midPct, 'inside him they are not hurt').toBe(0);
    expect(r.midHeld).toBe(true);
    expect(r.spitAt, 'spat out after 18 frames inside').toBe(r.hold);
    expect(r.spitPct, 'the one hit: 0.8 of a boss hit, 17.6').toBeCloseTo(17.6, 5);
    expect(r.spitX, 'out toward the middle of the room').toBeGreaterThan(r.mouth[0]);
    expect(r.hides[0], 'hidden while held').toBeGreaterThanOrEqual(r.caught);
    expect(r.final, 'no second hit from the same turn').toBeCloseTo(17.6, 5);
  });

  it('the platform is no shelter: a fighter standing on it above his mouth is dropped through, and phases 2 and 3 take a second breath', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 2)}
      var gy = groundY(), R = b.r, out = {};
      var plat = worldPlats.filter(function(p){ return !p.solid; }).sort(function(a, c){ return a.y - c.y; })[0];
      b._fr = null; b._byeX = plat.x + plat.w*0.5; b.x = b._byeX; b.y = gy - R*0.95; b._telPh = 2; b._atkTimer = 1e9;
      f.x = b.x; f.y = plat.y - f.r; f.vy = 0; f.onground = true;
      fourBye(b, f);
      var y0 = f.y, fell = false;
      for (var i=0;i<40;i++){ step(); b.x = b._byeX; if (f.y > y0 + 40) fell = true; }
      out.fell = fell; out.breaths = b._fr ? b._fr.b.length : -1; out.b = b._fr ? b._fr.b : null;
      summons = []; ${STAGE(300, 1)}
      b._telPh = 1; b._fr = null; b._atkTimer = 1e9; fourBye(b, f); out.breaths1 = b._fr.b.length; out.b1 = b._fr.b;
      summons = []; ${STAGE(300, 3)}
      b._telPh = 3; b._fr = null; b._atkTimer = 1e9; fourBye(b, f); out.b3 = b._fr.b;
      summons = []; projectiles = []; return out; })()`);
    expect(r.fell, 'dropped through the one-way platform and pulled down to the mouth').toBe(true);
    expect(r.b, 'phase 2: a second breath after the first and a rest of 30').toEqual([[0, 50], [80, 114]]);
    expect(r.b1, 'phase 1: one breath').toEqual([[0, 50]]);
    expect(r.b3, 'phase 3: a longer second breath').toEqual([[0, 56], [86, 126]]);
  });
});

describe('between his turns: the slither', () => {
  it('after a move he sinks into the floor as a puddle, slides to your far side and re-forms, and the next wind-up waits for him', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      var gy = groundY(), out = { looks: [], xs: [], ys: [] };
      f.x = 250;
      b.x = 250 + 450; b._fr = null; fourDone(b, f);
      var F = b._fr; out.k = F.k; out.to = Math.round(F.to);
      var n = F.n[0] + F.n[1] + F.n[2];
      for (var i=0;i<n + 2;i++){ step(); f.invuln = 0; out.looks.push(b._hz.look); out.xs.push(Math.round(b.x)); out.ys.push(Math.round(b.y)); b._atkTimer = 1e9; }
      out.n = n; out.after = b._fr; out.gy = gy; out.low = Math.max.apply(null, out.ys); out.r = b.r;
      // a wind-up that comes due mid-slither waits for him: the move in the air holds it
      b._fr = null; fourDone(b, f); for (var i=0;i<12;i++){ step(); b._atkTimer = 1e9; }
      b._atkTimer = 1; b._tel = 0; step(); out.cut = [b._fr && b._fr.k, b._tel > 0];
      summons = []; projectiles = []; return out; })()`);
    expect(r.k).toBe('slither');
    expect(r.to, 'to the far side of where the fighter stands').toBeGreaterThan(700);
    expect(r.looks, 'the puddle render for the slide').toContain('fourpuddle');
    expect(r.looks[r.looks.length - 1], 'and his own again at the end').toBe(null);
    expect(Math.abs(r.low - (r.gy - 31)), 'the puddle lies on the floor (it ripples a pixel or two)').toBeLessThanOrEqual(3);
    expect(Math.abs(r.xs[r.xs.length - 1] - r.to), 'and re-forms there, at the far side of the fighter').toBeLessThanOrEqual(30);
    expect(r.xs[r.xs.length - 1]).toBeGreaterThan(700);
    expect(r.after, 'then it is over').toBe(null);
    expect(r.cut, 'a wind-up that comes due mid-slither waits for him to re-form').toEqual(['slither', false]);
  });

  it("a turn's gap counts from the shot, and a move in the air holds the next wind-up back", () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      b._fr = { k:'screech', t:0, ph:1 }; b._atkTimer = 1; step();
      var held = b._atkTimer;
      b._fr = null; b._atkTimer = 5; step(); var free = b._atkTimer;
      summons = []; projectiles = []; return { held: held, free: free }; })()`);
    expect(r.held, 'while a move runs the timer rests at 8, not 0').toBeGreaterThanOrEqual(7);
    expect(r.free, 'free, it counts down').toBe(4);
  });
});

describe('TAKE THE TOWER!', () => {
  it('he waves, dashed hill outlines show where the floor will rise -- under you, beside you, and a third that follows you and then locks', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      f.x = 400; b._tel = 0; b._fr = null; b._moveN = 1; b._xN = 1; b._atkTimer = 1; step();
      var out = { kind: b._telKind, name: document.getElementById('banner').textContent, tel0: b._tel };
      var marks = [];
      for (var w=0; w<90 && b._tel>0; w++){ f.x = 400 + Math.min(w, 20)*4; step(); f.invuln = 0; marks.push(b._hz.hp && b._hz.hp.map(function(h){ return h.slice(); })); }
      out.first = marks[0]; out.last = marks[marks.length - 2]; out.look = b._hz.look; out.fx = f.x;
      summons = []; projectiles = []; return out; })()`);
    expect(r.kind).toBe('fourtower');
    expect(r.name).toBe('TAKE THE TOWER!');
    expect(r.tel0).toBe(44);
    expect(r.first, 'three outlines from the first frame').toHaveLength(3);
    expect(r.first[0][0], 'one under you').toBeGreaterThan(395);
    expect(Math.abs(r.first[1][0] - r.first[0][0]), 'one beside you, a base and a hundred away').toBeGreaterThan(150);
    expect(r.first.map((h) => h[2]), 'none locked yet').toEqual([0, 0, 0]);
    expect(r.last[2][2], 'the third, locked at the end').toBe(1);
    expect(r.last[2][0], 'where you stepped to: it followed you').toBe(r.fx);
    expect(r.last[0][0], 'the first stayed where you were').toBeLessThan(r.fx - 40);
    expect(r.look, 'the "rise this tower" render').toBe('fourtower');
  });

  it('the hills rise 10 frames apart, throwing whoever stands in their place (0.8 of a hit, one id), and stand as solid mounds for 240 frames', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      var gy = groundY(), g = makeFighter(ROSTER.find(function(q){ return q.name==='Pen'; }), 900, gy-24, 1); g.team = 0; g.controller = 'still'; g.stocks = 9; fighters.push(g);
      b._fr = null; b._telPh = 1; b._hl = [{ x:300 }, { x:520 }, { x:700 }]; b._atkTimer = 1e9; b._hz.hp = [[300,110,0],[520,110,0],[700,110,1]];
      f.x = 300; f.y = gy - 24; g.x = 900; g.y = gy - 24;
      fourTower(b, f);
      var F = b._fr, out = { ts: F.hills.map(function(h){ return h.t; }), id: F.id }, stones = [];
      for (var i=0;i<60;i++){
        f.invuln = 0; step(); b.x = 700;
        if (i === 6){ out.pct = f.pct; out.vy = f.vy; out.fy = f.y; out.top = gy - FOUR.hillH; out.other = g.pct; }
        stones.push(worldPlats.filter(function(p){ return p._four; }).length);
      }
      out.stones = [stones[2], stones[20], stones[40]]; out.plan = b._hz.hp;
      var p = worldPlats.filter(function(q){ return q._four; })[0]; out.stone = p && [p.w, p.h, p.solid, Math.round(p.y + p.h)];
      out.gy = gy;
      for (var i=0;i<FOUR.hillLife + 20;i++){ step(); f.invuln = 0; b.x = 700; }
      out.gone = worldPlats.filter(function(q){ return q._four; }).length; out.hlGone = b._hz.hl;
      summons = []; projectiles = []; return out; })()`);
    expect(r.ts, 'two frames to start, then 10 apart').toEqual([2, 12, 22]);
    expect(r.pct, 'the fighter on the first spot is thrown, for 0.8 of a boss hit').toBeCloseTo(17.6, 5);
    expect(r.other, 'one far from every spot is not').toBe(0);
    expect(r.vy, 'thrown up').toBeLessThan(-3);
    expect(r.fy, 'and lifted clear of the stone that follows').toBeLessThan(r.top);
    expect(r.stones, 'no stone yet on frame 3; the first one 12 frames after its hill began to rise (frame 14); all three once the last has (frame 34)').toEqual([0, 1, 3]);
    expect(r.stone, 'a solid block 70 by 70 standing on the floor').toEqual([70, 70, true, Math.round(r.gy)]);
    expect(r.plan, 'the outlines are gone once the hills are up').toBe(null);
    expect(r.gone, 'then the hills go').toBe(0);
    expect(r.hlGone, 'and their picture with them').toBe(null);
  });

  it('a hill stops the ring: a shot of SCREECHY! that reaches a standing hill is gone, one that flies over it is not', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      var gy = groundY();
      worldPlats.push({ x:600 - 35, y:gy - 70, w:70, h:70, solid:true, _four:true, _until:hazardT + 500 });
      projectiles = []; b._fr = null;
      projectiles.push(fourShot(b, 5, { x:500, y:gy - 30, vx:6, vy:0, fourRing:true, shape:'fourwave', life:200 }));
      projectiles.push(fourShot(b, 5, { x:500, y:gy - 120, vx:6, vy:0, fourRing:true, shape:'fourwave', life:200 }));
      for (var i=0;i<30;i++){ step(); f.invuln = 0; f.x = 100; }
      var alive = projectiles.filter(function(p){ return p.fourRing && p.life > 0; }).map(function(p){ return Math.round(p.y); });
      summons = []; projectiles = []; return { alive: alive, high: Math.round(gy - 120) }; })()`);
    expect(r.alive, 'the low shot hit the hill and is gone; the high one flew over it').toEqual([r.high]);
  });

  it('phase 3 adds the ripple: humps run the floor one every 6 frames from the side farthest from you, throwing whoever stands on it, never someone in the air, once (one id)', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 3)}
      var gy = groundY(), g = makeFighter(ROSTER.find(function(q){ return q.name==='Pen'; }), 900, gy-24, 1); g.team = 0; g.controller = 'still'; g.stocks = 9; fighters.push(g);
      b._fr = null; b._telPh = 3; b._hl = [{ x:150 }, { x:250 }, { x:350 }]; b._atkTimer = 1e9;
      f.x = 800; f.y = gy - 24; g.x = 820; g.y = gy - 150; g.vy = 0;
      fourTower(b, f);
      var F = b._fr, out = { rip: F.rip && { dir: F.rip.dir, x0: F.rip.x0, n: F.rip.n, t0: F.rip.t0 }, rp: b._hz.rp && b._hz.rp.slice() };
      var hits = [];
      for (var i=0;i<F.end + 4;i++){
        var p0 = f.pct; f.invuln = 0; g.invuln = 0; g.y = gy - 150; g.vy = 0; g.onground = false; f.y = gy - 24; f.vx = 0; f.vy = 0; f.onground = true; f.x = 800;
        step(); b.x = 700; if (f.pct > p0) hits.push([i, f.pct - p0]);
      }
      out.hits = hits; out.air = g.pct; out.end = F.end;
      summons = []; projectiles = []; return out; })()`);
    expect(r.rip.dir, 'you are on the right, so it comes from the left, running right').toBe(1);
    expect(r.rip.x0, 'from the left wall').toBeLessThan(100);
    expect(r.rip.n, 'enough humps to run the floor').toBeGreaterThanOrEqual(8);
    expect(r.rp.length, 'seven numbers a client draws it from').toBe(7);
    expect(r.hits.length, 'the fighter on the floor is thrown once by the ripple').toBe(1);
    expect(r.hits[0][1], 'for 0.8 of a hit').toBeCloseTo(17.6, 5);
    expect(r.air, 'the one in the air is untouched').toBe(0);
  });
});

describe('LOVE HEARTS!', () => {
  it('his eyes turn to hearts, he bounces, and a pink glow rings the spot you stand on', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 2)}
      f.x = 400; b._tel = 0; b._fr = null; b._moveN = 1; b._xN = 3; b._atkTimer = 1; step();
      var out = { kind: b._telKind, name: document.getElementById('banner').textContent, tel0: b._tel };
      var ys = [], hgs = [], looks = [];
      for (var w=0; w<90 && b._tel>0; w++){ f.x = 400 + Math.min(w, 15)*5; step(); f.invuln = 0; ys.push(b.y); if (b._tel > 0){ hgs.push(b._hz.hg && b._hz.hg[0]); looks.push(b._hz.look); } }
      out.look = looks[looks.length - 1]; out.hg = hgs[hgs.length - 1]; out.fx = f.x; out.span = Math.max.apply(null, ys) - Math.min.apply(null, ys);
      summons = []; projectiles = []; return out; })()`);
    expect(r.kind).toBe('fourhearts');
    expect(r.name).toBe('LOVE HEARTS!');
    expect(r.tel0).toBe(42);
    expect(r.hg, 'the glow follows you').toBe(r.fx);
    expect(r.look, 'the heart-eyed render').toBe('fourlove');
    expect(r.span, 'he bounces').toBeGreaterThan(12);
  });

  it('a flood in fixed waves 8 frames apart -- two arcs from his eyes and one big low heart from his mouth: three waves in phase 2, four in phase 3 -- all solid, one attack id, 0.8 of a hit each', () => {
    const r = W.eval(`(function(){ var out = {};
      [2, 3].forEach(function(ph){
        ${STAGE(300, 1)}
        b._phase = ph; b._fr = null; b._telPh = ph; b._hDir = 1; b._atkTimer = 1e9; projectiles = [];
        fourHearts(b, f);
        var hs = projectiles.filter(function(p){ return p.fourHeart; });
        out[ph] = { n: hs.length, delays: Array.from(new Set(hs.map(function(p){ return p.delay; }))).sort(function(a, c){ return a - c; }), ids: Array.from(new Set(hs.map(function(p){ return p.bossAtk; }))).length,
          dmg: Array.from(new Set(hs.map(function(p){ return p.dmg; }))), kb: Array.from(new Set(hs.map(function(p){ return p.kb; }))), r: Array.from(new Set(hs.map(function(p){ return p.r; }))).sort(function(a, c){ return a - c; }),
          bounce: hs.every(function(p){ return p.bounce && p.maxBounces === 3; }), volley: hs.every(function(p){ return p.volley; }), shape: Array.from(new Set(hs.map(function(p){ return p.shape; }))),
          wave0: hs.filter(function(p){ return p.delay === 0; }).map(function(p){ return JSON.stringify([Math.sign(p.vx), p.vy < -5 ? 'arc' : 'low', p.r]); }).sort() };
      });
      summons = []; projectiles = []; return out; })()`);
    expect(r[2].n, 'three waves of three').toBe(9);
    expect(r[3].n, 'four waves of three').toBe(12);
    expect(r[2].delays).toEqual([0, 8, 16]);
    expect(r[3].delays).toEqual([0, 8, 16, 24]);
    expect(r[2].ids, 'one attack id for the whole flood').toBe(1);
    expect(r[2].dmg, '0.8 of a boss hit').toEqual([17.6]);
    expect(r[2].r, "the eyes' hearts and the mouth's big one").toEqual([18, 30]);
    expect(r[2].bounce, 'they bounce off the floor, the platform and the walls three times').toBe(true);
    expect(r[2].volley).toBe(true);
    expect(r[2].shape).toEqual(['fourheart']);
    expect(r[2].wave0, 'one arc to each side and the mouth heart low').toEqual([[-1, 'arc', 18], [1, 'arc', 18], [1, 'low', 30]].map((a) => JSON.stringify(a)).sort());
  });

  it('the hearts bounce off the floor and the walls and pop on the third; where they land they pile up on the floor, twelve at most, for 3 s; one flood is one hit', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 2)}
      var gy = groundY(); f.x = 60; f.y = gy - 24; b._fr = null; b._telPh = 2; b._hDir = 1; b._atkTimer = 1e9; f.invuln = 0;
      projectiles = []; fourHearts(b, f);
      var maxAlive = 0, piled = 0;
      for (var i=0;i<400;i++){
        step(); f.invuln = 0; f.x = 60; f.y = gy - 24; f.vx = 0;
        var hs = projectiles.filter(function(p){ return p.fourHeart && p.life > 0; });
        maxAlive = Math.max(maxAlive, hs.length);
        piled = Math.max(piled, b._hz.pile ? b._hz.pile.length : 0);
      }
      var end = { alive: projectiles.filter(function(p){ return p.fourHeart && p.life > 0; }).length, piled: piled, pile: b._hz.pile, max: maxAlive, pct: f.pct };
      summons = []; projectiles = []; return end; })()`);
    expect(r.max, 'nine hearts in the air at the most').toBeLessThanOrEqual(9);
    expect(r.alive, 'every heart has popped by the end').toBe(0);
    expect(r.piled, 'hearts piled up where they landed').toBeGreaterThan(2);
    expect(r.piled, 'twelve at most').toBeLessThanOrEqual(12);
    expect(r.pile, 'and they fade away').toBe(null);
    expect(r.pct, 'a fighter by the wall the flood sweeps to takes one boss hit at the most').toBeLessThanOrEqual(22.01);
  });
});

describe("DON'T HUG THE CACTUS!", () => {
  it('he melts into the floor beside you as a puddle, and a dashed outline marks where the cactus will rise', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 3)}
      f.x = 300; b._tel = 0; b._fr = null; b._moveN = 1; b._xN = 4; b._atkTimer = 1; step();
      var out = { kind: b._telKind, name: document.getElementById('banner').textContent, tel0: b._tel, cb0: b._hz.cb && b._hz.cb.slice(), y0: b.y };
      var looks = [], cbs = [];
      for (var w=0; w<90 && b._tel>0; w++){ step(); f.invuln = 0; if (b._tel > 0){ looks.push(b._hz.look); cbs.push(b._hz.cb && b._hz.cb.slice()); } }
      out.cb = cbs[cbs.length - 1]; out.look = looks[looks.length - 1]; out.x = Math.round(b.x); out.y = Math.round(b.y); out.gy = groundY();
      summons = []; projectiles = []; return out; })()`);
    expect(r.kind).toBe('fourcactus');
    expect(r.name).toBe("DON'T HUG THE CACTUS!");
    expect(r.tel0).toBe(40);
    expect(r.cb0[0], 'the spot, 320 px from you on the side with room').toBeGreaterThan(300 + 280);
    expect(r.look, 'the puddle render once he has melted').toBe('fourpuddle');
    expect(r.gy - r.y, 'low in the floor').toBeLessThan(60);
    expect(Math.abs(r.x - r.cb[0]), 'where the outline is').toBeLessThan(40);
  });

  it('a Four-shaped cactus grows out of the puddle and walks at you, throws up whoever touches it (0.8 of a hit) and pops after 3 s; he re-forms where he melted', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      var gy = groundY();
      b._fr = null; b._telPh = 1; b._cacX = 800; b._atkTimer = 1e9;
      f.x = 400; f.y = gy - 24;
      fourCactus(b, f);
      var F = b._fr, out = { n: F.cacti.length, id: F.id, cac0: b._hz.cac.map(function(c){ return c.slice(); }) }, xs = [], hit = null;
      for (var i=0;i<FOUR.cacGrow + FOUR.cacLife + 40;i++){
        f.y = hit === null ? gy - 24 : f.y;
        var p0 = f.pct; step(); if (hit === null) { f.vx = 0; f.invuln = 0; }
        if (b._hz.cac) xs.push(b._hz.cac[0][0]);
        if (hit === null && f.pct > p0){ hit = i; out.hitDmg = f.pct - p0; out.vy = f.vy; out.hitX = [Math.round(f.x), xs[xs.length-1]]; f.x = 60; }
        if (hit !== null) { f.invuln = 99; }
        if (i === FOUR.cacGrow - 2) out.growing = b._hz.cac[0][0];
        if (i === FOUR.cacGrow + 10) out.walked = xs[xs.length - 1];
        if (b._fr && b._fr.k === 'slither' && out.reform === undefined) out.reform = [i, Math.round(b.x), b._hz.look];
      }
      out.hit = hit; out.after = b._hz.cac; out.fr = b._fr && b._fr.k; out.bx = Math.round(b.x);
      for (var i=0;i<40;i++) step();
      out.final = [b._fr, Math.round(b.y), b.y < gy - b.r - 10];
      summons = []; projectiles = []; return out; })()`);
    expect(r.n).toBe(1);
    expect(r.cac0[0][0], 'it grows where he melted').toBe(800);
    expect(r.hit, 'it reached the fighter who stood still').not.toBe(null);
    expect(r.hitDmg, 'for 0.8 of a boss hit').toBeCloseTo(17.6, 5);
    expect(r.vy, 'thrown straight up').toBeLessThanOrEqual(-15);
    expect(r.walked, 'it walked toward them, at about 2 a frame, not before it had grown').toBeLessThan(800 - 15);
    expect(r.after, 'and it has popped').toBe(null);
    expect(r.reform[0], 'he re-forms when it has popped: the last leg of a slither').toBeGreaterThan(FOUR_CAC_POP());
    expect(r.reform[1], 'where he melted').toBeGreaterThan(780);
    expect(r.final[0], 'then he floats again').toBe(null);
    expect(r.final[2]).toBe(true);
  });

  it('a jump clears it, the platform is out of its reach, and phase 3 sends two, one from each side of you', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      var gy = groundY();
      b._fr = null; b._telPh = 1; b._cacX = 600; b._atkTimer = 1e9; f.x = 600; f.y = gy - 24;
      var g = makeFighter(ROSTER.find(function(q){ return q.name==='Pen'; }), 600, gy-24, 1); g.team = 0; g.controller = 'still'; g.stocks = 9; fighters.push(g);
      fourCactus(b, f);
      var plat = worldPlats.filter(function(p){ return !p.solid; }).sort(function(a, c){ return a.y - c.y; })[0];
      for (var i=0;i<80;i++){ f.x = 600; f.y = gy - FOUR.cacH - 30 - f.r; f.vy = 0; f.invuln = 0; g.x = 600; g.y = plat.y - g.r; g.vy = 0; g.onground = true; g.invuln = 0; step(); }
      var out = { jumper: f.pct, platform: g.pct };
      summons = []; ${STAGE(300, 3)}
      b._fr = null; b._telPh = 3; b._cacX = 800; b._atkTimer = 1e9; f.x = 500;
      fourCactus(b, f);
      out.two = b._hz.cac.map(function(c){ return [c[0], c[1]]; });
      summons = []; projectiles = []; return out; })()`);
    expect(r.jumper, 'above its top: not touched').toBe(0);
    expect(r.platform, 'on the platform: not touched').toBe(0);
    expect(r.two, 'two cacti in phase 3').toHaveLength(2);
    expect(r.two[0][1] * r.two[1][1], 'walking toward you from opposite sides').toBe(-1);
  });
});

describe('I DO THIS!', () => {
  it('the ring draws itself round the fighter and follows them until the last 26 frames, then locks; the wind-up is 54, 42, 34 frames by phase', () => {
    const r = W.eval(`(function(){ var out = {};
      [1, 2, 3].forEach(function(ph){
        ${STAGE(300, 1)}
        b._phase = ph; b.hp = b.maxHp*[0, 1, 0.5, 0.2][ph];
        f.x = 400; b._tel = 0; b._fr = null; b._moveN = 1; b._xN = 2; b._atkTimer = 1; step();
        var o = { kind: b._telKind, name: document.getElementById('banner').textContent, tel0: b._tel, first: b._hz.id && b._hz.id.map(function(r){ return r.slice(); }) }, ids = [];
        for (var w=0; w<90 && b._tel>0; w++){ f.x = 400 + Math.min(w, 8)*5; step(); f.invuln = 0; ids.push(b._hz.id && b._hz.id.map(function(r){ return r.slice(); })); }
        o.last = ids[ids.length - 2]; o.fx = f.x; o.look = b._hz.look;
        out[ph] = o;
        summons = [];
      });
      projectiles = []; return out; })()`);
    expect(r[1].kind).toBe('fourido');
    expect(r[1].name).toBe('I DO THIS!');
    expect([r[1].tel0, r[2].tel0, r[3].tel0], 'the tell is shorter each phase').toEqual([54, 42, 34]);
    expect(r[1].first, 'one ring, on the fighter').toHaveLength(1);
    expect(r[1].first[0].slice(1, 3)).toEqual([400, 566]);
    expect(r[1].first[0][3], 'not yet locked').toBe(0);
    expect(r[1].last[0][3], 'locked at the end').toBe(1);
    expect(r[1].last[0][1], 'it followed them to where they stood at the lock').toBe(r[1].fx);
    expect(r[1].look, 'the raised-hand render').toBe('fourzap');
    expect(r[2].last, 'phase 2: a Venn pair').toHaveLength(2);
    expect(Math.abs(r[2].last[1][1] - r[2].last[0][1]), '90 px apart').toBe(90);
    expect(r[3].last, 'phase 3: one fighter, one ring').toHaveLength(1);
  });

  it('the snap: whoever is inside takes one hit (0.8, one id), is thrown, turned into a squiggle for 36 frames and skipped for 10 s; whoever is outside is not touched', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      var gy = groundY(), g = makeFighter(ROSTER.find(function(q){ return q.name==='Pen'; }), 900, gy-24, 1); g.team = 0; g.controller = 'still'; g.stocks = 9; fighters.push(g);
      b._fr = null; b._telPh = 1; b._atkTimer = 1e9; f.x = 400; f.y = gy - 24; g.x = 400 + 140; g.y = gy - 24;
      b._ido = [{ who:f.idx, off:0, cx:400, cy:gy - 24 }];
      fourIdo(b, f);
      var F = b._fr, out = { id: F.id, R: FOUR.idoSnapR[1] };
      var pcts = [];
      for (var i=0;i<FOUR.idoSnap + 2;i++){ step(); pcts.push([f.pct, g.pct]); g.invuln = 0; }
      out.before = pcts[FOUR.idoSnap - 2]; out.after = pcts[FOUR.idoSnap]; out.sq = b._hz.sq && b._hz.sq.map(function(q){ return q.slice(); }); out.skip = f._idoSkip - hazardT; out.vy = f.vy;
      out.hitstun = f.hitstun; out.sn = !!b._hz.sn; out.dc = b._hz.dc && b._hz.dc.length; out.ds = b._hz.ds > 0;
      for (var i=0;i<60;i++) step();
      out.done = [b._fr && b._fr.k, b._hz.sq];
      // the fairness rule: a fighter just mutilated is not picked while the skip runs, and not hurt if it is the only one left
      f.invuln = 0; b._fr = null; f.x = 400; f.y = gy - 24; g.dead = true;
      FOUR_PLAN.fourido(b, f, b._hz, 1); out.pickedWhileSkipped = b._ido.length ? b._ido[0].who : null;
      b._ido = [{ who:f.idx, off:0, cx:400, cy:gy - 24 }]; fourIdo(b, f); var p0 = f.pct;
      for (var i=0;i<FOUR.idoSnap + 4;i++){ step(); f.invuln = 0; }
      out.hurtAgain = f.pct - p0;
      summons = []; projectiles = []; return out; })()`);
    expect(r.before, 'nobody is hurt before the snap').toEqual([0, 0]);
    expect(r.after[0], 'the fighter inside: one hit of 0.8').toBeCloseTo(17.6, 5);
    expect(r.after[1], 'the one 140 px off, outside a 100 ring: not touched').toBe(0);
    expect(r.sq[0][1] - 0, 'a squiggle').toBeGreaterThan(0);
    expect(r.sq, 'for 36 frames').toHaveLength(1);
    expect(r.skip, 'skipped for 10 seconds').toBeGreaterThan(590);
    expect(r.vy, 'thrown up').toBeLessThan(-2);
    expect(r.hitstun).toBeGreaterThanOrEqual(20);
    expect(r.sn, 'a burst of shards for a client to draw').toBe(true);
    expect(r.dc, 'a scribbled decal left on the floor').toBe(1);
    expect(r.ds, 'the board scribbles over itself').toBe(true);
    expect(r.done, 'then it is over, and the squiggle with it').toEqual(['slither', null]);
    expect(r.pickedWhileSkipped, 'nobody else is there to pick: he falls back on the one he has just hit, and').toBe(0);
    expect(r.hurtAgain, '"Nobody has ever been mutilated more than once": no second hit inside the 10 s').toBe(0);
  });

  it('phase 2 draws a Venn pair that hits once, phase 3 rings every fighter at once and one over the platform when someone stands on it', () => {
    const r = W.eval(`(function(){ var out = {};
      ${STAGE(300, 3)}
      var gy = groundY(), g = makeFighter(ROSTER.find(function(q){ return q.name==='Pen'; }), 900, gy-24, 1); g.team = 0; g.controller = 'still'; g.stocks = 9; fighters.push(g);
      var plat = worldPlats.filter(function(p){ return !p.solid; }).sort(function(a, c){ return a.y - c.y; })[0];
      f.x = 200; f.y = gy - 24; g.x = plat.x + plat.w*0.5; g.y = plat.y - g.r; g.onground = true; g.vy = 0;
      b._fr = null; FOUR_PLAN.fourido(b, f, b._hz, 3);
      out.p3 = b._ido.map(function(r){ return [r.who, Math.round(r.cx), Math.round(r.cy)]; }); out.platTop = Math.round(plat.y);
      summons = []; ${STAGE(300, 2)}
      f.x = 400; f.y = gy - 24; b._fr = null; b._telPh = 2; b._atkTimer = 1e9; FOUR_PLAN.fourido(b, f, b._hz, 2);
      fourIdo(b, f);
      for (var i=0;i<FOUR.idoSnap + 2;i++){ step(); f.invuln = 0; }
      out.pair = f.pct;
      summons = []; projectiles = []; return out; })()`);
    expect(r.p3.map((q) => q[0]).sort(), 'a ring on each of them, and one over the platform').toEqual([-1, 0, 1]);
    expect(r.p3.find((q) => q[0] === -1)[2], 'above the platform').toBeLessThan(r.platTop);
    expect(r.pair, 'two overlapping rings are still one boss hit').toBeCloseTo(17.6, 5);
  });
});

describe('his place changes with the fight', () => {
  it('a phase change is announced and starts what the phase brings: a scream and the first burst tube in phase 2; the walls torn away onto The Fourest, and the floor buckling, in phase 3', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      var out = { p1: b._phase, arena1: BOSS_ARENA, hz1: JSON.stringify(b._hz.tb || 0) };
      impactFxClear(); var scars0 = IMPACT_SCARS.length;
      b.hp = b.maxHp*0.5; step(); out.p2 = b._phase; out.b2 = document.getElementById('banner').textContent; out.tb = b._hz.tb; out.p2t = b._hz.p2 > 0; out.sh = b._hz.sh > 0; out.arena2 = BOSS_ARENA; out.scars2 = IMPACT_SCARS.length - scars0;
      b.hp = b.maxHp*0.2; step(); out.p3 = b._phase; out.b3 = document.getElementById('banner').textContent; out.tear = b._hz.tear > 0; out.arena3 = BOSS_ARENA; out.q = b._hz.q && b._hz.q.length;
      var scars1 = IMPACT_SCARS.length; for (var i=0;i<FOUR.quakeN*FOUR.quakeStep + 14;i++){ step(); b._atkTimer = 1e9; }
      out.quakeScars = IMPACT_SCARS.length - scars1; out.qDone = b._hz.q;
      // one burst of damage that skips phase 2 still gets both beats
      summons = []; ${STAGE(300, 1)}
      b.hp = b.maxHp*0.1; step(); out.skip = { phase: b._phase, p2: b._hz.p2 > 0, tb: b._hz.tb > 0, tear: b._hz.tear > 0, arena: BOSS_ARENA };
      summons = []; projectiles = []; return out; })()`);
    expect([r.p1, r.p2, r.p3]).toEqual([1, 2, 3]);
    expect(r.arena1).toBe('exitclass');
    expect(r.b2).toMatch(/PHASE 2: Zap to Dust/);
    expect(r.b3).toMatch(/PHASE 3: Reality Buckles/);
    expect(r.tb, 'a tube bursts as phase 2 starts').toBe(1 << 2);
    expect(r.p2t && r.sh, 'the room shudders').toBe(true);
    expect(r.scars2, 'the scream cracks the floor').toBeGreaterThan(0);
    expect(r.arena2, 'phase 2 is still the classroom').toBe('exitclass');
    expect(r.tear, 'the walls tear away').toBe(true);
    expect(r.arena3, 'onto The Fourest').toBe('fourest');
    expect(r.q, 'the floor buckles in a wave: six impacts, queued').toBe(6);
    expect(r.quakeScars, 'and they play').toBeGreaterThanOrEqual(5);
    expect(r.qDone).toBe(null);
    expect(r.skip, 'a burst that skips phase 2 still gets both').toEqual({ phase: 3, p2: true, tb: true, tear: true, arena: 'fourest' });
  });

  it('a screech bursts a tube from phase 2 on, three at most, and the room dims a notch for each (never below 60%); phase 1 bursts none', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      var out = {};
      b._fr = null; fourScreechy(b, f, 1, 1); out.p1 = b._hz.tb | 0;
      b._phase = 2; b._fr = null; var seen = [];
      for (var i=0;i<5;i++){ projectiles = []; b._fr = null; fourScreechy(b, f, 2 + i, 2); seen.push(fourBurstCount(b._hz)); }
      out.seen = seen; out.bits = b._hz.tb; out.dim = 0.2 + 0.05*3;
      summons = []; projectiles = []; return out; })()`);
    expect(r.p1, 'bright tubes in phase 1').toBe(0);
    expect(r.seen, 'one more each screech until three').toEqual([1, 2, 3, 3, 3]);
    expect(r.bits, 'tubes 2, 0 and 4 first').toBe((1 << 2) | 1 | (1 << 4));
    expect(1 - r.dim, 'the room is never darker than 60% of itself').toBeGreaterThanOrEqual(0.6);
  });

  it('the EXIT door opens for GO BYE-BYE! and the room shudders for SCREECHY!: what the decor reads is in the hazard bag', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      f.x = 400; b._tel = 0; b._fr = null; b._moveN = 1; b._xN = 0; b._atkTimer = 1; step();
      var out = { door: b._hz.door && b._hz.door.slice(), t: hazardT };
      b._tel = 0; b._fr = null; fourScreechy(b, f, 3, 1); out.sh = b._hz.sh;
      summons = []; projectiles = []; return out; })()`);
    expect(r.door[0], 'it creaks open soon after the wind-up starts').toBeGreaterThan(r.t);
    expect(r.door[1] - r.door[0], 'and stays open the whole move').toBeGreaterThan(150);
    expect(r.sh, 'the screech marks the frame the desks start to rattle').toBeGreaterThan(0);
  });

  it('from phase 2 a burst tube spits a spark onto the floor beneath it: it flickers 44 frames, is live 10, hurts whoever stands on the floor there for 0.3 of a hit and nobody on the platform; phase 1 has none', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      var gy = groundY(), out = {};
      var g = makeFighter(ROSTER.find(function(q){ return q.name==='Pen'; }), 100, gy-24, 1); g.team = 0; g.controller = 'still'; g.stocks = 9; fighters.push(g);
      for (var i=0;i<500;i++){ step(); f.invuln = 0; if (b._hz.sp) out.p1 = true; }
      out.p1 = !!out.p1;
      // phase 2: the spark waits for a lull, then comes at the burst tube's spot
      summons = []; ${STAGE(300, 1)}
      var g2 = makeFighter(ROSTER.find(function(q){ return q.name==='Pen'; }), 100, gy-24, 1); g2.team = 0; g2.controller = 'still'; g2.stocks = 9; fighters.push(g2);
      b.hp = b.maxHp*0.5; step();
      var sp = null, hitAt = null, live = null, at = null;
      for (var i=0;i<400;i++){
        var p0 = f.pct; f.x = 550; f.y = gy - 24; f.vx = 0; f.vy = 0; f.onground = true; g2.x = 150; g2.y = gy - 24; step(); f.vx = 0;
        if (b._hz.sp && !sp){ sp = b._hz.sp.slice(); at = hazardT; }
        if (f.pct > p0 && hitAt === null){ hitAt = hazardT; out.dmg = f.pct - p0; }
      }
      out.sp = sp; out.hitAfter = hitAt - sp[1]; out.warn = FOUR.spWarn; out.other = g2.pct; out.live = [sp[2] - sp[1], sp[3] - sp[2]];
      out.first = at;
      // the platform is no place to be hit: a fighter standing on it in the spark's column is untouched
      var plat = worldPlats.filter(function(p){ return !p.solid; }).sort(function(a, c){ return a.y - c.y; })[0];
      b._hz.sp = [550, hazardT, hazardT, hazardT + 10, 9999]; f.pct = 0; f.invuln = 0;
      for (var i=0;i<12;i++){ f.x = 550; f.y = plat.y - f.r; f.vy = 0; f.onground = true; f.invuln = 0; step(); }
      out.plat = f.pct;
      summons = []; projectiles = []; return out; })()`);
    expect(r.p1, 'no sparks in phase 1').toBe(false);
    expect(r.sp[0], 'under the burst tube: the middle one first').toBe(550);
    expect(r.live, 'a warning of 44 frames, then 10 live').toEqual([44, 10]);
    expect(r.hitAfter, 'the fighter standing in it is hit as it goes live').toBeGreaterThanOrEqual(44);
    expect(r.dmg, 'for 0.3 of a boss hit').toBeCloseTo(6.6, 5);
    expect(r.other, 'someone elsewhere is not').toBe(0);
    expect(r.plat, 'and a fighter on the platform is out of reach of it').toBe(0);
  });

  it('a spark never starts over a wind-up or a move, and phase 3 moves them to The Fourest: three fixed places', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 2)}
      var Z = b._hz; Z.spN = hazardT + 5; b._tel = 30; b._atkTimer = 1e9;
      for (var i=0;i<20;i++){ step(); b._tel = 30; }
      var during = !!Z.sp;
      b._tel = 0; b._fr = { k:'screech', t:0, ph:2 };
      for (var i=0;i<20;i++){ step(); b._fr = { k:'screech', t:0, ph:2 }; }
      var duringMove = !!Z.sp;
      b._fr = null; for (var i=0;i<10;i++) step();
      var after = !!Z.sp;
      var spots2 = fourSparkSpots({ tb:5 }).map(Math.round), spots3 = fourSparkSpots({ tear:1 }).map(Math.round);
      summons = []; projectiles = []; return { during: during, duringMove: duringMove, after: after, spots2: spots2, spots3: spots3, WW: WW }; })()`);
    expect(r.during, 'not over a wind-up').toBe(false);
    expect(r.duringMove, 'not over a move').toBe(false);
    expect(r.after, 'but in the lull after it').toBe(true);
    expect(r.spots2, 'under burst tubes 0 and 2').toEqual([Math.round(r.WW*0.12), Math.round(r.WW*0.50)]);
    expect(r.spots3, 'The Fourest: three places').toEqual([Math.round(r.WW*0.2), Math.round(r.WW*0.5), Math.round(r.WW*0.8)]);
  });
});

describe('his six, in turn, phase by phase', () => {
  it('the signature takes every other turn, in two forms; his extras are dealt out in order among the ones the phase has: GO BYE-BYE!, TAKE THE TOWER! and I DO THIS! from the start, LOVE HEARTS! from phase 2, DON\'T HUG THE CACTUS! in phase 3', () => {
    const r = W.eval(`(function(){ var out = {};
      [1, 2, 3].forEach(function(ph){
        var s = ${S()}; s._phase = ph; s.hp = [0, 100, 50, 20][ph]; var kinds = [];
        for (var k=0;k<20;k++){ s._atkTimer = 1; s._tel = 0; s._fr = null; updateBossAttack(s, null); kinds.push(s._telKind + (s._telKind === 'four' ? ':' + s._hz.sig : '')); }
        out[ph] = kinds;
      });
      out.moves = BOSS_EXTRA['Four'].map(function(k){ return typeof BOSS_MOVES[k] + '/' + BOSS_MOVE_NAME[k] + '/' + BOSS_RUSH_ONLY.has(k); });
      out.extra = BOSS_EXTRA['Four']; return out; })()`);
    const sig = (a) => a.filter((k, i) => i % 2 === 0), ext = (a) => a.filter((k, i) => i % 2 === 1);
    for (const ph of [1, 2, 3]) {
      expect(sig(r[ph]).every((k) => /^four:[sz]$/.test(k)), `phase ${ph}: the signature on every other turn`).toBe(true);
      expect(sig(r[ph]).map((k) => k.slice(-1)).join(''), 'in two forms that alternate').toMatch(/^(sz)+s?$|^(zs)+z?$/);
    }
    expect(Array.from(new Set(ext(r[1]))).sort(), 'phase 1: three of his own').toEqual(['fourbye', 'fourido', 'fourtower']);
    expect(Array.from(new Set(ext(r[2]))).sort(), 'phase 2: LOVE HEARTS! joins').toEqual(['fourbye', 'fourhearts', 'fourido', 'fourtower']);
    expect(Array.from(new Set(ext(r[3]))).sort(), 'phase 3: DON\'T HUG THE CACTUS! joins').toEqual(['fourbye', 'fourcactus', 'fourhearts', 'fourido', 'fourtower']);
    expect(ext(r[1]).slice(0, 4), 'in order, round and round').toEqual(['fourbye', 'fourtower', 'fourido', 'fourbye']);
    expect(r.extra).toEqual(['fourbye', 'fourtower', 'fourido', 'fourhearts', 'fourcactus']);
    expect(r.moves, 'each a function with its own banner, and an item boss never throws one').toEqual(['function/GO BYE-BYE!/true', 'function/TAKE THE TOWER!/true', 'function/I DO THIS!/true', 'function/LOVE HEARTS!/true', "function/DON'T HUG THE CACTUS!/true"]);
    expect(r[1].every((k) => !/rain|seekers|ring|slam/.test(k)), 'none of the shared shapes is left').toBe(true);
  });
});

describe('his ending: multiplied by zero', () => {
  it('when he is beaten his shots and hills go and anyone he held is let go; a zero falls over him where he fell and lands once; the cards wait 1.7 s; it hurts nobody and says nothing', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 3)}
      var st = setTimeout, timers = [], said = [], _b = banner, impacts = [], _i = impact;
      setTimeout = function(fn, ms){ timers.push({ fn: fn, ms: ms }); return 0; };
      banner = function(t, m, k, l){ said.push([String(t), k || null]); return _b(t, m, k, l); };
      impact = function(x, y, o){ impacts.push([Math.round(x), Math.round(y), o && o.shake]); return _i.apply(this, arguments); };
      try {
        BOSSRUSH.active = true;
        var gy = groundY(), other = { owner:-2, x:0, y:0, r:8, life:50 };
        projectiles.push(fourShot(b, 9, { x:300, y:400, vx:3, vy:0, fourRing:true, shape:'fourwave', life:100 }), fourShot(b, 9, { x:300, y:400, vx:3, vy:0, fourHeart:true, shape:'fourheart', life:100 }), other);
        worldPlats.push({ x:200, y:gy - 70, w:70, h:70, solid:true, _four:true, _until:hazardT + 500 });
        f._byeHeld = true; f.hitstun = 2; f.invuln = 3; var bx = b.x, by = b.y, pct0 = f.pct;
        b.hp = 0; bossRushCheck();
        var mine = projectiles.filter(function(p){ return p.four && !p.fourEnd && !p.fourGhost; }).length, scene = projectiles.filter(function(p){ return p.fourEnd; }), ghost = projectiles.filter(function(p){ return p.fourGhost; });
        var out = { mine: mine, scene: scene.length, ghost: ghost.length, other: projectiles.indexOf(other) >= 0, plats: worldPlats.filter(function(p){ return p._four; }).length, held: f._byeHeld, hitstun: f.hitstun,
                    ms: timers.map(function(t){ return t.ms; }).sort(function(a, c){ return a - c; }), boss: summons.filter(function(s){ return s.type === 'boss'; }).length, saidBoss: said.some(function(s){ return s[1] === 'boss'; }),
                    at: scene[0] ? [Math.round(scene[0].ex), Math.round(scene[0].ey), scene[0].delay] : null, want: [Math.round(bx), Math.round(by)], loop: BOSSRUSH.loop };
        var down = timers.find(function(t){ return t.ms === FOUR.endHold; }), run0 = running; running = true; if (down) down.fn(); running = run0;
        out.card = said.some(function(s){ return /^BOSS DOWN!/.test(s[0]) && s[1] === 'sys'; });
        impacts.length = 0; f.x = bx; f.y = gy - 24; var n = 0;
        for (var i=0;i<FOUR.endT + 6;i++){ step(); f.x = bx; f.y = gy - 24; f.invuln = 0; n++; }
        out.landing = impacts.filter(function(p){ return p[2] === 12; }).length; out.landAt = impacts.filter(function(p){ return p[2] === 12; })[0];
        out.after = projectiles.filter(function(p){ return p.four; }).length; out.pct = f.pct - pct0; out.endT = FOUR.endT;
        return out;
      } finally { setTimeout = st; banner = _b; impact = _i; BOSSRUSH.active = false; summons = []; projectiles = []; }
    })()`);
    expect(r.mine, 'his shots are gone').toBe(0);
    expect(r.other, 'a shot that is not his is not swept').toBe(true);
    expect(r.plats, 'and his hills').toBe(0);
    expect(r.held, 'whoever he was holding is let go').toBe(false);
    expect(r.scene).toBe(1);
    expect(r.ghost, 'the zero\'s landing: a shot that carries one impact').toBe(1);
    expect(r.at.slice(0, 2), 'the scene is where he fell').toEqual(r.want);
    expect(r.at[2], 'the scene lasts endT frames').toBe(r.endT + 1);
    expect(r.ms, 'the BOSS DOWN card and the victory card 1.7 s late, the next boss 1.5 s after them').toEqual(expect.arrayContaining([1700, 1700, 3200]));
    expect(r.card).toBe(true);
    expect(r.saidBoss, 'no words').toBe(false);
    expect(r.boss, 'he is gone from the stage').toBe(0);
    expect(r.landing, 'the zero lands once, with the biggest impact of the scene').toBe(1);
    expect(r.landAt[1], 'on the floor where he fell').toBe(Math.round(W.eval('groundY()')));
    expect(r.after, 'the scene is over').toBe(0);
    expect(r.pct, 'a scene hurts nobody').toBe(0);
    expect(r.loop, 'the loop moved on at once').toBe(1);
  });
});

describe('a netcode client sees his rooms, his moves and his ending', () => {
  const HZ = `{ look:'fourscreech', rot:0.1, sx:1, sy:1, sig:'z', tl:54, mk:[[300, 560, 1, 0], [220, 560, 1, -1]], zp:[[300, 44, t + 4, t + 14, 380, 330]], inh:[400, 500, t - 5, t + 40, 520, 1], door:[t - 3, t + 90], hide:[[0, t + 10]],
    hp:[[300, 126, 0], [520, 126, 1]], hl:[[700, 126, 70, t - 6, t + 200]], rp:[60, 1, t + 5, 6, 96, 10, 46], hg:[320], pile:[[100, t + 90], [400, t + 120]], cb:[800, t - 10], cac:[[760, -1, t - 30, t + 150]],
    id:[[0, 300, 560, 1, 0], [-1, 500, 400, 0]], sn:[[300, 560, 0, t - 5]], sq:[[0, t + 20]], dc:[[300, t + 100]], sp:[550, t - 20, t + 20, t + 30, 3], tb:21, tbT:t - 30, sh:t - 10, lv:t - 10, p2:t - 300, tear:t - 50, ds:t - 5, q:[[t + 4, 300]] }`;
  it('the hazard bag, the arena and the ending cross the snapshot whole, and draw on the client', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow();
      BOSS_ARENA = 'fourest'; var gy = groundY(), t = hazardT;
      var hz = ${HZ};
      summons = [{ type:'boss', name:'Four', color:'#3a6ad0', r:95, sprite:'four', x:500, y:300, hp:80, maxHp:340, face:-1, flash:0, homeX:500, _rage:false, _tel:10, _telKind:'four', _bossRush:true, attack:'four', _phase:3, _hz:hz }];
      projectiles = [{ x:300, y:400, vx:6, vy:9, r:18, color:'#ff6fae', owner:-2, ownerObj:{ team:-1, idx:-2 }, bossAtk:9, life:20, shape:'fourheart', four:true, fourHeart:true },
                     { x:310, y:400, vx:6, vy:0, r:7, color:'#7ad0ff', owner:-2, ownerObj:{ team:-1, idx:-2 }, bossAtk:9, life:20, shape:'fourwave', four:true, fourRing:true },
                     { x:9, y:-5000, vx:0, vy:0, r:0, color:'#3a6ad0', owner:-2, ownerObj:{ team:-1, idx:-2 }, bossAtk:0, life:1, delay:90, shape:'fourend', four:true, fourEnd:true, et0:t - 10, ex:420, ey:400, ef:-1, er:95 },
                     { x:9, y:gy - 8, vx:0, vy:14, r:2, color:'#3a6ad0', owner:-2, ownerObj:{ team:-1, idx:-2 }, bossAtk:0, life:30, delay:26, shape:'fourghost', four:true, fourGhost:true }];
      var snap = JSON.parse(JSON.stringify(serializeState()));
      summons = []; projectiles = []; BOSS_ARENA = null;
      applySnapshot(snap);
      var err = null;
      try { [BOSS_ARENA, 'exitclass'].forEach(function(k){ drawArenaDecor(k); }); drawArenaHazard('under'); drawArenaHazard('over'); summons.forEach(drawSummon); projectiles.forEach(drawProjectile); drawFourFx(summons[0]); drawBossBar(); draw(); }
      catch(e){ err = e.message + ' ' + (e.stack||'').split('\\n')[1]; }
      var end = projectiles.find(function(p){ return p.fourEnd; });
      return { err: err, arena: BOSS_ARENA, hz: JSON.stringify(summons[0]._hz), want: JSON.stringify(hz), boss: { attack: summons[0].attack, tel: summons[0]._tel, kind: summons[0]._telKind, phase: summons[0]._phase },
               end: end ? { et0: end.et0, ex: end.ex, ey: end.ey, ef: end.ef, er: end.er, shape: end.shape } : null, ghost: !!projectiles.find(function(p){ return p.fourGhost; }), t: t,
               shapes: projectiles.map(function(p){ return p.shape; }) };
    })()`);
    expect(r.err).toBe(null);
    expect(r.arena, 'the client draws The Fourest').toBe('fourest');
    expect(r.hz, 'every field of what he is doing arrives as it was sent').toBe(r.want);
    expect(r.boss).toEqual({ attack: 'four', tel: 10, kind: 'four', phase: 3 });
    expect(r.end, 'and so does the ending: where, when, which way, how big').toEqual({ et0: r.t - 10, ex: 420, ey: 400, ef: -1, er: 95, shape: 'fourend' });
    expect(r.ghost, 'with the shot that carries its landing').toBe(true);
    expect(r.shapes, 'the hearts and the wave are drawn from their shapes alone').toEqual(expect.arrayContaining(['fourheart', 'fourwave']));
  });
});

describe('no words, no other show, and the art is wired and credited', () => {
  // Every draw of his rooms, of him in every state and of everything he throws, on a canvas that records what it is asked to do: not one word.
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
  const HZ_ALL = `{ look:'fourscreech', rot:0.1, sx:1.04, sy:0.96, sig:'z', tl:54, mk:[[300, 560, 0, 0], [300, 560, 1, 0], [220, 560, 1, -1]], zp:[[300, 44, t - 2, t + 8, 380, 330], [500, 44, t + 4, t + 14, 380, 330]], inh:[400, 500, t - 5, t + 40, 520, 1],
    door:[t - 3, t + 90], hide:[[0, t + 10]], hp:[[300, 126, 0], [520, 126, 1]], hl:[[700, 126, 70, t - 6, t + 200], [200, 126, 70, t - 60, t + 14]], rp:[60, 1, t - 20, 6, 96, 10, 46], hg:[320], pile:[[100, t + 90], [400, t + 20]], cb:[800, t - 10],
    cac:[[760, -1, t - 40, t + 150], [300, 1, t - 5, t + 150], [500, 1, t - 300, t - 10]], id:[[0, 300, 560, 1, 0], [-1, 500, 400, 0], [0, 340, 560, 0]], sn:[[300, 560, 0, t - 5], [500, 400, -1, t - 20]], sq:[[0, t + 20]], dc:[[300, t + 100]],
    sp:[550, t - 20, t + 20, t + 30, 3], tb:21, tbT:t - 30, sh:t - 10, lv:t - 10, p2:t - 300, tear:t - 50, ds:t - 5 }`;

  it('draws both rooms, him in every look and everything he throws without a word of text', () => {
    const { w, rec } = bootRecording();
    w.eval("SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow(); running = false;");   // (the match's own HUD writes the fighters' names: not his business)
    const n0 = rec.length;
    const err = w.eval(`(function(){
      try {
        var gy = groundY(), t = hazardT + 100; hazardT = t;
        var hz = ${HZ_ALL};
        var base = { type:'boss', name:'Four', color:'#3a6ad0', sprite:'four', r:95, x:500, y:gy-200, face:-1, hp:100, maxHp:340, _tel:0, _telKind:null, _phase:3, _rage:false, flash:0, homeX:500, attack:'four', _bossRush:true, _hz:hz };
        var looks = ['fourscreech', 'fourbye', 'fourzap', 'fourtower', 'fourlove', 'fourpuddle', 'fourmad', 'fournext', null];
        [{}, { _tel:20, _telKind:'four' }, { _tel:20, _telKind:'fourbye' }, { _tel:20, _telKind:'fourido' }, { face:1, _phase:1 }, { flash:6 }, { _phase:2 }, { _hz:{} }].forEach(function(st, i){
          looks.forEach(function(k){ summons = [Object.assign({}, base, st)]; summons[0]._hz = Object.assign({}, summons[0]._hz, { look:k }); ctx.save(); drawSummon(summons[0]); ctx.restore(); drawFourFx(summons[0]); });
        });
        ['exitclass', 'fourest'].forEach(function(arena){
          BOSS_ARENA = arena;
          [base, Object.assign({}, base, { _phase:1, _hz:{} }), Object.assign({}, base, { _phase:2, _hz:{ tb:5, p2:t - 100, sp:[400, t - 30, t + 10, t + 20, 1], door:[t - 20, t + 5] } })].forEach(function(bb){
            summons = [bb]; drawArenaDecor(arena); drawArenaHazard('under'); drawArenaHazard('over'); drawFourFx(bb);
          });
          summons = []; drawArenaDecor(arena); drawArenaHazard('under'); drawArenaHazard('over');   // between bosses
          arenaGround().pattern(ctx, gy, -20, WW + 20, WH + H, arenaGround());
        });
        ['fourwave', 'fourheart'].forEach(function(sh){
          drawProjectile({ x:300, y:300, vx:8, vy:2, r:sh === 'fourwave' ? 7 : 18, owner:-2, ownerObj:{ team:-1, idx:-2 }, shape:sh, color:'#ff6fae' }); drawProjectile({ x:300, y:300, vx:0, vy:0, r:30, owner:-2, ownerObj:{ team:-1, idx:-2 }, shape:sh, color:'#ff6fae' }); });
        [0, 6, 14, 22, 30, 40, 50, 58, 70, 80, 95, 104].forEach(function(u){ [0, 600].forEach(function(ex){ drawProjectile({ x:9, y:-5000, vx:0, vy:0, r:0, owner:-2, ownerObj:{ team:-1, idx:-2 }, shape:'fourend', fourEnd:true, et0:t - u, ex:420 + ex/4, ey:400, ef:-1, er:95, color:'#3a6ad0' }); }); });
        drawProjectile({ x:9, y:gy - 8, vx:0, vy:14, r:2, owner:-2, ownerObj:{ team:-1, idx:-2 }, shape:'fourghost', fourGhost:true, color:'#3a6ad0' });
        return null;
      } catch(e){ return e.message + ' ' + (e.stack||'').split('\\n')[1]; }
    })()`);
    expect(err).toBe(null);
    const drawn = rec.slice(n0);
    expect(drawn.length, 'the recording is live').toBeGreaterThan(2000);
    expect(drawn.filter((r) => r.op === 'fillText' || r.op === 'strokeText').length, 'not a word on the canvas').toBe(0);
  });

  it("nothing of his says a word or names anyone from the OSC: his code (every slot of his) has no banner of its own but the engine's telegraph, no text drawing, no OJ, Suitcase, Cabby or The Floor", () => {
    const L = readFileSync('artifacts/V1/index.html', 'utf8').split(/\r?\n/);
    const inside = []; let on = false, n = 0;
    for (const l of L) {
      const m = l.match(/@boss:four:(begin|end) ([a-z]+)/);
      if (m) { on = m[1] === 'begin'; if (m[1] === 'begin') n++; continue; }
      if (on) inside.push(l);
    }
    const src = inside.join('\n'), code = inside.map((l) => l.replace(/\/\/.*$/, '')).join('\n');
    expect(n, 'his slots: one pair for each of the 32').toBe(32);
    expect(src.length, 'and a lot of him').toBeGreaterThan(40000);
    expect(src).not.toMatch(/\bOJ\b|Suitcase|Cabby|The Floor/);
    expect(code, 'no banner of his own').not.toMatch(/banner\(/);
    expect(code, 'no text on the canvas').not.toMatch(/fillText|strokeText/);
    expect(code, 'no numeral of text on his body either (his drawn 4 is a shape)').not.toMatch(/ctx\.font/);
  });

  it("his hearts wear the show's art -- the BFB Love Heart, cut from File:Love hearts0001.png -- and everything else he throws is drawn; the file is a real PNG at projectile size, on the record and credited", () => {
    const reg = W.eval(`({ heart: ATTACK_SPRITES.fourheart, glyph: !!PROJ_SHAPE.fourheart, wave: [!!PROJ_SHAPE.fourwave, !!ATTACK_SPRITES.fourwave] })`);
    const manifest = JSON.parse(readFileSync('scripts/attack-sprite-manifest.json', 'utf8'));
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const picks = readFileSync('scripts/fetch-attack-sprites.mjs', 'utf8');
    const file = 'artifacts/V1/' + reg.heart.src;
    expect(existsSync(file), file).toBe(true);
    const png = PNG.sync.read(readFileSync(file));
    expect(Math.max(png.width, png.height), 'projectile size').toBeLessThanOrEqual(128);
    const clear = (() => { let c = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) c++; return c / (png.width * png.height); })();
    expect(clear, 'cut out, not a screenshot').toBeGreaterThan(0.12);
    expect(reg.glyph, 'a drawn glyph to show until it loads').toBe(true);
    expect(reg.wave, "the ring is drawn: no file of a sound wave that is not a character").toEqual([true, false]);
    const m = manifest.fourheart;
    expect(m, 'on the record').toMatchObject({ file: 'fourheart.png', kits: ['fourheart'], srcTitle: 'Love hearts0001.png', wiki: 'bfdi', width: png.width, height: png.height });
    expect(m.source).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/battlefordreamisland\/images\//);
    expect(credits, 'credited with its exact source, in the form every attack file is (test/attack-art-files.test.js)').toContain('(fourheart.png)');
    expect(credits).toContain(m.source);
    expect(picks, 'with its pick in his slot').toMatch(/fourheart:\s*\{ who: 'Four \(LOVE HEARTS!\)'/);
  });

  it("each of his renders is a real transparent PNG at render size, credited with its exact source, on the sprite manifest, and flipped exactly as the manifest measured its facing", () => {
    const keys = ['four', 'fourscreech', 'fourbye', 'fourzap', 'fourtower', 'fourlove', 'fourpuddle', 'fourmad', 'fournext'];
    const reg = W.eval(`(function(){ var o = {}; ${JSON.stringify(keys)}.forEach(function(k){ o[k] = [BOSS_SPRITE_SRC[k], !!BOSS_SPRITE_FLIP[k]]; }); return o; })()`);
    const manifest = JSON.parse(readFileSync('scripts/sprite-manifest.json', 'utf8'));
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const names = { four: 'Four', fourscreech: 'Four (screech)', fourbye: 'Four (bye bye)', fourzap: 'Four (zap)', fourtower: 'Four (tower)', fourlove: 'Four (love)', fourpuddle: 'Four (puddle)', fourmad: 'Four (mad)', fournext: 'Four (next level mad)' };
    for (const k of keys) {
      const [src, flip] = reg[k], file = 'artifacts/V1/' + src, e = manifest[names[k]];
      expect(existsSync(file), file).toBe(true);
      const png = PNG.sync.read(readFileSync(file));
      expect(png.height, k + ' is a render, at most 200 tall').toBeLessThanOrEqual(200);
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      expect(clear/(png.width*png.height), k + ' is transparent around him').toBeGreaterThan(0.1);
      expect(e, k + ' is on the manifest').toMatchObject({ file: src.split('/').pop(), width: png.width, height: png.height });
      expect(flip, k + ' faces as the manifest measured it (flip when the face sits left of the body)').toBe(!!e.flip);
      expect(credits, k + ' is credited with its exact source').toContain(e.source);
      expect(credits).toContain('`' + src.split('/').pop() + '`');
    }
  });
});
