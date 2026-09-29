import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';
import { loadMonolith } from './helpers/load-monolith.js';

// "mephone should be a boss, alongside 4s, and cobs." Steve Cobs -- "the overall main antagonist of the Inanimate Insanity
// series" on the II wiki, Meeple's CEO, who made MePhone4 and every Meeple device -- is Boss 11 of the gauntlet, after Two
// and before Four. Every attack is his from the wiki: the contraption he sets off when Balloon calls the Meeple Watch dumb
// (his page; Theft and Battery), and from Objects in Mirror the punches that cracked MePhone4's screen, the MeKnife, and
// the kernels he stomped. Nothing is built on a scene from the OSC, so the MeTags and MePhoneX the first design used are
// not in it, and a test below checks every line about him. The trap was first built as "TICK TOCK", after the chant; the
// review found that the Theft and Battery page has the chant begin as an OSC member's line, which he only continues, so
// it is named for the contraption now (the owner's standing rule: no move built on a moment that depends on them).
//
// 2026-09-28: "Cobs should also be a secret boss ... replace him with springy." He is OFF the Boss Rush roster -- Springy
// holds Boss 11 (test/boss-springy.test.js) -- and every piece of his code is kept for the secret fight being built on it.
// The roster pins below were rewritten for that: his row is COBS_ROW now, and the tests that drive his moves spawn him from
// it the way the gauntlet used to (makeBossSummon). Everything that tests his attack code is as it was.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// A still Firey on the floor at `x`, in Boss Rush with the gauntlet logic off (BOSSRUSH.active false), and Steve Cobs
// spawned from COBS_ROW the way the gauntlet spawned him when he was Boss 11 (makeBossSummon, 330 HP for one fighter).
// His attack timer is parked unless `live` is set.
const STAGE = (x, live) => `
  SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
  BOSSRUSH = { active:false, bossIdx:0, cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), ${x}, groundY()-24, 0);
  f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
  BOSS_ARENA = COBS_ROW.arena; summons.push(makeBossSummon(COBS_ROW, COBS_ROW.hp));
  var b = summons.find(function(s){ return s.type==='boss'; });
  ${live ? '' : 'b._atkTimer = 1e9;'}
  step(); f.pct=0; f.invuln=0;
`;
// A bare Steve Cobs for driving his functions directly.
const S = (o = '') => `{ name:'Steve Cobs', attack:'cobs', x:900, y:groundY()-88, r:88, hp:100, maxHp:100, _phase:1, _atkTimer:1, _tel:0,
  color:'#f0d010', face:-1, homeX:900, stationary:true, vx:0, vy:0 ${o ? ',' + o : ''} }`;
const ids = (list) => `${list}.map(function(p){ return p.bossAtk; }).filter(function(v, i, a){ return a.indexOf(v)===i; }).length`;

