# Stapy's contest: the lighthouse rebuild (planned for Update 6)

Written 2026-11-16. The owner asked: "stop this Stapy rebuild, write a document that is a complete description of the Stapy rebuild, include that document in the Update 5 and then push Update 5, leaving the Stapy rebuild for Update 6."

This file is that description. It is a plan: nothing in it is in the live game yet. Update 5 ships this document; the contest itself ships in Update 6.

## 1. What the contest is (the owner's design)

Stapy's third event match is a lighthouse hunt, like BFDIA 18. It replaces the old "Search Party" match.

- **Lighthouses:** four, one in each corner of a big dark arena. Everyone starts on a plaza in the middle. Players: you plus three CPUs, free-for-all.
- **Emblem:** each fighter has an emblem in four pieces, one per lighthouse. Climb a lighthouse and stand on your own lever at the top to light your piece. The **first fighter with all four pieces lit wins**.
- **Turning a rival off:** stand on a rival's lever for 5 seconds (a ring fills; a hit or stepping off stops it) to turn ONE of their pieces off. The longer a piece has been lit, the longer this takes, so lit pieces lock in and the match ends.
- **The dark:** outside the lighthouses it is dark. You see only your own light. Ledges and rivals show a faint outline beyond it. Inside a lighthouse it is lit.
- **Stocks:** three. A KO costs one; with none left you are out of the race, but your lit pieces stay on (rivals can still turn them off). There is no time limit.
- **Pits:** six pits in the dark between the plaza and the lighthouses. Falling in costs a stock and puts you back on the plaza.
- **Emblems:** every fighter's emblem is a solid bright colour with a flat white silhouette of that fighter (the style of the show's elimination chart), split into four quarters with no gaps between them. The emblems are drawn huge in the sky backdrop, but **not indoors** (inside a lighthouse they are hidden).
- **No phase names:** no banner or text names a part of the match. The only words are a short goal line at the start and the emblem panel.

## 2. What exists today (branch `g-ct-stapy2`, not in the live game)

The contest is built and playable on the preview build. Round 3 (2026-11-15) has:

