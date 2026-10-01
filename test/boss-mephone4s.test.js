import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { JSDOM } from 'jsdom';
import { loadMonolith } from './helpers/load-monolith.js';
import { mulberry32 } from './helpers/prng.js';

// Boss 8, MePhone4S ("The Terminator"), rebuilt in the boss overhaul (2026-09-29). The owner's kit (boss-overhaul-decisions.md, Rounds 8 and 10):
// "PUT THAT COOKIE DOWN! (redone: from P2 the volley freezes mid-air, then resumes), I'LL BE BACK!, ONE OF EACH!, HASTA LA VISTA! (in place of the cut
// POISONED COOKIES!). Arena: his Super Death Trap over the quicksand." and "POP UP! (sinks into the quicksand, pops up under you; bubbles show where),
// QUICKSAND SHOVE! (a charging tackle into a slowing quicksand strip)" -- six attacks, each a scene from the show, all of them through the boss engine's kit
// (impact, the fall drift, the arena's ground and hazard, its ending). "Harder, same damage": every part of a turn shares that turn's one attack id, so a
// fighter takes at most one boss hit from it. Never tuned for a bot: every number here is what the design says, and "Accept level" with MePhone4 (Round 11)
// means neither is tuned to separate them.

let W;
beforeAll(async () => { W = loadMonolith().window; await W.eval('profileReady'); });

const ROW = { name: 'MePhone4S', color: '#c8102e', hp: 260, big: 2.5, attack: 'mephone4s', arena: 'deathtrap', stationary: false, sprite: 'mephone4s' };
const EX = ['s4prizes', 's4vista', 's4popup', 's4car', 's4shove'];
const HP = { 1: 1, 2: 0.5, 3: 0.2 };
// A still Firey on the floor at `x` and MePhone4S spawned the way the gauntlet spawns him (BOSSRUSH.active false: the gauntlet logic off), his entrance over and
// the phase beat of `ph` run out (what a hit that crosses a threshold starts), standing at 700 over the quicksand, his attack timer held unless `live`. `plats`
// puts the stage's one platform back (the arena's flip and the platform-safe tests need it).
const STAGE = (x, ph = 1, live = false, plats = false) => `
  SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
  BOSSRUSH = { active:false, bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.name==='MePhone4S'; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats=${plats ? 'platRectsSmall()' : '[]'}; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; hazardT=0;
  var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), ${x}, groundY()-24, 0);
  f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
  spawnBossRushBoss();
  var b = summons.find(function(s){ return s.type==='boss'; });
  b.hp = b.maxHp*${HP[ph]}; b._atkTimer = 1e9;
  b._s4 = null; b.hover = false; b.x = 700; b.y = groundY() - b.r; b.vx = 0; b.vy = 0; b._homeX = 700; b.face = -1;
  step(); step();
  b._s4 = null; b._s4q = null; b._beatQ = 0; b._carDue = false; b.hover = false; b.vx = 0; b.vy = 0; b.x = 700; b.y = groundY() - b.r; b.face = -1; b._tel = 0; b._hz = {};
  projectiles = []; hazardT = 0; ${live ? 'b._atkTimer = 1;' : ''}
  f.pct = 0; f.invuln = 0; f.hitstun = 0; f.x = ${x}; f.y = groundY()-24; f.vx = 0; f.vy = 0; f.onground = true;
`;
// A bare MePhone4S for driving his functions directly. `hp` out of 100 sets the phase updateBossAttack works out.
const S = (o = '') => `{ name:'MePhone4S', attack:'mephone4s', type:'boss', x:550, y:groundY()-85, r:85, hp:100, maxHp:100, _phase:1, _atkTimer:1, _tel:0,
  color:'#c8102e', face:1, homeX:550, stationary:false, vx:0, vy:0 ${o ? ',' + o : ''} }`;
// Begin move `kind` ('gun' or one of EX) of the boss `b` now and run its wind-up out: the frame the move fires is the last one this returns from.
const FIRE = (kind) => `b._moveN = ${kind === 'gun' ? 0 : 2 * EX.indexOf(kind) + 1}; b._atkTimer = 1; step(); var telKind = b._telKind, telName = document.getElementById('banner').textContent, tel0 = b._tel;
  for (var w=0; w<80 && b._tel>0; w++){ step(); }`;

