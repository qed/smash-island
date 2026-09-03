// Snapshot every fighter's smash at full charge on the CURRENT build, before the charge retune.
//   node scripts/smash-golden.mjs            -> writes test/golden/smash-charge.json
// The retune in Batch 1 then passes or fails per fighter against this, instead of by eye.
import { writeFileSync } from 'node:fs';
import { bootMonolith, measureSmash, GOLDEN_DISTS } from '../test/helpers/smash-golden.js';

const w = bootMonolith();
await w.eval('profileReady');
const names = w.eval('ROSTER.filter(function(r){return r.play;}).map(function(r){return r.name;})');
const out = {};
for (const name of names) {
  out[name] = {};
  for (const dist of GOLDEN_DISTS) out[name][dist] = measureSmash(w, name, 1.0, dist);
}
writeFileSync('test/golden/smash-charge.json', JSON.stringify(out, null, 1));
let zero = 0;
for (const n of names) { const r = out[n][60]; if (r.dmg === 0 && out[n][140].dmg === 0) zero++;
  console.log(n.padEnd(14), '@60 first', String(r.dmg1).padStart(5), 'total', String(r.dmg).padStart(6), 'kb', r.kvx, r.kvy, 'f', r.hitFrame, '| @140', out[n][140].dmg1, '/', out[n][140].dmg, r.self ? '| self ' + r.self : ''); }
console.log(`\n${names.length} fighters, ${zero} landed nothing at either distance`);
