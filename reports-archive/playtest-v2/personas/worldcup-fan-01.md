# worldcup-fan-01

**Profile.** worldcup-fan-01: adult (27), casual; goal: run a World Cup and watch it play out; sets up a cup then watches fixtures; reads the hub.
**Hands.** reaction 313 ms (SD 54), key timing jitter 2.6 frames, slipped presses 9%, double-tap 59%, short hop 44%, 60 fps input, 0.96 s per menu target, 261 ms per word read (reads 45% of a screen).
**Keys.** arrows. **Patience.** menus 175 s, confused 45 s on one screen, rage-quits after 5 losses in a row.
**Plan.** worldcup, flagcup, journey (x passes).

## What they did
- journey (seed 867814128): journey ffa:4c/62.6s 1v1:4c/33.2s teams:4c/33.2s boss:4c/33.2s ctf:4c/33.2s training:3c/23.4s tutorial:3c/42.1s worldcup:6c/59.3s flagcup:4c/44.6s; menus took them about 515 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 867814128 --arg persona=worldcup-fan-01`
- worldcup (seed 164533750): cup; menus took them about 61 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 164533750 --arg persona=worldcup-fan-01 --arg size=1 --arg fighter=Soap`
- journey (seed 106716880): journey ffa:4c/62.6s 1v1:4c/33.2s teams:4c/33.2s boss:4c/33.2s ctf:4c/33.2s training:3c/23.4s tutorial:3c/42.1s worldcup:6c/59.3s flagcup:4c/44.1s; menus took them about 515 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 106716880 --arg persona=worldcup-fan-01`
- worldcup (seed 700758312): cup; menus took them about 61 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 700758312 --arg persona=worldcup-fan-01 --arg size=1 --arg fighter=Tissues`
- worldcup (seed 138716947): cup; menus took them about 67 s and 14 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 138716947 --arg persona=worldcup-fan-01 --arg size=2 --arg fighter=TV`
- flagcup (seed 904458996): watched 2, skipped 1; menus took them about 43 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 904458996 --arg persona=worldcup-fan-01`
- flagcup (seed 672893223): watched 2, skipped 1; menus took them about 43 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 672893223 --arg persona=worldcup-fan-01`
- flagcup (seed 777129155): watched 2, skipped 1; menus took them about 43 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 777129155 --arg persona=worldcup-fan-01`
- journey (seed 507598017): journey ffa:4c/62.6s 1v1:4c/33.2s teams:4c/33.2s boss:4c/33.2s ctf:4c/33.2s training:3c/23.4s tutorial:3c/42.1s worldcup:6c/59.6s flagcup:4c/44.6s; menus took them about 515 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 507598017 --arg persona=worldcup-fan-01`
- flagcup (seed 894088244): watched 2, skipped 1; menus took them about 43 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 894088244 --arg persona=worldcup-fan-01`
- worldcup (seed 31679691): cup; menus took them about 61 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 31679691 --arg persona=worldcup-fan-01 --arg size=1 --arg fighter=Ruby`
- journey (seed 61147474): journey ffa:4c/62.6s 1v1:4c/33.2s teams:4c/33.2s boss:4c/33.2s ctf:4c/33.2s training:3c/23.4s tutorial:3c/42.1s worldcup:6c/59.3s flagcup:4c/43.9s; menus took them about 514 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 61147474 --arg persona=worldcup-fan-01`
- flagcup (seed 173561967): watched 2, skipped 1; menus took them about 43 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 173561967 --arg persona=worldcup-fan-01`
- worldcup (seed 279050235): cup; menus took them about 67 s and 14 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 279050235 --arg persona=worldcup-fan-01 --arg size=2 --arg fighter=Woody`
- journey (seed 419290707): journey ffa:4c/62.6s 1v1:4c/33.2s teams:4c/33.2s boss:4c/33.2s ctf:4c/33.2s training:3c/23.4s tutorial:3c/42.1s worldcup:6c/60s flagcup:4c/44.1s; menus took them about 515 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 419290707 --arg persona=worldcup-fan-01`

## Where they got stuck or confused
- BUG cant: Tissues: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Lightning: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Match: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- worldcup: 3 presses slipped (a person's missed keys)
- worldcup: 5 presses slipped (a person's missed keys)
- worldcup: 15 presses slipped (a person's missed keys)
- worldcup: 12 presses slipped (a person's missed keys)
- worldcup: 18 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [UI] jank-slow-path (JANK): ffa: about 63 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/hide (in 5 scenes)
- [FEEL] long-match: ctf match on ctf-castle was still going after 1 min of game time (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/fix (in 3 scenes)
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: Soap|disinfect.special
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in ffa; recent move: Soap|disinfect.jab
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.4) in ffa; recent move: Bomb|collide.da
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.2) in ffa; recent move: Tissues|condishawn.ut
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.2) in ffa; recent move: no recent move
- [BUG] cant: Tissues: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- [SLOW] jank-spike (JANK): a 49 ms frame (median 0.2) in ffa; recent move: Bomb|collide.fa
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.2) in ffa; recent move: Tissues|condishawn.jab
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.2) in ffa; recent move: Tissues|condishawn.ua
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.2) in ffa; recent move: Tissues|condishawn.special
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: Tissues|condishawn.grab
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.3) in ffa; recent move: Bomb|collide.ba
- [SLOW] jank-spike (JANK): a 48 ms frame (median 0.2) in ffa; recent move: Tissues|condishawn.na
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.2) in ffa; recent move: Tissues|condishawn.smash
- [FEEL] jank-input-latency (JANK): Tissues: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.4) in teams; recent move: Lightning|zap.jab
- [FEEL] jank-teleport (JANK): Lightning moved 176 px in one frame (teams; last move: Lightning|zap.up)
- [SLOW] jank-spike (JANK): a 120 ms frame (median 0.4) in teams; recent move: no recent move
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.7) in teams; recent move: Lightning|zap.finisher
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.4) in teams; recent move: Lightning|zap.special
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.7) in teams; recent move: TV|static.up
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.8) in teams; recent move: TV|static.jab
- [SLOW] jank-spike (JANK): a 45 ms frame (median 1.0) in teams; recent move: Book|define.jab
- [SLOW] jank-spike (JANK): a 52 ms frame (median 0.6) in teams; recent move: Book|define.special
- [SLOW] jank-spike (JANK): a 96 ms frame (median 0.7) in teams; recent move: TV|static.fa
- [SLOW] jank-spike (JANK): a 100 ms frame (median 0.5) in teams; recent move: Lightning|zap.smash
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.7) in teams; recent move: Book|define.up
- [SLOW] jank-spike (JANK): a 157 ms frame (median 1.1) in teams; recent move: TV|static.na
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.8) in teams; recent move: Paper|evilpaper.up
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.8) in teams; recent move: Book|define.dt
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.7) in teams; recent move: Lightning|zap.da
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.6) in teams; recent move: Lightning|zap.na
- [SLOW] jank-spike (JANK): a 195 ms frame (median 0.6) in teams; recent move: Paper|evilpaper.special
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.9) in teams; recent move: TV|static.special
- [BUG] cant: Lightning: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
