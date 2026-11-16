# adult-competitive-01

**Profile.** adult-competitive-01: adult (20), competitive; goal: teams and 1v1 at a high level, test frame data; notices latency and dropped inputs; uses every tool.
**Hands.** reaction 231 ms (SD 34), key timing jitter 1.23 frames, slipped presses 1%, double-tap 97%, short hop 90%, 60 fps input, 0.5 s per menu target, 237 ms per word read (reads 44% of a screen).
**Keys.** arrows. **Patience.** menus 56 s, confused 17 s on one screen, rage-quits after 11 losses in a row.
**Plan.** 1v1, teams, training, flow (x passes).

## What they did
- 1v1 (seed 210106572): ended; 82 s of game on ice, dealt 327, took 46, no KOs; menus took them about 57 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 210106572 --arg persona=adult-competitive-01 --arg fighter=Yellow Face --arg stage=ice --arg kind=1v1`
- 1v1 (seed 725621674): ended; 110 s of game on dreamisle, dealt 321, took 147, BOTTOM@61% by Golf Ball; menus took them about 57 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 725621674 --arg persona=adult-competitive-01 --arg fighter=Nickel --arg stage=dreamisle --arg kind=1v1`
- 1v1 (seed 829883682): ended; 130 s of game on dreamisle, dealt 402, took 44, no KOs; menus took them about 59 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 829883682 --arg persona=adult-competitive-01 --arg fighter=Basketball --arg stage=dreamisle --arg kind=1v1`
- flow (seed 167373279): flow; menus took them about 56 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 167373279 --arg persona=adult-competitive-01 --arg fighter=Lightning`
- flow (seed 816025463): flow; menus took them about 56 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 816025463 --arg persona=adult-competitive-01 --arg fighter=Tea Kettle`
- training (seed 732588867): cap; menus took them about 97 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 732588867 --arg persona=adult-competitive-01 --arg fighter=Firey Jr.`
- training (seed 728586019): cap; menus took them about 97 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 728586019 --arg persona=adult-competitive-01 --arg fighter=Yellow Face`
- teams (seed 247341156): cap; 180 s of game on canyon, dealt 494, took 225, TOP@195% by Nickel (II); menus took them about 57 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 247341156 --arg persona=adult-competitive-01 --arg fighter=Tree --arg stage=canyon --arg kind=teams`
- teams (seed 17312173): cap; 180 s of game on canyon, dealt 361, took 120, no KOs; menus took them about 57 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 17312173 --arg persona=adult-competitive-01 --arg fighter=Leafy --arg stage=canyon --arg kind=teams`
- training (seed 998438075): cap; menus took them about 97 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 998438075 --arg persona=adult-competitive-01 --arg fighter=Cake`
- training (seed 918861622): cap; menus took them about 97 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 918861622 --arg persona=adult-competitive-01 --arg fighter=Liy`
- teams (seed 488129440): cap; 180 s of game on grandplains, dealt 172, took 308, RIGHT@194% by Leafy; menus took them about 59 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 488129440 --arg persona=adult-competitive-01 --arg fighter=MeTag --arg stage=grandplains --arg kind=teams`
- teams (seed 779395486): cap; 180 s of game on needle, dealt 414, took 192, no KOs; menus took them about 57 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 779395486 --arg persona=adult-competitive-01 --arg fighter=Bomb --arg stage=needle --arg kind=teams`
- flow (seed 283181754): flow; menus took them about 56 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 283181754 --arg persona=adult-competitive-01 --arg fighter=Silver Spoon`
- 1v1 (seed 319476128): ended; 39 s of game on shift, dealt 174, took 24, no KOs; menus took them about 59 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 319476128 --arg persona=adult-competitive-01 --arg fighter=Yellow Face --arg stage=shift --arg kind=1v1`
- teams (seed 601507442): cap; 180 s of game on pillars, dealt 247, took 106, no KOs; menus took them about 57 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 601507442 --arg persona=adult-competitive-01 --arg fighter=Ruler --arg stage=pillars --arg kind=teams`
- flow (seed 821153295): flow; menus took them about 56 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 821153295 --arg persona=adult-competitive-01 --arg fighter=Book`
- training (seed 470511561): cap; menus took them about 97 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 470511561 --arg persona=adult-competitive-01 --arg fighter=Tissues`
- 1v1 (seed 250713902): cap; 180 s of game on bigincin, dealt 272, took 301, TOP@171% by Teardrop; menus took them about 57 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 250713902 --arg persona=adult-competitive-01 --arg fighter=Lollipop --arg stage=bigincin --arg kind=1v1`
- flow (seed 275709908): flow; menus took them about 56 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 275709908 --arg persona=adult-competitive-01 --arg fighter=Teardrop`

