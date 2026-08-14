// Merge several balance-tournament ranking JSONs (different --seed chunks) into one ranking,
// so a long measurement can be split across parallel runs without losing sample size.
//   node scripts/_pass3-merge.mjs out.json chunkA.json chunkB.json [...]
import { readFileSync, writeFileSync } from 'node:fs';

const [outPath, ...inPaths] = process.argv.slice(2);
if (!outPath || inPaths.length < 1) {
  console.error('usage: node scripts/_pass3-merge.mjs <out.json> <chunk.json> [chunk.json ...]');
  process.exit(1);
}

const agg = new Map();
let tournaments = 0, wallMs = 0;
const champions = [];
for (const p of inPaths) {
  const j = JSON.parse(readFileSync(p, 'utf8'));
  tournaments += j.tournaments || 0;
  wallMs += j.wallMs || 0;
  champions.push(...(j.champions || []));
  for (const r of j.ranking) {
    const a = agg.get(r.name) || { name: r.name, games: 0, wins: 0, kos: 0, falls: 0, dmgDealt: 0, sumPlace: 0 };
    a.games += r.games; a.wins += r.wins; a.kos += r.kos;
    a.falls += r.falls; a.dmgDealt += r.dmgDealt; a.sumPlace += r.sumPlace;
    agg.set(r.name, a);
  }
}
const ranking = [...agg.values()].map(a => ({
  ...a,
  winRate: a.games ? a.wins / a.games : 0,
  avgPlace: a.games ? a.sumPlace / a.games : 0,
  kosPerGame: a.games ? a.kos / a.games : 0,
})).sort((x, y) => y.winRate - x.winRate || y.kosPerGame - x.kosPerGame || x.avgPlace - y.avgPlace);

writeFileSync(outPath, JSON.stringify({ tournaments, merged: inPaths, wallMs, champions, ranking }, null, 2));
const games = ranking.map(r => r.games);
console.log(`merged ${inPaths.length} chunk(s) -> ${outPath}`);
console.log(`  ${tournaments} tournaments, ${ranking.length} fighters, games/fighter min ${Math.min(...games)} max ${Math.max(...games)}`);
