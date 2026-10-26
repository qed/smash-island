// ============================================================================
//  make-anim-batch1.mjs -- the picture sets of animation batch 1 ("animations should be like pb's animations", the owner, 2026-10-19)
// ============================================================================
//   node scripts/make-anim-batch1.mjs --src=<folder of the downloaded wiki files> --dec=<folder of the decoded WebP/JPEG/GIF frames>
//        [--out=artifacts/V1/assets/sprites] [--only=Bell,Box] [--report=<file.json>]
//
// Donut, Sidewalky, Lollipop, Box, Tissues, Goo, Bell, Paintbrush and Teddy Bear each get a set of pictures for their moves, their hits,
// their KO and their win, the way Puffball has hers (FIGHTER_ANIM / POSE_SETS in index.html). The sources are the files listed in
// smash-bal/reports/moves/anim-batch1-download-list.md (Core and Alt rows), downloaded once from the two wikis' own file pages; every
// output records which of them it came from (`--report`, copied into the sprite manifests and CREDITS.md).
//
// What happens to a source, by kind:
//   · a clean cut-out (a wiki "Poses" render, already transparent): sized to the fighter and trimmed;
//   · an EPISODE FRAME (a background, or someone else in it): the background keyed out by a flood from the border, stray parts dropped;
//   · an OFFICIAL BODY with no face (the show draws faces on separately: Bell's turn and zapped bodies, Sidewalky's falling slabs and his
//     red body, Lollipop's screech and her open mouth, Goo's forms, Donut's mouth shapes): the face is lifted off one of the fighter's own
//     pictures (liftFace) and laid on, turned and squeezed with the body, and the render's own painted limbs go round it (dress);
//   · a FACE SWAP, for a frame cut off by its edge or half hidden (Teddy's "No!!" and her run, Tissues' OUT and happy close-ups, Lollipop's
//     laugh, Paintbrush shocked): the frame's face on the fighter's own render, its painted face filled out first (swapFace);
//   · a pose the show never drew (Lollipop's Candy Twirl): drawn by turning her own render.
// Sizing: every picture is drawn at its fighter's pixel density, so a pose is the same size as the fighter: the area of its fill (the
// body without line-work) is matched to the base render's, then the picture is trimmed; one taller than 200px is shrunk to 200 and keeps
// `k` (POSE_SETS draws it at k). The WebP, JPEG and GIF sources were decoded to PNG first (losslessly, in a browser: one PNG per GIF frame,
// "<name>-NN.png") since pngjs reads PNG only. The report (`--report`) is what the pose table, the manifests and CREDITS.md are made from.
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
// --src2 / --dec2: the ART CONSISTENCY files ("use the s4 art" ... "jst try to make it consistent by character", the owner, 2026-10-21): the nine
// files of smash-bal/reports/moves/anim-consistency-download-list.md, and Teddydance.gif decoded to one PNG a frame ("Teddydance-NNN.png").
// They replace the pictures of Box, Tissues, Paintbrush and Teddy Bear that came from another art era than the rest of that fighter's set.
const SRC2 = flag('src2'), DEC2 = flag('dec2');
if (!SRC || !DEC) { console.error('usage: node scripts/make-anim-batch1.mjs --src=<downloads> --dec=<decoded> [--src2=<consistency downloads> --dec2=<their decoded GIF frames>]'); process.exit(1); }
const SPR = 'artifacts/V1/assets/sprites';
const BASE = { Donut: 'donut.png', Sidewalky: 'sidewalky.png', Lollipop: 'lollipop.png', Box: 'box.png', Tissues: 'tissues.png', Goo: 'goo.png',
  Bell: 'bell.png', Paintbrush: 'paintbrush.png', 'Teddy Bear': 'teddy-bear.png' };
const WIKI = { Donut: 'battlefordreamisland', Sidewalky: 'battlefordreamisland', Lollipop: 'battlefordreamisland', Bell: 'battlefordreamisland',
  Box: 'inanimateinsanity', Tissues: 'inanimateinsanity', Goo: 'inanimateinsanity', Paintbrush: 'inanimateinsanity', 'Teddy Bear': 'inanimateinsanity' };
// The renders' own flags (SPRITES): a front-facing pose keeps its fighter's.
const BASE_FLIP = { Donut: true, Lollipop: true, Tissues: true, Paintbrush: true };
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const S = (f) => L.load(join(SRC, f));          // a downloaded PNG
const D = (f) => L.load(join(DEC, f));          // a decoded WebP / JPEG / GIF frame
const need2 = (dir, k) => { if (!dir) throw new Error(`--${k}= is needed (the art consistency files)`); return dir; };
const S2 = (f) => L.load(join(need2(SRC2, 'src2'), f));   // an art consistency download
const D2 = (f) => L.load(join(need2(DEC2, 'dec2'), f));   // a decoded frame of one
const B = (fighter) => L.load(join(SPR, BASE[fighter]));
const rows = [];

// The base render's fill area, and a pose scaled so its fill matches it (times k), then trimmed.
const baseArea = {};
function toBase(im, fighter, k = 1) {
  if (!baseArea[fighter]) baseArea[fighter] = L.fillArea(B(fighter));
  const s = Math.sqrt(baseArea[fighter] / L.fillArea(im)) * k;
  return L.trim(L.scaleBy(L.trim(im, 0), s), 2);
}
// The centre of a picture's fill (body without line-work) and its box.
function fillCentre(im) {
  let n = 0, sx = 0, sy = 0;
  for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) { const i = (y * im.w + x) * 4; if (im.d[i + 3] >= 128 && L.lum(im.d[i], im.d[i + 1], im.d[i + 2]) > 70) { n++; sx += x; sy += y; } }
  return [sx / n, sy / n];
}
// Lay a lifted face on a body: its centre (fx, fy) in the face layer goes to (x, y), scaled, squeezed across by `squeeze`, turned by rot,
// and only where the body is (so a face sliding round a turning bell is clipped at its edge).
function putFace(body, face, x, y, { s = 1, squeeze = 1, rot = 0, fx = face.w / 2, fy = face.h / 2, clip = true, mirror = false } = {}) {
  const f = s < 0.8 ? L.scaleBy(face, s) : face, k = s < 0.8 ? 1 : s, r = s < 0.8 ? s : 1;
  return L.paste(body, f, { x, y, ox: fx * r, oy: fy * r, sx: k * squeeze * (mirror ? -1 : 1), sy: k, rot, mode: clip ? 'atop' : 'over' });
}

// Every picture is at most 200px tall, like the renders: a pose that comes out taller (an arm in the air) is shrunk to 200 and keeps
// `k`, its pixels per pixel of the fighter's own render, so the game still draws it at the fighter's size (POSE_SETS: imgH = q*h/k).
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
  // The flag: measured, unless the picture faces the front (|facing| under 0.03), where it keeps the render's own so a swap never
  // mirrors the fighter for nothing; `meta.flip` is set by eye where the measure is fooled (a side-on body with no face).
  const front = Math.abs(a.facing) < 0.03;
  const flip = meta.flip != null ? meta.flip : (front ? !!BASE_FLIP[fighter] : a.facing < 0);
  const row = { name: `${fighter} (${key})`, fighter, key, slug: slug(`${fighter} (${key})`), ok: true, file, width: a.w, height: a.h, k: +k.toFixed(4),
    facing: +a.facing.toFixed(3), flip, inkPixels: a.inkPixels, cleanedHaloPixels: cleaned, coverage: +a.coverage.toFixed(3),
    wiki: WIKI[fighter], sources: meta.src, method: meta.method, note: meta.note || '' };
  if (bad.length) row.checkNote = bad.join('; ');
  rows.push(row);
  console.log(`  ${file.padEnd(34)} ${String(a.w).padStart(3)}x${a.h} k${k.toFixed(3)}  facing ${a.facing.toFixed(3).padStart(6)}${row.flip ? ' (flip)' : ''}  ink ${a.inkPixels}  ${meta.method}`);
}

// The parts of a fighter's own render a new body is dressed in: its body (bodyMask), the painted limbs outside it, and where the body sits.
function partsOf(im, opt) {
  const m = L.bodyMask(im, opt || {}), limbs = L.limbsOf(im, m);
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let p = 0; p < im.w * im.h; p++) if (m[p]) { const x = p % im.w, y = (p / im.w) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return { mask: m, limbs, box: { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 } };
}
// An OFFICIAL BODY dressed as the fighter: the body (trimmed) laid where the render's body is, at its size (`fit`: 'w', 'h' or 'both'),
// on a canvas the size of the render, with the render's own painted limbs round it.
function dress(fighter, body, { fit = 'w', limbs = true, dx = 0, dy = 0, pad = 0, scale = 1, under = null, base = null } = {}) {
  base = base || B(fighter);
  const P = partsOf(base), t = L.trim(body, 0);
  const s = (fit === 'h' ? P.box.h / t.h : fit === 'both' ? Math.sqrt((P.box.w * P.box.h) / (t.w * t.h)) : P.box.w / t.w) * scale;
  const sm = s < 0.8 ? L.scaleBy(t, s) : t, ks = s < 0.8 ? 1 : s;
  const W = base.w + pad * 2, H = base.h + pad * 2, out = L.blank(W, H);
  if (under) L.paste(out, under, { x: pad, y: pad });
  if (limbs) L.paste(out, P.limbs, { x: pad, y: pad });
  L.paste(out, sm, { x: pad + P.box.x + P.box.w / 2 + dx, y: pad + P.box.y + P.box.h / 2 + dy, ox: sm.w / 2, oy: sm.h / 2, sx: ks, sy: ks });
  return { im: out, cx: pad + P.box.x + P.box.w / 2 + dx, cy: pad + P.box.y + P.box.h / 2 + dy, r: P.box.w / 2, P };
}
// Drawn eyes, for an official face that comes without them: black ovals (the frame layer's own "dots"), or the squeezed-shut "> <".
function ovalEyes(im, cx, cy, gap, rx, ry, rot = 0) { for (const s of [-1, 1]) L.fillEllipse(im, cx + s * gap / 2, cy, rx, ry, [22, 22, 22], s * rot); return im; }
function squeezeEyes(im, cx, cy, gap, size, wdt) {
  for (const s of [-1, 1]) { const x = cx + s * gap / 2, d = -s;   // the point of each chevron faces the middle
    L.stroke(im, [[x - d * size * 0.55, cy - size * 0.55], [x + d * size * 0.45, cy], [x - d * size * 0.55, cy + size * 0.55]], wdt, [22, 22, 22]); }
  return im;
}
// The transparent hole of a ring-shaped body (Donut's mouth): its centre and top, inside a disc at (cx, cy, r).
function holeOf(im, cx, cy, r) {
  let n = 0, sx = 0, top = 1e9, sy = 0;
  for (let y = Math.max(0, Math.floor(cy - r)); y < Math.min(im.h, cy + r); y++) for (let x = Math.max(0, Math.floor(cx - r)); x < Math.min(im.w, cx + r); x++) {
    if ((x - cx) ** 2 + (y - cy) ** 2 > (r * 0.86) ** 2) continue;
    if (im.d[(y * im.w + x) * 4 + 3] < 40) { n++; sx += x; sy += y; if (y < top) top = y; }
  }
  return { x: sx / Math.max(1, n), y: sy / Math.max(1, n), top, n };
}
// Brown line-work (Donut's outline) and a cut along it: the background flooded in from the border (and out of a hole from a seed in it).
const donutBrown = (r, g, b) => Math.hypot(r - 196, g - 138, b - 78) < 58 && r > g && g > b;

