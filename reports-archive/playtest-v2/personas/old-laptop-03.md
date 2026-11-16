# old-laptop-03

**Profile.** old-laptop-03: adult (42), casual; goal: FFA on an old laptop at 25-35 fps; tolerates choppiness; reads the screen late.
**Hands.** reaction 263 ms (SD 51), key timing jitter 2.25 frames, slipped presses 8%, double-tap 66%, short hop 51%, 29 fps input, 1.1 s per menu target, 272 ms per word read (reads 31% of a screen).
**Keys.** arrows. **Patience.** menus 110 s, confused 33 s on one screen, rage-quits after 5 losses in a row.
**Plan.** ffa, teams, boss (x passes).

## What they did
- ffa (seed 679643566): ended; 84 s of game on pillars, dealt 312, took 114, LEFT@63% by Money, RIGHT@39% by Money; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 679643566 --arg persona=old-laptop-03 --arg fighter=Loser --arg stage=pillars --arg kind=ffa`
- boss (seed 831931475): ended; 163 s of game on goiky, dealt 155, took 61, LEFT@0% fell, LEFT@18% by a boss, LEFT@43% by a boss, boss MePhone4; menus took them about 51 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 831931475 --arg persona=old-laptop-03 --arg fighter=Ruler --arg boss=5`
- boss (seed 140490493): ended; 131 s of game on goiky, dealt 354, took 192, LEFT@44% by a boss, LEFT@118% by a boss, RIGHT@82% by a boss, boss Puffball Speaker Box; menus took them about 51 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 140490493 --arg persona=old-laptop-03 --arg fighter=Knife --arg boss=1`
- ffa (seed 183306465): cap; 180 s of game on canyon, dealt 358, took 159, BOTTOM@138% fell, BOTTOM@0% fell; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 183306465 --arg persona=old-laptop-03 --arg fighter=Baseball --arg stage=canyon --arg kind=ffa`
- ffa (seed 59304827): cap; 180 s of game on fortress, dealt 486, took 255, no KOs; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 59304827 --arg persona=old-laptop-03 --arg fighter=TV --arg stage=fortress --arg kind=ffa`
- teams (seed 272841406): cap; 180 s of game on ice, dealt 571, took 144, no KOs; menus took them about 57 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 272841406 --arg persona=old-laptop-03 --arg fighter=Book --arg stage=ice --arg kind=teams`
- teams (seed 145277316): cap; 180 s of game on shift, dealt 268, took 180, TOP@92% by Bomb, RIGHT@23% by Bomb; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 145277316 --arg persona=old-laptop-03 --arg fighter=Lifering --arg stage=shift --arg kind=teams`
- teams (seed 890907266): cap; 180 s of game on needle, dealt 509, took 218, LEFT@179% by Trophy; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 890907266 --arg persona=old-laptop-03 --arg fighter=Saw --arg stage=needle --arg kind=teams`
- boss (seed 695674082): cap; 180 s of game on goiky, dealt 631, took 167, TOP@121% by a boss, boss MePhone4; menus took them about 51 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 695674082 --arg persona=old-laptop-03 --arg fighter=Saw --arg boss=5`
- teams (seed 291664650): cap; 180 s of game on dreamisle, dealt 233, took 90, no KOs; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 291664650 --arg persona=old-laptop-03 --arg fighter=Soap --arg stage=dreamisle --arg kind=teams`
- ffa (seed 747974061): ended; 68 s of game on incin, dealt 0, took 42, RIGHT@9% by Balloony, RIGHT@33% by Test Tube; menus took them about 57 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 747974061 --arg persona=old-laptop-03 --arg fighter=Teardrop --arg stage=incin --arg kind=ffa`
- ffa (seed 13288785): ended; 41 s of game on wind, dealt 194, took 45, BOTTOM@21% by Test Tube; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 13288785 --arg persona=old-laptop-03 --arg fighter=Nickel --arg stage=wind --arg kind=ffa`
- teams (seed 55397235): cap; 180 s of game on forest, dealt 77, took 1373, MAX@1337% by Money; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 55397235 --arg persona=old-laptop-03 --arg fighter=Roboty --arg stage=forest --arg kind=teams`
- boss (seed 198231009): ended; 80 s of game on goiky, dealt 409, took 125, LEFT@34% by a boss, LEFT@18% by a boss, LEFT@28% by a boss, boss Two; menus took them about 51 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 198231009 --arg persona=old-laptop-03 --arg fighter=Yellow Face --arg boss=9`
- boss (seed 12390555): ended; 100 s of game on goiky, dealt 419, took 211, RIGHT@144% by a boss, TOP@89% by a boss, LEFT@34% by a boss, boss Puffball Speaker Box; menus took them about 51 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 12390555 --arg persona=old-laptop-03 --arg fighter=Tennis Ball --arg boss=1`

## Where they got stuck or confused
- BUG cant: Loser: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Loser: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Book: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- STUCK match-never-ends: teams match on ice is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
- ffa: 10 presses slipped (a person's missed keys)
- boss: was knocked out 5 s into the match (LEFT at 0%)
- boss: 2 presses slipped (a person's missed keys)
- boss: 15 presses slipped (a person's missed keys)
- ffa: 20 presses slipped (a person's missed keys)
- ffa: 18 presses slipped (a person's missed keys)
- teams: 33 presses slipped (a person's missed keys)
- teams: 23 presses slipped (a person's missed keys)
- teams: 15 presses slipped (a person's missed keys)
- boss: 7 presses slipped (a person's missed keys)
- teams: 17 presses slipped (a person's missed keys)
- ffa: was knocked out 3 s into the match (RIGHT at 9%)
- ffa: 1 presses slipped (a person's missed keys)
- ffa: was knocked out 8 s into the match (BOTTOM at 21%)
- ffa: 11 presses slipped (a person's missed keys)
- teams: 21 presses slipped (a person's missed keys)
- boss: 17 presses slipped (a person's missed keys)
- boss: 8 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (boss, stage goiky) (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage ice) (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage shift) (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage needle) (in 3 scenes)
- [UI] stray-banner: a match shows "KO'd by Money − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed) (in 2 scenes)
- [FEEL] jank-audio-burst (JANK): 8 sound calls in one frame (boss) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage dreamisle) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage forest) (in 2 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in boss (in 2 scenes)
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.3) in ffa; recent move: Loser|cool.da
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.4) in ffa; recent move: Loser|cool.jab
- [BUG] cant: Loser: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- [SLOW] jank-spike (JANK): a 61 ms frame (median 0.4) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.3) in ffa; recent move: Loser|cool.smash
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.5) in ffa; recent move: Loser|cool.special
- [BUG] cant: Loser: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- [FEEL] jank-input-latency (JANK): Loser: special took 13 frames (217 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.3) in ffa; recent move: Money|payday.special
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.4) in ffa; recent move: Loser|cool.fa
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.2) in boss; recent move: Ruler|measure.special
- [FEEL] jank-input-latency (JANK): Ruler: atk took 8 frames (134 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.2) in boss; recent move: Ruler|measure.smash
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in boss; recent move: no recent move
- [FEEL] jank-air-hang (JANK): Balloony hung motionless in the air for 45 frames (boss) at 554,514
- [FEEL] jank-teleport (JANK): Balloony moved 250 px in one frame (boss; last move: no move)
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.3) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.3) in ffa; recent move: Baseball|heavy.ua
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.4) in ffa; recent move: Baseball|heavy.smash
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.4) in ffa; recent move: Baseball|heavy.special
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.5) in ffa; recent move: Soap|disinfect.ut
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.3) in ffa; recent move: Baseball|heavy.jab
- [FEEL] jank-teleport (JANK): Bow moved 240 px in one frame (ffa; last move: Bow|chair.special)
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.4) in ffa; recent move: Baseball|heavy.up
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.3) in ffa; recent move: Soap|spit
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.3) in ffa; recent move: Baseball|heavy.fa
- [FEEL] jank-hitstop-drift (JANK): Soap moved 10 px in one frame while in hitstop (ffa; last move: no move)
- [UI] stray-banner: a match shows "KO'd by Soap − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.5) in ffa; recent move: Soap|disinfect.dt
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.3) in ffa; recent move: Bow|chair.jab

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
