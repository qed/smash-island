# ctf-planner-02

**Profile.** ctf-planner-02: adult (21), veteran; goal: Capture the Flag: hide the flag, build, plan; uses the planning menu; does the practice first.
**Hands.** reaction 249 ms (SD 36), key timing jitter 1.79 frames, slipped presses 4%, double-tap 76%, short hop 77%, 60 fps input, 0.92 s per menu target, 283 ms per word read (reads 48% of a screen).
**Keys.** arrows. **Patience.** menus 122 s, confused 26 s on one screen, rage-quits after 9 losses in a row.
**Plan.** ctf-practice, ctf, flagcup, ctf (x passes).

## What they did
- ctf-practice (seed 82538691): complete; menus took them about 13 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 82538691 --arg persona=ctf-planner-02`
- ctf-practice (seed 775391296): complete; menus took them about 13 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 775391296 --arg persona=ctf-planner-02`
- ctf-practice (seed 464416488): stuck@key; menus took them about 13 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 464416488 --arg persona=ctf-planner-02`
- ctf (seed 919383434): until; 163 s of game on ctf-castle, dealt 263, took 79, no KOs, map castle; menus took them about 75 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 919383434 --arg persona=ctf-planner-02 --arg fighter=Apple --arg map=castle --arg n=3`
- ctf (seed 973525819): until; 167 s of game on ctf-castle, dealt 202, took 44, no KOs, map castle; menus took them about 75 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 973525819 --arg persona=ctf-planner-02 --arg fighter=Lollipop --arg map=castle --arg n=3`
- ctf (seed 374169827): until; 163 s of game on ctf-castle, dealt 36, took 134, no KOs, map castle; menus took them about 75 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 374169827 --arg persona=ctf-planner-02 --arg fighter=Trophy --arg map=castle --arg n=3`
- ctf (seed 72217653): until; 179 s of game on ctf-castle, dealt 169, took 113, no KOs, map castle; menus took them about 75 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 72217653 --arg persona=ctf-planner-02 --arg fighter=Puffball --arg map=castle --arg n=3`
- ctf (seed 716259412): until; 179 s of game on ctf-castle, dealt 185, took 59, no KOs, map castle; menus took them about 75 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 716259412 --arg persona=ctf-planner-02 --arg fighter=Firey --arg map=castle --arg n=3`
- flagcup (seed 144598549): watched 2, skipped 1; menus took them about 49 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 144598549 --arg persona=ctf-planner-02`
- flagcup (seed 233634473): watched 2, skipped 1; menus took them about 49 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 233634473 --arg persona=ctf-planner-02`
- flagcup (seed 488312023): watched 2, skipped 1; menus took them about 49 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 488312023 --arg persona=ctf-planner-02`
- flagcup (seed 235064685): watched 2, skipped 1; menus took them about 49 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 235064685 --arg persona=ctf-planner-02`
- flagcup (seed 140628062): watched 2, skipped 1; menus took them about 49 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 140628062 --arg persona=ctf-planner-02`
- ctf (seed 13878468): until; 163 s of game on ctf-mines, dealt 91, took 0, no KOs, map mines; menus took them about 75 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 13878468 --arg persona=ctf-planner-02 --arg fighter=Money --arg map=mines --arg n=4`
- ctf (seed 546721637): until; 168 s of game on ctf-mines, dealt 0, took 0, no KOs, map mines; menus took them about 75 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 546721637 --arg persona=ctf-planner-02 --arg fighter=Gaty --arg map=mines --arg n=4`
- ctf-practice (seed 255795022): complete; menus took them about 13 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 255795022 --arg persona=ctf-planner-02`
- ctf (seed 527713924): until; 163 s of game on ctf-mines, dealt 0, took 0, no KOs, map mines; menus took them about 75 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 527713924 --arg persona=ctf-planner-02 --arg fighter=Ruby --arg map=mines --arg n=4`
- ctf (seed 13399607): until; 168 s of game on ctf-mines, dealt 0, took 0, no KOs, map mines; menus took them about 75 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 13399607 --arg persona=ctf-planner-02 --arg fighter=Naily --arg map=mines --arg n=4`
- ctf-practice (seed 761089468): complete; menus took them about 13 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 761089468 --arg persona=ctf-planner-02`
- ctf (seed 861534334): until; 171 s of game on ctf-mines, dealt 41, took 9, no KOs, map mines; menus took them about 75 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 861534334 --arg persona=ctf-planner-02 --arg fighter=Fan --arg map=mines --arg n=4`

