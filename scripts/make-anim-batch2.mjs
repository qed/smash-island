// ============================================================================
//  make-anim-batch2.mjs -- the picture sets of animation batch 2 ("animations should be like pb's animations", the owner, 2026-10-19)
// ============================================================================
//   node scripts/make-anim-batch2.mjs --src=<folder of the downloaded wiki files, with its manifest.json> --dec=<folder of the decoded JPEGs>
//        [--out=artifacts/V1/assets/sprites] [--only=Bomby,Needle] [--report=<file.json>]
//
// Lifering, Candle, Cammy, Yin-Yang, Leafy, Needle, Snowball, Bomby, Bubble and Teardrop each get a set of pictures for their signature
// moves, their hits, their KO and their win, the way batch 1's nine have theirs (POSE_SETS in index.html). The sources are the owner-approved
// files of smash-bal/reports/moves/anim-batch2-download-list.md: the 46 Core rows ("Core only") and the nine Season 3 files the owner brought
// back ("Close enough"), downloaded once; `--src` is that folder, and its manifest.json (read as data) maps each wiki file name to the file
// it was saved as. The three JPEGs were decoded to PNG first, pixels unchanged (pngjs reads PNG only): `--dec`, "<saved name>.png".
// Every output records which files it came from (`--report`, copied into the sprite manifests and CREDITS.md).
//
// What happens to a source, by kind (as batch 1, scripts/make-anim-batch1.mjs):
//   · a clean cut-out (a wiki "Poses" render, already transparent): sized to the fighter and trimmed; recoloured to the render where an
//     episode's light tinted it (Leafy's sprint, Bomby's angry);
//   · an EPISODE FRAME: the background keyed out by a flood from the border (the first pass's Teardrop throw and run; neither came out clean,
//     and both are drawn now);
//   · an OFFICIAL BODY with no face (Leafy's EXIT frames, Snowball's fall): the fighter's own face laid on;
//   · a FACE SWAP, for a frame cut off by its edge or half hidden behind someone (most of the episode frames: Lifering's foot run over, Candle's
//     close-ups, Cammy's KO, Leafy's smug and angry, Teardrop's angry, hurt and blep): the frame's face on the fighter's own render;
//   · a pose the show never drew, or whose only file could not be used (the download list's "drawn instead" rows; Bubble's HER JUMP.png is a
//     pencil storyboard sketch, and the two boxing-glove frames hide most of the fighter): DRAWN by bending the fighter's own render -- the
//     painted limbs taken off along the render's own limb outlines (LIMB_RIG in index.html) and drawn again where the pose has them, at the
//     render's line weight, the face redrawn in the render's ink, the body turned or squashed.
// Sizing: every picture is drawn at its fighter's pixel density (the area of its fill, or for the dark-bodied Cammy and Yin-Yang its whole
// opaque area, matched to the base render's), trimmed, and shrunk to 200px tall where taller (it keeps `k`, POSE_SETS draws it at k).
//
// Every output passes fetch-sprites.mjs's own checks (transparent, a face unless marked faceless, not near-empty) and has its sub-visible
// halo erased. The flag of each is the measured facing, except a front-facing picture keeps its fighter's, and a few are set by eye.
//
// SECOND PASS (the checker's notes on the first): a face is painted out by holeOf (its strokes grown 2-3px past their soft edges, so no ghost of
// the old line is left) and refilled from the body's own colour only (paintOne), or by part where the body has two (paintParts: Lifering's
// stripes, by the straight edge lines fitted to them; Yin-Yang's halves, by the curve between them carried under the grin; Leafy's crescent),
// or column by column where it is shaded in upright bands (paintColumns: Candle). Limbs come off a ball without a stub (limbOffBall). Teardrop's
// throw and run are drawn; Bomby angry made neutral grey with his rope's tan fuse; Bubble's stance given her film's alpha; Candle's laugh given
// her flame back, and her flabbergasted frame dropped.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import * as L from './anim-pose-lib.mjs';
import { analyse, verdict, clean } from './fetch-sprites.mjs';
import { PNG } from 'pngjs';
import os from 'node:os';
try { os.setPriority(0, os.constants.priority.PRIORITY_LOW); } catch (e) {}   // idle class: this is a background job

const flag = (k) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : ''; };
const SRC = flag('src'), DEC = flag('dec'), OUT = flag('out') || 'artifacts/V1/assets/sprites', ONLY = flag('only') ? flag('only').split(',') : null;
const REPORT = flag('report');
if (!SRC || !DEC) { console.error('usage: node scripts/make-anim-batch2.mjs --src=<downloads> --dec=<decoded JPEGs>'); process.exit(1); }
const SPR = 'artifacts/V1/assets/sprites';
const BASE = { Lifering: 'lifering.png', Candle: 'candle.png', Cammy: 'cammy.png', 'Yin-Yang': 'yin-yang.png', Leafy: 'leafy.png', Needle: 'needle.png',
  Snowball: 'snowball.png', Bomby: 'bomby.png', Bubble: 'bubble.png', Teardrop: 'teardrop.png' };
const II = new Set(['Lifering', 'Candle', 'Cammy', 'Yin-Yang']);
const WIKI = (f) => II.has(f) ? 'inanimateinsanity' : 'battlefordreamisland';
// The renders' own flags (SPRITES): a front-facing pose keeps its fighter's. None of the ten is flipped.
const BASE_FLIP = {};
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// The downloads: wiki file name -> the file it was saved as (manifest.json, data only).
const MAN = JSON.parse(readFileSync(join(SRC, 'manifest.json'), 'utf8'));
const SAVED = Object.fromEntries(MAN.map((r) => [r.name, r.file]));
function S(name) {   // a downloaded file by its wiki name (a JPEG through its decoded PNG)
  const f = SAVED[name]; if (!f) throw new Error(`not downloaded: ${name}`);
  return /\.jpe?g$/i.test(f) ? L.load(join(DEC, f.replace(/\.jpe?g$/i, '.png'))) : L.load(join(SRC, f));
}
const B = (fighter) => L.load(join(SPR, BASE[fighter]));
const SPRITE = (file) => L.load(join(SPR, file));
const rows = [];

