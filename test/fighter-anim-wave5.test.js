import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadMonolith } from './helpers/load-monolith.js';

// Batch 7 -- the thirty-two fighters that had no motion of their own.
//
// Spec: docs/animation-move-design.md, "Batch 7". The same contract as batches 2-6 (test/fighter-anim-wave4.test.js): `deform`, never `body` (the official art
// survives), numbers only, and each fighter's swing is its own. Twenty-six of them had no FIGHTER_ANIM entry at all. Six (Cheesy, Soap, Tissues, Yin-Yang,
// Starfruit, Tapey) had an entry that carried a prop, a pose or a status and no trait or beat of their own: theirs are written into those entries, and what the
// entries already did is pinned here too.

const NEW_26 = ['Balloon', 'Bomb', 'Knife', 'Lightbulb', 'Paintbrush', 'Taco (II)', 'Bow', 'Marshmallow', 'Apple', 'Baseball', 'Pickle', 'Nickel (II)',
  'Paper', 'Microphone', 'Salt', 'Test Tube', 'Dough', 'Fan', 'Blueberry', 'Cherries', 'Clover', 'Jack', 'Magnet', 'MeTag', 'Poppy', 'Silver Spoon'];
const HAD_AN_ENTRY = ['Cheesy', 'Soap', 'Tissues', 'Yin-Yang', 'Starfruit', 'Tapey'];
const BATCH_7 = [...NEW_26, ...HAD_AN_ENTRY];

