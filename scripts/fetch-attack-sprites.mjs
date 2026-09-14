// ============================================================================
//  fetch-attack-sprites.mjs — pull the show's own art for what the fighters THROW
// ============================================================================
// Same footing as fetch-sprites.mjs: Battle for Smash Island is an unaffiliated, non-commercial fan
// work; this fetches artwork from battlefordreamisland.fandom.com (jacknjellify's designs) and records
// the exact source URL of every file for CREDITS.md. A file that fails a guarantee is REJECTED:
//   · a real PNG (gif/jpg/webp are skipped -- no transparency, or none we can trust)
//   · genuinely transparent: at least 12% of the canvas is clear, or it is a screenshot with a sky
//   · substantial after cropping to its alpha box: at least 24px on its long side
// Output: <out>/<kit>.png at TARGET_H tall (aspect kept), <out>/manifest.json, <out>/credits.txt.
//
//   node fetch-attack-sprites.mjs <outDir> [kit ...]
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';

const WIKI = 'https://battlefordreamisland.fandom.com';
const UA = { 'User-Agent': 'smash-island-fan-game/1.0 (personal fan project)' };
const TARGET_H = 56;

// kit -> the wiki file that is the show's version of what this fighter throws
const PICKS = {
  payday:   { who: 'Money',      file: ['Coins.png', 'Rc Dollar Bill.png', 'Zero Dollar Bill.png', 'Panda dollar bill.png'], note: 'coins, or a bill: what she throws' },
  ember:    { who: 'Firey',      file: 'Firey - neutral flame.png', note: "Firey's flame" },
  emberjr:  { who: 'Firey Jr.',  file: 'Firey - neutral flame.png', note: "the same flame, smaller" },
  shatter:  { who: 'Ice Cube',   file: "Ice Cube's Shatter.png",    note: 'her shatter' },
  freeze:   { who: 'Gelatin',    file: 'Gelatin syringe holder.png', note: 'the freeze syringes (BFDIA)' },
  barf:     { who: 'Rocky',      file: "Rocky's Barf Line.png",     note: 'the barf stream asset, its head', crop: 260 },
  fry:      { who: 'Fries',      file: ['Copia Fries only fry.png', 'Fries One Fry.png', 'Fries - mad fry.png'], note: 'one fry' },
  slice:    { who: 'Cake',       file: 'Cake slice.png',            note: 'a slice of cake' },
  donut:    { who: 'Donut',      file: 'Donut.png',                 note: 'a donut' },
  lollipop: { who: 'Lollipop',   file: 'Lollipop - 2.png',          note: 'a lollipop' },
  sign:     { who: 'Bracelety',  file: ['Bracelety Sign Blank.png', 'Bracelety bfb sign welcome.png', 'Bracelety sign.png'], note: 'her sign' },
  log:      { who: 'Tree',       file: 'TREE BRANCH.png',           note: 'a branch' },
  van:      { who: 'Pencil',     file: 'SuperVAN!2340001.png',      note: 'the Supervan' },
  bubble:   { who: 'Bubble',     file: "Bubble's asset.png",        note: 'a bubble' },
  cap:      { who: 'Pen',        file: 'Pen Cap.png',               note: 'his cap' },
  tag:      { who: 'Price Tag',  file: 'Price Tag S2 Asset.png',    note: 'a price tag' },
  measure:  { who: 'Ruler',      file: ["Ruler's Asset.png", 'Bfdia 12 ruler asset.png', 'Ruler Asset BFDIE.png', 'Ruler Asset.png'], note: 'the ruler itself' },
  bomb:     { who: 'Bomby',      file: ['Bomby fly away before exploding.png', 'Bomby Explosion.PNG'], note: 'his explosion' },
  spark:    { who: 'Match',      file: 'Matchfire.png',             note: "Match's flame" },
};

