import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { loadMonolith } from './helpers/load-monolith.js';
import { spyMediaConstructors } from './helpers/harness.js';
import { mulberry32 } from './helpers/prng.js';

// A boot whose 2D context RECORDS every call, so the render path can be asserted instead of merely
// run. loadMonolith's stub swallows calls silently, which is right for the golden harness and
// useless for proving what was drawn — and the browser is not always available to look.
function bootRecording(seed = 7) {
  const html = readFileSync('artifacts/V1/index.html', 'utf8');
  const rec = [];
  const dom = new JSDOM(html, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(window) {
      const grad = { addColorStop() {} };
      window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
        get: (_t, p) => (
          p === 'measureText' ? () => ({ width: 0 })
            : p === 'canvas' ? { width: 1100, height: 720 }
              : p === 'getImageData' ? () => ({ data: [] })
                : (p === 'createLinearGradient' || p === 'createRadialGradient'
                  || p === 'createConicGradient' || p === 'createPattern') ? () => grad
                  : (...args) => { rec.push({ op: p, args }); }),
        set: () => true,
      });
      window.Math.random = mulberry32(seed);
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
    },
  });
  return { w: dom.window, rec };
}

/** Pretend a render has finished decoding, without any network or Image constructor. */
const FAKE_DECODED = (w, name, nw, nh) => w.eval(
  `SPRITES[${JSON.stringify(name)}]._req = true;
   SPRITES[${JSON.stringify(name)}].img = { complete:true, naturalWidth:${nw}, naturalHeight:${nh} };`);

// ---- CTM replay ------------------------------------------------------------------------------
// The recorder captures ops, not the matrix, and a Proxy has no getTransform(). Replaying the
// transform ops gives the real CTM at any point in the recording, which is the only way to prove
// WHERE in the transform stack something was drawn — e.g. that a render is inside the squash and
// the nametag is outside it.
const I = [1, 0, 0, 1, 0, 0];
const mul = (A, B) => [
  A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1],
  A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3],
  A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5],
];
/** CTM in force when `rec[i]` ran, replaying every transform op from the start of the recording. */
function ctmAt(rec, i) {
  let m = I; const stack = [];
  for (let k = 0; k < i; k++) {
    const { op, args: a } = rec[k];
    if (op === 'save') stack.push(m);
    else if (op === 'restore') m = stack.pop() || I;
    else if (op === 'translate') m = mul(m, [1, 0, 0, 1, a[0], a[1]]);
    else if (op === 'scale') m = mul(m, [a[0], 0, 0, a[1], 0, 0]);
    else if (op === 'rotate') m = mul(m, [Math.cos(a[0]), Math.sin(a[0]), -Math.sin(a[0]), Math.cos(a[0]), 0, 0]);
    else if (op === 'transform') m = mul(m, a.slice(0, 6));
    else if (op === 'setTransform') m = a.slice(0, 6);
  }
  return m;
}
const findAt = (rec, op) => rec.findIndex((c) => c.op === op);

/** One lone FFA fighter — no team ring, no you-marker, no smash arc to pollute the op counts. */
const soloFighter = (w, name) => w.eval(
  `SETTINGS.mode='ffa'; SETTINGS.count=2; startMatch();
   fighters.length = 0;
   fighters.push(makeFighter(ROSTER.find(r=>r.name===${JSON.stringify(name)}), 300, 300, 0));
   fighters[0].you = false; fighters[0].smashHold = 0;`);

// Sprite rendering. Three things have to stay true for real character art to be safe to ship:
//
//  1. It is RENDER-ONLY. drawFighter picks the sprite off `f.name`, which serializeState already
//     sends, so a client draws what the host draws with no state-sync change.
//  2. Nothing loads at eval time. The registry may carry PNG paths, but the Image constructor is
//     only reached on the first DRAW — a headless boot must never touch a media constructor while
//     the script parses, or the golden harness starts fetching assets it cannot fetch.
//  3. A fighter without an entry falls back to the generic blob, unchanged.

const BATCH_1 = ['Firey', 'Leafy', 'Bubble', 'Blocky', 'Pen', 'Pencil',
  'Match', 'Ice Cube', 'Puffball', 'Teardrop', 'Bomby', 'Rocky'];

describe('sprite registry', () => {
  it('covers the batch-1 twelve, each with art and a silhouette', () => {
    const { window: w } = loadMonolith();
    for (const name of BATCH_1) {
      const sp = w.eval(`SPRITES[${JSON.stringify(name)}]`);
      expect(sp, `${name} has a sprite`).toBeTruthy();
      expect(typeof sp.draw, `${name}.draw`).toBe('function');
      expect(typeof sp.path, `${name}.path — needed to clip flash/burn/yoyle/star tints`).toBe('function');
    }
  });

  it('points all twelve at a real render file on disk', () => {
    const { window: w } = loadMonolith();
    for (const name of BATCH_1) {
      const src = w.eval(`SPRITES[${JSON.stringify(name)}].src`);
      expect(src, `${name} has a render`).toMatch(/^assets\/sprites\/[a-z-]+\.png$/);
      // The path is resolved relative to index.html at runtime, so it must exist under the
      // publish root or the fighter silently drops back to vector art in production.
      expect(() => readFileSync(`artifacts/V1/${src}`), `${src} exists`).not.toThrow();
    }
  });

  it('gives every entry a working fallback, so a missing render is never a blank fighter', () => {
    // This replaced an assertion that SOME fighter still had no entry at all. That was only ever a
    // proxy for the thing that actually matters: the vector path has to survive, because it is what
    // draws during the decode of the very first frame and FOREVER if a PNG 404s. Now that the whole
    // roster has art, the proxy is meaningless but the invariant is more important than ever.
    const { window: w } = loadMonolith();
    const broken = w.eval(`
      Object.keys(SPRITES).filter(function(k){
        var s = SPRITES[k];
        return typeof s.path !== 'function' || typeof s.draw !== 'function';
      })`);
    expect(broken, 'entries that would render nothing without their PNG').toEqual([]);
    // and every fighter the player can pick is covered
    const uncovered = w.eval(`ROSTER.filter(function(r){ return r.play && !SPRITES[r.name]; }).map(function(r){ return r.name; })`);
    expect(uncovered, 'playable fighters with no sprite entry').toEqual([]);
  });

  it('points every entry at a render file that actually exists', () => {
    // A typo in a generated src is invisible in play — the fighter just silently stays a blob.
    const { window: w } = loadMonolith();
    const srcs = w.eval(`Object.keys(SPRITES).map(function(k){ return [k, SPRITES[k].src||'']; })`);
    const missing = srcs
      .filter(([, src]) => src)
      .filter(([, src]) => !existsSync(`artifacts/V1/${src}`))
      .map(([name, src]) => `${name} -> ${src}`);
    expect(missing, 'sprite entries pointing at files that are not there').toEqual([]);
  });

  it('constructs no Image while the monolith is parsed', () => {
    const spy = spyMediaConstructors();
    let made = 0;
    const Orig = globalThis.Image;
    globalThis.Image = class { constructor() { made++; } };
    try { loadMonolith(); } finally { globalThis.Image = Orig; spy.restore(); }
    expect(made, 'no top-level media constructor').toBe(0);
  });
});

