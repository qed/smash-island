# wasd-habit-04

**Profile.** wasd-habit-04: adult (26), casual; goal: plays with WASD (remaps to it), after first trying it unbound; presses WASD first and waits for the fighter to move; remaps if the game does not respond.
**Hands.** reaction 312 ms (SD 58), key timing jitter 2.45 frames, slipped presses 8%, double-tap 64%, short hop 39%, 60 fps input, 0.85 s per menu target, 236 ms per word read (reads 24% of a screen).
**Keys.** wasd (tries WASD unbound first). **Patience.** menus 71 s, confused 20 s on one screen, rage-quits after 6 losses in a row.
**Plan.** ffa, boss, teams (x passes).

## What they did
- wasdprobe (seed 496367283): wasd probe; menus took them about 34 s and 7 clicks. Repro: `node scripts/playtest.mjs --scene wasdprobe --seed 496367283 --arg persona=wasd-habit-04`
- ffa (seed 97257440): ended; 43 s of game on incin, dealt 248, took 229, LEFT@91% by David, LEFT@139% by Box; menus took them about 89 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 97257440 --arg persona=wasd-habit-04 --arg fighter=Match --arg stage=incin --arg kind=ffa`
- ffa (seed 45124255): ended; 86 s of game on wind, dealt 265, took 74, BOTTOM@62% by Woody, BOTTOM@12% fell, BOTTOM@0% fell; menus took them about 86 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 45124255 --arg persona=wasd-habit-04 --arg fighter=Rocky --arg stage=wind --arg kind=ffa`
- boss (seed 723462667): ended; 63 s of game on goiky, dealt 78, took 22, LEFT@22% by ?, LEFT@22% by ?, RIGHT@44% by a boss, boss Springy; menus took them about 85 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 723462667 --arg persona=wasd-habit-04 --arg fighter=Nickel (II) --arg boss=10`
- ffa (seed 211491354): cap; 180 s of game on bigincin, dealt 290, took 462, MAX@264% by Match; menus took them about 89 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 211491354 --arg persona=wasd-habit-04 --arg fighter=Bell --arg stage=bigincin --arg kind=ffa`
- ffa (seed 486994024): cap; 180 s of game on skytower, dealt 79, took 59, BOTTOM@59% fell, BOTTOM@0% fell; menus took them about 86 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 486994024 --arg persona=wasd-habit-04 --arg fighter=Pin --arg stage=skytower --arg kind=ffa`
- boss (seed 78096081): cap; 180 s of game on goiky, dealt 386, took 8, TOP@95% by ?, TOP@115% by ?, boss Evil Leafy; menus took them about 85 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 78096081 --arg persona=wasd-habit-04 --arg fighter=Ruler --arg boss=6`
- ffa (seed 556940936): cap; 180 s of game on canyon, dealt 464, took 192, BOTTOM@0% fell, LEFT@113% by Profily; menus took them about 86 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 556940936 --arg persona=wasd-habit-04 --arg fighter=Rocky --arg stage=canyon --arg kind=ffa`
- boss (seed 428335576): ended; 84 s of game on goiky, dealt 205, took 138, LEFT@64% by a boss, RIGHT@42% by a boss, LEFT@88% by a boss, boss Firey Speaker Box; menus took them about 85 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 428335576 --arg persona=wasd-habit-04 --arg fighter=Firey --arg boss=2`
- boss (seed 77476418): ended; 70 s of game on goiky, dealt 162, took 116, RIGHT@111% by a boss, LEFT@62% by a boss, LEFT@156% by a boss, boss Firey Speaker Box; menus took them about 85 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 77476418 --arg persona=wasd-habit-04 --arg fighter=Tree --arg boss=2`
- boss (seed 19893819): ended; 114 s of game on goiky, dealt 190, took 74, RIGHT@57% by a boss, LEFT@30% by a boss, TOP@90% by a boss, boss Springy; menus took them about 85 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 19893819 --arg persona=wasd-habit-04 --arg fighter=Balloony --arg boss=10`
- teams (seed 693995992): cap; 180 s of game on pillars, dealt 702, took 115, no KOs; menus took them about 89 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 693995992 --arg persona=wasd-habit-04 --arg fighter=Flower --arg stage=pillars --arg kind=teams`
- teams (seed 591469559): cap; 180 s of game on skytower, dealt 408, took 291, TOP@191% by Magnet; menus took them about 86 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 591469559 --arg persona=wasd-habit-04 --arg fighter=Trophy --arg stage=skytower --arg kind=teams`
- teams (seed 813587266): cap; 180 s of game on ice, dealt 358, took 121, no KOs; menus took them about 86 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 813587266 --arg persona=wasd-habit-04 --arg fighter=Donut --arg stage=ice --arg kind=teams`
- teams (seed 987022010): cap; 180 s of game on incin, dealt 91, took 202, RIGHT@167% by Toothpaste; menus took them about 89 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 987022010 --arg persona=wasd-habit-04 --arg fighter=Liy --arg stage=incin --arg kind=teams`
- teams (seed 214279445): cap; 180 s of game on needle, dealt 183, took 107, no KOs; menus took them about 86 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 214279445 --arg persona=wasd-habit-04 --arg fighter=Yin-Yang --arg stage=needle --arg kind=teams`

## Where they got stuck or confused
- BUG cant: Flower: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Trophy: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Yin-Yang: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- wasdprobe: pressed WASD/J/K for 4 s on a fresh game: the fighter moved 0 px; an on-screen hint about the keys was not visible
- ffa: remapped keys through Settings > Keys (7 rows, about 30 s of clicking)
- ffa: 7 presses slipped (a person's missed keys)
- ffa: 8 presses slipped (a person's missed keys)
- boss: remapped keys through Settings > Keys (7 rows, about 30 s of clicking)
- boss: was knocked out 11 s into the match (LEFT at 22%)
- boss: 2 presses slipped (a person's missed keys)
- ffa: 13 presses slipped (a person's missed keys)
- ffa: 6 presses slipped (a person's missed keys)
- boss: 6 presses slipped (a person's missed keys)
- ffa: was knocked out 14 s into the match (BOTTOM at 0%)
- ffa: 21 presses slipped (a person's missed keys)
- boss: 8 presses slipped (a person's missed keys)
- boss: 9 presses slipped (a person's missed keys)
- teams: remapped keys through Settings > Keys (7 rows, about 30 s of clicking)
- teams: 15 presses slipped (a person's missed keys)
- teams: 22 presses slipped (a person's missed keys)
- teams: 24 presses slipped (a person's missed keys)
- teams: 11 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 3 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage skytower) (in 3 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in boss (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (boss, stage goiky) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage ice) (in 2 scenes)
- [UI] stray-banner: a match shows "KO'd by Trophy − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-no-key-hint (JANK): a player who types WASD sees nothing happen and no on-screen hint during a match about which keys to use or where to change them
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 5148 ms before the next screen was ready
- [FEEL] jank-teleport (JANK): Box moved 160 px in one frame (ffa; last move: Box|packed.finisher)
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.8) in ffa; recent move: Match|spark.na
- [SLOW] jank-spike (JANK): a 100 ms frame (median 0.9) in ffa; recent move: David|seriously.up
- [SLOW] jank-spike (JANK): a 68 ms frame (median 0.6) in ffa; recent move: Match|spark.fa
- [SLOW] jank-spike (JANK): a 142 ms frame (median 0.6) in ffa; recent move: Match|spark.finisher
- [UI] stray-banner: a match shows "KO'd by David − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-teleport (JANK): Remote moved 150 px in one frame (ffa; last move: Remote|battery.up)
- [SLOW] jank-spike (JANK): a 51 ms frame (median 0.6) in ffa; recent move: David|seriously.dt
- [FEEL] jank-teleport (JANK): Remote moved 282 px in one frame (ffa; last move: Remote|battery.finisher)
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.7) in ffa; recent move: Match|spark.smash
- [SLOW] jank-spike (JANK): a 102 ms frame (median 0.6) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 69 ms frame (median 0.6) in ffa; recent move: Match|spark.special
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.6) in ffa; recent move: Match|spark.jab
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.5) in ffa; recent move: Box|packed.jab
- [SLOW] jank-spike (JANK): a 49 ms frame (median 0.6) in ffa; recent move: Match|spark.ut
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 5842 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.8) in ffa; recent move: Rocky|barf.jab
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.6) in ffa; recent move: Rocky|barf.special
- [FEEL] jank-input-latency (JANK): Rocky: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.8) in ffa; recent move: Rocky|barf.ba
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.9) in ffa; recent move: Rocky|barf.na
- [UI] stray-banner: a match shows "KO'd by Woody − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.8) in ffa; recent move: Woody|fraidy.up
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.8) in ffa; recent move: Rocky|barf.finisher
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.7) in ffa; recent move: Rocky|barf.up
- [UI] stray-banner: a match shows "KO'd by Pencil − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 49 ms frame (median 0.5) in ffa; recent move: Woody|fraidy.special
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.8) in ffa; recent move: Rocky|barf.smash
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.3) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.5) in ffa; recent move: Pencil|van.jab
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.4) in ffa; recent move: Fries|fsgather

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
