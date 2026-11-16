# Steve Cobs's prize fighters on the house yardstick

*2026-10-28. Measurement only: nothing in the game was changed, tuned or committed. Build: pz-measure 707feec (the balance pass about to
ship: jab lock, empowered-jab fix, bottom buffs). 3 fighters x 30 matches = 90 matches, 0 errors.*

**How it was played.** These are the balance pass's rules: 2 stocks, Hard CPUs on both sides, Goiky Field with the off-stage room, items
off, sides alternating, and every KO credited to the move that landed it.
- **BFDI 15:** the yardstick's 15 mid-pack CPUs, using the win-rate run's seed rule.
- **Mixed 15:** 8 II foes plus 7 BFDI foes on new seeds, as in the balance pass. Barf Bag keeps her old smash when she is a foe.
- The hidden-until-Cobs-is-beaten gate was opened inside each test copy of the game, as a beaten save would open it. The fighters
  appear here only as A, B and C.
- **Noise:** a 30-match total can be about 2 to 3 wins off. A re-run of A and B replayed all 60 matches exactly.

**What to compare with:** the roster's median is 6/15 per pool (about 12/30), and the strong end is about 11-13/15 per pool. Win-rate run
(older build, BFDI 15) medians: 15.5 KOs and 18 deaths per 15 matches, and the median stock is lost at 128%.

## The table

| | BFDI 15 | Mixed 15 (II / BFDI 7) | **Total /30** | KOs | Deaths (side / top / bottom / other) | Median % at death | Top KO moves |
|---|---|---|---|---|---|---|---|
| Prize fighter A | 3 | 0 (0 / 0) | **3** | 23 | 49 (30 / 11 / 8 / 0) | 107% | shared finisher 9, jab 5, Across the Line (up special) 4, Shattered Again (smash) 2 |
| Prize fighter B | 2 | 3 (2 / 1) | **5** | 18 | 52 (28 / 16 / 7 / 1) | 116% | jab 6, Something Glowing Inside (smash mine) 5, shared finisher 4 |
| Prize fighter C | 7 | 7 (2 / 5) | **14** | 36 | 35 (18 / 10 / 5 / 2) | 132% | Off the Cliff (up special) 14, Drawer Slam (smash) 13, jab 4, On File 3 |

The moves that KO'd them: A was jabbed out 20 times out of 49 deaths, B 19 out of 52 and C 12 out of 35. Across the roster, about a third
of all deaths are jabs.

## Verdicts

**A: at the bottom (3/30).** Measurement is done; the change below is a proposal only.
- **Why:** A has the old default jab (reach 0, about 50 px). Most foes out-reach it: Tennis Ball's is reach 20, about 70 px. A loses
  the jab trade, and 20 of his 49 deaths were jabs.
- **Also:** the CPU pours Juice Spill about 5 times a minute. That leaves him empty for 34% of each match, and empty he takes 25% more
  knockback. 22 of his 49 deaths came while he was empty, and his median stock is lost at 107%, against the roster's 128%. The puddle
  itself scored no KOs.
- **Smallest change (proposed, not applied):** give the spill kit the balance pass's reach-8 default jab row in RANGE_PROFILE. That is
  one line, the same row the 9 bottom fighters got.
- **If that is not enough:** drop the empty glass's extra 25% knockback, and keep the extra 25% damage he deals while empty.

**B: at the bottom (5/30, right on the line).** Measurement is done; the change below is a proposal only.
- **Why:** almost nothing in her kit does damage. Full of Voices does 3% and scrambles controls, Rocket to Mars does 4% and burns, and
  the wrench does 4% and stuns. Only the smash mine and the shared finisher can KO.
- She dealt 117% a match and took 204%. She had the fewest KOs of the three (18) and the most deaths (52), 19 of them to jabs.
- She also has the old reach-0 default jab.
- **Smallest change (proposed, not applied):** the same reach-8 default jab row for the voices kit (one line).

**C: mid-pack (14/30), no change needed.** That is a little above the roster median. Her KOs (36) and deaths (35) are typical. Her two
heavy hits do the work: Off the Cliff (13% plunge) and Drawer Slam (16% lunge). Her weight is 92, second-heaviest in the pack. She
has the reach-0 jab too, but these two moves make up for it.

*Raw rows (fighters shown by letter only): the session scratchpad, pzmeasure\A.jsonl, B.jsonl, C.jsonl (Ax/Bx are the instrumented
re-runs).*

## After the reach-8 jab

*2026-10-28. Build: g-pz-jab d8d6b42, which is live main fbc9009 plus the two jab rows: the spill kit and the voices kit get the
reach-8 default jab. The same 30 matches per fighter as above, with the same seeds, sides and rules. 120 matches, 0 errors.
Measurement only: nothing else was changed.*

**Control.** The same build was also played with the two new rows cut out in memory. Both fighters replayed the first
measurement's 60 matches exactly (30 of 30 each). So the newer main changed nothing for them, and every difference below comes from
the jab alone.

