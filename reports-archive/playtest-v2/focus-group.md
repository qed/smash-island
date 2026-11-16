# Focus group report: playtest v2

Build tested: the V1 copy on ii-dlc (`artifacts/V1/index.html`). 80 simulated playtesters were split into 8 focus groups. Each group wrote complaints in character, and then a skeptic checked every complaint against the logs and the game code.

Before you read on:
- **These are simulated people, not real players.** The quotes are their in-character voice. Some quotes add colour that the logs don't show, and I left out any quote the skeptic found contradicted.
- **Only complaints marked "real" or "probably real" are below.** Anything the skeptic traced to the test tool, or that the logs didn't support, is in the "Dropped, and why" list at the end.
- **Each item is ranked by three things:** how many of the 80 people hit it, how bad it felt, and whether they would have quit.

---

## Top 10 at a glance

| # | Problem | People who hit it | Who | Status | Would quit? |
|---|---|---|---|---|---|
| 1 | "I pressed the button and my move didn't come out" | 24 in the groups that kept it (207 events in the whole run) | veterans, teens, parents, WASD players, World Cup fans | probably real (**check first**) | no |
| 2 | Esc doesn't go back on menu screens | 15 | kids, teens, adult readers | **real** | no |
| 3 | Matches stall: nobody loses a stock for a minute | 21 (24 matches out of 965) | everyone, most often on Canyon | probably real | no |
| 4 | Evil Forest piles on huge damage | 9 cited, and the pattern shows across every persona type | competitive and casual adults, teen veterans | **real** (how much is too much is your call) | no |
| 5 | Fighters jump across the screen with no move | 18 | teen veterans, old-laptop adults, CTF teens | probably real (part of it) | no |
| 6 | WASD does nothing and the match gives no key hint | 4 | WASD-habit PC players | probably real | no |
| 7 | Capture the Flag "check the way is open" setup wait | 5 | World Cup fans, an adult reader | probably real | no |
| 8 | Fighter stuck inside a platform | 5 | mixed | probably real (rare) | no |
| 9 | How to Play step 8 says "press V" but needs a smash that lands | 3 | first-timers (parent, kid, older adult) | probably real (wording) | maybe |
| 10 | The first trip to Free-for-all goes through the How to Play card | every first visit | first-timers, veterans who want to jump in | probably real (small) | no |

---

## 1. "I pressed the button and my move didn't come out"

**What happens:** A smash (V) was pressed on a fighter that looked ready, and nothing changed for 14 frames. Less often the same thing happened with a special (C), an attack (X) or a grab. Some moves also came out late: Lightning's smash took 13 frames, and Lifering's, Remote's and Ruby's smashes took 10 frames.

**Who hits it:** 24 people in the three groups that kept this complaint:
- 4 adult Smash veterans and 2 parents
- 5 CTF teens, 4 teen platform veterans and 1 speedrunner
- 4 WASD players and 4 World Cup fans

The whole run logged 207 such events. The older v1 test player hits it as well, at 0.36 per match.

> "I'm standing there doing nothing, I press smash, and the button gets eaten. If I can't trust my inputs I can't really play a fighting game." (adult veteran)
>
> "I pressed smash and nothing happened, like the game ate my button." (WASD player)

**Status:** probably real, with a strong warning. Four other groups dropped their own version of this complaint, for two reasons:
- **The tester can't see a smash charging.** A smash charges for 24-32 frames and then fires by itself (`smashFullOf`). The tester's "did anything change" check (`sig()` in playtest.mjs) doesn't watch the charge state (`smashHold`, `_smQ`, `_smBuf`). A fighter standing still while its smash charges therefore looks like "nothing happened".
- **The old-laptop players' keys are sampled at 25-35 fps.** At that rate a 1-frame tap can be lost before it ever reaches the game.

Taken together, **most of the smash cases are probably the tester**. The special, attack and grab cases are not explained yet.

**Evidence:**
- summary item 3: "real signal, cause unknown"
- teen-platform-veteran-01.md has 9 cant lines
- repro: `--scene teams --seed 706956590 --arg persona=teen-friends-ctf-02 --arg fighter=Cammy --arg stage=bigincin` (Cammy special and attack)
- repro: `--scene worldcup --seed 377245720 --arg persona=worldcup-fan-02` (Ruby smash)

**Suggested fix:** First add the smash-charge fields to the tester's `sig()` and count again. Then press 2-3 of the special and attack repro lines by hand before changing anything in the game.

