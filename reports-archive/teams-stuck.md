# Teams map: "bow and sb keep getting stuck here" (World Cup #27)

Read-only investigation, 2026-10-29. Nothing in the game was edited and nothing was committed. Every fix below was tried only on an
in-memory copy of the game, in headless Expert CPU matches.

## 1. The spot

The picture matches the minimap of the 2v2 Teams map exactly. Going from left to right:

- the dark strip is the **minimap's own frame**, not a wall in the game;
- the red square is a **red-team CPU (Ruby + Bow) at the far left edge of the world**, x about 0-30 out of 5511 and y about 1540 out of 2700. It sits half
  over the frame because the marker is clamped to the map's edge;
- the green is just the minimap's background;
- the grey lines are the two faces of the **horizontal arm of the cross**, the two doorway steps beside them, and red's wall-band spawn pads.

I rendered the minimap from the real map data and it lines up with the screenshot line for line:
`C:\Users\carad\AppData\Local\Temp\claude\C--Users-carad--claude\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\stuck\minimap-left-crop.png`.

The red CPU is in the open air just under the **left end of the cross's horizontal arm**. "sb" is Starfruit, on blue. Blue's side is the
mirror image, at the right edge.

Here is the geometry that matters. Line numbers are for main at 54b4715.

- **The canyon floor stops 3% of the world short of each side** (line 20115: `x:marginX ... w:floorW`, with `marginX = WW*0.03` = 165 px).
  Past it is a strip 165 px wide with **nothing in it all the way down to the bottom KO line** (line 44293: `f.y > WH+160`).
- **The horizontal arm starts right at that edge** (line 20160: `wallRun(marginX, ...)`). It is hollow, so its tunnel (y 1277-1423)
  **opens straight onto that strip**.
- **One of red's ten spawn spots is inside that tunnel**: the band's 4th pad (k=3 in the loop at line 19983), at x 201-341, y 1345.
  The right side is the same for blue.

## 2. What the CPU does there (reproduced)

I put Bow in the arm's tunnel with a foe somewhere below (the cup's foes were on the floor), 10 s per set-up, Expert. She does this every
time, roughly once a second:

1. She walks **left** along the tunnel floor (keys: `L`) to its open end at x 151 and steps off into the strip.
2. Bow alone counts as "off the stage" anywhere she has nothing under her and a platform above (`aiBowAdrift`, line 65145). Her recovery
   (`aiBowRecover`, line 65199) only aims at platforms **above** her feet (line 65204). She jumps back up and right (`RJ`) and lands in
   the same tunnel.
3. Then she does step 1 again.

Her minimap marker swings between the tunnel and the world's edge at the low point of each fall, which is the picture. Started at the
spot in the screenshot (x 27, y 1537), she goes straight into the loop. In my 15 set-ups she looped in **7 of 15 on the build before
today's CPU fixes went in, and 4 of 15 on today's main**.

The others (Starfruit, Snowball, Ruby, Fern) walk off the same way. Their recovery only starts within 50 px of the world's edge
(line 64423), and the strip is 165 px wide. Whether they come back depends on how fast they were moving: they either drift past 50 px and
recover, or fall straight down the strip and **lose a stock with nobody touching them**. (In the air the drop rule presses nothing, see
below.)

## 3. Why: two "getting there" rules walk CPUs off the arm into the strip

**A. ANOTHER LEVEL, the drop half (line 64376).** A foe more than 110 px below means "walk to the nearest end of what you stand on and
drop". `nearestDropX` (line 63968) treats a solid on the Teams map as a walk-off. It checks whether anything is under each end (line 64000),
but when nothing is, it **does not reject that end**: it falls back to the lip, `seg.x-14` (line 63996). So for the arm's tunnel floor
(x 165-539) the "drop point" is the open end at x 151, over the strip. It wins whenever the CPU is in the left 60% of the tunnel, and that
includes the spawn pad in the tunnel. The other end (the outer doorway, with a step under it) is a safe drop.

