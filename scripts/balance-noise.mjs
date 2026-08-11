// ============================================================================
//  balance-noise.mjs — how much of a measured change is real?
// ============================================================================
//   node scripts/balance-noise.mjs <same-build-run-a.json> <same-build-run-b.json> ...
//
// Give it two or more measurements OF THE SAME BUILD (different seeds). It reports how far a
// fighter's win rate moves when NOTHING changed, which is the noise floor every balance decision
// has to clear.
//
// This exists because balance pass 4 "moved" Woody from 11% to 46% and Fanny from 39% to 8% off a
// one-point damage step, which is not a thing a one-point damage step can do. Two causes compound
// here and both inflate variance far beyond a simple binomial:
//
//   1. Each fighter plays only ~25-45 games per run. At p≈0.2 the binomial standard error alone is
//      already about 7 percentage points.
//   2. The runner is an ELIMINATION bracket — heat winners advance and play again. So an early
//      lucky win buys more games AND more chances to win, and an early loss ends the run. Wins
//      compound, which is positive feedback on top of the binomial noise.
//
// The output is the number that matters: any per-fighter adjustment threshold BELOW this floor is
// chasing dice, not balancing.

import { readFileSync } from 'node:fs';

const files = process.argv.slice(2);
if (files.length < 2) { console.error('usage: node scripts/balance-noise.mjs <a.json> <b.json> [...]'); process.exit(1); }

const runs = files.map(f => {
  const d = JSON.parse(readFileSync(f, 'utf8'));
  return { file: f, by: Object.fromEntries(d.ranking.map(r => [r.name, r])) };
});

const names = Object.keys(runs[0].by).filter(n => runs.every(r => r.by[n]));

const rows = names.map(n => {
  const wrs = runs.map(r => r.by[n].winRate);
  const games = runs.map(r => r.by[n].games);
  const mean = wrs.reduce((a, b) => a + b, 0) / wrs.length;
  const sd = Math.sqrt(wrs.reduce((a, b) => a + (b - mean) ** 2, 0) / wrs.length);
  return { n, wrs, mean, sd, range: Math.max(...wrs) - Math.min(...wrs), games: games.reduce((a, b) => a + b, 0) / games.length };
});

rows.sort((a, b) => b.range - a.range);

console.log(`Same build, ${runs.length} runs, ${names.length} fighters. Per-fighter win-rate movement with NOTHING changed:\n`);
console.log('fighter          games   ' + runs.map((_, i) => `run${i + 1}`).join('    ') + '    range');
for (const r of rows.slice(0, 12)) {
  console.log(`  ${r.n.padEnd(14)} ${r.games.toFixed(0).padStart(4)}   ` +
    r.wrs.map(w => (w * 100).toFixed(1).padStart(5)).join('   ') + `   ${(r.range * 100).toFixed(1).padStart(5)}pp`);
}

const ranges = rows.map(r => r.range).sort((a, b) => a - b);
const q = (f) => ranges[Math.floor(ranges.length * f)];
const meanRange = ranges.reduce((a, b) => a + b, 0) / ranges.length;
const meanSd = rows.reduce((a, b) => a + b.sd, 0) / rows.length;

console.log('\n--- NOISE FLOOR ---');
console.log(`  median run-to-run swing : ${(q(0.5) * 100).toFixed(1)}pp`);
console.log(`  mean   run-to-run swing : ${(meanRange * 100).toFixed(1)}pp`);
console.log(`  90th percentile swing   : ${(q(0.9) * 100).toFixed(1)}pp`);
console.log(`  worst                   : ${(ranges[ranges.length - 1] * 100).toFixed(1)}pp`);
console.log(`  mean per-fighter sigma  : ${(meanSd * 100).toFixed(1)}pp`);
console.log(`\n  => a per-fighter deviation smaller than ~${(q(0.9) * 100).toFixed(0)}pp is INDISTINGUISHABLE from noise`);
console.log(`     in a single run. Balancing on one run cannot resolve anything finer than that.`);

// How many runs would be needed to halve the uncertainty? sigma scales as 1/sqrt(k).
console.log(`\n  averaging k runs divides the noise by sqrt(k):`);
for (const k of [1, 2, 3, 5, 8]) {
  console.log(`     k=${k}  effective sigma ~ ${((meanSd / Math.sqrt(k)) * 100).toFixed(1)}pp`);
}
