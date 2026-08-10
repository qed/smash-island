import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// Wave 4, batch 2 — bespoke animation for ten more fighters.
//
// Spec: docs/animation-move-design.md, "Batch 2 — animation specs".
//
// The load-bearing design rule is that every entry uses `deform`, NOT `body`. All 59 fighters now
// carry official character art, and `body` suppresses the render to draw a shape instead — which
// was the right call for Leafy's blade-dash and is the wrong call for everyone whose whole identity
// is their artwork. These tests pin that rule, then check each character's motion actually differs.

const BATCH_2 = ['Needle', 'Pin', 'Coiny', 'Golf Ball', 'Book', 'Ruby',
  'Snowball', 'Flower', 'Tennis Ball', 'Gelatin'];

// A context that records transform ops, so a deform can be measured without replaying a real CTM.
const RECORDER = `
  (function(){
    window.__mkCtx = function(){
      var ops = [];
      var c = { ops: ops,
        translate:function(x,y){ ops.push(['translate',x,y]); },
        rotate:function(a){ ops.push(['rotate',a]); },
        scale:function(x,y){ ops.push(['scale',x,y]); },
        // drawing ops are recorded too, so an over-pass (which only paints) is measurable
        save:function(){}, restore:function(){},
        beginPath:function(){ ops.push(['beginPath']); },
        moveTo:function(x,y){ ops.push(['moveTo',x,y]); },
        lineTo:function(x,y){ ops.push(['lineTo',x,y]); },
        stroke:function(){ ops.push(['stroke']); },
        fill:function(){ ops.push(['fill']); },
        arc:function(x,y,r){ ops.push(['arc',x,y,r]); },
        globalAlpha:1, strokeStyle:'', fillStyle:'', lineWidth:1 };
      return c;
    };
    window.__deform = function(name, mutate){
      var f = makeFighter(ROSTER.find(function(r){ return r.name===name; }), 100, 100, 0);
      f._atkAnim = 0; f.smashHold = 0; f.face = 1;
      if (mutate) mutate(f);
      var ctx = window.__mkCtx();
      var a = FIGHTER_ANIM[name];
      if (a && a.deform) a.deform(f, ctx, f.r);
      return ctx.ops;
    };
    return true;
  })()`;

describe('batch 2 — every fighter keeps their render', () => {
  it('all ten have an entry', () => {
    const { window: w } = loadMonolith();
    const missing = w.eval(`${JSON.stringify(BATCH_2)}.filter(function(n){ return !FIGHTER_ANIM[n]; })`);
    expect(missing, 'fighters with no animation entry').toEqual([]);
  });

  it('uses deform, never body — the official art must survive', () => {
    const { window: w } = loadMonolith();
    const usingBody = w.eval(`
      ${JSON.stringify(BATCH_2)}.filter(function(n){ return typeof FIGHTER_ANIM[n].body === 'function'; })`);
    expect(usingBody, 'entries that would suppress the character render').toEqual([]);
    const noDeform = w.eval(`
      ${JSON.stringify(BATCH_2)}.filter(function(n){ return typeof FIGHTER_ANIM[n].deform !== 'function'; })`);
    expect(noDeform, 'entries with nothing to animate').toEqual([]);
  });

  it('keeps idle and squash traits inside sane bounds', () => {
    const { window: w } = loadMonolith();
    const bad = w.eval(`
      ${JSON.stringify(BATCH_2)}.filter(function(n){
        var a = FIGHTER_ANIM[n];
        if (a.idle !== undefined && (a.idle < 0 || a.idle > 1)) return true;
        if (a.squash !== undefined && (a.squash < 0 || a.squash > 2)) return true;
        return false;
      })`);
    expect(bad, 'traits outside their documented 0..1 / 0..2 ranges').toEqual([]);
  });
});

