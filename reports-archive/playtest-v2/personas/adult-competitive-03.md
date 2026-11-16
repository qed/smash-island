# adult-competitive-03

**Profile.** adult-competitive-03: adult (29), competitive; goal: teams and 1v1 at a high level, test frame data; notices latency and dropped inputs; uses every tool.
**Hands.** reaction 191 ms (SD 25), key timing jitter 1.25 frames, slipped presses 1%, double-tap 91%, short hop 80%, 60 fps input, 0.66 s per menu target, 234 ms per word read (reads 30% of a screen).
**Keys.** arrows. **Patience.** menus 85 s, confused 19 s on one screen, rage-quits after 12 losses in a row.
**Plan.** 1v1, teams, training, flow (x passes).

## What they did
- 1v1 (seed 156247918): ended; 41 s of game on wind, dealt 77, took 17, BOTTOM@11% fell, BOTTOM@0% fell; menus took them about 42 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 156247918 --arg persona=adult-competitive-03 --arg fighter=Roboty --arg stage=wind --arg kind=1v1`
- flow (seed 324123843): flow; menus took them about 40 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 324123843 --arg persona=adult-competitive-03 --arg fighter=Flower`
- flow (seed 471903696): flow; menus took them about 40 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 471903696 --arg persona=adult-competitive-03 --arg fighter=Bell`
- 1v1 (seed 290040561): cap; 180 s of game on tlc, dealt 369, took 193, MAX@165% by Dora; menus took them about 42 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 290040561 --arg persona=adult-competitive-03 --arg fighter=Marker --arg stage=tlc --arg kind=1v1`
- 1v1 (seed 340077645): cap; 180 s of game on grandplains, dealt 127, took 50, no KOs; menus took them about 42 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 340077645 --arg persona=adult-competitive-03 --arg fighter=Bonesaw --arg stage=grandplains --arg kind=1v1`
- training (seed 523737823): cap; menus took them about 70 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 523737823 --arg persona=adult-competitive-03 --arg fighter=Bomby`
- training (seed 269649126): cap; menus took them about 70 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 269649126 --arg persona=adult-competitive-03 --arg fighter=Soap`
- teams (seed 933172197): cap; 180 s of game on bigincin, dealt 197, took 154, no KOs; menus took them about 42 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 933172197 --arg persona=adult-competitive-03 --arg fighter=Ice Cube --arg stage=bigincin --arg kind=teams`
- teams (seed 869891047): cap; 180 s of game on incin, dealt 304, took 247, TOP@171% by Ruler; menus took them about 44 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 869891047 --arg persona=adult-competitive-03 --arg fighter=Woody --arg stage=incin --arg kind=teams`
- teams (seed 876849929): cap; 180 s of game on forest, dealt 212, took 1032, MAX@453% by Salt, MAX@327% by Paintbrush; menus took them about 42 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 876849929 --arg persona=adult-competitive-03 --arg fighter=Firey --arg stage=forest --arg kind=teams`
- training (seed 91577664): cap; menus took them about 70 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 91577664 --arg persona=adult-competitive-03 --arg fighter=Paintbrush`
- teams (seed 500326424): cap; 180 s of game on grandplains, dealt 374, took 134, TOP@127% by Toothpaste; menus took them about 42 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 500326424 --arg persona=adult-competitive-03 --arg fighter=Cheesy --arg stage=grandplains --arg kind=teams`
- training (seed 961935134): cap; menus took them about 70 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 961935134 --arg persona=adult-competitive-03 --arg fighter=Snowball`
- teams (seed 301704517): cap; 180 s of game on dreamisle, dealt 525, took 145, no KOs; menus took them about 42 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 301704517 --arg persona=adult-competitive-03 --arg fighter=Poppy --arg stage=dreamisle --arg kind=teams`
- 1v1 (seed 489612677): ended; 78 s of game on dreamisle, dealt 335, took 17, no KOs; menus took them about 44 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 489612677 --arg persona=adult-competitive-03 --arg fighter=Dora --arg stage=dreamisle --arg kind=1v1`
- training (seed 806595695): cap; menus took them about 70 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 806595695 --arg persona=adult-competitive-03 --arg fighter=Yellow Face`
- 1v1 (seed 982107530): ended; 80 s of game on pillars, dealt 193, took 163, RIGHT@41% by Knife, LEFT@46% by Knife, LEFT@77% by Knife; menus took them about 44 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 982107530 --arg persona=adult-competitive-03 --arg fighter=Paintbrush --arg stage=pillars --arg kind=1v1`
- flow (seed 518373945): flow; menus took them about 40 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 518373945 --arg persona=adult-competitive-03 --arg fighter=Fan`
- flow (seed 581958669): flow; menus took them about 40 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 581958669 --arg persona=adult-competitive-03 --arg fighter=Dora`
- flow (seed 314927453): flow; menus took them about 40 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 314927453 --arg persona=adult-competitive-03 --arg fighter=Bell`

