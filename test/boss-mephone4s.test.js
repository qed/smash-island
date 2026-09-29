import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';
import { loadMonolith } from './helpers/load-monolith.js';

// "mephone should be a boss, alongside 4s, and cobs." MePhone4S -- "The Terminator" on the II wiki, MePhone4's successor
// and Season 1's main antagonist -- is Boss 9 of the gauntlet, after Evil Leafy and before Two. Every attack is his from
// the wiki: the gun he shot MePhone4 with after "Put that cookie down, now!" (4Seeing The Future), the red car he ran
// Cheesy over with after "I'll be back" (Sugar Rush), the poisoned cookie that gave Pickle 4 seconds (4Seeing The
// Future), and the chainsaws and death trap of The Tile Divide. Nobody from the OSC appears in any of it.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// A still Firey on the floor at `x`, in Boss Rush with the gauntlet logic off (BOSSRUSH.active false), and MePhone4S
// spawned the way the gauntlet spawns him. His attack timer is parked unless `live` is set.
const STAGE = (x, live) => `
  SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
  BOSSRUSH = { active:false, bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.name==='MePhone4S'; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), ${x}, groundY()-24, 0);
  f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
  spawnBossRushBoss();
  var b = summons.find(function(s){ return s.type==='boss'; });
  ${live ? '' : 'b._atkTimer = 1e9;'}
  step(); f.pct=0; f.invuln=0;
`;
// A bare MePhone4S for driving his functions directly. `hp` out of 100 sets the phase updateBossAttack works out.
const S = (o = '') => `{ name:'MePhone4S', attack:'mephone4s', x:550, y:groundY()-85, r:85, hp:100, maxHp:100, _phase:1, _atkTimer:1, _tel:0,
  color:'#c8102e', face:1, homeX:550, stationary:false, vx:0, vy:0 ${o ? ',' + o : ''} }`;

