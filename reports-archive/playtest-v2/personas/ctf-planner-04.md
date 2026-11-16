# ctf-planner-04

**Profile.** ctf-planner-04: adult (28), veteran; goal: Capture the Flag: hide the flag, build, plan; uses the planning menu; does the practice first.
**Hands.** reaction 244 ms (SD 31), key timing jitter 1.71 frames, slipped presses 4%, double-tap 85%, short hop 68%, 60 fps input, 0.87 s per menu target, 221 ms per word read (reads 59% of a screen).
**Keys.** arrows. **Patience.** menus 128 s, confused 34 s on one screen, rage-quits after 9 losses in a row.
**Plan.** ctf-practice, ctf, flagcup, ctf (x passes).

## What they did
- ctf-practice (seed 675781556): complete; menus took them about 13 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 675781556 --arg persona=ctf-planner-04`
- ctf-practice (seed 859673548): complete; menus took them about 13 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 859673548 --arg persona=ctf-planner-04`
- ctf-practice (seed 73210723): complete; menus took them about 13 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 73210723 --arg persona=ctf-planner-04`
- ctf (seed 474935626): until; 163 s of game on ctf-sky, dealt 57, took 17, no KOs, map sky; menus took them about 72 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 474935626 --arg persona=ctf-planner-04 --arg fighter=Microphone --arg map=sky --arg n=4`
- ctf (seed 723477465): until; 163 s of game on ctf-sky, dealt 0, took 0, no KOs, map sky; menus took them about 72 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 723477465 --arg persona=ctf-planner-04 --arg fighter=Salt --arg map=sky --arg n=4`
- ctf (seed 185837939): until; 163 s of game on ctf-sky, dealt 173, took 51, no KOs, map sky; menus took them about 72 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 185837939 --arg persona=ctf-planner-04 --arg fighter=Tennis Ball --arg map=sky --arg n=4`
- ctf (seed 240180941): until; 163 s of game on ctf-sky, dealt 0, took 8, no KOs, map sky; menus took them about 72 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 240180941 --arg persona=ctf-planner-04 --arg fighter=Rose --arg map=sky --arg n=4`
- ctf (seed 404807901): until; 168 s of game on ctf-sky, dealt 0, took 0, no KOs, map sky; menus took them about 72 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 404807901 --arg persona=ctf-planner-04 --arg fighter=Book --arg map=sky --arg n=4`
- flagcup (seed 827840794): watched 2, skipped 1; menus took them about 47 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 827840794 --arg persona=ctf-planner-04`
- flagcup (seed 653122014): watched 2, skipped 1; menus took them about 47 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 653122014 --arg persona=ctf-planner-04`
- flagcup (seed 902359829): watched 2, skipped 1; menus took them about 47 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 902359829 --arg persona=ctf-planner-04`
- flagcup (seed 115180586): watched 2, skipped 1; menus took them about 47 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 115180586 --arg persona=ctf-planner-04`
- flagcup (seed 376620040): watched 2, skipped 1; menus took them about 47 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 376620040 --arg persona=ctf-planner-04`
- ctf (seed 380440585): until; 163 s of game on ctf-oak, dealt 388, took 87, no KOs, map oak; menus took them about 72 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 380440585 --arg persona=ctf-planner-04 --arg fighter=Salt --arg map=oak --arg n=2`
- ctf-practice (seed 19693244): complete; menus took them about 13 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 19693244 --arg persona=ctf-planner-04`
- ctf (seed 390051603): until; 163 s of game on ctf-oak, dealt 139, took 48, no KOs, map oak; menus took them about 72 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 390051603 --arg persona=ctf-planner-04 --arg fighter=Pencil --arg map=oak --arg n=2`
- ctf (seed 984624825): until; 163 s of game on ctf-oak, dealt 201, took 128, no KOs, map oak; menus took them about 72 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 984624825 --arg persona=ctf-planner-04 --arg fighter=Blocky --arg map=oak --arg n=2`
- ctf-practice (seed 344916396): stuck@key; menus took them about 13 s and 2 clicks. Repro: `node scripts/playtest.mjs --scene ctf-practice --seed 344916396 --arg persona=ctf-planner-04`
- ctf (seed 89747701): until; 163 s of game on ctf-oak, dealt 161, took 125, no KOs, map oak; menus took them about 72 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 89747701 --arg persona=ctf-planner-04 --arg fighter=Soap --arg map=oak --arg n=2`
- ctf (seed 986751758): until; 163 s of game on ctf-oak, dealt 187, took 15, no KOs, map oak; menus took them about 72 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene ctf --seed 986751758 --arg persona=ctf-planner-04 --arg fighter=Loser --arg map=oak --arg n=2`

## Where they got stuck or confused
- BUG jank-embedded: TV stood inside a solid platform for 30 frames (ctf/play)
- BUG cant: Salt: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Capture the Flag practice, step 14 of 18 ("key"): a player following the card could not finish it in 45 s

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ctf/play, stage ctf-sky) (in 19 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/hide (in 12 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ctf/play, stage ctf-oak) (in 11 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/play (in 9 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "Front high front high | Front high front high N" (estimated boxes, ctf on ctf-sky) (in 5 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "Front high front high N | Yard high yard high N" (estimated boxes, ctf on ctf-sky) (in 5 scenes)
- [FEEL] long-match: ctf match on ctf-castle was still going after 1 min of game time (in 5 scenes)
- [FEEL] jank-camera-snap (JANK): the camera jumped 0 px / zoom 0.18 in one frame (ffa) (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/fix (in 4 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "-N | Roles" (estimated boxes, ctf on ctf-sky) (in 3 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "-N | Roles" (estimated boxes, ctf on ctf-oak) (in 3 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "+N | Roles" (estimated boxes, ctf on ctf-sky) (in 2 scenes)
- [FEEL] jank-teleport (JANK): Toothpaste moved 159 px in one frame (ctf/play; last move: Toothpaste|paste.up) (in 2 scenes)
- [UI] jank-text-overlap (JANK): HUD text overlaps: "+N | Roles" (estimated boxes, ctf on ctf-oak) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 52 ms frame (median 0.3) in ctf/play; recent move: Firey|ember.special
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.3) in ctf/play; recent move: Pen|cap.jab
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.3) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 61 ms frame (median 1.1) in ctf/bid; recent move: no recent move
- [SLOW] jank-spike (JANK): a 38 ms frame (median 5.0) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 48 ms frame (median 2.9) in ctf/hide; recent move: Microphone|mic.jab
- [SLOW] jank-spike (JANK): a 44 ms frame (median 3.9) in ctf/play; recent move: Microphone|mic.jab
- [SLOW] jank-spike (JANK): a 34 ms frame (median 4.5) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 41 ms frame (median 4.1) in ctf/play; recent move: Microphone|mic.special
- [FEEL] jank-teleport (JANK): Grassy moved 6858 px in one frame (ctf/play; last move: no move)
- [FEEL] jank-teleport (JANK): Nickel moved 154 px in one frame (ctf/play; last move: Nickel|flip.up)
- [SLOW] jank-spike (JANK): a 43 ms frame (median 3.5) in ctf/play; recent move: Microphone|mic.fa
- [SLOW] jank-spike (JANK): a 45 ms frame (median 4.5) in ctf/play; recent move: Microphone|mic.smash
- [SLOW] jank-spike (JANK): a 153 ms frame (median 5.1) in ctf/play; recent move: Microphone|mic.up
- [SLOW] jank-spike (JANK): a 64 ms frame (median 2.6) in ctf/play; recent move: Knife|tricks.up
- [FEEL] jank-teleport (JANK): Nickel moved 5235 px in one frame (ctf/play; last move: no move)
- [FEEL] jank-teleport (JANK): Pen moved 3386 px in one frame (ctf/play; last move: no move)
- [FEEL] jank-teleport (JANK): Bomb moved 5180 px in one frame (ctf/play; last move: no move)
- [FEEL] jank-teleport (JANK): Microphone moved 3386 px in one frame (ctf/play; last move: no move)
- [FEEL] jank-teleport (JANK): Loser moved 6930 px in one frame (ctf/play; last move: no move)
- [SLOW] jank-spike (JANK): a 216 ms frame (median 3.7) in ctf/play; recent move: Grassy|grasstree.up
- [SLOW] jank-spike (JANK): a 50 ms frame (median 4.0) in ctf/play; recent move: Microphone|mic.ua
- [SLOW] jank-spike (JANK): a 81 ms frame (median 2.2) in ctf/play; recent move: Bomb|collide.up
- [SLOW] jank-spike (JANK): a 97 ms frame (median 4.6) in ctf/play; recent move: Pen|cap.down
- [FEEL] jank-teleport (JANK): Knife moved 6502 px in one frame (ctf/play; last move: no move)

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
