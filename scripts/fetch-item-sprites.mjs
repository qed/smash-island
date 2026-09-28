// ============================================================================
//  fetch-item-sprites.mjs — the show's own art for the PICKUPS (items[], pickUpItem)
// ============================================================================
// The owner: "make items look better." Asked how, they chose "Show art + polish": each item wears the show's
// own art where it exists, with a soft glow and a gentle bob, and a clean drawn icon where no art exists.
//
// A small sibling of fetch-attack-sprites.mjs, on the same footing: Battle for Smash Island is an unaffiliated,
// non-commercial fan work; this fetches artwork from battlefordreamisland.fandom.com (jacknjellify's designs)
// and records the exact source URL of every file for CREDITS.md. The same guarantees, and a file that fails one
// is REJECTED:
//   · a real PNG (gif/jpg/webp are skipped -- no transparency, or none we can trust)
//   · genuinely transparent: at least 12% of the canvas is clear (a plain screenshot is ~0% clear and fails)
//   · substantial after cropping to its alpha box: at least 24px on its long side
// Every output was looked at before it shipped; the candidates that failed on sight are listed at the bottom.
// Output: <outDir>/<kind>.png at TARGET_H tall (aspect kept, never more than MAX_SIDE on its long side), and
// scripts/item-sprite-manifest.json (the record test/item-art.test.js pins). Credit lines are printed, for
// CREDITS.md's "Item art" section.
//
//   node scripts/fetch-item-sprites.mjs [outDir] [kind ...]      (outDir defaults to artifacts/V1/assets/sprites/items)
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';

const WIKI = 'https://battlefordreamisland.fandom.com';
const UA = { 'User-Agent': 'smash-island-fan-game/1.0 (personal fan project)' };
// Drawn about 34px tall on a pickup; 64 keeps them crisp when the camera zooms in, and well under the 128px cap
// the attack art keeps (an item is pickup-sized, never a render).
const TARGET_H = 64;
const MAX_SIDE = 128;
const MANIFEST = 'scripts/item-sprite-manifest.json';

// item kind (ITEM_KINDS) -> the wiki file that is the show's version of it. The first file that passes wins.
// Kinds with no usable art on the wiki are not here: the game draws them (ITEM_ICON in index.html).
//   marmalade  no file of marmalade exists on either wiki (searched "marmalade", "jam", "jar of jam"; the only
//              jam is Yoyleberry Jam, which is purple and is not marmalade) -- drawn: an orange jar.
//   boss       not a thing from the show but a capsule that summons one -- drawn.
const PICKS = {
  heal:   { file: ['4b heart.png', 'Heart.png'], note: 'a heart (the BFDI 4 asset)' },
  throw:  { file: 'Crate (BFDI 9).png', note: 'a wooden crate (BFDI 9)' },
  power:  { file: ['Win Token.png', 'Win token asset.png'], note: 'a Win Token' },
  assist: { file: ['Trophy.png', 'Trophy Award.png'], note: 'a gold trophy (faceless)' },
  yoyle:  { file: ['2b yoyleberry.png', 'Yoyleberry.png'], note: 'a Yoyleberry (faceless)' },
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
// `?format=original` is load-bearing (see fetch-sprites.mjs): Wikia content-negotiates to WebP even when the URL
// ends in .png. scale-to-height-down has the server shrink giant renders before they travel.
async function download(url, h) {
  const r = await fetch(`${url.split('/revision/')[0]}/revision/latest/scale-to-height-down/${h}?format=original`, { headers: UA });
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
// box-filter downscale of the alpha box to height H (aspect kept, long side capped at MAX_SIDE); premultiplied
// average, the same filter as fetch-attack-sprites.mjs
function shrink(png, box, H) {
  const sw = box.x1 - box.x0 + 1, sh = box.y1 - box.y0 + 1;
  const scale = Math.min(1, H / sh, MAX_SIDE / sw), W = Math.max(1, Math.round(sw * scale)), HH = Math.max(1, Math.round(sh * scale));
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
  }
  return out;
}

const outDir = process.argv[2] || 'artifacts/V1/assets/sprites/items';
mkdirSync(outDir, { recursive: true });
const only = new Set(process.argv.slice(3));
// a partial run (named kinds) keeps the rest of the record
const manifest = only.size && existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
const credits = [];
for (const [kind, pick] of Object.entries(PICKS)) {
  if (only.size && !only.has(kind)) continue;
  const line = (msg) => console.log(`${kind.padEnd(7)} ${msg}`);
  let done = false;
  for (const cand of Array.isArray(pick.file) ? pick.file : [pick.file]) { if (done) break; try {
    const info = await fileUrl(cand);
    if (!info) { line(`skip: no such file "${cand}"`); continue; }
    if (info.mime !== 'image/png') { line(`REJECT ${cand}: ${info.mime}, not a PNG`); continue; }
    const png = PNG.sync.read(await download(info.url, 400));
    const box = alphaBox(png);
    if (box.x1 < 0) { line(`skip ${cand}: fully transparent`); continue; }
    if (box.clearFrac < 0.12) { line(`skip ${cand}: not transparent (${(100 * box.clearFrac).toFixed(0)}% clear)`); continue; }
    const cw = box.x1 - box.x0 + 1, ch = box.y1 - box.y0 + 1;
    if (Math.max(cw, ch) < 24) { line(`skip ${cand}: ${cw}x${ch} after cropping`); continue; }
    const small = shrink(png, box, TARGET_H);
    const file = `${kind}.png`;
    writeFileSync(`${outDir}/${file}`, PNG.sync.write(small));
    manifest[kind] = { kind, file, source: info.url, srcTitle: cand, width: small.width, height: small.height,
      clearFrac: +box.clearFrac.toFixed(3), note: pick.note };
    credits.push(`- ${kind} (${file}): ${pick.note} — File:${cand} — ${info.url}`);
    line(`ok ${cand}: ${info.w}x${info.h} -> ${small.width}x${small.height} (${(100 * box.clearFrac).toFixed(0)}% clear)`); done = true;
  } catch (e) { line(`${cand} FAILED: ${e.message}`); } }
  if (!done) line('REJECT: no candidate passed');
}
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\n${credits.length} item sprites written to ${outDir}\n\n${credits.join('\n')}`);

// ---- looked at and turned down (so nobody re-fetches them) -----------------------------------------
// throw: Crate.png, 15ib crate.png, 15cb crate.png (flat crate faces, 0% clear: the crate fills its canvas) and
//   BFB Crate.png (the same face with a smile drawn on: a character, 2% clear). Crate (BFDI 9).png is the crate
//   in the round, clear all round it.
// heal: Rc HEart.png (pink, with a face); Bandage.png and BFDIA 24 bandaid.png (characters, faces and legs);
//   Bfdia 24body unnamed bandaid.png (faceless but a pale beige strip that does not read at pickup size).
// power: Win Token 2018.png / Win token front.png pass too, but Win Token.png is the classic token, at the size
//   the others were drawn from.
// assist: Trophy (BFB).png (Trophy the character, face and legs); Cake Trophy.png (Cake on a plinth, a face).
// yoyle: BFB Yoyleberry.png and BFDIA 19 yoyleberry.png (Yoyleberry the character, face and limbs).
// marmalade: nothing to turn down -- no file exists (see PICKS).