describe('MePhone4S takes his Super Death Trap', () => {
  it('is Boss 8 (before the Dragon), his own arena, and his six attacks in turn: the gun between each of the five others, each named, each with its own wind-up', () => {
    const r = W.eval(`(function(){
      var i = BOSS_ROSTER.findIndex(function(b){ return b.name==='MePhone4S'; });
      var idx = function(n){ return BOSS_ROSTER.findIndex(function(b){ return b.name===n; }); };
      var kinds = [], names = [], tels = [], s = ${S('_phase:2, hp:50')};
      for (var k=0;k<10;k++){ s._atkTimer = 1; s._tel = 0; s._s4 = null; updateBossAttack(s, null); kinds.push(s._telKind); names.push(bossTelName(s)); tels.push(s._tel); }
      return { i: i, row: BOSS_ROSTER[i], leafy: idx('Evil Leafy'), mephone: idx('MePhone4'), dragon: idx('Purple Dragon'), two: idx('Two'), four: idx('Four'), n: BOSS_ROSTER.length, extra: BOSS_EXTRA['MePhone4S'],
               kinds: kinds, names: names, tels: tels, p2: bossPhaseName({ attack:'mephone4s' }, 2), p3: bossPhaseName({ attack:'mephone4s' }, 3),
               gaps: [1,2,3].map(function(ph){ var q = ${S()}; q._phase = ph; q.hp = [100, 50, 20][ph-1]; return bossAtkGap(q); }), held: (function(){ var q = ${S()}; q._s4 = { k:'pop', go:true }; return bossAtkGap(q); })(),
               rushOnly: ${JSON.stringify(EX)}.map(function(k){ return BOSS_RUSH_ONLY.has(k); }),
               moves: BOSS_EXTRA['MePhone4S'].map(function(k){ return typeof BOSS_MOVES[k] + '/' + BOSS_MOVE_NAME[k]; }),
               telLens: ['mephone4s'].concat(${JSON.stringify(EX)}).map(function(k){ return bossTelLen({ attack:'mephone4s', _telKind:k }); }), telBare: bossTelLen({ attack:'mephone4s' }) };
    })()`);
    expect(r.row).toEqual(ROW);
    expect(r.i, 'Boss 8 ("just move purple dragon!!!" (the owner, 2026-09-30): the Dragon is 9)').toBe(7);
    expect(r.i).toBeGreaterThan(r.leafy);
    expect(r.i, 'after MePhone4, whom he beat').toBeGreaterThan(r.mephone);
    expect(r.dragon, 'the Dragon follows him').toBe(r.i + 1);
    expect(r.i, 'before Two and Four').toBeLessThan(r.two);
    expect(r.four, 'Four is still last').toBe(r.n - 1);
    expect(r.extra, '"PUT THAT COOKIE DOWN! (redone), I\'LL BE BACK!, ONE OF EACH!, HASTA LA VISTA!" and the two the owner added').toEqual(EX);
    // the signature on every odd turn, then the five in the order of the list
    expect(r.kinds).toEqual(['mephone4s', 's4prizes', 'mephone4s', 's4vista', 'mephone4s', 's4popup', 'mephone4s', 's4car', 'mephone4s', 's4shove']);
    // the names are the show's words: "Put that cookie down! ... Now!", "I'll be back", "We'll give them one of each!", "Hasta la vista, Blu-Ray...", "pops up from under"
    expect(r.names).toEqual(['PUT THAT COOKIE DOWN!', 'ONE OF EACH!', 'PUT THAT COOKIE DOWN!', 'HASTA LA VISTA!', 'PUT THAT COOKIE DOWN!', 'POP UP!', 'PUT THAT COOKIE DOWN!', "I'LL BE BACK!", 'PUT THAT COOKIE DOWN!', 'QUICKSAND SHOVE!']);
    expect(r.moves).toEqual(['function/ONE OF EACH!', 'function/HASTA LA VISTA!', 'function/POP UP!', "function/I'LL BE BACK!", 'function/QUICKSAND SHOVE!']);
    expect(r.tels, 'each move reads out its own wind-up').toEqual([42, 36, 42, 46, 42, 46, 42, 46, 42, 46]);
    expect(r.telLens, 'the gun 42, the props 36, the rest 46').toEqual([42, 36, 46, 46, 46, 46]);
    expect(r.telBare, 'a bare boss with no move yet is the gun\'s').toBe(42);
    expect([r.p2, r.p3]).toEqual(["I'll Be Back", 'Super Death Trap']);
    // "bosses should attack a bit slower" (the owner, 2026-09-30): his own 108 / 78 / 56 (a little longer than the usual 100 / 72 / 52: his arena's sawblades and
    // quicksand press as well -- "if it makes sense for a hazard, reduce boss difficulty and add a hazard", Round 11) times BOSS_PACE (1.2)
    expect(r.gaps, 'his own pacing, paced, quicker each phase').toEqual([130, 94, 67]);
    expect(r.held, 'held while a move runs').toBe(1e6);
    expect(r.rushOnly, 'an item boss never throws them: they need his floor and his arena').toEqual([true, true, true, true, true]);
  });

  it('in phase 1 the car turn plays the next move instead; entering phase 2 makes the car the very next extra, and the order carries on', () => {
    const r = W.eval(`(function(){
      var run = function(hp, ph, n){ var s = ${S('_phase:ph, hp:hp')}, out = [];
        for (var k=0;k<n;k++){ s._atkTimer = 1; s._tel = 0; s._s4 = null; s._beatQ = 0; updateBossAttack(s, null); out.push(s._telKind); } return out.join(' '); };
      return { p1: run(100, 1, 12), p2: run(50, 2, 12), p3: run(20, 3, 12), enter: run(50, 1, 8) };
    })()`);
    expect(r.p1, 'no car in phase 1: the fourth extra is the shove').toBe('mephone4s s4prizes mephone4s s4vista mephone4s s4popup mephone4s s4shove mephone4s s4prizes mephone4s s4vista');
    expect(r.p2, 'phase 2: the car takes its place in the order').toBe('mephone4s s4prizes mephone4s s4vista mephone4s s4popup mephone4s s4car mephone4s s4shove mephone4s s4prizes');
    expect(r.p3).toBe(r.p2);
    expect(r.enter, 'a boss that has just entered phase 2 plays the car first ("I\'ll Be Back")').toBe('mephone4s s4car mephone4s s4vista mephone4s s4popup mephone4s s4car');
  });

  it('gives the place its sky, its red beam over the quicksand, its hazard and its ending, and every arena key a netcode client would take; the studio is still the studio', () => {
    const r = W.eval(`({ sky: BOSS_ARENA_SKY.deathtrap, ground: BOSS_ARENA_GROUND.deathtrap && [BOSS_ARENA_GROUND.deathtrap.fill, BOSS_ARENA_GROUND.deathtrap.line, typeof BOSS_ARENA_GROUND.deathtrap.pattern],
      hz: [typeof arenaHazardOf('deathtrap').step, typeof arenaHazardOf('deathtrap').draw], end: [typeof BOSS_ENDINGS.mephone4s.sweep, typeof BOSS_ENDINGS.mephone4s.begin, BOSS_ENDINGS.mephone4s.holdMs, BOSS_ENDINGS.mephone4s.line],
      others: ['studio','forest','void','cave','cerealbox','hotelroof'].every(function(k){ return !!BOSS_ARENA_SKY[k]; }), cave: BOSS_ARENA_SKY.cave.length,
      decor: String(drawArenaDecor).indexOf('s4DrawDecor') >= 0, studio: String(drawArenaDecor).indexOf('key==="studio"') >= 0 })`);
    expect(r.sky).toHaveLength(2);
    expect(r.ground, 'the red beam: sand-yellow where the chasm shows, the beam\'s dark red for the line').toEqual(['#e6c880', '#7a0c00', 'function']);
    expect(r.hz).toEqual(['function', 'function']);
    expect(r.end, 'a short canon exit, held 1.5 s, no line of text').toEqual(['function', 'function', 1500, undefined]);
    expect(r.others, 'the other arenas are not touched').toBe(true);
    expect(r.cave).toBe(2);
    expect(r.decor).toBe(true);
    expect(r.studio, 'the studio decor (Cobs\'s, the item bosses\') is still there').toBe(true);
  });

  it('he drops in from above, lands heavily with the sky answering, and holds still for 80 frames before his first turn', () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
      BOSSRUSH = { active:false, bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.name==='MePhone4S'; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
      worldPlats=platRectsSmall(); summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; hazardT=0;
      var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 300, groundY()-24, 0);
      f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
      spawnBossRushBoss();
      var b = summons.find(function(s){ return s.type==='boss'; });
      var out = { y0: b.y, k0: b._s4 && b._s4.k, arena: BOSS_ARENA, hp: b.maxHp, R: b.r, gy: groundY() };
      var _imp = impact, imps = [], tel = false;
      impact = function(x, y, o){ imps.push([hazardT, Math.round(x), Math.round(y), o && o.shake]); return _imp(x, y, o); };
      try {
        var landed = -1, ys = [];
        for (var k=0;k<200 && landed < 0;k++){ f.x = 300; f.invuln = 9999; step(); if (k%12 === 0) ys.push(Math.round(b.y)); if (b._s4 === null) landed = k; if (b._tel > 0) tel = true; }
        out.landed = landed; out.ys = ys; out.imps = imps.slice(); out.by = b.y; out.timer = b._atkTimer; out.thunder = b._hz.thunder; out.tel = tel;
        var first = -1; for (var j=0;j<200 && first < 0;j++){ f.x = 300; f.invuln = 9999; step(); if (b._tel > 0) first = j; }
        out.first = first;
      } finally { impact = _imp; summons = []; projectiles = []; }
      return out;
    })()`);
    expect(r.y0, 'above the screen').toBeLessThan(0);
    expect(r.k0, 'the entrance is a scripted state').toBe('enter');
    expect(r.arena, 'the gauntlet puts him in his own arena').toBe('deathtrap');
    expect(r.hp).toBe(260);
    expect(r.ys.every((y, i, a) => i === 0 || y > a[i - 1]), 'he falls, the engine\'s own gravity, getting faster').toBe(true);
    expect(r.landed).toBeGreaterThan(30);
    expect(r.by, 'standing on the beam').toBeCloseTo(r.gy - r.R, 0);
    expect(r.imps.length, 'one landing').toBe(1);
    expect(r.imps[0][3], 'a heavy one: the floor shakes hard').toBeGreaterThanOrEqual(14);
    expect(r.imps[0][2], 'on the floor line').toBeCloseTo(r.gy, 0);
    expect(r.thunder, 'and the sky answers ("lightning strikes in the background")').toBeGreaterThanOrEqual(0);
    expect(r.tel, 'he winds nothing up while he falls').toBe(false);
    expect(r.first, 'his first wind-up begins about 80 frames after he lands').toBeGreaterThan(60);
    expect(r.first).toBeLessThan(100);
  });

  it('walking the gauntlet spawns him eighth, and beating him sweeps his shots, hands over the arena and moves on to the Dragon', () => {
    const r = W.eval(`(function(){
      var st = setTimeout; setTimeout = function(){ return 0; };   // bossRushCheck queues the next spawn; this walk spawns by hand
      try {
        SETTINGS.mode='boss'; SETTINGS.stocks=99; running=true;
        BOSSRUSH = { active:true, bossIdx:0, cleared:0, defeated:false, loop:0, dmgMult:1 };
        var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 200, groundY()-24, 0);
        f.team=0; f.controller='still'; f.stocks=3; fighters=[f]; summons=[];
        var order = [], atHim = null;
        for (var i=0;i<14;i++){
          spawnBossRushBoss();
          var b = summons.find(function(s){ return s.type==='boss'; });
          order.push(b.name);
          if (b.name==='Four') break;
          if (b.name==='MePhone4S'){
            projectiles = [{ owner:-2, s4:1, x:300, y:400, r:8, life:100 }, { owner:-2, s4:2, shape:'redcar', x:300, y:560, r:26, life:100 }, { owner:-2, x:0, y:0, r:8, life:50 }];
            var idx0 = BOSSRUSH.bossIdx, arena = BOSS_ARENA;
            b.hp = 0; bossRushCheck();
            atHim = { arena: arena, advanced: BOSSRUSH.bossIdx - idx0, s4Left: projectiles.filter(function(p){ return p.s4 === 1 || p.s4 === 2; }).length,
                      othersLeft: projectiles.filter(function(p){ return !p.s4; }).length, victory: document.getElementById('rushVictory').style.display };
            continue;
          }
          b.hp = 0; bossRushCheck();
        }
        return { order: order, atHim: atHim };
      } finally { setTimeout = st; BOSSRUSH.active=false; running=false; summons=[]; projectiles=[]; }
    })()`);
    expect(r.order).toEqual(['Announcer', 'Puffball Speaker Box', 'Firey Speaker Box', 'The Bug Swarm', 'Purple Face',
      'MePhone4', 'Evil Leafy', 'MePhone4S', 'Purple Dragon', 'Two', 'Springy', 'Four']);
    expect(r.atHim.arena, 'he fought in his own place').toBe('deathtrap');
    expect(r.atHim.advanced).toBe(1);
    expect(r.atHim.s4Left, 'his rounds and his car go with him').toBe(0);
    expect(r.atHim.othersLeft, 'nothing else is swept').toBe(1);
    expect(r.atHim.victory).not.toBe('flex');
  });

  it('a phase change is announced, and starts what the phase brings: thunder and the car next in phase 2, a pop-up from under the floor near you with no hit in the beat, and the one burst that skips phase 2 gets both', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var out = { p1: b._phase };
      b.hp = b.maxHp*0.5; b._atkTimer = 1e9; updateBossAttack(b, f); out.p2 = b._phase; out.b2 = document.getElementById('banner').textContent; out.thunder = b._hz.thunder; out.due = b._carDue; out.beat = b._beatQ;
      // the beat, once he is idle: he sinks into the floor and comes up near you, and the pop does not hurt
      f.x = 400; f.invuln = 0; f.pct = 0;
      var seen = { st:[], k: null, x: null, beat: null }, hurt = 0;
      for (var i=0;i<200;i++){
        f.x = seen.x != null ? seen.x : 400; f.y = groundY()-24; f.vx = 0; f.invuln = 0; var p0 = f.pct; step();   // once he has picked his spot, you stand right on it
        if (f.pct > p0) hurt++;
        var A = b._s4; if (A && !seen.k){ seen.k = A.k; seen.beat = A.beat; seen.x = A.x; seen.sx = A.sx; }
        if (A && seen.st[seen.st.length-1] !== A.st) seen.st.push(A.st);
        if (!A && seen.k) break;
      }
      out.seen = seen; out.hurt = hurt; out.timer = b._atkTimer;
      b.hp = b.maxHp*0.2; updateBossAttack(b, f); out.p3 = b._phase; out.b3 = document.getElementById('banner').textContent; out.due3 = b._carDue;
      // one burst of damage that skips phase 2 still gets both
      ${STAGE(300)}
      b.hp = b.maxHp*0.1; updateBossAttack(b, f); out.skip = { phase: b._phase, thunder: b._hz.thunder != null, due: b._carDue, beat: b._beatQ };
      summons = []; projectiles = []; return out;
    })()`);
    expect([r.p1, r.p2, r.p3]).toEqual([1, 2, 3]);
    expect(r.b2).toMatch(/PHASE 2: I'll Be Back/);
    expect(r.b3).toMatch(/PHASE 3: Super Death Trap/);
    expect(r.thunder, 'the sky answers').toBeGreaterThanOrEqual(0);
    expect(r.due, 'the car is his next move').toBe(true);
    expect(r.beat, 'and he will pop up from under the floor once he is idle').toBe(2);
    expect(r.seen.k).toBe('pop');
    expect(r.seen.beat, 'the beat\'s pop is marked').toBe(1);
    expect(Math.abs(r.seen.x - 400), 'he picked a spot near you (150 px to the side), not under you').toBeGreaterThanOrEqual(100);
    expect(r.seen.st.slice(0, 4), 'sink, dig, rise, fall: he goes under the floor and comes up').toEqual(['sink', 'dig', 'rise', 'fall']);
    expect(r.hurt, 'a beat, not an attack: even standing where he comes up, nobody is hurt').toBe(0);
    expect(r.timer, 'and he is back to his gaps afterwards').toBeGreaterThan(0);
    expect(r.due3).toBe(true);
    expect(r.skip).toEqual({ phase: 3, thunder: true, due: true, beat: 3 });
  });
});