// ---- DONUT ---------------------------------------------------------------------------------------------------------------------------
// His mouth IS his hole, so the official face set (Donut C/L/R ...0001: smile, neutral, open, O and frown) is his body with the mouth
// shapes and nothing else. Each is dressed as him: laid on his render's disc at its size, with his own painted arms and legs, and eyes:
// his own ^ ^ (lifted off his render) on the smiles, drawn ovals (the frame layer's "dots") on the others, his angry eyes (lifted off
// Donut Angry.png) on the frown. The R files are the 169px 2012 versions; L is the same face mirrored, so L at 3800px is used and the
// game mirrors it (the flag). L Smile exists only at 169px, which is still bigger than his disc in the game.
function donut() {
  const F = 'Donut', base = B(F), P = partsOf(base);
  const cx0 = P.box.x + P.box.w / 2, r0 = P.box.w / 2;
  // his ^ ^ (the two ink parts above his mouth) and Donut Angry's eyes, as layers
  const happy = L.inkLayer(base, { x: 56, y: 22, w: 112, h: 36 }, { inkLum: 30, bodyLum: 125 });
  const ang = S('Donut Angry.png'), aP = partsOf(ang), aR = aP.box.w / 2;
  const angryEyes = L.scaleBy(L.inkLayer(ang, { x: Math.round(aP.box.x + aR * 0.5), y: Math.round(aP.box.y + aR * 0.2), w: Math.round(aR * 1.05), h: Math.round(aR * 0.45) }, { inkLum: 30, bodyLum: 125 }), r0 / aR);
  const FACES = [['smile', 'Smile'], ['n', 'N'], ['open', 'Open'], ['o', 'O'], ['frown', 'Frown']];
  for (const side of ['C', 'L']) for (const [key, tag] of FACES) {
    const file = `Donut ${side} ${tag}0001.png`, src = S(file);
    const { im, cx, cy, r } = dress(F, src, { fit: 'w' });
    const hole = holeOf(im, cx, cy, r), ex = side === 'C' ? cx0 - 2 : hole.x, gap = (side === 'C' ? 61 : 50);
    const eyeY = Math.min(41, hole.top - r * 0.2);
    if (key === 'smile') L.paste(im, happy, { x: ex, y: eyeY, ox: happy.w / 2, oy: happy.h / 2, sx: side === 'C' ? 1 : 0.84, sy: 1 });
    else if (key === 'frown') L.paste(im, angryEyes, { x: ex, y: eyeY + 2, ox: angryEyes.w / 2, oy: angryEyes.h / 2, sx: side === 'C' ? 1 : 0.84, sy: 1 });
    else ovalEyes(im, ex, eyeY + 2, gap, key === 'o' ? 6.5 : 5.5, key === 'o' ? 11 : 10);
    emit(F, side === 'C' ? key : `${key}-side`, L.trim(im, 2), { src: [file, 'donut.png (his limbs' + (key === 'smile' ? ' and his ^ ^)' : ')')].concat(key === 'frown' ? ['Donut Angry.png (his angry eyes)'] : []),
      method: 'official face + his own limbs and eyes', flip: side === 'L' ? true : undefined });
  }
  // SPRINKLE SPIN: looking up, happy (DonutUp happy.png, official): the mouth seen from below, his ^ ^ on the band above it.
  { const { im, cx, cy, r } = dress(F, S('DonutUp happy.png'), { fit: 'w' });
    L.paste(im, happy, { x: cx, y: cy - r * 0.8, ox: happy.w / 2, oy: happy.h / 2, sx: 0.9, sy: 0.8 });
    emit(F, 'up', L.trim(im, 2), { src: ['DonutUp happy.png', 'donut.png (his limbs and his ^ ^)'], method: 'official body + his own limbs and eyes' }); }
  // HURT: screeched (Screeched Donut BFB 1.png, a cut-out), frazzled; the eyes squeezed shut ("> <", drawn) since the file has none.
  { const { im, cx, cy, r } = dress(F, S('Screeched Donut BFB 1.png'), { fit: 'w', scale: 0.95 });
    squeezeEyes(im, cx - 4, cy - r * 0.6, 58, 15, 4.2);
    emit(F, 'screeched', L.trim(im, 2), { src: ['Screeched Donut BFB 1.png', 'donut.png (his limbs)'], method: 'cut-out (wiki pose) + his own limbs, eyes drawn' }); }
  // SMASH: angry (Donut Angry.png), a clean cut-out with his own face and limbs.
  emit(F, 'angry', toBase(S('Donut Angry.png'), F), { src: ['Donut Angry.png'], method: 'cut-out (wiki pose)' });
  // SPRINKLE ROLL: rolling, eyes squeezed shut (Donut rolling to a bush with limbs.png, an episode frame): the ring cut out along its
  // own outline -- the sky, the sand and the bush flooded out from the border, and out of the hole from inside it, both stopping at the brown line.
  { const im = L.crop(S('Donut rolling to a bush with limbs.png'), 500, 290, 640, 640);
    const notRing = (r, g, b) => !donutBrown(r, g, b);
    L.cutPred(im, notRing, { ink: [190, 132, 72] });
    L.cutPred(im, notRing, { seeds: [[343, 258]], ink: [190, 132, 72] });
    L.keepParts(im, (p) => p.n > 2000);
    emit(F, 'roll', toBase(im, F, 0.98), { src: ['Donut rolling to a bush with limbs.png'], method: 'episode frame, cut out along his outline' }); }
  // ATTACK (a kick): Donut kicks Four.png, the ring turned three-quarters with a leg out; Four and the white blur cut away along the ring's
  // outline, the leg kept (the black stroke out of its right side, x 1480-1700 of the frame).
  { const src = L.crop(S('Donut kicks Four.png'), 930, 280, 790, 690), im = L.clone(src);
    L.cutPred(im, (r, g, b) => !donutBrown(r, g, b), { ink: [190, 132, 72] });
    L.cutPred(im, (r, g, b) => !donutBrown(r, g, b), { seeds: [[340, 420]], ink: [190, 132, 72] });
    L.keepParts(im, (p) => p.n > 2000);
    const leg = L.blank(src.w, src.h);   // only the black of the leg, inside its own box
    for (let y = 430; y < 615; y++) for (let x = 548; x < 720; x++) {
      const i = (y * src.w + x) * 4, l = L.lum(src.d[i], src.d[i + 1], src.d[i + 2]);
      if (l < 120) { leg.d[i] = leg.d[i + 1] = leg.d[i + 2] = 20; leg.d[i + 3] = Math.min(255, (150 - l) * 2.2); }
    }
    L.keepParts(leg, (p) => p.n > 300);
    L.paste(im, leg, {});
    emit(F, 'kick', toBase(im, F, 1.0), { src: ['Donut kicks Four.png'], method: 'episode frame, cut out along his outline', faceless: true, note: 'side-on mid-kick: no face shows', flip: true }); }
}

// A face lifted off a picture and sized for another: `rect` in the source, scaled by the ratio of the two bodies' widths.
function faceFrom(im, rect, toWidth, fromWidth, tol = 70) {
  const f = L.liftFace(im, rect, L.bodyColour(im, { x: rect.x - 10, y: rect.y - 10, w: rect.w + 20, h: rect.h + 20 }), tol);
  const s = toWidth / fromWidth;
  return s < 0.95 ? L.scaleBy(f, s) : f;
}

