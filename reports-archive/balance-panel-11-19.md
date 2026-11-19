# Balance panel 2026-11-19 (branch g-bal10)

All numbers are Expert CPU vs CPU 1v1, 3 stocks, items off, Smash Balls off, Goiky (the g-bal8/g-bal9 harness, `mvrun.mjs`, which also tallies damage and KOs by move). CPU results do not predict human play. 12 games is about +-14 points, so 7/12 against 8/12 means nothing.

## What was done

1. **Merged g-bal9** (Toothpaste down, Starfruit and Dough up). Its confirm run on fresh seeds had 32 of 36 games finished: Toothpaste 9/11, Starfruit 4/11, Dough 5/10. In this panel's screen: Toothpaste 3/5, Dough 2/5, Starfruit 1/5.
2. **Bug fixed: Dough's copy of Tennis Ball's special did nothing.** The cause: a special with a startup tell (TELL_ADD, or the DASH TELL) puts itself off into a short wind-up that calls the special again. By then Dough's own kit was back, so it ran his Knockoff again instead of the copy. That hit 34 specials (21 with a tell, 13 dashes), not only the serve. Direct test, Dough copying with the foe 160 px away: serve 3.08% before (only his weak shove) -> 7.04% after (the ball); ember 3.08 -> 7.04; dash 0 -> 8.8; bomb and quake now hit (15.3, 12.3).
3. **Fresh panel.** A screen of all 102 public fighters, 255 matches (1 random round + 4 Swiss rounds, 5 games each), then a gauntlet for the clear ends against 6 fighters from the screen's middle (Blocky, Apple, Pickle, Fan, Test Tube, Spikey), both sides = 12 games each. The old gauntlet's Tennis Ball, Firey Jr. and Ice Cube are now in the bottom 15, so they were replaced.
4. Candidates were tried in memory on the gauntlet's seeds. The chosen numbers were then put in the file and **re-measured on fresh seeds** (830000+, never used before). The fresh-seed column is the honest one; the tuning column was picked on those same seeds, so it flatters.

Screen ends (5 games each): top Grassy, David, Bomb 5/5; bottom Lifering, MeTag, Candle 0/5. Mid-pack (3/5, no change): Bracelety, Yin-Yang, Salt, Remote, Gelatin, Coiny, Clover, Toothpaste, Cheesy, Microphone, Gaty, Barf Bag, Blocky, Apple, Match and others.

## Per fighter

| Fighter | Change (numbers only) | Before (12) | Tuning seeds (12) | Fresh seeds (12) | Verdict |
|---|---|---|---|---|---|
| Bot | run 1.1 -> 1.0; The One and Only! (hop smash) 14% -> 12%, launch 13 -> 11; dmg 0.9 kept | 10 | 7 | **7** | in the band |
| Grassy | Step On Me, Go Flying: launch up 16 -> 14 (10% kept) | 8 | 6 | **5** | in the band |
| David | dmg 1 -> 0.92 | 9 | 8 | **6** | in the band |
| Bomb | Collision cooldown 62 -> 72 frames | 10 | 7 | **10** | NOT fixed: no effect on fresh seeds |
| Lifering | We've Got a Sinker! 8% -> 10%; jab launch 7 -> 8.5 | 1 | 2 | **0** | NOT fixed |
| MeTag | jab launch 9.5 -> 10.5; Under Arrest (smash) launch 12 -> 13.5 | 1 | 3 | **0** | NOT fixed |
| Candle | dmg 1 -> 1.1 | 1 | 3 | **0** | NOT fixed |
| Dough | (the copy bug fix only) | - | - | **2** | still low |

Why these moves: Bot's smash was 24 of their KOs in the 12 before games. Grassy's patch was 13 of their KOs in 5 screen games. David's finisher and jab were his KOs. Bomb's Collision was 15 of his KOs. The bottom three die at the same percent as the middle (121-139%) but score about 1.5 KOs a game against about 2.3, so they got launch, not weight.

Tried and dropped: Bomb's blast launch 12 -> 10.5 (10/12 -> 1/12: a cliff, too much). David's finisher 10% -> 9% with less launch (no change, 9/12). A dmg 1.1 for Lifering and MeTag (no change). Candle's smash launch 13-14 and jab launch 8 (3, 2, 1 of 12: no trend).

## Honest notes