// The painted limbs of each render, as LIMB_RIG in index.html traced them (polygons in the render's own pixels): the drawn poses take a limb
// off along its own outline before drawing it somewhere else.
const RIG = (() => {
  const html = readFileSync('artifacts/V1/index.html', 'utf8'), out = {};
  for (const name of Object.keys(BASE)) {
    const m = html.match(new RegExp(`^  "${name.replace(/[-]/g, '\\-')}": (\\{W:\\d+,H:\\d+,arms:.*\\]\\}),?\\s*$`, 'm'));
    if (!m) continue;
    out[name] = JSON.parse(m[1].replace(/([{,])(\w+):/g, '$1"$2":').replace(/'/g, '"'));
  }
  return out;
})();
const pairs = (flat) => { const o = []; for (let i = 0; i < flat.length; i += 2) o.push([flat[i], flat[i + 1]]); return o; };
// Take a painted limb off a render (the polygon grown by a pixel or two, so its anti-aliased edge goes too).
function eraseLimb(im, limb, grow = 1.5) {
  const P = pairs(limb.poly), cx = P.reduce((a, p) => a + p[0], 0) / P.length, cy = P.reduce((a, p) => a + p[1], 0) / P.length;
  L.erasePoly(im, P.map(([x, y]) => { const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1; return [x + dx / d * grow, y + dy / d * grow]; }));
  return im;
}
const INK = [16, 16, 16];
// A painted arm or leg drawn again: a round-capped stroke along `pts` at the render's line weight, a hand (or foot) blob at its end.
function limb(im, pts, w, hand = 0, foot = null) {
  L.stroke(im, pts, w, INK);
  const e = pts[pts.length - 1];
  if (hand) L.fillEllipse(im, e[0], e[1], hand, hand * 0.9, INK);
  if (foot) L.fillEllipse(im, e[0] + foot[0], e[1] + foot[1], foot[2], foot[3], INK);
  return im;
}

// The base render's fill area, and a pose scaled so its fill matches it (times k), then trimmed. `opaque`: match the whole opaque area
// instead (Cammy and Yin-Yang are half or all near-black, which fillArea, made to skip line-work, would not count).
const baseArea = {};
const opaqueArea = (im) => { let n = 0; for (let i = 3; i < im.d.length; i += 4) if (im.d[i] >= 128) n++; return n; };
function toBase(im, fighter, k = 1, opaque = false) {
  const key = fighter + (opaque ? ':o' : '');
  if (!baseArea[key]) baseArea[key] = opaque ? opaqueArea(B(fighter)) : L.fillArea(B(fighter));
  const s = Math.sqrt(baseArea[key] / (opaque ? opaqueArea(im) : L.fillArea(im))) * k;
  return L.trim(L.scaleBy(L.trim(im, 0), s), 2);
}
// Lay a face layer on a body: its centre (fx, fy) goes to (x, y), scaled, squeezed across, turned; only where the body is (clip).
function putFace(body, face, x, y, { s = 1, squeeze = 1, rot = 0, fx = face.w / 2, fy = face.h / 2, clip = true, mirror = false } = {}) {
  const f = s < 0.8 ? L.scaleBy(face, s) : face, k = s < 0.8 ? 1 : s, r = s < 0.8 ? s : 1;
  return L.paste(body, f, { x, y, ox: fx * r, oy: fy * r, sx: k * squeeze * (mirror ? -1 : 1), sy: k, rot, mode: clip ? 'atop' : 'over' });
}

// Every picture is at most 200px tall, like the renders: a pose that comes out taller is shrunk to 200 and keeps `k`, its pixels per pixel
// of the fighter's own render, so the game still draws it at the fighter's size (POSE_SETS: imgH = q*h/k).
function emit(fighter, key, im, meta) {
  const file = `${slug(fighter)}-${key}.png`;
  let k = meta.k || 1;
  if (im.h > 200) { const s = 200 / im.h; im = L.resize(im, Math.max(1, Math.round(im.w * s)), 200); k *= s; }
  const png = new PNG({ width: im.w, height: im.h }); png.data = Buffer.from(im.d);
  const a = analyse(png), bad = verdict(a);
  const cleaned = clean(png);
  if (bad.length && !meta.faceless) throw new Error(`${file}: ${bad.join('; ')}`);
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, file), PNG.sync.write(png, { colorType: 6 }));
  const front = Math.abs(a.facing) < 0.03;
  const flip = meta.flip != null ? meta.flip : (front ? !!BASE_FLIP[fighter] : a.facing < 0);
  const row = { name: `${fighter} (${key})`, fighter, key, slug: slug(`${fighter} (${key})`), ok: true, file, width: a.w, height: a.h, k: +k.toFixed(4),
    facing: +a.facing.toFixed(3), flip, inkPixels: a.inkPixels, cleanedHaloPixels: cleaned, coverage: +a.coverage.toFixed(3),
    wiki: WIKI(fighter), sources: meta.src, method: meta.method, note: meta.note || '' };
  if (bad.length) row.checkNote = bad.join('; ');
  rows.push(row);
  console.log(`  ${file.padEnd(34)} ${String(a.w).padStart(3)}x${a.h} k${k.toFixed(3)}  facing ${a.facing.toFixed(3).padStart(6)}${row.flip ? ' (flip)' : ''}  ink ${a.inkPixels}  ${meta.method}`);
}

const padR = (r, p) => ({ x: r.x - p, y: r.y - p, w: r.w + p * 2, h: r.h + p * 2 });
// Paint a render's face out: every pixel `kill` marks inside each rect refilled from the body round it (paintOut). `snap`: a body of a few
// flat colours (Lifering's white and red stripes): each refilled pixel takes the nearest of them, so a stripe's edge stays sharp where the
// fill would have smeared it.
function blankFace(base, rects, kill, snap = null, see = null) {   // see: a see-through body ({ minA, alpha: true }, paintOut's)
  const im = L.clone(base), hit = [];
  for (const r of rects) L.paintOut(im, r, (x, y, R, G, Bb, A) => { const k = kill(R, G, Bb, x, y); if (k) hit.push((y * im.w + x) * 4); return k; }, 400, see || {});
  if (see && see.soften) {   // a shaded body (Teardrop's water): the fill and a band round it blurred, so the fill fades into the shading round it
    const m = new Uint8Array(im.w * im.h); for (const i of hit) m[i / 4] = 1;
    const band = L.dilate(m, im.w, im.h, 3), bl = L.blur(im, see.soften);
    for (let p = 0; p < im.w * im.h; p++) if (band[p] && im.d[p * 4 + 3] >= L.ALPHA_FLOOR) for (let c = 0; c < 3; c++) im.d[p * 4 + c] = bl.d[p * 4 + c];
  }
  if (typeof snap === 'function') { const set = new Set(hit); for (const i of hit) { const c = snap((i / 4) % im.w, Math.floor(i / 4 / im.w), im, set); if (c) { im.d[i] = c[0]; im.d[i + 1] = c[1]; im.d[i + 2] = c[2]; } } return im; }
  if (snap) for (const i of hit) {
    let best = snap[0], bd = 1e9;
    for (const c of snap) { const d = (im.d[i] - c[0]) ** 2 + (im.d[i + 1] - c[1]) ** 2 + (im.d[i + 2] - c[2]) ** 2; if (d < bd) { bd = d; best = c; } }
    im.d[i] = best[0]; im.d[i + 1] = best[1]; im.d[i + 2] = best[2];
  }
  return im;
}
// A face lifted off a picture whose body under it is one colour (liftFace: its strokes and all they enclose), optionally only the parts
// `keep` accepts (not a prop or another character that strayed into the rect), and only those inside the rect (trimEdges).
function lift(src, rect, { tol = 70, body = null, keep = null, trimEdges = false } = {}) {
  const face = L.liftFace(src, rect, body || L.bodyColour(src, padR(rect, 10)), tol);
  if (keep) for (let i = 0; i < face.d.length; i += 4) if (face.d[i + 3] && !keep(face.d[i], face.d[i + 1], face.d[i + 2])) face.d[i + 3] = 0;
  if (trimEdges) L.keepParts(face, (pt) => pt.box.x > 0 && pt.box.y > 0 && pt.box.x + pt.box.w < face.w && pt.box.y + pt.box.h < face.h);
  return face;
}
// The INK of a picture inside a rect (its black line-work only, alpha by how dark), for a face drawn across a body of several colours
// (Lifering's red and white stripes) where liftFace's one body colour cannot tell a stroke from a stripe.
function inkOf(src, rect, { lo = 40, hi = 95, sat = 70, gain = 1 } = {}) {   // gain: a soft line (a small or blurred frame) darkened to the render's ink
  const r = L.crop(src, rect.x, rect.y, rect.w, rect.h), out = L.blank(r.w, r.h);
  for (let p = 0; p < r.w * r.h; p++) {
    const i = p * 4; if (r.d[i + 3] < L.ALPHA_FLOOR) continue;
    const l = L.lum(r.d[i], r.d[i + 1], r.d[i + 2]), s = Math.max(r.d[i], r.d[i + 1], r.d[i + 2]) - Math.min(r.d[i], r.d[i + 1], r.d[i + 2]);
    if (s > sat && l > lo) continue;
    const a = Math.max(0, Math.min(1, (hi - l) / (hi - lo) * gain));
    if (a > 0.04) { out.d[i] = INK[0]; out.d[i + 1] = INK[1]; out.d[i + 2] = INK[2]; out.d[i + 3] = r.d[i + 3] * a; }
  }
  return out;
}
// A face as its INK and its WHITES only (eyes, teeth): for a face lifted off an episode frame whose light shades the body under it, where
// liftFace's flood stops at every shadow and would carry patches of the frame's body along. Whites are kept by how light they are.
function faceOf(src, rect, { lo = 40, hi = 100, sat = 70, whites = true, wlo = 175, whi = 225, extra = null, gain = 1 } = {}) {
  const out = inkOf(src, rect, { lo, hi, sat, gain }), r = L.crop(src, rect.x, rect.y, rect.w, rect.h);
  if (extra) for (let p = 0; p < r.w * r.h; p++) { const i = p * 4; if (r.d[i + 3] >= L.ALPHA_FLOOR && extra(r.d[i], r.d[i + 1], r.d[i + 2])) for (let c = 0; c < 4; c++) out.d[i + c] = r.d[i + c]; }   // (a tongue: kept as it is)
  if (whites) for (let p = 0; p < r.w * r.h; p++) {
    const i = p * 4, l = L.lum(r.d[i], r.d[i + 1], r.d[i + 2]), s = Math.max(r.d[i], r.d[i + 1], r.d[i + 2]) - Math.min(r.d[i], r.d[i + 1], r.d[i + 2]);
    if (r.d[i + 3] < L.ALPHA_FLOOR || s > 45 || l < wlo) continue;
    const a = Math.min(1, (l - wlo) / (whi - wlo)), oa = out.d[i + 3] / 255, na = a + oa * (1 - a);
    for (let c = 0; c < 3; c++) out.d[i + c] = (r.d[i + c] * a + out.d[i + c] * oa * (1 - a)) / Math.max(1e-6, na);
    out.d[i + 3] = na * 255;
  }
  return out;
}
// A FACE SWAP (batch 1's): the fighter's render with its face painted out and the frame's face laid on in its place.
function swapFace(base, bRect, src, sRect, { scale = 1, rot = 0, dx = 0, dy = 0, tol = 60, stol = 70, sbody = null, mirror = false, keep = null, trimEdges = false } = {}) {
  const bc = L.bodyColour(base, padR(bRect, 8)), im = blankFace(base, [bRect], (r, g, b) => Math.hypot(r - bc[0], g - bc[1], b - bc[2]) > tol);
  const face = lift(src, sRect, { tol: stol, body: sbody, keep, trimEdges });
  putFace(im, face, bRect.x + bRect.w / 2 + dx, bRect.y + bRect.h / 2 + dy, { s: scale, rot, mirror });
  return im;
}
// A picture turned by `deg` about its middle, on a canvas big enough for it, trimmed.
function turn(im, deg) {
  const a = deg * Math.PI / 180, D = Math.ceil(Math.hypot(im.w, im.h)) + 4, o = L.blank(D, D);
  L.paste(o, im, { x: D / 2, y: D / 2, ox: im.w / 2, oy: im.h / 2, rot: a });
  return L.trim(o, 2);
}
// An OPEN MOUTH in the shows' style, drawn: a dark inside, a tongue at the bottom, a row of teeth at the top, a black outline.
function mouth(im, cx, cy, w, h, { inside = [92, 14, 36], tongue = [238, 128, 150], teeth = true, line = 4, rot = 0, tongueAt = 0.1 } = {}) {
  const M = Math.ceil(Math.max(w, h) + line * 2 + 4), lay = L.blank(M * 2, M * 2), c = M;
  L.fillEllipse(lay, c, c, w / 2, h / 2, inside);
  if (tongue) L.fillEllipse(lay, c + w * tongueAt, c + h * 0.36, w * 0.3, h * 0.3, tongue, 0, 1, 'atop');
  if (teeth) L.fillEllipse(lay, c, c - h * 0.62, w * 0.62, h * 0.4, [250, 250, 250], 0, 1, 'atop');
  L.stroke(lay, L.arc(c, c, w / 2, h / 2, 0, Math.PI * 2, 56), line, INK);
  L.paste(im, lay, { x: cx, y: cy, ox: c, oy: c, rot });
  return im;
}
// Closed eyes, drawn: arcs bowed up (^ ^, happy) or down (calm, eyes shut), or squeezed shut ("> <").
function shutEyes(im, cx, cy, gap, r, w, { up = true, rot = 0 } = {}) {
  for (const s of [-1, 1]) {
    const x = cx + s * gap / 2 * Math.cos(rot), y = cy + s * gap / 2 * Math.sin(rot);
    L.stroke(im, L.arc(x, y, r, r * 0.8, up ? Math.PI * 1.08 + rot : 0.08 + rot, up ? Math.PI * 1.92 + rot : Math.PI * 0.92 + rot, 16), w, INK);
  }
  return im;
}
function squeezeEyes(im, cx, cy, gap, size, wdt) {
  for (const s of [-1, 1]) { const x = cx + s * gap / 2, d = -s;   // the point of each chevron faces the middle
    L.stroke(im, [[x - d * size * 0.55, cy - size * 0.55], [x + d * size * 0.45, cy], [x - d * size * 0.55, cy + size * 0.55]], wdt, INK); }
  return im;
}
// Every pixel a predicate accepts, as flood seeds.
function allWhere(im, pred) { const o = []; for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) { const i = (y * im.w + x) * 4; if (im.d[i + 3] > 0 && pred(im.d[i], im.d[i + 1], im.d[i + 2], x, y)) o.push([x, y]); } return o; }

