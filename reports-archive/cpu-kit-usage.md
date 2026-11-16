# CPU kit use: which fighters the Expert CPU plays with their whole kit

*2026-10-29. Build measured: live main fbc9009. 424 matches, 0 errors. Measurement only: nothing in the game was changed. Steve Cobs's prize fighters are listed as prize fighter A, B and C.*

**The question.** Watching Expert CPU World Cups, the owner said: *"toothpaste uses her full kit more than any other fighter I have seen, save for maybe bot, who uses the up special, neutral special, and smash decently regularily"*.

## Short answer

- **Confirmed for Toothpaste.** She is **#2 of 106** on the kit score and **#1** on special moves. She is one of only 5 fighters whose CPU uses all five special moves (neutral special, up special, down special, smash and finisher) at least once a match: Toothpaste, Gelatin, Golf Ball, Pencil, Lollipop. Her down special (Root Trap) is #3 and her finisher (Squeeze Rocket) #3 of their kind in the whole roster, and her smash #5.
- **Bot is right too, in exactly the way the owner put it.** Overall he is only #41, but he is one of only 6 fighters that use the up special, the neutral special *and* the smash each at least once a match (Toothpaste, Gelatin, Golf Ball, Pencil, Lollipop, Bot); his smash is #8 of 106. The rest of his kit is not used at all: his down special (Gotcha!) was pressed 0 times in 4 matches and his finisher 2 times.
- **Why.** The CPU's move reader only knows a few kinds of move: a shot, a trap, a heal, a stance (counter or brace), and a finisher with a "read" of its own. Moves outside those kinds are pressed rarely or never. The biggest gap: **56 of 106 down specials are none of trap, heal or stance, and the CPU never presses them** (the one exception, Eraser, has a rule of its own). The up special is only ever used to get back or to climb toward a foe, never chosen as an attack. Toothpaste's kit happens to sit entirely inside the kinds the CPU knows; Bot's neutral special, up special and smash do, and his down special and finisher do not.
- **Do full-kit fighters win more?** A little. Across the 102 fighters in the win-rate run, the kit score goes with the win rate at a rank correlation of **+0.32**, the special-move score at **+0.40** and the number of special-move uses a match at **+0.47** (0 is no link, 1 a perfect one). Real, but weak: Bomby, Magnet, Ruler and Woody win a lot with narrow kits, and Snowball, Box and Lifering use a wide kit and still lose.

## How it was measured

