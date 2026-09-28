import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "they dont work on bosses." A boss is a summon, not a fighter, and so is one of MePhone4's adds: every assist act
// looked for its targets in `fighters`, so in Boss Rush -- where a player's only enemies are the boss and his adds -- a
// trophy found nothing to aim at and its act never fired. Now every assist sees the boss's side as targets (assistFoes),
// and each damaging act lands through the boss's own damage path (assistHitSummon -> damageSummons, as Bot's punch does),
// for the number it deals a fighter; the acts whose cadence against fighters is the knockback land once an
// ASSIST_BOSS_GAP per target. Effects that make no sense on a boss are skipped, and listed at the bottom.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// Boss Rush against BOSS_ROSTER[idx] with the gauntlet logic off, a still Firey `dx` from the boss, the boss's attack
// timer parked. Then `act`'s assist is summoned for Firey and watched `n` frames, the boss's HP read before and after.
const RUN = (idx, act, dx, n) => `(function(){
  SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
  BOSSRUSH = { active:false, bossIdx:${idx}, cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), WW*0.5 + ${dx}, groundY()-24, 0);
  f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
  spawnBossRushBoss();
  var b = summons.find(function(s){ return s.type==='boss'; }); b._atkTimer = 1e9;
  step(); f.pct=0; f.invuln=0; f.x = WW*0.5 + ${dx}; f.vx = 0;
  var a = summonAssistNamed(f, ASSIST_ROSTER.find(function(x){ return x.act===${JSON.stringify(act)}; }));
  var hp0 = b.hp, hitFrames = [], lastHp = b.hp;
  for (var i=0;i<${n};i++){
    step(); b._atkTimer = 1e9; f.invuln = 0; f.dead = false;
    if (b.hp < lastHp){ hitFrames.push(i); lastHp = b.hp; }
    if (b.hp <= 0) break;
  }
  var out = { boss: b.name, name: a.name, dmg: +(hp0 - b.hp).toFixed(3), hits: hitFrames, fighterHurt: f.pct > 0, gone: summons.indexOf(a) < 0 };
  summons = []; projectiles = []; running = false; return out;
})()`;

const MEPHONE4 = 6, FOUR = 11;
// act -> [the number it deals a fighter, how far from the boss Firey stands when it is summoned]
const HURTS = { rush: [10, 60], crush: [14, 60], bolt: [8, 150], vortex: [3, 60], cart: [8, 60], bounce: [6, 60], staple: [4, 120], mines: [18, 40], pull: [1, 60] };

