# teen-friends-ctf-05

**Profile.** teen-friends-ctf-05: teen (13), casual; goal: play Capture the Flag with friends online; skims text; plans with teammates in the planning menu.
**Hands.** reaction 303 ms (SD 55), key timing jitter 2.19 frames, slipped presses 5%, double-tap 64%, short hop 41%, 60 fps input, 1.1 s per menu target, 264 ms per word read (reads 19% of a screen).
**Keys.** arrows. **Patience.** menus 100 s, confused 32 s on one screen, rage-quits after 6 losses in a row.
**Plan.** ctf-practice, ctf, ctf-spectate, teams (x passes).

## What they did
- ctf-practice (seed 613595332): complete; menus took them about 6 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 613595332 --arg persona=teen-friends-ctf-05`
- ctf-practice (seed 766608210): complete; menus took them about 6 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 766608210 --arg persona=teen-friends-ctf-05`
- ctf-practice (seed 115975427): complete; menus took them about 6 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 115975427 --arg persona=teen-friends-ctf-05`
- teams (seed 676384405): cap; 180 s of game on canyon, dealt 228, took 90, no KOs; menus took them about 36 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 676384405 --arg persona=teen-friends-ctf-05 --arg fighter=Remote --arg stage=canyon --arg kind=teams`
- teams (seed 310678209): cap; 180 s of game on dreamisle, dealt 233, took 351, LEFT@138% by David, RIGHT@173% by David; menus took them about 36 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 310678209 --arg persona=teen-friends-ctf-05 --arg fighter=Goo --arg stage=dreamisle --arg kind=teams`
- ctf (seed 969464259): until; 163 s of game on ctf-factory, dealt 0, took 0, no KOs, map factory; menus took them about 34 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 969464259 --arg persona=teen-friends-ctf-05 --arg fighter=Bonesaw --arg map=factory --arg n=2`
- ctf (seed 913381949): until; 163 s of game on ctf-factory, dealt 5, took 18, no KOs, map factory; menus took them about 34 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 913381949 --arg persona=teen-friends-ctf-05 --arg fighter=Loser --arg map=factory --arg n=2`
- ctf (seed 834298797): until; 172 s of game on ctf-factory, dealt 0, took 184, no KOs, map factory; menus took them about 34 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 834298797 --arg persona=teen-friends-ctf-05 --arg fighter=Bomb --arg map=factory --arg n=2`
- ctf-spectate (seed 206291080): cap; 120 s of game on ctf-factory, dealt 0, took 0, no KOs, map factory; menus took them about 35 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 206291080 --arg persona=teen-friends-ctf-05 --arg fighter=Magnet --arg map=factory --arg n=2`
- ctf-spectate (seed 772482463): cap; 120 s of game on ctf-factory, dealt 0, took 0, no KOs, map factory; menus took them about 35 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 772482463 --arg persona=teen-friends-ctf-05 --arg fighter=Poppy --arg map=factory --arg n=2`
- ctf-spectate (seed 155126647): cap; 120 s of game on ctf-forest, dealt 0, took 0, no KOs, map forest; menus took them about 35 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 155126647 --arg persona=teen-friends-ctf-05 --arg fighter=David --arg map=forest --arg n=3`
- ctf-spectate (seed 625669710): cap; 120 s of game on ctf-forest, dealt 0, took 0, no KOs, map forest; menus took them about 35 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 625669710 --arg persona=teen-friends-ctf-05 --arg fighter=Tapey --arg map=forest --arg n=3`
- ctf-spectate (seed 820527222): cap; 120 s of game on ctf-forest, dealt 0, took 0, no KOs, map forest; menus took them about 35 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 820527222 --arg persona=teen-friends-ctf-05 --arg fighter=Marker --arg map=forest --arg n=3`
- ctf (seed 289038804): until; 163 s of game on ctf-forest, dealt 122, took 51, no KOs, map forest; menus took them about 34 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 289038804 --arg persona=teen-friends-ctf-05 --arg fighter=Tennis Ball --arg map=forest --arg n=3`
- teams (seed 891151683): cap; 180 s of game on bigincin, dealt 173, took 147, no KOs; menus took them about 36 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 891151683 --arg persona=teen-friends-ctf-05 --arg fighter=Remote --arg stage=bigincin --arg kind=teams`
- ctf-practice (seed 162653415): complete; menus took them about 6 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 162653415 --arg persona=teen-friends-ctf-05`
- teams (seed 980365053): cap; 180 s of game on wind, dealt 358, took 119, no KOs; menus took them about 36 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 980365053 --arg persona=teen-friends-ctf-05 --arg fighter=Sidewalky --arg stage=wind --arg kind=teams`
- ctf (seed 189758303): until; 166 s of game on ctf-forest, dealt 0, took 0, no KOs, map forest; menus took them about 34 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 189758303 --arg persona=teen-friends-ctf-05 --arg fighter=Microphone --arg map=forest --arg n=3`
- ctf-practice (seed 262196320): stuck@key; menus took them about 6 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 262196320 --arg persona=teen-friends-ctf-05`
- teams (seed 281515554): cap; 180 s of game on ice, dealt 178, took 130, no KOs; menus took them about 36 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 281515554 --arg persona=teen-friends-ctf-05 --arg fighter=Book --arg stage=ice --arg kind=teams`

