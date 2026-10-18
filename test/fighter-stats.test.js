import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';
import { loadMonolith } from './helpers/load-monolith.js';

// FIGHTER STATS (the owner, 2026-10-18: "add it, bcs its just a system extension"; earlier: "maybe you can change raw stats instead
// of moves"). Five per-fighter multipliers beside WEIGHT -- run, air, jump, fall, dmg -- all 1 by default (FIGHTER_STATS). These pin:
//   * at 1 a fighter runs, drifts, jumps, falls and hits exactly as the shared numbers say (MAXVX, JUMP, GRAV, FF_V, the hit's damage);
//   * each one at 1.1 moves its own quantity by about 1.1 and leaves every other one exactly as it was;
//   * the run multiplies Capture the Flag's 1.5x (and a carrier's jump), never replaces it;
//   * dmg reaches everything a hit breaks or hurts (a boss through Chain Bolt, its tongue, the Smash Ball, a turret, an infected
//     fighter's own rebound), a running jump keeps the run's speed, the CPU's Capture the Flag look-ahead jumps as the fighter
//     really does, and a move's words state the hit as it lands (review fixes).
// (Every bot golden staying identical, test/bot-playbooks.test.js, is the proof that the defaults change nothing anywhere else.)

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// A flat field with nothing on it: Pen (no odd air rules) for the player, Pencil to be hit. `stats` go on Pen's own block.
const measure = (stats = {}) => JSON.parse(W.eval(`(function(){
  var setup = function(){
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true; TESTMODE.active=false;
    stage = Object.assign({}, STAGES[0], { plats:[], hazard:null }); worldPlats=[];
    summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
    var mk=function(n,x,i){ return makeFighter(ROSTER.find(function(r){return r.name===n;}), x, groundY()-24, i); };
    var A = mk('Pen', 150, 0), D = mk('Pencil', 900, 1);
    Object.assign(A.st, ${JSON.stringify(stats)});
    A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='local'; A.you=true; D.controller='still'; A.stocks=9; D.stocks=9;
    fighters=[A,D]; for (var k in down) delete down[k]; step(); step();
    fighters.forEach(function(f){ f.invuln=0; f.hitstun=0; f.atkCd=0; f.spCd=0; f.vx=0; f.vy=0; f.pct=0; });
    return A;
  };
  var out = {}, A, i, ymin;
  // RUN: the top speed held on the ground
  A = setup(); down[KEYS.right]=true; out.run=0;
  for (i=0;i<30;i++){ step(); if (A.onground) out.run=Math.max(out.run, Math.abs(A.vx)); } down[KEYS.right]=false;
  // AIR: the top drift speed, high in the air
  A = setup(); A.y = groundY()-420; A.vy=0; A.onground=false; down[KEYS.right]=true; out.air=0;
  for (i=0;i<20;i++){ step(); if (!A.onground) out.air=Math.max(out.air, Math.abs(A.vx)); } down[KEYS.right]=false;
  // JUMP: the launch (the jump frame's speed, before that frame's gravity) and the rise of a held jump
  A = setup(); var y0 = A.y; down[KEYS.jump]=true; step(); out.jumpV = A.vy - GRAV; ymin = A.y;
  for (i=0;i<80 && A.vy<=0;i++){ step(); ymin=Math.min(ymin, A.y); } down[KEYS.jump]=false; out.rise = y0 - ymin;
  // the same jump by the engine's own rule (vy = JUMP, then gravity), for the default
  var v=JUMP, y=y0, ym=y0; for (i=0;i<80 && v<=0;i++){ v+=GRAV; y+=v; ym=Math.min(ym, y); } out.riseRule = y0 - ym;
  // FALL: the speed after 20 frames falling, and the fast fall
  A = setup(); A.y = groundY()-420; A.vy=0.01; A.onground=false; for (i=0;i<20;i++) step(); out.fall = A.vy;
  v=0.01; for (i=0;i<20;i++) v+=GRAV; out.fallRule = v;
  A = setup(); A.y = groundY()-420; A.vy=1; A.onground=false; step(); down[KEYS.down]=true; step(); down[KEYS.down]=false; out.ff = A.vy;
  // DMG: a hit of 10 from Pen, and a hit of 10 from nobody (a hazard)
  A = setup(); var D = fighters[1]; applyHit(D, 10, 0, 0, A); out.dmg = D.pct;
  D.pct = 0; D.invuln = 0; D.hitstun = 0; applyHit(D, 10, 0, 0, null); out.hazard = D.pct;
  out.consts = { MAXVX:MAXVX, JUMP:JUMP, FF_V:FF_V };
  return JSON.stringify(out);
})()`));

