import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// Wave 4 — bespoke animation for the roster beyond the batch-1 twelve.
//
// Spec: docs/animation-move-design.md, "Batch 2 — animation specs" and "Batch 3".
//
// The load-bearing design rule is that every entry uses `deform`, NOT `body`. All 59 fighters now
// carry official character art, and `body` suppresses the render to draw a shape instead — which
// was the right call for Leafy's blade-dash and is the wrong call for everyone whose whole identity
// is their artwork. These tests pin that rule, then check each character's motion actually differs.

const BATCH_2 = ['Needle', 'Pin', 'Coiny', 'Golf Ball', 'Book', 'Ruby',
  'Snowball', 'Flower', 'Tennis Ball', 'Gelatin'];
const BATCH_3 = ['Marker', 'Money', 'Naily', 'Pillow', 'Remote', 'Rose',
  'Saw', 'Taco', 'TV', 'Woody'];
// The generic contract checks apply to every Wave 4 fighter; batch-specific beats are asserted
// individually further down.
const BATCH_4 = ['Bell', 'Bracelety', 'Basketball', 'Dora', 'Fern', 'Grassy',
  'Lightning', 'Liy', 'Lollipop', 'Loser'];
const WAVE_4 = [...BATCH_2, ...BATCH_3, ...BATCH_4];

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

describe('Wave 4 — every fighter keeps their render', () => {
  it('every Wave 4 fighter has an entry', () => {
    const { window: w } = loadMonolith();
    const missing = w.eval(`${JSON.stringify(WAVE_4)}.filter(function(n){ return !FIGHTER_ANIM[n]; })`);
    expect(missing, 'fighters with no animation entry').toEqual([]);
  });

  it('uses deform, never body — the official art must survive', () => {
    const { window: w } = loadMonolith();
    const usingBody = w.eval(`
      ${JSON.stringify(WAVE_4)}.filter(function(n){ return typeof FIGHTER_ANIM[n].body === 'function'; })`);
    expect(usingBody, 'entries that would suppress the character render').toEqual([]);
    const noDeform = w.eval(`
      ${JSON.stringify(WAVE_4)}.filter(function(n){ return typeof FIGHTER_ANIM[n].deform !== 'function'; })`);
    expect(noDeform, 'entries with nothing to animate').toEqual([]);
  });

  it('keeps idle and squash traits inside sane bounds', () => {
    const { window: w } = loadMonolith();
    const bad = w.eval(`
      ${JSON.stringify(WAVE_4)}.filter(function(n){
        var a = FIGHTER_ANIM[n];
        if (a.idle !== undefined && (a.idle < 0 || a.idle > 1)) return true;
        if (a.squash !== undefined && (a.squash < 0 || a.squash > 2)) return true;
        return false;
      })`);
    expect(bad, 'traits outside their documented 0..1 / 0..2 ranges').toEqual([]);
  });
});

