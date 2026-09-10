import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// HOMING, AS A FLAG RATHER THAN A BESPOKE BODY.
//
// Blocky's anvil always found you: the hand-written body scanned for the nearest fighter and
// dropped on their x. Moving him onto the shared `rain` pattern lost that, because `rain` placed
// its drop at a fixed `face * at` offset and the vocabulary had no way to say "aim this".
//
// `seek: <px>` says it. A row without it is unchanged, which is the property that matters most
// here -- every other rain row was authored against the fixed-offset behaviour.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

/** Smash with `name` while a dummy stands `dist` px away; report where the drop actually landed. */
function dropX(w, name, dist) {
  return w.eval(`
    (function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 400+${dist}, groundY()-24, 1);
      A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still';
      A.stocks=9; D.stocks=9; fighters=[A,D];
      step(); A.invuln=0; A.atkCd=0;
      projectiles.length = 0;
      doSmash(A, 1);
      var xs = projectiles.map(function(p){ return Math.round(p.x); });
      return { selfX: A.x, targetX: D.x, drops: xs };
    })()`);
}

describe('rain can be told to aim', () => {
  it("puts Blocky's anvil on the target, not at a fixed offset", () => {
    const r = dropX(W, 'Blocky', 160);
    expect(r.drops.length, 'the anvil should exist').toBeGreaterThan(0);
    // `at` is 90, so a fixed-offset drop would land ~490. Homing puts it on the dummy at 560.
    expect(Math.abs(r.drops[0] - r.targetX), 'should land on the target').toBeLessThan(12);
    expect(Math.abs(r.drops[0] - (r.selfX + 90)), 'should NOT be the fallback offset').toBeGreaterThan(40);
  });

  it('follows the target rather than repeating one distance', () => {
    const near = dropX(W, 'Blocky', 60), far = dropX(W, 'Blocky', 190);
    expect(far.drops[0] - near.drops[0], 'the drop should move with the target').toBeGreaterThan(100);
  });

  it('falls back to the fixed offset when nobody is in seek range', () => {
    // seek is 220px; at 400 away the dummy is out of range and the offset takes over.
    const r = dropX(W, 'Blocky', 400);
    expect(Math.abs(r.drops[0] - (r.selfX + 90)), 'should be the plain offset').toBeLessThan(12);
  });

  it('leaves a rain row without seek exactly as it was', () => {
    // Yellow Face's buynow was authored against the fixed offset and declares no seek.
    expect(W.eval("SMASH_SPEC['buynow'].seek === undefined")).toBe(true);
    const r = dropX(W, 'Yellow Face', 150);
    const at = W.eval("SMASH_SPEC['buynow'].at");
    expect(Math.abs(r.drops[0] - (r.selfX + at)), 'unchanged by the new flag').toBeLessThan(12);
  });
});
