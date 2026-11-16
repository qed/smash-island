# Moon Caves v4, revision 2: the spec

Written 2026-11-02 by the design director. **This file is complete and self-contained**: a builder can build from it without opening `v4-spec.md` (the first spec); the sections of the first spec that did not change are copied here. Where this file and `owner-decisions.md` differ, the owner's file wins. Plan only: nothing in the game was edited, committed or pushed, no browser was launched, the live relay was never touched. The only things run are throwaway paper scripts in `v4-spec-tools/` (section 6.6).

Inputs: `owner-decisions.md` (the owner's answers and the lead's readings), `v4-spec.md` (the first spec), `natural-rooms.md` + `natural-chambers.mjs` + `natural-sheet.png` (designer 3, the natural family), `curation-and-stage.md` + `v4-spec-tools/curate-*.mjs` (designer 4, the fixed set and the stage entry), `mcGen` in `artifacts/V1/index.html` (build `ii-dlc`, line 3191 at tip `a316e32`; line numbers will move).

The owner's first words (2026-11-02): "I need you to rebuild the caves of the moon, to make them less samey. ai seems to be bad at making things less samey." Their answers drive every rule below and are quoted where they do.

---

## For the owner
**What v4 is now.** The moon is solid rock with rooms carved in it, like a floor plan. Every cave from the first
down to the tunnels is a chain of rooms. Two places stay a ring (a floor you can walk all the way round): the
surface, and the furnace floor, which keeps its hot floor, lifts and cracks exactly as today. All 20 rooms you
chose are in, plus 8 small natural rooms for the lower caves (a stalagmite reef, a collapse heap, a winding tube,
a dome, an underground stream, a crystal bowl, two bays and a neck, a shelf under an overhang).

**Your words that drive it.** "the lower caves should get more 'natural' formations. they should still have
rooms, but smaller ones that are more natural." And, for which caves, "Mixed in every cave". So every cave has
both, and the natural share grows with depth: about 1 room in 5 in the first cave, about 5 in 6 in the tunnels.

**The fixed moons.** 16 per team size ("make it 16 moons. more variation."): the machine tries 1,200 plans and keeps
the 16 that differ most. I shortlist, you veto: 3 pictures (4, 10, 15 a side), you name a number, only it changes.
"Moon Caves v4" is its own stage beside Moon Caves, which is not touched. It stays hidden until you say.

**What changed from what you chose, and why.**
1. The furnace is a small ring with a crack at each pole: it holds at most 2 small rooms at 2-7 a side and next to
   nothing from 8 a side up (as today). "Most of the furnace natural" is not possible with rooms.
2. Only low rooms fit under the first cave's crust, so it is small natural rooms plus the feet of tall halls.
3. The surface also gets two open-air natural rooms (rock spires, a boulder pile).
4. The tunnels' own room is now a natural one.

**Still open (section 12).** The furnace as above or bigger; v4 ignoring the Map Size setting; only 6 cave orders at
2-6 a side; the Hot Plates never appearing from 8 a side. **Not checked:** nothing was played. V0's pictures are
where you correct my reading of "hybrid".

---

## 0. The short version

