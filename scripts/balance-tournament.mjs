// ============================================================================
//  balance-tournament.mjs — headless REAL-MATCH tournament runner
// ============================================================================
// Ranks the 59 playable fighters in "Battle for Smash Island" by ACTUAL in-engine
// performance, so a balance pass has real signal instead of the game's built-in
// "instant sim" (simGroupMatch/teamStrength) — which only counts TEAM SIZE and is
// blind to a fighter's identity/kit/weight, i.e. statistical noise for balancing.
//
// It boots the untouched monolith (artifacts/V1/index.html) in jsdom via
// test/helpers/load-monolith.js and DRIVES THE REAL GAME LOOP: startMatch-equivalent
// setup, then step() every frame until checkWin() resolves the knockout. No game
// logic is stubbed — only a 2D-canvas shim + seeded PRNG + no-op rAF (see the helper).
//
// ---------------------------------------------------------------------------
//  LINEUP CONTROL (the exact mechanism)
// ---------------------------------------------------------------------------
// buildFighters() picks the non-`chosen` fighters at RANDOM, so it can't stage a
// specific matchup. Instead we install __setupCustomMatch() into the monolith's own
// realm (w.eval) which BYPASSES buildFighters and mirrors beginMatchNow()'s match-start
// resets: it sets FFA mode, items off, a flat hazard-free stage (goiky), then builds the
// `fighters` array directly from makeFighter() for our EXACT lineup — one fighter per
// team (FFA), all controller:'ai' (no 'local'/'you' so nobody stands idle waiting for a
// keyboard), spread across the arena floor exactly like buildFighters' small-FFA branch.
// Then WE loop step() (rAF is neutered) until `running` flips false in checkWin(), which
// calls recordMatch() → writes BStore 'balance:tallies'/'balance:matchlog' as in real play.
//
// Usage:
//   node scripts/balance-tournament.mjs smoke     # one 1v1, prints frames + wall ms + tally proof
//   node scripts/balance-tournament.mjs pilot     # 2 tournaments, prelim ranking + wall time
//   node scripts/balance-tournament.mjs full      # 8 tournaments over all 59 (the real balance run)
//   node scripts/balance-tournament.mjs full --tournaments 8 --seed 1234 --out ranking.json
// ============================================================================

import { loadMonolith } from '../test/helpers/load-monolith.js';

// ---------------------------------------------------------------------------
//  JSDOM TEARDOWN GUARD
// ---------------------------------------------------------------------------
// The monolith fires a few FIRE-AND-FORGET async boot tasks (refreshDailyCard() ->
// await BStore.get(...) -> document.createElement(...)). Their continuations are
// queued against a window we then close(): jsdom nulls `document` on close, so the
// continuation throws INSIDE an async function nobody awaited -> unhandled rejection
// -> Node 22 kills the process mid-run. That is pure teardown noise, not a game bug:
// the match has already been played and scored by the time we close the window.
//
// `settle()` gives those continuations a turn to finish BEFORE the close (which is
// where they succeed harmlessly), and the guard below swallows only the specific
// post-close symptom so a REAL error still crashes the run loudly.
const settle = async (turns = 3) => { for (let i = 0; i < turns; i++) await new Promise(r => setTimeout(r, 0)); };
const TEARDOWN_RE = /Cannot read properties of (?:undefined|null) \(reading '(?:createElement|getElementById|body|querySelector[A-Za-z]*)'\)/;
process.on('unhandledRejection', (err) => {
  const msg = (err && err.message) || String(err);
  if (TEARDOWN_RE.test(msg)) return;            // dead-window continuation — ignore
  console.error('UNHANDLED REJECTION:', err);
  process.exit(1);
});