describe('fighter stats (run, air, jump, fall, dmg)', () => {
  let base;
  beforeAll(() => { base = measure(); });

  it('default to 1 for every fighter, and the table only holds the all-1 default', () => {
    const r = JSON.parse(W.eval(`JSON.stringify({ keys:Object.keys(FIGHTER_STATS), def:FIGHTER_STATS['*'],
      off:ROSTER.filter(function(r){ var s = makeFighter(r, 0, 0, 0).st; return STAT_KEYS.some(function(k){ return s[k] !== 1; }); }).map(function(r){ return r.name; }) })`));
    expect(r.keys).toEqual(['*']);
    expect(r.def).toEqual({ run: 1, air: 1, jump: 1, fall: 1, dmg: 1 });
    expect(r.off, 'fighters whose stats are not all 1').toEqual([]);
  });

  it('at 1, a fighter runs, drifts, jumps, falls and hits by the shared numbers, exactly', () => {
    const C = base.consts;
    expect(base.run, 'run top speed = MAXVX').toBe(C.MAXVX);
    expect(base.air, 'air drift = MAXVX').toBe(C.MAXVX);
    expect(base.jumpV).toBeCloseTo(C.JUMP, 9);
    expect(base.rise, 'a held jump rises as JUMP and GRAV say').toBe(base.riseRule);
    expect(base.fall, 'falling gathers GRAV a frame').toBe(base.fallRule);
    expect(base.ff, 'the fast fall is FF_V').toBe(C.FF_V);
    expect(base.dmg, 'a 10% hit deals 10%').toBe(10);
    expect(base.hazard).toBe(10);
  });

  // each stat at 1.1: its own quantity moves by about 1.1, every other one is exactly the default's
  const OWN = { run: ['run'], air: ['air'], jump: ['jumpV', 'rise'], fall: ['fall', 'ff'], dmg: ['dmg'] };
  const QUANT = ['run', 'air', 'jumpV', 'rise', 'fall', 'ff', 'dmg', 'hazard'];
  for (const k of Object.keys(OWN)) {
    it(`${k} at 1.1 moves only its own quantity`, () => {
      const m = measure({ [k]: 1.1 });
      for (const q of QUANT) {
        if (!OWN[k].includes(q)) { expect(m[q], `${k} 1.1 left ${q} alone`).toBe(base[q]); continue; }
        const ratio = m[q] / base[q];
        if (q === 'rise') expect(ratio, 'a jump 1.1x as fast rises about 1.21x as high').toBeCloseTo(1.21, 1);
        else if (q === 'fall') expect(ratio, 'falling 20 frames').toBeCloseTo(1.1, 2);
        else expect(ratio, `${k} 1.1 -> ${q}`).toBeCloseTo(1.1, 6);
      }
    });
  }

  it('dmg reaches everything a hit breaks or hurts, once', () => {
    const r = JSON.parse(W.eval(`(function(){
      var setup = function(an, dx){
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true; TESTMODE.active=false;
        stage = Object.assign({}, STAGES[0], { plats:[], hazard:null }); worldPlats=[];
        summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; SMASHBALL=null;
        var mk=function(n,x,i){ return makeFighter(ROSTER.find(function(r){return r.name===n;}), x, groundY()-24, i); };
        var A = mk(an, 300, 0), D = mk('Pencil', dx, 1);
        A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; A.you=false; D.controller='still'; A.stocks=9; D.stocks=9;
        fighters=[A,D]; for (var k in down) delete down[k]; step(); step();
        fighters.forEach(function(f){ f.invuln=0; f.hitstun=0; f.atkCd=0; f.spCd=0; f.vx=0; f.vy=0; f.pct=0; f.countering=0; });
        return A;
      };
      var boss = function(){ return { type:'boss', name:'MePhone4', color:'#4fb8e8', team:-1, owner:-1, x:480, y:groundY()-90, vx:0, vy:0, r:85, hp:1000, maxHp:1000, life:1e9, flash:0, face:-1 }; };
      var P = {
        bolt: function(m){ var A = setup('Lightning', 2000); A.st.dmg=m; var B = boss(); summons=[B]; doSpecial(A); return 1000 - B.hp; },
        tongue: function(m){ var A = setup('Pen', 900); A.st.dmg=m; var B = boss(); B.attack='swallow'; B._tongueHp=100; A._swallow=50; summons=[B]; damageSummons(A, A.x, A.y, 40, 10); return 100 - B._tongueHp; },
        ball: function(m){ var A = setup('Pen', 900); A.st.dmg=m; SMASHBALL = { x:A.x+40, y:A.y, r:FSBALL.r, hp:100, hpMax:100, vx:0, vy:0, gr:{}, flash:0 }; fsBallHit(A, A.x+40, A.y, 30, 10); var d = 100 - SMASHBALL.hp; SMASHBALL=null; return d; },
        turret: function(m){ var A = setup('Pen', 900); A.st.dmg=m; var D = fighters[1]; var T = { turret:true, life:999, hp:100, ownerObj:D, owner:D.idx, x:A.x+40, y:A.y, r:14, _hitCd:0 }; projectiles=[T]; hitTurrets(A, A.x+40, A.y, 30, 10); return 100 - T.hp; },
        rebound: function(m){ var A = setup('Pen', 340); A.st.dmg=m; A._infected=100; applyHit(fighters[1], 10, 1, -1, A); return A.pct; }
      };
      var out = {}; for (var k in P) out[k] = [P[k](1), P[k](1.15)];
      return JSON.stringify(out);
    })()`));
    for (const [k, [a, b]] of Object.entries(r)) {
      expect(a, `${k} at 1`).toBeGreaterThan(0);
      expect(b / a, `${k}: the striker's dmg, once`).toBeCloseTo(1.15, 6);
    }
  });

  it('a running jump keeps the run\'s speed (never more), and a standing drift is still the air\'s', () => {
    const r = JSON.parse(W.eval(`(function(){
      var run = function(st){
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true; TESTMODE.active=false;
        stage = Object.assign({}, STAGES[0], { plats:[], hazard:null }); worldPlats=[]; summons=[]; projectiles=[]; items=[];
        var mk=function(n,x,i){ return makeFighter(ROSTER.find(function(r){return r.name===n;}), x, groundY()-24, i); };
        var A = mk('Pen', 150, 0), D = mk('Pencil', 1400, 1); Object.assign(A.st, st);
        A.team=0; D.team=1; A.controller='local'; A.you=true; D.controller='still'; fighters=[A,D]; for (var k in down) delete down[k]; step(); step();
        down[KEYS.right]=true; for (var i=0;i<30;i++) step(); var g = A.vx; down[KEYS.jump]=true; step(); step(); var a1 = A.vx;
        for (var i=0;i<6;i++) step(); var a2 = A.vx; down[KEYS.jump]=false; down[KEYS.right]=false;
        return { ground:g, air:a1, air8:a2, inAir:!A.onground };
      };
      return JSON.stringify({ base:run({}), fast:run({ run:1.15 }), cap:MAXVX });
    })()`));
    expect(r.base.ground).toBe(r.cap);
    expect(r.base.air).toBe(r.cap);
    expect(r.fast.inAir).toBe(true);
    expect(r.fast.ground / r.cap).toBeCloseTo(1.15, 9);
    expect(r.fast.air, 'the run\'s speed is carried off the ground').toBe(r.fast.ground);
    expect(r.fast.air8, 'and held through the airtime, never added to').toBe(r.fast.ground);
  });

  it('a hazard is not a hit: dmg does not reach it', () => {
    const m = measure({ dmg: 1.2 });
    expect(m.dmg).toBeCloseTo(12, 9);
    expect(m.hazard).toBe(10);
  });
});

