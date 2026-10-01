import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';
import { loadMonolith } from './helpers/load-monolith.js';

// "replace him with springy" (2026-09-28). Steve Cobs became the second secret boss, so his Boss Rush slot is Springy's:
// "Springy the Spring was the former secondary antagonist in Inanimate Insanity Invitational ... He is the mascot of
// Springtastic!, and a leader of The Unvitational Committee" (his II wiki page). Boss 11, after Two and before Four, at the
// slot's HP class (330). Every move is a power his page lists or a thing he did on screen: the jump ("Enhanced jump: Being a
// spring, they are capable of jumping extremely high distances"), the arms ("Extendable Arms: Springy can extend and
// retract his arms"), the cereal boxes ("The boxes have a ray that pull people up into them"), the glitching, the
// ELECTRIC FENCE door, and his ending -- "Lava, then MeLife revival", the owner's pick (2026-09-29). Nothing of his rests on
// the OSC: Spring!Suitcase and SpringCabby exist in canon and are never dropped (a test below checks).

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// A still Firey on the floor at `x`, in Boss Rush with the gauntlet logic off (BOSSRUSH.active false), and Springy spawned
// the way the gauntlet spawns him (so his bounce pad is placed). His attack timer is parked unless `live` is set.
const STAGE = (x, live) => `
  SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
  BOSSRUSH = { active:false, bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.name==='Springy'; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), ${x}, groundY()-24, 0);
  f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
  spawnBossRushBoss();
  var b = summons.find(function(s){ return s.type==='boss'; });
  ${live ? '' : 'b._atkTimer = 1e9;'}
  step(); f.pct=0; f.invuln=0;
`;
// A bare Springy for driving his functions directly.
const S = (o = '') => `{ name:'Springy', attack:'springy', x:700, y:groundY()-88, r:88, hp:100, maxHp:100, _phase:1, _atkTimer:1, _tel:0,
  color:'#afafaf', face:-1, homeX:700, stationary:false, vx:0, vy:0 ${o ? ',' + o : ''} }`;
const SPRINGY_ROW = { name: 'Springy', color: '#afafaf', hp: 330, big: 2.6, attack: 'springy', arena: 'cerealbox', stationary: false, sprite: 'springy' };
const COBS_ROW = { name: 'Steve Cobs', color: '#f0d010', hp: 330, big: 2.6, attack: 'cobs', arena: 'meeple', stationary: true, sprite: 'cobs' };

