// ============================================================================
//  balance-verdict.mjs — did a balance pass actually work?
// ============================================================================
//   node scripts/balance-verdict.mjs --before a1.json a2.json ... --after b1.json b2.json ...
//
// Give it several runs of the build BEFORE a pass and several of the build AFTER it. It answers
// the only question that matters — is the roster measurably tighter — with a confidence interval
// rather than a vibe.
//
// WHY IT POOLS FIRST, AND WHY IT BOOTSTRAPS OVER RUNS
//
// The obvious test is a t-test on per-run sigma. It is the wrong test here, and it will tell you a
// pass did nothing when it plainly did. Per-run sigma measures sqrt(true_sigma^2 + noise^2), and in
// this game the noise term DOMINATES: a per-run sigma near 0.100 against a pooled 0.075 implies a
// noise contribution around 0.066. Comparing per-run sigmas therefore buries the signal in exactly
// the variance that pooling exists to remove. Measured on pass 5: t = -1.70 ("no effect") while the
// pooled comparison showed a 29.6% tightening with 98.4% confidence.
//
// So: pool each side to the same depth, then bootstrap over WHICH RUNS enter each pool. The run is
// the independent replicate — resampling fighters instead would treat one run's luck as evidence.

import { readFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const cut = argv.indexOf('--after');
const beforeFiles = argv.slice(argv.indexOf('--before') + 1, cut === -1 ? undefined : cut);
const afterFiles = cut === -1 ? [] : argv.slice(cut + 1);
if (!beforeFiles.length || !afterFiles.length) {
  console.error('usage: node scripts/balance-verdict.mjs --before a.json ... --after b.json ...');
  process.exit(1);
}

const load = (f) => JSON.parse(readFileSync(f, 'utf8')).ranking;
const B = beforeFiles.map(load), A = afterFiles.map(load);

function poolStats(runs) {
  const agg = {};
  for (const r of runs) for (const row of r) {
    const a = agg[row.name] || (agg[row.name] = { w: 0, g: 0, k: 0 });
    a.w += row.wins; a.g += row.games; a.k += row.kos;
  }
  const rows = Object.entries(agg).map(([name, a]) => ({
    name, winRate: a.g ? a.w / a.g : 0, kos: a.g ? a.k / a.g : 0,
  }));
  const w = rows.map(r => r.winRate);
  const m = w.reduce((x, y) => x + y, 0) / w.length;
  const sorted = [...rows].sort((x, y) => y.winRate - x.winRate);
  return {
    sigma: Math.sqrt(w.reduce((x, y) => x + (y - m) ** 2, 0) / w.length),
    top: sorted[0], bottom: sorted[sorted.length - 1],
    spread: sorted[0].winRate - sorted[sorted.length - 1].winRate,
    under08: rows.filter(r => r.winRate < 0.08).length,
    over35: rows.filter(r => r.winRate > 0.35).length,
    kos: rows.reduce((x, y) => x + y.kos, 0) / rows.length,
  };
}

// Deterministic PRNG so a verdict is reproducible and cannot be re-rolled until it is favourable.
let seed = 12345;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const resample = (arr) => Array.from({ length: arr.length }, () => arr[Math.floor(rnd() * arr.length)]);

const sb = poolStats(B), sa = poolStats(A);
const N = 4000;
const diffs = [];
for (let i = 0; i < N; i++) diffs.push(poolStats(resample(A)).sigma - poolStats(resample(B)).sigma);
diffs.sort((x, y) => x - y);
const q = (f) => diffs[Math.floor(diffs.length * f)];
const pTighter = diffs.filter(d => d < 0).length / diffs.length;
const P = (x) => (x * 100).toFixed(1);

console.log(`before: ${B.length} run(s)   after: ${A.length} run(s)`);
console.log('           sigma   spread   best              worst             >35%  <8%  KOs/g');
for (const [n, s] of [['before', sb], ['after ', sa]]) {
  console.log(`  ${n}  ${s.sigma.toFixed(4)}  ${P(s.spread).padStart(5)}%  ` +
    `${(s.top.name + ' ' + P(s.top.winRate)).padEnd(17)} ${(s.bottom.name + ' ' + P(s.bottom.winRate)).padEnd(17)} ` +
    `${String(s.over35).padStart(4)} ${String(s.under08).padStart(4)}  ${s.kos.toFixed(2)}`);
}
const obs = sa.sigma - sb.sigma;
console.log(`\n  sigma change      ${obs.toFixed(4)}  (${((obs / sb.sigma) * 100).toFixed(1)}%)`);
console.log(`  bootstrap 95% CI  [${q(0.025).toFixed(4)}, ${q(0.975).toFixed(4)}]   (${N} resamples over runs)`);
console.log(`  P(tighter)        ${P(pTighter)}%`);
console.log(`\n  VERDICT: ${q(0.975) < 0 ? 'SIGNIFICANT improvement'
  : q(0.025) > 0 ? 'SIGNIFICANT regression — revert the pass'
    : pTighter > 0.95 ? 'likely improvement (~95%)' : 'not conclusive — add runs'}`);
console.log(`\n  sanity: KOs/game ${sb.kos.toFixed(2)} -> ${sa.kos.toFixed(2)} ` +
  `(a large drop means the roster got blunter, not fairer)`);
