# Readiness jury: is the game ready for competitive play?

Build read: `artifacts/V1/index.html` on ii-dlc (the Friday build, Update 4). Line numbers are from that file today. Read-only: no game file edited, no push, no browser, no relay contact. I ran no node checks (see section 5). Everything below comes from reading code and the reports; where a number is mine it is arithmetic from a constant in the code and says so. Guesses are marked GUESS.

## Short verdict

The game is a fun, content-rich party fighter with a real, readable core (fixed 60 Hz step, shields, DI/SDI, movetech, 4-5 stock options). It is not yet a competitive platform. The two things that decide it are structural, not balance:

1. Online is host-authoritative with no rollback. The host plays at zero latency and every guest attack waits a round trip. That cannot be called fair for ranked or money-on-the-line sets.
2. There is no competitive ruleset layer: no stage legality list, no stage strike/ban, no set/best-of tracking, no timer in normal matches, no result record. Every setting is free, including items, Smash Balls and hazard stages.

## 1. Verdict per format

| Format | Verdict | Why (evidence) |
|---|---|---|
| Casual online 1v1 (friends, a room code) | ALMOST | It works and had a lag pass (reports/online-lag.md): 46-67 KB/s at 2-4 players, guest state matched host in 9 runs. Guest movement is predicted (NET_PRED, line 123680; guest keys carried frame-stamped, NET_IN, 123611). But attacks, hits and everything non-movement are the host's alone (comment at ~123665: prediction stops at attack/special/smash/flag). Fine between friends; a 120 ms guest vs a 0 ms host is a different game. Online was only ever tested offline for new maps/OCs (feature-scores.md: "Online play 7"). |
| Ranked online | NOT READY | No ranking, rating, matchmaking, identity, or server-verified result exists. The "Fighter Rankings" screen is a per-device fighter strength table (DWS), not player ranks (line 1540). The relay is a plain room relay (RELAY_URL, line 123886). The host runs the simulation and reports the game, so a host can lie, disconnect to dodge a loss, or simply win on latency. There is also the host advantage above. Ranked also needs a disconnect rule; I found no reconnect or forfeit handling in grep (not exhaustive). |
| Local tournament (one room, two people, bracket run by an organizer) | ALMOST | The fight itself is playable: fixed 60 Hz step with render interpolation (loop, ~28907), stocks 1-5, CPU-free 1v1 possible, gamepad polling exists (line 20724). Missing for a bracket: a stage list the TO can enforce, a set counter, a match timer, a clean "no items/no balls" preset, and a rule for the hidden-input issue below. The built-in World Cup / Flag Cup are CPU tournaments (line 1825+), not human brackets. |
| Online tournament | NOT READY | Everything above, plus: no spectate for online (spectator is CTF CPU-only, ~line 9041), no replay save, no ping display I could find, one host-authoritative path, and the quality of the "move did not come out" problem (below) is unmeasured under latency. |

## 2. Blockers (what stops a READY)

B1. **Host advantage, no rollback.** `loop()` ~28907: a client never simulates; it sends inputs and draws host snapshots. Guest prediction covers run/jump/ledge only (`netPredOut`, ~123685; `busy` list is very long). A guest's attack input reaches the host after one-way latency, is resolved there, and returns after another. Rough arithmetic at 120 ms ping: guest sees its own attack's result about 7 frames later than a 0 ms host would; the host's attack is seen by the guest 3-4 frames late with no shared timing. Not a tuned number, an order of magnitude. Fix is not small (see improvement 3).

B2. **Players can lose inputs.** playtest-v2/focus-group.md item 1 and game-rating.md: 207 "pressed, nothing came out" events, smash eaten for 14 frames, and the veterans group (most willing to keep playing, 62%) called "do not trust my inputs" their top issue. Marked "probably real (check first)" by that report; it came from a bot, so not proof. Still, for competitive play this is the first thing to verify by hand. (Related code: `CPU_PEND_MAX` buffer for CPUs at line 106027 exists, I did not find an equivalent human input buffer; not verified.)

B3. **No ruleset/stage layer.** `SETTINGS` (line 6308) holds mode, count, stocks, items, mapSize, smashBalls; `STAGES` (line 6105) is a flat list of about 20 normal stages including hazard stages (Evil Forest, Incinerator, Windy Heights, Shifting Isles, Frozen Pond, Moon) and "big" maps. Nothing marks which are fair 1v1 stages. Evil Forest damage was flagged "real" in the focus group (item 4). There is no counterpick/strike flow.

