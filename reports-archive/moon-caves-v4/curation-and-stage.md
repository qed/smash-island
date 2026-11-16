# Moon Caves v4: the 16 fixed moons per size, and the side-by-side stage entry

Design and paper tools only. Written 2026-11-02 by designer 4 (my lens: the fixed set, how it is chosen, and how v4 sits beside v3). Nothing in the game was edited, committed, stashed or pushed. `smash-bal` (branch `ii-dlc`, tip `a316e32`, Moon Caves v3 live) was only read; the one thing I ran against the game was a read-only jsdom dump of `mcGen`'s disc headers (`v4-spec-tools/dump-disc-headers.mjs`, BelowNormal, one process, then gone). Everything else is plain node and a small software rasteriser: no browser, no Edge, no relay. Line numbers below are for `artifacts/V1/index.html` at that tip; the cloud session that owns v3 will move them.

The owner's words this answers (2026-11-02, `owner-decisions.md`): "A fixed set of moons per size" (8), "I shortlist, you veto" and "make it 16 moons. more variation." (10), "Side by side for a while" (11). Where `v4-spec.md` says "seeded per match" or "the host sends the plan (2-3 KB)", this file replaces it: the host sends a moon number.

---

## 0. The short version

- **What the fixed set is.** A table of 14 sizes x 16 planner seeds (224 integers) and the plan's hash for each, plus one version tag. About 5 KB in `index.html` (`moon-table-standin-literal.txt` is the real thing for the stand-in planner, 4,921 bytes). The planner (`mcPlan`), its room table, its score and its disc numbers are **frozen** at the tag; the pieces (`mcBuild`) are not, because the plan is the contract, not the pieces.
- **How the 16 are chosen.** For each size, 600 candidate seeds; keep those that pass the plan score and the hard rules; take the best-scoring one; then keep adding the candidate whose nearest chosen moon is farthest (greedy farthest-point) while no two moons are closer than 0.30 on a plan-to-plan distance (rooms in order with their six axes, the cast, the district shapes, the passage mix). Sizes that share a disc are chosen together so all their moons differ. On the paper planner **all 14 sizes fill 16 at 0.30 and pass acceptance lines A1-A4** (section 2.5; A5 flags three weak rows).
- **What it buys, in numbers (stand-in).** Nearest pair of the 16: **0.32 / 0.50 / 0.53** at 4 / 10 / 15 a side, against **0.18 / 0.31 / 0.36** for 16 random passing plans. A random set of 16 holds a near-twin pair (under 0.20) **68% / 3% / 0%** of the time at 4 / 10 / 15; the curated set never does. Set diversity score **79.6 / 93.8 / 97.7** against **65.6 / 80.3 / 87.8** random. Curation matters most at 2-6 a side, where a random 16 is likely to hold a twin.
- **How a match picks one.** The host draws a number 0-15 at Start (never the one just played) and the number rides in the start message and in the geometry message with the tag. The guest rebuilds from its own table, checks the plan hash and the piece hash, and **leaves the room with a message** on any mismatch (v3 only warns). The moon id `10-07` is never drawn in a match; it is printed in the dev dump and written into the match record, the NaN log and the replay file's name.
- **The owner's pack.** Three sheets (4, 10, 15 a side, 16 renders each, numbered): `curate-sheet-4.png`, `-10.png`, `-15.png`. To veto, the owner names an id; one command re-runs the farthest-point step for that slot only and the sheet marks the new moon NEW.
- **The stage entry.** 21 places (section 5): 10 need a line of code, 11 follow for free because the new stage is `layout:"disc"`, `teamsOnly`, `secret:"one"` like v3. There is **no stage picture** on the select screen to copy: the stage card is a name and a line of text.

**What I found that the lead must decide (details in the sections named):**

