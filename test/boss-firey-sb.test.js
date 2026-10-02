import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { JSDOM } from 'jsdom';
import { bootMonolith } from './helpers/smash-golden.js';
import { loadMonolith } from './helpers/load-monolith.js';
import { mulberry32 } from './helpers/prng.js';

// FIREY SPEAKER BOX, REBUILT (the boss overhaul, 2026-09-29: boss-overhaul-decisions.md, boss-plan-early.md section 5).
// The owner CUT his old FIRE WALL! / RAGE FLAMES! signature -- "the owner cut FIRE WALL! for THE TLC NEEDS TO BE FIXED!" (Round 9:
// "hops; replaces FIRE WALL!, which is CUT -- the owner did not keep the signature here") -- so he has four attacks, all canon:
//   ROCKET BOARD!  "he has a red hoverboard with grey supporters that shoot out fire, similar to a rocket" (Firey Speaker Box, BFDIA 5c);
//                  phase 3 "And I'm his clone!" (Hurtful!/Transcript)
//   FURNACE!       "Well, I just need some more metal to fix it and... you guys are... metal, so... yeah..." / "[The platform pushes
//                  Flower, Leafy, and Spongy into the furnace ...]" (Hurtful!/Transcript); the Metal Furnace
//   YOU MUST!      "YOU MUST!!!" / "Pin's limbs are removed by mechanical hands from the Speaker Box" (Get in the Van/Transcript)
//   THE TLC NEEDS TO BE FIXED!  "(Jumping on the TLC) The Tiny. Loser. Chamber. Needs. To be. Fixed!" (Hurtful!/Transcript)
// in his own volcano ("That means we're going to escape a volcano!", Don't Pierce My Flesh): geysers, magma edges with the Fire
// Monster, the eruption's wave -- with the owner's rule, verbatim: "if it makes sense for a hazard, reduce boss difficulty and add
// a hazard." Difficulty: "Harder, same damage". His ending: "broken into 7 pieces" (Firey Speaker Box; Questions Answered).

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// The scenario library, evaluated in the page: setup(x, ph) puts a still Firey at (x) on the floor against Firey Speaker Box,
// spawned the way the gauntlet spawns him, then settles him (the entrance over, floating at his hover height, x=700, no move
// running, his attack timer parked) and, from phase 2, drops his HP into that phase. The arena is Boss Rush's own (Goiky's floor
// and its one pad). run(n, x, y) steps n frames holding the fighter where he stands, on the floor or at height y.
const LIB = `
  var f, b, gy;
  function setup(x, ph){
    SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
    BOSSRUSH = { active:false, bossIdx:BOSS_ROSTER.findIndex(function(r){ return r.name==='Firey Speaker Box'; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
    stage = STAGES.find(function(s){ return s.id==='goiky'; }); worldPlats = platRectsSmall();
    summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; impactFxClear();
    f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), x, groundY()-24, 0);
    f.team=0; f.controller='still'; f.stocks=99; fighters=[f];
    spawnBossRushBoss();
    b = summons.find(function(s){ return s.type==='boss'; });
    gy = groundY();
    b._atkTimer = 1e9; b._fs = null; b.x = 700; b.y = gy - b.r - FSB.hoverH; b.vx = 0; b.vy = 0;
    if (ph > 1){ b.hp = b.maxHp*(ph === 2 ? 0.5 : 0.2); updateBossAttack(b, f); b._fs = null; b._fsQ = 0; b._fsb.q = 0; b._hz = {}; projectiles = []; }
    step(); f.pct = 0; f.invuln = 0; b._fs = null;
  }
  function run(n, x, y){ for (var i=0;i<n;i++){ step(); if (x != null){ f.x = x; f.y = (y != null ? y : gy - 24); f.vx = 0; f.vy = 0; f.invuln = 0; } } }
  // the wind-up of the move asked for. The owner, Round 17: "make the attacks based on fighter position." -- his turns are no longer a fixed cycle, so a test forces the move it measures
  // (the arguments are the old cycle's, kept for the call sites): 0,0 the board, 1,0 FURNACE!, 0,1 the TLC, 3,0 YOU MUST!
  function kindOf(moveN, sig){ return moveN === 1 ? 'furnace' : (moveN === 3 ? 'youmust' : (sig === 1 ? 'tlc' : 'rocketboard')); }
  function wind(moveN, sig){ b._pickForce = kindOf(moveN, sig); b._atkLive = null; b._atkTimer = 1; b._tel = 0; step(); }
`;
// A bare Firey Speaker Box for driving the engine's turn-taking.
const S = (o = '') => `{ name:'Firey Speaker Box', attack:'firewall', x:700, y:400, r:85, hp:100, maxHp:100, _phase:1, _atkTimer:1, _tel:0,
  color:'#d0402a', face:-1, homeX:700, stationary:false, vx:0, vy:0 ${o ? ',' + o : ''} }`;
const EV = (code) => W.eval(`(function(){ ${LIB} ${code} })()`);

describe('Firey Speaker Box takes his four attacks', () => {
  it('is Boss 3 in the volcano, with the same body and HP, four moves of his own, and none of the shared ones', () => {
    const r = W.eval(`(function(){
      var i = BOSS_ROSTER.findIndex(function(b){ return b.name==='Firey Speaker Box'; });
      return { i: i, row: BOSS_ROSTER[i], before: BOSS_ROSTER[i-1].name, after: BOSS_ROSTER[i+1].name, extra: BOSS_EXTRA['Firey Speaker Box'],
               moves: ['rocketboard','furnace','youmust','tlc'].map(function(k){ return typeof BOSS_MOVES[k]; }),
               names: [BOSS_MOVE_NAME.furnace, BOSS_MOVE_NAME.youmust], p2: bossPhaseName({ attack:'firewall' }, 2), p3: bossPhaseName({ attack:'firewall' }, 3),
               rushOnly: ['furnace','youmust'].map(function(k){ return BOSS_RUSH_ONLY.has(k); }), sky: BOSS_ARENA_SKY.volcano, ground: typeof BOSS_ARENA_GROUND.volcano.pattern,
               hazard: [typeof BOSS_ARENA_HAZARD.volcano.step, typeof BOSS_ARENA_HAZARD.volcano.draw], ending: Object.keys(BOSS_ENDINGS.firewall) };
    })()`);
    expect(r.row).toEqual({ name: 'Firey Speaker Box', color: '#d0402a', hp: 215, big: 2.5, attack: 'firewall', arena: 'volcano', stationary: false, sprite: 'speakerfirey' });
    expect(r.i, 'Boss 3').toBe(2);
    expect([r.before, r.after]).toEqual(['Puffball Speaker Box', 'The Bug Swarm']);
    // the second moves are his own; INCOMING! and GROUND POUND!, the shared shapes he used to throw, are not his any more
    expect(r.extra).toEqual(['furnace', 'youmust']);
    expect(r.moves).toEqual(['function', 'function', 'function', 'function']);
    expect(r.names).toEqual(['FURNACE!', 'YOU MUST!']);
    expect(r.rushOnly, 'an item version of him never throws them').toEqual([true, true]);
    // his phases keep the plan's names: "Flame Surge" and "RAGE MODE"
    expect([r.p2, r.p3]).toEqual(['Flame Surge', 'RAGE MODE']);
    expect(r.sky).toHaveLength(2);
    expect(r.ground).toBe('function');
    expect(r.hazard).toEqual(['function', 'function']);
    expect(r.ending).toEqual(['sweep', 'begin', 'holdMs']);
  });

  // The owner, 2026-10-01 (Round 17): "make the attacks based on fighter position. if there is an attack that punishes being close, then they should use it more when ppl are close." -- "Position
  // picks all (Recommended)". His turns were board, FURNACE!, TLC, YOU MUST! in a fixed cycle; now each of the four is a move the picker draws (ROCKET BOARD! and THE TLC are two moves, not the
  // signature's two forms), none twice in a row, and every one comes up. Each is still named as the banner says.
  it('draws his turns from his four -- ROCKET BOARD!, THE TLC NEEDS TO BE FIXED!, FURNACE!, YOU MUST! -- each named as the banner says, none twice in a row, every one in twelve turns; FIRE WALL! and RAGE FLAMES! are gone', () => {
    const r = W.eval(`(function(){
      var s = ${S()}, kinds = [], names = [];
      for (var i=0;i<12;i++){ s._atkTimer = 1; s._tel = 0; s._atkLive = null; updateBossAttack(s, null); kinds.push(s._telKind); names.push(bossTelName(s)); }
      var rage = ${S('_phase:3, _rage:true, _fsKind:"rocketboard"')};
      return { kinds: kinds, names: names, rage: bossTelName(rage) };
    })()`);
    const NAME = { rocketboard: 'ROCKET BOARD!', tlc: 'THE TLC NEEDS TO BE FIXED!', furnace: 'FURNACE!', youmust: 'YOU MUST!' };
    expect(r.kinds.every((k) => NAME[k]), `only his four: ${r.kinds}`).toBe(true);
    // "(Jumping on the TLC) The Tiny. Loser. Chamber. Needs. To be. Fixed!" -- the banner is the attack's name, in capitals
    expect(r.names).toEqual(r.kinds.map((k) => NAME[k]));
    expect(r.kinds.some((k, i) => i > 0 && k === r.kinds[i - 1]), `never the same move twice in a row: ${r.kinds}`).toBe(false);
    expect(new Set(r.kinds).size, `all four come up in twelve turns: ${r.kinds}`).toBe(4);
    expect(r.rage, 'the rage banner is cut with the signature').not.toMatch(/RAGE FLAMES|FIRE WALL/);
  });

  it('harder, same damage, and the volcano does part of the work: longer gaps than the usual 100/72/52, no wind-up under the usual 36', () => {
    const r = W.eval(`(function(){
      var gaps = [1,2,3].map(function(p){ return bossAtkGap({ attack:'firewall', _phase:p }); }), tels = [1,2,3].map(function(p){ return bossTelLen({ attack:'firewall', _phase:p }); });
      return { gaps: gaps, tels: tels, table: FSB, dmg: BOSS_DMG_BASE };
    })()`);
    // "bosses should attack a bit slower" (the owner, 2026-09-30): his own 112 / 92 / 76 (FSB.gaps) times BOSS_PACE (1.2)
    expect(r.gaps).toEqual([134, 110, 91]);
    r.gaps.forEach((g, i) => expect(g, `phase ${i + 1}'s gap`).toBeGreaterThan([100, 72, 52][i]));
    expect(r.tels).toEqual([44, 40, 36]);
    r.tels.forEach((t) => expect(t).toBeGreaterThanOrEqual(36));
    expect(r.dmg, 'a boss hit is still 22').toBe(22);
    // ...and each phase makes the same moves harder to dodge: faster, more, closer together
    expect(r.table.passSp[1] < r.table.passSp[2] && r.table.passSp[2] < r.table.passSp[3]).toBe(true);
    expect(r.table.plateSp[1] < r.table.plateSp[2] && r.table.plateSp[2] < r.table.plateSp[3]).toBe(true);
    expect(r.table.hookT[1] > r.table.hookT[2] && r.table.hookT[2] > r.table.hookT[3]).toBe(true);
    expect(r.table.hopT[1] > r.table.hopT[2] && r.table.hopT[2] > r.table.hopT[3]).toBe(true);
    expect(r.table.plates.slice(1)).toEqual([1, 2, 2]);
  });

  it('an item Firey Speaker Box (no attack of his own) never throws the moves that need his choreography', () => {
    const r = W.eval(`(function(){
      var s = { type:'boss', name:'Firey Speaker Box', color:'#d0402a', x:550, y:300, r:70, hp:200, vx:0, vy:0, face:1, _atkTimer:1, _tel:0 }, kinds = [];
      for (var i=0;i<6;i++){ s._atkTimer = 1; s._tel = 0; updateBossAttack(s, null); kinds.push(String(s._telKind)); s._tel = 0; }
      return kinds;
    })()`);
    expect(r).toEqual(['undefined', 'undefined', 'undefined', 'undefined', 'undefined', 'undefined']);
  });
});

