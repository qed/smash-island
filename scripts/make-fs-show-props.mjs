// ============================================================================
//  make-fs-show-props.mjs -- the show's own pictures of five Final Smash props, scaled down for the game (2026-11-04, SHOW SPRITES BATCH 1)
// ============================================================================
// The owner: "I prefer show-accurate ones" (for sprites, not moves). The files are from the Battle for Dream Island wiki, downloaded after the owner's OK
// by name (battlefordreamisland.fandom.com, File:SteakhouseSign.png, File:Pan new asset 2020 (2).png, File:Tennis Ball's Trebuchet.png, File:Basketball Net.png,
// File:RedBalloon.png). Each is box-filtered down (area average, premultiplied alpha, so edges stay clean) to a small transparent PNG:
//   gelsign.png    Gelatin's steakhouse sign        300 px wide
//   poppan.png     Poppy's frying pan               300 px wide
//   trebpost.png   Tennis Ball's trebuchet, the frame + base + pedal; the ARM is taken off it (the Final Smash swings its own arm through the throws)
//   trebarm.png    ...and the arm with its counterweight block, drawn by the Final Smash turned about the pivot (trebuchet pivot below)
//   bbnet.png      Basketball's hoop rim (the bar) and net, 300 px wide (File:Basketball Hoop.png, the stand with the backboard and a 7 m pole, was checked and is NOT used:
//                  scaled to the game's 70 px hoop it would be 330 px tall, a different scene)
//   pinballoon.png Pin's red balloon                256 px tall
//
//   node scripts/make-fs-show-props.mjs <folder with the downloaded PNGs> [out folder]
//   (default out: artifacts/V1/assets/sprites/attacks; cwd = repo root; needs pngjs, resolved from the repo's node_modules)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PNG } from 'pngjs';

const IN = process.argv[2], OUT = process.argv[3] || 'artifacts/V1/assets/sprites/attacks';
if (!IN) throw new Error('usage: node scripts/make-fs-show-props.mjs <input folder> [out folder]');

// area-average resize in premultiplied alpha: returns {w,h,data}
function resize(png, nw, nh) {
  const W = png.width, H = png.height, d = png.data, out = Buffer.alloc(nw * nh * 4), sx = W / nw, sy = H / nh;
  for (let y = 0; y < nh; y++) {
    const y0 = y * sy, y1 = (y + 1) * sy;
    for (let x = 0; x < nw; x++) {
      const x0 = x * sx, x1 = (x + 1) * sx;
      let r = 0, g = 0, b = 0, a = 0, wt = 0;
      for (let yy = Math.floor(y0); yy < Math.min(H, Math.ceil(y1)); yy++) {
        const wy = Math.min(yy + 1, y1) - Math.max(yy, y0);
        for (let xx = Math.floor(x0); xx < Math.min(W, Math.ceil(x1)); xx++) {
          const w = wy * (Math.min(xx + 1, x1) - Math.max(xx, x0)), i = (yy * W + xx) * 4, al = d[i + 3] / 255;
          r += d[i] * al * w; g += d[i + 1] * al * w; b += d[i + 2] * al * w; a += al * w; wt += w;
        }
      }
      const o = (y * nw + x) * 4;
      if (a > 0) { out[o] = Math.round(r / a); out[o + 1] = Math.round(g / a); out[o + 2] = Math.round(b / a); out[o + 3] = Math.round(255 * a / wt); }
    }
  }
  return { width: nw, height: nh, data: out };
}
const load = (name) => PNG.sync.read(readFileSync(join(IN, name)));
function save(img, name) {
  const p = new PNG({ width: img.width, height: img.height }); img.data.copy(p.data);
  const buf = PNG.sync.write(p, { deflateLevel: 9, colorType: 6 });
  writeFileSync(join(OUT, name), buf);
  console.log(name.padEnd(16), img.width + 'x' + img.height, buf.length, 'bytes');
}
const byWidth = (png, w) => resize(png, w, Math.max(1, Math.round(png.height * w / png.width)));
const byHeight = (png, h) => resize(png, Math.max(1, Math.round(png.width * h / png.height)), h);

save(byWidth(load('SteakhouseSign.png'), 300), 'gelsign.png');
save(byWidth(load('Pan_new_asset_2020_2_.png'), 300), 'poppan.png');
save(byWidth(load('Basketball_Net.png'), 300), 'bbnet.png');
save(byHeight(load('RedBalloon.png'), 256), 'pinballoon.png');