---

## 2. Esc doesn't go back on menu screens

**What happens:** Esc does nothing on 15 screens, even though each one has a Back button. The screens are Settings, Keys, My Stats, Learn, How to Play, Training, Changelog, Vault, Quests, Store, Wardrobe, World Cup setup, Play with Friends, Level Creator and fighter select. Esc does work on the two Flag Cup screens.

**Who hits it:** 15 people:
- 4 kid button-mashers
- 3 teen menu-skippers
- 4 teen collectors
- 4 adult reader-explorers

> "Escape doesn't work! I had to find the little back button every single time." (kid, button-masher)
>
> "Every PC game goes back when you hit Esc." (teen, 17)

**Status:** real.
- Esc left the screen 0 of 75 times on each of the 15 screens, and 75 of 75 times on the Flag Cup screens.
- A comment in the code says it outright: the other menus "have a Back button and no Escape".
- Pausing a match with Esc works fine (80 of 80). The two "didn't pause" cases were dropped.

**Evidence:** summary.md "Esc on each screen" table; the `ctfCupEscKey` comment in index.html; jank-esc-ignored lines in every explorer log.

**Suggested fix:** One global handler that clicks the current screen's Back button when Esc is pressed. This is UI polish, so it's fine under the feature freeze.

---

## 3. Matches stall: nobody loses a stock for a minute

**What happens:** In 24 of the 965 matches (21 different personas), nobody at all lost a stock for 60 seconds, and the match was still going when the test stopped it at 3 minutes.
- **Canyon has the most:** 4 FFA and 3 Teams.
- **The rest were spread out:** Grand Plains, Goiky, Fortress, Skytower, Ice, Forest, Big Incinerator, Yoyle and others.

**Who hits it:** everyone: adults, kids, teens and veterans. The ones cited include:
- competitive-01 and -03, parent-02 and parent-03
- sibling-rival-01
- lefty-01 and -03, older-01
- old-laptop-03 and -05
- teen-collector-02 and -03
- ctf-04 and -05
- teen veteran-01 and -03, speedrunner-01
- wasd-02

> "We played for ages on the canyon one and nothing was happening." (parent)
>
> "One free-for-all just went in circles for minutes." (lefty player, 27)

**Status:** probably real. The likely problem is the CPUs, not the player:
- In 2 of the 3 matches checked closely, the player was already out, so the stall was CPUs not finishing each other off.
- In the strongest case (lefty-03 on Fortress), 4 fighters sat at 65-159% for a full minute with no KO.

Some parts of the complaints were wrong:
- "Never ends" is just the test's own 3-minute stop.
- "No KOs" in a match line only means the player lost no stock. It doesn't mean nobody did.

CPU-only matches were not tested.

**Evidence:**
- summary item 4 ("16 root causes, 24 occurrences")
- the stalemate details for lefty-remapper-03, e.g. `Loser:2/146 Match:2/147 Blueberry:2/159 Balloony:2/65`
- repro: `--scene ffa --seed 860051606 --arg persona=lefty-remapper-03 --arg fighter=Loser --arg stage=fortress --arg kind=ffa`

**Suggested fix:** Run a few CPU-only matches on Canyon to see whether CPUs stall without the player. If they do, there's a design question for you: should CPUs go for the KO harder once a foe is past about 120%? The game already has an anti-stalemate ramp (`lastKoFrame`), so this would be about whether that ramp is strong enough.

---

## 4. Evil Forest piles on huge damage

**What happens:** Players take far more damage on Forest than on any other stage.
- **Across all persona logs:** players took an average of 239 damage per match in 56 Forest matches, against 66 on every other stage (1,454 matches).
- **In FFA, 1v1 and Teams:** players took 3.0 times as much damage as they dealt on Forest. On other stages the ratio was 0.31 to 0.76.
- **Damage-cap KOs:** Forest has 12 of the run's 32 KOs where a fighter was eliminated at the damage cap (often at 265-453%) instead of being knocked off.
- **One outlier:** one fighter reached 1337% (old-laptop-03, Roboty, Teams seed 55397235).

**Who hits it:** 9 cited:
- competitive adults 02 and 03
- casual adults 03 and 04
- teen veterans 01-04
- CTF teen 04

The pattern holds for every persona type.

> "Something on that stage just shreds you." (competitive adult)
>
> "Forest is cursed. Every time it came up I got bodied." (teen veteran)