1. **Map Size changes the disc.** Compact (0.85) and Huge (1.4) change the radius and the number of caves (4 a side: 3 caves at Compact, 4 at Normal, 6 at Huge). A 16-moon table is for one disc. Recommendation: v4 ignores Map Size (section 3.6, question 1).
2. **A guest builds its own disc before the host's message arrives, and v3's `mcNetGeo` keeps whatever is built.** With one moon per size that is harmless; with 16 it would put a guest on a different moon from the host. v4 needs the pick in the start message and the moon number in the "built already" test (section 3.5). This is the most likely place to ship a bug.
3. **Six of the 14 rows cannot be reached from today's lobby.** Teams counts are 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 30, which are 2, 3, 4, 5, 6, 8, 10 and 15 a side; 7, 9, 11, 12, 13 and 14 a side do not exist. Build all 14 (it is data), review the reachable ones (section 3.1).
4. **2 to 5 a side are one disc** (also 1 a side and 2v1, 3v2). Their 64 moons are kept mutually different; nearest pair across them 0.32.
5. **The paper planner has four weak spots to fix before the freeze** (section 2.7): only 6 district-shape patterns exist, the 16 moons share most of their rooms (9 of 21 kinds are in every moon at 10 a side), the furnace and the surface differ least from moon to moon (furnace 0.25-0.27 at 4 and 15 a side against 0.68-0.80 for the caves), and 2-6 a side have only 6 possible casts.
6. **When to freeze.** Not at V0. A table frozen before the room library is final means any later cut (the five least-different rooms are the owner's own first cuts, `owner-decisions.md` row 2) changes all 224 moons and the owner's vetoes with them. Show a **preview table at V0**; freeze at the end of V6 (section 2.9).

---

## 1. What I read and ran

Read: `owner-decisions.md` (it wins), `v4-spec.md`, skimmed `library-1.md`, `library-2.md` and `why-samey.md` for anything that touches curation (nothing contradicts this file), `plan-sampler.mjs` in full, `mcGen` and everything around it in `index.html`, and every site that mentions `MCAVE`, `mcGeoOut`, `mcNetGeo`, `layout === 'disc'`, `stageOpen`, `stagesOpen`, the stage cards, the lobby's stage picker, the start message and the match records.

Ran (all in `v4-spec-tools/`, one node process at a time, BelowNormal, a few seconds each):

| Tool | What it is |
|---|---|
| `dump-disc-headers.mjs` | (jsdom, once) `mcGen`'s disc header for N = 2..30 fighters at the three Map Size factors the disc reads (0.85, 1.0, 1.4): radii, layers, cracks, v3's piece hash. Output `discs-headers-N2-30.json` (87 rows). For 2, 4, 7, 10 and 15 a side its radii, caves, floor tops and crust match the older `discs-mcGen-v3.json`. |
| `curate-sampler.mjs` | The curation (sections 2 and 3). Reads the stand-in planner `plan-sampler.mjs` **as text**, cuts its own sweeps, patches in each room's position in memory, imports it. The file on disk is untouched; `--check` proves the patch changes none of 840 plans. |
| `curate-sheet.mjs` | The owner's pictures (section 4). |
| outputs | `curate-results-standin.txt` (the run), `moon-table-standin.json`, `moon-table-standin-literal.txt` (the literal that would sit in `index.html`). |

The stand-in is a paper planner (greedy, 20 rooms, no natural-room family, floats where the real one will be integers). **Its table is a rehearsal, not the table.** The real table is made by the same tool against the real `mcPlan` once V0 exists; only `loadPlanner` changes (section 2.8).

---

## 2. The curation method

### 2.1 The steps, for one size

1. **Disc.** The disc for a size is `mcGen`'s at N = 2 x side, k = 1 (section 3.1). Only its header goes to the planner: `K`, `tops`, `crustBot`.
2. **Candidates.** 600 planner seeds, `side x 10000 + 1 .. + 600`, **one try each, no retry**. (A seed names its size: 4-a-side seeds are 40001-40600. Retries are for matches that have no table; the table keeps the *accepted* seed.)
3. **Gate 1: the plan score and the hard rules** of `v4-spec.md` section 5.2 (score at least 85 and no hard rule failed). 49% to 86% of candidates pass at one try (stand-in: 81% at 4 a side, 68% at 10, 70% at 15).
4. **Gate 2: the curation gate**, score at least 90. On the stand-in it removes 0 to 3 plans a size (almost every passing plan scores 90 or more), so it is a floor, not a filter. If fewer than 48 plans clear it the tool uses every passing plan and says so.
5. **Choose 16 by farthest point** (2.4), with the minimum pairwise distance 0.30.
6. **Score the set** (2.3), compare with 16 random passing plans (300 draws) and with the 16 best-scoring plans, and print the acceptance lines (2.5).

### 2.2 The plan-to-plan distance D (0 = the same moon, 1 = nothing in common)

`D = 0.55 Droom + 0.20 Dcast + 0.15 Dshape + 0.10 Dlink`

| Part | Definition |
|---|---|
| **Droom** (room-kind sequence and the six axes) | For each chain (a district's north quarter, its south quarter; rooms in order from the pole to the strip) a weighted edit distance between the two moons' room lists. Insert or delete a room: 1. Swap for a room of **the same kind**: 0 to 0.3 by how different the widths are (0.3 at a factor of 2 or more), plus 0.1 if one is only a hall's upper part. Swap for a room of **another kind**: 0.45 + 0.55 x (axes that differ, of orientation, openness, height class, width class, verb, footing) / 6. Chain costs are added and divided by the added lengths of the longer lists, so districts with more rooms weigh more. |
| **Dcast** | Share of the caves whose kind differs, depth by depth. |
| **Dshape** | Share of the caves whose graph shape (LAP, SPLIT, BRAID, FAN) differs. |
| **Dlink** | Half the L1 distance between the two moons' passage-type mixes. |

**What a number means** (`node curate-sampler.mjs --calib`, stand-in plans that pass):

| | 4 a side | 10 | 15 |
|---|---|---|---|
| two random passing plans: 5th percentile / median / 95th | 0.29 / 0.46 / 0.57 | 0.40 / 0.55 / 0.65 | 0.45 / 0.58 / 0.66 |
| two plans with the **same cast**: median | 0.40 | 0.43 | 0.42 |
| the same plan with **one room swapped** for another kind | 0.03 | 0.02 | 0.01 |
| the same rooms, **every district's shape changed** | 0.15 | 0.15 | 0.15 |

So 0.30 is "about 9 of 14 rooms are different, or fewer plus a different cast and shapes": more than a different cast on the same rooms, far more than a swapped room. A pair under 0.20 is what I call a **twin** (it differs by roughly 6 rooms or fewer).

The weights are mine and provisional. They put the room list first because that is what a player walks; they keep the cast and the shapes because they set the footing and the graph. They are constants at the top of `curate-sampler.mjs` (`W`).

### 2.3 The set diversity score (0 to 100)

How far apart the 16 are as a set, not how good each is:

`35% nearest pair / 0.45` + `35% mean pairwise D / 0.65` + `15% room kinds met / 17` + `15% distinct casts / min(16, casts the disc can make)`, each part capped at 1.

The targets are set so that 16 random passing plans score clearly below the curated 16 at **every** size (calibrated on the stand-in, so provisional like the screen check's lines in `v4-spec.md` 5.5; re-set on the real planner). A small disc caps its own score: 2-6 a side can make only 6 casts, so 80 is what curation reaches there and 91 at 6-8 a side, 94-98 from 9 up.

### 2.4 Choosing: greedy farthest-point, shared discs, the floor

- **First moon:** the best-scoring plan (ties: the lower seed), unless it is a near-twin of a moon already taken for another size on the same disc.
- **Each next moon:** the candidate whose nearest chosen plan is farthest away (ties: the better score, then the lower seed). Deterministic: the same inputs give the same 16.
- **The minimum 0.30.** If the best candidate is nearer than the current minimum the minimum is lowered by 0.02 at a time, to a floor of 0.22. Below the floor the size is **THIN** and the tool stops.
- **Sizes on one disc (2, 3, 4, 5 a side) are chosen together,** one moon each in turn (the starting size rotates), each kept away from the others' moons, so none is left the scraps. Done one size after another the nearest pairs were 0.41, 0.35, 0.34 and 0.34 (the first size took the best of the disc); together they are 0.34, 0.33, 0.32 and 0.34, and the nearest pair across all 64 is 0.32.

**If a size cannot fill 16 (THIN), in this order, and never skip a step:**

1. Widen the pool, `--cands 1200`, then `2400` (a seed is cheap: 0.3 to 0.5 ms a plan on the stand-in; seeds stay under 10000 a size). Same gates, same minimum.
2. Look for the cause in the planner, not in the minimum: a size is THIN because the planner cannot make 16 different moons for that disc (few casts, few shape patterns, a short menu). Fix it **before the freeze** (2.7) and run again.
3. If it is still short, show the owner the size with the moons it has and the numbers, and let the owner choose: fewer moons for that size (a table row may be shorter than 16; the pick uses the row's length), or a lower floor.
4. **Never** fill a slot with a near-twin, never lower the plan-score gate, never loosen a hard rule (rule 10 of `v4-spec.md`). The tool does none of these by itself; the gate is a flag and lowering it is the director's and the owner's decision.

I stress-tested the ladder (the THIN column of the tool's table). The **shared disc is what binds**: 64 moons on the 2-5-a-side disc cannot be spread much beyond 0.32. With the minimum at 0.40 and the floor at 0.36 each of 2, 3, 4 and 5 stops at 8 or 9 moons (THIN); at 0.45 / 0.40 at 5 or 6; at 0.50 / 0.45 at 2 or 3, and size 6 stops at 10 and size 7 at 15. Sizes 8 and up fill 16 at 0.50. So 0.30 is not slack: it leaves 0.02 of headroom on the disc that most players use, and a harder minimum needs a planner that makes more different moons, not a lower floor.

### 2.5 The numbers

All 14 sizes (stand-in planner, 600 candidates each, minimum 0.30, 300 random draws; `curate-results-standin.txt` has the full lines):

| Side | Caves | Pass (of 600) | The 16: score min / mean | Nearest pair / mean / farthest | Casts met (of possible) | Set score | Random 16: nearest / mean, set score, P(twin) | Best-16-by-score: nearest, set score |
|---|---|---|---|---|---|---|---|---|
| 2 | 4 | 485 | 91.1 / 95.3 | 0.34 / 0.48 / 0.60 | 6 of 6 | 80.7 | 0.17 / 0.44, 64.5, 68% | 0.15, 61.2 |
| 3 | 4 | 475 | 92.4 / 96.6 | 0.33 / 0.48 / 0.60 | 6 of 6 | 80.2 | 0.17 / 0.44, 64.1, 71% | 0.05, 47.6 |
| **4** | 4 | 486 | 92.3 / 96.5 | **0.32 / 0.47 / 0.61** | 6 of 6 | **79.6** | **0.18 / 0.45, 65.6, 68%** | 0.08, 56.7 |
| 5 | 4 | 485 | 90.8 / 95.8 | 0.34 / 0.48 / 0.60 | 6 of 6 | 80.8 | 0.17 / 0.44, 64.0, 73% | 0.05, 49.2 |
| 6 | 4 | 514 | 91.1 / 97.6 | 0.43 / 0.51 / 0.64 | 6 of 6 | 91.1 | 0.22 / 0.45, 68.6, 32% | 0.14, 63.0 |
| 7 | 5 | 292 | 92.5 / 96.8 | 0.45 / 0.55 / 0.66 | 12 of 26 | 90.8 | 0.23 / 0.50, 69.9, 28% | 0.23, 68.4 |
| 8 | 5 | 453 | 93.1 / 96.2 | 0.47 / 0.56 / 0.67 | 12 of 26 | 91.6 | 0.25 / 0.51, 72.4, 14% | 0.24, 71.7 |
| 9 | 6 | 397 | 93.1 / 96.7 | 0.49 / 0.58 / 0.73 | 16 of 79 | 96.5 | 0.29 / 0.54, 79.1, 5% | 0.21, 69.8 |
| **10** | 6 | 408 | 91.7 / 96.8 | **0.50 / 0.59 / 0.71** | 13 of 79 | **93.8** | **0.31 / 0.54, 80.3, 3%** | 0.18, 66.9 |
| 11 | 6 | 461 | 91.4 / 96.1 | 0.50 / 0.59 / 0.70 | 14 of 79 | 95.0 | 0.32 / 0.55, 81.6, 0% | 0.18, 66.9 |
| 12 | 7 | 360 | 93.0 / 96.7 | 0.52 / 0.61 / 0.73 | 16 of 148 | 97.6 | 0.32 / 0.56, 84.1, 2% | 0.32, 81.8 |
| 13 | 7 | 417 | 93.3 / 96.5 | 0.52 / 0.61 / 0.72 | 16 of 148 | 97.7 | 0.35 / 0.57, 86.1, 1% | 0.26, 75.9 |
| 14 | 7 | 433 | 92.7 / 97.4 | 0.53 / 0.62 / 0.72 | 16 of 148 | 98.2 | 0.36 / 0.57, 87.2, 1% | 0.14, 70.9 |
| **15** | 8 | 421 | 93.4 / 96.9 | **0.53 / 0.61 / 0.70** | 16 of 187 | **97.7** | **0.36 / 0.57, 87.8, 0%** | 0.41, 89.9 |

(Side 6 is a different disc from 2-5 although it also has 4 caves; 2-5 are one disc.)

**Acceptance** (printed by the tool; lines are provisional): A1 sixteen moons; A2 every moon passes the score, the hard rules and the gate; A3 nearest pair at least 0.30 in the size and across a shared disc; A4 set score at least 8 points above the random mean; A5 every district's mean room distance at least 0.35 (reported, not gating). **All 14 sizes pass A1-A4.** A5 flags the furnace at 2-5 a side (0.17-0.27) and the surface and furnace at 15 a side (0.34, 0.25).

**Reading the table honestly.** The best-16-by-score row is the answer to "why not just take the 16 best plans": the score does not ask moons to differ, and at 2-5 a side that set holds twins (nearest 0.05-0.08). The random row is the answer to "why not just draw 16": at 2-6 a side a random draw holds a twin about two times in three. From 9 a side up randomness alone mostly gets there, and curation lifts the nearest pair from about 0.3 to above 0.5.

### 2.6 What the 16 at 4, 10 and 15 look like

`curate-sheet-4.png`, `-10.png`, `-15.png` (section 4). One example from the 10-a-side run: moon 10-01 is galleries, springs, columns, mines, tunnels, furnace with shapes FBSLFB; 10-02 is galleries, updrafts, flooded, columns, tunnels, furnace with SFBLSF; their nearest other moons are 0.50 away. At 4 a side the 16 differ in the one middle cave (6 casts), the shapes and the rooms; three of the four rows below the surface are the same kind in every moon (galleries first, tunnels, furnace), so the sheet at 4 a side looks more alike than the one at 15, and no curation can change that: it is the cast rule the owner chose (`owner-decisions.md` row 5).

### 2.7 Where the sameness hides, and what to fix before the freeze

Measured on the 16 at each size (`curate-sampler.mjs` detail lines):

| Mean room distance between two moons of the set, by district | surface | first cave | middle caves | tunnels | furnace |
|---|---|---|---|---|---|
| 4 a side | 0.47 | 0.71 | 0.76 | 0.73 | **0.27** |
| 10 a side | 0.41 | 0.73 | 0.77 | 0.75 | 0.68 |
| 15 a side | **0.34** | 0.77 | 0.80 | 0.76 | **0.25** |

Room kinds present in **all 16** moons: at 4 a side Hot Plates, Span, Attic, Crater, Flat; at 10 a side Span, Attic, Chimney, Crawl, Geode, Chute, Crater, Grand Stair, Flat (9 of 21); at 15 a side 11 of 21. Present in 4 or fewer: Sinkhole, Aerie, Headframe, Teeth, Long Ramp at 10 a side. So **the 16 moons are different arrangements of mostly the same rooms**. That is what a library of 20 gives; a player will meet the same Crawl in every moon. Four things to fix in the real planner **before** the table is frozen (afterwards they cannot be, without a new tag and a new review):

1. **Shape patterns.** The stand-in cycles four shapes with LAP last, which allows only **6 sequences** whatever the size (16 moons share 6 patterns). Rule 7 only needs "neighbours differ, the first cave is not LAP, at least one cave is LAP": that allows hundreds of sequences. Draw one of them by seed.
2. **The furnace and the surface menus.** Furnace: three kinds (Hot Plates, Span, Attic) plus a few "okay" ones; surface: poles fixed (Crater, Flat), the rest from three. Widen them (the natural-room family of owner answers 5 and 9 is the obvious source) or the furnace will look the same in every moon.
3. **Vocabulary.** Add a set rule, to be measured by `setDetail` in the tool: no room kind in more than 12 of 16 moons except the obligations (Crater, Flat, the squeeze), and each moon omits at least 4 kinds that other moons have.
4. **2-6 a side (K = 4): 6 casts.** Three of four caves are fixed. This is the owner's cast rule; the consequence is worth telling the owner: the five most-played sizes can differ only in the middle cave, the shapes and the rooms. (Optional: let K = 4 drop the tunnels-over-furnace obligation, 30 casts instead of 6. That changes an answer the owner gave, so it is a question, not a fix.)

The natural-room family is not in the stand-in. When it exists the distance gets a seventh axis, **make** (built or natural), and its `roomCost` uses it; deeper caves should then differ more than the numbers above say. Re-measure.

### 2.8 What the numbers do and do not prove

They prove the **method**: the gates pass, the greedy fills 16 at a distance the random draw only reaches by luck, the shared-disc groups stay apart, a veto swaps exactly one slot (checked: vetoing 4-07 and 10-03 changed only those two seeds in 224), and the tool runs in 12-18 s for all 14 sizes.

They do **not** prove the moons are good to play. They are plans from a paper planner with no natural rooms and floats; distances are on plans, not on what the player sees. Two follow-ups, both part of the real run: **the screen check of `v4-spec.md` 5.3 on the real geometry of every table moon** (V1 onward; a moon that fails is replaced like a vetoed one), and re-setting the weights, the 0.30 and the set-score targets on the real planner's numbers (if the reference fails the director revises the measure, not the planner, as in the spec).

**The plan record contract** (what a real `mcPlan` must expose, e.g. through `mcPlanDump()`, so this tool and the sheet run on it unchanged): `K`, `kinds[]` (surface first), `shapes[]` (surface first), `rooms[]` each with `arch`, `orient`, `open`, `hc`, `wc`, `verb`, `foot`, `w`, `h`, `c` (district), `q` (0 north quarter, 1 south), `claimed` (a hall's upper part), `u0`, `u1` (radians from the chain's pole), and `links[]` each with `type`, `c`, `lat`; plus a score (`S`, `out`, `hard[]`). The adapter is `loadPlanner()` in `curate-sampler.mjs`: it returns `{ samplePlan(g, seed), score(P, side) }`. For the real planner it boots the monolith in jsdom (as `dump-disc-headers.mjs` does) and calls the pure functions. Because `mcPlan` is integer-only the numbers do not depend on the machine.

### 2.9 When to run it, and when to freeze

| Moment | What | Binding? |
|---|---|---|
| **V0** (plan only) | Run on the real `mcPlan`. The owner sees the 3 sheets as a **preview** of what the planner gives, next to the V0 contact sheet. Tag `p0`. | No. The owner's vetoes here tell the lead about taste (what they dislike), not about slots. |
| Planner changes V1-V6 | Rooms get cut or added, the natural family lands, the cast and passage rules are enforced. Each change is free: no table is frozen. | No |
| **End of V6** (cast, identities, scenery) | The planner, room table, score and disc numbers are final. Run the tool, the lead checks the 11 sheets nobody sees by the acceptance lines, the owner reviews the 3 sheets and vetoes. **Freeze: tag `p1`.** | **Yes** |
| V7 onward | Online carries `{tag, size, number}`. V8's CPU findings fix the router and builder, never the plan; a room that proves unplayable is fixed in `mcBuild` where possible. | A plan change from here is `p2`: a new table, a new review. |
| V9 | The owner plays on the switch; the flip. | |

Why V6 and not V0: `owner-decisions.md` row 2 names five rooms to cut first if they prove weak. A cut after the freeze changes every moon that held one, and since the planner draws from one stream of random numbers a cut changes **every plan from every seed**, so it is all 224, not some. The tool re-runs in seconds, but the owner's review is the scarce thing; ask for it once.

---

## 3. The seed table and how a match uses it

### 3.1 Keys: size, disc, number

- **Key by `side = max(2, ceil(N / 2))`**, N the number of fighters (`SETTINGS.count`), and build on the disc of N' = 2 x side. For every count the lobby offers this is the very disc `mcGen(N)` makes today (N = 3 and 5, 2v1 and 3v2, make the same disc as 4 and 6; 1v1 uses the 2-a-side row).
- **Rows 2 to 15, 14 rows.** Reachable from today's lobby: **2, 3, 4, 5, 6, 8, 10, 15** (counts 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 30). Not reachable: 7, 9, 11, 12, 13, 14 a side. Recommendation: build all 14 (a row is 16 pairs of numbers; S2's sweep covers sizes 2 to 15; the lobby may one day offer 7 or 12 a side), but the owner reviews the reachable rows only, and the lead accepts the others by the acceptance lines.
- **Discs.** Sides 2-5 one disc (K 4, radius 2,550); 6: K 4, 2,771; 7: K 5, 2,993; 8: K 5, 3,200 (six cracks from here); 9: K 6; 10: K 6, 3,578; 11: K 6; 12: K 7; 13: K 7; 14: K 7; 15: K 8, 4,382.
- **v4 owns its disc numbers.** The planner reads a frozen copy `MC4_DISC` of the size numbers of `MC_GEN` (`perFighter`, `rMin`, `rMax`, `crust`, `floors`, `innerMin`, `head`, the cave order and rank), taken at V0; it never reads `MC_GEN`. A tweak of v3's numbers by the cloud session must not reach v4 (section 6, risk 5).

### 3.2 The table, as it will sit in `index.html`

Beside `MC_GEN`, in one block with a banner, 14 rows of 16 `[seed, plan hash]` (the real file is `moon-table-standin-literal.txt`; the tag there is `p0-standin`):

```js
// MOON CAVES v4: the fixed moons. FROZEN with the planner: a changed number here, or any change to mc4Plan, the room table, the score or MC4_DISC, is a new tag.
const MC4_TAG = 'p1';
const MC4_MOONS = {   // players a side: the 16 moons, [planner seed, hash of the plan it makes]; the moon's id is side-number: '4-01' is MC4_MOONS[4][0]
  2:[[20008,'e9a157d2'],[20032,'7cf4d98d'],[20489,'12fb93ee'], ... 16 pairs],
  ...
  15:[[150063,'de3ecc3d'],[150263,'231364d5'], ... 16 pairs],
};
const MC4_SUM = 'c5713094';   // FNV-1a of the tag and the two numbers of every moon: checked once at boot in a dev build
```

- **A seed names its size** (`Math.floor(seed / 10000) === side`: a sanity check at boot, so a row pasted into the wrong place is caught).
- **The moon number** is the slot, 1 to 16 for people (`4-07`), 0 to 15 in code and on the wire. **Slots are stable:** a veto replaces the seed in a slot; the other 15 keep theirs.
- **The plan hash** is FNV-1a over the integers of the plan (rooms in order with district, quarter, kind, width, height, hall flag; links; cast; shapes). It is what turns a silent drift into a loud one (risk 2).
- **Size:** 4.9 KB with the hashes, 1.6 KB without. 224 plans rebuilt cost about 0.1 s on the stand-in (0.3-0.5 ms each), so the boot check runs in a dev build and the first v4 match builds only its own moon.

### 3.3 What "frozen" covers

| Frozen at the tag (a change is `p2`, a new table, a new review) | Free to change (the table does not move) |
|---|---|
| `mc4Plan` and everything it calls, its random-number stream | `mc4Build`: how a plan becomes pieces (a plank 4 px higher, a bug in a ramp) |
| the room table (20 rooms or fewer: the axes, size ranges, kind affinity) | the router, the CPU, the drawing, the scenery |
| the plan score, the hard rules, the gate numbers | the lobby, the stage text |
| `MC4_DISC` | the owner-facing pictures |
| `MC4_MOONS`, `MC4_TAG` | |

A builder change moves the piece hash `h` on the wire (host and guest run the same build, so they agree) and nothing in the table. A bug report is `build id + moon id + tag`; old planners live in git, not in the file.

### 3.4 How a match picks one of the 16

`mc4PickMoon(side)`, modelled on `ctfPickMap` (line 6651, the same shape for Capture the Flag maps: a guest's `CTF.netMap`, a dev `CTF.forceMap`, the player's pick, else random with `CTF.lastMap` not repeated):

1. a guest: the host's number (`MC4.netMoon`, set by `beginMatch` from `settings.moon`, consumed once);
2. dev: `localStorage['bfsi:mc4moon']` = 1 to 16 forces a moon (the lead's pane pictures and every milestone check need this);
3. otherwise the host draws `Math.floor(Math.random() * 16)` and, if it equals `MC4.last[side]`, draws another. `MC4.last` is a plain variable, not saved.

The draw is at Start, outside the pure part of `setupWorld`. **The host draws it in `startAsHost` and puts it in the start message** (`settings.moon`, beside `settings.ctfMap` at line 84690), so every device builds that moon from the first frame; solo draws in `buildMoonCaves` the same way `ctfBuildWorld` draws its map. **Rematch** draws a new moon (never the same). **R mid-match** is "the same fight from the top" (the comment in `startMatch`, line 18348; the key handler is at 17747): I suggest it keeps the moon (the handler sets `MC4.again = true` before it calls `startMatch`); this is small and the owner may prefer the other way (question 2).

Optional and off by default: a host-only lobby row "Moon: Random / 1 to 16", so people can learn and name the moons (the reason the owner gave for a fixed set in the spec's Q8). Not needed for the build.

### 3.5 Online: what the guest needs

**Start message:** `settings.moon` (an integer 0-15) for a v4 stage; validated like every peer-supplied field in `beginMatch` (line 84702).

**Geometry message** (`worldGeo`, every 3 s and with the first snapshot of a match: `netViewReset` clears `_geoKey`, line 83755): v3 sends `moon:{N, k, n, h}` from `mcGeoOut` (line 3524). v4 sends, only when v4 is on, `moon:{ v:4, t:'p1', s:10, m:6, n:<piece count>, h:<piece hash> }` (about 60 bytes; the stage id is already in every snapshot as `s.stage`). **v3's message stays byte-for-byte as it is** (S1). If the owner keeps Map Size (question 1) `k` is added.

**Guest, in order** (`mcNetGeo`, line 3525):

1. `m.v === 4`: validate `s` in 2..15 and `m` in 0..15 (peer-supplied, like N and k there now).
2. **Tag:** `m.t === MC4_TAG`, else refuse.
3. **"Built already" test** includes the version and the moon: today it is `MCAVE.N === N && MCAVE.k === k` (line 3529) and returns without checking anything else. For v4 it must read `MCAVE.v === 4 && MCAVE.moon.s === s && MCAVE.moon.m === m && MCAVE.moon.tag === t`, otherwise a rematch on the same size but another moon would leave the guest on the last moon.
4. Rebuild the plan from its own table; its hash must equal the table's hash for that slot (a guest whose table or planner drifted refuses here, on integers, exactly).
5. Build the pieces; the count and hash must equal `n` and `h`.
6. **Any failure refuses cleanly:** `NET.dropped("Left the room: this moon was built differently on the host (Moon Caves v4, moon 10-07). Refresh the page (F5), and ask the host to as well.")`, the same exit a failed build check uses at start (lines 84245 and 84308). v3 only logs a console warning at line 3531; for v4 a silent difference would put two players on different floors.

Piece-hash false alarms from floating-point differences between browsers are negligible: the hash rounds angles at 1e-5 rad and an engine's `sin`/`cos` differs by about 1e-16, so a flip needs a value within 1e-16 of a rounding edge (about 1e-11 a value).

**The host's own check:** it rebuilds the plan from the table and compares the plan hash. A mismatch in a dev build throws loudly; in a release it falls back to v3's moon for that match (the spec's fallback) and the geometry message then carries v3's `{N, k, n, h}`, so guests build v3 too.

**What the guest's own `setupWorld` does.** `beginMatchNow` runs `setupWorld()` on host and guest alike (line 20931), and `buildMoonCaves` (line 3428) builds a disc from the guest's own settings before any snapshot arrives. For v3 that disc is the host's by construction. For v4 it is the host's only because `settings.moon` reached `beginMatch` first. Both the start-message number **and** the early-return fix above are required; either alone leaves a window.

**`worldGeoKey`** (line 83229) should add the moon id so a changed moon re-sends at once even without a new start: `+ (MCAVE && MCAVE.on && MCAVE.moon ? ':' + MCAVE.moon.id : '')`. Belt and braces; `netViewReset` already forces a send at a new match.

### 3.6 Map Size (needs an answer)

`mcGen(N, k)` multiplies the radius by `k = mapSize().w` and the number of caves follows the radius: Compact 0.85, Normal 1.0, **Tall 1.0**, Huge 1.4. At N = 20: Compact K 5 (radius 3,041), Normal K 6 (3,578), Huge K 9 (5,009); at N = 4 or 8: K 3, 4, 6. A table of 16 is for one disc. Options:

| | What | Cost |
|---|---|---|
| **A. v4 ignores Map Size** (recommended) | v4 always builds the Normal disc; the lobby's Map Size row stays but does nothing on this stage (greyed in the lobby and the select screen if the owner wants it shown). One fixed set, one disc, one review. | v3 keeps the Map Size effect; v4 loses it |
| B. Keep it, curated at Normal only | Compact and Huge run the same seeds on the other discs, uncurated, gated by the score and the hard rules, with a fallback to the Normal moon if the gate fails. | Two more discs to check, and the owner has not seen those moons |
| C. A table per Map Size | 3 x 224 = 672 moons, 3 reviews | No |

### 3.7 The moon id: where it is carried

Never drawn in a match (the no-words rule). Carried in:

- `mcPlanDump()` (dev): one line, `Moon Caves v4 moon 10-07 @p1 seed 100171 plan 4f2a9c01 score 97.1 cast gal-spr-col-ice-tun-fur`, plus the plan JSON; also printed to the console once when a v4 moon is built;
- the **match record** (`recordMatch`, line 68109: `rec.moon = '10-07@p1'`, absent for v3, so v3's records do not change);
- the **NaN log** row (`nanNote`, line 45601: it already has `moon:` as a flag; make it the id);
- the **replay**: the post-match video and GIF are canvas captures with no text in them, so the carrier is the **download name**: `bfsi-match.webm` (line 20331) and `bfsi-clip.gif` (line 20489) become `bfsi-match-moon-10-07.webm` and `bfsi-clip-moon-10-07.gif` for v4 only;
- optionally the **result screen's** line (lines 68664-68665, "Team 1 takes Moon Caves v4 (moon 10-07)"), which is not a match and is how a player can name a moon in a bug report (question 3).

---

## 4. The owner's review pack

**What the owner sees:** three PNGs, one per size, 4 x 4 renders each (48 in all), `curate-sheet-4.png` (1646 x 1006), `-10.png` (1646 x 1134), `-15.png` (1646 x 1310). Each render is one moon:

- its **number** in large digits (the thing to name), its id, the plan score, the rooms a half, and **the nearest other moon and how far** ("NEAREST 16 (.50)");
- **left, the moon from above:** one ring per district coloured by kind, the rooms of the right half and, mirrored, of the left half drawn as bright arcs, the two homes as blue and red ticks;
- **right, the right half unrolled:** 12 o'clock at the left edge, the home (a red band) in the middle, 6 o'clock at the right edge, the surface on the top row and the furnace on the bottom; every room a box in its district's colour with a two-letter code (CA Cathedral, CR Crawl and so on, legend at the foot); a hall's upper part pale; a letter at each end of a row for its kind and its graph shape;
- the head of each sheet says how the 16 were chosen and the set numbers (nearest pair, mean, set score, room kinds).

**What the pack cannot show yet:** what a room is like to walk (V1 onward: the lead's pane pictures at 12, 3, 6 and 9 o'clock of a few moons per size). When `mcPlan` exists the V0 renders of `v4-spec.md` 5.4 (disc, unrolled, score card) become these thumbnails: same drawing, real plan.

**How the owner vetoes or swaps one:** by naming the id or the number: "swap 10-03 and 4-07". Then:

```
node curate-sampler.mjs --veto 10-03,4-07           # reads moon-table-standin.json, writes it back, keeps -before-veto.json
node curate-sheet.mjs --sizes 4,10 --prev moon-table-standin-before-veto.json
```

The tool keeps the other 15 moons of the size exactly (same numbers, same seeds), takes out the vetoed one **and every plan within 0.15 of it** (a veto says "not that sort of moon"), and re-runs the farthest-point step for the vacated slot against the other 15 (and against the other sizes on the same disc). The new moon takes the **same number**. The sheet marks it with a green NEW. Checked: vetoing 4-07 and 10-03 changed exactly those two slots (4-07: seed 40513 to 40048, nearest kept moon 0.37; 10-03: 100407 to 100581, 0.51).

**What the owner is asked to say:** yes, or the ids to swap, for the 3 sheets. Everything else (sizes 2, 3, 5, 6, 8 and the unreachable rows) the lead accepts by the acceptance lines and the owner can ask to see any of them (`--sizes 8`). After the freeze a swap is a new tag (risk 4).

---

## 5. The stage entry: every place that needs "Moon Caves v4" beside v3

Switch: `MC_V4`, the same two-switch pattern as `MCAVE_DEV` and `MCAVE_OPEN` (lines 2608 and 2612): `MC_V4_DEV` (`localStorage 'bfsi:mcv4dev' = '1'`, in a try/catch like its sibling) and `MC_V4_OPEN = false`; `MC_V4 = MC_V4_DEV || MC_V4_OPEN`. The switch hides the stage from the **host's lists** and nothing else: a guest finds the stage by id whatever its own switch says (the stage comment at line 3906 already says so), and a v4 stage that reaches `setupWorld` got there legitimately (the host's own list, or the host's start message).

The new stage: **id `mooncaves4`** (never reuse `mooncaves`: a saved or in-flight stage id must keep meaning v3), `name:"Moon Caves v4"`, `layout:"disc"`, `teamsOnly:true`, `secret:"one"`, `hazard:"lowgrav"`, `moonV:4`, `mcV4:true`, the same `sky`, `ground`, `plats:[]`.

### 5.1 Places that need a line (10, plus the new block)

| # | Place (line at `a316e32`) | What changes |
|---|---|---|
| 1 | **Switch constants**, beside `MCAVE_DEV` / `MCAVE_OPEN` (2608-2612) | add `MC_V4_DEV`, `MC_V4_OPEN = false`, `MC_V4` |
| 2 | **`STAGES`**, after the `mooncaves` row (3900-3902; the list's last row) | add the `mooncaves4` row. Order in the list is the order of the cards and of the lobby's drop-down. |
| 3 | **`stageOpen(s)`** (3907) | first test: `if(s && s.mcV4 && !MC_V4) return false;`. This is the **only** gate. `stagesOpen()`, `stageGuard()` (3911), `maxTeams()` (4007), the lobby and the cards all go through it. |
| 4 | **`buildMoonCaves()`** (3428) | `const g = stage.moonV === 4 ? mc4Build(side, MC4.pick(side)) : mcGen(SETTINGS.count, mapSize().w);` (and the same pick consumed once: `MC4.netMoon`). One line; the rest of the function is shared. |
| 5 | **`mcState(g)`** (3440) | carry `v: g.v \|\| 3` and `moon: g.moon` (`{id, s, m, tag}`; v3 leaves both unset). |
| 6 | **`mcGeoOut()`** (3524) | for v4 only, return `{v:4, t, s, m, n, h}`; v3 returns exactly `{N, k, n, h}` as now. |
| 7 | **`mcNetGeo(m)`** (3525-3534) | the v4 branch, the early-return test and the refusal of section 3.5. |
| 8 | **`worldGeoKey()`** (83229) | add the moon id (section 3.5). |
| 9 | **Start and match begin:** `startAsHost` (84688-84699) and `beginMatch` (84702) | `if(stage.moonV === 4) settings.moon = MC4.pick(side)` beside `settings.ctfMap` (84690); in `beginMatch` read it, validated, into `MC4.netMoon` (beside `CTF.netMap`, 84706). |
| 10 | **`recordMatch()`** (68109), **`nanNote()`** (45601), **the two download names** (20331, 20489) | carry the moon id (section 3.7); for v3 nothing changes. |

### 5.2 Places that follow without a change (check each once; all inherited from `layout:"disc"`, `teamsOnly`, `secret:"one"`)

| Place | Why nothing is needed |
|---|---|
| **`setupWorld()` (21432):** `if(SETTINGS.mode==='teams' && (MCAVE_DEV \|\| MCAVE_OPEN) && stage && stage.layout === 'disc')` | tests the layout, not the id; today's `MCAVE_OPEN` is true. (If v3 is ever hidden again by turning `MCAVE_OPEN` off, add `\|\| stage.moonV === 4` here; a one-word edit.) |
| **Unlock with The Moon** (`secret:"one"` in `stageOpen`) | the same test as v3: `oneUnlocked()` |
| **15 v 15** (`maxTeams`, 4007; `MAX_MOON = 30`, 4004; `countOptions`, 4015) | `st.layout === 'disc' && (stageOpen(st) \|\| inNetSession())`: v4 gets 30 when open, and a guest whose host picked v4 gets 30 whatever its own switch says |
| **Two sides only** (`teamSplitsFor`, 4033) | tests `stage.layout === 'disc'` |
| **Stage cards** (`buildStages`, 17614), **the stage button** (17637) | iterate `stagesOpen()`. **There is no picture:** a card is `<b>name</b><span>blurb</span>` (CSS at 365-369), and `STAGE_ART` (71399) has no entry for either Moon Caves, so nothing is drawn for the select screen to copy. The card text is the new row's `name` and `blurb`. If the owner wants a picture on cards that is a new feature for every stage, not part of this entry. |
| **The online lobby's picker** (84612-84614) and **its summary line** (`lobbySummaryText`, 83495) | iterate `stagesOpen()`; the summary reads `st.name` by id; a client finds the stage by id |
| **World Cup and Watch-AI pools** (17235, 18482, 19464) | filtered by `teamsOnly` |
| **The geometry message in general** (`worldGeo`, 83212) | already calls `mcGeoOut()` when `MCAVE.on` |
| **No words drawn in the match** | `stage.name` is used only on the select screen, the lobby, the result line and in `teamAiStageLabel()` (17976: its stripped, 24-character form, "Moon Caves v4", is fine) |
| **Replay and spectate** | the replay is a canvas recording (clip ring), no per-stage code; spectating after a KO is `mcWatching`/`mcWatch` (3084-3086, `mcNetCamera` 3537), which read `MCAVE` and nothing stage-specific |
| **The One reward card** (67676: the line "Moon Caves, for Teams" that follows the new-stage star, added when `MCAVE_OPEN`) | **do not add a v4 line** until the flip; then add one |

### 5.3 What the builder must give the shared code

`mc4Build` returns the same `g` object as `mcGen` (`N, k, Rout, K, tops, crustBot, shellTop, shellBot, Rb, rKill, WW, WH, cx, cy, segs, holes, zsegs, cracks, pads, zones, layers, hot`), so `mcState`, `mcLayerOf`, `mcGravAt`, `mcHotFloor`, the camera, the minimap and the decoration run unchanged; `layers[].kind` and `.low` still drive the look and the gravity. `holes` stay for the existing router until V1's room graph replaces it. This is the builder's contract in `v4-spec.md` V1, written here because the stage entry depends on it.

---

## 6. Risks

| # | Risk | Mitigation |
|---|---|---|
| 1 | **The seed table changes by accident** (a merge, a search and replace, a "tidy", the file's CRLF line ends, an agent re-running the tool without the owner) | The table lives in one banner block. `MC4_SUM` and the per-moon plan hash catch any changed number at boot in a dev build and when a moon is built. The tool never writes into the game: it writes `moon-table-*.json` and a `-literal.txt`, and a person pastes it (Python load/save only, with an asserted match count, as for every edit of this file). A pasted table is verified by its sum: the tool prints `MC4_SUM` in the literal, and the dev boot check recomputes it from what is in the file. Nothing is renumbered, ever. |
| 2 | **A planner change after the table is frozen**, including a one-character one (a loop order, one more random call, an axis edit in the room table, a changed constant) | The planner draws from one stream, so one change moves **all 224 moons silently**. The per-moon plan hash turns that into a loud failure at the first v4 match (dev: throws; release: falls back to v3's moon for that match and logs). The rule "any change to `mc4Plan`, the room table, the score, the gate numbers, `MC4_DISC` or the table is a new tag" is stated in the banner and enforced by the hash, not by memory. A plan-only review (the lead reads the diff of the frozen block) is part of every milestone after the freeze. |
| 3 | **The hash covers the plan, not the pieces** | By design: the builder may change (3.3). A builder change that breaks a room is caught by the standing checks S3 (mirror) and S4 (CPU navigation) and by V1+'s screen check, not by the table. |
| 4 | **The table in a bug report is ambiguous** (the table changes between builds; "moon 7" means different moons) | The id carries the tag (`10-07@p1`) and a report carries the build id. A slot swap after release is a new tag: slots are never reused within a tag. The id is not drawn in a match, so a player needs a line outside it: the result screen (question 3), or the replay file's name. |
| 5 | **The cloud session's changes to v3 leak into v4.** The owner works in cloud sessions and the job queue says the cloud owns Moon Caves; `mcGen`, `MC_GEN` and the whole v3 block are being edited there | (a) v4 reads a **frozen copy of the size numbers** (`MC4_DISC`), never `MC_GEN`, so a tweak of `head.galleries` cannot move a v4 moon. (b) v4's code is one contiguous block after `buildMoonCaves`; the v3 code is touched in the 10 one-line hooks of 5.1 only, each a call into the block, so a merge conflict is a one-line one. The hot spots: the end of `STAGES` (3898-3903), the one-liner `stageOpen` (3907), `setupWorld` (21432), `buildMoonCaves` (3428), `mcGeoOut`/`mcNetGeo` (3524-3534), all of which the v3 online and release work already touched. (c) Fetch origin and read `docs/LEDGER.md` before each milestone (the standing rule) and rebase before editing the one-liners. (d) **S1 ("v3 untouched") must compare with origin's v3, not a stored number:** today's v3 hashes at k = 1 (N = 2 to 10: 2489873238; 12: 880349847; 16: 1385851301; 20: 2440033852; 30: 62233849, all in `discs-headers-N2-30.json`) are valid for `a316e32` only and move legitimately whenever the cloud session changes v3. (e) The stage id stays `mooncaves4`; `mooncaves` keeps meaning v3. |
| 6 | **A guest on the wrong moon** (section 3.5: the guest's own `setupWorld`, v3's "built already" test) | Start-message number, the (v, moon, tag) test, the refusal. Checked by S5 with the in-memory host and guest pair (never the relay): host builds moon 6, the guest has built moon 11, a geometry message arrives, the guest ends on moon 6; and a tag mismatch refuses. |
| 7 | **Two guests and a host on one size but a table row of different length** (a short row after a THIN size) | The pick uses `row.length`, the wire carries the number, a number past the end of the guest's row refuses. |
| 8 | **Map Size** (3.6) | Option A, or a question to the owner before V0 ships. |
| 9 | **The set is not different enough on the real planner** (2.7: shapes, furnace, vocabulary) | The four fixes before the freeze, then the acceptance lines on the real planner; A5 is reported and becomes gating once the menus are widened. |
| 10 | **The review is skipped or rushed:** the table frozen on the lead's say alone | The tag is not set (`MC4_TAG` stays `p0`) until the owner says yes to the 3 sheets; `p0` moons print a console line "preview table". Memory's release check applies: read the plan before unhiding anything. |

---

## 7. Questions

1. **Map Size on Moon Caves v4.** (a) **v4 ignores it** (recommended): one fixed set means one fixed disc; Compact and Huge are only a v3 thing. (b) Keep it with uncurated moons on the other two discs. (c) A table per Map Size (672 moons). Needs the owner: it removes a setting from one stage.
2. **Rematch and R.** Rematch always draws a new moon, never the one just played (recommended). R mid-match: (a) **same moon** (recommended: "the same fight from the top") or (b) a new one.
3. **A line outside the match that names the moon.** (a) **A line on the result screen** ("Team 1 takes Moon Caves v4, moon 10-07"), so a player can say which moon in a bug report and learn to name them (recommended); the lobby row "Moon: Random / 1-16" later, if the owner wants to pick. (b) Nothing: the dev dump and the replay's file name only. Small UI, so inside the freeze.
4. **When to freeze the table.** (a) **After V6**, with the owner's review once (recommended, section 2.9). (b) At V0, accepting that any later room cut means a new table and a new review.
5. **Planner fixes before the freeze** (2.7): widen the district-shape patterns (no owner question: it follows rule 7), widen the furnace and surface menus, add the vocabulary rule. And the one that is the owner's: at 2-6 a side let the tunnels-over-furnace rule go so that two middle caves are drawn (30 casts instead of 6), or leave it and accept that those sizes differ in one cave plus rooms and shapes. Recommendation: leave it and tell the owner what they get.

---

## 8. Files

- This file: `reports/moon-caves-v4/curation-and-stage.md`.
- Pictures for the owner (stand-in planner, so a rehearsal): `reports/moon-caves-v4/curate-sheet-4.png`, `curate-sheet-10.png`, `curate-sheet-15.png`.
- Tools, `reports/moon-caves-v4/v4-spec-tools/`: `curate-sampler.mjs` (the curation, the table, the veto, `--calib`, `--check`), `curate-sheet.mjs` (the sheets), `dump-disc-headers.mjs` (jsdom, read-only, once), the inputs and outputs `discs-headers-N2-30.json`, `curate-results-standin.txt`, `moon-table-standin.json`, `moon-table-standin-literal.txt`. They read `plan-sampler.mjs` (the director's stand-in, unchanged) and `../why-samey-tools/lib.mjs` (the rasteriser).
- Run, from `v4-spec-tools/` (plain node; each a few seconds at BelowNormal):

```
node curate-sampler.mjs                      # all 14 sizes, detail for 4, 10, 15; writes moon-table-standin.json and -literal.txt
node curate-sampler.mjs --detail 7,8         # detail for other sizes
node curate-sampler.mjs --cands 1200         # a wider pool (the THIN ladder)
node curate-sampler.mjs --calib              # what a distance means
node curate-sampler.mjs --check              # the in-memory patch changes no plan
node curate-sampler.mjs --veto 10-03,4-07    # swap those slots only
node curate-sheet.mjs [--sizes 4,10,15] [--prev moon-table-standin-before-veto.json]
```

- Not done and said so: no real planner, no natural rooms, no geometry, no play, no CPU, no network. The line numbers will move; the hooks are named so they can be found again.
