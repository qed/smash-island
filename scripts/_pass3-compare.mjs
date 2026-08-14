// Pass-3 reporting: spread stats for one ranking, or a before/after diff of two.
//   node scripts/_pass3-compare.mjs <before.json> [after.json]
import { readFileSync } from 'node:fs';

function load(p) {
  const j = JSON.parse(readFileSync(p, 'utf8'));
  const m = new Map();
  for (const r of j.ranking) m.set(r.name, r);
  return m;
}
function stats(m) {
  const w = [...m.values()].map(r => r.winRate * 100);
  const mean = w.reduce((a, b) => a + b, 0) / w.length;
  const sd = Math.sqrt(w.reduce((a, b) => a + (b - mean) ** 2, 0) / w.length);
  const sorted = [...m.values()].sort((a, b) => b.winRate - a.winRate);
  return {
    n: w.length, mean, sd,
    max: sorted[0], min: sorted[sorted.length - 1],
    zeros: [...m.values()].filter(r => r.winRate === 0).map(r => r.name),
    over45: sorted.filter(r => r.winRate * 100 > 45).map(r => `${r.name} ${(r.winRate * 100).toFixed(1)}%`),
    sorted,
  };
}
const [beforeP, afterP] = process.argv.slice(2);
const B = load(beforeP);
const sB = stats(B);

if (!afterP) {
  console.log(`== ${beforeP} ==  n=${sB.n}  mean ${sB.mean.toFixed(1)}%  STD-DEV ${sB.sd.toFixed(2)}`);
  console.log(`max ${sB.max.name} ${(sB.max.winRate * 100).toFixed(1)}%   min ${sB.min.name} ${(sB.min.winRate * 100).toFixed(1)}%   zeros(${sB.zeros.length}): ${sB.zeros.join(', ') || 'none'}`);
  console.log(`>45%: ${sB.over45.join(', ') || 'none'}`);
  console.log('\nTOP 12:');
  sB.sorted.slice(0, 12).forEach((r, i) => console.log(`  ${String(i + 1).padStart(2)}. ${r.name.padEnd(14)} ${(r.winRate * 100).toFixed(1).padStart(5)}%  ${r.wins}/${r.games}  kos/g ${r.kosPerGame.toFixed(2)}`));
  console.log('BOTTOM 14:');
  sB.sorted.slice(-14).forEach((r, i) => console.log(`  ${String(sB.n - 14 + i + 1).padStart(2)}. ${r.name.padEnd(14)} ${(r.winRate * 100).toFixed(1).padStart(5)}%  ${r.wins}/${r.games}  kos/g ${r.kosPerGame.toFixed(2)}`));
  process.exit(0);
}

const A = load(afterP);
const sA = stats(A);
console.log('name              before   after    delta   kos/g b->a');
console.log('---------------------------------------------------------');
const rows = [...A.values()].sort((a, b) => b.winRate - a.winRate);
for (const r of rows) {
  const b = B.get(r.name);
  const bw = b ? b.winRate * 100 : NaN, aw = r.winRate * 100;
  const d = aw - bw;
  const mark = Math.abs(d) >= 15 ? (d > 0 ? ' <<' : ' >>') : '';
  console.log(`${r.name.padEnd(16)} ${bw.toFixed(1).padStart(5)}%  ${aw.toFixed(1).padStart(5)}%  ${(d >= 0 ? '+' : '') + d.toFixed(1).padStart(5)}   ${b.kosPerGame.toFixed(2)}->${r.kosPerGame.toFixed(2)}${mark}`);
}
const line = (t, s) => `${t}: std-dev ${s.sd.toFixed(2)}  mean ${s.mean.toFixed(1)}%  max ${s.max.name} ${(s.max.winRate * 100).toFixed(1)}%  min ${(s.min.winRate * 100).toFixed(1)}%  zeros ${s.zeros.length}`;
console.log('\n' + line('BEFORE', sB));
console.log(line('AFTER ', sA));
console.log(`\nAFTER zeros: ${sA.zeros.join(', ') || 'none'}`);
console.log(`AFTER >45%: ${sA.over45.join(', ') || 'none'}`);