// ---- the second pass (the checker's notes on the first): holes grown past a line's soft edge, bodies of two colours painted by part --------
const c01 = (v) => Math.max(0, Math.min(1, v));
// THE HOLE a face leaves: every pixel `kill(r, g, b, x, y)` marks inside the rects, grown by `grow` px over what `mayGrow(x, y)` allows (an outline
// or a rim it must not eat into is left out), so the soft edge of an old line goes with it and leaves no ghost.
function holeOf(im, rects, kill, grow = 2, mayGrow = () => true) {
  const m = new Uint8Array(im.w * im.h);
  for (const r of rects) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) {
    if (x < 0 || y < 0 || x >= im.w || y >= im.h) continue;
    const i = (y * im.w + x) * 4; if (im.d[i + 3] < L.ALPHA_FLOOR) continue;
    if (kill(im.d[i], im.d[i + 1], im.d[i + 2], x, y)) m[y * im.w + x] = 1;
  }
  if (grow) { const g = L.dilate(m, im.w, im.h, grow); for (let p = 0; p < m.length; p++) if (g[p] && !m[p] && im.d[p * 4 + 3] >= L.ALPHA_FLOOR && mayGrow(p % im.w, Math.floor(p / im.w))) m[p] = 1; }
  return m;
}
// PAINT A HOLE BY PARTS, for a body of two colours split by a known line (Lifering's stripes, Yin-Yang's halves): each hole pixel is `part(x, y)`
// of colour 1 and the rest of colour 0 (soft across the line: anti-aliased), and each colour is diffused in only from the pixels round the hole
// that `seed(r, g, b, x, y)` says are that colour (0, 1, or null for neither: line-work, a rim) -- so a stripe's shading carries in and its edge
// stays where the line puts it, never where a fill smeared it. `alpha`: a see-through body's alpha diffused in as well (else kept).
function paintParts(im, hole, part, seed, { passes = 500, alpha = false } = {}) {
  const { w, d } = im, N = w * im.h, list = [];
  for (let p = 0; p < N; p++) if (hole[p]) list.push(p);
  const field = (cls) => {
    const v = new Float64Array(N * 4).fill(-1);
    for (let p = 0; p < N; p++) if (!hole[p] && d[p * 4 + 3] >= 120 && seed(d[p * 4], d[p * 4 + 1], d[p * 4 + 2], p % w, Math.floor(p / w)) === cls) for (let c = 0; c < 4; c++) v[p * 4 + c] = d[p * 4 + c];
    for (let it = 0; it < passes; it++) for (const p of list) {
      let n = 0, R = 0, G = 0, B = 0, A = 0; const x = p % w;
      for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p - w, p + w]) { if (q < 0 || q >= N || v[q * 4] < 0) continue; R += v[q * 4]; G += v[q * 4 + 1]; B += v[q * 4 + 2]; A += v[q * 4 + 3]; n++; }
      if (n) { v[p * 4] = R / n; v[p * 4 + 1] = G / n; v[p * 4 + 2] = B / n; v[p * 4 + 3] = A / n; }
    }
    return v;
  };
  const v0 = field(0), v1 = field(1);
  for (const p of list) {
    const t = part(p % w, Math.floor(p / w));
    for (let c = 0; c < (alpha ? 4 : 3); c++) { const a = v0[p * 4 + c], b = v1[p * 4 + c]; d[p * 4 + c] = a < 0 ? (b < 0 ? d[p * 4 + c] : b) : b < 0 ? a : a * (1 - t) + b * t; }
  }
  return im;
}
// A ONE-COLOUR body's hole (a leaf, a drop, a candle): paintParts with one part, seeded by `seed(r, g, b, x, y) -> true` (its fill, not its line-work).
const paintOne = (im, hole, seed, opt) => paintParts(im, hole, () => 0, (r, g, b, x, y) => (seed(r, g, b, x, y) ? 0 : null), opt);
// A body SHADED IN UPRIGHT BANDS (Candle's wax): each hole pixel takes the colour of its own column, from the nearest pixels above and below it
// that `seed(r, g, b)` accepts (within `reach`), weighted by nearness, so a band's edge stays a straight upright line; what no column reaches
// is diffused (paintOne).
function paintColumns(im, hole, seed, reach = 40) {
  const { w, h, d } = im, out = new Float64Array(w * h * 3).fill(-1), ok = (p) => !hole[p] && d[p * 4 + 3] >= 200 && seed(d[p * 4], d[p * 4 + 1], d[p * 4 + 2]);
  const rest = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) {
    if (!hole[p]) continue;
    const x = p % w, y = Math.floor(p / w); let up = -1, dn = -1;
    for (let k = 1; k <= reach && up < 0; k++) { if (y - k < 0) break; const q = p - k * w; if (ok(q)) up = k; else if (!hole[q]) break; }   // (an outline ends the band)
    for (let k = 1; k <= reach && dn < 0; k++) { if (y + k >= h) break; const q = p + k * w; if (ok(q)) dn = k; else if (!hole[q]) break; }
    if (up < 0 && dn < 0) { rest[p] = 1; continue; }
    const wu = up < 0 ? 0 : 1 / up, wd = dn < 0 ? 0 : 1 / dn;
    for (let c = 0; c < 3; c++) out[p * 3 + c] = ((up < 0 ? 0 : d[(p - up * w) * 4 + c] * wu) + (dn < 0 ? 0 : d[(p + dn * w) * 4 + c] * wd)) / (wu + wd);
  }
  for (let p = 0; p < w * h; p++) if (out[p * 3] >= 0) for (let c = 0; c < 3; c++) d[p * 4 + c] = out[p * 3 + c];
  return paintOne(im, rest, seed);
}
// A ball's circle (Yin-Yang's rim): fitted to the outer edge of its opaque pixels along rays from a guessed centre, skipping the rays a limb crosses.
function fitCircle(im, gx, gy, skip = () => false) {
  const pts = [];
  for (let k = 0; k < 360; k += 2) {
    const a = k * Math.PI / 180; if (skip(a)) continue;
    let r = 0; for (let t = 0; t < Math.max(im.w, im.h); t += 0.5) { const x = Math.round(gx + Math.cos(a) * t), y = Math.round(gy + Math.sin(a) * t); if (x < 0 || y < 0 || x >= im.w || y >= im.h) break; if (im.d[(y * im.w + x) * 4 + 3] >= 128) r = t; }
    pts.push([gx + Math.cos(a) * r, gy + Math.sin(a) * r]);
  }
  // algebraic least squares (Kasa): x^2 + y^2 + D x + E y + F = 0
  let Sxx = 0, Sxy = 0, Syy = 0, Sx = 0, Sy = 0, Sxz = 0, Syz = 0, Sz = 0; const n = pts.length;
  for (const [x, y] of pts) { const z = x * x + y * y; Sxx += x * x; Sxy += x * y; Syy += y * y; Sx += x; Sy += y; Sxz += x * z; Syz += y * z; Sz += z; }
  const M = [[Sxx, Sxy, Sx], [Sxy, Syy, Sy], [Sx, Sy, n]], V = [-Sxz, -Syz, -Sz];
  const det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D0 = det(M), sol = [0, 1, 2].map((j) => det(M.map((row, i) => row.map((v, c) => (c === j ? V[i] : v)))) / D0);
  const cx = -sol[0] / 2, cy = -sol[1] / 2;
  return { cx, cy, R: Math.sqrt(cx * cx + cy * cy - sol[2]) };
}
// A limb's outline (LIMB_RIG's polygon) as a mask, grown by `grow` px.
function polyMaskOf(w, h, poly, grow = 0) {
  const m = L.blank(w, h); for (let i = 3; i < m.d.length; i += 4) m.d[i] = 255; L.polyCut(m, pairs(poly));
  return L.dilate(new Uint8Array(w * h).map((_, q) => (m.d[q * 4 + 3] > 0 ? 1 : 0)), w, h, grow);
}
// TAKE A LIMB OFF A BALL cleanly: everything outside the circle within `reach` px of the limb's outline goes, and the rim where it was joined is
// painted again from the rim on either side of the join at the same distance from the centre (so no stub of the old limb is left on it).
function limbOffBall(im, limb, circ, reach = 5) {
  const P = pairs(limb.poly), m = L.blank(im.w, im.h);
  for (let i = 0; i < m.d.length; i += 4) m.d[i + 3] = 255;
  L.polyCut(m, P);
  const inPoly = new Uint8Array(im.w * im.h); for (let p = 0; p < inPoly.length; p++) inPoly[p] = m.d[p * 4 + 3] > 0 ? 1 : 0;
  const zone = L.dilate(inPoly, im.w, im.h, reach), { cx, cy, R } = circ, src = L.clone(im);
  for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) {
    const p = y * im.w + x; if (!zone[p]) continue;
    const dd = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
    if (dd > R + 1.5) { im.d[p * 4 + 3] = 0; continue; }
    if (dd < R - 7) continue;
    const a = Math.atan2(y + 0.5 - cy, x + 0.5 - cx), acc = [0, 0, 0, 0]; let n = 0;
    for (const sgn of [-1, 1]) for (let s = 2; s < 60; s++) {
      const b = a + sgn * s / dd, X = Math.floor(cx + Math.cos(b) * dd), Y = Math.floor(cy + Math.sin(b) * dd);
      if (X < 0 || Y < 0 || X >= im.w || Y >= im.h || zone[Y * im.w + X]) continue;
      for (let c = 0; c < 4; c++) acc[c] += src.d[(Y * im.w + X) * 4 + c]; n++; break;
    }
    if (n) for (let c = 0; c < 4; c++) im.d[p * 4 + c] = acc[c] / n;
  }
  return im;
}

// ---- LIFERING (Inanimate Insanity) -------------------------------------------------------------------------------------------------------
// His render is the 2024 Pose set's. We've Got a Sinker! is a whistle and then the dive (the dive picture already in the game); Proper Flying
// Formation is that dive tilted up (drawn, as the plan said); First Aid keeps its picture ("Keep them"); the foot run over (S4E1) is his hurt;
// his KO is drawn (LiferingEliminated.png, the Season 3 file the owner brought back, has the boxing glove and its burst over most of him, so
// it cannot be cut out -- as with Goo's in batch 1); his win is the other 2024 Pose (Lifering2024PoseAlt.png, the set his render is from).
// What a drawn outline closes in, inside a rect: everything the rect's border cannot reach without crossing the line-work (`isLine`).
function enclosed(im, rect, isLine) {
  const r = L.crop(im, rect.x, rect.y, rect.w, rect.h);
  const out = L.floodBg(r, (R, G, Bb, A) => A < L.ALPHA_FLOOR || !isLine(R, G, Bb));
  return (x, y) => { const xx = x - rect.x, yy = y - rect.y; if (xx < 0 || yy < 0 || xx >= rect.w || yy >= rect.h) return false;
    const i = (yy * rect.w + xx) * 4; return !out[yy * rect.w + xx] && !isLine(r.d[i], r.d[i + 1], r.d[i + 2]); };
}
const LIFERING_EYES = { x: 80, y: 14, w: 78, h: 42 }, LIFERING_MOUTH = { x: 80, y: 114, w: 114, h: 56 };
function lifering() {
  const F = 'Lifering', base = B(F);
  // his body under his face is white or one of two reds; his face's strokes and what his grin closes in are painted out (below)
  // (the inside of his grin is white like the ring: what its outline closes in goes too, or it would stay as white islands on the stripes)
  // (and the grey rims of the hole and of the ring's outer edge, the only grey next to the clear, stay)
  const inGrin = enclosed(base, LIFERING_MOUTH, (r, g, b) => L.lum(r, g, b) < 120);
  const nearClear = (x, y) => { for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) { const X = x + dx, Y = y + dy;
    if (X < 0 || Y < 0 || X >= base.w || Y >= base.h || base.d[(Y * base.w + X) * 4 + 3] < L.ALPHA_FLOOR) return true; } return false; };
  const rim = (r, g, b, x, y) => L.lum(r, g, b) > 105 && L.lum(r, g, b) < 236 && Math.max(r, g, b) - Math.min(r, g, b) < 50 && nearClear(x, y);
  // (second pass) THE STRIPES PAINTED BACK BY LINE. His stripes are not rays from one centre (the ring is seen at an angle), so the first pass's
  // ray-from-one-centre snap cut their edges straight down and left white blocks across the red. Each edge his face lies on is a straight line, fitted to its
  // visible red|white edge pixels in his render (scratch fit, total least squares, mean residual under half a pixel): the eyes sit on the top
  // white stripe and the top-right red one (D); the grin on the left white, the lower-left red (A, B), the bottom white and the lower-right red
  // (C). A hole pixel takes its stripe from the lines (anti-aliased across them), its colour diffused in from that stripe only, so the shading
  // carries; only the strokes and what the grin closes in are taken out (grown 2px past their soft edges), never the grey rims of the hole and
  // of the ring's outer edge, nor the dark red outline (the first pass's rect took those too: the square cut at the lower right).
  const LINE = { A: [79.4, 131.1, 0.708, -0.706, 1], B: [104.4, 161.0, 0.199, -0.980, 1], C: [167.5, 141.0, 0.706, 0.708, -1], D: [129.6, 33.3, 0.196, -0.981, 1] };
  const sd = (k, x, y) => { const [px, py, ux, uy, o] = LINE[k]; return o * ((x + 0.5 - px) * -uy + (y + 0.5 - py) * ux); };
  const redness = (x, y) => { if (y < 80) return c01(0.5 + sd('D', x, y));
    const fA = c01(0.5 + sd('A', x, y)), fB = c01(0.5 + sd('B', x, y)), fC = c01(0.5 + sd('C', x, y)); return fA * (1 - fB) + fB * fC; };
  const stripe = (r, g, b) => r > 170 && g < 120 && b < 130 ? 1 : (L.lum(r, g, b) > 205 && Math.max(r, g, b) - Math.min(r, g, b) < 40 ? 0 : null);
  const nearClear3 = (x, y) => { for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const X = x + dx, Y = y + dy;
    if (X < 0 || Y < 0 || X >= base.w || Y >= base.h || base.d[(Y * base.w + X) * 4 + 3] < L.ALPHA_FLOOR) return true; } return false; };
  const keepEdge = (x, y) => !nearClear3(x, y);   // (a hole grows over neither the grey rims nor the dark red outline: both lie within 3px of the clear)
  const stroke = (r, g, b) => L.lum(r, g, b) < 120 && Math.max(r, g, b) - Math.min(r, g, b) < 70;   // (black ink: not the dark red outline)
  const byLine = (im, rects, kill) => paintParts(im, holeOf(im, rects, kill, 3, keepEdge), redness, stripe);
  const noMouth = byLine(L.clone(base), [LIFERING_MOUTH], (r, g, b, x, y) => (stroke(r, g, b) || inGrin(x, y)) && !rim(r, g, b, x, y));
  const noEyes = (im) => byLine(L.clone(im), [LIFERING_EYES], (r, g, b, x, y) => stroke(r, g, b) && !rim(r, g, b, x, y));
  // THE WHISTLE (the Sinker's wind-up, drawn): his eyes as they are, his grin painted out, a small round "o" round the mouthpiece of a silver
  // whistle, the chamber out in front, the way the game's own drawn whistle has it (the old wind-up overlay's colours).
  { const im = L.clone(noMouth), mx = 150, my = 140;
    L.fillEllipse(im, mx, my, 9, 8, [92, 14, 36]); L.stroke(im, L.arc(mx, my, 9, 8, 0, Math.PI * 2, 32), 3.4, INK);
    const silver = [201, 206, 214];
    L.stroke(im, [[mx + 2, my], [mx + 20, my - 1]], 9, INK); L.stroke(im, [[mx + 3, my], [mx + 19, my - 1]], 5, silver);   // the mouthpiece
    L.fillEllipse(im, mx + 30, my - 1, 13, 12, INK); L.fillEllipse(im, mx + 30, my - 1, 10.5, 9.5, silver);               // the chamber
    L.fillEllipse(im, mx + 27, my - 5, 3.5, 2.5, [250, 250, 250]);                                                         // its shine
    emit(F, 'whistle', L.trim(im, 2), { src: ['lifering.png'], method: 'drawn: his own render, his grin turned to an "o" round a whistle (no show file)' }); }
  // PROPER FLYING FORMATION (drawn, as the plan said): the dive picture tilted up into the jump.
  emit(F, 'flying', turn(SPRITE('lifering-dive.png'), -32), { src: ['lifering-dive.png'], method: 'drawn: his dive picture tilted up, as the plan said' });
  // HURT: his foot run over (S4E1). The frame has his Season 4 safety vest across him, a car wheel on his foot and the hole of the ring showing
  // the street, so it is not cut out: his squeezed-shut eyes ("> <" under their brows) are lifted off it as ink and laid on his render, and his
  // open scream, crossed in the frame by the vest's strap and his own leg, is drawn where his grin was.
  { const src = S('Lifering gets his foot run over.png'), eyes = inkOf(src, { x: 195, y: 64, w: 152, h: 106 }, { lo: 40, hi: 100 });
    L.keepParts(eyes, (pt) => pt.n > 40);   // (the eyes and brows only, not the faint specks of the street round them)
    const im = noEyes(noMouth);
    putFace(im, eyes, 118, 37, { s: 0.5 });
    mouth(im, 142, 144, 50, 38, { line: 4.2 });
    emit(F, 'hurt', L.trim(im, 2), { src: ['Lifering gets his foot run over.png (his squeezed-shut eyes)', 'lifering.png'], method: 'face swap: his eyes (an episode frame) on his own render, his scream drawn' }); }
  // KO (drawn): turned over, eyes shut tight, a small slack mouth.
  { const im = noEyes(noMouth);
    squeezeEyes(im, 118, 36, 40, 14, 4.2);
    mouth(im, 142, 142, 26, 20, { teeth: false, line: 3.6 });
    emit(F, 'ko', turn(im, 24), { src: ['lifering.png'], method: 'drawn: his own render turned over, eyes squeezed shut and mouth open (LiferingEliminated.png hides him behind the glove)' }); }
  // WIN: the other picture of the 2024 Pose set (pointing up, beaming).
  emit(F, 'win', toBase(S('Lifering2024PoseAlt.png'), F), { src: ['Lifering2024PoseAlt.png'], method: 'cut-out (wiki pose)' });
}