| | BFDI 15 | Mixed 15 (II / BFDI 7) | **Total /30** | KOs | Deaths (side / top / bottom / other) | Median % at death | Jab deaths | Top KO moves |
|---|---|---|---|---|---|---|---|---|
| A before | 3 | 0 (0 / 0) | **3** | 23 | 49 (30 / 11 / 8 / 0) | 107% | 20 | shared finisher 9, jab 5, Across the Line 4 |
| **A after** | 2 | 0 (0 / 0) | **2** | 20 | 50 (29 / 12 / 9 / 0) | 113% | 25 | shared finisher 10, jab 4, Across the Line 3 |
| B before | 2 | 3 (2 / 1) | **5** | 18 | 52 (28 / 16 / 7 / 1) | 116% | 19 | jab 6, Something Glowing Inside 5, shared finisher 4 |
| **B after** | 2 | 2 (2 / 0) | **4** | 18 | 44 (25 / 15 / 4 / 0) | 122% | 17 | shared finisher 11, Something Glowing Inside 3, jab 1 |

**What changed: almost nothing.** Each lost one win, and a 30-match total has 2 to 3 wins of noise.
- **A:** the longer jab did not win him the jab trades. He was jabbed out 25 times out of 50 deaths (20 of 49 before), and his own
  jab KOs went from 5 to 4.
- **B:** she lives a little longer: 44 deaths (52 before), and her median stock is lost at 122% (116% before). 13 of her 30
  matches ran to the time cap (7 before), but she won only 2 of them. Her jab KOs fell from 6 to 1. She dealt 142% a match and took
  217% (117% and 204% before).

**Verdict: both are still at 5 or fewer.** Both stay at the bottom, under the buffed fighters' band of 8-16 and the roster median of
about 12/30.

**A's next smallest step (proposed, not applied):** the idea from above. Drop the empty glass's extra 25% knockback (one line in
applyHit) and keep the extra 25% damage he deals while empty. One caution from this run: he is still empty 34% of each match, but
now 18 of his 50 deaths came while empty (36%). That is about his share of the time, where before it was 22 of 49 (45%). So the extra
knockback may matter less than the first measurement suggested.