describe('ROCKET BOARD!', () => {
  it('the wind-up marks the row you stand in and the edge farthest from you; the row follows you until it locks white, then holds', () => {
    const r = EV(`setup(300);
      var out = {};
      wind(0, 0);
      var fb = b._fsb;
      out.kind = b._fsKind; out.name = document.getElementById('banner').textContent; out.tel = b._tel; out.telLen = bossTelLen(b);
      out.dir = fb.d; out.row = fb.r; out.floorRow = gy - 44; out.lockedAtStart = fb.lk;
      // you jump onto the pad: the row follows
      var pad = worldPlats[0]; run(6, 500, pad.y - 24);
      out.followed = fb.r; out.padRow = pad.y - 24;
      // ...until the last FSB.lock frames of the wind-up
      while (b._tel > FSB.lock + 2) run(1, 500, pad.y - 24);
      out.beforeLock = fb.lk;
      run(4, 500, pad.y - 24); out.locked = fb.lk; out.lockedRow = fb.r;
      // once it is white it holds, wherever you go
      run(4, 500, gy - 24); out.held = fb.r;
      return out;`);
    expect(r.kind).toBe('rocketboard');
    expect(r.name).toBe('ROCKET BOARD!');
    expect(r.tel).toBe(44);
    expect(r.telLen).toBe(44);
    expect(r.dir, 'you are on the left, so he comes from the right edge and runs left').toBe(-1);
    expect(r.row, 'the floor row: a fighter standing on the floor is inside it (jump it)').toBeCloseTo(r.floorRow, 6);
    expect(r.lockedAtStart, 'red while it follows you').toBe(0);
    expect(r.followed, 'up on the pad, the row is the pad row').toBeCloseTo(r.padRow, 6);
    expect(r.beforeLock).toBe(0);
    expect(r.locked, 'white for the last 16 frames').toBe(1);
    expect(r.held, 'and it stays where it locked').toBeCloseTo(r.lockedRow, 6);
  });

  it('he crosses the whole screen at 18 px a frame along the row; a fighter in the row takes one whole boss hit, thrown the way he goes; a jumper clears it', () => {
    const r = EV(`var out = {};
      setup(300); wind(0, 0);
      var row = b._fsb.r, dir = b._fsb.d; while (b._tel > 0) run(1, 300);
      out.fs = b._fs && b._fs.k;
      var xs = [], pct0 = f.pct, hit = null, vx0 = null;
      for (var i=0;i<130 && b._fs && b._fs.ph === 'run';i++){
        step(); xs.push(b.x);
        if (hit === null && f.pct > pct0){ hit = f.pct - pct0; vx0 = f.vx; }
        f.x = 300; f.y = gy - 24; f.vx = hit === null ? 0 : f.vx; f.vy = 0; f.invuln = 0;
      }
      out.hit = hit; out.full = bossDmg(); out.thrown = vx0; out.dir = dir;
      var steps = []; for (var k=3;k<xs.length-1;k++) steps.push(+(xs[k+1] - xs[k]).toFixed(3));
      out.step = steps.slice(0, 20).every(function(d){ return d === -18; }); out.crossed = [Math.round(xs[0]), Math.round(xs[xs.length-1])];
      out.y = b.y; out.want = row - 44;
      // the same pass, over a fighter who is up in the air above the row's top
      setup(300); wind(0, 0);
      while (b._tel > 0) run(1, 300);
      var pct1 = f.pct;
      for (var j=0;j<130 && b._fs && b._fs.ph === 'run';j++){ step(); f.x = 300; f.y = gy - 44 - FSB.passR - 40; f.vx = 0; f.vy = 0; f.invuln = 0; }
      out.jumper = f.pct - pct1;
      return out;`);
    expect(r.fs).toBe('board');
    expect(r.step, 'a steady 18 px a frame').toBe(true);
    expect(r.crossed[0], 'in from the right edge').toBeGreaterThan(800);
    expect(r.crossed[1], 'and out past the left one').toBeLessThan(-100);
    expect(r.y, 'along the row (his art sits 44 px over its centre)').toBeCloseTo(r.want, 0);
    expect(r.hit, 'one whole boss hit (the frame it lands)').toBeCloseTo(r.full, 0);
    expect(r.thrown, 'thrown the way he goes').toBeLessThan(0);
    expect(r.jumper, 'a jump over the row is not hit').toBe(0);
  });

  it('a low pass scorches the floor behind it, and every scorch is a lingering volley of the same attack; a pass on the pad row leaves none', () => {
    const r = EV(`var out = {};
      setup(300); wind(0, 0);
      while (b._tel > 0) run(1, 300);
      var id = b._fs.id;
      for (var i=0;i<130 && b._fs && b._fs.ph === 'run';i++) run(1, 300);
      var sc = projectiles.filter(function(p){ return p.shape === 'spark' && p.fsb; });
      out.low = { n: sc.length, ids: sc.every(function(p){ return p.bossAtk === id; }), volley: sc.every(function(p){ return p.volley; }), floor: sc.every(function(p){ return p.y === gy - 12; }),
                  gaps: sc.slice(1).map(function(p, k){ return Math.round(Math.abs(p.x - sc[k].x)); }) };
      setup(500);
      var pad = worldPlats[0];
      wind(0, 0);
      while (b._tel > 0) run(1, 500, pad.y - 24);
      out.row = b._fs.row; out.padRow = pad.y - 24;
      for (var j=0;j<130 && b._fs && b._fs.ph === 'run';j++) run(1, 500, pad.y - 24);
      out.high = projectiles.filter(function(p){ return p.shape === 'spark' && p.fsb; }).length;
      return out;`);
    expect(r.low.n, 'a patch every FSB.trail px along the way').toBeGreaterThanOrEqual(8);
    expect(r.low.ids).toBe(true);
    expect(r.low.volley, 'a lingering shot keeps its own running total, so it is still one boss hit however long it lies there').toBe(true);
    expect(r.low.floor).toBe(true);
    expect(r.low.gaps.every((g) => Math.abs(g - 96) <= 20), `spaced along the pass: ${r.low.gaps}`).toBe(true);
    expect(r.row).toBeCloseTo(r.padRow, 6);
    expect(r.high, 'nothing to scorch on the pad row').toBe(0);
  });

  // The owner's pick, Round 17 (the question boxes, 2026-10-01): "ROCKET BOARD! clone from P2" -- "ROCKET BOARD!'s clone from the other side from phase 2" (it was phase 3's): so phase 2 is out and back AND
  // the clone, and phase 3 is as it was, one crossing and the clone.
  it('phase 2 runs out and back, the second row another one, marked again while he turns round, and from phase 2 the clone comes from the other side on the other row; phase 3 is one crossing and the clone', () => {
    const r = EV(`var out = {};
      setup(300, 2); wind(0, 0);
      while (b._tel > 0) run(1, 300, gy - 24 - 200);
      var F = b._fs, row1 = F.row, row2 = F.row2, seen = [], reMarked = null, id2 = F.id, cl2 = projectiles.filter(function(p){ return p.shape === 'fsbboard'; });
      out.p2clone = { clones: cl2.length, clone: cl2[0] ? { x: Math.round(cl2[0].delay > 0 ? cl2[0].x : cl2[0].x - cl2[0].vx), y: cl2[0].y, vx: cl2[0].vx, delay: cl2[0].delay, id: cl2[0].bossAtk === id2, pierce: !!cl2[0].pierce, volley: !!cl2[0].volley, dmg: cl2[0].dmg, full: bossDmg(), r: cl2[0].r } : null, dir: F.dir, r2: b._fsb.r2 };
      run(1, 300, gy - 24 - 200); out.p2clone.cl = b._fsb.cl;   // (read a frame on: the tick that lights the clone's row runs before the move starts)
      for (var i=0;i<400 && b._fs;i++){ run(1, 300, gy - 24 - 200); var s = b._fs ? b._fs.ph + ':' + b._fs.leg : 'done'; if (seen[seen.length-1] !== s) seen.push(s); if (b._fs && b._fs.ph === 'gap' && reMarked === null) reMarked = b._fsb.r; }
      out.p2 = { seen: seen, row1: row1, row2: row2, legs: F.legs, reMarked: reMarked };
      setup(300, 3); wind(0, 0);
      while (b._tel > 0) run(1, 300, gy - 24 - 200);
      out.r2 = b._fsb.r2; out.row = b._fsb.r;
      var F3 = b._fs, id = F3.id, cl = projectiles.filter(function(p){ return p.shape === 'fsbboard'; });
      out.p3 = { legs: F3.legs, clones: cl.length, clone: cl[0] ? { x: Math.round(cl[0].delay > 0 ? cl[0].x : cl[0].x - cl[0].vx), y: cl[0].y, vx: cl[0].vx, delay: cl[0].delay, id: cl[0].bossAtk === id, pierce: !!cl[0].pierce, volley: !!cl[0].volley, dmg: cl[0].dmg, full: bossDmg(), r: cl[0].r } : null, dir: F3.dir, row2: F3.row2 };
      return out;`);
    expect(r.p2.legs).toBe(2);
    expect(r.p2.seen, 'out, a turn round off the screen, back, home').toEqual(['run:0', 'gap:1', 'run:1', 'ret:1', 'done']);
    expect(r.p2.row2, 'the return row is the other kind').not.toBe(r.p2.row1);
    expect(r.p2.reMarked, 'and the band shows it while he turns round').toBe(r.p2.row2);
    // ...and the clone, from phase 2: from the other side (he runs left, so it enters at the left edge), on the other row, a moment behind, one attack id, the same damage
    expect(r.p2clone.clones, 'phase 2 has the clone').toBe(1);
    expect(r.p2clone.clone).toMatchObject({ x: -120, y: r.p2.row2, vx: 20, id: true, pierce: true, volley: true, r: 44 });
    expect([19, 20], 'a moment behind: 20 frames, one already counted in the frame he fired').toContain(r.p2clone.clone.delay);
    expect(r.p2clone.clone.dmg, 'the same damage').toBeCloseTo(r.p2clone.clone.full, 6);
    expect(r.p2clone.r2, 'the wind-up marks the clone\'s row in phase 2 too').toBe(r.p2.row2);
    expect(r.p2clone.cl, 'and its row stays lit while the clone is still to come').toBe(1);
    expect(r.r2, 'phase 3 marks the clone\'s row too').toBe(r.p3.row2);
    expect(r.p3.legs, 'one crossing').toBe(1);
    expect(r.p3.clones, 'and the clone').toBe(1);
    // "And I'm his clone!": from the other side (the boss runs left, so it enters at the left edge), on the other row, a moment behind
    expect(r.p3.clone).toMatchObject({ x: -120, y: r.p3.row2, vx: 22, id: true, pierce: true, volley: true, r: 44 });
    expect([19, 20], 'a moment behind: 20 frames, one already counted in the frame he fired').toContain(r.p3.clone.delay);
    expect(r.p3.clone.dmg, 'the same damage').toBeCloseTo(r.p3.clone.full, 6);
  });
});

// "Harder, same damage", and the way out stays: with the clone from phase 2 a fighter on the floor has the board on the floor row and the clone a head higher, so a jump over one is into the other
// unless it is timed (they pass 20 frames apart, from two edges, at one spot of the floor they pass together) -- but on the pad the clone's row is the floor under him, and there is one pass to jump.
describe('ROCKET BOARD! with the clone (phases 2 and 3): the pad is a way out', () => {
  it('standing still on the pad is hit by the pass along its row; one jump over it and the whole move (the clone under him, the second leg) goes by without a touch', () => {
    const r = EV(`var out = {};
      function pad(ph, mode){
        setup(500, ph);
        var P = worldPlats[0];
        f.x = P.x + P.w/2; f.y = P.y - 24; f.vx = 0; f.vy = 0; f.onground = true;
        wind(0, 0);
        var JUMP_V = -12.5, hit = null, jumps = 0, n = 0, clones = 0;
        while ((b._tel > 0 || b._fs) && n < 600){
          var need = false;
          if (mode === 'jump' && b._fs && b._fs.k === 'board'){
            var dist = (f.x - b.x) * b._fs.dir;
            if (b._fs.ph === 'run' && Math.abs((b.y + 44) - f.y) < 80 && dist > 0 && dist < 260 && f.onground && !f._jumped) need = true;   // a pass along his own row, coming at him: jump
            if (b._fs.ph !== 'run') f._jumped = false;
          }
          if (need){ f.vy = JUMP_V; f.onground = false; f._jumped = true; jumps++; }
          var p = f.pct; step(); n++; f.vx = 0; f.invuln = 0;
          clones = Math.max(clones, projectiles.filter(function(q){ return q.shape === 'fsbboard' && q.life > 0; }).length);
          if (f.pct > p + 0.5 && hit === null) hit = { n: n, fs: b._fs ? b._fs.ph : null };
        }
        return { hit: hit, jumps: jumps, n: n, clones: clones, row2: b._fsb.r2, padRow: P.y - 24, gy: gy };
      }
      out.p2still = pad(2, 'still'); out.p2jump = pad(2, 'jump'); out.p3still = pad(3, 'still'); out.p3jump = pad(3, 'jump');
      return out;`);
    for (const ph of [2, 3]) {
      expect(r['p' + ph + 'still'].hit, `phase ${ph}: standing on the pad as it comes is a hit`).not.toBeNull();
      expect(r['p' + ph + 'jump'].clones, `phase ${ph}: the clone does cross`).toBeGreaterThan(0);
      expect(r['p' + ph + 'jump'].jumps, `phase ${ph}: one jump`).toBe(1);
      expect(r['p' + ph + 'jump'].hit, `phase ${ph}: and it clears the whole move`).toBeNull();
      expect(r['p' + ph + 'jump'].row2, 'the clone runs the floor row under the pad').toBe(r['p' + ph + 'jump'].gy - 44);
    }
  });
});

