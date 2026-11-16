# teen-friends-ctf-02

**Profile.** teen-friends-ctf-02: teen (14), casual; goal: play Capture the Flag with friends online; skims text; plans with teammates in the planning menu.
**Hands.** reaction 242 ms (SD 55), key timing jitter 2.34 frames, slipped presses 6%, double-tap 68%, short hop 43%, 60 fps input, 0.75 s per menu target, 292 ms per word read (reads 20% of a screen).
**Keys.** arrows. **Patience.** menus 61 s, confused 34 s on one screen, rage-quits after 4 losses in a row.
**Plan.** ctf-practice, ctf, ctf-spectate, teams (x passes).

## What they did
- ctf-practice (seed 25631561): complete; menus took them about 6 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 25631561 --arg persona=teen-friends-ctf-02`
- ctf-practice (seed 168564122): complete; menus took them about 6 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 168564122 --arg persona=teen-friends-ctf-02`
- ctf-practice (seed 853174051): stuck@key; menus took them about 6 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 853174051 --arg persona=teen-friends-ctf-02`
- teams (seed 706956590): cap; 180 s of game on bigincin, dealt 179, took 190, no KOs; menus took them about 37 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 706956590 --arg persona=teen-friends-ctf-02 --arg fighter=Cammy --arg stage=bigincin --arg kind=teams`
- teams (seed 201749630): cap; 180 s of game on yoyle, dealt 315, took 247, TOP@231% by Match; menus took them about 39 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 201749630 --arg persona=teen-friends-ctf-02 --arg fighter=Snowball --arg stage=yoyle --arg kind=teams`
- ctf (seed 193618860): until; 163 s of game on ctf-factory, dealt 0, took 0, no KOs, map factory; menus took them about 35 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 193618860 --arg persona=teen-friends-ctf-02 --arg fighter=Coiny --arg map=factory --arg n=2`
- ctf (seed 835345444): until; 170 s of game on ctf-factory, dealt 0, took 0, no KOs, map factory; menus took them about 35 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 835345444 --arg persona=teen-friends-ctf-02 --arg fighter=Coiny --arg map=factory --arg n=2`
- ctf (seed 961950447): until; 171 s of game on ctf-factory, dealt 35, took 25, no KOs, map factory; menus took them about 35 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 961950447 --arg persona=teen-friends-ctf-02 --arg fighter=Bot --arg map=factory --arg n=2`
- ctf-spectate (seed 92956973): cap; 120 s of game on ctf-factory, dealt 0, took 0, no KOs, map factory; menus took them about 36 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 92956973 --arg persona=teen-friends-ctf-02 --arg fighter=Knife --arg map=factory --arg n=2`
- ctf-spectate (seed 797132465): cap; 120 s of game on ctf-factory, dealt 0, took 0, no KOs, map factory; menus took them about 36 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 797132465 --arg persona=teen-friends-ctf-02 --arg fighter=Match --arg map=factory --arg n=2`
- ctf-spectate (seed 422291858): cap; 120 s of game on ctf-forest, dealt 0, took 0, no KOs, map forest; menus took them about 36 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 422291858 --arg persona=teen-friends-ctf-02 --arg fighter=Balloony --arg map=forest --arg n=3`
- ctf-spectate (seed 617368546): cap; 120 s of game on ctf-forest, dealt 0, took 0, no KOs, map forest; menus took them about 36 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 617368546 --arg persona=teen-friends-ctf-02 --arg fighter=David --arg map=forest --arg n=3`
- ctf-spectate (seed 140113288): cap; 120 s of game on ctf-forest, dealt 0, took 0, no KOs, map forest; menus took them about 36 s and 9 clicks. Repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 140113288 --arg persona=teen-friends-ctf-02 --arg fighter=Gaty --arg map=forest --arg n=3`
- ctf (seed 507579782): until; 163 s of game on ctf-forest, dealt 75, took 47, no KOs, map forest; menus took them about 35 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 507579782 --arg persona=teen-friends-ctf-02 --arg fighter=Knife --arg map=forest --arg n=3`
- teams (seed 215925830): cap; 180 s of game on incin, dealt 189, took 94, no KOs; menus took them about 37 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 215925830 --arg persona=teen-friends-ctf-02 --arg fighter=Soap --arg stage=incin --arg kind=teams`
- ctf (seed 552750126): until; 163 s of game on ctf-forest, dealt 134, took 0, no KOs, map forest; menus took them about 35 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 552750126 --arg persona=teen-friends-ctf-02 --arg fighter=Flower --arg map=forest --arg n=3`
- ctf-practice (seed 478037388): complete; menus took them about 6 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 478037388 --arg persona=teen-friends-ctf-02`
- ctf-practice (seed 627275088): complete; menus took them about 6 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 627275088 --arg persona=teen-friends-ctf-02`
- teams (seed 586129331): cap; 180 s of game on incin, dealt 337, took 178, TOP@94% by Grassy; menus took them about 37 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 586129331 --arg persona=teen-friends-ctf-02 --arg fighter=Tissues --arg stage=incin --arg kind=teams`
- teams (seed 641142032): cap; 180 s of game on skytower, dealt 291, took 41, no KOs; menus took them about 39 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 641142032 --arg persona=teen-friends-ctf-02 --arg fighter=Ice Cube --arg stage=skytower --arg kind=teams`

