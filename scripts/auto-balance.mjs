// ============================================================================
//  auto-balance.mjs — apply one data-driven balance pass from a measurement
// ============================================================================
//   node scripts/auto-balance.mjs scripts/run1.json scripts/run2.json ... [--dry]
//
// PASS SEVERAL RUNS OF THE SAME BUILD. One run cannot resolve anything finer than about 20
// percentage points (see scripts/balance-noise.mjs), so a pass built on a single run is mostly
// noise. Runs are POOLED, and the dead band shrinks as 1/sqrt(k) with the number supplied.
//
// Reads a ranking produced by balance-tournament.mjs and nudges the two levers a balance pass has:
// per-fighter WEIGHT (survivability, koCap = 150 + w) and the fighter's RANGE_PROFILE entry
// (reach/dmg/kb — offence). Writes the changes into artifacts/V1/index.html and prints a report.
//
// WHY THIS IS AUTOMATED AND CONSERVATIVE
//
// Hand passes in this project have repeatedly OVERSHOT — the RANGE_PROFILE comments still carry
// the scars ("buff overshot to 75% — pulled back", "9%->75%->21%; settling between my two
// overshoots"). Overshoot happens when a big correction is applied to a noisy measurement. Each
// fighter here plays only ~25-45 games per run, so a single run's win rate carries real noise, and
// the right response is a SMALL step in the right direction, repeated, rather than one large jump.
//
// So every pass:
//   · ignores fighters inside a dead band (their deviation is probably noise)
//   · moves each stat by at most one step, and by at most ~1 point per pass
//   · clamps every stat to a sane range so repeated passes cannot run away
//   · treats a shared RANGE_PROFILE key once, using the mean deviation of everyone using it
//
// The target is the roster MEAN, not a fixed number: heats are FFA of up to 5, so a balanced
// roster sits near 0.20, but the achievable mean drifts with heat sizes and byes.

import { readFileSync, writeFileSync } from 'node:fs';

const MONOLITH = 'artifacts/V1/index.html';
const DRY = process.argv.includes('--dry');
const src = process.argv[2];
if (!src) { console.error('usage: node scripts/auto-balance.mjs <ranking.json> [...] [--dry]'); process.exit(1); }

// ---- tuning constants -------------------------------------------------------------------------
// MEASURED, not chosen. scripts/balance-noise.mjs ran the SAME build twice and found a median
// run-to-run swing of 7.5pp and a 90th percentile of 20pp with nothing changed at all — Woody
// alone moved 35pp between identical builds. A dead band under that is not conservatism, it is
// chasing dice, and it is why pass 4 moved fighters that had simply rolled well.
//
// The band therefore scales with how many runs are averaged: noise falls as 1/sqrt(k).
const BASE_DEAD_BAND = 0.16;
const W_STEP = 6;          // weight points per pass
const W_MIN = 40, W_MAX = 145;
const DMG_MIN = 3, DMG_MAX = 13;
const KB_MIN = 4, KB_MAX = 12;
const REACH_MIN = -2, REACH_MAX = 26;
const MIN_GAMES = 12;      // below this the sample is too thin to act on at all (per run, pooled)

// Average every ranking supplied. This is the single most important change to how balancing works
// here: one run cannot resolve anything finer than ~20pp, so a pass built on one run is mostly
// noise. Averaging k runs divides the per-fighter sigma by sqrt(k).
const files = process.argv.slice(2).filter(a => !a.startsWith('--'));
const runs = files.map(f => JSON.parse(readFileSync(f, 'utf8')).ranking);
const K = runs.length;
const DEAD_BAND = BASE_DEAD_BAND / Math.sqrt(K);
const agg = {};
for (const r of runs) {
  for (const row of r) {
    const a = agg[row.name] || (agg[row.name] = { name: row.name, wins: 0, games: 0, kos: 0 });
    a.wins += row.wins; a.games += row.games; a.kos += row.kos;
  }
}
// Pooled across runs rather than a mean of rates, so a fighter who played more games in one run
// is weighted by evidence rather than by luck.
const ranking = Object.values(agg).map(a => ({
  name: a.name, wins: a.wins, games: a.games,
  winRate: a.games ? a.wins / a.games : 0,
  kosPerGame: a.games ? a.kos / a.games : 0,
}));
const mean = ranking.reduce((s, r) => s + r.winRate, 0) / ranking.length;

let html = readFileSync(MONOLITH, 'utf8');

