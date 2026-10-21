// CTF STRATEGIST PROBE: real CPU-vs-CPU Capture the Flag fixtures (the game in jsdom, the real loop) with each side forced onto one plan, so the strategist's model (ctfFluid in artifacts/V1/index.html) can be
// checked against, and corrected by, the real engine. One fixture is slow (about 7 ms a step at 3v3: a 5 minute cap is 18000 steps, about two minutes), so run few and run them one process at a time.
//   node scripts/ctf-strat-probe.mjs <planA> <planB> [map=castle] [size=3] [capMinutes=5] [seeds=1] [seed0=1]
// Plans: balanced rush rushback turtle fortress jailbreak twowaves traps hunt. Prints one JSON line per fixture and a summary: flags, who won, how it ended, steps.
import { loadMonolith } from './helpers/load-monolith.js';

const [planA = 'balanced', planB = 'balanced', map = 'castle', size = '3', cap = '5', seeds = '1', seed0 = '1'] = process.argv.slice(2);
let winsA = 0, winsB = 0, draws = 0;
for (let k = 0; k < +seeds; k++) {
  const { window: w } = loadMonolith(+seed0 + k);
  w.eval(`CTFCUP = ctfCupClean({ teams:4, size:${+size}, map:'${map}', cpu:1, gCap:${+cap}, kCap:${+cap} }); ctfCupStart(); watchFixture(TOURNEY.fixtures[0]);`);
  w.eval(`CTF.stratFixed = true; ctfStratApply(CTF.live, 0, '${planA}'); ctfStratApply(CTF.live, 1, '${planB}');`);
  const t0 = Date.now(); let steps = 0;
  while (w.eval('!!CTF.cupFix') && steps < 200000) { for (let i = 0; i < 60; i++) w.eval('step()'); steps += 60; }
  const fx = JSON.parse(w.eval('JSON.stringify(TOURNEY.fixtures[0])'));
  const win = fx.result.sa > fx.result.sb ? 0 : fx.result.sb > fx.result.sa ? 1 : -1;
  if (win === 0) winsA++; else if (win === 1) winsB++; else draws++;
  console.log(JSON.stringify({ seed: +seed0 + k, planA, planB, map, size: +size, result: fx.result, how: fx.how, steps, seconds: Math.round((Date.now() - t0) / 1000) }));
}
console.log(JSON.stringify({ summary: { planA, planB, winsA, winsB, draws } }));