- **Matches:** every playable fighter (106, the three prize fighters included), Expert CPU against Expert CPU, through the World Cup's own match code with knockout rules (3 stocks, items off), on the cup's random stages. To keep it quick each match stopped after 120 seconds of game time (286 of 424 did; the average match ran 104 s). Each fighter played 4 matches against 4 different mid-pack foes from the win-rate report (Pen, Tennis Ball, Fanny, Firey Jr., Lightning, Paintbrush, Gelatin, Ice Cube; a fighter never met itself).
- **What was counted:** the game's own move functions were watched (no game code changed). Every move that actually started counts as a **press**. Every hit that dealt damage was credited to the move that made it: a shot or a trap carries the move that fired it, a finisher's lingering things (puddles, fuses, rockets) count for the finisher, and anything else counts for the fighter's last move if that was under 2.5 s ago. A press that hit at least once is a **landed** press.
- **Kit slots (10):** jab, low sweep (down + X), up-tilt, aerials, neutral special, up special, down special, smash, grab + throw, finisher. Side specials and side tilts are switched off in the game, and the Final Smash needs items.
- **A "use"** is a landed press, because the CPU presses some moves a lot without aiming them at anyone (the up special to climb, an aerial while jumping). For a move that is not meant to hit (a counter, a brace, a heal, a buff, a shield), a press counts as a use. So does a press of a special move the CPU pressed at least once a match that never dealt damage in its 4 matches: it is either a control move (Marker's outline roots, Pen's slick only slides) or one the CPU fires and always misses (Taco's Griddle Flip), and either way the CPU is using it.
- **Kit score (of 10):** each slot scores 1 if it is used at least once a match on average, part of 1 if less (one use in 4 matches = 0.25). **Special moves (of 5):** the same for the neutral special, up special, down special, smash and finisher. **Even-ness:** how evenly the uses are spread, as "the number of equally used moves this is worth" (1 = one move only; 10 = all ten equally). Ties in the kit score are ordered by even-ness.
- **Noise:** 4 matches is a small sample. A slot near the 1-a-match line can easily read 0.75 or 1.25 on another run, so ranks a few places apart mean little. The big gaps (a move used 10 times a match against one never pressed) are solid.

## Top 10 and bottom 10

| | Fighter | Kit score | Special moves | Even-ness | Win % (win-rate run) |
|---|---|---:|---:|---:|---:|
| #1 | Gaty | 8.75 | 4.00 | 6.6 | 73% |
| #2 | Toothpaste | 8.75 | 5.00 | 6.3 | 93% |
| #3 | Snowball | 8.75 | 4.50 | 6.3 | 7% |
| #4 | Lightning | 8.75 | 4.75 | 5.8 | 53% |
| #5 | Gelatin | 8.50 | 5.00 | 7.2 | 47% |
| #6 | Golf Ball | 8.50 | 5.00 | 6.9 | 80% |
| #7 | Pencil | 8.50 | 5.00 | 6.8 | 73% |
| #8 | Firey Jr. | 8.50 | 4.25 | 6.4 | 53% |
| #9 | Nickel | 8.50 | 4.25 | 6.3 | 40% |
| #10 | Donut | 8.50 | 4.50 | 5.9 | 67% |
| #97 | Jack | 5.25 | 2.25 | 4.1 | 33% |
| #98 | Soap | 5.25 | 1.75 | 4.0 | 40% |
| #99 | Tapey | 5.25 | 2.00 | 4.0 | 27% |
| #100 | Ruler | 5.25 | 3.25 | 3.4 | 87% |
| #101 | Poppy | 5.00 | 2.25 | 4.3 | 33% |
| #102 | Bomby | 5.00 | 2.75 | 4.1 | 100% |
| #103 | Woody | 4.75 | 2.25 | 3.6 | 67% |
| #104 | Marshmallow | 4.50 | 1.50 | 4.2 | 33% |
| #105 | Starfruit | 4.50 | 1.25 | 3.7 | 13% |
| #106 | Trophy | 4.50 | 1.50 | 3.5 | 13% |

Toothpaste: **#2** (kit 8.75, special moves 5.00, special-move uses per match 19.5: #6 by volume). Bot: **#41** (kit 7.25, special moves 3.50).

## Every fighter, ranked

Uses per match (average of 4). "0" means never used in 4 matches. The win % is from the win-rate run (winrates.md, 2026-10-28, before the balance pass); the four fighters marked "not in run" were not in it.

| Rank | Fighter | Kit score (of 10) | Special moves (of 5) | Even-ness | Jab | Low sweep | Up-tilt | Aerials | Neutral special | Up special | Down special | Smash | Grab + throw | Finisher | Win % |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | Gaty | 8.75 | 4.00 | 6.6 | 8.5 | 1.2 | 1.0 | 4.5 | 1.5 | 3.8 | 1.8 | 0.8 | 0.8 | 0.2 | 73% |
| 2 | Toothpaste | 8.75 | 5.00 | 6.3 | 10.5 | 1.5 | 0.5 | 3.2 | 1.0 | 1.8 | 5.8 | 1.5 | 0.2 | 9.5 | 93% |
| 3 | Snowball | 8.75 | 4.50 | 6.3 | 9.2 | 1.0 | 1.2 | 1.2 | 3.5 | 0.8 | 4.8 | 0.8 | 0.2 | 1.5 | 7% |
| 4 | Lightning | 8.75 | 4.75 | 5.8 | 8.8 | 0.8 | 1.5 | 3.5 | 12.8 | 1.0 | 1.8 | 0.8 | 0.2 | 2.8 | 53% |
| 5 | Gelatin | 8.50 | 5.00 | 7.2 | 9.2 | 2.5 | 0.2 | 5.0 | 5.2 | 1.0 | 3.0 | 2.5 | 0.2 | 5.2 | 47% |
| 6 | Golf Ball | 8.50 | 5.00 | 6.9 | 8.2 | 1.8 | 0.5 | 3.2 | 6.2 | 7.5 | 1.2 | 1.8 | 0 | 2.8 | 80% |
| 7 | Pencil | 8.50 | 5.00 | 6.8 | 6.5 | 2.0 | 0 | 1.5 | 1.0 | 1.2 | 3.0 | 1.0 | 0.5 | 5.0 | 73% |
| 8 | Firey Jr. | 8.50 | 4.25 | 6.4 | 7.2 | 1.0 | 0.8 | 3.0 | 6.8 | 0.5 | 1.0 | 0.8 | 0.5 | 2.5 | 53% |
| 9 | Nickel | 8.50 | 4.25 | 6.3 | 7.8 | 0.8 | 0.8 | 3.0 | 1.0 | 8.2 | 2.0 | 0.2 | 0.8 | 2.2 | 40% |
| 10 | Donut | 8.50 | 4.50 | 5.9 | 10.5 | 1.5 | 0.5 | 1.8 | 1.5 | 8.2 | 4.8 | 0.5 | 0.5 | 1.0 | 67% |
| 11 | Lollipop | 8.50 | 5.00 | 5.8 | 10.5 | 1.2 | 0.5 | 4.0 | 5.5 | 12.2 | 1.5 | 1.5 | 0 | 1.0 | 87% |
| 12 | Box | 8.25 | 3.75 | 5.5 | 12.2 | 1.0 | 1.0 | 3.2 | 2.8 | 0 | 4.5 | 1.2 | 0.5 | 0.8 | 7% |
| 13 | Marker | 8.25 | 4.00 | 4.9 | 13.8 | 1.2 | 1.0 | 2.2 | 1.5 | 0.5 | 2.5 | 0.5 | 0.2 | 12.8 | 40% |
| 14 | Pen | 8.00 | 4.75 | 6.5 | 11.0 | 1.5 | 0 | 5.0 | 8.0 | 4.5 | 5.0 | 0.8 | 0.2 | 2.0 | 47% |
| 15 | Match | 8.00 | 3.50 | 6.1 | 8.8 | 1.0 | 1.2 | 2.8 | 5.8 | 3.5 | 1.2 | 0 | 0.5 | 0.5 | 93% |
| 16 | Pickle | 7.75 | 3.75 | 6.7 | 7.8 | 2.2 | 0.5 | 4.2 | 2.2 | 0.5 | 4.0 | 2.0 | 0.5 | 0.2 | 53% |
| 17 | Grassy | 7.75 | 4.50 | 6.6 | 5.2 | 1.5 | 0.2 | 5.2 | 3.2 | 7.5 | 2.8 | 0.5 | 0 | 1.5 | 60% |
| 18 | Firey | 7.75 | 4.50 | 6.3 | 7.8 | 0.8 | 0.2 | 2.5 | 4.8 | 6.8 | 2.8 | 0.5 | 0.2 | 1.0 | 100% |
| 19 | Goo | 7.75 | 4.25 | 6.1 | 8.2 | 0.5 | 0.5 | 2.2 | 1.8 | 0.2 | 4.0 | 1.5 | 0.5 | 1.0 | 0% |
| 20 | Money | 7.75 | 3.50 | 5.8 | 12.8 | 1.5 | 1.0 | 4.0 | 4.8 | 6.2 | 0 | 0.5 | 0.2 | 3.0 | 40% |
| 21 | Bonesaw | 7.75 | 3.75 | 5.7 | 9.0 | 0.8 | 0.5 | 4.5 | 1.5 | 5.2 | 0 | 0.8 | 0.8 | 1.2 | 60% |
| 22 | Lifering | 7.75 | 4.00 | 5.4 | 10.0 | 0.5 | 0.8 | 2.5 | 1.0 | 0.2 | 1.8 | 0.8 | 0.5 | 2.2 | 7% |
| 23 | Naily | 7.50 | 4.00 | 6.4 | 7.8 | 0.8 | 0.8 | 5.0 | 4.5 | 2.5 | 3.0 | 0 | 0 | 2.2 | 80% |
| 24 | prize fighter C | 7.50 | 3.50 | 6.2 | 7.2 | 3.0 | 5.0 | 6.5 | 0.2 | 2.8 | 0.2 | 1.0 | 0 | 1.2 | not in run |
| 25 | Roboty | 7.50 | 4.00 | 6.0 | 8.2 | 2.2 | 0.2 | 2.0 | 2.2 | 0.8 | 2.8 | 1.0 | 0.2 | 0.2 | 27% |
| 26 | Rose | 7.50 | 4.00 | 6.0 | 10.2 | 1.2 | 0 | 3.5 | 5.2 | 0.8 | 4.0 | 0.2 | 0.5 | 7.2 | 40% |
| 27 | Fries | 7.50 | 4.25 | 6.0 | 9.5 | 1.8 | 0 | 4.0 | 7.2 | 1.2 | 2.2 | 0.2 | 0.2 | 3.0 | 60% |
| 28 | Tree | 7.50 | 4.50 | 5.8 | 9.5 | 0.5 | 0.2 | 3.5 | 2.2 | 7.2 | 2.0 | 0.5 | 0.2 | 1.5 | 67% |
| 29 | David | 7.50 | 3.25 | 5.8 | 7.8 | 1.2 | 1.2 | 2.0 | 2.2 | 0 | 1.8 | 0.2 | 0.2 | 6.8 | 87% |
| 30 | Balloony | 7.50 | 3.25 | 5.8 | 5.2 | 2.2 | 1.2 | 5.0 | 0.8 | 10.2 | 0 | 0.5 | 0.2 | 9.5 | 73% |
| 31 | Bubble | 7.50 | 3.75 | 5.7 | 8.2 | 1.0 | 0.8 | 3.0 | 6.0 | 10.0 | 0 | 0.8 | 0 | 3.5 | 73% |
| 32 | Saw | 7.50 | 3.00 | 5.6 | 8.8 | 1.5 | 1.2 | 3.2 | 2.8 | 0.5 | 0 | 0.5 | 0.5 | 1.0 | 73% |
| 33 | Ruby | 7.50 | 4.25 | 4.6 | 18.2 | 1.0 | 0 | 7.0 | 8.0 | 0.2 | 2.2 | 1.8 | 0.2 | 1.0 | 73% |
| 34 | Fern | 7.50 | 3.25 | 4.5 | 13.0 | 1.2 | 1.0 | 2.0 | 1.0 | 0 | 3.0 | 0.2 | 0.2 | 1.5 | 13% |
| 35 | Cake | 7.25 | 3.50 | 6.2 | 6.2 | 0.8 | 0.8 | 2.2 | 0.8 | 0.5 | 4.5 | 0.2 | 0.2 | 3.2 | 80% |
| 36 | Basketball | 7.25 | 3.75 | 6.2 | 6.8 | 1.0 | 0.2 | 1.5 | 4.5 | 0.2 | 2.2 | 0.5 | 0.2 | 4.0 | 27% |
| 37 | Sidewalky | 7.25 | 4.00 | 6.1 | 8.2 | 0.8 | 0 | 5.0 | 0.5 | 5.8 | 3.0 | 0.5 | 0.5 | 3.2 | 47% |
| 38 | Dora | 7.25 | 3.00 | 6.0 | 7.0 | 1.2 | 0.5 | 3.0 | 2.0 | 0.2 | 0 | 0.8 | 0.8 | 3.2 | 73% |
| 39 | Book | 7.25 | 4.00 | 6.0 | 7.0 | 0.8 | 0.2 | 4.2 | 5.8 | 0.2 | 4.2 | 0.8 | 0.2 | 1.0 | 33% |
| 40 | Cherries | 7.25 | 3.25 | 5.2 | 10.0 | 0.8 | 1.0 | 3.0 | 1.5 | 0.5 | 6.0 | 0.2 | 0.2 | 0.5 | 20% |
| 41 | Bot | 7.25 | 3.50 | 4.9 | 12.5 | 1.2 | 0.2 | 2.5 | 3.8 | 2.0 | 0 | 1.5 | 0.5 | 0.5 | 33% |
| 42 | Baseball | 7.25 | 3.50 | 4.7 | 12.2 | 0.8 | 1.0 | 2.2 | 4.2 | 0.5 | 0 | 1.2 | 0 | 2.2 | 40% |
| 43 | Teardrop | 7.00 | 3.25 | 6.4 | 4.5 | 0.8 | 0.8 | 3.0 | 0.5 | 0 | 2.2 | 0.8 | 0.2 | 1.0 | 7% |
| 44 | Rocky | 7.00 | 4.00 | 6.0 | 7.8 | 1.5 | 0 | 3.2 | 8.0 | 10.5 | 3.0 | 0 | 0 | 9.8 | 60% |
| 45 | prize fighter A | 7.00 | 2.50 | 5.8 | 8.5 | 2.0 | 5.0 | 5.8 | 3.0 | 0.5 | 0 | 0.5 | 0.5 | 0.5 | not in run |
| 46 | Eraser | 7.00 | 3.00 | 5.8 | 8.5 | 2.2 | 0.5 | 2.8 | 2.5 | 0 | 3.2 | 0.8 | 0.5 | 0.2 | not in run |
| 47 | Coiny | 7.00 | 3.00 | 5.7 | 8.2 | 2.5 | 0.5 | 3.5 | 0.8 | 0.2 | 3.2 | 0.8 | 0.5 | 0.2 | 27% |
| 48 | Ice Cube | 7.00 | 3.50 | 5.5 | 9.2 | 1.0 | 0.2 | 4.0 | 6.2 | 0.2 | 3.2 | 0.5 | 0.2 | 0.8 | 47% |
| 49 | Flower | 7.00 | 3.50 | 4.8 | 8.2 | 1.2 | 0.5 | 3.0 | 0.5 | 10.5 | 0 | 1.2 | 0 | 1.5 | 33% |
| 50 | Fanny | 7.00 | 3.50 | 3.9 | 23.2 | 1.0 | 0 | 3.2 | 4.8 | 7.0 | 0 | 0.8 | 0.5 | 0.8 | 53% |
| 51 | prize fighter B | 6.75 | 2.25 | 5.8 | 4.8 | 2.8 | 6.5 | 6.0 | 0.8 | 0 | 7.0 | 0.5 | 0.5 | 0 | not in run |
| 52 | TV | 6.75 | 3.50 | 5.4 | 7.2 | 1.2 | 0.2 | 1.5 | 0.8 | 4.0 | 0 | 0.8 | 0 | 5.0 | 53% |
| 53 | Needle | 6.75 | 3.75 | 5.2 | 10.5 | 0.5 | 0.2 | 1.8 | 4.2 | 0 | 4.0 | 0.8 | 0.2 | 2.5 | 33% |
| 54 | Cheesy | 6.75 | 2.25 | 5.0 | 10.0 | 2.0 | 1.5 | 3.2 | 0.8 | 0 | 0 | 0.5 | 0.5 | 2.8 | 27% |
| 55 | Spikey | 6.75 | 3.25 | 4.8 | 7.5 | 0.8 | 0.8 | 3.5 | 4.0 | 12.5 | 0 | 0.5 | 0 | 0.8 | 47% |
| 56 | Microphone | 6.75 | 2.75 | 4.7 | 10.0 | 1.0 | 0.8 | 3.2 | 1.5 | 1.2 | 0.2 | 0.2 | 0.2 | 0.2 | 40% |
| 57 | Leafy | 6.50 | 3.50 | 5.4 | 7.5 | 0.5 | 0.2 | 2.2 | 4.2 | 0 | 4.2 | 0.5 | 0.2 | 1.0 | 20% |
| 58 | Dough | 6.50 | 2.25 | 5.0 | 8.8 | 1.2 | 2.0 | 2.5 | 2.5 | 0 | 0 | 0.5 | 0.2 | 0.8 | 33% |
| 59 | Blueberry | 6.50 | 2.50 | 4.9 | 7.8 | 0.8 | 0.8 | 6.5 | 2.0 | 0 | 0 | 0.5 | 0.5 | 1.5 | 60% |
| 60 | Silver Spoon | 6.50 | 1.75 | 4.8 | 7.8 | 1.5 | 0.8 | 1.0 | 1.8 | 0 | 0 | 0.5 | 1.8 | 0.2 | 53% |
| 61 | Test Tube | 6.50 | 3.00 | 4.8 | 6.5 | 0.5 | 0.5 | 5.5 | 0.8 | 9.8 | 0 | 0.2 | 0.5 | 1.0 | 53% |
| 62 | Remote | 6.50 | 3.25 | 4.7 | 9.2 | 0.5 | 0.8 | 2.5 | 9.5 | 2.5 | 0 | 0.5 | 0 | 0.8 | 73% |
| 63 | Pin | 6.50 | 3.25 | 4.4 | 11.0 | 1.0 | 0 | 5.8 | 0.5 | 0 | 2.8 | 0.8 | 0.2 | 1.2 | 40% |
| 64 | Bow | 6.50 | 2.00 | 3.9 | 11.5 | 1.0 | 0.5 | 2.2 | 1.8 | 0 | 0 | 0 | 1.0 | 1.2 | 0% |
| 65 | Bomb | 6.25 | 2.25 | 4.9 | 10.0 | 1.8 | 0.8 | 2.2 | 3.5 | 6.8 | 0 | 0 | 0.2 | 0.2 | 33% |
| 66 | Paintbrush | 6.25 | 2.25 | 4.8 | 8.2 | 0.5 | 0.8 | 2.0 | 0.2 | 0.5 | 0 | 0.5 | 0.8 | 3.0 | 47% |
| 67 | Salt | 6.25 | 2.25 | 4.4 | 13.0 | 1.2 | 2.0 | 4.5 | 1.5 | 0 | 0 | 0.2 | 0 | 5.0 | 33% |
| 68 | Lightbulb | 6.25 | 2.75 | 4.3 | 9.8 | 1.0 | 0.2 | 2.8 | 0.8 | 10.2 | 0 | 0 | 0.2 | 1.8 | 13% |
| 69 | Apple | 6.25 | 2.75 | 4.1 | 12.2 | 1.0 | 0.2 | 3.0 | 2.0 | 0.2 | 0 | 0.5 | 0.2 | 2.0 | 20% |
| 70 | Teddy Bear | 6.00 | 3.00 | 4.5 | 3.5 | 1.2 | 0 | 2.2 | 1.0 | 8.0 | 0 | 0.8 | 0 | 0.2 | 20% |
| 71 | Bell | 6.00 | 3.25 | 4.5 | 10.0 | 0.2 | 0.5 | 2.5 | 5.2 | 11.0 | 0 | 0.8 | 0 | 0.5 | 47% |
| 72 | Tennis Ball | 6.00 | 3.25 | 4.5 | 13.2 | 0.5 | 0.2 | 3.2 | 5.8 | 4.5 | 0 | 0.8 | 0 | 0.5 | 53% |
| 73 | Taco (II) | 6.00 | 2.00 | 4.2 | 8.8 | 1.0 | 0.8 | 5.2 | 0.8 | 0.2 | 0 | 0.8 | 0.2 | 0.2 | 20% |
| 74 | Balloon | 5.75 | 2.00 | 5.1 | 4.5 | 1.0 | 0.5 | 3.5 | 1.2 | 0 | 0 | 0 | 0.2 | 1.8 | 7% |
| 75 | Taco | 5.75 | 3.25 | 4.9 | 7.5 | 0 | 0.5 | 3.0 | 5.5 | 0 | 2.8 | 0.2 | 0 | 1.5 | 87% |
| 76 | Candle | 5.75 | 2.00 | 4.9 | 8.2 | 1.2 | 0.5 | 3.8 | 4.5 | 0 | 0 | 0 | 0.2 | 3.8 | 20% |
| 77 | Blocky | 5.75 | 3.50 | 4.8 | 6.0 | 0.2 | 0 | 4.5 | 1.0 | 0.2 | 4.2 | 0.2 | 0 | 1.0 | 60% |
| 78 | Barf Bag | 5.75 | 2.00 | 4.7 | 7.0 | 1.5 | 0.2 | 3.8 | 0.2 | 0.2 | 0.8 | 0.8 | 0.5 | 0 | 20% |
| 79 | MeTag | 5.75 | 1.50 | 4.7 | 7.0 | 1.5 | 1.2 | 2.5 | 2.0 | 0 | 0 | 0 | 0.2 | 0.5 | 47% |
| 80 | Bracelety | 5.75 | 3.00 | 4.5 | 10.8 | 0.2 | 0.5 | 3.8 | 9.5 | 3.2 | 0 | 0.5 | 0 | 0.5 | 40% |
| 81 | Magnet | 5.75 | 1.75 | 4.4 | 7.2 | 0.8 | 0.8 | 2.0 | 1.2 | 0.5 | 0 | 0.2 | 0.5 | 0 | 87% |
| 82 | Knife | 5.75 | 2.50 | 4.4 | 9.2 | 0.5 | 0.2 | 2.8 | 4.2 | 0 | 0 | 1.2 | 0.5 | 0.5 | 13% |
| 83 | Cammy | 5.75 | 2.00 | 4.3 | 7.8 | 2.5 | 0.8 | 2.2 | 0.2 | 0 | 0 | 1.0 | 0 | 0.8 | 13% |
| 84 | Profily | 5.75 | 2.75 | 4.3 | 10.0 | 0.2 | 0.2 | 1.8 | 5.5 | 0.2 | 0 | 0.5 | 0.5 | 1.5 | 40% |
| 85 | Fan | 5.75 | 2.75 | 4.0 | 8.8 | 1.2 | 0 | 1.0 | 2.2 | 0 | 2.2 | 0 | 0 | 0.8 | 53% |
| 86 | Clover | 5.75 | 2.50 | 3.9 | 14.8 | 0.5 | 0 | 2.8 | 2.8 | 0 | 4.5 | 0 | 0.8 | 0.5 | 13% |
| 87 | Yin-Yang | 5.75 | 2.25 | 3.8 | 11.5 | 1.0 | 0.2 | 3.5 | 2.0 | 0 | 0 | 0.8 | 0.2 | 0.5 | 7% |
| 88 | Tissues | 5.75 | 3.00 | 3.8 | 9.2 | 0.8 | 0 | 2.0 | 1.2 | 0.8 | 0 | 0.5 | 0 | 0.8 | 7% |
| 89 | Liy | 5.75 | 2.25 | 3.6 | 16.2 | 2.0 | 0.5 | 2.5 | 7.0 | 0 | 0 | 0.2 | 0 | 1.0 | 27% |
| 90 | Puffball | 5.75 | 2.50 | 3.6 | 19.5 | 1.2 | 0 | 24.0 | 8.0 | 0 | 0 | 0.5 | 0.2 | 1.8 | 40% |
| 91 | Loser | 5.50 | 2.75 | 5.1 | 5.0 | 0.2 | 0.5 | 3.0 | 0.5 | 0 | 2.8 | 0.2 | 0 | 1.0 | 40% |
| 92 | Pillow | 5.50 | 2.25 | 4.6 | 7.0 | 2.2 | 0.2 | 3.2 | 0.8 | 0.2 | 0 | 0.2 | 0 | 1.2 | 13% |
| 93 | Yellow Face | 5.50 | 2.00 | 4.3 | 10.0 | 0.5 | 1.2 | 3.8 | 3.0 | 9.8 | 0 | 0 | 0 | 0 | 60% |
| 94 | Nickel (II) | 5.50 | 2.00 | 4.2 | 9.2 | 1.0 | 0.2 | 3.8 | 3.2 | 0.8 | 0 | 0.2 | 0.2 | 0 | 20% |
| 95 | Tea Kettle | 5.50 | 1.25 | 3.6 | 10.5 | 1.0 | 0.8 | 2.2 | 1.8 | 0 | 0 | 0 | 0.5 | 0.2 | 20% |
| 96 | Paper | 5.25 | 2.50 | 4.5 | 7.0 | 0.2 | 0.5 | 2.8 | 0.5 | 0.5 | 0 | 0.5 | 0 | 3.0 | 13% |
| 97 | Jack | 5.25 | 2.25 | 4.1 | 6.2 | 1.5 | 0 | 2.5 | 1.0 | 0 | 0 | 0.8 | 0 | 0.5 | 33% |
| 98 | Soap | 5.25 | 1.75 | 4.0 | 8.8 | 1.8 | 0.2 | 4.0 | 0 | 0.5 | 0 | 0.5 | 0.2 | 0.8 | 40% |
| 99 | Tapey | 5.25 | 2.00 | 4.0 | 8.2 | 0.2 | 0.2 | 3.5 | 0.5 | 0 | 0 | 0.5 | 0.8 | 1.2 | 27% |
| 100 | Ruler | 5.25 | 3.25 | 3.4 | 12.5 | 0 | 0 | 2.8 | 2.2 | 0.2 | 0.8 | 1.5 | 0 | 0.2 | 87% |
| 101 | Poppy | 5.00 | 2.25 | 4.3 | 8.0 | 0.2 | 0.2 | 3.8 | 0.2 | 0.2 | 3.2 | 0 | 0.2 | 0.8 | 33% |
| 102 | Bomby | 5.00 | 2.75 | 4.1 | 6.0 | 0.2 | 0 | 1.8 | 0.8 | 0 | 3.5 | 0 | 0 | 1.0 | 100% |
| 103 | Woody | 4.75 | 2.25 | 3.6 | 5.2 | 0.2 | 0 | 4.8 | 12.0 | 0 | 0 | 0.8 | 0.2 | 0.5 | 67% |
| 104 | Marshmallow | 4.50 | 1.50 | 4.2 | 4.8 | 0.5 | 0 | 2.8 | 2.2 | 0 | 0 | 0 | 0.5 | 0.5 | 33% |
| 105 | Starfruit | 4.50 | 1.25 | 3.7 | 7.8 | 1.2 | 0.2 | 3.0 | 3.0 | 0 | 0 | 0.2 | 0 | 0 | 13% |
| 106 | Trophy | 4.50 | 1.50 | 3.5 | 9.2 | 0.2 | 0.5 | 1.8 | 2.8 | 0 | 0 | 0.2 | 0.2 | 0.2 | 13% |

### Pressed against landed, the special moves

Per fighter and match, on average: 21 up-special presses (only 3% of them off the stage, 47% with the foe far away, and 11% landing), 25 aerial presses (3.4 landing), 6.6 neutral specials (2.5 landing), 4.2 finishers (1.6 landing), 1.8 down specials (0.7 landing), 1.0 smashes (0.6 landing) and 1.0 grabs (0.29 throws).

<details><summary>Per fighter: presses / landed per match for the five special moves (up special: presses off the stage in brackets)</summary>

| Fighter | Neutral special | Up special | Down special | Smash | Finisher |
|---|---|---|---|---|---|
| Gaty | 4.2 / 1.5 | 20.5 / 3.8 (0.5) | 1.8 / 0.0 | 1.2 / 0.8 | 2.2 / 0.2 |
| Toothpaste | 1.2 / 1.0 | 20.2 / 1.8 (0.5) | 8.5 / 5.8 | 2.0 / 1.5 | 13.5 / 9.5 |
| Snowball | 7.8 / 3.5 | 21.8 / 0.8 (0.2) | 4.8 / 0.0 | 1.2 / 0.8 | 6.0 / 1.5 |
| Lightning | 15.2 / 12.8 | 32.8 / 1.0 (0.8) | 2.8 / 1.8 | 1.2 / 0.8 | 11.5 / 2.8 |
| Gelatin | 14.0 / 5.2 | 24.0 / 1.0 (0.0) | 4.0 / 3.0 | 3.8 / 2.5 | 9.8 / 5.2 |
| Golf Ball | 10.5 / 6.2 | 20.2 / 7.5 (0.0) | 1.2 / 0.5 | 1.8 / 0.0 | 6.5 / 2.8 |
| Pencil | 2.8 / 1.0 | 16.5 / 1.2 (0.0) | 3.0 / 0.0 | 1.5 / 1.0 | 5.0 / 0.0 |
| Firey Jr. | 13.2 / 6.8 | 23.8 / 0.5 (1.0) | 1.8 / 1.0 | 1.0 / 0.8 | 5.0 / 2.5 |
| Nickel | 2.8 / 1.0 | 17.0 / 8.2 (1.0) | 2.0 / 0.0 | 0.5 / 0.2 | 10.2 / 2.2 |
| Donut | 2.8 / 1.5 | 36.8 / 8.2 (1.0) | 8.0 / 4.8 | 0.5 / 0.5 | 4.0 / 1.0 |
| Lollipop | 12.2 / 5.5 | 37.5 / 12.2 (1.0) | 3.2 / 1.5 | 2.0 / 1.5 | 2.2 / 1.0 |
| Box | 2.8 / 0.0 | 20.0 / 0.0 (0.0) | 4.5 / 0.0 | 1.5 / 1.2 | 3.5 / 0.8 |
| Marker | 11.0 / 1.5 | 18.5 / 0.5 (0.5) | 3.2 / 2.5 | 0.5 / 0.5 | 12.8 / 0.0 |
| Pen | 13.2 / 8.0 | 25.0 / 4.5 (0.0) | 5.0 / 0.0 | 1.0 / 0.8 | 3.0 / 2.0 |
| Match | 8.8 / 5.8 | 22.0 / 3.5 (0.2) | 3.0 / 1.2 | 0.2 / 0.0 | 3.5 / 0.5 |
| Pickle | 3.2 / 2.2 | 22.8 / 0.5 (0.5) | 4.0 / 0.8 | 2.5 / 2.0 | 4.8 / 0.2 |
| Grassy | 3.2 / 0.0 | 25.0 / 7.5 (0.5) | 2.8 / 0.0 | 0.8 / 0.5 | 3.0 / 1.5 |
| Firey | 16.0 / 4.8 | 22.0 / 6.8 (0.0) | 3.5 / 2.8 | 0.8 / 0.5 | 2.5 / 1.0 |
| Goo | 4.5 / 1.8 | 17.8 / 0.2 (1.0) | 8.2 / 4.0 | 2.2 / 1.5 | 3.0 / 1.0 |
| Money | 13.8 / 4.8 | 25.8 / 6.2 (1.0) | 0.0 / 0.0 | 0.8 / 0.5 | 3.0 / 0.0 |
| Bonesaw | 3.2 / 1.5 | 22.8 / 5.2 (0.2) | 0.0 / 0.0 | 1.2 / 0.8 | 4.5 / 1.2 |
| Lifering | 3.2 / 1.0 | 23.5 / 0.2 (0.8) | 1.8 / 0.0 | 1.2 / 0.8 | 5.2 / 2.2 |
| Naily | 9.2 / 4.5 | 22.0 / 2.5 (0.5) | 5.2 / 3.0 | 0.5 / 0.0 | 5.5 / 2.2 |
| prize fighter C | 3.5 / 0.2 | 21.2 / 2.8 (0.2) | 0.2 / 0.2 | 1.5 / 1.0 | 1.2 / 0.0 |
| Roboty | 3.0 / 2.2 | 24.2 / 0.8 (0.8) | 2.8 / 0.0 | 1.5 / 1.0 | 3.5 / 0.2 |
| Rose | 5.2 / 5.2 | 25.0 / 0.8 (1.0) | 4.0 / 0.2 | 0.8 / 0.2 | 15.8 / 7.2 |
| Fries | 13.2 / 7.2 | 31.2 / 1.2 (1.0) | 4.2 / 2.2 | 0.8 / 0.2 | 11.5 / 3.0 |
| Tree | 14.8 / 2.2 | 20.2 / 7.2 (1.5) | 2.0 / 0.0 | 1.8 / 0.5 | 4.8 / 1.5 |
| David | 2.5 / 2.2 | 21.5 / 0.0 (1.2) | 1.8 / 0.0 | 1.5 / 0.2 | 11.5 / 6.8 |
| Balloony | 4.2 / 0.8 | 32.0 / 10.2 (0.2) | 0.0 / 0.0 | 0.8 / 0.5 | 14.2 / 9.5 |
| Bubble | 6.0 / 0.0 | 21.2 / 10.0 (1.0) | 0.0 / 0.0 | 1.8 / 0.8 | 6.5 / 3.5 |
| Saw | 5.5 / 2.8 | 17.5 / 0.5 (0.2) | 0.0 / 0.0 | 0.8 / 0.5 | 1.2 / 1.0 |
| Ruby | 8.0 / 0.0 | 25.2 / 0.2 (2.0) | 3.8 / 2.2 | 1.8 / 1.8 | 2.2 / 1.0 |
| Fern | 3.8 / 1.0 | 31.0 / 0.0 (0.0) | 3.0 / 0.0 | 1.2 / 0.2 | 1.5 / 0.0 |
| Cake | 3.8 / 0.8 | 21.0 / 0.5 (0.2) | 4.5 / 0.0 | 0.5 / 0.2 | 7.5 / 3.2 |
| Basketball | 11.0 / 4.5 | 19.5 / 0.2 (0.2) | 2.5 / 2.2 | 0.5 / 0.5 | 11.5 / 4.0 |
| Sidewalky | 4.5 / 0.5 | 22.5 / 5.8 (0.8) | 3.0 / 0.0 | 0.5 / 0.5 | 4.0 / 3.2 |
| Dora | 3.0 / 2.0 | 19.2 / 0.2 (0.5) | 0.0 / 0.0 | 1.5 / 0.8 | 6.2 / 3.2 |
| Book | 5.8 / 0.0 | 13.5 / 0.2 (0.8) | 4.2 / 0.0 | 1.2 / 0.8 | 2.2 / 1.0 |
| Cherries | 3.8 / 1.5 | 27.0 / 0.5 (1.2) | 7.2 / 6.0 | 0.2 / 0.2 | 0.5 / 0.5 |
| Bot | 3.8 / 0.0 | 12.0 / 2.0 (0.5) | 0.0 / 0.0 | 1.8 / 1.5 | 0.5 / 0.5 |
| Baseball | 4.2 / 0.0 | 22.0 / 0.5 (2.2) | 0.0 / 0.0 | 1.2 / 1.2 | 2.2 / 0.0 |
| Teardrop | 4.2 / 0.5 | 18.8 / 0.0 (1.0) | 2.2 / 0.0 | 0.8 / 0.0 | 2.8 / 1.0 |
| Rocky | 12.2 / 8.0 | 23.8 / 10.5 (0.2) | 5.0 / 3.0 | 0.2 / 0.0 | 13.8 / 9.8 |
| prize fighter A | 4.8 / 3.0 | 30.2 / 0.5 (1.5) | 0.0 / 0.0 | 1.0 / 0.5 | 0.5 / 0.5 |
| Eraser | 16.8 / 2.5 | 22.5 / 0.0 (0.8) | 3.2 / 0.0 | 1.0 / 0.8 | 1.2 / 0.2 |
| Coiny | 3.0 / 0.8 | 25.5 / 0.2 (0.2) | 3.2 / 1.0 | 1.0 / 0.8 | 1.2 / 0.2 |
| Ice Cube | 10.2 / 6.2 | 32.8 / 0.2 (0.8) | 3.2 / 0.8 | 1.5 / 0.5 | 2.0 / 0.8 |
| Flower | 3.8 / 0.5 | 25.0 / 10.5 (1.5) | 0.0 / 0.0 | 1.2 / 1.2 | 8.0 / 1.5 |
| Fanny | 4.8 / 0.0 | 19.2 / 7.0 (0.0) | 0.0 / 0.0 | 2.0 / 0.8 | 4.2 / 0.8 |
| prize fighter B | 2.5 / 0.8 | 27.8 / 0.0 (0.5) | 8.8 / 7.0 | 1.8 / 0.5 | 0.0 / 0.0 |
| TV | 2.8 / 0.8 | 28.8 / 4.0 (2.2) | 0.0 / 0.0 | 1.2 / 0.8 | 14.2 / 5.0 |
| Needle | 4.2 / 1.5 | 19.2 / 0.0 (0.2) | 4.0 / 0.8 | 0.8 / 0.5 | 6.8 / 2.5 |
| Cheesy | 5.2 / 0.8 | 26.0 / 0.0 (0.8) | 0.0 / 0.0 | 1.5 / 0.5 | 7.2 / 2.8 |
| Spikey | 5.5 / 4.0 | 31.2 / 12.5 (1.0) | 0.0 / 0.0 | 1.5 / 0.5 | 2.5 / 0.8 |
| Microphone | 4.0 / 1.5 | 26.0 / 1.2 (1.2) | 0.2 / 0.0 | 0.5 / 0.2 | 2.5 / 0.2 |
| Leafy | 21.0 / 4.2 | 6.0 / 0.0 (0.0) | 4.2 / 0.5 | 0.8 / 0.5 | 2.2 / 1.0 |
| Dough | 10.2 / 2.5 | 19.0 / 0.0 (0.5) | 0.0 / 0.0 | 0.5 / 0.5 | 2.2 / 0.8 |
| Blueberry | 5.8 / 2.0 | 24.0 / 0.0 (0.8) | 0.0 / 0.0 | 0.5 / 0.5 | 1.5 / 1.5 |
| Silver Spoon | 3.0 / 1.8 | 16.8 / 0.0 (0.0) | 0.0 / 0.0 | 1.0 / 0.5 | 0.2 / 0.2 |
| Test Tube | 4.0 / 0.8 | 23.5 / 9.8 (1.0) | 0.0 / 0.0 | 0.5 / 0.2 | 1.0 / 1.0 |
| Remote | 17.0 / 9.5 | 15.5 / 2.5 (0.0) | 0.0 / 0.0 | 0.5 / 0.5 | 2.8 / 0.8 |
| Pin | 2.0 / 0.5 | 22.0 / 0.0 (0.5) | 2.8 / 0.0 | 0.8 / 0.8 | 4.2 / 1.2 |
| Bow | 1.8 / 0.2 | 0.0 / 0.0 (0.0) | 0.0 / 0.0 | 0.0 / 0.0 | 2.0 / 1.2 |
| Bomb | 5.5 / 3.5 | 27.0 / 6.8 (1.0) | 0.0 / 0.0 | 0.2 / 0.0 | 1.8 / 0.2 |
| Paintbrush | 2.8 / 0.2 | 20.2 / 0.5 (0.5) | 0.0 / 0.0 | 1.2 / 0.5 | 7.8 / 3.0 |
| Salt | 5.0 / 1.5 | 24.2 / 0.0 (0.8) | 0.0 / 0.0 | 0.8 / 0.2 | 10.5 / 5.0 |
| Lightbulb | 5.5 / 0.8 | 26.8 / 10.2 (0.0) | 0.0 / 0.0 | 0.2 / 0.0 | 5.2 / 1.8 |
| Apple | 6.2 / 2.0 | 23.5 / 0.2 (0.0) | 0.0 / 0.0 | 1.0 / 0.5 | 3.8 / 2.0 |
| Teddy Bear | 2.2 / 1.0 | 19.2 / 8.0 (0.5) | 0.0 / 0.0 | 0.8 / 0.8 | 0.5 / 0.2 |
| Bell | 15.2 / 5.2 | 29.0 / 11.0 (0.5) | 0.0 / 0.0 | 1.2 / 0.8 | 2.8 / 0.5 |
| Tennis Ball | 16.2 / 5.8 | 21.5 / 4.5 (1.5) | 0.0 / 0.0 | 0.8 / 0.8 | 0.8 / 0.5 |
| Taco (II) | 4.0 / 0.8 | 22.2 / 0.2 (0.0) | 0.0 / 0.0 | 0.8 / 0.8 | 1.8 / 0.2 |
| Balloon | 2.5 / 1.2 | 16.5 / 0.0 (0.5) | 0.0 / 0.0 | 0.2 / 0.0 | 6.2 / 1.8 |
| Taco | 8.8 / 5.5 | 25.8 / 0.0 (0.5) | 2.8 / 2.8 | 0.5 / 0.2 | 1.5 / 0.0 |
| Candle | 4.5 / 0.0 | 23.5 / 0.0 (1.0) | 0.0 / 0.0 | 0.2 / 0.0 | 8.8 / 3.8 |
| Blocky | 4.5 / 1.0 | 19.8 / 0.2 (1.0) | 8.0 / 4.2 | 1.5 / 0.2 | 1.2 / 1.0 |
| Barf Bag | 12.2 / 0.2 | 18.2 / 0.2 (0.2) | 2.0 / 0.8 | 1.8 / 0.8 | 0.0 / 0.0 |
| MeTag | 3.0 / 2.0 | 21.2 / 0.0 (0.2) | 0.0 / 0.0 | 0.2 / 0.0 | 0.5 / 0.5 |
| Bracelety | 15.8 / 9.5 | 30.2 / 3.2 (0.5) | 0.0 / 0.0 | 0.5 / 0.5 | 2.5 / 0.5 |
| Magnet | 5.0 / 1.2 | 18.2 / 0.5 (2.0) | 0.0 / 0.0 | 1.0 / 0.2 | 0.0 / 0.0 |
| Knife | 5.2 / 4.2 | 17.5 / 0.0 (0.5) | 0.0 / 0.0 | 1.2 / 1.2 | 15.0 / 0.5 |
| Cammy | 3.0 / 0.2 | 15.0 / 0.0 (0.5) | 0.0 / 0.0 | 1.5 / 1.0 | 2.8 / 0.8 |
| Profily | 11.2 / 5.5 | 15.0 / 0.2 (0.2) | 0.0 / 0.0 | 1.5 / 0.5 | 5.2 / 1.5 |
| Fan | 3.2 / 2.2 | 20.0 / 0.0 (0.0) | 2.2 / 0.8 | 0.8 / 0.0 | 0.8 / 0.8 |
| Clover | 3.8 / 2.8 | 12.2 / 0.0 (0.0) | 4.5 / 0.8 | 0.8 / 0.0 | 0.5 / 0.5 |
| Yin-Yang | 4.2 / 2.0 | 18.8 / 0.0 (0.2) | 0.0 / 0.0 | 1.2 / 0.8 | 0.5 / 0.5 |
| Tissues | 4.0 / 1.2 | 17.0 / 0.8 (1.0) | 0.0 / 0.0 | 0.5 / 0.5 | 1.0 / 0.8 |
| Liy | 16.0 / 7.0 | 3.2 / 0.0 (0.0) | 0.0 / 0.0 | 1.2 / 0.2 | 9.8 / 1.0 |
| Puffball | 8.0 / 0.0 | 21.2 / 0.0 (0.8) | 0.0 / 0.0 | 1.2 / 0.5 | 4.0 / 1.8 |
| Loser | 3.5 / 0.5 | 21.5 / 0.0 (0.8) | 2.8 / 0.0 | 0.2 / 0.2 | 2.0 / 1.0 |
| Pillow | 3.8 / 0.8 | 19.2 / 0.2 (0.8) | 0.0 / 0.0 | 1.0 / 0.2 | 7.0 / 1.2 |
| Yellow Face | 14.0 / 3.0 | 27.8 / 9.8 (1.5) | 0.0 / 0.0 | 0.8 / 0.0 | 0.8 / 0.0 |
| Nickel (II) | 3.8 / 3.2 | 33.8 / 0.8 (1.5) | 0.0 / 0.0 | 0.2 / 0.2 | 0.0 / 0.0 |
| Tea Kettle | 5.8 / 1.8 | 13.5 / 0.0 (0.8) | 0.0 / 0.0 | 0.8 / 0.0 | 0.2 / 0.2 |
| Paper | 3.8 / 0.5 | 25.8 / 0.5 (0.8) | 0.0 / 0.0 | 0.5 / 0.5 | 4.2 / 3.0 |
| Jack | 4.8 / 1.0 | 21.0 / 0.0 (0.0) | 0.0 / 0.0 | 0.8 / 0.8 | 0.5 / 0.5 |
| Soap | 0.0 / 0.0 | 20.8 / 0.5 (0.8) | 0.0 / 0.0 | 0.8 / 0.5 | 0.8 / 0.8 |
| Tapey | 5.2 / 0.5 | 14.0 / 0.0 (0.2) | 0.0 / 0.0 | 1.2 / 0.5 | 1.2 / 1.2 |
| Ruler | 4.2 / 2.2 | 14.2 / 0.2 (0.8) | 0.8 / 0.0 | 2.2 / 1.5 | 1.5 / 0.2 |
| Poppy | 3.0 / 0.2 | 17.0 / 0.2 (0.8) | 3.2 / 0.0 | 0.0 / 0.0 | 0.8 / 0.8 |
| Bomby | 1.2 / 0.8 | 20.5 / 0.0 (0.5) | 5.2 / 3.5 | 0.2 / 0.0 | 1.0 / 1.0 |
| Woody | 21.8 / 12.0 | 6.5 / 0.0 (0.0) | 0.0 / 0.0 | 1.0 / 0.8 | 1.2 / 0.5 |
| Marshmallow | 3.0 / 2.2 | 18.2 / 0.0 (0.8) | 0.0 / 0.0 | 0.8 / 0.0 | 2.0 / 0.5 |
| Starfruit | 8.0 / 3.0 | 16.2 / 0.0 (0.0) | 0.0 / 0.0 | 0.2 / 0.2 | 0.2 / 0.0 |
| Trophy | 2.8 / 0.0 | 11.5 / 0.0 (0.2) | 0.2 / 0.0 | 0.8 / 0.2 | 2.0 / 0.2 |

</details>

## Why: what the CPU knows how to do with each button

The Expert CPU (aiThink, brainFight and brainPickMove in artifacts/V1/index.html) walks in and, in reach, picks one move and repeats it while it keeps landing. What it reaches for depends on what its move reader (brainKit) thinks each move IS. brainKit works the kit out from the move's own code with a few patterns: is the neutral special a **shot** (on the hand-kept list BRAIN_SHOOTERS, or its code makes a projectile), is the down special a **trap**, a **heal** or a **stance** (a counter, a reflect or a brace), is the smash a **stance** or a **self-buff**. There is no "attack" kind for a down special or an up special. Button by button:

- **Jab, low sweep, up-tilt, aerials** (brainPickMove): an aerial when it is in the air, the up-tilt only for a foe above it, the low sweep one time in four when the foe is level, otherwise the jab. So the jab is most of every fighter's hits (9.1 landed a match on average, against 1.1 low sweeps and 0.7 up-tilts).
- **Neutral special:** a **shot** (28 kits) is fired from 110-420 px away, level with the foe, half the time it is ready. Anything else is pressed in only 15% of its close-range decisions. All specials share one cooldown, and at Expert it waits 1.7-3.3 s between its own specials.
- **Up special: never chosen as an attack.** It is pressed only to get back to the stage, to climb toward a foe above it, or to travel on the big maps. That is why it is pressed so much (21 times a match on average) and lands so little (2.3). The up specials that do land are the ones that hit all round the fighter as it rises (Spikey's, Lollipop's, Bell's and Balloony's spins, 10-12 a match) or that drop or fire something on the way (Rocky's, Flower's and Bubble's drops; Lightbulb's, Test Tube's and Yellow Face's shots). A plain rising hit seldom lands: 19 of them almost never do.
- **Down special: only three kinds are understood.** A **trap** (22 kits) is laid when the foe is 80-260 px away (30% of its decisions when ready). A **heal** is taken at 30%+ damage with the foe 240+ px away. A **stance** (24 kits, including the plain counter of kits with no down special of their own) is raised only as a guess when it sees a swing start (30% of the swings it sees, then not again for 4-7 s). **Anything else, 56 of the 106 down specials (attacks, buffs, shields, dodges, grab-holds, summons), is never pressed.** The only one pressed regularly has a rule of its own: Eraser (Rub It Off, with an ailment and room); across the other kits, 3 stray presses in all their matches put together.
- **Smash:** only on an opening it SAW (the foe stunned, frozen, mid-swing or charging a smash), within reach, on the ground, half the time at Expert. A smash that reaches far (a beam, a rain, a mine, a plant) is still only used at melee range on an opening. A self-buff smash (Teardrop's, Golf Ball's, Needle's) is used 5% of the time when the foe is 250+ px away.
- **Finisher:** 81 kits have a finisher **read** of their own (FINX_AI_KITS: a distance window checked every frame, firing 0.6% of frames in it, 4% once the foe is at 70%+). The wider the window, the more it fires. The other 25 kits (the shared finisher, and the prize fighters) only fire it on the ground with the foe in reach at 85%+, in 22% of those decisions.
- **Grab:** 12% of close decisions (more against a foe in a stance); a throw always follows.

## Why Toothpaste and Bot stand out

**Toothpaste.** All five of her special moves fall into kinds the CPU knows, and two of them into the kinds it uses most:
- **Root Trap** (down special) is a trap, so she lays it whenever a foe is 80-260 px away: 8.5 presses a match, 5.8 that catch someone (#3 of 106).
- **Squeeze Rocket** (finisher) has one of the widest reads in the game: any foe 40-290 px away with a clear line, checked every frame. So it fires 13.5 times a match and lands 9.5 (#3). Many finisher reads are much narrower (Snowball's and Coiny's need the foe almost touching them, within 12-14 px).
- **Teleport** (up special) is a warp, 120 px up and up to 90 px across, that ends with a hit. The CPU uses it to climb toward a foe above her (20 presses a match), and because it puts her on the foe it lands 1.8 times a match.
- **Whole Tube** (smash) is a mine she drops, pressed on openings: 1.5 uses a match (#5).
- **Paste Trap** (neutral special) is her one under-used move: the CPU does not know it is a shot (it is not on the shot list and the glob is not made in the special's own code), so it only presses it up close, 1.2 times a match (#75). g-bot-fixes measured it landing 0-440 px away for 18% and would fire it from range.

**Bot.** The three moves the owner named are exactly the three that fall into kinds the CPU uses:
- **Cheer Factory!** (neutral special) is a self-buff, which the CPU treats as a close-range special and presses up close: 3.8 times a match. A buff always "works", so it is seen every time.
- **Bridge the Gap!** (up special) is a plunge: up, a hang, then a slam that stuns. The CPU uses it to climb 12 times a match, and the slam is big and easy to see; it lands 2.0 times a match.
- **The One and Only!** (smash) is a leap that the opening rule fires: 1.5 uses a match, #8 of 106.
- **Gotcha!** (down special, a hold that makes Bot take no damage) is not a trap, heal or stance, so it was never pressed (0 in 4 matches). Bot has no finisher read (the shared finisher), so his finisher came out 2 times in 4 matches. That is why he is only #41 overall.

## Moves the CPU (almost) never uses

Every special move used less than once in 4 matches on average (under 0.25 uses a match). A fighter with no "pressed" figure never pressed it at all in 4 matches. **g-bot-fixes** is the separate CPU-fix build (its diff from 3e39cf3, in .worktrees/bot-fixes, read on 2026-10-29): "yes" means its new rules make the CPU use this move; "no" means they do not touch it.

**Down specials that reach a foe (attacks, armoured swings, grabs, effects): never pressed** (30). Why: the CPU only presses a down special that is a trap, a heal or a stance. g-bot-fixes measured where each of these lands and presses it up close or at range. Covered by g-bot-fixes: **yes (attack down-special, measured reach)**.

Apple (Lucky Number 7), Balloon (Insult Tirade), Baseball (Ground Pound), Bell (Brace), Bot (Gotcha!), Bow (Snowballs), Cammy (Do Not Disturb Mode), Candle (Crystal Chime), Dora (Jabby Brace), Dough (They're the Best), Flower (Stomp Shockwave), Jack (Knuckles), Lightbulb (Bright Flash), Magnet (Like Poles Repel), Marshmallow (NO WAY!), Paintbrush (Heat Waves), Profily (OVERPRICED!), Remote (Remote Jam), Salt (Trend Setter), Saw (Defensive Spin), Silver Spoon (Scoop), Soap (They're the Mess, We Clean It), Spikey (Spike Grab), TV (Static Brace), Taco (II) (Retractable Arms), Tea Kettle (Mama's Gotcha!), Teddy Bear (Front of the Crowd), Tissues (Nap), Trophy (Sore Loser, pressed 0.25 a match), Yellow Face (Price Cut).

**Down specials that reach no one (buffs, shields, dodges, gadgets, summons): never pressed** (21). Why: the same rule; and g-bot-fixes only adds down specials that land on a foe, so these stay unused. Covered by g-bot-fixes: **no**.

Balloony (Deflate & Drift), Blueberry (Play Dead), Bomb (Stay Back!), Bonesaw (Heartless Monster?), Bracelety (Power Up), Bubble (Bubble Shield), Cheesy (Knee Slap), Fanny (Push Away), Knife (Fake-Out), Liy (Hurl), MeTag (Precision Finding), Money (Bank It), Nickel (II) (Experiment 626), Paper (Water-Proof Bag), Pillow (Cushiony Guard), Puffball (Hover), Tapey (Record), Tennis Ball (Swap Gadget), Test Tube (Glass Up), Woody (Dodge), Yin-Yang (Mindful Positioning).

**A prize fighter's down special: never pressed** (1). Why: not a trap, heal or stance. Covered by g-bot-fixes: **no**.

prize fighter A (its down special).

**Starfruit's Recycle: never pressed** (1). Why: a refresh is not a trap, heal or stance; g-bot-fixes adds a Recycle rule once One-Hit Wonder is spent. Covered by g-bot-fixes: **yes (Starfruit Recycle)**.

Starfruit (Recycle).

**Up specials used only to recover or climb, (almost) never landing (a rise with a hit)** (19). Why: the up special is never chosen as an attack; g-bot-fixes adds it as an anti-air when the hit would land. Covered by g-bot-fixes: **yes (anti-air when it lands)**.

Blueberry (Overhead Press, pressed 24 times a match), Bomby (Short Fuse, pressed 20 times a match), Cammy (The Power of MePhone Compels ME!, pressed 15 times a match), Cheesy (Heckler in the Crowd, pressed 26 times a match), David (Jumpscare, pressed 22 times a match), Fern (Pole Jump, pressed 31 times a match), Jack (I Prefer to Wrestle, pressed 21 times a match), Knife (Rising Stab, pressed 18 times a match), Liy (Switch On, pressed 3 times a match), Loser (Too Cool to Touch, pressed 22 times a match), Marshmallow (Launchpad, pressed 18 times a match), Needle (The Point, pressed 19 times a match), Pin (Pinned, pressed 22 times a match), Taco (Quick Bite, pressed 26 times a match), Tapey (Leap of Faith, pressed 14 times a match), Tea Kettle (Steam Jet, pressed 14 times a match), Trophy (Horseplay, pressed 12 times a match), Yin-Yang (Through the Roof, pressed 19 times a match), prize fighter B (its up special, pressed 28 times a match).

**Up specials used only to recover or climb, (almost) never landing (no hit: a plain rise, a warp or a float [shape])** (15). Why: the up special is never chosen as an attack. Covered by g-bot-fixes: **no**.

Balloon (Levitation [hop], pressed 16 times a match), Box (Transcending Time and Space [warp], pressed 20 times a match), Candle (Levitate [hop], pressed 24 times a match), Clover (Lucky Wind [hop], pressed 12 times a match), Dough (Into the Ceiling [warp], pressed 19 times a match), Eraser (Steakhouse Flip [own], pressed 22 times a match), Fan (Not Today! [hop], pressed 20 times a match), Leafy (Sprint Up [warp], pressed 6 times a match), MeTag (Barrier Step [hop], pressed 21 times a match), Puffball (Float Boost [own], pressed 21 times a match), Salt (Hand-Hold [hop], pressed 24 times a match), Silver Spoon (Up, Up and Away [hop], pressed 17 times a match), Starfruit (Flee! Flee! [warp], pressed 16 times a match), Teardrop (Evaporate [warp], pressed 19 times a match), Woody (Scream [hop], pressed 6 times a match).

**Bow's Chair Slam (up special): never pressed** (1). Why: the CPU leaves Bow's up special out of every rule (her way back is her Teleport). Covered by g-bot-fixes: **yes (Chair Slam on a foe beside her)**.

Bow (Chair Slam).

**Finishers with no read of their own** (4). Why: only fired on the ground with the foe in reach at 85%+, in 22% of those decisions. Covered by g-bot-fixes: **no**.

Magnet (Finisher), Nickel (II) (Finisher), Starfruit (Finisher, pressed 0.25 a match), prize fighter B (its finisher).

**Finishers whose read almost never comes true** (2). Why: its own read (a distance window) is rarely met in a fight. Covered by g-bot-fixes: **no**.

Barf Bag (Somebody Refill Me!), Yellow Face (But Wait, There's More!, pressed 0.75 a match).

**Smashes almost never used [their pattern]** (15). Why: a smash only goes on an opening the CPU saw (the foe stunned, frozen or mid-swing), in reach, on the ground, so a smash that is slow, short or meant for range rarely comes out. Covered by g-bot-fixes: **no**.

Balloon (POP! [burst], pressed 0.25 a match), Bomb (Big Kaboom [burst], pressed 0.25 a match), Bomby (Big Bang [plant], pressed 0.25 a match), Bow (Musical Chairs [walk]), Candle (There Is No Magic [reel], pressed 0.25 a match), Clover (Lucky Break [rain], pressed 0.75 a match), Fan (Nice Save! [burst], pressed 0.75 a match), Marshmallow (One Purchase Later [plant], pressed 0.75 a match), Match (Strike Anywhere [rain], pressed 0.25 a match), MeTag (Under Arrest [lunge], pressed 0.25 a match), Naily (I NAILED IT! [own], pressed 0.50 a match), Poppy (Soldering Iron [lunge]), Rocky (Toxic Wave [plant], pressed 0.25 a match), Tea Kettle (Blow Her Lid [burst], pressed 0.75 a match), Yellow Face (Flash Sale [rain], pressed 0.75 a match).

**A beam smash used only at melee range** (1). Why: the opening rule; g-bot-fixes adds firing a beam down the stage. Covered by g-bot-fixes: **yes (beam down the stage)**.

Lightbulb (Spotlight, pressed 0.25 a match).

**Soap's neutral special: never pressed** (1). Why: the close-range special rule skips Soap; her spray only goes when it pays (aiSoapSprayPays), and in a 1 v 1 it never did. Covered by g-bot-fixes: **no**.

Soap (Secret Ingredient).

In all, 111 under-used special moves: g-bot-fixes covers 52 and leaves 59. What it leaves: (1) down specials that reach no one (buffs, shields, dodges, gadgets, summons), (2) up specials with no hit, (3) smashes that need an opening in melee reach, (4) finishers with no read of their own, and one neutral special (Soap). The down-special stances are not in this list: the stance guess (which the owner left out of the fixes) fires often enough to clear the line.

Also used much less than they could be, though above the line: **neutral specials that are not on the shot list** (pressed only up close, 15% of close decisions; g-bot-fixes now reads each special's real reach), **down-special stances** (a guess on a swing seen, 30%, then 4-7 s; left alone on purpose), and **smashes in general** (0.6 uses a match on average, all from openings).

## Does using the full kit win more?

Rank correlation between kit use and win rate (+1: the more kit, the more wins, always; 0: no link):

| Kit measure | Against | Fighters | Rank correlation |
|---|---|---:|---:|
| Kit score | win-rate run | 102 | +0.32 |
| Special-move score | win-rate run | 102 | +0.40 |
| Special-move uses per match | win-rate run | 102 | +0.47 |
| Even-ness | win-rate run | 102 | +0.35 |
| Kit score | win-rate run with the balance pass's 26 re-measured fighters | 102 | +0.31 |
| Special-move score | same | 102 | +0.40 |
| Kit score | these 4 Expert matches | 106 | +0.19 |
| Special-move score | these 4 Expert matches | 106 | +0.31 |

- **A weak-to-moderate yes.** Fighters who use more of their kit, and above all more of their special moves, win somewhat more. But it explains little of who wins: the link is about +0.40, and the exceptions are big.
- **Narrow kits that win:** Bomby (100%, #102: his trap and jab do it), Magnet (87%, #81: the jab), Taco (87%, #75), Ruler (87%, #100), Woody (67%, #103: his dash special). **Wide kits that lose:** Snowball (7%, #3), Box (7%, #12) and Lifering (7%, #22) -- their breadth comes partly from stance and heal presses that do not hit anyone.
- **Which slots go with winning:** up special +0.41, neutral special +0.27, finisher +0.19, aerials +0.18, down special +0.15, smash +0.05, up-tilt +0.02, low sweep +0.00, grab -0.09, jab -0.14. The up special and the neutral special go with winning the most: fighters whose up special lands while they climb, or whose special the CPU fires a lot (the shooters), win more. Leaning on the jab, or grabbing more, does not.
- **By the kinds the CPU knows** (average win rate in the win-rate run): down special a trap 60% (21 fighters), a heal 33% (4 fighters), a stance 44% (24 fighters), anything else (never pressed) 37% (53 fighters). Neutral special a shot 59% (28 fighters), not a shot 38% (74 fighters). Finisher with a read 45% (80 fighters), without 39% (22 fighters). Trap kits win the most: the CPU uses a trap well, and a trap keeps working after it is laid.

## Caveats

- 4 matches per fighter, stopped at 120 s, on random cup stages. Slot counts near 1 a match can move a lot between runs; the never-pressed moves (0 presses in 4 matches) are certain.
- A hit is credited to the move that made it when the game makes that clear (a shot, a trap, a finisher's lingering object); otherwise to the fighter's most recent move. So a lingering thing that is neither a shot nor a finisher (Ruby's prism, a smash's rain) can be credited to a later jab: such a move is counted as used by its presses (the no-damage rule above), and the jab a little high.
- Status-only effects (a root, a slow, a stun with no damage) do not count as a landed hit; only pressing counts for those moves, and only when they never did damage.
- The win rates come from earlier runs on a slightly different build (Hard CPUs, 2 stocks, one stage) and are noisy (+/- about 2 wins in 15).

*Scripts and raw data (session scratchpad): C:/Users/carad/AppData/Local/Temp/claude/C--Users-carad--claude/82251bbe-13a2-473f-9c20-558b0b86c2bf/scratchpad/kituse -- kituse.mjs (the match runner, built on the World Cup runner's instrumentation), analyze.py, underused.py, report.py, report2.py; raw matches in part0.jsonl, part1.jsonl, part2.jsonl.*
