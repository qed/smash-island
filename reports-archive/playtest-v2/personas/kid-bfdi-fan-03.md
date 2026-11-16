# kid-bfdi-fan-03

**Profile.** kid-bfdi-fan-03: kid (12), first-time; goal: try every fighter; reads nothing, clicks the fighter they know from BFDI; mashes attack when excited.
**Hands.** reaction 421 ms (SD 62), key timing jitter 4.21 frames, slipped presses 10%, double-tap 48%, short hop 37%, 60 fps input, 1.83 s per menu target, 465 ms per word read (reads 8% of a screen).
**Keys.** arrows. **Patience.** menus 60 s, confused 33 s on one screen, rage-quits after 4 losses in a row.
**Plan.** ffa, boss, training, 1v1 (x passes).

## What they did
- 1v1 (seed 560464187): ended; 13 s of game on canyon, dealt 39, took 3, BOTTOM@0% fell, BOTTOM@3% fell; menus took them about 37 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 560464187 --arg persona=kid-bfdi-fan-03 --arg fighter=Marker --arg stage=canyon --arg kind=1v1`
- 1v1 (seed 806251148): ended; 99 s of game on skytower, dealt 240, took 72, BOTTOM@0% fell, BOTTOM@5% fell, BOTTOM@42% fell; menus took them about 37 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 806251148 --arg persona=kid-bfdi-fan-03 --arg fighter=Bonesaw --arg stage=skytower --arg kind=1v1`
- ffa (seed 432993788): ended; 93 s of game on shift, dealt 121, took 43, BOTTOM@16% fell, BOTTOM@20% by Bow, BOTTOM@0% fell; menus took them about 37 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 432993788 --arg persona=kid-bfdi-fan-03 --arg fighter=Cherries --arg stage=shift --arg kind=ffa`
- ffa (seed 202602434): ended; 76 s of game on shift, dealt 216, took 24, LEFT@10% by Ruler, BOTTOM@3% by Pillow; menus took them about 37 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 202602434 --arg persona=kid-bfdi-fan-03 --arg fighter=Nickel (II) --arg stage=shift --arg kind=ffa`
- training (seed 644728103): cap; menus took them about 56 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 644728103 --arg persona=kid-bfdi-fan-03 --arg fighter=Loser`
- boss (seed 763459426): ended; 39 s of game on goiky, dealt 205, took 133, LEFT@0% by ?, RIGHT@24% by a boss, RIGHT@103% by a boss, boss Firey Speaker Box; menus took them about 33 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 763459426 --arg persona=kid-bfdi-fan-03 --arg fighter=Silver Spoon --arg boss=2`
- ffa (seed 151557123): cap; 180 s of game on canyon, dealt 265, took 95, BOTTOM@0% fell, BOTTOM@28% fell, BOTTOM@67% by Salt; menus took them about 37 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 151557123 --arg persona=kid-bfdi-fan-03 --arg fighter=Candle --arg stage=canyon --arg kind=ffa`
- training (seed 708967093): cap; menus took them about 56 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 708967093 --arg persona=kid-bfdi-fan-03 --arg fighter=Lightning`
- boss (seed 457316041): ended; 127 s of game on goiky, dealt 95, took 78, RIGHT@68% by a boss, RIGHT@4% by a boss, RIGHT@34% by a boss, boss Springy; menus took them about 33 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 457316041 --arg persona=kid-bfdi-fan-03 --arg fighter=Goo --arg boss=10`
- boss (seed 474533579): ended; 67 s of game on goiky, dealt 275, took 89, LEFT@22% by a boss, LEFT@22% by a boss, RIGHT@160% by a boss, boss Springy; menus took them about 33 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 474533579 --arg persona=kid-bfdi-fan-03 --arg fighter=Fern --arg boss=10`
- boss (seed 495053437): ended; 75 s of game on goiky, dealt 309, took 219, RIGHT@84% by a boss, TOP@144% by a boss, TOP@107% by a boss, boss Firey Speaker Box; menus took them about 33 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 495053437 --arg persona=kid-bfdi-fan-03 --arg fighter=Rocky --arg boss=2`
- boss (seed 248555603): cap; 180 s of game on goiky, dealt 297, took 0, RIGHT@79% by ?, TOP@142% by ?, boss Evil Leafy; menus took them about 33 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 248555603 --arg persona=kid-bfdi-fan-03 --arg fighter=Magnet --arg boss=6`
- training (seed 18836202): cap; menus took them about 56 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 18836202 --arg persona=kid-bfdi-fan-03 --arg fighter=Snowball`
- 1v1 (seed 460920609): ended; 24 s of game on wind, dealt 48, took 13, BOTTOM@5% by Paper, BOTTOM@8% by Paper; menus took them about 37 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 460920609 --arg persona=kid-bfdi-fan-03 --arg fighter=Microphone --arg stage=wind --arg kind=1v1`
- training (seed 607687128): cap; menus took them about 56 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 607687128 --arg persona=kid-bfdi-fan-03 --arg fighter=Barf Bag`
- ffa (seed 947452815): ended; 85 s of game on pillars, dealt 504, took 183, LEFT@85% by Yin-Yang, RIGHT@75% by Naily; menus took them about 42 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 947452815 --arg persona=kid-bfdi-fan-03 --arg fighter=Nickel (II) --arg stage=pillars --arg kind=ffa`
- training (seed 405358835): cap; menus took them about 56 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 405358835 --arg persona=kid-bfdi-fan-03 --arg fighter=Grassy`
- 1v1 (seed 154235361): ended; 13 s of game on yoyle, dealt 2, took 3, BOTTOM@0% fell, BOTTOM@0% fell, BOTTOM@3% by Ruler; menus took them about 42 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 154235361 --arg persona=kid-bfdi-fan-03 --arg fighter=Lifering --arg stage=yoyle --arg kind=1v1`
- ffa (seed 338921785): cap; 180 s of game on ice, dealt 436, took 97, BOTTOM@0% fell, BOTTOM@0% fell, RIGHT@97% by Cherries; menus took them about 37 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 338921785 --arg persona=kid-bfdi-fan-03 --arg fighter=Cheesy --arg stage=ice --arg kind=ffa`
- 1v1 (seed 898102666): ended; 51 s of game on wind, dealt 201, took 6, BOTTOM@0% fell, BOTTOM@6% fell; menus took them about 42 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 898102666 --arg persona=kid-bfdi-fan-03 --arg fighter=Ice Cube --arg stage=wind --arg kind=1v1`

