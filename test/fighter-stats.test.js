import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';
import { loadMonolith } from './helpers/load-monolith.js';

// FIGHTER STATS (the owner, 2026-10-18: "add it, bcs its just a system extension"; earlier: "maybe you can change raw stats instead
// of moves"). Five per-fighter multipliers beside WEIGHT -- run, air, jump, fall, dmg -- 1 by default (FIGHTER_STATS' "*" row), and
// since "give each fighter stats" / "Character, then balance" (the owner, 2026-10-18; spread "8-12%, damage smaller", draft "Looks
// good") a row of the fighter's own for 95 of them (run, air, jump, fall within 0.88-1.12, dmg 1-1.05). These pin:
//   * at 1 a fighter runs, drifts, jumps, falls and hits exactly as the shared numbers say (MAXVX, JUMP, GRAV, FF_V, the hit's damage);
//   * each one at 1.1 moves its own quantity by about 1.1 and leaves every other one exactly as it was;
//   * the run multiplies Capture the Flag's 1.5x (and a carrier's jump), never replaces it;
//   * dmg reaches everything a hit breaks or hurts (a boss through Chain Bolt, its tongue, the Smash Ball, a turret, an infected
//     fighter's own rebound), a running jump eases down from the run's speed ("Eases down", the owner, 2026-10-18), the CPU's Capture the Flag look-ahead jumps as the fighter
//     really does, and a move's words state the hit as it lands (review fixes).
// (Pen is measured with his own row set back to 1: the shared numbers are the baseline every stat is held against.)

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// A flat field with nothing on it: Pen (no odd air rules) for the player, Pencil to be hit. Pen's block is set to all 1 and `stats`
// go on it (his own row is not what is measured here).
const measure = (stats = {}) => JSON.parse(W.eval(`(function(){
  var setup = function(){
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true; TESTMODE.active=false;
    stage = Object.assign({}, STAGES[0], { plats:[], hazard:null }); worldPlats=[];
    summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
    var mk=function(n,x,i){ return makeFighter(ROSTER.find(function(r){return r.name===n;}), x, groundY()-24, i); };
    var A = mk('Pen', 150, 0), D = mk('Pencil', 900, 1);
    A.st = Object.assign({ run:1, air:1, jump:1, fall:1, dmg:1 }, ${JSON.stringify(stats)});
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

  // Restated for "give each fighter stats" (the owner, 2026-10-18): this pinned a table holding only the all-1 default. Now the
  // default stays all 1, every row names a real fighter and stays inside the bounds, and each fighter reads its row (else 1).
  it('the default is all 1, and each fighter reads its own row, inside the bounds', () => {
    const r = JSON.parse(W.eval(`JSON.stringify({ T:FIGHTER_STATS, names:ROSTER.map(function(r){ return r.name; }),
      st:ROSTER.map(function(r){ return makeFighter(r, 0, 0, 0).st; }) })`));
    expect(r.T['*']).toEqual({ run: 1, air: 1, jump: 1, fall: 1, dmg: 1 });
    for (const [n, row] of Object.entries(r.T)) {
      if (n === '*') continue;
      expect(r.names, `${n} is a fighter`).toContain(n);
      for (const [k, v] of Object.entries(row)) {
        expect(['run', 'air', 'jump', 'fall', 'dmg'], `${n}.${k}`).toContain(k);
        if (k === 'dmg') { expect(v, `${n}.dmg`).toBeGreaterThanOrEqual(1); expect(v, `${n}.dmg`).toBeLessThanOrEqual(1.05); }
        else { expect(v, `${n}.${k}`).toBeGreaterThanOrEqual(0.88); expect(v, `${n}.${k}`).toBeLessThanOrEqual(1.12); }
      }
    }
    r.names.forEach((n, i) => { for (const k of ['run', 'air', 'jump', 'fall', 'dmg']) expect(r.st[i][k], `${n}.${k}`).toBe(r.T[n] && r.T[n][k] != null ? r.T[n][k] : 1); });
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

  // "Eases down" (the owner, 2026-10-18): a running jump with the run above the air takes off at the run's speed and eases down to
  // the air's over about half a second (RUN_EASE, 30 frames). It used to keep the run's speed for the whole airtime (this test pinned
  // that, 8 frames up). A drift against it still slows it, and with run == air nothing changes.
  it('a running jump eases down from the run\'s speed to the air\'s (never more), and run == air is unchanged', () => {
    const r = JSON.parse(W.eval(`(function(){
      var run = function(st, back){
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true; TESTMODE.active=false;
        stage = Object.assign({}, STAGES[0], { plats:[], hazard:null }); worldPlats=[]; summons=[]; projectiles=[]; items=[];
        var mk=function(n,x,i){ return makeFighter(ROSTER.find(function(r){return r.name===n;}), x, groundY()-24, i); };
        var A = mk('Pen', 150, 0), D = mk('Pencil', 1400, 1); A.st = Object.assign({ run:1, air:1, jump:1, fall:1, dmg:1 }, st);
        A.team=0; D.team=1; A.controller='local'; A.you=true; D.controller='still'; fighters=[A,D]; for (var k in down) delete down[k]; step(); step();
        down[KEYS.right]=true; for (var i=0;i<30;i++) step(); var g = A.vx;
        down[KEYS.jump]=true; step(); var tk = A.vx, up = !A.onground;   // the takeoff frame
        if (back){ down[KEYS.right]=false; down[KEYS.left]=true; }
        var vs = [], air = [];
        for (var i=0;i<34;i++){ step(); vs.push(A.vx); air.push(!A.onground); }
        for (var k in down) delete down[k];
        return { ground:g, takeoff:tk, up:up, vs:vs, air:air };
      };
      return JSON.stringify({ base:run({}), fast:run({ run:1.15 }), back:run({ run:1.15 }, true), even:run({ run:1.15, air:1.15 }), cap:MAXVX, ease:RUN_EASE });
    })()`));
    const C = r.cap, F = r.fast;
    expect(r.ease, 'about half a second').toBe(30);
    // run == air: exactly as before
    expect(r.base.takeoff).toBe(C);
    expect(r.base.vs.every((v) => v === C), 'run 1, air 1: the drift is the shared cap all the way').toBe(true);
    expect(r.even.vs.every((v) => v === r.even.takeoff), 'run 1.15, air 1.15: the speed is kept all the way').toBe(true);
    expect(r.even.takeoff / C).toBeCloseTo(1.15, 9);
    // run 1.15, air 1: takes off at the run's cap...
    expect(F.up).toBe(true);
    expect(F.ground / C).toBeCloseTo(1.15, 9);
    expect(F.takeoff, 'the takeoff speed is the run cap').toBe(F.ground);
    expect(F.vs[0], 'and the first frame in the air still carries it').toBe(F.ground);
    // ...eases down, never up and never past the run...
    for (let i = 1; i < F.vs.length; i++) expect(F.vs[i], `frame ${i + 1} in the air`).toBeLessThanOrEqual(F.vs[i - 1]);
    expect(F.vs[14], 'half way: between the two').toBeLessThan(F.ground);
    expect(F.vs[14]).toBeGreaterThan(C);
    // ...and about 30 frames later it is the air's cap (still in the air)
    expect(F.air[30]).toBe(true);
    expect(F.vs[30], '31 frames up: the air cap').toBeCloseTo(C, 9);
    expect(F.vs[33]).toBeCloseTo(C, 9);
    // a drift against it still slows it, faster than the ease alone
    expect(r.back.takeoff).toBe(F.takeoff);
    expect(r.back.vs[5], 'held back: slower than the eased run').toBeLessThan(F.vs[5] - 1);
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
    // (Gelatin's own FIGHTER_STATS row is swapped for dmg 1.2 alone; the shipped build, W, is the baseline: Gelatin ships at dmg 1)
    const { window: w } = loadMonolith(5, (src) => src.replace(/"Gelatin": \{ "(?:run|air|jump|fall|dmg)":[^}]*\}/, '"Gelatin": { "dmg":1.2 }'));
    const r = JSON.parse(w.eval(`JSON.stringify({ k:statsFor('Gelatin').dmg, g:MOVE_TEXT.Gelatin, p:MOVE_TEXT.Pen,
      smash:smashBlurb(ROSTER.find(function(r){ return r.name==='Gelatin'; })) })`));
    expect(r.k).toBe(1.2);
    const W0 = JSON.parse(W.eval(`JSON.stringify({ k0:statsFor('Gelatin').dmg, g:MOVE_TEXT.Gelatin, p:MOVE_TEXT.Pen, smash:smashBlurb(ROSTER.find(function(r){ return r.name==='Gelatin'; })) })`));
    expect(W0.k0, 'Gelatin ships at dmg 1 (this measures 1 -> 1.2)').toBe(1);
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
