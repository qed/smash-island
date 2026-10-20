// ============================================================================
//  anim-pose-lib.mjs -- the small picture toolkit the pose sets are built with (scripts/make-anim-batch1.mjs)
// ============================================================================
// pngjs only (no native image library is installed): load and save, crop and trim, an area-average resize, a
// bilinear paste with scale / rotation / mirror, flood-filled background keys, polygon cuts, connected parts,
// lifting a FACE off one picture (its strokes and whatever they enclose, edges kept soft) and painting the old
// face out of another, and a few anti-aliased drawing primitives for the frames the show never drew.
// Every image is { w, h, d } with d a Uint8ClampedArray of straight (not premultiplied) RGBA.
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

export const ALPHA_FLOOR = 24;   // fetch-sprites.mjs's: below this a pixel is invisible in play, and is erased on write
export const blank = (w, h) => ({ w, h, d: new Uint8ClampedArray(w * h * 4) });
export const clone = (im) => ({ w: im.w, h: im.h, d: new Uint8ClampedArray(im.d) });
export const lum = (r, g, b) => r * 0.299 + g * 0.587 + b * 0.114;

export function load(path) {
  let buf = readFileSync(path);
  // a few wiki files carry bytes after the IEND chunk, which pngjs refuses: the picture ends there, so the rest is dropped
  const end = buf.lastIndexOf(Buffer.from('IEND'));
  if (end > 0 && end + 8 < buf.length) buf = buf.subarray(0, end + 8);
  const p = PNG.sync.read(buf);
  return { w: p.width, h: p.height, d: new Uint8ClampedArray(p.data) };
}
export function save(path, im) {
  const p = new PNG({ width: im.w, height: im.h });
  const d = Buffer.from(im.d);
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] < ALPHA_FLOOR) { d[i] = d[i + 1] = d[i + 2] = d[i + 3] = 0; }
  p.data = d;
  writeFileSync(path, PNG.sync.write(p, { colorType: 6 }));
}

export function crop(im, x, y, w, h) {
  const o = blank(w, h);
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    const sx = x + xx, sy = y + yy;
    if (sx < 0 || sy < 0 || sx >= im.w || sy >= im.h) continue;
    const s = (sy * im.w + sx) * 4, t = (yy * w + xx) * 4;
    o.d[t] = im.d[s]; o.d[t + 1] = im.d[s + 1]; o.d[t + 2] = im.d[s + 2]; o.d[t + 3] = im.d[s + 3];
  }
  return o;
}
export function flipX(im) {
  const o = blank(im.w, im.h);
  for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) {
    const s = (y * im.w + x) * 4, t = (y * im.w + (im.w - 1 - x)) * 4;
    for (let c = 0; c < 4; c++) o.d[t + c] = im.d[s + c];
  }
  return o;
}
// The box round everything at least `floor` opaque.
export function bbox(im, floor = ALPHA_FLOOR) {
  let x0 = im.w, y0 = im.h, x1 = -1, y1 = -1;
  for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) if (im.d[(y * im.w + x) * 4 + 3] >= floor) {
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}
export function trim(im, pad = 2) {
  const b = bbox(im);
  return crop(im, b.x - pad, b.y - pad, b.w + pad * 2, b.h + pad * 2);
}

