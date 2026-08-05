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
