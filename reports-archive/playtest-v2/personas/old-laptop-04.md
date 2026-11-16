# old-laptop-04

**Profile.** old-laptop-04: adult (48), casual; goal: FFA on an old laptop at 25-35 fps; tolerates choppiness; reads the screen late.
**Hands.** reaction 329 ms (SD 62), key timing jitter 2.26 frames, slipped presses 5%, double-tap 65%, short hop 46%, 27 fps input, 0.93 s per menu target, 268 ms per word read (reads 18% of a screen).
**Keys.** arrows. **Patience.** menus 90 s, confused 35 s on one screen, rage-quits after 5 losses in a row.
**Plan.** ffa, teams, boss (x passes).

## What they did
- boss (seed 491310072): ended; 53 s of game on goiky, dealt 92, took 0, TOP@89% by ?, TOP@97% by ?, RIGHT@66% by ?, boss Evil Leafy; menus took them about 32 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 491310072 --arg persona=old-laptop-04 --arg fighter=Cake --arg boss=6`
- boss (seed 245484162): ended; 64 s of game on goiky, dealt 97, took 102, RIGHT@70% by a boss, LEFT@39% by a boss, RIGHT@12% fell, boss Firey Speaker Box; menus took them about 32 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 245484162 --arg persona=old-laptop-04 --arg fighter=Rocky --arg boss=2`
- ffa (seed 937663237): ended; 78 s of game on wind, dealt 88, took 86, BOTTOM@71% by Bubble, RIGHT@15% by Remote; menus took them about 36 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 937663237 --arg persona=old-laptop-04 --arg fighter=Barf Bag --arg stage=wind --arg kind=ffa`
- ffa (seed 836701990): ended; 115 s of game on yoyle, dealt 358, took 105, BOTTOM@0% fell, BOTTOM@63% fell; menus took them about 36 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 836701990 --arg persona=old-laptop-04 --arg fighter=Remote --arg stage=yoyle --arg kind=ffa`
- ffa (seed 664859771): ended; 145 s of game on ice, dealt 409, took 158, BOTTOM@0% fell, BOTTOM@79% fell, RIGHT@79% by Bell; menus took them about 36 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 664859771 --arg persona=old-laptop-04 --arg fighter=Dora --arg stage=ice --arg kind=ffa`
- teams (seed 48716477): cap; 180 s of game on shift, dealt 549, took 130, no KOs; menus took them about 33 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 48716477 --arg persona=old-laptop-04 --arg fighter=Snowball --arg stage=shift --arg kind=teams`
- teams (seed 173126549): cap; 180 s of game on grandplains, dealt 333, took 116, BOTTOM@92% by Needle; menus took them about 33 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 173126549 --arg persona=old-laptop-04 --arg fighter=Nickel (II) --arg stage=grandplains --arg kind=teams`
- ffa (seed 290121103): ended; 23 s of game on needle, dealt 97, took 49, no KOs; menus took them about 33 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 290121103 --arg persona=old-laptop-04 --arg fighter=Lifering --arg stage=needle --arg kind=ffa`
- boss (seed 92997132): ended; 82 s of game on goiky, dealt 371, took 131, LEFT@55% by a boss, RIGHT@33% by a boss, LEFT@116% by a boss, boss Springy; menus took them about 32 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 92997132 --arg persona=old-laptop-04 --arg fighter=Bracelety --arg boss=10`
- teams (seed 370445384): cap; 180 s of game on canyon, dealt 422, took 402, MAX@246% by Cheesy; menus took them about 33 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 370445384 --arg persona=old-laptop-04 --arg fighter=Paintbrush --arg stage=canyon --arg kind=teams`
- teams (seed 428651835): cap; 180 s of game on tlc, dealt 188, took 215, TOP@215% by Goo; menus took them about 36 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 428651835 --arg persona=old-laptop-04 --arg fighter=Ruler --arg stage=tlc --arg kind=teams`
- teams (seed 998891237): cap; 180 s of game on ice, dealt 256, took 361, MAX@265% by Coiny; menus took them about 33 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 998891237 --arg persona=old-laptop-04 --arg fighter=Remote --arg stage=ice --arg kind=teams`
- ffa (seed 337643575): ended; 26 s of game on shift, dealt 92, took 40, BOTTOM@7% by Ice Cube, BOTTOM@33% fell; menus took them about 33 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 337643575 --arg persona=old-laptop-04 --arg fighter=Match --arg stage=shift --arg kind=ffa`
- boss (seed 45262111): ended; 87 s of game on goiky, dealt 165, took 0, TOP@59% by ?, TOP@63% by ?, TOP@79% by ?, boss Evil Leafy; menus took them about 32 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 45262111 --arg persona=old-laptop-04 --arg fighter=Grassy --arg boss=6`
- boss (seed 238632814): ended; 75 s of game on goiky, dealt 174, took 138, RIGHT@91% by a boss, TOP@78% by a boss, TOP@99% by a boss, boss Firey Speaker Box; menus took them about 32 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 238632814 --arg persona=old-laptop-04 --arg fighter=Naily --arg boss=2`

## Where they got stuck or confused
- BUG cant: Remote: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Dora: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Nickel (II): "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Lifering: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Bracelety: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Paintbrush: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Ruler: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Remote: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Grassy: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- boss: 1 presses slipped (a person's missed keys)
- boss: was knocked out 12 s into the match (RIGHT at 70%)
- boss: 3 presses slipped (a person's missed keys)
- ffa: was knocked out 3 s into the match (BOTTOM at 0%)
- ffa: 4 presses slipped (a person's missed keys)
- ffa: 8 presses slipped (a person's missed keys)
- teams: 11 presses slipped (a person's missed keys)
- teams: 9 presses slipped (a person's missed keys)
- ffa: 2 presses slipped (a person's missed keys)
- boss: 9 presses slipped (a person's missed keys)
- teams: 12 presses slipped (a person's missed keys)
- teams: 6 presses slipped (a person's missed keys)
- ffa: was knocked out 2 s into the match (BOTTOM at 7%)
- ffa: 1 presses slipped (a person's missed keys)
- boss: 5 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage shift) (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage tlc) (in 4 scenes)
- [FEEL] jank-teleport (JANK): Bubble moved 154 px in one frame (ffa; last move: Bubble|float.up) (in 2 scenes)
- [UI] stray-banner: a match shows "KO'd by Bubble − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed) (in 2 scenes)
- [FEEL] jank-input-latency (JANK): Remote: atk took 7 frames (117 ms) from the key to the first change on the fighter (in 2 scenes)
- [FEEL] jank-input-latency (JANK): Remote: smash took 5 frames (84 ms) from the key to the first change on the fighter (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage grandplains) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage canyon) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.1) in boss; recent move: Cake|atstake.smash
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.1) in boss; recent move: Cake|atstake.ut
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.5) in ffa; recent move: Barf Bag|splash.dt
- [SLOW] jank-spike (JANK): a 64 ms frame (median 0.3) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.6) in ffa; recent move: Remote|battery.special
- [FEEL] jank-input-latency (JANK): Barf Bag: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.6) in ffa; recent move: Barf Bag|splash.down
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.7) in ffa; recent move: Blocky|anvil.smash
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.6) in ffa; recent move: Remote|battery.ut
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.6) in ffa; recent move: Remote|battery.jab
- [FEEL] jank-teleport (JANK): Remote moved 151 px in one frame (ffa; last move: Remote|battery.up)
- [SLOW] jank-spike (JANK): a 49 ms frame (median 0.7) in ffa; recent move: Barf Bag|splash.ua
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa
- [SLOW] jank-spike (JANK): a 52 ms frame (median 0.5) in ffa; recent move: Barf Bag|splash.fa
- [SLOW] jank-spike (JANK): a 68 ms frame (median 0.6) in ffa; recent move: Remote|battery.up
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.8) in ffa; recent move: Barf Bag|splash.jab
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.7) in ffa; recent move: Barf Bag|splash.da
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.5) in ffa; recent move: Barf Bag|splash.smash
- [SLOW] jank-spike (JANK): a 52 ms frame (median 0.3) in ffa; recent move: Bubble|float.jab
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.6) in ffa; recent move: Barf Bag|splash.na
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.7) in ffa; recent move: Blocky|anvil.fthrow
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.7) in ffa; recent move: Remote|battery.smash
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.8) in ffa; recent move: Barf Bag|splash.special
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.3) in ffa; recent move: Bubble|float.up
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.3) in ffa; recent move: Bubble|float.ut
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.5) in ffa; recent move: Bubble|float.fa
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.6) in ffa; recent move: Bubble|uppercut
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.7) in ffa; recent move: Remote|battery.finisher
- [FEEL] jank-teleport (JANK): Remote moved 300 px in one frame (ffa; last move: Remote|battery.finisher)
- [SLOW] jank-spike (JANK): a 55 ms frame (median 0.3) in ffa; recent move: Bubble|spit
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in ffa; recent move: Bubble|fsburst

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
