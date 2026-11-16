# Why the Moon Caves feel samey (measured, not guessed)

Written 2026-11-02. Build under study: `ii-dlc` at `57a9578` (live main with Moon Caves v3), generator `mcGen` in `artifacts/V1/index.html`. Nothing in the game was edited. The owner's words: "rebuild the caves of the moon, to make them less samey. ai seems to be bad at making things less samey."

## The short version

- **Inside one layer, the map is one short unit repeated all the way round.** At 10 a side the galleries layer is the same 20-degree unit (about 1,070 px, 2.8 s of walking) 14 times over. Six screens taken from six different places on it are the same picture (`screens-10-L1-places.png`). For a screen on the galleries layer, the best matching screen elsewhere on that layer overlaps it by 98%, and 54% of its screens have a twin that matches at 99% or better.
- **Between layers, the screens do differ** (a screen's best match in any other layer overlaps only about 30%). What is the same in every layer is the *recipe*: a ring of rock with holes in it, a zigzag flight of stairs under each hole, a few planks, and a floor effect.
- **The recipe is mostly stairs.** At 10 a side, 206 of the 286 non-ring pieces on the moon (72%) are stair steps. The five layers that are not galleries own 32 pieces between them (11%).
- **Most of the variety that was designed never reaches the player.** The galleries' four layouts are never drawn at any size measured (every free run is 10 to 34 px). The furnace's stepping stones are gone at 10 and 15 a side (present at 4 and 7). 24 of the 26 spring runs at 10 a side are a single 100 px pad.
- **A bigger moon is more of the same.** 1 to 5 a side are the identical moon (verified: same pieces, same zones). Going from 4 to 15 a side takes the stair flights from 32 to 100 but the pieces that belong to a layer's kind from 81 to 146, and the distinct piece shapes from 40 to 59.

Ranked causes are at the end (section 11).

---

## 1. What was measured and how

All numbers come from the pure generator's own output, so they are exact for the build, not from play.

- **Run:** `mcGen(count, 1.0)` inside the real game in jsdom, `count` = total fighters = 2 x players per side. Per-side sizes **2, 4, 7, 10, 15** (counts 4, 8, 14, 20, 30), normal map size.
  - Rout (surface radius): 2550, 2550, 2993, 3578, 4382.
  - Caves under the surface: 4, 4, 5, 6, 8.
  - Raw dump: `why-samey-data/discs-mcGen-v3.json`. Scripts: `why-samey-tools/`. Text outputs: `why-samey-data/`.
- **Layer** = the surface (L0) or one cave (L1 = first cave under the crust ... deepest = the furnace). Layer c runs from its floor top up to the underside of the floor above.
- **Token strip.** Each layer's floor walked from 12 o'clock to 6 o'clock (the right half; the left half is the mirror) in 3,600 bins, each bin one token:
  - `W` safe strip, `O` gap in the floor (hole or crack), `S` stairs, `Z` zone on the floor, `R` solid rock at floor level, `P` pieces only above the floor, `.` bare floor.
  - A bin is classed by the first of that order that applies. Percentages below are of the half-lap, or of the non-strip arc where it says so.
- **Screen.** The game's 1100x720 view at zoom 0.72 is 1528 x 1000 world px, turned upright on the fighter. I rasterised exactly that view from the generator's pieces (cells of 32 px, 48 x 32) with the camera standing on a layer's floor, every 128 to 192 px along the right half, never within a safe strip's reach.
  - The similarity is **J\*** = overlap / union of the filled cells, best over sideways slides of up to 192 px.
  - Three variants: the **full silhouette** (rock + stairs + kind pieces), **rings alone** (floor and roof rock only: the baseline), and **features alone** (stairs, kind pieces and zones, no rock rings).
- **Free runs.** I replayed `mcGen`'s reservation rules from the dump to get the arcs the kinds' pieces are laid on. Every kind piece falls inside a replayed run, except the galleries' top tiers and the columns' drips, which the generator puts over a ledge or a hole on purpose.
- **Walking speed** 384 px/s (`MAXVX` 6.4 per frame).

Limits, stated plainly:
- J\* weighs the big rock slabs heavily. That is why the rings-alone baseline is printed next to every full number.
- "Distinct shapes" by clustering depends on the cut-off and on phase. I print several cut-offs and lean on the counts of pieces and layout families, which do not.
- The twin search needs room: the deepest layers' half-laps are only 2,100 to 3,600 px, so there are few screens at least a screen width apart, and their twin rate reads 0% for lack of candidates as much as for variety.
- Screens are drawn from the generator's data with the game's colours, not by the game's `draw()`.

## 2. The pictures

All in this folder (`reports/moon-caves-v4/`):

| File | What it shows |
|---|---|
| `current-2.png`, `current-4.png`, `current-7.png`, `current-10.png`, `current-15.png` | The moon top-down (2800 px disc plus a legend panel): rock rings by layer colour, planks and ledges pale, stairs white, zones tinted, cracks red, strips tinted, spawn pads. `current-2.png` and `current-4.png` are the same picture. |
| `unrolled-10-L1-galleries.png`, `unrolled-10-L4-updrafts.png` | Two layers of the 10-a-side moon unrolled flat (angle across in true pixels at the floor, height up), in two rows (12 to 3 o'clock, 3 to 6). A yellow ruler marks one screen's width. |
| `unrolled-10-stack.png`, `unrolled-15-stack.png` | Every layer unrolled and stacked, the same angle lined up down the page. Each rock band shows twice (as one layer's floor and the one below's roof). |
| `screens-10-th50.png`, `screens-10-th130.png`, `screens-15-th50.png` | What a player sees at the same place in every layer, half-size, upright. |
| `screens-10-L1-places.png`, `screens-10-L3-places.png` | Six different places on one layer. The galleries sheet shows one picture six times. |

What the pictures say before any number: the top-down view is concentric rings with evenly spaced gaps. The unrolled galleries layer is a fence of identical units. The cross-layer sheets look like one picture in different tints, with a pad or a shaft added.

## 3. What exists on the moon (piece census)

| Per side | 2 and 4 | 7 | 10 | 15 |
|---|---|---|---|---|
| Pieces | 219 | 303 | 356 | 570 |
| Ring rock (floors, roofs) | 34 | 48 | 70 | 106 |
| Non-ring pieces | 185 | 255 | 286 | 464 |
| of which stair steps and lift steps | 104 (56%) | 146 (57%) | 206 (72%) | 318 (69%) |
| of which everything else | 81 | 109 | 80 | 146 |
| Zones | 22 | 15 | 50 | 54 |
| Distinct piece shapes (class, kind, thickness, width, height over its floor) | 40 | 57 | 46 | 59 |
| Distinct stair flights (steps, rise, width) | 4 | 5 | 5 | 6 |
| Distinct plank/ledge/hop heights over their floor | 7 | 9 | 8 | 9 |

Where the 286 non-ring pieces of the 10-a-side moon are:

| Group | Pieces | Share |
|---|---|---|
| Stairs under holes (and lifts), all 6 caves | 206 | 72% |
| Surface hop-tops (two heights, 180 and 260, alternating) | 20 | 7% |
| Galleries: 14 ledges + 14 top tiers | 28 | 10% |
| Springs | 3 | 1% |
| Ice (2 hanging rocks, 6 planks, 3 slope steps) | 11 | 4% |
| Updrafts | 4 | 1% |
| Tunnels (2 dividers, 12 slope steps) | 14 | 5% |
| Furnace | 0 | 0% |

The 50 zones at 10 a side are 27 spring pads (each 100 px wide), 13 ice, and 10 updraft shafts.

## 4. Constants: how many different sizes exist

From the dump, across the whole moon:

- **Holes:** every one is **220 px** wide (all sizes). **Cracks:** every one **260 px**.
- **Stair steps:** every step is **14 px** thick, 110 to 140 px wide. Each flight is **3 or 4** steps in a zigzag, each step rising **90 to 130 px**. The whole moon holds 4 to 6 distinct flights.
- **Plank, ledge and hop widths:** 5 to 6 values (rounded to 5 px: 140 or 150, 160, 220, 300, plus a few) over 48 to 82 pieces. **Heights over their floor:** 7 to 9 values in a 110 to 330 px range.
- **Rock thickness:** 3 values (crust 140, first floor 120, every floor below 100).
- **Layer headroom:** 260 to 420 px (furnace 360). A cave is always a tube about a quarter to two-fifths of the screen's 1000 px.
- **Floors:** every floor is a ring at one radius. The only non-flat floor on the whole moon is the tunnels' hills (steps 22 px high, 2 steps, so 44 px; 12 slope pieces) plus one ice hill (3 steps, 66 px). At 10 a side that is 15 slope pieces out of 356.

Histograms of the 10-a-side moon (px, full text in `why-samey-data/structure-all-sizes.txt`):

```
plank / ledge / hop heights over their floor        plank / ledge / hop widths
  120-140   6 ####                                    120-140   2 #
  180-200   6 ####                                    140-160  28 ########################
  200-220  20 ################                        160-180   2 #
  260-280   8 ######                                  200-240  15 ############
  280-300  16 ############                            280-320  14 ###########
  300-340   5 ####
gap between neighbouring holes in a band (64 gaps)   floor-ring pieces, all layers (70)
  500-1300 : 54 of 64 (1.3 to 3.4 s of walking)       250-1250 px : 60 of 70
  2100-5300 : 10 (the sealed layers, lift to lift)     1750-5000 px: 10 (the sealed layers)
free runs for a kind's pieces, all caves (80)
  under 100 px: 68 of 80    200-300: 4    over 1200: 8
```

## 5. What a layer is made of (the token strips)

The half-lap of each layer as a string (12 o'clock on the left, the safe strip in the middle, 6 o'clock on the right), 10 a side:

```
L0 surface   P....OOO....PPP....OO....PPP....OOO....PP....OOO........WWWWWWWW........OOO....PP....OOO....PPP....OO....PPP....OOO....P
L1 galleries PP..SSSSS..POOO..SSSSS...OOOP..SSSSS..POOP..SSSSS...OOOWWWWWWWWWWOOO...SSSSS..POOP..SSSSS..POOO..SSSSS...OOOP..SSSSS..PP
L2 springs   PP..ZZ....SSSSSSZZOOOOZZSSSSS.ZZOOOZZSSSSSSZZOOOZZSSSSSWWWWWWWWWWSSSS.ZZOOOZZSSSSSSZZOOOZZSSSSSSZZOOOOZZSSSSS........PPZ
L3 ice       ZZZZZZZZZZZZZZZZ.SSS.SS..OOOO.SSSSSSS.OOOO.SSSSSSS.ZZ.WWWWWWWWWWWW.ZZ.SSSSSSS.OOOO.SSSSSSS.OOOO..SSS.SS.ZZZZZZZZZZZZZZZZ
L4 updrafts  Z.PPP.................SSSSS.SSS.ZZ..SSSS.SSS...ZZ...WWWWWWWWWWWWWWWW...ZZ...SSSS.SSS..ZZ.SSSSSSSS..................PPP.Z
L5 tunnels   RRRRPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP..WWWWWWWWWWWWWWWWWWWWWWWW..PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPRRRR
L6 furnace   OOOOOOOO..............OOOOOOOOOOOOOOOO.WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW.OOOOOOOOOOOOOOOO..............OOOOOOOO
```

Share of each layer's half-lap, 10 a side (and of the non-strip arc for the last two columns):

| Layer | S stairs | O gap | Z zone | R rock | P above | W strip | Plain floor | Nothing on the floor (`.` or `P`) |
|---|---|---|---|---|---|---|---|---|
| L0 surface | 0 | 15.6% | 0 | 0 | 13.0% | 6.2% | 69.5% | 83.4% |
| L1 galleries | 26.2% | 18.2% | 0 | 0 | 6.9% | 7.3% | 44.6% | 52.1% |
| L2 springs | 28.8% | 16.7% | 16.9% | 0 | 3.0% | 8.8% | 28.3% | 31.7% |
| L3 ice | 27.5% | 12.9% | 28.8% | 0 | 0 | 10.3% | 22.8% | 22.8% |
| L4 updrafts | 23.3% | 0 | 7.0% | 0 | 4.8% | 13.6% | 59.4% | 64.9% |
| L5 tunnels | 0 | 0 | 0 | 6.1% | 70.7% | 19.9% | 4.2% | 92.4% |
| L6 furnace | 0 | 36.7% | 0 | 0 | 0 | 34.6% | 44.0% | 44.0% |

(The tunnels' `P` is the divider overhead; its lower floor is bare. The furnace is 29% bare floor, 37% crack, 35% safe strip, and nothing else.)

Averaged over the caves (not the surface), as a share of the non-strip arc:

| Per side | Stairs | Gap | Passages together | Zone | Plain floor | Nothing on the floor |
|---|---|---|---|---|---|---|
| 4 | 18% | 11% | 29% | 9% | 31% | 60% |
| 7 | 19% | 13% | 32% | 8% | 33% | 57% |
| 10 | 20% | 18% | 38% | 10% | 34% | 51% |
| 15 | 20% | 17% | 37% | 17% | 31% | 45% |

So, **in an average cave about a third of the walk is a stair or a hole, about a third of the floor is bare ring, and 45 to 60% has nothing on it at floor level (at most something overhead).** Ice and mines are the other way: the whole layer is one zone (ice 29 to 36% of the half-lap, mines 65% at 15 a side).

Strip share of the ring grows with depth: 6 to 14% in the upper layers, 20% in the tunnels, 34 to 35% in the furnace.

## 6. Passages: where the holes are

- **Pitch is exact.** The crust's holes are evenly spaced (gap variation 0.00): every 20.0 degrees at 10 a side (1,249 px on the crust), every 16.4 degrees at 15 a side (1,251 px). The same angles are reused on the smaller circles below, so a unit is about 1,070 px long on the galleries (2.8 s of walking) and 760 px on the ice at 10 a side.
- **Two phases only.** Band j's holes are at the same angles as band j-2's, except where a hole was dropped:

| Per side | Band 2 vs band 0 | Band 3 vs band 1 | Band 4 vs band 2 |
|---|---|---|---|
| 4 | 4 of 4 | none left | none left |
| 7 | 8 of 8 | 4 of 4 | none left |
| 10 | 12 of 12 | 8 of 8 | none left |
| 15 | 16 of 16 | 12 of 12 | 8 of 12 |

  At 10 a side the free holes sit at {10, 30, 50, 70, 110, ...} degrees in bands 0 and 2, and {20, 40, 60, 80, 100, ...} in bands 1 and 3.
- **Ways down.** Free holes (outside the strips) in each floor band, full circle:

| Per side | L0 to L1 | L1 to L2 | L2 to L3 | L3 to L4 | L4 to L5 | L5 to L6 | L6 to L7 | L7 to L8 |
|---|---|---|---|---|---|---|---|---|
| 4 | 12 | 8 | 4 | **0** | | | | |
| 10 | 16 | 16 | 12 | 8 | **0** | **0** | | |
| 15 | 20 | 20 | 16 | 12 | 12 | 4 | **0** | **0** |

  The last one or two transitions have no hole at all: those layers are sealed rings whose only way down (and up) is the lift in each safe strip.
- **Rhythm** at 10 a side (distance to the nearest way, mean / worst, seconds): the nearest way down is 0.8 / 1.6 s on the surface, 0.8 / 2.7 s in the galleries, 1.0 / 3.4 s in the springs, 1.2 / 3.9 s in the ice. In the upper layers a way out is never more than 4 seconds away.

## 7. The kinds: what they add

- **Room.** Each hole in the roof reserves room each side of itself for its stairs (191 px of reach plus the kind's margin: 331 px in the galleries, 251 in most other caves, 100 in the tunnels), and the galleries reserve another 380 px for the ledge. The hole pitch is set on the crust's larger circle, so on a smaller layer these reserved arcs fill the ring (galleries at 10 a side: 1,067 px between holes, less 662 for the stairs and 380 for the ledge, leaves 25). Real free runs (120 px or longer) at 10 a side:

| Layer | Runs | Real runs | What is in them |
|---|---|---|---|
| galleries | 32 | **0** (all 13 to 33 px) | nothing: its four layouts are never drawn |
| springs | 26 | 2 | 24 x one 100 px pad, 1 x pad + ledge at 290, 1 x pad + ledge at 310 |
| ice | 6 | 2 | 2 x icicles + ice, 2 x ice only, 1 x shelf + ice, 1 x 3-step hill + ice |
| updrafts | 10 | 6 | 8 x one shaft, 2 x shaft + ledge |
| tunnels | 2 | 2 | the same divider and hills, twice (mirror) |
| furnace | 4 | **0** | nothing: no stepping stones |

  The same at 15 a side: galleries 0 of 40 real runs, springs 2 of 34, columns 6 runs of which 4 are empty (the other two: an arch with a rock, a row of rocks), ice 6 (3 with icicles, 2 plain ice, 1 hill), updrafts 6 (4 a single shaft, 2 with a ledge), mines 2 (the same belt and scaffold twice), tunnels 2 (the same pair), furnace 0 of 4.
- **Layouts that exist.** The code defines 27 layouts over the 9 kinds (galleries 4, springs 3, columns 3, ice 3, updrafts 3, mines 3, flooded 3, tunnels 2, furnace 3; flooded never comes in at these sizes). In the whole 10-a-side moon the runs hold **12 different contents** (counting "empty" and "one pad"), at 15 a side 15.
- **The galleries' ledge cluster.** 14 clusters at 10 a side (22 at 15) and **every one is the same**: a 300 px ledge 210 px over the floor under a 150 px tier 290 px over it.
- **Effect over space.** A kind is mostly a floor effect over the same ring: ice, bounce pads, updraft shafts, belts and water are zones (`applyZone`), and the layout under them is the ring. Tested by the screens: with rock rings alone, the best same-layer match is within 0 to 12 points of the full picture (section 8).

## 8. What a player sees on one screen

**On the screen at once** (own-layer pieces, zones, flights of stairs in the 1528 px window; mean, with range), 10 a side:

| Layer | Own pieces | Own zones | Stair flights | Floor holes |
|---|---|---|---|---|
| galleries | 2.7 (2-4) | 0 | 1.4 (1-2) | 1.2 (0-2) |
| springs | 0.4 (0-2) | 3.0 (1-4) | 1.5 (0-2) | 1.3 (0-2) |
| ice | 1.4 (0-5) | 2.1 (0-6) | 1.4 (0-2) | 1.0 (0-2) |
| updrafts | 0.8 (0-2) | 1.4 (1-2) | 1.4 (0-3) | 0.1 (0-1) |
| tunnels | 4.1 (2-5) | 0 | 0.1 (0-1) | 0.1 (0-1) |
| furnace | 0 | 0 | 0.3 (0-1) | 0 |

A screen in a cave holds on average **zero to four pieces of its own kind and one or two flights of the same stairs**.

**Within a layer, screens repeat.** Mean over a layer's screens of the best J\* against any non-overlapping screen of the same layer, against the best in any other layer, and against the same place in another layer:

| Per side | Within one layer (full / rings alone / features alone) | Best in any other layer | Same place, other layer |
|---|---|---|---|
| 4 | 85% / 93% / 50% | 26% / 29% / 6% | 23% / 26% / 3% |
| 7 | 82% / 93% / 52% | 28% / 31% / 8% | 24% / 27% / 4% |
| 10 | 87% / 93% / 60% | 29% / 34% / 7% | 25% / 30% / 3% |
| 15 | 85% / 93% / 60% | 30% / 32% / 8% | 26% / 29% / 4% |

Per layer (full silhouette), 10 a side, within-layer best match: surface 95%, galleries 98%, springs 84%, ice 78%, updrafts 84%, tunnels 93%, furnace 80%. With rings alone: 97, 98, 91, 90, 95, 99, 84. With features alone: 74, 90, 37, 30, 53, 77, 63. At 15 a side the full numbers are 96, 94, 81, 77, 69, 86, 92, 93, 79 (surface down to the furnace).

Reading it: **the layers do differ from each other** (the features of another layer match you only 6 to 8%, and its whole screen about 30%), but **a layer looks like itself to 78 to 98% everywhere you go in it**, and the floor and roof rings alone already predict that to within 0 to 12 points. What a kind adds on top of the rings is small in this measure.

**Twins.** Share of a layer's screens with a twin elsewhere in the same layer, at least a screen width away (full silhouette, J >= 0.99 / J >= 0.95), searched at every 32 px with 32 px of sideways slack:

| Layer | 10 a side | 15 a side |
|---|---|---|
| surface | 28% / 93% | 57% / 100% |
| galleries | **54% / 79%** | **79% / 85%** |
| springs | 5% / 45% | 25% / 64% |
| columns | n/a | 0% / 34% |
| ice | 0% / 16% | 0% / 0% |
| updrafts | 0% / 0% | 0% / 0% |
| mines | n/a | 0% / 60% |
| tunnels | 0% / 43% | 0% / 67% |
| furnace | 0% / 0% | 0% / 0% |

(The deep layers read low partly for lack of candidates a screen width apart; see section 1.)

**Distinct screens in a half-lap** (leader clustering, J\* of at least 0.75 counts as the same; screens every 160 px), 10 a side, full silhouette / rings alone: surface 8 / 5, galleries 7 / 6, springs 8 / 4, ice 12 / 5, updrafts 5 / 1, tunnels 1 / 1, furnace 3 / 3. At cut-off 0.6 every layer is **one** screen (the surface 3). Pooled over the **whole** moon (all layers): 9 distinct screens of 220 at cut-off 0.6, 44 at 0.75, 142 at 0.9 (15 a side: 22, 78, 178 of 290).

**Why the six places on the galleries sheet are one picture.** Screens at 20, 40, 60, 120, 140 and 160 degrees are the same because the hole pitch is exactly 20 degrees. The 50-degree and 130-degree sheets (`screens-10-th50.png`, `screens-10-th130.png`) are 80 degrees apart, four pitches, and agree for the upper layers for the same reason (the furnace differs: its cracks are not on that pitch).

## 9. Layer against layer, as sequences

Token strips compared pairwise over the caves (angle-aligned agreement minus what chance alone would give, and a length-free edit similarity of the strips with repeats collapsed):

| Per side | Agreement above chance, mean (best pair) | Edit similarity, mean (best pair) |
|---|---|---|
| 4 | -2 points (4) | 36% (60%) |
| 7 | 2 points (22) | 38% (60%) |
| 10 | 0 points (30) | 30% (71%) |
| 15 | 1 point (39) | 29% (64%) |

So **layers are not copies of each other place for place** (agreement is chance level on average). The best-matching pairs are two layers apart (galleries and ice 48% aligned at 10 a side; galleries and columns 66% at 15), which is the two-phase hole pattern of section 6.

## 10. Growth with size

- **Counts 2 to 10 fighters (1 to 5 a side) all give the same moon**, hash for hash: Rout is clamped at 2550 until `800 * sqrt(count)` passes it (count 11), and the layer kinds depend only on Rout. 4 caves: galleries, ice, tunnels, furnace.
- From 5.5 a side up (count 11) each size is its own disc, but larger means a longer ring with more units of the same kinds: the surface's half-lap goes from 8,000 to 13,800 px, the galleries' at 10 a side is 9,600 px.
- Variety enters only through **which kinds fit**. The set changes with size (7 a side: galleries, columns, ice, tunnels, furnace; 7.5: springs instead of columns; 10: springs and updrafts, no columns; 15: all eight caves, flooded not among them) but each kind is drawn the same way at every size. The top cave is always the galleries and the bottom two are always the tunnels then the furnace.
- 15 a side has 214 more pieces than 10 a side (570 against 356): 112 are stair steps (318 against 206), 66 are kind pieces (146 against 80) and 36 are ring pieces. The distinct piece shapes go from 46 to 59.

## 11. Eight causes, ranked by how much they cause the sameness

1. **Each layer is one short unit repeated all the way round.** The hole pitch is exact (20.0 degrees at 10 a side) and every unit is laid out alike. Measured: within-layer best-match 78 to 98%; galleries, 14 identical ledge clusters; 54 to 79% of galleries screens have a 99% twin; six places on one layer are one picture. Within roughly 3 to 6 seconds on a layer you have met its unit, and the rest of the lap is the same unit again. *Breaking it needs units of unequal length and unequal contents, in a pattern with a start and an end.*
2. **The passages are most of what exists, and they are the same everywhere.** Stairs are 56 to 72% of all non-ring pieces, 18 to 20% of an average cave's walk, and holes another 11 to 18%. Every flight is one of 4 to 6 zigzags of 14 px steps; every hole is 220 px; every crack is 260 px. *A layer's furniture would need to be mostly its own things, not the lift.*
3. **The generator leaves the kinds no room, so the designed variety is dead code.** The passages' reserved arcs fill the smaller rings: 0 of 32 galleries runs can hold a piece (so its four layouts never appear), the furnace's stones are gone at 10 and 15 a side, 24 of 26 spring runs are one pad. At 10 a side the five caves that are not the galleries own 32 pieces of 286; the runs hold 12 different contents against 27 layouts defined. *Passages and kind layouts need to be planned together, on the same budget of arc.*
4. **A kind is a floor effect over the same ring, not a different space.** Ice, bounce, updraft, belt and water are zones on the ring; ice is one slab over 29 to 36% of its layer, mines one belt over 65%. Rings alone predict a layer's screens to within 0 to 12 points of the full picture, and the other kinds' features on screen are 0 to 4 pieces. *The kind would have to change what you can walk, not what the floor does.*
5. **One floor shape and one scale.** Every floor is a ring at one radius (15 slope pieces of 356 at 10 a side, none higher than 66 px), caves are tubes 260 to 420 px high, 8 to 9 distinct plank heights, 5 to 6 widths, 3 rock thicknesses. There is no big room next to a small one, no steep next to flat, no thick next to thin. *Scale and slope would have to vary within a layer, not only between layers.*
6. **Every layer is the same graph: a ring with chords, in two phases.** Holes in band j match band j-2 (100% up to 10 a side, 8 of 12 at 15), no branch, loop or dead end exists, the nearest way down is 1 to 4 s away from anywhere in the upper layers, and the bottom one or two layers have no hole at all (a sealed ring with a lift in each strip). *Routes would have to differ in shape from layer to layer.*
7. **A bigger moon is a longer lap of the same units.** 1 to 5 a side are the identical disc; 4 to 15 a side takes stair flights from 32 to 100 and kind pieces from 81 to 146. Variety enters only as which kinds fit, each drawn the same way at every size. *Size should buy new places, not more of the same.*
8. **The mirror.** Every piece (356 of 356) and every zone (50 of 50) at 10 a side has an exact twin across the 12 to 6 line, so only half the lap is unique. It is the weakest cause, because one screen rarely shows both halves, but it halves the unique content and makes going left or right a meaningless choice.

Not a cause (measured): the layers are **not** copies of one another place for place (agreement above chance 0 to 2 points on average), and their screens do differ (28 to 30% overlap). The sameness is within each layer and in the shared recipe, not a layer-for-layer duplicate.

---

### Files

- Pictures: listed in section 2.
- Raw outputs: `why-samey-data/` (`structure-all-sizes.txt`, `screens-similarity-{4,7,10,15}.txt`, `rhythm-twins-onscreen-4-10-7-15.txt`, `discs-mcGen-v3.json`).
- Scripts to re-measure a rebuilt generator: `why-samey-tools/` (`dump-gen.mjs` dumps `mcGen`, `analyze1/2/3.mjs` measure, `render.mjs` draws, `sizes.mjs` groups fighter counts by identical disc). They read the game read-only, run at BelowNormal through `run-low.mjs`, one node process each, from the `smash-bal` directory.
