# Sweet-spot pass, batch 2: old vs new move list (FOR THE OWNER, BEFORE ANY MERGE)

Branch `g-sweet2`, made from `g-update6` 16f97c87, which already has batch 1. Not pushed, not merged.
Done the same way as batch 1 (reports-archive/moves/sweetspot-batch1.md):
- Each fighter gets a sweet and a sour spot on a single existing tilt or aerial. No jabs, smashes or specials, so the new air-smash landing lag is untouched.
- The old hit area is split exactly into two parts. Frames, reach, swing timing, pose and animation stay the same; for all 20, the `look` field keeps the animation aim byte-identical.
- The sweet part gets the existing pale-blue CLEAN spark. Most sweet hits also get one more frame of the existing strong-hit freeze.
- Tips: the SOUR part is listed first, so a foe touching both parts takes the sour hit, and the sweet hit needs the tip alone. Centres: the SWEET part is listed first.
- Average strength is kept, measured with real hits (see the table).

### Why these 20

These are the next 20 regular fighters with no sweet or sour spot on any move, leaning towards tips and centres as asked. 15 are tips and 5 are centres of a burst. There are no base sweet spots this time.

Left out on purpose:
- Bow, Needle, Match, Clover and Blueberry: their animations were just redrawn.
- Puffball: her protected feel.
- Event fighters.
- Dives and multi-hit spins.
- Fighters with no clear strong part (Pillow, Remote, Taco, Sidewalky, Balloon, Salt, Nickel (II), Cheesy, Dough, MeTag, Soap, Taco (II), Paper, Box, Yin-Yang, Jack, Bonesaw, Cherries, Flower). These can go in a later batch if the owner wants.

Numbers are the move row's own. kb is the launch before the target's % scales it; the move card multiplies % by the fighter's damage stat. Coordinates are px, forward-relative (x ahead of the fighter, y down).

"Real hit" means: thrown with real key events at a still Pen dummy at 0%, held at each spot relative to the attacker until hit. It gives the damage taken, the launch speed, the CLEAN bit, and how many frames both are held.

### 1. Leafy — back-air "Back Kick"
- OLD: "kicks out behind her". Capsule (-12,2)→(-56,2) r13. 6%, kb [-7.6,-4], stun 13. Frames 4/3/9.
- NEW regions: SWEET = the heel at the end, x -44 to -56. SOUR = x -12 to -44.
- NEW numbers: sweet 7.5%, kb [-8.4,-4.4]. Sour 5.7%, kb [-7.5,-3.9].
- In-game text: "Back Kick — kicks out behind her; the heel at the end hits harder (short reach). On hit: 7.5% with the heel (5.7% closer in)."
- Real hit: up to 60 px behind = 5.7%, launch 4.7. 63..72 px behind = 7.5%, CLEAN, launch 5.55.

### 2. Teardrop — forward-air "Tail Slash"
- OLD: "slashes down with the point of her tail ahead, knocking them down and out". Capsule (12,-2)→(64,6) r12, a SWEPT slash over frames 4-6 (a third of it each frame, near to far). 5.5%, kb [3,1], stun 22. Frames 4/3/8.
- NEW regions: SWEET = the point, the far third, live on frame 6. SOUR = the near two thirds, frames 4-5. Checked: every frame's slice is the old one.
- NEW numbers: sweet 6.9%, kb [3.3,1.1]. Sour 5.2%, kb [2.9,1].
- In-game text: "...knocking them down and out; the point itself hits harder (short reach). On hit: 6.9% with the point (5.2% closer in)."
- Real hit: up to 66 px = 5.2%, launch 1.97. 69..84 px = 6.9%, CLEAN, launch 2.26.

### 3. Rocky — back-air "Barf Burst" (centre)
- OLD: "barfs a big burst out behind him; his heaviest air hit, and he is open a while after it". Disc (-56,6) r26. 9.6%, kb [-5.4,-8.2], stun 14, poisons 40.
- NEW regions: SWEET = centre disc r5, listed first. SOUR = the whole old disc. Both poison.
- NEW numbers: sweet 11%, kb [-5.9,-9.0]. Sour 8.4%, kb [-4.9,-7.5].
- In-game text: "...his heaviest air hit, hardest at the centre of the burst, and he is open a while after it (medium reach). On hit: 11% at the centre (8.4% at the edge), poisons."
- Real hit: edges = 8.44, launch 5.19, held 3. Centre = 11.04, CLEAN, launch 6.75, held 4.

