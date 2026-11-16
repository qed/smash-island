# Moon Caves v4, designer 1: a library of really different chambers (the verbs)

2026-11-02. Study only: nothing in the game was edited, committed or pushed. Build read: `smash-bal`, branch `ii-dlc`, Moon Caves v3 (`mcGen` and the layers, `artifacts/V1/index.html`). Picture of all 16 at one scale: `library-1-sheet.png` (same folder). Every sketch below is drawn from the same data the picture and the movement check use.

## 0. The short version

**What "samey" is, measured.** `mcGen` at 10 and at 30 fighters (the extraction script is in the scratchpad):

- Every cave is the same room: a ring band with 260-420 px of clear headroom (`MC_GEN.head`: 260 in the ice and the mines, up to 420 in the updrafts and the tunnels) sitting on 100-140 px of rock, running all the way round, cut by shafts. The runs between shafts are 430-1,100 px for six of the eight caves at 30 fighters (22 runs of exactly 1,103 px in the galleries, 954 / 477 / 1,909 in the springs, 829 in the columns), and the long ones (1,900-3,900 px, in the tunnels and the furnace) are the same strip with the shafts left out.
- Inside a run every kind does the same thing: a flat floor, then pieces 60-330 px over it (ledges, rocks, planks, rafts, stones), in one of 2-4 patterns picked by a hash. A kind is a *coat of paint and a zone* (ice, bounce, belt, water, updraft) on that strip.
- So you walk one shape ten times. Nothing is taller than 420 px clear or lower than 200 px, nothing is a drop, a climb, a gap, a maze or a plain long walk. That is the sameness: one silhouette, one scale, one verb (walk the floor, hop the pieces).

**What I propose.** Sixteen chambers that differ in silhouette, scale, openness and the verb they ask, not in a parameter. Each one has an *invariant* (a number that makes it that chamber and must never be tuned, section 5). The kinds stay as dressing: an archetype is the room, a kind is what the room is made of (section 4 says which pairs work).

| # | Chamber | Silhouette | Size (px, x by up) | The verb |
|---|---|---|---|---|
| 1 | The Chimney | tall thin slot | 160 by 700-1,300 | climb, wall-jump, fall |
| 2 | The Crawl | long low tube | 1,500-3,000 by 105 | crawl: the jump is dead |
| 3 | The Cathedral | huge open vault | 1,600-2,800 by 800-1,400 | fight in three tiers of air |
| 4 | The Span | plank over a gap | 700-1,400 across, 330-900 deep | cross, duel on a line |
| 5 | The Teeth | comb from the roof | 1,200-2,400 by 480-560 | weave, bonk, dodge |
| 6 | The Long Ramp | diagonal band | 1,800-3,200 long, 300-700 rise | race and fight uphill |
| 7 | The Attic | tiny sealed room, one hatch | 280-420 by 180-250 | bait, greed, ambush |
| 8 | The Racetrack | ring round a block | 1,200-1,800 by 600-700 | flank, circle, chase |
| 9 | The Chute | down-only shaft | 120-160 wide, 500-900 deep | commit, escape, ambush below |
| 10 | The Stump Hall | wide hall, short pillars | 1,800-2,600 by 560-700 | take cover, hold a perch |
| 11 | The Grand Stair | uneven terraces up | 1,500-2,400 by 650-900 | climb, fight over a high spot |
| 12 | The Sinkhole | pit with an undercut | neck 200-260, 400-700 deep | drop, discover, flank |
| 13 | The Hot Plates | flat floor of staggered fire | 1,600-2,600 by 450-600 | read the clock, cross |
| 14 | The Warren | block of small cells | 1,100-1,600 by 650-900 | corner, door-fight, get lost |
| 15 | The Crater | open bowl with a peak | 1,800-2,800 wide, 240-320 deep | hold the rim or the bowl |
| 16 | The Barricade | one wall, three lanes | 1,800-2,400 by 520-640 | breach, hold the line |

**Ranked by how different they feel to walk** (section 3 has the reasons and numbers), most different first: 2 Crawl, 9 Chute, 1 Chimney, 13 Hot Plates, 3 Cathedral, 4 Span, 6 Long Ramp, 15 Crater, 7 Attic, 5 Teeth, 14 Warren, 12 Sinkhole, 16 Barricade, 11 Grand Stair, 8 Racetrack, 10 Stump Hall.

**What I would build first if not all sixteen:** 2, 1, 3, 13, 4, 15, 14, 16. They cover every axis (section 5); 2, 4, 14 and 16 are boxes and planks only, 1 and 13 need a little data, and 3 and 15 are the price of the variety: they need the generator to carve rooms out of a rock mass instead of laying bands (section 6).

**What this is not.** Not a plan for the whole disc. Which chamber goes where, how they join and how the rings turn into a rock mass with rooms in it is the topology job; section 6 lists only what each chamber asks of the generator.

## 1. The numbers every sketch is held to

All from the build itself (`JUMP`, `GRAV`, `aiRiseLeft`, `aiClimbReach`, `MAX_HOP_RISE`, `CLIMB_REACH`, `FIGHTER_STATS`):