describe('PUT THAT COOKIE DOWN! (the gun)', () => {
  it('fires one round, then a fan of two, then three -- 18 px a frame, a whole boss hit, kb 12, one attack id -- each from his pistol\'s muzzle along the line it was aimed on', () => {
    const r = W.eval(`(function(){ var out = [];
      ${[1, 2, 3].map((ph) => `{ ${STAGE(300, ph, true)}
        ${FIRE('gun')}
        var rounds = projectiles.filter(function(p){ return p.s4 === 1; }), ay = groundY() - 24, last = rounds[rounds.length - 1];
        out.push({ kind: telKind, name: telName, tel0: tel0, n: rounds.length, spd: rounds.map(function(p){ return Math.hypot(p.vx, p.vy); }), dmg: rounds.map(function(p){ return p.dmg; }), kb: rounds.map(function(p){ return p.kb; }),
          ids: rounds.map(function(p){ return p.bossAtk; }).filter(function(v, i, a){ return a.indexOf(v) === i; }).length, delays: rounds.map(function(p){ return p.delay||0; }),
          ang: rounds.map(function(p){ return Math.atan2(p.vy, p.vx); }),
          // the last round has not moved yet (it waits its delay at the muzzle), so the line from it to the mark is the line the fan is centred on
          mid: Math.atan2(ay - last.y, 300 - last.x), muzzle: [last.x, last.y], mz: (function(){ var M = s4Muzzle(b, 300, ay); return [M.x, M.y]; })(),
          streak: rounds.every(function(p){ return p.beamShot && p.breaksOnSurface && p.landImpact; }), full: bossDmg(),
          others: projectiles.filter(function(p){ return p.s4 !== 1; }).length, thunder: b._hz.thunder != null });
        summons = []; projectiles = []; }`).join('\n')}
      return out; })()`);
    expect(r.map((o) => o.n), 'one, two, three rounds').toEqual([1, 2, 3]);
    for (const o of r) {
      expect(o.kind).toBe('mephone4s');
      expect(o.name).toBe('PUT THAT COOKIE DOWN!');
      expect(o.tel0).toBe(42);
      for (const v of o.spd) expect(v).toBeCloseTo(18, 1);
      for (const d of o.dmg) expect(d, 'damage per hit unchanged').toBe(o.full);
      for (const k of o.kb) expect(k).toBe(12);
      expect(o.streak, 'a streak that chips the floor where it lands').toBe(true);
      expect(o.ids, 'one attack id per volley').toBe(1);
      expect(o.others, 'a gun turn is only the gun').toBe(0);
    }
    // (read the frame after the shot: a waiting round's delay has ticked once, so the five-frame step between rounds, S4.fzStep, reads 0, 4, 9)
    expect(r.map((o) => o.delays), 'each round a few frames behind the last (they all start from the muzzle)').toEqual([[0], [0, 4], [0, 4, 9]]);
    expect(r[0].thunder, 'phase 1 keeps the sky quiet').toBe(false);
    expect(r[1].thunder, '"lightning strikes in the background": from phase 2 each shot').toBe(true);
    // the fan: neighbours a spread (0.07 rad) apart, centred on the line from the muzzle to the mark
    const sp = r[2].ang;
    expect(sp[1] - sp[0]).toBeCloseTo(0.07, 3);
    expect(sp[2] - sp[1]).toBeCloseTo(0.07, 3);
    expect(sp[1], 'the middle round is on the line').toBeCloseTo(r[2].mid, 2);
    expect(Math.hypot(r[2].muzzle[0] - r[2].mz[0], r[2].muzzle[1] - r[2].mz[1]), 'the rounds leave from the pistol\'s muzzle, not from his middle').toBeLessThan(24);
  });

  it('the sight follows its mark for the first 24 frames and locks for the last 18; the round goes where it locked, so stepping off the line is the dodge', () => {
    expect(W.eval('S4.lock')).toBe(18);
    const r = W.eval(`(function(){ ${STAGE(820, 1, true)}
      b._moveN = 0; b._atkTimer = 1; step();
      var out = { kind: b._telKind, tel: b._tel, follow: true, held: true, lockedLate: true, lockedEarly: false, shot: null, face: true };
      var AP = addProj; addProj = function(p){ if (p && p.owner===-2 && p.s4 === 1 && !out.shot) out.shot = { x:p.x, y:p.y, vx:p.vx, vy:p.vy }; return AP(p); };
      try {
        for (var i=0;i<24;i++){ f.x = 820 + (i+1)*4; f.vx = 0; f.invuln = 9999; step();
          if (b._aimX !== f.x) out.follow = false; if (b._aimLock) out.lockedEarly = true; if (b.face !== Math.sign(f.x - b.x)) out.face = false; }
        var lx = b._aimX, ly = b._aimY;
        for (var j=0;j<18;j++){ f.x = 700 - j*6; f.vx = 0; f.invuln = 9999; step();
          if (b._aimX !== lx || b._aimY !== ly) out.held = false; if (!b._aimLock) out.lockedLate = false; }
        out.lx = lx; out.ly = ly; out.fxAfter = f.x;
      } finally { addProj = AP; }
      // and the round misses a fighter who stepped off the line
      var tx = out.shot ? out.shot.x : 0; summons = []; projectiles = []; return out;
    })()`);
    expect(r.kind).toBe('mephone4s');
    expect(r.tel).toBe(42);
    expect(r.follow, 'it follows you while it is red').toBe(true);
    expect(r.face, 'he faces his mark: the pistol hand is on that side').toBe(true);
    expect(r.lockedEarly).toBe(false);
    expect(r.held, 'then it stays where it locked').toBe(true);
    expect(r.lockedLate).toBe(true);
    expect(r.shot, 'and he fires on the last frame').not.toBe(null);
    expect(Math.atan2(r.shot.vy, r.shot.vx), 'along the sight').toBeCloseTo(Math.atan2(r.ly - r.shot.y, r.lx - r.shot.x), 6);
  });

  it('a round hits whoever stands on the line and misses whoever stepped off it', () => {
    const r = W.eval(`(function(){ var out = {};
      [['stays', 0], ['steps', 260]].forEach(function(c){ ${STAGE(300, 1, true)}
        b._moveN = 0; b._atkTimer = 1; step();
        for (var w=0; w<80 && b._tel>0; w++){ f.x = 300; f.vx = 0; f.invuln = 9999; step(); if (b._tel === 5) f.x = 300; }
        f.x = 300 + c[1]; f.vx = 0; f.y = groundY()-24; f.invuln = 0; f.pct = 0;
        for (var k=0;k<60;k++){ f.x = 300 + c[1]; f.vx = 0; f.y = groundY()-24; f.invuln = 0; f.hitstun = 0; step(); }
        out[c[0]] = f.pct; summons = []; projectiles = []; });
      out.full = bossDmg(); return out; })()`);
    expect(r.stays, 'standing where he aimed: one whole boss hit').toBeCloseTo(r.full, 5);
    expect(r.steps, '260 pixels off it: nothing').toBe(0);
  });

  it('from phase 2 the volley FREEZES mid-air and every round starts again together; phase 1 never freezes; a frozen round hurts nobody, and the same round hurts once it moves', () => {
    const r = W.eval(`(function(){ var out = {};
      ${[1, 2, 3].map((ph) => `{ ${STAGE(300, ph, true)}
        ${FIRE('gun')}
        var n = projectiles.filter(function(p){ return p.s4 === 1; }).length, held = [], resume = [], seenFz = false, allAt = -1, pts = null;
        for (var i=0;i<n;i++){ held.push(0); resume.push(-1); }
        for (var k=0;k<80;k++){
          f.x = 300; f.vx = 0; f.invuln = 9999; step();
          var rs = projectiles.filter(function(p){ return p.s4 === 1; });
          if (rs.length < n) break;
          rs.forEach(function(p, i){
            if (p.s4fz && p.delay > 0){ held[i]++; seenFz = true; }
            else if (held[i] > 0 && resume[i] < 0) resume[i] = k;
          });
          if (allAt < 0 && rs.every(function(p){ return p.s4fz && p.delay > 0; })){ allAt = k; pts = rs.map(function(p){ return [Math.round(p.x), Math.round(p.y)]; }); }
        }
        out.p${ph} = { n: n, seenFz: seenFz, held: held, resume: resume, allAt: allAt, pts: pts };
        summons = []; projectiles = []; }`).join('\n')}
      // a frozen round is inert: a fighter standing in the stopped volley takes nothing; the first frames after it moves on, the same fighter takes the hit
      ${STAGE(300, 2, true)}
      ${FIRE('gun')}
      var stage = 0, dmgWhile = 0, dmgAfter = 0, framesWhile = 0, framesAfter = 0, at = null;
      for (var q=0;q<90 && stage < 2;q++){
        var rs2 = projectiles.filter(function(p){ return p.s4 === 1; });
        var all = rs2.length > 0 && rs2.every(function(p){ return p.s4fz && p.delay > 0; });
        f.vx = 0; f.vy = 0; f.hitstun = 0; f.invuln = 0;
        if (all){ if (!at) at = [rs2[0].x, rs2[0].y]; f.x = at[0]; f.y = at[1]; var p0 = f.pct; step(); dmgWhile += f.pct - p0; framesWhile++; stage = 1; }
        else if (stage === 1){ f.x = at[0]; f.y = at[1]; var p1 = f.pct; step(); dmgAfter += f.pct - p1; framesAfter++; if (framesAfter >= 4) stage = 2; }
        else { f.x = 300; f.y = groundY()-24; step(); }
      }
      out.dmgWhile = dmgWhile; out.dmgAfter = dmgAfter; out.framesWhile = framesWhile; out.full = bossDmg(); out.fzFor = S4.fzFor;
      summons = []; projectiles = []; return out; })()`);
    expect(r.p1.n).toBe(1);
    expect(r.p1.seenFz, 'phase 1: the round flies straight through').toBe(false);
    for (const [ph, n] of [[2, 2], [3, 3]]) {
      const o = r['p' + ph];
      expect(o.n).toBe(n);
      expect(o.seenFz, 'phase ' + ph + ': it stops in mid-air').toBe(true);
      for (const h of o.held) expect(h, 'every round is stopped for S4.fzFor = 14 frames (the first is spent setting the hold)').toBeGreaterThanOrEqual(r.fzFor - 1);
      expect(o.allAt, 'there is a moment when the whole volley hangs there').toBeGreaterThan(0);
      for (const p of o.pts) expect(Math.hypot(p[0] - o.pts[0][0], p[1] - o.pts[0][1]), 'a tight group on one line, not scattered').toBeLessThan(30);
      expect(new Set(o.resume).size, 'and they all start again on the same frame').toBe(1);
      expect(o.resume[0]).toBeGreaterThan(o.allAt);
    }
    expect(r.framesWhile, 'there was a frozen volley to stand in').toBeGreaterThan(5);
    expect(r.dmgWhile, 'a frozen round is inert').toBe(0);
    expect(r.dmgAfter, 'and when it moves on, it is a whole boss hit').toBeCloseTo(r.full, 5);
  });

  it('a round stops about a third of the way to its mark (and at least 70 px out) before it freezes', () => {
    const r = W.eval(`(function(){ ${STAGE(200, 2, true)}
      ${FIRE('gun')}
      var rs = projectiles.filter(function(p){ return p.s4 === 1; }), z = rs[0]._s4fz, d = z.d, x0 = z.x0, y0 = z.y0, at = null;
      for (var k=0;k<60 && !at;k++){ f.x = 200; f.invuln = 9999; step(); var fz = projectiles.filter(function(p){ return p.s4fz && p.delay > 0; }); if (fz.length) at = [fz[0].x, fz[0].y]; }
      var ax = b._aimX, ay = b._aimY, far = Math.hypot(ax - x0, ay - y0);
      summons = []; projectiles = []; return { d: d, at: at, x0: x0, y0: y0, far: far, fzAt: S4.fzAt, fzMin: S4.fzMin }; })()`);
    expect(r.d, 'a third of the way to the mark, or 70 px, whichever is more').toBeCloseTo(Math.max(r.fzMin, r.far * r.fzAt), 3);
    expect(Math.hypot(r.at[0] - r.x0, r.at[1] - r.y0), 'it stops where it was meant to, give or take its last step').toBeGreaterThanOrEqual(r.d - 1);
    expect(Math.hypot(r.at[0] - r.x0, r.at[1] - r.y0)).toBeLessThan(r.d + 19);
    const close = W.eval(`(function(){ ${STAGE(560, 2, true)}
      ${FIRE('gun')}
      var z = projectiles.filter(function(p){ return p.s4 === 1; })[0]._s4fz; summons = []; projectiles = []; return z.d; })()`);
    expect(close, 'a mark right in front of him: the round still freezes 70 px out').toBe(70);
  });

  it('from phase 2 he draws on whoever is carrying the most damage ("who cares?! I\'m the host now!"); in phase 1 on whoever is nearest', () => {
    const r = W.eval(`(function(){
      var near = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 700, groundY()-24, 0);
      var far = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 1000, groundY()-24, 1);
      near.team = far.team = 0; fighters = [near, far]; near.pct = 10; far.pct = 80;
      var out = {};
      [1, 2, 3].forEach(function(ph){ var s = ${S('_phase:ph, _moveN:1, _telKind:"mephone4s"')}; s4BeginTelegraph(s, near); out['p'+ph] = s._aimIdx; });
      near.pct = 90; var s2 = ${S('_phase:2, _moveN:1, _telKind:"mephone4s"')}; s4BeginTelegraph(s2, near); out.flip = s2._aimIdx;
      return { out: out, near: near.idx, far: far.idx };
    })()`);
    expect(r.out.p1).toBe(r.near);
    expect(r.out.p2, 'the weakest link').toBe(r.far);
    expect(r.out.p3).toBe(r.far);
    expect(r.out.flip, 'it follows the damage, not the distance').toBe(r.near);
  });

  it('he stops walking to aim, keeps his distance otherwise, and backs off from anyone who walks up to him', () => {
    const r = W.eval(`(function(){
      var tgt = { x:0, y:groundY()-24, dead:false, idx:0 };
      var mk = function(dx){ var s = ${S('_atkTimer:1e9')}; tgt.x = s.x + dx; updateBossAttack(s, tgt); return s.vx; };
      var aim = ${S('_atkTimer:1e9, _tel:20, vx:4')};
      tgt.x = aim.x + 400; updateBossAttack(aim, tgt);
      var walk = ${S('_atkTimer:1e9')}, x0 = walk.x;
      for (var i=0;i<60;i++){ tgt.x = x0 + 60; updateBossAttack(walk, tgt); walk.x += walk.vx; walk.vx *= 0.9; }   // his body's own step (updateSummons)
      return { near: mk(150), far: mk(300), close: mk(80), closeLeft: mk(-80), aiming: aim.vx, backoff: S4.backoff, standoff: S4.standoff, gap: Math.abs(walk.x - (x0 + 60)) };
    })()`);
    expect(r.near, 'between 100 and 180 px he holds').toBe(0);
    expect(r.far, 'farther than that he walks you down').toBeGreaterThan(0);
    expect(r.aiming, 'halved every frame of the wind-up, never pushed').toBe(2);
    expect(r.close, 'someone 80 px to his right: he steps left').toBeLessThan(0);
    expect(r.closeLeft, 'and the other way round').toBeGreaterThan(0);
    expect(r.backoff).toBeLessThan(r.standoff);
    expect(r.gap, 'walked up to, he ends up out at his backoff distance').toBeGreaterThanOrEqual(r.backoff - 10);
  });

  // The review: he read the phase when the attack fired, not when its wind-up started, so a move drawn in one phase could fire as the next phase's if a hit
  // crossed the threshold mid wind-up.
  it('a gun drawn in phase 1 is one round, and a car drawn in phase 2 is the car and its return and no spikes, even if phase 3 starts during the wind-up', () => {
    const r = W.eval(`(function(){ var out = {};
      ${['car', 'gun'].map((which) => `{ ${STAGE(800, which === 'car' ? 2 : 1, false, true)}
        b._atkTimer = 1; b._moveN = ${which === 'car' ? 2 * EX.indexOf('s4car') + 1 : 0}; step();
        var drawn = { phase: b._telPh, name: document.getElementById('banner').textContent };
        var seen = { car:0, spike:0, round:0 }, AP = addProj;
        addProj = function(p){ if (p && p.shape==='redcar') seen.car++; if (p && p.shape==='spike') seen.spike++; if (p && p.s4 === 1) seen.round++; return AP(p); };
        try {
          b.hp = b.maxHp*0.2;
          for (var i=0;i<50;i++){ step(); f.x = 800; f.vx = 0; f.invuln = 9999; }
          out.${which} = { drawn: drawn, phase: b._phase, seen: seen };
        } finally { addProj = AP; summons = []; projectiles = []; worldPlats = []; } }`).join('\n')}
      return out;
    })()`);
    expect(r.car.drawn).toEqual({ phase: 2, name: "I'LL BE BACK!" });
    expect(r.car.phase).toBe(3);
    expect(r.car.seen, 'the car and the car coming back, as drawn: no spikes nobody was warned of').toEqual({ car: 2, spike: 0, round: 0 });
    expect(r.gun.drawn).toMatchObject({ phase: 1, name: 'PUT THAT COOKIE DOWN!' });
    expect(r.gun.phase).toBe(3);
    expect(r.gun.seen.round, "phase 1's one round").toBe(1);
  });
});
