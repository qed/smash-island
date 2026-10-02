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
const FIRE = (kind) => `b._pickForce = '${kind === 'gun' ? 'mephone4s' : kind}'; b._atkLive = null; b._atkTimer = 1; step(); var telKind = b._telKind, telName = document.getElementById('banner').textContent, tel0 = b._tel;
  for (var w=0; w<80 && b._tel>0; w++){ step(); }`;

describe('MePhone4S takes his Super Death Trap', () => {
  // The owner, 2026-10-01 (Round 17): "make the attacks based on fighter position. if there is an attack that punishes being close, then they should use it more when ppl are close." -- "Position picks
  // all (Recommended)": the gun no longer comes on every odd turn (the gun, the prizes, the gun, the lemons, ...). He draws his six by where the fighters stand: none twice in a row, every one in eighteen turns.
  it('is Boss 8 (before the Dragon), his own arena, and his six attacks, drawn by position: the gun and the five others, each named, each with its own wind-up', () => {
    const r = W.eval(`(function(){
      var i = BOSS_ROSTER.findIndex(function(b){ return b.name==='MePhone4S'; });
      var idx = function(n){ return BOSS_ROSTER.findIndex(function(b){ return b.name===n; }); };
      var kinds = [], names = [], tels = [], s = ${S('_phase:2, hp:50')};
      for (var k=0;k<18;k++){ s._atkTimer = 1; s._tel = 0; s._s4 = null; s._atkLive = null; updateBossAttack(s, null); kinds.push(s._telKind); names.push(bossTelName(s)); tels.push(s._tel); }
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
    // the names are the show's words: "Put that cookie down! ... Now!", "I'll be back", "We'll give them one of each!", "Hasta la vista, Blu-Ray...", "pops up from under"
    const NAME = { mephone4s: 'PUT THAT COOKIE DOWN!', s4prizes: 'ONE OF EACH!', s4vista: 'HASTA LA VISTA!', s4popup: 'POP UP!', s4car: "I'LL BE BACK!", s4shove: 'QUICKSAND SHOVE!' };
    const TEL = { mephone4s: 42, s4prizes: 36, s4vista: 46, s4popup: 46, s4car: 46, s4shove: 46 };
    expect(r.kinds.every((k) => NAME[k]), `only his six: ${r.kinds}`).toBe(true);
    expect(new Set(r.kinds).size, `all six come up in eighteen turns: ${r.kinds}`).toBe(6);
    expect(r.kinds.some((k, i) => i > 0 && k === r.kinds[i - 1]), `never the same move twice in a row: ${r.kinds}`).toBe(false);
    expect(r.names).toEqual(r.kinds.map((k) => NAME[k]));
    expect(r.moves).toEqual(['function/ONE OF EACH!', 'function/HASTA LA VISTA!', 'function/POP UP!', "function/I'LL BE BACK!", 'function/QUICKSAND SHOVE!']);
    expect(r.tels, 'each move reads out its own wind-up').toEqual(r.kinds.map((k) => TEL[k]));
    expect(r.telLens, 'the gun 42, the props 36, the rest 46').toEqual([42, 36, 46, 46, 46, 46]);
    expect(r.telBare, 'a bare boss with no move yet is the gun\'s').toBe(42);
    expect([r.p2, r.p3]).toEqual(["I'll Be Back", 'Super Death Trap']);
    // "bosses should attack a bit slower" (the owner, 2026-09-30): the usual 100 / 72 / 52 times BOSS_PACE (1.2). His builder gave him 108 / 78 / 56 for his
    // sawblades and quicksand; he then measured easier than MePhone4 before him, and asked, the owner chose "Make MePhone4S harder" (2026-10-01): the usual gaps
    expect(r.gaps, 'his pacing, paced, quicker each phase').toEqual([120, 86, 62]);
    expect(r.held, 'held while a move runs').toBe(1e6);
    expect(r.rushOnly, 'an item boss never throws them: they need his floor and his arena').toEqual([true, true, true, true, true]);
  });

  // Round 17 (the owner: "make the attacks based on fighter position."): the car was a move of phase 2 -- not among the moves he drew from in phase 1 -- and the first move once phase 2 starts (the picker's
  // `first`, while the phase beat's s._carDue stands). Then the difficulty picks (the question boxes, Round 17): "MePhone4S: ... I'LL BE BACK! from phase 1" -- the car is among the six from phase 1 now.
  // It is still the first move when phase 2 starts (the Super Death Trap goes live with that car), unless it is the move he has just played: never the same move twice in a row.
  it('the car is among his moves from phase 1; entering phase 2 makes the car his very next move (never twice in a row), and then it competes like the rest', () => {
    const r = W.eval(`(function(){
      var run = function(hp, ph, n){ var s = ${S('_phase:ph, hp:hp')}, out = [];
        for (var k=0;k<n;k++){ s._atkTimer = 1; s._tel = 0; s._s4 = null; s._beatQ = 0; s._atkLive = null; updateBossAttack(s, null); out.push(s._telKind); } return out; };
      return { p1: run(100, 1, 24), p2: run(50, 2, 24), p3: run(20, 3, 24), enter: run(50, 1, 12), moves: [1, 2, 3].map(function(ph){ var s = ${S('_phase:ph')}; return bossPickMoves(s, ph); }) };
    })()`);
    const SIX = ['mephone4s', 's4prizes', 's4vista', 's4popup', 's4car', 's4shove'];
    expect(r.moves[0], 'phase 1: the car is among them ("I\'LL BE BACK! from phase 1 too", the owner, Round 17)').toContain('s4car');
    expect(new Set(r.p1), 'phase 1: all six come up, the car too').toEqual(new Set(SIX));
    for (const m of r.moves) expect(m, 'the same six in every phase').toEqual(SIX);
    expect(new Set(r.p2), 'phase 2: all six come up').toEqual(new Set(SIX));
    expect(new Set(r.p3)).toEqual(new Set(r.p2));
    expect(r.enter[0], 'a boss that has just entered phase 2 plays the car first ("I will be back": the trap goes live with it)').toBe('s4car');
    expect(r.enter[1], 'and the turn after it is not the car again').not.toBe('s4car');
    expect(r.enter.some((k, i) => i > 0 && k === r.enter[i - 1]), `no move twice in a row: ${r.enter}`).toBe(false);
  });

  it('if the car is the move he has just played when phase 2 begins, it is not played twice in a row: another move first, and then the car that brings the trap in', () => {
    const r = W.eval(`(function(){
      var s = ${S('_phase:1, hp:100')}, out = [];
      var turn = function(force){ s._atkTimer = 1; s._tel = 0; s._s4 = null; s._beatQ = 0; s._atkLive = null; if (force) s._pickForce = force; updateBossAttack(s, null); out.push(s._telKind); };
      turn('s4car');                                  // the car, in phase 1
      s.hp = 50; turn(); turn(); turn();             // and phase 2 begins
      return out; })()`);
    expect(r[0]).toBe('s4car');
    expect(r[1], 'phase 2 begins right after a car: not the car again').not.toBe('s4car');
    expect(r[2], 'the next turn is the car (the phase beat\'s flag stands until a car turn starts)').toBe('s4car');
    expect(r[3]).not.toBe('s4car');
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
    expect(r.hp, 'his row is 260; the owner, 2026-10-01 (Round 17): "+50% (Recommended)" -- every Boss Rush boss spawns with half again the HP of its row (BOSS_HP_MULT)').toBe(Math.round(260*1.5));
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
  // The owner, 2026-10-01 (Round 17, the difficulty picks): "MePhone4S: PUT THAT COOKIE DOWN! 2/3/4 rounds" -- the volley was one round, then a fan of two, then three; it is two, three and four now: more to
  // step off the line of, the same damage (every round of a volley shares its one attack id: one boss hit however many land).
  it('fires a fan of two, then three, then four rounds -- 18 px a frame, a whole boss hit, kb 12, one attack id -- each from his pistol\'s muzzle along the line it was aimed on', () => {
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
    expect(r.map((o) => o.n), 'two, three, four rounds ("PUT THAT COOKIE DOWN! 2/3/4 rounds", the owner: it was one, two, three)').toEqual([2, 3, 4]);
    expect(W.eval('S4.rounds'), 'the table the tuning and the harness read').toEqual([0, 2, 3, 4]);
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
    // (read the frame after the shot: a waiting round's delay has ticked once, so the five-frame step between rounds, S4.fzStep, reads 0, 4, 9, 14)
    expect(r.map((o) => o.delays), 'each round a few frames behind the last (they all start from the muzzle)').toEqual([[0, 4], [0, 4, 9], [0, 4, 9, 14]]);
    expect(r[0].thunder, 'phase 1 keeps the sky quiet').toBe(false);
    expect(r[1].thunder, '"lightning strikes in the background": from phase 2 each shot').toBe(true);
    // the fan: neighbours a spread (0.07 rad) apart, centred on the line from the muzzle to the mark
    const sp = r[2].ang, s3 = r[1].ang, s2 = r[0].ang;
    for (let i = 1; i < sp.length; i++) expect(sp[i] - sp[i - 1], `four: neighbours ${i - 1} and ${i}`).toBeCloseTo(0.07, 3);
    expect(sp.reduce((a, v) => a + v, 0) / sp.length, 'four: the fan is centred on the line').toBeCloseTo(r[2].mid, 2);
    for (let i = 1; i < s3.length; i++) expect(s3[i] - s3[i - 1], `three: neighbours ${i - 1} and ${i}`).toBeCloseTo(0.07, 3);
    expect(s3[1], 'three: the middle round is on the line').toBeCloseTo(r[1].mid, 2);
    expect(s2[1] - s2[0], 'two: a spread apart').toBeCloseTo(0.07, 3);
    expect((s2[0] + s2[1]) / 2, 'two: centred on the line').toBeCloseTo(r[0].mid, 2);
    expect(Math.hypot(r[2].muzzle[0] - r[2].mz[0], r[2].muzzle[1] - r[2].mz[1]), 'the rounds leave from the pistol\'s muzzle, not from his middle').toBeLessThan(24);
  });

  it('the sight follows its mark for the first 24 frames and locks for the last 18; the round goes where it locked, so stepping off the line is the dodge', () => {
    expect(W.eval('S4.lock')).toBe(18);
    const r = W.eval(`(function(){ ${STAGE(820, 1, true)}
      b._pickForce = 'mephone4s'; b._atkLive = null; b._atkTimer = 1; step();
      var out = { kind: b._telKind, tel: b._tel, follow: true, held: true, lockedLate: true, lockedEarly: false, shot: null, face: true };
      out.shots = [];
      var AP = addProj; addProj = function(p){ if (p && p.owner===-2 && p.s4 === 1){ var o = { x:p.x, y:p.y, vx:p.vx, vy:p.vy }; out.shots.push(o); if (!out.shot) out.shot = o; } return AP(p); };
      try {
        for (var i=0;i<24;i++){ f.x = 820 + (i+1)*4; f.vx = 0; f.invuln = 9999; step();
          if (b._aimX !== f.x) out.follow = false; if (b._aimLock) out.lockedEarly = true; if (b.face !== Math.sign(f.x - b.x)) out.face = false; }
        var lx = b._aimX, ly = b._aimY;
        for (var j=0;j<18;j++){ f.x = 700 - j*6; f.vx = 0; f.invuln = 9999; step();
          if (b._aimX !== lx || b._aimY !== ly) out.held = false; if (!b._aimLock) out.lockedLate = false; }
        out.lx = lx; out.ly = ly; out.fxAfter = f.x;
      } finally { addProj = AP; }
      summons = []; projectiles = []; return out;
    })()`);
    expect(r.kind).toBe('mephone4s');
    expect(r.tel).toBe(42);
    expect(r.follow, 'it follows you while it is red').toBe(true);
    expect(r.face, 'he faces his mark: the pistol hand is on that side').toBe(true);
    expect(r.lockedEarly).toBe(false);
    expect(r.held, 'then it stays where it locked').toBe(true);
    expect(r.lockedLate).toBe(true);
    expect(r.shot, 'and he fires on the last frame').not.toBe(null);
    // (a volley of two in phase 1 since Round 17: a fan a spread apart, centred on the sight)
    expect(r.shots, 'two rounds in phase 1').toHaveLength(2);
    const ang = r.shots.map((p) => Math.atan2(p.vy, p.vx));
    expect((ang[0] + ang[1]) / 2, 'along the sight').toBeCloseTo(Math.atan2(r.ly - r.shot.y, r.lx - r.shot.x), 6);
  });

  it('a round hits whoever stands on the line and misses whoever stepped off it', () => {
    const r = W.eval(`(function(){ var out = {};
      [['stays', 0], ['steps', 260]].forEach(function(c){ ${STAGE(300, 1, true)}
        b._pickForce = 'mephone4s'; b._atkLive = null; b._atkTimer = 1; step();
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
    expect(r.p1.n, 'two rounds in phase 1 (2/3/4: the owner, Round 17)').toBe(2);
    expect(r.p1.seenFz, 'phase 1: the rounds fly straight through').toBe(false);
    for (const [ph, n] of [[2, 3], [3, 4]]) {
      const o = r['p' + ph];
      expect(o.n).toBe(n);
      expect(o.seenFz, 'phase ' + ph + ': it stops in mid-air').toBe(true);
      for (const h of o.held) expect(h, 'every round is stopped for S4.fzFor = 14 frames (the first is spent setting the hold)').toBeGreaterThanOrEqual(r.fzFor - 1);
      expect(o.allAt, 'there is a moment when the whole volley hangs there').toBeGreaterThan(0);
      // (a fan of n rounds is (n - 1) spreads wide -- 0.07 rad each, about 10 px at the freeze -- so the test looks at neighbours: each a few pixels from the next, a tight group and not a scatter)
      for (let i = 1; i < o.pts.length; i++) expect(Math.hypot(o.pts[i][0] - o.pts[i - 1][0], o.pts[i][1] - o.pts[i - 1][1]), 'a tight group on one line, not scattered').toBeLessThan(15);
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
  // (Since Round 17, the owner's picks: the gun is two rounds in phase 1; the car is his from phase 1 -- the one car, with no trap -- and the car of phase 2 is the car and its return WITH the trap.)
  it('a gun drawn in phase 1 is two rounds, a car drawn in phase 1 is the one car and no trap, and a car drawn in phase 2 is the car, its return and the trap -- even if phase 3 starts during the wind-up', () => {
    const r = W.eval(`(function(){ var out = {};
      ${[['car1', 1, 's4car'], ['car2', 2, 's4car'], ['gun', 1, 'mephone4s']].map(([which, ph, kind]) => `{ ${STAGE(800, ph, false, true)}
        b._atkTimer = 1; b._pickForce = '${kind}'; b._atkLive = null; step();
        var drawn = { phase: b._telPh, name: document.getElementById('banner').textContent };
        var seen = { cars:[], spike:0, round:0 }, AP = addProj;
        addProj = function(p){ if (p && p.shape==='redcar') seen.cars.push(p.delay); if (p && p.shape==='spike') seen.spike++; if (p && p.s4 === 1) seen.round++; return AP(p); };
        try {
          b.hp = b.maxHp*0.2;
          for (var i=0;i<50;i++){ step(); f.x = 800; f.vx = 0; f.invuln = 9999; }
          out.${which} = { drawn: drawn, phase: b._phase, seen: seen, q: (b._s4q || []).map(function(e){ return e.f + '@' + e.t; }) };
        } finally { addProj = AP; summons = []; projectiles = []; worldPlats = []; } }`).join('\n')}
      return out;
    })()`);
    expect(r.car1.drawn).toEqual({ phase: 1, name: "I'LL BE BACK!" });
    expect(r.car1.phase).toBe(3);
    expect(r.car1.seen, 'a car drawn in phase 1: the one car (it revs 30 frames), no spikes nobody was warned of').toEqual({ cars: [30], spike: 0, round: 0 });
    expect(r.car1.q, 'and no crusher or flip behind it').toEqual([]);
    expect(r.car2.drawn).toEqual({ phase: 2, name: "I'LL BE BACK!" });
    expect(r.car2.phase).toBe(3);
    const T = Math.ceil((W.eval('WW') - 80) / 14) + 2;   // frames a car takes to cross the floor
    expect(r.car2.seen.cars, 'phase 2: the car and the car coming back 40 frames after the first has cleared the far edge -- not phase 3\'s second car at 80').toEqual([30, 30 + T + 40]);
    expect(r.car2.seen.spike, 'with the Super Death Trap live from phase 2 (the owner, Round 17)').toBeGreaterThan(0);
    expect(r.car2.seen.round).toBe(0);
    expect(r.car2.q, 'its crusher and flip wait for the return car to clear (phase 3\'s are at 150 and 186)').toEqual([`crush@${30 + T + 40 + T}`, `flip@${30 + T + 40 + T + 36}`]);
    expect(r.gun.drawn).toMatchObject({ phase: 1, name: 'PUT THAT COOKIE DOWN!' });
    expect(r.gun.phase).toBe(3);
    expect(r.gun.seen.round, "phase 1's two rounds").toBe(2);
  });
});


describe("I'LL BE BACK! (the car)", () => {
  // Sugar Rush: "MePhone4S: I'll be back. (MePhone4S walks towards a nearby car, which he then proceeds to hit Cheesy with.)" -- phase 2, "I'll Be Back".
  it('he runs for the edge farther from you and is off the screen when the wind-up ends; the cars wait there, headlights on, for the rev', () => {
    const r = W.eval(`(function(){ var out = {};
      ${[300, 800].map((fx) => `{ ${STAGE(fx, 2, true)}
        b._pickForce = 's4car'; b._atkLive = null; b._atkTimer = 1; step();
        var o = { kind: b._telKind, name: document.getElementById('banner').textContent, tel0: b._tel, from: b._s4.from };
        for (var w=0; w<80 && b._tel>0; w++){ f.x = ${fx}; f.vx = 0; step(); }
        o.x = Math.round(b.x); o.y = Math.round(b.y); o.hover = b.hover; o.go = b._s4.go; o.st = b._s4.st; o.R = b.r; o.WW = WW; o.gy = groundY();
        o.cars = projectiles.filter(function(p){ return p.s4 === 2; }).map(function(p){ return [Math.round(p.x), Math.sign(p.vx), p.delay > 0]; });
        out.f${fx} = o; summons = []; projectiles = []; }`).join('\n')}
      return out; })()`);
    const a = r.f300, c = r.f800;
    for (const o of [a, c]) {
      expect(o.kind).toBe('s4car');
      expect(o.name).toBe("I'LL BE BACK!");
      expect(o.tel0).toBe(46);
      expect(o.go, 'his own motion has taken over from the engine\'s wind-up').toBe(true);
      expect(o.st).toBe('away');
      expect(o.hover).toBe(true);
      expect(o.y, 'on the floor line').toBeCloseTo(o.gy - o.R, 0);
    }
    expect(a.from, 'you are on the left: the edge farther from you is the right').toBe(1);
    expect(a.x, 'and by the end of the wind-up he is off that edge').toBeGreaterThan(a.WW + a.R * 0.6);
    expect(c.from, 'you are on the right: he leaves by the left').toBe(-1);
    expect(c.x).toBeLessThan(-c.R * 0.6);
    expect(a.cars, 'two cars waiting (the car and its return), the first at his edge, both still revving').toEqual([[1060, -1, true], [40, 1, true]]);
    expect(c.cars).toEqual([[40, 1, true], [1060, -1, true]]);
  });

  it('the first car revs 30 frames then drives the whole floor at 14 px a frame -- a whole boss hit, kb 11, through anyone -- and "I\'ll be back" is literal: a second car comes back the other way, one attack id', () => {
    const r = W.eval(`(function(){ var WW0 = WW, out = {};
      try {
        [1100, 1920].forEach(function(w){ WW = w; out[w] = {};
          [1, 2, 3].forEach(function(ph){ projectiles = []; worldPlats = [];
            var s = ${S('_phase:2, _telPh:2')}; s._phase = ph; s._telPh = ph; s.x = WW*0.5;
            BOSS_MOVES.s4car(s, { x: WW*0.8, y: groundY()-24, dead:false, idx:0 });
            var c = projectiles.filter(function(p){ return p.s4 === 2; });
            out[w]['p'+ph] = { cars: c.map(function(p){ return { x:p.x, vx:p.vx, r:p.r, dmg:p.dmg, kb:p.kb, pierce:!!p.pierce, delay:p.delay, shape:p.shape, span: p.vx*p.life, ground: p.y }; }),
              ids: projectiles.map(function(p){ return p.bossAtk; }).filter(function(v, i, a){ return a.indexOf(v) === i; }).length, q: JSON.stringify(s._s4q), end: s._s4.end, gy: groundY() };
          });
        });
        projectiles = [];
        var s2 = ${S('_phase:2, _telPh:2')}; WW = 1100; s2.x = 550; BOSS_MOVES.s4car(s2, { x: 200, y: groundY()-24, dead:false, idx:0 });
        out.left = projectiles.filter(function(p){ return p.s4 === 2; }).map(function(p){ return { x:p.x, vx:p.vx }; });
      } finally { WW = WW0; projectiles = []; }
      return { out: out, full: bossDmg() }; })()`);
    const T = Math.ceil((1100 - 80) / 14) + 2;   // frames to cross the floor
    const p1 = r.out[1100].p1, p2 = r.out[1100].p2, p3 = r.out[1100].p3;
    // phase 1 ("I'LL BE BACK! from phase 1 too", the owner, Round 17): the one car, no return, no trap
    expect(p1.cars, 'phase 1: the one car').toHaveLength(1);
    expect(p1.cars[0]).toMatchObject({ x: 40, vx: 14, r: 26, dmg: r.full, kb: 11, pierce: true, delay: 30, shape: 'redcar' });
    expect(p1.ids, 'one attack id').toBe(1);
    expect(p1.q, 'and no layer on top of it').toBe('[]');
    expect(p2.cars).toHaveLength(2);
    // you are on the right (0.8 of the width): the edge farther from you is the left, and the first car starts there and drives at you
    expect(p2.cars[0]).toMatchObject({ x: 40, vx: 14, r: 26, dmg: r.full, kb: 11, pierce: true, delay: 30, shape: 'redcar' });
    expect(p2.cars[1], 'the car back: from the other edge, once the first has cleared the far one and 40 frames more').toMatchObject({ x: 1100 - 40, vx: -14, r: 26, dmg: r.full, kb: 11, pierce: true, delay: 30 + T + 40, shape: 'redcar' });
    expect(p2.ids, 'one attack id for the whole turn').toBe(1);
    // the Super Death Trap is live from phase 2 (the owner, Round 17: it was phase 3): its crusher's shadow goes down as the car that came back has cleared (30 + T + 40 + T), the flip 36 frames after
    expect(JSON.parse(p2.q).map((e) => [e.t, e.f]), 'phase 2: the crusher as the return car clears, the platform\'s flip 36 frames after it').toEqual([[30 + T + 40 + T, 'crush'], [30 + T + 40 + T + 36, 'flip']]);
    // phase 3: the second car does not wait ("the whole course goes live")
    expect(p3.cars[1]).toMatchObject({ x: 1100 - 40, vx: -14, delay: 30 + 50 });
    expect(JSON.parse(p3.q).map((e) => [e.t, e.f]), 'the crusher at 150 frames, the platform\'s flip at 186').toEqual([[150, 'crush'], [186, 'flip']]);
    for (const c of [...p2.cars, ...p3.cars]) expect(c.ground, 'the car is on the floor: a shot riding 24 px over it').toBeCloseTo(p2.gy - 24, 3);
    for (const w of [1100, 1920]) for (const ph of ['p2', 'p3']) for (const c of r.out[w][ph].cars) expect(Math.abs(c.span), 'it lives long enough to drive the whole floor, even on a ' + w + ' px screen').toBeGreaterThanOrEqual(w - 80);
    expect(r.out.left.map((c) => [c.x, c.vx]), 'you on the left: it comes from the right, and back from the left').toEqual([[1100 - 40, -14], [40, 14]]);
  });

  it('a car turn through the engine: both cars cross, he walks back in from the edge he left by 22 frames after the last has cleared, and the turn ends', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 2, true, true)}
      b._pickForce = 's4car'; b._atkLive = null; b._atkTimer = 1; step();
      for (var w=0; w<80 && b._tel>0; w++){ f.x = 300; f.vx = 0; step(); }
      var ev = [], last = '', backAt = -1, carsAtBack = -1, doneAt = -1, maxCars = 0, gone = -1;
      for (var k=0;k<400;k++){
        f.x = 300; f.y = groundY() - 400; f.vy = -1; f.vx = 0; f.invuln = 9999; step();
        var A = b._s4, cars = projectiles.filter(function(p){ return p.s4 === 2; }).length;
        maxCars = Math.max(maxCars, cars);
        if (cars === 0 && maxCars > 0 && gone < 0) gone = k;
        if (A && A.st === 'back' && backAt < 0){ backAt = k; carsAtBack = cars; }
        if (!A && doneAt < 0){ doneAt = k; break; }
      }
      var out = { backAt: backAt, carsAtBack: carsAtBack, doneAt: doneAt, gone: gone, x: b.x, y: b.y, hover: b.hover, timer: b._atkTimer, maxCars: maxCars, gap: bossAtkGap(b), gy: groundY(), R: b.r, WW: WW, from: null };
      summons = []; projectiles = []; return out; })()`);
    expect(r.maxCars, 'the car and the car back: two on the road').toBeGreaterThanOrEqual(1);
    expect(r.backAt, 'he waits out of sight until the last car is gone').toBeGreaterThanOrEqual(r.gone);
    expect(r.carsAtBack).toBe(0);
    expect(r.doneAt - r.backAt, 'the walk back takes S4.carIn = 22 frames').toBeGreaterThanOrEqual(21);
    expect(r.doneAt - r.backAt).toBeLessThanOrEqual(24);
    expect(r.x, 'he comes back in from the right edge (you were on the left) to his place there').toBeGreaterThan(r.WW * 0.5);
    expect(r.x).toBeLessThan(r.WW * 0.9);
    expect(r.y, 'on his feet').toBeCloseTo(r.gy - r.R, 0);
    expect(r.hover).toBe(false);
    expect(r.timer, 'and his next turn waits the usual gap').toBeGreaterThan(r.gap - 5);
  });

  // (The air case looks at the CARS: the crusher of the trap, live from phase 2, comes down where you stand -- in the air too -- and is tested with the trap, below.)
  it('both cars together are one boss hit: whoever stands on the floor is run over once, and whoever is in the air is not touched', () => {
    const r = W.eval(`(function(){ var out = {};
      [['floor', 24], ['air', 200]].forEach(function(c){ ${STAGE(600, 2, true, false)}
        b._pickForce = 's4car'; b._atkLive = null; b._atkTimer = 1; step();
        var hits = 0, last = 0, gy = groundY(), n = 0;
        for (var k=0;k<400;k++){
          f.x = 600; f.y = gy - c[1]; f.vx = 0; f.vy = 0; f.invuln = 0; f.hitstun = 0; if (c[0] === 'air') projectiles = projectiles.filter(function(p){ return p.s4 !== 3; });   // the cars only: the trap's crusher is not one of them
          step(); n++;
          if (f.pct > last + 0.5){ hits++; last = f.pct; }
          if (!b._s4 && k > 20) break;
        }
        out[c[0]] = { hits: hits, dmg: f.pct, n: n };
        summons = []; projectiles = []; });
      out.full = bossDmg(); return out; })()`);
    expect(r.floor.hits, 'both passes, one hit').toBe(1);
    expect(r.floor.dmg, 'a whole boss hit, no more').toBeCloseTo(r.full, 5);
    expect(r.floor.n, 'both cars did cross (the turn ran its length)').toBeGreaterThan(200);
    expect(r.air.dmg, 'jumping the cars is the whole fight against them').toBe(0);
  });

  // The Super Death Trap -- spikes, crusher, flip -- is on the car's turn in phase 3, and in phase 2 too since Round 17 ("MePhone4S: ... the Super Death Trap (spikes, crusher, flip) live from phase 2",
  // the owner's difficulty pick; it was phase 3). Phase 3's timing is as it was: the crusher's shadow at 150, as the second car (80 to 168) is on its last stretch, the flip at 186. Phase 2 has the car that
  // comes back (it starts 40 frames after the first has crossed and crosses in its turn) and nothing drops on the floor under it: the crusher as it clears, the flip the same 36 frames after. "Harder, same
  // damage": one attack id, one boss hit at most.
  for (const [ph, label] of [[3, 'phase 3 puts the whole course on the same turn: spikes shadowed 40 frames then up, the crusher on you at 150 frames (a whole hit), the big platform turned over at 186 -- one attack id'],
    [2, 'phase 2 puts the same course on the car and its return: spikes shadowed 40 frames then up, the crusher on you as the return car clears (a whole hit), the big platform turned over 36 frames after -- one attack id']]) it(label, () => {
    const T = Math.ceil((W.eval('WW') - 80) / 14) + 2, crushT = ph === 3 ? 150 : 30 + T + 40 + T, hold = crushT - 10, frames = crushT + 330, crushLo = crushT - 20, crushHi = crushT + 10;   // (the crusher's frame, the frame the fighter comes down to meet it, the loop, the window it is looked for in)
    const r = W.eval(`(function(){ ${STAGE(300, ph, true, true)}
      var gy = groundY(), pl = worldPlats[0], ids = {};
      b._pickForce = 's4car'; b._atkLive = null; b._atkTimer = 1; step();
      var banners = [], _b = banner; banner = function(t, m, k, l){ banners.push([String(t), k || null]); return _b(t, m, k, l); };
      var impacts = [], _imp = impact; impact = function(x, y, o){ impacts.push([hazardT, Math.round(x), Math.round(y), o && o.shake]); return _imp(x, y, o); };
      try {
        for (var w=0; w<80 && b._tel>0; w++){ f.x = 300; f.vx = 0; step(); }
        var spikes = projectiles.filter(function(p){ return p.s4 === 4; });
        var out = { spikes: spikes.length, want: 0, spike: spikes.every(function(p){ return p.delay >= 38 && p.warn >= 38 && p.vy < 0 && p.warnX === p.x && p.warnY === pl.y; }),
          away: spikes.every(function(p){ var mid = pl.x + pl.w/2; return Math.sign(p.vx) === (p.x < mid ? -1 : 1); }), dmg: spikes.map(function(p){ return p.dmg; }).filter(function(v, i, a){ return a.indexOf(v) === i; }), banner: banners.slice() };
        for (var x = pl.x + 18; x < pl.x + pl.w - 10; x += S4.spikeGap) out.want++;
        projectiles.forEach(function(p){ if (p.bossAtk != null) ids[p.bossAtk] = 1; });
        var crush = null, crushAt = -1, flipAt = -1, rot180 = -1, rotBack = -1, surfGone = null, surfBack = null, shadow = null, hitAt = -1;
        var pct0 = f.pct;
        for (var k=0;k<${frames};k++){
          f.x = 300; f.y = gy - 24 - (k < ${hold} ? 380 : 0); f.vx = 0; f.vy = 0; f.invuln = 0; f.hitstun = 0;
          if (k < ${hold}) f.invuln = 9999;
          step();
          if (b._s4) projectiles.forEach(function(p){ if (p.bossAtk != null) ids[p.bossAtk] = 1; });
          else b._atkTimer = 1e9;   // the turn is over: nothing else begins while the platform comes back
          var c = projectiles.filter(function(p){ return p.s4 === 3; })[0];
          if (c && crushAt < 0){ crushAt = k; crush = { warn: c.warn, warnX: c.warnX, warnY: c.warnY, delay: c.delay, dmg: c.dmg, kb: c.kb, x: c.x }; }
          if (c && c.warn > 0 && !shadow) shadow = [c.warnX, c.warnY];
          if (b._hz.flip && flipAt < 0) flipAt = k;
          if ((pl.rot||0) === 180 && rot180 < 0){ rot180 = k; surfGone = surfaceBelow(pl.x + pl.w/2, pl.y - 30); }
          if (rot180 >= 0 && (pl.rot||0) === 0 && rotBack < 0){ rotBack = k; surfBack = surfaceBelow(pl.x + pl.w/2, pl.y - 30); }
          if (f.pct > pct0 + 0.5 && hitAt < 0) hitAt = k;
          if (!b._s4 && rotBack >= 0) break;
        }
        out.crush = crush; out.crushAt = crushAt; out.flipAt = flipAt; out.rot180 = rot180; out.rotBack = rotBack; out.surfGone = surfGone; out.surfBack = surfBack; out.platY = pl.y; out.gy = gy;
        out.ids = Object.keys(ids).length; out.shadow = shadow; out.hitAt = hitAt; out.taken = f.pct - pct0; out.full = bossDmg();
        out.shakes = impacts.filter(function(i){ return i[3] >= 14; }).length; out.rotNow = pl.rot||0;
        summons = []; projectiles = []; worldPlats = []; return out;
      } finally { banner = _b; impact = _imp; }
    })()`);
    expect(r.spikes, 'a spike every 40 px along the platform').toBe(r.want);
    expect(r.spikes).toBeGreaterThan(0);
    expect(r.spike, 'a 40-frame shadow on the platform\'s top, then they jump up').toBe(true);
    expect(r.away, 'each leans away from its platform\'s middle, so it does not always knock you right').toBe(true);
    expect(r.banner.some(([t, k]) => t === 'SUPER DEATH TRAP!' && k === 'boss'), 'the trap is named when it goes live').toBe(true);
    expect(r.crush, 'the crusher comes down where you stand (a shadow first)').toMatchObject({ warn: expect.any(Number), warnX: 300, delay: expect.any(Number) });
    expect(r.shadow[0]).toBe(300);
    expect(r.crush.dmg, 'a whole boss hit').toBe(r.full);
    expect(r.crush.kb).toBe(14);
    expect(r.crushAt, `phase ${ph}: about ${crushT} frames after the cars set off`).toBeGreaterThan(crushLo);
    expect(r.crushAt).toBeLessThan(crushHi);
    expect(r.flipAt, `the platform turns at ${crushT + 36}`).toBeGreaterThan(r.crushAt);
    expect(r.flipAt - r.crushAt, 'the flip comes 36 frames after the crusher is let go').toBeGreaterThan(30);
    expect(r.flipAt - r.crushAt).toBeLessThan(42);
    expect(r.rot180, 'turned over within ten frames').toBeGreaterThan(r.flipAt);
    expect(r.rot180 - r.flipAt).toBeLessThanOrEqual(12);
    expect(r.surfGone, 'a platform turned over has nothing to stand on: the floor is the surface under it').toBeCloseTo(r.gy, 0);
    expect(r.rotBack - r.rot180, 'and it stays over for S4.flip.hold = 150 frames before it turns back').toBeGreaterThan(145);
    expect(r.surfBack, 'back, it is a platform again').toBeCloseTo(r.platY, 0);
    expect(r.rotNow).toBe(0);
    expect(r.ids, 'cars, spikes and crusher are one attack: one id').toBe(1);
    expect(r.hitAt, 'the crusher found the fighter standing under it').toBeGreaterThan(0);
    expect(r.taken, 'and the whole turn is one boss hit at most').toBeLessThanOrEqual(r.full + 1e-6);
    expect(r.shakes, 'the crusher shakes the floor').toBeGreaterThanOrEqual(1);
  });
});

describe('ONE OF EACH! (the chainsaw and the lollipop)', () => {
  // The Tile Divide: "No! The prizes are chainsaws! (pulls out a chainsaw)" ... "You know what? We'll give them one of each!" -- a chainsaw cuts someone in half, a
  // lollipop is "thrown" and caught in the mouth; he holds both and throws them in turn.
  it('he throws a pair -- the chainsaw lobbed at your feet and, twelve frames behind it, a lollipop flat at head height -- one pair, two, three by phase, twenty frames apart, one attack id', () => {
    const r = W.eval(`(function(){ var out = {};
      ${[1, 2, 3].map((ph) => `{ ${STAGE(300, ph, true)}
        f.invuln = 9999;
        ${FIRE('s4prizes')}
        var gy = groundY(), ev = [], t = 0, seen = [];
        var scan = function(){ projectiles.forEach(function(p){ if (p.s4 === 6 && seen.indexOf(p) < 0){ seen.push(p); ev.push({ t:t, shape:p.shape, x:Math.round(p.x), y:Math.round(p.y), vx:+p.vx.toFixed(2), vy:+p.vy.toFixed(2), r:p.r, kb:p.kb, atk:p.bossAtk, vol:!!p.volley, tag:p.fxTag, fxN:p.fxN, bounce:!!p.bounce, mb:p.maxBounces, dmg:p.dmg, fx:Math.round(f.x) }); } }); };
        scan();
        for (var k=0;k<200;k++){
          t++; if (t > 6) f.x += 3; f.vx = 0; f.y = gy - 24; f.invuln = 9999; step(); scan();
          projectiles.forEach(function(p){ if (p.s4 === 6 && p.shape === 's4saw' && (p.bounces||0) > (p._lb||0)){ p._lb = p.bounces; ev.push({ t:t, bounce:p.bounces, x:Math.round(p.x), y:Math.round(p.y) }); } });
          if (!b._s4 && b._atkTimer > 5 && !projectiles.some(function(p){ return p.s4 === 6; })) break;
        }
        out.p${ph} = { kind: telKind, name: telName, tel0: tel0, ev: ev, gy: gy, timer: b._atkTimer, bx: b.x };
        summons = []; projectiles = []; }`).join('\n')}
      out.full = bossDmg(); return out; })()`);
    for (const ph of [1, 2, 3]) {
      const o = r['p' + ph], saws = o.ev.filter((e) => e.shape === 's4saw'), lollis = o.ev.filter((e) => e.shape === 's4lolli'), bounces = o.ev.filter((e) => e.bounce);
      expect(o.kind).toBe('s4prizes');
      expect(o.name).toBe('ONE OF EACH!');
      expect(o.tel0).toBe(36);
      expect(saws.length, 'a chainsaw a pair: ' + ph).toBe(ph);
      expect(lollis.length, 'and a lollipop with it').toBe(ph);
      expect(saws.map((e) => e.t), 'a pair every 20 frames').toEqual([0, 20, 40].slice(0, ph));
      expect(lollis.map((e) => e.t), 'the lollipop 12 frames behind its chainsaw').toEqual([12, 32, 52].slice(0, ph));
      expect(new Set(o.ev.filter((e) => e.shape).map((e) => e.atk)).size, 'one attack id for the turn').toBe(1);
      expect(o.ev.filter((e) => e.shape).every((e) => e.vol), 'a volley: the pair is capped as one').toBe(true);
      for (const s of saws) expect(s).toMatchObject({ r: 14, kb: 9, tag: 'bleed', fxN: 60, bounce: true, mb: 2 });
      for (const e of o.ev.filter((x) => x.shape)) expect(e.dmg, 'each piece of a pair is a boss shot\'s 0.8 of a hit; the pair together is capped at one').toBeCloseTo(r.full * 0.8, 5);
      for (const l of lollis) {
        expect(l).toMatchObject({ r: 13, kb: 7, vy: 0 });
        expect(Math.abs(l.vx), 'thrown flat and fast').toBe(12);
        expect(l.y, 'at head height: 40 px over the floor').toBeCloseTo(o.gy - 40, 0);
      }
      // the first pair goes where you stood when he drew it (300), the chainsaw to the left of him at your feet, the lollipop the same way
      expect(saws[0].vx).toBeLessThan(0);
      expect(lollis[0].vx).toBeLessThan(0);
      const land0 = bounces.find((e) => e.bounce === 1);
      expect(Math.abs(land0.x - 300), 'the first chainsaw lands on the spot you stood on, though you walked on').toBeLessThanOrEqual(12);
      expect(land0.y, 'at your feet').toBeGreaterThan(o.gy - 24);
      if (ph > 1) {   // the next pairs go to where you are by then
        const second = bounces.filter((e) => e.bounce === 1)[1];
        expect(Math.abs(second.x - saws[1].fx), 'the second chainsaw lands where you were as it was thrown').toBeLessThanOrEqual(16);
      }
      expect(Math.abs(lollis[0].y - land0.y), 'the lollipop passes over the chainsaw\'s landing, the two dodges are different dodges').toBeGreaterThan(20);
    }
  });

  it('standing in the pairs is one boss hit, never more: the lollipop and the chainsaw of a pair share it, and the cut bleeds a trickle', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 3, true)}
      var gy = groundY();
      ${FIRE('s4prizes')}
      var hits = [], pct0 = f.pct, bleedSeen = 0, sawBounces = [], bleedAt = -1;
      for (var k=0;k<260;k++){
        f.x = 300; f.y = gy - 24; f.vx = 0; f.vy = 0; f.invuln = 0; f.hitstun = 0; step();
        if (f.pct - pct0 > 2){ hits.push([k, +(f.pct - pct0).toFixed(2)]); }   // a hit; the bleed is hundredths a frame
        pct0 = f.pct;
        if (f.bleed > 0 && bleedAt < 0) bleedAt = k;
        projectiles.forEach(function(p){ if (p.s4 === 6 && p.shape === 's4saw') sawBounces.push(p.bounces||0); });
        if (!b._s4 && b._atkTimer > 5 && !projectiles.some(function(p){ return p.s4 === 6; })) break;
      }
      var out = { hits: hits, total: f.pct, bleedAt: bleedAt, full: bossDmg(), maxB: Math.max.apply(null, sawBounces.concat([0])) };
      summons = []; projectiles = []; return out; })()`);
    expect(r.hits.reduce((a, h) => a + h[1], 0), 'three pairs on one fighter: the one boss hit').toBeCloseTo(r.full, 5);
    expect(r.hits.length, 'the lollipop and the chainsaw of the first pair share it between them (17.6 and 4.4); the other pairs add nothing').toBeLessThanOrEqual(2);
    expect(r.bleedAt, 'and the cut bleeds').toBeGreaterThan(0);
    expect(r.total - r.full, 'the bleed is a trickle, not a second hit').toBeLessThan(4);
  });

  it('a chainsaw that lands is heavy: it shakes the floor and scars it where you stood', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1, true)}
      var imps = [], _imp = impact; impact = function(x, y, o){ imps.push([hazardT, Math.round(x), Math.round(y), o && o.shake, !!(o && o.scar)]); return _imp(x, y, o); };
      try {
        f.invuln = 9999;
        ${FIRE('s4prizes')}
        var firstLand = -1, goneAt = -1, seenSaw = false;
        for (var k=0;k<260;k++){
          f.x = 300; f.y = groundY() - 24; f.invuln = 9999; step();
          var saw = projectiles.filter(function(p){ return p.s4 === 6 && p.shape === 's4saw'; })[0];
          if (saw){ seenSaw = true; if ((saw.bounces||0) >= 1 && firstLand < 0) firstLand = k; }
          else if (seenSaw && goneAt < 0) goneAt = k;
          if (!b._s4 && b._atkTimer > 5 && !projectiles.some(function(p){ return p.s4 === 6; })) break;
        }
        return { imps: imps, gy: groundY(), firstLand: firstLand, goneAt: goneAt, left: projectiles.filter(function(p){ return p.s4 === 6; }).length };
      } finally { impact = _imp; summons = []; projectiles = []; }
    })()`);
    const landings = r.imps.filter((i) => i[3] === 7);
    expect(landings.length, 'a chainsaw\'s first landing shakes the floor (its second is its last, and the engine ends the shot in that step)').toBe(1);
    expect(landings[0][4], 'and leaves a cut').toBe(true);
    expect(r.firstLand, 'it landed').toBeGreaterThan(40);
    expect(r.goneAt - r.firstLand, 'it hops once more (the better part of a second in the air) and its second landing is its last').toBeGreaterThan(40);
    expect(r.goneAt - r.firstLand).toBeLessThan(140);
    expect(r.left, 'and it is gone').toBe(0);
    expect(Math.abs(landings[0][1] - 300), 'on the spot').toBeLessThanOrEqual(14);
  });
});


describe('HASTA LA VISTA! (Taco as a gun)', () => {
  // Journey Through Memory Lane (Part 2): "(MePhone4S grabs Taco and cocks her like a gun.) MePhone4S: Well, in that case... Hasta la vista, Blu-Ray... You belong
  // in VCR-land!" -- his page: "4S equips Taco nearby and fires a lemon". Taco "spits lemons" (4Seeing The Future).
  it('he cocks Taco: the ring on the floor follows you for the first 28 frames of the wind-up and locks for the last 18, then ONE BIG LEMON lands exactly on it -- two in phase 2, three in phase 3, one attack id', () => {
    const r = W.eval(`(function(){ var out = {};
      ${[1, 2, 3].map((ph) => `{ ${STAGE(300, ph, true)}
        f.invuln = 9999;
        b._pickForce = 's4vista'; b._atkLive = null; b._atkTimer = 1; step();
        var o = { kind: b._telKind, name: document.getElementById('banner').textContent, tel0: b._tel, flag: b._s4Vista, mark: b._aimIdx, gy: groundY() };
        var rec = [];
        for (var w=0; w<80 && b._tel>0; w++){ f.x = (w < 20 ? 300 + w*5 : 400 - (w-20)*2); f.vx = 0; step(); rec.push([b._tel, b._aimLock, Math.round(b._aimX), Math.round(b._aimY), Math.round(f.x)]); }
        o.rec = rec; o.lockedAt = { x: b._aimX, y: b._aimY };
        var lem = [], seen = [], t = 0, shakes = [], _imp = impact; impact = function(x, y, o){ shakes.push([Math.round(x), o && o.shake]); return _imp(x, y, o); };
        var scan = function(){ projectiles.forEach(function(p){ if (p.s4 === 7 && seen.indexOf(p) < 0){ seen.push(p); lem.push({ t:t, x:Math.round(p.x), y:Math.round(p.y), vx:p.vx, vy:p.vy, r:p.r, kb:p.kb, dmg:p.dmg, atk:p.bossAtk, wx:p.warnX, wy:Math.round(p.warnY), nd:!!p.noDrift, bs:!!p.breaksOnSurface, vol:!!p.volley, shape:p.shape, shake: p.landImpact && p.landImpact.shake, fx:Math.round(f.x) }); } }); };
        scan();
        for (var k=0;k<160;k++){
          t++; f.vx = 0; f.invuln = 9999; f.y = groundY() - 24; step(); scan();
          seen.forEach(function(p, i){ if (p.life > 0) { lem[i].lx = Math.round(p.x); lem[i].ly = Math.round(p.y); } });
          if (!b._s4 && b._atkTimer > 5 && !projectiles.some(function(p){ return p.s4 === 7; })) break;
        }
        impact = _imp; o.lem = lem; o.shakes = shakes.filter(function(q){ return q[1] === 6; }); out.p${ph} = o; summons = []; projectiles = []; }`).join('\n')}
      out.full = bossDmg(); return out; })()`);
    for (const ph of [1, 2, 3]) {
      const o = r['p' + ph], L = o.lem;
      expect(o.kind).toBe('s4vista');
      expect(o.name).toBe('HASTA LA VISTA!');
      expect(o.tel0).toBe(46);
      expect(o.flag, 'the sight is up: Taco is cocked').toBe(true);
      // the ring follows you (aimX is where you are), and from 18 frames before the end it is locked where it was
      const early = o.rec.filter((q) => q[0] >= 20), late = o.rec.filter((q) => q[0] <= 16);
      for (const q of early) { expect(q[1], 'red while it follows').toBe(false); expect(q[2], 'on you').toBe(q[4]); }
      for (const q of late) { expect(q[1], 'white once it holds').toBe(true); expect(q[2], 'where it locked').toBe(o.lockedAt.x < 0 ? q[2] : Math.round(o.lockedAt.x)); }
      expect(new Set(late.map((q) => q[2])).size, 'the ring does not move after it locks').toBe(1);
      expect(late[0][4] === late[late.length - 1][4], 'while you did keep moving').toBe(false);
      expect(Math.abs(o.rec[0][3] - o.gy), 'on the floor under you').toBeLessThan(2);
      // the lemons
      expect(L.length, 'a lemon a phase, up to three').toBe(ph);
      expect(L.map((l) => l.t), 'eighteen frames apart').toEqual([0, 18, 36].slice(0, ph));
      expect(new Set(L.map((l) => l.atk)).size, 'one attack id').toBe(1);
      for (const l of L) {
        expect(l).toMatchObject({ r: 20, kb: 14, nd: true, bs: true, vol: true, shape: 'lemon', shake: 6 });
        expect(l.dmg, 'a boss shot\'s 0.8 of a hit, as the volley cap shares it').toBeCloseTo(r.full * 0.8, 5);
        expect(l.vy, 'thrown up and over: a lob, not a drop').toBeLessThan(0);
        expect(Math.abs(l.lx - l.wx), 'it lands on the ring it drew, no drift').toBeLessThanOrEqual(1);
      }
      expect(L[0].wx, 'the first lemon lands on the locked ring').toBe(Math.round(o.lockedAt.x));
      expect(o.shakes.length, 'each lemon shakes the floor where it lands').toBe(ph);
      o.shakes.map((q) => q[0]).sort((a, b) => a - b).forEach((x, i) => expect(Math.abs(x - L.map((l) => l.wx).sort((a, b) => a - b)[i]), 'on its ring, give or take a frame\'s travel').toBeLessThanOrEqual(6));
      // the later lemons go to where you are by then, fanned a little (34 px)
      L.slice(1).forEach((l, j) => expect(Math.abs(l.wx - (l.fx + (j + 1 - (ph - 1) / 2) * 34)), 'at where you are by then').toBeLessThanOrEqual(1));
    }
  });

  it('a lemon that lands on you is a heavy hit -- knock 14 -- and three of them are still one boss hit', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 3, true)}
      b._pickForce = 's4vista'; b._atkLive = null; b._atkTimer = 1; step();
      for (var w=0; w<80 && b._tel>0; w++){ f.x = 300; f.vx = 0; f.invuln = 9999; step(); }
      var hits = [], pct0 = f.pct, kbs = [], gy = groundY(), shakes = [], _imp = impact; impact = function(x, y, o){ shakes.push(o && o.shake); return _imp(x, y, o); };
      try {
        for (var k=0;k<200;k++){
          f.x = 300; f.y = gy - 24; f.vx = 0; f.vy = 0; f.invuln = 0; f.hitstun = 0; step();
          if (f.pct - pct0 > 1){ hits.push(+(f.pct - pct0).toFixed(2)); kbs.push([f.vx, f.vy]); }
          pct0 = f.pct;
          if (!b._s4 && b._atkTimer > 5 && !projectiles.some(function(p){ return p.s4 === 7; })) break;
        }
      } finally { impact = _imp; }
      var out = { hits: hits, kbs: kbs, total: f.pct, full: bossDmg() };
      summons = []; projectiles = []; return out; })()`);
    expect(r.hits.length, 'the first lemon hits (17.6 of the 22), a later one takes the rest').toBeGreaterThanOrEqual(1);
    expect(r.hits.length).toBeLessThanOrEqual(2);
    expect(r.total, 'three lemons: one boss hit').toBeCloseTo(r.full, 5);
    expect(Math.abs(r.kbs[0][0]), 'a knock: it sends you flying sideways').toBeGreaterThan(8);
    expect(r.kbs[0][1], 'and up').toBeLessThan(0);
  });
});