- **Body** 48 px tall and wide; run 6.4 px a frame (384 px/s).
- **One jump rises** 119.8 px in normal gravity (lower layers) and 173.8 px in the Moon's low gravity (the surface and the upper half of the layers). **Two jumps** about 235 px normal, 343 px low.
- **The weakest jumper** (stat 0.85, the roster's floor) rises 86 px normal / 125 px low with one jump, 168 / 246 with two. So a 110 px step is a second jump for them on every normal-gravity step (as v3's 112 px steps already are). **Rule used here: steps and ledges 110 px or less; any wall on the floor 160 px or less on normal-gravity layers** (so even the weakest double jump clears it). Taller walls are read as "tall" by the CPU (`navAround`/`aiWallFacts`) and it goes round, and there is no round in a hall.
- **One running jump** carries about 230 px across at the same height; two about 470 (CPUs' own gap reach: `brainLedge`, 360 times their stats). Gaps used here: 200 px for "one jump", at most 340 for "two".
- **Roof bonk:** a head into a roof cuts the rise to zero and nothing else (no stun). A roof 105 px over the floor therefore lets a jump rise only 57 px.
- **Planks** are one-way (jump up through, land on top, down+jump to drop through). **Wall-jump:** once per wall *face* per airtime, a face being counted by its angle (`mcWallId`): a flat wall gives two jumps, a wall of staggered blocks gives one per block. Rise about 101 px.
- **Heat:** the furnace's floor burns 70 of every 260 frames, 0.5% a frame plus a pop, up to 35% a flare.
- **A swing is not stopped by rock:** I found no test in `applyHit` that stops a hit at a wall (projectiles do stop). I treat rock as blocking bodies and shots, not swings, so thin walls do not make cover from melee.
- **Width and radius:** a chamber's px are measured along its own floor. At a floor radius r a width w spans w/r radians, so to stay under about 92 degrees of the moon (a 1,100 px window at zoom 0.72 shows about 58 degrees at r 1,500, so a wide room looks like a gentle bowl, which is right) a chamber needs a floor radius of at least w/1.6. The table in section 5 gives each one's minimum.

Notation in the sketches: `#` rock, `=` one-way plank, `H` hot plate, `@` prize, `A B C D` openings to the next chamber (ports), blank is air. Left-right is along the ground, up is away from the core. Each sketch states its cell size.

## 2. The sixteen

### 1. The Chimney (a vertical chimney)

**What it is.** A slot 160 px wide and about 1,000 px tall in solid rock. One-way ledges, 80 px deep, jut out alternately from the left and right wall every 110 px of height, so the climb is a zigzag. The two long faces are cut as offset blocks (2 px or more each 110 px band), so every band is its own wall to the once-per-face wall-jump rule and a person can wall-jump the whole shaft; CPUs use the ledges. Ports: A at the bottom, B at the top on the other side.

Cell 40 by 55 px, so the whole is 480 by 1,100 px.

```
############
B       ####
        ####
        ####
######  ####
####    ####
####  ==####
####    ####
######  ####
####    ####
####  ==####
####    ####
######  ####
####    ####
####  ==####
####       A
######
####
############
############
```

**Size.** 150-190 wide (not more: at 240 a body crosses in one jump and it is a gallery again), 700-1,300 tall, ledges 80 deep.
**Asks of a fighter.** Climb: ledge to ledge, or wall-jump straight up. And the reverse: falling.
**A fight there.** One dimension, vertical. High ground is absolute: the fighter above hits down, a down-air spike sends the climber back the whole drop (770 px here, about 5 seconds of walking back) with no damage, and a hit up bonks the roof, so nobody is killed in a chimney: it is a tempo trap, not a KO trap. The ledges are one-way, so the climber can pop up through the one above (an up-air through the plank) and the camper can drop through to get below. The ledges on the left are solid stubs (the `#` ones in the sketch), so a shot straight down the left half of the shaft is stopped at each; the right-hand ones are planks.
**Layers.** Natural in updrafts (the air column makes it an elevator, so the verb becomes "ride or climb": aerial combat) and mines (the ledges are scaffold planks). Works in galleries, columns, tunnels (it is a shaft with no hole round it) and springs (one pad at the foot, a launch). **Never** ice (80 px ledges that slip you off), flooded (the water's drag on the jump leaves some 110 px ledges out of reach), furnace (everyone who falls lands on a burning floor: the drop and the burn add up).
**CPUs.** Ledges of 110 px: `steerClimb`/`navUp` by `CLIMB_REACH` (130). The walls read as "tall", so no one tries to climb them, and CPUs never wall-jump except in recovery (`brainRecover`). Going down they press down+jump on a plank (`mcRouteSteer`'s drop), and `mcDropOk` finds floor below. No new nav.
**Risk.** (1) A shooting gallery for a straight shot above climbers (the solid stubs are the fix, they do not remove it). (2) The top camper: in a 160 px slot a climber always meets the camper first; give the chimney a second door half way. (3) Every wall block needs its own face angle in the generator, or the wall-jump route silently shrinks to two jumps.
**Checked.** Cheapest route from A to the next port (stat 1, normal gravity): 440 px of ground, 7 jumps, 770 px climbed, 0 px fallen, mean headroom 228 px. No trapped spot, none unreachable.

### 2. The Crawl (a long low crawlspace)

**What it is.** A tube 105 px high and 1,500 to 3,000 px long, rock above and below. Every 660 px the roof lifts into a *bay* (240 wide, 315 high) where you can stand up and jump; between bays there are two 70 px squeezes. Ports: A and B at the ends.

Cell 60 by 35 px, so the whole is 2,400 by 420 px.

```
########################################
########    #######    #######    ######
########    #######    #######    ######
########    #######    #######    ######
########    #######    #######    ######
########    #######    #######    ######
########    #######    #######    ######
              ###        ###
A                                      B

########################################
########################################
```

**Size.** 1,500-3,000 long; 90-110 high (not above 120: at 135 a normal jump no longer taps the roof); bays 220-260 wide, 300-340 high, 550-700 apart (never more).
**Asks of a fighter.** Crawl: walk it. The jump is dead (it rises 57 px and taps), so the vertical axis is gone. It is also the plainest, shortest line between two places: a race with no skill in it but pace.
**A fight there.** A fight in one dimension: tilts, dashes, smashes and shots only, and a shot cannot be jumped (it is 105 px high). Whoever has the longer straight poke or the shot has the advantage; a melee fighter walking into a shooter loses unless a bay is near, which is why the bays are not decoration: a bay is the only place with a sidestep. Launches slide along it, and a diagonal launch bonks the roof and drops, so heavy hitters get roof-bounce combos and floaty fighters get juggled. No KO inside; a launch slides out of the end into the next chamber.
**Layers.** Natural in tunnels (it is the lower tunnel at half the height) and mines (a belt: a fast lane one way, a treadmill the other). Works in ice (slide into the walls), flooded (a siphon: water takes 13% off your speed each frame, a top speed of 6.0 against 6.4, so mostly it is texture) and columns (low rock). **Never** galleries (air is their whole point), springs and updrafts (a pad or a column pins you to the roof at once; the pin lets go only after 36 frames), furnace (no hop room: the burn cannot be dodged except by waiting), the surface (nothing to roof it).
**CPUs.** Walking only (`brainWalk`); there is nothing to climb or jump. Their aerials and jump-ins hit the roof: that is the room, not tuning.
**Risk.** (1) A shooter at one end: bays 700 px apart at most. (2) A pile-up: at 15 a side a single-file tube holds about 14 bodies per 700 px. I did not check whether bodies push each other here; if they do, a crawl in the busiest layer is a traffic jam, so give it a twin tube or keep it to quiet layers. (3) Roof-bounce combos with no escape; the damage cap (`koCap`) is the only end to them.
**Checked.** Cheapest route from A to the next port (stat 1, normal gravity): 2,340 px of ground, 0 jumps, 0 px climbed, 0 px fallen, mean headroom 163 px. No trapped spot, none unreachable.

### 3. The Cathedral (very tall and open, a few floating islands)

**What it is.** One chamber 2,600 px wide and 880-1,000 px of clear height, a vault that steps up toward the middle. A flat nave floor with a 110 px altar; three floating islands a side, 180 px wide, rising 110 px each toward the middle, and a 600 px *pulpit* over the altar at 440 px up with another 440 px of empty air above it. Ports: A and B, doors at floor level.

Cell 60 by 55 px, so the whole is 2,640 by 1,100 px.

```
############################################
############################################
##################        ##################
##################        ##################
##                                        ##
##                                        ##
##                                        ##
##                                        ##
##                                        ##
##                                        ##
##               ==========               ##
##                                        ##
##          ===              ===          ##
##                                        ##
##      ===                      ===      ##

A   ===             ####             ===   B
                    ####
############################################
############################################
```

**Size.** 1,600-2,800 wide, 800-1,400 clear height (never under 800: below it the air above the pulpit is gone and it is a gallery). Islands 150-240 wide, the pulpit 400-700.
**Asks of a fighter.** Fight in the air, in three tiers: the nave, the islands, the pulpit. The pulpit is "fight over a high spot" with edges all round.
**A fight there.** The only chamber where a vertical launch is a real kill setup (500 px of air to travel up before the vault), and even so it ends at the vault: bonk, fall, no KO. Advantage to air mobility and shots from above; a floor fighter is under a rain from the pulpit. The pulpit is a one-way plank, so it can be hit from below and is easy to be knocked off: the holder is exposed, not safe. At 15 a side it is the main hall: 30 bodies on four levels, nowhere to hide from an air fighter. The altar's top (110 px up, under the pulpit) is the human shortcut: 330 px to the pulpit is two jumps in the Moon's low gravity only.
**Layers.** Natural in galleries (it is a gallery at the scale of a cathedral) and updrafts (the columns of air replace the islands' chain). Works in springs (a pad on the nave: about 300 px up in one bounce), ice (a rink nave), flooded (a lake floor, rafts), columns, mines. **Never** tunnels and the crawl (their point is the roof), furnace (the floor burns and the islands have to carry the whole fight: Hot Plates is that room, smaller), the surface.
**CPUs.** The island chains are 110 px steps, so `steerClimb` and "ANOTHER LEVEL" take them. That rule is exactly what a cathedral triggers all the time (a foe more than 80 px above on another floor: walk under it and jump up); expect CPUs to chase up and down the chains, which is their ordinary behaviour (the leapfrogging in `cpu-circling.md` is the same rule).
**Risk.** (1) It spans two to three of v3's bands, so `mcLayer` (by the radius of the feet) and the passage table must treat it as one room. (2) It cannot fit a small moon: it needs a floor radius of 1,650 or more. (3) No KO inside (damage cap or the core only).
**Checked.** Cheapest route from A to the next port (stat 1, normal gravity): 2,580 px of ground, 1 jump, 110 px climbed, 110 px fallen, mean headroom 557 px. No trapped spot, none unreachable.

### 4. The Span (a bridge over a drop)

**What it is.** Two cliffs with a 960 px gap between them, crossed by a one-way plank, the span. The gap is 330 px deep to a pit floor; 110 px under the middle of the span hangs a catwalk, the *keel*, that you can pop up through the span from; a ladder of two planks in the pit climbs back to the cliff. Ports: A and B, on the cliff tops.

Cell 60 by 55 px, so the whole is 2,160 by 990 px.

```
####################################
####################################






A                                  B

##########================##########
##########                ##########
##########==    ====      ##########
##########                ##########
##########  ==            ##########
##########                ##########
####################################
####################################
```

**Size.** 700-1,400 across, 330-900 deep, 440 px or more of air above the span. The span 100-130 px wide of walking line (it is one plank wide, nothing else).
**Asks of a fighter.** Cross, and stay on it: a duel on a line with a fall on both sides.
**A fight there.** The span is a one-dimensional arena with three ways to be hit: from along it, from the keel (an up-tilt through the plank), from the cliff ends (a shot). The defender at the far end has the advantage: the approacher walks a line and cannot sidestep, though 440 px of air above the span gives a jump option. Knocked off, you land in the pit: it costs about six seconds of walking back, not a stock. That "a fall costs time, not a life" is new to the caves. If the pit is a crack to the core (the deepest layer only), the same room is the hardest KO setup in the library.
**Layers.** Natural in galleries, columns and mines (the span is a belt: a forced march toward one cliff), and in the furnace if the pit floor is the heat (a fall is a burn and a pop). Works in flooded (a water-cushioned pit; the drop slows) and ice if only the landings are ice. **Never** updrafts and springs (a fall rides the air or the pad straight back up to the span, so the drop costs nothing and the fight loops without end), tunnels (no height).
**CPUs.** They walk the plank as any floor; they only step off where there is floor below (`mcDropOk`), and a pit has one. Knocked in they take the ladder (110 px steps, `navUp`). A pit to the core would make them stay on the span (the pit sense) and use the crack recovery already in v3.
**Risk.** (1) KO inflation if the pit is the core: use only in the deepest layer. (2) The keel: a fighter there is hit by nothing from the span except those who drop down, which is the point, not a camp. (3) Nothing for the generator but boxes and planks.
**Checked.** Cheapest route from A to the next port (stat 1, normal gravity): 2,100 px of ground, 0 jumps, 0 px climbed, 0 px fallen, mean headroom 440 px. No trapped spot, none unreachable.

### 5. The Teeth (a stalactite field)

**What it is.** A hall 1,800 px wide whose roof is a comb: eight rock teeth, 120 px wide at the root and 60 below it, hang down 120-320 px, the long ones tipping 160 px over the floor; four low stalagmites (40-80 px) stand on the floor between them. Ports: A and B at the ends.

Cell 60 by 40 px, so the whole is 1,800 by 640 px.

```
##############################
##############################
  ##  ##  ## ##  ##  ## ## ##
  ##  ##  ## ##  ##  ## ## ##
  #   #   #  #   #   #  #  #
  #   #      #   #   #  #
  #   #      #   #      #
      #      #   #      #
      #          #      #
      #          #

A                            B
        #      ##     #
        #      ##     #     ##
##############################
##############################
```

**Size.** 1,200-2,400 wide, 480-560 clear. Teeth every 180-260 px, tips never lower than 160 px over the floor, stalagmites 40-80 px.
**Asks of a fighter.** Weave: a jump is a gamble because the roof is not where it was a step ago. Dodge, bonk, wait for the gap.
**A fight there.** The teeth are cover from above and a roof that is only sometimes there. Aerials work in the slots (120-240 px wide below the roots, 60-120 at them; a body is 48). A launch diagonal bonks a tooth and falls back: pinball. Advantage to the fighter who knows where the slots are, which is whoever stands under one: a slot between two long teeth is a place to be hit only from the sides. Teams: it breaks up a crowd into slot-sized fights.
**Layers.** Natural in columns (a field of stalagmites and roof rock at last the right size) and ice (icicles). Works in galleries, flooded, furnace (teeth over a hot floor: a jump is for the stones, and the roof takes some of it away), mines. **Never** tunnels (no height), springs and updrafts (a pad or an updraft puts you into the teeth with nothing to do about it), the surface.
**CPUs.** `mcRockHop` hops the stalagmites (rocks 2-130 px over the feet); the teeth are above the head, so `navAround` does not see them as obstacles. A double jump under a tooth bonks, which only costs the jump.
**Risk.** (1) **A sealed gate, found by the check in my own first draft:** a 120 px stalagmite beside a tooth whose tip was 160 px over the floor left only 40 px between them and nothing could cross. Rule for the generator: a floor rock's top and any tooth tip within 60 px sideways must be at least 60 px apart. (2) A bonk against the same tooth can loop for a fighter hit up under it; keep teeth narrow at the tip. (3) None for navigation.
**Checked.** Cheapest route from A to the next port (stat 1, normal gravity): 1,740 px of ground, 4 jumps, 280 px climbed, 240 px fallen, mean headroom 423 px. No trapped spot, none unreachable.

### 6. The Long Ramp (a spiral ramp)

**What it is.** A tube of rock whose floor and roof climb together: a climb of one 44 px step every 180 px in the sketch (22 px slope pieces every 90 px in the game, walked up with no jump, as Capture the Flag's), 260 px of headroom over each, 2,100 px long, 484 px of rise. On the disc it is a real spiral: a road whose radius grows with the angle. Ports: A at the foot, B at the head.

Cell 60 by 44 px, so the whole is 2,160 by 880 px.

```
####################################
#################################
##############################
###########################
########################           B
#####################
##################
###############                  ###
############                  ######
#########                  #########
######                  ############
###                  ###############
                  ##################
               #####################
            ########################
A        ###########################
      ##############################
   #################################
####################################
####################################
```

**Size.** 1,800-3,200 long, 300-700 rise (a grade of 12-25%, never over 30%), 240-300 headroom.
**Asks of a fighter.** Race and fight uphill. It is the one chamber where you walk 2,000 px with no jump at all and gain a floor's height. The first walking that is continuous.
**A fight there.** The high ground is real, from the geometry alone: the steps are rock, so a straight shot from below runs into the next step and a shot from above runs down the slope. The uphill fighter is shielded from shots and hits down at the one below, who tumbles down the ramp. Team plan: with the disc's mirror, both ramps rise toward 12 o'clock and the teams meet at the top, the high ground the same for both.
**Layers.** Natural in tunnels (it replaces the little hills), ice (a luge down, a slide you can climb because the steps are 22 px), mines (an escalator: a belt up the ramp at 2.2 px a frame, walking against it about 4). Works in galleries, columns, flooded (down into a lake) and furnace (the way down into the heat). **Never** springs (a pad on a step bonks), updrafts (they replace the ramp's reason to exist).
**CPUs.** Slope pieces are already in v3's tunnels: the ramp step-up (24 px or less) and `mcRampSnap` for walking down. Nothing new.
**Risk.** (1) The jump counts in the table below are for 44 px steps: in the game these are 22 px slope steps and need none. (2) Shots favour whoever is uphill, so a ramp that rises toward one team's strip tilts the map; keep the mirror rule. (3) It is the cheapest highway between layers, so CPUs will funnel into it: a traffic point.
**Checked.** Cheapest route from A to the next port (stat 1, normal gravity): 2,100 px of ground, 11 jumps, 484 px climbed, 0 px fallen, mean headroom 264 px. No trapped spot, none unreachable.

### 7. The Attic (a dead-end pocket with a prize)

**What it is.** A sealed room 400 px wide and 180 px high *above* a corridor, with one hatch 120 px wide in its floor. A plank 108 px up under the hatch is the way in: jump up through the hatch. The prize (a heal, marmalade, power-up or assist capsule that respawns on a timer, not a fighter) sits at the back, about 100 px from the hatch. The only way out is the hatch. Ports: A and B along the corridor.

Cell 40 by 36 px, so the whole is 1,280 by 504 px.

```
################################
##########          ############
##########          ############
##########          ############
##########          ############
########## @        ############
##############   ###############


A            =====             B


################################
################################
```

**Size.** Pocket 280-420 by 180-250, hatch 100-140 wide, plank under it 100-110 up, prize 100-200 px from the hatch. The corridor 1,000 px or longer.
**Asks of a fighter.** Bait, greed and ambush: go in for the prize and you are in the one room with one way out, and whoever holds the hatch holds you.
**A fight there.** The hatch is a trapdoor choke: the fighter on the plank under it hits up through the hole (up-tilt, up-air) at whoever is entering, and the fighter inside drops onto them. Whoever commits first loses a hit, which is the bait. The fighter inside cannot be reached except through the hatch, one at a time. Knocked into the back wall, they bounce and stay in the room.
**Layers.** Natural in columns (a niche in the rock), tunnels (a closet off a tunnel) and the furnace (the pocket is the one place that does not burn: the prize and the refuge in one). Works in galleries, mines, flooded (the corridor wet, the attic dry). **Never** updrafts and springs (an escape: no longer a dead end), ice (you slide in and out), the surface.
**CPUs.** They go for items within 380 px when no foe is within 140 px (the item branch of the brain), so they will walk in: `steerClimb` takes the plank (108 px) and the hatch. They leave by dropping through it (`mcDropOk`: floor below). No new nav. Not tuned for: a person at the hatch farms them, as they would farm any CPU chasing an item.
**Risk.** (1) A fortress: a ranged fighter in the attic with allies on the plank. The only cure is that the prize is not worth sitting on: let it respawn on a timer, and not while someone is inside. (2) The item spawner (`mcFloorSpot`) only picks the crust, floors and the shell, so the prize needs a fixed stash spot (a new generator output). (3) A body that must be 48 px wide fits a 120 px hatch with 36 px each side: do not narrow it.
**Checked.** Cheapest route from A to the next port (stat 1, normal gravity): 1,240 px of ground, 0 jumps, 0 px climbed, 0 px fallen, mean headroom 200 px. No trapped spot, none unreachable.

### 8. The Racetrack (a loop with two entrances)

**What it is.** A ring round a solid block: a lower road at floor level, an upper road over the block, joined at both ends by a plank ladder of three 108 px steps, so you can run the whole circuit. A, the left entrance, and B, the right, are both on the lower road. A *chord* (a 120 px gap in the block's roof) lets you drop from the upper road to the lower one in the middle.

Cell 60 by 36 px, so the whole is 1,680 by 648 px.

```
############################
############################
#                          #
#                          #
#                          #
#                          #
#                          #
#     ==#####  #####==     #
#       #####  #####       #
#       #####  #####       #
#   ==  #####  #####  ==   #
#                          #

A ==                    == B

#                          #
############################
############################
```

**Size.** 1,200-1,800 by 600-700, roads 180 px high each, the block 140-160 thick, the chord 100-140 wide and mid-block.
**Asks of a fighter.** Flank, circle, chase. With two entrances a team can come in from both ends and pincer a fighter who cannot be pinned (there is always another way round).
**A fight there.** The ends are the fight: at each end you can see both roads through the open stair, so a fighter at an end is attacked from the road they came from and the one they did not. The high road is shorter and exposed (the chord is a gap you jump or drop through); the low road is longer and covered. Advantage to the faster fighter and to anyone with a projectile along a road. It is the anti-camp chamber, and equally the anti-kill one: a fighter who runs can run for ever.
**Layers.** Natural in tunnels (it is two tunnels round a block) and mines (the lower belt runs right, the upper runs left: a conveyor circuit that carries you round). Works in columns, galleries. **Never** ice (a slide-chase), updrafts and springs (a free lift: the loop becomes a ring with no need to go round), furnace, flooded, the surface.
**CPUs.** Ladders of 108 px (`navUp`), the chord is a gap (`brainLedge`) or a drop (`mcSafeDropX`). Nothing new. The circling the CPU report names (F1, F2, F3 in `cpu-circling.md`) is what a loop invites; the chord halves the circuit and does not remove it.
**Risk.** (1) Infinite chase: keep the chord and keep the loop under 1,800 px. (2) A stalemate between two teams each camping an entrance. (3) The block can look like two pieces because of the chord (it is a gap, not a bug).
**Checked.** Cheapest route from A to the next port (stat 1, normal gravity): 1,620 px of ground, 1 jump, 36 px climbed, 36 px fallen, mean headroom 336 px. No trapped spot, none unreachable.

### 9. The Chute (a one-way shaft)

**What it is.** A shaft 120 px wide and 550 px deep cut down through the floor of a corridor, with no steps and no way back up, ending in a belly room (800 wide, 220 high): 770 px from the corridor floor to the belly floor. The belly has two exits at floor level, neither of which leads back to the corridor above. A person can wall-jump up the shaft for only two jumps on a flat wall (about 100 px each), which is nowhere near 770 px. Ports: A and C along the top corridor, B and D out of the belly.

Cell 40 by 55 px, so the whole is 1,120 by 1,100 px.

```
############################


A                          C

############   #############
############   #############
############   #############
############   #############
############   #############
############   #############
############   #############
############   #############
############   #############
############   #############
####                    ####

D                          B

############################
```

**Size.** Shaft 120-160 wide and 500-900 deep, belly 400-800 by 220-300, the funnel at the mouth (two 22 px steps either side) is optional. Never a ladder or a ledge in it: one step and it is a hole.
**Asks of a fighter.** Commit: dive in to escape, to ambush below or to take a short way down. You do not come back this way.
**A fight there.** A one-way event, not a chamber to fight in. Whoever is losing can dive: the chaser may follow, and then the fight is at the bottom, where anyone who waited below had the first hit as they land. It shortens the way to a deep layer by a whole band. At the top the mouth is a gap you jump or drop into: a fighter knocked down it is out of the fight for the walk round.
**Layers.** Natural in mines (a belt in the belly carries the arrivals away from the foot: it cannot be camped). Works in galleries, columns, tunnels, ice (a funnel you slide into), flooded (a water cushion; fine), and as a sinkhole on the surface into the first cave. **Never** furnace (the belly would burn: a fall of 770 px into a flare), updrafts (a column up it makes it a two-way shaft), springs (a pad at the foot is a lift: not one-way).
**CPUs.** Going down is `nearestDropX`/`mcSafeDropX`: a hole with floor below (`standAt` finds the belly). Coming up they must not choose it: `mcRoute` and `mcPathCost` pick holes by band and `mcRouteSteer` climbs `h.steps`, and a chute has none, so an "up" route through it would stall on step -1. It needs a down-only flag in the passage table and one line in the router (a data flag, not tuning).
**Risk.** (1) The flag above. (2) A belly with only one way out is a camp: keep two. (3) The shaft is a perfect shooting lane for a straight shot down it: the belly's roof overhang, not the shaft, must be where people land.
**Checked.** Cheapest route from A to the next port (stat 1, normal gravity): 1,080 px of ground, 0 jumps, 0 px climbed, 770 px fallen, mean headroom 211 px. No trapped spot, none unreachable.

### 10. The Stump Hall (a wide arena with pillars)

**What it is.** One hall 2,400 px wide and 640 high. *Not* full-height pillars: a pillar from floor to roof is a wall, and it would split the hall in two (a body has no depth to walk round it). So the pillars are stumps from the floor, alternately 80 and 160 px, and four stubs hang from the roof; each stump top is a perch 120 px wide. Ports: A and B at the ends.

Cell 60 by 40 px, so the whole is 2,400 by 640 px.

```
########################################
########################################
         ##     #      ##     ##
         ##     #      ##     ##
         ##     #      ##     ##
                #             ##
                #



            ##            ##
A           ##            ##           B
     ##     ##     ##     ##     ##
     ##     ##     ##     ##     ##
########################################
########################################
```

**Size.** 1,800-2,600 wide, 560-700 high; stumps 120 wide, spaced 300-420; the floor stumps 80 px (a hop) and 160 px at most (two jumps, so the weakest jumper clears it), roof stubs 120-200 long.
**Asks of a fighter.** Take cover and hold a perch: a stump is a place to stand behind (it stops a body-height shot), a place to stand on (a sniper's perch) and a wall to jump off.
**A fight there.** The widest open floor in the set after the cathedral, so ranged fighters rule the flat; the stumps are the answer for melee (close the distance from stump to stump). A 160 px stump shelters the fighter behind it from a shot along the floor; the perch on top is exposed to a fighter one double jump higher. At 15 a side, six stumps are six small fronts.
**Layers.** Natural in columns (the rock at last the right size) and on the surface (a boulder field: the surface has none). Works in galleries, ice (a rink with bumpers), mines, flooded (wading), springs (a pad beside a stump hops you onto the perch), updrafts. **Never** furnace (a hot floor with 160 px stumps is the Hot Plates again, worse), tunnels, the crawl.
**CPUs.** `navAround` climbs a wall its two jumps clear (235 px at stat 1, 168 at the weakest): 160 is inside that for all of them, and `mcRockHop` hops the 80 px ones. Perches are ordinary tops.
**Risk.** (1) **If a stump is made taller than 168 px, the three weakest jumpers (stat 0.85) cannot cross the hall.** (2) Hall width needs a floor radius of 1,500, so not on the deeper rings or a small moon. (3) It is the closest of the sixteen to v3 (a flat floor with rocks), only bigger: the least different, ranked last.
**Checked.** Cheapest route from A to the next port (stat 1, normal gravity): 2,340 px of ground, 5 jumps (2 of them second jumps), 240 px climbed, 240 px fallen, mean headroom 416 px. No trapped spot, none unreachable.

### 11. The Grand Stair (a staircase of uneven steps)

**What it is.** A terrace climbing 324 px in five uneven risers (36, 108, 72, 36, 72) with treads of 180, 60, 180, 120 px, to a plateau 960 px wide with a 72 px dais in the middle. The hall around it is open: a flat roof, 216 px over the plateau. Ports: A at the foot, B on the plateau.

Cell 60 by 36 px, so the whole is 1,800 by 648 px.

```
##############################



                             B
                    ####
                    ####
              ################
              ################
            ##################
         #####################
         #####################
        ######################
A       ######################
        ######################
     #########################
##############################
##############################
```

**Size.** 1,500-2,400 long, rise 300-450, risers 36-108 (never over 110), treads 60-240, plateau 600-1,000.
**Asks of a fighter.** Climb with no rhythm: you cannot sprint it; you walk, hop, double-hop, stop on a 60 px tread. Fight over a high spot: the plateau is a king of the hill with a cliff on the stair side.
**A fight there.** The fighter above has the high ground and the shield from low shots (the risers are rock). The 108 px risers are the chokes: a fighter at the foot of one is in the air for a beat, which is when the one above hits. The narrow 60 px tread is a place to be knocked off. A launch down the stair tumbles the target several treads: a tempo loss.
**Layers.** Natural in galleries, flooded (the lower treads under water: wading up) and the surface (a mesa). Works in columns, tunnels, furnace (the way down into the heat). **Never** ice (uneven treads and a slide: no control), mines, springs and updrafts (a free climb removes the stair).
**CPUs.** Risers of 108 px or less are hops (`CLIMB_REACH` 130), and the `navAround` hop for a wall under 130 px. The three weakest jumpers use a second jump for the 108s, as on any v3 step.
**Risk.** (1) It looks like the Long Ramp: kept apart by being open (no stepped roof), uneven, and with risers that need a jump. Never place them next to each other. (2) A plateau reached only from one side tilts the map if it is not mirrored.
**Checked.** Cheapest route from A to the next port (stat 1, normal gravity): 1,740 px of ground, 5 jumps, 396 px climbed, 72 px fallen, mean headroom 261 px. No trapped spot, none unreachable.

### 12. The Sinkhole (a pit with a hidden side tunnel)

**What it is.** A corridor floor with a pit in it: a 200 px neck, then the pit widens under the lip (an overhang), so from the neck you cannot see the cavity's sides. Halfway down on the left, 240 px under the corridor, is the mouth of a side tunnel 160 px high running left under the corridor floor to its own exit, C. A plank ladder climbs from the pit floor to the tunnel's mouth, and a second, zigzag, to the lip. Ports: A and B along the corridor, C the tunnel.

Cell 40 by 40 px, so the whole is 1,280 by 800 px.

```
################################
################################



A                              B

#############     ##############
#############     ##############
                ==   ###########
                     ###########
C              ==    ###########
                     ###########
##########       ==  ###########
##########           ###########
##########==   ==    ###########
##########           ###########
################################
################################
################################
```

**Size.** Neck 200-260 (one running jump across: never wider, or a double jump and CPUs fall in), pit 400-700 deep, cavity 400-500 wide, tunnel 140-180 high, ladder steps 80-110.
**Asks of a fighter.** Drop, discover and flank: knocked or jumping in, you find a way out the foe did not watch.
**A fight there.** The lip is the place to be: whoever stands at the lip knocks the climber back in. The tunnel gives the climber a second exit that comes out behind the lip guard, so the guard is not safe either. The pit floor is a trap for the careless and an ambush spot for the ready: someone who drops in on purpose and takes the tunnel arrives behind a team.
**Layers.** Natural in mines (a shaft with a drift is literally that) and flooded (a flooded pit; the tunnel a siphon). Works in galleries, columns, ice (an icy lip: you slip in). **Never** furnace (a hot pit floor is Hot Plates at the bottom of a hole), updrafts and springs (they carry you out: no trap), tunnels (no height), the surface.
**CPUs.** The neck is a gap `brainLedge` jumps (reach 360). Knocked in they take the ladder (`navUp`). The tunnel is just a corridor at its own height, but v3's router only knows holes between *bands*: a side tunnel joining two places on one band needs its own entry in the passage table.
**Risk.** (1) The router entry above. (2) "Hidden" is a look, not a mechanic: the overhang hides the cavity from the neck, nothing else does. (3) Someone knocked in again and again by a lip guard is being farmed: the way out costs three jumps and a person can drop in on purpose, so I accept it.
**Checked.** Cheapest route from A to the next port (stat 1, normal gravity): 1,240 px of ground, 1 jump, 80 px climbed, 80 px fallen, mean headroom 203 px. No trapped spot, none unreachable.

### 13. The Hot Plates (a lava/furnace crossing)

**What it is.** A hall 2,160 px wide whose floor is four hot plates (300 px) with a cool stone between each (120 px wide, 40 / 80 / 40 px high) and cool ground at each end. Each plate flares for 70 of every 260 frames, as the furnace does, but each starts 65 frames after the one before: a wave of fire runs along the floor at the speed of a run (420 px of plate and stone per 65 frames, 6.5 px a frame). Run behind the wave and you never burn; race it and you do. Ports: A and B on the cool ground.

Cell 60 by 40 px, so the whole is 2,160 by 560 px.

```
####################################









A                ##                B
          ##     ##     ##
#####HHHHH##HHHHH##HHHHH##HHHHH#####
####################################
```

**Size.** 1,600-2,600 wide, 450-600 high; plates 250-350, stones 100-140 wide and 40-100 high, end ledges 250-350. Plate offset 65 frames (a quarter of the period; the shared clock `hazardT` is on every guest too).
**Asks of a fighter.** Read the clock under your feet: walk, stop on a stone, go when it cools. A rhythm, not an obstacle.
**A fight there.** The stones are the fight spots: 120 px holds one fighter, two if they stack. A knockdown on a flaring plate costs up to 35% and pops the fighter up, so every hit toward a plate is also a hit with fire. It turns a fight on a stone into "whose move is it": whoever is not on the stone loses a beat. The cool end ledges are the safe spots, so a team that holds a ledge has the room.
**Layers.** The furnace only. Everything else **never**: the burn has no meaning outside it, and the cool ledges and stones are what the furnace layer's low stepping stones are today, so this replaces them.
**CPUs.** Nothing in the brain reads the flare (`brainHazards` has no lava case; the v3 furnace has the same gap), so a CPU walks straight through. Estimate: 1,200 px of plate is about 190 frames of walking and the flares cover 27% of that, about 50 burning frames, roughly a quarter of a stock's damage per crossing. Not new, and not tuned for.
**Risk.** (1) `mcHotFloor` only tests the shell's top ring (`|r - shellTop| <= 3`) and one global clock: plates need to be data (arc, radius, phase) per floor. (2) CPUs bleed on every crossing; at 15 a side that is a large share of all damage dealt. (3) The wave's speed (6.5) is near run speed on purpose; change it and the "run behind it" rule goes.
**Checked.** Cheapest route from A to the next port (stat 1, normal gravity): 2,100 px of ground, 3 jumps, 80 px climbed, 80 px fallen, mean headroom 437 px. No trapped spot, none unreachable.

### 14. The Warren (invented: a block of small cells)

**What it is.** A block of six cells, three to a storey, each 360 px wide and 250 high, with 150 px doors between some of them and 180 px hatches in the floors between the storeys; each hatch has two planks under it, 100 px a step. Every cell has two ways in or out, so there is no dead end. Three openings to the outside: A (low, left), C (high, left), B (high, right).

Cell 60 by 50 px, so the whole is 1,320 by 650 px.

```
######################
#      #      #      #
#      #      #      #
              #
C             #      B
              #
##########   ####   ##
#      #      #      #
#      #   == #   == #
                     #
A       ==     ==    #
                     #
######################
```

**Size.** 1,100-1,600 by 650-900; cells 300-380 wide and 220-260 high, walls 60, doors 120-150 high, hatches 160-200 wide, planks 80-110 a step.
**Asks of a fighter.** Corner and door-fight: you cannot see past a wall, and every move is a doorway.
**A fight there.** The only chamber where a crowd splits into pods of two or three. Whoever is diagonal to a door has the advantage (a swing at a doorway cannot be answered from the next room), and a launch bounces off the cell walls, so a hit inside is a combo, not an exit. Lost people are the norm: it is the chamber where 15 v 15 turns into five 3 v 3s.
**Layers.** Natural in tunnels (a junction of tunnels) and mines (belts through the doors: an assembly line). Works in columns, flooded (the lower cells flooded). **Never** galleries (they are open), furnace (hot floors in cells with no stones), ice, springs, updrafts (a lift removes the doors and hatches that make it a warren), the surface.
**CPUs.** Doors are floor level (walk), hatches are 100 px planks (`steerClimb`), and the 4 s give-up after "NO WAY THROUGH" is in place for a CPU that picks the wrong cell. No new nav, and there is no dead end to get stuck in (the check below finds no trapped spot).
**Risk.** (1) CPUs lose each other in it: `mcCrowd` picks the biggest fight for CPUs that have found nothing for a while, which a warren will trigger often. (2) A dead-end cell is a camp: there is none, and one must not be added. (3) A person gets lost on the first visit: that is the point, but it needs the minimap.
**Checked.** Cheapest route from A to the next port (stat 1, normal gravity): 1,260 px of ground, 3 jumps, 300 px climbed, 0 px fallen, mean headroom 278 px. No trapped spot, none unreachable.

### 15. The Crater (invented: an open bowl with a peak)

**What it is.** A dip in the *surface*: three terraces of 80 px a side (rim at 240 px over the floor), a flat bowl 960 px wide and a central peak 240 px wide and 120 px high (a 40 px shoulder, then 80). Open to the sky, no roof. It is the surface's missing variety: v3's surface is one flat ring with hop-tops. Ports: A and B on the rim.

Cell 60 by 40 px, so the whole is 2,400 by 480 px.

```


A                                      B

######                            ######
######                            ######
#########                      #########
#########         ####         #########
############      ####      ############
############     ######     ############
########################################
########################################
```

**Size.** 1,800-2,800 wide, 240-320 deep, terraces 3 a side, risers 80, floor 700-960, peak 200-280 wide and 100-130 high.
**Asks of a fighter.** Hold the rim, hold the bowl or take the peak: height means safety or danger.
**A fight there.** The new thing is KO distance: space starts 1,300 px above the surface (`Rblast`), so a launch from the rim has 1,300 px to go and one from the bowl floor 1,540. **The rim kills; the bowl is safe.** In v3 every standing place on the surface is equally far from space; here it depends on where you stand. The fighter on the rim hits down into the bowl and sees all of it; the peak is a small high spot with an edge all round. Low gravity (the surface has the Moon's) makes the 80 px terraces one hop.
**Layers.** The surface only. A cave twin, the *Sink* (240 deep, a lake in flooded), would work in galleries, columns, ice and flooded; never in the deep layers.
**CPUs.** Terraces of 80 px are hops (`CLIMB_REACH` 130) and the peak is a hop from a 40 px shoulder. Nothing new.
**Risk.** (1) The crust is only 140 px thick and the crater is 240 deep, so the rock under a crater must be thickened by at least 100 px: the first cave cannot run under it. (2) Whoever holds the rim is far safer than anyone below; the crater needs a way back up on both sides (it has the terraces). (3) The blast ring is the same for the whole disc, so the crater floor is closer to the first cave than the rim: check the cave roof.
**Checked.** Cheapest route from A to the next port (stat 1, normal gravity): 2,340 px of ground, 5 jumps, 360 px climbed, 360 px fallen, mean headroom 560 px. No trapped spot, none unreachable.

### 16. The Barricade (invented: one wall, three lanes)

**What it is.** A hall 2,160 px wide, closed by a wall 180 px thick and 360 px high across the middle, with three ways past it: a *floor door* (108 px high, 180 px long), a *window slit* (72 px high at 216 px up, reached from two *firing steps* of planks at 108 and 216 on each side), and the *ridge* on the wall top (360 px up, a double jump from the firing step in normal gravity, a single jump in the Moon's low gravity). Ports: A and B on each side. In the sketch the wall reads, from the top, as a slab, the slit, a block with a firing step each side of it, and the door.

Cell 60 by 36 px, so the whole is 2,220 by 576 px.

```
#####################################
#####################################


                 ###
                 ###


              ===###===
                 ###
                 ###
           ==           ==
A                                   B

#####################################
#####################################
```

**Size.** Hall 1,800-2,400 by 520-640, wall 300-400 high and 180 thick or more (see Risk), door 100-130 high, slit 70-90 high, firing steps 100-110 up.
**Asks of a fighter.** Breach and hold the line: the first chamber that sets one team against the other. Choose a lane: the door (fast, one at a time), the window (two jumps up, exposed) or the ridge (the human lane).
**A fight there.** The wall is the front. The door is a choke where a fighter inside the 180 px tunnel can be hit from both ends. A defender on a firing step has the window and the ridge above, so the fight stacks in three rows. The ridge is exposed on both sides at once: a place to win a duel and lose the room. In a team fight it is the chamber where everyone has a front rank.
**Layers.** Natural in columns and mines (a conveyor through the door: an assembly line) and flooded (a dam: water on one side only, slow against dry). Works in galleries, ice, springs (a pad at the foot is a springboard over), updrafts. **Never** tunnels (no height), furnace, the surface.
**CPUs.** Steps of 108 px (`navUp`), the door is floor level (walk), the wall is 360 px so it reads as "tall" and `aiWallWay` sends them to the door or the steps; they will not use the ridge (two jumps from a 216 px step to 360 px).
**Risk.** (1) **No swing-stopping:** I found nothing that stops a swing at rock, so a long-reach attack could hit across a thin wall; 180 px thick is the least I would draw, and I could not tell whether that is enough. (2) The door jams at 15 a side. (3) The slab over the slit and the block over the door are rock with nothing under them (the engine has no structure rule and v3 has floating rock), but the generator should draw them as piers.
**Checked.** Cheapest route from A to the next port (stat 1, normal gravity): 2,160 px of ground, 0 jumps, 0 px climbed, 0 px fallen, mean headroom 406 px. No trapped spot, none unreachable.

## 3. How different they feel to walk

Ranked from most different from a v3 cave (flat floor, about 350 px of clear headroom on average, no climb, a jump only for a ledge) to least. The numbers are the check's cheapest route from the first port to the next (stat 1, normal gravity, route cost counts jumps as dearer than steps); "head" is the mean headroom over the feet along the route.

| Rank | Chamber | What your feet do | Route (px) | Jumps | Climb + fall | Head |
|---|---|---|---|---|---|---|
| 1 | 2 The Crawl | a hat-height roof: the jump is dead | 2,340 | 0 | 0 + 0 | 163 |
| 2 | 9 The Chute | a 770 px drop and no way back | 1,080 | 0 | 0 + 770 | 211 |
| 3 | 1 The Chimney | up 770 px in 440 px of travel | 440 | 7 | 770 + 0 | 228 |
| 4 | 13 The Hot Plates | read the clock, stop on the stones | 2,100 | 3 | 80 + 80 | 437 |
| 5 | 3 The Cathedral | a floor under 880 px of air | 2,580 | 1 | 110 + 110 | 557 |
| 6 | 4 The Span | a plank with a drop both sides | 2,100 | 0 | 0 + 0 | 440 |
| 7 | 6 The Long Ramp | uphill with no flat and no jump | 2,100 | 11 | 484 + 0 | 264 |
| 8 | 15 The Crater | down 240 and up again under open sky | 2,340 | 5 | 360 + 360 | 560 |
| 9 | 7 The Attic | up through a hole in the roof | 1,240 | 0 | 0 + 0 | 200 |
| 10 | 5 The Teeth | a comb overhead: jump with care | 1,740 | 4 | 280 + 240 | 423 |
| 11 | 14 The Warren | doors and corners, stop-start | 1,260 | 3 | 300 + 0 | 278 |
| 12 | 12 The Sinkhole | a pit to jump and a tunnel to find | 1,240 | 1 | 80 + 80 | 203 |
| 13 | 16 The Barricade | one wall, three ways past | 2,160 | 0 | 0 + 0 | 406 |
| 14 | 11 The Grand Stair | uneven treads: no rhythm | 1,740 | 5 | 396 + 72 | 261 |
| 15 | 8 The Racetrack | a circuit with a ladder at each end | 1,620 | 1 | 36 + 36 | 336 |
| 16 | 10 The Stump Hall | a flat floor with rocks, only bigger | 2,340 | 5 (2 second) | 240 + 240 | 416 |

The Long Ramp's 11 jumps are for the sketch's 44 px steps; in the game they are 22 px slope steps and need none.

Why this order, and where I overrode the numbers:

1. **Crawl.** Head 163 on average, and 105 px for most of it; nothing else takes the jump away. Different in kind.
2. **Chute.** 770 px straight down with no way back: not a walk but an event. (The route's "fall" of 770.)
3. **Chimney.** 770 px of climb in 440 px of travel: 1.75 px of height for every px of ground, against 0.71 for the chute and 0.31 or less for every other room. An up-and-down walk.
4. **Hot Plates.** The geometry is a flat floor (the numbers say "ordinary"), but you are reading a clock, and nothing in the table can show that: I rank it by the verb.
5. **Cathedral.** Mean headroom 557 px over a 2,580 px floor (only the open-sky Crater, capped at 560, matches it): scale.
6. **Span.** The walk is flat and straight (0 jumps) but with a drop on both sides: exposure.
7. **Long Ramp.** 484 px climbed in a straight line with no flat: slope.
8. **Crater.** Open sky overhead (head 560 is the check's cap) and a floor that goes down 240 and up again: the open end of the scale.
9. **Attic.** The only chamber that is a hole in a roof.
10. **Teeth.** A roof that is a comb: ordinary on the floor and different the moment you jump.
11. **Warren.** Stop-start through doors; 3 jumps and 300 px of climb in 1,260 px.
12. **Sinkhole.** Flat but with a pit you can see and a tunnel you cannot.
13. **Barricade.** A flat hall with one wall in it; the walk across is 0 jumps by the door.
14. **Grand Stair.** The same family as the ramp but with a rhythm that never settles; the numbers (396 up in 1,740) are ramp-like and it ranks below because it is open overhead.
15. **Racetrack.** Floor with one ladder at each end: a circuit.
16. **Stump Hall.** Flat floor with rocks, bigger: the least different.

Pairs that are close and must not sit next to each other on a route: Long Ramp and Grand Stair (both climb); Chimney and Chute (both vertical, opposite ways: fine together as the "up and down" pair, never in a row with nothing between); Span and Hot Plates (both cross a hazard); Attic and Warren (both small and closed); Teeth and Stump Hall (both fields of obstacles); Racetrack and Warren (both have doors and loops).

## 4. Which layer kinds each suits

`+` natural, `o` works, `-` must not (each reason is in its entry). Columns: the nine kinds, and the surface. A kind is dressing (a zone and a look on the chamber) and an archetype is the room, so 16 rooms by about four kinds each is over sixty different places without a new zone. (The Crater's cave twin, the Sink, is `o` in galleries, columns, ice and flooded.)

| # | Chamber | galleries | columns | tunnels | furnace | springs | ice | updrafts | mines | flooded | surface |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Chimney | o | o | o | - | o | - | + | + | - | o (a tower) |
| 2 | Crawl | - | o | + | - | - | o | - | + | o | - |
| 3 | Cathedral | + | o | - | - | o | o | + | o | o | - |
| 4 | Span | + | + | - | + | - | o | - | + | o | o |
| 5 | Teeth | o | + | - | o | - | + | - | o | o | - |
| 6 | Long Ramp | o | o | + | o | - | + | - | + | o | o |
| 7 | Attic | o | + | + | + | - | - | - | o | o | - |
| 8 | Racetrack | o | o | + | - | - | - | - | + | - | - |
| 9 | Chute | o | o | o | - | - | o | - | + | o | o (a sinkhole) |
| 10 | Stump Hall | o | + | - | - | o | o | o | o | o | + (a boulder field) |
| 11 | Grand Stair | + | o | o | o | - | - | - | - | + | + (a mesa) |
| 12 | Sinkhole | o | o | - | - | - | o | - | + | + | - |
| 13 | Hot Plates | - | - | - | + | - | - | - | - | - | - |
| 14 | Warren | - | o | + | - | - | - | - | + | o | - |
| 15 | Crater | - | - | - | - | - | - | - | - | - | + |
| 16 | Barricade | o | + | - | - | o | o | o | + | + (a dam) | - |

What the table says at a glance. The **surface** gets four of its own (Crater, Stump Hall as a boulder field, Grand Stair as a mesa, Chute as a sinkhole), where v3 has one flat line. **Furnace** takes one that is only its own (Hot Plates), the Span over heat, the Attic as a refuge, and a descent. **Mines and tunnels** are the most welcoming kinds (belts and stacked tubes fit anything long and low). **Springs and updrafts** are the pickiest: they carry you off the floor, so any room whose point is a floor-bound route (crawl, racetrack, warren) rejects them.

## 5. Keeping them different

The reason a generator goes samey is that it varies *numbers* inside one shape. This library is held apart by fixing the number that makes each room what it is.

Orientation: H horizontal, V vertical, D diagonal, R ring, P pit, S small and closed.

| # | Chamber | Orientation | Open to the sky? | Clear height (px) | Invariant: never tune | Needs floor radius (px) | Mirror |
|---|---|---|---|---|---|---|---|
| 1 | Chimney | V tall slot | no | 160 wide, 1,000 tall | width <= 190; steps <= 110; faces staggered | 300 | pair |
| 2 | Crawl | H long, low | no | 105 (bays 315) | roof <= 110; bays <= 700 apart | 1,500 | pair |
| 3 | Cathedral | H and V, a vault | no | 880 | clear height >= 800; 400 over the pulpit | 1,650 | self |
| 4 | Span | H over a drop | no | 440 over it, 330 under | one plank wide; drop >= 330; no air or pad under it | 1,350 | self after a retune |
| 5 | Teeth | H, a comb | no | 480-560 | tip >= 160 over the floor; rock to tip >= 60 | 1,125 | pair |
| 6 | Long Ramp | D diagonal band | no | 260 along a 484 climb | grade <= 25%; 22 px steps; roof >= 240 | 1,350 | pair |
| 7 | Attic | S small, sealed | no | 180 | one hatch; sealed; prize deep | 800 | pair |
| 8 | Racetrack | R ring | no | 180 a road | the chord; <= 1,800 round | 1,050 | self |
| 9 | Chute | V down-only | no | 550 shaft, 220 belly | no step in it; two belly exits | 700 | self after a retune |
| 10 | Stump Hall | H wide | no | 480-560 | floor stumps <= 160; >= 1,800 wide | 1,500 | self after a retune |
| 11 | Grand Stair | D terraces | no (open hall) | 216 over the plateau | risers <= 110 and uneven; no stepped roof | 1,125 | pair |
| 12 | Sinkhole | P pit | no | 200 corridor, 400 pit | neck <= 260; a side tunnel | 800 | pair |
| 13 | Hot Plates | H floor | no | 440 | offset a quarter period; cool stones; cool ends | 1,350 | self |
| 14 | Warren | S cells | no | 250 a cell | no dead end; doors 120-150 high | 825 | pair |
| 15 | Crater | H bowl | yes | open | deeper than the crust; terraces both sides | 1,500 | self |
| 16 | Barricade | H walled | no | 480 | wall >= 180 thick; three lanes | 1,400 | self |

Rules for whoever places them:

1. **Neighbours differ on at least three of the five columns** (orientation, openness, height class, verb, and what is underfoot). Section 3's close pairs are the ones to watch.
2. **One archetype at most twice in a layer, never twice in a row.** A layer is 3 to 6 rooms between its shafts.
3. **Pick by verb, not by size.** If a room needs to be bigger, it is a different room: the Stump Hall at 2,600 is still a Stump Hall, the Chimney at 240 wide is a gallery.
4. **A kind is chosen second.** Pick the room, then the dressing from section 4.
5. **No room is in both halves unmirrored.** Rooms marked "pair" need a mirror image on the other half (the 12-6 rule); rooms marked "self" can sit on the 12-6 line.

## 6. What each room asks of the generator (not built)

Nothing here was built or measured against the live game; this is what I read in `mcGen` and the brain.

- **Boxes and planks only, as `mcGen` already puts them:** Crawl, Span, Teeth, Stump Hall, Racetrack, Barricade, Warren, and the two slope rooms (Long Ramp, Grand Stair: `slope` pieces already exist and the CPU already walks them).
- **A small new piece of data:**
  - *Chimney*: wall faces cut as offset blocks, so every band has its own angle for `mcWallId`.
  - *Chute*: a down-only flag on the passage (`holes[].down`), and one line in `mcRoute`/`mcPathCost` so an up route never picks it.
  - *Sinkhole*: a side tunnel as an entry in the passage table (v3's holes join bands, not two places on one band).
  - *Hot Plates*: hot arcs as data (arc, radius, phase) per floor; `mcHotFloor` today tests only the shell top and `mcHotOn` one clock.
  - *Attic*: a fixed stash spot for the prize; `mcFloorSpot` only picks crust, floor and shell pieces.
- **A bigger change, the room is not a ring band:** Cathedral (spans two or three bands), Crater (digs 240 px into a crust that is 140 thick, so the cave under it must go), and any Span or Chute that crosses a band boundary. Here `mcLayer` (by the radius of the feet) and the router's "layer" idea stop being enough: a room needs to publish its own ports (side, height, width, one-way or not) and the router should read those. This is the biggest dependency, and it belongs to the topology designer.
- **Mirror:** the ones marked "pair" in section 5 come as a pair; only symmetric rooms (3, 8, 13, 15, 16, and 4, 9, 10 with a small retune) can sit on the 12-6 line.
- **Camera, drawing, netcode:** nothing new beyond v3 (pieces are boxes and arcs; the plates' phase uses `hazardT`, which a guest already has).

## 7. How I checked, and what I found

A throwaway script (scratchpad `moon-v4/library-1`, `chambers.mjs`, `analyze.mjs`, `render.mjs`; plain node at BelowNormal, one process at a time, no game loaded, no browser) takes each sketch as a grid and flies a 48 by 48 px body through it with the game's own numbers (`JUMP` -12.5, gravity 0.62 and 0.434, run 6.4, air 6.0, rock solid, planks one-way, a head into a roof cut to zero). From every standing spot it tries walking, walking off, a jump, a jump with a second jump at three times, short hops, and a drop through a plank, in both directions, then asks which ports reach which. It ran at stat 1 and at the weakest jump stat (0.85), in normal and low gravity.

What it found:

- **All 16 connect their ports, and nothing is trapped or unreachable**, at stat 1 in both gravities and at 0.85 in both, with second jumps allowed. Without them: at stat 1 every room connects by single jumps except the Stump Hall in normal gravity (its 160 px stumps are two jumps); at 0.85 in normal gravity the Chimney, Cathedral, Grand Stair and Warren need a second jump for their steps (as v3's steps do), and the Stump Hall needs one in both gravities.
- **The Chute is one-way as drawn:** the belly exits reach each other and not the corridor above (the check's port table: A and C reach everything; B and D reach each other only).
- **The Barricade's ridge** is reachable only with two jumps in normal gravity (an island in the check), and in the Moon's low gravity with one.
- **Four of my first drafts were wrong and the check found them:** the Teeth had a sealed gate (a stalagmite 40 px under a tooth tip: nothing crossed; now a rule); the Cathedral's stairs were a solid wall between the doors and the nave (it is now floating islands); the Warren's hatches had planks beside them, not under them, so a jump bonked the floor above; the Sinkhole's 320 px neck needed two jumps (now 200). One more was the check's own fault: a first run counted the top of the rock mass as floor. And the Stump Hall's 200 px stumps were cut to 160 after I looked up the roster's weakest jump (stat 0.85: two jumps clear 168 px, not 235).

What it cannot tell you: anything about fights, heat, bodies pushing each other, how a camera looks on a curved disc, or how the CPUs actually behave in a room (I read the brain for each room and name the function; I did not run a CPU match). The cells are 35-60 px, so a 5 px lip or a 1 frame timing is invisible to it. The rises are for a stat-1 body; the weakest jumpers use a second jump on anything over 86 px in normal gravity.

Files: `C:\Users\carad\Aardvark\smash-island\smash-bal\reports\moon-caves-v4\library-1.md` (this), `library-1-sheet.png` (all sixteen at one scale: a 48 px orange body, the dots are the cheapest route). Scratchpad: `C:\Users\carad\AppData\Local\Temp\claude\C--Users-carad--claude\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\moon-v4\library-1\`.
