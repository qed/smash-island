// Builds the Capture the Flag route graphs OFFLINE and writes artifacts/V1/assets/ctf/<map>-graph.json (the game loads one at match start
// instead of simulating every move of the map during the hiding phase; see ctfNavMake in index.html).
//
//   node scripts/ctf-build-graphs.mjs            every map
//   node scripts/ctf-build-graphs.mjs castle     just those named
//
// Run it again whenever a CTF map, a physics number the moves are simulated with, or ctfNavProbe changes: test/ctf-graphs.test.js fails until you do.
// Each map takes 10-25 s of CPU; for several maps start one process per map.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadMonolith } from '../test/helpers/load-monolith.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const { window: w } = loadMonolith(1);
const all = w.eval('Object.keys(CTF_MAPS)');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : all;
const out = resolve(root, 'artifacts/V1/assets/ctf');
mkdirSync(out, { recursive: true });
for (const id of ids) {
  if (!all.includes(id)) { console.error('no such CTF map:', id); process.exitCode = 1; continue; }
  const t0 = Date.now();
  const json = w.eval(`(function(){ CTF.noShipped = true; const M = ctfMapGet(${JSON.stringify(id)}); const nav = ctfNavNew(M); while(!nav.ready) ctfNavTick(nav, 500); return JSON.stringify(ctfNavPack(nav)); })()`);
  writeFileSync(resolve(out, id + '-graph.json'), json);
  console.log(id, (json.length / 1024).toFixed(0) + ' KB', ((Date.now() - t0) / 1000).toFixed(1) + ' s');
}
process.exit(process.exitCode || 0);
