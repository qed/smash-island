# adult-parent-first-time-01

**Profile.** adult-parent-first-time-01: adult (42), first-time; goal: play a few rounds with their kid; reads the tutorial card; asks "what do I press".
**Hands.** reaction 355 ms (SD 77), key timing jitter 3.11 frames, slipped presses 8%, double-tap 46%, short hop 23%, 60 fps input, 1.14 s per menu target, 257 ms per word read (reads 43% of a screen).
**Keys.** arrows. **Patience.** menus 164 s, confused 32 s on one screen, rage-quits after 4 losses in a row.
**Plan.** tutorial, training, ffa, journey (x passes).

## What they did
- tutorial (seed 34449409): left; menus took them about 40 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 34449409 --arg persona=adult-parent-first-time-01`
- tutorial (seed 397558093): complete; menus took them about 40 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 397558093 --arg persona=adult-parent-first-time-01`
- tutorial (seed 344057841): complete; menus took them about 40 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 344057841 --arg persona=adult-parent-first-time-01`
- journey (seed 581463445): journey ffa:4c/59.8s 1v1:4c/32.2s teams:4c/32.2s boss:4c/32.2s ctf:4c/32.2s training:3c/22.8s tutorial:3c/40.3s worldcup:6c/57.7s flagcup:4c/42.2s; menus took them about 497 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 581463445 --arg persona=adult-parent-first-time-01`
- journey (seed 370592380): journey ffa:4c/59.8s 1v1:4c/32.2s teams:4c/32.2s boss:4c/32.2s ctf:4c/32.2s training:3c/22.8s tutorial:3c/40.3s worldcup:6c/57.5s flagcup:4c/42.9s; menus took them about 497 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 370592380 --arg persona=adult-parent-first-time-01`
- training (seed 53870451): cap; menus took them about 111 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 53870451 --arg persona=adult-parent-first-time-01 --arg fighter=Knife`
- ffa (seed 859104719): ended; 39 s of game on incin, dealt 73, took 135, RIGHT@52% by Tea Kettle, LEFT@55% by Balloony, RIGHT@9% by Balloony; menus took them about 70 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 859104719 --arg persona=adult-parent-first-time-01 --arg fighter=Microphone --arg stage=incin --arg kind=ffa`
- training (seed 36746416): cap; menus took them about 111 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 36746416 --arg persona=adult-parent-first-time-01 --arg fighter=Liy`
- training (seed 26944947): cap; menus took them about 111 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 26944947 --arg persona=adult-parent-first-time-01 --arg fighter=Profily`
- training (seed 836878775): cap; menus took them about 111 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 836878775 --arg persona=adult-parent-first-time-01 --arg fighter=Coiny`
- ffa (seed 843033476): ended; 159 s of game on bigincin, dealt 452, took 258, RIGHT@152% by Tree; menus took them about 67 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 843033476 --arg persona=adult-parent-first-time-01 --arg fighter=Yin-Yang --arg stage=bigincin --arg kind=ffa`
- tutorial (seed 194978836): complete; menus took them about 40 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 194978836 --arg persona=adult-parent-first-time-01`
- ffa (seed 921286045): ended; 58 s of game on pillars, dealt 79, took 9, LEFT@0% fell, LEFT@9% by Coiny; menus took them about 67 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 921286045 --arg persona=adult-parent-first-time-01 --arg fighter=Soap --arg stage=pillars --arg kind=ffa`
- ffa (seed 58026251): ended; 180 s of game on skytower, dealt 24, took 137, BOTTOM@14% fell, BOTTOM@6% by ?, BOTTOM@97% by Ice Cube; menus took them about 70 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 58026251 --arg persona=adult-parent-first-time-01 --arg fighter=Silver Spoon --arg stage=skytower --arg kind=ffa`
- training (seed 43803849): cap; menus took them about 111 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 43803849 --arg persona=adult-parent-first-time-01 --arg fighter=Firey`
- journey (seed 622329924): journey ffa:4c/59.8s 1v1:4c/32.2s teams:4c/32.2s boss:4c/32.2s ctf:4c/32.2s training:3c/22.8s tutorial:3c/40.3s worldcup:6c/57.7s flagcup:4c/42.7s; menus took them about 497 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 622329924 --arg persona=adult-parent-first-time-01`
- journey (seed 565881829): journey ffa:4c/59.8s 1v1:4c/32.2s teams:4c/32.2s boss:4c/32.2s ctf:4c/32.2s training:3c/22.8s tutorial:3c/40.3s worldcup:6c/57.5s flagcup:4c/42.5s; menus took them about 497 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 565881829 --arg persona=adult-parent-first-time-01`
- ffa (seed 143290693): cap; 180 s of game on grandplains, dealt 519, took 33, BOTTOM@0% fell, BOTTOM@0% fell; menus took them about 70 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 143290693 --arg persona=adult-parent-first-time-01 --arg fighter=Money --arg stage=grandplains --arg kind=ffa`
- tutorial (seed 828429511): complete; menus took them about 40 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 828429511 --arg persona=adult-parent-first-time-01`
- journey (seed 117250570): journey ffa:4c/59.8s 1v1:4c/32.2s teams:4c/32.2s boss:4c/32.2s ctf:4c/32.2s training:3c/22.8s tutorial:3c/40.3s worldcup:6c/57.2s flagcup:4c/42.5s; menus took them about 496 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 117250570 --arg persona=adult-parent-first-time-01`