describe('assist trophies hurt the boss', () => {
  for (const [idx, who] of [[MEPHONE4, 'MePhone4'], [FOUR, 'Four']]) {
    it(`against ${who}: every damaging act lowers his HP, by at least one of its hits`, () => {
      expect(W.eval(`BOSS_ROSTER[${idx}].name`)).toBe(who);
      const out = {};
      for (const act of Object.keys(HURTS)) out[act] = W.eval(RUN(idx, act, HURTS[act][1], 420));
      for (const act of Object.keys(HURTS)) {
        expect(out[act].boss, act).toBe(who);
        expect(out[act].dmg, `${out[act].name} (${act}) against ${who}`).toBeGreaterThanOrEqual(HURTS[act][0]);
        expect(out[act].fighterHurt, `${out[act].name} never hurts its own summoner`).toBe(false);
      }
    });
  }

  it('lands the same number on a boss it deals a fighter: 8-Ball 10 a roll, Spongy 14 a slam, Stapy 4 a staple, a mine 18', () => {
    const r = {};
    for (const act of ['rush', 'crush', 'staple', 'mines']) {
      const o = W.eval(RUN(MEPHONE4, act, HURTS[act][1], 240));
      r[act] = o.hits.length ? +(o.dmg / o.hits.length).toFixed(3) : 0;
      if (act === 'mines') r.mineHits = o.hits.length;
    }
    // each frame that took HP took exactly one hit's worth -- except a mine patch, where two can go off on one frame
    expect(r.rush).toBe(10);
    expect(r.crush).toBe(14);
    expect(r.staple).toBe(4);
    expect(W.eval('Math.round(12*TRAP_DMG_MULT)')).toBe(18);
    expect(r.mines % 18, 'mines land the trap number a fighter takes').toBe(0);
  });

  it('the cap: the vortex, the cart and the ball land once an ASSIST_BOSS_GAP per boss; 8-Ball keeps his own cooldown', () => {
    const gap = W.eval('ASSIST_BOSS_GAP');
    expect(gap).toBe(40);
    for (const [act, cd] of [['vortex', gap], ['cart', gap], ['bounce', gap], ['rush', 40]]) {
      const o = W.eval(RUN(MEPHONE4, act, 0, 400));
      expect(o.hits.length, `${o.name} landed more than once`).toBeGreaterThanOrEqual(2);
      for (let i = 1; i < o.hits.length; i++) expect(o.hits[i] - o.hits[i - 1], `${o.name}: frames between hits`).toBeGreaterThanOrEqual(cd);
    }
    // Blender against a boss standing in it for its whole tenure: 3 a gap, not 3 every tenth frame
    const v = W.eval(RUN(MEPHONE4, 'vortex', 0, 400));
    expect(v.dmg).toBeLessThanOrEqual(3 * Math.ceil(W.eval('ASSIST_DUR') / gap));
  });

  it('a boss shielded by its own rule stays shielded: Two ungrounded takes nothing from an assist', () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.stocks=99; running=true;
      BOSSRUSH = { active:false, bossIdx:9, cleared:0, defeated:false, loop:0, dmgMult:1 };
      worldPlats=[]; summons=[]; projectiles=[]; particles=[];
      var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), WW*0.5 + 60, groundY()-24, 0);
      f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
      spawnBossRushBoss(); var b = summons.find(function(s){ return s.type==='boss'; }); b._atkTimer = 1e9;
      b._ungrounded = true; b._grounded = false;
      var a = summonAssistNamed(f, ASSIST_ROSTER.find(function(x){ return x.act==='rush'; }));
      var hp0 = b.hp; var ok = assistHitSummon(a, b, 10, false);
      var out = { boss: b.name, hp: b.hp === hp0, returned: ok };
      summons = []; running = false; return out;
    })()`);
    expect(r.boss).toBe('Two');
    expect(r.hp, 'no HP moved').toBe(true);
  });
});

describe('assist trophies and MePhone4\'s adds', () => {
  const ADD = (name, pick) => `(function(){
    SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
    BOSSRUSH = { active:false, bossIdx:6, cleared:0, defeated:false, loop:0, dmgMult:1 };
    worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
    var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), WW*0.5 + 300, groundY()-24, 0);
    f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
    spawnBossRushBoss(); var b = summons.find(function(s){ return s.type==='boss'; }); b._atkTimer = 1e9;
    step(); f.pct = 0; f.x = WW*0.5 + 300;
    var R = Math.random; Math.random = function(){ return ${pick}; }; var add; try { add = meLifeDownload(b, 1); } finally { Math.random = R; }
    add._dl = 0; add._cd = 1e9; add.x = f.x - 40;   // a Spongy add, standing still beside Firey
    var a = summonAssistNamed(f, ASSIST_ROSTER.find(function(x){ return x.name===${JSON.stringify(name)}; }));
    return { b: b, add: add, a: a, f: f };
  })()`;

  it("a player's 8-Ball rolls through a hostile add and hurts it; the add's foes are only the players, never its boss", () => {
    const r = W.eval(`(function(){
      var S = ${ADD('8-Ball', 0.8)}; var b = S.b, add = S.add, a = S.a, f = S.f;
      var foesOfAdd = assistFoes(add).map(function(x){ return x.name; });
      var foesOfMine = assistFoes(a).map(function(x){ return x.name + (x.hostile ? ' (add)' : ''); }).sort();
      var hp0 = add.hp, bossHp = b.hp;
      for (var i=0;i<200;i++){ step(); b._atkTimer = 1e9; f.x = WW*0.5 + 300; f.vx = 0; add._cd = 1e9; if (add.hp < hp0) break; }
      var out = { addName: add.name, addHurt: add.hp < hp0, foesOfAdd: foesOfAdd, foesOfMine: foesOfMine, bossUntouched: b.hp === bossHp };
      summons = []; running = false; return out;
    })()`);
    expect(r.addName).toBe('Spongy');
    expect(r.addHurt, "the player's 8-Ball hurt the add").toBe(true);
    expect(r.foesOfAdd, 'a hostile add never lists its own side').toEqual([]);
    expect(r.foesOfMine).toEqual(['MePhone4', 'Spongy (add)']);
  });

  it("a Selfie Stick's flash holds an add facing it for the stun, and passes the boss by (a boss cannot be stunned)", () => {
    const r = W.eval(`(function(){
      var S = ${ADD('Selfie Stick', 0.8)}; var b = S.b, add = S.add, a = S.a;
      add._cd = 0; add.face = 1; a.x = add.x + 100; a.y = add.y;   // the add looks right, at the camera
      var bossHp = b.hp, tel = b._tel;
      updateSummons();
      var out = { held: add._cd >= 50, fired: summons.indexOf(a) < 0, bossHp: b.hp === bossHp, bossTel: b._tel === tel };
      summons = []; running = false; return out;
    })()`);
    expect(r).toEqual({ held: true, fired: true, bossHp: true, bossTel: true });
  });
});

describe('what is skipped on a boss, and why', () => {
  // Eraser wipes shots and drops yoyle: nothing to land on a boss, but it FIRES now (it used to wait for a fighter to aim
  // at). Clock heals its summoner. Cloudy steals a held item, and a boss holds nothing. Black Hole's pull is not put on a
  // boss (its place is its attack pattern's; it takes the chip). Stapy does not pin a boss (nothing on a boss reads
  // `rooted`; the 4 lands). Selfie Stick cannot stun a boss (nothing on a boss reads hitstun or frozen).
  it('Eraser fires in Boss Rush and wipes the shots; Clock heals its summoner; Cloudy and the flash leave the boss alone', () => {
    const r = W.eval(`(function(){
      var out = {};
      function stage(act){
        SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
        BOSSRUSH = { active:false, bossIdx:6, cleared:0, defeated:false, loop:0, dmgMult:1 };
        worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
        var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), WW*0.5 + 200, groundY()-24, 0);
        f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
        spawnBossRushBoss(); var b = summons.find(function(s){ return s.type==='boss'; }); b._atkTimer = 1e9;
        step(); f.pct = 30; f.x = WW*0.5 + 200;
        var a = summonAssistNamed(f, ASSIST_ROSTER.find(function(x){ return x.act===act; }));
        return { f: f, b: b, a: a };
      }
      var S = stage('erase');
      addProj({ owner:-2, ownerObj:{team:-1, idx:-2}, x:S.b.x, y:S.b.y, vx:3, vy:0, grav:false, dmg:5, kb:3, r:8, color:'#fff', life:200 });
      var hp0 = S.b.hp; step(); S.b._atkTimer = 1e9;
      out.erase = { fired: summons.indexOf(S.a) < 0, wiped: projectiles.length === 0, yoyle: items.filter(function(i){ return i.kind==='yoyle'; }).length, bossHp: S.b.hp === hp0 };
      S = stage('rewind'); hp0 = S.b.hp; step();
      out.rewind = { fired: summons.indexOf(S.a) < 0, healed: S.f.pct, bossHp: S.b.hp === hp0 };
      S = stage('steal'); hp0 = S.b.hp; for (var i=0;i<120;i++){ step(); S.b._atkTimer = 1e9; }
      out.steal = { bossHp: S.b.hp === hp0 };
      S = stage('flash'); hp0 = S.b.hp; step();
      out.flash = { fired: summons.indexOf(S.a) < 0, bossHp: S.b.hp === hp0 };
      summons = []; projectiles = []; items = []; running = false; return out;
    })()`);
    expect(r.erase).toEqual({ fired: true, wiped: true, yoyle: 3, bossHp: true });
    expect(r.rewind).toEqual({ fired: true, healed: 10, bossHp: true });
    expect(r.steal).toEqual({ bossHp: true });
    expect(r.flash).toEqual({ fired: true, bossHp: true });
  });

  it('Black Hole chips a boss but does not drag it; Stapy hits a boss but does not pin it', () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
      BOSSRUSH = { active:false, bossIdx:6, cleared:0, defeated:false, loop:0, dmgMult:1 };
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), WW*0.5 + 200, groundY()-24, 0);
      f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
      spawnBossRushBoss(); var b = summons.find(function(s){ return s.type==='boss'; }); b._atkTimer = 1e9;
      step(); f.pct = 0; f.x = WW*0.5 + 200;
      // Control first: a stationary boss shifts toward his target's side on his own, so "not dragged" is measured
      // against where he walks with no Black Hole at all. Then the hole, held 150px on his OTHER side as he walks (it
      // chases him otherwise, and he would walk out of its 320px): a pull would haul him left of that walk; the chip's
      // shove (damageSummons) only nudges him the other way.
      var bx0 = b.x, hp0 = b.hp;
      for (var i=0;i<180;i++){ step(); b._atkTimer = 1e9; f.x = WW*0.5 + 200; f.vx = 0; }
      var control = b.x - bx0; b.x = bx0; b.vx = 0;
      var a = summonAssistNamed(f, ASSIST_ROSTER.find(function(x){ return x.act==='pull'; }));
      for (var j=0;j<180;j++){ step(); b._atkTimer = 1e9; f.x = WW*0.5 + 200; f.vx = 0; if (summons.indexOf(a) >= 0){ a.x = b.x - 150; a.vx = 0; } }
      var out = { chip: hp0 - b.hp, control: control, withHole: b.x - bx0 };
      summons = [b]; f.x = b.x + 120;   // the boss stays; Stapy is summoned beside him
      var s = summonAssistNamed(f, ASSIST_ROSTER.find(function(x){ return x.act==='staple'; }));
      hp0 = b.hp; step(); b._atkTimer = 1e9;
      out.staple = hp0 - b.hp; out.rooted = !!b.rooted;
      summons = []; running = false; return out;
    })()`);
    expect(r.chip, 'the chip, once a second of its three').toBeGreaterThanOrEqual(2);
    expect(r.chip).toBeLessThanOrEqual(3);
    expect(r.withHole, 'the boss was not dragged toward the hole').toBeGreaterThanOrEqual(r.control - 5);
    expect(r.staple).toBe(4);
    expect(r.rooted).toBe(false);
  });
});