## Where they got stuck or confused
- BUG cant: Roboty: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- STUCK match-never-ends: ffa match on grandplains is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
- 1v1: 1 presses slipped (a person's missed keys)
- 1v1: 8 presses slipped (a person's missed keys)
- training: 4 presses slipped (a person's missed keys)
- teams: 3 presses slipped (a person's missed keys)
- teams: 6 presses slipped (a person's missed keys)
- teams: 5 presses slipped (a person's missed keys)
- training: 2 presses slipped (a person's missed keys)
- training: 8 presses slipped (a person's missed keys)
- teams: 7 presses slipped (a person's missed keys)
- 1v1: 2 presses slipped (a person's missed keys)
- 1v1: 9 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [FEEL] long-match: ffa match on goiky was still going after 2 min of game time (in 5 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage tlc) (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage dreamisle) (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage grandplains) (in 3 scenes)
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: no recent move (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage incin) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage forest) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage pillars) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ffa; recent move: Roboty|antenna.jab
- [FEEL] jank-input-latency (JANK): Roboty: smash took 12 frames (200 ms) from the key to the first change on the fighter
- [FEEL] jank-teleport (JANK): Nickel moved 175 px in one frame (ffa; last move: Nickel|flip.up)
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.3) in ffa; recent move: no recent move
- [FEEL] jank-hitstop-drift (JANK): Nickel moved 44 px in one frame while in hitstop (ffa; last move: Nickel|flip.finisher)
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ffa; recent move: Roboty|antenna.up
- [BUG] cant: Roboty: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- [FEEL] jank-input-latency (JANK): Roboty: special took 9 frames (150 ms) from the key to the first change on the fighter
- [UI] stray-banner: a match shows "KO'd by Nickel − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [UI] stray-banner: a match shows "KO'd by Basketball − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.4) in ffa; recent move: Golf Ball|zapshooter.jab
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.3) in ffa; recent move: no recent move
- [UI] stray-banner: a match shows "KO'd by Coiny − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [UI] stray-banner: a match shows "KO'd by Tennis Ball − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: Pin|pierce.jab
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.3) in ffa; recent move: Tennis Ball|serve.dt
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ffa; recent move: Pin|pierce.pummel
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.3) in ffa; recent move: Pin|pierce.up
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.3) in ffa; recent move: Tennis Ball|serve.special
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.2) in ffa; recent move: Pin|pierce.special
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.3) in ffa; recent move: Tennis Ball|serve.jab
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.3) in ffa; recent move: Tennis Ball|serve.ba
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.3) in ffa; recent move: Pin|uppercut
- [FEEL] jank-air-hang (JANK): Tennis Ball hung motionless in the air for 45 frames (ffa) at 745,532
- [FEEL] jank-hitstop-drift (JANK): Pin moved 18 px in one frame while in hitstop (ffa; last move: Pin|pierce.jab)
- [FEEL] jank-hitstop-drift (JANK): Pin moved 21 px in one frame while in hitstop (ffa; last move: no move)
- [SLOW] jank-spike (JANK): a 88 ms frame (median 0.2) in ffa; recent move: Marker|ink.na
- [SLOW] jank-spike (JANK): a 54 ms frame (median 0.2) in ffa; recent move: Dora|rant.jab
- [SLOW] jank-spike (JANK): a 72 ms frame (median 0.2) in ffa; recent move: Marker|ink.smash

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
