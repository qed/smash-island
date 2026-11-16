# Moves 4: old against new (branch g-moves4, 2026-11-16)

Three small fixes for the look-alikes that the Moves 3 report listed, plus your answer on Calculated Bounce. Not pushed, not merged. The live relay was never touched. None of these moves is live yet (they are Moves 3 work), so no live move is remade.

How to read the numbers: damage is what a foe takes in a match, launch is the strength of the throw. Everything was measured on the built game with a still dummy foe.

## Your three answers (2026-11-16)

1. **Fifty Spins dizzy: YES, keep.** Kept.
2. **Double Fault floor ripple: KEEP as is.** Kept.
3. **Calculated Bounce marks: "Make him reach the marks".** Built: he now really lands on the three marks, 100 / 200 / 300 px ahead, and the marks stay where they were laid. Damage 4 / 4 / 6 and launch are the same. The longer reach is your accepted buff; nothing else was changed to make up for it.

## The table

| # | Fighter, move | OLD | NEW | Numbers (old -> new) | Why it is no longer a look-alike |
|---|---|---|---|---|---|
| 1 | Loser, **Fifty Spins** (smash) | Whirls a swing seat in an upright circle in front of him, twice. The second turn throws. No effect. | The same move, same circle, same timing. The second turn now also leaves the foe **dizzy**: their arrows are swapped for 40 frames (two-thirds of a second). | 7.5 then 12 (19.5), launch 11.0 -> the same. Measured 19.5 and the same top speed in both builds. Dizzy 0 -> 40 frames. | Yellow Face's Flash Sale is two pops with no status; Fifty Spins now has its own effect. Same shape + different effect is not a duplicate. Reason: anyone is dizzy after fifty spins. |
| 1 | Yellow Face, **Flash Sale** | two pops in front, "and a SECOND one FREE" | **not changed** | 9 then 15, launch 11.0 | (the other half of pair 1) |
| 2 | Tennis Ball, **Double Fault** (down smash) | Two bounces: lands in front, then behind. Each landing hits with a ball-sized round patch on his body. | The same two bounces, same places, same timing. Each landing hits as a **flat ripple along the floor** under him (about 70 px wide, ankle high), which is what the drawing already showed. A foe in the air over the ripple is missed. | front 8 / back 11.4, launch 9.0 / 12.2 -> the same. Reach on the floor: the same to within 10 px. A foe 45 px off the floor: was hit, now missed. | Only partly: see "Honest notes" 1. You said keep. |
| 3 | Tennis Ball, **Calculated Bounce** (finisher) | A dotted path with marks drawn at 100 / 200 / 300 px, but he really landed at about 65 / 140 / 210 px, sliding while he hit, and the marks slid along with him. Each landing a round patch on his body. | He lands **on** the three marks, 100 / 200 / 300 px ahead, and stands on each for the three frames its hit is out. Each landing is a flat floor ripple. The marks are laid once and stay put; each goes out when he has landed on it. **A mark with no floor under it is not laid:** he makes the bounces he has left on the last mark that has floor (see "Ledges"). | 4, 4, 6, launch 8.1 on the third -> the same per hit. Reach: about 250 px -> 330 px. See "Where it hits" for what changed. | Pin's Wobbling Top is her round body spinning on the spot. The bounce is three flat floor ripples at three fixed spots up to 300 px away. |
| 3 | Pin, **Wobbling Top** | spins on her point and wanders | **not changed** | 5, 5, 8, launch 8.0 | |

Not touched: every other move, Eraser, all damage and launch numbers. I compared all 1047 move rows of the old and the new build: only these three rows differ.

## Calculated Bounce: where it hits now (measured, a still foe on the floor)

| Foe stands this far ahead | OLD | NEW |
|---|---|---|
| 20 px | nothing | nothing |
| 30 to 60 px | 4 | **nothing** (he sails over a foe right beside him) |
| 70 to 130 px | 4 (8 at 100 and 110) | 4 (first mark) |
| 140 to 160 px | 4 | **nothing** (between the marks) |
| 170 to 230 px | 10 at 170 to 190, then 6 | 4 (second mark) |
| 240 to 260 px | 6 at 240 (and at 250 facing right), then nothing | **nothing** (between the marks) |
| 270 to 330 px | nothing | 6 and the launch (third mark) |

- Where he stands on the frames each hit is out: OLD 61-73, 134-146, 206-212 px (sliding). NEW exactly 100, 200, 300 px. The new numbers are the same facing right and facing left.
- So the card text is now true: a foe between two marks is sailed over. Two things got weaker with it: a foe right beside him is no longer hit, and one foe can no longer take two landings (the old move could do 8 or 10 to one foe; now it is 4 or 6).

## Ledges

- **OLD:** he bounced his full distance whatever was under him. Measured: with the stage end 150 px ahead he bounced off it and lost a stock; on a platform with its end 150 px ahead he bounced off the end and fell to the floor below.
- **NEW:** before he starts, each mark is checked for floor (a surface no more than 60 px below his feet). Marks are laid only as far as the floor goes. Measured: stage end 150 px ahead (no mark has floor): he makes all three bounces on the spot and keeps his stock. Platform end 150 px ahead: one mark is laid, he lands on it at 100 px and makes the other two bounces there; he does not fall.
- So he never bounces himself off a ledge now, which is less often than before, not the same as before. **This is the one place I did not do exactly what was asked:** "keep it the way the old move handled ledges" and "not off a ledge any more often than before" cannot both hold once he travels 300 px, so I took the safe one. If you want the old way back (he goes the full 300 px even into a pit), it is a one-line change.
- If the 300 px mark is over a pit but the 200 px mark has floor: by the rule he lands on 100, then 200, and makes the third bounce (the 6 and the launch) at 200. I measured the "no mark" and "one mark" cases, not this "two marks" case.