// AREA-AVERAGE resize (a box filter of exactly the footprint of each new pixel), in premultiplied alpha so a transparent
// neighbour never bleeds its colour in. Used for every shrink: 3800px official assets come down to ~200px without aliasing.
export function resize(im, nw, nh) {
  const sx = im.w / nw, sy = im.h / nh, o = blank(nw, nh);
  const acc = new Float64Array(4);
  for (let y = 0; y < nh; y++) {
    const fy0 = y * sy, fy1 = fy0 + sy, iy0 = Math.floor(fy0), iy1 = Math.min(im.h - 1, Math.ceil(fy1) - 1);
    for (let x = 0; x < nw; x++) {
      const fx0 = x * sx, fx1 = fx0 + sx, ix0 = Math.floor(fx0), ix1 = Math.min(im.w - 1, Math.ceil(fx1) - 1);
      acc[0] = acc[1] = acc[2] = acc[3] = 0; let wsum = 0;
      for (let yy = iy0; yy <= iy1; yy++) {
        const wy = Math.min(fy1, yy + 1) - Math.max(fy0, yy);
        if (wy <= 0) continue;
        for (let xx = ix0; xx <= ix1; xx++) {
          const wx = Math.min(fx1, xx + 1) - Math.max(fx0, xx);
          if (wx <= 0) continue;
          const wgt = wx * wy, i = (yy * im.w + xx) * 4, a = im.d[i + 3] / 255;
          acc[0] += im.d[i] * a * wgt; acc[1] += im.d[i + 1] * a * wgt; acc[2] += im.d[i + 2] * a * wgt; acc[3] += a * wgt; wsum += wgt;
        }
      }
      const t = (y * nw + x) * 4, A = acc[3];
      if (A > 1e-6) { o.d[t] = acc[0] / A; o.d[t + 1] = acc[1] / A; o.d[t + 2] = acc[2] / A; o.d[t + 3] = (A / wsum) * 255; }
    }
  }
  return o;
}
export const scaleBy = (im, k) => resize(im, Math.max(1, Math.round(im.w * k)), Math.max(1, Math.round(im.h * k)));

// Bilinear sample in premultiplied space: [r, g, b, a] with a in 0..1 and rgb premultiplied.
function samplePM(im, x, y, out) {
  x -= 0.5; y -= 0.5;
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
  out[0] = out[1] = out[2] = out[3] = 0;
  for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
    const xx = x0 + i, yy = y0 + j;
    if (xx < 0 || yy < 0 || xx >= im.w || yy >= im.h) continue;
    const w = (i ? fx : 1 - fx) * (j ? fy : 1 - fy), k = (yy * im.w + xx) * 4, a = im.d[k + 3] / 255 * w;
    out[0] += im.d[k] * a; out[1] += im.d[k + 1] * a; out[2] += im.d[k + 2] * a; out[3] += a;
  }
  return out;
}
// Paint `src` over `dst`: src's point (ox, oy) lands on dst's (x, y), scaled by (sx, sy) (negative sx mirrors), turned by `rot`
// radians about that point, at `alpha`. Shrink `src` with resize() first when the scale is well under 1 (bilinear only sees 2x2).
export function paste(dst, src, { x = 0, y = 0, ox = 0, oy = 0, sx = 1, sy = 1, rot = 0, alpha = 1, mode = 'over' } = {}) {
  const c = Math.cos(rot), s = Math.sin(rot), px = new Float64Array(4);
  const corners = [[0, 0], [src.w, 0], [0, src.h], [src.w, src.h]].map(([u, v]) => { const a = (u - ox) * sx, b = (v - oy) * sy; return [x + a * c - b * s, y + a * s + b * c]; });
  const X0 = Math.max(0, Math.floor(Math.min(...corners.map((p) => p[0])))), X1 = Math.min(dst.w - 1, Math.ceil(Math.max(...corners.map((p) => p[0]))));
  const Y0 = Math.max(0, Math.floor(Math.min(...corners.map((p) => p[1])))), Y1 = Math.min(dst.h - 1, Math.ceil(Math.max(...corners.map((p) => p[1]))));
  for (let Y = Y0; Y <= Y1; Y++) for (let X = X0; X <= X1; X++) {
    const dx = X + 0.5 - x, dy = Y + 0.5 - y, a = dx * c + dy * s, b = -dx * s + dy * c;
    const u = a / sx + ox, v = b / sy + oy;
    if (u < -1 || v < -1 || u > src.w + 1 || v > src.h + 1) continue;
    samplePM(src, u, v, px);
    const sa = px[3] * alpha; if (sa <= 0.001) continue;
    const t = (Y * dst.w + X) * 4, da = dst.d[t + 3] / 255;
    if (mode === 'atop' && da <= 0) continue;
    const k = alpha;
    const oa = mode === 'atop' ? da : sa + da * (1 - sa);
    const r = px[0] * k + dst.d[t] * da * (1 - sa), g = px[1] * k + dst.d[t + 1] * da * (1 - sa), bb = px[2] * k + dst.d[t + 2] * da * (1 - sa);
    const norm = mode === 'atop' ? (sa + da * (1 - sa)) : oa;
    if (norm > 0) { dst.d[t] = r / norm; dst.d[t + 1] = g / norm; dst.d[t + 2] = bb / norm; }
    dst.d[t + 3] = oa * 255;
  }
  return dst;
}
// A canvas big enough for `im` with a margin, the picture in the middle.
export function padTo(im, w, h, ax = 0.5, ay = 0.5) {
  const o = blank(w, h);
  return paste(o, im, { x: Math.round((w - im.w) * ax), y: Math.round((h - im.h) * ay) });
}