// ---- SIDEWALKY ---------------------------------------------------------------------------------------------------------------------------
// The official bodies have no face and no limbs (his BFDIE 4 red rage body, the Breaking and falling slabs, his frozen block): each is
// dressed in his own -- the face lifted off one of his pictures, the painted arms and legs of his render where they fit.
function sidewalky() {
  const F = 'Sidewalky', base = B(F), P = partsOf(base), bw = P.box.w;
  const ready = S('Sidewalky Ready To Strike.PNG'), crush = S('Sidewalky preparing to CRUSH.png');
  const readyFace = faceFrom(ready, { x: 70, y: 105, w: 150, h: 160 }, bw, 317);
  const crushFace = faceFrom(crush, { x: 200, y: 148, w: 160, h: 198 }, bw, 451);
  const ownFace = L.liftFace(base, { x: 48, y: 50, w: 82, h: 70 }, L.bodyColour(base, { x: 30, y: 30, w: 140, h: 120 }), 70);
  const faceAt = [P.box.x + bw * 0.47, P.box.y + P.box.h * 0.5];   // where his face sits on his body
  // His flags go by the side band, not the measure (the band reads as ink): band on the left, as on his render, faces right.
  emit(F, 'crush', toBase(crush, F), { src: ['Sidewalky preparing to CRUSH.png'], method: 'cut-out (wiki pose)', flip: false });
  emit(F, 'brace', toBase(ready, F), { src: ['Sidewalky Ready To Strike.PNG'], method: 'cut-out (wiki pose)', flip: true });
  emit(F, 'cracked', toBase(S('Sidewalky cracked.png'), F), { src: ['Sidewalky cracked.png'], method: 'cut-out (wiki pose)', flip: false });
  emit(F, 'laughing', toBase(S('Sidewalkylaughing.png'), F), { src: ['Sidewalkylaughing.png'], method: 'cut-out (wiki pose)', flip: true });
  // PAVEMENT SLAM, enraged: the red body of BFDIE 4 (Sw angery 2.png: his side band on the left, as on his render), his gritted teeth.
  { const { im } = dress(F, S('Sw angery 2.png'), { fit: 'both' });
    putFace(im, readyFace, faceAt[0], faceAt[1]);
    emit(F, 'enraged', L.trim(im, 2), { src: ['Sw angery 2.png', 'Sidewalky Ready To Strike.PNG (his face)', 'sidewalky.png (his limbs)'], method: 'official body + his own face and limbs', flip: false }); }
  // HURT, the first moment: Breaking1.png (the official slab the crack starts on), his face screwed up; then the cracked picture.
  { const { im } = dress(F, S('Breaking1.png'), { fit: 'both' });
    putFace(im, crushFace, faceAt[0], faceAt[1]);
    emit(F, 'breaking', L.trim(im, 2), { src: ['Breaking1.png', 'Sidewalky preparing to CRUSH.png (his face)', 'sidewalky.png (his limbs)'], method: 'official body + his own face and limbs', flip: false }); }
  // FROZEN (official, BFDIE 8): the frozen block, his own face and limbs.
  { const { im } = dress(F, S('FrozenSidewalkyAsset.png'), { fit: 'both' });
    putFace(im, ownFace, faceAt[0], faceAt[1]);
    emit(F, 'frozen', L.trim(im, 2), { src: ['FrozenSidewalkyAsset.png', 'sidewalky.png (his face and limbs)'], method: 'official body + his own face and limbs', flip: false }); }
  // KO: the official fall (SidewalkSkew1, SidewalkSkew2, Sidewalky falling 3, 4, Falling5): the slab tipping over, his face screwed up on
  // it, squeezed with the slab as it turns. All at one width but the last, which is smaller on its canvas (the slab is further off).
  const FALL = [['SidewalkSkew1.png', D, 1, 1], ['SidewalkSkew2.png', D, 1, 1], ['Sidewalky falling 3.png', S, 1, 0.96], ['Sidewalky falling 4.png', S, 1, 0.9], ['Falling5.png', S, 0.82, 0.62]];
  FALL.forEach(([file, get, k, sy], i) => {
    const t = L.trim(get(file), 0), s = (bw * k) / t.w, im = L.trim(L.scaleBy(t, s), 14);
    const [cx, cy] = fillCentre(im);
    putFace(im, crushFace, cx - 2, cy + (sy < 1 ? 6 : 0), { squeeze: 1, s: 1 });
    emit(F, `fall-${i + 1}`, L.trim(im, 2), { src: [file.replace(/^(SidewalkSkew\d)\.png$/, '$1.webp'), 'Sidewalky preparing to CRUSH.png (his face)'], method: `official fall, frame ${i + 1} of 5, + his own face`, flip: true });   // (the two WebP files were decoded to PNG first)
  });
  // FRESH PAVEMENT: jumping across (SidewalkyJumpsAcross.png, an episode frame): the dusky sky behind him keyed out against its own
  // colour row by row (it is a smooth vertical gradient; the columns left of him are clear).
  { const fr = S('SidewalkyJumpsAcross.png'), im = L.crop(fr, 560, 380, 300, 200);
    L.cutBg(im, L.rowModel(im, 0, 70), { lo: 14, hi: 46 });
    L.keepParts(im, (p) => p.n > 40);
    emit(F, 'jump', toBase(im, F), { src: ['SidewalkyJumpsAcross.png'], method: 'episode frame, sky keyed out', flip: false }); }
}

