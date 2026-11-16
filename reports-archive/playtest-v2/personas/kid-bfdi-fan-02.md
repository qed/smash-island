# kid-bfdi-fan-02

**Profile.** kid-bfdi-fan-02: kid (11), first-time; goal: try every fighter; reads nothing, clicks the fighter they know from BFDI; mashes attack when excited.
**Hands.** reaction 393 ms (SD 83), key timing jitter 3.01 frames, slipped presses 10%, double-tap 47%, short hop 28%, 60 fps input, 2.02 s per menu target, 510 ms per word read (reads 12% of a screen).
**Keys.** arrows. **Patience.** menus 71 s, confused 35 s on one screen, rage-quits after 2 losses in a row.
**Plan.** ffa, boss, training, 1v1 (x passes).

## What they did
- 1v1 (seed 798819023): ended; 16 s of game on yoyle, dealt 37, took 0, RIGHT@0% fell, BOTTOM@0% fell; menus took them about 51 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 798819023 --arg persona=kid-bfdi-fan-02 --arg fighter=Yellow Face --arg stage=yoyle --arg kind=1v1`
- training (seed 805849564): cap; menus took them about 80 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 805849564 --arg persona=kid-bfdi-fan-02 --arg fighter=Knife`
- 1v1 (seed 668098220): ended; 167 s of game on ice, dealt 409, took 162, TOP@113% by Poppy; menus took them about 57 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 668098220 --arg persona=kid-bfdi-fan-02 --arg fighter=Firey Jr. --arg stage=ice --arg kind=1v1`
- ffa (seed 136151395): ended; 89 s of game on ice, dealt 579, took 95, BOTTOM@0% fell; menus took them about 51 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 136151395 --arg persona=kid-bfdi-fan-02 --arg fighter=Ruler --arg stage=ice --arg kind=ffa`
- ffa (seed 677369058): cap; 180 s of game on grandplains, dealt 214, took 43, BOTTOM@28% fell, BOTTOM@15% by Taco (II), BOTTOM@0% fell; menus took them about 51 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 677369058 --arg persona=kid-bfdi-fan-02 --arg fighter=Coiny --arg stage=grandplains --arg kind=ffa`
- boss (seed 935995): ended; 163 s of game on goiky, dealt 398, took 275, RIGHT@44% by a boss, RIGHT@86% by a boss, LEFT@106% by a boss, boss Puffball Speaker Box; menus took them about 47 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 935995 --arg persona=kid-bfdi-fan-02 --arg fighter=Gaty --arg boss=1`
- boss (seed 995948402): cap; 180 s of game on goiky, dealt 147, took 88, LEFT@53% by a boss, RIGHT@80% by a boss, RIGHT@56% by a boss, boss MePhone4; menus took them about 47 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 995948402 --arg persona=kid-bfdi-fan-02 --arg fighter=Barf Bag --arg boss=5`
- ffa (seed 791045430): cap; 180 s of game on canyon, dealt 269, took 62, BOTTOM@0% fell, BOTTOM@62% fell, BOTTOM@0% fell; menus took them about 51 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 791045430 --arg persona=kid-bfdi-fan-02 --arg fighter=Spikey --arg stage=canyon --arg kind=ffa`
- training (seed 389569481): cap; menus took them about 80 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 389569481 --arg persona=kid-bfdi-fan-02 --arg fighter=Puffball`
- training (seed 766552484): cap; menus took them about 80 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 766552484 --arg persona=kid-bfdi-fan-02 --arg fighter=Nickel`
- boss (seed 58097089): cap; 180 s of game on goiky, dealt 152, took 220, LEFT@54% by a boss, TOP@135% by a boss, RIGHT@64% by a boss, boss Puffball Speaker Box; menus took them about 47 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 58097089 --arg persona=kid-bfdi-fan-02 --arg fighter=Ice Cube --arg boss=1`
- ffa (seed 668700604): ended; 99 s of game on goiky, dealt 60, took 40, BOTTOM@22% by Yin-Yang, BOTTOM@18% by Yin-Yang; menus took them about 51 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 668700604 --arg persona=kid-bfdi-fan-02 --arg fighter=Goo --arg stage=goiky --arg kind=ffa`
- boss (seed 879455866): cap; 180 s of game on goiky, dealt 565, took 160, RIGHT@126% by a boss, boss Two; menus took them about 47 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 879455866 --arg persona=kid-bfdi-fan-02 --arg fighter=Sidewalky --arg boss=9`
- 1v1 (seed 752388888): ended; 37 s of game on pillars, dealt 190, took 46, LEFT@43% by Magnet, LEFT@0% fell, LEFT@3% fell; menus took them about 51 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 752388888 --arg persona=kid-bfdi-fan-02 --arg fighter=Liy --arg stage=pillars --arg kind=1v1`
- boss (seed 770386106): ended; 164 s of game on goiky, dealt 473, took 52, RIGHT@44% by ?, LEFT@68% by a boss, LEFT@44% by a boss, boss Two; menus took them about 47 s and 8 clicks. Repro: `node scripts/playtest.mjs --scene boss --seed 770386106 --arg persona=kid-bfdi-fan-02 --arg fighter=Blocky --arg boss=9`
- training (seed 443359821): cap; menus took them about 80 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 443359821 --arg persona=kid-bfdi-fan-02 --arg fighter=Golf Ball`
- ffa (seed 758940635): ended; 81 s of game on shift, dealt 42, took 15, BOTTOM@15% by Donut, BOTTOM@0% fell; menus took them about 51 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 758940635 --arg persona=kid-bfdi-fan-02 --arg fighter=Match --arg stage=shift --arg kind=ffa`
- training (seed 279544349): cap; menus took them about 80 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene training --seed 279544349 --arg persona=kid-bfdi-fan-02 --arg fighter=Fries`
- 1v1 (seed 965817866): ended; 113 s of game on ice, dealt 292, took 72, BOTTOM@0% fell; menus took them about 57 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 965817866 --arg persona=kid-bfdi-fan-02 --arg fighter=Remote --arg stage=ice --arg kind=1v1`
- 1v1 (seed 562954191): ended; 15 s of game on needle, dealt 33, took 146, BOTTOM@0% fell, BOTTOM@99% by Paintbrush; menus took them about 51 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene 1v1 --seed 562954191 --arg persona=kid-bfdi-fan-02 --arg fighter=Bomby --arg stage=needle --arg kind=1v1`

## Where they got stuck or confused
- BUG cant: Remote: "special (C)" was pressed on a ready fighter and nothing happened for 14 frames
- 1v1: was knocked out 7 s into the match (RIGHT at 0%)
- training: was knocked out 3 s into the match (RIGHT at 0%)
- training: would have rage-quit: 2 losses in a row (limit 2)
- training: 8 presses slipped (a person's missed keys)
- training: would have quit in the menus: 80 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 71 s
- 1v1: 18 presses slipped (a person's missed keys)
- ffa: was knocked out 3 s into the match (BOTTOM at 0%)
- ffa: 13 presses slipped (a person's missed keys)
- ffa: 3 presses slipped (a person's missed keys)
- boss: 14 presses slipped (a person's missed keys)
- boss: 4 presses slipped (a person's missed keys)
- ffa: 6 presses slipped (a person's missed keys)
- training: 5 presses slipped (a person's missed keys)
- boss: would have rage-quit: 2 losses in a row (limit 2)
- boss: 6 presses slipped (a person's missed keys)
- ffa: was knocked out 8 s into the match (BOTTOM at 22%)
- ffa: would have rage-quit: 2 losses in a row (limit 2)
- ffa: 1 presses slipped (a person's missed keys)
- boss: 12 presses slipped (a person's missed keys)
- 1v1: would have rage-quit: 2 losses in a row (limit 2)
- 1v1: 2 presses slipped (a person's missed keys)
- training: 10 presses slipped (a person's missed keys)
- ffa: was knocked out 5 s into the match (BOTTOM at 15%)
- training: 7 presses slipped (a person's missed keys)
- 1v1: was knocked out 3 s into the match (BOTTOM at 0%)
- 1v1: 10 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage ice) (in 7 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (boss, stage goiky) (in 6 scenes)
- [FEEL] long-match: ffa match on goiky was still going after 2 min of game time (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 5 scenes)
- [FEEL] long-match: boss match on goiky was still going after 3 min of game time (in 3 scenes)
- [FEEL] jank-audio-burst (JANK): 8 sound calls in one frame (boss) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage canyon) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.2) in ffa; recent move: Knife|tricks.jab
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: Firey Jr.|emberjr.smash
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ffa; recent move: Firey Jr.|emberjr.up
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ffa; recent move: Firey Jr.|emberjr.special
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.2) in ffa; recent move: Poppy|vacuum.special
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.3) in ffa; recent move: Firey Jr.|emberjr.jab
- [UI] stray-banner: a match shows "KO'd by Poppy − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 52 ms frame (median 0.4) in ffa; recent move: Ruler|measure.smash
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.4) in ffa; recent move: Ruler|measure.jab
- [SLOW] jank-spike (JANK): a 49 ms frame (median 0.4) in ffa; recent move: Ruler|measure.special
- [SLOW] jank-spike (JANK): a 159 ms frame (median 0.6) in ffa; recent move: Ruler|measure.finisher
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.6) in ffa; recent move: Spikey|spikeburst.jab
- [SLOW] jank-spike (JANK): a 52 ms frame (median 0.5) in ffa; recent move: Nickel|flip.jab
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.4) in ffa; recent move: Ruler|measure.grab
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.6) in ffa; recent move: Ruler|measure.up
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.5) in ffa; recent move: Ruler|measure.ut
- [SLOW] jank-spike (JANK): a 83 ms frame (median 0.6) in ffa; recent move: Ruler|measure.ua
- [SLOW] jank-spike (JANK): a 65 ms frame (median 0.7) in ffa; recent move: Ruler|measure.usmash
- [SLOW] jank-spike (JANK): a 50 ms frame (median 0.8) in ffa; recent move: Ruler|measure.fa
- [FEEL] jank-hitstop-drift (JANK): Nickel moved 43 px in one frame while in hitstop (ffa; last move: Nickel|flip.finisher)
- [SLOW] jank-spike (JANK): a 67 ms frame (median 0.7) in ffa; recent move: Spikey|spikeburst.dt
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.5) in ffa; recent move: Ruler|measure.da
- [FEEL] jank-teleport (JANK): Nickel moved 153 px in one frame (ffa; last move: Nickel|flip.up)
- [SLOW] jank-spike (JANK): a 71 ms frame (median 0.4) in ffa; recent move: Ruler|measure.dsmash
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.8) in ffa; recent move: Tennis Ball|serve.up
- [SLOW] jank-spike (JANK): a 36 ms frame (median 1.1) in ffa; recent move: Spikey|spikeburst.up
- [FEEL] jank-input-latency (JANK): Ruler: atk took 5 frames (84 ms) from the key to the first change on the fighter
- [FEEL] jank-hitstop-drift (JANK): Spikey moved 67 px in one frame while in hitstop (ffa; last move: Spikey|spikeburst.jab)
- [FEEL] jank-teleport (JANK): Ruler moved 259 px in one frame (ffa; last move: Ruler|measure.jab)
- [FEEL] jank-teleport (JANK): Nickel moved 383 px in one frame (ffa; last move: no move)
- [SLOW] jank-spike (JANK): a 61 ms frame (median 0.7) in ffa; recent move: Tennis Ball|serve.dt
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.5) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.5) in ffa; recent move: Ruler|measure.ba

## When they would have quit
- training: would have rage-quit: 2 losses in a row (limit 2)
- training: would have quit in the menus: 80 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 71 s
- training: would have quit in the menus: 80 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 71 s
- training: would have quit in the menus: 80 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 71 s
- boss: would have rage-quit: 2 losses in a row (limit 2)
- ffa: would have rage-quit: 2 losses in a row (limit 2)
- 1v1: would have rage-quit: 2 losses in a row (limit 2)
- boss: would have rage-quit: 2 losses in a row (limit 2)
- training: would have quit in the menus: 80 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 71 s
- training: would have quit in the menus: 80 s of clicking and reading (13 clicks, key remap not counted) before the first match; their patience is 71 s
