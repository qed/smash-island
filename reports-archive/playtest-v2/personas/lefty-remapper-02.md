# lefty-remapper-02

**Profile.** lefty-remapper-02: adult (36), casual; goal: remap keys to IJKL / ASD for the left hand, then play; goes to Settings > Keys before anything else.
**Hands.** reaction 328 ms (SD 54), key timing jitter 2.65 frames, slipped presses 5%, double-tap 62%, short hop 46%, 60 fps input, 1.22 s per menu target, 280 ms per word read (reads 31% of a screen).
**Keys.** lefty. **Patience.** menus 177 s, confused 36 s on one screen, rage-quits after 5 losses in a row.
**Plan.** ffa, training, 1v1 (x passes).

## What they did
- 1v1 (seed 201069830): ended; 85 s of game on goiky, dealt 228, took 124, LEFT@55% by Cheesy; menus took them about 128 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 201069830 --arg persona=lefty-remapper-02 --arg fighter=Microphone --arg stage=goiky --arg kind=1v1`
- 1v1 (seed 991036154): ended; 128 s of game on skytower, dealt 162, took 23, BOTTOM@13% by Fern, BOTTOM@11% fell; menus took them about 128 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 991036154 --arg persona=lefty-remapper-02 --arg fighter=Cammy --arg stage=skytower --arg kind=1v1`
- ffa (seed 588507312): ended; 110 s of game on pillars, dealt 416, took 286, LEFT@34% by Gelatin, LEFT@100% by Gelatin, RIGHT@127% by Gelatin; menus took them about 128 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 588507312 --arg persona=lefty-remapper-02 --arg fighter=Liy --arg stage=pillars --arg kind=ffa`
- training (seed 152219022): cap; menus took them about 164 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 152219022 --arg persona=lefty-remapper-02 --arg fighter=David`
- ffa (seed 491574115): cap; 180 s of game on grandplains, dealt 193, took 89, BOTTOM@43% fell, BOTTOM@5% fell; menus took them about 128 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 491574115 --arg persona=lefty-remapper-02 --arg fighter=TV --arg stage=grandplains --arg kind=ffa`
- training (seed 426392469): cap; menus took them about 164 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 426392469 --arg persona=lefty-remapper-02 --arg fighter=Poppy`
- ffa (seed 64810760): cap; 180 s of game on canyon, dealt 264, took 135, BOTTOM@117% fell; menus took them about 128 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 64810760 --arg persona=lefty-remapper-02 --arg fighter=Baseball --arg stage=canyon --arg kind=ffa`
- training (seed 443751487): cap; menus took them about 164 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 443751487 --arg persona=lefty-remapper-02 --arg fighter=Teardrop`
- training (seed 406769184): cap; menus took them about 164 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 406769184 --arg persona=lefty-remapper-02 --arg fighter=Teddy Bear`
- ffa (seed 995829957): ended; 64 s of game on forest, dealt 245, took 373, LEFT@150% by Bracelety, RIGHT@89% by Bonesaw, TOP@133% by Apple; menus took them about 132 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 995829957 --arg persona=lefty-remapper-02 --arg fighter=Silver Spoon --arg stage=forest --arg kind=ffa`
- 1v1 (seed 249221406): ended; 33 s of game on yoyle, dealt 37, took 10, BOTTOM@0% fell, BOTTOM@3% by Coiny; menus took them about 128 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 249221406 --arg persona=lefty-remapper-02 --arg fighter=Dora --arg stage=yoyle --arg kind=1v1`
- ffa (seed 156042854): cap; 180 s of game on tlc, dealt 291, took 325, MAX@164% by Tennis Ball, MAX@137% by an assist/hazard; menus took them about 132 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 156042854 --arg persona=lefty-remapper-02 --arg fighter=Trophy --arg stage=tlc --arg kind=ffa`
- training (seed 895623042): cap; menus took them about 164 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 895623042 --arg persona=lefty-remapper-02 --arg fighter=Poppy`
- 1v1 (seed 786761550): ended; 133 s of game on grandplains, dealt 217, took 73, BOTTOM@0% fell, BOTTOM@0% fell, LEFT@73% by Bomb; menus took them about 128 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 786761550 --arg persona=lefty-remapper-02 --arg fighter=Pen --arg stage=grandplains --arg kind=1v1`
- 1v1 (seed 797906608): ended; 132 s of game on grandplains, dealt 146, took 65, BOTTOM@0% fell, BOTTOM@41% by Balloony, BOTTOM@0% fell; menus took them about 128 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 797906608 --arg persona=lefty-remapper-02 --arg fighter=Match --arg stage=grandplains --arg kind=1v1`

## Where they got stuck or confused
- BUG cant: David: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Baseball: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Teddy Bear: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Pen: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- 1v1: remapped keys through Settings > Keys (7 rows, about 44 s of clicking)
- 1v1: 6 presses slipped (a person's missed keys)
- 1v1: 12 presses slipped (a person's missed keys)
- ffa: remapped keys through Settings > Keys (7 rows, about 44 s of clicking)
- ffa: was knocked out 12 s into the match (LEFT at 34%)
- ffa: 7 presses slipped (a person's missed keys)
- training: remapped keys through Settings > Keys (7 rows, about 44 s of clicking)
- training: 8 presses slipped (a person's missed keys)
- ffa: 3 presses slipped (a person's missed keys)
- training: 18 presses slipped (a person's missed keys)
- training: 11 presses slipped (a person's missed keys)
- ffa: 4 presses slipped (a person's missed keys)
- 1v1: was knocked out 2 s into the match (BOTTOM at 0%)
- 1v1: 5 presses slipped (a person's missed keys)
- ffa: 18 presses slipped (a person's missed keys)
- training: was knocked out 3 s into the match (RIGHT at 0%)
- training: 9 presses slipped (a person's missed keys)
- 1v1: 11 presses slipped (a person's missed keys)
- 1v1: was knocked out 9 s into the match (BOTTOM at 0%)

## What went wrong (everything the playtester noted while they played)
- [FEEL] long-match: ffa match on goiky was still going after 2 min of game time (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 5 scenes)
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4773 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.3) in ffa; recent move: Microphone|mic.special
- [UI] stray-banner: a match shows "KO'd by Cheesy − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: Microphone|mic.jab
- [FEEL] jank-input-latency (JANK): Microphone: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 5729 ms before the next screen was ready
- [FEEL] jank-input-latency (JANK): Cammy: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [UI] stray-banner: a match shows "KO'd by Fern − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in ffa; recent move: Cammy|shutter.jab
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in ffa; recent move: Cammy|shutter.ua
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in ffa; recent move: Fern|photo.jab
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.2) in ffa; recent move: Cammy|shutter.da
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.2) in ffa; recent move: Cammy|shutter.ba
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4701 ms before the next screen was ready
- [FEEL] jank-input-latency (JANK): Liy: atk took 5 frames (84 ms) from the key to the first change on the fighter
- [UI] stray-banner: a match shows "KO'd by Gelatin − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage pillars)
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 5840 ms before the next screen was ready
- [BUG] cant: David: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- [FEEL] jank-input-latency (JANK): David: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: David|seriously.ua
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.3) in ffa; recent move: Needle|counter.jab
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ffa; recent move: David|seriously.dt
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in ffa; recent move: David|seriously.smash
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 5604 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 34 ms frame (median 1.1) in ffa; recent move: Remote|battery.jab
- [FEEL] jank-teleport (JANK): Remote moved 303 px in one frame (ffa; last move: Remote|battery.finisher)
- [FEEL] jank-teleport (JANK): Remote moved 151 px in one frame (ffa; last move: Remote|battery.up)
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.5) in ffa; recent move: TV|static.smash
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.8) in ffa; recent move: Ruler|measure.dt
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.7) in ffa; recent move: TV|static.special
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.7) in ffa; recent move: TV|static.jab
- [SLOW] jank-spike (JANK): a 56 ms frame (median 0.4) in ffa; recent move: Taco|jawbreaker.up
- [FEEL] jank-teleport (JANK): TV moved 166 px in one frame (ffa; last move: TV|static.up)
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.6) in ffa; recent move: TV|static.ut
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.6) in ffa; recent move: Remote|battery.dt
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.4) in ffa; recent move: no recent move

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