B4. **No match timer outside World Cup.** The time-limit exists only for cup matches (`TOURNEY_TIME_LIMIT`, line 21493; "side with more stocks wins"). A normal stock match has an anti-stalemate ramp for CPUs (`lastKoFrame` 105026) and nothing for two humans who camp. Playtest found 24 of 965 matches with no KO for 60 s, mostly CPU behaviour (CPU-only cases untested).

B5. **Per-fighter special cases pile up in the damage path.** `applyHit` (line 97496) is about 250 lines with dozens of fighter-specific multipliers (Book stacks, Paintbrush rage, Pillow KO stacking, Golf Ball curse, Paper evil, etc). 458 `Math.random` uses in the file. That is fine for a host-authoritative party game and a real obstacle to any later rollback, deterministic replays, or a frame-data page that is actually trustworthy.

B6. **Balance spread.** winrates.md (2026-10-28, vs Hard CPUs, 15 matches each, noise of roughly +-2 wins by the report's own admission): 100% to near 0%; top KO moves are often a plain jab (Firey 23, Magnet 23, Cake 22 jab KOs). 111 fighters with a 100% -> 0% CPU spread does not make a viable tournament roster without a legal list. feature-scores.md rates Balance 7 and says it needs "a fresh panel after the latest moves"; Update 4 changes run and air speed for most of the roster, shield breakers, smashes and 46 moveset remakes after that table. So the table is stale. Bow, the 15 OJ-free mid-pack opponents, and the 8 jab-less bottom kits are known issues in reports/bottom-fighters.md.

## 3. Mechanics read (what is actually there)

- **Hit stun and grace** (lines 97418-97424): stun = clamp(6+dmg, 4..24) + 6; grace = min(24+6, 9+6+0.6*dmg). For a 3% jab that is 15 frames of stun and 17 of grace (arithmetic from the formulas). Grace blocks other attackers and the same attacker's next move unless a chain is open (`chainOpen`, line 73080; `graceBlocks`, 97370). Consequence: no true double-team combos; a 2v2 partner cannot follow up a hit during grace. This is a deliberate anti-chain design (the owner's), but it flattens 2v2 team play.
- **Shield** (`ZS`, line 86218): meter 50, drain 0.06, regen 0.12, break 120 frames; a grab breaks a raised shield and stuns the grabber for 40 frames (`SHIELD_GRAB_STUN`, 86224); twelve neutral smashes break shield (Update 4). Shield grabs are therefore punished, which makes "shield-grab" a bad option and changes the neutral. Hitstun check in `zsBlock`: you cannot shield while in hitstun.
- **DI/SDI** (lines 73144-73200): 15 degree DI, SDI 6 px a tap, 18 px max per hit, hitstop 2-6 frames. Reasonable and legible. CPUs use it by level.
- **Ledge** (lines 24236-24262): moving into a cliff face within 30 px of the top puts you on the ledge outside hitstun. There is no hang state, no ledge invincibility, no ledge trump rule, no getup options. Ledgeguarding is therefore about space and timing only. Not wrong, but it removes a major part of what Smash players think of as competitive depth.
- **Defense**: shield, jump, wall jump, fast fall, short hop (movetech). I found no universal spot dodge, roll or air dodge (the `_roll` hits were 8-Ball's special). GUESS: that makes recovery/escape rely on movement only. I did not exhaustively grep the control handler.
- **Frame data**: Update 4 added frame budgets, gathers of at least 6 frames, 45-frame control cap (update-4-draft.md). Good for readability. No public frame-data table exists in the game; the per-fighter card text gives % and reach, not startup/active/endlag.
- **Timestep**: fixed 60 Hz step with render interpolation (loop ~28907, `GRAV` line 28725). Good: the sim does not depend on frame rate. Hidden-tab host runs on a worker clock (line 28739).

## 4. Top 10 improvements, ranked by impact divided by cost

1. **Competitive ruleset preset (cost: small).** One toggle in lobby/setup: items Off, Smash Balls Off, 1v1, 3 stocks, 7-minute timer, only a "legal stage" list. Change `SETTINGS` defaults for the preset (line 6308) and mark stages with a `legal:true` flag in `STAGES` (line 6105). Start list GUESS: Goiky Field, Stone Pillars, Dream Island, and any other hazard-free, edge-clean stage after a read. Verify: headless run that creates a preset match and asserts items=0, smashBalls=false, stocks=3, stage in the legal list; a manual 3-min match.
2. **Match timer for normal matches (small-medium).** Reuse the cup's rule at line 21490 (more stocks, then lower %, then sudden death) for all human 1v1. Verify: run a match to the limit with two idle fighters and check the tie-break order; make sure it is off for boss/CTF modes.
3. **Online fairness mode: input delay or host handicap (medium; full rollback is large, not recommended now).** Honest option: add a fixed input delay to the host's own fighter equal to half the measured RTT (the host's input is played N frames late so both players see the same delay), and display ping. That levels the host advantage without a rewrite. Verify: two offline fake sockets with a 120 ms simulated wire (scripts/helpers/net-pair.js exists); measure frames from press to first active frame for host and guest; target within 2 frames. Full rollback would need removal of most `Math.random` from the sim: out of scope.
4. **Verify and fix the eaten-input problem (small-medium).** Reproduce a smash press on frame N of the previous action's endlag and see whether it is dropped. Add a 4-6 frame input buffer for humans (CPUs already have `CPU_PEND_MAX`, line 106027). Verify: scripted press at each frame of end lag, count dropped presses before and after.
5. **Result record and a best-of-N set counter (small).** After each match store winner/loser/stage/stocks locally and show "Game 2 of 3" with a running score; add a Rematch-with-stage-lock button. The Rematch button is at line 2069 and `rematch()` at 21303. Verify: play three CPU matches and read the score.
6. **Stage strike/ban for sets (medium-small).** A 3-step strike screen over the legal list, winner bans last. Verify: a headless flow that takes two actors through the strikes and ends on a stage in the list.
7. **Fresh balance panel and a legal-fighter shortlist (medium; mostly compute).** Re-run the win-rate table against the current build and publish a "tournament tier" list. Winrates.md is two updates old. Verify: the standard 15-match run for each fighter after Friday's build; do not tune to hit a target.
8. **Ledge and defense depth (medium-large, design call).** Ledge invincibility with a limited count, plus a roll/spot dodge/air dodge with fixed invulnerability frames. This is a big feature and the owner's "feature freeze" rule applies; list for the owner, do not do without the "pipis" keyword. Verify: frame tables from a headless script.
9. **Frame data viewer in Training (medium).** A toggle in Training showing startup/active/endlag and hitstun for the last move. The data already exists in move rows; the frame budget work added the numbers. Verify: cross-check 5 fighters against their move tables by hand.
10. **Online spectate and replay save (large).** The host already produces authoritative snapshots; a third client can be sent the same stream. Replays could save the snapshot stream. Verify: join a third offline fake socket as spectator and compare draws. Lowest priority because it only matters once the first nine exist.

