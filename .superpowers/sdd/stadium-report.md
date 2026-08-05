# Stadiums: more vertical + a MAP SIZE match setting

Branch `feat/stadiums` (based on `feat/animations`). Single file changed: `artifacts/V1/index.html`,
plus a new `test/stadium-size.test.js`.

---

## 1. What changed per arena

### Teams — "The Yoyle Crossing" (`isBig()`)

| | before | after (Normal) |
|---|---|---|
| `WH` | `H * 2.15` | `H * 2.5` |
| floor line `botY` | `WH - H*0.22` (screen-relative) | `WH * 0.912` (world-relative) |
| tower top | `botY - H*0.98` | `botY - WH*0.48` (= `botY - H*1.2`) |
| climbing rungs | 5, fixed 128px apart | **adaptive count, ≥6**, spacing `climbSpan/(rungs-1)` ≤ 128 |
| support legs | 2 solid columns, full 150px tunnel height | 2 hanging corbels, `TUNNEL_H - 130` tall |
| tunnel clearance | 150px nominal (0px real — see §4) | 150px nominal, **≥130px real** |

Making `botY` and the tower height fractions of `WH` (rather than of the screen `H`) is what lets the
MAP SIZE multiplier grow the whole stadium instead of just piling empty sky on top of a short tower.
The rung *count* is derived from the tower's height, so Huge grows ~10 rungs where Normal has 6 —
the ladder never stretches.

Bluffs, bridges and flank perches keep their pixel dimensions on purpose: they are player-scale
furniture sitting on the floor, and scaling them would distort the fighter-to-landmark ratio the
map reads by. Their spacing was measured at every size and stays well inside a double jump.

### Big-FFA scrolling stages (`isBigFFA()`)

- `hScale` **2.0 → 2.5**.
- Platform band **`WH*(0.4 + py*0.55)` → `WH*(0.25 + py*0.65)`**, so the layout uses a taller slice of
  a taller world: Grand Plains' platforms now span 549px vertically where they spanned 372px — a 48%
  increase in usable vertical play space, not just a taller camera box.
- The branch now accepts a stage with no `platsBig`: a **small** stage promoted by MAP SIZE is laid
  out from its own `plats` over one layout-unit of width (`layoutW = 1`, `wScale = 2.0`).

### Arena-wide platform field (owner feedback: "platforms should be all around the map")

`FIELD_ROW_GAP`, `FIELD_COL_W()`, `cellJitter()`, `scatterPlatforms()`.

The hand-placed landmarks only ever furnished the middle of a map. On a 2.5×-tall arena that left the
entire upper airspace and the long lateral runs between the bluffs/plateaus and the edges as empty sky —
a coarse 6×6 grid over the playable box showed the **top two rows empty on every single arena**, and the
teams map reduced to a narrow `..##..` column around the tower.

`scatterPlatforms()` now fills the whole playable box on a staggered (brick-bond) grid:

- **Rows** every `FIELD_ROW_GAP = 150px` from one hop above the floor up to `WH*0.10`. 150 ≤
  `MAX_HOP_RISE`, so a full-height field is climbable *by construction* rather than by luck.
- **Columns** every `FIELD_COL_W() = max(380, W*0.62)` world px — tied to the SCREEN width, not the
  world's, so density per screenful stays constant and a Huge map gets *more* platforms, not sparser ones.
- **Brick bond**: alternate rows offset by half a cell, plus a ±0.12-cell x nudge and a 0.85–1.35×
  width variation. Grid-ish, so it reads deliberate rather than noisy.
- **Deterministic**: the jitter is a hash of the cell's `(col, row)` coordinates, never `Math.random()`.
  `setupWorld()` stays pure, so replays, the golden traces and netplay all rebuild the identical arena.
  A test asserts two different RNG seeds produce byte-identical `worldPlats`.
- **Skips** any cell that would collide with a solid landmark, a team base and the 90px spawn column
  above it, the tower's run-under tunnel, a big-FFA respawn perch, or a hand-placed platform already
  serving that spot. Landmarks, spawns and bases are untouched.
