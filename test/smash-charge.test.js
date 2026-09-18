import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { bootMonolith, measureSmash } from './helpers/smash-golden.js';

// THE SMASH FIXTURE. test/golden/smash-charge.json is every fighter's smash measured at 60px and
// 140px -- first-hit damage, total damage, launch, the frame it connects, the cooldown it pays and
// the self-damage it costs -- and each fighter passes or fails against the numbers it used to
// produce. A smash is the full charge, always: E18 made the charge press-to-commit and O18 removed
// the last of the tap tier's data, so `charge` is no longer a dial anywhere in the game.

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
      const g = GOLDEN[n][60], r = measureSmash(w, n, 60);
      if (!close(r.dmg1, g.dmg1, 0.01)) off.push(`${n}: ${r.dmg1} vs golden ${g.dmg1}`);
    }
    expect(off, 'full-charge damage drifted').toEqual([]);
  });

  it('lands the same knockback for every fighter that lands one', async () => {
    const w = await boot();
    const off = [];
    for (const n of LANDS) {
      const g = GOLDEN[n][60], r = measureSmash(w, n, 60);
      if (!close(r.kvx, g.kvx, 0.02) || !close(r.kvy, g.kvy, 0.02)) off.push(`${n}: (${r.kvx},${r.kvy}) vs (${g.kvx},${g.kvy})`);
    }
    expect(off, 'full-charge knockback drifted').toEqual([]);
  });

  it('the three self-buff smashes still land nothing', async () => {
    const w = await boot();
    for (const n of NAMES.filter((x) => !LANDS.includes(x))) {
      expect(measureSmash(w, n, 60).dmg1, n).toBe(0);
    }
  });
});

describe('the fixture holds at range and in time, too (O13)', () => {
  // Three commits in a row moved the 140px row, hitFrame and atkCd without a failure -- including
  // a real change in damage at range for seven fighters. Every recorded column is asserted now.
  it('lands the same damage and knockback at 140px', async () => {
    const w = await boot();
    const off = [];
    for (const n of NAMES) {
      const g = GOLDEN[n][140], r = measureSmash(w, n, 140);
      if (!close(r.dmg1, g.dmg1, 0.01) || !close(r.dmg, g.dmg, 0.01) || !close(r.kvx, g.kvx, 0.02) || !close(r.kvy, g.kvy, 0.02)) {
        off.push(`${n}: ${r.dmg1}/${r.dmg} (${r.kvx},${r.kvy}) vs golden ${g.dmg1}/${g.dmg} (${g.kvx},${g.kvy})`);
      }
    }
    expect(off, 'the 140px row drifted').toEqual([]);
  });

  it('connects on the same frame, pays the same cooldown and the same self-damage', async () => {
    const w = await boot();
    const off = [];
    for (const n of NAMES) {
      for (const d of [60, 140]) {
        const g = GOLDEN[n][d], r = measureSmash(w, n, d);
        if (r.hitFrame !== g.hitFrame || r.smCd !== g.smCd || !close(r.self, g.self, 0.01)) {
          off.push(`${n}@${d}: frame ${r.hitFrame} vs ${g.hitFrame}, cd ${r.smCd} vs ${g.smCd}, self ${r.self} vs ${g.self}`);
        }
      }
    }
    expect(off, 'timing or cost drifted').toEqual([]);
  });
});

