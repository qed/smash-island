# Capture the Flag audit and polish (2026-11-10)

Branch `g-ctfaudit` (worktree `.worktrees/ctfaudit`, built on ii-dlc `22ad2c73`). Headless jsdom only: no browser, no live relay, no tests added to the repo. Harnesses are in the session scratchpad (`ctfa/`), not committed.

Honest limits up front: every number below is from jsdom stepping `step()` with the shipped route graphs injected. jsdom has no layout, so **text overflow at 1280x720 / 1920x1080 could not be measured**. Matches are CPU-only through the Spectate path (every seat a CPU). The run matrix had to be cut for time (the machine was saturated): 4 v 4 (count 4 means 2 a side) seeds 1-2 on castle and seed 1 on the other five maps; 8 players seed 1 on all six; 16 players on castle and oak only (sky 16 never finished). Play is capped at 36,000 frames (10 min); a match past the cap counts as a timeout.

## Findings, ranked by player impact

### 1. Matches that do not end (FIXED, partly verified)
Before: **6 of 15** matches hit the 10-minute cap with no winner. By size: 4 players 2/7 (mines, oak), 8 players 4/6 (mines 3-3, sky 4-3, oak 1-2, factory 3-2), 16 players 0/2.
Cause found in `mines:4:1` (score 0-1, the lead held for 25,000 frames): `ctfPlanDeal` turns the whole leading side into defenders late in a match (`lateturtle`, defShare 0.85) and always keeps one defender in a 2-a-side team, so a lone attacker keeps getting jailed and nothing changes.
Fix: after 4 minutes (`CTF_DRY_START` = 14,400 frames) with no capture the CPUs send more attackers, a fifth more every further minute (`CTF_DRY_STEP` = 3,600); the late turtle is off in a dry spell and a team may drop to no defender. Human plans/presets are not touched (presets and the owner's turtle/allout still override).
After: `mines:4:1` ends (0-2 after 28,031 play frames; it timed out at 36,000 before). Matches that never go 4 minutes dry are byte-for-byte unchanged (castle 4v4 x2, factory 4v4, castle 8p reproduce the same frame counts and scores).
NOT shown to help: `mines:8:1` still times out 3-3, but its last capture was at play frame 22,592 so the 4-minute rule would only begin at 36,992, after the cap. The other timeouts (oak 4p, sky/oak/factory 8p) are in the after matrix if it finished; see the table at the bottom.

### 2. Mines 8 players: many CPUs with no goal (LEFT)
`mines:8:1`: 24 stuck-in-play episodes (15 attackers, 8 defenders with no goal, 1 at a door), up to 1,865 frames still. A final-state dump shows a carrier of the team-0 side standing at x 25,404 y 3,216, the far right end (the other side's end) with no way-home goal. I did not find the cause. Left: it needs a replay with the carrier's nav state; the game's own `unstick` counter was at 274 in that match.

### 3. Hiding / "fix" phase length (LEFT, unverifiable here)
`forest` 4p: the hide phase took 14,889 frames and 8p 17,541 (the cap is 18,000), against 2,000-5,000 on the other maps. In forest 4p the time is the **fix** phase (the check that the CPUs' walls leave every flag reachable): hide ended at L.t 3,662, fix ran to 14,890, and everything stands still during it. In jsdom the nav work is done in fixed slices per frame (`ctfNavDet`), the browser works on a 6 ms-per-frame budget, so the real wait is not the same number. It is a risk for CPU-only matches and Flag Cup fixtures on forest; a human match mostly pre-builds the graph while the human hides (`ctfEditPrebuild`). Left alone: I could not measure it in a browser, and changing the slice budget affects every frame.

### 4. CPUs standing still while hiding (LEFT)
Hide-phase stands of over 240 frames: 1-16 CPUs a match (16 at 16 players), up to 3,818 frames on `oak:8:1`, usually a CPU with a path edge it cannot run, in the first 1,000-2,500 frames. The hide has its own watchdog (`unstickHide`) and everyone is put down at L.t 2,700, so the match always goes on; the cost is idle CPUs while a human hides. Left.

### 5. Flag Cup screens had no Escape (FIXED)
Escape did nothing on the Flag Cup setup and team-builder screens, and did not close the fighter picker (the plan editor and the kit box already did). Now: Escape closes the picker, then goes team builder -> cup setup -> tournament menu, and never fires while a match runs or the plan editor / kit box is open (`ctfCupEscKey`). Before/after from the same script: pickerEsc `flex -> flex` (not closed) before.

### 6. Things checked and found clean
- Errors: 0 console/page errors in 15 CPU matches, in the tournament, in 6 human-seat matches with the editor and planning menu, 3 spectate matches, pause.
- Bad positions (non-finite or outside the world): 0. Flags in walls or off the map: 0. Hidden flags the other side cannot reach (`ctfAiReachable`): 0. Prisoners held past the auto-release: 0.
- Fighter-in-solid hits: 16 on `forest:8:1`, 1 each on mines and sky 8p. The forest ones were traced: the fighter walks on a slope `step` plate (`step:true`, walked up, not a wall), a harness false positive; the other two were not traced.
- Flag Cup: simulated whole cups of 4 / 8 / 16 teams (sizes 2, 3, 4 a side) all reach a champion with 7 / 15 / 31 fixtures. No button without a handler on the cup setup (39 buttons), team builder (33) or hub; each has a Back.
- Spectate keys (1 2, arrows, Z, 0, O, L, F, comma, period) and the planning menu on every tab: no errors, menu closes on Escape.
- Online: a host+guest pair over fake sockets (never the relay), 14,000 frames each on all six maps: 0 phase, score, flag, jail or map mismatches after the bid. 826-1,301 snapshots a map where the guest correctly sees a hidden enemy flag as "not for this side" (st 4); counted separately, not as a diff. Fighter position gaps of 3,600-4,700 px on oak, sky and factory were traced to a portal teleport one snapshot ahead on the host (the guest's position equals the host's position one sample earlier): latency, not drift. The side bid on asymmetric maps lasts 1,800 frames.
- Performance (jsdom, no drawing): `step()` 3-8 ms at 4 players, 8-18 ms at 8, 29-31 ms at 16. A CPU profile of 16 players shows 40% or more of the self time inside jsdom's own selector/DOM code (`query`, `filter`, `_update`, `treeToArray`) from the page's HUD calls, which is far cheaper in a browser; the game's own CTF code (nav, AI sight) is roughly a fifth. So the 16-player number is an upper bound; not measured in a browser.

## What was changed
`artifacts/V1/index.html` only: `ctfCupEscKey` (+ listener), `CTF_DRY_START`/`CTF_DRY_STEP` and the dry-spell lines in `ctfPlanDeal`. Docs/LEDGER.md row "CTF AUDIT AND POLISH".

## Per-match numbers (before / after)

Filled from the run files; "-" = after not finished. Format: hide frames, play frames, result, score, stuck-in-play episodes.

| match | before | after |
| --- | --- | --- |
| castle 4p s1 | 3434 / 8804 end 2-1, 0 | 3434 / 8804 end 2-1, 0 |
| castle 4p s2 | 3576 / 22056 end 2-1, 0 | 3576 / 22056 end 2-1, 0 |
| mines 4p s1 | 3391 / 36000 TIMEOUT 0-1, 2 | 3391 / 28031 end 0-2, 2 |
| factory 4p s1 | 4348 / 23699 end 1-2, 0 | 4348 / 23699 end 1-2, 0 |
| forest 4p s1 | 14889 / 27702 end 2-2, 1 | - |
| sky 4p s1 | 2285 / 32346 end 2-2, 0 | - |
| oak 4p s1 | 1934 / 36000 TIMEOUT 0-1, 0 | - |
| castle 8p s1 | 2160 / 16238 end 4-1, 1 | 2160 / 16238 end 4-1, 1 |
| mines 8p s1 | 2150 / 36000 TIMEOUT 3-3, 24 | 2150 / 36000 TIMEOUT 3-3, 24 |
| forest 8p s1 | 17541 / 22074 end 4-4, 7 | - |
| sky 8p s1 | 5076 / 36000 TIMEOUT 4-3, 0 | - |
| oak 8p s1 | 4414 / 36000 TIMEOUT 1-2, 0 | - |
| factory 8p s1 | 4096 / 36000 TIMEOUT 3-2, 4 | - |
| castle 16p s1 | 5610 / 30656 end 8-7, 0 | - |
| oak 16p s1 | 2927 / 35343 end 8-6, 3 | - |

(An "end 2-2" or "end 4-4" is not a tie: on the asymmetric maps (forest, sky) the side that lost the side bid hides one extra flag, so the other side needs one more; the audit logged need [3,2] for those, and the side needing 2 won.)

## Verification after the fixes (commit 0375ce35)
- Screens, same script: Escape on the cup setup went `stays` -> back to the tournament menu; on the team builder `stays` -> cup setup; the open fighter picker `flex` -> closed (screen unchanged). 0 errors before and after; the 4 / 8 / 16-team simulated cups still crown a champion with 7 / 15 / 31 fixtures.
- Non-CTF modes: roster-row digest, 3 FFAs (4 players, 2,400 frames), 10 short 1 v 1 matches and a 6-player Teams match, with a fake `Date.now`/`performance.now`, are digest-identical between ii-dlc and this branch. syncheck: 2 scripts, 0 failed. bootcheck (pointed at the worktree): FFA and Teams clean, guards clean.
- Match matrix: only 6 of the 15 after-runs finished before the work was stopped for time (the machine was saturated and the run was cut off for a long gap). The rows marked "-" in the table above were not re-run; the 16-player and the other timeouts (oak 4p, sky/oak/factory 8p) are therefore NOT confirmed fixed. Of the six finished: five identical to before, `mines:4:1` timeout -> ended, `mines:8:1` still a timeout (see finding 1).