describe('drawing sprite fighters headlessly', () => {
  // Runs the REAL draw() over a roster that is entirely sprite fighters, in every state that
  // changes how a sprite is tinted or deformed. Any throw from the new draw paths surfaces here.
  it('draws all twelve through flash / burn / yoyle / star / invuln / squash without throwing', () => {
    const { window: w } = loadMonolith();
    w.eval(`
      SETTINGS.count = ${BATCH_1.length};
      startMatch();
      const names = ${JSON.stringify(BATCH_1)};
      fighters.length = 0;
      names.forEach((n,i)=>{
        const r = ROSTER.find(x=>x.name===n);
        const f = makeFighter(r, 200+i*70, 300, i);
        fighters.push(f);
      });
    `);
    const states = [
      '',                                                  // resting
      'f.flash=6',                                         // hit flash
      'f.burn=40',                                         // on fire
      'f._yoyleT=200',                                     // yoyleberry metal
      'f._starT=200',                                      // invincibility strobe
      'f.invuln=30',                                       // spawn blink (translucent art)
      'f.face=-1',                                         // mirrored
      'f.vy=-9',                                           // rising stretch
      'f.vy=12',                                           // falling stretch + shear
      'f.vx=5',                                            // running lean
      'f._landSquash=5',                                   // landing squat
      'f._dashing=8; f._dashVY=3',                         // FIGHTER_ANIM pre-body (Leafy blade)
      'f.cloud=200',                                       // Teardrop cloud form
    ];
    for (const mutate of states) {
      expect(() => w.eval(`
        for(const f of fighters){ f.flash=0; f.burn=0; f._yoyleT=0; f._starT=0; f.invuln=0;
          f.face=1; f.vx=0; f.vy=0; f._landSquash=0; f._dashing=0; f.cloud=0; ${mutate}; }
        draw();
      `), `draw() with [${mutate || 'resting'}]`).not.toThrow();
    }
  });

  it('renders sprite and blob fighters side by side in one frame', () => {
    // Both code paths must survive the same frame. The cast is chosen at runtime rather than
    // hard-coded: sprite coverage grows a set at a time, so naming today's blob fighters here
    // just means this test fails the day they are given art — which is not a defect.
    const { window: w } = loadMonolith();
    w.eval(`
      SETTINGS.count = 4; startMatch();
      fighters.length = 0;
      var withArt = ROSTER.filter(function(r){ return r.play && SPRITES[r.name]; }).slice(0,2);
      var noArt   = ROSTER.filter(function(r){ return r.play && !SPRITES[r.name]; }).slice(0,2);
      // If the whole roster ends up with art, force the fallback path anyway by giving a fighter a
      // name the registry does not know — that path still runs for every pre-decode first frame.
      while(noArt.length < 2) noArt.push(Object.assign({}, withArt[0], { name:'Unregistered'+noArt.length }));
      withArt.concat(noArt).forEach(function(r,i){
        fighters.push(makeFighter(r, 200+i*80, 300, i));
      });
    `);
    const hasArt = w.eval('fighters.map(function(f){ return !!SPRITES[f.name]; })');
    expect(hasArt, 'the frame must mix sprite and blob fighters').toEqual([true, true, false, false]);
    expect(() => w.eval('draw()')).not.toThrow();
  });

  it('renders a decoded image INSTEAD of the vector art, limbs and shared face', () => {
    // The renders are whole characters. If the stub limbs or the shared BFDI face still drew,
    // every fighter would sprout a second set of arms and a second pair of eyes.
    const { w, rec } = bootRecording();
    soloFighter(w, 'Firey');
    FAKE_DECODED(w, 'Firey', 150, 200);

    rec.length = 0;
    w.eval('drawFighter(fighters[0])');
    const withImg = rec.filter((c) => c.op === 'drawImage');
    expect(withImg, 'the render is drawn once').toHaveLength(1);
    expect(rec.filter((c) => c.op === 'arc'), 'no shared face (its pupils/mouth are arcs)').toHaveLength(0);
    expect(rec.filter((c) => c.op === 'lineTo'), 'no stub limbs (they are moveTo/lineTo)').toHaveLength(0);

    // …and with the image gone the vector art comes straight back.
    w.eval("SPRITES['Firey'].img = null");
    rec.length = 0;
    w.eval('drawFighter(fighters[0])');
    expect(rec.filter((c) => c.op === 'drawImage'), 'no image').toHaveLength(0);
    expect(rec.filter((c) => c.op === 'arc').length, 'shared face is back').toBeGreaterThan(0);
    expect(rec.filter((c) => c.op === 'lineTo').length, 'stub limbs are back').toBeGreaterThan(0);
  });

  it('contain-fits each render to its own aspect ratio and stands it on the floor line', () => {
    // Nothing may be stretched: a tall character is capped by imgH, a wide one by imgW, and both
    // keep the source aspect exactly. Feet land on R+12, where the stub legs used to end.
    const { w, rec } = bootRecording();
    const R = 24, FLOOR = R + 12;
    const cases = [
      // name,      natural w/h,  which bound should win
      ['Pencil', 94, 200, 'height'],
      ['Rocky', 257, 186, 'width'],
    ];
    for (const [name, nw, nh, bound] of cases) {
      soloFighter(w, name);
      FAKE_DECODED(w, name, nw, nh);
      const { imgH, imgW } = w.eval(`({imgH:SPRITES[${JSON.stringify(name)}].imgH, imgW:SPRITES[${JSON.stringify(name)}].imgW})`);

      rec.length = 0;
      w.eval('drawFighter(fighters[0])');
      const [, , , dw, dh] = rec.find((c) => c.op === 'drawImage').args;

      expect(dw / dh, `${name} keeps its source aspect`).toBeCloseTo(nw / nh, 5);
      expect(dh, `${name} fits the height cap`).toBeLessThanOrEqual(imgH * R + 1e-6);
      expect(dw, `${name} fits the width cap`).toBeLessThanOrEqual(imgW * R + 1e-6);
      if (bound === 'height') expect(dh, `${name} is height-bound`).toBeCloseTo(imgH * R, 5);
      else expect(dw, `${name} is width-bound`).toBeCloseTo(imgW * R, 5);

      // drawImage is centred at the origin, so the translate is what puts the feet down.
      const ty = rec.filter((c) => c.op === 'translate').pop().args[1];
      expect(ty + dh / 2, `${name} stands on the floor line`).toBeCloseTo(FLOOR, 5);
    }
  });

  it('still tints a decoded render through every state', () => {
    const { w, rec } = bootRecording();
    soloFighter(w, 'Bubble');
    FAKE_DECODED(w, 'Bubble', 200, 200);
    for (const st of ['flash=6', '_yoyleT=200', 'burn=40']) {
      rec.length = 0;
      w.eval(`const f=fighters[0]; f.flash=0; f._yoyleT=0; f._starT=0; f.burn=0; f.${st}; drawFighter(f)`);
      // body + one tint pass, both through the cached source-atop copy
      expect(rec.filter((c) => c.op === 'drawImage').length, `${st} adds a tint pass (base + offscreen copy + overlay)`).toBe(3);
    }
  });

  // ---- COMPOSITION -----------------------------------------------------------------------------
  // The owner playtested the integrated build and reported "no animations". These lock down the
  // order drawFighter composes a sprite fighter in, because every one of them is invisible to a
  // "does it throw" test and every one of them reads as a dead fighter on screen.

  it('draws a decoded render INSIDE the universal squash/stretch', () => {
    const { w, rec } = bootRecording();
    soloFighter(w, 'Firey');
    FAKE_DECODED(w, 'Firey', 150, 200);

    // the SIGN of the horizontal scale carries the facing mirror (see `flip`), so the squash is
    // only ever about its magnitude.
    const wide = (m) => Math.abs(m[0]);

    // rising fast -> stretch tall and thin
    rec.length = 0;
    w.eval('const f=fighters[0]; f.onground=false; f.vy=-12; f.vx=0; f._landSquash=0; drawFighter(f)');
    let m = ctmAt(rec, findAt(rec, 'drawImage'));
    expect(m[3], 'render is stretched tall while rising').toBeGreaterThan(1.15);
    expect(wide(m), 'render is squeezed thin while rising').toBeLessThan(0.9);

    // just landed -> squat wide and short
    rec.length = 0;
    w.eval('const f=fighters[0]; f.onground=true; f.vy=0; f.vx=0; f._landSquash=6; drawFighter(f)');
    m = ctmAt(rec, findAt(rec, 'drawImage'));
    expect(m[3], 'render squats on the land-squash').toBeLessThan(0.95);
    expect(wide(m), 'render widens on the land-squash').toBeGreaterThan(1.05);
  });

  it('leaves the nametag outside the deform — unscaled and upright', () => {
    const { w, rec } = bootRecording();
    soloFighter(w, 'Firey');
    FAKE_DECODED(w, 'Firey', 150, 200);
    rec.length = 0;
    w.eval('const f=fighters[0]; f.onground=false; f.vy=-12; f.vx=6; drawFighter(f)');
    const m = ctmAt(rec, findAt(rec, 'fillText'));
    expect([m[0], m[1], m[2], m[3]], 'nametag draws at identity scale/rotation').toEqual([1, 0, 0, 1]);
  });

  it("lets a FIGHTER_ANIM pre-body REPLACE a fighter's render outright", () => {
    // Leafy's Sharp Shadow dash turns her whole body into a leaf blade. If the sprite path drew
    // underneath it, the dash would read as her PNG sliding sideways.
    const { w, rec } = bootRecording();
    soloFighter(w, 'Leafy');
    FAKE_DECODED(w, 'Leafy', 150, 200);

    rec.length = 0;
    w.eval('const f=fighters[0]; f._dashing=0; drawFighter(f)');
    expect(rec.filter((c) => c.op === 'drawImage'), 'not dashing: the render draws').toHaveLength(1);

    rec.length = 0;
    w.eval('const f=fighters[0]; f._dashing=8; f._dashVY=3; drawFighter(f)');
    expect(rec.filter((c) => c.op === 'drawImage'), 'dashing: the render is fully replaced').toHaveLength(0);
    expect(rec.filter((c) => c.op === 'rotate').length, 'the blade is angled along the dash').toBeGreaterThan(0);
    expect(rec.filter((c) => c.op === 'fill').length, 'the blade silhouette is filled').toBeGreaterThan(0);
  });

  it('runs a FIGHTER_ANIM post-body overlay OVER the render', () => {
    const { w, rec } = bootRecording();
    soloFighter(w, 'Firey');
    FAKE_DECODED(w, 'Firey', 150, 200);
    w.eval("FIGHTER_ANIM['Firey'] = { over(f, c){ c.fillRect(1,2,3,4); } };");
    rec.length = 0;
    w.eval('drawFighter(fighters[0])');
    const img = findAt(rec, 'drawImage');
    const overlay = findAt(rec, 'fillRect');
    expect(img, 'the render drew').toBeGreaterThan(-1);
    expect(overlay, 'the overlay drew').toBeGreaterThan(-1);
    expect(overlay, 'trails/effects composite on top of the sprite').toBeGreaterThan(img);
    // …and an overlay never inherits the squash: it is drawn in unscaled centre space.
    const m = ctmAt(rec, overlay);
    expect([m[0], m[1], m[2], m[3]], 'overlay is undeformed').toEqual([1, 0, 0, 1]);
  });

  it('never leaves a grounded render as a still image', () => {
    // THE REGRESSION. A render carries its own limbs, so drawSpriteBody suppresses the stub legs —
    // and with them the only thing that moved while a fighter walked or stood. Velocity
    // squash/stretch does not fire at rest, so the twelve mains froze into sliding photographs.
    const { w, rec } = bootRecording();
    soloFighter(w, 'Firey');
    FAKE_DECODED(w, 'Firey', 150, 200);

    const poseAt = (t, setup) => {
      rec.length = 0;
      w.eval(`hazardT=${t}; const f=fighters[0]; f.onground=true; f.vy=0; f._landSquash=0; ${setup}; drawFighter(f)`);
      return ctmAt(rec, findAt(rec, 'drawImage'));
    };
    const differs = (a, b) => a.some((v, i) => Math.abs(v - b[i]) > 1e-3);

    expect(differs(poseAt(0, 'f.vx=0'), poseAt(9, 'f.vx=0')), 'standing still still breathes').toBe(true);
    const w1 = poseAt(0, 'f.vx=1.5'); const w2 = poseAt(5, 'f.vx=1.5');
    expect(differs(w1, w2), 'walking bobs and rocks').toBe(true);
    expect(Math.abs(w2[1]) + Math.abs(w2[2]), 'the walk rocks the body, not just its height').toBeGreaterThan(0);
  });

  it('keeps the rig off vector art, which still swings its own stub limbs', () => {
    const { w, rec } = bootRecording();
    soloFighter(w, 'Firey');                    // no FAKE_DECODED: vector art path
    rec.length = 0;
    w.eval('hazardT=0; const f=fighters[0]; f.onground=true; f.vx=1.5; drawFighter(f)');
    const a = rec.filter((c) => c.op === 'lineTo').map((c) => c.args.join());
    rec.length = 0;
    w.eval('hazardT=5; const f=fighters[0]; f.onground=true; f.vx=1.5; drawFighter(f)');
    const b = rec.filter((c) => c.op === 'lineTo').map((c) => c.args.join());
    expect(a.length, 'stub limbs drew').toBeGreaterThan(0);
    expect(a.join('|'), 'the legs still swing on their own').not.toBe(b.join('|'));
  });

  // ---- RIG STATES ------------------------------------------------------------------------------
  // "Animation must have multiple ones" — the owner's second note. One walk bob shared by the whole
  // cast reads as a screensaver. spriteRig is a state machine now, and these pin down that the
  // states actually differ from each other, that a crowd is not in lockstep, and that the two
  // event-driven states (attack, hitstun) are wired to the triggers that fire them.

  /** Total per-frame movement of the render's CTM across `n` frames — the state's "motion energy". */
  function energy(w, rec, setup, n = 30) {
    let prev = null; let sum = 0;
    for (let t = 0; t < n; t++) {
      rec.length = 0;
      w.eval(`hazardT=${t}; const f=fighters[0]; f.flash=0; f._atkAnim=0; f._hurtAnim=0; f.smashHold=0;
              f._landSquash=0; f.vy=0; f.onground=true; ${setup}; drawFighter(f)`);
      const m = ctmAt(rec, findAt(rec, 'drawImage'));
      if (prev) sum += m.reduce((a, v, i) => a + Math.abs(v - prev[i]), 0);
      prev = m;
    }
    return sum;
  }
  const stateOf = (w, rec, setup) => {
    rec.length = 0;
    w.eval(`const f=fighters[0]; f.flash=0; f._atkAnim=0; f._hurtAnim=0; f.smashHold=0; f._landSquash=0;
            f.vx=0; f.vy=0; f.onground=true; ${setup}; drawFighter(f)`);
    return w.eval('fighters[0]._rigState');
  };

  it('gives the rig distinct idle / walk / run / air / attack / hitstun states', () => {
    const { w, rec } = bootRecording();
    soloFighter(w, 'Firey');
    FAKE_DECODED(w, 'Firey', 150, 200);

    expect(stateOf(w, rec, 'f.vx=0'), 'standing').toBe('idle');
    expect(stateOf(w, rec, 'f.vx=1.5'), 'strolling').toBe('walk');
    expect(stateOf(w, rec, 'f.vx=7'), 'sprinting').toBe('run');
    expect(stateOf(w, rec, 'f.onground=false; f.vy=-9'), 'jumping').toBe('air-rise');
    expect(stateOf(w, rec, 'f.onground=false; f.vy=9'), 'falling').toBe('air-fall');
    expect(stateOf(w, rec, 'f.smashHold=30'), 'winding a smash').toBe('charge');
    expect(stateOf(w, rec, 'f._atkAnim=8; f.flash=6'), 'swinging').toBe('attack');
    expect(stateOf(w, rec, 'f._hurtAnim=9'), 'took a hit').toBe('hitstun');
    // a fighter clipped in the middle of its own swing reads as HIT, not as still swinging
    expect(stateOf(w, rec, 'f._atkAnim=8; f._hurtAnim=9'), 'clipped mid-swing').toBe('hitstun');
    // …and a netcode client, which is shipped `flash` but neither timer, still gets the reaction
    expect(stateOf(w, rec, 'delete f._hurtAnim; delete f._atkAnim; f.flash=9'), 'client puppet')
      .toBe('hitstun');
  });

  it('escalates motion energy from idle to walk to run', () => {
    // The point of separate states is that they LOOK different. A run that moves no more than a
    // walk is the same animation with a different name.
    const { w, rec } = bootRecording();
    soloFighter(w, 'Firey');
    FAKE_DECODED(w, 'Firey', 150, 200);

    const idle = energy(w, rec, 'f.vx=0');
    const walk = energy(w, rec, 'f.vx=1.5');
    const run = energy(w, rec, 'f.vx=7');
    expect(idle, 'idle still breathes').toBeGreaterThan(0);
    expect(walk, 'a walk moves more than a breath').toBeGreaterThan(idle * 3);
    expect(run, 'a run moves more than a walk').toBeGreaterThan(walk * 1.3);
  });

  it('blinks while idle — the idle is not one unbroken sine', () => {
    const { w, rec } = bootRecording();
    soloFighter(w, 'Firey');
    FAKE_DECODED(w, 'Firey', 150, 200);
    const ys = [];
    for (let t = 0; t < 150; t++) {
      rec.length = 0;
      w.eval(`hazardT=${t}; const f=fighters[0]; f.flash=0; f._atkAnim=0; f._hurtAnim=0; f.smashHold=0;
              f.vx=0; f.vy=0; f.onground=true; f._landSquash=0; drawFighter(f)`);
      ys.push(ctmAt(rec, findAt(rec, 'drawImage'))[3]);   // vertical scale
    }
    // the breath is gentle; the blink squint is a much sharper single-frame drop
    const steps = ys.slice(1).map((v, i) => Math.abs(v - ys[i]));
    const median = [...steps].sort((a, b) => a - b)[steps.length >> 1];
    expect(Math.max(...steps), 'a blink spikes well past the breath').toBeGreaterThan(median * 8);
  });

  it('keeps a crowd out of lockstep — the phase is per fighter', () => {
    const { w, rec } = bootRecording();
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=4; startMatch();
      fighters.length = 0;
      ['Firey','Firey','Firey','Firey'].forEach((n,i)=>{
        const f = makeFighter(ROSTER.find(x=>x.name===n), 200+i*70, 300, i);
        f.you=false; f.smashHold=0; f.invuln=0; fighters.push(f);
      });`);
    FAKE_DECODED(w, 'Firey', 150, 200);
    for (const setup of ['f.vx=0', 'f.vx=1.5', 'f.vx=7']) {
      rec.length = 0;
      w.eval(`hazardT=11; for(const f of fighters){ f.flash=0; f._atkAnim=0; f._hurtAnim=0; f.smashHold=0;
              f.vy=0; f.onground=true; f._landSquash=0; ${setup}; }
              for(const f of fighters) drawFighter(f);`);
      const poses = rec.map((c, i) => (c.op === 'drawImage' ? ctmAt(rec, i).join('|') : null)).filter(Boolean);
      expect(poses, 'all four drew').toHaveLength(4);
      expect(new Set(poses).size, `four fighters in [${setup}] hold four different poses`).toBe(4);
    }
  });

  it('arms the attack lunge at every attack entry point, and lets it decay', () => {
    const { window: w } = loadMonolith();
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=2; startMatch();
      fighters.length = 0;
      ['Firey','Bubble'].forEach((n,i)=>fighters.push(makeFighter(ROSTER.find(x=>x.name===n), 300+i*160, 300, i)));`);
    for (const call of ['doAttack(fighters[0])', 'doSmash(fighters[0],1)',
      'doSpecial(fighters[0])', 'doAttackSpecial(fighters[0])']) {
      expect(w.eval(`fighters[0]._atkAnim=0; ${call}; fighters[0]._atkAnim`), `${call} arms the lunge`)
        .toBeGreaterThan(0);
    }
    // and the sim winds it back down, or every fighter would lunge forever after their first swing
    const before = w.eval('fighters[0]._atkAnim=10; fighters[0]._atkAnim');
    w.eval('step()');
    expect(w.eval('fighters[0]._atkAnim'), 'the timer decays each tick').toBeLessThan(before);
  });

  it('lunges forward on an attack and jitters on a hit', () => {
    const { w, rec } = bootRecording();
    soloFighter(w, 'Firey');
    FAKE_DECODED(w, 'Firey', 150, 200);
    const x = (setup) => {
      rec.length = 0;
      w.eval(`hazardT=4; const f=fighters[0]; f.flash=0; f._atkAnim=0; f._hurtAnim=0; f.smashHold=0;
              f.vx=0; f.vy=0; f.onground=true; f._landSquash=0; ${setup}; drawFighter(f)`);
      return ctmAt(rec, findAt(rec, 'drawImage'))[4];    // horizontal offset from the fighter's x
    };
    const rest = x('');
    expect(x('f.face=1; f._atkAnim=7'), 'lunges toward the facing side').toBeGreaterThan(rest + 2);
    expect(x('f.face=-1; f._atkAnim=7'), 'and the other way when turned around').toBeLessThan(rest - 2);
    expect(x('f.face=1; f.smashHold=45'), 'a charging smash winds BACK first').toBeLessThan(rest);
    // a hit shakes; two consecutive hitstun frames never sit in the same place
    const a = x('f._hurtAnim=10'); rec.length = 0;
    w.eval(`hazardT=5; const f=fighters[0]; f.vx=0; f.vy=0; f.onground=true; f._atkAnim=0;
            f.smashHold=0; f._landSquash=0; f.flash=0; f._hurtAnim=10; drawFighter(f)`);
    expect(Math.abs(ctmAt(rec, findAt(rec, 'drawImage'))[4] - a), 'hitstun jitters').toBeGreaterThan(0.5);
  });

  // ---- PUFFBALL FLOATS -------------------------------------------------------------------------
  // She is limbless and canonically hovers, so the shared walk/idle bob was planting a floating
  // creature on the floor. `float` gives her a rig of her own — and it must stay purely visual.

  it('hovers Puffball above her floor line, continuously, even while grounded', () => {
    const { w, rec } = bootRecording();
    soloFighter(w, 'Puffball');
    FAKE_DECODED(w, 'Puffball', 198, 200);

    const sample = (frames) => {
      const out = [];
      for (let t = 0; t < frames; t++) {
        rec.length = 0;
        w.eval(`hazardT=${t}; const f=fighters[0]; f.flash=0; f._atkAnim=0; f._hurtAnim=0; f.smashHold=0;
                f.vx=0; f.vy=0; f.onground=true; f._landSquash=0; drawFighter(f)`);
        out.push(ctmAt(rec, findAt(rec, 'drawImage'))[5]);
      }
      return out;
    };
    expect(w.eval("SPRITES['Puffball'].float"), 'she is registered as a floater').toBe(true);

    const floating = sample(140);          // > one full hover period (hazardT*0.05 -> ~126 frames)
    expect(w.eval("fighters[0]._rigState"), 'grounded, she is still floating').toBe('float');
    w.eval("SPRITES['Puffball'].float = false");
    const planted = sample(140);
    w.eval("SPRITES['Puffball'].float = true");

    // 1. she is ALWAYS above where the ground rig would put her — her feet never plant
    for (let i = 0; i < floating.length; i++) {
      expect(floating[i], `frame ${i} rides above the floor line`).toBeLessThan(planted[i] - 1);
    }
    // 2. the hover is continuous, not a two-step bob: it never stalls between frames
    const steps = floating.slice(1).map((v, i) => Math.abs(v - floating[i]));
    expect(Math.min(...steps), 'she is moving on every single frame').toBeGreaterThan(0);
    // 3. and it swings by roughly 2x floatAmp
    const swing = Math.max(...floating) - Math.min(...floating);
    expect(swing, 'the hover has real travel').toBeGreaterThan(7);
    expect(swing, '…but it is a hover, not a pogo stick').toBeLessThan(20);
  });

  it('keeps the hover render-only — physics, hitbox and netcode never see it', () => {
    const { window: w } = loadMonolith();
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=2; startMatch();
      fighters.length=0;
      fighters.push(makeFighter(ROSTER.find(r=>r.name==='Puffball'), 300, 300, 0));
      fighters.push(makeFighter(ROSTER.find(r=>r.name==='Firey'), 460, 300, 1));`);
    const before = w.eval('JSON.stringify({y:fighters[0].y, r:fighters[0].r, og:fighters[0].onground})');
    w.eval('draw(); draw(); draw()');
    expect(w.eval('JSON.stringify({y:fighters[0].y, r:fighters[0].r, og:fighters[0].onground})'))
      .toBe(before);
    // and nothing float-related is serialized — a client redraws it from `name` alone
    const wire = w.eval('JSON.stringify(serializeState().fighters[0])');
    expect(wire).not.toMatch(/float|_rigState|_atkAnim/);
  });

  it('sparkles over Puffball without touching the particle system', () => {
    const { w, rec } = bootRecording();
    soloFighter(w, 'Puffball');
    FAKE_DECODED(w, 'Puffball', 198, 200);
    let drew = 0;
    for (let t = 0; t < 90; t++) {
      const n = w.eval(`hazardT=${t}; particles.length=0; const f=fighters[0]; f.flash=0;
        f.vx=0; f.vy=0; f.onground=true; drawFighter(f); particles.length`);
      expect(n, 'the draw path spawns no particles').toBe(0);
      rec.length = 0;
      w.eval(`hazardT=${t}; drawFighter(fighters[0])`);
      if (rec.some((c) => c.op === 'quadraticCurveTo')) drew++;
    }
    expect(drew, 'twinkles appear over the run of frames').toBeGreaterThan(10);
    expect(drew, '…occasionally, not solidly').toBeLessThan(90);
  });

  // ---- FACING ----------------------------------------------------------------------------------
  // Most of these renders are posed turned to their own right, so the image natively faces LEFT.
  // Mirroring only on face<0 pointed them backwards while they ran right — the owner's
  // "face backwards on the side". `flip` inverts which direction gets the mirror.

  it('mirrors every render to the way its fighter is actually facing', () => {
    const { w, rec } = bootRecording();
    // name, natural w/h, does the registry mark it as natively left-facing?
    const cases = [['Rocky', 257, 186], ['Ice Cube', 166, 200], ['Blocky', 202, 200],
      ['Firey', 150, 200], ['Puffball', 198, 200], ['Pen', 60, 200]];
    for (const [name, nw, nh] of cases) {
      soloFighter(w, name);
      FAKE_DECODED(w, name, nw, nh);
      const flip = !!w.eval(`!!SPRITES[${JSON.stringify(name)}].flip`);
      const mirrored = (face) => {
        rec.length = 0;
        w.eval(`hazardT=0; const f=fighters[0]; f.flash=0; f._atkAnim=0; f._hurtAnim=0; f.smashHold=0; f.vx=0;
                f.vy=0; f.onground=true; f._landSquash=0; f.face=${face}; drawFighter(f)`);
        return ctmAt(rec, findAt(rec, 'drawImage'))[0] < 0;
      };
      // whichever way the art was drawn, exactly ONE of the two directions gets the mirror…
      expect(mirrored(1), `${name} facing right`).toBe(flip);
      expect(mirrored(-1), `${name} facing left`).toBe(!flip);
      // …so turning around ALWAYS flips the art. That is the whole contract.
      expect(mirrored(1)).not.toBe(mirrored(-1));
    }
  });

  it('flips exactly the renders the facing audit called left-facing', () => {
    const { window: w } = loadMonolith();
    const flipped = w.eval(`Object.keys(SPRITES).filter(k=>SPRITES[k].flip)`).sort();
    // The batch-1 four were audited by hand and must stay flipped.
    for (const n of ['Blocky', 'Firey', 'Ice Cube', 'Rocky']) {
      expect(flipped, `${n} was measured as left-facing`).toContain(n);
    }
    // Every later render's flag has to match what was MEASURED when it was fetched — a hand-edited
    // flip that disagrees with the manifest means someone eyeballed it and got it backwards.
    const manifest = JSON.parse(readFileSync('scripts/sprite-manifest.json', 'utf8'));
    // The manifest now also holds BOSS renders, which are not fighters and live in a different
    // registry. Check each against the registry that actually owns it rather than skipping either.
    const bossByFile = w.eval(`
      (function(){ var o = {};
        for (var k in BOSS_SPRITE_SRC) o[BOSS_SPRITE_SRC[k].split('/').pop()] = !!BOSS_SPRITE_FLIP[k];
        return o; })()`);
    const disagreements = Object.values(manifest)
      .filter(r => r.ok)
      .map(r => {
        const isFighter = w.eval(`!!SPRITES[${JSON.stringify(r.name)}]`);
        if (isFighter) {
          const declared = !!w.eval(`!!(SPRITES[${JSON.stringify(r.name)}]||{}).flip`);
          return declared !== !!r.flip ? `${r.name} (fighter): registry ${declared} vs measured ${r.facing}` : null;
        }
        if (r.file in bossByFile) {
          return bossByFile[r.file] !== !!r.flip ? `${r.name} (boss): registry ${bossByFile[r.file]} vs measured ${r.facing}` : null;
        }
        return null;   // fetched but deliberately not wired (e.g. a rejected candidate)
      })
      .filter(Boolean);
    expect(disagreements, 'flip flags that contradict the measured facing').toEqual([]);
    // the flag is render-only: vector art is authored +x-forward and must never consult it
    for (const name of BATCH_1) {
      const v = w.eval(`SPRITES[${JSON.stringify(name)}].flip`);
      expect(v === undefined || v === true, `${name}.flip is a flag or absent`).toBe(true);
    }
  });

  it('leaves vector-art mirroring alone — flip describes the PNG, not the drawing', () => {
    const { w, rec } = bootRecording();
    soloFighter(w, 'Rocky');                     // flip:true, but NO decoded image
    const scaleSigns = (face) => {
      rec.length = 0;
      w.eval(`hazardT=0; const f=fighters[0]; f.flash=0; f.vx=0; f.vy=0; f.onground=true;
              f._landSquash=0; f.face=${face}; drawFighter(f)`);
      return rec.some((c) => c.op === 'scale' && c.args[0] === -1);
    };
    expect(scaleSigns(-1), 'vector art still mirrors on face<0').toBe(true);
    expect(scaleSigns(1), 'and never on face>0, flip or not').toBe(false);
  });

  // ---- BATCH-1 BESPOKE ANIMATIONS --------------------------------------------------------------
  // One FIGHTER_ANIM entry per designed fighter, each the ANIMATION column of
  // docs/animation-move-design.md. These lock down that every entry (a) actually draws in the state
  // it is supposed to and NOT otherwise, (b) composes with the render instead of replacing it —
  // except Bubble, whose whole character is that she is briefly NOT THERE — and (c) never reaches
  // into the sim.

  /** Ops a fighter's FIGHTER_ANIM entry adds in a given state: the recording with it, minus without. */
  function bespoke(w, rec, name, setup) {
    const key = JSON.stringify(name);
    const pose = () => {
      rec.length = 0;
      w.eval(`hazardT=7; const f=fighters[0]; f.flash=0; f._atkAnim=0; f._hurtAnim=0; f.smashHold=0;
              f.vx=0; f.vy=0; f.onground=true; f._landSquash=0; f.face=1; ${setup}; drawFighter(f)`);
      return rec.length;
    };
    const withIt = pose();
    const saved = w.eval(`(()=>{ const s=FIGHTER_ANIM[${key}]; delete FIGHTER_ANIM[${key}]; window.__saved=s; return 1; })()`);
    void saved;
    const withoutIt = pose();
    const imgs = rec.filter((c) => c.op === 'drawImage').length;
    w.eval(`FIGHTER_ANIM[${key}] = window.__saved;`);
    rec.length = 0;
    w.eval(`hazardT=7; const f=fighters[0]; f.flash=0; f._atkAnim=0; f._hurtAnim=0; f.smashHold=0;
            f.vx=0; f.vy=0; f.onground=true; f._landSquash=0; f.face=1; ${setup}; drawFighter(f)`);
    return { extra: withIt - withoutIt, renders: rec.filter((c) => c.op === 'drawImage').length, baseRenders: imgs };
  }

  const NATURAL = {
    Firey: [150, 200], Bubble: [176, 200], Blocky: [202, 200], Pen: [60, 200], Pencil: [94, 200],
    Match: [55, 200], 'Ice Cube': [166, 200], Teardrop: [144, 200], Bomby: [220, 200], Rocky: [274, 200],
  };
  const withFighter = (w, name) => { soloFighter(w, name); FAKE_DECODED(w, name, ...NATURAL[name]); };

  it('gives every designed fighter a bespoke entry that fires only in its own state', () => {
    // [fighter, the state it is FOR, a state it must stay quiet in]
    const CASES = [
      ['Firey', 'f._atkAnim=7', null],                       // flare-up on the swing
      ['Firey', 'f.onground=false; f.vy=14', null],          // acrophobic panic on a fast fall
      ['Bubble', 'f.smashHold=45', 'f.vx=0'],                // inflate wobble while charging
      ['Blocky', 'f.vx=8', 'f.vx=0'],                        // timber-lean at a sprint
      ['Blocky', 'f._atkAnim=7', 'f.vx=0'],                  // splinters + sawdust on impact
      ['Pen', 'f._atkAnim=7', 'f.vx=0'],                     // the cap pops off
      ['Pencil', 'f._atkAnim=7', 'f.vx=0'],                  // spear-point stretch
      ['Pencil', 'f.smashHold=45', 'f.vx=0'],                // eraser scrub + crumbs
      ['Match', 'f._atkAnim=7', 'f.vx=0'],                   // hair tuft flares
      ['Match', 'f.smashHold=45', 'f.vx=0'],                 // …and while charging
      ['Ice Cube', 'f.vx=8', 'f.vx=0'],                      // slick tilt onto an edge
      ['Ice Cube', 'f._hurtAnim=10', 'f.vx=0'],              // shatter glints
      ['Teardrop', 'f._atkAnim=7', 'f.vx=0'],                // the wooden sign comes out
      ['Bomby', 'f.smashHold=45', null],                     // fuse crackles harder
      ['Rocky', 'f._landSquash=4', 'f.vx=0'],                // landing thud dust
    ];
    for (const [name, active, quiet] of CASES) {
      const { w, rec } = bootRecording();
      withFighter(w, name);
      const on = bespoke(w, rec, name, active);
      expect(on.extra, `${name} [${active}] draws something`).toBeGreaterThan(4);
      expect(on.renders, `${name} [${active}] keeps its render`).toBe(1);
      if (quiet) {
        const off = bespoke(w, rec, name, quiet);
        expect(off.extra, `${name} [${quiet}] stays quiet`).toBeLessThan(on.extra);
      }
    }
  });

  it("pops Bubble out of existence on a hit — and puts her back", () => {
    // Her defining trait: she pops at the slightest touch and is re-blown. This is the ONE
    // bespoke entry that replaces the render, so it has to un-replace it too.
    const { w, rec } = bootRecording();
    withFighter(w, 'Bubble');
    const frame = (setup) => {
      rec.length = 0;
      w.eval(`hazardT=7; const f=fighters[0]; f.flash=0; f._atkAnim=0; f._hurtAnim=0; f.smashHold=0;
              f.vx=0; f.vy=0; f.onground=true; f._landSquash=0; ${setup}; drawFighter(f)`);
      return rec;
    };
    frame('f._hurtAnim=10');
    expect(rec.filter((c) => c.op === 'drawImage'), 'popped: no render at all').toHaveLength(0);
    expect(rec.filter((c) => c.op === 'fill').length, 'film shards are filled').toBeGreaterThan(5);

    frame('f._hurtAnim=3');                        // later in the same reaction: re-blown
    expect(rec.filter((c) => c.op === 'drawImage').length, 'reformed').toBeGreaterThan(0);
    frame('');
    expect(rec.filter((c) => c.op === 'drawImage').length, 'untouched: normal render').toBeGreaterThan(0);
    // being hit MID-SWING still pops her — the swing must not mask the hit
    frame('f._atkAnim=8; f._hurtAnim=10');
    expect(rec.filter((c) => c.op === 'drawImage'), 'clipped mid-swing still pops').toHaveLength(0);
  });

  it('lets Rocky opt out of most of the universal squash — he is a rock', () => {
    const { w, rec } = bootRecording();
    const stretchOf = (name) => {
      withFighter(w, name);
      rec.length = 0;
      w.eval(`hazardT=7; const f=fighters[0]; f.flash=0; f._atkAnim=0; f._hurtAnim=0; f.smashHold=0;
              f.vx=0; f.onground=false; f.vy=-14; f._landSquash=0; drawFighter(f)`);
      return ctmAt(rec, findAt(rec, 'drawImage'))[3];
    };
    const rocky = stretchOf('Rocky');
    const blocky = stretchOf('Blocky');           // same state, no `squash` field
    expect(blocky, 'the cast default stretches hard on a fast rise').toBeGreaterThan(1.2);
    expect(rocky, 'Rocky barely deforms').toBeLessThan(1.10);
    expect(rocky, '…but he is not perfectly rigid either').toBeGreaterThan(1.0);
    expect(w.eval("FIGHTER_ANIM['Rocky'].squash"), 'declared, not hard-coded').toBe(0.35);
  });

  it('stands Teardrop dead still and leaves Match unbothered', () => {
    // Teardrop is canonically mute and eerily motionless; Match is written permanently unbothered.
    // Everyone else breathes. This is the `idle` knob, and it must not touch any other state.
    const { w, rec } = bootRecording();
    const idleTravel = (name) => {
      withFighter(w, name);
      let lo = 1e9; let hi = -1e9;
      for (let t = 0; t < 90; t++) {
        rec.length = 0;
        w.eval(`hazardT=${t}; const f=fighters[0]; f.flash=0; f._atkAnim=0; f._hurtAnim=0;
                f.smashHold=0; f.vx=0; f.vy=0; f.onground=true; f._landSquash=0; drawFighter(f)`);
        const v = ctmAt(rec, findAt(rec, 'drawImage'))[3];
        if (v < lo) lo = v; if (v > hi) hi = v;
      }
      return hi - lo;
    };
    const td = idleTravel('Teardrop');
    const match = idleTravel('Match');
    const blocky = idleTravel('Blocky');
    expect(td, 'Teardrop does not breathe at all').toBeCloseTo(0, 6);
    expect(match, 'Match breathes, but barely').toBeGreaterThan(0);
    expect(match, '…far less than the cast').toBeLessThan(blocky * 0.6);
    expect(blocky, 'the cast default is a real breath').toBeGreaterThan(0.05);
    // …and Teardrop still moves the instant she does anything else
    withFighter(w, 'Teardrop');
    rec.length = 0;
    w.eval(`hazardT=3; const f=fighters[0]; f.flash=0; f._hurtAnim=0; f.smashHold=0; f.vx=6;
            f.vy=0; f.onground=true; f._landSquash=0; f._atkAnim=0; drawFighter(f)`);
    expect(w.eval('fighters[0]._rigState'), 'the dead-still idle is idle-only').toBe('run');
  });

  it('keeps every bespoke pass out of the sim and off the nametag', () => {
    const { w, rec } = bootRecording();
    const NAMES = Object.keys(NATURAL);
    for (const name of NAMES) {
      withFighter(w, name);
      // hammer every state the bespoke passes react to, in one go
      const states = ['f._atkAnim=7', 'f._hurtAnim=10', 'f.smashHold=45', 'f.vx=8', 'f.vx=-8',
        'f._landSquash=4', 'f.onground=false; f.vy=14', 'f.onground=false; f.vy=-14', 'f.face=-1'];
      for (const st of states) {
        const before = w.eval('JSON.stringify({p:particles.length, pr:projectiles.length, y:fighters[0].y, r:fighters[0].r})');
        rec.length = 0;
        expect(() => w.eval(`hazardT=13; const f=fighters[0]; f.flash=0; f._atkAnim=0; f._hurtAnim=0;
          f.smashHold=0; f.vx=0; f.vy=0; f.onground=true; f._landSquash=0; f.face=1; ${st};
          drawFighter(f)`), `${name} [${st}]`).not.toThrow();
        expect(w.eval('JSON.stringify({p:particles.length, pr:projectiles.length, y:fighters[0].y, r:fighters[0].r})'),
          `${name} [${st}] spawns nothing and moves nobody`).toBe(before);
        // the nametag is drawn after the overlay pass and must still be upright and unscaled
        const tag = findAt(rec, 'fillText');
        if (tag > -1) {
          const m = ctmAt(rec, tag);
          expect([m[0], m[1], m[2], m[3]], `${name} [${st}] nametag stays upright`).toEqual([1, 0, 0, 1]);
        }
      }
    }
  });

  it('degrades every bespoke pass to what a netcode client is actually shipped', () => {
    // A client gets face / flash / smashHold / y / r and nothing else — no vx, no onground, no
    // vy, and neither render timer. Every pass has to survive that instead of throwing on it.
    const { w, rec } = bootRecording();
    for (const name of Object.keys(NATURAL)) {
      withFighter(w, name);
      rec.length = 0;
      expect(() => w.eval(`hazardT=21; const f=fighters[0];
        delete f.vx; delete f.vy; delete f.onground; delete f._atkAnim; delete f._hurtAnim;
        delete f._landSquash; f.flash=12; f.smashHold=20; f.face=-1; drawFighter(f)`),
      `${name} as a client puppet`).not.toThrow();
      expect(rec.length, `${name} still draws`).toBeGreaterThan(0);
    }
  });

  it('draws sprites in teams mode with the ring, you-marker and smash arc intact', () => {
    const { window: w } = loadMonolith();
    w.eval(`
      SETTINGS.mode='teams'; SETTINGS.count = 4; startMatch();
      fighters.length = 0;
      ['Bubble','Bomby','Puffball','Rocky'].forEach((n,i)=>{
        const f = makeFighter(ROSTER.find(x=>x.name===n), 200+i*80, 300, i);
        f.team = i%2; f.you = i===0; f.smashHold = 20;
        fighters.push(f);
      });
    `);
    expect(() => w.eval('draw()')).not.toThrow();
  });
});

describe('facing overrides — set by eye, and they win', () => {
  // The automated check finds the centroid of interior dark ink and calls it the face. That is
  // wrong for a character with dark DECORATION opposite their face, and it shipped a real bug:
  // Money's "5" and dark clip sit left of his face, dragged the centroid left, and he was mirrored
  // — so he walked backwards. A later eye-detecting heuristic missed him too.
  //
  // The tell that settles it: his "5" reads BACKWARDS when mirrored. A render carrying legible text
  // must never be flipped, whatever a centroid says.
  it('does not mirror renders whose face was confirmed by eye', () => {
    const { window: w } = loadMonolith();
    for (const name of ['Money', 'Fanny']) {
      expect(w.eval(`!!SPRITES[${JSON.stringify(name)}].flip`),
        `${name} faces right in their artwork and must not be mirrored`).toBe(false);
    }
  });

  it('keeps the override in the generator, so re-running it cannot undo the fix', () => {
    const src = readFileSync('scripts/wire-sprites.mjs', 'utf8');
    expect(src, 'override table present').toContain('FACING_OVERRIDE');
    expect(src).toContain('money.png');
    expect(src).toContain('fanny.png');
  });
});
