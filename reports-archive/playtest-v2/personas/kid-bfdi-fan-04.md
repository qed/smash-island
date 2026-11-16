# kid-bfdi-fan-04

**Profile.** kid-bfdi-fan-04: kid (11), first-time; goal: try every fighter; reads nothing, clicks the fighter they know from BFDI; mashes attack when excited.
**Hands.** reaction 415 ms (SD 89), key timing jitter 3.4 frames, slipped presses 14%, double-tap 56%, short hop 39%, 60 fps input, 1.67 s per menu target, 573 ms per word read (reads 10% of a screen).
**Keys.** arrows. **Patience.** menus 66 s, confused 21 s on one screen, rage-quits after 2 losses in a row.
**Plan.** ffa, boss, training, 1v1 (x passes).

## What they did
- 1v1 (seed 319548456): ended; 22 s of game on goiky, dealt 83, took 15, BOTTOM@12% by Dora, BOTTOM@3% by Dora, BOTTOM@0% fell; menus took them about 45 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 319548456 --arg persona=kid-bfdi-fan-04 --arg fighter=Loser --arg stage=goiky --arg kind=1v1`
- 1v1 (seed 181307673): ended; 63 s of game on incin, dealt 249, took 84, RIGHT@23% by Saw, RIGHT@6% by Saw; menus took them about 50 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 181307673 --arg persona=kid-bfdi-fan-04 --arg fighter=Match --arg stage=incin --arg kind=1v1`
- ffa (seed 187232190): cap; 180 s of game on ice, dealt 54, took 0, BOTTOM@0% fell, BOTTOM@0% by ?; menus took them about 45 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 187232190 --arg persona=kid-bfdi-fan-04 --arg fighter=Naily --arg stage=ice --arg kind=ffa`
- training (seed 803578718): cap; menus took them about 72 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 803578718 --arg persona=kid-bfdi-fan-04 --arg fighter=Woody`
- training (seed 607092911): cap; menus took them about 72 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 607092911 --arg persona=kid-bfdi-fan-04 --arg fighter=Flower`
- ffa (seed 714247537): cap; 180 s of game on yoyle, dealt 280, took 64, RIGHT@24% by Pickle, BOTTOM@0% fell, BOTTOM@40% by Match; menus took them about 50 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 714247537 --arg persona=kid-bfdi-fan-04 --arg fighter=Bracelety --arg stage=yoyle --arg kind=ffa`
- ffa (seed 676521288): ended; 158 s of game on fortress, dealt 811, took 148, no KOs; menus took them about 45 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 676521288 --arg persona=kid-bfdi-fan-04 --arg fighter=Marker --arg stage=fortress --arg kind=ffa`
- boss (seed 446055031): until; 80 s of game on goiky, dealt 519, took 132, RIGHT@94% by a boss, boss The Bug Swarm; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 446055031 --arg persona=kid-bfdi-fan-04 --arg fighter=Ruler --arg boss=3`
- boss (seed 260989723): until; 96 s of game on goiky, dealt 732, took 95, LEFT@35% by a boss, LEFT@53% by a boss, boss The Bug Swarm; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 260989723 --arg persona=kid-bfdi-fan-04 --arg fighter=Dora --arg boss=3`
- boss (seed 258776860): ended; 79 s of game on goiky, dealt 170, took 62, RIGHT@24% by ?, RIGHT@86% by a boss, LEFT@29% by a boss, boss MePhone4S; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 258776860 --arg persona=kid-bfdi-fan-04 --arg fighter=Dough --arg boss=7`
- boss (seed 535277986): ended; 118 s of game on goiky, dealt 305, took 221, LEFT@84% by a boss, LEFT@92% by a boss, LEFT@62% by a boss, boss Four; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 535277986 --arg persona=kid-bfdi-fan-04 --arg fighter=Golf Ball --arg boss=11`
- ffa (seed 577341071): ended; 83 s of game on incin, dealt 317, took 160, LEFT@64% by Nickel (II), RIGHT@0% fell, LEFT@93% by Paintbrush; menus took them about 50 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 577341071 --arg persona=kid-bfdi-fan-04 --arg fighter=Grassy --arg stage=incin --arg kind=ffa`
- training (seed 215036130): cap; menus took them about 72 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 215036130 --arg persona=kid-bfdi-fan-04 --arg fighter=Pen`
- training (seed 882738754): cap; menus took them about 72 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 882738754 --arg persona=kid-bfdi-fan-04 --arg fighter=Fries`
- 1v1 (seed 853390676): ended; 36 s of game on shift, dealt 164, took 5, RIGHT@0% fell; menus took them about 50 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 853390676 --arg persona=kid-bfdi-fan-04 --arg fighter=Basketball --arg stage=shift --arg kind=1v1`
- 1v1 (seed 896427204): ended; 37 s of game on yoyle, dealt 32, took 0, BOTTOM@0% fell, BOTTOM@0% fell; menus took them about 45 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 896427204 --arg persona=kid-bfdi-fan-04 --arg fighter=Yin-Yang --arg stage=yoyle --arg kind=1v1`
- boss (seed 562458212): cap; 180 s of game on goiky, dealt 337, took 154, LEFT@35% by a boss, RIGHT@44% by a boss, RIGHT@145% by a boss, boss Four; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 562458212 --arg persona=kid-bfdi-fan-04 --arg fighter=Poppy --arg boss=11`
- training (seed 437937798): cap; menus took them about 72 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 437937798 --arg persona=kid-bfdi-fan-04 --arg fighter=Bracelety`
- ffa (seed 221698130): ended; 26 s of game on needle, dealt 76, took 64, BOTTOM@6% by Lifering, BOTTOM@36% by Fanny, BOTTOM@22% by Fanny; menus took them about 50 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 221698130 --arg persona=kid-bfdi-fan-04 --arg fighter=Bracelety --arg stage=needle --arg kind=ffa`
- 1v1 (seed 962612481): ended; 45 s of game on ice, dealt 347, took 3, no KOs; menus took them about 45 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 962612481 --arg persona=kid-bfdi-fan-04 --arg fighter=Bot --arg stage=ice --arg kind=1v1`