describe('Steve Cobs, off the gauntlet, his kit whole', () => {
  // Was 'is Boss 11, after Two and before Four'. "replace him with springy" (2026-09-28): he is not a roster row any more
  // -- never spawned by the gauntlet, never rolled by the item boss -- and Springy holds Boss 11. His row is COBS_ROW, whole,
  // and his second moves, their names and his functions are all still there for the secret fight.
  it('is not a Boss Rush boss any more; COBS_ROW is his old row, his second moves and his code are kept', () => {
    const r = W.eval(`(function(){
      var idx = function(n){ return BOSS_ROSTER.findIndex(function(b){ return b.name===n; }); };
      return { i: idx('Steve Cobs'), springy: idx('Springy'), four: idx('Four'), n: BOSS_ROSTER.length, first: BOSS_ROSTER[0].name, row: COBS_ROW,
               extra: BOSS_EXTRA['Steve Cobs'], moves: BOSS_EXTRA['Steve Cobs'].map(function(k){ return typeof BOSS_MOVES[k] + '/' + BOSS_MOVE_NAME[k]; }),
               fns: [typeof cobsBeginTelegraph, typeof cobsContraption, typeof cobsTrapArrow, typeof cobsPunch, typeof cobsPunchSpan, typeof COBS, typeof BOSS_SPRITE_SRC.cobs, bossPhaseName({attack:'cobs'}, 3)] };
    })()`);
    expect(r.i, 'off the roster').toBe(-1);
    expect(r.springy, 'Springy is Boss 11 in his place').toBe(10);
    expect(r.four, 'Four is still last').toBe(r.n - 1);
    expect(r.n, 'the gauntlet is still twelve long').toBe(12);
    expect(r.first).toBe('Announcer');
    // hp 330, not the design's 310: at 310 he was the easiest of the last four bosses (see COBS in index.html)
    expect(r.row).toEqual({ name: 'Steve Cobs', color: '#f0d010', hp: 330, big: 2.6, attack: 'cobs', arena: 'meeple', stationary: true, sprite: 'cobs' });
    expect(r.extra).toEqual(['knife', 'kernels']);
    // "MEKNIFE!", not "MEEPLE KNIFE!": his page says he "stabbed The Prime Shimmer with a MeKnife"
    expect(r.moves).toEqual(['function/MEKNIFE!', 'function/KERNEL STOMP!']);
    expect(r.fns).toEqual(['function', 'function', 'function', 'function', 'function', 'object', 'string', 'The Most Painful Way']);
  });

  it('every boss of the gauntlet is exactly as it was, Springy in his slot: its row, its second moves, its turns, its wind-up and its phases', () => {
    const r = W.eval(`(function(){
      return BOSS_ROSTER.filter(function(b){ return b.name!=='Steve Cobs'; }).map(function(b){
        var s = { name:b.name, attack:b.attack, x:550, y:300, r:80, hp:100, maxHp:100, _phase:1, _atkTimer:1, _tel:0, color:b.color,
                  face:1, homeX:550, stationary:b.stationary, vx:0, vy:0 };
        var turns = [];
        for (var i=0;i<4;i++){ s._atkTimer = 1; s._tel = 0; updateBossAttack(s, null); turns.push(s._telKind); }
        summons = []; projectiles = [];
        return [b.name, b.color, b.hp, b.big, b.attack, b.arena, b.stationary, b.sprite, BOSS_EXTRA[b.name].join('+'), turns.join(' '),
                bossTelLen({ attack:b.attack }), bossPhaseName({ attack:b.attack }, 2), bossPhaseName({ attack:b.attack }, 3)];
      });
    })()`);
    expect(r).toEqual([
      ['Announcer', '#3a4a6a', 175, 2.5, 'announcer', 'cakeatstake', false, 'announcer', 'annlaser+annacid+annballoon', 'announcer annlaser announcer annacid', 36, 'Budget Cuts', 'Crusher Arm'],   // rebuilt (boss overhaul, Round 9): see test/boss-announcer.test.js
      ['Puffball Speaker Box', '#c0b0d0', 200, 2.5, 'soundwave', 'studio', false, 'speaker', 'slam+rain', 'soundwave slam soundwave rain', 36, 'Double Speakers', 'Feedback Overload'],
      ['Firey Speaker Box', '#d0402a', 215, 2.5, 'firewall', 'volcano', false, 'speakerfirey', 'furnace+youmust', 'firewall furnace firewall youmust', 44, 'Flame Surge', 'RAGE MODE'],   // the owner cut FIRE WALL! for THE TLC NEEDS TO BE FIXED! (boss-plan-early.md 5, Round 9; test/boss-firey-sb.test.js): his signature turns alternate ROCKET BOARD! and the TLC, his second moves are FURNACE! and YOU MUST!; the wind-up is 44 in phase 1
      ['The Bug Swarm', '#8a3a3a', 225, 2.3, 'swarm', 'cave', false, 'bug', 'seekers+rain', 'swarm seekers swarm rain', 36, 'Second Wave', 'Swarm Frenzy'],
      ['Purple Face', '#7a3a8a', 235, 2.6, 'swallow', 'warehouse', false, 'face', 'pfaceRap+pfaceTorture+pfaceThanks+pfaceShoes', 'swallow pfaceRap swallow pfaceTorture', 46, 'Running Loops', 'Broken Value'],   // rebuilt (the boss overhaul): test/boss-purple-face.test.js
      ['Purple Dragon', '#6a3a9a', 250, 2.7, 'dragon', 'cave', false, 'dragon', 'slam+rain', 'dragon slam dragon rain', 36, 'Strafing Runs', 'Grab & Carry'],
      // MePhone4's HP is 255 now, was 240 -- the review's retune of him, not a side effect (test/boss-rush-order.test.js)
      ['MePhone4', '#4fb8e8', 255, 2.5, 'mephone', 'melife', true, 'mephone', 'melife+portal', 'mephone melife mephone portal', 36, 'Back and Forth', 'Glitching'],
      ['Evil Leafy', '#123a12', 185, 2.4, 'evilleafy', 'forest', false, 'evilleafy', 'seekers+slam', 'evilleafy seekers evilleafy slam', 45, 'No Refuge', 'Vine Coverage'],
      ['MePhone4S', '#c8102e', 260, 2.5, 'mephone4s', 'studio', false, 'mephone4s', 'cookies+chainsaws', 'mephone4s cookies mephone4s chainsaws', 42, "I'll Be Back", 'Super Death Trap'],
      ['Two', '#c8a020', 285, 2.6, 'two', 'void', false, 'two', 'seekers+ring', 'two seekers two ring', 36, 'Size Shift', 'Power Ungrounded — ground it to damage them!'],
      // Boss 11: Springy, in his place ("replace him with springy"; test/boss-springy.test.js has the fight)
      ['Springy', '#afafaf', 330, 2.6, 'springy', 'cerealbox', false, 'springy', 'longarm+boxdrop', 'springy longarm springy boxdrop', 40, 'Glitching', 'Unvitational'],
      ['Four', '#3a6ad0', 340, 2.8, 'four', 'void', true, 'four', 'rain+seekers', 'four rain four seekers', 50, 'Zap to Dust', 'Reality Buckles'],
    ]);
  });

  // Was 'walking the gauntlet spawns him eleventh'. It spawns Springy there now; a buried arrow of his left on the stage when
  // any boss falls is still swept (the filter in bossRushCheck is kept with the rest of his code).
  it('walking the gauntlet never spawns him -- Springy is eleventh -- and a buried arrow is still swept when a boss falls', () => {
    const r = W.eval(`(function(){
      var st = setTimeout; setTimeout = function(){ return 0; };   // bossRushCheck queues the next spawn; this walk spawns by hand
      try {
        SETTINGS.mode='boss'; SETTINGS.stocks=99; running=true;
        BOSSRUSH = { active:true, bossIdx:0, cleared:0, defeated:false, loop:0, dmgMult:1 };
        var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 200, groundY()-24, 0);
        f.team=0; f.controller='still'; f.stocks=3; fighters=[f]; summons=[];
        var order = [], atHim = null, card = null;
        for (var i=0;i<16;i++){
          spawnBossRushBoss();
          var b = summons.find(function(s){ return s.type==='boss'; });
          order.push(b.name);
          if (b.name==='Springy'){
            projectiles = [{ owner:-2, cobsTrap:true, delay:20, warn:1, x:300, y:600, r:16, life:7 }, { owner:-2, x:0, y:0, r:8, life:50 }];
            var idx0 = BOSSRUSH.bossIdx;
            b.hp = 0; bossRushCheck();
            // (Springy's ending opens the hole he goes down after the sweep: not "something else", his -- the springy flag)
            atHim = { arrowsLeft: projectiles.filter(function(p){ return p.cobsTrap; }).length, othersLeft: projectiles.filter(function(p){ return !p.springy; }).length,
                      advanced: BOSSRUSH.bossIdx - idx0, victory: document.getElementById('rushVictory').style.display };
            summons = summons.filter(function(s){ return s.type!=='springyend'; });
            continue;
          }
          b.hp = 0; bossRushCheck();
          if (b.name==='Four'){ card = document.getElementById('rushVicSub').textContent; break; }
        }
        return { order: order, atHim: atHim, card: card };
      } finally { setTimeout = st; BOSSRUSH.active=false; running=false; paused=false; summons=[]; projectiles=[]; worldPlats=[];
                  document.getElementById('rushVictory').style.display='none'; }
    })()`);
    expect(r.order).toEqual(['Announcer', 'Puffball Speaker Box', 'Firey Speaker Box', 'The Bug Swarm', 'Purple Face',
      'Purple Dragon', 'MePhone4', 'Evil Leafy', 'MePhone4S', 'Two', 'Springy', 'Four']);
    expect(r.order, 'the gauntlet never spawns him').not.toContain('Steve Cobs');
    expect(r.atHim.arrowsLeft, 'a buried arrow never comes up after a boss is gone').toBe(0);
    expect(r.atHim.othersLeft, 'nothing else is swept').toBe(1);
    expect(r.atHim.advanced).toBe(1);
    expect(r.atHim.victory, 'Boss 11 is not the last boss').not.toBe('flex');
    expect(r.card, 'the victory card counts twelve').toMatch(/^All twelve bosses beaten/);
  });

  it('takes turns: the Contraption, MeKnife, the Contraption, kernels, each named, with the 36-frame wind-up, and names his phases', () => {
    const r = W.eval(`(function(){
      var s = ${S()};
      var kinds = [], names = [];
      for (var i=0;i<4;i++){ s._atkTimer = 1; s._tel = 0; updateBossAttack(s, null); kinds.push(s._telKind); names.push(bossTelName(s)); }
      var p3 = ${S('_phase:3, stationary:false, hp:20')}, n3 = [];
      for (var j=0;j<4;j++){ p3._atkTimer = 1; p3._tel = 0; updateBossAttack(p3, null); n3.push(bossTelName(p3)); }
      return { kinds: kinds, names: names, n3: n3, tel: bossTelLen(s), p2: bossPhaseName(s, 2), p3: bossPhaseName(s, 3) };
    })()`);
    expect(r.kinds).toEqual(['cobs', 'knife', 'cobs', 'kernels']);
    expect(r.names).toEqual(['CONTRAPTION!', 'MEKNIFE!', 'CONTRAPTION!', 'KERNEL STOMP!']);
    expect(r.n3, 'phase 3: the punch takes every other signature turn, starting with the first').toEqual(
      ['SCREEN CRACKER!', 'MEKNIFE!', 'CONTRAPTION!', 'KERNEL STOMP!']);
    expect(r.tel).toBe(36);
    expect(r.p2, 'his page: "Appalled, Cobs hits a button"').toBe('Appalled');
    expect(r.p3, 'Objects in Mirror: "in the most painful way he can"').toBe('The Most Painful Way');
  });

  it('his phases change as his HP falls, each is announced, and in phase 3 he leaves his spot and comes for you', () => {
    const r = W.eval(`(function(){ ${STAGE(150)}
      var out = { p1: b._phase, hp: b.maxHp, st1: b.stationary };
      b.hp = b.maxHp*0.5; updateBossAttack(b, f); out.p2 = b._phase; out.b2 = document.getElementById('banner').textContent; out.st2 = b.stationary;
      b.hp = b.maxHp*0.2; updateBossAttack(b, f); out.p3 = b._phase; out.b3 = document.getElementById('banner').textContent; out.st3 = b.stationary;
      var d0 = Math.abs(b.x - f.x);
      for (var i=0;i<60;i++){ step(); f.x = 150; f.vx = 0; f.pct = 0; }
      out.closed = d0 - Math.abs(b.x - f.x);
      summons = []; return out;
    })()`);
    expect(r.hp, '330 for one fighter (COBS_ROW)').toBe(330);
    expect([r.p1, r.p2, r.p3]).toEqual([1, 2, 3]);
    expect(r.b2).toMatch(/PHASE 2: Appalled/);
    expect(r.b3).toMatch(/PHASE 3: The Most Painful Way/);
    expect([r.st1, r.st2, r.st3]).toEqual([true, true, false]);
    expect(r.closed, 'he walks you down').toBeGreaterThan(150);
  });

  // He used to walk right up to you in phase 3, and a boss on top of you is the easiest one to hit: the fight went by so
  // fast that it was shorter than MePhone4S's, and he measured level with MePhone4S, two bosses earlier (the review asked
  // for the curve to climb; test/boss-rush-order.test.js). Now he keeps a boxer's range and the lunge closes it.
  it('in phase 3 he walks in to COBS.approach, steps back from anyone inside COBS.backoff, and SCREEN CRACKER reaches from there', () => {
    const r = W.eval(`(function(){
      var tgt = { x:0, y:groundY()-24, dead:false, idx:0 };
      var mk = function(dx){ var s = ${S('_phase:3, stationary:false, hp:20, _atkTimer:1e9')}; tgt.x = s.x + dx; updateBossAttack(s, tgt); return s.vx; };
      var walk = ${S('_phase:3, stationary:false, hp:20, _atkTimer:1e9')}, x0 = walk.x;
      for (var i=0;i<90;i++){ tgt.x = x0 - 60; updateBossAttack(walk, tgt); walk.x += walk.vx; walk.vx *= 0.9; }   // his body's own step (updateSummons)
      return { far: mk(-500), close: mk(-100), closeRight: mk(100), hold: mk(-200), gap: Math.abs(walk.x - (x0 - 60)),
               approach: COBS.approach, backoff: COBS.backoff, reach: 88*0.6 + cobsPunchSpan() };
    })()`);
    expect(r.far, 'far off, he comes for you').toBeLessThan(0);
    expect(r.close, 'inside his backoff, he steps away from you').toBeGreaterThan(0);
    expect(r.closeRight, 'either side').toBeLessThan(0);
    expect(r.hold, 'between the two he holds').toBe(0);
    expect(r.backoff).toBeLessThan(r.approach);
    expect(r.gap, 'walked up to, he ends up out at his backoff distance').toBeGreaterThanOrEqual(r.backoff - 10);
    expect(r.reach, "SCREEN CRACKER's band reaches past the range he keeps").toBeGreaterThan(r.approach + 60);
  });

  it('left to fight, he sets off his traps, stabs and stomps; in phase 3 he punches as well', () => {
    const r = W.eval(`(function(){ ${STAGE(700, true)}
      var seen = { trap:0, knife:0, kernel:0, fist:0 }, AP = addProj;
      addProj = function(p){ if (p && p.owner===-2){
        if (p.cobsTrap) seen.trap++; else if (p.shape==='meepleknife') seen.knife++; else if (p.shape==='kernel') seen.kernel++; else if (p.shape==='cobsfist') seen.fist++; }
        return AP(p); };
      try {
        for (var i=0;i<600;i++){ step(); f.x = 700; f.vx = 0; f.pct = 0; }
        var p1 = Object.assign({}, seen);
        b.hp = b.maxHp*0.2; step();
        seen = { trap:0, knife:0, kernel:0, fist:0 }; projectiles = [];
        for (var j=0;j<760;j++){ step(); f.x = 700; f.vx = 0; f.pct = 0; }
        return { p1: p1, p3: seen, phase: b._phase };
      } finally { addProj = AP; summons = []; projectiles = []; }
    })()`);
    expect(r.p1.trap, 'five arrows a cast').toBeGreaterThanOrEqual(10);
    expect(r.p1.knife, 'the knife').toBeGreaterThan(0);
    expect(r.p1.kernel, 'two kernel waves').toBeGreaterThanOrEqual(2);
    expect(r.p1.fist, 'no punches before phase 3').toBe(0);
    expect(r.phase).toBe(3);
    expect(r.p3.fist, 'two punches, two fists each').toBeGreaterThanOrEqual(4);
    expect(r.p3.trap, 'and the Contraption between them, seven arrows a cast').toBeGreaterThanOrEqual(7);
    expect(r.p3.knife + r.p3.kernel, 'his second moves carry on').toBeGreaterThanOrEqual(3);
  });
});

