# Next two Teams maps: THE TLC and FROZEN POND (design only)

2026-11-12. Design job, no game code. Written under the feature freeze; the owner gave the go word the same day (see section 4), so builders follow section 5 directly.
Follows every rule in `reports/teams-big-maps-design.md`. The short version of those rules, used as a checklist at the end of each map:

- a PLACE with landmarks, not a platform map; block-cluster shapes with side shelves
- 4 bases, NOT mirrored, balanced by ROLE (high bases get high ground; low bases are better in other ways and harder to camp)
- every team has 2+ exits; 2-3 teams play the same map with unused bases neutral
- nothing drawn that looks usable but isn't
- less stuff per screen; rooms of varied sizes
- a mover only where it gives an edge a static piece can't; movers never vanish; wide gaps that ONLY a mover crosses
- maze-like walls where the theme fits
- fall damage (1.0 screen, cap 15%), night / LIGHTS OUT
- 4 seed variants per size; the map grows NOTICEABLY with players and MAP SIZE by adding content, never by stretching
- at least as big as the generic Teams map (+10%), MAP SIZE honoured

Lore honesty: I could not look anything up for this job (no browser), so show details are from memory. The ones I am sure of: the Tiny Loser Chamber is the small steel box the eliminated contestants are flung into, Cake at Stake is the elimination ceremony, the Announcer is a speaker box, contestants were launched to the TLC by flinging machines, and the TLC was later kept inside the Locker of Losers. The machine names I use (Sender Scoop Thrower, Laser Powered Teleportation Device) are how I remember them: check the spelling before any name goes on screen. For Frozen Pond I do not remember one specific frozen-pond episode well enough to quote it, so that map leans on the stage's own identity plus safe BFDI winter things (snow, ice, a cliff, a fishing hole). If the owner has a scene in mind, question 6 asks.

---

# 1. THE TLC

## What the stage is today (keep this)
A steel bowl. Solid walls on both sides, stepped steel sides coming down to a low flat middle with a hatch in it. No side KO: a launch into a wall BOUNCES (half speed). You go out over the TOP (a lower top line than other stages) or DOWN THE HATCH. The identity in three words: steel, bounce, hatch.

## Theme and set pieces it should have
- The Tiny Loser Chamber made big: you are INSIDE the box where losers are kept. Riveted grey steel, bolts, warning stripes, air holes punched in the walls letting in shafts of light.
- THE LID: the top of the box. The only way out upward.
- THE HATCH: the only way out downward.
- Cake at Stake: the bleacher seats and the cake.
- The flinging machine that throws losers in (the scoop arm).
- The Announcer's speaker box (as a room: the control booth).
- Loser life inside: bunks, tally marks scratched on the walls (decoration on the wall face only, never shaped like a ledge).

## Concept A: "Inside the Chamber" (one giant sealed box)
The whole map is the inside of the TLC: one huge steel box cut open so we see its rooms. Sealed side walls that bounce, a steel ceiling that bounces too, and a sliding LID whose opening is the only top exit. A big central bowl (the original stage, grown) with the Big Hatch. Four bases are rooms in the box at different heights. Pinball in a prison.

## Concept B: "The Locker of Losers" (the cube in a cupboard)
The TLC is a cube in the middle of the map, standing inside the bigger Locker of Losers. Teams start OUTSIDE the cube on the locker's shelves (four corners) and fight over and into the cube: through its lid on top, a door in each side, the hatch underneath. Inside the cube is the bowl; outside is open locker space with shelves, coat hooks and the locker door's vent slats as a high route. KOs: inside the cube as today; outside the cube down the gap under the shelves.
- For: a clear "king of the cube" goal in the middle; two very different zones.
- Against: half the map (the locker shelves) is ordinary platforms in open space, which is the "generic platform map" the owner is tired of; the bounce walls only matter inside the cube.

## Recommended: Concept A, "Inside the Chamber" (with B's Locker as the outer shell on Huge only)
Why: the stage's whole identity is "sealed, bouncy, two ways out". A keeps that true on every screen. It also gives walls and rooms for free (the owner asked for maze-like walls where the theme fits: a prison box fits).

### Top-level layout (4 teams, 8 players, Normal)
Target size about 7500 x 3400 (the Yoyle Needle 8p Normal size; never under the generic Teams size + 10%).

```
 ceiling (steel, bounces)        THE LID slides on rails; its GAP is the only top KO
 ##########################[=======LID=======]      <-gap->      [=====LID=====]###########
 #  air holes (light)          |                                         |               #
 #  +-------------+            |        lid crane trolley (mover)        |  +----------+ #
 #  | N-W  LID    |~~~gap A~~~~|  ......o......................          |  | N-E      | #
 #  | LOFT (high) | (scoop arm |        |hook                            |  | CONTROL  | #
 #  | catwalks    |  only)     |        v                                |  | BOOTH    | #
 #  +--door---vent+            |                                         |  | (mid-hi) | #
 #        |                    |              open air                   |  +--door--+-+ #
 #   closet  closet            |          of THE BIG BOWL               ~~~gap B~~~   |   #
 #   (small) (small)       ____|                                         |____ (lift  |   #
 #        |            ___|bumper                                   bumper|___  only) |   #
 #  +-----+------+  __|   step                                        step   |__      |   #
 #  | S-W  CAKE  |_|  step          flat steel floor                    step   |_+----+-+ #
 #  | AT STAKE   door     =========[  BIG HATCH  ]===========              door  S-E     | #
 #  | (low, wide)|        |        |  (KO: down) |          |             | BUNKS (low,| #
 #  +--chute-----+--------+  crawl +-------------+  crawl   +-------------+ small cells| #
 #  #####  THE UNDERFLOOR: low service crawl, two small hatches (KO), padded pipe  ##### #
 ##########################################################################################
   side walls: solid, bounce 0.5 (as today).  No side KO anywhere on the map.
```

