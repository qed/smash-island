// Makes artifacts/V1/og-image.png: the 1200x630 picture a pasted link unfurls into (Discord, Slack, Messages, X, Facebook,
// WhatsApp...). Re-run it whenever the lineup or the wording below changes:
//
//     node scripts/make-og-image.mjs                 (writes artifacts/V1/og-image.png)
//     node scripts/make-og-image.mjs --out some.png  (anywhere else, for a look)
//
// It builds a one-page HTML composition from the game's OWN art (artifacts/V1/assets/sprites) and the Fredoka face the repo
// already ships in node_modules (@fontsource/fredoka), loads it in the Electron that is already a devDependency, captures it
// with capturePage(), then squeezes the PNG under MAX_KB (WhatsApp and a few others drop a preview image over ~300 KB).
// Nothing is downloaded and nothing is installed; no show logo is drawn -- the title is typeset, the cast is the game's.
//
// WHO MAY STAND IN THE LINEUP. The picture is public and is the first thing a stranger sees, so it follows the same rule as
// every other public surface of the game: it never shows a secret. That is the Vault's fighters (a code opens them, so they
// are not on the board at the start), Steve Cobs's prize (OJ, Suitcase, Cabby), and One and Steve Cobs themselves. Every name
// in LINEUP is an ordinary fighter; test/share-and-previews.test.js re-checks the list against the game's own VAULT and
// prize tables on every run, so adding a fighter here that the game keeps behind a code fails the suite rather than the site.

import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { deflateSync } from 'node:zlib';

const require = createRequire(import.meta.url);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SPRITES = join(ROOT, 'artifacts', 'V1', 'assets', 'sprites');
const DEFAULT_OUT = join(ROOT, 'artifacts', 'V1', 'og-image.png');

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const MAX_KB = 300;           // the hard cap: the script fails rather than write a bigger file
export const TRUECOLOUR_KB = 250;    // above this the picture is written as a 256-colour palette instead

// The picture's words. The title is the game's own; the strapline is the pitch in a line and carries the two facts a stranger
// needs ("free", "fan-made") plus the two shows it is made from; the footnote says where it is played and that it is unofficial.
export const TITLE = ['BATTLE FOR', 'SMASH ISLAND'];
export const STRAPLINE = 'A free, fan-made BFDI & Inanimate Insanity fighter';
export const FOOTNOTE = 'Play in your browser · No account · Unofficial fan game';

// The lineup, left to right. `cx` is the sprite's centre on the 1200px canvas, `dy` a few pixels of stagger so it reads as a
// crowd and not a ruler, `face` the way it looks (the left half squares up to the right half), `left` marks art the game itself
// flips because the render faces left (renderSprite(..., { flip:true }) in index.html) -- those get mirrored here to face the way
// `face` says. Seven starters (the fighters a new player actually begins with) and two Inanimate Insanity faces among them.
export const LINEUP = [
  { name: 'Blocky',    file: 'blocky.png',       cx: 124,  dy: 4,  face: 'right', left: true },
  { name: 'Pen',       file: 'pen.png',          cx: 272,  dy: -6, face: 'right', left: false },
  { name: 'Test Tube', file: 'test-tube.png',    cx: 372,  dy: 5,  face: 'right', left: false },
  { name: 'Leafy',     file: 'leafy.png',        cx: 500,  dy: -3, face: 'right', left: false },
  { name: 'Firey',     file: 'firey.png',        cx: 664,  dy: 2,  face: 'left',  left: true },
  { name: 'Pickle',    file: 'pickle.png',       cx: 794,  dy: -5, face: 'left',  left: false },
  { name: 'Match',     file: 'match.png',        cx: 878,  dy: 4,  face: 'left',  left: false },
  { name: 'Pencil',    file: 'pencil-angry.png', cx: 982,  dy: -4, face: 'left',  left: false },
  { name: 'Ice Cube',  file: 'ice-cube.png',     cx: 1094, dy: 3,  face: 'left',  left: true },
];

const SPRITE_H = 196;   // the renders are 200px tall: drawn at 196 they are never enlarged, so never soft
const FEET = 580;       // the line the lineup stands on

function fontFace(weight, file) {
  const p = join(ROOT, 'node_modules', '@fontsource', 'fredoka', 'files', file);
  const b64 = readFileSync(p).toString('base64');
  return `@font-face{font-family:'Fredoka';font-weight:${weight};src:url(data:font/woff2;base64,${b64}) format('woff2')}`;
}

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

