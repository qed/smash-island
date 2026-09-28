import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { bootMonolith } from './helpers/smash-golden.js';
import { loadMonolith } from './helpers/load-monolith.js';

// "mephone should be a boss, alongside 4s, and cobs. mephone should spawn hostile assist trophies." MePhone4 is Boss 7 of
// the gauntlet, between the Purple Dragon and Evil Leafy. Everything he throws is a host power the II wiki gives him: the
// Fist Thingy, the Rejection Portal (opened with a finger snap; on the show it flings people in, it does not pull -- here it
// hits whoever touches it and knocks them away, since the game has nowhere to send them), and MeLife, which
// here downloads assist trophies from the existing roster that fight on HIS side, capped, on a cadence, and gone when he
// falls. Assists take their summoner's team, so his are summoned by a proxy owner on the boss's team, -1.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// A still Firey on the floor at `x`, in Boss Rush with the gauntlet logic off (BOSSRUSH.active false), and MePhone4
// spawned the way the gauntlet spawns him. His attack timer is parked unless `live` is set.
const STAGE = (x, live) => `
  SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
  BOSSRUSH = { active:false, bossIdx:6, cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), ${x}, groundY()-24, 0);
  f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
  spawnBossRushBoss();
  var b = summons.find(function(s){ return s.type==='boss'; });
  ${live ? '' : 'b._atkTimer = 1e9;'}
  step(); f.pct=0; f.invuln=0;
`;
// meLifeDownload picks from MEPHONE_POOL at random; a fixed roll picks a known one.
const PICK = { '8-Ball': 0, 'Pie': 0.3, 'Beach Ball': 0.55, 'Spongy': 0.8 };
const download = (name, side) => `(function(){ var R = Math.random; Math.random = function(){ return ${PICK[name]}; };
  try { return meLifeDownload(b, ${side}); } finally { Math.random = R; } })()`;

describe('MePhone4 joins the gauntlet', () => {
  // The roster pins below were written when he made it ten. The same request -- "mephone should be a boss, alongside 4s,
  // and cobs" -- then put MePhone4S in as Boss 9, after Evil Leafy, and Steve Cobs in as Boss 11, after Two, so their rows
  // are in them now; nothing else moved.
  it('is Boss 7, before Four, and the bosses around him are exactly as they were', () => {
    const r = W.eval(`(function(){
      var rows = BOSS_ROSTER.map(function(b){ return [b.name, b.color, b.hp, b.big, b.attack, b.arena, b.stationary, b.sprite]; });
      var extra = {}; BOSS_ROSTER.forEach(function(b){ extra[b.name] = BOSS_EXTRA[b.name]; });
      return { rows: rows, extra: extra };
    })()`);
    expect(r.rows).toEqual([
      ['Announcer', '#3a4a6a', 175, 2.5, 'announcer', 'studio', false, 'announcer'],
      ['Puffball Speaker Box', '#c0b0d0', 200, 2.5, 'soundwave', 'studio', false, 'speaker'],
      ['Firey Speaker Box', '#d0402a', 215, 2.5, 'firewall', 'studio', false, 'speakerfirey'],
      ['The Bug Swarm', '#8a3a3a', 225, 2.3, 'swarm', 'cave', false, 'bug'],
      ['Purple Face', '#7a3a8a', 235, 2.6, 'swallow', 'studio', true, 'face'],
      ['Purple Dragon', '#6a3a9a', 250, 2.7, 'dragon', 'cave', false, 'dragon'],
      // 255, was 240: under the Dragon's 250 before him, and measured easier than the Dragon (the review; see
      // test/boss-rush-order.test.js)
      ['MePhone4', '#4fb8e8', 255, 2.5, 'mephone', 'melife', true, 'mephone'],
      ['Evil Leafy', '#123a12', 185, 2.4, 'evilleafy', 'forest', false, 'evilleafy'],
      ['MePhone4S', '#c8102e', 260, 2.5, 'mephone4s', 'studio', false, 'mephone4s'],
      ['Two', '#c8a020', 285, 2.6, 'two', 'void', false, 'two'],
      ['Steve Cobs', '#f0d010', 330, 2.6, 'cobs', 'meeple', true, 'cobs'],
      ['Four', '#3a6ad0', 340, 2.8, 'four', 'void', true, 'four'],
    ]);
    expect(r.extra).toEqual({
      'Announcer': ['rain', 'ring'], 'Puffball Speaker Box': ['slam', 'rain'], 'Firey Speaker Box': ['rain', 'slam'],
      'The Bug Swarm': ['seekers', 'rain'], 'Purple Face': ['ring', 'rain'], 'Purple Dragon': ['slam', 'rain'],
      'MePhone4': ['melife', 'portal'],
      'Evil Leafy': ['seekers', 'slam'], 'MePhone4S': ['cookies', 'chainsaws'], 'Two': ['seekers', 'ring'], 'Steve Cobs': ['knife', 'kernels'],
      'Four': ['rain', 'seekers'],
    });
  });

  it('walking the gauntlet spawns him seventh, and Four is still the last boss', () => {
    const order = W.eval(`(function(){
      var st = setTimeout; setTimeout = function(){ return 0; };   // bossRushCheck queues the next spawn; this walk spawns by hand
      try {
        SETTINGS.mode='boss'; SETTINGS.stocks=99; running=true;
        BOSSRUSH = { active:true, bossIdx:0, cleared:0, defeated:false, loop:0, dmgMult:1 };
        var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 200, groundY()-24, 0);
        f.team=0; f.controller='still'; f.stocks=3; fighters=[f]; summons=[];
        var order = [];
        for (var i=0;i<14;i++){
          spawnBossRushBoss();
          var b = summons.find(function(s){ return s.type==='boss'; });
          order.push(b.name);
          if (b.name==='Four') break;
          b.hp = 0; bossRushCheck();
        }
        return order;
      } finally { setTimeout = st; BOSSRUSH.active=false; running=false; summons=[]; }
    })()`);
    expect(order).toEqual(['Announcer', 'Puffball Speaker Box', 'Firey Speaker Box', 'The Bug Swarm', 'Purple Face',
      'Purple Dragon', 'MePhone4', 'Evil Leafy', 'MePhone4S', 'Two', 'Steve Cobs', 'Four']);
  });

  it('takes turns: Fist Thingy, MeLife, Fist Thingy, Rejection Portal, each with its own warning, and names his phases', () => {
    const r = W.eval(`(function(){
      var s = { name:'MePhone4', attack:'mephone', x:550, y:300, r:85, hp:100, maxHp:100, _phase:1, _atkTimer:1, _tel:0,
                color:'#4fb8e8', face:1, homeX:550, stationary:true };
      var kinds = [], names = [];
      for (var i=0;i<4;i++){ s._atkTimer = 1; s._tel = 0; updateBossAttack(s, null); kinds.push(s._telKind); names.push(bossTelName(s)); }
      // a glove wound up in phase 2: the warning names the phase the wind-up was drawn in (_telPh), not the one it ends in
      s._phase = 2; s._telPh = 2; s._telKind = 'mephone';
      return { kinds: kinds, names: names, combo: bossTelName(s), p2: bossPhaseName(s, 2), p3: bossPhaseName(s, 3),
               moves: ['melife','portal'].map(function(k){ return typeof BOSS_MOVES[k] + '/' + !!BOSS_MOVE_NAME[k]; }) };
    })()`);
    expect(r.kinds).toEqual(['mephone', 'melife', 'mephone', 'portal']);
    expect(r.names).toEqual(['FIST THINGY!', 'MELIFE DOWNLOAD!', 'FIST THINGY!', 'REJECTION PORTAL!']);
    expect(r.combo).toBe('FIST THINGY COMBO!');
    expect(r.p2).toBe('Back and Forth');
    expect(r.p3, 'Hatching the Plan, not the screen Cobs cracked').toBe('Glitching');
    expect(r.moves).toEqual(['function/true', 'function/true']);
  });

  it('his phases change as his HP falls, and crossing into Phase 3 downloads one free add', () => {
    const r = W.eval(`(function(){ ${STAGE(800)}
      var out = { p1: b._phase };
      b.hp = b.maxHp*0.5; updateBossAttack(b, f); out.p2 = b._phase; out.addsAtP2 = hostileCount();
      b.hp = b.maxHp*0.2; updateBossAttack(b, f); out.p3 = b._phase; out.addsAtP3 = hostileCount();
      summons = []; return out;
    })()`);
    expect(r).toEqual({ p1: 1, p2: 2, addsAtP2: 0, p3: 3, addsAtP3: 1 });
  });

  it('left to fight for ten seconds, he punches, downloads an add and snaps a portal open', () => {
    const r = W.eval(`(function(){ ${STAGE(820, true)}
      // A stationary boss drifts toward his target, so against a still one the glove lands on the frame it is thrown
      // and is gone before a step returns: count it as it is thrown.
      var glove = false, add = false, portal = false, AP = addProj;
      addProj = function(p){ if (p && p.shape==='fistthingy' && p.owner===-2) glove = true; return AP(p); };
      for (var i=0;i<620;i++){
        step(); f.x = 820; f.vx = 0;
        if (summons.some(function(s){ return s.hostile; })) add = true;
        if (b._portal) portal = true;
      }
      addProj = AP; summons = []; projectiles = []; return { glove: glove, add: add, portal: portal };
    })()`);
    expect(r).toEqual({ glove: true, add: true, portal: true });
  });
});

