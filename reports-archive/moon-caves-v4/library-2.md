# Moon Caves v4, library 2: the moon as a place

Design only. Nothing in the game was edited, committed or pushed; `smash-bal` (branch `ii-dlc`, Moon Caves v3) was only read, and the one throwaway prototype I ran lives in the scratchpad (copied to `library-2-tools/` beside this file). Written 2026-11-02 by designer 2. My lens: geography and rhythm, thinking like a level designer of a metroidvania map or a good Smash stage.

Pictures beside this file (all drawn by a small software rasteriser from the real generator's numbers, no browser):

| File | What it shows |
|---|---|
| `library-2-v3-n10-unrolled.png` / `library-2-v4-n10-unrolled.png` | the 10-a-side moon cut open and laid flat: today's, and the proposed plan's (the picture to look at first) |
| `library-2-v3-n4-unrolled.png` / `library-2-v4-n4-unrolled.png` | the same at 4 a side |
| `library-2-v3-n10.png`, `library-2-v4-n10.png`, `library-2-v4-n4.png` | the same moons from above |

In every picture the left half of the moon is the mirror image of the right half, the blue and red bands are the two safe strips, and the lettered places are the twelve landmarks (section 5).

---

## 0. The short version

**What is wrong.** The generator builds one thing, a stack of full rings with a 220 px hole about every 1,250 px, and then varies it with numbers: which of three or four furniture patterns a run of floor gets, how many steps a hole has. A designer calls that a parametric variation. Nothing is a different *kind of place*.

**The proposal, in one breath.** Vary the *kind of thing*, not the numbers. Three layers, each cheap on top of what already exists:

1. **A plan** (section 2). Before any piece is laid, the moon is planned like a map: two poles, two homes, two quarters planned separately (then mirrored), and a short list of structural moves that v3 does not have: halls two layers high, bridges, a shaft through three layers, a crater that opens the surface into the first cave, rooms divided by low doors, drop-only holes, uneven spacing, a different door density in every quarter. The plan is seeded, so every match is a different moon, and a plan that fails the fairness checks is thrown away and the next seed tried.
2. **Ten identities** (section 3). Every layer gets one verb that no other layer has (launch, hold the high deck, bounce, take cover, slide, ride, ride the belt, wade, take the low road, stay off the floor), its own shape of ring, its own footing and its own picture: a drawn back wall, not a flat colour.
3. **Twelve landmarks** (section 5). Hand-authored, named, once or twice per moon: the Crown, the Rift, the Cathedral, the Garden, the Geode, the Lake, the Aerie, the Headframe, the Sump, the Knot, the Cauldron and the Well. The plan places them; they are the things a player learns to name ("meet me at the Cathedral").

**What it costs.** About 10 to 30 percent more pieces than v3 (not counting scenery), 12 small landmark builders, a planner of roughly 300 lines (the prototype's is 301), and a scenery kit. The strips, lifts, pads, cracks and the CPU's route table keep their shape. The one thing it does not fix is the furnace: at 8 a side and up it still has no door but the two home lifts (section 6.3).

**Findings that surprised me** (all measured on the live generator):
- 2, 3, 4 and 5 a side build the *same moon*, piece for piece (pieces, zones, holes, radii and layers all equal).
- The furnace has no public hole at any size except 6 a side; at 10, 11, 13 and 15 a side the layer above it (the tunnels) has none either. The deepest one or two layers are places you ride a lift to, not places you walk to.
- The `flooded` layer kind exists but never appears at any size from 2 to 15 a side.
- Every hole in every band is 220 px wide.

**Questions for you** are in section 8 (seven, short).

---

## 1. Why it feels samey: measured on v3

From `mcGen` and from the discs it produces at 2 to 15 a side:

| # | Fact | Number |
|---|---|---|
| 1 | One shape of opening | 100% of holes are 220 px wide with 3 or 4 steps. The crust's holes are evenly spaced (1,335 px apart at 2-5 a side, 1,249 at 10, 1,251 at 15; the only longer gaps are across a strip, where a hole is skipped). |
| 2 | One moon for four sizes | 2, 3, 4 and 5 a side produce byte-identical discs (219 pieces, same layer list). 6 a side is a larger copy. |
| 3 | The cast is a function of depth | Always galleries, springs, columns, ice, updrafts, mines, tunnels, furnace in that order, taking as many as fit. `flooded` is last in line and never fits at 15 a side or fewer. |
| 4 | Every layer is a full ring of one kind | A layer's furniture comes from a hash pick of 3 or 4 "ways" per run of floor; the skeleton (a floor, a roof, holes with steps) is the same in every layer. |
| 5 | Everything is one size | Heads (floor to roof) run 260 to 420 px in every layer. The biggest open thing is one run between two holes, one layer high. The camera shows about 1,530 x 1,000 px (1,100 x 720 at zoom 0.72): that is about one run. Nothing is a vista, nothing is a squeeze. |
| 6 | The picture is a colour | Each layer's back wall is one flat fill (`MC_LOOK.back`); `mcDeco` draws craters and rubble only on the crust and floor rock; the layers' own furniture is planks and zones. A layer is a colour plus three or four piece types. |
| 7 | The deep layers have no public door | Bands with no hole but the two home lifts: the one into the furnace at every size except 6 a side; also the one into the tunnels at 10, 11, 13 and 15 a side. |

Look at `library-2-v3-n10-unrolled.png`: rock bands as flat strips, holes at a ruler's spacing in the top bands, nothing in the bottom ones.

The fix is not a bigger parameter range. It is structure (what exists), identity (what you do there) and authored one-offs (what you remember).

---

## 2. The structure

### 2.1 The frame: poles, homes, quarters

Two facts of the current design give the moon a compass for free. Both teams' safe strips are at 3 and 9 o'clock, and the CPU's "way round" rule (`mcWayTarget`) sends each team's even slots over 12 o'clock and its odd slots under 6, so the two teams *meet at the poles*. The poles are where the fights are; the flanks are where you travel.

| Place | Where | What lives there |
|---|---|---|
| **North pole** (the front, 12 o'clock) | on the mirror axis | the Crown. Self-mirror, authored symmetric. The biggest open stage. |
| **South pole** (the keel, 6 o'clock) | on the mirror axis | the Cauldron at the bottom, and on the surface a deliberate blank: "the Flat", the longest stretch with nothing on it. Self-mirror. |
| **Homes** (9 and 3 o'clock) | the strips | untouched: the same 700 px band, floors, pads and lifts. |
| **Upper quarter** (12 to 3) and **lower quarter** (3 to 6) | between | planned *separately* (different features, different door density), then the whole half is mirrored to the other side. |

```
                      N pole: the CROWN (surface + galleries), on the axis
                 ,------------------------------------------.
              ,-'   upper quarter NW       upper quarter NE   '-.
             (      mirror of NE           planned alone         )
   W home    |  strip: safe, lifts, pads       strip: safe, lifts, pads  |   E home
             (      lower quarter SW       lower quarter SE      )
              '-,   mirror of SE           planned alone      ,-'
                 '------------------------------------------'
                      S pole: the CAULDRON (furnace), the Flat on the surface
```

This is where asymmetry inside a half comes from: the upper and lower quarters of one half do not copy each other; only the two halves do. Every asymmetry inside a feature is described relative to the strip and the pole (the "pole-side wall", the "strip-side wall"), never left and right, so the mirror flips it for free.

Everything off the axis therefore appears exactly twice (once per half). Axis pieces appear once. That is the "once or twice per moon" of the landmark list.

### 2.2 The moves (what a moon is built from)

The v3 pieces stay: annular blocks, one-way planks, zones, the lifts. The new moves are all made from those.

| Move | What it is | Size | Rules | The CPU's row |
|---|---|---|---|---|
| **Pore** | a drop-only hole: a cut in a floor, no steps | 170 px | porous districts only; always lands on a floor (never over a crack) | down only |
| **Stair-hole** | v3's hole with zigzag steps | 220 px | as v3 | as v3 |
| **Geyser** | a hole with a `spring` pad under it that throws you up one band | 220 px | not over a crack | up: stand on the pad |
| **Well** | 2 or 3 stair-holes aligned one over another; spoke-face walls (wall-jump works); a ledge at most 125 px higher every time, alternating sides | 260 px wide, 1,100-1,400 tall | on a flank; its bottom never reaches the furnace roof | a column of holes: `mcRoute` already picks the next band's nearest hole |
| **Hall** | one floor band cut away for 1,000-2,600 px and *bridged* by a one-way plank at the old floor line; two layers high (880-900 px) | 2,000 px at the Cathedral | gravity inside is the lower layer's (6.1) | the grand stair is a step list |
| **Crater and Rift** | the same, in the crust: the surface opens into the first cave | 1,500 / 700 px | the surface walk continues over the bridge | terraces / ledges are step lists |
| **Gates and rooms** | a lintel: rock hanging from the roof down to 200 px over the floor, 70 px wide. Each layer is one signature room, 3 to 5 others and a smallest odd one: 4 to 6 rooms per half, 420 px to over 3,000 px wide | doors 200 high | every cave layer; never within 320 px of a mouth | the same code as v3's `drip` pieces in the columns layer |
| **Broken floor** (optional) | a run of floor cut into islands with gaps of 240 px or less (hopped, like holes) and rubble ramps down | 1,400 px | at most one per moon; not in the prototype | hops |
| **Lift** | untouched | | | untouched |

**Why ramps and spiral stairs live inside halls.** A cut wider than about 260 px cannot be hopped, so it would cut the walk round the layer above in two. So every wide cut carries a bridge, and the ramps and stairs go where there is already a bridge and headroom: the Cathedral's grand stair, the Knot's hill, the Rift's ledges, the Crown's terraces. A ramp is made of thin slabs (22 px up per 40 px along: v3's Capture the Flag slope) with air under them, never a solid wedge, so the layer below stays walkable. The Well's alternating ledges are the spiral stair, wound round a shaft instead of a pillar.

### 2.3 The plan: how it is built

Everything is placed on the right half (0 to 180 degrees clockwise from 12 o'clock) and mirrored. In words:

```
plan(N, seed):
  cast      the caves' kinds (rules in 3.5): furnace last, tunnels over it, galleries first, the middle drawn by seed
  axis      CROWN at 12 o'clock, CAULDRON at 6 o'clock (self-mirror), placed first
  features  then the WELL, then the halls (Cathedral, Aerie, Headframe), the RIFT, then each layer's own room:
              quarter  = the one with fewer features on the layers this one touches (ties by seed)
              position = a golden-ratio fraction of the room that is left (strip, axis, crack margins taken out);
                         shrunk to 80/65/50/40 percent if it does not fit; dropped if it still does not
              never within 11 degrees of a feature on a neighbouring layer, or 6 of any other
  openings  per band and quarter: a porosity class (dense 620, medium 950, sparse 1,500 px apart), spacing jittered +-30%,
              type by seeded draw: stair-hole 55%, pore 30%, geyser 15% (the band over the furnace: stairs only);
              never within 450 px of another opening in the band, 340 px of a stair-hole in the next band, or a strip, crack or feature
  way up    any stretch of a layer 2,400 px or longer with no way up to the layer above gets a stair-hole in its middle
  gates     walk each layer with room widths 0.7-2.3 x 750 px (a seeded rotation of one long-short-long motif);
              a gate at each hall's edge; a room under 420 px is merged
  mirror    the left half is the right half mirrored, chirality flipped (ramps, belts, ledges)
  test      the checks in 6.4; if any fails, seed + 1, up to 8 tries
```

The seed is the match's seed, chosen once by the host and carried in the same geometry message that carries `N` and `k` today (`mcGeoOut` / `mcNetGeo` already hash the pieces so a guest can check them). The generator stays pure.

How this slots into `mcGen`: today's order is rings, holes, rock, steps, ledges, hop-tops, pads, then each layer's furniture on the arcs its passages leave free. The plan replaces the "holes" loop and adds bridges, gates and the landmark builders; the per-kind furniture code is kept as it is, because it already takes a list of reserved arcs (`res`); the plan simply adds its footprints to that list.

### 2.4 How many, by size

All from the prototype, mean of 40 seeds per size. "Landmark kinds" counts the named places a moon has (every flank one appears twice).

| Per side | Disc radius | Caves | Landmark kinds placed | Stair-holes / pores / geysers per half | Halls (not the Crown or Rift) | Well |
|---|---|---|---|---|---|---|
| 2-5 | 2,550 | 4 | 5.8 of 6 | 6.4 / 0.7 / 0.3 | Cathedral, Cauldron's two chambers | 2 bands |
| 6 | 2,771 | 4 | 5.7 of 6 | 7.9 / 1.0 / 0.6 | same | 2 |
| 7 | 2,993 | 5 | 6.8 of 7 | 9.3 / 1.4 / 0.8 | same | 2 |
| 8 | 3,200 | 5 | 7.9 of 8 | 10.5 / 1.6 / 1.1 | Cathedral only (six cracks: 6.3) | 2 |
| 9-11 | 3,394-3,752 | 6 | 8.9 of 9 | 11.9-14.2 / 1.8-2.9 / 1.1-1.5 | Cathedral, Aerie or Headframe | 3 |
| 12-14 | 3,919-4,233 | 7 | 10.0 of 10 | 16.3-19.1 / 3.4-4.6 / 1.7-2.4 | up to 3 | 3 |
| 15 | 4,382 | 8 | 11.0 of 11 | 20.8 / 5.6 / 2.8 | 3 | 3 |

Counting every kind of opening (stair-holes, pores, geysers, well holes, halls, rifts and the crater), the plan has about 13.3, 17.6, 23.0 and 37.3 per half at 4, 7, 10 and 15 a side, against v3's 12, 18, 26 and 42: about 88 to 111 percent as many, spread unevenly and in seven shapes instead of one. The porosity classes are the knob if you want more.

A landmark that does not fit is dropped (every one fit in 30 of 40 seeds at 4 a side, 38 of 40 at 10 and 39 of 40 at 15); the retry loop picks another seed. At 2-6 a side the Knot is not placed: the Cauldron's two chambers are the Warren's big room there.

### 2.5 Sketches: 4 a side and 10 a side

The top-down views are `library-2-v4-n4.png` and `library-2-v4-n10.png` (and `library-2-v3-n10.png` for today's); the maps below are the moon cut open and laid flat, which shows heights and layers better.

How to read the maps: the moon cut open and laid flat, **the right half only** (the left is its mirror). Columns are 2 degrees: 12 o'clock at the left edge, 3 o'clock in the middle, 6 o'clock at the right edge. Each layer is two rows: the air row (what the layer holds) above and the row of its floor band (what is cut in the floor) below.

- Air row: `.` open, `|` a gate, `%` the safe strip, a letter is a landmark (A Crown, B Rift, C Cathedral, D Garden, E Geode, F Lake, G Aerie, H Headframe, I Sump, J Knot, K Cauldron, L Well).
- Floor row: `=` rock, `U` stair-hole, `o` pore, `^` geyser, `L` a well hole, `_` a hall's cut (`b` marks its bridge), `V` the rift's cut, `*` a home lift, `X` a crack.
- The layers' own furniture (planks, pads, belts) is not drawn: it is v3's, laid on the free runs.

**4 a side** (2,550 px disc, 4 caves: galleries, ice, tunnels, furnace; seed 2):

```
           12                                          3 o'clock                           6
           |                                           |                                           |
surface    AAAAAAAAA                                 %%%%%%%      BBBBB                               
           ___b_____======^=========U=======o=========*****=======VVVbV========U=================U====
galleries  AAAAAAAAAAAA............LLLLL.|.......|..%%%%%%%%%...|BBBBBB|..CCCCCCCCCCCCCCCCCCCC........
           ====================U=====L================*****===============___b_____b_____b____========
ice        ....|FFFFFFFFFFFFFFF|...LLLLL...|......%%%%%%%%%%%%%........|CCCCCCCCCCCCCCCCCCCCCCCC|.....
           ===================U======L================*****=======================U===================
tunnels    .......................LLLLLLL......%%%%%%%%%%%%%%%%%%%..........|KKKKKKKKKKKKKKK|.KKKKKKKK
           ===========================================*****==================___b_____b_____==========
furnace    ..............................%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%.KKKKKKKKKKKKKKKKKKKKKKKKKKKKK
           XXXXXXX=============================================================================XXXXXXX
```

- North pole: the Crown opens the surface onto the galleries (A, rows 0-1). North-east quarter: the Lake on the ice layer at 24 degrees and the Well at 52, going from the galleries through the ice into the tunnels.
- South-east quarter: a Rift in the crust at 113 degrees (shrunk to 350 px because the quarter is crowded) and the Cathedral at 145 between the galleries and the ice, 1,300 px wide at this size (2,000 on the bigger moons). At the south pole: the Cauldron, two bridged chambers (K, tunnels row, either side of 146 degrees) opening the Warren onto the furnace, and its stones either side of the crack. The Knot is merged into them.
- The way down without a lift: surface, galleries, ice, tunnels, furnace, all by flank doors (estimate 8.8 s down to the Warren and 12.4 s back up; 10.0 s down to the furnace through the Cauldron, 15.1 s back). v3 has no flank door into the furnace at this size.

**10 a side** (3,578 px disc, 6 caves: galleries, springs, ice, updrafts, tunnels, furnace; seed 7):

```
           12                                          3 o'clock                           6
           |                                           |                                           |
surface    AAAAAAA                                    %%%%%      BBBBBBB                              
           ___b___===U===U==U====o====o=======U===U===*****===U==VVVbVVV========U===========U===o=====
galleries  AAAAAAAA................|.....LLL.........%%%%%%%....|BBBBBBB|..CCCCCCCCCCCCCCCCCCC|.......
           =====================U=========L===========*****================___b_____b_____b___========
springs    ................DDDDDDDDDDD..LLLL..|......%%%%%%%............|CCCCCCCCCCCCCCCCCCCCCCC|.....
           =====================U=========L===========*****=====U=====================================
ice        .....|GGGGGGGGGGGGGG|........LLLLL.......%%%%%%%%%.......|FFFFFFFFFFFFFFFFFF|..............
           ======___b_____b____===========L===========*****===============================U=====U=====
updrafts   ...|GGGGGGGGGGGGGGGGGG|......LLLLL.....%%%%%%%%%%%%%.|...........|.........................
           ===================U=======================*****=======================U===================
tunnels    .....................................%%%%%%%%%%%%%%%%%....JJJJJJJJJJJJJJJJJJJJJJJJ|........
           ===========================================*****===========================================
furnace    ..............................%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%..................KKKKKKKKKKKK
           XXXXXX===========XXXXXXXXXXXX=================================XXXXXXXXXXXX===========XXXXXX
```

- North-east is the vertical quarter: the Garden (D, springs) at 42 degrees, the Aerie (G, ice and updrafts, a hall) at 26, the Well (L) at 62 going through four layers. South-east is the walking quarter: the Rift at 114, the Lake at 132, the Cathedral at 146 and the Knot at 139 (tunnels).
- The furnace has no flank door: six cracks (16 players and up) leave no room (6.3). The layer above it, the Warren, has two flank stair-holes per half (v3: none at this size).
- Features on neighbouring layers are at least 11 degrees apart and on any layers at least 6 (the two vertical neighbours, the Cathedral at 146 and the Knot at 139, are three layers apart).

---

## 3. Ten identities, one verb each

The test for every layer is "cover the colours: would you still know where you are?" and "what can you do here that you cannot do anywhere else in the moon?". The second answer is its **verb**.

### 3.1 The table

| Layer (v3 kind) | Place name (ours only: no words are drawn in a match) | The verb | Geography: how the ring is divided | Signature | Footing and gravity | What you want there |
|---|---|---|---|---|---|---|
| surface | **the Skin** | launch | open ring; hop-tops; craters in the ground; the Crown at the north pole; a Rift on each flank; "the Flat" at the south pole | Crown, Rift | low gravity; the only layer with space KOs | the rim: someone to knock off it |
| galleries | **the Cloister** | hold the high deck | rooms with three decks of balconies; one big room, the Cathedral | Cathedral | low gravity | high ground over a fight |
| springs | **the Garden** | bounce | beds of pads (a bed is five caps) with mushroom stalks between; ledges you can only reach by bounce | Garden | low gravity; bounce pads | airtime: the top cap throws you through the roof |
| columns | **the Crystal Grove** | take cover | rock up and rock hung down; pillars block shots; one closed room | Geode | low or normal | cover, then the heal pool |
| ice | **the Frost** | slide | long sheets, shelves, an island; one thin patch | Lake | slick floor | a footing that does not move |
| updrafts | **the Aerie** | ride | the tallest layer (420 px); draughts up to isles; the hall opens it to the layer above | Aerie | updraft zones | height: the perch |
| mines | **the Pit** | ride the belt | belts in tiers, scaffolds, a lift works | Headframe | belts (a third of a run's speed) | the lift (the way up) and the crates (items) |
| flooded | **the Sump** | wade | a water bowl, rafts, a dry island, a drain | Sump | water drags 13% a frame sideways | the island: the one place to catch your breath |
| tunnels | **the Warren** | take the low road or the high | two lanes with a divider and hills; rooms short; one junction | Knot | normal gravity; head 200 in the low lane | the junction |
| furnace | **the Forge** | stay off the floor | one room, no gates: the whole ring in view; stones over a hot floor | Cauldron | the floor flares 70 frames in 260 | the stones; the core is the KO |

### 3.2 Palette and scenery (the cheapest big change)

Today only a flat fill differs. Each layer gets a **back-wall kit**: scenery drawn on the back wall, no collision, fixed at build time from a hash (like `mcDeco`), culled by `mcInView`, a few props per 1,000 px.

| Layer | Back wall / rock / plank (v3 value -> proposed) | Scenery kit |
|---|---|---|
| surface | regolith `#9a9da5` | boulder fields, a lander wreck, a mast, rover tracks, no flat sky |
| galleries | `#2a2f3b` -> warm slate `#2b2a33`, rock `#77747c`, plank pale marble `#d9cdb4` | arches, banners, hanging chains, window light shafts, lantern glows `#ffb84d` |
| springs | `#2c2836` -> `#241f33`, rock `#5d4f7a`, plank `#e9b8d6` | giant mushroom silhouettes, cyan spore motes `#7ff0e0`, pink caps |
| columns | `#2f2925` -> deep teal `#161f2b`, rock `#35607a`, plank glass `#bfeaff` | crystal clusters, prism light shafts, glints |
| ice | `#1e2a36` kept; rock `#8db3cc`, plank `#dcf2ff` | frozen falls, icicles, drifting snow, breath puffs |
| updrafts | `#222b2f` -> night blue `#1b2430` | distant floating isles, cloud wisps, rising streaks |
| mines | `#2a231d` kept | timber supports, rails, carts, hanging lamps, ore glints |
| flooded | `#1a2632` -> green-black `#17262a`, rock mossy `#3f6a5f` | half-sunk arches, drips, bubbles, a waterline |
| tunnels | `#222429` kept | round burrow mouths in the back wall, roots, bones, a stronger gloom |
| furnace | `#341d17` kept | pipes, chains, slag pools, rising embers, heat shimmer |

Plus a **mood tint**: a screen-wide colour wash eased over about 150 px as the camera crosses into a layer (a rectangle fill with low alpha, about 30 lines). The picture then changes as you drop through a floor, which no amount of furniture does.

### 3.3 New footing the engine already has

`applyZone` already supports types the moon does not use: `heal`, `glue`, `wind`, `float`, `spring`, `damage`. The moon's zone drawing (`mcDrawZones`) would need a few lines for each one used. Proposed uses: `heal` (weak, strength about 0.1, about 2 percent a second) for the Geode's and the Sump's pools; `spring` for the geysers (a throw of 24 x strength: 660 px high in low gravity and 460 in normal at strength 1, so strength 0.9 and 1.1 to rise one band); `wind` as an optional alternating draught in the Warren (the lower lane blows one way, the upper the other, meeting at the Knot). Nothing else is required.

### 3.4 Dead ends, loops and a way through

- **Dead ends are one-way drops** (pores): you can fall in but there is no stair back up. A room with one door is never made.
- **Loops**: the two-door Geode; the Cathedral (walk over the bridge or across the nave floor); the Rift (bridge above, galleries below).
- **A secret** is a pore in the Geode's floor under the pool: enter by a door, leave by the trapdoor into the layer below. It is not drawn differently.

### 3.5 The cast

Today: one fixed order. Proposed (the number of caves still comes from the depth, as now):

1. The furnace is last, and the tunnels are directly over it from three caves up (tight over the climax).
2. The galleries are first (the Cloister under the Crown: the crater opens onto it).
3. The middle layers are drawn by seed from springs, columns, ice, updrafts, mines and flooded, without repeats. So `flooded` can finally appear.
4. Two neighbour rules: never ice beside flooded (both slow your feet), never springs beside updrafts (both throw you up).

At 10 a side that is tens of casts instead of one.

---

## 4. Rhythm: a descent from the surface to the furnace

### 4.1 The pacing sheet (10 a side; walk times at 384 px/s)

The moon narrows as you go down, so the descent is also a zoom-in: the half ring is 7.4 screens wide at the surface and 1.4 at the furnace.

| Layer | Half ring | Scale (the biggest open thing) | Tension | What the walk is |
|---|---|---|---|---|
| Surface | 11,240 px, 29 s | XL: the Crown bowl, the Flat | 2: only space KOs | a long open run with one reveal (the Crown), one choke (the Rift) |
| 1 galleries | 9,610 px, 25 s | L: the Cathedral, 2,000 x 900 | 3 | rooms, a gate, then the hall: tight to huge |
| 2 springs | 7,970 px, 21 s | M: the Garden's bed, 1,300 | 1: the soft layer | hops, bounce, nobody gets hurt: release |
| 3 ice | 6,840 px, 18 s | L: the Lake, 1,300 flat | 3 | a long slide between short rooms |
| 4 updrafts | 5,210 px, 14 s | XL up: the Aerie, 780 high | 2 | draughts and isles: the second vista |
| 5 tunnels | 3,575 px, 9 s | S: lanes 200 high | 4: the tight one | low road or high road, a junction |
| 6 furnace | 2,130 px, 5.5 s | one room, all in sight | 5: the climax | a flaring floor, stones, the crack |

Rules the plan keeps (so that this is not luck):

1. **Tight and wide alternate.** No two tight layers, no two vistas, in a row (the cast rules in 3.5 give that).
2. **Every hall is preceded by a gate**: the door is the compression, the hall is the release.
3. **The bottom is the opposite of the top**: the Warren is the tightest layer and the Forge the only one with no gates at all; you see the whole climax at once.
4. **No two neighbouring layers share a verb class** (slide, bounce, ride, wade).
5. **A way up is never far**: any stretch of 2,400 px (6 s) without one gets a stair-hole, and a plan with a stretch over 3,000 px is rejected (6.4).

### 4.2 What the walk costs (a graph with assumed costs, not play)

Estimates, with climbing 3 s per stair-hole up and 1 s down, a hall or rift 3.4 s up, a well 2.4 s a band, a geyser 1.6 s, the lifts 3.2 s up and 1.2 s down, and 384 px/s on the flat.

**Flank-only descent** (no lifts), median over 40 seeds, to the layer above the furnace:

| Per side | Down | Back up | v3 |
|---|---|---|---|
| 4 | 8.2 s | 12.8 s | possible |
| 7 | 10.0 s | 15.7 s | possible |
| 10 | 13.8 s | 20.9 s | no flank door |
| 12 | 17.1 s | 25.2 s | possible |
| 15 | 21.0 s | 28.9 s | no flank door |

(v3 at 10, 11, 13 and 15 a side has no flank door into the tunnels; at all sizes but 6 none into the furnace.) The plan reaches the layer above the furnace in 40 of 40 seeds at every size I tried.

**Walk to the nearest way up** (px along the ring), v3 against the plan (median of the 40 seeds' means / medians of their longest, per layer):

| 10 a side | v3 mean / longest | Plan mean / longest |
|---|---|---|
| 1 galleries | 267 / 534 | 313 / 875 |
| 2 springs | 258 / 886 | 630 / 2,033 |
| 3 ice | 317 / 1,140 | 539 / 1,565 |
| 4 updrafts | 362 / 1,158 | 373 / 1,066 |
| 5 tunnels | 894 / 1,788 | 307 / 746 |
| 6 furnace | 532 / 1,065 | 532 / 1,065 |

The honest reading: the upper layers have longer stretches without a way up (the halls and the rooms), the deep layers much shorter. The worst seed at 10 a side reaches 4,064 px (10 s) on the galleries, which is why the test in 6.4 rejects a plan whose longest stretch is over 3,000 px.

---

## 5. Twelve landmarks

Cross-section sketches: x runs along the ground, y is up (outward); the scale is about 50 px a column and 55-70 px a row. `#` rock, `=` floor, `-` one-way plank or bridge, `:` ice, `~` water, `*` bounce pad, `^` updraft, `>` `<` belts, `+` heal pool, `!` hot floor, `o` an item.

| # | Landmark | Layer | Count | Role |
|---|---|---|---|---|
| 1 | The Crown | surface and galleries | 1 (north pole) | view |
| 2 | The Rift | surface | 2 | choke |
| 3 | The Cathedral | galleries and below | 2 | view, the big arena |
| 4 | The Garden | springs | 2 | rest |
| 5 | The Geode | columns | 2 | prize |
| 6 | The Lake | ice | 2 | trap |
| 7 | The Aerie | updrafts and above | 2 | view and prize |
| 8 | The Headframe | mines and below | 2 | choke |
| 9 | The Sump | flooded | 2 | rest |
| 10 | The Knot | tunnels | 2 | choke |
| 11 | The Cauldron | tunnels and furnace | 1 (south pole) | trap, the climax |
| 12 | The Well | three bands | 2 | choke, vertical |

### 1. The Crown (view; north pole; once)

The surface opens into the first cave exactly where the teams meet: a bowl 1,500 px across and 520 px deep, with a one-way bridge across it at the surface line so the walk round continues, three terraces down each side (+130 steps, 260 px wide) and a low mesa in the middle. Layer 1's own furniture is cleared across 1,700 px. Seen from the bridge, the whole bowl and the lantern light below; seen from below, the sky.

```
############-------------------------------############   <- +520 bridge (one-way) = the surface line, 1500 px
############------                   ------############   <- +390 terrace 3 (260 wide)
#############                             #############
#############  ------             ------  #############   <- +260 terrace 2
#############                             #############
#############     ------       ------     #############   <- +130 terrace 1, then the floor
#############           #######           #############   <- mesa 300 x 90
#######################################################   <- 0   the crater floor = the galleries' floor
#######################################################
```

Build: crust cut, bridge, six planks, one block. CPU: the terraces are a step list; the bridge is a floor. Fairness: self-mirror by construction.

### 2. The Rift (choke; surface; twice)

A 700 px cut in the crust with a bridge over it (350 px when the quarter is crowded): on the surface the way round becomes one lane for 700 px. Knocked off, you fall 520 px into the galleries; the way back is three ledges on alternating walls (the pole-side wall first) or the nearest stair-hole.

```
###############-------------------###############   <- +520 bridge, 700 px: the surface walk goes on over it
################             -----###############   <- +390 ledge on the pole-side wall
################                 ################
###############-----             ################   <- +260 ledge on the strip-side wall
################                 ################
################             -----###############   <- +130 ledge
################                 ################
#################################################   <- 0   layer 1's floor: a 520 px drop
#################################################
```

### 3. The Cathedral (arena; galleries; twice)

A hall: the floor band between the galleries and the layer below is cut for 2,000 px (1,300 at 2-5 a side: the width is capped at 0.39 of the lower layer's radius) and bridged. 900 px from nave floor to roof. On the strip side, three balconies stepping inward (+130, +260, +390); on the pole side, the grand stair (a thin ramp, 24 steps, 960 px long, reaching the bridge); a floating isle in the middle. A gate at each end: you come through a 200 px door and the room opens to 900 px.

```
#################################################################   <- +900 roof of layer 1
#############                                       #############
#############                                       #############
#############                                       #############   <- layer 1's air: 380 px over the bridge
#############                                       #############
#############                                      ##############
############-------------------------------------###-############   <- +520 bridge = layer 1's floor line, 2000 px, one-way
############-------                           ####  #############   <- balcony 3 (strip side)
#############                               ###     #############
#############  -------       -------      ###       #############   <- balcony 2; the isle (340 wide) at +260; the grand stair on the pole side
#############                         #####         #############
#############     -------           ###             #############   <- balcony 1
#############                     ###               #############
=================================##==============================   <- 0   the nave floor = layer 2's floor
#################################################################
```

Gravity inside is the lower layer's (6.1). The bridge is one-way: fight on the nave floor, drop through, jump up through.

### 4. The Garden (rest; springs; twice)

Five pink caps on the floor and three on ledges at +290; at low gravity a cap at strength 1.3 throws 295 px. The top cap sits under a hole in the floor above: a way up that is a bounce chain (it counts as a two-way passage in the CPU's table). Nothing here hurts; it is the release after the Cathedral.

```
#######################################    ################   <- the floor above, with a hole over the highest ledge
#######################################    ################
#######################################    ################   <- roof of the Garden (head 400)

                 -***-          -***-  -**-                   <- ledges at +290, each with a cap: x1.3 throws 295 higher




=============***====****====***====****====***=============   <- 0   floor
###########################################################
```

### 5. The Geode (prize; columns; twice)

A closed crystal room 1,300 px long between two doors, each a 160 px low tunnel 200 px high (a squeeze, then a hush). Inside: two pillars 220 px high for cover, a heal pool (160 px wide, strength about 0.1) and a cache: one item every 25 s if empty. Two doors, so never a dead end; the pool is in an open room, so it is a fight, not a camp. A pore under the pool is the secret way out.

```
#################################################################   <- roof (head 340)
                ####        ##     ##        ####
                ####    ### ##     ## ###    ####                   <- two doors, 200 high, each a 160 px low tunnel into the room
                        ###           ###
                        ###           ###                           <- pillars 70 x 220 for cover
                        ###           ###
========================###===+++++===###========================   <- 0   floor; the room is 1300 px between the doors
#################################################################
```

### 6. The Lake (trap; ice; twice)

A 1,300 px sheet of ice with an island in the middle (260 x 70), two ice shelves at +190, and one thin patch: a 170 px pore in the floor at the sheet's edge that drops to the layer below. Not a KO; it takes you out of the fight and 400 px down.

```
###############################################   <- roof (head 260)
           ::::                 ::::              <- ice shelves at +190 (ice on top)


                    #######
          ::::::::::#######::::::::::             <- island 260 x 70
==========::::::::::#######     :::::==========   <- 0   floor, with the thin-ice hole at +205..+375 (drops to the layer below)
###########################     ###############
```

### 7. The Aerie (view and prize; updrafts; twice)

A hall: the band over the updrafts layer is cut for 1,000 px and bridged, so the tallest layer (420 px) opens into the layer above (780 px in all). Three 90 px draughts lift you from the floor to the roof, two isles at +290 and +420, and a perch above the bridge (200 px wide) with an item: the second vista of the descent.

```
#############################################################   <- +780 roof (the layer above's)
##################   ^^^^    ^^^    ^^^^   ##################
##################   ^^^^   --o---  ^^^^   ##################   <- the perch (200 wide) and its item
##################   ^^^^    ^^^    ^^^^   ##################
##################===^^^^====^^^====^^^^====#################   <- +520 bridge = the layer above's floor line, 1000 px
##################   ^^^^    ^^^    ^^^^   ##################
##################   ^^^^    ^^^  -------  ##################   <- isle
##################   ^^^^    ^^^    ^^^^   ##################
##################   ^^^^ -------   ^^^^   ##################   <- isle; three 90 px draughts lift you from 0 to the roof
##################   ^^^^    ^^^    ^^^^   ##################
##################   ^^^^    ^^^    ^^^^   ##################
##################   ^^^^    ^^^    ^^^^   ##################
##################   ^^^^    ^^^    ^^^^   ##################
##################===^^^^====^^^====^^^^===##################   <- 0   floor of the updrafts layer
#############################################################
```

### 8. The Headframe (choke; mines; twice)

A hall in the mines' floor, 900 px wide, with three tiers of belts, each running the opposite way to the one below, each overlapping the next by a hop (130 px or less), up to a bridge. The way up is a treadmill staircase; the way down is a drop. Belts push a third as fast as a run, so you can fight your way up.

```
###########################################################   <- roof of the mines layer
###################                     ###################
###################                     ###################
###################                     ###################
##################=======================##################   <- +520 bridge = the mines' floor line (one-way); 900 px
###################                     ###################
###################                     ###################
###################>>>>>>>>>>>>>>>>>>>  ###################   <- belt 3 runs toward the pole
###################                     ###################
###################   <<<<<<<<<<<<<<<<<<###################   <- belt 2 runs the other way
###################                     ###################
###################>>>>>>>>>>>>>>>>>>>  ###################   <- belt 1 runs toward the pole
###################                     ###################
###################=====================###################   <- 0   the floor of the layer below
###########################################################
```

### 9. The Sump (rest; flooded; twice)

1,400 px of water 200 px deep (it drags at you 13 percent a frame sideways, so knockback bleeds off), two rafts, a dry island with a heal pool, and a 170 px drain in the floor at one edge. The one place in the moon where a fight slows down. Needs the cast rule that lets `flooded` appear.

```
#################################################   <- roof (head 280)

          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~             <- water 200 deep: it drags at you, the air above is dry
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
          ~~~~---~~~~~~~~~~~~~~~---~~~~             <- rafts
          ~~~~~~~~~~~~+++++~~~~~~~~~~~~             <- dry island and its heal pool
          ~~~~~~~~~~~~#####~~~~~~~~~~~~
==========~~~~~~~     #####~~~~~~~~~~~~==========   <- 0   floor, with the drain (170 px) at -340..-170
#################     ###########################
```

### 10. The Knot (choke; tunnels; twice)

The Warren's junction. For 900 px the divider between the two lanes is replaced by a one-way bridge at the upper floor line, and a hill of two thin ramps (v3's slope) meets under it: walk up, walk over, or drop through. The chamber is 420 px high, the only room in the Warren with room for a double jump. At 2-6 a side the Cauldron's chambers stand in for it.

```
###########################################################   <- roof



##################----------/\\----------##################   <- +250 the divider is gone: one-way bridge, 900 px; the upper tunnels run on at each end
###################       /// \\\       ###################
                        ///     \\\
                      ///         \\\                         <- a hill of two thin ramps (22 up per 40 along) meets under the bridge: walk up, walk over
                    ///             \\\
                  ///                 \\\
===========================================================   <- 0   the lower tunnel's floor (200 high under the divider on both sides)
###########################################################
```

### 11. The Cauldron (trap, the climax; south pole; once)

The furnace around the south crack. Stepping stones in three tiers each side of it over the flaring floor. At 7 a side and fewer, two bridged chambers (520 px each) open the Warren onto the furnace either side of the crack, 410 px clear of its edge, with the roof left whole over the crack itself: nobody walks into it. At 8 and up the six cracks leave no room (6.3): stones only.

```
########------------###############------------########   <- the Warren's floor, one-way bridges over the two chambers (520 wide each)
########            ###############            ########
########            ###############            ########   <- roof of the furnace: whole over the crack and 410 px round it

               ----                 ----                  <- three tiers of stepping stones, low to high away from the crack

                 ----             ----

                   ----         ----

==============!!!!!!!!!!       !!!!!!!!!!==============   <- 0   floor; the crack (260 wide) in the middle is the core
########################       ########################
```

### 12. The Well (choke, vertical; three bands; twice)

Two or three stair-holes aligned one above another (260 px wide) through 1,100 to 1,400 px: spoke-face walls for wall-jumping, and a ledge at most 125 px higher every time, alternating sides. A fast way up (about 5 s) and a long drop down. At 10 a side it runs from layer 1 to layer 4; its bottom is never over the furnace roof. Gravity changes mid-shaft (low above, normal below); the ledge spacing in the lower half is 112 px.

```
         ####################         ####################   <- layer 1's floor (top of band 1)
         ####################         ####################
         #####################       #####################
         #####################   -----####################
         ####################-----   #####################   <- a ledge every 125 px, alternating sides: wall-jump or step up
         #####################   -----####################
         ####################         ####################   <- band 2: the shaft stays 260 px wide
         ####################         ####################
         ####################    -----####################   <- band 3
         ####################         ####################
         #####################   -----####################
         #####################       #####################
         ####################-----   #####################
         #####################   -----####################
         ####################-----   #####################
         =================================================   <- 0   the floor of layer 4
```

---

## 6. Fairness, CPU and cost

### 6.1 Fairness

- **Mirror.** Everything is placed on one half and mirrored; axis pieces are self-mirror. Checked on the prototype's pieces: 15 plans (3 sizes, 5 seeds), 0 pieces without a mirror partner out of about 190 to 520 each.
- **The strips are untouched.** The 700 px band, its floors, lifts and pads keep their shape. Every opening stays out of it: 70 px for a hall's edge, 211 px for a stair-hole (the steps' reach), 170 px for a pore, measured at the lower layer's radius where the strip is widest. 0 violations in 14 sizes x 40 seeds.
- **Cracks.** No opening (other than a drop that lands on a floor) within the crack clearance of v3; the Cauldron's roof stays whole over the crack. 0 violations.
- **Gravity inside a hall belongs to the chamber**, the lower layer's: `mcGravAt` gets one check for "am I inside a hall's box" so nobody changes weight in mid-air. (Without it, a hall that straddles the low/normal line would.)
- **Minimum clear height on any route: 200 px.** The tallest fighter is size 2 (`setFighterSize` clamps 0.5 to 2): 96 px, with the single jump 126.
- **No unwinnable camps.** Heal pools only in rooms with two ways in or an open island (the Geode, the Sump); never a room with one door; a drop-only pore always lands on a floor.
- **Mirror of footing.** Ice, belts and draughts are symmetric by construction, with belt and wind directions flipped by the mirror.

### 6.2 CPU

- **The route table** (`MCAVE.holes`) gets a `kind` and an up/down flag per row. `pore`: down only (left out of "up" routes). `geyser`: up by standing on the pad. `stair`, `hall` (the grand stair), `rift` (ledges), `crown` (terraces): a `steps` list the existing `mcRouteSteer` already climbs. `well`: one row per band, aligned, so `mcRoute` picks the next band's nearest hole, which is the one above.
- **Bridges are floors; gates are the columns layer's `drip` pieces** (lintels 220 above the floor in the columns layer today, 200 proposed), so the existing `mcRockHop` and `mcRoofOver` apply.
- **`mcPathCost`** stays: same layer is the arc, other layers go by the table.
- **Items.** `mcFloorSpot` weights floors by length; the Geode, Aerie perch and Sump get fixed cache spots on top (an item every 25 s if empty).
- Unchanged: the 4-second give-up, `mcCrowd`, the CPU's eyes.

### 6.3 What the plan cannot do: the furnace at 8 a side and up

From 16 players there are six cracks (at 0, 45, 135, 180 and the mirror), and the clearance round each leaves no room for a door in the band over the furnace (the shell's ring is 4,260 px round at 10 a side, and the two strips and six cracks with their clearance use all of it). So at 8 a side and up the furnace stays lift-only, as in v3, and the plan makes the *tunnels* reachable instead (40 of 40 seeds). The way to give the furnace a public door at the big sizes is fewer, wider cracks (two of 780 px on the axis instead of six of 260: the same total width, no fragmentation). That is a v3 decision, so it is a question (section 8).

### 6.4 The tests the plan must pass (generate and test)

A plan is accepted only if: every landmark that fits is placed (or the Knot is merged); the strips and cracks are clear; every quarter-band with room has a two-way opening; the flank-only walk reaches the layer above the furnace; no stretch of a layer has no way up for more than 3,000 px; and the pieces mirror. If any fails, seed + 1 (at most 8 tries). The prototype runs these over 14 sizes x 40 seeds.

### 6.5 Cost

| Item | Number |
|---|---|
| Structure pieces (rock, bridges, steps, gates, landmark furniture) | 188-206 / 332-366 / 448-518 at 4 / 10 / 15 a side (v3's whole disc: 219 / 356 / 570) |
| Plus v3's per-kind furniture on the free runs | about 80-150 more (v3 has 81, 80 and 146 such pieces at 4, 10 and 15 a side), so about 10 to 30 percent more than v3 |
| `mcWindow` | loops every piece per frame entry (linear): 900 pieces x 30 fighters is about 27,000 comparisons a frame, negligible; add an angle index past about 1,500 |
| Scenery | drawn only when in view, a few hundred at most, no per-frame allocation |
| Net | one extra field (the seed) in the geometry message; the guest rebuilds and checks the hash as it does now |
| Builder work (my estimate) | planner and checks 300-400 lines, 12 landmark builders 400-600, scenery kit 200, tint 30 |

### 6.6 What I did not verify

- No CPU was run in the new geometry; I only checked that routes exist. The lintel clearance against CPU double jumps is the first thing to watch.
- Everything about walk times uses a graph with assumed costs (4.2), not play.
- Drawing cost of the scenery kit is unmeasured.
- The prototype lays only the structure; the layers' own furniture is v3's and was not re-laid, so some of the sketched rooms are emptier than they will be.

---

## 7. Landing it

Each step is one cheap agent task, hidden behind `MCAVE_DEV` like the rest until you say.

1. **Bones.** Planner, typed openings, gates, halls with bridges, the way-up rule and the tests; v3's furniture on the free runs. You see the new skeleton.
2. **Cross-layer set pieces.** Crown, Rift, Cathedral, Well, the Cauldron's chambers.
3. **Layer signatures.** Garden, Geode, Lake, Aerie, Headframe, Sump, Knot, plus the few new zone looks.
4. **Scenery kit and mood tint.**
5. **Cast and seed** (the net field, generate-and-test, the cast rules).

---

## 8. Questions for you

1. About 88 to 111 percent as many openings as today, but unevenly spread, with doors into the deep layers: is that right? (The porosity classes are the knob.)
2. **Furnace doors at 8 a side and up**: keep the six cracks (furnace stays lift-only) or two wide cracks on the axis so the furnace can have a public door?
3. **A different moon every match** (cast and plan seeded by the host), or one fixed moon per size?
4. **Reorder the cast** (Cloister first, Warren and Forge last, the middle drawn, `flooded` allowed) or keep today's fixed order?
5. **Gravity inside a hall** is the lower layer's: OK?
6. **A drawn back-wall kit per layer** (no words) and a mood tint when you drop through a floor: OK?
7. The place names (the Skin, the Cloister, the Garden, the Crystal Grove, the Frost, the Aerie, the Pit, the Sump, the Warren, the Forge) are for our planning only, since no words are drawn in a match: fine?

---

## 9. The prototype (for the builder)

Throwaway scripts in `library-2-tools/` (not a test suite; delete them freely). They read the live generator through the repo's own `loadMonolith`, so they only read the game. Run the dump from `smash-bal` (the loader reads `artifacts/V1/index.html` from the current folder): `node library-2-tools/run-low.mjs library-2-tools/dump.mjs library-2-tools/discs.json`. Run the rest with `library-2-tools` as the current folder: `plan.mjs` (the planner: `planMoon(sidesize, seed)`, the ASCII map, the descent graph), `checks.mjs` (strips, cracks, two-way openings, mirror, over 14 sizes x seeds), `wayup.mjs`, `more.mjs` and `counts.mjs` (the tables above), `render.mjs` (the pictures) and `sketches.mjs` (the landmark sketches). `plan.mjs` is the closest thing to a specification of section 2.3.
