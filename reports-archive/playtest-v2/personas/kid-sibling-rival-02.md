# kid-sibling-rival-02

**Profile.** kid-sibling-rival-02: kid (10), casual; goal: beat Boss Rush; wants to beat the bosses to brag; retries immediately after a loss.
**Hands.** reaction 338 ms (SD 66), key timing jitter 2.87 frames, slipped presses 10%, double-tap 67%, short hop 53%, 60 fps input, 1.58 s per menu target, 394 ms per word read (reads 13% of a screen).
**Keys.** arrows. **Patience.** menus 103 s, confused 42 s on one screen, rage-quits after 5 losses in a row.
**Plan.** boss, boss, ffa (x passes).

## What they did
- boss (seed 135405396): ended; 63 s of game on goiky, dealt 381, took 120, LEFT@91% by a boss, RIGHT@7% by a boss, LEFT@54% by a boss, boss MePhone4S; menus took them about 38 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 135405396 --arg persona=kid-sibling-rival-02 --arg fighter=Test Tube --arg boss=7`
- ffa (seed 393880600): ended; 21 s of game on needle, dealt 77, took 44, BOTTOM@14% by Bracelety, BOTTOM@30% by Ice Cube; menus took them about 46 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 393880600 --arg persona=kid-sibling-rival-02 --arg fighter=Blueberry --arg stage=needle --arg kind=ffa`
- ffa (seed 553215902): ended; 67 s of game on ice, dealt 451, took 98, BOTTOM@0% fell; menus took them about 41 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 553215902 --arg persona=kid-sibling-rival-02 --arg fighter=Fries --arg stage=ice --arg kind=ffa`
- boss (seed 9249585): until; 102 s of game on goiky, dealt 623, took 67, LEFT@82% by a boss, boss The Bug Swarm; menus took them about 38 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 9249585 --arg persona=kid-sibling-rival-02 --arg fighter=Pin --arg boss=3`
- boss (seed 437740700): running; 112 s of game on goiky, dealt 425, took 154, RIGHT@97% by a boss, TOP@123% by a boss, boss Four; menus took them about 38 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 437740700 --arg persona=kid-sibling-rival-02 --arg fighter=Magnet --arg boss=11`
- boss (seed 254361570): ended; 180 s of game on goiky, dealt 345, took 115, RIGHT@74% by a boss, RIGHT@44% by a boss, RIGHT@23% by a boss, boss Purple Dragon; menus took them about 38 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 254361570 --arg persona=kid-sibling-rival-02 --arg fighter=Clover --arg boss=8`
- boss (seed 340977414): cap; 180 s of game on goiky, dealt 554, took 204, LEFT@31% by a boss, LEFT@122% by a boss, boss MePhone4S; menus took them about 38 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 340977414 --arg persona=kid-sibling-rival-02 --arg fighter=Firey --arg boss=7`
- boss (seed 245847577): ended; 88 s of game on goiky, dealt 560, took 237, RIGHT@35% by a boss, RIGHT@87% by a boss, RIGHT@102% by a boss, boss The Bug Swarm; menus took them about 38 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 245847577 --arg persona=kid-sibling-rival-02 --arg fighter=Knife --arg boss=3`
- boss (seed 261729606): until; 110 s of game on goiky, dealt 484, took 174, RIGHT@40% by a boss, boss Announcer; menus took them about 38 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 261729606 --arg persona=kid-sibling-rival-02 --arg fighter=Pin --arg boss=0`
- boss (seed 90765638): ended; 166 s of game on goiky, dealt 557, took 162, LEFT@82% by a boss, RIGHT@126% by a boss, TOP@102% by a boss, boss Purple Face; menus took them about 38 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 90765638 --arg persona=kid-sibling-rival-02 --arg fighter=Loser --arg boss=4`
- boss (seed 89067605): ended; 175 s of game on goiky, dealt 447, took 111, RIGHT@73% by a boss, RIGHT@100% by a boss, RIGHT@60% by a boss, boss Purple Dragon; menus took them about 38 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 89067605 --arg persona=kid-sibling-rival-02 --arg fighter=Pin --arg boss=8`
- boss (seed 347324146): ended; 178 s of game on goiky, dealt 559, took 175, RIGHT@79% by ?, LEFT@92% by a boss, RIGHT@146% by a boss, boss Purple Face; menus took them about 38 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 347324146 --arg persona=kid-sibling-rival-02 --arg fighter=Bracelety --arg boss=4`
- ffa (seed 443180708): cap; 180 s of game on grandplains, dealt 652, took 3, LEFT@3% fell; menus took them about 46 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 443180708 --arg persona=kid-sibling-rival-02 --arg fighter=Liy --arg stage=grandplains --arg kind=ffa`
- ffa (seed 909299503): ended; 64 s of game on ice, dealt 282, took 146, BOTTOM@0% fell, TOP@146% by an assist/hazard; menus took them about 46 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 909299503 --arg persona=kid-sibling-rival-02 --arg fighter=Cammy --arg stage=ice --arg kind=ffa`
- ffa (seed 370512947): ended; 129 s of game on fortress, dealt 828, took 81, no KOs; menus took them about 41 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 370512947 --arg persona=kid-sibling-rival-02 --arg fighter=David --arg stage=fortress --arg kind=ffa`

## Where they got stuck or confused
- boss: 8 presses slipped (a person's missed keys)
- ffa: was knocked out 4 s into the match (BOTTOM at 14%)
- ffa: 6 presses slipped (a person's missed keys)
- ffa: was knocked out 1 s into the match (BOTTOM at 0%)
- ffa: 7 presses slipped (a person's missed keys)
- boss: 13 presses slipped (a person's missed keys)
- boss: 14 presses slipped (a person's missed keys)
- boss: 12 presses slipped (a person's missed keys)
- boss: 16 presses slipped (a person's missed keys)
- boss: 9 presses slipped (a person's missed keys)
- boss: 6 presses slipped (a person's missed keys)
- boss: 11 presses slipped (a person's missed keys)
- ffa: 25 presses slipped (a person's missed keys)
- ffa: 9 presses slipped (a person's missed keys)
- ffa: 16 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (boss, stage goiky) (in 9 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in boss (in 5 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage ice) (in 4 scenes)
- [FEEL] jank-audio-burst (JANK): 8 sound calls in one frame (boss) (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage fortress) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.1) in boss; recent move: no recent move
- [SLOW] jank-spike (JANK): a 99 ms frame (median 0.1) in boss; recent move: Test Tube|testtube.fa
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.1) in boss; recent move: Test Tube|testtube.smash
- [FEEL] jank-input-latency (JANK): Test Tube: smash took 5 frames (84 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.1) in boss; recent move: Test Tube|testtube.na
- [FEEL] jank-input-latency (JANK): Test Tube: atk took 5 frames (84 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.1) in boss; recent move: Test Tube|testtube.ut
- [FEEL] jank-teleport (JANK): Starfruit moved 152 px in one frame (ffa; last move: Starfruit|onehit.up)
- [SLOW] jank-spike (JANK): a 56 ms frame (median 0.6) in ffa; recent move: Blueberry|blueberry.smash
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.8) in ffa; recent move: Bracelety|sign.special
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.8) in ffa; recent move: Starfruit|onehit.finisher
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.8) in ffa; recent move: Starfruit|onehit.special
- [UI] stray-banner: a match shows "KO'd by Bracelety − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.3) in ffa; recent move: no recent move
- [FEEL] jank-teleport (JANK): Bracelety moved 162 px in one frame (ffa; last move: Bracelety|sign.up)
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.6) in ffa; recent move: Blueberry|blueberry.jab
- [SLOW] jank-spike (JANK): a 53 ms frame (median 0.6) in ffa; recent move: Blueberry|blueberry.na
- [SLOW] jank-spike (JANK): a 50 ms frame (median 0.6) in ffa; recent move: Blueberry|blueberry.ba
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.7) in ffa; recent move: Blueberry|blueberry.ut
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.8) in ffa; recent move: Blueberry|blueberry.up
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.7) in ffa; recent move: Ice Cube|shatter.ua
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.6) in ffa; recent move: Blueberry|blueberry.special
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.7) in ffa; recent move: Blueberry|blueberry.fa
- [SLOW] jank-spike (JANK): a 62 ms frame (median 0.6) in ffa; recent move: Starfruit|onehit.up
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.5) in ffa; recent move: Bomb|collide.up
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.4) in ffa; recent move: Fries|fry.special
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.5) in ffa; recent move: Fries|fry.jab
- [FEEL] jank-input-latency (JANK): Fries: atk took 5 frames (84 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.4) in ffa; recent move: Fries|fry.fa
- [FEEL] jank-input-latency (JANK): Pin: smash took 8 frames (134 ms) from the key to the first change on the fighter
- [FEEL] jank-teleport (JANK): Ruby moved 189 px in one frame (boss; last move: no move)
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.1) in boss; recent move: Magnet|bestie.fa
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in boss; recent move: Magnet|bestie.na
- [SLOW] jank-spike (JANK): a 51 ms frame (median 0.1) in boss; recent move: Magnet|bestie.jab

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
