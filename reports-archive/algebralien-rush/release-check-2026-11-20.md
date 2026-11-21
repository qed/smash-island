# Algebralien Rush: release check (2026-11-20, checked into the 21st)

Branch `g-rushcheck` (off `g-update6` aa07a2d0). No game code was changed. Every run used a test copy in jsdom. No browser was used and the live relay was never touched. I did not flip RUSH_OPEN. While I worked, the lead said the owner chose "turn it on, but keep the system", so the RUSH_OPEN = true checks were done on a copy (section 4).

## Answer: READY TO OPEN on Sun 22 Nov, with three things to know first

It works from start to end: Play, nine bosses in order, the end screen, the pay, the save. There were no crashes, no soft-locks, no endless fight and no boss that could not be hit. It stays hidden on days that are not live. Nothing would be embarrassing in public, except possibly the first item below.

**Before or right when it opens (for the lead or the owner):**
1. **Credits.** On 11-11 the owner asked to hide the rush art credits until the rush opens. They sit in `docs/CREDITS-hidden-rush.md` with the note "put them back when RUSH_OPEN goes true". If it opens without them, the new boss art ships without its BFDI wiki credit lines. The last boss's lines are already written so they do not name it.
2. **The end screen shows two different times.** The first clear showed "Run time 117:05" and, on the same screen, "fastest clear 117:06". The run time drops the leftover part of a second; the record rounds it. A one-word fix is to round both (`oneMmss(Math.round(secs))` in `algRushWin`). I did not make it because my brief was crashes and soft-locks only.
3. **Two's SUN HUNT may have no fair dodge for the slowest fighters** (section 3). This is a design question for the owner, not a bug. I did not change it.

**Things that are by design but worth knowing:**
- The last boss's own intro sign writes its number on screen, and after it a defeat names it ("... was the ninth"). That is the approved design (its bar says "???" until the sign). It is only seen by someone who reaches the ninth boss.
- One's rush fight is her ordinary fight. It shows "ONE · phase N" and her five special names under her bar. Only players who have already beaten her get that slot.
- It is LONG. A CPU needed about 117 minutes of fighting to clear it with help (section 2). A human will be faster, but the spec's 30-50 minutes for a clean clear looks optimistic since the 11-10 difficulty pass.

## 1. The plan against the code

The spec (`spec.md`) lists M0-M17 plus the owner's gate G1. The owner later changed things that the code follows, not the spec: 3 stocks, +1 per boss, at most 5 (spec: 4 / +2 / 6); hits 1.5x; combos in last phases; Two and Four with seven moves each; Six with three phases and new moves; extra picks for every boss (`owner-rules.md`, `attack-picks.md`).