describe('fighter stats stack with Capture the Flag', () => {
  it('the run multiplies the 1.5x, and the jump multiplies a carrier\'s jump', () => {
    const { window: w } = loadMonolith(3);
    w.eval(`CTF.skipNav=true; SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.forceMap='castle'; beginMatchNow();
            fighters.forEach(function(f){ f.controller='still'; f.you=false; }); ctfEndHide(CTF.live);
            var A = fighters[0]; A.controller='local'; A.you=true; for (var k in down) delete down[k];
            for (var i=0;i<20;i++) step();`);
    // the speed cap, read the frame it clamps a run held from over the top
    const cap = (run) => w.eval(`(function(){ var A = fighters[0]; A.st.run = ${run}; A.st.air = ${run}; A.hitstun=0; A.vx = 30; A.vy = 0;
      down[KEYS.right]=true; step(); down[KEYS.right]=false; var v = A.vx; A.vx = 0; for (var i=0;i<10;i++) step(); return v; })()`);
    const k = w.eval('ctfSpeedK(fighters[0])');
    expect(k, 'Capture the Flag runs at 1.5x').toBeCloseTo(w.eval('CTF_SPEED'), 9);
    const c1 = cap(1), c2 = cap(1.1);
    expect(c1).toBeCloseTo(w.eval('MAXVX') * k, 9);
    expect(c2 / c1, 'the run on top of the 1.5x').toBeCloseTo(1.1, 9);
    const j = JSON.parse(w.eval(`(function(){ var A = fighters[0]; A.st.jump = 1; var a = ctfJumpV(A); A.st.jump = 1.1; var b = ctfJumpV(A);
      var cf0 = A._cf; A._cf = 0; var c = ctfJumpV(A); A._cf = cf0; A.st.jump = 1; return JSON.stringify({ a:a, b:b, c:c, J:JUMP, CJ:CTF_CARRY_JUMP }); })()`));
    expect(j.a).toBe(j.J);
    expect(j.b).toBeCloseTo(j.J * 1.1, 9);
    expect(j.c, 'a carrier: the load and the jump stat together').toBeCloseTo(j.J * j.CJ * 1.1, 9);
    // the CPU's look-ahead (ctfNavFly with the fighter's own stats, as ctfAiPlanFly passes them) puts a jump's peak where the fighter
    // really reaches it: the prebuilt graph plans on 1, the live plan on the fighter
    const apex = JSON.parse(w.eval(`(function(){
      var A = fighters[0], nav = { M:{ WH:1e6 }, pb:{}, zb:null };
      var pred = function(){ var ym = A.y; ctfNavFly(nav, { x:A.x, y:A.y, vx:0, vy:0, jumps:2, g:true, jp:false, sp:0, fl:false }, function(t, x, y){ ym = Math.min(ym, y); return t===1 ? { dir:0, jump:true } : { dir:0 }; }, A._cf < 0, false, A._ctfJT > 0, A.st); return A.y - ym; };
      var real = function(){ var y0 = A.y, ym = A.y; A.vx=0; A.vy=0; down[KEYS.jump]=true; for (var i=0;i<45;i++){ step(); ym=Math.min(ym, A.y); } down[KEYS.jump]=false; for (var i=0;i<60;i++) step(); return y0 - ym; };
      A.st.run = 1; A.st.air = 1; A.st.jump = 1; var a = { p:pred(), r:real() };
      A.st.jump = 1.15; var b = { p:pred(), r:real() }; A.st.jump = 1;
      return JSON.stringify({ a:a, b:b });
    })()`));
    expect(apex.a.p).toBeCloseTo(apex.a.r, 0);
    expect(apex.b.p, 'jump 1.15: the look-ahead rises as high as the fighter').toBeCloseTo(apex.b.r, 0);
    expect(apex.b.r / apex.a.r).toBeGreaterThan(1.2);
  });
});

