// ============================================================================
//  balance-ab.mjs — a true A/B test over every stat, including the hidden ones
// ============================================================================
//   node scripts/balance-ab.mjs census
//   node scripts/balance-ab.mjs ab --knob tick.burn --factors 0.75,1.33 --matches 24
//   node scripts/balance-ab.mjs sweep --matches 24 --out sweep.json
//
// WHAT THIS IS FOR, AND WHY IT IS NOT auto-balance.mjs
//
// auto-balance.mjs answers "which FIGHTER is off?" — it reads a ranking and nudges that fighter's
// weight and RANGE_PROFILE row. It cannot answer "is the burn duration right?", because a burn is
// not a fighter, and its duration is a literal repeated at nine sites that nothing could address.
//
// So this measures SYSTEMS, not characters. It runs the SAME seeded matches against two builds that
// differ by exactly one stat family and reports what moved. The knob catalogue lives in
// balance-knobs.mjs and reaches 13 families — including the two that were previously unreachable:
// per-move COOLDOWNS (55 sites) and EFFECT TICKS (46).
//
// PAIRED SEEDS ARE THE POINT. balance-noise.mjs measured the unpaired noise floor on this game at a
// 7.5pp median swing and 20pp at p90, with nothing changed at all. A sweep that runs A, then runs B
// on fresh seeds, is reading dice. Here every match index uses one fixed seed for both arms, so the
// arms start identical and diverge only where the stat actually bites.
//
// HONEST LIMIT, STATED UP FRONT. A changed stat changes how much RNG a match consumes, so the arms
// track each other only until the first divergence — pairing shrinks variance, it does not abolish
// it. That is why every run reports a NULL ARM: the same matches at factor 1.0, which must come
// back bit-identical to the baseline. If the null arm ever differs, the run is measuring its own
// noise and the numbers are void. Read that line before any other.

import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { runMatch } from './balance-tournament.mjs';
import { KNOBS, patch, census, verify } from './balance-knobs.mjs';

const MONO = 'artifacts/V1/index.html';

function parseArgs(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) a[argv[i].slice(2)] = (argv[i + 1] && !argv[i + 1].startsWith('--')) ? argv[++i] : true;
    else a._.push(argv[i]);
  }
  return a;
}

