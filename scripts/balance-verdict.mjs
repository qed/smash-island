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

// Three runs a side before a verdict may be anything but "add runs": a bootstrap over two items is
// dice, and 2026-09-14's pairs stayed out of SIGNIFICANT in both directions only by luck (O20).
const MIN_RUNS = 3;
// Fighters the player has this many games with are measured by the player; the bracket number for
// them is the bot's, not the fighter's (the owner: 81% on Puffball over 100+ where the bot sits at 11%).
const PLAYER_MEASURED = 30;
// The measured floors (O16, three slates, 2026-09-14; balance-noise before it), printed with every
// verdict so a swing inside them is never read as a signal.
const FLOOR_NOTE = 'floors: a 1% nudge moved a 24-match A/B spread by up to 24% and pace by 12% (O16); per-fighter win rate swings 7.5pp median / 20pp p90 between identical builds (balance-noise)';

const argv0 = process.argv.slice(2);
const pi = argv0.indexOf('--player');
const playerFile = pi >= 0 ? argv0[pi + 1] : null;
const argv = pi < 0 ? argv0 : argv0.filter((a, i) => i !== pi && i !== pi + 1);   // with no --player, pi is -1 and pi+1 is 0: the filter used to drop the first token
const cut = argv.indexOf('--after');
const beforeFiles = argv.slice(argv.indexOf('--before') + 1, cut === -1 ? undefined : cut);
const afterFiles = cut === -1 ? [] : argv.slice(cut + 1);
if (!beforeFiles.length || !afterFiles.length) {
  console.error('usage: node scripts/balance-verdict.mjs --before a.json ... --after b.json ... [--player mystats.txt]');
  process.exit(1);
}
// The player's record: the text MY STATS copies (its "json: {...}" line), or a plain json object.
function loadPlayer(f) {
  const txt = readFileSync(f, 'utf8');
  const line = txt.split(/\r?\n/).find((l) => l.startsWith('json: '));
  const obj = JSON.parse(line ? line.slice(6) : txt);
  return Object.entries(obj).map(([name, r]) => ({ name, games: r.games | 0, wins: r.wins | 0 }));
}
const player = playerFile ? loadPlayer(playerFile) : null;

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
// pooled per-fighter rates on the after side, for the player table
const afterRate = (() => { const agg = {}; for (const r of A) for (const row of r) { const a = agg[row.name] || (agg[row.name] = { w: 0, g: 0 }); a.w += row.wins; a.g += row.games; } return agg; })();
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
const read = q(0.975) < 0 ? 'SIGNIFICANT improvement'
  : q(0.025) > 0 ? 'SIGNIFICANT regression — revert the pass'
    : pTighter > 0.95 ? 'likely improvement (~95%)' : 'not conclusive — add runs';
const thin = B.length < MIN_RUNS || A.length < MIN_RUNS;
console.log(`\n  VERDICT: ${thin ? `not conclusive — ${B.length}/${A.length} runs a side, ${MIN_RUNS} needed (the ${MIN_RUNS}-run rule; it would have read "${read}")` : read}`);
console.log(`  ${FLOOR_NOTE}`);
if (player) {
  console.log(`\n  the player's own record (${playerFile}) beside the bot's pooled after-rate:`);
  console.log('    fighter        you            bot     ');
  for (const p of player.sort((x, y) => y.games - x.games)) {
    const a = afterRate[p.name];
    const you = p.games ? `${p.wins}/${p.games} ${P(p.wins / p.games).padStart(5)}%` : '-';
    const bot = a && a.g ? `${P(a.w / a.g).padStart(5)}%` : '   - ';
    console.log(`    ${p.name.padEnd(14)} ${you.padEnd(14)} ${bot}${p.games >= PLAYER_MEASURED ? '   measured by the player: read this, not the bracket' : ''}`);
  }
}
console.log(`\n  sanity: KOs/game ${sb.kos.toFixed(2)} -> ${sa.kos.toFixed(2)} ` +
  `(a large drop means the roster got blunter, not fairer)`);
