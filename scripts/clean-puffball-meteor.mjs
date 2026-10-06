// ============================================================================
//  clean-puffball-meteor.mjs -- Puffball's BFDIA 6 dive, cut out of its episode frame BY HAND
// ============================================================================
// "meteor puff should have the sprite from bfdia 6" (the owner, 2026-10-06). BFDIA 6 is "Well Rested" (battlefordreamisland.fandom.com).
// At its Cake at Stake, Puffball -- furious that Firey won the prize -- dives out of space at him ("Puffball ... tries to attack Firey
// to prevent him from spinning the prize wheel"), and the Well Rested gallery's Cake at Stake frames show the dive in two shots:
//   File:Bfdia6 prize (22).png   the dive, angry, in space: a pink Puffball with her teeth gritted and the streaks of the fall behind her
//   File:Bfdia6 prize (23).png   the same dive an instant later, burning: she has hit the atmosphere, her whole body is on fire and she is
//                                 screaming (the show's "AAAAAHH"), her fire trailing up and behind her
// The second is the METEOR: it is what Meteor Puff is named for, and it is what she wears for the whole of her dive (FIGHTER_ANIM.Puffball.poses.meteor).
// It exists only inside that frame (the wiki has no isolated file of it), so it is lifted out of it -- and, as with Cammy's pop-up flash
// ("cammy-flash could be better cropped" -- "No, clean it by hand", the owner, 2026-09-29), BY HAND and not by a background remover:
//   1. POLY is her silhouette, TRACED BY EYE round the outer edge of her outline in the frame's own pixels (a click-by-click polygon, read off the
//      frame at 3.6x with a labelled grid, checked by drawing it over the frame and moved wherever it strayed). It is deliberately a little outside
//      the outline: the cut is then pulled in ERODE px, so it lands ON her outline and no brown of the fire's glow or black of the sky is left to
//      show as a rim on the game's pale skies. Her fire trail, the streaks, the stars and the glow are all outside it and all go.
//   2. the cut edge is a 1.5 px soft step, so it is anti-aliased like the other renders'.
//   3. cropped to what is left (her alpha box) and shrunk to 200 px tall like every render (area average, premultiplied), so she is drawn at the
//      size of her other sprites.
// Nothing is guessed from colour: every pixel that stays is a pixel the show drew, inside the line traced round her.
//
//   node scripts/clean-puffball-meteor.mjs            (cwd = repo root) -> artifacts/V1/assets/sprites/puffball-meteor.png
//   node scripts/clean-puffball-meteor.mjs --check=<file.png>   also writes a contact sheet of the cut on the game's skies and floor
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const WIKI = 'https://battlefordreamisland.fandom.com';
const TITLE = 'Bfdia6 prize (23).png';
const UA = { 'User-Agent': 'smash-island-fan-game/1.0 (personal fan project)' };
const OUT = 'artifacts/V1/assets/sprites/puffball-meteor.png';
const MANIFEST = 'scripts/sprite-manifest.json';
const ERODE = 3;        // px of the frame: how far the hand-traced line is pulled in, onto her outline
const FEATHER = 1.5;    // px of the frame: the width of the soft step at the cut
const H = 200;          // every render is 200 px tall

