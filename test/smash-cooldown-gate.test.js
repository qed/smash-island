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
//
// The flow package later scaled every declared cost by SMASH_CD_SCALE, so what a row DECLARES and what
// a fighter PAYS are no longer the same number. The property here is unchanged -- a declared cost still
// beats the flat endlag instead of being overwritten by it -- and the cases below read the scale rather
// than a hard-coded 56 or 60, so tuning the scale cannot quietly turn this test into a no-op.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

/** Press the smash key for `hold` frames, release, repeat; then let `settle` frames pass, because a
 *  committed smash comes out when its charge completes, up to 32 frames after the press. Count fires. */
function tapSmash(w, name, { hold = 10, gap = 2, bursts = 3, settle = 24 } = {}) {
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
      var tick=function(){ step(); peakCd=Math.max(peakCd, A.smCd); };
      try {
        for (var b=0; b<${bursts}; b++){
          down[KEYS.smash]=true;  for (var i=0;i<${hold};i++) tick();
          down[KEYS.smash]=false; for (var j=0;j<${gap};j++) tick();
        }
        for (var s2=0;s2<${settle};s2++) tick();
      } finally { doSmash=_ds; }
      return { fires: fires, peakCd: peakCd, smCd: A.smCd };
    })()`);
}

describe('a smash cannot be tapped out on repeat', () => {
  it('fires once across three rapid taps, not three times', () => {
    // 10 frames held clears every fighter's mis-press floor, so each press commits a smash. Before
    // the gate all three landed; Money's smash declares 62 frames (LEGACY_SMASH_COST) and pays 47 of
    // them after SMASH_CD_SCALE, longer than the 60 frames this takes, so only the first may come out.
    const r = tapSmash(W, 'Money');
    expect(r.fires).toBe(1);
  });

  it('lets the next one through once the cooldown has actually run out', () => {
    // The gap has to outlast her paid cost (47 frames) plus the charge, not just the flat endlag.
    const r = tapSmash(W, 'Money', { hold: 10, gap: 70, bursts: 3, settle: 40 });
    expect(r.fires).toBe(3);
  });
});

describe('a declared smash cost survives the endlag assignment', () => {
  it('honours cost.cd instead of overwriting it with the flat endlag', () => {
    // Fries declares cost:{cd:56} and pays it scaled. If the cost were being clobbered, what came back
    // would be the flat tap endlag instead -- so the test is that the paid cost still beats it.
    const spec = W.eval("SMASH_SPEC['fry'] && SMASH_SPEC['fry'].cost && SMASH_SPEC['fry'].cost.cd");
    const scale = W.eval('SMASH_CD_SCALE'), tapEndlag = W.eval('SMASH_ENDLAG');
    expect(spec, 'Fries should still declare a cd cost').toBe(56);
    const r = tapSmash(W, 'Fries', { hold: 10, gap: 2, bursts: 1, settle: 40 });
    expect(r.peakCd, 'the declared cost, scaled').toBe(Math.round(spec * scale));
    expect(r.peakCd, 'and still longer than the flat endlag it used to be overwritten by').toBeGreaterThan(tapEndlag);
  });

  it('makes a legacy body pay its declared cost, not just the flat endlag', () => {
    // Puffball keeps her own hand-written Meteor Puff rather than a SMASH_SPEC row. Rows had to
    // declare a cost; bodies like hers did not, so all she paid was the 18-frame tap endlag -- which
    // is how Money's restored three-coin smash came to be thrown twice as often as any other.
    // LEGACY_SMASH_COST prices the six of them. This case used to assert the 18; it was right about
    // the code and wrong about the game.
    expect(W.eval("SMASH_SPEC['fly'] === undefined")).toBe(true);
    const cd = W.eval("LEGACY_SMASH_COST['fly'].cd");
    const scale = W.eval('SMASH_CD_SCALE'), tapEndlag = W.eval('SMASH_ENDLAG');
    const r = tapSmash(W, 'Puffball', { hold: 10, gap: 2, bursts: 1, settle: 40 });
    expect(r.peakCd, 'her hand-written body pays the legacy cost, scaled').toBe(Math.round(cd * scale));
    expect(r.peakCd, 'not just the flat endlag').toBeGreaterThan(tapEndlag);
  });
});

describe('three cooldowns: attacks, specials and smashes never wait on each other', () => {
  // "Specials and smashes should have seperate cooldowns, and also attacks."
  const setup = (name) => `
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
    worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
    var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
    var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 900, groundY()-24, 1);
    A.team=0; D.team=1; A.face=1; A.controller='local'; A.you=true; D.controller='still'; fighters=[A,D];
    for (var k in down) delete down[k];
    step(); A.atkCd=0; A.spCd=0; A.smCd=0; A.smashHold=0;`;

  it("a smash's cooldown is its own: X and C stay ready", () => {
    const r = W.eval(`(function(){ ${setup('Fries')}
      down[KEYS.smash]=true; step(); down[KEYS.smash]=false;
      for (var i=0;i<40 && A.smCd<=0;i++) step();
      return { smCd: A.smCd, atkCd: A.atkCd, spCd: A.spCd };
    })()`);
    expect(r.smCd, 'Fries paid her smash cost').toBeGreaterThan(0);
    expect(r.atkCd, 'her jab is not locked by it').toBe(0);
    expect(r.spCd, 'nor her special').toBe(0);
  });

  it('a jab or a special in cooldown does not hold a smash back', () => {
    const r = W.eval(`(function(){ ${setup('Coiny')}
      A.atkCd = 200; A.spCd = 200;
      var fired = -1, _ds = doSmash; doSmash = function(f){ if (f===A && fired<0) fired = i; return _ds.apply(this, arguments); };
      try { for (var i=0;i<60 && fired<0;i++){ down[KEYS.smash] = i===0; step(); } } finally { doSmash = _ds; down[KEYS.smash]=false; }
      return { fired: fired, full: smashFullOf(A) };
    })()`);
    expect(r.fired, 'it goes off when its own charge is full').toBeGreaterThanOrEqual(r.full - 1);
    expect(r.fired).toBeLessThanOrEqual(r.full + 1);
  });

  it("Money's C pays the special's cooldown only, and Golf Ball's Presence prices the smash, not her special", () => {
    const r = W.eval(`(function(){ ${setup('Money')}
      fireSpecial(A, {}); var money = { spCd: A.spCd, smCd: A.smCd, atkCd: A.atkCd };
      ${setup('Golf Ball')}
      doSmash(A); var golf = { spCd: A.spCd, smCd: A.smCd };
      return { money: money, golf: golf };
    })()`);
    expect(r.money.spCd).toBeGreaterThan(0);
    expect(r.money.smCd).toBe(0);
    expect(r.money.atkCd).toBe(0);
    expect(r.golf.spCd).toBe(0);
    expect(r.golf.smCd).toBeGreaterThanOrEqual(173);
  });
});