// A FACE SWAP, for a frame that cannot be cut out whole (cropped by the frame's edge, or half hidden): the fighter's own render with its
// painted face filled out from the body round it (paintOut) and the frame's face laid on in its place (liftFace), at `scale`, turned by `rot`.
const padR = (r, p) => ({ x: r.x - p, y: r.y - p, w: r.w + p * 2, h: r.h + p * 2 });
function swapFace(base, bRect, src, sRect, { scale = 1, rot = 0, dx = 0, dy = 0, tol = 60, stol = 70, sbody = null, mirror = false, keep = null, trimEdges = false } = {}) {
  const im = L.clone(base), bc = L.bodyColour(base, padR(bRect, 8));
  L.paintOut(im, bRect, (x, y, r, g, b) => Math.hypot(r - bc[0], g - bc[1], b - bc[2]) > tol);
  const face = L.liftFace(src, sRect, sbody || L.bodyColour(src, padR(sRect, 10)), stol);
  if (keep) for (let i = 0; i < face.d.length; i += 4) if (face.d[i + 3] && !keep(face.d[i], face.d[i + 1], face.d[i + 2])) face.d[i + 3] = 0;   // a box edge or a prop that strayed into the rect
  if (trimEdges) L.keepParts(face, (pt) => pt.box.x > 0 && pt.box.y > 0 && pt.box.x + pt.box.w < face.w && pt.box.y + pt.box.h < face.h);   // whatever runs off the rect is not the face
  putFace(im, face, bRect.x + bRect.w / 2 + dx, bRect.y + bRect.h / 2 + dy, { s: scale, rot, mirror });
  return im;
}
// A fighter's render with its painted face filled out (a blank head to slide a face round), and that face as a layer.
function splitFace(base, rect, tol = 60) {
  const bc = L.bodyColour(base, padR(rect, 8)), blankHead = L.clone(base);
  L.paintOut(blankHead, rect, (x, y, r, g, b) => Math.hypot(r - bc[0], g - bc[1], b - bc[2]) > tol);
  return { blank: blankHead, face: L.liftFace(base, rect, bc, tol) };
}
// The head of a lollipop-shaped render (Lollipop): the rows where the body is at least half as wide as it gets, from the top.
function headBox(im) {
  const m = L.bodyMask(im, { grow: 0 }), wd = [];
  for (let y = 0; y < im.h; y++) { let a = -1, b = -1; for (let x = 0; x < im.w; x++) if (m[y * im.w + x]) { if (a < 0) a = x; b = x; } wd.push(a < 0 ? 0 : b - a + 1); }
  // from the top of the head down past its widest row to where the stick starts (a row under a fifth of the widest)
  const max = Math.max(...wd), y0 = wd.findIndex((v) => v > 0); let y1 = wd.indexOf(max);
  while (y1 + 1 < im.h && wd[y1 + 1] >= max * 0.2) y1++;
  let x0 = im.w, x1 = 0; for (let y = y0; y <= y1; y++) for (let x = 0; x < im.w; x++) if (m[y * im.w + x]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

// ---- LOLLIPOP -------------------------------------------------------------------------------------------------------------------------
// The official heads (her screech, her open mouth) come on a stick of their own proportions; each is laid on HER stick instead: her render
// with its head cleared, the new head at its size where hers was, her arms and legs kept. Faces from her own pictures.
function lollipop() {
  const F = 'Lollipop', base = B(F), hb = headBox(base);
  const faceRect = { x: 8, y: 14, w: 68, h: 68 };
  const { blank: blankHead, face: ownFace } = splitFace(base, faceRect, 75);
  const stickOnly = L.clone(base); L.eraseRect(stickOnly, 0, 0, base.w, hb.y + hb.h - 6);   // her stick, arms and legs: the render below the head
  const headOn = (src, { fitW = 1, dy = 0 } = {}) => {   // an official head (cropped above its own stick) on her stick
    const t = L.trim(src, 0), sb = headBox(t), head = L.crop(t, sb.x - 2, sb.y - 2, sb.w + 4, sb.h + 4);
    // what of its own stick shows under the head is cleared; hers is underneath
    const s = (hb.w * fitW) / sb.w, sm = L.scaleBy(head, s), pad = 30, out = L.blank(base.w + pad * 2, base.h + pad);
    L.paste(out, stickOnly, { x: pad, y: pad });
    L.paste(out, sm, { x: pad + hb.x + hb.w / 2, y: pad + hb.y + hb.h / 2 + dy, ox: sm.w / 2, oy: sm.h / 2 });
    return { im: out, cx: pad + hb.x + hb.w / 2, cy: pad + hb.y + hb.h / 2 + dy, r: hb.w / 2 };
  };
  // the screaming face of the flung frame (eyes squeezed shut, mouth wide), for the screech
  const flung1 = S('Lollipop - Flung and Kicked0001.png'), fh = headBox(flung1);
  const screechFace = L.scaleBy(L.liftFace(flung1, { x: 330, y: 320, w: 1560, h: 1560 }, L.bodyColour(flung1, { x: 300, y: 200, w: 1500, h: 1500 }), 118), hb.w / fh.w);
  // SMASH CHARGE: the screech, all fifteen official frames (Lollipop Screech0001-0015), the head fizzing out, her screaming face on it.
  for (let n = 1; n <= 15; n++) {
    const file = `Lollipop Screech${String(n).padStart(4, '0')}.png`, { im, cx, cy } = headOn(S(file), { fitW: 1.02 });
    putFace(im, screechFace, cx + 1, cy + 3);
    emit(F, `screech-${String(n).padStart(2, '0')}`, L.trim(im, 2), { src: [file, 'Lollipop - Flung and Kicked0001.png (her screaming face)', 'lollipop.png (her stick and limbs)'], method: `official screech, frame ${n} of 15, on her own stick, with her own face` });
  }
  // STICKY SUCKER: her mouth wide open (LipOpened.png, BFB 8, official): the open head faces right; her own eye and brow above the mouth.
  { const { im, cx, cy, r } = headOn(S('LipOpened.png'), { fitW: 1.1 });
    const eyes = L.crop(ownFace, 0, 0, ownFace.w, 42);   // her eyes and brow, not her smile
    putFace(im, eyes, cx + r * 0.05, cy - r * 0.42, { mirror: true, clip: false });
    emit(F, 'sucker', L.trim(im, 2), { src: ['LipOpened.png', 'lollipop.png (her stick, limbs and eyes)'], method: 'official head on her own stick, with her own eyes', flip: false }); }
  // CANDY TWIRL (drawn: no show file of it exists): her own render turning round once. A candy head is a ball, so its outline stays; her face
  // slides round it and squeezes as it turns, gone round the back; her arms and legs swap sides past the quarter turn.
  // From 90 to 270 degrees the face is round the back and the head is the same ball, so 120, 180 and 240 are ONE picture: twirl-3 is made
  // once and shown for all three steps (POSE_SETS.Lollipop), and the keys keep their degrees (twirl-6 is 300).
  [[0, 1], [60, 2], [120, 3], [300, 6]].forEach(([deg, n]) => {
    const a = deg * Math.PI / 180, c = Math.cos(a), back = c < 0;
    const im = back ? L.flipX(blankHead) : L.clone(blankHead);
    if (back) {   // the head's shine stays where the light is
      const head = L.crop(blankHead, hb.x - 1, hb.y - 1, hb.w + 2, hb.h + 2); L.paste(im, head, { x: hb.x - 1, y: hb.y - 1 });
    }
    if (c > 0.08) putFace(im, ownFace, faceRect.x + faceRect.w / 2 + Math.sin(a) * hb.w * 0.36, faceRect.y + faceRect.h / 2, { squeeze: c });
    emit(F, `twirl-${n}`, L.trim(im, 2), { src: ['lollipop.png'], method: 'drawn: her own render turned (no show file)', faceless: c <= 0.08, note: c <= 0.08 ? 'turned away: the back of her head' : '', flip: true });   // one flag for the whole turn: hers
  });
  emit(F, 'flung-1', toBase(flung1, F), { src: ['Lollipop - Flung and Kicked0001.png'], method: 'cut-out (wiki pose)' });
  emit(F, 'flung-2', toBase(S('Lollipop - Flung and Kicked0002.png'), F), { src: ['Lollipop - Flung and Kicked0002.png'], method: 'cut-out (wiki pose)' });
  // KO: in pieces (Lollipopieces.png, official): about as much candy as her head.
  { const p = L.trim(S('Lollipopieces.png'), 0), s = Math.sqrt((Math.PI * (hb.w / 2) ** 2) / L.fillArea(p)) * 1.25;
    emit(F, 'pieces', L.trim(L.scaleBy(p, s), 2), { src: ['Lollipopieces.png'], method: 'official (her broken pieces)', faceless: true, note: 'in pieces: no face' }); }
  // WIN: laughing (Laughing Lollipop.jpg). The frame has her lying on her side in the snow with the bottom of her head cut off by its edge,
  // so it is not cut out: her laughing face is lifted off it, turned upright and laid on her own render.
  { const src = D('Laughing Lollipop.png');
    const im = swapFace(base, faceRect, src, { x: 40, y: 70, w: 470, h: 400 }, { scale: hb.w / 430, rot: 0.32, dx: 2, dy: 4, sbody: [196, 120, 240], stol: 118 });
    emit(F, 'laughing', L.trim(im, 2), { src: ['Laughing Lollipop.jpg', 'lollipop.png'], method: 'face swap: her laughing face (episode frame) on her own render' }); }
}

// ---- GOO -------------------------------------------------------------------------------------------------------------------------------
// ENGULF out of the official parts: his four Season 4 forms (Goo Form E / SW / D 2 / D 3, bodies with no face) and his thirty mouths
// (GooMouth0001-0030, one canvas each, so their registration is kept), with the eyes of Goo happy s4.png: he surges out flat with his
// mouth wide, stands up tall to gulp, swallows (the small "o"), then sits lumpy and full, chewing, for as long as he holds them.
function goo() {
  const F = 'Goo', base = B(F), P = partsOf(base), bw = P.box.w;
  const happy = S('Goo happy s4.png');
  const eyes = L.scaleBy(L.inkLayer(happy, { x: 150, y: 88, w: 250, h: 130 }, { inkLum: 40, bodyLum: 110 }), bw / 508);   // the black of his eyes and brows only
  const M = (n) => S(`GooMouth${String(n).padStart(4, '0')}.png`), ms = 126 / 295;   // his render's mouth is 126px wide; the open mouths ~295
  // each form: [file, fit (relative area), eyes at (fraction of the form's box), mouth at, face scale]
  const FORMS = { E: ['Goo Form E.png', 1.0, [0.64, 0.30], [0.64, 0.66], 0.62], SW: ['Goo Form SW.png', 1.0, [0.52, 0.30], [0.52, 0.58], 1.0],
    D2: ['Goo Form D 2.png', 0.95, [0.5, 0.36], [0.5, 0.68], 0.82], D3: ['Goo Form D 3.png', 0.95, [0.5, 0.34], [0.5, 0.66], 0.85] };
  const form = (k, mouth, { eyesK = 1 } = {}) => {
    const [file, area, ea, ma, fs] = FORMS[k], t = L.trim(S(file), 0);
    const s = Math.sqrt((P.box.w * P.box.h * area) / (t.w * t.h)), im = L.trim(L.scaleBy(t, s), 6);
    const b = L.bbox(im);
    putFace(im, eyes, b.x + b.w * ea[0], b.y + b.h * ea[1], { s: fs * eyesK });
    const m = M(mouth); putFace(im, m, b.x + b.w * ma[0], b.y + b.h * ma[1], { s: ms * fs, fx: 175, fy: 117 });
    return im;
  };
  const SEQ = [['engulf-1', 'E', 7, 'surging out, mouth wide'], ['engulf-2', 'SW', 10, 'stood up tall to gulp'], ['engulf-3', 'SW', 14, 'swallowing'],
    ['engulf-4', 'D3', 18, 'full'], ['engulf-5', 'D3', 2, 'holding them, chewing'], ['engulf-6', 'D2', 3, 'holding them, chewing']];
  for (const [key, k, mouth, note] of SEQ) emit(F, key, form(k, mouth), { src: [FORMS[k][0], `GooMouth${String(mouth).padStart(4, '0')}.png`, 'Goo happy s4.png (his eyes)'], method: 'official form + official mouth + his own eyes', note, flip: false });
  // KO: splattered (Goo Form D 2, official) with his scream (GooMouth0028) and his eyes squeezed shut (drawn). GooEliminated.png, the frame
  // the plan named, has him half behind the boxing glove that hits him, so it cannot be cut out whole.
  { const t = L.trim(S('Goo Form D 2.png'), 0), s = Math.sqrt((P.box.w * P.box.h * 0.95) / (t.w * t.h)), im = L.trim(L.scaleBy(t, s), 6), b = L.bbox(im);
    squeezeEyes(im, b.x + b.w * 0.5, b.y + b.h * 0.3, b.w * 0.26, b.h * 0.16, 4);
    putFace(im, M(28), b.x + b.w * 0.5, b.y + b.h * 0.66, { s: ms * 0.7, fx: 175, fy: 117 });
    emit(F, 'splat', im, { src: ['Goo Form D 2.png', 'GooMouth0028.png'], method: 'official form + official mouth, eyes drawn', flip: false }); }
  // his arm: he faces right in it, his eyes and grin turned to the arm; the measure (-0.036) reads the arm's bulk as ink, so the flag is by eye
  emit(F, 'arm', toBase(L.load(join(SRC, "Goo's Muscular Arm (S4E4).png")), F, 0.9), { src: ["Goo's Muscular Arm (S4E4).png"], method: 'cut-out (wiki pose)', flip: false });
  emit(F, 'hand', toBase(D('Goo raises his hand in the S4.png'), F), { src: ['Goo raises his hand in the S4.webp'], method: 'cut-out (wiki pose)' });
  // HURT: screaming, rebuilt crisp ("Yes, rebuild it", the owner, 2026-10-21). The wiki's Goo screaming.png is a 148x142 frame, so blown
  // up to his size it was blurry; now it is made the way the frame has him, out of the official parts: his standing form (Goo Form SW),
  // squashed a little as he flinches, with his wide scream (GooMouth0029), and the eyes shut tight (closed arcs) and worried brows (inner
  // ends up) drawn in his ink, at his render's line weight, where the frame has them.
  { const t = L.trim(S('Goo Form SW.png'), 0), sq = 0.86, s = Math.sqrt((P.box.w * P.box.h) / (t.w * t.h * sq));
    const im = L.trim(L.resize(t, Math.round(t.w * s), Math.round(t.h * s * sq)), 6), b = L.bbox(im);
    const cx = b.x + b.w * 0.54, ey = b.y + b.h * 0.30, by = b.y + b.h * 0.19, ink = [16, 16, 16];
    const bez = (p0, p1, p2, n = 20) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u;
      return [v * v * p0[0] + 2 * v * u * p1[0] + u * u * p2[0], v * v * p0[1] + 2 * v * u * p1[1] + u * u * p2[1]]; });
    for (const sd of [-1, 1]) {   // sd: the left eye, then the right
      const ex = cx + sd * b.w * 0.13;
      L.stroke(im, L.arc(ex, ey, 11, 11, Math.PI * 0.94, Math.PI * 2.06), 5.2, ink, 1, 'atop');
      L.stroke(im, bez([ex + sd * 12, by + 1], [ex - sd * 3, by + 5], [ex - sd * 10, by - 8]), 4.8, ink, 1, 'atop');
    }
    putFace(im, M(29), cx, b.y + b.h * 0.62, { s: ms * 0.85, fx: 175, fy: 117 });
    emit(F, 'scream', im, { src: ['Goo Form SW.png', 'GooMouth0029.png'], method: 'official form + official mouth, eyes and brows drawn',
      note: 'rebuilt crisp in place of the blurry 148x142 Goo screaming.png frame, as that frame has him', flip: false }); }
  emit(F, 'happy', toBase(S('Goo happy s4.png'), F), { src: ['Goo happy s4.png'], method: 'cut-out (wiki pose)' });
}

// Every pixel a predicate accepts, as flood seeds (a background that also shows through closed loops).
function allWhere(im, pred) { const o = []; for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) { const i = (y * im.w + x) * 4; if (im.d[i + 3] > 0 && pred(im.d[i], im.d[i + 1], im.d[i + 2])) o.push([x, y]); } return o; }