**B's next smallest step (proposed, not applied):** her trouble is now damage, not staying alive. The smallest one-number change is
Full of Voices 3% -> 5% (the jab's damage), keeping its control scramble. Another option is a bigger launch on Rocket to Mars's
second hit (6 now), which would give her a KO off the top. The owner picks.

Either step can be measured in memory first (30 matches, about 4 minutes) before anything is changed in the game.

*Raw rows (fighters shown by letter only): the session scratchpad, pzjab\Aj.jsonl and Bj.jsonl (after), A0.jsonl and B0.jsonl (the
control). Script: pzjab\pz.mjs.*

## After step 2

*2026-10-28. Build: g-pz-jab f41898c. That is the reach-8 jab build above (the jab rows kept) plus step 2: A's empty glass now flies
10% further when hit (it was 25%), and he still deals 25% more damage while empty; B's Full of Voices does 5% (it was 3%), with the
same control scramble. The same 30 matches per fighter as above, with the same seeds, sides and rules. 60 matches, 0 errors.
Measurement only: nothing else was changed.*

| | BFDI 15 | Mixed 15 (II / BFDI 7) | **Total /30** | KOs | Deaths (side / top / bottom / other) | Median % at death | Jab deaths | Dealt / taken a match | Top KO moves |
|---|---|---|---|---|---|---|---|---|---|
| A after the jab | 2 | 0 (0 / 0) | **2** | 20 | 50 (29 / 12 / 9 / 0) | 113% | 25 | 136% / 198% | shared finisher 10, jab 4, Across the Line 3 |
| **A after step 2** | 3 | 0 (0 / 0) | **3** | 25 | 46 (28 / 9 / 6 / 3) | 106% | 21 | 160% / 193% | shared finisher 15, Across the Line 4, Shattered Again 2, jab 2 |
| B after the jab | 2 | 2 (2 / 0) | **4** | 18 | 44 (25 / 15 / 4 / 0) | 122% | 17 | 142% / 217% | shared finisher 11, Something Glowing Inside 3, jab 1 |
| **B after step 2** | 3 | 4 (1 / 3) | **7** | 25 | 42 (24 / 12 / 6 / 0) | 129% | 14 | 154% / 207% | shared finisher 15, Something Glowing Inside 6, Full of Voices 2 |

The history so far: A 3 -> 2 -> 3, B 5 -> 4 -> 7. The 3 "other" deaths for A are two foe finishers and one smash that the line
check did not place. None of the 60 matches replayed step 1 exactly, as expected: both changes alter every match. So no single
match's flip can be pinned on the change.

**What changed:**
- **A: one more win (2 -> 3), inside the 2-3 win noise.** He deals more (160% a match, 136% before) and has 5 more KOs, 15 of them
  the shared finisher. 13 of his 30 matches ran to the time cap (8 before), but he won only 2 of them. He still dies early: his median
  stock is lost at 106%, against the roster's 128%. He is still empty for 35% of each match, and 15 of his 46 deaths came while
  empty (33%). That is now exactly his share of the time, so the empty glass no longer costs him extra deaths. His jab still loses
  the trades: 21 of 46 deaths were jabs, and his own jab scored 2 KOs.
- **B: three more wins (4 -> 7), a little more than the noise.** She has 7 more KOs, 4 more from the shared finisher and 3 more
  from the smash mine. Full of Voices itself scored 2. She lives a little longer too: 42 deaths, and her median stock is lost at 129%
  (122% before). Her damage gap is smaller, 154% dealt against 207% taken (142% and 217% before). Most of her new wins came in
  the mixed pool (4, 3 of them against BFDI foes).

**Verdict:** B is off the bottom at 7/30. That is above the line of 5, but still under the buffed fighters' band of 8-16 and the
roster median of about 12/30. A is still at the bottom at 3/30.

**A's next smallest step (proposed, not applied):** weight 74 -> 80, one number in his roster row. His trouble is now dying early,
not the empty glass. Weight divides the knockback of every hit (100/w): at 74 he flies 1.35 times as far, and at 80 1.25 times.
That is about 7% less from every hit, jabs included. 80 is still under the roster's median weight of 84, so his "light, but no
featherweight" note still holds. Other options are weaker. Cutting the empty glass's last 10% should do little, because his deaths
while empty already match his time spent empty. A jab longer than reach 8 would split him from the row the bottom fighters share.
The owner picks. It can be measured in memory first (30 matches, about 5 minutes).

**B:** nothing is proposed, since she is above 5. If the owner wants her inside the 8-16 band, the earlier idea still stands: a
bigger launch on Rocket to Mars's second hit, which would give her a KO off the top.

*Raw rows (fighters shown by letter only): the session scratchpad, pzjab2\A2.jsonl and B2.jsonl. Script: pzjab2\pz.mjs, a copy
of pzjab\pz.mjs with only its header note changed.*

## After step 3 (A's weight)

*2026-10-29. Build: g-pz-jab 3cdea41. That is the step 2 build above plus step 3: A's weight is now 80 (it was 74). Weight
divides the knockback of every hit he takes (100/w), so he now flies 1.25 times as far instead of 1.35 times. That is about 7.5%
less from every hit. A check in memory with a Pen jab showed that drop (7.2% to 7.4% less launch speed). The same 30 matches as
above, with the same seeds, sides and rules. 30 matches, 0 errors. Measurement only: nothing else was changed. B was not
re-measured, since nothing of hers changed.*

| | BFDI 15 | Mixed 15 (II / BFDI 7) | **Total /30** | KOs | Deaths (side / top / bottom / other) | Median % at death | Jab deaths | Dealt / taken a match | Top KO moves |
|---|---|---|---|---|---|---|---|---|---|
| A after step 2 | 3 | 0 (0 / 0) | **3** | 25 | 46 (28 / 9 / 6 / 3) | 106% | 21 | 160% / 193% | shared finisher 15, Across the Line 4, Shattered Again 2, jab 2 |
| **A after step 3** | 2 | 4 (2 / 2) | **6** | 25 | 43 (21 / 15 / 7 / 0) | 131% | 18 | 161% / 205% | shared finisher 11, Across the Line 7, Shattered Again 3, jab 2 |

The history so far: A 3 -> 2 -> 3 -> 6. One more match was a draw at the time cap. None of the 30 matches replayed step 2
exactly, as expected: the weight changes every match. 8 results flipped: 5 losses became wins and 1 became a draw, and 2 wins
became losses. So no single match's flip can be pinned on the change.

**What changed:**
- **Three more wins (3 -> 6), just past the 2-3 win noise.** All of the gain came in the mixed pool, where he had not won a match
  in any earlier run: 4 wins now (2 against II foes, 2 against BFDI foes). In the BFDI pool he went from 3 to 2.
- **He lives longer, which is what the change was for.** His median stock is now lost at 131% (106% before), just above the
  roster's 128%. That jump is bigger than 7.5% less launch would give on its own, so part of it is noise. He died 43 times (46
  before), and 18 of those were jabs (21 before).
- **His wins are close ones.** 14 of his 30 matches ran to the time cap (13 before), and 4 of his 6 wins came there, decided on
  stocks or damage. He still takes more than he deals: 161% dealt against 205% taken a match (160% and 193% before). He takes
  more now partly because each stock lasts longer. He is empty for 36% of each match, and 18 of his 43 deaths came while empty
  (42%). That is a little more than his share of the time, where after step 2 it matched.

**Verdict:** A is off the bottom at 6/30. That is above the line of 5, next to B's 7/30, but still under the buffed fighters'
band of 8-16 and the roster median of about 12/30. The jab trades are still his weak spot: 18 of his 43 deaths were jabs, and his
own jab scored 2 KOs.

**A:** nothing is proposed, since he is above 5. If the owner wants him inside the 8-16 band, the one-number option left from step
2 is cutting the empty glass's last 10% extra knockback. This run puts his deaths while empty a little above his time empty, so it
may help a bit more than step 2 suggested, but the effect would be small.

*Raw rows (fighters shown by letter only): the session scratchpad, pzjab3\A3.jsonl. Script: pzjab3\pz.mjs, a copy of
pzjab\pz.mjs with only its header note changed.*
