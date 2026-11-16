# Non-CTF playtest pass, 2026-10-18

Build played: `smash-bal/artifacts/V1/index.html` (the integration build that is about to go live).
Tool: `scripts/playtest.mjs` in `.worktrees/playtest`, headless, real key presses and clicks, personas new / tryhard / explorer.
Run on battery (43-44% the whole time), one node process at Idle priority. No game file edited, nothing committed or pushed. Capture the Flag was not played (the menu walker only clicked through its two setup screens).

## What was played

| Shard | Scenes | Matches | Result |
|---|---|---|---|
| s501: FFA, 1v1, Teams (8 min) | 30 | 30 (12 FFA, 9 1v1, 9 Teams), 72 fighters seen | BUG 0, STUCK 0, SLOW 0, UI 0, FEEL 3 |
| s502: Boss Rush, World Cup, RUNNING! (8 min) | 18 | 18 (9 Boss Rush, 6 World Cup, 3 RUNNING!) | BUG 0, STUCK 0, SLOW 0, UI 0, FEEL 3 |
| s503: menus, training, tutorial (8 min) | 13 | 3 (training) | BUG 2, UI 1, FEEL 1 (all triaged below as tool timing or by-design) |

s503 also walked all 18 menu screens 7 times each and ran How to Play 3 times (2 finished, 1 left at step 8).

No CPU sat idle for 10 s or more. No unexpected words on the canvas during matches. The only words were names, numbers, Boss Rush cards and the Teams words you are keeping.

Match lengths (medians, matches at the 3-minute cap counted as 180 s): 1v1 33 s, FFA about 92 s, Teams about 151 s. 4 of 9 Teams matches hit the cap. Boss Rush, World Cup and RUNNING! had a median of 17 s.

## Confirmed bugs