// ---- deterministic PRNG for seed derivation + seeded shuffles (mirrors helper's mulberry32)
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// Combine integers into a stable 32-bit seed so every match seed is unique + reproducible.
function deriveSeed(...parts) {
  let h = 2166136261 >>> 0;
  for (const p of parts) {
    h ^= (p | 0); h = Math.imul(h, 16777619) >>> 0;
    h ^= (h >>> 13); h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
function seededShuffle(arr, seed) {
  const a = arr.slice();
  const rnd = mulberry32(seed >>> 0);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// The setup function we inject into the monolith realm. Kept as a string so it runs
// INSIDE jsdom's script realm (where SETTINGS/fighters/makeFighter/etc. are lexical).
const SETUP_SRC = `
window.__setupCustomMatch = function(names, stocks, aiLevel){
  // Kill every rival mode/flag so we land in a clean plain FFA.
  TESTMODE.active=false; TOURNEY.active=false; TOURNEY_WATCHING=null;
  if(typeof BOSSRUSH!=='undefined') BOSSRUSH.active=false;
  CUSTOM_LEVEL=null; TOURNEY_MATCH_ACTIVE=false; PENDING_TOURNEY=null; window.__netRoster=null;
  SETTINGS.mode='ffa'; SETTINGS.count=names.length; SETTINGS.stocks=stocks;
  SETTINGS.itemRate=0;                                   // items OFF — remove RNG pickups from the signal
  AI_LEVEL=aiLevel; LOCAL_PLAYERS=1;
  stage = STAGES.find(s=>s.id==='goiky') || STAGES.find(s=>!s.big) || STAGES[0];  // flat, hazard:null
  resize(); setupWorld();
  const N=names.length;
  fighters=[];
  names.forEach(function(nm,i){
    const r = ROSTER.find(x=>x.name===nm);
    if(!r) throw new Error('unknown fighter: '+nm);
    const sx = WW*(0.08+0.84*i/Math.max(1,N-1));         // same spread as buildFighters' small-FFA branch
    const sy = groundY()-60;
    const f = makeFighter(Object.assign({}, r, {you:false}), sx, sy, i);
    f.stocks=stocks; f.team=i; f.homeBase=null;           // one fighter per team => true FFA
    f.controller='ai'; f.you=false; f.you2=false;         // all AI: nobody waits on a keyboard
    fighters.push(f);
  });
  // mirror beginMatchNow()'s per-match resets
  running=true; paused=false; hazardT=0;
  window.__elimSeq=0; lastKoFrame=0;
  fighters.forEach(function(f){ f.placement=null; f._downOrder=0; f._kos=0; f._falls=0; f._dmgDealt=0; f._dmgTaken=0; });
  particles=[]; projectiles=[]; beams=[]; evil=null; items=[]; summons=[]; itemTimer=0; tendrils=[]; BOSS_ARENA=null;
  if(stage.hazard==='evilleafy'){ evil={x:WW*0.9,y:groundY()-40}; }  // (goiky has none; kept for safety)
  return fighters.length;
};
`;

// Rank fighters for a finished OR timed-out match:
//   alive before dead; among alive -> stocks desc then pct asc (the timeout tie-break the brief asks for);
//   among dead -> placement asc (placement = #still-alive+1 at death, so a later death = lower # = better).
function rankFighters(fs) {
  return fs.slice().sort((a, b) => {
    const aa = !a.dead, ab = !b.dead;
    if (aa !== ab) return aa ? -1 : 1;
    if (aa) {
      if (b.stocks !== a.stocks) return b.stocks - a.stocks;
      return a.pct - b.pct;
    }
    return (a.placement || 9999) - (b.placement || 9999);
  });
}

/**
 * Play ONE real FFA match with EXACTLY `fighterNames` headless, driving step() to a
 * knockout resolution (or the frame cap).
 * @returns {winner, placements, perFighter:{name:{kos,falls,dmgDealt,finalStocks,finalPct,placement}}, frames, timedOut, seed}
 */
export async function runMatch(fighterNames, opts = {}) {
  const { seed = 0xC0FFEE, maxFrames = 6000, stocks = 2, aiLevel = 2 } = opts;
  if (!Array.isArray(fighterNames) || fighterNames.length < 2) {
    throw new Error('runMatch needs at least 2 fighter names');
  }
  const { window: w } = loadMonolith(seed >>> 0);
  try {
    w.eval(SETUP_SRC);
    w.eval(`__setupCustomMatch(${JSON.stringify(fighterNames)}, ${stocks | 0}, ${aiLevel | 0})`);

    let frames = 0;
    while (w.eval('running') && frames < maxFrames) {
      w.eval('step()');
      frames++;
    }
    const timedOut = !!w.eval('running');

    const fs = w.eval(
      'fighters.map(f=>({name:f.name,stocks:(f.stocks===Infinity?999:f.stocks),pct:Math.round(f.pct),' +
      'dead:!!f.dead,placement:f.placement,kos:(f._kos||0),falls:(f._falls||0),dmgDealt:Math.round(f._dmgDealt||0)}))'
    );

    const ranked = rankFighters(fs);
    const placements = ranked.map(f => f.name);
    const perFighter = {};
    for (const f of fs) {
      perFighter[f.name] = {
        kos: f.kos, falls: f.falls, dmgDealt: f.dmgDealt,
        finalStocks: f.stocks, finalPct: f.pct,
        placement: f.placement != null ? f.placement : (placements.indexOf(f.name) + 1),
      };
    }
    // recordMatch() is async; let its BStore writes settle so 'balance:tallies' reflects this match.
    for (let i = 0; i < 3; i++) await new Promise(r => setTimeout(r, 0));

    return { winner: placements[0], placements, perFighter, frames, timedOut, seed: seed >>> 0 };
  } finally {
    try { w.close && w.close(); } catch { /* jsdom teardown best-effort */ }
  }
}

// Partition a field into heats of size 2..maxSize with NO singleton (a 1-fighter "heat"
// can't play). If the remainder is 1, shrink the previous heat to feed it a pair.
function partitionHeats(field, maxSize) {
  const heats = [];
  for (let i = 0; i < field.length; i += maxSize) heats.push(field.slice(i, i + maxSize));
  const last = heats[heats.length - 1];
  if (heats.length > 1 && last.length === 1) {
    const prev = heats[heats.length - 2];
    last.unshift(prev.pop()); // move one over so the tail heat is a pair
  }
  return heats;
}

/**
 * Run ONE single-elim tournament over `allNames`: FFA heats of <=heatSize, the winner of
 * each heat advances, until one champion remains. best-of-1 matches, seeds vary per match.
 * @returns {champion, matches:[matchResult], rounds}
 */
export async function runTournament(allNames, opts = {}) {
  const {
    tid = 0, baseSeed = 1234, stocks = 2, aiLevel = 2, heatSize = 5, maxFrames = 6000,
    onMatch = null,
  } = opts;
  let field = seededShuffle(allNames, deriveSeed(baseSeed, tid, 0x5EED));
  const matches = [];
  let round = 0;
  while (field.length > 1) {
    const heats = partitionHeats(field, heatSize);
    const winners = [];
    for (let h = 0; h < heats.length; h++) {
      const seed = deriveSeed(baseSeed, tid, round, h);
      const res = await runMatch(heats[h], { seed, stocks, aiLevel, maxFrames });
      res.tid = tid; res.round = round; res.heat = h;
      matches.push(res);
      winners.push(res.winner);
      if (onMatch) onMatch(res);
    }
    field = winners;
    round++;
  }
  return { champion: field[0], matches, rounds: round };
}

// Aggregate match results into per-fighter tallies + the primary metric: match win-rate.
function aggregate(matches) {
  const agg = {};
  const get = n => (agg[n] || (agg[n] = { name: n, games: 0, wins: 0, kos: 0, falls: 0, dmgDealt: 0, sumPlace: 0 }));
  for (const m of matches) {
    for (const name of m.placements) {
      const a = get(name);
      const pf = m.perFighter[name];
      a.games++;
      if (name === m.winner) a.wins++;
      a.kos += pf.kos; a.falls += pf.falls; a.dmgDealt += pf.dmgDealt; a.sumPlace += pf.placement;
    }
  }
  const rows = Object.values(agg).map(a => ({
    ...a,
    winRate: a.games ? a.wins / a.games : 0,
    avgPlace: a.games ? a.sumPlace / a.games : 0,
    kosPerGame: a.games ? a.kos / a.games : 0,
  }));
  // Rank by win-rate, then KOs/game, then lower avg placement as tie-breaks.
  rows.sort((x, y) => y.winRate - x.winRate || y.kosPerGame - x.kosPerGame || x.avgPlace - y.avgPlace);
  return rows;
}

function fmtTable(rows, { top = 8, bottom = 8 } = {}) {
  const line = r =>
    `  ${String(r.rank).padStart(3)}. ${r.name.padEnd(14)} ` +
    `win% ${(r.winRate * 100).toFixed(1).padStart(5)}  ${String(r.wins).padStart(2)}/${String(r.games).padEnd(2)}` +
    `  kos/g ${r.kosPerGame.toFixed(2)}  avgPlace ${r.avgPlace.toFixed(2)}`;
  rows.forEach((r, i) => (r.rank = i + 1));
  const out = [];
  out.push(`TOP ${top}:`);
  rows.slice(0, top).forEach(r => out.push(line(r)));
  out.push(`BOTTOM ${bottom}:`);
  rows.slice(Math.max(0, rows.length - bottom)).forEach(r => out.push(line(r)));
  return out.join('\n');
}

async function getPlayableRoster() {
  const { window: w } = loadMonolith(1);
  const roster = w.eval('ROSTER.filter(r=>r.play).map(r=>r.name)');
  await settle();                               // let the boot's async tasks finish before teardown
  try { w.close && w.close(); } catch { /* */ }
  return roster;
}

// ---------------------------------------------------------------------------
//  CLI
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const k = a.slice(2); const v = argv[i + 1]; o[k] = (v && !v.startsWith('--')) ? (i++, v) : true; }
    else o._.push(a);
  }
  return o;
}

