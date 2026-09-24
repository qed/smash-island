// ============================================================================
//  fetch-attack-sprites.mjs — pull the show's own art for what the fighters THROW
// ============================================================================
// Same footing as fetch-sprites.mjs: Battle for Smash Island is an unaffiliated, non-commercial fan
// work; this fetches artwork from battlefordreamisland.fandom.com (jacknjellify's designs) and, for the
// Inanimate Insanity DLC, inanimateinsanity.fandom.com (AnimationEpic's designs), and records the exact
// source URL of every file for CREDITS.md. A file that fails a guarantee is REJECTED:
//   · a real PNG (gif/jpg/webp are skipped -- no transparency, or none we can trust)
//   · genuinely transparent: at least 12% of the canvas is clear once any colour key the pick names
//     has run (a plain screenshot, with no key, is ~0% clear and fails)
//   · substantial after cropping to its alpha box: at least 24px on its long side
// THE OWNER'S RULE for this art: the file is the THROWN OBJECT ITSELF from the show -- not a render of
// a character flying across the screen, and not an episode screenshot. Every output is looked at before
// it ships; the ones that failed on sight are listed at the bottom of this file.
// Output: <out>/<name>.png at TARGET_H tall (aspect kept, never more than MAX_SIDE on its long side),
// <out>/manifest.json, <out>/credits.txt.
//
//   node fetch-attack-sprites.mjs <outDir> [name ...]
import { mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const WIKIS = {
  bfdi: 'https://battlefordreamisland.fandom.com',
  ii:   'https://inanimateinsanity.fandom.com',
};
const UA = { 'User-Agent': 'smash-island-fan-game/1.0 (personal fan project)' };
const TARGET_H = 56;
const MAX_SIDE = 128;   // test/attack-sprites.test.js: projectile-sized

// name -> the wiki file that is the show's version of what this fighter throws. The name is the output
// file (<name>.png); `kits` are the kits (kit.special) it is for -- for the first seven, the PROJ_SHAPE
// key it replaced. Optional, per pick:
//   wiki    'bfdi' (default) or 'ii'
//   crop    a stream asset: keep only its first N rows (its head)
//   region  [x0, y0, x1, y1] in the ORIGINAL file's pixels: cut this out before anything else
//   key     'white' -- flood the border's near-white away (a prop sheet on white paper)
//           'green' -- chroma-key a flat green backdrop away
//           'glow'  -- a glowing bolt on a flat sky: brightness above the sky becomes alpha
//           'orb'   -- keep only the near-white orb, and close the bites a hand left in it
//   srcH    download height (default 400; larger where a key needs the detail)
//   h       output height (default TARGET_H)
//   solid   the object is itself a rectangle that fills its own canvas edge to edge (a sign, a battery
//           cell), so it cannot be 12% clear; looked at and confirmed to be the object, not a frame
const PICKS = {
  // --- the seven that shipped first
  shatter:  { who: 'Ice Cube',   kits: ['shatter'],  file: "Ice Cube's Shatter.png",    note: 'her shatter' },
  slice:    { who: 'Cake',       kits: ['atstake'],  file: 'Cake slice.png',            note: 'a slice of cake' },
  van:      { who: 'Pencil',     kits: ['van'],      file: 'SuperVAN!2340001.png',      note: 'the Supervan' },
  bubble:   { who: 'Bubble',     kits: ['float'],    file: "Bubble's asset.png",        note: 'a bubble' },
  cap:      { who: 'Pen',        kits: ['cap'],      file: 'Pen Cap.png',               note: 'his cap' },
  tag:      { who: 'Price Tag',  kits: ['pricetag'], file: 'Price Tag S2 Asset.png',    note: 'a price tag' },
  measure:  { who: 'Ruler',      kits: ['measure'],  file: ["Ruler's Asset.png", 'Bfdia 12 ruler asset.png', 'Ruler Asset BFDIE.png', 'Ruler Asset.png'], note: 'the ruler itself' },

  // --- BFDI: the owner's picks, kit by kit (the first file that passed an adversarial check, then the next)
  fireball:   { who: 'Firey / Firey Jr.', kits: ['ember', 'emberjr'], file: ['17body fireball.png', 'Firey Flame0001.png'], note: 'a fireball (the BFDI 17 Fireball body, faceless)' },
  landmine:   { who: 'Bomby',       kits: ['bomb'],       file: ['11body landmine.png', 'Coiny Bomb Transparent.png'], note: 'a landmine' },
  poof:       { who: 'Flower / Fanny', kits: ['quake', 'gust'], file: 'Poof.png',           note: 'a puff cloud' },
  tennisball: { who: 'Tennis Ball', kits: ['serve'],      file: ['16body pinktennisball.png', '17body bluetennisball.png'], note: 'a served tennis ball (faceless, pink)' },
  anvil:      { who: 'Blocky',      kits: ['anvil'],      file: '2b anvil.png',             note: 'an anvil' },
  zapbolt:    { who: 'Golf Ball',   kits: ['zapshooter'], file: ['Lightning 2.png', '15fb balllightning.png'], note: 'a zap bolt' },
  barf:       { who: 'Rocky',       kits: ['barf'],       file: ['Rocky barf (TPOT Intro).png', 'Barf long.png'], note: 'his barf stream (TPOT intro)' },
  fry:        { who: 'Fries',       kits: ['fry'],        file: ['Single Fry.png', 'Single Fry copy.png'], note: 'one fry' },
  syringe:    { who: 'Gelatin',     kits: ['freeze'],     file: 'Freeze Juice.png',         note: 'a Freeze Juice syringe' },
  coins:      { who: 'Nickel',      kits: ['flip'],       file: ['Coins.png', 'YellowToken.png'], note: 'coins' },
  gem:        { who: 'Ruby',        kits: ['beam'],       file: ['RedGemBFDIE.png', 'RubyShatteredBit3.png'], note: 'a red gem' },
  star:       { who: 'Yellow Face', kits: ['buynow'],     file: 'Star (BFB 21).png',        note: 'a star (a BFB 21 gift item)' },
  vomit:      { who: 'Barf Bag',    kits: ['splash'],     file: ['Leafy-ShapedVomit.png', 'Barf rainbow long.png'], note: 'a splat of vomit' },
  basketball: { who: 'Basketball',  kits: ['dribble'],    file: ['Basketball prop (bfb 28)0001.png', 'CloudysBasketball.png'], note: 'a basketball prop' },
  sign:       { who: 'Bracelety',   kits: ['sign'],       file: ['Bracelety Sign Blank.png', 'ICY Sign (Bracelety) (BFB 1).png'], note: 'her sign', solid: true },
  bush:       { who: 'Grassy',      kits: ['grasstree'],  file: ['Bush.png', 'Grass TuftBFB17.png'], note: 'a bush' },
  candy:      { who: 'Lollipop',    kits: ['sucker'],     file: ['Lollipop Piece 5.png', 'Lollipop puddle asset.png'], note: 'a piece of her candy' },
  inkball:    { who: 'Marker',      kits: ['ink'],        file: '16bb inkball.png',         note: 'a ball of ink' },
  coin:       { who: 'Money',       kits: ['payday'],     file: ['28b linecoin.png', 'Coins.png', 'BFDIE Handful Of Coins.png'], note: 'one gold coin' },
  nail:       { who: 'Naily',       kits: ['spike'],      file: ['BFDI 11 Nail.png', 'Spike (BFDI 10).png'], note: 'a nail (BFDI 11)' },
  battery:    { who: 'Remote',      kits: ['battery'],    file: ['Batteryremote.png', 'A single Battery.png'], note: "Remote's battery", solid: true },
  sawblade:   { who: 'Saw',         kits: ['saw'],        file: ['Sawblade.png', 'Spinning Buzzsaw.png'], note: 'a saw blade' },
  jawbreaker: { who: 'Taco',        kits: ['jawbreaker'],    file: ['Jawbreaker better quality.png', 'Jawbreaker.png'], note: 'the jawbreaker' },
  woodchip:   { who: 'Woody',       kits: ['fraidy'],     file: ['8B3728F4-AFD6-4BD3-A90D-AD47726D9235.png', 'Wood chip.png'], note: 'a chip of Woody' },
  toothpaste: { who: 'Toothpaste',  kits: ['paste'],      file: 'Toothpaste Splat.png',     note: 'a splat of toothpaste' },
  flame:      { who: 'Match',       kits: ['spark'],      file: '2b fire0001.png',          note: 'a flame' },
  branch:     { who: 'Tree',        kits: ['timber'],     file: ['21body twigy.png', '14body branchy.png'], note: 'a leafy branch' },
  sprinkles:  { who: 'Donut',       kits: ['glaze'],      file: 'Bfdia 17body sprinkles.png', note: 'sprinkles' },
  rainbow:    { who: 'Puffball',    kits: ['fly'],        file: 'Barf rainbow long.png',    note: 'the rainbow barf (BFDIA)' },
  beep:       { who: 'Roboty',      kits: ['antenna'],    file: 'BEEP!.png',                note: 'BEEP lettering' },
  // Lightning: "use the art from tpot 7". No isolated file of it exists on the wiki, so the strike that
  // hits the Volcano in "The Seven Wonders of Goiky" is lifted off its plain sky: brightness over the sky
  // becomes alpha, the sky becomes nothing. What ships is the bolt alone.
  tpot7bolt:  { who: 'Lightning',   kits: ['zap'],        file: 'Tpot7dpacas lightningrampage (25).png', note: 'his TPOT 7 strike, lifted off the sky', key: 'glow', region: [420, 0, 1250, 578], srcH: 1080, h: 88 },

  // --- Inanimate Insanity
  lemon:      { who: 'Taco (II)',   kits: ['lemon'],      wiki: 'ii', file: ['Lemon.png', 'OLDLemon.png'], note: 'a lemon' },
  chair:      { who: 'Bow',         kits: ['chair'],      wiki: 'ii', file: ['Chair Remaster.png', 'Chair.png'], note: 'a chair (S1 remaster design)' },
  book:       { who: 'Baseball',    kits: ['heavy'],      wiki: 'ii', file: 'Twilight Book II Remastered.png', note: 'his Twilight book (the remastered cover, off its white sheet)', key: 'white', region: [415, 15, 920, 465], srcH: 543 },
  pencil:     { who: 'Apple',       kits: ['split'],      wiki: 'ii', file: 'Pencil Prize.png',     note: 'a pencil (Minor Items/Prizes)' },
  fist:       { who: 'Knife',       kits: ['tricks'],     wiki: 'ii', file: 'Fist Thingy II.png',   note: 'the Fist Thingy (the hook in his Bag of Tricks)' },
  taser:      { who: 'Knife',       kits: ['tricks'],     wiki: 'ii', file: 'Temp Paralyzer.png',   note: 'the Temporary Paralyzer (the smoke in his Bag of Tricks)' },
  shimmerorb: { who: 'Lightbulb',   kits: ['eball'],      wiki: 'ii', file: 'Box with Shimmer Orb (S2E18).png', note: "the Shimmer Orb, cut out of Box's hands", key: 'orb', region: [688, 478, 1016, 798], srcH: 968 },
  paintbomb:  { who: 'Paintbrush',  kits: ['fury'],       wiki: 'ii', file: 'Paint Bombs.png',      note: "MePhone4's paint bomb, off its green backdrop", key: 'green', srcH: 161 },
};

async function api(wiki, params) {
  const r = await fetch(`${WIKIS[wiki]}/api.php?${new URLSearchParams({ ...params, format: 'json' })}`, { headers: UA });
  if (!r.ok) throw new Error(`api ${r.status}`);
  return r.json();
}
async function fileUrl(wiki, title) {
  const j = await api(wiki, { action: 'query', titles: `File:${title}`, prop: 'imageinfo', iiprop: 'url|size|mime' });
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
async function download(url, h) {
  const r = await fetch(originalUrl(url, h), { headers: UA });
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
// box-filter downscale of a cropped region to height H (aspect kept, long side capped at MAX_SIDE);
// pngjs RGBA, premultiplied average
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
    else { out.data[o] = out.data[o + 1] = out.data[o + 2] = 0; out.data[o + 3] = 0; }
  }
  return out;
}

// ---- cutting an object out of a sheet or a frame -------------------------------------------------
function cut(png, [x0, y0, x1, y1]) {
  const w = x1 - x0, h = y1 - y0, out = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) png.data.copy(out.data, y * w * 4, ((y0 + y) * png.width + x0) * 4, ((y0 + y) * png.width + x1) * 4);
  return out;
}
const minC = (d, i) => Math.min(d[i], d[i + 1], d[i + 2]);
const lum = (d, i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
// 'white': flood from every border pixel through near-white; what the flood reaches is the paper. The
// ring of pixels it touched is the anti-aliased outline, blended with white: un-blend it so no pale
// halo is left behind. Near-white INSIDE the object (pages, highlights) is not reachable and stays.
function keyWhite(png) {
  const { width: w, height: h, data: d } = png, bg = new Uint8Array(w * h), stack = [];
  const push = (x, y) => { const k = y * w + x; if (!bg[k] && minC(d, k * 4) >= 232) { bg[k] = 1; stack.push(k); } };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) { const k = stack.pop(), x = k % w, y = (k - x) / w;
    if (x > 0) push(x - 1, y); if (x < w - 1) push(x + 1, y); if (y > 0) push(x, y - 1); if (y < h - 1) push(x, y + 1); }
  for (let k = 0; k < w * h; k++) {
    const i = k * 4;
    if (bg[k]) { d[i + 3] = 0; continue; }
    const x = k % w, y = (k - x) / w;
    const edge = (x > 0 && bg[k - 1]) || (x < w - 1 && bg[k + 1]) || (y > 0 && bg[k - w]) || (y < h - 1 && bg[k + w]);
    if (!edge) continue;
    const a = Math.min(1, Math.max(0.15, (255 - minC(d, i)) / 160));
    for (let c = 0; c < 3; c++) d[i + c] = Math.max(0, Math.min(255, Math.round((d[i + c] - (1 - a) * 255) / a)));
    d[i + 3] = Math.round(255 * a);
  }
}
// 'green': a flat green backdrop. Green-dominant pixels go; the margin by which green dominates sets a
// soft edge, and the survivors are despilled so no green fringe rides along.
function keyGreen(png) {
  const d = png.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2], m = g - Math.max(r, b);
    if (m >= 28) { d[i + 3] = 0; continue; }
    if (m > 8) d[i + 3] = Math.round(d[i + 3] * (28 - m) / 20);
    if (m > 0) d[i + 1] = Math.max(r, b);
  }
}
// 'glow': a white-hot bolt with a cyan glow on a flat sky. The sky is the median of the border; how far a
// pixel rises above it in brightness is its alpha, and its colour is what it was before the sky showed
// through. Faint shapes in the sky (under `floor`) fall away, and so does anything warm (red over blue):
// the bolt is white and cyan, so the golden flare where it hits, and the ground it hits, are not it.
function keyGlow(png, floor = 36) {
  const { width: w, height: h, data: d } = png, border = [];
  for (let x = 0; x < w; x++) border.push((0 * w + x) * 4, ((h - 1) * w + x) * 4);
  for (let y = 0; y < h; y++) border.push((y * w) * 4, (y * w + w - 1) * 4);
  const med = (c) => { const v = border.map(i => d[i + c]).sort((a, b) => a - b); return v[v.length >> 1]; };
  const sky = [med(0), med(1), med(2)], skyL = 0.299 * sky[0] + 0.587 * sky[1] + 0.114 * sky[2];
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i] > d[i + 2] + 6 ? 0 : Math.max(0, Math.min(1, (lum(d, i) - skyL - floor) / (255 - skyL - floor)));
    if (a <= 0) { d[i + 3] = 0; continue; }
    for (let c = 0; c < 3; c++) d[i + c] = Math.max(0, Math.min(255, Math.round((d[i + c] - (1 - a) * sky[c]) / a)));
    d[i + 3] = Math.round(255 * a);
  }
}
// 'orb': the Shimmer Orb is flat near-white, held in Box's two black hands against his brown side. Keep
// the near-white only; the hands leave two bites in its lower edge, so close them with the orb's own
// white out to its convex hull -- one flat white, as the show draws it, so no outline of a finger is
// left behind. Nothing of Box survives: his brown and his hands are not near-white.
function keyOrb(png) {
  const { width: w, height: h, data: d } = png, pts = [];
  let sr = 0, sg = 0, sb = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (d[i + 3] > 200 && minC(d, i) >= 205) { pts.push([x, y]); sr += d[i]; sg += d[i + 1]; sb += d[i + 2]; }
  }
  const n = pts.length, fill = [sr / n, sg / n, sb / n];
  // monotone-chain convex hull
  pts.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const p of pts) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop(); lower.push(p); }
  for (let k = n - 1; k >= 0; k--) { const p = pts[k]; while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop(); upper.push(p); }
  const hull = lower.slice(0, -1).concat(upper.slice(0, -1));
  const inside = (x, y) => { for (let k = 0; k < hull.length; k++) if (cross(hull[k], hull[(k + 1) % hull.length], [x, y]) < 0) return false; return true; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (!inside(x, y)) { d[i + 3] = 0; continue; }
    d[i] = fill[0]; d[i + 1] = fill[1]; d[i + 2] = fill[2]; d[i + 3] = 255;
  }
}
const KEYS = { white: keyWhite, green: keyGreen, glow: keyGlow, orb: keyOrb };