// ---- CANDLE (Inanimate Insanity) ---------------------------------------------------------------------------------------------------------
// Inner-Flame and the flame going out keep their pictures ("Keep them"). The owner brought her Season 3 cut-outs back as the picks ("Close
// enough"): mad for the smash, scared for a hit, laughing to win, dead for a KO. The Season 4 frames downloaded with them lead into each:
// "this is maddening" (S4E3) winds the smash up, flabbergasted (S4E1) is the first moment of a hit, the giggle at Cheesy (S4E2) comes before
// the laugh. They are close-ups or have others in them, so their faces go on her render. Crystal Chime is drawn.
const CANDLE_FACE = { x: 20, y: 100, w: 50, h: 52 };
function candle() {
  const F = 'Candle', base = B(F);
  // (Second pass.) Her face painted out: its black strokes (dark and grey, not the purple of the drips' outlines), grown 3px past their soft
  // edges (the first pass left dotted ghosts of her brows and mouth) but not up into the drip above her brows (row 114 and below) nor her
  // outline; her wax refilled column by column, since it is shaded in upright bands (paintColumns).
  const nearClear = (x, y) => { for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const X = x + dx, Y = y + dy;
    if (X < 0 || Y < 0 || X >= base.w || Y >= base.h || base.d[(Y * base.w + X) * 4 + 3] < L.ALPHA_FLOOR) return true; } return false; };
  const ink = (r, g, b) => L.lum(r, g, b) < 62 && Math.max(r, g, b) - Math.min(r, g, b) < 48;
  const wax = (r, g, b) => L.lum(r, g, b) > 70 && b > g + 30;
  const blankC = paintColumns(L.clone(base), holeOf(base, [{ x: 20, y: 114, w: 50, h: 38 }], ink, 3, (x, y) => y >= 114 && !nearClear(x, y)), wax);
  // CRYSTAL CHIME (drawn): her eyes shut, calm, a small open "o" as the crystal rings (the fork and crystal are drawn beside her by the game).
  { const im = L.clone(blankC);
    shutEyes(im, 44, 114, 26, 7, 3, { up: false });
    L.fillEllipse(im, 47, 136, 4.5, 4, INK); L.fillEllipse(im, 47, 136.5, 2.6, 2.3, [92, 14, 36]);
    emit(F, 'chime', L.trim(im, 2), { src: ['candle.png'], method: 'drawn: her own render, eyes shut and humming (no show file)' }); }
  // SMASH WIND-UP: "this is maddening" (S4E3), a close-up cut off by the frame: her brows down and the bared teeth, on her render. The scene's
  // light shades her body across the face, so the face is taken as its ink and the whites of the teeth (faceOf).
  const onCandle = (src, rect, at, s, extra) => { const im = L.clone(blankC); putFace(im, faceOf(src, rect), at[0], at[1], { s }); if (extra) extra(im); return L.trim(im, 2); };
  emit(F, 'maddening', onCandle(S('Candle “this is maddening”.jpeg'), { x: 118, y: 296, w: 272, h: 266 }, [46, 126], 0.17),
    { src: ['Candle “this is maddening”.jpeg', 'candle.png'], method: 'face swap: her face (a close-up, S4E3) on her own render' });
  // SMASH: mad (Candle Mad.png, Season 3), as the show's cut-out has her (with the paper in her hand).
  emit(F, 'mad', toBase(S('Candle Mad.png'), F), { src: ['Candle Mad.png'], method: 'cut-out (wiki pose)' });
  // HIT: scared (Candle Scared.png, Season 3), the whole reaction. (Second pass: the first pass led into it with the flabbergasted frame
  // (S4E1), but that frame is a mild, almost neutral smile, so the first moment of a hit did not look like a hit; it is no longer made.)
  emit(F, 'scared', toBase(S('Candle Scared.png'), F), { src: ['Candle Scared.png'], method: 'cut-out (wiki pose)' });
  // WIN: the giggle (S4E2, Cheesy beside her), then the laugh (Candle Laughing.png, Season 3).
  emit(F, 'giggle', onCandle(S('S4E2 Candle giggles at Cheesy.png'), { x: 574, y: 212, w: 112, h: 84 }, [46, 124], 0.36),
    { src: ['S4E2 Candle giggles at Cheesy.png', 'candle.png'], method: 'face swap: her face (an episode frame, S4E2) on her own render' });
  // (Second pass: the Season 3 laugh has no flame, so her flame went out on the result screen when the laugh came in. Her render's own flame is
  // set back on its wick: the flame layer of her render (everything above her wick's tip, and the warm flame round the tip), turned 17 degrees
  // to the laugh's leaning wick and set on its tip.)
  { const src = toBase(S('Candle Laughing.png'), F), fl = L.blank(base.w, 40);
    for (let y = 0; y < 40; y++) for (let x = 0; x < base.w; x++) { const i = (y * base.w + x) * 4;
      if (base.d[i + 3] >= L.ALPHA_FLOOR && (y < 27 || base.d[i] > base.d[i + 2] + 25)) for (let c = 0; c < 4; c++) fl.d[i + c] = base.d[i + c]; }
    let y0 = 0; while (y0 < src.h && ![...Array(src.w).keys()].some((x) => src.d[(y0 * src.w + x) * 4 + 3] >= 128)) y0++;
    const xs = [...Array(src.w).keys()].filter((x) => src.d[(y0 * src.w + x) * 4 + 3] >= 128), tipx = (xs[0] + xs[xs.length - 1] + 1) / 2;
    const pad = 38, im = L.blank(src.w + 8, src.h + pad); L.paste(im, src, { y: pad });
    L.paste(im, fl, { x: tipx, y: pad + y0 + 1, ox: 49.5, oy: 31, rot: 17 * Math.PI / 180 });
    emit(F, 'laughing', L.trim(im, 2), { src: ['Candle Laughing.png', 'candle.png (her flame)'], method: 'cut-out (wiki pose), her render\'s flame set back on its wick' }); }
  // KO: knocked out on her side (CandleDead.png, Season 3). The thin grey outline of a box behind her (another object) is taken out.
  { const im = S('CandleDead.png');
    for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) { const i = (y * im.w + x) * 4, r = im.d[i], g = im.d[i + 1], b = im.d[i + 2];
      if (x > 520 && im.d[i + 3] > 0 && L.lum(r, g, b) > 50 && Math.max(r, g, b) - Math.min(r, g, b) < 70 && !(b > g + 40 && r > g + 15)) im.d[i + 3] = 0; }
    L.keepParts(im, (p) => p.n > 80);
    emit(F, 'dead', toBase(im, F), { src: ['CandleDead.png'], method: 'cut-out (wiki pose), a box\'s outline behind her taken out' }); }
}

// ---- CAMMY (Inanimate Insanity) ----------------------------------------------------------------------------------------------------------
// The S4-era cut-outs are whole pictures of them, armless as their render is: suspicious, outraged, angry, interested. Three more faces come off
// pictures that cannot be used whole -- scared (its canvas cuts the lens off), the squint (S4E5) and the KO (S4E2, under a night scene's
// purple light) -- and go on the interested cut-out's body, the same S4 set, its own small face painted out: their render's grin is drawn
// over its lens, so it cannot be painted out cleanly. Their faces are white strokes, taken as white (whiteFace). The Snapshot's flash keeps its
// picture ("Keep them").
// A face drawn in white on a dark body, taken as white strokes (alpha by how light; a lilac or grey cast in the scene's light made white).
function whiteFace(src, rect, { lo = 110, hi = 170, sat = 90 } = {}) {
  const r = L.crop(src, rect.x, rect.y, rect.w, rect.h), out = L.blank(r.w, r.h);
  for (let p = 0; p < r.w * r.h; p++) {
    const i = p * 4, l = L.lum(r.d[i], r.d[i + 1], r.d[i + 2]), s = Math.max(r.d[i], r.d[i + 1], r.d[i + 2]) - Math.min(r.d[i], r.d[i + 1], r.d[i + 2]);
    if (r.d[i + 3] < L.ALPHA_FLOOR || l < lo || s > sat) continue;
    out.d[i] = out.d[i + 1] = out.d[i + 2] = 246; out.d[i + 3] = r.d[i + 3] * Math.min(1, (l - lo) / (hi - lo));
  }
  return out;
}
const CAMMY_FACE = { x: 12, y: 26, w: 64, h: 100 };   // the interested cut-out's face, in the picture made of it
function cammy() {
  const F = 'Cammy';
  let body = null;
  for (const [key, file] of [['suspect', 'CammySuspect.png'], ['outrage', 'CammyOutrage.png'], ['angry', 'CammyAngry.png'], ['interested', 'CammyIntrested.png']]) {
    const im = toBase(S(file), F, 1, true);
    emit(F, key, L.clone(im), { src: [file], method: 'cut-out (wiki pose)' });
    if (key === 'interested') body = im;
  }
  // (second pass: the strokes grown 3px past their soft edges, which the first pass left as grey smudges by the face, and the rect taken down to
  // row 132, past the tail of the old mouth; the dark body refilled from itself)
  const nearClearC = (x, y) => { for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const X = x + dx, Y = y + dy;
    if (X < 0 || Y < 0 || X >= body.w || Y >= body.h || body.d[(Y * body.w + X) * 4 + 3] < L.ALPHA_FLOOR) return true; } return false; };
  const blankC = paintOne(L.clone(body), holeOf(body, [{ x: CAMMY_FACE.x, y: CAMMY_FACE.y, w: CAMMY_FACE.w, h: CAMMY_FACE.h + 6 }],
    (r, g, b) => L.lum(r, g, b) > 95 && Math.max(r, g, b) - Math.min(r, g, b) < 70, 3, (x, y) => !nearClearC(x, y)), (r, g, b) => L.lum(r, g, b) < 88);
  const onCammy = (src, rect, at, s, rot = 0) => { const im = L.clone(blankC); putFace(im, whiteFace(src, rect), at[0], at[1], { s, rot }); return L.trim(im, 2); };
  emit(F, 'scared', onCammy(S('CammyScared.png'), { x: 172, y: 122, w: 136, h: 190 }, [44, 78], 0.46),
    { src: ['CammyScared.png (their face)', 'CammyIntrested.png (their body)'], method: 'face swap: their face (a cut-out cut off by its canvas) on their interested cut-out' });
  emit(F, 'squint', onCammy(S('Cammybutwithsquintedeyes.png'), { x: 268, y: 232, w: 150, h: 186 }, [44, 78], 0.42),
    { src: ['Cammybutwithsquintedeyes.png (their face)', 'CammyIntrested.png (their body)'], method: 'face swap: their face (an episode frame, S4E5) on their interested cut-out' });
  emit(F, 'dies', turn(onCammy(S('CammyDIES.jpeg'), { x: 636, y: 286, w: 76, h: 124 }, [42, 80], 0.72, -0.26), 16),
    { src: ['CammyDIES.jpeg (their face)', 'CammyIntrested.png (their body)'], method: 'face swap: their face (an episode frame, S4E2) on their interested cut-out, knocked over' });
}