async function cmdSmoke() {
  console.log('== SMOKE: one real 1v1 (Firey vs Ice Cube) ==');
  const t0 = Date.now();
  const res = await runMatch(['Firey', 'Ice Cube'], { seed: 0xF12E, stocks: 2, aiLevel: 2 });
  const ms = Date.now() - t0;
  console.log(`winner: ${res.winner}   frames: ${res.frames}   wall: ${ms} ms   timedOut: ${res.timedOut}`);
  console.log('placements:', res.placements.join(' > '));
  console.log('perFighter:', JSON.stringify(res.perFighter));
  // Prove the game's own recording path fired (drove a real checkWin -> recordMatch).
  const { window: w } = loadMonolith(0xF12E);
  w.eval(SETUP_SRC);
  w.eval(`__setupCustomMatch(["Firey","Ice Cube"],2,2)`);
  let f = 0; while (w.eval('running') && f < 6000) { w.eval('step()'); f++; }
  for (let i = 0; i < 4; i++) await new Promise(r => setTimeout(r, 0));
  const tallies = await w.eval('BStore.get("balance:tallies")');
  console.log('balance:tallies updated:', tallies ? 'YES' : 'NO');
  if (tallies) console.log('  ', tallies);
  try { w.close && w.close(); } catch { /* */ }
}