- Everything produced is a **one-way top**, which by construction cannot wall off a horizontal route
  the way a solid can — the failure mode from §4 can't recur here.
- **Edge lane**: the outer 7% of the span on each side is left clear. KOs in this game come almost
  entirely from being knocked out sideways, and a platform in the last stretch before the blast zone
  catches the victim and hands them a free recovery. Furnishing all the way out measurably stalled the
  biggest map — see §4. The lane is narrower than a coverage cell, so nothing reads as a gap.

Coverage, 6×6 grid over the playable box, 30 arenas (teams + 5 big stages + 3 promoted small stages,
each at all 4 sizes):

| | mean | worst | top-third of the map |
|---|---|---|---|
| before | **44.7%** | 33% | empty on all 30 |
| after | **95.7%** | 86% (3 of the smallest arenas) | populated on all 30 |

(98.0% before the edge lane was reserved; the lane costs ~2 points and buys back the KO rate.)

Widest climb gap also tightened from "up to 170px" to a flat **150px** everywhere, because the field's
row pitch now dominates the layer spacing.

### Automatic climb-ladder fill

`MAX_HOP_RISE = 170` (a double jump), `climbLayers()`, `fillClimbGaps()`.

`climbLayers()` returns every standable surface of the current arena — platform tops, the implicit
solid ground, base tops, and claimable spawn points. It deliberately **excludes the two `safe`
respawn islands** of a big-FFA map: those are isolated perches you drop *off* after respawning, and
sprouting a staircase up to them would be wrong.

After each arena is built, any gap in that list wider than 170px gets a row of three one-way hop
platforms at evenly-spaced intermediate heights. One-way tops can be jumped *through* from below, so
a row directly under an existing platform is still a valid rung. This is what makes the multipliers
safe: the taller the world, the more rungs the ladder grows, automatically, for every stage.

Measured widest gap across all 4 sizes × 5 big stages × 5 small stages: **≤170px** everywhere
(threshold 180). Sample:

```
teams/normal       WW=3420 WH=1920 maxGap=114  floor=3215/3420  tunnel=150
teams/huge         WW=4788 WH=2880 maxGap=127  floor=4501/4788  tunnel=150
fortress/normal    WW=4915 WH=1920 maxGap=135
fortress/huge      WW=6881 WH=2880 maxGap=167
goiky(small)/tall  WW=2048 WH=2688 maxGap=150   ← promoted to scrolling
```

---

## 2. The MAP SIZE setting

`SETTINGS.mapSize` (default `'normal'`), table `MAP_SIZES`:

| key | label | W | H |
|---|---|---|---|
| `compact` | Compact | 0.85 | 0.85 |
| `normal` | Normal | 1.0 | 1.0 |
| `tall` | Tall | 1.0 | 1.4 |
| `huge` | Huge | 1.4 | 1.5 |

**UI** — a `.setgrp` + `<div class="seg" id="segMapSize">` with `data-v` buttons, placed after Items in
MATCH SETTINGS, wired through the existing `bindSeg('segMapSize', …)` in `buildSettings()` exactly like
`segStocks` / `segAI`. `buildSettings()` also re-syncs the `on` highlight on open, since a net match can
change `mapSize` behind the menu's back. The match summary line gains `· <Label> map`.

**Application** — `mapSize()` returns the multiplier pair; `setupWorld()` applies it to the computed
`WW`/`WH` in both the teams branch and the big-FFA branch. Everything else (floor span, tower, bluffs,
spawn points, `groundY()`, blast zone `WW±120 / WH+160`, minimap ratios, `updateCamera()` clamps, base
placement) is already derived from `WW`/`WH` — verified by reading each call site, and exercised by the
tests, not assumed.

