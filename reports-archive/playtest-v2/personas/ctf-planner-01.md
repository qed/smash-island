# ctf-planner-01

**Profile.** ctf-planner-01: adult (33), veteran; goal: Capture the Flag: hide the flag, build, plan; uses the planning menu; does the practice first.
**Hands.** reaction 216 ms (SD 37), key timing jitter 1.99 frames, slipped presses 4%, double-tap 82%, short hop 74%, 60 fps input, 1.1 s per menu target, 262 ms per word read (reads 62% of a screen).
**Keys.** arrows. **Patience.** menus 127 s, confused 26 s on one screen, rage-quits after 6 losses in a row.
**Plan.** ctf-practice, ctf, flagcup, ctf (x passes).

## What they did
- ctf-practice (seed 873328348): complete; menus took them about 16 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 873328348 --arg persona=ctf-planner-01`
- ctf-practice (seed 37968608): complete; menus took them about 16 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 37968608 --arg persona=ctf-planner-01`
- ctf-practice (seed 765845945): complete; menus took them about 16 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 765845945 --arg persona=ctf-planner-01`
- ctf (seed 269379237): until; 163 s of game on ctf-sky, dealt 96, took 58, no KOs, map sky; menus took them about 90 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 269379237 --arg persona=ctf-planner-01 --arg fighter=Remote --arg map=sky --arg n=4`
- ctf (seed 771983171): until; 163 s of game on ctf-sky, dealt 0, took 0, no KOs, map sky; menus took them about 90 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 771983171 --arg persona=ctf-planner-01 --arg fighter=Match --arg map=sky --arg n=4`
- ctf (seed 858171064): until; 170 s of game on ctf-sky, dealt 187, took 0, no KOs, map sky; menus took them about 90 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 858171064 --arg persona=ctf-planner-01 --arg fighter=Naily --arg map=sky --arg n=4`
- ctf (seed 355513145): until; 163 s of game on ctf-sky, dealt 0, took 0, no KOs, map sky; menus took them about 90 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 355513145 --arg persona=ctf-planner-01 --arg fighter=Firey --arg map=sky --arg n=4`
- flagcup (seed 70999521): watched 2, skipped 1; menus took them about 58 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 70999521 --arg persona=ctf-planner-01`
- ctf (seed 944874132): until; 163 s of game on ctf-sky, dealt 190, took 113, no KOs, map sky; menus took them about 90 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 944874132 --arg persona=ctf-planner-01 --arg fighter=Silver Spoon --arg map=sky --arg n=4`
- flagcup (seed 842526496): watched 2, skipped 1; menus took them about 58 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 842526496 --arg persona=ctf-planner-01`
- flagcup (seed 971956713): watched 2, skipped 1; menus took them about 58 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 971956713 --arg persona=ctf-planner-01`
- flagcup (seed 510663647): watched 2, skipped 1; menus took them about 58 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 510663647 --arg persona=ctf-planner-01`
- flagcup (seed 325289660): watched 2, skipped 1; menus took them about 58 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 325289660 --arg persona=ctf-planner-01`
- ctf (seed 251899632): until; 175 s of game on ctf-oak, dealt 96, took 35, no KOs, map oak; menus took them about 90 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 251899632 --arg persona=ctf-planner-01 --arg fighter=Poppy --arg map=oak --arg n=2`
- ctf-practice (seed 563419532): complete; menus took them about 16 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 563419532 --arg persona=ctf-planner-01`
- ctf (seed 917258093): until; 168 s of game on ctf-oak, dealt 136, took 123, no KOs, map oak; menus took them about 90 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 917258093 --arg persona=ctf-planner-01 --arg fighter=Liy --arg map=oak --arg n=2`
- ctf (seed 444751620): until; 163 s of game on ctf-oak, dealt 75, took 65, no KOs, map oak; menus took them about 90 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 444751620 --arg persona=ctf-planner-01 --arg fighter=Ruby --arg map=oak --arg n=2`
- ctf-practice (seed 97621799): complete; menus took them about 16 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 97621799 --arg persona=ctf-planner-01`
- ctf (seed 260973126): until; 186 s of game on ctf-oak, dealt 101, took 3, no KOs, map oak; menus took them about 90 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 260973126 --arg persona=ctf-planner-01 --arg fighter=Remote --arg map=oak --arg n=2`
- ctf (seed 132747486): until; 176 s of game on ctf-oak, dealt 146, took 27, no KOs, map oak; menus took them about 90 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 132747486 --arg persona=ctf-planner-01 --arg fighter=Pencil --arg map=oak --arg n=2`

