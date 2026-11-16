# "Pressed, nothing came out": diagnosis (no game changes)

Date 2026-11-12. Game file untouched. Scratch: this folder (`runs/` holds every run's stderr, report and json; `extract.py` prints the traced cases).
Honest summary first: **I could NOT reproduce the 207 events at anything like their original rate.** I traced 2 real cases plus 3 lost-tap cases. The class shares below come from 5 cases, not 207. Section 4 is from reading the source, not from measured cases.

## 1. How the playtest decided "nothing came out"
`scripts/playtest.mjs`, `armProbe` / `watchProbes` (about lines 470-630). The harness is a scripted player that drives the real `step()` itself (fake frame clock: `wo.frame`, one `step()` per harness frame) and sets keys through the game's own keydown/keyup path (`wo.down/up`, `wo.repeatHeld`).
- A probe starts on the first frame a tagged tap goes down (atk, special, smash, grab, fin).
- It is skipped ("not a fair test") if the fighter is in hitstun, frozen, in landing/end lag (`_lag`), held, rooted, self-stunned, Final-Smash-locked, hit-stopped, in a finisher lock, jailed, or in a CTF menu; or if the move's cooldown is running (`atkCd`, `spCd`, `smCd`, `fnCd`), or a smash is already charging.
- It passes as soon as a signature of the fighter (`sig(me)`) changes or a projectile/summon/beam appears. After 14 frames with no change it is `bad` -> a "BUG cant" finding. If the key never appeared in `wo.held` during the probe it is counted as `lostTaps` instead (a 25-35 fps machine model that drops taps shorter than its frame gap) and is NOT in the 207.
- NOT excluded by the probe: the Final Smash slow-mo / intro freeze (`fsTimeGate`), Remote's `_noBattery`, Rose's hush (`_hushT`), and anything that makes a move legitimately do nothing visible.
- Not deterministic: the same `--seed` and the same build give a different match (the game uses `Math.random`), so the summary's "repro" lines reproduce the setup, not the event.

## 2. Re-run
Up to 2 node processes at once, timeouts 150-200 s, `--arg html=` for the old build.

| set | build | runs | probes resolved | real cants | lost taps |
|---|---|---|---|---|---|
| the 12 repro lines of the summary | current HEAD d9ef2a9d | 11 | 733 | 0 | 0 |
| same repro lines | build of the run, ba178d54 (Nov 11 13:44) | 11 | 688 | 0 | 0 |
| fresh seeds, veteran + old-laptop personas, 1v1/ffa/teams, fighters from the worst list | ba178d54 | 28 | 2098 | 2 | 3 |

Real rate 2/28 = 0.07 per match (0.18 per match with lost taps) against 0.21 per match in the report. The sample is small; I cannot say the 207 are explained. Probe mix in the 28 runs: atk 889, special 717, smash 277, grab 99, fin 116. Smash, 60% of the 207, failed **0** times in 277 probes here.

## 3. Traced cases and classes (5 cases)
Traces: `runs/q*/*.json` (run `extract.py`).

| class | n | what the trace shows | would a human hit it? |
|---|---|---|---|
| A. Tap shorter than the step gap during Final Smash slow-mo | 1 (Book, jab, frame 10240) | Fighter fully ready (cd 0/0/0, lag 0, no hitstun). X down for 2 harness frames. `hazardT` advances only once per 4 frames (9997,9997,9997,9998...): `fsTimeGate` skips 3 of 4 steps (`FS_SLOW.k = 0.25`, 60 gate ticks). The 2-frame tap fell between two steps that ran, so the game never read it. | Partly. For about 1 s of slow-mo only every 4th step reads `down[]` (66 ms apart): a 40-60 ms tap is often missed, a 100 ms tap is seen. During the Final Smash intro (`FS.freeze`) no step reads keys at all. Rare moment (KO slow-mo), but a moment players mash. |
| B. Remote's reserve power ("battery out") | 1 (Remote, special, frame 690) | Ready, C seen, `_sp` went 1 (press accepted), `nb17` = `_noBattery` running; `fireSpecialInner` returns on its first line while `_noBattery>0`. Nothing spawns, no text. | Yes. A game rule with only a small status icon; a silent refusal is exactly "pressed, nothing came out". Rose's hush (`_hushT`) has the same early return. The probe does not know it is a rule. |
| C. Key never reached the game (tap shorter than a 30 fps machine's frame) | 3 (Remote atk, Remote special, Nickel special; old-laptop personas) | `wo.held` never held the key on a drawn frame. | Only on a real 25-35 fps machine; see section 4. Counted apart by the harness, so NOT inside the 207. |

Shares of the 5: A 20%, B 20%, C 60%. Of the two that fit the 207's definition: 50% A, 50% B. n is far too small to extrapolate. No case of hitstun, landing lag, endlag, shield, held state, cooldown or hitlag survived the probe filter, and the input queue was involved in none.

## 4. Can real keyboard input be lost? (reading artifacts/V1/index.html; not measured)
- **Level-sampled keys.** `keydown` sets `down[code]=true`, `keyup` sets it false (about lines 20684-20705). `step()` reads `down[]` once per fighter per step (about line 70722). A local player has no press latch (a remote guest's press is latched "since the last frame": netRemoteInput). So a keydown and keyup between two steps is lost. `tickClock` runs whole 16.7 ms steps (catch-up up to 4, all on the same `down[]`). A real press is 50-120 ms, so at 60 fps this is rare; at 25-35 fps, or after a stalled frame, a short tap can fall between steps; class A shows a 4-tick gap in slow-mo.
- **Hitlag.** Handled: `hitStopHold` copies attack/special/smash/jump into `_hsBuf` each held frame and `step()` replays it the frame hitlag ends (about lines 73355 and 70768). A press fully inside hitlag is kept. Arrows are not kept (they feed SDI).
- **Hitstun.** All inputs zeroed (line 70802). Special has no buffer. Smash: `_smBuf` is set before the stun mask but cleared when V is released (`if(!inp.smash) f._smBuf=false`), so a V tapped and released inside the stun looks lost (from code, not traced).
- **Buffers a human has:** jump 6 frames (`_jBuf`, only a jump with none left in the air), attack 8 frames (`_aBuf`), smash held-only. **Special (C), grab and finisher have no buffer**: C pressed during `spCd`, attack lag or the direction window and released is gone; a C still held when lag ends fires.
- **CPU versus human.** `CPU_PEND_MAX = 12` (line 106027): the CPU's hands keep the first newly decided press 12 frames and play it when ready, for every press kind. Humans get 8 (X), 6 (jump, air only), 0 (C), held-only (V). CPUs have a longer, fuller buffer than players.

## 5. Recommended fixes (not applied)
1. **Press latch (best value, lowest risk).** In keydown record the press; in `step()` treat `down[code] || latched` for one step, then clear (like the remote latch). Fixes the sub-step tap and class C, and most of A. Balance risk: very low (a tap is never lost; it cannot add hits the player did not ask for). Online risk: low-medium. Clients do not simulate today, so a host-only latch is safe; a guest's latched press must also be sent (netInputChanged sends on edges), or host and guest disagree. Any future rollback/lockstep needs the latch inside the recorded input.
2. **Do not skip input in the Final Smash gate.** Carry a press made on a skipped step (and during `FS.freeze`) into the next step that runs. Balance risk low (KOs only). Online: host-only.
3. **4-6 frame buffer for C, V, grab and finisher, like X.** Reuse the `_aBuf` pattern: remember the edge if refused for lag/cooldown/stun and play it on the first legal frame within N (6 is enough; CPU uses 12). Balance risk: low-medium, since specials and finishers come out a few frames earlier than today (stronger specials get stronger, punish windows shrink); it must not bypass `spCd`, `fnCd` or `FIN_HS_DELAY` (the 2026-11-04 hitstun-escape guard). Online: low if the host decides; the buffer is fighter state, not packet content.
4. **Feedback for silent refusals** (class B): a small "no" tick or text when Remote's battery is out or a fighter is hushed. No balance risk; a design choice for the owner.
5. **Fix the probe.** Exclude `_noBattery`, `_hushT`, `FS.slow` and `FS.freeze`, hold a probed key at least 4 frames, then recount. The count will drop, for a stated reason, not a tuned one.

## Not done / limits
- The original 207 events were not recovered (ranked.json and summary.md keep no per-event traces) and did not reproduce at their rate; I did not widen the sample to chase a number.
- A real keyboard, a real 30 fps rAF and online play were not exercised (no browser; live relay untouched).
- "TP old=1 new=1" lines in my stderr files are the teleport detector in `scripts/helpers/jank.mjs`, not probes.