async function cmdRun(tournaments, args) {
  const roster = await getPlayableRoster();
  console.log(`== RUN: ${tournaments} tournament(s) over ${roster.length} playable fighters ==`);
  const baseSeed = args.seed ? (parseInt(args.seed, 10) >>> 0) : 1234;
  const heatSize = args.heat ? parseInt(args.heat, 10) : 5;
  const stocks = args.stocks ? parseInt(args.stocks, 10) : 2;
  const aiLevel = args.ai ? parseInt(args.ai, 10) : 2;
  const maxFrames = args.frames ? parseInt(args.frames, 10) : 6000;
  const allMatches = [];
  const champions = [];
  let timeouts = 0, doneMatches = 0;
  const t0 = Date.now();
  for (let tid = 0; tid < tournaments; tid++) {
    const { champion, matches, rounds } = await runTournament(roster, {
      tid, baseSeed, stocks, aiLevel, heatSize, maxFrames,
      onMatch: r => { doneMatches++; if (r.timedOut) timeouts++; },
    });
    champions.push(champion);
    allMatches.push(...matches);
    console.log(`  tournament ${tid + 1}/${tournaments}: ${matches.length} matches, ${rounds} rounds, champion = ${champion}`);
  }
  const wall = Date.now() - t0;
  const rows = aggregate(allMatches);
  console.log(`\nmatches: ${doneMatches}   timeouts: ${timeouts} (${(100 * timeouts / doneMatches).toFixed(1)}%)   wall: ${(wall / 1000).toFixed(1)} s   (${(wall / doneMatches).toFixed(0)} ms/match)`);
  console.log(`champions: ${champions.join(', ')}\n`);
  console.log(fmtTable(rows));
  if (args.out) {
    const fs = await import('node:fs');
    fs.writeFileSync(args.out, JSON.stringify({ tournaments, baseSeed, heatSize, stocks, aiLevel, wallMs: wall, champions, ranking: rows }, null, 2));
    console.log(`\nwrote ${args.out}`);
  }
  return { rows, wall, doneMatches, timeouts };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0] || 'help';
  if (cmd === 'smoke') return cmdSmoke();
  if (cmd === 'pilot') return cmdRun(args.tournaments ? parseInt(args.tournaments, 10) : 2, args);
  if (cmd === 'full') return cmdRun(args.tournaments ? parseInt(args.tournaments, 10) : 8, args);
  if (cmd === 'run') return cmdRun(args.tournaments ? parseInt(args.tournaments, 10) : 1, args);
  console.log('usage: node scripts/balance-tournament.mjs <smoke|pilot|full|run> [--tournaments N] [--seed N] [--heat 5] [--stocks 2] [--ai 2] [--frames 6000] [--out file.json]');
}

// Run as CLI only (importing for runMatch/runTournament won't trigger this).
import { pathToFileURL } from 'node:url';
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