describe('Springy takes Boss 11', () => {
  it('is Boss 11, after Two and before Four, with his signature, his second moves and his art; Steve Cobs is off the roster, his code whole', () => {
    const r = W.eval(`(function(){
      var idx = function(n){ return BOSS_ROSTER.findIndex(function(b){ return b.name===n; }); };
      var i = idx('Springy');
      return { i: i, row: BOSS_ROSTER[i], two: idx('Two'), mephone: idx('MePhone4'), s4: idx('MePhone4S'), four: idx('Four'), cobs: idx('Steve Cobs'), n: BOSS_ROSTER.length,
               extra: BOSS_EXTRA['Springy'], moves: BOSS_EXTRA['Springy'].map(function(k){ return typeof BOSS_MOVES[k] + '/' + BOSS_MOVE_NAME[k]; }),
               cobsRow: COBS_ROW, cobsExtra: BOSS_EXTRA['Steve Cobs'], cobsCode: [typeof cobsContraption, typeof cobsPunch, typeof cobsBeginTelegraph, typeof BOSS_MOVES.knife, typeof BOSS_MOVES.kernels, typeof COBS, BOSS_SPRITE_SRC.cobs],
               table: SPRINGY };
    })()`);
    expect(r.row).toEqual(SPRINGY_ROW);
    expect(r.i, 'Boss 11').toBe(10);
    expect(r.i).toBeGreaterThan(r.two);
    expect(r.i, 'after both MePhones').toBeGreaterThan(Math.max(r.mephone, r.s4));
    expect(r.i, 'before Four, or he is never reached').toBe(r.four - 1);
    expect(r.four, 'Four is still last').toBe(r.n - 1);
    expect(r.n, 'the gauntlet is still twelve long').toBe(12);
    expect(r.row.hp, "between Two's 285 and Four's 340, so the curve still climbs").toBeGreaterThan(285);
    expect(r.row.hp).toBeLessThan(340);
    // The owner's one more for him (Round 10, 2026-09-29), verbatim: "give him 1 more: the bot toy, which will copy the 1st 5 specials used after
    // spawning 3 times." -> "it copies the 5 specials 3 times before expiring." It is the third second move, appended, so his first five turns run as they did.
    expect(r.extra).toEqual(['longarm', 'boxdrop', 'springbot']);
    expect(r.moves).toEqual(['function/JUST WANTED A HAND!', 'function/A TOY IN EVERY BOX!', 'function/MY PURPOSE!']);
    // "replace him with springy": Steve Cobs is the secret boss now -- not a roster row, never rolled, never in the gauntlet --
    // and every piece of his code is kept for that fight (COBS_ROW is his old row, whole)
    expect(r.cobs, 'Steve Cobs is not a Boss Rush boss').toBe(-1);
    expect(r.cobsRow).toEqual(COBS_ROW);
    expect(r.cobsExtra).toEqual(['knife', 'kernels']);
    expect(r.cobsCode).toEqual(['function', 'function', 'function', 'function', 'function', 'object', 'assets/sprites/steve-cobs.png']);
    expect(r.table.slams, 'one slam, then two, then three').toEqual([0, 1, 2, 3]);
    expect(r.table.holeT[3], 'phase 3 holes stay open longer').toBeGreaterThan(r.table.holeT[1]);
  });

  it('walking the gauntlet spawns him eleventh; beating him sweeps his holes, mark, toys, boxes and pad, and moves on to Four', () => {
    const r = W.eval(`(function(){
      var st = setTimeout, timers = []; setTimeout = function(fn, ms){ timers.push({ fn: fn, ms: ms }); return 0; };   // bossRushCheck queues the next spawn; this walk spawns by hand
      try {
        SETTINGS.mode='boss'; SETTINGS.stocks=99; running=true;
        BOSSRUSH = { active:true, bossIdx:0, cleared:0, defeated:false, loop:0, dmgMult:1 };
        worldPlats = [{ x:400, y:300, w:200, h:14 }];
        var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 200, groundY()-24, 0);
        f.team=0; f.controller='still'; f.stocks=3; fighters=[f]; summons=[];
        var order = [], atHim = null, card = null;
        for (var i=0;i<16;i++){
          spawnBossRushBoss();
          var b = summons.find(function(s){ return s.type==='boss'; });
          order.push(b.name);
          if (b.name==='Springy'){
            projectiles = [];   // "Endings: 'All of them' -- every boss gets a short canon exit scene when beaten" (the owner): the boss before him left its scene's shots (Firey Speaker Box's 7 pieces) and this walk steps no frame; a scene is over before the next boss arrives
            var padBefore = worldPlats.filter(function(p){ return p._springy && p.bouncy; }).length;
            projectiles = [];   // an earlier boss's ending scene (Purple Face's box is a shot that plays out over 108 frames) is still on the stage: this walk never steps a frame
            springyHole(300, 1, ++BOSS_ATK_ID); springyPlaceBox(600, groundY());
            projectiles.push({ owner:-2, springMark:true, springy:true, delay:1e6, x:300, y:800, r:1, life:1 },
                             { owner:-2, springy:true, shape:'springtoy', x:500, y:500, r:18, life:50 },
                             { owner:-2, x:0, y:0, r:8, life:50 });
            var idx0 = BOSSRUSH.bossIdx, box = worldPlats.filter(function(p){ return p._springy && p.solid; }).length;
            b.hp = 0; bossRushCheck();
            // the sweep, then the ending opens the one hole he goes down (springyEnding): that is the only thing of his left
            var left = projectiles.filter(function(p){ return p.springy; });
            atHim = { padBefore: padBefore, box: box, hisLeft: left.length, endingHole: left.length === 1 && !!left[0].springHole && left[0].x === b.x && left[0].delay === SPRINGY_END.lava + 4,
                      othersLeft: projectiles.filter(function(p){ return !p.springy && !p.dragonEnd; }).length,   // (the Dragon's ending, playing since it fell earlier in this walk, is its own scene: "Endings: 'All of them'")
                      propsLeft: worldPlats.filter(function(p){ return p._springy; }).length, platsLeft: worldPlats.length,
                      ending: summons.filter(function(s){ return s.type==='springyend'; }).length, bossLeft: summons.filter(function(s){ return s.type==='boss'; }).length,
                      advanced: BOSSRUSH.bossIdx - idx0, victory: document.getElementById('rushVictory').style.display };
            summons = summons.filter(function(s){ return s.type!=='springyend'; }); projectiles = [];
            continue;
          }
          b.hp = 0; bossRushCheck();
          projectiles = [];   // "Endings: 'All of them'" (2026-09-29): a boss's exit scene is made of shots, and this walk gives none of them time to finish
          if (b.name==='Four'){ timers.filter(function(t){ return t.ms === BOSS_ENDINGS.four.holdMs; }).forEach(function(t){ t.fn(); }); card = document.getElementById('rushVicSub').textContent; break; }   // his ending holds the victory card back (bossRushCheck's hook): let its time pass
        }
        return { order: order, atHim: atHim, card: card };
      } finally { setTimeout = st; BOSSRUSH.active=false; running=false; paused=false; summons=[]; projectiles=[]; worldPlats=[];
                  document.getElementById('rushVictory').style.display='none'; }
    })()`);
    expect(r.order).toEqual(['Announcer', 'Puffball Speaker Box', 'Firey Speaker Box', 'The Bug Swarm', 'Purple Face',
      'MePhone4', 'Evil Leafy', 'MePhone4S', 'Purple Dragon', 'Two', 'Springy', 'Four']);   // the Dragon at 9 ("just move purple dragon!!!" (the owner, 2026-09-30))
    expect(r.order, 'the gauntlet never spawns Steve Cobs').not.toContain('Steve Cobs');
    expect(r.atHim.padBefore, 'the exit room\'s spring was placed with him').toBe(1);
    expect(r.atHim.box, 'and a landed box stood').toBe(1);
    expect(r.atHim.hisLeft, 'nothing of his is left after he is gone but the hole of his ending').toBe(1);
    expect(r.atHim.endingHole).toBe(true);
    expect(r.atHim.othersLeft, 'nothing else is swept').toBe(1);
    expect(r.atHim.propsLeft, 'his pad and his boxes go with him').toBe(0);
    expect(r.atHim.platsLeft, 'the stage\'s own platform stays').toBe(1);
    expect(r.atHim.ending, 'his ending plays where he fell').toBe(1);
    expect(r.atHim.bossLeft).toBe(0);
    expect(r.atHim.advanced).toBe(1);
    expect(r.atHim.victory, 'he is not the last boss').not.toBe('flex');
    expect(r.card, 'the victory card counts twelve').toMatch(/^All twelve bosses beaten/);
  });

  it('takes turns: the slam, JUST WANTED A HAND, the slam, A TOY IN EVERY BOX, the slam, MY PURPOSE!, each named, with a 40-frame wind-up, and names his phases', () => {
    const r = W.eval(`(function(){
      var s = ${S()};
      var kinds = [], names = [];
      for (var i=0;i<6;i++){ s._atkTimer = 1; s._tel = 0; updateBossAttack(s, null); kinds.push(s._telKind); names.push(bossTelName(s)); }
      return { kinds: kinds, names: names, tel: bossTelLen(s), p2: bossPhaseName(s, 2), p3: bossPhaseName(s, 3), gaps: SPRINGY.gaps.slice(1).map(function(g, i){ s._phase = i+1; return bossAtkGap(s); }) };
    })()`);
    expect(r.kinds).toEqual(['springy', 'longarm', 'springy', 'boxdrop', 'springy', 'springbot']);
    // "TRY NOT TO FALL~ ! It's a long way down..." (Spring on the Breakfast!/Transcript); "I thought you just wanted a hand." (A Jury of Your Fears/Transcript);
    // Spring-Bot: "My. Purpose." (You Can't Do This Forever/Transcript)
    expect(r.names).toEqual(['TRY NOT TO FALL!', 'JUST WANTED A HAND!', 'TRY NOT TO FALL!', 'A TOY IN EVERY BOX!', 'TRY NOT TO FALL!', 'MY PURPOSE!']);
    expect(r.tel, 'he compresses for two thirds of a second').toBe(40);
    expect(r.p2, 'his page: "Whenever Springy is too excited, scared or enraged, they glitch constantly"').toBe('Glitching');
    expect(r.p3, '"a leader of The Unvitational Committee"').toBe('Unvitational');
    // "bosses should attack a bit slower" (the owner, 2026-09-30): his own 96 / 72 / 54 (SPRINGY.gaps) times BOSS_PACE (1.2)
    expect(r.gaps, 'his own gaps, paced, quicker each phase').toEqual([115, 86, 65]);
  });

  it('his phases change as his HP falls and are announced; phase 3 shakes the arena and opens a hole under the nearest fighter', () => {
    const r = W.eval(`(function(){ ${STAGE(150)}
      var out = { p1: b._phase, hp: b.maxHp, st: b.stationary };
      b.hp = b.maxHp*0.5; updateBossAttack(b, f); out.p2 = b._phase; out.b2 = document.getElementById('banner').textContent; out.holes2 = projectiles.filter(function(p){ return p.springHole; }).length;
      b.hp = b.maxHp*0.2; updateBossAttack(b, f); out.p3 = b._phase; out.b3 = document.getElementById('banner').textContent; out.quake = b._quakeT;
      var h = projectiles.filter(function(p){ return p.springHole; });
      out.holes3 = h.length; out.holeX = h.length ? h[0].x : null; out.holeT = h.length ? h[0].delay : null;
      summons = []; projectiles = []; return out;
    })()`);
    expect(r.hp, '330 for one fighter').toBe(330);
    expect(r.st, 'a spring does not hold a spot').toBe(false);
    expect([r.p1, r.p2, r.p3]).toEqual([1, 2, 3]);
    expect(r.b2).toMatch(/PHASE 2: Glitching/);
    expect(r.b3).toMatch(/PHASE 3: Unvitational/);
    expect(r.holes2, 'phase 2 opens nothing by itself').toBe(0);
    expect(r.quake, '"laughing as he shakes him around": two seconds of shaking').toBe(120);
    expect(r.holes3).toBe(1);
    expect(r.holeX, 'the floor gives under the nearest fighter').toBe(150);
    expect(r.holeT, 'a phase-3 hole, open five seconds').toBe(300);
  });

  it('hit while grounded, he bounces once', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      for (var i=0;i<20;i++) step();
      var gy = groundY(), grounded = Math.abs(b.y - (gy - b.r)) < 1;
      b.hp -= 5; step();
      var out = { grounded: grounded, vy: b.vy };
      step(); step(); out.up = (gy - b.r) - b.y;
      summons = []; return out;
    })()`);
    expect(r.grounded).toBe(true);
    expect(r.vy, 'the hop').toBe(-7);
    expect(r.up, 'he leaves the floor').toBeGreaterThan(5);
  });
});

describe('TRY NOT TO FALL: the slam', () => {
  it('he leaves the floor as the wind-up ends, hangs above the screen over a mark where you stand, comes down on it for a boss hit, and the floor gives', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(), out = { frames: {} };
      b._atkTimer = 1; step();
      out.kind = b._telKind; out.name = document.getElementById('banner').textContent; out.tel = b._tel;
      for (var i=0;i<40 && b._tel>0;i++) step();
      out.launched = !!b._slam && b._slam.phase==='up' && b.vy < 0;
      var m = projectiles.find(function(p){ return p.springMark; }); out.markX = m ? m.warnX : null; out.markInert = m ? (m.delay > 0) : null;
      var minY = 1e9, hung = false, fell = false, pct0 = f.pct, n = 0;
      for (var j=0;j<260 && b._slam;j++){ step(); n++; minY = Math.min(minY, b.y); if (b._slam && b._slam.phase==='hang') hung = true; if (b._slam && b._slam.phase==='down') fell = true; f.pct = f.pct; }
      out.minY = minY; out.hung = hung; out.fell = fell; out.n = n; out.landedX = b.x; out.landedY = b.y; out.floorY = gy - b.r;
      out.taken = f.pct - pct0; out.full = bossDmg();
      var h = projectiles.find(function(p){ return p.springHole; });
      out.hole = h ? { x: h.x, delay: h.delay, id: h.bossAtk } : null; out.markLeft = projectiles.filter(function(p){ return p.springMark; }).length;
      out.gapReset = b._atkTimer;
      summons = []; projectiles = []; return out;
    })()`);
    expect(r.kind).toBe('springy');
    expect(r.name).toMatch(/TRY NOT TO FALL!/);
    expect(r.tel).toBe(40);
    expect(r.launched, 'he leaves the floor').toBe(true);
    expect(r.markX, 'the mark is where you stood as he left').toBe(300);
    expect(r.markInert, 'the mark neither moves, hits nor ages').toBe(true);
    expect(r.minY, 'above the top of the screen').toBeLessThan(-100);
    expect(r.hung).toBe(true);
    expect(r.fell).toBe(true);
    expect(r.n, 'a slam is about a second and a half').toBeLessThan(160);
    expect(r.landedX).toBe(300);
    expect(r.landedY).toBeCloseTo(r.floorY, 3);
    expect(r.taken, 'a whole boss hit').toBeCloseTo(r.full, 5);
    expect(r.hole, 'the floor gives where he landed, under the slam\'s own id').toMatchObject({ x: 300 });
    expect(r.hole.delay, 'for three seconds (read a frame or so after it opened)').toBeGreaterThanOrEqual(178);
    expect(r.hole.delay).toBeLessThanOrEqual(180);
    expect(r.markLeft, 'the mark is gone').toBe(0);
    // SPRINGY.gaps[1] (96) times BOSS_PACE (1.2): "bosses should attack a bit slower" (the owner, 2026-09-30)
    expect(r.gapReset, 'his next turn is timed from the floor').toBe(115);
  });

  it("over an open hole the floor does not catch you; the pit pops you back out with 0.6 of a boss hit, never a KO; the hole closes after SPRINGY.holeT", () => {
    const r = W.eval(`(function(){ ${STAGE(500)}
      var gy = groundY(), id = ++BOSS_ATK_ID, h = springyHole(500, 1, id), out = {};
      out.hw = SPRINGY.holeW; out.inert = h.delay > 0 && h.life === 1;
      step(); out.groundedOver = f.onground; out.y1 = f.y;
      var maxY = f.y, popped = null, taken0 = f.pct;
      // once popped, step aside (a still fighter who stays put lands back in it and is popped again after the grace)
      for (var i=0;i<90;i++){ step(); f.vx = 0; maxY = Math.max(maxY, f.y); if (popped === null && f.vy < -5) popped = i; if (popped !== null) f.x = 700; }
      out.maxY = maxY; out.popped = popped; out.taken = f.pct - taken0; out.full = bossDmg(); out.dead = f.dead; out.stocks = f.stocks;
      out.pit = gy + SPRINGY.pit; out.blast = WH + 160;
      // step out from under it: the floor is back
      f.x = 600; f.y = gy + 30; f.vy = 0; step(); out.backUp = f.onground && Math.abs(f.y - (gy - f.r)) < 1;
      // the hole closes
      for (var j=0;j<200;j++) step();
      out.gone = projectiles.filter(function(p){ return p.springHole; }).length;
      f.x = 500; f.y = gy - f.r; f.vy = 0; step(); out.groundedAfter = f.onground;
      summons = []; projectiles = []; return out;
    })()`);
    expect(r.inert).toBe(true);
    expect(r.groundedOver, 'the floor is gone under you').toBe(false);
    expect(r.y1, 'you fall').toBeGreaterThan(W.eval('groundY()') - 24);
    expect(r.popped, 'and the pit pops you back out').not.toBe(null);
    expect(r.maxY + 24, 'you never fall far past the pit').toBeLessThan(r.pit + 60);
    expect(r.maxY, 'and nowhere near the blast line').toBeLessThan(r.blast - 100);
    expect(r.dead).toBe(false);
    expect(r.taken, '0.6 of a boss hit').toBeCloseTo(r.full*0.6, 5);
    expect(r.backUp, 'sideways out from under it, the floor is back').toBe(true);
    expect(r.gone, 'closed').toBe(0);
    expect(r.groundedAfter).toBe(true);
  });

  it('phase 2: two slams, the second following you until it locks; phase 3: three, five-second holes, and a floor wave both ways', () => {
    const r = W.eval(`(function(){ var out = {};
      [2, 3].forEach(function(ph){
        ${STAGE(300)}
        b.hp = b.maxHp*(ph===2 ? 0.5 : 0.2); updateBossAttack(b, f); b._atkTimer = 1e9; projectiles = []; b._quakeT = 0;
        b._atkTimer = 1; step(); for (var i=0;i<40 && b._tel>0;i++) step();
        var holesAt = [], holeT = [], waves = 0, AP = addProj, hangs = 0, moved = false;
        addProj = function(p){ if (p && p.springHole){ holesAt.push(Math.round(p.x)); holeT.push(p.delay); } if (p && p.shape==='springwave') waves++; return AP(p); };
        try {
          for (var j=0;j<600 && b._slam;j++){
            step(); f.vx = 0;
            // after the first landing, stand at 700 (held there: a slam's knock would carry a free fighter on): the next slams follow
            if (b._slam && b._slam.n >= 1){ f.x = 700; f.y = groundY() - 24; f.vy = 0; moved = true; }
            if (b._slam && b._slam.phase==='hang' && b._slam.t === SPRINGY.hang) hangs++;
          }
        } finally { addProj = AP; }
        out[ph] = { holesAt: holesAt, waves: waves, delays: holeT, phase: b._phase, done: !b._slam };
        summons = []; projectiles = [];
      });
      return out;
    })()`);
    expect(r[2].done).toBe(true);
    expect(r[2].holesAt, 'two slams: the first where you stood, the second where you went').toEqual([300, 700]);
    expect(r[2].waves, 'no wave before phase 3').toBe(0);
    expect(r[2].delays, 'three-second holes').toEqual([180, 180]);
    expect(r[3].done).toBe(true);
    expect(r[3].holesAt).toHaveLength(3);
    expect(r[3].holesAt[0]).toBe(300);
    expect(r[3].holesAt.slice(1), 'the second and third follow you').toEqual([700, 700]);
    expect(r[3].waves, 'the terrarium\'s shockwave: two a landing').toBe(6);
    expect(r[3].delays, 'five-second holes').toEqual([300, 300, 300]);
  });
});