- Bot, Grassy and David moved into the band on fresh seeds. Bomb, Lifering, MeTag and Candle did not. Their numbers are kept only because they point the right way for fighters at the end in every run; they are not shown to work. Bomb is the clear one left: his blast's launch is the lever that moves him, somewhere between 10.5 and 12 (untested).
- The bottom three may be weak partly because of how the CPU plays them. CPU difficulty was not touched (owner's rule).
- 615 matches in all (255 screen, 84 before, 84 + 72 + 24 tuning, 96 fresh), 0 errors, 0 time-outs. That is far over the 15-match budget; a 102-fighter panel can't separate anyone with less.
- Not checked: human play, Teams, items on, other stages.

## Pass 2 (branch g-bal11, same day)

Same harness and gauntlet (mvrun.mjs; Blocky, Apple, Pickle, Fan, Test Tube, Spikey, both sides = 12 games). Tuning on new seeds 840000+, then a before and an after run on fresh seeds 850000+.

**Finding about the harness: a seed does not replay a game.** The same game (same seed, same file) run twice gave two different games (frames 7816 vs 6094). So "the same seeds" never gave a paired before/after, in this pass or the last one. Every 12-game run is its own random sample, and the +-14 points are real. Below, runs are added together where the numbers were the same.

### Wins out of 12, every run

| Fighter | Before (current numbers): 830000 / 840000 / 850000 | Before total | Pass-2 numbers: 840000 / 850000 | After total | Verdict |
|---|---|---|---|---|---|
| Bomb | 10 / 6 / 6 | 22/36 (61%) | (not changed) | - | in the band (4-8 of 12 = 33-67%); no change made |
| Lifering | 0 / 1 / 0 | 1/36 (3%) | 3 / 2 | 5/24 (21%) | up, still under the band |
| MeTag | 0 / 1 / 1 | 2/36 (6%) | 4 / 3 | 7/24 (29%) | up, just under the band |
| Candle | 0 / 1 / 3 | 4/36 (11%) | 6 / 2 | 8/24 (33%) | up, at the band's edge |
| Dough | 2 / 1 / 3 | 6/36 (17%) | 5 / 6 | 11/24 (46%) | up, in the band |
| Starfruit | - / 2 / 3 | 5/24 (21%) | - / 2 | 2/12 | NOT fixed; no effect shown |

### Changes (numbers only; every move keeps its concept)

- **Lifering:** jab launch 8.5 -> 10.5; his smash row's launch 12 -> 15 (this sets his up and down smash, which got his KOs); Called in a Favor's dive-in launch 8.3/8.7 -> 10/10.4; Ring Toss (up tilt) up 8.8 -> 10.5; Buoy Swing (back air) 9.4/5.6 -> 10.4/6.2; Proper Flying Formation's hit up 10 -> 12.
- **MeTag:** jab reach 3 -> 8 (it was the shortest jab but one row; 8 is the most common) and launch 10.5 -> 11.5; Under Arrest launch 13.5 -> 16; Badge Up (up tilt) up 10.8 -> 13; Barrier Up (up air) up 9 -> 10.5.
- **Candle:** jab launch 7 -> 9.5; Inner-Flame smash (the reel) launch 12 -> 15.5; Wick Up (up tilt) up 10.6 -> 13; Mind Push (forward air) 3/3 -> 4/3.6; Drip Back (back air) 8.2/4.2 -> 9.4/4.8.
- **Dough:** jab launch 9 -> 11; Knockoff Back (back air) 8.6/4.4 -> 9.6/5; Through the Ceiling (up air) up 9 -> 10.5.
- **Starfruit:** One-Hit Wonder's first-hit launch 15/10 -> 16.25/10.75; the Has-Been shove 9/3 -> 10/4; jab launch 7 -> 8.5; Point Up (up tilt) 8.5/9.5 -> 9.5/11.
- **Bomb:** none. Collision's blast launch 12 -> 11.5 gave 4/12 and 9/12 (13/24, 54%); 12 -> 11 gave 6/12. Bomb at the current 12 was 6/12 on both new seed sets (22/36 with last pass's 10). No difference between 11 and 12 shows through the noise, and he is in the band, so the nerf was not kept. Last pass's Collision cooldown 72 stays: it was not re-tested on its own.

Damage stat was not used (the brief). CPU difficulty was not touched.

### Tried on the tuning seeds and dropped

- First try, smaller launches (Lifering smash row 14 + dive-in 9.3/9.7 + jab 9.5; MeTag Under Arrest 15, Badge Up 12, jab 11.5; Candle reel 14, Wick Up 12, jab 8.5): Lifering 1, MeTag 2, Candle 3 of 12. That is no better than before for Lifering. The bigger numbers above (and MeTag's jab reach) are what moved them.
- Starfruit's first hit at 16/10.5: 3/12. At 16.5/11: 9/12. The value in between, 16.25/10.75, was what got measured on fresh seeds: 2/12. Because a seed doesn't replay, the 9 may be luck. His One-Hit Wonder lands only once a stock, so his results swing a lot.

### Honest notes

- Not what the brief assumed: in these runs Lifering and Candle **die earlier** than the rest (about 102-115% against 123-142% for Bomb, MeTag and Dough). MeTag dies late but loses the damage race (dealt about 250 a game, taken about 380-410). Lifering's KOs came late before the change (foes KO'd at about 134-147%; about 103% after). So kill power was part of the problem for Lifering and Candle but not all of it. MeTag's jab reach probably did more than his launches (not separated).
- Lifering and MeTag are still under the band; Starfruit is not fixed. Only Dough is clearly in the band, and Candle is at its edge.
- The changes of last pass that were "kept, no measured effect" (Lifering's Sinker 10% and jab, MeTag's jab and Under Arrest, Candle's dmg 1.1, Bomb's cooldown) were all kept. None of them showed harm, and the buffs were built on top of them. They were not re-tested one at a time.
- 411 games this pass (264 for tuning: 24 + 72 + 72 + 48 + 48; 72 fresh before; 72 fresh after; 3 replay checks), 0 errors, 0 time-outs. Far over the 15-match budget.
- Not checked: human play, Teams, items on, other stages, each change on its own.