// ---- keys and cuts ------------------------------------------------------------------------------------------------------
// The BACKGROUND, found by flooding in from the border over every pixel `isBg(r, g, b, a, x, y)` accepts (4-connected), so a
// background colour that also appears INSIDE the character (a white tooth, a blue eye) is left alone unless it touches the outside.
export function floodBg(im, isBg, seeds) {
  const { w, h, d } = im, bg = new Uint8Array(w * h), q = new Int32Array(w * h); let qh = 0, qt = 0;
  const ok = (p) => { const i = p * 4; return isBg(d[i], d[i + 1], d[i + 2], d[i + 3], p % w, (p / w) | 0); };
  const push = (p) => { if (!bg[p] && ok(p)) { bg[p] = 1; q[qt++] = p; } };
  if (seeds) for (const [x, y] of seeds) push(y * w + x);
  else { for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); } for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); } }
  while (qh < qt) {
    const p = q[qh++], x = p % w, y = (p / w) | 0;
    if (x > 0) push(p - 1); if (x < w - 1) push(p + 1); if (y > 0) push(p - w); if (y < h - 1) push(p + w);
  }
  return bg;
}
// Erase what `mask` marks, and soften the new edge: a kept pixel touching the background keeps `edge` of its alpha.
export function applyMask(im, mask, edge = 0.6) {
  const { w, h, d } = im;
  for (let p = 0; p < w * h; p++) if (mask[p]) d[p * 4 + 3] = 0;
  const soft = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = y * w + x; if (mask[p]) continue;
    if ((x > 0 && mask[p - 1]) || (x < w - 1 && mask[p + 1]) || (y > 0 && mask[p - w]) || (y < h - 1 && mask[p + w])) soft.push(p);
  }
  for (const p of soft) d[p * 4 + 3] = d[p * 4 + 3] * edge;
  return im;
}
// Everything outside a traced outline (even-odd), with the edge anti-aliased by 4x4 coverage.
export function polyCut(im, poly) {
  const { w, h, d } = im;
  const inside = (x, y) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let n = 0; for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) if (inside(x + (i + 0.5) / 4, y + (j + 0.5) / 4)) n++;
    d[(y * w + x) * 4 + 3] = d[(y * w + x) * 4 + 3] * n / 16;
  }
  return im;
}
// Connected opaque parts (8-connected): [{ n, box, px: Int32Array }], biggest first.
export function parts(im, floor = ALPHA_FLOOR) {
  const { w, h, d } = im, lab = new Int32Array(w * h).fill(-1), out = [], q = new Int32Array(w * h);
  for (let p0 = 0; p0 < w * h; p0++) {
    if (lab[p0] >= 0 || d[p0 * 4 + 3] < floor) continue;
    let qh = 0, qt = 0; q[qt++] = p0; lab[p0] = out.length;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    while (qh < qt) {
      const p = q[qh++], x = p % w, y = (p / w) | 0;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const pp = yy * w + xx; if (lab[pp] < 0 && d[pp * 4 + 3] >= floor) { lab[pp] = out.length; q[qt++] = pp; }
      }
    }
    out.push({ n: qt, box: { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 }, px: q.slice(0, qt) });
  }
  return out.sort((a, b) => b.n - a.n);
}
// Keep only the parts `keep(part)` accepts (and erase their faint fringe too).
export function keepParts(im, keep) {
  const all = parts(im, 8);
  for (const pt of all) if (!keep(pt)) for (const p of pt.px) im.d[p * 4 + 3] = 0;
  return im;
}
// DECONTAMINATE the edge band. A cut-out keyed off a coloured ground keeps that ground's tint in its outermost pixels (a red fringe round
// a blue body, white or green round a black limb). Every pixel within `band` px of the clear (alpha under the floor, or off the canvas)
// that `bad(r, g, b)` accepts takes the colour of the nearest pixel deeper in that it does not accept (within `reach`; failing that, the
// nearest clean pixel of the band itself); its alpha is kept, so the edge stays as soft as it was. A tint that runs deep (an upscaled
// file) takes `passes`: each pass reads the last one's colours, so the clean colour walks out to the edge.
export function decontaminate(im, bad, { band = 2, reach = 4, passes = 1 } = {}) {
  let total = 0;
  for (let pass = 0; pass < passes; pass++) { const n = decontaminateOnce(im, bad, band, reach); total += n; if (!n) break; }
  return total;
}
function decontaminateOnce(im, bad, band, reach) {
  const { w, h, d } = im, src = new Uint8ClampedArray(d), dist = new Int32Array(w * h).fill(1 << 20), q = [];
  for (let p = 0; p < w * h; p++) if (d[p * 4 + 3] < ALPHA_FLOOR) { dist[p] = 0; q.push(p); }
  for (let p = 0; p < w * h; p++) { const x = p % w, y = (p / w) | 0; if (dist[p] && (x === 0 || y === 0 || x === w - 1 || y === h - 1)) { dist[p] = 1; q.push(p); } }
  for (let qi = 0; qi < q.length; qi++) {
    const p = q[qi], x = p % w, y = (p / w) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const pp = yy * w + xx; if (dist[pp] > dist[p] + 1) { dist[pp] = dist[p] + 1; q.push(pp); }
    }
  }
  const clean = (pp, deep) => { const j = pp * 4; return src[j + 3] >= (deep ? 250 : 128) && (deep ? dist[pp] > band : true) && !bad(src[j], src[j + 1], src[j + 2]); };
  let n = 0;
  for (let p = 0; p < w * h; p++) {
    const i = p * 4; if (!dist[p] || dist[p] > band || !bad(src[i], src[i + 1], src[i + 2])) continue;
    const x = p % w, y = (p / w) | 0;
    let best = -1;
    for (const deep of [true, false]) {
      let bd = 1e9;
      for (let dy = -reach; dy <= reach; dy++) for (let dx = -reach; dx <= reach; dx++) {
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const pp = yy * w + xx, dd = dx * dx + dy * dy; if (dd && dd < bd && clean(pp, deep)) { bd = dd; best = pp; }
      }
      if (best >= 0) break;
    }
    if (best < 0) continue;
    d[i] = src[best * 4]; d[i + 1] = src[best * 4 + 1]; d[i + 2] = src[best * 4 + 2]; n++;
  }
  return n;
}
// Erase a rectangle / a polygon outright (another character's arm reaching in, a stray prop).
export function eraseRect(im, x, y, w, h) { for (let yy = Math.max(0, y); yy < Math.min(im.h, y + h); yy++) for (let xx = Math.max(0, x); xx < Math.min(im.w, x + w); xx++) im.d[(yy * im.w + xx) * 4 + 3] = 0; return im; }
export function erasePoly(im, poly) {
  const m = clone(im); polyCut(m, poly);   // alpha now = coverage inside
  for (let i = 3; i < im.d.length; i += 4) { const inside = im.d[i] ? m.d[i] / im.d[i] : 0; im.d[i] = im.d[i] * (1 - inside); }
  return im;
}