Where KOs happen:
1. OVER THE TOP: only through the lid's gap. Under the lid plate, a launch hits steel and bounces back down.
2. DOWN THE HATCH: the Big Hatch in the bowl's floor, plus two small hatches in the underfloor crawl.
That is all. Because a sealed box makes KOs rarer, the builder must MEASURE KOs per minute against the generic Teams map (Yoyle Needle once had 0% KOs) and widen the lid gap / hatch until it matches. This is the biggest risk of the map.

Routes and gaps:
- The Big Bowl is the middle and is big and EMPTY (one screen and a half of clear air, by design: "less stuff per screen"). Its stepped sides are the original stage's steps.
- Gap A (Lid Loft to the bowl's upper air) and gap B (Control Booth down to the Bunks' roof) have NO static crossing. Gap A is crossed only by the scoop arm, gap B only by the cage lift.
- Low bases reach the bowl on foot through a door at the bottom of the steps. High bases can always DROP into the bowl (fall damage applies) or walk down through the closets.
- The underfloor crawl joins the two low bases under the bowl (low headroom, never under 110 px so the tallest body fits; the owner's "low-headroom spots" problem on Yoyle must not repeat).

### The four bases (by role, not mirrored)
| Base | Height | What it has | What it pays |
|---|---|---|---|
| NW Lid Loft | highest | high ground over the bowl, catwalks, first on the scoop arm | closest to the lid gap, so it is the easiest base to be launched out of; smallest room; only 2 exits (door down, scoop) plus a vent drop |
| NE Control Booth | mid-high | the Announcer's booth: the LEVER that runs the lid (see set pieces); a window ledge over the bowl | walled in with one long drop side; a fall from it is fall-damage height; 2 exits (door, cage lift) + window |
| SW Cake at Stake | low, wide | bleacher steps (grippy, wide), THE CAKE (heal), 3 exits (door to bowl, chute to underfloor, back stair to closets), a steel roof so nobody can be launched out the top from here | next to the Big Hatch side of the bowl; enemies arrive from 3 ways |
| SE The Bunks | low, small cells | a little maze of bunk cells with PADDED walls (soft bounce: you stop instead of ping-ponging), 3 exits (door to bowl, underfloor, cage lift up), a locker of crates | cramped; the cage lift brings the Booth team straight down on top |

Low bases are "better and harder to camp": more exits, a roof against top KOs, the heal (SW) and the padding and crates (SE), and no line of fire from above (solid ceilings over both). High bases get height and the lid lever, and pay with being nearest the only top exit.
Fairness is checked the way Dream Island's is: win share and time alive per base position, all four within a few points of 25%, each variant.
2 teams: NW vs SE (diagonal). 3 teams: NW, NE, SW; the empty base is neutral ground with its set piece still working.

### Set pieces and exactly what each does
1. THE LID (the star). A huge steel plate on ceiling rails with ONE gap. It slides slowly (a full trip about 70 s), so the gap travels across the top of the bowl. Under the gap you can be launched out; under the plate you bounce back. It never vanishes, it moves. Edge no static piece can give: the danger zone and the safe zone swap places over time, so where you fight matters differently every half minute. A bright strip of daylight on the floor shows where the gap is right now (the tell). The Control Booth's lever reverses the lid for 10 s, then rests 25 s (same lever rules as Yoyle Needle).
2. THE SCOOP ARM (the flinger). A long arm with a scoop on its end, pivoting from the ceiling, swinging across gap A like a slow pendulum. Stand in the scoop to ride across. At each end of its swing it gives a small FLING in its direction (a clear wind-up tell): from the Loft end it tosses you onto the bowl's far upper step; from the bowl end it tosses you up to the Loft door. Edge: the only way over gap A, a moving vantage over the bowl, and a timed launch. Enemies can be knocked INTO the scoop and get flung too.
3. BUMPER PANELS. Yellow-and-black striped wall sections on the bowl's upper sides: bounce 0.9 instead of 0.5. A launch into one comes back nearly as fast, so it sets up a second hit, or sends the victim back across to the other bumper. Only in the bowl (4 panels), so the pinball is a feature of one room, not everywhere.
4. PADDED WALLS (Bunks only). Grey quilted wall: bounce 0.15. You thud and drop. Makes the Bunks a safe room to be hit in, which is its compensation for being low.
5. THE BIG HATCH. The original hatch, wider (about 3 bodies). Always open. Hazard stripes round it. Variant 2 adds a sliding COVER (below).
6. THE CAKE. On a table at the top of the bleachers in the SW base: stand by it 2 s to heal 15%, then it is "eaten" and comes back in 30 s (drawn as slices filling back in). Anyone can use it, so enemies raid it.
7. THE CAGE LIFT. One cage on a visible chain between the Booth (top) and the Bunks' roof (bottom), over gap B. Rides up and down on the clock, waits 3 s at each end. Edge: the only way over gap B without a fall-damage drop, and it carries a fight with it. Holds about 3 fighters.
8. THE LID CRANE. A trolley on the lid's underside with a hook hanging into the bowl's upper air. It rides WITH the lid. Stand on the hook plate to be carried under the gap edge: the highest perch in the map, and the riskiest (it is right under the exit). Edge: a vantage that travels and is dangerous on purpose. (Variants 0 and 3 only.)
9. AIR HOLES. Round holes in the outer walls. NOT routes: they are small (a third of a body), high up and drawn with bars across, so they cannot look like doors. They are the light source (shafts of light), which matters at LIGHTS OUT.
10. THE CLOSETS. Small solitary cells between the Loft and the Cake room (the small rooms of the "varied room sizes" rule): one body-and-a-half wide, a door each side. They are the walking route for high teams and a choke point.

### Seed variants (4 per size; each can also be flipped left-right as a whole)
- V0 "Roll call": the base map. Lid, scoop arm, lid crane, 4 bumpers, Big Hatch open.
- V1 "Cake at Stake": TWO cakes (the second on a cart on a rail along the bowl's flat floor, crossing the hatch on a little bridge-rail: the cart is a mover you can ride over the hatch, and the heal moves with it); bleachers extended round the bowl's left side; no lid crane; bumpers moved lower.
- V2 "Lockdown": the Big Hatch has a sliding steel COVER that opens and closes on the clock (a klaxon light tell 2 s before; it slides, it does not vanish; you can stand on it while shut); two sliding bulkhead DOORS in the closets on the same clock, so the walking route opens and closes; the lid gap is wider to make up for the hatch being shut half the time.
- V3 "Delivery day": a second flinger: the Teleportation pad pair (one pad in the underfloor, one on a ledge under the lid; step on, a 1 s beam tell, you arrive at the other; 6 s rest). The scoop arm swings faster. Crates arrive by dropping through the lid gap on a schedule (shadow tell on the floor), so the item spot moves with the lid.

### Growing with players and MAP SIZE (add rooms, never stretch)
Core scale fixed. Content is added as whole, different rooms:
- 4 players: the core above, but with one closet stack instead of two and the short underfloor. About 5800 x 2850.
- 6 players: + WEST ANNEX: the Laundry Chute (a tall narrow room, a zigzag of padded shelves, a chute down to the underfloor) and a medium "Visiting Room" split by a barred window you fight along but not through (a wall, drawn as a wall).
- 8 players: + EAST ANNEX: the Half-Bowl (a second, smaller bowl with one bumper and one small hatch: a second arena so 8 fighters are not all in one), joined to the Bunks by a door and to the Booth by a second short lift.
- 10+ players: + the Recovery Yard above the annexes: a long low gallery under the ceiling with a SECOND, small lid gap of its own.
- MAP SIZE Compact: one annex fewer than the player count would give. Normal: as listed. Tall: + an UPPER GALLERY floor (catwalk ring round the bowl under the lid, mover-only link: a second crane) and a deeper underfloor (the Drain: pipes, two more small hatches). Huge: Tall's floors + both annexes at any count + THE LOCKER: the outer shell (concept B's Locker of Losers) as a corridor ring between the TLC wall and the locker wall, reached through two real doors, with the locker's vent slats as a side route. The Locker ring is the one place with a different wall rule (thin tin: bounce 0.7, a clang).
Every added room is a different size and dressing (closet-small, medium, hall), per the "varied rooms" rule.

### Night / hazards
- LIGHTS OUT ("power cut"): the Search Party darkness (DARKK). In the TLC it fits perfectly: the lights fail on a schedule with a flicker tell. The lid gap's daylight strip and the air-hole shafts stay lit, so the exits are the bright places and the bases are dark. Bumper stripes glow.
- No day/night sky cycle here (you are indoors); the power cut is this map's "night".
- Fall damage: full on steel, none onto padded shelves or the bleacher cushions (drawn clearly soft).

### CPU routing notes (routing only; no CPU gets stronger in a fight)
- Reuse the Dream Island graph (diNodeAt with the 30 px lip, both-sides drop test, the "stuck 90 frames, feel your way out" rule, ferry wait over 150 frames blocks that edge for 500).
- Lid awareness: a CPU above about 90% treats nodes under the lid gap as costly and moves under the plate; below that it ignores the lid. The gap's x is a pure function of the frame, so this is cheap.
- Hatches: the stgBrain look-ahead (brake by speed and momentum, already built for Yoyle Needle) at every hatch edge; a shut cover in V2 is a normal floor node, an opening one (tell on) is not.
- Scoop arm and lift are graph edges that exist only while docked; the fling is a one-way edge to its landing node.
- Bumpers need nothing: the bounce is physics.
- Trips (diTrip): the cake when hurt, the lever when the lid gap is over the CPU's own base side, the crane as "high ground".

### Online-sync notes
- Lid, scoop arm, lift, crane, cart, cover and bulkhead doors are pure functions of the match frame (like STG movers and setupWorld): no state to send.
- State that is NOT the clock rides the snapshot the way Yoyle's `s.yq` does: lever pulled-at frame, cake eaten-at frames, teleport pad rest timers, crate drops taken.
- Variant and flip come from the match seed in the settings both sides already share; no Math.random in the build.
- Wall bounce uses the existing stgWallHit on the host's physics; ceiling bounce is the same call turned 90 degrees.
- Hidden behind its own switch (like DI_TEAMS_OPEN / YN_TEAMS_OPEN, with an owner preview key) until approved. All checks local: NEVER the live relay.

---

# 2. FROZEN POND

## What the stage is today (keep this)
A crater. The pond is the slippery bowl in the middle (you slide when you stop); solid stepped rims rise on both sides (a low step, then a tall block) with a ledge over each rim. Footing is normal on the rims: climbing out of the bowl is how you stop sliding. Open edges, a blue void. Identity: ice is fast and out of control, rock is slow and safe.

## Theme and set pieces it should have
- A real frozen pond in the snow: pale blue ice you can see into, snowy rock rims, pines with snow on them, breath-puff cold.
- A fishing hole (the pond's own "hatch").
- Cracks and thin ice.
- Open water with ice floes where the pond has thawed.
- A warm place: a campfire.
- Snow: banks, a snow fort, an igloo.
- A way up the cliff: a rope tow.
- Icicles.
(All winter things the show's world has; none needs a specific episode. Under-ice shadows of fish are background art INSIDE the ice only.)

## Concept A: "The Lake Valley" (wide, open, on top of the ice)
One great frozen lake, several screens wide, in a valley between a HIGH cliff rim on one side and a LOW shore on the other. Bases sit on the rims. The lake has a rock island, a thawed channel with floes, fishing holes. Fights happen out on the ice; everything is about sliding.
- For: very readable, very "frozen pond".
- Against: mostly one flat floor; little height; high bases would simply dominate; hard to grow without stretching the lake.

## Concept B: "Under the Ice" (two layers)
The ice sheet is a FLOOR for the top world and a CEILING for a blue ice-cave world beneath it. Thin-ice panels break under hard landings and drop fighters into the caves; cave chimneys climb back up. Bases: two above, two below.
- For: striking look (fighting under a glowing ceiling with shadows of the fight above), natural darkness below.
- Against: the cave half has no sliding, so half the map loses the stage's identity; two cave teams never see the sky.

## Recommended: "Three Ponds" (A's valley, stepped into terraces, with B's caves as the Tall/Huge layer)
A mountainside with THREE frozen ponds of different sizes at three heights, each a slippery bowl between solid rims (the stage's own shape, three times, never the same size). The rims between them are the grippy rock where bases and landmarks stand. This keeps "slippery bowl between solid rims" true everywhere and gives real height.

### Top-level layout (4 teams, 8 players, Normal; about 7500 x 3400)

```
  sky (top KO)                                                   pines
                         rope tow (mover, loops round two pulleys)
   N-W LODGE BLUFF  o===========================================o
   (highest, rock)  |\                                           \        N-E ICICLE SHELF
  ##########        | \           THE TARN (small, high pond)     \     (mid-high, under an
  ## cabin #__      |  \        ~~~~~~~~ice~~~~~~~~~~              \     overhang, icicles)
  #########   |_rim_|   \______|  (thin-ice patch)   |______        \   ______#############
  cliff face   shelves          rock rim          frozen fall        \_|  cave mouth      #
  (side KO     on the           (grippy)          (stepped ice)        | shelves          #
   beyond)     rock face                              |                |__________________#
        |                                             v
        |             ====== THE GREAT POND (big slippery bowl, 1.5 screens) ======
        |   snow                                                              snow
        |__ bank ~~~~ice~~~~~[hole]~~~~~~ ROCK ISLAND ~~~~~~~ice~~~~~[thin]~~~ bank __
   rim  |                    (KO: down)   (grippy, items)                           | rim
  ______|                                                                           |______
  S-W FISHING CAMP |                                                    | S-E SNOW FORT
  (low shore: dock,|   ~ ~ ~ THE THAW (open water: KO) ~ ~ ~ ~ ~ ~ ~    | (low: snow-wall
   huts, CAMPFIRE) |     [floe]->      [floe]->       <-[floe]          |  maze, igloo)
  _________________|   only the drifting floes cross this channel       |_______________
                         THE SKATING LANE (third pond: long, narrow, low)
                       ~~~~~~~~~~~~~~~~~~~~ice~~~~~~~~~~~~~~~~~~~~~~~~
   <- open edge (side KO)                                      open edge (side KO) ->
                              blue void below (bottom KO)
```

Where KOs happen:
1. Off the SIDES and the TOP as on the small stage (the outer rims end in open air). The cliff behind Lodge Bluff is the nearest side line of all.
2. DOWN: the fishing hole in the Great Pond, the open water of the Thaw, and off the open ends of the Skating Lane.
The typical KO: you are hit on ice, you keep SLIDING (the stage's rule), and you slide into the hole, the water or off the lane's end. Rims and snow banks are what stop you. That is the whole game of this map and it is different from every other stage.

Routes and gaps:
- The three ponds are the fast roads (slide = speed). The rock rims, shelves and snow are the safe roads (slow, grippy).
- The Thaw (open water, about 600 px) has NO static crossing: only the drifting floes. It separates the Great Pond from the Skating Lane.
- The gap from Lodge Bluff across to the far side has no static crossing either: only the rope tow.
- The frozen fall (a staircase of small ice steps) joins the Tarn down to the Great Pond: you can slide down it fast or climb it slowly. Steps, not a slope, and not a ladder.

### The four bases (by role, not mirrored)
| Base | Height | What it has | What it pays |
|---|---|---|---|
| NW Lodge Bluff | highest | a log cabin on bare rock (all grip), top of the rope tow, the long view | the cliff edge and side blast line are right behind it: the easiest base to be knocked OUT of sideways; 2 exits (rock shelves down, rope tow) + the cliff shelves |
| NE Icicle Shelf | mid-high | a ledge under a rock overhang (a roof against top KOs), next to the Tarn; icicles overhead that its defenders can drop on visitors | the icicles fall on its owners too; its floor is half ice (the Tarn's edge laps in); 2 exits (Tarn, cave-mouth shelves down) |
| SW Fishing Camp | low | THE CAMPFIRE (heal + warm boots), a dock out onto the Great Pond, two fishing huts with solid roofs, snow banks; 3 exits (dock, shore path to the floes, hut back door up the shelves) | on the pond's level, so sliders arrive fast; nearest the fishing hole |
| SE Snow Fort | low | a small maze of chest-high and full-height SNOW WALLS and an igloo (solid dome roof), first claim on the floes and the Skating Lane; 3 exits (gate to pond, back gate to the Thaw, a roof hatch in the igloo) | cramped; snow walls stop launches, which helps defenders and attackers alike |

Low bases are better and harder to camp: both have roofs (nobody rains hits from above), 3 exits each, the campfire (SW) and the wall maze (SE), and they are the only bases with grippy SNOW on the pond itself outside their gate. High bases get height and grip, and pay with the nearest blast lines (NW) and their own hazard (NE).
Checked by win share and time alive per base, per variant, as on Dream Island.
2 teams: NW vs SE. 3 teams: NW, NE, SW. Empty bases are neutral with their piece still working (the campfire is then anyone's).

### Set pieces and exactly what each does
1. THE ICE (three ponds). Slippery exactly as on the small stage (stbFric, on the ponds' own floors only). New in the big map: knockback slides too, so a hit on ice carries much further than a hit on rock. See-through pale ice with fish shadows inside it (background, inside the floor's own thickness).
2. THE FISHING HOLE. A round hole in the Great Pond with a little stool and a rod beside it (the rod is behind the play layer and thin as a line: not a ledge). Fall in = KO. Always open. It is this map's hatch.
3. THIN ICE. Darker, crackled panels (one on the Tarn, one or two on the Great Pond). A hard landing (fall-damage height) or a heavy hit on it cracks it: a loud crack tell and white lines for 1 s, then it gives way and is open water for 8 s, then freezes over again (the same rule as Dream Island's crumbling edge blocks). Walking and sliding over it is safe. Edge: the attacker can MAKE a hole where the enemy is about to slide.
4. THE THAW and its ICE FLOES. Open water with 3 floes drifting on a slow loop (they turn back at the ends; they never vanish). Their tops are ice, so you slide on a moving raft. The only crossing. Edge: timing, and a fight on a floe is the riskiest fight in the map.
5. THE ROPE TOW. A loop of rope round two pulleys carrying 4 hanging T-bar seats, from the Great Pond's west bank up over the gap to Lodge Bluff and back. Seats go round the pulleys and come back; none disappears. You can be knocked off. Edge: the only way up to the Bluff besides the slow rock shelves, a moving vantage, and it carries you through the air over the Tarn.
6. THE CAMPFIRE. Stand by it 2 s: heal 10% and get WARM BOOTS for 12 s (no sliding: full grip on ice, shown as a small orange glow at the feet). 25 s rest (the fire burns low and flares up again). Edge: for 12 s you are the one fighter who can stand still on the pond. Specific to this stage, and a reason to raid the low base.
7. SNOW BANKS. Low white mounds on the ice at the ponds' ends and outside the low bases: grippy, and no fall damage when you land on them. Static, and every one is real (you stand on it). They are the "brakes" you aim your slide at.
8. ICICLES (Icicle Shelf, and the frozen fall). Hang from the overhang. A hit on the rock near them (or anyone landing hard on the shelf above) shakes one loose: it wobbles 0.7 s (tell), falls, does 8% and a small pop-up, and grows back in 15 s. They never drop on their own.
9. THE ROCK ISLAND. A block cluster in the middle of the Great Pond with side shelves: the one grippy place out there, and where crates land.
10. THE SNOW FORT WALLS. Solid snow partitions making 4 or 5 small rooms of different sizes with gaps to squeeze or hop through: the maze-like part of this map, where the theme fits it.
11. THE CURLING STONE (variants 1 and 3). One big flat-topped stone that slides the whole length of the Skating Lane and back on the clock, never stopping. Its top is GRIPPY. It shoves anyone in its path (5%, a push, no KO by itself). Edge: a ride with grip on a floor with none, and a moving wall that sweeps the lane toward its open ends.

### Seed variants (4 per size; each can also be flipped left-right as a whole)
- V0 "Clear morning": the base map. One fishing hole, two thin-ice panels, 3 floes, no stone, no wind.
- V1 "Curling day": the curling stone on the Skating Lane; a second, small stone on the Tarn; snow banks moved to the lane's ends; one floe fewer (so the Thaw is harder and the lane matters more).
- V2 "The thaw": the Thaw is wider and reaches into the Great Pond's east end (a fourth and fifth floe); three thin-ice panels; a second fishing hole; a second small campfire on the rock island (neutral). The wet, dangerous one.
- V3 "Blizzard night": gusts on the Windy Heights rule (a 10 s rhythm with the gust sound tell) that push much harder on ice than on rock or snow; more snow banks (the storm piles them up); the curling stone; LIGHTS OUT phases (below).

### Growing with players and MAP SIZE (add ponds and places, never stretch)
- 4 players: the Great Pond, the Tarn, the Thaw with 2 floes, the four bases, the rope tow. No Skating Lane yet (the Thaw runs to the bottom rim). About 5800 x 2850.
- 6 players: + THE SKATING LANE (the third pond) under the Thaw, + a third floe.
- 8 players: + THE EAST ARM: a frozen stream running off the Great Pond behind the Snow Fort to a small round "Duck Pond" with its own rim and hut (a fourth, tiny bowl), and the cliff shelves west of the Bluff.
- 10+ players: + THE SUMMIT POOL above the Tarn (the smallest, highest pond; a second, short rope tow).
- MAP SIZE Compact: one added place fewer than the player count gives. Normal: as listed. Tall: + THE ICE CAVES under the Great Pond (concept B): blue rooms of varied sizes whose ceiling is the pond's ice; over the caves the thin-ice panels drop you into the cave instead of into water (those panels show a dark hollow underneath, the water ones show blue water: always tell-able apart); two rock chimneys with real shelves climb back up; plus the Summit Pool. Huge: Tall's layers + the East Arm at any count + THE FROZEN RIVER along the west foot of the cliff (a long, gently stepped ice run from the Bluff's shelves down to the Skating Lane: the fastest and most dangerous road on the map).
Every added pond is a different size (tiny, small, long-narrow, big), per the "varied rooms" rule.

### Night / hazards
- Day/night cycle like Dream Island (it is outdoors): the sky dims and returns over the match; at night an aurora in the background and the campfire, cabin window and hut lanterns are the lit places.
- LIGHTS OUT (V3, and the Ice Caves always a little dark): the Search Party darkness. Twist for this stage: the ICE glows faintly under each fighter (a pale ring), so you can read a slider's path from the trail it leaves for a second.
- Fall damage: full on ice and rock, none on snow banks.
- Gusts only in V3.

### CPU routing notes (routing only)
- Reuse the Dream Island graph and trip layer. Ice nodes carry a "slide" flag: the CPU brakes early with the existing look-ahead-by-speed code (stgBrain) before a hole, open water, or a lane end, and prefers to stop on rock or snow.
- A CPU above about 90% prefers rim/snow routes over ice; below that it uses ice as the fast road.
- Thin ice is a normal floor node until its crack tell shows, then a blocked node until it refreezes.
- Floes and rope-tow seats are edges that exist while docked (ferry-wait rule: over 150 frames blocks the edge for 500). CPUs must not jump for a floe that is leaving: board only when the floe's travel direction is toward the far bank or it is within one body of the bank.
- Trips: the campfire when hurt or before going onto the pond, the rock island for crates, the Bluff as "high ground".
- Check the weakest jumpers on every shelf step and floe gap, and the slowest fighters on the frozen fall.

### Online-sync notes
- Floes, rope tow, curling stones, gust rhythm and the day/night level are pure functions of the match frame.
- In the snapshot: thin-ice panels (broken-at frame each), icicles (fell-at frames), campfire rest timer, each fighter's warm-boots end frame.
- Sliding knockback is ordinary host physics with the ice friction; guests already receive positions.
- Variant and flip from the shared match seed; no Math.random in the build.
- Own hide switch and owner preview key, as the other two maps. All checks local: NEVER the live relay.

---

# 3. Rule checklist (both maps)

| Rule | The TLC | Frozen Pond |
|---|---|---|
| A place, not a platform map | the inside of the loser box: lid, bowl, bleachers, bunks, booth | a snowy mountainside: three ponds, cabin, camp, fort, tow |
| Not mirrored, balanced by role | 4 different rooms at 3 heights | 4 different camps at 3 heights |
| 2+ exits per team | 2 + drop (high), 3 (low) | 2 + shelves (high), 3 (low) |
| Mover-only gaps | gap A (scoop arm), gap B (cage lift) | the Thaw (floes), Bluff gap (rope tow) |
| Movers give a real edge, never vanish | lid, arm, lift, crane, cart: all slide/swing on rails | floes, tow seats, stones: all loop |
| Nothing fake | air holes barred and tiny; tally marks flat | rod and fish shadows are background, thin |
| Less per screen, varied rooms | big empty bowl; closets / rooms / halls | open ponds; tiny / small / long / big |
| Maze where it fits | closets, bunks, underfloor | snow fort, ice caves |
| Fall damage, night | yes; power-cut LIGHTS OUT | yes; day/night + LIGHTS OUT with ice glow |
| 4 variants, grows by adding | Roll call / Cake at Stake / Lockdown / Delivery day; annexes and floors | Clear / Curling / Thaw / Blizzard; ponds and layers |

Known risks to measure at build time: (TLC) too few KOs in a sealed box; wall-bounce loops that never end near two bumpers. (Pond) low bases flooded by sliders in the first seconds; fighters with poor air control on the floes; slide-KOs feeling unfair without the snow-bank brakes being easy to see.

---

# 4. The choices, with the lead's defaults (owner 2026-11-12: "they dont need my ok from now on" + the go word)

The build does not wait for answers. Each choice is recorded with the default the builder follows; the owner can overrule any of them later.

1. THE TLC concept: a) Inside the Chamber / b) The Locker of Losers / c) A, with the Locker as an outer ring on Huge only.
   LEAD'S DEFAULT CHOSEN: c.
2. THE TLC top KO: a) only through the sliding LID's gap / b) whole top open / c) fixed skylights.
   LEAD'S DEFAULT CHOSEN: a. Fallback if measured KOs per minute are under the generic Teams map's: widen the gap first, then a second gap; report the numbers either way.
3. THE TLC bounce: a) normal walls + BUMPERS in the bowl + PADDED walls in the Bunks / b) same everywhere / c) bumpers, no padding.
   LEAD'S DEFAULT CHOSEN: a.
4. FROZEN POND concept: a) Three Ponds, caves on Tall/Huge / b) one giant lake / c) two layers everywhere.
   LEAD'S DEFAULT CHOSEN: a.
