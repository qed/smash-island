import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// SMASHES HAVE A COOLDOWN NOW.
//
// Two bugs sat on top of each other. The release branch fired whenever smashHold cleared the
// 6-frame floor with no atkCd gate at all, so a player could tap out a smash roughly every seven
// frames; and `f.atkCd = full ? 30 : 18` ran AFTER doSmash, overwriting the cost runSmashSpec had
// just applied — so every cost:{cd:48|54|56|74} in SMASH_SPEC had never done anything. Together
// that let multi-hit smashes be spammed into 50-100% in one exchange.
//
// Same family as the two already in the ledger: the dead `c*` charge terms, and `back` being
// overwritten by whichever pattern set velocity.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

/** Hold the smash key for `hold` frames, release, repeat — and count how many actually fired. */
function tapSmash(w, name, { hold = 8, gap = 2, bursts = 3 } = {}) {
  return w.eval(`
    (function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 460, groundY()-24, 1);
      A.team=0; D.team=1; A.face=1; D.controller='still'; A.controller='local'; A.you=true;
      A.stocks=9; D.stocks=9; fighters=[A,D];
      for (var k in down) delete down[k];
      step(); A.invuln=0; A.atkCd=0; A.spCd=0; A.smashHold=0;

      // Sample atkCd once per FRAME, not inside the doSmash wrapper: the endlag is assigned by the
      // caller after doSmash returns, so a legacy body with no cost still reads 0 from in there.
      var fires=0, peakCd=0;
      var _ds=doSmash; doSmash=function(f,c){ fires++; return _ds(f,c); };
      var tick=function(){ step(); peakCd=Math.max(peakCd, A.atkCd); };
      try {
        for (var b=0; b<${bursts}; b++){
          down[KEYS.smash]=true;  for (var i=0;i<${hold};i++) tick();
          down[KEYS.smash]=false; for (var j=0;j<${gap};j++) tick();
        }
      } finally { doSmash=_ds; }
      return { fires: fires, peakCd: peakCd, atkCd: A.atkCd };
    })()`);
}

describe('a smash cannot be tapped out on repeat', () => {
  it('fires once across three rapid taps, not three times', () => {
    // 8 frames held clears SMASH_FLOOR (6) so each burst is a legal TAP. Before the gate all three
    // landed; the tap endlag alone is 18 frames, so only the first may.
    const r = tapSmash(W, 'Money');
    expect(r.fires).toBe(1);
  });

  it('lets the next one through once the cooldown has actually run out', () => {
    const r = tapSmash(W, 'Money', { hold: 8, gap: 40, bursts: 3 });
    expect(r.fires).toBe(3);
  });
});

describe('a declared smash cost survives the endlag assignment', () => {
  it('honours cost.cd instead of overwriting it with the flat 18/30', () => {
    // Fries declares cost:{cd:56}. The endlag for a tap is 18 and for a full charge 30, so if the
    // cost is being clobbered this comes back as one of those instead.
    const spec = W.eval("SMASH_SPEC['fry'] && SMASH_SPEC['fry'].cost && SMASH_SPEC['fry'].cost.cd");
    expect(spec, 'Fries should still declare a cd cost').toBe(56);
    const r = tapSmash(W, 'Fries', { hold: 8, gap: 2, bursts: 1 });
    expect(r.peakCd).toBeGreaterThanOrEqual(spec);
  });

  it('still applies the plain endlag to a legacy body that declares no cost', () => {
    // Puffball is one of the 15 the smash rebuild never reached: no SMASH_SPEC entry, so no cost,
    // so the tap endlag is all there is.
    expect(W.eval("SMASH_SPEC['fly'] === undefined")).toBe(true);
    const r = tapSmash(W, 'Puffball', { hold: 8, gap: 2, bursts: 1 });
    expect(r.peakCd).toBe(18);
  });
});
