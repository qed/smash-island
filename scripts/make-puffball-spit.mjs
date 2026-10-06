// ============================================================================
//  make-puffball-spit.mjs -- Puffball's four spit frames, made from her own render
// ============================================================================
// "puffball should have 3-5 frames while firing the projectile to spit it" (the owner, 2026-10-06: "like c'mon this is the 5th time
// ive asked"). Her X is a shot (RANGED_ATTACKERS.fly) and her art is ONE front-on render, so until now she spat by lunging. This cuts four
// pictures of her out of that one render -- nothing is fetched and nothing is borrowed, so they are as on-model as she is:
//
//   puffball-spit-1.png  PUFF     the cheeks puff out, the eyes squeeze, the big smile pinches to a small round mouth
//   puffball-spit-2.png  SPIT     the face turns the way she shoots, the mouth is blown wide open round and full of rainbow, the eyes shut tight (> <)
//   puffball-spit-3.png  RECOIL   kicked back: eyes wide, brows up, a small slack mouth
//   puffball-spit-4.png  SETTLE   the grin comes back, the eyes closed and pleased (^ ^)
//
// How: her own pixels are WARPED (a bulge for each cheek; the mouth, the eyes and the brows scaled and nudged in place, the fur round them
// stretching with them) and where the face has to change shape a feature is erased with her own fur colour and drawn again in her own ink
// (the black of her mouth and brows). The rainbow in the spit's mouth is her own barf's (BFDIA: the red-orange-yellow-green-blue-purple of
// File:Barf rainbow long.png, the shot she fires). Everything is done at 3x and averaged down, so no edge is harsher than hers.
// The frames are PADDED (the puffed cheeks are wider than she is) and the padding is the same on every frame, so each is drawn at the SAME
// size as the plain render; FIGHTER_ANIM.Puffball (index.html) carries the box that keeps it so.
//
//   node scripts/make-puffball-spit.mjs                       (cwd = repo root; reads and writes artifacts/V1/assets/sprites)
//   node scripts/make-puffball-spit.mjs --sheet=<file.png>    (also writes a contact sheet: the plain render and the four frames, at 1x and at game size)
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const DIR = 'artifacts/V1/assets/sprites';
const SRC = `${DIR}/puffball.png`;
const S = 3;                      // working scale
const PAD_X = 32, PAD_TOP = 0;    // the canvas is the render plus this much room each side (and none above: her feet line stays the bottom edge)
const base = PNG.sync.read(readFileSync(SRC));
const BW = base.width, BH = base.height;
const CW = BW + 2*PAD_X, CH = BH + PAD_TOP;

// her colours, measured off the render
const FUR = [255, 204, 255], INK = [0, 0, 0];
const RAINBOW = [[255, 48, 48], [255, 150, 20], [255, 228, 30], [40, 200, 70], [40, 150, 255], [150, 70, 225]];

