// ============================================================================
//  make-tv-spider.mjs -- the Robotic Spider's BODY, for TV's Final Smash (Static Burst)
// ============================================================================
// The owner (2026-11-03): "the robot spider should look like that robot spider. I prefer show-accurate ones", "for the sprites, not the moves".
// The picture is File:Robotic Spider.png on the Battle for Dream Island wiki (the Robotic Spider of TPOT 16, 'Bottle For Dream Island'; 1600x720,
// transparent, FRONT-on: a round fuzzy black body, two red slit eyes, brown-grey jointed legs). The Final Smash keeps its own eight animated legs
// (the stabs, the hook, the pin are moves and do not change), so what is drawn from the picture is the BODY: its legs are taken off it here.
//
// How (everything from the picture's own pixels, nothing borrowed): the body is the near-black pixels' largest piece; its convex hull is the body's
// outline; inside that hull a leg pixel that lies over the body (it touches the outside) is painted the fur's own black, and a lighter pixel the fur
// closes round (the pale "W" tufts, the eye gleams) stays as drawn; everything outside the hull, the legs and the paper, is made clear.
// Then it is cropped to the body and scaled to OUT_H tall (aspect kept), a transparent PNG.
//
//   node scripts/make-tv-spider.mjs <Robotic Spider.png> [out.png]
//   (default out: artifacts/V1/assets/sprites/attacks/tvspider.png; cwd = repo root; needs pngjs, resolved from the repo's node_modules)
//   `spiderBody(png)` is also the pick's key in scripts/fetch-attack-sprites.mjs ('spiderbody'): the fetch makes the same file.
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

export const OUT_H = 300;
const DARK = 40, FUR = [12, 12, 14];   // the fur is near-black and neutral; a leg's shadow side is brown (red over blue)

export function spiderBody(png) {
  const W = png.width, H = png.height, d = png.data, N = W * H;
  const solid = (i) => d[i * 4 + 3] > 128;
  const dark = new Uint8Array(N);
  for (let i = 0; i < N; i++) if (solid(i) && Math.max(d[i * 4], d[i * 4 + 1], d[i * 4 + 2]) < DARK && d[i * 4] - d[i * 4 + 2] < 9) dark[i] = 1;
  // the largest dark piece (4-connected flood)
  const comp = new Int32Array(N).fill(-1), sizes = [];
  const stack = [];
  for (let s = 0; s < N; s++) {
    if (!dark[s] || comp[s] >= 0) continue;
    const id = sizes.length; let n = 0; stack.push(s); comp[s] = id;
    while (stack.length) {
      const p = stack.pop(); n++; const x = p % W, y = (p / W) | 0;
      if (x > 0 && dark[p - 1] && comp[p - 1] < 0) { comp[p - 1] = id; stack.push(p - 1); }
      if (x < W - 1 && dark[p + 1] && comp[p + 1] < 0) { comp[p + 1] = id; stack.push(p + 1); }
      if (y > 0 && dark[p - W] && comp[p - W] < 0) { comp[p - W] = id; stack.push(p - W); }
      if (y < H - 1 && dark[p + W] && comp[p + W] < 0) { comp[p + W] = id; stack.push(p + W); }
    }
    sizes.push(n);
  }
  let big = 0; for (let k = 1; k < sizes.length; k++) if (sizes[k] > sizes[big]) big = k;
  const body = new Uint8Array(N); for (let i = 0; i < N; i++) body[i] = comp[i] === big ? 1 : 0;
  // the convex hull of the body's pixels (per row extremes, then Andrew's monotone chain)
  const pts = [];
  for (let y = 0; y < H; y++) { let a = -1, b = -1; for (let x = 0; x < W; x++) if (body[y * W + x]) { if (a < 0) a = x; b = x; } if (a >= 0) { pts.push([a, y]); if (b !== a) pts.push([b, y]); } }
  pts.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of pts) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let k = pts.length - 1; k >= 0; k--) { const p = pts[k]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  const hull = lo.slice(0, -1).concat(up.slice(0, -1));
  const inside = new Uint8Array(N);
  for (let y = 0; y < H; y++) {   // scanline fill of the hull
    let a = 1e9, b = -1e9;
    for (let k = 0; k < hull.length; k++) {
      const p = hull[k], q = hull[(k + 1) % hull.length];
      if ((p[1] <= y && q[1] > y) || (q[1] <= y && p[1] > y)) { const x = p[0] + (y - p[1]) * (q[0] - p[0]) / (q[1] - p[1]); a = Math.min(a, x); b = Math.max(b, x); }
    }
    for (let x = Math.ceil(a); x <= Math.floor(b); x++) if (x >= 0 && x < W) inside[y * W + x] = 1;
  }
  // what the outside can reach without crossing the body: the paper and the legs (4-connected)
  const reach = new Uint8Array(N);
  for (let i = 0; i < W; i++) { stack.push(i, N - 1 - i); }
  for (let j = 0; j < H; j++) { stack.push(j * W, j * W + W - 1); }
  while (stack.length) {
    const p = stack.pop(); if (p < 0 || p >= N || reach[p] || body[p]) continue; reach[p] = 1; const x = p % W;
    if (x > 0) stack.push(p - 1); if (x < W - 1) stack.push(p + 1); stack.push(p - W, p + W);
  }
  for (let i = 0; i < N; i++) {
    const o = i * 4;
    if (!inside[i]) { d[o + 3] = 0; continue; }
    if (body[i]) continue;                                   // the fur as drawn
    if (!solid(i)) continue;                                  // a gap between tufts stays a gap
    if (reach[i]) { d[o] = FUR[0]; d[o + 1] = FUR[1]; d[o + 2] = FUR[2]; d[o + 3] = 255; }   // a leg over the body: fur
    // else: enclosed (a pale tuft, an eye's gleam): as drawn
  }
  return png;
}

