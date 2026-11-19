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
