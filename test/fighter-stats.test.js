import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';
import { loadMonolith } from './helpers/load-monolith.js';

// FIGHTER STATS (the owner, 2026-10-18: "add it, bcs its just a system extension"; earlier: "maybe you can change raw stats instead
// of moves"). Five per-fighter multipliers beside WEIGHT -- run, air, jump, fall, dmg -- all 1 by default (FIGHTER_STATS). These pin:
//   * at 1 a fighter runs, drifts, jumps, falls and hits exactly as the shared numbers say (MAXVX, JUMP, GRAV, FF_V, the hit's damage);
//   * each one at 1.1 moves its own quantity by about 1.1 and leaves every other one exactly as it was;
//   * the run multiplies Capture the Flag's 1.5x (and a carrier's jump), never replaces it.
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
  });
});
