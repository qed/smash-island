# kid-sibling-rival-03

**Profile.** kid-sibling-rival-03: kid (10), casual; goal: beat Boss Rush; wants to beat the bosses to brag; retries immediately after a loss.
**Hands.** reaction 291 ms (SD 72), key timing jitter 2.57 frames, slipped presses 9%, double-tap 69%, short hop 55%, 60 fps input, 1.72 s per menu target, 402 ms per word read (reads 17% of a screen).
**Keys.** arrows. **Patience.** menus 78 s, confused 43 s on one screen, rage-quits after 5 losses in a row.
**Plan.** boss, boss, ffa (x passes).

## What they did
- boss (seed 531647767): ended; 72 s of game on goiky, dealt 437, took 223, RIGHT@85% by a boss, LEFT@120% by a boss, RIGHT@77% by a boss, boss Two; menus took them about 48 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 531647767 --arg persona=kid-sibling-rival-03 --arg fighter=Tea Kettle --arg boss=9`
- ffa (seed 98512474): ended; 117 s of game on pillars, dealt 515, took 143, RIGHT@110% by Gaty; menus took them about 51 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 98512474 --arg persona=kid-sibling-rival-03 --arg fighter=Loser --arg stage=pillars --arg kind=ffa`
- ffa (seed 804595787): ended; 140 s of game on bigincin, dealt 420, took 294, TOP@159% by Silver Spoon; menus took them about 57 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 804595787 --arg persona=kid-sibling-rival-03 --arg fighter=Sidewalky --arg stage=bigincin --arg kind=ffa`
- boss (seed 905167514): ended; 158 s of game on goiky, dealt 139, took 220, LEFT@176% by a boss, RIGHT@24% by a boss, RIGHT@22% by a boss, boss Puffball Speaker Box; menus took them about 48 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 905167514 --arg persona=kid-sibling-rival-03 --arg fighter=Cake --arg boss=1`
- boss (seed 421895270): ended; 163 s of game on goiky, dealt 448, took 150, RIGHT@155% by a boss, TOP@109% by a boss, LEFT@94% by a boss, boss MePhone4; menus took them about 48 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 421895270 --arg persona=kid-sibling-rival-03 --arg fighter=Flower --arg boss=5`
- boss (seed 745098982): ended; 147 s of game on goiky, dealt 310, took 80, LEFT@26% by a boss, RIGHT@86% by a boss, RIGHT@42% by a boss, boss Springy; menus took them about 48 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 745098982 --arg persona=kid-sibling-rival-03 --arg fighter=Teardrop --arg boss=10`
- boss (seed 982480280): ended; 169 s of game on goiky, dealt 547, took 79, TOP@88% by a boss, TOP@92% by a boss, TOP@92% by a boss, boss MePhone4; menus took them about 48 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 982480280 --arg persona=kid-sibling-rival-03 --arg fighter=Paper --arg boss=5`
- boss (seed 174556921): ended; 86 s of game on goiky, dealt 166, took 71, LEFT@0% fell, RIGHT@51% by a boss, RIGHT@66% by a boss, boss Firey Speaker Box; menus took them about 48 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 174556921 --arg persona=kid-sibling-rival-03 --arg fighter=Puffball --arg boss=2`
- boss (seed 420018249): ended; 146 s of game on goiky, dealt 260, took 40, RIGHT@87% by ?, RIGHT@28% by a boss, RIGHT@0% fell, boss Two; menus took them about 48 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 420018249 --arg persona=kid-sibling-rival-03 --arg fighter=Magnet --arg boss=9`
- boss (seed 875018200): ended; 94 s of game on goiky, dealt 121, took 0, LEFT@106% by ?, LEFT@0% by ?, TOP@88% by ?, boss Evil Leafy; menus took them about 48 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 875018200 --arg persona=kid-sibling-rival-03 --arg fighter=Rose --arg boss=6`
- boss (seed 247729842): ended; 27 s of game on goiky, dealt 86, took 0, LEFT@26% by ?, LEFT@13% by ?, RIGHT@77% by ?, boss Evil Leafy; menus took them about 48 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 247729842 --arg persona=kid-sibling-rival-03 --arg fighter=Profily --arg boss=6`
- ffa (seed 676087375): ended; 49 s of game on dreamisle, dealt 504, took 185, TOP@185% by Golf Ball; menus took them about 51 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 676087375 --arg persona=kid-sibling-rival-03 --arg fighter=Bomb --arg stage=dreamisle --arg kind=ffa`
- boss (seed 262214626): cap; 180 s of game on goiky, dealt 656, took 147, LEFT@55% by a boss, TOP@123% by a boss, boss Springy; menus took them about 48 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 262214626 --arg persona=kid-sibling-rival-03 --arg fighter=Lollipop --arg boss=10`
- ffa (seed 639893678): cap; 180 s of game on yoyle, dealt 597, took 110, BOTTOM@7% fell, BOTTOM@19% by Bomby; menus took them about 57 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 639893678 --arg persona=kid-sibling-rival-03 --arg fighter=Remote --arg stage=yoyle --arg kind=ffa`
- ffa (seed 379322578): ended; 170 s of game on grandplains, dealt 565, took 87, BOTTOM@87% fell, BOTTOM@0% fell; menus took them about 51 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 379322578 --arg persona=kid-sibling-rival-03 --arg fighter=Bot --arg stage=grandplains --arg kind=ffa`

## Where they got stuck or confused
- boss: 6 presses slipped (a person's missed keys)
- ffa: 12 presses slipped (a person's missed keys)
- ffa: 16 presses slipped (a person's missed keys)
- boss: 7 presses slipped (a person's missed keys)
- boss: 14 presses slipped (a person's missed keys)
- boss: was knocked out 9 s into the match (LEFT at 26%)
- boss: 12 presses slipped (a person's missed keys)
- boss: 15 presses slipped (a person's missed keys)
- boss: was knocked out 1 s into the match (LEFT at 0%)
- boss: 3 presses slipped (a person's missed keys)
- boss: 5 presses slipped (a person's missed keys)
- boss: was knocked out 4 s into the match (LEFT at 26%)
- ffa: 4 presses slipped (a person's missed keys)
- boss: 13 presses slipped (a person's missed keys)
- ffa: 29 presses slipped (a person's missed keys)
- ffa: 14 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (boss, stage goiky) (in 7 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in boss (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage grandplains) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.1) in boss; recent move: Tea Kettle|hors.na
- [FEEL] jank-input-latency (JANK): Tea Kettle: smash took 11 frames (184 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in boss; recent move: Tea Kettle|hors.smash
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.3) in boss; recent move: no recent move
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.4) in boss; recent move: Tea Kettle|hors.special
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.2) in ffa; recent move: Loser|cool.smash
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.1) in ffa; recent move: Loser|cool.jab
- [SLOW] jank-spike (JANK): a 58 ms frame (median 0.4) in ffa; recent move: Loser|cool.da
- [SLOW] jank-spike (JANK): a 58 ms frame (median 0.2) in ffa; recent move: Loser|cool.special
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.5) in ffa; recent move: Needle|counter.up
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.3) in ffa; recent move: Loser|cool.fa
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 62 ms frame (median 0.4) in ffa; recent move: Loser|cool.finisher
- [SLOW] jank-spike (JANK): a 56 ms frame (median 0.3) in ffa; recent move: Needle|counter.dt
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage pillars)
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in ffa; recent move: Loser|cool.dt
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.3) in ffa; recent move: Loser|cool.ua
- [SLOW] jank-spike (JANK): a 57 ms frame (median 0.4) in ffa; recent move: Needle|counter.jab
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.3) in ffa; recent move: Loser|cool.ut
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.3) in ffa; recent move: Needle|counter.finisher
- [SLOW] jank-spike (JANK): a 48 ms frame (median 0.3) in ffa; recent move: Loser|cool.up
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.3) in ffa; recent move: Loser|cool.na
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.3) in ffa; recent move: Needle|counter.down
- [UI] stray-banner: a match shows "KO'd by Gaty − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.2) in ffa; recent move: Gaty|reflect.up
- [SLOW] jank-spike (JANK): a 49 ms frame (median 0.2) in ffa; recent move: Gaty|reflect.jab
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.3) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in ffa; recent move: Sidewalky|slam.fa
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.2) in ffa; recent move: Sidewalky|slam.smash
- [SLOW] jank-spike (JANK): a 76 ms frame (median 0.2) in ffa; recent move: Sidewalky|slam.jab
- [SLOW] jank-spike (JANK): a 92 ms frame (median 0.4) in ffa; recent move: Sidewalky|slam.ut
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.2) in ffa; recent move: Sidewalky|slam.special
- [SLOW] jank-spike (JANK): a 55 ms frame (median 0.2) in ffa; recent move: Sidewalky|slam.na
- [FEEL] jank-air-hang (JANK): Fan hung motionless in the air for 45 frames (ffa) at 2665,1167
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.3) in ffa; recent move: Silver Spoon|glowgold.up
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.3) in ffa; recent move: Sidewalky|slam.up

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
