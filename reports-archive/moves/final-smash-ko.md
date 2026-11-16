# Final Smash: KO-level (before / after)

The owner, 2026-10-18: "smash balls feel like they dont do enough damage. I got one, and sidewalky went from 9 percent to 39 percent". Chosen: **"KO-level"** (big damage AND big knockback, so a Final Smash usually KOs anyone above ~60%, like in Smash), and knockback **"Yes, same amount"** (it rises with the damage).

This is the second pass (after the review of the first). Branch g-fs-power, merged with main.

## What changed

- **Damage x2** (`FS_DMG_MULT = 2`) on every hit a Final Smash deals: its own frames and the shots it throws, in `applyHit`. The 102 rows keep their shape, reach, angle and order of hits. An edge hit stays weaker than a clean one.
- **Every hit lands, as before.** A hit's size also sets how long the foe is untouchable after it and how long it is stunned. The first pass used the doubled damage for that, so the later shots of a spray passed through the foe (Marker landed 2 of its 4 shots). These now read the row's own damage, so a spray lands as many shots as it used to, each at double.
- **Knockback is never less than before**, and grows with the foe's %: `FS_KB = { lo:1, hi:1.4, from:20, at:60 }`: x1 (the row's own launch) up to 20%, rising to x1.4 at 60% and past it. The first pass launched x0.75 at 0%, so a low-% foe flew less far than with the old move. Starting the rise at 20% means a Final Smash makes no new early KOs: below 20% it launches exactly as the old move did, with double the damage. The launch is worked out from the % the foe would be on without the extra damage, so a row of many hits does not snowball off its own doubled %.
- **On "same amount":** the launch is not doubled along with the damage. Even the first pass's first try, which let the launch grow only through the extra %, had 40 rows KO-ing Pen below 20% (17 at 0%); a doubled launch would be far past that, the opposite of "KOs anyone above ~60%". What rises with the damage is the % every later hit launches from (the extra % stays), and the Final Smash's own launch, up to x1.4 at 60%.
- **16 rows tuned one by one** (`FS_KO_FIX`, a launch multiplier per row), against the median over 8 placements on two stages (below), not a single spot. A cut (under 1) holds at every %. A boost (over 1) grows in with the launch, from nothing at 20% to all of it from 60% on: the four sprays of light pushes that never KO'd (Knife, Basketball, Tennis Ball, Cake) KO now, and still land every shot on a low-% foe (a flat boost pushed the foe out of the rest of the shots, and their damage fell back to the old total).
- **The default** (played only by the three hidden prize fighters, once unlocked: every one of the 102 roster fighters has a row of its own): the surge is the Final Smash and is scaled; the fighter's own finisher thrown in the middle of it is now its normal size, and goes off just before the surge instead of just after. In the first pass the finisher was scaled too (one of them KO'd Pen at 8%). With it unscaled but still last, its small launch replaced the surge's (a launch sets the foe's speed, so the last hit counts), and two of the three needed 83%. No launch fix on the default now (the first pass had x1.8, tuned on Coiny).
- **Barf Bag's Outbreak:** an infected fighter's hits come back on themself, so a Final Smash fired while infected (free-for-all) took every hit back and lost the stock. It now waits until the infection wears off (under 2 seconds); the press is held, for players and the CPU.
- **Side effects kept at the row's own size:** Tapey's tape records a Final Smash hit at the row's own damage (it could replay 56% or 76%), and Paper's evil meter and Paintbrush's rage fill from a Final Smash as they would from the old one.
- The holder is never scaled. Status ticks (burn, poison) are not scaled: the total is KO-level, not each tick. Smash Balls still appear only in normal and online matches.

## How it was measured

Headless, all 102 rows plus the default as each hidden fighter plays it (105 rows). The foe stands still in the middle of the stage, the holder at the distance where the row's main hit lands (the same distances as the first pass), and the foe is a Normal CPU from the moment it is first hit, steering back. KO% = the lowest % the foe can be on and still lose the stock (in 10s, then halved down to 1%).

