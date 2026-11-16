# old-laptop-01

**Profile.** old-laptop-01: adult (47), casual; goal: FFA on an old laptop at 25-35 fps; tolerates choppiness; reads the screen late.
**Hands.** reaction 262 ms (SD 59), key timing jitter 2.95 frames, slipped presses 7%, double-tap 74%, short hop 37%, 33 fps input, 1.37 s per menu target, 276 ms per word read (reads 18% of a screen).
**Keys.** arrows. **Patience.** menus 95 s, confused 30 s on one screen, rage-quits after 5 losses in a row.
**Plan.** ffa, teams, boss (x passes).

## What they did
- ffa (seed 114072763): ended; 38 s of game on forest, dealt 180, took 253, RIGHT@141% by Dough, LEFT@112% by an assist/hazard; menus took them about 39 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 114072763 --arg persona=old-laptop-01 --arg fighter=Dora --arg stage=forest --arg kind=ffa`
- ffa (seed 231499509): ended; 56 s of game on forest, dealt 259, took 369, MAX@240% by Saw; menus took them about 39 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 231499509 --arg persona=old-laptop-01 --arg fighter=Naily --arg stage=forest --arg kind=ffa`
- boss (seed 489920462): ended; 66 s of game on goiky, dealt 353, took 110, RIGHT@57% by a boss, RIGHT@101% by a boss, RIGHT@22% by a boss, boss Four; menus took them about 36 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 489920462 --arg persona=old-laptop-01 --arg fighter=Puffball --arg boss=11`
- ffa (seed 835690038): ended; 123 s of game on ice, dealt 196, took 7, BOTTOM@0% fell, RIGHT@7% fell; menus took them about 39 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 835690038 --arg persona=old-laptop-01 --arg fighter=Leafy --arg stage=ice --arg kind=ffa`
- boss (seed 864892314): until; 118 s of game on goiky, dealt 607, took 128, TOP@100% by a boss, LEFT@46% by a boss, RIGHT@59% by a boss, boss The Bug Swarm; menus took them about 36 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 864892314 --arg persona=old-laptop-01 --arg fighter=Firey --arg boss=3`
- teams (seed 623559263): cap; 180 s of game on needle, dealt 286, took 124, no KOs; menus took them about 39 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 623559263 --arg persona=old-laptop-01 --arg fighter=Grassy --arg stage=needle --arg kind=teams`
- teams (seed 662565327): cap; 180 s of game on grandplains, dealt 562, took 91, no KOs; menus took them about 39 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 662565327 --arg persona=old-laptop-01 --arg fighter=Ice Cube --arg stage=grandplains --arg kind=teams`
- teams (seed 141148249): cap; 180 s of game on tlc, dealt 210, took 299, RIGHT@130% by Pickle; menus took them about 39 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 141148249 --arg persona=old-laptop-01 --arg fighter=Paintbrush --arg stage=tlc --arg kind=teams`
- boss (seed 231949216): until; 114 s of game on goiky, dealt 795, took 106, LEFT@40% by a boss, TOP@134% by a boss, boss The Bug Swarm; menus took them about 36 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 231949216 --arg persona=old-laptop-01 --arg fighter=David --arg boss=3`
- teams (seed 805690503): cap; 180 s of game on dreamisle, dealt 355, took 312, MAX@291% by an assist/hazard; menus took them about 39 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 805690503 --arg persona=old-laptop-01 --arg fighter=Blueberry --arg stage=dreamisle --arg kind=teams`
- boss (seed 581803739): ended; 87 s of game on goiky, dealt 352, took 180, RIGHT@92% by a boss, TOP@120% by a boss, LEFT@113% by a boss, boss MePhone4S; menus took them about 36 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 581803739 --arg persona=old-laptop-01 --arg fighter=Loser --arg boss=7`
- teams (seed 709301564): cap; 180 s of game on goiky, dealt 220, took 171, no KOs; menus took them about 43 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 709301564 --arg persona=old-laptop-01 --arg fighter=Lollipop --arg stage=goiky --arg kind=teams`
- ffa (seed 52936426): ended; 153 s of game on shift, dealt 153, took 34, BOTTOM@7% by Pen, BOTTOM@27% by Pen; menus took them about 43 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 52936426 --arg persona=old-laptop-01 --arg fighter=Woody --arg stage=shift --arg kind=ffa`
- ffa (seed 327357925): ended; 96 s of game on incin, dealt 642, took 187, LEFT@83% by Book; menus took them about 39 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 327357925 --arg persona=old-laptop-01 --arg fighter=Trophy --arg stage=incin --arg kind=ffa`
- boss (seed 601186067): running; 140 s of game on goiky, dealt 408, took 144, RIGHT@69% by a boss, RIGHT@98% by a boss, RIGHT@69% by a boss, boss Four; menus took them about 36 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 601186067 --arg persona=old-laptop-01 --arg fighter=Tea Kettle --arg boss=11`

## Where they got stuck or confused
- BUG cant: Naily: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Firey: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Grassy: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Grassy: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Paintbrush: "grab (X+C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Paintbrush: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: David: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Lollipop: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Trophy: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- ffa: 3 presses slipped (a person's missed keys)
- ffa: 5 presses slipped (a person's missed keys)
- boss: was knocked out 15 s into the match (RIGHT at 57%)
- boss: 4 presses slipped (a person's missed keys)
- ffa: was knocked out 1 s into the match (BOTTOM at 0%)
- ffa: 6 presses slipped (a person's missed keys)
- boss: 10 presses slipped (a person's missed keys)
- teams: 28 presses slipped (a person's missed keys)
- teams: 16 presses slipped (a person's missed keys)
- teams: 12 presses slipped (a person's missed keys)
- boss: 13 presses slipped (a person's missed keys)
- teams: 13 presses slipped (a person's missed keys)
- boss: 9 presses slipped (a person's missed keys)
- teams: 20 presses slipped (a person's missed keys)
- ffa: was knocked out 6 s into the match (BOTTOM at 7%)
- ffa: 2 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (boss, stage goiky) (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage dreamisle) (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage grandplains) (in 3 scenes)
- [FEEL] jank-audio-burst (JANK): 8 sound calls in one frame (boss) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage goiky) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 63 ms frame (median 0.6) in ffa; recent move: Dora|rant.grab
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ffa; recent move: Dora|rant.special
- [FEEL] jank-teleport (JANK): Toothpaste moved 157 px in one frame (ffa; last move: Toothpaste|paste.up)
- [FEEL] jank-input-latency (JANK): Dora: smash took 4 frames (67 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 84 ms frame (median 0.5) in ffa; recent move: Dora|rant.smash
- [UI] stray-banner: a match shows "KO'd by Dough − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 54 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 61 ms frame (median 0.4) in ffa; recent move: Naily|spike.ba
- [SLOW] jank-spike (JANK): a 56 ms frame (median 0.4) in ffa; recent move: no recent move
- [FEEL] jank-input-latency (JANK): Naily: atk took 13 frames (217 ms) from the key to the first change on the fighter
- [BUG] cant: Naily: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- [UI] stray-banner: a match shows "KO'd by Saw − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.3) in ffa; recent move: Naily|spike.na
- [SLOW] jank-spike (JANK): a 36 ms frame (median 1.5) in boss; recent move: no recent move
- [FEEL] jank-input-latency (JANK): Puffball: atk took 4 frames (67 ms) from the key to the first change on the fighter
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage ice)
- [FEEL] jank-teleport (JANK): Test Tube moved 162 px in one frame (ffa; last move: Test Tube|testtube.up)
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.3) in boss; recent move: Firey|ember.na
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.1) in boss; recent move: no recent move
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.2) in boss; recent move: Firey|ember.special
- [BUG] cant: Firey: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in boss; recent move: Firey|ember.up
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in boss; recent move: Roboty|antenna.jab
- [FEEL] jank-teleport (JANK): Firey moved 190 px in one frame (boss; last move: no move)
- [FEEL] jank-input-latency (JANK): Firey: atk took 12 frames (200 ms) from the key to the first change on the fighter
- [FEEL] jank-teleport (JANK): Roboty moved 178 px in one frame (boss; last move: no move)
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in boss; recent move: Firey|ember.ut
- [SLOW] jank-spike (JANK): a 62 ms frame (median 0.7) in teams; recent move: no recent move
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.5) in teams; recent move: Tapey|tape.up
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.5) in teams; recent move: Pickle|pickle.da
- [SLOW] jank-spike (JANK): a 60 ms frame (median 0.4) in teams; recent move: Grassy|grasstree.jab
- [SLOW] jank-spike (JANK): a 51 ms frame (median 0.6) in teams; recent move: Grassy|grasstree.grab
- [BUG] cant: Grassy: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.4) in teams; recent move: Grassy|grasstree.smash

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
