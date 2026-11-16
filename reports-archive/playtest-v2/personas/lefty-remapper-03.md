# lefty-remapper-03

**Profile.** lefty-remapper-03: adult (27), casual; goal: remap keys to IJKL / ASD for the left hand, then play; goes to Settings > Keys before anything else.
**Hands.** reaction 274 ms (SD 53), key timing jitter 2.69 frames, slipped presses 5%, double-tap 61%, short hop 45%, 60 fps input, 1.21 s per menu target, 286 ms per word read (reads 26% of a screen).
**Keys.** lefty. **Patience.** menus 171 s, confused 41 s on one screen, rage-quits after 5 losses in a row.
**Plan.** ffa, training, 1v1 (x passes).

## What they did
- 1v1 (seed 10482854): ended; 43 s of game on pillars, dealt 109, took 5, no KOs; menus took them about 118 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 10482854 --arg persona=lefty-remapper-03 --arg fighter=Coiny --arg stage=pillars --arg kind=1v1`
- 1v1 (seed 629655291): ended; 78 s of game on wind, dealt 207, took 30, BOTTOM@2% fell, BOTTOM@0% fell, BOTTOM@12% by Clover; menus took them about 114 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 629655291 --arg persona=lefty-remapper-03 --arg fighter=Fern --arg stage=wind --arg kind=1v1`
- training (seed 30482489): cap; menus took them about 145 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 30482489 --arg persona=lefty-remapper-03 --arg fighter=Tea Kettle`
- ffa (seed 713169742): cap; 180 s of game on bigincin, dealt 435, took 434, TOP@188% by an assist/hazard, TOP@146% by Book; menus took them about 118 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 713169742 --arg persona=lefty-remapper-03 --arg fighter=Clover --arg stage=bigincin --arg kind=ffa`
- ffa (seed 1999953): ended; 133 s of game on skytower, dealt 329, took 124, RIGHT@79% fell, RIGHT@44% by Teardrop; menus took them about 114 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 1999953 --arg persona=lefty-remapper-03 --arg fighter=Bot --arg stage=skytower --arg kind=ffa`
- ffa (seed 860051606): cap; 180 s of game on fortress, dealt 325, took 302, RIGHT@120% by Match; menus took them about 114 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 860051606 --arg persona=lefty-remapper-03 --arg fighter=Loser --arg stage=fortress --arg kind=ffa`
- training (seed 729761503): cap; menus took them about 145 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 729761503 --arg persona=lefty-remapper-03 --arg fighter=Bot`
- training (seed 66652057): cap; menus took them about 145 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 66652057 --arg persona=lefty-remapper-03 --arg fighter=Rocky`
- training (seed 10125607): cap; menus took them about 145 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 10125607 --arg persona=lefty-remapper-03 --arg fighter=Puffball`
- training (seed 513387133): cap; menus took them about 145 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 513387133 --arg persona=lefty-remapper-03 --arg fighter=Dough`
- ffa (seed 824368706): cap; 180 s of game on skytower, dealt 440, took 171, no KOs; menus took them about 118 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 824368706 --arg persona=lefty-remapper-03 --arg fighter=Fern --arg stage=skytower --arg kind=ffa`
- ffa (seed 478575747): cap; 180 s of game on grandplains, dealt 134, took 20, BOTTOM@0% fell, BOTTOM@4% fell, BOTTOM@16% fell; menus took them about 118 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 478575747 --arg persona=lefty-remapper-03 --arg fighter=Coiny --arg stage=grandplains --arg kind=ffa`
- 1v1 (seed 215592139): ended; 66 s of game on incin, dealt 180, took 164, RIGHT@52% by Candle; menus took them about 114 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 215592139 --arg persona=lefty-remapper-03 --arg fighter=Bracelety --arg stage=incin --arg kind=1v1`
- 1v1 (seed 669751511): ended; 166 s of game on bigincin, dealt 358, took 314, RIGHT@29% by ?, RIGHT@0% by ?, MAX@245% by Goo; menus took them about 114 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 669751511 --arg persona=lefty-remapper-03 --arg fighter=Ruler --arg stage=bigincin --arg kind=1v1`
- 1v1 (seed 923437220): cap; 180 s of game on dreamisle, dealt 256, took 117, BOTTOM@16% by David, BOTTOM@85% by David; menus took them about 114 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 923437220 --arg persona=lefty-remapper-03 --arg fighter=Teardrop --arg stage=dreamisle --arg kind=1v1`

## Where they got stuck or confused
- STUCK match-never-ends: ffa match on fortress is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
- BUG cant: Dough: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- 1v1: remapped keys through Settings > Keys (7 rows, about 40 s of clicking)
- 1v1: 5 presses slipped (a person's missed keys)
- 1v1: was knocked out 9 s into the match (BOTTOM at 2%)
- 1v1: 9 presses slipped (a person's missed keys)
- training: remapped keys through Settings > Keys (7 rows, about 40 s of clicking)
- training: 9 presses slipped (a person's missed keys)
- ffa: remapped keys through Settings > Keys (7 rows, about 40 s of clicking)
- ffa: 12 presses slipped (a person's missed keys)
- ffa: 7 presses slipped (a person's missed keys)
- ffa: 8 presses slipped (a person's missed keys)
- training: 13 presses slipped (a person's missed keys)
- training: 4 presses slipped (a person's missed keys)
- training: 11 presses slipped (a person's missed keys)
- ffa: 11 presses slipped (a person's missed keys)
- ffa: was knocked out 11 s into the match (BOTTOM at 0%)
- ffa: 4 presses slipped (a person's missed keys)
- 1v1: 4 presses slipped (a person's missed keys)
- 1v1: 14 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 8 scenes)
- [FEEL] long-match: ffa match on goiky was still going after 2 min of game time (in 5 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage dreamisle) (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage fortress) (in 3 scenes)
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 9838 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.2) in ffa; recent move: Coiny|slap.special
- [SLOW] jank-spike (JANK): a 62 ms frame (median 0.2) in ffa; recent move: Coiny|slap.smash
- [SLOW] jank-spike (JANK): a 80 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.1) in ffa; recent move: Coiny|slap.jab
- [SLOW] jank-spike (JANK): a 48 ms frame (median 0.2) in ffa; recent move: Coiny|slap.ua
- [SLOW] jank-spike (JANK): a 178 ms frame (median 0.2) in ffa; recent move: Coiny|slap.grab
- [SLOW] jank-spike (JANK): a 65 ms frame (median 0.2) in ffa; recent move: Coiny|slap.fa
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in ffa; recent move: Coiny|slap.na
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 5999 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: Fern|photo.special
- [UI] stray-banner: a match shows "KO'd by Clover − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in ffa; recent move: Fern|photo.ba
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in ffa; recent move: Fern|photo.jab
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.2) in ffa; recent move: Fern|photo.finisher
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.2) in ffa; recent move: Fern|photo.fa
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ffa; recent move: Clover|clover.fa
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.2) in ffa; recent move: Fern|photo.na
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 6810 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 136 ms frame (median 0.1) in ffa; recent move: Tea Kettle|hors.jab
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in ffa; recent move: Tea Kettle|hors.dt
- [SLOW] jank-spike (JANK): a 58 ms frame (median 0.1) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 57 ms frame (median 0.1) in ffa; recent move: Tea Kettle|hors.na
- [SLOW] jank-spike (JANK): a 136 ms frame (median 0.1) in ffa; recent move: Tea Kettle|hors.smash
- [SLOW] jank-spike (JANK): a 93 ms frame (median 0.3) in ffa; recent move: Tea Kettle|hors.special
- [SLOW] jank-spike (JANK): a 80 ms frame (median 0.3) in ffa; recent move: Tea Kettle|hors.fa
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.1) in ffa; recent move: Tea Kettle|hors.ua
- [SLOW] jank-spike (JANK): a 122 ms frame (median 0.1) in ffa; recent move: Tea Kettle|hors.finisher
- [FEEL] jank-input-latency (JANK): Tea Kettle: jump took 14 frames (234 ms) from the key to the first change on the fighter
- [FEEL] jank-input-latency (JANK): Tea Kettle: special took 8 frames (134 ms) from the key to the first change on the fighter
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 5937 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 71 ms frame (median 0.6) in ffa; recent move: Book|define.up
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.4) in ffa; recent move: Saw|saw.jab
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.4) in ffa; recent move: Clover|clover.smash
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.3) in ffa; recent move: Clover|clover.jab
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.8) in ffa; recent move: Clover|clover.fa

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