describe('FURNACE!', () => {
  it('lights the furnace it pushes toward and ticks its gauge; a plate rolls from the far edge along the floor at 10 px a frame (a second in phase 2, white-hot in phase 3)', () => {
    const r = EV(`var out = [];
      [1, 2, 3].forEach(function(ph){
        setup(300, ph);
        wind(1, 0);
        var o = { kind: b._fsKind, name: document.getElementById('banner').textContent, d: b._fsb.d };
        while (b._tel > 0) run(1, 300);
        var pl = projectiles.filter(function(p){ return p.fsbPlate; });
        o.plates = pl.map(function(p){ return { x: Math.round(p.delay > 0 ? p.x : p.x - p.vx), y: p.y, vx: p.vx, delay: p.delay, r: p.r, shape: p.shape, pierce: !!p.pierce, volley: !!p.volley, id: p.bossAtk }; });
        o.g = b._fsb.g; o.floor = gy;
        out.push(o);
      });
      return out;`);
    for (const o of r) {
      expect(o.kind).toBe('furnace');
      expect(o.name).toBe('FURNACE!');
      expect(o.d, 'you are on the left: the furnace is the left edge, the plate comes from the right').toBe(-1);
      for (const p of o.plates) expect(p).toMatchObject({ x: 1170, y: o.floor - 34, r: 34, pierce: true, volley: true });
    }
    expect(r.map((o) => o.plates.length)).toEqual([1, 2, 2]);
    expect(r.map((o) => o.plates[0].vx)).toEqual([-10, -11.5, -13]);
    expect(r[1].plates[0].delay).toBe(0);
    expect([41, 42], 'the second follows 42 frames behind (one already counted in the frame he fired)').toContain(r[1].plates[1].delay);
    expect(new Set(r[1].plates.map((p) => p.id)).size, 'one attack id: the pair is one boss hit').toBe(1);
    expect(r.map((o) => o.plates[0].shape)).toEqual(['fsbplate', 'fsbplate', 'fsbplatehot']);
    expect(r.map((o) => o.g), 'the gauge ticks up, and is full ("ENOUGH!!!!!!") in phase 3').toEqual([1, 1, 4]);
  });

  it('a plate catches a fighter on the floor for one whole boss hit and throws him toward the furnace; a fighter on the pad or in a jump is not touched', () => {
    const r = EV(`var out = {};
      setup(300); wind(1, 0);
      while (b._tel > 0) run(1, 300);
      var pct0 = f.pct, hit = null, vx0 = null, vy0 = null;
      for (var i=0;i<200 && b._fs;i++){ step(); if (hit === null && f.pct > pct0){ hit = f.pct - pct0; vx0 = f.vx; vy0 = f.vy; } f.x = 300; f.y = gy - 24; f.vx = hit === null ? 0 : f.vx; f.vy = 0; f.invuln = 0; }
      out.hit = hit; out.full = bossDmg(); out.vx = vx0; out.vy = vy0; out.left = projectiles.filter(function(p){ return p.fsbPlate; }).length; out.fsAfter = b._fs;
      setup(500);
      var pad = worldPlats[0];
      wind(1, 0);
      while (b._tel > 0) run(1, 500, pad.y - 24);
      var pct1 = f.pct; for (var j=0;j<200 && b._fs;j++) run(1, 500, pad.y - 24);
      out.pad = f.pct - pct1;
      setup(300); wind(1, 0);
      while (b._tel > 0) run(1, 300);
      var pct2 = f.pct; for (var k=0;k<200 && b._fs;k++) run(1, 300, gy - 24 - 34*2 - 40);
      out.air = f.pct - pct2;
      return out;`);
    expect(r.hit, 'one whole boss hit').toBeCloseTo(r.full, 0);
    expect(r.vx, 'toward the furnace on the left').toBeLessThan(0);
    expect(r.vy, 'and up: "thrown out of its top"').toBeLessThan(0);
    expect(r.left, 'the plate is spent at the furnace').toBe(0);
    expect(r.fsAfter).toBe(null);
    expect(r.pad, 'the pad is above it').toBe(0);
    expect(r.air, 'so is a jump').toBe(0);
  });

  it('phase 3: the plates leave a burning strip, and the furnace, full, vents a jet as each plate arrives', () => {
    const r = EV(`var out = {};
      setup(300, 3); wind(1, 0);
      while (b._tel > 0) run(1, 500, gy - 24 - 300);
      var id = b._fs.id, strip = 0, jets = 0, fb = b._fsb;
      for (var i=0;i<300 && b._fs;i++){ run(1, 500, gy - 24 - 300); strip = Math.max(strip, projectiles.filter(function(p){ return p.shape === 'spark' && p.bossAtk === id; }).length); if (fb.j > 0) jets++; }
      out.strip = strip; out.jets = jets;
      return out;`);
    expect(r.strip, 'a burning strip of the same attack').toBeGreaterThan(0);
    expect(r.jets, 'the furnace vents').toBeGreaterThan(0);
  });
});

describe('YOU MUST!', () => {
  it('the mark follows you through the wind-up and locks for the last 16 frames; two hooks start a span out either side and reach it on the same frame, 26 frames later', () => {
    const r = EV(`var out = {};
      setup(500); wind(3, 0);
      out.kind = b._fsKind; out.name = document.getElementById('banner').textContent;
      out.mark0 = b._telX;
      run(8, 600); out.followed = b._telX;
      while (b._tel > FSB.lock + 2) run(1, 600);
      run(4, 600); var locked = b._telX; out.lk = b._fsb.lk;
      run(3, 300); out.held = b._telX; out.locked = locked;
      while (b._tel > 0) run(1, 300);
      var arms = projectiles.filter(function(p){ return p.fsbArm; });
      out.arms = arms.map(function(p){ return { x0: Math.round(p.x - p.vx), y: p.y - gy, vx: +p.vx.toFixed(3), r: p.r, shape: p.shape, pierce: !!p.pierce, volley: !!p.volley, id: p.bossAtk, wx: Math.round(p.warnX), wy: p.warnY - gy }; });
      out.T = b._fs.T; out.mark = b._fs.x;
      var n = 0; while (b._fs){ run(1, 300); n++; } out.n = n;
      out.armsLeft = projectiles.filter(function(p){ return p.fsbArm && p.life > 0; }).length;
      return out;`);
    expect(r.kind).toBe('youmust');
    expect(r.name).toBe('YOU MUST!');
    expect(r.mark0).toBe(500);
    expect(r.followed).toBe(600);
    expect(r.locked, 'it stops following once it is white').toBe(600);
    expect(r.lk).toBe(1);
    expect(r.held).toBe(r.locked);
    expect(r.mark).toBe(600);
    expect(r.arms).toHaveLength(2);
    // 340 out either side, in at 340/26 a frame: they meet on the mark together
    expect(r.arms.map((a) => a.x0).sort((p, q) => p - q)).toEqual([260, 940]);
    expect(r.arms.map((a) => a.vx).sort((p, q) => p - q)).toEqual([-13.077, 13.077]);
    for (const a of r.arms) expect(a).toMatchObject({ y: -46, r: 30, shape: 'fsbarm', pierce: true, volley: true });
    for (const a of r.arms) { expect(a.wx, 'a hook carries its own start as warnX/warnY (the gate the mark draws there), for the glitch hunter').toBe(a.x0); expect(a.wy).toBe(a.y); }
    expect(r.arms[0].id).toBe(r.arms[1].id);
    expect(r.T).toBe(26);
    expect(r.n, 'the pinch is 26 frames after the hooks leave').toBe(26);
    expect(r.armsLeft, 'they are gone at the pinch').toBe(0);
  });

  it('a fighter on the spot is slapped by a hook and then thrown over him by the pinch, all one boss hit; a jump clears it, and so does standing beyond the reach of the hooks', () => {
    const r = EV(`var out = {};
      function once(mark, x, y){
        setup(mark); wind(3, 0);
        while (b._tel > 0) run(1, mark);
        b.x = 900; b.vx = 0;
        var pct0 = f.pct, vx0 = null, vy0 = null, hits = [];
        while (b._fs){ var p = f.pct; step(); if (!b._fs){ vx0 = f.vx; vy0 = f.vy; } if (f.pct > p + 0.5) hits.push(+(f.pct - p).toFixed(2)); f.x = x; f.y = y; f.vx = b._fs ? 0 : f.vx; f.vy = b._fs ? 0 : f.vy; b.x = 900; b.vx = 0; }
        return { taken: f.pct - pct0, hits: hits, vx: vx0, vy: vy0, full: bossDmg() };
      }
      out.on = once(500, 500, groundY() - 24);
      out.jump = once(500, 500, groundY() - 24 - 150);
      out.far = once(300, 300 + 340 + 80, groundY() - 24);
      return out;`);
    expect(r.on.hits.length, 'a hook slaps them, and the pinch lands on top').toBeGreaterThan(0);
    expect(r.on.taken, 'the hooks and the pinch are one boss hit').toBeLessThanOrEqual(r.on.full + 0.5);
    expect(r.on.taken).toBeGreaterThan(r.on.full - 0.5);
    expect(r.on.vx, 'thrown over him, toward the side he is on (he is to the right)').toBeGreaterThan(0);
    expect(r.on.vy, 'hoisted').toBeLessThan(0);
    expect(r.jump.taken, 'a jump over the hooks and the pinch').toBe(0);
    expect(r.far.taken, 'beyond the span the hooks start from, nothing reaches you').toBe(0);
  });

  it('phase 3: one hook runs high and one low, and which side is high changes turn by turn, so one jump does not clear both', () => {
    const r = EV(`var out = [];
      setup(500, 3);
      for (var t=0;t<2;t++){
        wind(3, 0);
        while (b._tel > 0) run(1, 500, gy - 24 - 300);
        var arms = projectiles.filter(function(p){ return p.fsbArm; }).map(function(p){ return [p.x < 500 ? 'L' : 'R', Math.round(p.y - gy)]; }).sort();
        out.push(arms); while (b._fs) run(1, 500, gy - 24 - 300);
        projectiles = []; b._atkTimer = 1e9;
      }
      return out;`);
    for (const arms of r) expect(arms.map((a) => a[1]).sort((p, q) => p - q)).toEqual([-100, -46]);
    expect(r[0][0][1], 'the high side alternates').not.toBe(r[1][0][1]);
  });

  // The owner's pick, Round 17 (the question boxes, 2026-10-01): "YOU MUST! a second pinch from P2 that follows where you escaped". The first pinch closes on the spot you were on; then a mark goes after
  // you for FSB.pinch2.follow frames, locks (white), and the hooks leave a span out either side and close on it FSB.pinch2.T frames later: a locked warning of about the 30 frames a dodge needs.
  it('from phase 2 a second pinch follows where you escaped: its mark goes after you for 12 frames, locks, and its hooks close on it 32 frames later; phase 1 has only the first', () => {
    const r = EV(`var out = {};
      function second(ph){
        setup(500, ph); wind(3, 0);
        while (b._tel > 0) run(1, 500, gy - 24 - 300);
        var F = b._fs, id = F.id, log = [], first = F.x, n = 0, fb = b._fsb;
        while (b._fs && n < 200){
          var two = b._fs.two, fx = two ? 500 + 10*(two.t + 1) : 500;                     // after the first pinch he runs on, 10 px a frame
          run(1, fx, gy - 24 - 300); n++;
          var t = b._fs && b._fs.two ? b._fs.two.t : null;
          if (t != null) log.push({ t: t, x2: fb.x2, lk2: fb.lk2, h2: fb.h2, fx: f.x, arms: projectiles.filter(function(p){ return p.fsbArm && p.life > 0; }).length, ids: Array.from(new Set(projectiles.filter(function(p){ return p.fsbArm; }).map(function(p){ return p.bossAtk; }))) });
        }
        return { log: log, id: id, first: first, frames: n, after: { x2: fb.x2, lk2: fb.lk2, h2: fb.h2 }, P: F.P, span: F.span, pinch2: FSB.pinch2 };
      }
      out[1] = second(1); out[2] = second(2);
      return out;`);
    expect(r[1].log, 'phase 1: one pinch and it is over').toEqual([]);
    const o = r[2], log = o.log;
    expect(log.length, 'phase 2: 12 frames following and 32 closing').toBe(44);
    expect(o.pinch2).toMatchObject({ from: 2, follow: 12, T: 32 });
    const follow = log.filter((l) => l.t < 12), locked = log.filter((l) => l.t >= 12);
    expect(new Set(follow.map((l) => l.x2)).size, 'the mark goes where you have gone').toBeGreaterThan(8);
    expect(follow.every((l) => l.lk2 === 0 && l.arms === 0), 'red, and no hook yet').toBe(true);
    expect(new Set(locked.map((l) => l.x2)).size, 'then it holds').toBe(1);
    expect(locked.length, 'the locked warning is at least the 30 frames a dodge needs').toBeGreaterThanOrEqual(32);
    expect(locked.every((l) => l.lk2 === 1), 'white').toBe(true);
    expect(Math.abs(locked[0].x2 - (500 + 10*12)), 'it locked where he was at the 12th frame, not where he started').toBeLessThanOrEqual(10);
    expect(Math.abs(locked[0].x2 - o.first), 'a different spot from the first pinch\'s').toBeGreaterThan(80);
    expect(locked.slice(0, 32).every((l) => l.arms === 2), 'two hooks are out while it closes').toBe(true);
    expect(new Set(locked.map((l) => l.ids.join())).size, 'one attack id (the first pinch\'s)').toBe(1);
    expect(locked[0].ids[0]).toBe(o.id);
    expect(log.map((l) => l.h2).slice(0, 3), 'frames to the pinch count down from 44').toEqual([44, 43, 42]);
    expect(o.after, 'and when it has closed the mark is gone').toEqual({ x2: null, lk2: 0, h2: 0 });
    expect(o.frames, 'the whole move after the wind-up: 22 frames to the first pinch (phase 2), then 44 to the second').toBe(22 + 44);
  });

  it('the second pinch hits one standing on its locked spot (one whole boss hit with the rest of the move), and misses one in the air and one beyond its hooks; the first pinch\'s victim is not hit twice', () => {
    const r = EV(`var out = {};
      // where: the fighter holds this x, and up px over the floor, from the lock of the second pinch on; before it he stays at x 500, up high and out of the first pinch (or on the floor, in it, for 'both')
      function once(where, up, both){
        setup(500, 2); wind(3, 0);
        var y = gy - 24 - up;
        while (b._tel > 0) run(1, 500, both ? gy - 24 : gy - 24 - 300);
        var pct0 = f.pct, hitsSecond = 0;
        while (b._fs){
          var p = f.pct, two0 = b._fs.two;
          step();
          if (f.pct > p + 0.5 && two0) hitsSecond++;
          var tw = b._fs && b._fs.two;
          f.vx = 0; f.vy = 0; f.invuln = 0;
          if (tw && tw.t >= 12){ f.x = where(tw.x); f.y = y; } else { f.x = 500; f.y = both ? gy - 24 : gy - 24 - 300; }
        }
        return { taken: +(f.pct - pct0).toFixed(2), hitsSecond: hitsSecond, full: bossDmg() };
      }
      out.stay = once(function(x){ return x; }, 0);                        // the first pinch missed him (he was up high); on the floor at the lock, he stays
      out.air = once(function(x){ return x; }, 200);                       // in the air over the mark all the while
      out.far = once(function(x){ return x < 600 ? x + 360 + 60 : x - 360 - 60; }, 0);   // beyond the span the hooks start from (360 in phase 2)
      out.both = once(function(x){ return x; }, 0, true);                  // in the first pinch too, and again in the second
      return out;`);
    expect(r.stay.taken, 'standing on the locked spot: one whole boss hit').toBeGreaterThan(r.stay.full - 0.6);
    expect(r.stay.taken).toBeLessThanOrEqual(r.stay.full + 0.6);
    expect(r.stay.hitsSecond).toBeGreaterThan(0);
    expect(r.air.taken, 'in the air over it: nothing').toBe(0);
    expect(r.far.taken, 'beyond the span: nothing reaches you').toBe(0);
    expect(r.both.taken, 'the first pinch and the second on the same fighter are one boss hit between them').toBeLessThanOrEqual(r.both.full + 0.6);
  });

  it('phase 3: the second pinch\'s high arm is on the other side from the first\'s, so the jump that cleared one hook does not clear the same one again', () => {
    const r = EV(`var out = [];
      setup(500, 3); wind(3, 0);
      while (b._tel > 0) run(1, 500, gy - 24 - 300);
      var firstArms = projectiles.filter(function(p){ return p.fsbArm; }).map(function(p){ return [p.vx > 0 ? 'L' : 'R', Math.round(p.y - gy)]; }).sort();   // (a hook coming from the left moves right)
      var secondArms = null, n = 0;
      while (b._fs && n < 200){ run(1, 500, gy - 24 - 300); n++; if (b._fs && b._fs.two && b._fs.two.t === 13 && !secondArms) secondArms = projectiles.filter(function(p){ return p.fsbArm && p.life > 0; }).map(function(p){ return [p.vx > 0 ? 'L' : 'R', Math.round(p.y - gy)]; }).sort(); }
      return { first: firstArms, second: secondArms };`);
    expect(r.first.map((a) => a[1]).sort((p, q) => p - q), 'the first: one high, one low').toEqual([-100, -46]);
    expect(r.second.map((a) => a[1]).sort((p, q) => p - q), 'the second: one high, one low').toEqual([-100, -46]);
    const highSide = (arms) => arms.find((a) => a[1] === -100)[0];
    expect(highSide(r.second), 'and the high one is on the other side').not.toBe(highSide(r.first));
  });
});

