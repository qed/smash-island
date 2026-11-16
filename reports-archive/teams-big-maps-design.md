# Big Teams maps per stage: owner's design (2026-11-10)

Issue (owner): in Teams, every stage uses the same generic big map (the cross-shaped "Yoyle Crossing" in setupWorld); only Moon Caves has its own. Each stage should get its own enlarged Teams version.

## Scope and order
- Every stage eventually gets its own big Teams map; the generic cross is retired over time.
- Pilot: Dream Island. Then the newest stages (this month's new stage shapes), then older ones.

## Dream Island (Teams): the islands map
- One team island per team:
  - 2 teams: 3 islands = 2 team islands + 1 neutral island between them.
  - 3 teams: a triangle of team islands.
  - 4 teams: a square, each team island a corner.
- Some variance in island heights is allowed (owner: "some variance could be made"); keep it fair (mirror or swap sides).
- Small islands in the center: they DRIFT (slow moves up/down or side to side) and HOLD ITEMS (items and heal spots spawn mostly there).
- Bridges join the islands; bridges CAN BREAK (hits/heavy landings knock planks out; they rebuild after a few seconds).
- FALL DAMAGE (owner pick "hard landings hurt", MEDIUM): landing after a long drop deals damage scaled by height, no damage under about 1.5 screen-heights, cap 15%. Show a tell (dust burst + number). Falling into the sea still loses a stock as normal.

## Open points to settle at build time
- Exact island sizes and bridge lengths per team count, respawn points (own team island), CPU routing over bridges and broken gaps (CPUs must never walk into a gap), online sync of plank state and drift (deterministic, no Math.random in setupWorld).
- Feature-freeze rule: a new big feature needs the owner's go word.

## 2026-11-10 follow-up (owner: "yes, make the triangle and square")
The first build (g-dreamisle, merged) chains 3 and 4 teams left to right with no closing bridge, and the 4-team inner teams sit between the others. Fix: 3 teams = a real triangle (two low corners + one high top, bridges on all three sides); 4 teams = a real square (top-left, top-right, bottom-left, bottom-right, bridges on all four sides), every team the same distance from the center islands, so no team sits between two others. Fall-damage threshold stays 0.9 screens (agent's change; owner not yet asked).

## 2026-11-10 owner, second follow-up: "Dream Island is too small"
- SIZE: "it is TINY compared to the current team map". The islands map must be at least as big as the generic Teams map for the same match (setupWorld's teams arena: WW = W*min(3.6, 2.9+count*0.11)*MS.w*1.5*teamsArenaFit, WH = H*2.5*MS.h*1.5*teamsArenaFit) and must honour MAP SIZE (the first build ignored it).
- EACH ISLAND has: (1) an ABOVEGROUND section (the grass top, with its own platforms); (2) LEDGES HANGING UNDER the island's rock over the sea (stand, fight, climb back after a knock-off); (3) a SMALL UNDERGROUND section (a cave inside the island).
- CAVE ENTRIES (owner picked both): a drop hole in the grass on top, an opening in the cave's bottom onto the underside ledges, AND side openings left and right at the underside ledges' height.
- Still: triangle (3 teams) and square (4 teams) with closing bridges; 2 teams = 3 islands; drifting item islands in the center; breakable bridges; fall damage cap 15%.
- 2026-11-10 owner: "the platforms in the middle should have parkour leading to them from below, and a drop from above." The center (drifting item) islands are reached by a PARKOUR route of small stepping platforms rising from below (from the underside-ledge level), and by a DROP from above (a higher perch or route you fall from onto them). CPUs must be able to use both routes; the parkour jumps must be makeable with every fighter's jump (check the weakest jumpers).

## 2026-11-10 owner, third follow-up (Dream Island v3)
- MORE VERTICAL: islands stacked at several heights.
- "The standard for a map should be like CTF, minus the hiding spots": size, height and route richness on the level of the CTF maps (the interiors framework), but no hiding spots.
- SCAFFOLDING UP, BRIDGES ACROSS (owner's pick): scaffolding towers (climbable frames with platforms) join islands vertically; the breakable plank bridges stay for the sideways links.
- ODD-ANGLE ISLANDS reached only by a CATAPULT launch, holding something worth the trip, e.g. a PRIVATE HEALING AREA for 20 seconds (owner's example). Catapults need a clear tell of where they land; CPUs should use them too.
- Keep everything from v2 (team islands with grass top, cave, hanging ledges; triangle/square; parkour + drop to the centre; drifting item islands; fall damage 1.0 screen, cap 15%).
- Every stage's big Teams map should meet this CTF-like standard (this is the bar for the stages after Dream Island).
- 2026-11-10 OWNER CORRECTION: the CTF standard means "not scale, just how fun the map is!" Keep the v2 size rule (generic Teams size, MAP SIZE honoured); match CTF maps on FUN (varied routes, places to fight, reasons to move), not size.
- 2026-11-10 OWNER: "the map could still be VERY slightly bigger": v2 size plus about 10% on each axis (MAP SIZE still honoured).

## 2026-11-10 OWNER REDESIGN (v4), drawing: dream-island-owner-layout.webp (not to scale). "i dont like it [v3]."
Colour key (owner): GREEN = home bases; ORANGE = independent islands; PURPLE = areas with effects (healing, but not only that); RED = scaffolding and bridges; BLUE = underground, with darkness.
As drawn: four green home bases at the corners (each with a blue dark underground inside). Red double-line BRIDGES join the two top bases and the two bottom bases; red double-line SCAFFOLDING runs vertically joining top-left to bottom-left and top-right to bottom-right. In the MIDDLE: a cluster of orange islands at different heights joined to each other by red scaffolding, with diagonal scaffolds down to the bottom-left and bottom-right bases. OUTSIDE the square: four orange islands, each topped by a purple effect area (top-centre above the top bridge, far left, far right, bottom-centre below the bottom bridge).
DAY/NIGHT CYCLE: brightness goes down and up over the match; the underground is dark.
"There should be 4 different seeds, by size."
Owner answers (2026-11-10):
- SEEDS: all three readings: the layout scales by MAP SIZE and by PLAYER COUNT, and each size has 4 variants picked per match (deterministic, same for host and guests).
- 2-3 TEAMS: same 4-base map; unused bases become neutral ground (no spawns).
- PURPLE EFFECTS: ITEMS (some areas are the ONLY source of crates, or of Win Tokens), HEALING, SHIELD/ARMOUR (less knockback for a while).
- REACHING THE OUTER EFFECT ISLANDS: stepping stones and hard jumps, OR drifting islands, depending on the seed variant (no catapults needed).
- Lead's note: Win Tokens from a map area must be capped per match and must not be farmable (no CPU-only farming, a small per-match cap), and must use the existing token pay path.
- 2026-11-10 OWNER: the night should be like Stapy's "The Search Party" challenge (the LIGHTS OUT twist: DARKK/darkSeeK; dark veil, lit patch around each fighter, enemies fade outside it). "Remember, the map is important too": the layout must be great in daylight on its own. Owner also: the drawing is "just a template ... prove it [imagination]": set pieces (constellation stones, tide, lanterns, balloon crate island, lighthouse, weather per variant, crane, two-plate token chest) sent to the builder as starter ideas.

## 2026-11-10 OWNER: YOYLE NEEDLE big Teams map, 4 teams (drawing: yoyle-needle-teams-owner.webp)
Owner: "oversimplified and DEFINITELY (by a factor of 2+) not to scale yoyle needle for 4 teams." Key: BLUE = WALLS; GREEN = MOVING PLATFORMS.
As drawn: a PLUS/CROSS-shaped space walled in blue: a vertical arm up top, a wide horizontal arm across the middle (left arm runs off the left edge; right arm closed by a wall), a vertical arm below. Green moving platforms: a long one in the middle, staggered pairs in each arm leading to the centre. The floor line of the middle arm has gaps at the lower left and lower right. Real size at least 2x the drawing's proportions.
Status: queued after Dream Island v4; same CTF-fun bar, and the owner expects imagination on top of the template.
- 2026-11-10 OWNER APPROVED ALL TEN lead ideas for Yoyle Needle, and: "this is way oversimplified, so you can make the map more complex." The ten: (1) yoyleberry bushes, one per arm, ~8 s of Yoyle metal: much less knockback, slower, falls like a rock, slow regrow; (2) the Needle's Eye: the top arm ends in the needle's eye window, a thread zipline from it down to the left balcony (can be knocked off); (3) team levers: each arm's moving platforms run on visible rails, a lever reverses/speeds them (sabotage or fix); (4) the lower needle: the floor gaps drop into a dark machine room under the middle, a turning gear and a crawlspace shortcut between left and right arms; (5) a cage elevator in the central shaft between bottom and top arms, a few fighters at a time; (6) air vents puffing on a rhythm (dust tell) lifting you up the vertical arms; (7) wall pipes to grab and wall-jump, so walls are routes; (8) magnet stripes that pull metal fighters (combo with 1); (9) a stitching thread that snaps taut across the middle arm on a tell (jump or duck); (10) the left arm opens onto a windy outside balcony near the blast line. Bases: one team per arm (2-3 teams: unused arms neutral). Night/day + LIGHTS OUT like Dream Island if it fits. Build after Dream Island v4.
- 2026-11-10 OWNER CORRECTION: the ten Yoyle Needle ideas are NOT all in one map: spread them across the SEED VARIANTS (4 variants per size, like Dream Island), each variant a different mix, so every seed feels different. The cross backbone (one team per arm) is shared.
- 2026-11-10 OWNER: "it doesnt have to be a cross": the cross was only a simple 4-team extension of the small Yoyle Needle map that keeps its CORE IDEA, MOVING PLATFORMS inside the needle. The builder may choose any shape that keeps that core idea, fits 4 teams fairly (2-3 teams: unused bases neutral) and holds the ten ideas across the seed variants.
- 2026-11-10 OWNER on v4: "the islands should be more like groups of blocks with platforms on the side. this should have been elaborated." v5: every island is a hand-shaped CLUSTER OF BLOCKS (varied sizes, tiers, overhangs, ragged hanging underside), with SIDE PLATFORMS (shelves) on the block faces at several heights, the underground carved into the blocks, loose stepping blocks, grass/trees/roots/vines/a waterfall. Preview first, then the full proof.
- 2026-11-10 OWNER: "make it cooler! I dont want a generic platform map. rn, the map just looks like a bunch of showy platforms." v5 direction sent: a PLACE with landmarks: the resort/mansion in the middle (lobby, balconies, rooftop pool, knock-down chandelier), four DISTINCT bases (beach + pier, cliff + waterfall, garden + topiary, harbor + a scheduled boat), themed outer islands (hot spring heal, stone shrine shield, shipwreck crates, treasure-island chest), a living sea and sky (whale platform with bubble tell, a blimp high route, gulls, parallax background), distinct silhouettes.
- 2026-11-10 OWNER: NOT symmetrical ("if its symmetrical it could be annoying and weird"). High bases have the high ground, so the LOW (ground) bases must be better in other ways to compensate and HARDER TO CAMP. Balance by role, measured by win share / time alive per base position.
- 2026-11-10 OWNER: the same bar applies to YOYLE NEEDLE ("apply the fire you and hire chatgpt to the yoyle needle thing"): it must be a PLACE with identity, not a generic platform map: the inside of the giant needle as a real structure (a machine of rails, gears, lifts, the eye window, outside balcony), elaborated shapes (not plain slabs), distinct asymmetric bases balanced by role (high vs low), the 10 ideas spread across variants, landmarks you recognise at a glance. Preview pictures first for approval, then the full proofs. Resume after Dream Island v5 is approved.

- 2026-11-11 OWNER: Yoyle Needle preview look APPROVED ("apart from that, its good"). Change: the map must be BIGGER for 8 players, and the scaling for more players and for bigger map sizes must be NOTICEABLE. Lead reading: add rooms/movers per size and player count instead of stretching the same 99-platform layout (preview showed Compact/Normal/Huge all with 99 plats, 14 movers; 8p Normal only 4403x2400; height floored at 2400).
- 2026-11-11 OWNER on the v2 size grid: "the bigger maps for the yoyle needle are... ehhhh. make it have walls, to make it more mazelike. theyre just drawings, those 'ladders'". Rule: real solid walls/partitions, maze of rooms and corridors with loops and several routes; nothing drawn that looks usable but isn't (ladders must be real climbable soft-platform columns or go).
- 2026-11-11 OWNER on Dream Island: the slanted (diagonal) ladder-scaffolds left from the v4 template must go.
- 2026-11-11 OWNER on Dream Island: "dream island is overcluttered. spread stuff out over a bigger map."
- 2026-11-11 OWNER on Dream Island: "too many non-necessary moving things, which are too close to platforms to give an edge." Rule: a mover only where it crosses a real gap or gives a real advantage; none hugging static platforms.
- 2026-11-11 OWNER CORRECTION: "no, becasue normal platforms also give access." Access alone is not a reason for a mover; a mover must give an edge a static platform can't (timing, a moving vantage point, a route that opens and closes).
- 2026-11-11 OWNER CORRECTION #2: "no, it doesnt leave, it moves. for the whale, the effect island should surface on it." Movers never vanish; they move. The whale carries an effect island on its back.
- 2026-11-11 OWNER: "why is there so much stuff in small space? make gaps that have to be crossed by movers in the new map." Rule: less stuff per screen; deliberate wide gaps crossed ONLY by movers (that is where movers belong).
- 2026-11-11 OWNER on the Yoyle maze version (asked whether it gets Dream Island's treatment): "partially": VARIED ROOMS ("varied rooms, not uniquely bigger": a mix of room sizes, not all made bigger), LESS CLUTTER, MOVER-ONLY GAPS. Not picked: cutting movers (movers stay the needle's core). Also to do: spawns (each team its own area), the ~8 low-headroom spots, and a hide switch (ynWanted is not gated on g-yoyle2) before any merge.
- 2026-11-11 OWNER on Dream Island: "the whale should only offer the boost when it SURFACES, not a permanenet feature" -> the whale surfaces on a schedule with a tell; the heal/shield works only while surfaced.