// ---- TISSUES ---------------------------------------------------------------------------------------------------------------------------
function tissues() {
  const F = 'Tissues', base = B(F);
  const faceRect = { x: 36, y: 74, w: 98, h: 76 };
  emit(F, 'sniff', toBase(S('TissuesSniff.png'), F), { src: ['TissuesSniff.png'], method: 'cut-out (wiki pose)' });
  // THE SNEEZE: his "AH HAH AHACK" fit (S2E16 Tissues2.png, an episode frame: him on a hotel bed, Phone beside it), in the late-II look of his
  // render (art consistency, 2026-10-21: it replaced Tissues Sneezing.png, an older pose in a paler cyan with a darker teal outline and thinner,
  // rounder line work). What is not him is flooded out from the frame's border: the sheet and the snot on it, the headboard, the lamp, the wall.
  // He is his teal, his black line-work, and white only where his tissues stick up out of the box (above its top edge); the edge is un-mixed
  // from the ground behind it (matteEdge: his outline is teal, so a darker edge is not ink).
  { const im = L.crop(S2('S2E16 Tissues2.png'), 1020, 240, 500, 410);
    const him = (r, g, b, x, y) => !((x > 426 && y < 235) || (x > 330 && y < 70))   // (the nightstand's black top and the lamp's edge, by his side)
      && ((g > r + 50 && b > r + 30) || (L.lum(r, g, b) < 90 && Math.max(r, g, b) - Math.min(r, g, b) < 30)
      || (x > 105 && x < 335 && y < 108 && Math.min(r, g, b) > 140 && Math.max(r, g, b) - Math.min(r, g, b) < 30));
    L.matteEdge(im, L.floodBg(im, (r, g, b, a, x, y) => !him(r, g, b, x, y)));
    L.keepParts(im, (p) => p.n > 300);
    emit(F, 'sneeze', toBase(im, F), { src: ['S2E16 Tissues2.png'], method: 'episode frame, the room and the snot keyed out', flip: true,   // he is turned the way his render is
      note: 'in place of the older Tissues Sneezing.png' }); }
  // the four face frames (Tissues Face 1-4, on flat backgrounds): keyed against the border's colour. They are frames of the Fan's Fantastic
  // Features episode "The Issues with Tissues" (2022): his design, line weight and proportions are his render's, but that episode coloured him
  // a darker teal, so each is shifted onto his render's turquoise (art consistency, 2026-10-21) by one colour map fitted to his parts, frame
  // colour to render colour; the frozen blue (face-2) and the sick green (face-3, face-4) are tints on him and stay tints. His mouth (red, pink)
  // is left as it is.
  const tealMap = L.fitColourMap([
    [[0, 199, 186], [0, 238, 196]],     // his front
    [[2, 184, 171], [0, 219, 175]],     // his side
    [[5, 138, 134], [2, 158, 133]],     // his outline
    [[41, 212, 201], [47, 247, 213]],   // the shine along his edges
    [[210, 215, 215], [223, 229, 229]], // his tissues
    [[15, 22, 24], [2, 8, 6]],          // his line-work and limbs
  ]);
  for (const n of [1, 2, 3, 4]) {
    const fr = S(`Tissues Face ${n}.png`), bg = L.borderColour(fr);
    L.cutBg(fr, () => bg, { lo: 16, hi: 54, global: true });   // global: and the pockets of it his arms close round
    L.keepParts(fr, (p) => p.n > 300);
    L.applyColourMap(fr, tealMap, (r, g, b) => r <= g + 4);
    emit(F, `face-${n}`, toBase(fr, F), { src: [`Tissues Face ${n}.png`], method: 'episode frame, flat background keyed out, recoloured to his render\'s turquoise' });
  }
  // HURT: extremely scared (Objects in Mirror): the grass flooded out (green, far greener than his teal), the trophy and the rest cropped off.
  { const im = L.crop(S('Tissues extremely scared.png'), 330, 100, 1290, 980);
    const grass = (r, g, b) => g > b + 48 && g > r + 30;
    L.cutPred(im, grass);
    L.cutPred(im, grass, { seeds: allWhere(im, grass) });   // and the grass inside the loops of his arms
    L.keepParts(im, (p) => p.n > 2000);
    emit(F, 'scared', toBase(im, F), { src: ['Tissues extremely scared.png'], method: 'episode frame, grass keyed out' }); }
  // KO and WIN: TissuesOUT.png and Tissues looks so happy.png are close-ups cut off by the frame, so their faces go on his own render.
  emit(F, 'out', L.trim(swapFace(base, faceRect, S('TissuesOUT.png'), { x: 195, y: 130, w: 225, h: 264 }, { scale: 0.29, dy: 3, keep: (r, g, b) => !(g > r + 40), trimEdges: true }), 2),   // not the teal of the box's top edge, nor the tissue above it
    { src: ['TissuesOUT.png', 'tissues.png'], method: 'face swap: his face (a close-up) on his own render' });
  emit(F, 'happy', L.trim(swapFace(base, faceRect, S('Tissues looks so happy.png'), { x: 215, y: 70, w: 175, h: 146 }, { scale: 0.48, dy: 0 }), 2),
    { src: ['Tissues looks so happy.png', 'tissues.png'], method: 'face swap: his face (a cropped frame) on his own render' });
}

// ---- BOX ---------------------------------------------------------------------------------------------------------------------------
function box() {
  const F = 'Box';
  // Everything Packed: her flaps opening, the S4E6 set, all four at ONE scale (one shot of the episode: the box is the same size in each),
  // her front face 160px across as in her render (500px in the frames). Frame 1 is the file the g1 box-open-flaps.png (gone now) was made from.
  // Frames 1-3 face the front; frame 4 has turned three-quarters to the viewer's left, so it is flipped (she turns to the foe).
  for (const n of [1, 2, 3, 4]) emit(F, `flaps-${n}`, L.trim(L.scaleBy(L.trim(S(`Box with Open Flaps ${n} (S4E6).png`), 0), 160 / 500), 2), { src: [`Box with Open Flaps ${n} (S4E6).png`], method: 'cut-out (wiki pose)', flip: n === 4 });
  // running and panicked face right, as her render does (the side panel on the left, the eyes shifted right, the front leg striding right);
  // the measure (-0.037, -0.041) reads the side panel as ink, so their flags are by eye
  emit(F, 'running', toBase(S('Box Running Out of the Maze (S4E3).png'), F), { src: ['Box Running Out of the Maze (S4E3).png'], method: 'cut-out (wiki pose)', flip: false });
  emit(F, 'panicked', toBase(S('Box in a Panicked Expression (S4E3).png'), F), { src: ['Box in a Panicked Expression (S4E3).png'], method: 'cut-out (wiki pose)', flip: false });
  emit(F, 'smiling', toBase(S('Box Smiling (S4E3).png'), F), { src: ['Box Smiling (S4E3).png'], method: 'cut-out (wiki pose)' });
  // KO: fallen over, blindfolded (Blindfolded Box Fell Down (S4E3).png, an S4 cut-out from the same "Poses" set as her smiling and panicked
  // pictures). It replaced Box Damage.png, the Season 3 asset of her old faceless body crushed and bandaged (art consistency, 2026-10-21).
  emit(F, 'fell', toBase(S2('Blindfolded Box Fell Down (S4E3).png'), F), { src: ['Blindfolded Box Fell Down (S4E3).png'], method: 'cut-out (wiki pose)',
    note: 'Season 4, in place of the Season 3 Box Damage.png' });
}

// ---- BELL ----------------------------------------------------------------------------------------------------------------------------
function bell() {
  const F = 'Bell', base = B(F);
  for (const [key, file] of [['before-ring', 'Bell before ring.png'], ['ding', 'Bell ding ding ding.png'], ['avoid', 'Bell avoid.png'], ['angry', 'Bell angry idle.png'], ['happy', 'Happy Bell.png']])
    emit(F, key, toBase(S(file), F), { src: [file], method: 'cut-out (wiki pose)' });
  // Her own face (the shout of her base render), lifted off it: the turn and zapped bodies are drawn with no face.
  const faceRect = { x: 44, y: 40, w: 99, h: 128 }, face = L.liftFace(base, faceRect, L.bodyColour(base, { x: 30, y: 40, w: 126, h: 140 }), 62);
  const [bcx, bcy] = fillCentre(base), fdx = faceRect.x + faceRect.w / 2 - bcx, fdy = faceRect.y + faceRect.h / 2 - bcy;
  // CROWN SWING: the official turn (the loop turns edge-on and back; the bell itself is round), with her face going round it: eight steps
  // of a whole turn, the face squeezed by cos and slid by sin of the angle, gone while it is round the back.
  const turn = (n) => toBase(S(`Bell Body Side turn000${n}.png`), F);
  const STEPS = [[0, 1], [45, 3], [90, 5], [135, 7], [180, 9], [225, 7], [270, 5], [315, 3]];
  STEPS.forEach(([deg, n], i) => {
    let body = turn(n); if (deg > 180) body = L.flipX(body);
    const a = deg * Math.PI / 180, c = Math.cos(a), [cx, cy] = fillCentre(body);
    if (c > 0.12) putFace(body, face, cx + fdx + Math.sin(a) * body.w * 0.34, cy + fdy, { squeeze: c });
    emit(F, `spin-${i + 1}`, body, { src: [`Bell Body Side turn000${n}.png`, 'bell.png (her face)'], method: 'official body + her own face', faceless: c <= 0.12, note: c > 0.12 ? '' : 'turned away: the back of the bell', flip: false });   // one flag for the whole turn: hers
  });
  // HIT: the official zapped bodies (tipped over, a two-frame flicker), her shouting face turned with them. The wiki's zapped0003 and 0004
  // are byte for byte 0001 and 0002, so the flicker is two pictures.
  for (const n of [1, 2]) {
    const body = toBase(S(`Bell zapped000${n}.png`), F), [cx, cy] = fillCentre(body), rot = 0.42, s = Math.sin(rot), c = Math.cos(rot);
    putFace(body, face, cx + fdx * c - fdy * s, cy + fdx * s + fdy * c, { rot });
    emit(F, `zapped-${n}`, body, { src: [`Bell zapped000${n}.png`, 'bell.png (her face)'], method: 'official body + her own face' });
  }
}

