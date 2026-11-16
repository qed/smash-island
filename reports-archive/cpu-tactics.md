# Beating Expert CPUs: tactics, tested

2026-10-28. Build 707feec, the balance pass that is about to ship (jab lock, empowered-jab fix, bottom buffs). Nothing in the game was changed.

## How this was tested

- **The real game**, run headless (jsdom) on Goiky Field, which has real edges. 1v1 matches, 2 stocks, capped at 100 seconds. Most matches hit the cap, so a match is won on stocks first, then on damage.
- **Mirror matches.** The player and the CPU use the same fighter: Pen, Coiny, Lightning or Firey Jr. Each match is played from both sides of the stage, so the matchup and the starting side cancel out.
- **The player is a script that presses real keys.** It sees the CPU 1/6 s late and presses at most 7.5 inputs a second. Those are the Expert's own eyes and hands (CPU_HUMAN react 10, inputGap 8), so neither side is faster than the other. It only reads what a person can see on screen: where the CPU is, whether it is swinging, whether it is stunned, and its damage.
- **The control is the same player without the tactic.** It walks in, alternates jab and down-tilt (the jab lock stops jab into jab), smashes only a stunned or swinging foe at 90%+, sometimes fires its shot from range, recovers, and waits while the foe is off the stage.
- **Sample size:** 32 to 40 matches per tactic and 72 for the control: 312 one-on-one matches plus 48 three-way FFAs, 360 in all. Win-rate noise is about ±8 points per tactic, so "z" below is how many noise-widths a result is from the control. A z of 2 or more is a real effect.
- **"Did not work" means it did not work for this script.** A real person doing the timing tactics (bait, cross-up) more cleverly might do better.

## Results, ranked

| # | Tactic | Win rate (control 40%) | Damage share (control 47.8%) | KOs / falls per match (control 0.69 / 1.04) | Verdict |
|---|---|---|---|---|---|
| 1 | Smash from jab range | **93%** (37/40, z 5.4) | **62.7%** (z 7.7) | 1.65 / 0.57 | Works, by a lot |
| 2 | Smash right after you land a hit | **81%** (26/32, z 3.9) | **60.8%** (z 4.3) | 1.25 / 0.78 | Works; the best choice against counter fighters |
| 3 | Free-for-all: let the CPUs fight each other | 54% vs 46% (n.s.) | n/a | falls 0.83 vs 1.33; average place 1.50 vs 1.79 | Helps a little (you survive), not proven on wins |
| 4 | Edge-guard at the ledge | 55% (22/40, z 1.5) | 50.8% (z 1.5) | 0.88 / 0.95 | Maybe; not proven |
| - | Stop-short whiff bait | 44% (z 0.3) | 48.0% | 0.75 / 0.97 | Did not work |
| - | Chase and smash it at kill percent | 38% (z -0.3) | 47.2% | 0.72 / 1.09 | Did not work (it does die sooner) |
| - | Back off from its hop-in, then punish | 28% (z -1.2) | 46.2% | 0.78 / 1.41 | Did not work; worse |
| - | Cross-up hop over it | 28% (z -1.2) | 43.5% (z -1.8) | 0.34 / 1.03 | Did not work; worse |

### 1. Smash from jab range

- **How:** walk in. As soon as you are close enough to jab, smash (V) toward it. Use the jab or down-tilt only while the smash is cooling down.
- **Why it works:** an Expert's close-range game is only the jab, the tilts and its aerials. It smashes only on an opening it saw: you stunned, frozen or mid-swing. It has no guard. The jab lock cuts its jab strings to one hit (its second jab landed 4% of the time, over 6,080 strings). Its hop-in aerials almost always miss (8% landed, over 17,151 aerial strings). So in a scramble at close range your smash out-trades whatever it does. Its "waits out your swing" spacing rule only applies when it is just *out* of reach, never when it is already in reach.
- **The cost:** a smash that misses gets punished 38% of the time within 3/4 s, against about 20% for a missed jab or tilt. It still comes out well ahead.
- **Measured:** 93% wins against 40%. You KO it 2.4 times as often and fall about half as often. When it goes off the stage, it now loses a stock on 16% of trips instead of 7%. Once it reaches 85% it dies in a median of 13 s instead of 30 s.
- **By fighter:** Pen 90%, Coiny 100%, Lightning 100%, Firey Jr. 80%. The control won 50%, 61%, **0%** and 50%. Lightning's CPU beat the plain player 18 times out of 18, and smashing turned that into 10 wins out of 10.
- **A design question for the owner:** this is close to a dominant strategy against Expert. Is that intended? (Not a tuning proposal: no tuning so a bot wins.)

### 2. Smash right after you land a hit (its wake window)

