# Rollback netcode for Smash Island: a study

2026-11-19, branch g-rollback. This is a study only: no game code was changed. The live relay was not touched or contacted, and no browser was used. Everything was measured in jsdom on this PC.

## The short answer

- **Determinism on one machine looks good.** (Across different browsers was not testable here.) On one machine, the game already plays the same match the same way when it gets the same inputs and the same random numbers. I checked this over 600 frames on Goiky (FFA, 4 CPUs, items on), and 6 more times inside the rewind test (section 3). Longer runs, Teams maps and CTF were started but **never finished** (see the end of section 1).
- **Rewinding works.** A save, restore and replay of the full state gave back the identical match, positions and full state alike, in 6 out of 6 tries. The catch: three kinds of hidden state had to be captured first. They're listed below.
- **Three things are not ready:**
  - The game has no single random-number source. Its sim code has about 650 Math.random call sites, and they all share one generator.
  - Saving the state the generic way is too slow: 6.5 ms per save on Goiky. A rollback needs a save every frame, and up to about 8 more during a rewind. A purpose-built save would have to get that under about 0.3 ms.
  - Some sim code reads the live keyboard or the newest network input instead of that frame's input. A replayed frame would get the wrong keys.
- **The cost is fine for small matches, not for the big ones.**
  - Normal stages with 4 fighters can afford about 8 frames of re-simulation per real frame.
  - The 8-fighter Teams maps can afford only 1-3 frames.
  - Capture the Flag can't afford any.
- **Recommended path:**
  - Rollback for normal stages, 2-4 players, first.
  - Keep today's host-authoritative mode (with guest prediction) for the big Teams maps, CTF and contests.
  - Keep host snapshots as the repair path when two machines disagree.
- **What no netcode can fix:** halfway around the planet, the speed of light alone costs about 100 ms each way. The real internet makes that 125-175 ms. Rollback hides it well with 2 players. With 8 players spread worldwide, someone is always far from someone else, and corrections will be visible.

## 1. How it was measured

Scripts are in `reports-archive/rollback-scripts/`. They run the real `artifacts/V1/index.html` in jsdom (Node's V8, the same JavaScript engine as Chrome, Edge and the Electron app). The setup:
- A seeded Math.random whose state can be saved and restored.
- A frame clock for performance.now and Date.now.
- A stub canvas.
- CPUs in every seat.
- Every top-level variable of the game (2,284 of them) hashed over everything it can reach. Functions, DOM and canvases are skipped.

The PC was heavily loaded by other jobs during the runs (CPU at 90-100% when I checked), and the scripts run at idle priority. So **the times are rough**. Means are more trustworthy than the worst cases, and one 42-minute "frame" (the process starved by other jobs) was thrown out.

Later in the evening my runs got almost no CPU at all: about 2 CPU-seconds in 2 hours, then 1 in nearly 3 hours. So these never finished:
- the rollback-loop test
- the Yoyle Needle and CTF save tests
- the longer determinism runs

They are marked "not measured" below.

## 2. Determinism

### Measured (same machine)

| Test | Result |
|---|---|
| Same seed, same setup, run twice (Goiky FFA 4, 600 frames) | Identical full state at every check (every 30 frames) |
| Yoyle Needle 4v4, Goiky over 3600 frames, CTF | **Not measured.** The runs were started but got almost no CPU (see section 1). |
| With drawing vs without | Drawing calls Math.random 0 times. It writes one field into the fighters (`_rigState`, an animation pose). Positions, damage and the RNG stayed identical. |
| Real clocks vs a fixed frame clock | Only the CPUs' looks (skins seeded from Date.now in `cpuLookSeed`; online they come from the host's start) and the loop's own clocks differed. Positions stayed identical. |
| Window size (1920x1080 vs 1100x720) | Different world. But that's only the headless path: in a real browser the world is always 1100x720 (`UI.real`, `LOGICAL_W/H`). Low risk; pin it for rollback anyway. |

Math.random calls per frame during step(), all seats CPUs: about 6.6-7.4 on 4-fighter stages, and 7-13 on 8-fighter Teams maps. Drawing makes none, so the drawing does not pull numbers out of the sim's sequence today.