describe('a normal match is untouched', () => {
  it('with no boss on the stage an assist has no summon foes, and its hits on fighters are what they were', () => {
    const r = W.eval(`(function(){
      var out = {};
      ['rush', 'crush', 'bounce', 'staple', 'vortex', 'cart', 'bolt', 'mines', 'pull'].forEach(function(act){
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
        worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
        var A = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 400, groundY()-24, 0);
        var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 470, groundY()-24, 1);
        A.team=0; D.team=1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9; fighters=[A,D];
        step(); A.pct=0; D.pct=0; A.invuln=0; D.invuln=0;
        var a = summonAssistNamed(A, ASSIST_ROSTER.find(function(x){ return x.act===act; }));
        // Blender opens at centre stage, so Pen stands in it; the ball comes down about 400px out, so Pen stands there
        var px = act==='vortex' ? a.x + 40 : act==='bounce' ? 400 + 400*A.face : 470; D.x = px;
        var foes = assistFoes(a).length, first = 0;
        for (var i=0;i<360 && !first;i++){ step(); D.invuln = 0; D.dead = false; if (D.pct > 0) first = +D.pct.toFixed(3); D.x = px; D.vx = 0; D.y = groundY()-24; D.vy = 0; }
        out[act] = { foes: foes, first: first, stamped: '_assistHitT' in D };
      });
      summons = []; projectiles = []; running = false; return out;
    })()`);
    for (const act of Object.keys(r)) {
      expect(r[act].foes, `${act}: no summon foes in a normal match`).toBe(0);
      expect(r[act].stamped, `${act}: a fighter is never gap-stamped`).toBe(false);
    }
    // the numbers each act has always dealt a fighter
    expect(r.rush.first).toBe(10);
    expect(r.crush.first).toBe(14);
    expect(r.bounce.first).toBe(6);
    expect(r.staple.first).toBe(4);
    expect(r.vortex.first).toBe(3);
    expect(r.bolt.first).toBe(8);
    expect(r.mines.first).toBe(18);
    expect(r.cart.first).toBeGreaterThan(0);
  });
});