// The composition. Colours are the title screen's own (#title in index.html): the sky over grass split at 52%, the cream title
// with a hard black outline and a hard offset shadow, the pink pill with its black border and drop.
export function compositionHtml() {
  const fonts = fontFace(600, 'fredoka-latin-600-normal.woff2') + fontFace(700, 'fredoka-latin-700-normal.woff2');
  const sprites = LINEUP.map((s) => {
    const mirror = (s.face === 'right') === s.left;   // art that faces left, asked to face right (or the reverse): mirror it
    const src = pathToFileURL(join(SPRITES, s.file)).href;
    const feet = FEET + s.dy;
    return `<div class="shadow" style="left:${s.cx}px;top:${feet - 13}px"></div>`
      + `<img class="spr" alt="" src="${src}" style="left:${s.cx}px;top:${feet - SPRITE_H}px;height:${SPRITE_H}px${mirror ? ';transform:translateX(-50%) scaleX(-1)' : ''}">`;
  }).join('\n');
  const cloud = (x, y, k) => `<div class="cloud" style="left:${x}px;top:${y}px;transform:scale(${k})"></div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${fonts}
html,body{margin:0;width:${OG_WIDTH}px;height:${OG_HEIGHT}px;overflow:hidden;background:#88cdf2}
#c{position:relative;width:${OG_WIDTH}px;height:${OG_HEIGHT}px;overflow:hidden;font-family:'Fredoka',system-ui,sans-serif;
  background:radial-gradient(90% 70% at 50% -8%, #ffffffcc 0 36%, #fff0 72%), linear-gradient(#bfe8ff 0 52%, #7bc043 52% 100%)}
.horizon{position:absolute;left:0;right:0;top:${Math.round(OG_HEIGHT * 0.52) - 4}px;height:8px;background:#5a9c2e;opacity:.5}
.cloud{position:absolute;width:96px;height:34px;background:#fff;border-radius:34px;opacity:.92}
.cloud::before,.cloud::after{content:"";position:absolute;background:#fff;border-radius:50%}
.cloud::before{left:14px;top:-18px;width:44px;height:44px}
.cloud::after{left:42px;top:-28px;width:54px;height:54px}
.title{position:absolute;left:0;right:0;top:12px;text-align:center;color:#fffdf7;line-height:.88;font-weight:700;
  -webkit-text-stroke:12px #1c1c1c;paint-order:stroke fill;filter:drop-shadow(7px 9px 0 rgba(0,0,0,.2));transform:rotate(-1.6deg)}
.title .l1{display:block;font-size:84px;letter-spacing:8px}
.title .l2{display:block;font-size:150px;letter-spacing:2px;margin-top:2px}
.strap{position:absolute;left:0;right:0;top:262px;text-align:center}
.strap span{display:inline-block;background:#e84b9c;color:#fff;font-weight:700;font-size:34px;padding:7px 30px 9px;border:4px solid #1c1c1c;
  border-radius:18px;box-shadow:0 6px 0 #1c1c1c}
.spr{position:absolute;transform:translateX(-50%);filter:drop-shadow(0 3px 0 rgba(0,0,0,.18))}
.shadow{position:absolute;width:150px;height:26px;margin-left:-75px;border-radius:50%;background:radial-gradient(#0000004a,#0000 70%)}
.foot{position:absolute;left:0;right:0;bottom:11px;text-align:center;color:#1f3d0e;font-weight:600;font-size:23px;letter-spacing:.5px}
</style></head><body><div id="c">
${cloud(34, 60, 1)}${cloud(1052, 50, 1.1)}${cloud(40, 214, 0.8)}${cloud(1070, 196, 0.9)}
<div class="horizon"></div>
<div class="title"><span class="l1">${esc(TITLE[0])}</span><span class="l2">${esc(TITLE[1])}</span></div>
<div class="strap"><span>${esc(STRAPLINE)}</span></div>
${sprites}
<div class="foot">${esc(FOOTNOTE)}</div>
</div></body></html>`;
}

// ---- the Electron side: a throwaway main script, run with the repo's own electron ---------------------------------------
const MAIN_CJS = `
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
app.commandLine.appendSwitch('force-device-scale-factor', '1');   // 1200x630 means 1200x630 CSS px AND pixels, on any display
app.commandLine.appendSwitch('force-color-profile', 'srgb');      // the colours in the CSS are the colours in the PNG, whatever monitor profile is active
app.disableHardwareAcceleration();
app.setPath('userData', path.join(process.env.OG_TMP, 'userdata'));   // never touch (or lock) the real app's profile
app.whenReady().then(async () => {
  const w = +process.env.OG_W, h = +process.env.OG_H;
  const win = new BrowserWindow({ width: w, height: h, useContentSize: true, show: false, frame: false, backgroundColor: '#ffffff',
    webPreferences: { backgroundThrottling: false, sandbox: true } });
  await win.loadFile(process.env.OG_HTML);
  await win.webContents.executeJavaScript(
    "document.fonts.ready.then(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {})))).then(() => true)");
  await new Promise((r) => setTimeout(r, 400));
  const img = await win.webContents.capturePage();
  const size = img.getSize();
  fs.writeFileSync(process.env.OG_OUT, img.toPNG());
  console.log('captured ' + size.width + 'x' + size.height);
  app.exit(size.width === w && size.height === h ? 0 : 3);
});
`;

