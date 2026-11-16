# Zero: why he is easy, and options to make him hard and more "Zero" (2026-11-11)

Design only. Nothing in the game was changed. Numbers are from his code in `artifacts/V1/index.html` (the `@boss:zero` blocks, table `ZR`) and from the ledger rows of 2026-11-10. Where I say "measured" the ledger measured it; where I say "read from the code" nobody has played or modelled it, it is my reading. None of the options below has a dodge proof yet: each needs one (slowest runner Tree, weakest jumper Spongy) before it is built.

One frame = 1/60 s. One full boss hit in the Rush = 33% (22 x 1.5).

## 1. Zero today

1,800 HP. Three phases, cut at 66% and 33% (six steps: each phase gets a little harder at its midpoint). Phase 1 he keeps 300 px away from you and runs; phase 2 he turns red and walks at you; phase 3 he is the Giant, planted near the middle.

| Attack | What it does | Tell (wind-up) | Damage | Phases |
|---|---|---|---|---|
| ROLL CALL! (signature) | Lines of small Zeroes march in from the stage ends along the floor, 7 px/frame, 310 px apart. 4-5 a line, two lines in phase 2, a third line on the centre platform in phase 3. | Megaphone up, 60 frames | 26% (0.8) | all |
| TAPE TOSS! | 4 to 8 tapes fall in a comb 150 px apart, one on your spot. Flight 40-44 frames, a shadow for the last 30. | Rears back with the box, 45 | 20% (0.6) | all |
| DIVIDE BY ZERO! | A chop with the division sign right next to him (side fixed 45 frames early). Later two dots roll away; last step adds a backhand. | Coils, white glow, 55 | 33% (1.0), dots 20% | all |
| STOP LAUGHING AT ME! | Pops into a freezer door, bangs 3 times, rolls out flat along the floor at 12.5 px/frame. Then he is stunned 55 frames. | Door bangs, 68 | 33%, door 16% | 2 only |
| GET HIM! | A scuffle cloud drops from a pipe and rolls after you on the floor (5.4 to 7.8 px/frame), two passes. 1-3 clouds. | Stamps and points twice, 40 | 26% (0.8) | 2, 3 |
| THE FOOT! | A shadow follows you, locks, a giant foot drops 44 frames later. A second foot at the last step. | Leg lifts, 58 | 33% | 3 only |

Rest between attacks: 79 / 55 / 34 frames by phase. Phase 3: every turn is a combo of two moves (12 frames between, each with its full wind-up). THE FIZZLE: if he loses 18 HP during ROLL CALL!'s wind-up, the call is cancelled and he stands open for 90 frames.

### Why he is easy, against Six and X

| | Zero | Six | X |
|---|---|---|---|
| Wind-ups (frames) | 40-68, the SAME in every phase | 26-45, shorter each phase | 45-60 (one drops to 32) |
| Rest between attacks | 79 / 55 / 34 | 132 / 96 / 60 | 89 / 58 |
| Combos | phase 3, every turn | phase 3, every other turn | phase 2, every other turn |
| Phases | 3 (66%, 33%) | 3 (50%, 25%) | 2 (50%) |
| Wind-ups a minute, last phase (measured) | 13 | 21 | 12 |
| A new wind-up while an old move is still live (measured) | 22% | 47% | 0% |
| Damage per hit | 20-33%, three of six moves under a full hit | 26-33%, five of six are full hits | 20-33% |
| Fastest thing on the floor | 12.5 px/frame (one move), the rest 7-8 | rakes 10-12.5 | dash 28-32 |
| What protects the boss | nothing; the fizzle HELPS the player | a bubble soaks 120 + 120 + 100, and comes back | HIDE AND SEEK! |

So it is not the rest time: his rest is already the shortest and he already combos the most. The reasons are these.