describe('THE TLC NEEDS TO BE FIXED!', () => {
  // The owner's pick, Round 17 (the question boxes, 2026-10-01): "THE TLC NEEDS TO BE FIXED! a 6th landing, and double fire rings from phase 2" -- it was five landings and the second ring was phase 3's.
  it('a stomp where he stands sets the beat, then five hops a step toward you: six landings, 30 frames apart, the sixth the big one', () => {
    const r = EV(`var out = {};
      setup(200);
      b.x = 700;
      wind(0, 1);
      out.kind = b._fsKind; out.name = document.getElementById('banner').textContent;
      while (b._tel > 0) run(1, 200);
      out.bx = b.x;
      out.fireRing = projectiles.filter(function(p){ return p.shape === 'ember'; }).map(function(p){ return [Math.round(p.x - p.vx), p.y === gy - 16, p.vx, p.r]; });
      var land = [0], frames = 0, xs = [Math.round(b.x)];
      while (b._fs && frames < 400){ var nb = b._fs.n; step(); frames++; f.x = 200; f.y = gy - 24; f.vx = 0; f.vy = 0; f.invuln = 0;
        if (b._fs && b._fs.n !== nb){ land.push(frames); xs.push(Math.round(b.x)); } }
      out.land = land; out.xs = xs; out.frames = frames; out.after = b._fs;
      return out;`);
    expect(r.kind).toBe('tlc');
    expect(r.name).toBe('THE TLC NEEDS TO BE FIXED!');
    // the stomp is the first landing, at once, at his own feet: a ring each way along the floor
    expect(r.fireRing).toEqual([[Math.round(r.bx - 22), true, -7, 15], [Math.round(r.bx + 22), true, 7, 15]]);
    // then hops: 30, 30, 30, 30, and the big one after a crouch and a longer flight (38 + 14)
    expect(r.land, 'landings (the stomp is 0)').toEqual([0, 30, 60, 90, 120, 172]);
    expect(r.xs.slice(0, 3), 'each hop is 170 px toward you').toEqual([Math.round(r.bx), Math.round(r.bx) - 170, Math.round(r.bx) - 340]);
    expect(r.xs[5], 'and they end on you').toBe(200);
    expect(r.after).toBe(null);
  });

  it("the hops stay LOW and on the screen: never higher than his big hop's 104 px, his whole body always in view -- it is not Springy's slam", () => {
    const r = EV(`var out = { minTop: 1e9, maxX: -1e9, minX: 1e9 };
      setup(200); wind(0, 1);
      while (b._tel > 0) run(1, 200);
      while (b._fs){ run(1, 200); out.minTop = Math.min(out.minTop, b.y - b.r); out.minX = Math.min(out.minX, b.x); out.maxX = Math.max(out.maxX, b.x); }
      out.r = b.r; out.gy = gy; out.WW = WW;
      return out;`);
    expect(r.minTop, 'the top of his body stays on the screen (Springy leaves it and hangs above it)').toBeGreaterThan(0);
    // his floor line is gy - r - 2; the big hop lifts him 104 px, so the top of his body is never higher than that plus his radius
    expect(r.minTop).toBeGreaterThanOrEqual(r.gy - 2*r.r - 2 - 104 - 1);
    expect(r.minX, 'and never leaves it sideways').toBeGreaterThanOrEqual(80);
    expect(r.maxX).toBeLessThanOrEqual(r.WW - 80);
  });

  it('each landing throws a ring of fire along the floor either way (jump it); the last is bigger and has a second, higher ring; from phase 2 every small landing sends two (a second ring 12 frames behind)', () => {
    const r = EV(`var out = {};
      function landings(ph){
        setup(200, ph);
        b.x = 700; b._telPh = ph;
        wind(0, 1);
        while (b._tel > 0) run(1, 500, gy - 24 - 300);
        var id = b._fs.id, per = [];
        function snapRings(){ var rings = projectiles.filter(function(p){ return p.shape === 'ember' && p.bossAtk === id && !p._seen; }); rings.forEach(function(p){ p._seen = 1; }); return rings.map(function(p){ return { y: gy - p.y, r: p.r, vx: p.vx, d: p.delay > 0 }; }); }
        per.push(snapRings());
        var frames = 0; while (b._fs && frames < 400){ run(1, 500, gy - 24 - 300); frames++; var s = snapRings(); if (s.length) per.push(s); }
        return per;
      }
      out[1] = landings(1); out[2] = landings(2); out[3] = landings(3);
      return out;`);
    const lens = (ph) => r[ph].map((p) => p.length);
    expect(lens(1), 'phase 1: two shots a landing, four for the big one').toEqual([2, 2, 2, 2, 2, 4]);
    expect(r[1][0][0]).toMatchObject({ y: 16, r: 15 });
    expect(r[1][5].map((s) => s.r).sort((p, q) => p - q), 'the sixth: the big ring and a smaller, higher one').toEqual([18, 18, 24, 24]);
    expect(Math.max(...r[1][5].map((s) => s.y)), 'the higher ring is 58 px up').toBe(74);
    expect(lens(2), 'phase 2: a second ring behind every small landing, from phase 2').toEqual([4, 4, 4, 4, 4, 4]);
    expect(lens(3), 'phase 3: the same').toEqual([4, 4, 4, 4, 4, 4]);
    expect(r[2][0].filter((s) => s.d).length, 'the second ring starts 12 frames behind').toBe(2);
    expect(r[3][0].filter((s) => s.d).length).toBe(2);
    expect(Math.abs(r[1][0][0].vx) < Math.abs(r[2][0][0].vx) && Math.abs(r[2][0][0].vx) < Math.abs(r[3][0][0].vx), 'faster each phase').toBe(true);
  });

  it('a landing hits whoever is under him, a ring hits whoever is on the floor, and none of it is more than one boss hit; a jump clears the rings', () => {
    const r = EV(`var out = {};
      function chain(y){
        setup(300);
        b.x = 600; b.vx = 0;
        wind(0, 1);
        while (b._tel > 0) run(1, 300, y);
        var hits = [];
        while (b._fs){ var p = f.pct; step(); f.x = 300; f.y = y; f.vx = 0; f.vy = 0; f.invuln = 0; if (f.pct > p + 0.5) hits.push(+(f.pct - p).toFixed(2)); }
        return { hits: hits, full: bossDmg() };
      }
      out.floor = chain(groundY() - 24);
      out.air = chain(groundY() - 24 - 140);
      return out;`);
    // (burn is the show's fire: a status the rings set, 0.04 a frame, and not a hit)
    expect(r.floor.hits.length, 'a fighter on the floor is hit').toBeGreaterThan(0);
    expect(r.floor.hits.reduce((a, h) => a + h, 0), 'the hits add to one boss hit however many landed').toBeLessThanOrEqual(r.floor.full + 0.5);
    expect(r.air.hits, 'up in the air the rings pass under').toEqual([]);
  });
});

