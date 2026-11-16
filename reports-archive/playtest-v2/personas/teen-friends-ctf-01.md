# teen-friends-ctf-01

**Profile.** teen-friends-ctf-01: teen (14), casual; goal: play Capture the Flag with friends online; skims text; plans with teammates in the planning menu.
**Hands.** reaction 283 ms (SD 40), key timing jitter 2.03 frames, slipped presses 5%, double-tap 64%, short hop 51%, 60 fps input, 1.05 s per menu target, 233 ms per word read (reads 30% of a screen).
**Keys.** arrows. **Patience.** menus 71 s, confused 34 s on one screen, rage-quits after 6 losses in a row.
**Plan.** ctf-practice, ctf, ctf-spectate, teams (x passes).

## What they did
- ctf-practice (seed 294721260): complete; menus took them about 8 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 294721260 --arg persona=teen-friends-ctf-01`
- ctf-practice (seed 610093808): complete; menus took them about 8 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 610093808 --arg persona=teen-friends-ctf-01`
- ctf-practice (seed 196217275): complete; menus took them about 8 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 196217275 --arg persona=teen-friends-ctf-01`
- teams (seed 368034960): cap; 180 s of game on tlc, dealt 245, took 174, TOP@68% by Cherries; menus took them about 45 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 368034960 --arg persona=teen-friends-ctf-01 --arg fighter=Dora --arg stage=tlc --arg kind=teams`
- teams (seed 30696512): cap; 180 s of game on pillars, dealt 149, took 106, LEFT@6% fell; menus took them about 45 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 30696512 --arg persona=teen-friends-ctf-01 --arg fighter=Match --arg stage=pillars --arg kind=teams`
- ctf (seed 210287127): until; 170 s of game on ctf-castle, dealt 161, took 53, no KOs, map castle; menus took them about 43 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 210287127 --arg persona=teen-friends-ctf-01 --arg fighter=Donut --arg map=castle --arg n=3`
- ctf (seed 954919802): until; 187 s of game on ctf-castle, dealt 222, took 56, no KOs, map castle; menus took them about 43 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 954919802 --arg persona=teen-friends-ctf-01 --arg fighter=Gaty --arg map=castle --arg n=3`
- ctf (seed 725862543): until; 203 s of game on ctf-castle, dealt 72, took 125, no KOs, map castle; menus took them about 43 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 725862543 --arg persona=teen-friends-ctf-01 --arg fighter=Woody --arg map=castle --arg n=3`
- ctf-spectate (seed 952577140): cap; 120 s of game on ctf-castle, dealt 0, took 0, no KOs, map castle; menus took them about 44 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 952577140 --arg persona=teen-friends-ctf-01 --arg fighter=Bot --arg map=castle --arg n=3`
- ctf-spectate (seed 766077803): cap; 120 s of game on ctf-castle, dealt 0, took 0, no KOs, map castle; menus took them about 44 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 766077803 --arg persona=teen-friends-ctf-01 --arg fighter=Pickle --arg map=castle --arg n=3`
- ctf-spectate (seed 612328410): cap; 120 s of game on ctf-mines, dealt 0, took 0, no KOs, map mines; menus took them about 44 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 612328410 --arg persona=teen-friends-ctf-01 --arg fighter=Tissues --arg map=mines --arg n=4`
- ctf-spectate (seed 213384576): cap; 120 s of game on ctf-mines, dealt 0, took 0, no KOs, map mines; menus took them about 44 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 213384576 --arg persona=teen-friends-ctf-01 --arg fighter=Tree --arg map=mines --arg n=4`
- ctf-spectate (seed 135619419): cap; 120 s of game on ctf-mines, dealt 0, took 0, no KOs, map mines; menus took them about 44 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 135619419 --arg persona=teen-friends-ctf-01 --arg fighter=Cherries --arg map=mines --arg n=4`
- teams (seed 630162105): cap; 180 s of game on pillars, dealt 596, took 139, TOP@139% by Bubble; menus took them about 49 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 630162105 --arg persona=teen-friends-ctf-01 --arg fighter=David --arg stage=pillars --arg kind=teams`
- ctf (seed 851759417): until; 168 s of game on ctf-mines, dealt 66, took 39, no KOs, map mines; menus took them about 43 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 851759417 --arg persona=teen-friends-ctf-01 --arg fighter=Teddy Bear --arg map=mines --arg n=4`
- ctf-practice (seed 411190883): complete; menus took them about 8 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 411190883 --arg persona=teen-friends-ctf-01`
- teams (seed 673582719): cap; 180 s of game on grandplains, dealt 322, took 91, no KOs; menus took them about 45 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 673582719 --arg persona=teen-friends-ctf-01 --arg fighter=Saw --arg stage=grandplains --arg kind=teams`
- ctf (seed 289298884): until; 171 s of game on ctf-mines, dealt 142, took 42, no KOs, map mines; menus took them about 43 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 289298884 --arg persona=teen-friends-ctf-01 --arg fighter=Liy --arg map=mines --arg n=4`
- teams (seed 236336825): cap; 180 s of game on shift, dealt 92, took 54, no KOs; menus took them about 45 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 236336825 --arg persona=teen-friends-ctf-01 --arg fighter=Firey Jr. --arg stage=shift --arg kind=teams`
- ctf-practice (seed 23129335): complete; menus took them about 8 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 23129335 --arg persona=teen-friends-ctf-01`