## Where they got stuck or confused
- BUG cant: Nickel: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Yellow Face: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- STUCK match-never-ends: teams match on canyon is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
- BUG cant: Cake: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Bomb: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Ruler: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Ruler: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- 1v1: 6 presses slipped (a person's missed keys)
- 1v1: would have quit in the menus: 57 s of clicking and reading (10 clicks, key remap not counted) before the first match; their patience is 56 s
- 1v1: 4 presses slipped (a person's missed keys)
- 1v1: would have quit in the menus: 59 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 56 s
- flow: would have quit in the menus: 56 s of clicking and reading (8 clicks, key remap not counted) before the first match; their patience is 56 s
- training: 1 presses slipped (a person's missed keys)
- training: would have quit in the menus: 97 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 56 s
- training: 5 presses slipped (a person's missed keys)
- teams: 4 presses slipped (a person's missed keys)
- teams: would have quit in the menus: 57 s of clicking and reading (10 clicks, key remap not counted) before the first match; their patience is 56 s
- teams: 5 presses slipped (a person's missed keys)
- training: 2 presses slipped (a person's missed keys)
- training: was knocked out 13 s into the match (RIGHT at 48%)
- teams: 9 presses slipped (a person's missed keys)
- teams: would have quit in the menus: 59 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 56 s
- teams: 6 presses slipped (a person's missed keys)
- training: 3 presses slipped (a person's missed keys)
- 1v1: 8 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage canyon) (in 6 scenes)
- [FEEL] long-match: ffa match on goiky was still going after 2 min of game time (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage pillars) (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams (in 3 scenes)
- [FEEL] jank-input-latency (JANK): Yellow Face: smash took 4 frames (67 ms) from the key to the first change on the fighter (in 2 scenes)
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in ffa; recent move: Yellow Face|buynow.up (in 2 scenes)
- [UI] stray-banner: a match shows "KO'd by Fan − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed) (in 2 scenes)
- [FEEL] jank-input-latency (JANK): Yellow Face: jump took 5 frames (84 ms) from the key to the first change on the fighter
- [FEEL] jank-input-latency (JANK): Yellow Face: atk took 4 frames (67 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.2) in ffa; recent move: no recent move
- [BUG] cant: Nickel: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- [FEEL] jank-input-latency (JANK): Nickel: smash took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 79 ms frame (median 0.2) in ffa; recent move: Nickel|flip.smash
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.2) in ffa; recent move: Golf Ball|zapshooter.jab
- [SLOW] jank-spike (JANK): a 60 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 67 ms frame (median 0.3) in ffa; recent move: Nickel|flip.special
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ffa; recent move: Golf Ball|zapshooter.ut
- [SLOW] jank-spike (JANK): a 165 ms frame (median 0.3) in ffa; recent move: Nickel|flip.grab
- [FEEL] jank-input-latency (JANK): Nickel: atk took 4 frames (67 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 126 ms frame (median 1.1) in ffa; recent move: Nickel|flip.ua
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.2) in ffa; recent move: Golf Ball|zapshooter.special
- [SLOW] jank-spike (JANK): a 85 ms frame (median 0.2) in ffa; recent move: Golf Ball|zapshooter.grab
- [SLOW] jank-spike (JANK): a 53 ms frame (median 0.2) in ffa; recent move: Nickel|flip.finisher
- [FEEL] jank-hitstop-drift (JANK): Nickel moved 9 px in one frame while in hitstop (ffa; last move: Nickel|flip.finisher)
- [SLOW] jank-spike (JANK): a 104 ms frame (median 0.3) in ffa; recent move: Nickel|flip.na
- [FEEL] jank-teleport (JANK): Nickel moved 183 px in one frame (ffa; last move: Nickel|flip.up)
- [SLOW] jank-spike (JANK): a 62 ms frame (median 0.2) in ffa; recent move: Nickel|flip.jab
- [SLOW] jank-spike (JANK): a 59 ms frame (median 0.3) in ffa; recent move: Nickel|flip.da
- [SLOW] jank-spike (JANK): a 48 ms frame (median 0.2) in ffa; recent move: Golf Ball|fsburst
- [SLOW] jank-spike (JANK): a 62 ms frame (median 0.2) in ffa; recent move: Golf Ball|zapshooter.up
- [SLOW] jank-spike (JANK): a 56 ms frame (median 0.2) in ffa; recent move: Nickel|flip.up
- [SLOW] jank-spike (JANK): a 94 ms frame (median 0.3) in ffa; recent move: Nickel|flip.ba
- [SLOW] jank-spike (JANK): a 88 ms frame (median 0.2) in ffa; recent move: Golf Ball|zapshooter.finisher
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.3) in ffa; recent move: Basketball|dribble.special
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage dreamisle)
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.2) in ffa; recent move: Basketball|dribble.smash
- [FEEL] jank-input-latency (JANK): Basketball: atk took 4 frames (67 ms) from the key to the first change on the fighter
- [UI] stray-banner: a match shows "KO'd by Rose − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 112 ms frame (median 0.5) in ffa; recent move: Puffball|fly.jab

## When they would have quit
- 1v1: would have quit in the menus: 57 s of clicking and reading (10 clicks, key remap not counted) before the first match; their patience is 56 s
- 1v1: would have quit in the menus: 57 s of clicking and reading (10 clicks, key remap not counted) before the first match; their patience is 56 s
- 1v1: would have quit in the menus: 59 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 56 s
- flow: would have quit in the menus: 56 s of clicking and reading (8 clicks, key remap not counted) before the first match; their patience is 56 s
- flow: would have quit in the menus: 56 s of clicking and reading (8 clicks, key remap not counted) before the first match; their patience is 56 s
- training: would have quit in the menus: 97 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 56 s
- training: would have quit in the menus: 97 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 56 s
- teams: would have quit in the menus: 57 s of clicking and reading (10 clicks, key remap not counted) before the first match; their patience is 56 s
- teams: would have quit in the menus: 57 s of clicking and reading (10 clicks, key remap not counted) before the first match; their patience is 56 s
- training: would have quit in the menus: 97 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 56 s
- training: would have quit in the menus: 97 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 56 s
- teams: would have quit in the menus: 59 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 56 s
- teams: would have quit in the menus: 57 s of clicking and reading (10 clicks, key remap not counted) before the first match; their patience is 56 s
- flow: would have quit in the menus: 56 s of clicking and reading (8 clicks, key remap not counted) before the first match; their patience is 56 s
- 1v1: would have quit in the menus: 59 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 56 s
- teams: would have quit in the menus: 57 s of clicking and reading (10 clicks, key remap not counted) before the first match; their patience is 56 s
- flow: would have quit in the menus: 56 s of clicking and reading (8 clicks, key remap not counted) before the first match; their patience is 56 s
- training: would have quit in the menus: 97 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 56 s
- 1v1: would have quit in the menus: 57 s of clicking and reading (10 clicks, key remap not counted) before the first match; their patience is 56 s
- flow: would have quit in the menus: 56 s of clicking and reading (8 clicks, key remap not counted) before the first match; their patience is 56 s