// A context that records transform ops, so a deform can be measured without replaying a real CTM.
const RECORDER = `
  (function(){
    window.__mkCtx = function(){
      var ops = [];
      var c = { ops: ops,
        translate:function(x,y){ ops.push(['translate',x,y]); },
        rotate:function(a){ ops.push(['rotate',a]); },
        scale:function(x,y){ ops.push(['scale',x,y]); },
        transform:function(a,b,c,d,e,g){ ops.push(['transform',a,b,c,d,e,g]); },
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
    // the swing at tick t of its ATK_ANIM, as a list of [op, a, b] for the transforms only
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

// The net rotation and scale of one deform: what it does to the picture, whatever order the ops came in
const NET = `
  window.__net = function(ops){
    var rot = 0, sx = 1, sy = 1, shear = 0, dy = 0;
    for (var i = 0; i < ops.length; i++){
      var o = ops[i];
      if (o[0] === 'rotate') rot += o[1];
      else if (o[0] === 'scale'){ sx *= o[1]; sy *= o[2]; }
      else if (o[0] === 'transform') shear += o[3];
    }
    return { rot: rot, sx: sx, sy: sy, shear: shear, n: ops.length };
  };
  true`;

const TRAJECTORY = (name) => `
  (function(){
    var out = [];
    for (var t = ATK_ANIM; t >= 0; t--) {
      for (var ht = 0; ht < 3; ht++) {
        hazardT = ht * 7 + 1;
        var ops = window.__deform(${JSON.stringify(name)}, function(f){ f._atkAnim = t; });
        for (var i = 0; i < ops.length; i++) {
          var o = ops[i];
          if (o[0] === 'rotate') out.push('r' + o[1].toFixed(4));
          else if (o[0] === 'scale') out.push('s' + o[1].toFixed(4) + ',' + o[2].toFixed(4));
          else if (o[0] === 'transform') out.push('x' + o[2].toFixed(4) + ',' + o[3].toFixed(4));
          else if (o[0] === 'translate' && o[2] !== 0 && Math.abs(o[2]) < 5) out.push('t' + o[2].toFixed(4));
        }
      }
    }
    return out;
  })()`;

describe('Batch 7 -- every one of the thirty-two has its own motion', () => {
  it('every fighter with no entry has one now, and the other six have a trait and a beat', () => {
    const { window: w } = loadMonolith();
    const missing = w.eval(`${JSON.stringify(BATCH_7)}.filter(function(n){ return !FIGHTER_ANIM[n]; })`);
    expect(missing, 'fighters with no animation entry').toEqual([]);
    const noBeat = w.eval(`${JSON.stringify(BATCH_7)}.filter(function(n){ return typeof FIGHTER_ANIM[n].deform !== 'function'; })`);
    expect(noBeat, 'entries with no attack beat').toEqual([]);
    const noTrait = w.eval(`${JSON.stringify(BATCH_7)}.filter(function(n){ var a = FIGHTER_ANIM[n]; return a.idle === undefined && a.squash === undefined && !a.deform; })`);
    expect(noTrait, 'entries with no trait').toEqual([]);
  });

  it('the roster has no playable fighter without a FIGHTER_ANIM entry left', () => {
    const { window: w } = loadMonolith();
    const still = w.eval(`ROSTER.filter(function(r){ return r.play && !FIGHTER_ANIM[r.name] && !(r.kit && FIGHTER_ANIM[r.kit.special]); }).map(function(r){ return r.name; })`);
    expect(still, 'playable fighters still without motion of their own').toEqual([]);
  });

  it('the twenty-six new entries use deform, never body: the official art must survive', () => {
    const { window: w } = loadMonolith();
    const usingBody = w.eval(`${JSON.stringify(NEW_26)}.filter(function(n){ return typeof FIGHTER_ANIM[n].body === 'function'; })`);
    expect(usingBody, 'entries that would suppress the character render').toEqual([]);
  });

  it('the six that already had an entry keep everything they had', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      var A = FIGHTER_ANIM;
      return { cheesy: typeof A.Cheesy.over, soap: typeof A.Soap.over, tissues: [typeof A.Tissues.over, typeof A.Tissues.body, typeof A.Tissues.drawPose, !!A.Tissues.poses.nap],
        yin: [typeof A['Yin-Yang'].body, !!A['Yin-Yang'].poses.yang, !!A['Yin-Yang'].poses.mindful], star: typeof A.Starfruit.deform, tapey: [typeof A.Tapey.over, A.Tapey.squash] };
    })()`);
    expect(r.cheesy).toBe('function');
    expect(r.soap).toBe('function');
    expect(r.tissues).toEqual(['function', 'function', 'function', true]);
    expect(r.yin).toEqual(['function', true, true]);
    expect(r.star).toBe('function');
    expect(r.tapey, "her squash is the 0.6 it was").toEqual(['function', 0.6]);
  });

  it('keeps idle and squash traits inside their documented 0..1 / 0..2 ranges', () => {
    const { window: w } = loadMonolith();
    const bad = w.eval(`${JSON.stringify(BATCH_7)}.filter(function(n){
      var a = FIGHTER_ANIM[n];
      if (a.idle !== undefined && (a.idle < 0 || a.idle > 1)) return true;
      if (a.squash !== undefined && (a.squash < 0 || a.squash > 2)) return true;
      return false;
    })`);
    expect(bad, 'traits outside their ranges').toEqual([]);
  });

  it('spreads the traits: soft ones and stiff ones, calm ones and restless ones', () => {
    const { window: w } = loadMonolith();
    const t = w.eval(`(function(){ var o = {}; ${JSON.stringify(BATCH_7)}.forEach(function(n){ var a = FIGHTER_ANIM[n]; o[n] = [a.idle === undefined ? 1 : a.idle, a.squash === undefined ? 1 : a.squash]; }); return o; })()`);
    // the soft end: Marshmallow and Dough are softer than anyone else in the batch; the stiff end: Knife, Test Tube, Jack and Baseball barely give
    expect(Math.max(...Object.values(t).map((v) => v[1])), 'the softest').toBeGreaterThanOrEqual(1.8);
    for (const n of ['Knife', 'Test Tube', 'Jack']) expect(t[n][1], `${n} is rigid`).toBeLessThanOrEqual(0.45);
    expect(t['Taco (II)'][0], 'her act is stillness').toBeLessThanOrEqual(0.25);
    expect(t.Blueberry[0], "nothing matters: he barely breathes").toBeLessThanOrEqual(0.3);
    expect(new Set(Object.values(t).map((v) => v.join(','))).size, 'not one trait with thirty-two names').toBeGreaterThanOrEqual(14);
  });
});

