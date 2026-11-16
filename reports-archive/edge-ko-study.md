# Edge KOs at 0%: what we tried

**The problem:** near a ledge, almost every smash can KO someone at 0%.
**Why it happens:**
1. Once you are hit, nothing slows you down sideways while you fly. The air speed limit only works when you are not stunned.
2. On Goiky Field the KO line at the side is only about 220 px past the ledge (120 px past the side of the screen).

**How we tested:** every smash in the roster that hits a fighter standing in front of it (98 of them; the 3 secret prize fighters left out) on Goiky Field, at full charge, against a medium-weight fighter. Each change was tried in memory only. **Nothing in the game was changed.** Tested on ii-dlc `cb417a8`. The changes merged since then (Bot's cheer, Bow's facing, grab, the visit switch) don't touch how far hits send you.

Two fixes, each tried at a few strengths:
- **Air slow-down:** while you fly from a hit, you keep 98% (or 97%, 95%, 93%) of your speed each frame. At 98%, after half a second you are going about half as fast.
- **KO line farther out:** the side KO line 200, 280 or 360 px past the side of the screen. Today it is 120.

## Results

"Tries to get back" = a CPU that jumps and up-specials back. "Thrown clean out" = it crosses the KO line before it could do anything.

| Setting | Edge, 0%: KOs a fighter who tries to get back | Edge, 0%: thrown clean out | Middle of stage: half the smashes KO a fighter who tries to get back by | Smashes that do that before 60% | How far a 60% Firey jab sends you |
|---|---|---|---|---|---|
| **Now** | **63%** | 36% | 65% | 46 | 267 px |
| Slow-down 98% | 40% | 16% | 94% | 19 | 224 px |
| Slow-down 97% | 23% | 10% | 105% | 9 | 205 px |
| Slow-down 95% | 7% | 1% | 128% | 1 | 156 px |
| Slow-down 93% | 3% | 0% | 152% | 0 | 121 px |
| KO line 200 | 47% | 18% | 78% | 34 | 267 px (same) |
| **KO line 280** | **29%** | 12% | 87% | 25 | 267 px (same) |
| KO line 360 | 16% | 4% | 96% | 16 | 267 px (same) |
| **Slow-down 98% + line 200** | **18%** | 6% | 103% | 5 | 224 px |
| Slow-down 97% + line 200 | 7% | 2% | 115% | 3 | 205 px |

A fighter who **never** tries to get back falls at 0% from 89% of edge smashes, with every setting. That's just how real edges work: if you don't come back, you fall.

**Do fighters who try to get back survive more?** Yes, with every setting. From the middle of the stage, 80 to 97 of the 98 smashes need more % to KO them than today.

**Earliest 5 KOs from the middle** (fighter who tries to get back):
- Now: Baseball 6, Microphone 6, Silver Spoon 11, Bomby 12, Nickel (II) 12
- KO line 280: Nickel (II) 23, Baseball 29, Microphone 29, Silver Spoon 30, Apple 35
- Slow-down 98% + line 200: Microphone 35, Baseball 47, Silver Spoon 48, Apple 54, Trophy 55
- Slow-down 97%: Microphone 39, Sidewalky 46, Baseball 49, Silver Spoon 49, Marshmallow 50

(A few single tries came out at 0 because the CPU missed its jump back by bad luck. Those are left out of this list.)

**Some ordinary moves:** the % where each one KOs, near the edge, a fighter who tries to get back. These come from one try each, so they wobble a bit.

| Move | Now | KO line 280 | Slow-down 98% + line 200 |
|---|---|---|---|
| Pen's jab | 25% | 100% | 71% |
| Coiny's up special | 62% | 121% | 118% |
| Firey's jab | 86% | 98% | 128% |
| Pen's smash | 68% | 116% | 117% |
| Coiny's smash | 7% | 52% | 59% |
| Bot's smash | 0% | 0% | 15% |

## What I'd do

**1. Move the side KO line out to 280** on the three stages with real ledges: Goiky Field, Yoyleland and The Moon. This is the gentlest fix.
- Nothing flies any differently, so launches look just as big.
- Edge KOs at 0% drop from about 2 in 3 smashes to about 3 in 10.
- The scary smashes (Baseball, Microphone, Silver Spoon, Apple, Nickel (II)) still KO early.
- You fly farther off the screen before a KO. The ring at the screen edge already shows where you are.
- The stages without ledges and the big maps stay at 120. Those single-screen stages have no ring, and you have no ledge to come back to.

**2. If you want 0% edge KOs rarer still: slow-down 98% plus the line at 200.**
- Fewer than 1 in 5 smashes still KO at 0% at the edge, and those are the strongest ones: Bomby, Apple, Baseball, Trophy, Silver Spoon, Microphone and 12 others.
- Every hit flies about a fifth less far, so the whole game feels a little heavier.
- Middle-of-stage KOs come at about 100% instead of 65%.

**Not recommended:**
- Slow-down 95% or 93%: KOs come far too late, and 11 or 12 smashes can't KO a fighter who just stands there, even at 200%.
- Line 360: it works, but you spend a long time off the screen.

**Not measured yet:**
- Yoyleland. Its low gravity may send fighters farther.
- An even gentler mix (slow-down 99% plus line 280). The computer was too busy to finish it tonight, but it can be run later.