function playableRoster() {
  const src = readFileSync(MONO, 'utf8');
  return [...src.matchAll(/\{name:"([^"]+)",\s*w:\d+,[^}]*?play:true/g)].map(m => m[1]);
}

// A fixed, deterministic slate of heats. Every arm plays exactly this, in this order, on these
// seeds — the slate is the experiment's control, so it is built once and never reshuffled.
//
// It WALKS the roster rather than sampling it. A stride-based pick collides constantly, and the
// win-rate metric only counts fighters who played at least twice, so a colliding slate leaves
// almost the whole roster with a single appearance and the spread silently reads 0.0000 — a
// degenerate metric that looks like a perfectly balanced game. Walking gives every fighter
// floor(4n/59) or one more appearances, and coverage is reported so a too-thin run is visible.
const HEAT = 4;
function buildSlate(roster, n, seed0) {
  const slate = [];
  let idx = 0;
  for (let i = 0; i < n; i++) {
    const heat = [];
    while (heat.length < HEAT) {
      const nm = roster[idx % roster.length];
      idx++;
      if (!heat.includes(nm)) heat.push(nm);
    }
    slate.push({ heat, seed: (seed0 + i * 7919) >>> 0 });
  }
  return slate;
}
// Matches needed before the spread metric means anything: every fighter must play at least twice.
function minMatchesFor(roster) { return Math.ceil((2 * roster.length) / HEAT); }

const mean = (x) => x.reduce((a, b) => a + b, 0) / (x.length || 1);
const sd = (x) => { const m = mean(x); return Math.sqrt(mean(x.map(v => (v - m) ** 2))); };

async function runArm(slate, transform, opts) {
  const wins = {}, played = {}, frames = [];
  let timeouts = 0;
  for (const { heat, seed } of slate) {
    const r = await runMatch(heat, { seed, stocks: opts.stocks, aiLevel: opts.ai, maxFrames: opts.frames, transform });
    for (const n of heat) { wins[n] = wins[n] || 0; played[n] = (played[n] || 0) + 1; }
    wins[r.winner] = (wins[r.winner] || 0) + 1;
    frames.push(r.frames);
    if (r.timedOut) timeouts++;
  }
  const rates = Object.keys(wins).filter((n) => played[n] >= 2).map((n) => wins[n] / played[n]);
  return {
    spread: sd(rates),                // the balance metric: how far apart win rates sit. Lower is flatter.
    pace: mean(frames),               // mean frames to resolve — is the game faster or slower?
    stalls: timeouts / slate.length,  // matches that hit the cap: nobody could close it out
    wins,
  };
}

function fmtDelta(b, a) {
  const d = a - b;
  const pct = b === 0 ? 0 : (100 * d / b);
  return `${d >= 0 ? '+' : ''}${d.toFixed(4)} (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%)`;
}

async function cmdAb(args) {
  const src = readFileSync(MONO, 'utf8');
  const bad = verify(src);
  if (bad.length) { console.error(`knobs are not identity-safe: ${bad.join(', ')} — refusing to measure`); process.exit(1); }

  const knob = args.knob;
  if (!knob || !KNOBS[knob]) {
    console.error(`--knob must be one of:\n  ${Object.keys(KNOBS).join('\n  ')}`);
    process.exit(1);
  }
  const factors = String(args.factors || '0.75,1.33').split(',').map(Number);
  const opts = {
    stocks: args.stocks ? +args.stocks : 2,
    ai: args.ai ? +args.ai : 2,
    frames: args.frames ? +args.frames : 6000,
  };
  const roster = playableRoster();
  const need = minMatchesFor(roster);
  const slate = buildSlate(roster, args.matches ? +args.matches : need, args.seed ? (+args.seed >>> 0) : 20260902);
  const c = census(src, knob);
  const appearances = (HEAT * slate.length) / roster.length;

  console.log(`== A/B: ${knob} ==`);
  console.log(`   ${KNOBS[knob].doc}`);
  console.log(`   reaches ${c.count} literals, range ${c.min}..${c.max}`);
  console.log(`   ${slate.length} paired matches, stocks=${opts.stocks} ai=${opts.ai} cap=${opts.frames}f`);
  console.log(`   coverage ${appearances.toFixed(1)} matches per fighter` +
    (slate.length < need ? `   *** THIN: spread needs >= ${need} matches to mean anything ***` : ''));
  console.log('');

  const t0 = Date.now();
  const base = await runArm(slate, undefined, opts);
  console.log(`baseline    spread ${base.spread.toFixed(4)}   pace ${base.pace.toFixed(0)}f   stalls ${(100 * base.stalls).toFixed(0)}%`);

  const nul = await runArm(slate, patch(knob, 1), opts);
  const nullClean = nul.spread === base.spread && nul.pace === base.pace;
  console.log(`null (x1.0) spread ${nul.spread.toFixed(4)}   pace ${nul.pace.toFixed(0)}f   ` +
    (nullClean ? 'IDENTICAL to baseline — harness is sound' : '*** DIFFERS FROM BASELINE — results below are noise ***'));
  console.log('');

  const arms = [];
  for (const f of factors) {
    const a = await runArm(slate, patch(knob, f), opts);
    arms.push({ factor: f, ...a });
    console.log(`x${f.toFixed(2)}       spread ${a.spread.toFixed(4)} ${fmtDelta(base.spread, a.spread).padEnd(22)}` +
      ` pace ${a.pace.toFixed(0)}f ${fmtDelta(base.pace, a.pace).padEnd(20)} stalls ${(100 * a.stalls).toFixed(0)}%`);
  }
  console.log(`\nwall ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  const out = { knob, doc: KNOBS[knob].doc, census: c, slate: slate.length, opts, nullClean, base, arms };
  if (args.out) { writeFileSync(args.out, JSON.stringify(out, null, 2)); console.log(`wrote ${args.out}`); }
  return out;
}

async function cmdSweep(args) {
  const results = [];
  for (const knob of Object.keys(KNOBS)) {
    const r = await cmdAb({ ...args, knob, out: null, factors: args.factors || '0.75,1.33' });
    const worst = r.arms.reduce((p, c) => (Math.abs(c.spread - r.base.spread) > Math.abs(p.spread - r.base.spread) ? c : p), r.arms[0]);
    results.push({
      knob,
      sensitivity: Math.abs(worst.spread - r.base.spread),
      paceShift: Math.abs(worst.pace - r.base.pace),
      nullClean: r.nullClean,
    });
    console.log('');
  }
  results.sort((a, b) => b.sensitivity - a.sensitivity);
  console.log('== SENSITIVITY: how much moving each stat family disturbs roster balance ==');
  console.log('   (spread = sd of per-fighter win rate; a HIGH number means this stat is load-bearing)\n');
  for (const r of results) {
    console.log(`  ${r.knob.padEnd(15)} spread ${r.sensitivity.toFixed(4)}   pace ${r.paceShift.toFixed(0)}f` +
      (r.nullClean ? '' : '   (NULL ARM DIRTY — ignore this row)'));
  }
  if (args.out) { writeFileSync(args.out, JSON.stringify(results, null, 2)); console.log(`\nwrote ${args.out}`); }
}

function cmdCensus() {
  const src = readFileSync(MONO, 'utf8');
  const bad = verify(src);
  console.log(`identity check: ${bad.length ? 'FAIL — ' + bad.join(', ') : `all ${Object.keys(KNOBS).length} knobs reproduce the source at x1.0`}\n`);
  for (const k of Object.keys(KNOBS)) {
    const c = census(src, k);
    console.log(`  ${k.padEnd(15)} ${String(c.count).padStart(3)} sites   ${String(c.min).padStart(3)}..${String(c.max).padEnd(5)} ${KNOBS[k].doc}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0] || 'help';
  if (cmd === 'census') return cmdCensus();
  if (cmd === 'ab') return cmdAb(args);
  if (cmd === 'sweep') return cmdSweep(args);
  console.log('usage: node scripts/balance-ab.mjs <census|ab|sweep> [--knob NAME] [--factors 0.75,1.33]' +
    ' [--matches 24] [--seed N] [--stocks 2] [--ai 2] [--frames 6000] [--out file.json]');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
