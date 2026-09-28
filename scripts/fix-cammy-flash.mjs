// ============================================================================
//  fix-cammy-flash.mjs -- colour-correct Cammy's pop-up-flash pose to his own render
// ============================================================================
// The only picture of Cammy with his flash up (File:Cammy Flash.png, All Play and No Work) is a night-time capture:
// the whole body sits in a dark blue cast, so beside his day render (cammy.png) he read as a different, darker camera.
// The batch-3 plan said to colour-correct it before use. This is a plain white balance: each channel is scaled so the
// pose's average opaque colour matches his own render's, clamped, alpha untouched. Run after fetch-sprites.mjs fetched
// "Cammy (flash)=Cammy_Flash.png":
//
//   node scripts/fix-cammy-flash.mjs            (cwd = repo root; rewrites cammy-flash.png in place)
import { readFileSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const DIR = 'artifacts/V1/assets/sprites';
const mean = (png) => {
  const s = [0, 0, 0]; let n = 0;
  for (let i = 0; i < png.data.length; i += 4) if (png.data[i + 3] > 200) { s[0] += png.data[i]; s[1] += png.data[i + 1]; s[2] += png.data[i + 2]; n++; }
  return s.map((v) => v / Math.max(1, n));
};
const day = PNG.sync.read(readFileSync(`${DIR}/cammy.png`));
const night = PNG.sync.read(readFileSync(`${DIR}/cammy-flash.png`));
const want = mean(day), have = mean(night);
if (have[0] > want[0] * 0.8) { console.log('cammy-flash.png already corrected; nothing to do'); process.exit(0); }
const gain = want.map((w, c) => w / Math.max(1, have[c]));
for (let i = 0; i < night.data.length; i += 4) for (let c = 0; c < 3; c++) night.data[i + c] = Math.min(255, Math.round(night.data[i + c] * gain[c]));
writeFileSync(`${DIR}/cammy-flash.png`, PNG.sync.write(night));
console.log(`cammy-flash.png white-balanced: gains ${gain.map((g) => g.toFixed(2)).join(', ')}`);
