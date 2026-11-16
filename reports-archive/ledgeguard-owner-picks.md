# Ledgeguarding: the owner's choices (2026-11-02, question boxes)

The owner: "it is hard to ledgeguard, because cpus always go so high, i would never be able to hit them." and "ask me questions for what could make ledgeguarding better (more space to see offstage, more offstage, period, etc.)".

CHOSEN (every box was multi-select):
- SEEING OFFSTAGE: Camera zooms out offstage; Wider default view; Offscreen marker for a recovering fighter. (Not chosen: leave the camera.)  -> job wf_d8f296c2-ea9 (g-lg-cam), running.
- MORE OFFSTAGE: Bigger blast zones; Real edges on the five walled stages; Shorter recoveries for everyone (cap how high and far every up-special carries a fighter above the ledge); Smaller main platforms (all four).  -> NOT STARTED (after the CPU recovery study).
- LEDGE RULES: Shorter ledge invincibility (and no re-grab of the same ledge until the stage has been touched). (Not chosen: ledge trump, a time limit on hanging.)  -> NOT STARTED.
- GUARD TOOLS: No jump back after an offstage air hit; Recovery lockout after a hit (a fighter hit offstage cannot use the up-special for about half a second). (Not chosen: stronger spikes on down-aerials, a hit from the ledge.)  -> NOT STARTED.

Also: the CPU recovery-height study (reports/cpu-recovery-height.md, wf_c3f2ab78-b27) is running; its three human-like fix options go to the owner in boxes.

Plan: lane 2 (stage geometry: blast zones, edges on the five walled stages, smaller platforms; FFA / World Cup solo / Daily stages only, as the earlier recovery job did; Training stays flat; Teams, CTF, Moon Caves untouched) and lane 3 (mechanics: shorter recoveries, ledge invincibility and re-grab rule, no jump back offstage, recovery lockout) after the study, then one measurement of match flow and win rates (these changes make recovering harder: KO counts and fighter balance WILL shift: tell the owner and re-check the World Cup ratings if they ask). Picked magnitudes are the builders' to choose with measured reasons; the owner adjusts after playing.

## Later answers (2026-11-03)
- CPU recovery: the owner chose OPTION B "read the guard" ("also do the 1st thing") and added, typed: "first of all, if you are standing above someone when doing a move, they should at least be slightly be knocked downwards, right? so make more below stage area." = (i) a launch rule: a hit by an attacker ABOVE the victim knocks the victim at least slightly downward; (ii) more area BELOW the stage (the bottom blast zone farther out than sides/top).
- Everything is now one sequential job: wf_4b1e5807-262 (task w6mzlemw8) on g-lg-rules (.worktrees/lg-rules): MECHANICS (shorter recoveries, ledge invincibility + no re-grab, no jump back offstage, recovery lockout, downward knockback from above), STAGES (blast zones bottom-weighted, edges on the five walled stages, smaller main platforms), CPU (option B), then one short measurement. Camera job: wf_d8f296c2-ea9 on g-lg-cam. Merge both after their checks; expect balance and KO counts to shift.
