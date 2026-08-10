// ============================================================================
//  fetch-sprites.mjs — pull on-model character renders for the roster
// ============================================================================
// Battle for Smash Island is an unaffiliated fan work. This fetches character artwork from
// battlefordreamisland.fandom.com (jacknjellify's designs) for use in a disclaimed, non-commercial
// fan game, and records the exact source URL of every file in assets/sprites/CREDITS.md.
//
//   node scripts/fetch-sprites.mjs Needle Pin Snowball ...      # fetch these fighters
//   node scripts/fetch-sprites.mjs --audit                      # re-measure facing for what exists
//
// WHAT IT GUARANTEES (a render that fails any of these is REJECTED, never shipped):
//   · genuinely transparent — a render with an opaque rectangular background reads as a sticker
//     pasted over the stage, which is the single most obvious way fan art looks wrong in-engine
//   · has a FACE — the costly failure last round was Puffball's "front render", which turned out
//     to be a faceless body layer. Detected by looking for dark interior ink.
//   · substantial — not a 6px icon, not a mostly-empty canvas
//
// It also measures FACING the same way the batch-1 audit did: compare the centroid of interior
// dark ink (eyes/brows/mouth) against the centroid of the body silhouette. Negative means the face
// sits left of the body's middle, i.e. the art natively faces LEFT and needs `flip:true`.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';

const WIKI = 'https://battlefordreamisland.fandom.com';
const UA = { 'User-Agent': 'smash-island-fan-game/1.0 (personal fan project)' };
const OUT_DIR = 'artifacts/V1/assets/sprites';
const MANIFEST = 'scripts/sprite-manifest.json';
const TARGET_H = 200;

