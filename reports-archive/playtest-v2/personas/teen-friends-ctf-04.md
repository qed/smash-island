# teen-friends-ctf-04

**Profile.** teen-friends-ctf-04: teen (14), casual; goal: play Capture the Flag with friends online; skims text; plans with teammates in the planning menu.
**Hands.** reaction 270 ms (SD 48), key timing jitter 2.78 frames, slipped presses 6%, double-tap 77%, short hop 64%, 60 fps input, 1.14 s per menu target, 245 ms per word read (reads 20% of a screen).
**Keys.** arrows. **Patience.** menus 102 s, confused 34 s on one screen, rage-quits after 5 losses in a row.
**Plan.** ctf-practice, ctf, ctf-spectate, teams (x passes).

## What they did
- ctf-practice (seed 515874332): complete; menus took them about 6 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 515874332 --arg persona=teen-friends-ctf-04`
- ctf-practice (seed 913213309): complete; menus took them about 6 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 913213309 --arg persona=teen-friends-ctf-04`
- ctf-practice (seed 987160648): complete; menus took them about 6 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 987160648 --arg persona=teen-friends-ctf-04`
- teams (seed 161765154): cap; 180 s of game on incin, dealt 216, took 107, no KOs; menus took them about 36 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 161765154 --arg persona=teen-friends-ctf-04 --arg fighter=Ice Cube --arg stage=incin --arg kind=teams`
- teams (seed 706090494): cap; 180 s of game on fortress, dealt 157, took 144, no KOs; menus took them about 36 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 706090494 --arg persona=teen-friends-ctf-04 --arg fighter=Match --arg stage=fortress --arg kind=teams`
- ctf (seed 566026435): until; 170 s of game on ctf-castle, dealt 322, took 134, no KOs, map castle; menus took them about 34 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 566026435 --arg persona=teen-friends-ctf-04 --arg fighter=Spikey --arg map=castle --arg n=3`
- ctf (seed 218625672): until; 179 s of game on ctf-castle, dealt 163, took 267, no KOs, map castle; menus took them about 34 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 218625672 --arg persona=teen-friends-ctf-04 --arg fighter=Jack --arg map=castle --arg n=3`
- ctf (seed 457187878): until; 174 s of game on ctf-castle, dealt 200, took 100, no KOs, map castle; menus took them about 34 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 457187878 --arg persona=teen-friends-ctf-04 --arg fighter=TV --arg map=castle --arg n=3`
- ctf-spectate (seed 60020535): cap; 120 s of game on ctf-castle, dealt 0, took 0, no KOs, map castle; menus took them about 35 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 60020535 --arg persona=teen-friends-ctf-04 --arg fighter=MeTag --arg map=castle --arg n=3`
- ctf-spectate (seed 449533204): cap; 120 s of game on ctf-castle, dealt 0, took 0, no KOs, map castle; menus took them about 35 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 449533204 --arg persona=teen-friends-ctf-04 --arg fighter=Marker --arg map=castle --arg n=3`
- ctf-spectate (seed 56751817): cap; 120 s of game on ctf-mines, dealt 0, took 0, no KOs, map mines; menus took them about 35 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 56751817 --arg persona=teen-friends-ctf-04 --arg fighter=Loser --arg map=mines --arg n=4`
- ctf-spectate (seed 244127774): cap; 120 s of game on ctf-mines, dealt 0, took 0, no KOs, map mines; menus took them about 35 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 244127774 --arg persona=teen-friends-ctf-04 --arg fighter=Fries --arg map=mines --arg n=4`
- teams (seed 907393405): cap; 180 s of game on forest, dealt 36, took 836, no KOs; menus took them about 36 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 907393405 --arg persona=teen-friends-ctf-04 --arg fighter=Saw --arg stage=forest --arg kind=teams`
- ctf-spectate (seed 318617995): cap; 120 s of game on ctf-mines, dealt 0, took 0, no KOs, map mines; menus took them about 35 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 318617995 --arg persona=teen-friends-ctf-04 --arg fighter=Apple --arg map=mines --arg n=4`
- ctf (seed 410892842): until; 169 s of game on ctf-mines, dealt 33, took 94, no KOs, map mines; menus took them about 34 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 410892842 --arg persona=teen-friends-ctf-04 --arg fighter=David --arg map=mines --arg n=4`
- ctf-practice (seed 940623676): complete; menus took them about 6 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 940623676 --arg persona=teen-friends-ctf-04`
- teams (seed 776650961): cap; 180 s of game on shift, dealt 355, took 293, LEFT@121% by Taco; menus took them about 36 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 776650961 --arg persona=teen-friends-ctf-04 --arg fighter=Bell --arg stage=shift --arg kind=teams`
- ctf (seed 590289113): until; 170 s of game on ctf-mines, dealt 64, took 224, no KOs, map mines; menus took them about 34 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 590289113 --arg persona=teen-friends-ctf-04 --arg fighter=Bomb --arg map=mines --arg n=4`
- teams (seed 475833422): cap; 180 s of game on tlc, dealt 457, took 85, no KOs; menus took them about 36 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 475833422 --arg persona=teen-friends-ctf-04 --arg fighter=Bot --arg stage=tlc --arg kind=teams`
- ctf-practice (seed 545621594): complete; menus took them about 6 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 545621594 --arg persona=teen-friends-ctf-04`

