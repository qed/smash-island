# Moon Caves v4, designer 3: the natural room family

2026-11-02. Plan only. Nothing in the game was edited, committed or pushed; the only things run were throwaway node scripts on paper grids (section 8). The owner's words (2026-11-02), after the v4 spec: "the lower caves should get more 'natural' formations. they should still have rooms, but smaller ones that are more natural." Asked which caves count as lower: "Mixed in every cave". This file is the answer to that: eight kinds of small, rough cave room, a rule for how many of each cave they fill, and the checks.

Read with: `owner-decisions.md` (it wins), `v4-spec.md`, `library-1.md`, `library-2.md`, `why-samey.md`. Files of this job: `natural-chambers.mjs` (the rooms, as recipes and as grids), `natural-sheet.png` (the picture), `natural-tools/` (the checks).

---

## 0. The short version

- **Eight natural kinds**, each a different shape and a different thing to do, none of them "a bumpy floor with other numbers". Four are not about a bumpy floor at all: a dome (the roof), a waist (two bays and a neck), a shelf under an overhang (a roof step) and a bowl with a ladder of shelves (the Vug); a fifth, the Wriggle, is a low tube that is a ramp road.

| # | Natural kind | The verb | The shape in one line | Size (px) |
|---|---|---|---|---|
| 21 | **The Reef** | perch | two or three stacked stalagmites, caps one body wide, on a valley floor | 640-1,152 wide, 304-336 high |
| 22 | **The Breakdown** | scramble | a collapse heap jammed against the roof: stairs up, a 112 px squeeze over the crest, two bites down | 512-736 wide, up to 336 high |
| 23 | **The Wriggle** | wind | a 144-160 px tube that waves up and down on 27 degree ramps, pinching at every rise | 384-896 wide, 176-256 high |
| 24 | **The Roost** | arch | a dome: 128 px of roof at the rims, 256-384 px over the middle, a plank for the bats | 576-896 wide, 256-384 high |
| 25 | **The Strand** | bank | an underground stream: a high bank, flowstone terraces down, a wet bed with sandbars, a lower bank | 672-992 wide, 240-256 high |
| 26 | **The Vug** | ring | a crystal tent over a bowl 96 px below the rim, shelves climbing the walls | 432-592 wide, 304-416 high |
| 27 | **The Dumbbell** | choke | two domed bays of different sizes joined by a 128 px neck | 576-992 wide, 256-320 high |
| 28 | **The Shelter** | overlook | a low shelf under an overhang, a 48-64 px drop, a taller hall | 448-800 wide, 288-336 high |

- **Every number is a multiple of 16 px and every shape is rebuilt from an integer seed** by a few lines with no float and no trig (`natural-chambers.mjs`); the grids in that file use the same format as the library's `chambers.mjs`, so the paper sampler and the screen check read them unchanged (and I ran both: section 8).
- **They are smaller on purpose and the planner puts them in first.** Width 384-1,152 px against the library's 150-3,000; the share of each cave's walkable length grows from 15% in the first cave to about 60% in the tunnels (and about half in the furnace, which holds only two rooms a half; section 1).
- **They are not a free pass on fairness.** Every required step is 64 px or less (one jump for the weakest jumper in both gravities), no natural room has a wall to climb, every roof is 112 px or more over a floor, and a flight check of a 48 px body found all eight connected with no trapped spot (section 4). Seven real mistakes were found by drawing and by the checks, and fixed (section 4.3).
- **What it costs the planner:** two new orientation codes (W winding, L ledged), a natural quota placed before the built fill, one exception to the pole rule (four natural kinds can be built symmetric and take a pole slot), and the plug and floor-offset rules of section 3. Nothing the builder does not already have: boxes, planks, ramps, the district's footing on a bed.
- **What I need decided** is in section 9; the first is the furnace (its share, and whether the Hot Plates must stay a pole room).

