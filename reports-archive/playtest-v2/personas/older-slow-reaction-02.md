# older-slow-reaction-02

**Profile.** older-slow-reaction-02: older adult (63), first-time; goal: play with a grandchild; reads everything slowly; needs time to find keys.
**Hands.** reaction 386 ms (SD 85), key timing jitter 4.69 frames, slipped presses 13%, double-tap 46%, short hop 31%, 60 fps input, 2.49 s per menu target, 290 ms per word read (reads 91% of a screen).
**Keys.** arrows. **Patience.** menus 232 s, confused 55 s on one screen, rage-quits after 4 losses in a row.
**Plan.** tutorial, training, ffa (x passes).

## What they did
- tutorial (seed 172678107): complete; menus took them about 96 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 172678107 --arg persona=older-slow-reaction-02`
- tutorial (seed 345869671): complete; menus took them about 96 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 345869671 --arg persona=older-slow-reaction-02`
- tutorial (seed 662995505): complete; menus took them about 96 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 662995505 --arg persona=older-slow-reaction-02`
- training (seed 399998435): cap; menus took them about 261 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 399998435 --arg persona=older-slow-reaction-02 --arg fighter=David`
- training (seed 557020276): cap; menus took them about 261 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 557020276 --arg persona=older-slow-reaction-02 --arg fighter=Bomby`
- training (seed 18517244): cap; menus took them about 261 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 18517244 --arg persona=older-slow-reaction-02 --arg fighter=Firey`
- ffa (seed 697769163): ended; 175 s of game on canyon, dealt 535, took 124, BOTTOM@75% fell, BOTTOM@50% by Microphone; menus took them about 157 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 697769163 --arg persona=older-slow-reaction-02 --arg fighter=Tree --arg stage=canyon --arg kind=ffa`
- ffa (seed 322465337): ended; 83 s of game on wind, dealt 56, took 38, BOTTOM@20% by Yellow Face, BOTTOM@18% by an assist/hazard; menus took them about 157 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 322465337 --arg persona=older-slow-reaction-02 --arg fighter=Woody --arg stage=wind --arg kind=ffa`
- ffa (seed 417502725): cap; 180 s of game on canyon, dealt 263, took 237, BOTTOM@4% fell, BOTTOM@150% fell, BOTTOM@79% by Taco; menus took them about 164 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 417502725 --arg persona=older-slow-reaction-02 --arg fighter=Paintbrush --arg stage=canyon --arg kind=ffa`
- ffa (seed 830650111): ended; 149 s of game on wind, dealt 271, took 148, BOTTOM@26% by Test Tube, BOTTOM@20% fell, BOTTOM@102% by Tapey; menus took them about 157 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 830650111 --arg persona=older-slow-reaction-02 --arg fighter=Flower --arg stage=wind --arg kind=ffa`
- training (seed 123317236): cap; menus took them about 261 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 123317236 --arg persona=older-slow-reaction-02 --arg fighter=Bomb`
- tutorial (seed 662813665): complete; menus took them about 96 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 662813665 --arg persona=older-slow-reaction-02`
- ffa (seed 24723779): cap; 180 s of game on shift, dealt 149, took 28, BOTTOM@12% by Fries, BOTTOM@17% fell, BOTTOM@0% fell; menus took them about 157 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 24723779 --arg persona=older-slow-reaction-02 --arg fighter=Grassy --arg stage=shift --arg kind=ffa`
- training (seed 924209626): cap; menus took them about 261 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 924209626 --arg persona=older-slow-reaction-02 --arg fighter=Fan`
- tutorial (seed 27502850): complete; menus took them about 96 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 27502850 --arg persona=older-slow-reaction-02`

## Where they got stuck or confused
- BUG cant: Bomby: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- training: 21 presses slipped (a person's missed keys)
- training: would have quit in the menus: 261 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 232 s
- training: was knocked out 15 s into the match (LEFT at 91%)
- training: 14 presses slipped (a person's missed keys)
- ffa: 19 presses slipped (a person's missed keys)
- ffa: was knocked out 5 s into the match (BOTTOM at 20%)
- ffa: 4 presses slipped (a person's missed keys)
- ffa: was knocked out 9 s into the match (BOTTOM at 4%)
- ffa: 18 presses slipped (a person's missed keys)
- ffa: was knocked out 10 s into the match (BOTTOM at 26%)
- ffa: 16 presses slipped (a person's missed keys)
- training: 22 presses slipped (a person's missed keys)
- ffa: was knocked out 1 s into the match (BOTTOM at 12%)
- ffa: 5 presses slipped (a person's missed keys)
- training: 16 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage canyon) (in 6 scenes)
- [UI] phone-wording: screen "tutorial" says "Tap" in: "Tap Z while moving to sprint; hold Z to shield (blocks hits, not grabs" (a computer game: no phone or touch wording) (in 5 scenes)
- [UI] phone-wording: screen "tutorial" says "tap" in: "hold a direction as the hit lands to bend your launch a little (DI); t" (a computer game: no phone or touch wording) (in 5 scenes)
- [FEEL] long-match: ffa match on goiky was still going after 2 min of game time (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 5 scenes)
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.1) in ffa; recent move: Firey|ember.jab
- [SLOW] jank-spike (JANK): a 53 ms frame (median 0.1) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.1) in ffa; recent move: David|seriously.special
- [SLOW] jank-spike (JANK): a 76 ms frame (median 0.1) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 127 ms frame (median 0.1) in ffa; recent move: David|seriously.smash
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.1) in ffa; recent move: David|seriously.ut
- [BUG] cant: Bomby: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.2) in ffa; recent move: Bomby|bomb.jab
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.3) in ffa; recent move: Needle|counter.jab
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.3) in ffa; recent move: Bomby|bomb.smash
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.3) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ffa; recent move: Leafy|dash.jab
- [SLOW] jank-spike (JANK): a 99 ms frame (median 0.2) in ffa; recent move: Bomby|bomb.special
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.3) in ffa; recent move: Leafy|dash.down
- [FEEL] jank-input-latency (JANK): Bomby: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 121 ms frame (median 0.3) in ffa; recent move: Bomby|bomb.na
- [SLOW] jank-spike (JANK): a 68 ms frame (median 0.3) in ffa; recent move: Leafy|dash.special
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in ffa; recent move: Bomby|bomb.da
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.2) in ffa; recent move: Firey|ember.ut
- [SLOW] jank-spike (JANK): a 50 ms frame (median 0.1) in ffa; recent move: Firey|ember.jab
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.1) in ffa; recent move: Firey|ember.smash
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.2) in ffa; recent move: Firey|ember.special
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: Firey|ember.na
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in ffa; recent move: Firey|ember.da
- [FEEL] jank-input-latency (JANK): Firey: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 57 ms frame (median 0.2) in ffa; recent move: Firey|ember.dt
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.2) in ffa; recent move: Firey|ember.down
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.3) in ffa; recent move: Firey|ember.grab
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: Firey|ember.ua
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.2) in ffa; recent move: Firey|ember.ba
- [SLOW] jank-spike (JANK): a 68 ms frame (median 0.4) in ffa; recent move: no recent move
- [FEEL] jank-input-latency (JANK): Tree: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.3) in ffa; recent move: Microphone|mic.finisher

## When they would have quit
- training: would have quit in the menus: 261 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 232 s
- training: would have quit in the menus: 261 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 232 s
- training: would have quit in the menus: 261 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 232 s
- training: would have quit in the menus: 261 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 232 s
- training: would have quit in the menus: 261 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 232 s
