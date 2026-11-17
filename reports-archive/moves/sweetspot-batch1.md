# Sweet-spot pass, batch 1: old vs new move list (FOR THE OWNER, BEFORE ANY MERGE)

Branch `g-sweet1` (from `g-update6` beca9bb5). Not pushed, not merged.
The owner, 2026-11-17: "should we have sweetspots and sourspots?" Yes, on 1 or 2 existing moves per fighter. And "Fewer sweet spots": a sweet spot is not the whole point of a move, and not every move gets one.

## What changed, in short

- 20 regular fighters get a sweet spot and a sour spot on a single existing move each. No jabs, smashes or specials.
- Each move keeps its name, shape, reach, frames, pose and animation. The hit area is cut into two parts that together are exactly the old area. Only the damage and launch differ by part.
- The animation and the drawn prop are still aimed from the old whole box. A new `look` field holds that box, and it is checked: the move animation and its aim are byte-identical before and after for all 20 moves.
- A sweet-spot hit uses what the game already has: the pale-blue CLEAN spark (`sweet:true`, the same flag as Jammy's rows). On most of these moves the stronger hit also gets one more frame of the strong-hit freeze (measured: 3 frames held instead of 2, or 4 instead of 3). Nothing new was added.
- Which part wins when a foe touches both parts:
  - **Tip, far end or head is sweet:** the SOUR part wins. You only get the sweet hit with the tip alone, so you have to space it, like a tipper.
  - **Centre of a burst, or the base, is sweet:** the SWEET part wins.
- Average strength is kept. The numbers were set from a real-hit scan (below): the mean damage and launch over every dummy spot the move connects at is the old move's.

### Why these 20

Each fighter had no sweet or sour spot on any move yet; I checked every moveset row, own up/down smash, smash band and up-special band. None is an event fighter. Each one had a move whose shape already has an obvious strong part:

- a point (nail, dart, pencil, star tip, antenna);
- a far end (fry, lifeline, chair, mop head, spoon bowl, bristles, cleat, mic, trunk top, flame tip);
- the centre of a blast (Bomby, Bomb, Tissues);
- a base that is stronger close in (the kettle's spout, a point-blank paintball).

I skipped dives (down-airs that fall onto the foe): there the tip always arrives first, so the sweet spot would be the whole move and a buff. Puffball's protected feel and the up/down smashes ("fewer sweet spots") were left alone too.

## The 20 moves

Numbers are the move row's own numbers. kb is the launch before the target's % scales it. The move card multiplies % by the fighter's damage stat, so the in-game text can read a little higher (for example Tree, Roboty, Bomby, Bomb). Coordinates are px, forward-relative (x ahead of the fighter, y down).

"Real hit" is from throwing the move with real key events at a still Pen dummy at 0%, held at each spot relative to the attacker until it is hit. It shows the damage taken, the launch speed, the CLEAN bit and the freeze frames.

### 1. Naily — up-tilt "Nail Point"
- OLD: "thrusts her point straight up, short, sharp and at once". Capsule (0,-10)→(0,-60) r9. 4.2%, kb [0.3,-8.6], stun 26. Frames 2/3/8.
- NEW regions: SWEET = the point, y -45 to -60. SOUR = the shaft, y -10 to -45 (listed first).
- NEW numbers: sweet 5.3%, kb [0.3,-9.5]. Sour 4%, kb [0.3,-8.4].
- In-game text: "Nail Point — thrusts her point straight up, short, sharp and at once; the very top of the point hits harder (short reach). On hit: 5.3% at the point (4% lower down)."
- Real hit: dummy 0..87 px above = 4%, launch 4.15, held 2. Dummy 90..102 px above = 5.3%, CLEAN, launch 4.97, held 3.

### 2. Fries — forward-air "Fry Skewer"
- OLD: "thrusts one long thin fry straight out ahead, a poke from well out of their reach". Capsule (16,-2)→(112,-2) r8. 5.2%, kb [3.2,-3.6], stun 22. Frames 5/3/12.
- NEW regions: SWEET = the far tip of the fry, x 88 to 112. SOUR = x 16 to 88.
- NEW numbers: sweet 6.5%, kb [3.5,-4.0]. Sour 4.9%, kb [3.1,-3.5].
- In-game text: "...a poke from well out of their reach; the far tip of the fry hits harder (medium reach). On hit: 6.5% at the tip (4.9% closer in)."
- Real hit: x 6..102 = 4.9%, launch 2.31. x 105..126 = 6.5%, CLEAN, launch 2.81.

### 3. Test Tube — forward-air "Dart Jab"
- OLD: "jabs a dart straight ahead from far out". Capsule (14,-4)→(76,-4) r8. 5.8%, kb [2.4,-2.8], stun 22. Frames 5/2/8.
- NEW regions: SWEET = the point of the dart, x 57 to 76. SOUR = x 14 to 57.
- NEW numbers: sweet 7.2%, kb [2.6,-3.1]. Sour 5.4%, kb [2.3,-2.7].
- In-game text: "Dart Jab — jabs a dart straight ahead from far out; the point of the dart hits harder (medium reach). On hit: 7.2% at the point (5.4% closer in)."
- Real hit: x 3..72 = 5.4%, launch 1.70. x 75..90 = 7.2%, CLEAN, launch 2.11.

### 4. Starfruit — up-tilt "Point Up"
- OLD: "points a star tip straight up over his head after a beat; it stabs far up". Capsule (10,-6)→(16,-62) r12. 6%, kb [0.5,-8.6], stun 26. Frames 8/3/10.
- NEW regions: SWEET = the star tip, (14,-45) to (16,-62). SOUR = the rest.
- NEW numbers: sweet 7.5%, kb [0.6,-9.5]. Sour 5.8%, kb [0.5,-8.5].
- In-game text: "...it stabs far up, and the star tip itself hits harder (short reach). On hit: 7.5% at the tip (5.8% lower down)."
- Real hit: spots up to 90 px up = 5.8%, launch 4.47. 93..105 px up = 7.5%, CLEAN, launch 5.33.

### 5. Tree — up-tilt "Trunk Stretch"
- OLD: "stretches his trunk straight up, far over his head, after a beat; whoever it lifts hangs there a moment, ready for an up-air". Capsule (0,-20)→(0,-108) r16. 6.6%, kb [0.4,-7.6], stun 32. Frames 8/4/13.
- NEW regions: SWEET = the top of the trunk, y -86 to -108. SOUR = y -20 to -86.
- NEW numbers: sweet 8.2%, kb [0.4,-8.4]. Sour 6.4%, kb [0.4,-7.5]. Stun 32 on both, so it is still a combo starter.
- In-game text: "...after a beat, and the top of the trunk hits harder; whoever it lifts hangs there a moment, ready for an up-air (medium reach). On hit: 8.5% at the top (6.7% lower down)." (Tree's damage stat shows here.)
- Real hit: up to 135 px up = 6.66, launch 4.0. 138..153 px up = 8.53, CLEAN, launch 4.8.

### 6. Candle — up-air "Flame Rise"
- OLD: "her flame rises straight up above her head". Capsule (0,-12)→(2,-76) r12. 6.8%, kb [0.4,-9], stun 24. Frames 4/3/8.
- NEW regions: SWEET = the tip of the flame, y -57 to -76. SOUR = y -12 to -57.
- NEW numbers: sweet 8.5%, kb [0.4,-9.9]. Sour 6.5%, kb [0.4,-8.8].
- In-game text: "Flame Rise — her flame rises straight up above her head; the tip of the flame is the hottest and hits harder (medium reach). On hit: 8.5% at the tip (6.5% lower down)."
- Real hit: up to 102 px up = 6.5%, launch 4.75. 105..120 px up = 8.5%, CLEAN, launch 5.73.

### 7. Microphone — up-tilt "Stand Up"
- OLD: "swings the mic stand up over her head". Fan r 8..62, angles -2.3..-0.4. 5.2%, kb [0.5,-10.6], stun 24. Frames 5/3/8.
- NEW regions: SWEET = the mic at the top of the stand, the fan's outer band r 46..62. SOUR = r 8..46. Same angles, so the swing slices frame by frame exactly as before.
- NEW numbers: sweet 6.5%, kb [0.5,-11.7]. Sour 4.9%, kb [0.5,-10.3].
- In-game text: "Stand Up — swings the mic stand up over her head; the mic at the top of the stand hits harder (short reach). On hit: 6.5% with the mic (4.9% with the stand)."
- Real hit: closer spots = 4.9%, launch 5.37, held 3. Spots 85..103 px out = 6.5%, CLEAN, launch 6.46, held 3.

### 8. Roboty — up-air "Beep Up"
- OLD: "fires his antenna straight up in a long beep". Capsule (2,-14)→(6,-84) r12. 6%, kb [0.4,-8.8], stun 26. Frames 6/3/10.
- NEW regions: SWEET = the antenna tip, (5,-63) to (6,-84). SOUR = the rest.
- NEW numbers: sweet 7.5%, kb [0.4,-9.7]. Sour 5.8%, kb [0.4,-8.7].
- In-game text: "Beep Up — fires his antenna straight up in a long beep; the tip of the antenna hits harder (medium reach). On hit: 7.8% at the tip (6% lower down)." (Roboty's damage stat shows here.)
- Real hit: up to 111 px up = 6.03, launch 4.62. 114..129 px up = 7.8, CLEAN, launch 5.49.

### 9. Lifering — forward-air "Lifeline Lash"
- OLD: "lashes the lifeline straight out ahead to its full length; a long reach". Capsule (14,2)→(112,8) r13. 7%, kb [3.4,-3], stun 22. Frames 7/4/11.
- NEW regions: SWEET = the far end of the line, x 88 to 112. SOUR = x 14 to 88.
- NEW numbers: sweet 8.7%, kb [3.7,-3.3]. Sour 6.6%, kb [3.3,-2.9].
- In-game text: "...a long reach, and the far end of the line hits harder (medium reach). On hit: 8.7% at the far end (6.6% closer in)."
- Real hit: x 0..108 = 6.6%, launch 2.33, held 3. x 111..132 = 8.7%, CLEAN, launch 2.83, held 4.

### 10. Bow — forward-air "Chair Swing"
- OLD: "a slow, wide swing of the chair; her hardest forward hit". Capsule (18,-4)→(76,-4) r17, a SWEPT swing over frames 8-10 (each frame hits the next third, near to far). 8%, kb [3.6,-3], stun 24. Frames 8/3/11.
- NEW regions: SWEET = the chair at the far end, x 56.67 to 76, live on frame 10 only. SOUR = x 18 to 56.67, frames 8-9. This is exactly the old frame-by-frame slices.
- NEW numbers: sweet 10%, kb [4.0,-3.3]. Sour 7.6%, kb [3.5,-2.9].
- In-game text: "Chair Swing — a slow, wide swing of the chair; her hardest forward hit, and the chair at the far end of the swing hits harder (medium reach). On hit: 10% at the far end (7.6% closer in)."
- Real hit: x 0..81 = 7.6%, launch 2.5, held 3. x 84..99 = 10%, CLEAN, launch 3.1, held 4.

### 11. Marshmallow — up-tilt "Mop Up"
- OLD: "swings the mop up and over her head". Fan r 8..66, angles -2.4..-0.3. 4.6%, kb [0.5,-10.8], stun 25. Frames 5/3/9.
- NEW regions: SWEET = the mop head, outer band r 50..66. SOUR = the handle, r 8..50.
- NEW numbers: sweet 5.7%, kb [0.5,-11.9]. Sour 4.4%, kb [0.5,-10.6].
- In-game text: "Mop Up — swings the mop up and over her head; the mop head at the end hits harder than the handle (short reach). On hit: 5.7% with the mop head (4.4% with the handle)."
- Real hit: closer = 4.4%, launch 5.45, held 2. 91..109 px out = 5.7%, CLEAN, launch 6.43, held 3.

### 12. Silver Spoon — forward-air "Spoonful"
- OLD: "a heavy spoonful straight ahead; one of his hardest forward hits". Capsule (16,-2)→(70,-2) r15. 9%, kb [3.6,-3], stun 25. Frames 7/3/10.
- NEW regions: SWEET = the bowl, x 54 to 70. SOUR = the handle, x 16 to 54.
- NEW numbers: sweet 11.2%, kb [4.0,-3.3]. Sour 8.5%, kb [3.5,-2.9].
- In-game text: "...one of his hardest forward hits, hardest with the bowl at the far end (medium reach). On hit: 11.2% with the bowl (8.5% with the handle)."
- Real hit: x 0..75 = 8.5%, launch 2.57, held 3. x 78..93 = 11.2%, CLEAN, launch 3.2, held 4.

### 13. Paintbrush — forward-air "Brush Stroke"
- OLD: "a long, hard brush stroke straight ahead". Capsule (14,-4)→(70,-4) r14. 7%, kb [3,-3], stun 24. Frames 6/3/9.
- NEW regions: SWEET = the bristles, x 53 to 70. SOUR = the handle, x 14 to 53.
- NEW numbers: sweet 8.8%, kb [3.3,-3.3]. Sour 6.7%, kb [2.9,-2.9].
- In-game text: "Brush Stroke — a long, hard brush stroke straight ahead; the bristles at the end hit harder than the handle (medium reach). On hit: 8.8% with the bristles (6.7% with the handle)."
- Real hit: x 0..75 = 6.7%, launch 2.14, held 3. x 78..90 = 8.8%, CLEAN, launch 2.64, held 4.

### 14. Baseball — up-tilt "Pop Fly"
- OLD: "kicks one leg up in a high arc over him, lofting them like a pop fly". Fan r 10..66, angles -2.4..-0.3. 6.2%, kb [0.6,-11.4], stun 29. Frames 6/4/10.
- NEW regions: SWEET = the cleat, outer band r 50..66. SOUR = the leg, r 10..50.
- NEW numbers: sweet 7.8%, kb [0.7,-12.5]. Sour 5.9%, kb [0.6,-11.2].
- In-game text: "...lofting them like a pop fly; the cleat at the end of the leg hits harder (short reach). On hit: 7.8% with the cleat (5.9% with the leg)."
- Real hit: closer = 5.9%, launch 6.06. 94..109 px out = 7.8%, CLEAN, launch 7.2.

### 15. Apple — up-tilt "Pencil Up"
- OLD: "jabs her pencil up over her head". Fan r 8..62, angles -2.3..-0.4. 4.9%, kb [0.5,-10.6], stun 24. Frames 5/3/8.
- NEW regions: SWEET = the pencil point, outer band r 46..62. SOUR = r 8..46.
- NEW numbers: sweet 6.1%, kb [0.5,-11.7]. Sour 4.6%, kb [0.5,-10.3].
- In-game text: "Pencil Up — jabs her pencil up over her head; the point of the pencil hits harder (short reach). On hit: 6.1% at the point (4.6% closer in)."
- Real hit: closer = 4.6%, launch 5.32, held 2. 85..103 px out = 6.1%, CLEAN, launch 6.39, held 3.

### 16. Tea Kettle — forward-air "Spout Blast" (base is sweet)
- OLD: "blasts a jet of steam straight ahead from her spout". Capsule (16,-8)→(70,-8) r14. 7.6%, kb [3.4,-3], stun 25, burns 40. Frames 7/3/10.
- NEW regions: SWEET = right at the spout, x 16 to 19 (with its radius, the first ~30 px of the jet; listed first). SOUR = x 19 to 70. Both burn as before.
- NEW numbers: sweet 8.8%, kb [3.7,-3.3]. Sour 6.3%, kb [3.0,-2.7].
- In-game text: "Spout Blast — blasts a jet of steam straight ahead from her spout; the steam right at the spout is the hottest and hits harder (medium reach). On hit: 8.8% right at the spout (6.3% further out), burns them."
- Real hit: x 0..42 = 8.84, CLEAN, launch 2.84, held 4. x 45..92 = 6.34, launch 2.09, held 3.

### 17. Teddy Bear — forward-air "Paint Slug" (base is sweet)
- OLD: "fires a point-blank paintball straight ahead". Capsule (16,0)→(78,0) r9. 6%, kb [2.6,-2.8], stun 22. Frames 5/2/9.
- NEW regions: SWEET = point-blank, x 16 to 21 (listed first). SOUR = x 21 to 78.
- NEW numbers: sweet 7%, kb [2.9,-3.1]. Sour 5.2%, kb [2.4,-2.6].
- In-game text: "Paint Slug — fires a point-blank paintball straight ahead; it hits harder right at the muzzle than further out (medium reach). On hit: 7% point-blank (5.2% further out)."
- Real hit: x 3..36 = 7%, CLEAN, launch 2.23. x 39..93 = 5.2%, launch 1.70.

### 18. Bomby — forward-air "Shrapnel Burst" (centre is sweet)
- OLD: "...a slow heavy hit". Disc centre (48,-6) r26. 8.8%, kb [4,-2.2], stun 24. Frames 8/3/18, with his push forward.
- NEW regions: SWEET = the centre, a disc r5 at (48,-6), listed first: it counts when the blast's centre is within 5 px of the foe's body. SOUR = the whole old disc.
- NEW numbers: sweet 10.2%, kb [4.4,-2.4]. Sour 7.5%, kb [3.6,-2].
- In-game text: "...a slow heavy hit, hardest at the centre of the burst (medium reach). On hit: 10.6% at the centre (7.8% at the edge)." (Bomby's damage stat shows here.)
- Real hit: near edge = 7.8, launch 2.33, held 3. Centre = 10.61, CLEAN, launch 3.1, held 4. Far edge = 7.8.

### 19. Bomb — back-air "Rear Pop" (centre is sweet)
- OLD: "pops a small blast out behind him; his strongest air hit". Disc (-46,0) r26. 9%, kb [-8.8,-4.6], stun 15. Frames 6/3/11.
- NEW regions: SWEET = centre disc r5 at (-46,0), listed first. SOUR = the whole old disc.
- NEW numbers: sweet 10.4%, kb [-9.7,-5.1]. Sour 7.7%, kb [-8.0,-4.2].
- In-game text: "Rear Pop — pops a small blast out behind him; his strongest air hit, hardest at the centre of the blast (short reach). On hit: 10.8% at the centre (8% at the edge)."
- Real hit: edges = 8.01, launch 5.35, held 3. Centre (33..54 px behind) = 10.82, CLEAN, launch 6.98, held 4.

### 20. Tissues — back-air "Backwards Achoo" (centre is sweet)
- OLD: "sneezes out hard behind him, a big burst a long way back; his strongest hit". Disc (-70,0) r30. 9.6%, kb [-9.6,-5], stun 14. Frames 6/3/20.
- NEW regions: SWEET = centre disc r6 at (-70,0), listed first. SOUR = the whole old disc.
- NEW numbers: sweet 11.2%, kb [-10.6,-5.5]. Sour 8.4%, kb [-8.9,-4.6].
- In-game text: "...his strongest hit, hardest at the centre of the burst (medium reach). On hit: 11.2% at the centre (8.4% at the edge)."
- Real hit: edges = 8.4%, launch 6.01, held 3. Centre (57..78 px behind) = 11.2%, CLEAN, launch 7.69, held 4.

## Average strength (measured, not guessed)

Each move was thrown at a dummy held at every spot 3 px apart along the move's direction. The table gives the mean damage over the spots where it connects, old build vs new build, with two dummies: Pen (tall and thin) and Coiny (round).

| move | Pen old | Pen new (sweet share) | Coiny old | Coiny new (sweet share) |
|---|---|---|---|---|
| Naily up-tilt | 4.20 | 4.19 (14%) | 4.20 | 4.19 (14%) |
| Fries fair | 5.20 | 5.21 (20%) | 5.20 | 5.16 (16%) |
| Test Tube fair | 5.80 | 5.76 (20%) | 5.80 | 5.73 (18%) |
| Starfruit up-tilt | 6.00 | 6.03 (14%) | 6.00 | 6.03 (14%) |
| Tree up-tilt | 6.86 | 6.88 (12%) | 6.86 | 6.88 (12%) |
| Candle uair | 6.80 | 6.79 (15%) | 6.80 | 6.79 (15%) |
| Microphone up-tilt | 5.20 | 5.21 (19%) | 5.20 | 5.25 (22%) |
| Roboty uair | 6.24 | 6.27 (14%) | 6.24 | 6.27 (14%) |
| Lifering fair | 7.00 | 6.97 (18%) | 7.00 | 6.93 (16%) |
| Bow fair | 8.00 | 8.02 (18%) | 8.00 | 8.01 (17%) |
| Marshmallow up-tilt | 4.60 | 4.64 (18%) | 4.60 | 4.67 (21%) |
| Silver Spoon fair | 9.00 | 9.01 (19%) | 9.00 | 8.86 (13%) |
| Paintbrush fair | 7.00 | 7.04 (16%) | 7.00 | 7.03 (16%) |
| Baseball up-tilt | 6.20 | 6.20 (16%) | 6.20 | 6.20 (16%) |
| Apple up-tilt | 4.90 | 4.89 (19%) | 4.90 | 4.92 (22%) |
| Tea Kettle fair | 7.64 | 7.51 (47%) | 7.64 | 7.72 (55%) |
| Teddy Bear fair | 6.00 | 5.90 (39%) | 6.00 | 6.12 (51%) |
| Bomby fair | 9.15 | 8.82 (36%) | 9.15 | 9.52 (61%) |
| Bomb bair | 9.36 | 8.99 (35%) | 9.36 | 9.73 (61%) |
| Tissues bair | 9.60 | 9.26 (31%) | 9.60 | 9.96 (56%) |

- The tip moves are within about 1.5% of the old mean on both dummies.
- The centre and base moves depend on the foe's body. A round, wide foe gets the centre more often, so it is about +4% on Coiny and -4% on Pen. I set those from the average of the two dummies.

## Checks

- Real hit, both regions, every move: see each move above; all 20 give two different results. Script: the session scratchpad `sweet1\realhit.mjs`.
- CPU vs CPU: five 4-fighter matches covering all 20 fighters, AI level 2, 3 stocks, 3600 frames each. 0 errors, 0 bad positions. CPUs landed 1 clean sweet-spot hit in the five matches (Tissues' back-air). CPUs rarely pick these moves, and nothing was tuned for bots.
- Online, two pages on FAKE sockets (net-pair.js; no relay, no site): Bow's fair, Bomb's bair and Fries' fair, each at a sweet spot and a sour spot. Host and guest agree on the damage, the CLEAN bit and the hit frame in all 6 cases.
- syncheck: 2 scripts, 0 failed. bootcheck: 0 errors, 0 bad positions, 0 control bytes, 0 bare LF, no hidden names, kit guard ok.
- Unchanged for all 20 (checked before and after): swept-hit class (swing/thrust), frames (startup/live/recovery), reach, animation (MVA entry and aim, byte-identical).

## Doubtful, for the owner to decide

1. **Tip moves: the sour part wins on overlap.** A foe pressed close and also touching the tip takes the sour hit. That is how a tipper works, and it keeps the average. The other way (sweet wins) would have made the sweet spot almost the whole move on short up-tilts, a buff.
2. **The centre-of-burst moves (Bomby, Bomb, Tissues) depend on the foe's size**, as above: about +-4%.
3. **Tea Kettle and Teddy Bear make the BASE the sweet spot** ("hottest right at the spout", "point-blank"). It is the opposite of a tipper. If you would rather every sweet spot be a tip, these two can go to the next batch instead.
4. **The hit art shows the split.** The drawn hit area is now two shapes, so a disc move shows a small brighter circle in its middle, and a capsule shows a faint seam where the two parts meet. The motion swoosh is drawn in each part. The envelope, frames and animation are unchanged. Pin's and Knife's existing tip moves already look like this.
5. **Bow's sweet hit is on the swing's last frame only**, because her chair swing is swept near to far. This was already true of where the chair hit; it only gets stronger now.