## Where they got stuck or confused
- BUG cant: Goo: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- 1v1: was knocked out 4 s into the match (BOTTOM at 0%)
- 1v1: 1 presses slipped (a person's missed keys)
- 1v1: was knocked out 6 s into the match (BOTTOM at 0%)
- 1v1: 6 presses slipped (a person's missed keys)
- ffa: 3 presses slipped (a person's missed keys)
- ffa: was knocked out 2 s into the match (LEFT at 10%)
- ffa: 2 presses slipped (a person's missed keys)
- training: 4 presses slipped (a person's missed keys)
- boss: was knocked out 1 s into the match (LEFT at 0%)
- boss: 5 presses slipped (a person's missed keys)
- ffa: was knocked out 4 s into the match (BOTTOM at 0%)
- ffa: 8 presses slipped (a person's missed keys)
- training: 10 presses slipped (a person's missed keys)
- boss: was knocked out 9 s into the match (RIGHT at 68%)
- boss: was knocked out 10 s into the match (LEFT at 22%)
- boss: 6 presses slipped (a person's missed keys)
- boss: was knocked out 12 s into the match (RIGHT at 79%)
- boss: 4 presses slipped (a person's missed keys)
- training: was knocked out 4 s into the match (LEFT at 10%)
- training: 9 presses slipped (a person's missed keys)
- 1v1: was knocked out 3 s into the match (BOTTOM at 5%)
- 1v1: would have rage-quit: 4 losses in a row (limit 4)
- training: was knocked out 4 s into the match (LEFT at 31%)
- training: 11 presses slipped (a person's missed keys)
- ffa: 7 presses slipped (a person's missed keys)
- training: 7 presses slipped (a person's missed keys)
- 1v1: was knocked out 5 s into the match (BOTTOM at 0%)
- ffa: was knocked out 1 s into the match (BOTTOM at 0%)
- ffa: 4 presses slipped (a person's missed keys)
- 1v1: 9 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [FEEL] long-match: ffa match on goiky was still going after 2 min of game time (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage skytower) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.3) in ffa; recent move: Marker|ink.special
- [FEEL] jank-teleport (JANK): Remote moved 151 px in one frame (ffa; last move: Remote|battery.up)
- [FEEL] jank-input-latency (JANK): Marker: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 56 ms frame (median 0.2) in ffa; recent move: Bonesaw|coresaw.jab
- [FEEL] jank-input-latency (JANK): Bonesaw: atk took 6 frames (100 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in ffa; recent move: Bonesaw|coresaw.special
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.6) in ffa; recent move: Cherries|cherries.dt
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.9) in ffa; recent move: Cherries|cherries.jab
- [SLOW] jank-spike (JANK): a 70 ms frame (median 0.7) in ffa; recent move: Cherries|cherries.smash
- [UI] stray-banner: a match shows "KO'd by Blocky − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.5) in ffa; recent move: Cherries|cherries.special
- [UI] stray-banner: a match shows "KO'd by Bow − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.3) in ffa; recent move: Bow|chair.jab
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ffa; recent move: Blocky|anvil.jab
- [FEEL] jank-teleport (JANK): Bow moved 240 px in one frame (ffa; last move: Bow|chair.special)
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.3) in ffa; recent move: Blocky|anvil.up
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.2) in ffa; recent move: Bow|chair.special
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in ffa; recent move: Blocky|anvil.ut
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in ffa; recent move: Blocky|anvil.dt
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.3) in ffa; recent move: Blocky|anvil.finisher
- [UI] stray-banner: a match shows "KO'd by Ruler − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.8) in ffa; recent move: Nickel (II)|snark.special
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.7) in ffa; recent move: Nickel (II)|snark.jab
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.6) in ffa; recent move: Nickel (II)|snark.dsmash
- [FEEL] jank-teleport (JANK): Bracelety moved 163 px in one frame (ffa; last move: Bracelety|sign.up)
- [SLOW] jank-spike (JANK): a 43 ms frame (median 1.0) in ffa; recent move: Nickel (II)|snark.smash
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.7) in ffa; recent move: Nickel (II)|snark.na
- [FEEL] jank-input-latency (JANK): Nickel (II): atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.5) in ffa; recent move: Ruler|measure.up
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.5) in ffa; recent move: Ruler|measure.jab
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.6) in ffa; recent move: Pillow|fluff.up
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.6) in ffa; recent move: Pillow|fluff.jab
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.4) in ffa; recent move: Ruler|measure.ba
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in ffa; recent move: Loser|cool.jab
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: Loser|cool.smash

## When they would have quit
- 1v1: would have rage-quit: 4 losses in a row (limit 4)
- 1v1: would have rage-quit: 4 losses in a row (limit 4)
