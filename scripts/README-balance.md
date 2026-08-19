# Balance tournament runner

`balance-tournament.mjs` ranks the **59 playable fighters** by **actual in-engine
performance** so a balance pass has real signal.

## Why real matches (not the built-in sim)

The game's own tournament "instant sim" (`simGroupMatch` / `simKnockoutMatch` /
`teamStrength`) only counts **team size** — it never reads a fighter's identity, kit, or
weight, so it **cannot rank fighters**. This runner plays **REAL** matches: it boots the
untouched monolith (`artifacts/V1/index.html`) in jsdom via
`test/helpers/load-monolith.js` and drives the real `step()` loop until `checkWin()`
resolves the knockout — the exact code path normal play uses, including
`recordMatch()` writing `balance:tallies` / `balance:matchlog`.

## How the lineup is forced

`buildFighters()` picks the non-`chosen` fighters **at random**, so it can't stage a
chosen matchup. The runner instead injects `__setupCustomMatch(names, stocks, aiLevel)`
into the monolith's own realm (via `w.eval`). It **bypasses** `buildFighters` and mirrors
`beginMatchNow()`'s match-start resets:

- FFA mode, **items off** (`itemRate=0`), flat **hazard-free** stage (`goiky`);
- builds the `fighters` array directly from `makeFighter()` for the **exact** lineup —
  one fighter per team (true FFA), all `controller:'ai'`, spread across the floor exactly
  like `buildFighters`' small-FFA branch (`WW*(0.08+0.84*i/(N-1))`);
- resets `hazardT`, `lastKoFrame`, `__elimSeq`, per-fighter tallies, particles/projectiles.

Then the runner loops `step()` (rAF is neutered by the helper) until `running` flips false.
No game logic is stubbed — only the helper's 2D-canvas shim, seeded PRNG, and no-op rAF.

`MAX_FFA` in the engine is **5**, so heats are FFA of ≤5 fighters and the heat winner
advances (single-elim bracket).

## Usage

```bash
node scripts/balance-tournament.mjs smoke     # one 1v1, prints frames + wall ms + tally proof
node scripts/balance-tournament.mjs pilot     # 2 tournaments over all 59, prelim ranking + wall time
node scripts/balance-tournament.mjs full      # 8 tournaments (the real balance run)
node scripts/balance-tournament.mjs run       # 1 tournament

# flags (all commands): --tournaments N --seed N --heat 5 --stocks 2 --ai 2 --frames 6000 --out ranking.json
```

## Programmatic API

```js
import { runMatch, runTournament } from './scripts/balance-tournament.mjs';

// One real FFA match with exactly these fighters:
const r = await runMatch(['Firey', 'Ice Cube'], { seed: 42, maxFrames: 6000, stocks: 2, aiLevel: 2 });
// r = { winner, placements:[names 1st..last], perFighter:{name:{kos,falls,dmgDealt,finalStocks,finalPct,placement}}, frames, timedOut, seed }
```

- **Reproducible:** each match boots a fresh window seeded by `seed`; seeds are derived
  per (baseSeed, tournament, round, heat) so a whole run is deterministic yet every match
  differs.
- **Timeout:** if `running` is still true at `maxFrames`, `timedOut:true` and fighters are
  ranked by `(stocks desc, pct asc)` (dead fighters ordered by finish placement).

## Ranking metric

Primary metric is **match win-rate** = wins / games, aggregated across all matches of all
tournaments, tie-broken by KOs/game then average placement. Heat winners advance, so
stronger fighters accrue both more games and more wins. Reported as a full ranking plus
top-8 / bottom-8.

## Measured performance (jsdom, Node 22)

- Boot: ~175 ms. 1v1 match: ~530 frames / ~575 ms.
- 5-way heats average ~2.3 s/match (fresh boot + longer FFA).
- Pilot (2 tournaments, 32 matches): **~73 s, 0 timeouts**.
- **Full run (8 tournaments, ~128 matches): projected ~5 min** — well under the 15-min budget.
  There is headroom to raise `--tournaments` for finer signal.

## ⚠️ READ THIS BEFORE ACTING ON A RANKING (added in balance pass 3)

**Win-rate at 24 tournaments cannot tell a balanced roster from an unbalanced one.**

Wins and games are *coupled* here — winning a heat advances you, so you play again — so the
noise in win-rate is not a binomial and cannot be reasoned about analytically. Simulate it:

```bash
node scripts/_pass3-null.mjs 24 400     # replays the exact bracket with 59 IDENTICAL fighters
```

A **perfectly balanced** roster still produces, at 24 tournaments:

| statistic | null result |
|---|---|
| std-dev | 7.92 (p95 **8.93**) |
| best fighter | 39.8% (p95 **45.0%**) |
| worst fighter | 3.9% |
| fighters at 0% | 0.27 |

So at 24 tournaments a 44% winner and a 4% loser are **exactly what balance looks like**.
Pass 3's baseline measured std-dev 8.50 / max 42.1% / min 4.0% — every number inside the
null. The three fighters that pass had been briefed to fix (Liy "~59%", Balloony and
Firey Jr. "0%") had already been fixed by earlier passes; acting on that brief would have
been fitting noise.

**Raise the sample before concluding anything.** Chunk it across cores — the runner is
single-threaded, so N processes with different `--seed` values give ~N× throughput:

```bash
# 5 chunks x 24 = 120 tournaments (~130-180 games/fighter), ~25 min wall on 8 cores
for s in 1234 2222 3333 4444 5555; do
  node scripts/balance-tournament.mjs full --tournaments 24 --seed $s --out chunk-$s.json &
done; wait
node scripts/_pass3-merge.mjs merged.json chunk-*.json
node scripts/_pass3-compare.mjs before.json merged.json
```

At **120 tournaments** the null tightens to std-dev 3.55 / max 29.9% (p95 32.5) / min 13.2%,
which is enough resolution to name real outliers.

**Prefer KOs/game for diagnosing a kit.** It is a count over many events rather than one
binary per match, so it is far less noisy than win-rate: roster mean ~1.73 against a count
noise floor around 0.25. That statistic is what exposed Gelatin (0.83 — her smash applied
freeze *on top of* its own knockback, and `frozen` costs 40% of vx every frame, so she was
erasing the only launch she had) and Marker (0.98 — an all-debuff kit with no finisher).

**Watch for variance an AI gate is hiding.** Smash commitment used to be restricted to
heavy/brawl, which denied 46 of 59 fighters their finisher *and* damped roster variance by
holding them all to a common baseline. Opening it (pass 3) lifted the floor 7.0% → 9.1% but
widened std-dev 5.89 → 6.50, because it amplifies uneven smash quality. If a future pass
wants the tighter spread back, that single gate in `aiThink` is the lever.