// ---- the trebuchet: split into frame and arm (the arm is every bluish-grey pixel; the frame and base are brown) ----
{
  const T = byWidth(load('Tennis_Ball_s_Trebuchet.png'), 480), W = T.width, H = T.height, d = T.data;
  const arm = new Uint8Array(W * H), at = (x, y) => (y * W + x) * 4;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = at(x, y); if (d[i + 3] > 0 && d[i] - d[i + 2] < 32) arm[y * W + x] = 1; }   // not brown: the arm, its block, its string
  // the frame's post: the brown column. Its sides come from a row with the post alone; its top from the column's first pixel; its foot is where the base starts.
  const rowY = Math.round(H * 0.62);
  let xl = -1, xr = -1; for (let x = 0; x < W; x++) if (d[at(x, rowY) + 3] > 200 && !arm[rowY * W + x]) { if (xl < 0) xl = x; xr = x; }
  const cx = Math.round((xl + xr) / 2);
  let top = 0; while (top < H && d[at(cx, top) + 3] === 0) top++;
  let baseTop = rowY; while (baseTop < H) { let run = 0; for (let x = 0; x < W; x++) if (d[at(x, baseTop) + 3] > 200 && !arm[baseTop * W + x]) run++; if (run > (xr - xl) * 2.2) break; baseTop++; }
  const brown = [d[at(cx, rowY)], d[at(cx, rowY) + 1], d[at(cx, rowY) + 2]];
  console.log('trebuchet: post x', xl, xr, 'top', top, 'base top', baseTop, 'of', W + 'x' + H, 'brown', brown.join(','));
  // the arm without its strings and specks (a morphological opening, radius 2), and the stretch of it the post hid (the arm is BEHIND the post in the picture) filled in
  // straight between the arm's edges either side of the post, in the arm's own colours, so the arm can be turned about its pivot with no notch in it.
  const open = new Uint8Array(W * H), R2 = 2;
  const er = new Uint8Array(W * H);
  for (let y = R2; y < H - R2; y++) for (let x = R2; x < W - R2; x++) { let ok = 1; for (let dy = -R2; dy <= R2 && ok; dy++) for (let dx = -R2; dx <= R2; dx++) if (!arm[(y + dy) * W + x + dx]) { ok = 0; break; } er[y * W + x] = ok; }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let ok = 0; for (let dy = -R2; dy <= R2 && !ok; dy++) for (let dx = -R2; dx <= R2; dx++) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < W && Y < H && er[Y * W + X]) { ok = 1; break; } } open[y * W + x] = ok && arm[y * W + x] ? 1 : 0; }
  const edges = (x) => { let lo = -1, hi = -1; for (let y = 0; y < H; y++) if (open[y * W + x]) { if (lo < 0) lo = y; hi = y; } return [lo, hi]; };
  const xa = xl - 3, xb = xr + 3, [loA, hiA] = edges(xa), [loB, hiB] = edges(xb), midA = at(xa, (loA + hiA) >> 1), midB = at(xb, (loB + hiB) >> 1);
  console.log('arm edges left', loA, hiA, 'right', loB, hiB);
  const armOnly = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (open[y * W + x]) { const i = at(x, y); d.copy(armOnly, i, i, i + 4); }
  for (let x = xa + 1; x < xb; x++) {
    const u = (x - xa) / (xb - xa), lo = Math.round(loA + (loB - loA) * u), hi = Math.round(hiA + (hiB - hiA) * u);
    for (let y = lo; y <= hi; y++) { const i = at(x, y); if (armOnly[i + 3] === 0) for (let k = 0; k < 3; k++) armOnly[i + k] = Math.round(d[midA + k] + (d[midB + k] - d[midA + k]) * u), armOnly[i + 3] = 255; }
  }
  // base layer: everything not arm; where the arm crossed the post (dilated by 2 px) the post's own flat brown
  const base = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = at(x, y);
    if (arm[y * W + x]) continue;
  }
  const inPost = (x, y) => x >= xl && x <= xr && y >= top && y < baseTop;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = at(x, y);
    let near = arm[y * W + x];
    if (!near && inPost(x, y)) for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) { const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < W && Y < H && arm[Y * W + X]) { near = 1; break; } }
    if (inPost(x, y) && (near || d[i + 3] < 255)) { base[i] = brown[0]; base[i + 1] = brown[1]; base[i + 2] = brown[2]; base[i + 3] = 255; }
    else if (!arm[y * W + x]) d.copy(base, i, i, i + 4);
  }
  // the pivot (the round pin near the post's top) is where the arm layer's pixels are darkest and roundest: take the middle of the post at the pin's height as the sprite's own marker
  // (found by eye on the 480 px picture and recorded in index.html as TREB_PIVOT).
  save({ width: W, height: H, data: base }, 'trebpost.png');
  save({ width: W, height: H, data: armOnly }, 'trebarm.png');
}