**B. NO WAY THROUGH, the detour (lines 64284-64294).** After 4 s without getting 100 px nearer a far foe, the CPU runs "the other way"
for 70 frames, with random hops. From inside its own wall band the other way is the world's edge. The rule's stop-at-the-edge call,
`brainEdges` (line 64219), **returns at once on every big map** (`if(isBig()) return`), so on the Teams map nothing stops the run at the
end of the floor. The same function was meant to guard the unstick burst and THE LONG WAY too.

Measured (20 Expert matches, today's main with the CPU fixes in): of 84 walks or jumps into the strip that came after no hit, **54 were
the detour, 27 the drop rule** and 3 other rules.

**Bow loops where the others fall** because of her recovery (point 2 above).

**Today's CPU fixes (g-bot-fixes, merged at 14:52 as 9f043c5) do not change this.** The edge guard is off on big maps (line 64799), and
Bow's new Teleport-up (line 64371) is only in the climbing half of ANOTHER LEVEL. I re-measured on the merged main and the loop and the
falls are still there.

## 4. The fix I propose (CPU only, two small edits)

```js
// nearestDropX, the walk-off block (lines 63997-64002): an end with nothing under it is no way down while the other end has one
    const okL = below(seg.x - past), okR = below(seg.x + seg.w + past);
    if(okL) leftEdge = seg.x - past;
    if(okR) rightEdge = seg.x + seg.w + past;
    if(!prefer && okL !== okR) return okL ? leftEdge : rightEdge;

// brainEdges (line 64219): on the Teams map the edge is where the canyon floor ends
function brainEdges(f, inp, m){ if(isBig()){ if(SETTINGS.mode === 'teams' && floors.length){ const q = floors[0];
  if(f.x < q.x + m) inp.left = false; if(f.x > q.x + q.w - m) inp.right = false; } return; } ...as before
```

There is also an optional third line. It closes the falls that still happen, mostly a CPU knocked or drifting into the strip: on the
Teams map, recovery starts where the floor ends, not 50 px from the world's edge.

```js
// brainRecover (line 64423)
  const tq = (SETTINGS.mode === 'teams' && isBig() && floors.length) ? floors[0] : null;
  const offLeft=f.x<(tq ? Math.max(50, tq.x) : 50), offRight=f.x>(tq ? Math.min(WW-50, tq.x + tq.w) : WW-50), ...
```

**The CPU stays human-paced.** None of these adds a key press or changes timing. They only choose the other end of the same platform,
let go of an arrow that points at the strip, and start the existing recovery sooner. Reaction time and hand speed (`CPU_HUMAN`) are
untouched. Nothing outside the Teams map changes: each change checks `SETTINGS.mode === 'teams'`, or only matters there.

**Map alternative (your call, it changes play for people too):** run the canyon floor the full width of the world (line 20115:
`x:0 ... w:WW`). The strip disappears, and so does the side pit humans can fall into now. Taking red's 4th pad out of the arm's tunnel
would also stop a tenth of respawns from starting inside it.

## 5. Before and after

Main measurement: **20 Expert matches**, 2 min each, items off, the same seeds for every column. 16 are 2v2: the cup final exactly
(Ruby + Bow vs Starfruit + Fern), Bow + Starfruit vs Ruby + Fern, Snowball + Bow vs Starfruit + Ruby, and Starfruit + Snowball vs Bow + Fern,
on 4 seeds each. The other 4 are 1v1: Bow vs Starfruit and Snowball vs Bow.

| today's main (CPU fixes in) | now | fix (2 edits) | fix + recovery line |
|---|---|---|---|
| walks or jumps into the strip (not after a hit) | **84** | 30 | 28 |
| ...by the detour / by the drop rule | 54 / 27 | 23 / 7 | 22 / 5 |
| time spent in the strip | **61.6 s** | 19.4 s | 7.2 s |
| stocks lost out the bottom with no hit in the last 2 s | **6** | 2 | **0** |
| Bow probe: loops through the strip (15 set-ups) | **4/15** (7/15 before the CPU fixes) | 0/15 | 0/15 * |

\* The automatic count says 2/15 here, but both are the stall inside the tunnel described in section 6 (27 and 35 frames in the strip,
one of them because the set-up started there), not loops through the strip.

The 30 entries left after the fix are mostly a hop already under way that drifts a few px over the line and comes back. The detour lets
go of the arrow, but the momentum carries on.

On a second set of 12 matches (other seeds, on main as it moved to d43690f and 54b4715), the fix + recovery line gave: strip entries
**35 → 11**, time in the strip **20.5 s → 3.1 s**, and falls out the bottom with no hit **2 → 0**.

## 6. What the fix does not solve (please read)

**The arm's tunnel is still hard to climb out of.** A CPU in the tunnel that wants to go **up** (foe standing on top of the arm) dithers at
the outer doorway. Climbing (`navUp`) flips between the top of the outer arm piece and the top of the inner one, and never uses the doorway's
own step: that step is under navUp's "at least 24 px above you" floor (line 63855). On today's main, Bow got out of this by
**falling out of the open end and teleporting up the outside**, in all 5 "foe on top" set-ups. (Before today's CPU fixes she looped in
the strip there instead.) The fix closes that accidental route, so in those set-ups she now waits in the tunnel instead: 4 of 5 with the
two edits, 5 of 5 with the recovery line (box x 145-528 for the whole 10 s). It is no longer a loop at the edge or a lost
stock, but it is still a stall. The next step is to make the doorway climbable for the brain (navUp at the doorway), or one of the map
options above.

**There is a second, separate stuck spot: the centre chamber of the cross** (x 2685 or 2827, y 1294). It is not your picture, but it is the
most common "stuck" my detector found (not moving 50 px in 2 s, not hit, foe 220 px or more away): 11 episodes, 37 s, in 20 matches on today's
main.

- The shaft rung that lands inside the chamber (line 20194) sits **7 px too high**. A fighter standing on it has its head in the side
  arms' ceiling, so it cannot walk left or right into them. Standing at either end of the rung, it is right under the end of a shaft wall,
  so a straight-up jump bonks.
- The UNSTICK burst **holds jump down for its whole burst** (line 64315). The bursts chain while the CPU stays still, so it never presses
  jump fresh and never jumps (in the samples: `RJ` for 4-7 s, standing, both jumps unused).

The fix above sends more CPUs toward the middle, so this spot catches more of them. On the main 20 matches: 37 s → 51 s (2 edits) →
81 s (with the recovery line). Most of that is one match (seed 33, Bow).

On the 12-match set I tried: the burst taps jump instead of holding it (gives 0 centre episodes, against 4 with no fix and 2 with the fix
alone), and the rung lowered to 60 px under the ceiling (2 episodes). These are small samples. Tapping the jump looks like the right first
step, but it needs its own pass.

## 7. How this was measured

- Scripts: `C:\Users\carad\AppData\Local\Temp\claude\C--Users-carad--claude\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\stuck\`.
  - `run.mjs` runs the matches.
  - `probe.mjs` is the placed-CPU set-ups at the wall.
  - `fixes.mjs` holds the in-memory patches.
  - `geom.mjs` renders the map and minimap.
- Every match booted the real game in jsdom with Expert CPUs, items off, BelowNormal priority, at most 3 node processes at once. Every
  `return` in `aiThink` and `brainRecover` was tagged with its line, so each frame shows which rule had the keys and what the hands pressed.
- **Main moved four times while I worked:** the CPU fixes merged (14:52), team flags (14:57), Plays Camera (15:01), and two-stocks round 2
  (15:04). Each mechanism reproduced on every build. Each table column comes from one stretch of runs on one build, except the 12-match
  set: its "now" column ran on d43690f and its fix columns mostly on 54b4715. In the 1v1s the strip line I counted from was 165 px, while
  the real floor edge there is 154 px (a slightly bigger world in 2v2), so a few 1v1 entries are counted a frame early.
- Fern's 1-3 stocks lost off the **top** with no hit, in several runs, are unrelated (up the central shaft) and were not looked into.
