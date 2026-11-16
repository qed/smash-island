# kid-bfdi-fan-01

**Profile.** kid-bfdi-fan-01: kid (12), first-time; goal: try every fighter; reads nothing, clicks the fighter they know from BFDI; mashes attack when excited.
**Hands.** reaction 364 ms (SD 86), key timing jitter 4.05 frames, slipped presses 15%, double-tap 48%, short hop 39%, 60 fps input, 2.36 s per menu target, 496 ms per word read (reads 12% of a screen).
**Keys.** arrows. **Patience.** menus 93 s, confused 26 s on one screen, rage-quits after 4 losses in a row.
**Plan.** ffa, boss, training, 1v1 (x passes).

## What they did
- ffa (seed 669858103): ended; 28 s of game on goiky, dealt 378, took 36, BOTTOM@36% by TV, BOTTOM@0% fell; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 669858103 --arg persona=kid-bfdi-fan-01 --arg fighter=Puffball --arg stage=goiky --arg kind=ffa`
- 1v1 (seed 899404294): ended; 47 s of game on dreamisle, dealt 176, took 43, no KOs; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 899404294 --arg persona=kid-bfdi-fan-01 --arg fighter=Basketball --arg stage=dreamisle --arg kind=1v1`
- ffa (seed 659881732): ended; 60 s of game on incin, dealt 204, took 136, LEFT@51% by Tennis Ball, RIGHT@22% by Tennis Ball, LEFT@64% by Tennis Ball; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 659881732 --arg persona=kid-bfdi-fan-01 --arg fighter=Bracelety --arg stage=incin --arg kind=ffa`
- 1v1 (seed 141041145): ended; 62 s of game on bigincin, dealt 211, took 90, RIGHT@9% by ?; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 141041145 --arg persona=kid-bfdi-fan-01 --arg fighter=Leafy --arg stage=bigincin --arg kind=1v1`
- boss (seed 114107166): until; 141 s of game on goiky, dealt 573, took 162, LEFT@58% by a boss, RIGHT@22% by a boss, boss Announcer; menus took them about 49 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 114107166 --arg persona=kid-bfdi-fan-01 --arg fighter=Bracelety --arg boss=0`
- ffa (seed 305099851): ended; 107 s of game on ice, dealt 1031, took 181, TOP@134% by Pencil; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 305099851 --arg persona=kid-bfdi-fan-01 --arg fighter=David --arg stage=ice --arg kind=ffa`
- training (seed 11401002): cap; menus took them about 83 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 11401002 --arg persona=kid-bfdi-fan-01 --arg fighter=Bomb`
- training (seed 339326780): cap; menus took them about 83 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 339326780 --arg persona=kid-bfdi-fan-01 --arg fighter=Ruler`
- boss (seed 387799526): cap; 180 s of game on goiky, dealt 377, took 167, RIGHT@44% by a boss, LEFT@63% fell, RIGHT@162% by a boss, boss Purple Face; menus took them about 49 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 387799526 --arg persona=kid-bfdi-fan-01 --arg fighter=Barf Bag --arg boss=4`
- boss (seed 214733307): ended; 44 s of game on goiky, dealt 229, took 129, RIGHT@48% by a boss, RIGHT@36% by a boss, RIGHT@79% fell, boss Purple Dragon; menus took them about 49 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 214733307 --arg persona=kid-bfdi-fan-01 --arg fighter=Pencil --arg boss=8`
- boss (seed 754698033): ended; 55 s of game on goiky, dealt 237, took 110, RIGHT@52% by a boss, LEFT@43% by a boss, RIGHT@32% by a boss, boss Purple Dragon; menus took them about 49 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 754698033 --arg persona=kid-bfdi-fan-01 --arg fighter=Snowball --arg boss=8`
- training (seed 488871741): cap; menus took them about 83 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 488871741 --arg persona=kid-bfdi-fan-01 --arg fighter=Goo`
- 1v1 (seed 114103679): ended; 55 s of game on forest, dealt 324, took 407, MAX@230% by Rocky, RIGHT@138% by an assist/hazard, RIGHT@24% by an assist/hazard; menus took them about 60 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 114103679 --arg persona=kid-bfdi-fan-01 --arg fighter=Paper --arg stage=forest --arg kind=1v1`
- training (seed 322896052): cap; menus took them about 83 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 322896052 --arg persona=kid-bfdi-fan-01 --arg fighter=Starfruit`
- boss (seed 419134113): until; 157 s of game on goiky, dealt 425, took 275, RIGHT@79% by a boss, RIGHT@138% by a boss, LEFT@93% by a boss, boss Announcer; menus took them about 49 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 419134113 --arg persona=kid-bfdi-fan-01 --arg fighter=Rocky --arg boss=0`
- training (seed 794760953): cap; menus took them about 83 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 794760953 --arg persona=kid-bfdi-fan-01 --arg fighter=Puffball`
- 1v1 (seed 170765467): ended; 30 s of game on skytower, dealt 20, took 0, BOTTOM@0% fell, BOTTOM@0% fell; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 170765467 --arg persona=kid-bfdi-fan-01 --arg fighter=Fan --arg stage=skytower --arg kind=1v1`
- ffa (seed 553275150): cap; 180 s of game on bigincin, dealt 369, took 351, RIGHT@95% by Needle; menus took them about 60 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 553275150 --arg persona=kid-bfdi-fan-01 --arg fighter=Magnet --arg stage=bigincin --arg kind=ffa`
- 1v1 (seed 513715968): ended; 66 s of game on goiky, dealt 263, took 70, BOTTOM@0% fell, BOTTOM@70% by Fan; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 513715968 --arg persona=kid-bfdi-fan-01 --arg fighter=Bell --arg stage=goiky --arg kind=1v1`
- ffa (seed 250779693): ended; 77 s of game on wind, dealt 147, took 76, BOTTOM@46% by David, RIGHT@14% by Snowball, BOTTOM@0% fell; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 250779693 --arg persona=kid-bfdi-fan-01 --arg fighter=Match --arg stage=wind --arg kind=ffa`