// ---- an image is premultiplied float RGBA at S x ------------------------------------------------------------
function blank(w, h){ return { w, h, d: new Float32Array(w*h*4) }; }
function sample(im, x, y){            // x, y in image pixels (centre of pixel i is i + 0.5); bilinear, transparent outside
  const fx = x - 0.5, fy = y - 0.5, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
  const out = [0, 0, 0, 0];
  for(let j = 0; j < 2; j++) for(let i = 0; i < 2; i++){
    const xx = x0 + i, yy = y0 + j, w = (i ? tx : 1 - tx) * (j ? ty : 1 - ty);
    if(xx < 0 || yy < 0 || xx >= im.w || yy >= im.h) continue;
    const k = (yy*im.w + xx)*4;
    out[0] += im.d[k]*w; out[1] += im.d[k+1]*w; out[2] += im.d[k+2]*w; out[3] += im.d[k+3]*w;
  }
  return out;
}
function fromPng(p, offX, offY, w, h){   // the render, placed in a w x h canvas at 1x, then upsampled S x
  const one = blank(w, h);
  for(let y = 0; y < p.height; y++) for(let x = 0; x < p.width; x++){
    const i = (y*p.width + x)*4, a = p.data[i+3]/255, k = ((y + offY)*w + x + offX)*4;
    one.d[k] = p.data[i]/255*a; one.d[k+1] = p.data[i+1]/255*a; one.d[k+2] = p.data[i+2]/255*a; one.d[k+3] = a;
  }
  const up = blank(w*S, h*S);
  for(let y = 0; y < h*S; y++) for(let x = 0; x < w*S; x++){
    const s = sample(one, (x + 0.5)/S, (y + 0.5)/S), k = (y*up.w + x)*4;
    up.d[k] = s[0]; up.d[k+1] = s[1]; up.d[k+2] = s[2]; up.d[k+3] = s[3];
  }
  return up;
}
// out(x, y) = img(map(x, y)): x, y and the result are in 1x canvas units; a map that answers null leaves the pixel where it is
function warp(im, map){
  const out = blank(im.w, im.h);
  for(let y = 0; y < im.h; y++) for(let x = 0; x < im.w; x++){
    const m = map((x + 0.5)/S, (y + 0.5)/S), k = (y*im.w + x)*4;
    if(!m){ out.d[k] = im.d[k]; out.d[k+1] = im.d[k+1]; out.d[k+2] = im.d[k+2]; out.d[k+3] = im.d[k+3]; continue; }
    const s = sample(im, m[0]*S, m[1]*S);
    out.d[k] = s[0]; out.d[k+1] = s[1]; out.d[k+2] = s[2]; out.d[k+3] = s[3];
  }
  return out;
}
// ---- the warps: each returns a map for warp() ---------------------------------------------------------------
// sprite coordinates -> canvas coordinates
const cx = (x) => x + PAD_X, cy = (y) => y + PAD_TOP;
// scale the area round (x, y) by (sx, sy) -- the effect fades to nothing at the ellipse (rx, ry)
function localScale(x, y, sx, sy, rx, ry){
  const X = cx(x), Y = cy(y);
  return (px, py) => {
    const u = (px - X)/rx, v = (py - Y)/ry, r2 = u*u + v*v;
    if(r2 >= 1) return null;
    const w = (1 - r2)*(1 - r2), ex = 1 + (sx - 1)*w, ey = 1 + (sy - 1)*w;
    return [X + (px - X)/ex, Y + (py - Y)/ey];
  };
}
// move the area round (x, y) by (tx, ty), fading to nothing at the ellipse
function localShift(x, y, tx, ty, rx, ry){
  const X = cx(x), Y = cy(y);
  return (px, py) => {
    const u = (px - X)/rx, v = (py - Y)/ry, r2 = u*u + v*v;
    if(r2 >= 1) return null;
    const w = (1 - r2)*(1 - r2);
    return [px - tx*w, py - ty*w];
  };
}
// a round bulge: the area under (x, y) swells by `k` (0..1; negative sinks it) and the fur round it is pushed out of the way
function bulge(x, y, rad, k){
  const X = cx(x), Y = cy(y);
  return (px, py) => {
    const dx = px - X, dy = py - Y, r = Math.hypot(dx, dy);
    if(r >= rad || r === 0) return null;
    const q = 1 - (r/rad)*(r/rad), s = 1 - k*q*q;
    return [X + dx*s, Y + dy*s];
  };
}
// ---- drawing in her own ink, at S x -----------------------------------------------------------------------
function over(im, x, y, rgb, a){      // composite one pixel of a colour over
  const k = (y*im.w + x)*4, ia = 1 - a;
  im.d[k] = rgb[0]/255*a + im.d[k]*ia; im.d[k+1] = rgb[1]/255*a + im.d[k+1]*ia; im.d[k+2] = rgb[2]/255*a + im.d[k+2]*ia; im.d[k+3] = a + im.d[k+3]*ia;
}
// coverage of a shape given as an inside-test in SPRITE coordinates, antialiased by a 3x3 sub-sample on the S x grid
function fillShape(im, bbox, inside, rgb, alpha = 1){
  const x0 = Math.max(0, Math.floor(cx(bbox[0])*S)), x1 = Math.min(im.w - 1, Math.ceil(cx(bbox[2])*S));
  const y0 = Math.max(0, Math.floor(cy(bbox[1])*S)), y1 = Math.min(im.h - 1, Math.ceil(cy(bbox[3])*S));
  const n = 3;
  for(let y = y0; y <= y1; y++) for(let x = x0; x <= x1; x++){
    let c = 0;
    for(let j = 0; j < n; j++) for(let i = 0; i < n; i++){
      const px = (x + (i + 0.5)/n)/S, py = (y + (j + 0.5)/n)/S;
      if(inside(px - PAD_X, py - PAD_TOP)) c++;
    }
    if(c) over(im, x, y, rgb, alpha*c/(n*n));
  }
}
const distSeg = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l2 = dx*dx + dy*dy; let t = l2 ? ((px - ax)*dx + (py - ay)*dy)/l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t; return Math.hypot(px - (ax + dx*t), py - (ay + dy*t)); };
function strokePoly(im, pts, width, rgb){   // round caps and joins
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), r = width/2;
  const bbox = [Math.min(...xs) - r - 1, Math.min(...ys) - r - 1, Math.max(...xs) + r + 1, Math.max(...ys) + r + 1];
  fillShape(im, bbox, (x, y) => { for(let i = 1; i < pts.length; i++) if(distSeg(x, y, pts[i-1][0], pts[i-1][1], pts[i][0], pts[i][1]) <= r) return true; return false; }, rgb);
}
function strokeArc(im, x, y, rad, a0, a1, width, rgb){   // an arc about (x, y) from angle a0 to a1 (radians, y down)
  const pts = []; const n = 24;
  for(let i = 0; i <= n; i++){ const a = a0 + (a1 - a0)*i/n; pts.push([x + Math.cos(a)*rad, y + Math.sin(a)*rad]); }
  strokePoly(im, pts, width, rgb);
}
// paint with her fur over a patch of the render (feathered: a soft edge, so no patch shows), never outside her
function erase(im, x, y, rx, ry){
  const X = cx(x)*S, Y = cy(y)*S, RX = rx*S, RY = ry*S;
  for(let yy = Math.max(0, Math.floor(Y - RY - 2*S)); yy <= Math.min(im.h - 1, Math.ceil(Y + RY + 2*S)); yy++) for(let xx = Math.max(0, Math.floor(X - RX - 2*S)); xx <= Math.min(im.w - 1, Math.ceil(X + RX + 2*S)); xx++){
    const u = (xx + 0.5 - X)/RX, v = (yy + 0.5 - Y)/RY, r = Math.hypot(u, v);
    if(r >= 1.0) continue;
    const a = r < 0.88 ? 1 : (1 - r)/0.12;
    const k = (yy*im.w + xx)*4; if(im.d[k+3] < 0.5) continue;
    over(im, xx, yy, FUR, a);
  }
}
// the same over a box (the mouth is a D, and its corners sit outside any ellipse that fits it)
function eraseBox(im, x0, y0, x1, y1){
  const X0 = cx(x0)*S, X1 = cx(x1)*S, Y0 = cy(y0)*S, Y1 = cy(y1)*S, F = 2*S;
  for(let yy = Math.max(0, Math.floor(Y0 - F)); yy <= Math.min(im.h - 1, Math.ceil(Y1 + F)); yy++) for(let xx = Math.max(0, Math.floor(X0 - F)); xx <= Math.min(im.w - 1, Math.ceil(X1 + F)); xx++){
    const dx = Math.max(X0 - xx, 0, xx - X1), dy = Math.max(Y0 - yy, 0, yy - Y1), d = Math.hypot(dx, dy);
    if(d >= F) continue;
    const k = (yy*im.w + xx)*4; if(im.d[k+3] < 0.5) continue;
    over(im, xx, yy, FUR, 1 - d/F);
  }
}
// The mouth's black INSIDE (not its outline): the dark pixels of the mouth that are at least `rim` sprite-px from anything that is not dark.
// Painted in the six bands of her barf, slanted with the lip, it is the rainbow she is spitting.
function rainbowMouth(im, box, rim, slope){
  const x0 = Math.floor(cx(box[0])*S), x1 = Math.ceil(cx(box[2])*S), y0 = Math.floor(cy(box[1])*S), y1 = Math.ceil(cy(box[3])*S);
  const dark = (x, y) => { if(x < 0 || y < 0 || x >= im.w || y >= im.h) return false; const k = (y*im.w + x)*4; const a = im.d[k+3]; return a > 0.9 && (im.d[k] + im.d[k+1] + im.d[k+2])/(3*a) < 0.3; };
  const R = Math.round(rim*S), inside = [];
  for(let y = y0; y <= y1; y++) for(let x = x0; x <= x1; x++){
    if(!dark(x, y)) continue;
    let ok = true;
    for(let a = 0; a < 16 && ok; a++){ const t = a/16*Math.PI*2; if(!dark(Math.round(x + Math.cos(t)*R), Math.round(y + Math.sin(t)*R))) ok = false; }
    if(ok) inside.push([x, y]);
  }
  if(!inside.length) throw new Error('no mouth interior found');
  const u = inside.map(([x, y]) => (y/S) - slope*(x/S)), lo = Math.min(...u), hi = Math.max(...u);
  inside.forEach(([x, y], i) => { const t = (u[i] - lo)/(hi - lo), b = Math.min(RAINBOW.length - 1, Math.floor(t*RAINBOW.length)); over(im, x, y, RAINBOW[b], 1); });
}
// ---- the four frames -----------------------------------------------------------------------------------------
// where the features are on the render (measured: eyes at (61,77) and (115,75), brows above them, the mouth's box (56,94)-(134,168))
const LE = [61, 77], RE = [115, 75], MOUTH = [97, 131], MOUTH_BOX = [56, 94, 134, 168];
function frame(spec){
  let im = fromPng(base, PAD_X, PAD_TOP, CW, CH);
  if(spec.erase) for(const e of spec.erase) erase(im, ...e);
  if(spec.eraseBox) for(const e of spec.eraseBox) eraseBox(im, ...e);
  if(spec.draw) spec.draw(im);          // new features go on at the render's own places, THEN the warps move them with everything else
  for(const w of spec.warps) im = warp(im, w);
  return im;
}
const FRAMES = {
  // 1 PUFF: the mouth pinches to a small round o, the eyes squeeze, the brows come down, both cheeks swell
  1: { eraseBox: [[50, 88, 142, 174]],
    draw(im){ fillShape(im, [84, 112, 118, 146], (x, y) => ((x - 100)*(x - 100))/(11*11) + ((y - 128)*(y - 128))/(13*13) <= 1, INK); },
    warps: [
      localScale(LE[0], LE[1], 1.12, 0.5, 24, 30), localScale(RE[0], RE[1], 1.12, 0.5, 24, 30),
      bulge(22, 140, 62, 0.82), bulge(176, 140, 62, 0.82),
    ] },
  // 2 SPIT: the face turns the way she shoots (the render faces right), the mouth is blown wide and full of rainbow, the eyes shut tight
  2: { erase: [[LE[0], LE[1], 17, 22], [RE[0], RE[1], 16, 21]],
    draw(im){
      rainbowMouth(im, MOUTH_BOX, 4.5, -0.18);
      strokePoly(im, [[LE[0] - 8, 66], [LE[0] + 8, 78], [LE[0] - 8, 90]], 6.5, INK);       // > <
      strokePoly(im, [[RE[0] + 8, 64], [RE[0] - 8, 76], [RE[0] + 8, 88]], 6.5, INK);
    },
    warps: [
      localScale(MOUTH[0], MOUTH[1], 1.14, 1.2, 72, 68),
      localShift(98, 100, 14, 1, 84, 78),
      bulge(22, 140, 62, 0.38), bulge(176, 140, 62, 0.38),
    ] },
  // 3 RECOIL: eyes wide, brows up, the mouth small and slack
  3: { warps: [
      localScale(LE[0], LE[1], 1.3, 1.25, 28, 32), localScale(RE[0], RE[1], 1.3, 1.25, 28, 32),
      localShift(53, 42, -1, -9, 38, 24), localShift(142, 44, 1, -9, 38, 24),
      localScale(MOUTH[0], MOUTH[1], 0.6, 0.64, 64, 62), localShift(MOUTH[0], MOUTH[1], 0, 3, 50, 50),
      bulge(22, 140, 62, -0.15), bulge(176, 140, 62, -0.15),
    ] },
  // 4 SETTLE: the smile is back, the eyes closed and pleased
  4: { erase: [[LE[0], LE[1], 17, 22], [RE[0], RE[1], 16, 21]],
    draw(im){
      strokeArc(im, LE[0], LE[1] + 8, 11, Math.PI*1.12, Math.PI*1.88, 6, INK);       // ^ ^
      strokeArc(im, RE[0], RE[1] + 8, 11, Math.PI*1.12, Math.PI*1.88, 6, INK);
    },
    warps: [ localScale(MOUTH[0], MOUTH[1], 0.92, 0.9, 64, 62) ] },
};
// ---- write ---------------------------------------------------------------------------------------------------------
function toPng(im){      // box-average S x down to 1x, un-premultiply
  const w = im.w/S, h = im.h/S, out = new PNG({ width: w, height: h });
  for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){
    let r = 0, g = 0, b = 0, a = 0;
    for(let j = 0; j < S; j++) for(let i = 0; i < S; i++){ const k = ((y*S + j)*im.w + x*S + i)*4; r += im.d[k]; g += im.d[k+1]; b += im.d[k+2]; a += im.d[k+3]; }
    const n = S*S, o = (y*w + x)*4;
    if(a/n < 0.5/255){ out.data[o] = out.data[o+1] = out.data[o+2] = out.data[o+3] = 0; continue; }   // nothing but air: fully clear, like the render
    out.data[o] = Math.round(255*r/a); out.data[o+1] = Math.round(255*g/a); out.data[o+2] = Math.round(255*b/a); out.data[o+3] = Math.round(255*a/n);
  }
  return out;
}
const outs = {};
for(const k of Object.keys(FRAMES)){
  const png = toPng(frame(FRAMES[k]));
  // her left and right edges are inside the canvas: nothing of a puffed cheek is cut off by it
  for(let y = 0; y < png.height; y++) for(const x of [0, png.width - 1]) if(png.data[(y*png.width + x)*4 + 3] > 8) throw new Error(`frame ${k}: the canvas cuts her off at ${x},${y}; widen PAD_X`);
  for(const [x, y] of [[0, 0], [png.width - 1, 0], [0, png.height - 1], [png.width - 1, png.height - 1]]) if(png.data[(y*png.width + x)*4 + 3] !== 0) throw new Error(`frame ${k}: corner ${x},${y} is not clear`);
  writeFileSync(`${DIR}/puffball-spit-${k}.png`, PNG.sync.write(png));
  outs[k] = png;
  console.log(`puffball-spit-${k}.png`, png.width + 'x' + png.height);
}
const sheetArg = process.argv.find(a => a.startsWith('--sheet='));
if(sheetArg){
  // the plain render and the four frames: row 1 at 1x, row 2 at game size (x0.29, how she is drawn) enlarged 3x so the pixels can be seen
  const plain = new PNG({ width: CW, height: CH });
  for(let y = 0; y < BH; y++) for(let x = 0; x < BW; x++){ const i = (y*BW + x)*4, o = ((y + PAD_TOP)*CW + x + PAD_X)*4; for(let c = 0; c < 4; c++) plain.data[o + c] = base.data[i + c]; }
  const all = [plain, outs[1], outs[2], outs[3], outs[4]], cell = CW + 8, GAME = 0.2909, ENL = 3;
  const rowH = Math.round(CH*GAME*ENL) + 8;
  const sheet = new PNG({ width: cell*all.length, height: CH + 8 + rowH });
  for(let i = 0; i < sheet.data.length; i += 4){ sheet.data[i] = 120; sheet.data[i+1] = 170; sheet.data[i+2] = 220; sheet.data[i+3] = 255; }
  const blit = (src, ox, oy, sc, nearest) => {
    const w = Math.round(src.width*sc), h = Math.round(src.height*sc);
    for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      const sx0 = x/sc, sx1 = (x + 1)/sc, sy0 = y/sc, sy1 = (y + 1)/sc;
      for(let yy = Math.floor(sy0); yy < Math.min(src.height, Math.max(Math.floor(sy0) + 1, Math.ceil(sy1))); yy++) for(let xx = Math.floor(sx0); xx < Math.min(src.width, Math.max(Math.floor(sx0) + 1, Math.ceil(sx1))); xx++){ const i = (yy*src.width + xx)*4, al = src.data[i+3]/255; r += src.data[i]*al; g += src.data[i+1]*al; b += src.data[i+2]*al; a += al; n++; }
      if(!n || !a) continue; const al = a/n, o = ((oy + y)*sheet.width + ox + x)*4;
      sheet.data[o] = Math.round(r/a*al + sheet.data[o]*(1 - al)); sheet.data[o+1] = Math.round(g/a*al + sheet.data[o+1]*(1 - al)); sheet.data[o+2] = Math.round(b/a*al + sheet.data[o+2]*(1 - al));
    }
  };
  const game = (p) => { const w = Math.round(p.width*GAME), h = Math.round(p.height*GAME), g = new PNG({ width: w, height: h });
    for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){ let r = 0, gg = 0, b = 0, a = 0, n = 0;
      for(let yy = Math.floor(y/GAME); yy < Math.min(p.height, Math.ceil((y + 1)/GAME)); yy++) for(let xx = Math.floor(x/GAME); xx < Math.min(p.width, Math.ceil((x + 1)/GAME)); xx++){ const i = (yy*p.width + xx)*4, al = p.data[i+3]/255; r += p.data[i]*al; gg += p.data[i+1]*al; b += p.data[i+2]*al; a += al; n++; }
      const o = (y*w + x)*4; if(a > 0){ g.data[o] = Math.round(r/a); g.data[o+1] = Math.round(gg/a); g.data[o+2] = Math.round(b/a); g.data[o+3] = Math.round(255*a/n); } }
    return g; };
  all.forEach((p, i) => {
    blit(p, i*cell + 4, 4, 1);
    const g = game(p);
    // nearest-neighbour enlargement of the game-size picture
    const ox = i*cell + 4, oy = CH + 8;
    for(let y = 0; y < g.height*ENL; y++) for(let x = 0; x < g.width*ENL; x++){
      const k = ((Math.floor(y/ENL))*g.width + Math.floor(x/ENL))*4, al = g.data[k+3]/255; if(!al) continue;
      const o = ((oy + y)*sheet.width + ox + x)*4;
      for(let c = 0; c < 3; c++) sheet.data[o + c] = Math.round(g.data[k + c]*al + sheet.data[o + c]*(1 - al));
    }
  });
  writeFileSync(sheetArg.slice(8), PNG.sync.write(sheet));
  console.log('sheet', sheetArg.slice(8), sheet.width + 'x' + sheet.height);
}
