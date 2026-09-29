// ============================================================================
//  make-fsb-metal.mjs -- Firey Speaker Box's RAGE MODE look, from the show's own files
// ============================================================================
// "Firey Speaker Box eats the Yoyleberries and turns into metal." (Well Rested/Transcript, BFDIA 6). The wiki has his metal
// form as a plain box (File:Metal FSB front.png) and his hoverboard form as the render the game already wears
// (assets/sprites/firey-speaker-box.png, File:BFDIA-7FlyingFireySpeaker.png), so phase 3 wears the two put together: the
// render with its orange box taken out and the metal box set on the same hoverboard, thrusters and flames. Nothing is drawn
// by hand; every pixel is the show's. The output is the same size as the render (141x200).
//
//   node scripts/make-fsb-metal.mjs        (needs the network for the metal file)
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const BASE = 'artifacts/V1/assets/sprites/firey-speaker-box.png', OUT = 'artifacts/V1/assets/sprites/firey-speaker-box-metal.png';
const WIKI = 'https://battlefordreamisland.fandom.com', UA = { 'User-Agent': 'smash-island-fan-game/1.0 (personal fan project)' };
const TITLE = 'Metal FSB front.png';

const j = await (await fetch(`${WIKI}/api.php?${new URLSearchParams({ action: 'query', titles: `File:${TITLE}`, prop: 'imageinfo', iiprop: 'url|size|mime', format: 'json' })}`, { headers: UA })).json();
const info = Object.values(j.query.pages)[0].imageinfo[0];
const metal = PNG.sync.read(Buffer.from(await (await fetch(`${info.url.split('/revision/')[0]}/revision/latest/scale-to-height-down/420?format=original`, { headers: UA })).arrayBuffer()));
const base = PNG.sync.read(readFileSync(BASE));
const { width: W, height: H, data: d } = base;

// The box: its orange fill (the board and the board's outline are red), a pixel wider each side for the box's own darker
// outline, down to the row where it meets the board's top edge.
const orange = (i) => d[i + 3] > 200 && d[i] > 170 && d[i + 1] > 90 && d[i + 1] < 200 && d[i + 2] < 90;
let x0 = W, x1 = -1, y0 = H, y1 = -1;
for (let y = 0; y < 106; y++) for (let x = 0; x < W; x++) if (orange((y * W + x) * 4)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
x0 -= 1; x1 += 1; y0 -= 1;
const boardTop = y1 + 1, bw = x1 - x0 + 1, bh = boardTop - y0;
for (let y = y0; y < boardTop; y++) for (let x = x0; x <= x1; x++) d[(y * W + x) * 4 + 3] = 0;

// The metal box, area-averaged down to that rectangle, premultiplied so its rounded corners stay clean.
for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
  const sx0 = Math.floor(x * metal.width / bw), sx1 = Math.max(sx0 + 1, Math.floor((x + 1) * metal.width / bw));
  const sy0 = Math.floor(y * metal.height / bh), sy1 = Math.max(sy0 + 1, Math.floor((y + 1) * metal.height / bh));
  let r = 0, g = 0, b = 0, a = 0, n = 0;
  for (let sy = sy0; sy < sy1; sy++) for (let sx = sx0; sx < sx1; sx++) {
    const i = (sy * metal.width + sx) * 4, al = metal.data[i + 3] / 255;
    r += metal.data[i] * al; g += metal.data[i + 1] * al; b += metal.data[i + 2] * al; a += al; n++;
  }
  if (a <= 0) continue;
  const o = ((y0 + y) * W + x0 + x) * 4;
  d[o] = r / a; d[o + 1] = g / a; d[o + 2] = b / a; d[o + 3] = Math.round(255 * a / n);
}
writeFileSync(OUT, PNG.sync.write(base));
console.log(`box ${bw}x${bh} at (${x0},${y0}), resting on the board from y=${boardTop}; metal ${metal.width}x${metal.height} from ${info.url}\n-> ${OUT} ${W}x${H}`);
