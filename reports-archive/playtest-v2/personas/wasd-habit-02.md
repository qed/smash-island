# wasd-habit-02

**Profile.** wasd-habit-02: adult (25), casual; goal: plays with WASD (remaps to it), after first trying it unbound; presses WASD first and waits for the fighter to move; remaps if the game does not respond.
**Hands.** reaction 293 ms (SD 59), key timing jitter 1.83 frames, slipped presses 8%, double-tap 80%, short hop 35%, 60 fps input, 1 s per menu target, 280 ms per word read (reads 19% of a screen).
**Keys.** wasd (tries WASD unbound first). **Patience.** menus 99 s, confused 28 s on one screen, rage-quits after 6 losses in a row.
**Plan.** ffa, boss, teams (x passes).

## What they did
- wasdprobe (seed 841853379): wasd probe; menus took them about 34 s and 7 clicks. Repro: `node scripts/playtest.mjs --scene wasdprobe --seed 841853379 --arg persona=wasd-habit-02`
- ffa (seed 512871528): ended; 64 s of game on forest, dealt 219, took 619, MAX@282% by an assist/hazard, RIGHT@157% by Bomb; menus took them about 88 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 512871528 --arg persona=wasd-habit-02 --arg fighter=Nickel --arg stage=forest --arg kind=ffa`
- ffa (seed 38588325): ended; 73 s of game on shift, dealt 228, took 187, RIGHT@174% by Ruby, BOTTOM@13% by Taco (II); menus took them about 85 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 38588325 --arg persona=wasd-habit-02 --arg fighter=Trophy --arg stage=shift --arg kind=ffa`
- boss (seed 829241469): ended; 110 s of game on goiky, dealt 306, took 214, LEFT@126% by a boss, RIGHT@128% by a boss, RIGHT@23% by a boss, boss Purple Dragon; menus took them about 83 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 829241469 --arg persona=wasd-habit-02 --arg fighter=Donut --arg boss=8`
- ffa (seed 254551866): ended; 149 s of game on dreamisle, dealt 902, took 206, BOTTOM@37% by Bomb, TOP@116% by Fanny; menus took them about 85 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 254551866 --arg persona=wasd-habit-02 --arg fighter=Rocky --arg stage=dreamisle --arg kind=ffa`
- ffa (seed 959353646): cap; 180 s of game on grandplains, dealt 329, took 98, no KOs; menus took them about 88 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 959353646 --arg persona=wasd-habit-02 --arg fighter=Golf Ball --arg stage=grandplains --arg kind=ffa`
- ffa (seed 752502026): cap; 180 s of game on tlc, dealt 127, took 67, BOTTOM@8% by Teddy Bear, BOTTOM@18% by Teddy Bear, BOTTOM@0% fell; menus took them about 85 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 752502026 --arg persona=wasd-habit-02 --arg fighter=Starfruit --arg stage=tlc --arg kind=ffa`
- boss (seed 850397819): cap; 180 s of game on goiky, dealt 505, took 388, RIGHT@133% by a boss, RIGHT@118% by a boss, boss Announcer; menus took them about 83 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 850397819 --arg persona=wasd-habit-02 --arg fighter=TV --arg boss=0`
- boss (seed 242419852): ended; 85 s of game on goiky, dealt 207, took 147, RIGHT@48% by a boss, RIGHT@83% by a boss, RIGHT@48% by a boss, boss Purple Dragon; menus took them about 83 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 242419852 --arg persona=wasd-habit-02 --arg fighter=Grassy --arg boss=8`
- boss (seed 664173328): cap; 180 s of game on goiky, dealt 531, took 292, RIGHT@62% by a boss, boss Announcer; menus took them about 83 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 664173328 --arg persona=wasd-habit-02 --arg fighter=Bell --arg boss=0`
- boss (seed 390022169): until; 178 s of game on goiky, dealt 483, took 357, LEFT@152% by a boss, LEFT@74% by a boss, TOP@155% by a boss, boss Purple Face; menus took them about 83 s and 19 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 390022169 --arg persona=wasd-habit-02 --arg fighter=Nickel --arg boss=4`
- teams (seed 57434406): cap; 180 s of game on incin, dealt 356, took 92, no KOs; menus took them about 85 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 57434406 --arg persona=wasd-habit-02 --arg fighter=Teddy Bear --arg stage=incin --arg kind=teams`
- teams (seed 850247954): cap; 180 s of game on fortress, dealt 884, took 196, no KOs; menus took them about 88 s and 24 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 850247954 --arg persona=wasd-habit-02 --arg fighter=Tennis Ball --arg stage=fortress --arg kind=teams`
- teams (seed 259492291): cap; 180 s of game on dreamisle, dealt 410, took 271, TOP@199% by Golf Ball; menus took them about 85 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 259492291 --arg persona=wasd-habit-02 --arg fighter=Donut --arg stage=dreamisle --arg kind=teams`
- teams (seed 688480243): cap; 180 s of game on needle, dealt 382, took 183, RIGHT@150% by Snowball; menus took them about 85 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 688480243 --arg persona=wasd-habit-02 --arg fighter=Candle --arg stage=needle --arg kind=teams`
- teams (seed 577621217): cap; 180 s of game on shift, dealt 318, took 151, no KOs; menus took them about 85 s and 21 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 577621217 --arg persona=wasd-habit-02 --arg fighter=Book --arg stage=shift --arg kind=teams`

## Where they got stuck or confused
- BUG cant: Golf Ball: "grab (X+C)" was pressed on a ready fighter and nothing happened for 14 frames
- STUCK match-never-ends: ffa match on grandplains is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
- BUG jank-embedded: Starfruit stood inside a solid platform for 30 frames (ffa)
- BUG cant: Nickel: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Teddy Bear: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Tennis Ball: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Candle: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Book: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- wasdprobe: pressed WASD/J/K for 4 s on a fresh game: the fighter moved 0 px; an on-screen hint about the keys was not visible
- ffa: remapped keys through Settings > Keys (7 rows, about 31 s of clicking)
- ffa: 11 presses slipped (a person's missed keys)
- ffa: 6 presses slipped (a person's missed keys)
- boss: remapped keys through Settings > Keys (7 rows, about 31 s of clicking)
- boss: 11 presses slipped (a person's missed keys)
- ffa: 29 presses slipped (a person's missed keys)
- ffa: 22 presses slipped (a person's missed keys)
- ffa: was knocked out 10 s into the match (BOTTOM at 8%)
- ffa: 10 presses slipped (a person's missed keys)
- boss: 25 presses slipped (a person's missed keys)
- boss: 12 presses slipped (a person's missed keys)
- boss: 16 presses slipped (a person's missed keys)
- boss: 17 presses slipped (a person's missed keys)
- teams: remapped keys through Settings > Keys (7 rows, about 31 s of clicking)
- teams: 34 presses slipped (a person's missed keys)
- teams: 20 presses slipped (a person's missed keys)
- teams: 35 presses slipped (a person's missed keys)
- teams: 24 presses slipped (a person's missed keys)
- teams: 21 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams (in 5 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (boss, stage goiky) (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage needle) (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 3 scenes)
- [FEEL] jank-audio-burst (JANK): 8 sound calls in one frame (boss) (in 3 scenes)
- [UI] stray-banner: a match shows "KO'd by Bomb − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage dreamisle) (in 2 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in boss (in 2 scenes)
- [FEEL] long-match: boss match on goiky was still going after 3 min of game time (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage incin) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage fortress) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage shift) (in 2 scenes)
- [UI] stray-banner: a match shows "KO'd by Book − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-no-key-hint (JANK): a player who types WASD sees nothing happen and no on-screen hint during a match about which keys to use or where to change them
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 6544 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.3) in ffa; recent move: Nickel|flip.special
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.4) in ffa; recent move: Nickel|flip.jab
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.4) in ffa; recent move: Nickel|flip.smash
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.5) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.2) in ffa; recent move: Nickel|flip.na
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.5) in ffa; recent move: Knife|tricks.jab
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.4) in ffa; recent move: Nickel|flip.ut
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.4) in ffa; recent move: Knife|tricks.finisher
- [FEEL] jank-teleport (JANK): Knife moved 181 px in one frame (ffa; last move: Knife|tricks.finisher)
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.5) in ffa; recent move: Nickel|flip.ua
- [SLOW] jank-spike (JANK): a 48 ms frame (median 0.4) in ffa; recent move: Knife|tricks.up
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.4) in ffa; recent move: Bomb|collide.up
- [SLOW] jank-spike (JANK): a 49 ms frame (median 0.4) in ffa; recent move: Nickel|flip.da
- [SLOW] jank-spike (JANK): a 51 ms frame (median 0.4) in ffa; recent move: Nickel|flip.grab
- [FEEL] jank-hitstop-drift (JANK): Bomb moved 81 px in one frame while in hitstop (ffa; last move: no move)
- [FEEL] jank-teleport (JANK): Nickel moved 188 px in one frame (ffa; last move: no move)
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4778 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.4) in ffa; recent move: Ruby|beam.jab
- [FEEL] jank-input-latency (JANK): Trophy: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.4) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.5) in ffa; recent move: Trophy|blackmail.special
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.4) in ffa; recent move: Trophy|blackmail.fa
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.5) in ffa; recent move: Trophy|blackmail.jab
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.4) in ffa; recent move: Trophy|blackmail.smash
- [UI] stray-banner: a match shows "KO'd by Ruby − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