function capture(html, outPng, timeoutMs = 280000) {
  const tmp = mkdtempSync(join(tmpdir(), 'bfsi-og-'));
  const htmlPath = join(tmp, 'index.html');
  const mainPath = join(tmp, 'main.cjs');
  writeFileSync(htmlPath, html);
  writeFileSync(mainPath, MAIN_CJS);
  const env = { ...process.env, OG_TMP: tmp, OG_HTML: htmlPath, OG_OUT: outPng, OG_W: String(OG_WIDTH), OG_H: String(OG_HEIGHT) };
  delete env.ELECTRON_RUN_AS_NODE;   // set, Electron would behave as plain node and never open a window
  return new Promise((ok, fail) => {
    const child = spawn(require('electron'), [mainPath], { env, stdio: ['ignore', 'inherit', 'inherit'], windowsHide: true });
    const timer = setTimeout(() => { child.kill(); fail(new Error('electron did not finish in ' + timeoutMs / 1000 + 's')); }, timeoutMs);
    child.on('error', (e) => { clearTimeout(timer); fail(e); });
    child.on('exit', (code) => {
      clearTimeout(timer);
      try { rmSync(tmp, { recursive: true, force: true }); } catch (e) { /* the OS cleans its temp */ }
      code === 0 ? ok() : fail(new Error('electron exited with code ' + code));
    });
  });
}