## Where they got stuck or confused
- BUG cant: Capture the Flag practice, step 14 of 18 ("key"): a player following the card could not finish it in 45 s
- BUG cant: Firey: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Fan: "grab (X+C)" was pressed on a ready fighter and nothing happened for 14 frames

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ctf/play, stage ctf-mines) (in 12 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/play (in 10 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/hide (in 8 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ctf/play, stage ctf-castle) (in 5 scenes)
- [FEEL] long-match: ctf match on ctf-castle was still going after 1 min of game time (in 5 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "-N | Roles" (estimated boxes, ctf on ctf-mines) (in 5 scenes)
- [FEEL] jank-camera-snap (JANK): the camera jumped 0 px / zoom 0.18 in one frame (ffa) (in 4 scenes)
- [SLOW] jank-spike (JANK): a 35 ms frame (median 4.9) in ctf/hide; recent move: no recent move (in 2 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/fix (in 2 scenes)
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.3) in ctf/hide; recent move: Firey|ember.jab
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.2) in ctf/play; recent move: Pen|cap.jab
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.3) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ctf/play; recent move: Firey|ember.special
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ctf/play; recent move: no recent move
- [BUG] cant: Capture the Flag practice, step 14 of 18 ("key"): a player following the card could not finish it in 45 s
- [SLOW] jank-spike (JANK): a 35 ms frame (median 2.5) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 37 ms frame (median 3.7) in ctf/hide; recent move: Apple|split.jab
- [SLOW] jank-spike (JANK): a 70 ms frame (median 2.7) in ctf/play; recent move: Apple|split.jab
- [SLOW] jank-spike (JANK): a 34 ms frame (median 1.9) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 35 ms frame (median 5.6) in ctf/play; recent move: Apple|split.special
- [FEEL] jank-input-latency (JANK): Apple: atk took 5 frames (84 ms) from the key to the first change on the fighter
- [FEEL] jank-input-latency (JANK): Apple: smash took 14 frames (234 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 39 ms frame (median 4.0) in ctf/play; recent move: Apple|split.smash
- [SLOW] jank-spike (JANK): a 54 ms frame (median 5.7) in ctf/play; recent move: Tennis Ball|serve.special
- [SLOW] jank-spike (JANK): a 37 ms frame (median 4.2) in ctf/play; recent move: Poppy|vacuum.ut
- [SLOW] jank-spike (JANK): a 36 ms frame (median 4.2) in ctf/play; recent move: Tennis Ball|serve.jab
- [SLOW] jank-spike (JANK): a 35 ms frame (median 2.4) in ctf/play; recent move: Tennis Ball|serve.dt
- [SLOW] jank-spike (JANK): a 41 ms frame (median 2.6) in ctf/play; recent move: Poppy|vacuum.jab
- [SLOW] jank-spike (JANK): a 56 ms frame (median 1.7) in ctf/play; recent move: Poppy|vacuum.up
- [SLOW] jank-spike (JANK): a 36 ms frame (median 2.0) in ctf/play; recent move: Apple|split.up
- [SLOW] jank-spike (JANK): a 43 ms frame (median 1.6) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 75 ms frame (median 1.7) in ctf/fix; recent move: Lollipop|sucker.jab
- [SLOW] jank-spike (JANK): a 33 ms frame (median 2.1) in ctf/fix; recent move: no recent move
- [SLOW] jank-spike (JANK): a 34 ms frame (median 2.5) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 38 ms frame (median 4.4) in ctf/play; recent move: Lollipop|sucker.smash
- [SLOW] jank-spike (JANK): a 33 ms frame (median 2.9) in ctf/play; recent move: Lollipop|sucker.special
- [SLOW] jank-spike (JANK): a 41 ms frame (median 4.1) in ctf/play; recent move: Fanny|gust.up
- [SLOW] jank-spike (JANK): a 102 ms frame (median 2.4) in ctf/play; recent move: Lollipop|sucker.up

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
