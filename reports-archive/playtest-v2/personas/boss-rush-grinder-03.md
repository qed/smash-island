# boss-rush-grinder-03

**Profile.** boss-rush-grinder-03: adult (23), veteran; goal: clear Boss Rush; retries after a loss; learns attack patterns.
**Hands.** reaction 269 ms (SD 39), key timing jitter 1.43 frames, slipped presses 5%, double-tap 82%, short hop 84%, 60 fps input, 0.75 s per menu target, 228 ms per word read (reads 16% of a screen).
**Keys.** arrows. **Patience.** menus 58 s, confused 16 s on one screen, rage-quits after 10 losses in a row.
**Plan.** boss, boss, boss (x passes).

## What they did
- boss (seed 375753431): ended; 91 s of game on goiky, dealt 203, took 199, LEFT@161% by a boss, RIGHT@120% by a boss, TOP@119% by a boss, boss Firey Speaker Box; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 375753431 --arg persona=boss-rush-grinder-03 --arg fighter=Roboty --arg boss=2`
- boss (seed 615822388): ended; 100 s of game on goiky, dealt 395, took 178, RIGHT@95% by a boss, TOP@143% by a boss, RIGHT@129% by a boss, boss Springy; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 615822388 --arg persona=boss-rush-grinder-03 --arg fighter=Starfruit --arg boss=10`
- boss (seed 54982213): ended; 90 s of game on goiky, dealt 81, took 0, LEFT@106% by ?, TOP@92% by ?, RIGHT@70% by ?, boss Evil Leafy; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 54982213 --arg persona=boss-rush-grinder-03 --arg fighter=Dora --arg boss=6`
- boss (seed 385277414): ended; 68 s of game on goiky, dealt 165, took 203, TOP@91% by a boss, LEFT@94% by a boss, RIGHT@102% by a boss, boss Firey Speaker Box; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 385277414 --arg persona=boss-rush-grinder-03 --arg fighter=Yellow Face --arg boss=2`
- boss (seed 527240380): cap; 180 s of game on goiky, dealt 347, took 194, LEFT@91% by a boss, RIGHT@83% fell, RIGHT@102% by a boss, boss Springy; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 527240380 --arg persona=boss-rush-grinder-03 --arg fighter=Bomb --arg boss=10`
- boss (seed 29404359): cap; 180 s of game on goiky, dealt 320, took 236, TOP@103% by a boss, LEFT@115% by a boss, boss MePhone4S; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 29404359 --arg persona=boss-rush-grinder-03 --arg fighter=Dough --arg boss=7`
- boss (seed 589204646): ended; 106 s of game on goiky, dealt 514, took 127, RIGHT@79% by a boss, RIGHT@56% by a boss, RIGHT@73% by a boss, boss The Bug Swarm; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 589204646 --arg persona=boss-rush-grinder-03 --arg fighter=Starfruit --arg boss=3`
- boss (seed 363912579): cap; 180 s of game on goiky, dealt 474, took 198, RIGHT@132% by a boss, boss Four; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 363912579 --arg persona=boss-rush-grinder-03 --arg fighter=Tree --arg boss=11`
- boss (seed 665519911): ended; 56 s of game on goiky, dealt 93, took 111, RIGHT@38% by a boss, RIGHT@74% by a boss, RIGHT@44% by a boss, boss Purple Dragon; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 665519911 --arg persona=boss-rush-grinder-03 --arg fighter=Salt --arg boss=8`
- boss (seed 171826199): ended; 154 s of game on goiky, dealt 639, took 316, RIGHT@53% by a boss, LEFT@64% by a boss, LEFT@108% by a boss, boss The Bug Swarm; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 171826199 --arg persona=boss-rush-grinder-03 --arg fighter=Puffball --arg boss=3`
- boss (seed 351229286): ended; 114 s of game on goiky, dealt 282, took 238, TOP@101% by a boss, RIGHT@108% by a boss, RIGHT@105% by a boss, boss Four; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 351229286 --arg persona=boss-rush-grinder-03 --arg fighter=Trophy --arg boss=11`
- boss (seed 42327569): cap; 180 s of game on goiky, dealt 519, took 238, no KOs, boss Purple Face; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 42327569 --arg persona=boss-rush-grinder-03 --arg fighter=Fries --arg boss=4`
- boss (seed 911446123): cap; 180 s of game on goiky, dealt 348, took 377, RIGHT@121% by a boss, RIGHT@172% by a boss, boss Announcer; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 911446123 --arg persona=boss-rush-grinder-03 --arg fighter=Roboty --arg boss=0`
- boss (seed 761097310): until; 153 s of game on goiky, dealt 314, took 326, LEFT@78% by a boss, boss Announcer; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 761097310 --arg persona=boss-rush-grinder-03 --arg fighter=Ruby --arg boss=0`
- boss (seed 535710654): cap; 180 s of game on goiky, dealt 463, took 159, LEFT@27% by ?, LEFT@43% by a boss, LEFT@18% by a boss, boss Purple Face; menus took them about 24 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 535710654 --arg persona=boss-rush-grinder-03 --arg fighter=Woody --arg boss=4`

## Where they got stuck or confused
- BUG cant: Tree: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- boss: 10 presses slipped (a person's missed keys)
- boss: 5 presses slipped (a person's missed keys)
- boss: 2 presses slipped (a person's missed keys)
- boss: 4 presses slipped (a person's missed keys)
- boss: 9 presses slipped (a person's missed keys)
- boss: 6 presses slipped (a person's missed keys)
- boss: 7 presses slipped (a person's missed keys)
- boss: 11 presses slipped (a person's missed keys)
- boss: 13 presses slipped (a person's missed keys)
- boss: was knocked out 8 s into the match (LEFT at 27%)

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (boss, stage goiky) (in 11 scenes)
- [FEEL] long-match: boss match on goiky was still going after 3 min of game time (in 6 scenes)
- [FEEL] jank-audio-burst (JANK): 8 sound calls in one frame (boss) (in 6 scenes)
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.3) in boss; recent move: no recent move
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.1) in boss; recent move: Roboty|antenna.special
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.1) in boss; recent move: Roboty|antenna.ut
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.1) in boss; recent move: Roboty|antenna.ua
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.1) in boss; recent move: Roboty|antenna.jab
- [FEEL] jank-teleport (JANK): Starfruit moved 154 px in one frame (boss; last move: Starfruit|onehit.special)
- [FEEL] jank-teleport (JANK): Starfruit moved 293 px in one frame (boss; last move: no move)
- [FEEL] jank-teleport (JANK): Starfruit moved 154 px in one frame (boss; last move: Starfruit|onehit.up)
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.4) in boss; recent move: Pin|pierce.up
- [SLOW] jank-spike (JANK): a 79 ms frame (median 0.3) in boss; recent move: Pin|pierce.na
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.1) in boss; recent move: no recent move
- [SLOW] jank-spike (JANK): a 66 ms frame (median 0.2) in boss; recent move: Dora|rant.jab
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in boss; recent move: Dora|rant.special
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.8) in boss; recent move: Knife|tricks.finisher
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.3) in boss; recent move: Yellow Face|buynow.ut
- [FEEL] jank-input-latency (JANK): Yellow Face: special took 6 frames (100 ms) from the key to the first change on the fighter
- [FEEL] jank-input-latency (JANK): Bomb: atk took 5 frames (84 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.2) in boss; recent move: no recent move
- [SLOW] jank-spike (JANK): a 62 ms frame (median 0.1) in boss; recent move: Dough|copycat.grab
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.1) in boss; recent move: Dough|copycat.ut
- [SLOW] jank-spike (JANK): a 65 ms frame (median 0.0) in boss; recent move: no recent move
- [FEEL] jank-input-latency (JANK): Dough: smash took 5 frames (84 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.3) in boss; recent move: Starfruit|onehit.smash
- [SLOW] jank-spike (JANK): a 36 ms frame (median 1.6) in boss; recent move: TV|static.finisher
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.4) in boss; recent move: Starfruit|onehit.ut
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.1) in boss; recent move: no recent move
- [FEEL] jank-teleport (JANK): TV moved 190 px in one frame (boss; last move: no move)
- [FEEL] jank-input-latency (JANK): Starfruit: smash took 13 frames (217 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.1) in boss; recent move: Tree|timber.special
- [FEEL] jank-input-latency (JANK): Tree: smash took 6 frames (100 ms) from the key to the first change on the fighter
- [BUG] cant: Tree: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- [SLOW] jank-spike (JANK): a 96 ms frame (median 0.2) in boss; recent move: Salt|saltpepper.special
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in boss; recent move: Salt|saltpepper.ut
- [SLOW] jank-spike (JANK): a 54 ms frame (median 0.4) in boss; recent move: no recent move
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in boss
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.2) in boss; recent move: Salt|saltpepper.jab
- [FEEL] jank-input-latency (JANK): Puffball: smash took 13 frames (217 ms) from the key to the first change on the fighter

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