// ---- faces ----------------------------------------------------------------------------------------------------------------
// LIFT A FACE off a picture: inside `rect`, flood from the rectangle's edge over everything near the body colour `body` (within
// `tol`, a plain RGB distance, so the shading and a blush still count as body). What the flood cannot reach is the face -- the
// strokes and everything they enclose (eye whites, teeth, a tongue) -- and is copied whole; a body pixel darkened by a stroke's
// soft edge keeps that much of the stroke as black at partial alpha, so the strokes stay smooth. Returns a layer the size of rect.
export function liftFace(im, rect, body, tol = 70, ink = [16, 16, 16]) {
  const r = crop(im, rect.x, rect.y, rect.w, rect.h), { w, h, d } = r;
  const near = (R, G, B) => Math.hypot(R - body[0], G - body[1], B - body[2]) < tol;
  const bodyMask = floodBg(r, (R, G, B, A) => A > 0 && near(R, G, B));
  const transparent = floodBg(r, (R, G, B, A) => A < ALPHA_FLOOR);
  const out = blank(w, h), bl = lum(body[0], body[1], body[2]);
  for (let p = 0; p < w * h; p++) {
    const i = p * 4; if (transparent[p] || d[i + 3] < ALPHA_FLOOR) continue;
    if (!bodyMask[p]) { out.d[i] = d[i]; out.d[i + 1] = d[i + 1]; out.d[i + 2] = d[i + 2]; out.d[i + 3] = d[i + 3]; continue; }
    const k = Math.max(0, Math.min(1, (bl - lum(d[i], d[i + 1], d[i + 2])) / Math.max(1, bl - lum(...ink)) * 1.15 - 0.08));
    if (k > 0.02) { out.d[i] = ink[0]; out.d[i + 1] = ink[1]; out.d[i + 2] = ink[2]; out.d[i + 3] = k * 255; }
  }
  return out;
}
// The opposite: PAINT A FACE OUT. Every pixel `kill(x, y, r, g, b)` marks inside `rect` is refilled from the body round it
// (a diffusion fill: each hole pixel the mean of its known neighbours, many passes), alpha kept.
export function paintOut(im, rect, kill, passes = 400) {
  const { w, d } = im, hole = [];
  for (let y = rect.y; y < rect.y + rect.h; y++) for (let x = rect.x; x < rect.x + rect.w; x++) {
    if (x < 0 || y < 0 || x >= im.w || y >= im.h) continue;
    const i = (y * w + x) * 4; if (d[i + 3] < ALPHA_FLOOR) continue;
    if (kill(x, y, d[i], d[i + 1], d[i + 2], d[i + 3])) hole.push(y * w + x);
  }
  const isHole = new Uint8Array(im.w * im.h); for (const p of hole) isHole[p] = 1;
  const known = (p) => !isHole[p] && d[p * 4 + 3] >= 200;
  const val = new Float64Array(im.w * im.h * 3);
  for (let p = 0; p < im.w * im.h; p++) { val[p * 3] = d[p * 4]; val[p * 3 + 1] = d[p * 4 + 1]; val[p * 3 + 2] = d[p * 4 + 2]; }
  // seed every hole pixel with the mean of the body pixels in its row and column, then relax
  for (const p of hole) { val[p * 3] = val[p * 3 + 1] = val[p * 3 + 2] = -1; }
  for (let it = 0; it < passes; it++) {
    for (const p of hole) {
      let n = 0, R = 0, G = 0, B = 0;
      for (const q of [p - 1, p + 1, p - w, p + w]) {
        if (q < 0 || q >= im.w * im.h) continue;
        if (isHole[q]) { if (val[q * 3] < 0) continue; } else if (!known(q)) continue;
        R += val[q * 3]; G += val[q * 3 + 1]; B += val[q * 3 + 2]; n++;
      }
      if (n) { val[p * 3] = R / n; val[p * 3 + 1] = G / n; val[p * 3 + 2] = B / n; }
    }
  }
  for (const p of hole) if (val[p * 3] >= 0) { d[p * 4] = val[p * 3]; d[p * 4 + 1] = val[p * 3 + 1]; d[p * 4 + 2] = val[p * 3 + 2]; d[p * 4 + 3] = 255; }
  return im;
}
// The fill of a character: opaque pixels that are not line-work. Its area is how big the character is, whatever the pose.
export function fillArea(im, inkLum = 70) {
  let n = 0; const d = im.d;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] >= 128 && lum(d[i], d[i + 1], d[i + 2]) > inkLum) n++;
  return n;
}
// Median colour of the opaque, non-ink pixels inside a rect (the body colour a face sits on).
export function bodyColour(im, rect, inkLum = 90) {
  const R = [], G = [], B = [];
  for (let y = rect.y; y < rect.y + rect.h; y++) for (let x = rect.x; x < rect.x + rect.w; x++) {
    const i = (y * im.w + x) * 4; if (im.d[i + 3] < 200) continue;
    if (lum(im.d[i], im.d[i + 1], im.d[i + 2]) < inkLum) continue;
    R.push(im.d[i]); G.push(im.d[i + 1]); B.push(im.d[i + 2]);
  }
  const med = (a) => a.sort((x, y) => x - y)[a.length >> 1];
  return [med(R), med(G), med(B)];
}

