// ============================================================================
//  make-event-spongy.mjs -- Spongy's pose pictures (event fighters, kit 2: event-fighters-phase1.md, 3.2; 2026-10-30)
// ============================================================================
//   node scripts/make-event-spongy.mjs --dec=<folder of the decoded downloads> [--out=artifacts/V1/assets/sprites]     (cwd = repo root)
//
// BFB+TPOT art (approval question 29): his TPOT 25 render (spongy.png, already the assist's picture) stands, and these come from the five files the
// owner approved (the wiki's own file pages): SpongyVoting.png, Spongy---walk.gif, Spoogy.png, Spongy Sucking Stapy Up0024.png and Spongy in his
// Private Jet.png. Each was decoded once to a plain RGBA PNG (the GIF to one PNG a frame, "02-walk-NN.png"), since pngjs reads PNG only; the
// decoded names are 01-spongy-spongyvoting.png, 03-spongy-spoogy.png, 04-spongy-spongy-sucking-stapy-up0024.png and
// 05-spongy-spongy-in-his-private-jet.png. Every output is trimmed, area-averaged to 200 px tall (never enlarged) and held to fetch-sprites.mjs's
// checks; what each became is in CREDITS.md and scripts/sprite-manifest.json ("Spongy (<pose>)").
import { mkdirSync } from 'node:fs';
import * as L from './anim-pose-lib.mjs';
import * as FS from './fetch-sprites.mjs';
import os from 'node:os';
try { os.setPriority(0, os.constants.priority.PRIORITY_BELOW_NORMAL); } catch (e) {}
const flag = (k) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : ''; };
const slashed = (p) => p.split(String.fromCharCode(92)).join('/').replace(/\/?$/, '/');
const D = slashed(flag('dec') || '.');
const OUT = slashed(flag('out') || 'artifacts/V1/assets/sprites');
if (!flag('dec')) { console.error('usage: node scripts/make-event-spongy.mjs --dec=<decoded downloads> [--out=artifacts/V1/assets/sprites]'); process.exit(1); }
mkdirSync(OUT, { recursive: true });
const base = L.load('artifacts/V1/assets/sprites/spongy.png');
const rows = [];
const toH = (im, H) => L.resize(im, Math.max(1, Math.round(im.w * H / im.h)), H);
function check(name, im) {
  const png = { width: im.w, height: im.h, data: Buffer.from(im.d) };
  const a = FS.analyse(png), v = FS.verdict(a);
  return { a, v };
}
function out(key, im, note, src) {
  const file = 'spongy-' + key + '.png';
  L.save(OUT + file, im);
  const { a, v } = check(key, im);
  rows.push({ key, file, w: im.w, h: im.h, ink: a.inkPixels, cov: +a.coverage.toFixed(3), warn: v, note, src });
  console.log(key, im.w + 'x' + im.h, 'ink', a.inkPixels, 'cov', a.coverage.toFixed(3), v.length ? 'WARN ' + v.join('; ') : '');
}