// ---- YIN-YANG (Inanimate Insanity, they) ---------------------------------------------------------------------------------------------------
// Yang alone and Mindful keep their pictures ("Keep them"); the two Season 4 bodies downloaded for them are not needed. Yinyang Hurt.png (Season
// 3, the owner's "close enough") is their hit. Their fight-stance idle, Through the Roof, their KO (YinYangEliminated.png has the boxing glove
// over most of them) and their laugh are drawn on their render: the arms taken off along their own outlines and drawn again where the pose has
// them (outside the ball, where a black arm shows), and the face redrawn in each half's own ink -- black on Yin's white, white on Yang's black.
// (Second pass.) The first pass snapped every painted-out pixel to pure white or pure black: that left white jags where the eye rects met the
// curve, a dark block on Yang's half (their black is not one flat colour: it has its shine), and, for the KO, a straight cut where the grin
// hid the curve. Now: the arms come off the ball cleanly (limbOffBall: the rim painted back where they joined, no stub); the face's strokes
// are taken out of each half (grown 2px past their soft edges), and the grin, which lies across the curve, as a whole; the curve between the
// halves is measured on every row where it shows and carried smoothly (a Hermite curve, the slopes of the rows either side) under the grin;
// and each half is painted back from itself (paintParts), anti-aliased across the curve.
function yinyang() {
  const F = 'Yin-Yang', base = B(F), rig = RIG[F];
  const deg = (a) => ((a * 180 / Math.PI) % 360 + 360) % 360;
  const circ = fitCircle(base, 105, 92, (a) => { const d = deg(a); return (d > 20 && d < 140) || (d > 160 && d < 205); });   // (not the rays through the arms and legs)
  const noArms = L.clone(base); for (const a of rig.arms) limbOffBall(noArms, a, circ);
  const W = 7.5, FIST = 8.5, WH = [246, 246, 246];   // their limb line weight and fist at this size; Yang's white ink
  // THE CURVE: on each row, where Yin's white gives way to Yang's black, scanning right from past the left eye (from x 40 above the brows, 75 beside
  // them, 86 beside the eyes, 90 under the grin); under the grin (rows 100-132) carried across.
  const lumAt = (x, y) => { const i = (y * noArms.w + x) * 4; return L.lum(noArms.d[i], noArms.d[i + 1], noArms.d[i + 2]); };
  const xb = new Float64Array(noArms.h).fill(NaN);
  for (let y = 44; y <= 142; y++) {
    if (y >= 100 && y <= 132) continue;
    for (let x = y < 49 ? 40 : y < 60 ? 75 : y < 100 ? 86 : 90; x < 190; x++) { const a = lumAt(x, y), b = lumAt(x + 1, y);
      if (a >= 128 && b < 128) { xb[y] = x + 0.5 + (a - 128) / Math.max(1, a - b); break; } }
  }
  const slope = (y0, y1) => { let n = 0, sy = 0, sx = 0, sxy = 0, syy = 0; for (let y = y0; y <= y1; y++) if (!isNaN(xb[y])) { n++; sy += y; sx += xb[y]; sxy += y * xb[y]; syy += y * y; }
    return (n * sxy - sy * sx) / (n * syy - sy * sy); };
  { const y0 = 99, y1 = 133, x0 = xb[y0], x1 = xb[y1], m0 = slope(91, 99) * (y1 - y0), m1 = slope(133, 139) * (y1 - y0);
    for (let y = y0 + 1; y < y1; y++) { const t = (y - y0) / (y1 - y0), t2 = t * t, t3 = t2 * t;
      xb[y] = (2 * t3 - 3 * t2 + 1) * x0 + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * x1 + (t3 - t2) * m1; } }
  const yang = (x, y) => isNaN(xb[y]) ? (x > 100 ? 1 : 0) : c01(x + 1 - xb[y]);   // how much of a pixel is Yang's black
  const half = (r, g, b) => L.lum(r, g, b) > 200 ? 0 : L.lum(r, g, b) < 60 ? 1 : null;   // (the grey rim is neither)
  const EYES = [{ x: 50, y: 50, w: 36, h: 56 }, { x: 100, y: 50, w: 38, h: 56 }], GRIN = { x: 58, y: 96, w: 90, h: 40 };
  const strokeOn = (r, g, b, x, y) => { const k = yang(x, y); return k <= 0 ? L.lum(r, g, b) < 245 : k >= 1 ? L.lum(r, g, b) > 80 : false; };   // (Yang's shine is under 60)
  const faceOut = (rects, all) => { const im = L.clone(noArms); return paintParts(im, holeOf(im, rects, (r, g, b, x, y) => all(x, y) || strokeOn(r, g, b, x, y), 2), yang, half); };
  // their eyes and brows painted out (each half's own colour put back, the S-curve between them kept smooth)
  const noEyes = faceOut(EYES, () => false);
  const noFace = faceOut([...EYES, GRIN], (x, y) => x >= GRIN.x && y >= GRIN.y && x < GRIN.x + GRIN.w && y < GRIN.y + GRIN.h);
  const brows = (im) => {   // angry brows: the inner ends low
    L.stroke(im, [[50, 56], [76, 66]], 5, INK);
    L.stroke(im, [[104, 70], [128, 58]], 5, WH);
  };
  const ownEyes = (im) => {   // their eyes as the render has them, put back under the new brows
    L.fillEllipse(im, 67, 81, 5.5, 10, INK); L.fillEllipse(im, 116, 86, 4.5, 8.5, WH);
  };
  // IDLE, the fight stance: fists up in front of them, the brows down, a little crouched (squashed 4%).
  { const im = L.clone(noEyes); ownEyes(im); brows(im);
    const c = L.blank(im.w + 26, im.h); L.paste(c, im, { x: 12 });
    limb(c, [[24, 100], [10, 86], [20, 68]], W, FIST);
    limb(c, [[198, 124], [216, 108], [208, 88]], W, FIST);
    emit(F, 'stance', L.trim(L.resize(c, c.w, Math.round(c.h * 0.96)), 2), { src: ['yin-yang.png'], method: 'drawn: their own render, fists up and brows down (no show file)' }); }
  // THROUGH THE ROOF (drawn): both fists straight up over them, the brows down, stretched upward a little.
  { const pad = 70, im = L.blank(base.w, base.h + pad), f = L.clone(noEyes); ownEyes(f); brows(f); L.paste(im, f, { y: pad });
    limb(im, [[26, pad + 52], [18, pad + 6], [34, 14]], W, FIST);
    limb(im, [[170, pad + 52], [180, pad + 6], [164, 14]], W, FIST);
    emit(F, 'roof', L.trim(L.resize(im, Math.round(im.w * 0.94), Math.round(im.h * 1.05)), 2), { src: ['yin-yang.png'], method: 'drawn: their own render, both fists driving up (no show file)' }); }
  // HIT: Yinyang Hurt.png (Season 3, S3E14: the bandages of that episode).
  emit(F, 'hurt', toBase(S('Yinyang Hurt.png'), F, 1, true), { src: ['Yinyang Hurt.png'], method: 'cut-out (wiki pose)' });
  // KO (drawn): knocked over onto their back (the whole render turned, legs up), the arms flung out, eyes squeezed shut ("> <": black on Yin,
  // white on Yang), the grin dropped to a small open mouth.
  { const im = L.clone(noFace);
    L.stroke(im, [[58, 72], [74, 81], [58, 90]], 5, INK);
    L.stroke(im, [[124, 76], [108, 85], [124, 94]], 5, WH);
    mouth(im, 84, 122, 22, 18, { teeth: false, line: 4 });
    const pad = 26, c = L.blank(im.w + pad * 2, im.h); L.paste(c, im, { x: pad });
    limb(c, [[pad + 12, 100], [pad - 6, 112], [pad - 14, 130]], W, FIST);
    limb(c, [[pad + 186, 124], [pad + 206, 130], [pad + 220, 122]], W, FIST);
    emit(F, 'ko', turn(L.trim(c, 2), -72), { src: ['yin-yang.png'], method: 'drawn: their own render knocked over, eyes squeezed shut (YinYangEliminated.png hides them behind the glove)', flip: false }); }   // (their render's flag: the turn fools the facing measure)
  // WIN (drawn): laughing, eyes shut happy (^ ^), both arms thrown up.
  { const pad = 54, im = L.blank(base.w + 34, base.h + pad), f = L.clone(noEyes);
    L.stroke(f, L.arc(66, 84, 10, 8, Math.PI * 1.08, Math.PI * 1.92, 16), 5, INK);
    L.stroke(f, L.arc(116, 88, 10, 8, Math.PI * 1.08, Math.PI * 1.92, 16), 5, WH);
    L.paste(im, f, { x: 17, y: pad });
    limb(im, [[29, pad + 100], [8, pad + 66], [12, 30]], W, FIST);
    limb(im, [[203, pad + 124], [226, pad + 86], [214, 44]], W, FIST);
    emit(F, 'laugh', L.trim(im, 2), { src: ['yin-yang.png'], method: 'drawn: their own render, eyes shut laughing, both arms thrown up (no show file)' }); }
}

// ---- small drawing helpers for the BFDI six ------------------------------------------------------------------------------------------------
// A filled polygon, anti-aliased (a colour layer cut to the outline).
function fillPoly(im, poly, rgb, mode = 'over') {
  const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]), x0 = Math.floor(Math.min(...xs)) - 1, y0 = Math.floor(Math.min(...ys)) - 1;
  const lay = L.blank(Math.ceil(Math.max(...xs)) - x0 + 2, Math.ceil(Math.max(...ys)) - y0 + 2);
  for (let i = 0; i < lay.d.length; i += 4) { lay.d[i] = rgb[0]; lay.d[i + 1] = rgb[1]; lay.d[i + 2] = rgb[2]; lay.d[i + 3] = 255; }
  L.polyCut(lay, poly.map(([x, y]) => [x - x0, y - y0]));
  return L.paste(im, lay, { x: x0, y: y0, mode });
}
// A picture squashed or stretched about its feet (the bottom of its box), on a canvas that holds it.
function squash(im, sx, sy) { return L.trim(L.resize(im, Math.round(im.w * sx), Math.round(im.h * sy)), 2); }
const median3 = (im, x, y, w, h) => L.bodyColour(im, { x, y, w, h }, 40);