// ---- TEDDY BEAR ------------------------------------------------------------------------------------------------------------------------
// Her set is Season 4 throughout (art consistency, 2026-10-21): her render is her S4 sticker art, her mad picture an S4 cut-out, and the
// pictures that came from older seasons are replaced -- the paint hit and the grief (Season 1 Remastered: a round head, no cheek fur, no
// fangs, a thick outline), her fists (TB.png, the older 2017/II look) and the laugh GIF of her win (Season 1, flat and unshaded).
function teddy() {
  const F = 'Teddy Bear', base = B(F), faceRect = { x: 40, y: 27, w: 58, h: 64 };
  if (!baseArea[F]) baseArea[F] = L.fillArea(base);
  // RESPECT THIS! and the finisher: angry, fists on her hips (Angryteddybear.png, an S4 cut-out from the same set as her mad picture: the same
  // 439x568 canvas, the same upload day). It replaced TB.png.
  // Its colouring is a darker, duller brown than the rest of her set (body 173,106,52 against the render's 208,146,58, and a pinkish belly), so
  // it is shifted onto her render's by three tone curves fitted to her parts, cut-out colour to render colour: line-work, outline, shade,
  // body, fur highlight, belly. First its fringe goes: the cut-out keeps a 4px rim of the light ground it was cut from, grey fading into her
  // outline (161,148,144 at the edge); within 5px of the clear, a pixel greyer than her outline (red under blue + 60) and not her black takes
  // the colour of the nearest one deeper in that is not, so her outline comes out the render's width.
  { const im = S2('Angryteddybear.png');
    L.decontaminate(im, (r, g, b) => r - b < 60 && L.lum(r, g, b) > 60, { band: 5, reach: 6, passes: 2 });
    L.applyCurves(im, [[[0, 0], [22, 7], [121, 137], [158, 193], [173, 208], [194, 226], [208, 253], [255, 255]],
      [[0, 0], [13, 4], [66, 80], [96, 129], [106, 146], [136, 172], [157, 202], [255, 255]],
      [[0, 0], [12, 2], [48, 45], [54, 58], [93, 88], [119, 117], [255, 255]]]);
    emit(F, 'angry', toBase(im, F), { src: ['Angryteddybear.png'], method: "cut-out (wiki pose), recoloured to her render's browns", note: 'Season 4, in place of the older TB.png' }); }
  const mad = toBase(S('TeddyBearMad.png'), F);
  emit(F, 'mad', L.clone(mad), { src: ['TeddyBearMad.png'], method: 'cut-out (wiki pose)' });
  // THE PAINT GUN: her mad picture, charging with her arms out, with the paint gun in her outstretched paw (the gun of the old laugh GIF, the
  // only drawing of it: a flat grey pistol, frame 1, x 19-94, y 154-217). It is laid behind her, its grip under her paw, about as long as a
  // quarter of her height (as in the GIF), pointing the way she charges. It replaced laugh-01, which the Paint Gun wore before.
  { const lf = D('Teddy bear laugh gif transparent-01.png'), gun = L.crop(lf, 17, 150, 80, 70);
    for (let i = 0; i < gun.d.length; i += 4) { const r = gun.d[i], g = gun.d[i + 1], b = gun.d[i + 2];
      if (!(Math.max(r, g, b) - Math.min(r, g, b) < 28 && L.lum(r, g, b) > 50)) gun.d[i + 3] = 0; }   // the grey of the gun only (not her black arm)
    L.keepParts(gun, (p) => p.n > 200);
    const hand = (() => {   // her outstretched paw: the leftmost black of the picture, and the black round it
      let lx = 1e9; for (let y = 0; y < mad.h; y++) for (let x = 0; x < mad.w; x++) { const i = (y * mad.w + x) * 4; if (mad.d[i + 3] > 128 && L.lum(mad.d[i], mad.d[i + 1], mad.d[i + 2]) < 50 && x < lx) lx = x; }
      let n = 0, sx = 0, sy = 0;
      for (let y = 0; y < mad.h; y++) for (let x = lx; x < lx + 9; x++) { const i = (y * mad.w + x) * 4; if (mad.d[i + 3] > 128 && L.lum(mad.d[i], mad.d[i + 1], mad.d[i + 2]) < 50) { n++; sx += x; sy += y; } }
      return [sx / n, sy / n]; })();
    const tall = L.bbox(mad).h, gs = (tall * 0.225) / 75, g2 = L.scaleBy(gun, gs), pad = Math.ceil(g2.w) + 4;
    const out = L.blank(mad.w + pad, mad.h);
    L.paste(out, g2, { x: pad + hand[0], y: hand[1], ox: (93 - 17) * gs, oy: (200 - 150) * gs });   // the grip's back (93, 200 of the frame) at her paw
    L.paste(out, mad, { x: pad, y: 0 });
    emit(F, 'gun', L.trim(out, 2), { src: ['TeddyBearMad.png', 'Teddy bear laugh gif transparent.gif (the paint gun, frame 1)'], method: 'cut-out (wiki pose) with the paint gun of the laugh GIF in her paw',
      note: 'the Season 4 mad picture in place of the Season 1 laugh-01', flip: true }); }   // the gun points left, as she charges
  // HURT, the first moment: shaken (S4E1 Teddy Tramua.png): eyes shut, brows down, mouth open. The frame cuts her off at the hips, so its face
  // goes on her own render (swapFace), as her "No!!" does. It replaced Teddy Bear Paint.png.
  emit(F, 'shaken', L.trim(swapFace(base, faceRect, S2('S4E1 Teddy Tramua.png'), { x: 358, y: 106, w: 172, h: 194 }, { scale: 0.335, dy: 3 }), 2),
    { src: ['S4E1 Teddy Tramua.png', 'teddy-bear.png'], method: 'face swap: her face (a cropped frame) on her own render', note: 'Season 4, in place of the Season 1 Remastered Teddy Bear Paint.png' });
  // LAUNCHED: grief, "I can't take any more loss!" (PointOfNoReturn- Teddy Bear's first appearance.png, S4E6, an episode frame: a pink hospital
  // room). The wall, the lino, the nightstand and the bed are flooded out from the border (she is her browns and creams and her black limbs);
  // the edge is un-mixed from the ground (matteEdge: her outline is brown). The bed's corner hides her right foot, so her left foot (x 1216-1312,
  // y 996-1042 of the frame) is copied onto her right leg, 124px across, where the legs run side by side. It replaced TeddyBear-Grief.png.
  { const X = 1040, Y = 160, im = L.crop(S2("PointOfNoReturn- Teddy Bear's first appearance.png"), X, Y, 480, 918);
    const her = (r, g, b) => (r > b + 40 && g > b + 10) || (L.lum(r, g, b) < 60 && Math.max(r, g, b) - Math.min(r, g, b) < 40);
    L.matteEdge(im, L.floodBg(im, (r, g, b) => !her(r, g, b)));
    L.keepParts(im, (p) => p.n > 2000);
    L.paste(im, L.crop(im, 1216 - X, 996 - Y, 96, 46), { x: 1216 - X + 124, y: 996 - Y });
    emit(F, 'grief', toBase(im, F), { src: ["PointOfNoReturn- Teddy Bear's first appearance.png"], method: 'episode frame, the room keyed out, her hidden right foot copied from her left',
      note: 'Season 4, in place of the Season 1 Remastered TeddyBear-Grief.png' }); }
  // THE WIN: her S4 dance with Tea Kettle (Teddydance.gif, from "Rock the Boat", S4E7: 426x238, 111 frames, the owner's pick). It is an episode
  // clip, at night, with Tea Kettle beside her, in a 3-3-2 palette (8 reds, 8 greens, 4 blues) error-diffused all over. The frames kept are the
  // twirl and the bow after it (78 to 110, every other frame: 17 pictures), where she stands clear of Tea Kettle (before them he has his arms
  // round her and his spout on her face). Each frame, the same way:
  //   · her LINE-WORK (limbs, brows, mouth) is read off the raw frame: its black is a palette entry no ground colour comes near (lum under 14),
  //     so it stays crisp; the COLOUR is the frame blurred (sigma 1.2: the dither averaged out) and flattened twice by an edge-keeping
  //     bilateral (the error diffusion's blotches), its edges firmed (unsharp); both are drawn at twice the size, to cut a smooth edge;
  //   · the night is flooded out from the border (she is warm -- red over green over blue --, her pale belly and ear insides, or her ink; the
  //     wall is magenta, the doorway, the ground and the stars blue-grey);
  //   · Tea Kettle's arm is ink like hers and holds her raised paw: the two paws make one blob, the thickest ink near the top (the twirl) or
  //     at the left (the bow); every ink left of it (in the twirl, no lower than it) is his, and goes. A part of her that is left above her
  //     middle in the twirl is the clasped paws over her head with her arm hidden behind it: it goes; her legs, parted from her by the blur of
  //     her bottom outline into the ground, stay (any part within 10px of her);
  //   · the edge is un-mixed from the night behind it (matteEdge), then the silhouette smoothed (its alpha blurred and re-sharpened round 0.5);
  //   · the scene's light is taken off her by three tone curves fitted to her own colours, clip (blurred) to render: ink 9,16,17 -> 7,4,2,
  //     outline 62,36,28 -> 137,80,45, body 97,62,41 -> 208,146,58, belly 148,113,89 -> 253,202,117 (the render's own); and her S4 outline,
  //     which the night sank into the dark, is drawn back: the render's brown, 7px wide at this size (3px in the picture, as the render's), round her fill (not her limbs);
  //   · all seventeen share one canvas and one scale, so she never jumps between frames.
  // She is ~190px tall in the clip and ~165px in the pictures: no upscaling was needed (the 2x is only for the cut); she is a little softer
  // than her cut-outs, as a frame of a 22% clip is.
  const DANCE = []; for (let n = 78; n <= 110; n += 2) DANCE.push(n);
  const CURVES = [[[0, 0], [9, 7], [62, 137], [97, 208], [148, 253], [255, 255]], [[0, 0], [16, 4], [36, 80], [62, 146], [113, 202], [255, 255]],
    [[0, 0], [17, 2], [28, 45], [41, 58], [89, 117], [255, 255]]];
  const CX = 180, CW = 220, CH = 238, Z = 2, OUTLINE = [137, 80, 45], INK = [9, 16, 17];
  const warm = (r, g, b) => r - b > 22 && g - b > 4 && r - g > 12 && r > 40;
  const pale = (r, g, b) => L.lum(r, g, b) > 95 && r - b > 12 && r > g;   // her belly, and the inside of her ears (greyed by the night)
  const cuts = DANCE.map((n) => {
    const c = L.crop(D2(`Teddydance-${String(n).padStart(3, '0')}.png`), CX, 0, CW, CH);
    const ink = L.blank(CW, CH);
    for (let p = 0; p < CW * CH; p++) { const i = p * 4, v = L.lum(c.d[i], c.d[i + 1], c.d[i + 2]) < 14 ? 255 : 0; ink.d[i] = ink.d[i + 1] = ink.d[i + 2] = v; ink.d[i + 3] = 255; }
    let col = L.blur(c, 1.2);
    for (let k = 0; k < 2; k++) col = L.bilateral(col, 3, 2, 12);
    L.unsharp(col, 1.4, 0.6);
    const im = L.paste(L.blank(CW * Z, CH * Z), col, { sx: Z, sy: Z }), ik = L.paste(L.blank(CW * Z, CH * Z), L.blur(ink, 0.7), { sx: Z, sy: Z });
    const w = im.w, h = im.h, inkAt = new Float32Array(w * h);
    for (let p = 0; p < w * h; p++) { const a = Math.min(1, Math.max(0, (ik.d[p * 4] / 255 - 0.2) * 2)); inkAt[p] = a;
      for (let ch = 0; ch < 3; ch++) im.d[p * 4 + ch] += (INK[ch] - im.d[p * 4 + ch]) * a; }
    const her = (p) => inkAt[p] > 0.35 || warm(im.d[p * 4], im.d[p * 4 + 1], im.d[p * 4 + 2]) || pale(im.d[p * 4], im.d[p * 4 + 1], im.d[p * 4 + 2]);
    const bg = L.floodBg(im, (r, g, b, a, x, y) => !her(y * w + x));
    // the clasp: the thickest ink (chessboard distance to anything not ink), near the top in the twirl, at the left in the bow
    const isB = (p) => !bg[p] && inkAt[p] > 0.35, dist = new Int32Array(w * h);
    for (let p = 0; p < w * h; p++) dist[p] = isB(p) ? 1 << 20 : 0;
    const relax = (x, y, p) => { let m = dist[p];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) { m = Math.min(m, 1); continue; } m = Math.min(m, dist[yy * w + xx] + 1); }
      dist[p] = m; };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (dist[y * w + x]) relax(x, y, y * w + x);
    for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) if (dist[y * w + x]) relax(x, y, y * w + x);
    const twirl = n <= 100;
    let cx = -1, cy = -1, rc = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (twirl ? y >= 70 * Z : (x >= 80 * Z || y >= 150 * Z)) continue; const d = dist[y * w + x]; if (d > rc) { rc = d; cx = x; cy = y; } }
    if (cx >= 0) for (let y = 0; y < h; y++) for (let x = 0; x < cx - rc - 2; x++) { const p = y * w + x; if ((!twirl || y < cy + rc + 6 * Z) && isB(p)) bg[p] = 1; }
    L.matteEdge(im, L.floodBg(im, (r, g, b, a, x, y) => bg[y * w + x] || !her(y * w + x)), { band: 3 });
    const all = L.parts(im, 8), main = new Uint8Array(w * h); for (const p of all[0].px) main[p] = 1;
    const near = L.dilate(main, w, h, 10), mid = all[0].box.y + all[0].box.h * 0.45;
    for (const pt of all.slice(1)) if (!(pt.n >= 30 && (!twirl || pt.box.y + pt.box.h > mid) && pt.px.some((p) => near[p]))) for (const p of pt.px) im.d[p * 4 + 3] = 0;
    { const A = L.blank(w, h); for (let p = 0; p < w * h; p++) { A.d[p * 4] = A.d[p * 4 + 1] = A.d[p * 4 + 2] = im.d[p * 4 + 3]; A.d[p * 4 + 3] = 255; }
      const As = L.blur(A, 1.4); for (let p = 0; p < w * h; p++) im.d[p * 4 + 3] = 255 * Math.max(0, Math.min(1, (As.d[p * 4] / 255 - 0.5) * 2.5 + 0.5)); }
    L.applyCurves(im, CURVES);
    // her outline: the render's brown, within 7px of the clear (4-connected distance), on her fill only
    const dd = new Int32Array(w * h).fill(1 << 20), q = [];
    for (let p = 0; p < w * h; p++) if (im.d[p * 4 + 3] < 128) { dd[p] = 0; q.push(p); }
    for (let qi = 0; qi < q.length; qi++) { const p = q[qi], x = p % w, y = (p / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; const pp = yy * w + xx; if (dd[pp] > dd[p] + 1) { dd[pp] = dd[p] + 1; q.push(pp); } } }
    for (let p = 0; p < w * h; p++) { if (inkAt[p] > 0.3 || !im.d[p * 4 + 3]) continue; const t = Math.max(0, Math.min(1, 8 - dd[p]));
      if (t > 0) for (let ch = 0; ch < 3; ch++) im.d[p * 4 + ch] += (OUTLINE[ch] - im.d[p * 4 + ch]) * t; }
    return im;
  });
  const u = cuts.map((c) => L.bbox(c)).reduce((a, b) => ({ x0: Math.min(a.x0, b.x), y0: Math.min(a.y0, b.y), x1: Math.max(a.x1, b.x + b.w), y1: Math.max(a.y1, b.y + b.h) }), { x0: 1e9, y0: 1e9, x1: 0, y1: 0 });
  const ds = Math.sqrt(baseArea[F] / L.fillArea(cuts[DANCE.indexOf(104)]));   // her size: a frame where she faces the front, matched to her render
  cuts.forEach((c, i) => emit(F, `dance-${String(i + 1).padStart(2, '0')}`, L.scaleBy(L.crop(c, u.x0 - 4, u.y0 - 4, u.x1 - u.x0 + 8, u.y1 - u.y0 + 8), ds),
    { src: ['Teddydance.gif'], method: `episode GIF, frame ${DANCE[i]} of 111: Tea Kettle and the night keyed out, the scene's light taken off, her outline drawn back`, flip: false }));
  // HURT ("No!!"): the episode frame is cut off at her hips by the frame's edge, so its face goes on her own render (the scream with her hands
  // on her head). (Front of the Crowd had a swap like it off "Teddy runs for Bell.png": a ghost head edge and a cut nose, and the face reads
  // as crying, not barging; the down special wears her 'mad' picture until a clean barging frame is cut.)
  emit(F, 'no', L.trim(swapFace(base, faceRect, S('Teddy _No!!_.png'), { x: 352, y: 100, w: 166, h: 238 }, { scale: 0.33, dy: 4 }), 2),
    { src: ['Teddy \"No!!\".png', 'teddy-bear.png'], method: 'face swap: her face (a cropped frame) on her own render' });
}