## Where they got stuck or confused
- BUG cant: Basketball: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- ffa: 5 presses slipped (a person's missed keys)
- 1v1: 7 presses slipped (a person's missed keys)
- ffa: 9 presses slipped (a person's missed keys)
- boss: 17 presses slipped (a person's missed keys)
- ffa: 23 presses slipped (a person's missed keys)
- training: 19 presses slipped (a person's missed keys)
- training: 23 presses slipped (a person's missed keys)
- boss: 11 presses slipped (a person's missed keys)
- boss: was knocked out 11 s into the match (RIGHT at 48%)
- boss: 3 presses slipped (a person's missed keys)
- boss: 9 presses slipped (a person's missed keys)
- training: 8 presses slipped (a person's missed keys)
- training: 16 presses slipped (a person's missed keys)
- boss: 16 presses slipped (a person's missed keys)
- training: 14 presses slipped (a person's missed keys)
- 1v1: was knocked out 6 s into the match (BOTTOM at 0%)
- 1v1: 2 presses slipped (a person's missed keys)
- ffa: 21 presses slipped (a person's missed keys)
- 1v1: was knocked out 13 s into the match (BOTTOM at 0%)
- 1v1: 13 presses slipped (a person's missed keys)
- ffa: was knocked out 3 s into the match (BOTTOM at 46%)
- ffa: 8 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 8 scenes)
- [FEEL] long-match: ffa match on goiky was still going after 2 min of game time (in 5 scenes)
- [FEEL] jank-audio-burst (JANK): 8 sound calls in one frame (boss) (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage ice) (in 3 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in boss (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (boss, stage goiky) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.5) in ffa; recent move: Puffball|fly.grab
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.8) in ffa; recent move: Puffball|fly.special
- [SLOW] jank-spike (JANK): a 71 ms frame (median 0.6) in ffa; recent move: Puffball|fly.jab
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.8) in ffa; recent move: Puffball|fly.smash
- [SLOW] jank-spike (JANK): a 108 ms frame (median 0.8) in ffa; recent move: Rocky|barf.jab
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.7) in ffa; recent move: Puffball|fly.ut
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.6) in ffa; recent move: Puffball|fly.ua
- [SLOW] jank-spike (JANK): a 72 ms frame (median 0.6) in ffa; recent move: no recent move
- [UI] stray-banner: a match shows "KO'd by TV − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: Basketball|dribble.smash
- [FEEL] jank-input-latency (JANK): Basketball: atk took 5 frames (84 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.3) in ffa; recent move: Basketball|dribble.fa
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage dreamisle)
- [BUG] cant: Basketball: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- [SLOW] jank-spike (JANK): a 49 ms frame (median 0.5) in ffa; recent move: Ice Cube|shatter.smash
- [SLOW] jank-spike (JANK): a 51 ms frame (median 0.3) in ffa; recent move: Bracelety|sign.fa
- [SLOW] jank-spike (JANK): a 62 ms frame (median 0.3) in ffa; recent move: Bracelety|sign.smash
- [SLOW] jank-spike (JANK): a 69 ms frame (median 0.3) in ffa; recent move: Tennis Ball|serve.special
- [SLOW] jank-spike (JANK): a 53 ms frame (median 0.4) in ffa; recent move: Ice Cube|shatter.jab
- [SLOW] jank-spike (JANK): a 72 ms frame (median 0.2) in ffa; recent move: Bracelety|sign.special
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.3) in ffa; recent move: Bracelety|sign.jab
- [SLOW] jank-spike (JANK): a 102 ms frame (median 0.3) in ffa; recent move: Bracelety|sign.ba
- [SLOW] jank-spike (JANK): a 54 ms frame (median 0.3) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in ffa; recent move: Bracelety|sign.finisher
- [SLOW] jank-spike (JANK): a 112 ms frame (median 0.2) in ffa; recent move: Bracelety|sign.na
- [UI] stray-banner: a match shows "KO'd by Tennis Ball − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 123 ms frame (median 0.3) in ffa; recent move: Bracelety|sign.usmash
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.3) in ffa; recent move: Leafy|dash.jab
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.3) in ffa; recent move: Leafy|dash.smash
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.3) in ffa; recent move: Leafy|dash.special
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.3) in ffa; recent move: Leafy|dash.ua
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.2) in ffa; recent move: Leafy|dash.na
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.2) in ffa; recent move: Leafy|dash.da
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in ffa; recent move: no recent move

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