- **How:** land any hit (a jab, a tilt, a shot), then smash within about half a second. Otherwise, play normally.
- **Why it works:** when its stun ends, an Expert does nothing for 6 to 10 frames (BRAIN_LV wake). Its counter stance cannot come out for 45 frames (3/4 s) after its own stun ends (ctrHit 45), however much time has passed since its last guess.
- **Measured:** 81% wins against 40%, with 60.8% of the damage. Against the counter fighter in the test (Coiny), its stances hurt the player 0.13 times a match, against 0.8 with the control and 0.8 with plain smash from range. Of 69 smashes timed this way, none were countered. Of 219 smashes thrown in neutral, 5 were.
- **By fighter:** Pen 88%, Coiny 100%, Lightning 63%, Firey Jr. 75%. Against a fighter with no counter, plain smashing from jab range (#1) is better, because you smash more often. Against a counter fighter, time the smashes this way.

### 3. Free-for-all: stay out of the fight and let the CPUs target each other

- **How:** in a three-way FFA with two Expert CPUs, stand at the end of the stage away from the pair. Keep the two CPUs closer to each other than either is to you. Step in only on a CPU that is stunned within about 170 px, or one at 100%+ within about 120 px. Fight normally once one CPU is out.
- **Why it works:** a CPU picks the nearest foe and looks again only every 0.5 to 1 s (target 30 to 60 frames). If its rival is nearer than you, it fights the rival.
- **Measured** (24 matches each): falls dropped from 1.33 to 0.83 a match, and the average place went from 1.79 to 1.50. Wins went from 46% to 54% (a third is par), which is too small a change to be sure of. You deal less of the damage (KOs 0.79 against 1.79), so you survive more and score less.
- **By fighter:** Lightning gained the most (0% to 33% wins). Pen and Coiny were unchanged (67% and 83%), and so was Firey Jr. (33%).

### 4. Edge-guard at the ledge (not proven)

- **How:** while the CPU is off the stage, stand at the ledge on its side facing out. When it comes up within reach, smash it (down-tilt if the smash is cooling down).
- **Why it might work:** an Expert keeps its jump until it is sinking to ledge height (recSmart), so it comes up in the same place every time. CPUs never guard their own ledge either (found earlier).
- **Measured:** 55% wins against 40% (z 1.5), and 50.8% of the damage. But the KO rate per off-stage trip did not rise (8.1% against 7.2%), so the gain may be noise. Pen and Coiny won 80%, Lightning 20%, Firey Jr. 40%.

### Tested and did not work

- **Stop-short whiff bait** (walk in fast, stop just outside its reach, then punish). The rule behind it: the CPU guesses your position from your speed (lead 0.9), so it thinks you kept coming. The bait does work as bait: the CPU swung at the air on 43% of the 227 tries. But the punish landed only 20% of the time, because its whiff is over before a 1/6 s reaction plus a walk-in arrives. No net gain (44%).
- **Chase and smash at kill percent.** The rule behind it: near kill percent it backs off toward the middle and does not attack while it does. It does die sooner (a median of 17 s after reaching 85%, against 30 s), but it backs off so rarely (about 1.5 s a match) that wins did not move (38%).
- **Back off from its hop-in aerial, then punish its landing.** You do not need to dodge it: its aerials miss 92% of the time if you just stand and swing. Stepping back got the player hit on 46% of the tries. Worse (28%).
- **Cross-up hop over it.** The rule behind it: its eyes are 1/6 s late. In practice the CPU's guess from your speed catches up, and 25% of cross-ups got the player hit, against 12% that landed. Worse (28%, 4.3 points less of the damage).

## CPU habits measured on the way (about 25,000 CPU strings)

- **Jab strings are one jab now.** The first jab lands 52% of the time, the second 4% (the jab lock). After its jab hits you, its next jab passes through you and it sits in the 22-frame whiff recovery, so hit back as soon as your stun ends.
- **Its hop-in aerials rarely land.** 8% of 17,151 landed. Most of the CPU's swings are these. Stand your ground and swing.
- **Its other strings:** down-tilt strings land their first hit 35% of the time, up-tilt strings 29%.
- **Whiffs:** it punishes a missed smash 38% of the time and a missed jab or tilt about 20% of the time.

## Files

The scripts and raw results are in the session scratchpad, not the repo:
`C:\Users\carad\AppData\Local\Temp\claude\C--Users-carad--claude\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\tac\`
- `player-src.js`: the scripted player and the measurements.
- `run.mjs`: the runner.
- `an.mjs` and `sum.mjs`: the analysis.
- `r1.jsonl` to `r5.jsonl`: one line per match.

**Update (2026-10-28): the owner's own ledgeguard** (go to the ledge, shoot them while they come back, strong jab if they jump up) was tested on its own in `ledgeguard-test.md`: 50% wins against 36.8% (z 2.3); the shots and the jab work only together; Expert CPUs come back from above the ledge, so few shots can reach them.