describe('every attack is one boss hit, however many parts of it land', () => {
  it('a fighter who stands through the whole of each move, in each phase, takes at most one boss hit from it (the burn status apart)', () => {
    const r = EV(`var out = [];
      var AH = applyHit, dealt = {};
      applyHit = function(t, dmg, kbx, kby, from, opts){ var before = t.pct; AH(t, dmg, kbx, kby, from, opts); if (opts && opts.bossAtk != null) dealt[opts.bossAtk] = (dealt[opts.bossAtk] || 0) + (t.pct - before); };
      try {
        [[0,0,'board'],[1,0,'furnace'],[3,0,'youmust'],[0,1,'tlc']].forEach(function(m){
          [1, 2, 3].forEach(function(ph){
            setup(300, ph);
            dealt = {}; b.x = 700; b._telPh = ph;
            wind(m[0], m[1]);
            while (b._tel > 0) run(1, 300);
            var id = b._fs ? b._fs.id : null;
            var n = 0; while (b._fs && n < 700){ run(1, 300); n++; }
            out.push({ move: m[2], ph: ph, id: id, dealt: dealt[id] || 0, full: bossDmg() });
          });
        });
      } finally { applyHit = AH; }
      return out;`);
    for (const o of r) {
      expect(o.id, `${o.move} p${o.ph} ran`).not.toBe(null);
      expect(o.dealt, `${o.move} in phase ${o.ph} dealt ${o.dealt}`).toBeLessThanOrEqual(o.full + 1e-6);
      expect(o.dealt, `${o.move} in phase ${o.ph} landed on a fighter who stood through it`).toBeGreaterThan(0);
    }
  });
});

describe('his phases and the volcano', () => {
  it('his phases change as his HP falls and are announced; phase 3 (RAGE MODE) is a quake of 120 frames, then he is metal', () => {
    const r = EV(`setup(150);
      var out = { p1: b._phase, hover: b.hover, st: b.stationary, hp: b.maxHp };
      b.hp = b.maxHp*0.5; updateBossAttack(b, f); b._fs = null; out.p2 = b._phase; out.b2 = document.getElementById('banner').textContent; out.look2 = bossLook(b);
      b.hp = b.maxHp*0.2; updateBossAttack(b, f); b._fs = null; out.p3 = b._phase; out.b3 = document.getElementById('banner').textContent;
      out.q = b._fsQ; out.qfb = b._fsb.q; out.lookDuring = bossLook(b);
      shakeAmt = 0; var shook = 0;
      for (var i=0;i<FSB.quake + 2;i++){ b._atkTimer = 1e9; updateBossAttack(b, f); b._fs = null; if (shakeAmt > 0) shook++; }
      out.after = b._fsb.q; out.lookAfter = bossLook(b); out.shook = shook; out.rage = b._rage;
      return out;`);
    // the owner, 2026-10-01 (Round 17): "+50% (Recommended)" -- every Boss Rush boss spawns with half again its row's HP (BOSS_HP_MULT); the row keeps 215
    expect(r.hp, '215 x 1.5 for one fighter').toBe(Math.round(215*1.5));
    expect(r.hover, 'he floats').toBe(true);
    expect(r.st, 'and is not a boss who holds a spot').toBe(false);
    expect([r.p1, r.p2, r.p3]).toEqual([1, 2, 3]);
    expect(r.b2).toMatch(/PHASE 2: Flame Surge/);
    expect(r.b3).toMatch(/PHASE 3: RAGE MODE/);
    expect(r.look2, 'phase 2 still wears the render').toBe('speakerfirey');
    expect([119, 120], '"Firey Speaker Box eats the Yoyleberries and turns into metal": a quake first, 120 frames (one already counted in the frame the phase turned)').toContain(r.q);
    expect(r.qfb, 'a client is told').toBe(r.q);
    expect(r.lookDuring, 'not metal yet, mid-quake').toBe('speakerfirey');
    expect(r.shook, 'the volcano shakes the whole quake').toBeGreaterThan(100);
    expect(r.after).toBe(0);
    expect(r.lookAfter, 'then he is metal').toBe('speakerfireymetal');
    expect(r.rage, 'and RAGE MODE pulses his render').toBe(true);
  });

  it('phase 1 leaves the vents quiet; phase 2 opens with the vents bursting one after the other (harmless), then the geysers erupt on a beat, left, right, left; phase 3 doubles up', () => {
    const r = EV(`var out = {};
      out.p1 = [0, 1].map(function(i){ var any = 0; for (var dt=0; dt<1200; dt++) if (fsbVentState(1, i, dt).s) any++; return any; });
      var seq = [], last = '';
      for (var dt=0; dt<330; dt++){ var v0 = fsbVentState(2, 0, dt), v1 = fsbVentState(2, 1, dt), tag = (v0.s ? 'L' + v0.s : '') + (v1.s ? 'R' + v1.s : ''); if (tag !== last){ seq.push([dt, tag]); last = tag; } }
      out.seq = seq;
      // what the eye sees of the entry beat: the vents flare in turn (draw only: nothing that hurts)
      out.flare = [0, 6, 20, 30, 60].map(function(dt){ return [dt, fsbVentShow(2, 0, dt).s, fsbVentState(2, 0, dt).s, fsbVentShow(2, 1, dt).s, fsbVentState(2, 1, dt).s]; });
      var p3 = [], last3 = '';
      for (var d3=0; d3<520; d3++){ var a = fsbVentState(3, 0, d3), c = fsbVentState(3, 1, d3), t3 = (a.s === 2 ? 'L' : '') + (c.s === 2 ? 'R' : ''); if (t3 !== last3){ p3.push([d3, t3]); last3 = t3; } }
      out.p3 = p3; out.quake = FSB.quake;
      return out;`);
    expect(r.p1, 'phase 1: the vents never fire').toEqual([0, 0]);
    // the entry beat is 70 frames; then each beat is 85 frames: the vent glows 30, erupts 44
    expect(r.seq.slice(0, 7)).toEqual([[70, 'L1'], [100, 'L2'], [144, ''], [155, 'R1'], [185, 'R2'], [229, ''], [240, 'L1']]);
    expect(r.flare.map((x) => x[1] === 2 && x[2] === 0), 'a flare in the entry beat (frames 6-30 for the left vent) that hurts nobody').toEqual([false, true, true, false, false]);
    expect(r.flare[2].slice(1), 'the left vent bursts first, the right after it').toEqual([2, 0, 0, 0]);
    expect(r.flare.map((x) => x[3]), 'the right vent flares from frame 22').toEqual([0, 0, 0, 2, 0]);
    // phase 3: no eruption until the quake is over (its 120 frames and 40 more), then left, right, both...
    expect(r.p3[0][0]).toBeGreaterThanOrEqual(r.quake + 40);
    expect(r.p3.slice(0, 5).map((x) => x[1]).filter((t) => t), 'left, right, both').toEqual(['L', 'R', 'LR']);
  });

  it('a geyser throws a fighter in its column once an eruption (0.55 of a boss hit), not one beside it or above it, and not while it is only glowing', () => {
    const r = EV(`setup(297, 2);
      var H = b._hz, t0 = H.t0, out = { hits: [], t0: t0 };
      var mk = function(x, y){ var q = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), x, y, 0); q.team = 0; q.controller = 'still'; q.stocks = 99; return q; };
      var f2 = mk(420, gy - 24), f3 = mk(297, gy - 24 - 320);
      fighters = [f, f2, f3];
      var at = [[297, gy - 24], [420, gy - 24], [297, gy - 24 - 320]];
      for (var i=0;i<330;i++){
        var p = f.pct, p2 = f2.pct, p3 = f3.pct; step();
        var dt = hazardT - t0;
        [f, f2, f3].forEach(function(q, k){ q.vx = 0; q.vy = 0; q.invuln = 0; q.x = at[k][0]; q.y = at[k][1]; });
        if (f.pct > p + 0.5) out.hits.push([dt, +(f.pct - p).toFixed(2)]);
        if (f2.pct > p2 + 0.5) out.near = true;
        if (f3.pct > p3 + 0.5) out.above = true;
      }
      out.full = bossDmg(); out.vx = FSB.vents[0]*WW;
      return out;`);
    expect(r.vx, 'the left vent stands at 0.27 of the arena').toBeCloseTo(297, 6);
    // the left vent fires in the first beat (frames 100-144 of the phase) and again in the third (270-314): one throw each, held in place
    expect(r.hits, `two eruptions, one hit each: ${JSON.stringify(r.hits)}`).toHaveLength(2);
    expect(r.hits[0][0]).toBeGreaterThanOrEqual(100);
    expect(r.hits[0][0]).toBeLessThan(144);
    expect(r.hits[1][0]).toBeGreaterThanOrEqual(270);
    expect(r.hits[1][0]).toBeLessThan(314);
    for (const h of r.hits) expect(h[1]).toBeCloseTo(r.full * 0.55, 5);
    expect(r.near, 'a fighter a hundred px away is not touched').toBeUndefined();
    expect(r.above, 'nor one above the column').toBeUndefined();
  });

  it('the Fire Monster snaps at anyone on the floor within reach of an edge (phase 2 on), 0.5 of a boss hit, then rests; a jump is safe, and phase 1 has none', () => {
    const r = EV(`var out = {};
      function bites(ph, y, n){ setup(40, ph); f.x = 40; f.y = y; var h = []; for (var i=0;i<n;i++){ var p = f.pct; step(); if (f.pct > p + 0.5) h.push([i, +(f.pct - p).toFixed(2), f.vx, f.vy]); f.x = 40; f.y = y; f.vx = 0; f.vy = 0; f.invuln = 0; } return h; }
      out.floor = bites(2, groundY() - 24, 260);
      out.air = bites(2, groundY() - 24 - 100, 200);
      out.p1 = bites(1, groundY() - 24, 200);
      out.full = bossDmg(); out.rise = FSB.biteRise - FSB.biteSnap; out.rest = FSB.biteRest;
      return out;`);
    expect(r.floor.length, 'bitten more than once while he stays put').toBeGreaterThanOrEqual(2);
    expect(r.floor[0][0], 'it rises first (34 frames to the snap at 12)').toBeGreaterThanOrEqual(r.rise - 2);
    expect(r.floor[0][0]).toBeLessThanOrEqual(r.rise + 2);
    for (const h of r.floor.slice(0, 2)) expect(h[1]).toBeCloseTo(r.full * 0.5, 5);
    expect(r.floor[0][2], 'spat back toward the middle (the left edge)').toBeGreaterThan(0);
    expect(r.floor[0][3], 'and up').toBeLessThan(0);
    expect(r.floor[1][0] - r.floor[0][0], 'then it rests before it rises again').toBeGreaterThanOrEqual(r.rest + r.rise - 4);
    expect(r.air, 'above it, nothing').toEqual([]);
    expect(r.p1, 'the crust holds in phase 1').toEqual([]);
  });

  it('phase 3: the eruption sends a tide of magma in from both edges (after a rumble), once a wave and along the floor only: the pad and the air are safe', () => {
    const r = EV(`var out = {};
      function tide(x, y, skipTo, n){
        setup(x, 3);
        b._hz = { ph:3, t0: hazardT - skipTo };
        f.x = x; f.y = y;
        var hits = [], vx = null;
        for (var i=0;i<n;i++){ var p = f.pct; step(); if (f.pct > p + 0.5){ hits.push([i, +(f.pct - p).toFixed(2)]); if (vx === null) vx = f.vx; } f.x = x; f.y = y; f.vx = 0; f.vy = 0; f.invuln = 0; b._atkTimer = 1e9; }
        return { hits: hits, vx: vx };
      }
      var pad = platRectsSmall()[0];
      out.tell = tide(200, groundY() - 24, FSB.waveStart + 10, 50);
      out.floor = tide(200, groundY() - 24, FSB.waveStart + FSB.waveTell, 200);
      out.right = tide(WW - 200, groundY() - 24, FSB.waveStart + FSB.waveTell, 200);
      out.pad = tide(550, pad.y - 24, FSB.waveStart + FSB.waveTell + 40, 150);
      out.air = tide(200, groundY() - 24 - 100, FSB.waveStart + FSB.waveTell + 40, 150);
      out.full = bossDmg(); out.WW = WW;
      return out;`);
    expect(r.tell.hits, 'the rumble before the wave hurts nobody').toEqual([]);
    expect(r.floor.hits, 'the wave throws you once').toHaveLength(1);
    expect(r.floor.hits[0][1]).toBeCloseTo(r.full * 0.7, 5);
    expect(r.floor.vx, 'toward the middle').toBeGreaterThan(0);
    expect(r.right.hits).toHaveLength(1);
    expect(r.right.vx, 'from the right edge too').toBeLessThan(0);
    expect(r.pad.hits, 'the pad is above it').toEqual([]);
    expect(r.air.hits, 'so is a jump').toEqual([]);
  });

  it("the hazard stops with him: a fallen boss's volcano no longer steps, and it still draws between bosses", () => {
    const r = EV(`setup(297, 2);
      var H = b._hz; run(3, 297); var before = JSON.stringify(H);
      b.hp = 0; arenaHazardStep(b, f); arenaHazardStep(b, f);
      var after = JSON.stringify(b._hz);
      var draws = 0; try { summons = []; drawArenaHazard('under'); drawArenaHazard('over'); draws = 1; } catch (e) { draws = e.message; }
      return { same: before === after, draws: draws };`);
    expect(r.same).toBe(true);
    expect(r.draws).toBe(1);
  });
});