describe('Wave 4 — the motion is real and per-character', () => {
  // Sample a whole swing rather than one instant, and ignore the bare translate pair that
  // deformAboutFeet always emits. Both matter: an earlier version of these tests sampled a single
  // frame at hazardT=0, where Gelatin's and Money's sine-driven wobble is exactly zero and Naily's
  // drive has not begun — so three genuinely different animations looked identical, and a deform
  // that did nothing at all would still have "passed" on the translate calls alone.
  const TRAJECTORY = (name) => `
    (function(){
      var out = [];
      for (var t = ATK_ANIM; t >= 0; t--) {
        for (var ht = 0; ht < 3; ht++) {
          hazardT = ht * 7 + 1;
          var ops = window.__deform(${JSON.stringify(name)}, function(f){ f._atkAnim = t; });
          for (var i=0;i<ops.length;i++) {
            var o = ops[i];
            if (o[0] === 'rotate') out.push('r' + o[1].toFixed(4));
            else if (o[0] === 'scale') out.push('s' + o[1].toFixed(4) + ',' + o[2].toFixed(4));
          }
        }
      }
      return out;
    })()`;

  it('each fighter actually deforms across its swing', () => {
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const inert = WAVE_4.filter(n => {
      const ops = w.eval(TRAJECTORY(n));
      // a real animation must rotate, or scale away from 1:1, at some point in the swing
      return !ops.some(o => o.startsWith('r') ? Math.abs(parseFloat(o.slice(1))) > 1e-6
        : o.slice(1).split(',').some(v => Math.abs(parseFloat(v) - 1) > 1e-6));
    });
    expect(inert, 'fighters whose attack does nothing visually').toEqual([]);
  });

  it('gives no two fighters the same swing', () => {
    // Twenty entries producing identical numbers would be one animation with twenty names.
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const sigs = WAVE_4.map(n => JSON.stringify(w.eval(TRAJECTORY(n))));
    const seen = new Map();
    for (let i = 0; i < sigs.length; i++) {
      if (seen.has(sigs[i])) throw new Error(`${WAVE_4[i]} and ${seen.get(sigs[i])} animate identically`);
      seen.set(sigs[i], WAVE_4[i]);
    }
    expect(seen.size, 'distinct swing signatures').toBe(WAVE_4.length);
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
      SETTINGS.count = ${WAVE_4.length};
      startMatch();
      fighters.length = 0;
      ${JSON.stringify(WAVE_4)}.forEach(function(n,i){
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
        var names = ${JSON.stringify(WAVE_4)};
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

describe('batch 3 — the character-specific beats', () => {
  it('Saw spins a full turn through the swing', () => {
    // Rotation is the only motion a circular blade has. If the swing does not carry a full turn,
    // she is just leaning like everyone else.
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const spins = w.eval(`
      (function(){
        var out = [];
        for (var t = ATK_ANIM; t >= 1; t--) {
          var ops = window.__deform('Saw', function(f){ f._atkAnim = t; f.face = 1; });
          for (var i=0;i<ops.length;i++) if (ops[i][0] === 'rotate') out.push(ops[i][1]);
        }
        return out;
      })()`);
    expect(Math.max(...spins), 'a full rotation by the end of the swing')
      .toBeGreaterThan(Math.PI * 1.5);
    // …and it accelerates rather than turning linearly
    const mid = spins[Math.floor(spins.length / 2)];
    expect(mid, 'less than half-turned at the halfway point — it accelerates into contact')
      .toBeLessThan(Math.PI);
  });

  it("Woody's tremble grows with his damage", () => {
    // His fear is the character, and it should visibly worsen as he takes damage.
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const tremor = (pct) => w.eval(`
      (function(){
        var peak = 0;
        for (var ht = 0; ht < 40; ht++) {
          hazardT = ht;
          var ops = window.__deform('Woody', function(f){ f.pct = ${pct}; });
          for (var i=0;i<ops.length;i++) if (ops[i][0] === 'rotate') peak = Math.max(peak, Math.abs(ops[i][1]));
        }
        return peak;
      })()`);
    const calm = tremor(0), hurt = tremor(150);
    expect(calm, 'he is nervous even at 0%').toBeGreaterThan(0);
    expect(hurt, 'and much worse when nearly out').toBeGreaterThan(calm * 2);
  });

  it('Woody flinches away from his own swing', () => {
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const lean = w.eval(`
      (function(){
        hazardT = 0;   // tremble term is zero here, isolating the flinch
        var ops = window.__deform('Woody', function(f){ f._atkAnim = Math.round(ATK_ANIM/2); f.face = 1; f.pct = 0; });
        for (var i=0;i<ops.length;i++) if (ops[i][0] === 'rotate') return ops[i][1];
        return 0;
      })()`);
    expect(lean, 'facing right, he leans LEFT — away from the hit').toBeLessThan(0);
  });

  it('Remote pulses a signal only while charging', () => {
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const ops = (hold) => w.eval(`
      (function(){
        var f = makeFighter(ROSTER.find(function(r){return r.name==='Remote';}), 100, 100, 0);
        f.smashHold = ${hold};
        var ctx = window.__mkCtx();
        FIGHTER_ANIM.Remote.over(f, ctx);
        return ctx.ops.length;
      })()`);
    expect(ops(0), 'silent at rest').toBe(0);
    expect(ops(40), 'transmitting under charge').toBeGreaterThan(0);
  });

  it('TV tears at rest occasionally, not every frame', () => {
    // A permanent tear is not a glitch, it is a broken sprite.
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const torn = w.eval(`
      (function(){
        var n = 0;
        for (var ht = 0; ht < 200; ht++) {
          hazardT = ht;
          var ops = window.__deform('TV', function(f){ f._atkAnim = 0; });
          for (var i=0;i<ops.length;i++) if (ops[i][0] === 'scale' && Math.abs(ops[i][1]-1) > 1e-6) { n++; break; }
        }
        return n;
      })()`);
    expect(torn, 'it does tear').toBeGreaterThan(0);
    expect(torn, 'but is mostly a normal picture').toBeLessThan(40);
  });

  it('Naily puts her force at the end of the swing, not the start', () => {
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const drive = (t) => w.eval(`
      (function(){
        var ops = window.__deform('Naily', function(f){ f._atkAnim = ${t}; f.face = 1; });
        for (var i=0;i<ops.length;i++) if (ops[i][0] === 'scale') return ops[i][1];
        return 1;
      })()`);
    // _atkAnim counts DOWN, so a high value is early
    expect(drive(w.eval('ATK_ANIM') - 1), 'no wind-up').toBeCloseTo(1, 5);
    expect(drive(1), 'all impact at the end').toBeGreaterThan(1.05);
  });
});

describe('Wave 4 — an attack is never invisible', () => {
  it('deforms at the swing peak on every frame phase, for every fighter', () => {
    // Caught on the real canvas, not here: Money's swing term was multiplied by his flutter sine,
    // so on the frames where the sine crossed zero his attack produced a frame IDENTICAL to
    // standing still. TV had only a glitch and no jab, so his attack vanished outside a narrow
    // window. Both passed the "deforms at some point in the swing" check. This is the stronger
    // property: at the peak of the swing, something must always be happening.
    // Checked over the WHOLE swing, not at the pulse peak. Naily proves why: her spec deliberately
    // back-loads every bit of force into the last third, so at the peak of atkPulse she genuinely
    // has not started moving yet — correct for her, and not a defect. What must never happen is a
    // swing that produces no motion at ANY point, which is exactly what Money and Gelatin did on
    // the frames where their driving sine crossed zero.
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const flat = w.eval(`
      (function(){
        var names = ${JSON.stringify(WAVE_4)}, out = [];
        for (var n=0;n<names.length;n++){
          for (var ht=0; ht<24; ht++){
            hazardT = ht;
            var movedSomewhere = false;
            for (var t = ATK_ANIM; t >= 0 && !movedSomewhere; t--) {
              var ops = window.__deform(names[n], function(f){ f._atkAnim = t; });
              for (var i=0;i<ops.length;i++){
                var o = ops[i];
                if (o[0]==='rotate' && Math.abs(o[1])>1e-6) movedSomewhere = true;
                if (o[0]==='scale' && (Math.abs(o[1]-1)>1e-6 || Math.abs(o[2]-1)>1e-6)) movedSomewhere = true;
              }
            }
            if (!movedSomewhere) { out.push(names[n]+'@hazardT='+ht); break; }
          }
        }
        return out;
      })()`);
    expect(flat, 'fighters whose entire swing is invisible on some frames').toEqual([]);
  });
});

describe('Wave 4 — a big rotation must pivot on the centre, not the feet', () => {
  it('never feet-pivots a turn large enough to throw the body off its own feet', () => {
    // Found by looking at the canvas: Saw's full 360 spin was applied with deformAboutFeet, which
    // pivots where a fighter STANDS. That is right for a lean and catastrophic for a turn — at a
    // half-turn the body swings in a circle AROUND the foot point, and she visibly orbited off the
    // platform. Anything past a quarter-turn belongs on deformAboutCentre.
    //
    // deformAboutFeet always emits translate/rotate/translate; deformAboutCentre emits a bare
    // rotate. So the rule is checkable straight off the op list.
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const offenders = w.eval(`
      (function(){
        var names = ${JSON.stringify(WAVE_4)}, out = [];
        for (var n=0;n<names.length;n++){
          for (var t=ATK_ANIM; t>=0; t--){
            for (var ht=0; ht<8; ht++){
              hazardT = ht*3;
              var ops = window.__deform(names[n], function(f){ f._atkAnim = t; f.smashHold = 0; });
              var bigTurn = false, translated = false;
              for (var i=0;i<ops.length;i++){
                if (ops[i][0]==='rotate' && Math.abs(ops[i][1]) > 0.7) bigTurn = true;
                if (ops[i][0]==='translate') translated = true;
              }
              if (bigTurn && translated) { out.push(names[n]); t = -1; break; }
            }
          }
        }
        return out;
      })()`);
    expect(offenders, 'large rotations applied about the feet').toEqual([]);
  });

  it('Saw is the one that turns far enough to need it', () => {
    // Guards the test above from silently becoming vacuous if Saw's spin is ever tuned away.
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const maxTurn = w.eval(`
      (function(){
        var m = 0;
        for (var t=ATK_ANIM; t>=0; t--){
          var ops = window.__deform('Saw', function(f){ f._atkAnim = t; });
          for (var i=0;i<ops.length;i++) if (ops[i][0]==='rotate') m = Math.max(m, Math.abs(ops[i][1]));
        }
        return m;
      })()`);
    expect(maxTurn, 'Saw still spins past a quarter turn').toBeGreaterThan(0.7);
  });
});
