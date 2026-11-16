# adult-competitive-02

**Profile.** adult-competitive-02: adult (27), competitive; goal: teams and 1v1 at a high level, test frame data; notices latency and dropped inputs; uses every tool.
**Hands.** reaction 224 ms (SD 32), key timing jitter 1.29 frames, slipped presses 2%, double-tap 95%, short hop 95%, 60 fps input, 0.58 s per menu target, 247 ms per word read (reads 38% of a screen).
**Keys.** arrows. **Patience.** menus 81 s, confused 19 s on one screen, rage-quits after 9 losses in a row.
**Plan.** 1v1, teams, training, flow (x passes).

## What they did
- 1v1 (seed 646987380): ended; 67 s of game on forest, dealt 70, took 654, MAX@344% by an assist/hazard, MAX@282% by an assist/hazard; menus took them about 55 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 646987380 --arg persona=adult-competitive-02 --arg fighter=Profily --arg stage=forest --arg kind=1v1`
- flow (seed 358057205): flow; menus took them about 52 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 358057205 --arg persona=adult-competitive-02 --arg fighter=Microphone`
- 1v1 (seed 474707573): ended; 89 s of game on goiky, dealt 241, took 234, RIGHT@168% by Lightbulb; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 474707573 --arg persona=adult-competitive-02 --arg fighter=Sidewalky --arg stage=goiky --arg kind=1v1`
- 1v1 (seed 659486546): ended; 105 s of game on pillars, dealt 322, took 182, RIGHT@132% by an assist/hazard; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 659486546 --arg persona=adult-competitive-02 --arg fighter=Pencil --arg stage=pillars --arg kind=1v1`
- flow (seed 774041133): flow; menus took them about 52 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 774041133 --arg persona=adult-competitive-02 --arg fighter=Sidewalky`
- training (seed 184667718): cap; menus took them about 89 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 184667718 --arg persona=adult-competitive-02 --arg fighter=Woody`
- training (seed 379818007): cap; menus took them about 89 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 379818007 --arg persona=adult-competitive-02 --arg fighter=Lollipop`
- teams (seed 87283014): ended; 169 s of game on canyon, dealt 543, took 108, RIGHT@92% by Money, LEFT@16% by Pickle; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 87283014 --arg persona=adult-competitive-02 --arg fighter=Microphone --arg stage=canyon --arg kind=teams`
- teams (seed 272674449): cap; 180 s of game on needle, dealt 164, took 219, LEFT@79% by Pencil; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 272674449 --arg persona=adult-competitive-02 --arg fighter=Remote --arg stage=needle --arg kind=teams`
- training (seed 931031423): cap; menus took them about 89 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 931031423 --arg persona=adult-competitive-02 --arg fighter=TV`
- training (seed 741877091): cap; menus took them about 89 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 741877091 --arg persona=adult-competitive-02 --arg fighter=Ruler`
- teams (seed 177588078): cap; 180 s of game on yoyle, dealt 102, took 111, TOP@87% by Tennis Ball; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 177588078 --arg persona=adult-competitive-02 --arg fighter=Lifering --arg stage=yoyle --arg kind=teams`
- flow (seed 423724048): flow; menus took them about 52 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 423724048 --arg persona=adult-competitive-02 --arg fighter=Barf Bag`
- teams (seed 158266780): cap; 180 s of game on goiky, dealt 422, took 162, no KOs; menus took them about 55 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 158266780 --arg persona=adult-competitive-02 --arg fighter=Tapey --arg stage=goiky --arg kind=teams`
- training (seed 893550339): cap; menus took them about 89 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 893550339 --arg persona=adult-competitive-02 --arg fighter=Taco`
- teams (seed 213828640): cap; 180 s of game on forest, dealt 262, took 846, MAX@308% by Fries, MAX@273% by Bot, MAX@265% by Sidewalky; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 213828640 --arg persona=adult-competitive-02 --arg fighter=Box --arg stage=forest --arg kind=teams`
- flow (seed 914866687): flow; menus took them about 52 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 914866687 --arg persona=adult-competitive-02 --arg fighter=Bracelety`
- 1v1 (seed 527859282): ended; 66 s of game on dreamisle, dealt 225, took 12, no KOs; menus took them about 55 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 527859282 --arg persona=adult-competitive-02 --arg fighter=Fries --arg stage=dreamisle --arg kind=1v1`
- 1v1 (seed 333465040): ended; 54 s of game on needle, dealt 139, took 81, BOTTOM@39% fell, BOTTOM@12% by Lollipop; menus took them about 53 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 333465040 --arg persona=adult-competitive-02 --arg fighter=Rocky --arg stage=needle --arg kind=1v1`
- flow (seed 718560738): flow; menus took them about 52 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 718560738 --arg persona=adult-competitive-02 --arg fighter=Puffball`

