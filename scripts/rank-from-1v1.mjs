// ============================================================================
//  rank-from-1v1.mjs -- turn a 1v1 round robin into the ranking file bake-ratings.mjs reads
// ============================================================================
// The World Cup decides every match nobody plays from FIGHTER_WINRATE. That table was baked from the 48-team bracket measurement (balance-
// tournament.mjs), which covers ~59 fighters: about 43 more (every Inanimate Insanity fighter, Bow, Soap, Fan, MeTag, Magnet...) fall back to the
// mean. balance-1v1.mjs measures EVERY playable fighter (the prize fighters are not in ROSTER at boot, so they are out), but its numbers are a
// different thing: a 1v1 win rate averages 50% with a spread of its own, where the bracket's heat-winner rate averages 20%.
//
// What the World Cup was TUNED on is the SCALE of the baked table (RATING_SPREAD, the upset band in test/tournament-rating.test.js: mean 0.202, sd
// 0.107). So this script keeps the measured ORDER and relative gaps and stands them on that scale:
//   1. shrink each fighter toward the roster mean by how noisy their own number is (empirical Bayes: a fighter with 60 games moves more than
//      one with 100), so a lucky streak does not become a rating;
//   2. standardise (z-score) and map onto the previous bake's mean and sd (read from --like, the file that table was baked from);
//   3. write the old ranking schema, winRate in 0..1 (the raw 1v1 rate and its standard error ride along as winRate1v1 / se1v1).
// bake-ratings.mjs then bakes that file unchanged, and test/baked-ratings.test.js keeps holding (the table agrees with the file it names).
//
//   node scripts/rank-from-1v1.mjs scripts/balance-1v1-<date>.json --out scripts/balance-ranking-<date>-1v1.json
//   node scripts/bake-ratings.mjs scripts/balance-ranking-<date>-1v1.json
//
// It refuses a run that is missing any playable fighter, and says which have fewer than 20 games (a rating on fewer is mostly noise).
import { readFileSync, writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const flag = (name, d) => { const i = argv.indexOf('--' + name); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const src = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
if (!src) { console.error('usage: node scripts/rank-from-1v1.mjs <balance-1v1.json> --out <ranking.json> [--like scripts/balance-ranking-2026-09-15-final.json]'); process.exit(1); }
const out = flag('out', src.replace(/\.json$/, '') + '-ranking.json');
const likeFile = flag('like', 'scripts/balance-ranking-2026-09-15-final.json');

const rep = JSON.parse(readFileSync(src, 'utf8'));
const rows = (rep.rows || []).filter((r) => r.games > 0);
if (!rows.length) { console.error(`${src} has no rows with games`); process.exit(1); }

// every playable fighter must be in it (the same roster balance-1v1.mjs measures)
const { loadMonolith } = await import('../test/helpers/load-monolith.js');
const { window: w } = loadMonolith(1);
let roster;
try { roster = w.eval('ROSTER.filter(function(r){ return r.play && !r.prize; }).map(function(r){ return r.name; })'); } finally { try { w.close && w.close(); } catch {} }
const have = new Set(rows.map((r) => r.name));
const missing = roster.filter((n) => !have.has(n));
if (missing.length) { console.error(`${src} is missing ${missing.length} playable fighter(s): ${missing.join(', ')}`); process.exit(1); }
const thin = rows.filter((r) => r.games < 20).map((r) => `${r.name} (${r.games})`);

const like = JSON.parse(readFileSync(likeFile, 'utf8')).ranking.map((r) => r.winRate);
const tMean = like.reduce((a, b) => a + b, 0) / like.length;
const tSd = Math.sqrt(like.reduce((a, b) => a + (b - tMean) ** 2, 0) / like.length);

// 1. shrink (percent points)
const mean = rows.reduce((a, r) => a + r.winRate, 0) / rows.length;
const obsVar = rows.reduce((a, r) => a + (r.winRate - mean) ** 2, 0) / rows.length;
const noiseVar = rows.reduce((a, r) => a + r.se ** 2, 0) / rows.length;
const tau2 = Math.max(obsVar - noiseVar, 1);   // the real spread between fighters (never zero)
const shrunk = rows.map((r) => mean + (r.winRate - mean) * tau2 / (tau2 + r.se ** 2));
// 2. standardise onto the previous bake's scale
const sMean = shrunk.reduce((a, b) => a + b, 0) / shrunk.length;
const sSd = Math.sqrt(shrunk.reduce((a, b) => a + (b - sMean) ** 2, 0) / shrunk.length) || 1;
const ranking = rows.map((r, i) => {
  const z = (shrunk[i] - sMean) / sSd;
  const wr = Math.max(0, Math.min(1, tMean + tSd * z));
  return { name: r.name, games: r.games, wins: Math.round(r.winRate * r.games / 100), winRate: wr, winRate1v1: r.winRate / 100, se1v1: r.se / 100,
    kosPerGame: r.kosPerGame, fallsPerGame: r.fallsPerGame };
}).sort((a, b) => b.winRate - a.winRate || a.name.localeCompare(b.name));
ranking.forEach((r, i) => { r.rank = i + 1; });

writeFileSync(out, JSON.stringify({
  method: '1v1-round-robin', tournaments: rep.matches, baseSeed: rep.args && rep.args.seed, heatSize: 2, stocks: rep.args && rep.args.stocks, aiLevel: 2,
  scaledTo: { like: likeFile, mean: +tMean.toFixed(4), sd: +tSd.toFixed(4) }, shrink: { tau: +Math.sqrt(tau2).toFixed(2), noise: +Math.sqrt(noiseVar).toFixed(2) },
  from: src, ranking }, null, 1));
console.log(`${ranking.length} fighters from ${rep.matches} 1v1 matches -> ${out}`);
console.log(`  scaled to mean ${tMean.toFixed(3)} sd ${tSd.toFixed(3)} (from ${likeFile}); raw 1v1 spread sd ${Math.sqrt(obsVar).toFixed(1)} points vs noise ${Math.sqrt(noiseVar).toFixed(1)}`);
console.log(`  best  ${ranking[0].name} ${ranking[0].winRate.toFixed(3)} (raw ${(100 * ranking[0].winRate1v1).toFixed(1)}%)`);
console.log(`  worst ${ranking[ranking.length - 1].name} ${ranking[ranking.length - 1].winRate.toFixed(3)} (raw ${(100 * ranking[ranking.length - 1].winRate1v1).toFixed(1)}%)`);
if (thin.length) console.log(`  WARNING fewer than 20 games: ${thin.join(', ')}`);
process.exit(0);
