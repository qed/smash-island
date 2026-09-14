import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "change Grassy, and remote." -- "doesnt grassy have something going for him in tpot? also, remote
// uses batteries."
//
// Grassy: in TPOT 16-17 he pilots Tree's body. His special is GRASSTREE: up a tree for GRASSTREE_FRAMES,
// armoured, a tree's reach and weight behind every swing, slower. Remote: a battery-powered remote who
// would die without batteries, and spent half an episode unconscious without one. Her special is
// BATTERY SWAP: she hurls her battery (heavy, bouncing, it stuns) and runs on reserve power -- slower, no
// specials -- until a fresh one clicks in. Their kit keys were renamed with them (`mower` -> `grasstree`,
// `hack` -> `battery`); the last test keeps every table agreeing on that.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const setup = (aName, dist = 80) => `
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(aName)}; }), 400, groundY()-24, 0);
  var E = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 400+${dist}, groundY()-24, 1);
  A.team=0; E.team=1; A.face=1; [A,E].forEach(function(f){ f.controller='still'; f.invuln=0; f.spCd=0; f.atkCd=0; });
  fighters=[A,E]; step(); A.invuln=0; E.invuln=0; E.hurt=null; E.pct=0;`;

describe("Grassy's Grasstree", () => {
  it('puts him up a tree: armoured every frame, heavier and longer swings, slower, until it wears off', () => {
    const r = W.eval(`(function(){ ${setup('Grassy', 36)}
      var jabOff = (function(){ E.pct = 0; E.invuln = 0; doAttack(A); for (var i=0;i<20;i++){ E.x=436; E.vx=0; E.vy=0; step(); } return E.pct; })();
      A.atkCd = 0; doSpecial(A);
      var on = A._grasstree > 0, armor = 0;
      for (var j=0;j<10;j++){ step(); if (A.armor > 0) armor++; }
      var jabOn = (function(){ E.pct = 0; E.invuln = 0; E.hitstun = 0; A.atkCd = 0; doAttack(A); for (var i=0;i<20;i++){ E.x=436; E.vx=0; E.vy=0; step(); } return E.pct; })();
      A.vx = 40; step(); var vx = Math.abs(A.vx);
      var frames = GRASSTREE_FRAMES; for (var k=0;k<frames+5;k++) step();
      return { on: on, armorFrames: armor, jabOff: jabOff, jabOn: jabOn, vx: vx, cap: MAXVX*0.85, off: A._grasstree, err: null };
    })()`);
    expect(r.on).toBe(true);
    expect(r.armorFrames, 'armoured on every frame up the tree').toBe(10);
    expect(r.jabOn, `the jab hits harder up the tree: ${r.jabOn} vs ${r.jabOff}`).toBeGreaterThan(r.jabOff * 1.2);
    expect(r.vx, 'and he walks').toBeLessThanOrEqual(r.cap + 0.01);
    expect(r.off, 'it wears off').toBe(0);
  });

  it('draws with a tree behind him without throwing', () => {
    const err = W.eval(`(function(){ ${setup('Grassy', 200)}
      doSpecial(A); step();
      try { drawFighter(A); return null; } catch(e){ return e.message; }
    })()`);
    expect(err).toBe(null);
  });
});

describe("Remote's Battery Swap", () => {
  it('hurls a battery that stuns, and leaves her on reserve power: slower, no specials, until it clicks in', () => {
    const r = W.eval(`(function(){ ${setup('Remote', 120)}
      doSpecial(A);
      var shot = projectiles.filter(function(p){ return p.shape==='battery'; })[0];
      var out = A._noBattery > 0, t0 = A._noBattery;
      var stunned = 0;
      for (var i=0;i<60;i++){ E.x=520; E.vx=0; E.vy=0; step(); if (E.hitstun >= 30) stunned = Math.max(stunned, E.hitstun); }
      A.spCd = 0; projectiles = []; fireSpecial(A, {});
      var blocked = { spCd: A.spCd, shots: projectiles.length };
      A.vx = 40; step(); var vx = Math.abs(A.vx);
      var pct0 = A.pct = 20; for (var k=0;k<BATTERY_OUT+5;k++) step();
      var back = A._noBattery, healed = pct0 - A.pct;   // read before the next throw resets both
      A.spCd = 0; projectiles = []; fireSpecial(A, {});
      return { shot: !!shot, bounce: !!(shot && shot.bounce), fx: shot && shot.fxTag, out: out, frames: t0, stunned: stunned, blocked: blocked,
               vx: vx, cap: MAXVX*0.75, back: back, healed: healed, afterSpCd: A.spCd, bo: BATTERY_OUT };
    })()`);
    expect(r.shot).toBe(true);
    expect(r.bounce).toBe(true);
    expect(r.fx).toBe('stun');
    expect(r.out).toBe(true);
    expect(r.frames).toBe(r.bo);
    expect(r.stunned, 'the battery stuns what it hits').toBeGreaterThanOrEqual(30);
    expect(r.blocked.spCd, 'no special on reserve power: nothing fired, no cooldown spent').toBe(0);
    expect(r.blocked.shots).toBe(0);
    expect(r.vx, 'reserve power is slow').toBeLessThanOrEqual(r.cap + 0.01);
    expect(r.back, 'a fresh battery clicks in').toBe(0);
    expect(r.healed, 'and recharges a little').toBeGreaterThan(0);
    expect(r.afterSpCd, 'specials work again').toBeGreaterThan(0);
  });
});

describe('the renames', () => {
  it('no table still knows mower or hack, and every table knows grasstree and battery', () => {
    const r = W.eval(`(function(){
      var tables = { RANGE_PROFILE: RANGE_PROFILE, SMASH_SPEC: SMASH_SPEC, UPSPEC: UPSPEC, SMASH_ID: SMASH_ID, PROJ_SHAPE: PROJ_SHAPE };
      var out = {};
      Object.keys(tables).forEach(function(n){ var t = tables[n]; out[n] = { old: [!!t.mower, !!t.hack], now: [!!t.grasstree, !!t.battery] }; });
      out.kits = ROSTER.filter(function(f){ return f.kit && (f.kit.special==='mower' || f.kit.special==='hack'); }).map(function(f){ return f.name; });
      out.grassy = ROSTER.find(function(f){ return f.name==='Grassy'; }).kit.special;
      out.remote = ROSTER.find(function(f){ return f.name==='Remote'; }).kit.special;
      out.smashName = SMASH_ID.grasstree.name;
      return out;
    })()`);
    expect(r.kits).toEqual([]);
    expect(r.grassy).toBe('grasstree');
    expect(r.remote).toBe('battery');
    expect(r.smashName).toBe('Overgrowth');
    for (const n of ['RANGE_PROFILE', 'SMASH_SPEC', 'UPSPEC', 'SMASH_ID', 'PROJ_SHAPE']) {
      expect(r[n].old, `${n} still has an old key`).toEqual([false, false]);
      expect(r[n].now, `${n} is missing a new key`).toEqual([true, true]);
    }
  });

  it('both have a status icon', () => {
    const keys = W.eval('STATUS_ICONS.map(function(s){ return s.key; })');
    expect(keys).toContain('grasstree');
    expect(keys).toContain('reserve');
  });
});
