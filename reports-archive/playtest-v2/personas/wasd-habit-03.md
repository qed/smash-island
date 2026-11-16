# wasd-habit-03

**Profile.** wasd-habit-03: adult (28), casual; goal: plays with WASD (remaps to it), after first trying it unbound; presses WASD first and waits for the fighter to move; remaps if the game does not respond.
**Hands.** reaction 279 ms (SD 54), key timing jitter 2.68 frames, slipped presses 7%, double-tap 66%, short hop 38%, 60 fps input, 1.09 s per menu target, 236 ms per word read (reads 27% of a screen).
**Keys.** wasd (tries WASD unbound first). **Patience.** menus 75 s, confused 23 s on one screen, rage-quits after 4 losses in a row.
**Plan.** ffa, boss, teams (x passes).

## What they did
- wasdprobe (seed 914280465): wasd probe; menus took them about 40 s and 7 clicks. Repro: `node scripts/playtest.mjs --scene wasdprobe --seed 914280465 --arg persona=wasd-habit-03`
- ffa (seed 234700949): ended; 73 s of game on pillars, dealt 283, took 117, TOP@87% by Roboty; menus took them about 103 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 234700949 --arg persona=wasd-habit-03 --arg fighter=Fan --arg stage=pillars --arg kind=ffa`
- ffa (seed 198275775): ended; 61 s of game on incin, dealt 270, took 206, RIGHT@101% by Rose, RIGHT@64% by Apple, LEFT@41% by Apple; menus took them about 103 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 198275775 --arg persona=wasd-habit-03 --arg fighter=Paper --arg stage=incin --arg kind=ffa`
- ffa (seed 66203567): cap; 180 s of game on ice, dealt 815, took 176, BOTTOM@0% fell, BOTTOM@25% by Microphone, BOTTOM@86% by Money; menus took them about 99 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 66203567 --arg persona=wasd-habit-03 --arg fighter=Tennis Ball --arg stage=ice --arg kind=ffa`
- boss (seed 655489406): ended; 50 s of game on goiky, dealt 323, took 69, LEFT@68% by a boss, LEFT@0% fell, LEFT@51% by a boss, boss Two; menus took them about 97 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 655489406 --arg persona=wasd-habit-03 --arg fighter=David --arg boss=9`
- ffa (seed 954153852): cap; 180 s of game on canyon, dealt 102, took 27, BOTTOM@0% fell, BOTTOM@0% fell, BOTTOM@27% fell; menus took them about 99 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 954153852 --arg persona=wasd-habit-03 --arg fighter=Pin --arg stage=canyon --arg kind=ffa`
- ffa (seed 697335345): cap; 180 s of game on fortress, dealt 298, took 89, no KOs; menus took them about 99 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 697335345 --arg persona=wasd-habit-03 --arg fighter=Match --arg stage=fortress --arg kind=ffa`
- boss (seed 40212347): ended; 153 s of game on goiky, dealt 269, took 277, RIGHT@96% by a boss, LEFT@44% by a boss, TOP@79% by a boss, boss Puffball Speaker Box; menus took them about 97 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 40212347 --arg persona=wasd-habit-03 --arg fighter=Balloony --arg boss=1`
- boss (seed 987945174): ended; 101 s of game on goiky, dealt 343, took 165, LEFT@115% by a boss, LEFT@86% by a boss, RIGHT@50% by a boss, boss Two; menus took them about 97 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 987945174 --arg persona=wasd-habit-03 --arg fighter=Naily --arg boss=9`
- boss (seed 174027756): ended; 152 s of game on goiky, dealt 321, took 434, RIGHT@98% by a boss, LEFT@77% by a boss, RIGHT@151% by a boss, boss Puffball Speaker Box; menus took them about 97 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 174027756 --arg persona=wasd-habit-03 --arg fighter=Bomb --arg boss=1`
- boss (seed 473809274): ended; 132 s of game on goiky, dealt 468, took 92, RIGHT@108% by a boss, RIGHT@31% by a boss, RIGHT@114% by a boss, boss MePhone4; menus took them about 97 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 473809274 --arg persona=wasd-habit-03 --arg fighter=Pencil --arg boss=5`
- teams (seed 874490821): cap; 180 s of game on bigincin, dealt 368, took 313, LEFT@135% by Loser; menus took them about 99 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 874490821 --arg persona=wasd-habit-03 --arg fighter=Rose --arg stage=bigincin --arg kind=teams`
- teams (seed 572086751): cap; 180 s of game on incin, dealt 201, took 346, MAX@240% by Taco; menus took them about 103 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 572086751 --arg persona=wasd-habit-03 --arg fighter=Yin-Yang --arg stage=incin --arg kind=teams`
- teams (seed 183321344): cap; 180 s of game on pillars, dealt 152, took 143, RIGHT@137% by Spikey; menus took them about 99 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 183321344 --arg persona=wasd-habit-03 --arg fighter=Barf Bag --arg stage=pillars --arg kind=teams`
- teams (seed 657797403): cap; 180 s of game on ice, dealt 102, took 172, no KOs; menus took them about 99 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 657797403 --arg persona=wasd-habit-03 --arg fighter=MeTag --arg stage=ice --arg kind=teams`
- teams (seed 166288288): cap; 180 s of game on pillars, dealt 260, took 132, no KOs; menus took them about 99 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 166288288 --arg persona=wasd-habit-03 --arg fighter=Puffball --arg stage=pillars --arg kind=teams`

## Where they got stuck or confused
- BUG cant: Tennis Ball: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Tennis Ball: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Pencil: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Rose: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- wasdprobe: pressed WASD/J/K for 4 s on a fresh game: the fighter moved 0 px; an on-screen hint about the keys was not visible
- ffa: remapped keys through Settings > Keys (7 rows, about 35 s of clicking)
- ffa: 9 presses slipped (a person's missed keys)
- ffa: 8 presses slipped (a person's missed keys)
- ffa: was knocked out 1 s into the match (BOTTOM at 0%)
- ffa: 12 presses slipped (a person's missed keys)
- boss: remapped keys through Settings > Keys (7 rows, about 35 s of clicking)
- boss: 5 presses slipped (a person's missed keys)
- ffa: 10 presses slipped (a person's missed keys)
- boss: 17 presses slipped (a person's missed keys)
- boss: 6 presses slipped (a person's missed keys)
- boss: 16 presses slipped (a person's missed keys)
- boss: 7 presses slipped (a person's missed keys)
- teams: remapped keys through Settings > Keys (7 rows, about 35 s of clicking)
- teams: 16 presses slipped (a person's missed keys)
- teams: 19 presses slipped (a person's missed keys)
- teams: 20 presses slipped (a person's missed keys)
- teams: 14 presses slipped (a person's missed keys)
- teams: 12 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage pillars) (in 6 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage bigincin) (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage incin) (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage canyon) (in 2 scenes)
- [FEEL] jank-audio-burst (JANK): 8 sound calls in one frame (boss) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (boss, stage goiky) (in 2 scenes)
- [FEEL] jank-teleport (JANK): Bow moved 240 px in one frame (teams; last move: Bow|chair.special) (in 2 scenes)
- [FEEL] long-match: teams match on pillars was still going after 3 min of game time (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage ice) (in 2 scenes)
- [UI] stray-banner: a match shows "KO'd by TV − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-no-key-hint (JANK): a player who types WASD sees nothing happen and no on-screen hint during a match about which keys to use or where to change them
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 6945 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.4) in ffa; recent move: Fan|leavealone.jab
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.5) in ffa; recent move: Fan|leavealone.grab
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.5) in ffa; recent move: Fan|leavealone.smash
- [SLOW] jank-spike (JANK): a 50 ms frame (median 0.5) in ffa; recent move: Roboty|antenna.jab
- [SLOW] jank-spike (JANK): a 50 ms frame (median 0.5) in ffa; recent move: Marker|ink.dt
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.4) in ffa; recent move: Fan|leavealone.dsmash
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.5) in ffa; recent move: Roboty|antenna.up
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.5) in ffa; recent move: Marker|ink.jab
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: Fan|leavealone.special
- [SLOW] jank-spike (JANK): a 64 ms frame (median 0.5) in ffa; recent move: Marker|ink.smash
- [SLOW] jank-spike (JANK): a 83 ms frame (median 0.3) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 89 ms frame (median 0.5) in ffa; recent move: Fan|leavealone.fa
- [SLOW] jank-spike (JANK): a 85 ms frame (median 0.5) in ffa; recent move: Fan|leavealone.da
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.4) in ffa; recent move: Fan|leavealone.ua
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.5) in ffa; recent move: Marker|ink.finisher
- [FEEL] jank-input-latency (JANK): Fan: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.6) in ffa; recent move: Roboty|antenna.grab
- [SLOW] jank-spike (JANK): a 49 ms frame (median 0.5) in ffa; recent move: Roboty|antenna.dthrow
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.5) in ffa; recent move: Roboty|antenna.down
- [SLOW] jank-spike (JANK): a 61 ms frame (median 0.3) in ffa; recent move: Fan|leavealone.na
- [UI] stray-banner: a match shows "KO'd by Roboty − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.6) in ffa; recent move: Roboty|antenna.special
- [SLOW] jank-spike (JANK): a 138 ms frame (median 0.5) in ffa; recent move: Roboty|antenna.ut
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.3) in ffa; recent move: Roboty|antenna.dt
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.3) in ffa; recent move: Fan|leavealone.dt
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4992 ms before the next screen was ready

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
