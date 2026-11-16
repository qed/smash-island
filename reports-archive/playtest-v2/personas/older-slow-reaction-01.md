# older-slow-reaction-01

**Profile.** older-slow-reaction-01: older adult (62), first-time; goal: play with a grandchild; reads everything slowly; needs time to find keys.
**Hands.** reaction 423 ms (SD 82), key timing jitter 4.41 frames, slipped presses 12%, double-tap 38%, short hop 34%, 60 fps input, 2.3 s per menu target, 367 ms per word read (reads 63% of a screen).
**Keys.** arrows. **Patience.** menus 271 s, confused 46 s on one screen, rage-quits after 4 losses in a row.
**Plan.** tutorial, training, ffa (x passes).

## What they did
- tutorial (seed 841604621): complete; menus took them about 84 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 841604621 --arg persona=older-slow-reaction-01`
- tutorial (seed 166420838): complete; menus took them about 84 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 166420838 --arg persona=older-slow-reaction-01`
- tutorial (seed 374201517): complete; menus took them about 84 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 374201517 --arg persona=older-slow-reaction-01`
- training (seed 439314283): cap; menus took them about 230 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 439314283 --arg persona=older-slow-reaction-01 --arg fighter=Match`
- ffa (seed 695060957): ended; 93 s of game on incin, dealt 239, took 289, RIGHT@98% by Tennis Ball, RIGHT@33% by Tennis Ball, RIGHT@143% by Tennis Ball; menus took them about 146 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 695060957 --arg persona=older-slow-reaction-01 --arg fighter=Fern --arg stage=incin --arg kind=ffa`
- training (seed 986493470): cap; menus took them about 230 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 986493470 --arg persona=older-slow-reaction-01 --arg fighter=Teardrop`
- ffa (seed 174249964): cap; 180 s of game on skytower, dealt 0, took 32, BOTTOM@16% by ?, BOTTOM@16% by ?; menus took them about 139 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 174249964 --arg persona=older-slow-reaction-01 --arg fighter=Blueberry --arg stage=skytower --arg kind=ffa`
- training (seed 401421189): cap; menus took them about 230 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 401421189 --arg persona=older-slow-reaction-01 --arg fighter=Money`
- ffa (seed 710293845): ended; 76 s of game on shift, dealt 107, took 17, BOTTOM@13% fell, BOTTOM@4% by Lightbulb, BOTTOM@0% fell; menus took them about 146 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 710293845 --arg persona=older-slow-reaction-01 --arg fighter=Ruler --arg stage=shift --arg kind=ffa`
- training (seed 694943824): cap; menus took them about 230 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 694943824 --arg persona=older-slow-reaction-01 --arg fighter=Flower`
- ffa (seed 930868978): ended; 79 s of game on tlc, dealt 361, took 138, BOTTOM@33% fell, MAX@105% by Remote; menus took them about 139 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 930868978 --arg persona=older-slow-reaction-01 --arg fighter=Salt --arg stage=tlc --arg kind=ffa`
- tutorial (seed 511179750): complete; menus took them about 84 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 511179750 --arg persona=older-slow-reaction-01`
- training (seed 68004052): cap; menus took them about 230 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 68004052 --arg persona=older-slow-reaction-01 --arg fighter=Cherries`
- ffa (seed 243320047): ended; 131 s of game on wind, dealt 56, took 20, BOTTOM@20% by Woody, BOTTOM@0% fell; menus took them about 139 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 243320047 --arg persona=older-slow-reaction-01 --arg fighter=Trophy --arg stage=wind --arg kind=ffa`
- tutorial (seed 346968684): complete; menus took them about 84 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 346968684 --arg persona=older-slow-reaction-01`

## Where they got stuck or confused
- STUCK match-never-ends: ffa match on skytower is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
- training: was knocked out 9 s into the match (RIGHT at 0%)
- training: 7 presses slipped (a person's missed keys)
- ffa: 8 presses slipped (a person's missed keys)
- training: 8 presses slipped (a person's missed keys)
- ffa: was knocked out 13 s into the match (BOTTOM at 16%)
- ffa: 2 presses slipped (a person's missed keys)
- training: 20 presses slipped (a person's missed keys)
- ffa: was knocked out 12 s into the match (BOTTOM at 13%)
- ffa: 3 presses slipped (a person's missed keys)
- training: 27 presses slipped (a person's missed keys)
- ffa: 13 presses slipped (a person's missed keys)
- training: 9 presses slipped (a person's missed keys)
- ffa: was knocked out 6 s into the match (BOTTOM at 20%)

## What went wrong (everything the playtester noted while they played)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 9 scenes)
- [UI] phone-wording: screen "tutorial" says "Tap" in: "Tap Z while moving to sprint; hold Z to shield (blocks hits, not grabs" (a computer game: no phone or touch wording) (in 5 scenes)
- [UI] phone-wording: screen "tutorial" says "tap" in: "hold a direction as the hit lands to bend your launch a little (DI); t" (a computer game: no phone or touch wording) (in 5 scenes)
- [FEEL] long-match: ffa match on goiky was still going after 2 min of game time (in 5 scenes)
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.1) in ffa; recent move: no recent move (in 2 scenes)
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in ffa; recent move: no recent move (in 2 scenes)
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.1) in ffa; recent move: Firey|ember.special
- [SLOW] jank-spike (JANK): a 71 ms frame (median 0.1) in ffa; recent move: Firey|ember.dt
- [SLOW] jank-spike (JANK): a 55 ms frame (median 0.1) in ffa; recent move: Firey|ember.na
- [SLOW] jank-spike (JANK): a 69 ms frame (median 0.2) in ffa; recent move: Firey|ember.grab
- [SLOW] jank-spike (JANK): a 68 ms frame (median 0.1) in ffa; recent move: Match|spark.jab
- [SLOW] jank-spike (JANK): a 62 ms frame (median 0.1) in ffa; recent move: Match|spark.smash
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.1) in ffa; recent move: Match|spark.dt
- [SLOW] jank-spike (JANK): a 92 ms frame (median 0.1) in ffa; recent move: Match|spark.usmash
- [SLOW] jank-spike (JANK): a 203 ms frame (median 0.1) in ffa; recent move: Match|spark.ua
- [SLOW] jank-spike (JANK): a 49 ms frame (median 0.2) in ffa; recent move: Match|spark.special
- [SLOW] jank-spike (JANK): a 52 ms frame (median 0.2) in ffa; recent move: Match|spark.na
- [SLOW] jank-spike (JANK): a 61 ms frame (median 0.1) in ffa; recent move: Match|spark.ut
- [SLOW] jank-spike (JANK): a 49 ms frame (median 0.1) in ffa; recent move: Match|spark.fa
- [FEEL] jank-input-latency (JANK): Fern: smash took 12 frames (200 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.8) in ffa; recent move: Fern|photo.fa
- [UI] stray-banner: a match shows "KO'd by Tennis Ball − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-input-latency (JANK): Fern: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage incin)
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.1) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.1) in ffa; recent move: Teardrop|kick.fa
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.1) in ffa; recent move: Teardrop|kick.special
- [SLOW] jank-spike (JANK): a 71 ms frame (median 0.1) in ffa; recent move: Teardrop|kick.jab
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.1) in ffa; recent move: Teardrop|kick.smash
- [SLOW] jank-spike (JANK): a 53 ms frame (median 0.1) in ffa; recent move: Teardrop|kick.ut
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.1) in ffa; recent move: Teardrop|kick.usmash
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.1) in ffa; recent move: Teardrop|kick.ba
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.1) in ffa; recent move: Teardrop|kick.up
- [SLOW] jank-spike (JANK): a 51 ms frame (median 0.1) in ffa; recent move: Teardrop|kick.dt
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.4) in ffa; recent move: Blueberry|blueberry.smash
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.2) in ffa; recent move: Dough|copycat.up
- [SLOW] jank-spike (JANK): a 66 ms frame (median 0.5) in ffa; recent move: Blueberry|blueberry.jab
- [SLOW] jank-spike (JANK): a 159 ms frame (median 0.4) in ffa; recent move: Blueberry|blueberry.na
- [SLOW] jank-spike (JANK): a 64 ms frame (median 0.4) in ffa; recent move: Blueberry|blueberry.fa
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in ffa; recent move: Tissues|condishawn.jab

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