describe('the Fist Thingy', () => {
  const fire = (ph, telX) => W.eval(`(function(){ projectiles = [];
    var s = { name:'MePhone4', attack:'mephone', x:500, y:groundY()-85, r:85, color:'#4fb8e8', face:1, _phase:${ph},
              _telX:${telX}, _telY:groundY()-100 };
    fireBossAttack(s, null);
    var out = projectiles.map(function(p){ return { owner:p.owner, atk:p.bossAtk, shape:p.shape, x:p.x, y:p.y, vx:p.vx, vy:p.vy,
      dmg:p.dmg, delay:p.delay||0, sm:p.smAngle||0 }; });
    projectiles = []; return { gloves: out, full: bossDmg(), row: groundY()-100 };
  })()`);
  const sum = (g) => g.reduce((a, p) => a + p.dmg, 0);

  it('P1 is one glove along the row you stood in, a whole boss hit', () => {
    const r = fire(1, 900);
    expect(r.gloves).toHaveLength(1);
    const [g] = r.gloves;
    expect(g).toMatchObject({ owner: -2, shape: 'fistthingy', vx: 15, vy: 0, y: r.row });
    expect(g.atk).toBeGreaterThan(0);
    expect(g.dmg).toBeCloseTo(r.full, 6);
    expect(fire(1, 100).gloves[0].vx, 'it punches toward the side you were on').toBe(-15);
  });

  it('P2 punches again from his side, past the first glove\'s hit grace; the two make one boss hit', () => {
    const r = fire(2, 900);
    expect(r.gloves).toHaveLength(2);
    const [a, b] = r.gloves;
    expect(b.delay, 'later than the 24-frame hit grace').toBeGreaterThan(24);
    expect([b.x, b.y, b.vx, b.atk]).toEqual([a.x, a.y, a.vx, a.atk]);
    expect(sum(r.gloves)).toBeLessThanOrEqual(r.full + 1e-9);
  });

  it('P3 ends in a rising uppercut from his side, not out of the floor', () => {
    const r = fire(3, 900);
    expect(r.gloves).toHaveLength(3);
    const [a, b, up] = r.gloves;
    expect(b.delay).toBeGreaterThan(24);
    expect(up.delay - b.delay, 'the uppercut also waits out the second glove\'s grace').toBeGreaterThan(24);
    expect(up.vy).toBeLessThan(0);
    expect(up.vx, 'still thrown toward you').toBeGreaterThan(0);
    expect(up.sm).toBeGreaterThan(0);
    expect(Math.abs(up.x - a.x), 'from the same side as the other punches').toBeLessThan(1);
    expect(new Set(r.gloves.map((g) => g.atk)).size, 'one attack id for the whole combo').toBe(1);
    expect(sum(r.gloves)).toBeLessThanOrEqual(r.full + 1e-9);
  });

  it('against a still target the whole P3 combo lands, every punch, and still totals one boss hit', () => {
    const r = W.eval(`(function(){ ${STAGE(760)}
      summons = []; var x0 = f.x, y0 = f.y;
      var s = { name:'MePhone4', attack:'mephone', x:300, y:groundY()-85, r:85, color:'#4fb8e8', face:1, _phase:3, _telX:x0, _telY:y0 };
      fireBossAttack(s, null);
      var hits = 0, last = f.pct;
      for (var i=0;i<160;i++){ step(); f.x = x0; f.y = y0; f.vx = 0; f.vy = 0; if (f.pct > last + 1e-9){ hits++; last = f.pct; } }
      projectiles = []; return { hits: hits, total: f.pct, full: bossDmg() };
    })()`);
    expect(r.hits, 'no punch is swallowed by the previous one\'s grace').toBe(3);
    expect(r.total).toBeLessThanOrEqual(r.full + 1e-6);
    expect(r.total).toBeGreaterThan(r.full * 0.9);
  });

  // The review's probe: at 80% the first glove of a combo launched the fighter out of its row and the rest whiffed -- phase 2
  // landed 12.1 of 22, phase 3 7.7 at knockback 9 -- while phase 1's single glove dealt the whole 22 at 13. So his
  // signature hit softer the further the fight went. The early punches are jabs now (MEPHONE_GLOVE).
  it('at 80%, a free-standing fighter takes the whole combo in every phase, and the finisher launches as hard as phase 1', () => {
    const r = W.eval(`(function(){ var out = {};
      [1, 2, 3].forEach(function(ph){ [250, 500].forEach(function(d){
        ${STAGE(700)}
        summons = []; f.x = 300 + d; f.pct = 80; var x0 = f.x, y0 = f.y, st = f.stocks;
        var s = { name:'MePhone4', attack:'mephone', x:300, y:groundY()-85, r:85, color:'#4fb8e8', face:1, _phase:ph, _telPh:ph, _telX:x0, _telY:y0 };
        fireBossAttack(s, null);
        var hits = 0, last = f.pct, dealt = 0, launch = 0;
        for (var i=0;i<160;i++){ step(); if (f.stocks < st) break;
          if (f.pct > last + 1e-9){ hits++; dealt += f.pct - last; launch = Math.hypot(f.vx, f.vy); } last = f.pct; }
        out[ph + '/' + d] = { hits: hits, dealt: dealt, launch: launch };
        projectiles = [];
      }); });
      return { out: out, full: bossDmg(), jab: MEPHONE_GLOVE.jab.slice(2), kbs: [MEPHONE_GLOVE.jabKb, MEPHONE_GLOVE.kb] };
    })()`);
    for (const d of [250, 500]) {
      expect(r.out['1/' + d].hits).toBe(1);
      expect(r.out['2/' + d].hits, 'both punches of phase 2 land').toBe(2);
      expect(r.out['3/' + d].hits, 'all three of phase 3 land').toBe(3);
      for (const ph of [1, 2, 3]) expect(r.out[ph + '/' + d].dealt, `phase ${ph} at ${d} px deals the whole boss hit`).toBeCloseTo(r.full, 5);
      expect(r.out['2/' + d].launch, 'the phase-2 finisher launches as hard as phase 1\'s glove').toBeGreaterThanOrEqual(r.out['1/' + d].launch - 1e-6);
    }
    expect(r.kbs[0], 'a jab is light').toBeLessThan(r.kbs[1] / 2);
  });

  it('a wind-up drawn in phase 1 fires phase 1\'s single glove, even if a hit crosses into phase 3 during it', () => {
    const r = W.eval(`(function(){ ${STAGE(800)}
      summons = summons.filter(function(s){ return s.type==='boss'; });
      b._atkTimer = 1; step();
      var name = document.getElementById('banner').textContent, kind = b._telKind;
      var gloves = 0, AP = addProj;
      addProj = function(p){ if (p && p.shape==='fistthingy') gloves++; return AP(p); };
      try {
        b.hp = b.maxHp*0.2;
        for (var i=0;i<40;i++){ step(); f.x = 800; f.vx = 0; }
        return { name: name, kind: kind, phase: b._phase, gloves: gloves };
      } finally { addProj = AP; summons = []; projectiles = []; }
    })()`);
    expect(r.kind).toBe('mephone');
    expect(r.name).toBe('FIST THINGY!');
    expect(r.phase).toBe(3);
    expect(r.gloves, 'one glove, as announced -- not the phase-3 combo').toBe(1);
  });

  // The glove row used to be fixed where you stood when he flashed, so whoever was mid-jump then was never in it; with
  // his turns at the usual gaps he measured easier than the Dragon before him (the review). The row follows you now, drawn
  // as a band, and holds for the last MEPHONE_GLOVE.lock frames.
  it('the glove row follows you through the wind-up, holds for its last MEPHONE_GLOVE.lock frames, and the glove goes along it', () => {
    const r = W.eval(`(function(){ ${STAGE(800)}
      summons = summons.filter(function(s){ return s.type==='boss'; });
      b._atkTimer = 1; step();
      var lock = MEPHONE_GLOVE.lock, follow = 0, held = 0, broke = [], lockedX = null, lockedY = null, glove = null, AP = addProj;
      addProj = function(p){ if (p && p.shape==='fistthingy' && !glove) glove = { y: p.y, vx: p.vx }; return AP(p); };
      try {
        for (var i=0; i<40 && !glove; i++){
          var prev = b._tel; f.x = 800 + i*3; f.vx = 0;
          if (prev === lock) { f.y = groundY() - 140; f.onground = false; f.vy = 0; }   // she jumps: the last row it takes
          step();
          if (glove) break;
          if (prev >= lock){ if (b._telX === f.x) follow++; else broke.push(i); if (prev === lock){ lockedX = b._telX; lockedY = b._telY; } }
          else { if (b._telX === lockedX && b._telY === lockedY) held++; else broke.push(i); }
          if (prev < lock) { f.y = groundY() - 24; f.vy = 0; }                          // and lands: it holds anyway
        }
        return { follow: follow, held: held, broke: broke, lock: lock, glove: glove, lockedY: lockedY, row: clamp(lockedY, 60, groundY()-16) };
      } finally { addProj = AP; summons = []; projectiles = []; }
    })()`);
    expect(r.broke, 'the row followed, then held, every frame').toEqual([]);
    expect(r.follow, 'following through the wind-up').toBe(36 - r.lock + 1);
    expect(r.held, 'held for the frames after it locked (the last of them is the punch)').toBe(r.lock - 2);
    expect(r.glove, 'the glove came').not.toBe(null);
    expect(r.glove.y, 'along the row it locked on, not where she landed').toBe(r.row);
  });

  it('the uppercut launches upward, inside the boss knockback band', () => {
    const r = W.eval(`(function(){
      function launch(tilt){ ${STAGE(600)}
        summons = [];
        var s = { name:'MePhone4', attack:'mephone', x:300, y:groundY()-85, r:85, color:'#4fb8e8', face:1, _phase:3, _telX:f.x, _telY:f.y };
        fireBossAttack(s, null);
        var up = projectiles.filter(function(p){ return p.smAngle > 0; })[0];   // the jabs are tilted too, flat (smAngle -1)
        projectiles = [up]; up.delay = 0; up.x = f.x - 30; up.y = f.y; up.vx = 15; up.vy = 0; if (!tilt) up.smAngle = 0;
        for (var i=0;i<6 && f.pct===0;i++) step();
        var v = { vx: f.vx, vy: f.vy, hit: f.pct > 0 }; projectiles = []; return v;
      }
      return { up: launch(true), flat: launch(false) };
    })()`);
    expect(r.up.hit).toBe(true);
    expect(r.up.vy).toBeLessThan(0);
    expect(Math.abs(r.up.vy), 'mostly up').toBeGreaterThan(Math.abs(r.up.vx) * 2);
    expect(Math.abs(r.up.vy), 'higher than the same glove thrown flat').toBeGreaterThan(Math.abs(r.flat.vy));
  });
});

