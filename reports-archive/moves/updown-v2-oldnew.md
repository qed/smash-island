# Unique up and down smashes, v2: old vs new (built, on branch g-updsm, NOT merged)

Built 2026-11-12/13 from `unique-up-down-smashes-v2.md`. Twelve fighters, 24 moves. Every other fighter keeps the generated wedge and two low lines; every other move of all 112 fighters, including these twelve's neutral smashes, is byte-identical (see the checks file section at the end).

Numbers are per hit and before the fighter's own damage setting (same as the spec). "Launch" is the length of the knock-away vector. "Today" is the generated move it replaces. No move is more damaging or harder-launching per hit than today's, and no move is shorter in frames (script `rowcheck.mjs`, 0 problems).

## The list

| Fighter | Slot | Old (generated) | New | Numbers (old → new) | Effect | Frames |
|---|---|---|---|---|---|---|
| Firey | up | Rising Lunge (wedge) | **Hang Glider Heave**: arrowhead glider over his head, nose hardest | 18.5 / 8.1 → nose 17.5 / 8.1, wings 14.5 / 7.8 | none | 38 → 38 |
| Firey | down | Low Lunge (two low lines) | **Twin Torches**: two flame tongues up and out from his feet in a V | 17.2 / 7.6 → 14.5 / 6.6 | burn 1 s (new) | 38 → 38 |
| Leafy | up | Rising Volley | **Leaf Blades**: two blades flung up-left and up-right, gap straight overhead (leaf-blade version of Knife Toss: no knives, no bleed, per the lead's default) | 15.8 / 11.8 → 13.7 / 10.5 | none | 37 → 37 |
| Leafy | down | Low Volley | **Falling Leaf**: U-swing, back half carries the foe forward and under her, front half launches | 14.8 / 11.0 → back 5 / 8.2 then front 9.2 / 10.3 (14.2 on a foe hit by both) | none | 37 → 37 |
| Needle | up | Rising Smash | **Don't Call Me Needy!**: the slap, a thin crescent from straight ahead up to overhead | 9.7 / 7.2 → 8.2 / 6.3 | stun 1/3 s (new) | 34 → 34 |
| Needle | down | Low Sweep Smash | **Double Stitch**: two needles up through the floor, one each side | 9.0 / 6.8 → 7.6 / 6.3 | bleed 0.7 s (new) | 34 → 34 |
| Pin | up | Spring Trap | **Flat Top**: wide flat plate over her that rises with a small hop | 20.2 / 9.0 → 19.5 / 9.0 | none | 39 → 39 |
| Pin | down | Floor Trap | **Wobbling Top**: spins and wanders out, back, out (about 20 px each way); three hits | 18.9 / 8.5 → 5 + 5 + 8 = 18 / 8.0 | none | 39 → 44 |
| Snowball | up | Skyburst | **Snowman**: two more snowballs onto his head, small top ball hardest | 15.8 / 6.0 → head 15 / 6.0, middle 13 / 5.6 | none | 37 → 37 |
| Snowball | down | Floor Ring | **Roll Out**: a snowball rolls out each side, growing: 9, 11.5, 13.5 | 14.8 / 5.6 → 9 to 13.5 / 5.0 | slippery 1.2 s, far ball only (new) | 37 → 37 |
| Bomby | up | Rooted Uppercut | **Fuse Sparkler**: thin spark jet with a ball of sparks on top | 28.2 / 11.8 → 24 / 10.5 | burn 1.2 s (new) | 43 → 43 |
| Bomby | down | Rooted Sweep | **Backfire**: one flat dome under him, throws foes straight away from him, costs him 3% | 26.2 / 11.0 → 22 / 10.6 | burn 1 s (new; see "Changed from the spec") | 43 → 43 |
| Bubble | up | Sky Hop | **Blow-Up**: one bubble swelling in 3 steps, pop launches | 10.6 / 6.3 → 3 + 3 + 4.2 = 10.2 / 6.3 | none | 34 → 34 |
| Bubble | down | Ground Pound | **Oh Noio!**: a thin ring spreading out from her in 3 steps, thrown straight away from her; her body is drawn faint while it spreads | 9.8 / 5.9 → 9.2, 8, 6.5 / 5.9 | none | 34 → 34 |
| Teardrop | up | Rising Smash | **Dot Dot Dot**: three dots over her head hit one after another, last one launches | 9.7 / 7.2 → 3 + 3 + 3.2 = 9.2 / 7.0 | none | 34 → 34 |
| Teardrop | down | Low Sweep Smash | **Down the Drain**: hit starts far out on both sides and closes in, pulling foes to her, then a splash pops them up | 9.0 / 6.8 → 2.6 + 2.6 + 3.6 = 8.8 / 5.4 | none | 34 → 34 |
| Flower | up | Sky Hop | **So Beautiful!**: five separate petals in a half-ring over her head | 20.2 / 4.2 → 17.5 / 4.2 | stun 1/4 s (new) | 39 → 39 |
| Flower | down | Ground Pound | **So Ha!**: both arms shoved straight out at chest height (arms, not hand discs: see below), flat launch | 18.9 / 3.9 → 16.5 / 3.9 | slippery 0.8 s (new) | 39 → 39 |
| Tennis Ball | up | Rising Smash | **Topspin Bounce**: bounces himself straight up about 48 px, body is the hit | 15.8 / 14.1 → 14.5 / 12.5 | none | 37 → 37 |
| Tennis Ball | down | Low Sweep Smash | **Double Fault**: two bounces, lands in front (frame 13) then behind (frame 25); one foe takes only one of the two | 14.8 / 13.2 → front 8 / 9.0, back 11.4 / 12.2 | slow (new) | 37 → 42 |
| Blocky | up | Rising Swing | **Funny Doings Pop-Up**: glove on a spring from the floor ahead, glove is the sweet spot | 21.1 / 9.0 → glove 18.5 / 8.5, spring 14 / 7.2 | glove reverses controls 2/3 s (new) | 40 → 40 |
| Blocky | down | Low Swing | **Snakes in a Can**: a spring snake arches out to each side | 19.7 / 8.5 → 17.5 / 8.0 | none | 40 → 40 |
| Coiny | up | Rising Lunge | **Heads or Tails**: thin tall line, then a wide round disc | 20.2 / 7.2 → edge 19 / 7.2, face 16 / 6.6 | none | 39 → 39 |
| Coiny | down | Low Lunge | **Penny Spin**: round patch at his feet shrinking over 3 hits, last throws them away | 18.9 / 6.8 → 5.3 + 5.3 + 5.6 = 16.2 / 6.7 | none | 39 → 39 |

## Changed from the spec (and why)

1. **Leafy up** is the leaf-blade version (13.7 damage, no bleed), the lead's default.
2. **Leafy down, back half launch** 3.4 → 8.0 (still under today's 11.0). Built and tried: at 3.4 a foe more than about 20 px behind her never reached the front half; at 8.0 it does at higher percents. Total on one foe unchanged (14.2).
3. **Multi-step moves needed one engine flag** (`chain`): the hit-grace a first step gives made the later steps of the same move miss (Bubble up, Teardrop up and down, Coiny down, Pin down, Leafy down). A box with `chain:true` lands through the grace its own move opened (the existing multi-hit rule: same attacker, same move). Nothing else uses it.
4. **Look-alike script forced three redesigns** (see checks): Bomby down gained a 1 s burn and lost 2.5 damage (24.5 → 22); Flower down went from two hand discs to two arm capsules; Tennis Ball down gained a slow and lost 2 / 2 damage (front 10 → 8, back 13.4 → 11.4).
5. **Tennis Ball down uses one hit group for both landings**: a foe can be hit by only one landing, so the doubled 23.4 cannot happen (the "hit grace" cap). He ends about 21 px behind where he started (spec guessed 36).
6. **Pin down wanders about 20 px each way**, not 30/60/30.
7. **Needle up "!" over the foe** was not drawn. All 24 moves have a drawn prop (Tennis Ball up has only spin lines, no squash), each runs on frames 4 to 18 without an exception, but **I could not look at any of them**: no browser or screenshots were allowed. Please look at them in the game. Coiny up uses a drawn gold coin over him (no squash and stretch). Bubble's body fade is a drawing multiplier only.
8. **Rad flag** (`rad`) was added as the lead allowed.
9. **No What's-new entry was added**: that is for the update day, not for an unmerged branch.
10. **Fighter pages** (artifacts/V1/fighters/*.html) do not list smashes, so none were changed. The move lists in the game read the new rows.
11. **End-lag table** (`ENDLAG_ADD`) has no up/down smash rows for these kits, so nothing to change; the row's own end frames are the end lag. `FB_FRAME_DATA` had one generic `dsmash` row each: replaced, and 12 `usmash` rows added: `[startup, active, end, end]`.
12. **SW_EXC pins**: `float.dsmash` and `slap.usmash` pinned to `thrust` (a swing sweep would have sliced Bubble's ring and Coiny's coin edge). Every other new box is already thrust by the rule; Needle's crescent sweeps (a real swing).


## Checks (scripts in `updown-v2-scripts/`, all run on the final rows unless marked)

- **Branch**: `g-updsm` in `.worktrees/updsm`, from ii-dlc. Not pushed, not merged.
- **syncheck**: failed 0. **bootcheck**: clean (FFA and Teams, 0 bad positions, 0 errors, 0 control bytes, 0 bare LF, no hidden names, kit guard ok).
- **Numbers (`rowcheck.mjs`)**: per-hit damage, per-hit launch length, worst case on one foe and move length, all 24 against today's generated move: 0 problems. Tennis Ball's two landings share one hit group, so one foe takes one landing (max 11.4, today's 14.8).
- **Hit shapes (`grid.mjs`, `chain.mjs`, `trial.mjs`)**: a still dummy on a grid of 21 x positions and 5 heights for every move, and a free dummy for the multi-step ones. Moves reach where the spec says. Firey up misses a grounded foe beside him; Bubble's full-circle ring hits all round her (a full-circle fan works); Tennis Ball lands on frames 13 and 25 exactly as planned. Found and fixed: later steps of a move were blocked by the first step's hit grace (added `chain`), and Leafy's back half did not carry a foe (see above). Not fixed: Teardrop up's dots reach a foe only if it is over the matching dot (a foe straight overhead meets only the middle one).
- **Look-alike check (`lookalike.mjs`, output `lookalike.txt`)**: shape class + effect + self-motion + hit count + damage and launch within 25%, the 24 against 1191 tilt, aerial, side and generated rows, the other 23, and 104 neutral smashes (coarse). First run found **26 matches**: Bomby down against ~23 generated low-line down smashes, Snowball down against Flower down, Tennis Ball down against another kit's down-air. All three moves were redesigned (see "Changed from the spec" 4), not the rule. Final run: **0 geometry matches**. **Coarse pattern-only flags: 3** (the data has no shape): Bomby down against his own neutral smash (both burn, 22 against 21 damage; his is a rooted ring of radius 56, mine a flat dome with no root and a radial throw), Tennis Ball down against Donut's and Black Hole's neutral smashes (a roller and a pull, not a hop). I judge these three as different by reading, but this is the weakest part of the check; **specials are code, not rows, and are NOT covered by the script**.
- **No-op proof (`noop-hash.mjs`)**: the harness was first found not deterministic (same build twice gave different hashes, because of wall-clock time); fixed by freezing Date.now and performance.now in the harness (`common.mjs`), then base against base is identical. On an EARLIER version of the rows (before the chain flag, the Leafy kick and the three redesigns): the generated rows and move-list text of all 99 other fighters, all of MOVESETS (every tilt/aerial/grab/special of all 111), SMASH_SPEC, DSM constants, ENDLAG_ADD, SW_EXC (minus the 2 new pins) and FB_FRAME_DATA (minus the 24 rows) were identical, and 5 of 6 state-hash matches (4-fighter matches without the twelve, 1500 frames, 2 seeds) were identical, the 6th had not finished when the run was stopped. **NOT DONE on the final build: the re-run of the whole no-op proof.** The later edits only change the twelve fighters' rows and add one inert branch in mvStrike (`b.chain`, `b.rad`: only boxes with those flags), but that is my reading, not a proof.
- **CPU matches (`cpu.mjs`, `cpu4.mjs`)**: each of the 12 in a 4-player CPU match for 4200 frames: **0 errors, 0 stuck** (longest stand-still 40 frames), no bad positions. The CPU rarely presses a smash at all (also true for the base build, `cpu3.mjs`): in free play only 2 of 24 moves came out (Flower down, Coiny down). With the brain forced to ask for the direction (`cpu4.mjs`, 1800 frames each): **6 of 24 came out through the CPU's own smash path (Firey, Bubble and Tennis Ball, up and down); 18 did not come out in that time**. Every move comes out when pressed (online check, and `trial.mjs`: 24 of 24), so that is the CPU's choice, not a broken move, but I did not prove each one through a CPU.
- **Online (`net.mjs`)**: a host and a guest page joined by fake sockets (helpers/net-pair.js), nothing real, no relay. The guest's human pressed up+V and down+V as each of the 12: **24 of 24 thrown on the host, guest and host agree on every position, % and stock count (max % gap 0.00, max x gap 1 px), 0 errors**. For 6 of the up smashes the dummy was not in range, so only "thrown" and "in agreement" were proven for those, not a hit.
- **Win share, before and after (`balance-1v1.mjs` focus mode, 12 fighters x 8 panel fighters, both sides, 2 seeds = 32 games each, 1 stock, 4500 frames cap, same seed on both builds)**: FINISHED after the report was sent (384 matches per build, 0 errors; machine busy, so the runs were not paired frame for frame). No change is beyond 2 standard errors (about 18 points for a difference), so nothing is flagged, but the power is low. Largest moves: Bomby +12.5 (78 to 91, already the top group), Firey -15.6, Blocky -12.5, Flower +9.4, Snowball -9.4. Bomby was already strong; worth a watch.

| Fighter | Before win % (games) | After win % (games) | Change | Flag |
|---|---|---|---|---|
| Firey | 59.4 (32) | 43.8 (32) | -15.6 | within noise |
| Leafy | 21.9 (32) | 21.9 (32) | +0.0 | within noise |
| Needle | 62.5 (32) | 65.6 (32) | +3.1 | within noise |
| Pin | 18.8 (32) | 18.8 (32) | +0.0 | within noise |
| Snowball | 21.9 (32) | 12.5 (32) | -9.4 | within noise |
| Bomby | 78.1 (32) | 90.6 (32) | +12.5 | within noise |
| Bubble | 68.8 (32) | 65.6 (32) | -3.2 | within noise |
| Teardrop | 43.8 (32) | 43.8 (32) | +0.0 | within noise |
| Flower | 65.6 (32) | 75 (32) | +9.4 | within noise |
| Tennis Ball | 31.3 (32) | 34.4 (32) | +3.1 | within noise |
| Blocky | 37.5 (32) | 25 (32) | -12.5 | within noise |
| Coiny | 25 (32) | 28.1 (32) | +3.1 | within noise |

