# Moon Caves: design and build plan

Plan only: nothing is built, edited or committed yet. Written 2026-10-29 by the lead designer from two architecture proposals and three engine maps. Line numbers are from `artifacts/V1/index.html` at `fbc9009` (86,830 lines).

---

## Part 1: for you (the owner)

### What it will be like to play

- **The map is a round moon floating in space.** Your team's safe strip is on the left (9 o'clock), and the other team's is on the right (3 o'clock).
- **Gravity always pulls toward the middle.** You can run all the way round the outside. Your screen turns as you go, so your feet always point down. Left and right always mean "along the ground under your feet".
- **Under the surface are rings of caves,** joined by lots of holes and shafts with steps. The outside is the long, open way round. The caves are the shorter, tighter way. The deeper you go, the shorter the loop.
- **Two ways to KO.** On the surface, a hard hit sends someone off into space. Deep in the caves, the floor of the lowest cave has a few cracks over the glowing core. Knock someone through one and they fall in. The cave ceilings stop people flying off, so the surface is where the space KOs happen and the deep caves are where the core KOs happen.
- **The gravity is low,** like The Moon.
- **The moon grows with the number of players.** It is the map that lets you play 15 v 15.
- **It unlocks with The Moon** (after One is beaten).
- **Nothing extra is drawn in the match:** no line for the space edge, no line around the core, and no words on the flags. The core is drawn as a place (a dark hollow with a glow in the middle), not as a warning.

### Choices left for you

1. **15 v 15:** only on Moon Caves, or should unlocking Moon Caves also allow 15 v 15 on the normal Teams map? My pick is Moon Caves only. The normal Teams map stops growing at 7 players, so 30 fighters would be packed into it.
2. **Hard hits:** should a hard sideways hit carry someone off the curve and out into space, the way a thrown thing would leave a real moon? That gives more KOs. Or should hits act like on a flat map, where you stay at the same height and land further round? My pick is carrying off the curve, and only while the person is still reeling from the hit.
3. **Your note that the only KO so far came from one fighter:** which match was that (which stage and which mode)? It tells me whether low gravity is already making KOs too rare. Moon Caves has no sides to fall off, so how far away space starts will be set from your play either way.
4. **Minimap:** a disc that always keeps north up, so the safe strips stay left and right (my pick)? Or a disc that turns with you?
5. **Watching** (CPU-only matches, or after you are out): should the view follow the nearest fight and turn to match it (my pick), with a key that zooms out to the whole moon with north up?
6. **The turning screen:** should it turn smoothly with you, with the same easing the camera already has (my pick)? It holds still while you are inside the core. Or should it turn more slowly, for comfort?
7. **CPUs at 15 a side:** should at most about 5 CPUs gang up on one foe? My pick is yes, because people don't all chase the same person.
8. **World Cup:** keep Moon Caves out of the cup's stage pools (my pick)?
9. **Checks:** after each step, a helper starts the game. It also runs one throwaway script, deleted afterwards and never a test suite, which proves the other maps play exactly as before. Is that OK, or should even that be skipped?

Separate small thing: the normal Teams map's flags draw the words "TEAM 1" / "TEAM 2" in matches today, against the no-words rule. Should those words go too?

### Decided already (from your spec and the house rules)

- **Always 2 teams,** because there are 2 safe strips: 30 players is 15 v 15, and 12 players is 6 v 6.
- **Low gravity, like The Moon.** It unlocks with The Moon.
- **Items appear on floors** (surface and caves, outside the safe strips) and grow in over 12 frames. They never fall from space.
- **Name tags stay readable,** turned upright on your screen.
- **Online works.** Each player's own screen turns for their own fighter. This costs nothing extra on the connection.

### Size and safety

- **Size:** about 2,300 to 3,700 changed or added lines (3-4% of the game file), in 9 steps (M0-M8).
- **Each step stays hidden** behind a switch until the release step, so it is safe to merge on its own. You can turn the switch on in your own browser to try an early step.
- **Other maps:** every change is skipped unless the map is Moon Caves, and the replay check after each step proves it. Free-for-all, normal Teams, Capture the Flag, the World Cup and online play exactly as before.
- **Biggest risks to Moon Caves itself:**
  - some fighters' moves misbehaving on the far side of the moon at first;
  - CPUs getting lost in the caves or walking into the core;
  - too few KOs;
  - speed at 15 v 15 on slower PCs.

  Each one has a plan below.

---

## Part 2: technical plan

### 1. Verdict on the two proposals

Both proposals reach the same family of design.
- **Shared idea:** positions stay in real disc coordinates, and speeds are stored relative to the body. Each moving thing's update runs inside its own "frame", where the world is shown so that its own down is +y. The existing engine (movement, collision, every move, `applyHit`/`knock`, guest prediction) then runs unchanged. All terrain is rings and spokes, so every floor is level and every wall upright in every frame.
- **Where they differ:** how each one shows the world inside a frame.
  - **A (`proposal-local-frame.md`)** uses a polar chart centred on the object: height = radius, left/right = distance along the ground at the object's own radius.
  - **B (`proposal-vector-gravity.md`)** shows bodies through a rigid rotation and terrain flattened at the object's radius. It moves bodies in straight lines (inertial), and gives the CPU brain a second, unrolled "map frame".

