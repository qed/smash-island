# Ledgeguarding the owner's way, tested

2026-10-28. Live build fbc9009. Nothing in the game was changed.

The owner's words: "by ledgeguarding, I mean going to the ledge, and when opponents try to get back up, use a projectile, or if they jump, use a strong jab."

## The short answer

**It works, by a modest amount, and it works because of the shots and the jab together.** Neither part works by itself.

| | Control (no ledgeguard) | The owner's way | z |
|---|---|---|---|
| Wins | 36.8% (53/144) | **50.0%** (72/144) | **2.3** |
| Damage share | 45.9% | 48.9% | **2.3** |
| Damage dealt per off-stage trip | 1.48% | **2.24%** | **3.7** |
| Foe KO'd, per trip it could guard (40+ frames) | 2.1% | **4.6%** | **2.5** |
| Foe KO'd, per trip (all trips) | 9.1% | 10.4% | 1.0 |
| Foe gets back, per trip | 89.8% | 88.5% | |
| Guarding player gets hit, per trip | 28.9% | 25.5% | -1.6 |
| Guarding player falls, per trip | 1.4% | 1.2% | |

A z of 2 or more is a real effect. The per-trip z numbers count trips as if they were independent, so read them as a bit too generous. The match-level ones (wins, damage share) do not have that problem.

- **The ledgeguard turns about 1 extra match in 7 into a win.** Matches where the player ended a stock behind fell from 37% to 28%. Of the matches that ended on even stocks, it won 40 of 71 instead of 28 of 66, thanks to the damage dealt while guarding.
- **It does not make the CPU die much more often.** 71% of all KOs happen in trips under 2/3 s: the CPU is launched straight out and dies before anyone could get to the ledge. On the trips where there is time to guard, the KO rate doubles, from 2.1% to 4.6%. But that is still only 1 trip in 22. Expert CPUs get back about 9 times in 10 either way.
- **It is safe.** Standing at the ledge did not get the player hit more or knocked off more.

## Which part does the work

| | Wins (z vs control) | Damage per trip (z) | KO per guardable trip (z) |
|---|---|---|---|
| Control | 36.8% | 1.48 | 2.1% |
| Shots only (ledge, shots, no jab) | 41.1% (0.7) | 2.03 (2.5) | 3.9% (1.8) |
| Jab only (ledge, jab, no shots) | 33.0% (-0.6) | 1.60 (0.6) | 1.5% (-0.8) |
| **The owner's way (shots + jab)** | **50.0% (2.3)** | **2.24 (3.7)** | **4.6% (2.5)** |
| Shots + a smash instead of the jab | 42.4% (1.0) | 2.76 (5.0) | **7.1% (4.3)** |

- **The shots do most of the damage.** In the owner's way, the shots dealt 0.60% per trip and the jab 0.17%. A shot landed on 7.6% of trips. The jab landed on only 2.2%.
- **The jab alone is worth nothing.** Standing at the ledge waiting to jab gave no gain at all. Added to the shots, it is what lifts the result from "maybe" to "real". Leave Lightning out (her shot is special, see below), and the owner's way still wins 46.9% against 32.3% (z 2.1). Shots alone then give 38.5% (z 0.9) and the jab alone 38.5% (z 0.9).
- **A "strong jab" read as the smash (V) KOs more often.** It doubles the guardable-trip KO rate again (7.1%, z 4.3) and deals the most damage. But it did not win more matches (42%, z 1.0). The game has no "strong jab" move, so the main test used the jab (X) toward the foe, and this smash version was run on the side. (In the smash version, a smash that lands late was sometimes counted as a shot, so its shot/smash split is not reliable. Its totals are.)

## Why the shots do so little: Expert CPUs come back high

The owner pictures the foe below the ledge trying to climb back up. Expert CPUs almost never do that. Across 3,839 off-stage trips, **the CPU was below the ledge's height for only 2% of the time.** An Expert drifts back toward the stage first and keeps its jump until it sinks to ledge height (recSmart). After a launch it is usually still above the stage when it gets there, so it floats in over the ledge from above and lands near it.

A shot fired straight ahead from the ledge passes under a foe that is 100 to 200 px higher. The scripted player led every shot: it fired only when the shot would meet the foe where the foe would be. So it fired on only 1 trip in 6. A player who fires whenever the foe is off the stage would mostly hit the air.

## By fighter

16 matches per arm per fighter, so each row is noisy (about ±12 points on wins). Damage per trip is the steadier number.