- **Why it was samey.** v3 builds one shape (a ring tube cut by a 220 px stair-hole at an exact pitch) and varies numbers inside it; nothing compares one piece to another. (Analyst: 54% of the 10-a-side galleries layer's screens have a 99% twin.)
- **What v4 is.** Solid rock with rooms. 28 kinds of room (20 built, 8 natural), 8 kinds of passage each owned by the cave kinds that suit them, a graph whose shape differs between districts. Rooms are planned like a floor plan by a pure integer planner; the plan is scored, hard rules fail a samey plan, and a picture of every moon goes to the owner.
- **The hybrid, exactly.** Rooms in every cave (built and natural mixed, natural share growing with depth); two rings kept (the surface lap and the furnace floor). Section 2.
- **The fixed set.** 16 planner seeds per size, 14 sizes, a table of 224 `[seed, plan hash]` pairs frozen under a version tag; online sends the moon number. Section 7.
- **Beside v3.** A new stage `mooncaves4` behind the switch `MC_V4`; `mooncaves` (v3) is untouched. Section 8.
- **Twelve small steps** (V0 plan only, then geometry with the natural rooms second, the CPU graph, online, the curation, the stage entry), each bootable, each checked by five standing checks. Section 9.
- **On paper** (300 seeds a size, up to 8 tries): rules on, **99 / 99 / 100 / 99%** of plans pass within 8 tries at 4 / 7 / 10 / 15 a side; rules off, **3 / 0 / 0 / 0%**. The natural share by depth comes out as the owner asked (first cave 17-18%, tunnels 86-89%). The 16 chosen moons per size are farther apart than 16 random ones (nearest pair 0.39 / 0.54 / 0.57 against 0.27 / 0.39 / 0.45 at 4 / 10 / 15). Section 6.6.

---

## 1. What changed from the first spec (r2 in one table)

| # | Change | Why (the number or the owner's word) |
|---|---|---|
| 1 | **Hybrid, read exactly**: rooms in every cave, two rings (surface lap, furnace floor). | Owner answers 1, 5, 9. Section 2. |
| 2 | **Library is 28 kinds**: the 20 built rooms (all kept) plus 8 natural ones; Hot Plates resized to 400-1,100, Span leaves the furnace. | Owner answers 2, 5, 9. The furnace's free floor beside a pole is 474 px at 2-5 a side. Section 4. |
| 3 | **Planner order**: signature, squeeze, vast room, main hall, foot halls, natural quota, built fill, stretch, natural gap filler. | Without the quota natural rooms become the filler of the top: the first cave is 28-34% natural (rules off: 53-66%) and 64-92% of plans pass within 8 tries. Section 3.3. |
| 4 | **The furnace is planned in bays** (the free floor between a pole crack and the strip, or between two cracks), not as a chain with plugs. | The first spec's paper planner ignored the cracks, which sit at the furnace's two poles. Section 3.4. |
| 5 | **New rules and components**: R9 forbidden neighbour pairs, R10 natural runs, R11 unused arc, R12 natural gradient, C10 gradient, C11 natural kinds; C1 over 28 kinds. | The natural family can collapse in ways the old rules cannot see (sensitivity table 6.6). Section 6. |
| 6 | **Kind cap per half** 2 / 3 / 4 by number of caves (was 2). | With 2 at 15 a side the planner places 32 rooms a half instead of 37 and 36% of first tries leave a cave over 30% empty (28% with the new cap). Section 6.5. |
| 7 | **Shape sequences** drawn from every sequence rule 7 allows; the furnace is always a LAP. | Designer 4: only 6 sequences existed. Now 10-16 distinct sequences in a set of 16. |
| 8 | **The fixed set**: 16 moons per size, frozen planner with a tag, set diversity rules, review pack, veto, table, pick, online. | Owner answers 8, 10. Section 7. |
| 9 | **Side-by-side stage** `mooncaves4` beside v3. | Owner answer 11. Section 8. |
| 10 | **Milestones rewritten**: natural rooms second, online before the curation, the freeze at V9. | Section 9. |

---

## 2. The hybrid: exactly what is a ring and what is a room

The owner chose **Hybrid**, then asked that "the lower caves should get more 'natural' formations. they should still have rooms, but smaller ones that are more natural", mixed "in every cave". The lead's reading, which this spec adopts and which **the owner will correct when they see V0's renders**:

> every cave is planned as rooms; built rooms and natural pockets are mixed in every cave with the natural share growing with depth; the furnace keeps its hot floor, its lifts and its cracks as in v3; the surface stays one unbroken lap.

### 2.1 In plain words

- **A room** is a space carved in solid rock, with its own floor, roof and walls, its own shape and verb. It is separated from the next room by a **plug** of rock (250 to 520 px along the cave, never under 112 px of rock between two spaces) with a **link** through it (a door, a squeeze, a ramp, a hatch...). A room is either **built** (one of the 20 of section 4.1) or **natural** (one of the 8 of section 4.2): both are rooms in this sense, both are placed by the planner, both obey the same fairness numbers. A natural room is small (384-1,152 px along), rough, and has a roof of its own; it is not a "bumpy floor".
- **A ring** is a continuous band of floor that runs all the way round the moon at one radius with no plug in it: you can walk the whole circle. v3 builds a ring in every layer; **v4 keeps exactly two**:
  1. **The surface** (the crust's top). It is one unbroken lap, the long way round and the sure route. Its "rooms" (Crater at the north pole, Flat at the south pole, Grand Stair as a mesa, Span as a rift, Chute as a sinkhole, Chimney as a tower, and the open Reef and open Breakdown as tors and a boulder pile) are open-sky features laid *along* the lap: there is no plug and no throat, and the lap is walkable through every one of them. Its openings down are its links (stair-holes, chutes, ramps), as in v3. The surface's plain stretches keep v3's hop-tops.
  2. **The furnace floor** (the shell's top). It is v3's, untouched: the same hot arcs (`M.hot`, `mcHotFloor`), the same cracks (2, or 6 from 8 a side), the same strips with their lifts, the same flare clock (`hazardT`, 70 frames in 260). What the plan decides is its **dressing**: the free floor between a pole crack and the strip, and between two cracks, is a **bay**; each bay of at least 280 px holds at most one room (section 3.4). Everything above the floor in a bay is the room's air; the floor under it is still the ring's floor, so the flare reads the same arcs. From 8 a side up the bays are 214-401 px (344 at 8 a side, 232 at 10, 236 at 15): only the Attic fits, and only at 8 a side, so the furnace is v3's.
- **Everything between the surface and the furnace** (the first cave down to the tunnels, K-1 caves) is rooms only: each cave is two chains of rooms (north quarter from the pole to the home strip, south quarter from the strip to the other pole), shaped LAP, SPLIT, BRAID or FAN (section 3.2). The old "layers" survive only as **districts**: they give each cave its kind, its gravity (low in the upper half, normal below: `mcGravAt`, unchanged) and its mood.
- **Mixed in every cave.** Built and natural rooms stand in the same chains. The natural share of a cave's walkable length grows with depth (the target, section 3.3: 15% in the first cave, 25% at 30% of the way down, 45% at 60%, 62% at 85%). The natural rooms are the owner's "smaller, more natural" rooms; the built rooms are the 20 chosen ones.
- **What the owner will see in V0's renders** and may correct: the first cave is sparse (few rooms fit under the crust); the tunnels are almost all natural; the furnace is empty or has two small rooms; the surface is a lap with a few features.

### 2.2 What stays exactly as it is (v3 numbers, frozen as `MC4_DISC`)

The disc size from the number of players (`perFighter`, `rMin`, `rMax`); the number of districts from the depth (`caveOrder`, `caveRank`, `head`, `innerMin`); the safe strips (700 px wide through every depth) with their lifts, pads and three hop-tops; the shell, the cracks (2, or 6 at `cracks6At` = 16 players), the core and both KO radii (`blast`, `kill`); the furnace's hot floor; low gravity above the half-way depth and normal below (`mcGravAt`); mirror symmetry about the 12-6 line; items on floors; no words drawn in a match. v4 reads a **frozen copy** `MC4_DISC` of these numbers, never `MC_GEN` itself (section 7.1), so a tweak of v3 by another session cannot move a v4 moon.

### 2.3 Which parts of `mcGen` (v3) are reused, and for what

| Reused from v3 | Used for |
|---|---|
| The disc header (`Rout`, `K`, `tops[]`, `layers[]` with kind and `low`, `crustBot`, `shellTop`, `shellBot`, `rKill`, the cracks, `WW`, `WH`, `cx`, `cy`) | the frame every plan sits in; the builder returns the same `g` object so `mcState`, `mcLayerOf`, `mcGravAt`, the camera, the minimap and the decoration run unchanged |
| `put(r0, r1, a0, a1, oneway, kind, L)` (an annular box), the plank (`stepT` = 14 px, one-way), `block` (solid rock) | every room's rock, floors and planks: a natural room's grid is merged into maximal rectangles and each becomes a `put` |
| `zone` / `zoneW` and the zone types bounce, ice, belt, water, updraft (`applyZone`) | a room's **bed** (its lowest continuous floor) takes the cave's footing: pads in springs, slick ice, a belt, water, a draught |
| `hill` and the `'slope'` piece (a ramp: a step-up of 24 px or less, `mcRampSnap` down, CTF's slopes) | the Wriggle's 27 degree ramps (16 px risers, 32 px treads), the Breakdown's stair, the Long Ramp, the Grand Stair, sill and slope-mouth links |
| `freeRuns(res)` (the circle less the reserved arcs) and `rowOf` | the surface's hop-tops between holes; the furnace's bays (the floor less the cracks and strips); v3's furnace stones in a bay with no room |
| `hsh` (an integer hash, `Math.imul`) | v3's per-run pick on the surface and the furnace stones; the natural recipes have their own integer hash (`natural-chambers.mjs`) |
| The strips (`SIDES`, `stripHalf`, `inStrip`), `liftPads`, `pads`, the hop-tops under the pads, `zones` | the homes, unchanged |
| The shell and cracks (`cracks`, `crackH`, `crackClear`, `hotRim`, `popRim`), `hot` = `freeRuns(...)`, `mcHotFloor`, `mcHotOn` | the furnace floor, unchanged |
| The mirror rule (the left half is the right half mirrored; chirality flips ramps, belts, ledges) | every room: a plan is made on the right half; four natural kinds (Reef, Roost, Vug, Dumbbell) and the built self-mirror rooms may straddle a pole |
| `mcSegsHash`, `mcGeoOut`/`mcNetGeo` shape, `mcState` | the geometry check on the wire (section 7.5) |

**Not reused**: the cave bands cut by stair-holes (`holes`, the steps under them), the per-kind laying in `switch(Y.kind)` (galleries' tiers, the tunnels' two tubes, the columns' rock rows) other than as a natural room's bed. `holes` stays in the object for the existing router until V1's room graph replaces it. v3's `mcGen` stays in the file, untouched, as the default and the fallback.

---

## 3. The structure

### 3.1 Four kinds of thing

| Thing | What it is | Where it comes from |
|---|---|---|
| **Room** | One place from the library of 28 (section 4): its own shape, size, roof, floor and verb | the planner |
| **Link** | A passage between two rooms, or up or down to another cave: throat, sill, slope-mouth, door, squeeze, ramp, hatch, crack, pore, stair-hole, geyser, draught, belt ramp, drain, chute | the planner, from the passages the cave's kind owns (section 5) |
| **District** | A depth band (the old layer): kind, gravity, mood | depth and the cast |
| **Home** | Each team's safe strip, 700 px wide through every depth, with lifts and pads | unchanged |

### 3.2 The planner's inputs and shapes

- **Size.** As v3: radius from the player count, number of districts from the depth. A size is keyed by `side = max(2, ceil(N / 2))`, N the number of fighters (section 7.1).
- **Cast.** Galleries first, the furnace last, the tunnels directly over it (from 3 caves), the middle drawn by seed without repeats from springs, columns, ice, updrafts, mines, flooded. Never ice next to flooded, never springs next to updrafts. (At 2-6 a side there is one middle cave: only 6 casts exist; section 12.)
- **Shapes.** Each cave is a **LAP** (a walk all the way round, both poles through), **SPLIT** (rock plugs at both poles: two half-chains, one per team), **BRAID** (a lap plus a second route over a stretch) or **FAN** (rooms hang off hub rooms with three or more links). The surface is a LAP, the first cave is never a LAP, the furnace is a LAP (it is a ring), no two neighbouring districts share a shape. **The sequence is drawn by seed from every sequence that satisfies those rules** (r2: the first spec's cycle allowed 6; 10-16 distinct sequences now turn up in a set of 16).
- **Everything is placed on the right half and mirrored**, in pixels along each quarter from its pole. A planner decision never depends on a trig result: the arc of every quarter in pixels is an integer in `MC4_DISC` (computed once, with trig, by the V0 tool, and frozen), so a different browser cannot disagree with the host.

### 3.3 The planner's steps, in order

1. **Cast and shapes** (3.2).
2. **Decide the obligations** (they are placed, not hoped for): each cave 1..K-1 its **signature** (galleries Cathedral, springs Garden, columns Geode, ice or flooded Lake, updrafts Aerie, mines Headframe; **tunnels: a natural room, one of Wriggle, Breakdown, Dumbbell, Strand**; the furnace's is the flare clock itself); the moon one **squeeze** (the Crawl, in a cave where it is at home or works) and one **vast** room (Cathedral or Chimney); the surface its two poles (Crater north, Flat south).
3. **Per cave, deepest first** (tall rooms claim the caves above, so the deep caves are placed first), per quarter, in this order:
   1. the obligations of step 2, at the strip end of the north quarter;
   2. **the main hall**: if the cave has no room of area (width x max(height, 300)) of 400,000 or more and the quarter is at least 1,800 px, one built room of a kind that can be 1,200 px wide or more, at the strip end of the south quarter;
   3. **foot halls** (the second cave only): about one tall built room (clear height 580 px or more, whose roof is in the first cave) per 2,500 px of the first cave's quarter, spread along it. This is the answer to a finding of r2: **only rooms under the first cave's head (380 px) can stand in the first cave** (Geode, Attic and the eight natural kinds); every other built room is taller and must stand in a deeper cave and reach up. Without foot halls the first cave is left a quarter empty at 10 and 15 a side (mean unused arc 25% / 28% against 17% / 21%; within-8-tries pass 96% / 95% instead of 100% / 99%, section 6.5);
   4. **the natural quota**: `n = floor(t x quarterPx / 1105 + u) - (naturals already placed in this quarter)`, with `t` the target share at this depth and `u` a hashed fraction (stochastic rounding, integers), 1,105 = the mean natural width (720) plus the mean plug (385). **Target share by depth** (percent of the way from the first cave (0) to the furnace (100), natural percent of the cave's length): `0 -> 15, 30 -> 25, 60 -> 45, 85 -> 62, 100 -> 60`. Each natural room is drawn from the kinds that suit the cave (`SUIT`, section 4.2: `+` four times as likely as `o`; the head must fit: `minHead`), not used up (rule R2), not already in the district-half, not a forbidden neighbour of what it will stand next to (R9) and not changing the 3-axis rule (R1); it takes a spread-out spot (0.2 to 0.98 of the quarter) or, if that is taken, any free slot;
   5. **the built fill**: rooms from the pole to the strip, each picked by affinity weight (`+` four times as likely as `o`), checked as it is placed against its neighbours (R1, R2, R3, R9). **In the lower half of the caves a built room must be at home there (`+`)**: the deep caves are natural by design and must not use up the library the shallow caves need (r2: without this the first cave is starved);
   6. **stretch**: a built room next to a gap grows toward its own maximum width, never past R1 or R9, so the gap is not left as empty rock.
4. **After both quarters of a cave: the gap filler**: a small natural room where a gap of 384 px or more is still empty, never past (target + 10 points) of natural share (+ 20 in the first cave, whose floor has no other filler), never a run over R10.
5. **The furnace** is placed first of all (3.4). **The surface** takes Crater, Flat, then the rest from Grand Stair, Span (a rift), Chimney (a tower), Chute (a sinkhole), the open Reef and the open Breakdown.
6. **Links**: a lateral link between neighbouring rooms, and ways up so that no stretch of a cave is 2,400 px or more without one (a plan with a stretch of 3,000 px or more is rejected). Each link's type comes from the passages that cave's kind owns (section 5); for natural rooms the lateral links are throat, sill, slope-mouth (section 4.3).
7. **Score and retry** (section 6.2): seed + t for t = 0..7; if all 8 fail (never, on paper) a match with no table moon builds v3's and logs the seed. A table moon is one accepted seed and never falls back.
8. **Build** (`mcBuild`): rooms are subtracted from the rock mass (sweep by angle, one box per rock span), planks, ramps and zones added, the left half is the right half mirrored. The builder converts a room's grid at the room's **bed radius** (a cell column is 16 / bedRadius radians; heights are radial and exact), so everything above the bed is a little wider than drawn, by at most (1 + height / radius): 44% at the furnace's 360 px head. That only widens space; the 112 px roof clearances are radial and exact.

### 3.4 The furnace, in bays

Cracks sit at the furnace's **poles** (12 and 6 o'clock, 260 px wide) and, from 8 a side, at the four corners (45 and 135 degrees). A bay is the free floor of one quarter: from `crackHalf` = 150 px (the crack's half width 130 plus the cool rim 20) from the pole to the strip, less each corner crack's zone (150 px either side). Measured: **474 px at 2 to 5 a side, 479 at 7, 830 at 6, 344 at 8, 232 at 10, 236 at 15** (214-401 at 9, 11, 12, 13, 14). A bay of 280 px or more holds at most one room; the Hot Plates takes the first bay of the north quarter if it fits (400 px or more), the other bays take one room each from the furnace menu that fits (Hot Plates, Attic, Vug, Shelter at 474 px; the whole natural family at 830 px). With no room the bay is v3's floor with v3's stones. The furnace menu is therefore small, and **the furnace is the one district whose moons differ least** (mean room distance between two moons 0.23-0.27, against 0.7 for the caves); it cannot be otherwise.

### 3.5 The route graph (CPUs)

v3's router knows holes between bands. v4 has a **room graph**: rooms and homes are nodes, links are edges, each with angle, height, width, a down-only flag and its climbing steps if it has any. At build time the planner computes a **next-hop table** (room to room) once. `mcLayer` becomes "which room are the feet in" (a rectangle test in angle and radius); `mcRoute` and `mcPathCost` read the table; `mcRouteSteer` climbs a link's steps exactly as it climbs a hole's. The 4-second give-up, `mcCrowd` and the CPU's eyes are unchanged. A down-only link (chute, pore) is left out of every "up" route. A natural room needs nothing new: its steps are ledges of 16-64 px (inside the CPU's 130 px ledge reach), its ramps are walked (`brainWalk`), its drops are `mcDropOk` falls.

### 3.6 Online

The host sends **the moon number**, not the plan and not the pieces (section 7.5). The guest rebuilds the plan from its own frozen table, checks the plan hash and the piece hash, and leaves the room with a message on any mismatch.

### 3.7 What "size buys new places" means

At 4 a side a half holds about 16 rooms of 14 different kinds; at 15 a side about 37 of 20 (paper, section 6.6). Bigger moons add districts and arc, and every kind that fits (width at most 1.75 times its floor radius, roof under the crust or claimed upward) is available. 2 to 5 a side build the same disc, and the seed picks their cast, shapes and rooms.

### 3.8 A real paper plan (4 a side, moon 4-01, try 1, score 100.0)

Rooms from the pole to the strip, width in px; `^` a hall's upper part standing in a deeper cave, `*` a natural room. From `v4-spec-tools/curate-r2.mjs` (seed 40028 on the r2 planner; `curate-sheet-r2-4.png` draws it).

```
0 surface   Crater(2475) + GrandStair(1589)                       | Flat(2055) + Reef*(766, open) + Chimney(163) + Breakdown*(514, open)
1 galleries Span^(739) + Chimney^(169) + Roost*(893)              | Cathedral^(2076) + Geode(1205)
2 columns   Span(739) + Chimney(169) + Crawl(1059)                | Cathedral(2076) + Attic(383)        <- the halls' floors
3 tunnels   Breakdown*(678)                                       | Attic(420)
4 furnace   Hot Plates(449) in the north bay                      | Shelter*(466) in the south bay
```

---

## 4. The library: 28 rooms

**20 built rooms** (all kept: owner answer 2; the five least different, Racetrack, Grand Stair, Geode, Barricade and Warren, are the first to cut if one proves weak) **and 8 natural rooms** (owner answers 5 and 9). Merged away in the first spec: Well into Chimney, Rift into Span, Crown into Crater, Cauldron into Hot Plates, Knot into Racetrack, Sump into Lake; dropped: Stump Hall. "Cost" is what a room asks of the builder: **small** is boxes and planks the generator already makes; **medium** needs a flag, a zone or a stash spot; **large** crosses districts.

### 4.1 The 20 built rooms

| # | Room | In two sentences | Size (px, along by up) | Kinds ("natural" = at home) | Cost |
|---|---|---|---|---|---|
| 1 | **Crawl** | A low tunnel with a roof barely above a fighter's head, opening into a few small standing bays. You cannot jump in it, so every fight is flat and head-on, and a shot cannot be hopped. | 900-3,000 by 110-120 (bays 315 high, at most 700 apart) | tunnels, mines at home; columns, ice, flooded | small |
| 2 | **Chimney** | A shaft one body wide with small ledges alternating up its sides and walls to kick off. Whoever is above hits down on the climber; a fall costs a long walk back, not a stock. | 150-190 by 700-1,300 (through up to 3 districts) | updrafts, mines; galleries, columns, tunnels, springs, surface (a tower) | medium |
| 3 | **Chute** | A thin one-way shaft cut down through a floor into a belly room far below, no steps, no way back up. You dive in to escape or ambush; whoever waited below hits first. | shaft 120-160, 500-900 deep, belly 400-800 | mines; galleries, columns, tunnels, ice, flooded, surface (a sinkhole) | medium |
| 4 | **Cathedral** | One huge hall at least 760 px high with a ring of floating islands and a high pulpit. Fights happen in three layers of air; the big arena for 15 v 15. | 1,600-2,800 by 760-1,400 | galleries, updrafts; springs, ice, flooded, columns, mines | large |
| 5 | **Span** | A single plank across a gap with a drop on both sides and a catwalk hanging under the middle. You fight on a line you cannot sidestep. | 700-1,400 across, 330-900 deep | galleries, columns, mines; ice, flooded, surface (a rift). **r2: not in the furnace** | small |
| 6 | **Teeth** | A hall whose roof is a comb of rock teeth with a few short rocks on the floor. Every jump is a gamble; fights break into slot-sized duels. | 1,200-2,400 by 480-560 | columns, ice; galleries, flooded, furnace, mines | small |
| 7 | **Long Ramp** | A sloped road in a tube, climbing 300 to 700 px, walked with no jumping. The high ground is real. | 1,800-3,200, headroom 240-300 | tunnels, ice, mines; galleries, columns, flooded | medium |
| 8 | **Attic** | A tiny sealed pocket above a corridor with one hatch and a prize that refills on a timer, not while someone is in it. One door someone can hold: bait. | 280-420 by 180-250, hatch 120 | columns, tunnels, furnace; galleries, mines, flooded | medium |
| 9 | **Racetrack** | A ring of corridor round a solid block: two roads joined by short ladders, a gap in the block to drop through. You can always run round to flank. | 1,200-1,800 by 600-700 | tunnels, mines; columns, galleries | small |
| 10 | **Grand Stair** | A staircase of uneven steps (36-108 px) climbing to a flat plateau in an open hall; a king of the hill with a drop on the stair side (a mesa on the surface). | 1,500-2,400 by 650-900, rise 300-450 | galleries, flooded, surface; columns, tunnels | small |
| 11 | **Sinkhole** | A pit in a corridor floor with a narrow neck widening below and a hidden side tunnel halfway down. Falling in is a trap; dropping in on purpose lets you come out behind the guard of the lip. | 1,100-1,400 by 400-700 | mines, flooded; galleries, columns, ice | medium |
| 12 | **Warren** | Six small cells in two storeys joined by doors and floor hatches, every cell with two ways in. A crowd splits into pods of two or three. | 1,100-1,600 by 650-900 | tunnels, mines; columns, flooded | medium |
| 13 | **Barricade** | A wide hall split by one thick wall with three ways past: a low door, a window slit reached from firing steps, a ridge along the top. The first room that sets one team against the other. | 1,800-2,400 by 520-640, wall 180+ | columns, mines, flooded; galleries, springs, ice, updrafts | small |
| 14 | **Crater** | A bowl dug into the surface, about 240 px deep, terraces round the rim, a small peak in the middle, open to the sky. The rim kills, the bowl is safe. | 1,800-2,800 wide | surface only (north pole) | medium |
| 15 | **Hot Plates** | Part of the furnace floor made of hot plates with cool stones between, flaring in a wave that runs round at about running speed. You read the clock under your feet. **r2: sized to its bay.** | **400-1,100** by 450-600 | furnace only (a bay of 400+ px: 2 to 7 and 14 a side) | medium |
| 16 | **Garden** | A bed of bounce pads on the floor and on ledges, the highest under a hole in the roof. Bouncing is how you travel; nobody gets hurt; the rest after a hall. | 1,100-1,500 by 380-420 | springs only | medium |
| 17 | **Geode** | A closed crystal room with two squeeze doors, two pillars, a small healing pool and a cache that refills every 25 seconds. Never a dead end, so the prize is worth fighting for. | 1,200-1,400 by 330-350 | columns; galleries, mines | medium |
| 18 | **Lake** | A sheet of slippery ice, or of water that drags everyone, with an island, two shelves and one thin patch or drain that drops you a level. | 1,200-1,400 by 260-280 | ice, flooded only | medium |
| 19 | **Aerie** | A tall hall where three columns of rising air lift you from floor to roof, two stepping isles and a high perch holding an item. A fight in the air. | 900-1,100 by 700-800 | updrafts only | medium |
| 20 | **Headframe** | A hall with three tiers of conveyor belts, each running opposite to the one below, up to a bridge. The way up is a treadmill staircase you can fight up, because belts push a third as fast as running. | 800-1,000 by 520-600 | mines only | medium |

**Locked invariants** (changing one needs the director and the owner): the Crawl's roof 110-120 px (the tallest fighter is 96 px); the Chimney at most 190 wide; steps and ledges at most 110 px and walls on a floor at most 160 px (so the weakest jumper still clears them in normal gravity); every rock wall between two spaces at least 100 px (a launch of about 28 px a frame cannot step over one); doors at least 108 high and 120 wide, hatches at least 120 wide (the largest fighter is 96 px); the Teeth's tips at least 160 px over the floor with 60 px of air between a floor rock and a tooth; the Barricade's wall at least 180 thick (a swing is not stopped by rock in the engine, so thin walls are not cover); the Hot Plates' wave offset a quarter period; no room is a dead end except the Attic. **Pairs that must not be neighbours** are rule R9 (section 6.1). **Ranked by how different they are to walk**: Crawl, Chute, Chimney, Hot Plates, Cathedral, Span, Long Ramp, Crater, Aerie, Lake, Garden, Headframe, Attic, Teeth, Warren, Sinkhole, Geode, Barricade, Grand Stair, Racetrack.

### 4.2 The 8 natural rooms (ids 21-28)

Smaller and rougher than the built ones: widths **384-1,152 px**, every number a multiple of 16 px, every shape rebuilt from an **integer seed** by a few lines with no float, no trig and no `Math.random` (`natural-chambers.mjs`: `hash(seed, key)` is a `Math.imul` mix; a recipe draws numbers in the order it is written, so the planner (to size a room) and the builder (to cut it) get the same numbers in any browser). The seed is all the plan stores for the roughness. **`natural-chambers.mjs` is the source of the recipes and is copied byte for byte into the monolith as `MC4_NAT`**; a change to a recipe is a new planner tag (section 7.3). Picture of all eight at three seeds: `natural-sheet.png`.

| # | Kind | Verb | The shape in one line | Along x up (px) | At home (`+`) / works (`o`) in | Never in |
|---|---|---|---|---|---|---|
| 21 | **Reef** | perch | two or three stacked stalagmites, caps one body wide, on a valley floor, a rough roof with fangs | 640-1,152 x 304-336 | `+` springs, columns, ice, flooded, furnace; `o` galleries, updrafts, mines, tunnels; open variant on the surface (tors) | next to Teeth |
| 22 | **Breakdown** | scramble | a collapse heap jammed against the roof: stairs up, a 112 px squeeze over the crest, two 64 px bites down | 512-736 x up to 336 | `+` mines, tunnels, furnace; `o` galleries, columns, ice, flooded; open variant on the surface (a boulder pile) | springs, updrafts (a pad or draught pins you in the crest) |
| 23 | **Wriggle** | wind | a 144-160 px tube that waves up and down on 27 degree ramps, roof following the floor four columns late, pinching at every rise | 384-896 x 176-256 | `+` mines, tunnels; `o` columns, flooded | galleries, springs, updrafts, ice, furnace, surface |
| 24 | **Roost** | arch | a dome: 128 px of roof at the rims, 256-384 over the middle, one bat plank 96 px up, two low mounds | 576-896 x 256-384 | `+` galleries, ice, flooded; `o` springs, columns, updrafts, mines, tunnels, furnace | the surface |
| 25 | **Strand** | bank | an underground stream: a high bank 80 px up, three flowstone terraces down, a wet bed with sandbars, a lower far bank (net fall 48 px) | 672-992 x 240-256 | `+` springs, ice, mines, flooded, tunnels, furnace; `o` galleries, columns, updrafts | the surface |
| 26 | **Vug** | ring | a faceted tent roof over a crystal bowl 96 px below the rim, a ladder of 64 px-spaced shelves on the walls | 432-592 x 304-416 (needs a head of 320+) | `+` columns; `o` galleries, springs, ice, updrafts, mines, flooded, tunnels, furnace (not offered in ice, mines, flooded: head too low) | the surface |
| 27 | **Dumbbell** | choke | two domed bays of different sizes joined by a 128 px neck with a 16 px sill | 576-992 x 256-320 | `+` mines, tunnels; `o` galleries, columns, ice, flooded, furnace | springs, updrafts (a neck pins you), the surface |
| 28 | **Shelter** | overlook | a low shelf under an overhang, a 48-64 px drop off its lip, a taller hall whose roof is 96-112 px higher | 448-800 x 288-336 (needs a head of 288+) | `+` galleries, springs, furnace; `o` columns, updrafts, tunnels (not in ice, mines, flooded) | the surface |

**The frame every recipe shares.** Cells are 16 x 16 px; two rows of rock above and below; ports `A` (left) and `B` (right) in the air cell above the end floors, **128 px high**. `tidy` is the one clean-up every recipe goes through: any pit narrower than 4 cells with higher floor on both sides is filled to its lower side and any 1-cell run is merged (a 48 px body wedges in a notch). Options the planner passes: `hc` (the cave's head in cells: ice, mines 16; flooded 17; columns 21; furnace 22; galleries 23; springs 25; updrafts, tunnels 26 - **no natural room's air ever reaches higher than `hc` cells over its lowest floor, so a natural room never claims the cave above**), `bedChar` (the footing on the bed), `flip` (mirrored left to right: what the 12-6 mirror does to a room, and how the planner cancels floor drift), `sym` (its own mirror image: **only Reef, Roost, Vug and Dumbbell**, so they may take a pole slot), `open` (no roof: the two surface variants).

**The bed.** Each room has a **bed**, its lowest continuous floor (never a perch, mound, boulder, sandbar, sill or stair). **The bed takes the cave's footing**: ice slick, a belt, pads, water, a draught, the flare clock, or plain. That is how one recipe is a different place in different caves. In the furnace the beds burn on the flare and every perch, bar, boulder and stair is cool, because only the shell's top flares (`mcHotFloor` tests the feet on the shell's top).

**Fairness numbers the natural rooms hold themselves to** (tighter than the locked ones; `validate()` reported 0 violations in 300 seeds of each kind, under every head cap, in 200 seeds of each symmetric build):

| Locked | A natural room's own number |
|---|---|
| step or ledge at most 110 px | a **required** step at most **64 px** (one jump for the weakest jumper in both gravities); an optional perch (the Roost's plank) at most 96 px |
| wall on a floor at most 160 px | **no wall at all**; the biggest single step is 64 px |
| rock between two spaces at least 100 px | at least **112 px**; a fang or spire inside one space may be 64 px |
| doors at least 108 high, 120 wide | ports 128 px high |
| roof over a walked floor at least 110 px | at least **112 px over every floor cell** (the Breakdown's crest and the Dumbbell's neck are exactly 112-128: cut them as drawn, rounding the wrong way fails the tallest body) |
| walkable tread | every standable step at least **32 px** wide |

**Flight check on paper** (library-1's checker with one patch for 16 px cells: a 48 px body, the game's jump 12.5 and gravities 0.62 and 0.434, run 6.4, stat 1 and the weakest jumper 0.85): every run passed: A and B linked with walk, one jump and drop only, no island, no trap, no second jump needed (all eight kinds, head caps 16, 17, 21, 22, symmetric builds, open variants). Seven mistakes were found by drawing and by the check and fixed (natural-rooms.md 4.3). **Not flown**: the footings on a bed (V2 does it), the cracks and pores, the tall Vug (not in the library), the Vug and Shelter at exactly 20 and 18 cells of head.

### 4.3 Links between natural and other rooms

A natural room is never fused to a neighbour: the plug and its 112 px of rock always stand between. The planner keeps a running **floor level** along a chain (each natural room has end floors `eL` and `eR` in cells: Reef, Breakdown, Roost, Vug, Dumbbell 0; Strand falls 3 cells; Shelter 3-4; Wriggle from -1 to +6); a new room is placed with its local zero at `level - eL`; the offset from the cave's nominal floor stays within 12 cells (192 px), and between neighbours within 8 cells (128 px): a larger one means the other `flip` or another kind.

| Link | Used when | Geometry | CPU |
|---|---|---|---|
| **Throat** | two rooms on one level | a tube through the plug at least 128 px high, floor flat, roof allowed to wander in 16 px runs; tapers to the lower port (a Crawl's 112-120) but never under 112 | walk |
| **Sill** | floors differ by 1-4 cells | a throat with one step of that size, 96 px of flat each side | a ledge step |
| **Slope-mouth** | floors differ by 5-8 cells | a ramp through the plug, 16 px risers, 32 px treads, roof 128 px over it; the plug is lengthened to at least 32 x delta + 192 px | walk (ramp snap) |
| **Crack** | a way up between caves | a hatch: opening at least 128 px wide, a plank at most 80 px under it, lips cut by `chunky` | up: the plank |
| **Pore** | a way down, one way | a hole 128-176 px wide landing on a floor, never over a crack in the shell | down only: left out of every "up" route |

Cracks and pores open only where a room has 6 to 10 cells of flat floor (the Reef's valleys, the Roost's floor between the mounds, the Strand's bank top, the Dumbbell's bays, the Shelter's hall), never over a bump, a bar or a stair, and **never in the furnace**. In a cave a crack or pore is built as that kind's own passage (springs a geyser, updrafts a draught, mines a chute or belt ramp, ice a ramp, flooded a drain). Throat, sill and slope-mouth count as door, squeeze and ramp for rule R5.

---

## 5. Identity for each kind

Each kind gets one **verb** nothing else has, a **footing** that changes what you can walk (not just the floor's effect), **passages it owns** (which is how the stairs stop being everywhere), signature and natural rooms, and a look. Place names are for planning only: no words are drawn in a match. Gravity stays by depth, so a kind may land in either half; rooms are built to the normal-gravity numbers (steps at most 110, walls at most 160, natural steps at most 64), so they work in both.

| Kind | Verb | What changes underfoot | Passages it owns | Signature; rooms at home | Look (back wall, mood) |
|---|---|---|---|---|---|
| **galleries** | hold the high deck | balconies on two or three decks; shots come from above | arches, balconies, stair-holes, ramps | Cathedral (its roof is here); Span, Grand Stair; natural Roost, Shelter | warm slate, marble planks, banners, light shafts |
| **springs** | bounce | pads throw you; **no stairs at all**: up is a bounce chain or a hatch | geyser (a pad under a hole), hatches, gaps | Garden; natural Reef, Strand, Shelter; Chimney and Cathedral work | purple, giant mushrooms, cyan spores |
| **columns** | take cover | rock blocks shots; doors are squeezes at most 200 high | squeezes, hatches, ramps, stair-holes | Geode; Span, Teeth, Attic, Barricade; natural Reef, Vug | deep teal crystals, prism light, glints |
| **ice** | slide | slick floor except islands and shelves; **ramps only, no stairs** | ramps (a luge), hatches, squeezes | Lake (ice); Teeth, Long Ramp; natural Reef, Roost, Strand. Never Chimney, Attic, Racetrack, Grand Stair | pale blue, frozen falls, icicles, snow |
| **updrafts** | ride | air columns lift you; the tallest district; **draughts only** | draughts, hatches, gaps | Aerie; Chimney as an elevator, Cathedral | night blue, far floating isles, cloud wisps |
| **mines** | ride the belt | belts push a third of run speed; stairs become **belt ramps** | belt ramps (escalators), hatches, chutes | Headframe; Crawl, Chute, Racetrack, Warren, Barricade; natural Breakdown, Wriggle, Strand, Dumbbell | timber, rails, carts, hanging lamps |
| **flooded** | wade | water drags 13% a frame: knockback bleeds, jumps shorten, fights slow | drains, siphons, hatches, ramps | Lake (water); Grand Stair, Sinkhole, Barricade (a dam); natural Reef, Roost, Strand. Can finally appear | green-black, half-sunk arches, drips |
| **tunnels** | take the low road | the tightest district: roofs 105 to 250 px, flat shots; always directly over the furnace; no holes down | doors, squeezes, ramps | **a natural room (Wriggle, Breakdown, Dumbbell or Strand)**; Racetrack, Warren, Crawl, Long Ramp, Attic stay at home | burrow mouths, roots, a stronger gloom |
| **furnace** | stay off the floor | the floor flares in a wave; the smallest ring, nearly all in view; the cracks and lifts as in v3 | the two lifts and the cracks only | Hot Plates (the clock itself is the signature); Attic as the one cool refuge; natural Vug, Shelter (and the rest at 6 a side) | slag, pipes, embers, heat shimmer |
| **surface** | launch | open lap; the only place with space KOs; low gravity | ramps, bridges, the lifts, stair-holes, chutes | Crater (north pole), Flat (south pole); Grand Stair as a mesa, Span as a rift, Chute as a sinkhole, Chimney as a tower; open Reef (tors), open Breakdown (a boulder pile) | regolith, boulder fields, a lander wreck, rover tracks |

**The owner's choices that are rules** (2026-11-02): *Medium wild*: a tall hall gets a one-way bridge at the old floor line so the cave above stays walkable, and some caves are SPLIT (the teams cannot meet in them but can on the surface and in a LAP cave). *The three risky rooms are all kept with their guards*: the Attic's prize refills only when the pocket is empty, the Barricade's wall is at least 180 px, the Crawl only in the quiet districts (and at most one low tube, Crawl or Wriggle, per district). *Each kind owns its passages* (the column above; **stairs only in galleries, columns and the surface**). *Scenery*: "A drawn back wall per kind plus a colour fade when you drop through a floor": a back-wall kit per kind (props fixed at build time from a hash, culled in view, no collision) and a mood tint eased over about 150 px as the camera crosses into a district. No words are drawn.

---

## 6. Anti-sameness

### 6.1 The rules (the planner enforces each as it places; the score checks them again)

| # | Rule |
|---|---|
| **R1** | **Neighbours differ on at least 3 of 6 axes** (orientation: horizontal H, vertical V, diagonal D, ring R, pit P, small S, bowl B, **winding W, ledged L** (the last two are the natural family's); openness: sealed, closed, sky; height class by the median clear height: low under 150, mid 150-450, tall 450-750, vast 750+; width class: under 700, 1,400, 2,200, more; verb; footing). Rooms touching across a wall differ on at least 2. **Two natural neighbours also differ in width by a ratio of at least 1.25** (a natural room is 384-1,152 px, so 8% is too loose). |
| **R2** | No kind next to itself; **at most once in a district-half; at most `CAP` times in a moon-half, CAP = 2 up to 4 caves, 3 for 5-7 caves, 4 for 8 caves** (r2: was 2); a pole room and its mirror count once. |
| **R3** | No twin widths: two rooms of one kind in a district differ by at least 8%. |
| **R4** | **Obligations first, filler second** (section 3.3): signature, squeeze, vast room, the surface's poles; then the hall, the foot halls, the natural quota; the built fill takes what is left. The planner never "hopes" the variety turns up. |
| **R5** | Each kind owns its passages (section 5). No passage type is more than 35% of a moon's links; at least 5 types per moon. |
| **R6** | All four height classes in a moon (three below 7 a side) and room widths spanning 8:1, heights 6:1. |
| **R7** | Graph shapes: the surface and the furnace are LAPs, the first cave is not, neighbouring districts differ; drawn by seed from all sequences that satisfy that. |
| **R8** | The cast (section 3.2). |
| **R9** | **No forbidden neighbour pair** (r2: 22 pairs): Long Ramp-Grand Stair, Chimney-Chute, Attic-Warren, Teeth-Geode, Racetrack-Warren (built); Reef-Teeth, Wriggle-Crawl, Wriggle-Racetrack, Roost-Cathedral, Roost-Geode, Breakdown-Grand Stair, Breakdown-Long Ramp, Strand-Lake, Strand-Sinkhole, Vug-Chimney, Vug-Aerie, Dumbbell-Attic, Dumbbell-Warren, Shelter-Barricade (natural next to built); Wriggle-Dumbbell, Roost-Vug, Breakdown-Shelter (natural next to natural). Each is a pair that differs on only two axes or reads alike. |
| **R10** | **A run of natural rooms is at most 2 in a chain, 3 in the tunnels (the cave over the furnace)**: a cave never turns into a row of small bumps. (Measured: runs of 1 and 2 are the norm, a run of 3 is rare. The designer proposed 1 in the first two caves; 2 costs nothing measurable and the first cave has no other filler.) |
| **R11** | **Unused arc**: the rock between a room and its neighbour or the strip beyond the plug (520 px between rooms, 380 px at a strip) is at most **30%** of any cave's half, caves 1 to K-1 (the surface is the lap, the furnace has bays). The first spec said 20% and never measured it; the paper planner's median worst cave is 14-25%, so 20% would re-draw 26 / 43 / 48 / 67% of first tries (4 / 7 / 10 / 15 a side) and 30% re-draws 7 / 16 / 20 / 28%. **V0 measures the real planner and the director re-sets the line to the 75th percentile of what the real planner makes, never under 20%.** |
| **R12** | **The natural gradient** (the owner: "Mixed in every cave", the share grows with depth): the first cave is at most **35%** natural by length and the cave over the furnace (the tunnels) at least **40%** (K at least 4). Rules off, the first cave is 53-66% natural; with natural rooms as plain filler it is 28-34%. |
| **R13** | **Fairness is not tunable** (the locked invariants of 4.1, the natural numbers of 4.2): strips, cracks and bays kept clear, every room reachable from both homes, no stretch of 3,000 px without a way up, every down-only link has another way back. **No loosening**: variety is added by adding or changing rooms, never by widening a number range inside one room; no builder may change a threshold, only the director and the owner. |
| **R14** | **Squeezes are rationed** (not exercised on paper; V0 implements and V8a measures): at most one neck-type room (Crawl, Wriggle, Dumbbell, Breakdown) per cave-half and at most one low tube (Crawl or Wriggle) per cave, only in the quiet caves; never the only way along a SPLIT or FAN cave; a district-half with three or more natural rooms has one under 600 px wide and one 800 px or more; the Vug is dropped from the draw where a side is 12 fighters or more unless it is the cave's only natural room. |

### 6.2 The plan score (computed from the plan, in the generator)

Computed on one half (the other is its mirror): rooms with their six axes, links with their types, district shapes. **Eleven components**, each clipped to 0-1:

| | Component | Formula | Target |
|---|---|---|---|
| C1 | Spread of kinds | distinct room kinds / min(28, rooms) | 0.80 (was 0.8 of 20) |
| C2 | Neighbour distance | mean differing axes (of 6) over neighbouring pairs / 6 | 0.67 |
| C3 | Scale spread | min(ln(widest/narrowest) / ln 8, ln(tallest/lowest) / ln 6) | 1 |
| C4 | Irregular lengths | mean over caves 1..K-1 with 3 rooms or more of (spread of widths / mean width) | 0.45 |
| C5 | Passage variety | entropy of the link types / ln 8 | 0.75 |
| C6 | Verb spread | distinct verbs / min(14, rooms) | 0.85 |
| C7 | Shape variety | distinct district shapes / min(4, caves) | 1 |
| C8 | At home and a hall | share of caves with a room at home in them (an affinity `+` room, built or natural; the furnace has its clock) **and** a main hall (the biggest by width x max(height, 300) at least 1.5 times the median of the others, counting halls whose roof is there; two rooms or fewer pass) | 1 |
| C9 | Height classes | classes present / 4 | 1 |
| **C10** | **Natural gradient** | (tunnels' natural share - first cave's) / 0.30 | 1 |
| **C11** | **Natural kinds met** | distinct natural kinds / min(8, natural rooms) / 0.75 | 1 |

**Score** = 100 x the mean of C1..C11. **A plan passes only if the score is at least 85 and no hard rule fails**: R1 (and the width ratio), R2, R3, R5 (35%), R6, R7, R9, R10, R11, R12, and every component at least 0.5 (C8 at least 0.6). **The minimum is 85 plus every hard rule; a score alone is not enough** (6.6: rules off still scores 82-87).

### 6.3 The screen check (computed on the real geometry, offline)

The plan score proves the *mix*; this proves what a player *sees*. The analyst's measure, redone on the shape of the open air (the whole silhouette is dominated by rock slabs and hides differences). A screen is the game's 1528 x 1024 px view (48 x 32 cells of 32 px) standing on a floor, taken every 128 px along every walkable route outside the strips. **J\*** = overlap over union of the **air cells** of two screens, best over a sideways slide of up to 192 px, against any other screen of the same district at least one screen width away. **Pass** per district: mean best match **at most 65%** and **at most 5% of screens** with a twin at 0.95 or better; per moon: **at least 18%** of screens distinct (leader clustering at 0.75) and **at most 30%** with a twin at 0.95 or better across the whole moon. Tools: `why-samey-tools/` and `v4-spec-tools/screens-calibrate.mjs`; it runs at milestone checks, not in the game.

On paper, with the natural rooms laid in the strips (designer 3, 10 a side, 5 seeds, quick): within a district best match 53-54%, 0% twins, 29% distinct; **pooled twins over all caves fall from 24% (library only) to 5-7% (natural rooms in)**; library with the rules off: 31% twins within a district and 51% pooled. **The lines are provisional**: they were measured on stand-ins; V1 re-measures them on the real geometry and **sets each line at twice the reference reading, never above the line given here**. If the reference fails, the director revises the measure, not the generator.

### 6.4 The render of every generated moon

- **Per moon**: a PNG with (a) the disc from above, rooms coloured by kind (natural rooms with a white cap) and numbered, strips tinted, cracks red; (b) the right half unrolled flat, rooms outlined, links marked by type, halls drawn through the districts they span, the furnace's bays; (c) a card: size, seed, try, score, C1 to C11, any hard rule that failed. Drawn by a small software rasteriser in plain node (`why-samey-tools/lib.mjs`), never a browser.
- **Every moon a check run generates is rendered** into a contact sheet in `reports/moon-caves-v4/renders/` (at least 30 plans per milestone: one at every size 2 to 15 and 4 seeds at 4, 10 and 15). Any moon can be re-rendered later from its id (version tag, size, number or seed). In a dev build `mcPlanDump()` prints the plan and score. The paper version of the sheets exists: `curate-sheet-r2.mjs` writes `curate-sheet-r2-4.png`, `-10.png`, `-15.png` (16 moons each).

### 6.5 How each threshold was calibrated (and the changes r2 made to make the numbers hold)

The lead's brief: "if the numbers do not hold, change the rules or the library in r2 until they do and say what you changed". These are the things I changed, each with the number that made me do it (all in 6.6):

| # | Change | The number that forced it |
|---|---|---|
| 1 | Hot Plates 900-2,600 -> 400-1,100; Span leaves the furnace; the furnace planned in bays | the furnace's free floor is 474 px (2-5, 7 a side), 830 (6), 344 (8), 214-236 (9, 10, 12, 15): a 900 px room cannot stand there |
| 2 | Natural rooms placed as a **quota after the obligations**, not as filler | no quota: first cave 28-34% natural (target 15), within-8-tries pass 64 / 70 / 83 / 92% |
| 3 | The tunnels' signature is a natural room | **a small effect on paper**: first-try pass 34 / 40 / 46 / 43% with Racetrack or Warren as the signature against 45 / 43 / 47 / 48%; the tunnels are 81-87% natural either way (the quota and the filler do it). Kept because the owner wants the lower caves' own room to be a rough one |
| 4 | **Foot halls** (tall rooms in the second cave reaching up) | only Geode and Attic of the built library fit under the first cave's 380 px head; without foot halls the first cave's mean unused arc is 25% / 28% at 10 / 15 a side (17% / 21% with them), 37% / 48% of first tries leave a cave over the 30% line (20% / 28%), and within-8 pass falls to 96% / 95% |
| 5 | Built rooms in the lower half of the caves must be at home there | **it moves the natural share toward its target, not the first cave**: without it the lower caves are 32-40% natural at 10 and 15 a side where they are 39-45% with it (targets 45-53), and first-try pass at 7 a side is 33% against 43% |
| 6 | CAP per half 2 -> 2 / 3 / 4 by caves | with 2 at 15 a side the planner places 32 rooms a half instead of 37, and 36% of first tries leave a cave over the 30% line (28% with the new cap); within-8 pass 98% against 99% |
| 7 | A pre-placed room is checked against its future neighbours (R1, R9) | without it within-8 pass at 15 a side is 85% and first-try pass 23% (48% with it) |
| 8 | New rules and components R9-R12, C10, C11; C1 over 28 kinds at 0.80 | the natural family cut to one kind still passes 96% of plans at 4 a side (44% / 7% / 0% at 7 / 10 / 15: C11 and R12 catch it from 7 a side); the old C1 saturated at 1 |
| 9 | First cave: natural run limit 1 -> 2, gap filler margin +20 points | **no measurable effect** (first-try pass 42 / 40 / 44 / 44% with 1 against 45 / 43 / 47 / 48%; margin +10 gives the same shares): kept at no cost |
| 10 | Set level: the vocabulary cap (no kind in more than 12 of 16 moons) dropped as a hard rule; replaced by "every moon omits at least 4 kinds the set has" and a report; set-score targets re-set; 1,200 candidates a size | a cap of 12 stops the selection at 12-13 moons: at 15 a side a moon holds 20 of 28 kinds, so the average kind is in 11.4 of 16 moons; the old targets saturated |

**How each new or changed threshold was calibrated** (paper means over 300 seeds, first tries; "on" = rules on, "off" = rules off):

| Threshold | Value | Calibrated how |
|---|---|---|
| C1 target | 0.80 of min(28, rooms) | on: mean C1 0.98 / 0.93 / 0.83 / 0.89 at 4 / 7 / 10 / 15 a side; off: 0.86 / 0.76 / 0.73 / 0.84. At 0.75 it saturated at 1; the 0.5 floor never binds |
| C10 gap | 0.30 | on: C10 0.84 / 0.86 / 0.90 / 0.93; off: 0.49 / 0.35 / 0.37 / 0.39; no quota 0.40. 0.30 is the middle of the designer's targets (tunnels 48-66% minus the first cave's 15% = 0.33-0.51) |
| C11 target | 0.75 of min(8, natural rooms) | on: 0.98 / 0.95 / 0.95 / 0.99; off 0.89-0.98 (a random draw is already varied); its job is the collapse to one kind, which it fails from 7 a side up (table below) |
| R12 | first cave at most 35% natural, tunnels at least 40% | on: first cave 17-18% (the line is twice the proposal), tunnels 86-89%; off: first cave 53-66%; no quota 28-34%. R12 fails 7-20% of first tries |
| R1 natural ratio | 1.25 | the designer's number (a natural room is 384-1,152 px, 8% is too loose); rules off fail it in 194 / 239 / 268 / 285 of 300 first tries |
| R11 | 30% | the median worst cave is 14 / 17 / 20 / 25% on; the line re-draws 7 / 16 / 20 / 28% of first tries and removes the tail (98th percentile 43-51%); rules off leave 4-6% (they fill everything), so R11 does not separate on from off: it guards against empty rock only |
| The gate | 85 | unchanged: on p10 is 88.1 / 89.1 / 90.4 / 93.4; off median 83.5 / 82.5 / 84.5 / 87.2 |
| Set score targets | 0.55 / 0.70 / 26 kinds | 16 random plans score 66.7 / 79.7 / 87.2, the curated 16 77.8 / 93.9 / 96.6 at 4 / 10 / 15 a side |

### 6.6 What I measured on paper, and what it does and does not prove

All numbers: `v4-spec-tools/plan-sampler-r2.mjs` (300 seeds a size, up to 8 tries, seed x 100 + t), output `plan-sampler-r2-results-300-seeds-8-tries.txt`; all 14 sizes at 200 seeds: `plan-sampler-r2-results-14-sizes-200-seeds.txt`; the curation: `curate-r2.mjs`, `curate-results-r2.txt`.

**Pass rates, rules on and off** (the old files `plan-sampler.mjs` and its results are kept):

| | 4 a side | 7 | 10 | 15 |
|---|---|---|---|---|
| rooms per half / kinds (rules on) | 16.3 / 13.6 | 21.5 / 16.2 | 25.6 / 17.1 | 36.7 / 20.0 |
| **rules on: median score (p10)** | 94.4 (88.1) | 95.3 (89.1) | 95.6 (90.4) | 97.2 (93.4) |
| **rules on: pass on the first try** | 45% | 43% | 47% | 48% |
| **rules on: pass within 8 tries** | **99%** | **99%** | **100%** | **99%** |
| rules off (affinity only, 28 kinds): median score | 83.5 | 82.5 | 84.5 | 87.2 |
| **rules off: pass within 8 tries** | **3%** | **0%** | **0%** | **0%** |
| control: 20 built rooms only, r2 furnace and shapes: median score, within 8 | 95.5, 100% | 96.6, 93% | 96.2, 92% | 97.8, 95% |

All 14 sizes, rules on, within 8 tries: 2 to 5 a side 99%, 6: 97%, 7: 100%, 8: 95%, 9: 99%, 10: 100%, 11: 99%, 12: 100%, 13: 99%, 14: 99%, 15: 99%. **A table moon is one accepted seed and never falls back**; the sweep only checks the planner's health.

**Natural share by depth** (percent of a cave's walkable length natural, rules on; target in brackets; the furnace's share is the bays'):

| | first cave | caves between | tunnels (over the furnace) | furnace |
|---|---|---|---|---|
| 4 a side (K 4) | 17% (15) | 21% (27) | **86%** (50) | 29% (a bay) |
| 7 a side (K 5) | 18% (15) | 20% (23), 32% (38) | **88%** (55) | 28% |
| 10 a side (K 6) | 17% (15) | 16% (22), 31% (32), 39% (45) | **89%** (59) | 0% (no room) |
| 15 a side (K 8) | 18% (15) | 18% (20), 27% (25), 35% (34), 42% (43), 45% (53) | **89%** (62) | 0% |

The share grows with depth and the middle caves land within 2 to 8 points of target. **The tunnels overshoot** (86-89% against 50-62%): the natural signature plus the quota fill a half that holds only two or three rooms; "most of the tunnels" is what the owner asked. Rules off, the first cave is **53-66%** natural (the library runs out and natural rooms become the filler of the top: the opposite of the owner's order).

**Unused arc** (rock beyond the plug, share of a cave's half; first tries): the first cave 11 / 15 / 17 / 21% on average (4 / 7 / 10 / 15 a side), every other cave 2-11%; the worst cave of a plan: median 14 / 17 / 20 / 25%, 90th percentile 27 / 31 / 37 / 38%, over the 30% line in 7 / 16 / 20 / 28% of first tries. The first cave stays the sparse one (6.5, row 4); the sheet `curate-sheet-r2-10.png` shows it.

**Sensitivity: what each lazy change does to the gate**, within 8 tries at 4 / 7 / 10 / 15 a side:

| Change | 4 | 7 | 10 | 15 | Reading |
|---|---|---|---|---|---|
| none (rules on) | 99% | 99% | 100% | 99% | |
| natural rooms as plain filler, no quota | 64% | 70% | 83% | 92% | **caught**: R12 and C10 |
| no foot halls | 99% | 99% | 96% | 95% | the first cave is emptier (unused arc) |
| pre-placed rooms not checked against neighbours | 98% | 97% | 97% | 85% | first tries fall to 23-38% |
| the hall not placed before the quota | 99% | 98% | 100% | 99% | **no measurable effect** (C8 floor failures without the hall step 8% and 3%, with it 12% and 1%, at 4 and 7 a side): the designer's cost did not reproduce; the order is kept because it is free and makes the hall a promise |
| no gap filler / no stretch and no filler | 98% | 98% | 99% | 100% | little: they change the look, not the pass rate |
| library cut to 14 kinds (8 built, 6 natural) | 96% | 87% | 69% | 14% | **caught from 7 a side** |
| natural family cut to one kind (the Reef) | 96% | 44% | 7% | 0% | **caught from 7 a side** (C11, R12); at 4 a side a moon has about 5 natural rooms and the guard cannot see a collapse |
| every passage a stair-hole | 0% | 0% | 0% | 0% | caught |
| every room one scale (class M by L) | 0% | 0% | 0% | 0% | caught |
| room widths not jittered | 96% | 93% | 94% | 89% | **not caught, by design**: the variety is in the mix of rooms, not in a number range |

Honest reading, as in the first spec: **a mean-score gate alone would pass a rules-off generator at 15 a side (median 87.2 against a minimum of 85); the hard rules are what fail it** (rules off: 3% and 0%).

**The 16 moons per size** (the curation, 1,200 candidates a size, nearest pair at least 0.30, `curate-r2.mjs`; `cross` = the nearest pair across the sizes that share one disc, 2-5 a side):

| | 4 a side | 10 | 15 |
|---|---|---|---|
| candidates passing score and hard rules (of 1,200) | 530 (44%) | 533 (44%) | 557 (46%) |
| the 16: nearest pair / mean / farthest | **0.39** / 0.49 / 0.60 | **0.54** / 0.60 / 0.69 | **0.57** / 0.63 / 0.72 |
| 16 random passing plans: nearest pair / mean | 0.27 / 0.46 | 0.39 / 0.56 | 0.45 / 0.60 |
| random sets with a near-twin pair (under 0.20) | 4% | 0% | 0% |
| set diversity score (the 16 / 16 random) | **77.8** / 66.7 | **93.9** / 79.7 | **96.6** / 87.2 |
| room kinds met (natural), casts met, shape sequences | 24 (8), 6 of 6, 12 | 27 (8), 16 of 79, 15 | 28 (8), 16 of 187, 16 |
| mean room distance between two moons: surface / first cave / middle / tunnels / furnace | .51 / .72 / .71 / .75 / **.23** | .53 / .74 / .77 / .74 / no rooms | .53 / .74 / .78 / .70 / no rooms |
| kinds in all 16 moons | Crater, Flat, Chimney, Attic, Hot Plates | Crater, Flat, Grand Stair, Breakdown, Reef, Chute | Crater, Flat, Span, Chute, Grand Stair, Breakdown, Attic, Reef, Chimney |

All 14 sizes fill 16 moons and pass A1-A4 and A6 (section 7.2); the shared disc of 2-5 a side keeps all 64 of its moons at least 0.35 apart (nearest across sizes 0.35). The run took about 17 minutes at below-normal priority. Compared with the first spec's stand-in (nearest pair 0.32 / 0.50 / 0.53), the natural rooms and the wider shape draws make the moons about 0.04-0.07 farther apart.

**What this proves**: the rule set still passes with the natural family in the library; the natural share lands as the owner asked in the caves that can hold it; the quota, the gradient rule and C11 each do the job they were added for (sensitivity table); the curation method fills 16 moons a size that are farther apart than random ones.

**What it does not prove**: that v4 plays well; that the real planner will pass at the same rates (the paper planner is greedy, sizes natural rooms by width ranges where the real one calls the recipes, and has floats where the real one will be integers: **V0 re-measures and the director re-sets thresholds before V1**); that the first cave looks good (it is sparse by the numbers); the furnace, which differs least between moons and holds no rooms from 8 a side up; the vocabulary overlap, which is structural (at 15 a side nine kinds are in all 16 moons because a moon uses 20 of 28 kinds); crowds, CPUs, or anything online. Designer 3's flight check covers the natural grids on their own, not as built pieces in the polar chart.

---

## 7. The fixed set of moons

The owner (answers 8 and 10): "A fixed set of moons per size"; asked who chooses, "I shortlist, you veto" and "make it 16 moons. more variation." This replaces the first spec's "the host sends the plan (2-3 KB)": **the host sends a moon number**.

### 7.1 Keys: size, disc, number

- **Key by `side = max(2, ceil(N / 2))`**, N the number of fighters (`SETTINGS.count`), and build on the disc of N' = 2 x side (for every count the lobby offers this is the disc `mcGen(N)` makes today: 3 and 5 players, 2v1 and 3v2 build the same disc as 4 and 6; 1v1 uses the 2-a-side row).
- **14 rows, 2 to 15 a side.** Reachable from today's lobby (counts 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 30): **2, 3, 4, 5, 6, 8, 10 and 15 a side**. Not reachable: 7, 9, 11, 12, 13, 14. Build all 14 rows (a row is 16 pairs of numbers; the lobby may one day offer 7 or 12 a side); the owner reviews the reachable rows only and the lead accepts the others by the acceptance lines.
- **Discs.** 2 to 5 a side are **one disc** (K 4, radius 2,550); 6: K 4, 2,771; 7: K 5, 2,993; 8: K 5, 3,200 (six cracks from here); 9, 10, 11: K 6; 12, 13, 14: K 7; 15: K 8, 4,382. The 64 moons of the shared disc are chosen together so they all differ.
- **v4 owns its disc numbers.** The planner reads `MC4_DISC`, a frozen copy taken at V0 of `MC_GEN`'s size numbers (`perFighter`, `rMin`, `rMax`, `crust`, `floors`, `innerMin`, `head`, `caveOrder`, `caveRank`, strip, cracks) **plus, per size, the integer quarter arc of every cave in pixels and the furnace's bay widths** (Appendix A). It never reads `MC_GEN`.

### 7.2 How the 16 are chosen (the curation tool, `v4-spec-tools/curate-r2.mjs`)

For each size: **1,200 candidate seeds** (`side x 10000 + 1..1200`, one try each, no retry; a seed names its size). Keep those that pass the plan score and hard rules (34-50% do at one try) and score at least 90 (the curation gate; it removes almost nothing and is a floor). Take the best-scoring plan, then repeatedly add the candidate whose **nearest chosen moon is farthest** (greedy farthest-point), with a minimum pairwise distance of **0.30** (lowered by 0.02 at a time to a floor of 0.22; below the floor the size is THIN: widen the pool to 2,400, find the cause in the planner, then ask the owner; never fill a slot with a near-twin, never lower the plan-score gate, never loosen a hard rule).

**The plan-to-plan distance** `D` (0 = the same moon, 1 = nothing in common) = 0.55 `Droom` + 0.20 `Dcast` + 0.15 `Dshape` + 0.10 `Dlink`. `Droom` is a weighted edit distance over the rooms of each chain in order (insert or delete a room: 1; swap for the same kind: 0 to 0.3 by width, plus 0.1 for a hall's upper part; swap for another kind: 0.45 + 0.55 x (axes that differ, of **seven**) / 7). **r2: the seventh axis is MAKE (built or natural)**, so swapping a built room for a natural one is farther than swapping two built ones. `Dcast`: share of caves whose kind differs; `Dshape`: share whose graph shape differs; `Dlink`: half the L1 distance between passage mixes. A distance under 0.20 is a **twin** (about 6 rooms or fewer differ); 0.30 is about 9 of 14 rooms different, more than a different cast on the same rooms.

**The set-level diversity rules** (the moons of one size must differ from each other, not only each within itself):
1. **Nearest pair at least 0.30** within the size and across the sizes that share a disc.
2. **The set diversity score** (0-100) = 35% nearest pair (full marks at 0.55) + 35% mean pairwise distance (full marks at 0.70) + 15% room kinds met (full marks at 26 of 28) + 15% casts met (distinct casts over the number the disc can make, at most 16). The targets were re-set in r2 so that 16 random passing plans score clearly below the curated 16 at every size (the first spec's targets saturated: random sets met 22 kinds of 28 and reached 0.44 of 0.45).
3. **The vocabulary rule**: every moon omits at least 4 kinds that other moons of the set have (measured 5-9). The first-spec proposal "no kind in more than 12 of 16 moons" is **dropped as a hard rule**: a moon uses 20 of 28 kinds at 15 a side, so the average kind is in 11.4 of 16 moons and the cap stops the selection at 12-13 moons. **The overlap is structural** (at 15 a side nine kinds are in all 16 moons) and is reported, not gated: it is cured by a bigger library, not by curation.
4. **Acceptance lines** (the lead checks them before the owner sees a sheet): **A1** 16 moons; **A2** every moon passes score, hard rules and the gate; **A3** nearest pair at least 0.30 in the size and across a shared disc; **A4** set score beats 16 random passing plans by 8 points (or, if the random draws already score 90 or more, the set scores 95 or more); **A5** every district's mean room distance at least 0.35 (reported, not gating: the furnace fails it by construction); **A6** every moon omits at least 4 kinds the set has. Paper result: **all 14 sizes accept on A1-A4 and A6**.

### 7.3 What "frozen" means and when it freezes

The planner (`mcPlan` and everything it calls, its one random stream), the room table, **the natural recipes `MC4_NAT`**, the score, the hard rules, `MC4_DISC` and the table are **frozen under a version tag**; a change to any of them is a new tag (`p2`), a new table and a new owner review. The pieces (`mcBuild`) are **not** frozen: the plan is the contract, not the pieces (a bug in a ramp is fixed without moving a moon; a builder change moves the piece hash on the wire, and host and guest run the same build).

| Frozen at the tag | Free to change after it |
|---|---|
| `mcPlan`, its random stream, the room table (axes, size ranges, affinity), `MC4_NAT`, the score, the hard rules, the gate numbers, `MC4_DISC`, `MC4_MOONS`, `MC4_TAG` | `mcBuild`, the router, the CPU, the drawing, the scenery, the lobby and the stage text, the owner-facing pictures |

**When**: not at V0. A table frozen before the library is final means any later cut (the five least-different rooms are the owner's own first cuts) changes all 224 moons and the owner's vetoes with them, because the planner draws from one stream. V0 produces a **preview table tagged `p0`** (the owner sees the sheets as a taste check, no veto is binding); every planner change between V1 and V8 is free; **the tag `p1` is set at V9**, after every room exists and the cast, passages and scenery are in, with the owner's one review. The `p0` moons print a console line "preview table". A plan change after `p1` is `p2`.

### 7.4 The table, as it will sit in `index.html`

Beside `MC_GEN`, in one banner block (`moon-table-r2-literal.txt` is the real thing for the r2 paper planner, tag `p0-r2-standin`):

```js
// MOON CAVES v4: the fixed moons. FROZEN with the planner: a changed number here, or any change to mcPlan, the room table, the score, MC4_DISC or MC4_NAT, is a new tag.
const MC4_TAG = 'p1';
const MC4_MOONS = {   // players a side: the 16 moons, [planner seed, hash of the plan it makes]; the moon's id is side-number: '4-01' is MC4_MOONS[4][0]
  2:[[20008,'e9a157d2'],[20032,'7cf4d98d'], ... 16 pairs],  ...  15:[[150004,'...'], ... 16 pairs],
};
const MC4_SUM = '...';   // FNV-1a of the tag and the two numbers of every moon: recomputed once at boot in a dev build
```

A seed names its size (`Math.floor(seed / 10000) === side`: a sanity check at boot). The **moon number** is the slot, 1 to 16 for people (`4-07`), 0 to 15 in code and on the wire. **Slots are stable**: a veto replaces the seed in a slot; the other 15 keep theirs. The **plan hash** is FNV-1a over the integers of the plan (rooms in order with cave, quarter, kind, width, height, hall flag; links; cast; shapes): it turns a silent drift into a loud one. About 5 KB. The tool writes `moon-table-r2.json` and `-literal.txt`; **a person pastes the literal** (Python load/save only with an asserted match count; never `sed -i`: the file is CRLF), and the dev boot check recomputes `MC4_SUM`.

### 7.5 How a match picks a moon, and online

`mc4PickMoon(side)`, modelled on `ctfPickMap` (the same shape for Capture the Flag maps): (1) a guest: the host's number (`MC4.netMoon`, set by `beginMatch` from `settings.moon`, consumed once); (2) dev: `localStorage['bfsi:mc4moon']` = 1 to 16 forces a moon (the lead's pane pictures and every check use it); (3) otherwise the host draws `floor(Math.random() * rowLength)` and, if it equals `MC4.last[side]`, draws another (`MC4.last` is a plain variable, not saved). The draw is at Start, outside the pure part of `setupWorld`: **the host draws it in `startAsHost` and puts it in the start message** (`settings.moon`, beside `settings.ctfMap`), so every device builds that moon from the first frame; solo draws in `buildMoonCaves`. **Rematch** draws a new moon, never the one just played. **R mid-match** ("the same fight from the top") keeps the moon (default; section 12).

- **Start message**: `settings.moon` (an integer 0-15) for a v4 stage, validated like every peer-supplied field in `beginMatch`; a number past the end of the guest's row refuses.
- **Geometry message** (`worldGeo`, every 3 s and with the first snapshot of a match): v3 sends `moon:{N, k, n, h}` from `mcGeoOut`; **v3's message stays byte for byte as it is**. v4 sends, only when v4 is on, `moon:{ v:4, t:'p1', s:10, m:6, n:<piece count>, h:<piece hash> }` (about 60 bytes; the stage id is already in every snapshot).
- **The guest, in order** (`mcNetGeo`): (1) `m.v === 4`: validate `s` in 2..15 and `m` in 0..15; (2) **the tag**: `m.t === MC4_TAG`, else refuse; (3) **the "built already" test includes the version and the moon**: v3's test is `MCAVE.N === N && MCAVE.k === k` and returns without looking at anything else; v4 reads `MCAVE.v === 4 && MCAVE.moon.s === s && MCAVE.moon.m === m && MCAVE.moon.tag === t`, otherwise a rematch on the same size but another moon would leave the guest on the last moon; (4) rebuild the plan from its own table, its hash must equal the table's hash for that slot; (5) build the pieces, the count and hash must equal `n` and `h`; (6) **any failure refuses cleanly**: `NET.dropped("Left the room: this moon was built differently on the host (Moon Caves v4, moon 10-07). Refresh the page (F5), and ask the host to as well.")` (the same exit a failed build check uses at start). v3 only logs a console warning; for v4 a silent difference would put two players on different floors.
- **The guest's own `setupWorld` builds a disc before the host's message arrives**, and v3's `mcNetGeo` keeps whatever is built. With one moon per size that is harmless; with 16 it would put a guest on the wrong one. **Both the start-message number and the early-return fix are required; either alone leaves a window. This is the likeliest bug in the whole job.** `worldGeoKey` also gets the moon id so a changed moon re-sends at once.
- **The host's own check**: it rebuilds the plan from the table and compares the plan hash. A mismatch in a dev build throws; in a release it falls back to v3's moon for that match and logs, and the geometry message then carries v3's `{N, k, n, h}`.
- Piece-hash false alarms from floating-point differences between browsers are negligible (the hash rounds angles at 1e-5 rad; a flip needs a value within 1e-16 of a rounding edge).
- **Never the live relay.** S5 is an in-memory host and guest pair.

### 7.6 Map Size, and where the moon's id is carried

**Map Size** (`mcGen(N, k)` multiplies the radius by `k`: Compact 0.85, Normal and Tall 1.0, Huge 1.4; the number of caves follows) changes the disc, and a table of 16 is for one disc. **Default in r2: v4 ignores Map Size** (always the Normal disc; the lobby row stays but does nothing on this stage; v3 keeps its effect). The other options (curate only Normal and run the same seeds uncurated on the other discs; or 3 tables, 672 moons) are worse. It removes a setting from one stage: section 12.

The id (`10-07@p1`) is **never drawn in a match** (no words). It is carried in: `mcPlanDump()` (dev): one line with the id, seed, plan hash, score and cast, plus the plan JSON, also printed once when a v4 moon is built; the **match record** (`rec.moon = '10-07@p1'`, absent for v3, so v3's records do not change); the **NaN log** row (it already has a `moon:` flag; make it the id); the **replay's download name** (`bfsi-match-moon-10-07.webm`, `bfsi-clip-moon-10-07.gif`, v4 only); and, **default yes, small**, a line on the **result screen** ("Team 1 takes Moon Caves v4, moon 10-07"), so a player can name a moon in a bug report and learn to name them.

### 7.7 The owner's review pack and the veto

Three PNGs, one per size, 4 x 4 renders each: **paper version already drawn on the r2 planner: `curate-sheet-r2-4.png`, `-10.png`, `-15.png`** (`curate-sheet-r2.mjs`; the first spec's rehearsal on the old planner is `curate-sheet-4.png` etc.). Each render is one moon: its number in large digits (the thing to name), its id, the plan score, the rooms a half, the nearest other moon and how far; left, the moon from above (one ring per district coloured by kind, rooms as arcs, natural rooms with a white cap, homes as blue and red ticks); right, the right half unrolled (12 o'clock at the left edge, the home in the middle, 6 o'clock at the right, the surface on the top row and the furnace at the bottom, every room a box with a two-letter code, a hall's upper part pale, the graph shape at the end of each row). **The lead shortlists** (runs the tool on the real planner at V9, checks A1-A6 for all 14 sizes) and **the owner vetoes**: "swap 10-03 and 4-07".

```
node curate-r2.mjs --veto 10-03,4-07        # reads moon-table-r2.json, keeps the other 15 moons of each size exactly, takes out the vetoed one and every plan within 0.15 of it
node curate-sheet-r2.mjs --sizes 4,10       # redraw; the new moon takes the same number
```

Checked on the stand-in for the first spec (vetoing 4-07 and 10-03 changed exactly those two slots of 224); the r2 tool has the same code path (not re-run). After the freeze a swap is a new tag. The owner is asked to say yes or the ids to swap for 3 sheets; the lead accepts the other sizes by A1-A6 and the owner can ask to see any (`--sizes 8`).

### 7.8 The four weak spots designer 4 found, and what r2 did about them

| Weak spot | r2 |
|---|---|
| Only 6 district-shape sequences exist | **Fixed**: drawn by seed from every sequence rule 7 allows: 10 to 16 distinct sequences in a set of 16 (12 / 15 / 16 at 4 / 10 / 15 a side). |
| The furnace and the surface differ least | **Surface widened** (open Reef and open Breakdown join Grand Stair, Span, Chimney, Chute: mean room distance 0.51-0.53 against 0.34-0.47). **The furnace cannot be widened**: its bays hold 4 kinds at 2-7 a side and nothing from 8 up (0.23 at 4 a side). Question 1. |
| The 16 moons share most of their rooms | **Not fixable by curation** (7.2, rule 3): the vocabulary rule became "every moon omits 4 kinds"; the overlap is reported. A bigger library is the cure. |
| 2 to 6 a side have only 6 casts | **Unchanged** (the owner's cast rule): the five most-played sizes differ in one middle cave, the shapes and the rooms. Question 3. |

---

## 8. The stage entry: "Moon Caves v4" beside v3

The owner (answer 11): "Side by side for a while": a separate stage entry next to the current Moon Caves, v3 untouched and playable, the same unlock as Moon Caves, no flip until the owner says so.

**Switch**: `MC_V4`, the two-switch pattern of `MCAVE_DEV` / `MCAVE_OPEN`: `MC_V4_DEV` (`localStorage 'bfsi:mcv4dev' = '1'`, in a try/catch like its sibling) and `MC_V4_OPEN = false`; `MC_V4 = MC_V4_DEV || MC_V4_OPEN`. The switch hides the stage from the **host's lists** and nothing else: a guest finds the stage by id whatever its own switch says. **The new stage**: id **`mooncaves4`** (never reuse `mooncaves`: a saved or in-flight stage id must keep meaning v3), `name:"Moon Caves v4"`, `layout:"disc"`, `teamsOnly:true`, `secret:"one"`, `hazard:"lowgrav"`, `moonV:4`, `mcV4:true`, the same `sky`, `ground`, `plats:[]`.

**Places that need a line (10; line numbers are at tip `a316e32` and will move; the hooks are named so they can be found again)**:

| # | Place | What changes | When |
|---|---|---|---|
| 1 | Switch constants beside `MCAVE_DEV` / `MCAVE_OPEN` (about 2608-2612) | add `MC_V4_DEV`, `MC_V4_OPEN = false`, `MC_V4` | V1 |
| 2 | `STAGES`, after the `mooncaves` row (about 3900) | add the `mooncaves4` row (list order is the order of the cards and the lobby's drop-down) | V1 |
| 3 | `stageOpen(s)` (about 3907) | first test: `if(s && s.mcV4 && !MC_V4) return false;`. **The only gate**: `stagesOpen()`, `stageGuard()`, `maxTeams()`, the lobby and the cards all go through it | V1 |
| 4 | `buildMoonCaves()` (about 3428) | `const g = stage.moonV === 4 ? mc4Build(side, MC4.pick(side)) : mcGen(SETTINGS.count, mapSize().w);` | V1 |
| 5 | `mcState(g)` (about 3440) | carry `v: g.v \|\| 3` and `moon: g.moon` (`{id, s, m, tag}`; v3 leaves both unset) | V1 |
| 6 | `mcGeoOut()` (about 3524) | for v4 only return `{v:4, t, s, m, n, h}`; v3 returns exactly `{N, k, n, h}` | V8b |
| 7 | `mcNetGeo(m)` (about 3525) | the v4 branch, the early-return test and the refusal of 7.5 | V8b |
| 8 | `worldGeoKey()` (about 83229) | add the moon id | V8b |
| 9 | `startAsHost` (about 84688) and `beginMatch` (about 84702) | `if(stage.moonV === 4) settings.moon = MC4.pick(side)` beside `settings.ctfMap`; in `beginMatch` read it, validated, into `MC4.netMoon` | V8b |
| 10 | `recordMatch()` (about 68109), `nanNote()` (about 45601), the two download names (about 20331, 20489) | carry the moon id; for v3 nothing changes | V10 |

**Places that follow without a change** (all inherited from `layout:"disc"`, `teamsOnly`, `secret:"one"`; check each once): `setupWorld()` tests the layout, not the id (if v3 is ever hidden by turning `MCAVE_OPEN` off, add `|| stage.moonV === 4`); the unlock with The Moon (`secret:"one"` in `stageOpen`); 15 v 15 (`maxTeams`, `MAX_MOON = 30`, `countOptions`); two sides only (`teamSplitsFor`); the stage cards and the stage button (**there is no stage picture**: a card is `<b>name</b><span>blurb</span>` and `STAGE_ART` has no entry for either Moon Caves, so the card text is the new row's `name` and `blurb`; a picture on cards is a feature for every stage, not part of this entry); the online lobby's picker and summary line; World Cup and Watch-AI pools (filtered by `teamsOnly`); the geometry message in general; no words in the match (`stage.name` is used only on the select screen, the lobby, the result line and `teamAiStageLabel()`); replay and spectate (`mcWatching`/`mcWatch` read `MCAVE` and nothing stage-specific); **the One reward card** (the line "Moon Caves, for Teams"): **do not add a v4 line until the flip**.

**What the builder must give the shared code**: `mc4Build` returns the same `g` object as `mcGen` (`N, k, Rout, K, tops, crustBot, shellTop, shellBot, Rb, rKill, WW, WH, cx, cy, segs, holes, zsegs, cracks, pads, zones, layers, hot`), so `mcState`, `mcLayerOf`, `mcGravAt`, `mcHotFloor`, the camera, the minimap and the decoration run unchanged; `layers[].kind` and `.low` still drive the look and the gravity.

---

## 9. Milestones

Every milestone is **one small build job** (one cheap agent), **bootable** (the game runs and v3 is untouched at the end of it), hidden behind `MC_V4` (off for everyone; `MC_V4_DEV` is set by a dev flag; the lead turns it on in the built-in browser pane for pictures; the owner can turn it on in their own browser). **v3 stays the moon everybody plays, exactly as it is today, for the whole job** (no flip is planned: section 8). Builder rules: fetch origin and read `docs/LEDGER.md` first; `index.html` is CRLF, so Python load and save only, with asserted match counts, never `sed -i`; a worktree under `smash-island/.worktrees` (not `g-moon`, which another session owns); no `node_modules` links, never `npx`; scripts at BelowNormal, at most two node processes, explicit timeouts; **never the live relay, never a browser launched by an agent**; show the owner and ask before pushing (PRs only in cloud sessions). **No tests are committed** (the 2026-10-21 rule): the diversity gate is generator code, and every probe below is a throwaway script deleted afterwards. Computer game only; multiplayer means online; no words drawn in a match.

**The five standing checks (every milestone, after its own):**

- **S1 v3 untouched.** With the switch off, the hash of v3's pieces (`mcGeoOut`) at 2, 4, 7, 10 and 15 a side equals the hash computed **on origin's v3 in the same session** (never a stored number: the cloud session changes v3 legitimately), and a 30-second CPU match plays.
- **S2 v4 boots.** With the switch on and `bfsi:mc4moon` forcing a moon, a 60-second CPU match plays at 4 and at 10 a side with no errors; the plan sweep (14 sizes x 200 seeds) still passes **at least 93% within 8 tries at every size** (paper: 95-100%) and, from V9, every table moon rebuilds from its seed with its stored hash.
- **S3 mirror.** Every piece and zone has its mirror partner or is its own mirror image (v3's 356 of 356 is the baseline pattern).
- **S4 CPU navigation.** In the room graph every room is reachable from both homes and from the surface; a 3-minute CPU-only match at 4 and at 10 a side has no CPU stuck for 5 seconds or more (v3's run is the baseline); KO causes are counted (space, core, damage cap) as evidence, never for tuning.
- **S5 online.** From V8b: an in-memory host and guest pair (never the relay): the guest's rebuilt moon equals the host's (plan and piece hash), a version or tag mismatch refuses cleanly, and a guest that built moon 11 and then receives moon 6's message ends on moon 6. Before V8b: two builds of the same moon in one process give the same plan and piece hash. *(Online could move to right after V1 if the lead wants every later step checked on a guest: it needs only the plan hash and the piece hash, which exist at V1.)*

| # | Milestone | What ships | Lines (my estimate) | Checks besides S1-S5 |
|---|---|---|---|---|
| **V0** | **Plan only** (no geometry) | `MC_V4` constants; `MC4_DISC` (frozen copy plus quarter pixels and bays, made by a V0 tool); **`MC4_NAT`** (the eight recipes, copied byte for byte from `natural-chambers.mjs`: `hash`, `tidy`, the recipes, `build(kind, seed, opt)`); the two room tables (20 built and 8 natural: axes, size ranges, affinity, `SUIT`, `minHead`, `SELF`, forbidden pairs, `SHARE`); **`mcPlan`** (cast, shapes, obligations, hall, foot halls, natural quota, built fill, stretch, gap filler, furnace bays, links, retry); the score C1-C11 and hard rules R1-R12 (R14 implemented); `mcPlanDump()`; the **preview table `p0`** (the curation tool pointed at the real `mcPlan`). Nothing draws; with the switch on the plan only prints | 800-1,100 (planner 450-700, recipes about 300 verbatim, tables 60-100) | Sweep 14 sizes x 200 seeds at least 93% within 8 tries per size; **deterministic** (same size and seed twice gives identical JSON and hash; the same hash in the pane's browser as in jsdom for 5 seeds); mirror; strips, cracks and bays clear; roofs under the crust; **R11 and R12 measured on the real planner and the director re-sets thresholds that differ from paper by more than 5 points, before V1**; natural share by cave within 10 points of the paper table (6.6) at 4, 10, 15 a side; natural rooms sized by the recipes. **Renders**: the contact sheet of 30+ plans and the three preview sheets. **The owner looks at the plans and corrects the reading of "hybrid".** |
| **V1** | **Skeleton** | `mcBuild`: the rock mass minus rooms, plugs with flat throats; **every room a plain box of its footprint** so any plan boots; homes, lifts, pads, cracks, the hot floor and the surface lap as v3; furnace bays plain; the room graph, the next-hop table, `mcLayer` by room; stage hooks 1-5 (hidden stage, `MC_V4_DEV` only), `MC4.pick` with the dev override | 400-600 | **The screen check on real geometry**; its reference numbers recorded and each line set at twice the reference (never above 6.3's); every wall at least 100 px; real top-down and unrolled renders; the lead's pane pictures at 12, 3, 6 and 9 o'clock of 3 moons; the stage shows only with the dev flag. |
| **V2** | **Natural rooms** (the lower caves exist from here) | The eight recipes built into pieces: grid to maximal rectangles (`put`), planks, ramps as `'slope'` pieces, **beds as zones** (pads, ice, belt, water, draught, the flare arcs in a furnace bay), sill and slope-mouth links, `flip`, `sym`, head caps | 400-600 | **The flight check on the built pieces** (the paper checker pointed at the pieces: 8 kinds x 80 seeds x stat 1 and 0.85 x both gravities, caps 16, 17, 21, 22, symmetric and open builds: 0 islands, 0 traps, A and B linked by walk, one jump and drop), **repeated in the polar chart at the smallest radius each kind is offered at**; the Breakdown crest and the Dumbbell neck exactly 112-128 px; each bed's footing on a test body at 12, 3, 6, 9 o'clock (the flare burns the bed, not the perch); ramps walked with no jump (step-up 24 px or less); the CPU through every kind once. |
| **V3** | **Built rooms of boxes and planks** | Crawl, Span, Teeth, Barricade, Warren (and the Attic's shell) | 250-400 | A throwaway flight test of every room's ports (48 px body, both jumpers, both gravities): all connected, nothing trapped; the Crawl's roof 110-120 (the tallest body passes, no jump); Barricade wall 180+ with its three ways past; every Warren cell two ways in; the CPU through each. |
| **V4** | **Slopes, the surface, up and down** | Long Ramp, Grand Stair, Crater (thick rock under it), Flat, Span as a rift, the open Reef and open Breakdown; uneven floors (offsets joined by a sill or slope-mouth); v3's hop-tops on plain surface stretches; Chimney (up to 3 caves), Chute, Sinkhole, Attic with its prize stash; passage types hatch, pore, chute, crack; a down-only flag in the router | 450-700 | Ramp walked with no jump; CPU through a ramp; **the surface lap is one closed walk through every feature**; a scripted launch from the rim and from the bowl (the rim is nearer to space by the depth); flight test of every room's ports; the chute is one-way; 1,000 random routes never go up a down-only link; the prize refills only when empty. |
| **V5** | **Halls and shapes** | Cathedral with the claim rule and the one-way bridge; foot halls; Racetrack with its junction; the hall rule in `mcGravAt` (inside a hall's box the lower cave's gravity, so nobody changes weight in mid-air); SPLIT and FAN built (pole plugs, hubs) | 350-550 | A scripted fall through the old floor line does not change gravity in the air; the bridge is one-way; shapes measured on the real graph (a LAP has a closed walk, a SPLIT has no path between the homes inside the cave, a BRAID an extra cycle, a FAN a room with three links); the teams can still meet underground. |
| **V6** | **Footing rooms** | Garden (geyser), Lake (ice or water, with its drain), Aerie (updrafts), Headframe (belts), Geode (heal pool, cache), **Hot Plates** (plates as data with a phase in a furnace bay; `mcHotFloor` reads them); the heal zone's drawing | 450-700 | Each footing on a test body at 12, 3, 6 and 9 o'clock; the plates' burn counted per crossing (evidence); items from fixed stash spots only; `hazardT` shared with the guest. |
| **V7** | **Cast, identities, scenery** | The kind-owned passage rule enforced in the builder (springs no stairs, updrafts draughts only, ice ramps only, mines belt ramps); back-wall kits and the colour fade when you drop through a floor | 250-400 | A picture of every kind's cave; no words; drawing time in the pane at 30 fighters no worse than v3's by more than 1 ms a frame. |
| **V8a** | **CPU graph and hardening** | SPLIT and FAN under `mcCrowd`; Warren crowds; the single-file jams (Crawl, Wriggle, Dumbbell, Breakdown crest); the Vug crowd rule decided from the measurement; the 4-second give-up; chute and Crawl rules in the router | 150-300 | CPU-only 10 v 10, 3 minutes, twice, at 10 and 15 a side: no CPU stuck 5 seconds or more; core KOs with no hit in the 3 seconds before under 15% of KOs; matches finish. Evidence only, never tuning for bots. |
| **V8b** | **Online** | Hooks 6-9; the moon number in the start and geometry messages; the guest's early-return fix; the refusal path; the tag | 100-200 | S5 in full; the geometry message about 60 bytes; prediction error at 12, 3, 6 and 9 o'clock no worse than v3's. |
| **V9** | **Curation and freeze** | The tag `p1`; the lead runs `curate-r2.mjs` on the real planner (about 20 minutes at below-normal; it writes only `moon-table-*.json`), checks A1-A6 for all 14 sizes, draws the three sheets; **the owner vetoes**; the lead pastes the literal and `MC4_SUM`; the dev boot check | 100-200 | Every table moon rebuilds from its seed with its stored hash; the screen check on the real geometry of 4 moons per reachable size (a moon that fails is replaced like a vetoed one); S1-S5 on 3 table moons per size; **the tag is not set until the owner says yes to the 3 sheets**. |
| **V10** | **Stage entry visible and polish** | Hook 10 (record, NaN log, download names); the result-screen line; optionally a host-only lobby row "Moon: Random / 1 to 16"; **`MC_V4_OPEN = true` only on the owner's yes** | 60-150 | The release check: **read the plan before unhiding anything** (Moon Caves was once released at M1 by mistake); the stage shows in the cards, the lobby and the online picker; a guest joins a host whose switch is on; v3 unchanged; no One-reward line. |

Total about **3,700 to 5,800 lines**, against `mcGen`'s 240: it is a rebuild and I would rather say so than hide it. The cheaper path (the first spec's Q1 B, rings with landmarks) was 1,200-1,800 and the owner did not pick it.

**Where the early steps go wrong first (watch these)**: the planner not placing obligations (the paper planner lost its signatures and its squeeze until they were placed first); the planner using trig (the quarter pixels and bays must be frozen integers in `MC4_DISC`); a recipe edited "slightly" (it is a new tag, and the Breakdown's crest and the Dumbbell's neck pass by 16 px, so a rounded cell fails the tallest body); the grid built at the wrong radius in the polar chart; the first cave looking empty (it is sparse by the numbers, so judge it in V0's renders, not in V4); the same room twice in a plan because a hall's claim was not counted; CPUs lost in a Warren; a prize camper in the Attic; a straight shot down the Chute or Chimney; and the guest on the wrong moon (7.5).

---

## 10. Risks

| # | Risk | Mitigation |
|---|---|---|
| 1 | The seed table changes by accident (a merge, a tidy, CRLF) | One banner block; `MC4_SUM` and the per-moon plan hash catch any changed number at boot (dev) and when a moon is built; the tool never writes into the game; a person pastes (Python, asserted count). |
| 2 | A planner or recipe change after the freeze, even one character (one random call moves all 224 moons silently) | The per-moon plan hash makes it loud (dev: throws; release: v3's moon for that match, logged). Any change to `mcPlan`, the room table, the recipes, the score, `MC4_DISC` or the table is a new tag, stated in the banner and enforced by the hash. |
| 3 | The hash covers the plan, not the pieces | By design; a builder fault is caught by S3, S4 and the screen check, not by the table. |
| 4 | A bug report is ambiguous (the table moves between builds) | The id carries the tag (`10-07@p1`); slots are never reused within a tag; the result-screen line and the replay name carry it. |
| 5 | The cloud session's changes to v3 leak into v4 | v4 reads `MC4_DISC`, never `MC_GEN`; v4 is one contiguous block after `buildMoonCaves`; v3's code is touched in the ten one-line hooks only; fetch origin and rebase before each milestone; S1 compares with origin's v3. The hot spots: the end of `STAGES`, `stageOpen`, `setupWorld`, `buildMoonCaves`, `mcGeoOut`/`mcNetGeo`. |
| 6 | A guest on the wrong moon | Start-message number, the (v, moon, tag) early-return test, the refusal; S5 tests exactly this. |
| 7 | A short table row (a THIN size) | The pick uses `row.length`; the wire carries the number; a number past the end refuses. |
| 8 | **The furnace is the same in most moons** and holds no rooms from 8 a side up | Said plainly (3.4, question 1); it is v3's furnace there. |
| 9 | **The first cave is sparse** (11-21% of its floor empty on average, worst plans 30%+) | Foot halls, natural filler and stretch reduce it; V0's renders show it; R11's line is re-set from the real planner. |
| 10 | The natural rooms' footings were not flown; the polar chart widens everything above the bed | V2's flight check is run on built pieces in the polar chart; the 112 px clearances are radial and exact. |
| 11 | Crowds in single-file rooms (Crawl, Wriggle, Dumbbell, Breakdown crest) and a 128 px Vug bowl at 15 a side | The squeeze rationing rule R14 (V0), measured in V8a; evidence only. |
| 12 | The paper numbers do not carry to the real planner | V0 re-measures and the director re-sets thresholds before V1; the table is made once, at V9, on the real planner. |
| 13 | The review is skipped or rushed (the table frozen on the lead's say alone) | The tag stays `p0` until the owner says yes to the 3 sheets; `p0` moons print a console line; the release check applies. |

---

## 11. Process notes

- **Feature freeze.** Memory says no new big features after Capture the Flag unless the owner's message contains "pipis". The owner's request is a rebuild of an existing, in-progress map and nothing in it adds a mode or a fighter, so I have treated it as in scope; **the lead should confirm**.
- Nothing in this spec uses the live relay, a browser, a test suite, the prize fighters' names or any word drawn in a match. Computer game only; multiplayer means online.
- I did not run a CPU, play the geometry, time any drawing or build a generator. Walk times, line counts and every pass rate are estimates and stand-ins (6.6).
- **Vocabulary** (so the two meanings of "natural" never meet in code): a **natural room** is one of the eight (`form` in the sampler); a room **at home** in a cave (`home`, the first spec's confusing `nat` flag) is one with affinity `+`; the **signature** is the cave's defining room. Designer 3 asked to rename `nat`: done here.
- **Not on paper and so not in the pass rates**: R14 (squeezes rationed, natural spread N5), the hot clock on a furnace bed, the cracks and pores, the surface variants' flights beyond designer 3's, the tall Vug (not in the library).

---

## 12. Questions

Recommendation first in every list.

**For the owner** (the answers you gave are not asked again):

1. **The furnace.** (a) **As built**: at 2 to 7 a side at most two small rooms (Hot Plates and one natural room) in the free floor beside the poles; from 8 a side up (8, 10, 15) the furnace is as it is today. (b) Change the furnace's cracks (two wide cracks on the axis, the same total width) so it has longer free floor and can hold more: this changes the knock-out geometry and I would want your play first. (c) Make the furnace's stones natural (a one-stack Reef): a new recipe to design and fly, after V2. You said "most of the furnace" natural: with rooms, (a) cannot do that.
2. **Map Size on Moon Caves v4.** (a) **v4 ignores it** (one fixed set needs one fixed moon size; Compact and Huge stay a v3 thing). (b) Keep it with uncurated moons on the other discs. (c) A table per Map Size (672 moons).
3. **2 to 6 a side have only 6 casts** (one middle cave: galleries first, tunnels and furnace last are fixed). (a) **Leave it** and accept that those moons differ in one cave plus rooms and shapes. (b) Let a 4-cave moon drop "tunnels over the furnace" so two middle caves are drawn (30 casts): this changes an answer you gave.
4. **The Hot Plates never appears from 8 a side up** (no free floor wide enough). (a) **Accept**. (b) From 8 a side the whole furnace flares as a wave running round the ring: this changes "the furnace as in v3".

**For the lead** (defaults I chose; change any and I will redo the affected rows):

5. Freeze at V9 (after every room exists), not at V0: **yes**. 6. A line on the result screen naming the moon: **yes**; a host-only lobby row to pick a moon: later. 7. R key keeps the moon, a rematch draws a new one: **yes**. 8. Build all 14 rows though 7, 9, 11-14 a side are not reachable: **yes**. 9. Surface natural rooms (open Reef, open Breakdown, no share target): **yes**. 10. The tall Vug (claims the cave above): **no**. 11. The tunnels' signature a natural room: **yes**. 12. Online right after V1 instead of V8b: **optional**, as noted.

---

## 13. Files

All in `C:\Users\carad\Aardvark\smash-island\smash-bal\reports\moon-caves-v4\`.

- **This spec**: `v4-spec-r2.md`. The first spec `v4-spec.md` and every older file are kept untouched.
- **Owner pictures (r2, paper planner)**: `curate-sheet-r2-4.png`, `curate-sheet-r2-10.png`, `curate-sheet-r2-15.png`. The natural family: `natural-sheet.png`, `natural-rooms.md`, `natural-chambers.mjs` (the recipes: **the source of `MC4_NAT`**), `natural-tools/`.
- **r2 paper tools, `v4-spec-tools/`**: `plan-sampler-r2.mjs` (the planner stand-in with 28 kinds, the score, every sensitivity run), `curate-r2.mjs` (the curation, the table, the veto), `curate-sheet-r2.mjs` (the sheets). Outputs: `plan-sampler-r2-results-300-seeds-8-tries.txt`, `plan-sampler-r2-results-14-sizes-200-seeds.txt`, `plan-sampler-r2-results-extra-sensitivity.txt`, `curate-results-r2.txt`, `moon-table-r2.json`, `moon-table-r2-literal.txt`. The old `plan-sampler.mjs`, `curate-sampler.mjs`, `curate-sheet.mjs` and their outputs are kept (`curate-r2.mjs` imports `fnv`, `moonId` and `discGroups` from `curate-sampler.mjs`; `curate-sheet-r2.mjs` the rasteriser from `why-samey-tools/lib.mjs`).
- Run, from `v4-spec-tools/` (plain node; below-normal priority; at most two at a time):

```
node plan-sampler-r2.mjs --seeds 300 --sizes 4,7,10,15                        # every table of 6.6 (about 13 minutes)
node plan-sampler-r2.mjs --seeds 200 --sizes 2,3,4,5,6,7,8,9,10,11,12,13,14,15 --only on
node curate-r2.mjs                                                            # 14 sizes, 1,200 candidates each (about 17 minutes); --cands, --dmin, --vcap, --detail
node curate-sheet-r2.mjs --sizes 4,10,15
```

---

## Appendix A. What `mcPlan` must expose, and a row of `MC4_DISC`

**A row of `MC4_DISC`** (one per side 2 to 15, taken once from `mcGen` at N = 2 x side, k = 1, by a V0 tool and frozen): `{ side, K, tops[0..K], crustBot, shellTop, shellBot, cracks (2 or 6), quarterPx[0..K] (integer arc of each cave's quarter from its pole to the strip margin, in px: 3,594 / 2,777 / 2,179 / 1,359 / 624 at 2 to 5 a side), bays[] (the furnace's free floors in px from the pole: 474 at 2 to 5 a side) }` plus the global size numbers of 7.1. Values for all 14 sizes are in `v4-spec-tools/discs-headers-N2-30.json`; the quarter pixels and bays are printed by the r2 sampler's formulas (`asin(350 / r)`, a margin of 60 px, `crackHalf` 150).

**The plan record** (so the curation tool, the renders and the hash run on the real planner unchanged; `mcPlanDump()` returns it): `K`, `kinds[]` (surface first), `shapes[]` (surface first), `rooms[]` each with `arch`, `orient`, `open`, `hc`, `wc`, `verb`, `foot`, `w`, `h`, `c` (cave), `q` (0 north quarter, 1 south), `claimed` (a hall's upper part), `form` (natural), `pole` (straddles a pole), `home`, `sig`, `u0`, `u1` (px from the quarter's pole), `seed` (a natural room's roughness) and `links[]` each with `type`, `c`, `lat`; plus a score (`S`, the eleven components, `hard[]`). The adapter is `loadPlanner()` in the curation tool: it boots the monolith in jsdom (as `dump-disc-headers.mjs` does) and calls the pure functions; because `mcPlan` is integer-only the numbers do not depend on the machine.
- 2026-11-11 S4 follow-up PARKED: the S4 job could not reproduce V9's stuck counts with its own harness (excursion 0/2, net 19/47 vs V9's 4/24); V9's harness definition is in the session scratchpad v9\ folder. Next try: rerun V9's exact harness and log node/goal/hop per window.