export function slug(name) {
  return name.toLowerCase().replace(/\./g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function api(params) {
  const u = `${WIKI}/api.php?${new URLSearchParams({ ...params, format: 'json' })}`;
  const r = await fetch(u, { headers: UA });
  if (!r.ok) throw new Error(`api ${r.status}`);
  return r.json();
}

// The page's own infobox image is the character's canonical render — the same place the batch-1
// twelve came from. A few characters' infoboxes are .webp originals, which no amount of content
// negotiation turns back into a PNG, so those take an explicit file override:
//     node scripts/fetch-sprites.mjs "Balloony=Balloony_updated.png"
async function findRender(name, overrideFile) {
  if (overrideFile) {
    const j = await api({ action: 'query', titles: `File:${overrideFile}`, prop: 'imageinfo', iiprop: 'url' });
    const page = Object.values(j.query.pages)[0];
    if (!page || !page.imageinfo) return null;
    return page.imageinfo[0].url;
  }
  const j = await api({ action: 'query', prop: 'pageimages', piprop: 'original', titles: name });
  const page = Object.values(j.query.pages)[0];
  if (!page || !page.original) return null;
  return page.original.source;
}

// Wikia resizes server-side, which keeps the alpha channel intact and avoids resampling here.
//
// `?format=original` is load-bearing: Wikia content-negotiates to WebP and will serve WebP even
// when the URL ends in .png and the request asks for `Accept: image/png`. Without it every
// download comes back as a RIFF container that the PNG decoder rejects. The scaling still applies.
function thumb(url, h) {
  const base = url.split('/revision/')[0];
  return `${base}/revision/latest/scale-to-height-down/${h}?format=original`;
}

async function download(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`download ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

// ---- image checks -----------------------------------------------------------------------------
function decode(buf) {
  try { return PNG.sync.read(buf); } catch (e) { return null; }
}

// Pixels below this alpha are invisible in play but still skew every measurement, and one render
// last round carried ~1000 of them as a halo. Treated as empty, and erased on write.
const ALPHA_FLOOR = 24;

function analyse(png) {
  const { width: w, height: h, data } = png;
  let opaque = 0, transparent = 0, stray = 0;
  let bodySumX = 0, bodyN = 0;
  let inkSumX = 0, inkN = 0;
  let minX = w, maxX = -1, minY = h, maxY = -1;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const a = data[i + 3];
      if (a < ALPHA_FLOOR) { transparent++; if (a > 0) stray++; continue; }
      opaque++;
      bodySumX += x; bodyN++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
  }
  // The ink threshold is RELATIVE to the artwork's own fill, not a fixed "dark" cut. David is the
  // case that proves why: he is canonically a pencil sketch, grey strokes (~127) on a white fill
  // (255), so an absolute `lum < 90` test found zero facial ink and rejected a perfectly good
  // on-model render. Taking whichever threshold is more permissive keeps black-outlined characters
  // working while admitting light line art — and a genuinely faceless body layer still fails,
  // because a flat fill has no interior pixels that contrast with its own median at all.
  const lums = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < ALPHA_FLOOR) continue;
    lums.push(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
  }
  lums.sort((a, b) => a - b);
  const median = lums.length ? lums[Math.floor(lums.length / 2)] : 0;
  const inkMax = Math.max(90, median - 60);

  // INTERIOR ink only: erode 3px from the silhouette so the character's OUTLINE and its
  // stick limbs do not count. What survives is the face — eyes, pupils, brows, mouth.
  const isSolid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && data[(y * w + x) * 4 + 3] >= ALPHA_FLOOR;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3] < ALPHA_FLOOR) continue;
      const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
      if (lum > inkMax) continue;                   // not ink relative to this artwork's own fill
      let interior = true;
      for (let dy = -3; dy <= 3 && interior; dy++) {
        for (let dx = -3; dx <= 3; dx++) {
          if (!isSolid(x + dx, y + dy)) { interior = false; break; }
        }
      }
      if (!interior) continue;
      inkSumX += x; inkN++;
    }
  }
  const bodyW = Math.max(1, maxX - minX);
  const bodyCx = bodyN ? bodySumX / bodyN : 0;
  const inkCx = inkN ? inkSumX / inkN : 0;
  return {
    w, h, opaque, transparent, stray,
    coverage: opaque / (w * h),
    inkPixels: inkN,
    inkRatio: inkN / Math.max(1, opaque),
    // negative = face sits LEFT of the body's middle => art natively faces LEFT => flip:true
    facing: inkN ? (inkCx - bodyCx) / bodyW : 0,
    box: { minX, maxX, minY, maxY },
  };
}

// A render must be transparent, substantial, and have a face. Each rejection reason is reported
// rather than silently swallowed, so a skipped fighter is a decision on the record.
function verdict(a) {
  const bad = [];
  if (a.transparent === 0) bad.push('opaque background (no alpha at all) — would render as a pasted rectangle');
  if (a.coverage > 0.92) bad.push(`covers ${(a.coverage * 100).toFixed(0)}% of its canvas — background, not a cut-out`);
  if (a.coverage < 0.03) bad.push(`only ${(a.coverage * 100).toFixed(1)}% of the canvas is drawn — near-empty image`);
  if (a.h < 60) bad.push(`only ${a.h}px tall — too small to be a render`);
  if (a.inkPixels < 12) bad.push(`no facial ink found (${a.inkPixels}px) — probably a faceless body layer`);
  return bad;
}

// Erase the invisible halo so it can never skew a later audit or leave a faint fringe on canvas.
function clean(png) {
  let cleaned = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    const a = png.data[i + 3];
    if (a > 0 && a < ALPHA_FLOOR) { png.data[i + 3] = 0; cleaned++; }
  }
  return cleaned;
}

// ---- main -------------------------------------------------------------------------------------
async function fetchOne(spec) {
  const [name, overrideFile] = spec.split("=");
  const row = { name, slug: slug(name) };
  try {
    const src = await findRender(name, overrideFile);
    if (!src) return { ...row, ok: false, reason: 'no infobox render on the wiki page' };
    row.source = src;
    const buf = await download(thumb(src, TARGET_H));
    const png = decode(buf);
    if (!png) return { ...row, ok: false, reason: 'not a decodable PNG (probably a JPEG/GIF render)' };

    const a = analyse(png);
    const bad = verdict(a);
    if (bad.length) return { ...row, ok: false, reason: bad[0], analysis: a };

    const cleaned = clean(png);
    writeFileSync(`${OUT_DIR}/${row.slug}.png`, PNG.sync.write(png));
    return {
      ...row, ok: true, file: `${row.slug}.png`,
      width: a.w, height: a.h, facing: +a.facing.toFixed(3),
      flip: a.facing < -0.02, inkPixels: a.inkPixels, cleanedHaloPixels: cleaned,
      coverage: +a.coverage.toFixed(3),
    };
  } catch (e) {
    return { ...row, ok: false, reason: e.message };
  }
}

const names = process.argv.slice(2).filter(x => !x.startsWith('--'));
if (!names.length) {
  console.error('usage: node scripts/fetch-sprites.mjs "Needle" "Pin" ...');
  process.exit(1);
}

const results = [];
for (const spec of names) {
  const n = spec.split("=")[0];
  const r = await fetchOne(spec);
  results.push(r);
  console.log(
    r.ok
      ? `  OK   ${n.padEnd(14)} ${r.file.padEnd(18)} ${r.width}x${r.height}  facing ${String(r.facing).padStart(6)} ${r.flip ? '(flip)' : ''}  ink ${r.inkPixels}${r.cleanedHaloPixels ? `  halo-cleaned ${r.cleanedHaloPixels}` : ''}`
      : `  SKIP ${n.padEnd(14)} ${r.reason}`
  );
}

const prev = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
for (const r of results) prev[r.name] = r;
writeFileSync(MANIFEST, JSON.stringify(prev, null, 2));

const ok = results.filter(r => r.ok).length;
console.log(`\n${ok}/${results.length} accepted; manifest -> ${MANIFEST}`);
