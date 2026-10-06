// ============================================================================
//  measure-faces.mjs -- where a picture's eyes, brows and mouth are, as a row of FR_FACE
// ============================================================================
// THE FRAME LAYER (index.html) draws a face over the painted one -- a squint, "> <", an open mouth -- at anchors it is given for each PICTURE. This finds them
// for you to start from: the dark ink strictly inside the silhouette (eroded 3 px, so the outline and the stick limbs are gone) is split into blobs; the two
// that look most like a pair of eyes, the widest blob below them, and any thin blob above them (a brow) are boxed, and a row is printed for FR_FACE, with the
// colour of the fill round the eyes. It is a PROPOSAL: it cannot tell a brow from a scar or a mouth from a hand, and a face seen in profile has one eye. Look
// at the sheet (--sheet), correct the row by hand, and put it in FR_FACE under the picture's file name. Every row in the game was checked by eye on that
// sheet (the anchors are on painted ink, on the body).
//
//   node scripts/measure-faces.mjs artifacts/V1/assets/sprites/firey.png [more.png ...]
//   node scripts/measure-faces.mjs --sheet=faces.png artifacts/V1/assets/sprites/skins/mech-firey.png    (also writes the pictures at 4x with the blobs boxed)
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { PNG } from 'pngjs';

const argv = process.argv.slice(2);
const sheetArg = argv.find((a) => a.startsWith('--sheet='));
const files = argv.filter((a) => !a.startsWith('--'));
if (!files.length) { console.error('usage: node scripts/measure-faces.mjs [--sheet=out.png] <picture.png> ...'); process.exit(1); }
const ALPHA = 128;

function blobs(png) {
  const { width: w, height: h, data } = png;
  const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && data[(y * w + x) * 4 + 3] >= ALPHA;
  const lum = (x, y) => { const i = (y * w + x) * 4; return data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114; };
  const inner = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!solid(x, y)) continue;
    let ok = true;
    for (let dy = -3; dy <= 3 && ok; dy++) for (let dx = -3; dx <= 3; dx++) if (!solid(x + dx, y + dy)) { ok = false; break; }
    inner[y * w + x] = ok ? 1 : 0;
  }
  const ls = []; for (let i = 0; i < w * h; i++) if (inner[i]) ls.push(lum(i % w, (i / w) | 0));
  ls.sort((a, b) => a - b);
  const inkMax = Math.max(70, (ls[ls.length >> 1] || 128) - 70);
  const ink = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) if (inner[i] && lum(i % w, (i / w) | 0) <= inkMax) ink[i] = 1;
  const seen = new Uint8Array(w * h), out = [];
  for (let s = 0; s < w * h; s++) {
    if (!ink[s] || seen[s]) continue;
    const st = [s]; seen[s] = 1;
    let n = 0, sx = 0, sy = 0, x0 = w, x1 = 0, y0 = h, y1 = 0;
    while (st.length) {
      const c = st.pop(), cx = c % w, cy = (c / w) | 0; n++; sx += cx; sy += cy;
      if (cx < x0) x0 = cx; if (cx > x1) x1 = cx; if (cy < y0) y0 = cy; if (cy > y1) y1 = cy;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const k = ny * w + nx; if (ink[k] && !seen[k]) { seen[k] = 1; st.push(k); }
      }
    }
    if (n >= 6) out.push({ n, cx: sx / n, cy: sy / n, x0, x1, y0, y1, bw: x1 - x0 + 1, bh: y1 - y0 + 1 });
  }
  // the colour of the fill round a blob: the median of the solid, non-ink pixels in a ring
  const ring = (b, pad) => {
    const R = [], G = [], B = [];
    for (let y = b.y0 - pad; y <= b.y1 + pad; y++) for (let x = b.x0 - pad; x <= b.x1 + pad; x++) {
      if (x >= b.x0 - 1 && x <= b.x1 + 1 && y >= b.y0 - 1 && y <= b.y1 + 1) continue;
      if (!solid(x, y) || ink[y * w + x]) continue;
      const i = (y * w + x) * 4; R.push(data[i]); G.push(data[i + 1]); B.push(data[i + 2]);
    }
    const m = (a) => { a.sort((p, q) => p - q); return a[a.length >> 1] | 0; };
    return R.length ? '#' + [m(R), m(G), m(B)].map((v) => v.toString(16).padStart(2, '0')).join('') : null;
  };
  return { w, h, out, ring };
}

