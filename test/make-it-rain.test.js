import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// Money's special, Make It Rain, is the one caller of the smash pattern machinery that is not a
// SMASH_SPEC row: PAYDAY_SPECIAL runs the burst pattern directly. When O18 collapsed the rows to
// single numbers, this row kept its `[tap, full]` pairs and a string of two numbers went into the
// physics -- percent became "405.8,5.8", knockback NaN, two fighters at NaN,NaN that nothing could
// KO, and map-generator's seeded cavern match never ended. Caught by that test; pinned here.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

describe("Money's Make It Rain", () => {
  it('is a single-number row, and the burst never grows past the radius it always had', () => {
    const r = W.eval('({ dmg: PAYDAY_SPECIAL.dmg, kb: PAYDAY_SPECIAL.kb, rad: PAYDAY_SPECIAL.rad, grow: PAYDAY_SPECIAL.grow })');
    expect(typeof r.dmg).toBe('number');
    expect(typeof r.kb).toBe('number');
    expect(r.grow, 'it ran as the tap tier before O18, which never grew').toBe(0);
  });

  it('lands finite damage and finite knockback on a foe beside her', () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var M = makeFighter(ROSTER.find(function(r){ return r.name==='Money'; }), 400, groundY()-24, 0);
      var E = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 450, groundY()-24, 1);
      M.team=0; E.team=1; M.face=1; [M,E].forEach(function(f){ f.controller='still'; f.invuln=0; f.spCd=0; f.atkCd=0; f.stocks=9; });
      fighters=[M,E]; step(); E.invuln=0; E.pct=0; M.spCd=0;
      doSpecial(M);
      var sm = null;   // the burst starts after the circle wind-up, so read it the frame it appears
      for (var i=0;i<30;i++){ step(); if (!sm && M._sm) sm = { r1: M._sm.r1, dmg: M._sm.dmg, kb: M._sm.kb }; }
      return { sm: sm, pct: E.pct, vx: E.vx, x: E.x, y: E.y };
    })()`);
    expect(r.sm, 'the special ran the burst pattern').not.toBeNull();
    expect(typeof r.sm.dmg).toBe('number');
    expect(r.sm.r1, 'radius 74, the number it always burst to').toBe(74);
    expect(typeof r.pct).toBe('number');
    expect(Number.isFinite(r.pct) && r.pct > 0, `the foe took real damage: ${r.pct}`).toBe(true);
    for (const k of ['vx', 'x', 'y']) expect(Number.isFinite(r[k]), `${k} is finite`).toBe(true);
  });
});
