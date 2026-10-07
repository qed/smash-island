import { describe, it, expect, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from './helpers/prng.js';

// "scale to fit" (the owner, 2026-10-07): the app is a box of exactly 1100x720 logical pixels, and the whole of it -- every menu, the match, the HUD -- is scaled to
// fill the window, keeping its shape. A match is the same world in any window (it used to follow the window's size, so two players had two arenas), the canvas is
// sharp (its backing store is the pixels the box really covers, drawn in logical coordinates under a base transform), and a pointer in the Level Creator's canvas
// is read in the box's own pixels.
//
// jsdom has no layout, so a window of vw x vh at pixel ratio dpr is given where the game reads it: the root element's clientWidth and clientHeight, and
// devicePixelRatio. With no vw this is the headless page every other test runs on, and the point of the last group is that it is untouched: no layout means k = 1, no
// base transform, and W and H are what the window says.

const HTML = readFileSync('artifacts/V1/index.html', 'utf8');
const open = [];

function boot({ vw = 0, vh = 0, dpr = 1, boxes = {} } = {}) {
  const log = [], captured = [], lay = { vw, vh };
  const dom = new JSDOM(HTML, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(win) {
      win.HTMLCanvasElement.prototype.getContext = function () {
        const id = this.id || '(unnamed)', canvas = this;
        return new Proxy({}, {
          get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 }) : p === 'canvas' ? canvas : p === 'getImageData' ? () => ({ data: [] })
            : (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createPattern' || p === 'createConicGradient') ? () => ({ addColorStop() {} })
            : (...a) => { log.push([id, String(p), a]); }),
          set: () => true,
        });
      };
      win.HTMLCanvasElement.prototype.captureStream = function () { captured.push(this); return { getTracks() { return []; } }; };
      function FakeRec() { this.state = 'inactive'; }
      FakeRec.prototype.start = function () { this.state = 'recording'; }; FakeRec.prototype.stop = function () { this.state = 'inactive'; };
      FakeRec.isTypeSupported = () => true; win.MediaRecorder = FakeRec;
      win.Math.random = mulberry32(5);
      win.requestAnimationFrame = () => 0; win.cancelAnimationFrame = () => {};
      if (vw) {
        const size = (axis) => function () { return this === this.ownerDocument.documentElement ? (axis ? lay.vh : lay.vw) : ((boxes[this.id] || [0, 0])[axis ? 1 : 0]); };
        Object.defineProperty(win.Element.prototype, 'clientWidth', { configurable: true, get: size(0) });
        Object.defineProperty(win.Element.prototype, 'clientHeight', { configurable: true, get: size(1) });
        Object.defineProperty(win.Element.prototype, 'clientLeft', { configurable: true, get() { return boxes[this.id] ? 3 : 0; } });
        Object.defineProperty(win.Element.prototype, 'clientTop', { configurable: true, get() { return boxes[this.id] ? 3 : 0; } });
        const rects = (win.__rects = {});
        win.Element.prototype.getBoundingClientRect = function () { return rects[this.id] || { left: 0, top: 0, width: 0, height: 0, right: 0, bottom: 0 }; };
        Object.defineProperty(win, 'devicePixelRatio', { value: dpr, configurable: true });
      }
    },
  });
  open.push(dom.window);
  return { w: dom.window, log, captured, lay };
}
afterAll(() => { for (const w of open) { try { w.close(); } catch (e) { /* gone */ } } });

const base = (log, id = 'cv') => log.filter((c) => c[0] === id && c[1] === 'setTransform').map((c) => c[2]);
const near = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 1e-9);

