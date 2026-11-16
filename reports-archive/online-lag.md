# Online lag -- what was measured, what was found, what was fixed (2026-11-09)

Branch `g-lag` (on ii-dlc 672b0e9), not pushed. Nothing here touched the live relay or any server: every number comes from two copies of the game page running inside one node process on this computer (a host page and a guest page), with no socket at all.

Your report: "lag spikes high with 3+ players on multiplayer" -- free-for-all, you were a guest, the spikes come every few seconds.

## What was measured

A host page runs a busy CPU free-for-all with items on and builds a snapshot every frame exactly as the real host does; a guest page parses, applies, glides, predicts and draws it. 50 seconds to 2 minutes a run, at 2, 3, 4 and 8 fighters, on Goiky, Yoyle Canyon (Huge), Shifting Isles and Yoyle Needle. Scripts: `scripts/net-lag-measure.mjs`, `scripts/net-lag-guest.mjs`.

## What the numbers say

- The net code's CPU work is small on both ends and grows in a straight line with the fighters. Building and encoding a snapshot on the host: 0.05 ms at 2 players, 0.08 at 4, 0.26 at 8 (the game step itself is 0.3 / 0.55 / 1.5 ms). On the guest, applying a snapshot, gliding and predicting: 0.33 / 0.6 / 1.26 ms a frame; the prediction is 0.01 ms. There is no loop over pairs of players anywhere in the net code. The guest's picture agrees with the host's (positions within a pixel; percents, stocks, items, shots and platforms equal) in every run.
- So the lag is bytes on the wire, and the things that make one snapshot fat. Before the fix the host sent 60 snapshots a second of about 1.0 KB (2 players), 1.2 KB (3) and 1.6 KB (4): 59 / 70 / 93 KB a second. The relay sends each one to every guest, so with 3 guests it pushes 280 KB a second.

## The top five cost sources (before)

1. The fighters are two thirds of every snapshot, and a third of that was fields that never change, sent 60 times a second: name, colour, kit, KO cap, team (about 95 bytes a fighter), and a guest's eleven prediction numbers (about 110 bytes a guest).
2. Yoyle Needle re-sent the WHOLE stage layout in every snapshot (2991 of 3000), because the moving ledges' places were part of the layout's fingerprint: 2.3 KB a snapshot, 136 KB a second at 4 players (vs 93 on Goiky).
3. A hit's particle burst: 48 rows with the colour string written on each were 1.7 KB of a 3.3 KB snapshot -- the biggest single-frame jump on a flat stage.
4. The stage layout repeat every 3 seconds: +0.6 KB on Goiky, +7 KB on a Huge map (an 8.9 KB snapshot). This is the one PERIODIC thing in the protocol that fattens a snapshot every few seconds.
5. On the guest, garbage collection from the objects each snapshot creates: in node a 4-10 ms pause every 1.5 s, always inside applying the snapshot (the only part of the guest's frame that spikes; a browser's pauses are smaller, but it is the same mechanism).

## What was fixed

- The slow fields go only when they change, through the first 2 seconds of a match, with the layout, and once a second regardless. The guest keeps the last it saw, and keeps what a snapshot it skipped had.
- The layout's fingerprint no longer includes the platforms' places; a platform that has moved since the layout went rides as a 3-number row. Yoyle Needle no longer re-sends its layout every frame.
- Particle rows carry a colour index into a small table; at most 32 new particles a snapshot (was 48).
- The layout repeat is every 8 seconds (was 3); it is only a safety net, the connection never drops a message.
- `false` flags ride as nothing.

## Before / after (same seeds, 60 snapshots a second)

| room | before KB/s (avg KB a snapshot) | after KB/s (avg KB) |
|---|---|---|
| 2 players, Goiky | 59 (0.98) | 46 (0.77) |
| 3 players, Goiky | 70 (1.16) | 55 (0.92) |
| 4 players, Goiky | 93 (1.56; p95 2.04, max 3.6) | 67 (1.11; p95 1.55, max 2.5) |
| 4 players, Yoyle Canyon Huge | 92 (max 8.9) | 73 (max 7.3) |
| 4 players, Yoyle Needle | 136 (layout in 2991 of 3000) | 72 (layout 7 times in 50 s) |
| 8 fighters, Canyon Huge | 154 | 129 |

Host encode at 4 players: mean 0.08 ms, p95 0.14, max 0.7 before; 0.10 / 0.17 / 4.8 after (the max is a one-off engine hiccup in both runs; the means are within noise). Guest apply at 4 players: 0.60 ms before, 0.64 after. Guest-vs-host state equality: 0 mismatches before and after, in 9 runs.

## What could NOT be tested offline

- Real network latency and jitter, your upload speed, wifi.
- The relay's throughput and its fan-out to 3 guests (it is not touched by this work in any way).
- A browser's own garbage collection and drawing time.
- A jittered wire WAS simulated (60 ms +-40 ms, a guest holding a run): the guest's own fighter got 7 small corrections in a minute, not periodic -- the prediction's clock is not the cause.

The next check is a real room of 3-4 on this build; if the spikes are still every few seconds as a guest, the remaining suspects are the connection itself and the browser's garbage collection, which this computer cannot see.