- **Pen** (mid-weight, 100): the median of 8 placements: Goiky Field with the holder at dx-40, dx-20, dx, dx+20, dx+40, and Yoyleland (another small stage) at dx-20, dx, dx+20. The spread column shows the lowest and highest of the 8.
- **Tree** (138, the heaviest) and **Puffball** (46, the lightest): the median of 3 placements on Goiky (dx-20, dx, dx+20).
- **Sky Tower** (a big stage), Pen, at dx.
- Damage = what the whole move dealt to Pen at 0%, at dx on Goiky.

## Distribution (KO%, lower is stronger)

| Foe | Before: median (q25-q75), range | After: median (q25-q75), range | KO below 20%: before / after | No KO by 80%: before / after | KO at 0%: before / after |
|---|---|---|---|---|---|
| Pen (8 placements) | 51 (36-73), 0-none | 35 (29-42), 20-80 | 8 / 0 | 22 / 0 | 2 / 0 |
| Pen, Goiky at dx only | 51 (36-72), 0-none | 35 (29-43), 20-80 | 9 / 0 | 22 / 0 | 3 / 0 |
| Tree | 85 (70-102), 0-none | 53 (44-69), 7-105 | 3 / 1 | 60 / 19 | 1 / 0 |
| Puffball | 9 (0-22), 0-176 | 8 (0-17), 0-49 | 71 / 81 | 3 / 0 | 31 / 35 |
| Pen on Sky Tower (big stage) | 126 (107-152), 80-none | 95 (81-117), 50-none | 0 / 0 | 103 / 79 | 0 / 0 |

Damage to Pen at 0% (the whole move): before median 22% (9-54), after median 44% (18-100).

Rows whose damage at 0% is less than double (7): Rocky 54 -> 94, Ruby 42 -> 56, Naily 36 -> 48, Toothpaste 32 -> 28, Tissues 38 -> 66, (default, hidden fighter 1) 38 -> 62, (default, hidden fighter 2) 38 -> 62. Why: the default doubles only its surge (the finisher stays its own size). Rocky has no fix: his launch carries the foe out of his last hits. The other four are cut rows (below): a smaller launch changes where the foe flies, and some shots miss. **Toothpaste is the one row that deals less than before** (32 -> 28): every cut that stops it KO-ing Pen at 0% (0.5 to 0.75 tried) drops its stream to 28. Every other row deals more than before, most of them exactly double.

**Big stages:** five of the ten stages are big (Grand Plains, Sky Tower, Canyon, Big Incinerator, Fortress). On Sky Tower the median KO% for Pen is 95 (50-none), and 79 of 105 rows do not KO Pen by 80%. The middle half of the rows KO Pen there at 81-117%. So "usually KOs above ~60%" holds on the five small stages, not on the big ones.

## The 16 rows tuned one by one (Pen KO%, median of 8 placements)

| Fighter | Final Smash | Before | Constants alone | Fix (launch x) | After | After, spread of the 8 |
|---|---|---|---|---|---|---|
| Toothpaste | enemynow | 0 | 0 | 0.5 | 20 | 19-128 |
| Tissues | achoo | 0 | 0 | 0.5 | 24 | 24-26 |
| Bomby | detonation | 2 | 2 | 0.75 | 23 | 23-23 |
| Naily | nailedit | 9 | 7 | 0.92 | 32 | 32-96 |
| Cheesy | kicksoccerpun | 29 | 12 | 0.7 | 27 | 11-40 |
| Apple | pencilthrow | 16 | 13 | 0.87 | 20 | 20-64 |
| Dora | rant | 53 | 18 | 0.9 | 26 | 21-38 |
| Cammy | saycheese | 18 | 18 | 0.97 | 21 | 21-21 |
| Paper | pianos | 18 | 18 | 0.95 | 21 | 21-21 |
| Gaty | swingopen | 19 | 19 | 0.95 | 22 | 21-23 |
| Clover | butterflies | 35 | 19 | 0.85 | 25 | 21-40 |
| Ruby | refraction | 27 | 21 | 0.95 | 23 | 23-81 |
| Knife | bagoftricks | none | 182 | 4 | 58 | 54-58 |
| Basketball | nothingbutnet | none | 181 | 4 | 58 | 53-58 |
| Tennis Ball | ballmachine | none | 197 | 4 | 67 | 57-67 |
| Cake | cakeatstake | 190 | 155 | 2.35 | 80 | 61-80 |

