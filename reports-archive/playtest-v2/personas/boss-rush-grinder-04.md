# boss-rush-grinder-04

**Profile.** boss-rush-grinder-04: adult (20), veteran; goal: clear Boss Rush; retries after a loss; learns attack patterns.
**Hands.** reaction 230 ms (SD 34), key timing jitter 1.45 frames, slipped presses 2%, double-tap 88%, short hop 79%, 60 fps input, 0.77 s per menu target, 244 ms per word read (reads 20% of a screen).
**Keys.** arrows. **Patience.** menus 83 s, confused 17 s on one screen, rage-quits after 13 losses in a row.
**Plan.** boss, boss, boss (x passes).

## What they did
- boss (seed 272013506): cap; 180 s of game on goiky, dealt 385, took 135, RIGHT@100% by a boss, TOP@115% by a boss, boss MePhone4; menus took them about 31 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 272013506 --arg persona=boss-rush-grinder-04 --arg fighter=Tapey --arg boss=5`
- boss (seed 169259605): cap; 180 s of game on goiky, dealt 395, took 140, LEFT@113% by a boss, RIGHT@135% by a boss, boss MePhone4; menus took them about 31 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 169259605 --arg persona=boss-rush-grinder-04 --arg fighter=Ruby --arg boss=5`
- boss (seed 877110278): ended; 123 s of game on goiky, dealt 210, took 190, LEFT@62% by a boss, RIGHT@82% by a boss, RIGHT@56% by a boss, boss Puffball Speaker Box; menus took them about 31 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 877110278 --arg persona=boss-rush-grinder-04 --arg fighter=Blueberry --arg boss=1`
- boss (seed 713731747): ended; 127 s of game on goiky, dealt 303, took 156, LEFT@118% by a boss, LEFT@68% by a boss, RIGHT@45% by a boss, boss Two; menus took them about 31 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 713731747 --arg persona=boss-rush-grinder-04 --arg fighter=Nickel --arg boss=9`
- boss (seed 46829091): ended; 173 s of game on goiky, dealt 415, took 307, RIGHT@98% by a boss, LEFT@100% by a boss, LEFT@113% by a boss, boss Puffball Speaker Box; menus took them about 31 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 46829091 --arg persona=boss-rush-grinder-04 --arg fighter=MeTag --arg boss=1`
- boss (seed 917349803): ended; 69 s of game on goiky, dealt 123, took 0, LEFT@84% by ?, TOP@94% by ?, TOP@123% by ?, boss Evil Leafy; menus took them about 31 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 917349803 --arg persona=boss-rush-grinder-04 --arg fighter=Match --arg boss=6`
- boss (seed 795594225): ended; 69 s of game on goiky, dealt 87, took 94, LEFT@58% by a boss, TOP@91% by a boss, LEFT@22% by a boss, boss Firey Speaker Box; menus took them about 31 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 795594225 --arg persona=boss-rush-grinder-04 --arg fighter=Nickel --arg boss=2`
- boss (seed 500280532): ended; 82 s of game on goiky, dealt 235, took 76, LEFT@22% by a boss, LEFT@108% by a boss, RIGHT@44% by a boss, boss Springy; menus took them about 31 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 500280532 --arg persona=boss-rush-grinder-04 --arg fighter=Coiny --arg boss=10`
- boss (seed 537263075): ended; 175 s of game on goiky, dealt 382, took 22, TOP@104% by ?, TOP@114% by ?, RIGHT@119% by a boss, boss Evil Leafy; menus took them about 31 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 537263075 --arg persona=boss-rush-grinder-04 --arg fighter=Tennis Ball --arg boss=6`
- boss (seed 593706168): ended; 101 s of game on goiky, dealt 240, took 251, LEFT@111% by a boss, RIGHT@78% by a boss, TOP@131% by a boss, boss Firey Speaker Box; menus took them about 31 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 593706168 --arg persona=boss-rush-grinder-04 --arg fighter=Pencil --arg boss=2`
- boss (seed 596063787): cap; 180 s of game on goiky, dealt 390, took 147, LEFT@88% by a boss, RIGHT@77% by a boss, boss MePhone4S; menus took them about 31 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 596063787 --arg persona=boss-rush-grinder-04 --arg fighter=Teardrop --arg boss=7`
- boss (seed 789172884): cap; 180 s of game on goiky, dealt 398, took 88, RIGHT@104% by a boss, RIGHT@38% by a boss, boss MePhone4S; menus took them about 31 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 789172884 --arg persona=boss-rush-grinder-04 --arg fighter=Cheesy --arg boss=7`
- boss (seed 22385193): ended; 90 s of game on goiky, dealt 469, took 277, RIGHT@75% by a boss, RIGHT@18% by a boss, TOP@125% by a boss, boss The Bug Swarm; menus took them about 31 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 22385193 --arg persona=boss-rush-grinder-04 --arg fighter=Woody --arg boss=3`
- boss (seed 896395858): until; 130 s of game on goiky, dealt 654, took 222, RIGHT@55% by a boss, RIGHT@119% by a boss, LEFT@33% by a boss, boss The Bug Swarm; menus took them about 31 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 896395858 --arg persona=boss-rush-grinder-04 --arg fighter=Bomb --arg boss=3`
- boss (seed 821566548): running; 122 s of game on goiky, dealt 404, took 189, TOP@135% by a boss, boss Four; menus took them about 31 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 821566548 --arg persona=boss-rush-grinder-04 --arg fighter=Remote --arg boss=11`

## Where they got stuck or confused
- BUG cant: Nickel: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Remote: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- boss: 5 presses slipped (a person's missed keys)
- boss: was knocked out 14 s into the match (LEFT at 62%)
- boss: 2 presses slipped (a person's missed keys)
- boss: 3 presses slipped (a person's missed keys)
- boss: 9 presses slipped (a person's missed keys)
- boss: was knocked out 9 s into the match (LEFT at 22%)
- boss: 4 presses slipped (a person's missed keys)
- boss: 6 presses slipped (a person's missed keys)
- boss: 1 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (boss, stage goiky) (in 13 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in boss (in 6 scenes)
- [FEEL] jank-audio-burst (JANK): 8 sound calls in one frame (boss) (in 5 scenes)
- [FEEL] long-match: boss match on goiky was still going after 3 min of game time (in 4 scenes)
- [FEEL] jank-teleport (JANK): Nickel moved 153 px in one frame (boss; last move: Nickel|flip.up) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.0) in boss; recent move: no recent move
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in boss; recent move: Tapey|tape.ut
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in boss; recent move: Tapey|tape.smash
- [FEEL] jank-input-latency (JANK): Tapey: smash took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.1) in boss; recent move: Tapey|tape.special
- [FEEL] jank-input-latency (JANK): Ruby: smash took 5 frames (84 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 59 ms frame (median 0.2) in boss; recent move: Tissues|condishawn.ut
- [SLOW] jank-spike (JANK): a 56 ms frame (median 0.2) in boss; recent move: no recent move
- [SLOW] jank-spike (JANK): a 65 ms frame (median 0.3) in boss; recent move: Blueberry|blueberry.special
- [SLOW] jank-spike (JANK): a 49 ms frame (median 0.2) in boss; recent move: Tissues|condishawn.up
- [SLOW] jank-spike (JANK): a 234 ms frame (median 0.4) in boss; recent move: Blueberry|blueberry.da
- [SLOW] jank-spike (JANK): a 63 ms frame (median 0.9) in boss; recent move: Blueberry|blueberry.finisher
- [SLOW] jank-spike (JANK): a 59 ms frame (median 0.3) in boss; recent move: Blueberry|blueberry.smash
- [SLOW] jank-spike (JANK): a 51 ms frame (median 0.4) in boss; recent move: Blueberry|blueberry.ba
- [SLOW] jank-spike (JANK): a 78 ms frame (median 0.4) in boss; recent move: Blueberry|blueberry.ua
- [SLOW] jank-spike (JANK): a 66 ms frame (median 0.3) in boss; recent move: Blueberry|blueberry.grab
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.4) in boss; recent move: Blueberry|blueberry.jab
- [SLOW] jank-spike (JANK): a 66 ms frame (median 0.2) in boss; recent move: Taco|jawbreaker.up
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.2) in boss; recent move: Tissues|condishawn.ua
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.3) in boss; recent move: Taco|jawbreaker.ut
- [SLOW] jank-spike (JANK): a 50 ms frame (median 0.3) in boss; recent move: Blueberry|blueberry.fa
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.2) in boss; recent move: Tissues|condishawn.fa
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.5) in boss; recent move: Blueberry|blueberry.ut
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in boss; recent move: Blueberry|blueberry.dt
- [SLOW] jank-spike (JANK): a 50 ms frame (median 0.3) in boss; recent move: Tissues|condishawn.ba
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in boss; recent move: Tissues|condishawn.da
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.2) in boss; recent move: Taco|jawbreaker.ba
- [SLOW] jank-spike (JANK): a 55 ms frame (median 0.4) in boss; recent move: Firey|ember.up
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.2) in boss; recent move: no recent move
- [SLOW] jank-spike (JANK): a 48 ms frame (median 0.6) in boss; recent move: Paintbrush|fury.up
- [SLOW] jank-spike (JANK): a 73 ms frame (median 0.4) in boss; recent move: Nickel|flip.up
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.4) in boss; recent move: Nickel|flip.na
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.5) in boss; recent move: Nickel|flip.jab
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.7) in boss; recent move: Nickel|flip.special
- [SLOW] jank-spike (JANK): a 94 ms frame (median 0.2) in boss; recent move: Nickel|flip.smash

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