describe('MeLife: hostile assist trophies', () => {
  it('downloads one add in P1, on his team, from the MePhone pool, inert while it downloads', () => {
    const r = W.eval(`(function(){ ${STAGE(900)}
      b._phase = 1; BOSS_MOVES.melife(b, f);
      var adds = summons.filter(function(s){ return s.hostile; });
      var a = adds[0];
      return { n: adds.length, type: a.type, team: a.team, owner: a.owner, inPool: MEPHONE_POOL.indexOf(a.name) >= 0,
        dl: a._dl, DL: MELIFE_DL, life: a.life, LIFE: MELIFE_LIFE + MELIFE_DL, hp: a.hp, HP: MELIFE_HP,
        side: Math.sign(a.x - b.x), far: Math.abs(a.x - b.x) };
    })()`);
    expect(r.n).toBe(1);
    expect(r).toMatchObject({ type: 'assist', team: -1, owner: -1, inPool: true });
    expect(r.dl).toBe(r.DL);
    expect(r.life).toBe(r.LIFE);
    expect(r.hp).toBe(r.HP);
    expect(r.side, 'on the side the target is on').toBe(1);
    expect(r.far, 'out past his body, not a wall in front of him').toBeGreaterThan(150);
  });

  // Was "at the cap he glitches and throws the ring instead", fired from inside the MeLife turn: its warning said MELIFE
  // DOWNLOAD! and showed the green MeLife tell, and the ring was named only as it went off (the review). The glitch is its
  // own turn now, decided when the wind-up starts, with its own warning.
  it('at the cap his MeLife turn is drawn as GLITCH, and throws the ring; P3 downloads two, and the cap holds', () => {
    const r = W.eval(`(function(){ ${STAGE(900)}
      b._phase = 1; BOSS_MOVES.melife(b, f);
      var n1 = summons.length; projectiles = [];
      b._moveN = 1; b._atkTimer = 1; b._tel = 0; updateBossAttack(b, f);     // turn 2: the MeLife turn
      var kind = b._telKind, warn = document.getElementById('banner').textContent;
      b._tel = 1; updateBossAttack(b, f);                                   // the wind-up ends and it fires
      var id = BOSS_ATK_ID, ring = projectiles.filter(function(p){ return p.owner===-2 && p.bossAtk===id; }).length;
      // MeLife itself, with no room left (an add arrived during its wind-up): it fizzles, and throws nothing unannounced
      projectiles = []; var n1b = summons.length; b._telPh = 1; BOSS_MOVES.melife(b, f);
      var fizzle = { thrown: projectiles.length, adds: summons.length - n1b };
      var n2 = summons.length;
      summons = summons.filter(function(s){ return !s.hostile; });
      b._phase = 3; b._telPh = 3; BOSS_MOVES.melife(b, f);
      var p3 = summons.filter(function(s){ return s.hostile; });
      var sides = p3.map(function(a){ return Math.sign(a.x - b.x); }).sort();
      BOSS_MOVES.melife(b, f);
      var capped = summons.filter(function(s){ return s.hostile; }).length;
      summons = []; projectiles = [];
      return { n1: n1, n2: n2, ring: ring, p3: p3.length, sides: sides, capped: capped, caps: MELIFE_CAP.slice(1), kind: kind, warn: warn, fizzle: fizzle };
    })()`);
    expect(r.n2, 'no second add in P1').toBe(r.n1);
    expect(r.kind, 'the turn is the glitch').toBe('glitch');
    expect(r.warn, 'and its warning says so, not MELIFE DOWNLOAD!').toBe('GLITCH!');
    expect(r.ring, 'GLITCH: the ring').toBe(12);
    expect(r.fizzle, 'a MeLife with no room left fizzles').toEqual({ thrown: 0, adds: 0 });
    expect(r.p3).toBe(2);
    expect(r.sides, 'one either side of him').toEqual([-1, 1]);
    expect(r.capped).toBe(2);
    expect(r.caps).toEqual([1, 1, 2]);
  });

  it('adds come and go: one lives less than a MeLife cycle in every phase', () => {
    const r = W.eval(`(function(){
      var out = [];
      for (var ph=1; ph<=3; ph++){ var s = { attack:'mephone', _phase:ph }; out.push(4*(bossAtkGap(s) + bossTelLen(s))); }
      return { cycles: out, life: MELIFE_LIFE + MELIFE_DL };
    })()`);
    for (const c of r.cycles) expect(r.life).toBeLessThan(c);
  });

  it('adds are sturdier with more players, as his own HP is', () => {
    const hp = W.eval(`(function(){ ${STAGE(900)}
      var g = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 300, groundY()-24, 1); g.team=0; g.controller='still';
      fighters = [f, g]; var a = meLifeDownload(b, 1); summons = []; return a.hp; })()`);
    expect(hp).toBe(64);
  });

  it('his pool is four existing assist trophies and nothing leaks into the item pool', () => {
    const r = W.eval(`(function(){ ${STAGE(900)}
      summons = []; var hostile = 0, wrongTeam = 0;
      for (var i=0;i<200;i++){ summonAssist(f); }
      summons.forEach(function(s){ if (s.hostile) hostile++; if (s.team !== f.team) wrongTeam++; });
      summons = [];
      return { pool: MEPHONE_POOL.slice(), known: MEPHONE_POOL.every(function(n){ return ASSIST_ROSTER.some(function(a){ return a.name===n; }); }),
               roster: ASSIST_ROSTER.length, hostile: hostile, wrongTeam: wrongTeam };
    })()`);
    expect(r.known).toBe(true);
    expect(r.roster, 'no new assist rows').toBe(13);
    for (const n of ['Eraser', 'Clock', 'Cloudy', 'Stapy', 'Selfie Stick', 'Blender', 'Grotato', 'Shopping Cart', 'Black Hole']) {
      expect(r.pool, n).not.toContain(n);
    }
    expect(r.hostile, 'a normal assist is never hostile').toBe(0);
    expect(r.wrongTeam, 'and still takes its summoner\'s team').toBe(0);
  });

  // At three quarters of a cameo hit, was half: the review found him easier than the Dragon before him, and the adds are
  // what the owner asked him for (HOSTILE_ADD_DMG; test/boss-rush-order.test.js).
  it('a hostile 8-Ball waits out its download, then hits the player -- at three quarters of a cameo hit -- and never the boss', () => {
    const r = W.eval(`(function(){
      function run(hostile){ ${STAGE('WW*0.5+300')}
        f.x = b.x + 300; var bossHp = b.hp, a;
        if (hostile) a = ${download('8-Ball', 1)};
        else { var o = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 60, groundY()-24, 1);
               o.team = 1; o.controller = 'still'; fighters = [f, o];
               a = summonAssistNamed(o, ASSIST_ROSTER.find(function(x){ return x.name==='8-Ball'; })); }
        a.x = f.x - 60;
        var early = 0, first = 0, firstAt = -1, last = f.pct, bossHit = false;
        for (var i=1;i<=150;i++){
          step(); f.x = b.x + 300; f.vx = 0;
          if (f.pct > last + 1e-9){ if (firstAt < 0){ firstAt = i; first = f.pct - last; } last = f.pct; }
          if (i < MELIFE_DL && f.pct > 0) early = f.pct;
          if (b.hp !== bossHp) bossHit = true;
        }
        summons = []; return { name: a.name, early: early, first: first, firstAt: firstAt, total: f.pct, bossHit: bossHit };
      }
      return { hostile: run(true), normal: run(false) };
    })()`);
    expect(r.hostile.name).toBe('8-Ball');
    expect(r.hostile.early, 'inert for its download').toBe(0);
    expect(r.hostile.firstAt).toBeGreaterThanOrEqual(40);
    expect(r.hostile.total, 'it attacks the player').toBeGreaterThan(0);
    expect(r.hostile.bossHit, 'and never the boss').toBe(false);
    // A player's 8-Ball rolls for 15 now -- its 10 at the trophies' x1.5 ("assist trophies should be stronger" -- "Hit
    // harder"). The add is not a trophy, it is his attack, so it keeps three quarters of the cameo's own 10: 7.5, not 11.25.
    expect(r.normal.first, 'a player\'s 8-Ball hits at the trophy number').toBeCloseTo(10 * W.eval('ASSIST_TROPHY_DMG'), 5);
    expect(W.eval('HOSTILE_ADD_DMG')).toBe(0.75);
    expect(r.hostile.first, 'the add is untouched by the trophies\' buff').toBeCloseTo(0.75 * 10, 5);
    expect(r.hostile.first, 'still under half a boss hit').toBeLessThan(W.eval('bossDmg()') / 2);
  });

  it('a hostile Pie\'s lobs hit the player and pass the boss by', () => {
    const r = W.eval(`(function(){ ${STAGE('WW*0.5+300')}
      var a = ${download('Pie', 1)};
      var fx = a.x + 130; f.x = fx; var bossHp = b.hp, lobs = 0;
      for (var i=0;i<250 && f.pct===0;i++){ step(); f.x = fx; f.vx = 0;
        projectiles.forEach(function(p){ if (p.ownerObj && p.ownerObj.team===-1 && !p.bossAtk) lobs++; }); }
      var out = { name: a.name, hit: f.pct > 0, lobs: lobs > 0, bossHp: b.hp === bossHp };
      summons = []; projectiles = []; return out;
    })()`);
    expect(r).toEqual({ name: 'Pie', hit: true, lobs: true, bossHp: true });
  });

  it('only a hostile add can be killed: by a hit, a shot, a dash, and Beach Ball still pops on a point', () => {
    const r = W.eval(`(function(){ ${STAGE('WW*0.5+300')}
      var out = {};
      var a = ${download('Spongy', 1)}; f.x = a.x;
      damageSummons(f, a.x, a.y, 40, 45); out.hitKills = a.life <= 0;
      // a normal assist shrugs off the same forty times over
      var o = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 60, groundY()-24, 1); o.team=1; o.controller='still';
      fighters = [f, o];
      var n = summonAssistNamed(o, ASSIST_ROSTER.find(function(x){ return x.name==='Spongy'; })); n.x = f.x;
      for (var i=0;i<40;i++) damageSummons(f, n.x, n.y, 40, 45);
      out.normalLives = n.life > 0; summons = summons.filter(function(s){ return s !== n; }); fighters = [f];
      // a shot
      var c = ${download('Spongy', 1)}; var hp0 = c.hp;   // still downloading: inert, so it holds still for the shot
      addProj({ owner:f.idx, ownerObj:f, x:c.x - 4, y:c.y, vx:1, vy:0, grav:false, dmg:9, kb:4, r:10, color:'#fff', life:30 });
      step(); out.shotHurts = c.hp < hp0 || c.life <= 0;
      summons = summons.filter(function(s){ return s.type==='boss'; }); projectiles = [];
      // a dash (Leafy's BFDIA Sprint)
      var L = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 0, groundY()-24, 0); L.team=0; L.controller='still'; L.face=1;
      fighters = [L]; var d = ${download('Spongy', 1)}; L.x = d.x - 90; L.y = d.y; step(); L.spCd = 0; var hp1 = d.hp;
      doSpecial(L); for (var j=0;j<14;j++){ step(); d.vx = 0; }
      out.dashHurts = d.hp < hp1 || d.life <= 0;
      summons = summons.filter(function(s){ return s.type==='boss'; });
      // Needle pops a hostile Beach Ball on the lightest touch
      var N = makeFighter(ROSTER.find(function(r){ return r.name==='Needle'; }), 0, groundY()-24, 0); N.team=0; fighters = [N];
      var e = ${download('Beach Ball', 1)}; N.x = e.x;
      damageSummons(N, e.x, e.y, 30, 1); out.popped = e.life <= 0 && e.hp > 0;
      summons = []; projectiles = []; return out;
    })()`);
    expect(r).toEqual({ hitKills: true, normalLives: true, shotHurts: true, dashHurts: true, popped: true });
  });

  it('his adds leave when he falls, and a normal assist stays', () => {
    const r = W.eval(`(function(){
      var st = setTimeout; setTimeout = function(){ return 0; };
      try {
        SETTINGS.mode='boss'; SETTINGS.stocks=99; running=true;
        BOSSRUSH = { active:true, bossIdx:6, cleared:0, defeated:false, loop:0, dmgMult:1 };
        var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 200, groundY()-24, 0);
        f.team=0; f.controller='still'; f.stocks=3; fighters=[f]; summons=[]; projectiles=[];
        spawnBossRushBoss(); var b = summons.find(function(s){ return s.type==='boss'; });
        ${download('8-Ball', 1)}; ${download('Pie', -1)};
        var normal = summonAssistNamed(f, ASSIST_ROSTER.find(function(x){ return x.name==='Spongy'; }));
        var before = summons.filter(function(s){ return s.hostile; }).length;
        b.hp = 0; bossRushCheck();
        var out = { name: b.name, before: before, hostile: summons.filter(function(s){ return s.hostile; }).length,
                    normalKept: summons.indexOf(normal) >= 0, boss: summons.some(function(s){ return s.type==='boss'; }), next: BOSSRUSH.bossIdx };
        // and on any other path: an add left with no boss standing leaves on the next tick
        summons = []; var lone = summonAssistNamed({ x:300, face:1, team:-1, idx:-1 }, ASSIST_ROSTER[2]); lone.hostile = true; lone.hp = lone.maxHp = 40;
        BOSSRUSH.active = false; updateSummons(); out.orphanGone = summons.indexOf(lone) < 0;
        return out;
      } finally { setTimeout = st; BOSSRUSH.active=false; running=false; summons=[]; }
    })()`);
    expect(r).toEqual({ name: 'MePhone4', before: 2, hostile: 0, normalKept: true, boss: false, next: 7, orphanGone: true });
  });
});