describe('the box fits the window', () => {
  it('is scaled by the smaller of the two ratios, about its centre, in any window', () => {
    for (const [vw, vh, k] of [[1920, 1080, 1.5], [1000, 650, 650 / 720], [2560, 1080, 1.5]]) {   // (and 1280x720, which is the box itself, k = 1, below)
      const { w } = boot({ vw, vh });
      expect(w.eval('UI.k'), `${vw}x${vh}`).toBeCloseTo(k, 9);
      expect(w.document.getElementById('app').style.transform, `${vw}x${vh}: the whole box is scaled`).toBe(`scale(${w.eval('UI.k')})`);
    }
  });

  it('refits when the window changes, in a menu as well as in a match, and when fullscreen comes or goes: the scale, the backing store and its base transform', () => {
    const { w, log, lay } = boot({ vw: 1280, vh: 720 });
    expect(w.eval('UI.k')).toBe(1);
    expect(w.eval('[cv.width, cv.height]')).toEqual([1100, 720]);
    lay.vw = 1920; lay.vh = 1080; w.dispatchEvent(new w.Event('resize'));
    expect(w.eval('UI.k'), 'a resize').toBe(1.5);
    expect(w.eval('[cv.width, cv.height]'), 'the canvas follows').toEqual([1650, 1080]);
    expect(base(log).at(-1), 'and keeps its base transform').toEqual([1.5, 0, 0, 1.5, 0, 0]);
    lay.vw = 1000; lay.vh = 650; w.document.dispatchEvent(new w.Event('fullscreenchange'));
    expect(w.eval('UI.k'), 'fullscreen').toBeCloseTo(650 / 720, 9);
    expect(w.eval('[W, H]'), 'the world did not move').toEqual([1100, 720]);
  });

  it('the app has no size of the window in its rule: it is 1100x720, always', () => {
    const rule = /#app\{([^}]*)\}/.exec(HTML)[1];
    expect(rule).toMatch(/width:1100px/);
    expect(rule).toMatch(/height:720px/);
    expect(rule).not.toMatch(/max-width|max-height|width:100%|height:100%|vw|vh/);
    expect(rule, 'a transform that is re-rasterised stays sharp; will-change would blur it').not.toMatch(/will-change/);
  });
});

describe('a match is the same world in any window', () => {
  const play = (vw, vh) => {
    const { w } = boot({ vw, vh });
    w.eval(`SETTINGS.mode = 'ffa'; SETTINGS.count = 3; stage = STAGES[0]; startMatch();`);
    return w.eval('({ W: W, H: H, WW: WW, WH: WH, f: fighters.map(function(f){ return [f.x, f.y]; }), floor: groundY() })');
  };
  it('has the same W, H, floor and spawn points at 1920x1080, 1280x720 and 1000x650', () => {
    const a = play(1920, 1080), b = play(1280, 720), c = play(1000, 650);
    expect(a.W).toBe(1100); expect(a.H).toBe(720); expect(a.WW).toBe(1100); expect(a.WH).toBe(720);
    expect(b, '1280x720 is the same match').toEqual(a);
    expect(c, '...and so is a window smaller than the box (it used to shrink the arena)').toEqual(a);
  });
});

describe('the canvas is sharp', () => {
  it('has a backing store of the box times the pixels it covers, drawn under a base transform that scales it up', () => {
    const { w, log } = boot({ vw: 1920, vh: 1080 });
    expect(w.eval('[cv.width, cv.height]')).toEqual([1650, 1080]);
    expect(base(log).at(-1), 'the base transform: scale up, no translation').toEqual([1.5, 0, 0, 1.5, 0, 0]);
    const hi = boot({ vw: 1280, vh: 720, dpr: 2 });
    expect(hi.w.eval('[cv.width, cv.height]'), 'a pixel ratio of 2 doubles it').toEqual([2200, 1440]);
  });

  it('does not grow past the cap: a 4K screen at pixel ratio 2 costs a few times a 1100x720 canvas, not ten', () => {
    const { w } = boot({ vw: 3840, vh: 2160, dpr: 2 });
    const [cw, ch] = w.eval('[cv.width, cv.height]');
    expect(cw * ch).toBeLessThanOrEqual(4.2e6 * 1.001);
    expect(cw * ch).toBeGreaterThan(4.0e6);
    expect(cw / ch, 'the box keeps its shape').toBeCloseTo(1100 / 720, 2);
  });

  it('draws in logical coordinates: a "reset" (the Cake at Stake stinger) goes back to the base transform, not the identity', () => {
    const { w, log } = boot({ vw: 1920, vh: 1080 });
    log.length = 0;
    w.eval(`CAKE_FX = { t: 50, color: '#e0503a' }; drawCakeAtStake();`);
    expect(base(log), 'the one reset in the frame').toEqual([[1.5, 0, 0, 1.5, 0, 0]]);
    expect(log.filter((c) => c[1] === 'arc')[0][2].slice(0, 2), 'and its centre is the box\'s, in logical pixels').toEqual([550, 360]);
  });
});