describe('batch 2 — the motion is real and per-character', () => {
  it('each fighter deforms while swinging', () => {
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const still = w.eval(`
      ${JSON.stringify(BATCH_2)}.filter(function(n){
        var ops = window.__deform(n, function(f){ f._atkAnim = Math.round(ATK_ANIM/2); });
        return ops.length === 0;
      })`);
    expect(still, 'fighters whose attack does nothing visually').toEqual([]);
  });

  it('gives no two fighters the same swing', () => {
    // Ten entries that all produce identical numbers would be one animation with ten names.
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const sigs = w.eval(`
      ${JSON.stringify(BATCH_2)}.map(function(n){
        return JSON.stringify(window.__deform(n, function(f){ f._atkAnim = Math.round(ATK_ANIM/2); }));
      })`);
    expect(new Set(sigs).size, 'distinct swing signatures').toBe(BATCH_2.length);
  });

  it('Gelatin wobbles even at rest, while Needle stays still', () => {
    // The two ends of the batch's trait range, per the spec table.
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const gel = w.eval(`window.__deform('Gelatin', null).length`);
    const ndl = w.eval(`window.__deform('Needle', null).length`);
    expect(gel, 'jelly is never fully still').toBeGreaterThan(0);
    expect(ndl, 'a steel pin at rest does not deform').toBe(0);
  });

  it('Coiny flips edge-on without ever producing a singular transform', () => {
    // The horizontal scale sweeps through the coin turning over. If it ever reaches exactly 0 the
    // matrix is singular and some canvas implementations drop the entire draw for that frame —
    // the character would strobe out of existence mid-swing.
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const scales = w.eval(`
      (function(){
        var out = [];
        for (var t = 0; t <= ATK_ANIM; t++) {
          var ops = window.__deform('Coiny', function(f){ f._atkAnim = t; });
          for (var i=0;i<ops.length;i++) if (ops[i][0] === 'scale') out.push(ops[i][1]);
        }
        return out;
      })()`);
    expect(scales.length, 'the flip is driven by horizontal scale').toBeGreaterThan(3);
    expect(Math.min(...scales.map(Math.abs)), 'never singular').toBeGreaterThan(0);
    expect(Math.min(...scales), 'and genuinely turns over past edge-on').toBeLessThan(0);
  });

  it('Snowball winds back before he drives forward', () => {
    // The whole point of his entry: anticipation must be visible before contact, or a heavy
    // tackle reads as weightless.
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const rot = (t) => w.eval(`
      (function(){
        var ops = window.__deform('Snowball', function(f){ f._atkAnim = ${t}; f.face = 1; });
        for (var i=0;i<ops.length;i++) if (ops[i][0] === 'rotate') return ops[i][1];
        return 0;
      })()`);
    // _atkAnim counts DOWN from ATK_ANIM, so a high value is early in the swing.
    const early = rot(w.eval('ATK_ANIM') - 1);
    const late = rot(1);
    expect(early * late, 'wind-back and follow-through lean opposite ways').toBeLessThan(0);
  });

  it('Flower trembles while charging a smash, not only while swinging', () => {
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const charging = w.eval(`window.__deform('Flower', function(f){ f.smashHold = 40; }).length`);
    expect(charging, 'the tantrum shows during the charge').toBeGreaterThan(0);
  });

  it('Ruby glints only while charging', () => {
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const glint = (hold) => w.eval(`
      (function(){
        var f = makeFighter(ROSTER.find(function(r){return r.name==='Ruby';}), 100, 100, 0);
        f.smashHold = ${hold};
        var ctx = window.__mkCtx();
        FIGHTER_ANIM.Ruby.over(f, ctx);
        return ctx.ops.length;
      })()`);
    expect(glint(0), 'no sparks at rest').toBe(0);
    expect(glint(40), 'facets catch the light under charge').toBeGreaterThan(0);
  });
});

describe('batch 2 — survives every hostile draw state', () => {
  it('draws all ten through flash / burn / yoyle / star / invuln / mirror / air / landing', () => {
    // The sweep that catches an animation which throws in one rare state only.
    const { window: w } = loadMonolith();
    w.eval(`
      SETTINGS.count = ${BATCH_2.length};
      startMatch();
      fighters.length = 0;
      ${JSON.stringify(BATCH_2)}.forEach(function(n,i){
        fighters.push(makeFighter(ROSTER.find(function(r){ return r.name===n; }), 200+i*60, 300, i));
      });
    `);
    const states = [
      '', 'f.flash=6', 'f.burn=40', 'f._yoyleT=200', 'f._starT=200', 'f.invuln=30',
      'f.face=-1', 'f.vy=-9', 'f.vy=12', 'f.vx=5', 'f._landSquash=5',
      'f._atkAnim=7', 'f._hurtAnim=9', 'f.smashHold=44',
      'f._atkAnim=7; f.face=-1; f.smashHold=20; f.burn=10',
    ];
    for (const mutate of states) {
      expect(() => w.eval(`
        for(const f of fighters){ f.flash=0; f.burn=0; f._yoyleT=0; f._starT=0; f.invuln=0;
          f.face=1; f.vx=0; f.vy=0; f._landSquash=0; f._atkAnim=0; f._hurtAnim=0; f.smashHold=0;
          ${mutate}; }
        draw();
      `), `draw() with [${mutate || 'resting'}]`).not.toThrow();
    }
  });

  it('produces only finite transform numbers across a whole swing', () => {
    // A NaN in a transform silently blanks the fighter rather than throwing, so it would sail
    // straight past the sweep above.
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const bad = w.eval(`
      (function(){
        var out = [];
        var names = ${JSON.stringify(BATCH_2)};
        for (var n=0;n<names.length;n++){
          for (var t=0;t<=ATK_ANIM;t++){
            for (var hold=0; hold<=45; hold+=45){
              var ops = window.__deform(names[n], function(f){ f._atkAnim=t; f.smashHold=hold; });
              for (var i=0;i<ops.length;i++){
                for (var k=1;k<ops[i].length;k++){
                  if (!isFinite(ops[i][k])) out.push(names[n]+' '+ops[i][0]);
                }
              }
            }
          }
        }
        return out;
      })()`);
    expect(bad, 'non-finite transform values').toEqual([]);
  });
});
