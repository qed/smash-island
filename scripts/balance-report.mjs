// ============================================================================
//  balance-report.mjs — compare balance measurements across passes
// ============================================================================
//   node scripts/balance-report.mjs scripts/balance-auto-0.json scripts/balance-auto-1.json ...
//
// Prints the health of the roster at each measurement and the trajectory between them, so a pass
// can be judged on whether it MOVED THE ROSTER rather than on whether the diff looked sensible.
//
// The headline number is the standard deviation of win rate. It is the one metric that captures
// "is this roster balanced" in a single figure: a perfectly balanced roster of N fighters in FFA
// heats has everyone near 1/heatSize, so sigma -> 0. Everything else here is a sanity check that
// sigma is not being lowered in a bad way (e.g. by making everyone equally useless).

import { readFileSync } from 'node:fs';

const files = process.argv.slice(2);
if (!files.length) { console.error('usage: node scripts/balance-report.mjs <ranking.json>...'); process.exit(1); }

const stats = (file) => {
  const d = JSON.parse(readFileSync(file, 'utf8'));
  const r = d.ranking;
  const wr = r.map(x => x.winRate);
  const mean = wr.reduce((a, b) => a + b, 0) / wr.length;
  const sd = Math.sqrt(wr.reduce((a, b) => a + (b - mean) ** 2, 0) / wr.length);
  const sorted = [...r].sort((a, b) => b.winRate - a.winRate);
  const kos = r.map(x => x.kosPerGame);
  return {
    file, n: r.length, mean, sd,
    top: sorted[0], bottom: sorted[sorted.length - 1],
    top5: sorted.slice(0, 5),
    bottom5: sorted.slice(-5).reverse(),
    winless: r.filter(x => x.wins === 0).length,
    over35: r.filter(x => x.winRate > 0.35).length,
    under08: r.filter(x => x.winRate < 0.08).length,
    // the range that actually matters to a player: how far apart are the best and worst?
    spread: sorted[0].winRate - sorted[sorted.length - 1].winRate,
    champions: new Set(d.champions || []).size,
    koMean: kos.reduce((a, b) => a + b, 0) / kos.length,
    ranking: r,
  };
};

const rows = files.map(stats);

console.log('run                                sigma   spread   mean    best              worst             winless  >35%  <8%  champs');
for (const s of rows) {
  console.log(
    `${s.file.replace('scripts/', '').padEnd(32)} ${s.sd.toFixed(4)}  ${(s.spread * 100).toFixed(1).padStart(5)}%  ${(s.mean * 100).toFixed(1)}%  ` +
    `${(s.top.name + ' ' + (s.top.winRate * 100).toFixed(1)).padEnd(17)} ${(s.bottom.name + ' ' + (s.bottom.winRate * 100).toFixed(1)).padEnd(17)} ` +
    `${String(s.winless).padStart(7)} ${String(s.over35).padStart(5)} ${String(s.under08).padStart(4)} ${String(s.champions).padStart(7)}`
  );
}

if (rows.length > 1) {
  const a = rows[0], b = rows[rows.length - 1];
  const pct = (x) => (x * 100).toFixed(1);
  console.log(`\n--- overall: ${a.file} -> ${b.file} ---`);
  console.log(`  sigma   ${a.sd.toFixed(4)} -> ${b.sd.toFixed(4)}   (${b.sd < a.sd ? 'TIGHTER' : 'WIDER'}, ${(((b.sd - a.sd) / a.sd) * 100).toFixed(1)}%)`);
  console.log(`  spread  ${pct(a.spread)}% -> ${pct(b.spread)}%`);
  console.log(`  best    ${a.top.name} ${pct(a.top.winRate)}% -> ${b.top.name} ${pct(b.top.winRate)}%`);
  console.log(`  worst   ${a.bottom.name} ${pct(a.bottom.winRate)}% -> ${b.bottom.name} ${pct(b.bottom.winRate)}%`);
  console.log(`  winless ${a.winless} -> ${b.winless}`);
  console.log(`  KOs/game (roster mean) ${a.koMean.toFixed(2)} -> ${b.koMean.toFixed(2)}   ` +
    `(a big drop would mean the roster got blunter, not fairer)`);

  // Biggest individual movers, so a pass that fixed sigma by wrecking one fighter is visible.
  const first = Object.fromEntries(a.ranking.map(r => [r.name, r.winRate]));
  const movers = b.ranking
    .filter(r => first[r.name] !== undefined)
    .map(r => ({ name: r.name, from: first[r.name], to: r.winRate, d: r.winRate - first[r.name] }))
    .sort((x, y) => y.d - x.d);
  console.log('\n  biggest risers :', movers.slice(0, 5).map(m => `${m.name} ${pct(m.from)}->${pct(m.to)}`).join(', '));
  console.log('  biggest fallers:', movers.slice(-5).reverse().map(m => `${m.name} ${pct(m.from)}->${pct(m.to)}`).join(', '));
}