// Her silhouette, traced by hand in the pixels of File:Bfdia6 prize (23).png (1920x1080), clockwise from the notch left of her top tuft.
const POLY = [
  [906, 295],
  [909, 285], [914, 276], [921, 268], [931, 262], [945, 258], [960, 257], [975, 260], [990, 265], [1003, 272], [1015, 282], [1025, 293], [1033, 305], [1040, 318], [1046, 330], [1050, 342], [1053, 352],   // the top tuft
  [1062, 343], [1070, 333], [1080, 323], [1090, 317], [1100, 313], [1110, 314], [1118, 320], [1123, 330], [1127, 345], [1128, 360], [1125, 375], [1120, 390], [1116, 402], [1118, 411],   // the top-right lobe
  [1127, 416], [1145, 415], [1162, 416], [1178, 419], [1192, 425], [1204, 433], [1213, 442], [1220, 452], [1225, 464], [1228, 477], [1230, 490], [1228, 502], [1222, 510], [1213, 516], [1203, 520], [1192, 521], [1182, 518],   // the right lobe
  [1190, 525], [1200, 531], [1208, 541], [1215, 552], [1221, 563], [1226, 575], [1230, 587], [1233, 598], [1230, 610], [1224, 620], [1216, 629], [1206, 637], [1194, 642], [1182, 644], [1170, 641], [1159, 634], [1149, 625], [1142, 617], [1141, 614],   // the lower-right lobe
  [1141, 620], [1143, 630], [1145, 645], [1146, 660], [1146, 675], [1147, 690], [1149, 705], [1149, 720], [1148, 735], [1146, 750], [1142, 765], [1137, 777], [1130, 790], [1121, 802], [1110, 811], [1099, 816], [1087, 815], [1076, 808], [1069, 799], [1063, 792],   // the bottom-right lobe
  [1062, 806], [1058, 817], [1053, 830], [1048, 843], [1041, 857], [1033, 870], [1024, 882], [1012, 891], [998, 897], [982, 900], [965, 899], [948, 895], [933, 889], [921, 880], [913, 870], [912, 863],   // the bottom lobe
  [909, 869], [898, 876], [885, 880], [870, 879], [855, 874], [842, 867], [832, 858], [826, 848], [823, 836], [821, 826],   // the lower-middle lobe
  [808, 828], [792, 831], [775, 833], [758, 833], [742, 830], [729, 823], [719, 813], [711, 802], [703, 790], [696, 778], [693, 765], [693, 750], [695, 735], [698, 722], [704, 711],   // the lower-left lobe
  [690, 716], [675, 716], [658, 712], [643, 705], [629, 695], [617, 683], [609, 668], [606, 650], [606, 630], [610, 618], [617, 608], [628, 600], [641, 591], [653, 581], [662, 572],   // the left lobe, with her screaming mouth
  [650, 566], [638, 559], [627, 552], [619, 543], [614, 532], [611, 520], [611, 510], [612, 500], [616, 490], [620, 480], [624, 470], [630, 460], [638, 450], [648, 440], [660, 430], [672, 422], [685, 416], [698, 413], [702, 411],   // the upper-left lobe
  [688, 402], [678, 392], [674, 380], [673, 368], [676, 356], [682, 346], [690, 338], [698, 331], [708, 323], [720, 316], [735, 308], [750, 302], [765, 297], [780, 293], [800, 289], [820, 287], [840, 286], [860, 288], [880, 290], [895, 292],   // the top-left lobe
];

async function api(params) {
  const r = await fetch(`${WIKI}/api.php?${new URLSearchParams({ ...params, format: 'json' })}`, { headers: UA });
  if (!r.ok) throw new Error(`api ${r.status}`);
  return r.json();
}
const j = await api({ action: 'query', titles: `File:${TITLE}`, prop: 'imageinfo', iiprop: 'url|size', });
const info = Object.values(j.query.pages)[0].imageinfo[0];
const source = info.url;
console.log('source', source, info.width + 'x' + info.height);
const dl = await fetch(source.split('?')[0] + '?format=original', { headers: UA });
const frame = PNG.sync.read(Buffer.from(await dl.arrayBuffer()));
if (frame.width !== info.width || frame.height !== info.height) throw new Error('the download is not the frame the wiki lists');

// ---- 1. the hand mask -----------------------------------------------------------------------------------------------------------
const w = frame.width, h = frame.height, d = frame.data;
const xs = POLY.map((p) => p[0]), ys = POLY.map((p) => p[1]);
const bx0 = Math.min(...xs) - 6, bx1 = Math.max(...xs) + 6, by0 = Math.min(...ys) - 6, by1 = Math.max(...ys) + 6;
const inside = (x, y) => { let c = false; for (let i = 0, k = POLY.length - 1; i < POLY.length; k = i++) { const [xi, yi] = POLY[i], [xk, yk] = POLY[k]; if (((yi > y) !== (yk > y)) && (x < (xk - xi) * (y - yi) / (yk - yi) + xi)) c = !c; } return c; };
const segDist = (px, py, ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy; let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t; return Math.hypot(px - (ax + dx * t), py - (ay + dy * t)); };
const alpha = new Float32Array(w * h);
for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
  const px = x + 0.5, py = y + 0.5;
  if (!inside(px, py)) continue;
  let m = 1e9;
  for (let i = 0, k = POLY.length - 1; i < POLY.length; k = i++) { const e = segDist(px, py, POLY[k][0], POLY[k][1], POLY[i][0], POLY[i][1]); if (e < m) m = e; }
  alpha[y * w + x] = Math.max(0, Math.min(1, (m - ERODE + FEATHER / 2) / FEATHER));
}
// ---- 2. crop to what is left -----------------------------------------------------------------------------------------------------
let x0 = w, y0 = h, x1 = -1, y1 = -1;
for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) if (alpha[y * w + x] > 0.02) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
const sw = x1 - x0 + 1, sh = y1 - y0 + 1, sc = H / sh, W2 = Math.round(sw * sc);
console.log('cut', sw + 'x' + sh, '->', W2 + 'x' + H);
// ---- 3. shrink to 200 px tall (premultiplied area average) --------------------------------------------------------------------------
const out = new PNG({ width: W2, height: H });
for (let y = 0; y < H; y++) for (let x = 0; x < W2; x++) {
  let r = 0, g = 0, b = 0, a = 0, n = 0;
  const sx0 = x0 + x / sc, sx1 = x0 + (x + 1) / sc, sy0 = y0 + y / sc, sy1 = y0 + (y + 1) / sc;
  for (let yy = Math.floor(sy0); yy < Math.ceil(sy1); yy++) for (let xx = Math.floor(sx0); xx < Math.ceil(sx1); xx++) {
    if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
    const i = (yy * w + xx) * 4, A = alpha[yy * w + xx];
    r += d[i] * A; g += d[i + 1] * A; b += d[i + 2] * A; a += A; n++;
  }
  const o = (y * W2 + x) * 4;
  if (a > 0 && a / n > 0.5 / 255) { out.data[o] = Math.round(r / a); out.data[o + 1] = Math.round(g / a); out.data[o + 2] = Math.round(b / a); out.data[o + 3] = Math.round(255 * a / n); }
}
// every corner is air
for (const [x, y] of [[0, 0], [W2 - 1, 0], [0, H - 1], [W2 - 1, H - 1]]) if (out.data[(y * W2 + x) * 4 + 3] !== 0) throw new Error(`corner ${x},${y} is not clear`);
writeFileSync(OUT, PNG.sync.write(out));