## Where they got stuck or confused
- BUG cant: Box: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- 1v1: 2 presses slipped (a person's missed keys)
- 1v1: 3 presses slipped (a person's missed keys)
- 1v1: 4 presses slipped (a person's missed keys)
- training: 2 presses slipped (a person's missed keys)
- training: would have quit in the menus: 89 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 81 s
- training: 4 presses slipped (a person's missed keys)
- teams: 7 presses slipped (a person's missed keys)
- teams: 10 presses slipped (a person's missed keys)
- training: 5 presses slipped (a person's missed keys)
- teams: 8 presses slipped (a person's missed keys)
- teams: 12 presses slipped (a person's missed keys)
- 1v1: 1 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 5 scenes)
- [FEEL] long-match: ffa match on goiky was still going after 2 min of game time (in 5 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage canyon) (in 5 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage goiky) (in 5 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage needle) (in 3 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage forest) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 146 ms frame (median 1.8) in ffa; recent move: Firey|ember.jab
- [UI] stray-banner: a match shows "KO'd by Firey − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ffa; recent move: Grassy|grasstree.jab
- [UI] stray-banner: a match shows "KO'd by Grassy − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.2) in ffa; recent move: Fern|photo.jab
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.4) in ffa; recent move: Grassy|grasstree.grab
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.3) in ffa; recent move: Grassy|grasstree.down
- [SLOW] jank-spike (JANK): a 58 ms frame (median 0.3) in ffa; recent move: Grassy|grasstree.ut
- [SLOW] jank-spike (JANK): a 51 ms frame (median 0.3) in ffa; recent move: Grassy|grasstree.ua
- [SLOW] jank-spike (JANK): a 85 ms frame (median 0.2) in ffa; recent move: Fern|photo.dt
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in ffa; recent move: Grassy|grasstree.up
- [SLOW] jank-spike (JANK): a 109 ms frame (median 0.3) in ffa; recent move: Fern|uppercut
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in ffa; recent move: Sidewalky|slam.special
- [SLOW] jank-spike (JANK): a 56 ms frame (median 0.1) in ffa; recent move: Sidewalky|slam.jab
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.2) in ffa; recent move: Sidewalky|slam.ua
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.2) in ffa; recent move: Sidewalky|slam.smash
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.4) in ffa; recent move: Lightbulb|eball.up
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.2) in ffa; recent move: Sidewalky|slam.fa
- [FEEL] jank-input-latency (JANK): Sidewalky: smash took 5 frames (84 ms) from the key to the first change on the fighter
- [UI] stray-banner: a match shows "KO'd by Lightbulb − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in ffa; recent move: Lightbulb|eball.smash
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.3) in ffa; recent move: Pencil|van.smash
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.3) in ffa; recent move: Pencil|van.special
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in ffa; recent move: Pencil|van.ba
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.4) in ffa; recent move: Pencil|van.jab
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in ffa; recent move: Lightbulb|eball.jab
- [SLOW] jank-spike (JANK): a 86 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-slow-click (JANK): a click on "Skip" at screen "tutorial" took 362 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.7) in ffa; recent move: Coiny|slap.jab
- [UI] stray-banner: a match shows "KO'd by Coiny − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 93 ms frame (median 0.4) in ffa; recent move: Nickel|flip.special

## When they would have quit
- training: would have quit in the menus: 89 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 81 s
- training: would have quit in the menus: 89 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 81 s
- training: would have quit in the menus: 89 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 81 s
- training: would have quit in the menus: 89 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 81 s
- training: would have quit in the menus: 89 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 81 s
