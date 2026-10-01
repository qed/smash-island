// THE BOSS GLITCH HUNTER. Plays every boss -- the twelve Boss Rush bosses, One and Steve Cobs -- with AI fighters, and reports what the
// tests cannot see. jsdom accepts what a real browser refuses: a negative arc radius is an IndexSizeError that kills that frame's drawing,
// a radial gradient with a NaN radius is a TypeError, a colour built from NaN is a SyntaxError, and none of them throws in the stub canvas
// the suite draws on. So the whole game is drawn through a VALIDATING canvas, and the sim is watched for the things a player calls bugs.
//
//   node scripts/boss-glitch.mjs                            everything: 14 bosses x RUNS runs, then one whole Boss Rush (about 20 min)
//   BOSSES='["Four","One"]' node scripts/boss-glitch.mjs    just these bosses (and no Boss Rush run)
//   RUNS=2 node scripts/boss-glitch.mjs                     a quicker look: 2 runs a boss (the first two plans below)
//   RUSH=only node scripts/boss-glitch.mjs                  just the Boss Rush run;  RUSH=0  never the Boss Rush run
//   REPRO='Four|Pen,Coiny|113|forced|art' node scripts/boss-glitch.mjs      one run again (the repro line a finding prints), VERBOSE=1 for all of it
//   JOBS=4  FRAMES=3600  DRAW_EVERY=2  NET_EVERY=10  OUT=report.json  VERBOSE=1     (see the knobs below)
// Run from the repo root (it reads artifacts/V1/index.html). Every run boots its own game on its own seed, so the same build and the same
// repro line print the same findings. It is not in the vitest suite: it is minutes, not seconds.
//
// WHAT IT DOES
//  - Draws every DRAW_EVERY-th frame through the validating canvas (makeCtx): arc / ellipse / arcTo / roundRect / gradients with a negative
//    radius, any non-finite coordinate or size in any call, NaN in a colour or a font or a line of text, a gradient stop off [0,1],
//    drawImage with a broken, zero-size or not-yet-loaded source, a globalAlpha the browser would ignore, restore() with nothing saved,
//    a draw() that ends with saves left open. Sprites "load" with the real width and height of their PNG (the vector fallback is what
//    jsdom normally draws; art=1 runs draw the show's art as a player sees it, art=0 the fallback a player sees while it loads).
//  - Every NET_EVERY frames it also takes the host's netcode snapshot (serializeState, through JSON as on the wire) and applies and draws it
//    in a SECOND game, a client's, through the same validating canvas: a field a client draws but is never sent shows up there.
//  - Anything the game loop would swallow ("loop frame error") is a finding here with its stack, so is anything the page's own try/catch
//    swallows when it is the boss's code (catch blocks that do nothing are rewritten to say so; audio and storage noise is filtered out).
//  - Invariants, checked every frame: NaN / Infinity in any position, velocity, size or boss state; a living boss with no new attack for
//    10 s, or a turn held (1e6) that never lets go; a boss off screen or too high to reach for 5 s; a fighter held, frozen, stunned,
//    swallowed (or any status a boss adds to a fighter) for 5 s; a shot alive for 30 s, or more than 300 at once; boss shots, hazards or
//    adds that still hurt after the boss has fallen (the BOSS DOWN card, the next boss); a boss hit that struck within 12 frames of its
//    source appearing, with no wind-up just before it and no mark of its own (a possible NO-TELL hit: look at its source before believing it);
//    three boss hits in a row on a fighter who could not act.
//  - The Boss Rush run plays all twelve in order (and one boss of the second loop), and at every spawn checks what the last boss left
//    behind: the arena and its props against a clean spawn of the same boss, shots, adds, beams, vines, dust, scars, statuses a boss gave
//    a fighter (slip, slow, held, swallowed, anything new on the fighter), timers still pending.
//
// A RUN is {boss, lineup, seed, mode, art}: `forced` shortens the fight (the boss's bar is cut to its phases at fixed ages and finished at
// 1900 frames, fighters have 9 stocks, so every phase and the ending are played), `natural` is the bot alone with 3 stocks. The bots are
// the game's own AI. Nothing here tunes anything: it only looks.
//
// OUTPUT: findings grouped by boss, each with its repro (lineup, seed, mode, frame, the boss's phase and age) and a stack or the values,
// stacks as index.html:LINE. `error` findings (throws, NaN, hangs) always print; `warn` ones (ignored draws, possible no-tells, long statuses)
// print too; `info` (what a run saw) only with VERBOSE=1. The whole report is also written to OUT (default: not written).
import { readFileSync, writeFileSync, openSync, readSync, closeSync, existsSync } from 'node:fs';
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { availableParallelism } from 'node:os';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';
import { mulberry32 } from '../test/helpers/prng.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const GAME_DIR = join(ROOT, 'artifacts/V1');
const env = process.env;
const FRAMES = Number(env.FRAMES || 3600), DRAW_EVERY = Math.max(1, Number(env.DRAW_EVERY || 2)), NET_EVERY = Number(env.NET_EVERY ?? 10);
const RUNS = Number(env.RUNS || 6), VERBOSE = !!env.VERBOSE;
const FORCED_END = 1900;   // a forced fight's boss falls at this age (frames); phases 2 and 3 are cut in at 500 and 1100
const FIGHTERS = ['Firey', 'Leafy', 'Pin', 'Needle', 'Coiny', 'Bubble', 'Pen', 'Snowball', 'Blocky', 'Ice Cube', 'Match', 'Pencil', 'Rocky', 'Tennis Ball', 'Golf Ball'];
// the plans of a boss's runs, in order: who fights, how, and whether the sprites are loaded (art). 6 by default.
const PLANS = [
  { names: ['Firey'], mode: 'forced', art: true },
  { names: ['Pin', 'Coiny'], mode: 'forced', art: false },
  { names: ['Rocky'], mode: 'natural', art: true },
  { names: ['Leafy', 'Needle', 'Bubble'], mode: 'forced', art: true },
  { names: ['Pen'], mode: 'natural', art: false },
  { names: ['Golf Ball', 'Snowball'], mode: 'forced', art: true },
  { names: ['Tennis Ball'], mode: 'forced', art: true }, { names: ['Pencil', 'Match'], mode: 'natural', art: true },
];

// ---------------------------------------------------------------------------------------------------------------------------------
//  THE GAME, BOOTED: a validating canvas, sprites that load, a clock that only the harness moves
// ---------------------------------------------------------------------------------------------------------------------------------
const HTML = readFileSync(join(GAME_DIR, 'index.html'), 'utf8');
// stack lines inside the page's script are relative to the script tag; index.html's own line is that plus this
const SCRIPT_LINE0 = (() => { const at = HTML.lastIndexOf('<script', HTML.indexOf('function applyHit(')); return HTML.slice(0, HTML.indexOf('>', at)).split('\n').length; })();
// every `catch(e){}` that does nothing now says so (window.__sw, per realm), the line count kept so a stack still points at the right line
const HTML_SW = HTML.replace(/catch\s*\(\s*(\w+)\s*\)\s*\{\s*\}/g, (m, v) => `catch(${v}){ window.__sw && window.__sw(${v}); }` + '\n'.repeat((m.match(/\n/g) || []).length));
export const mapStack = (s) => String(s).replace(/(?:https?:\/\/localhost\/?)+:(\d+):(\d+)/g, (_m, l) => 'index.html:' + (Number(l) + SCRIPT_LINE0 - 1));

const pngDims = new Map();
function pngSize(rel) {
  if (pngDims.has(rel)) return pngDims.get(rel);
  let d = null;
  try {
    const p = join(GAME_DIR, rel.split('?')[0]);
    if (existsSync(p)) { const fd = openSync(p, 'r'), b = Buffer.alloc(24); readSync(fd, b, 0, 24, 0); closeSync(fd); if (b.readUInt32BE(12) === 0x49484452) d = [b.readUInt32BE(16), b.readUInt32BE(20)]; }
  } catch (e) { d = null; }
  pngDims.set(rel, d);
  return d;
}