**Status:** real, as a measurement. The stage blurb is "Evil Leafy roams. Don't touch her.", so a damaging hazard is there by design. The simulated players probably dodge her worse than people would, which means part of the size of the effect comes from the test players. Whether this is too much is your design call. Per your rule, don't tune it on bot numbers alone.

**Evidence:** the aggregates above; index.html `forest: { step: elHazardStep, ... }`; adult-competitive-03.md seed 876849929 ("took 1032, MAX@453%").

**Suggested fix:**
- Watch 2-3 real Forest matches. If it feels the same, the question is whether to make her tells clearer or her contact hit smaller.
- Separately, look at the 1337% match. How did that fighter go so far past the damage cap (150 + weight)?

---

## 5. Fighters jump across the screen with no move

**What happens:** Some fighters moved 150 px or more in a single frame with no move to explain it:
- Nickel (II) moved 589 px.
- Gaty and Liy both moved 461 px in the same frame, so probably one event.
- Bell 326 px, Cake 258 px, David 257 px, Taco 262 px and Balloon 172-182 px.

Related oddities:
- Fighters slid while frozen in hitstop: Lightbulb 161 px, Paper 44 px, Snowball 37 px, Liy 23 px, and Clover and Cake 14 px.
- Test Tube hung motionless in mid-air for 45 frames.

The whole run logged 1,328 jumps of this size with no recent move.

**Who hits it:** 18 cited: teen platform veterans, old-laptop adults, CTF teens, adult Smash veterans and one older adult.

> "Bell teleported for no reason. I couldn't tell where anyone was going to be." (adult veteran)

**Status:** probably real, but only the "no move" part. Most of the logged jumps are up-specials, finishers and Bow's Teleport, which move fighters by design, so those were dropped. A grab, a carry or a boss move could still explain some of what's left.

**Evidence:** teen-platform-veteran-04.md ("Nickel (II) moved 589 px ... last move: no move"); old-laptop-05.md (Gaty and Liy 461 px); summary item 7 ("the no move ones are unexplained").

**Suggested fix:** Re-run `--scene ffa --seed 134218941 --arg persona=teen-platform-veteran-04 --arg stage=shift --arg kind=ffa` and log what moved him (grab, carry, assist or hazard). Then teach the detector which moves are meant to cover distance.

---

## 6. WASD does nothing and the match gives no key hint

**What happens:** On a fresh game, pressing WASD, J and K for 4 seconds moved the fighter 0 px, and nothing on the match screen said which keys to use. Remapping in Settings > Keys worked every time and is saved, so a player only does it once.

How to Play does name every key. A player who skips it gets no hint during a match.

**Who hits it:** 4 WASD-habit PC players.

> "I hit W and D like every PC game and my guy just stood there. No popup, nothing."

**Status:** probably real (summary item 5, "certain" for the first 4 seconds). "Remap again before every mode" was a test-tool effect and was dropped.

**Evidence:** wasd-habit-01..04.md ("the fighter moved 0 px; an on-screen hint about the keys was not visible"); repro: `--scene wasdprobe --seed 397100809 --arg persona=wasd-habit-01`.

**Suggested fix:** When a match sees presses of common keys that aren't bound (WASD, J, K), show one small toast: "Move with the arrows, attack with Z X C V. Change keys in Settings > Keys."

Question for you: would you want a one-click "WASD layout" button in Keys? It would also help the left-handed players.

---

## 7. Capture the Flag "check the way is open" setup wait

**What happens:** During the "check the way is open" setup phase, the game makes everyone wait (`CTF_NOINP`). In 9 matches across the run this phase lasted 16-41 seconds of game time. Each frame in that phase costs about 19 ms, against 1.4 ms in a normal fight, so to a player it can look like the game has frozen.

**Who hits it:** 5 cited: 4 World Cup fans and adult reader-03.

> "At the start it kind of froze for a bit." (World Cup fan)

**Status:** probably real (summary item 11, measured). The 400+ ms single frames and the slow "Sim rest & Continue" clicks are timing noise from a busy machine and were dropped.

**Evidence:** index.html `if(L.phase === 'fix') return CTF_NOINP;`; summary ctf-fix-long ("CTF castle: ... took 41.0 s"); worldcup-fan-02.md ("a 456 ms frame (median 52.9) in ctf/hide").

**Suggested fix:** Show a "Checking the routes..." banner with progress, and look at why the check takes 41 s on Castle, Oak and Forest. Splitting the work across frames, or putting a time limit on it, would help.