## Where they got stuck or confused
- BUG cant: Dora: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG playtest-credit: the player's finisher move type counts 0 hits but the player's finisher move landed 1 (the playtester's own bookkeeping, not the game)
- teams: 24 presses slipped (a person's missed keys)
- teams: was knocked out 15 s into the match (LEFT at 6%)
- teams: 6 presses slipped (a person's missed keys)
- teams: 19 presses slipped (a person's missed keys)
- teams: 15 presses slipped (a person's missed keys)
- teams: 8 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/play (in 9 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/hide (in 6 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ctf/play, stage ctf-castle) (in 6 scenes)
- [FEEL] jank-camera-snap (JANK): the camera jumped 0 px / zoom 0.18 in one frame (ffa) (in 5 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage shift) (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage tlc) (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage pillars) (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage grandplains) (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/fix (in 3 scenes)
- [FEEL] long-match: ctf match on ctf-mines was still going after 2 min of game time (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ctf/play, stage ctf-mines) (in 3 scenes)
- [FEEL] long-match: teams match on pillars was still going after 3 min of game time (in 2 scenes)
- [FEEL] long-match: ctf match on ctf-castle was still going after 2 min of game time (in 2 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "-N | Roles" (estimated boxes, ctf on ctf-mines) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.3) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 64 ms frame (median 0.2) in ctf/hide; recent move: Firey|ember.jab
- [SLOW] jank-spike (JANK): a 54 ms frame (median 0.2) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.3) in ctf/play; recent move: Firey|ember.special
- [SLOW] jank-spike (JANK): a 54 ms frame (median 0.3) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 104 ms frame (median 0.9) in teams; recent move: Dora|rant.down
- [SLOW] jank-spike (JANK): a 56 ms frame (median 1.2) in teams; recent move: Dora|rant.usmash
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.7) in teams; recent move: no recent move
- [FEEL] jank-air-hang (JANK): Puffball hung motionless in the air for 45 frames (teams) at 3457,937
- [SLOW] jank-spike (JANK): a 54 ms frame (median 0.7) in teams; recent move: Cherries|cherries.up
- [SLOW] jank-spike (JANK): a 67 ms frame (median 1.1) in teams; recent move: Dora|rant.jab
- [SLOW] jank-spike (JANK): a 56 ms frame (median 1.0) in teams; recent move: Dora|rant.grab
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.9) in teams; recent move: Naily|spike.fa
- [SLOW] jank-spike (JANK): a 64 ms frame (median 0.9) in teams; recent move: Dora|rant.ua
- [SLOW] jank-spike (JANK): a 40 ms frame (median 1.0) in teams; recent move: Dora|rant.fa
- [SLOW] jank-spike (JANK): a 54 ms frame (median 0.8) in teams; recent move: Puffball|fly.jab
- [SLOW] jank-spike (JANK): a 97 ms frame (median 1.0) in teams; recent move: Dora|rant.special
- [SLOW] jank-spike (JANK): a 52 ms frame (median 1.0) in teams; recent move: TV|static.up
- [BUG] cant: Dora: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.7) in teams; recent move: Dora|rant.smash
- [SLOW] jank-spike (JANK): a 34 ms frame (median 1.0) in teams; recent move: Puffball|fly.up
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.9) in teams; recent move: Cherries|cherries.ba
- [SLOW] jank-spike (JANK): a 50 ms frame (median 1.2) in teams; recent move: Cherries|cherries.smash
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.8) in teams; recent move: Dora|rant.ba
- [SLOW] jank-spike (JANK): a 35 ms frame (median 1.2) in teams; recent move: Needle|uppercut

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