describe('how he moves', () => {
  it('he floats over the floor line on his board (no gravity, no floor-snap), bobbing, and keeps his distance from you', () => {
    const r = EV(`setup(300);
      b.x = 800; var out = { hover: b.hover, ys: [], dists: [] };
      for (var i=0;i<360;i++){ run(1, 300); if (i > 100 && i%12 === 0){ out.ys.push(b.y); out.dists.push(Math.abs(b.x - 300)); } }
      out.want = gy - b.r - FSB.hoverH; out.floorY = gy - b.r; out.stand = FSB.stand;
      return out;`);
    expect(r.hover).toBe(true);
    for (const y of r.ys) {
      expect(Math.abs(y - r.want), 'around his hover height, bobbing a few px').toBeLessThan(14);
      expect(y, 'and off the floor, where the engine would put him').toBeLessThan(r.floorY - 12);
    }
    for (const d of r.dists) expect(Math.abs(d - r.stand), 'about 300 px from you, weaving a little').toBeLessThan(110);
  });

  it('he rockets in from off the screen on the board and takes his place; a wind-up that starts on the way cuts the entrance short', () => {
    const r = EV(`setup(300);
      var out = {};
      fsbDress(b); b._atkTimer = 1e9; var x0 = b.x, y0 = b.y;
      var xs = [], frames = 0; while (b._fs && frames < 200){ run(1, 300); xs.push(Math.round(b.x)); frames++; }
      out.frames = frames;
      out.x0 = x0; out.y0 = y0; out.xEnd = b.x; out.yEnd = b.y; out.want = gy - b.r - FSB.hoverH; out.fs = b._fs; out.rising = xs.slice(0, 40).every(function(x, j, a){ return j === 0 || x >= a[j-1]; });
      out.hover = b.hover; out.off = xs[0] < 0 || x0 < 0;
      // a wind-up on the way in: the entrance stops
      setup(300); fsbDress(b); b._atkTimer = 1; run(2, 300);
      out.cut = { tel: b._tel > 0, fs: b._fs && b._fs.k };
      return out;`);
    expect(r.x0, 'he starts off the screen').toBeLessThan(0);
    expect(r.y0, 'and above the floor').toBeLessThan(400);
    expect(r.rising).toBe(true);
    expect(r.frames, 'in about a second').toBeLessThanOrEqual(58);
    expect(r.xEnd, 'and stops 0.62 of the way across').toBeCloseTo(682, 0);
    expect(r.yEnd).toBeCloseTo(r.want, 0);
    expect(r.fs).toBe(null);
    expect(r.cut.tel, 'a wind-up began').toBe(true);
    expect(r.cut.fs, 'and cut the entrance short').not.toBe('enter');
  });

  it('a small hit while he is free flinches him (a hop); a big one drops him out of the bottom of the screen and he jumps back, once every five seconds at most', () => {
    const r = EV(`setup(300);
      var out = {};
      run(60, 300); var y0 = b.y;
      b.hp -= 3; run(1, 300); out.flinch = { vy: b.vy, fs: b._fs && b._fs.k };
      run(80, 300);
      b.hp -= 20; run(1, 300); out.fall = { fs: b._fs && b._fs.k };
      var maxY = -1e9, frames = 0; while (b._fs && frames < 400){ run(1, 300); maxY = Math.max(maxY, b.y); frames++; }
      out.maxY = maxY; out.WH = WH; out.frames = frames; out.backY = b.y; out.want = gy - b.r - FSB.hoverH; out.timer = b._atkTimer;
      // a second big hit inside the cooldown only flinches
      b.hp -= 20; run(1, 300); out.second = b._fs && b._fs.k;
      // ...and one after it, a fall again
      run(FSB.fallCd, 300); b._fs = null; b.hp -= 20; run(1, 300); out.third = b._fs && b._fs.k;
      return out;`);
    expect(r.flinch.vy, 'a hop').toBeLessThan(-2);
    expect(r.flinch.fs, 'and no more').toBe(null);
    expect(r.fall.fs).toBe('fall');
    expect(r.maxY, 'out of the bottom of the screen').toBeGreaterThan(r.WH);
    expect(r.frames, 'and back within a couple of seconds').toBeLessThan(140);
    expect(r.backY).toBeCloseTo(r.want, 0);
    expect(r.timer, 'his next turn is a short way off (a free opening, no change to what he hits for)').toBeLessThanOrEqual(50);
    expect(r.second).toBe(null);
    expect(r.third).toBe('fall');
  });
});

// A boot whose canvas records every call, so a test can see what was painted (and that no word was).
function bootRecording() {
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
      window.HTMLCanvasElement.prototype.getContext = () => rec;
      window.Math.random = mulberry32(3);
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
    },
  });
  return { w: dom.window, log };
}