## Where they got stuck or confused
- BUG cant: Remote: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG playtest-credit: the player's finisher move type counts 0 hits but the player's finisher move landed 1 (the playtester's own bookkeeping, not the game)
- STUCK match-never-ends: teams match on bigincin is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
- BUG cant: Capture the Flag practice, step 14 of 18 ("key"): a player following the card could not finish it in 45 s
- teams: 8 presses slipped (a person's missed keys)
- teams: 14 presses slipped (a person's missed keys)
- teams: 7 presses slipped (a person's missed keys)
- teams: 13 presses slipped (a person's missed keys)
- teams: 11 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/hide (in 8 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/play (in 7 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ctf/play, stage ctf-factory) (in 7 scenes)
- [FEEL] jank-camera-snap (JANK): the camera jumped 0 px / zoom 0.18 in one frame (ffa) (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage dreamisle) (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams (in 3 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "-N | Roles" (estimated boxes, ctf on ctf-factory) (in 3 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "Home high home high N | Rear high rear high N" (estimated boxes, ctf on ctf-factory) (in 3 scenes)
- [FEEL] long-match: ctf match on ctf-forest was still going after 2 min of game time (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage ice) (in 3 scenes)
- [FEEL] long-match: ctf match on ctf-factory was still going after 2 min of game time (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ctf/play, stage ctf-forest) (in 2 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "-N | Roles" (estimated boxes, ctf on ctf-forest) (in 2 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "Home high home high N | Yard high yard high N" (estimated boxes, ctf on ctf-forest) (in 2 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "+N | Yard high yard high N" (estimated boxes, ctf on ctf-forest) (in 2 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "+N | Home high home high N" (estimated boxes, ctf on ctf-forest) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage wind) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.3) in ctf/play; recent move: Firey|ember.special
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.3) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.3) in ctf/play; recent move: Pen|cap.jab
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.5) in teams; recent move: Fern|photo.up
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.6) in teams; recent move: Remote|battery.smash
- [FEEL] jank-teleport (JANK): Remote moved 160 px in one frame (teams; last move: Remote|battery.up)
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.5) in teams; recent move: Remote|battery.ut
- [FEEL] jank-input-latency (JANK): Remote: atk took 6 frames (100 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.4) in teams; recent move: Remote|battery.jab
- [FEEL] jank-input-latency (JANK): Remote: smash took 10 frames (167 ms) from the key to the first change on the fighter
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage canyon)
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.5) in teams; recent move: Remote|battery.special
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.6) in teams; recent move: no recent move
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.5) in teams; recent move: Remote|battery.ba
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.7) in teams; recent move: Remote|battery.da
- [FEEL] jank-teleport (JANK): Remote moved 300 px in one frame (teams; last move: Remote|battery.finisher)
- [SLOW] jank-spike (JANK): a 54 ms frame (median 0.6) in teams; recent move: Coiny|slap.na
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.5) in teams; recent move: Remote|battery.ua
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.7) in teams; recent move: Coiny|slap.up
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.4) in teams; recent move: Remote|battery.fa
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.3) in teams; recent move: Coiny|slap.jab
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.3) in teams; recent move: Fern|photo.jab

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
