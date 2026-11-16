# Jury: Windy Heights Teams, "The Long Span" (branch g-wh-teams, ddc64a44)

VERDICT: FIX FIRST. The hidden code is inert (no leak found), so it is safe to carry hidden; but it is not ready to open, and the items below should be fixed before the owner previews it. No hidden fighter names used.

## What I ran (offline, one node at a time, BelowNormal, with timeouts; scratch scripts only; branch untouched; no relay)
- hidden.mjs (WH_TEAMS_OPEN false, no dev switch): 2v2, 2v2v2v2, 4v4 on Windy Heights: WND null, vis false, no wn plats, ordinary 3591/4003 px map, errors none. PASS.
- Code read of every hook in the diff against ii-dlc (25 hunks): setupWorld, spawnItem, step x3, landing, brain, stbWindPush, darkOn/darkSeeK/darkDraw, draw x3, worldGeo, serializeState, applySnapshot, returnEventLoan. Each is guarded by WND / WND_VIS / whWanted(); whWanted needs (OPEN or dev) AND Teams AND stage 'wind'. FFA on Windy Heights never enters it. Same pattern as Yoyle Needle. No leak found while hidden.
- sync.mjs 4v4 variant 3 (fake sockets, 1500 frames): host and guest both 122 plats, variant equal, static geometry equal on 138 of 138 samples, movers 18 px, kites 80 px host-vs-guest (0 against own clock), wind equal, errors none. PASS (as claimed).
- Spawn scan, 2v2v2v2 and 4v4, normal and huge, V0 and V3: every spawn of every base is inside a lee box for both wind directions, none exposed. So no respawn-into-a-gust trap. Base widths: Beacon 280, Meadow 260, Nest 220 (two groups 500 px apart), Mill only 140 with 4 spawns 40 px apart.
- cpu.mjs 4v4 V0 seed 8 (10800 frames): 11 KOs, 0 errors, and the stuck case reproduced (Firey at 956,956, frame about 6000). I traced it (finding 4).
- Looked at the phase C renders (V0, V1).

## Findings
1. Unfair traps
 - Respawn into a gust: none (spawn scan).
 - LOOSE PLANK ON A REQUIRED ROUTE: yes. Two 160 px loose planks sit in the two bridge decks beside the first broken span (V1, V2, V3 at 6+ spans), on the main bridge between the high end and the gondola. A hard landing cracks one and it is a 160 px hole for 5 s; the CPU route graph's own static-gap limit is 150, so it is not crossable on foot and you drop to the Old Bridge. A foe can drop on it while you cross. This is exactly the single fall that costs 600 to 1200 frames. Fix: move the loose planks off the main deck (Old Bridge or side decks), or make the hole 120 px.
 - Vane knocking you off: vanes are the Mill's mover route (46 to 162 ride samples per match). A gust front (80 px/frame, push 1.7 in the air) on a turning vane is a fall; CPUs hold back, a newcomer has only the lead-in as a tell. Needs a human playtest.
 - Gondola camping: a 260 px car over a 480 px gap crossed only by it can be camped at a landing edge. Not measured. It was ridden 0 to 172 samples per match; in 2v2v2v2 V2 seed 7 never, so teams mostly skip it.