## Honest notes

1. **Double Fault still matches two moves in the look-alike check.** Before: 4 matches (the down-airs of Bomby, Tree, 8-Ball and Bomb; the Moves 3 report called the third one Pencil's). After: 2 matches, different ones: Sidewalky's Pavement Drop and Spongy's Crushed by Spongy, also flat and low. I did not change the check to hide this. The check cannot see where the fighter goes, so "a ground smash that hops in front and then behind" and "a drop out of the air" look the same to it. I did not add an effect just to pass the check, because that was the fault found in the old slow.
2. **Tennis Ball's two moves can now be jumped over.** A foe about 45 px off the floor used to be hit and is now missed (at 20 px they are still hit; the 20 and 45 px heights were measured before "reach the marks", the ripple itself has not changed since). A small nerf.
3. **Fifty Spins got an effect it did not have.** Damage and launch are the same; dizzy is a small buff.
4. **The CPU uses Calculated Bounce less often now.** The CPU used to fire it at a foe in jab reach. The new move sails over a foe that close, so I gave the CPU a new read for this one move: it fires when the foe stands on the floor within 30 px of a mark that has floor (30 px is the measured hit window). In a scripted scene (a CPU Tennis Ball against a still foe kept at 90%, 2400 frames, two runs): OLD 12 uses, 9 hit. NEW 3 uses, 3 hit (one of the two runs had 0 uses). So it hits when it is used, but it is used about a quarter as often, because a CPU that fights up close is seldom 100 px away. I did not change anything else to push that number up. This is a change to how the CPU plays Tennis Ball's finisher, and it is the weak point of this build.
5. **Two small engine lines were needed** for "reach the marks": a move row may now hold its own speed (the run-speed cap was what cut his bounces from 100 px to about 70), and a row's push may be worked out when the move starts (so he does not go to a mark with no floor). Only Calculated Bounce uses either.
6. No pictures were looked at (no browser allowed). The marks and the ripple drawing run without errors, but I have not seen them.
7. A mark is checked for floor only at the mark itself. A wall between him and a mark, or a floor at a different height, was not tested. Online play (a guest seeing the marks) was not tested.

## Checks

All on the built file, one node process at a time, no browser, no relay.

- **Look-alike check** (shape class + effect + numbers within 25%, the same kind as Moves 3; the old script was not in the repo, so I wrote one and first made sure it finds the same three look-alikes on the old build: it does). Written before the changes and not altered after. 1047 move rows.

| Move | Full matches before | Full matches after |
|---|---|---|
| Yellow Face, Flash Sale | 1 (Fifty Spins) | 0 |
| Loser, Fifty Spins | 1 (Flash Sale) | 0 |
| Tennis Ball, Double Fault | 4 (down-airs of Bomby, Tree, 8-Ball, Bomb) | **2** (down-airs of Sidewalky and Spongy) |
| Tennis Ball, Calculated Bounce | 1 (Wobbling Top) | 0 (and 0 moves in the same shape class) |
| Pin, Wobbling Top | 1 (Calculated Bounce) | 0 |

  One thing to know: the check now also notes that Calculated Bounce runs a little code when it starts (the floor check) and lists that under "effect". That alone would have made it differ, so the line that counts is "0 moves in the same shape class", which was already so before your answer.

- **Dummy foe, old build against new build** (a still foe every 10 px, on the floor and lifted 20 and 45 px):
  - Fifty Spins: 19.5 damage in two hits and the same top speed in both builds; dizzy 0 -> 39 frames left when measured.
  - Double Fault, on the floor: hits a foe from 60 px behind to 80 px in front in both builds, 11.4 behind and 8 in front. One spot differs: a foe 10 px behind him takes 11.4 instead of 8. Lifted 20 px: the same. Lifted 45 px: old hit, new misses.
  - Calculated Bounce: the table above.
  - Flash Sale and Wobbling Top: identical in both builds (not changed).
- **CPU matches, first round: 8** (4 old build, 4 new, same seeds; Loser, Tennis Ball, Yellow Face and Pin, 3 stocks, stopped at 5400 frames). 0 errors, no bad positions. Presses old / new: Fifty Spins 10 / 11, Double Fault 2 / 5, Calculated Bounce 3 / 4.
- **CPU matches, after "reach the marks": 4** (the new build, same lineup). 0 errors, no bad positions. Calculated Bounce was pressed once in the 4 matches, Double Fault not at all (it had not changed, so that is how much these small samples swing). **These 4 were run before the CPU's new read was added** (note 4). After it I ran the scripted scene (4800 frames of a CPU Tennis Ball, 0 errors) and the boot check's own CPU matches (0 errors) instead of more matches, to stay inside the limit of 4.
- **Balance:** no match finished inside 5400 frames, so there is no win count, and the samples are far too small to say anything. The dummy numbers are the real evidence. I tuned nothing.
- **syncheck**: 2 scripts checked, 0 failed. **bootcheck**: clean (0 bad positions in FFA and Teams, no errors, control bytes 0, bare LF 0, no hidden names, kit guard ok). Both run on the final file.
- Scripts and outputs: the session scratchpad folder `moves4` (alike.py, dump.mjs, measure.mjs, calib.mjs, marks.mjs, cpu.mjs, cpuread.mjs).
