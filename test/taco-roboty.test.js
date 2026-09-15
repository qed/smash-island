import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// O19's last two, from the wiki. Taco: JAWBREAKER (BFB 2-3, she was stuck inside one) -- a heavy
// bouncing ball, and whoever it hits is stuck in it; and she is HEATPROOF (Character Guide: 1,000 C),
// so a burn never ticks on her. Roboty: ANTENNA SPRING (Character Guide: his super-springy antenna
// gives his teammates lots of mobility; Balloony used it as a spring) -- foes on him go up and away,
// teammates go high with their jumps back, and he gets a little lift himself. Their salsa and morse
// stay as smashes; the keys became `jawbreaker` and `antenna` everywhere.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const setup = (aName, bName, dist = 120, dy = 0) => `
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(aName)}; }), 300, groundY()-24, 0);
  var E = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(bName)}; }), 300+${dist}, groundY()-24-${dy}, 1);
  A.team=0; E.team=1; A.face=1; E.face=-1;
  [A,E].forEach(function(f){ f.controller='still'; f.invuln=0; f.spCd=0; f.atkCd=0; f.stocks=9; });
  fighters=[A,E]; step(); A.invuln=0; E.invuln=0; A.pct=0; E.pct=0;`;

describe("Taco's Jawbreaker", () => {
  it('rolls a heavy bouncing ball that leaves a foe stuck in it', () => {
    const r = W.eval(`(function(){ ${setup('Taco', 'Leafy', 120)}
      doSpecial(A);
      var b = projectiles.filter(function(p){ return p.shape==='jawball'; })[0];
      var out = { shot: !!b, bounce: !!(b && b.bounce), hitAt: -1, rooted: 0, stuck: JAWBREAKER_STUCK };
      for (var i=0;i<90;i++){ E.x=420; E.vx=0; step(); if (out.hitAt<0 && E.pct>0){ out.hitAt=i; out.rooted=E.rooted; } }
      return out;
    })()`);
    expect(r.shot).toBe(true);
    expect(r.bounce).toBe(true);
    expect(r.hitAt, 'it reached a foe 120px out').toBeGreaterThanOrEqual(0);
    expect(r.rooted, 'stuck in the jawbreaker').toBeGreaterThanOrEqual(r.stuck - 2);
  });

  it('is heatproof: a burn never ticks on her, and still ticks on everyone else', () => {
    const r = W.eval(`(function(){ ${setup('Taco', 'Leafy', 120)}
      A.burn = 60; E.burn = 60; var a0 = A.pct, e0 = E.pct;
      for (var i=0;i<30;i++) step();
      return { tacoBurn: A.burn, tacoPct: A.pct - a0, leafyBurn: E.burn, leafyPct: E.pct - e0 };
    })()`);
    expect(r.tacoBurn).toBe(0);
    expect(r.tacoPct).toBe(0);
    expect(r.leafyBurn).toBeGreaterThan(0);
    expect(r.leafyPct).toBeGreaterThan(0);
  });
});

describe("Roboty's Antenna Spring", () => {
  it('launches a foe on him up and away, and gives a teammate height and their jumps', () => {
    const r = W.eval(`(function(){ ${setup('Roboty', 'Leafy', 30)}
      var M = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 280, groundY()-24, 2); M.team=0; M.controller='still'; M.jumps=0; M.stocks=9;
      fighters=[A,E,M]; step(); E.invuln=0; E.pct=0;
      M.jumps = 0; M.onground = false;   // the setup step landed her with 2; the spring has to be what gives them back
      doSpecial(A); var allyJumps = M.jumps;   // read before a step can land her and refresh them
      step();
      return { foeVy: E.vy, foePct: E.pct, allyVy: M.vy, allyJumps: allyJumps, allyPct: M.pct, selfVy: A.vy, cd: A.spCd };
    })()`);
    expect(r.foePct, 'a foe on the antenna is hit').toBeGreaterThan(0);
    expect(r.foeVy, 'and launched upward').toBeLessThan(-8);
    expect(r.allyVy, 'a teammate is sprung high').toBeLessThan(-10);
    expect(r.allyJumps, 'with their jumps back').toBe(2);
    expect(r.allyPct, 'and not hurt').toBe(0);
    expect(r.selfVy, 'he gets a little lift himself').toBeLessThan(-5);
    expect(r.cd).toBeGreaterThan(0);
  });
});

describe('the renames', () => {
  it('no table still knows salsa or morse, and every table knows jawbreaker and antenna', () => {
    const r = W.eval(`(function(){
      var tables = { RANGE_PROFILE: RANGE_PROFILE, SMASH_ID: SMASH_ID, SMASH_SPEC: SMASH_SPEC, UPSPEC: UPSPEC, DOWNSPECIALS: DOWNSPECIALS, PROJ_SHAPE: PROJ_SHAPE };
      var out = {};
      Object.keys(tables).forEach(function(n){ var t = tables[n]; out[n] = { old: [!!t.salsa, !!t.morse], now: [!!t.jawbreaker, !!t.antenna] }; });
      out.kits = ROSTER.filter(function(f){ return f.kit && (f.kit.special==='salsa' || f.kit.special==='morse'); }).map(function(f){ return f.name; });
      out.taco = ROSTER.find(function(f){ return f.name==='Taco'; }).kit.special;
      out.roboty = ROSTER.find(function(f){ return f.name==='Roboty'; }).kit.special;
      out.trapKit = AI_TRAP_DOWN.has('jawbreaker') && !AI_TRAP_DOWN.has('salsa');
      out.names = [SMASH_ID.jawbreaker.name, SMASH_ID.antenna.name];
      return out;
    })()`);
    expect(r.kits).toEqual([]);
    expect(r.taco).toBe('jawbreaker');
    expect(r.roboty).toBe('antenna');
    expect(r.trapKit, 'the AI trap list followed the rename').toBe(true);
    expect(r.names).toEqual(['Combo Platter', 'All Dashes']);
    for (const n of ['RANGE_PROFILE', 'SMASH_ID', 'SMASH_SPEC', 'UPSPEC', 'DOWNSPECIALS', 'PROJ_SHAPE']) {
      expect(r[n].old, `${n} still has an old key`).toEqual([false, false]);
      expect(r[n].now, `${n} is missing a new key`).toEqual([true, true]);
    }
  });
});

describe('Taco is heatproof, not poison-proof', () => {
  // Review finding: poison writes into burn's timer, so the heatproof clear cancelled poison too. It now
  // clears only the fire above the poisoned part (_poisonT), and poison ticks on her like anyone.
  it('poison ticks on her; fire applied on top of it does not', () => {
    const r = W.eval(`(function(){ ${setup('Taco', 'Leafy', 120)}
      SM_FX.poison(A, E, 60); var p0 = A.pct;
      for (var i=0;i<20;i++) step();
      var poisoned = A.pct - p0, left = A.burn;
      SM_FX.burn(A, E, 200); step(); var afterFire = A.burn;
      return { poisoned: poisoned, left: left, afterFire: afterFire, poisonT: A._poisonT };
    })()`);
    expect(r.poisoned, 'poison damage ticked').toBeGreaterThan(0.5);
    expect(r.left).toBeGreaterThan(0);
    expect(r.afterFire, 'the fire on top was cleared back to the poison').toBeLessThanOrEqual(r.poisonT + 1);
  });
});
