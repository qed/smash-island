# Review: Dream Island Teams map (branch g-di-open), 2026-11-16

Owner: "why isnt dream island live?" -> "Check it, then open". Verdict: OPENED, with the open questions at the bottom for the owner. Method: offline jsdom only (fake sockets; the live relay was never touched), CPU-only matches at Hard level, 3 minutes (10800 frames), 3 stocks, one node process at a time. KOs are STOCKS LOST (3 minus stocks left), not f.deaths. Scripts are outside the repo (scratchpad/di-open).

## What passed
- Routes: every base reaches every outer island, every cluster island and every other base, and back, at 12 moments of the movers' cycles, with the whale down (408/408) and up (432/432), compact/normal/huge x 4 variants (2v2v2v2 ownership). Same after the fix.
- Bad positions 0 and errors none in all 12+8 matches. No CPU stood still 300 frames (5 s) or more: worst 234 frames before the fix, 217 after.
- Online (fake host/guest pair, 30 ms latency, 10 ms jitter): 2v2, 4v4 and 2v2v2v2 at Normal size, 1500-2400 frames. Guest builds the same variant, same plank/block/star state in 433 of 456 samples (2v2v2v2), longest mismatch 10 frames, whale phase equal in 448 of 456 (longest mismatch 5 frames), movers within 20 px. The chandelier lags the host by up to 126 px while it is falling (23-26 px in the 2v2 and 4v4 runs): looks only.
- Hidden -> open is a no-op elsewhere: the switch only matters for Teams on Dream Island. Checked that Dream Island FFA, Teams on another stage (goiky, forest) have no Dream Island state and keep their own map sizes; Dream Island Teams 2v2/3v3 build the island map. The old preview switch (localStorage bfsi:didev) is now harmless. No hidden fighter is named anywhere in the map's text.

## Findings, biggest first

1. FEW KOs (not a bug, an owner question). Stocks lost in 3 minutes, same seeds as the ordinary Teams map (the map used while hidden):

| Mode | Ordinary map | Dream Island |
|---|---|---|
| 2v2 | 5 | 1 and 3 (mean 2.0) |
| 3v3 | 8 | 2 and 5 (mean 3.5) |
| 4v4 | 10 and 12 | 2, 0 and 3 (mean 1.7) |

   In a 2-minute 4v4 probe the nearest foe is on average 1156 px away (ordinary map 439 px), and CPUs are on a trip to a set piece 43% of the time. With trips switched off it is still 1003 px, so the size is the cause, not the trips. 4v4 at Normal is 5872x3058 (DI_BIG 2.0, the owner's "spread stuff out over a bigger map"). The fights are rare, not unfair. Not changed.
2. BASE FAIRNESS IS NOT EVEN. Graph travel cost from each base to the four cluster islands and three outer islands (mean; the other maps' bar was a slowest/fastest ratio of 1.5): the two high bases (top-left, top-right) are 2.4 to 4.6 times nearer than the two low bases. Normal size: 2v2 3.7 (v0/v1: top-left 273 against bottom-right 1001) and 2.6 (v2/v3); 3v3 3.5/2.5; 4v4 3.1/2.4; 2v2v2v2 3.4 (v0/v1) and 4.6 (v2/v3). Cost to the terrace alone is worse (up to 8x). This comes from the owner's drawn layout (bases at different heights), so I did not touch it. The builder's earlier 8 four-team matches did not show the high bases winning (high 2 wins, low 1, the low bases survived longer), and I did not re-measure winners.
3. CPUs NEVER BOARDED THE WHALE (bug, partly fixed). 8 matches: 19 boarding trips, 0 arrivals, 0 frames of any CPU standing on the whale (also 0 crates taken, 0 ferry rides; those were not looked at). Direct test (a CPU on the shelf, whale surfacing): the usual brain's jump input stayed on while the CPU waited for the whale, so it hopped off the shelf before the whale was flush; and the in-air steering aimed at where the whale had been at take-off. Three small changes in diFollow (no jump while waiting on or stepping onto a mover; aim at the mover's current middle). Same 8 matches after: whale 8 stands of 10+ frames (was 0), cranes 77 (55), lifts 30 (14); whale trips still end 'foe' or 'timeout', 0 'arrived'. In the single-CPU test the whale is boarded in variants 2 and 3 (132 frames aboard) but still NOT in variants 0 and 1 (there the CPU leaves the shelf before the whale comes flush; I did not find why). Not solved; the whale is a power-up island, so CPUs missing it makes matches slightly harder on the human side, not unfair between teams.
4. KOs after the fixes (same 8 seeds/variants): total stocks lost 18 -> 21 (noise level). 

## Matches (before / after, 8 each, stocks lost per match)
2v2 s14 v0: 1 / 3. 2v2 s15 v1: 3 / 2. 3v3 s14 v2: 2 / 2. 3v3 s15 v3: 5 / 3. 4v4 s14 v0: 2 / 1. 4v4 s15 v1: 0 / 3. 4v4 s16 v2: 3 / 4. 2v2v2v2 s14 v3: 2 / 3. Worst stand-still 234 / 217 frames; stuck 5 s+: 0 / 0; errors none; bad positions 0.

## Open design questions for the owner
1. Is a 4v4 with about 0.5 KOs a minute (a quarter of the ordinary map's rate) fine? Smaller DI_BIG (2.0 now, was 1.5) would bring the bases closer.
2. The high bases are 2.4-4.6 times nearer to everything than the low bases. Keep (the drawn layout), or pair teams on bases of equal travel (for example top-top or bottom-bottom for two teams)?
3. Should variants 0 and 1 have the whale meet the shelf with a short level step so CPUs and humans can board more easily?

## Honest limits
CPU level Hard only, 8 matches before and 8 after (one seed per configuration), so the KO numbers are noisy (one match swings by 3). jsdom only: nothing about how the map looks or feels was judged by eye; the Dream Island night, rain and fog were not exercised separately. No human input.