**Single placements under 20%:** every median is 20-80, but 8 rows still have one or more of their 8 placements under 20: Flower 2 of 8, lowest 17 (before, lowest 17); Teardrop 3 of 8, lowest 17 (before, lowest 41); Rocky 1 of 8, lowest 19 (before, lowest 18); Fanny 1 of 8, lowest 19 (before, lowest 19); Saw 3 of 8, lowest 14 (before, lowest 41); Toothpaste 2 of 8, lowest 19 (before, lowest 0); Spikey 4 of 8, lowest 16 (before, lowest 19); Cheesy 3 of 8, lowest 11 (before, lowest 3). Most of these are on Yoyleland (low gravity): Teardrop 41 -> 17 and Saw 41 -> 14 there, while their Goiky placements are 26-28.

## Rows that are weaker than before (a higher KO% after)

The owner's rule is to buff the weak and never nerf the strong. The consistency target ("usually KOs above ~60%", none below 20%) asks the opposite for the rows that already KO'd near 0%: they cannot reach 20% without a smaller launch. All of these but Toothpaste still deal more damage than before. Rocky has no fix: his clean hit is chaotic across placements (before 18-77, after 19-76), and his median moved by 4. The full lists:

- **Against Pen (9):** Bomby 2 -> 23, Rocky 37 -> 41, Gaty 19 -> 22, Naily 9 -> 32, Toothpaste 0 -> 20, Apple 16 -> 20, Paper 18 -> 21, Cammy 18 -> 21, Tissues 0 -> 24.
- **Against Tree (5):** Bomby 29 -> 40, Toothpaste 10 -> 43, Apple 0 -> 7, Cheesy 34 -> 41, Tissues 10 -> 42.
- **Against Puffball (4):** Naily 11 -> 16, Toothpaste 8 -> 30, Cheesy 0 -> 15, Clover 0 -> 6.

**Question for the owner:** keep these cuts so the set is consistent, or never launch less than before? The second option is one change (drop the `FS_KO_FIX` entries under 1); those rows would then KO as early as they used to or earlier, Toothpaste, Tissues and Bomby at 0-2% on Pen. The decision changes only the cut rows: every row without a cut is at least as strong as before against all three foes, Rocky aside.

## Checks

- **Self-KO:** all 105 rows with the holder at 150%, at both stage edges facing out, and facing in with Pen in front (Goiky): no holder lost a stock. Two rows cost their user % by design, as before: Bomby (+35%) and Bomb (+16%). An infected holder (Outbreak, free-for-all) cannot fire, for all 105.
- **Edge hits** stay weaker than clean ones (Gelatin: outer ring 24, inner 36, pinned in test/final-smash.test.js).
- **Tests:** test/final-smash.test.js pins a clean hit KO-ing Pen at 60% and not at 0% for seven rows (the default, David, Sidewalky, Tree, Baseball, Fries, Marker) and for the default as each hidden fighter plays it, the damage at 0%, the edge hit, and the Outbreak hold.

## Heavy and light