// ---- LEAFY (BFDI) -------------------------------------------------------------------------------------------------------------------------
// The sprint (TPOT) leads into her drawn blade dash; her attack is smug, her hit angry (both BFB frames with the sky or Firey behind her, so
// their faces go on her render); Kindness Parry is drawn; her KO is the official BFB set of her being sucked to the EXIT (frames 3, 5 and 7).
const LEAFY_FACE = { x: 12, y: 46, w: 92, h: 106 };
function leafy() {
  const F = 'Leafy', base = B(F), rig = RIG[F];
  // THE SPRINT (RUNLEAFYRUNNNN.png, TPOT): a cut-out lit yellow by its scene, so shifted onto her render's greens by a colour map fitted to her
  // parts (body, the lit side, the outline, the line-work, her teeth); the tip of the leaf runs off the top of the file, so it is drawn back:
  // the two edges carried up to a point, in her own green and outline.
  { const src = S('RUNLEAFYRUNNNN.png');
    L.applyColourMap(src, L.fitColourMap([[[159, 202, 3], [94, 225, 3]], [[168, 204, 24], [98, 228, 12]], [[203, 207, 6], [126, 236, 40]],
      [[100, 130, 20], [58, 168, 4]], [[8, 6, 5], [2, 4, 1]], [[245, 245, 240], [245, 245, 240]]]), (r, g, b) => !(L.lum(r, g, b) > 225 && Math.max(r, g, b) - Math.min(r, g, b) < 30));
    let xa = -1, xb = -1; for (let x = 0; x < src.w; x++) if (src.d[x * 4 + 3] > 128) { if (xa < 0) xa = x; xb = x; }
    const P = Math.round((xb - xa) * 0.9), im = L.blank(src.w, src.h + P); L.paste(im, src, { y: P });
    const fill = median3(src, Math.round((xa + xb) / 2) - 8, 6, 16, 10), edge = [58, 168, 4], tip = [xb - (xb - xa) * 0.15, 2];
    fillPoly(im, [[xa + 2, P + 3], tip, [xb - 2, P + 3]], fill);
    L.stroke(im, [[xa + 3, P + 2], tip, [xb - 3, P + 2]], 7, edge);
    emit(F, 'sprint', toBase(im, F), { src: ['RUNLEAFYRUNNNN.png'], method: 'cut-out (wiki pose), recoloured from its scene\'s yellow to her render\'s greens, the tip of the leaf (off the file\'s top) drawn back' }); }
  const GREENS = [[94, 225, 3], [98, 214, 86], [130, 236, 60]];   // her body, its bluer right half, the vein
  const notLeaf = (r, g, b) => Math.min(...GREENS.map((c) => Math.hypot(r - c[0], g - c[1], b - c[2]))) > 46;
  const inSnarl = enclosed(base, LEAFY_FACE, (r, g, b) => L.lum(r, g, b) < 70);
  // (Second pass.) HER FACE PAINTED OUT AGAIN. The first pass kept a 6px band inside her outline untouched and refilled the rest by plain
  // diffusion: that left dotted ghosts of her brows and eyes, a pale blur where her teeth were, and, down her left side, the black of her
  // mouth's corner and the forearm raised to it as a dark seam. Now: every stroke of her face and her teeth, and the whole left arm with that
  // forearm (black, below row 118, left of x 50), grown 3px past their soft edges; refilled by part (paintParts) -- her green, and the bluer
  // crescent down her right side, whose edge is measured on every row where it shows and carried smoothly under the mouth -- with her vein
  // drawn back along its own line (fitted to the vein where it shows); and her left edge, which the arm and the mouth's corner hid from row
  // 137 to 151, carried across from the rows above and below it and drawn again in her outline's green, the black outside it cleared. A new
  // left arm hangs at her side (smug, angry; the parry draws its own). Her right arm and her legs are left as they are.
  const W0 = base.w, H0 = base.h, at = (x, y) => { const i = (y * W0 + x) * 4; return [base.d[i], base.d[i + 1], base.d[i + 2], base.d[i + 3]]; };
  const inkL = (r, g, b) => L.lum(r, g, b) < 70;
  const polyMask = (poly, grow) => polyMaskOf(W0, H0, poly, grow);
  const keepLimb = new Uint8Array(W0 * H0); for (const lb of [...rig.legs, ...rig.arms.filter((a) => a.side === 'R')]) { const m = polyMask(lb.poly, 2); for (let q = 0; q < m.length; q++) if (m[q]) keepLimb[q] = 1; }
  const LL = (x, y) => x < 50 && y >= 118 && y <= 178;   // the lower left: her left arm and the corner of her mouth
  const hermite = (arr, y0, y1, s0, s1) => { const x0 = arr[y0], x1 = arr[y1], m0 = s0 * (y1 - y0), m1 = s1 * (y1 - y0);
    for (let y = y0 + 1; y < y1; y++) { const t = (y - y0) / (y1 - y0), t2 = t * t, t3 = t2 * t; arr[y] = (2 * t3 - 3 * t2 + 1) * x0 + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * x1 + (t3 - t2) * m1; } };
  const slopeOf = (arr, ya, yb) => { let n = 0, sy = 0, sx = 0, sxy = 0, syy = 0; for (let y = ya; y <= yb; y++) if (!isNaN(arr[y])) { n++; sy += y; sx += arr[y]; sxy += y * arr[y]; syy += y * y; } return (n * sxy - sy * sx) / (n * syy - sy * sy); };
  // the crescent's edge: on each row, the first bluer pixel right of x 60 (her line-work and her teeth skipped); rows 102-134 under the mouth carried
  const xc = new Float64Array(H0).fill(NaN);
  for (let y = 36; y <= 172; y++) { if (y >= 102 && y <= 134) continue;
    for (let x = 60; x < W0; x++) { const [r, g, b, a] = at(x, y); if (a < 128) break; if (inkL(r, g, b) || L.lum(r, g, b) > 200 || g < 185) continue; if (b > 50) { xc[y] = x; break; } } }
  hermite(xc, 101, 135, slopeOf(xc, 90, 101), slopeOf(xc, 135, 146));
  const cres = (x, y) => (isNaN(xc[y]) ? 0 : c01(x + 1 - xc[y]));
  // the vein: the light green line down her middle, fitted (x = a + b y)
  let vn = 0, vy = 0, vx = 0, vxy = 0, vyy = 0; const vc = [];
  for (let y = 0; y < H0; y++) for (let x = 30; x < 80; x++) { const [r, g, b, a] = at(x, y); if (a >= 200 && r > 115 && g > 232 && b < 120) { vn++; vy += y; vx += x + 0.5; vxy += y * (x + 0.5); vyy += y * y; vc.push([r, g, b]); } }
  const vb = (vn * vxy - vy * vx) / (vn * vyy - vy * vy), va = (vx - vb * vy) / vn, VEIN = [0, 1, 2].map((c) => vc.map((p) => p[c]).sort((p, q) => p - q)[vc.length >> 1]);
  // her left edge: the first green pixel from the left, on rows where nothing black lies on it (clear before it); rows 139-155 carried, and a
  // row a leg crosses (166, 178) taken from its neighbours
  const xe = new Float64Array(H0).fill(NaN);
  for (let y = 96; y <= 178; y++) { let sawInk = false;
    for (let x = 0; x < 60; x++) { const [r, g, b, a] = at(x, y); if (a < 100) { sawInk = false; continue; } if (inkL(r, g, b)) { sawInk = true; continue; } if (!sawInk) xe[y] = x; break; } }
  for (let y = 139; y <= 155; y++) xe[y] = NaN;
  hermite(xe, 138, 156, slopeOf(xe, 128, 138), slopeOf(xe, 156, 164));
  for (let y = 97; y <= 178; y++) if (isNaN(xe[y])) { let a = y - 1, b = y + 1; while (b <= 178 && isNaN(xe[b])) b++; xe[y] = b <= 178 ? xe[a] + (xe[b] - xe[a]) / (b - a) : xe[a] + (xe[a] - xe[a - 1]); }
  const OUTLINE = [0, 1, 2].map((c) => { const v = []; for (let y = 100; y <= 130; y++) v.push(at(Math.round(xe[y]) + 1, y)[c]); return v.sort((p, q) => p - q)[v.length >> 1]; });
  const nearClearL = (x, y) => { for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const X = x + dx, Y = y + dy;
    if (X < 0 || Y < 0 || X >= W0 || Y >= H0 || base.d[(Y * W0 + X) * 4 + 3] < L.ALPHA_FLOOR) return true; } return false; };
  const holeL = holeOf(base, [LEAFY_FACE, { x: 0, y: 118, w: 50, h: 61 }],
    (r, g, b, x, y) => !keepLimb[y * W0 + x] && (inkL(r, g, b) || inSnarl(x, y) || (LL(x, y) && L.lum(r, g, b) < 150 && !(g > r + 60))), 3,
    (x, y) => !keepLimb[y * W0 + x] && (LL(x, y) || !nearClearL(x, y)));
  const blankL = paintParts(L.clone(base), holeL, cres, (r, g, b) => (g > 205 && b < 40 && r < 112 ? 0 : b > 60 && b < 120 && g > 195 && L.lum(r, g, b) < 200 ? 1 : null));
  for (let y = 0; y < H0; y++) for (let x = 0; x < W0; x++) { const q = y * W0 + x, i = q * 4; if (!holeL[q]) continue;
    // the vein, where the hole crossed it
    const dv = Math.abs(x + 0.5 - (va + vb * y)), kv = c01(1.7 - dv) * (1 - cres(x, y));
    if (kv > 0 && y > 24 && y < 168) for (let c = 0; c < 3; c++) blankL.d[i + c] = blankL.d[i + c] * (1 - kv) + VEIN[c] * kv;
    // the left edge, drawn again
    if (LL(x, y) && !isNaN(xe[y])) { const e = x + 0.5 - xe[y];
      if (e < 3.5) { for (let c = 0; c < 3; c++) blankL.d[i + c] = OUTLINE[c]; blankL.d[i + 3] = 255 * c01(e + 0.5); } } }
  // (and what was black outside her edge, which the hole's growth did not reach: cleared)
  for (let y = 118; y <= 178; y++) for (let x = 0; x < 50; x++) { const q = y * W0 + x, i = q * 4; if (keepLimb[q] || isNaN(xe[y]) || x + 0.5 >= xe[y] - 0.5) continue;
    if (blankL.d[i + 3] && L.lum(blankL.d[i], blankL.d[i + 1], blankL.d[i + 2]) < 150) blankL.d[i + 3] = 0; }
  const leftArm = (im) => limb(im, [[xe[146] + 2, 146], [xe[146] - 8, 157], [xe[146] - 4, 168]], 6, 6);   // a new left arm, hanging at her side
  // ATTACK: smug (Smugleafy.png, BFB, the sky and the floor behind her). Seen three-quarters, she shows one eye; it is laid for both, the second
  // mirrored, over her smirk.
  { const src = S('Smugleafy.png'), eye = faceOf(src, { x: 330, y: 240, w: 100, h: 140 }, { whites: false, gain: 1.8 }), smirk = faceOf(src, { x: 270, y: 370, w: 170, h: 110 }, { whites: false, gain: 1.8 });   // (its soft lines darkened to her render's black)
    const im = L.clone(blankL); leftArm(im);
    putFace(im, eye, 40, 84, { s: 0.36, mirror: true }); putFace(im, eye, 76, 84, { s: 0.36 }); putFace(im, smirk, 60, 122, { s: 0.36 });
    emit(F, 'smug', L.trim(im, 2), { src: ['Smugleafy.png (her face)', 'leafy.png'], method: 'face swap: her face (an episode frame) on her own render, its one eye laid for both' }); }
  // HIT: angry (Angry Leafy.png, BFB 6: Firey beside her, the lava behind): her face, tipped over in the frame, turned upright onto her render.
  { const face = faceOf(S('Angry Leafy.png'), { x: 270, y: 90, w: 340, h: 320 });
    const im = L.clone(blankL); leftArm(im);
    putFace(im, face, 57, 100, { s: 0.33, rot: -0.98 });
    emit(F, 'angry', L.trim(im, 2), { src: ['Angry Leafy.png (her face)', 'leafy.png'], method: 'face swap: her face (an episode frame, tipped over: turned upright) on her own render' }); }
  // KINDNESS PARRY (drawn): a warm smile, eyes shut happy, both arms open wide.
  { const im = L.clone(blankL); for (const a of rig.arms) if (a.side === 'R') eraseLimb(im, a);   // (her left arm is already off: blankL)
    shutEyes(im, 58, 92, 34, 8, 4.5); L.stroke(im, L.arc(58, 118, 18, 12, 0.25, Math.PI - 0.25, 20), 4.5, INK);
    const c = L.blank(im.w + 40, im.h); L.paste(c, im, { x: 20 });
    limb(c, [[20 + 22, 146], [20 + 4, 132], [20 - 14, 122]], 6, 6.5);
    limb(c, [[20 + 102, 138], [20 + 120, 124], [20 + 138, 116]], 6, 6.5);
    emit(F, 'parry', L.trim(c, 2), { src: ['leafy.png'], method: 'drawn: her own render, a warm smile and arms open (no show file)' }); }
  // KO: sucked to the EXIT (Leafy sucked by 40003, 40005, 40007: the official BFB set, one canvas each, so one scale for all three): the leaf
  // bending away, her eyes squeezed shut and mouth open where the face shows, edge-on and faceless at the last.
  { const s = Math.sqrt(L.fillArea(base) / L.fillArea(L.trim(S('Leafy sucked by 40003.png'), 0))) * 0.95;
    [['ko-1', 'Leafy sucked by 40003.png', [0.42, 0.5]], ['ko-2', 'Leafy sucked by 40005.png', [0.5, 0.5]], ['ko-3', 'Leafy sucked by 40007.png', null]].forEach(([key, file, at]) => {
      const im = L.trim(L.scaleBy(L.trim(S(file), 0), s), 4), b = L.bbox(im);
      if (at) { const cx = b.x + b.w * at[0], cy = b.y + b.h * at[1]; squeezeEyes(im, cx, cy - 9, 26, 11, 3.6); mouth(im, cx + 1, cy + 12, 14, 11, { teeth: false, line: 3 }); }
      emit(F, key, im, { src: [file], method: at ? 'official (the EXIT set), her eyes and mouth drawn' : 'official (the EXIT set), edge-on', faceless: !at, note: at ? '' : 'edge-on: no face shows' });
    }); }
}

