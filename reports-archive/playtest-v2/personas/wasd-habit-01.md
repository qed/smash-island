# wasd-habit-01

**Profile.** wasd-habit-01: adult (24), casual; goal: plays with WASD (remaps to it), after first trying it unbound; presses WASD first and waits for the fighter to move; remaps if the game does not respond.
**Hands.** reaction 276 ms (SD 60), key timing jitter 2.68 frames, slipped presses 7%, double-tap 79%, short hop 49%, 60 fps input, 0.95 s per menu target, 247 ms per word read (reads 23% of a screen).
**Keys.** wasd (tries WASD unbound first). **Patience.** menus 79 s, confused 28 s on one screen, rage-quits after 5 losses in a row.
**Plan.** ffa, boss, teams (x passes).

## What they did
- wasdprobe (seed 397100809): wasd probe; menus took them about 35 s and 7 clicks. Repro: `node scripts/playtest.mjs --scene wasdprobe --seed 397100809 --arg persona=wasd-habit-01`
- ffa (seed 970883050): ended; 73 s of game on incin, dealt 396, took 215, TOP@185% by Fries, LEFT@31% by Fern; menus took them about 89 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 970883050 --arg persona=wasd-habit-01 --arg fighter=Bell --arg stage=incin --arg kind=ffa`
- ffa (seed 679324793): ended; 106 s of game on pillars, dealt 373, took 251, LEFT@114% by Taco, TOP@136% by Taco; menus took them about 89 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 679324793 --arg persona=wasd-habit-01 --arg fighter=Pencil --arg stage=pillars --arg kind=ffa`
- ffa (seed 763165995): cap; 180 s of game on wind, dealt 461, took 316, RIGHT@107% by Dora, RIGHT@105% by Dora; menus took them about 91 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 763165995 --arg persona=wasd-habit-01 --arg fighter=Pen --arg stage=wind --arg kind=ffa`
- ffa (seed 115033666): cap; 180 s of game on tlc, dealt 339, took 191, MAX@87% by Microphone, MAX@65% by Cherries; menus took them about 91 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 115033666 --arg persona=wasd-habit-01 --arg fighter=Bracelety --arg stage=tlc --arg kind=ffa`
- boss (seed 363695895): ended; 49 s of game on goiky, dealt 134, took 97, RIGHT@102% by a boss, RIGHT@22% by a boss, LEFT@63% by a boss, boss MePhone4S; menus took them about 87 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 363695895 --arg persona=wasd-habit-01 --arg fighter=Ruler --arg boss=7`
- ffa (seed 359746251): cap; 180 s of game on fortress, dealt 267, took 278, LEFT@92% by Naily; menus took them about 89 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 359746251 --arg persona=wasd-habit-01 --arg fighter=Golf Ball --arg stage=fortress --arg kind=ffa`
- boss (seed 98466729): ended; 69 s of game on goiky, dealt 294, took 141, LEFT@77% by a boss, RIGHT@114% by a boss, LEFT@95% by a boss, boss MePhone4S; menus took them about 87 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 98466729 --arg persona=wasd-habit-01 --arg fighter=Test Tube --arg boss=7`
- boss (seed 619891071): until; 112 s of game on goiky, dealt 649, took 205, LEFT@50% by a boss, RIGHT@38% by a boss, boss The Bug Swarm; menus took them about 87 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 619891071 --arg persona=wasd-habit-01 --arg fighter=Remote --arg boss=3`
- boss (seed 77806792): cap; 180 s of game on goiky, dealt 442, took 124, LEFT@68% by a boss, boss Four; menus took them about 87 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 77806792 --arg persona=wasd-habit-01 --arg fighter=Teardrop --arg boss=11`
- boss (seed 90792205): running; 122 s of game on goiky, dealt 516, took 148, LEFT@86% by a boss, TOP@169% by a boss, boss Four; menus took them about 87 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 90792205 --arg persona=wasd-habit-01 --arg fighter=Saw --arg boss=11`
- teams (seed 368688467): cap; 180 s of game on shift, dealt 448, took 197, TOP@145% by David; menus took them about 91 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 368688467 --arg persona=wasd-habit-01 --arg fighter=Microphone --arg stage=shift --arg kind=teams`
- teams (seed 51259242): cap; 180 s of game on bigincin, dealt 353, took 142, BOTTOM@34% by Salt; menus took them about 89 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 51259242 --arg persona=wasd-habit-01 --arg fighter=Pin --arg stage=bigincin --arg kind=teams`
- teams (seed 53821473): ended; 168 s of game on forest, dealt 183, took 456, TOP@212% by Naily, RIGHT@244% by Toothpaste; menus took them about 91 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 53821473 --arg persona=wasd-habit-01 --arg fighter=Bomb --arg stage=forest --arg kind=teams`
- teams (seed 772952843): cap; 180 s of game on wind, dealt 298, took 192, TOP@182% by Sidewalky; menus took them about 89 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 772952843 --arg persona=wasd-habit-01 --arg fighter=Nickel --arg stage=wind --arg kind=teams`
- teams (seed 430505362): cap; 180 s of game on pillars, dealt 187, took 306, TOP@146% by Bomb; menus took them about 91 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 430505362 --arg persona=wasd-habit-01 --arg fighter=Cake --arg stage=pillars --arg kind=teams`

## Where they got stuck or confused
- BUG cant: Bell: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Remote: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Saw: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- wasdprobe: pressed WASD/J/K for 4 s on a fresh game: the fighter moved 0 px; an on-screen hint about the keys was not visible
- ffa: remapped keys through Settings > Keys (7 rows, about 31 s of clicking)
- ffa: 8 presses slipped (a person's missed keys)
- ffa: 17 presses slipped (a person's missed keys)
- ffa: 30 presses slipped (a person's missed keys)
- ffa: 25 presses slipped (a person's missed keys)
- boss: remapped keys through Settings > Keys (7 rows, about 31 s of clicking)
- boss: 5 presses slipped (a person's missed keys)
- ffa: 18 presses slipped (a person's missed keys)
- boss: 3 presses slipped (a person's missed keys)
- boss: 15 presses slipped (a person's missed keys)
- boss: 32 presses slipped (a person's missed keys)
- boss: 8 presses slipped (a person's missed keys)
- teams: remapped keys through Settings > Keys (7 rows, about 31 s of clicking)
- teams: 18 presses slipped (a person's missed keys)
- teams: 17 presses slipped (a person's missed keys)
- teams: 8 presses slipped (a person's missed keys)
- teams: 21 presses slipped (a person's missed keys)
- teams: 30 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (boss, stage goiky) (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in boss (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage shift) (in 3 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage bigincin) (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage wind) (in 3 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 2 scenes)
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.3) in ffa; recent move: no recent move (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage fortress) (in 2 scenes)
- [UI] stray-banner: a match shows "KO'd by Naily − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage forest) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage pillars) (in 2 scenes)
- [UI] stray-banner: a match shows "KO'd by Cheesy − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-no-key-hint (JANK): a player who types WASD sees nothing happen and no on-screen hint during a match about which keys to use or where to change them
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 6562 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.5) in ffa; recent move: Bell|ring.fa
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in ffa; recent move: Bell|ring.jab
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in ffa; recent move: Bell|ring.special
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.6) in ffa; recent move: Bell|ring.dt
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in ffa; recent move: Fern|photo.down
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.5) in ffa; recent move: Fries|fry.da
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.5) in ffa; recent move: Bell|ring.finisher
- [FEEL] jank-teleport (JANK): Bell moved 270 px in one frame (ffa; last move: Bell|ring.jab)
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.5) in ffa; recent move: Bell|ring.na
- [SLOW] jank-spike (JANK): a 48 ms frame (median 0.5) in ffa; recent move: Fern|photo.jab
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.4) in ffa; recent move: Fries|fry.down
- [FEEL] jank-input-latency (JANK): Bell: smash took 8 frames (134 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.7) in ffa; recent move: Bell|ring.down
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.6) in ffa; recent move: Bell|ring.smash
- [BUG] cant: Bell: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.4) in ffa; recent move: Fries|fsgather
- [FEEL] jank-teleport (JANK): Grassy moved 243 px in one frame (ffa; last move: no move)
- [UI] stray-banner: a match shows "KO'd by Fries − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-teleport (JANK): Bell moved 172 px in one frame (ffa; last move: Bell|ring.finisher)
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.3) in ffa; recent move: Bell|ring.ut
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4731 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 56 ms frame (median 0.6) in ffa; recent move: Pickle|pickle.fa
- [SLOW] jank-spike (JANK): a 123 ms frame (median 0.4) in ffa; recent move: Pencil|van.up
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.7) in ffa; recent move: Pickle|pickle.special
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.7) in ffa; recent move: Taco|jawbreaker.jab

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