describe('the Rejection Portal', () => {
  it('opens where you stood when he flashed, hits you once and knocks you away from it, spares anyone clear of it, then shuts', () => {
    const r = W.eval(`(function(){ ${STAGE(700)}
      summons = [];
      var g = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 1000, groundY()-24, 0); g.team=0; g.controller='still';
      fighters = [f, g]; step(); f.pct = 0; g.pct = 0; f.invuln = 0; g.invuln = 0;
      var x0 = f.x, y0 = f.y;
      var s = { name:'MePhone4', attack:'mephone', x:300, y:groundY()-85, r:85, color:'#4fb8e8', face:1, _phase:1, hp:100, maxHp:100, _telX:x0, _telY:y0 };
      BOSS_MOVES.portal(s, f);
      var P = s._portal, out = { t: P.t, T: P.T, x: P.x, y: P.y, want: { x: clamp(x0, 90, WW-90), y: clamp(y0, 80, groundY()-30) } };
      var hits = 0, last = 0, vy = 0;
      for (var i=0;i<60;i++){
        updateRejectionPortal(s);
        if (f.pct > last + 1e-9){ hits++; last = f.pct; vy = f.vy; }
        f.x = x0; f.y = y0; f.vx = 0; f.vy = 0; f.invuln = 0;   // stands in it the whole time, with no grace to hide behind
      }
      out.hits = hits; out.dmg = f.pct; out.cap = bossDmg()*0.8; out.vy = vy; out.spared = g.pct === 0; out.shut = s._portal === null;
      out.pulls = String(updateRejectionPortal).indexOf('vx+') >= 0 || String(updateRejectionPortal).indexOf('vx +=') >= 0;
      return out;
    })()`);
    expect([r.t, r.T]).toEqual([48, 48]);
    expect({ x: r.x, y: r.y }).toEqual(r.want);
    expect(r.hits, 'hit once, not every frame').toBe(1);
    expect(r.dmg).toBeLessThanOrEqual(r.cap + 1e-6);
    expect(r.vy, 'sent up and away').toBeLessThan(0);
    expect(r.spared).toBe(true);
    expect(r.shut).toBe(true);
    expect(r.pulls, 'it knocks you away, it does not pull').toBe(false);
  });

  it('opens faster to shut as he loses HP', () => {
    const T = W.eval(`(function(){ var out = [];
      for (var ph=1; ph<=3; ph++){ var s = { name:'MePhone4', attack:'mephone', x:300, y:300, r:85, color:'#4fb8e8', _phase:ph, _telX:500, _telY:400 };
        BOSS_MOVES.portal(s, null); out.push(s._portal.T); }
      return out; })()`);
    expect(T).toEqual([48, 42, 36]);
  });
});

