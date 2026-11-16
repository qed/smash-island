# adult-casual-low-patience-04

**Profile.** adult-casual-low-patience-04: adult (26), casual; goal: a quick match after work; skims; leaves a menu after a few seconds of confusion.
**Hands.** reaction 251 ms (SD 52), key timing jitter 2.03 frames, slipped presses 4%, double-tap 58%, short hop 54%, 60 fps input, 1.04 s per menu target, 234 ms per word read (reads 17% of a screen).
**Keys.** arrows. **Patience.** menus 34 s, confused 9 s on one screen, rage-quits after 2 losses in a row.
**Plan.** journey, ffa, flow (x passes).

## What they did
- journey (seed 92278142): journey ffa:4c/24s 1v1:4c/14.1s teams:4c/14.1s boss:4c/14.1s ctf:4c/14.1s training:3c/10.1s tutorial:3c/16.4s worldcup:6c/24.5s flagcup:4c/17.9s; menus took them about 213 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 92278142 --arg persona=adult-casual-low-patience-04`
- journey (seed 63421527): journey ffa:4c/24s 1v1:4c/14.1s teams:4c/14.1s boss:4c/14.1s ctf:4c/14.1s training:3c/10.1s tutorial:3c/16.4s worldcup:6c/24.5s flagcup:4c/17.9s; menus took them about 213 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 63421527 --arg persona=adult-casual-low-patience-04`
- journey (seed 899865315): journey ffa:4c/24s 1v1:4c/14.1s teams:4c/14.1s boss:4c/14.1s ctf:4c/14.1s training:3c/10.1s tutorial:3c/16.4s worldcup:6c/24.3s flagcup:4c/18s; menus took them about 213 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 899865315 --arg persona=adult-casual-low-patience-04`
- flow (seed 738372183): flow; menus took them about 28 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 738372183 --arg persona=adult-casual-low-patience-04 --arg fighter=Bomb`
- flow (seed 884320589): flow; menus took them about 28 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 884320589 --arg persona=adult-casual-low-patience-04 --arg fighter=Fries`
- ffa (seed 923202044): ended; 72 s of game on pillars, dealt 202, took 98, RIGHT@58% by Profily; menus took them about 30 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 923202044 --arg persona=adult-casual-low-patience-04 --arg fighter=Loser --arg stage=pillars --arg kind=ffa`
- ffa (seed 297997684): ended; 75 s of game on forest, dealt 337, took 527, RIGHT@84% by Salt, MAX@236% by Pillow; menus took them about 30 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 297997684 --arg persona=adult-casual-low-patience-04 --arg fighter=Ruler --arg stage=forest --arg kind=ffa`
- ffa (seed 375186874): ended; 115 s of game on tlc, dealt 701, took 326, TOP@195% by Bow; menus took them about 30 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 375186874 --arg persona=adult-casual-low-patience-04 --arg fighter=Goo --arg stage=tlc --arg kind=ffa`
- flow (seed 652288266): flow; menus took them about 28 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 652288266 --arg persona=adult-casual-low-patience-04 --arg fighter=Yellow Face`
- ffa (seed 924603085): cap; 180 s of game on ice, dealt 604, took 347, TOP@146% by Roboty, BOTTOM@105% by Roboty; menus took them about 30 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 924603085 --arg persona=adult-casual-low-patience-04 --arg fighter=Rose --arg stage=ice --arg kind=ffa`
- ffa (seed 382231221): ended; 161 s of game on yoyle, dealt 515, took 95, BOTTOM@52% by Ruler, BOTTOM@15% by Ruler; menus took them about 30 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 382231221 --arg persona=adult-casual-low-patience-04 --arg fighter=Knife --arg stage=yoyle --arg kind=ffa`
- flow (seed 176990028): flow; menus took them about 28 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 176990028 --arg persona=adult-casual-low-patience-04 --arg fighter=Rose`
- journey (seed 326778723): journey ffa:4c/24s 1v1:4c/14.1s teams:4c/14.1s boss:4c/14.1s ctf:4c/14.1s training:3c/10.1s tutorial:3c/16.4s worldcup:6c/24.4s flagcup:4c/18s; menus took them about 213 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 326778723 --arg persona=adult-casual-low-patience-04`
- journey (seed 745700966): journey ffa:4c/24s 1v1:4c/14.1s teams:4c/14.1s boss:4c/14.1s ctf:4c/14.1s training:3c/10.1s tutorial:3c/16.4s worldcup:6c/24.4s flagcup:4c/17.8s; menus took them about 212 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 745700966 --arg persona=adult-casual-low-patience-04`
- flow (seed 205977712): flow; menus took them about 28 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 205977712 --arg persona=adult-casual-low-patience-04 --arg fighter=Cake`

## Where they got stuck or confused
- BUG cant: Rose: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- ffa: 5 presses slipped (a person's missed keys)
- ffa: 4 presses slipped (a person's missed keys)
- ffa: 11 presses slipped (a person's missed keys)
- ffa: 12 presses slipped (a person's missed keys)
- ffa: 17 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [UI] stray-banner: a match shows "KO'd by Lifering − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage pillars) (in 2 scenes)
- [UI] stray-banner: a match shows "KO'd by Paper − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.1) in ffa; recent move: no recent move
- [UI] stray-banner: a match shows "KO'd by Pencil − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-input-latency (JANK): Loser: atk took 6 frames (100 ms) from the key to the first change on the fighter
- [UI] stray-banner: a match shows "KO'd by Profily − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-input-latency (JANK): Ruler: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [FEEL] jank-hitstop-drift (JANK): Salt moved 27 px in one frame while in hitstop (ffa; last move: Salt|saltpepper.finisher)
- [UI] stray-banner: a match shows "KO'd by Salt − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [UI] stray-banner: a match shows "KO'd by Pillow − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-teleport (JANK): Nickel moved 153 px in one frame (ffa; last move: Nickel|flip.up)
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.6) in ffa; recent move: Goo|engulf.smash
- [FEEL] jank-input-latency (JANK): Goo: special took 5 frames (84 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.9) in ffa; recent move: Tree|timber.special
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.9) in ffa; recent move: Goo|engulf.ua
- [FEEL] jank-teleport (JANK): Bow moved 240 px in one frame (ffa; last move: Bow|chair.special)
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.9) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.7) in ffa; recent move: Cherries|cherries.ua
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.6) in ffa; recent move: Goo|engulf.fa
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.7) in ffa; recent move: Goo|engulf.jab
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ffa; recent move: Goo|engulf.special
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.6) in ffa; recent move: Cherries|cherries.jab
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.6) in ffa; recent move: Nickel|flip.finisher
- [FEEL] jank-teleport (JANK): Goo moved 171 px in one frame (ffa; last move: no move)
- [UI] stray-banner: a match shows "KO'd by Bow − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.6) in ffa; recent move: Bow|chair.special
- [UI] stray-banner: a match shows "KO'd by Pickle − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-hitstop-drift (JANK): Gaty moved 14 px in one frame while in hitstop (ffa; last move: Gaty|reflect.dt)
- [FEEL] jank-input-latency (JANK): Rose: atk took 5 frames (84 ms) from the key to the first change on the fighter
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage ice)
- [UI] stray-banner: a match shows "KO'd by Roboty − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-teleport (JANK): Gelatin moved 221 px in one frame (ffa; last move: no move)
- [FEEL] jank-teleport (JANK): Rose moved 201 px in one frame (ffa; last move: Rose|thorn.dt)
- [FEEL] jank-hitstop-drift (JANK): Roboty moved 47 px in one frame while in hitstop (ffa; last move: no move)
- [FEEL] jank-teleport (JANK): Gelatin moved 369 px in one frame (ffa; last move: Gelatin|freeze.up)
- [BUG] cant: Rose: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- [FEEL] jank-input-latency (JANK): Rose: smash took 12 frames (200 ms) from the key to the first change on the fighter
- [FEEL] long-match: ffa match on ice was still going after 3 min of game time
- [FEEL] jank-input-latency (JANK): Knife: atk took 7 frames (117 ms) from the key to the first change on the fighter

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