describe('THE CONTRAPTION: the floor trap', () => {
  it('lays five arrows around where you stood, in two waves, each a whole boss hit under one volley id; seven, wider, from phase 2', () => {
    const r = W.eval(`(function(){ var out = {};
      [1, 2].forEach(function(ph){ projectiles = [];
        var s = ${S('_phase:ph, _telPh:ph, _telX:500, _telY:groundY()-24')};
        fireBossAttack(s, null);
        var a = projectiles.filter(function(p){ return p.cobsTrap; }).sort(function(p, q){ return p.x - q.x; });
        out[ph] = { n: a.length, xs: a.map(function(p){ return p.x; }), delays: a.map(function(p){ return p.delay; }),
          ok: a.every(function(p){ return p.dmg===bossDmg() && p.volley && p.warn===1 && p.warnY===groundY() && p.vy < 0 && p.life===7; }),
          ids: ${ids('a')}, all: projectiles.length };
      });
      projectiles = [];
      var w = ${S('_phase:1, _telPh:1, _telX:40, _telY:groundY()-24')}; fireBossAttack(w, null);
      out.wall = projectiles.map(function(p){ return p.x; }); projectiles = [];
      return out;
    })()`);
    expect(r[1].n).toBe(5);
    expect(r[1].xs).toEqual([332, 416, 500, 584, 668]);
    expect(r[1].delays, 'the first wave on the middle and the ends, the second 24 frames later').toEqual([30, 54, 30, 54, 30]);
    expect(r[1].ok).toBe(true);
    expect(r[1].ids, 'one attack id a cast').toBe(1);
    expect(r[1].all, 'nothing else is thrown').toBe(5);
    expect(r[2].n).toBe(7);
    expect(r[2].xs).toEqual([212, 308, 404, 500, 596, 692, 788]);
    expect(r[2].delays).toEqual([54, 30, 54, 30, 54, 30, 54]);
    expect(r[2].ok).toBe(true);
    expect(r.wall, 'no arrow in the wall').toEqual([40, 124, 208]);
  });

  it('stays buried under its shadow -- no move, no hit, no aging -- then pops you UP the frame after', () => {
    const r = W.eval(`(function(){ ${STAGE(600)}
      var s = ${S('_telPh:1, _telX:600, _telY:groundY()-24')};
      fireBossAttack(s, null);
      var a = projectiles.find(function(p){ return p.cobsTrap && p.x===600; }), y0 = a.y, life0 = a.life, out = { still: true, warned: true };
      for (var i=0;i<30;i++){ step(); f.x = 600; f.vx = 0; if (a.y!==y0 || a.life!==life0 || f.pct>0) out.still = false; if (a.warn!==1) out.warned = false; }
      step(); out.warnAfter = a.warn;
      for (var j=0;j<7 && !(f.pct>0);j++) step();
      out.pct = f.pct; out.vx = f.vx; out.vy = f.vy; out.full = bossDmg();
      projectiles = []; summons = []; return out;
    })()`);
    expect(r.still, 'a delayed arrow neither moves, hits nor ages').toBe(true);
    expect(r.warned, 'its shadow stays up the whole time it is buried').toBe(true);
    expect(r.warnAfter, 'and drops the frame it comes up').toBe(0);
    expect(r.pct).toBeCloseTo(r.full, 5);
    expect(r.vy, 'an arrow on a stick pops you up').toBeLessThan(0);
    expect(Math.abs(r.vy)).toBeGreaterThan(Math.abs(r.vx));
    expect(r.vx, 'and away from him (he stands to the right): straight up, nobody ever left the stage').toBeLessThan(0);
  });

  it('is one boss hit a cast, even when another boss hit lands between the two waves', () => {
    const r = W.eval(`(function(){ ${STAGE(600)}
      var s = ${S('_telPh:1, _telX:600, _telY:groundY()-24')};
      fireBossAttack(s, null);
      var tock = projectiles.find(function(p){ return p.cobsTrap && p.x===684; }), pin = function(x){ f.x = x; f.y = groundY()-24; f.vx = 0; f.vy = 0; };
      var taken = 0, p0;
      for (var i=0;i<40;i++){ p0 = f.pct; step(); taken += f.pct - p0; if (i < 38) pin(600); }
      var afterTick = taken;
      // another boss attack lands in between: the one-id memory in applyHit forgets the cast right here
      applyHit(f, 0, 0, 0, null, { bossAtk: ++BOSS_ATK_ID });
      for (var j=0;j<24;j++){ pin(684); f.invuln = 0; f.hitstun = 0; p0 = f.pct; step(); taken += f.pct - p0; }
      var out = { afterTick: afterTick, taken: taken, full: bossDmg(), tockY: tock.y, tockLife: tock.life, surf: groundY() };
      projectiles = []; summons = []; return out;
    })()`);
    expect(r.afterTick, 'the first wave lands a whole boss hit').toBeCloseTo(r.full, 5);
    expect(r.tockLife).toBe(0);
    expect(r.tockY, 'the second wave reached him (it broke on him low, not at the top of its rise)').toBeGreaterThan(r.surf - 60);
    expect(r.taken, 'and adds nothing: 44 uncapped').toBeLessThanOrEqual(r.full + 1e-6);
  });

  it('comes up out of the platform you stood on; one meant for the floor never reaches the platform above it, however low', () => {
    const r = W.eval(`(function(){ var out = {};
      [144, 90].forEach(function(h){
        ${STAGE(450)}
        var top = groundY() - h;
        worldPlats = [{ x:380, y:top, w:320, h:14 }];
        var g = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 534, top - 30, 1); g.team = 0; g.controller = 'still';
        fighters = [f, g];
        for (var k=0;k<20;k++){ step(); f.x = 450; f.vx = 0; }
        f.pct = 0; g.pct = 0; f.invuln = 0; g.invuln = 0;
        var onTop = g.onground && Math.abs(g.y + 24 - top) < 30;
        var s = ${S('_telPh:1')}; s.x = 950; s._telX = f.x; s._telY = f.y;
        fireBossAttack(s, null);
        var floorArrows = projectiles.filter(function(p){ return p.cobsTrap; }).map(function(p){ return p.warnY; });
        for (var i=0;i<80;i++){ step(); f.x = 450; f.vx = 0; g.x = 534; g.vx = 0; }
        var gSafe = g.pct === 0 && g.onground;
        // and the other way round: the target on the platform, so the arrows over it come out of its top
        projectiles = []; g.pct = 0;
        var s2 = ${S('_telPh:1')}; s2.x = 950; s2._telX = g.x; s2._telY = g.y;
        fireBossAttack(s2, null);
        var fromTop = projectiles.filter(function(p){ return p.cobsTrap && p.x >= 380 && p.x <= 700; }).every(function(p){ return p.warnY === top; });
        var outside = projectiles.filter(function(p){ return p.cobsTrap && (p.x < 380 || p.x > 700); }).every(function(p){ return p.warnY === groundY(); });
        for (var j=0;j<80;j++){ step(); g.x = 534; g.vx = 0; }
        out[h] = { onTop: onTop, fromFloor: floorArrows.every(function(y){ return y === groundY(); }), targetHit: f.pct > 0, gSafe: gSafe,
                   fromTop: fromTop, outside: outside, gHitOnTop: g.pct > 0 };
        projectiles = []; summons = [];
      });
      return out;
    })()`);
    for (const h of ['144', '90']) {
      expect(r[h].onTop, `the second fighter stands on the ${h} px platform`).toBe(true);
      expect(r[h].fromFloor).toBe(true);
      expect(r[h].targetHit, 'the one on the floor is hit').toBe(true);
      expect(r[h].gSafe, 'the one on the platform over a floor slot is not').toBe(true);
      expect(r[h].fromTop, 'aimed at the platform, the arrows over it come out of its top').toBe(true);
      expect(r[h].outside).toBe(true);
      expect(r[h].gHitOnTop, 'so standing up there is not a free camp').toBe(true);
    }
  });

  it('never hits the fighter standing on a low platform over a floor slot', () => {
    const r = W.eval(`(function(){ ${STAGE(450)}
      var top = groundY() - 90;
      worldPlats = [{ x:380, y:top, w:320, h:14 }];
      var g = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 534, top - 30, 1); g.team = 0; g.controller = 'still';
      fighters = [f, g];
      for (var k=0;k<20;k++){ step(); f.x = 450; f.vx = 0; }
      g.pct = 0; g.invuln = 0;
      var s = ${S('_telPh:1')}; s.x = 950; s._telX = f.x; s._telY = f.y;
      fireBossAttack(s, null);
      var under = projectiles.find(function(p){ return p.cobsTrap && p.x === 534; });
      var peak = null;
      for (var i=0;i<80;i++){ step(); f.x = 450; f.vx = 0; g.x = 534; g.vx = 0; if (under.life > 0 && !(under.delay > 0)) peak = under.y; }
      var out = { g: g.pct, onTop: g.onground, under: !!under, headTop: peak - under.r, top: top };
      projectiles = []; summons = []; return out;
    })()`);
    expect(r.under, 'an arrow comes up under him').toBe(true);
    expect(r.onTop).toBe(true);
    expect(r.headTop, 'its head stays under the platform top, and under the 12 px a hurtbox hangs below a fighter standing there').toBeGreaterThan(r.top + 12);
    expect(r.g, 'so he is never hit').toBe(0);
  });
});