---

## 8. Fighter stuck inside a platform

**What happens:** A fighter stood inside a solid block for 30 frames or more. This happened 5 times in the whole run:
- Coiny in an FFA
- Nickel in an FFA
- Starfruit in an FFA on TLC
- Toothpaste in CTF on Sky
- TV in CTF on Sky

**Who hits it:** 5 people: parent-04, adult veteran-05, wasd-02, ctf-planner-01 and ctf-planner-04.

> "There was a coin guy just stuck inside the floor for a second. Kind of funny, kind of weird." (parent)

**Status:** probably real, but rare, and the repro lines don't replay exactly.

**Evidence:** summary item 10. Repros: `--scene ffa --seed 752502026 --arg persona=wasd-habit-02 --arg fighter=Starfruit --arg stage=tlc` (frame 1386); CTF seeds 269379237 (frame 7503) and 723477465 (frame 2617).

**Suggested fix:** If a fighter overlaps a solid block for more than a few frames, push them out to the nearest open spot. On CTF, also check whether a door closing or a built block can appear on top of a fighter.

---

## 9. How to Play step 8 says "press V" but needs a smash that lands

**What happens:** The card says "Press V once to SMASH". The step only completes when a smash lands and adds at least 5% to the dummy (`d.pct >= TUT.smashPct + 5`). A player who presses V and misses, or presses it from too far away, gets no feedback and can't move on.

The test script failed this step 3 times out of 75 runs. Those failures are the script, but the gap between what the card says and what the step checks is real.

**Who hits it:** first-timers: a parent, a kid button-masher and an older adult (67).

> "It said press V once to smash. I pressed V and it wouldn't let me move on. I didn't know what I was doing wrong." (older adult)

**Status:** probably real (the wording).

**Evidence:** index.html:21398, the step 8 check; older-slow-reaction-03 tutorial seed 281240848.

**Suggested fix:** Change the card to "Walk up to the dummy and land one smash (V)", and show a "Missed! Get closer" nudge when a smash whiffs.

---

## 10. The first trip to Free-for-all goes through the How to Play card

**What happens:** The default path from the title to an FFA match is 4 clicks. On a first visit the How to Play card appears first, which pushes the median time to 63 s, against 33 s for 1v1 or Teams. This happens once per player. Training is also 3 clicks longer than the shortest path.

**Who hits it:** every first visit. 6 people cited it: the adult veteran, the kid fan and the 4 CTF planners.

> "I just want to pick my main and fight." (adult veteran)

**Status:** probably real, but small. Only the clicks are measured; the seconds come from a reading model. All the "would have quit in the menus" verdicts were dropped (see below).

**Evidence:** summary item 6 ("clicks are measured, seconds and quitting are the model's estimates"); Journeys table: FFA 4 clicks, median 62.6 s.

**Suggested fix:** A design question: is the Skip button on the first-run card obvious enough? A clear "Skip, just fight" label might be all it needs.

---

## The rest

- **Camera zoom snap in the CTF practice:** All 5 CTF teens saw the camera zoom jump by 0.18 in one frame, once per practice run, at the same spot on Goiky. There was also one 176 px camera jump in a Teams match on Ice (`--scene teams --seed 904899601 --arg persona=teen-friends-ctf-03`). It's probably a scripted cut. Probably real, low. *Fix:* ease the zoom at that practice step.
- **Some attacks start 7 frames late:** 2.6% of attacks took 4 frames or more. The late ones are exactly 7 frames across seven different fighters (Ruler, Bomb, Trophy, Baseball, Money, Barf Bag, Golf Ball). Probably real but rare. Another reviewer thinks the game's input buffer explains it: the buffer replays an X press up to 8 frames later on purpose. *Fix:* confirm that the buffer is the cause. If it is, nothing needs to change.
- **Lead from a dropped item:** Evil Leafy's Boss Rush contact hit is applied with no attacker (`applyHit(..., null, ...)`). The in-game KO line may therefore show no name for her. Worth a glance.

---

## What people liked