1. **Long, flat wind-ups.** Every move gives 40-68 frames of warning and never gets quicker. Six is at 26-36 by phase 3. (Measured: 13 wind-ups a minute against her 21.)
2. **Everything is slow and on the floor.** Marchers at 7 px/frame are barely faster than a running fighter (about 6). One small hop beats ROLL CALL!, GET HIM! and the roll alike. Read from the code: in phases 1 and 2 nothing of ROLL CALL!, GET HIM! or the roll reaches the centre platform, so standing up there skips three of his five moves.
3. **Every aimed move aims at where you WERE.** Tapes, the foot and the chop lock 26-45 frames early. A player who just keeps moving one way is missed by all three. No move makes you read something and choose (Six's rain gaps and pull zone, X's high-low juice jets and snap columns do).
4. **He helps you.** 18 HP is 1% of his health: almost any hit during the 60-frame megaphone wind-up cancels his signature and hands you 90 free frames. He is also stunned 55 frames after the roll, and the Giant is a huge target (twice the size) that stands still.
5. **Phase 1 is three slow moves from a boss who runs away**, so the first third of the fight has no pressure at all.
6. **Lighter hits**: tapes 20%, marchers and clouds 26%.

## 2. Options

### A. THE NUMBERS PASS (no new art; makes what he has bite)
- Wind-ups get shorter by phase, like Six's: ROLL CALL! 60 / 50 / 42, TAPE TOSS! 45 / 38 / 32, DIVIDE BY ZERO! 55 / 46 / 38, GET HIM! 40 / 34. THE FOOT! keeps its 26-frame lock (the model already showed that less is unfair).
- Marchers 7 -> 8 / 9 / 10 px/frame. Tapes 20% -> 26%.
- THE FIZZLE needs a real burst: 18 HP -> 60 / 90 HP, and none in phase 3. The stun after the roll 55 -> 35 frames.
- Tell and dodge: unchanged, only quicker. Fits Zero: nothing new; this is the plain fix.

### B. NOUGHTS! (new; the falling waves the owner asked for, with Zero's own twist)
- What: big hollow Zeroes fall from the ceiling in a row across the stage. Each ring is about 240 px wide with a 100 px hole. The rings sit edge to edge, so the ONLY safe spots are the holes.
- Tell: he whistles through the megaphone (about 40 frames); a ring-shaped shadow for every Zero is on the floor the whole time, the hole lit, the rim dark.
- Dodge: stand in a hole. The nearest hole is never more than about 120 px away. Phase 2: a second wave, its holes shifted. Phase 3: three waves, and the rings land and roll one ring-width before they fade (stay put, do not chase).
- Fits Zero: the safe place is the empty middle of a zero. Six's rakes make you stand BETWEEN things; this makes you stand INSIDE one, so it reads differently.

### C. ROLL CALL! LOOPS (rework of the signature)
- What: the conga does not leave. A line that walks off one end comes back in at the other, one level up: floor, then the platforms, then the floor again. One lap in phase 1 (so the platform is no longer a shelter), two in phase 2, three in phase 3, each lap a little faster. The gap between marchers stays 310 px.
- Tell: the megaphone as now, plus a number over the pipe mouth (the laps left) and the pipe glows before each re-entry.
- Dodge: hop a line on the floor, drop or stay down when the lap is on the platforms. You must change level in time with the laps.
- Fits Zero: a loop, a zero drawn with marching Zeroes.

### D. DIVIDE BY ZERO! FOR THE WHOLE STAGE (rework)
- What: now it only reaches players next to him. New: he slams the sign into the floor. The LINE of the sign runs out along the floor both ways (10 px/frame, low), and the two DOTS fly out after it, one low, one high, in a set order.
- Tell: the sign lifts over his head, the line glows white, the dot that will go high blinks (55 frames, shorter by phase).
- Dodge: jump the line, then hop or stay down for the dots as shown by the blink. Phase 3: when the line reaches a wall it comes back once.
- Fits Zero: his best-known sign becomes a move for the whole room, and the "which dot is high" read is the kind of choice he lacks today.

### E. THE GIANT WALKS (phase 3 rework)
- What: the Giant stops being a planted target. He crosses the stage in 3 to 5 slow steps. Each step is a FOOT with its own locked shadow (the same fair 44 frames), and each landing sends a low RING of dust out both ways along the floor (a zero that grows).
- Tell: the leg lifts and the shadow locks, as THE FOOT! does now; the ring is plainly seen leaving the foot.
- Dodge: step out of the shadow, then hop the ring. Between steps he is open, so a brave player hits the standing leg.
- Fits Zero: the Giant Zero's stomp from the show, and round rings.