describe('SCREEN CRACKER: phase 3', () => {
  it('lunges along the row you stood in and punches, then punches again from where the lunge took him: one boss hit at most', () => {
    const r = W.eval(`(function(){ ${STAGE(820)}
      b.hp = b.maxHp*0.2; updateBossAttack(b, f); b._atkTimer = 1e9;
      b.x = 550; b.vx = 0; f.x = 820; f.pct = 0;
      var fists = [], AP = addProj;
      addProj = function(p){ if (p && p.shape==='cobsfist') fists.push({ x:p.x, y:p.y, vx:p.vx, dmg:p.dmg, id:p.bossAtk, volley:!!p.volley, bx:b.x }); return AP(p); };
      try {
        b._atkTimer = 1; step();
        var out = { kind: b._telKind, punch: b._cobsPunch, dir: b._punchDir, row: b._punchY, fy: f.y, name: document.getElementById('banner').textContent };
        var taken = 0, p0, lungeMax = 0;
        for (var i=0;i<80;i++){ p0 = f.pct; step(); taken += f.pct - p0; f.x = 820; f.y = groundY()-24; f.vx = 0; f.vy = 0; f.invuln = 0; f.hitstun = 0;
          lungeMax = Math.max(lungeMax, Math.abs(b.vx)); }
        out.fists = fists; out.taken = taken; out.full = bossDmg(); out.lungeMax = lungeMax;
        return out;
      } finally { addProj = AP; summons = []; projectiles = []; }
    })()`);
    expect(r.kind).toBe('cobs');
    expect(r.punch).toBe(true);
    expect(r.name).toMatch(/SCREEN CRACKER!/);
    expect(r.dir, 'toward the side you were on').toBe(1);
    expect(r.row).toBeCloseTo(r.fy, 5);
    expect(r.fists).toHaveLength(2);
    expect(r.fists.every(f => f.vx === 14 && f.volley && f.dmg === r.full * 0.5)).toBe(true);
    expect(r.fists[0].id, 'one attack id').toBe(r.fists[1].id);
    expect(r.fists[1].bx, 'the second punch comes from further in').toBeGreaterThan(r.fists[0].bx + 60);
    expect(r.lungeMax, 'the lunge is faster than his walk').toBeGreaterThan(5.5);
    expect(r.taken).toBeGreaterThan(0);
    expect(r.taken, 'both landing is one boss hit').toBeLessThanOrEqual(r.full + 1e-6);
  });

  // The review's probe: the band ended about 227 px from him, the first fist's reach, and fighters at 260, 320 and 380 px --
  // all outside it -- each took 11% from the second fist, thrown from wherever the lunge had carried him.
  it('the wind-up band reaches as far as either punch can hit: inside it you are hit, a step outside it you are safe', () => {
    const r = W.eval(`(function(){ var out = [];
      [300, 380, 'in', 'out'].forEach(function(d){
        ${STAGE(900)}
        b.hp = b.maxHp*0.2; updateBossAttack(b, f); b._atkTimer = 1e9;
        b.x = 400; b.vx = 0;
        var end = b.r*0.6 + cobsPunchSpan();                     // where the band stops, from his middle
        var at = d === 'in' ? end + HURT_R0 - 12 : d === 'out' ? end + HURT_R0 + 6 : d;
        f.x = 400 + at; f.pct = 0; var fx = f.x;
        b._atkTimer = 1; step();
        var taken = 0, p0, bx0 = b.x, bxLunge = null, bxSecond = null, AP = addProj;
        addProj = function(p){ if (p && p.shape==='cobsfist'){ if (bxLunge === null) bxLunge = b.x; else bxSecond = b.x; } return AP(p); };
        try {
          for (var i=0;i<90;i++){ p0 = f.pct; step(); taken += f.pct - p0; f.x = fx; f.y = groundY()-24; f.vx = 0; f.vy = 0; f.invuln = 0; f.hitstun = 0; }
        } finally { addProj = AP; }
        out.push({ d: d, at: at, taken: taken, end: end, first: b.r*0.6 + cobsPunchReach(), punched: bxSecond !== null, moved: bxSecond - bxLunge });
        summons = []; projectiles = [];
      });
      return out;
    })()`);
    const [p300, p380, inside, outside] = r;
    expect(inside.end, 'the band covers the lunge as well as the first fist').toBeGreaterThan(inside.first + 100);
    expect(p300.at, 'the review\'s fighters stood past the first fist').toBeGreaterThan(p300.first);
    for (const p of [p300, p380, inside]) {
      expect(p.punched).toBe(true);
      expect(p.taken, `a fighter ${Math.round(p.at)} px out, inside the band, is hit`).toBeGreaterThan(0);
    }
    expect(outside.taken, 'a fighter whose body is just outside the band is safe').toBe(0);
    expect(inside.moved, 'he lunges in before the second punch').toBeGreaterThan(100);
  });

  it('he holds where the lunge stopped until the second punch has gone, so it comes from where the band said', () => {
    const r = W.eval(`(function(){ ${STAGE(900)}
      b.hp = b.maxHp*0.2; updateBossAttack(b, f); b._atkTimer = 1e9;
      b.x = 400; b.vx = 0; f.x = 1000; var fx = f.x;
      b._atkTimer = 1; step();
      var xs = [], AP = addProj, fists = [];
      addProj = function(p){ if (p && p.shape==='cobsfist') fists.push(b.x); return AP(p); };
      try { for (var i=0;i<90;i++){ step(); xs.push(b.x); f.x = fx; f.vx = 0; f.invuln = 0; } } finally { addProj = AP; }
      summons = []; projectiles = [];
      return { fists: fists, lunge: COBS.lunge*COBS.lungeT };
    })()`);
    expect(r.fists).toHaveLength(2);
    expect(r.fists[1] - r.fists[0], 'the whole lunge, and no further').toBeLessThanOrEqual(r.lunge + 1e-6);
    expect(r.fists[1] - r.fists[0]).toBeGreaterThan(r.lunge - 20);
  });

  it('a wind-up drawn as the Contraption fires the Contraption even if phase 3 starts during it; the next signature is the punch', () => {
    const r = W.eval(`(function(){ ${STAGE(700)}
      b.hp = b.maxHp*0.5; updateBossAttack(b, f); b._atkTimer = 1; step();
      var out = { kind: b._telKind, punch: b._cobsPunch, name: document.getElementById('banner').textContent };
      var shots = { trap:0, fist:0 }, AP = addProj;
      addProj = function(p){ if (p && p.cobsTrap) shots.trap++; if (p && p.shape==='cobsfist') shots.fist++; return AP(p); };
      try {
        b.hp = b.maxHp*0.2;
        for (var i=0;i<40;i++){ step(); f.x = 700; f.vx = 0; }
        out.phase = b._phase; out.shots = shots;
        b._atkTimer = 1; b._tel = 0; updateBossAttack(b, f); out.next1 = b._telKind;
        b._atkTimer = 1; b._tel = 0; updateBossAttack(b, f); out.next2 = b._telKind; out.next2punch = b._cobsPunch;
        return out;
      } finally { addProj = AP; summons = []; projectiles = []; }
    })()`);
    expect(r.kind).toBe('cobs');
    expect(r.punch).toBe(false);
    expect(r.name).toMatch(/CONTRAPTION!/);
    expect(r.phase).toBe(3);
    expect(r.shots.fist, 'no punch nobody was warned of').toBe(0);
    expect(r.shots.trap, 'the arrows it was drawn as, seven of them (phase 2)').toBe(7);
    expect(r.next1).toBe('knife');
    expect([r.next2, r.next2punch]).toEqual(['cobs', true]);
  });
});

