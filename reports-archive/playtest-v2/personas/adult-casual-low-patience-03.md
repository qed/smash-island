# adult-casual-low-patience-03

**Profile.** adult-casual-low-patience-03: adult (34), casual; goal: a quick match after work; skims; leaves a menu after a few seconds of confusion.
**Hands.** reaction 256 ms (SD 55), key timing jitter 2.28 frames, slipped presses 4%, double-tap 67%, short hop 40%, 60 fps input, 0.89 s per menu target, 244 ms per word read (reads 14% of a screen).
**Keys.** arrows. **Patience.** menus 25 s, confused 10 s on one screen, rage-quits after 2 losses in a row.
**Plan.** journey, ffa, flow (x passes).

## What they did
- journey (seed 777793363): journey ffa:4c/20.6s 1v1:4c/12.1s teams:4c/12.1s boss:4c/12.1s ctf:4c/12.1s training:3c/8.6s tutorial:3c/14.1s worldcup:6c/21s flagcup:4c/15.3s; menus took them about 183 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 777793363 --arg persona=adult-casual-low-patience-03`
- journey (seed 199320797): journey ffa:4c/20.6s 1v1:4c/12.1s teams:4c/12.1s boss:4c/12.1s ctf:4c/12.1s training:3c/8.6s tutorial:3c/14.1s worldcup:6c/21.1s flagcup:4c/15.3s; menus took them about 183 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 199320797 --arg persona=adult-casual-low-patience-03`
- journey (seed 941672513): journey ffa:4c/20.6s 1v1:4c/12.1s teams:4c/12.1s boss:4c/12.1s ctf:4c/12.1s training:3c/8.6s tutorial:3c/14.1s worldcup:6c/21.1s flagcup:4c/15.3s; menus took them about 183 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 941672513 --arg persona=adult-casual-low-patience-03`
- flow (seed 862248195): flow; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 862248195 --arg persona=adult-casual-low-patience-03 --arg fighter=Rocky`
- flow (seed 859246558): flow; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 859246558 --arg persona=adult-casual-low-patience-03 --arg fighter=Ruler`
- ffa (seed 503644017): ended; 68 s of game on forest, dealt 117, took 401, TOP@141% by Bot, LEFT@175% by Paintbrush, LEFT@84% by Woody; menus took them about 26 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 503644017 --arg persona=adult-casual-low-patience-03 --arg fighter=Rose --arg stage=forest --arg kind=ffa`
- ffa (seed 222655058): ended; 40 s of game on needle, dealt 80, took 9, BOTTOM@9% by Profily; menus took them about 26 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 222655058 --arg persona=adult-casual-low-patience-03 --arg fighter=Teardrop --arg stage=needle --arg kind=ffa`
- ffa (seed 571745637): ended; 117 s of game on grandplains, dealt 280, took 51, no KOs; menus took them about 26 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 571745637 --arg persona=adult-casual-low-patience-03 --arg fighter=Puffball --arg stage=grandplains --arg kind=ffa`
- ffa (seed 821134853): ended; 141 s of game on yoyle, dealt 174, took 13, BOTTOM@13% fell, BOTTOM@0% fell; menus took them about 26 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 821134853 --arg persona=adult-casual-low-patience-03 --arg fighter=Nickel (II) --arg stage=yoyle --arg kind=ffa`
- journey (seed 46136952): journey ffa:4c/20.6s 1v1:4c/12.1s teams:4c/12.1s boss:4c/12.1s ctf:4c/12.1s training:3c/8.6s tutorial:3c/14.1s worldcup:6c/21.1s flagcup:4c/15.3s; menus took them about 183 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 46136952 --arg persona=adult-casual-low-patience-03`
- journey (seed 112950528): journey ffa:4c/20.6s 1v1:4c/12.1s teams:4c/12.1s boss:4c/12.1s ctf:4c/12.1s training:3c/8.6s tutorial:3c/14.1s worldcup:6c/21.3s flagcup:4c/15.4s; menus took them about 183 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 112950528 --arg persona=adult-casual-low-patience-03`
- ffa (seed 604214374): ended; 176 s of game on yoyle, dealt 699, took 130, BOTTOM@0% fell, BOTTOM@57% by Soap, TOP@73% by Soap; menus took them about 29 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 604214374 --arg persona=adult-casual-low-patience-03 --arg fighter=Apple --arg stage=yoyle --arg kind=ffa`
- flow (seed 788087964): flow; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 788087964 --arg persona=adult-casual-low-patience-03 --arg fighter=Pen`
- flow (seed 915855723): flow; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 915855723 --arg persona=adult-casual-low-patience-03 --arg fighter=Coiny`
- flow (seed 407696365): flow; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 407696365 --arg persona=adult-casual-low-patience-03 --arg fighter=TV`

## Where they got stuck or confused
- ffa: 7 presses slipped (a person's missed keys)
- ffa: would have quit in the menus: 26 s of clicking and reading (10 clicks, key remap not counted) before the first match; their patience is 25 s
- ffa: 2 presses slipped (a person's missed keys)
- ffa: 3 presses slipped (a person's missed keys)
- ffa: was knocked out 3 s into the match (BOTTOM at 0%)
- ffa: 13 presses slipped (a person's missed keys)
- ffa: would have quit in the menus: 29 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 25 s

## What went wrong (everything the playtester noted while they played)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 6 scenes)
- [UI] stray-banner: a match shows "KO'd by Ice Cube − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed) (in 2 scenes)
- [SLOW] jank-slow-click (JANK): a click on "Take the Plunge ▶" at screen "title" took 338 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 49 ms frame (median 0.6) in ffa; recent move: Firey|ember.finisher
- [UI] stray-banner: a match shows "KO'd by Paper − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 59 ms frame (median 0.3) in ffa; recent move: Bomby|bomb.jab
- [UI] stray-banner: a match shows "KO'd by Bomby − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.1) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ffa; recent move: Marshmallow|wallmart.jab
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.3) in ffa; recent move: Bomby|bomb.down
- [SLOW] jank-spike (JANK): a 90 ms frame (median 0.3) in ffa; recent move: Marshmallow|wallmart.up
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.3) in ffa; recent move: Bomby|bomb.up
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.3) in ffa; recent move: Bomby|bomb.da
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.2) in ffa; recent move: Bomby|bomb.dt
- [SLOW] jank-spike (JANK): a 54 ms frame (median 0.2) in ffa; recent move: Bomby|bomb.dthrow
- [SLOW] jank-spike (JANK): a 58 ms frame (median 0.2) in ffa; recent move: no recent move
- [UI] stray-banner: a match shows "KO'd by Cherries − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.2) in ffa; recent move: Ice Cube|shatter.jab
- [SLOW] jank-spike (JANK): a 49 ms frame (median 0.2) in ffa; recent move: TV|static.ua
- [SLOW] jank-spike (JANK): a 73 ms frame (median 0.2) in ffa; recent move: Ice Cube|shatter.dt
- [SLOW] jank-spike (JANK): a 53 ms frame (median 0.3) in ffa; recent move: Ice Cube|shatter.fa
- [SLOW] jank-spike (JANK): a 50 ms frame (median 0.2) in ffa; recent move: Ice Cube|shatter.special
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.2) in ffa; recent move: TV|static.up
- [SLOW] jank-spike (JANK): a 106 ms frame (median 0.2) in ffa; recent move: Ice Cube|shatter.up
- [SLOW] jank-spike (JANK): a 53 ms frame (median 0.2) in ffa; recent move: TV|static.ut
- [SLOW] jank-spike (JANK): a 76 ms frame (median 0.2) in ffa; recent move: TV|static.special
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.2) in ffa; recent move: TV|static.jab
- [FEEL] jank-teleport (JANK): TV moved 166 px in one frame (ffa; last move: TV|static.up)
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in ffa; recent move: TV|static.ba
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ffa; recent move: TV|static.dt
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.2) in ffa; recent move: Ice Cube|shatter.finisher
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.2) in ffa; recent move: Ice Cube|shatter.ua
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.2) in ffa; recent move: Ice Cube|shatter.down
- [SLOW] jank-spike (JANK): a 50 ms frame (median 0.2) in ffa; recent move: Ice Cube|shatter.grab
- [UI] stray-banner: a match shows "KO'd by Bot − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-audio-burst (JANK): 8 sound calls in one frame (ffa)
- [UI] stray-banner: a match shows "KO'd by Paintbrush − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.3) in ffa; recent move: Teardrop|kick.smash
- [SLOW] jank-spike (JANK): a 91 ms frame (median 0.2) in ffa; recent move: Teardrop|kick.da
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in ffa; recent move: Teardrop|kick.up

## When they would have quit
- ffa: would have quit in the menus: 26 s of clicking and reading (10 clicks, key remap not counted) before the first match; their patience is 25 s
- ffa: would have quit in the menus: 26 s of clicking and reading (10 clicks, key remap not counted) before the first match; their patience is 25 s
- ffa: would have quit in the menus: 26 s of clicking and reading (10 clicks, key remap not counted) before the first match; their patience is 25 s
- ffa: would have quit in the menus: 26 s of clicking and reading (10 clicks, key remap not counted) before the first match; their patience is 25 s
- ffa: would have quit in the menus: 29 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 25 s