describe('the item version', () => {
  // summonBoss is not in spawnItem's pool today, so this code does not run in a match. If it comes back, an add downloaded
  // by an item boss (team -1) would attack its own summoner, and so would the portal -- so they are Boss Rush only.
  it('an item MePhone4 never downloads an add or opens a portal', () => {
    const r = W.eval(`(function(){ summons = []; projectiles = [];
      var s = { type:'boss', name:'MePhone4', color:'#4fb8e8', x:550, y:300, r:70, hp:200, vx:0, vy:0, face:1, _atkTimer:1, _tel:0 };
      var out = []; for (var i=0;i<4;i++){ s._atkTimer = 1; s._tel = 0; updateBossAttack(s, null); out.push(String(s._telKind)); s._tel = 1; updateBossAttack(s, null); }
      var r = { kinds: out, adds: summons.filter(function(m){ return m.hostile; }).length, portal: !!s._portal, only: ['melife', 'portal'].map(function(k){ return BOSS_RUSH_ONLY.has(k); }) };
      summons = []; projectiles = []; return r;
    })()`);
    expect(r.kinds).toEqual(['undefined', 'undefined', 'undefined', 'undefined']);
    expect(r.adds).toBe(0);
    expect(r.portal).toBe(false);
    expect(r.only).toEqual([true, true]);
  });
});