**Small stages** — `forcedScroll()` is true when `mapSize().h > 1`. `isBigFFA()` now returns true for a
small stage in that case, so Tall/Huge route it onto the **big-FFA scrolling path** with its own platform
layout. This is deliberate: the widened-*small* path (reverted, see the comment at the small-stage
branch) produced an empty floorless camera view, and nothing here touches it. Compact/Normal leave small
stages byte-identical to `platRectsSmall()` — a test pins that.

**Opt-outs** — `forcedScroll()` excludes Boss Rush (its arena is a fixed single screen on purpose, so the
telegraphed attacks stay readable), the tutorial, and test mode.

**Net** — `mapSize` now travels in the host's `start` settings so both sides build the same geometry, and
`beginMatch` clamps an unrecognised peer value back to `normal`.

---

## 3. Drive-by fixes

### `resize()` clobbering a scrolling world

`resize()` did `if(!isBig()){ WW=W; WH=H; }`. A mid-match browser resize therefore collapsed a scrolling
FFA world to one screen, leaving the camera clamped inside a fraction of the real map. Now
`if(!isBig() && !isBigFFA())`. Pre-existing; it became load-bearing once small stages can scroll.

### `serializeState()` dropping `solid`

The per-frame netcode snapshot serialised `worldPlats` without `solid`, so on a **client** every stone
landmark (tower, bluffs, mesas, battlements) rendered as a thin one-way ledge instead of a masonry
slab. Added `solid` and the new `field` flag (the latter keeps the client's minimap filtering the
scatter grid the same way the host's does).

**Known follow-up, not addressed:** that snapshot ships the whole platform list every frame "for
simplicity on LAN". The field takes a Huge arena from ~20 platforms to ~110, so the snapshot is ~5×
bigger than it was. Clients already run `setupWorld()` themselves and `mapSize` now travels in the
settings, so the world half of this payload is redundant and could be sent once at match start — but
that is a netcode change, out of scope here.

---

## 4. Invariant checks (and one invariant that was NOT actually holding)

**Floor continuity — holds, pinned.** The teams arena is still one unbroken solid slab spanning
`floors[0]`. Tested at all four sizes: exactly one floor level, exactly one wide solid with
`floor===0`, its `x`/`w` matching `floors[0]`, covering >90% of `WW`.

**Run-under tunnel — was broken, now fixed.** The tower base is raised 150px off the floor, but the two
"support legs" were `solid`, 16px wide, and spanned that entire 150px — one at each mouth of the
tunnel. They re-created exactly the wall this arena exists to avoid. Evidence, headless 2v2 (Hard AI,
2 stocks, seeds 1–6, 9000 frames each) on `feat/animations`:

```
BEFORE:  resolved 0/6   KOs 0   — both teams parked at x=1565 and x=1855,
                                  i.e. pressed against the two legs, for 9000 frames
```

`navAround()` won't hop an obstacle whose top is ≥130px above the fighter's feet (the legs' top is at
150px), so the AI took the detour branch and oscillated forever. The legs are now short corbels hanging
from the tower, leaving `LEG_CLEAR = 130px` of real run-through space (a fighter is 48px tall) — and
because their undersides sit above head height, `navAround()` no longer classes them as obstacles at all.

```
AFTER:   24 runs (4 sizes × 6 seeds, 9000 frames)   resolved 2/24   KOs 74   throws 0
         first KO typically frame 3000–4000; damage and positions progress at every size
```

Matches still run long (a 2v2 at 2 stocks needs 4 KOs on one side), which matches the repo's existing
note that this map resolves given a realistic frame budget rather than a short cap — but they now
progress instead of deadlocking, at every map size.

**Run-under tunnel after the scatter — still holds.** The field never places a piece in the tunnel box
(explicit blocker) and everything it places is a one-way top, which cannot block a horizontal route at
all. Measured clearance is unchanged at 150px nominal / ≥130px real, every size, and is asserted.

**Platform reachability — holds, pinned.** Now a flat 150px (the field's row pitch), asserted ≤180px.

**No stall from the added platforms — but Huge got slower, and that is a real trade-off.**
The 9000-frame cap used earlier is simply too short for this map; at a realistic budget matches resolve.
teams 2v2, Hard AI, 2 stocks, seeds 1–4, 30k-frame cap:

| build | size | resolved | KOs | mean frames |
|---|---|---|---|---|
| pre-scatter | Normal | 4/4 | 22 | 13858 |
| field, no edge lane | Normal | 4/4 | 24 | 14483 |
| **field + edge lane** | Compact | 3/4 | 24 | 16361 |
| **field + edge lane** | Normal | 4/4 | 23 | 17215 |
| **field + edge lane** | Tall (6 seeds) | 6/6 | 33 | ~15600 |
| pre-scatter | **Huge** | 4/4 | 24 | 19797 |
| field, no edge lane | **Huge** | 1/4 | 19 | >27000 |
| **field + edge lane** | **Huge** | 2/4 | 19 | 26426 |

**15 of 18 runs resolve** across all four sizes. Compact/Normal/Tall are essentially unaffected.
**Huge is ~33% slower to resolve than it was** (19.8k → 26.4k frames, with 2 of 4 seeds still going at
the 30k cap). The cause is not a wall — it's that a map furnished edge to edge catches fighters who
would otherwise have been knocked out, and Huge has the most airspace to furnish. The edge lane
recovered half of it (1/4 → 2/4); recovering the rest would mean thinning the field, which is the
opposite of what was asked for.

Every Huge run still lands 4–6 KOs and progresses steadily, so this is a *long* map (4788×2880 ≈ 19
screens of area), not a deadlocked one. **Flagging it as a judgement call**: if Huge matches feel like
they drag in play, the dial to turn is `EDGE_LANE` (wider) or `FIELD_COL_W()` (larger), both one-line.

**Frame cost.** 8-fighter Canyon at Huge, 3000 steps: 21 platforms → 3.35 ms/frame, 133 platforms →
3.19 ms/frame. No measurable regression; platform count is not on the hot path.

**Known, untouched:** the Incinerator's single-screen layout has a 184px floor→ledge hop. It predates
this work, is part of that stage's design, and Compact/Normal don't touch small stages, so the
reachability assertion is scoped to the arenas `setupWorld()` actually resizes. A separate test pins
that small stages at Compact/Normal come out identical to the legacy builder.

---

## 5. Verification

- `npx vitest run` — **12 files, 119 tests, all green** (72 pre-existing + 47 new). No golden churn.
- `test/stadium-size.test.js` also covers the platform field: ≥85% coarse-grid coverage for the teams
  arena and every scrolling FFA stage at all 4 sizes; the top third of the map populated on every
  arena; byte-identical `worldPlats` from two different RNG seeds (purity); and that no field piece is
  solid, lands inside a landmark, lands in a base's spawn column, or reduces the tunnel below 120px.
- `test/stadium-size.test.js` covers: the multiplier table and its defaults; the seg control wiring and
  summary text; unknown-`mapSize` fallback; multipliers applied to teams and big-FFA `WW`/`WH`;
  Compact/Normal leaving small stages on one screen and byte-identical; Tall/Huge promoting small stages
  to the scrolling path with real platforms, spawn zones and a sane `groundY()`; Boss Rush staying
  single-screen at Huge; floor continuity at all 4 sizes; tunnel clearance ≥120px at all 4 sizes;
  reachability ≤180px for every scrolling arena at every size; the tower growing taller and growing
  rungs with the arena; the widened platform band mapping exactly to `WH*(0.25+py*0.65)`; a 2v2 running
  3000 frames at each size with movement and damage; a Tall small-stage FFA running 600 frames with the
  camera inside `[0, WW-W] × [0, WH-H]`.
- Real browser (file://): Map Size seg renders and toggles, summary reads "… · Huge map", and a Huge
  Goiky Field match boots into a scrolling arena with a visible floor, platforms, minimap and fighters —
  no console errors, and specifically not the empty-floorless view of the reverted path.
