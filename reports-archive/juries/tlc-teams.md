# Jury: TLC Teams map "Inside the Chamber" (g-tlc-teams @ 1b8a9c96, hidden)

VERDICT: FIX FIRST (small, no redesign). Safe to merge hidden once the four fixes below are done. Nothing found that leaks while hidden.

Method: scratch copy of the branch html (and ii-dlc html as baseline), jsdom, up to 2 node at BelowNormal, fake sockets only, no relay. I did not edit the branch. Files in the session scratchpad (ko.mjs, hid.mjs, noop.mjs, map.out, gen.out).

## KEY CHECK: KOs by stocks lost (f._falls / f.stocks drops, not f.deaths)
3-minute CPU-only, seeds 7 and 11, 4v4 and 2v2v2v2, stocks 3.
- The TLC Teams map: 16 runs (4 variants x 2 setups x 2 seeds), 198 stocks lost = 4.12 per minute (seed 7: 3.71, seed 11: 4.54; 4v4 5.0, 2v2v2v2 3.25). Per run 7..18.
- Generic Teams map on The TLC (hidden, TLC_TEAMS_OPEN false): 4 runs, 36 stocks lost = 3.0 per minute (seed 7: 3.17, seed 11: 2.83; 4v4 2.83, 2v2v2v2 3.17).
- The old f.deaths counter read 36 for the map (0.75/min) and 6 for generic (0.5/min) in my runs: it undercounts about 5.5x to 6x. So the ledger's 0.67 / 0.81 vs 0.5 figures are wrong in absolute terms (true rate is about 4 per minute vs 3), though the ratio happens to point the same way.
- Answer: yes, the map KOs at least as often as the generic map overall (about 1.4x). Honest caveats: 2v2v2v2 is only about equal (3.25 vs 3.17); generic is only 4 runs and one layout; matches can end early in both (same cap for both). I did not trace where the KOs happen (builder says tubes/hatches mostly; lid KOs rare).

## Other checks
1. tcBrain hatch guard (code reading plus the matrices; no human comparison possible). Only reachable via tcBrain, which is only called under `if(TL)`: no leak to other stages. Effect: a grounded CPU walking toward a lethal drop gets left/right/jump cleared, unless a planned hop/drop edge is active. So in a chase a CPU cannot jump a hatch gap unless it is a planned edge; a human can. This makes CPUs safer than humans at hatches and probably lowers CPU-only KO rate (the 4/min still beats generic). Risk: a CPU can look timid at rims; and tcLethalAt walks all ~100 plats per CPU per frame (cheap enough). Not blocking.
2. Booth window sill hidden from CPUs: fair. A human can still drop out; a CPU enemy never enters/exits that way, so it is a small human-only shortcut and a human-only attack lane. Travel ratio 1.47x came from this. Acceptable, but say so in the notes.
3. tcPushOut: only called as `if(TL) tcPushOut(t)` in updateDropCarry and only tests platforms with .tl: no leak. Smallest-way push could put a carried fighter into the neighbouring room through a thin wall; minor.
4. Hidden leaks: with the switch off, state hashes for Teams on tlc (4p and 8p), FFA on tlc (6p), and my 18-case noop set (roster, 3 FFAs, 6 matches, ffa tlc 4/8, teams on 6 stage ids) are IDENTICAL to ii-dlc; TL null; 0 errors. Caveat: in my harness the goiky/dreamisle/needle runs produced the same hash as tlc, so the harness evidently did not really switch stage there; the "other Teams stages" no-op is not proven by me, only by code reading (every hook is `if(TL)`/`TL_VIS`/`tcWanted()` which needs TLC_DEV or OPEN and stage.stg==='bowl'). Online: guest `TL_VIS` only set from geometry with .tl plats; `s.tq` only sent `if(TL)`. Fake-socket tq test (tqtest.mjs, variants 1 and 3): lever, cake, pads, trapdoor states, guest draws all true, no errors. I did not re-run the hidden online pair (makePair forces OPEN true).
5. Jank (code reading, no screenshots): trapdoor tell is a red/yellow outline flipping every 6 frames (5 flashes a second), a lamp, and a klaxon tone every 30 frames for 90 frames. 5 Hz alternating red/yellow is above the usual 3 flashes/second guideline and there is no reduce-flash setting. The klaxon is played from the draw code with no distance check, so every viewer hears every trapdoor on a 7600 px map and it is tied to draw frames (a dropped frame skips a beat; split-screen may double it). The tell time is 1.5 s: fine for competitive players, short for a new kid. No KO banner names or map/variant names are shown in game by this diff (no strings added to UI); "Cake at Stake" is a public move/base name only.
6. SHARED CODE: the diff edits diFollow (Dream Island) and ynFollow/ynNavBuild (Yoyle Needle): the fight AI's jump/down key is now cleared on every planned step, hops onto solid faces rise straight up first, and walk edges cost a flat 12. These change CPU routing on the two other hidden Teams maps, and there is no evidence in the ledger that their route/travel checks were re-run after these edits. Hidden today, so no player-visible harm, but they will regress silently when those maps open.

## Persona read
- New kid: lots of exits and a 90-frame klaxon help; the 5 Hz flash and a lid that KOs you from the top may confuse. Fine hidden.
- Competitive: KO rate is high (4v4 about 5/min), the sill and hatch jumps are human-only advantages; fair enough, bases not equal in stocks lost (builder's 22/20/27/31%).
- 8-player host: 7600x2350 is bigger than generic (4003x2085), good; the klaxon and flashing at 8 players could be noisy.
- Owner: walls and rooms are real solids per the ledger (stairs are solid steps, not drawn ladders); no sky drops seen in the diff (items spawn via tcSpawnItem on floors/shelves); movers never vanish by design (trapdoors slide). I did not look at a rendered picture myself.

## Fixes before merge (hidden)
1. Correct the LEDGER rows: replace the 0.67/0.81 vs 0.5 per minute claims with stocks-lost figures (about 4.1 vs 3.0 per minute, 16 vs 4 runs) and say the f.deaths counter undercounts; also update the "target met by a thin margin" wording.
2. Slow the trapdoor flash to 3 per second or less (switch every 10 frames or more), or make it a steady colour change plus the lamp.
3. Play the klaxon from tcStep (clock-driven, not draw) and only if the trapdoor is within roughly one screen of the local view, or at least once per viewer.
4. Re-run the Yoyle Needle and Dream Island route and travel checks (and their no-op checks) after the diFollow/ynFollow/ynNavBuild edits, or guard those edits behind `f._tcEdge`/TL so they cannot affect the other maps.

Optional: make the hatch guard let a CPU jump a hatch gap during a chase at least sometimes (so CPUs are not safer than humans), and add a hidden-online pair test that does not force OPEN.