- Tree (heaviest): median 53 (was 85). Not out by 80% (19): Bow 129 -> 100, Lightning 120 -> 94, Tennis Ball none -> 100, Nickel 135 -> 105, Barf Bag 109 -> 84, Basketball none -> 85, Grassy 109 -> 82, Money 123 -> 94, Remote 120 -> 94, Ruler 112 -> 83, Balloon 118 -> 88, Knife none -> 86, Paintbrush 124 -> 95, Salt 131 -> 104, Test Tube 111 -> 86, Candle 110 -> 83, Cherries 112 -> 83, MeTag 111 -> 84, Poppy 122 -> 92.
- Puffball (lightest; her launch is capped at x1.7): median 8 (was 9); 81 of 105 rows KO her below 20% (71 before). **A light fighter can lose a stock to a Final Smash at 0%:** 35 rows KO Puffball at 0% (31 before): Bubble 0 -> 0, Blocky 2 -> 0, Pen 0 -> 0, Match 0 -> 0, Ice Cube 0 -> 0, Teardrop 8 -> 0, Bomby 0 -> 0, Rocky 0 -> 0, Fanny 0 -> 0, Dora 1 -> 0, Saw 8 -> 0, Ruby 0 -> 0, Pin 0 -> 0, Gaty 0 -> 0, Liy 0 -> 0, Lollipop 0 -> 0, Marker 0 -> 0, Sidewalky 0 -> 0, Profily 0 -> 0, Tree 0 -> 0, Bomb 0 -> 0, Apple 32 -> 0, Baseball 0 -> 0, Pickle 0 -> 0, Paper 0 -> 0, Trophy 0 -> 0, Cammy 0 -> 0, Fan 0 -> 0, Tissues 21 -> 0, Starfruit 0 -> 0, Blueberry 0 -> 0, Magnet 0 -> 0, Tapey 0 -> 0, Teddy Bear 0 -> 0, (default, hidden fighter 3) 0 -> 0. Not tuned for her: the target is the mid-weight.

## Every Final Smash

KO% before -> after (Pen: median of 8 placements; Tree, Puffball: median of 3); Pen spread = lowest and highest of the 8, after; damage to Pen at 0% before -> after; dx = how far behind the foe the holder stood.