## Where they got stuck or confused
- BUG cant: Capture the Flag practice, step 14 of 18 ("key"): a player following the card could not finish it in 45 s
- BUG cant: Cammy: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Cammy: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Soap: "grab (X+C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Soap: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- teams: 28 presses slipped (a person's missed keys)
- teams: 21 presses slipped (a person's missed keys)
- teams: 16 presses slipped (a person's missed keys)
- teams: 23 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ctf/play, stage ctf-factory) (in 16 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/hide (in 8 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/play (in 7 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage incin) (in 6 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/fix (in 5 scenes)
- [FEEL] jank-camera-snap (JANK): the camera jumped 0 px / zoom 0.18 in one frame (ffa) (in 4 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "-N | Roles" (estimated boxes, ctf on ctf-factory) (in 3 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "Home high home high N | Rear high rear high N" (estimated boxes, ctf on ctf-factory) (in 3 scenes)
- [FEEL] long-match: ctf match on ctf-forest was still going after 2 min of game time (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage skytower) (in 3 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage yoyle) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.8) in ctf/hide; recent move: no recent move (in 2 scenes)
- [FEEL] long-match: ctf match on ctf-factory was still going after 2 min of game time (in 2 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "-N | Roles" (estimated boxes, ctf on ctf-forest) (in 2 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "Home high home high N | Yard high yard high N" (estimated boxes, ctf on ctf-forest) (in 2 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "+N | Yard high yard high N" (estimated boxes, ctf on ctf-forest) (in 2 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "+N | Home high home high N" (estimated boxes, ctf on ctf-forest) (in 2 scenes)
- [FEEL] long-match: teams match on incin was still going after 3 min of game time (in 2 scenes)
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ctf/play; recent move: Firey|ember.special
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.3) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 72 ms frame (median 0.2) in ctf/play; recent move: no recent move
- [BUG] cant: Capture the Flag practice, step 14 of 18 ("key"): a player following the card could not finish it in 45 s
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.7) in teams; recent move: Cammy|shutter.special
- [BUG] cant: Cammy: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.8) in teams; recent move: Donut|glaze.up
- [BUG] cant: Cammy: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.6) in teams; recent move: Cammy|shutter.down
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.7) in teams; recent move: Cammy|shutter.jab
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.7) in teams; recent move: Cammy|shutter.fa
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage bigincin)
- [FEEL] jank-input-latency (JANK): Cammy: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [FEEL] long-match: teams match on bigincin was still going after 3 min of game time
- [SLOW] jank-spike (JANK): a 57 ms frame (median 0.6) in teams; recent move: Taco (II)|lemon.up
- [FEEL] jank-teleport (JANK): Bubble moved 155 px in one frame (teams; last move: Bubble|float.up)
- [SLOW] jank-spike (JANK): a 38 ms frame (median 1.3) in teams; recent move: Bubble|float.up
- [SLOW] jank-spike (JANK): a 40 ms frame (median 1.3) in teams; recent move: Snowball|tackle.da
- [SLOW] jank-spike (JANK): a 48 ms frame (median 1.0) in teams; recent move: Snowball|tackle.ua
- [FEEL] jank-input-latency (JANK): Snowball: atk took 7 frames (117 ms) from the key to the first change on the fighter

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