describe('the volcano: sky, ground, dust and drawing', () => {
  it("lays its own ground (dark rock, its own floor line and its glowing courses) and its dust takes the rock's colour; without the arena the ground is Goiky's green", () => {
    const { w, log } = bootRecording();
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow(); running=false;`);
    const gy = w.eval('groundY()'), green = w.eval('stage.ground');
    const groundFill = () => log.filter((e) => e.op === 'fillRect' && e.args[0] === -20 && e.args[1] === gy).map((e) => e.fill);
    log.length = 0; w.eval('draw()');
    expect(groundFill()).toEqual([green]);
    const goikyDust = w.eval('impactGroundColor()');
    w.eval("BOSS_ARENA = 'volcano'");
    log.length = 0; w.eval('draw()');
    expect(groundFill(), 'the rock').toEqual(['#26170f']);
    expect(log.filter((e) => e.op === 'stroke').map((e) => e.stroke), 'its own floor line').toContain('#0d0705');
    expect(log.filter((e) => e.op === 'fillRect' && e.fill === 'rgba(255,255,255,0.04)').length, 'its courses of stone').toBeGreaterThan(5);
    expect(w.eval('impactGroundColor()'), 'the dust of a heavy hit is the rock, lightened').not.toBe(goikyDust);
    expect(w.eval('BOSS_ARENA_SKY.volcano')).toEqual(['#5a2c17', '#22100a']);
  });

  it('draws every state of him, his tells, his shots, the hazard in every phase and the backdrop without throwing, and puts no word on the screen', () => {
    const { w, log } = bootRecording();
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow(); running=false;`);
    log.length = 0;   // the match's own first frame (its fighters' name tags) is not his
    const err = w.eval(`(function(){
      try {
        BOSS_ARENA = 'volcano'; var gy = groundY();
        var mk = function(o){ var s = makeBossSummon(BOSS_ROSTER[2], 215); fsbDress(s); s._fs = null; s.x = 600; s.y = gy - s.r - 34; return Object.assign(s, o); };
        var states = [
          {}, { _tel:20, _telKind:'firewall', _fsKind:'rocketboard', _fsb:{ k:'board', bd:1, lk:0, d:-1, r:gy-44, r2:null } },
          { _tel:8, _fsKind:'rocketboard', _phase:3, _fsb:{ k:'board', bd:1, lk:1, d:1, r:gy-44, r2:gy-130 } },
          { _fsb:{ k:'board', p:1, bd:1, lk:1, d:-1, r:gy-44 } },
          { _tel:30, _fsKind:'furnace', _fsb:{ k:'furn', d:-1, g:2 } }, { _tel:10, _fsKind:'furnace', _phase:3, _fsb:{ k:'furn', d:1, g:4, j:30 } },
          { _tel:30, _fsKind:'youmust', _telX:500, _fsb:{ k:'hooks', lk:0 } }, { _telX:500, _fsb:{ k:'hooks', p:1, h:12, lk:1 } },
          // Round 17: the clone's row from phase 2 (lit while it is still to come: cl), and the second pinch's mark (following you, then locked)
          { _tel:30, _fsKind:'rocketboard', _phase:2, _fsb:{ k:'board', bd:1, lk:0, d:1, r:gy-44, r2:gy-130 } },
          { _phase:2, _fsb:{ k:'board', p:1, bd:1, lk:1, d:-1, r:gy-44, r2:gy-130, cl:1 } }, { _phase:3, _fsb:{ k:'board', p:1, bd:1, lk:1, d:1, r:gy-130, r2:gy-44, cl:1 } },
          { _phase:2, _fsb:{ k:'hooks', p:1, x2:400, h2:40, lk2:0 } }, { _phase:2, _fsb:{ k:'hooks', p:1, x2:400, h2:20, lk2:1 } }, { _phase:3, _fsb:{ k:'hooks', p:1, x2:700, h2:3, lk2:1 } },
          { _tel:30, _fsKind:'tlc', _fsb:{ k:'tlc', x:400, n:1 } }, { _fsb:{ k:'tlc', p:1, x:400, n:4 } }, { _fsb:{ k:'tlc', p:1, x:400, n:5 } },
          { _phase:3, _rage:true, _fsb:{ k:null, q:80 } }, { _phase:3, _rage:true, _fsb:{ k:null, q:0, f:6 }, flash:6 }, { face:-1, flash:8 }
        ];
        states.forEach(function(st){ var s = mk(st); summons = [s]; ctx.save(); ctx.translate(s.x, s.y); drawBossSprite(s); ctx.restore(); fsbDrawFx(s); drawArenaDecor('volcano'); });
        [1, 2, 3].forEach(function(ph){
          var s = mk({ _phase:ph }); summons = [s];
          [0, 30, 90, 150, 200, 320, 420, 470, 620].forEach(function(dt){ s._hz = { ph:ph, t0:hazardT - dt, ml:20, mr:-30, wn:0, b0:0, b1:0 }; drawArenaHazard('under'); drawArenaHazard('over'); });
          s._hz = { ph:ph, t0:hazardT - 100, ml:30, mr:14 }; drawArenaHazard('under');
        });
        summons = []; drawArenaHazard('under'); drawArenaDecor('volcano');
        var p = function(o){ return Object.assign({ x:300, y:300, owner:-2, ownerObj:{ team:-1, idx:-2 }, vx:5, vy:0, r:20, color:'#ff8a3a' }, o); };
        [p({ shape:'fsbplate', r:34 }), p({ shape:'fsbplatehot', r:34, vx:-9 }), p({ shape:'fsbarm', r:30 }), p({ shape:'fsbarm', r:30, vx:-13 }), p({ shape:'fsbboard', r:44, vx:22 }),
         p({ shape:'fsbboard', r:44, vx:-22 }), p({ shape:'fsbmonster', r:21 }), p({ shape:'spark', r:14, vx:0 }), p({ shape:'ember', r:15 }), p({ shape:'fsbpart1', r:12, vx:0 }),
         p({ shape:'fsbpart2', r:12 }), p({ shape:'fsbpart3', r:12 }), p({ shape:'fsbpart4', r:12 }), p({ shape:'fsbpart5', r:12 }), p({ shape:'fsbpart6', r:12 }), p({ shape:'fsbpart7', r:12 })]
          .forEach(function(pr){ drawProjectile(pr); });
        ['fsbplate','fsbplatehot','fsbarm','fsbboard','fsbmonster','fsbpart1','fsbpart7'].forEach(function(k){ ctx.save(); PROJ_SHAPE[k].draw(ctx, 20, null); ctx.restore(); });
        return 'ok';
      } catch(e){ return e.message + ' ' + (e.stack||'').split('\\n')[1]; }
    })()`);
    expect(err).toBe('ok');
    const words = log.filter((e) => e.op === 'fillText' || e.op === 'strokeText');
    expect(words, 'no word on the screen, from him or his arena').toEqual([]);
    expect(log.length, 'and something was drawn').toBeGreaterThan(500);
  });

  // The glitch pass, Round 17: with several fighters on the floor the hunter found a hook slap someone 5 frames after it appeared on him -- the hooks start a span out either side of the spot, and nothing
  // showed where. The pinch mark now draws a gate on the floor at each start (and a chevron pointing at the spot), for the first pinch and the second.
  it('the pinch mark draws a gate on the floor where each hook comes in from, a span either side of the spot (340 px in phase 1, 360 in phase 2), for the second pinch as well; a gate off the screen is not drawn', () => {
    const { w, log } = bootRecording();
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow(); running=false;`);
    const gates = (state) => {
      log.length = 0;
      w.eval(`(function(){ BOSS_ARENA = 'volcano'; var s = makeBossSummon(BOSS_ROSTER[2], 215); fsbDress(s); s._fs = null; s.x = 600; s.y = groundY() - s.r - 34; Object.assign(s, ${state}); summons = [s]; fsbDrawFx(s); })()`);
      return log.filter((e) => e.op === 'ellipse' && e.args[2] === 28 && e.args[3] === 10).map((e) => Math.round(e.args[0])).sort((a, b) => a - b);
    };
    expect(gates('{ _tel:30, _telX:500, _fsb:{ k:"hooks", lk:0 } }'), 'phase 1: 340 either side of the mark').toEqual([160, 840]);
    expect(gates('{ _phase:2, _tel:30, _telX:500, _fsb:{ k:"hooks", lk:0 } }'), 'phase 2: 360').toEqual([140, 860]);
    const WWv = w.eval('WW');   // (the world is as wide as this window makes it)
    expect(gates('{ _phase:2, _fsb:{ k:"hooks", p:1, x2:' + (WWv - 200) + ', h2:20, lk2:1 } }'), 'the second pinch\'s mark has its gates too').toEqual([WWv - 200 - 360]);   // (the far one would be off the screen: not drawn)
    expect(gates('{ _phase:2, _fsb:{ k:"hooks", p:1, x2:' + Math.round(WWv/2) + ', h2:20, lk2:1 } }'), 'both, either side, for a mark in the middle').toEqual([Math.round(WWv/2) - 360, Math.round(WWv/2) + 360]);
    expect(gates('{ _phase:2, _fsb:{ k:"hooks", p:1, x2:100, h2:20, lk2:1 } }'), 'the one that would be off the screen is not drawn').toEqual([460]);
  });
});

describe('his ending: broken into seven pieces', () => {
  it('when he falls his shots are swept and the seven pieces fly up out of where he fell, clatter on the floor twice and are gone before the next boss, hurting nobody; the BOSS DOWN card waits for the scene and no word is said but it', () => {
    const r = EV(`var st = setTimeout, timers = [], said = [], _b = banner;
      setTimeout = function(fn, ms){ timers.push({ fn: fn, ms: ms }); return 0; };
      banner = function(t, m, k, l){ said.push([String(t), k || null]); return _b(t, m, k, l); };
      try {
        setup(200); BOSSRUSH.active = true;
        b.x = 600; b.y = gy - b.r - FSB.hoverH;
        projectiles = [{ owner:-2, fsb:true, x:0, y:0, r:8, life:50 }, { owner:-2, fsbPlate:true, fsb:true, x:9, y:0, r:8, life:50 }, { owner:-2, x:5, y:5, r:8, life:50 }];
        var out = { E: Object.keys(BOSS_ENDINGS.firewall), hold: BOSS_ENDINGS.firewall.holdMs, line: BOSS_ENDINGS.firewall.line, end: FSB.endHold };
        b.hp = 0; bossRushCheck();
        out.said = said.slice();
        out.ms = timers.map(function(t){ return t.ms; });
        var pieces = projectiles.filter(function(p){ return p.fsbPiece; });
        out.n = pieces.length; out.shapes = pieces.map(function(p){ return p.shape; }).sort();
        out.swept = projectiles.filter(function(p){ return p.fsb; }).length; out.others = projectiles.filter(function(p){ return !p.fsb && !p.fsbPiece; }).length;
        out.from = pieces.map(function(p){ return [Math.round(p.x), p.vy < 0]; });
        out.team = pieces.every(function(p){ return p.ownerObj.team === 0 && p.dmg === 0; });
        var pct0 = f.pct, all = pieces.slice(), over = 0, minX = 1e9, maxX = -1e9;
        for (var i=1;i<=200;i++){
          step(); f.x = 600; f.y = gy - 24; f.vx = 0; f.vy = 0; f.invuln = 0;
          for (var p of projectiles) if (p.fsbPiece){ over = i; minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); }
        }
        out.pct = f.pct - pct0;
        out.over = over; out.frames = Math.round((1500 + BOSS_ENDINGS.firewall.holdMs)/1000*60); out.onScreen = minX >= 0 && maxX <= WW;
        out.bounces = all.map(function(p){ return p.bounces; }); out.left = projectiles.filter(function(p){ return p.fsbPiece; }).length;
        var down = timers.find(function(t){ return t.ms === FSB.endHold && String(t.fn).indexOf('downCard') >= 0; }), run0 = running;
        running = true; if (down) down.fn(); running = run0;
        out.after = said.slice(out.said.length);
        return out;
      } finally { setTimeout = st; banner = _b; BOSSRUSH.active = false; summons = []; projectiles = []; }`);
    expect(r.E, 'his exit scene is his own').toEqual(['sweep', 'begin', 'holdMs']);
    expect(r.hold).toBe(r.end);
    expect(r.hold, 'over a second, so the pieces land before the card').toBeGreaterThanOrEqual(1000);
    expect(r.line, 'no line: no text').toBeUndefined();
    expect(r.said.some(([, k]) => k === 'boss'), 'no word at the scene').toBe(false);
    expect(r.ms).toContain(r.hold);
    expect(r.ms, 'the next boss waits 1.5 s and the scene').toContain(1500 + r.hold);
    expect(r.n, 'seven pieces').toBe(7);
    expect(r.shapes).toEqual(['fsbpart1', 'fsbpart2', 'fsbpart3', 'fsbpart4', 'fsbpart5', 'fsbpart6', 'fsbpart7']);
    expect(r.swept, 'his shots are swept').toBe(0);
    expect(r.others, 'and nothing else is').toBe(1);
    for (const [x, up] of r.from) { expect(Math.abs(x - 600), 'out of where he fell').toBeLessThan(60); expect(up, 'flung up').toBe(true); }
    expect(r.team, 'they belong to the fighters\' side and carry no damage').toBe(true);
    expect(r.pct, 'and hurt nobody who stands under them').toBe(0);
    expect(r.bounces, 'each lands on the floor twice, and crumbles on the second').toEqual([2, 2, 2, 2, 2, 2, 2]);
    expect(r.left, 'none is left').toBe(0);
    expect(r.over, 'the scene is over before the next boss arrives (1.5 s after the card, which waits the scene)').toBeLessThan(r.frames);
    expect(r.over, 'and it lasted: they are not gone at once').toBeGreaterThan(60);
    expect(r.onScreen, 'all of it on screen').toBe(true);
    expect(r.after.some(([t, k]) => /^BOSS DOWN!/.test(t) && k === 'sys'), 'then the card').toBe(true);
  });

  it('when he falls near a side the pieces fly toward the middle, so the scene stays on screen', () => {
    const r = EV(`setup(200);
      var out = {};
      for (var x of [90, 930]){
        projectiles = []; fsbEnding({ x: x, y: gy - 100, r: 85 });
        var ps = projectiles.filter(function(p){ return p.fsbPiece; });
        out[x] = { n: ps.length, dirs: ps.map(function(p){ return Math.sign(p.vx); }) };
      }
      projectiles = [];
      return out;`);
    expect(r[90].n).toBe(7);
    expect(r[90].dirs, 'from the left side they go right').toEqual([1, 1, 1, 1, 1, 1, 1]);
    expect(r[930].dirs, 'from the right side they go left').toEqual([-1, -1, -1, -1, -1, -1, -1]);
  });
});

describe('what the player sees: the show\'s art, credited', () => {
  const man = JSON.parse(readFileSync('scripts/attack-sprite-manifest.json', 'utf8'));
  const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
  const picks = readFileSync('scripts/fetch-attack-sprites.mjs', 'utf8');
  const FILES = { fsbarm: 'Fsb arm.png', firemonster: 'Fire Monster.png', fsbpart1: 'Fsb 1.png', fsbpart2: 'Fsb 2.png', fsbpart3: 'Fsb 3.png', fsbpart4: 'Fsb 4.png', fsbpart5: 'Fsb 5.png', fsbpart6: 'Fsb 6.png', fsbpart7: 'Fsb 7.png' };

  it('his arm, the Fire Monster and the seven pieces are the wiki\'s files: real transparent PNGs of projectile size, recorded with their source, picked in his slot and credited in his', () => {
    for (const [name, title] of Object.entries(FILES)) {
      const e = man[name];
      expect(e, name).toBeTruthy();
      expect(e.srcTitle).toBe(title);
      expect(e.source).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/battlefordreamisland\/images\//);
      const file = 'artifacts/V1/assets/sprites/attacks/' + e.file;
      expect(existsSync(file), file).toBe(true);
      const png = PNG.sync.read(readFileSync(file));
      expect([png.width, png.height], 'the manifest knows its size').toEqual([e.width, e.height]);
      expect(Math.max(png.width, png.height), `${e.file} is projectile-sized`).toBeLessThanOrEqual(128);
      expect(Math.max(png.width, png.height)).toBeGreaterThanOrEqual(24);
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      expect(clear / (png.width * png.height), `${e.file} is transparent round the object`).toBeGreaterThan(0.12);
      expect(e.key, 'lifted whole from a file, nothing keyed out of a frame').toBeUndefined();
      expect(credits, `${e.file} is credited with its source`).toContain(`(${e.file})`);
      expect(credits).toContain(e.source);
    }
    // the picks and the credits are between his own markers
    const between = (text, begin, end) => text.slice(text.indexOf(begin), text.indexOf(end));
    const myPicks = between(picks, '@boss:firey:begin picks', '@boss:firey:end picks');
    const myCredits = between(credits, '@boss:firey:begin credits', '@boss:firey:end credits');
    for (const [name, title] of Object.entries(FILES)) { expect(myPicks, `${name} is picked in his slot`).toContain(`file: '${title}'`); expect(myCredits, `${name} is credited in his slot`).toContain(`File:${title}`); }
  });

  it("the game draws them: an entry for each in ATTACK_SPRITES with a drawn glyph to fall back on, the arm's hook leading either way, the pieces tumbling", () => {
    const r = W.eval(`(function(){
      var keys = ['fsbarm','fsbmonster','fsbpart1','fsbpart2','fsbpart3','fsbpart4','fsbpart5','fsbpart6','fsbpart7'];
      return { keys: keys.map(function(k){ return [k, !!ATTACK_SPRITES[k], !!PROJ_SHAPE[k], ATTACK_SPRITES[k] && ATTACK_SPRITES[k].src]; }),
               arm: ATTACK_SPRITES.fsbarm, part: ATTACK_SPRITES.fsbpart3, plates: [typeof PROJ_SHAPE.fsbplate.draw, typeof PROJ_SHAPE.fsbplatehot.draw, typeof PROJ_SHAPE.fsbboard.draw] };
    })()`);
    for (const [k, sprite, glyph, src] of r.keys) {
      expect(sprite, k).toBe(true);
      expect(glyph, `${k} has a glyph to fall back on`).toBe(true);
      expect(existsSync('artifacts/V1/' + src), src).toBe(true);
    }
    expect(r.arm.flipX, 'the hook leads whichever way it travels').toBe(true);
    expect(r.part.spin, 'a piece tumbles as it flies').toBe(true);
    expect(r.plates, 'the plates and the clone are drawn').toEqual(['function', 'function', 'function']);
  });

  it('RAGE MODE\'s render is the metal box on his own hoverboard: 141x200 like the render it is built on, transparent, steel grey above a red board, credited, with a drawn body under it', () => {
    const file = 'artifacts/V1/assets/sprites/firey-speaker-box-metal.png', base = 'artifacts/V1/assets/sprites/firey-speaker-box.png';
    expect(existsSync(file)).toBe(true);
    const png = PNG.sync.read(readFileSync(file)), orig = PNG.sync.read(readFileSync(base));
    expect([png.width, png.height], 'the render\'s own size').toEqual([orig.width, orig.height]);
    const px = (p, x, y) => { const i = (y * p.width + x) * 4; return [p.data[i], p.data[i + 1], p.data[i + 2], p.data[i + 3]]; };
    expect([px(png, 0, 0)[3], px(png, png.width - 1, 0)[3], px(png, 0, png.height - 1)[3], px(png, png.width - 1, png.height - 1)[3]], 'transparent corners, not a sticker').toEqual([0, 0, 0, 0]);
    // the box: dark steel, no orange left in it
    let steel = 0, orange = 0, n = 0;
    for (let y = 12; y < 100; y++) for (let x = 40; x < 100; x++) { const [r, g, b, a] = px(png, x, y); if (a < 200) continue; n++; if (r > 200 && g > 100 && g < 200 && b < 90) orange++; if (Math.max(r, g, b) - Math.min(r, g, b) < 24) steel++; }
    expect(orange, 'no orange left in the box').toBe(0);
    expect(steel / n, 'the box is grey').toBeGreaterThan(0.9);
    // the board under it is his, untouched: the same pixels as the render's, thrusters and flames too
    let same = 0, total = 0;
    for (let y = 110; y < 200; y++) for (let x = 0; x < png.width; x++) { const a = px(png, x, y), o = px(orig, x, y); if (a[3] > 0 || o[3] > 0){ total++; if (a.every((v, i) => v === o[i])) same++; } }
    expect(same / total, 'the board, the thrusters and the flames are the render\'s').toBeGreaterThan(0.98);
    expect(credits.split('\n').find((l) => l.includes('`firey-speaker-box-metal.png`')) || '', 'credited with both its sources').toMatch(/Metal_FSB_front\.png[\s\S]*BFDIA-7FlyingFireySpeaker\.png/);
    const r = W.eval(`({ src: BOSS_SPRITE_SRC.speakerfireymetal, flip: !!BOSS_SPRITE_FLIP.speakerfireymetal, fallback: String(drawBossSprite).indexOf('case "speakerfireymetal"') >= 0,
      look1: bossLook({ attack:'firewall', sprite:'speakerfirey', _phase:1 }), look3: bossLook({ attack:'firewall', sprite:'speakerfirey', _phase:3, _fsb:{ q:0 } }), lookQuake: bossLook({ attack:'firewall', sprite:'speakerfirey', _phase:3, _fsb:{ q:50 } }),
      lookOther: bossLook({ attack:'swarm', sprite:'bug', _phase:3 }) })`);
    expect(r.src).toBe('assets/sprites/firey-speaker-box-metal.png');
    expect(r.flip, 'facing right, like the render').toBe(false);
    expect(r.fallback, 'a drawn body for it until it loads').toBe(true);
    expect([r.look1, r.look3, r.lookQuake, r.lookOther]).toEqual(['speakerfirey', 'speakerfireymetal', 'speakerfirey', 'bug']);
  });

  it("the clone is his render a shade darker, and the show's own art is never drawn over with words", () => {
    const src = W.eval('String(fsbCloneTint) + String(fsbDrawBoard)');
    expect(src).toMatch(/rgba\(70,30,0,0\.30\)/);
    expect(src).toMatch(/speakerfirey/);
  });
});

describe('no words on screen in his fight', () => {
  it('the whole fight -- all four attacks in all three phases, the quake, the ending -- says nothing but the boss telegraphs, the phase cards and BOSS DOWN', () => {
    const r = EV(`window.__banners = []; var _b = banner; banner = function(t, m, k, l){ window.__banners.push({ text: String(t), kind: k || null }); return _b(t, m, k, l); };
      var st = setTimeout; setTimeout = function(){ return 0; };
      try {
        setup(300); BOSSRUSH.active = true;
        [[0,0],[1,0],[0,1],[3,0]].forEach(function(m){
          [1, 2, 3].forEach(function(ph){
            if (ph > 1 && b._phase !== ph){ b.hp = b.maxHp*(ph === 2 ? 0.5 : 0.2); b._atkTimer = 1e9; run(2, 300); var q = 0; while ((b._fs || b._fsQ > 0) && q++ < 400){ b._atkTimer = 1e9; run(1, 300); } }   // the phase turns; a big hit drops him off the screen, phase 3 quakes: let both run out
            b._fs = null; b.x = 700; b._pickForce = (m[0] === 1 ? 'furnace' : (m[0] === 3 ? 'youmust' : (m[1] === 1 ? 'tlc' : 'rocketboard'))); b._atkLive = null; b._atkTimer = 1; b._tel = 0;
            var n = 0; while ((b._tel > 0 || b._atkTimer <= 1 || b._fs) && n < 900){ run(1, 300); n++; if (b._fs === null && b._tel === 0 && n > 3 && b._atkTimer > 20) break; }
          });
        });
        b.hp = 0; bossRushCheck();
        for (var i=0;i<60;i++) step();
        return window.__banners.slice();
      } finally { setTimeout = st; banner = _b; BOSSRUSH.active = false; summons = []; projectiles = []; }`);
    const kinds = new Set(r.map((b) => b.kind));
    expect([...kinds].every((k) => k === 'boss' || k === 'sys' || k === null), `only boss and sys lines: ${[...kinds]}`).toBe(true);
    const named = r.filter((b) => b.kind === 'boss').map((b) => b.text);
    expect(new Set(named)).toEqual(new Set(['ROCKET BOARD!', 'FURNACE!', 'THE TLC NEEDS TO BE FIXED!', 'YOU MUST!']));
    const others = r.filter((b) => b.kind !== 'boss').map((b) => b.text);
    for (const t of others) expect(t, `a card, not a line about a move: ${t}`).toMatch(/^(Firey Speaker Box . PHASE [23]: |BOSS DOWN!|BOSS: )/);
  });
});

describe('a netcode client sees him', () => {
  it('his tells, his marks, his plates and hooks, his hazard and his phase cross the snapshot and draw on the client', () => {
    const { window: w } = loadMonolith();   // the harness with gradients, as test/net-lobby.test.js uses: drawBossBar needs one
    const r = w.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow();
      BOSS_ARENA = 'volcano'; var gy = groundY();
      var s = makeBossSummon(BOSS_ROSTER[2], 215); fsbDress(s); s._fs = null; s.x = 500; s.y = gy - s.r - 34; s._phase = 3; s._tel = 20; s._telKind = 'firewall'; s._fsKind = 'rocketboard'; s._telX = 640;
      s._fsb = { k:'board', bd:1, lk:1, d:-1, r:gy - 44, r2:gy - 130, g:4, q:0, f:0, j:12, x:400, n:1, p:1, h:9 };
      s._hz = { ph:3, t0:0, ml:20, mr:-30, wn:0, wid:5, b0:1, g0:3, b1:2, g1:4 };
      summons = [s];
      var pj = function(o){ return Object.assign({ owner:-2, ownerObj:{ team:-1, idx:-2 }, vx:5, vy:0, r:20, color:'#ff8a3a', life:50 }, o); };
      projectiles = [pj({ x:300, y:gy-34, shape:'fsbplatehot', r:34, vx:-13 }), pj({ x:200, y:gy-46, shape:'fsbarm', r:30, vx:13 }), pj({ x:900, y:gy-130, shape:'fsbboard', r:44, vx:-22, delay:9 }),
                     pj({ x:600, y:gy-8, shape:'fsbpart4', r:12, vx:0 }), pj({ x:500, y:gy-16, shape:'ember', r:15, vx:-7 })];
      var snap = JSON.parse(JSON.stringify(serializeState()));
      summons = []; projectiles = []; BOSS_ARENA = null;
      applySnapshot(snap);
      var err = null; try { summons.forEach(drawSummon); projectiles.forEach(drawProjectile); drawBossBar(); drawArenaDecor(BOSS_ARENA); draw(); } catch(e){ err = e.message + ' ' + (e.stack || '').split('\\n')[1]; }
      var m = snap.summons.find(function(q){ return q.attack === 'firewall'; });
      return { err: err, fsb: m._fsb, hz: m._hz, phase: m._phase, tel: m._tel, telX: m._telX, arena: BOSS_ARENA, look: bossLook(summons.find(function(q){ return q.attack === 'firewall'; })),
               shapes: snap.pj.a.map(function(row){ return row[8] && row[8].shape; }), client: summons.find(function(q){ return q.attack === 'firewall'; })._fsb, len: JSON.stringify(m._fsb).length + JSON.stringify(m._hz).length };
    })()`);
    expect(r.err).toBe(null);
    expect(r.fsb, 'the tell and its marks').toMatchObject({ k: 'board', bd: 1, lk: 1, d: -1, g: 4, j: 12, x: 400, n: 1, p: 1, h: 9 });
    expect(r.hz, 'the hazard\'s state').toMatchObject({ ph: 3, t0: 0, ml: 20, mr: -30 });
    expect(r.telX, 'the spot the hooks close on').toBe(640);
    expect(r.client).toMatchObject({ k: 'board', lk: 1, r: expect.any(Number) });
    expect(r.arena, 'a client draws the volcano').toBe('volcano');
    expect(r.look, 'a client picks his render from the phase').toBe('speakerfireymetal');
    expect(r.shapes, 'every shot of his crosses with its shape').toEqual(['fsbplatehot', 'fsbarm', 'fsbboard', 'fsbpart4', 'ember']);
    expect(r.len, 'and it is a handful of numbers').toBeLessThan(400);
  });
});

