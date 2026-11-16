# lefty-remapper-04

**Profile.** lefty-remapper-04: adult (31), casual; goal: remap keys to IJKL / ASD for the left hand, then play; goes to Settings > Keys before anything else.
**Hands.** reaction 259 ms (SD 58), key timing jitter 2.64 frames, slipped presses 6%, double-tap 71%, short hop 39%, 60 fps input, 0.92 s per menu target, 251 ms per word read (reads 40% of a screen).
**Keys.** lefty. **Patience.** menus 143 s, confused 44 s on one screen, rage-quits after 5 losses in a row.
**Plan.** ffa, training, 1v1 (x passes).

## What they did
- 1v1 (seed 885421962): ended; 56 s of game on pillars, dealt 179, took 164, LEFT@100% by Clover; menus took them about 140 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 885421962 --arg persona=lefty-remapper-04 --arg fighter=Sidewalky --arg stage=pillars --arg kind=1v1`
- ffa (seed 541926681): ended; 59 s of game on dreamisle, dealt 168, took 176, BOTTOM@43% by Puffball, RIGHT@133% by Bomb; menus took them about 138 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 541926681 --arg persona=lefty-remapper-04 --arg fighter=Liy --arg stage=dreamisle --arg kind=ffa`
- 1v1 (seed 730818084): cap; 180 s of game on tlc, dealt 354, took 247, BOTTOM@17% fell; menus took them about 138 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 730818084 --arg persona=lefty-remapper-04 --arg fighter=Golf Ball --arg stage=tlc --arg kind=1v1`
- ffa (seed 784813388): ended; 152 s of game on yoyle, dealt 467, took 177, LEFT@166% by Blocky, BOTTOM@11% fell; menus took them about 140 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 784813388 --arg persona=lefty-remapper-04 --arg fighter=Pencil --arg stage=yoyle --arg kind=ffa`
- training (seed 517326942): cap; menus took them about 177 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 517326942 --arg persona=lefty-remapper-04 --arg fighter=Salt`
- training (seed 4556929): cap; menus took them about 177 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 4556929 --arg persona=lefty-remapper-04 --arg fighter=Woody`
- ffa (seed 589904972): cap; 180 s of game on dreamisle, dealt 856, took 274, LEFT@139% by Pen, LEFT@108% by Pen; menus took them about 138 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 589904972 --arg persona=lefty-remapper-04 --arg fighter=Lollipop --arg stage=dreamisle --arg kind=ffa`
- training (seed 832677975): cap; menus took them about 177 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 832677975 --arg persona=lefty-remapper-04 --arg fighter=Candle`
- training (seed 265863095): cap; menus took them about 177 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 265863095 --arg persona=lefty-remapper-04 --arg fighter=Tree`
- 1v1 (seed 696097738): ended; 127 s of game on yoyle, dealt 375, took 60, BOTTOM@3% fell, TOP@53% by Pin; menus took them about 140 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 696097738 --arg persona=lefty-remapper-04 --arg fighter=Bot --arg stage=yoyle --arg kind=1v1`
- ffa (seed 883041575): ended; 106 s of game on wind, dealt 136, took 41, BOTTOM@18% by Cammy, BOTTOM@21% by Knife; menus took them about 138 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 883041575 --arg persona=lefty-remapper-04 --arg fighter=Teardrop --arg stage=wind --arg kind=ffa`
- training (seed 38357164): cap; menus took them about 177 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 38357164 --arg persona=lefty-remapper-04 --arg fighter=Rose`
- 1v1 (seed 33405662): ended; 101 s of game on yoyle, dealt 160, took 62, no KOs; menus took them about 138 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 33405662 --arg persona=lefty-remapper-04 --arg fighter=Sidewalky --arg stage=yoyle --arg kind=1v1`
- ffa (seed 993673800): cap; 180 s of game on yoyle, dealt 223, took 151, BOTTOM@116% by Balloon, BOTTOM@0% fell; menus took them about 140 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 993673800 --arg persona=lefty-remapper-04 --arg fighter=Teardrop --arg stage=yoyle --arg kind=ffa`
- 1v1 (seed 25421296): cap; 180 s of game on ice, dealt 345, took 280, LEFT@153% by Paper, TOP@120% by Paper; menus took them about 138 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 25421296 --arg persona=lefty-remapper-04 --arg fighter=Magnet --arg stage=ice --arg kind=1v1`

## Where they got stuck or confused
- BUG cant: Lollipop: "finisher (V+C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Tree: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Teardrop: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Magnet: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- 1v1: remapped keys through Settings > Keys (7 rows, about 46 s of clicking)
- 1v1: 4 presses slipped (a person's missed keys)
- ffa: remapped keys through Settings > Keys (7 rows, about 46 s of clicking)
- ffa: 10 presses slipped (a person's missed keys)
- 1v1: 27 presses slipped (a person's missed keys)
- ffa: 15 presses slipped (a person's missed keys)
- training: remapped keys through Settings > Keys (7 rows, about 46 s of clicking)
- training: 8 presses slipped (a person's missed keys)
- training: 6 presses slipped (a person's missed keys)
- ffa: 31 presses slipped (a person's missed keys)
- training: 11 presses slipped (a person's missed keys)
- training: 9 presses slipped (a person's missed keys)
- 1v1: 19 presses slipped (a person's missed keys)
- ffa: was knocked out 2 s into the match (BOTTOM at 18%)
- ffa: 3 presses slipped (a person's missed keys)
- training: 13 presses slipped (a person's missed keys)
- 1v1: 9 presses slipped (a person's missed keys)
- ffa: 18 presses slipped (a person's missed keys)
- 1v1: 29 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [FEEL] long-match: ffa match on goiky was still going after 2 min of game time (in 5 scenes)
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.2) in ffa; recent move: Sidewalky|slam.jab (in 2 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 2 scenes)
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 5198 ms before the next screen was ready
- [UI] stray-banner: a match shows "KO'd by Clover − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage pillars)
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4757 ms before the next screen was ready
- [FEEL] jank-input-latency (JANK): Liy: smash took 14 frames (234 ms) from the key to the first change on the fighter
- [UI] stray-banner: a match shows "KO'd by Puffball − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.3) in ffa; recent move: Liy|switch.dt
- [SLOW] jank-spike (JANK): a 49 ms frame (median 0.3) in ffa; recent move: Puffball|fly.dt
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.3) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.4) in ffa; recent move: Puffball|fly.up
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: Bomb|fsburst
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 5636 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.2) in ffa; recent move: Golf Ball|zapshooter.da
- [FEEL] jank-input-latency (JANK): Golf Ball: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ffa; recent move: Golf Ball|zapshooter.ua
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in ffa; recent move: Golf Ball|zapshooter.jab
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ffa; recent move: Golf Ball|zapshooter.fa
- [SLOW] jank-spike (JANK): a 54 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.3) in ffa; recent move: Golf Ball|zapshooter.special
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.3) in ffa; recent move: Golf Ball|zapshooter.usmash
- [SLOW] jank-spike (JANK): a 52 ms frame (median 0.2) in ffa; recent move: Golf Ball|zapshooter.down
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in ffa; recent move: Magnet|bestie.up
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.2) in ffa; recent move: Magnet|bestie.ba
- [FEEL] jank-hitstop-drift (JANK): Golf Ball moved 14 px in one frame while in hitstop (ffa; last move: Golf Ball|zapshooter.special)
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.2) in ffa; recent move: Magnet|bestie.finisher
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage tlc)
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in ffa; recent move: Golf Ball|zapshooter.dt
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.2) in ffa; recent move: Golf Ball|zapshooter.ut
- [FEEL] long-match: ffa match on tlc was still going after 3 min of game time
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 5012 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 50 ms frame (median 0.5) in ffa; recent move: Liy|switch.jab
- [FEEL] jank-input-latency (JANK): Pencil: atk took 4 frames (67 ms) from the key to the first change on the fighter
- [FEEL] jank-teleport (JANK): Toothpaste moved 157 px in one frame (ffa; last move: Toothpaste|paste.up)
- [SLOW] jank-spike (JANK): a 68 ms frame (median 0.6) in ffa; recent move: Pencil|van.ba
- [SLOW] jank-spike (JANK): a 49 ms frame (median 0.3) in ffa; recent move: Pencil|van.smash
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.3) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 48 ms frame (median 0.4) in ffa; recent move: Pencil|van.special

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
