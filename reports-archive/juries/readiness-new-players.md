# Readiness jury: is the game ready for NEW PLAYERS?

Build read: artifacts/V1/index.html on ii-dlc (11,818,545 bytes, 133,779 lines, CRLF). Read-only; nothing edited, nothing pushed, no browser, no live site, no relay. All line numbers are in that file.

**What this is and is not.** I read code, the owner-facing reports (playtest-v2 summary, game-rating, focus-group, feature-scores, update-4-draft) and ran two tiny node checks. I did not play the game and I did not see or hear it. The playtest-v2 numbers are from 80 SIMULATED people (the reports say so); I treat them as leads, not facts. Guesses are marked GUESS.

## (1) Verdicts

| Stage | Verdict | One-line reason |
|---|---|---|
| First 5 minutes | **ALMOST** | One big obvious button and a skippable 9-step lesson are good; arrow-key defaults, hard-coded key text, a Normal-skill 4-CPU first match and a possibly slow cold load are the gaps. |
| First 30 minutes | **ALMOST** | Content is rich and unlocks drip fast, but the first match is not eased, "move did not come out" and stalled matches are unresolved, and nothing steers a newcomer from the lesson to a good second activity. |
| First week | **NOT READY** (for a player with nothing pulling them back) | Seven starters, a drip unlock, quests and a Daily exist, but no visible "what next" path, the simulated veterans would keep playing at 62% but recommend at only 33%, and the biggest content (Algebralien Rush, OCs, Moon Caves, big maps) is hidden or not yet player-tested. Mark: partly a judgement call, since retention cannot be measured from code. |
| Returning player | **READY** | The What's-new card shows once per version with a changelog (lines 19613-19630), settings and remaps persist, picks are remembered. Small gap: the card is gone after one view. |

### Evidence behind the verdicts

First 5 minutes
- Title has one dominant button, "Take the Plunge" (line 1109): a fresh install is sent to the lesson, a returning one to the select screen. Secondary buttons are small and grouped (lines 1112-1118). Good.
- The lesson (TUT_STEPS, about line 21500) is 9 steps, shows "Step N of 9 - Esc to skip" on screen (drawTutorialPrompt), a nudge banner repeats every 7 s if stuck, and the dummy cannot fight back. Finishing it unlocks Firey Jr. Good.
- But its text is hard-coded to the default keys ("Press X", "Press C", "Press V", arrows). The How to Play card (line 1862 on) is static HTML with the same keys. A player who remapped (or a WASD player) is told the wrong keys. Remap works (0 failures in 840 rows, playtest-v2) but the teaching text ignores it.
- Default keys are arrows + X/C/V + Z (line 6239). A one-time "those keys do nothing, use arrows" line now exists for W/A/S/D and I/J/K/L (keyHintPress, line 20629), but it only appears on the PAUSE card or the RESULT screen, after three wrong presses. A player who is stuck mid-match and does not pause will not see it. (The playtest said 4 of 4 WASD probes saw nothing in the first 4 s; this partly addresses it.)
- Esc now goes Back on menus on ii-dlc (update-4-draft line 20). The v2 run was on a build before that; I did not re-verify it.
- The first match after the lesson: SETTINGS default is Free-for-all, 5 contestants (you plus 4 CPUs), 3 stocks (line 6308) at CPU Skill Normal (`AI_LEVEL = 1`, line 104323; select-screen default `class="on"` on Normal). Easy exists but is under "More options", folded away. Nothing makes the first match easier. GUESS: a 5-way scramble against four Normal CPUs after a one-dummy lesson will often end with a new player KO'd early; the simulated kids' 5.2 clarity score and the "KO'd in first seconds at 0%" complaint (16 of 80) point the same way, but the bot walks off ledges on purpose, so that number is inflated.
- Load: index.html is 11.8 MB raw, about 3.76 MB gzip (I measured with python gzip -6; Vercel may serve brotli, GUESS ~2.7-3.3 MB). Almost all of it is one script of 11.6 million characters. On my machine V8 compiles it in 162 ms (vm.Script, no run); this is a fast desktop, so it says nothing certain about a school Chromebook. GUESS: 2-6 s of parse plus run on a cheap Chromebook, plus download time on school Wi-Fi, on a page whose first screen is a title. 36 MB of assets (21 MB sprites, 12 MB music, 3.6 MB CTF) are separate files; I did not measure how many load before the title or the first match.