// ---- parse the roster: name -> { weight, special } ---------------------------------------------
const roster = {};
for (const m of html.matchAll(/\{name:"([^"]+)",\s*w:(\d+)[^}]*?kit:\{special:"([^"]+)"/gs)) {
  roster[m[1]] = { w: +m[2], special: m[3] };
}
// the kit is sometimes on the following line, so catch the rest by name + weight then look ahead
for (const m of html.matchAll(/\{name:"([^"]+)",\s*w:(\d+)/g)) {
  if (roster[m[1]]) continue;
  const after = html.slice(m.index, m.index + 400);
  const sp = after.match(/special:"([^"]+)"/);
  roster[m[1]] = { w: +m[2], special: sp ? sp[1] : null };
}

const byName = Object.fromEntries(ranking.map(r => [r.name, r]));
const dev = (name) => {
  const r = byName[name];
  if (!r || r.games < MIN_GAMES) return 0;
  return r.winRate - mean;
};

// ---- 1. WEIGHT: survivability ------------------------------------------------------------------
// A fighter losing while landing hits is dying too early; one winning without landing many is
// surviving too long. Weight is the lever RANGE_PROFILE cannot reach.
const weightChanges = [];
for (const [name, info] of Object.entries(roster)) {
  const d = dev(name);
  if (Math.abs(d) < DEAD_BAND) continue;
  const dir = d > 0 ? -1 : 1;                     // strong -> lighter, weak -> heavier
  const next = Math.max(W_MIN, Math.min(W_MAX, info.w + dir * W_STEP));
  if (next === info.w) continue;
  weightChanges.push({ name, from: info.w, to: next, dev: d });
}

// ---- 2. RANGE_PROFILE: offence -----------------------------------------------------------------
// Shared keys are adjusted once, from the MEAN deviation of every fighter using them — otherwise a
// key used by two fighters gets moved twice as far as one used by a single fighter.
const byKey = {};
for (const [name, info] of Object.entries(roster)) {
  if (!info.special) continue;
  (byKey[info.special] = byKey[info.special] || []).push(name);
}
const profileChanges = [];
for (const [key, names] of Object.entries(byKey)) {
  const ds = names.map(dev).filter(x => x !== 0);
  if (!ds.length) continue;
  const d = ds.reduce((a, b) => a + b, 0) / ds.length;
  if (Math.abs(d) < DEAD_BAND) continue;
  const dir = d > 0 ? -1 : 1;

  const re = new RegExp(`(\\b${key}:\\{)([^}]*)(\\})`);
  const m = html.match(re);
  if (!m) continue;
  let body = m[2];
  const before = body;

  const bump = (field, min, max, step) => {
    const fm = body.match(new RegExp(`(${field}:)(-?\\d+)`));
    if (!fm) return;
    const cur = +fm[2];
    const next = Math.max(min, Math.min(max, cur + dir * step));
    if (next !== cur) body = body.replace(new RegExp(`(${field}:)(-?\\d+)`), `$1${next}`);
  };
  // Damage first — it is the most direct dial. Knockback second. Reach only for the outliers,
  // because reach changes how a fighter is FOUGHT, not just how hard they hit.
  bump('dmg', DMG_MIN, DMG_MAX, 1);
  bump('kb', KB_MIN, KB_MAX, 1);
  if (Math.abs(d) > 0.12) bump('reach', REACH_MIN, REACH_MAX, 2);

  if (body !== before) {
    profileChanges.push({ key, names, dev: d, from: before.trim(), to: body.trim() });
    html = html.replace(re, `$1${body}$3`);
  }
}

// ---- write -------------------------------------------------------------------------------------
for (const c of weightChanges) {
  const re = new RegExp(`(\\{name:"${c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",\\s*w:)(\\d+)`);
  html = html.replace(re, `$1${c.to}`);
}

if (!DRY) writeFileSync(MONOLITH, html);

console.log(`pass from ${K} run(s): ${files.map(f => f.replace('scripts/', '')).join(', ')}`);
console.log(`  pooled mean win rate ${(mean * 100).toFixed(1)}%, dead band ±${(DEAD_BAND * 100).toFixed(1)}pp (noise-scaled for k=${K})`);
console.log(`\nWEIGHT  ${weightChanges.length} changes`);
for (const c of weightChanges.sort((a, b) => b.dev - a.dev)) {
  console.log(`  ${c.name.padEnd(14)} ${String(c.from).padStart(3)} -> ${String(c.to).padStart(3)}   (${(c.dev * 100 >= 0 ? '+' : '')}${(c.dev * 100).toFixed(1)}pp)`);
}
console.log(`\nPROFILE ${profileChanges.length} changes`);
for (const c of profileChanges.sort((a, b) => b.dev - a.dev)) {
  console.log(`  ${c.key.padEnd(10)} ${(c.dev * 100 >= 0 ? '+' : '')}${(c.dev * 100).toFixed(1)}pp  ${c.names.join('/')}`);
  console.log(`      ${c.from}`);
  console.log(`   -> ${c.to}`);
}
if (DRY) console.log('\n(dry run — nothing written)');
