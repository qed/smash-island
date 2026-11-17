# Hop smashes and archetype tilts/airs: a measurement (no change made)

Branch g-box, 2026-11-17. Measured on the unchanged g-update6 build (481cfb43), not on the Box rework. Nothing here was committed to the game; the three options were tried on an in-memory copy only.

Your words: "The reason she has flown under the radar is because hop smashes are REALLY strong." and "also because her archetype gives her the best sweeping tilts and airs." Your answer for hop smashes: "Measure first".

## Part 1: hop smashes

### How it was measured

All 117 playable fighters. A scripted player (real key presses, not a CPU) against a still Dough (weight 86) at 60%, on Goiky Field, away from its platform. The dummy was tried at 5 distances and the best hit kept. Four ways to smash:

- **Ground**: V pressed once, standing.
- **Short hop, then V** (V on frame 9: any sooner is the jump-cancel up smash, a ground move).
- **Full jump, then V** (V on frame 9).
- **V, then short hop** (V first, the hop 6 frames later while it charges).

"Can act" = the first frame X brings out an attack again (X held from the landing on).

### What a hop smash really is

- A smash charges for 24 to 32 frames (24 for most fighters) and then goes off by itself.
- **Short hop, then V** never goes off in the air: the hop is over (about 27 frames) before the charge is. It fires on the ground on frame 34 for all 117. It is just a late ground smash.
- **V, then short hop** is the real hop smash: it goes off **in the air for all 117**, 19 frames after leaving the ground (frame 25).
- **Full jump, then V** goes off in the air for 112 of 117 (frame 34), and still hits a grounded foe for 90.

### The air smash against the ground smash (V, then short hop)

| | Ground smash | Hop smash (in the air) |
|---|---|---|
| Hits the grounded dummy | 103 of 117 | 98 of 117 |
| Damage (middle fighter) | 20% | 20% |
| Same damage as on the ground | | 81 of 98 |
| Launch as strong or stronger | | **95 of 98** |
| Frames from firing until she can act (middle) | 23 | 25 (most of them falling, not standing next to the foe) |
| **Frames after landing until she can act** | (not in the air) | **9 (60 fighters exactly 8)** |
| A short hop + neutral air, for comparison | | landing lag **8 to 9** (every fighter) |

**Why it is strong, in plain words:** a hop smash is a full-power smash, same damage and the same or a bigger launch, that lands with the landing lag of a light aerial (8 to 9 frames). A ground smash with a whiff leaves you standing in front of the foe for 23 frames; the air one leaves you falling and then free 9 frames after you land. The middle fighter's neutral air does 3.4%. The middle hop smash does 20%, for the same landing cost. The hop also lifts you over low attacks while the ring charges.

Landing after the air smash, all 117 (frames until she can act): 8 frames for 60 fighters, 9 for 14, 10-15 for 19, 16-32 for 24. The slow ones are the smashes that keep moving after they land (bursts and plants: Bomb 16, 8-Ball 16, David 21; Bonesaw's burrow 26).

### The strongest 10 (damage and launch, minus landing lag)

| # | Fighter | Smash kind | Hop smash: damage / launch | Ground smash: damage / launch | After landing | Why |
|---|---|---|---|---|---|---|
| 1 | Money | her own | 67.7% / 30.2 | 67.7% / 41.5 | 9 | the most damage of any smash, all of it from the air |
| 2 | Puffball | her own | 39% / 39.3 | 39% / 39.3 | 8 | big damage and launch, light landing |
| 3 | Cherries | trap (mine) | 23% / **44.5** | missed | 9 | the mine misses a foe beside him from the ground but lands from the air; the biggest launch |
| 4 | Yin-Yang | lunge | 24% / 41.6 | 24% / 41.6 | 9 | a ground kill move with no ground lag |
| 5 | Eraser | lunge | 29.4% / 33.4 | 29.4% / 33.4 | 8 | |
| 6 | Baseball | leap | 26% / 32.4 | 26% / 32.4 | 8 | the leap goes higher from the air, then lands light |
| 7 | Jack | leap | 26% / 32.4 | 26% / 32.4 | 8 | same as Baseball |
| 8 | Silver Spoon | lunge | 24% / 34.4 | 24% / 34.4 | 8 | |
| 9 | Cammy | beam | 20% / 37.3 | 20% / 37.3 | 8 | |
| 10 | MeTag | lunge | 31% / 25.3 | 31% / 25.3 | 10 | |

**Box:** 28.8% (8th most damage of the 98 that hit), launch only 15, but her smash also **roots** the foe for 80 frames, so the hit is a free follow-up; 8 frames after landing. That is the score my list misses (it counts launch, not the root). Box's leap from the air goes much higher (she lands 62 frames after it fires, the hit comes on the way down), which also makes it hard to punish. Next to her: Naily 35%, Bomb 30.2%, Rocky 29%.

A few smashes that hit from the air missed my still dummy from the ground (Rocky, Pen, Knife, Paintbrush, Test Tube, Dough, Blueberry, Toothpaste, Cherries). Most of those are shots or traps that need room, so I would not read them as "better in the air" without a closer look. Seven hit less from the air (Ruby, Yellow Face, Loser, Firey Jr., Ruler, Soap, Flower): their shots or bursts mostly pass under or over from up there.

### The three options, measured on a scratch copy (the 10 above and Box)

| Option | What it did | Effect (measured) |
|---|---|---|
| **Landing lag**: 18 frames when you land within 90 frames of an air smash | the smash is the same; the landing costs more | after landing 8-10 -> **19 frames** for 9 of 11. Damage and launch the same. Money only +3 (12), Cherries no change (9): their landings fall where the lag is already used |
| **Weaker in the air**: x0.75 damage, x0.8 launch for an air smash's hits | the same move, less power | e.g. Puffball 39% / 39.3 -> 29.3% / 29.3, Eraser 29.4% -> 22%, Money 67.7% -> 49.8%, Box 28.8% -> 21.6%. Landing unchanged (8-10) |
| **Ground only**: in the air the charge waits, and it goes off when you land (as the ground smash) | no air smash at all | fires on landing (frame 35-38). Same damage, but then the ground smash's recovery: 23-27 frames for the lunges, 47-58 for the leaps (Baseball, Jack, Box 56), and Cherries' mine misses again |

My read, for your choice: the cause is the landing lag, not the damage. "Landing lag" keeps the move and its idea and only takes away the free landing. "Weaker in the air" keeps the free landing. "Ground only" removes the move.

## Part 2: archetype tilts and airs

### What "arch" does in the code

**Nothing for moves.** A fighter's `arch` (Box's is "Keeper") is a label: the character select card, the stats line and the fighter text show it. No move code reads it. Every one of the 117 playable fighters has its own hand-made tilts and aerials (its MOVESETS row), so two fighters with the same label do not share moves. Only the original characters (Zoner, Grappler, Trapper, Trickster) pick moves by type, and none of those is "Keeper".