async function api(params) {
  const r = await fetch(`${WIKI}/api.php?${new URLSearchParams({ ...params, format: 'json' })}`, { headers: UA });
  if (!r.ok) throw new Error(`api ${r.status}`);
  return r.json();
}
async function fileUrl(title) {
  const j = await api({ action: 'query', titles: `File:${title}`, prop: 'imageinfo', iiprop: 'url|size|mime' });
  const p = Object.values(j.query.pages)[0];
  const i = p && p.imageinfo && p.imageinfo[0];
  return i ? { url: i.url, w: i.width, h: i.height, mime: i.mime } : null;
}
// `?format=original` is load-bearing (see fetch-sprites.mjs): Wikia content-negotiates to WebP even when
// the URL ends in .png. scale-to-height-down has the server shrink giant renders before they travel.
function originalUrl(url, h) {
  const base = url.split('/revision/')[0];
  return `${base}/revision/latest/scale-to-height-down/${h}?format=original`;
}
async function download(url) {
  const r = await fetch(originalUrl(url, 400), { headers: UA });
  if (!r.ok) throw new Error(`download ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}
function alphaBox(png) {
  let x0 = png.width, y0 = png.height, x1 = -1, y1 = -1, clear = 0;
  for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
    const a = png.data[(y * png.width + x) * 4 + 3];
    if (a < 16) { clear++; continue; }
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return { x0, y0, x1, y1, clearFrac: clear / (png.width * png.height) };
}
// box-filter downscale of a cropped region to height H (aspect kept); pngjs RGBA, premultiplied average
function shrink(png, box, H) {
  const sw = box.x1 - box.x0 + 1, sh = box.y1 - box.y0 + 1;
  const scale = Math.min(1, H / sh), W = Math.max(1, Math.round(sw * scale)), HH = Math.max(1, Math.round(sh * scale));
  const out = new PNG({ width: W, height: HH });
  for (let y = 0; y < HH; y++) for (let x = 0; x < W; x++) {
    const sx0 = box.x0 + Math.floor(x / scale), sx1 = Math.min(box.x1, box.x0 + Math.floor((x + 1) / scale) - 1);
    const sy0 = box.y0 + Math.floor(y / scale), sy1 = Math.min(box.y1, box.y0 + Math.floor((y + 1) / scale) - 1);
    let r = 0, g = 0, b = 0, a = 0, n = 0;
    for (let sy = sy0; sy <= Math.max(sy0, sy1); sy++) for (let sx = sx0; sx <= Math.max(sx0, sx1); sx++) {
      const i = (sy * png.width + sx) * 4, al = png.data[i + 3] / 255;
      r += png.data[i] * al; g += png.data[i + 1] * al; b += png.data[i + 2] * al; a += al; n++;
    }
    const o = (y * W + x) * 4;
    if (a > 0) { out.data[o] = r / a; out.data[o + 1] = g / a; out.data[o + 2] = b / a; out.data[o + 3] = Math.round(255 * a / n); }
    else { out.data[o] = out.data[o + 1] = out.data[o + 2] = 0; out.data[o + 3] = 0; }
  }
  return out;
}

const outDir = process.argv[2];
if (!outDir) { console.error('usage: node fetch-attack-sprites.mjs <outDir> [kit ...]'); process.exit(1); }
mkdirSync(outDir, { recursive: true });
const only = new Set(process.argv.slice(3));
const manifest = {}, credits = [];
for (const [kit, pick] of Object.entries(PICKS)) {
  if (only.size && !only.has(kit)) continue;
  const line = (msg) => console.log(`${kit.padEnd(9)} ${pick.who.padEnd(11)} ${msg}`);
  const candidates = Array.isArray(pick.file) ? pick.file : [pick.file];
  let done = false;
  for (const cand of candidates) { if (done) break; try {
    const info = await fileUrl(cand);
    if (!info) { line(`skip: no such file "${cand}"`); continue; }
    if (info.mime !== 'image/png') { line(`REJECT: ${info.mime}, not a PNG`); continue; }
    const buf = await download(info.url);
    const png = PNG.sync.read(buf);
    const box = alphaBox(png);
    if (box.x1 < 0) { line(`skip ${cand}: fully transparent`); continue; }
    if (box.clearFrac < 0.12) { line(`skip ${cand}: not transparent (${(100 * box.clearFrac).toFixed(0)}% clear)`); continue; }
    if (pick.crop) box.y1 = Math.min(box.y1, box.y0 + pick.crop - 1);   // a stream asset: keep its head
    const cw = box.x1 - box.x0 + 1, ch = box.y1 - box.y0 + 1;
    if (Math.max(cw, ch) < 24) { line(`skip ${cand}: ${cw}x${ch} after cropping`); continue; }
    const small = shrink(png, box, TARGET_H);
    const file = `${kit}.png`;
    writeFileSync(`${outDir}/${file}`, PNG.sync.write(small));
    manifest[kit] = { who: pick.who, file, source: info.url, srcTitle: cand, width: small.width, height: small.height, clearFrac: +box.clearFrac.toFixed(3), note: pick.note };
    credits.push(`- ${pick.who} (${kit}, ${file}): ${pick.note} — ${info.url}`);
    line(`ok ${cand}: ${info.w}x${info.h} -> ${small.width}x${small.height} (${(100 * box.clearFrac).toFixed(0)}% clear)`); done = true;
  } catch (e) { line(`${cand} FAILED: ${e.message}`); } }
  if (!done) line('REJECT: no candidate passed');
}
writeFileSync(`${outDir}/manifest.json`, JSON.stringify(manifest, null, 2));
writeFileSync(`${outDir}/credits.txt`, credits.join('\n') + '\n');
console.log(`\n${Object.keys(manifest).length} sprites written to ${outDir}`);