First 30 minutes
- 7 starters (STARTERS, line 19731) and 52 more that "drip" in by playing (UNLOCK_ORDER, line 102041); the roster line reads "N of M fighters unlocked - play to earn more" (line 20098). That is a clear goal. I did not measure how many matches per unlock (the comment says "fast drip"; not verified).
- The select screen puts mode, stadium, contestants, stocks and CPU skill on one screen; modes are four toggles (Free-for-all, Teams, Capture the Flag, Boss Rush, line ~1690). Capture the Flag forces a play-along practice first (good), Boss Rush has no such gate (GUESS: fine, it is a fight).
- Playtest-v2 (simulated): 63 s median to the first FFA match from the title for a reader, 28 of 80 would have left the menus once before their first match, 15 gave up on a screen; 22 of 80 named "menus too wordy". Part of that is the bot's longer routes.
- Open bug leads that hit feel: "my move did not come out" 207 events (probably mostly the tester, unproven for specials and attacks), stalled matches that do not end (24 matches of 965; the ii-dlc "deadly gorges" merge targets this, unverified by me), Evil Forest damage blowouts (20 of 80 complained).
- The pause card has a Move list button (line 1844) and fighters have an All moves tab. Good.

First week
- Retention hooks exist (Daily match, Quests/Store/Wardrobe in the Locker, World Cup, Boss Rush 12 bosses, Flag Cup) but none is introduced by the game after the lesson. The title shows a Daily card and wallet; nothing says "next, try X".
- Feature scores (feature-scores.md): Balance 7, CPU 7, Online 7 ("only offline-tested with real players"), Teams 7, Big Teams maps 6, OCs 6, Event contests 6. No area is 10.
- Simulated retention: "keep playing" 45% yes / 55% maybe, "recommend" 36% yes (game-rating.md). Kids 33%, teens 27%, old-laptop recommend 0%. These are the bots' scores and the report itself says so.
- Online play is the natural week-one pull ("never propose same-computer 2-player", per the owner). It needs a friend; a cold visitor has none. I did not test it and must not touch the relay.

Returning player
- What's-new card: once per version, not shown on a first-ever visit (refreshWhatsNew, line 19613). A permanent Changelog screen exists. Remaps are saved (keymap key). Chosen fighter is remembered (80/80 in playtest-v2).

## (2) Friction points

