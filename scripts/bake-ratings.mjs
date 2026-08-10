// ============================================================================
//  bake-ratings.mjs — write measured win rates into the monolith's rating table
// ============================================================================
// The World Cup's fighter ratings come from REAL measured win rates, produced by
// balance-tournament.mjs. This script bakes a ranking JSON into the FIGHTER_WINRATE block in
// artifacts/V1/index.html, between the BAKED-RATINGS markers, so the table is never hand-typed
// and always traceable to a specific measurement run.
//
//   node scripts/balance-tournament.mjs full --tournaments 24 --out scripts/ranking.json
//   node scripts/bake-ratings.mjs scripts/ranking.json
//
// WHY NOT RANGE_PROFILE: it is a compensation table — high stats mark historically WEAK fighters,
// so rating from it ranks the roster backwards. See the comment above FIGHTER_WINRATE.

import { readFileSync, writeFileSync } from 'node:fs';

const MONOLITH = 'artifacts/V1/index.html';
const START = '/* BAKED-RATINGS-START */';
const END = '/* BAKED-RATINGS-END */';

const src = process.argv[2];
if (!src) {
  console.error('usage: node scripts/bake-ratings.mjs <ranking.json>');
  process.exit(1);
}

const data = JSON.parse(readFileSync(src, 'utf8'));
const ranking = data.ranking || [];
if (!ranking.length) {
  console.error(`${src} has no ranking array`);
  process.exit(1);
}

// Round to 3dp: enough to preserve every ordering the measurement actually resolves, while keeping
// the baked block readable and its diffs meaningful between passes.
const rows = ranking
  .map(r => [r.name, Math.round(r.winRate * 1000) / 1000])
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

const mean = Math.round((rows.reduce((s, r) => s + r[1], 0) / rows.length) * 1000) / 1000;

const body = [
  `// Measured over ${data.tournaments} tournaments / ${ranking.reduce((s, r) => s + r.games, 0)} real matches`,
  `// (seed ${data.baseSeed}, ${data.stocks} stocks, AI level ${data.aiLevel}). Source: ${src}`,
  `// Regenerate with: node scripts/bake-ratings.mjs ${src}`,
  'const FIGHTER_WINRATE = {',
  ...rows.map(([name, wr]) => `  ${JSON.stringify(name)}: ${wr.toFixed(3)},`),
  '};',
  `const FIGHTER_WINRATE_MEAN = ${mean.toFixed(3)};`,
].join('\n  ');

const html = readFileSync(MONOLITH, 'utf8');
const i = html.indexOf(START), j = html.indexOf(END);
if (i < 0 || j < 0) {
  console.error(`markers ${START} / ${END} not found in ${MONOLITH}`);
  process.exit(1);
}
const out = html.slice(0, i + START.length) + '\n  ' + body + '\n  ' + html.slice(j);
writeFileSync(MONOLITH, out);

console.log(`baked ${rows.length} ratings into ${MONOLITH}`);
console.log(`  mean win rate ${mean.toFixed(3)}`);
console.log(`  best  ${rows[0][0]} ${rows[0][1]}`);
console.log(`  worst ${rows[rows.length - 1][0]} ${rows[rows.length - 1][1]}`);