// The input path — the part the fixture cannot see, because doSmash does not set endlag; the
// release site does. Drive a local fighter through the real key state.
//
// PRESS ONCE. "Smashes still feel overcomplicated and hard to use": a press -- any press, a one-frame tap
// included -- starts the charge, and the FULL smash goes off by itself the moment the charge is complete.
// Letting go early does not cancel it and there is no mis-press floor. HOLD V TO KEEP IT: if the key is still
// down when the charge completes, the smash stays charged until the key comes up, then fires at once.
// A press during endlag charges through it and comes out when both are done.
function pressSmash(w, { hold, wait = 60, mash = 0 } = {}) {
  return w.eval(`
    (function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 460, groundY()-24, 1);
      A.team=0; D.team=1; A.face=1; A.you=true; A.controller='local'; D.controller='still';
      [A,D].forEach(function(f){ f.stocks=9; f.invuln=0; });
      fighters=[A,D]; step(); A.pct=0; D.pct=0; A.atkCd=0; A.invuln=0; D.invuln=0;
      for (var k in down) down[k]=false;
      var fires=0, _ds=doSmash; doSmash=function(f,c){ fires++; return _ds(f,c); };
      var peakCd=0, fireFrame=-1, frame=0, pct30=-1;
      var tick=function(){ step(); frame++; peakCd=Math.max(peakCd, A.smCd); if(fires>0 && fireFrame<0) fireFrame=frame; if(fireFrame>0 && frame===fireFrame+30) pct30=D.pct; };
      try {
        down[KEYS.smash]=true;  for (var i=0;i<${hold};i++) tick();
        var held = A.smashHold, firedWhileHeld = fires>0;
        down[KEYS.smash]=false;
        // a mash is a 10-frame press and a 2-frame gap: long enough to clear every fighter's floor
        for (var m=0;m<${mash};m++){ down[KEYS.smash]=true; for (var a=0;a<10;a++) tick(); down[KEYS.smash]=false; tick(); tick(); }
        for (var j=0;j<${wait};j++) tick();
      } finally { doSmash=_ds; }
      return { fires:fires, pct:+D.pct.toFixed(2), pct30:+pct30.toFixed(2), held:held, firedWhileHeld:firedWhileHeld, fireFrame:fireFrame,
               peakCd:peakCd, holdAfter:A.smashHold, queued: !!A._smQ,
               full: smashFullOf(A), endlag: SMASH_ENDLAG };
    })()`);
}

describe('the release site', () => {
  it('a one-frame tap is a smash: the full one, when the charge completes', async () => {
    const r = pressSmash(await boot(), { hold: 1 });
    expect(r.fires, 'a tap used to be a mis-press that threw nothing').toBe(1);
    expect(r.fireFrame, 'it goes off when the charge completes, not when the key is let go').toBeGreaterThanOrEqual(r.full);
    expect(r.fireFrame).toBeLessThanOrEqual(r.full + 1);
    expect(r.queued).toBe(false);
    expect(r.holdAfter).toBe(0);
  });
  it('let go early and the smash still comes out, at full charge', async () => {
    const r = pressSmash(await boot(), { hold: 10 });
    expect(r.full, 'released before full, or this is not an early release').toBeGreaterThan(10);
    expect(r.fires).toBe(1);
    expect(r.fireFrame).toBeGreaterThanOrEqual(r.full);
    expect(r.fireFrame).toBeLessThanOrEqual(r.full + 1);
    expect(r.peakCd, 'Coiny declares no cost, so the endlag is the flat one').toBe(r.endlag);
  });
  it('a tap, an early release and a long hold are the same smash, fired when it is let go', async () => {
    const tap = pressSmash(await boot(), { hold: 1 });
    const early = pressSmash(await boot(), { hold: 10 });
    const late = pressSmash(await boot(), { hold: 40 });   // 40 is past every fighter's full (24..32)
    expect(early.pct30, 'damage 30 frames after the hit, so damage-over-time counts the same for all three').toBeGreaterThan(0);
    expect(tap.pct30).toBe(early.pct30);
    expect(late.pct30).toBe(early.pct30);
    expect(late.peakCd).toBe(early.peakCd);
    expect(late.fireFrame, 'held past full, it waits for the release').toBe(41);
  });
  it('holding V keeps it charged for as long as V is down, then it fires once on the release', async () => {
    const r = pressSmash(await boot(), { hold: 130, wait: 5 });
    expect(r.firedWhileHeld, 'V still down: the smash waits').toBe(false);
    expect(r.held, 'and it is still charged').toBeGreaterThanOrEqual(r.full);
    expect(r.fireFrame, 'it goes off the first frame V is up').toBe(131);
    expect(r.fires, 'a key held down is one press, so one smash').toBe(1);
  });
  it('a press during endlag comes out once the endlag ends, and mashing adds nothing', async () => {
    // hold 40 fires on release; the three mashes land inside its endlag and charge: one comes out
    const r = pressSmash(await boot(), { hold: 40, mash: 3, wait: 60 });
    expect(r.fires).toBe(2);
  });
  it("the charge is the only gate: the owner's 24-frame baseline, no floor, no hold ceiling", async () => {
    const w = await boot();
    expect(w.eval('SMASH_FULL')).toBe(24);
    expect(w.eval('typeof smashFloorOf'), 'the mis-press floor is gone').toBe('undefined');
    expect(w.eval('typeof smashHoldMaxOf'), 'and so is the hold-for-release ceiling').toBe('undefined');
  });
});