### F. ZERO GRAVITY (new, phase 2 on)
- What: for about four seconds everything floats. Your jumps go higher and you fall slowly. Tapes and small Zeroes drift across at two heights with gaps.
- Tell: dust, tapes and his hat lift off the floor, the room tints blue (45 frames); a bar shows the time left.
- Dodge: short hops and patience; a full jump carries you into the high lane. It ends with everything dropping straight down (shadows first).
- Fits Zero: the pun. Honest note: it changes how YOUR fighter moves for a few seconds, and that touches the engine, not only his own code. More work, more risk.

### G. THE GUARD RING (new, phase 1; fixes "he just runs away")
- What: six small Zeroes circle him in a ring with ONE gap. Touching a guard hurts (20%). Shots that hit a guard are cancelled. The gap goes round slowly.
- Tell: always visible; the gap is lit. It re-forms with a 40-frame grow-in after you break it (10 hits on him).
- Dodge: go in through the gap, hit, come out before it turns. From far away, shoot through the gap.
- Fits Zero: an empty ring with nothing in the middle but him; cancelling. Honest note: it could annoy close-range fighters; it gives him the "protection" Six's bubble gives her.

### H. TIMES ZERO (small extra for phase 3)
- What: a big multiplication sign spins out from him across the stage once. It does no damage to you. Any shot, item or summon of yours that it touches turns into nothing.
- Tell: he holds the x over his head, 40 frames.
- Dodge: do not shoot into it; jump it to keep an item you carry.
- Fits Zero: anything times zero is zero. Honest note: it makes no pressure by itself; it only works on top of the others.

## 3. Recommended package: A + B + C + E

- **A** fixes the slow, flat wind-ups and the free fizzle (the biggest reasons, and cheap).
- **B** gives him the one "read it and choose" move he lacks, in the falling-wave style the owner asked for.
- **C** makes his signature a real threat on every level of the stage.
- **E** turns the phase-3 target into the high point of the fight.
- D is the first swap-in if one of these is not wanted. F and G are the riskiest; H is a garnish.

Difficulty target: **between Six and X, nearer Six.** About 18 wind-ups a minute in phase 3 (now 13; Six 21, X 12), most hits at 26-33%, no shelter on the platform, no free 90-frame opening from one poke. He is boss 5 of the run, right after Six, so "as hard as Six, in a different way" is the aim: two or three attempts for a good player.

Cost and proof: A is numbers only. B, C and E are each one new or reworked move, all inside his own code blocks. All four need a fresh dodge proof (every phase, and every combo pair they can land in) before the owner plays them. A combo with no proven dodge is cut, as was done for another boss.

## 4. Questions for the owner

1. **How hard should Zero end up?**  (a) a little under Six  (b) level with Six and X (recommended)  (c) the hardest of the first six bosses
2. **THE FIZZLE (hit him during the megaphone and the call fails):**  (a) keep it as it is  (b) keep it, but it needs a real burst of damage, and never in phase 3 (recommended)  (c) remove it
3. **The Giant in phase 3:**  (a) stays planted as now  (b) walks and stomps across the stage, option E (recommended)  (c) something else: say what
4. **Which new move?**  (a) NOUGHTS!, falling rings, stand in the holes (recommended)  (b) DIVIDE BY ZERO! for the whole stage  (c) ZERO GRAVITY, which changes your own jump for a few seconds  (d) THE GUARD RING in phase 1  (more than one is fine)

## 5. OWNER ANSWERS (2026-11-11)
1. How hard: LEVEL WITH SIX AND X.
2. THE FIZZLE: REMOVE IT.
3. The Giant in phase 3: WALKS AND STOMPS (option E).
4. New moves: DIVIDE BY ZERO! (whole stage, option D) and THE GUARD RING (option G), plus NOUGHTS! REDEFINED by the owner, verbatim: "noughts should be a teleport, then a trail of damaging zeroes while he lunges from the air to the floor diagonally then rushes towards you."
Lead reading: option A (the numbers pass) comes with 'level with Six and X'; option C (ROLL CALL! LOOPS), F (ZERO GRAVITY) and H (TIMES ZERO) were not picked.
5. OWNER (later, 2026-11-11): "zero needs more ranged attacks. he feels like base announcer(save for the tapes) rn" -> at least 2 ranged patterns besides NOUGHTS!, in every phase.
6. OWNER (2026-11-11): "last phase zero feels no different from second phase zero." -> phase 3 clearly different: transition, Giant form, at least 2 phase-3-only moves/combos, a different rhythm.