## Where they got stuck or confused
- BUG cant: How to Play, step 8 ("Press V once to SMASH"): a player following the card's instruction could not finish it in 22 s
- training: 9 presses slipped (a person's missed keys)
- ffa: was knocked out 7 s into the match (RIGHT at 52%)
- ffa: 6 presses slipped (a person's missed keys)
- training: 10 presses slipped (a person's missed keys)
- training: 7 presses slipped (a person's missed keys)
- ffa: 17 presses slipped (a person's missed keys)
- ffa: was knocked out 4 s into the match (LEFT at 0%)
- ffa: 1 presses slipped (a person's missed keys)
- ffa: 13 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [UI] phone-wording: screen "tutorial" says "Tap" in: "Tap Z while moving to sprint; hold Z to shield (blocks hits, not grabs" (a computer game: no phone or touch wording) (in 5 scenes)
- [UI] phone-wording: screen "tutorial" says "tap" in: "hold a direction as the hit lands to bend your launch a little (DI); t" (a computer game: no phone or touch wording) (in 5 scenes)
- [FEEL] long-match: ffa match on goiky was still going after 2 min of game time (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 3 scenes)
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.1) in ffa; recent move: no recent move (in 2 scenes)
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.1) in ffa; recent move: Firey|ember.smash
- [BUG] cant: How to Play, step 8 ("Press V once to SMASH"): a player following the card's instruction could not finish it in 22 s
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in ffa; recent move: Knife|tricks.smash
- [SLOW] jank-spike (JANK): a 57 ms frame (median 0.1) in ffa; recent move: Knife|tricks.jab
- [SLOW] jank-spike (JANK): a 67 ms frame (median 0.1) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.2) in ffa; recent move: Knife|tricks.na
- [FEEL] jank-teleport (JANK): Lightning moved 173 px in one frame (ffa; last move: Lightning|zap.up)
- [UI] stray-banner: a match shows "KO'd by Tea Kettle − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [UI] stray-banner: a match shows "KO'd by Balloony − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-teleport (JANK): Tea Kettle moved 324 px in one frame (ffa; last move: Tea Kettle|fsgather)
- [FEEL] jank-input-latency (JANK): Liy: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [FEEL] jank-audio-burst (JANK): 8 sound calls in one frame (ffa)
- [FEEL] jank-input-latency (JANK): Liy: jump took 7 frames (117 ms) from the key to the first change on the fighter
- [FEEL] jank-input-latency (JANK): Profily: atk took 4 frames (67 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.1) in ffa; recent move: Coiny|slap.grab
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 99 ms frame (median 0.5) in ffa; recent move: Yin-Yang|yinyang.fa
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.2) in ffa; recent move: Yin-Yang|yinyang.smash
- [SLOW] jank-spike (JANK): a 51 ms frame (median 0.4) in ffa; recent move: Marker|ink.jab
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.3) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ffa; recent move: Yin-Yang|yinyang.ut
- [FEEL] jank-input-latency (JANK): Yin-Yang: jump took 13 frames (217 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 84 ms frame (median 0.2) in ffa; recent move: Yin-Yang|yinyang.jab
- [SLOW] jank-spike (JANK): a 97 ms frame (median 0.5) in ffa; recent move: Yin-Yang|yinyang.special
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.7) in ffa; recent move: Lifering|lifeguard.jab
- [SLOW] jank-spike (JANK): a 59 ms frame (median 0.8) in ffa; recent move: Lifering|lifeguard.fa
- [SLOW] jank-spike (JANK): a 103 ms frame (median 0.7) in ffa; recent move: Lifering|lifeguard.up
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.5) in ffa; recent move: Lifering|lifeguard.da
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.4) in ffa; recent move: Marker|ink.dt
- [SLOW] jank-spike (JANK): a 52 ms frame (median 0.6) in ffa; recent move: Marker|ink.down
- [SLOW] jank-spike (JANK): a 150 ms frame (median 0.6) in ffa; recent move: Yin-Yang|yinyang.ba
- [SLOW] jank-spike (JANK): a 185 ms frame (median 0.6) in ffa; recent move: Marker|ink.special
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.4) in ffa; recent move: Match|spark.jab
- [SLOW] jank-spike (JANK): a 73 ms frame (median 0.6) in ffa; recent move: Match|spark.dt
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.6) in ffa; recent move: Yin-Yang|yinyang.dt

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