// ---- NEEDLE (BFDI) ------------------------------------------------------------------------------------------------------------------------
// All TPOT cut-outs. Her three pricks reach out with the arm of the TPOT 8 slap (Pre-NeedySlapTpot8.png), shortened: in the file it stretches
// four times her height to the left; here it is about a third of it, the hand moved in to its new end.
function needle() {
  const F = 'Needle';
  { const src = S('Pre-NeedySlapTpot8.png'), X0 = 700, im = L.crop(src, X0, 0, src.w - X0, src.h);
    const hand = L.crop(src, 6, 440, 84, 72);   // her hand, at the far end of the arm
    L.keepParts(hand, (p) => p.n > 300);
    L.eraseRect(im, 0, 440, 70, 100);   // the cut end of the arm
    const y = (x) => 478 + (x - 20) * (522 - 478) / (1075 - 20);
    L.paste(im, hand, { x: 770 - X0, y: y(770), ox: 74, oy: 40 });
    emit(F, 'prick', toBase(L.trim(im, 0), F), { src: ['Pre-NeedySlapTpot8.png'], method: 'cut-out (wiki pose), her stretched arm shortened, the hand moved in', flip: true }); }   // (she reaches to the left in the art: flipped by eye, her face is too small to measure)
  // (her face is a few pixels across: the stance points right, as her render faces; the others are front-on and keep her render's flag)
  for (const [key, file] of [['stance', 'Needle mad pointing.png'], ['mad', 'Needle mad.png'], ['scared', 'Scared Needle.png'], ['proud', 'Needle proud.png']])
    emit(F, key, toBase(S(file), F), { src: [file], method: 'cut-out (wiki pose)', flip: false });
}

// ---- SNOWBALL (BFDI) ----------------------------------------------------------------------------------------------------------------------
// Cut-outs (TPOT and BFB) for the tackle's wind-up and charge, the jump and the cheer; the official TPOT 2 fall with his face drawn on; Dig In
// drawn: his render hunkered down, wider and lower, the feet planted wide.
function snowball() {
  const F = 'Snowball', base = B(F), rig = RIG[F];
  for (const [key, file] of [['mad', 'Snowball mad(TPOT16).png'], ['charge', 'Runaway.png'], ['jump', 'Jumpballsnow.png'], ['cheer', 'Snowball - cheer.png']])
    emit(F, key, toBase(S(file), F), { src: [file], method: 'cut-out (wiki pose)', flip: key === 'cheer' ? false : undefined });   // (the cheer is front-on: his render's flag)
  // KO: falling (Falling-Snowball-2.png, the official TPOT 2 asset: his body squashed as he drops, no face), eyes squeezed shut, mouth open.
  { const im = toBase(S('Falling-Snowball-2.png'), F), b = L.bbox(im), cx = b.x + b.w * 0.55, cy = b.y + b.h * 0.46;
    L.stroke(im, [[cx - 40, cy - 22], [cx - 18, cy - 14]], 5, INK); L.stroke(im, [[cx + 40, cy - 22], [cx + 18, cy - 14]], 5, INK);
    squeezeEyes(im, cx, cy, 44, 14, 4.4); mouth(im, cx + 2, cy + 26, 30, 22, { teeth: false, line: 4 });
    emit(F, 'falling', im, { src: ['Falling-Snowball-2.png'], method: 'official (TPOT 2), his eyes and mouth drawn' }); }
  // DIG IN (drawn): his render hunkered down (wider, lower), the legs planted wide.
  { const im = L.clone(base); for (const g of rig.legs) eraseLimb(im, g);
    const body = squash(im, 1.1, 0.86), c = L.blank(body.w + 20, body.h + 26); L.paste(c, body, { x: 10 });
    const fy = c.h - 4, w = 6.5;
    limb(c, [[10 + 72, body.h - 18], [10 + 52, fy - 10], [10 + 40, fy - 2]], w, 0, [-8, 1, 10, 5]);
    limb(c, [[10 + 140, body.h - 18], [10 + 162, fy - 10], [10 + 174, fy - 2]], w, 0, [8, 1, 10, 5]);
    emit(F, 'dig', L.trim(c, 2), { src: ['snowball.png'], method: 'drawn: his own render hunkered down, legs planted wide (no show file)' }); }
}

// ---- BOMBY (BFDI) -------------------------------------------------------------------------------------------------------------------------
// TPOT cut-outs throughout; the TPOT 20 angry one is lit navy by its scene, so it is shifted onto his render's greys. His KO, charred, is drawn.
function bomby() {
  const F = 'Bomby', base = B(F);
  // His flags go by his fuse, which every one of these has on the left, as his render does: unflipped, so the fuse never jumps sides when a
  // picture comes in (the measure reads his round face as turned, a few hundredths either way).
  for (const [key, file] of [['scream', 'Bombyscreamsfuuuuuuse.png'], ['flying', 'Bombyflying.png'], ['throw', 'BombyThrowingBlockAside.png'], ['happy', 'Bombyhappyandexcited.png']])
    emit(F, key, toBase(S(file), F), { src: [file], method: 'cut-out (wiki pose)', flip: false });
  { const src = S('Angrybombythetpot20.png');
    L.applyColourMap(src, L.fitColourMap([[[53, 66, 134], [101, 100, 100]], [[30, 42, 90], [85, 85, 87]], [[3, 3, 7], [20, 20, 20]], [[248, 242, 243], [248, 248, 248]],
      [[90, 110, 190], [140, 140, 140]]]), (r, g, b) => b > r + 18);
    // ...and the fuse, lit pink by the same scene, back to his rope's cream
    L.applyColourMap(src, L.fitColourMap([[[230, 120, 160], [226, 210, 160]], [[200, 90, 130], [200, 180, 130]], [[250, 170, 200], [240, 228, 190]], [[120, 50, 80], [130, 110, 80]]]), (r, g, b) => r > g + 45 && b > g + 10);
    // (Second pass.) The maps left a brownish-red blotch of the scene's light on his shine, a pink fuse (his render's is tan) and the frame's
    // grain. So: his body (everything but the fuse) made the render's neutral grey at its own lightness, after an edge-keeping smoothing that
    // takes the grain out and keeps his lines; the fuse (the warm pixels left of and above his cap) given his render's rope colour by lightness,
    // read off his render's rope (lum 96 -> 103,96,79 ... lum 200 -> 215,199,163).
    const im = toBase(src, F), sm = L.bilateral(im, 2, 1.6, 22);
    const TAN = [[96, [103, 96, 79]], [150, [165, 150, 112]], [200, [215, 199, 163]], [232, [228, 214, 178]]];
    const rope = (l) => { if (l <= TAN[0][0]) return TAN[0][1]; for (let i = 1; i < TAN.length; i++) if (l <= TAN[i][0]) { const t = (l - TAN[i - 1][0]) / (TAN[i][0] - TAN[i - 1][0]); return TAN[i - 1][1].map((v, c) => v + (TAN[i][1][c] - v) * t); } return TAN[TAN.length - 1][1]; };
    for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) { const i = (y * im.w + x) * 4; if (!im.d[i + 3]) continue;
      const fuse = x < 50 && y < 52 && im.d[i] > im.d[i + 2] + 12, q = fuse ? im : sm, l = L.lum(q.d[i], q.d[i + 1], q.d[i + 2]);
      const c = fuse ? rope(l) : [l, l, l]; for (let k = 0; k < 3; k++) im.d[i + k] = c[k]; }
    emit(F, 'angry', im, { src: ['Angrybombythetpot20.png'], method: 'cut-out (wiki pose), recoloured from its scene\'s navy to his render\'s greys (his body neutral grey, the fuse his rope\'s tan)', flip: false }); }
  // KO, charred (drawn): his render blackened by the blast, dazed "x x" eyes, the fuse burnt down to a stub.
  { const im = L.clone(base);
    for (let p = 0; p < im.w * im.h; p++) { const i = p * 4; if (im.d[i + 3] < 24) continue;
      const g = L.lum(im.d[i], im.d[i + 1], im.d[i + 2]), k = 0.55; for (let c = 0; c < 3; c++) im.d[i + c] = im.d[i + c] * k * 0.7 + g * k * 0.3; }
    L.eraseRect(im, 0, 0, 62, 38);   // the fuse's rope
    // (second pass: his body colour read with the charred grey counted as body -- bodyColour's default skips anything darker than lum 90, so
    // the first pass got no colour and left the old mouth's curve and its dash under the new one; the strokes grown 3px past their soft edges
    // and refilled from his charred grey and its shine; the rect out to x 166, past the end of the old mouth's stroke and his right eye, which
    // sits on the turn of the ball and would have been a third eye beside the two drawn)
    const bc = L.bodyColour(im, { x: 80, y: 50, w: 70, h: 70 }, 30), off = (r, g, b) => L.lum(r, g, b) < 34 || Math.hypot(r - bc[0], g - bc[1], b - bc[2]) > 26;
    const noFace = paintOne(im, holeOf(im, [{ x: 82, y: 50, w: 84, h: 76 }], off, 3), (r, g, b) => !off(r, g, b));
    for (const [x, y] of [[100, 72], [128, 70]]) { L.stroke(noFace, [[x - 7, y - 7], [x + 7, y + 7]], 4.5, INK); L.stroke(noFace, [[x - 7, y + 7], [x + 7, y - 7]], 4.5, INK); }
    L.stroke(noFace, [[98, 102], [106, 98], [114, 103], [122, 98], [130, 102]], 4, INK);
    L.stroke(noFace, [[64, 30], [60, 22], [64, 16]], 4, [60, 52, 44]);   // what is left of the fuse
    for (const [x, y, r] of [[60, 10, 5], [66, 2, 4]]) L.fillEllipse(noFace, x, y + 6, r, r * 0.8, [150, 150, 150], 0, 0.8);
    emit(F, 'charred', L.trim(noFace, 2), { src: ['bomby.png'], method: 'drawn: his own render charred, eyes dazed, the fuse burnt down (no show file)' }); }
}

// ---- BUBBLE (BFDI) ------------------------------------------------------------------------------------------------------------------------
// Her attack stance is from the TPOT set her render is from; the BFB cut-outs (no sweater) for the shield's flinch, her hit and her win. HER
// JUMP.png, the Thermal Rise file, is a pencil storyboard sketch, not the show's art, so the rise is drawn. "yay" runs off the right of its
// canvas: the bubble is a circle, so its missing edge is filled from the other side, mirrored.
function bubble() {
  const F = 'Bubble', base = B(F), rig = RIG[F];
  for (const [key, file] of [['flinch', 'Bubble - phew, i almost got punched.png'], ['gasp', 'Bubble gasp.png']])
    emit(F, key, toBase(S(file), F), { src: [file], method: 'cut-out (wiki pose)' });
  // THE STANCE (second pass): the wiki file is opaque, so on a background it read as a solid pale disc; her render's film is see-through
  // (alpha 192, rim and all), so the stance's film is given the same (its blues; not her black line-work, the white shine or her tongue).
  { const im = toBase(S('Bubble 18 Stance 1.png'), F);
    for (let i = 0; i < im.d.length; i += 4) { const r = im.d[i], g = im.d[i + 1], b = im.d[i + 2];
      if (b > r + 12 && b > 120 && !(Math.min(r, g, b) > 236)) im.d[i + 3] = Math.round(im.d[i + 3] * 192 / 255); }
    emit(F, 'stance', im, { src: ['Bubble 18 Stance 1.png'], method: 'cut-out (wiki pose), her film given the see-through alpha of her render' }); }
  { const src = S('Bubble - yay.png');
    // the bubble's rim: its blue outline's extent (top, bottom and left edges) gives the circle
    let x0 = 1e9, y0 = 1e9, y1 = -1;
    for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) { const i = (y * src.w + x) * 4, r = src.d[i], g = src.d[i + 1], b = src.d[i + 2];
      if (src.d[i + 3] > 200 && b > r + 50 && b > 150 && g > r + 20) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
    const R = (y1 - y0) / 2, cx = x0 + R, cy = y0 + R, W = Math.ceil(cx + R + 6), im = L.blank(W, src.h); L.paste(im, src, {});
    L.eraseRect(im, src.w - 3, 0, 3, src.h);   // the cut edge itself
    for (let y = 0; y < src.h; y++) for (let x = src.w - 3; x < W; x++) {
      if ((x - cx) ** 2 + (y - cy) ** 2 > (R + 4) ** 2) continue;
      const mx = Math.round(2 * cx - x); if (mx < 0 || mx >= src.w) continue;
      const i = (y * W + x) * 4, j = (y * src.w + mx) * 4; for (let c = 0; c < 4; c++) im.d[i + c] = src.d[j + c];
    }
    // (second pass: the mirrored strip carried her left eye and brow across as a black notch on the right edge: whatever is line-work in the
    // strip is painted out from her film round it)
    { const strip = new Uint8Array(W * src.h);
      for (let y = 0; y < src.h; y++) for (let x = src.w - 3; x < W; x++) { const i = (y * W + x) * 4; if (im.d[i + 3] >= L.ALPHA_FLOOR && L.lum(im.d[i], im.d[i + 1], im.d[i + 2]) < 110) strip[y * W + x] = 1; }
      paintOne(im, L.dilate(strip, W, src.h, 2).map((v, p) => (v && p % W >= src.w - 6 && im.d[p * 4 + 3] >= L.ALPHA_FLOOR ? 1 : 0)), (r, g, b) => b > r + 20 && L.lum(r, g, b) > 110, { alpha: true }); }
    emit(F, 'yay', toBase(im, F), { src: ['Bubble - yay.png'], method: 'cut-out (wiki pose), the bubble\'s edge cut off by its canvas filled from the other side' }); }
  // THERMAL RISE (drawn): her render stretched up as she rises, both arms up, the legs tucked under.
  { const im = L.clone(base); for (const a of rig.arms) eraseLimb(im, a); for (const g of rig.legs) eraseLimb(im, g);
    const body = squash(im, 0.93, 1.08), pad = 46, c = L.blank(body.w + 30, body.h + pad + 10); L.paste(c, body, { x: 15, y: pad });
    const ox = 15, oy = pad, sx = 0.93, sy = 1.08, P = (x, y) => [ox + x * sx, oy + y * sy];
    // (second pass: her arms at her render's length and weight, out from where they join her film and bent up beside her -- the first pass
    // drew long straight sticks up across the film's edge)
    limb(c, [P(23, 148), P(9, 140), P(1, 128), P(0, 114)], 5, 6.5);
    limb(c, [P(156, 146), P(170, 138), P(178, 126), P(179, 112)], 5, 6.5);
    limb(c, [P(64, 168), P(56, 182), P(70, 192)], 5.5, 0, [6, 0, 8, 4.5]);
    limb(c, [P(114, 168), P(124, 182), P(110, 192)], 5.5, 0, [-6, 0, 8, 4.5]);
    emit(F, 'rise', L.trim(c, 2), { src: ['bubble.png'], method: 'drawn: her own render rising, arms up, legs tucked (HER JUMP.png is a storyboard sketch)' }); }
}