// ---- PAINTBRUSH ---------------------------------------------------------------------------------------------------------------------------
function paintbrush() {
  const F = 'Paintbrush';
  // WIN: their Season 4 pose, hands on hips (Paintbrush IIS4.png, their infobox picture, a cut-out). It replaced the older flat "OMG I Stacked
  // TWO!.png" (no handle shading, no rim shine, a heavier ferrule outline).
  emit(F, 'win', toBase(S2('Paintbrush IIS4.png'), F), { src: ['Paintbrush IIS4.png'], method: 'cut-out (wiki pose)', note: 'Season 4, in place of the older OMG I Stacked TWO!.png' });
  // Tired: the wiki cut-out carries a green fringe from its old background; it goes.
  const t = S('Paintbrush Tired.png');
  for (let i = 0; i < t.d.length; i += 4) {
    const [r, g, b] = [t.d[i], t.d[i + 1], t.d[i + 2]], l = L.lum(r, g, b);
    if (g > r + 25 && g > b + 25 && l > 85) t.d[i + 3] = 0;                     // the bright green fringe
    else if (g > r + 8 && g > b + 8 && l <= 85) { const k = Math.min(r, b); t.d[i] = t.d[i + 1] = t.d[i + 2] = k; }   // the limbs it tinted: back to black
  }
  emit(F, 'tired', toBase(L.keepParts(t, (p) => p.n > 30), F), { src: ['Paintbrush Tired.png'], method: 'cut-out (wiki pose), green fringe removed' });
  // RAGE, steps 1 and 3, in Season 4 (art consistency, 2026-10-21: they replaced PaintbrushIsPissedOff.png, a Season 2 frame with an olive
  // handle and no ferrule shine, and Paintbrush Rage.png, the old Season 2 picture of them on fire). Both come from S4E5, where they wear the
  // crossed hi-vis strap:
  //   · THE BODY: S4E5 Paintbrush 2.png ("Can someone say something infuriating?"), the whole of them in a doorway. The snow, the sky and the room
  //     are flooded out from the border (they are warm browns and yellows, their black limbs, their dark outline, and the strap's green and grey
  //     where it crosses the handle), and the ground seen through the hole in their handle from a seed in it. The doorway lights them from
  //     behind, so the scene draws them dim and blue; one colour map fitted to their parts (frame colour to render colour) puts their render's
  //     colours back.
  //   · THE FACE, eyes squeezed shut and a scowl, and THE FLAMES: S4E5 Paintbrush's bristles turn into flames.png, a close-up cut off at the neck
  //     by the frame's bottom edge and at the top of the fire by its top edge. Its white doorway is flooded out (the flames' soft glow fades into
  //     it, so their edge keeps that glow as alpha); the fire's light on the head and ferrule is kept, it is part of the picture.
  // rage-1 is the body with that face (the body's own face reads as surprised, not angry); rage-3 is the close-up's flaming head down to the
  // neck on the body's strap, handle and limbs, the top of the fire, cut off by the frame, rounded off in its own colours.
  { const P2 = L.crop(S2('S4E5 Paintbrush 2.png'), 300, 20, 240, 457);
    const strapZone = (x, y) => x > 85 && x < 165 && y > 225 && y < 318, ferruleZone = (x, y) => x > 45 && x < 212 && y > 92 && y < 152;
    const frame = (x, y) => x < 14 || x > 228 || y < 11 || (x < 23 && y < 16);   // the doorframe's edges, which the bristles' tip touches
    const dark = (r, g, b) => L.lum(r, g, b) < 40 || (L.lum(r, g, b) < 75 && r >= b - 2 && !(g < r - 12 && g < b - 12));   // (the room's purple is not)
    const brush = (r, g, b, x, y) => !frame(x, y) && (r > b + 25 || g > r + 30 || dark(r, g, b))
      || (strapZone(x, y) && L.lum(r, g, b) > 40 && L.lum(r, g, b) < 150 && Math.max(r, g, b) - Math.min(r, g, b) < 30)
      || (ferruleZone(x, y) && L.lum(r, g, b) < 215 && Math.max(r, g, b) - Math.min(r, g, b) < 45);
    const bg = L.floodBg(P2, (r, g, b, a, x, y) => !brush(r, g, b, x, y));
    const hole = L.floodBg(P2, (r, g, b) => !(r > b + 25) && !dark(r, g, b), [[120, 362]]);   // the hole in the handle
    const pale = (r, g, b) => L.lum(r, g, b) > 185 && b >= r - 5;   // the snow and the sky
    const loop = L.floodBg(P2, pale, allWhere(P2, pale).filter(([x, y]) => x < 105 && y > 290 && y < 360));   // the snow inside the loop of their left arm
    for (let p = 0; p < bg.length; p++) bg[p] |= hole[p] | loop[p];
    L.matteEdge(P2, bg);
    L.keepParts(P2, (p) => p.n > 3000);   // (not the doorframe's edges)
    const toRender = L.fitColourMap([
      [[95, 77, 52], [168, 118, 57]],     // the handle
      [[170, 169, 99], [254, 254, 130]],  // the bristles
      [[123, 134, 145], [187, 187, 185]], // the ferrule
      [[60, 51, 43], [100, 77, 55]],      // the outline
      [[2, 3, 14], [3, 2, 1]],            // the limbs and line-work
      [[100, 166, 38], [150, 225, 36]],   // the strap's green, as the close-up has it
      [[77, 90, 88], [93, 102, 96]],      // the strap's grey stripe
    ]);
    L.applyColourMap(P2, toRender);
    // the close-up, and how it sits on the body: its ferrule is 249px across (x 293-542), the body's 149px (x 352-501), so it is drawn at 0.598;
    // its neck where the strap starts (y 352, x 373-459) goes on the body's (y 256 of the frame, x 398-449)
    const C = S2("S4E5 Paintbrush's bristles turn into flames.png"), cs = 149 / 249;
    if (!baseArea[F]) baseArea[F] = L.fillArea(B(F));
    const scaleOf = Math.sqrt(baseArea[F] / L.fillArea(P2));   // the body's size, kept for the flaming one too (its fire is not body)
    // rage-1: the body with the close-up's scowl (brows, squeezed eyes, mouth: x 350-478, y 209-320) in place of its own surprised face. The
    // body's face is painted out below its ferrule's rim (its brows hang from the rim); the scowl is taken as ink only (inkLayer), since the
    // fire lights that head from above and a lifted face would carry the shading with it.
    const angry = L.clone(P2), fr = { x: 88, y: 149, w: 88, h: 76 }, bc = L.bodyColour(P2, padR(fr, 8));
    L.paintOut(angry, fr, (x, y, r, g, b) => Math.hypot(r - bc[0], g - bc[1], b - bc[2]) > 42);
    for (let y = 143; y < 149; y++) for (let x = fr.x; x < fr.x + fr.w; x++) {   // where the brows cross the rim's outline (y 145-148), the rim as it is between them
      const i = (y * angry.w + x) * 4, j = (y * angry.w + 135) * 4;
      if (L.lum(angry.d[i], angry.d[i + 1], angry.d[i + 2]) < 45 && angry.d[i + 3] > 128) for (let c = 0; c < 4; c++) angry.d[i + c] = angry.d[j + c];
    }
    putFace(angry, L.inkLayer(C, { x: 350, y: 209, w: 128, h: 111 }, { inkLum: 40, bodyLum: 100 }), 130, 187, { s: cs });
    emit(F, 'rage-1', L.trim(L.scaleBy(L.trim(angry, 0), scaleOf), 2), { src: ['S4E5 Paintbrush 2.png', "S4E5 Paintbrush's bristles turn into flames.png (their scowl)"],
      method: 'episode frame, the room keyed out and recoloured to their render, with the scowl of the close-up', note: 'Season 4, in place of the Season 2 PaintbrushIsPissedOff.png' });
    // rage-3: the close-up keyed (its doorway flooded in from the sides and the bottom, the top being the fire's cut), down to just past the neck
    const top = L.crop(C, 262, 0, 316, 357), tw = top.w, th = top.h;
    const doorway = (r, g, b, x, y) => L.lum(r, g, b) > 195 && b >= r - 12 && !(x >= 193 && x <= 243 && y < 65);   // (not the white flick of light in the fire, top right)
    const seeds = []; for (let y = 0; y < th; y++) { seeds.push([0, y], [tw - 1, y]); } for (let x = 0; x < tw; x++) seeds.push([x, th - 1]);
    L.matteEdge(top, L.floodBg(top, (r, g, b, a, x, y) => doorway(r, g, b, x, y) || y >= 352 && !(r > b + 25), seeds.filter(([x, y]) => { const i = (y * tw + x) * 4; return doorway(top.d[i], top.d[i + 1], top.d[i + 2], x, y); })), { band: 5 });
    for (let y = 352; y < th; y++) for (let x = 0; x < tw; x++) top.d[(y * tw + x) * 4 + 3] *= (th - y) / (th - 351);   // the last rows fade onto the body's strap
    // the fire runs off the frame's top (x 287-540 at y 0): it is rounded off with three lobes like its own, filled with the fire's own colours
    // mirrored up from the rows below the cut (its plain yellow where that is clear), its edge as soft as its glow
    const E = 70, fire = L.blank(tw, th + E);
    L.paste(fire, top, { x: 0, y: E });
    const lobes = [[345 - 262, 10, 58], [420 - 262, 5, 70], [495 - 262, 15, 50]];
    for (let y = 0; y < E + 40; y++) for (let x = 0; x < tw; x++) {
      const fy = y - E;   // the frame's y (above its top while negative)
      const inside = Math.max(...lobes.map(([cx, cy, r]) => r - Math.hypot(x - cx, fy - cy)));   // px inside the nearest lobe's edge
      if (inside <= -1.5) continue;
      const i = (y * tw + x) * 4, a = 255 * Math.min(1, (inside + 1.5) / 3);
      if (fy >= 0) {   // below the cut, the lobes only fill the doorway's white between the fire's own top lobes
        if (fire.d[i + 3] >= a) continue;
        const k = fire.d[i + 3] / 255; for (let c = 0; c < 3; c++) fire.d[i + c] = fire.d[i + c] * k + [255, 236, 18][c] * (1 - k);
        fire.d[i + 3] = a; continue;
      }
      const mi = ((E - fy - 1) * tw + x) * 4;   // the row as far below the cut as this one is above it
      const src = fire.d[mi + 3] > 200 ? [fire.d[mi], fire.d[mi + 1], fire.d[mi + 2]] : [255, 236, 18];
      fire.d[i] = src[0]; fire.d[i + 1] = src[1]; fire.d[i + 2] = src[2]; fire.d[i + 3] = a;
    }
    // on the body: the body below its neck (y >= 236 of the crop), the flaming head over it, the close-up's neck point (416, 352) on (123.5, 236)
    const body = L.clone(P2); L.eraseRect(body, 0, 0, body.w, 236);
    const pad = 60, out = L.blank(body.w + pad * 2, body.h + pad * 2);
    L.paste(out, body, { x: pad, y: pad });
    const fs = L.scaleBy(fire, cs), k = fire.w / fs.w;
    L.paste(out, fs, { x: pad + 123.5, y: pad + 236, ox: (416 - 262) / k, oy: (352 + E) / k });
    emit(F, 'rage-3', L.trim(L.scaleBy(L.trim(out, 0), scaleOf), 2), { src: ["S4E5 Paintbrush's bristles turn into flames.png", 'S4E5 Paintbrush 2.png (their strap, handle and limbs)'],
      method: 'episode frames: the flaming close-up keyed, its fire rounded off at the frame\'s cut, on the body of the other (recoloured to their render)', note: 'Season 4, in place of the Season 2 Paintbrush Rage.png' });
  }
  // RAGE, step 2 (Paintbrush is very mad..png, an episode frame): the pale sky and the white podium flooded out from the border; their ferrule
  // is the same pale grey but is closed in by its outline.
  { const im = L.crop(S('Paintbrush is very mad..png'), 870, 40, 380, 750);
    const pale = (R, G, Bb, A, x, y) => (L.lum(R, G, Bb) > 168 && Bb > 175 && !(x > 72 && x < 270 && y > 104 && y < 210 && Math.abs(R - G) < 14 && Math.abs(G - Bb) < 14)) || (y > 470 && Math.abs(R - G) < 14 && Math.abs(G - Bb) < 20 && L.lum(R, G, Bb) > 95 && L.lum(R, G, Bb) < 215);   // the grey podium rim is low down; the ferrule's grey is up top
    L.cutPred(im, pale);
    L.keepParts(im, (p) => p.n > 300);
    emit(F, 'rage-2', toBase(im, F), { src: ['Paintbrush is very mad..png'], method: 'episode frame, sky and podium keyed out' }); }
  // HURT: shocked (Paintbrush is shocked by Paper.png): a baseball and a can cover their handle and their bristles run off the top of the frame,
  // so the face goes on their own render.
  emit(F, 'shocked', L.trim(swapFace(B(F), { x: 18, y: 60, w: 42, h: 40 }, S('Paintbrush is shocked by Paper.png'), { x: 555, y: 345, w: 240, h: 135 }, { scale: 0.16, dy: 0 }), 2),
    { src: ['Paintbrush is shocked by Paper.png', 'paintbrush.png'], method: 'face swap: their face (an episode frame) on their own render' });
}

const ALL = { Donut: donut, Sidewalky: sidewalky, Lollipop: lollipop, Goo: goo, Tissues: tissues, Box: box, Bell: bell, 'Teddy Bear': teddy, Paintbrush: paintbrush };
for (const [name, fn] of Object.entries(ALL)) if (!ONLY || ONLY.includes(name)) { console.log(name); fn(); }
if (REPORT) writeFileSync(REPORT, JSON.stringify(rows, null, 2));
console.log(`\n${rows.length} pictures`);
