# adult-competitive-04

**Profile.** adult-competitive-04: adult (27), competitive; goal: teams and 1v1 at a high level, test frame data; notices latency and dropped inputs; uses every tool.
**Hands.** reaction 221 ms (SD 23), key timing jitter 1.17 frames, slipped presses 1%, double-tap 93%, short hop 92%, 60 fps input, 0.67 s per menu target, 237 ms per word read (reads 40% of a screen).
**Keys.** arrows. **Patience.** menus 79 s, confused 18 s on one screen, rage-quits after 9 losses in a row.
**Plan.** 1v1, teams, training, flow (x passes).

## What they did
- 1v1 (seed 82362480): ended; 64 s of game on pillars, dealt 338, took 31, no KOs; menus took them about 54 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 82362480 --arg persona=adult-competitive-04 --arg fighter=Saw --arg stage=pillars --arg kind=1v1`
- flow (seed 29475513): flow; menus took them about 53 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 29475513 --arg persona=adult-competitive-04 --arg fighter=Profily`
- 1v1 (seed 178387481): ended; 95 s of game on wind, dealt 180, took 42, BOTTOM@42% by Marker; menus took them about 56 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 178387481 --arg persona=adult-competitive-04 --arg fighter=Roboty --arg stage=wind --arg kind=1v1`
- flow (seed 338861478): flow; menus took them about 53 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 338861478 --arg persona=adult-competitive-04 --arg fighter=Silver Spoon`
- 1v1 (seed 838195560): cap; 180 s of game on fortress, dealt 262, took 226, TOP@190% by Candle; menus took them about 56 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 838195560 --arg persona=adult-competitive-04 --arg fighter=Loser --arg stage=fortress --arg kind=1v1`
- training (seed 416084540): cap; menus took them about 91 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 416084540 --arg persona=adult-competitive-04 --arg fighter=Saw`
- training (seed 485132061): cap; menus took them about 91 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 485132061 --arg persona=adult-competitive-04 --arg fighter=Bonesaw`
- teams (seed 969824341): cap; 180 s of game on pillars, dealt 252, took 127, BOTTOM@53% by Balloony; menus took them about 56 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 969824341 --arg persona=adult-competitive-04 --arg fighter=Yin-Yang --arg stage=pillars --arg kind=teams`
- teams (seed 859776407): cap; 180 s of game on fortress, dealt 569, took 110, no KOs; menus took them about 56 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 859776407 --arg persona=adult-competitive-04 --arg fighter=Pencil --arg stage=fortress --arg kind=teams`
- teams (seed 387185974): cap; 180 s of game on fortress, dealt 277, took 175, BOTTOM@140% fell; menus took them about 54 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 387185974 --arg persona=adult-competitive-04 --arg fighter=Tissues --arg stage=fortress --arg kind=teams`
- training (seed 417322451): cap; menus took them about 91 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 417322451 --arg persona=adult-competitive-04 --arg fighter=Apple`
- teams (seed 321463854): cap; 180 s of game on canyon, dealt 350, took 70, no KOs; menus took them about 56 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 321463854 --arg persona=adult-competitive-04 --arg fighter=Ice Cube --arg stage=canyon --arg kind=teams`
- training (seed 986786165): cap; menus took them about 91 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 986786165 --arg persona=adult-competitive-04 --arg fighter=Snowball`
- teams (seed 464113275): cap; 180 s of game on needle, dealt 459, took 272, RIGHT@195% by Firey Jr.; menus took them about 54 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 464113275 --arg persona=adult-competitive-04 --arg fighter=Knife --arg stage=needle --arg kind=teams`
- training (seed 586741427): cap; menus took them about 91 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 586741427 --arg persona=adult-competitive-04 --arg fighter=Blocky`
- flow (seed 932300861): flow; menus took them about 53 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 932300861 --arg persona=adult-competitive-04 --arg fighter=David`
- 1v1 (seed 466124790): ended; 47 s of game on dreamisle, dealt 161, took 99, LEFT@36% by Teardrop; menus took them about 54 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 466124790 --arg persona=adult-competitive-04 --arg fighter=Tea Kettle --arg stage=dreamisle --arg kind=1v1`
- flow (seed 242983219): flow; menus took them about 53 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 242983219 --arg persona=adult-competitive-04 --arg fighter=MeTag`
- 1v1 (seed 439512708): ended; 63 s of game on shift, dealt 287, took 131, no KOs; menus took them about 56 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 439512708 --arg persona=adult-competitive-04 --arg fighter=Jack --arg stage=shift --arg kind=1v1`
- flow (seed 254757686): flow; menus took them about 53 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene flow --seed 254757686 --arg persona=adult-competitive-04 --arg fighter=Apple`