### 4. Fanny — up-air "Helicopter Up"
- OLD: "beats her blades straight up and forward like a helicopter". Fan r 6..74, angles -2.2..-0.7. 4.1%, kb [0.3,-8.8], stun 24.
- NEW regions: SWEET = the blade tips, outer band r 56..74. SOUR = r 6..56. Same angles.
- NEW numbers: sweet 5.1%, kb [0.3,-9.7]. Sour 3.9%, kb [0.3,-8.6].
- In-game text: "...like a helicopter; the blade tips hit harder (medium reach). On hit: 5.1% with the blade tips (3.9% closer in)."
- Real hit: closer = 3.9%, launch 4.25, held 2. 107..122 px out = 5.1%, CLEAN, launch 5.05, held 3.

### 5. Grassy — back-air "Weed Whip"
- OLD: "whips a weed out behind her". Capsule (-10,0)→(-58,0) r11, SWEPT over frames 4-6. 6.5%, kb [-8,-4.2], stun 14.
- NEW regions: SWEET = the tip of the weed, x -42 to -58, frame 6. SOUR = x -10 to -42, frames 4-5. Slices checked equal.
- NEW numbers: sweet 8.1%, kb [-8.8,-4.6]. Sour 6.1%, kb [-7.8,-4.1].
- In-game text: "Weed Whip — whips a weed out behind her; the tip of the weed hits harder (short reach). On hit: 8.1% at the tip (6.1% closer in)."
- Real hit: up to 57 px behind = 6.1%, launch 4.96. 60..72 px behind = 8.1%, CLEAN, launch 5.91.

### 6. Lightning — forward-air "Bolt Straight"
- OLD: "fires a short, straight bolt ahead of her". Capsule (14,-2)→(74,-2) r10. 5.7%, kb [2.5,-2.7], stun 23.
- NEW regions: SWEET = the tip of the bolt, x 56 to 74. SOUR = x 14 to 56.
- NEW numbers: sweet 7.1%, kb [2.8,-3.0]. Sour 5.4%, kb [2.4,-2.6].
- In-game text: "...; the tip of the bolt hits harder (medium reach). On hit: 7.1% at the tip (5.4% closer in)."
- Real hit: up to 72 px = 5.4%, launch 1.71. 75..90 px = 7.1%, CLEAN, launch 2.16.

### 7. Money — up-tilt "Paper Cut"
- OLD: "whips a bill up and over in an arc ahead of her, leaving a paper cut". Fan r 8..72, angles -2.4..-0.22. 4.5%, kb [0.5,-10.5], stun 27, bleed 60.
- NEW regions: SWEET = the far edge of the bill, outer band r 54..72. SOUR = r 8..54. Both bleed.
- NEW numbers: sweet 5.6%, kb [0.5,-11.6]. Sour 4.2%, kb [0.5,-10.2].
- In-game text: "...leaving a paper cut; the far edge of the bill hits harder (medium reach). On hit: 5.6% with the edge of the bill (4.2% closer in), leaves them bleeding."
- Real hit: closer = 4.24, launch 5.19, held 2. 93..117 px out = 5.64, CLEAN, launch 6.24, held 3.

### 8. TV — up-tilt "Antenna Up"
- OLD: "flicks both antennas up and over in a wide arc". Fan r 4..80, angles -2.5..-0.1, oy -22. 6.3%, kb [0.5,-11], stun 29.
- NEW regions: SWEET = the antenna tips, r 60..80. SOUR = r 4..60.
- NEW numbers: sweet 7.9%, kb [0.6,-12.1]. Sour 6%, kb [0.5,-10.8].
- In-game text: "...in a wide arc; the antenna tips hit harder (medium reach). On hit: 7.9% at the antenna tips (6% closer in)."
- Real hit: closer = 6%, launch 5.84. 120..138 px out = 7.9%, CLEAN, launch 6.98.