// ---- TEARDROP (BFDI) ----------------------------------------------------------------------------------------------------------------------
// THE KICK is drawn: the BFB 27 push (Teardrop literally pushes Flower.png) has both arms out and her feet planted -- it does not read as a
// kick -- and its canvas cuts off her left side. The throw and the run are drawn too (second pass: keyed out of their episode frames they were
// not clean); the angry, hurt and blep faces go on her render (a small 149px frame, a close-up half behind a pin, and a frame cut off at her feet).
const TD_FACE = { x: 30, y: 40, w: 82, h: 122 };   // (second pass: to row 162, past the bottom of her grin, which the first pass's rect cut through)
function teardrop() {
  const F = 'Teardrop', base = B(F), rig = RIG[F];
  // her face painted out: its line-work, and the teeth her grin's outline closes in, grown 3px past their soft edges (the first pass left a
  // dark blue smudge under the grin); her water refilled, colour and alpha (182: see-through), from her own blues only (r < 80, g > 140,
  // b > 225 -- not the line-work's soft edge), never her outline (within 3px of the clear)
  const inGrin = enclosed(base, TD_FACE, (r, g, b) => L.lum(r, g, b) < 90);
  const water = (r, g, b) => r < 80 && g > 140 && b > 225;
  const nearClear = (x, y, n) => { for (let dy = -n; dy <= n; dy++) for (let dx = -n; dx <= n; dx++) { const X = x + dx, Y = y + dy;
    if (X < 0 || Y < 0 || X >= base.w || Y >= base.h || base.d[(Y * base.w + X) * 4 + 3] < L.ALPHA_FLOOR) return true; } return false; };
  const blankT = paintOne(L.clone(base), holeOf(base, [TD_FACE], (r, g, b, x, y) => (L.lum(r, g, b) < 100 && !water(r, g, b)) || inGrin(x, y), 3, (x, y) => !nearClear(x, y, 3)), water, { alpha: true });
  // ANGRY (TPOT2teardropangry.png, a 149x170 episode frame on a pale blue ground): her brows down and frown, on her render, its soft lines
  // (the frame is small) darkened to her render's black.
  const angry = L.clone(blankT); putFace(angry, faceOf(S('TPOT2teardropangry.png'), { x: 40, y: 50, w: 82, h: 80 }, { whites: false, gain: 2.4 }), 76, 100, { s: 1.2 });
  emit(F, 'angry', L.trim(angry, 2), { src: ['TPOT2teardropangry.png (her face)', 'teardrop.png'], method: 'face swap: her face (a 149px episode frame) on her own render' });
  // THE KICK (drawn): her legs taken off along their outlines; wound up (the kicking leg drawn back and up behind her, knee bent), then the
  // kick (that leg straight out in front at hip height, the foot turned up), the other leg planted. Her angry face.
  // (second pass: what is left of the old legs outside her body -- the thin dark lines eraseLimb left -- goes too)
  const bodyM = L.bodyMask(base, { grow: 2 }), legless = L.clone(angry); for (const g of rig.legs) eraseLimb(legless, g);
  for (const g of rig.legs) { const z = polyMaskOf(base.w, base.h, g.poly, 5); for (let q = 0; q < z.length; q++) if (z[q] && !bodyM[q]) legless.d[q * 4 + 3] = 0; }
  { const c = L.blank(legless.w + 30, legless.h); L.paste(c, legless, { x: 30 });
    limb(c, [[30 + 82, 172], [30 + 84, 186], [30 + 98, 193]], 6.5, 0, [2, 1, 9, 5]);   // the planted leg
    limb(c, [[30 + 46, 170], [30 + 22, 180], [30 + 6, 164]], 6.5, 0, [-4, -3, 9, 5]);   // the kicking leg, drawn back
    emit(F, 'kick-1', L.trim(c, 2), { src: ['teardrop.png', 'TPOT2teardropangry.png (her face)'], method: 'drawn: her own render winding up a kick (no show file of the kick in her TPOT look)' }); }
  { const c = L.blank(legless.w + 50, legless.h); L.paste(c, legless, {});
    limb(c, [[44, 172], [40, 186], [28, 193]], 6.5, 0, [-2, 1, 9, 5]);                  // the planted leg
    limb(c, [[86, 168], [122, 162], [156, 150]], 6.5, 0, [5, -5, 6, 10]);               // the kick, out in front
    emit(F, 'kick-2', L.trim(c, 2), { src: ['teardrop.png', 'TPOT2teardropangry.png (her face)'], method: 'drawn: her own render kicking (no show file of the kick in her TPOT look)' }); }
  // (Second pass.) THE THROW and THE RUN are DRAWN on her render, as the kick is: the first pass keyed them out of their episode frames, and
  // neither came out clean -- the throw's tip kept the fence seen through it and its body was opaque and darker under a thick navy outline; the
  // run was pale and opaque, with a smeared band where the ground was keyed out and blurred, doubled legs. Her render's own face, her water and
  // its alpha, and her limbs at the render's weight.
  const limbless = L.onlyMask(base, bodyM);   // (her body and its outline only: every limb and the fist her left arm ends in, which LIMB_RIG's outline leaves)
  // ...and where her left arm crossed her outline (rows 118-174, left of x 44): the black of the arm and its fist, and the clear ring the arm's
  // line left in her outline, painted out of her water and outline (colour and alpha); the black just outside her edge cleared
  { const fillM = L.bodyMask(base, { grow: 0 }), hole = new Uint8Array(base.w * base.h);
    for (let y = 118; y <= 174; y++) for (let x = 0; x < 44; x++) { const q = y * base.w + x, i = q * 4, d = limbless.d;
      if (!bodyM[q] || !d[i + 3]) continue;
      const dark = L.lum(d[i], d[i + 1], d[i + 2]) < 90;
      if (!fillM[q]) { if (dark) d[i + 3] = 0; continue; }
      if (dark || d[i + 3] < 100) hole[q] = 1; }
    paintOne(limbless, L.dilate(hole, base.w, base.h, 1).map((v, q) => (v && fillM[q] ? 1 : 0)), (r, g, b) => b > 180, { alpha: true }); }
  // THE THROW (drawn; Td throwing block.png has both arms up over her head, flinging): both arms up, the hands over her shoulders. Not wired
  // (POSE_SETS.Teardrop): the slot the plan named "Ranged" is her low sweep, and a throw does not show a sweep -- the owner's call.
  { const c = L.blank(limbless.w + 24, limbless.h); L.paste(c, limbless, { x: 12 });
    limb(c, [[12 + 14, 139], [12 + 2, 126], [12 + 6, 104]], 6.5, 7);   // (from where her left arm crossed her outline: it covers the gap)
    limb(c, [[12 + 118, 142], [12 + 134, 122], [12 + 128, 98]], 6.5, 7);
    limb(c, [[12 + 44, 170], [12 + 41, 186], [12 + 40, 194]], 6.5, 0, [6, 1, 9, 5]);
    limb(c, [[12 + 86, 172], [12 + 88, 186], [12 + 89, 194]], 6.5, 0, [7, 1, 9, 5]);
    emit(F, 'throw', L.trim(c, 2), { src: ['teardrop.png'], method: 'drawn: her own render, both arms up throwing (Td throwing block.png would not cut out clean)' }); }
  // THE RUN (drawn; Running so fast TD.png is the pose): leaning into it, the front leg reaching, the back leg kicked up behind, the arms
  // pumping, her render's own determined grin.
  { const c = L.blank(limbless.w + 44, limbless.h + 6); L.paste(c, limbless, { x: 22 });
    limb(c, [[22 + 86, 172], [22 + 104, 180], [22 + 112, 194]], 6.5, 0, [7, 1, 9, 5]);   // the front leg, reaching
    limb(c, [[22 + 44, 170], [22 + 30, 184], [22 + 12, 178]], 6.5, 0, [-6, -2, 8, 5]);   // the back leg, kicked up behind
    limb(c, [[22 + 118, 142], [22 + 136, 148], [22 + 142, 130]], 6.5, 7);               // the front arm, pumping forward
    limb(c, [[22 + 14, 139], [22 + 0, 150], [22 - 12, 142]], 6.5, 7);                  // the back arm, swung back (from where it crossed her outline)
    emit(F, 'run', turn(L.trim(c, 2), 9), { src: ['teardrop.png'], method: 'drawn: her own render running, leaning in (Running so fast TD.png would not cut out clean)', flip: false }); }   // (her render's flag: the lean fools the measure)
  // HURT (Teardrop hurt.png, TPOT: a close-up, a pin poking into her): her squeezed-shut eyes and grimace, on her render.
  { const face = faceOf(S('Teardrop hurt.png'), { x: 64, y: 150, w: 150, h: 125 }, { whites: false, gain: 1.8 });
    const im = L.clone(blankT); putFace(im, face, 80, 100, { s: 0.5 });
    emit(F, 'hurt', L.trim(im, 2), { src: ['Teardrop hurt.png (her face)', 'teardrop.png'], method: 'face swap: her face (a close-up) on her own render' }); }
  // WIN: tongue out (Teardrop go blep -3.png, TPOT: an episode frame, cut off below her): her face on her render.
  { const face = faceOf(S('Teardrop go blep -3.png'), { x: 836, y: 570, w: 410, h: 530 }, { whites: false, gain: 1.8, extra: (r, g, b) => r > g + 50 && r > b + 30 });   // (from just right of where her arm meets her smile)
    const im = L.clone(blankT); putFace(im, face, 82, 104, { s: 0.18 });
    emit(F, 'blep', L.trim(im, 2), { src: ['Teardrop go blep -3.png (her face)', 'teardrop.png'], method: 'face swap: her face (an episode frame) on her own render' }); }
}

const ALL = { Lifering: lifering, Candle: candle, Cammy: cammy, 'Yin-Yang': yinyang, Leafy: leafy, Needle: needle, Snowball: snowball, Bomby: bomby, Bubble: bubble, Teardrop: teardrop };
for (const [name, fn] of Object.entries(ALL)) if (!ONLY || ONLY.includes(name)) { console.log(name); fn(); }
if (REPORT) writeFileSync(REPORT, JSON.stringify(rows, null, 2));
console.log(`\n${rows.length} pictures`);