describe('nothing of his names anyone from the OSC', () => {
  it('no code, no string, no name in his fight refers to OJ, Suitcase or Cabby, or to the Floor', () => {
    const src = W.eval(`Object.getOwnPropertyNames(globalThis).filter(function(k){ return /^fsb/.test(k) && typeof globalThis[k] === 'function'; }).map(function(k){ return String(globalThis[k]); })
      .concat([JSON.stringify(FSB), String(BOSS_MOVES.rocketboard), String(BOSS_MOVES.furnace), String(BOSS_MOVES.youmust), String(BOSS_MOVES.tlc), BOSS_MOVE_NAME.furnace, BOSS_MOVE_NAME.youmust, JSON.stringify(BOSS_ENDINGS.firewall && Object.keys(BOSS_ENDINGS.firewall))]).join('\\n')`);
    expect(src.length, 'his functions were found').toBeGreaterThan(20000);
    expect(src).not.toMatch(/\bOJ\b|Suitcase|Cabby/i);
    expect(src, 'nor the place called The Floor (a plain "the floor" is the ground he stands over)').not.toMatch(/The Floor/);
  });
});

describe('his fire patches do not stun-lock', () => {
  it('a patch lying on the floor skips a fighter still in hitstun, and burns one who has got up', () => {
    // The glitch hunter's stun-lock warning: a fighter knocked into a lingering patch was burned again before getting up. The owner
    // (2026-10-01): "theyre unavoidable bcs they barely have a moment where you can move to dodge."
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.stocks=99; running=true;
      BOSSRUSH = { active:false, bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.name==='Firey Speaker Box'; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
      worldPlats=platRectsSmall(); summons=[]; projectiles=[]; items=[]; particles=[];
      var f = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 500, groundY()-24, 0);
      f.team=0; f.controller='still'; fighters=[f];
      spawnBossRushBoss();
      var b = summons.find(function(s){ return s.type==='boss'; }); b._atkTimer = 1e9; b.x = 950;
      var p = fsbPatch(b, 500, ++BOSS_ATK_ID, 200);
      f.x = 500; f.y = groundY()-24; f.vx = 0; f.vy = 0; f.pct = 0; f.invuln = 0; f.hitstun = 30;
      step(); var stunned = f.pct;
      f.hitstun = 0; f.invuln = 0; f.x = 500; f.y = groundY()-24;
      step(); var up = f.pct;
      return { flag: !!p.noStunHit, stunned: stunned, up: up };
    })()`);
    expect(r.flag).toBe(true);
    expect(r.stunned, 'still reeling: the patch waits').toBe(0);
    expect(r.up, 'up again: it burns').toBeGreaterThan(0);
  });
});