describe('the second moves', () => {
  it('JUST WANTED A HAND: one mitten along your row, half the arena, through everyone on it; from phase 2 a second along the floor, eight frames behind', () => {
    const r = W.eval(`(function(){ var out = {}, gy = groundY();
      [1, 2].forEach(function(ph){ projectiles = [];
        var s = ${S('_telKind:"longarm", _telX:400, _telY:groundY()-100')}; s._phase = ph;
        springyBeginTelegraph(s, { x:400, y:gy-100, dead:false });
        out['rows'+ph] = s._armRows.slice(); out['dir'+ph] = s._armDir;
        BOSS_MOVES.longarm(s, null);
        var k = projectiles.filter(function(p){ return p.owner===-2; });
        out[ph] = { n: k.length, shapes: k.map(function(p){ return p.shape; }), vx: k.map(function(p){ return p.vx; }), ys: k.map(function(p){ return p.y; }),
                    delays: k.map(function(p){ return p.delay||0; }), pierce: k.every(function(p){ return p.pierce; }), dmg: k[0].dmg, full: bossDmg(),
                    reach: k[0].life*Math.abs(k[0].vx), want: WW*SPRINGY.armLen, ids: k.map(function(p){ return p.bossAtk; }), arm: k[0].armX0, his: k.every(function(p){ return p.springy; }) };
      });
      projectiles = []; return out;
    })()`);
    expect(r.dir1, 'toward the side you were on').toBe(-1);
    expect(r.rows1).toHaveLength(1);
    expect(r[1].n).toBe(1);
    expect(r[1].shapes).toEqual(['mitten']);
    expect(r[1].vx).toEqual([-24]);
    expect(r[1].pierce, 'through everyone on the row').toBe(true);
    expect(r[1].dmg).toBeCloseTo(r[1].full, 5);
    expect(r[1].reach, 'half the arena').toBeGreaterThanOrEqual(r[1].want);
    expect(r[1].arm, 'the arm reaches back to him').toBe(700);
    expect(r[1].his).toBe(true);
    expect(r.rows2, 'phase 2: one high, one low').toHaveLength(2);
    expect(r.rows2[1]).toBe(W.eval('groundY()') - 24);
    expect(r[2].n).toBe(2);
    expect(r[2].delays).toEqual([0, 8]);
    expect(r[2].ids[0], 'one attack id: the pair is one boss hit').toBe(r[2].ids[1]);
  });

  it('a fighter on the row inside the reach is hit; one beyond the fist\'s whole travel is safe; the wind-up shows the rows', () => {
    // the fist leaves his hand (r*0.5 out), flies life*armSpd (life rounded up by addProj's PROJ_LIFE), and is armR wide:
    // that, plus a fighter's own hurtbox, is the whole reach -- a little over half the arena
    const r = W.eval(`(function(){ var out = [];
      var reach = 88*0.5 + Math.round((Math.ceil(WW*SPRINGY.armLen/SPRINGY.armSpd/PROJ_LIFE) + 1)*PROJ_LIFE)*SPRINGY.armSpd + SPRINGY.armR;
      [{ dx: 300, want: true }, { dx: reach - 30, want: true }, { dx: reach + HURT_R0 + 24, want: false }].forEach(function(c){
        ${STAGE(120)}
        b.x = 120 + c.dx; b.homeX = b.x; b.vx = 0; b._moveN = 1;   // the next turn is his first second move: longarm
        b._atkTimer = 1; step();
        var kind = b._telKind, rows = b._armRows ? b._armRows.length : 0, band = String(drawBossSprite).indexOf('_armRows') >= 0;
        for (var i=0;i<120;i++){ step(); f.x = 120; f.vx = 0; f.y = groundY() - 24; f.vy = 0; b.x = 120 + c.dx; b.vx = 0; }
        out.push({ dx: c.dx, kind: kind, rows: rows, band: band, hit: f.pct > 0, want: c.want });
        summons = []; projectiles = [];
      });
      return out;
    })()`);
    for (const c of r) {
      expect(c.kind).toBe('longarm');
      expect(c.rows, 'the rows are laid out as the wind-up starts').toBe(1);
      expect(c.band, 'and drawn').toBe(true);
      expect(c.hit, `a fighter ${Math.round(c.dx)} px out is ${c.want ? 'hit' : 'safe'}`).toBe(c.want);
    }
  });

  it('A TOY IN EVERY BOX: the box nearest your spot drops a clone, then a box, then (phase 2) the toy too, in turn; phase 3 drops two', () => {
    // Where a drop comes down is its shadow, warnX. It was also where it started, until the owner's "add momentum to falling
    // objects(they should move horizontaly while falling)" -- "everything. bosses, characters, whatever." -- "The way it was
    // thrown" (2026-09-29): a drop now starts back along its drift and lands on the shadow (FALL_DRIFT; boss-kit.test.js).
    const r = W.eval(`(function(){ var out = {}, top = WH*SPRINGY.boxY + 40;
      var run = function(ph, turns){ projectiles = []; var kinds = [], xs = [];
        var s = ${S('_telX:500')}; s._phase = ph; s._telPh = ph; s._boxX = 500;
        for (var t=0;t<turns;t++){ var before = projectiles.length; s._boxX = 500; BOSS_MOVES.boxdrop(s, null);
          projectiles.slice(before).forEach(function(p){ kinds.push(p.shape); xs.push(p.warnX); }); }
        return { kinds: kinds, xs: xs, fromTop: projectiles.every(function(p){ return p.y===top && p.grav && p.warn>0 && p.springy; }), ids: projectiles.map(function(p){ return p.bossAtk; }) }; };
      out[1] = run(1, 3); out[2] = run(2, 3); out[3] = run(3, 1);
      projectiles = []; var s2 = ${S('_telX:500')}; s2._phase = 2; s2._telPh = 2;
      out.cloneColors = [1,2,3,4,5,6].map(function(){ var n = projectiles.length; s2._boxX = 500; BOSS_MOVES.boxdrop(s2, null); return projectiles.slice(n).filter(function(p){ return p.shape==='springclone'; }).map(function(p){ return p.color; }); }).flat();
      projectiles = []; return out;
    })()`);
    expect(r[1].kinds, 'phase 1: the clone and the box, in turn').toEqual(['springclone', 'cerealbox', 'springclone']);
    expect(r[1].xs.every(x => x === 500), 'on your spot').toBe(true);
    expect(r[1].fromTop, 'from the boxes, under a shadow').toBe(true);
    expect(r[2].kinds, 'phase 2: the toy joins the turn').toEqual(['springclone', 'springtoy', 'cerealbox']);
    expect(r[3].kinds, 'phase 3: two a turn').toHaveLength(2);
    expect(r[3].xs[1], 'the second a step toward the middle').toBe(670);
    expect(new Set(r[3].ids).size, 'one attack id a turn').toBe(1);
    // "Royal Purple (Candle)", "Lime Green (Test Tube)" -- the two clones; never Spring!Suitcase
    expect(new Set(r.cloneColors)).toEqual(new Set(['#7851a9', '#32cd32']));
  });

  it('the box lands as a solid wall that stands SPRINGY.boxLife frames; the clone hops at you; the toy lands and lunges once', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(), out = {};
      // the box: drop kind index 0 (box) by presetting the turn counter
      b._boxN = 1; b._telPh = 1; b._boxX = 800; BOSS_MOVES.boxdrop(b, null);
      var box = projectiles.find(function(p){ return p.shape==='cerealbox'; }); out.boxKind = !!box;
      var placedAt = null;
      for (var i=0;i<200;i++){ step(); f.x = 300; f.vx = 0; var w = worldPlats.find(function(p){ return p._springy && p.solid; }); if (w && placedAt===null){ placedAt = i; out.wall = { x: w.x, y: w.y, w: w.w, h: w.h, until: w._until - hazardT }; } }
      out.placedAt = placedAt; out.boxGone = !projectiles.some(function(p){ return p.shape==='cerealbox'; });
      for (var j=0;j<SPRINGY.boxLife + 5;j++) step();
      out.wallGone = !worldPlats.some(function(p){ return p._springy && p.solid; });
      // the clone: hops toward the fighter
      projectiles = []; b._boxN = 0; b._boxX = 800; BOSS_MOVES.boxdrop(b, null);
      var c = projectiles.find(function(p){ return p.shape==='springclone'; }); out.clone = { toward: Math.sign(c.vx), bounce: !!c.bounce, max: c.maxBounces };
      // the toy: lands, then lunges at the nearest fighter
      projectiles = []; b._telPh = 2; b._boxN = 1; b._boxX = 800; BOSS_MOVES.boxdrop(b, null);
      var t = projectiles.find(function(p){ return p.shape==='springtoy'; });
      out.toy0 = { drifts: t.vx !== 0 && Math.sign(t.vx) === Math.sign(b.face || 1), max: t.maxBounces, shadow: t.warnX };
      var lunged = null, landX = null; for (var k=0;k<160 && t.life>0;k++){ step(); f.x = 300; f.vx = 0; if (landX===null && (t.bounces||0) >= 1) landX = t.x; if (lunged===null && t._lunged) lunged = { vx: t.vx, k: k }; }
      out.lunged = lunged; out.toyLand = landX;
      summons = []; projectiles = []; worldPlats = []; return out;
    })()`);
    expect(r.boxKind).toBe(true);
    expect(r.placedAt, 'it lands').not.toBe(null);
    expect(r.boxGone, 'and the shot is spent').toBe(true);
    expect(r.wall).toMatchObject({ w: 110, h: 64, until: 240 });
    expect(r.wall.x, 'centred on the spot').toBe(800 - 55);
    expect(r.wall.y).toBe(W.eval('groundY()') - 64);
    expect(r.wallGone, 'four seconds later it is gone').toBe(true);
    expect(r.clone, 'the clone hops your way').toEqual({ toward: -1, bounce: true, max: 5 });
    // It dropped straight down until the owner's "add momentum to falling objects(they should move horizontaly while falling)"
    // -- "everything. bosses, characters, whatever." -- "The way it was thrown" (2026-09-29): it falls on a slant the way he
    // faces (FALL_DRIFT) and still comes down on its shadow.
    expect(r.toy0, 'the toy drifts the way he faces as it drops').toEqual({ drifts: true, max: 2, shadow: 800 });
    expect(Math.abs(r.toyLand - 800), 'and lands on its shadow').toBeLessThan(1);
    expect(r.lunged, 'and lunges at you once it has landed').not.toBe(null);
    expect(r.lunged.vx).toBe(-13);
  });
});

describe('phase 2: Glitching', () => {
  it('the ELECTRIC FENCE door zaps a fighter at the left edge in phase 2 only; he blinks to your far side before a wind-up, once every eight seconds', () => {
    const r = W.eval(`(function(){ ${STAGE(20)}
      var out = {}; for (var i=0;i<5;i++){ step(); f.x = 20; f.vx = 0; } out.p1 = f.pct;
      b.hp = b.maxHp*0.5; step(); f.x = 20; step(); out.p2 = f.pct; out.vx2 = f.vx; out.full = bossDmg(); out.fence = SPRINGY.fence;
      b.hp = b.maxHp*0.2; step();   // the phase flips inside this frame; the door is off from the next
      f.pct = 0; f.invuln = 0; f.x = 20; step(); step(); step(); out.p3 = f.pct;
      // the blink: phase 2, a wind-up starts, he lands SPRINGY.blink past you on your far side
      summons = []; projectiles = [];
      ${STAGE(300)}
      b.hp = b.maxHp*0.5; updateBossAttack(b, f); b._atkTimer = 1e9; b.x = 900; b.homeX = 900; b.vx = 0;
      b._atkTimer = 1; step();
      out.blinkX = b.x; out.blinkAt = b._blinkAt; out.now = hazardT; out.face = b.face;
      for (var j=0;j<40 && b._tel>0;j++) step(); for (var k=0;k<300 && b._slam;k++) step();
      b.x = 900; b.vx = 0; b._atkTimer = 1; b._tel = 0; step(); out.noBlinkX = b.x;
      summons = []; projectiles = []; return out;
    })()`);
    expect(r.p1, 'phase 1: the door is just a door').toBe(0);
    expect(r.p2, 'phase 2: a zap, half a boss hit').toBeCloseTo(r.full*0.5, 5);
    expect(r.vx2, 'and away from the wall').toBeGreaterThan(0);
    expect(r.p3, 'phase 3: off again').toBe(0);
    expect(r.blinkX, 'he lands SPRINGY.blink past you, between you and the far wall').toBe(300 + 320);
    expect(r.blinkAt).toBe(r.now);
    expect(r.face, 'facing you').toBe(-1);
    expect(r.noBlinkX, 'and not again within eight seconds').toBe(900);
  });
});

describe('what the player sees', () => {
  it('his art: four II wiki renders, transparent, no taller than 200 px, credited, unflipped, with a drawn fallback; phase 3 wears the finale design, the way down the falling pose', () => {
    const srcs = W.eval('({ springy: BOSS_SPRITE_SRC.springy, springy3: BOSS_SPRITE_SRC.springy3, springyfall: BOSS_SPRITE_SRC.springyfall, springyangry: BOSS_SPRITE_SRC.springyangry })');
    expect(srcs).toEqual({ springy: 'assets/sprites/springy.png', springy3: 'assets/sprites/springy-unvitational.png',
      springyfall: 'assets/sprites/springy-falling.png', springyangry: 'assets/sprites/springy-angry.png' });
    const man = JSON.parse(readFileSync('scripts/sprite-manifest-inanimateinsanity.json', 'utf8'));
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const rows = { springy: ['Springy', 'Springy.png'], springy3: ['Springy (unvitational)', 'Springy0.png'], springyfall: ['Springy (falling)', 'Springitfalling.png'], springyangry: ['Springy (angry)', 'Springypissedoff.png'] };
    for (const k of Object.keys(srcs)) {
      const file = 'artifacts/V1/' + srcs[k];
      expect(existsSync(file), file).toBe(true);
      const png = PNG.sync.read(readFileSync(file));
      expect(png.height, k + ' at most 200 px tall').toBeLessThanOrEqual(200);
      const alpha = (x, y) => png.data[(y * png.width + x) * 4 + 3];
      expect([alpha(0, 0), alpha(png.width - 1, 0), alpha(0, png.height - 1), alpha(png.width - 1, png.height - 1)], k + ' transparent, not a sticker').toEqual([0, 0, 0, 0]);
      const [name, wikiFile] = rows[k];
      expect(man[name], name).toMatchObject({ ok: true, file: srcs[k].replace('assets/sprites/', ''), flip: false, source: expect.stringContaining('/' + wikiFile + '/') });
      expect(credits.split('\n').find((l) => l.includes('`' + srcs[k].replace('assets/sprites/', '') + '`')) || '', 'credited').toContain(wikiFile);
      expect(W.eval(`!!BOSS_SPRITE_FLIP.${k}`), k + ' measured facing right, so not flipped').toBe(false);
      expect(W.eval(`String(drawBossSprite).indexOf('case "${k}"') >= 0`), k + ' has a drawn fallback').toBe(true);
    }
    const looks = W.eval(`[springyLook({}), springyLook({ _phase:3 }), springyLook({ _slam:{ phase:'down' }, _phase:3 }), springyLook({ _slamPh:'down' }), springyLook({ _tel:5, _phase:2 }), springyLook({ _tel:5, _phase:1 })]`);
    expect(looks).toEqual(['springy', 'springy3', 'springyfall', 'springyfall', 'springyangry', 'springy']);
  });

  it('draws him in every state, his tells, his shots, his hole and mark, his ending and the cereal boxes, without throwing', () => {
    const err = W.eval(`(function(){
      try {
        var gy = groundY();
        var base = { type:'boss', name:'Springy', color:'#afafaf', sprite:'springy', r:88, x:500, y:gy-88, face:1, hp:100, maxHp:100,
                     _tel:0, _telKind:null, _phase:1, _rage:false, flash:0, homeX:500, attack:'springy' };
        [{}, { _tel:20, _telKind:'springy' }, { _tel:12, _telKind:'longarm', _armRows:[gy-100, gy-24], _armDir:-1, _phase:2 },
         { _tel:30, _telKind:'boxdrop', _boxX:300 }, { _slam:{ phase:'down' }, y:-100 }, { _phase:3, hp:20, flash:6 }, { _slamPh:'hang', y:-200 }]
          .forEach(function(st){ var s = Object.assign({}, base, st); ctx.save(); drawBossSprite(s); ctx.restore(); });
        [{ springHole:true, delay:100, warnY:gy, x:300, y:gy+200, r:1 }, { springHole:true, delay:12, warnY:gy, x:300, y:gy+200, r:1 },
         { springMark:true, delay:1e6, warnX:420, warnY:gy, x:420, y:gy+200, r:1, color:'#ffd23f' },
         { shape:'mitten', vx:-24, vy:0, r:22, armX0:700, armY0:300, color:'#ff4a01' }, { shape:'mitten', vx:24, vy:0, r:22, color:'#ff4a01' },
         { shape:'cerealbox', vx:0, vy:6, r:26, color:'#f2c230' }, { shape:'springclone', vx:2, vy:4, r:16, color:'#7851a9' },
         { shape:'springtoy', vx:-13, vy:0, r:18, color:'#a0522d' }, { shape:'springwave', vx:8, vy:0, r:14, color:'#afafaf' }]
          .forEach(function(p){ drawProjectile(Object.assign({ x:300, y:300, owner:-2, ownerObj:{team:-1, idx:-2} }, p)); });
        [0, 10, 40, 80, 110, 130].forEach(function(t){ drawSummon({ type:'springyend', name:'Springy', color:'#afafaf', x:500, y:gy-88, r:0, _r:88, face:-1, _endT:t }); });
        summons = [Object.assign({}, base, { _phase:2 })]; drawArenaDecor('cerealbox'); summons = [];
        return BOSS_ARENA_SKY.cerealbox.length + '/' + ['mitten','cerealbox','springclone','springtoy','springwave'].map(function(k){ return typeof PROJ_SHAPE[k].draw; }).join(',');
      } catch(e){ return e.message + ' ' + (e.stack||'').split('\\n')[1]; }
    })()`);
    expect(err).toBe('2/function,function,function,function,function');
  });

  it("the exit room's white spring is a bounce pad on the right edge while he stands: land on it and you leave again", () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var pad = worldPlats.find(function(p){ return p._springy && p.bouncy; }), gy = groundY(), out = { pad: pad ? { x: pad.x, w: pad.w, right: WW - (pad.x + pad.w) } : null };
      f.x = pad.x + pad.w/2; f.y = pad.y - 80; f.vy = 0; f.vx = 0;
      var minVy = 1e9, launched = false;
      for (var i=0;i<60;i++){ step(); f.vx = 0; f.x = pad.x + pad.w/2; if (f.vy === -14) launched = true; minVy = Math.min(minVy, f.vy); }
      out.launched = launched; out.minVy = minVy;
      summons = []; projectiles = []; return out;
    })()`);
    expect(r.pad).toMatchObject({ w: 90, right: 28 });
    expect(r.launched, 'the engine\'s bounce, Spongy\'s -14').toBe(true);
  });

  it("nothing of his names anyone from the OSC -- no code, no string, no payload", () => {
    const src = W.eval(`[String(springyBeginTelegraph), String(springySlamStart), String(springySlamStep), String(springySlamLand), String(springyHole), String(springyHoleAt),
      String(springyDrop), String(springyPlaceBox), String(springyDressArena), String(updateSpringy), String(springyEnding), String(springyEndStep), String(springyLook),
      String(BOSS_MOVES.longarm), String(BOSS_MOVES.boxdrop), String(drawSpringyBody), String(drawSpringyEnd), JSON.stringify(SPRINGY), JSON.stringify(SPRINGY_PAYLOADS),
      String(BOSS_MOVES.springbot), String(springyBotSpot), String(springyBotDrop), String(springyBotHear), String(springyBotFire), String(springyBotStep), String(drawSpringBot), String(springyShotGlyph),
      JSON.stringify(SPRINGY_CLONES), BOSS_MOVE_NAME.longarm, BOSS_MOVE_NAME.boxdrop, BOSS_MOVE_NAME.springbot, bossPhaseName({attack:'springy'}, 2), bossPhaseName({attack:'springy'}, 3),
      bossTelName({attack:'springy'}), BOSS_ROSTER.map(function(b){ return b.name; }).join(',')].join('\\n')`);
    // case-sensitive and whole-word: "addProj" and "dropProj" contain "oj"
    expect(src).not.toMatch(/\bOJ\b|Suitcase|Cabby/i);
    expect(W.eval('SPRINGY_CLONES.map(function(c){ return c.name; })'), 'the two clones that may drop').toEqual(['Spring!Candle', 'Spring!TestTube']);
    expect(W.eval('SPRINGY_PAYLOADS')).toEqual(['box', 'clone', 'toy']);
  });
});