describe('Batch 7 -- the motion is real, and each one is its own', () => {
  it('each fighter actually deforms across its swing', () => {
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const inert = BATCH_7.filter((n) => {
      const ops = w.eval(TRAJECTORY(n));
      return !ops.some((o) => o.startsWith('r') ? Math.abs(parseFloat(o.slice(1))) > 1e-6
        : o.startsWith('x') || o.startsWith('t') ? true
        : o.slice(1).split(',').some((v) => Math.abs(parseFloat(v) - 1) > 1e-6));
    });
    expect(inert, 'fighters whose attack does nothing visually').toEqual([]);
  });

  it('gives no two of the thirty-two the same swing', () => {
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const sigs = BATCH_7.map((n) => JSON.stringify(w.eval(TRAJECTORY(n))));
    const seen = new Map();
    for (let i = 0; i < sigs.length; i++) {
      if (seen.has(sigs[i])) throw new Error(`${BATCH_7[i]} and ${seen.get(sigs[i])} animate identically`);
      seen.set(sigs[i], BATCH_7[i]);
    }
    expect(seen.size).toBe(BATCH_7.length);
  });

  it('is distinct from every fighter that already had a swing, too', () => {
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const others = w.eval(`Object.keys(FIGHTER_ANIM).filter(function(n){ return typeof FIGHTER_ANIM[n].deform === 'function' && ${JSON.stringify(BATCH_7)}.indexOf(n) < 0 && n !== 'Tree' && !FIGHTER_ANIM[n].poses; })`);
    const mine = new Map(BATCH_7.map((n) => [JSON.stringify(w.eval(TRAJECTORY(n))), n]));
    for (const o of others) {
      let sig;
      try { sig = JSON.stringify(w.eval(TRAJECTORY(o))); } catch { continue; }
      expect(mine.has(sig) ? `${o} = ${mine.get(sig)}` : null, `${o} animates like one of batch 7`).toBe(null);
    }
  });

  it('starts and ends every swing in the neutral pose, so nothing pops when the swing ends', () => {
    const { window: w } = loadMonolith();
    w.eval(RECORDER); w.eval(NET);
    const off = w.eval(`(function(){
      var bad = [];
      ${JSON.stringify(BATCH_7)}.forEach(function(n){
        [1, -1].forEach(function(face){
          hazardT = 3;
          var rest = window.__net(window.__deform(n, function(f){ f.face = face; f._atkAnim = 0; }));
          // the first tick of a swing (_atkAnim = ATK_ANIM: u = 0) and the last (_atkAnim = 1: u is 17/18)
          var first = window.__net(window.__deform(n, function(f){ f.face = face; f._atkAnim = ATK_ANIM; }));
          var last = window.__net(window.__deform(n, function(f){ f.face = face; f._atkAnim = 1; }));
          [['first', first], ['last', last]].forEach(function(p){
            var d = Math.abs(p[1].rot - rest.rot) + Math.abs(p[1].sx - rest.sx) + Math.abs(p[1].sy - rest.sy);
            if (d > (p[0] === 'first' ? 0.03 : 0.05)) bad.push(n + ' face ' + face + ' ' + p[0] + ': ' + d.toFixed(3));
          });
        });
      });
      return bad;
    })()`);
    expect(off, 'swings that begin or end off-centre').toEqual([]);
  });

  it('produces only finite numbers across a whole swing, on either side, at any damage', () => {
    const { window: w } = loadMonolith();
    w.eval(RECORDER);
    const bad = w.eval(`(function(){
      var out = [];
      ${JSON.stringify(BATCH_7)}.forEach(function(n){
        for (var t = 0; t <= ATK_ANIM; t++) for (var face = -1; face <= 1; face += 2) for (var pct = 0; pct <= 300; pct += 150) for (var fury = 0; fury <= 100; fury += 100) {
          var ops = window.__deform(n, function(f){ f._atkAnim = t; f.face = face; f.pct = pct; f._fury = fury; f._hasBeen = pct > 100; });
          for (var i = 0; i < ops.length; i++) for (var k = 1; k < ops[i].length; k++) if (!isFinite(ops[i][k])) out.push(n + ' ' + ops[i][0]);
        }
      });
      return out;
    })()`);
    expect(bad, 'non-finite transform values').toEqual([]);
  });

  it('never flips a fighter inside out: no scale below 0.6 or above 1.5 anywhere in a swing', () => {
    const { window: w } = loadMonolith();
    w.eval(RECORDER); w.eval(NET);
    const bad = w.eval(`(function(){
      var out = [];
      ${JSON.stringify(BATCH_7)}.forEach(function(n){
        for (var t = 0; t <= ATK_ANIM; t++) for (var ht = 0; ht < 40; ht += 13) {
          hazardT = ht;
          var r = window.__net(window.__deform(n, function(f){ f._atkAnim = t; f._fury = 100; }));
          if (r.sx < 0.6 || r.sx > 1.5 || r.sy < 0.6 || r.sy > 1.5) out.push(n + ' t' + t + ' ' + r.sx.toFixed(2) + 'x' + r.sy.toFixed(2));
        }
      });
      return out;
    })()`);
    expect(bad, 'scales that read as broken').toEqual([]);
  });
});

