# Moon Caves v4: the owner's decisions (2026-11-02, question boxes)

The spec is `v4-spec.md` (written before these answers). Where this file and the spec differ, THIS FILE WINS.
The owner's words are in quotes. The lead's reading of each is marked "Reading".

| # | Question | Owner's answer | Reading |
|---|---|---|---|
| 1 | Structure style | **Hybrid** (not the recommended "rock moon with rooms") | The question's wording was: "Rooms in the upper districts, but keep rings for the tunnels and the furnace." See answers 5 and 9, which then add natural rooms in the lower caves. The planner and the room library are kept; the ring stack is kept only where the furnace needs it (answers 5 and 9 turn the other lower caves into small natural rooms) (the furnace keeps its hot floor, its lifts and its cracks as in v3). V0's plan renders are the point where the owner corrects this reading. |
| 2 | Which chambers | **All 20** | Build all 20 library rooms; the five least different (Racetrack, Grand Stair, Geode, Barricade, Warren) are the first to cut if one proves weak. |
| 3 | How wild | **Medium** | A tall hall gets a one-way bridge so the district above stays walkable. Some districts are SPLIT (the teams cannot meet in them but can on the surface and in a LAP cave). |
| 4 | The three risky rooms | **Keep all three with their guards** | Attic prize refills only when empty; Barricade wall at least 180 px; Crawl only in the quiet districts. |
| 5 | Cast | **"1, and the lower caves should get more 'natural' formations. they should still have rooms, but smaller ones that are more natural."** | Cast drawn by seed (galleries first, furnace last, tunnels over it, the middle shuffled, flooded can appear, never ice next to flooded, never springs next to updrafts). PLUS the owner's addition: the lower caves are NATURAL (rough cave formations) with smaller rooms. |
| 6 | Passages | **Each kind owns its passages** | Springs: no stairs, bounce chains. Updrafts: draughts only. Ice: ramps only. Mines: belt ramps. Stairs only in galleries, columns, surface. |
| 7 | Scenery | **A drawn back wall per kind plus a colour fade when you drop through a floor** | No words drawn. |
| 8 | Different moon every match? | **A fixed set of moons per size** | See answers 9 and 10. |
| 9 | Which caves are "lower" | **"Mixed in every cave"** | Every cave has a mix of built rooms and natural pockets; the natural share GROWS with depth (a few in the first cave, most of the tunnels and the furnace). Natural rooms are smaller and rougher: stalagmites, uneven floors, bumps, winding squeezes, small caverns; still real rooms with links and the same fairness invariants. |
| 10 | How the fixed moons are chosen | **"1, and make it 16 moons. more variation."** (1 = "I shortlist, you veto") | **16 moons per size, not 8.** The lead generates hundreds per size, keeps the 16 with the best plan score that also differ most from each other, and shows the owner pictures for 4, 10 and 15 a side; the owner says yes or swaps any. Other sizes follow the same rule. |
| 11 | When v4 replaces v3 | **Side by side for a while** | A separate stage entry "Moon Caves v4" next to the current Moon Caves (v3 untouched and playable). Same unlock as Moon Caves. No flip until the owner says so. |
| 12 | Furnace doors at 8+ a side | not asked | Hybrid keeps the furnace as in v3: keep the six cracks (the spec's option a). |

## What these answers change in the spec

1. A NATURAL ROOM FAMILY is needed (smaller, rougher rooms for the deeper caves) and the planner must mix built and natural rooms in every cave with a natural share that grows with depth. The anti-sameness rules apply to natural rooms too (no "random bumpy floor": each natural kind has its own structure and verb).
2. The fixed set means the planner is FROZEN once the 16 seeds per size are chosen: store the chosen seeds in a small table (the planner is pure and integer-only, so a seed rebuilds the same moon) with a planner version tag; any later planner change is a new version.
3. The 16 moons of one size must differ from EACH OTHER (a set-level diversity score), not only each from within itself.
4. A new stage entry "Moon Caves v4" in the stage list, in the online lobby and in the geometry message (stage id plus moon number, not the pieces), unlocked like Moon Caves.
5. The switch `MC_V4` still hides it during the build; the stage entry appears when the owner says so.