### Sources of non-determinism

The static scan uses a by-name call graph. It over-counts: step() "reaches" 80% of the file by name.

| Source | Whole file | Reachable from step() | Notes |
|---|---|---|---|
| Math.random | 764 | 649 (in 277 functions) | Biggest users: doSpecial 38, brainFight 33, DOWNSPECIALS 22, step 19, the boss fights' code and the CTF CPUs. Particles (`puff`) use it too, so the cosmetic randomness is mixed into the same sequence. |
| Seeded RNGs with hidden state | about 12 | several | raceRng, cobsMazeRng, fdRng, moonRng, saRng and mapgenRng keep their state inside closures, which no generic save can capture. fsRand, jawbRand and shkRand keep it in fields, which can be saved. shkRand's state is a field on the function itself. |
| performance.now / Date.now | 46 / 27 | 36 / 21 | Most are UI, music, records or the match clock. **The real one is Capture the Flag's CPU navigation:** `ctfNavTick`, `ctfNavStatTick` and `ctfFixMs` build the CPUs' map graph within a wall-clock budget (8 ms a step). How far it gets depends on how fast the computer is. Under jsdom it uses fixed slices instead (`ctfNavDet`), which is why it looked deterministic here. |
| Async loads (fetch, await) | 54 | 25 | CTF's navigation graph (`ctfGraphFetch`) and projectile table (`ctfProjLoad`) arrive when the download finishes, and the CPUs act differently before and after. Team AI re-plans (`teamAiTick`) are async too, but they're already off in online play. |
| setTimeout / setInterval | 60 | 44 | In step-reachable code these are end-of-match screens (checkWin, bossRushCheck), banners and music. I found no gameplay result that comes back through a timer, but I didn't read all 44. |
| WeakMap / WeakSet | 10 | (dynamic) | **These are sim state.** The CPUs' "late eyes" (`_cpuSeen`) and key timing (`_cpuHands`), plus a brain's shot and hazard notes, live in WeakMaps. A save can't list what's in a WeakMap. Without capturing them, the rewind test failed every time (see 3). |
| Iteration order (for-in, Object.keys, Set, Map) | 90 for-in, 183 keys | 61, 139 | **Not a real risk in JavaScript.** The order is fixed by the language (insertion order). A restore just has to put keys back in the same order (my restore does). |
| Per-player branches | 391 `.you`, 44 `'local'` / 38 `'remote'`, 28 `NET.role`, 54 `inNetSession()` | (not split) | With rollback, every machine runs everyone's sim, but each sees "me" as local. Any sim rule that treats the local player differently would split the machines. Each of these needs a read. |
| Sim code reading keys directly (not the frame's input) | 43 `down[...]` reads (15 inside step() itself), 7 `NET.inputs[...]`, 7 `pollPad()`, 10 `KEY_LATCH_NOW` | (some are menus) | **A rollback blocker.** A replayed frame must use that frame's saved input. Code that reads the live keyboard or the newest network input gets today's keys instead. Example: Puffball's flight in step() reads `down[KEYS.jump]` for your own fighter, and `NET.inputs[idx].jump` for a guest. Each of these has to read the frame's input record instead. |
| Floating point across browsers | 5613 sin/cos/atan2/pow/hypot/exp/... | 2031 | Plain + - * / and sqrt give the same answer everywhere. sin, cos, atan2, pow, hypot and exp may differ in the last bit between engines. Chrome, Edge, Opera and the Electron app share one engine (V8), so they should agree. Firefox and Safari: **not measured** (no browsers allowed here). Desync checksums would find it in a real test. |
| Camera / view in sim code | 22816 references to W/H/camX/camY/ctx overall; 10184 in step-reachable code | | Mostly drawing helpers reached by name. In the dynamic test the drawing didn't change the sim (Goiky). Big maps and Moon Caves weren't checked this way. |

## 3. Saving and restoring the state

What changes during a match on Goiky (FFA, 4 CPUs, items on): 23 top-level variables. These are:
- fighters, particles, projectiles and items
- hazardT
- the Final Smash state (FS) and the last-KO state (KOC)
- the CPUs' perception WeakMaps
- some small lazily filled caches, and three fields that hang on functions

Two big tables also change during play only because they fill in lazily: MOVESETS (7,149 objects, 420 KB) and SIZE_HURT. Leaving them out of the save still rewinds exactly (6/6), so they're caches. A real save would leave them out; I didn't tune anything to make that pass.

The measured method keeps every object and copies its own fields; a restore puts them back in place.

| Goiky FFA 4 | Objects | Size (about) | Save | Restore | Rewind test (save, play 15, restore, play the same 15 again) |
|---|---|---|---|---|---|
| Everything that changed | 8,228 | 552 KB | 30 ms | 1.7 ms | 6/6 identical |
| Without the two lazy caches | 1,054 | 122 KB | 6.5 ms (p95 9.7) | 0.5 ms | 6/6 identical |
| ...of which the CPUs' perception history (`_cpuSeen`) | 832 | 98 KB | | | |
| ...fighters, particles, shots, items, the rest | about 220 | about 24 KB | | | |
| Without capturing the WeakMaps | | | | | 0/6: positions differ within 15 frames |

So the real sim state of a 4-fighter match is small: about 24 KB, plus about 25 KB per CPU of perception history. Online matches with mostly people would have little of that.

The generic copy costs about 6 µs per object here. A hand-written save of the known fields (fighters, shots, items, summons, stage objects, RNG, timers) should be many times faster. I estimate 0.1-0.3 ms, but that is **not measured**.

Yoyle Needle 4v4 and CTF: **not measured** (those runs stalled). They hold more state: 8 fighters, each Teams map's own objects (DRM, WND, TL, SI, YN, STG), and for CTF the flags, bases and its CPUs' plans. Expect several times Goiky's size.

## 4. Simulation cost and what it affords

step() only, no drawing. ms per frame, 1800 frames, all seats CPUs, after a 2-second warm-up:

| Match | Fighters | Mean | p50 | p95 | p99 |
|---|---|---|---|---|---|
| Goiky Field FFA | 4 | 0.67 | 0.56 | 1.2 | 2.4 |
| Sky Towers FFA | 4 | 0.73 | 0.59 | 1.4 | 3.0 |
| Grand Incinerator FFA (big map) | 5 | 0.88 | 0.75 | 1.6 | 2.8 |
| Windy Heights Teams 4v4 | 8 | 2.6 | 2.3 | 4.5 | 7.5 |
| The TLC Teams 4v4 | 8 | 2.8 | 2.3 | 5.5 | 10.3 |
| Shifting Isles Teams 4v4 | 8 | 3.7 | 3.2 | 6.2 | 10.2 |
| Yoyle Needle Teams 4v4 | 8 | 4.3 | 3.3 | 8.3 | 21.7 |
| Dream Island Teams 4v4 | 8 | 6.1 | 3.4 | 19.8 | 42.5 |
| Capture the Flag 4v4, while the CPUs' map graph is still being built (the browser normally downloads it) | 8 | 15-27 | | 23-52 | |
| Capture the Flag 4v4, after the graph is built | 8 | 7-12 | | 17-22 | |

Grand Incinerator only filled 5 of the 8 requested seats in this setup. Much of the cost is the CPUs' thinking. A match of people would cost less, but that was **not measured** (it needs scripted players).

### What a frame has room for

A frame at 60 fps is 16.7 ms. Drawing has to fit in it too, and real canvas drawing was not measured (jsdom draws nothing). Say about 8 ms is left for rollback.

In the worst frame, a rollback of D frames costs one restore plus D × (step + save). With a hand-written save of about 0.2 ms:
- **Normal stages (0.7 ms a step):** D=8 costs about 7 ms, and D=15 about 14 ms (too much once drawing is added). About 8 frames is affordable; more only with a fast save and cheap frames.
- **8-fighter Teams maps (2.6-6 ms a step):** D=2-3 at most, and Dream Island's p95 alone (20 ms) is over a whole frame.
- **CTF (7-12 ms a step):** not affordable at all.

**Not measured:** the full rollback loop (save every frame, go back 8, replay, compare with a match that just plays). The script for it is written (`rbdyn.mjs loop`), but both runs stalled for hours with almost no CPU. The six save, restore and replay tests in section 3 are the evidence that rewinding works. The cost figures above are worked out from the step and save times, not measured as one loop.

## 5. What the network costs (the honest part)

Light in fibre covers about 200 km per ms. Halfway around the planet is about 20,000 km: **100 ms each way at the very least**. Real routes are longer, so expect 125-175 ms each way (250-350 ms ping).

Frames to hide = one-way time ÷ 16.7 ms, plus 1-2 frames of jitter, minus the input delay:

| Ping (round trip) | Each way | Frames late | With 2-3 frames of input delay, rollback needed |
|---|---|---|---|
| 60 ms (same country) | 30 ms | 2 | 0-1 |
| 150 ms (across a continent or ocean) | 75 ms | 5 | 2-4 |
| 250 ms (far) | 125 ms | 8 | 5-7 |
| 350 ms (opposite side, bad route) | 175 ms | 11 | 8-10 |
| 500 ms (through a relay far from both) | 250 ms | 15 | 12-14: too many; stall or add delay |

The relay is one Cloudflare Durable Object per room. Each room lives in one place, usually near whoever opened it first. Every message goes player → relay → player, so two far players both pay the trip to that place.

WebSockets run over TCP. A single lost packet holds back everything behind it; the guest-lag bench modelled that as 60-180 ms stalls. Rollback copes, but with visible jumps.

## 6. Design: what it would take

Each phase below says what changes and gives a rough size; this is a big feature, so it needs the owner's go-ahead under the feature freeze.

**Phase 0: make the sim one deterministic machine (prerequisite, the biggest part).**
- A single seeded sim RNG (`simRand`, its state in a field) replaces Math.random in sim code. That's about 650 call sites, mostly mechanical, but each has to be judged: sim or cosmetic.
- Cosmetic randomness (particles, sparkles, looks) moves to its own RNG, or particles leave the saved state.
- The closure RNGs keep their state in fields.
- CTF navigation always uses the sliced (frame-count) budget online, and the graph and projectile table are loaded *before* the start.
- The CPUs' WeakMaps become Maps keyed by fighter or shot id, so they can be saved.
- Read and fix every per-player branch (`.you`, `'local'`, `NET.role`, `inNetSession`) in sim code.
- Every sim read of the keyboard, gamepad or network input (`down[...]`, `pollPad()`, `NET.inputs`) goes through the frame's input record.
- Pin W/H to 1100x720 for the sim.

Rough size: 800-1500 changed lines, mostly one-word changes, plus a determinism check (same inputs on two pages, compare checksums).

**Phase 1: a state save and load.**
- A hand-written `simSave()` / `simLoad()` for fighters, shots, items, summons and assists, particles (or not), the stage objects of the normal stages, hazardT, FS, KOC, the RNG and the CPU perception.
- The generic copy measured here is the reference: anything it finds that the hand-written one misses is a bug.
- Target: under 0.3 ms per save on normal stages.

Rough size: 400-800 lines, plus more per Teams map and per contest (each has its own state: DRM, WND, TL, SI, YN, STG, CTF...).

**Phase 2: the rollback loop.**
- Every player sends their inputs to everyone, each frame, with the last 8-10 frames repeated in every packet so a lost one doesn't matter.
- Every machine runs the same match. It plays with 2-3 frames of input delay and guesses a missing remote input (same as last frame).
- When the real input differs, it loads the save from that frame and replays to now.
- Rollback is capped at about 8 frames; past that the game waits a frame.
- The machine that's ahead slows a little, so both stay level.
- Sounds and effects of re-played frames must not fire twice. Today's sound and banner calls inside the sim need a "replaying" switch.

Rough size: 600-1000 lines.

**Phase 3: checking that machines agree.**
- Every 30 frames, each machine sends a checksum of a confirmed frame.
- On a mismatch, the host sends its full save. Today's host snapshot code is close to this already, and it becomes the repair path.
- Log what differed, so the cause can be found.

Rough size: 150-300 lines.

**Phase 4: spectators and joining late.**
- A spectator gets one full save, then the inputs, played a few frames behind with no rollback.
- Rejoining is the same, plus giving the seat back (the g-shell notes say how).

Rough size: 200-400 lines.

**Heavy modes.** For the 8-fighter Teams maps, CTF and contests, keep today's host-authoritative mode with guest prediction, at least at first. If rollback is wanted there later:
- They need their state in the save first.
- Their cost has to drop (the CPUs' thinking dominates).
- A smaller rollback cap and more input delay (4-6 frames) are needed.

## 7. What the relay would need (described only; the relay was not touched)

- **Forward inputs to everyone, not just the host.** Today `routeMessage` sends `input` to the host only; rollback needs it sent to all other peers. That's about 5 lines. A per-sender rate limit (about 60 small packets a second) would be sensible.
- **Public lobbies:** a lobby list (open rooms: mode, stage, players, region, build), plus join-by-list instead of by code. This could be one directory object that the rooms report to. About 150-300 lines.
- **Matchmaking by distance:** each player measures their ping to a few regions, and rooms are matched by region and ping. Rooms could be placed near the middle of their players with a location hint, instead of near whoever came first.
- **Better transport (optional, large):** WebRTC data channels between players, unordered and without resend. Rollback wants exactly that: no TCP stalls, and one hop fewer. The relay would only introduce players, and stay as the fallback when a direct link fails.
- **Public rooms need safety:** kick, report, name filtering, message size limits (already 512 KB) and the existing version check.

## 8. Recommended path

1. Phase 0 and Phase 1, checked offline (same inputs on two pages give the same checksums; save, load and replay give the same match). Nothing changes for players yet.
2. Rollback online for **normal stages, 2-4 players** (Phase 2 and Phase 3), behind a room setting. Host snapshots stay as the repair path. Measure in real browsers between real players, including at least one far one.
3. Spectators and late join (Phase 4), then the lobby list and matchmaking.
4. Teams maps, CTF and contests stay host-authoritative until each is measured. Their sim costs 4-15x a normal stage's.

## 9. What can't be perfect

- **The speed of light.** At 250 ms ping, rollback has to guess about 5-7 frames of the other player's inputs. When it guesses wrong (a new press), their fighter jumps to where it really is. That shows most on sudden moves (an attack out of a run, a jump), and less in steady movement. Input delay trades this for slower controls; 2-3 frames is the usual compromise.
- **8 players far apart.** Some pair is always far apart. Someone's input changes almost every frame, so rollbacks happen almost every frame at the full depth. That costs CPU (not affordable on the big maps) and shows more jumps.
- **Different browsers.** Chrome, Edge and the app share one engine. Firefox and Safari may compute some maths a hair differently. The checksums would catch it, and the host repair would fix it, but with a visible snap.

## 10. Not checked

- Real browsers: real drawing cost, frame pacing, Firefox and Safari maths.
- Real networks and the real relay. None were used.
- Matches of people (all measured matches had CPUs in every seat).
- Moon Caves, contests, boss fights, Teams maps other than the five listed, and the drawing on big maps.
- Long matches beyond 3600 frames.
- Whether the 44 timers in step-reachable code ever carry a gameplay result (not all read).
- The hand-written save's speed (estimated, not measured).

## Scripts

All of these run from the worktree root, at idle priority, with jsdom from the main checkout's node_modules:
- `node reports-archive/rollback-scripts/rbscan.mjs`: the static scan. It writes `scan.json` next to itself, which rbdyn needs.
- `node reports-archive/rollback-scripts/rbdyn.mjs det|perf|snap|loop|blocks <scenario> [frames]`:
  - `det`: the same match run several ways (twice alike, with drawing, with real clocks) and compared.
  - `perf`: step() time.
  - `snap`: save size and speed, and the restore-and-replay test.
  - `loop`: the full rollback loop (written, never finished here).
  - `blocks`: CTF cost over time.
  - Scenarios: goiky, sky, ffa8, needle, wind, dream, shift, tlc, ctf.
  - `EXCL=MOVESETS,SIZE_HURT` leaves those caches out of the save.
  - By default the page's WeakMap and WeakSet are swapped for Map and Set. This is only so a save can see inside them; `NOWEAKSHIM=1` turns that off.
