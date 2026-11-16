# Heavies move slower: the results

*2026-10-29. Before = live main (ii-dlc fbc9009). After = g-heavy 90f1d1b, which is fbc9009 plus only the slowdown. The 19 fighters
above weight 100 played the balance pass's 30 matches on both builds: 1,140 matches, 0 errors. Nothing was changed or pushed.*

## The rule being measured

Above weight 100, a fighter's run speed and air drift are both multiplied by **1 - 0.15 x sqrt((weight - 100) / 38)**. Each fighter's own
run and air numbers get the same cut, so who is faster than whom among the heavies stays the same. Jump height, fall speed, damage and
recovery do not change. Fighters at weight 100 or under do not change at all.

| Weight | 101 | 104 | 110 | 120 | 134 | 138 |
|---|---|---|---|---|---|---|
| Slower by | 2.4% | 4.9% | 7.7% | 10.9% | 14.2% | 15% |

**Bow** is 74, so she is not touched. The rule goes only by weight, with no list of names. No prize fighter is above 100.

## How it was played

These are the balance pass's rules: 2 stocks, Hard CPUs on both sides, Goiky Field, items off, sides alternating, a 7,200-frame cap.
- **BFDI 15:** the yardstick's 15 BFDI CPUs, with the win-rate run's seeds. Barf Bag keeps her old launch (8.5) when she is a foe.
- **Mixed 15:** the 8 II foes plus 7 BFDI foes, with the balance pass's seeds.
- **Both builds use the same seeds.** "Before" was re-played on a separate copy of fbc9009's game file. It gives exactly the balance
  pass's numbers where one exists: Bomby 26, Magnet 24, Fern 6, and Eraser 14 (the number from his retune). So the before side is right.
- **The yardstick slows down too.** 4 of the 15 BFDI foes are heavies: Remote (106), David (110), Saw (106) and Gaty (101). None of
  the mixed-pool foes is above 100.
- **Noise:** a 30-match total moves by about 3 to 4 wins on its own. Using the same seeds does not replay the same match once anything
  changes. For example, 12 of David's 30 results flipped.

## Before and after (30 matches each)

| Fighter | Weight | Slower by | Before | After | Change | BFDI 15 | Mixed 15 | Flag |
|---|---|---|---|---|---|---|---|---|
| Tree | 138 | 15% | 24 | 26 | +2 | 13 -> 13 | 11 -> 13 | |
| Roboty | 134 | 14.2% | 12 | 11 | -1 | 5 -> 6 | 7 -> 5 | |
| Bomby | 120 | 10.9% | 26 | 26 | 0 | 12 -> 12 | 14 -> 14 | |
| Magnet | 118 | 10.3% | 24 | **28** | +4 | 12 -> 15 | 12 -> 13 | above 26 (see below) |
| TV | 117 | 10% | 14 | 15 | +1 | 8 -> 8 | 6 -> 7 | |
| Pin | 112 | 8.4% | 9 | 10 | +1 | 5 -> 5 | 4 -> 5 | |
| Bell | 112 | 8.4% | 10 | 12 | +2 | 4 -> 7 | 6 -> 5 | |
| Blocky | 110 | 7.7% | 19 | 18 | -1 | 10 -> 9 | 9 -> 9 | |
| David | 110 | 7.7% | 25 | **21** | -4 | 13 -> 12 | 12 -> 9 | **below 22** |
| Sidewalky | 110 | 7.7% | 18 | 13 | -5 | 9 -> 5 | 9 -> 8 | |
| Baseball | 110 | 7.7% | 14 | 8 | -6 | 7 -> 3 | 7 -> 5 | right at 8 |
| Golf Ball | 108 | 6.9% | 26 | 28 | +2 | 13 -> 14 | 13 -> 14 | |
| Remote | 106 | 6% | 17 | 15 | -2 | 9 -> 6 | 8 -> 9 | |
| Saw | 106 | 6% | 21 | 23 | +2 | 10 -> 10 | 11 -> 13 | |
| Fern | 104 | 4.9% | 6 | 7 | +1 | 5 -> 4 | 1 -> 3 | under 8 before too |
| Eraser | 104 | 4.9% | 14 | 8 | -6 | 7 -> 3 | 7 -> 5 | under his 12+ |
| Basketball | 103 | 4.2% | 8 | **7** | -1 | 5 -> 4 | 3 -> 3 | **below 8** (by 1) |
| MeTag | 102 | 3.4% | 10 | 10 | 0 | 4 -> 6 | 6 -> 4 | |
| Gaty | 101 | 2.4% | 13 | 14 | +1 | 7 -> 8 | 6 -> 6 | |
| **All 19** | | | **310 of 570** | **300 of 570** | **-10** | 158 -> 150 | 152 -> 150 | |

## A second set of 30 for the five who moved most

These five played 30 more matches on both builds with new seeds (base 20261029), to see whether the first moves hold up.

| Fighter | Second 30: before -> after | All 60: before -> after | Per 30 |
|---|---|---|---|
| David | 26 -> 23 | 51 -> 44 | 25.5 -> 22 |
| Eraser | 10 -> 9 | 24 -> 17 | 12 -> 8.5 |
| Baseball | 10 -> 11 | 24 -> 19 | 12 -> 9.5 |
| Sidewalky | 12 -> 14 | 30 -> 27 | 15 -> 13.5 |
| Magnet | 21 -> 23 | 45 -> 51 | 22.5 -> 25.5 |

## Who moved

- **Overall the slowdown hardly changes who wins against CPUs.** The 19 heavies went from 310 to 300 wins out of 570, under 2 points.
  The heaviest fighters, who lose the most speed, did not drop: Tree went +2, Roboty -1, Bomby 0, TV +1.
- **David (strong, needs 22+) dropped to 21 of 30. FLAG.** He dropped on both seed sets (-4, then -3), so this looks real, just small.
  Over 60 matches he averages 22 per 30, right at the floor. He lands fewer of his Shoulder Toss finishers (32 -> 26 KOs), which fits a
  slower walk-in for the grab.
- **Basketball (needs 8+) is 7 of 30. Flagged, but it is a 1-win move.** He was right on the line before (8).
- **Eraser is 8 of 30, down from 14. Not below 8, but below the 12+ his damage retune was set to keep.** His second seed set was 10 -> 9,
  so his 14 was a lucky set. Over 60 matches he is 12 -> 8.5 per 30, about 3.5 wins lower.
- **Baseball 14 -> 8 and Sidewalky 18 -> 13 were mostly noise.** On the second seed set they went up (+1 and +2).
- **Magnet went up, 24 -> 28, which is above the balance pass's 22-26 band.** On the second set she was 21 -> 23. Over 60 she averages
  25.5, still inside the band.
- **Fern is 7, under 8, as she was before (6).** That is not from this change.
- Bomby (26 -> 26) and Magnet are still in the strong band. No one else crossed a band.

## Files

Harness and data:
`C:\Users\carad\AppData\Local\Temp\claude\C--Users-carad--claude\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\heavy\wr\`
(wr3.mjs, sum.mjs, drive.ps1; out\before, out\after = the 30; out2 = the second seed set).