| # | Where | What a new player hits | Evidence strength |
|---|---|---|---|
| F1 | line 6239 DEFAULT_KEYS, line 20629 keyHintPress | Arrows + X/C/V is not what most PC players try first (WASD / J K L). The "use arrows" line shows only on pause or result screen, after three presses. | Code certain; how many people it hits is a GUESS |
| F2 | lines 21500-21515 TUT_STEPS; line 1862-1880 How to Play card | Lesson and card hard-code "X / C / V / arrows"; a player who remapped, or the pause card's "Esc to carry on" (line 1840) after remapping Pause, sees the wrong key. | Certain (read) |
| F3 | line 20725 pollPad | Gamepad: first pad only (`getGamepads()[0]`), fixed button layout (A jump, X attack, Y special, B or RT smash), NO shield/sprint button, NO pause/Start button, NO remap, and menus cannot be driven by the pad at all. No page (controls, faq) mentions gamepads. | Certain (read); I did not plug in a pad |
| F4 | line 6308, 104323, select screen | The default first match is 5-way FFA, 3 stocks, Normal CPUs. Easy is hidden in "More options". | Certain; the effect is a GUESS |
| F5 | line 1109 | Title has no direct "Quick match" or "Boss Rush" button; everything goes through select (3 clicks). Intentional (title keeps six buttons). | Certain |
| F6 | play-along: playtest-v2 "How to Play step 8" | Step 8 needs a smash that lands; 3 simulated people could not finish in 22 s. ii-dlc added a "Missed! Try again closer" banner (line 21555). Fixed in code, not re-tested by me. | Partly fixed |
| F7 | whole file | 11.8 MB single file, 11.6 M chars of script parsed before the first paint (GUESS on the Chromebook cost). No loading indicator found in the code (grep "Loading" only matched a comment). | Size certain; time GUESS |
| F8 | playtest-v2 summary items 3, 4, 7, 8 | Moves that seem eaten (207), matches that stall (24), blinking fighters (3,722, mostly up-specials by design), walking into nothing (not wall-aware detector). Cause unknown for the first; do not treat the rest as proven. | Simulated; mixed |
| F9 | playtest-v2 game-rating, Evil Forest | Huge damage numbers (400-1,373; a % past 1,000). "Thought the game had broken." | Simulated, repeated pattern |
| F10 | line 1235 Learn screen; title row | Help is spread over How to Play, Learn, Move list, Training, CTF practice, FAQ pages; none offered after the lesson. | Certain |
| F11 | line 19731 STARTERS, 20098 | Only 7 of ~59 base fighters open at the start; 4 of the 7 are objects with no obvious pick order; no "recommended first fighter" hint in the select screen header ("Click a fighter, pick a stadium, then start", line ~1605). | Certain |
| F12 | color blindness | Team shapes (circle/triangle/square/diamond) exist (line 6422). No general colour-blind option; I found no setting that changes damage-% or hit effects colours. | Certain for what I found; may be incomplete |
| F13 | accessibility | Screen-shake toggle and reduced-motion CSS exist (lines 161, 450, 1072). No text-size, no high-contrast, no "hold to" alternative. Sound/music toggles exist. | Certain |
| F14 | line 1100-1118 | Title footer is a wall of small credit/disclaimer text (3-4 lines) plus "build v70" and music credits. Cosmetic. | Certain |

## (3) TOP 10 improvements, ranked by impact divided by cost

