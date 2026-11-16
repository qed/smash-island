# Moon Caves v4: the spec

Written 2026-11-02 by the design director, from `why-samey.md` (the analyst), `library-1.md` (designer 1, 16 chambers by verb), `library-2.md` (designer 2, structure, identities, landmarks), `moon-caves-design.md` and `mcGen` (`artifacts/V1/index.html`, build `ii-dlc`, Moon Caves v3). Plan only. Nothing in the game was edited, committed or pushed, and nothing was built; the only things I ran are two throwaway paper checks (section 5.5), copied to `v4-spec-tools/`.

The owner's words (2026-11-02): "I need you to rebuild the caves of the moon, to make them less samey. ai seems to be bad at making things less samey."

---

## 0. The short version

- **Why it is samey.** The generator makes one shape (a ring tube cut by a 220 px stair-hole at an exact pitch) and then varies numbers inside it. Nothing in it can tell that every layer looks alike, because nothing compares one piece to another.
- **What v4 is.** The inside of the moon becomes solid rock with rooms carved in it, planned like a floor plan: 20 different kinds of room, joined by 8 kinds of passage, in a graph that is a different shape in different districts. The old "layers" stay only as districts (they give gravity, kind and mood).
- **What stops it drifting back.** A planner that must place variety first and fill second, a plan score with hard rules that fails a samey plan, a second check on the real geometry (the analyst's screen measure, redone on the shape of the open air), and a picture of every moon for the owner. On paper the rules pass 100% of plans within 8 tries; with the rules off, 0% pass; v3 read as a plan scores 20-27 out of 100.
- **How it ships.** Ten small milestones behind a switch. v3 stays the moon everybody plays until the owner has looked at the renders, played it, and says flip.
- **What I need from the owner:** ten questions in section 7, recommendation first.

---

## 1. Diagnosis, in my words

The analyst's eight causes boil down to five. Everything below is measured in `why-samey.md` unless I say it is mine.

1. **One room, repeated.** A layer is a tube about 260-420 px high running all the way round, cut by a stair-hole every 1,070 px at an exact pitch (20.0 degrees at 10 a side). At 10 a side the galleries layer is 14 copies of one unit; 54% of its screens have a 99% twin. Six places on it are one picture. You have met the whole layer in about 3 seconds.
2. **The passages are the furniture, and they are the same.** 72% of the non-rock pieces on the 10-a-side moon are stair steps. Every hole is 220 px, every crack 260 px, every flight 3 or 4 steps of 14 px. Even where rooms differ, the way from one to the next never does.
3. **The designed variety is dead code.** The stairs reserve so much arc that 0 of 32 galleries runs can hold a piece; the furnace's stones are gone at 10 and 15 a side; 24 of 26 spring runs are one 100 px pad. The generator cannot show what it contains because passages and rooms are not planned on one budget.
4. **A "kind" is a floor effect, not a place.** Ice, springs, belts, water and updrafts are zones painted on the same flat ring. Rings alone predict a layer's screens to within 0 to 12 points. Nothing is vast, nothing is a squeeze, nothing is a slope, a drop, a maze or a bridge.
5. **Nothing measures sameness, so nothing can resist it.** (This one is mine.) Each layer was varied by picking a pattern from a hash, and the generator never looks at the finished set. That is exactly the shape of failure the owner describes: an AI varies the parameters inside a template, each piece looks fine alone, and the set is samey. The cure has to work on the set: vary the kind of place, force the difference across neighbours by rule, measure the result, and show it to a person.

Smaller causes that v4 also fixes: 1 to 5 a side build the identical moon (the seed fixes it); `flooded` never appears at any size (the cast fixes it); the bottom one or two layers have no public door (kept for the furnace, see Q10); the mirror halves the unique content (kept: it is the fairness guarantee).

---

## 2. The structure

### 2.1 What it is, in plain words

**The inside of the moon is solid rock. Rooms are carved out of it, joined by passages, like the floor plan of a building.** There are no concentric rings any more. At one angle the rock may hold one huge hall from the third floor to the roof; ten degrees on it may hold three low tunnels stacked. Between rooms is rock at least 100 px thick.

Four kinds of thing:

| Thing | What it is | Where it comes from |
|---|---|---|
| **Room** | One place from the library of 20 (section 3): its own shape, size, roof, floor and verb | the planner picks it |
| **Link** | A passage between two rooms (or from a room to the one above or below): a door, a squeeze, a ramp, a hatch with a plank under it, a stair-hole, a bounce pad under a hole, an updraft, a belt ramp, a drain, a one-way chute | the planner picks it from the passages that district's kind owns |
| **District** | A depth band, the old "layer". It gives the **kind** (galleries, springs, ice and so on), **gravity** (low in the upper half, normal below, as now) and the **mood** | depth, and the cast |
| **Home** | Each team's safe strip: 700 px wide through every depth, with its lifts and pads, exactly as in v3 | unchanged |

### 2.2 What stays exactly as it is

The disc size from the number of players; the number of districts from the depth; the chart physics and the camera; the safe strips, their lifts, pads and three hop-tops; the shell, the cracks, the core and both KO radii; the furnace's hot floor; low gravity above the half-way depth and normal below (`mcGravAt`); mirror symmetry about the 12-6 line; items on floors; no words drawn in a match. The surface is still one unbroken lap: it is the long way round and the sure route.

### 2.3 What replaces `mcGen`

`mcGen` (about 240 lines) is replaced, for v4 only, by a **planner** (`mcPlan`, pure, seeded, integers only) and a **builder** (`mcBuild`, turns a plan into the same kind of pieces `mcGen` makes: annular boxes, one-way planks, slope steps, zones). v3's `mcGen` stays in the file, untouched, as the default and the fallback.

The planner, in order:

1. **Size.** As v3: radius from the player count, number of districts from the depth.
2. **Cast.** The caves' kinds: galleries first, the furnace last, the tunnels directly over the furnace from three caves up, the middle drawn by seed without repeats from springs, columns, ice, updrafts, mines and flooded. Never ice next to flooded, never springs next to updrafts (both slow or throw you the same way).
3. **Graph shape per district.** Cycle through four shapes so neighbours always differ: **LAP** (a walk all the way round, both poles through), **SPLIT** (rock plugs at both poles: two half-chains, one per team), **BRAID** (a lap plus a second parallel route over a stretch), **FAN** (rooms hang off hub rooms with three or more links). The surface is always LAP; the first cave is never LAP; at least one cave is LAP so the teams can meet underground.
4. **Obligations first.** Each cave one **natural** room for its kind (its signature room if it fits). The moon one **squeeze** (the Crawl) and one **vast** room (the Cathedral or the Chimney). The surface its north pole room (the Crater) and south pole room (the Flat, a deliberate blank). Rooms that are not their own mirror image are placed first, at the strip end of a quarter.
5. **Fill.** Each district's two quarters (12 o'clock to the strip, strip to 6 o'clock) from the pole toward the strip, deepest district first. Every pick must pass the rules of section 5.1 as it is placed. **A tall room claims the same angles in the districts above it** (a hall: its roof is in the district above; by default a one-way bridge at the old floor line keeps the district above walkable, see Q7), and **dresses as the district its roof is in**.
6. **Links.** A lateral link between neighbouring rooms, and ways up so that no stretch of a district is 2,400 px or more without one (a plan with a stretch over 3,000 px is rejected). Each link's type comes from the passages that district's kind owns (section 4).
7. **Test and retry.** Score the plan (section 5.2). If it fails, try seed + 1, up to 8 times. If all 8 fail, build v3's moon for that match and log the seed (the sweep must show this never happens).
8. **Build.** Rooms are subtracted from the rock mass (sweep by angle, one box per rock span), planks and slopes are added, the left half is the right half mirrored (chirality flipped for ramps, belts and ledges), pole rooms are their own mirror image.

Everything is placed on the right half and mirrored, as in v3, so both teams have the identical moon. A planner decision never depends on a trig result (only on integers and pixel arithmetic), so a different browser cannot disagree with the host.

### 2.4 The route graph (CPUs)

v3's router knows holes between bands. v4 has a **room graph**: rooms and homes are nodes, links are edges, each with its angle, height, width, a down-only flag and its climbing steps if it has any. At build time the planner computes a **next-hop table** (room to room) once. `mcLayer` becomes "which room are the feet in" (a rectangle test in angle and radius); `mcRoute` and `mcPathCost` read the table; `mcRouteSteer` climbs a link's steps exactly as it climbs a hole's. The 4-second give-up, `mcCrowd` and the CPU's eyes are unchanged. A down-only link (the chute, a pore) is left out of every "up" route.

### 2.5 Online

The host sends the **plan** (integers: room kind, district, quarter, start px, width px, height px, floor offset, flags; roughly 2-3 KB) with a version tag, not the pieces. The guest builds from the plan with the same builder and checks the piece hash as it does today; a mismatch refuses to start rather than drift. This is smaller than the 4-8 KB piece list the design doc allows.

### 2.6 What "size buys new places" means

At 4 a side a half-moon holds about 14 rooms of 11 different kinds; at 15 a side about 24 of 16 (paper sampler, section 5.5). Bigger moons add districts and arc, and every room kind that fits (width at most 1.75 times its floor radius, roof under the crust) is available. 1 to 5 a side stop being the same moon because the seed picks the cast, the shapes and the rooms.

### 2.7 A paper plan (4 a side, passed on try 1, score 99.9)

Rooms from the 12 o'clock pole to the strip, with width in px, from `v4-spec-tools/example-plans.txt`. `*` is a hall whose roof is in that district.

```
0 surface   Crater(2183) + GrandStair(1768)  |  Flat(2105) + Span(809) + Chute(650)
1 galleries Geode(1301) + Attic(366)         |  Cathedral*(1703)
2 springs   Garden(1240) + Chimney*(157)     |  Cathedral(1703)     <- the hall's floor
3 tunnels   Attic(370) + Chimney(157)        |  Crawl(916)
4 furnace   HotPlates(968)                   |  Span(1035)          <- over the crack
            (north quarter)                     (south quarter)
```

At the south quarter you stand in a vast hall two districts high; at the north you walk past a crystal room, a pocket with a prize, and a bounce garden. The two quarters of one district do not match, and neither do two districts. This is a stand-in plan, not generator output.

---

## 3. The library: 20 chambers

I merged the two designers' lists. **Merged away:** the Well into the Chimney (a chimney may run through up to three districts), the Rift into the Span (a span over a cut in the crust), the Crown into the Crater, the Cauldron into the Hot Plates, the Knot into the Racetrack, the Sump into the Lake (the same room, ice or water). **Dropped:** the Stump Hall (the closest to v3, a flat floor with rocks; its pillars live on inside the Geode). **Invented by designer 1 and kept:** the Warren, the Crater, the Barricade.

Sketch files: `library-1.md` section 2 (designer 1's 16, numbered by his order; picture of all 16 at one scale in `library-1-sheet.png`) and `library-2.md` section 5 (designer 2's twelve landmarks). Both designers ran only paper checks; designer 1 flew a 48 px body through every sketch at normal and weakest jump, in both gravities, and found all 16 connected with nothing trapped.

"Cost" is what it asks of the builder: **small** is boxes and planks the generator already makes; **medium** needs a small piece of new data (a flag, a zone, a stash spot); **large** needs rooms that cross districts.

| # | Room | In two sentences | Size (px, along by up) | Kinds | Cost | Sketch |
|---|---|---|---|---|---|---|
| 1 | **The Crawl** | A low tunnel with a roof barely above a fighter's head, opening into a few small standing bays. You cannot jump in it, so every fight is flat and head-on, and a shot cannot be hopped. | 900-3,000 by 110-120 (bays 315 high, at most 700 apart) | tunnels, mines natural; columns, ice, flooded | small | l1 #2 |
| 2 | **The Chimney** | A shaft one body wide with small ledges alternating up its sides and walls you can kick off. Whoever is above hits down on the climber, so it is a race and an ambush, and a fall costs a long walk back, not a stock. | 150-190 wide by 700-1,300 (through up to 3 districts) | updrafts, mines natural; galleries, columns, tunnels, springs | medium | l1 #1, l2 #12 |
| 3 | **The Chute** | A thin one-way shaft cut down through a floor into a belly room far below, with no steps and no way back up. You dive in to escape or to ambush, and whoever waited below gets the first hit as you land. | shaft 120-160, 500-900 deep, belly 400-800 wide | mines natural; galleries, columns, tunnels, ice, flooded, surface | medium | l1 #9 |
| 4 | **The Cathedral** | One huge hall, at least 760 px high, with a ring of floating islands and a high pulpit in the middle. Fights happen in three layers of air at once, so air control and shots from above rule it: it is the big arena for 15 v 15. | 1,600-2,800 by 760-1,400 | galleries, updrafts natural; springs, ice, flooded, columns, mines | large | l1 #3, l2 #3 |
| 5 | **The Span** | A single plank across a gap with a drop on both sides and a catwalk hanging under the middle. You fight on a line you cannot sidestep, and being knocked off costs a walk back up (except over the core). | 700-1,400 across, 330-900 deep | galleries, columns, mines, furnace natural; ice, flooded, surface (a rift) | small | l1 #4, l2 #2 |
| 6 | **The Teeth** | A hall whose roof is a comb of rock teeth with a few short rocks on the floor. Every jump is a gamble because the roof is not where it was a step ago, and fights break into slot-sized duels. | 1,200-2,400 by 480-560 | columns, ice natural; galleries, flooded, furnace, mines | small | l1 #5 |
| 7 | **The Long Ramp** | A sloped road in a tube, climbing 300 to 700 px, walked up with no jumping. The high ground is real: shots from below hit the steps, and whoever is uphill hits down at whoever tumbles back. | 1,800-3,200 long, 240-300 headroom | tunnels, ice, mines natural; galleries, columns, flooded, furnace | medium | l1 #6 |
| 8 | **The Attic** | A tiny sealed pocket above a corridor with one hatch and a prize inside that refills on a timer, not while someone is in it. Going in puts you in a room with one door that someone can hold, so it is bait. | 280-420 by 180-250, hatch 120 | columns, tunnels, furnace natural; galleries, mines, flooded | medium | l1 #7 |
| 9 | **The Racetrack** | A ring of corridor round a solid block: two roads joined at both ends by short ladders, with a gap in the block to drop through (it replaces the tunnels' junction). You can always run round to flank, so it is for pincers and chases, and nobody stays pinned. | 1,200-1,800 by 600-700 | tunnels, mines natural; columns, galleries | small | l1 #8, l2 #10 |
| 10 | **The Grand Stair** | A staircase of uneven steps (36 to 108 px, uneven widths) climbing to a flat plateau in an open hall. You cannot sprint it, and the plateau is a king of the hill with a drop on the stair side (on the surface, a mesa). | 1,500-2,400 by 650-900, rise 300-450 | galleries, flooded, surface natural; columns, tunnels, furnace | small | l1 #11 |
| 11 | **The Sinkhole** | A pit in a corridor floor with a narrow neck, widening underneath, and a hidden side tunnel halfway down. Falling in is a trap, but dropping in on purpose and taking the tunnel lets you come out behind whoever guards the lip. | 1,100-1,400 by 400-700 | mines, flooded natural; galleries, columns, ice | medium | l1 #12 |
| 12 | **The Warren** | A block of six small cells in two storeys joined by doors and floor hatches, every cell with two ways in. You cannot see past walls, so a crowd splits into pods of two or three and every doorway is a fight. | 1,100-1,600 by 650-900 | tunnels, mines natural; columns, flooded | medium | l1 #14 |
| 13 | **The Barricade** | A wide hall split by one thick wall with three ways past: a low door, a window slit reached from firing steps, and a ridge along the top. It is the first room that sets one team against the other: breach the wall or hold the line. | 1,800-2,400 by 520-640, wall 180+ thick | columns, mines, flooded natural; galleries, springs, ice, updrafts | small | l1 #16 |
| 14 | **The Crater** | A bowl dug into the surface, about 240 px deep, with terraces round the rim and a small peak in the middle, open to the sky. Anyone on the rim is nearest to space, so the rim kills and the bowl is safe. | 1,800-2,800 wide | surface only (north pole) | medium | l1 #15, l2 #1 |
| 15 | **The Hot Plates** | A stretch of the furnace floor made of hot plates with cool stones between, flaring in a wave that runs round at about running speed (also the Cauldron round the south crack). You read the clock under your feet: run behind the wave, stop on a stone, go when it cools. | 900-2,600 by 450-600 | furnace only | medium | l1 #13, l2 #11 |
| 16 | **The Garden** | A bed of bounce pads on the floor and on ledges, the highest under a hole in the roof. Bouncing is how you travel here, up one level by chaining pads, and nobody gets hurt: it is the rest after a hall. | 1,100-1,500 by 380-420 | springs only | medium | l2 #4 |
| 17 | **The Geode** | A closed crystal room with two squeeze doors, two pillars for cover, a small healing pool and an item cache that refills every 25 seconds. With two doors it is never a dead end, so the prize is worth fighting for, not sitting on. | 1,200-1,400 by 330-350 | columns natural; galleries, mines | medium | l2 #5 |
| 18 | **The Lake** | A sheet of slippery ice, or of water that drags everyone, with an island in the middle, two shelves and one thin patch or drain that drops you a level. Ice makes your footing slide away; water slows every fight down, the one place in the moon that does. | 1,200-1,400 by 260-280 | ice, flooded only | medium | l2 #6, #9 |
| 19 | **The Aerie** | A tall hall where three columns of rising air lift you from the floor to the roof, with two stepping isles and a high perch holding an item. You ride the air instead of jumping, so it is a fight in the air, and the second big view of the descent. | 900-1,100 by 700-800 | updrafts only | medium | l2 #7 |
| 20 | **The Headframe** | A hall with three tiers of conveyor belts, each running the opposite way to the one below, up to a bridge. The way up is a treadmill staircase you can fight your way up, because belts push a third as fast as running. | 800-1,000 by 520-600 | mines only | medium | l2 #8 |

(l1 = `library-1.md`, l2 = `library-2.md`.)

**Invariants that are locked** (changing one needs the director and the owner): the Crawl's roof 110-120 px (the tallest fighter is 96 px); the Chimney's width at most 190; steps and ledges at most 110 px and walls on a floor at most 160 px (so the weakest jumper still clears them in normal gravity); every rock wall between two spaces at least 100 px (so a launch of about 28 px a frame cannot step over one); doors at least 108 high and 120 wide, hatches at least 120 wide (the largest fighter, size 2, is 96 px); the Teeth's tips at least 160 px over the floor with 60 px of air between a floor rock and a tooth; the Barricade's wall at least 180 thick (a swing is not stopped by rock in the engine, so thin walls are not cover); the Hot Plates' wave offset a quarter period; no room is a dead end except the Attic.

**Ranked by how different they are to walk** (designer 1's numbers, plus the footing rooms by their verb): Crawl, Chute, Chimney, Hot Plates, Cathedral, Span, Long Ramp, Crater, Aerie, Lake, Garden, Headframe, Attic, Teeth, Warren, Sinkhole, Geode, Barricade, Grand Stair, Racetrack. **The five least different** (the first to cut): Racetrack, Grand Stair, Geode, Barricade, Warren.

**Pairs that must not be neighbours** (the planner's axis rule enforces most): Long Ramp and Grand Stair, Chimney and Chute in a row, Span and Hot Plates, Attic and Warren, Teeth and Geode, Racetrack and Warren.

---

## 4. Identity for each kind

Each kind gets one **verb** nothing else has, a **footing** that changes what you can walk (not just the floor's effect), **passages it owns** (which is how the stairs stop being everywhere), a signature room, and a look. Place names are for planning only: no words are drawn in a match. Gravity stays by depth, so a kind may land in either half; rooms are built to the normal-gravity numbers (steps at most 110, walls at most 160), so they work in both.

| Kind | Verb | What changes underfoot | Passages it owns | Signature, natural rooms | Look (back wall, mood) |
|---|---|---|---|---|---|
| **galleries** (the Cloister) | hold the high deck | rooms with balconies on two or three decks; shots come from above | arches, balconies, stair-holes, ramps | Cathedral (its roof is here); Span, Grand Stair | warm slate, marble planks, banners, light shafts |
| **springs** (the Garden) | bounce | pads throw you; there are **no stairs at all**: up is a bounce chain or a hatch, down is anywhere | geyser (a pad under a hole), hatches, gaps | Garden; works with Chimney, Cathedral, Barricade | purple, giant mushrooms, cyan spores |
| **columns** (the Crystal Grove) | take cover | rock blocks shots; doors are squeezes at most 200 high | squeezes, hatches, ramps, stair-holes | Geode; Span, Teeth, Attic, Barricade | deep teal crystals, prism light, glints |
| **ice** (the Frost) | slide | slick floor except islands and shelves: momentum and long knockback; no stairs, only ramps | ramps (a luge), hatches, squeezes | Lake (ice); Teeth, Long Ramp. Never Chimney, Attic, Racetrack, Grand Stair | pale blue, frozen falls, icicles, snow |
| **updrafts** (the Aerie) | ride | air columns lift you; the tallest district; no stairs | draughts, hatches, gaps | Aerie; Chimney as an elevator, Cathedral | night blue, far floating isles, cloud wisps |
| **mines** (the Pit) | ride the belt | belts push a third of run speed; stairs become belt ramps | belt ramps (escalators), hatches, chutes | Headframe; the most welcoming kind: Crawl, Chute, Racetrack, Warren, Barricade | timber, rails, carts, hanging lamps |
| **flooded** (the Sump) | wade | water drags 13% a frame: knockback bleeds, jumps shorten, fights slow | drains, siphons, hatches, ramps | Lake (water); Grand Stair, Sinkhole, Barricade (a dam). Can finally appear | green-black, half-sunk arches, drips |
| **tunnels** (the Warren) | take the low road | the tightest district: roofs 105 to 250 px, flat shots; always directly over the furnace; no holes down | doors, squeezes, ramps | Racetrack or Warren; Crawl, Long Ramp, Attic | burrow mouths, roots, a stronger gloom |
| **furnace** (the Forge) | stay off the floor | the floor flares in a wave; the smallest ring, nearly all in view; no flank doors at 8+ a side (Q10) | the two lifts and the cracks | Hot Plates (and a Span over a crack); Attic as the one cool refuge | slag, pipes, embers, heat shimmer |
| **surface** (the Skin) | launch | open lap; the only place with space KOs; low gravity | ramps, bridges, the lifts | Crater (north pole), Flat (south pole); Grand Stair as a mesa, Span as a rift, Chute as a sinkhole, Chimney as a tower | regolith, boulder fields, a lander wreck, rover tracks |

**Where the kinds' scenery goes:** a drawn **back-wall kit** per kind (props fixed at build time from a hash, culled in view, no collision) and a **mood tint** eased over about 150 px as the camera crosses into a district, so the picture changes when you drop through a floor (designer 2's section 3.2 has the full table of colours and props). Optional, Q6.

---

## 5. Anti-sameness

### 5.1 The rules (the planner enforces each one as it places)

1. **Neighbours differ on at least 3 of 6 axes** (orientation: horizontal, vertical, diagonal, ring, pit, small, bowl; openness: sealed, closed, sky; height class: low under 150, mid 150-450, tall 450-750, vast 750 and up; width class: under 700, under 1,400, under 2,200, more; verb; footing). Rooms touching across a wall (above and below) differ on at least 2. (The vertical rule is not tested on paper.)
2. **No archetype next to itself; at most twice in a half; at most once in a district-half** except a pole room and its mirror.
3. **No twin widths:** two rooms of one archetype in a district differ by at least 8% in width.
4. **Obligations first, filler second:** each cave's natural room, one squeeze and one vast room per moon, the surface's two poles. The planner never "hopes" the variety turns up.
5. **Each kind owns its passages** (section 4). No passage type may be more than 35% of a moon's links; at least 5 types per moon. Stair-holes appear only in galleries, columns and the surface.
6. **All four height classes in a moon** (three at 5 a side and under), and room widths spanning 8:1, heights 6:1.
7. **Graph shapes cycle** (LAP, SPLIT, BRAID, FAN) so no two neighbouring districts share one; the surface is LAP and at least one cave is.
8. **The cast** (section 2.3 step 2).
9. **Fairness is not tunable:** the locked invariants of section 3, the strips and cracks kept clear, every room reachable from both homes, no stretch of 3,000 px or more without a way up, every down-only link has another way back.
10. **No loosening:** variety is added by adding or changing rooms, never by widening a number range inside one room. No builder may change a threshold; only the director and the owner.
11. **Unused arc** (rock plugs that are just empty) is at most 20% of any district-half. (Not measured on paper; V0 measures it.)

### 5.2 The plan score (computed from the plan, in the generator)

Computed on one half of the plan (the other half is its mirror): the list of rooms with their six axes, the list of links with their types, and the district shapes. Nine components, each clipped to 0-1:

| | Component | Formula | Target |
|---|---|---|---|
| C1 | Spread of kinds | distinct room kinds / min(20, rooms) | 0.8 |
| C2 | Neighbour distance | mean differing axes (of 6) over neighbouring pairs / 6 | 0.67 |
| C3 | Scale spread | min( ln(widest/narrowest) / ln 8, ln(tallest/lowest) / ln 6 ) | 1 |
| C4 | Irregular lengths | mean over district-halves with 3 rooms or more of (spread of room widths / mean width) | 0.45 |
| C5 | Passage variety | entropy of the link types / ln 8 | 0.75 |
| C6 | Verb spread | distinct verbs / min(14, rooms) | 0.85 |
| C7 | Shape variety | distinct district shapes / min(4, caves) | 1 |
| C8 | Signature and hall | share of caves with a natural room **and** a main hall (the biggest room by width times height is at least 1.5 times the median of the others, counting halls whose roof is there) | 1 |
| C9 | Height classes | classes present / 4 | 1 |

**Score** = 100 x the mean of C1 to C9. **A plan passes only if the score is at least 85 and none of these hard rules fails:** no kind more than twice in a half; none next to itself; every neighbouring pair differs on 3 axes or more; no twin widths; no passage type over 35%; no two neighbouring districts with one shape; all four height classes present (three at 5 a side and under); every component at least 0.5 (C8 at least 0.6). **The minimum is 85 plus every hard rule.** A score alone is not enough (5.5).

### 5.3 The screen check (computed on the real geometry, offline)

The plan score proves the *mix*; this proves what a player *sees*. The analyst's measure, redone on the shape of the open air instead of the whole silhouette (the silhouette is dominated by rock slabs, so it hides differences, see 5.5):

- A screen is the game's 1528 x 1024 px view (48 x 32 cells of 32 px) standing on a floor, taken every 128 px along every walkable route outside the strips.
- **J\*** = overlap over union of the **air cells** of two screens, best over a sideways slide of up to 192 px, against any other screen of the same district at least one screen width away.
- **Pass:** per district, mean best match **at most 65%**, and **at most 5% of screens** with a twin at 0.95 or better; per moon, **at least 18%** of screens are distinct (leader clustering at 0.75), and **at most 30%** have a twin at 0.95 or better across the whole moon.
- The analyst's tools (`why-samey-tools/`) re-measure a rebuilt generator; the air-cell variant is in `v4-spec-tools/screens-calibrate.mjs`. It runs at milestone checks, not in the game.

### 5.4 The render of every generated moon

- **Per moon:** a PNG with (a) the disc from above, rooms coloured by kind and numbered, strips tinted, cracks red; (b) the right half unrolled flat, rooms outlined, links marked by type, halls drawn through the districts they span; (c) a card: size, seed, try number, the score, C1 to C9, any hard rule that failed. Drawn by a small software rasteriser in plain node (the analyst's `lib.mjs`), never a browser.
- **Every moon a check run generates is rendered** into a contact sheet in `reports/moon-caves-v4/renders/` (at least 30 plans per milestone: sizes 2 to 15, 4 seeds each at 4, 10 and 15 a side) and the sheet is part of what the owner is shown.
- **Any moon can be re-rendered later** from its id: version, size, seed (a bug report from a match carries it). In a dev build `mcPlanDump()` prints the plan and score. No words are drawn in a match.

### 5.5 What I measured on paper, and what it does and does not prove

Two throwaway checks (`v4-spec-tools/`: `plan-sampler.mjs`, `screens-calibrate.mjs`, with their outputs and the input discs). **They are stand-ins**: a greedy planner, designer 1's grids for 16 of the 20 rooms (the Garden, Lake, Aerie and Headframe have no grid and are left out of the screen strips, which makes them less varied than a real moon), no engine, no play. They calibrate the minimum; they do not prove v4 plays well.

**Plan score, 300 seeds a size, v3 read as a plan (a room is the run between two shafts):**

| | 4 a side | 7 | 10 | 15 |
|---|---|---|---|---|
| **v3 as a plan: score** | 19.5 | 23.0 | 24.6 | 26.8 (fails 8+ hard rules at every size) |
| v4 rules on: median score | 97.0 | 95.1 | 96.7 | 97.4 |
| v4 rules on: pass on the first try | 83% | 49% | 62% | 69% |
| **v4 rules on: pass within 8 tries** | **100%** | **100%** | **100%** | **100%** |
| rules off (kind affinity only): median score | 82.0 | 84.3 | 87.6 | 91.4 |
| rules off: pass within 8 tries | 2% | 0% | 0% | 0% |
| rooms per half / distinct kinds (rules on) | 13.7 / 10.8 | 15.4 / 11.3 | 18.8 / 13.5 | 24.3 / 16.5 |

**Sensitivity (what each lazy change does to the gate), within 8 tries:**

| Change | 4 a side | 7 | 10 | 15 |
|---|---|---|---|---|
| library cut to 6 kinds | 92% pass | 16% | 39% | 31% |
| every passage a stair-hole | 0% | 0% | 0% | 0% |
| every room one scale | 19% | 0% | 6% | 5% |
| room widths not jittered | 100% | 100% | 100% | 100% (**not caught**) |

Honest reading: **a mean-score gate alone would pass a rules-off generator at 15 a side (median 91.4 against a minimum of 85); the hard rules are what fail it.** The gate catches a shrunken library at 7 a side and up (not at 4, where there are few rooms), a one-passage-type moon, and a one-scale moon. It does **not** catch "no jitter inside a room": widths still differ between kinds, and that is fine, because the variety is in the mix of rooms, not in a number range.

**Screen check, stand-in strips (10 a side, 12 seeds, one strip per cave district):**

| | within-district best match (mean) | twin 0.95 or better | distinct per screen at 0.75 | pooled twins (all caves) |
|---|---|---|---|---|
| v3's galleries unit repeated 14 times (same pipeline) | 100% | 100% | 3% | n/a |
| **v4 library strips, rules on** | **57%** | **0%** | **27%** | **21%** |
| library strips, rules off | 73% | 34% | 21% | 45% |
| (same strips, **whole silhouette** instead of air) | 77% / 84% | 0% / 35% | 11% / 9% | 25% / 50% |

The silhouette variant is shown to explain the choice: rock slabs make every screen look alike (77% even for different rooms), so the air shape is the one to threshold. The pass lines (65%, 5%, 18%, 30%) sit between the rules-on and rules-off rows. The first, second and fourth lines sit between the rules-on and rules-off rows; the third (18%) is set to fail v3 (3%), not to separate rules on from rules off (27% against 21%). **They are provisional:** they are measured on stand-ins, and V1 re-measures them on real generated geometry; if the *reference* fails, the director revises the measure, not the generator. (The sampler's Crawl roof is 95-115 px and the spec's is 110-120; both are the "low" class, so the score is unaffected.)

---

## 6. Milestones

Every milestone is **one small build job** (one cheap agent), hidden behind the switch `MC_V4` (off for everyone; set by a dev flag like `MCAVE_DEV`; the lead turns it on in the built-in browser pane for pictures; the owner can turn it on in their own browser). **v3 stays the moon everybody plays, released or not exactly as it is today, until V9.** Builder rules are the design doc's section 12: fetch origin and read `docs/LEDGER.md` first; `index.html` is CRLF, so Python load/save only with asserted match counts, never `sed -i`; a worktree under `smash-island/.worktrees` (not `g-moon`, which another session owns); no `node_modules` links, never `npx`; scripts at BelowNormal, at most one node process, explicit timeouts; never the live relay, never a browser launched by an agent; show the owner and ask before pushing. No tests are committed (the 2026-10-21 rule): the diversity gate is generator code, and every probe below is a throwaway script deleted afterwards.

**The five standing checks (every milestone, after its own):**

- **S1 v3 untouched.** With the switch off, the hash of v3's pieces (`mcGeoOut`) at 2, 4, 7, 10 and 15 a side equals the hash before V0, and a 30-second CPU match plays.
- **S2 v4 boots.** With the switch on, a 60-second CPU match plays with no errors, and the plan sweep still passes (14 sizes x 200 seeds, at least 99.5% within 8 tries, zero fallbacks to v3).
- **S3 mirror.** Every piece and zone has its mirror partner, or is its own mirror image (v3's 356 of 356).
- **S4 CPU navigation.** In the room graph every room is reachable from both homes and from the surface; a 3-minute CPU-only match at 4 and at 10 a side has no CPU stuck for 5 seconds or more (v3's run logged as the baseline); KO causes are counted (space, core, damage cap), as evidence, never for tuning.
- **S5 online.** An in-memory host and guest pair (never the relay): the guest's rebuilt moon equals the host's (plan and piece hash), a version mismatch refuses cleanly.

| # | Milestone | What ships | Lines (my estimate) | Checks besides S1-S5 |
|---|---|---|---|---|
| **V0** | Plan only (no geometry) | `MC_V4`; the 20-row room table (axes, size ranges, affinity, passages); `mcPlan` (cast, shapes, obligations, fill, links, retry); the score and hard rules; `mcPlanDump()`. Nothing draws; with the switch on the plan only prints | 450-700 | Sweep over sizes 2 to 15 x 200 seeds passes; deterministic (same size and seed twice gives identical JSON and hash); mirror; strips and cracks clear; roof under the crust; unused arc measured (rule 11). **Renders:** the contact sheet of 30 plans. **The owner looks at the plans.** |
| **V1** | Skeleton | `mcBuild`: the rock mass minus rooms, doors, planks; the boxes-and-planks rooms (Crawl, Span, Teeth, Barricade, Warren); every other room is a plain box of its footprint so any plan boots; the surface as v3's with the Crater missing; homes, lifts, pads, cracks as v3; the room graph, the next-hop table, `mcLayer` by room; `buildMoonCaves` uses v4 when the switch is on | 500-800 | **The screen check on real geometry; its reference numbers recorded and the pass lines confirmed or revised by the director.** Every wall at least 100 px. Real top-down and unrolled renders. The lead's pane pictures at 12, 3, 6 and 9 o'clock. |
| **V2** | Slopes and the surface | Long Ramp, Grand Stair, Crater (with its thick rock under it), Span as a rift, the Flat; uneven floors (a room's floor offset in 55 px steps, linked by a step of 110 or less or a ramp); the surface keeps v3's hop-tops on its plain stretches | 300-500 | Ramp walked with no jump (step-up of 24 px or less, `mcRampSnap` down); CPU through a ramp; the surface lap is one closed walk; a scripted launch from the rim and from the bowl: the rim is nearer to space by the depth. |
| **V3** | Up, down, hidden | Chimney (up to 3 districts), Chute, Sinkhole, Attic with its prize stash spot; the passage types hatch, pore, chute; a down-only flag in the router; staggered wall faces so each band is its own wall-jump face | 400-600 | A throwaway flight test (a 48 px body, the game's jump and gravity, stat 1 and the weakest jumper 0.85, both gravities) for every room's ports: all connected, nothing trapped; the chute one-way; 1,000 random routes never go up a down-only link; the prize refills only when empty. |
| **V4** | Halls and shapes | Cathedral with the claim rule and the bridge; Racetrack (with its junction); the hall rule in `mcGravAt` (inside a hall's box the lower district's gravity, so nobody changes weight in mid-air); SPLIT and FAN shapes built (pole plugs, hubs) | 350-550 | A scripted fall through the old floor line does not change gravity in the air; the bridge is one-way; shapes measured on the real graph (a LAP has a closed walk, a SPLIT has no path between the homes inside the district, a BRAID has an extra cycle, a FAN has a room with three links); the teams can still meet underground. |
| **V5** | Footing rooms | Garden (geyser passage), Lake (ice or water, with its drain), Aerie (updrafts), Headframe (belts), Geode (heal pool, cache), Hot Plates (plates as data with a phase; `mcHotFloor` reads them); the heal zone's drawing | 450-700 | Each footing on a test body at 12, 3, 6 and 9 o'clock; the plates' burn counted per crossing (evidence); items from fixed stash spots only; `hazardT` shared with the guest. |
| **V6** | Cast, identities, scenery | The cast by seed with its neighbour rules (flooded can appear); the kind-owned passage rule enforced; back-wall kits and the mood tint | 300-450 | A picture of every kind's district; no words; drawing time in the pane at 30 fighters no worse than v3 by more than 1 ms a frame. Optional per Q6. |
| **V7** | Online | The plan and a version tag in the geometry message; guest build from the plan; the refusal path | 100-200 | S5 in full: plan size under the snapshot budget; prediction error at 12, 3, 6 and 9 o'clock no worse than v3's. |
| **V8** | CPU hardening | SPLIT and FAN districts under `mcCrowd`; Warren crowds; the 4-second give-up; the chute and Crawl rules in the router | 150-300 | CPU-only 10 v 10, 3 minutes, twice, at 10 and 15 a side: no CPU stuck for 5 seconds or more; core KOs with no hit in the 3 seconds before under 15% of KOs; matches finish. Evidence only, never tuning for bots. |
| **V9** | Review and flip | The owner plays on the switch; the full render pack (4, 10 and 15 a side, 2 seeds each); on the owner's yes the default flips to v4 and v3 stays in the file for one release as the fallback | 20-60 | The release check: read the plan before unhiding anything (Moon Caves was once released at M1 by mistake). **Only the owner says flip.** |

Total about 3,000 to 4,900 lines, against `mcGen`'s 240: it is a rebuild, and I would rather say so than hide it. The cheaper path (Q1 B) is about 1,200 to 1,800.

**Where V0 to V3 go wrong first (watch these):** the planner not placing obligations (the paper sampler lost its signature rooms and its squeeze until the obligations were placed first); CPUs lost in a Warren; a prize camper in the Attic; a straight shot down the Chute or Chimney; the same room twice in a plan because a hall's claim was not counted (a bug my own sampler had).

---

## 7. Questions for the owner

Recommendation first in every list.

1. **Structure style.** (a) **A rock moon with rooms** (this spec): no rings, rooms carved from rock, 20 kinds, passages that differ, about 3,000-4,900 lines in 10 steps. (b) **Rings with landmarks** (designer 2's plan): keep the ring stack and add a dozen set pieces, halls and a scenery kit; cheapest, about 1,200-1,800 lines, but the ring stack stays. (c) **Hybrid:** rooms in the upper half of the districts, rings kept for the tunnels and the furnace.
2. **Which chambers.** (a) **All 20.** (b) **A core of 15**, dropping the five least different (Racetrack, Grand Stair, Geode, Barricade, Warren). (c) **A core of 12**: Crawl, Chimney, Chute, Cathedral, Span, Long Ramp, Crater, Hot Plates, Garden, Lake, Aerie, Headframe, so each kind has one signature and the generic set is small.
3. **The three risky rooms.** The Attic (a prize pocket someone could camp), the Barricade (a wall; the engine does not stop a swing at rock) and the Crawl (single file: a traffic jam at 15 a side). (a) **Keep all three with their guards** (a prize that refills only when empty, a 180 px wall, the Crawl only in the quiet districts). (b) Drop the Attic and keep the others. (c) Drop all three.
4. **The cast.** (a) **Drawn by seed** (galleries first, furnace last, tunnels over it, the middle varies, so `flooded` can finally appear). (b) **Fixed order as today** (always galleries, springs, columns, ice, updrafts, mines, flooded, tunnels, furnace; flooded never appears).
5. **Passages owned by the kind.** (a) **Yes**: springs have no stairs (bounce chains), updrafts only draughts, ice only ramps, mines belt ramps; this is what ends "stairs everywhere". (b) Stairs allowed everywhere as a fallback (safer for CPUs, more samey).
6. **Scenery.** (a) **A drawn back wall per kind plus a mood tint** when you drop through a floor (no words). (b) Flat colours as now; cheapest.
7. **How wild.** (a) **Medium:** a hall is bridged, so the district above stays walkable; some districts are SPLIT (the teams cannot meet in them but can on the surface and in a LAP cave). (b) **Wild:** a hall may cut the district above (routes go round, the graph breaks more). (c) **Tame:** every district a LAP, no splits.
8. **A different moon every match?** (a) **Seeded per match**, the id printed in the bug report so any moon can be re-rendered. (b) **A fixed set of 8 moons per size**, chosen from the best renders, so people can learn and name them. (c) One fixed moon per size.
9. **When v4 replaces v3.** (a) **After you play three matches on the switch and approve the render pack** (V9). (b) A separate stage entry "Moon Caves v4" beside v3 for a while. (c) Replace v3 outright after V6.
10. **Furnace doors at 8 a side and up.** (a) **Keep six cracks:** the furnace is reached by the lifts, as in v3, and stays the "place you ride down to". (b) Two wide cracks on the axis (780 px each, the same total width) so the furnace can have a public door; this changes the KO geometry and I would want your play first.

---

## 8. Process notes

- **Feature freeze.** Memory says no new big features after CTF unless the owner's message contains "pipis". The owner's request is a rebuild of an existing, in-progress map and nothing in it adds a mode or a fighter, so I have treated it as in scope; the lead should confirm.
- Nothing in this spec uses the live relay, a browser, a test suite, or the words of the OSC rule. Computer game only; multiplayer means online.
- I did not run a CPU, play the geometry, time any drawing, or build a generator. Walk times, line counts and the paper sampler's pass rates are estimates and stand-ins.

## 9. Files

- This spec: `reports/moon-caves-v4/v4-spec.md`.
- The three inputs: `why-samey.md`, `library-1.md` (+ `library-1-sheet.png`), `library-2.md` (+ its pictures `library-2-v4-n10-unrolled.png` and the rest).
- Paper checks, `reports/moon-caves-v4/v4-spec-tools/`: `plan-sampler.mjs` (the planner stand-in, the score, the rules-off and mutation runs), `screens-calibrate.mjs` and `chambers.mjs` (the screen check on library strips), the outputs `plan-sampler-results-300-seeds-8-tries.txt`, `screens-air-results.txt`, `screens-full-silhouette-results.txt`, `example-plans.txt`. Run from that folder: `node plan-sampler.mjs ../why-samey-data/discs-mcGen-v3.json 300` and `AIR=1 node screens-calibrate.mjs ../why-samey-data/discs-mcGen-v3.json 12 10`. They read only the v3 disc dump.
