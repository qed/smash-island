# worldcup-fan-03

**Profile.** worldcup-fan-03: adult (33), casual; goal: run a World Cup and watch it play out; sets up a cup then watches fixtures; reads the hub.
**Hands.** reaction 319 ms (SD 57), key timing jitter 2.18 frames, slipped presses 5%, double-tap 68%, short hop 37%, 60 fps input, 0.88 s per menu target, 295 ms per word read (reads 42% of a screen).
**Keys.** arrows. **Patience.** menus 140 s, confused 35 s on one screen, rage-quits after 6 losses in a row.
**Plan.** worldcup, flagcup, journey (x passes).

## What they did
- worldcup (seed 613725915): cup; menus took them about 64 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 613725915 --arg persona=worldcup-fan-03 --arg size=1 --arg fighter=Woody`
- journey (seed 713048563): journey ffa:4c/65.5s 1v1:4c/34.5s teams:4c/34.5s boss:4c/34.5s ctf:4c/34.5s training:3c/24.3s tutorial:3c/44s worldcup:6c/62s flagcup:4c/46.3s; menus took them about 537 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 713048563 --arg persona=worldcup-fan-03`
- journey (seed 529412563): journey ffa:4c/65.5s 1v1:4c/34.5s teams:4c/34.5s boss:4c/34.5s ctf:4c/34.5s training:3c/24.3s tutorial:3c/44s worldcup:6c/62s flagcup:4c/46s; menus took them about 536 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 529412563 --arg persona=worldcup-fan-03`
- worldcup (seed 68671634): cup; menus took them about 63 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 68671634 --arg persona=worldcup-fan-03 --arg size=1 --arg fighter=Basketball`
- worldcup (seed 83954608): cup; menus took them about 63 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 83954608 --arg persona=worldcup-fan-03 --arg size=1 --arg fighter=Gaty`
- flagcup (seed 975313293): watched 2, skipped 1; menus took them about 45 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 975313293 --arg persona=worldcup-fan-03`
- flagcup (seed 8911059): watched 2, skipped 1; menus took them about 45 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 8911059 --arg persona=worldcup-fan-03`
- worldcup (seed 627083655): cup; menus took them about 63 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 627083655 --arg persona=worldcup-fan-03 --arg size=1 --arg fighter=Fries`
- flagcup (seed 829568624): watched 2, skipped 1; menus took them about 44 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 829568624 --arg persona=worldcup-fan-03`
- worldcup (seed 313268393): cup; menus took them about 64 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 313268393 --arg persona=worldcup-fan-03 --arg size=1 --arg fighter=Nickel (II)`
- flagcup (seed 995337630): watched 2, skipped 1; menus took them about 45 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 995337630 --arg persona=worldcup-fan-03`
- flagcup (seed 836362300): watched 2, skipped 1; menus took them about 45 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 836362300 --arg persona=worldcup-fan-03`
- journey (seed 581780972): journey ffa:4c/65.5s 1v1:4c/34.5s teams:4c/34.5s boss:4c/34.5s ctf:4c/34.5s training:3c/24.3s tutorial:3c/44s worldcup:6c/62.3s flagcup:4c/46.5s; menus took them about 537 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 581780972 --arg persona=worldcup-fan-03`
- journey (seed 439822595): journey ffa:4c/65.5s 1v1:4c/34.5s teams:4c/34.5s boss:4c/34.5s ctf:4c/34.5s training:3c/24.3s tutorial:3c/44s worldcup:6c/62s flagcup:4c/46.3s; menus took them about 537 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 439822595 --arg persona=worldcup-fan-03`
- journey (seed 808005860): journey ffa:4c/65.5s 1v1:4c/34.5s teams:4c/34.5s boss:4c/34.5s ctf:4c/34.5s training:3c/24.3s tutorial:3c/44s worldcup:6c/61.5s flagcup:4c/46s; menus took them about 536 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 808005860 --arg persona=worldcup-fan-03`

## Where they got stuck or confused
- BUG cant: Woody: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- worldcup: 2 presses slipped (a person's missed keys)
- worldcup: 4 presses slipped (a person's missed keys)
- worldcup: 3 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [UI] jank-slow-path (JANK): ffa: about 66 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 5 scenes)
- [UI] jank-slow-path (JANK): worldcup: about 62 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/hide (in 5 scenes)
- [FEEL] long-match: ctf match on ctf-castle was still going after 1 min of game time (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/fix (in 4 scenes)
- [BUG] cant: Woody: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- [SLOW] jank-spike (JANK): a 76 ms frame (median 0.3) in ffa; recent move: Woody|fraidy.na
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.3) in ffa; recent move: Woody|fraidy.finisher
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage incin)
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in ffa; recent move: Nickel (II)|snark.finisher
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.3) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 52 ms frame (median 1.7) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 77 ms frame (median 10.7) in ctf/fix; recent move: no recent move
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 1133 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 49 ms frame (median 1.3) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 34 ms frame (median 1.5) in ctf/fix; recent move: no recent move
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 457 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 51 ms frame (median 0.2) in ffa; recent move: Pickle|pickle.jab
- [SLOW] jank-spike (JANK): a 150 ms frame (median 0.3) in ffa; recent move: Fries|fry.special
- [SLOW] jank-spike (JANK): a 52 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 49 ms frame (median 0.3) in ffa; recent move: Pickle|pickle.dt
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in ffa; recent move: Pickle|pickle.special
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.3) in ffa; recent move: Pickle|pickle.smash
- [SLOW] jank-spike (JANK): a 102 ms frame (median 0.2) in ffa; recent move: Fries|fry.smash
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.2) in ffa; recent move: Fries|fry.jab
- [SLOW] jank-spike (JANK): a 50 ms frame (median 0.2) in ffa; recent move: Fries|fry.ba
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.2) in ffa; recent move: Balloon|airrel.jab
- [SLOW] jank-spike (JANK): a 56 ms frame (median 6.3) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 51 ms frame (median 8.3) in ctf/fix; recent move: no recent move
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 840 ms before the next screen was ready
- [FEEL] jank-input-latency (JANK): Nickel (II): smash took 4 frames (67 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 48 ms frame (median 1.8) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 98 ms frame (median 12.0) in ctf/fix; recent move: no recent move
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 533 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 43 ms frame (median 5.3) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 110 ms frame (median 6.8) in ctf/fix; recent move: no recent move
- [SLOW] jank-spike (JANK): a 164 ms frame (median 13.8) in ctf/play; recent move: no recent move
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 660 ms before the next screen was ready

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
