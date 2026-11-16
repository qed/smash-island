# worldcup-fan-02

**Profile.** worldcup-fan-02: adult (45), casual; goal: run a World Cup and watch it play out; sets up a cup then watches fixtures; reads the hub.
**Hands.** reaction 324 ms (SD 62), key timing jitter 2.78 frames, slipped presses 7%, double-tap 59%, short hop 41%, 60 fps input, 1.06 s per menu target, 285 ms per word read (reads 47% of a screen).
**Keys.** arrows. **Patience.** menus 149 s, confused 50 s on one screen, rage-quits after 7 losses in a row.
**Plan.** worldcup, flagcup, journey (x passes).

## What they did
- worldcup (seed 40862859): cup; menus took them about 70 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 40862859 --arg persona=worldcup-fan-02 --arg size=1 --arg fighter=David`
- journey (seed 295442301): journey ffa:4c/71.2s 1v1:4c/37.7s teams:4c/37.7s boss:4c/37.7s ctf:4c/37.7s training:3c/26.6s tutorial:3c/47.9s worldcup:6c/67.7s flagcup:4c/50.5s; menus took them about 585 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 295442301 --arg persona=worldcup-fan-02`
- journey (seed 843370196): journey ffa:4c/71.2s 1v1:4c/37.7s teams:4c/37.7s boss:4c/37.7s ctf:4c/37.7s training:3c/26.6s tutorial:3c/47.9s worldcup:6c/67.7s flagcup:4c/50.5s; menus took them about 585 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 843370196 --arg persona=worldcup-fan-02`
- worldcup (seed 758549116): cup; menus took them about 70 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 758549116 --arg persona=worldcup-fan-02 --arg size=1 --arg fighter=Rocky`
- worldcup (seed 377245720): cup; menus took them about 70 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 377245720 --arg persona=worldcup-fan-02 --arg size=1 --arg fighter=Ruby`
- flagcup (seed 286621089): watched 2, skipped 1; menus took them about 48 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 286621089 --arg persona=worldcup-fan-02`
- journey (seed 714259636): journey ffa:4c/71.2s 1v1:4c/37.7s teams:4c/37.7s boss:4c/37.7s ctf:4c/37.7s training:3c/26.6s tutorial:3c/47.9s worldcup:6c/67.7s flagcup:4c/50.2s; menus took them about 585 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 714259636 --arg persona=worldcup-fan-02`
- flagcup (seed 340404476): watched 2, skipped 1; menus took them about 49 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 340404476 --arg persona=worldcup-fan-02`
- flagcup (seed 408470508): watched 2, skipped 1; menus took them about 49 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 408470508 --arg persona=worldcup-fan-02`
- flagcup (seed 955531733): watched 2, skipped 1; menus took them about 49 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 955531733 --arg persona=worldcup-fan-02`
- worldcup (seed 320300847): cup; menus took them about 70 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 320300847 --arg persona=worldcup-fan-02 --arg size=1 --arg fighter=Fan`
- journey (seed 607587240): journey ffa:4c/71.2s 1v1:4c/37.7s teams:4c/37.7s boss:4c/37.7s ctf:4c/37.7s training:3c/26.6s tutorial:3c/47.9s worldcup:6c/67.7s flagcup:4c/49.9s; menus took them about 585 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 607587240 --arg persona=worldcup-fan-02`
- flagcup (seed 588537554): watched 2, skipped 1; menus took them about 49 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 588537554 --arg persona=worldcup-fan-02`
- worldcup (seed 262609933): cup; menus took them about 70 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 262609933 --arg persona=worldcup-fan-02 --arg size=1 --arg fighter=Fries`
- journey (seed 604191550): journey ffa:4c/71.2s 1v1:4c/37.7s teams:4c/37.7s boss:4c/37.7s ctf:4c/37.7s training:3c/26.6s tutorial:3c/47.9s worldcup:6c/68s flagcup:4c/50.5s; menus took them about 585 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 604191550 --arg persona=worldcup-fan-02`

## Where they got stuck or confused
- BUG cant: Ruby: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- worldcup: was knocked out 2 s into the match (BOTTOM at 0%)
- worldcup: 7 presses slipped (a person's missed keys)
- worldcup: 3 presses slipped (a person's missed keys)
- worldcup: was knocked out 14 s into the match (BOTTOM at 17%)

## What went wrong (everything the playtester noted while they played)
- [UI] jank-slow-path (JANK): ffa: about 71 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 5 scenes)
- [UI] jank-slow-path (JANK): worldcup: about 68 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 5 scenes)
- [FEEL] long-match: ctf match on ctf-castle was still going after 1 min of game time (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/hide (in 4 scenes)
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.3) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 95 ms frame (median 0.7) in ffa; recent move: Rocky|barf.special
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.4) in ffa; recent move: Paper|evilpaper.finisher
- [FEEL] jank-hitstop-drift (JANK): Paper moved 21 px in one frame while in hitstop (ffa; last move: no move)
- [FEEL] jank-input-latency (JANK): Rocky: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.2) in ffa; recent move: Rocky|barf.smash
- [SLOW] jank-spike (JANK): a 101 ms frame (median 0.2) in ffa; recent move: Paper|evilpaper.jab
- [SLOW] jank-spike (JANK): a 76 ms frame (median 0.4) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ffa; recent move: Gelatin|freeze.down
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.5) in ffa; recent move: Ruby|beam.jab
- [FEEL] jank-input-latency (JANK): Ruby: smash took 10 frames (167 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.3) in ffa; recent move: Ruby|beam.special
- [BUG] cant: Ruby: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.3) in ffa; recent move: Ruby|beam.smash
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.3) in ffa; recent move: Ruby|beam.ua
- [SLOW] jank-spike (JANK): a 102 ms frame (median 1.7) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 47 ms frame (median 6.8) in ctf/fix; recent move: no recent move
- [SLOW] jank-spike (JANK): a 40 ms frame (median 5.7) in ctf/play; recent move: no recent move
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/play
- [SLOW] jank-spike (JANK): a 87 ms frame (median 6.1) in ctf/play; recent move: Cherries|cherries.up
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 598 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 44 ms frame (median 2.8) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 34 ms frame (median 5.3) in ctf/fix; recent move: no recent move
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/fix
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 437 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 456 ms frame (median 52.9) in ctf/hide; recent move: no recent move
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 1087 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 80 ms frame (median 2.0) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 86 ms frame (median 7.1) in ctf/fix; recent move: no recent move
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 463 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 206 ms frame (median 23.0) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 98 ms frame (median 10.7) in ctf/fix; recent move: no recent move
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 617 ms before the next screen was ready

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
