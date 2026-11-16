# Jury: Yoyle Needle Teams map, phases B, C, D (g-yoyle-b c818bc82 vs ii-dlc)

VERDICT: FIX FIRST. Safe to merge while hidden (YN_TEAMS_OPEN false); do not open the map until the fixes below. Not REJECT.

My work: scratch copy only (scratchpad j/), at most 2 node processes, BelowNormal, relay never touched, branch untouched.
I did NOT redo: the 3-minute CPU matrices, the no-op hash comparison, spawn check, syncheck, bootcheck. Those numbers are the builder's. I did NOT play the map as a human.

## What I ran and measured
1. Builder's hidden.mjs: YN null, ordinary Teams map, no errors. OK.
2. Leak check with the dev switch forced ON (my ffa.mjs): FFA on Yoyle Needle, Teams on Goiky Field, Teams on Dream Island: YN null, YN_VIS false, 0 yn platforms, 0 errors. Only Teams on the needle builds it. Shared-code touches are tiny: diEdge (max(112, K.rise): Dream unchanged), worldGeo adds mvz (undefined elsewhere), applySnapshot and netInterpolate call ynGuestMovers only if YN_VIS. ynWanted excludes tutorial, race, one-fight, Cobs fight, test mode, custom level. I did not run the tutorial or an online lobby for other stages.
3. Fake-socket pair, builder's sync3 and sync4 rerun: v0 lever diff 3 frames, bush 0, aligned movers 0 px; v1 raw mover error 79 px, aligned 0, remote rider slip 7 px. Matches the ledger.
4. NEW test of mine (own.mjs): the guest's OWN fighter standing on the first west express shuttle, 8p v0, 860 frames, 30 ms +-10 latency. Never off the ground, never off the shuttle vertically: no slip-through or fall. But the guest sees its own fighter jerk against the shuttle: worst single-frame slip 38 px, 3 frames over 25 px, guest-vs-host x up to 152 px. A stutter on belts. The ledger measured only a REMOTE rider (7 px); the own-fighter case is worse.
5. Still riders on every express shuttle, 500 frames, v0 and v1 (belt.mjs): none lost a stock, none left the ground. Riders pass to the next shuttle in the overlap, so standing still never kills or strands you; it drags you back and forth about 1000 px every 2 to 3 s (period 112 to 171 frames).
6. Reachability (builder's reach.mjs rerun, 8p 2v2v2v2): unreachable nodes v0 21, v1 23, v2 19, v3 32. v1 matches the builder's 23. v3 (32) is not in the ledger.

## (1) Drawn but not usable
- EAST ROOF (v1: x 5300, 3265 px wide; v0 2590 wide; in v2/v3 it is at the west edge, 2800 to 2965 wide). It is the flat top of the hull under open sky, about 40 percent of the hull top. I tested it: walking from the grate beside it (32 px higher), a fighter is stopped at x 5276 by a wall. Not reachable on foot. A fighter blasted onto it has no way back in the graph (35 of the 64 old route-plan failures were one CPU there). I did not test whether a double jump clears the wall. Judgement: a player will read it as a place to stand and the owner will call it fake. The builder calls it harmless; I disagree for the roof.
- LOFT SHELF (loft x5100 y495 w200; shelf x5130 y390 w165; the spool block): small, inside the Eye Loft, 148 px above the grate, not graph-reachable. Reads as a shelf with props. Lower priority; a human double jump might reach it (untested).
- Others over 200 px wide unreachable: slab x225 y870 (west wing, 104 px aside from the escape), block x1695 y1823 (135 px above a step), yarn x6176 y2228 (180 px above a shuttle). Probably double-jump reachable; minor. The "mass" blocks are hull feet, scenery.

## (2) Ladder-looking art
- Shaft scaffold: a deck every 110 px across the whole shaft width, about 25 rows in the 8p render. They ARE real jump-through platforms, so not fake, but at map scale the shaft is a striped grid that reads as a giant ladder or grille, in the centre of the map. It is the owner's ladder complaint in a new form, and it turns the free-fall shaft into a staircase (the ledger concedes it).
- West fire escape: a column of short identical rungs down the outside of the west hull wall (far left of the render). Real soft ledges, but exactly ladder-shaped.
- Nothing drawn-only that looks like a ladder was found; the old floating pipes are dimmed and the climbable ones are visibly pipes.

## (3) Unfair spots and traps
- Belts: no lethal carry found for still riders. For people: peak about 20 px per frame against 5.5 walking, so a rider who dithers is dragged the whole stroke back. I tested still riders only, not a person walking off at speed.
- Fairness: the builder's own numbers miss 1.5x in 4v4 v0 (1.53x, north vs south). The 4p and 6p cases, the sizes most players use, have no CPU matrix, no fairness numbers and no exits run.
- Lever lock-out: levers only reverse and speed up movers within 1300 px for 10 s with a 25 s rest; express belts are never held. I found no lock-out from reading code and the ledger. No abuse test played.
- Respawn: builder's spawn check, 40 configs, 0 issues; I did not rerun.
- KOs: 0 to 1 in 90 s for a scripted player on this map against 3 to 4 on Goiky. The old 97 percent KO-share did not reproduce, but the more likely complaint now is stalling, not domination. Tiny sample, scripted player.

## (4) Leaks while hidden
None found (items 1 and 2). Residual by design: a browser with localStorage bfsi:yndev = 1 gets the map, and as host would send it to guests.

## (5) Jank
- Belt hand-over: the CPU waits up to about 1 s for the right stroke. A human has no cue for when to step off or where the next shuttle is; shuttles pass level with no marker. Judged from the render only; needs a playtest.
- EXPRESS board: readable as a yellow board with chevrons at map scale. Many other hazard-striped props on the map share the colour, so the belts do not stand out from the clutter. Not seen at game zoom.
- Guest on a belt: item 4.
- KO banner names and sound: not checked by me. No claim either way.

## (6) Online
Static geometry equal, lever and bush state agree within 3 to 4 frames, movers aligned 0 px, remote rider 7 px. The raw 59 to 79 px is snapshot age, not a bug. Own-fighter belt ride: no fall, jerky (item 4). The guest still predicts none of vents, wind, magnets, berries or levers on its own fighter.

## Personas
- New kid: walls and rooms read as a maze, but the central grid and the unreachable roof confuse, and belts can drag them backwards.
- Competitive: scarce KOs, 1.53x worst fairness at 4v4 v0; belts are fine as a lane.
- 8-player party host: best case. Clearly bigger at 8p, distinct bases, 5 to 9 KOs per 3 minutes in the builder's runs.
- Owner: will object to (a) the shaft scaffold grid, (b) the rung column on the west wall, (c) a flat roof that looks walkable and is not, (d) clutter: 340 to 590 platforms and 82 to 167 movers at 8p, hazard stripes everywhere. Mover-only gaps exist (chasms, shaft drain ferry), but the belts add movers across the whole corridor.

## Exact fixes before opening
1. Roof (v0 east, v1 east, v2/v3 west edge) and the loft shelf: make them reachable (door or step from the loft's outer ledge, as the west side has) or take them out of the platform list and paint them as backdrop. Re-run reach.mjs; target no unreachable node over 200 px wide.
2. Replace the uniform 110 px scaffold with irregular decks (varied spacing, some half-width, a few solid beams). Re-run the fairness harness unchanged afterwards.
3. Redo the west fire escape so it is not a column of identical rungs.
4. Smooth the guest's own fighter on a belt (38 px per-frame slips); start at ynGuestMovers and the guest's carry code. I did not find the exact fix.
5. Run the missing 4p and 6p matrices (CPU 3-minute, exits, fairness, spawn) and report whatever comes out.
6. Human playtest of the belts, and a visible cue for which shuttle will carry you the right way.
7. Explain or fix v3's 32 unreachable nodes.

## Merge as it is?
Yes only while YN_TEAMS_OPEN stays false: no leak, FFA and other Teams stages untouched in my runs. Opening is not safe until fixes 1, 2 and 5 at least.

Scripts and outputs: scratchpad j/s/ (belt.mjs, own.mjs, unr.mjs, roof.mjs, ffa.mjs) and j/o_sync*.txt.