describe('what the player sees', () => {
  it('draws him, his portal, his green MeLife tell and his downloading adds without throwing', () => {
    const err = W.eval(`(function(){
      try {
        var base = { type:'boss', name:'MePhone4', color:'#4fb8e8', sprite:'mephone', r:60, x:100, y:100, face:1, hp:100, maxHp:100,
                     _tel:0, _telKind:null, _phase:1, _rage:false, flash:0, homeX:100, attack:'mephone' };
        var states = [{}, { _portal:{ x:0, y:0, t:10, T:48 } }, { _telKind:'melife', _tel:20 }, { _telKind:'portal', _tel:20, _telX:500, _telY:400 },
                      { _telKind:'mephone', _tel:20, _telX:500, _telY:400 }, { _telKind:'mephone', _tel:4, _telX:-300, _telY:120 },
                      { _telKind:'glitch', _tel:10 },
                      { _phase:3, flash:6, face:-1 }, { _portal:{ x:40, y:40, t:0, T:48 } }];
        states.forEach(function(st){ var s = Object.assign({}, base, st); ctx.save(); drawBossSprite(s); ctx.restore(); });
        var a = { type:'assist', name:'Pie', color:'#e8c060', r:26, x:200, y:200, hostile:true, _dl:20, hp:40, maxHp:40, flash:0 };
        drawSummon(a); a._dl = 0; drawSummon(a); a.flash = 4; a.hp = 10; drawSummon(a);
        drawArenaDecor('melife');
        var g = { x:300, y:300, vx:-15, vy:0, r:22, color:'#d8302a', shape:'fistthingy', owner:-2, ownerObj:{team:-1, idx:-2} };
        drawProjectile(g);
        return null;
      } catch(e){ return e.message; }
    })()`);
    expect(err).toBe(null);
  });

  it('his art is the II wiki render, with a drawn fallback, and his arena has its own sky', () => {
    const r = W.eval(`({ src: BOSS_SPRITE_SRC.mephone, flip: !!BOSS_SPRITE_FLIP.mephone, sky: BOSS_ARENA_SKY.melife,
      fallback: String(drawBossSprite).indexOf('case "mephone"') >= 0, shape: typeof PROJ_SHAPE.fistthingy.draw })`);
    expect(r).toEqual({ src: 'assets/sprites/mephone4.png', flip: false, sky: ['#12304a', '#060f18'], fallback: true, shape: 'function' });
  });

  it('a hostile 8-Ball keeps quiet, so it cannot wipe his telegraph off the banner', () => {
    const r = W.eval(`(function(){ ${STAGE('WW*0.5+300')}
      f.x = b.x + 300; var a = ${download('8-Ball', 1)}; a._dl = 0; a.x = f.x - 200;
      banner('FIST THINGY!', 700, 'boss');
      for (var i=0;i<5;i++){ step(); f.x = b.x + 300; }
      var text = document.getElementById('banner').textContent; summons = []; return text;
    })()`);
    expect(r).toBe('FIST THINGY!');
  });

  it("nothing of his names anyone from the OSC, and the portal's destination is never named", () => {
    const src = W.eval(`[String(meLifeDownload), String(updateRejectionPortal), String(BOSS_MOVES.melife), String(BOSS_MOVES.portal),
      String(fireBossAttack), String(drawRejectionPortal), MEPHONE_POOL.join(' '), BOSS_MOVE_NAME.melife, BOSS_MOVE_NAME.portal,
      bossPhaseName({attack:'mephone'}, 2), bossPhaseName({attack:'mephone'}, 3)].join('\\n')`);
    expect(src).not.toMatch(/\bOJ\b|Suitcase|Cabby|Hotel|A-OJ/i);
    // and every line of the game or the credits about him -- his whole section (the block comment over MEPHONE_POOL
    // included), his roster row and its comment, his CREDITS.md row -- as the MePhone4S and Steve Cobs guards check theirs
    const html = readFileSync('artifacts/V1/index.html', 'utf8'), credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const section = html.slice(html.indexOf('// ---- MEPHONE4 (Boss 7)'), html.indexOf('// ---- MEPHONE4S (Boss 9)'));
    expect(section.length, 'his section is found').toBeGreaterThan(2000);
    const rosterAt = html.indexOf('{name:"MePhone4",'), roster = html.slice(html.lastIndexOf('// Boss 7 --', rosterAt), html.indexOf('\n', rosterAt));
    expect(roster, 'his roster row and the comment over it').toMatch(/^\/\/ Boss 7 --[\s\S]*hp:/);
    const aboutHim = (l) => /MePhone4(?!S)|\bmephone\b|MeLife|MELIFE|MEPHONE_|Fist Thingy|Rejection Portal/.test(l);
    const lines = [...section.split('\n'), ...roster.split('\n'), ...html.split('\n').filter(aboutHim), ...credits.split('\n').filter(aboutHim)];
    expect(lines.length).toBeGreaterThan(100);
    expect(credits.split('\n').filter(aboutHim).length, 'his CREDITS.md row is scanned').toBeGreaterThan(0);
    expect(lines.filter(l => /\bOJ\b|Suitcase|Cabby|Hotel OJ|A-OJ/.test(l))).toEqual([]);
  });
});

