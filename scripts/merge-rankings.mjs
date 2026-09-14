// ============================================================================
//  merge-rankings.mjs — pool several balance-tournament runs into one ranking JSON
// ============================================================================
//   node scripts/merge-rankings.mjs --out merged.json run1.json run2.json ...
//
// bake-ratings.mjs reads ONE ranking file. A single 8-tournament run is eight matches per fighter,
// which is thin for a table the World Cup seeds from; pooling the runs made on the same build gives
// the bake a real sample without pretending one run was it. Wins, games, KOs and falls add; win
// rate and KOs a game are recomputed from the sums; the rank is by pooled win rate. The header
// fields bake-ratings prints (tournaments, seed, stocks, AI level) are carried through, the seed as
// the list of seeds pooled.
import { readFileSync, writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const oi = argv.indexOf('--out');
const out = oi >= 0 ? argv[oi + 1] : null;
const files = argv.filter((a, i) => a !== '--out' && i !== oi + 1);
if (!out || !files.length) {
  console.error('usage: node scripts/merge-rankings.mjs --out merged.json run1.json run2.json ...');
  process.exit(1);
}
const runs = files.map((f) => JSON.parse(readFileSync(f, 'utf8')));
const by = {};
for (const r of runs) {
  for (const x of r.ranking || []) {
    const a = by[x.name] || (by[x.name] = { name: x.name, games: 0, wins: 0, kos: 0, falls: 0, dmgDealt: 0, sumPlace: 0 });
    a.games += x.games || 0; a.wins += x.wins || 0; a.kos += x.kos || 0; a.falls += x.falls || 0;
    a.dmgDealt += x.dmgDealt || 0; a.sumPlace += x.sumPlace || 0;
  }
}
const ranking = Object.values(by).map((a) => ({
  ...a,
  winRate: a.games ? a.wins / a.games : 0,
  avgPlace: a.games ? a.sumPlace / a.games : 0,
  kosPerGame: a.games ? a.kos / a.games : 0,
})).sort((a, b) => b.winRate - a.winRate || b.kosPerGame - a.kosPerGame || a.name.localeCompare(b.name));
ranking.forEach((r, i) => { r.rank = i + 1; });
const first = runs[0];
const merged = {
  tournaments: runs.reduce((s, r) => s + (r.tournaments || 0), 0),
  baseSeed: runs.map((r) => r.baseSeed).join('+'),
  heatSize: first.heatSize, stocks: first.stocks, aiLevel: first.aiLevel,
  wallMs: runs.reduce((s, r) => s + (r.wallMs || 0), 0),
  champions: runs.flatMap((r) => r.champions || []),
  pooledFrom: files,
  ranking,
};
writeFileSync(out, JSON.stringify(merged, null, 2));
console.log(`pooled ${files.length} run(s), ${merged.tournaments} tournaments, ${ranking.reduce((s, r) => s + r.games, 0)} fighter-games -> ${out}`);
console.log('top 5: ' + ranking.slice(0, 5).map((r) => `${r.name} ${(100 * r.winRate).toFixed(1)}%`).join(', '));