| Fighter | Final Smash | Shape | dx | Pen | Pen spread | Tree | Puffball | Sky Tower | Damage at 0% |
|---|---|---|---|---|---|---|---|---|---|
| Firey | inferno | own | 110 | 76 -> 50 | 50-101 | 103 -> 74 | 27 -> 24 | 109 -> 82 | 15 -> 30 |
| Leafy | void | own | 200 | 43 -> 32 | 29-35 | 80 -> 50 | 1 -> 1 | 117 -> 89 | 24 -> 48 |
| Pencil | twofour | own | 200 | 45 -> 33 | 33-33 | 82 -> 51 | 4 -> 4 | 128 -> 99 | 20 -> 40 |
| Puffball | trance | own | 150 | 54 -> 38 | 38-38 | 88 -> 56 | 8 -> 8 | 133 -> 103 | 22 -> 44 |
| Bow | snowbow | own | 300 | 101 -> 66 | 66-66 | 129 -> 100 | 46 -> 35 | 160 -> 127 | 24 -> 48 |
| Flower | petals | own | 200 | 50 -> 36 | 17-37 | 88 -> 54 | 9 -> 9 | 152 -> 120 | 14 -> 28 |
| Bubble | yoylecake | own | 150 | 36 -> 29 | 29-86 | 68 -> 45 | 0 -> 0 | 80 -> 50 | 22 -> 44 |
| Blocky | recoveryloop | own | 200 | 51 -> 23 | 21-23 | 78 -> 49 | 2 -> 0 | 84 -> 57 | 40 -> 80 |
| Pen | erasure | own | 250 | 26 -> 23 | 23-23 | 60 -> 40 | 0 -> 0 | 99 -> 73 | 30 -> 60 |
| Match | freesmartvan | own | 200 | 24 -> 22 | 22-22 | 56 -> 38 | 0 -> 0 | none -> none | 24 -> 48 |
| Ice Cube | vengeance | own | 200 | 30 -> 25 | 25-25 | 64 -> 42 | 0 -> 0 | 109 -> 81 | 26 -> 52 |
| Teardrop | silenttreatment | own | 250 | 59 -> 28 | 17-28 | 84 -> 58 | 8 -> 0 | 91 -> 63 | 50 -> 100 |
| Bomby (fix) | detonation | own | 120 | 2 -> 23 | 23-23 | 29 -> 40 | 0 -> 0 | 95 -> 91 | 34 -> 68 |
| Rocky | matter | own | 150 | 37 -> 41 | 19-76 | 95 -> 75 | 0 -> 0 | 86 -> 59 | 54 -> 94 |
| Lightning | chainbolt | own | 250 | 95 -> 62 | 50-62 | 120 -> 94 | 44 -> 34 | 127 -> 99 | 14 -> 28 |
| Fanny | hurricane | own | 120 | 21 -> 21 | 19-22 | 48 -> 35 | 0 -> 0 | 158 -> 125 | 16 -> 32 |
| Dora (fix) | rant | own | 80 | 53 -> 26 | 21-38 | 82 -> 62 | 1 -> 0 | 93 -> 73 | 47.8 -> 95.6 |
| Saw | overdrive | own | 60 | 59 -> 26 | 14-none | 84 -> 58 | 8 -> 0 | 91 -> 63 | 50 -> 100 |
| Tennis Ball (fix) | ballmachine | own | 380 | none -> 67 | 57-67 | none -> 100 | 176 -> 49 | none -> 105 | 30 -> 60 |
| Snowball | avalanche | own | 200 | 58 -> 40 | 40-40 | 92 -> 58 | 12 -> 12 | 148 -> 116 | 34 -> 68 |
| Book | overdue | own | 250 | 68 -> 45 | 45-45 | 100 -> 66 | 20 -> 20 | 133 -> 104 | 13 -> 26 |
| Ruby (fix) | refraction | own | 380 | 27 -> 23 | 23-81 | 62 -> 39 | 0 -> 0 | 179 -> 148 | 42 -> 56 |
| Needle | cutinhalf | lane | 200 | 43 -> 32 | 32-32 | 80 -> 50 | 2 -> 2 | 171 -> 134 | 22 -> 44 |
| Pin | popped | lock | 250 | 28 -> 24 | 24-24 | 62 -> 41 | 0 -> 0 | 101 -> 75 | 28 -> 56 |
| Coiny | monitor | hose | 200 | 34 -> 28 | 20-36 | 57 -> 36 | 10 -> 4 | 107 -> 80 | 15 -> 30 |
| Golf Ball | freezejuice | lock | 250 | 66 -> 36 | 36-90 | 91 -> 65 | 14 -> 9 | 97 -> 69 | 38 -> 76 |
| Fries | fryfan | fan | 200 | 37 -> 29 | 26-30 | 85 -> 40 | 10 -> 9 | none -> 199 | 18 -> 36 |
| Gelatin | jellyquake | circle | 120 | 47 -> 35 | 35-35 | 84 -> 52 | 6 -> 6 | 123 -> 95 | 18 -> 36 |
| Nickel | sparechange | rain | 250 | 106 -> 74 | 74-74 | 135 -> 105 | 52 -> 38 | 166 -> 133 | 12 -> 24 |
| Yellow Face | buynow | circle | 150 | 62 -> 42 | 42-42 | 95 -> 60 | 15 -> 15 | 125 -> 97 | 16 -> 32 |
| Barf Bag | outbreak | circle | 120 | 87 -> 55 | 49-55 | 109 -> 84 | 35 -> 28 | 125 -> 97 | 16 -> 32 |
| Basketball (fix) | nothingbutnet | hose | 250 | none -> 58 | 53-58 | none -> 85 | 161 -> 45 | none -> 92 | 24 -> 48 |
| Bell | savedbythebell | circle | 120 | 37 -> 30 | 30-30 | 69 -> 46 | 2 -> 2 | 129 -> 101 | 12 -> 24 |
| Bracelety | didicecubesee | lock | 250 | 68 -> 37 | 27-37 | 93 -> 67 | 16 -> 10 | 99 -> 71 | 36 -> 72 |
| Gaty (fix) | swingopen | pull | 120 | 19 -> 22 | 21-23 | 47 -> 37 | 0 -> 0 | 156 -> 128 | 18 -> 36 |
| Grassy | nobodysteps | cols | 110 | 84 -> 54 | 44-54 | 109 -> 82 | 33 -> 28 | 115 -> 89 | 14 -> 28 |
| Liy | lightsout | lock | 250 | 22 -> 21 | 21-21 | 54 -> 37 | 0 -> 0 | 115 -> 87 | 26 -> 52 |
| Lollipop | stickytrap | pull | 150 | 37 -> 30 | 28-32 | 73 -> 46 | 0 -> 0 | 119 -> 91 | 22 -> 44 |
| Loser | tlc | circle | 100 | 56 -> 39 | 39-39 | 90 -> 57 | 10 -> 10 | 121 -> 93 | 20 -> 40 |
| Marker | permanentrecord | fan | 200 | 76 -> 37 | 20-57 | 123 -> 38 | 0 -> 0 | 228 -> 188 | 20 -> 40 |
| Money | makeitrain | rain | 250 | 95 -> 60 | 60-60 | 123 -> 94 | 40 -> 31 | 159 -> 126 | 13 -> 26 |
| Naily (fix) | nailedit | fan | 300 | 9 -> 32 | 32-96 | 33 -> 27 | 11 -> 16 | 181 -> 154 | 36 -> 48 |
| Pillow | fluffbounce | circle | 100 | 41 -> 32 | 32-79 | 73 -> 48 | 4 -> 4 | 80 -> 51 | 16 -> 32 |
| Remote | signaljam | circle | 120 | 95 -> 62 | 50-62 | 120 -> 94 | 41 -> 32 | 127 -> 99 | 14 -> 28 |
| Rose | thornlash | lock | 250 | 68 -> 37 | 27-37 | 93 -> 67 | 16 -> 10 | 99 -> 71 | 36 -> 72 |
| Taco | retractablearms | pull | 150 | 53 -> 37 | 35-37 | 87 -> 55 | 8 -> 8 | 119 -> 91 | 22 -> 44 |
| TV | staticburst | circle | 120 | 51 -> 37 | 37-37 | 88 -> 54 | 10 -> 10 | 128 -> 100 | 13 -> 26 |
| Woody | fraidystampede | lane | 200 | 78 -> 49 | 49-49 | 106 -> 76 | 25 -> 23 | 159 -> 126 | 15 -> 30 |
| Toothpaste (fix) | enemynow | hose | 220 | 0 -> 20 | 19-128 | 10 -> 43 | 8 -> 30 | 131 -> 166 | 32 -> 28 |
| David | awseriously | circle | 120 | 43 -> 32 | 32-32 | 80 -> 50 | 2 -> 2 | 119 -> 91 | 22 -> 44 |
| Firey Jr. | sparkjr | fan | 150 | 39 -> 30 | 28-47 | 73 -> 44 | 8 -> 8 | 142 -> 112 | 9 -> 18 |
| Fern | photosynthesis | lock | 250 | 70 -> 38 | 29-38 | 95 -> 69 | 18 -> 11 | 101 -> 73 | 34 -> 68 |
| Ruler | exactmeasure | lane | 250 | 85 -> 53 | 53-53 | 112 -> 83 | 30 -> 26 | 171 -> 137 | 14 -> 28 |
| Sidewalky | physically | lock | 250 | 37 -> 29 | 29-29 | 74 -> 46 | 0 -> 0 | 101 -> 75 | 28 -> 56 |
| Balloony | airleak | lane | 300 | 48 -> 35 | 35-35 | 85 -> 53 | 7 -> 7 | 158 -> 125 | 16 -> 32 |
| Roboty | antennaspring | cols | 150 | 47 -> 36 | 36-85 | 79 -> 51 | 10 -> 10 | 86 -> 54 | 10 -> 20 |
| Profily | cactus | lock | 250 | 32 -> 27 | 27-27 | 66 -> 43 | 0 -> 0 | 95 -> 66 | 24 -> 48 |
| Tree | timber | rain | 250 | 38 -> 30 | 30-30 | 72 -> 46 | 0 -> 0 | 128 -> 99 | 18 -> 36 |
| Cake (fix) | cakeatstake | hose | 300 | 190 -> 80 | 61-80 | 228 -> 20 | 137 -> 8 | none -> 115 | 36 -> 72 |
| Donut | sprinkleroll | orbit | 60 | 75 -> 42 | 30-42 | 100 -> 74 | 24 -> 14 | 107 -> 79 | 34 -> 68 |
| Balloon | tirade | circle | 120 | 95 -> 60 | 50-60 | 118 -> 88 | 40 -> 31 | 127 -> 99 | 14 -> 28 |
| Bomb | literally | circle | 100 | 41 -> 31 | 31-31 | 78 -> 49 | 0 -> 0 | 117 -> 89 | 24 -> 48 |
| Knife (fix) | bagoftricks | hose | 250 | none -> 58 | 54-58 | none -> 86 | 49 -> 10 | none -> 93 | 27 -> 54 |
| Lightbulb | brightflash | circle | 120 | 52 -> 37 | 37-37 | 89 -> 55 | 10 -> 10 | 127 -> 99 | 14 -> 28 |
| Paintbrush | heatwaves | lane | 250 | 96 -> 60 | 60-60 | 124 -> 95 | 41 -> 32 | 143 -> 113 | 12 -> 24 |
| Taco (II) | lemonspit | fan | 250 | 40 -> 26 | 25-29 | 72 -> 42 | 20 -> 17 | 215 -> 176 | 18 -> 36 |
| Marshmallow | noway | circle | 150 | 71 -> 46 | 46-46 | 102 -> 69 | 21 -> 21 | 126 -> 98 | 15 -> 30 |
| Apple (fix) | pencilthrow | fan | 250 | 16 -> 20 | 20-64 | 0 -> 7 | 32 -> 0 | 143 -> 125 | 24 -> 48 |
| Baseball | groundpound | lane | 250 | 38 -> 30 | 30-30 | 72 -> 46 | 0 -> 0 | 137 -> 107 | 18 -> 36 |
| Pickle | loadsofexperience | lock | 250 | 36 -> 29 | 29-29 | 72 -> 46 | 0 -> 0 | 105 -> 79 | 24 -> 48 |
| Nickel (II) | doublezinger | circle | 120 | 52 -> 40 | 40-40 | 83 -> 55 | 17 -> 17 | 119 -> 93 | 14 -> 28 |
| Paper (fix) | pianos | rain | 250 | 18 -> 21 | 21-21 | 47 -> 37 | 0 -> 0 | 107 -> 84 | 24 -> 48 |
| Microphone | deafening | lane | 300 | 48 -> 35 | 35-35 | 85 -> 53 | 7 -> 7 | 158 -> 125 | 16 -> 32 |
| Salt | shake | fan | 250 | 105 -> 72 | 57-72 | 131 -> 104 | 51 -> 38 | 138 -> 109 | 16 -> 32 |
| Test Tube | glassup | circle | 120 | 90 -> 56 | 50-56 | 111 -> 86 | 35 -> 28 | 127 -> 99 | 14 -> 28 |
| Box | everythingpacked | lock | 250 | 72 -> 43 | 33-43 | 97 -> 71 | 20 -> 17 | 103 -> 75 | 32 -> 64 |
| Trophy | blackmail | lock | 250 | 38 -> 30 | 30-30 | 74 -> 47 | 0 -> 0 | 113 -> 85 | 22 -> 44 |
| Goo | engulf | orbit | 70 | 73 -> 40 | 29-40 | 98 -> 71 | 22 -> 12 | 104 -> 76 | 36 -> 72 |
| Lifering | sinker | lane | 300 | 47 -> 35 | 35-35 | 84 -> 52 | 6 -> 6 | 157 -> 124 | 17 -> 34 |
| Bonesaw | cutstothecore | lock | 250 | 66 -> 36 | 25-36 | 91 -> 65 | 14 -> 9 | 97 -> 69 | 38 -> 76 |
| Spikey | cantholditin | fan | 60 | 22 -> 20 | 16-29 | 51 -> 40 | 5 -> 5 | 154 -> 122 | 24 -> 48 |
| Candle | crystalchime | cols | 120 | 85 -> 54 | 44-54 | 110 -> 83 | 34 -> 28 | 116 -> 90 | 13 -> 26 |
| Cammy (fix) | saycheese | lock | 300 | 18 -> 21 | 21-21 | 47 -> 36 | 0 -> 0 | 119 -> 93 | 22 -> 44 |
| Cheesy (fix) | kicksoccerpun | hose | 300 | 29 -> 27 | 11-40 | 34 -> 41 | 0 -> 15 | none -> 238 | 30 -> 60 |
| Dough | knockoff | circle | 100 | 52 -> 37 | 37-37 | 88 -> 55 | 9 -> 9 | 123 -> 95 | 18 -> 36 |
| Fan | leaveusalone | lane | 300 | 36 -> 29 | 29-29 | 70 -> 45 | 0 -> 0 | 154 -> 121 | 20 -> 40 |
| Soap | scrubforhours | orbit | 60 | 69 -> 36 | 25-36 | 94 -> 68 | 18 -> 8 | 101 -> 73 | 40 -> 80 |
| Tissues (fix) | achoo | hose | 60 | 0 -> 24 | 24-26 | 10 -> 42 | 21 -> 0 | none -> 240 | 38 -> 66 |
| Yin-Yang | yangthrowsyin | lane | 250 | 71 -> 46 | 46-46 | 102 -> 69 | 21 -> 21 | 149 -> 117 | 15 -> 30 |
| Starfruit | onehitwonder | circle | 120 | 32 -> 27 | 27-27 | 66 -> 43 | 0 -> 0 | 117 -> 89 | 24 -> 48 |
| Blueberry | palanquin | lock | 250 | 38 -> 30 | 30-30 | 74 -> 47 | 0 -> 0 | 107 -> 81 | 22 -> 44 |
| Cherries | playdirty | lane | 250 | 85 -> 53 | 53-53 | 112 -> 83 | 30 -> 26 | 141 -> 111 | 14 -> 28 |
| Clover (fix) | butterflies | fan | 200 | 35 -> 25 | 21-40 | 46 -> 39 | 0 -> 6 | 134 -> 119 | 16 -> 32 |
| Jack | knuckles | lock | 250 | 66 -> 37 | 26-37 | 91 -> 65 | 14 -> 10 | 97 -> 69 | 38 -> 76 |
| Magnet | likepolesrepel | pull | 150 | 35 -> 29 | 28-29 | 70 -> 45 | 0 -> 0 | 149 -> 115 | 20 -> 40 |
| MeTag | barrierwalls | cols | 160 | 86 -> 55 | 45-55 | 111 -> 84 | 35 -> 29 | 117 -> 91 | 12 -> 24 |
| Poppy | popcorn | fan | 200 | 95 -> 59 | 54-59 | 122 -> 92 | 40 -> 31 | 133 -> 105 | 18 -> 36 |
| Silver Spoon | glowinggold | circle | 100 | 40 -> 31 | 31-31 | 76 -> 48 | 1 -> 1 | 121 -> 93 | 20 -> 40 |
| Tapey | playback | lane | 300 | 36 -> 29 | 29-29 | 70 -> 45 | 0 -> 0 | 154 -> 121 | 20 -> 40 |
| Tea Kettle | mamasgotcha | lock | 200 | 69 -> 39 | 28-39 | 94 -> 68 | 17 -> 12 | 100 -> 72 | 35 -> 70 |
| Teddy Bear | ragesmash | circle | 110 | 30 -> 25 | 25-25 | 64 -> 42 | 0 -> 0 | 115 -> 87 | 26 -> 52 |
| Bot | gotcha | lock | 250 | 72 -> 42 | 31-42 | 97 -> 71 | 20 -> 15 | 103 -> 75 | 32 -> 64 |
| (default, hidden fighter 1) | surge | default | 60 | 99 -> 33 | 31-33 | 138 -> 60 | 64 -> 6 | 147 -> 81 | 38 -> 62 |
| (default, hidden fighter 2) | surge | default | 60 | 99 -> 33 | 31-33 | 138 -> 60 | 64 -> 6 | 147 -> 81 | 38 -> 62 |
| (default, hidden fighter 3) | surge | default | 60 | 41 -> 31 | 31-31 | 78 -> 49 | 0 -> 0 | 124 -> 95 | 24 -> 48 |
