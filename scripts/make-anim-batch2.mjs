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
//   · an EPISODE FRAME: the background keyed out by a flood from the border (Teardrop's throw and run);
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
function inkOf(src, rect, { lo = 40, hi = 95, sat = 70 } = {}) {
  const r = L.crop(src, rect.x, rect.y, rect.w, rect.h), out = L.blank(r.w, r.h);
  for (let p = 0; p < r.w * r.h; p++) {
    const i = p * 4; if (r.d[i + 3] < L.ALPHA_FLOOR) continue;
    const l = L.lum(r.d[i], r.d[i + 1], r.d[i + 2]), s = Math.max(r.d[i], r.d[i + 1], r.d[i + 2]) - Math.min(r.d[i], r.d[i + 1], r.d[i + 2]);
    if (s > sat && l > lo) continue;
    const a = Math.max(0, Math.min(1, (hi - l) / (hi - lo)));
    if (a > 0.04) { out.d[i] = INK[0]; out.d[i + 1] = INK[1]; out.d[i + 2] = INK[2]; out.d[i + 3] = r.d[i + 3] * a; }
  }
  return out;
}
// A face as its INK and its WHITES only (eyes, teeth): for a face lifted off an episode frame whose light shades the body under it, where
// liftFace's flood stops at every shadow and would carry patches of the frame's body along. Whites are kept by how light they are.
function faceOf(src, rect, { lo = 40, hi = 100, sat = 70, whites = true, wlo = 175, whi = 225, extra = null } = {}) {
  const out = inkOf(src, rect, { lo, hi, sat }), r = L.crop(src, rect.x, rect.y, rect.w, rect.h);
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

// ---- LIFERING (Inanimate Insanity) -------------------------------------------------------------------------------------------------------
// His render is the 2024 Pose set's. We've Got a Sinker! is a whistle and then the dive (the dive picture already in the game); Proper Flying
// Formation is that dive tilted up (drawn, as the plan said); First Aid keeps its picture ("Keep them"); the foot run over (S4E1) is his hurt;
// his KO is drawn (LiferingEliminated.png, the Season 3 file the owner brought back, has the boxing glove and its burst over most of him, so
// it cannot be cut out -- as with Goo's in batch 1); his win is the other 2024 Pose (Lifering2024PoseAlt.png, the set his render is from).
// A RING's sectors (Lifering's red and white stripes run out from the hole): a painted-out pixel takes the colour the ring has at the same angle
// round the hole, from the nearest pixel along that ray that was not painted out -- so a stripe's edge stays a straight line.
function ringSnap(cx, cy, palette, r0 = 30, r1 = 104) {
  return (x, y, im, set) => {
    const a = Math.atan2(y - cy, x - cx), rad = Math.hypot(x - cx, y - cy);
    for (let d = 1; d < r1; d++) for (const r of [rad - d, rad + d]) {
      if (r < r0 || r > r1) continue;
      const X = Math.round(cx + r * Math.cos(a)), Y = Math.round(cy + r * Math.sin(a));
      if (X < 0 || Y < 0 || X >= im.w || Y >= im.h) continue;
      const i = (Y * im.w + X) * 4; if (set.has(i) || im.d[i + 3] < 220) continue;
      for (const c of palette) if (Math.hypot(im.d[i] - c[0], im.d[i + 1] - c[1], im.d[i + 2] - c[2]) < 40) return c;
    }
    return null;
  };
}
// Two halves split by a curve (Yin-Yang): a painted-out pixel is white left of the line joining where the split crosses the rect's top and
// bottom rows, black right of it.
function splitSnap(rect, im0, white, black) {
  const cross = (y) => { for (let x = rect.x; x < rect.x + rect.w; x++) { const i = (y * im0.w + x) * 4; if (L.lum(im0.d[i], im0.d[i + 1], im0.d[i + 2]) < 60) return x; } return rect.x + rect.w; };
  const xt = cross(rect.y - 1), xb = cross(rect.y + rect.h);
  return (x, y) => x < xt + (xb - xt) * (y - rect.y) / rect.h ? white : black;
}
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
  // his body under his face is white or one of two reds; anything else in the face's rects (the line-work, the teeth's grey edges, the tongue)
  // is painted out
  const RING = [[255, 255, 255], [248, 54, 67]];
  const notRing = (r, g, b) => Math.hypot(r - 255, g - 255, b - 255) > 34 && Math.hypot(r - 248, g - 54, b - 67) > 62 && Math.hypot(r - 230, g - 35, b - 70) > 50;
  // (the inside of his grin is white like the ring: what its outline closes in goes too, or it would stay as white islands on the stripes)
  // (and the grey rims of the hole and of the ring's outer edge, the only grey next to the clear, stay)
  const inGrin = enclosed(base, LIFERING_MOUTH, (r, g, b) => L.lum(r, g, b) < 120);
  const nearClear = (x, y) => { for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) { const X = x + dx, Y = y + dy;
    if (X < 0 || Y < 0 || X >= base.w || Y >= base.h || base.d[(Y * base.w + X) * 4 + 3] < L.ALPHA_FLOOR) return true; } return false; };
  const rim = (r, g, b, x, y) => L.lum(r, g, b) > 105 && L.lum(r, g, b) < 236 && Math.max(r, g, b) - Math.min(r, g, b) < 50 && nearClear(x, y);
  const noMouth = blankFace(base, [LIFERING_MOUTH], (r, g, b, x, y) => (notRing(r, g, b) || inGrin(x, y)) && !rim(r, g, b, x, y), ringSnap(126, 86, RING));
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
    const im = blankFace(noMouth, [LIFERING_EYES], notRing, ringSnap(130, 85, RING));
    putFace(im, eyes, 118, 37, { s: 0.5 });
    mouth(im, 142, 144, 50, 38, { line: 4.2 });
    emit(F, 'hurt', L.trim(im, 2), { src: ['Lifering gets his foot run over.png (his squeezed-shut eyes)', 'lifering.png'], method: 'face swap: his eyes (an episode frame) on his own render, his scream drawn' }); }
  // KO (drawn): turned over, eyes shut tight, a small slack mouth.
  { const im = blankFace(noMouth, [LIFERING_EYES], notRing, ringSnap(130, 85, RING));
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
  const F = 'Candle', base = B(F), bc = L.bodyColour(base, padR(CANDLE_FACE, 6));
  const off = (r, g, b) => Math.hypot(r - bc[0], g - bc[1], b - bc[2]) > 62;
  // CRYSTAL CHIME (drawn): her eyes shut, calm, a small open "o" as the crystal rings (the fork and crystal are drawn beside her by the game).
  { const im = blankFace(base, [CANDLE_FACE], off);
    shutEyes(im, 44, 114, 26, 7, 3, { up: false });
    L.fillEllipse(im, 47, 136, 4.5, 4, INK); L.fillEllipse(im, 47, 136.5, 2.6, 2.3, [92, 14, 36]);
    emit(F, 'chime', L.trim(im, 2), { src: ['candle.png'], method: 'drawn: her own render, eyes shut and humming (no show file)' }); }
  // SMASH WIND-UP: "this is maddening" (S4E3), a close-up cut off by the frame: her brows down and the bared teeth, on her render. The scene's
  // light shades her body across the face, so the face is taken as its ink and the whites of the teeth (faceOf).
  const blankC = blankFace(base, [CANDLE_FACE], off);
  const onCandle = (src, rect, at, s, extra) => { const im = L.clone(blankC); putFace(im, faceOf(src, rect), at[0], at[1], { s }); if (extra) extra(im); return L.trim(im, 2); };
  emit(F, 'maddening', onCandle(S('Candle “this is maddening”.jpeg'), { x: 118, y: 296, w: 272, h: 266 }, [46, 126], 0.17),
    { src: ['Candle “this is maddening”.jpeg', 'candle.png'], method: 'face swap: her face (a close-up, S4E3) on her own render' });
  // SMASH: mad (Candle Mad.png, Season 3), as the show's cut-out has her (with the paper in her hand).
  emit(F, 'mad', toBase(S('Candle Mad.png'), F), { src: ['Candle Mad.png'], method: 'cut-out (wiki pose)' });
  // HIT: flabbergasted (S4E1, Teddy Bear beside her), then scared (Candle Scared.png, Season 3).
  // (Turned three-quarters in the frame, she shows one eye: it is laid for both, the second mirrored, over her open wavering mouth.)
  { const src = S('Candle flabbergasted.png'), dark = { lo: 14, hi: 44, whites: false };   // (a dim room: only the true black of her face is ink)
    const eye = faceOf(src, { x: 1205, y: 655, w: 42, h: 70 }, dark), mth = faceOf(src, { x: 1185, y: 760, w: 160, h: 60 }, dark);
    const im = L.clone(blankC);
    // (the eyes are plain black ovals in the frame, too small there to lift cleanly in its dim light: drawn as the frame has them, its mouth lifted)
    for (const x of [35, 57]) L.fillEllipse(im, x, 114, 2.8, 5.6, INK);
    L.keepParts(mth, (pt) => pt.box.w > 40);   // (the mouth's line only, not a speck of the dim room beside it)
    putFace(im, mth, 47, 138, { s: 0.2 });
    emit(F, 'flabbergasted', L.trim(im, 2), { src: ['Candle flabbergasted.png', 'candle.png'], method: 'face swap: her mouth (an episode frame, S4E1) on her own render, its eyes drawn as the frame has them' }); }
  emit(F, 'scared', toBase(S('Candle Scared.png'), F), { src: ['Candle Scared.png'], method: 'cut-out (wiki pose)' });
  // WIN: the giggle (S4E2, Cheesy beside her), then the laugh (Candle Laughing.png, Season 3).
  emit(F, 'giggle', onCandle(S('S4E2 Candle giggles at Cheesy.png'), { x: 574, y: 212, w: 112, h: 84 }, [46, 124], 0.36),
    { src: ['S4E2 Candle giggles at Cheesy.png', 'candle.png'], method: 'face swap: her face (an episode frame, S4E2) on her own render' });
  emit(F, 'laughing', toBase(S('Candle Laughing.png'), F), { src: ['Candle Laughing.png'], method: 'cut-out (wiki pose)' });
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
  const blankC = blankFace(body, [CAMMY_FACE], (r, g, b) => L.lum(r, g, b) > 95 && Math.max(r, g, b) - Math.min(r, g, b) < 70);
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
const YY_SNAP = [[255, 255, 255], [8, 8, 8]];
function yinyang() {
  const F = 'Yin-Yang', base = B(F), rig = RIG[F];
  const noArms = L.clone(base); for (const a of rig.arms) eraseLimb(noArms, a);
  const W = 7.5, FIST = 8.5, WH = [246, 246, 246];   // their limb line weight and fist at this size; Yang's white ink
  // their eyes and brows painted out (each half's own colour put back, the S-curve between them kept sharp)
  const noEyes = blankFace(noArms, [{ x: 48, y: 44, w: 34, h: 54 }, { x: 98, y: 52, w: 34, h: 48 }],
    (r, g, b, x) => x < 90 ? L.lum(r, g, b) < 238 : L.lum(r, g, b) > 40, YY_SNAP);
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
  // KO (drawn): knocked over, the arms flung out, eyes squeezed shut ("> <": black on Yin, white on Yang), the grin dropped to a small open mouth.
  { const MR = { x: 52, y: 98, w: 104, h: 44 }, im = blankFace(noEyes, [MR], () => true, splitSnap(MR, noEyes, YY_SNAP[0], YY_SNAP[1]));
    L.stroke(im, [[58, 72], [74, 81], [58, 90]], 5, INK);
    L.stroke(im, [[124, 76], [108, 85], [124, 94]], 5, WH);
    mouth(im, 84, 122, 22, 18, { teeth: false, line: 4 });
    const pad = 26, c = L.blank(im.w + pad * 2, im.h); L.paste(c, im, { x: pad });
    limb(c, [[pad + 12, 100], [pad - 6, 112], [pad - 14, 130]], W, FIST);
    limb(c, [[pad + 186, 124], [pad + 206, 130], [pad + 220, 122]], W, FIST);
    emit(F, 'ko', turn(L.trim(c, 2), 26), { src: ['yin-yang.png'], method: 'drawn: their own render knocked over, eyes squeezed shut (YinYangEliminated.png hides them behind the glove)' }); }
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
  const edge = L.dilate(new Uint8Array(base.w * base.h).map((_, p) => base.d[p * 4 + 3] < 128 ? 1 : 0), base.w, base.h, 6);   // her outline's band: kept
  const blankL = blankFace(base, [LEAFY_FACE], (r, g, b, x, y) => (notLeaf(r, g, b) && !edge[y * base.w + x]) || inSnarl(x, y));
  // ATTACK: smug (Smugleafy.png, BFB, the sky and the floor behind her). Seen three-quarters, she shows one eye; it is laid for both, the second
  // mirrored, over her smirk.
  { const src = S('Smugleafy.png'), eye = faceOf(src, { x: 330, y: 240, w: 100, h: 140 }, { whites: false }), smirk = faceOf(src, { x: 270, y: 370, w: 170, h: 110 }, { whites: false });
    const im = L.clone(blankL);
    putFace(im, eye, 40, 84, { s: 0.36, mirror: true }); putFace(im, eye, 76, 84, { s: 0.36 }); putFace(im, smirk, 60, 122, { s: 0.36 });
    emit(F, 'smug', L.trim(im, 2), { src: ['Smugleafy.png (her face)', 'leafy.png'], method: 'face swap: her face (an episode frame) on her own render, its one eye laid for both' }); }
  // HIT: angry (Angry Leafy.png, BFB 6: Firey beside her, the lava behind): her face, tipped over in the frame, turned upright onto her render.
  { const face = faceOf(S('Angry Leafy.png'), { x: 270, y: 90, w: 340, h: 320 });
    const im = L.clone(blankL);
    putFace(im, face, 57, 100, { s: 0.33, rot: -0.98 });
    emit(F, 'angry', L.trim(im, 2), { src: ['Angry Leafy.png (her face)', 'leafy.png'], method: 'face swap: her face (an episode frame, tipped over: turned upright) on her own render' }); }
  // KINDNESS PARRY (drawn): a warm smile, eyes shut happy, both arms open wide.
  { const im = L.clone(blankL); for (const a of rig.arms) eraseLimb(im, a);
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
    emit(F, 'angry', toBase(src, F), { src: ['Angrybombythetpot20.png'], method: 'cut-out (wiki pose), recoloured from its scene\'s navy to his render\'s greys', flip: false }); }
  // KO, charred (drawn): his render blackened by the blast, dazed "x x" eyes, the fuse burnt down to a stub.
  { const im = L.clone(base);
    for (let p = 0; p < im.w * im.h; p++) { const i = p * 4; if (im.d[i + 3] < 24) continue;
      const g = L.lum(im.d[i], im.d[i + 1], im.d[i + 2]), k = 0.55; for (let c = 0; c < 3; c++) im.d[i + c] = im.d[i + c] * k * 0.7 + g * k * 0.3; }
    L.eraseRect(im, 0, 0, 62, 38);   // the fuse's rope
    const bc = L.bodyColour(im, { x: 80, y: 50, w: 70, h: 70 }), noFace = blankFace(im, [{ x: 82, y: 50, w: 60, h: 76 }], (r, g, b) => L.lum(r, g, b) < 34 || Math.hypot(r - bc[0], g - bc[1], b - bc[2]) > 26);
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
  for (const [key, file] of [['stance', 'Bubble 18 Stance 1.png'], ['flinch', 'Bubble - phew, i almost got punched.png'], ['gasp', 'Bubble gasp.png']])
    emit(F, key, toBase(S(file), F), { src: [file], method: 'cut-out (wiki pose)' });
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
    emit(F, 'yay', toBase(im, F), { src: ['Bubble - yay.png'], method: 'cut-out (wiki pose), the bubble\'s edge cut off by its canvas filled from the other side' }); }
  // THERMAL RISE (drawn): her render stretched up as she rises, both arms up, the legs tucked under.
  { const im = L.clone(base); for (const a of rig.arms) eraseLimb(im, a); for (const g of rig.legs) eraseLimb(im, g);
    const body = squash(im, 0.93, 1.08), pad = 46, c = L.blank(body.w + 30, body.h + pad + 10); L.paste(c, body, { x: 15, y: pad });
    const ox = 15, oy = pad, sx = 0.93, sy = 1.08, P = (x, y) => [ox + x * sx, oy + y * sy];
    limb(c, [P(26, 140), P(12, 104), [ox + 10, 40]], 5.5, 6.5);
    limb(c, [P(152, 140), P(168, 104), [ox + 158, 38]], 5.5, 6.5);
    limb(c, [P(64, 168), P(56, 182), P(70, 192)], 5.5, 0, [6, 0, 8, 4.5]);
    limb(c, [P(114, 168), P(124, 182), P(110, 192)], 5.5, 0, [-6, 0, 8, 4.5]);
    emit(F, 'rise', L.trim(c, 2), { src: ['bubble.png'], method: 'drawn: her own render rising, arms up, legs tucked (HER JUMP.png is a storyboard sketch)' }); }
}

// ---- TEARDROP (BFDI) ----------------------------------------------------------------------------------------------------------------------
// THE KICK is drawn: the BFB 27 push (Teardrop literally pushes Flower.png) has both arms out and her feet planted -- it does not read as a
// kick -- and its canvas cuts off her left side. The throw and the run are keyed out of their episode frames; the angry, hurt and blep faces
// go on her render (a small 149px frame, a close-up half behind a pin, and a frame cut off at her feet).
const TD_FACE = { x: 34, y: 40, w: 82, h: 114 };
function teardrop() {
  const F = 'Teardrop', base = B(F), rig = RIG[F];
  // her face painted out: its line-work, and the teeth her grin's outline closes in; the gradient and the shine of her body stay as they are
  const inGrin = enclosed(base, TD_FACE, (r, g, b) => L.lum(r, g, b) < 90);
  const blankT = blankFace(base, [TD_FACE], (r, g, b, x, y) => L.lum(r, g, b) < 100 || inGrin(x, y), null, { minA: 140, alpha: true, soften: 3 });   // (her water is see-through: alpha ~180)
  // ANGRY (TPOT2teardropangry.png, a 149x170 episode frame on a pale blue ground): her brows down and frown, on her render.
  const angry = L.clone(blankT); putFace(angry, faceOf(S('TPOT2teardropangry.png'), { x: 40, y: 50, w: 82, h: 80 }, { whites: false }), 76, 100, { s: 1.2 });
  emit(F, 'angry', L.trim(angry, 2), { src: ['TPOT2teardropangry.png (her face)', 'teardrop.png'], method: 'face swap: her face (a 149px episode frame) on her own render' });
  // THE KICK (drawn): her legs taken off along their outlines; wound up (the kicking leg drawn back and up behind her, knee bent), then the
  // kick (that leg straight out in front at hip height, the foot turned up), the other leg planted. Her angry face.
  const legless = L.clone(angry); for (const g of rig.legs) eraseLimb(legless, g);
  { const c = L.blank(legless.w + 30, legless.h); L.paste(c, legless, { x: 30 });
    limb(c, [[30 + 82, 172], [30 + 84, 186], [30 + 98, 193]], 6.5, 0, [2, 1, 9, 5]);   // the planted leg
    limb(c, [[30 + 46, 170], [30 + 22, 180], [30 + 6, 164]], 6.5, 0, [-4, -3, 9, 5]);   // the kicking leg, drawn back
    emit(F, 'kick-1', L.trim(c, 2), { src: ['teardrop.png', 'TPOT2teardropangry.png (her face)'], method: 'drawn: her own render winding up a kick (no show file of the kick in her TPOT look)' }); }
  { const c = L.blank(legless.w + 50, legless.h); L.paste(c, legless, {});
    limb(c, [[44, 172], [40, 186], [28, 193]], 6.5, 0, [-2, 1, 9, 5]);                  // the planted leg
    limb(c, [[86, 168], [122, 162], [156, 150]], 6.5, 0, [5, -5, 6, 10]);               // the kick, out in front
    emit(F, 'kick-2', L.trim(c, 2), { src: ['teardrop.png', 'TPOT2teardropangry.png (her face)'], method: 'drawn: her own render kicking (no show file of the kick in her TPOT look)' }); }
  // THE THROW (Td throwing block.png, TPOT, a fence and a wall behind her): keyed out from the border -- she is her blues and her black limbs.
  { const im = S('Td throwing block.png');
    const her = (r, g, b) => (b > r + 45 && b > 120 && g > r) || (L.lum(r, g, b) < 48 && Math.max(r, g, b) - Math.min(r, g, b) < 34);
    L.matteEdge(im, L.floodBg(im, (r, g, b) => !her(r, g, b)));
    L.keepParts(im, (p) => p.n > 2000);
    // her tip is see-through in the frame, and the fence shows through it: inside her (8px in from her edge), what is darker than her blue and
    // is not her black face is painted out from her body round it
    const clearD = L.dilate(new Uint8Array(im.w * im.h).map((_, p) => im.d[p * 4 + 3] < 128 ? 1 : 0), im.w, im.h, 8);
    L.paintOut(im, { x: 0, y: 0, w: im.w, h: im.h }, (x, y, r, g, b) => !clearD[y * im.w + x] && L.lum(r, g, b) > 40 && L.lum(r, g, b) < 118 && !(b > r + 110));
    emit(F, 'throw', toBase(im, F), { src: ['Td throwing block.png'], method: 'episode frame, the fence and wall keyed out (and the fence seen through her tip)' }); }
  // HURT (Teardrop hurt.png, TPOT: a close-up, a pin poking into her): her squeezed-shut eyes and grimace, on her render.
  { const face = faceOf(S('Teardrop hurt.png'), { x: 64, y: 150, w: 150, h: 125 }, { whites: false });
    const im = L.clone(blankT); putFace(im, face, 80, 100, { s: 0.5 });
    emit(F, 'hurt', L.trim(im, 2), { src: ['Teardrop hurt.png (her face)', 'teardrop.png'], method: 'face swap: her face (a close-up) on her own render' }); }
  // THE RUN (Running so fast TD.png, BFB: her on a pink ground over a red road): keyed out from the border.
  { const im = L.crop(S('Running so fast TD.png'), 560, 180, 222, 380);
    const her = (r, g, b) => (b > r + 30 && b > 140) || (L.lum(r, g, b) < 55 && Math.max(r, g, b) - Math.min(r, g, b) < 40) || (L.lum(r, g, b) > 225 && Math.max(r, g, b) - Math.min(r, g, b) < 25);
    L.matteEdge(im, L.floodBg(im, (r, g, b) => !her(r, g, b)));
    L.keepParts(im, (p) => p.n > 150);
    emit(F, 'run', toBase(im, F), { src: ['Running so fast TD.png'], method: 'episode frame, the pink ground and the road keyed out' }); }
  // WIN: tongue out (Teardrop go blep -3.png, TPOT: an episode frame, cut off below her): her face on her render.
  { const face = faceOf(S('Teardrop go blep -3.png'), { x: 836, y: 570, w: 410, h: 530 }, { whites: false, extra: (r, g, b) => r > g + 50 && r > b + 30 });   // (from just right of where her arm meets her smile)
    const im = L.clone(blankT); putFace(im, face, 82, 104, { s: 0.18 });
    emit(F, 'blep', L.trim(im, 2), { src: ['Teardrop go blep -3.png (her face)', 'teardrop.png'], method: 'face swap: her face (an episode frame) on her own render' }); }
}

const ALL = { Lifering: lifering, Candle: candle, Cammy: cammy, 'Yin-Yang': yinyang, Leafy: leafy, Needle: needle, Snowball: snowball, Bomby: bomby, Bubble: bubble, Teardrop: teardrop };
for (const [name, fn] of Object.entries(ALL)) if (!ONLY || ONLY.includes(name)) { console.log(name); fn(); }
if (REPORT) writeFileSync(REPORT, JSON.stringify(rows, null, 2));
console.log(`\n${rows.length} pictures`);