describe('the other canvases', () => {
  it('the Moon scene is drawn in the box\'s pixels under its own base transform', async () => {
    const { w, log } = boot({ vw: 1920, vh: 1080 });
    await w.eval('profileReady');
    w.eval('PROFILE.one.stage = ONE_STAGE.MOON; playMoonScene();');
    expect(w.eval('[MOON.w, MOON.h, MOON.sx, MOON.sy]')).toEqual([1100, 720, 1.5, 1.5]);
    expect(w.eval(`[document.getElementById('moonCanvas').width, document.getElementById('moonCanvas').height]`)).toEqual([1650, 1080]);
    log.length = 0;
    w.eval('drawMoonFrame(MOON, 1)');
    expect(base(log, 'moonCanvas').every((t) => near(t, [1.5, 0, 0, 1.5, 0, 0])), 'never the identity').toBe(true);
    w.eval('stopMoonScene()');
  });

  it('the Level Creator\'s canvas is sharp, and a pointer on it is read in the editor\'s own pixels, with k and the border taken out', () => {
    const { w, log } = boot({ vw: 1920, vh: 1080, boxes: { edcanvas: [1048, 676] } });
    w.__rects.edcanvas = { left: 300, top: 200, width: 1048 * 1.5 + 9, height: 676 * 1.5 + 9, right: 0, bottom: 0 };   // the box, and its 3px border, at k = 1.5
    w.eval(`openEditor(); ED.tool = 'pan';`);
    expect(w.eval('[ED.cw, ED.ch]')).toEqual([760, 497]);
    expect(w.eval('[document.getElementById("edcanvas").width, document.getElementById("edcanvas").height]'), 'its box times the pixels it covers').toEqual([1572, 1014]);
    expect(base(log, 'edcanvas').at(-1), 'the base transform maps the editor\'s 760x497 onto it').toEqual([1572 / 760, 0, 0, 1014 / 497, 0, 0]);
    // a press in the middle of the box is the middle of the editor's canvas, whatever k is
    const midX = 300 + 3 * 1.5 + (1048 * 1.5) / 2, midY = 200 + 3 * 1.5 + (676 * 1.5) / 2;
    w.eval(`document.getElementById('edcanvas').onpointerdown({ clientX: ${midX}, clientY: ${midY}, button: 0, preventDefault: function(){} })`);
    const [cx, cy] = w.eval('[ED.drag.cx, ED.drag.cy]');
    expect(cx).toBeCloseTo(760 / 2, 6);
    expect(cy).toBeCloseTo(497 / 2, 6);
  });

  it('a headless page\'s editor canvas is the size it always was', () => {
    const { w } = boot();
    w.eval(`openEditor();`);
    expect(w.eval('[document.getElementById("edcanvas").width, document.getElementById("edcanvas").height, ED.cw, ED.ch]')).toEqual([760, 497, 760, 497]);
  });
});

describe('the run recorder costs what it always did', () => {
  it('records a copy at the box\'s size when the canvas is bigger, and copies every other frame into it', () => {
    const { w, log, captured } = boot({ vw: 1920, vh: 1080 });
    w.eval(`SETTINGS.mode = 'ffa'; SETTINGS.count = 2; startMatch();`);
    expect(captured.length).toBe(1);
    expect(captured[0], 'the stream is not the big canvas').not.toBe(w.document.getElementById('cv'));
    expect([captured[0].width, captured[0].height], 'but a 1100x720 one').toEqual([1100, 720]);
    log.length = 0;
    w.eval('clipCapture(); clipCapture(); clipCapture(); clipCapture();');
    const copies = log.filter((c) => c[0] === '(unnamed)' && c[1] === 'drawImage');
    expect(copies.length, 'every other frame (it records at 30 fps)').toBe(2);
    expect(copies[0][2].slice(1), 'the whole box').toEqual([0, 0, 1100, 720]);
  });

  it('records the canvas itself at the box\'s size, and with no layout at all', () => {
    const a = boot({ vw: 1100, vh: 720 });
    a.w.eval(`SETTINGS.mode = 'ffa'; SETTINGS.count = 2; startMatch();`);
    expect(a.captured[0]).toBe(a.w.document.getElementById('cv'));
    const b = boot();
    b.w.eval(`SETTINGS.mode = 'ffa'; SETTINGS.count = 2; startMatch();`);
    expect(b.captured[0]).toBe(b.w.document.getElementById('cv'));
  });
});

describe('a headless page is untouched: no layout means k = 1, no base transform, and W and H are what the window says', () => {
  it('has no scale, no transform, no base transform, and the window\'s own size', () => {
    const { w, log } = boot();
    w.eval('resize()');
    expect(w.eval('[UI.real, UI.k, UI.sx, UI.sy]')).toEqual([false, 1, 1, 1]);
    expect(w.document.getElementById('app').style.transform).toBe('');
    expect(base(log), 'nothing set a transform on the canvas').toEqual([]);
    expect(w.eval('[W, H, cv.width, cv.height]'), 'jsdom\'s window is 1024x768, and so was the match').toEqual([1024, 768, 1024, 768]);
  });

  it('resets to the identity where it always did (the stinger), so a recorded transform is what it was', () => {
    const { w, log } = boot();
    w.eval(`CAKE_FX = { t: 50, color: '#e0503a' }; drawCakeAtStake();`);
    expect(base(log)).toEqual([[1, 0, 0, 1, 0, 0]]);
  });
});