function cropScale(png, outH) {
  const W = png.width, H = png.height; let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (png.data[(y * W + x) * 4 + 3] > 8) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1, ow = Math.max(1, Math.round(cw * outH / ch));
  const out = new PNG({ width: ow, height: outH });
  const k = ch / outH;   // box filter, premultiplied
  for (let y = 0; y < outH; y++) for (let x = 0; x < ow; x++) {
    const sx0 = x0 + x * cw / ow, sx1 = x0 + (x + 1) * cw / ow, sy0 = y0 + y * k, sy1 = y0 + (y + 1) * k;
    let r = 0, g = 0, b = 0, a = 0, wsum = 0;
    for (let sy = Math.floor(sy0); sy < Math.ceil(sy1); sy++) for (let sx = Math.floor(sx0); sx < Math.ceil(sx1); sx++) {
      const wx = Math.min(sx + 1, sx1) - Math.max(sx, sx0), wy = Math.min(sy + 1, sy1) - Math.max(sy, sy0), w = wx * wy; if (!(w > 0)) continue;
      const o = (sy * W + sx) * 4, al = png.data[o + 3] / 255; r += png.data[o] * al * w; g += png.data[o + 1] * al * w; b += png.data[o + 2] * al * w; a += al * w; wsum += w;
    }
    const o = (y * ow + x) * 4;
    if (a > 0) { out.data[o] = Math.round(r / a); out.data[o + 1] = Math.round(g / a); out.data[o + 2] = Math.round(b / a); out.data[o + 3] = Math.round(255 * a / wsum); }
  }
  return { out, box: [x0, y0, x1, y1] };
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('make-tv-spider.mjs')) {
  const src = process.argv[2], dst = process.argv[3] || 'artifacts/V1/assets/sprites/attacks/tvspider.png';
  if (!src) { console.log('usage: node scripts/make-tv-spider.mjs <Robotic Spider.png> [out.png]'); process.exit(1); }
  const png = spiderBody(PNG.sync.read(readFileSync(src)));
  const { out, box } = cropScale(png, OUT_H);
  writeFileSync(dst, PNG.sync.write(out));
  let clear = 0; for (let i = 0; i < out.width * out.height; i++) if (out.data[i * 4 + 3] < 8) clear++;
  console.log(`${dst}: ${out.width}x${out.height}, body box in the source ${box.join(',')}, ${(100 * clear / (out.width * out.height)).toFixed(0)}% clear`);
}