## Where they got stuck or confused
- 1v1: was knocked out 7 s into the match (BOTTOM at 12%)
- 1v1: 4 presses slipped (a person's missed keys)
- 1v1: was knocked out 14 s into the match (RIGHT at 23%)
- 1v1: 6 presses slipped (a person's missed keys)
- ffa: was knocked out 1 s into the match (BOTTOM at 0%)
- ffa: 1 presses slipped (a person's missed keys)
- training: was knocked out 5 s into the match (LEFT at 4%)
- training: would have rage-quit: 2 losses in a row (limit 2)
- training: 4 presses slipped (a person's missed keys)
- training: would have quit in the menus: 72 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 66 s
- training: 8 presses slipped (a person's missed keys)
- ffa: was knocked out 3 s into the match (RIGHT at 24%)
- ffa: 8 presses slipped (a person's missed keys)
- ffa: 17 presses slipped (a person's missed keys)
- boss: 8 presses slipped (a person's missed keys)
- boss: was knocked out 13 s into the match (LEFT at 35%)
- boss: would have rage-quit: 2 losses in a row (limit 2)
- boss: was knocked out 7 s into the match (RIGHT at 24%)
- boss: 2 presses slipped (a person's missed keys)
- boss: 9 presses slipped (a person's missed keys)
- ffa: 9 presses slipped (a person's missed keys)
- training: 15 presses slipped (a person's missed keys)
- training: 12 presses slipped (a person's missed keys)
- 1v1: was knocked out 8 s into the match (RIGHT at 0%)
- 1v1: 3 presses slipped (a person's missed keys)
- boss: 6 presses slipped (a person's missed keys)
- training: 18 presses slipped (a person's missed keys)
- ffa: was knocked out 7 s into the match (BOTTOM at 6%)
- ffa: would have rage-quit: 2 losses in a row (limit 2)
- ffa: 2 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [FEEL] long-match: ffa match on goiky was still going after 2 min of game time (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 3 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in boss (in 2 scenes)
- [UI] stray-banner: a match shows "KO'd by Dora − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage goiky)
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.2) in ffa; recent move: Loser|cool.jab
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ffa; recent move: Loser|cool.special
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage incin)
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.2) in ffa; recent move: Match|spark.special
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.3) in ffa; recent move: Saw|saw.ba
- [UI] stray-banner: a match shows "KO'd by Saw − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ffa; recent move: Match|spark.fa
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in ffa; recent move: Match|spark.ba
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in ffa; recent move: Match|spark.smash
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ffa; recent move: Match|spark.jab
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.4) in ffa; recent move: Naily|spike.up
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.4) in ffa; recent move: Naily|spike.smash
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.4) in ffa; recent move: Naily|spike.special
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.4) in ffa; recent move: Naily|spike.dt
- [SLOW] jank-spike (JANK): a 126 ms frame (median 0.5) in ffa; recent move: Naily|spike.jab
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.4) in ffa; recent move: Match|spark.ba
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.2) in ffa; recent move: Match|spark.jab
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in ffa; recent move: Blocky|anvil.jab
- [SLOW] jank-spike (JANK): a 62 ms frame (median 0.3) in ffa; recent move: Blocky|anvil.ua
- [SLOW] jank-spike (JANK): a 66 ms frame (median 0.2) in ffa; recent move: Match|spark.up
- [FEEL] jank-teleport (JANK): Blocky moved 206 px in one frame (ffa; last move: Blocky|anvil.finisher)
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.2) in ffa; recent move: Blocky|anvil.fthrow
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.2) in ffa; recent move: Match|spark.finisher
- [SLOW] jank-spike (JANK): a 48 ms frame (median 0.3) in ffa; recent move: Blocky|anvil.up
- [FEEL] long-match: ffa match on ice was still going after 3 min of game time
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.1) in ffa; recent move: Woody|fraidy.fa
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.2) in ffa; recent move: Woody|fraidy.special
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ffa; recent move: Woody|fraidy.ba
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.1) in ffa; recent move: Woody|fraidy.jab
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.2) in ffa; recent move: Woody|fraidy.ua
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.1) in ffa; recent move: Woody|fraidy.smash
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.2) in ffa; recent move: Woody|fraidy.dsmash
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.2) in ffa; recent move: Woody|fraidy.ut

## When they would have quit
- training: would have rage-quit: 2 losses in a row (limit 2)
- training: would have quit in the menus: 72 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 66 s
- training: would have quit in the menus: 72 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 66 s
- boss: would have rage-quit: 2 losses in a row (limit 2)
- boss: would have rage-quit: 2 losses in a row (limit 2)
- training: would have quit in the menus: 72 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 66 s
- training: would have quit in the menus: 72 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 66 s
- training: would have quit in the menus: 72 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 66 s
- ffa: would have rage-quit: 2 losses in a row (limit 2)