// ---- the facing, measured the way scripts/fetch-sprites.mjs measures it: the centroid of the dark ink inside her, against the centroid of her ----------------
{
  const lums = []; for (let i = 0; i < out.data.length; i += 4) if (out.data[i + 3] >= 24) lums.push(out.data[i] * 0.299 + out.data[i + 1] * 0.587 + out.data[i + 2] * 0.114);
  lums.sort((a, b) => a - b); const median = lums[lums.length >> 1], inkMax = Math.max(90, median - 60);
  const solid = (x, y) => x >= 0 && y >= 0 && x < W2 && y < H && out.data[(y * W2 + x) * 4 + 3] >= 24;
  let bsx = 0, bn = 0, isx = 0, inn = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W2; x++) {
    if (!solid(x, y)) continue; bsx += x; bn++;
    let inner = true; for (let dy = -3; dy <= 3 && inner; dy++) for (let dx = -3; dx <= 3; dx++) if (!solid(x + dx, y + dy)) { inner = false; break; }
    const i = (y * W2 + x) * 4; if (inner && out.data[i] * 0.299 + out.data[i + 1] * 0.587 + out.data[i + 2] * 0.114 < inkMax) { isx += x; inn++; }
  }
  const facing = +((isx / inn - bsx / bn) / W2).toFixed(3);
  console.log('facing', facing, facing < 0 ? '(her face sits left of her middle: the art faces LEFT, flip:true)' : '(faces right)');
  // ---- the manifest row: where it came from, what it is, how it was cut -------------------------------------------------------------------------------------------
  const man = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  man['Puffball (meteor)'] = { name: 'Puffball (meteor)', slug: 'puffball-meteor', source, ok: true, file: 'puffball-meteor.png', width: W2, height: H, facing, flip: facing < 0,
    note: "BFDIA 6 (Well Rested), Cake at Stake: Puffball's burning dive at Firey, hand-cut out of File:Bfdia6 prize (23).png (scripts/clean-puffball-meteor.mjs)", frame: { file: TITLE, width: info.width, height: info.height } };
  writeFileSync(MANIFEST, JSON.stringify(man, null, 2));   // (the manifest has no final newline)
}
const checkArg = process.argv.find((a) => a.startsWith('--check='));
if (checkArg) {
  const bgs = [[150, 215, 250], [122, 190, 68], [255, 255, 255], [40, 40, 56]], cell = W2 + 20, sheet = new PNG({ width: cell * bgs.length, height: H + 20 });
  bgs.forEach((bg, k) => { for (let y = 0; y < H + 20; y++) for (let x = 0; x < cell; x++) { const o = (y * sheet.width + k * cell + x) * 4; sheet.data[o] = bg[0]; sheet.data[o + 1] = bg[1]; sheet.data[o + 2] = bg[2]; sheet.data[o + 3] = 255; }
    for (let y = 0; y < H; y++) for (let x = 0; x < W2; x++) { const i = (y * W2 + x) * 4, a = out.data[i + 3] / 255, o = ((y + 10) * sheet.width + k * cell + x + 10) * 4; for (let c = 0; c < 3; c++) sheet.data[o + c] = Math.round(out.data[i + c] * a + sheet.data[o + c] * (1 - a)); } });
  writeFileSync(checkArg.slice(8), PNG.sync.write(sheet));
  console.log('sheet', checkArg.slice(8));
}
