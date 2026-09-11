import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// ANGLED SMASHES.
//
// Holding up or down as a smash goes off tilts its launch -- up steeper, down flatter -- without changing
// how hard it hits. While a smash is charging, up aims instead of jumping, and that press is used up so
// releasing the smash does not throw in a jump the player never asked for.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

/** Coiny's slap lunge into a standard 24px dummy at 50%; return the launch it gives. */
const launch = (angle) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Golf Ball'; }), 460, groundY()-24, 1);
  A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; fighters=[A,D]; step();
  A.invuln=0; D.invuln=0; A.atkCd=0; D.pct=50; D.hurt=null; D.vx=0; D.vy=0;
  A._smAngle=${angle}; A._smAngleT=${angle ? 24 : 0};
  doSmash(A, 1);
  return { vx: D.vx, vy: D.vy, speed: Math.hypot(D.vx, D.vy) };
})()`);

describe('the tilt', () => {
  it('up launches steeper than neutral, and down flatter', () => {
    const up = launch(1), mid = launch(0), dn = launch(-1);
    const steep = (v) => -v.vy / Math.abs(v.vx);
    expect(mid.speed, 'the neutral smash has to connect for this to mean anything').toBeGreaterThan(0);
    expect(steep(up)).toBeGreaterThan(steep(mid));
    expect(steep(mid)).toBeGreaterThan(steep(dn));
  });

  it('keeps the launch strength -- only the direction moves', () => {
    const up = launch(1), mid = launch(0), dn = launch(-1);
    // the pct term knock() adds is vertical and identical for all three, so allow a little slack
    expect(Math.abs(up.speed - mid.speed) / mid.speed).toBeLessThan(0.12);
    expect(Math.abs(dn.speed - mid.speed) / mid.speed).toBeLessThan(0.12);
  });

  it('still sends them away from the attacker, however it is angled', () => {
    for (const a of [1, 0, -1]) expect(launch(a).vx, `angle ${a}`).toBeGreaterThan(0);
  });
});

describe('the input', () => {
  const drive = () => W.eval(`(function(){
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
    worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
    var A = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 400, groundY()-24, 0);
    var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 700, groundY()-24, 1);
    A.team=0; D.team=1; A.face=1; A.controller='local'; A.you=true; D.controller='still'; fighters=[A,D];
    for (var k in down) delete down[k];
    step(); A.atkCd=0; A.smashHold=0; A._jp=false;
    var y0 = A.y, rose = false, angle = null, roseAfter = false;
    down[KEYS.smash] = true;
    for (var i=0;i<14;i++){ if (i===3) down[KEYS.jump] = true; step(); if (A.y < y0 - 4) rose = true; }
    down[KEYS.smash] = false; step(); angle = A._smAngle;           // released with up still held
    for (var j=0;j<10;j++){ step(); if (A.vy < -4) roseAfter = true; }
    down[KEYS.jump] = false;
    return { rose: rose, angle: angle, roseAfter: roseAfter };
  })()`);

  it('holding up while charging aims the smash instead of jumping', () => {
    const r = drive();
    expect(r.rose, 'jumped while charging').toBe(false);
    expect(r.angle, 'released with up held').toBe(1);
  });

  it('the aiming press is used up, so no jump fires after the smash', () => {
    expect(drive().roseAfter).toBe(false);
  });
});