describe('the ending: lava, then MeLife revival', () => {
  it('when he falls in Boss Rush he drops into his hole, comes back in a MeLife fill and springs off the top; his line comes first, then the BOSS DOWN card', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var st = setTimeout, timers = []; setTimeout = function(fn, ms){ timers.push({ fn: fn, ms: ms }); return 0; };
      try {
        BOSSRUSH.active = true; var gy = groundY(), out = {};
        b.hp = 0; bossRushCheck();
        var e = summons.find(function(s){ return s.type==='springyend'; }), h = projectiles.find(function(p){ return p.springHole; });
        out.has = !!e; out.r = e ? e.r : null; out.drawR = e ? e._r : null; out.hole = h ? { x: h.x, delay: h.delay } : null; out.x = e ? e.x : null; out.bx = b.x;
        out.banner0 = document.getElementById('banner').textContent;
        out.timerMs = timers.map(function(t){ return t.ms; });
        var down = timers.find(function(t){ return t.ms === SPRINGY_SQUARE_MS && String(t.fn).indexOf('downCard') >= 0; }), run0 = running;   // (the banner's own hide timer is also 1 s)
        running = true; if (down) down.fn(); running = run0;
        out.bannerDown = document.getElementById('banner').textContent;
        var below = false, back = false, up = false, banners = {}, frames = 0;
        for (var i=0;i<SPRINGY_END.total + 10 && summons.indexOf(e) >= 0;i++){
          step(); frames++;
          if (e.y > gy + 50) below = true;
          if (below && Math.abs(e.y - (gy - e._r)) < 1) back = true;
          if (back && e.y < -e._r) up = true;
          banners[document.getElementById('banner').textContent] = 1;
        }
        out.below = below; out.back = back; out.up = up; out.frames = frames; out.gone = summons.indexOf(e) < 0; out.banners = Object.keys(banners);
        return out;
      } finally { setTimeout = st; BOSSRUSH.active = false; summons = []; projectiles = []; }
    })()`);
    expect(r.has, 'his ending is on the stage').toBe(true);
    expect(r.x).toBe(r.bx);
    expect(r.r, 'no shot is spent on it').toBe(0);
    expect(r.drawR).toBe(88.4);
    expect(r.hole, 'the hole he goes down, closed once the lava has him').toMatchObject({ x: r.bx, delay: 60 });
    expect(r.below, 'down into it').toBe(true);
    expect(r.back, 'back on the floor for the MeLife fill').toBe(true);
    expect(r.up, 'and off the top: [Boing]').toBe(true);
    expect(r.gone, 'then gone').toBe(true);
    expect(r.frames).toBeLessThanOrEqual(W.eval('SPRINGY_END.total') + 2);
    // "Show it first" (the owner, 2026-09-29): his line for a second, then the gauntlet's card; the next boss waits that
    // second longer (1.5 s + 1 s) so the card keeps its full time.
    expect(r.banner0).toBe("We're square.");
    expect(r.timerMs).toContain(1000);
    expect(r.timerMs).toContain(2500);
    expect(r.bannerDown).toMatch(/BOSS DOWN!/);
  });
});

describe('an item Springy', () => {
  it('punches and drops boxes but never slams, and his boxes still expire without him', () => {
    const r = W.eval(`(function(){ projectiles = []; worldPlats = [];
      var s = { type:'boss', name:'Springy', color:'#afafaf', x:550, y:300, r:70, hp:200, vx:0, vy:0, face:1, _atkTimer:1, _tel:0 };
      var out = []; for (var i=0;i<4;i++){ s._atkTimer = 1; s._tel = 0; updateBossAttack(s, null); out.push(String(s._telKind)); s._tel = 1; updateBossAttack(s, null); }
      var marks = projectiles.filter(function(p){ return p.springMark; }).length, mittens = projectiles.filter(function(p){ return p.shape==='mitten'; }).length;
      var drops = projectiles.filter(function(p){ return p.springy && p.shape!=='mitten'; }).length;
      projectiles = []; springyPlaceBox(500, groundY()); summons = [];
      var had = worldPlats.length; for (var j=0;j<SPRINGY.boxLife + 3;j++){ hazardT++; updateSummons(); }
      var left = worldPlats.length; worldPlats = [];
      return { kinds: out, marks: marks, mittens: mittens, drops: drops, had: had, left: left };
    })()`);
    expect(r.kinds).toEqual(['undefined', 'longarm', 'undefined', 'boxdrop']);
    expect(r.marks, 'no slam').toBe(0);
    expect(r.mittens).toBeGreaterThan(0);
    expect(r.drops).toBeGreaterThan(0);
    expect([r.had, r.left], 'a landed box expires on its own clock').toEqual([1, 0]);
  });
});

describe('a netcode client sees him', () => {
  it('his tells, his hole, his mark, his mitten\'s arm and his ending cross the snapshot and draw on the client', () => {
    const { window: w } = loadMonolith();   // the harness with gradients, as test/net-lobby.test.js uses: drawBossBar needs one
    const r = w.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow();
      BOSS_ARENA = 'cerealbox'; var gy = groundY();
      summons = [{ type:'boss', name:'Springy', color:'#afafaf', r:88, sprite:'springy', x:500, y:gy-88, hp:80, maxHp:330, face:-1, flash:0,
                   homeX:500, _rage:false, _tel:10, _telKind:'longarm', _bossRush:true, attack:'springy', _phase:2, _armRows:[400, gy-24], _armDir:-1, _boxX:300, _slam:{ phase:'down' } },
                 { type:'springyend', name:'Springy', color:'#afafaf', r:0, _r:88, x:700, y:gy-88, face:1, _endT:70, hp:0, maxHp:0 }];
      projectiles = [{ x:300, y:gy+200, vx:0, vy:0, r:1, color:'#1a1008', owner:-2, ownerObj:{team:-1, idx:-2}, bossAtk:9, life:1, delay:120, warn:0, warnY:gy, springHole:true, springy:true },
                     { x:420, y:gy+200, vx:0, vy:0, r:1, color:'#ffd23f', owner:-2, ownerObj:{team:-1, idx:-2}, bossAtk:10, life:1, delay:1e6, warn:0, warnX:420, warnY:gy, springMark:true, springy:true },
                     { x:380, y:400, vx:-24, vy:0, r:22, color:'#ff4a01', shape:'mitten', armX0:500, armY0:400, pierce:true, owner:-2, ownerObj:{team:-1, idx:-2}, bossAtk:11, life:20, springy:true }];
      var snap = JSON.parse(JSON.stringify(serializeState()));
      summons = []; projectiles = []; BOSS_ARENA = null;
      applySnapshot(snap);
      var err = null; try { summons.forEach(drawSummon); projectiles.forEach(drawProjectile); drawBossBar(); drawArenaDecor(BOSS_ARENA); } catch(e){ err = e.message; }
      return { boss: snap.summons[0], end: snap.summons[1], hole: projectiles[0], mark: projectiles[1], fist: projectiles[2], arena: BOSS_ARENA, err: err, look: springyLook(summons[0]) };
    })()`);
    expect(r.err).toBe(null);
    expect(r.boss).toMatchObject({ _armRows: [400, expect.any(Number)], _armDir: -1, _boxX: 300, _slamPh: 'down', sprite: 'springy', attack: 'springy', _tel: 10 });
    expect(r.look, 'the client picks the falling render from _slamPh').toBe('springyfall');
    expect(r.end).toMatchObject({ type: 'springyend', _endT: 70, _r: 88 });
    expect(r.hole).toMatchObject({ delay: 120 });
    expect(!!r.hole.springHole, 'the hole flag (1 in the compact row)').toBe(true);
    expect(!!r.mark.springMark).toBe(true);
    expect(r.mark).toMatchObject({ warnX: 420 });
    expect(r.fist).toMatchObject({ shape: 'mitten', vx: -24, armX0: 500, armY0: 400 });
    expect(r.arena, 'a client draws the boss arena').toBe('cerealbox');
  });
});

