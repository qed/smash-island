# Final Smash wall audit (2026-11-10 / 11)

Owner report: "on the moon caves bow's final smash's chair goes into a wall but still does damage". Branch `g-fswall` (off `ii-dlc`), worktree `.worktrees/fswall`. NOT pushed, NOT merged.
Scope: every roster Final Smash row (111 of them; the 4 OC rows `oc:*` are not in the roster and were not tested), on a flat test arena with a synthetic wall, Moon Caves v4, Dream Island Teams (block islands), Capture the Flag interiors and the Needle/TLC shaft (stgBuild). Finishers (FINX) were NOT audited: they do not share the Final Smash prop code (see "Not covered").

## The rule (one shared rule, `FS WALLS` block in `index.html`, helper names `fsw*`)

A map with a solid piece in `platRects()` (Moon Caves rock, Dream Island blocks, CTF walls and doors, the shaft walls, any solid bluff) is "walled" (`fswOn`). A map with none (every open stage) is untouched: every new test is behind `fswOn()`.

1. A shot a Final Smash throws (`addProj` tags it `_fs`) stops with a puff at the first solid piece on its way, and is stopped at once if it is made inside rock (projectile step, placed after the landing/bounce rules so a drop that lands on a floor still lands as it always did).
2. A hit a Final Smash deals lands only on a foe it can SEE. Funnels: `hitCircle`, `hitShape`, `fsBurst`, and a bare `applyHit` in a row (fallback in `applyHit`), plus `fsStatus` (poison, burn, slow ... no longer applied through rock). "See" = the prop's own straight line to the foe's middle crosses no solid piece AND the holder could aim at them (holder sees them, or sees the prop's spot, or for a shot the spot it was thrown from).
3. A catch (`fsCatchOk`) takes only a foe the holder sees, so nobody in another cave is held for a scene.
4. The holder is a prop too: a row that carries him (a jet's run, a dash) is stopped at the first rock (`fsRun`). A row with `blinks:true` (Bow's plan version) appears elsewhere on purpose and is exempt.
5. Bow's chairs (the owner's case): the still version (Moon Caves) swaps a chair side that would sit in rock for the nearest clear side (`fsChairAim`; the swaps ride on `fsPd` for a guest's picture); the moving version (every other map) only stands where she sees the foe (`fsChairPlan`).

Exceptions: the row flag `wide` (a screen-wide cinematic that may reach everyone) exists in the code but NO row has it. I did not exempt any Final Smash. Rows with a reach of 500 px or more (Match 700, Teardrop 500, Tennis Ball 650, Snowball 520, Book 600, Ruby 600, Needle 720, Golf Ball 520, Nickel 500, Liy 520, Money 600, Naily 600, Woody 560, Paintbrush 600, Balloony 600, Cake 520, Knife 520, Apple 520, Baseball 700, Paper 600, Microphone 800, Lifering 800, Cammy 560, Cheesy 520, Fan 700, Cherries 600, Tapey 700, Eraser 1100, Spongy 600) are the ones that look screen-wide by design; they now stop at rock like every other row. If you want any of them to keep hitting through terrain, say which and I add `wide:true` to that row.
A foe a Final Smash has CAUGHT (held scene, `fsLock`) is exempt from the per-hit test (it was seen when it was caught); only Bow's chairs are re-tested. Rows marked HELD below hit a held foe whom the independent sampler says had rock between him and the holder at some frame (see the notes).

## Results

| Measurement | before | after |
|---|---|---|
| Flat arena, 40 px solid wall between holder and foe, all 111 FS (damage to the foe) | 109 hit through (Dora, MeTag blocked) | 0 hit through |
| Same arena, clear line (every FS, gate forced on, damage/launch/frames hash) | - | identical to before for all 111 |
| Open-stage FS no-op: 111 FS x 7 geometries = 777 scenarios, 420 frames each, hash of every fighter x/y/vx/vy/%/stocks/hitstun + shot count per frame | - | 777 of 777 identical (638 of them with damage) |
| Roster no-op (fake frame clock, 3 FFAs x 900 frames + 10 `startMatch` matches x 500 frames) | - | identical hashes (13 of 13). NOTE: without a fake clock the same unchanged build differs run to run in the FFAs (wall-clock code), so the first no-op attempt looked like a diff; it was not |
| Moon Caves v4, the owner's case: Bow's chairs round a foe against rock, 14 spots, 88 blows | 29 blows have the chair inside rock (362% damage dealt by them) | 0 blows (same total damage, 1100%: the chair comes in from a clear side) |
| Shaft (Needle/TLC), Bow's chairs, 14 spots | 9 of 112 blows with rock between Bow and the foe | 0 of 96 |
| CTF, Bow's chairs, 14 spots | 31 of 112 blows with rock between Bow and the foe | 8 of 72 in the 14-spot batch (spot 7 only, and that spot gives 0 of 8 when run alone; spots 3 and 4 are 8 of 8 in an isolated run with the old AND the new build and are NOT fixed; cause not established: both fighters end at the same spot, probably inside one solid CTF piece such as a plug, where the rule ignores the piece the origin is in) |
| Moon Caves v4, all 111 FS, 3 wall pairs + 2 clear pairs, holder pinned until the catch (pairs where the foe's % rose AND the independent sampler saw rock between holder and foe at the hit) | 17 pairs (9 FS) | 4 pairs (4 FS: Profily, Donut, Magnet, Poppy, all HELD scenes) |
| Dream Island Teams, all 111 FS, 2 wall + 1 clear pairs, holder NOT pinned | 93 pairs (81 FS) | 7 pairs (7 FS, all HELD: Bubble, Ice Cube, Bell, Profily, Poppy, Silver Spoon, Spongy) |
| CTF, all 111 FS, 3 wall + 2 clear pairs, holder NOT pinned (run on the build before the last Bow-only change; rows other than Bow are identical in both builds) | 88 pairs (47 FS) | 1 pair (Money, not held: FAIL) |
| Needle/TLC shaft, all 111 FS, 3 wall + 2 clear pairs, holder NOT pinned (same build note) | 173 pairs (74 FS) | 0 |
| Clear-line pairs on Moon / Dream / shaft (foe damaged at all) | 116 / 80 / 178 | 116 / 80 / 178 (unchanged) |

Verdict by row (last column of the table): PASS 101, PASS* (held scene) 9, FAIL 1 (Money, CTF). The 9 held rows are not blocked by the rule by design (see above); they are listed, not hidden.

Checks: `syncheck` (all inline scripts compile, no control bytes, no bare LF): failed 0. `bootcheck` (copy pointed at the worktree): clean (ffa/teams bad positions 0, errors none, guards ok, kit guard ok). No test suite exists (deleted 2026-10-21).

## Things you should know (honest limits)

- The real-map sweeps are NOT a clean experiment. Pairs are random caster/foe spots whose straight line crosses rock by a sampler that is independent of the new code (`mcRockAt` on Moon, a point sampler on the others). A Final Smash's own motion, gravity (unpinned runs) and the catch's 50-frame intro let the holder end up with a clear line, so "foe damaged" over-counts and the through-rock count is the stricter one. The wall pairs differ in thickness: a pair that only grazes a thin sliver (Moon wall pair 3) is caught by the catch, and then the held scene hits.
- The "through" metric counts a hit attempt with rock between at that frame together with the foe's % rising in that pair; it does not prove the same hit did the damage. It can over-count (a blocked attempt plus another source) and under-count. Before the metric was fixed to require the foe's % rise, the fixed build looked far worse than it is (attempts the rule then blocked were counted as hits); I changed the measurement because it counted blocked attempts, and used the same measure for before and after.
- CTF: Final Smashes cannot occur in a real CTF match at all (`fsAllowed` returns false outside FFA/teams). The CTF numbers are forced fires. The harness fires during the CTF "hide" phase, when a solid barrier wall stands in the middle of the map that my independent sampler does not know about, so the CTF "clear" pairs lose damage after the change (83 pairs before, 20 after; 48 rows weaker): the barrier is real and the rule is right to stop them, but it is not a regression you would see in play.
- Moon Caves: Book and Money (rain from above) now deal nothing in a clear pair inside a roofed cave: their shots start above the foe, fall through the cave ceiling in the old build, and now stop at the rock. That is the rule working, and it makes those two weaker on a roofed map; say if you want them exempted (`wide:true` for rain-from-the-sky rows).
- Dream Island and CTF/shaft sweeps used fewer pairs (Dream 2 wall + 1 clear, 260 frames) than Moon (3 + 2, 260 frames); the first Moon pass was found to fire the catch outside the moon frame, and was re-run (both builds) with the holder pinned until the catch; only that re-run is reported for Moon. Dream was NOT re-run pinned (too slow on this machine), so its holder falls during the intro and the Dream numbers are the looser ones.
- Held scenes (catch then cinematic) keep hitting a foe that was seen at the catch. If the holder or the scene then moves so rock lies between them, the scene is not re-tested (except Bow's chairs). 9 rows show it. Making every scene re-test would end most of them the frame the holder moves.
- Foes that a row MOVES (pulled, lifted, thrown through a wall by the row itself) were not audited, only holders, shots and hits.
- FS floor top-up (`fsfTop`, orange %): applied only to a foe the Final Smash really hit, so a blocked hit gives no top-up.
- Not covered: finishers (FINX), bosses' attacks, the 4 OC Final Smashes, custom hand-drawn maps, Boss Rush arenas, non-FFA/teams modes where Final Smashes cannot occur.

## Table (111 Final Smashes)

Columns: flat wall (40 px, damage to the foe) before / after; clear line unchanged (hash); then for each real map the number of through-rock damage pairs before>after ("fixed" = went to 0, HELD = only a held scene remains, FAIL = still hit through, "ok" = foe hit but never through rock, "no-hit" = this FS never damaged the foe in any pair, so it is untested there). Pair counts are out of 3 wall pairs (Moon, CTF, shaft) or 2 (Dream).

| Final Smash | flat wall before | flat wall after | clear line | Moon Caves v4 | Dream Island | CTF | Needle/TLC shaft | verdict |
|---|---|---|---|---|---|---|---|---|
| Firey | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 2>0 fixed | PASS |
| Leafy | through | blocked | same | no-hit | 1>0 fixed | no-hit | ok | PASS |
| Pencil | through | blocked | same | ok | 2>0 fixed | no-hit | 3>0 fixed | PASS |
| Puffball | through | blocked | same | ok | no-hit | no-hit | no-hit | PASS |
| Bow | through | blocked | same | ok | no-hit | no-hit | 1>0 fixed | PASS |
| Flower | through | blocked | same | ok | 1>0 fixed | 3>0 fixed | 3>0 fixed | PASS |
| Bubble | through | blocked | same | 2>0 fixed | 2>1 HELD | ok | 3>0 fixed | PASS* (held scene) |
| Blocky | through | blocked | same | ok | 1>0 fixed | ok | 3>0 fixed | PASS |
| Pen | through | blocked | same | ok | 1>0 fixed | no-hit | 3>0 fixed | PASS |
| Match | through | blocked | same | no-hit | no-hit | no-hit | 2>0 fixed | PASS |
| Ice Cube | through | blocked | same | ok | 2>1 HELD | 1>0 fixed | 3>0 fixed | PASS* (held scene) |
| Teardrop | through | blocked | same | ok | 1>0 fixed | ok | 2>0 fixed | PASS |
| Bomby | through | blocked | same | ok | ok | ok | ok | PASS |
| Rocky | through | blocked | same | no-hit | 1>0 fixed | no-hit | ok | PASS |
| Lightning | through | blocked | same | ok | 1>0 fixed | 2>0 fixed | ok | PASS |
| Fanny | through | blocked | same | no-hit | 1>0 fixed | no-hit | ok | PASS |
| Dora | blocked | blocked | same | no-hit | ok | no-hit | no-hit | PASS |
| Saw | through | blocked | same | no-hit | no-hit | no-hit | no-hit | PASS |
| Tennis Ball | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 1>0 fixed | PASS |
| Snowball | through | blocked | same | ok | no-hit | no-hit | no-hit | PASS |
| Book | through | blocked | same | ok | 1>0 fixed | 2>0 fixed | ok | PASS |
| Ruby | through | blocked | same | ok | no-hit | no-hit | 1>0 fixed | PASS |
| Needle | through | blocked | same | no-hit | no-hit | no-hit | no-hit | PASS |
| Pin | through | blocked | same | ok | 1>0 fixed | no-hit | ok | PASS |
| Coiny | through | blocked | same | ok | 1>0 fixed | ok | ok | PASS |
| Golf Ball | through | blocked | same | ok | 1>0 fixed | no-hit | 3>0 fixed | PASS |
| Fries | through | blocked | same | ok | 1>0 fixed | 3>0 fixed | 3>0 fixed | PASS |
| Gelatin | through | blocked | same | ok | 1>0 fixed | ok | 2>0 fixed | PASS |
| Nickel | through | blocked | same | ok | 1>0 fixed | 3>0 fixed | ok | PASS |
| Barf Bag | through | blocked | same | ok | 1>0 fixed | 3>0 fixed | 3>0 fixed | PASS |
| Basketball | through | blocked | same | no-hit | 1>0 fixed | no-hit | ok | PASS |
| Bell | through | blocked | same | ok | 2>1 HELD | 3>0 fixed | 3>0 fixed | PASS* (held scene) |
| Bracelety | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 3>0 fixed | PASS |
| Gaty | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 3>0 fixed | PASS |
| Grassy | through | blocked | same | ok | 1>0 fixed | ok | 2>0 fixed | PASS |
| Liy | through | blocked | same | 1>0 fixed | 1>0 fixed | no-hit | ok | PASS |
| Lollipop | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 2>0 fixed | PASS |
| Marker | through | blocked | same | ok | no-hit | ok | 2>0 fixed | PASS |
| Money | through | blocked | same | ok | 1>0 fixed | 2>1 FAIL | 1>0 fixed | FAIL |
| Naily | through | blocked | same | ok | no-hit | no-hit | 1>0 fixed | PASS |
| Pillow | through | blocked | same | ok | 1>0 fixed | 3>0 fixed | 3>0 fixed | PASS |
| Remote | through | blocked | same | ok | 1>0 fixed | 3>0 fixed | 3>0 fixed | PASS |
| Rose | through | blocked | same | ok | 1>0 fixed | no-hit | 3>0 fixed | PASS |
| Taco | through | blocked | same | ok | ok | 3>0 fixed | ok | PASS |
| TV | through | blocked | same | ok | 2>0 fixed | 3>0 fixed | 3>0 fixed | PASS |
| Woody | through | blocked | same | no-hit | no-hit | no-hit | 1>0 fixed | PASS |
| Toothpaste | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 1>0 fixed | PASS |
| David | through | blocked | same | ok | 1>0 fixed | no-hit | 3>0 fixed | PASS |
| Firey Jr. | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 3>0 fixed | PASS |
| Fern | through | blocked | same | ok | 1>0 fixed | ok | 3>0 fixed | PASS |
| Ruler | through | blocked | same | ok | no-hit | no-hit | no-hit | PASS |
| Sidewalky | through | blocked | same | ok | 1>0 fixed | no-hit | 3>0 fixed | PASS |
| Yellow Face | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 3>0 fixed | PASS |
| Loser | through | blocked | same | ok | 1>0 fixed | no-hit | ok | PASS |
| Paintbrush | through | blocked | same | no-hit | ok | no-hit | 1>0 fixed | PASS |
| Balloony | through | blocked | same | ok | 1>0 fixed | no-hit | 1>0 fixed | PASS |
| Roboty | through | blocked | same | ok | 1>0 fixed | no-hit | 2>0 fixed | PASS |
| Profily | through | blocked | same | 2>1 HELD | 2>1 HELD | ok | 3>0 fixed | PASS* (held scene) |
| Tree | through | blocked | same | 3>0 fixed | 2>0 fixed | 2>0 fixed | 3>0 fixed | PASS |
| Cake | through | blocked | same | no-hit | 1>0 fixed | no-hit | ok | PASS |
| Donut | through | blocked | same | 3>1 HELD | 2>0 fixed | 2>0 fixed | ok | PASS* (held scene) |
| Balloon | through | blocked | same | ok | 1>0 fixed | 3>0 fixed | 3>0 fixed | PASS |
| Bomb | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 3>0 fixed | PASS |
| Knife | through | blocked | same | ok | 1>0 fixed | ok | 1>0 fixed | PASS |
| Lightbulb | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 3>0 fixed | PASS |
| Taco (II) | through | blocked | same | ok | 1>0 fixed | ok | ok | PASS |
| Marshmallow | through | blocked | same | 1>0 fixed | 1>0 fixed | 3>0 fixed | 3>0 fixed | PASS |
| Apple | through | blocked | same | no-hit | no-hit | no-hit | no-hit | PASS |
| Baseball | through | blocked | same | no-hit | no-hit | no-hit | 1>0 fixed | PASS |
| Pickle | through | blocked | same | ok | 1>0 fixed | ok | 3>0 fixed | PASS |
| Nickel (II) | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 3>0 fixed | PASS |
| Paper | through | blocked | same | ok | 1>0 fixed | 2>0 fixed | ok | PASS |
| Microphone | through | blocked | same | no-hit | no-hit | no-hit | 1>0 fixed | PASS |
| Salt | through | blocked | same | ok | no-hit | no-hit | 2>0 fixed | PASS |
| Test Tube | through | blocked | same | ok | 1>0 fixed | 3>0 fixed | 3>0 fixed | PASS |
| Box | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 3>0 fixed | PASS |
| Trophy | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 3>0 fixed | PASS |
| Goo | through | blocked | same | ok | no-hit | no-hit | no-hit | PASS |
| Lifering | through | blocked | same | no-hit | no-hit | ok | 1>0 fixed | PASS |
| Bonesaw | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 3>0 fixed | PASS |
| Spikey | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 3>0 fixed | PASS |
| Candle | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 2>0 fixed | PASS |
| Cammy | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 2>0 fixed | PASS |
| Cheesy | through | blocked | same | ok | 1>0 fixed | no-hit | 1>0 fixed | PASS |
| Dough | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | ok | PASS |
| Fan | through | blocked | same | no-hit | no-hit | ok | 1>0 fixed | PASS |
| Soap | through | blocked | same | no-hit | 1>0 fixed | no-hit | ok | PASS |
| Tissues | through | blocked | same | ok | 1>0 fixed | no-hit | 1>0 fixed | PASS |
| Yin-Yang | through | blocked | same | no-hit | ok | no-hit | 1>0 fixed | PASS |
| Starfruit | through | blocked | same | ok | 1>0 fixed | 3>0 fixed | 3>0 fixed | PASS |
| Blueberry | through | blocked | same | ok | 2>0 fixed | 3>0 fixed | 3>0 fixed | PASS |
| Cherries | through | blocked | same | no-hit | no-hit | ok | no-hit | PASS |
| Clover | through | blocked | same | ok | 1>0 fixed | ok | ok | PASS |
| Jack | through | blocked | same | no-hit | 1>0 fixed | no-hit | ok | PASS |
| Magnet | through | blocked | same | 3>1 HELD | 2>0 fixed | 1>0 fixed | ok | PASS* (held scene) |
| MeTag | blocked | blocked | same | ok | no-hit | no-hit | no-hit | PASS |
| Poppy | through | blocked | same | 1>1 HELD | 2>1 HELD | 3>0 fixed | ok | PASS* (held scene) |
| Silver Spoon | through | blocked | same | ok | 1>1 HELD | 3>0 fixed | 3>0 fixed | PASS* (held scene) |
| Tapey | through | blocked | same | no-hit | no-hit | no-hit | 1>0 fixed | PASS |
| Tea Kettle | through | blocked | same | ok | ok | ok | no-hit | PASS |
| Teddy Bear | through | blocked | same | ok | 1>0 fixed | ok | 3>0 fixed | PASS |
| Bot | through | blocked | same | ok | 1>0 fixed | no-hit | 3>0 fixed | PASS |
| Eraser | through | blocked | same | no-hit | no-hit | no-hit | no-hit | PASS |
| 8-Ball | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 3>0 fixed | PASS |
| Spongy | through | blocked | same | ok | 2>1 HELD | ok | ok | PASS* (held scene) |
| Black Hole | through | blocked | same | 1>0 fixed | ok | no-hit | ok | PASS |
| Clock | through | blocked | same | ok | 1>0 fixed | 2>0 fixed | 3>0 fixed | PASS |
| Cloudy | through | blocked | same | ok | 1>0 fixed | 1>0 fixed | 3>0 fixed | PASS |
| Pie | through | blocked | same | ok | 1>0 fixed | 3>0 fixed | 3>0 fixed | PASS |
| Stapy | through | blocked | same | ok | 1>0 fixed | no-hit | 1>0 fixed | PASS |
| Foldy | through | blocked | same | ok | ok | 1>0 fixed | 3>0 fixed | PASS |