| Fighter | Shot | Wins: control → owner's way | Damage per trip | Notes |
|---|---|---|---|---|
| **Lightning** | Chain Bolt (aims itself, 250 px, any angle) | 31% → 44% | **0.55 → 3.35 (z 5.7)** | Damage share 33.7% → 44.9% (z 4.1). The only shot that reaches a foe above the ledge. With the smash: 51% share, 50% wins. |
| **Fries** | three straight fries | 31% → **69%** (z 2.1) | 1.84 → 2.42 | The biggest win gain. |
| Pen | boomerang cap | 38% → 63% (z 1.4) | 1.62 → 1.93 | Fewer hits taken (31% → 23% of trips). |
| Tennis Ball | arcing serve | 38% → 56% (z 1.1) | 1.18 → 1.87 | KO per trip 5% → 12% (z 1.6). |
| Firey Jr. | fast flat fireball | 25% → 44% (z 1.1) | 1.22 → 1.68 | His jab does the work here (0.45 per trip). Jab only: 56% wins, and he was hit on 16% of trips instead of 30% (z -2.5). |
| Ruby | gem bolt (arcs, via her jab) | 13% → 13% | 1.49 → 1.63 | No gain. Its arc rarely meets a high foe (0.05 shots per trip). |
| Puffball | spit (via her jab) | 50% → 38% | 3.54 → 5.03 | Worse on wins. She fell on 7.9% of guard trips instead of 1.2%. With the smash: 63% wins, 36% KO per trip. |
| Snowball | none (jab only) | 56% → **75%** (z 1.1) | 0.85 → 1.44 | |
| Book | none (jab only) | 50% → 50% | 1.55 → 0.74 | Hit on 7% of trips instead of 21%. |

- **Fighters without a projectile** (jab part only, 32 matches each): 53% → 63% wins (z 0.8), with guardable-trip KOs 0.7% → 4.1% (z 1.8). That may help, but it is not proven.
- **By stage:**
  - Goiky Field: 39% → 54% wins (z 1.8), damage per trip 1.73 → 2.95 (z 3.7).
  - Yoyleland (small decks, a hatch in the middle, low gravity): 35% → 46% (z 1.4), with KO per trip 4.0% → 6.5% (z 1.7). Low gravity leaves even more of the CPU's return above the ledge.

## How this was tested

- **The real game**, run headless (jsdom), on two stages with real edges:
  - **Goiky Field**: one floor, with open air and a drop on both sides.
  - **Yoyleland**, the small stage: two decks of 374 px with a hatch between them, in low gravity.
  - 1v1, 2 stocks, capped at 100 seconds. Both fighters start on the floor.
- **Mirror matches against an Expert CPU.** The player and the CPU use the same fighter. Each match is played from both sides, so the matchup and the starting side cancel out. That gives 9 different CPU fighters.
- **The players:**
  - 7 shooters: Tennis Ball, Ruby, Pen, Firey Jr., Fries, Lightning and Puffball.
  - 2 without a projectile: Snowball and Book, both with a strong jab (8% / knockback 9 and 8% / 8). They only use the jab part.
- **The player is a script that presses real keys, with the Expert's own eyes and hands.** It sees the foe 1/6 s (10 frames) late and decides at most 7.5 times a second. It reads only what is on screen: where the foe is and how it is moving, whether it is swinging or stunned, its damage, and the stage.
- **It plays normally on stage**, the same way as the control in the earlier tactics test.
- **When the foe is off the stage, it ledgeguards the owner's way:**
  - It walks to the end of the floor the foe is drifting back toward and stands there facing out.
  - **The shot:** while the foe is beside or below the ledge, it fires only when the shot will meet the foe. It leads the shot, using its own shot's flight (measured once, as a player learns it) and the foe's drift and fall. Lightning's Chain Bolt aims itself: she fires when the foe will be within 250 px in front of her. Ruby also charges her next gem bolt while the foe is far away.
  - **The jab:** when the foe jumps up and arrives within jab reach, it presses the jab (X) toward it, timed for where the foe will be.
- **The control** is the same player without the ledgeguard. While the foe is off the stage, it stays where it is and waits.
- **Sample:** 656 matches (144 each for the control, the owner's way and the smash version; 112 each for shots only and jab only), with 3,839 off-stage trips after a hit.
- **A trip** is counted from when the foe was hit off the stage until it lands on the floor or is KO'd. "Hit during the trip" counts any damage the player took from the start of the trip until 1/2 s after it ended.
- **"Works" means it works for this script.** A person who also jumps to shoot, or uses an up-tilt on a foe coming down from above, might do better. That is not what the owner described, so it was not tested.

## Files

The scripts and raw results are in the session scratchpad, not the repo:
`C:\Users\carad\AppData\Local\Temp\claude\C--Users-carad--claude\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\ledgeguard\`
- `player-src.js`: the scripted player, the ledgeguard and the measurements.
- `run.mjs`: the runner.
- `an.mjs` and `an2.mjs`: the analysis.
- `g.jsonl` (Goiky Field) and `y.jsonl` (Yoyleland): one line per match.