// MY PURPOSE!, the owner's one more for him (boss-overhaul-decisions.md Round 10, 2026-09-29), verbatim: "give him 1 more: the bot toy, which will copy the
// 1st 5 specials used after spawning 3 times." -> "it copies the 5 specials 3 times before expiring." Spring-Bot (the Spring-toys page: a speaker in its mouth,
// "programming it in the image of Bot", Springy's page; its line "My. Purpose.", You Can't Do This Forever/Transcript): a toy drops, listens for the first
// five specials any fighter uses after it lands, plays them back three times -- each a shot drawn as that special, out of the toy, at whoever used it, under one
// attack id and modest damage -- and powers down. "Special" is the Special button, as Two's MIND READ and Dough's Knockoff read it (_lastSpecialKind).
describe('MY PURPOSE!: the Spring-Bot toy', () => {
  // A landed, listening toy over a Firey (300) and a Pen (420), both parked; untouchable unless `hurt`. The fall has its own test.
  const TOY = (hurt, ph) => `${STAGE(300)}
    var gy = groundY(), B = SPRINGY.bot;
    var g = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 420, gy-24, 1); g.team=0; g.controller='still'; g.stocks=9; fighters.push(g);
    ${hurt ? '' : 'f.invuln = 1e9; g.invuln = 1e9;'}
    b._atkTimer = 1e9; b._telPh = ${ph || 1}; BOSS_MOVES.springbot(b, f);
    var toy = projectiles.find(function(p){ return p.springBot; });
    toy.y = toy.warnY - toy.r*0.5; toy.x = toy.warnX; toy.vx = 0; toy.vy = 0; toy.warn = 0; toy.sb.s = 1; toy.sb.t = 0;
    var say = function(){ for (var i=0;i<arguments.length;i++) springyBotHear(arguments[i], arguments[i].kit.special); };`;
  const REC = `new Proxy({}, { get:function(_t,p){
    if(p==='canvas') return {width:1100,height:720};
    if(p==='measureText') return function(){ return {width:0}; };
    return function(){ calls.push([p].concat([].slice.call(arguments))); }; }, set:function(){ return true; } })`;

  it('the wind-up names it, fixes the box farthest from you and draws its ray and waves; the toy drops from that box under a shadow, lands on it to the pixel and stands listening, touching nobody', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(), out = {}, top = WH*SPRINGY.boxY + 40;
      b._moveN = 5; b._atkTimer = 1; step();   // his sixth turn: the third second move
      out.kind = b._telKind; out.name = document.getElementById('banner').textContent; out.tel = b._tel; out.boxX = b._boxX; out.WW = WW;
      out.tell = String(drawBossSprite).indexOf('springbot') >= 0;
      var err = null; try { ctx.save(); drawBossSprite(b); ctx.restore(); } catch(e){ err = e.message; } out.tellErr = err;
      for (var i=0;i<60 && b._tel>0;i++){ step(); f.x = 880; f.vx = 0; }   // someone stands where it will land
      b._atkTimer = 1e9;
      var toy = projectiles.find(function(p){ return p.springBot; });
      out.has = !!toy;
      out.toy = { springy: toy.springy, delay: toy.delay, dmg: toy.dmg, kb: toy.kb, volley: toy.volley, id: toy.bossAtk, warnX: toy.warnX, warnY: toy.warnY, x0: toy.x, y0: toy.y, vx: toy.vx,
                  warn: toy.warn, state: toy.sb.s, top: top, face: b.face, gy: gy };
      var fell = 0; while (toy.sb.s === 0 && fell < 120){ step(); f.x = 880; f.vx = 0; f.y = gy - 24; f.vy = 0; fell++; }
      out.fell = fell; out.land = { x: toy.x, y: toy.y, state: toy.sb.s, warn: toy.warn, pct: f.pct, alive: projectiles.indexOf(toy) >= 0 && toy.life > 0 };
      // never onto an open hole: it comes down beside it
      projectiles = []; springyHole(880, 1, ++BOSS_ATK_ID); b._boxX = 880; BOSS_MOVES.springbot(b, f);
      var t2 = projectiles.find(function(p){ return p.springBot; }); out.hole = { x: t2.warnX, over: !!springyHoleAt(t2.warnX) };
      summons = []; projectiles = []; return out;
    })()`);
    expect(r.kind).toBe('springbot');
    expect(r.name, 'the line of its own, Spring-Bot\'s: "My. Purpose."').toBe('MY PURPOSE!');
    expect(r.tel, 'the wind-up he always has').toBe(40);
    expect(r.boxX, 'you stand at 300, so the box farthest from you: the right one').toBe(r.WW*0.8);
    expect(r.tell, 'the ray and the waves are drawn in the wind-up').toBe(true);
    expect(r.tellErr).toBe(null);
    expect(r.has, 'the wind-up ends and the toy is dropped').toBe(true);
    expect(r.toy).toMatchObject({ springy: true, dmg: 0, kb: 0, volley: true, warnX: r.boxX, warnY: r.toy.gy, y0: r.toy.top, state: 0 });
    expect(r.toy.delay, 'inert: a delayed shot, so the projectile step never moves, ages or hits with it').toBeGreaterThan(1e5);
    expect(r.toy.id).toBeGreaterThan(0);
    expect(r.toy.warn, 'it falls under a shadow').toBeGreaterThan(0);
    expect(Math.sign(r.toy.vx), 'on a slant, the way he faced as he dropped it (FALL_DRIFT)').toBe(Math.sign(r.toy.face));
    expect(Math.abs(r.toy.x0 - r.toy.warnX), 'and starts back along it').toBeGreaterThan(20);
    expect(r.fell).toBeGreaterThan(20);
    expect(r.fell).toBeLessThan(70);
    expect(r.land).toMatchObject({ x: r.boxX, y: r.toy.gy - 12, state: 1, warn: 0, pct: 0, alive: true });   // on its shadow, its feet on the floor, harmless to the fighter it landed beside
    expect(r.hole.over, 'never onto an open hole').toBe(false);
    expect(Math.abs(r.hole.x - 880)).toBeGreaterThanOrEqual(W.eval('SPRINGY.holeW')*0.5);
  });

  it('it writes down the first five specials any fighter uses after it lands -- what, and who -- and not a jab, an up-special, a down-special or a smash, nothing before it lands and nothing after the fifth', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(), out = {};
      var g = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 420, gy-24, 1); g.team=0; g.controller='still'; g.stocks=9; fighters.push(g);
      var park = function(){ f.x = 300; f.vx = 0; g.x = 420; g.vx = 0; };
      var cast = function(who){ who.spCd = 0; who.atkCd = 0; who.smCd = 0; who._windup = null; doSpecial(who); step(); park(); };
      b._telPh = 1; b._boxX = 880; BOSS_MOVES.springbot(b, f);
      var toy = projectiles.find(function(p){ return p.springBot; });
      cast(f);                                              // it is still falling: not heard
      out.falling = toy.sb.r.length;
      var n = 0; while (toy.sb.s === 0 && n++ < 120){ step(); park(); }
      f.atkCd = 0; doAttack(f); f.spCd = 0; doUpSpecial(f); f.spCd = 0; doDownSpecial(f); f.smCd = 0; doSmash(f); step(); park();
      out.others = toy.sb.r.length;
      springyBotHear({ idx:0, color:'#fff', _knockoff:{ until:hazardT + 50 } }, 'ember'); out.copy = toy.sb.r.length;   // Dough's copy of a move is the press that made it
      out.states = [];
      [f, g, f, g, f].forEach(function(w){ cast(w); out.states.push(toy.sb.s); });
      out.five = toy.sb.r.map(function(q){ return q.k + '/' + q.idx + '/' + q.c; }); out.colors = [f.color, g.color];
      cast(g); out.sixth = toy.sb.r.length;
      summons = []; projectiles = []; return out;
    })()`);
    expect(r.falling, 'nothing is written down before it lands').toBe(0);
    expect(r.others, 'a jab, an up-special, a down-special and a smash are not "specials" here').toBe(0);
    expect(r.copy, "Dough's copy is not a second press").toBe(0);
    expect(r.states, 'still listening until the fifth, then it readies').toEqual([1, 1, 1, 1, 2]);
    expect(r.five, 'what each was, and who used it, in order').toEqual([`ember/0/${r.colors[0]}`, `cap/1/${r.colors[1]}`, `ember/0/${r.colors[0]}`, `cap/1/${r.colors[1]}`, `ember/0/${r.colors[0]}`]);
    expect(r.sixth, 'the first five only').toBe(5);
  });

  it('with five in it readies, then plays them back three times: each a shot drawn as its special, out of the toy, at whoever used it, one attack id, a modest share of a hit; then it powers down and is gone', () => {
    const r = W.eval(`(function(){ ${TOY(false)}
      say(f, g, f, g, f);
      var out = { state: toy.sb.s, shots: [], calls: 0, B: B, full: bossDmg(), toyId: toy.bossAtk }, n = 0, mx = toy.x, my = toy.y - 18;
      out.wantF = Math.atan2(f.y - my, f.x - mx); out.wantG = Math.atan2(g.y - my, g.x - mx);
      while (toy.life > 0 && out.calls < 3000){
        out.calls++; springyBotStep(toy, b);   // the toy's own clock
        projectiles.forEach(function(p){ if (p.springEcho && !p._n){ p._n = ++n;
          out.shots.push({ call: out.calls, shape: p.shape, ang: Math.atan2(p.vy, p.vx), speed: Math.hypot(p.vx, p.vy), x: p.x, y: p.y, r: p.r, dmg: p.dmg, id: p.bossAtk, volley: p.volley, springy: p.springy, owner: p.owner, color: p.color }); } });
      }
      out.colors = [f.color, g.color]; summons = []; projectiles = []; return out;
    })()`);
    const B = r.B;
    expect(r.state, 'five in: it readies').toBe(2);
    expect(r.shots).toHaveLength(15);
    expect(r.shots.map((s) => s.shape), 'the same five, in the order they were used, three times, each drawn as its special').toEqual(Array(3).fill(['ember', 'cap', 'ember', 'cap', 'ember']).flat());
    expect(r.shots[0].call, 'after its squat, a beat before the first').toBe(B.ready + B.first);
    expect(r.shots.slice(1).map((s, i) => s.call - r.shots[i].call), 'a shot every gap, a longer pause between plays').toEqual([34, 34, 34, 34, 60, 34, 34, 34, 34, 60, 34, 34, 34, 34]);
    expect(r.calls, 'then it powers down, and is gone').toBe(r.shots[14].call + B.down);
    for (const s of r.shots) {
      expect(s.ang, `${s.shape}: fired at whoever used it`).toBeCloseTo(s.shape === 'ember' ? r.wantF : r.wantG, 6);
      expect(s.speed).toBeCloseTo(B.speed[1], 6);
      expect(s.r).toBe(B.shotR);
      expect(s.id, 'one attack id for the whole toy').toBe(r.toyId);
      expect(s.dmg, 'a modest share of a boss hit').toBeCloseTo(r.full*B.dmg, 6);
      expect([s.volley, s.springy, s.owner], 'a volley, his, a boss\'s').toEqual([true, true, -2]);
      expect(s.color, 'in the colour of whoever used it').toBe(s.shape === 'ember' ? r.colors[0] : r.colors[1]);
    }
    expect(B.dmg).toBeLessThan(0.5);
  });

  it('a shorter recording plays as many as it has, three times; one that heard nothing powers down quietly; a second toy replaces the first; phases play quicker', () => {
    const r = W.eval(`(function(){ ${TOY(false)}
      var out = {}, run = function(t){ var shots = [], calls = 0; while (t.life > 0 && calls < 3000){ calls++; springyBotStep(t, b);
        projectiles.forEach(function(p){ if (p.springEcho && !p._n){ p._n = calls; shots.push(p.shape + '@' + calls); } }); } return { shots: shots, calls: calls }; };
      say(f, g); out.two = run(toy);
      projectiles = []; BOSS_MOVES.springbot(b, f);
      var t2 = projectiles.find(function(p){ return p.springBot; }); t2.sb.s = 1; t2.sb.t = 0; t2.y = t2.warnY - t2.r*0.5; t2.x = t2.warnX;
      out.none = run(t2); out.echoes = projectiles.filter(function(p){ return p.springEcho; }).length;
      projectiles = []; BOSS_MOVES.springbot(b, f); var first = projectiles.find(function(p){ return p.springBot; }); BOSS_MOVES.springbot(b, f);
      out.alive = projectiles.filter(function(p){ return p.springBot && p.life > 0; }).length; out.firstLife = first.life; out.firstR = first.r;
      out.phases = [1, 2, 3].map(function(ph){ projectiles = []; b._telPh = ph; BOSS_MOVES.springbot(b, f); var t3 = projectiles.find(function(p){ return p.springBot; });
        t3.sb.s = 1; t3.sb.t = 0; t3.y = t3.warnY - t3.r*0.5; t3.x = t3.warnX; springyBotHear(f, 'ember'); springyBotHear(f, 'ember');
        var q = run(t3); return q.shots.map(function(s){ return +s.split('@')[1]; }); });
      summons = []; projectiles = []; return out;
    })()`);
    const B = W.eval('SPRINGY.bot');
    expect(r.two.shots.map((s) => s.split('@')[0]), 'two heard: two played, three times').toEqual(['ember', 'cap', 'ember', 'cap', 'ember', 'cap']);
    expect(r.none.shots).toEqual([]);
    expect(r.none.calls, 'it waits out the window, and powers down').toBe(B.listen + B.down);
    expect(r.echoes, 'and plays nothing').toBe(0);
    expect(r.alive, 'one toy at a time').toBe(1);
    expect(r.firstLife, 'the first is gone').toBe(0);
    expect(r.firstR).toBe(0);
    // the gap between shots, by phase: 34 / 30 / 26
    expect(r.phases.map((c) => c[1] - c[0])).toEqual([B.gap[1], B.gap[2], B.gap[3]]);
    expect(B.gap[3]).toBeLessThan(B.gap[1]);
    expect(B.speed[3]).toBeGreaterThan(B.speed[1]);
  });

  it('one attack id and a volley: fifteen shots at one fighter are at most ONE boss hit, and each hit is a modest share of it', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY();
      b._telPh = 1; b._boxX = 880; BOSS_MOVES.springbot(b, f); b._atkTimer = 1e9;
      var toy = projectiles.find(function(p){ return p.springBot; });
      for (var i=0;i<80 && toy.sb.s === 0;i++){ step(); f.x = 300; f.vx = 0; }
      for (var k=0;k<5;k++){ f.spCd = 0; f.atkCd = 0; doSpecial(f); step(); f.x = 300; f.vx = 0; }
      var hits = [], last = 0, frames = 0; f.pct = 0;
      for (var n=0;n<1500 && projectiles.indexOf(toy) >= 0;n++){
        step(); f.x = 300; f.vx = 0; f.y = gy - 24; f.vy = 0; f.invuln = 0; frames++;
        if (f.pct > last + 1e-9){ hits.push(+(f.pct - last).toFixed(3)); last = f.pct; }
      }
      var out = { hits: hits, total: f.pct, full: bossDmg(), gone: projectiles.indexOf(toy) < 0, frames: frames, recorded: toy.sb.r.length };
      summons = []; projectiles = []; return out;
    })()`);
    expect(r.recorded).toBe(5);
    expect(r.hits[0], 'a hit is a modest share of a boss hit').toBeCloseTo(r.full*0.35, 3);
    expect(r.hits.length, 'three of them fill the one hit it has').toBe(3);
    expect(r.total, 'at most one boss hit from the whole toy, however many shots it plays').toBeCloseTo(r.full, 5);
    expect(r.gone, 'and when it is done it goes').toBe(true);
    expect(r.frames).toBeLessThan(1400);
  });

  it('no words: its wind-up is the only line it puts on the screen -- nothing names a special it recorded', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var seen = [], _b = banner; banner = function(t, m, k, l){ seen.push({ t: String(t), k: k || null }); return _b(t, m, k, l); };
      try {
        var g = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 420, groundY()-24, 1); g.team=0; g.controller='still'; g.stocks=9; fighters.push(g);
        f.invuln = 1e9; g.invuln = 1e9; b._moveN = 5; b._atkTimer = 1; step();
        for (var i=0;i<45 && b._tel>0;i++) step();
        b._atkTimer = 1e9;
        var toy = projectiles.find(function(p){ return p.springBot; });
        toy.y = toy.warnY - toy.r*0.5; toy.x = toy.warnX; toy.vx = 0; toy.vy = 0; toy.warn = 0; toy.sb.s = 1; toy.sb.t = 0;
        springyBotHear(f, 'ember'); springyBotHear(g, 'cap');
        var calls = 0; while (toy.life > 0 && calls < 3000){ calls++; springyBotStep(toy, b); }
        return { seen: seen, played: projectiles.filter(function(p){ return p.springEcho; }).length };
      } finally { banner = _b; summons = []; projectiles = []; }
    })()`);
    expect(r.played, 'it played them back').toBe(6);
    expect(r.seen, 'one boss telegraph, and no other words').toEqual([{ t: 'MY PURPOSE!', k: 'boss' }]);
  });

  it('it draws in every state -- falling, listening, readying, winding up each shot, powering down -- with the art loaded and without, and every kit\'s special draws as a shot it plays back', () => {
    const r = W.eval(`(function(){
      var gy = groundY(), out = { bad: [] }, calls, c, im = { complete:true, naturalWidth:113, naturalHeight:80 };
      var rec = [{ k:'ember', c:'#f0803a' }, { k:'cap', c:'#3a86e0' }, { k:'ember', c:'#f0803a' }];
      var states = [{ s:0, t:3, h:0, i:0, v:0, f:0, r:[] }, { s:1, t:10, h:0, i:0, v:0, f:0, r:rec.slice(0, 1) }, { s:1, t:11, h:12, i:0, v:0, f:0, r:rec }, { s:2, t:12, h:0, i:0, v:0, f:0, r:rec },
        { s:3, t:0, h:0, i:1, v:0, f:30, r:rec }, { s:3, t:0, h:0, i:1, v:1, f:6, r:rec }, { s:3, t:0, h:10, i:0, v:2, f:1, r:rec }, { s:4, t:20, h:0, i:0, v:3, f:0, r:rec }];
      states.forEach(function(sb, n){
        [im, null].forEach(function(img){
          calls = []; c = ${REC};
          try { drawSpringBot({ x:880, y:gy - 12, r:24, color:'#93a85a', springBot:true, sb:sb }, c, img); } catch(e){ out.bad.push('state ' + n + ': ' + e.message); }
          if (img){ out['img' + n] = calls.filter(function(q){ return q[0] === 'drawImage'; }).length; if (n === 1){ var d = calls.find(function(q){ return q[0] === 'drawImage'; }); out.size = [d[4], d[5]]; } }
          else out['glyph' + n] = calls.filter(function(q){ return q[0] === 'drawImage'; }).length;
        });
        try { drawProjectile({ x:880, y:gy - 12, vx:0, vy:0, r:24, color:'#93a85a', springBot:true, springy:true, sb:sb }); } catch(e){ out.bad.push('drawProjectile ' + n + ': ' + e.message); }
      });
      try { drawProjectile({ x:880, y:200, vx:-2, vy:6, r:24, color:'#93a85a', warn:40, warnX:860, warnY:gy, springBot:true, springy:true, sb:states[0] }); } catch(e){ out.bad.push('falling: ' + e.message); }
      var keys = {}; ROSTER.forEach(function(r){ if (r.kit && r.kit.special) keys[r.kit.special] = 1; });
      out.kinds = Object.keys(keys).length;
      Object.keys(keys).forEach(function(k){
        try { drawProjectile({ x:300, y:300, vx:-8, vy:0, r:13, color:'#f0803a', shape:k, springEcho:true, springy:true, owner:-2, ownerObj:null, life:50 });
              drawSpringBot({ x:500, y:gy - 12, r:24, color:'#93a85a', springBot:true, sb:{ s:3, t:0, h:0, i:0, v:0, f:4, r:[{ k:k, c:'#f0803a' }] } }); }
        catch(e){ out.bad.push(k + ': ' + e.message); }
      });
      return out;
    })()`);
    expect(r.bad, 'nothing throws').toEqual([]);
    expect(r.kinds, 'every special in the roster').toBeGreaterThanOrEqual(100);
    for (let n = 0; n < 8; n++) expect(r['img' + n], `state ${n}: the art, once`).toBe(1);
    for (let n = 0; n < 8; n++) expect(r['glyph' + n], `state ${n}: the glyph until it loads, no image`).toBe(0);
    expect(r.size[1], 'drawn 65 px tall at its size (38 x 1.7), a toy not a boss').toBeCloseTo(38*1.7, 3);
    expect(r.size[0]).toBeCloseTo(38*1.7*113/80, 3);
  });

  it('it wears the show\'s art: File:Springbot.png from the II wiki, in the fetch script, the manifest and the credits, transparent and projectile-sized; a drawn glyph stands in until it loads', () => {
    const file = 'artifacts/V1/assets/sprites/attacks/springbot.png';
    expect(existsSync(file)).toBe(true);
    const png = PNG.sync.read(readFileSync(file));
    expect(Math.max(png.width, png.height), 'projectile-sized').toBeLessThanOrEqual(128);
    const alpha = (x, y) => png.data[(y * png.width + x) * 4 + 3];
    expect([alpha(0, 0), alpha(png.width - 1, 0), alpha(0, png.height - 1), alpha(png.width - 1, png.height - 1)], 'transparent, not a sticker').toEqual([0, 0, 0, 0]);
    const man = JSON.parse(readFileSync('scripts/attack-sprite-manifest.json', 'utf8')).springbot;
    expect(man).toMatchObject({ who: 'Springy', kits: ['springbot'], file: 'springbot.png', wiki: 'ii', srcTitle: 'Springbot.png', width: png.width, height: png.height,
      source: expect.stringContaining('/inanimateinsanity/images/8/8b/Springbot.png/') });
    expect(man.clearFrac, 'transparent round the toy').toBeGreaterThan(0.12);
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    expect(credits).toContain('(springbot.png)');
    expect(credits).toContain(man.source);
    expect(readFileSync('scripts/fetch-attack-sprites.mjs', 'utf8'), 'his pick, the one block at the end of the list').toMatch(/springbot:\s*\{ who: 'Springy', kits: \['springbot'\], wiki: 'ii', file: 'Springbot\.png'/);
    const reg = W.eval('({ e: ATTACK_SPRITES.springbot, glyph: typeof PROJ_SHAPE.springbot.draw, spring: ATTACK_SPRITES.springbot.src.split("/").pop() })');
    expect(reg.e).toEqual({ src: 'assets/sprites/attacks/springbot.png', h: 38, cap: 1.7 });
    expect(reg.glyph).toBe('function');
  });

  it('his Spring-Bot, and every shot it plays back, go with him when he falls', () => {
    const r = W.eval(`(function(){ ${TOY(true)}
      var st = setTimeout; setTimeout = function(){ return 0; };
      try {
        BOSSRUSH.active = true; say(f, g, f, g, f);
        for (var i=0;i<80;i++){ springyBotStep(toy, b); }   // five in: it has readied and is playing
        var before = { toys: projectiles.filter(function(p){ return p.springBot; }).length, echoes: projectiles.filter(function(p){ return p.springEcho; }).length };
        b.hp = 0; bossRushCheck();
        var after = { toys: projectiles.filter(function(p){ return p.springBot; }).length, echoes: projectiles.filter(function(p){ return p.springEcho; }).length,
                      hisLeft: projectiles.filter(function(p){ return p.springy; }).length };
        return { before: before, after: after };
      } finally { setTimeout = st; BOSSRUSH.active = false; summons = []; projectiles = []; worldPlats = []; }
    })()`);
    expect(r.before.toys).toBe(1);
    expect(r.before.echoes).toBeGreaterThan(0);
    expect(r.after.toys).toBe(0);
    expect(r.after.echoes).toBe(0);
    expect(r.after.hisLeft, 'only the hole of his ending').toBe(1);
  });

  it('an item Springy (summonBoss) never throws it: his second moves stay the punch and the boxes', () => {
    const r = W.eval(`(function(){ projectiles = []; worldPlats = [];
      var s = { type:'boss', name:'Springy', color:'#afafaf', x:550, y:300, r:70, hp:200, vx:0, vy:0, face:1, _atkTimer:1, _tel:0 };
      var out = []; for (var i=0;i<8;i++){ s._atkTimer = 1; s._tel = 0; updateBossAttack(s, null); out.push(String(s._telKind)); s._tel = 1; updateBossAttack(s, null); }
      var toys = projectiles.filter(function(p){ return p.springBot; }).length;
      projectiles = []; worldPlats = []; summons = [];
      return { kinds: out, only: BOSS_RUSH_ONLY.has('springbot'), toys: toys };
    })()`);
    expect(r.only).toBe(true);
    expect(r.kinds).toEqual(['undefined', 'longarm', 'undefined', 'boxdrop', 'undefined', 'longarm', 'undefined', 'boxdrop']);
    expect(r.toys).toBe(0);
  });

  it('a netcode client sees the toy and what it plays back: its state, its pips and the shots, whole, drawn from the snapshot alone', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow();
      BOSS_ARENA = 'cerealbox'; var gy = groundY(), O = { owner:-2, ownerObj:{ team:-1, idx:-2 } };
      var rec = [{ k:'ember', idx:0, c:'#f0803a' }, { k:'cap', idx:1, c:'#3a86e0' }, { k:'ember', idx:0, c:'#f0803a' }];
      summons = [{ type:'boss', name:'Springy', color:'#afafaf', r:88, sprite:'springy', x:500, y:gy-88, hp:300, maxHp:330, face:-1, flash:0, homeX:500, _rage:false, _tel:12, _telKind:'springbot', _boxX:880,
                   _bossRush:true, attack:'springy', _phase:1 }];
      projectiles = [Object.assign({ x:880, y:gy-12, vx:0, vy:0, r:24, color:'#93a85a', bossAtk:9, life:1, delay:1e6, warn:0, warnX:880, warnY:gy, springBot:true, springy:true,
                       sb:{ s:3, t:0, h:5, i:2, v:1, f:9, ph:1, id:9, r:rec } }, O),
                     Object.assign({ x:700, y:gy-30, vx:-8, vy:0, r:13, color:'#f0803a', shape:'ember', bossAtk:9, life:60, volley:true, springy:true, springEcho:true }, O),
                     Object.assign({ x:900, y:200, vx:-2, vy:6, r:24, color:'#93a85a', bossAtk:10, life:1, delay:1e6, warn:40, warnX:880, warnY:gy, springBot:true, springy:true,
                       sb:{ s:0, t:3, h:0, i:0, v:0, f:0, ph:1, id:10, r:[] } }, O)];
      var snap = JSON.parse(JSON.stringify(serializeState()));
      summons = []; projectiles = []; BOSS_ARENA = null;
      applySnapshot(snap);
      var err = null; try { summons.forEach(drawSummon); projectiles.forEach(drawProjectile); drawBossBar(); } catch(e){ err = e.message; }
      return { err: err, toy: projectiles[0], echo: projectiles[1], falling: projectiles[2], boss: snap.summons[0] };
    })()`);
    expect(r.err).toBe(null);
    expect(!!r.toy.springBot).toBe(true);
    expect(r.toy.sb, 'what a client draws from: the state, the playback, and the colour and special of each pip -- not who, not the attack id').toEqual({ s: 3, t: 0, h: 5, i: 2, v: 1, f: 9,
      r: [{ k: 'ember', c: '#f0803a' }, { k: 'cap', c: '#3a86e0' }, { k: 'ember', c: '#f0803a' }] });
    expect(r.echo).toMatchObject({ shape: 'ember', vx: -8 });
    expect(!!r.echo.springEcho, 'a shot it plays back wears its ring on the client too').toBe(true);
    expect(r.falling.sb).toMatchObject({ s: 0, r: [] });
    expect(r.falling, 'the shadow it falls toward').toMatchObject({ warn: 40, warnX: 880 });
    expect(r.boss, 'the box its ray comes from, in the wind-up').toMatchObject({ _telKind: 'springbot', _boxX: 880, _tel: 12 });
  });
});