describe('POP UP! (up through the quicksand)', () => {
  // 4Seeing The Future: "(MePhone4S pops up from under [a contestant]) I hate you! That's why I poisoned your cookie!"; the quicksand is his other place ("the
  // challenge ... to get across this quicksand"). He sinks, bubbles show where, a boil marks the spot, he pops up under it.
  it('the wind-up sinks him into the floor where he stands, the boil follows you for the first 30 frames and holds for the last 16, and he is under the floor, out of reach, when it ends', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1, true)}
      var gy = groundY(), R = b.r;
      b._pickForce = 's4popup'; b._atkLive = null; b._atkTimer = 1; step();
      var o = { kind: b._telKind, name: document.getElementById('banner').textContent, tel0: b._tel, sx: b._s4.sx, R: R, gy: gy, x0: b.x };
      var rec = [];
      for (var w=0; w<80 && b._tel>0; w++){
        f.x = (w < 24 ? 300 + w*4 : 396 - (w-24)); f.vx = 0; f.invuln = 9999; step();
        rec.push([b._tel, b._s4.x, b._s4.lock, Math.round(b.y), Math.round(b.x), Math.round(f.x), b.hover]);
      }
      o.rec = rec; o.after = { st: b._s4.st, y: b.y, x: b.x, go: b._s4.go, lock: b._s4.lock, ax: b._s4.x };
      summons = []; projectiles = []; return o; })()`);
    expect(r.kind).toBe('s4popup');
    expect(r.name).toBe('POP UP!');
    expect(r.tel0).toBe(46);
    expect(r.rec.every((q) => q[6] === true), 'he is hovering on his own motion, not walking').toBe(true);
    expect(r.rec.every((q) => q[4] === r.sx), 'he sinks where he stands: his x does not change').toBe(true);
    const ys = r.rec.map((q) => q[3]);
    expect(ys.every((y, i) => i === 0 || y >= ys[i - 1]), 'he goes down, never up').toBe(true);
    expect(ys[0], 'on the floor to start').toBeLessThan(r.gy - r.R + 40);
    expect(ys[ys.length - 1], 'by the end his middle is below the floor line').toBeGreaterThan(r.gy + 40);
    // the boil follows you, then holds
    const early = r.rec.filter((q) => q[0] >= 20), late = r.rec.filter((q) => q[0] <= 14);
    for (const q of early) { expect(q[2], 'red').toBe(0); expect(q[1], 'on you').toBe(q[5]); }
    for (const q of late) expect(q[2], 'white').toBe(1);
    expect(new Set(late.map((q) => q[1])).size, 'it does not move after it locks').toBe(1);
    expect(r.after, 'and the wind-up hands over to the pop: under the floor, nothing reaches him').toMatchObject({ st: 'dig', go: true, lock: 1 });
    expect(r.after.y).toBeGreaterThan(r.gy + 300);
    expect(r.after.ax, 'the pop is where the boil locked').toBe(late[0][1]);
  });

  it('he pops up on the locked spot, once in phase 1, twice in phase 2 and three times in phase 3 (the later ones follow you again, shorter tells), stands in the pit a moment each time -- the punish -- and the turn is one attack id', () => {
    const r = W.eval(`(function(){ var out = {};
      ${[1, 2, 3].map((ph) => `{ ${STAGE(300, ph, true)}
        var gy = groundY(), R = b.r;
        b._pickForce = 's4popup'; b._atkLive = null; b._atkTimer = 1; step();
        for (var w=0; w<80 && b._tel>0; w++){ f.x = 300; f.vx = 0; f.invuln = 9999; step(); }
        var ev = [], last = '', ids = {}, xs = [], ys = {};
        for (var k=0;k<400;k++){
          f.x = 300; f.y = gy - 24; f.vx = 0; f.vy = 0; f.invuln = 9999; step();
          var A = b._s4;
          if (A) ids[A.id] = 1;
          var key = A ? (A.st + '|' + A.i) : 'none';
          if (key !== last){ ev.push([k, key, Math.round(b.x), Math.round(b.y)]); last = key; }
          if (A && A.st === 'stand') ys.stand = Math.round(b.y);
          if (A && A.st === 'dig') ys.dig = Math.round(b.y);
          if (!A) break;
        }
        out.p${ph} = { ev: ev, ids: Object.keys(ids).length, gy: gy, R: R, ys: ys, hover: b.hover, timer: b._atkTimer, sx: ev.length ? ev[0][2] : null };
        summons = []; projectiles = []; }`).join('\n')}
      out.pop = { hold: S4.pop.hold, rise: S4.pop.rise, stand: S4.pop.stand, sink2: S4.pop.sink2, again: S4.pop.again };
      return out; })()`);
    for (const ph of [1, 2, 3]) {
      const o = r['p' + ph], seq = o.ev.map((e) => e[1].split('|')[0]);
      const pops = o.ev.filter((e) => e[1].startsWith('rise')).length;
      expect(pops, 'a pop a phase, up to three').toBe(ph);
      expect(seq.slice(0, 4), 'under the floor, up, down, standing').toEqual(['dig', 'rise', 'fall', 'stand']);
      expect(o.ids, 'one attack id for the whole turn').toBe(1);
      expect(o.ys.dig, 'he is far under the floor between pops').toBeGreaterThan(o.gy + 300);
      expect(o.ys.stand, 'and stands on the floor line after, where he can be hit').toBeCloseTo(o.gy - o.R, 0);
      expect(o.hover, 'his own motion is over when it is').toBe(false);
      expect(o.timer, 'and then the usual gap').toBeGreaterThan(40);
      // the stand lasts S4.pop.stand frames, and the pops after the first sink (12 frames) and dig with a tell of their own (26 frames: follow, then hold)
      const dur = (name, nth = 0) => { const idx = o.ev.map((e, i) => e[1].startsWith(name) ? i : -1).filter((i) => i >= 0)[nth]; return o.ev[idx + 1][0] - o.ev[idx][0]; };
      expect(Math.abs(dur('stand') - r.pop.stand), 'the punish window').toBeLessThanOrEqual(1);
      if (ph > 1) {
        expect(seq.slice(4, 6)).toEqual(['sink', 'dig']);
        expect(Math.abs(dur('sink') - r.pop.sink2), 'a short sink between pops').toBeLessThanOrEqual(1);
        expect(Math.abs(dur('dig', 1) - r.pop.again), 'a shorter tell the second time').toBeLessThanOrEqual(1);
      }
      expect(Math.abs(dur('dig', 0) - r.pop.hold), 'the first pop is on the boil you were shown').toBeLessThanOrEqual(1);
    }
    // the pops are where the boil was locked: he comes up at 300 where the fighter stood
    expect(r.p1.ev.find((e) => e[1].startsWith('rise'))[2]).toBe(300);
  });

  it('the pop hits whoever is in the boil and low enough to be in it -- knocked up and away, the floor shakes -- and misses whoever is outside it, up on a platform or in the air; the phase beat\'s pop hits nobody', () => {
    const r = W.eval(`(function(){ ${STAGE(400, 1, false, true)}
      var gy = groundY(), plat = worldPlats[0];
      var mk = function(name, x, y, idx){ var g = makeFighter(ROSTER.find(function(r){ return r.name===name; }), x, y, idx); g.team = 0; g.controller = 'still'; g.stocks = 9; g.invuln = 0; g.hitstun = 0; g.pct = 0; return g; };
      var A = f; A.x = 400; A.y = gy - 24;
      var right = mk('Pillow', 460, gy - 24, 1), left = mk('Leafy', 340, gy - 24, 2), far = mk('Pillow', 530, gy - 24, 3), air = mk('Leafy', 400, gy - 200, 4), onPlat = mk('Pillow', 400, plat.y - 24, 5);
      onPlat.x = plat.x + 60;   // standing on the platform, over the boil
      var spot = onPlat.x;
      fighters = [A, right, left, far, air, onPlat];
      var shakes = [], _imp = impact; impact = function(x, y, o){ shakes.push([Math.round(x), Math.round(y), o && o.shake]); return _imp(x, y, o); };
      var out = {};
      try {
        var id = ++BOSS_ATK_ID; s4PopHit(b, { x:400, id:id, beat:0 });
        out.pct = { centre: A.pct, right: right.pct, left: left.pct, far: far.pct, air: air.pct };
        out.knock = { centre: [A.vx, A.vy], right: [right.vx, right.vy], left: [left.vx, left.vy] };
        out.shake = shakes[0];
        // the platform: pop right under it
        fighters.forEach(function(g){ g.pct = 0; g.invuln = 0; g._bossHitId = null; g._bossHitDmg = 0; });
        s4PopHit(b, { x:spot, id:++BOSS_ATK_ID, beat:0 });
        out.plat = onPlat.pct; out.platFeet = feetY(onPlat); out.platReach = gy - S4.pop.reach;
        // the beat's pop is the same dust and no hit
        fighters.forEach(function(g){ g.pct = 0; g.invuln = 0; g._bossHitId = null; g._bossHitDmg = 0; });
        s4PopHit(b, { x:400, id:++BOSS_ATK_ID, beat:1 });
        out.beat = A.pct + right.pct + left.pct;
      } finally { impact = _imp; summons = []; projectiles = []; worldPlats = []; }
      out.full = bossDmg(); out.r = S4.pop.r; return out; })()`);
    expect(r.pct.centre, 'in the boil: 0.8 of a boss hit').toBeCloseTo(r.full * 0.8, 5);
    expect(r.pct.right, 'inside the boil\'s width').toBeCloseTo(r.full * 0.8, 5);
    expect(r.pct.left).toBeCloseTo(r.full * 0.8, 5);
    expect(r.pct.far, '130 px from it: outside').toBe(0);
    expect(r.pct.air, 'in the air, feet more than 110 px over the floor: it passes under').toBe(0);
    expect(r.platFeet, 'a platform\'s top is over the reach of the pop').toBeLessThan(r.platReach);
    expect(r.plat, 'so whoever stands on the platform over the boil is safe').toBe(0);
    expect(r.knock.centre[1], 'knocked up').toBeLessThan(0);
    expect(r.knock.right[0], 'and away from the boil').toBeGreaterThan(0);
    expect(r.knock.left[0]).toBeLessThan(0);
    expect(r.shake[2], 'the floor shakes').toBeGreaterThanOrEqual(10);
    expect(r.beat, 'the phase beat\'s pop hurts nobody').toBe(0);
  });
});

describe('QUICKSAND SHOVE! (the charging tackle)', () => {
  // 4Seeing The Future: "MePhone4S tackles MePhone4 and tries to push him into the quicksand."
  it('the lane follows you for the first 30 frames of the wind-up and holds for the last 16; the charge is faster each phase, the strip beyond it wider and longer-lived; phase 3 charges twice', () => {
    const r = W.eval(`(function(){ var out = {};
      ${[1, 2, 3].map((ph) => `{ ${STAGE(300, ph, true)}
        var gy = groundY(), R = b.r;
        b._pickForce = 's4shove'; b._atkLive = null; b._atkTimer = 1; step();
        var o = { kind: b._telKind, name: document.getElementById('banner').textContent, tel0: b._tel, dir0: b._s4.dir, R: R, gy: gy };
        var rec = [];
        for (var w=0; w<80 && b._tel>0; w++){
          f.x = (w < 24 ? 300 + w*4 : 396 - (w-24)); f.vx = 0; f.invuln = 9999; step();
          rec.push([b._tel, b._s4.x, b._s4.lock, b._s4.dir, Math.round(f.x), Math.round(b.x)]);
        }
        o.rec = rec; var A = b._s4; o.run = { st: A.st, spd: A.spd, end: A.end, cx: A.cx, hw: A.hw, dir: A.dir, x: A.x, n: A.n };
        o.plan = (function(){ var p = s4ShovePlan(R, A.dir, A.x, ${ph}); return { end: Math.round(p.end), cx: Math.round(p.cx), hw: Math.round(p.hw) }; })();
        o.sand = JSON.parse(JSON.stringify(b._hz.sand)); o.t0 = hazardT;
        var ev = [], last = '', xs = [], vmax = 0, px = b.x;
        for (var k=0;k<400;k++){
          f.x = 100; f.y = gy - 24; f.vx = 0; f.vy = 0; f.invuln = 9999; step();
          var B = b._s4; var key = B ? (B.st + '|' + B.i) : 'none';
          vmax = Math.max(vmax, Math.abs(b.x - px)); px = b.x;
          if (key !== last){ ev.push([k, key, Math.round(b.x)]); last = key; }
          if (!B) break;
        }
        o.ev = ev; o.vmax = Math.round(vmax); o.sandAfter = JSON.parse(JSON.stringify(b._hz.sand || [])); o.bx = b.x; o.timer = b._atkTimer; o.hover = b.hover;
        out.p${ph} = o; summons = []; projectiles = []; }`).join('\n')}
      out.V = S4.shove; return out; })()`);
    const V = r.V;
    for (const ph of [1, 2, 3]) {
      const o = r['p' + ph];
      expect(o.kind).toBe('s4shove');
      expect(o.name).toBe('QUICKSAND SHOVE!');
      expect(o.tel0).toBe(46);
      expect(o.dir0, 'he faces you: you are to his left').toBe(-1);
      const early = o.rec.filter((q) => q[0] >= 20), late = o.rec.filter((q) => q[0] <= 14 && q[0] >= 1);
      for (const q of early) { expect(q[2], 'red').toBe(0); expect(q[1], 'the lane follows you').toBe(q[4]); }
      for (const q of late) expect(q[2], 'white').toBe(1);
      expect(new Set(late.map((q) => q[1])).size, 'it holds after it locks').toBe(1);
      expect(o.run.st).toBe('run');
      expect(o.run.spd, 'faster each phase').toBe(V.spd[ph]);
      expect(o.run.n, 'one charge, two in phase 3').toBe(V.n[ph]);
      expect(o.run.x, 'the charge goes to where the lane locked').toBe(late[0][1]);
      expect({ end: o.run.end, cx: o.run.cx, hw: o.run.hw }, 'the run ends and the strip lies where the plan puts them').toEqual(o.plan);
      expect(o.run.end, 'he runs on 60 px past where you were').toBe(Math.round(o.run.x + o.run.dir * V.lead));
      expect(o.sand[0], 'the strip: centre, half-width, from now, for its life').toEqual([o.run.cx, V.w[ph] / 2, o.t0, o.t0 + V.life[ph]]);
      expect((o.sand[0][0] - o.run.end) * o.run.dir, 'beyond where he stops, in the direction he runs').toBeGreaterThan(0);
      expect(o.vmax, 'he moves no faster than his charge').toBeLessThanOrEqual(V.spd[ph] + 0.5);
    }
    expect(r.p3.ev.map((e) => e[1].split('|')[0]).filter((n) => n !== 'none'), 'phase 3: charge, skid, recover, a short wind-up, charge again').toEqual(['run', 'skid', 'rec', 'tel2', 'run', 'skid', 'rec']);
    expect(r.p1.ev.map((e) => e[1].split('|')[0]).filter((n) => n !== 'none')).toEqual(['run', 'skid', 'rec']);
    expect(r.p3.sandAfter.length, 'two strips in phase 3').toBe(2);
    expect(r.p1.sandAfter.length).toBe(1);
    expect(r.p1.timer, 'he stands a beat at the strip\'s edge, then the usual gap').toBeGreaterThan(60);
    expect(r.p1.hover).toBe(false);
  });

  it('the tackle hits whoever is in front of him and low enough -- 0.8 of a boss hit, knocked along -- and pushes them to the end of the run, into the quicksand, slowed; a platform is clear of it', () => {
    const r = W.eval(`(function(){ var out = {};
      ${[1, 2].map((ph) => `{ ${STAGE(560, ph, true, true)}
        var gy = groundY(), pl = worldPlats[0];
        var g = makeFighter(ROSTER.find(function(r){ return r.name==='Pillow'; }), 460, pl.y - 24, 1); g.team = 0; g.controller = 'still'; g.stocks = 9; fighters.push(g);
        b._pickForce = 's4shove'; b._atkLive = null; b._atkTimer = 1; step();
        var put = function(){ g.x = 460; g.y = pl.y - 24; g.vx = 0; g.vy = 0; g.invuln = 0; g.hitstun = 0; };
        for (var w=0; w<80 && b._tel>0; w++){ put(); f.x = 560; f.vx = 0; f.invuln = 9999; step(); }
        var A = b._s4, hits = [], pct0 = f.pct, gp0 = g.pct, maxSlow = 0;
        f.invuln = 0;
        for (var k=0;k<200;k++){
          put(); step();
          if (f.pct - pct0 > 2){ hits.push([k, +(f.pct - pct0).toFixed(2), A.st, Math.round(f.x)]); }
          pct0 = f.pct; maxSlow = Math.max(maxSlow, f.slowed || 0);
          if (!b._s4) break;
        }
        out.p${ph} = { hits: hits, fx: Math.round(f.x), fslow: f.slowed || 0, maxSlow: maxSlow, cx: A.cx, hw: A.hw, platHit: g.pct - gp0, bx: Math.round(b.x), dir: A.dir, end: A.end, fy: f.y - groundY() };
        summons = []; projectiles = []; worldPlats = []; }`).join('\n')}
      out.full = bossDmg(); return out; })()`);
    for (const ph of [1, 2]) {
      const o = r['p' + ph];
      expect(o.hits.length, 'one tackle, one hit').toBe(1);
      expect(o.hits[0][1], '0.8 of a boss hit').toBeCloseTo(r.full * 0.8, 5);
      expect(o.hits[0][2], 'taken in the charge').toBe('run');
      expect(Math.abs(o.fx - o.cx), 'carried on to the end of the run: you finish inside the strip').toBeLessThan(o.hw);
      expect(o.maxSlow, 'and the quicksand slows you').toBeGreaterThan(0);
      expect(o.platHit, 'a fighter on the platform over the lane is clear of it').toBe(0);
      expect(Math.abs(o.bx - o.cx), 'he stands at its edge, not in it').toBeGreaterThan(o.hw);
      expect((o.fx - 560) * o.dir, 'you were pushed the way he ran').toBeGreaterThan(0);
    }
  });
});


describe('the Super Death Trap (his arena and its hazard)', () => {
  // The Tile Divide: "an obstacle course with sawblades, a crusher, and spikes above a pit of quicksand" -- "Each its own" (the owner, Round 8): the place reacts to the
  // fight, and "if it makes sense for a hazard, reduce boss difficulty and add a hazard" (Round 11): the sawblades and the quicksand are the hazard, his gaps are longer.
  // The owner, 2026-10-01 (Round 17, the difficulty picks): "MePhone4S: ... the sawblades patrol from phase 1, and faster" -- they were parked in phase 1 ("the trap idle"), patrolled 36 px either side of
  // where they sit in phase 2 and 64 in phase 3, at 0.034 rad a frame. They patrol from phase 1 now -- 36, 50 and 64 px, a little more each phase and never more than they ever did -- at 0.05 rad a frame.
  it('the sawblades at each end of the beam: patrolling from phase 1 (a little), more in phase 2, the most in phase 3 ("the whole course goes live"), faster than they were, mirrored', () => {
    const r = W.eval(`(function(){ var out = {};
      ${[1, 2, 3].map((ph) => `{ ${STAGE(600, ph)}
        var mn = [1e9, 1e9], mx = [-1e9, -1e9], first = null, turns = 0, prev = null, dir = 0;
        for (var k=0;k<500;k++){ f.x = 600; f.invuln = 9999; step(); var sw = b._hz.saw; if (k === 0) first = sw.slice(); mn[0] = Math.min(mn[0], sw[0]); mx[0] = Math.max(mx[0], sw[0]); mn[1] = Math.min(mn[1], sw[1]); mx[1] = Math.max(mx[1], sw[1]);
          if (prev !== null && sw[0] !== prev){ var d = Math.sign(sw[0] - prev); if (dir && d !== dir) turns++; dir = d; } prev = sw[0]; }
        out.p${ph} = { first: first, mn: mn, mx: mx, turns: turns }; summons = []; projectiles = []; }`).join('\n')}
      out.SW = S4.saw; out.WW = WW; return out; })()`);
    const home = r.SW.home;
    expect(r.SW.amp, 'a little in phase 1, more in phase 2, as much as ever in phase 3').toEqual([0, 36, 50, 64]);
    expect(r.SW.w, 'faster than the 0.034 it was').toBe(0.05);
    for (const [ph, amp] of [[1, 36], [2, 50], [3, 64]]) {
      const o = r['p' + ph];
      expect(o.mn[0], 'phase ' + ph + ': it patrols ' + amp + ' px either side of where it sits').toBeCloseTo(home - amp, -1);
      expect(o.mx[0]).toBeCloseTo(home + amp, -1);
      expect(o.mn[1]).toBeCloseTo(r.WW - home - amp, -1);
      expect(o.mx[1]).toBeCloseTo(r.WW - home + amp, -1);
      expect(o.mn[0], 'never off the beam, never past its middle').toBeGreaterThan(0);
      expect(o.mx[0]).toBeLessThan(r.WW / 2);
      expect(o.turns, 'a sweep every 2 pi / 0.05 = 126 frames: about eight turns in 500 (it was five or so at 0.034)').toBeGreaterThanOrEqual(7);
    }
  });

  it('a blade that patrols bites whoever it sweeps through, from phase 1: a fighter standing at its home is bitten within a sweep, for a fraction of a boss hit', () => {
    const r = W.eval(`(function(){ ${STAGE(70, 1)}
      var gy = groundY(), bites = [], last = 0;
      for (var k=0;k<260;k++){ f.x = 70; f.y = gy - 24; f.vx = 0; f.vy = 0; f.hitstun = 0; f.invuln = 0; step(); if (f.pct > last + 1e-9){ bites.push([k, +(f.pct - last).toFixed(3)]); last = f.pct; } }
      summons = []; projectiles = []; return { bites: bites, full: bossDmg(), frac: S4.saw.frac, gap: S4.saw.gap }; })()`);
    expect(r.bites.length, 'it comes through again and again').toBeGreaterThanOrEqual(2);
    for (const [, d] of r.bites) expect(d, 'each bite is 0.3 of a boss hit').toBeCloseTo(+(r.full * r.frac).toFixed(3), 2);
    for (let i = 1; i < r.bites.length; i++) expect(r.bites[i][0] - r.bites[i - 1][0], 'and never closer than S4.saw.gap').toBeGreaterThanOrEqual(r.gap);
  });

  // (a blade parked at its home -- S4.saw.amp zeroed for the test -- so this is about its bite: the patrol has its own tests above)
  it('a blade is 0.3 of a boss hit, knocks you off it, bites again only every 40 frames, and is jumped: standing on the beam beside the quicksand is the risk, a hop is the answer', () => {
    const r = W.eval(`(function(){ var amp0 = S4.saw.amp; S4.saw.amp = [0, 0, 0, 0]; try { ${STAGE(300, 1)}
      var gy = groundY(), hits = [], pct1 = 0;
      f.x = 70; f.y = gy - 24; f.vx = 0; f.vy = 0; f.invuln = 0; f.pct = 0;
      step(); var first = { pct: f.pct, vx: f.vx, vy: f.vy, hitstun: f.hitstun };
      pct1 = f.pct;
      for (var k=0;k<90;k++){ f.x = 70; f.y = gy - 24; f.invuln = 0; f.hitstun = 0; f.vx = 0; f.vy = 0; step(); if (f.pct > pct1 + 1e-9){ hits.push([k, +(f.pct - pct1).toFixed(2)]); pct1 = f.pct; } }
      ${STAGE(300, 1)}
      f.x = 70; f.y = gy - 100; f.invuln = 0; f.pct = 0;
      for (var j=0;j<20;j++){ f.x = 70; f.y = gy - 100; f.invuln = 0; f.vx = 0; f.vy = 0; step(); }
      var above = f.pct;
      ${STAGE(300, 1)}
      f.x = WW - 70; f.y = gy - 24; f.invuln = 0; f.pct = 0; f.vx = 0; step();
      var right = { pct: f.pct, vx: f.vx };
      var out = { first: first, again: hits, above: above, right: right, full: bossDmg(), gap: S4.saw.gap, frac: S4.saw.frac };
      summons = []; projectiles = []; return out; } finally { S4.saw.amp = amp0; } })()`);
    expect(r.first.pct, 'a fraction of a boss hit').toBeCloseTo(r.full * r.frac, 5);
    expect(r.frac).toBe(0.3);
    expect(r.first.vx, 'knocked away from the blade, off the beam toward the middle').toBeGreaterThan(3);
    expect(r.first.vy, 'and up').toBeLessThan(0);
    expect(r.first.hitstun).toBeGreaterThan(0);
    expect(r.again.map((h) => h[0]), 'bites once every 40 frames you stay').toEqual([39, 79]);
    expect(r.above, 'a hundred px up is clear of it').toBe(0);
    expect(r.right.pct, 'the blade at the other end is the same').toBeCloseTo(r.full * r.frac, 5);
    expect(r.right.vx, 'and knocks the other way').toBeLessThan(-3);
  });

  it('the sky reddens by phase and the lightning starts in phase 2 -- a bolt never closer than 6 s to the last, none at all in phase 1', () => {
    const r = W.eval(`(function(){ var out = {};
      ${[1, 2, 3].map((ph) => `{ ${STAGE(600, ph)}
        var bolts = [], last = null;
        for (var k=0;k<1500;k++){ f.x = 600; f.invuln = 9999; step(); var th = b._hz.thunder; if (th != null && th !== last){ bolts.push(th); last = th; } }
        out.p${ph} = { tint: b._hz.tint, bolts: bolts }; summons = []; projectiles = []; }`).join('\n')}
      return out; })()`);
    expect(r.p1.tint, 'phase 1: the clear blue sky').toBe(0);
    expect(r.p1.bolts, 'and not a bolt').toEqual([]);
    expect(r.p2.tint, 'phase 2: reddening, eased in, toward 0.55').toBeGreaterThan(0.5);
    expect(r.p2.tint).toBeLessThanOrEqual(0.55);
    expect(r.p3.tint, 'phase 3: toward full').toBeGreaterThan(0.9);
    expect(r.p3.tint).toBeLessThanOrEqual(1);
    for (const o of [r.p2, r.p3]) {
      expect(o.bolts.length, 'a few bolts in 25 s').toBeGreaterThanOrEqual(3);
      for (let i = 1; i < o.bolts.length; i++) expect(o.bolts[i] - o.bolts[i - 1], 'never closer than 6 s').toBeGreaterThanOrEqual(360);
      expect(o.bolts[0], 'the first not before 4 s').toBeGreaterThanOrEqual(240);
    }
  });

  it('a strip of quicksand slows whoever stands in it on the floor while it is live -- not before it opens, not once it has closed, not up in the air', () => {
    const r = W.eval(`(function(){ ${STAGE(600, 1)}
      var gy = groundY(), H = b._hz, t0 = hazardT, out = { in: [], out: [], air: [], before: [], after: [] };
      H.sand = [[300, 90, t0 + 20, t0 + 60]];
      for (var k=0;k<90;k++){
        var t = hazardT;
        f.x = 300; f.y = gy - 24; f.onground = true; f.vx = 0; f.vy = 0; f.invuln = 9999; step();
        var s = f.slowed || 0;
        (t < t0 + 19 ? out.before : (t < t0 + 59 ? out.in : out.after)).push(s);
      }
      f.slowed = 0; H.sand = [[300, 90, hazardT - 5, hazardT + 100]];
      for (var j=0;j<10;j++){ f.x = 300; f.y = gy - 120; f.onground = false; f.vx = 0; f.vy = 0; step(); out.air.push(f.slowed || 0); }
      f.slowed = 0;
      for (var q=0;q<10;q++){ f.x = 600; f.y = gy - 24; f.onground = true; f.vx = 0; f.vy = 0; step(); out.out.push(f.slowed || 0); }
      out.edge = (function(){ f.slowed = 0; H.sand = [[300, 90, hazardT - 5, hazardT + 100]]; f.x = 300 + 90 + f.r*0.3 - 1; f.y = gy - 24; f.onground = true; step(); var a = f.slowed || 0;
                                 f.slowed = 0; f.x = 300 + 90 + f.r*0.3 + 3; f.y = gy - 24; f.onground = true; step(); return [a, f.slowed || 0]; })();
      summons = []; projectiles = []; return out; })()`);
    expect(r.before.every((s) => s === 0), 'a strip that has not opened yet does nothing').toBe(true);
    expect(r.in.slice(1).every((s) => s > 0), 'live: slowed').toBe(true);
    expect(r.after.slice(7).every((s) => s === 0), 'closed: the slow wears off in a few frames').toBe(true);
    expect(r.air.every((s) => s === 0), 'the quicksand does not reach you up in the air').toBe(true);
    expect(r.out.every((s) => s === 0), 'nor outside it').toBe(true);
    expect(r.edge[0], 'at its edge (the strip\'s half-width and a third of your width)').toBeGreaterThan(0);
    expect(r.edge[1]).toBe(0);
  });

  it('SUPER DEATH TRAP! turns the big platform over: ten frames to turn, 150 over (nothing to stand on: whoever was on it falls), ten to turn back; the hazard keeps it', () => {
    const r = W.eval(`(function(){ ${STAGE(550, 3, false, true)}
      var gy = groundY(), pl = worldPlats[0], mid = pl.x + pl.w/2;
      f.x = mid; f.y = pl.y - 24; f.vx = 0; f.vy = 0; f.onground = true; f.invuln = 9999;
      var surf0 = surfaceBelow(mid, pl.y - 30);
      s4Flip(b); var started = JSON.stringify(b._hz.flip), again = (function(){ var h = b._hz.flip.slice(); s4Flip(b); return JSON.stringify(b._hz.flip) === JSON.stringify(h); })();
      var rots = [], fell = -1, rot180 = -1, back = -1, endAt = -1;
      for (var k=0;k<400;k++){
        f.x = mid; f.invuln = 9999; step();
        var rot = pl.rot || 0; rots.push(rot);
        if (rot === 180 && rot180 < 0) rot180 = k;
        if (rot > 0 && f.y > pl.y && fell < 0 && !f.onground) fell = k;
        if (rot180 >= 0 && rot === 0 && back < 0){ back = k; }
        if (!b._hz.flip && endAt < 0){ endAt = k; break; }
      }
      var out = { surf0: surf0, started: started, again: again, rot180: rot180, back: back, endAt: endAt, surfAfter: surfaceBelow(mid, pl.y - 30), platY: pl.y, gy: gy, rot: pl.rot || 0, T: S4.flip.turn, hold: S4.flip.hold,
                  mono: rots.slice(0, 12).every(function(v, i, a){ return i === 0 || v > a[i-1] || v === 180; }), fell: fell, fy: f.y };
      summons = []; projectiles = []; worldPlats = []; return out; })()`);
    expect(r.surf0, 'a platform before').toBeCloseTo(r.platY, 0);
    expect(JSON.parse(r.started)[0], 'it turns the big platform').toBeGreaterThan(300);
    expect(r.again, 'a second call does not restart a flip in progress').toBe(true);
    expect(r.rot180, 'over in ten frames').toBeLessThanOrEqual(r.T);
    expect(r.mono, 'turning steadily').toBe(true);
    expect(r.fell, 'whoever stood on it falls as soon as it turns').toBeGreaterThanOrEqual(0);
    expect(r.fell).toBeLessThan(10);
    expect(r.endAt, 'ten to turn, 150 over, ten back').toBeGreaterThanOrEqual(2 * r.T + r.hold - 2);
    expect(r.endAt).toBeLessThanOrEqual(2 * r.T + r.hold + 2);
    expect(r.rot, 'and it is flat again').toBe(0);
    expect(r.surfAfter, 'a platform once more').toBeCloseTo(r.platY, 0);
  });

  it('the hazard is his: with no boss standing it does nothing, and the arena\'s tint, blades and strips draw from his state alone', () => {
    const r = W.eval(`(function(){ ${STAGE(600, 2)}
      var H = b._hz; for (var k=0;k<30;k++){ f.x = 600; f.invuln = 9999; step(); }
      var snap = JSON.stringify(H);
      b.hp = 0; arenaHazardStep(b, f); arenaHazardStep(b, f);
      var same = JSON.stringify(b._hz) === snap;
      var out = { same: same, step: typeof arenaHazardOf('deathtrap').step, platformsOk: worldPlats.every(function(p){ return !p.rot; }) };
      summons = []; projectiles = []; return out; })()`);
    expect(r.same, 'a beaten boss\'s arena stops moving').toBe(true);
    expect(r.platformsOk).toBe(true);
  });
});

describe('his ending: the cage and the Fist Thingy', () => {
  // The Tile Divide: "MePhone4 snaps his fingers and the camera pans to a cage ... MePhone4S: 'No! MePhone, you don't understand! He's coming, MePhone! Listen to me,
  // he's co-' (gets punched into the cage by the Fist Thingy)." -- "Endings: 'All of them' -- every boss gets a short canon exit scene when beaten, no text."
  it('when he is beaten his shots go with him and the flipped platform turns back; a scene plays where he fell, holds the BOSS DOWN card 1.5 s, hurts nobody and says nothing', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1, false, true)}
      var st = setTimeout, timers = [], said = [], _b = banner, gy = groundY();
      setTimeout = function(fn, ms){ timers.push({ fn: fn, ms: ms }); return 0; };
      banner = function(t, m, k, l){ said.push([String(t), k || null]); return _b(t, m, k, l); };
      var _imp = impact, imps = [];
      try {
        BOSSRUSH.active = true;
        var mk = function(o){ var p = Object.assign({ owner:-2, ownerObj:{ team:-1, idx:-2 }, x:300, y:300, vx:0, vy:0, r:10, life:100, dmg:0, kb:0 }, o); projectiles.push(p); return p; };
        [[1, 'round'], [2, 'redcar'], [3, 's4crush'], [4, 'spike'], [6, 's4saw'], [7, 'lemon']].forEach(function(c){ mk({ s4: c[0], shape: c[1] }); });
        var other = mk({ x:5, y:5 });
        worldPlats[0].rot = 90; f._s4sawT = 999; f._carried = hazardT;
        var bx = b.x, by = b.y, bf = b.face, br = b.r; f.x = bx; f.y = by; f.pct = 0;
        b.hp = 0; bossRushCheck();
        var left = projectiles.filter(function(p){ return p.s4; });
        var scene = left.filter(function(p){ return p.shape === 's4end'; })[0], ghosts = left.filter(function(p){ return p.shape !== 's4end'; });
        var out = { s4Left: left.length, scene: !!scene, ghosts: ghosts.length, other: projectiles.indexOf(other) >= 0, rot: worldPlats[0].rot, sawT: f._s4sawT, carried: f._carried,
                    ms: timers.map(function(t){ return t.ms; }), boss: summons.filter(function(s){ return s.type === 'boss'; }).length, saidBoss: said.filter(function(s){ return s[1] === 'boss'; }).length };
        out.scene_ = scene ? { delay: scene.delay, et0: scene.et0, ex: Math.round(scene.ex), ey: Math.round(scene.ey), ef: scene.ef, er: scene.er, cd: scene.cd, y: scene.y, dmg: scene.dmg, r: scene.r } : null;
        out.want = [Math.round(bx), Math.round(by), bf, br, hazardT];
        out.ghosts_ = ghosts.map(function(g){ return { x: Math.round(g.x), vy: g.vy, delay: g.delay, warnY: g.warnY, shake: g.landImpact && g.landImpact.shake, team: g.ownerObj.team, dmg: g.dmg }; });
        var down = timers.slice().sort(function(a, b){ return a.ms - b.ms; })[0], run0 = running; running = true; if (down) down.fn(); running = run0;
        out.card = said.some(function(s){ return /^BOSS DOWN!/.test(s[0]) && s[1] === 'sys'; });
        // the scene runs its length and is gone, and nobody near it is touched
        impact = function(x, y, o){ imps.push([hazardT, Math.round(x), Math.round(y), o && o.shake]); return _imp(x, y, o); };
        var pct0 = f.pct, endAt = -1;
        for (var i=0;i<S4.end.total + 6;i++){ step(); f.x = bx; f.y = gy - 24; f.invuln = 0; if (endAt < 0 && !projectiles.some(function(p){ return p.s4; })) endAt = i; }
        out.endAt = endAt; out.pct = f.pct - pct0; out.imps = imps; out.total = S4.end.total; out.snap = S4.end.snap; out.glove = S4.end.glove; out.fly = S4.end.fly; out.WW = WW; out.ex = bx;
        return out;
      } finally { setTimeout = st; banner = _b; impact = _imp; BOSSRUSH.active = false; summons = []; projectiles = []; worldPlats = []; }
    })()`);
    expect(r.s4Left, 'his rounds, cars, crusher, spikes, prizes and lemons are swept; the scene and the two landings it throws are all that is left of his').toBe(3);
    expect(r.scene).toBe(true);
    expect(r.ghosts).toBe(2);
    expect(r.other, 'a shot that is not his own is not swept').toBe(true);
    expect(r.rot, 'the platform he turned over is turned back').toBe(0);
    expect(r.sawT, 'and no blade\'s grace outlives him').toBe(0);
    expect(r.carried).toBe(0);
    expect(r.boss, 'he is gone from the stage').toBe(0);
    expect(r.saidBoss, 'no words: not even a telegraph for an ending').toBe(0);
    expect(r.ms, 'the card 1.5 s late (the scene is the 1.5 s), the next boss 1.5 s after it').toEqual(expect.arrayContaining([1500, 3000]));
    expect(r.card, 'the BOSS DOWN card shows when the first timer runs').toBe(true);
    const s = r.scene_;
    expect([s.ex, s.ey, s.ef, s.er], 'the scene is where he fell, which way he faced, how big he was').toEqual([r.want[0], r.want[1], r.want[2], r.want[3]]);
    expect(s.et0, 'and it began when he fell').toBe(r.want[4]);
    expect(s.cd, 'the cage comes on the side toward the middle: he fell on the right').toBe(-1);
    expect(s.delay, 'the scene lasts its length and a frame').toBe(r.total + 1);
    expect(s.y, 'the shot is far above the screen: it only carries the scene').toBeLessThan(-1000);
    expect(s.dmg).toBe(0);
    expect(r.ghosts_.every((g) => g.team === 0 && g.dmg === 0 && g.vy === 30), 'the two landings are inert, nobody\'s team, and hurt nobody').toBe(true);
    expect(r.ghosts_.map((g) => g.shake), 'the glove\'s landing 12, the cage door\'s 9').toEqual([12, 9]);
    expect(r.ghosts_[0].x, 'the glove lands on him').toBe(r.want[0]);
    expect(r.ghosts_[1].x, 'the door slams at the cage').toBe(Math.max(130, Math.min(r.WW - 130, r.want[0] + s.cd * 230)));
    expect(r.endAt, 'the scene is over at its end').toBeGreaterThanOrEqual(r.total - 1);
    expect(r.endAt).toBeLessThanOrEqual(r.total + 2);
    const sh = r.imps.filter((i) => i[3] === 12 || i[3] === 9);
    expect(sh.map((i) => i[3]), 'the glove lands, then the door').toEqual([12, 9]);
    expect(sh[0][0], 'the glove at 34 frames').toBe(r.glove);
    expect(sh[1][0], 'the door at 60').toBe(r.glove + r.fly);
    expect(r.pct, 'a scene hurts nobody').toBe(0);
  });

  it('his ending has no line of text and holds the card back as the show does, 1.5 s', () => {
    const r = W.eval(`({ ending: BOSS_ENDINGS.mephone4s, others: Object.keys(BOSS_ENDINGS), hold: S4.end.hold })`);
    expect(r.ending.holdMs).toBe(1500);
    expect(r.hold).toBe(1500);
    expect(r.ending.line, 'no words').toBeUndefined();
  });
});

