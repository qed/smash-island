import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
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

  it('leaves every uncovered fighter on the blob fallback', () => {
    const { window: w } = loadMonolith();
    const uncovered = w.eval(`ROSTER.filter(r=>!SPRITES[r.name]).map(r=>r.name)`);
    expect(uncovered.length, 'the rest of the roster still falls back').toBeGreaterThan(0);
    expect(uncovered).not.toContain('Firey');
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
    const { window: w } = loadMonolith();
    w.eval(`
      SETTINGS.count = 4; startMatch();
      fighters.length = 0;
      ['Firey','Needle','Ice Cube','Snowball'].forEach((n,i)=>{
        fighters.push(makeFighter(ROSTER.find(x=>x.name===n), 200+i*80, 300, i));
      });
    `);
    expect(w.eval('fighters.map(f=>!!SPRITES[f.name])')).toEqual([true, false, true, false]);
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
      ['Pencil', 60, 200, 'height'],
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

    // rising fast -> stretch tall and thin
    rec.length = 0;
    w.eval('const f=fighters[0]; f.onground=false; f.vy=-12; f.vx=0; f._landSquash=0; drawFighter(f)');
    let m = ctmAt(rec, findAt(rec, 'drawImage'));
    expect(m[3], 'render is stretched tall while rising').toBeGreaterThan(1.15);
    expect(m[0], 'render is squeezed thin while rising').toBeLessThan(0.9);

    // just landed -> squat wide and short
    rec.length = 0;
    w.eval('const f=fighters[0]; f.onground=true; f.vy=0; f.vx=0; f._landSquash=6; drawFighter(f)');
    m = ctmAt(rec, findAt(rec, 'drawImage'));
    expect(m[3], 'render squats on the land-squash').toBeLessThan(0.95);
    expect(m[0], 'render widens on the land-squash').toBeGreaterThan(1.05);
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