describe('MePhone4S joins the gauntlet', () => {
  it('is Boss 9, after Evil Leafy and before Four, with his signature, his second moves and his art', () => {
    const r = W.eval(`(function(){
      var i = BOSS_ROSTER.findIndex(function(b){ return b.name==='MePhone4S'; }), b = BOSS_ROSTER[i];
      var idx = function(n){ return BOSS_ROSTER.findIndex(function(b){ return b.name===n; }); };
      return { i: i, row: b, leafy: idx('Evil Leafy'), mephone: idx('MePhone4'), four: idx('Four'), first: BOSS_ROSTER[0].name,
               extra: BOSS_EXTRA['MePhone4S'], moves: BOSS_EXTRA['MePhone4S'].map(function(k){ return typeof BOSS_MOVES[k] + '/' + BOSS_MOVE_NAME[k]; }) };
    })()`);
    expect(r.row).toEqual({ name: 'MePhone4S', color: '#c8102e', hp: 260, big: 2.5, attack: 'mephone4s', arena: 'studio', stationary: false, sprite: 'mephone4s' });
    expect(r.i, 'Boss 9').toBe(8);
    expect(r.i).toBeGreaterThan(r.leafy);
    expect(r.i, 'after MePhone4, whom he beat').toBeGreaterThan(r.mephone);
    expect(r.i, 'before Four, or he is never reached').toBeLessThan(r.four);
    expect(r.four, 'Four is still last').toBe(W.eval('BOSS_ROSTER.length') - 1);
    expect(r.first).toBe('Announcer');
    expect(r.extra).toEqual(['cookies', 'chainsaws']);
    expect(r.moves).toEqual(['function/POISONED COOKIES!', 'function/CHAINSAWS!']);
  });

  it('every boss before him is exactly as it was: its row, its second moves, its turns, its wind-up and its phases', () => {
    const r = W.eval(`(function(){
      var before = BOSS_ROSTER.slice(0, BOSS_ROSTER.findIndex(function(b){ return b.name==='MePhone4S'; }));
      return before.map(function(b){
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
      ['Announcer', '#3a4a6a', 175, 2.5, 'announcer', 'studio', false, 'announcer', 'rain+ring', 'announcer rain announcer ring', 36, 'Budget Cuts', 'Crusher Arm'],
      ['Puffball Speaker Box', '#c0b0d0', 200, 2.5, 'soundwave', 'studio', false, 'speaker', 'slam+rain', 'soundwave slam soundwave rain', 36, 'Double Speakers', 'Feedback Overload'],
      ['Firey Speaker Box', '#d0402a', 215, 2.5, 'firewall', 'studio', false, 'speakerfirey', 'rain+slam', 'firewall rain firewall slam', 36, 'Flame Surge', 'RAGE MODE'],
      ['The Bug Swarm', '#8a3a3a', 225, 2.3, 'swarm', 'cave', false, 'bug', 'seekers+rain', 'swarm seekers swarm rain', 36, 'Second Wave', 'Swarm Frenzy'],
      ['Purple Face', '#7a3a8a', 235, 2.6, 'swallow', 'warehouse', false, 'face', 'pfaceRap+pfaceTorture+pfaceThanks+pfaceShoes', 'swallow pfaceRap swallow pfaceTorture', 46, 'Running Loops', 'Broken Value'],   // rebuilt (the boss overhaul): test/boss-purple-face.test.js
      ['Purple Dragon', '#6a3a9a', 250, 2.7, 'dragon', 'cave', false, 'dragon', 'slam+rain', 'dragon slam dragon rain', 36, 'Strafing Runs', 'Grab & Carry'],
      // MePhone4's HP is 255 now, was 240 -- the review's retune of him, not a side effect (test/boss-rush-order.test.js)
      ['MePhone4', '#4fb8e8', 255, 2.5, 'mephone', 'melife', true, 'mephone', 'melife+portal', 'mephone melife mephone portal', 36, 'Back and Forth', 'Glitching'],
      ['Evil Leafy', '#123a12', 185, 2.4, 'evilleafy', 'forest', false, 'evilleafy', 'seekers+slam', 'evilleafy seekers evilleafy slam', 45, 'No Refuge', 'Vine Coverage'],
    ]);
  });

  it('walking the gauntlet spawns him ninth, and beating him moves on to Two -- he is not the last boss', () => {
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
            f._cookieT = 120;
            projectiles = [{ owner:-2, fxTag:'cookie', trap:true, x:300, y:400, r:12, life:100 }, { owner:-2, x:0, y:0, r:8, life:50 }];
            var idx0 = BOSSRUSH.bossIdx;
            b.hp = 0; bossRushCheck();
            atHim = { cookieT: f._cookieT, cookiesLeft: projectiles.filter(function(p){ return p.fxTag==='cookie'; }).length,
                      othersLeft: projectiles.length, advanced: BOSSRUSH.bossIdx - idx0, victory: document.getElementById('rushVictory').style.display };
            continue;
          }
          b.hp = 0; bossRushCheck();
        }
        return { order: order, atHim: atHim };
      } finally { setTimeout = st; BOSSRUSH.active=false; running=false; summons=[]; projectiles=[]; }
    })()`);
    // Steve Cobs, the third boss of the same request ("mephone should be a boss, alongside 4s, and cobs"), was Boss 11,
    // between Two and Four; "replace him with springy" (2026-09-28) put Springy there and made Cobs the second secret boss.
    // Nothing before Boss 11 moved.
    expect(r.order).toEqual(['Announcer', 'Puffball Speaker Box', 'Firey Speaker Box', 'The Bug Swarm', 'Purple Face',
      'Purple Dragon', 'MePhone4', 'Evil Leafy', 'MePhone4S', 'Two', 'Springy', 'Four']);
    expect(r.atHim.cookieT, 'nobody collapses after he is gone').toBe(0);
    expect(r.atHim.cookiesLeft, 'his cookies go with him').toBe(0);
    expect(r.atHim.othersLeft, 'nothing else is swept').toBe(1);
    expect(r.atHim.advanced).toBe(1);
    expect(r.atHim.victory).not.toBe('flex');
  });

  it('takes turns: gun, cookies, gun, chainsaws, each named, with a 42-frame wind-up, and names his phases', () => {
    const r = W.eval(`(function(){
      var s = ${S()};
      var kinds = [], names = [];
      for (var i=0;i<4;i++){ s._atkTimer = 1; s._tel = 0; updateBossAttack(s, null); kinds.push(s._telKind); names.push(bossTelName(s)); }
      return { kinds: kinds, names: names, tel: bossTelLen(s), p2: bossPhaseName(s, 2), p3: bossPhaseName(s, 3) };
    })()`);
    expect(r.kinds).toEqual(['mephone4s', 'cookies', 'mephone4s', 'chainsaws']);
    expect(r.names).toEqual(['PUT THAT COOKIE DOWN!', 'POISONED COOKIES!', 'PUT THAT COOKIE DOWN!', 'CHAINSAWS!']);
    expect(r.tel).toBe(42);
    expect(r.p2, 'Sugar Rush').toBe("I'll Be Back");
    expect(r.p3, 'The Tile Divide').toBe('Super Death Trap');
  });

  it('his phases change as his HP falls, and each is announced', () => {
    const r = W.eval(`(function(){ ${STAGE(800)}
      var out = { p1: b._phase, hp: b.maxHp };
      b.hp = b.maxHp*0.5; updateBossAttack(b, f); out.p2 = b._phase; out.b2 = document.getElementById('banner').textContent;
      b.hp = b.maxHp*0.2; updateBossAttack(b, f); out.p3 = b._phase; out.b3 = document.getElementById('banner').textContent;
      summons = []; return out;
    })()`);
    expect(r.hp, '260 for one fighter').toBe(260);
    expect([r.p1, r.p2, r.p3]).toEqual([1, 2, 3]);
    expect(r.b2).toMatch(/PHASE 2: I'll Be Back/);
    expect(r.b3).toMatch(/PHASE 3: Super Death Trap/);
  });

  it('left to fight, he shoots, drops cookies and throws chainsaws; from phase 2 his car comes', () => {
    const r = W.eval(`(function(){ ${STAGE(820, true)}
      var seen = { bullet:0, cookie:0, saw:0, car:0 }, AP = addProj;
      addProj = function(p){ if (p && p.owner===-2){
        if (p.beamShot) seen.bullet++; else if (p.shape==='cookie') seen.cookie++; else if (p.shape==='saw') seen.saw++; else if (p.shape==='redcar') seen.car++; }
        return AP(p); };
      try {
        for (var i=0;i<600;i++){ step(); f.x = 820; f.vx = 0; f.pct = 0; }
        var p1 = Object.assign({}, seen);
        b.hp = b.maxHp*0.5;
        for (var j=0;j<700;j++){ step(); f.x = 820; f.vx = 0; f.pct = 0; }
        return { p1: p1, all: seen, phase: b._phase };
      } finally { addProj = AP; summons = []; projectiles = []; }
    })()`);
    expect(r.p1.bullet, 'the gun fires').toBeGreaterThan(0);
    expect(r.p1.cookie, 'five cookies a volley').toBeGreaterThanOrEqual(5);
    expect(r.p1.saw, 'three chainsaws a volley').toBeGreaterThanOrEqual(3);
    expect(r.p1.car, 'no car in phase 1').toBe(0);
    expect(r.phase).toBe(2);
    expect(r.all.car, 'the car in phase 2').toBeGreaterThan(0);
  });
});

describe('the gun: PUT THAT COOKIE DOWN, NOW!', () => {
  it('fires one round, then a fan of two, then three, each a whole boss hit sharing one attack id', () => {
    const r = W.eval(`(function(){ var out = [];
      for (var ph=1; ph<=3; ph++){ projectiles = [];
        var s = ${S('_phase:ph, _s4Gun:true, _s4Car:false, _aimX:900, _aimY:groundY()-100')};
        fireBossAttack(s, null);
        var b = projectiles.filter(function(p){ return p.owner===-2; });
        out.push({ n: b.length, spd: b.map(function(p){ return Math.hypot(p.vx, p.vy); }), dmg: b.map(function(p){ return p.dmg; }),
          streak: b.every(function(p){ return p.beamShot && p.breaksOnSurface; }), ids: b.map(function(p){ return p.bossAtk; }).filter(function(v, i, a){ return a.indexOf(v)===i; }).length,
          delays: b.map(function(p){ return p.delay||0; }), cars: b.filter(function(p){ return p.shape==='redcar'; }).length,
          spikes: b.filter(function(p){ return p.shape==='spike'; }).length });
      }
      projectiles = []; return { out: out, full: bossDmg() };
    })()`);
    expect(r.out.map(o => o.n)).toEqual([1, 2, 3]);
    for (const o of r.out) {
      for (const v of o.spd) expect(v).toBeCloseTo(18, 2);
      for (const d of o.dmg) expect(d).toBe(r.full);
      expect(o.streak).toBe(true);
      expect(o.ids, 'one attack id per volley').toBe(1);
      expect(o.cars + o.spikes, 'a gun turn is only the gun').toBe(0);
    }
    expect(r.out[2].delays).toEqual([0, 5, 10]);
  });

  // S4.lock is 18, was 14: backing off from anyone who walks up (the review's fix) made him press harder, and more time
  // on a locked sight is the fairest give-back (where he sits: test/boss-rush-order.test.js).
  it('the sight follows its mark for 24 frames, locks for the last 18, and the shot goes where it locked', () => {
    expect(W.eval('S4.lock')).toBe(18);
    const r = W.eval(`(function(){ ${STAGE(820)}
      b._atkTimer = 1; step();
      var out = { kind: b._telKind, tel: b._tel, follow: true, held: true, lockedLate: true, lockedEarly: false, shot: null };
      var AP = addProj; addProj = function(p){ if (p && p.owner===-2 && p.beamShot && !out.shot) out.shot = { x:p.x, y:p.y, vx:p.vx, vy:p.vy }; return AP(p); };
      try {
        for (var i=0;i<24;i++){ f.x = 820 + (i+1)*4; f.vx = 0; step();
          if (b._aimX !== f.x) out.follow = false; if (b._aimLock) out.lockedEarly = true; }
        var lx = b._aimX, ly = b._aimY;
        for (var j=0;j<18;j++){ f.x = 700 - j*6; f.vx = 0; step();
          if (b._aimX !== lx || b._aimY !== ly) out.held = false; if (!b._aimLock) out.lockedLate = false; }
        out.lx = lx; out.ly = ly;
      } finally { addProj = AP; }
      summons = []; projectiles = []; return out;
    })()`);
    expect(r.kind).toBe('mephone4s');
    expect(r.tel).toBe(42);
    expect(r.follow, 'it follows you while it is red').toBe(true);
    expect(r.lockedEarly).toBe(false);
    expect(r.held, 'then it stays where it locked').toBe(true);
    expect(r.lockedLate).toBe(true);
    expect(r.shot, 'and it fires on the last frame').not.toBe(null);
    expect(Math.atan2(r.shot.vy, r.shot.vx)).toBeCloseTo(Math.atan2(r.ly - r.shot.y, r.lx - r.shot.x), 6);
  });

  it('he stops walking to aim, and keeps his distance otherwise', () => {
    const r = W.eval(`(function(){
      var tgt = { x:0, y:groundY()-24, dead:false, idx:0 };
      var mk = function(dx){ var s = ${S('_atkTimer:1e9')}; tgt.x = s.x + dx; updateBossAttack(s, tgt); return s.vx; };
      var aim = ${S('_atkTimer:1e9, _s4Gun:true, _tel:20, vx:4, _aimIdx:-1, _aimX:900, _aimY:300')};
      tgt.x = aim.x + 400; updateBossAttack(aim, tgt);
      return { near: mk(150), far: mk(300), aiming: aim.vx };
    })()`);
    expect(r.near, 'inside 180 px he does not come closer').toBe(0);
    expect(r.far).toBeGreaterThan(0);
    expect(r.aiming, 'halved every frame of the wind-up, never pushed').toBe(2);
  });

  // The review: "MePhone4S never backs away ... a melee player can walk right up to him." Inside S4.backoff he steps back.
  it('he backs off from anyone who walks up to him, and holds between S4.backoff and S4.standoff', () => {
    const r = W.eval(`(function(){
      var tgt = { x:0, y:groundY()-24, dead:false, idx:0 };
      var mk = function(dx){ var s = ${S('_atkTimer:1e9')}; tgt.x = s.x + dx; updateBossAttack(s, tgt); return s.vx; };
      var walk = ${S('_atkTimer:1e9')}, x0 = walk.x;
      for (var i=0;i<60;i++){ tgt.x = x0 + 60; updateBossAttack(walk, tgt); walk.x += walk.vx; walk.vx *= 0.9; }   // his body's own step (updateSummons)
      return { close: mk(80), closeLeft: mk(-80), hold: mk(150), backoff: S4.backoff, standoff: S4.standoff, gap: Math.abs(walk.x - (x0 + 60)) };
    })()`);
    expect(r.close, 'someone 80 px to his right: he steps left').toBeLessThan(0);
    expect(r.closeLeft, 'and the other way round').toBeGreaterThan(0);
    expect(r.hold, 'between the two he holds').toBe(0);
    expect(r.backoff).toBeLessThan(r.standoff);
    expect(r.gap, 'walked up to, he ends up out at his backoff distance').toBeGreaterThanOrEqual(r.backoff - 10);
  });

  it('from phase 2 he draws on whoever ate a cookie; in phase 1 on whoever is nearest', () => {
    const r = W.eval(`(function(){
      var near = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 700, groundY()-24, 0);
      var far = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 1000, groundY()-24, 1);
      near.team = far.team = 0; fighters = [near, far]; far._cookieT = 100;
      var out = {};
      [1, 2].forEach(function(ph){ var s = ${S('_phase:ph, _moveN:1, _telKind:"mephone4s"')}; s4BeginTelegraph(s, near); out['p'+ph] = s._aimIdx; });
      far._cookieT = 0; return { out: out, near: near.idx, far: far.idx };
    })()`);
    expect(r.out.p1).toBe(r.near);
    expect(r.out.p2, '"PUT THAT COOKIE DOWN, NOW!"').toBe(r.far);
  });
});

describe("the car: I'LL BE BACK", () => {
  it('never comes in phase 1; from phase 2 it is the signature turn after the cookies, named before it drives', () => {
    const r = W.eval(`(function(){
      var tgt = { x:900, y:groundY()-24, dead:false, idx:0 };
      var run = function(hp){ var s = ${S('_atkTimer:1')}; s.hp = hp; s._phase = hp > 66 ? 1 : (hp > 33 ? 2 : 3); var out = [];
        for (var i=0;i<12;i++){ s._atkTimer = 1; s._tel = 0; updateBossAttack(s, tgt);
          out.push(s._telKind === 'mephone4s' ? (s._s4Car ? 'car:' : 'gun:') + bossTelName(s) : s._telKind); }
        return out; };
      return { p1: run(100), p2: run(50) };
    })()`);
    expect(r.p1.filter(k => k.startsWith('car')), 'six signature turns, no car').toEqual([]);
    expect(r.p2.slice(0, 8)).toEqual(['gun:PUT THAT COOKIE DOWN!', 'cookies', "car:I'LL BE BACK!", 'chainsaws',
      'gun:PUT THAT COOKIE DOWN!', 'cookies', "car:I'LL BE BACK!", 'chainsaws']);
  });

  // The review: MePhone4 and MePhone4S read the phase when the attack fired, not when its wind-up started, so an "I'LL BE
  // BACK!" drawn in phase 2 could fire with phase 3's second car and spikes if a hit crossed the threshold mid-wind-up.
  it('a car drawn in phase 2 is one car and no spikes, and a gun drawn in phase 1 is one round, even if phase 3 starts during the wind-up', () => {
    const r = W.eval(`(function(){ var out = {};
      ['car', 'gun'].forEach(function(which){
        ${STAGE(800)}
        worldPlats = [{ x:300, y:400, w:300, h:16 }];
        if (which === 'car'){ b.hp = b.maxHp*0.5; updateBossAttack(b, f); b._moveN = 2; }
        b._atkTimer = 1; step();
        var drawn = { phase: b._telPh, car: b._s4Car, name: document.getElementById('banner').textContent };
        var seen = { car:0, spike:0, round:0 }, AP = addProj;
        addProj = function(p){ if (p && p.shape==='redcar') seen.car++; if (p && p.shape==='spike') seen.spike++; if (p && p.beamShot) seen.round++; return AP(p); };
        try {
          b.hp = b.maxHp*0.2;
          for (var i=0;i<46;i++){ step(); f.x = 800; f.vx = 0; }
          out[which] = { drawn: drawn, phase: b._phase, seen: seen };
        } finally { addProj = AP; summons = []; projectiles = []; worldPlats = []; }
      });
      return out;
    })()`);
    expect(r.car.drawn).toEqual({ phase: 2, car: true, name: "I'LL BE BACK!" });
    expect(r.car.phase).toBe(3);
    expect(r.car.seen, 'one car, as drawn: no second car and no spikes nobody was warned of').toEqual({ car: 1, spike: 0, round: 0 });
    expect(r.gun.drawn).toMatchObject({ phase: 1, car: false, name: 'PUT THAT COOKIE DOWN!' });
    expect(r.gun.phase).toBe(3);
    expect(r.gun.seen.round, "phase 1's one round").toBe(1);
  });

  it('revs at the edge farther from you, then drives the whole floor -- even on a 1920 px screen', () => {
    const r = W.eval(`(function(){ var WW0 = WW, out = {};
      try {
        [1100, 1920].forEach(function(w){ WW = w; projectiles = [];
          var s = ${S('_phase:2, _s4Car:true')}; s.x = WW*0.5;
          fireBossAttack(s, { x: WW*0.8, y: groundY()-24 });
          var c = projectiles.filter(function(p){ return p.shape==='redcar'; });
          out[w] = c.map(function(p){ return { x:p.x, vx:p.vx, r:p.r, dmg:p.dmg, kb:p.kb, pierce:!!p.pierce, delay:p.delay, reach: p.x + p.life*p.vx }; });
        });
        projectiles = [];
        var s2 = ${S('_phase:2, _s4Car:true')}; WW = 1100; s2.x = 550; fireBossAttack(s2, { x: 200, y: groundY()-24 });
        out.left = projectiles.filter(function(p){ return p.shape==='redcar'; }).map(function(p){ return { x:p.x, vx:p.vx }; });
      } finally { WW = WW0; projectiles = []; }
      return { out: out, full: bossDmg() };
    })()`);
    const [c] = r.out[1100];
    expect(r.out[1100]).toHaveLength(1);
    expect(c).toMatchObject({ x: 40, vx: 14, r: 26, dmg: r.full, kb: 11, pierce: true, delay: 30 });
    expect(r.out[1920][0].reach, 'reaches the far wall at 1920 px').toBeGreaterThanOrEqual(1920 - 60);
    expect(r.out.left).toEqual([{ x: 1100 - 40, vx: -14 }]);
  });

  it('runs over each fighter once', () => {
    const r = W.eval(`(function(){ ${STAGE('WW*0.8')}
      f.x = WW*0.8; var s = ${S('_phase:2, _s4Car:true')}; s.x = WW*0.5;
      fireBossAttack(s, f);
      var hits = 0, last = 0;
      for (var i=0;i<140 && projectiles.some(function(p){ return p.shape==='redcar' && p.life>0; });i++){
        step(); if (f.pct > last + 1e-9){ hits++; last = f.pct; } f.invuln = 0; f.x = WW*0.8; f.y = groundY()-24; f.vx = 0; f.vy = 0;
      }
      var out = { hits: hits, dmg: f.pct, full: bossDmg() }; summons = []; projectiles = []; return out;
    })()`);
    expect(r.hits).toBe(1);
    expect(r.dmg).toBeLessThanOrEqual(r.full + 1e-6);
  });

  it('phase 3: a second car from the other edge 50 frames later, and every platform turns to spikes on the same turn', () => {
    const r = W.eval(`(function(){ var WP = worldPlats; projectiles = [];
      worldPlats = [{ x:300, y:400, w:462, h:16 }, { x:820, y:300, w:200, h:16 }];
      try {
        var s = ${S('_phase:3, _s4Car:true')}; fireBossAttack(s, { x: 900, y: groundY()-24 });
        var cars = projectiles.filter(function(p){ return p.shape==='redcar'; }), spikes = projectiles.filter(function(p){ return p.shape==='spike'; });
        var want = 0; worldPlats.forEach(function(p){ for (var x = p.x + 18; x < p.x + p.w - 10; x += S4.spikeGap) want++; });
        return { cars: cars.map(function(p){ return [Math.sign(p.vx), p.delay]; }), n: spikes.length, want: want,
          spike: spikes.every(function(p){ return p.delay===40 && p.warn===40 && p.vy < 0; }),
          away: spikes.every(function(p){ var q = worldPlats.find(function(w){ return p.x >= w.x && p.x <= w.x + w.w; }); return Math.sign(p.vx) === (p.x < q.x + q.w/2 ? -1 : 1); }),
          ids: projectiles.map(function(p){ return p.bossAtk; }).filter(function(v, i, a){ return a.indexOf(v)===i; }).length };
      } finally { worldPlats = WP; projectiles = []; }
    })()`);
    expect(r.cars).toEqual([[1, 30], [-1, 80]]);
    expect(r.n).toBe(r.want);
    expect(r.n).toBeGreaterThan(0);
    expect(r.spike, 'a 40-frame shadow, then they jump up').toBe(true);
    expect(r.away, 'each leans away from its platform\'s middle, so it does not always knock you right').toBe(true);
    expect(r.ids, 'the whole turn is one boss hit').toBe(1);
  });
});

describe('the poisoned cookies', () => {
  it('drops five with shadows, kept off the walls, that settle as traps', () => {
    // xs are where the cookies come down: their shadows (warnX). A cookie also started there until the owner's "add momentum
    // to falling objects(they should move horizontaly while falling)" -- "everything. bosses, characters, whatever." -- "The
    // way it was thrown" (2026-09-29): now it starts back along its drift and lands on its shadow (FALL_DRIFT; boss-kit.test.js).
    const r = W.eval(`(function(){ var out = {};
      [600, 0].forEach(function(tx){ projectiles = [];
        var s = ${S('_telX:tx')}; BOSS_MOVES.cookies(s, null);
        var c = projectiles.filter(function(p){ return p.owner===-2; });
        out[tx] = { n: c.length, xs: c.map(function(p){ return p.warnX; }),
          ok: c.every(function(p){ return p.shape==='cookie' && p.fxTag==='cookie' && p.fxN===240 && p.landsTrap && p._mine && p.volley && p.warn > 0; }),
          ids: c.map(function(p){ return p.bossAtk; }).filter(function(v, i, a){ return a.indexOf(v)===i; }).length };
      });
      projectiles = []; return out;
    })()`);
    expect(r[600].n).toBe(5);
    expect(r[600].ok).toBe(true);
    expect(r[600].ids).toBe(1);
    expect(r[600].xs).toEqual([420, 510, 600, 690, 780]);
    expect(Math.min(...r[0].xs), 'none stacked against the wall').toBeGreaterThanOrEqual(40);
    expect(new Set(r[0].xs).size).toBe(5);
  });

  it('a cookie gives four seconds and a short poison; a second restarts neither; then you collapse on the spot', () => {
    const r = W.eval(`(function(){ ${STAGE(700)}
      summons = []; f.pct = 0;
      SM_FX.cookie(f, null, 240);
      var out = { cookieT: f._cookieT, poison: f._poisonT, burn: f.burn };
      for (var i=0;i<100;i++) step();
      var burnBefore = f.burn; SM_FX.cookie(f, null, 240); out.after2nd = f._cookieT; out.burnKept = f.burn === burnBefore;
      var at = -1;
      for (var j=0;j<200;j++){ step(); if (!(f._cookieT > 0)){ at = j; out.hitstun = f.hitstun; out.stunFx = f._stunFx; out.vy = f.vy; break; } }
      out.at = 100 + at + 1; out.pct = f.pct; projectiles = []; return out;
    })()`);
    expect(r.cookieT).toBe(240);
    expect(r.poison, 'the fire bosses\' 110 frames, no more').toBe(110);
    expect(r.burn).toBe(110);
    expect(r.after2nd, 'the timer never restarts').toBe(140);
    // and neither does the poison: every cookie eaten used to top it up, which with the chainsaws' bleed made damage over
    // time a big share of what he dealt, outside the per-hit cap (the review)
    expect(r.burnKept, 'a second cookie does not top the poison up').toBe(true);
    expect(r.at, 'four seconds').toBe(240);
    expect(r.hitstun).toBeGreaterThan(0);
    expect(r.stunFx).toBeGreaterThan(0);
    expect(r.vy, 'a collapse, not a hop').toBeGreaterThanOrEqual(0);
    expect(r.pct, 'one short poison, about 4.4%, and nothing else').toBeLessThan(5);
  });

  it('a respawn clears it, even with a frame to go', () => {
    const r = W.eval(`(function(){ ${STAGE(700)}
      summons = []; f._cookieT = 1; f.burn = 50; f._poisonT = 50;
      eliminate(f);
      var cleared = f._cookieT;
      for (var i=0;i<5;i++) step();
      var out = { cleared: cleared, stun: f._stunFx || 0, stocks: f.stocks }; projectiles = []; return out;
    })()`);
    expect(r.cleared).toBe(0);
    expect(r.stun, 'no collapse on respawn').toBe(0);
  });

  it('one volley is one boss hit, even eaten across his next attack; a fighter trap lands as it always did', () => {
    const r = W.eval(`(function(){ ${STAGE(700)}
      summons = [];
      var id = ++BOSS_ATK_ID, taken = 0, hits = 0;
      for (var k=0;k<5;k++){
        projectiles.push({ owner:-2, ownerObj:{team:-1, idx:-2}, trap:true, arm:0, x:f.x, y:f.y, r:30, dmg:bossDmg()*0.3, kb:4, life:150,
          color:'#c8904a', shape:'cookie', _mine:true, bossAtk:id, volley:true, fxTag:'cookie', fxN:240 });
        f.burn = 0; f._poisonT = 0;                        // the poison is not the cookie's hit: keep it out of the count
        var p0 = f.pct; step(); if (f.pct > p0 + 0.05) hits++; taken += f.pct - p0;
        // another boss attack lands between the cookies: the old one-id memory forgot the volley right here
        applyHit(f, 0, 0, 0, null, { bossAtk: ++BOSS_ATK_ID });
        f.invuln = 0; f.x = 700; f.y = groundY()-24; f.vx = 0; f.vy = 0; f.hitstun = 0;
      }
      var eaten = projectiles.filter(function(p){ return p.shape==='cookie' && p.life>0; }).length;
      // a fighter's own trap (Naily's spike, as laid by her special): damage x TRAP_DMG_MULT, uncapped, as before
      var g = makeFighter(ROSTER.find(function(r){ return r.name==='Naily'; }), 300, groundY()-24, 1); g.team = 1; g.controller='still';
      fighters = [f, g]; f.pct = 0; f.burn = 0; f._poisonT = 0; f._cookieT = 0; f.invuln = 0; projectiles = [];
      projectiles.push({ owner:g.idx, ownerObj:g, trap:true, arm:0, x:f.x, y:f.y, r:30, dmg:6, kb:5, life:220, color:'#c0c0c0', noFall:true });
      step(); var trapDmg = f.pct;
      projectiles = []; return { taken: taken, hits: hits, left: eaten, full: bossDmg(), trapDmg: trapDmg, mult: TRAP_DMG_MULT };
    })()`);
    expect(r.left, 'all five were stepped on and eaten').toBe(0);
    expect(r.hits, 'four land before the volley is spent').toBe(4);
    expect(r.taken, 'five cookies would be 33 uncapped').toBeLessThanOrEqual(r.full + 5 * 0.04 + 1e-6);
    expect(r.taken).toBeGreaterThan(r.full - 1e-6);
    expect(r.trapDmg).toBe(Math.round(6 * r.mult));
  });
});

describe('his warnings stay up', () => {
  // The review's probe: the cookie's "POISONED! 4 SECONDS" popup replaced "I'LL BE BACK!" two frames into the car's
  // 42-frame wind-up -- and the car is always the turn after the cookies, while they still lie on the floor. The popups
  // are gone ("remove item popups"), and banner() drops any popup while a boss warning is up.
  it("eating a cookie, or collapsing, during the car's wind-up leaves I'LL BE BACK! on screen", () => {
    const r = W.eval(`(function(){ ${STAGE(700)}
      f.you = true;
      b.hp = b.maxHp*0.5; updateBossAttack(b, f); b._moveN = 2;
      b._atkTimer = 1; step();
      var name = document.getElementById('banner').textContent;
      projectiles.push({ owner:-2, ownerObj:{team:-1, idx:-2}, trap:true, arm:0, x:f.x, y:f.y, r:30, dmg:bossDmg()*0.3, kb:4, life:150,
        color:'#c8904a', shape:'cookie', _mine:true, bossAtk:++BOSS_ATK_ID, volley:true, fxTag:'cookie', fxN:240 });
      step(); var ate = f._cookieT > 0, afterCookie = document.getElementById('banner').textContent;
      f._cookieT = 1; step(); var afterCollapse = document.getElementById('banner').textContent;
      f.you = false; summons = []; projectiles = [];
      return { name: name, ate: ate, afterCookie: afterCookie, afterCollapse: afterCollapse };
    })()`);
    expect(r.name).toBe("I'LL BE BACK!");
    expect(r.ate, 'the cookie was eaten').toBe(true);
    expect(r.afterCookie).toBe("I'LL BE BACK!");
    expect(r.afterCollapse).toBe("I'LL BE BACK!");
    const src = W.eval('String(SM_FX.cookie) + String(step)');
    expect(src, 'no poison or collapse popup at all').not.toMatch(/POISONED|COLLAPSED/);
  });
});

describe('the chainsaws', () => {
  it('throws three bleeding saws on and around where you stood, each landing, hopping once more and stopping', () => {
    const r = W.eval(`(function(){ ${STAGE('WW-60')}
      summons = []; f.x = WW-60;
      var s = ${S('_telX:500')}; s.x = 500; s.y = groundY()-85;
      BOSS_MOVES.chainsaws(s, null);
      var saws = projectiles.filter(function(p){ return p.owner===-2; });
      var out = { n: saws.length, ok: saws.every(function(p){ return p.shape==='saw' && p.bounce && p.maxBounces===2 && p.fxTag==='bleed' && p.fxN===60; }),
        ids: saws.map(function(p){ return p.bossAtk; }).filter(function(v, i, a){ return a.indexOf(v)===i; }).length,
        vx: saws.map(function(p){ return Math.round(p.vx*100)/100; }) };
      for (var i=0;i<300 && saws.some(function(p){ return p.life>0; });i++){ step(); f.x = WW-60; }
      out.bounces = saws.map(function(p){ return p.bounces||0; }); out.gone = saws.every(function(p){ return p.life<=0; });
      projectiles = []; return out;
    })()`);
    expect(r.n).toBe(3);
    expect(r.ok).toBe(true);
    expect(r.ids).toBe(1);
    expect(r.vx).toEqual([-1.67, 0, 1.67]);
    expect(r.gone).toBe(true);
    expect(r.bounces, 'each expired on its second landing').toEqual([2, 2, 2]);
  });
});

describe('the item version', () => {
  it('an item MePhone4S never throws cookies or chainsaws; an item Announcer still throws its second moves', () => {
    const r = W.eval(`(function(){
      var run = function(name){ var s = { type:'boss', name:name, color:'#fff', x:550, y:300, r:70, hp:200, vx:0, vy:0, face:1, _atkTimer:1, _tel:0 };
        var out = []; for (var i=0;i<4;i++){ s._atkTimer = 1; s._tel = 0; updateBossAttack(s, null); out.push(String(s._telKind)); } return out; };
      return { s4: run('MePhone4S'), ann: run('Announcer') };
    })()`);
    expect(r.s4).toEqual(['undefined', 'undefined', 'undefined', 'undefined']);
    expect(r.ann).toEqual(['undefined', 'rain', 'undefined', 'ring']);
  });
});

describe('what the player sees', () => {
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

  it('draws him, his sight (following and locked), his car, cookies and bullets, without throwing', () => {
    const err = W.eval(`(function(){
      try {
        var base = { type:'boss', name:'MePhone4S', color:'#c8102e', sprite:'mephone4s', r:60, x:100, y:100, face:1, hp:100, maxHp:100,
                     _tel:0, _telKind:null, _phase:1, _rage:false, flash:0, homeX:100, attack:'mephone4s' };
        var states = [{}, { _tel:30, _aimX:400, _aimY:120, _aimLock:false }, { _tel:8, _aimX:-300, _aimY:300, _aimLock:true, face:-1 },
                      { _tel:20 }, { hp:50, flash:6 }, { _tel:10, _aimX:100, _aimY:100 }];
        states.forEach(function(st){ var s = Object.assign({}, base, st); ctx.save(); drawBossSprite(s); ctx.restore(); });
        [{ shape:'redcar', vx:14, vy:0, r:26, color:'#d01818' }, { shape:'redcar', vx:-14, vy:0, r:26, color:'#d01818' },
         { shape:'cookie', vx:0, vy:4, r:12, color:'#c8904a', warn:10, warnX:300, warnY:500 }, { shape:'cookie', vx:0, vy:0, r:12, color:'#c8904a', trap:true },
         { beamShot:true, vx:18, vy:-2, r:8, color:'#ff3a2a' }, { shape:'spike', vx:0.6, vy:-7, r:10, color:'#c8c8d0' }, { shape:'saw', vx:2, vy:-3, r:14, color:'#b8c0c8' }]
          .forEach(function(p){ drawProjectile(Object.assign({ x:300, y:300, owner:-2, ownerObj:{team:-1, idx:-2} }, p)); });
        return typeof PROJ_SHAPE.cookie.draw + '/' + typeof PROJ_SHAPE.redcar.draw;
      } catch(e){ return e.message; }
    })()`);
    expect(err).toBe('function/function');
  });

  it("nothing of his names anyone from the OSC -- no code, no string, no comment", () => {
    const src = W.eval(`[String(s4BeginTelegraph), String(s4TrackSight), String(s4DeathTrap), String(BOSS_MOVES.cookies), String(BOSS_MOVES.chainsaws),
      String(fireBossAttack), String(SM_FX.cookie), String(bossTelName), String(drawBossSprite), String(PROJ_SHAPE.cookie.draw), String(PROJ_SHAPE.redcar.draw),
      BOSS_MOVE_NAME.cookies, BOSS_MOVE_NAME.chainsaws, bossPhaseName({attack:'mephone4s'}, 2), bossPhaseName({attack:'mephone4s'}, 3),
      bossTelName({attack:'mephone4s', _s4Car:true}), bossTelName({attack:'mephone4s'})].join('\\n')`);
    expect(src).not.toMatch(/\bOJ\b|Suitcase|Cabby/);
    // and every line of the game or the credits that is about him
    const lines = [readFileSync('artifacts/V1/index.html', 'utf8'), readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8')]
      .join('\n').split('\n').filter(l => /MePhone4S|mephone4s|\bS4\b|s4[A-Z]/.test(l));
    expect(lines.length).toBeGreaterThan(20);
    expect(lines.filter(l => /\bOJ\b|Suitcase|Cabby/.test(l))).toEqual([]);
  });
});

describe('a netcode client sees him', () => {
  it('his sight, his car, his cookies and his bullets cross the snapshot and draw on the client', () => {
    const { window: w } = loadMonolith();   // the harness with gradients, as test/net-lobby.test.js uses: drawBossBar needs one
    const r = w.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow();
      summons = [{ type:'boss', name:'MePhone4S', color:'#c8102e', r:85, sprite:'mephone4s', x:500, y:300, hp:80, maxHp:120, face:1, flash:0,
                   homeX:500, _rage:false, _tel:10, _telKind:'mephone4s', _bossRush:true, attack:'mephone4s', _aimX:800, _aimY:420, _aimLock:true }];
      projectiles = [{ x:40, y:600, vx:14, vy:0, r:26, color:'#d01818', shape:'redcar', owner:-2, ownerObj:{team:-1, idx:-2}, bossAtk:9, life:80, delay:12 },
                     { x:300, y:200, vx:0, vy:4, r:12, color:'#c8904a', shape:'cookie', owner:-2, ownerObj:{team:-1, idx:-2}, bossAtk:10, life:80, warn:9, warnX:300, warnY:640 },
                     { x:560, y:290, vx:17.6, vy:2.4, r:8, color:'#ff3a2a', beamShot:true, owner:-2, ownerObj:{team:-1, idx:-2}, bossAtk:11, life:80 }];
      var snap = JSON.parse(JSON.stringify(serializeState()));
      summons = []; projectiles = [];
      applySnapshot(snap);
      var err = null; try { summons.forEach(drawSummon); projectiles.forEach(drawProjectile); drawBossBar(); } catch(e){ err = e.message; }
      // Shots now cross as compact rows (s.pj) -- the multiplayer fix -- so read the shots the CLIENT rebuilds.
      return { boss: snap.summons[0], car: projectiles[0], cookie: projectiles[1], bullet: projectiles[2], err: err,
               telLen: bossTelLen(summons[0]) };
    })()`);
    expect(r.err).toBe(null);
    expect(r.boss).toMatchObject({ _aimX: 800, _aimY: 420, _aimLock: true, sprite: 'mephone4s', attack: 'mephone4s' });
    expect(r.telLen, "the client's wind-up ring runs over his 42 frames, not the default 36").toBe(42);
    expect(r.car).toMatchObject({ shape: 'redcar', vx: 14, vy: 0 });
    expect(r.cookie).toMatchObject({ shape: 'cookie', warn: 9 });
    expect(r.bullet).toMatchObject({ vx: 17.6, vy: 2.4 });
    expect(!!r.bullet.beamShot, 'a streak (flagged 1 in the compact row)').toBe(true);
  });
});