describe('Batch 7 -- the beats that carry the character', () => {
  // the swing sampled tick by tick: [{rot, sx, sy}] with face = 1
  const SWING = (w, name, mutate = '') => w.eval(`(function(){
    var out = [];
    for (var e = 0; e < ATK_ANIM; e++){
      hazardT = 5;
      var net = window.__net(window.__deform(${JSON.stringify(name)}, function(f){ f._atkAnim = ATK_ANIM - e; ${mutate} }));
      out.push({ rot: net.rot, sx: net.sx, sy: net.sy, shear: net.shear });
    }
    return out;
  })()`);
  const peaks = (xs, fromTop = true) => xs.filter((v, i) => i > 0 && i < xs.length - 1 && (fromTop ? v > xs[i - 1] && v >= xs[i + 1] && v > 0 : v < xs[i - 1] && v <= xs[i + 1] && v < 0));
  const boot = () => { const { window: w } = loadMonolith(); w.eval(RECORDER); w.eval(NET); return w; };

  it('Balloon stamps twice before he swings, and floats at rest', () => {
    const w = boot();
    const s = SWING(w, 'Balloon');
    const dips = s.slice(0, 7).map((v) => 1 - v.sy);
    expect(peaks(dips).length, 'two stamps').toBe(2);
    const rest = [0, 40, 80, 120].map((ht) => w.eval(`hazardT = ${ht}; window.__net(window.__deform('Balloon', null)).sy`));
    expect(new Set(rest.map((v) => v.toFixed(3))).size, 'the helium never settles').toBeGreaterThan(2);
  });

  it('Bomb stutters: two separate bumps with a hitch between them', () => {
    const w = boot();
    const s = SWING(w, 'Bomb');
    const lean = s.map((v) => v.rot);
    expect(peaks(lean).length, 'two bumps').toBe(2);
    const first = lean.indexOf(Math.max(...lean.slice(0, 7)));
    const gap = Math.min(...lean.slice(first, first + 5));
    expect(gap, 'back to nearly upright between them').toBeLessThan(Math.max(...lean) * 0.35);
  });

  it('Knife cocks the blade back, flicks long and thin, and holds it a beat', () => {
    const w = boot();
    const s = SWING(w, 'Knife');
    expect(Math.min(...s.map((v) => v.rot)), 'cocked back first').toBeLessThan(-0.1);
    expect(Math.max(...s.map((v) => v.rot)), 'then through').toBeGreaterThan(0.25);
    const top = s.reduce((a, v, i) => (v.rot > s[a].rot ? i : a), 0);
    expect(s[top].sy, 'long').toBeGreaterThan(1.08);
    expect(s[top].sx, 'and thin').toBeLessThan(0.95);
    expect(s[Math.min(s.length - 1, top + 3)].rot, 'held there, not snapped back').toBeGreaterThan(0.04);
  });

  it("Paintbrush's swing grows with their fury, and they shake holding it in", () => {
    const w = boot();
    const calm = SWING(w, 'Paintbrush', 'f._fury = 0;'), mad = SWING(w, 'Paintbrush', 'f._fury = 100;');
    expect(Math.max(...mad.map((v) => v.rot)), 'brought down harder when furious').toBeGreaterThan(Math.max(...calm.map((v) => v.rot)) * 1.3);
    const shake = (fury) => w.eval(`(function(){ var m = 0; for (var ht = 0; ht < 40; ht++){ hazardT = ht; m = Math.max(m, Math.abs(window.__net(window.__deform('Paintbrush', function(f){ f._fury = ${fury}; })).rot)); } return m; })()`);
    expect(shake(0), 'calm: still').toBe(0);
    expect(shake(100), 'furious: shaking').toBeGreaterThan(0.015);
  });

  it('Taco (II) has no gather: she never leans back, and she holds the kick', () => {
    const w = boot();
    const s = SWING(w, 'Taco (II)');
    expect(Math.min(...s.map((v) => v.rot)), 'never leans back').toBeGreaterThanOrEqual(0);
    const held = s.filter((v) => v.rot > 0.29).length;
    expect(held, 'held at full lean for a beat').toBeGreaterThanOrEqual(4);
    expect(s[3].rot, 'in by the fourth tick').toBeGreaterThan(0.15);
  });

  it('Dough is a beat behind: nothing moves for the first ticks, then he stretches like dough', () => {
    const w = boot();
    const s = SWING(w, 'Dough');
    expect(s.slice(0, 4).every((v) => Math.abs(v.rot) < 1e-9 && Math.abs(v.sy - 1) < 1e-9), 'the first four ticks are still').toBe(true);
    expect(Math.max(...s.map((v) => v.sy)), 'then he stretches').toBeGreaterThan(1.25);
    const knife = SWING(w, 'Knife');
    expect(knife.findIndex((v) => Math.abs(v.rot) > 0.02), 'later than a fighter who gathers at once').toBeLessThan(s.findIndex((v) => Math.abs(v.rot) > 0.02));
  });

  it('Test Tube measures first: a long still tilt back, then one exact strike with no overshoot', () => {
    const w = boot();
    const s = SWING(w, 'Test Tube');
    const held = s.filter((v) => v.rot < -0.095).length;
    expect(held, 'held for most of the first half').toBeGreaterThanOrEqual(5);
    const peak = Math.max(...s.map((v) => v.rot));
    expect(peak, 'the strike').toBeGreaterThan(0.2);
    const after = s.slice(s.findIndex((v) => v.rot === peak) + 1).map((v) => v.rot);
    expect(Math.min(...after), 'and it does not swing back past upright').toBeGreaterThan(-0.02);
  });

  it('Jack cracks his knuckles twice on the gather: two sharp jerks, then the punch', () => {
    const w = boot();
    const s = SWING(w, 'Jack');
    const jerks = s.slice(0, 6).map((v) => v.rot).filter((r, i, a) => r < -0.05 && (i === 0 || a[i - 1] >= -0.05));
    expect(jerks.length, 'two jerks').toBe(2);
    expect(Math.max(...s.map((v) => v.rot)), 'then a stiff punch').toBeGreaterThan(0.18);
  });

  it('Fan shuts on the gather and snaps open on the hit: the opposite of a book', () => {
    const w = boot();
    const s = SWING(w, 'Fan');
    expect(Math.min(...s.slice(0, 6).map((v) => v.sx)), 'shut').toBeLessThan(0.9);
    expect(Math.max(...s.slice(5, 13).map((v) => v.sx)), 'open').toBeGreaterThan(1.15);
  });

  it('Blueberry slumps at rest, and his punch comes late and low', () => {
    const w = boot();
    const rest = w.eval(`window.__net(window.__deform('Blueberry', null))`);
    expect(rest.sy, 'a slump').toBeLessThan(0.99);
    expect(rest.rot, 'leaning back, away from whoever is there').toBeLessThan(0);
    const s = SWING(w, 'Blueberry');
    const firstMove = s.findIndex((v) => v.rot > 0.02);
    expect(firstMove, 'nothing happens for the first third').toBeGreaterThanOrEqual(5);
    expect(Math.max(...s.map((v) => v.rot)), 'and the punch is the least that will do').toBeLessThan(0.14);
  });

  it('Silver Spoon holds his chin up at rest and dips through the scoop', () => {
    const w = boot();
    const rest = w.eval(`window.__net(window.__deform('Silver Spoon', null))`);
    expect(rest.rot, 'chin up: tipped back').toBeLessThan(0);
    const dips = w.eval(`(function(){ var out = []; for (var e = 0; e < ATK_ANIM; e++){ var ops = window.__deform('Silver Spoon', function(f){ f._atkAnim = ATK_ANIM - e; }); var t = ops.filter(function(o){ return o[0] === 'translate' && o[2] !== 0 && Math.abs(o[2]) < 5; }); out.push(t.length ? t[0][2] : 0); } return out; })()`);
    expect(Math.max(...dips), 'his weight dips').toBeGreaterThan(0.5);
    expect(dips[0], 'and starts level').toBe(0);
  });

  it('Starfruit keeps his Has-Been slump, and gains a pose on his swing', () => {
    const w = boot();
    const flat = w.eval(`window.__net(window.__deform('Starfruit', function(f){ f._hasBeen = false; }))`);
    const slumped = w.eval(`window.__net(window.__deform('Starfruit', function(f){ f._hasBeen = true; }))`);
    expect(flat.n, 'nothing at rest').toBe(0);
    expect(slumped.sy, 'the slump: lower').toBeLessThan(0.95);
    expect(slumped.rot, 'and leaning').not.toBe(0);
    const s = SWING(w, 'Starfruit');
    expect(Math.max(...s.map((v) => v.sx)), 'arms out: wider').toBeGreaterThan(1.1);
    const both = SWING(w, 'Starfruit', 'f._hasBeen = true;');
    expect(Math.min(...both.map((v) => v.sy)), 'the slump rides under the pose').toBeLessThan(0.95);
  });

  it("Tapey's whirr is a quick shake on the gather, and her red button still glows while she records", () => {
    const w = boot();
    const rot = w.eval(`(function(){ var out = []; for (var e = 0; e < 5; e++){ hazardT = 5; out.push(window.__net(window.__deform('Tapey', function(f){ f._atkAnim = ATK_ANIM - e; })).rot); } return out; })()`);
    const flips = rot.slice(1).filter((v, i) => Math.sign(v - rot[i]) !== Math.sign(rot[i] - (rot[i - 1] === undefined ? rot[0] : rot[i - 1]))).length;
    expect(flips, 'it rocks back and forth').toBeGreaterThanOrEqual(1);
    const glow = w.eval(`(function(){ var f = makeFighter(ROSTER.find(function(r){ return r.name==='Tapey'; }), 100, 100, 0); var c = window.__mkCtx(); f._rec = null; FIGHTER_ANIM.Tapey.over(f, c); var off = c.ops.length; f._rec = {snap:[]}; c = window.__mkCtx(); FIGHTER_ANIM.Tapey.over(f, c); return [off, c.ops.length]; })()`);
    expect(glow[0]).toBe(0);
    expect(glow[1], 'the button').toBeGreaterThan(0);
  });

  it("Cherries bob out of step at rest, and swing in two beats", () => {
    const w = boot();
    const rest = [0, 15, 30, 45].map((ht) => w.eval(`hazardT = ${ht}; window.__net(window.__deform('Cherries', null)).rot`));
    expect(Math.max(...rest) - Math.min(...rest), 'a seesaw').toBeGreaterThan(0.03);
    const s = SWING(w, 'Cherries');
    expect(Math.max(...s.map((v) => v.rot)), 'one cherry leads').toBeGreaterThan(0.12);
    expect(Math.min(...s.map((v) => v.rot)), 'and the other answers the other way').toBeLessThan(-0.05);
  });
});

