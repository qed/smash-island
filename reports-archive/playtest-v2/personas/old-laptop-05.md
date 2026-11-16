# old-laptop-05

**Profile.** old-laptop-05: adult (24), casual; goal: FFA on an old laptop at 25-35 fps; tolerates choppiness; reads the screen late.
**Hands.** reaction 250 ms (SD 62), key timing jitter 2.01 frames, slipped presses 8%, double-tap 57%, short hop 51%, 26 fps input, 1.37 s per menu target, 267 ms per word read (reads 21% of a screen).
**Keys.** arrows. **Patience.** menus 74 s, confused 34 s on one screen, rage-quits after 4 losses in a row.
**Plan.** ffa, teams, boss (x passes).

## What they did
- ffa (seed 911056450): ended; 32 s of game on shift, dealt 184, took 43, BOTTOM@15% by Fanny, BOTTOM@28% by Fanny; menus took them about 46 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 911056450 --arg persona=old-laptop-05 --arg fighter=Naily --arg stage=shift --arg kind=ffa`
- boss (seed 636190165): ended; 69 s of game on goiky, dealt 160, took 103, RIGHT@24% by ?, LEFT@64% by a boss, RIGHT@127% by a boss, boss MePhone4S; menus took them about 39 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 636190165 --arg persona=old-laptop-05 --arg fighter=Box --arg boss=7`
- boss (seed 4850866): ended; 42 s of game on goiky, dealt 301, took 168, LEFT@44% by a boss, RIGHT@99% by a boss, RIGHT@26% by a boss, boss The Bug Swarm; menus took them about 39 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 4850866 --arg persona=old-laptop-05 --arg fighter=Goo --arg boss=3`
- ffa (seed 898529254): cap; 180 s of game on bigincin, dealt 313, took 460, TOP@206% by Liy; menus took them about 46 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 898529254 --arg persona=old-laptop-05 --arg fighter=Gaty --arg stage=bigincin --arg kind=ffa`
- ffa (seed 522771488): cap; 180 s of game on skytower, dealt 347, took 145, BOTTOM@5% fell, BOTTOM@0% fell; menus took them about 42 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 522771488 --arg persona=old-laptop-05 --arg fighter=Test Tube --arg stage=skytower --arg kind=ffa`
- teams (seed 674478965): cap; 180 s of game on skytower, dealt 213, took 260, MAX@248% by an assist/hazard; menus took them about 42 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 674478965 --arg persona=old-laptop-05 --arg fighter=Paintbrush --arg stage=skytower --arg kind=teams`
- teams (seed 873997709): cap; 180 s of game on canyon, dealt 189, took 90, no KOs; menus took them about 42 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 873997709 --arg persona=old-laptop-05 --arg fighter=David --arg stage=canyon --arg kind=teams`
- teams (seed 70862917): cap; 180 s of game on canyon, dealt 197, took 474, no KOs; menus took them about 42 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 70862917 --arg persona=old-laptop-05 --arg fighter=Bomb --arg stage=canyon --arg kind=teams`
- teams (seed 805466795): cap; 180 s of game on needle, dealt 138, took 212, LEFT@212% by Fan; menus took them about 46 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 805466795 --arg persona=old-laptop-05 --arg fighter=Roboty --arg stage=needle --arg kind=teams`
- ffa (seed 172015522): ended; 70 s of game on forest, dealt 239, took 384, RIGHT@83% by Bomb, LEFT@82% by Profily, TOP@219% by Bomb; menus took them about 42 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 172015522 --arg persona=old-laptop-05 --arg fighter=Tea Kettle --arg stage=forest --arg kind=ffa`
- teams (seed 723388110): cap; 180 s of game on bigincin, dealt 207, took 405, RIGHT@173% by Grassy; menus took them about 42 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 723388110 --arg persona=old-laptop-05 --arg fighter=Woody --arg stage=bigincin --arg kind=teams`
- boss (seed 669911442): ended; 95 s of game on goiky, dealt 195, took 94, RIGHT@66% by ?, LEFT@99% by a boss, RIGHT@46% by a boss, boss MePhone4S; menus took them about 39 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 669911442 --arg persona=old-laptop-05 --arg fighter=Snowball --arg boss=7`
- boss (seed 912333601): ended; 111 s of game on goiky, dealt 463, took 218, LEFT@77% by a boss, RIGHT@70% by a boss, RIGHT@88% by a boss, boss Four; menus took them about 39 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 912333601 --arg persona=old-laptop-05 --arg fighter=Cammy --arg boss=11`
- boss (seed 194038129): until; 99 s of game on goiky, dealt 708, took 303, RIGHT@115% by a boss, LEFT@112% by a boss, boss The Bug Swarm; menus took them about 39 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 194038129 --arg persona=old-laptop-05 --arg fighter=Lifering --arg boss=3`
- ffa (seed 478786853): cap; 180 s of game on canyon, dealt 285, took 175, BOTTOM@0% fell, RIGHT@175% by Saw; menus took them about 42 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 478786853 --arg persona=old-laptop-05 --arg fighter=Leafy --arg stage=canyon --arg kind=ffa`

## Where they got stuck or confused
- BUG cant: Gaty: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Test Tube: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Paintbrush: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Paintbrush: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- STUCK match-never-ends: teams match on canyon is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
- BUG cant: Tea Kettle: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Tea Kettle: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Tea Kettle: "grab (X+C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Woody: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Lifering: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- ffa: was knocked out 7 s into the match (BOTTOM at 15%)
- ffa: 5 presses slipped (a person's missed keys)
- boss: was knocked out 4 s into the match (RIGHT at 24%)
- boss: 8 presses slipped (a person's missed keys)
- boss: was knocked out 9 s into the match (LEFT at 44%)
- boss: 6 presses slipped (a person's missed keys)
- ffa: 18 presses slipped (a person's missed keys)
- ffa: was knocked out 15 s into the match (BOTTOM at 5%)
- ffa: 24 presses slipped (a person's missed keys)
- teams: 19 presses slipped (a person's missed keys)
- teams: 22 presses slipped (a person's missed keys)
- teams: 20 presses slipped (a person's missed keys)
- ffa: was knocked out 10 s into the match (RIGHT at 83%)
- teams: 18 presses slipped (a person's missed keys)
- boss: was knocked out 14 s into the match (RIGHT at 66%)
- boss: 7 presses slipped (a person's missed keys)
- boss: 13 presses slipped (a person's missed keys)
- ffa: 13 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage canyon) (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage needle) (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage bigincin) (in 3 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 2 scenes)
- [FEEL] jank-teleport (JANK): Bow moved 240 px in one frame (teams; last move: Bow|chair.special) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (boss, stage goiky) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 136 ms frame (median 0.3) in ffa; recent move: Naily|spike.special
- [UI] stray-banner: a match shows "KO'd by Fanny − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.5) in ffa; recent move: Naily|spike.ua
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.6) in ffa; recent move: Naily|spike.usmash
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.5) in ffa; recent move: no recent move
- [FEEL] jank-input-latency (JANK): Naily: atk took 13 frames (217 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 85 ms frame (median 0.3) in ffa; recent move: Naily|spike.da
- [SLOW] jank-spike (JANK): a 64 ms frame (median 0.3) in ffa; recent move: Naily|spike.jab
- [FEEL] jank-input-latency (JANK): Goo: atk took 4 frames (67 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.5) in boss; recent move: Goo|engulf.na
- [FEEL] jank-teleport (JANK): Cake moved 258 px in one frame (ffa; last move: no move)
- [FEEL] jank-input-latency (JANK): Gaty: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.2) in ffa; recent move: Gaty|reflect.smash
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.3) in ffa; recent move: Liy|switch.special
- [BUG] cant: Gaty: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- [SLOW] jank-spike (JANK): a 67 ms frame (median 0.4) in ffa; recent move: Liy|switch.bthrow
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.5) in ffa; recent move: Liy|switch.grab
- [UI] stray-banner: a match shows "KO'd by Liy − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 91 ms frame (median 0.3) in ffa; recent move: Cake|atstake.up
- [SLOW] jank-spike (JANK): a 52 ms frame (median 0.3) in ffa; recent move: Gaty|reflect.jab
- [SLOW] jank-spike (JANK): a 52 ms frame (median 0.3) in ffa; recent move: Liy|uppercut
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.3) in ffa; recent move: Gaty|reflect.special
- [FEEL] jank-teleport (JANK): Gaty moved 461 px in one frame (ffa; last move: no move)
- [FEEL] jank-teleport (JANK): Liy moved 461 px in one frame (ffa; last move: Liy|spin)
- [FEEL] long-match: ffa match on bigincin was still going after 3 min of game time
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.6) in ffa; recent move: Teddy Bear|paintball.up
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.6) in ffa; recent move: Test Tube|testtube.special
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.6) in ffa; recent move: Teddy Bear|paintball.dt
- [UI] stray-banner: a match shows "KO'd by Teddy Bear − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.6) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 68 ms frame (median 0.5) in ffa; recent move: Teddy Bear|paintball.jab
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.6) in ffa; recent move: Rocky|barf.smash

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