const outDir = process.argv[2];
if (!outDir) { console.error('usage: node fetch-attack-sprites.mjs <outDir> [name ...]'); process.exit(1); }
mkdirSync(outDir, { recursive: true });
const only = new Set(process.argv.slice(3));
const manifest = {}, credits = [];
for (const [name, pick] of Object.entries(PICKS)) {
  if (only.size && !only.has(name)) continue;
  const wiki = pick.wiki || 'bfdi';
  const line = (msg) => console.log(`${name.padEnd(11)} ${pick.who.padEnd(18)} ${msg}`);
  const candidates = Array.isArray(pick.file) ? pick.file : [pick.file];
  let done = false;
  for (const cand of candidates) { if (done) break; try {
    const info = await fileUrl(wiki, cand);
    if (!info) { line(`skip: no such file "${cand}" on ${wiki}`); continue; }
    if (info.mime !== 'image/png') { line(`REJECT: ${info.mime}, not a PNG`); continue; }
    const buf = await download(info.url, pick.srcH || 400);
    let png = PNG.sync.read(buf);
    if (pick.region) {
      const s = png.width / info.w, [x0, y0, x1, y1] = pick.region;
      png = cut(png, [Math.round(x0 * s), Math.round(y0 * s), Math.round(x1 * s), Math.round(y1 * s)]);
    }
    if (pick.key) KEYS[pick.key](png);
    const box = alphaBox(png);
    if (box.x1 < 0) { line(`skip ${cand}: fully transparent`); continue; }
    if (box.clearFrac < 0.12 && !pick.solid) { line(`skip ${cand}: not transparent (${(100 * box.clearFrac).toFixed(0)}% clear)`); continue; }
    if (pick.crop) box.y1 = Math.min(box.y1, box.y0 + pick.crop - 1);   // a stream asset: keep its head
    const cw = box.x1 - box.x0 + 1, ch = box.y1 - box.y0 + 1;
    if (Math.max(cw, ch) < 24) { line(`skip ${cand}: ${cw}x${ch} after cropping`); continue; }
    const small = shrink(png, box, pick.h || TARGET_H);
    const file = `${name}.png`;
    writeFileSync(`${outDir}/${file}`, PNG.sync.write(small));
    manifest[name] = { who: pick.who, kits: pick.kits, file, wiki, source: info.url, srcTitle: cand, width: small.width, height: small.height,
      clearFrac: +box.clearFrac.toFixed(3), note: pick.note, ...(pick.key ? { key: pick.key } : {}), ...(pick.region ? { region: pick.region } : {}), ...(pick.solid ? { solid: true } : {}) };
    credits.push(`- ${pick.who} (${file}): ${pick.note} — File:${cand} — ${info.url}`);
    line(`ok ${cand}: ${info.w}x${info.h} -> ${small.width}x${small.height} (${(100 * box.clearFrac).toFixed(0)}% clear${pick.key ? `, ${pick.key}-keyed` : ''})`); done = true;
  } catch (e) { line(`${cand} FAILED: ${e.message}`); } }
  if (!done) line('REJECT: no candidate passed');
}
writeFileSync(`${outDir}/manifest.json`, JSON.stringify(manifest, null, 2));
writeFileSync(`${outDir}/credits.txt`, credits.join('\n') + '\n');
console.log(`\n${Object.keys(manifest).length} sprites written to ${outDir}`);

// ---- looked at and turned down (so nobody re-fetches them) -----------------------------------------
// Paper's piano ("the grand piano from the unremastered s1"): the only season-1 piano on the II wiki is
//   File:Ep2 Piano.png, and it is an episode screenshot (0% clear) with the piano landing on Paper
//   against the pole -- not an isolated object. S1RE2/S1RE10 Piano.png are remastered screenshots.
//   Cutting it out is not clean: its legs and keyboard lie across Paper and the pole. It stays drawn
//   until the owner picks another way.
// Lightning's TPOT 7 art: the episode's gallery and asset pages hold no isolated bolt; every file of the
//   strike is a frame (Tpot7dpacas lightningrampage 1-36). BFB Lightning Bolt.png and the other "bolt"
//   files are characters with faces, or fan art. Hence the keyed-out strike above.
// Where Babies Come From II Remastered.png (Baseball's other book): two episode screenshots side by side,
//   with Baseball's face behind the book. The Twilight book sheet is the clean one.
// Bot, Test Tube's summon, is a character render, so it is fetched the way every II render is:
//   node scripts/fetch-sprites.mjs --wiki=inanimateinsanity "Bot=Bot2024PoseAlt.png"