A note on words. The v4 spec calls a room "natural" (the planner's `nat` flag) when its kind has a `+` affinity for the cave it is in. That is a different thing from the owner's "natural formations". In this file **natural room** means the owner's: one of the eight below. I would rename the planner's flag `sig` (signature) before V0 so the two never meet in code.

---

## A. How a natural room is made (the frame every recipe shares)

**Cells.** A room is a grid of cells 16 px wide and 16 px high (the library's are 35-60 px). Heights and widths are whole cells. Local x runs along the ground, local y up (away from the core). Local zero is the floor of port A unless a kind says otherwise. Every grid has two rows of rock above and below, and port characters `A` (left) and `B` (right) in the air cell above the end floors, the same as the library's.

**The hash.** `hash(seed, key)` is a 32-bit integer mix (`Math.imul`, shifts, xor; no float, no trig, no `Math.random`). A recipe draws numbers in the order it is written: `r(m) = hash(seed, kindId * 1000 + n) % m`, `n` counting up from 0. So the planner (to size the room) and the builder (to cut it) get the same numbers from the same seed, in any browser. The seed is the only thing the plan stores for the roughness (an integer; about 24 bytes a room with the flags: well inside the 2-3 KB the spec allows).

**Three tools make the roughness.**
1. `chunky(lo, hi, m)`: the floor or roof goes up and down in **runs** of lo to hi cells at a level 0..m (so a bump is at least 3-4 cells wide: no 16 px spikes).
2. A **fixed table** for domes: `DT = [0,0,0,0,1,1,2,2,3,4,5,6,7,8,10,12,14,16,17,18,19]`, drop = `(top - 8) * DT[d] / 19` by integer division, `d = distance * 20 / half-width`. A dome without a sine.
3. **Tier lists**: a stalagmite or a heap is a short list of (width, rise) pairs drawn from a few numbers (inset 2-3 cells, rise 2-3 cells), so its steps are always whole, always at least 32 px deep, never more than 64 px high.

**One clean-up (`tidy`).** After a recipe has drawn the floor, any pit narrower than 4 cells (64 px) with higher floor on both sides is filled to its lower side, and any 1-cell run is merged into its lower neighbour. The flight check found why (section 4.3): a 48 px body wedges in a 48 px notch, and a mound landing on a chunky run made such notches.

**Five options the planner can pass** (all in `build(key, seed, opt)`):
- `hc`: the district's head in cells (head / 16: ice and mines 16, flooded 17, columns 21, furnace 22, galleries 23, springs 25, updrafts and tunnels 26). **No natural room's air reaches higher than `hc` cells above its lowest floor**, so a natural room never claims the district above (the spec's claim rule never fires for one). A kind that cannot shrink under `hc` is not offered there (`minHead`: the Vug 20, the Shelter 18, the rest 16).
- `bedChar`: the district's footing on the room's **bed**: `%` ice, `>` belt, `^` pads, `H` hot; water and draughts are zones the builder lays over the bed.
- `flip`: the room mirrored left to right (ports swap, belts reverse). This is also exactly what the 12-6 mirror does to a room on the left half, and what the planner uses to cancel floor drift (section 3).
- `sym`: the room is its own mirror image (the left half mirrored): **only the Reef, Roost, Vug and Dumbbell** may be built this way, so they can take a pole slot or sit on the axis. The other four are pairs.
- `open`: no roof (the surface variants of the Reef and the Breakdown: regolith tors and a boulder pile).

**The bed.** Each room has a **bed**: its lowest continuous floor, never a perch, a mound, a boulder, a sandbar, a sill or a stair. **The bed takes the district's footing**: ice slick, belt, pads, water, hot clock, or plain. That is how one recipe is a different place in different caves, and why the furnace can have natural rooms: every bed in a furnace room burns on the district's wave and every perch, bar, boulder and stair is cool basalt.

**The locked invariants (v4-spec section 3) and what these rooms hold themselves to.** `validate()` checks all of these on every grid; it reported 0 violations in 300 seeds of each of the 8 kinds, in 200 seeds under every head cap (60 kind-and-cap pairs) and in 200 seeds of each symmetric build.

| Locked in the spec | A natural room's own number | Why tighter |
|---|---|---|
| step or ledge at most 110 px | **required steps at most 64 px**; an optional perch (the Roost's plank) at most 96 px | one jump for every jumper in both gravities: 64 px is under the weakest jumper's 86 px |
| wall on a floor at most 160 px | **no wall at all**; the biggest single step is 64 px | the heap and the spires are stairs, never a face to climb |
| rock between two spaces at least 100 px | at least 112 px (7 cells) between two different air spaces; a fang or a spire inside one space may be 64 px | a fang is not a wall |
| doors at least 108 high, 120 wide | ports **128 px high** | 8 cells |
| roof at least 110 px over a floor where a body walks | **at least 112 px over every floor cell** | 7 cells; the Wriggle is 144-160, the Breakdown's crest 112, the Dumbbell's neck 128 |
| no dead end | the flight check: every standable spot reaches both ports | section 4 |
| (mine) walkable tread | every standable step at least 32 px wide | CTF's slopes are 40 px; no 16 px teeth for a nav graph to trip on |

---

## B. The eight rooms

Sketches are the canonical seed of each kind, one character 16 px, rock rows above and below trimmed to one; `A` and `B` are the ports, `=` a one-way plank. The same eight at three seeds each, drawn at one scale with a 48 px body beside them, are in `natural-sheet.png` (the last row shows the Reef with a hot bed, the Strand with an ice bed and the Roost with a pad bed). `natural-chambers.mjs` holds the recipes; what follows is each recipe in words and numbers.

"Clear height" in the size lines is the tallest air above the lowest floor (the envelope). The **height class** in the axes is by the **median** air column (what you feel standing in it): a Wriggle is 144-160 px of air nearly everywhere, even though its envelope is 176-256.

### 21. The Reef: perch

**What it is.** Two or three stalagmites rise from a valley floor as stacked, narrowing tiers, each ending in a cap just wide enough for one body, under a rough roof with a couple of hanging fangs. The cap is the high ground; the valley is a lane between rock, and a shot along the floor stops at the next stack.

```
###################################################
###    ############################      ####### ##
###    #####           ############      ####### ##
##                     ##                     ## ##
##                                            ## ##
##                                               ##
##                                               ##
##                                               ##
##                                               ##
##                                               ##
##                                               ##
##                                               ##
##                                               ##

                                   ###
                                   ###
          ######                   ###
          ######                 #######
          ######                 #######
       ###################     ###########
A      ###################     ###########        B
###################################################
```

**Exact geometry** (cells of 16 px; kind id 21).
- `n` = 3 stacks if `r(3) = 0`, else 2. Roof `Rtop = min(19 + r(3), hc)` cells over the valley floor (304-336 px).
- Each stack: tiers `T = 2 + r(2)`, foot width `11 + r(3)` cells (176-208 px), a rise per tier of `2 + r(2)` cells (32-48 px, the total capped at `Rtop - 9` so a cap keeps 112 px of air under the deepest roof bump), each tier inset `2 + r(2)` cells (32-48 px) a side, cap at least 4 cells (64 px). Stack heights come out 64-144 px.
- `n + 1` valleys of at least 6 cells (96 px), plus `r(11)` spare cells dealt out one at a time to a drawn valley; a valley of 10 cells or more may hold one 32 px bump, 3-4 cells wide.
- Roof: `Rtop` minus a chunky run (3-7 cells, 0-2 cells down); two fangs 2 cells wide hanging 3-4 cells below `Rtop`, only over valleys of 8 cells or more; the two end columns are the doors (roof at 8 cells).
- Largest step 48 px.

**Bed.** The valley floors (never a bump or a stack). In the furnace the valleys burn and every stack is cool, so the caps are the refuge.

**Size.** 640-1,152 px wide (median 800), air 304-336 px, ends level.

**Where.** `+` springs (pads in the valleys throw you onto the caps), columns (crystal spires), ice (ice spires, icicle fangs, slick valleys), flooded (half-sunk stalagmites), furnace (basalt spires), surface (open variant: regolith tors). `o` galleries, updrafts, mines, tunnels. It fits every district head (`minHead` 16), so **no cave kind is closed to it**; the only neighbour rule is "not next to the Teeth" (both are fields of spikes).

**Links it owns.** A throat at each end (both at the valley floor); a **crack** (way up) or a **pore** (down only) over a valley of 10 cells or more, never over a bump; none in the furnace's valleys (a crack there would let the heat climb).

**A fight.** Fights are won from the caps. A cap is 64-80 px wide and 64-144 px up, so whoever holds one hits down on a valley, and a shot along a valley stops at the next stack (the stacks are 176-208 px at the foot). A knockback off a cap lands in a valley, not out of the room, so nobody is killed here; climbing back is up a 32-48 px stair on either flank, one jump a tier.

**CPUs.** Tiers are ledges of 32-48 px, well inside the CPU's ledge reach (130 px): `steerClimb` and `navUp` climb them as they climb a v3 step; the valleys are flat floor. No new nav and no tuning.

**Risk.** (1) A cap camper with a projectile: a cap holds one body and has a stair flank on each side, so a camper can be climbed to. (2) A crowd in a valley at 15 a side: a valley is 96-256 px. (3) In the furnace the burn must be counted per valley (V5): the longest hot valley is 256 px.

**Axes.** orientation H (horizontal, spiked), openness closed (sky on the surface), height mid, width M (S in 13% of seeds), verb perch, footing the district's (on the bed).

### 22. The Breakdown: scramble

**What it is.** A collapse heap jammed against the roof: you climb irregular stairs up one side, cross a crest with only 112 px of air over you (no jumping, a launch up hits the roof), and step down two 64 px bites on the other side. It is the one natural room that is a squeeze and a climb at once, and it is short.

```
#########################################
##           ######################    ##
##            ####################     ##
##             ##################      ##
##              ################       ##
##               ##############        ##
##                ############         ##
##                                     ##
##                                     ##
##                                     ##
##                                     ##
##                                     ##
##                                     ##
##                                     ##
              ################
              ################
              ################
         #####################
         #########################
      ############################
      ############################
A     ############################      B
#########################################
```

**Exact geometry** (kind id 22).
- Rises: one of six patterns summing to 8 cells (128 px): `[3,3,2] [3,2,3] [2,3,3] [4,2,2] [2,4,2] [2,2,4]` (drawn by `r(6)`), so the stair is 32-64 px a step; treads `3 + r(3)` cells (48-80 px) each.
- Crest: 8 cells (128 px) above the base floor, `8 + r(5)` cells long (128-192 px). Down the other side: a 64 px talus step, `4 + r(2)` cells wide, then the base floor: the "cliff" is two bites of 64 px.
- Flats: `5 + r(4)` cells at the stair end, `4 + r(4)` at the talus end.
- Roof: **15 cells over the base (240 px: 112 px over the crest) along the whole crest, then rising one cell per column (45 degrees) to `min(21, hc)` cells (336 px)** on both sides. Ends: doors (roof 8 cells).
- Largest step 64 px; no wall.

**Bed.** The two base floors. (The heap is never bed: in the furnace the heap is slag that has cooled.)

**Size.** 512-736 px wide (median 624), 336 px envelope (256 px under a 260 px head: the V simply starts lower).

**Where.** `+` mines (a cave-in), tunnels (a cave-in in a tunnel), furnace (a slag heap), surface (open variant: a boulder pile with no squeeze). `o` galleries, columns, ice, flooded. **Never springs or updrafts**: a pad or a draught throws you into the crest's low roof and pins you there for the 36 frames the pin lasts. Not next to the Grand Stair or the Long Ramp (all three are climbs) or the Shelter (the closest natural kind: same axes bar orientation).

**Links it owns.** A throat each end, at base level. No crack or pore (the heap is solid: nothing flat enough to cut one in).

**A fight.** The crest is a choke 128-192 px long where two or three bodies can stand and no jump works: it plays like a short Crawl on top of a hill, with the high ground on the stair side and a two-bite drop on the other. Holding the crest holds both flanks. Going back the way you came is a climb of two 64 px steps, the same effort as going down is easy.

**CPUs.** Stairs and bites are ledges of 32-64 px; the crest is walking only; the CPU's drops (`mcDropOk`) handle the way down. Nothing new.

**Risk.** (1) A jam at the crest at 15 a side, and roof-bounce combos there (the damage cap is the only end to them, as in the Crawl): so **at most one Breakdown per moon-half, never in the district the Crawl is in, and not as the only way along a SPLIT or FAN district**. (2) The V roof makes a big rock wedge: unused arc above it is empty rock, counted in rule 11.

**Axes.** orientation D (diagonal), openness closed, height mid (low in 1 seed in 300), width S (98%), verb scramble.

### 23. The Wriggle: wind

**What it is.** A low tube, 144 or 160 px high, that waves up and down on gentle ramps like an S, with the roof following the floor a little late so it pinches at every rise: you cannot see round the next bend, you cannot jump, you walk it. It is the only natural room whose floor is mostly a slope.

```
#########################################
#####################################
###################################
#################################
##############       ##########
############           ######
##########



                                        B
                                 ########
                               ##########
                             ############
          #######          ##############
        ###########      ################
A     ###################################
#########################################
```

**Exact geometry** (kind id 23).
- Tube height `T = 9 + r(2)` cells (144 or 160 px). Bends `nb = 2 + r(2)`; flats of `5 + r(4)` cells (80-128 px) before, between and after them.
- Each bend moves the floor by `d = 2 + r(5)` cells (32-96 px) **over `2d` columns (one cell of rise per two columns, 27 degrees: walked, no jump)**, alternating up and down (it turns round if it would leave 0..6 cells over the start); start level 0 or 1 cell.
- **Roof = the floor four columns earlier, plus T.** So on a rise the air is `T - 2` cells (112-128 px: a blind pinch) and on a fall it balloons to `T + 2`. The recipe throws if a column ever has less than 7 cells.
- Largest step 16 px (a ramp tread is 32 px).

**Bed.** The whole floor.

**Size.** 384-896 px wide (median 608), net rise -16 to +96 px (the planner flips it to cancel drift), air 176-256 px, and low class (under 150 px of air) in 54% of seeds.

**Where.** `+` mines (an adit: the belt runs along the tube, uphill or down by the quarter's chirality), tunnels. `o` columns, flooded (a siphon: water drag). **Never** galleries (air is their whole point), springs and updrafts (pad and draught pin you to a 144 px roof), ice (slick ramps: you slide back down the S; ice owns ramps but at 27 degrees a body cannot stop on them), the furnace (a tube that is all bed, all hot, with no hop room to dodge), the surface. Not next to the Crawl or the Racetrack (both low tubes), nor the Dumbbell (a neck is a Wriggle's cousin).

**Links it owns.** A throat each end; no crack or pore (a tube has no room for a hatch). **At most one low tube (a Crawl or a Wriggle) in a district-half**, and the Crawl's rule applies: only in the quiet districts.

**A fight.** One-dimensional like the Crawl, but a body sees only one flat and one ramp ahead (80-128 px flat, up to 192 px of ramp), so a straight shot cannot cross the room as it can the Crawl; the uphill body has the high ground by up to 96 px; a launch bonks the roof and slides.

**CPUs.** Walking only (`brainWalk`) up and down 16 px treads, the same as the CTF slopes the tunnels already use. No jump, no ledge, nothing new.

**Risk.** (1) A traffic jam: the tube is single file for 384-896 px; the guard is the one-low-tube rule and the quiet-district rule. (2) The roof pinch is an exact 112 px at T = 9 on a 2-cell rise: it must be built as drawn, no rounding, or the tallest body (96 px) sticks.

**Axes.** orientation W (winding: a new code), openness sealed, height low (54%) or mid, width S (76%) or M, verb wind.

### 24. The Roost: arch

**What it is.** A domed cavern with a low rim: 128 px of roof at the two ends rising to 256-384 px over the middle, so the fight is a flat brawl at the rims, where a jump bonks, and an air fight under the apex. A single plank for the bats and two low guano mounds give it a perch and cover.

```
##########################################
################## ##        #############
##############  ## ##          ###########
############    ## ##            #########
##########                         #######
#########                           ######
#######                               ####
#######                               ####
######                                 ###
#####                                   ##
#####                                   ##
####                                    ##
###                                     ##
##                                      ##
##                                      ##


                  ========



            ###             ###
A         #######         #######        B
##########################################
```

**Exact geometry** (kind id 24).
- Width `36 + 2*r(11)` cells (576-896 px); apex height `Hc = min(16 + 2*r(5), hc)` cells (256-384 px; `hc` even); centre `W/2 + r(7) - 3`.
- Roof by the dome table: `Hc - floor((Hc - 8) * DT[d] / 19)`, `d = |x - centre| * 20 / far`, never under 8 cells.
- Floor: chunky 4-9 cell runs at 0 or 1 cell (16 px), the 6 end cells flat; **two guano mounds** (7 cells wide at +1, the middle 3 cells at +2: 32 px, treads 32 px), at least 12 cells apart and 6 cells from the apex.
- One **bat-shelf plank** 6-8 cells wide, 96 px up (if `Hc >= 18`); one or two fangs (2 cells wide, 3 long) in the apex.
- Largest step 16 px (the plank is the optional perch: 96 px).

**Bed.** The floor between the mounds. (`sym` allowed: a symmetric Roost can take a pole slot.)

**Size.** 576-896 px wide (median 736), air 256-384 px (never above `hc`).

**Where.** `+` galleries (a domed chamber in the cloister), ice (a frozen dome with icicles), flooded (half-sunk). `o` springs, columns, updrafts, mines, tunnels, furnace. Never on the surface (a dome needs a roof). Not next to the Cathedral or the Geode (domes), nor the Vug.

**Links it owns.** A throat each end; a crack up at the apex only if a second plank is added to climb to it (not in the base recipe: so none), a pore in the floor between the mounds.

**A fight.** Two games at once: the rims (a jump rises at most 80 px under a 128 px roof) are a short flat brawl; the middle is the one place in this family with 200+ px of air, so the plank's occupant and the apex fighters hold the height. The mounds are 32 px of cover against a low shot.

**CPUs.** Floor ledges 16-32 px; the plank is a 96 px ledge (inside the 130 px reach) that a CPU takes only when its aim says so. Nothing new.

**Risk.** (1) A plank camper: the plank is 96 px up, open on both sides, and the apex roof is too far above it (at least 7 cells) for a roof bonk to trap: a camper can be knocked off from below by an up-air through the plank. (2) A dome's roof steps are 16 px each: the builder must cut the roof as boxes per column group or it will draw a stair.

**Axes.** orientation B (bowl or dome), openness closed, height mid, width S (36%) or M, verb arch.

### 25. The Strand: bank

**What it is.** An underground stream crossing: a high dry bank, three flowstone terraces stepping down, a wet bed with one or two sandbars, and a lower far bank. The high bank holds the ground over the bed, and the bed does whatever the cave does to a floor.

```
#####################################################
####       #####      ##############            #####
##                                                 ##
                                                   ##
                                                   ##
                                                   ##




A
####
####
#######                                             B
##########          ####     ####            ########
##########          ####     ####        ############
#####################################################
```

**Exact geometry** (kind id 25).
- Left bank 5 cells (80 px) over the bed, `4 + r(3)` cells long; three terraces down with risers from `[2,2,1] [2,1,2] [1,2,2]` cells (16-32 px) and treads `3 + r(3)` cells (48-80 px).
- Bed `16 + r(15)` cells wide (256-480 px); 1 sandbar if the bed is under 22 cells, else 2, each 4-5 cells wide and 2 cells (32 px) high, at least 3 cells from a bank foot and 9 cells from the next bar.
- Far bank: two steps of 1 cell (16 px) with treads of 3-4 cells, then a flat of `4 + r(3)` cells at +2 cells (32 px). **Net fall 48 px, always**: the planner flips it to cancel drift.
- Roof `15 + r(2)` cells over the bed, chunky 4-8 cell runs at 0-1 cell down. Largest step 32 px.

**Bed.** The bed (not the bars, not the banks): ice slick (a frozen stream), belt (the current), water drag (flooded), pads (a bubbling brook), the hot clock (a lava river, the bars and banks cool), or dry plain.

**Size.** 672-992 px wide (median 832), air 240-256 px: **it fits every district head, down to 260 px**.

**Where.** `+` springs, ice, mines, flooded, tunnels, furnace. `o` galleries, columns, updrafts (a draught column over the bed lets you ride across). Never on the surface. Not next to the Lake or the Sinkhole (the same dip-with-a-bed idea).

**Links it owns.** A throat each end (the left port 80 px over the right one: a **sill** or a **slope-mouth** to a level neighbour); a crack over a bank top of 6 cells or more; a pore over the bed only if the bed is plain or ice (never over water or fire).

**A fight.** The bank is the high ground by 80 px along its whole length; the bed is the cave's footing under your feet; the bars are two or three islands of cool, dry, 32 px-high ground. In the furnace the bed burns: the only safe places are the bars, the banks and the terraces.

**CPUs.** Terraces and bars are ledges of 16-32 px; CPUs cross the bed by the bars and by the far bank's steps. In water and ice they follow the existing footing rules (drag, slide); nothing new.

**Risk.** (1) A long hot bed in the furnace: the longest is 480 px with a bar every 9 cells or less; V5 must count the burn per crossing. (2) Ice bed plus an 80 px bank: a knockback down the terraces slides across the bed; that is the point, and `koCap` ends any chain.

**Axes.** orientation P (pit: the bed is a dip), openness closed, height mid, width M (98%), verb bank, footing the district's.

### 26. The Vug: ring

**What it is.** A crystal cavity entered at the rim: a small platform at each end, three steps down into a narrow bowl 96 px lower, a faceted tent of a roof above, and shelves climbing the walls like a ladder. Fighters ring the bowl from the shelves.

```
#################################
#################   #############
################      ###########
###############        ##########
##############          #########
#############            ########
############              #######
##########                 ######




                    ====


A                               B
###                       #######
###                       #######
#####                  ##########
#####                  ##########
########             ############
########             ############
#################################
```

**Exact geometry** (kind id 26). Local zero = the rim.
- Rim platforms `3 + r(2)` cells each side at 0; three steps down on each side of 2 cells (32 px) with treads `2 + r(2)` cells; the bowl **6 cells (96 px) below the rim**, `8 + r(5)` cells wide (128-192 px).
- Roof: a tent, `Rc - max(0, |x - centre| - 1) - tooth`, `Rc = Hb - 6` cells over the rim, `Hb = min(20 + 2*r(4), hc)` (320-416 px over the bowl), 45 degree sides, a 32 px flat apex, teeth of 16 px in runs of 2-3 cells; never under 8 cells (the doors).
- Shelves: one-way planks 4-5 cells wide at 64, 128, 192, 256, 320 px over the rim, alternating left and right, only as far up as the tent leaves 7 cells of air above them; the first is a single 64 px jump from a rim platform.
- Largest step 32 px; shelves 64 px apart.

**Bed.** The bowl. (`sym` allowed: the symmetric Vug starts its ladder on the left and mirrors it.)

**Size.** 432-592 px wide (median 512, the narrowest natural room), air 304-416 px: **it needs a head of 320 px or more** (not in ice, mines or flooded).

**A taller option.** `Hb` may be stretched to 480-544 px for a **tall** class (the spec's four height classes need one); then its roof is in the district above and the spec's claim and bridge rules apply. At most one per moon. Not in the base recipe or the sweep: the planner gets it with a new `Hb`, and it must be re-run through the flight check (not done).

**Where.** `+` columns (the crystal grove: the Vug is its natural room, a cousin of the Geode that is not the Geode). `o` galleries, springs (pads in the bowl lift you up the ladder), updrafts, tunnels, furnace (a hot bowl, cool shelves); ice, mines and flooded are `o` in `SUIT` but their head is too low for it (not offered there). Never on the surface. Not next to the Chimney or the Aerie (tall small rooms), nor the Roost.

**Links it owns.** A throat each end at the rim; none up or down (the bowl is a pit already).

**A fight.** The shelves put four or five bodies in the air round a 128-192 px bowl: shots from above into the bowl, a drop-in to escape, a ladder to climb out. It is the one natural room where the vertical axis matters more than the horizontal.

**CPUs.** Rim steps and the bowl's six cells of descent are 32 px ledges; shelves are 64 px ledges (reach 130). Nothing new.

**Risk.** (1) A shelf camper: a shelf is 4-5 cells (64-80 px) wide and open to the air; the planks are one-way so it can be hit from below. (2) A crowd in a 128 px bowl at 15 a side: **the Vug is dropped from the draw in a district of crowd 12 or more per side unless it is the district's only natural room** (V8 to check). (3) The tent's teeth must be cut as boxes, not as a curve.

**Axes.** orientation V (vertical, a bell), openness sealed, height mid (a tall option), width S, verb ring.

### 27. The Dumbbell: choke

**What it is.** Two small domed bays of different sizes joined by a waist 128 px high and 128-224 px long, with a 16 px sill in it. Whoever holds the neck holds both bays, and the bays are where you get out of it.

```
######################################################
#######     ##########################################
#####         ########################################
#####         ########################################
####           #######################################
###             ######################################
###             ######################################
##               #####################           #####
##               ###################               ###
##                ################                  ##
##                              #                   ##






                                        ######
A        #####################################       B
######################################################
```

**Exact geometry** (kind id 27).
- Bays `14 + r(11)` cells wide each (224-384 px); heights drawn from 12, 14, 16, 18, 20 cells (192-320 px) capped by `hc`, **the two differing by at least 4 cells**, each roofed by the dome table with 8 cells at its edges.
- Neck `8 + r(7)` cells (128-224 px), floor +1 cell (16 px), roof 9 cells over the bay floor (**128 px of air over the sill**); 3 cells either side of the neck are at sill level.
- Bay floors chunky 4-8 cell runs at 0-1 cell; a boulder 6 cells (96 px) wide and 32 px high in each bay that has the room. Ends: doors.
- Largest step 32 px.

**Bed.** The bay floors (not the sill, not the boulders). `sym` allowed (equal bays, a centred neck: a symmetric Dumbbell takes a pole slot).

**Size.** 576-992 px wide (median 784), air 256-320 px.

**Where.** `+` mines (an adit with two chambers), tunnels. `o` galleries, columns, ice, flooded, furnace (two hot bays and a cool sill between them: the sill is the refuge). **Never springs or updrafts** (a pad or draught in a 128 px neck pins you). Not next to the Attic or the Warren (small closed rooms), nor the Wriggle.

**Links it owns.** A throat each end; a crack or pore in a bay floor of 10 cells or more flat.

**A fight.** The neck is a short Crawl between two arenas; one side sees the other only through a 128 px slot; bays are the Roost's rims and dome in miniature. The two bays are different sizes on purpose so the choke is a place to be on one side of, not a symmetrical stand-off.

**CPUs.** Sill and boulders are 16-32 px ledges; the neck is a walk. `mcCrowd` has already to cope with the Crawl.

**Risk.** (1) A neck jam, as the Wriggle's and the Breakdown's: **at most one neck-type room (Wriggle, Dumbbell, Breakdown, Crawl) per district-half**. (2) A shot straight through the neck from one bay to the other: the bays are not aligned in height by more than 4 cells, so the line crosses the neck only for a body standing at the neck.

**Axes.** orientation S (small, two closed bays), openness closed, height mid, width M (83%) or S, verb choke.

### 28. The Shelter: overlook

**What it is.** A low shelf under an overhang at the entrance, a 48-64 px drop off its lip, and a taller hall whose roof is 96-112 px higher than the shelf's. The shelf is cover and a place to shoot from; the hall is where you jump.

```
#####################################
##################     ##          ##
##################     ##          ##
##################     ##          ##
##################                 ##
##################                 ##
##################                 ##
##################                 ##
##                                 ##
                                   ##
                                   ##
                                   ##




A
##############        #####
##############        #####
##############        #####         B
#####################################
```

**Exact geometry** (kind id 28).
- Shelf `12 + r(9)` cells long (192-320 px) at 0, roof `Ts = 9 + r(2)` cells (144-160 px) over it.
- Drop `dd = 3 + r(2)` cells (48-64 px) to the hall floor; hall `16 + r(15)` cells long (256-480 px); the roof steps up to `Rh = min(Ts + 6 + r(2), hc - dd)` cells over the shelf level, **`2 + r(4)` cells past the lip** (so the lip is under the low roof and the step is over the hall).
- Hall floor chunky 4-8 cell runs at 0-1 cell, flat for 4 cells after the lip and 5 before the end; a boulder 5 cells (80 px) wide, 3 cells (48 px) high; 1-2 fangs on the high roof, 2 cells wide, 3 long.
- Ports: A on the shelf, B on the hall floor; net fall 48-64 px. Largest step 64 px.

**Bed.** The hall floor (not the boulder). The shelf is never bed: in the furnace it is the cool refuge over a hot hall.

**Size.** 448-800 px wide (median 624), air 288-336 px: **it needs a head of 288 px or more** (not in ice, mines or flooded).

**Where.** `+` galleries (a natural balcony), springs (a pad under the lip throws you onto the shelf), furnace (a cool shelf over a hot hall). `o` columns, updrafts, tunnels (ice, mines and flooded are `o` in `SUIT` but their head is too low for it: it is not offered there). Never on the surface. Not next to the Barricade or the Breakdown.

**Links it owns.** A throat on the shelf, a **sill or slope-mouth** at the hall end (the hall is 48-64 px lower: the planner flips the room to keep the chain level); a crack or pore in the hall floor.

**A fight.** The shelf's roof is 144-160 px: no big jumps, no air game, but a clear line down onto the hall; the hall is a normal room with a 64 px climb back to the shelf. High ground without height.

**CPUs.** The drop is a fall (`mcDropOk`), the climb a 48-64 px ledge. Nothing new.

**Risk.** A shelf camper with a projectile: the shelf has two ways out (the lip and port A behind it) and the hall's fighters reach it by a single jump anywhere along the lip, so it is a perch with a cost.

**Axes.** orientation L (ledged: a new code), openness closed, height mid (low in 13%), width S (80%) or M, verb overlook.

### What I threw away, and why

- **Pillar Wood** (stalagmites joined to stalactites as columns). Drawn, flown, thrown out: a column from floor to roof **cuts the room in two** in a side view, and a window big enough to cross is the Teeth's "sealed gate" that library-1 already found. Stalactites survive as fangs in the Reef, the Roost, the Shelter; stalagmites as the Reef's caps.
- **Slab Field** (a floor broken into plateaus with gaps): the Reef again with wider tops.
- **Cascade** (flowstone terraces going down): a short Long Ramp with cups; the terraces live on as the Strand's left bank.
- **Drip Pool** (a basin with drips): the Strand's bed with a roof; the Lake and the Sinkhole already do "a dip with a bed".
- **Switchback** (two tubes stacked and joined at one end): both ports end up on the same side, which breaks a chain of rooms.
- **A natural skylight room** (a rubble cone under a shaft): it is the spec's Chimney or a hatch; the `crack` link covers it.

---

## 1. The natural share by depth

**What the owner asked for:** every cave gets a mix, and the natural share grows with depth: "a few" in the first cave, "most" of the tunnels and the furnace. Here is that as a rule, as numbers for 4, 10 and 15 a side, and as what a paper planner does with it.

### 1.1 The rule: natural rooms are placed first

Natural rooms are an **obligation, like the signature room**, not filler. For each district-half (both quarters) the planner, after the signature, the squeeze and the hall are down and before the built fill:

1. Takes the target length share `t = shareAt(cave, K)` (the table below; `K` = number of caves).
2. Per quarter, `n = floor(t * quarterArc / 1105 + u)`, `u` a hashed fraction in 0..1 (stochastic rounding, so the share is right on average although a quarter holds only 0-3). 1,105 = the mean natural width (about 720) plus the mean plug (385).
3. Draws `n` kinds from `SUIT` for that cave kind (head fit by `minHead`, not used twice in the moon-half, not already in the district-half, no `NO_NEIGHBOURS` pair next to it), a width inside the kind's range that fits the quarter, a seed from `hash(planSeed, cave, quarter, k)`, and a `flip` that pulls the floor offset back toward 0.
4. Spreads them along the quarter at `0.2 + 0.78 * (k + 0.5) / n` of its length, jittered by a quarter of the spacing, never touching a signature, hall or strip.
5. **Lets the four symmetric kinds (Reef, Roost, Vug, Dumbbell, built with `sym`) take a pole slot** when the pole slot is free: that is the only way the furnace's second pole can be natural (its quarter is about 640 px).
6. The built fill then takes what is left. **Natural kinds do not take part in the fill** (otherwise they become the filler of last resort: see the third paragraph of 1.3).

### 1.2 The target, and what a packed plan would give

Target (percent of the walkable room length that is natural), by depth, first cave 0 to furnace 100: `0 -> 15, 30 -> 25, 60 -> 45, 85 -> 62, 100 -> 60` (`SHARE`). At 4, 10 and 15 a side that is, cave by cave (`share-table.mjs`, from the real discs; the "packed" column assumes natural rooms of 720 px and built rooms of 1,700 px with a 385 px plug, so it is what a full plan would hold, not what the stand-in planner places):

| | Cave (kind in the example cast) | Quarter arc (px) | Target length share | Packed: natural + built rooms a half | Natural share of the rooms |
|---|---|---|---|---|---|
| **4 a side** | 1 galleries | 2,777 | 15% | 0.8 + 2.3 | 25% |
| | 2 ice | 2,179 | 27% | 1.1 + 1.5 | 41% |
| | 3 tunnels | 1,359 | 49% | 1.2 + 0.7 | 64% |
| | 4 furnace | 624 | 60% (**45-50% is all it can hold**) | 0.7 + 0.2 (**two rooms, one natural**) | 74% (**50%**) |
| **10 a side** | 1 galleries | 4,393 | 15% | 1.2 + 3.6 | 25% |
| | 2 springs | 3,576 | 21% | 1.4 + 2.7 | 33% |
| | 3 ice | 3,010 | 31% | 1.7 + 2.0 | 46% |
| | 4 updrafts | 2,192 | 45% | 1.8 + 1.2 | 61% |
| | 5 tunnels | 1,372 | 58% | 1.4 + 0.6 | 72% |
| | 6 furnace | 637 | 60% (45-50%) | 0.7 + 0.2 (two rooms, one natural) | 74% (50%) |
| **15 a side** | 1 galleries | 5,656 | 15% | 1.5 + 4.6 | 25% |
| | 2 springs | 4,839 | 19% | 1.7 + 3.8 | 31% |
| | 3 columns | 4,148 | 24% | 1.8 + 3.0 | 37% |
| | 4 ice | 3,582 | 33% | 2.1 + 2.3 | 48% |
| | 5 updrafts | 2,764 | 43% | 2.2 + 1.5 | 59% |
| | 6 mines | 2,198 | 52% | 2.1 + 1.0 | 67% |
| | 7 tunnels | 1,378 | 62% | 1.5 + 0.5 | 75% |
| | 8 furnace | 644 | 60% (45-50%) | 0.7 + 0.2 (two rooms, one natural) | 74% (50%) |

Read it as: **a first cave has about one natural room in every four rooms (a quarter of its rooms, 15% of its length); a tunnel cave has about two in three (more than half its length); the furnace is half and half**, because its ring has room for two rooms a half and the Hot Plates, the signature, takes one of them. That last number is the owner's "most of the furnace" falling short: question 1 in section 9.

### 1.3 What a paper planner did with it (300 seeds a size, 8 tries, the director's stand-in sampler with the eight added)

Natural rooms placed first (`MODE=quota POLE=1`), natural share of each cave by **length** (by rooms in brackets), against the target:

| | cave 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | whole moon (caves) |
|---|---|---|---|---|---|---|---|---|---|
| 4 a side, target | 15 | 27 | 49 | 60 | | | | | |
| 4 a side, **placed** | 23 (23) | 19 (26) | **48 (45)** | **25 (32)** | | | | | 14 (21) |
| 10 a side, target | 15 | 21 | 31 | 45 | 58 | 60 | | | |
| 10 a side, **placed** | 33 (41) | 15 (23) | 28 (31) | 43 (49) | **57 (51)** | **24 (24)** | | | 20 (29) |
| 15 a side, target | 15 | 19 | 24 | 33 | 43 | 52 | 62 | 60 | |
| 15 a side, **placed** | 37 (48) | 15 (27) | 23 (30) | 31 (38) | 39 (37) | 50 (48) | **66 (63)** | **26 (33)** | 24 (34) |

What it says. (1) **The tunnels land on target** (48, 57 and 66% by length). (2) **The middle caves are within 2 to 8 points**, a little under. (3) **The furnace lands at 25% by length, one room in three**: it is where the stand-in's pole rule and the signature bite, and the ceiling is about 45-50%. (4) **The first cave overshoots (23-37% against 15%)**: the stand-in leaves 1,000 to 13,500 px of every half unused and puts only 2 rooms in a half-district, so one 720 px natural room is a quarter to a half of its rooms; a denser plan brings it down toward the packed numbers above. I did not tune the sampler to hide this.

**What happens without the quota** (natural kinds in the pool, picked by affinity like any other room): the first cave becomes **62-65% natural by length** (63-68% of its rooms), the second 12-16%, the tunnels 39-47%. The built library is used up (two of each kind in a half, 20 kinds) by the time the planner reaches the shallow caves, because it fills deepest-first, and the natural rooms become the filler of the top: the opposite of the owner's order. **So the quota is not optional.**

**Does the rule set still hold with the natural rooms in?** Yes, in all three arrangements, at the same hard rules and the same score gate as the spec:

| | Library only (spec) | Natural in the pool, no quota | **Natural first (quota, pole slots)** |
|---|---|---|---|
| 4 a side: score median (p10) | 97.0 (93.0) | 98.5 (94.2) | 96.6 (92.5) |
| 4 a side: first try / within 8 tries | 83% / 100% | 87% / 100% | 74% / 100% |
| 10 a side: score median (p10) | 96.7 (93.0) | 98.1 (95.3) | 97.3 (93.4) |
| 10 a side: first try / within 8 tries | 62% / 100% | 79% / 100% | 62% / 100% |
| 15 a side: score median (p10) | 97.4 (95.0) | 98.6 (96.8) | 97.6 (95.4) |
| 15 a side: first try / within 8 tries | 69% / 100% | 83% / 100% | 66% / 100% |
| rooms a half, distinct kinds (15 a side) | 24.3, 16.5 | 33.1, 22.6 | 31.9, 21.5 |
| lowest component mean (any size) | C8 0.85 | C8 0.91 | C8 0.85 (C9 0.89 at 4 a side) |

The library-only column reproduces the spec's own table to the digit (97.0, 96.7, 97.4; 83%, 62%, 69%), so the copy of the sampler is faithful. **The one cost of placing natural rooms first is the main hall (C8):** at 4 a side the first-try failures of "a hall in every cave" go from 10 in 300 to 30 in 300, because the quota takes arc the hall wanted. They all pass within 8 tries. The fix is an order, not a number: **signature, then hall, then natural quota, then built fill**, which is how the steps in 1.1 are written (the stand-in places the quota before the hall, which is why it shows the cost). Natural neighbours: 54, 202 and 221 natural-natural pairs at 4, 10, 15 a side, every one differing on 3 or more axes (3 axes: 42, 146, 156; 4 axes: 12, 53, 62; 5 axes: 0, 3, 3); runs of natural rooms of 1 and 2, one run of 3 at 15 a side, none longer.

**The screen check** (10 a side, 5 seeds, the director's air-shape measure with the natural rooms built from seeds and laid in the strips; a quick run, not the 12 seeds of the spec): the library alone reads best-match 54% within a district, 0% twins, 29% distinct screens (the spec's 57%, 0%, 27%), and **24% twins pooled over the caves**. With the natural rooms: within a district 53-54%, 0% twins, 29%, and **pooled twins fall to 7% (in the pool) and 5% (placed first)**, the pooled best match from 76% to 68-69%. Library with the rules off, for scale: 72%, 31% twins, and 87% best match and 51% twins pooled. All four of the spec's provisional pass lines (within 65%, twins 5%, distinct 18%, pooled twins 30%) hold. The natural rooms did not add a samey stretch; they took the pooled twin rate down by about three quarters.

---

## 2. Anti-sameness rules for natural rooms (in addition to the spec's rule set)

The spec's rules 1-11 apply to natural rooms unchanged (neighbours differ on 3 of 6 axes, no archetype next to itself or more than twice in a half or once in a district-half, no twin widths, one scale spread, and so on). **These are the extra ones.** N1, N2 and N4 are measured in section 1 (the stand-in sampler enforces them); N3, N6 and N7 are rules for the planner that the stand-in does not enforce, and N5 and N8 are held by the recipes or not measured, as each says:

- **N1. No natural kind next to itself, at most once in a district-half, at most twice in a moon-half.** (The spec's rule 2, restated because with eight kinds it bites sooner.)
- **N2. Natural neighbours differ in orientation and verb by construction** (all eight have a distinct orientation code and a distinct verb, none of them one of the library's 21), so two naturals already differ on 2 of the 6 axes; **the planner needs one more from openness, height class, or width class** (a width class means one is under 700 px and the other is not), **and a width ratio of at least 1.25** between natural neighbours (the spec's 8% twin rule is too loose for rooms in a 384-1,152 px range).
- **N3. Pairs that must not be neighbours.** By the typical axes seven natural pairs differ on only two axes: Reef-Roost, Reef-Strand, Reef-Dumbbell, Roost-Strand, Roost-Dumbbell, Strand-Dumbbell and Breakdown-Shelter; they may sit side by side only if the drawn widths fall on different sides of 700 px. Natural-to-built pairs never to place together: Reef-Teeth, Wriggle-Crawl, Wriggle-Racetrack, Roost-Cathedral, Roost-Geode, Breakdown-Grand Stair, Breakdown-Long Ramp, Strand-Lake, Strand-Sinkhole, Vug-Chimney, Vug-Aerie, Dumbbell-Attic, Dumbbell-Warren, Shelter-Barricade; and natural-to-natural Wriggle-Dumbbell, Roost-Vug, Breakdown-Shelter. (`NO_NEIGHBOURS` in `natural-chambers.mjs`.)
- **N4. A run of natural rooms is at most 1 in the first two caves, 2 in the middle caves, 3 in the tunnels and the furnace.** So the first caves' natural rooms are always between built ones, and a deep cave never turns into eight small bumps in a row. (Measured: runs of 1 and 2 are the norm, a run of 3 is rare, none longer.)
- **N5. The natural rooms of a district-half must spread.** When a district-half has 3 or more, at least one is under 600 px wide and one is 800 px or more, and at least one has under 250 px of median air and one more than 250. (Not measured: the sampler has too few natural rooms per district-half at 4 a side; V0 measures it. The eight kinds' own spread is below.)
- **N6. Low tubes and chokes are rationed:** at most one neck-type room (Wriggle, Dumbbell, Breakdown, Crawl) per district-half and at most one low tube (Crawl, Wriggle) per district, only in the quiet districts.
- **N7. Footing exclusions.** The Wriggle never in springs, updrafts, ice, galleries, the furnace or on the surface; the Breakdown and the Dumbbell never in springs or updrafts; the Vug and the Shelter only where the head allows (Part A); the surface only the open Reef and Breakdown (optional).
- **N8. No natural room claims the district above** (it fits under `hc`), except the optional tall Vug (at most one a moon, with the spec's bridge).
- **N9. The planner places natural rooms first** (section 1), so the built fill cannot silently crowd them out, and the natural rooms cannot silently become the filler of a plan the library could not fill.

**How far apart the eight are** (the axes table; the same six axes as the built ones):

| Kind | Orientation | Openness | Height class (median air) | Width class | Verb | Footing |
|---|---|---|---|---|---|---|
| Reef | H | closed (sky on the surface) | mid (224-288 px) | M (87%), S | perch | the district's, on the valleys |
| Breakdown | D | closed (sky on the surface) | mid (144-240 px; low 1 seed in 300) | S (98%) | scramble | on the two base floors |
| Wriggle | **W** (new) | sealed | **low 54%**, mid 46% (128-160 px) | S (76%), M | wind | on the whole floor |
| Roost | B | closed | mid (208-336 px) | M (64%), S (36%) | arch | on the floor between the mounds |
| Strand | P | closed | mid (192-240 px) | M (98%) | bank | on the bed |
| Vug | V | sealed | mid (160-304 px), tall option | S (100%) | ring | on the bowl |
| Dumbbell | S | closed | mid (144-224 px; low 1 in 300) | M (83%), S | choke | on the bay floors |
| Shelter | **L** (new) | closed | mid (144-288 px), low 13% | S (80%), M | overlook | on the hall floor |

The spread: **widths 384 to 1,152 px (3.0 to 1), envelopes 176 to 416 px (2.4 to 1), median air 128 to 336 px (2.6 to 1); two sealed, six closed and two with a sky variant; three have a low-class instance; eight orientations and eight verbs, no two alike.** Compare the built twenty: widths 150 to 3,000 (20 to 1). Natural rooms are smaller and narrower in range, which is what the owner asked, and none of the eight is a floor with its noise turned up: the Wriggle is a ramp road, the Roost a roof, the Dumbbell a choke, the Shelter a roof step and a drop, the Vug a bowl and a ladder, the Strand a footing, the Breakdown a squeeze, the Reef the only one whose subject is the floor.

---

## 3. How a natural room sits next to a built one: the links

Natural and built rooms are joined exactly as two built rooms are: **a rock plug of 250-520 px between them (never under 112 px of rock between two spaces) and a passage through it**. A natural room gives a built room nothing new to do; what changes is what the passage can be, and the planner has to carry the **floor offset**.

**The floor offset.** Each natural room has end floors `eL` and `eR` (cells over its local zero; the size line of each kind in Part B gives them): the Reef, Breakdown, Roost, Vug and Dumbbell are level (0), the Strand falls 3 cells (48 px), the Shelter 3-4 cells (48-64 px), the Wriggle from -1 to +6 cells (-16 to +96 px). The planner keeps a running level `lv` along a chain (the exit floor of the previous room); a new room is placed with its local zero at `lv - eL`; its exit is `lv + eR - eL`. **The offset from the district's nominal floor stays within 12 cells (192 px)**; when a chain is drifting, the next room is built with `flip` (a mirror, which reverses the sign of its net) or another kind is drawn. The built rooms with a net rise (the Long Ramp, the Grand Stair) already need this accounting (V2).

**Five natural link types**, all drawn from the same few numbers:

| Link | Used when | Geometry | The CPU's row |
|---|---|---|---|
| **Throat** | two rooms on one level (offset 0) | a tube through the plug at least **128 px high** (8 cells), roof allowed to wander up in 16 px runs, floor flat; it tapers to the lower port when the neighbour's door is lower (a Crawl's 112-120 px) but never under 112 px | walk |
| **Sill** | floors differ by 1-4 cells (16-64 px) | a throat with one step of that size at a drawn place in the plug, 6 cells (96 px) of flat each side | a ledge step: `steerClimb` |
| **Slope-mouth** | floors differ by 5-8 cells (80-128 px) | a ramp through the plug with 16 px risers and 32 px treads (27 degrees), roof 128 px over it; the plug is lengthened to at least `32 * delta + 192` px | walk (ramp snap) |
| **Crack** | a way up between districts | the spec's **hatch** (opening at least 128 px wide, a plank at most 80 px under it) with its lips cut by `chunky` (a lip may wander 16 px, never to under 128 px wide) | up: the hatch's plank |
| **Pore** | a way down, one way only | a hole 128-176 px wide with lips cut the same way, landing on a floor, never over a crack in the shell | down only: left out of every "up" route |

The offset between neighbours is never more than 8 cells: a larger one means the planner picks the other flip or another kind. **Cracks and pores open only where the room has at least 6-10 cells of flat floor** (the table in each kind: the Reef's valleys, the Roost's floor between the mounds, the Strand's bank top, the Dumbbell's bays, the Shelter's hall), never over a bump, a bar or a stair.

**Which link goes next to which neighbour.** Natural next to built: a throat if the offset is 0, a sill or slope-mouth otherwise, and the built room's own rule for its port (the Crawl's 112-120 px, the Attic's hatch, the Barricade's door) wins where it is stricter. A natural room is **never fused** to a built one: the plug and the 112 px of rock always stand between them. Natural next to natural: the same, plus the **rules of section 2** above.

**Passages the kind owns (v4-spec section 4).** A natural room in a district uses that district's owned passages for its cracks and pores: springs a geyser (a pad under the crack), updrafts a draught, mines a chute or a belt ramp, ice a ramp, flooded a drain; the throat, sill and slope-mouth are the lateral links in every kind and count as the spec's door, squeeze and ramp for rule 5 (no passage type over 35% of a moon).

---

## 4. Flight check, on paper (a 48 px body, the game's jump and gravity, stat 1 and the weakest jumper 0.85, both gravities)

### 4.1 Method

library-1's checker (`natural-tools/analyze.mjs`, a copy with one patch, below) flies a 48 x 48 px body through each grid with the game's own numbers: jump -12.5 (times 0.85 for the weakest jumper), gravity 0.62 (normal: lower caves) and 0.434 (low: the surface and the upper half), run 6.4, air 6.0, rock solid, planks one-way, a head into a roof cuts the rise to zero. From every standing spot it tries walking, walking off an edge, jumps held for 0 to 28 frames, a second jump (kept apart), and a drop through a plank, left and right, and builds a graph of where the body can land. **"Easy" moves are walk, one jump and drop; "all" adds the second jump.** For each room the check asks three things:

1. Do `A` and `B` reach each other with **easy moves only** (no second jump for anybody, the weakest jumper included)?
2. Is there an **island**: a standing spot nobody reaches from a port?
3. Is there a **trap**: a standing spot from which no port can be reached?

### 4.2 Results

All on the final code of `natural-chambers.mjs`, easy moves only unless stated, both gravities in every row. **Every run passed all three questions: 0 islands, 0 traps, A and B linked, no second jump needed.**

| Run | Seeds | Analyses | Result |
|---|---|---|---|
| All eight kinds, stat 1 | 30 each | 480 | 0 problems |
| All eight kinds, **stat 0.85** (the weakest jumper) | 30 each | 480 | 0 problems |
| The Wriggle alone, stat 1 and 0.85 (the most recently rewritten kind) | 80 each | 320 | 0 problems |
| Head caps (the room shrinks under the district's head): 16, 17, 21 and 22 cells, stat 0.85 | 12 each | 672 | 0 problems |
| The Wriggle under caps 16, 17 and 21, stat 0.85 | 20 each | 120 | 0 problems |
| **Symmetric** builds of the Reef, Roost, Vug, Dumbbell, stat 0.85 | 40 each | 320 | 0 problems |
| **Open** (roofless) Reef and Breakdown, stat 0.85 | 30 each | 120 | 0 problems |
| Before the Wriggle was rewritten and the `sym` and `open` options existed (so for the seven other kinds the code is unchanged): all eight kinds, stat 1 and stat 0.85 (console output only: those two output files were overwritten by the reruns above) | 80 each | 2,560 | 0 problems |

The cheapest route from `A` to `B` (stat 0.85, easy moves; the stat-1 routes are the same or shorter), by kind: the Reef 640-1,120 px and at most 7 jumps (5 in low gravity); the Breakdown 496-720 px, 4 jumps; the Wriggle 384-784 px, 4; the Roost 560-880 px, 4; the Strand 688-960 px, 4; the Vug 432-560 px, 3; the Dumbbell 608-912 px, 4; the Shelter 432-768 px, 2. **No cheapest route uses a second jump, and the weakest jumper's routes are never more than 2 jumps longer than the strong jumper's.** (A jump in a route is a 16-64 px step or a bump; the Wriggle's ramps and the Breakdown's heap are walked.)

### 4.3 What the drawings and the check found (seven, all fixed)

1. **Pillar Wood was impossible** (found drawing, before any check). A column of stalagmite joined to stalactite cuts a side-view room in two, and a window wide enough to cross is the Teeth's "sealed gate" library-1 already hit. Thrown out; the stalagmites and fangs live on in the Reef, Roost and Shelter.
2. **Notches** (the check's first sweep): **78 of 1,280 runs at stat 1 and 80 at stat 0.85** had a trapped or unreachable spot, in the Reef, Roost, Dumbbell and Shelter: a 1-3 cell wide notch where a mound or a bump met a chunky run, which wedges a 48 px body. Fix: `tidy` (a pit under 4 cells is filled, a 1-cell run merged). After it: 0 of 1,280 at both stats.
3. **The checker's own artefact.** library-1's analyzer was written for 35-60 px cells; at 16 px every floor cell beside a wall counted as a standing spot a 48 px body cannot occupy, so every room reported 5-20 islands and traps. One patch in my copy: a cell is a spot only if a body centred on it overlaps no rock. The library's own numbers stand (its cells are wider than the body).
4. **The symmetric Vug lost its first shelf.** In `sym` mode the Vug drew its first shelf on the right half, which the mirror throws away; the lowest shelf left was 128 px up, a double jump for the weakest jumper (8 spots reachable only by double jumps at stat 0.85, seed 31). Fix: a symmetric Vug starts its ladder on the left. After: 0 in 80 seeds.
5. **`tidy` broke the mirror.** After the pit fill, 5 symmetric Roosts and Dumbbells in 300 were no longer symmetric (`tidy` walks left to right). Fix: mirror again after `tidy`. After: 0 of 1,200 asymmetric (300 each of the four self kinds).
6. **The Wriggle was a hump** (found drawing). The first draft changed the floor by 1-3 cells at a step, so the tube read as a hump or a stair, not an S. The redraw: ramps of one cell per two columns, 2-6 cells, with the roof four columns late (pinch rule `T - 2 >= 7`), re-flown (80 seeds at both stats and under three caps).
7. **The open variants had a rock lid.** The first roofless grids kept two rows of rock on top, which the check flew along as a ceiling (47-52 islands a room, 120 of 120 runs). Fix: no lid rows when `open`. After: 0 of 120.

Not a mistake but worth knowing: the **Dumbbell's neck and the Breakdown's crest both leave exactly 112-128 px of air**, and the check flies them; the body is 48 px, the tallest fighter 96 px. They pass by 16 px at the Breakdown's crest. A builder that rounds a cell the wrong way fails the tallest body there: cut them as drawn.

---

## 5. The grid file

`natural-chambers.mjs` is written in the format of `v4-spec-tools/chambers.mjs` and exports the same names the sampler and the screen check already import:

- **`CHAMBERS`** (also `NATURAL`): eight entries `{ id, key, name, cw: 16, ch: 16, open, seed, grid, meta }`, ids 21-28 (the spec numbers the library 1-20; `chambers.mjs` itself holds 16 of them), `grid` an array of arrays of one character, the same legend: `#` rock, `=` one-way plank (top of its cell), `%` ice-topped rock, `> <` belt-topped, `^` spring pad, `H` hot floor, `A B` ports (air), blank air. `meta` carries `W` (cells), `eL` and `eR` (the end floors over the local zero), `lo` and `hi` (lowest floor, highest roof).
- **`build(key, seed, opt)`**: any seed, with `hc`, `bedChar`, `flip`, `sym`, `open` (Part A). The eight canonical entries are seeds `SAMPLE_SEEDS`; `variants(key, seeds)` builds several.
- **For the planner**: `KINDS` (id, key, name, verb, orientation, openness, `minHead`), `SUIT` (per kind: `+` natural there, `o` works, absent means must not), `HEAD_CELLS`, `SHARE` and `shareAt(c, K)` (the target length share by depth), `NO_NEIGHBOURS`, `SELF`.
- **For the checks**: `validate(chamber)` (the invariants of Part A), `floorFacts`, `asText`, `hash`.

What differs from the library file, in case a tool assumes it: **cells are 16 x 16 px, not 35-60** (the screen check's `raster()` resamples by `cw` and `ch`, so it takes them as they are; the flight check needed one patch for it: section 4.3); only the surface variants have `open: true`; the grids carry a plain `#` bed unless `bedChar` is passed; two rows of rock above and below, but **not the 112 px of rock the planner keeps between rooms** (that is the plug and the plan's job, as for the library).

How it plugs in. The paper sampler: `natural-tools/natural-sampler-lib.mjs` is `plan-sampler.mjs` with the eight added as archetypes (its table `NAT`: widths, median heights, affinity, `minHead`, `self` for the four symmetric kinds) and four options (`natQuota`, `natNoFill`, `natPole`, `natRun`); with none of them it reproduces the library-only numbers of the spec exactly (97.0, 96.7, 97.4 median scores; 83%, 62%, 69% first-try passes). The screen check: `natural-tools/screens-natural.mjs` is `screens-calibrate.mjs` with a natural room built from a seed for each natural room in a plan (`NATKEY` maps the archetype name to the kind key); nothing in `raster()` changed.

An entry, the first lines of the Dumbbell (seed 1):

```
{ id: 27, key: 'dumbbell', name: 'The Dumbbell', cw: 16, ch: 16, open: false, seed: 1, meta: { W: 54, eL: 0, eR: 0, lo: 0, hi: 20, env: 20 },
  grid: [ ['#','#','#', ... 54 cells ...], ['#','#','#','#','#','#','#',' ',' ',' ',' ',' ','#', ... ], ... ] }
```

---

## 6. The picture sheet

`natural-sheet.png` (written by `natural-tools/render-sheet.mjs`, library-1's rasteriser: a small software one in plain node, `zlib` for the PNG, no browser). Nine rows of three: **rows 1-8 are the eight kinds in id order (21 to 28, marked by their id as digits), each at three different seeds**, so you can see what changes inside a kind and what does not (honestly: not much for some. The Breakdown's three seeds are nearly the same heap, the Strand's and the Vug's differ in a step or a width. The variety the owner asked for is **between** kinds; the jitter inside a kind only keeps two instances from being twins); **row 9 is three footing variants**: the Reef with a hot bed (orange), the Strand with an ice bed (pale blue), the Roost with a pad bed (magenta).

**One scale for every tile: 0.30 px per world px** (library-1's sheet used 0.17, so a natural room is drawn nearly twice as large; the widest one, 1,152 px, is 346 px across). A 48 px orange body stands at the lower left of every tile. The footer's bars are at the same scale: the body, a 120 px jump, a 500 px run, **1,100 px (green: about the widest natural room)** and **2,800 px (pink: the widest library room)**. The white dots are the cheapest route from `A` to `B` over the easy moves (walk, one jump, drop) for a stat-1 body in normal gravity; the green marks are the ports. Colours as in library-1's sheet: grey rock with a pale top edge, pale planks. No words anywhere.

---

## 7. What I did not check

- No fight, no CPU, no engine. The CPU rows are readings of the nav functions, as in library-1: ledges of at most 64 px and ramps of 16 px steps are inside everything the CPU already climbs, drops are falls, planks are optional ledges.
- The **hot clock** in the furnace's natural rooms, the **pads** in springs, **water**, **ice** and **belts** on a bed were drawn but not flown (the analyzer treats a footing cell as rock): V5 flies each footing on the room that carries it. The `%`, `>`, `^`, `H` grids in the sheet are for the picture and for the screen check only.
- The **cracks and pores** (the vertical links) are not rooms and were not flown; they use the spec's hatch and pore tests in V3.
- The **tall Vug** was not built or flown. The Vug and the Shelter were flown uncapped (a 26-cell head) and under caps 21 and 22, and only `validate`d under 23 and 25; **none was run at exactly 20 or 18 cells**, their smallest heads (the sweeps stop at 16, 17, 21, 22, 23, 25, 26).
- **Crowd** behaviour in a 128 px bowl or a single-file tube at 15 a side is a guess; V8 is where it is measured.
- The sampler is a **stand-in** (the same one the director used): a greedy planner with natural rooms added, the same score, the same hard rules. It shows the rule set still passes and where the shares land; it does not prove v4 plays well, and its unused arc is large (as the library-only baseline's is).

---

## 8. Files, how I ran them, and the numbers behind this file

**Deliverables** (all in `C:\Users\carad\Aardvark\smash-island\smash-bal\reports\moon-caves-v4\`):

| File | What |
|---|---|
| `natural-rooms.md` | this file |
| `natural-chambers.mjs` | the eight recipes, the grids in `chambers.mjs` format, `validate`, the planner tables (`SUIT`, `HEAD_CELLS`, `SHARE`, `NO_NEIGHBOURS`, `SELF`) |
| `natural-sheet.png` | the picture sheet (section 6) |
| `natural-tools/` | the throwaway scripts below and their outputs |

**Scripts in `natural-tools/`** (plain node, no install, no browser; they import `natural-chambers.mjs` by its absolute `file:///C:/Users/carad/...` path, so change that line if the folder moves; `run.ps1` starts a script at BelowNormal with a timeout):

| Script | Does | How I ran it (from `natural-tools/`) |
|---|---|---|
| `stats.mjs` | sizes, heights, classes, invariant violations over 300 seeds a kind; the symmetric variants | `node stats.mjs` |
| `sweep.mjs` | `validate()` over seeds and over every head cap | `node sweep.mjs 200` |
| `flight.mjs` + `analyze.mjs` | the flight check (library-1's analyzer, one patch: a floor cell beside a wall is not a standing place for a 48 px body) | `JSTAT=0.85 node flight.mjs all 1 30`; `HC=16 JSTAT=0.85 node flight.mjs all 1 12`; `SYM=1 ...`; `OPEN=1 ...` |
| `render-sheet.mjs` | the picture sheet | `node render-sheet.mjs ../natural-sheet.png` |
| `natural-sampler-lib.mjs` + `ns-run.mjs` | the paper plan sampler with the eight added (a copy of `v4-spec-tools/plan-sampler.mjs`; with no natural option it reproduces the spec's library-only numbers) | `DISCS=../why-samey-data/discs-mcGen-v3.json SEEDS=300 SIZES=4,10,15 MODE=quota POLE=1 node ns-run.mjs` (modes `lib1`, `pool`, `quota`) |
| `screens-natural.mjs` | the screen check with natural rooms in the strips (a copy of `screens-calibrate.mjs`) | `AIR=1 DISCS=... node screens-natural.mjs x 5 10` |
| `share-table.mjs` | the packed-plan share table of section 1 | `node share-table.mjs` |
| `show.mjs`, `dbg.mjs`, `sketches2.mjs` | print a room, mark its islands and traps, write the sketches used in Part B | |

Scratchpad copy of everything, including the console outputs: `C:\Users\carad\AppData\Local\Temp\claude\C--Users-carad--claude\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\moon-v4\natural\`.

**The numbers behind Part B** (300 seeds a kind, `node stats.mjs`; widths and heights in px; "median air" is the median air column, the basis of the height class):

| Kind | Width (median) | Envelope | Median air | Net end-to-end | Largest step | Height class | Width class | Invariant violations |
|---|---|---|---|---|---|---|---|---|
| Reef | 640-1,152 (800) | 304-336 | 224-288 | 0 | 48 | mid 100% | S 13%, M 87% | 0 of 300 |
| Breakdown | 512-736 (624) | 336 (256 under a 260 head) | 144-240 | 0 | 64 | mid 99.7%, low 0.3% | S 98%, M 2% | 0 of 300 |
| Wriggle | 384-896 (608) | 176-256 | 128-160 | -16 to +96 | 16 | low 54%, mid 46% | S 76%, M 24% | 0 of 300 |
| Roost | 576-896 (736) | 256-384 | 208-336 | 0 | 16 | mid 100% | S 36%, M 64% | 0 of 300 |
| Strand | 672-992 (832) | 240-256 | 192-240 | -48 | 32 | mid 100% | S 2%, M 98% | 0 of 300 |
| Vug | 432-592 (512) | 304-416 | 160-304 | 0 | 32 | mid 100% | S 100% | 0 of 300 |
| Dumbbell | 576-992 (784) | 256-320 | 144-224 | 0 | 32 | mid 99.7%, low 0.3% | S 17%, M 83% | 0 of 300 |
| Shelter | 448-800 (624) | 288-336 | 144-288 | -64 to -48 | 64 | mid 87%, low 13% | S 80%, M 20% | 0 of 300 |

The symmetric builds of the Reef, Roost, Vug and Dumbbell (`sym: true`): 300 seeds each, 0 invalid and 0 not mirror-symmetric (the first draft failed the symmetry test in 5 of 300: section 4.3). Every head cap (16, 17, 21, 22, 23, 25, 26 cells) holds the envelope under the cap, 0 violations in 200 seeds a kind.

---

## 9. Questions

Recommendation first in each.

1. **The furnace holds two rooms a half.** Its ring is 678 px in radius, so each quarter has about 640 px, one room. With the Hot Plates as the pole room, one room in two is natural at best (about 45-50% of the length). (a) **Keep it: the Hot Plates stays the north pole room and a symmetric natural kind takes the south pole** (what the table assumes). (b) Let the **Hot Plates be any furnace room whose bed is on the clock** (every natural room there already is) and make the whole furnace natural: the signature is the clock, not a room. A quarter is about 640 px, so the Hot Plates (900 px minimum, 450 on each side of a pole) leaves no space for a natural room beside it: it is one or the other in a quarter.
2. **Rename the planner's `nat` flag to `sig`** (an affinity '+', not "a natural formation") before V0 writes it. (a) Yes. (b) No: say "natural" everywhere and "formation" for the owner's meaning.
3. **A natural quota placed first** (section 1) instead of letting natural rooms be the filler: it makes the share exact in the deep caves and leaves the first caves with a few. (a) Yes. (b) Filler only (cheaper, but the first cave ends up 62-65% natural: section 1).
4. **Two new orientation codes** (W winding, L ledged) for the axes table. (a) Yes. (b) Fold them into D and H and accept that the Breakdown and the Shelter are one orientation.
5. **The tall Vug** (480-544 px, claims the district above) so that every moon has a natural room in the tall class. (a) Not now: the library's Chimney and Cathedral already give the tall class. (b) Yes, at most one a moon, after a flight check of its own.
6. **Surface natural rooms** (an open Reef as regolith tors, an open Breakdown as a boulder pile). The owner said "every cave", and the surface is not a cave. (a) Leave the surface to the library (the planner's `SUIT` lists them as options, share 0). (b) Add them at 10-15%.
7. **Crowd cap for the Vug** at 12 or more a side, and the one-neck-room-per-district-half rule (N6): measured only in V8. (a) Keep both as written. (b) Drop them and measure first.

---

## 10. Process notes

- Nothing here touched the game, a worktree, the live relay, a browser or a test suite; no `npx`, no install; node scripts at BelowNormal, at most two at a time, each with a timeout. Computer game only; multiplayer means online.
- No word is drawn in any match and none of the pictures carries text (the sheet's only marks are the kinds' ids as digits and the scale bars).
- I did not use the prize fighters' names.