### 9. Toothpaste — up-air "Cap Flick"
- OLD: "flicks her cap up and forward in an arc after a beat, tossing them ahead of her". Fan r 8..66, angles -2.0..1.0. 4.2%, kb [4.6,-5.2], stun 24.
- NEW regions: SWEET = the cap, r 50..66. SOUR = r 8..50.
- NEW numbers: sweet 5.2%, kb [5.1,-5.7]. Sour 4%, kb [4.5,-5.1].
- In-game text: "...tossing them ahead of her; the cap at the end hits harder (short reach). On hit: 5.2% with the cap (4% closer in)."
- Real hit: along the middle of the arc, sour 0..40 px, then sweet 43..48 px, then sour 50..63 px, then sweet 65..75 px. The arc is very wide (sweeping from up-back to down-forward), so a foe a little high and close is first touched by the cap on the early frames. See doubt 3.

### 10. Fern — forward-air "Frond Swing"
- OLD: "swings a frond straight ahead; hit, and it can jump out of it". Capsule (16,-4)→(68,-4) r15. 9%, kb [3.7,-3.1], stun 26, jump-cancel on hit.
- NEW regions: SWEET = the tip of the frond, x 52 to 68. SOUR = x 16 to 52.
- NEW numbers: sweet 11.2%, kb [4.1,-3.4]. Sour 8.6%, kb [3.6,-3].
- In-game text: "Frond Swing — swings a frond straight ahead, and the tip of the frond hits harder; hit, and it can jump out of it (medium reach). On hit: 11.2% at the tip (8.6% closer in)."
- Real hit: up to 75 px = 8.6%, launch 2.67, held 3. 78..90 px = 11.2%, CLEAN, launch 3.29, held 4.

### 11. Balloony — down-tilt "Pin Prick"
- OLD: "pricks the floor at their feet with a hiss". Capsule (8,22)→(54,22) r12. 3.3%, kb [1.5,-7], stun 23.
- NEW regions: SWEET = the point of the pin, x 42 to 54. SOUR = x 8 to 42.
- NEW numbers: sweet 4.1%, kb [1.7,-7.7]. Sour 3.2%, kb [1.5,-6.9].
- In-game text: "...with a hiss; the point of the pin hits harder (short reach). On hit: 4.1% at the point (3.2% closer in)."
- Real hit: up to 61 px = 3.2%, launch 3.32. 64..75 px = 4.1%, CLEAN, launch 3.89.

### 12. Lightbulb — back-air "Backfire" (centre)
- OLD: "backfires a pop of current out behind her". Disc (-44,-4) r22. 6.6%, kb [-7.8,-4], stun 13.
- NEW regions: SWEET = centre disc r5, listed first. SOUR = the whole old disc.
- NEW numbers: sweet 7.6%, kb [-8.6,-4.4]. Sour 5.6%, kb [-7,-3.6].
- In-game text: "Backfire — backfires a pop of current out behind her, hardest at the centre of the pop (short reach). On hit: 7.6% at the centre (5.6% at the edge)."
- Real hit: edges = 5.6%, launch 4.35. Centre (33..54 px behind) = 7.6%, CLEAN, launch 5.68.

### 13. Goo — forward-air "Long Reach"
- OLD: "stretches an arm of goo out straight ahead, a long poke from well out of their reach". Capsule (16,-4)→(108,-4) r15. 6.5%, kb [4,-3.4], stun 22.
- NEW regions: SWEET = the blob at the end, x 86 to 108. SOUR = x 16 to 86.
- NEW numbers: sweet 8.1%, kb [4.4,-3.7]. Sour 6.2%, kb [3.9,-3.3].
- In-game text: "...; the blob at the end of the arm hits harder (medium reach). On hit: 8.1% at the end (6.2% closer in)."
- Real hit: up to 108 px = 6.2%, launch 2.72. 111..129 px = 8.1%, CLEAN, launch 3.27.

