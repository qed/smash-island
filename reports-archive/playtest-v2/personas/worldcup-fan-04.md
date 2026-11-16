# worldcup-fan-04

**Profile.** worldcup-fan-04: adult (44), casual; goal: run a World Cup and watch it play out; sets up a cup then watches fixtures; reads the hub.
**Hands.** reaction 277 ms (SD 56), key timing jitter 1.87 frames, slipped presses 9%, double-tap 74%, short hop 53%, 60 fps input, 0.81 s per menu target, 274 ms per word read (reads 52% of a screen).
**Keys.** arrows. **Patience.** menus 225 s, confused 53 s on one screen, rage-quits after 5 losses in a row.
**Plan.** worldcup, flagcup, journey (x passes).

## What they did
- journey (seed 146548810): journey ffa:4c/74.5s 1v1:4c/38.9s teams:4c/38.9s boss:4c/38.9s ctf:4c/38.9s training:3c/27.4s tutorial:3c/50s worldcup:6c/70.1s flagcup:4c/52.4s; menus took them about 606 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 146548810 --arg persona=worldcup-fan-04`
- journey (seed 725573350): journey ffa:4c/74.5s 1v1:4c/38.9s teams:4c/38.9s boss:4c/38.9s ctf:4c/38.9s training:3c/27.4s tutorial:3c/50s worldcup:6c/70.7s flagcup:4c/51.8s; menus took them about 606 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 725573350 --arg persona=worldcup-fan-04`
- worldcup (seed 778919888): cup; menus took them about 70 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 778919888 --arg persona=worldcup-fan-04 --arg size=1 --arg fighter=Spikey`
- worldcup (seed 410118515): cup; menus took them about 70 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 410118515 --arg persona=worldcup-fan-04 --arg size=1 --arg fighter=Teddy Bear`
- worldcup (seed 767819060): cup; menus took them about 70 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 767819060 --arg persona=worldcup-fan-04 --arg size=1 --arg fighter=Pin`
- flagcup (seed 266518894): watched 2, skipped 1; menus took them about 51 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 266518894 --arg persona=worldcup-fan-04`
- flagcup (seed 918171029): watched 2, skipped 1; menus took them about 51 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 918171029 --arg persona=worldcup-fan-04`
- flagcup (seed 884232246): watched 2, skipped 1; menus took them about 51 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 884232246 --arg persona=worldcup-fan-04`
- journey (seed 290463789): journey ffa:4c/74.5s 1v1:4c/38.9s teams:4c/38.9s boss:4c/38.9s ctf:4c/38.9s training:3c/27.4s tutorial:3c/50s worldcup:6c/70.7s flagcup:4c/52.1s; menus took them about 607 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 290463789 --arg persona=worldcup-fan-04`
- flagcup (seed 43501650): watched 2, skipped 1; menus took them about 51 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 43501650 --arg persona=worldcup-fan-04`
- journey (seed 926916994): journey ffa:4c/74.5s 1v1:4c/38.9s teams:4c/38.9s boss:4c/38.9s ctf:4c/38.9s training:3c/27.4s tutorial:3c/50s worldcup:6c/69.8s flagcup:4c/52.4s; menus took them about 606 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 926916994 --arg persona=worldcup-fan-04`
- worldcup (seed 928543669): cup; menus took them about 71 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 928543669 --arg persona=worldcup-fan-04 --arg size=1 --arg fighter=Test Tube`
- flagcup (seed 181413460): watched 2, skipped 1; menus took them about 50 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 181413460 --arg persona=worldcup-fan-04`
- worldcup (seed 904884536): cup; menus took them about 77 s and 14 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 904884536 --arg persona=worldcup-fan-04 --arg size=2 --arg fighter=Teardrop`
- journey (seed 790559605): journey ffa:4c/74.5s 1v1:4c/38.9s teams:4c/38.9s boss:4c/38.9s ctf:4c/38.9s training:3c/27.4s tutorial:3c/50s worldcup:6c/70.1s flagcup:4c/51.8s; menus took them about 606 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 790559605 --arg persona=worldcup-fan-04`

## Where they got stuck or confused
- BUG cant: Teddy Bear: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG playtest-credit: the player's finisher move type counts 0 hits but the player's finisher move landed 2 (the playtester's own bookkeeping, not the game)
- worldcup: 10 presses slipped (a person's missed keys)
- worldcup: 6 presses slipped (a person's missed keys)
- worldcup: 14 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [UI] jank-slow-path (JANK): ffa: about 75 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 5 scenes)
- [FEEL] long-match: ctf match on ctf-castle was still going after 1 min of game time (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/hide (in 4 scenes)
- [UI] jank-slow-path (JANK): worldcup: about 70 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 3 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/fix (in 3 scenes)
- [UI] jank-slow-path (JANK): worldcup: about 71 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage dreamisle) (in 2 scenes)
- [SLOW] jank-slow-click (JANK): a click on "Take the Plunge ▶" at screen "title" took 351 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "Skip" at screen "tutorial" took 384 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "Take the Plunge ▶" at screen "title" took 361 ms before the next screen was ready
- [FEEL] jank-input-latency (JANK): Teddy Bear: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 78 ms frame (median 0.2) in ffa; recent move: Teddy Bear|paintball.jab
- [BUG] cant: Teddy Bear: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.3) in ffa; recent move: Pin|pierce.smash
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.3) in ffa; recent move: Puffball|fly.jab
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.3) in ffa; recent move: no recent move
- [FEEL] jank-input-latency (JANK): Pin: smash took 4 frames (67 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.3) in ffa; recent move: Pin|pierce.jab
- [SLOW] jank-spike (JANK): a 38 ms frame (median 2.1) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 42 ms frame (median 2.1) in ctf/fix; recent move: no recent move
- [SLOW] jank-spike (JANK): a 141 ms frame (median 4.5) in ctf/play; recent move: no recent move
- [SLOW] jank-spike (JANK): a 37 ms frame (median 4.7) in ctf/play; recent move: Leafy|dash.special
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/play
- [SLOW] jank-spike (JANK): a 49 ms frame (median 4.3) in ctf/play; recent move: Trophy|blackmail.up
- [SLOW] jank-spike (JANK): a 226 ms frame (median 5.7) in ctf/play; recent move: Bomb|collide.up
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 655 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 52 ms frame (median 6.3) in ctf/hide; recent move: no recent move
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 1010 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 51 ms frame (median 1.3) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 63 ms frame (median 10.4) in ctf/fix; recent move: no recent move
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 596 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 243 ms frame (median 9.1) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 416 ms frame (median 14.6) in ctf/fix; recent move: no recent move
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 745 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.1) in ffa; recent move: Test Tube|testtube.ut
- [SLOW] jank-spike (JANK): a 83 ms frame (median 0.2) in ffa; recent move: Test Tube|testtube.special
- [SLOW] jank-spike (JANK): a 79 ms frame (median 0.2) in ffa; recent move: no recent move
- [FEEL] jank-teleport (JANK): Test Tube moved 188 px in one frame (ffa; last move: Test Tube|testtube.up)
- [SLOW] jank-spike (JANK): a 60 ms frame (median 0.2) in ffa; recent move: Dora|rant.jab
- [FEEL] jank-input-latency (JANK): Test Tube: atk took 7 frames (117 ms) from the key to the first change on the fighter

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