## Where they got stuck or confused
- BUG cant: Roboty: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Roboty: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Bonesaw: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Pencil: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Ice Cube: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- 1v1: 1 presses slipped (a person's missed keys)
- training: 2 presses slipped (a person's missed keys)
- training: would have quit in the menus: 91 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 79 s
- training: 1 presses slipped (a person's missed keys)
- teams: 2 presses slipped (a person's missed keys)
- teams: 5 presses slipped (a person's missed keys)
- teams: 4 presses slipped (a person's missed keys)
- teams: 3 presses slipped (a person's missed keys)
- 1v1: was knocked out 3 s into the match (LEFT at 36%)

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage fortress) (in 6 scenes)
- [FEEL] long-match: ffa match on goiky was still going after 2 min of game time (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage pillars) (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage needle) (in 3 scenes)
- [UI] stray-banner: a match shows "KO'd by Teardrop − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage wind) (in 2 scenes)
- [FEEL] jank-audio-burst (JANK): 8 sound calls in one frame (ffa) (in 2 scenes)
- [FEEL] long-match: teams match on fortress was still going after 3 min of game time (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage canyon) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage pillars)
- [FEEL] jank-input-latency (JANK): Saw: smash took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.2) in ffa; recent move: no recent move
- [FEEL] jank-input-latency (JANK): Saw: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [UI] stray-banner: a match shows "KO'd by Puffball − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.3) in ffa; recent move: no recent move
- [FEEL] jank-teleport (JANK): Jack moved 159 px in one frame (ffa; last move: no move)
- [FEEL] jank-hitstop-drift (JANK): Jack moved 159 px in one frame while in hitstop (ffa; last move: no move)
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.3) in ffa; recent move: Puffball|fly.up
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in ffa; recent move: Jack|jack.special
- [SLOW] jank-slow-click (JANK): a click on "Skip" at screen "tutorial" took 410 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "◂ Only the fighters I have u" at screen "select" took 376 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.4) in ffa; recent move: Roboty|antenna.smash
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.3) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.4) in ffa; recent move: Roboty|antenna.jab
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.3) in ffa; recent move: Roboty|antenna.up
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.5) in ffa; recent move: Roboty|antenna.ba
- [SLOW] jank-spike (JANK): a 152 ms frame (median 0.2) in ffa; recent move: Roboty|antenna.na
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ffa; recent move: Roboty|antenna.special
- [BUG] cant: Roboty: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.3) in ffa; recent move: Roboty|antenna.down
- [SLOW] jank-spike (JANK): a 161 ms frame (median 0.3) in ffa; recent move: Marker|ink.up
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.3) in ffa; recent move: Roboty|antenna.grab
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.4) in ffa; recent move: Roboty|antenna.finisher
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.4) in ffa; recent move: Roboty|antenna.ua
- [BUG] cant: Roboty: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- [UI] stray-banner: a match shows "KO'd by Marker − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [UI] stray-banner: a match shows "KO'd by Money − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [UI] stray-banner: a match shows "KO'd by Match − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)

## When they would have quit
- training: would have quit in the menus: 91 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 79 s
- training: would have quit in the menus: 91 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 79 s
- training: would have quit in the menus: 91 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 79 s
- training: would have quit in the menus: 91 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 79 s
- training: would have quit in the menus: 91 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 79 s
