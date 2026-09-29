// ============================================================================
//  clean-cammy-flash.mjs -- re-cut Cammy's pop-up-flash pose from the wiki's own cut-out
// ============================================================================
// "cammy-flash could be better cropped." (the owner, 2026-09-29; asked, "No, clean it by hand" rather than install an ML
// background remover). File:Cammy Flash.png (All Play and No Work) is a night-time frame someone cut out loosely: a 3-4 px rim of
// the night sky still runs round the camera outside his black outline, and the edge is hard-stepped. This peels edge pixels that
// are brighter than the outline (at most 5 passes; the outline and the legs are darker and stop it), keeps the largest piece,
// anti-aliases the new edge (a 3x3 box and a gentle ramp, colour taken from the outline so no rim colour returns), crops to the
// alpha box and shrinks to 200 px tall like every render. Then white-balance it as before:
//
//   node scripts/clean-cammy-flash.mjs && node scripts/fix-cammy-flash.mjs      (cwd = repo root)
import { writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const SRC = 'https://static.wikia.nocookie.net/inanimateinsanity/images/f/fa/Cammy_Flash.png/revision/latest?cb=20260419233749&format=original';
const OUT = 'artifacts/V1/assets/sprites/cammy-flash.png';
const p = PNG.sync.read(Buffer.from(await (await fetch(SRC)).arrayBuffer())), w = p.width, h = p.height, N = w*h, d = p.data;
const lum = (k) => 0.299*d[k*4] + 0.587*d[k*4+1] + 0.114*d[k*4+2];
const m = new Uint8Array(N); for (let k = 0; k < N; k++) m[k] = d[k*4+3] > 0 ? 1 : 0;
const edge = (k) => { const x = k % w, y = (k / w) | 0; for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const X = x+dx, Y = y+dy; if (X<0||Y<0||X>=w||Y>=h||!m[Y*w+X]) return true; } return false; };
// 1. peel the night-sky halo: boundary pixels brighter than the black outline, up to 5 passes
const LINE = 24; let peeled = 0;
for (let pass = 0; pass < 5; pass++) {
  const go = []; for (let k = 0; k < N; k++) if (m[k] && edge(k) && lum(k) > LINE) go.push(k);
  for (const k of go) m[k] = 0; peeled += go.length; if (!go.length) break;
}
// drop specks: keep the largest connected piece
const comp = new Int32Array(N).fill(-1), sizes = [];
for (let k0 = 0; k0 < N; k0++) { if (!m[k0] || comp[k0] >= 0) continue; const id = sizes.length, st = [k0]; comp[k0] = id; let n = 0;
  while (st.length) { const k = st.pop(), x = k % w; n++; for (const q of [x>0?k-1:-1, x<w-1?k+1:-1, k-w, k+w]) if (q>=0 && q<N && m[q] && comp[q]<0) { comp[q] = id; st.push(q); } } sizes.push(n); }
const big = sizes.indexOf(Math.max(...sizes)); for (let k = 0; k < N; k++) if (m[k] && comp[k] !== big) m[k] = 0;
// 2. anti-alias: 3x3 box blur of the mask, then a gentle ramp so the edge stays crisp
const a = new Float32Array(N);
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let s = 0, n = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = x+dx, Y = y+dy; if (X<0||Y<0||X>=w||Y>=h) { n++; continue; } s += m[Y*w+X]; n++; }
  const b = s / n; a[y*w+x] = Math.max(0, Math.min(1, (b - 0.2) / 0.6)); }
// colour of pixels that gain alpha outside the kept mask: borrow the nearest kept (outline) pixel so no halo colour returns
const out = new PNG({ width: w, height: h });
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = y*w+x, o = k*4; let src = k;
  if (!m[k] && a[k] > 0) { let best = -1, bd = 9; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = x+dx, Y = y+dy; if (X<0||Y<0||X>=w||Y>=h) continue; const q = Y*w+X; if (m[q]) { const dd = dx*dx+dy*dy; if (dd < bd) { bd = dd; best = q; } } } if (best >= 0) src = best; }
  out.data[o] = d[src*4]; out.data[o+1] = d[src*4+1]; out.data[o+2] = d[src*4+2]; out.data[o+3] = Math.round(255 * a[k]); }
// 3. crop to the alpha box and shrink to 200 px tall (premultiplied area average), as the sprite pipeline does
let x0 = w, y0 = h, x1 = -1, y1 = -1; for (let k = 0; k < N; k++) if (out.data[k*4+3] > 8) { const x = k % w, y = (k / w) | 0; if (x<x0) x0=x; if (y<y0) y0=y; if (x>x1) x1=x; if (y>y1) y1=y; }
const sw = x1-x0+1, sh = y1-y0+1, H = 200, sc = H / sh, W2 = Math.round(sw * sc), fin = new PNG({ width: W2, height: H });
for (let y = 0; y < H; y++) for (let x = 0; x < W2; x++) { let r=0,g=0,b=0,al=0,n=0;
  const sx0 = x0 + x/sc, sx1 = x0 + (x+1)/sc, sy0 = y0 + y/sc, sy1 = y0 + (y+1)/sc;
  for (let yy = Math.floor(sy0); yy < Math.ceil(sy1); yy++) for (let xx = Math.floor(sx0); xx < Math.ceil(sx1); xx++) {
    if (xx<0||yy<0||xx>=w||yy>=h) continue; const i = (yy*w+xx)*4, A = out.data[i+3]/255; r += out.data[i]*A; g += out.data[i+1]*A; b += out.data[i+2]*A; al += A; n++; }
  const o = (y*W2+x)*4; if (al > 0) { fin.data[o] = r/al; fin.data[o+1] = g/al; fin.data[o+2] = b/al; fin.data[o+3] = Math.round(255*al/n); } }
writeFileSync(OUT, PNG.sync.write(fin));
console.log('cammy-flash.png cut: peeled', peeled, 'rim pixels; box', sw + 'x' + sh, '->', W2 + 'x' + H, '(now run fix-cammy-flash.mjs)');