// ---- drawing (the frames nobody drew) -----------------------------------------------------------------------------------------
function cover(dst, x0, y0, x1, y1, inside, rgb, alpha = 1, mode = 'over') {
  for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(dst.h - 1, Math.ceil(y1)); y++) for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(dst.w - 1, Math.ceil(x1)); x++) {
    let n = 0; for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) if (inside(x + (i + 0.5) / 4, y + (j + 0.5) / 4)) n++;
    if (!n) continue;
    const t = (y * dst.w + x) * 4, sa = n / 16 * alpha, da = dst.d[t + 3] / 255;
    if (mode === 'atop' && da <= 0) continue;
    const oa = mode === 'atop' ? da : sa + da * (1 - sa);
    for (let c = 0; c < 3; c++) dst.d[t + c] = (rgb[c] * sa + dst.d[t + c] * da * (1 - sa)) / Math.max(1e-6, sa + da * (1 - sa));
    dst.d[t + 3] = oa * 255;
  }
}
export function fillEllipse(dst, cx, cy, rx, ry, rgb, rot = 0, alpha = 1, mode = 'over') {
  const c = Math.cos(rot), s = Math.sin(rot), R = Math.max(rx, ry);
  cover(dst, cx - R, cy - R, cx + R, cy + R, (x, y) => { const dx = x - cx, dy = y - cy, a = dx * c + dy * s, b = -dx * s + dy * c; return (a * a) / (rx * rx) + (b * b) / (ry * ry) <= 1; }, rgb, alpha, mode);
}
const segDist = (px, py, ax, ay, bx, by) => { const vx = bx - ax, vy = by - ay, L = vx * vx + vy * vy || 1, t = Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / L)); return Math.hypot(px - ax - t * vx, py - ay - t * vy); };
// A stroke along `pts` with round caps, `width` wide.
export function stroke(dst, pts, width, rgb, alpha = 1, mode = 'over') {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), r = width / 2;
  cover(dst, Math.min(...xs) - r, Math.min(...ys) - r, Math.max(...xs) + r, Math.max(...ys) + r, (x, y) => {
    for (let i = 1; i < pts.length; i++) if (segDist(x, y, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]) <= r) return true; return false; }, rgb, alpha, mode);
}
export const arc = (cx, cy, rx, ry, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });

