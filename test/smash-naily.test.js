import { describe, it, expect } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// Naily's smash, to the owner's spec: a dash-jab forward, then a jab BACK — "I nailed it!" — with
// a bleed, extra damage at ordinary knockback, and half a second of self-stun.
//
// The first smash authored in the shape every smash will take: a PATTERN (dash through, jab
// back), an EFFECT (bleed), a damage/knockback RATIO (high damage, normal launch — it racks
// percent rather than kills), and a COST (30 frames stuck). Charge sets the dash length; the
// bleed decays rather than ticking flat.

const stage = (w, charge, dummies) => w.eval(`
  (function(){
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
    worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
    var N = makeFighter(ROSTER.find(function(r){ return r.name==='Naily'; }), 400, groundY()-24, 0);
    N.team=0; N.face=1; N.controller='still'; N.stocks=9;
    var ds = ${JSON.stringify(dummies)}.map(function(x,i){
      var d = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), x, groundY()-24, i+1);
      d.team=i+1; d.controller='still'; d.stocks=9; return d; });
    fighters=[N].concat(ds); step(); fighters.forEach(function(f){ f.invuln=0; f.pct=0; f.bleed=0; });
    doSmash(N, ${charge});
    var stunAt=-1, endX=null;
    for (var i=0;i<40;i++){ step(); if (endX===null && !N._nail){ endX=N.x; stunAt=N.hitstun; } }
    return { endX:endX, stunAt:stunAt, startX:400,
             pct:ds.map(function(d){ return +d.pct.toFixed(2); }), bleed:ds.map(function(d){ return d.bleed; }) };
  })()`);

describe('I NAILED IT', () => {
  it('dashes through the target and jabs back into them: two hits, a bleed, and a self-stun', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const r = stage(w, 1, [470]);
    expect(r.endX, 'the dash never ended').not.toBeNull();
    expect(r.endX - r.startX, 'a full charge should carry her past the target').toBeGreaterThan(70);
    expect(r.pct[0], 'dash hit (7) plus back-jab (16) plus some bleed').toBeGreaterThanOrEqual(23);
    expect(r.bleed[0], 'the target should be bleeding').toBeGreaterThan(0);
    expect(r.stunAt, 'she pays half a second on the frame the jab lands').toBeGreaterThanOrEqual(28);
  });

  it('a tap is the same move, shorter and lighter', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const full = stage(w, 1, [470]), tap = stage(w, 0, [470]);
    expect(tap.endX - tap.startX).toBeLessThan(full.endX - full.startX);
    expect(tap.pct[0]).toBeLessThan(full.pct[0]);
    expect(tap.stunAt, 'the cost does not shrink with the charge').toBeGreaterThanOrEqual(28);
  });

  it('someone well behind her start is not touched by either jab', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const r = stage(w, 1, [470, 300]);
    expect(r.pct[1]).toBe(0);
    expect(r.bleed[1]).toBe(0);
  });

  it('bleed is front-loaded and decays to a bounded total', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const r = w.eval(`
      (function(){
        SETTINGS.mode='ffa'; running=true; worldPlats=[]; summons=[]; projectiles=[]; items=[];
        var d = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 500, groundY()-24, 0);
        d.team=0; d.controller='still'; d.stocks=9; fighters=[d]; step(); d.pct=0;
        applyBleed(d, BLEED_FRAMES);
        for (var i=0;i<30;i++) step(); var early=d.pct;
        for (var j=0;j<BLEED_FRAMES;j++) step();
        return { early:+early.toFixed(2), total:+d.pct.toFixed(2), left:d.bleed };
      })()`);
    expect(r.left, 'bleed should have run out').toBe(0);
    expect(r.total).toBeGreaterThan(6); expect(r.total).toBeLessThan(7.5);
    expect(r.early / r.total, 'the first half-second carries more than a fifth of it').toBeGreaterThan(0.2);
  });
});
