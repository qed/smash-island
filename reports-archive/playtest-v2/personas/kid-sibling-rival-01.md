# kid-sibling-rival-01

**Profile.** kid-sibling-rival-01: kid (11), casual; goal: beat Boss Rush; wants to beat the bosses to brag; retries immediately after a loss.
**Hands.** reaction 338 ms (SD 61), key timing jitter 2.96 frames, slipped presses 8%, double-tap 62%, short hop 36%, 60 fps input, 1.7 s per menu target, 459 ms per word read (reads 17% of a screen).
**Keys.** arrows. **Patience.** menus 84 s, confused 44 s on one screen, rage-quits after 6 losses in a row.
**Plan.** boss, boss, ffa (x passes).

## What they did
- ffa (seed 531964055): ended; 91 s of game on tlc, dealt 808, took 139, no KOs; menus took them about 56 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 531964055 --arg persona=kid-sibling-rival-01 --arg fighter=Money --arg stage=tlc --arg kind=ffa`
- boss (seed 471056767): cap; 180 s of game on goiky, dealt 503, took 117, RIGHT@37% by a boss, TOP@85% by a boss, TOP@76% by a boss, boss MePhone4; menus took them about 53 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 471056767 --arg persona=kid-sibling-rival-01 --arg fighter=Puffball --arg boss=5`
- boss (seed 304918430): cap; 180 s of game on goiky, dealt 436, took 183, LEFT@100% by a boss, boss Two; menus took them about 53 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 304918430 --arg persona=kid-sibling-rival-01 --arg fighter=Nickel --arg boss=9`
- ffa (seed 60409814): cap; 180 s of game on canyon, dealt 140, took 41, BOTTOM@0% fell, BOTTOM@41% fell; menus took them about 56 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 60409814 --arg persona=kid-sibling-rival-01 --arg fighter=Pencil --arg stage=canyon --arg kind=ffa`
- boss (seed 528713369): ended; 166 s of game on goiky, dealt 285, took 237, LEFT@130% by a boss, RIGHT@44% by a boss, TOP@104% by a boss, boss Puffball Speaker Box; menus took them about 53 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 528713369 --arg persona=kid-sibling-rival-01 --arg fighter=Paper --arg boss=1`
- boss (seed 219146958): ended; 56 s of game on goiky, dealt 175, took 0, TOP@88% by ?, TOP@84% by ?, TOP@88% by ?, boss Evil Leafy; menus took them about 53 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 219146958 --arg persona=kid-sibling-rival-01 --arg fighter=Ice Cube --arg boss=6`
- boss (seed 799038139): cap; 180 s of game on goiky, dealt 196, took 145, LEFT@44% by a boss, LEFT@36% by a boss, RIGHT@140% by a boss, boss MePhone4; menus took them about 53 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 799038139 --arg persona=kid-sibling-rival-01 --arg fighter=Teddy Bear --arg boss=5`
- boss (seed 758041360): cap; 180 s of game on goiky, dealt 620, took 125, LEFT@70% by a boss, LEFT@125% by a boss, RIGHT@68% by a boss, boss Springy; menus took them about 53 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 758041360 --arg persona=kid-sibling-rival-01 --arg fighter=Tennis Ball --arg boss=10`
- boss (seed 356448812): ended; 117 s of game on goiky, dealt 302, took 228, RIGHT@76% by a boss, LEFT@88% fell, TOP@89% by a boss, boss Puffball Speaker Box; menus took them about 53 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 356448812 --arg persona=kid-sibling-rival-01 --arg fighter=Pickle --arg boss=1`
- ffa (seed 776513387): ended; 117 s of game on tlc, dealt 383, took 76, BOTTOM@22% by Microphone, BOTTOM@12% by Microphone; menus took them about 56 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 776513387 --arg persona=kid-sibling-rival-01 --arg fighter=Dough --arg stage=tlc --arg kind=ffa`
- boss (seed 755504344): ended; 129 s of game on goiky, dealt 547, took 145, LEFT@81% by a boss, TOP@88% by a boss, RIGHT@115% by a boss, boss Firey Speaker Box; menus took them about 53 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 755504344 --arg persona=kid-sibling-rival-01 --arg fighter=David --arg boss=2`
- boss (seed 50947941): cap; 180 s of game on goiky, dealt 276, took 0, LEFT@45% by ?, TOP@129% by ?, boss Evil Leafy; menus took them about 53 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 50947941 --arg persona=kid-sibling-rival-01 --arg fighter=Remote --arg boss=6`
- boss (seed 720333267): ended; 59 s of game on goiky, dealt 300, took 131, RIGHT@70% by a boss, RIGHT@65% by a boss, RIGHT@108% by a boss, boss Firey Speaker Box; menus took them about 53 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 720333267 --arg persona=kid-sibling-rival-01 --arg fighter=Puffball --arg boss=2`
- ffa (seed 56549400): cap; 180 s of game on skytower, dealt 208, took 14, BOTTOM@0% fell, BOTTOM@12% fell; menus took them about 61 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 56549400 --arg persona=kid-sibling-rival-01 --arg fighter=Barf Bag --arg stage=skytower --arg kind=ffa`
- ffa (seed 534481319): ended; 167 s of game on ice, dealt 783, took 310, BOTTOM@0% fell, LEFT@163% by Tea Kettle, RIGHT@147% by Cheesy; menus took them about 56 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 534481319 --arg persona=kid-sibling-rival-01 --arg fighter=Dough --arg stage=ice --arg kind=ffa`

## Where they got stuck or confused
- STUCK match-never-ends: ffa match on canyon is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
- ffa: 8 presses slipped (a person's missed keys)
- boss: 6 presses slipped (a person's missed keys)
- boss: 16 presses slipped (a person's missed keys)
- ffa: was knocked out 9 s into the match (BOTTOM at 0%)
- ffa: 6 presses slipped (a person's missed keys)
- boss: 7 presses slipped (a person's missed keys)
- boss: was knocked out 14 s into the match (TOP at 88%)
- boss: 1 presses slipped (a person's missed keys)
- boss: was knocked out 15 s into the match (LEFT at 44%)
- boss: 10 presses slipped (a person's missed keys)
- boss: 13 presses slipped (a person's missed keys)
- ffa: 15 presses slipped (a person's missed keys)
- boss: was knocked out 12 s into the match (LEFT at 45%)
- boss: 5 presses slipped (a person's missed keys)
- boss: 2 presses slipped (a person's missed keys)
- ffa: 13 presses slipped (a person's missed keys)
- ffa: was knocked out 1 s into the match (BOTTOM at 0%)
- ffa: 21 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (boss, stage goiky) (in 6 scenes)
- [FEEL] long-match: boss match on goiky was still going after 3 min of game time (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in boss (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage tlc) (in 3 scenes)
- [FEEL] jank-audio-burst (JANK): 8 sound calls in one frame (boss) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage ice) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 133 ms frame (median 1.0) in ffa; recent move: Money|payday.smash
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.6) in ffa; recent move: Money|payday.jab
- [SLOW] jank-spike (JANK): a 60 ms frame (median 0.6) in ffa; recent move: Puffball|fly.up
- [FEEL] jank-teleport (JANK): Toothpaste moved 157 px in one frame (ffa; last move: Toothpaste|paste.up)
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.3) in ffa; recent move: Money|payday.special
- [SLOW] jank-spike (JANK): a 114 ms frame (median 1.3) in ffa; recent move: Money|payday.da
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.7) in ffa; recent move: Money|payday.ut
- [SLOW] jank-spike (JANK): a 47 ms frame (median 1.1) in ffa; recent move: Money|payday.finisher
- [FEEL] jank-input-latency (JANK): Money: atk took 4 frames (67 ms) from the key to the first change on the fighter
- [FEEL] jank-teleport (JANK): Dora moved 253 px in one frame (ffa; last move: Dora|fsgather)
- [FEEL] jank-teleport (JANK): Dora moved 475 px in one frame (ffa; last move: Dora|punch)
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.3) in ffa; recent move: Money|payday.na
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.5) in ffa; recent move: Money|payday.ua
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in boss; recent move: Magnet|bestie.ut
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.2) in boss; recent move: Puffball|fly.jab
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.1) in boss; recent move: Magnet|bestie.ua
- [FEEL] jank-teleport (JANK): Lightning moved 177 px in one frame (boss; last move: Lightning|zap.up)
- [SLOW] jank-spike (JANK): a 48 ms frame (median 0.5) in boss; recent move: Nickel|flip.special
- [SLOW] jank-spike (JANK): a 58 ms frame (median 0.2) in boss; recent move: Nickel|flip.jab
- [FEEL] jank-teleport (JANK): Nickel moved 153 px in one frame (boss; last move: Nickel|flip.up)
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in boss; recent move: Nickel|flip.fa
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.2) in boss; recent move: Nickel|flip.na
- [FEEL] jank-input-latency (JANK): Nickel: special took 4 frames (67 ms) from the key to the first change on the fighter
- [FEEL] jank-hitstop-drift (JANK): Nickel moved 79 px in one frame while in hitstop (boss; last move: Nickel|flip.finisher)
- [SLOW] jank-spike (JANK): a 50 ms frame (median 0.1) in boss; recent move: no recent move
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.3) in boss; recent move: Nickel|flip.finisher
- [FEEL] jank-hitstop-drift (JANK): Nickel moved 8 px in one frame while in hitstop (boss; last move: Nickel|flip.na)
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.3) in boss; recent move: Lightning|zap.up
- [SLOW] jank-spike (JANK): a 54 ms frame (median 0.4) in boss; recent move: Nickel|flip.smash
- [SLOW] jank-spike (JANK): a 107 ms frame (median 0.3) in boss; recent move: Nickel|flip.da
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in boss; recent move: Nickel|flip.ba
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.3) in boss; recent move: Nickel|flip.grab
- [SLOW] jank-spike (JANK): a 48 ms frame (median 0.2) in boss; recent move: Lightning|zap.jab
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ffa; recent move: no recent move

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