- **No crashes.** About 160 scenes in one group, and every scene in the others, finished normally.
- **Every mode was reachable** in 3-6 clicks: FFA, 1v1, Teams, Boss Rush, Capture the Flag, Training, How to Play, World Cup and Flag Cup. Every default path reached a running match. The speedrunners did all nine in about a minute.
- **How to Play works for newcomers.** The parents and adult explorers finished it on almost every try in 3 clicks. The older adults finished it 8 of 8 times. "The lesson was clear; I could follow it." (older adult, 63)
- **The roster is big, and players noticed.** People played dozens of different BFDI fighters. One kid fan used about 19 in a single session, and the veterans tried a new main almost every match.
- **Big, satisfying fights.** Examples: 1,031 damage as David in an FFA, 1,124 as Sidewalky, 1,006 as Pencil, and 1v1 wins like Yellow Face 327 dealt to 46 taken.
- **Remapping keys never failed** (0 failures in 840 key rows set), and the left-handed players played whole sessions on their own layout.
- **Flag Cup and the CTF practice are quick.** The practice is 2 clicks and about 6-16 s away, and Flag Cup's Esc and skip worked every time. None of the CTF players would have quit.
- **Boss Rush makes players want to retry.** The sibling rivals and grinders faced 9-12 different bosses and kept going.
- **The core flow checks passed:** early presses are buffered, your fighter pick is remembered, Rematch keeps your settings, and Esc pauses a match.

---

## Dropped, and why

| Complaint | Why it was dropped |
|---|---|
| Too many menus or too much reading before a match (most groups), and Training taking 3-4 minutes | Seconds and quitting come from a guessed reading model. The test's Training route takes a detour through fighter select and every option row; the real path is 3 clicks. The explorer scene tours every screen on purpose. |
| Knocked out at 0% in the first few seconds (every group) | The simulated new players are built to walk off ledges (walkoff 0.2). "Fell" means nobody touched them. |
| Boss Rush is too hard, or bosses wipe you in seconds | Bot skill, and your rule is never to tune for bots. "Never beat a boss" was wrong: 8 runs cleared 2 bosses. |
| Boss fights drag past 3 minutes | The 3-minute stop is the test's own limit, plus empty gaps between bosses when run without a screen. |
| Evil Leafy KOs credited to "?" with 0 damage taken | The tester's damage counter missed her hits. The player's % did rise, so the game showed the damage. |
| Assist or hazard got the KO in a 1v1 | The label also covers the opponent's own assist. It was a damage-cap KO, not the stage. |
| Smash or special not coming out, in groups 1, 3, 4, 5 and 6 | The tester doesn't see the smash charge, and the old-laptop keys are sampled at 25-35 fps. Kept only as item 1 above. |
| Late inputs, in groups 1, 3, 5 and 6 | Smash "delays" are the charge itself. Kept only as the small 7-frame note above. |
| Walk key held but fighter doesn't move (every group) | The detector doesn't know about walls. It is a lead only. |
| Fighters blinking during up-specials and finishers | Those moves cover distance by design. |
| Buttons that seem to do nothing (Share, Sound, Reset stats, Copy stats, Load file, Clear) | Each one gives feedback in a real browser. The headless test has no clipboard, share sheet, confirm dialog or file picker. |
| Settings takes 4-9 s to open | On this unstamped test copy, opening Settings hashes the whole ~11.7 MB script. The website build is stamped and skips this. One reviewer still wanted a single 10-second check on the live site. |
| Menu clicks lag, choppy frames, sound pile-ups | Wall-clock timing with 8 processes running is noise. The game itself always ran at 60 steps a second. |
| Esc didn't pause a match (2 cases) | The pause checks passed 80 of 80. Both cases came from odd states during the menu crawl. |
| Stuck on fighter select with "no way out" | 1 of 75 visits, logged right after an odd CTF practice state. The other 74 visits left normally. |
| Matches with "no KOs" for 3 minutes (not stalemate-flagged) | "No KOs" only means the player lost no stock, and the cap is the test's. Real stalemates are item 3. |
| CTF practice stuck on the "key" step | The bot couldn't path up to the high-ledge door. 41 of 45 runs passed. |
| CTF matches where nothing happened | The test stops CTF after 2.5 minutes of play, and CTF sends players to jail instead of taking stocks. |
| CTF HUD labels overlapping, jail hint cut off | The text boxes were estimated, because the headless test has no layout. It needs one screenshot look; it could be nothing. |
| RUNNING! ends in 2-3 seconds | Every RUNNING! run by every persona was lost (35 of 35). The runner script can't jump gaps. |
| Left-hand setup takes a minute every time | Keys are saved, so a player remaps once. Whether to add a key preset is a design question (see item 6). |
| A CPU stood still for 10 s | One case was a RUNNING! scene with no rivals. The other is a single unconfirmed line. |
