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

### New: automatic climb-ladder fill

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

## 3. One drive-by fix: `resize()` clobbering a scrolling world

`resize()` did `if(!isBig()){ WW=W; WH=H; }`. A mid-match browser resize therefore collapsed a scrolling
FFA world to one screen, leaving the camera clamped inside a fraction of the real map. Now
`if(!isBig() && !isBigFFA())`. Pre-existing; it became load-bearing once small stages can scroll.

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

**Platform reachability — holds, pinned.** ≤170px measured, asserted ≤180px.

**Known, untouched:** the Incinerator's single-screen layout has a 184px floor→ledge hop. It predates
this work, is part of that stage's design, and Compact/Normal don't touch small stages, so the
reachability assertion is scoped to the arenas `setupWorld()` actually resizes. A separate test pins
that small stages at Compact/Normal come out identical to the legacy builder.

---

## 5. Verification

- `npx vitest run` — **12 files, 108 tests, all green** (72 pre-existing + 36 new). No golden churn.
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