describe('a netcode client sees his place, his moves and his ending', () => {
  it('the trap\'s state, his turn and every shot of his cross the snapshot whole, and draw on the client', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow();
      BOSS_ARENA = 'deathtrap'; var gy = groundY(), t = hazardT;
      var hz = { sand:[[300, 90, t - 5, t + 100], [800, 120, t + 20, t + 150]], saw:[70, 1030], flip:[342, t - 20], tint:0.55, thunder:t - 3, nextBolt:t + 300 };
      var s4 = { k:'pop', go:true, st:'dig', t:3, ph:3, id:7, n:3, i:1, sx:500, x:420, lock:1 };
      summons = [{ type:'boss', name:'MePhone4S', color:'#c8102e', r:85, sprite:'mephone4s', x:500, y:300, hp:80, maxHp:260, face:-1, flash:0, homeX:500, _rage:false, _tel:10, _telKind:'s4popup',
                   _bossRush:true, attack:'mephone4s', _phase:3, _hz:hz, _s4:s4, _aimX:410, _aimY:560, _aimLock:true }];
      var own = { owner:-2, ownerObj:{ team:-1, idx:-2 } };
      projectiles = [Object.assign({ x:300, y:400, vx:-12, vy:3, r:8, color:'#ff3a2a', bossAtk:9, life:20, beamShot:true, s4:1, delay:9, s4fz:1 }, own),
                     Object.assign({ x:40, y:566, vx:14, vy:0, r:26, color:'#d01818', shape:'redcar', bossAtk:10, life:80, delay:20, s4:2 }, own),
                     Object.assign({ x:300, y:100, vx:0, vy:34, r:34, color:'#e82010', shape:'s4crush', bossAtk:11, life:50, delay:12, warn:12, warnX:300, warnY:gy, s4:3 }, own),
                     Object.assign({ x:9, y:-5000, vx:0, vy:0, r:0, color:'#c8102e', bossAtk:0, life:1, delay:90, shape:'s4end', s4:5, et0:t - 10, ex:420, ey:400, ef:-1, er:85, cd:1 }, own)];
      var snap = JSON.parse(JSON.stringify(serializeState()));
      summons = []; projectiles = []; BOSS_ARENA = null;
      applySnapshot(snap);
      var err = null, drawn = null;
      try { drawArenaDecor(BOSS_ARENA); drawArenaHazard('under'); drawArenaHazard('over'); summons.forEach(drawSummon); summons.forEach(function(s){ if (s.attack === 'mephone4s') s4DrawFx(s); }); projectiles.forEach(drawProjectile); drawBossBar(); draw(); drawn = true; } catch(e){ err = e.message + ' ' + (e.stack||'').split('\\n')[1]; }
      var by = function(k){ return projectiles.find(function(p){ return p.s4 === k; }); };
      var pick = function(p, ks){ var o = {}; ks.forEach(function(k){ o[k] = p ? p[k] : undefined; }); return o; };
      return { err: err, drawn: drawn, arena: BOSS_ARENA, hz: JSON.stringify(summons[0]._hz), want: JSON.stringify(hz), s4: JSON.stringify(summons[0]._s4), wantS4: JSON.stringify(s4),
               boss: { attack: summons[0].attack, tel: summons[0]._tel, kind: summons[0]._telKind, phase: summons[0]._phase, aim: [summons[0]._aimX, summons[0]._aimY, summons[0]._aimLock] },
               round: pick(by(1), ['s4', 'delay', 's4fz', 'vx', 'vy']), car: pick(by(2), ['s4', 'delay', 'shape', 'vx']), crush: pick(by(3), ['s4', 'delay', 'warn', 'warnX', 'warnY', 'shape']),
               end: pick(by(5), ['s4', 'delay', 'shape', 'et0', 'ex', 'ey', 'ef', 'er', 'cd']), t: t, gy: gy, telLen: bossTelLen(summons[0]) };
    })()`);
    expect(r.err).toBe(null);
    expect(r.arena, 'the client draws the Super Death Trap').toBe('deathtrap');
    expect(r.hz, 'the strips, the blades, the flip, the sky: every field arrives as it was sent').toBe(r.want);
    expect(r.s4, 'his turn arrives as it was').toBe(r.wantS4);
    expect(r.boss).toEqual({ attack: 'mephone4s', tel: 10, kind: 's4popup', phase: 3, aim: [410, 560, true] });
    expect(r.telLen, 'the client\'s wind-up ring runs over the length of the move he is making, not the default').toBe(46);
    expect(r.round, 'a frozen round: what it is, how long it holds, that it is frozen').toMatchObject({ s4: 1, delay: 9, s4fz: 1 });
    expect(r.car, 'a car revving: what it is, how long until it goes').toMatchObject({ s4: 2, delay: 20, shape: 'redcar', vx: 14 });
    expect(r.crush, 'the crusher\'s shadow: where, and for how long').toMatchObject({ s4: 3, delay: 12, warn: 12, warnX: 300, shape: 's4crush' });
    expect(r.crush.warnY).toBeCloseTo(r.gy, 0);
    expect(r.end, 'and so does the ending: where, when, which way, how big, which side the cage is').toEqual({ s4: 5, delay: 90, shape: 's4end', et0: r.t - 10, ex: 420, ey: 400, ef: -1, er: 85, cd: 1 });
  });
});

describe('no words, no other show, and the art is wired and credited', () => {
  // Every draw of his place, him and everything he throws, on a canvas that records what it is asked to do: not one word.
  function bootRecording(seed = 7) {
    const html = readFileSync('artifacts/V1/index.html', 'utf8'), rec = [], grad = { addColorStop() {} };
    const dom = new JSDOM(html, {
      url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
      beforeParse(window) {
        window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
          get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 }) : p === 'canvas' ? { width: 1100, height: 720 } : p === 'getImageData' ? () => ({ data: [] })
            : (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createPattern') ? () => grad
            : (...args) => {
              // what a real canvas throws on: a negative radius (the car's bubbles in the sand once had one, left of x = 0, and took the frame down)
              if (p === 'arc' && args[2] < 0) throw new RangeError('arc: negative radius ' + args[2]);
              if (p === 'ellipse' && (args[2] < 0 || args[3] < 0)) throw new RangeError('ellipse: negative radius ' + args[2] + ', ' + args[3]);
              rec.push({ op: p, args });
            }),
          set: (_t, p, v) => { rec.push({ op: 'set:' + String(p), args: [v] }); return true; },
        });
        window.Math.random = mulberry32(seed); window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {};
      },
    });
    return { w: dom.window, rec };
  }

  it('draws his whole place, him in every state and everything he throws without a word of text', () => {
    const { w, rec } = bootRecording();
    w.eval("SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow(); running = false;");   // (the match's own HUD writes the fighters' names: not his place's business)
    const n0 = rec.length;
    const err = w.eval(`(function(){
      try {
        BOSS_ARENA = 'deathtrap';
        var gy = groundY(), t = hazardT + 100; hazardT = t;
        worldPlats = platRectsSmall();
        var hz = { sand:[[300, 90, t - 5, t + 100], [800, 120, t + 20, t + 150]], saw:[70, 1030], flip:[342, t - 20], tint:0.55, thunder:t - 3, nextBolt:t + 300 };
        var base = { type:'boss', name:'MePhone4S', color:'#c8102e', sprite:'mephone4s', r:85, x:500, y:gy-85, face:-1, hp:100, maxHp:260, _tel:0, _telKind:null, _phase:3, _rage:false, flash:0, homeX:500, attack:'mephone4s', _bossRush:true, _hz:hz };
        var states = [{}, { _tel:30, _telKind:'mephone4s', _aimX:300, _aimY:gy-24, _aimLock:false, _s4:{ k:'gun' } }, { _tel:8, _telKind:'mephone4s', _aimX:900, _aimY:300, _aimLock:true, face:1, _s4:{ k:'gun' } },
          { _tel:30, _telKind:'s4vista', _s4Vista:true, _aimX:300, _aimY:gy, _aimLock:false, _s4:{ k:'vista' } }, { _tel:6, _telKind:'s4vista', _s4Vista:true, _aimX:300, _aimY:gy, _aimLock:true, _s4:{ k:'vista' } },
          { _tel:36, _telKind:'s4prizes', _s4:{ k:'prizes' } }, { _tel:12, _telKind:'s4prizes', _s4:{ k:'prizes' } }, { _tel:30, _telKind:'s4car', _s4:{ k:'car', from:1 } }, { _tel:30, _telKind:'s4car', _s4:{ k:'car', from:-1 } },
          { _tel:30, _telKind:'s4popup', y:gy + 20, _s4:{ k:'pop', sx:500, x:300, lock:0, ph:2 } }, { _tel:4, _telKind:'s4popup', y:gy + 80, _s4:{ k:'pop', sx:500, x:300, lock:1, ph:2 } },
          { _tel:30, _telKind:'s4shove', _s4:{ k:'shove', x:300, dir:-1, ph:2, lock:0 } }, { _tel:4, _telKind:'s4shove', face:1, _s4:{ k:'shove', x:900, dir:1, ph:3, lock:1 } },
          { y:gy + 400, _s4:{ k:'pop', go:true, st:'dig', sx:500, x:300, t:3, ph:3, lock:1 } }, { _s4:{ k:'pop', go:true, st:'rise', sx:500, x:300, t:3, ph:3 } }, { _s4:{ k:'pop', go:true, st:'fall', sx:500, x:300, t:3, ph:3 } },
          { _s4:{ k:'pop', go:true, st:'stand', sx:500, x:300, t:3, ph:3 } }, { _s4:{ k:'pop', go:true, st:'sink', sx:500, x:300, t:3, ph:3, beat:1 } },
          { _s4:{ k:'shove', go:true, st:'run', dir:-1, x:300, end:240, cx:120, hw:90, ph:1, t:3, spd:15 } }, { _s4:{ k:'shove', go:true, st:'tel2', dir:1, x:700, ph:3, t:3, lock:0 } },
          { _s4:{ k:'prizes', go:true, t:5, n:2, last:32 } }, { _s4:{ k:'vista', go:true, t:5, ax:300, ay:gy, n:2, last:18 } }, { _s4:{ k:'car', go:true, st:'away', t:10, from:1 }, x:-120 },
          { _tel:90, _telKind:'s4vista', _s4Vista:true, _aimX:300, _aimY:gy, _s4:{ k:'vista' } }, { _tel:90, _telKind:'s4prizes', _s4:{ k:'prizes' } }, { _tel:90, _telKind:'s4car', _s4:{ k:'car', from:1 } },
          { _tel:90, _telKind:'s4popup', _s4:{ k:'pop', sx:500, x:300, lock:0, ph:2 } },
          { flash:6 }, { hp:50, _phase:2, _hz:Object.assign({}, hz, { tint:0.2, flip:null, sand:null }) }, { _hz:{} }, { _s4:{ k:'enter', go:true }, y:-100 }];
        states.forEach(function(st){ summons = [Object.assign({}, base, st)]; ctx.save(); drawSummon(summons[0]); ctx.restore(); s4DrawFx(summons[0]); });
        summons = [Object.assign({}, base)]; drawArenaDecor('deathtrap'); drawArenaHazard('under'); drawArenaHazard('over');
        [0, 0.55, 1].forEach(function(tint){ summons = [Object.assign({}, base, { _hz:Object.assign({}, hz, { tint:tint, thunder:t - 2 }) })]; drawArenaDecor('deathtrap'); drawArenaHazard('under'); });
        summons = [Object.assign({}, base, { _phase:1, _hz:{} })]; drawArenaDecor('deathtrap'); drawArenaHazard('under'); drawArenaHazard('over');
        summons = []; drawArenaDecor('deathtrap'); drawArenaHazard('under'); drawArenaHazard('over');   // between bosses
        arenaGround().pattern(ctx, gy, -20, WW + 20, WH + H, arenaGround());
        // cars driving in the sand at either edge and in the middle: their bubbles run out behind them, off the left edge too
        [[40, 14], [1060, -14], [300, 14], [-30, 14], [0.5, 14], [1130, -14]].forEach(function(c){
          projectiles = [Object.assign({ owner:-2, ownerObj:{ team:-1, idx:-2 }, x:c[0], y:gy - 24, vx:c[1], vy:0, r:26, shape:'redcar', s4:2, delay:0, life:80, color:'#d01818' })];
          arenaGround().pattern(ctx, gy, -20, WW + 20, WH + H, arenaGround()); });
        projectiles = [];
        worldPlats[0].rot = 180; summons = [Object.assign({}, base)]; drawArenaHazard('under'); worldPlats[0].rot = 90; drawArenaHazard('under'); worldPlats = [];
        var own = { owner:-2, ownerObj:{ team:-1, idx:-2 } };
        [{ s4:1, beamShot:true, vx:-12, vy:3, r:8, color:'#ff3a2a' }, { s4:1, beamShot:true, vx:-12, vy:3, r:8, color:'#ff3a2a', s4fz:1, delay:10 },
         { s4:2, shape:'redcar', vx:14, vy:0, r:26, color:'#d01818', delay:20 }, { s4:2, shape:'redcar', vx:-14, vy:0, r:26, color:'#d01818', delay:0 }, { s4:2, shape:'redcar', vx:14, vy:0, r:26, color:'#d01818', delay:70 },
         { s4:3, shape:'s4crush', vx:0, vy:34, r:34, color:'#e82010', warn:20, warnX:300, warnY:gy, delay:20, x:300, y:-40 }, { s4:3, shape:'s4crush', vx:0, vy:34, r:34, color:'#e82010', warn:0, warnX:300, warnY:gy, delay:0, x:300, y:300 },
         { s4:4, shape:'spike', vx:0.6, vy:-7, r:10, color:'#c8c8d0', delay:20, warn:20, warnX:300, warnY:446 }, { s4:6, shape:'s4saw', vx:2, vy:-3, r:14, color:'#b8c0c8' }, { s4:6, shape:'s4lolli', vx:-12, vy:0, r:13, color:'#e8202a' },
         { s4:7, shape:'lemon', vx:-3, vy:-5, r:20, color:'#f2e23a', warnX:300, warnY:gy }, { s4:5, delay:5, vx:0, vy:30, r:2, color:'#c8102e' }].forEach(function(p){
          drawProjectile(Object.assign({ x:300, y:300 }, own, p)); drawProjectile(Object.assign({ x:300, y:300 }, own, p, { trap:true })); });
        ['s4gun', 's4saw', 's4lolli', 'redcar'].forEach(function(sh){ drawProjectile(Object.assign({ x:300, y:300, vx:8, vy:2, r:14, color:'#888' }, own, { shape:sh })); });
        [0, 10, 34, 40, 60, 80, 95].forEach(function(u){ [1, -1].forEach(function(cd){ drawProjectile(Object.assign({ x:9, y:-5000, vx:0, vy:0, r:0, shape:'s4end', s4:5, et0:t - u, ex:420, ey:400, ef:-1, er:85, cd:cd, color:'#c8102e' }, own)); }); });
        return null;
      } catch(e){ return e.message + ' ' + (e.stack||'').split('\\n')[1]; }
    })()`);
    expect(err).toBe(null);
    const drawn = rec.slice(n0);
    expect(drawn.length, 'the recording is live').toBeGreaterThan(1000);
    expect(drawn.filter((r) => r.op === 'fillText' || r.op === 'strokeText').length, 'not a word on the canvas').toBe(0);
  });

  const FNS = ['s4Hz', 's4PhT', 's4Live', 's4Floor', 's4Hand', 's4Lob', 's4Mark', 's4BeginTelegraph', 's4TrackSight', 's4Muzzle', 's4Gun', 's4CarGo', 's4CarStep', 's4RunQueue', 's4Event', 's4PrizesGo', 's4PairAim',
    's4ThrowSaw', 's4ThrowLolli', 's4Mouth', 's4VistaGo', 's4ThrowLemon', 's4DeathTrap', 's4Crusher', 's4Flip', 's4Done', 's4Walk', 's4Windup', 's4Move', 's4PopGo', 's4PopStart', 's4PopHit', 's4PopStep',
    's4ShoveGo', 's4ShovePlan', 's4ShoveRun', 's4ShoveStep', 's4Step', 's4Tick', 's4TelLen', 's4Spawn', 's4PhaseBeat', 's4HazStep', 's4HazDraw', 's4DrawGirder', 's4DrawBlade', 's4GroundPattern', 's4Boss',
    's4DrawDecor', 's4DrawSand', 's4DrawShot', 's4DrawFrozen', 's4DrawCar', 's4DrawCrusher', 's4DrawProp', 's4Beat', 's4PrizeProps', 's4DrawFx', 's4SandBlob', 's4Bubble', 's4DrawPop', 's4DrawShove', 's4DrawVista',
    's4EndSweep', 's4EndBegin', 's4Sprite', 's4DrawCage', 's4DrawEnd'];
  it("nothing of his says a word or names anyone from the OSC: his code has no banner but the trap's own name, no text drawing, no OJ, Suitcase, Cabby or The Floor", () => {
    const src = W.eval(`[${FNS.join(',')}].map(String).concat([JSON.stringify(S4), JSON.stringify(BOSS_EXTRA['MePhone4S']), JSON.stringify(BOSS_MOVE_NAME), bossPhaseName({ attack:'mephone4s' }, 2),
      bossPhaseName({ attack:'mephone4s' }, 3), bossTelName({ attack:'mephone4s' }), String(PROJ_SHAPE.s4gun.draw), String(PROJ_SHAPE.s4saw.draw), String(PROJ_SHAPE.s4lolli.draw), String(PROJ_SHAPE.redcar.draw)]).join('\\n')`);
    expect(src).not.toMatch(/\bOJ\b|Suitcase|Cabby/i);
    expect(src, 'The Floor, the contestant (the stage\'s floor is no one)').not.toMatch(/The Floor/);
    expect((src.match(/banner\(/g) || []).length, 'one banner in all of it: the trap going live').toBe(1);
    expect(src, 'and it is a boss telegraph, which no-move-popups allows').toMatch(/banner\("SUPER DEATH TRAP!", 800, 'boss'\)/);
    expect(src, 'no text on the canvas').not.toMatch(/fillText|strokeText/);
    // and every line of the game or the credits that is about him
    const lines = [readFileSync('artifacts/V1/index.html', 'utf8'), readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8')]
      .join('\n').split('\n').filter((l) => /MePhone4S|mephone4s|\bS4\b|s4[A-Z]/.test(l));
    expect(lines.length).toBeGreaterThan(100);
    expect(lines.filter((l) => /\bOJ\b|Suitcase|Cabby|The Floor/.test(l))).toEqual([]);
  });

  it("his props wear the show's art -- the pistol, the chainsaw, the lollipop and the car, each cut out of a frame of the show -- every file a real PNG at projectile size, on the record and credited; the lemon is the lemon it was", () => {
    const reg = W.eval(`(function(){ var o = {}; ['s4gun', 's4saw', 's4lolli', 'redcar', 'lemon'].forEach(function(k){ o[k] = { e: ATTACK_SPRITES[k], glyph: !!PROJ_SHAPE[k] }; }); return o; })()`);
    const manifest = JSON.parse(readFileSync('scripts/attack-sprite-manifest.json', 'utf8'));
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const picks = readFileSync('scripts/fetch-attack-sprites.mjs', 'utf8');
    const WANT = { s4gun: 'S1RE8 MePhone4S pulls out his gun.png', s4saw: 'Screen shot 2012-09-02 at 12.25.17 PM.png', s4lolli: 'Screen shot 2012-09-02 at 12.25.17 PM.png', redcar: "MePhone4S's Car.jpg" };
    for (const [k, wikiFile] of Object.entries(WANT)) {
      const e = reg[k].e, file = 'artifacts/V1/' + e.src;
      expect(e.src, k).toBe('assets/sprites/attacks/' + k + '.png');
      expect(existsSync(file), file).toBe(true);
      const png = PNG.sync.read(readFileSync(file));
      expect(Math.max(png.width, png.height), k + ' at projectile size').toBeLessThanOrEqual(128);
      expect(e.h, k + ' is drawn no taller than a boss shot').toBeLessThanOrEqual(44);
      const clear = (() => { let c = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) c++; return c / (png.width * png.height); })();
      expect(clear, k + ' is cut out, not a screenshot').toBeGreaterThan(0.12);
      expect(reg[k].glyph, k + ' has a drawn glyph to show until it loads').toBe(true);
      const m = manifest[k];
      expect(m, k + ' is on the record').toMatchObject({ file: k + '.png', kits: [k], srcTitle: wikiFile, wiki: 'ii', key: 'prop', width: png.width, height: png.height });
      expect(m.source).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/inanimateinsanity\/images\//);
      expect(credits, k + ' is credited with its exact source').toContain('(' + k + '.png)');
      expect(credits).toContain(m.source);
      expect(picks, k + ' has its pick in his slot').toMatch(new RegExp(k + ":\\s*\\{ who: '(MePhone4S)"));
    }
    expect(reg.lemon.e.src, 'the lemon is the lemon the other bosses throw').toBe('assets/sprites/attacks/lemon.png');
    expect(Object.keys(manifest).length, 'four more on the record than before him').toBeGreaterThanOrEqual(119);
    expect(readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8')).toMatch(/MePhone4S \(Boss 8\), his Super Death Trap over the quicksand/);
  });

  it('his art is the II wiki render (File:Yeyeye.png), transparent, credited, flipped as measured, with a drawn fallback', () => {
    const src = W.eval('BOSS_SPRITE_SRC.mephone4s');
    expect(src).toBe('assets/sprites/mephone4s.png');
    const file = 'artifacts/V1/' + src;
    expect(existsSync(file)).toBe(true);
    const png = PNG.sync.read(readFileSync(file));
    expect([png.width, png.height]).toEqual([135, 200]);
    const alpha = (x, y) => png.data[(y * png.width + x) * 4 + 3];
    expect([alpha(0, 0), alpha(134, 0), alpha(0, 199), alpha(134, 199)], 'transparent, not a sticker').toEqual([0, 0, 0, 0]);
    // every boss render fetched from the II wiki is flipped exactly as fetch-sprites measured it
    const man = JSON.parse(readFileSync('scripts/sprite-manifest-inanimateinsanity.json', 'utf8'));
    expect(man.MePhone4S).toMatchObject({ ok: true, file: 'mephone4s.png', source: expect.stringContaining('/Yeyeye.png/') });
    const bossFlips = W.eval(`(function(){ var o = {}; for (var k in BOSS_SPRITE_SRC) o[BOSS_SPRITE_SRC[k].split('/').pop()] = !!BOSS_SPRITE_FLIP[k]; return o; })()`);
    for (const row of Object.values(man)) if (row.ok && row.file in bossFlips) expect(bossFlips[row.file], row.name).toBe(!!row.flip);
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    expect(credits).toMatch(/\| MePhone4S \| `mephone4s\.png` \| https:\/\/static\.wikia\.nocookie\.net\/inanimateinsanity\/images\/8\/8a\/Yeyeye\.png/);
    expect(W.eval(`String(drawBossSprite).indexOf('case "mephone4s"') >= 0`)).toBe(true);
  });
});

describe('the item version', () => {
  it('an item MePhone4S never throws his second moves; an item Announcer still throws his own', () => {
    const r = W.eval(`(function(){
      var run = function(name){ var s = { type:'boss', name:name, color:'#fff', x:550, y:300, r:70, hp:200, vx:0, vy:0, face:1, _atkTimer:1, _tel:0 };
        var out = []; for (var i=0;i<4;i++){ s._atkTimer = 1; s._tel = 0; updateBossAttack(s, null); out.push(String(s._telKind)); } return out; };
      return { s4: run('MePhone4S'), ann: run('Announcer') };
    })()`);
    expect(r.s4).toEqual(['undefined', 'undefined', 'undefined', 'undefined']);
    expect(r.ann, 'his own second moves now: the laser, then the acid (boss overhaul, Round 9)').toEqual(['undefined', 'annlaser', 'undefined', 'annacid']);
  });
});