**Only Box uses "Keeper".** 103 labels for 117 fighters; the only shared ones are Grappler (Flower, Liy, Goo), Trapper (Blocky, Toothpaste, Cherries), Zoner (Pen, Profily, Lightbulb, Taco (II), Nickel (II), Microphone), Trickster (Gelatin, Knife, Sticker), Disruptor (Yellow Face, Remote, Cammy) and Controller (Lollipop, Black Hole).

### Box's tilts and airs against the roster

The up-tilt and the five aerials together. Reach from her middle, hit area in square px, damage with her dmg 1.2, startup in frames.

| | Box | Roster average | Box's place of 117 |
|---|---|---|---|
| Hit area (all six) | 25770 | 21197 | 22nd |
| Damage (all six) | 53.4% | 38.0% | **4th** (22nd without her dmg 1.2) |
| Reach (average) | 79 px | 75 px | 30th |
| Moves that hit both sides | 4 of 6 | 2.3 | 5th |
| **Startup (average)** | **8.7 frames** | 5.8 | **109th** (one of the 9 slowest) |
| Damage per startup frame | 6.14 | 6.68 | 90th |

Per move (middle of the roster in brackets):

| Move | Reach | Area | Damage | Startup |
|---|---|---|---|---|
| Lid Flip (up-tilt) | 78 (76) | 5372 (3969) | 7.2% (5%) | 8 (5) |
| Tumble (neutral air), both sides, 140 px wide | 70 (50) | 5257 (7238) | 7.2% (3.4%) | 7 (5) |
| Parcel Shove (forward air) | 100 (81) | 3897 (2147) | 9.6% (6.8%) | **12** (6) |
| Return to Sender (back air) | 76 (74) | 2827 (1960) | 12% (8.6%) | 10 (6) |
| Lid Pop (up air) | 78 (83) | 4621 (2405) | 6.6% (5%) | 5 (4) |
| Heavy Freight (down air) | 72 (75) | 3796 (2148) | 10.8% (7.9%) | 10 (8) |

The six shared labels, for comparison (averages over their members): Controller has the most area (32894), Zoner the fastest startup (4.8). Keeper (Box alone) has the most damage (53.4% against 32.8-40.1%) and the slowest startup (8.7 against 4.8-7.4).

**Answer:** her tilts and airs are not the best overall. They are among the hardest-hitting (4th of 117) and they cover a lot (22nd, and 5th for hitting both sides), but they are among the slowest to come out (109th of 117). The biggest areas belong to Black Hole, Snowball, Tree, TV and Donut. So they are big and heavy but slow: strong when they land, easy to beat to the punch. The label "Keeper" has nothing to do with it; it is her own hand-made moveset.

## Built: landing lag (branch g-hoplag, 2026-11-17)

Your pick: "Landing lag (Recommended)". A smash that goes off in the air now costs 18 more frames of landing lag when the fighter lands while it is still going or within 24 frames of its end (its own end lag counts as part of it). Same rule for a person and a CPU. The smash itself and every ground smash are unchanged.

Measured again with the same scripted player (frames after landing until she can act; V, then a short hop):

| Fighter | Before | After |
|---|---|---|
| Money, Puffball, Cherries, Yin-Yang, Eraser, Baseball, Jack, Silver Spoon, Cammy, MeTag, Box | 8 to 10 | **19** (all 11) |
| The same 11, full jump then V | 8 to 16 | 19 (all 11) |

All 117 fighters: before, 86 landed with 8 to 11 frames; after, 3 do (Woody, Tissues and Beach Ball fly so far that they land 71-86 frames after the smash, long after it ended: a normal landing, as the rule says). 29 fighters now have 25-33 frames: their smash hits as they touch down, and its hit freeze (about 9 frames) pauses the landing lag, as it pauses every lag in the game. Ground smashes: no change in any of the 117 (damage, launch, frames). A short hop + neutral air: no change.

How it looks: the game's own landing squash (the dust ring) and standing still; there is no separate landing-lag pose in the game.