### 14. Spikey — up-air "Spike Up"
- OLD: "shoots a few spikes straight up above him". Capsule (0,-12)→(2,-72) r13. 5.6%, kb [0.4,-9], stun 24.
- NEW regions: SWEET = the spike tips, (1,-54) to (2,-72). SOUR = the rest.
- NEW numbers: sweet 7%, kb [0.4,-9.9]. Sour 5.4%, kb [0.4,-8.9].
- In-game text: "...; the spike tips hit harder (medium reach). On hit: 7.4% at the tips (5.7% lower down)." (Spikey's damage stat shows here.)
- Real hit: up to 102 px up = 5.67, launch 4.68. 105..117 px up = 7.35, CLEAN, launch 5.54.

### 15. Cammy — forward-air "Flash Bang" (centre)
- OLD: "sets off the flash a long way ahead of him; it dazzles whoever it catches". Disc (96,-4) r22. 5.5%, kb [2.6,-2.8], stun 22, dazzle (stun 14).
- NEW regions: SWEET = centre disc r5, listed first. SOUR = the whole old disc. Both dazzle.
- NEW numbers: sweet 6.3%, kb [2.9,-3.1]. Sour 4.7%, kb [2.3,-2.5].
- In-game text: "...it dazzles whoever it catches, and the centre of the flash hits harder (medium reach). On hit: 6.3% at the centre (4.7% at the edge), dazzles them."
- Real hit: edges = 4.7%, launch 1.59, held 2. Centre (87..108 px ahead) = 6.3%, CLEAN, launch 2.18, held 3.

### 16. Fan — up-tilt "Fan Fling Up"
- OLD: "flings the fan up over his head in a wide arc". Fan r 8..64, angles -2.3..-0.4. 5.5%, kb [0.5,-10.6], stun 24.
- NEW regions: SWEET = the edge of the fan, r 48..64. SOUR = r 8..48.
- NEW numbers: sweet 6.9%, kb [0.5,-11.7]. Sour 5.2%, kb [0.5,-10.3].
- In-game text: "...; the edge of the fan hits harder (short reach). On hit: 6.9% with the edge of the fan (5.2% closer in)."
- Real hit: closer = 5.2%, launch 5.42. 88..106 px out = 6.9%, CLEAN, launch 6.54.

### 17. Magnet — back-air "Repel" (centre)
- OLD: "repels whoever is behind her with a burst of like poles". Disc (-44,0) r28. 11.2%, kb [-10.6,-4.8], stun 15.
- NEW regions: SWEET = centre disc r6, listed first. SOUR = the whole old disc.
- NEW numbers: sweet 12.9% (x1.15, smaller than the others because it is already a strong hit), kb [-11.4,-5.2]. Sour 9.4%, kb [-9.8,-4.4].
- In-game text: "Repel — repels whoever is behind her with a burst of like poles, hardest at the centre of the burst (short reach). On hit: 12.9% at the centre (9.4% at the edge)."
- Real hit: edges = 9.4%, launch 6.64, held 4. Centre = 12.9%, CLEAN, launch 8.41, held 5.

### 18. Poppy — back-air "Exhaust Blast" (centre)
- OLD: "blasts the exhaust out behind her". Disc (-44,0) r26. 8.8%, kb [-8.8,-4.4], stun 15.
- NEW regions: SWEET = centre disc r5, listed first. SOUR = the whole old disc.
- NEW numbers: sweet 10.2%, kb [-9.7,-4.8]. Sour 7.6%, kb [-8,-4].
- In-game text: "Exhaust Blast — blasts the exhaust out behind her, hardest at the centre of the blast (short reach). On hit: 10.2% at the centre (7.6% at the edge)."
- Real hit: edges = 7.6%, launch 5.25, held 3. Centre = 10.2%, CLEAN, launch 6.8, held 4.

### 19. Tapey — up-air "Tape Whip Up"
- OLD: "whips a strip of tape straight up above her". Capsule (0,-12)→(2,-72) r11. 4.8%, kb [0.4,-8.8], stun 25.
- NEW regions: SWEET = the end of the strip, (1,-54) to (2,-72). SOUR = the rest.
- NEW numbers: sweet 6%, kb [0.4,-9.7]. Sour 4.6%, kb [0.4,-8.6].
- In-game text: "...; the end of the strip hits harder (medium reach). On hit: 6% at the end (4.6% lower down)."
- Real hit: up to 99 px up = 4.6%, launch 4.35. 102..117 px up = 6%, CLEAN, launch 5.2.

### 20. Bot — forward-air "Extended Kick"
- OLD: "extends a leg out for a kick a long way ahead". Capsule (14,4)→(78,4) r12. 6.2%, kb [2.8,-3], stun 23.
- NEW regions: SWEET = the foot, x 60 to 78. SOUR = x 14 to 60.
- NEW numbers: sweet 7.8%, kb [3.1,-3.3]. Sour 5.9%, kb [2.7,-2.9].
- In-game text: "...; the foot at the end hits harder (medium reach). On hit: 7.8% with the foot (5.9% closer in)."
- Real hit: up to 78 px = 5.9%, launch 1.99. 81..99 px = 7.8%, CLEAN, launch 2.47.

## Average strength (measured)

The table gives the mean damage over every dummy spot (3 px apart along the move) where the move connects, old build vs new build. The sour numbers were set from the average sweet share of the two dummies.

| move | Pen old | Pen new (sweet share) | Coiny old | Coiny new (sweet share) |
|---|---|---|---|---|
| Leafy bair | 6.00 | 5.99 (16%) | 6.00 | 5.94 (13%) |
| Teardrop fair | 5.50 | 5.55 (21%) | 5.50 | 5.49 (17%) |
| Rocky bair | 9.64 | 9.39 (36%) | 9.64 | 9.89 (56%) |
| Fanny uair | 4.10 | 4.07 (14%) | 4.10 | 4.10 (17%) |
| Grassy bair | 6.50 | 6.50 (20%) | 6.50 | 6.43 (17%) |
| Lightning fair | 5.70 | 5.73 (19%) | 5.70 | 5.67 (16%) |
| Money up-tilt | 4.54 | 4.55 (22%) | 4.54 | 4.57 (24%) |
| TV up-tilt | 6.30 | 6.28 (15%) | 6.30 | 6.28 (15%) |
| Toothpaste uair | 4.20 | 4.31 (26%) | 4.20 | 4.17 (14%) |
| Fern fair | 9.00 | 9.02 (16%) | 9.00 | 8.95 (14%) |
| Balloony down-tilt | 3.30 | 3.36 (18%) | 3.30 | 3.28 (9%) |
| Lightbulb bair | 6.60 | 6.40 (40%) | 6.60 | 6.83 (61%) |
| Goo fair | 6.50 | 6.50 (16%) | 6.50 | 6.50 (16%) |
| Spikey uair | 5.88 | 5.88 (13%) | 5.88 | 5.88 (13%) |
| Cammy fair | 5.50 | 5.34 (40%) | 5.50 | 5.68 (61%) |
| Fan up-tilt | 5.50 | 5.52 (19%) | 5.50 | 5.52 (19%) |
| Magnet bair | 11.20 | 10.71 (38%) | 11.20 | 11.66 (65%) |
| Poppy bair | 8.80 | 8.43 (32%) | 8.80 | 9.19 (61%) |
| Tapey uair | 4.80 | 4.81 (15%) | 4.80 | 4.81 (15%) |
| Bot fair | 6.20 | 6.29 (21%) | 6.20 | 6.19 (15%) |

- Tips are within about 1.5% of the old mean on both dummies; Toothpaste is +2.6% on Pen.
- Centres are about -3 to -4% on the tall, thin Pen and +3 to +4% on the round Coiny. A round body gets the centre of a burst more often. It was the same in batch 1.

## Checks

- Real hit at both regions for all 20 moves: two different results each (above).
- Look: for all 20, the swept class (swing/thrust), frames, reach and animation (MVA entry and aim) are the same before and after. Teardrop's and Grassy's swept slices were checked frame by frame against the old box: equal to 0.01 px. Bow's batch-1 split was re-checked on this build too.
- CPU vs CPU: five 4-fighter matches covering all 20 fighters, AI level 2, 3 stocks, 3600 frames each. 0 errors, 0 bad positions. CPUs landed no sweet-spot hits with these 20 moves in these matches; nothing is tuned for bots.
- Online on FAKE sockets (net-pair.js; no relay, no site): Grassy's bair (swept), Magnet's bair (centre) and Goo's fair (tip), each at a sweet and a sour spot. Host and guest agree on the damage, the CLEAN bit and the hit frame in all 6 cases.
- syncheck: 2 scripts, 0 failed. bootcheck: 0 errors, 0 bad positions, 0 control bytes, 0 bare LF, no hidden names, kit guard ok.
- allcontests.mjs 1800: all 15 event contests ran 1800 frames, 0 errors.

## Doubtful, for the owner to decide

1. **The centre-of-burst moves depend on the foe's body, about +-4%** (as in batch 1).
2. **Magnet's back-air was already strong.** I gave it a smaller bonus (x1.15). A centre hit is 12.9% with more launch (measured 8.41 vs 6.64) and a 5-frame freeze.
3. **Toothpaste's Cap Flick is a very wide arc.** Along its middle the sweet and sour parts alternate (see its entry), because a high, close foe meets the cap first on the early frames. That is the real shape of the arc, but it is less tidy than the others.
4. **The drawn hit area shows the split**, as in batch 1: a brighter dot in the middle of a burst, and a seam between the parts.
