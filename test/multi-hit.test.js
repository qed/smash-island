import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// DAMAGE TO 0.1, AND MULTI-HIT JABS.
//
// "add a new degree of precision to damage: 0.1. this should buff some characters by adding multihitting."
// The engine always carried fractional damage; the HUD rounded it away. Now the HUD shows a decimal, and
// a profile row may declare multi:{hits, every}: the jab lands its first hit, then the rest at `every`
// frames, each landing through the grace its own earlier hit opened -- the designed multi-hit path, not
// the chain window. A hit on the attacker cancels the rest. Puffball's jab is a shot, so hers ticks on
// the target instead. The buffs went to the eight fighters a 128-match tournament ranked 0-for-8.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const jab = (name, frames = 30, hitBack = -1) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 436, groundY()-24, 1);
  A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; fighters=[A,D]; step();
  A.invuln=0; D.invuln=0; A.atkCd=0; D.pct=0; D.hurt=null;
  var P = rangeProfile(A), hits = 0, last = 0;
  doAttack(A);
  for (var i=0;i<${frames};i++){
    if (i === ${hitBack}) applyHit(A, 3, -2, -1, D);        // the target hits back mid-jab
    D.x = 436; D.vx = 0; D.vy = 0;
    step();
    if (D.pct > last + 0.001){ hits++; last = D.pct; }
  }
  return { hits: hits, pct: +D.pct.toFixed(2), rowDmg: P.dmg, multi: P.multi || null, left: !!A._multi };
})()`);

describe('a multi-hit jab', () => {
  it("lands every hit it declares, through the target's own grace, and its damage adds to hits x dmg", () => {
    const r = jab('Needle');
    expect(r.multi, 'Needle declares a multi').toEqual({ hits: 3, every: 4 });
    expect(r.hits).toBe(3);
    expect(r.pct).toBeCloseTo(3 * r.rowDmg, 1);
    expect(r.left, 'nothing queued once the last hit has landed').toBe(false);
  });

  it('is cut short when the attacker is hit', () => {
    const r = jab('Needle', 30, 2);
    expect(r.hits).toBeLessThan(3);
    expect(r.left).toBe(false);
  });

  it('a plain jab is still one hit', () => {
    const r = jab('Coiny');
    expect(r.multi).toBe(null);
    expect(r.hits).toBe(1);
  });
});

describe('the eight', () => {
  const ROWS = { Needle: [3, 1.5], Gelatin: [3, 2.8], Woody: [3, 3.1], 'Barf Bag': [2, 5.2], Toothpaste: [2, 5.7], Bubble: [3, 2.1], Grassy: [3, 2.2] };
  for (const [name, [hits, dmg]] of Object.entries(ROWS)) {
    it(`${name}: ${hits} x ${dmg}`, () => {
      const r = jab(name, 40);
      expect(r.multi && r.multi.hits).toBe(hits);
      expect(r.rowDmg).toBe(dmg);
      expect(r.hits).toBe(hits);
      expect(r.pct).toBeCloseTo(hits * dmg, 1);
    });
  }

  it("Puffball's puff ticks three times where it lands", () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Puffball'; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 520, groundY()-24, 1);
      A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; fighters=[A,D]; step();
      A.invuln=0; D.invuln=0; A.atkCd=0; D.pct=0; D.hurt=null;
      var hits=0, last=0; doAttack(A);
      for (var i=0;i<60;i++){ D.x=520; D.vx=0; D.vy=0; step(); if (D.pct > last + 0.001){ hits++; last=D.pct; } }
      return { hits: hits, pct: +D.pct.toFixed(2), chain: D._chain||0 };
    })()`);
    expect(r.hits).toBe(3);
    expect(r.pct).toBeCloseTo(6.0, 1);
    expect(r.chain, 'ticks are damage over time, not chain links').toBe(0);
  });
});

describe('the HUD', () => {
  it('shows damage to a tenth', () => {
    const txt = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; beginMatchNow();
      fighters[0].pct = 37.46; updateHUD();
      var el = document.querySelector('.pcard[data-i="0"] .pct'); return el ? el.textContent : null;
    })()`);
    expect(txt).toBe('37.5%');
  });
});
