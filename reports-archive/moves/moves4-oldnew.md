# Moves 4: old against new (branch g-moves4, 2026-11-16)

Three small fixes for the look-alikes that the Moves 3 report listed. Not pushed, not merged. The live relay was never touched. None of these moves is live yet (they are Moves 3 work), so no live move is remade.

How to read the numbers: damage is what a foe takes in a match, launch is the strength of the throw. Everything was measured on the built game with a still dummy foe.

## The table

| # | Fighter, move | OLD (now) | NEW | Numbers (old -> new) | Why it is no longer a look-alike |
|---|---|---|---|---|---|
| 1 | Loser, **Fifty Spins** (smash) | Whirls a swing seat in an upright circle in front of him, twice. The second turn throws. No effect. | The same move, same circle, same timing. The second turn now also leaves the foe **dizzy**: their arrows are swapped for 40 frames (two-thirds of a second). | 7.5 then 12 (19.5), launch 11.0 -> the same. Measured 19.5 and the same top speed in both builds. Dizzy 0 -> 40 frames. | Yellow Face's Flash Sale is two pops with no status; Fifty Spins now has its own effect. By your rule, same shape + different effect is not a duplicate. Reason for the effect: anyone is dizzy after fifty spins. |
| 1 | Yellow Face, **Flash Sale** | two pops in front, "and a SECOND one FREE" | **not changed** | 9 then 15, launch 11.0 | (the other half of pair 1; changing one of the two is enough) |
| 2 | Tennis Ball, **Double Fault** (down smash) | Two bounces: lands in front, then behind. Each landing hits with a ball-sized round patch on his body. | The same two bounces, same places, same timing. Each landing now hits as a **flat ripple along the floor** under him (about 70 px wide, ankle high), which is what the drawing already showed. A foe in the air over the ripple is missed. | front 8 / back 11.4, launch 9.0 / 12.2 -> the same. Reach on the floor: the same to within 10 px. A foe 45 px off the floor: was hit, now missed. | **Only partly fixed. See "Honest notes".** |
| 3 | Tennis Ball, **Calculated Bounce** (finisher) | Bounces along a dotted path, three landings; each landing hits with a round patch on his body. | The same path, same three landings. Each landing now hits as the same **flat floor ripple**, and the ripple is drawn at each landing. A foe in the air over a landing is sailed over. | 4, 4, 6, launch 8.1 on the third -> the same. Reach on the floor: 240 px -> 250 px. A foe 45 px off the floor: was hit, now missed. | Pin's Wobbling Top is her round body spinning on the spot, back and forth. The bounce is now three flat floor ripples in a line ahead. Different shape, and they already moved differently. |
| 3 | Pin, **Wobbling Top** | spins on her point and wanders | **not changed** | 5, 5, 8, launch 8.0 | |

Not touched: every other move, Eraser, all damage and launch numbers.

## Honest notes

1. **Double Fault still matches two moves in the look-alike check.** Before: 4 matches (the down-airs of Bomby, Tree, Bomb and a fourth; my script names it 8-Ball's row, the Moves 3 report called it Pencil's). After: 2 matches, and they are different ones: Sidewalky's Pavement Drop and Spongy's Crushed by Spongy, which are also flat and low. I did not change the check to hide this. The check has no way to see where the fighter goes, so "a ground smash that hops in front and then behind" and "a drop out of the air" look the same to it. By eye they are different: his is on the ground, has two landing places, and throws foes out and up; the down-airs fall from the air and spike foes down. You already chose to drop the slow on 11-15 and judge this one by eye. I did not add an effect just to pass the check, because that was the fault found in the slow. **Your call:** keep the floor ripple, or go back to the round patch (one line).
2. **Tennis Ball's two moves can now be jumped over.** A foe about 45 px off the floor used to be hit by both moves and is now missed (at 20 px they are still hit). This is the point of a floor ripple, but it is a small nerf, not "no change".
3. **Fifty Spins got an effect it did not have.** Damage and launch are the same, but dizzy is a small buff. Loser's old smash (Cold Snap) had a chill, so he had an effect before Moves 3.
4. **Calculated Bounce, found but NOT changed:** the marks on the floor are drawn 100, 200 and 300 px ahead, but he really lands at about 65, 140 and 210 px (he travels about 6 px a frame, not the 8.3 the move asks for), and the marks slide along with him for the first ten frames of the bounce. So the drawn path does not show where he lands. This was already so in Moves 3. I left it alone because both fixes change what you were shown: either draw the marks where he lands (70 px apart), or make him really reach 300 px (a reach buff). Please pick one.
5. **Calculated Bounce can hit one foe twice** (8 or 10 in total) at a few distances. That was already so before this change; the Moves 3 table read as if each foe takes one landing.
6. No pictures were looked at (no browser allowed). The new ripple drawing for the finisher runs without errors, but I have not seen it.

## Checks

All on the built file, one node process at a time, no browser, no relay.

- **Look-alike check** (shape class + effect + numbers within 25%, the same kind as Moves 3; the old script was not in the repo, so I wrote one and first made sure it finds the same three look-alikes on the old build: it does). It was written before the changes and not altered after. 1047 move rows.

| Move | Full matches before | Full matches after |
|---|---|---|
| Yellow Face, Flash Sale | 1 (Fifty Spins) | 0 |
| Loser, Fifty Spins | 1 (Flash Sale) | 0 |
| Tennis Ball, Double Fault | 4 (down-airs of Bomby, Tree, 8-Ball, Bomb) | **2** (down-airs of Sidewalky and Spongy) |
| Tennis Ball, Calculated Bounce | 1 (Wobbling Top) | 0 |
| Pin, Wobbling Top | 1 (Calculated Bounce) | 0 |

- **Dummy foe, old build against new build** (a still foe every 10 px, on the floor and lifted 20 and 45 px):
  - Fifty Spins: 19.5 damage in two hits and the same top speed in both builds; dizzy 0 -> 39 frames left when measured.
  - Double Fault, on the floor: hits a foe from 60 px behind to 80 px in front in both builds, 11.4 behind and 8 in front. One spot differs: a foe 10 px behind him takes 11.4 instead of 8. Lifted 20 px: the same. Lifted 45 px: old hit, new misses.
  - Calculated Bounce, on the floor: the same damage at every distance except one (190 px: 10 instead of 6), and the reach ends at 250 px instead of 240. Lifted 45 px: old hit, new misses.
  - Flash Sale and Wobbling Top: identical in both builds (not changed).
- **CPU matches: 8 in all** (4 with the old build and 4 with the new, the same seeds; Loser, Tennis Ball, Yellow Face and Pin, 3 stocks, stopped at 5400 frames). 0 errors, no bad positions. The CPUs still press the changed moves. Presses in the 4 old / 4 new matches: Fifty Spins 10 / 11, Double Fault 2 / 5, Calculated Bounce 3 / 4.
- **Balance:** no match of the 8 finished inside 5400 frames, so there is no win count. Stocks left, summed over 4 matches, old / new: Loser 8 / 8, Tennis Ball 8 / 6, Yellow Face 9 / 6, Pin 8 / 7. Four matches is far too few to say anything (Yellow Face and Pin were not changed and moved as much as Tennis Ball). The dummy numbers above are the real evidence that damage and launch did not move. I tuned nothing.
- **syncheck**: 2 scripts checked, 0 failed. **bootcheck**: clean (0 bad positions in FFA and Teams, no errors, control bytes 0, bare LF 0, no hidden names, kit guard ok).
- Scripts and outputs: the session scratchpad folder `moves4` (alike.py, dump.mjs, measure.mjs, calib.mjs, cpu.mjs).
