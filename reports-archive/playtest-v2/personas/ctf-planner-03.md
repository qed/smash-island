# ctf-planner-03

**Profile.** ctf-planner-03: adult (24), veteran; goal: Capture the Flag: hide the flag, build, plan; uses the planning menu; does the practice first.
**Hands.** reaction 232 ms (SD 41), key timing jitter 1.33 frames, slipped presses 2%, double-tap 84%, short hop 76%, 60 fps input, 0.98 s per menu target, 264 ms per word read (reads 58% of a screen).
**Keys.** arrows. **Patience.** menus 133 s, confused 34 s on one screen, rage-quits after 8 losses in a row.
**Plan.** ctf-practice, ctf, flagcup, ctf (x passes).

## What they did
- ctf-practice (seed 162864754): complete; menus took them about 15 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 162864754 --arg persona=ctf-planner-03`
- ctf-practice (seed 236766827): complete; menus took them about 15 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 236766827 --arg persona=ctf-planner-03`
- ctf-practice (seed 889690805): complete; menus took them about 15 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 889690805 --arg persona=ctf-planner-03`
- ctf (seed 876974684): until; 169 s of game on ctf-factory, dealt 0, took 0, no KOs, map factory; menus took them about 84 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 876974684 --arg persona=ctf-planner-03 --arg fighter=Microphone --arg map=factory --arg n=2`
- ctf (seed 716617534): until; 170 s of game on ctf-factory, dealt 0, took 0, no KOs, map factory; menus took them about 84 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 716617534 --arg persona=ctf-planner-03 --arg fighter=Liy --arg map=factory --arg n=2`
- ctf (seed 778231012): until; 163 s of game on ctf-factory, dealt 0, took 0, no KOs, map factory; menus took them about 84 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 778231012 --arg persona=ctf-planner-03 --arg fighter=Teddy Bear --arg map=factory --arg n=2`
- ctf (seed 552483313): until; 163 s of game on ctf-factory, dealt 0, took 0, no KOs, map factory; menus took them about 84 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 552483313 --arg persona=ctf-planner-03 --arg fighter=Coiny --arg map=factory --arg n=2`
- ctf (seed 82943602): until; 163 s of game on ctf-factory, dealt 0, took 0, no KOs, map factory; menus took them about 84 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 82943602 --arg persona=ctf-planner-03 --arg fighter=Teddy Bear --arg map=factory --arg n=2`
- flagcup (seed 307109242): watched 2, skipped 1; menus took them about 55 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 307109242 --arg persona=ctf-planner-03`
- flagcup (seed 497229886): watched 2, skipped 1; menus took them about 55 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 497229886 --arg persona=ctf-planner-03`
- flagcup (seed 240709919): watched 2, skipped 1; menus took them about 54 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 240709919 --arg persona=ctf-planner-03`
- flagcup (seed 387349677): watched 2, skipped 1; menus took them about 55 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 387349677 --arg persona=ctf-planner-03`
- flagcup (seed 247792753): watched 2, skipped 1; menus took them about 55 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 247792753 --arg persona=ctf-planner-03`
- ctf (seed 232397211): until; 166 s of game on ctf-forest, dealt 200, took 47, no KOs, map forest; menus took them about 84 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 232397211 --arg persona=ctf-planner-03 --arg fighter=Liy --arg map=forest --arg n=3`
- ctf (seed 600102980): until; 163 s of game on ctf-forest, dealt 158, took 134, no KOs, map forest; menus took them about 84 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 600102980 --arg persona=ctf-planner-03 --arg fighter=Magnet --arg map=forest --arg n=3`
- ctf (seed 632956090): until; 163 s of game on ctf-forest, dealt 39, took 30, no KOs, map forest; menus took them about 84 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 632956090 --arg persona=ctf-planner-03 --arg fighter=Blocky --arg map=forest --arg n=3`
- ctf (seed 22249599): until; 169 s of game on ctf-forest, dealt 49, took 33, no KOs, map forest; menus took them about 84 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 22249599 --arg persona=ctf-planner-03 --arg fighter=Bonesaw --arg map=forest --arg n=3`
- ctf (seed 557436262): until; 187 s of game on ctf-forest, dealt 93, took 101, no KOs, map forest; menus took them about 84 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 557436262 --arg persona=ctf-planner-03 --arg fighter=Tea Kettle --arg map=forest --arg n=3`
- ctf-practice (seed 936816398): complete; menus took them about 15 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 936816398 --arg persona=ctf-planner-03`
- ctf-practice (seed 583115897): complete; menus took them about 15 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 583115897 --arg persona=ctf-planner-03`