// ---- mattes (episode frames) ----------------------------------------------------------------------------------------------------
// A DIFFERENCE MATTE: the background is flooded in from the border over every pixel within `hi` of the background colour there
// (`bgAt(x, y)` -> [r, g, b]: a flat colour, a gradient, a row or column average), and each flooded pixel keeps alpha by how far
// it is from that colour -- 0 at `lo` or nearer, 1 at `hi` -- with its colour un-mixed from the background. The line-work is far
// from any background, so the flood stops at the outline, and the outline's soft edge keeps its softness instead of a fringe.
export function cutBg(im, bgAt, { lo = 12, hi = 60, seeds = null, global = false } = {}) {
  const { w, h, d } = im, dist = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = y * w + x, i = p * 4, b = bgAt(x, y);
    dist[p] = Math.hypot(d[i] - b[0], d[i + 1] - b[1], d[i + 2] - b[2]);
  }
  if (global) { seeds = []; for (let p = 0; p < w * h; p++) if (dist[p] < lo) seeds.push([p % w, (p / w) | 0]); }   // every near-exact background pixel, enclosed or not
  const reg = floodBg(im, (r, g, b, a, x, y) => dist[y * w + x] < hi, seeds);
  for (let p = 0; p < w * h; p++) {
    if (!reg[p]) continue;
    const i = p * 4, a = Math.max(0, Math.min(1, (dist[p] - lo) / (hi - lo)));
    if (a <= 0) { d[i + 3] = 0; continue; }
    const b = bgAt(p % w, (p / w) | 0);
    for (let c = 0; c < 3; c++) d[i + c] = Math.max(0, Math.min(255, (d[i + c] - (1 - a) * b[c]) / a));
    d[i + 3] = d[i + 3] * a;
  }
  return im;
}
// A background flooded in by a predicate (a textured one: grass, sky and sand), then the kept edge pixels un-mixed from the
// background next to them: an edge darker than that background is the outline's soft edge (alpha from how dark it is, colour
// pulled to `ink`), anything else is softened to `soft`.
export function cutPred(im, isBg, { seeds = null, ink = [24, 24, 24], soft = 0.65 } = {}) {
  const { w, h, d } = im, bg = floodBg(im, isBg, seeds);
  const edge = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = y * w + x; if (bg[p]) continue;
    let n = 0, R = 0, G = 0, B = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
      const q = yy * w + xx; if (!bg[q]) continue; const j = q * 4; R += d[j]; G += d[j + 1]; B += d[j + 2]; n++;
    }
    if (n) edge.push([p, R / n, G / n, B / n]);
  }
  for (let p = 0; p < w * h; p++) if (bg[p]) d[p * 4 + 3] = 0;
  for (const [p, R, G, B] of edge) {
    const i = p * 4, lb = lum(R, G, B), lc = lum(d[i], d[i + 1], d[i + 2]), li = lum(...ink);
    if (lc < lb - 8) {
      const a = Math.max(0.15, Math.min(1, (lb - lc) / Math.max(1, lb - li)));
      d[i] = ink[0]; d[i + 1] = ink[1]; d[i + 2] = ink[2]; d[i + 3] = d[i + 3] * a;
    } else d[i + 3] = d[i + 3] * soft;
  }
  return im;
}
// Background colour models for cutBg: the median of the border (a flat colour), or one colour per row taken from columns known
// to be clear (a vertical gradient).
export function borderColour(im) {
  const R = [], G = [], B = [], { w, h, d } = im;
  const take = (x, y) => { const i = (y * w + x) * 4; R.push(d[i]); G.push(d[i + 1]); B.push(d[i + 2]); };
  for (let x = 0; x < w; x++) { take(x, 0); take(x, h - 1); } for (let y = 0; y < h; y++) { take(0, y); take(w - 1, y); }
  const med = (a) => a.sort((x, y) => x - y)[a.length >> 1];
  return [med(R), med(G), med(B)];
}
export function rowModel(im, x0, x1) {
  const { w, d } = im, rows = [];
  for (let y = 0; y < im.h; y++) {
    const R = [], G = [], B = [];
    for (let x = Math.max(0, x0); x < Math.min(w, x1); x++) { const i = (y * w + x) * 4; R.push(d[i]); G.push(d[i + 1]); B.push(d[i + 2]); }
    const med = (a) => a.sort((p, q) => p - q)[a.length >> 1];
    rows.push([med(R), med(G), med(B)]);
  }
  return (x, y) => rows[y];
}