describe('the second moves', () => {
  it('MEKNIFE: one stab at speed 15 at where you stood when he drew it, and he lunges that way', () => {
    const r = W.eval(`(function(){ projectiles = [];
      var s = ${S('_telX:600, _telY:groundY()-24')};
      BOSS_MOVES.knife(s, null);
      var k = projectiles.filter(function(p){ return p.owner===-2; });
      var out = { n: k.length, spd: Math.hypot(k[0].vx, k[0].vy), dmg: k[0].dmg, full: bossDmg(), shape: k[0].shape,
                  aim: Math.atan2(k[0].vy, k[0].vx), want: Math.atan2(s._telY - s.y, s._telX - s.x), vx: s.vx };
      projectiles = []; return out;
    })()`);
    expect(r.n).toBe(1);
    expect(r.spd).toBeCloseTo(15, 5);
    expect(r.dmg).toBeCloseTo(r.full * 0.8, 5);
    expect(r.shape).toBe('meepleknife');
    expect(r.aim).toBeCloseTo(r.want, 5);
    expect(Math.sign(r.vx), 'toward you').toBe(-1);
  });

  it('KERNEL STOMP: two kernel waves along the floor, one attack id', () => {
    const r = W.eval(`(function(){ projectiles = [];
      var s = ${S()}; BOSS_MOVES.kernels(s, null);
      var k = projectiles.filter(function(p){ return p.owner===-2; });
      var out = { vx: k.map(function(p){ return p.vx; }), y: k.map(function(p){ return p.y; }), shape: k.every(function(p){ return p.shape==='kernel'; }),
                  dmg: k[0].dmg, full: bossDmg(), ids: ${ids('k')}, gy: groundY() };
      projectiles = []; return out;
    })()`);
    expect(r.vx).toEqual([-8, 8]);
    expect(r.y).toEqual([r.gy - 12, r.gy - 12]);
    expect(r.shape).toBe(true);
    expect(r.dmg).toBeCloseTo(r.full * 0.8, 5);
    expect(r.ids).toBe(1);
  });

  it('an item Steve Cobs throws his knife and kernels and never sets off a trap', () => {
    const r = W.eval(`(function(){ projectiles = [];
      var s = { type:'boss', name:'Steve Cobs', color:'#f0d010', x:550, y:300, r:70, hp:200, vx:0, vy:0, face:1, _atkTimer:1, _tel:0 };
      var out = []; for (var i=0;i<4;i++){ s._atkTimer = 1; s._tel = 0; updateBossAttack(s, null); out.push(String(s._telKind)); s._tel = 1; updateBossAttack(s, null); }
      var traps = projectiles.filter(function(p){ return p.cobsTrap; }).length; projectiles = [];
      return { kinds: out, traps: traps };
    })()`);
    expect(r.kinds).toEqual(['undefined', 'knife', 'undefined', 'kernels']);
    expect(r.traps).toBe(0);
  });
});