## Where they got stuck or confused
- BUG jank-embedded: Toothpaste stood inside a solid platform for 30 frames (ctf/play)

## What went wrong (everything the playtester noted while they played)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/hide (in 16 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ctf/play, stage ctf-sky) (in 13 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ctf/play, stage ctf-oak) (in 13 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/play (in 12 scenes)
- [FEEL] jank-camera-snap (JANK): the camera jumped 0 px / zoom 0.18 in one frame (ffa) (in 5 scenes)
- [FEEL] long-match: ctf match on ctf-castle was still going after 1 min of game time (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/fix (in 5 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "-N | Roles" (estimated boxes, ctf on ctf-sky) (in 4 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "Front high front high | Front high front high N" (estimated boxes, ctf on ctf-sky) (in 4 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "Front high front high N | Yard high yard high N" (estimated boxes, ctf on ctf-sky) (in 4 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "-N | Roles" (estimated boxes, ctf on ctf-oak) (in 3 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 2 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "+N | Roles" (estimated boxes, ctf on ctf-oak) (in 2 scenes)
- [UI] jank-text-offscreen (JANK): HUD text runs off the canvas edge: "Jail rear low (your side: the teammate g" (estimated width, ctf on ctf-oak) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 54 ms frame (median 0.3) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 77 ms frame (median 0.3) in ctf/hide; recent move: Firey|ember.jab
- [SLOW] jank-spike (JANK): a 61 ms frame (median 0.3) in ctf/play; recent move: Firey|ember.special
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.3) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.3) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 61 ms frame (median 0.4) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 187 ms frame (median 0.4) in ctf/play; recent move: Pen|cap.jab
- [SLOW] jank-spike (JANK): a 196 ms frame (median 0.4) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 148 ms frame (median 1.2) in ctf/bid; recent move: no recent move
- [SLOW] jank-spike (JANK): a 55 ms frame (median 7.9) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 49 ms frame (median 2.0) in ctf/hide; recent move: Remote|battery.jab
- [SLOW] jank-spike (JANK): a 44 ms frame (median 4.0) in ctf/play; recent move: Remote|battery.jab
- [SLOW] jank-spike (JANK): a 43 ms frame (median 4.3) in ctf/play; recent move: Remote|battery.down
- [SLOW] jank-spike (JANK): a 37 ms frame (median 4.5) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 54 ms frame (median 3.5) in ctf/play; recent move: Remote|battery.da
- [FEEL] jank-teleport (JANK): Bracelety moved 7001 px in one frame (ctf/play; last move: no move)
- [SLOW] jank-spike (JANK): a 269 ms frame (median 5.4) in ctf/play; recent move: Remote|battery.up
- [SLOW] jank-spike (JANK): a 118 ms frame (median 16.2) in ctf/play; recent move: Remote|battery.smash
- [FEEL] jank-teleport (JANK): Remote moved 207 px in one frame (ctf/play; last move: Remote|battery.up)
- [FEEL] jank-teleport (JANK): Toothpaste moved 3120 px in one frame (ctf/play; last move: no move)
- [FEEL] jank-teleport (JANK): Coiny moved 2324 px in one frame (ctf/play; last move: no move)
- [SLOW] jank-spike (JANK): a 48 ms frame (median 4.6) in ctf/play; recent move: Lightning|zap.special
- [SLOW] jank-spike (JANK): a 72 ms frame (median 4.1) in ctf/play; recent move: Lightning|zap.jab
- [SLOW] jank-spike (JANK): a 47 ms frame (median 4.0) in ctf/play; recent move: Remote|battery.special
- [SLOW] jank-spike (JANK): a 182 ms frame (median 16.1) in ctf/play; recent move: Bracelety|sign.special
- [SLOW] jank-spike (JANK): a 49 ms frame (median 4.2) in ctf/play; recent move: Bracelety|sign.jab

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