2. Leaks while hidden: none found. Small notes: worldGeo now adds wn/wd/kite/bx/by to every stage's geometry rows (undefined elsewhere, dropped by JSON, but a changed code path); WND_VIS is not reset when a guest leaves (it resets at the next setupWorld or geometry, same as YN_VIS); two trailing comments in applySnapshot and draw are glued to the wrong line (cosmetic). A dev-flagged guest joining a hidden host was not tested end to end.
3. Jank
 - Kites rise 260 px in about 12 frames (about 21 px/frame) and the guest is 3 frames behind: 63 to 80 px error on a surface a player stands on. No test put a rider on a kite online; CPUs rode kites 0 to 18 samples. Rider rubber-banding is likely.
 - The AIRSHIP and TOKEN CHEST (V3 and every Tall/Huge): shipRides 0 and chest opens 0 in every CPU match I read (8 in the files plus my rerun). Only a forced test proves it works. Two teammates stand on two plates 240 px apart for 1.5 s; nobody will find that unprompted. Untested in real play.
 - Floating Mill floor: confirmed in the renders; the tower floor hangs over the meadow on thin end pillars with nothing under it (builder already knows; the arch is still undrawn).
 - Clutter: the rooms, walls and solid stepped stone read well, and there are no fake ladders. But there are small orphan planks east of the Mill and past the Meadow's east end, a big stepped stone block (Anchor Rock) that is only a slope, a plain white perch bar in the sky, and V1's four kites in a row. Route check says nothing is unreachable, yet a few pieces read as clutter.
 - Wind readability: lead-in, streaks and windsocks exist, but the lee boxes are invisible, so a new player cannot tell which wall is shelter.
 - KO banner names: no change in the diff touches banners; I found no bug but did not exercise it.
4. Untraced stuck case (4v4 V0 seed 8), traced: not a duel and not a geometry pocket. Firey (team 0, in its own Beacon) shuffles on the slab's east end at x 944 to 980, on the ground, no plan, for 300+ frames, steering east then west, while a foe (Grassy) is inside the Beacon one floor above (x 650 to 730, y 745 to 865) climbing the stair blocks. It is a CPU dither (fight brain wants a foe on a higher floor, has no plan up through the Beacon). Humans do not suffer it, but a CPU defender will stand at its own fort's door instead of fighting inside.
5. Fairness misses: design or CPU clumsiness? Mixed. Ratios 2.14 / 2.05 / 1.78 / 1.55 (2v2v2v2) and 2.12 / 1.89 (4v4) come from single falls: blown hops, vane rides, the loose plank. A human also suffers the wind drift and the plank (a clean trip is 740 to 940 frames, a fall costs 600 to 1200, so one fall is a 2x swing), though a human steers in the air and waits out a gust, which the CPU only approximates. The structural unfairness is real regardless: the Nest and Meadow routes are the longest (1990 and 1339 frames in V0), the Mill base is 140 px wide, and the map is really two clusters (Beacon plus Nest, Mill plus Meadow) joined by a thin bridge. Win share and time alive per base were never measured (3-minute matches all end 8 of 8 alive).
6. KOs: 61% of the ordinary map at 2v2v2v2 (6.4 vs 10.5), 79% at 4v4; my 4v4 rerun gave 11. Damage dealt about 1300 vs 1500 to 1670. Target missed; the cause is the map being twice as wide.

## Personas
- New kid: lost on a 7900 px map; a gust can drop them off the bridge; no tell for the chest or the lee. Needs the plank and vane cases softened.
- Competitive player: the Beacon is a good fort; gust fronts and loose planks add randomness to bridge fights; the 140 px Mill base is a postage stamp.
- 8-player party host: bigger map for 8 is delivered (7900 vs 4003) but it plays as two clusters and a bridge with fewer KOs; the Airship chest is not discoverable.
- Owner (fake ladders, clutter): no ladders, solid stone steps, rooms and walls, movers never vanish (the loose plank vanishes 5 s, but it is a plank). Will dislike the floating Mill floor, the orphan planks and the slope-only stone block.

## Exact fixes before MERGE
1. Draw the support arch under the Mill tower floor.
2. Move the two loose planks off the required main-bridge decks (or shrink the hole under the static-gap limit); re-run the travel harness for ratios.
3. Online: test a rider on a kite and the gondola with fake sockets; if the rider pops, carry the rider by the guest's own kite clock.
4. Give whBrain a plan for foes inside the Beacon above it; re-run the stuck harness.
5. Cut or give a purpose to the orphan planks and the plain sky bar.
6. Widen the Mill base beyond 140 px, or show human playtest evidence it is fair.
7. Reset WND_VIS when a guest leaves; fix the two misplaced comments.
8. Before opening: a human (or the idle simulated-player) playtest of the Airship chest and kite rides, which no CPU match exercised.

If the owner wants the code carried unchanged while hidden: safe (no leak found). Do not open it until items 1 to 4 are done.