// ---- bodies, limbs and faces between pictures ---------------------------------------------------------------------------------------
export function dilate(mask, w, h, r) {
  const out = new Uint8Array(mask);
  for (let k = 0; k < r; k++) {
    const src = new Uint8Array(out);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const p = y * w + x; if (src[p]) continue;
      if ((x > 0 && src[p - 1]) || (x < w - 1 && src[p + 1]) || (y > 0 && src[p - w]) || (y < h - 1 && src[p + w])) out[p] = 1;
    }
  }
  return out;
}
// The BODY of a character picture: its biggest connected run of fill (opaque, lighter than the line-work), holes in it filled
// (the face drawn on it), grown by `grow` px to take in its own outline. What is opaque outside it is the painted limbs.
export function bodyMask(im, { inkLum = 70, grow = 4, minA = 128 } = {}) {
  const { w, h, d } = im, fill = blank(w, h);
  for (let p = 0; p < w * h; p++) { const i = p * 4; if (d[i + 3] >= minA && lum(d[i], d[i + 1], d[i + 2]) > inkLum) fill.d[i + 3] = 255; }
  const big = parts(fill, 128)[0], m = new Uint8Array(w * h);
  for (const p of big.px) m[p] = 1;
  // fill the holes: everything the outside cannot reach
  const outside = floodBg({ w, h, d: new Uint8ClampedArray(w * h * 4).map((_, i) => (i % 4 === 3 ? (m[i >> 2] ? 255 : 0) : 0)) }, (r, g, b, a) => a === 0);
  for (let p = 0; p < w * h; p++) if (!outside[p]) m[p] = 1;
  return dilate(m, w, h, grow);
}
export function limbsOf(im, mask) {
  const o = clone(im);
  for (let p = 0; p < im.w * im.h; p++) if (mask[p]) o.d[p * 4 + 3] = 0;
  return o;
}
export function onlyMask(im, mask) {
  const o = clone(im);
  for (let p = 0; p < im.w * im.h; p++) if (!mask[p]) o.d[p * 4 + 3] = 0;
  return o;
}
// A picture's ink inside a rect, as a layer: the dark line-work only (eyes, brows, a stroke of a mouth), soft edges kept as alpha.
export function inkLayer(im, rect, { inkLum = 90, ink = [16, 16, 16], bodyLum = null } = {}) {
  const r = crop(im, rect.x, rect.y, rect.w, rect.h), out = blank(r.w, r.h);
  for (let p = 0; p < r.w * r.h; p++) {
    const i = p * 4; if (r.d[i + 3] < ALPHA_FLOOR) continue;
    const l = lum(r.d[i], r.d[i + 1], r.d[i + 2]);
    const bl = bodyLum == null ? 200 : bodyLum;
    const k = Math.max(0, Math.min(1, (bl - l) / (bl - inkLum)));
    if (k > 0.05) { out.d[i] = ink[0]; out.d[i + 1] = ink[1]; out.d[i + 2] = ink[2]; out.d[i + 3] = r.d[i + 3] * k; }
  }
  return out;
}