1. **Show the controls where the eyes are: a 6-second "Move: arrows  Attack: X  Special: C  Smash: V  Shield: Z" strip at the start of a player's first 3 matches** (draw into the canvas HUD, using the real KEYS names via niceKey, line 20655). Cost: small (one draw function). Verify: boot jsdom or the harness, start an FFA, assert the strip text matches KEYS after a remap, and that it is absent from the 4th match.
2. **Make lesson and How to Play text come from KEYS, not literals** (TUT_STEPS text becomes a function; the card's tut-key cells filled from KEYS). Fixes F2 for every remapper. Cost: small-medium. Verify: change KEYS.attack to KeyJ, open the lesson, read step 3's text and the card; both say J.
3. **Add Start/Options = pause and a shield button to the gamepad poll** (buttons 9 and 4/5 or 6; shield in `down[K.shield]` line 70737 also reads pad). Cost: small. Verify: unit-feed a fake `navigator.getGamepads` with button 9 pressed and see setPaused toggle; with button 6 and see `inp.shield`. Do not assume it works on a real pad (not testable here).
4. **Lower the first match's difficulty once**: if the lesson was just finished (or no match played yet), preselect 3 contestants and Easy CPU, shown as a visible choice with "Normal" one click away. Cost: small; the owner's rule "never tune difficulty for bots" is about bots, this is for a human beginner, so ask the owner first. Verify: fresh profile, finish lesson, open select, read SETTINGS.count and AI_LEVEL; later matches go back to the player's own choice.
5. **Show the key hint on the match screen (not only on pause/result) the moment a W/A/S/D press does nothing**: reuse keyHintPress (line 20629) but draw a banner in the match after 3 stray presses. Cost: small. Verify: the existing WASD probe in scripts/playtest.mjs (`--scene wasdprobe`) should now see text on the match screen.
6. **Post-lesson "what next" card on the select screen** (3 lines: try a 1v1 vs Easy, try Boss Rush solo, try the Daily). Cost: small-medium. Verify: finish the lesson in jsdom, assert the card appears once and not on the next visit.
7. **Measure and report cold-load cost** (not a change yet): one number for time to title on a throttled CPU in a real browser, plus a plain "Loading..." line in the HTML head before the 11.6 MB script. Cost: small for the line, a person with a browser for the number. Verify: the owner opens the site in Chrome DevTools with 4x CPU slowdown and "Fast 3G"/"Slow 4G" throttle and reads the time to the title. I could not do this.
8. **Settle "move did not come out" with a human check** (playtest-v2 item 3): fix the tester's smash-charge fields first, then hand-press the special and attack repro lines. If real, it is the single biggest "feel" fix (feel is the lowest score, 5.7). Verify: re-run the failing repro lines; count must drop to near zero on specials/attacks.
9. **Let the pad drive menus** (arrows via D-pad, A = click focused button, B = back). Cost: medium (needs focus order on every screen). Verify: with a fake pad, walk title to a running match with buttons only. Lower rank because the game is "computer only" and many gamepad players still have a mouse.
10. **Evil Forest damage cap and a damage-number sanity limit on the HUD** (the report says 1,000%+ was seen). Cost: unknown (balance decision for the owner). Verify: run the Forest FFA in the harness, read the highest %. Marked low because it affects a single stage.

Honest note on the ranking: the order is my judgement (impact is a GUESS, cost is from reading code). Items 1, 2, 3 and 5 are plausibly one afternoon together.

## (4) One line per persona

- **9-year-old BFDI fan, never played a fighter:** recognises the cast and the big Take the Plunge button, will do the lesson, but the 5-fighter Normal-skill first match and the wall of text on How to Play will lose them; they need the key strip (item 1) and Easy (item 4). ALMOST.
- **Adult Smash fan trying a browser game:** finds the controls close to Smash (tilts, aerials, DI, shield, grab) and reads the long How to Play card happily, but will hit the "move eaten" feeling if real and dislikes the arrows-only default; no pad menus. ALMOST.
- **Colour-blind player:** team shapes help in Teams (line 6422); I found no other colour options, and damage and hit effects colours were not checked. GUESS: playable, not designed for. ALMOST.
- **Reads the screen, never text:** one big button, a banner and an on-canvas step prompt with a step counter work; the 3-minute How to Play card, select screen and move cards are text-heavy. ALMOST.
- **Cheap school Chromebook, keyboard:** risk is the 11.8 MB single script (3.76 MB gzip) plus 4-CPU matches at 60 fps; the simulated old-laptop group gave the worst Feel (4.4) and 0% recommend, though part is the bot's low sample rate. I could not run on weak hardware. NOT READY on evidence available (GUESS).
- **Quits at the first confusing menu:** title is clear, select is dense (stadium, mode, contestants, stocks, More options) but has a one-line hint; Esc now goes back; the 28/80 "left a menu once" number is a model. ALMOST.
- **Returning player after a month:** What's-new card, saved remaps and fighter, a changelog page, Update 4 notes; the only miss is that the card shows once. READY.
- **Gamepad-only player:** cannot navigate menus, cannot pause, shield or sprint, cannot remap, and is told nowhere; they need a mouse for every menu. NOT READY.

## (5) What I could not check

- Real play, look, sound and feel: no browser, by instruction. Everything about "how the first match feels" is inferred from code and the simulated reports.
- Real load time on a Chromebook or slow network, brotli size, which assets load before the title (only raw size, gzip size and a 162 ms compile on a fast desktop were measured; scratch script at reports\juries\_ready-new\compile.mjs).
- A real gamepad (the mapping was read, not tried), and how many buttons a given controller reports.
- Whether the Easy/Normal/Hard CPUs are actually kinder at the numbers I assumed (I did not run a first-match CPU check; the cpu-*.md reports exist and I did not read them in detail).
- Unlock pacing ("fast drip": matches per unlock not measured), quest rewards, Daily and event cards' visibility.
- Online play (forbidden to touch the relay), and hidden content (out of scope).
- Whether the ii-dlc fixes (Esc back, key hint, step 8 message, gorges) work for a person; I read their descriptions and the Esc code path, not their behaviour.
- The 12 Boss Rush bosses' difficulty for a newcomer, and the CTF practice (18 steps) as a first experience.
- Accessibility: contrast ratios, screen-reader use, any colour option not matched by my grep.