describe('Batch 7 -- survives every hostile draw state', () => {
  it('draws all thirty-two through flash / burn / yoyle / star / invuln / mirror / air / landing', () => {
    const { window: w } = loadMonolith();
    w.eval(`
      SETTINGS.count = ${BATCH_7.length};
      startMatch();
      fighters.length = 0;
      ${JSON.stringify(BATCH_7)}.forEach(function(n,i){
        fighters.push(makeFighter(ROSTER.find(function(r){ return r.name===n; }), 200+i*30, 300, i));
      });
    `);
    const states = [
      '', 'f.flash=6', 'f.burn=40', 'f._yoyleT=200', 'f._starT=200', 'f.invuln=30',
      'f.face=-1', 'f.vy=-9', 'f.vy=12', 'f.vx=5', 'f._landSquash=5',
      'f._atkAnim=7', 'f._hurtAnim=9', 'f.smashHold=44', 'f._hasBeen=true; f._fury=100; f._rec={snap:[]}',
      'f._atkAnim=7; f.face=-1; f.smashHold=20; f.burn=10',
    ];
    for (const mutate of states) {
      expect(() => w.eval(`
        for(const f of fighters){ f.flash=0; f.burn=0; f._yoyleT=0; f._starT=0; f.invuln=0;
          f.face=1; f.vx=0; f.vy=0; f._landSquash=0; f._atkAnim=0; f._hurtAnim=0; f.smashHold=0; f._hasBeen=false; f._fury=0; f._rec=null;
          ${mutate}; }
        draw();
      `), `draw() with [${mutate || 'resting'}]`).not.toThrow();
    }
  });
});

describe('Batch 7 -- written up', () => {
  const doc = readFileSync('docs/animation-move-design.md', 'utf8');
  it('has a Batch 7 table with a row, a beat and a grounding for every one of the thirty-two', () => {
    const at = doc.indexOf('## Batch 7');
    expect(at, 'a Batch 7 section').toBeGreaterThan(-1);
    const table = doc.slice(at);
    for (const n of BATCH_7) {
      const row = table.split('\n').find((l) => l.startsWith(`| **${n}**`));
      expect(row, `a row for ${n}`).toBeTruthy();
      const cells = row.split('|').map((c) => c.trim()).filter(Boolean);
      expect(cells.length, `${n}: fighter, trait, beat, grounding`).toBe(4);
      expect(cells.every((c) => c.length > 6), `${n}: no empty cells`).toBe(true);
    }
  });
});