| Case | A: polar chart | B: rigid frame + flattened terrain | Plan |
|---|---|---|---|
| Running fast on the deepest floor | Follows the floor at any speed | Lifts off once speed²/r > gravity: a 22 px/frame dash (57559) at r 800 gives 0.6 against 0.43 and goes airborne | A |
| A straight shot or a beam along a floor | Stays at the same height round the curve | Flies straight in real space: at r 2000 it passes about 160 px over a foe 800 px away on the same floor (800²/2·2000) | A |
| Fighters close together hitting each other | Decided in the attacker's chart, where the hitbox and the target are stretched by the same factor: a few px at worst in the deepest cave | Exact (needs a 3-line hurtbox turn in `hurtGap`) | A (good enough) |
| Views | One chart for physics, moves and the CPU brain | A rigid view for moves and an unrolled view for the brain: a CPU aims in one picture and its shot flies in the other | A |
| Other bodies' speeds | Need no conversion (the chart's axes at every point are that point's local axes) | Turned per pair, in and out | A |
| Terrain far from the body (a drop mark 400 px ahead, `surfaceBelow`) | Exact: every ring piece is an exact box in every chart | Sags away from the bodies beyond about 150 px unless a 40-line world query is added | A |
| Hard sideways hit | Flat by default, with an optional inertial knob | Always inertial | A plus the knob, on by default while in hitstun (that is B's flight, with no lift-off on the ground) |
| Remembered points (marks, anchors) | Ride along with the owner unless listed | Track coordinates: a seam at 9 o'clock, and cave distances read up to 1.6x long | Listed pairs are kept in world coordinates and converted by the swap like positions: exact, no seam |
| Seam | None | Inside the left safe area | A |
| Swap ending | try/finally | Lazy (ends at the next loop head) | try/finally: an exception or an early `return` still closes the frame before drawing and networking |
| New objects made during a frame | Length of each list | Creation choke points | Entry stamp: every object present at entry is stamped, so an unstamped object at exit is new. This survives splices and re-inserts (the CPU eyes splice shots out and back, 64399). |
| Proof that other maps are unchanged | A hash of the Crossing only | Seeded replay of FFA, the Crossing, CTF and the Cup | B's |
| Disc art | 1024 px tile cache | Live arcs culled by angle | B's: tiles over a 6,800 px disc would be about 44 tiles x 4 MB |
| Safe areas | Wedges plus a new zone test | World rectangles at 3 and 9 o'clock | B's: `zone{x,y,w,h}`, its drawing and `worldGeo` keep their format |
| Cave spacing | 560 px (420 px of headroom) | 300 px | A's: room for a double jump (about 343 px in low gravity) and for fights |
| Online geometry | The pieces (4-8 KB every 3 s) | Seed and count (60 B) | A's: it cannot drift if host and guest builds differ, and it is under today's 10.5 KB |
| Size | 1,900-3,100 lines | 3,000-3,900 lines | 2,300-3,700 lines |

**Verdict: build A's polar chart, with B's replay proof, safe-area rectangles, live disc drawing and choke-point list.** The deciding cases are the ones B gets wrong in play:
- fast runs lifting off the inner floors;
- straight shots and beams leaving the curve and missing foes on the same floor;
- a CPU that reasons in one picture while its moves happen in another.

A's only real cost against B is a few px of inexactness between fighters at different heights, and only near the innermost floor. Keeping that floor at r 800 or more holds it to a few px.

### 2. Architecture: one polar chart per moving thing

**2.1 Coordinates.**
- The disc centre C = (cx, cy) is the middle of the world box.
- For a point p: `r = |p - C|`, and `th = atan2(p.x - cx, -(p.y - cy))`, measured clockwise from 12 o'clock.
- Positions `x, y` are always real (Cartesian) between frames. Drawing, snapshots, the camera, zone tests and CPU eyes records all read them as they are.
- Velocities are stored local: `vx` runs along the ground, clockwise positive (body-right), and `vy` points toward the centre, positive down. So:
  - all 678 `.vy` lines and every `vx`-against-face test keep their meaning;
  - the draw code that reads velocity is right inside the upright turn: squash 74583, `visualFace` 74697, run dust, the rig's run cycle 70853.
- Gravity has the same strength everywhere: `GRAV*0.7` from `hazard:'lowgrav'`, 43037.

**2.2 The chart of object E** (angle `phi`, radius `rho`, taken from E's real position at entry):

```
to chart:    x' = cx + rho * wrap(th_o - phi)     y' = cy - r_o          (wrap to -PI..PI)
from chart:  th = phi + (x' - cx) / rho            r  = cy - y'           -> back to Cartesian
velocities:  unchanged (local in both)
```

- **E itself** sits at `(cx, cy - rho)`. `x' += vx` moves E exactly `vx` px along its own circle, and `y' += vy` moves it radially.
- **Every ring piece** `{r0, r1, a0, a1}` is an exact box in every chart: `x = cx + rho*wrap(a0-phi)`, `y = cy - r1`, `w = rho*(a1-a0)`, `h = r1-r0`. It is split in two where it crosses the far point.
- **Heights mean the same in every chart,** because y' depends only on the radius. So stored heights (`_jmp0.y`, `_aiFloorY`, `_fallTop`, `rideTop`, a trap's `warnY`) need nothing.
- **Far things read sensibly.** A foe across the disc reads as far left or right, never "below, through the core", because the far point of each chart is half a lap from its owner. There is no seam anywhere.

**2.3 The swap: `mcEnter(E)` / `mcExit()`.** Both return at once unless `MCAVE.on`. `MCAVE` is a new global, null outside a Moon Caves match. The name avoids confusion with `ONE_STAGE.MOON`.

- **Enter:**
  - **Swap set:** for each object in the swap set, stamp it `o._mcS = serial`, save its Cartesian x,y, write the chart x,y, and remember what was written.
  - **Swap-set lists:** `fighters`, `projectiles`, `summons`, `items`, `FINX`, `tendrils`, `CP_BITS`, plus the dynamic platforms `FX_PLATS`, `FILE_RIDES` and `SPONGY_PLATS`. On this map these are stored as polar pieces and charted like terrain.
  - **Terrain:** set `worldPlats` (and so `platRects()`, `onDropLedge` 15285, `vanTopsAt`, `surfaceBelow` and `standAt`) to E's window of pieces.
  - **Window:** the pieces within ±600 px of arc. For a CPU think, ±3,000 px.
  - **Lookup:** pieces are found through a 128-bucket angle index, as boxes from a pool that is rewritten in place (no allocation per frame).
  - **The `plats` local:** step()'s fighter loop reads the local `plats` captured once per step (43036; used at 43704 and 43737). It becomes `let` and is re-read per fighter only when `MCAVE.on`.
- **Exit:**
  - **Stamped objects** go one of three ways:
    - if `o._mcPlaced === serial`, it is already Cartesian (respawn, item spawn), so leave it;
    - if its chart x,y are unchanged, put the saved Cartesian back bit for bit, with no drift for bystanders;
    - otherwise convert it from the chart (E itself, and anyone pushed, grabbed or thrown).
  - **Unstamped objects** in swap-set lists were made during the frame, so convert them from the chart.
  - **Append-only cosmetic lists** (`particles`, `HIT_ART`, `beams`, `IMPACT_DUST/DEBRIS/SCARS/OUT`, `COS_KO_FX/OUT`, `DEBUG_HITS`): convert the new entries.
    - Particle velocities turn from local to world, because particles step in world coordinates and their gravity points to the centre.
    - Hit-art shapes become world shapes: circle centres; capsule ends; fan centre, with the angle plus th; polygon points; and `box` becomes a polygon. So `haPack` 76165 and drawing need no frame knowledge.
    - Beams become polar `{r, a0, a1}` and are drawn as arcs.
  - **Terrain:** the lists go back.
- **Writing a world position from inside a frame:** `mcPlace(o, x, y)` writes a real position and marks it placed. Users: the Teams respawn in `eliminate` 60399-60403 (called from inside hits), `spawnItem`, placing an assist at a pad, and return-to-base effects.
- **Remembered points:** x/y pairs an object keeps between frames are listed. They are stored in world coordinates and charted in and out by the swap, exactly like positions.
  - The starting list, merged from both proposals:
    - shots: `warnX/warnY`, `armX0/armY0`;
    - summons: `_homeX/homeX`, `_aimX/_aimY`, `_x0/_y0`;
    - Final Smash: `_fsLock.x/y`, which `fsLockHold` 43048 pins to outside frames;
    - fighters: `_pinX/_pinY`, `_castX/_castY`, `_lastX`, `_mtCrushFx` 45039, `_nsplit` 46280, `_tp.ax/ay` 57434, `_attractFx.tx/ty` 58382.
  - Move state in `_sm` and `_mv` is audited by the M3 sweep. Unlisted short-lived points ride along with their owner, which is harmless or even right.
- **Frames never nest.** A frame asked for while one is open reuses it.
- **Wrap sites:** each one is `mcEnter(X); try { body } finally { mcExit(); }`.

| Wrap | Where (fbc9009) |
|---|---|
| Each fighter, from after the dead / Final Smash lock / hit-freeze early `continue`s (43047-43053) to the end of the body (43824): input, CPU think, attacks, hits, movement, collision, zones, KO | `step()` |
| Drop carry | 43828 |
| Each shot; shots against summons | 43839-44088; 44089-44127 |
| Each summon (assists' fighter-grade body) | `updateSummons` (~42940) |
| Each loose item | `updateItems` 21597 |
| Each finisher running; a Final Smash (its user's frame) | `finxStep` 47463; `fsStep` 21722 |
| Tendrils, big file rides, turrets | 42928, 54495, 57282 |
| Guest prediction, once per replayed frame | `netPredRun` 76914 |

**2.4 CPU eyes inside a frame.**
- `cpuSeeRecord` (43045) records Cartesian positions outside frames.
- `cpuSeeSwap` charts the delayed x,y when a frame is open; this is one edit.
- `cpuSeeEnd` puts back the charted live values.
- So the order is: frame in, eyes in, `aiThink`, eyes out, the rest of the fighter's frame, frame out.

**2.5 The flight knob (owner question 2).**
- At E's exit, if `MCAVE.flight` is on and E is airborne with `hitstun > 0`, its local velocity is turned by `-(th_new - th_old)`. That is parallel transport: the launch then travels in a straight line in real space, so a hard sideways hit rises off the curve.
- **Grounded bodies, shots and beams never get this,** so runs follow the floor and shots follow the curve.
- **Why it matters:** on the surface at r 2000, a launch with 28 px/frame along the ground feels 784/2000 = 0.39 of outward pull against gravity's 0.43. During hitstun that diagonal launch rises almost as if there were no gravity. This is the main source of space KOs from strong side hits, which today are "almost all" KOs (19455).
- **No orbits:** once hitstun ends, the air cap (43585) clamps the along-ground speed back to drift speed.

**2.6 The correctness cases, one by one.**

- **Two fighters in different frames hitting each other.**
  - Hits are decided in the attacker's chart. The hitbox (`f.x + f.face*reach`) and the target are near each other, and both are stretched by the same `r/rho`. So the error is a few px even in the deepest cave, and about 1 px at the surface.
  - The target's hurtbox is upright in the chart, which is its own upright, so `hurtGap` 20666 is unchanged.
  - `knock` 60057 writes the target's local velocity directly: "up" is away from the centre for the target, and the `-kp*0.025` lift (60033) and the smash-angle clamp (60029) mean the same for it.
  - Hits are not quite symmetric: f-hits-t is checked in f's chart and t-hits-f in t's. They differ by a few px near the innermost floor and not at all at the surface. That is accepted.
- **Grabs and throws.**
  - Grabs: `t.x = f.x + f.face*30` (43513, 43546) places t along f's ground in f's chart. At exit t is converted, so the placement is exact.
  - Throws: knock in f's chart, with no conversion.
- **Shots round the curve.**
  - Each shot runs in its own chart. Straight shots keep their height round the ring, so ranged kits play as on flat maps. Gravity shots (`pr.vy += 0.34`, 43937) fall toward the centre and land on `vanTopsAt`.
  - Homing (43847) follows the ring, not through rock. Walls stop shots as today.
  - New guard: a shot is removed once it has travelled half a lap (in a flat world it would have left the map). Shots below `r_kill` or past `R_blast + 400` are removed.
- **Knockback into the core.**
  - A spike (positive `vy`) drives the target toward the centre. Through a hole in an upper cave floor, it lands on the floor below. Through a crack in the innermost floor, it falls into the hollow, and `r < r_kill` is a KO.
  - The fighter can still double jump or up-special back out, because "up" is outward.
- **Knockback out to space.** `r > R_blast` is a KO. Cave ceilings stop upward launches inside the caves (a bonk), so the surface is for space KOs and the deep caves are for core KOs.
- **The KO test.** At 43817 it becomes `if(MCAVE.on){ const r = cy - f.y; if(r > MCAVE.Rblast || r < MCAVE.rKill) eliminate(f); } else <today's line>`. It runs inside the frame, so `cy - y'` is the true radius.
- **KO lines named elsewhere:** Marshmallow's save (43810) becomes radial, near `r_kill`.
  - `fsKoFlight` 22104 and `kocLaunch` 22163 (the slow-motion KO prediction) run in the target's chart, test the two radii, and apply the flight knob.
  - A van falling out (`y > WH+200`) and items at `WH+160` use `r < r_kill`.
- **Ledges.**
  - There is no ledge grab, as on every Teams map: `isBig()` is true, so `edgesAllowed` is off.
  - Walls are spoke faces, so cling and wall jump work. The one fix: `_wallId` (43724, and in `netPredRun` 76963) uses the piece id plus the side when `MCAVE.on`, instead of the box x, which changes as the chart moves.
  - Drop-through (43800-43806) works on one-way pieces.
- **Recovery.** "Up" is outward, so `upLaunch` 45836, `riseShape` 45985 and `UPSPEC` 45860 are right. The warp clamp `max(40, ...)` only bites past the blast ring, because the world box is sized for it (section 3).
- **`groundY()`.** On this map it returns `cy - R_out`, the outer surface's line, which means the same in every chart. That matches today's fixed `0.86*WH` line on Teams.

### 3. Geometry

All terrain is annular pieces: `MCAVE.segs = [{id, r0, r1, a0, a1, solid|oneway}]`. A one-way piece is 14 px thick.

`buildMoonCaves(N, MS.w)` is a new early branch in `setupWorld` 19546, next to `buildOneArena` 19552.
- It is pure (no `Math.random`), so replays and the guest rebuild the identical disc.
- It is mirror-symmetric about the 12-6 line, so both teams get the same map.
- It sets `MCAVE` and leaves `FLOOR_SEGS` null. Every other `setupWorld` path clears `MCAVE` first.

**Sizes.** These are first guesses; your play sets the final numbers.
- **Outer radius:** `R_out = clamp(620*sqrt(N), 1700, 3400) * MS.w`. That gives about 1.2 M px² of disc per fighter.
- **Outer crust:** solid from `R_out - 140` to `R_out`. Its top is the surface, walkable all the way round.
- **Caves:** a pitch of 560 px each, with 420 px of headroom and a 140 px rock floor. Cave k's floor top is at `R_out - 560k`.
  - The number of caves is the largest k ≤ 4 that keeps the innermost floor at r 800 or more. Below that, the chart error grows.
  - The innermost cave's floor is "the shell". Under it is the hollow core.
- **Core KO radius:** `r_kill = shell bottom - 200`. That is a short drop: a quick jump saves someone who walks in, and a spike usually doesn't.
- **Blast ring:** `R_blast = R_out + 1300`. Clearing it from the surface needs an outward speed of about 34. The Crossing's top line is 2,720 px up.
- **World box:** `WW = ceil(2*PI*R_blast) + 1000`, `WH = 2*R_blast + 800`, with C in the middle.
  - Every chart position and every disc position stays inside the box.
  - So the 191 `clamp(..., WW)` lines, the side lines and the warp clamp never fire.
  - The box is mostly empty. Nothing allocates per world pixel on this map (no tile cache; the crowd and pit shade are skipped).

| Fighters | R_out | Caves | Shell top r | Core KO r | Blast ring r | Surface, safe strip to safe strip | Shell, the same |
|---|---|---|---|---|---|---|---|
| 4 | 1700 | 1 | 1140 | 800 | 3000 | 5,340 px, 13.9 s | 3,580 px, 9.3 s |
| 10 | 1961 | 2 | 841 | 501 | 3261 | 6,160 px, 16.0 s | 2,640 px, 6.9 s |
| 20 | 2773 | 3 | 1093 | 753 | 4073 | 8,710 px, 22.7 s | 3,430 px, 8.9 s |
| 30 | 3396 | 4 | 1156 | 816 | 4696 | 10,670 px, 27.8 s | 3,630 px, 9.5 s |

(Walking is `MAXVX` 6.4 px/frame, about 384 px/s. The Crossing is about 15 s end to end. The inner way is the short, dangerous route and the outside is the long, safe one.)

**Passages ("a lot of passages").**
- **Holes:** every rock band except the shell (the crust and each cave floor) has holes about 220 px wide.
  - There is one per about 1,300 px of arc, an even number with at least 4 per band, staggered by half a spacing from the band above, so routes zigzag.
  - That makes about 16 in the crust at 30 players.
  - There are no holes inside the safe strips, except each strip's lift.
- **Steps:** under each hole are one-way steps zigzagging up: +140, +280 and +420 above the lower floor, then 140 more to the upper floor.
  - Every climb is 150 px or less (the CPU climb rule, `FIELD_ROW_GAP` 19433).
  - No wall is taller than two jumps (about 343 px in low gravity, `aiClimbReach` 63195).
- **Cave ledges:** one-way ledges about 210 px above each cave floor, 220-400 px long. **Hop-tops** on the surface: one-way arcs 160-300 px above it, outside the strips.
- **Core cracks:** openings about 260 px wide in the shell, 2 at 12 and 6 o'clock, far from both strips. From 16 players there are 4 more, at 1:30, 4:30, 7:30 and 10:30.
  - These follow The Moon's lesson (2605-2609: 9 of 30 KOs were CPUs walking down the hole at 0-2%):
    - no one-way plank lies over a crack;
    - the cave floor above a crack has no hole straight over it;
    - you reach a crack only by being knocked in or by walking along the shell.

**Safe strips (left and right).**
- Each is a world rectangle 700 px tall, centred on the horizontal line through C. It runs from the shell's underside out past the blast ring: team 0 (the human's side, as `wallBand` 19518 does) at 9 o'clock, team 1 at 3 o'clock.
- On a disc this is a constant-width band through every layer. It gives 700 px of floor on the surface and on each cave floor.
- `teamZoneOf` 59625, `enemyZoneOf` 59640 and `inOwnTeamZone` 59676 keep their rectangle tests. Inside a frame they read the object's saved Cartesian position (one hook each).
- The `applyHit` gates (59819, 59822), the trespass bleed (43176), the AI zone checks and `worldGeo`'s `zone{x,y,w,h}` work unchanged.
- **Spawn pads:**
  - 3 on every floor inside the strip (the surface and each cave);
  - the strip's **lift**: a hole through every band with its column of steps, so a fighter who reforms can come out on any layer;
  - 3 hop-tops above the surface.
  - At 30 players that is 15 + 12 + 3 = 30 per side. The minimum is `ceil(1.2 x team size)`, so 18 at 15 a side.
- Start spots: `b.spawns[rank % b.spawns.length]` (20132, which uses 10 today).
- The respawn's `sp.y - 40` (60402) becomes "40 px outward from the pad", written with `mcPlace`.
- A new `discBand(side)` stands in for `wallBand` on this map. `pickSpawnPad` 59663 is unchanged.

**Selection.**
- A new `STAGES` row: `{id:"mooncaves", name:"Moon Caves", secret:"one", hazard:"lowgrav", teamsOnly:true, layout:"disc", sky:[space], ground:"#9a9da5"}`.
- `stageOpen` 2619 already hides `secret:'one'` until One is beaten. Guests and replays still find the row by id.
- The stage lists filter `teamsOnly` by mode: the cards (16289), 17139, the cup pools (15901, 18120) and the online lobby (77635).
- Switching to FFA with Moon Caves picked falls back to The Moon.
- On Moon Caves the split is forced to 2 teams; `teamSplitsFor` 2737 lists 4 teams first.

### 4. Camera and drawing

**Host camera** (`updateCamera` 64516):
- The position eases as today (0.12). `camAng = -th(camera centre)`, so the angle eases with the position, and the render interpolation (21302) smooths it for free.
- The angle is held while the camera centre is inside the shell's underside, where atan2 spins.
- The camera cuts (position and angle snap) when its target jumps more than 1,200 px in a step (a respawn), so there is no half-turn spin across the disc.
- `camTarget` 64508 skips its world-box clamp on this map.

**Draw transform** (65543-65547):
- On this map: `translate(W/2,H/2); rotate(camAng); scale(zoom); translate(-(camX+W/2), -(camY+H/2))`.
- While `!MCAVE.on` the old lines run exactly as they are.
- One `worldToScreen()` serves the helpers that repeat the old maths, again with the old maths kept verbatim when off: `fsCamApply`/`fsToScreen` 22206-22220, `drawOffscreenArrows` 65924, the minimap view box 65863, `viewRect` 15315 (used at 22848 and 23023) and `ctutToScreen` 17562.
- Culling uses the turned view's half-diagonal, about 913 world px at zoom 0.72.

**Guest camera:** the same formula in `clientCamera` 76760, reset in `netViewReset` 76798. The camera is never sent.

**Controls are body-relative:** left and right run along the ground under your feet. The input bits are unchanged, so the host never needs anyone's camera angle. Once the camera settles, screen-left is body-left.

**Watching** (CPU-only, spectating, after you are out): the view follows the midpoint of the closest pair of foes (like `cupCamFocus` 18129), held about 3 s before it switches, and takes its angle from that point. This replaces "the first living fighter" at 64524. Optionally a key zooms out to the whole disc with north up (owner question 5).

**The disc:**
- Pieces are drawn live as annular paths (`ctx.arc` out and back), culled by the angle index. About 20-40 are visible at a time.
- Each piece carries decoration fixed at build time: crater marks on the crust's face below the walking line, and rubble in caves. The art therefore matches the collision exactly.
- Colours: moon grey `#9a9da5` on the surface, darker cave insides.
- There is no tile cache.

**Core and space:**
- The core is a dark hollow with a glowing core at the centre: scenery, a place.
- Nothing is drawn at `r_kill`, and no blast ring is drawn (no warning lines).
- The backdrop is a starfield drawn over the screen's half-diagonal and turned by `camAng`, with Earth fixed in space.
- Skipped on this map: The Moon's horizon art (65259+), `saFrame`, `drawCrowd` 62731 and the big-map pit shade (65566-65571).

**Upright drawing:** `mcUpright(ctx, x, y)` = `translate(x,y); rotate(th); translate(-x,-y)` wraps:
- `drawFighter` (after the translate at 74511);
- `drawItem` 66032, `drawSummon` 66285;
- **all** of `drawProjectile` 64549+. Shot velocities are local, so even the shots aimed along their speed need it;
- `drawKitFx` 66362, `finxDraw` 47780, `drawCardProps`;
- scars and dust 60273/60284, landing dust 63085, `drawCosKoFx` 86367.

The checklist is the 82 `translate(<obj>.x` sites. Name-tag pills are turned back to screen-up. Particles and hit art are already world-space and need nothing.

**Safe strips:** a team tint over the two rectangles, and a flag on the surface with **no words**.

**HUD and minimap:**
- The minimap is a disc (rings, strips, dots), north-up by default (owner question 4), with a turned view box. It moves below the cards when there are more than 20 fighters.
- Offscreen arrows go through `worldToScreen`.

### 5. CPUs

**The brain needs almost no change.** It runs inside the CPU's own chart (`aiThink` is called at 43086, inside the fighter frame), so `dx` is "along the ground" and `dy` is "radial, positive toward the centre". The following stay right:
- climb and drop (`steerClimb`, `nearestDropX`, ANOTHER LEVEL 63779), THE LONG WAY 63758 and NO WAY THROUGH 63695;
- the flank, whose "high road" is outward: the surface;
- the fight layer, `aiRiseLeft`/`aiClimbReach` and the kit CPU parts.

A foe across the disc reads as far left or right, so the long way walks round the ring. The CPU always sits at chart x = cx, so there is no seam.

**New work:**
1. **Pit sense.**
   - `brainLedge` 63881's gate `!FLOOR_SEGS` becomes `!(FLOOR_SEGS || MCAVE.on)`. `standAt` 63897 then answers from the charted pieces, where the core cracks are the only places with nothing below. Check `groundAt` with `FLOOR_SEGS` null: below the surface line `groundY() >= top - 4` is false, so only pieces count.
   - Drop-through toward a foe below (63772, 63785) also requires `standAt` underneath.
   - `platRects()` is cached per frame, because `standAt` runs inside `brainLedge`'s 20 px loop.
2. **Core recovery.**
   - `brainRecover` 63829: `offLeft`/`offRight` are off on this map.
   - `fallingOut` becomes "below the shell's underside" (`y' > cy - shellBottom`). The goal is the nearest crack's chart x, then jump or up-special outward. This is a Moon branch next to `edgeGoal` 63869.
3. **Routes.**
   - The generator writes a passage table: each hole, lift and crack with its upper layer, lower layer and angle.
   - When the target is on another layer, or more than about 1,500 px away, GETTING THERE (63758-63788) steers to the nearest mouth that leads toward the target's layer, the way it already steers to `nearestDropX`.
   - The surface is the sure route. The 4-second give-up stays.
4. **Leaving its own strip** (63790-63797): head toward the target (the sign of chart dx) instead of `z.x+z.w/2 < WW/2`.
5. **Team plans at 15 a side:** cap "focus" followers at about 5 (owner question 7).

People-like play is unchanged: the eyes still see 10-30 frames late, the hands keep the 3/5/6 key-change rates, and nothing is tuned for bots.

### 6. Online

- **Snapshot:** unchanged. `x,y` are Cartesian and `vx,vy` local. The guest's glide (`netGlide` 76568) uses only positions, and no per-fighter angle field is needed. The only guest code that moves things by velocity is particles (76738, world velocities) and prediction (76948, inside the chart).
- **Geometry:**
  - `worldGeo` 76267 / `applySnapshot` 76597 carry `moon:{cx, cy, Rout, rKill, Rblast, shell, segs:[[id,r0,r1,a0,a1,flags]...], passages, strips, pads}`. That is about 4-8 KB, sent on change or every 3 s as today, so the guest gets exactly the host's disc whatever build it runs.
  - The guest sets its own `MCAVE` from it.
- **Guest prediction** (`netPredRun` 76914), for each replayed frame:
  1. Chart the guest's own predicted body at its angle.
  2. Re-read the terrain window as `plats`. Today it is read once, at 76920.
  3. Run the **existing** body unchanged, with wall ids from piece ids.
  4. Convert back.

  This is about 20-25 lines, and prediction stays on, so the 2026-10-24 "server lag" complaint does not come back.
- **Guest cosmetics:** the guest camera (section 4); particles fall toward the centre (76738); beams arrive as polar rows (the `{x0,y,x1}` row at 76440 gains a form flag); hit art arrives as world shapes.
- **Rate at 30:** about 9.5 KB per snapshot, about 21 Hz (view-net probe), inside today's gate.
- **Humans:** the relay seats 8 humans (`MAX_PEERS = 8`), so 15 v 15 online is 8 humans plus 22 CPUs on the host. **The live relay is never touched or redeployed.** All online checks are a host and guest joined in memory in jsdom.

### 7. 15 v 15 and speed

**Selection:**
- `MAX_TEAMS` (2712) becomes a function: 30 on Moon Caves, else 20. Its users are 7384 (`netSideSizes`), 15886 and 20067.
- `countOptions` 2714 adds 30 only when the stage is Moon Caves and it is unlocked (owner question 1). Switching away clamps back to 20.
- The online lobby (77641) builds from the same functions.

**HUD at more than 20 cards:**
- compact cards (2 rows of 15), and the bar's 128 px cap raised (CSS 421-430);
- the minimap below the bar;
- `updateHUD` 21128 skips unchanged writes, and the standings (21101) rebuild only on change. These are Moon-gated for zero risk; they could be opened to every map later with your OK.

**Speed.** Today's logic at 30 on the Crossing is 11.0 ms average and 19.1 ms p95 (`map-cpu-scale.md`). The frames add about 0.3-1 ms. Levers, in order:
1. **Shared eyes:** a Moon-only CPU think pass before the fighter loop, with one eyes swap per (team, react level) group instead of one per CPU.
   - `cpuSeeBegin` is 37% of the step at 30. `cpuSeeOwn` excludes the same team for the whole group, so one swap serves it.
   - Each CPU's chart is entered inside the group's swap.
   - CPUs already see 10-30 frames late, so thinking at the top of the frame changes nothing they can see.
2. **Windowed collision:** the angle index scans about 10 pieces instead of the Crossing's 168 per fighter. This is built in.
3. **The HUD dirty checks** above.
4. **If still short:** angle-pruned target lists in the hit loops (Moon only), and CPUs with no foe within `fightReach` think every other frame. Their hands only change keys 3-6 times a second anyway.

**Target at 30 fighters on the probe machine:** logic average ≤ 8 ms and p95 ≤ 14 ms. The lead times `draw()` in the built-in browser pane at 30. Over budget, the game plays in slow motion rather than crashing (`tickClock` 21230).

### 8. What stays untouched on every other map

- `MCAVE` is set only by `buildMoonCaves()` in a Teams match on stage `mooncaves`, and cleared at the top of every `setupWorld`. Every hook is `if(MCAVE.on)` or a function that returns at once.
- **Shared code that gains text** (all no-ops when off):
  - the try/finally wraps (section 2.3);
  - `let plats`;
  - the KO line;
  - particle gravity (host and guest);
  - the draw transform and `worldToScreen` (old lines kept verbatim when off);
  - the zone tests;
  - `platRects`/`groundY`;
  - `_wallId`;
  - `cpuSeeSwap`;
  - `brainLedge`/`brainRecover`;
  - the stage-list filters;
  - `MAX_TEAMS`/`countOptions`;
  - the HUD dirty checks;
  - `worldGeo`/`applySnapshot`.
- **Not changed at all:** CTF (it returns from `setupWorld` before the Moon branch), Boss Rush, One, Cobs, the editor, custom levels, the relay, the input format.
- **Proof at every milestone:** the same-game replay (section 10). It must be identical.

### 9. Milestones

Each milestone merges on its own, hidden behind `MCAVE_DEV` until M8. `MCAVE_DEV` is off for everyone. The lead turns it on in the preview pane for pictures, and you can turn it on in your own browser to play an early build. Each one is one build job (one agent), plus the M3 tail.

| # | Milestone | What ships | Lines (est.) | Checks (besides the standard two, section 10) |
|---|---|---|---|---|
| **M0** | Groundwork (no visible change) | `MCAVE` (null), chart maths, `mcEnter`/`mcExit`/`mcPlace`, the try/finally wraps, `let plats`, `worldToScreen()` with the old maths kept when off, `_wallId` hook, the hidden `STAGES` row | 150-250 | Nothing else: the game must be identical |
| **M1** | Radial-gravity sandbox | A fixed test disc (R 2000: surface, 1 cave, 4 holes with steps, a walled shaft, 2 core cracks); fighters only (items, assists and Smash Balls off); fighter frames, local speeds, windowed pieces, radial KO (space and core); turning host camera with the core hold and the respawn cut; fighters drawn upright; plain disc art and starfield | 450-650 | Throwaway probe with scripted keys:<br>- walk a full lap on the surface and on the cave floor (r stays within 2 px of the floor);<br>- dash at full speed on the cave floor without leaving it;<br>- jump, short hop, fast fall, wall jump, cling and drop-through at 12/3/6/9 o'clock;<br>- fall through a crack: core KO;<br>- launched outward: space KO.<br>The lead shows you pictures at 12/3/6/9 o'clock. |
| **M2** | The real map and KOs | The pure generator (sizes from N; caves, holes, steps, ledges, hop-tops, cracks, mirror symmetry); safe strips and zone tests in frames; pads on every layer, lifts, start spots, respawn 40 px outward; radial KO everywhere (Marshmallow's save, `fsKoFlight`/`kocLaunch`, vans, items); the flight knob; forced 2 teams | 350-500 | Probe:<br>- prints sizes, layers and pad counts at 2/4/10/20/30;<br>- checks every passage step is 150 px or less;<br>- checks no plank lies over a crack, no hole lies straight above one, and every pad stands on a floor.<br>You see pictures of the 10- and 30-player discs. |
| **M3** | Every move, shot and item on the disc | Frames for shots (and shots against summons), summons, items, finishers, Final Smash, tendrils, file rides, turrets, drop carry; entry stamps; the remembered-points list; particles falling inward; world hit art; beams as arcs; kit-made platforms as arcs; the half-lap shot guard; items on floors outside the strips, growing in over 12 frames | 400-650, plus the tail | **The sweep** (throwaway):<br>- every fighter's every move (tilts, aerials, specials, smashes, grab and throws, finisher, Final Smash) at 12/3/6/9 o'clock, on the surface and on the shell;<br>- compares hits, targets, launches (in the user's own frame) and shot paths with the 12 o'clock run;<br>- flags NaN or anything moving more than 200 px in one frame.<br>Fix the list down to zero, or to cases you accept. |
| **M4** | The full view | Upright drawing at every site (the 82-site checklist); every world-to-screen helper turned; culling; disc art and decoration; core art; space backdrop with Earth; strip tint; flags without words; disc minimap; watching view; upright name tags | 350-550 | The lead takes pictures:<br>- at 12/3/6/9 o'clock and in a cave;<br>- a Final Smash close-up;<br>- offscreen arrows and the minimap.<br>You look. |
| **M5** | CPUs | Pit sense, core recovery, passage table, leaving the strip, the focus cap, cached `platRects` | 250-400 | Probe: CPU-only 5v5 and 10v10, 3 minutes each:<br>- no CPU stuck for 5 s or more;<br>- KO causes counted (space, core, damage cap);<br>- core KOs with no hit in the 3 s before are under 15% of KOs (The Moon had 9 of 30);<br>- matches finish.<br>This is evidence only, never tuning for bots. You watch and play a match. |
| **M6** | Online | `moon` geometry in `worldGeo`/`applySnapshot`; prediction in the chart; guest camera; guest particles; beam rows; world hit art; lobby entry once unlocked | 120-220 | In-memory host and guest pair (never the relay):<br>- the guest's rebuilt `MCAVE` equals the host's;<br>- prediction error at 12/3/6/9 o'clock is no worse than on the Crossing;<br>- no snap over 160 px in normal play.<br>You play online with a friend. |
| **M7** | 15 v 15 and speed | 30 on Moon Caves; forced 15v15; lobby (8 humans + 22 CPUs); shared-eyes think pass; box pool; compact HUD, dirty checks, standings on change | 200-350 | Speed probe at 30 CPUs against the target (≤ 8 ms average, ≤ 14 ms p95). The lead times `draw()` in the pane. You play 15 v 15. |
| **M8** | Release and tuning | Unlock with The Moon (secret `one`), its unlock notice, stage card art, World Cup exclusion (owner question 8); then blast-ring height, core depth, size factor and the flight knob, set from **your** play | 60-150 | You play. |
| | **Total** | | **about 2,300-3,700** | |

**Release point.** The earliest sensible release is after M6 (2-20 players, offline and online). M8 can move ahead of M7 if you want it sooner. 15 v 15 then follows.

### 10. Checks

These follow the no-tests rule of 2026-10-21: nothing is committed as a test, and there is no suite and no reviewer agents.

1. **Boot:** the game starts and a short CPU match plays without errors.
2. **Same-game replay** (throwaway, in the scratchpad, deleted after):
   - `Math.random` is stubbed with a seeded generator;
   - it runs FFA, Teams on the Crossing, CTF and a World Cup fixture for 1,800 steps, hashing every fighter, shot and summon each step;
   - it runs before and after the milestone, and the hashes must be identical;
   - one node process at BelowNormal, with explicit timeouts.
3. **The milestone's own probe** (table above), with the same limits.
4. **Your look:** pictures via the lead's built-in browser pane (agents never launch Edge or any browser), or your own play where the table says so.

### 11. Risks (Moon Caves itself; other maps are covered by section 8)

| # | Risk | Likelihood | Damage | Mitigation |
|---|---|---|---|---|
| 1 | **The swap misses something:** a list or a remembered point it was never told about, or a world write without `mcPlace`. Objects jump or drift. | High (certain to exist at first) | Medium, Moon Caves only | Entry stamps; the remembered-points list; the M3 sweep with its NaN and jump detector; fixes one site at a time. Expect a tail after M3. |
| 2 | **CPUs in the caves:** bouncing between holes, or walking into the core | Medium | Medium | Cracks only where no plank or hole leads straight in; pit sense; core recovery; passage table; the M5 probe counts low-damage core KOs |
| 3 | **Too few KOs:** no sides, so only space and the core | Medium-high | High for fun: stalled 15v15 | The flight knob (on); `R_blast`, core depth and crack count set from your play; the damage-cap KO (60055) still exists. Your note that only one fighter has scored a KO so far points the same way. |
| 4 | **Speed at 30** | Medium | Medium: slow motion on slower PCs | Shared eyes, windowed collision, HUD dirty checks, then the levers in section 7; drawing timed early (M4) |
| 5 | **The turning screen:** spin near the core or at respawn, motion sickness | Low-medium | Medium for some players | Angle hold, respawn cut, eased turn; a slower turn if you want it (owner question 6) |
| 6 | **Chart inexactness** near the innermost floor | Low | Low | Innermost floor kept at r 800 or more; a few px at worst |
| 7 | **Upright drawing misses** | Medium | Low (looks only; play unaffected) | The 82-site checklist; pictures at 4 angles |
| 8 | **Existing low-gravity gaps:** raw-`GRAV` copies (31624, 40728, 45376, CTF nav and others) ignore low gravity on The Moon today | Already there | Low | Not made worse; fix for both maps when convenient |

### 12. Builder rules (for every milestone job)

- Fetch origin and read `docs/LEDGER.md` first. The owner also works in cloud sessions.
- `index.html` is CRLF: edit only through a Python load/save that keeps CRLF, assert every replacement's match count, and never `sed -i`. Verify that the CRLF count equals the line count.
- Work in a worktree under `smash-island/.worktrees`. No `node_modules` links, never `npx`. Probes: at most 1 node process, BelowNormal, explicit timeouts.
- Never touch, connect to or redeploy the live relay. Never launch Edge or any browser.
- Never write Steve Cobs's prize fighters' names. Computer game only (no touch, no same-computer 2-player); multiplayer means online.
- No telegraphs or warning lines, no words drawn in a match, and spawned things grow in over 12 frames.
- Show the owner and ask before pushing. The 2026-10-28 "push when needed" is a standing OK for finished, checked work.