5. FROZEN POND thin ice: a) breaks; KO hole over water, drop into caves over caves / b) only ever drops into caves / c) none.
   LEAD'S DEFAULT CHOSEN: a.
6. Show scenes to copy: a) the ideas as written / b) a specific scene / c) more cameos.
   LEAD'S DEFAULT CHOSEN: a. No character cameos (and never the hidden-prize characters). Machine names stay off screen unless checked.
7. Build order: a) TLC first / b) Frozen Pond first / c) finish the other two first.
   LEAD'S DEFAULT CHOSEN: a (the TLC reuses the most existing code: stgWallHit, koT, the Yoyle lever/lift/snapshot code). The two maps touch different code and can be two separate jobs.

---

# 5. Build sheet (for the builder to follow directly)

HONESTY NOTE: every number below is a DESIGN PROPOSAL. None was run in the game (this job read code and pictures only, and built nothing). Jump reach, door heights and timings must be checked against the real fighters at build time and changed where they fail, and the change reported, not hidden. Do not tune a check to make it pass: if KOs or base fairness come out wrong, say so with the numbers.

## 5.0 Shared conventions
- Follow the Yoyle Needle teams build as the pattern: own `xxWanted / xxBuild / xxVariant / xxDrawPlats`, Teams on that stage only, a hide switch (`TLC_TEAMS_OPEN`, `ICE_TEAMS_OPEN`, false) with an owner preview key in localStorage, the ordinary Teams map while hidden. The small FFA stages and every other mode untouched.
- Core layout drawn at ONE fixed scale (Yoyle uses 0.75 of design px), never stretched; size comes from added rooms. Coordinates below are fractions of the CORE box (x 0..1 left to right, y 0..1 top to bottom) so they survive the annexes being bolted on; "dp" = design px before the scale.
- Sizes to hit (the Yoyle numbers, which the owner's "noticeable scaling" note produced): 4p Normal about 5775 x 2835; 6p 6675 x 2835; 8p Normal 7575 x 3420; 8p Compact 6675 x 3420; 8p Tall 7575 x 4005; 8p Huge 8475 x 4590. Never under the generic Teams size + 10% for the same settings.
- Body: tallest 96 px. Doors and corridors at least 330 px clear (Yoyle's door). Crawls at least 110 px clear and only where the text says "crawl". Static step spacing 105-130 dp (CLIMB_REACH 130). Mover-only gaps at least 500 px wide with nothing static inside them; check with the best jumper that no fighter crosses without the mover (if one can, widen it; if that fighter flies by design, note it and accept).
- Clutter budget: at most about 12 standable pieces in any one screen-sized window, and at least one screen-sized window of open air per map (the bowl; the Great Pond).
- Shapes are block clusters with side shelves (the Dream Island v5 look), not plain slabs.
- Deterministic build: seed = the match seed already shared; variant = seed % 4; flip = (seed >> 2) & 1. A piece that finds no floor or clear air at some size is NOT drawn (the Yoyle phase B rule).
- Spawns: each team inside its own base; respawn stands the fighter ON a base floor (stgRespawn style, feet on it), never in the air over a hatch, hole or ice.
- Fall damage: the Dream Island rule as is (1.0 screen, cap 15%, dust + number).
- All checks local. NEVER the live relay. No Edge windows. No test suite (build, boot, show the owner).

## 5.1 THE TLC core (8p Normal core about 5200 x 3400; annexes bolt on outside it)
Shell: outer walls 64 px thick (STGK.wall), from above the top line to below the bottom line. Ceiling plate at y 0.06. Floor of the underfloor crawl at y 0.97. KO top line just above the ceiling (koT pattern), bottom line under the underfloor.

| Piece | x | y | Size / notes |
|---|---|---|---|
| Big Bowl, open air | 0.27-0.73 | 0.10-0.80 | nothing static inside except the pieces listed below |
| Bowl steps, left | 0.27-0.38 | 0.50, 0.60, 0.70 | 3 solid steps, each about 0.035 wide, rising toward the wall (the small stage's steps) |
| Bowl steps, right | 0.62-0.73 | 0.52, 0.62, 0.72 | 3 steps, NOT the same heights as the left |
| Bowl flat floor | 0.38-0.62 | 0.80 | solid steel, 60 px thick |
| Big Hatch | 0.473-0.527 | 0.80 | about 280 px wide (3 bodies); hazard stripes 60 px each side |
| Bumpers | wall faces at x 0.27 and 0.73 | 0.22-0.34 and 0.40-0.48 | 4 panels, bounce 0.9; nothing standable within 150 px |
| Lid | 0.20-0.80 | 0.06 | plate with ONE gap 0.11 wide (about 570 px); gap centre travels x 0.33 to 0.67 and back, triangle wave, period 4200 frames; daylight strip drawn on whatever floor is under the gap |
| Lid crane hook plate | 0.09 left of the gap's left edge | 0.24 | 110 px soft plate, rides with the lid (V0, V3) |
| NW Lid Loft | 0.02-0.19 | floor 0.30, roof 0.08 | block room; two catwalk shelves at 0.20; door (330 px) in the east end of its floor down to the closets; vent drop at x 0.04 |
| Gap A | 0.19-0.27 | 0.10-0.45 | at least 500 px after the scale; no static piece (push the Loft wall west if short) |
| Scoop arm | pivot (0.23, 0.07) | scoop sweeps x 0.195-0.33 at about y 0.30 | pendulum period 420 frames; scoop floor 130 px with 40 px lips; fling at each end of the swing (about a medium launch) to painted targets: Loft door sill (0.185, 0.30) and the upper left bowl step (0.36, 0.50) |
| Closets | 0.02-0.19 | 0.34-0.56 | two stacks of 2 cells, each cell about 230 x 330 px, a door each side; 4p: one stack |
| SW Cake at Stake | 0.02-0.26 | floor 0.80, roof 0.60 | bleachers: 4 wide steps rising westward (each about 0.05 wide, 110 dp tall); cake table on the top step at x 0.05; door to the bowl at x 0.26, y 0.68-0.80; chute to the underfloor at x 0.12; back stair up to the closets at x 0.20 |
| NE Control Booth | 0.80-0.98 | floor 0.36, roof 0.14 | lever at x 0.94; window ledge sticking 120 px into the bowl air at (0.80, 0.36); door in the floor over the lift |
| Gap B | 0.84-0.94 | 0.38-0.66 | no static piece; the booth's floor door opens onto the cage lift only |
| Cage lift | x 0.89 | y 0.36 to 0.66 | cage floor 240 px; 120 frames travel, 180 frames wait at each end |
| SE Bunks | 0.75-0.98 | floor 0.82, roof 0.66 | 5 cells of different widths (about 180, 260, 200, 340, 220 px) on two half-levels, padded walls (bounce 0.15), crate locker in the widest; door to the bowl at x 0.75; floor chute at x 0.90; the lift lands on its roof at 0.89 beside a roof hatch |
| Underfloor crawl | 0.10-0.92 | 0.86-0.97 | 110-140 px clear; two small hatches (140 px) at x 0.33 and 0.70; the Big Hatch's shaft passes through as a walled tube at 0.47-0.53, with a 330 px dip going round under it |

Behaviour numbers: lever = hold Down 1/3 s beside it (Yoyle's lever); the lid reverses for 600 frames; lever rests 1500. Cake = 120 frames standing within 80 px, heal 15, back after 1800 frames. V2 hatch cover = shut 600 frames / open 600, a 120-frame klaxon tell before each change; it slides on rails (a fighter standing on it is carried with it). Bulkhead doors: same clock, opposite phase. V3 pads = 60-frame beam tell, 360 rest; crate drops every 1500 frames at the gap's centre.
CPU specifics: the gap's x is known from the frame; a CPU at 90%+ adds cost 300 to nodes within half a gap-width of the gap centre. Hatch edges use the momentum brake. The scoop edge is open only while the scoop is within 60 px of a dock; never jump for it otherwise.
Measure and report (even if bad): KOs per minute vs the generic Teams map; share of KOs top vs hatch (aim: neither under 25%); win share and time alive per base per variant; the longest wall-bounce chain seen.

## 5.2 FROZEN POND core (8p Normal core about 5600 x 3400)
Open edges: the outermost rims end at x 0.03 and 0.97 (as the small stage's floor does); side, top and bottom blast lines as on any open stage.

| Piece | x | y | Size / notes |
|---|---|---|---|
| NW Lodge Bluff | 0.04-0.20 | top 0.22 | rock block cluster; cabin (solid roof you can stand on, 330 px door) at 0.07-0.14; 5 rock shelves down its east face (x 0.20, y 0.30-0.62, about 120 dp apart); 3 small shelves on the west cliff face (the risky back way) |
| Rope tow | pulleys at (0.17, 0.14) and (0.60, 0.56) | | 4 T-bar seats, each a 100 px soft plate hanging 140 px under the rope; loop period 1500 frames; boarded at the low pulley from a bank shelf of the Great Pond |
| The Tarn | 0.36-0.60 | ice at 0.34 | bowl 120 px deep; rims 0.33-0.36 and 0.60-0.63 (grippy rock, 90 px above the ice); thin-ice panel 0.44-0.48 |
| Frozen fall | 0.63-0.68 | 0.36-0.60 | 6 ice steps (slippery), each about 110 dp down |
| NE Icicle Shelf | 0.74-0.96 | floor 0.40 | rock overhang roof at 0.26 covering 0.76-0.94; the west end of its floor is ice; 5 icicles under the roof; cave-mouth shelves down its west face to 0.62 |
| Great Pond | 0.22-0.78 | ice at 0.64 | bowl 160 px deep; rims 0.20-0.22 and 0.78-0.80 (a low step then a tall block: the small stage's rim shape) |
| Fishing hole | 0.33-0.36 | 0.64 | about 170 px wide |
| Rock island | 0.47-0.54 | top 0.58 | cluster of 3 blocks, 2 side shelves; crate spot |
| Thin ice (Great Pond) | 0.66-0.70 | 0.64 | V2 adds one at 0.26-0.29 |
| Snow banks | 0.225-0.25, 0.75-0.775, 0.41-0.43 | on the ice | 50 px high, grippy, no fall damage |
| SW Fishing Camp | 0.03-0.21 | floor 0.66 | campfire at 0.12; two huts (solid roofs at 0.56) at 0.05 and 0.165; dock: a wooden deck from 0.21 to 0.27, one step over the ice; shore path down its south side to the Thaw's west bank; hut back door to the Bluff's east shelves |
| SE Snow Fort | 0.80-0.97 | floor 0.66 | snow walls making 5 rooms (about 200, 320, 240, 400, 260 px wide); two walls chest-high (hop over), the rest full height with 330 px gates; igloo (solid dome, roof hatch) at 0.90; gate to the pond at 0.80; back gate south to the Thaw's east bank |
| The Thaw | 0.26-0.74 | water at 0.80 | banks at 0.22-0.26 and 0.74-0.78 (rock ledges under the pond's rim blocks); 3 floes, each 260 px wide, 30 px above the water, drifting between x 0.28 and 0.72 on triangle waves of period 1800 frames, phases 0, 1/3, 2/3 |
| Skating Lane (6p+) | 0.14-0.86 | ice at 0.92 | long narrow pond 100 px deep, a 60 px rim at each end with open air beyond; reached from the Thaw's banks by 3 rock shelves each side; at 4p the lane is absent and the water runs down to the bottom line |
| Curling stone (V1, V3) | on the Lane, x 0.18 to 0.82 and back | | 300 px wide, 110 px tall, grippy top, period 1500 frames, push 5% |

Behaviour numbers: ice friction = the stage's ICE_FRIC on every pond floor, floe top and frozen-fall step; FRICTION on rock, snow, wood and the stone's top. Thin ice breaks on a landing from fall-damage height, or when a fighter launched hard lands on it: 60-frame crack tell, open 480 frames, then solid. Campfire: 120 frames within 90 px, heal 10, warm boots 720 frames (that fighter uses FRICTION on ice), rest 1500. Icicle: 42-frame wobble, 8%, regrow 900. V3 gusts: the Windy Heights rhythm and tell; push x1.0 on rock and snow, x2.0 on ice (a start value; report what was used).
CPU specifics: ice nodes flagged; brake look-ahead scaled to the ICE_FRIC stopping distance; at 90%+ prefer rim/snow routes; a CPU with warm boots may stand on ice freely; never board a floe moving away unless within one body of the bank.
Measure and report (even if bad): KOs per minute vs the generic Teams map; share of KOs by place (sides/top, hole, Thaw, lane ends); KOs in the first 10 s of a stock for the two low bases (sliders arriving) vs the high ones; win share and time alive per base per variant; the slowest and weakest-jump fighters on the floes and the fall.

## 5.3 Order of work for each map (Yoyle's phases)
1. Preview: geometry and art only, with the size-grid pictures (4p/6p/8p Normal, 8p Compact/Tall/Huge, the 4 variants at 8p Normal) for the owner to look at. Hidden.
2. Mechanics: every set piece works; none drawn only.
3. CPU routes and trips.
4. Fairness and KO numbers, reported as measured.
5. Before unhiding: the release-check and feature-scores rules still apply.
