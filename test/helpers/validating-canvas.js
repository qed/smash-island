import { existsSync, openSync, readSync, closeSync } from 'node:fs';
import { join } from 'node:path';

// A 2D canvas context that refuses what a real browser refuses, for jsdom, which refuses nothing. The stub the suite draws on
// swallows a negative arc radius, a radial gradient with a NaN in it, a colour built from NaN and an alpha of 1.04, and a real
// canvas throws on the first two (IndexSizeError, TypeError: that frame's drawing is over) and ignores the others (the old fill,
// the old alpha). One boss already took the real frame down this way (the car's bubbles in the sand), and the suite never saw it.
//
// Used by scripts/boss-glitch.mjs (the glitch hunter) and by the tests that pin a fix. It records, and never throws: `rec(sev,
// kind, key, detail, stack)` is called for each fault ('error': a real browser throws; 'warn': it ignores the call or the value),
// so one drawing pass lists every fault, not the first. `stack` is null after the first thirty of a kind and key.
//
//   const errors = [];
//   window.HTMLCanvasElement.prototype.getContext = function(){ return this.__vctx || (this.__vctx = makeCtx(this, (sev, kind, key, detail, stack) => errors.push({ sev, kind, key, detail, stack: String(stack || '') }))); };
//
// What it checks: arc / ellipse / arcTo / roundRect / radial gradients with a negative radius; a non-finite or undefined number in any
// drawing call; a gradient stop outside 0..1 or in a colour that is not one; fillStyle / strokeStyle / shadowColor set to something
// that is not a colour; globalAlpha outside 0..1, lineWidth and the shadow values the browser would ignore, a font with NaN in it;
// drawImage of nothing, of a broken image, a not-yet-loaded one or a zero-size canvas; text that reads NaN or undefined; restore()
// with nothing saved; and `ctx.__depth`, the saves still open (a draw() should end at 0), with `ctx.__reset()`.