function propose(png) {
  const { w, h, out, ring } = blobs(png);
  const small = out.filter((b) => b.n <= w * h * 0.04 && b.bh >= h * 0.03 && b.bh <= h * 0.24 && b.cy < h * 0.8);
  let best = null;
  for (let i = 0; i < small.length; i++) for (let j = i + 1; j < small.length; j++) {
    const a = small[i], b = small[j], L = a.cx < b.cx ? a : b, Rr = a.cx < b.cx ? b : a;
    const dx = Rr.cx - L.cx, dy = Math.abs(Rr.cy - L.cy), ratio = Math.max(L.n, Rr.n) / Math.min(L.n, Rr.n);
    if (dx < w * 0.1 || dx > w * 0.7 || dy > h * 0.06 || ratio > 2.4) continue;
    const score = ratio + dy / h * 20 + Math.abs(dx / w - 0.28) * 2;
    if (!best || score < best.score) best = { L, R: Rr, score };
  }
  const f3 = (v) => (Math.round(v * 1000) / 1000).toString();
  if (!best) return { text: '  // no clean pair of eyes found: measure this one by hand (a face in profile has one: x of -1 for the second)', out, w, h };
  const { L, R: Rr } = best, ey = (L.cy + Rr.cy) / 2;
  const rx = Math.max(L.bw, Rr.bw) / 2 + 1.5, ry = Math.max(L.bh, Rr.bh) / 2 + 1.5;
  const mouth = out.filter((b) => b.cy > ey + h * 0.04 && b.cx > L.cx - w * 0.15 && b.cx < Rr.cx + w * 0.15 && b !== L && b !== Rr && b.bw >= w * 0.06 && b.cy < h * 0.9)
    .sort((p, q) => q.n - p.n)[0];
  const brows = out.filter((b) => b !== L && b !== Rr && b.cy < ey - h * 0.02 && b.cy > ey - h * 0.16 && b.bh <= h * 0.09 && b.bw >= Math.min(L.bw, Rr.bw) * 0.6 && b.cx > L.cx - w * 0.12 && b.cx < Rr.cx + w * 0.12);
  const bl = brows.filter((b) => b.cx < (L.cx + Rr.cx) / 2).sort((p, q) => q.n - p.n)[0], br = brows.filter((b) => b.cx >= (L.cx + Rr.cx) / 2).sort((p, q) => q.n - p.n)[0];
  const parts = [`e:[${f3(L.cx / w)}, ${f3(L.cy / h)}, ${f3(Rr.cx / w)}, ${f3(Rr.cy / h)}, ${f3(rx / h)}, ${f3(ry / h)}]`];
  if (bl || br) {
    const A = bl || br, B = br || bl, bx = Math.max(A.bw, B.bw) / 2 + 1.5, by = Math.max(A.bh, B.bh) / 2 + 1.5;
    parts.push(`b:[${f3(A.cx / w)}, ${f3(A.cy / h)}, ${f3(B.cx / w)}, ${f3(B.cy / h)}, ${f3(bx / h)}, ${f3(by / h)}]`, `bc:'${ring(A, 4) || '#ffffff'}'`);
  }
  if (mouth) parts.push(`m:[${f3(mouth.cx / w)}, ${f3(mouth.cy / h)}, ${f3((mouth.bw / 2 + 1.5) / h)}, ${f3((mouth.bh / 2 + 1.5) / h)}]`);
  parts.push(`c:'${ring(L, 5) || '#ffffff'}'`, 's:0');
  return { text: `{ ${parts.join(', ')} },`, out, w, h, boxes: [L, Rr, bl, br, mouth].filter(Boolean) };
}

const pngs = [];
for (const f of files) {
  const png = PNG.sync.read(readFileSync(f));
  const p = propose(png);
  console.log(`  '${basename(f)}': ${p.text}   // ${png.width}x${png.height}`);
  pngs.push({ png, p });
}
if (sheetArg) {
  const S = 4, pad = 6, W = pngs.reduce((a, { png }) => a + png.width * S + pad, pad), H = Math.max(...pngs.map(({ png }) => png.height)) * S + pad * 2;
  const o = new PNG({ width: W, height: H });
  for (let i = 0; i < o.data.length; i += 4) { o.data[i] = 235; o.data[i + 1] = 235; o.data[i + 2] = 235; o.data[i + 3] = 255; }
  let ox = pad;
  for (const { png, p } of pngs) {
    for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
      const si = (y * png.width + x) * 4, a = png.data[si + 3] / 255;
      for (let dy = 0; dy < S; dy++) for (let dx = 0; dx < S; dx++) {
        const di = ((pad + y * S + dy) * W + ox + x * S + dx) * 4;
        for (let c = 0; c < 3; c++) o.data[di + c] = Math.round(png.data[si + c] * a + o.data[di + c] * (1 - a));
      }
    }
    for (const b of (p.boxes || [])) {
      for (let x = b.x0 * S; x <= (b.x1 + 1) * S; x++) for (const y of [b.y0 * S, (b.y1 + 1) * S]) { const di = ((pad + y) * W + ox + x) * 4; o.data[di] = 255; o.data[di + 1] = 0; o.data[di + 2] = 0; }
      for (let y = b.y0 * S; y <= (b.y1 + 1) * S; y++) for (const x of [b.x0 * S, (b.x1 + 1) * S]) { const di = ((pad + y) * W + ox + x) * 4; o.data[di] = 255; o.data[di + 1] = 0; o.data[di + 2] = 0; }
    }
    ox += png.width * S + pad;
  }
  writeFileSync(sheetArg.slice('--sheet='.length), PNG.sync.write(o));
  console.log('sheet written: ' + sheetArg.slice('--sheet='.length));
}
