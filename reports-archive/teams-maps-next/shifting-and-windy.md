# Teams big maps: SHIFTING ISLES and WINDY HEIGHTS (design, 2026-11-12)

Design only. No game code was changed. Owner go word given ("pipis", "make them cool!"), so the builder may start from this without an approval wait; previews still go to the owner first, and both maps stay HIDDEN behind a switch until the owner has seen them (as Dream Island and Yoyle Needle do).

Sources read: reports/teams-big-maps-design.md (all owner rules), the Dream Island and Yoyle Needle rows of smash-bal/docs/LEDGER.md (2026-11-10 and 11-11), and the stage code in artifacts/V1/index.html (STAGES rows `shift` and `wind`, SHIFT, WGUST, stbShiftApply, stbWindPush, gustState).

## Rules both maps obey (from the owner's notes)

- Islands are hand-shaped CLUSTERS OF BLOCKS with SIDE SHELVES on their faces, a ragged underside with hanging ledges, and a small cave. No plain slabs floating in a grid.
- A PLACE with landmarks you know at a glance, not "a bunch of showy platforms".
- NOT mirrored. Four different bases, balanced by ROLE (high bases have the high ground; low bases get more exits, cover and nearer rewards, and are harder to camp).
- Every base has 2 or more exits. With 2 or 3 teams the unused bases are neutral ground (no spawns).
- Nothing drawn that looks usable but isn't. Every ladder, rope, sail and ledge in the art is a real platform or is drawn dim and flat in the background layer.
- Less clutter: about one feature per screen, spread over a bigger map.
- A mover only where it gives an edge a static piece can't (timing, a moving vantage point, a route that opens and closes). Movers never vanish; they move. Some wide gaps are crossed ONLY by movers.
- Fall damage as on Dream Island: none under 1.0 screen-height of drop, then scaled, cap 15%, dust burst and number as the tell. The sea or the sky below is still a lost stock.
- 4 seed variants per size, picked per match from the match seed (same for host and guests). Maps grow NOTICEABLY with players and MAP SIZE by adding content, not by stretching.
- Size: the generic Teams size plus 10% on each axis (diSize), MAP SIZE honoured. Reference at 8 players Normal: about 7500 x 3400 design px.
- Steps between static pieces at most 130 design px up (CLIMB_REACH, the weakest jumper's reach used on Yoyle Needle). Mover-only gaps 420 to 500 px. Shuttle movers: round trip 240 frames (4 s), flush with what they join at both ends, never under a platform (nobody is crushed).
- Token chests: capped per match, not farmable, existing token pay path.

---

# PART 1: SHIFTING ISLES

Stage identity to keep: sandy rock (sky #f3e3c8 to #c9a97a, ground #8d7a5c, void #c79a66 to #3a2412). Two forms, 60 s each. Form A is one wide floor under a wide roof (a "table"); form B is two islands with a gap and a diamond of three ledges over the gap. 3 s before a switch the ground shakes, the edges to come glow, and a low tone plays. Platforms slide and carry whoever stands on them. Nobody is ever crushed (a fighter inside closing rock is set on top).

## Concept 1: THE FAULTLINE (recommended)

A broken desert mesa standing on a fault. Big rock PLATES slide along the fault once a minute between two docked places. In form A the plates dock low and make one long causeway across the middle (the "table"). In form B the causeway pulls apart into a rift and the plates dock high instead, making a route across the top (the "diamond"). So the shift does not just move things: it decides whether the LOW road or the HIGH road is open this minute.

## Concept 2: THE COMBINATION LOCK

A ring of island blocks turns one notch round a central rock every minute, like a safe's dial, so each base faces a different neighbour each minute. Cool to look at, but: every base's neighbours change (hard to learn, hard for CPUs), a ring is close to symmetrical (the owner does not want that), and a turning ring carries fighters long distances with no choice. Not picked. One piece of it is kept: the dial look is used for the hourglass landmark.

## Recommended: THE FAULTLINE

### Layout (8 players, Normal, about 7500 x 3400; x left to right 0..100, y top to bottom 0..100)

```
 y
 0  ...............................................................................
10          [N1 Watch Butte]                                        (E1 outer:
            ##########  <top                    ~kite-less sky~      Fossil Shell)
20          ####==####--shelf     P2 docks here in B      [N2 The Arch]   ####
            ####  ####        ......[P2]......          ####======####   ##
30   (W1    ####cave##   gap  :  high dock   :   gap    ###  arch  ###
     outer: ####  ####--      :..............:        --###        ###--
40   Oasis)   ##  ##    <shuttle S1>   [HOURGLASS]   <shuttle S2>  ##
     ####               top bulb room  ( X )  neck                     gap
50    ##    gap                        ( X )  bottom bulb room               
          ============[P1]======[KEYSTONE]======[P3]============   <- CAUSEWAY (form A)
60   [L1 Quarry]######    ^plates dock low in A; in B they    ######[L2 Sunken Temple]
     ###########--        slide out/up and leave THE RIFT       --##|room|room|##
70   ###cave####     ___________RIFT (open in B)___________      ###|room|hall|##
     ####  #####--   \   UNDERCROFT (dark, always there)  /   --####  ####
80     ## ledges      \___side door__  pit  __side door__/        ledges ##
                            (S1 outer: Caravan Wreck, reached by plate P4 only)
90  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~ void / blast line ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
100
     0        15        30        45   50   55        70        85        100  x
```

Proportions: bases are block clusters 14 to 18% of the width each. The middle band (x 30 to 70) holds the causeway, the hourglass and the rift. High bases sit with their tops at y 12 to 20; low bases with their tops at y 58 to 62. The two low bases are 40% of the width apart; the two high bases are 45% apart. Outer effect islands sit 6 to 9% outside the square of bases.

### The four bases and their roles

| Base | Where | Role | Strength | Weakness (so it is fair) | Exits |
|---|---|---|---|---|---|
| N1 Watch Butte | top-left, tallest | High ground, lookout | Sees and drops onto the left half; one narrow top | Tall and thin: only 2 shelves wide, its top is 1.2 screens from the upper blast line so up-throws KO sooner; no cave heal; far from the crates | 3: east shelf (to shuttle S1 / to plate P2 in form B), west block steps down to the Oasis side, a drop hole through its cave to the Quarry's roof |
| N2 The Arch | top-right, a rock arch | High ground, two-sided | Base on top of the arch, plus the hollow under it as a second floor | The hollow under the arch is open from both sides (cannot be walled off); an attacker can come from under | 3: west shelf (S2 / P2), the arch's hollow down to the Temple roof, east steps to the Fossil Shell stones |
| L1 Quarry | bottom-left, wide stepped pit | Low ground, the crossroads | Widest base (hard to camp: 4 entries), a cave with a small heal spring, first onto the causeway in form A | Looked down on by N1; nearest to the rift when it opens | 4: causeway east, the Undercroft's west side door, hanging ledges round to the Oasis stones, block steps up toward N1's shelf |
| L2 Sunken Temple | bottom-right, half-buried ruin | Low ground, the fort | Real rooms with walls (cover from above), a roof to fight on, nearest to the Hourglass's bottom room | Rooms have doors on two sides, so it can be entered from two ways at once; fewest sky routes | 3: causeway west, the Undercroft's east side door, a roof hatch up toward the Arch's hollow |

Role balance in one line: the high bases start with height but are thin, exposed to the top line and far from rewards; the low bases are wide, covered, have the dark back road (the Undercroft) and own the causeway minute.

### Routes

Static routes (always there, every fighter can make them):
- N1 down to L1 (block steps and the drop hole), N2 down to L2 (the arch hollow and the hatch): each high base to the low base under it.
- L1 to L2 by the UNDERCROFT: a dark tunnel under the middle with a side door at each end and a quicksand patch (glue zone) in its middle pit. It is the slow, safe, low road that exists in both forms.
- Each base to its nearest outer island by block steps (variant decides which).

Routes the shift opens and closes:
- Form A (joined): the CAUSEWAY is whole from L1 to L2 through the Keystone. Fast low road. The high bases have no way straight across (only the shuttles to the Hourglass's top).
- Form B (split): plates P1 and P3 have slid outward and up and now dock as shelves beside the high bases; plate P2 has slid down to hang between them; with the Hourglass's cap they make the DIAMOND, a high road N1 to N2. The causeway is gone: in its place THE RIFT, an open hole with the Undercroft as its floor (a drop of about 0.9 screens to the Undercroft's roof ledges, over 1.0 into its pit: fall damage if you jump in carelessly).

Mover-only gaps (no static way across that gap; other routes elsewhere stay):
- S1 and S2: the gaps between each high base's shelf and the Hourglass's top bulb (about 460 px). A stone shuttle crosses each, 4 s round trip. In form A this is the high bases' only quick way to the middle.
- P4, the ferry plate: the Caravan Wreck (bottom outer island) is reached only by plate P4, which rides the shift (see below). No stones lead there.

### Set pieces, and exactly what each does

1. THE HOURGLASS (centre landmark, a stone frame with two glass bulbs, taller than a screen). The top bulb and the bottom bulb are small rooms; the neck is a one-body-wide drop hole from the top room to the bottom one (down only). The sand drawn inside the glass is the match's shift timer (full top at the start of a form, empty at the switch). The sand is behind the glass in the background layer and is never a floor. The frame's stone cap is a platform (the top point of the diamond in form B).
2. THE KEYSTONE (the causeway's middle block, under the Hourglass). In form A it is the bridge's centre and holds an item spawn. In form B it splits down its crack into two halves that slide 240 px apart with the plates and become the rift's lips.
3. THE PLATES P1, P2, P3 (the shift itself). Each is a block-cluster island about 700 px wide with one side shelf. They are the "three platforms" of the small stage, grown up. P1 and P3 slide on slanted fault tracks (low and inner in A, high and outer in B); P2 slides vertically (high above the Hourglass in A as the wide "roof", lowered to diamond height in B).
4. P4 THE FERRY PLATE. A smaller plate under the map. Form A: docked at the Quarry's lowest ledge. Form B: docked at the Caravan Wreck. Ride it over at the shift, loot for a minute, ride it back at the next. Or jump on late and wait. This is the "route that opens and closes" in its purest form.
5. COMPASS STONES. A carved stone at every plate dock with an arrow. During the 3 s tell the arrow of the place a plate is ABOUT TO LEAVE glows red and the place it will ARRIVE glows gold with a ghost outline of the plate's edges (the stage's own "edges to come glow", at map scale).
6. THE UNDERCROFT. A dark cave (the Search Party veil, a lit patch round each fighter) under the middle. In form A it is a roofed tunnel. In form B the roof is gone in the middle and daylight falls in a shaft: the middle 30% is lit, the ends stay dark.
7. SANDFALLS. Two thin falls of sand off the high bases' inner faces. A float zone: inside one you sink slowly and take no fall damage. The honest way down from a high base without steps. Drawn as moving sand; it is a real zone, so it is "usable and is".
8. FOSSIL RIBS. A giant ribcage on the Arch's east side; each rib is a soft platform, a real climbing column up to the Fossil Shell stones.
9. Outer effect islands: OASIS (heal pool), FOSSIL SHELL (shield/armour: less knockback for 10 s), CARAVAN WRECK (the main crate source), and on Tall and Huge a fourth, THE CAIRN (two-plate token chest, capped per match).

### How the shift scales up fairly

- Clock: the stage's own. 60 s per form, a pure function of hazardT. The match opens in form A (as the stage does) with nothing moving.
- Tell: 3 s (SHIFT.tell 180). The low tone plays for everyone wherever they are; the screen shakes lightly for everyone; compass stones and ghost outlines glow at the docks; a small hourglass chip in the HUD pulses for the last 5 s so a fighter far from any dock still knows.
- Move: plates slide over 90 frames (longer than the small stage's 60 because they travel 400 to 600 px). Riders are carried. A plate's path is through empty air only; its destination box holds no static platform. Anyone inside the destination box when a plate arrives is set on top of it (the stage's own no-crush rule).
- Fair by time: the low road (form A) helps the low bases; the high road (form B) helps the high bases; each gets the same 60 s in turn. Form A is first, and the low bases are the ones that give up height, so the first minute going to them is part of the role balance.
- Fair by place: both low bases touch the causeway at the same distance from the Keystone; both high bases are the same shuttle-ride from the Hourglass top. The bases differ in shape, not in distance to the middle.
- Nobody loses a stock to the shift alone: the rift's floor is the Undercroft (fall damage at most, cap 15%), not the void. The void is only at the map's outer edges and under the ferry's crossing.
- Respawns: on the team's own base, never on a plate.

### Growth (content is added; counts are targets for the builder)

| Match | Size (about) | Plates | Shuttles | Outer islands | Extra content |
|---|---|---|---|---|---|
| 4p Compact | 5400 x 2600 | 2 (P1, P3; the Hourglass cap is the roof) | 1 (to the top bulb from the nearer high base; the other high base gets block steps) | 2 (Oasis, Wreck) | Undercroft is one room |
| 4p Normal | 6000 x 2850 | 3 | 2 | 3 | Sandfalls, Fossil Ribs |
| 6p Normal | 6750 x 2850 | 3 + ferry P4 | 2 | 3 | Temple gets a second room row; Quarry a second step tier |
| 8p Normal | 7500 x 3400 | 3 + P4 | 2 | 3 | Undercroft gets side chambers; each base one more shelf tier |
| 8p Tall | 7500 x 4000 | 4 + P4 (P5 is a vertical plate between the Arch and the Temple) | 3 | 4 (the Cairn, high) | A second storey on the Watch Butte; a deeper Undercroft level |
| 8p Huge | 8700 x 4600 | 5 + P4 | 3 | 4 | TWO fault groups: the west plates shift on the minute, the east plates on the half minute, so something shifts every 30 s while each place still changes once a minute; a mid-height neutral mesa between the two middle screens |

More than 8 players: as 8p Huge with one more shelf tier per base and a second ferry (to the Oasis).

### The 4 seed variants (per size)

| Variant | Name | What is different |
|---|---|---|
| V0 | High Noon | The layout above. Oasis = heal, Shell = shield, Wreck = crates. Day. |
| V1 | Aftershock | Plate tracks swapped: P1 and P3 slide sideways (flat) and P2 slants, so the diamond leans toward N1's side and the causeway's gap opens off-centre under N2's side (the two tilts balance). The stepping stones to the outer islands are replaced by a second ferry. Shell and Oasis swap effects. |
| V2 | Long Shadows | Dusk to night over the match (LIGHTS OUT in the last third). Glow crystals on every plate and dock; the tell's glow is the brightest thing on the map, so the shift is read by light. Undercroft floods ankle-deep (water zone) instead of quicksand. |
| V3 | Mirage | Left-right swap of the base ROLES (Butte top-right, Arch top-left, Temple bottom-left, Quarry bottom-right) with the middle band rebuilt rather than flipped (Hourglass stays upright, ferry starts at the Temple). The match opens in form A but the first form lasts 30 s. A heat-haze band at mid height is art only (background layer, no gameplay). |

### Night and hazard ideas

- Night (V2, and optional on Huge): Search Party veil; plates and docks carry crystals that light a patch; the Hourglass's sand glows, so the timer is visible across the map at night.
- Quicksand in the Undercroft's pit (glue zone): slows a camper, never kills.
- Loose rubble on the rift's lips for 2 s after a split: three small blocks drop from each lip (5% and a small pop if they land on a head, with the shake as the tell). Lead's default: OFF in V0, ON in V1 only.
- No damage zones, no instant-KO hazards: the shift is the hazard.

### CPU routing notes

- Build two navigation graphs at map build: GA (form A) and GB (form B). Bases, Undercroft, outer steps and shuttle edges are in both. Causeway edges are A only; diamond edges are B only; the ferry edge is a "ride at the switch" edge.
- From the start of the tell (3 s before) to the end of the slide: a CPU does not START an edge that will not exist after the switch; a CPU standing on a plate stays on it and rides (stops walking, may still fight); a CPU on the causeway's middle third walks to the nearer plate or base.
- Shuttle edges: wait at the dock until the shuttle is within 40 px, step on, ride, step off (the Dream Island crane logic).
- Edge braking: use the look-ahead by speed from the Yoyle Needle fix (stgBrain) at every plate edge and rift lip, on every CPU path.
- CPUs avoid jumping into the rift from the lip unless the drop to the ledge under them is under 1.0 screen (no self fall damage).
- Honest limit: the Huge two-group shift makes four graph states (AA, AB, BA, BB). Build all four; do not interpolate.

### Online-sync notes

- Variant: from the match seed and the size, no Math.random in the builder. Guests rebuild the same geometry (add the map's keys to the geo whitelist, as yn/yd were).
- Plate, Keystone and ferry positions are pure functions of hazardT and the variant: nothing extra rides the snapshot. A guest joining late or after a hitch applies the current positions with no sound (the stbNetIn path).
- Shuttles are ordinary STG movers (already synced generically).
- Rubble (V1) is on the clock too: fixed blocks at fixed frames after a split.
- Token chest state and crate spawns ride the snapshot as on Dream Island.
- No live relay in any check; offline host/guest sync only.

### Lead's defaults chosen (Shifting Isles)

- lead's default chosen: bases never move; only plates, the Keystone and the ferry do.
- lead's default chosen: 60 s per form on every size; Huge staggers two groups by 30 s.
- lead's default chosen: the match opens in form A (low road), full 60 s, except V3 (30 s).
- lead's default chosen: plate slide 90 frames; tell 180 frames; HUD hourglass chip for the last 5 s.
- lead's default chosen: the rift drops into the Undercroft (fall damage), not into the void.
- lead's default chosen: 2 teams use N1 and L2 (one high, one low, diagonal); 3 teams add L1; N2 is the last filled. Unused bases are neutral.
- lead's default chosen: rubble only in V1; no other damage hazard.
- lead's default chosen: hidden behind SI_TEAMS_OPEN = false with an owner preview key (localStorage 'bfsi:sidev'), like DI and YN.

---

# PART 2: WINDY HEIGHTS

Stage identity to keep: pale sky (#cfe6f7 to #8fb6d6), grass (#88a86a), clouds below. A long BRIDGE, high on the left, low on the right: a solid tower at the left, a walkway of solid slabs stepping down to the right to the only real floor, a few ledges above and one under the middle, open sky under the rest. A gust every 10 s: 1 s of streaks and a rising tone, then 2 s of push on everyone (ground 1.2, air 1.7 px a frame, less than a walk), sides alternating.

## Concept 1: THE LONG SPAN (recommended)

One enormous old bridge running down from a lighthouse tower on a peak to a meadow on a cliff, broken in places, with a village hanging under its high end and a windmill standing over its low end. The wind is the same wind, but at this size it becomes something you play around: walls give shelter, kites rise on every gust, and you can see the gust coming as a front that sweeps across the map.

## Concept 2: WEATHERVANE PEAKS

Four separate peaks round a giant weathervane; a team that holds the vane's crank chooses which way the next gust blows. Cool on paper, but it hands the stage's hazard to whichever team is ahead (the winning team blows the losing team off), it loses the "long bridge" identity, and four peaks round a centre is the Dream Island shape again. Not picked. Kept from it: windsocks and vanes as the wind's tell at every base.

## Recommended: THE LONG SPAN

### Layout (8 players, Normal, about 7500 x 3400)

```
 y
 0  ..........................................................................................
     [H1 BEACON]                (kites K1 K2: rise 260 px in every gust)
10   lamp room <top                 /k\      /k\                       [H2 THE MILL]
     ##|room|##                                                    vanes  \ | /   <mill cap
20   ##|room|##==DECK 1==                                         (turning) --O--   ####
     ##|stair|#          ==DECK 2==   pylon A                             / | \  ##|loft|##
30   ##|room|##--                  ====      BROKEN SPAN                         ##|room|##
     ##  ####        (lee under    ||   <-- gondola G1 on its cable -->   pylon B ##  ####--
40   ####  ##         the deck)    ||  ==DECK 3==                 ==DECK 4==        rock
       |  nets  |                                 ( 480 px gap, mover only )   ====  pillar
50   [L1 SWALLOWS' NEST]            OLD BRIDGE (ruined lower level, 6p and up)   ==DECK 5==
     hut--plank--hut--plank--hut      ==   ===    ==      thermal T (in gusts)        ====
60     hut      crate deck                                                          ==DECK 6==
       ledges under                                  (S outer: the Balloon,                 \
70                                                    tethered, bobs)              [L2 THE MEADOW]
                                                                              ######################
80   ~~~~~~~~~~ clouds / open sky ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~     ##barn##  hay  ######
                                                                              ###cellar#############
90                                                                              ## ledges ##
100
     0        12        25        38        50        62        75        88        100  x
```

Proportions: the bridge's deck falls from y 22 at the Beacon to y 62 at the Meadow, in 6 solid spans (each 9 to 12% of the width, as thick as the small stage's slabs), stepped, not sloped. The Beacon tower is 10% wide and 40% tall (its small-stage proportions). The Meadow is the only real ground, 24% of the width. The Broken Span is at 45 to 52% across. The Nest hangs at y 48 to 66 under decks 1 and 2. The Mill stands on a rock pillar at x 80 with its base floor at y 22 to 32, above deck 5.

### The four bases and their roles

| Base | Where | Role | Strength | Weakness (so it is fair) | Exits |
|---|---|---|---|---|---|
| H1 The Beacon | top-left, the lighthouse tower | High ground, the fort | Walled rooms (full wind shelter inside), the high end of the bridge, the lamp room on top | 9% from the LEFT blast line: a gust to the left is dangerous on its open top and on deck 1; one stair inside (a choke); far from the Meadow's crates | 3: deck 1 east, the stair's foot door onto the Nest's planks, the lamp-room balcony to kite K1 |
| H2 The Mill | upper right, a windmill on a pillar | High ground, the perch | Looks down on decks 4 to 6 and the Meadow; the vanes are its moving doorstep | Small floor (two rooms and a cap); the only static way in is the pillar's block steps from deck 5, so it is easy to leave and hard to hide in; open cap in every gust | 3: pillar steps down to deck 5, a vane ride over to deck 4 or up to the cap, a drop from the loft door onto the hay (no fall damage on hay) |
| L1 Swallows' Nest | under the high end, a hanging village | Low ground, the maze | Full wind shelter (the deck above and the tower beside it are its lee), many small huts and planks (hard to camp: 4 entries), nets under it catch one fall | Closest to the bottom line; huts are small (no room for big fights); the long way to the Meadow | 4: the Beacon's foot door, a rope-net climb to deck 2, the Old Bridge east (6p and up; planks to pylon A's foot otherwise), the crate deck's ledges down and round to the Balloon stones |
| L2 The Meadow | bottom-right, the cliff field | Low ground, the home field | The only wide solid ground, a barn (shelter) with a cellar heal spring, the hay cart, the nearest crates | Fully open to the wind outside the barn; 8% from the RIGHT blast line; everything on the map looks down on it | 4: deck 6 west, the pillar steps toward the Mill, the cellar's cliff-face door onto the under-ledges, the cliff path to the thermal and the Old Bridge's east end |

Role balance in one line: each base has exactly one bad gust direction (Beacon and Nest: left; Mill and Meadow: right, by their edges), high bases get height and a small footprint, low bases get shelter or width, more exits and the heal.

### Routes

Static routes: the bridge itself from the Beacon to the Meadow EXCEPT the Broken Span; the Beacon's inside stair to the Nest; the Nest's net climb to deck 2; the Old Bridge under the middle (a ruined lower span with jumps, 6p and up) from the Nest's east hut to the cliff path; the pillar steps from deck 5 to the Mill; the Meadow's cellar door to its under-ledges.

So there is always a wind-free low way across (Nest, Old Bridge, cliff path) and a fast exposed high way (the deck), joined in the middle by a mover.

Mover-only gaps:
- THE BROKEN SPAN (480 px, between pylon A and pylon B on the main deck): crossed only by gondola G1 on its cable. 4 s round trip, flush with the deck stubs.
- THE MILL'S VANES: four vane platforms on a circle (the Yoyle gear mover, mv.ph2), one turn in 8 s. A vane passes deck 4's end at the bottom of its turn and the Mill's cap at the top. It is the only way from deck 4 straight up to the cap, and it keeps moving (a vantage point that moves).
- KITES K1, K2 (see the gust section): the only way from the lamp-room balcony across the sky to pylon A's top, and from there to the Balloon line. They are low and still between gusts, and high during one.

### Set pieces, and exactly what each does

1. THE BEACON (landmark: a striped lighthouse). Four stacked rooms with a soft-platform stair column (real, climbable), solid outer walls with one door per floor on the east. Rooms are lee in both gust directions. The lamp on top is a light source at night (see night).
2. THE BROKEN SPAN and GONDOLA G1. A wooden cage with an open top on a cable between two pylons. Holds three bodies side by side. Its cable is drawn thin in the background and is not a platform; the pylon tops are.
3. KITES. Diamond kite platforms (soft, 150 px wide) on strings tied to posts. Rest height: 90 px above the post. In a gust (either direction) they rise 260 px with the gust's ease curve and lean 60 px downwind, then settle. They never vanish. At rest they are a small step; in a gust they are a lift to the high perches. The string is background art.
4. THE MILL (landmark). Vanes as above. Inside: a loft and a room. The loft's east door opens over the Meadow's hay cart.
5. HAY CART (Meadow). Landing on it: no fall damage and a small bounce (bounce zone). A fixed thing; it is how the Mill team and anyone thrown from above lands safely.
6. THE BARN (Meadow). Walls on the west and east, open doors: lee in both directions inside. A cellar under it with a small heal spring and a door onto the cliff's under-ledges.
7. SWALLOWS' NEST. Five huts (8p Normal) hung on chains under the deck, joined by planks; a rope net at the east end is a real soft-platform climb to deck 2; a catch-net under the middle hut is a wide soft platform (the last thing between you and the clouds).
8. THE THERMAL (under the Broken Span, beside the Old Bridge). A column 260 px wide where air rises ONLY while a gust blows (the vents' updraft from Yoyle Needle on the gust clock). A fighter blown off the middle can steer into it and be lifted back to the Old Bridge's height. Tell: the cloud tops under it bulge upward during the lead-in.
9. THE BALLOON (bottom-middle outer island). A hot-air balloon tethered below the bridge; its basket and the ring round its top are platforms. It bobs slowly up and down 120 px (20 s). Holds the crates. Reached by stepping stones from the Nest's crate deck or by a kite, by variant.
10. WINDSOCKS and the BEACON'S VANE. One at every base and pylon. They always point the way the NEXT gust will blow; in the lead-in they snap straight and flutter. Art plus information; nothing to stand on (thin, in the background layer).
11. Outer effect islands: THE BALLOON (crates), CLOUD PERCH above pylon A (shield, reached by kite), EAGLE'S LEDGE on the cliff face under the Meadow (heal on the small sizes where the cellar spring is absent), and on Tall and Huge THE AIRSHIP moored past the Mill (token chest, capped).

### How the gust scales up fairly

- Cadence and strength: the stage's own (WGUST: every 600 frames, 60 lead, 120 push, ground 1.2, air 1.7). Still less than a walk; it can always be fought.
- THE FRONT: on the big map the gust is a front that enters at the upwind edge and sweeps across at 80 px a frame (about 1.5 s to cross 7500 px). A fighter at x feels the lead-in and the push delayed by its distance from the upwind edge. You see the streaks and bent grass coming. A pure function of the clock and x.
- Direction: alternating left and right, as on the stage, so over any 20 s the wind is even. Each base has one bad direction; no base has two.
- SHELTER (new, and the heart of the team version): the builder marks LEE boxes for each direction (inside the Beacon's rooms, the barn, the Mill's rooms, the Nest under the deck, behind each pylon for the side it blocks). In a lee box the push is 0. Streaks are not drawn inside lee boxes and the windsock there hangs limp, so shelter can be read at a glance.
- EXPOSED boxes: the Beacon's top, the pylon tops, the Mill's cap, the kite line. Push x1.3 (air 2.2), still under half a walk.
- Fair use of shelter: every base has at least one lee room big enough for the whole team; every base also has one exposed fighting floor. No lee box touches an item or effect spawn (you must step into the wind for rewards).
- Wind-driven pieces (kites, the thermal) work in BOTH gust directions, so no side is favoured.
- Nobody is KO'd by the wind alone from a base floor: every base floor's downwind end has a 40 px lip block or a wall on its bad side. The open decks do not: the bridge is where the wind kills.

### Growth (content is added)

| Match | Size (about) | Deck spans | Movers | Nest huts | Extra content |
|---|---|---|---|---|---|
| 4p Compact | 5400 x 2600 | 4 | G1, 1 kite, vanes | 2 | No Old Bridge (planks from the Nest to pylon A's foot); Eagle's Ledge heal; Balloon |
| 4p Normal | 6000 x 2850 | 5 | G1, 2 kites, vanes | 3 | Thermal; barn |
| 6p Normal | 6750 x 2850 | 6 | G1, 2 kites, vanes | 4 | OLD BRIDGE lower level; cellar under the barn |
| 8p Normal | 7500 x 3400 | 6 | G1, 2 kites, vanes, the Balloon's bob | 5 | Cloud Perch; a second room row in the Beacon |
| 8p Tall | 7500 x 4000 | 6 | + G2 (a vertical basket lift from the Old Bridge up to pylon B) + 1 kite | 6 on two levels | Beacon one storey taller; the Airship (token chest); a cliff cave under the Meadow |
| 8p Huge | 8700 x 4600 | 8, with a SECOND broken span | + a second gondola + 2 kites | 7 | A third pylon with a watch-hut (neutral shelter mid-bridge); the Old Bridge runs the whole length; a second thermal |

More than 8 players: as 8p Huge plus one more hut row and a longer Meadow with a second barn.

### The 4 seed variants (per size)

| Variant | Name | What is different |
|---|---|---|
| V0 | Fair Weather | The layout above. Gusts left, right, left, right. Balloon reached by stones. |
| V1 | Kite Festival | Twice the kites (a kite line from the Beacon to the Mill over the whole bridge: a full sky route that exists only in gusts, with rest posts between). Gust pattern left, right, UP: every third gust is an updraft (2 s of 1.7 px a frame upward in the air, 0 on the ground: longer jumps, higher kites). Balloon reached only by kite. No thermal (the updraft gust replaces it). |
| V2 | The Old Road | The Broken Span moves to between decks 2 and 3 (near the Beacon) and the Old Bridge is rebuilt as the main low road with its own short gondola; the Mill's vanes turn the other way; Cloud Perch and Eagle's Ledge swap effects. |
| V3 | Storm Night | LIGHTS OUT. The Beacon's lamp sweeps a beam round every 12 s: everyone in the beam is visible to all for that moment. Each gust's lead-in is a lightning flash that lights the whole map for 20 frames (the tell and a free look at once). Thermal on. Wind numbers unchanged. |

### Night and hazard ideas

- Storm Night (V3) as above. The beam and the lightning are on the clock.
- Loose planks on decks 3 and 4: as Dream Island's breakable bridge (a heavy landing knocks a plank out; it grows back in a few seconds). Lead's default: only on the two spans beside the Broken Span, and only on Normal and bigger.
- No rain slip, no damage zones. The wind is the hazard.

### CPU routing notes

- One static graph plus mover edges (gondola: wait, step on, ride; vanes: step on at the bottom, off at the top; kites: usable as a climb edge only from the start of a lead-in to the end of the push).
- BRACE: from the start of the lead-in (as felt at the CPU's own x, front delay counted), a CPU on an exposed or plain deck within 200 px of a downwind edge walks upwind or into the nearest lee box; a CPU in the air steers upwind. In a lee box it does nothing special.
- A CPU does not start the gondola, a vane or a deck-edge jump during a lead-in or a push unless it is fleeing.
- A CPU blown off the middle steers to the thermal column while it runs (V0, V2, V3) and to the catch-net under the Nest.
- CPUs count the gust as a throw helper: prefer throwing an enemy downwind during a push (same rule for all CPUs; this is not a difficulty change).
- Edge braking by speed (the Yoyle Needle stgBrain fix) on every deck end, with the wind's push added to the speed it looks ahead with.

### Online-sync notes

- Variant from the match seed and size; no Math.random in the builder; geometry keys added to the geo whitelist; guests rebuild the same map.
- The gust (direction, front delay, ease), kite heights, the thermal, the beam and the lightning are pure functions of the shared clock (gustState with the map's numbers) and x: nothing extra in the snapshot.
- Lee and exposed boxes are static geometry built on both sides; the push is applied by each side from the same clock, as stbWindPush is now.
- Gondolas, vanes, the Balloon's bob and the basket lift are ordinary STG movers (already synced).
- Loose plank state and crate/chest state ride the snapshot (the Dream Island plank path).
- No live relay in any check; offline host/guest sync only.

### Lead's defaults chosen (Windy Heights)

- lead's default chosen: NOT mirrored in any variant: the high end is always on the left (the stage's identity). Variety comes from moving the Broken Span, the kite line and the effects.
- lead's default chosen: gust numbers unchanged (10 s, 1 s lead, 2 s push, 1.2 ground, 1.7 air); exposed boxes x1.3; lee boxes 0.
- lead's default chosen: the gust is a moving front at 80 px a frame on every size.
- lead's default chosen: no team can change the wind (no lever, no crank).
- lead's default chosen: the updraft gust only in V1; the thermal in V0, V2, V3.
- lead's default chosen: 2 teams use H1 Beacon and L2 Meadow (the two ends of the bridge, the stage's own shape); 3 teams add L1 Nest; H2 Mill is the last filled.
- lead's default chosen: kites and the gondola cable/strings are background art; only the kite sail, the cage and the pylon tops are platforms.
- lead's default chosen: hidden behind WH_TEAMS_OPEN = false with an owner preview key (localStorage 'bfsi:whdev').

---

## For the builder (both maps)

- Order: geometry and art preview first (whole-map pictures of the 4 variants, the 4 bases, the signature moment: mid-shift / mid-gust), owner sees it, then mechanics, then CPU routes.
- Fairness is measured, not assumed: win share and time alive per base position (the owner's measure), per variant. Knobs if a base is off: exits (add or remove one), the lip blocks, shelf count, distance to the nearest effect island. Never the fighters, never CPU difficulty.
- Checks that fit the current rules (no test suite): build, boot, hidden check (ordinary Teams map while the switch is off), spawns on own base on every team setup, every static step within 130 px, every mover flush at both ends, offline host/guest geometry equal, then show the owner.
- Neither design has been built or measured. Sizes, counts and distances here are targets; the builder should report where the real numbers differ.
