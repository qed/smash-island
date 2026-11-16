# older-slow-reaction-03

**Profile.** older-slow-reaction-03: older adult (67), first-time; goal: play with a grandchild; reads everything slowly; needs time to find keys.
**Hands.** reaction 460 ms (SD 89), key timing jitter 4.03 frames, slipped presses 9%, double-tap 43%, short hop 16%, 60 fps input, 2.89 s per menu target, 328 ms per word read (reads 87% of a screen).
**Keys.** arrows. **Patience.** menus 239 s, confused 73 s on one screen, rage-quits after 4 losses in a row.
**Plan.** tutorial, training, ffa (x passes).

## What they did
- tutorial (seed 105156194): complete; menus took them about 104 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 105156194 --arg persona=older-slow-reaction-03`
- tutorial (seed 281240848): left; menus took them about 104 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 281240848 --arg persona=older-slow-reaction-03`
- tutorial (seed 377696754): complete; menus took them about 104 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 377696754 --arg persona=older-slow-reaction-03`
- training (seed 647353282): cap; menus took them about 285 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 647353282 --arg persona=older-slow-reaction-03 --arg fighter=Microphone`
- training (seed 852376276): cap; menus took them about 285 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 852376276 --arg persona=older-slow-reaction-03 --arg fighter=Jack`
- training (seed 83866637): cap; menus took them about 285 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 83866637 --arg persona=older-slow-reaction-03 --arg fighter=Profily`
- ffa (seed 851102980): cap; 180 s of game on ice, dealt 558, took 229, BOTTOM@0% fell, LEFT@93% fell, RIGHT@109% by Snowball; menus took them about 172 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 851102980 --arg persona=older-slow-reaction-03 --arg fighter=Rose --arg stage=ice --arg kind=ffa`
- ffa (seed 159643298): cap; 180 s of game on canyon, dealt 161, took 217, TOP@200% by Bubble, BOTTOM@17% fell; menus took them about 180 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 159643298 --arg persona=older-slow-reaction-03 --arg fighter=Nickel --arg stage=canyon --arg kind=ffa`
- training (seed 672073656): cap; menus took them about 285 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 672073656 --arg persona=older-slow-reaction-03 --arg fighter=Sidewalky`
- ffa (seed 855899396): cap; 180 s of game on wind, dealt 149, took 34, BOTTOM@21% by Paper, RIGHT@0% fell, BOTTOM@13% fell; menus took them about 172 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 855899396 --arg persona=older-slow-reaction-03 --arg fighter=Baseball --arg stage=wind --arg kind=ffa`
- ffa (seed 82482745): ended; 169 s of game on fortress, dealt 500, took 110, RIGHT@110% by Goo; menus took them about 172 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 82482745 --arg persona=older-slow-reaction-03 --arg fighter=Microphone --arg stage=fortress --arg kind=ffa`
- ffa (seed 535867576): cap; 180 s of game on shift, dealt 69, took 34, BOTTOM@0% fell, LEFT@34% by Trophy; menus took them about 172 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 535867576 --arg persona=older-slow-reaction-03 --arg fighter=Test Tube --arg stage=shift --arg kind=ffa`
- tutorial (seed 154704627): complete; menus took them about 104 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 154704627 --arg persona=older-slow-reaction-03`
- training (seed 911401165): cap; menus took them about 285 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 911401165 --arg persona=older-slow-reaction-03 --arg fighter=Basketball`
- tutorial (seed 219763929): complete; menus took them about 104 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 219763929 --arg persona=older-slow-reaction-03`

## Where they got stuck or confused
- BUG cant: How to Play, step 8 ("Press V once to SMASH"): a player following the card's instruction could not finish it in 22 s
- training: 7 presses slipped (a person's missed keys)
- training: would have quit in the menus: 285 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 239 s
- training: 1 presses slipped (a person's missed keys)
- ffa: was knocked out 1 s into the match (BOTTOM at 0%)
- ffa: 20 presses slipped (a person's missed keys)
- ffa: 5 presses slipped (a person's missed keys)
- training: 3 presses slipped (a person's missed keys)
- ffa: was knocked out 8 s into the match (BOTTOM at 21%)
- ffa: 3 presses slipped (a person's missed keys)
- ffa: 11 presses slipped (a person's missed keys)
- ffa: was knocked out 6 s into the match (BOTTOM at 0%)
- ffa: 2 presses slipped (a person's missed keys)
- training: 11 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [UI] phone-wording: screen "tutorial" says "Tap" in: "Tap Z while moving to sprint; hold Z to shield (blocks hits, not grabs" (a computer game: no phone or touch wording) (in 5 scenes)
- [UI] phone-wording: screen "tutorial" says "tap" in: "hold a direction as the hit lands to bend your launch a little (DI); t" (a computer game: no phone or touch wording) (in 5 scenes)
- [FEEL] long-match: ffa match on goiky was still going after 2 min of game time (in 5 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage ice) (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 2 scenes)
- [SLOW] jank-spike (JANK): a 59 ms frame (median 0.1) in ffa; recent move: Firey|ember.uthrow
- [BUG] cant: How to Play, step 8 ("Press V once to SMASH"): a player following the card's instruction could not finish it in 22 s
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.1) in ffa; recent move: no recent move
- [FEEL] jank-input-latency (JANK): Microphone: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.1) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.1) in ffa; recent move: Microphone|mic.smash
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.1) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 92 ms frame (median 0.1) in ffa; recent move: Jack|jack.jab
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.1) in ffa; recent move: Jack|jack.smash
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.1) in ffa; recent move: Jack|jack.na
- [FEEL] jank-input-latency (JANK): Jack: atk took 6 frames (100 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.1) in ffa; recent move: Jack|jack.fa
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.1) in ffa; recent move: Jack|jack.ut
- [SLOW] jank-spike (JANK): a 64 ms frame (median 0.1) in ffa; recent move: Jack|jack.special
- [SLOW] jank-spike (JANK): a 56 ms frame (median 0.2) in ffa; recent move: Profily|pricetag.jab
- [FEEL] jank-input-latency (JANK): Profily: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 65 ms frame (median 0.1) in ffa; recent move: Profily|pricetag.na
- [SLOW] jank-spike (JANK): a 67 ms frame (median 0.1) in ffa; recent move: Profily|pricetag.smash
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.1) in ffa; recent move: Profily|pricetag.special
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.2) in ffa; recent move: Profily|pricetag.up
- [FEEL] jank-input-latency (JANK): Rose: smash took 8 frames (134 ms) from the key to the first change on the fighter
- [UI] stray-banner: a match shows "KO'd by Snowball − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-hitstop-drift (JANK): Lollipop moved 19 px in one frame while in hitstop (ffa; last move: no move)
- [FEEL] jank-hitstop-drift (JANK): Lollipop moved 47 px in one frame while in hitstop (ffa; last move: Lollipop|sucker.jab)
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.4) in ffa; recent move: Snowball|tackle.finisher
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.3) in ffa; recent move: Rose|thorn.down
- [FEEL] jank-input-latency (JANK): Rose: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [FEEL] long-match: ffa match on ice was still going after 3 min of game time
- [FEEL] jank-teleport (JANK): Bubble moved 154 px in one frame (ffa; last move: Bubble|float.up)
- [SLOW] jank-spike (JANK): a 42 ms frame (median 1.0) in ffa; recent move: Nickel|flip.jab
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.6) in ffa; recent move: Nickel|flip.dt
- [FEEL] jank-input-latency (JANK): Nickel: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [FEEL] jank-teleport (JANK): Nickel moved 183 px in one frame (ffa; last move: Nickel|flip.up)
- [FEEL] jank-hitstop-drift (JANK): Firey Jr. moved 11 px in one frame while in hitstop (ffa; last move: no move)
- [SLOW] jank-spike (JANK): a 34 ms frame (median 1.0) in ffa; recent move: Nickel|flip.smash

## When they would have quit
- training: would have quit in the menus: 285 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 239 s
- training: would have quit in the menus: 285 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 239 s
- training: would have quit in the menus: 285 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 239 s
- training: would have quit in the menus: 285 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 239 s
- training: would have quit in the menus: 285 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 239 s
