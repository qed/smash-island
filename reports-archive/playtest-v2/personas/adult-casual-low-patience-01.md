# adult-casual-low-patience-01

**Profile.** adult-casual-low-patience-01: adult (27), casual; goal: a quick match after work; skims; leaves a menu after a few seconds of confusion.
**Hands.** reaction 296 ms (SD 64), key timing jitter 2.32 frames, slipped presses 8%, double-tap 75%, short hop 49%, 60 fps input, 1.38 s per menu target, 253 ms per word read (reads 13% of a screen).
**Keys.** arrows. **Patience.** menus 43 s, confused 15 s on one screen, rage-quits after 3 losses in a row.
**Plan.** journey, ffa, flow (x passes).

## What they did
- journey (seed 434870973): journey ffa:4c/22s 1v1:4c/13.7s teams:4c/13.7s boss:4c/13.7s ctf:4c/13.7s training:3c/9.9s tutorial:3c/15.1s worldcup:6c/23.2s flagcup:4c/16.7s; menus took them about 202 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 434870973 --arg persona=adult-casual-low-patience-01`
- journey (seed 981430677): journey ffa:4c/22s 1v1:4c/13.7s teams:4c/13.7s boss:4c/13.7s ctf:4c/13.7s training:3c/9.9s tutorial:3c/15.1s worldcup:6c/23.3s flagcup:4c/16.8s; menus took them about 202 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 981430677 --arg persona=adult-casual-low-patience-01`
- journey (seed 148864530): journey ffa:4c/22s 1v1:4c/13.7s teams:4c/13.7s boss:4c/13.7s ctf:4c/13.7s training:3c/9.9s tutorial:3c/15.1s worldcup:6c/23.4s flagcup:4c/16.8s; menus took them about 202 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 148864530 --arg persona=adult-casual-low-patience-01`
- flow (seed 257238392): flow; menus took them about 28 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 257238392 --arg persona=adult-casual-low-patience-01 --arg fighter=Bomby`
- flow (seed 845250699): flow; menus took them about 28 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 845250699 --arg persona=adult-casual-low-patience-01 --arg fighter=Test Tube`
- ffa (seed 480978262): ended; 66 s of game on grandplains, dealt 0, took 0, BOTTOM@0% fell, BOTTOM@0% by ?; menus took them about 34 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 480978262 --arg persona=adult-casual-low-patience-01 --arg fighter=Naily --arg stage=grandplains --arg kind=ffa`
- ffa (seed 572771788): ended; 65 s of game on incin, dealt 140, took 265, RIGHT@7% by Ruby, RIGHT@63% by Fan, RIGHT@130% by Ruby; menus took them about 30 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 572771788 --arg persona=adult-casual-low-patience-01 --arg fighter=Sidewalky --arg stage=incin --arg kind=ffa`
- ffa (seed 818089420): ended; 145 s of game on skytower, dealt 63, took 36, BOTTOM@0% fell, BOTTOM@36% by Cherries; menus took them about 30 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 818089420 --arg persona=adult-casual-low-patience-01 --arg fighter=Teardrop --arg stage=skytower --arg kind=ffa`
- ffa (seed 728326282): ended; 63 s of game on wind, dealt 210, took 108, BOTTOM@86% by Rose, BOTTOM@22% fell; menus took them about 34 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 728326282 --arg persona=adult-casual-low-patience-01 --arg fighter=Pin --arg stage=wind --arg kind=ffa`
- flow (seed 278129579): flow; menus took them about 28 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 278129579 --arg persona=adult-casual-low-patience-01 --arg fighter=Fern`
- flow (seed 768567990): flow; menus took them about 28 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 768567990 --arg persona=adult-casual-low-patience-01 --arg fighter=Pen`
- journey (seed 433062217): journey ffa:4c/22s 1v1:4c/13.7s teams:4c/13.7s boss:4c/13.7s ctf:4c/13.7s training:3c/9.9s tutorial:3c/15.1s worldcup:6c/23.3s flagcup:4c/16.8s; menus took them about 202 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 433062217 --arg persona=adult-casual-low-patience-01`
- flow (seed 721676373): flow; menus took them about 28 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 721676373 --arg persona=adult-casual-low-patience-01 --arg fighter=Bomby`
- ffa (seed 31456317): cap; 180 s of game on grandplains, dealt 195, took 130, BOTTOM@8% fell, RIGHT@122% by Teddy Bear, BOTTOM@0% fell; menus took them about 30 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 31456317 --arg persona=adult-casual-low-patience-01 --arg fighter=MeTag --arg stage=grandplains --arg kind=ffa`
- journey (seed 676306929): journey ffa:4c/22s 1v1:4c/13.7s teams:4c/13.7s boss:4c/13.7s ctf:4c/13.7s training:3c/9.9s tutorial:3c/15.1s worldcup:6c/23.4s flagcup:4c/16.7s; menus took them about 202 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 676306929 --arg persona=adult-casual-low-patience-01`

## Where they got stuck or confused
- ffa: was knocked out 13 s into the match (BOTTOM at 0%)
- ffa: 2 presses slipped (a person's missed keys)
- ffa: was knocked out 4 s into the match (RIGHT at 7%)
- ffa: 7 presses slipped (a person's missed keys)
- ffa: was knocked out 5 s into the match (BOTTOM at 0%)
- ffa: 6 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 4 scenes)
- [UI] stray-banner: a match shows "KO'd by Rose − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed) (in 2 scenes)
- [UI] stray-banner: a match shows "KO'd by Goo − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed) (in 2 scenes)
- [UI] stray-banner: a match shows "KO'd by Firey Jr. − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.2) in ffa; recent move: Rose|thorn.jab
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.2) in ffa; recent move: Rose|thorn.up
- [SLOW] jank-spike (JANK): a 56 ms frame (median 0.2) in ffa; recent move: Rose|thorn.dt
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ffa; recent move: Yellow Face|buynow.jab
- [FEEL] jank-hitstop-drift (JANK): Rose moved 11 px in one frame while in hitstop (ffa; last move: no move)
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ffa; recent move: Yellow Face|buynow.finisher
- [SLOW] jank-spike (JANK): a 69 ms frame (median 0.3) in ffa; recent move: Yellow Face|buynow.fa
- [SLOW] jank-spike (JANK): a 64 ms frame (median 0.2) in ffa; recent move: Rose|thorn.special
- [SLOW] jank-spike (JANK): a 49 ms frame (median 0.3) in ffa; recent move: Rose|thorn.finisher
- [SLOW] jank-spike (JANK): a 65 ms frame (median 0.2) in ffa; recent move: Yellow Face|buynow.dt
- [SLOW] jank-spike (JANK): a 69 ms frame (median 0.2) in ffa; recent move: Yellow Face|fsgather
- [SLOW] jank-spike (JANK): a 100 ms frame (median 0.2) in ffa; recent move: Yellow Face|buynow.up
- [SLOW] jank-spike (JANK): a 73 ms frame (median 0.2) in ffa; recent move: Rose|thorn.fa
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.3) in ffa; recent move: Yellow Face|buynow.smash
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ffa; recent move: Marker|ink.finisher
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.2) in ffa; recent move: Goo|engulf.jab
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.3) in ffa; recent move: Marker|ink.ua
- [SLOW] jank-spike (JANK): a 58 ms frame (median 0.2) in ffa; recent move: Marker|ink.up
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: Goo|engulf.down
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.2) in ffa; recent move: Goo|engulf.dt
- [SLOW] jank-spike (JANK): a 111 ms frame (median 0.2) in ffa; recent move: Marker|ink.jab
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.4) in ffa; recent move: Marker|uppercut
- [SLOW] jank-spike (JANK): a 51 ms frame (median 0.2) in ffa; recent move: Goo|engulf.up
- [SLOW] jank-spike (JANK): a 56 ms frame (median 0.3) in ffa; recent move: Goo|engulf.finisher
- [FEEL] jank-air-hang (JANK): Goo hung motionless in the air for 45 frames (ffa) at 227,456
- [FEEL] jank-teleport (JANK): Marker moved 177 px in one frame (ffa; last move: Marker|throw)
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.3) in ffa; recent move: Goo|engulf.dsmash
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.3) in ffa; recent move: Marker|ink.dt
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.3) in ffa; recent move: no recent move
- [UI] stray-banner: a match shows "KO'd by Ruby − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-input-latency (JANK): Sidewalky: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [UI] stray-banner: a match shows "KO'd by Fan − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage incin)
- [FEEL] jank-air-hang (JANK): Fan hung motionless in the air for 45 frames (ffa) at 407,408

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