// ---- the PNG side: truecolour first, a 256-colour palette if that is still over budget ---------------------------------
function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (crc ^ buf[i]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, 'latin1');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}
function pngFile(w, h, colorType, palette, raw) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = colorType;   // 8 bits per sample, no interlace
  const parts = [Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr)];
  if (palette) parts.push(chunk('PLTE', Buffer.from(palette)));
  parts.push(chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(parts);
}
// Pixels -> filtered scanlines. Truecolour rows pick the filter (None/Sub/Up/Paeth) with the smallest sum of absolute
// residuals, the usual heuristic; palette rows stay unfiltered (flat runs deflate best that way).
function scanlines(pix, w, h, bpp, adaptive) {
  const stride = w * bpp, out = Buffer.alloc((stride + 1) * h);
  const paeth = (a, b, c) => { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
  for (let y = 0; y < h; y++) {
    const row = pix.subarray(y * stride, (y + 1) * stride), prev = y ? pix.subarray((y - 1) * stride, y * stride) : null;
    let best = 0, bestSum = Infinity, bestBuf = row;
    for (const f of adaptive ? [0, 1, 2, 4] : [0]) {
      const buf = Buffer.alloc(stride); let sum = 0;
      for (let i = 0; i < stride; i++) {
        const a = i >= bpp ? row[i - bpp] : 0, b = prev ? prev[i] : 0, c = prev && i >= bpp ? prev[i - bpp] : 0;
        const v = (row[i] - (f === 0 ? 0 : f === 1 ? a : f === 2 ? b : paeth(a, b, c))) & 255;
        buf[i] = v; sum += v < 128 ? v : 256 - v;
      }
      if (sum < bestSum) { bestSum = sum; best = f; bestBuf = buf; }
    }
    out[y * (stride + 1)] = best; bestBuf.copy(out, y * (stride + 1) + 1);
  }
  return out;
}
export function truecolour(rgba, w, h) {
  const rgb = Buffer.alloc(w * h * 3);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) { rgb[j] = rgba[i]; rgb[j + 1] = rgba[i + 1]; rgb[j + 2] = rgba[i + 2]; }
  return pngFile(w, h, 2, null, scanlines(rgb, w, h, 3, true));
}
// Median cut on the image's real colours (not a binned histogram: the sky gradient needs its exact steps), then the nearest
// palette entry per distinct colour. No dithering: flat-shaded art does not want the noise.
export function palettePng(rgba, w, h, size = 256) {
  const counts = new Map();
  for (let i = 0; i < rgba.length; i += 4) { const k = (rgba[i] << 16) | (rgba[i + 1] << 8) | rgba[i + 2]; counts.set(k, (counts.get(k) || 0) + 1); }
  const boxes = [[...counts.entries()].map(([k, n]) => ({ r: k >> 16, g: (k >> 8) & 255, b: k & 255, n }))];
  const range = (bx) => { const lo = { r: 255, g: 255, b: 255 }, hi = { r: 0, g: 0, b: 0 };
    for (const c of bx) for (const ch of ['r', 'g', 'b']) { if (c[ch] < lo[ch]) lo[ch] = c[ch]; if (c[ch] > hi[ch]) hi[ch] = c[ch]; }
    let ch = 'r', span = hi.r - lo.r; if (hi.g - lo.g > span) { ch = 'g'; span = hi.g - lo.g; } if (hi.b - lo.b > span) { ch = 'b'; span = hi.b - lo.b; }
    return { ch, span }; };
  while (boxes.length < size) {
    let pick = -1, bestScore = -1, pickCh = 'r';
    boxes.forEach((bx, i) => { if (bx.length < 2) return; const { ch, span } = range(bx); const score = span * Math.log2(2 + bx.length); if (score > bestScore) { bestScore = score; pick = i; pickCh = ch; } });
    if (pick < 0) break;
    const bx = boxes[pick];
    bx.sort((p, q) => p[pickCh] - q[pickCh]);
    let total = 0; for (const p of bx) total += p.n;
    let acc = 0, cut = 1; for (let i = 0; i < bx.length - 1; i++) { acc += bx[i].n; cut = i + 1; if (acc >= total / 2) break; }
    boxes.splice(pick, 1, bx.slice(0, cut), bx.slice(cut));
  }
  const pal = boxes.map((bx) => { let n = 0, r = 0, g = 0, b = 0; for (const c of bx) { n += c.n; r += c.r * c.n; g += c.g * c.n; b += c.b * c.n; }
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n)]; });
  const cache = new Map(), idx = Buffer.alloc(w * h);
  for (let i = 0, p = 0; i < rgba.length; i += 4, p++) {
    const k = (rgba[i] << 16) | (rgba[i + 1] << 8) | rgba[i + 2];
    let v = cache.get(k);
    if (v === undefined) {
      let bd = Infinity; v = 0;
      for (let j = 0; j < pal.length; j++) { const dr = pal[j][0] - rgba[i], dg = pal[j][1] - rgba[i + 1], db = pal[j][2] - rgba[i + 2]; const d = dr * dr + dg * dg + db * db; if (d < bd) { bd = d; v = j; } }
      cache.set(k, v);
    }
    idx[p] = v;
  }
  return pngFile(w, h, 3, pal.flat(), scanlines(idx, w, h, 1, false));
}

function squeeze(capturedPng) {
  const { PNG } = require('pngjs');
  const img = PNG.sync.read(capturedPng);
  if (img.width !== OG_WIDTH || img.height !== OG_HEIGHT) throw new Error(`capture is ${img.width}x${img.height}, wanted ${OG_WIDTH}x${OG_HEIGHT}`);
  // Lossless truecolour when it is comfortably small; otherwise the palette, which for flat-shaded art over a sky gradient is
  // a third of the size and indistinguishable at the size a link preview is shown.
  let out = truecolour(img.data, img.width, img.height), how = 'truecolour';
  if (out.length > TRUECOLOUR_KB * 1024) { out = palettePng(img.data, img.width, img.height); how = '256-colour palette'; }
  if (out.length > MAX_KB * 1024) throw new Error(`still ${(out.length / 1024).toFixed(0)} KB after the palette pass; simplify the composition`);
  return { out, how };
}

async function main() {
  const t0 = Date.now(), lap = (what) => console.log(`  ${what}: ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const out = outIdx >= 0 ? resolve(args[outIdx + 1]) : DEFAULT_OUT;
  for (const s of LINEUP) if (!existsSync(join(SPRITES, s.file))) throw new Error('missing sprite ' + s.file + ' for ' + s.name);
  const raw = join(mkdtempSync(join(tmpdir(), 'bfsi-og-raw-')), 'capture.png');
  await capture(compositionHtml(), raw);
  lap('captured');
  const { out: png, how } = squeeze(readFileSync(raw));
  lap('squeezed');
  writeFileSync(out, png);
  rmSync(dirname(raw), { recursive: true, force: true });
  console.log(`wrote ${out}: ${OG_WIDTH}x${OG_HEIGHT}, ${(statSync(out).size / 1024).toFixed(0)} KB (${how})`);
}

// Importing this file (the test does, for LINEUP) must not open a window.
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((e) => { console.error(e.message || e); process.exit(1); });
}