| Milestone | Built? | Evidence |
|---|---|---|
| M0 renders | yes | 23 rush sprites in `assets/sprites` (Nine 11, Six 3, Zero 3, X 3, Three 3) plus three last-boss renders; ledger rows say each was looked at |
| M1 shell: dates, switches, save, page, title card, strip, two looks | yes | `rushWindowOf`, `rushPay`, `rushGrantLooks`, `buildRushPage`, `refreshRushCard`, `rushQuietLine`; looks `cd_mathnight`, `ti_topclass`; checked in sections 2 and 4 |
| M2 conductor: retry, interlude, pips, stocks, pay | yes | `startAlgRush`, `algRushBegin`, `algRushFelled`, `algRushLose`, `algRushRetry`, `algInterDraw`, `algDrawPips`; the full run used all of them |
| M3 big stage and boss kit | yes | `algBuildBig` (2,400 px, 800 px walls), `algCamTarget`, `algLeash`, `algBossHit`, `algExpose`, `algDrawFoot`, `algJump` |
| M4 Two / M5 Four (rush versions) | yes | `twoRush`, `fourRush`, `fourLeashFx`; 9 and 10 moves in the picker (the owner's seven plus old moves brought back on 11-10) |
| G1 owner feel check of Two and Four | partly | the owner played the rush on 11-10/11 and sent notes (Four's screechy, Zero); no record of a full run by the owner |
| M6-M7 Nine | yes | `nineSpawn`, `nineFire`; 5 moves in phase 1, 7 from phase 2 |
| M8 Six | yes (owner's revision) | `sixSpawn`, `sixFire`; 3 phases, ROUND THE WORLD in phase 3 |
| M9-M10 Zero | yes (owner's rework) | `zrSpawn`, `zrFire`; 5 / 8 / 8 moves by phase |
| M11-M12 X | yes | `xvSpawn`, `xvFire`; 6 moves, BURNING! from phase 2 |
| M13 One in the rush | yes | `algOneEnded`, `startOneFight(..., { rush:true, hp, stocks })`; bar 2,400 with a line every quarter |
| M14 Three | yes | `thSpawn`, `thFire`; 6 moves, 2 phases |
| M15-M16 last boss | yes | `nbSpawn`, `nbLightsStart`, `nbPhase`; 6 moves, 8 from phase 2 |
| M17 release gate | done 11-11 by a harness that cut boss HP; this check does it with real fights | ledger 11-11; this file |
| "The owner finishes a run, then flips RUSH_OPEN" (M17) | NOT recorded | the owner said "turn it on" today; whether they played a full run is theirs to say |

Not checked against the spec: how each move looks, the ending scenes by eye (I used no browser), and whether every attack gets harder by phase.

## 2. The whole rush with real fights

Harness: `scratchpad/rushcheck/fullreal.mjs`. RUSH_DEV was on in the test copy. The clock was Sun 22 Nov 12:00 UTC and the player had beaten One, so all nine bosses were in the run. The start went through the real screens: rush page, Play button, select screen, start. The game's own Expert CPU played Firey. **No boss HP was ever cut.** Each boss got two plain tries. On a loss, the real "Retry boss" button was clicked. The third try was **assisted**: the CPU's stocks were topped up when they reached 1, so only the boss's HP could end the fight.

- The Expert CPU **lost both plain tries against every boss**. That is the CPU's weakness, not a verdict on the game (the owner's rule is never to tune for bots). Every assisted try **won**, so every boss can be beaten and every fight ends.
- Order: Two, Four, Nine, Six, Zero, X, One, Three, last boss. 9 interlude cards, 27 tries in all, 18 retries counted.
- Stocks: 3 to start, then stocks left plus 1, never above 5 (for example 2 left gave 3, 3 left gave 4).
- Defeat screen: "Defeated", "Zero was the fifth. Retry it with 3 stocks.", the "Retry boss" button, and a note such as "Retries so far: 8 · +40 Win Tokens this run".
- End: "Rush cleared", "Run time 117:05 · 18 retries", "+150 Win Tokens · first clear: two new looks · Your best: 9 bosses · fastest clear 117:06 · cleared once" (see item 2 at the top).
- Pay: the rush ledger got exactly 10 per boss plus 60 for the clear, 150 in all. The wallet also got 72 from the existing weekly boss quest, because rush bosses count for quests by design.
- Save: `profile:v1` holds the rush record (best 9, fastest, 1 clear, all nine seen, the pay lines). A fresh boot loaded from that save brought back the record and both looks. Paying the same line again paid 0. The next window (29 Nov) pays again.
- 0 page errors and 0 canvas faults in 151 game minutes, drawn every 15 frames. No NaN in boss position or HP.
- Boss times with help (CPU, not a human): Two 4:27, Four 5:20, Nine 7:52, Six 9:44, Zero 21:02, X 7:20, One 33:18, Three 10:49, last boss 17:13. The longest stretches with no damage to the boss were Zero 64 s, One 61 s and Six 30 s (69 s in one of her plain tries). None of them got stuck. Zero's first phase (his guard ring of six small Zeroes) took the CPU 15 minutes.

## 3. Fairness: a dodge audit of every move

Tools: `scratchpad/rushcheck/dodge.mjs`, then `search.mjs`. They work like the Boss Rush audits' scripted lines, plus the hit-guided search from the 11-10 rush proofs. Setup: the real fight in each phase, the move forced through the picker, the boss parked as soon as the move ends, so these are **single moves; combos were not re-checked**. The fighter was the worst case used before: Tree's run speed (4.28 px a frame) with Spongy's weak jump (0.868). Reaction starts 12 frames after the wind-up begins. There were three starts per move: 220 px from the boss, 480 px, and 900 px (the leash pops the boss closer).

- 150 move-and-phase rows across 8 bosses (One was not re-audited: she is the existing secret boss and is covered by the Boss Rush audits). Simple scripted lines dodged every start in 133 rows.
- The 17 rows that were left, plus Two's phase 1, went to the deeper search. A dodge was found for all of them except:
  - **Two, SUN HUNT, every phase:** for the worst-case fighter, no dodge from 2 of 3 starts in each phase. A normal fighter (Firey, own jump) found a dodge from 6 of the 7 starts tried; only phase 3 from 900 px failed. Every dodge found needs constant direction changes and hops. The sun lands where you will be, leads your run and hurts while it lies flat. **Owner question:** is that fair for the first boss? This is Two's opening fight, and it is the only move of the 150 checked like this.
  - **Last boss, ROOT THEM OUT, phase 3, from 480 px:** none for the worst-case fighter; Firey found one. Probably fine.
- "No dodge found" is not proof of unfair: a better path may exist. "Dodge found" is proof that one exists.

## 4. The date rule and staying hidden

Script: `scratchpad/rushcheck/dates.mjs`, run with the computer set to New York time, 28 of 28 pass.
- UTC days that open it: **November 2026: 22, 23, 29, 30. December 2026: 22, 23, 24, 29, 30, 31.** January 2027: 22-24 and 29-31; February 2027: none. On every day of 2026-2028 the game's rule matches a plain "4th and 5th time this weekday comes up, in a month where it comes up 5 times" count. Midnight edges are right (21 Nov 23:59:59 closed, 22 Nov 00:00 open, 24 Nov 00:00 closed, and so on).
- **As committed (RUSH_OPEN false):** on the 20th and the 22nd there is no title card and no line on the event page. go('rush') stays on the title. Play, the run start and the dev jump all refuse. "Algebralien" appears on none of the 24 screens.
- **With RUSH_OPEN true (copy) on a non-live day** (20 Nov, 21 Nov 23:59:59, 24 Nov): no title card. The event page has the line "Algebralien Rush · next live Sun 22 Nov" (on the 24th: "Sun 29 Nov"). The rush page says "Next live: Sun 22 Nov, 00:00 UTC (Sat 21 Nov, 7:00 p.m. your time)". Play is disabled, and the Play click, the run start and the dev jump all refuse.
- **With RUSH_OPEN true on 22 Nov 00:00:05 UTC:** the title card shows ("★ ALGEBRALIEN RUSH", the "?" strip, "Live now · ends in 2 days", "Rush ▶"). Play is enabled, goes to the select screen, and a run starts. The dev jump still refuses without the owner's flag.
- **Names:** none of the never-shown names, and no form of the last boss's number, is visible on any of the 24 screens in any case checked, including a player who has beaten One. Opening the rush adds no capital "One" to any screen for a fresh player. The rush page and title strip show "?" for bosses not met, eight slots for a fresh player and nine after One is beaten. In fights, the canvas writes no hidden name except the last boss's own sign (see the top). Its boss bar says "???".

## Not checked
How anything looks (no browser), the move tells by eye, combos (single moves only this time), One's moves, online (the rush refuses in a room by design; not run), a human's pace, and whether each attack gets harder by phase.