describe('a netcode client sees him', () => {
  it('his adds, his portal, his tell and his glove all cross the snapshot and draw on the client', () => {
    const { window: w } = loadMonolith();   // the harness with gradients, as test/net-lobby.test.js uses: drawBossBar needs one
    const r = w.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow();
      summons = [{ type:'boss', name:'MePhone4', color:'#4fb8e8', r:85, sprite:'mephone', x:500, y:300, hp:80, maxHp:120, face:-1, flash:0,
                   homeX:500, _rage:false, _tel:12, _telKind:'melife', _bossRush:true, attack:'mephone', _portal:{ x:640.4, y:420.6, t:20, T:48, id:3, hit:{} },
                   _telX:700.6, _telY:410.2, _phase:3 },
                 { type:'assist', name:'Pie', color:'#e8c060', r:26, x:300, y:400, hp:30, maxHp:40, face:1, flash:0, hostile:true, _dl:12, team:-1, owner:-1 }];
      projectiles = [{ x:200, y:300, vx:15, vy:0, r:22, color:'#d8302a', shape:'fistthingy', owner:-2, ownerObj:{team:-1, idx:-2}, bossAtk:9, life:80 },
                     { x:220, y:300, vx:6, vy:0, r:9, color:'#fff', owner:0, life:40 }];
      var snap = JSON.parse(JSON.stringify(serializeState()));
      summons = []; projectiles = [];
      applySnapshot(snap);
      var err = null; try { summons.forEach(drawSummon); projectiles.forEach(drawProjectile); drawBossBar(); } catch(e){ err = e.message; }
      // The netcode now sends shots as compact rows (s.pj), not a list of objects ("camera is weird on multiplayer, there
      // is an input delay sometimes"), so this reads the shots the CLIENT rebuilds -- which is what crossing the snapshot means.
      return { boss: snap.summons[0], add: snap.summons[1], glove: projectiles[0], plain: projectiles[1], err: err };
    })()`);
    expect(r.err).toBe(null);
    expect(r.boss._telKind).toBe('melife');
    expect(r.boss._portal).toEqual({ x: 640, y: 421, t: 20, T: 48 });
    expect(r.boss, 'where the wind-up is aimed (his glove row, his portal mark) and his phase').toMatchObject({ _telX: 701, _telY: 410, _phase: 3 });
    expect(r.add).toMatchObject({ hostile: true, _dl: 12, hp: 30, maxHp: 40 });
    expect(r.glove).toMatchObject({ shape: 'fistthingy', vx: 15, vy: 0 });
    expect(r.plain.shape, 'a fighter\'s shot names no shape').toBeUndefined();
    // Every shot now carries its velocity so the client can glide it between snapshots (the multiplayer fix); a fighter's
    // shot used to be sent without one.
    expect(r.plain.vx).toBe(6);
  });
});