## Where they got stuck or confused
- STUCK match-never-ends: teams match on forest is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
- BUG cant: Bell: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- teams: 15 presses slipped (a person's missed keys)
- teams: 21 presses slipped (a person's missed keys)
- teams: 19 presses slipped (a person's missed keys)
- teams: 22 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/hide (in 11 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/play (in 11 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ctf/play, stage ctf-mines) (in 6 scenes)
- [FEEL] jank-camera-snap (JANK): the camera jumped 0 px / zoom 0.18 in one frame (ffa) (in 5 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage incin) (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/fix (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams (in 3 scenes)
- [FEEL] long-match: ctf match on ctf-mines was still going after 2 min of game time (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage tlc) (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage fortress) (in 2 scenes)
- [FEEL] long-match: ctf match on ctf-castle was still going after 2 min of game time (in 2 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "-N | Roles" (estimated boxes, ctf on ctf-mines) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage shift) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.3) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.2) in ctf/hide; recent move: Firey|ember.jab
- [SLOW] jank-spike (JANK): a 107 ms frame (median 0.2) in ctf/play; recent move: Firey|ember.special
- [SLOW] jank-spike (JANK): a 69 ms frame (median 0.2) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 54 ms frame (median 0.3) in ctf/play; recent move: Pen|cap.jab
- [SLOW] jank-spike (JANK): a 48 ms frame (median 0.3) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.4) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.5) in teams; recent move: Ice Cube|shatter.jab
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.5) in teams; recent move: Ice Cube|shatter.smash
- [SLOW] jank-spike (JANK): a 65 ms frame (median 0.3) in teams; recent move: no recent move
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.6) in teams; recent move: Balloon|airrel.up
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.6) in teams; recent move: Ice Cube|shatter.fa
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.7) in teams; recent move: Ice Cube|shatter.special
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.6) in teams; recent move: Basketball|dribble.special
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.4) in teams; recent move: Basketball|dribble.up
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.8) in teams; recent move: Basketball|dribble.da
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.8) in teams; recent move: Balloon|airrel.special
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.7) in teams; recent move: Basketball|dribble.grab
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.6) in teams; recent move: Teardrop|kick.special
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.5) in teams; recent move: Ice Cube|shatter.na
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.9) in teams; recent move: Teardrop|kick.finisher
- [FEEL] jank-teleport (JANK): Balloon moved 172 px in one frame (teams; last move: no move)
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.6) in teams; recent move: Teardrop|kick.up
- [SLOW] jank-spike (JANK): a 50 ms frame (median 0.5) in teams; recent move: Balloon|airrel.jab
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.5) in teams; recent move: Ice Cube|shatter.ba
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.5) in teams; recent move: Balloon|airrel.down
- [SLOW] jank-spike (JANK): a 55 ms frame (median 0.5) in teams; recent move: Balloon|airrel.dt

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