describe('fighter stats in the words', () => {
  it('a move\'s "On hit:" numbers follow the fighter\'s dmg; thresholds and other fighters stay', () => {
    const row = '"*": { "run":1, "air":1, "jump":1, "fall":1, "dmg":1 }';
    const { window: w } = loadMonolith(5, (src) => src.replace(row, row + ',\r\n  "Gelatin": { "dmg":1.2 }'));
    const r = JSON.parse(w.eval(`JSON.stringify({ k:statsFor('Gelatin').dmg, g:MOVE_TEXT.Gelatin, p:MOVE_TEXT.Pen,
      smash:smashBlurb(ROSTER.find(function(r){ return r.name==='Gelatin'; })) })`));
    expect(r.k).toBe(1.2);
    const W0 = JSON.parse(W.eval(`JSON.stringify({ g:MOVE_TEXT.Gelatin, p:MOVE_TEXT.Pen, smash:smashBlurb(ROSTER.find(function(r){ return r.name==='Gelatin'; })) })`));
    expect(r.p, 'another fighter\'s words are untouched').toEqual(W0.p);
    const nums = (l) => [...l.slice(l.indexOf('On hit:')).matchAll(/(\d+(?:\.\d+)?)%/g)].map((x) => +x[1]);
    let scaled = 0;
    for (const k of Object.keys(W0.g)) {
      const a = W0.g[k], b = r.g[k];
      if (k === 'grab') { const pn = (l) => +l.match(/\(([^,]+), (\d+(?:\.\d+)?)%\)/)[2]; expect(Math.abs(pn(b) - pn(a) * 1.2), 'the pummel in the grab line').toBeLessThanOrEqual(0.12); continue; }
      if (!/On hit:/.test(a)) { expect(b, `${k}: no hit clause, no change`).toBe(a); continue; }
      const na = nums(a), nb = nums(b);
      expect(nb.length, k).toBe(na.length);
      na.forEach((n, i) => {
        const keep = new RegExp('(above |heals? you )' + n + '%').test(a.slice(a.indexOf('On hit:')));
        if (keep) expect(nb[i], `${k}: a threshold stays`).toBe(n);
        else { expect(Math.abs(nb[i] - n * 1.2), `${k}: ${n}% -> ${nb[i]}%`).toBeLessThanOrEqual(0.12); scaled++; }
      });
    }
    expect(scaled).toBeGreaterThan(10);
    expect(W0.g.special, 'his threshold is in the special').toMatch(/above 40%/);
    expect(r.g.special).toMatch(/above 40%/);
    const sm = (l) => +l.match(/On hit: (\d+)%/)[1];
    expect(Math.abs(sm(r.smash) - sm(W0.smash) * 1.2), 'the smash line').toBeLessThanOrEqual(1);
  });
});
