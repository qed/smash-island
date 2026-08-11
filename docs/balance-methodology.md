# How to balance this game without fooling yourself

Written after five full 384-match playthroughs of the same build. Read this before making a balance
pass; it will save you from repeating work that has already been done twice.

## The one thing to know

**A single measurement run cannot resolve anything finer than about 20–27 percentage points of win
rate.** That is not a rounding caveat. It is larger than almost every difference a balance pass is
trying to correct.

This was measured, not assumed. The same build was run five times with different seeds and
**nothing changed between runs**:

| Fighter | run 1 | run 2 | swing with nothing changed |
|---|---|---|---|
| Woody | 46.2% | 11.1% | **35 pp** |
| Remote | 4.0% | 35.3% | **31 pp** |
| Basketball | 4.0% | 35.1% | **31 pp** |
| Leafy | 43.6% | 14.3% | **29 pp** |
| Fanny | 7.7% | 34.3% | **27 pp** |

Across the whole roster, and the figures firm up as runs are added rather than settling down:

| runs compared | median swing | 90th percentile | mean per-fighter sigma |
|---|---|---|---|
| 2 | 7.5pp | 20.3pp | 4.7pp |
| 3 | 11.7pp | 26.6pp | 5.5pp |
| **5** | **16.1pp** | **28.3pp** | **6.2pp** |

Two runs *understate* the problem — with only two samples you are unlikely to have caught a
fighter's best and worst day. The five-run figure is the honest one.

The good news is that pooling cuts it fast: five pooled runs put the effective per-fighter sigma at
about **2.8pp**, which is finally sharp enough to balance with.

## Why it is so noisy

Two causes compound, and the second is the one people miss.

1. **Small samples.** Each fighter plays only ~25–45 games per run. At a 20% base rate the binomial
   standard error alone is about 7pp.
2. **The bracket is ELIMINATION, so wins compound.** Heat winners advance and play again. An early
   lucky win buys a fighter *more games and more chances to win*; an early unlucky loss ends their
   run. That is positive feedback layered on top of the binomial noise, and it roughly doubles the
   spread you would predict from sample size alone.

## The headline metric is noisy too

It is tempting to shrug off per-fighter noise on the grounds that the roster-level number will
average it out. It does not, and by nearly enough. Across the same five identical runs, the
**roster sigma itself** ranged **0.0921 → 0.1146**.

That band is wider than the effect any single balance pass produces. So:

> A pass cannot be judged from one before-run and one after-run, **even on sigma**. You need
> several runs on each side, and you compare the *mean per-run sigma*, never a pooled figure
> against a single run.

### The trap that nearly landed here

Comparing a **5-run pool** (before) against a **1-run sample** (after) showed sigma "worsening" by
40%. That number is meaningless: pooling averages out noise, so a pooled sigma is lower *by
construction*. It was measuring how many runs each side had, not what the pass did.

Compare like with like: pool-of-k against pool-of-k, or mean-per-run against mean-per-run.

## What this invalidates

Balance passes 1 through 4 in this project were each made from a **single run**. At this noise
floor, most of what they were correcting was dice. The RANGE_PROFILE comments preserve the
symptoms — `"buff overshot to 75% — pulled back"`, `"9%->75%->21%; settling between my two
overshoots"` — which read like tuning mistakes and are better explained as three noisy measurements
of a fighter who never moved much at all.

Only very large signals ever cleared the floor. A 65% Puffball against a 20% roster mean is a real
outlier and was worth acting on. A fighter at 31% versus another at 24% is, on one run, **nothing**.

## The method that works

1. **Run the same build at least 3 times**, ideally 5, with different seeds.
   ```bash
   node scripts/balance-tournament.mjs full --tournaments 24 --seed 4001 --out scripts/run1.json
   node scripts/balance-tournament.mjs full --tournaments 24 --seed 4002 --out scripts/run2.json
   ...
   ```
2. **Check the floor for your configuration.** Heat size, stock count and bracket shape all move it,
   so re-measure after changing any of them.
   ```bash
   node scripts/balance-noise.mjs scripts/run1.json scripts/run2.json ...
   ```
3. **Pool the runs into one pass.** Pooling divides the noise by `sqrt(k)`; the dead band shrinks
   automatically with the number of runs supplied.
   ```bash
   node scripts/auto-balance.mjs scripts/run1.json scripts/run2.json ... [--dry]
   ```
4. **Re-measure with the same number of runs** before believing the pass worked.
   ```bash
   node scripts/balance-report.mjs scripts/before1.json scripts/after1.json
   ```

## Reading the report

`balance-report.mjs` leads with **sigma**, the standard deviation of win rate across the roster. It
is the single number for "is this roster balanced" — but it can be lowered in bad ways, so the
report also prints:

- **KOs per game (roster mean)** — a big drop means the roster got *blunter*, not fairer.
- **biggest risers / fallers** — catches a pass that improved sigma by wrecking one fighter.
- **winless count** and **spread** — a fighter who cannot win at all is a bug, whatever sigma says.

## Rules of thumb

- Never act on a per-fighter deviation below the measured dead band. It is dice.
- Prefer many small passes over one large one; the levers interact and the measurement is noisy.
- Weight (`w`, via `koCap = 150 + w`) is survivability; `RANGE_PROFILE` is offence. A fighter who
  lands hits and still loses is dying too early — that is a weight problem, and no amount of damage
  will fix it. TV at 0.65 KOs/game on the second-heaviest body is the opposite: an offence problem.
- **Never rate fighters from `RANGE_PROFILE`.** It is a *compensation* table: passes lower damage
  for winners and raise it for losers, so its numbers are ANTI-correlated with real strength
  (measured −0.67). Rating from it ranks the roster backwards. See `FIGHTER_WINRATE`, which is baked
  from measured win rates by `scripts/bake-ratings.mjs`.

## If you want a quieter ruler

The noise floor is a property of the measurement, not of the game. To lower it without more runs,
change the runner rather than the game:

- **More tournaments per run** — the cheapest and most direct lever.
- **Round-robin instead of elimination** for the measurement, so every fighter plays the same number
  of games and early luck stops compounding. This is the single biggest structural improvement
  available, and it would cut the floor substantially.
- **Score on placement rather than wins** — placement uses information from every match rather than
  collapsing it to a boolean, so it carries far more signal per game.