- lighthouse rooms that are areas apart (like the oak's mill), reached by a door, with the view cutting to the room;
- rooms far apart and walled, with a clamp (`lhcKeep`) so no warp or dash can carry a fighter from one room to another;
- pits, randomized start slots (the player slot no longer wins by its slot number), backdrop emblems hidden indoors;
- checks: 10 CPU matches all ended (about 2.5 min), all 102 fighters can make every hop, nothing outside the contest changed.

**What is wrong with it** (the owner, after playing): "this is just platforms. not parkour, and neither is the other way." The two climbing lanes are narrow ledges with gaps. That is NOT parkour. Update 6 replaces the inside of every lighthouse.

## 3. The Update 6 rebuild: what it must be

The owner's words (2026-11-15/16):
- Real parkour must include ALL of: **hazards to dodge** (spikes, saws, flame jets, burning beams); **moving, rotating, crumbling and blinking platforms**; **wall-jump shafts**; **swing and ride pieces** (ropes, conveyor belts, fans, springs).
- "it should have an intended path that is **impossible to skip**."
- **Hard but fair**: a few tries in places; a mistake drops you back ONE SECTION (to that floor's checkpoint), never to the bottom. A hazard touch does 3% damage. Nothing inside a lighthouse can KO you.
- **4 floors per lighthouse** (the design below says 5; the owner chose 4 so the match stays near 3 minutes). Keep all four kinds of parkour in every lighthouse.
- ~~**Lamp bulbs: yes.**~~ REMOVED 2026-11-16 (see 3a below). Each floor has 3-4 bulbs on its parkour pieces; the hole up to the next floor opens for you only when you have lit all of them. This makes skipping impossible by rule, not just by walls.
- **Turning off a rival costs a full climb** of that lighthouse: OK.
- **CPU stuck-help: OK.** A CPU that fails the same floor 3 times gets no hazard damage for one try; after 6 fails a rope pulls it to the next checkpoint. The build must count how often this happens.
- **A quick way down** from the lever deck (a one-way chute or slide to the exit door), so leaving a lighthouse is fast. It must be one-way, so it cannot be used to skip the climb.
- **The win cut:** when a fighter completes their emblem, the game CUTS for about 4 seconds to the drowning-out scene from BFDIA 18, then shows the win screen: a dark starry sky, the winner's emblem big and glowing in the middle, a wobbly blob of the winner's colour spreading out with sparks and embers and covering the other emblems (they peek out at its edges), and broad beams of the winner's colour across the sky. It replaces the current "emblem grows" win effect.

## 3a. After the owner played it (2026-11-16): easier, no gates

The owner, verbatim: "this is a bit too hard. it should be easier. remove the stupid gates with stupid conditions." Then: "they should reset you to the floor" and "the walljump sections are ridiculously hard". What the build does now (this replaces the bulb, lid and R-AIR rules in section 4 of the design below):

- **No gates.** No lamp bulbs, no lids, no "go dark when you fall or when you enter" rule. Each floor's way up is simply the open hole at the end of its parkour (the cap on top of it is a one-way ledge: jump up through it and stand on it). The parkour is still the route; a strong recovery can now shortcut a piece here and there, which is accepted.
- **A fall into the net** puts you back on THAT floor's checkpoint (as before, the owner's call).
- **A hazard touch** hurts (3%) and knocks you back away from it, with 60 frames in which the room's hazards leave you alone. No reset. It never launches you far and never KOs.
- **The air in a room:** jumps, double jumps and specials work as everywhere. Only flight, float and Foldy's glide still last at most 30 frames an airtime (so nobody flies straight up a shaft or along a whole floor). R-WARP stays.
- **Kinder pieces (one table, `LH_EASE`):** every ledge, blinking, crumbling and belt ledge 24 px wider (12 each end) and every moving piece (lifts, sliders, prisms, rope seats, wheel seats) 24 px wider; blinking ledges stay on for half of what was their off time; crumbling ledges hold 1.75 times as long and come back sooner (120 frames); belts run at 0.8 of their speed; saws are 0.8 of their size (not the carousel's drum); flame jets, the lamp beam and the bolt burn for 0.7 of the time, about the same middle (the timings between pieces stay); stompers are 16 px narrower; the flue's fire rises at 0.5 a frame and stops under its rest ledge.
- **The wall-jump shafts, much easier:** all four (L0 lens well, L1 weight shaft, L2 chimney, L3 flue) are 110 px wide inside (was 170), 50 to 60 px lower, with no spikes on the walls, a 50 px rest ledge part way up, no saw in the weight shaft, and a generous kick window (in a room a wall within 12 px counts as touched, so a press toward it is the game's own wall jump). Checked: all 112 playable fighters climb all four from the shaft's floor with plain jumps and wall jumps.
- Kept: the lighthouses as rooms apart (like the mill), the 4 floors, the levers and the turn-off, the emblems in the sky, the win cut, the quick way down from the deck, the CPU stuck-help (now counted only for falls and 5 s with no progress), the lever spots dealt per match.

## 4. How the rebuild must be checked

- **Route graph:** only the intended path reaches each next checkpoint.
- **Corner-cut search:** for every one of the 102 fighters, a brute-force search of jumps, air jumps, up specials, wall jumps and drops from every piece, which must print every way it finds to reach a later checkpoint without the intended pieces. Every one found must be fixed.
- **Warp test:** every teleport, warp and dash move, against every inner wall.
- **Reachability:** every fighter can do every required move, including the real wall jump.
- **Matches:** 10 CPU matches must all end; report times, winners, how often the stuck-help fires, pit falls and errors. A scripted keys-only player must be able to win.
- **No-op proof:** every other match in the game is unchanged (state hash).

## 5. The full design

The design below (written 2026-11-15 by the level designer) is the build spec. Where it differs from section 3 above, **section 3 wins**: 4 floors instead of 5, the bulbs are approved, and the quick way down is added.

---

# Stapy's lighthouses: real parkour (design, 2026-11-15)

Design only. Nothing in the game was edited and nothing was run. Every number below was worked out by hand from the engine's constants; none of it has been played or simulated. Section 8 says how the builder must check it.

## Summary for the owner (10 lines)

1. Each lighthouse becomes 5 sealed FLOORS stacked up the room. Each floor is one parkour section. You cross it, go up through one hole in the ceiling, and land on the next floor's checkpoint. Then the lever deck.
2. There is ONE path. Every floor is closed by solid slabs and walls; the only way up is the hole at the far end of the floor. No side lanes, no stairs, no clear column to fly up.
3. All four kinds you asked for are in EVERY lighthouse: hazards (spikes, saws, flame jets, burning light beams), moving / rotating / crumbling / blinking platforms, wall-jump shafts, and rides (ropes, conveyor belts, fans, springs).
4. Four themes: the LENS ROOM (glass, beams, a carousel), the CLOCKWORK (belts, gears, pendulum saws), the STORM STAIR (rotten steps, fans, ropes), the BOILER (springs, flame jets, pistons).
5. A mistake costs one section: a safety NET hangs under every floor's course. Fall in it, or touch a hazard, and you are put back on that floor's checkpoint. A hazard also does 3% damage. Nothing in a room can KO you.
6. Wall jumps: the game already gives EVERY fighter a wall jump when a person plays them, so the shafts use the real one.
7. So that fliers and big up specials can't cheat a floor: in a lighthouse your air jump and up special come back only when you land (the Black Hole contest's rule), flight is capped, and a teleport can't pass through a wall.
8. Backstop that makes skipping impossible by rule, not just by walls: each floor has 3-4 LAMP BULBS fixed to its parkour pieces. They light in your colour as you use the piece. The hole to the next floor opens for you only when all of that floor's bulbs are lit. QUESTION: is that OK? (Without it, a few very mobile fighters can still cut a corner inside a floor; see section 7.)
9. CPUs do the same course with the same physics. If one fails the same floor 3 times it gets hazard immunity for a try, and after 6 fails a rope pulls it to the next checkpoint (slow, 6 s). The build must count how often that happens.
10. Time: a skilled player about 35-50 s per lighthouse. Honest warning: with 20 sections the whole contest will likely run 3 to 4 minutes for CPUs, not 2 to 3. To get back to 2-3 minutes the CPUs would have to be faster than a good player. QUESTION: longer match, or 4 floors per lighthouse?

Also in this file: section 12, the WIN CUT (the screen cuts to the winner's emblem and its spreading blob, as in the episode, for 4 s before the results).

## 1. What the engine has today (read from ct-stapy2/artifacts/V1/index.html)

| Piece | In the engine? | Where | Notes |
|---|---|---|---|
| Sliding block, lift, orbiting block | Yes, in the contest | `lhcMovers`, `MV(...)` in `lhcBuildWorld` | pos = base + amp*sin(2*pi*hazardT/per + ph); carries whoever stands on it; one-way |
| Blinking ledge | Yes, in the contest | `tw.timed`, `LHK.timedOn/timedOff` (200/100) | no tell today: add a 30-frame flicker |
| Crumbling ledge | Yes, but only in Capture the Flag | `g.crumble`, `tm.kind === 'crumble'` (line ~9919), delay 30, back 300 | port to the contest |
| Conveyor belt | Yes, as a zone | `applyZone` case `belt`: x += dir*2.2*strength while on the ground | reuse as a zone on a ledge |
| Spring | Yes, as a zone and a CTF pad | `applyZone` case `spring` (vy -24*s, 24-frame cooldown) | straight up only; the contest needs its own with a sideways throw |
| Fan (updraft) | Yes, as a zone | `applyZone` case `updraft`: vy toward -9.5*s; lets go on Down or a head bonk | reuse |
| Side wind | Yes, but weak | case `wind`: at most 3.2 px a frame and it lets go while you press against it | NOT usable as an obstacle; not used |
| Spikes | Only as a CTF trap pad and in RUNNING! | line ~10475 (`f.vy = -11`, damage) | the contest adds its own hazard boxes |
| Saw, flame jet, pendulum | Only in RUNNING! (its own code, `raceHazards`) | line ~68925 on | copy the look and the tells, not the code |
| Rope swing | No | - | built as a seat on a pendulum (a mover you stand on); there is no hang-on-a-rope state |
| Wall jump | YES, for every fighter a person controls | `mtWallJump` (line 88869), `mtOn` | vy = -11.5*jump stat, vx 6.2 away; ONCE PER WALL FACE per airtime; a double jump gives the kicks back |
| Wall cling | Only Pencil and Stapy | `CLINGERS` | not needed by the design |
| Wall jump for CPUs | Only when the brain asks | `f._aiWJ = hazardT`; needs `msOf(f)` (a moveset) | I did not verify that all 102 have a moveset: builder must check (section 6) |
| Air rule | Yes, in Black Hole's contest | `bhcAirRule`, `BHK.flyMax` | reuse for rooms |
| Room clamp | Yes | `lhcKeep` | keeps warps inside the room; does not stop a warp through an inner wall |
| CPU route | Yes | `lhcGraph`, `lhcDist`, `lhcSteer` | static hops only; movers are not in it today |

Engine numbers used: GRAV 0.62, JUMP -12.5, MAXVX 6.4, wall kick -11.5 / 6.2, jump stat 0.90 to 1.10, run 0.89 to 1.12. By formula a single jump rises about 126 px (102 for the weakest jumper, 152 for the strongest), a double jump about 250 (204 to 305), a wall kick about 107 (87 to 129). The current build's own check says all 102 fighters make: a 120 flat gap, a 90 gap with a 75 rise, a 16 gap with a 100 rise.

## 2. The room

Room: 1400 wide inside, 2400 to the lever deck (LHK.topH stays 2400), deck clear height 190 (LHK.roofGap). Five BANDS of 480.

Coordinates used everywhere below, per band:
- `u` = distance along the band from its START wall, 0 to 1400. Bands 1, 3, 5 start at the door-side wall; bands 2, 4 start at the far wall (mirror: x = 1400 - u).
- `h` = height above the band's own floor slab top, 0 to 440 (clear). World y = room base - (band-1)*480 - h.
- Times in frames (60 a second). Every motion is a pure function of `hazardT`, never random.

Furniture every band has:
- SLAB: solid, full width, 40 thick, top at h 0. Its underside is the ceiling (h 440) of the band below.
- CHECKPOINT (CP): the slab from u 0 to 200, a lit strip. For bands 2-5 it holds the CAP: a one-way ledge u 20-160 over the hole from below.
- NET: the area u 200-1400, h 0-30. Touching it = a fall (section 4). Drawn as a rope net 30 above the slab.
- STEP (ST): one-way ledge u 215-295, h 90, unless the section says otherwise.
- EXIT LEDGE (EX): one-way ledge u 1240-1400, h 340. Above it the HOLE in the upper slab, u 1240-1380. Rise from EX to the cap 140 (a double jump for everyone, or one jump for most).
- EXIT STACK (ES): only where a section says so: one-way ledges u 1250-1390 at h 140 and h 240, under EX (rises of 100).
- Band 1's CP is the room floor by the door (the way in at u 150, the exit door at u 45, as now).
- LEVER DECK: floor at room height 2400, full width, the cap of band 5's hole, the four levers where they are now (LHK.lever), and a WAY OUT door at the door-side end of the deck that puts you outside at the lighthouse's door (same portal code as the exit). There is no way back down through the floors.

Removed from the current room: both lanes, the clear middle column and its chutes, the top stone.

Hop rules for ordinary (non-forced) hops: flat gap <= 110; or gap <= 90 with rise <= 75; or gap <= 30 with rise <= 100.

Body size: the design assumes a standing fighter is at most 68 tall (2r). The builder must read the biggest `f.r` of the 102 and, if 2r is more than 68, raise every clearance marked TC by the difference.

## 3. Piece list (what the builder adds to the contest)

| Code | Piece | Behaviour | Tell |
|---|---|---|---|
| LEDGE | static one-way ledge, 14 thick | as now | - |
| BLOCK | solid | as now | - |
| MOVER | slider / lift | base + amp*sin(2*pi*t/per + ph), one-way, carries (as `MV`) | always moving, rail drawn |
| ROTOR | wheel of level seats | seat i at hub + R*(cos a_i, sin a_i), a_i = dir*2*pi*t/per + i*2*pi/n; seats stay level; carry | always turning |
| ROPE | seat on a pendulum | seat centre = pivot + L*(sin th, -cos th), th = A*sin(2*pi*t/per + ph); 70 wide, one-way, carries | rope drawn |
| CRUMBLE | ledge that gives way | stood on: shakes `delay` frames, gone, back after 150 | the shake, cracks drawn |
| BLINK | ledge on a timer | on, then off; the last 30 on-frames it flickers | the flicker |
| BELT | ledge with a moving top | rider's x += v each frame while standing (zone `belt`) | chevrons moving |
| SPRING | pad 60 wide on a post | throws on a FIXED arc (vx, vy given), vx held until you land or press jump; 24-frame cooldown; leaves you your one air jump | coil, pad squashes 6 frames |
| FAN | updraft column | zone `updraft`, strength given; pulsing ones: blades spin up 30 frames before | streaks, blades |
| SPK | spike strip (hazard) | static box 16 deep on a face | red tips |
| SAW | spinning disc (hazard) | static, on a rail, or on a pendulum | always visible, always moving |
| JET | flame jet (hazard) | cycle: warn (glow) 40, on, off | the 40-frame glow |
| BEAM | burning light beam (hazard) | a line 24 wide; sweeping ones move <= 3 px a frame at ledge height; pulsed ones show a thin aim line 40 frames first | the aim line / the visible sweep |
| BULB | lamp bulb | fixed to a piece; lights for a fighter who stands on that piece the stated frames (or kicks that pad, or is thrown by that spring) | glows in your colour |

TC (tube clearance) = 104 from a carrier's top to the spike tips above it.

## 4. Rules in a lighthouse room

- FALL: feet in the NET area -> KNOCKDOWN-RETURN: 20 frames tumbling where you are (a puff, the net bounces), then you stand on this band's CP at u 60-140 (a random spot), speed 0, and this band's bulbs go dark for you. No damage.
- HAZARD TOUCH: 3% damage, a flash, then the same KNOCKDOWN-RETURN. 60 frames of hazard immunity after it (rivals can still hit you). It never launches you and never KOs: fixed, not scaled by percent.
- A rival's hit works as always. If it throws you into a hazard or the net, that is your fall (combat matters on the climb).
- R-AIR (the Black Hole contest's rule, `bhcAirRule`): in a room, air jumps and the up special come back only on landing on a piece or by a hit; a fan or a spring does not refill them. Flight (`f.flying`) and float (`_floatT`) last at most 30 frames an airtime (`LHK.flyMax`). Foldy's held glide gets the same cap. No move's own data is touched.
- R-WARP: in a room, if a fighter moves more than 40 px in one frame and the straight line from the old spot to the new one crosses a BLOCK, a slab or a hazard box, it is put back at the old spot with speed 0 (the same kind of fix as `lhcKeep`, for inner walls).
- R-BULB: the cap over a band's hole is SOLID for a fighter until all of that band's bulbs are lit for that fighter; then it is one-way. The bulbs by the hole show which are missing.
- Wall kicks use the engine as it is. Because the engine gives one kick per wall face per airtime (a double jump gives them back), every shaft below is short enough for: jump, kick, kick, double jump (, kick, kick).

## 5. The 20 sections

Every section: pieces, path, why it can't be skipped, where a fail lands. A fail always lands on that band's CP (section 4). The checkpoint at the end is always the cap over the hole (the next band's CP). "Forced" = the part that walls and gaps make unavoidable; bulbs are listed last.

### LIGHTHOUSE 0 (top left): THE LENS ROOM
Glass prisms on rails, a turning lens carousel, burning beams from the lamp. Colours: pale glass, brass rails, white-yellow beams.

**L0-1 Sliding prisms** (main: moving platforms; mixed: a drop saw, spikes)
- TUNNEL ROOF: BLOCK u 330-1190, h 230-440; SPK along its underside (tips at h 214). Its left face is a wall above h 230.
- M1: MOVER 90 wide, h 110, centre u 465 +/- 125, per 240, ph 0.
- M2: MOVER 90 wide, h 110, centre u 760 +/- 125, per 240, ph pi.
- M3: MOVER 90 wide, h 110, centre u 1055 +/- 125, per 240, ph 0.
- DROP SAW: disc r 30 on a vertical rail at u 760, centre h = 230 + 60*sin(2*pi*t/200); a slot in the roof u 725-795 hides it at the top. Dangerous to a rider while its centre is under h 230 (100 frames of every 200).
- ES at the far end.
- Path: ST -> M1 at its left end (it touches ST) -> ride -> step to M2 where they meet (45 px overlap, about 30 frames each cycle) -> ride under the saw's slot while it is up -> step to M3 where they meet -> off M3's right end onto ES 140 -> ES 240 -> EX.
- No skip: the roof's face closes everything above h 214; under the roof there is 104 of clearance, so only a short hop fits, and between meetings the gaps are 160 to 250 across with the net under them. The tunnel is 860 long.
- Bulbs: M1, M2, M3 (stand 20 frames each).

**L0-2 The lens well** (main: wall-jump shaft; mixed: blinking glass, a pulsed beam)
- WL: BLOCK u 260-300, h 110-440 (a doorway under it, h 0-110).
- SHAFT FLOOR: the slab u 300-470 is safe floor (no net in the shaft).
- WR: BLOCK u 470-510, h 0-330. The shaft is 170 wide inside, 330 to climb.
- Kick pads (glass panels): R1 = WR's face h 60-140; L1 = WL's face h 150-230. SPK on WR's face h 150-230 and on WL's face h 250-330.
- Climb: jump at the right wall, kick off R1, cross, kick off L1, cross, double jump over WR's top (h 330). Budget for the weakest jumper by formula: 102 + 87 + 87 + 102 = 378 against 330.
- Top run under the ceiling (110 clear): BLINK G1 u 590-670, G2 u 770-850, G3 u 950-1030, G4 u 1130-1210, all h 330, 80 wide. Cycle 200: on 110 (the last 30 flicker), off 90. Phases 0, 50, 100, 150 (a wave that travels with you).
- BEAM: vertical, at u 900, h 30-440. Cycle 200: aim line 40, on 50, off 110.
- Path: CP -> through the doorway -> the climb -> WR's top -> G1 -> G2 -> through the beam's column while it is off -> G3 -> G4 -> EX (gap 30, rise 10).
- No skip: WL and WR close the band from slab to ceiling except the doorway and the 110 slot over WR; the only way from h 0 to that slot is up the shaft. Past WR there is nothing between h 30 and the glass but air over the net.
- Bulbs: R1 (a kick off it), L1 (a kick off it), G2, G4.

**L0-3 The carousel** (main: rotating platforms; mixed: crumbling tiles, a pendulum saw)
- A: LEDGE u 310-400, h 180 (from ST: gap 15, rise 90).
- ROTOR: hub (u 560, h 200), R 120, 4 seats 80 wide, per 300, turning so the left side goes UP. Hub = a spiked drum r 60 (hazard).
- H1: BLOCK u 700-800, h 0-320 (its top is the landing).
- LOW BAFFLE: BLOCK u 500-620, h 0-50 with SPK on top (stops a pass under the wheel).
- CRUMBLE C1 u 870-940, C2 u 1010-1080, C3 u 1150-1220, all h 320, delay 24.
- PENDULUM SAW: pivot (u 1045, h 440), length 90, disc r 26, swing +/- 60 degrees, per 150. At the bottom of its swing it is 4 px over C2.
- Path: ST -> A -> board a seat as it passes 9 o'clock (it touches A, rise 20) -> ride up and over the top -> step off between 12:30 and 2 o'clock onto H1 -> C1 -> C2 while the saw is out to a side -> C3 -> EX.
- No skip: H1 is a wall from the slab to h 320 with only 120 over it; the spiked drum and the low baffle fill the straight line from A to H1. Honest note: a strong double jump from A can arc over the drum without riding; the wheel's bulb stops that.
- Bulbs: the wheel (stand on one seat 45 frames), C1, C3.

**L0-4 The beam gallery** (main: hazards, sweeping beams; mixed: a blinking ledge, a lift)
- LEDGE L1 u 330-450 h 150; L2 u 540-660 h 190; BLINK L3 u 750-870 h 230 (cycle 200: on 120, off 80); LEDGE L4 u 960-1080 h 270.
- LIFT V1: MOVER 90 wide, u 1130-1220, h 240 +/- 90, per 200.
- LENS A at (u 430, h 425): a BEAM from it down to the net, swinging +/- 40 degrees, per 200.
- LENS B at (u 760, h 425): a BEAM swinging +/- 50 degrees, per 300. It crosses L2, L3 and L4.
- SPK on the ceiling u 300-1100 (tips h 424) so a high jump over a beam's top is not an answer.
- Path: ST -> L1 -> L2 -> L3 -> L4, each time crossing behind a beam as it swings away -> V1 near its bottom -> ride up -> EX at V1's top (gap 20).
- No skip: one line of ledges over the net, gaps 90, rises 40; the beams reach from the lenses to the net, so there is no way past one except through the place it has just left.
- Bulbs: L2, L4, V1.

**L0-5 The lamp crank** (main: ropes; mixed: flame jets, a crumbling start)
- A: CRUMBLE u 320-400, h 170, delay 40.
- ROPE 1: pivot (u 520, h 440), L 230, A 28 degrees, per 200, ph 0. ROPE 2: pivot (u 780, h 440), same, ph pi. ROPE 3: pivot (u 1040, h 440), same, ph 0. Seats swing +/- 108 px; h 210 at the bottom, 237 at the ends. Neighbours meet end to end.
- SPIKE PILLARS: BLOCK u 635-665 and u 895-925, h 0-150, SPK on top.
- JETS on the pillar tops (u 650 and u 910), h 166-330. Cycle 400: warn 40, on 40, off 320, timed to burn at every SECOND meeting of the seats above them.
- ES at the far end.
- Path: ST -> A -> rope 1 at its left end -> ride -> step to rope 2 where they meet (if the jet is glowing, stay on and take the next swing) -> rope 3 -> off its right end to ES 240 (gap 67) -> EX.
- No skip: 850 px of net between A and the ES with nothing to stand on but the three seats.
- Bulbs: rope 1, rope 2, rope 3 (20 frames each).

### LIGHTHOUSE 1 (top right): THE CLOCKWORK
Gears, belts, stompers, saws. Colours: dark iron, brass teeth, yellow chevrons.

**L1-1 The belt line** (main: conveyor belts; mixed: stompers, a lift)
- B1: BELT u 320-640, h 100, +4.4 px a frame (forward).
- HALF SAW in the gap: disc r 40 centred (u 695, h 30).
- B2: BELT u 750-1050, h 130, -3.6 px a frame (against you).
- STOMPERS: two hazard blocks 80 wide over B2 at u 830-910 and u 950-1030. Cycle 160: shake 30, down to h 150 in 20, hold 30, up 80. Phases 0 and 80.
- SOLID CEILING over both belts at h 300 (BLOCK u 320-1050, h 300-440).
- LIFT: MOVER 90 wide, u 1140-1230, h 240 +/- 90, per 200.
- Path: ST -> B1 (it carries you fast toward the gap: jump the half saw, gap 110) -> B2, run against it and pass each stomper as it rises -> the lift near its bottom (gap 90) -> ride up -> EX.
- No skip: the ceiling at h 300 and the net leave only the belts' lane.
- Bulbs: B1 (40 frames), B2 (40 frames), the lift.

**L1-2 The gear train** (main: rotating platforms; mixed: a rail saw, crumbling teeth)
- A: LEDGE u 300-370, h 190 (from ST: rise 100, gap 5).
- GEAR 1: ROTOR hub (u 480, h 210), R 110, 4 seats 70 wide, per 280, left side going UP. GEAR 2: ROTOR hub (u 770, h 210), R 110, 4 seats, per 280, left side going DOWN, in step so a seat of each is at the mesh point (u 590-695, h 210) at the same moment. Axles: discs r 30 (hazard).
- RAIL SAW at the mesh: disc r 24 at u 640, centre h = 285 + 35*sin(2*pi*t/140): it blocks every second meeting.
- H: LEDGE u 930-1010, h 250.
- CRUMBLE C1 u 1050-1110 h 285; C2 u 1150-1210 h 320; delay 24.
- Path: A -> gear 1 at 9 o'clock -> over the top -> at 3 o'clock step onto gear 2's seat when the saw is up -> ride DOWN under gear 2's axle and up its far side -> step off at 3 o'clock to H -> C1 -> C2 -> EX.
- No skip: honest note: the wheels stand in open air, so the walls here are weaker than elsewhere; the forced part is the 560 px of net from A to H. The bulbs on both gears close it.
- Bulbs: gear 1 (40 frames on a seat), gear 2 (60 frames on a seat), C2.

**L1-3 The pendulum hall** (main: hazards, swinging saws; mixed: crumbling planks)
- CRUMBLE planks 80 wide, h 150, delay 24: u 330-410, 440-520, 690-770, 800-880, 1000-1080, 1110-1190.
- REST POSTS (solid, safe): R1 BLOCK u 580-650, h 0-120; R2 BLOCK u 900-960, h 0-120.
- PENDULUM SAWS: pivots at h 440, u 480, 770, 1070; length 230, disc r 34, swing +/- 35 degrees; periods 150, 200, 300. At the bottom each is 26 px over the planks; at the ends of its swing it is 98 px over a rest post.
- ES at the far end.
- Path: ST -> two planks under saw 1 -> R1 (wait here) -> two planks under saw 2 -> R2 -> two planks under saw 3 -> ES 140 (gap 60) -> ES 240 -> EX.
- No skip: one row of planks over the net; a saw's swing covers the whole lane between rests.
- Bulbs: R1, R2, the last plank.

**L1-4 The weight shaft** (main: wall-jump shaft; mixed: a rail saw, a slider, tick-tock ledges)
- Shaft as L0-2: WL BLOCK u 260-300, h 110-440; safe floor u 300-470; WR BLOCK u 470-510, h 0-330.
- Kick pads mirrored: L1 = WL's face h 110-190 (first kick); R1 = WR's face h 170-250 (second). SPK on WL's face h 250-330 and WR's face h 60-150.
- RAIL SAW on the shaft's centre line: disc r 22 at u 385, centre h = 180 + 120*sin(2*pi*t/200). You cross the centre line twice.
- Top run: MOVER SM 90 wide, h 330, centre u 705 +/- 150, per 300. BLINK T1 u 950-1030 and T2 u 1110-1190, h 330, cycle 200, on 110 (30 flicker) / off 90, in opposite phase (tick, tock).
- Path: doorway -> the climb past the saw -> WR's top -> SM at its left end (gap 5) -> ride -> T1 -> T2 -> EX.
- No skip: as L0-2.
- Bulbs: L1 (a kick), R1 (a kick), SM, T2.

**L1-5 The escapement** (main: blinking platforms; mixed: a spring, a gear saw)
- BLINK K1 u 320-400 h 110 (phase A); K2 u 440-520 h 135 (phase B); K3 u 560-640 h 160 (phase A). Cycle 200: A is on frames 0-110, B on 100-210 (wrapping), the last 30 of each flicker.
- SPRING POST: BLOCK u 680-750, h 0-170, SPRING pad on top: throw vx +10, vy -13 (about 420 px along, peak about 136 up, 42 frames).
- GEAR SAW: disc r 90 centred (u 915, h 110), under the flight.
- BLINK K4 u 1080-1200, h 180, phase B (the landing).
- ES at the far end.
- Path: ST -> K1 -> K2 -> K3 -> the post -> take the spring when K4 will be on 42 frames later -> land on K4 -> ES 240 (gap 50, rise 60) -> EX.
- No skip: 330 px from the post to K4 over a saw whose top is 30 px above the post.
- Bulbs: K2, the spring (thrown by it), K4.

### LIGHTHOUSE 2 (bottom left): THE STORM STAIR
A wooden stair in a gale: rotten steps, fans, ropes, lightning. Colours: grey wood, rope, blue-white bolts.

**L2-1 The rotten stair** (main: crumbling platforms; mixed: rolling spike balls)
- 10 CRUMBLE steps 70 wide, delay 20, back 140: step i (0-9) at u 300 + 95*i, h 90 + 25*i (the last: u 1155-1225, h 315).
- STEPPED SOFFIT: solid blocks above the stair, underside 150 above each step (keeps jumps to one or two steps).
- SPIKE BALLS: r 20, one let go at the top every 150 frames, rolling down the stair line at 3 px a frame, gone at the bottom. Hop them.
- Path: step 0 takes the place of ST (rise 90 from the CP) -> run up the stair without stopping, hopping each ball -> EX (gap 15, rise 25).
- No skip: the soffit and the net leave only the stair's lane, 925 px long; every step falls 20 frames after you touch it.
- Bulbs: steps 3, 6 and 9.

**L2-2 The gale gap** (main: fans; mixed: spike walls)
- A: LEDGE u 320-420, h 120.
- FAN 1: updraft column u 470-590, h 30-400, strength 1. Cycle 200: on 120, off 80.
- SPIKE WALL 1: BLOCK u 600-640, h 0-330, SPK on its left face and its top.
- B: LEDGE u 660-760, h 250.
- FAN 2: updraft column u 870-970, h 30-400, strength 1, cycle 200, opposite phase.
- SPK on the ceiling u 840-1000 (tips h 424): leave the column before the top.
- C: LEDGE u 1090-1180, h 270.
- Path: ST -> A -> jump into fan 1 while it blows -> rise past h 346 -> drift right over the wall -> B -> jump into fan 2 while it blows -> ride it across -> C -> EX (gap 60, rise 70).
- No skip: wall 1 stands from the slab to h 346 with 94 over it. Honest note: from A the wall is 226 up, which a strong double jump can clear without the fan; fan 1's bulb stops that. The second gap (330 px, B to C) is over the net.
- Bulbs: fan 1 (lifted 20 frames), fan 2 (lifted 20 frames), C.

**L2-3 The rope locker** (main: ropes; mixed: a crumbling perch, lightning)
- A: LEDGE u 310-390, h 185 (from ST: gap 15, rise 95).
- ROPE 1: pivot (u 560, h 440), L 250, A 35 degrees (+/- 143 px), per 200; at its right end at frame 50 of every 200.
- PERCH: CRUMBLE u 730-800, h 235, delay 40.
- BOLT: a BEAM at u 765, h 30-440, cycle 200: the rod glows from frame 110, it strikes on frames 150-180.
- ROPE 2: pivot (u 960, h 440), L 250, A 35 degrees, per 200; at its left end at frame 70.
- Z: LEDGE u 1150-1230, h 250.
- Path: A -> rope 1 at its left end -> ride -> the perch at frame 50 -> rope 2 at frame 70 -> ride -> Z -> EX (gap 10, rise 90).
- No skip: 760 px of net from A to Z; the perch falls 40 frames after you land and the bolt hits it at 150, so nobody waits there.
- Bulbs: rope 1, the perch, rope 2.

**L2-4 The chimney** (main: wall-jump shaft; mixed: a sliding saw)
- LEDGE L1 u 330-450, L2 u 560-680, L3 u 790-910, all h 100 (gaps 110).
- SLIDING SAW on L2: disc r 24, centre h 124, u = 620 + 100*sin(2*pi*t/180).
- WL: BLOCK u 960-1000, h 170-440 (a doorway under it).
- SHAFT FLOOR: BLOCK u 1000-1170, h 0-40 (safe).
- WR: BLOCK u 1170-1240, h 40-340; its top meets EX.
- Kick pads: R1 = WR's face h 60-140, L1 = WL's face h 170-250. SPK on WR's face h 150-230 and WL's face h 260-340.
- Path: ST -> L1 -> L2, over or past the saw -> L3 -> down through the doorway to the shaft floor -> jump, kick R1, kick L1, double jump over WR's top (300 to climb) -> EX.
- No skip: WL and WR close the band's end from the slab to the ceiling; EX is reached only over WR.
- Bulbs: L2, R1 (a kick), L1 (a kick).

**L2-5 The storm shutters** (main: lifts; mixed: blinking shutters, a rail saw, spiked sills)
- LIFT V1: MOVER 90 wide, u 330-420, h 210 +/- 110, per 200.
- BAFFLE 1: BLOCK u 450-480, h 0-250 and h 380-440 (a window h 250-380), SPK on the sill.
- BLINK K1 u 520-600, h 270; K2 u 660-740, h 240; cycle 200, on 110 / off 90, opposite phases.
- RAIL SAW between them: disc r 22 at u 630, centre h = 270 + 70*sin(2*pi*t/150).
- BAFFLE 2: BLOCK u 790-820, h 0-150 and h 280-440 (window h 150-280), SPK on the sill.
- LIFT V2: MOVER 90 wide, u 850-940, h 200 +/- 110, per 200, ph pi.
- BAFFLE 3: BLOCK u 970-1000, h 0-250 and h 380-440 (window h 250-380), SPK on the sill.
- SLIDER V3: MOVER 90 wide, h 300, centre u 1110 +/- 65, per 200.
- Path: ST -> V1 at its bottom -> ride up -> through window 1 -> K1 -> past the saw -> K2 -> through window 2 onto V2 -> ride up -> through window 3 -> V3 -> EX (gap 20, rise 40).
- No skip: three walls from slab to ceiling, each with one window that is reached from a lift at the right height.
- Bulbs: V1, K2, V2, V3.

### LIGHTHOUSE 3 (bottom right): THE BOILER
Springs on steam valves, flame jets, pistons. Colours: red-brown iron, orange flame, white steam.

**L3-1 The valve hop** (main: springs; mixed: a flame jet, a saw)
- P0: BLOCK u 310-380, h 0-100, SPRING 1 on top: throw vx +7, vy -15 (about 339 px along, peak 181 up).
- JET at u 520, h 30-330. Cycle 160: warn 40, on 50, off 70. The flight crosses it 25 frames after the throw.
- P1: BLOCK u 640-730, h 0-100 (the landing, safe).
- P2: BLOCK u 750-830, h 0-100, SPRING 2 on top: throw vx +4, vy -17.5 (peak 247 up).
- H: BLOCK u 900-1060, h 0-260. SPRING 3 on its right end (u 1010-1060): throw vx +10, vy -11.5.
- SAW: disc r 40 centred (u 1150, h 250); the last flight passes 69 px over it.
- Path: CP -> P0 (rise 100) -> spring 1 when the jet is off -> P1 -> P2 -> spring 2 -> land on H -> spring 3 -> EX.
- No skip: H is a wall 260 high; P1 to H needs a 160 rise over a 70 gap; H to EX is 180 px over a saw with EX 80 higher. Honest note: every one of these three can be made by a strong double jump; the springs' bulbs are what force them.
- Bulbs: spring 1, spring 2, spring 3 (thrown by each).

**L3-2 The fire walk** (main: hazards, flame jets; mixed: a long ride)
- TUNNEL ROOF: BLOCK u 300-1200, h 330-440 (solid, no spikes).
- GRATE: MOVER 110 wide, h 120, centre u 720 +/- 380, per 480. Flames pass through it.
- JETS J1-J7 at u 400, 520, 640, 760, 880, 1000, 1100, each h 30-320. Cycle 240: warn 30, on 40, off 170; jet i starts 34 frames after jet i-1 (a wave that runs forward faster than the grate).
- ES at the far end.
- Path: ST -> the grate at its left end -> ride, walking back and forward on it (or hopping) as each jet's glow comes -> off its right end to ES 140 (gap 95) -> ES 240 -> EX.
- No skip: 955 px of net under a roof from ST to the ES; the grate is the only floor.
- Bulbs: the grate, lit twice: once while it is left of u 500, once while it is right of u 950.
- Builder's condition: the solver must find, for a fighter of every size, a clean ride at least every second grate cycle; if not, widen the jets' off time, do not remove jets.

**L3-3 The flue** (main: wall-jump shaft; mixed: rising fire, blinking and crumbling ledges)
- LEDGE L1 u 320-420, h 100. BLINK B1 u 500-580, h 110 (cycle 200, on 120 / off 80).
- WL: BLOCK u 620-660, h 190-440 (doorway under it). SHAFT FLOOR: BLOCK u 660-830, h 0-60. WR: BLOCK u 830-870, h 60-360.
- Kick pads: R1 = WR's face h 110-190; L1 = WL's face h 200-280. SPK on WR's face h 200-280 and WL's face h 290-360.
- RISING FIRE in the shaft: cycle 360: embers 60, then a flame floor rises from h 60 to h 360 at 1.5 px a frame (200 frames), then off 100.
- CRUMBLE C1 u 920-990, C2 u 1040-1110, C3 u 1150-1220, all h 345, delay 24.
- Path: ST -> L1 -> B1 -> through the doorway as the fire goes out -> jump, kick R1, kick L1, double jump over WR's top (300 to climb, the fire 200 frames behind you) -> C1 -> C2 -> C3 -> EX.
- No skip: WL and WR close the band from slab to ceiling but for the doorway and the 80 slot over WR.
- Bulbs: B1, R1 (a kick), L1 (a kick), C2.

**L3-4 The piston deck** (main: lifts; mixed: flame jets, ceiling spikes, crumbling grates)
- PISTONS: four MOVERS 90 wide at u 340-430, 520-610, 700-790, 880-970, each h 150 +/- 100, per 200, phases 0, pi/2, pi, 3*pi/2 (a wave).
- JETS in the three gaps (u 475, 655, 835), h 30-200. Cycle 200: warn 40, on 50, off 110.
- SPK on the ceiling u 320-990 (tips h 424): a jump from a piston near its top hits them.
- CRUMBLE G1 u 1010-1080, h 260; G2 u 1110-1180, h 300; delay 24.
- Path: ST -> piston 1 near its bottom -> hop to the next piston when the two are level (twice a cycle: once high at h 221, safe above the flames; once low at h 79, safe only if the jet is off) -> on to piston 4 -> G1 -> G2 -> EX (gap 60, rise 40).
- No skip: 90 gaps between pistons whose tops differ by up to 141; the ceiling spikes stop a big jump over two.
- Bulbs: piston 2, piston 4, G2.

**L3-5 Pressure** (the last floor: a mix of everything)
- BLINK K1 u 320-400, h 120 (phase A); K2 u 450-530, h 150 (phase B); cycle 200, on 110 / off 90.
- SPRING POST: BLOCK u 580-650, h 0-150, SPRING on top: throw vx +3, vy -15.5 (peak 194 up).
- HH: BLOCK u 690-790, h 0-300.
- SLIDER X1: MOVER 90 wide, h 300, centre u 900 +/- 80, per 200.
- DROP SAW at u 900: disc r 26, centre h = 382 + 32*sin(2*pi*t/150); it reaches a rider while its centre is under h 394.
- BLINK K3 u 1060-1140, h 310 (phase A). CRUMBLE CZ u 1170-1230, h 325, delay 24.
- Path: ST -> K1 -> K2 -> the post -> the spring -> land on HH -> X1 at its left end -> ride under the saw while it is up -> K3 -> CZ -> EX.
- No skip: HH is a wall 300 high with 140 over it (reached by the spring); 270 px of net from HH to K3 with X1 as the only floor.
- Bulbs: K2, the spring, X1, K3.

## 6. Making it work for all 102 fighters

- WALL JUMPS. For a person, `mtOn` is true for every fighter, so `mtWallJump` works for all 102: no added piece is needed. Pencil and Stapy also cling; Eraser kicks 15% higher. The shafts never need more than: jump, kick, kick, double jump.
- The weakest jumpers (jump 0.90 to 0.92, six fighters) have by formula 378 px for a 330 shaft and for the 300 ones: about 15% to 25% spare. If the solver (section 8) shows any fighter under 10% spare, lower that shaft by 30; do not add a ledge in it.
- Rides, belts, springs and fans move every fighter the same way; a spring's throw is fixed, not scaled by stats. I did not check whether the `fall` stat changes gravity in the air; if it does, the springs' landings (L1-5, L3-1, L3-5) need to be 60 wider, or checked per fighter.
- Big up specials and fliers: R-AIR (section 4) plus sealed bands. Bow's Teleport and any other warp: R-WARP.
- Sizes: see TC and the body-size note in section 2.

## 7. What is forced by walls and what only by bulbs (honest list)

By formula a double jump rises 204 to 305 px and carries about 435 px on the flat, before any up special. A band is only 440 high. So inside ONE band, walls alone cannot force a spring, a fan or a wheel on the strongest fighters. What walls do force, for everyone:
- going through all five bands in order, through each band's one hole (the slabs);
- every tunnel ride: L0-1, L1-1, L3-2 (low roof, 850 px or more);
- every rope and plank run over the net: L0-5, L1-3, L2-1, L2-3 (750 px of net or more);
- every shaft: L0-2, L1-4, L2-4, L3-3 (but a fighter with a big up special may need one kick fewer).

What only the bulbs force, for the most mobile fighters: the carousel (L0-3), the gears (L1-2), fan 1 (L2-2), the three springs (L3-1), the spring in L1-5 and in L3-5, and jumping two pistons at once (L3-4).

If the owner says no to bulbs, those seven sections need lower ceilings and longer gaps, the builder must then prove each one fighter by fighter, and some may have to become tunnel versions.

## 8. The can't-skip proof the builder must run

Three checks, all on the final code, none tuned to pass:
1. GRAPH. Every piece is a node (movers and rotors as their whole sweep, blink and crumble pieces as present). The INTENDED edges are listed by hand from section 5. Each band's cap is the only edge between bands. Assert: removing any one bulb piece from the graph cuts that band's CP off from its EX.
2. BRUTE-FORCE FLIGHT SEARCH, per fighter, with the real engine step (the way the RUNNING! solver plays the real game). For each fighter and each band: start standing on every static piece, and on every carrier at 8 phases of its cycle; search key sequences over {left, right, none} x {jump press or not} x {up special once, side special once, down special once} x {fast fall}, branching every 4 frames, up to 150 frames or a landing, with R-AIR and R-WARP on and the hazards and the net deadly. Record every piece reached. Report (a) every landing on a piece that is not the next one or two in the intended order, and (b) every arrival on EX with a bulb unlit. With bulbs on, (b) must be zero, or R-BULB has a bug. (a) is the list of corner-cuts: print it by fighter and section; do not hide it. Run it in quarters of the roster (the last build hit the V8 memory limit).
3. WARPS. The existing warps.mjs test, pointed at every inner BLOCK, slab and baffle of every band (not only the room walls), with double presses.

Also a REACH check the other way: for every fighter the solver must finish every section (so nothing is impossible), and print the spare room: the frames of slack on each timed step and the px of slack on each climb.
Say plainly what the search does not cover: Final Smashes, items, two fighters helping each other, hits from rivals.

## 9. CPUs

- Route graph: one node per piece; edge kinds: hop, ride (get on a carrier, get off at a spot), kick (a shaft), throw (a spring), lift (a fan), wait (a hazard in the way). Bands are joined only by their caps. The lever deck's way out is a portal edge.
- Timing: every mover, blink, jet, saw and beam is a pure function of `hazardT`, and each section's periods share a short common cycle (480, 600, 800 or 1200 frames). So the brain can look ahead exactly: before a hop it samples the next 120 frames of the target piece and of every hazard box on the line, and goes only if the landing spot will be there and no box crosses its path. That is the same information the tells give a player.
- Rides: steer to the carrier's meeting spot, stand, get off when the next piece is in reach (the same look-ahead).
- Shafts: a small fixed controller (jump toward the wall, kick when touching inside the pad's heights, turn, kick, double jump), with `f._aiWJ = hazardT` on the kick frame, as the brain's recovery already does. A CPU needs a moveset for `mtOn`; if any of the 102 has none, the contest must call the kick for it directly. Check this first.
- Springs and fans: walk on when the look-ahead says the landing is clear.
- The bulbs give the CPU its sub-goals in order.
- If it is too hard: count fails per CPU per section. 3 fails: hazard immunity for the next try (a faint shimmer shows it); platforms still fall and blink. 6 fails: a rope pulls it to the next checkpoint over 6 seconds. Both are counted and must be printed in the build report. The aim is under 1 section in 20 needing immunity and no ropes in 10 runs. The trade-off, plainly: with immunity a CPU is visibly cheating on that try; without it one stuck CPU never finishes, and the contest has no time limit.
- CPUs still fight a foe in their face first, as now. They go to turn off a rival's lever only when that rival has 3 pieces (each one is now a full climb).

## 10. Time

By hand, for a skilled player: 6 to 10 s a section (about 1040 px of course plus one or two waits), so 30 to 50 s a lighthouse, plus 3 s on the deck. Four lighthouses and the walks between: about 3 minutes for a very good player.
CPUs: about 9 to 12 s a section with the look-ahead waits, so 45 to 60 s a lighthouse, 3.5 to 4.5 minutes in all. This MISSES the 2-3 minute target. Ways back to it, for the owner to pick: (a) accept about 4 minutes; (b) 4 bands of 600 per lighthouse (drop one section each); (c) a win at 3 pieces. I recommend (a) or (b). Not recommended: shorter sections, because that is how it became "just platforms".

## 11. Engine limits and compromises

- No rope-grab state: ropes are seats you stand on.
- The engine's side wind is too weak to be an obstacle (it lets go when you press against it); fans are updrafts only.
- The engine's spring only throws straight up; the contest's spring is new code (a fixed arc).
- One wall kick per face per airtime: shafts are 300 to 330 high, not tall towers.
- Spikes, saws, jets and beams do not exist as contest pieces: all new, with the tells in section 3.
- A 440-high band cannot wall off a strong double jump: hence the bulbs (section 7).
- R-AIR and R-WARP change how fliers and Bow play, inside a lighthouse only.
- The lever deck needs its own way out, because the floors are sealed.
- The old "fast risky lane / slow safe lane" is gone: one path, as the owner asked on 11-15.
- Not verified by me: that every fighter has a moveset (CPU wall kick), the biggest fighter radius, whether `fall` changes air gravity, and every hop and timing number in section 5. The builder may move any piece up to 40 px and change any period by up to 20% to make the solver pass, and must list each change; it may not remove a forced part, a hazard or a bulb without asking.

## 12. The win cut (owner 2026-11-15: "this is what the drowning out looked like in the episode. it should cut to that after getting full emblem")

Reference: reports/maps/stapy-drown-ref.webp (BFDIA 18). It replaces the current "swamp" effect (the win branch of `lhcBackdrop`, `LHK.swamp`). During play the backdrop emblems stay as they are.

WHEN. The frame a fighter's fourth piece lights (`contestWin`), the screen CUTS: no fade, no zoom. The arena, the room, the HUD and the dark are not drawn; only the cutscene. It lasts 240 frames (4 s), then cuts to the results (`LHK.winHold` = 240). The fight is frozen under it.

DRAW ORDER (back to front), all flat shapes, on a screen W x H; R = 0.21*H:
1. SKY: flat near-black (#0b0b0e). About 90 stars from a fixed seed: grey-white dots, radius 1 to 2.5, alpha 0.4 to 0.9, not moving.
2. BEAMS: two broad straight bands in the winner's colour, each 0.28*H wide, alpha 0.32, soft edges (drawn three times, a little wider and fainter each time). One runs from the bottom-right corner up to the centre; one from the left edge at 0.6*H to the centre. Each rocks +/- 4 degrees about the centre, period 240 and 300 frames. They are behind everything but the sky.
3. THE OTHER EMBLEMS: `lhcDrawEmblem` at radius 0.42*R, each with a thin glow ring of its own colour, at fixed spots round the centre at distance 2.1*R (x stretched by 1.3): angles 150 degrees (lower left), 85 degrees (below), 335 degrees (right, a little up) for three rivals; a rival who is out of the race is drawn at 60%. They do not move.
4. THE BLOB: one closed shape round the centre (W*0.47, H*0.5), its edge at angle a and frame t:
   r(a, t) = B(t) * (1 + 0.16*sin(3a + 0.021t) + 0.10*sin(5a - 0.034t + 1.3) + 0.06*sin(7a + 0.052t + 4.0)), x stretched by 1.35.
   B(t) grows from 1.05*R at frame 0 to 2.25*R at frame 150 (ease-out: 1 - (1-u)^3), then creeps 3% more by frame 240. The three sine terms make the slow wobble; the lobes drift round, never still.
   Fill: the winner's colour, darkest (25% brightness) in a ring at 1.2*R round the emblem, full colour toward the edge (one radial gradient). Soft edge: the shape drawn three times at 1.05, 1.025 and 1 scale with alpha 0.25, 0.5, 1.
   At full size its edge runs about through the rivals' centres, so each is half to three-quarters covered and peeks out at the rim, as in the picture. Check on screen that none is fully hidden and none fully clear.
5. SPARKS, inside the blob only: about 70 orange dots (#ff9a2e, #ffb84a), radius 1.5 to 5, born on the emblem's rim, drifting outward at 0.6 to 2.2 px a frame, living 60 to 140 frames, gone when they reach 95% of the blob's edge. A cloud of about 120 dust specks (radius under 1.2) on the right of the emblem between 1.1*R and 1.8*R. One four-point star twinkle (30 px, orange-gold) at the emblem's lower right, pulsing every 50 frames, and a small one beside it.
6. THE WINNER'S EMBLEM: `lhcDrawEmblem` at radius R, all four pieces lit, no gaps, with a bright rim glow of its colour (a ring 0.06*R wide). It pops on the cut: scale 0.9 at frame 0, 1.06 at frame 6, 1 from frame 12.

TIMELINE: 0 the cut (emblem pops, blob small, rivals whole) / 12-150 the blob spreads over them, sparks thicken / 150-240 it holds, wobbling, beams rocking / 240 cut to the results.

SOUND (no words): on the cut a low "whoomp" (a sine falling 90 to 55 Hz over 0.5 s) with a lamp-switch click; under the spread a swelling chord (three sines, 220 / 330 / 440 Hz, rising to full at frame 150) with a soft noise hiss; sparse spark ticks (1800 to 2600 Hz, 0.03 s) every 8 frames or so; a soft bell at frame 150 when it stops growing. The game's own `tone` and `noise` helpers do all of it. The fight music stops at the cut.

Not seen by me: this is drawn from one still. How the blob moves in the episode between frames is my guess.

## 13. Questions for the owner

1. Lamp bulbs that open the hole to the next floor (summary line 8): yes or no?
2. Match length (section 10): about 4 minutes, or 4 floors per lighthouse?
3. Falling in the net puts you back on the checkpoint by itself (no walk back). OK? A floor you could walk on under the course would be a way to skip it.
4. Turning off a rival's lever now costs a full climb. Keep it so, or shorten the 5 s stand?