## 5. Persona one-liners

- **Top Smash Melee/Ultimate player:** "I like the shield break and DI, but without a ledge game or a dodge I have no neutral to speak of, and the jab does too much of the killing."
- **Rivals of Aether player:** "Fixed 60 Hz and wall jumps are good; hit grace blocks my follow-ups and I would want one or two stages with no gimmicks first."
- **Tournament organizer:** "No legal stages, no set counter, no timer, items on by default: I cannot run a bracket without writing my own rules on a poster."
- **Frame-data nerd:** "Update 4 finally put numbers on lag, but there is no readout and the damage path is 250 lines of special cases I cannot trust."
- **Netplay-sensitive player at 120 ms:** "I am the guest, my attacks come back a round trip later, and the host never feels it. I will not play ranked like this."
- **Mid-level ranked grinder:** "There is no ladder, no rating, no matchmaking; I would farm Fighter Rankings and that is a CPU table."
- **Spectator/caster:** "I can watch a CPU CTF match, but I cannot watch two people play online and there is no replay to clip."
- **Skeptic (it is a toy):** "A hundred and eleven fighters with a 100% to near 0% spread and hazard stages is a party game; call me when there is a legal list and a ranked mode." Fair on ranked, wrong that the core is a toy: the core is sound.

## 6. What I could not check

- Real latency, jitter and packet loss. Only the offline pair helpers and the earlier report exist; I did not run them. No contact with the relay (as ordered).
- Whether human inputs are really dropped (the 207 events came from bots; no human test).
- Whether a universal dodge/roll exists beyond what grep showed.
- The current win rates and tiers on the Friday build; winrates.md is from 2026-10-28.
- Controller feel on real hardware, and the 144 Hz picture quality.
- Anything hidden (unreleased fighters, hidden maps, the hidden Rush): out of scope and not described.
- I ran no node checks at all; every figure is read from code or reports, with the arithmetic noted. I did not tune anything or fabricate results.
