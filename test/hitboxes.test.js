import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// CUSTOM HITBOXES.
//
// Every fighter used to be hit as the same 24px circle: Needle and TV were exactly as easy to tag. Each
// now has a hurtbox ellipse sized and shaped from their own art, scaled so the MEDIAN fighter keeps the
// old circle's area. It is separate from f.r, which still sizes the art and stands the fighter on
// platforms -- hit, hurt and body are three different things now, and the B overlay shows all of them.
//
// Every hit check goes through hurtGap(). The first test is the one that matters most: for a fighter
// WITHOUT a custom box it has to reproduce the old circle exactly, or the conversion changed numbers it
// had no business changing.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

describe('the hurtbox model', () => {
  it('reproduces the old 24px circle exactly for a fighter with no custom box', () => {
    const bad = W.eval(`(function(){
      var t = { x:100, y:200, r:24, hurt:null }, bad = [];
      [[130,200],[100,260],[160,250],[100,200],[124,200],[40,120],[100.5,199]].forEach(function(p){
        var want = Math.hypot(p[0]-t.x, p[1]-t.y) - t.r, got = hurtGap(t, p[0], p[1]);
        if (Math.abs(want-got) > 1e-9) bad.push(p.join(',') + ': ' + got + ' vs ' + want);
      });
      return bad;
    })()`);
    expect(bad).toEqual([]);
  });

  it('an ellipse is reached sooner along its long axis than its short one', () => {
    const r = W.eval(`(function(){
      var t = { x:0, y:0, r:24, hurt:{ rx:13, ry:32, oy:0 } };
      return { side: hurtGap(t, 40, 0), top: hurtGap(t, 0, 40), inside: hurtGap(t, 0, 5) };
    })()`);
    expect(r.side).toBeCloseTo(27, 6);     // 40 - 13
    expect(r.top).toBeCloseTo(8, 6);       // 40 - 32
    expect(r.inside).toBeLessThan(0);
  });

  it('every playable fighter has a box from their art, and the median keeps the old area', () => {
    const r = W.eval(`(function(){
      var a = ROSTER.filter(function(x){ return x.play; }).map(function(x){
        var f = makeFighter(x, 0, 0, 0); return f.hurt ? f.hurt.rx * f.hurt.ry : -1; });
      a.sort(function(p, q){ return p - q; });
      return { missing: a.filter(function(v){ return v < 0; }).length, median: a[Math.floor(a.length/2)], n: a.length };
    })()`);
    expect(r.missing, 'fighters with no hurtbox').toBe(0);
    expect(r.median).toBeGreaterThan(576 * 0.93);
    expect(r.median).toBeLessThan(576 * 1.07);
  });

  it('the hurtbox is not the body: f.r, which sizes the art and the ground contact, does not move', () => {
    const rs = W.eval(`ROSTER.filter(function(x){ return x.play; }).map(function(x){ return makeFighter(x,0,0,0).r; })`);
    expect(new Set(rs)).toEqual(new Set([24]));
  });
});

describe('shape changes who gets hit', () => {
  const poke = (name) => W.eval(`(function(){
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
    worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
    var A = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 400, groundY()-24, 0);
    var D = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 470, groundY()-24, 1);
    A.team=0; D.team=1; A.controller='still'; D.controller='still'; fighters=[A,D]; step();
    D.invuln=0; D.pct=0;
    // the same small poke, 30px short of the target's centre, level with it
    return hitCircle(A, D.x-30, D.y, 12, 5, 5, 3, -2);
  })()`);

  it('a wide fighter is hit where a thin one is missed', () => {
    // Under the old circle both took this: 30 - 24 = 6px, inside a 12px poke.
    expect(poke('Bracelety'), 'wide: half-width ~33px').toBe(1);
    expect(poke('Needle'), 'thin: half-width 13px').toBe(0);
  });
});

describe('the hitbox overlay', () => {
  it('B toggles it, it draws, and turning it off clears what it recorded', () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; beginMatchNow();
      var before = SHOW_HITBOXES;
      window.dispatchEvent(new KeyboardEvent('keydown', { code:'KeyB' }));
      var on = SHOW_HITBOXES, err = null;
      try { hitCircle(fighters[0], fighters[0].x+30, fighters[0].y, 20, 1, 1, 1, -1); drawHitboxOverlay(); }
      catch(e){ err = e.message; }
      var recorded = DEBUG_HITS.length;
      window.dispatchEvent(new KeyboardEvent('keydown', { code:'KeyB' }));
      return { before: before, on: on, off: SHOW_HITBOXES, err: err, recorded: recorded, after: DEBUG_HITS.length };
    })()`);
    expect(r.before).toBe(false);
    expect(r.on).toBe(true);
    expect(r.err).toBe(null);
    expect(r.recorded, 'the swing was recorded while on').toBeGreaterThan(0);
    expect(r.off).toBe(false);
    expect(r.after).toBe(0);
  });

  it('records nothing while it is off, so normal play pays nothing for it', () => {
    const n = W.eval(`(function(){
      SHOW_HITBOXES = false; DEBUG_HITS.length = 0;
      hitCircle(fighters[0], fighters[0].x+30, fighters[0].y, 20, 1, 1, 1, -1);
      return DEBUG_HITS.length;
    })()`);
    expect(n).toBe(0);
  });
});
