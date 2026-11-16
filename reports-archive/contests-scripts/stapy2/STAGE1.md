# Stapy lighthouse hunt: stage 1 interim note (worktree ct-stapy2, branch g-ct-stapy2)

State: the contest works end to end in its own world (4 lighthouses in the corners, plaza start, dark outside, emblem HUD, lever stand with a ring, speed-up, stocks, no time limit). The lighthouses are NOT yet CTF-framework interiors (stage 2 does that).

Checks on the stage-1 build (all numbers from the scripts in this folder, nothing tuned to pass):
- 10 CPU-only runs (cpu_final.txt): all 10 ended on a full emblem, 123-151 s (mean 137 s). Winners: Firey 6, Stapy 2, Liy 2. 0 errors; no CPU stood 5 s+ without making progress (the only 5 s+ stops were CPUs standing on a lever). Turn-offs are rare in these runs (0-1 per match), KOs 0-1: the CPUs mostly race. See the questions.
- Scripted keys-only human (the route planner's choices pressed as real keys, holding jump through the rise): won 3 of 5 (107-120 s), the other 2 won by a CPU; 0 errors.
- Reachability, hardest hop of each kind (pit gap 120, stair gap 80 rise 90, steep rise 96, drop with gap 175) per fighter: 89 of 102 playable fighters done before the node process crashed (V8 out of memory after many boots); 83 passed all four, 6 failed one hop each (Pin, Firey Jr., Balloony, Balloon, Paper, Lifering). The failing hops are the marginal ones (plaza to first stone, the ladder step, the 175 drop), so they will be eased in the next stage. The remaining 13 fighters and the failed ones will be re-run after stage 3 in two halves.
- Route graph: every ledge reaches every lever's ledge (conn.mjs: 0 unreachable pairs).
- No-op hash: running now (hash_new.txt), compared at the end.

Real defects found by the checks and fixed (not loosened): CPUs jumped again just before landing; CPUs overshot a lever and never completed the stand; CPUs got stuck on the lighthouse roofs (roofs now slippery) and behind a lighthouse wall (towers now stand against the world wall, route graph knows the walls); CPUs could not leave a pit (pits removed, they were a trap for the brain's own recovery); the scripted human released jump too early (short hops).
