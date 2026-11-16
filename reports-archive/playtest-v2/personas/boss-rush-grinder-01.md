# boss-rush-grinder-01

**Profile.** boss-rush-grinder-01: adult (21), veteran; goal: clear Boss Rush; retries after a loss; learns attack patterns.
**Hands.** reaction 248 ms (SD 44), key timing jitter 1.48 frames, slipped presses 3%, double-tap 87%, short hop 81%, 60 fps input, 0.95 s per menu target, 262 ms per word read (reads 26% of a screen).
**Keys.** arrows. **Patience.** menus 78 s, confused 23 s on one screen, rage-quits after 11 losses in a row.
**Plan.** boss, boss, boss (x passes).

## What they did
- boss (seed 144687930): ended; 90 s of game on goiky, dealt 262, took 178, RIGHT@114% by a boss, RIGHT@48% by a boss, RIGHT@94% by a boss, boss Purple Dragon; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 144687930 --arg persona=boss-rush-grinder-01 --arg fighter=Snowball --arg boss=8`
- boss (seed 614095181): ended; 64 s of game on goiky, dealt 196, took 170, RIGHT@44% by a boss, RIGHT@74% by a boss, RIGHT@96% by a boss, boss Purple Dragon; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 614095181 --arg persona=boss-rush-grinder-01 --arg fighter=Bell --arg boss=8`
- boss (seed 465475152): ended; 155 s of game on goiky, dealt 585, took 287, RIGHT@116% by a boss, RIGHT@22% by a boss, LEFT@58% by a boss, boss Purple Face; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 465475152 --arg persona=boss-rush-grinder-01 --arg fighter=Test Tube --arg boss=4`
- boss (seed 933413996): ended; 138 s of game on goiky, dealt 543, took 248, RIGHT@55% by a boss, RIGHT@88% by a boss, LEFT@64% by a boss, boss Announcer; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 933413996 --arg persona=boss-rush-grinder-01 --arg fighter=Dough --arg boss=0`
- boss (seed 351971652): cap; 180 s of game on goiky, dealt 681, took 206, TOP@127% by a boss, boss Purple Face; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 351971652 --arg persona=boss-rush-grinder-01 --arg fighter=Pickle --arg boss=4`
- boss (seed 790106275): ended; 68 s of game on goiky, dealt 328, took 160, RIGHT@118% by a boss, RIGHT@46% by a boss, RIGHT@72% by a boss, boss Two; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 790106275 --arg persona=boss-rush-grinder-01 --arg fighter=Sidewalky --arg boss=9`
- boss (seed 575683294): ended; 137 s of game on goiky, dealt 310, took 219, LEFT@21% by a boss, LEFT@128% by a boss, TOP@147% by a boss, boss MePhone4; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 575683294 --arg persona=boss-rush-grinder-01 --arg fighter=Flower --arg boss=5`
- boss (seed 452535938): ended; 153 s of game on goiky, dealt 384, took 216, LEFT@73% by a boss, RIGHT@52% by a boss, RIGHT@61% by a boss, boss Two; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 452535938 --arg persona=boss-rush-grinder-01 --arg fighter=Fan --arg boss=9`
- boss (seed 891582844): ended; 86 s of game on goiky, dealt 116, took 59, LEFT@37% fell, LEFT@22% by a boss, LEFT@57% by a boss, boss Springy; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 891582844 --arg persona=boss-rush-grinder-01 --arg fighter=Leafy --arg boss=10`
- boss (seed 681504187): ended; 178 s of game on goiky, dealt 143, took 186, RIGHT@22% by a boss, RIGHT@120% by a boss, RIGHT@64% by a boss, boss Puffball Speaker Box; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 681504187 --arg persona=boss-rush-grinder-01 --arg fighter=Lightning --arg boss=1`
- boss (seed 711716262): until; 170 s of game on goiky, dealt 702, took 112, LEFT@122% by a boss, TOP@102% by a boss, TOP@123% by a boss, boss MePhone4; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 711716262 --arg persona=boss-rush-grinder-01 --arg fighter=Ruby --arg boss=5`
- boss (seed 948315781): ended; 84 s of game on goiky, dealt 166, took 0, TOP@114% by ?, TOP@110% by ?, TOP@125% by ?, boss Evil Leafy; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 948315781 --arg persona=boss-rush-grinder-01 --arg fighter=Blocky --arg boss=6`
- boss (seed 999413015): ended; 118 s of game on goiky, dealt 278, took 104, LEFT@44% by a boss, LEFT@35% by a boss, LEFT@93% by a boss, boss Springy; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 999413015 --arg persona=boss-rush-grinder-01 --arg fighter=Starfruit --arg boss=10`
- boss (seed 655926333): ended; 72 s of game on goiky, dealt 124, took 122, TOP@76% by a boss, TOP@67% by a boss, TOP@131% by a boss, boss Firey Speaker Box; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 655926333 --arg persona=boss-rush-grinder-01 --arg fighter=Balloony --arg boss=2`
- boss (seed 685397514): ended; 102 s of game on goiky, dealt 286, took 68, TOP@82% by ?, TOP@108% by ?, RIGHT@4% by ?, boss Evil Leafy; menus took them about 42 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 685397514 --arg persona=boss-rush-grinder-01 --arg fighter=Woody --arg boss=6`

## Where they got stuck or confused
- BUG cant: Snowball: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Test Tube: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Flower: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Fan: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Ruby: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- boss: 6 presses slipped (a person's missed keys)
- boss: 8 presses slipped (a person's missed keys)
- boss: 3 presses slipped (a person's missed keys)
- boss: was knocked out 14 s into the match (LEFT at 21%)
- boss: 10 presses slipped (a person's missed keys)
- boss: was knocked out 10 s into the match (LEFT at 37%)
- boss: 2 presses slipped (a person's missed keys)
- boss: was knocked out 13 s into the match (RIGHT at 22%)
- boss: 7 presses slipped (a person's missed keys)
- boss: 5 presses slipped (a person's missed keys)
- boss: was knocked out 9 s into the match (LEFT at 44%)

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (boss, stage goiky) (in 11 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in boss (in 4 scenes)
- [FEEL] jank-audio-burst (JANK): 8 sound calls in one frame (boss) (in 3 scenes)
- [BUG] cant: Snowball: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- [FEEL] jank-input-latency (JANK): Snowball: grab took 4 frames (67 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.3) in boss; recent move: Bell|ring.up
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.3) in boss; recent move: Loser|cool.jab
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.2) in boss; recent move: Bell|ring.jab
- [FEEL] jank-input-latency (JANK): Bell: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in boss; recent move: Bell|ring.na
- [SLOW] jank-spike (JANK): a 51 ms frame (median 0.4) in boss; recent move: Loser|cool.up
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.3) in boss; recent move: no recent move
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.6) in boss; recent move: Loser|cool.fa
- [SLOW] jank-spike (JANK): a 62 ms frame (median 0.1) in boss; recent move: Test Tube|testtube.smash
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.1) in boss; recent move: Test Tube|testtube.jab
- [SLOW] jank-spike (JANK): a 98 ms frame (median 0.1) in boss; recent move: Test Tube|testtube.special
- [FEEL] jank-input-latency (JANK): Test Tube: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 65 ms frame (median 0.1) in boss; recent move: no recent move
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.1) in boss; recent move: Test Tube|testtube.grab
- [BUG] cant: Test Tube: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- [SLOW] jank-spike (JANK): a 80 ms frame (median 0.2) in boss; recent move: Test Tube|testtube.ut
- [FEEL] jank-teleport (JANK): Test Tube moved 173 px in one frame (boss; last move: no move)
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.2) in boss; recent move: Test Tube|testtube.na
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.1) in boss; recent move: Test Tube|testtube.finisher
- [SLOW] jank-spike (JANK): a 73 ms frame (median 0.1) in boss; recent move: Test Tube|testtube.fa
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.1) in boss; recent move: Dough|copycat.ut
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.3) in boss; recent move: Dough|copycat.dt
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.1) in boss; recent move: Dough|copycat.jab
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.1) in boss; recent move: no recent move
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in boss; recent move: Dough|copycat.fa
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.1) in boss; recent move: Dough|copycat.smash
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.3) in boss; recent move: Puffball|fly.ut
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.1) in boss; recent move: Dough|copycat.special
- [SLOW] jank-spike (JANK): a 63 ms frame (median 0.2) in boss; recent move: Dough|copycat.na
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.1) in boss; recent move: Dough|copycat.usmash
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.1) in boss; recent move: Dough|copycat.da
- [FEEL] jank-teleport (JANK): Pen moved 159 px in one frame (boss; last move: Pen|cap.finisher)
- [FEEL] jank-input-latency (JANK): Pickle: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [FEEL] jank-teleport (JANK): Pickle moved 167 px in one frame (boss; last move: Pickle|pickle.jab)
- [FEEL] jank-teleport (JANK): Pen moved 164 px in one frame (boss; last move: no move)

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