### 1. Teams: a flanking CPU walks back and forth for about 100 s and never reaches its target
- **What a player sees:** in a 6-fighter Teams match on forest, Soap (team 1) paced left and right on the cross's top arm at 0% while its target Leafy sat in its own corner far below. Neither fighter lost a stock for about 100 s. The match ran past 3 minutes.
- **Cause:** `index.html:48568` (TEAM FLANK branch in aiThink, `FLANK_X = 240` at 48416) has no lower limit on `dy`, so it still runs when the target is far below and walks the CPU toward the target's x. Once the gap is 240 px or less, the scrolling-arena drop branch (`48579` / `48595`, `nearestDropX`) walks it toward the doorway, which pushes the gap back over 240. Then the flank branch takes over again, and this repeats forever. A per-frame probe showed only LEFT when the gap was over 240 px (3085 frames) and only RIGHT at 240 px or less (2794 frames).
- **Fix:** on line 48568, add `&& dy < FLANK_RISE + 80`, so a flanker already far above its target falls through to the drop logic and takes the doorway.
- **Exact repro** (the tool's own repro rolls a different lineup; use the scratch copy):
  `node C:\Users\carad\AppData\Local\Temp\claude\C--Users-carad--claude\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\playtest2\scripts\pt2.mjs --scene teams --seed 740157239 --arg persona=tryhard --arg "fighter=Golf Ball" --arg stage=forest --arg kind=teams --arg count=6 --arg stocks=3 --arg adv=0 --arg html=C:\Users\carad\Aardvark\smash-island\smash-bal\artifacts\V1\index.html`

### 2. Teams: CPUs keep swinging into and out of safe zones, where no hit can land
- **What a player sees:** three CPUs fight inside team 1's safe zone for about 35 s and nothing lands. Only the intruder's trespass bleed moves any numbers (Trophy 10% to 137%, Donut stuck at 44%). The same thing stalled the last 10 s of bug 1's match, and a 30 s stretch of another match (Fries, skytower). Matches run longer for no visible reason. After your team is out, you spectate hits that do nothing.
- **Cause:** aiThink's target pick (`index.html:48421` filter, `48440-48443` nearest foe) never checks zones. `applyHit` drops every hit on a target in its own zone (`44734`) and every hit thrown from inside the attacker's own zone (`44736`). Bleed is `ENEMY_ZONE_BLEED` at 44618.
- **Fix:** in the target pick, skip foes where `SETTINGS.mode==='teams' && inOwnTeamZone(t)` whenever another foe is available. When the CPU is in its own zone (`inOwnTeamZone(f)`), have it step out toward the target instead of attacking.
- **Exact repro:**
  `node C:\Users\carad\AppData\Local\Temp\claude\C--Users-carad--claude\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\playtest2\scripts\pt2.mjs --scene teams --seed 716537955 --arg persona=tryhard --arg fighter=Money --arg stage=pillars --arg kind=teams --arg count=6 --arg stocks=2 --arg adv=0 --arg html=C:\Users\carad\Aardvark\smash-island\smash-bal\artifacts\V1\index.html`

## Feel: questions for you

1. **Teams length.** The Teams matches that finished took 120-172 s. Part of that is bugs 1 and 2. Part is just 12-18 stocks in a stock match with no clock (`checkWin`, index.html:45262). After the two fixes, is about 2-2.5 minutes for a 6-fighter, 3-stock Teams match the length you want?
2. **Moves that fire a lot and never land** (CPU and player together, FFA/1v1/Teams): Needle counter.up 47/0, MeTag barrier.up 47/0 and barrier.down 19/0, Pin pierce.down 36/0, Baseball heavy.special 33/0, Pillow cast 28/0, Silver Spoon glowgold.up 23/0, Test Tube testtube.up 22/0. World Cup: Bot cheer.up 12/0, Spikey spikeburst.up 10/0, Loser cool.special 12/0 (also 6/0 in FFA), Fan leavealone.up 12/0. The counter and barrier moves may not be meant to hit at all. Do you want the others looked at (buffing reach or speed)?
3. **RUNNING!** All 3 runs were lost within 2-5 s: two falls at about x 1450 and one hit at x 2459. Is the opening stretch meant to be that harsh, or is it just the simulated player?
4. **World Cup.** Two 1v1 fixtures (Coiny, Remote) were over in 4 s. I did not look into why.
5. **Early KOs, for information only.** The simulated player lost a stock in the first 30 s in 9 of 17 FFA/1v1/Teams matches and 13 of 18 Boss Rush/World Cup/RUNNING! matches. It is a bot, so this alone is not a reason to change difficulty.

## Not reproduced, or by design (one line each)

- **Fries Teams on skytower hit the cap:** this was normal pace (12 stocks, 10 steady KOs, a live 1v1 at the cap). By design, since Teams stock matches have no clock.
- **5 Boss Rush caps on goiky, and 2 "nobody damaged the boss for 40 s" notes (Firey Speaker Box, The Bug Swarm):** tool artifact. The next boss waits 1.5 s plus that boss's ending hold in real time (`setTimeout`, index.html:15254), and the headless loop runs about 60x faster than real time. In a browser the gap is 1.5-3 s, and the ally hit each new boss within about 1 s. Optional hardening: count the gap in frames, so pausing also holds back the next boss.
- **"Esc did not pause" (x4, menu walker):** tool artifact. The CTF kit Save box focuses its name box with `setTimeout(..., 0)` (index.html:7170). The walker clicked Play before that timer fired, and the headless page let a hidden input take focus, which swallows keys (13055). A person cannot click that fast, and a browser will not focus a hidden input. Optional: focus only if `CTFKIT_UI` is still open.
- **Training "long match" (x3):** training is endless (99 stocks). By design.
- **Training "RESET" banner and "DMG n% · n %/s" meter:** these are training-only tools (index.html:59816, 59826), shown after R in training. Tell me if you want them gone too.
- **How to Play step 8, "Press V once to SMASH", not finished in 1 of 3 runs (14 tries in 21 s):** the other 2 runs passed it. Not re-run. The step needs one smash to add 5% (13841), so the simulated player probably missed.
- **Woody (explorer) on bigincin logged -145 damage taken:** not checked. It is probably the tool's counter spanning a KO and respawn. Repro: `node scripts/playtest.mjs --scene ffa --seed 250180162 --arg persona=explorer --arg fighter=Woody --arg stage=bigincin --arg kind=ffa --arg html=C:\Users\carad\Aardvark\smash-island\smash-bal\artifacts\V1\index.html`
- **3 more caps (Ruler skytower, Coiny fortress, Nickel (II) Teams forest):** these were explorer persona runs, which wander. Not a game issue.
- **Coiny slap moves never landing:** covered by the short-range decision.
- **Boss Rush "never landed" moves (Nickel flip, Profily punch, Leafy dash, and others):** the tool counts only hits on fighters, not on bosses.

## Performance (step time, headless, with another agent's tests running on the same laptop)

| Scenes | Frames | p50 ms | p99 ms | Worst ms | Over 16 ms / over 50 ms |
|---|---|---|---|---|---|
| FFA + 1v1 | 94,435 | 0.07 | 2.89 | 730.7 (1v1 seed 841198932, frame 2032) | 249 / 46 |
| Teams | 82,920 | 0.27 | 4.5 | 113.9 (seed 888183379, frame 5844) | 26 / 3 |
| Boss Rush | - | 0.02 | 2.12 | 783 (Pin scene, frame 448) | 162 / 27 |
| World Cup Teams / FFA | - | - | 6.19 / 4.06 | 74 / 13 | - |
| Menus + training | 18,422 | 0.03 | 3.24 | 40.2 | 14 / 0 |

p99 is under 7 ms everywhere. The two spikes over 700 ms are single frames, and I have not re-checked them while nothing else was running. Re-run those two seeds before treating them as real.

## Tool notes (playtester, not the game)

- The battery cap at `scripts/playtest.mjs:1360` splits on `/s+/` instead of `/\s+/`, so the on-battery time cut never fires.
- The repro commands leave out the html arg and do not quote names with spaces. Passing fighter or stage also skips rng calls (lines 662-686), so the lineup changes. Exact replays need the count and stocks args.
- In boss scenes, the 40 s no-damage timer should reset when a new boss appears (line 940), and the gap between bosses should not count toward the cap.
- The long-match threshold should scale with fighters x stocks instead of a flat 3 minutes.
