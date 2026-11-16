# lefty-remapper-01

**Profile.** lefty-remapper-01: adult (31), casual; goal: remap keys to IJKL / ASD for the left hand, then play; goes to Settings > Keys before anything else.
**Hands.** reaction 290 ms (SD 61), key timing jitter 2.35 frames, slipped presses 5%, double-tap 79%, short hop 40%, 60 fps input, 0.86 s per menu target, 231 ms per word read (reads 44% of a screen).
**Keys.** lefty. **Patience.** menus 91 s, confused 33 s on one screen, rage-quits after 5 losses in a row.
**Plan.** ffa, training, 1v1 (x passes).

## What they did
- ffa (seed 559028038): ended; 26 s of game on needle, dealt 172, took 74, BOTTOM@48% by Bomb; menus took them about 138 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 559028038 --arg persona=lefty-remapper-01 --arg fighter=Box --arg stage=needle --arg kind=ffa`
- 1v1 (seed 85302014): ended; 87 s of game on tlc, dealt 272, took 35, no KOs; menus took them about 138 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 85302014 --arg persona=lefty-remapper-01 --arg fighter=Loser --arg stage=tlc --arg kind=1v1`
- 1v1 (seed 222510074): ended; 88 s of game on dreamisle, dealt 277, took 132, BOTTOM@54% by Bot, BOTTOM@58% by Bot; menus took them about 140 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 222510074 --arg persona=lefty-remapper-01 --arg fighter=Soap --arg stage=dreamisle --arg kind=1v1`
- ffa (seed 702540588): ended; 83 s of game on goiky, dealt 445, took 92, BOTTOM@62% by Fanny, BOTTOM@0% fell, BOTTOM@28% fell; menus took them about 140 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 702540588 --arg persona=lefty-remapper-01 --arg fighter=Pencil --arg stage=goiky --arg kind=ffa`
- ffa (seed 974044864): ended; 137 s of game on yoyle, dealt 442, took 197, BOTTOM@97% by Tea Kettle, BOTTOM@99% by Tea Kettle; menus took them about 140 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 974044864 --arg persona=lefty-remapper-01 --arg fighter=Blocky --arg stage=yoyle --arg kind=ffa`
- training (seed 66143400): cap; menus took them about 178 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 66143400 --arg persona=lefty-remapper-01 --arg fighter=Money`
- training (seed 124780840): cap; menus took them about 178 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 124780840 --arg persona=lefty-remapper-01 --arg fighter=Profily`
- training (seed 675355507): cap; menus took them about 178 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 675355507 --arg persona=lefty-remapper-01 --arg fighter=Teardrop`
- training (seed 390401344): cap; menus took them about 178 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 390401344 --arg persona=lefty-remapper-01 --arg fighter=Salt`
- training (seed 284893878): cap; menus took them about 178 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 284893878 --arg persona=lefty-remapper-01 --arg fighter=Teardrop`
- 1v1 (seed 141389501): ended; 92 s of game on ice, dealt 340, took 72, no KOs; menus took them about 138 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 141389501 --arg persona=lefty-remapper-01 --arg fighter=Firey --arg stage=ice --arg kind=1v1`
- ffa (seed 483757889): cap; 180 s of game on goiky, dealt 77, took 34, BOTTOM@9% fell, BOTTOM@21% fell; menus took them about 138 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 483757889 --arg persona=lefty-remapper-01 --arg fighter=Bonesaw --arg stage=goiky --arg kind=ffa`
- 1v1 (seed 872580876): ended; 145 s of game on tlc, dealt 483, took 14, BOTTOM@0% fell, BOTTOM@11% by Cammy; menus took them about 138 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 872580876 --arg persona=lefty-remapper-01 --arg fighter=Lightning --arg stage=tlc --arg kind=1v1`
- 1v1 (seed 588254506): ended; 22 s of game on wind, dealt 83, took 76, BOTTOM@0% fell; menus took them about 140 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 588254506 --arg persona=lefty-remapper-01 --arg fighter=Gaty --arg stage=wind --arg kind=1v1`
- ffa (seed 514038441): cap; 180 s of game on fortress, dealt 591, took 337, TOP@163% by Lightbulb; menus took them about 140 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 514038441 --arg persona=lefty-remapper-01 --arg fighter=Bonesaw --arg stage=fortress --arg kind=ffa`

## Where they got stuck or confused
- BUG cant: Blocky: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Teardrop: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- STUCK match-never-ends: ffa match on goiky is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
- BUG cant: Lightning: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- ffa: remapped keys through Settings > Keys (7 rows, about 46 s of clicking)
- ffa: was knocked out 11 s into the match (BOTTOM at 48%)
- ffa: 4 presses slipped (a person's missed keys)
- ffa: would have quit in the menus: 92 s of clicking and reading (21 clicks, key remap not counted) before the first match; their patience is 91 s
- 1v1: remapped keys through Settings > Keys (7 rows, about 46 s of clicking)
- 1v1: 5 presses slipped (a person's missed keys)
- 1v1: would have quit in the menus: 92 s of clicking and reading (21 clicks, key remap not counted) before the first match; their patience is 91 s
- 1v1: 10 presses slipped (a person's missed keys)
- 1v1: would have quit in the menus: 94 s of clicking and reading (24 clicks, key remap not counted) before the first match; their patience is 91 s
- ffa: 8 presses slipped (a person's missed keys)
- ffa: would have quit in the menus: 94 s of clicking and reading (24 clicks, key remap not counted) before the first match; their patience is 91 s
- ffa: 7 presses slipped (a person's missed keys)
- training: remapped keys through Settings > Keys (7 rows, about 46 s of clicking)
- training: 6 presses slipped (a person's missed keys)
- training: would have quit in the menus: 132 s of clicking and reading (24 clicks, key remap not counted) before the first match; their patience is 91 s
- training: 10 presses slipped (a person's missed keys)
- training: 20 presses slipped (a person's missed keys)
- training: 7 presses slipped (a person's missed keys)
- training: 12 presses slipped (a person's missed keys)
- 1v1: 13 presses slipped (a person's missed keys)
- ffa: 3 presses slipped (a person's missed keys)
- 1v1: was knocked out 12 s into the match (BOTTOM at 0%)
- 1v1: 15 presses slipped (a person's missed keys)
- 1v1: was knocked out 5 s into the match (BOTTOM at 0%)
- 1v1: 1 presses slipped (a person's missed keys)
- ffa: 11 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [FEEL] long-match: ffa match on goiky was still going after 2 min of game time (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 3 scenes)
- [FEEL] jank-audio-burst (JANK): 8 sound calls in one frame (ffa) (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage yoyle) (in 2 scenes)
- [FEEL] jank-input-latency (JANK): Teardrop: atk took 7 frames (117 ms) from the key to the first change on the fighter (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage ice) (in 2 scenes)
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 9066 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 75 ms frame (median 0.6) in ffa; recent move: Box|packed.special
- [SLOW] jank-spike (JANK): a 96 ms frame (median 0.5) in ffa; recent move: Box|packed.jab
- [SLOW] jank-spike (JANK): a 48 ms frame (median 0.8) in ffa; recent move: Ice Cube|shatter.jab
- [SLOW] jank-spike (JANK): a 61 ms frame (median 0.6) in ffa; recent move: Box|packed.smash
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.7) in ffa; recent move: Taco (II)|lemon.jab
- [SLOW] jank-spike (JANK): a 107 ms frame (median 0.8) in ffa; recent move: Bomb|collide.smash
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.9) in ffa; recent move: Bomb|collide.dt
- [SLOW] jank-spike (JANK): a 60 ms frame (median 0.6) in ffa; recent move: Box|packed.down
- [SLOW] jank-spike (JANK): a 69 ms frame (median 0.8) in ffa; recent move: Box|packed.up
- [SLOW] jank-spike (JANK): a 50 ms frame (median 0.6) in ffa; recent move: Box|packed.usmash
- [UI] stray-banner: a match shows "KO'd by Bomb − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 80 ms frame (median 0.7) in ffa; recent move: Ice Cube|shatter.up
- [SLOW] jank-spike (JANK): a 60 ms frame (median 0.9) in ffa; recent move: Bomb|collide.special
- [SLOW] jank-spike (JANK): a 99 ms frame (median 0.9) in ffa; recent move: Ice Cube|shatter.dt
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.8) in ffa; recent move: Box|packed.fa
- [FEEL] jank-input-latency (JANK): Box: atk took 5 frames (84 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.9) in ffa; recent move: Box|packed.ut
- [SLOW] jank-spike (JANK): a 69 ms frame (median 0.8) in ffa; recent move: Box|packed.ba
- [SLOW] jank-spike (JANK): a 131 ms frame (median 0.6) in ffa; recent move: Bomb|collide.jab
- [SLOW] jank-spike (JANK): a 144 ms frame (median 0.7) in ffa; recent move: Taco (II)|lemon.dt
- [SLOW] jank-spike (JANK): a 71 ms frame (median 0.6) in ffa; recent move: Box|packed.dt
- [SLOW] jank-spike (JANK): a 79 ms frame (median 0.7) in ffa; recent move: Tennis Ball|serve.smash
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.5) in ffa; recent move: no recent move
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 7203 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ffa; recent move: Loser|cool.special
- [FEEL] jank-input-latency (JANK): Loser: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in ffa; recent move: Loser|cool.jab
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.2) in ffa; recent move: Loser|cool.da
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage tlc)
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 5373 ms before the next screen was ready
- [FEEL] jank-input-latency (JANK): Soap: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage dreamisle)
- [UI] stray-banner: a match shows "KO'd by Bot − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)

## When they would have quit
- ffa: would have quit in the menus: 92 s of clicking and reading (21 clicks, key remap not counted) before the first match; their patience is 91 s
- 1v1: would have quit in the menus: 92 s of clicking and reading (21 clicks, key remap not counted) before the first match; their patience is 91 s
- 1v1: would have quit in the menus: 94 s of clicking and reading (24 clicks, key remap not counted) before the first match; their patience is 91 s
- ffa: would have quit in the menus: 94 s of clicking and reading (24 clicks, key remap not counted) before the first match; their patience is 91 s
- ffa: would have quit in the menus: 94 s of clicking and reading (24 clicks, key remap not counted) before the first match; their patience is 91 s
- training: would have quit in the menus: 132 s of clicking and reading (24 clicks, key remap not counted) before the first match; their patience is 91 s
- training: would have quit in the menus: 132 s of clicking and reading (24 clicks, key remap not counted) before the first match; their patience is 91 s
- training: would have quit in the menus: 132 s of clicking and reading (24 clicks, key remap not counted) before the first match; their patience is 91 s
- training: would have quit in the menus: 132 s of clicking and reading (24 clicks, key remap not counted) before the first match; their patience is 91 s
- training: would have quit in the menus: 132 s of clicking and reading (24 clicks, key remap not counted) before the first match; their patience is 91 s
- 1v1: would have quit in the menus: 92 s of clicking and reading (21 clicks, key remap not counted) before the first match; their patience is 91 s
- ffa: would have quit in the menus: 92 s of clicking and reading (21 clicks, key remap not counted) before the first match; their patience is 91 s
- 1v1: would have quit in the menus: 92 s of clicking and reading (21 clicks, key remap not counted) before the first match; their patience is 91 s
- 1v1: would have quit in the menus: 94 s of clicking and reading (24 clicks, key remap not counted) before the first match; their patience is 91 s
- ffa: would have quit in the menus: 94 s of clicking and reading (24 clicks, key remap not counted) before the first match; their patience is 91 s