## Where they got stuck or confused
- BUG cant: Tea Kettle: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames

## What went wrong (everything the playtester noted while they played)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/play (in 10 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/hide (in 9 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ctf/play, stage ctf-factory) (in 8 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/fix (in 6 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ctf/play, stage ctf-forest) (in 6 scenes)
- [FEEL] jank-camera-snap (JANK): the camera jumped 0 px / zoom 0.18 in one frame (ffa) (in 5 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "-N | Roles" (estimated boxes, ctf on ctf-factory) (in 5 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "Home high home high N | Rear high rear high N" (estimated boxes, ctf on ctf-factory) (in 5 scenes)
- [FEEL] long-match: ctf match on ctf-castle was still going after 1 min of game time (in 5 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "Home high home high N | Yard high yard high N" (estimated boxes, ctf on ctf-forest) (in 5 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "-N | Roles" (estimated boxes, ctf on ctf-forest) (in 3 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "+N | Yard high yard high N" (estimated boxes, ctf on ctf-forest) (in 3 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "+N | Home high home high N" (estimated boxes, ctf on ctf-forest) (in 3 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "+N | Roles" (estimated boxes, ctf on ctf-forest) (in 2 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "-N | Yard high yard high N" (estimated boxes, ctf on ctf-forest) (in 2 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "-N | Home high home high N" (estimated boxes, ctf on ctf-forest) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.3) in ctf/hide; recent move: Firey|ember.jab
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.2) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.3) in ctf/play; recent move: Firey|ember.special
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in ctf/play; recent move: Firey|ember.special
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 55 ms frame (median 0.3) in ctf/play; recent move: Pen|cap.jab
- [SLOW] jank-spike (JANK): a 35 ms frame (median 2.8) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 40 ms frame (median 5.7) in ctf/hide; recent move: Microphone|mic.jab
- [SLOW] jank-spike (JANK): a 42 ms frame (median 3.7) in ctf/fix; recent move: Microphone|mic.jab
- [SLOW] jank-spike (JANK): a 36 ms frame (median 4.0) in ctf/fix; recent move: no recent move
- [SLOW] jank-spike (JANK): a 36 ms frame (median 1.0) in ctf/play; recent move: no recent move
- [FEEL] jank-teleport (JANK): Woody moved 6398 px in one frame (ctf/play; last move: no move)
- [FEEL] jank-teleport (JANK): Bot moved 3474 px in one frame (ctf/play; last move: no move)
- [SLOW] jank-spike (JANK): a 39 ms frame (median 3.3) in ctf/play; recent move: Microphone|mic.smash
- [FEEL] jank-teleport (JANK): Dora moved 6203 px in one frame (ctf/play; last move: no move)
- [SLOW] jank-spike (JANK): a 36 ms frame (median 4.7) in ctf/play; recent move: Microphone|mic.special
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.9) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 52 ms frame (median 7.1) in ctf/hide; recent move: Liy|switch.jab
- [FEEL] jank-teleport (JANK): Money moved 6183 px in one frame (ctf/play; last move: no move)
- [SLOW] jank-spike (JANK): a 34 ms frame (median 1.3) in ctf/play; recent move: no recent move
- [FEEL] jank-teleport (JANK): Starfruit moved 6201 px in one frame (ctf/play; last move: no move)
- [SLOW] jank-spike (JANK): a 83 ms frame (median 1.4) in ctf/play; recent move: Liy|switch.special
- [FEEL] jank-teleport (JANK): Money moved 150 px in one frame (ctf/play; last move: Money|payday.up)

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
