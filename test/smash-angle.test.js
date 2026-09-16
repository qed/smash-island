import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// ANGLED SMASHES.
//
// Holding up or down as a smash goes off tilts its launch -- up steeper, down flatter -- without changing
// how hard it hits. Since "if you angle it, you can also wait and see when you come down and THEn fire it", holding
// up or down once the charge is full keeps the smash waiting, and letting go fires it at the angle that was held. Charging does not take the jump away: an earlier version made up aim instead of jump
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
    var fires = 0, _ds = doSmash; doSmash = function(f){ if (f===A) fires++; return _ds.apply(this, arguments); };
    try {
      for (var j=0;j<48;j++) step();                               // charged, and up still held: it waits
      var waiting = !!A._smQ && fires === 0;
      down[KEYS.jump] = false; step();                             // let go of up: it goes off
      angle = A._smAngle;
    } finally { doSmash = _ds; }
    return { rose: rose, held: held, angle: angle, waiting: waiting, fires: fires, fired: fires === 1 };
  })()`);

  it('you can still jump while a smash is charging', () => {
    const r = drive();
    expect(r.rose, 'pressing jump mid-charge should jump').toBe(true);
    expect(r.held, 'and the charge should keep building through the jump').toBeGreaterThan(8);
  });

  it('once charged, holding up keeps it waiting; letting go fires it, angled up', () => {
    const r = drive();
    expect(r.waiting, 'charged and up held: still waiting 48 frames later').toBe(true);
    expect(r.fired, 'letting go of up is what fires it').toBe(true);
    expect(r.angle, 'at the angle that was held').toBe(1);
  });

  it('it will not wait forever, and the AI never waits', () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var out = {};
      ['local','ai'].forEach(function(ctrl){
        var A = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 400, groundY()-24, 0);
        var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 900, groundY()-24, 1);
        A.team=0; D.team=1; A.controller='still'; D.controller='still'; fighters=[A,D]; step(); A.atkCd=0;
        A.controller = ctrl; A._smQ = { angle:0, wait:0 }; A.smashHold = smashFullOf(A);
        var fired = -1, _ds = doSmash; doSmash = function(f){ if (f===A && fired<0) fired = i; return _ds.apply(this, arguments); };
        var _ai = aiThink; if (ctrl==='ai') aiThink = function(){ return { down:true, smash:false }; };
        for (var k in down) delete down[k];
        down[KEYS.down] = true;
        try { for (var i=0; i<200 && fired<0; i++){ if (ctrl==='local') down[KEYS.down] = true; step(); } }
        finally { doSmash = _ds; aiThink = _ai; for (var k2 in down) delete down[k2]; }
        out[ctrl] = { fired: fired, angle: A._smAngle };
      });
      return { out: out, max: SMASH_WAIT_MAX };
    })()`);
    expect(r.out.local.fired, 'a player holding down waits, but only up to SMASH_WAIT_MAX').toBeGreaterThanOrEqual(r.max - 1);
    expect(r.out.local.fired).toBeLessThanOrEqual(r.max + 2);
    expect(r.out.local.angle, 'and it goes off angled down').toBe(-1);
    expect(r.out.ai.fired, 'the AI does not wait').toBeLessThanOrEqual(1);
  });
});
