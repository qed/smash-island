import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { bootMonolith, measureSmash } from './helpers/smash-golden.js';

// BATCH 1 OF THE MOVE REBUILD: charge becomes a dial.
//
// Before this, doSmash had exactly one caller, passing 1.0. The input block fired only at a full
// 45-frame hold and discarded anything shorter, so every `c*` term in all 59 smash bodies was dead
// code and a smash was a switch with a 45-frame delay. Now there are exactly two tiers: a release
// past a 6-frame floor is a TAP (c=0), a release at or past 45 is FULL (c=1), and the hold runs to
// 135 frames with no power past 45 — bluff time.
//
// The retune is the risky half: all 125 c-terms were rewritten from a 1.20x–2.00x spread to a
// uniform 1.39x, with the FULL-charge value held exactly. test/golden/smash-charge.json is every
// fighter's full-charge smash measured on the build BEFORE the retune, so this is not "does it
// look right" — each fighter passes or fails against the number it used to produce.

const GOLDEN = JSON.parse(readFileSync('test/golden/smash-charge.json', 'utf8'));
const NAMES = Object.keys(GOLDEN);
// The three whose smash is a pure self-buff (counter stance, cloud, curse aura) land nothing by
// design — there is no number to hold. Everyone else must reproduce theirs.
const LANDS = NAMES.filter((n) => GOLDEN[n][60].dmg1 > 0);

let W;
const boot = async () => { if (!W) { W = bootMonolith(); await W.eval('profileReady'); } return W; };
const close = (a, b, tol) => Math.abs(a - b) <= Math.max(tol * Math.abs(b), 0.05);

describe('full charge is exactly what it was before the retune', () => {
  it('lands the same first-hit damage for every fighter that lands one', async () => {
    const w = await boot();
    const off = [];
    for (const n of LANDS) {
      const g = GOLDEN[n][60], r = measureSmash(w, n, 1.0, 60);
      if (!close(r.dmg1, g.dmg1, 0.01)) off.push(`${n}: ${r.dmg1} vs golden ${g.dmg1}`);
    }
    expect(off, 'full-charge damage drifted').toEqual([]);
  });

  it('lands the same knockback for every fighter that lands one', async () => {
    const w = await boot();
    const off = [];
    for (const n of LANDS) {
      const g = GOLDEN[n][60], r = measureSmash(w, n, 1.0, 60);
      if (!close(r.kvx, g.kvx, 0.02) || !close(r.kvy, g.kvy, 0.02)) off.push(`${n}: (${r.kvx},${r.kvy}) vs (${g.kvx},${g.kvy})`);
    }
    expect(off, 'full-charge knockback drifted').toEqual([]);
  });

  it('the three self-buff smashes still land nothing', async () => {
    const w = await boot();
    for (const n of NAMES.filter((x) => !LANDS.includes(x))) {
      expect(measureSmash(w, n, 1.0, 60).dmg1, n).toBe(0);
    }
  });
});

describe('a tap is a real, cheaper smash', () => {
  it('c=0 lands 0.70x–0.75x of full for every fighter whose damage is charge-scaled', async () => {
    const w = await boot();
    const off = [];
    // Bomby is the one body where charge ALSO grows the blast radius, and his damage falls off with
    // distance inside it — so at a fixed 60px the two compound and a tap lands ~0.67x. That is the
    // design, not a missed term (his damage expression is retuned like everyone's).
    const COMPOUND = { 'Bomby': 0.62 };
    for (const n of LANDS) {
      const full = measureSmash(w, n, 1.0, 60).dmg1, tap = measureSmash(w, n, 0.0, 60).dmg1;
      if (tap === 0) continue;                                   // the tap whiffed at this spacing — reach shrank, which is allowed
      const ratio = tap / full, floor = COMPOUND[n] || 0.70;
      // A handful of bodies scale hitbox size or shot count with c rather than damage; those land
      // at exactly 1.0x and are fine. Anything between 0.76 and 0.99 is a body the retune missed.
      if (ratio < floor || (ratio > 0.76 && ratio < 0.995)) off.push(`${n}: tap ${tap} / full ${full} = ${ratio.toFixed(2)}`);
    }
    expect(off, 'tap/full ratio outside the retuned band').toEqual([]);
  });
});

// The input path — the part the fixture cannot see, because doSmash does not set endlag; the
// release site does. Drive a local fighter through the real key state.
function holdAndRelease(w, frames) {
  return w.eval(`
    (function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 460, groundY()-24, 1);
      A.team=0; D.team=1; A.face=1; A.you=true; A.controller='local'; D.controller='still';
      [A,D].forEach(function(f){ f.stocks=9; f.invuln=0; });
      fighters=[A,D]; step(); A.pct=0; D.pct=0; A.atkCd=0; A.invuln=0; D.invuln=0;
      for (var k in down) down[k]=false;
      down[KEYS.smash]=true;  for (var i=0;i<${frames};i++) step();
      var held = A.smashHold;
      down[KEYS.smash]=false; step();
      return { held:held, fired: D.pct>0, atkCd:A.atkCd, holdAfter:A.smashHold };
    })()`);
}

describe('the release site', () => {
  it('a 3-frame press is a mis-press, not a smash', async () => {
    const r = holdAndRelease(await boot(), 3);
    expect(r.fired).toBe(false);
    expect(r.holdAfter).toBe(0);
  });
  it('a 6-frame tap fires as tier one, with tap endlag', async () => {
    const r = holdAndRelease(await boot(), 6);
    expect(r.fired).toBe(true);
    expect(r.atkCd).toBe(18);
  });
  it('a 30-frame hold is STILL tier one — there is nothing between tap and full', async () => {
    const r = holdAndRelease(await boot(), 30);
    expect(r.fired).toBe(true);
    expect(r.atkCd).toBe(18);
  });
  it('a full hold fires with full endlag', async () => {
    const r = holdAndRelease(await boot(), 45);
    expect(r.fired).toBe(true);
    expect(r.atkCd).toBe(30);
  });
  it('holding past full keeps charging the hold, not the power, and fires at 1.0', async () => {
    const w = await boot();
    const r = holdAndRelease(w, 120);
    expect(r.held).toBe(120);
    expect(r.fired).toBe(true);
    expect(r.atkCd).toBe(30);
    expect(w.eval('SMASH_HOLD_MAX')).toBe(135);
  });
});