describe('what the player sees', () => {
  it('his art is the II wiki render (File:SteveCobs2024PoseAlt.png), transparent, credited, flipped as measured, with a drawn fallback', () => {
    const src = W.eval('BOSS_SPRITE_SRC.cobs');
    expect(src).toBe('assets/sprites/steve-cobs.png');
    const file = 'artifacts/V1/' + src;
    expect(existsSync(file)).toBe(true);
    const png = PNG.sync.read(readFileSync(file));
    expect(png.height, 'at most 200 px tall').toBeLessThanOrEqual(200);
    expect([png.width, png.height]).toEqual([78, 200]);
    const alpha = (x, y) => png.data[(y * png.width + x) * 4 + 3];
    expect([alpha(0, 0), alpha(77, 0), alpha(0, 199), alpha(77, 199)], 'transparent, not a sticker').toEqual([0, 0, 0, 0]);
    const man = JSON.parse(readFileSync('scripts/sprite-manifest-inanimateinsanity.json', 'utf8'));
    expect(man['Steve Cobs']).toMatchObject({ ok: true, file: 'steve-cobs.png', flip: false, source: expect.stringContaining('/SteveCobs2024PoseAlt.png/') });
    expect(W.eval('!!BOSS_SPRITE_FLIP.cobs'), 'measured facing right, so not flipped').toBe(false);
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    expect(credits).toMatch(/\| Steve Cobs \| `steve-cobs\.png` \| https:\/\/static\.wikia\.nocookie\.net\/inanimateinsanity\/images\/c\/c9\/SteveCobs2024PoseAlt\.png/);
    expect(W.eval(`String(drawBossSprite).indexOf('case "cobs"') >= 0`)).toBe(true);
  });

  it('draws him, his punch tell, his arrows buried and up, his knife, fists and kernels, and the MeCloud, without throwing', () => {
    const err = W.eval(`(function(){
      try {
        var base = { type:'boss', name:'Steve Cobs', color:'#f0d010', sprite:'cobs', r:60, x:300, y:300, face:1, hp:100, maxHp:100,
                     _tel:0, _telKind:null, _phase:1, _rage:false, flash:0, homeX:300, attack:'cobs' };
        [{}, { _tel:20, _telKind:'cobs' }, { _tel:12, _cobsPunch:true, _punchDir:1, _punchY:330, _phase:3 },
         { _tel:30, _cobsPunch:true, _punchDir:-1, _punchY:250, face:-1, _phase:3 }, { hp:20, flash:6 }]
          .forEach(function(st){ var s = Object.assign({}, base, st); ctx.save(); drawBossSprite(s); ctx.restore(); });
        [{ cobsTrap:true, delay:12, warn:1, warnX:300, warnY:500, vx:0.01, vy:-17, r:16, color:'#d83a3a' },
         { cobsTrap:true, delay:0, warn:0, warnX:300, warnY:500, y:420, vx:0.01, vy:-17, r:16, color:'#d83a3a' },
         { shape:'meepleknife', vx:-12, vy:6, r:18, color:'#dfe4ea' }, { shape:'cobsfist', vx:14, vy:0, r:20, color:'#e8e8e8' },
         { shape:'kernel', vx:8, vy:0, r:14, color:'#f0d010' }]
          .forEach(function(p){ drawProjectile(Object.assign({ x:300, y:300, owner:-2, ownerObj:{team:-1, idx:-2} }, p)); });
        drawArenaDecor('meeple');
        return BOSS_ARENA_SKY.meeple.length + '/' + [PROJ_SHAPE.meepleknife, PROJ_SHAPE.cobsfist, PROJ_SHAPE.kernel].map(function(q){ return typeof q.draw; }).join(',');
      } catch(e){ return e.message; }
    })()`);
    expect(err).toBe('2/function,function,function');
  });

  it("nothing of his names anyone from the OSC -- no code, no string, no comment", () => {
    const src = W.eval(`[String(cobsBeginTelegraph), String(cobsContraption), String(cobsTrapArrow), String(cobsPunch), String(BOSS_MOVES.knife),
      String(BOSS_MOVES.kernels), String(fireBossAttack), String(updateBossAttack), String(onBossPhaseChange), String(bossTelName),
      String(drawBossSprite), String(drawArenaDecor), String(drawProjectile), String(PROJ_SHAPE.meepleknife.draw), String(PROJ_SHAPE.cobsfist.draw),
      String(PROJ_SHAPE.kernel.draw), BOSS_MOVE_NAME.knife, BOSS_MOVE_NAME.kernels, bossPhaseName({attack:'cobs'}, 2), bossPhaseName({attack:'cobs'}, 3),
      bossTelName({attack:'cobs', _cobsPunch:true}), bossTelName({attack:'cobs'}), BOSS_ROSTER.map(function(b){ return b.name; }).join(',')].join('\\n')`);
    // case-sensitive and whole-word: "addProj" and "dropProj" contain "oj"
    expect(src).not.toMatch(/\bOJ\b|Suitcase|Cabby/);
    // Nothing the Boss-11 kit shows on screen is the "tick tock" chant: on the Theft and Battery page it begins as an OSC member's
    // line during that member's scene, and he only continues it. The trap is named for the contraption now. (The SECRET fight is
    // another matter: the owner picked "Tick, Tock" for it -- round 1, "1 and 2", cobs-decisions.md -- so COBS_MOVE_NAME.ticktock
    // says TICK, TOCK! there, on his own Meeple Watch line from the same transcript; test/cobs-fight.test.js covers it. This
    // check stays about the Boss-11 strings, and about the code never having a cobsTickTock of its own.)
    const said = W.eval(`[BOSS_MOVE_NAME.knife, BOSS_MOVE_NAME.kernels, bossPhaseName({attack:'cobs'}, 2), bossPhaseName({attack:'cobs'}, 3),
      bossTelName({attack:'cobs', _cobsPunch:true}), bossTelName({attack:'cobs'})].join('\\n')`);
    expect(said).not.toMatch(/tick|tock/i);
    expect(W.eval('typeof cobsTickTock'), 'the move is not called that in the code either').toBe('undefined');
    // Beating him "unlocks the winners of each season" -- "3, but only after you beat cobs." (2026-09-29) -- so the three appear
    // in the file inside the blocks marked as his prize (test/dlc-ii-prize.test.js holds them there) and in their credits rows;
    // everything else that is his still never names them.
    let inPrize = false;
    const code = readFileSync('artifacts/V1/index.html', 'utf8').split(/\r?\n/).filter(l => {
      if (/Steve Cobs's prize \(OJ, Suitcase, Cabby\): begin/.test(l)) inPrize = true;
      const skip = inPrize;
      if (/Steve Cobs's prize: end/.test(l)) inPrize = false;
      return !skip;
    });
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8').split(/\r?\n/)
      .filter(l => !/Steve Cobs's prize|\((?:oj|suitcase|cabby|ojshard|casebomb|wrench|file)\.png\)/.test(l));
    const lines = code.concat(credits).filter(l => /Steve Cobs|\bCobs\b|cobs|COBS/.test(l));
    expect(lines.length).toBeGreaterThan(30);
    expect(lines.filter(l => /\bOJ\b|Suitcase|Cabby/.test(l))).toEqual([]);
  });
});

describe('a netcode client sees him', () => {
  it('his arrows, his punch tell and his arena cross the snapshot and draw on the client', () => {
    const { window: w } = loadMonolith();   // the harness with gradients, as test/net-lobby.test.js uses: drawBossBar needs one
    const r = w.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow();
      BOSS_ARENA = 'meeple';
      summons = [{ type:'boss', name:'Steve Cobs', color:'#f0d010', r:88, sprite:'cobs', x:500, y:300, hp:80, maxHp:310, face:1, flash:0,
                   homeX:500, _rage:false, _tel:10, _telKind:'cobs', _bossRush:true, attack:'cobs', _phase:3, _cobsPunch:true, _punchDir:1, _punchY:360 }];
      projectiles = [{ x:420, y:608, vx:0.01, vy:-17, r:16, color:'#d83a3a', owner:-2, ownerObj:{team:-1, idx:-2}, bossAtk:9, life:7, delay:20, warn:1,
                       warnX:420, warnY:590, cobsTrap:true, volley:true },
                     { x:560, y:360, vx:14, vy:0, r:20, color:'#e8e8e8', shape:'cobsfist', owner:-2, ownerObj:{team:-1, idx:-2}, bossAtk:10, life:11 }];
      var snap = JSON.parse(JSON.stringify(serializeState()));
      summons = []; projectiles = []; BOSS_ARENA = null;
      applySnapshot(snap);
      var err = null; try { summons.forEach(drawSummon); projectiles.forEach(drawProjectile); drawBossBar(); drawArenaDecor(BOSS_ARENA); } catch(e){ err = e.message; }
      // Shots now cross as compact rows (s.pj) -- the multiplayer fix -- so read the shots the CLIENT rebuilds.
      return { boss: snap.summons[0], arrow: projectiles[0], fist: projectiles[1], arena: BOSS_ARENA, err: err };
    })()`);
    expect(r.err).toBe(null);
    expect(r.boss).toMatchObject({ _cobsPunch: true, _punchDir: 1, _punchY: 360, sprite: 'cobs', attack: 'cobs', _tel: 10 });
    expect(r.arrow).toMatchObject({ delay: 20, warn: 1, warnY: 590 });
    expect(!!r.arrow.cobsTrap, 'the Contraption flag (1 in the compact row)').toBe(true);
    expect(r.fist).toMatchObject({ shape: 'cobsfist', vx: 14 });
    expect(r.arena, 'a client draws the boss arena now').toBe('meeple');
  });
});
