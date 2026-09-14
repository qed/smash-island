import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "nerf the turrets accuracy on tb."
//
// Tennis Ball's turret aimed with atan2 and never missed. Each shot now carries an aiming error that
// grows with range, drawn from the game's own seeded RNG, and the smash-built turret shoots tighter.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

/** Plant a turret, park a still target `dist` px away, and count hits over `shots` shots. */
const volley = (dist, shots, strong = false) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name==='Tennis Ball'; }), 300, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 300+26+${dist}, groundY()-24, 1);
  A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; D.stocks=99; fighters=[A,D]; step();
  A.spCd=0; A.atkCd=0; A._gadget='turret'; D.invuln=0; D.hurt=null;
  ${strong ? 'doSmash(A, 1);' : 'doSpecial(A);'}
  var T = projectiles.filter(function(p){ return p.turret; })[0];
  T.turret.shots = ${shots}; T.life = 100000; T.turret.every = 30;
  var hits = 0, last = 0, fired = 0, aims = [];
  var _add = addProj; addProj = function(p){ if (p.shape==='gadgetShot'){ fired++; aims.push(Math.atan2(p.vy, p.vx)); } return _add(p); };
  try { for (var i=0; i<${shots}*30+40; i++){ D.x = 300+26+${dist}; D.vx = 0; D.vy = 0; D.invuln = 0; D.hitstun = 0; step(); if (D.pct > last + 0.001){ hits++; last = D.pct; } } }
  finally { addProj = _add; }
  var mean = aims.reduce(function(a,b){ return a+b; }, 0) / (aims.length||1);
  var sd = Math.sqrt(aims.reduce(function(a,b){ return a+(b-mean)*(b-mean); }, 0) / (aims.length||1));
  return { fired: fired, hits: hits, aimSd: sd, spread: (TURRET_SPREAD + TURRET_SPREAD_PER_PX*${dist}) * (T.turret.spreadK||1) };
})()`);

describe('the turret misses now', () => {
  it('at range, a good share of its shots go wide; up close, most land', () => {
    const far = volley(400, 40), near = volley(110, 40);
    expect(far.fired).toBe(40);
    expect(far.hits / far.fired, `hit rate at 400px: ${far.hits}/${far.fired}`).toBeLessThan(0.7);
    expect(far.hits, 'but it is not blind').toBeGreaterThan(3);
    expect(near.hits / near.fired, `hit rate at 110px: ${near.hits}/${near.fired}`).toBeGreaterThan(0.8);
  });

  it('the error is real and grows with range', () => {
    const far = volley(400, 40), near = volley(110, 40);
    expect(far.aimSd, 'aim varies shot to shot at range').toBeGreaterThan(0.05);
    expect(far.spread).toBeGreaterThan(near.spread);
    expect(far.aimSd).toBeGreaterThan(near.aimSd);
  });

  it('the smash-built turret shoots tighter than the special-built one', () => {
    const weak = volley(400, 40, false), strong = volley(400, 40, true);
    expect(strong.spread).toBeLessThan(weak.spread);
    expect(strong.hits).toBeGreaterThanOrEqual(weak.hits);
  });
});