// 1. the voting pose (BFB: SpongyVoting.png): eyes closed, pleased -- win and Soak Up's last beat. Side panel on the right, like the drawn base.
{ const im = L.trim(L.load(D + '01-spongy-spongyvoting.png'), 0); out('vote', toH(im, 200), 'the BFB voting pose', 'SpongyVoting.png'); }
// 2. zapped (Spoogy.png): X eyes, a grimace -- hurt and launched.
{ const im = L.trim(L.load(D + '03-spongy-spoogy.png'), 0); out('zapped', toH(im, 200), 'zapped: X eyes and a grimace', 'Spoogy.png'); }
// 3. the jet (Spongy in his Private Jet.png): the Final Smash. Nose to the left (flipped like the base).
{ const im = L.trim(L.load(D + '05-spongy-spongy-in-his-private-jet.png'), 0); out('jet', toH(im, 200), 'his one-seat jet (BFB 15)', 'Spongy in his Private Jet.png'); }
// 4. the suction frame (Spongy Sucking Stapy Up0024.png, a faceless body with his holes opened up): Soak Up and the grab. The base render's own
//    face (eyes shut, lips pursed: sucking) and legs are laid on it, in the base's orientation (so it is flipped like the base).
{
  let body = L.trim(L.load(D + '04-spongy-spongy-sucking-stapy-up0024.png'), 0);
  body = L.flipX(body);                        // the straight edge to the right, the taper to the left: the base's side panel is on its left
  const BH = 172; body = toH(body, BH);
  const W = Math.max(body.w, 240), H = 200, im = L.blank(W, H);
  const bx = Math.round((W - body.w) / 2);
  // the legs: the base render's ink under its body (rows 176..199), centred under the new body
  const legs = L.blank(base.w, base.h);
  for (let y = 176; y < 200; y++) for (let x = 100; x < 200; x++) { const i = (y * base.w + x) * 4; if (base.d[i + 3] > 30 && L.lum(base.d[i], base.d[i + 1], base.d[i + 2]) < 90) { for (let c = 0; c < 4; c++) legs.d[i + c] = base.d[i + c]; } }
  L.paste(im, legs, { x: Math.round(W / 2 - 150), y: H - 200 });
  L.paste(im, body, { x: bx, y: 0 });
  // the face: lifted off the base render (body colour 242,213,0), its box found by the dark ink in the face area
  const rect = { x: 100, y: 70, w: 110, h: 70 };
  const face = L.liftFace(base, rect, [242, 213, 0], 70);
  L.paste(im, face, { x: Math.round(W * 0.47 - rect.w / 2), y: Math.round(BH * 0.42 - rect.h / 2) });
  out('suck', im, 'the suction frame, with the base render\'s face and legs laid on', 'Spongy Sucking Stapy Up0024.png (+ spongy.png face and legs)');
}
// 5. the walk (Spongy - walk.gif, 14 frames): the GIF's frames carry a dark round shadow over his left side, multiplied in. It is lifted: the
//    darkening is measured from the body's own yellow (242,213,0), smoothed, and divided out; under 20% left (the core of it) the body is
//    refilled with his plain yellow. One crop for all 14 frames, so the legs stay put frame to frame. Then, at 200 px, the shadow's middle is
//    re-skinned from the base render (skin, below): the plain fill there had left a flat disc with banded rings round it and a black speck
//    (the check of 2026-11-01).
{
  // Lifting the shadow cannot bring back what the GIF kept too little of (its middle had gone black, and the light it kept round that was
  // banded into rings). So under the shadow, the more of it there was, the more his sponge comes from the base render instead -- flipped to
  // face the same way, its face and ink painted out, laid over his body box to box -- feathered into the lifted GIF; his outline, his face
  // and his legs stay the GIF's own.
  const KLO = 0.5, KHI = 0.9;
  const yellowBox = (im) => { let a = 1e9, b = 1e9, c = -1, e = -1; for (let p = 0; p < im.w * im.h; p++) { const i = p * 4; if (im.d[i + 3] > 200 && im.d[i] > 120 && im.d[i + 1] > 90 && im.d[i + 2] < 70) { const x = p % im.w, y = (p / im.w) | 0; if (x < a) a = x; if (x > c) c = x; if (y < b) b = y; if (y > e) e = y; } } return { x: a, y: b, w: c - a + 1, h: e - b + 1 }; };
  const sponge = L.flipX(base), SB = yellowBox(sponge), INSET = 7;
  const ink = new Uint8Array(sponge.w * sponge.h);   // its face and any ink (and a pixel round each, the strokes' soft edges)
  for (let p = 0; p < ink.length; p++) { const i = p * 4; if (sponge.d[i + 3] > 200 && L.lum(sponge.d[i], sponge.d[i + 1], sponge.d[i + 2]) < 90) ink[p] = 1; }
  L.paintOut(sponge, { x: 0, y: 0, w: sponge.w, h: sponge.h }, (x, y, r, g, b) => { if (y > SB.y + SB.h - 6) return false; if (L.lum(r, g, b) < 125) return true; for (let j = -2; j <= 2; j++) for (let q = -2; q <= 2; q++) { const xx = x + q, yy = y + j; if (xx >= 0 && yy >= 0 && xx < sponge.w && yy < sponge.h && ink[yy * sponge.w + xx]) return true; } return false; }, 300);   // refilled from the sponge round them
  const sAt = (u, v) => {   // the sponge's colour at (u, v), bilinear; null off its body
    const x = Math.floor(u), y = Math.floor(v), fx = u - x, fy = v - y; let R = 0, G = 0, A = 0;
    for (const [xx, yy, wt] of [[x, y, (1 - fx) * (1 - fy)], [x + 1, y, fx * (1 - fy)], [x, y + 1, (1 - fx) * fy], [x + 1, y + 1, fx * fy]]) {
      if (xx < 0 || yy < 0 || xx >= sponge.w || yy >= sponge.h) return null;
      const i = (yy * sponge.w + xx) * 4; if (sponge.d[i + 3] < 230) return null;
      R += sponge.d[i] * wt; G += sponge.d[i + 1] * wt; A += wt;
    }
    return [R / A, G / A];
  };
  const smooth = (t) => { const u = Math.max(0, Math.min(1, (t - KLO) / (KHI - KLO))); return u * u * (3 - 2 * u); };
  // His rim, from outside in, as the GIF draws it where no shadow fell (px from the edge of his silhouette): the dark-gold outline, then a step
  // lighter, then nearly his yellow.
  const RIM = [[183, 147, 0], [183, 147, 0], [200, 165, 0], [226, 188, 0]];
  function skin(im, kAt, s) {
    const { w, h, d } = im, B = yellowBox(im), src = new Uint8ClampedArray(d);
    const sx = (SB.w - 2 * INSET) / B.w, sy = (SB.h - 2 * INSET) / B.h;   // (box to box, the sponge's kept inside its own outline)
    // how far each pixel is from his silhouette's edge (a chamfer distance, in px)
    const dt = new Float32Array(w * h).fill(1e9);
    for (let p = 0; p < w * h; p++) if (src[p * 4 + 3] < 128) dt[p] = 0;
    const relax = (x, y, dx, dy, c) => { const xx = x + dx, yy = y + dy, p = y * w + x; const v = (xx < 0 || yy < 0 || xx >= w || yy >= h) ? 0 : dt[yy * w + xx]; if (v + c < dt[p]) dt[p] = v + c; };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { relax(x, y, -1, 0, 1); relax(x, y, 0, -1, 1); relax(x, y, -1, -1, 1.414); relax(x, y, 1, -1, 1.414); }
    for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) { relax(x, y, 1, 0, 1); relax(x, y, 0, 1, 1); relax(x, y, 1, 1, 1.414); relax(x, y, -1, 1, 1.414); }
    for (let y = B.y; y < B.y + B.h; y++) for (let x = B.x; x < B.x + B.w; x++) {
      const p = y * w + x, i = p * 4; if (src[i + 3] < 128) continue;
      const k = kAt(x / s, y / s); if (k >= KHI) continue;
      if (L.lum(src[i], src[i + 1], src[i + 2]) < 110 && k > 0.35) continue;   // his face's strokes stay (the black left at the shadow's middle does not)
      const r = Math.max(0, Math.round(dt[p]) - 1);
      const c = r < RIM.length ? RIM[r] : (sAt(SB.x + INSET + (x - B.x) * sx, SB.y + INSET + (y - B.y) * sy) || [242, 213]);
      const m = smooth(k);
      d[i] = src[i] * m + c[0] * (1 - m); d[i + 1] = src[i + 1] * m + c[1] * (1 - m); d[i + 2] = 0;
    }
  }
  const fr = []; for (let i = 0; i < 14; i++) fr.push(L.load(D + '02-walk-' + String(i).padStart(2, '0') + '.png'));
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (const im of fr) { const b = L.bbox(im); x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w - 1); y1 = Math.max(y1, b.y + b.h - 1); }
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
  const keys = [];
  for (let n = 0; n < 14; n++) {
    const im = L.crop(fr[n], x0, y0, cw, ch), { w, h, d } = im;
    // the shadow is a round gradient multiplied in: its middle is where the body is darkest
    const dk = [];
    for (let p = 0; p < w * h; p++) { const i = p * 4; if (d[i + 3] > 200 && d[i] + d[i + 1] > 3 && d[i + 2] < 30) dk.push([d[i] + d[i + 1], p]); }
    dk.sort((A, B) => A[0] - B[0]);
    let cx = 0, cy = 0; const nn = Math.min(400, dk.length); for (let j = 0; j < nn; j++) { cx += dk[j][1] % w; cy += Math.floor(dk[j][1] / w); } cx /= nn; cy /= nn;
    // its profile by distance from the middle: the body yellow's ratio (G/R 0.86-0.90) at a high percentile, so the holes do not pull it down
    const BIN = 3, NB = Math.ceil(Math.hypot(w, h) / BIN) + 2, bins = Array.from({ length: NB }, () => []);
    for (let p = 0; p < w * h; p++) { const i = p * 4; if (d[i + 3] < 220) continue; const R = d[i], G = d[i + 1]; if (R < 3 || d[i + 2] > 20) continue; const q = G / R; if (q < 0.855 || q > 0.905) continue;
      const r = Math.hypot(p % w - cx, Math.floor(p / w) - cy); bins[Math.floor(r / BIN)].push(Math.min(1, R / 242)); }
    let prof = bins.map(v => { if (v.length < 6) return -1; v.sort((A, B) => A - B); return v[Math.floor(v.length * 0.9)]; });
    let last = 0.02; prof = prof.map(v => (last = v < 0 ? last : Math.max(last, v)));   // rises from the middle out, never falls
    const sm = prof.map((v, j) => { let s = 0, c = 0; for (let q = -3; q <= 3; q++) { const u = prof[j + q]; if (u != null) { s += u; c++; } } return Math.min(1, s / c); });
    const kAt = (x, y) => sm[Math.min(NB - 1, Math.floor(Math.hypot(x - cx, y - cy) / BIN))];
    const PAL = [[242, 213, 0], [230, 191, 0], [225, 198, 0], [230, 199, 0], [183, 147, 0]];
    for (let p = 0; p < w * h; p++) {
      const i = p * 4; if (d[i + 3] < 10) continue;
      if (d[i + 1] > d[i] + 30){ d[i] = 183; d[i + 1] = 147; d[i + 2] = 0; continue; }   // the green fringe left round the cut-out
      const x = p % w, y = Math.floor(p / w), k = kAt(x, y); if (k >= 0.995) continue;
      if (d[i] + d[i + 1] <= 1 || (d[i] < 25 && d[i + 1] < 25 && k > 0.35)) continue;   // the black strokes (eyes, mouth, legs) stay black
      if (k < 0.2){   // the core, where the GIF kept too little to read: his plain yellow, with his dark-gold outline at the edge
        let edge = false; for (let j = -4; j <= 4 && !edge; j++) for (let q = -4; q <= 4; q++){ const xx = x + q, yy = y + j; if (xx < 0 || yy < 0 || xx >= w || yy >= h || d[(yy * w + xx) * 4 + 3] < 60){ edge = true; break; } }
        const c = edge ? PAL[4] : PAL[0]; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = 0; continue;
      }
      const R = d[i] / k, G = d[i + 1] / k;
      let best = null, bd = 1e9; for (const c of PAL) { const e = (R - c[0]) ** 2 + (G - c[1]) ** 2; if (e < bd) { bd = e; best = c; } }
      if (k < 0.6 || bd < 900) { d[i] = best[0]; d[i + 1] = best[1]; d[i + 2] = 0; } else { d[i] = Math.min(255, R); d[i + 1] = Math.min(255, G); d[i + 2] = 0; }
    }
    const small = toH(im, 200);
    skin(small, kAt, small.h / ch);
    const key = 'walk-' + String(n + 1).padStart(2, '0'); keys.push(key);
    out(key, small, 'walk frame ' + (n + 1) + ' of 14, the GIF\'s shadow lifted', 'Spongy---walk.gif (frame ' + (n + 1) + ')');
  }
}
