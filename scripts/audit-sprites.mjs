// ============================================================================
//  audit-sprites.mjs — re-measure every shipped render against the registry
// ============================================================================
//   node scripts/audit-sprites.mjs
//
// Measures each PNG in assets/sprites/ the same way fetch-sprites.mjs does and compares the result
// with what the SPRITES registry claims, so a hand-edited `flip`, a re-exported file, or a render
// swapped in by hand can never silently disagree with the artwork on disk.
//
// The batch-1 twelve were audited by hand before this tool existed; running them through the same
// measurement is how their flags get held to the same standard as everything fetched since.

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

// `--clean` erases sub-visible alpha in place. The batch-1 twelve predate the fetch pipeline's
// clean step and still carried ~10,000 of these between them: invisible in play, but they leave a
// faint fringe when the sprite is tinted (flash/burn/yoyle draw a coloured copy over it) and they
// skew every centroid this tool measures.
const CLEAN = process.argv.includes('--clean');

const DIR = 'artifacts/V1/assets/sprites';
const MONOLITH = 'artifacts/V1/index.html';
const ALPHA_FLOOR = 24;

export function measure(png) {
  const { width: w, height: h, data } = png;
  const lums = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < ALPHA_FLOOR) continue;
    lums.push(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
  }
  lums.sort((a, b) => a - b);
  const median = lums.length ? lums[Math.floor(lums.length / 2)] : 0;
  // TWO different thresholds, because the two questions are different.
  //
  // "Does this render have a face at all?" needs the RELATIVE threshold — David is grey strokes on
  // a white fill and an absolute dark cut finds nothing.
  //
  // "Which way is it facing?" needs the STRICT one. Measured on Blocky, the relative threshold
  // swept in the dark shaded side of his 3D box and reported him right-facing when his face is
  // plainly on the left. Facing has to be read from true black line-work only.
  const inkMax = Math.max(90, median - 60);       // permissive: presence of a face
  const faceMax = 80;                             // strict: direction of a face
  const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && data[(y * w + x) * 4 + 3] >= ALPHA_FLOOR;

  let bodySumX = 0, bodyN = 0, inkSumX = 0, inkN = 0, faceSumX = 0, faceN = 0;
  let minX = w, maxX = -1, stray = 0, opaque = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4, a = data[i + 3];
      if (a < ALPHA_FLOOR) { if (a > 0) stray++; continue; }
      opaque++; bodySumX += x; bodyN++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      if (lum > inkMax) continue;
      let interior = true;
      for (let dy = -3; dy <= 3 && interior; dy++) {
        for (let dx = -3; dx <= 3; dx++) if (!solid(x + dx, y + dy)) { interior = false; break; }
      }
      if (!interior) continue;
      inkSumX += x; inkN++;
      if (lum <= faceMax) { faceSumX += x; faceN++; }
    }
  }
  const bodyW = Math.max(1, maxX - minX);
  const facing = faceN ? ((faceSumX / faceN) - (bodySumX / bodyN)) / bodyW : 0;
  // A DARK character (Bomby) is almost entirely "ink", so the ink centroid is just the body
  // centroid nudged by a highlight and the facing number means nothing. Say so rather than
  // reporting a confident value that is really an artifact of the shading.
  const faceShare = faceN / Math.max(1, opaque);
  return {
    w, h, opaque, stray, inkPixels: inkN, facePixels: faceN, facing,
    coverage: opaque / (w * h),
    confident: faceN >= 40 && faceShare < 0.35,
  };
}

const html = readFileSync(MONOLITH, 'utf8');

// Pull each entry's declared src + flip straight out of the registry text, so this audits what the
// game will actually load rather than what a manifest remembers.
function declared() {
  const out = {};
  // Two forms exist: the batch-1 entries spell out `src: "assets/sprites/x.png"` inline, while the
  // generated ones call `renderSprite("x.png", { ... })` and build the path at runtime.
  const inline = /src:\s*"assets\/sprites\/([^"]+)"([\s\S]{0,220}?)(?:\n\s*\},|\n\s*\)|\},)/g;
  let m;
  while ((m = inline.exec(html))) out[m[1]] = { flip: /flip:\s*true/.test(m[2]) };

  const generated = /renderSprite\(\s*"([^"]+)"\s*(?:,\s*\{([^}]*)\})?\s*\)/g;
  while ((m = generated.exec(html))) out[m[1]] = { flip: /flip:\s*true/.test(m[2] || '') };
  return out;
}

// Renders where the measurement disagrees with the artwork and the ARTWORK was judged correct by
// looking at it. Each one is a decision on the record, not a silenced warning.
const ADJUDICATED = {
  'bubble.png': 'transparent soap film: the dark "ink" is the rim and one white specular, not a face — she is front-on',
  'fries.png': 'the carton\'s own outlines sit left of centre and drag the ink centroid; the face itself is dead centre',
};

const decl = declared();
const files = readdirSync(DIR).filter(f => f.endsWith('.png')).sort();
const problems = [];

console.log('file                     size      facing   ink    flip  verdict');
for (const file of files) {
  const png = PNG.sync.read(readFileSync(`${DIR}/${file}`));
  if (CLEAN) {
    let n = 0;
    for (let i = 0; i < png.data.length; i += 4) {
      const al = png.data[i + 3];
      if (al > 0 && al < ALPHA_FLOOR) { png.data[i + 3] = 0; n++; }
    }
    if (n) { writeFileSync(`${DIR}/${file}`, PNG.sync.write(png)); console.log(`  cleaned ${n} halo pixels from ${file}`); }
  }
  const a = measure(png);
  const d = decl[file];
  if (!d) { problems.push(`${file}: on disk but no registry entry points at it`); continue; }
  const should = a.facing < -0.02;
  const agree = should === !!d.flip;
  // A render whose face sits within ±0.02 of centre is front-facing; either flag looks the same,
  // so it is not a disagreement worth reporting. Nor is a character the measurement cannot read.
  const ambiguous = Math.abs(a.facing) <= 0.02 || !a.confident || !!ADJUDICATED[file];
  const verdict = agree ? 'ok'
    : ADJUDICATED[file] ? `ok (adjudicated: ${ADJUDICATED[file]})`
    : !a.confident ? 'ok (too dark/plain to read facing — flag left as authored)'
    : Math.abs(a.facing) <= 0.02 ? 'ok (front-facing, flag is cosmetic)'
    : `MISMATCH — measured ${should ? 'left' : 'right'}-facing`;
  if (!agree && !ambiguous) problems.push(`${file}: registry flip=${!!d.flip} but facing measured ${a.facing.toFixed(3)}`);
  if (a.stray > 0) problems.push(`${file}: ${a.stray} invisible halo pixels left on disk`);
  console.log(
    `${file.padEnd(24)} ${String(a.w).padStart(3)}x${a.h}  ${a.facing.toFixed(3).padStart(7)}  ${String(a.inkPixels).padStart(5)}  ${(d.flip ? 'yes' : 'no ').padEnd(5)} ${verdict}`
  );
}

console.log(`\n${files.length} renders audited`);
if (problems.length) {
  console.log(`${problems.length} problem(s):`);
  for (const p of problems) console.log('  ' + p);
  process.exitCode = 1;
} else {
  console.log('no disagreements between the artwork on disk and the registry');
}
