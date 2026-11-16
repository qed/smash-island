# Yellow Face's and Lightbulb's up-specials: why they almost never landed, and the fix (2026-10-18)

Both warp 130 px up and throw one flat shot (Yellow Face's star flies up and away: vy -2; Lightbulb's spark flat), so they pass over a grounded foe. Test Tube had the same shape; its fix was `homing:0.08` on the shot. Same here, and only that.

Real keys (up + C, the jump key is "up"), a still dummy and a Hard CPU Pen that closes in. Each cell is lands / casts. A "land" = the foe's % goes up by 2 or more within 80-100 frames.

| | dummy at 60, 100, 160, 240, 320 px (2 casts each) | CPU foe: cast when it is within 120 / 200 / 300 px (about 20 casts each) |
|---|---|---|
| Yellow Face now | 0/10 | 1/20, 8/20, 0/20 (9 of 60) |
| Yellow Face, homing 0.08 | 6/10 (0, 0, 2, 2, 2 of 2) | 4/20, 18/20, 20/20 (42 of 60) |
| Lightbulb now | 0/10 | 1/19, 20/20, 20/20 (41 of 59) |
| Lightbulb, homing 0.08 | 8/10 (0, 2, 2, 2, 2 of 2) | 5/19, 20/20, 20/20 (45 of 59) |

Lightbulb already landed against a CPU that jumps into the flat spark at 200 and 300 px; the dummy shows the flat shot never hits a still foe, and the homing fixes that.

Panel (128 games each, SE about 4): Yellow Face 21.9 > 26.6 (KOs/game 1.59 > 1.63), Lightbulb 53.1 > 43.8 (2.27 > 2.17; within the noise of a 128-game run, and a homing spark is no weaker). Raw files: up-special-homing-before.json / -after.json; the probe script is up-special-probe.mjs.