export function colorBad(s) {
  s = String(s).trim();
  if (!s) return true;
  if (/NaN|undefined|Infinity|null|\[object/.test(s)) return true;
  if (s[0] === '#') return !/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(s);
  if (/^(rgb|hsl)a?\(/i.test(s)) return !/^(rgb|hsl)a?\(\s*[-+0-9.e%\s,/deg]+\)$/i.test(s);
  return !/^[a-z]+$/i.test(s) && !/^(color|lab|lch|oklab|oklch|hwb)\(/i.test(s);
}
// argument kinds per method: n a number, s text, b a boolean, i an image or canvas, o anything else
const SIG = {
  moveTo: 'nn', lineTo: 'nn', quadraticCurveTo: 'nnnn', bezierCurveTo: 'nnnnnn', arc: 'nnnnnb', arcTo: 'nnnnn', ellipse: 'nnnnnnnb', rect: 'nnnn',
  roundRect: 'nnnno', fillRect: 'nnnn', strokeRect: 'nnnn', clearRect: 'nnnn', translate: 'nn', scale: 'nn', rotate: 'n', transform: 'nnnnnn',
  setTransform: 'nnnnnn', fillText: 'snnn', strokeText: 'snnn', createLinearGradient: 'nnnn', createRadialGradient: 'nnnnnn', createConicGradient: 'nnn',
  getImageData: 'nnnn', putImageData: 'onn', drawImage: 'innnnnnnn',
};
const DEFAULTS = { globalAlpha: 1, lineWidth: 1, fillStyle: '#000000', strokeStyle: '#000000', font: '10px sans-serif', textAlign: 'start', textBaseline: 'alphabetic',
  lineCap: 'butt', lineJoin: 'miter', miterLimit: 10, shadowBlur: 0, shadowColor: 'rgba(0, 0, 0, 0)', shadowOffsetX: 0, shadowOffsetY: 0,
  globalCompositeOperation: 'source-over', lineDashOffset: 0, filter: 'none', imageSmoothingEnabled: true, direction: 'ltr', letterSpacing: '0px', fontKerning: 'auto' };

export function makeCtx(canvas, rec) {
  const S = Object.assign(Object.create(null), DEFAULTS);
  const saved = [];
  let depth = 0;
  let ops = 0;   // every call and every style set, counted (ctx.__ops): two draws of one picture have the same count
  const cnt = new Map();   // a stack is taken for the first 30 of each kind and key; the rest are only counted
  const err = (sev, kind, key, detail) => { const id = kind + '|' + key, c = (cnt.get(id) || 0) + 1; cnt.set(id, c); rec(sev, kind, key, detail, c <= 30 ? new Error().stack : null); };
  const fmt = (v) => (typeof v === 'number' ? +v.toFixed(1) : String(v));
  const gradient = (kind) => ({
    __gradient: kind,
    addColorStop(o, c) {
      if (typeof o !== 'number' || !(o >= 0 && o <= 1)) err('error', 'ctx-throws', 'addColorStop offset', `${kind}.addColorStop(${o}) throws IndexSizeError (a stop outside 0..1, or not a number)`);
      if (typeof c !== 'string' || colorBad(c)) err('error', 'ctx-throws', 'addColorStop colour', `${kind}.addColorStop(_, ${JSON.stringify(c)}) throws SyntaxError (not a colour)`);
    },
  });
  const finiteCheck = (name, args, sig) => {
    for (let i = 0; i < args.length && i < sig.length; i++) {
      if (sig[i] !== 'n') continue;
      const v = args[i];
      if (typeof v === 'number') { if (!Number.isFinite(v)) err(name === 'createLinearGradient' || name.startsWith('createRadial') || name.startsWith('createConic') ? 'error' : 'warn', name.startsWith('create') ? 'ctx-throws' : 'ctx-nonfinite', name + ' arg' + i, `${name}(${Array.from(args, (a) => typeof a === 'number' ? +a.toFixed(2) : typeof a).join(', ')}): argument ${i} is ${v}` + (name.startsWith('create') ? ' (TypeError: gradients take finite numbers)' : ' (the browser ignores the call: nothing is drawn)')); }
      else if (v === undefined) err('warn', 'ctx-nonfinite', name + ' arg' + i + ' undefined', `${name}: argument ${i} is undefined (reads as NaN: the call draws nothing)`);
    }
  };
  const M = {
    save() { depth++; saved.push(Object.assign(Object.create(null), S)); },
    restore() { if (!depth) err('warn', 'ctx-restore', 'restore with nothing saved', 'restore() with an empty stack'); else { depth--; Object.assign(S, saved.pop()); } },
    beginPath() {}, closePath() {}, fill() {}, stroke() {}, clip() {}, setLineDash() {}, resetTransform() {},
    arc(x, y, r) { finiteCheck('arc', arguments, SIG.arc); if (r < 0) err('error', 'ctx-throws', 'arc negative radius', `arc(${fmt(x)}, ${fmt(y)}, ${fmt(r)}): a negative radius throws IndexSizeError and ends the frame's drawing`); },
    ellipse(x, y, rx, ry) { finiteCheck('ellipse', arguments, SIG.ellipse); if (rx < 0 || ry < 0) err('error', 'ctx-throws', 'ellipse negative radius', `ellipse radii ${rx}, ${ry}: a negative radius throws IndexSizeError`); },
    arcTo(x1, y1, x2, y2, r) { finiteCheck('arcTo', arguments, SIG.arcTo); if (r < 0) err('error', 'ctx-throws', 'arcTo negative radius', `arcTo radius ${r} throws IndexSizeError`); },
    roundRect(x, y, w, h, r) {
      finiteCheck('roundRect', arguments, SIG.roundRect);
      const rs = Array.isArray(r) ? r : [r];
      if (rs.some((q) => (typeof q === 'number' && q < 0) || (typeof q === 'number' && !Number.isFinite(q)))) err('error', 'ctx-throws', 'roundRect radius', `roundRect radii ${JSON.stringify(r)} throws RangeError`);
    },
    createLinearGradient() { finiteCheck('createLinearGradient', arguments, SIG.createLinearGradient); return gradient('linear'); },
    createRadialGradient(x0, y0, r0, x1, y1, r1) {
      finiteCheck('createRadialGradient', arguments, SIG.createRadialGradient);
      if (r0 < 0 || r1 < 0) err('error', 'ctx-throws', 'radialGradient negative radius', `createRadialGradient radii ${r0}, ${r1}: a negative radius throws IndexSizeError`);
      return gradient('radial');
    },
    createConicGradient() { finiteCheck('createConicGradient', arguments, SIG.createConicGradient); return gradient('conic'); },
    createPattern() { return { __pattern: true }; },
    measureText(t) { const px = parseFloat(String(S.font).match(/(\d+(?:\.\d+)?)px/)?.[1] || 10), w = String(t).length * px * 0.55; return { width: w, actualBoundingBoxLeft: 0, actualBoundingBoxRight: w, actualBoundingBoxAscent: px * 0.75, actualBoundingBoxDescent: px * 0.2, fontBoundingBoxAscent: px * 0.9, fontBoundingBoxDescent: px * 0.25 }; },
    fillText(t) { finiteCheck('fillText', arguments, SIG.fillText); if (/\b(NaN|undefined|Infinity|null)\b/.test(String(t))) err('warn', 'ctx-text', 'text ' + String(t).slice(0, 30), `fillText(${JSON.stringify(String(t).slice(0, 60))}): the screen would read it`); },
    strokeText(t) { finiteCheck('strokeText', arguments, SIG.strokeText); if (/\b(NaN|undefined|Infinity|null)\b/.test(String(t))) err('warn', 'ctx-text', 'text ' + String(t).slice(0, 30), `strokeText(${JSON.stringify(String(t).slice(0, 60))})`); },
    drawImage(im) {
      finiteCheck('drawImage', arguments, SIG.drawImage);
      if (im == null || (typeof im !== 'object' && typeof im !== 'function')) { err('error', 'ctx-throws', 'drawImage source', `drawImage(${String(im)}, ...) throws TypeError (not an image)`); return; }
      const w = im.naturalWidth !== undefined ? im.naturalWidth : im.width, h = im.naturalHeight !== undefined ? im.naturalHeight : im.height;
      if (im.__fakeImage) {
        if (im.complete === false) err('warn', 'ctx-image', 'not loaded ' + im.src, `drawImage of ${im.src}, which is not loaded (nothing is drawn)`);
        else if (!(w > 0 && h > 0)) err('error', 'ctx-throws', 'broken image ' + im.src, `drawImage of ${im.src}: the file is missing or empty (a broken image throws InvalidStateError)`);
      } else if ((w === 0 || h === 0) && typeof im.getContext === 'function') err('error', 'ctx-throws', 'zero-size canvas source', `drawImage of a ${w} x ${h} canvas throws InvalidStateError`);
    },
    getImageData(x, y, w, h) {
      finiteCheck('getImageData', arguments, SIG.getImageData);
      if (!(w > 0 && h > 0)) { err('error', 'ctx-throws', 'getImageData size', `getImageData(_, _, ${w}, ${h}) throws IndexSizeError`); return { data: new Uint8ClampedArray(0), width: 0, height: 0 }; }
      return { data: new Uint8ClampedArray(Math.min(w * h * 4, 4e6)), width: w, height: h };
    },
    putImageData() {}, createImageData(w, h) { return { data: new Uint8ClampedArray(Math.min(w * h * 4, 4e6)), width: w, height: h }; },
    __reset() { const d = depth; depth = 0; saved.length = 0; return d; },
  };
  for (const k of ['moveTo', 'lineTo', 'quadraticCurveTo', 'bezierCurveTo', 'rect', 'fillRect', 'strokeRect', 'clearRect', 'translate', 'scale', 'rotate', 'transform', 'setTransform']) {
    const sig = SIG[k]; M[k] = function () { finiteCheck(k, arguments, sig); };
  }
  return new Proxy(M, {
    get(t, p) {
      if (typeof p === 'symbol') return undefined;
      if (p === '__depth') return depth;
      if (p === '__ops') return ops;
      if (p in M) { ops++; return M[p]; }
      if (p === 'canvas') return canvas;
      if (p in S) return S[p];
      return () => {};   // a method nothing here needs to model
    },
    set(t, p, v) {
      ops++;
      switch (p) {
        case 'fillStyle': case 'strokeStyle': case 'shadowColor':
          if (typeof v === 'string') { if (colorBad(v)) { err('warn', 'ctx-ignored', p + ' ' + v.slice(0, 24), `${p} = ${JSON.stringify(v)} is not a colour: the browser keeps the old one`); return true; } }
          else if (v == null || (typeof v !== 'object' && typeof v !== 'function')) { err('warn', 'ctx-ignored', p + ' ' + String(v), `${p} = ${String(v)} is neither a colour nor a gradient: ignored`); return true; }
          break;
        case 'globalAlpha': if (typeof v !== 'number' || !(v >= 0 && v <= 1)) { err('warn', 'ctx-ignored', 'globalAlpha', `globalAlpha = ${v}: outside 0..1 or not a number, the browser keeps the old alpha`); return true; } break;
        case 'lineWidth': if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) { err('warn', 'ctx-ignored', 'lineWidth', `lineWidth = ${v}: ignored by the browser`); return true; } break;
        case 'shadowBlur': case 'shadowOffsetX': case 'shadowOffsetY': case 'lineDashOffset': case 'miterLimit':
          if (typeof v !== 'number' || !Number.isFinite(v) || (p === 'shadowBlur' && v < 0)) { err('warn', 'ctx-ignored', p, `${p} = ${v}: ignored by the browser`); return true; } break;
        case 'font': if (/NaN|undefined|Infinity|null/.test(String(v))) { err('warn', 'ctx-ignored', 'font ' + String(v).slice(0, 24), `font = ${JSON.stringify(String(v))}: ignored by the browser`); return true; } break;
        default: break;
      }
      S[p] = v;
      return true;
    },
  });
}

// A sprite "loads" at once with its PNG's own width and height (read from the file's header), so the show's art is drawn the way a
// player sees it; one whose file is missing is a broken image (drawing it is an error). `gameDir` is artifacts/V1.
const pngDims = new Map();
export function pngSize(gameDir, rel) {
  const key = gameDir + '|' + rel;
  if (pngDims.has(key)) return pngDims.get(key);
  let d = null;
  try {
    const p = join(gameDir, rel.split('?')[0]);
    if (existsSync(p)) { const fd = openSync(p, 'r'), b = Buffer.alloc(24); readSync(fd, b, 0, 24, 0); closeSync(fd); if (b.readUInt32BE(12) === 0x49484452) d = [b.readUInt32BE(16), b.readUInt32BE(20)]; }
  } catch (e) { d = null; }
  pngDims.set(key, d);
  return d;
}
export function installImages(win, rec, gameDir) {
  function Image() { this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0; this.width = 0; this.height = 0; this._src = ''; this.__fakeImage = true; }
  Object.defineProperty(Image.prototype, 'src', {
    get() { return this._src; },
    set(v) {
      this._src = String(v); const d = pngSize(gameDir, this._src);
      this.complete = true;
      if (d) { this.naturalWidth = this.width = d[0]; this.naturalHeight = this.height = d[1]; }
      else { this.naturalWidth = this.naturalHeight = this.width = this.height = 0; rec('warn', 'asset-missing', this._src, `the game asks for ${this._src}, which is not in artifacts/V1`, new Error().stack); }
    },
  });
  Image.prototype.addEventListener = Image.prototype.removeEventListener = function () {};
  win.Image = Image;
}

// A whole game booted on that canvas (the unmodified artifacts/V1/index.html, read from the working directory like the other helpers):
// `w` is its window, `errors` collects {sev, kind, key, detail, stack} for every fault a draw makes (stack: the first thirty of a kind and key). Await it: the profile loads first.
export async function bootValidating(seed = 3) {
  const { JSDOM } = await import('jsdom');
  const { readFileSync } = await import('node:fs');
  const { mulberry32 } = await import('./prng.js');
  const html = readFileSync('artifacts/V1/index.html', 'utf8'), errors = [];
  const dom = new JSDOM(html, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      window.HTMLCanvasElement.prototype.getContext = function () { return this.__vctx || (this.__vctx = makeCtx(this, (sev, kind, key, detail, stack) => errors.push({ sev, kind, key, detail, stack: String(stack || '') }))); };
      window.Math.random = mulberry32(seed); window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {};
    },
  });
  await dom.window.eval('profileReady');
  return { w: dom.window, errors };
}
