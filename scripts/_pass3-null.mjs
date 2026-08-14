// NULL MODEL for the balance tournament.
//
// The runner's headline number is win-rate over a single-elim bracket of FFA heats. Wins and
// games are COUPLED there (winning a heat means you advance and play again), so the sampling
// noise in that statistic is not a plain binomial and has to be simulated, not derived.
//
// This replays the EXACT bracket structure with 59 perfectly equal fighters — every heat winner
// picked uniformly at random — and reports the distribution of the resulting spread. Any measured
// std-dev inside this distribution is indistinguishable from a perfectly balanced roster, and
// "fixing" a fighter on that evidence is fitting noise.
//
//   node scripts/_pass3-null.mjs [nTournaments] [nTrials]
const N_T = parseInt(process.argv[2] || '24', 10);
const TRIALS = parseInt(process.argv[3] || '400', 10);
const ROSTER_N = 59, HEAT = 5;

function partitionHeats(field, maxSize) {
  const heats = [];
  for (let i = 0; i < field.length; i += maxSize) heats.push(field.slice(i, i + maxSize));
  const last = heats[heats.length - 1];
  if (heats.length > 1 && last.length === 1) heats[heats.length - 2].length--, last.unshift(field[field.length - 2]);
  return heats;
}
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; }

const sds = [], maxes = [], mins = [], zeros = [];
for (let trial = 0; trial < TRIALS; trial++) {
  const wins = new Array(ROSTER_N).fill(0), games = new Array(ROSTER_N).fill(0);
  for (let t = 0; t < N_T; t++) {
    let field = shuffle([...Array(ROSTER_N).keys()]);
    while (field.length > 1) {
      const winners = [];
      for (const heat of partitionHeats(field, HEAT)) {
        for (const f of heat) games[f]++;
        const w = heat[(Math.random() * heat.length) | 0];   // all fighters equal
        wins[w]++; winners.push(w);
      }
      field = winners;
    }
  }
  const wr = wins.map((w, i) => games[i] ? 100 * w / games[i] : 0);
  const mean = wr.reduce((a, b) => a + b, 0) / wr.length;
  sds.push(Math.sqrt(wr.reduce((a, b) => a + (b - mean) ** 2, 0) / wr.length));
  maxes.push(Math.max(...wr)); mins.push(Math.min(...wr));
  zeros.push(wr.filter(x => x === 0).length);
}
const pct = (arr, p) => { const s = [...arr].sort((a, b) => a - b); return s[Math.floor(p * (s.length - 1))]; };
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
console.log(`NULL MODEL — ${ROSTER_N} IDENTICAL fighters, ${N_T} tournaments, ${TRIALS} trials`);
console.log(`  std-dev   mean ${mean(sds).toFixed(2)}   p5 ${pct(sds, .05).toFixed(2)}   p50 ${pct(sds, .5).toFixed(2)}   p95 ${pct(sds, .95).toFixed(2)}`);
console.log(`  max win%  mean ${mean(maxes).toFixed(1)}   p50 ${pct(maxes, .5).toFixed(1)}   p95 ${pct(maxes, .95).toFixed(1)}`);
console.log(`  min win%  mean ${mean(mins).toFixed(1)}   p50 ${pct(mins, .5).toFixed(1)}   p95 ${pct(mins, .95).toFixed(1)}`);
console.log(`  #at 0%    mean ${mean(zeros).toFixed(2)}   p95 ${pct(zeros, .95)}`);
