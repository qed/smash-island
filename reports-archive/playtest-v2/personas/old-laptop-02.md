# old-laptop-02

**Profile.** old-laptop-02: adult (26), casual; goal: FFA on an old laptop at 25-35 fps; tolerates choppiness; reads the screen late.
**Hands.** reaction 276 ms (SD 49), key timing jitter 2.37 frames, slipped presses 5%, double-tap 62%, short hop 42%, 31 fps input, 0.83 s per menu target, 253 ms per word read (reads 26% of a screen).
**Keys.** arrows. **Patience.** menus 112 s, confused 34 s on one screen, rage-quits after 6 losses in a row.
**Plan.** ffa, teams, boss (x passes).

## What they did
- ffa (seed 57711187): ended; 80 s of game on goiky, dealt 501, took 193, TOP@135% by an assist/hazard, BOTTOM@20% by Magnet, RIGHT@22% by Magnet; menus took them about 44 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 57711187 --arg persona=old-laptop-02 --arg fighter=Rocky --arg stage=goiky --arg kind=ffa`
- boss (seed 908109487): ended; 143 s of game on goiky, dealt 477, took 169, LEFT@19% by a boss, RIGHT@65% by a boss, RIGHT@82% by a boss, boss Purple Face; menus took them about 40 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 908109487 --arg persona=old-laptop-02 --arg fighter=Paper --arg boss=4`
- ffa (seed 263886297): cap; 180 s of game on canyon, dealt 0, took 0, BOTTOM@0% fell, BOTTOM@0% fell; menus took them about 41 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 263886297 --arg persona=old-laptop-02 --arg fighter=Snowball --arg stage=canyon --arg kind=ffa`
- boss (seed 877294499): cap; 180 s of game on goiky, dealt 365, took 256, no KOs, boss Announcer; menus took them about 40 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 877294499 --arg persona=old-laptop-02 --arg fighter=Teardrop --arg boss=0`
- ffa (seed 480346214): cap; 180 s of game on skytower, dealt 129, took 413, BOTTOM@88% by ?, MAX@325% by Lollipop; menus took them about 41 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 480346214 --arg persona=old-laptop-02 --arg fighter=Bomby --arg stage=skytower --arg kind=ffa`
- teams (seed 142473706): cap; 180 s of game on needle, dealt 312, took 56, no KOs; menus took them about 44 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 142473706 --arg persona=old-laptop-02 --arg fighter=Ruler --arg stage=needle --arg kind=teams`
- teams (seed 902135714): cap; 180 s of game on needle, dealt 132, took 153, no KOs; menus took them about 44 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 902135714 --arg persona=old-laptop-02 --arg fighter=Ruby --arg stage=needle --arg kind=teams`
- teams (seed 195246767): cap; 180 s of game on skytower, dealt 675, took 67, no KOs; menus took them about 44 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 195246767 --arg persona=old-laptop-02 --arg fighter=Yellow Face --arg stage=skytower --arg kind=teams`
- teams (seed 420353658): cap; 180 s of game on dreamisle, dealt 271, took 58, no KOs; menus took them about 44 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 420353658 --arg persona=old-laptop-02 --arg fighter=Salt --arg stage=dreamisle --arg kind=teams`
- boss (seed 566508129): ended; 85 s of game on goiky, dealt 426, took 164, RIGHT@66% by a boss, RIGHT@105% by a boss, LEFT@22% by a boss, boss Announcer; menus took them about 40 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 566508129 --arg persona=old-laptop-02 --arg fighter=Candle --arg boss=0`
- teams (seed 258963502): cap; 180 s of game on bigincin, dealt 290, took 166, RIGHT@59% by Soap; menus took them about 41 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene teams --seed 258963502 --arg persona=old-laptop-02 --arg fighter=Lightning --arg stage=bigincin --arg kind=teams`
- boss (seed 367752892): ended; 64 s of game on goiky, dealt 159, took 298, RIGHT@91% by a boss, RIGHT@103% by a boss, LEFT@170% by a boss, boss Purple Dragon; menus took them about 40 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 367752892 --arg persona=old-laptop-02 --arg fighter=Jack --arg boss=8`
- ffa (seed 687968564): ended; 173 s of game on shift, dealt 149, took 99, BOTTOM@66% by Balloony, LEFT@16% by Teardrop, BOTTOM@18% by Balloony; menus took them about 44 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 687968564 --arg persona=old-laptop-02 --arg fighter=Match --arg stage=shift --arg kind=ffa`
- ffa (seed 142815599): ended; 116 s of game on dreamisle, dealt 462, took 303, TOP@179% by Firey; menus took them about 41 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 142815599 --arg persona=old-laptop-02 --arg fighter=Sidewalky --arg stage=dreamisle --arg kind=ffa`
- boss (seed 7171904): cap; 180 s of game on goiky, dealt 514, took 100, RIGHT@76% by ?, RIGHT@54% by a boss, RIGHT@127% by a boss, boss Purple Face; menus took them about 40 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 7171904 --arg persona=old-laptop-02 --arg fighter=Magnet --arg boss=4`

## Where they got stuck or confused
- BUG cant: Rocky: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Ruler: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Yellow Face: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Yellow Face: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Match: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Sidewalky: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Sidewalky: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Magnet: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- ffa: 5 presses slipped (a person's missed keys)
- boss: was knocked out 9 s into the match (LEFT at 19%)
- boss: 2 presses slipped (a person's missed keys)
- ffa: was knocked out 6 s into the match (BOTTOM at 0%)
- boss: 10 presses slipped (a person's missed keys)
- ffa: 7 presses slipped (a person's missed keys)
- teams: 11 presses slipped (a person's missed keys)
- teams: 13 presses slipped (a person's missed keys)
- teams: 14 presses slipped (a person's missed keys)
- boss: 11 presses slipped (a person's missed keys)
- boss: 8 presses slipped (a person's missed keys)
- ffa: 17 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage needle) (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (boss, stage goiky) (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in boss (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage skytower) (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage bigincin) (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage goiky) (in 2 scenes)
- [FEEL] jank-audio-burst (JANK): 8 sound calls in one frame (boss) (in 2 scenes)
- [FEEL] long-match: boss match on goiky was still going after 3 min of game time (in 2 scenes)
- [FEEL] long-match: teams match on needle was still going after 3 min of game time (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage dreamisle) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.5) in ffa; recent move: Rocky|barf.fa
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.5) in ffa; recent move: Rocky|barf.jab
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.3) in ffa; recent move: Rocky|barf.special
- [FEEL] jank-input-latency (JANK): Rocky: atk took 8 frames (134 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 66 ms frame (median 0.3) in ffa; recent move: Rocky|barf.smash
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.3) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.5) in ffa; recent move: Rocky|barf.na
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.4) in ffa; recent move: Tapey|tape.up
- [FEEL] jank-input-latency (JANK): Rocky: smash took 8 frames (134 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.6) in ffa; recent move: Rocky|barf.dt
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.2) in ffa; recent move: Magnet|fsburst
- [BUG] cant: Rocky: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.5) in ffa; recent move: Rocky|barf.finisher
- [SLOW] jank-spike (JANK): a 57 ms frame (median 0.3) in ffa; recent move: Magnet|bestie.jab
- [UI] stray-banner: a match shows "KO'd by Magnet − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 76 ms frame (median 0.8) in boss; recent move: Paper|evilpaper.up
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.2) in boss; recent move: Paper|evilpaper.ua
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.2) in boss; recent move: Paper|evilpaper.na
- [SLOW] jank-spike (JANK): a 65 ms frame (median 0.1) in boss; recent move: no recent move
- [SLOW] jank-spike (JANK): a 62 ms frame (median 0.3) in boss; recent move: Paper|evilpaper.smash
- [FEEL] jank-teleport (JANK): Paper moved 158 px in one frame (boss; last move: no move)
- [FEEL] jank-teleport (JANK): Knife moved 176 px in one frame (boss; last move: no move)
- [FEEL] jank-hitstop-drift (JANK): Knife moved 11 px in one frame while in hitstop (boss; last move: Knife|tricks.finisher)
- [SLOW] jank-spike (JANK): a 102 ms frame (median 0.2) in boss; recent move: Paper|evilpaper.ba
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.1) in boss; recent move: Knife|tricks.ut
- [FEEL] jank-teleport (JANK): Paper moved 179 px in one frame (boss; last move: Paper|evilpaper.smash)
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.1) in boss; recent move: Paper|evilpaper.grab
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in boss; recent move: Paper|evilpaper.jab

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
