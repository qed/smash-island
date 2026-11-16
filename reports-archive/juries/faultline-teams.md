# Jury: The Faultline (Shifting Isles Teams), branch g-si-teams 1c6ef616

## Verdict: MERGE (hidden). Do NOT unhide until the fixes below.

The code is safe to land hidden: nothing leaks while the switch is off. As a map it is not ready to show players, for the reasons below.

Method: scratch copy of the worktree, one node process at a time at BelowNormal, offline fake sockets only (the live relay was never touched). No branch edits and no check changes. I only ran the builder's harness on seeds and configs it had not used, plus two probes of my own.

## Evidence

### Hidden / leaks: PASS
- The no-op hash run (roster, 3 FFAs, 10 matches, Teams on goiky, dreamisle, forest, needle, shift; same noop.mjs) on ii-dlc and on the branch gave a byte-identical output file.
- Weakness: teams-goiky, dreamisle, needle and shift all hash the same (1ec1b5b088e4). The Teams layout does not depend on the stage, so that is expected, but it means the check proves "Teams on shift is the ordinary map", not more. It does not cover draw().
- Code read of the diff:
  - Every hook is gated on SI or SI_VIS (null or false when hidden).
  - The quicksand change to the shared `glue` zone case only acts when `z.esc` is set, and only the Faultline sets it.
  - worldGeo adds `si`, `sd` and `pl`, which are undefined elsewhere and dropped by JSON.
  - applySnapshot sets SI_VIS from `worldPlats.some(p=>p.si)`.
- Online: a guest whose host has the preview switch on draws and builds the map from the snapshot. This worked in my run.

### Online (fake sockets): PASS
- Huge 2v2v2v2, variant 1, 4500 frames: 438 of 438 static samples equal, movers within 23 px, no errors.
- Guest riding a plate through the first shift (own probe, 2v2, V0, plate P1, guest's own fighter put on the plate at frame 3290):
  - Host and guest positions of that fighter differed by at most 44 px (mean 9 px) across 3290-3900.
  - The host kept it on the plate through the tell and slide (y 1045 to 1031 to 730 with the plate, stocks stayed 3).
- Caveat: after the slide the fighter wandered off (it is not under real guest input), so I cannot say anything about the guest's own prediction when steering on a plate.

### Crush and strand: no unfair trap found
- Probe: every plate part at 61 dock progress values, fighters standing on three points of each part, and head room above each solid part. 549 probes, 0 overlaps with any other solid and 0 head-room failures (4v4 V0). Only V0 and 3 plate parts were probed; the other variants and the lifts and shuttles were not.
- Lifts and shuttles are soft one-way platforms, so they cannot crush. Plates set a fighter on top if it is inside a rising solid (nobody is crushed).
- Weakness: that "set on top" has no ceiling check in siPlace (`f.y = q.y - r`). My probe found none that matter in V0, but it is untested for V1-V3, Tall and Huge.
- Respawn: bases and spawns sit on static decks, and none of my runs showed a respawn on a moving plate. I did not test a respawn exactly during a slide.
- Catch ledges under the lift columns are camp spots (see jank).

### KOs, re-measured by STOCKS LOST
- cpu.mjs counts `3 - f.stocks` summed over fighters. That is stocks lost, NOT f.deaths, so the builder's KO numbers do rest on the right counter.
- My re-measure, 4v4 Normal, 3 CPU minutes, seeds 14, 15, 16 (builder used 7-13):

| Map | Seed 14 | Seed 15 | Seed 16 | Mean |
|---|---|---|---|---|
| Ordinary Teams map | 6 | 7 | 7 | 6.7 |
| Faultline V0 | 6 | 8 | 6 | 6.7 |
| Faultline V3 | 9 | 11 | 3 | 7.7 |

- Faultline KOs are at 100% of ordinary here (the builder said 85%). Variance is high (V3 ranges 3 to 11). Not a failure.
- Errors: 0 in all 9 runs.

### CPU stuck
- A new flag, outside the builder's seeds: seed 14 V0, Apple at x 369, y 1773 (far west, deep), flagged at frame 10089 with `ferryWait` true and foeD 1259. Possibly the Wreck/dock/ferry pit area, which the builder said it fixed with a lift; still a place a CPU can park for a long time.
- planFail counts on the Faultline are 0-7 per match. The ordinary map has no nav, so there is nothing to compare against.
- The builder's own open flags (4v4 standoffs, Fries on the Arch stair) were not reproduced or fixed by me.

### Not run or not verified
- The quicksand feel, the shift tell (tone, shake, arrows) and the HUD chip in a real browser (jsdom only).
- A respawn during a slide.
- Any variant other than V0 for the crush sweep.

## Judged as real players would (renders: phaseD V0 form A and B)

### New kid
- Two big brick fortresses with stair towers and a clock-ring Hourglass in the middle. It does read as a place, and the stairs are real solid steps, not drawn ladders.
- The shift is a lot to learn. Plates, shuttles, lifts, a ferry and quicksand are all in play, and the tell is a tone, a shake and dock outlines. That is more than a kid will parse.

### Competitive
- The quicksand throws you out after 45 frames (vy -15, vx 7 toward the nearer edge, no glue for 40). This applies to a fighter in hitstun too, so it can break a combo or save a victim; that is arbitrary.
- The catch ledges under the lift columns are camp spots: someone riding the cage up is exposed to a fighter standing at the foot.
- The cycle ratio is 1.52 on V3 at 2v2v2v2 against a target of 1.5. That is a miss, and the builder flagged it honestly.

### 8-player party host
- Normal 8p is 7500x3400 design (5625x2550 world). That is bigger than the ordinary map, which meets "bigger for 8 players".
- It matches the owner's rule only partly. The bases are large and the route graph holds, but 4v4 shows standoffs.

### Owner (hates fake ladders and clutter)
- No ladders found. Stairs are solid blocks.
- Far hazy islands in the sky are dim and flat, but they look like floating platforms that are not usable. This is "drawn but not usable" in spirit and should be dimmer or clearly sky decoration.
- The top third of the map is decoration and the bottom has a lot of empty sand. Both read as wasted space.
- The Undercroft in the middle is a big dark brown block that does not read as a place.

## Required fixes before unhiding (FIX FIRST list)
1. Quicksand: do not throw a fighter that is in hitstun, and do not make it a free combo breaker. Exempt fighters with `hitstun > 0` and make the escape readable (a drawn tell before the throw).
2. Cut the empty sand under the map, and either make the far hazy islands visibly background (dimmer, smaller, no platform-like shapes) or remove them. The top-third decoration should not look usable.
3. Lift catch ledges and the lift-foot camp spot: add a guard, for example a lip that makes the ledge a drop-only pit exit, or accept and document it.
4. Reproduce and fix the Apple far-west stuck (seed 14 V0, x 369 y 1773) and the Fries Arch-stair flag. If not fixed, state the known stuck spots in the ledger.
5. V3 cycle ratio 1.52: re-measure at several seeds. If it stays over 1.5, nudge by geometry (not by relaxing the check).
6. Run my crush probe over V1-V3, Tall and Huge, and put a ceiling check in siPlace's "set on top".
7. Real-browser look at the tell, the Hourglass and the shift readability (jsdom cannot judge these).

## Honest limits of this review
One CPU-only family of runs (9 matches), jsdom only, no real human input. Scripts are in the scratch copy; the builder's harness (phaseD/scripts) was reused unchanged except for path fixes. No hidden fighter names appear in this file.
