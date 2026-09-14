import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// ANGLED SMASHES.
//
// Holding up or down as a smash goes off tilts its launch -- up steeper, down flatter -- without changing
// how hard it hits. Charging does not take the jump away: an earlier version made up aim instead of jump
// while a smash charged, and the owner's verdict was "you cant jump while chargin a smash".

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
    var y0 = A.y, rose = false, held = 0, angle = null;
    down[KEYS.smash] = true;
    for (var i=0;i<14;i++){ if (i===3) down[KEYS.jump] = true; step(); if (A.y < y0 - 4) rose = true; if (A.smashHold > 0) held++; }
    down[KEYS.smash] = false;                                      // let go early, with up still held
    for (var j=0;j<48 && A._smQ;j++) step();                       // it fires when the charge completes
    angle = A._smAngle;
    down[KEYS.jump] = false;
    return { rose: rose, held: held, angle: angle };
  })()`);

  it('you can still jump while a smash is charging', () => {
    const r = drive();
    expect(r.rose, 'pressing jump mid-charge should jump').toBe(true);
    expect(r.held, 'and the charge should keep building through the jump').toBeGreaterThan(8);
  });

  it('up held as the smash goes off still angles it up', () => {
    expect(drive().angle).toBe(1);
  });
});