function colorBad(s) {
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

// `rec(sev, kind, key, detail, stack)` files a finding; makeCtx never throws (a real browser would: the point is to see every one, not the first).
function makeCtx(canvas, rec) {
  const S = Object.assign(Object.create(null), DEFAULTS);
  const saved = [];
  let depth = 0;
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
      if (p in M) return M[p];
      if (p === 'canvas') return canvas;
      if (p in S) return S[p];
      return () => {};   // a method nothing here needs to model
    },
    set(t, p, v) {
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

// the images: a sprite "loads" at once with its PNG's own size, so the show's art is drawn the way a player sees it
function installImages(win, rec) {
  function Image() { this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0; this.width = 0; this.height = 0; this._src = ''; this.__fakeImage = true; }
  Object.defineProperty(Image.prototype, 'src', {
    get() { return this._src; },
    set(v) {
      this._src = String(v); const d = pngSize(this._src);
      this.complete = true;
      if (d) { this.naturalWidth = this.width = d[0]; this.naturalHeight = this.height = d[1]; }
      else { this.naturalWidth = this.naturalHeight = this.width = this.height = 0; rec('warn', 'asset-missing', this._src, `the game asks for ${this._src}, which is not in artifacts/V1`, new Error().stack); }
    },
  });
  Image.prototype.addEventListener = Image.prototype.removeEventListener = function () {};
  win.Image = Image;
}

function bootRealm({ seed, art, w = 1280, h = 720, sink, label }) {
  const clock = { now: 0 }, timers = new Map(); let tid = 0;
  const realmRef = { info: () => ({}), mute: false };
  const rec = (sev, kind, key, detail, stack) => { if (!realmRef.mute) sink.add(label, sev, kind, key, detail, stack, realmRef.info()); };
  const dom = new JSDOM(HTML_SW, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(win) {
      win.HTMLCanvasElement.prototype.getContext = function (type) { if (type && type !== '2d') return null; return this.__vctx || (this.__vctx = makeCtx(this, rec)); };
      win.Math.random = mulberry32(seed);
      win.requestAnimationFrame = () => 0; win.cancelAnimationFrame = () => {};
      Object.defineProperty(win, 'innerWidth', { value: w, configurable: true }); Object.defineProperty(win, 'innerHeight', { value: h, configurable: true });
      Object.defineProperty(win.performance, 'now', { value: () => clock.now, configurable: true });
      win.Date.now = () => 1.8e12 + clock.now;
      win.setTimeout = (fn, ms = 0, ...a) => { const id = ++tid; timers.set(id, { at: clock.now + Math.max(0, +ms || 0), fn, a, id, every: 0 }); return id; };
      win.setInterval = (fn, ms = 0, ...a) => { const id = ++tid; timers.set(id, { at: clock.now + Math.max(1, +ms || 1), fn, a, id, every: Math.max(1, +ms || 1) }); return id; };
      win.clearTimeout = win.clearInterval = (id) => { timers.delete(id); };
      if (art) installImages(win, rec);
      win.console.error = (...a) => { const m = a.map((x) => (x && x.stack) || String(x)).join(' '); rec('warn', 'console-error', m.replace(/\d+/g, '#').slice(0, 70), 'console.error: ' + m.slice(0, 600), (a.find((x) => x && x.stack) || {}).stack || ''); };
      win.addEventListener('error', (e) => rec('error', 'page-error', String(e.message).slice(0, 80), `uncaught: ${e.message}`, e.error && e.error.stack));
      win.addEventListener('unhandledrejection', (e) => rec('error', 'page-rejection', String(e.reason && e.reason.message || e.reason).slice(0, 80), `unhandled rejection: ${e.reason && e.reason.stack || e.reason}`, ''));
      // `catch(e){}` blocks, rewritten above: the page's own swallowed errors, minus the noise a headless boot always has
      win.__sw = (e) => {
        const m = String(e && e.message || e), st = String(e && e.stack || '');
        if (/AudioContext|webkitAudio|localStorage|SecurityError|Not implemented|createMediaElementSource|navigator\.|getUserMedia|clipboard|vibrate|indexedDB|Audio is not|play\(\)|decodeAudioData|MediaRecorder|captureStream|requestFullscreen|Cannot read properties of (null|undefined) \(reading '(createGain|connect|currentTime|gain|destination|resume|state|createOscillator|createBufferSource|start|stop)'\)|(snd|SFX|Music|music|Audio|audio|startMusic|stopMusic|sndInit)\w*/.test(m + ' ' + st.split('\n').slice(0, 4).join(' '))) return;
        rec('warn', 'swallowed', m.slice(0, 90) + ' @' + (st.split('\n')[1] || '').trim().slice(0, 60), `the page's own catch swallowed: ${st.split('\n').slice(0, 6).join(' < ')}`, '');
      };
      win.__adv = (ms) => {
        clock.now += ms;
        for (let guard = 0; guard < 200; guard++) {
          let next = null;
          for (const t of timers.values()) if (t.at <= clock.now && (!next || t.at < next.at || (t.at === next.at && t.id < next.id))) next = t;
          if (!next) break;
          if (next.every) next.at += next.every; else timers.delete(next.id);
          try { next.fn(...next.a); } catch (e) { rec('error', 'timer-exception', String(e && e.message).slice(0, 80), `a timer callback threw: ${e && e.stack}`, ''); }
        }
      };
      win.__pending = () => [...timers.values()].map((t) => ({ in: Math.round(t.at - clock.now), every: t.every, src: String(t.fn).replace(/\s+/g, ' ').slice(0, 110) }));
    },
  });
  const win = dom.window;
  return { win, clock, dom, setInfo: (f) => { realmRef.info = f; }, setMute: (m) => { realmRef.mute = m; } };
}

// ---------------------------------------------------------------------------------------------------------------------------------
//  THE PAGE'S SIDE: evaluated inside each game. Plain JS, no imports; it reads the game's own globals.
// ---------------------------------------------------------------------------------------------------------------------------------
function pageHarness() {
  const G = (window.__G = { frame: 0, bn: '', F: Object.create(null), S: { draws: 0, clientDraws: 0, falls: 0, spawns: [], phases: {}, hits: {}, maxShots: 0, turns: 0, dyn: {}, max: {} }, cfg: {}, tel: { on: false, start: -1, end: -1, kind: null, len: 0 }, bt: null, fallFrame: null, spawnSigs: [], leaks: [], st: Object.create(null) });
  const born = new WeakMap();
  G.pHs = Object.create(null);
  const stk = (e, n) => { try { return String((e && e.stack) || e).split('\n').slice(0, (n || 6) + 1).map((l) => l.trim()).join(' < '); } catch (_) { return String(e); } };
  // the nth function name above the harness in an error's stack, for keying a finding by where it came from
  const fn1 = (e, k) => { const out = []; for (const l of String((e && e.stack) || '').split('\n').slice(1)) { const m = l.match(/at (?:async )?([\w$.<>]+) \(/); if (m && !/^(G\.|pageHarness|eval|Object\.|puff$)/.test(m[1])) out.push(m[1]); if (out.length > k) break; } return out[k] || '?'; };
  const short = (v, n) => { let s; try { s = typeof v === 'string' ? v : JSON.stringify(v); } catch (_) { s = String(v); } return s === undefined ? 'undefined' : s.length > (n || 160) ? s.slice(0, n || 160) + '…' : s; };
  G.boss = () => summons.find((s) => s && s.type === 'boss') || null;
  G.note = function (kind, key, detail, sev) {
    const k = kind + '|' + key;
    let f = G.F[k];
    if (!f) {
      const b = G.boss();
      f = G.F[k] = { kind, key, sev: sev || 'error', n: 0, frame: G.frame, boss: b ? b.name : G.lastBoss || '', phase: b ? b._phase : 0, age: G.bt ? G.frame - G.bt.spawn : -1, detail: String(detail).slice(0, 2400) };
    }
    f.n++;
    return f;
  };
  // ------- instrumented entry points
  const projLabel = (p) => {
    if (p.shape) return 'shot:' + p.shape;
    for (const k in p) if (p[k] && /^(ann|psb|fsb?|swarm|pface|pf|dragon|mp|el|s4|two|four|cobs|spring|one|ghost|bug|tlc)[A-Z_a-z]/.test(k) && k !== 'owner' && k !== 'ownerObj') return 'shot:' + k;
    return 'shot';
  };
  // who called applyHit, for a hit that came from no shot: the two or three functions above the wrapper, and what the boss was doing
  const callers = (stack) => {
    const names = []; let cat = 'boss';
    for (const l of String(stack).split('\n').slice(1)) {
      const m = l.match(/at (?:async )?([\w$.<>]+) \(/); if (!m) continue;
      const n = m[1];
      if (n === 'applyHit' || n === 'G.onHit' || n === 'eval' || n === 'pageHarness' || n.startsWith('Object.')) continue;
      names.push(n);
      if (names.length >= 3 || n === 'step') break;
    }
    const s = names.join('<'), b = G.boss();
    if (/arenaHazardHit|haz/i.test(String(stack))) cat = 'hazard'; else if (/contact|touch|bump|elMove/i.test(s)) cat = 'contact';
    return { label: (cat === 'hazard' ? 'hazard:' : cat === 'contact' ? 'contact:' : 'move:') + (s || 'step') + (b ? ' [' + b.name + (G.tel.on ? ' winding ' : ' idle ') + (G.tel.kind || '') + ']' : ''), cat };
  };
  const AH = applyHit;
  applyHit = function (t, dmg, kx, ky, from, opts) {
    const bossSide = !!((opts && opts.bossAtk != null) || (from && (from.hostile || from.type === 'boss' || from.team === -1)));
    if (!bossSide || !t || t.dead || t.type) return AH.apply(this, arguments);
    const p0 = t.pct, hs0 = t.hitstun, fr0 = t.frozen, sw0 = t._swallow, inv0 = t.invuln;
    const r = AH.apply(this, arguments);
    if (t.pct > p0 + 1e-9) { try { G.onHit(t, t.pct - p0, from, opts, hs0, fr0, sw0, inv0); } catch (e) { G.note('harness', 'onHit', stk(e)); } }
    return r;
  };
  G.onHit = function (t, dmg, from, opts, hs0, fr0, sw0, inv0) {
    const f = G.frame; let src = null;
    if (opts && opts.shot) {
      let bd = 1e9;
      for (const p of projectiles) { if (p.life <= 0 || (opts.bossAtk != null && p.bossAtk !== opts.bossAtk)) continue; const d = hurtGap(t, p.x, p.y) - (p.r || 0); if (d < bd) { bd = d; src = p; } }
    }
    let label, age, marked = false, telGap = G.tel.on ? 0 : (G.tel.end >= 0 ? f - G.tel.end : 9999), cat = 'boss';
    let near = '', onVictim = false;
    if (src) { const bi = born.get(src); label = bi ? bi.label : projLabel(src); age = bi ? f - bi.f : 0; marked = bi ? bi.marked : !!(src.warn > 0 || src.delay > 0); if (bi) telGap = bi.telGap; cat = 'shot';
      onVictim = !bi || Math.hypot(bi.x0 - t.x, bi.y0 - t.y) < 150;
      near = bi ? `; it first appeared ${Math.round(Math.hypot(bi.x0 - t.x, bi.y0 - t.y))} px from the victim, at speed ${bi.spd.toFixed(1)}, r ${src.r}` : '; it appeared this frame'; }
    else { const c = callers(new Error().stack); label = c.label; cat = c.cat; age = telGap; }
    if (G.cfg.trace && (G.S.log || (G.S.log = [])).length < 4000) G.S.log.push([f, t.idx, label, +dmg.toFixed(1), age, telGap, hs0, fr0, sw0, inv0, Math.round(t.x), Math.round(t.y), src ? src.bossAtk : opts && opts.bossAtk]);   // TRACE=1: every boss hit, in order
    const H = G.S.hits[label] || (G.S.hits[label] = { n: 0, dmg: 0, minAge: 1e9, noTell: 0, cat });
    H.n++; H.dmg += dmg; H.minAge = Math.min(H.minAge, age);
    const info = `${t.name}#${t.idx} took ${dmg.toFixed(1)}% on frame ${f} (boss age ${G.bt ? f - G.bt.spawn : '-'}, phase ${G.boss() ? G.boss()._phase : '-'}) from ${label}; source age ${age}, wind-up ended ${telGap >= 9999 ? 'never' : telGap + ' frames before'}, marked ${marked}${near}; victim hitstun ${hs0} frozen ${fr0} swallow ${sw0} invuln ${inv0} at (${Math.round(t.x)}, ${Math.round(t.y)})`;
    if (G.fallFrame != null) G.note('post-fall-hit', label, `${info}; the boss fell on frame ${G.fallFrame} (${f - G.fallFrame} frames ago)`);
    else if (cat !== 'contact' && age <= 12 && !marked && telGap > 20) { H.noTell++; G.note('notell', label + (onVictim ? ' [appeared on the victim]' : ''), info, 'warn'); }
    else if (cat === 'contact' && telGap > 20) { H.noTell++; G.note('contact', label, info, 'info'); }
    // a boss hit skips a fighter in their grace (invuln), as the projectile loops and arenaHazardHit do: one that lands on one anyway is a hit the engine's own rule says should not be
    if (inv0 > 0 && !(opts && (opts.tick || opts.volley))) G.note('grace-hit', label, `${info}; the victim was in hit grace (invuln ${inv0}) and the boss hit landed`, 'warn');
    // a chain: hits one after another on a fighter who was ALREADY stunned, held or swallowed when the frame began (a stun the hit itself dealt does not count)
    const was = G.pHs[t.idx], ch = G.st['chain' + t.idx] || (G.st['chain' + t.idx] = { n: 0, last: -999 });
    if (was && f - ch.last < 120) { if (++ch.n >= 3) G.note('stunlock', label, `${info}; ${ch.n} boss hits in a row on a fighter who could not act`, 'warn'); } else ch.n = was ? 1 : 0;
    ch.last = f;
  };
  // the boss's own fall, and the next one's arrival
  const BE = bossEndingBegin;
  bossEndingBegin = function (b) { G.fallFrame = G.frame; G.fallBoss = b && b.name; G.S.falls++; G.lastBoss = b && b.name; return BE.apply(this, arguments); };
  const NSP = (name) => (typeof globalThis[name] === 'function');
  const wrapSpawn = (name) => {
    if (!NSP(name)) return;
    const SP = globalThis[name];
    globalThis[name] = function () {
      G.beforeSpawn(name);
      const r = SP.apply(this, arguments);
      G.afterSpawn(name);
      return r;
    };
  };
  const cleanKeys = ['burn', 'bleed', 'frozen', 'slowed', 'rooted', 'ctrlRev', 'weakened', 'curse', 'curseStacks', 'defineStacks', 'cloud', '_infected', 'hitstun', '_stunFx', '_swallow', '_cookieT', 'iceUntil', '_poisonT', '_grabTimer', '_taunted', '_noBattery', '_floatT', 'flying', '_freezeLock', '_revLock'];
  G.tpl = null;
  G.dynKeys = (f) => { if (!G.tpl) G.tpl = makeFighter(ROSTER.find((r) => r.play) || ROSTER[0], 0, 0, 0); const out = []; for (const k in f) if (!(k in G.tpl)) { const v = f[k]; if (v === true || (typeof v === 'number' && v !== 0) || (v && typeof v === 'object')) out.push(k); } return out; };
  const platSig = () => worldPlats.map((p) => [Math.round(p.x), Math.round(p.y), Math.round(p.w), Math.round(p.h), p.solid ? 1 : 0, p.wall ? 1 : 0, p.ladder ? 1 : 0, p.floor ? 1 : 0, p.hop ? 1 : 0, Math.round((p.rot || 0) * 100), p.field ? 1 : 0].join(',')).sort();
  G.sig = () => ({ arena: BOSS_ARENA, stage: stage && stage.id, WW, WH, plats: platSig(), floors: floors.length, projectiles: 0, hostile: projectiles.filter((p) => p.owner === -2 || (p.ownerObj && p.ownerObj.team === -1)).length, assists: summons.filter((s) => s.type !== 'boss' && s.life > 3).length, bosses: summons.filter((s) => s.type === 'boss').length, beams: beams.length, tendrils: tendrils.length, items: items.length, evil: !!evil, dust: IMPACT_DUST.length, debris: IMPACT_DEBRIS.length, scars: IMPACT_SCARS.length, oneFx: oneFx.length, cobsFx: cobsFx.length });
  G.beforeSpawn = function (name) {
    G.leaks = [];
    if (name !== 'spawnBossRushBoss' || !G.cfg.rush) return;
    const L = G.leaks, nb = BOSS_ROSTER[BOSSRUSH.bossIdx], tag = (G.lastBoss || 'start') + ' -> ' + (nb && nb.name);
    for (const f of fighters) {
      if (f.dead) continue;
      for (const k of cleanKeys) { const v = f[k]; if (v > 0 || v === true || (v && typeof v === 'object')) L.push(`fighter ${f.name}#${f.idx}: ${k} = ${short(v, 40)} when the next boss spawns`); }
      // a field a boss gives a fighter and nothing takes off again (kits keep many fields of their own for good: only these prefixes are a boss's)
      for (const k of G.dynKeys(f)) if (/^_(mp|pf|s4|psb|ann|sw|fs|el|dr|two|four|spr|cobs|one|bye|carr|swallow|cookie|corked|ido|assistHit|cuff|pin|cage|tang|squig|poss|slip)/.test(k) && k !== '_oneStocks0') L.push(`fighter ${f.name}#${f.idx}: extra field ${k} = ${short(f[k], 60)} when the next boss spawns`);
    }
    const bs = projectiles.filter((p) => p.owner === -2 || (p.ownerObj && p.ownerObj.team === -1) || p.bossAtk != null);
    if (bs.length) L.push(`${bs.length} boss shots still out when the next boss spawns: ${[...new Set(bs.map(projLabel))].slice(0, 8).join(', ')}`);
    const adds = summons.filter((s) => s.type !== 'boss' && s.life > 3);
    if (adds.length) L.push(`${adds.length} adds still standing: ${[...new Set(adds.map((s) => s.type + ':' + s.name))].slice(0, 6).join(', ')}`);
    if (beams.length) L.push(`${beams.length} beams left`); if (tendrils.length) L.push(`${tendrils.length} vines left`); if (evil) L.push('the Evil Forest corner Evil Leafy is still standing');
    if (summons.some((s) => s.type === 'boss')) L.push(`the old boss is still in summons: ${summons.filter((s) => s.type === 'boss').map((s) => s.name + ' hp ' + s.hp).join(', ')}`);
    if (IMPACT_DUST.length || IMPACT_DEBRIS.length || IMPACT_SCARS.length) L.push(`impact leftovers: dust ${IMPACT_DUST.length}, debris ${IMPACT_DEBRIS.length}, scars ${IMPACT_SCARS.length}`);
    const extra = worldPlats.length - (G.bare ? G.bare.length : 0);
    if (G.bare && (extra !== 0 || platSig().join('|') !== G.bare.join('|'))) L.push(`worldPlats differ from the bare stage when the next boss spawns: ${worldPlats.length} now, ${G.bare.length} bare`);
    if (window.__pending) { const pend = window.__pending().filter((t) => !/classList\.remove\('show'\)/.test(t.src) && !/spawnBossRushBoss/.test(t.src)); for (const t of pend) L.push(`timer pending when the next boss spawns (in ${t.in} ms${t.every ? ', every ' + t.every : ''}): ${t.src}`); }
    G.S.lastLeakTag = tag;
    for (const l of L) G.note('leak', tag + ': ' + l.replace(/\d+/g, '#').slice(0, 80), `${tag}: ${l}`, /^impact leftovers/.test(l) ? 'warn' : 'error');
  };
  G.afterSpawn = function (name) {
    const b = summons.filter((s) => s.type === 'boss').pop();
    if (!b) return;
    G.fallFrame = null; G.fallBoss = null;
    G.bt = { name: b.name, spawn: G.frame, boss: b, telOn: false, lastTurn: G.frame, turns: 0, held: 0, off: 0, high: 0, alive: true };
    G.tel = { on: false, start: -1, end: -1, kind: null, len: 0 };
    G.S.spawns.push({ boss: b.name, frame: G.frame, hp: b.hp });
    G.lastBoss = b.name;
    const sg = G.sig(); sg.boss = b.name; sg.bossXY = [Math.round(b.x), Math.round(b.y)]; sg.hz = Object.keys(b._hz || {}).length;
    G.spawnSigs.push(sg);
  };
  wrapSpawn('spawnBossRushBoss'); wrapSpawn('spawnOneBoss'); wrapSpawn('spawnCobsBoss');
  // the barest stage, for the leak check: taken just before the gauntlet begins
  const SB = startBossRush;
  startBossRush = function () { G.bare = platSig(); return SB.apply(this, arguments); };

  // ------- starting a fight
  G.start = function (cfg) {
    G.cfg = cfg; G.chosen = cfg.names[0];
    SETTINGS.mode = 'boss'; SETTINGS.count = cfg.names.length; SETTINGS.stocks = cfg.stocks; SETTINGS.items = false; SETTINGS.itemRate = 0;
    chosen = ROSTER.find((r) => r.name === cfg.names[0] && r.play) || ROSTER.find((r) => r.play);
    if (cfg.kind === 'one' || cfg.kind === 'cobs') {
      const ok = (cfg.kind === 'one' ? startOneFight : startCobsFight)(cfg.names, { story: !!cfg.story, onEnd: function () { return true; } });
      if (!ok) throw new Error('could not start the ' + cfg.kind + ' fight');
    } else {
      LINEUP_MEMO = { key: lineupKey(Math.max(minCount(), cfg.names.length)), names: cfg.names.slice(1), teamOf: null };
      if (cfg.kind === 'boss') {
        const k = BOSS_ROSTER.findIndex((b) => b.name === cfg.boss); if (k < 0) throw new Error('no such boss ' + cfg.boss);
        const wrapped = spawnBossRushBoss;
        spawnBossRushBoss = function () { spawnBossRushBoss = wrapped; BOSSRUSH.bossIdx = k; return wrapped.apply(this, arguments); };
      }
      beginMatchNow();
    }
    for (const f of fighters) { f.controller = 'ai'; f.you = false; }
    NET.role = 'host'; NET.myIdx = 0; NET.ws = { readyState: 1, bufferedAmount: 0, send() {}, close() {} };
    G.names = fighters.map((f) => f.name);
    return fighters.length;
  };
  // ------- one frame's checks
  const NF = (o, keys, what) => { for (const k of keys) { const v = o[k]; if (typeof v === 'number' && !Number.isFinite(v)) G.note('nonfinite', what + '.' + k, `${what}.${k} = ${v} on frame ${G.frame}: ${short({ name: o.name, x: o.x, y: o.y, vx: o.vx, vy: o.vy, r: o.r, shape: o.shape })}`); } };
  const deep = (o, path, depth, acc) => {
    if (acc.n > 4000 || depth > 4 || !o || typeof o !== 'object') return;
    for (const k in o) {
      if (k === 'ownerObj' || k === 'hurt' || k === 'boss' || k === 'kit' || k === 'aiTarget' || k === 'lastHitBy' || k === '_ghost' || k === 'prev') continue;
      let v; try { v = o[k]; } catch (_) { continue; }
      acc.n++;
      if (typeof v === 'number') { if (!Number.isFinite(v) && !(k === 'life' || k === 'stocks')) { acc.bad.push(path + '.' + k + '=' + v); if (acc.bad.length > 4) return; } }
      else if (v && typeof v === 'object' && !(v instanceof Node) && depth < 4) deep(v, path + '.' + k, depth + 1, acc);
    }
  };
  const STREAK = ['hitstun', '_stunFx', 'frozen', 'rooted', 'slowed', 'ctrlRev', '_swallow', '_cookieT', 'iceUntil', '_grabTimer'];   // (burn, bleed, weakness, a cloud do not take a fighter's control)
  G.post = function () {
    const f = G.frame, b = G.boss(), bt = G.bt;
    if (b) G.bn = b.name;
    if (b && G.fallFrame == null && (b._oneFight || b._cobsFight) && (b.hp <= 0 || b._dying > 0)) { G.fallFrame = f; G.fallBoss = b.name; G.S.falls++; }   // One and Steve Cobs have no BOSS_ENDINGS: they fall by their own code
    // the boss's turns
    if (b && bt && bt.boss === b) {
      if (b._tel > 0) { if (!G.tel.on) { G.tel.on = true; G.tel.start = f; G.tel.kind = b._telKind; G.tel.len = 0; bt.lastTurn = f; bt.turns++; G.S.turns++; } G.tel.len++; }
      else if (G.tel.on) { G.tel.on = false; G.tel.end = f; }
      const ph = b._phase || 1; G.S.phases[b.name + ':' + ph] = (G.S.phases[b.name + ':' + ph] || 0) + 1;
      const alive = fighters.some((q) => !q.dead);
      const hp = b.hp > 0 && G.fallFrame == null;
      if (hp && alive) {
        if (b._atkTimer > 5e5) { if (++bt.held === 600) G.note('turn-held', b.name + ' ' + (b._telKind || ''), `${b.name}'s attack timer has been held at ${b._atkTimer} for 600 frames (move ${b._telKind}, tel ${b._tel}, phase ${b._phase}); open state: ${short(Object.keys(b).filter((k) => b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && !/^(_hz|_rigState)$/.test(k)).map((k) => k + '=' + short(b[k], 90)), 400)}`); } else bt.held = 0;
        if (f - bt.lastTurn === 601 && f - bt.spawn > 300) G.note('no-attack', b.name, `${b.name} (phase ${b._phase}) has not begun a turn for 600 frames: _atkTimer ${b._atkTimer}, _tel ${b._tel}, _telKind ${b._telKind}, x ${Math.round(b.x)} y ${Math.round(b.y)}; open state: ${short(Object.keys(b).filter((k) => b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && k !== '_hz').map((k) => k + '=' + short(b[k], 90)), 400)}`);
        // off the screen, or too high to reach
        const gy = groundY(), vis = b.x > -b.r * 0.5 && b.x < WW + b.r * 0.5 && b.y > -b.r * 1.5 && b.y < WH + b.r;
        if (!vis) { if (++bt.off === 300) G.note('boss-offscreen', b.name, `${b.name} has been off the screen for 300 frames at (${Math.round(b.x)}, ${Math.round(b.y)}), r ${Math.round(b.r)}, world ${WW} x ${WH}, phase ${b._phase}, move ${b._telKind}`); } else bt.off = 0;
        if (vis && !b._oneFight && !b._cobsFight && gy - (b.y + b.r) > 640) { if (++bt.high === 300) G.note('boss-unreachable', b.name, `${b.name} has hung ${Math.round(gy - (b.y + b.r))} px above the floor for 300 frames (a double jump from the top platform reaches about 500), phase ${b._phase}, move ${b._telKind}`, 'warn'); } else bt.high = 0;
      }
      if (f % 20 === 0) { const acc = { n: 0, bad: [] }; deep(b, 'boss', 0, acc); if (acc.bad.length) G.note('nonfinite', 'boss state ' + acc.bad[0].replace(/\[\d+\]/g, ''), `${b.name} state has ${acc.bad.join(', ')} on frame ${f}`); }
    }
    // shots: births, age, count
    let n = 0;
    for (let i = 0; i < projectiles.length; i++) {
      const p = projectiles[i]; n++;
      let bi = born.get(p);
      if (!bi) born.set(p, bi = { f, x0: p.x, y0: p.y, spd: Math.hypot(p.vx || 0, p.vy || 0), marked: !!(p.warn > 0 || p.delay > 0 || p.warnX != null || p.warnY != null), telGap: G.tel.on ? 0 : (G.tel.end >= 0 ? f - G.tel.end : 9999), label: projLabel(p) });
      else if (f - bi.f > 1800 && !bi.flag && p.life > 0 && !(p.delay > 1e5 && G.fallFrame == null)) { bi.flag = 1; G.note('shot-lives-30s', bi.label, `a ${bi.label} has been alive ${f - bi.f} frames: life ${p.life}, delay ${p.delay}, at (${Math.round(p.x)}, ${Math.round(p.y)}), v (${p.vx}, ${p.vy}), dmg ${p.dmg}`, 'warn'); }
      NF(p, ['x', 'y', 'vx', 'vy', 'r', 'dmg'], 'shot ' + bi.label);
      if (G.fallFrame != null && f - G.fallFrame === 90 && p.dmg > 0 && !(p.delay > 0) && p.life > 0 && (p.owner === -2 || (p.ownerObj && p.ownerObj.team === -1)) && !p.annGhost) G.note('post-fall-shot', bi.label, `${bi.label} is still out and live (dmg ${p.dmg}, life ${p.life}) ${f - G.fallFrame} frames after ${G.fallBoss} fell`, 'warn');
    }
    if (n > G.S.maxShots) G.S.maxShots = n;
    if (f % 30 === 0) {
      const L = { particles: particles.length, summons: summons.length, worldPlats: worldPlats.length, oneFx: oneFx.length, cobsFx: cobsFx.length, items: items.length, beams: beams.length, tendrils: tendrils.length, dust: IMPACT_DUST.length, debris: IMPACT_DEBRIS.length, scars: IMPACT_SCARS.length };
      const CAP = { particles: 3000, summons: 80, worldPlats: 220, oneFx: 600, cobsFx: 600, items: 60, beams: 200, tendrils: 400, dust: 400, debris: 400, scars: 200 };
      for (const k in L) { G.S.max[k] = Math.max(G.S.max[k] || 0, L[k]); if (L[k] > CAP[k]) G.note('list-grows', k, `${k} holds ${L[k]} entries on frame ${f} (more than ${CAP[k]}): something is adding to it faster than it is taken away`, 'warn'); }
    }
    if (n > 300) { const c = {}; for (const p of projectiles) { const l = (born.get(p) || {}).label || 'shot'; c[l] = (c[l] || 0) + 1; } G.note('too-many-shots', Object.keys(c).sort((a, b2) => c[b2] - c[a])[0], `${n} shots at once on frame ${f}: ${short(c, 300)}`, 'warn'); }
    // fighters
    for (const q of fighters) {
      NF(q, ['x', 'y', 'vx', 'vy', 'pct', 'r'], 'fighter ' + q.name);
      if (q.dead) { for (const k of STREAK) delete G.st[q.idx + '|' + k]; continue; }
      for (const k of STREAK) {
        const v = q[k], on = v > 0 || v === true, key = q.idx + '|' + k;
        if (on) { const s0 = G.st[key]; if (s0 === undefined) G.st[key] = f; else if (f - s0 === 300) G.note('fighter-stuck', k, `${q.name}#${q.idx} has had ${k} = ${short(v, 30)} for 300 frames in a row (frame ${f}, boss ${b ? b.name + ' phase ' + b._phase + ' move ' + b._telKind : 'none'}); at (${Math.round(q.x)}, ${Math.round(q.y)})`); }
        else delete G.st[key];
      }
      { const ko = 'oob' + q.idx;
        if (q.x < -300 || q.x > WW + 300 || q.y > WH + 600 || q.y < -1200) { G.st[ko] = (G.st[ko] || 0) + 1; if (G.st[ko] === 300) G.note('fighter-offworld', q.name, `${q.name}#${q.idx} has been alive outside the world for 300 frames at (${Math.round(q.x)}, ${Math.round(q.y)}), world ${WW} x ${WH}, boss ${b ? b.name + ' ' + b._telKind : 'none'}`); } else G.st[ko] = 0; }
      if (f % 30 === 0) for (const k of G.dynKeys(q)) G.S.dyn[k] = (G.S.dyn[k] || 0) + 1;   // the fields a fighter picks up in play (VERBOSE lists them: kits keep many for good, a boss's status would show here too)
    }
    for (const q of fighters) G.pHs[q.idx] = !q.dead && (q.hitstun > 0 || q.frozen > 0 || q._swallow > 0 || q.rooted > 0);
    // adds and others
    for (const s of summons) if (s !== b) NF(s, ['x', 'y', 'vx', 'vy', 'r', 'hp'], 'summon ' + (s.name || s.type));
    if (b) NF(b, ['x', 'y', 'vx', 'vy', 'r', 'hp', 'maxHp', '_tel', '_atkTimer'], 'boss ' + b.name);
  };
  // ------- the cuts of a forced fight. They are made at the END of the step (a wrapper of checkWin, which runs last): a boss whose bar is
  // emptied before updateSummons runs is removed by it before bossRushCheck can see it fall, and the gauntlet would never go on.
  const FORCED_END_FRAMES = 1900;
  G.cut = function () {
    const b = G.boss(), bt = G.bt;
    if (!b || !bt || bt.boss !== b || G.cfg.mode !== 'forced' || G.fallFrame != null || !(b.hp > 0)) return;
    const age = G.frame - bt.spawn;
    if (G.cfg.kind === 'one' || G.cfg.kind === 'cobs') {
      if (age % 90 === 60) { const dealer = fighters.find((q) => !q.dead); try { (b._oneFight ? oneTakeDamage : cobsTakeDamage)(b, b.maxHp * 0.045, dealer); } catch (e) { G.note('exception', 'forced damage', stk(e)); } }
      return;
    }
    if (age === 500 && b.hp > b.maxHp * 0.64) b.hp = b.maxHp * 0.64;
    else if (age === 1100 && b.hp > b.maxHp * 0.31) b.hp = b.maxHp * 0.31;
    else if (age >= FORCED_END_FRAMES && b.hp > 0) b.hp = 0;
  };
  const CW = checkWin;
  checkWin = function () { G.cut(); return CW.apply(this, arguments); };
  const PUF = puff;
  puff = function (x, y, color, n) {   // a burst with no colour is black or invisible, and one with no end never ends
    if (typeof color !== 'string' || !color || !Number.isFinite(n) || !Number.isFinite(x) || !Number.isFinite(y)) G.note('puff', (typeof color !== 'string' || !color ? 'no colour' : 'not finite') + ' from ' + fn1(new Error(), 0), `puff(${short(x, 20)}, ${short(y, 20)}, ${short(color, 30)}, ${short(n, 20)}) on frame ${G.frame}: ${stk(new Error(), 5)}`, 'warn');
    return PUF.apply(this, arguments);
  };
  G.run = function (n, drawEvery) {
    for (let i = 0; i < n; i++) {
      if (!running) return 'stopped';
      if (paused) { if (BOSSRUSH.card) { try { rushKeepGoing(); } catch (e) { G.note('exception', 'rushKeepGoing', stk(e)); } } else return 'paused'; }
      try { step(); } catch (e) { G.note('exception', 'step: ' + String(e && e.message).slice(0, 60) + ' @ ' + fn1(e, 0), `step() threw on frame ${G.frame}: ${stk(e, 8)}`); }
      G.post();
      G.frame++;
      window.__adv(1000 / 60);
      if (G.frame % drawEvery === 0) {
        try { draw(); G.S.draws++; } catch (e) { G.note('exception', 'draw: ' + String(e && e.message).slice(0, 60) + ' @ ' + fn1(e, 0), `draw() threw on frame ${G.frame}: ${stk(e, 8)}`); }
        const d = ctx.__reset ? ctx.__reset() : 0;
        if (d) G.note('ctx-unbalanced', 'draw', `draw() ended with ${d} save() left open (frame ${G.frame}); the transform and alpha leak into the next frame`, 'warn');
      }
      if (G.frame % 600 === 0) for (const k in G.st) if (typeof G.st[k] === 'number' && G.st[k] > 1e6) delete G.st[k];
    }
    return 'ok';
  };
  // ------- a netcode client: applies the host's snapshot and draws it
  G.client = function (snap) {
    G.frame = snap.t; const sb = snap.summons && snap.summons.find((m) => m.type === 'boss'); if (sb) G.bn = sb.name;
    try { NET.onMessage({ t: 'state', s: snap }); } catch (e) { G.note('exception', 'client onMessage: ' + String(e && e.message).slice(0, 60) + ' @ ' + fn1(e, 0), stk(e, 8)); }
    try { clientFrame(); window.__adv(40); clientFrame(); } catch (e) { G.note('exception', 'clientFrame: ' + String(e && e.message).slice(0, 60) + ' @ ' + fn1(e, 0), `clientFrame() threw: ${stk(e, 8)}`); }
    try { draw(); G.S.clientDraws++; } catch (e) { G.note('exception', 'client draw: ' + String(e && e.message).slice(0, 60) + ' @ ' + fn1(e, 0), `a client's draw() threw on the host's frame ${snap.t}: ${stk(e, 8)}`); }
    const d = ctx.__reset ? ctx.__reset() : 0;
    if (d) G.note('ctx-unbalanced', 'client draw', `a client's draw() ended with ${d} save() left open`, 'warn');
    return summons.length + ':' + projectiles.length;
  };
  G.startClient = function (cfg) {
    SETTINGS.mode = 'boss'; SETTINGS.count = cfg.n; SETTINGS.stocks = cfg.stocks; SETTINGS.itemRate = 0;
    chosen = ROSTER.find((r) => r.name === cfg.names[0] && r.play) || ROSTER.find((r) => r.play);
    NET.role = 'client'; NET.myIdx = 0; NET.ws = { readyState: 1, bufferedAmount: 0, send() {}, close() {} };
    beginMatchNow();
  };
  G.cleanSig = function (boss, names) {
    G.cfg = { kind: 'boss', boss, names, stocks: 3, mode: 'natural' };
    G.start(G.cfg);
    return G.spawnSigs[G.spawnSigs.length - 1];
  };
  G.result = function () {
    G.S.frames = G.frame; G.S.names = G.names; G.S.bossLeft = (() => { const b = G.boss(); return b ? Math.round(b.hp) + '/' + Math.round(b.maxHp) : null; })();
    return JSON.stringify({ F: G.F, S: G.S, sigs: G.spawnSigs });
  };
  return 'harness ready';
}

// ---------------------------------------------------------------------------------------------------------------------------------
//  ONE RUN, in this process: a host game (and a client's), played frame by frame
// ---------------------------------------------------------------------------------------------------------------------------------
class Sink {
  constructor() { this.F = new Map(); this.last = new Map(); }
  // a finding is one kind and key from one function: its first stack and values are kept, the rest counted
  add(realm, sev, kind, key, detail, stack, info) {
    const base = realm + '|' + kind + '|' + key;
    let st = '', caller = this.last.get(base) || '';
    if (stack) {
      st = mapStack(String(stack)).split('\n').slice(1).filter((l) => /index\.html/.test(l)).slice(0, 6).map((l) => l.trim().replace(/^at /, '')).join(' < ');
      caller = (st.split(' < ')[0] || '').replace(/ \(.*/, ''); this.last.set(base, caller);
    }
    const id = base + '|' + caller;
    let f = this.F.get(id);
    if (!f) {
      info = info || {};
      f = { realm, sev, kind, key: caller ? key + ' (in ' + caller + ')' : key, n: 0, frame: info.frame ?? -1, boss: info.boss || '', phase: info.phase || 0, age: info.age ?? -1, detail: String(detail).slice(0, 1200), stack: st };
      this.F.set(id, f);
    }
    f.n++;
    return f;
  }
}

async function runTask(task, progress) {
  const sink = new Sink();
  const nNames = task.names.length, stocks = task.mode === 'forced' || task.kind === 'rush' ? 9 : 3;
  const host = bootRealm({ seed: task.seed, art: task.art, w: 1280, h: 720, sink, label: 'host' });
  const H = host.win;
  host.setInfo(() => { const g = H.__G; return g ? { frame: g.frame, boss: g.bn, phase: (g.boss() || {})._phase, age: g.bt ? g.frame - g.bt.spawn : -1 } : {}; });
  await H.eval('profileReady');
  H.eval('(' + pageHarness.toString() + ')()');
  let client = null, C = null;
  if (NET_EVERY > 0 && (task.kind === 'boss' || task.kind === 'rush')) {   // One's and Steve Cobs's fights cannot be played online (inNetSession refuses them): no client
    client = bootRealm({ seed: task.seed + 7, art: task.art, w: 1024, h: 768, sink, label: 'client' }); C = client.win;
    client.setInfo(() => { const g = C.__G; return g ? { frame: g.frame, boss: g.bn } : {}; });
    client.setMute(true);   // the client's own opening frame, before any snapshot, is not the host's picture
    await C.eval('profileReady');
    C.eval('(' + pageHarness.toString() + ')()');
  }
  const out = { task, notes: [], sigs: [] };
  try {
    const cfg = { kind: task.kind, boss: task.boss, names: task.names, stocks, mode: task.mode, rush: task.kind === 'rush', story: !!task.story, trace: !!env.TRACE };
    H.eval(`__G.start(${JSON.stringify(cfg)})`);
    if (C) { C.eval(`__G.startClient(${JSON.stringify({ n: nNames, stocks, names: task.names })})`); client.setMute(false); }
    let stop = null;
    const maxFrames = task.kind === 'rush' ? 13 * (FORCED_END + 900) : task.mode === 'forced' ? FORCED_END + 1500 : FRAMES;
    const chunk = C ? NET_EVERY : 30;
    // the ending's own hold on the card and the next boss (BOSS_ENDINGS' holdMs), so a run lasts until the next boss is in and a moment of it has been played
    const endHold = task.kind === 'boss' ? H.eval(`(function(){ var r = BOSS_ROSTER.find(function(b){ return b.name === ${JSON.stringify(task.boss)}; }); var e = r && BOSS_ENDINGS[r.attack]; return e ? (e.holdMs || 0) : 0; })()`) : 0;
    let fellAt = null;
    for (let done = 0; done < maxFrames && !stop; done += chunk) {
      const st = H.eval(`__G.run(${chunk}, ${DRAW_EVERY})`);
      if (C) {
        const snap = H.eval('JSON.stringify(serializeState())');
        C.__snap = snap; client.clock.now = host.clock.now;
        C.eval('__G.client(JSON.parse(window.__snap))');
      }
      if (st === 'stopped' || st === 'paused') stop = st;
      const frame = H.eval('__G.frame');
      if (task.kind === 'rush') {
        const sp = JSON.parse(H.eval('JSON.stringify(__G.S.spawns.map(function(s){ return s.frame; }))'));
        if (sp.length >= 13 && frame - sp[12] > 420) stop = 'done';   // the second loop's first boss has been played for 7 s
      } else if (H.eval('__G.fallFrame') != null && fellAt == null) fellAt = frame;
      if (task.kind !== 'rush' && fellAt != null && frame - fellAt > Math.round((1500 + endHold) / 16.7) + 240) stop = 'done';
      if (progress && frame % 150 < chunk) progress({ frame, boss: H.eval('__G.bn') });
    }
    out.stop = stop || 'frames';
  } catch (e) {
    sink.add('harness', 'error', 'harness-error', String(e && e.message).slice(0, 80), `the harness itself threw: ${e && e.stack}`, String(e && e.stack), {});
    out.harnessError = String(e && e.stack);
  }
  const res = JSON.parse(H.eval('__G.result()'));
  const cres = C ? JSON.parse(C.eval('__G.result()')) : { F: {}, S: {} };
  const list = [];
  for (const [realm, r] of [['host', res], ['client', cres]]) for (const k in r.F) { const f = r.F[k]; list.push({ realm, sev: f.sev, kind: f.kind, key: f.key, n: f.n, frame: f.frame, boss: f.boss, phase: f.phase, age: f.age, detail: mapStack(f.detail), stack: '' }); }
  for (const f of sink.F.values()) list.push(f);
  out.findings = list; out.S = res.S; out.cS = cres.S; out.sigs = res.sigs;
  if (env.TRACE && res.S.log) out.log = res.S.log;
  out.pending = H.eval('window.__pending().length');
  try { host.dom.window.close(); if (client) client.dom.window.close(); } catch (e) { /* ignore */ }
  return out;
}

// the clean spawn of every boss, for the Boss Rush run's leak check
async function cleanSigs(bosses) {
  const sink = new Sink(), out = {};
  for (const b of bosses) {   // a game of its own for each: nothing a boss before it left behind
    const r = bootRealm({ seed: 99, art: false, sink, label: 'clean' });
    await r.win.eval('profileReady');
    r.win.eval('(' + pageHarness.toString() + ')()');
    out[b] = JSON.parse(r.win.eval(`JSON.stringify(__G.cleanSig(${JSON.stringify(b)}, ['Firey', 'Rocky']))`));
    r.win.close();
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------------------
//  THE SWEEP: tasks over worker processes, findings merged and printed per boss
// ---------------------------------------------------------------------------------------------------------------------------------
const ROSTER_BOSSES = ['Announcer', 'Puffball Speaker Box', 'Firey Speaker Box', 'The Bug Swarm', 'Purple Face', 'MePhone4', 'Evil Leafy', 'MePhone4S', 'Purple Dragon', 'Two', 'Springy', 'Four'];
const ALL_BOSSES = [...ROSTER_BOSSES, 'One', 'Steve Cobs'];
const planFor = (boss, k) => {
  const p = PLANS[k % PLANS.length], bi = ALL_BOSSES.indexOf(boss);
  const kind = boss === 'One' ? 'one' : boss === 'Steve Cobs' ? 'cobs' : 'boss';
  return { kind, boss, names: p.names, mode: p.mode, art: p.art, seed: 100 + k + 17 * Math.max(0, bi) + Number(env.SEED0 || 0), story: (kind !== 'boss') && p.names.length === 1 && k % 3 === 0, k };
};
const reproLine = (t) => [t.boss || 'Boss Rush', t.names.join(','), t.seed, t.mode, t.art ? 'art' : 'noart'].join('|');
const parseRepro = (s) => { const [boss, names, seed, mode, art] = s.split('|'); const kind = boss === 'One' ? 'one' : boss === 'Steve Cobs' ? 'cobs' : boss === 'Boss Rush' ? 'rush' : 'boss'; return { kind, boss: kind === 'rush' ? undefined : boss, names: names.split(','), seed: Number(seed), mode, art: art === 'art', story: false }; };

// SELFTEST=1: the hunter's own detectors, each fed a fault it must find (a hunter that finds nothing is only believed if it can find
// something). Prints one line a detector; the exit code is the number that missed.
async function selftest() {
  const sink = new Sink();
  const r = bootRealm({ seed: 5, art: true, sink, label: 'self' });
  const H = r.win;
  r.setInfo(() => ({ frame: H.__G ? H.__G.frame : -1 }));
  await H.eval('profileReady');
  H.eval('(' + pageHarness.toString() + ')()');
  H.eval(`__G.start(${JSON.stringify({ kind: 'boss', boss: 'Two', names: ['Firey', 'Pin'], stocks: 9, mode: 'natural' })})`);
  const run = (n) => H.eval(`__G.run(${n}, 1)`);
  run(120);
  const have = () => ({ page: JSON.parse(H.eval('JSON.stringify(__G.F)')), ctx: [...sink.F.values()] });
  const out = [];
  const expect = (name, test) => { const { page, ctx } = have(); let ok = false; try { ok = !!test(page, ctx); } catch (e) { ok = false; } out.push([name, ok]); };
  const pageHas = (kind, key) => (page) => Object.keys(page).some((k) => k.startsWith(kind + '|') && (!key || k.includes(key)));
  const ctxHas = (kind, key) => (page, ctx) => ctx.some((f) => f.kind === kind && (!key || f.key.includes(key)));
  // the canvas
  H.eval(`(function(){ var c = document.createElement('canvas').getContext('2d');
    c.arc(1, 1, -3, 0, 7); c.arc(NaN, 1, 3, 0, 7); c.ellipse(1, 1, -2, 3, 0, 0, 7); c.arcTo(0, 0, 5, 5, -1); c.createRadialGradient(0, 0, -1, 0, 0, 5); c.createLinearGradient(0, 0, NaN, 1);
    var g = c.createLinearGradient(0, 0, 1, 1); g.addColorStop(2, '#fff'); g.addColorStop(0, 'rgba(NaN,0,0,1)');
    c.fillStyle = 'NaN'; c.globalAlpha = 2; c.fillRect(0, 0, 5, undefined); c.drawImage(undefined, 0, 0); c.fillText('NaN%', 1, 1); c.restore();
    var im = new Image(); im.src = 'assets/sprites/does-not-exist.png'; c.drawImage(im, 0, 0, 5, 5);
    var z = document.createElement('canvas'); z.width = 0; z.height = 0; c.drawImage(z, 0, 0); })()`);
  expect('canvas: negative arc radius', ctxHas('ctx-throws', 'arc negative'));
  expect('canvas: non-finite arc coordinate', ctxHas('ctx-nonfinite', 'arc arg0'));
  expect('canvas: negative ellipse / arcTo radius', (p, c) => ctxHas('ctx-throws', 'ellipse negative')(p, c) && ctxHas('ctx-throws', 'arcTo negative')(p, c));
  expect('canvas: radial gradient with a negative radius', ctxHas('ctx-throws', 'radialGradient negative'));
  expect('canvas: gradient with a NaN coordinate', ctxHas('ctx-throws', 'createLinearGradient arg2'));
  expect('canvas: colour stop off 0..1, and a colour built from NaN', (p, c) => ctxHas('ctx-throws', 'addColorStop offset')(p, c) && ctxHas('ctx-throws', 'addColorStop colour')(p, c));
  expect('canvas: a colour, an alpha and an undefined size the browser ignores', (p, c) => ctxHas('ctx-ignored', 'fillStyle')(p, c) && ctxHas('ctx-ignored', 'globalAlpha')(p, c) && ctxHas('ctx-nonfinite', 'fillRect arg3')(p, c));
  expect('canvas: drawImage of nothing, a missing file, a zero-size canvas', (p, c) => ctxHas('ctx-throws', 'drawImage source')(p, c) && ctxHas('ctx-throws', 'broken image')(p, c) && ctxHas('ctx-throws', 'zero-size')(p, c) && ctxHas('asset-missing')(p, c));
  expect('canvas: text that reads NaN, restore with nothing saved', (p, c) => ctxHas('ctx-text')(p, c) && ctxHas('ctx-restore')(p, c));
  // exceptions and the page's own swallowed errors
  H.eval(`var _db = drawBossBar; drawBossBar = function(){ throw new Error('selftest draw'); }; __G.run(2, 1); drawBossBar = _db;`);
  H.eval(`var _ub = updateBossAttack; updateBossAttack = function(){ throw new Error('selftest step'); }; __G.run(2, 1); updateBossAttack = _ub;`);
  expect('a draw() that throws', pageHas('exception', 'draw: selftest draw'));
  expect('a step() that throws', pageHas('exception', 'step: selftest step'));
  H.eval(`var _ct = clutchTick; clutchTick = function(){ throw new Error('selftest swallowed'); }; __G.run(70, 99); clutchTick = _ct;`);
  expect('a catch(e){} that swallowed a real error', ctxHas('swallowed', 'selftest swallowed'));
  // numbers
  H.eval(`var b = __G.boss(); b.x = NaN; fighters[0].vy = Infinity; projectiles.push({ x: NaN, y: 3, vx: 0, vy: 0, r: 4, dmg: 1, life: 99, owner: -2, ownerObj: { team: -1, idx: -2 } }); __G.post(); b.x = 500; fighters[0].vy = 0; projectiles = [];`);
  expect('NaN in the boss, Infinity in a fighter, NaN in a shot', (p) => pageHas('nonfinite', 'boss Two.x')(p) && pageHas('nonfinite', 'fighter Firey.vy')(p) && pageHas('nonfinite', 'shot')(p));
  // the boss's turn
  H.eval(`__G.boss()._atkTimer = 1e6; __G.run(640, 3);`);
  expect('a turn held at 1e6 for 10 s', pageHas('turn-held'));
  H.eval(`var b2 = __G.boss(); b2._atkTimer = 99999; __G.bt.lastTurn = __G.frame - 100; b2._tel = 0; __G.run(520, 3);`);
  expect('no new attack for 10 s', pageHas('no-attack'));
  H.eval(`var b3 = __G.boss(); __G.bt.off = 0; for (var i = 0; i < 320; i++){ b3.x = -5000; b3.y = 300; __G.post(); __G.frame++; } b3.x = 500;`);
  expect('a boss off the screen for 5 s', pageHas('boss-offscreen'));
  // a fighter held
  H.eval(`var q = fighters[0]; for (var i = 0; i < 320; i++){ q.frozen = 500; q._swallow = 500; __G.post(); __G.frame++; } q.frozen = 0; q._swallow = 0;`);
  expect('a fighter frozen for 5 s', pageHas('fighter-stuck', 'frozen'));
  expect('a fighter swallowed for 5 s', pageHas('fighter-stuck', '_swallow'));
  // shots
  H.eval(`projectiles.push({ x: 5, y: -4000, vx: 0, vy: 0, r: 4, dmg: 1, life: 99999, owner: -2, ownerObj: { team: -1, idx: -2 }, shape: 'selftestshot' }); for (var i = 0; i < 1820; i++){ __G.post(); __G.frame++; } projectiles = [];`);
  expect('a shot alive for 30 s', pageHas('shot-lives-30s', 'selftestshot'));
  H.eval(`for (var i = 0; i < 320; i++) projectiles.push({ x: 5, y: -4000, vx: 0, vy: 0, r: 4, dmg: 1, life: 50, owner: -2, ownerObj: { team: -1, idx: -2 }, shape: 'selftestmany' }); __G.post(); projectiles = [];`);
  expect('more than 300 shots at once', pageHas('too-many-shots', 'selftestmany'));
  // a hit with no tell, a stunlock, a hit after the fall
  H.eval(`var f0 = fighters[0]; f0.invuln = 0; f0.hitstun = 0; f0.x = 300; f0.y = groundY() - 24; __G.tel.on = false; __G.tel.end = __G.frame - 200;
    var id = ++BOSS_ATK_ID; addProj({ owner: -2, ownerObj: { team: -1, idx: -2 }, x: f0.x, y: f0.y, vx: 0, vy: 0, r: 40, dmg: 9, kb: 3, life: 30, bossAtk: id, shape: 'selftestnotell', color: '#f00' }); __G.run(1, 99);`);
  expect('a boss hit with no wind-up and no mark, 12 frames after its source appeared', pageHas('notell', 'selftestnotell'));
  H.eval(`var f1 = fighters[0]; for (var i = 0; i < 4; i++){ f1.invuln = 0; f1.hitstun = 20; __G.post(); __G.frame++; f1.invuln = 3; applyHit(f1, 5, 1, -1, null, { bossAtk: ++BOSS_ATK_ID }); }`);
  expect('three boss hits in a row on a fighter who could not act', pageHas('stunlock'));
  expect('a boss hit that lands on a fighter in hit grace', pageHas('grace-hit'));
  H.eval(`__G.fallFrame = __G.frame; fighters[0].invuln = 0; fighters[0].hitstun = 0; applyHit(fighters[0], 5, 1, -1, null, { bossAtk: ++BOSS_ATK_ID }); __G.fallFrame = null;`);
  expect('a boss hit after the boss has fallen', pageHas('post-fall-hit'));
  H.eval(`puff(1, 1, undefined, 3); puff(NaN, 1, '#fff', 3);`);
  expect('a burst with no colour or no position', pageHas('puff'));
  if (env.SELFTEST_DEBUG) { const h = have(); console.log(Object.keys(h.page).join('\n')); console.log(h.ctx.map((f) => f.kind + '|' + f.key).join('\n')); }
  const missed = out.filter((o) => !o[1]).length;
  for (const [name, ok] of out) console.log(`  ${ok ? 'found ' : 'MISSED'}  ${name}`);
  console.log(`boss-glitch selftest: ${out.length - missed} of ${out.length} detectors found their fault`);
  r.win.close();
  process.exit(missed ? 1 : 0);
}

if (env.GLITCH_WORKER) {
  process.on('message', async (msg) => {
    if (msg === 'done') process.exit(0);
    try {
      const r = await runTask(msg.task, (p) => process.send({ progress: p }));
      process.send({ result: r });
    } catch (e) { process.send({ result: { task: msg.task, findings: [{ realm: 'worker', sev: 'error', kind: 'harness', key: 'task crashed', n: 1, frame: -1, boss: msg.task.boss || '', phase: 0, age: -1, detail: String(e && e.stack), stack: '' }], S: {}, cS: {}, sigs: [] } }); }
  });
} else if (env.SELFTEST) {
  await selftest();
} else {
  const t0 = Date.now();
  const bossList = env.BOSSES ? JSON.parse(env.BOSSES) : ALL_BOSSES;
  const rush = env.RUSH === 'only' ? 'only' : (env.RUSH === '0' ? 'no' : (env.BOSSES ? 'no' : 'yes'));
  let tasks = [];
  if (env.REPRO) { const t = parseRepro(env.REPRO); tasks = [t]; if (t.kind === 'rush') { t.k = 0; } }
  else {
    if (rush !== 'only') for (const b of bossList) for (let k = 0; k < RUNS; k++) tasks.push(planFor(b, k));
    if (rush !== 'no') tasks.unshift({ kind: 'rush', names: ['Firey', 'Rocky'], mode: 'forced', art: true, seed: 7, k: 0 });
  }
  const jobs = Math.max(1, Math.min(tasks.length, Number(env.JOBS || Math.max(2, Math.min(5, availableParallelism() - 4)))));
  console.log(`boss-glitch: ${tasks.length} runs on ${jobs} workers (FRAMES ${FRAMES}, draw every ${DRAW_EVERY}, client every ${NET_EVERY || 'never'}; script line offset ${SCRIPT_LINE0})`);
  const results = new Array(tasks.length);
  let next = 0, finished = 0;
  const work = (i) => new Promise((resolve) => {
    const child = fork(fileURLToPath(import.meta.url), [], { env: Object.assign({}, env, { GLITCH_WORKER: '1' }), execArgv: ['--max-old-space-size=3072'] });
    let mine = -1, last = Date.now(), watchdog = null, restarts = 0;
    const feed = () => { if (next < tasks.length) { mine = next++; last = Date.now(); child.send({ task: tasks[mine] }); } else { clearInterval(watchdog); child.send('done'); resolve(); } };
    child.on('message', (m) => {
      if (m.progress) { last = Date.now(); tasks[mine].lastProgress = m.progress; return; }
      results[mine] = m.result; finished++;
      const f = m.result.findings || [], bad = f.filter((x) => x.sev === 'error').length;
      console.log(`  [${finished}/${tasks.length}] ${reproLine(tasks[mine])}: ${m.result.S && m.result.S.frames} frames, ${f.length} findings (${bad} errors), boss falls ${m.result.S && m.result.S.falls}, ${m.result.stop}  (${Math.round((Date.now() - t0) / 1000)} s)`);
      feed();
    });
    child.on('exit', (code) => { if (code !== 0 && code !== null && mine >= 0 && !results[mine]) { results[mine] = { task: tasks[mine], findings: [{ realm: 'worker', sev: 'error', kind: 'crash', key: 'worker died', n: 1, frame: (tasks[mine].lastProgress || {}).frame ?? -1, boss: tasks[mine].boss || '', phase: 0, age: -1, detail: 'the worker process exited with code ' + code + ' (out of memory, or a hang killed it)', stack: '' }], S: {}, cS: {}, sigs: [] }; finished++; resolve(); } });
    watchdog = setInterval(() => { if (Date.now() - last > 240000 && mine >= 0 && !results[mine]) { results[mine] = { task: tasks[mine], findings: [{ realm: 'worker', sev: 'error', kind: 'hang', key: 'no progress for 240 s', n: 1, frame: (tasks[mine].lastProgress || {}).frame ?? -1, boss: tasks[mine].boss || '', phase: 0, age: -1, detail: `a run made no progress for 240 s (last: ${JSON.stringify(tasks[mine].lastProgress)}): the game is in a loop it cannot leave`, stack: '' }], S: {}, cS: {}, sigs: [] }; finished++; child.kill('SIGKILL'); clearInterval(watchdog); resolve(); } }, 10000);
    feed();
  });
  // worker slots refill themselves if one is killed by the watchdog
  const slots = Array.from({ length: jobs }, async () => { while (next < tasks.length) await work(); });
  await Promise.all(slots);

  // the Boss Rush run's leak check against a clean spawn of each boss
  const rushRes = results.find((r) => r && r.task && r.task.kind === 'rush');
  if (rushRes && rushRes.sigs && rushRes.sigs.length) {
    const clean = await cleanSigs(ROSTER_BOSSES);
    for (const sg of rushRes.sigs) {
      const c = clean[sg.boss]; if (!c) continue;
      for (const k of ['arena', 'stage', 'WW', 'WH', 'floors', 'projectiles', 'hostile', 'assists', 'bosses', 'beams', 'tendrils', 'items', 'evil', 'dust', 'debris', 'scars', 'oneFx', 'cobsFx', 'hz']) {
        if (JSON.stringify(sg[k]) !== JSON.stringify(c[k])) rushRes.findings.push({ realm: 'host', sev: 'error', kind: 'leak', key: `${sg.boss} spawns differently in the run: ${k}`, n: 1, frame: -1, boss: sg.boss, phase: 1, age: 0, detail: `${sg.boss}: ${k} is ${JSON.stringify(sg[k])} when it spawns in the Boss Rush, ${JSON.stringify(c[k])} on a clean start`, stack: '' });
      }
      if (sg.plats.join('|') !== c.plats.join('|')) {
        const extra = sg.plats.filter((p) => !c.plats.includes(p)), missing = c.plats.filter((p) => !sg.plats.includes(p));
        rushRes.findings.push({ realm: 'host', sev: 'error', kind: 'leak', key: `${sg.boss} spawns with other platforms in the run`, n: 1, frame: -1, boss: sg.boss, phase: 1, age: 0, detail: `${sg.boss}'s arena has platforms the clean start does not (${extra.length}: ${extra.slice(0, 4).join(' | ')}) or lacks some (${missing.length}: ${missing.slice(0, 4).join(' | ')})`, stack: '' });
      }
    }
  }

  // ---- the report
  const byBoss = new Map();
  for (const r of results) {
    if (!r) continue;
    const label = r.task.kind === 'rush' ? 'BOSS RUSH (all twelve)' : r.task.boss;
    const B = byBoss.get(label) || { runs: [], F: new Map(), stats: { frames: 0, falls: 0, runs: 0, maxShots: 0, hits: {}, turns: 0, phases: {}, dyn: {} } };
    byBoss.set(label, B); B.runs.push(r);
    B.stats.runs++; B.stats.frames += (r.S && r.S.frames) || 0; B.stats.falls += (r.S && r.S.falls) || 0; B.stats.maxShots = Math.max(B.stats.maxShots, (r.S && r.S.maxShots) || 0); B.stats.turns += (r.S && r.S.turns) || 0;
    for (const [k, v] of Object.entries((r.S && r.S.phases) || {})) B.stats.phases[k] = (B.stats.phases[k] || 0) + v;
    for (const [k, v] of Object.entries((r.S && r.S.dyn) || {})) B.stats.dyn[k] = (B.stats.dyn[k] || 0) + v;
    for (const [k, v] of Object.entries((r.S && r.S.hits) || {})) { const h = B.stats.hits[k] || (B.stats.hits[k] = { n: 0, dmg: 0, minAge: 1e9, noTell: 0, cat: v.cat }); h.n += v.n; h.dmg += v.dmg; h.minAge = Math.min(h.minAge, v.minAge); h.noTell += v.noTell; }
    for (const f of r.findings || []) {
      const id = f.realm + '|' + f.kind + '|' + f.key;
      let g = B.F.get(id);
      if (!g) { g = Object.assign({}, f, { n: 0, runs: 0, repro: reproLine(r.task), at: `frame ${f.frame}, ${f.boss || '-'} phase ${f.phase}, age ${f.age}` }); B.F.set(id, g); }
      g.n += f.n; g.runs++;
    }
  }
  const order = { error: 0, warn: 1, info: 2 };
  const lines = [];
  for (const [label, B] of byBoss) {
    const fs = [...B.F.values()].filter((f) => VERBOSE || f.sev !== 'info').sort((a, b) => (order[a.sev] - order[b.sev]) || (b.n - a.n));
    lines.push(`\n=== ${label}: ${B.stats.runs} runs, ${B.stats.frames} frames, ${B.stats.falls} falls, ${B.stats.turns} turns, most shots at once ${B.stats.maxShots}; ${fs.filter((f) => f.sev === 'error').length} errors, ${fs.filter((f) => f.sev === 'warn').length} warnings ===`);
    for (const f of fs) {
      lines.push(`  [${f.sev}] ${f.realm === 'client' ? '(client) ' : ''}${f.kind}: ${f.key}   x${f.n} in ${f.runs} run${f.runs > 1 ? 's' : ''}`);
      lines.push(`      repro: ${f.repro}  | first at ${f.at}`);
      lines.push(`      ${f.detail.replace(/\s+/g, ' ').slice(0, 700)}`);
      if (f.stack) lines.push(`      stack: ${f.stack}`);
    }
    if (VERBOSE) {
      const hs = Object.entries(B.stats.hits).sort((a, b) => b[1].dmg - a[1].dmg).slice(0, 14);
      lines.push('  boss hit sources (hits, damage, youngest source, no-tell candidates): ' + hs.map(([k, h]) => `${k} ${h.n}/${Math.round(h.dmg)}%/age ${h.minAge}/nt ${h.noTell}`).join('; '));
      lines.push('  extra fighter fields seen: ' + Object.keys(B.stats.dyn).join(', '));
    }
  }
  console.log(lines.join('\n'));
  if (env.TRACE) for (const r of results) if (r && r.log) console.log('hit log (frame, victim, source, damage, source age, since wind-up, victim hitstun/frozen/swallow/invuln, x, y, attack id):\n' + r.log.map((l) => l.join(' ')).join('\n'));
  if (env.OUT) writeFileSync(env.OUT, JSON.stringify({ when: new Date().toISOString(), tasks: tasks.map(reproLine), results: results.map((r) => r && { task: r.task, stop: r.stop, S: r.S, cS: r.cS, findings: r.findings }) }, null, 1));
  console.log(`\nboss-glitch: done in ${Math.round((Date.now() - t0) / 1000)} s`);
}
