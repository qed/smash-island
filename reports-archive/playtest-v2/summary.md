# PLAYTEST v2 summary

Generated 2026-11-11T19:05:00.184Z from 400 person-sessions in `playtest-out/big`.

## READ THIS FIRST: what this run is, and the honest top 15

**What it is.** 80 simulated people (20 archetypes, motor numbers drawn from estimated human ranges; see `scripts/README-playtest.md` for the sources and which numbers are only estimates), each played 5 passes of their own plan: 400 person-sessions, 1,414 person-scenes, 965 matches (31.7 hours of game time), 6.3 CPU hours, about 80 minutes of wall clock on 8 parallel BelowNormal node processes. Every normal mode and all 12 Boss Rush bosses (12-14 runs each), all six Capture the Flag maps (15 runs each), the World Cup and Flag Cup, Training, How to Play, the CTF practice, RUNNING!, the menus. Hidden content was not touched and no flag was turned on. It is a headless jsdom run: it can say whether something happens, not how it looks or sounds.

**Thresholds were fixed before the run** (commit 602ca82e, listed below) and none was changed afterwards. Two tool corrections were made before the big run, after the first smoke runs (Training respawns excluded from the teleport check; an already-selected menu option not counted as a dead button); both are in the README. After the run I changed only reporting (grouping, this commentary) and one DIAGNOSTIC detail string (snag detail now names nearby walls). Nothing was removed or hidden to make a number look better.

**Known false positives in the old v1 detectors, left in the data and called out here instead of being edited away:** `stray-banner` (the "KO'd by X - a stock" line is the game's real KO line; the v1 allow-list predates it), `phone-wording` (the word "tap" is also what a keyboard does: "tap Z to sprint"), `jank-spike` / `jank-stutter` / `jank-slow-click` (wall-clock time with 8 processes plus other jobs: noise-dominated, counts are not evidence of a stutter a player would see), `long-match` (the harness caps a match at 2-3 minutes of game time).

### The top 15, ranked by my judgement of how much a real person would complain, with how much I trust the evidence

The auto-ranked table further down uses a fixed formula; this list is the reading of it by hand. "Evidence" says how sure I am that the thing is real and not the playtester.

| # | complaint | numbers from this run | evidence |
|---|---|---|---|
| 1 | **Firey Speaker Box's THE TLC NEEDS TO BE FIXED! tracks you and the fire ring reaches you almost at once** (the owner's report) | Per landing, where the nearest fighter was the player (209 landings): median 99 px away, 67% within 140 px; of the 175 ordinary landings, 65% land within 140 px of the player and 59% leave under 15 frames (250 ms) before the ring reaches a player standing still (median 12.4 frames = 207 ms, which is under an average adult's 250 ms and well under a kid's 330-440 ms); the 34 big landings (the sixth hop) land a median 39 px from the player and 79% leave under 15 frames. All fighters: 77% of phase-1 landings under 15 frames (median 6.3 frames). TLC hit the player 148 times, the most of any Firey move (youmust 67, furnace 62). Every other boss move: at most 8% of hits came inside 18 frames of the telegraph start. | measured; matches the owner's description. Caveats: the simulated players fight next to the boss, and "slack" assumes the player stands still; a player who keeps away has more time. The hop aims at the nearest fighter each hop by design (`fsbHopAim`). |
| 2 | **Esc does nothing on almost every menu screen** | Esc left the screen 0 of 75 times on Settings, Keys, My Stats, Learn, How to Play, Training, Changelog, Vault, Quests, Store, Wardrobe, World Cup setup, Play with Friends, Level Creator and the fighter select; it works only on the two Flag Cup screens (75 of 75). All of them have a back button. 1,113 occurrences, every persona that opened a menu. | certain (reads the game's key handler too: Esc is only wired for the pause card, the Flag Cup screens and a few event pages) |
| 3 | **"My move did not come out"**: a special, smash or attack pressed on a ready fighter that does nothing for 14 frames | 207 occurrences (smash V 125, special C 42, attack X 26, grab 6, finisher 1) hitting 55 of 80 personas, 0.21 per match; the older plain v1 player hits it too, at 0.36 per match (23 in 64 matches, A/B run), so it is not caused by the new hand model. Rate is higher for veterans (0.25 per match) and for the five 25-35 fps personas (0.63 per match) than for first-timers (0.04) | real signal, cause unknown: either a real lock-out the probe's idea of "ready" does not know about, or the probe. Worth one human check of the repro lines; I could not tell which |
| 4 | **Matches where nothing happens for a minute and the match does not end** | 24 occurrences, 21 personas: canyon (3 of 6 listed), grandplains, shift, pillars; 3-6 fighters alive, nobody losing a stock for 60 s | measured; the playtester player may be part of it, CPUs alone were not tested |
| 5 | **Nothing tells a WASD player what to press** | 4 of 4 WASD probes: the fighter did not move and nothing on the match screen mentioned keys. (Remapping through Settings > Keys worked every time: 0 remap failures in 840 key rows set across 120 remap sessions.) | certain for the first 4 s of a match; the select screen's text was not searched |
| 6 | **The way into the first match takes a minute of reading** | FFA from the title: 4 clicks but a median 63 s of a person's clicking plus reading (first-run How to Play card); other modes 33 s; World Cup 6 clicks, 59 s; How to Play 42 s. In the persona model 28 of 80 would have left the menus at least once before their first match (kids 6, readers 4, skippers 3, competitive 3) and 15 gave up on a screen | clicks are measured, seconds and quitting are the model's estimates |
| 7 | **Fighters that blink 150+ px in one frame** | 3,722 occurrences, 71 personas. Mostly up-specials (Nickel flip.up 429, Lightning zap.up 395, Bubble float.up 389, Bracelety sign.up 263, Toothpaste paste.up 228, Starfruit onehit.up 145, Remote battery.up 97) and 1,328 with no recent move at all | measured; the `.up` ones are probably recovery moves by design, the "no move" ones are unexplained |
| 8 | **Walking into nothing**: a held walk key that does not move the fighter | 2,225 occurrences, 72 personas (goiky 174, ice 132, fortress 80, needle 79, pillars 77, tlc 73 and more). The detector is not wall-aware: in a re-run of 6 scenes it fired twice, once beside a solid block and once with no wall within 70 px | lead only; true rate unknown |
| 9 | **The camera jumps** | 50 occurrences, 14 personas: 166-241 px in one frame on canyon, fortress, ice, bigincin, tlc, plus one zoom jump of 0.18 in the CTF practice on goiky | measured |
| 10 | **A fighter stuck inside a platform** | 5 cases: dreamisle, ice, tlc, and two on the CTF sky map (30+ frames inside a solid block) | measured, rare; non-deterministic repro lines |
| 11 | **Long wait on the Capture the Flag "check the way is open" step** | 9 matches where it lasted 16-41 s of game time (castle, oak, forest); during it the frame cost is 19 ms on average here against 1.4 ms in FFA, the worst phase of all | measured; a pause a player sees as a freeze |
| 12 | **Move input feels late now and then** | key to first visible change: 0.26 frames on average for attack, but 2.6% of attacks (662 of 25,856) and 5.4% of smashes (277 of 5,150) took 4 or more frames (67 ms+), up to 14; jumps 27 of 20,455 | measured; smash may charge by design, so smash is the weaker case |
| 13 | **Sound piles up** | 135 bursts of 8+ sound calls in one frame (17 at once in Boss Rush) | counts calls, not what a speaker plays |
| 14 | **Words on top of each other in the CTF HUD** | "-N | Roles" 352 times and "+N | Roles" 80 times, plus the route labels ("Front high front high" over "Yard high yard high") | ESTIMATED text boxes: needs a look in the pane; could be nothing |
| 15 | **A walk key released during the pause keeps walking** | 1 of 25 tries (one fighter kept walking 69 px after resume) | one case; real if it repeats |

**Checked and fine (a negative result is a result):** the game buffers early presses (only 3% of attack presses made 6 frames early were lost, 48 of 1,911); Esc during the opening frames pauses and resumes correctly (80/80); Esc spam lands consistently (80/80); the pick is remembered after quit-and-return (80/80); the result screen offers a Rematch and a way back (37/37) and Rematch keeps the settings (37/37); every default path from the title reached a running match in every mode (110/110 each); all 12 Boss Rush bosses were reached and played.

**Not in the list because the evidence is too weak or it is the playtester:** audio and frame-time spikes (noise), dead menu buttons (77, mostly buttons that legitimately do nothing twice), air hangs (180, 124 of them Balloony, who floats).

**How many of 80 would notice (model, not measurement).** The per-finding "plausibly noticed by about N of 80" numbers below come from the sensitivity model in the README (first-time 0.25, casual 0.45, veteran 0.75, competitive 0.95 against a minimum per class). Treat them as a rough order of reach.

**Caveats on the people.** The motor numbers are estimates from remembered literature (no lookups). The key-layout personas remap through the real Settings > Keys screen, but the scenes that use literal keys (tutorial, CTF, Flag Cup) were played on the defaults. The 25-35 fps personas only have their key presses sampled at the lower rate; the game itself still ran at 60 steps a second. Reading time and patience are guesses at what a type of person does; "would have quit" is the model's verdict.


## Run size
- Personas that played: 80 of 80. Person-scenes: 1414 (distinct persona/scene/seed 1414); matches: 965 (31.7 hours of game time).
- CPU time: 6.34 CPU hours (summed over the person-sessions; Windows reports CPU time in coarse ticks).
- Scenes by kind: ffa 260, boss 160, teams 135, 1v1 125, training 120, journey 110, flow 80, tutorial 75, menus 75, ctf 65, flagcup 60, ctf-practice 45, worldcup 40, running 35, ctf-spectate 25, wasdprobe 4
- Boss Rush runs by boss: Purple Dragon 13, Two 13, Springy 13, Purple Face 13, MePhone4 13, Evil Leafy 13, Announcer 14, Puffball Speaker Box 14, Firey Speaker Box 14, Four 13, MePhone4S 13, The Bug Swarm 14 (12 of 12 bosses)
- Capture the Flag runs by map: sky 15, oak 15, castle 15, mines 15, factory 15, forest 15
- Personas with fewer than 2 passes: 0

## Thresholds (fixed before the run; not changed after seeing results)
LAT_FLAG_FRAMES=4, EARLY_WINDOW=6, EAT_RATE_FLAG=0.5, EAT_MIN_SAMPLES=8, TELEPORT_PX=150, HITSTOP_DRIFT_PX=8, HITSTOP_LONG=24, CAM_SNAP_PX=160, CAM_SNAP_ZOOM=0.06, CAM_JITTER_FLIPS=10, SNAG_FRAMES=24, SNAG_PX=3, HANG_FRAMES=45, EMBED_FRAMES=30, SPIKE_MS=33, SPIKE_MULT=6, STUTTER_SPIKES=3, SLOW_CLICK_MS=250, SLOW_START_MS=800, AUDIO_PER_FRAME=8, AUDIO_PER_SEC=90, CLICKS_TO_MATCH=6, SECS_TO_MATCH=60, TEXT_OVERLAP_FRAC=0.35, TEXT_WIDTH_FACTOR=0.55, BOSS_WARN_FRAMES=18, TLC_SLACK_FRAMES=15, BOSS_SHORT_SHARE=0.25, BOSS_MIN_HITS=8

## TOP 15: what a real person would complain about (auto-ranked; formula in the README, commentary below each group)
Score = annoyance weight of the finding class (blocking 1.0, visible glitch 0.6, feel 0.5, menu friction 0.45, design 0.35) x share of the 80 personas who would plausibly meet and notice it x (0.5 + 0.5 x share of those who actually hit it in this run). The weights and the notice model are ESTIMATES made before the run.

1. **cant** (BUG, blocking, score 0.819): 7 root cause(s), 207 occurrences; example: smash (V) was pressed on a ready fighter and nothing happened for 14 frames (fighters listed below)  
   hit by 55 personas, plausibly noticed by about 76 of 80
2. **match-never-ends** (STUCK, blocking, score 0.581): 16 root cause(s), 24 occurrences; example: ffa match on canyon is a stalemate: no stock lost for a minute and it did not end in 3 min of game time  
   hit by 21 personas, plausibly noticed by about 72 of 80
3. **jank-teleport** (FEEL, visible, score 0.450): 208 root cause(s), 3722 occurrences; example: Nickel moved 153 px in one frame (ffa; last move: Nickel|flip.up)  
   hit by 71 personas, plausibly noticed by about 60 of 80
4. **jank-spike** (SLOW, feel, score 0.438): 4045 root cause(s), 67542 occurrences; example: a 42 ms frame (median 0.3) in ffa; recent move: no recent move  
   hit by 80 personas, plausibly noticed by about 70 of 80
5. **jank-snag** (FEEL, visible, score 0.420): 420 root cause(s), 2225 occurrences; example: the player held a walk key 24 frames on the ground and did not move (ffa, stage dreamisle)  
   hit by 72 personas, plausibly noticed by about 56 of 80
6. **stray-banner** (UI, menu, score 0.383): 101 root cause(s), 606 occurrences; example: a match shows "KO'd by Fanny − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)  
   hit by 64 personas, plausibly noticed by about 72 of 80
7. **jank-stutter** (SLOW, feel, score 0.362): 7 root cause(s), 14364 occurrences; example: 3 slow frames within a second in ffa  
   hit by 78 personas, plausibly noticed by about 58 of 80
8. **jank-air-hang** (FEEL, visible, score 0.352): 47 root cause(s), 180 occurrences; example: Goo hung motionless in the air for 45 frames (ffa) at 490,515  
   hit by 38 personas, plausibly noticed by about 56 of 80
9. **long-match** (FEEL, design, score 0.313): 37 root cause(s), 509 occurrences; example: ffa match on goiky was still going after 2 min of game time  
   hit by 71 personas, plausibly noticed by about 72 of 80
10. **jank-camera-snap** (FEEL, visible, score 0.263): 7 root cause(s), 50 occurrences; example: the camera jumped 178 px / zoom 0.00 in one frame (teams)  
   hit by 14 personas, plausibly noticed by about 56 of 80
11. **jank-embedded** (BUG, visible, score 0.229): 5 root cause(s), 5 occurrences; example: Coiny stood inside a solid platform for 30 frames (ffa)  
   hit by 5 personas, plausibly noticed by about 56 of 80
12. **jank-audio-burst** (FEEL, feel, score 0.163): 4 root cause(s), 135 occurrences; example: 8 sound calls in one frame (ffa)  
   hit by 41 personas, plausibly noticed by about 26 of 80
13. **cpu-idle** (FEEL, design, score 0.162): 2 root cause(s), 2 occurrences; example: a CPU (Bonesaw) did not move or act for 10 s in a ffa match while foes were alive  
   hit by 2 personas, plausibly noticed by about 72 of 80
14. **jank-hitstop-drift** (FEEL, feel, score 0.150): 113 root cause(s), 429 occurrences; example: Salt moved 27 px in one frame while in hitstop (ffa; last move: Salt|saltpepper.finisher)  
   hit by 62 personas, plausibly noticed by about 24 of 80
15. **jank-input-latency** (FEEL, feel, score 0.150): 236 root cause(s), 1048 occurrences; example: Trophy: atk took 7 frames (117 ms) from the key to the first change on the fighter  
   hit by 73 personas, plausibly noticed by about 24 of 80

## Findings by root cause (deduped), worst first
### BUG (13 root causes)
#### cant: 7 root causes, 207 occurrences
- **[BUG] cant** x125 - smash (V) was pressed on a ready fighter and nothing happened for 14 frames (fighters listed below) Fighters: Nickel x10, Book x6, Tree x5, Coiny x5, Yellow Face x4, Roboty x4, Rose x3, Ruler x3, David x3, Lightning x3, Saw x3, Ruby x3, Teddy Bear x3, Paintbrush x3, Dora x3, Cake x2, Box x2, Pencil x2, Bell x2, Match x2, Snowball x2, Grassy x2, Trophy x2, Flower x2, Firey x2, Salt x2, Basketball x2, Teardrop x2, Baseball x2, Dough x2, Magnet x2, Lifering x2, Fan x2, Golf Ball x2, Tissues x2, Tennis Ball x2, Bomb x1, Ice Cube x1, Bonesaw x1, Pickle x1, Cheesy x1, Rocky x1, Sidewalky x1, Nickel (II) x1, Test Tube x1, Blocky x1, Pen x1, Naily x1, Loser x1, Remote x1, Bomby x1, Goo x1, Blueberry x1, Balloony x1, Firey Jr. x1, Candle x1, Yin-Yang x1, Woody x1.
  - hit by 45 personas (adult-competitive-01 x9, adult-smash-veteran-05 x9, teen-platform-veteran-04 x7, adult-smash-veteran-02 x6); plausibly noticed by about 76 of 80 (blocking); severity BUG
  - repro: `node scripts/playtest.mjs --scene ffa --seed 924603085 --arg persona=adult-casual-low-patience-04 --arg fighter=Rose --arg stage=ice --arg kind=ffa` (frame 8217); `node scripts/playtest.mjs --scene training --seed 998438075 --arg persona=adult-competitive-01 --arg fighter=Cake` (frame 4136)
- **[BUG] cant** x42 - special (C) was pressed on a ready fighter and nothing happened for 14 frames (fighters listed below) Fighters: Remote x6, Sidewalky x5, Ruler x3, Roboty x3, Grassy x3, Tea Kettle x3, Fan x2, Yellow Face x2, Lifering x2, Soap x2, Tapey x1, Trophy x1, Teardrop x1, Match x1, Loser x1, Gaty x1, Woody x1, Cammy x1, Lightning x1, Liy x1, Nickel (II) x1.
  - hit by 21 personas (old-laptop-02 x6, old-laptop-05 x6, teen-platform-veteran-01 x4, adult-smash-veteran-05 x3); plausibly noticed by about 76 of 80 (blocking); severity BUG
  - repro: `node scripts/playtest.mjs --scene teams --seed 601507442 --arg persona=adult-competitive-01 --arg fighter=Ruler --arg stage=pillars --arg kind=teams` (frame 3160); `node scripts/playtest.mjs --scene 1v1 --seed 156247918 --arg persona=adult-competitive-03 --arg fighter=Roboty --arg stage=wind --arg kind=1v1` (frame 2076)
- **[BUG] cant** x26 - attack (X) was pressed on a ready fighter and nothing happened for 14 frames (fighters listed below) Fighters: Book x3, Tea Kettle x2, Fern x2, Loser x1, Goo x1, Bomby x1, Grassy x1, David x1, Trophy x1, Lollipop x1, Magnet x1, Sidewalky x1, Rocky x1, Nickel (II) x1, Bracelety x1, Test Tube x1, Paintbrush x1, Cammy x1, Liy x1, Bell x1, Nickel x1, Tennis Ball x1.
  - hit by 15 personas (old-laptop-01 x4, old-laptop-05 x4, old-laptop-02 x3, old-laptop-03 x2); plausibly noticed by about 72 of 80 (blocking); severity BUG
  - repro: `node scripts/playtest.mjs --scene 1v1 --seed 179209923 --arg persona=adult-smash-veteran-02 --arg fighter=Loser --arg stage=fortress --arg kind=1v1` (frame 10341); `node scripts/playtest.mjs --scene boss --seed 457316041 --arg persona=kid-bfdi-fan-03 --arg fighter=Goo --arg boss=10` (frame 152)
- **[BUG] cant** x6 - grab (X+C) was pressed on a ready fighter and nothing happened for 14 frames (fighters listed below) Fighters: Grassy x1, Fan x1, Paintbrush x1, Tea Kettle x1, Soap x1, Golf Ball x1.
  - hit by 6 personas (adult-smash-veteran-03 x1, ctf-planner-02 x1, old-laptop-01 x1, old-laptop-05 x1); plausibly noticed by about 76 of 80 (blocking); severity BUG
  - repro: `node scripts/playtest.mjs --scene teams --seed 133397300 --arg persona=adult-smash-veteran-03 --arg fighter=Grassy --arg stage=pillars --arg kind=teams` (frame 7476); `node scripts/playtest.mjs --scene ctf --seed 861534334 --arg persona=ctf-planner-02 --arg fighter=Fan --arg map=mines --arg n=4` (frame 5843)
- **[BUG] cant** x1 - finisher (V+C) was pressed on a ready fighter and nothing happened for 14 frames (fighters listed below) Fighters: Lollipop x1.
  - hit by 1 personas (lefty-remapper-04 x1); plausibly noticed by about 72 of 80 (blocking); severity BUG
  - repro: `node scripts/playtest.mjs --scene ffa --seed 589904972 --arg persona=lefty-remapper-04 --arg fighter=Lollipop --arg stage=dreamisle --arg kind=ffa` (frame 624)
- **[BUG] cant** x3 - How to Play, step 8 ("Press V once to SMASH"): a player following the card's instruction could not finish it in 22 s
  - hit by 3 personas (adult-parent-first-time-01 x1, kid-masher-02 x1, older-slow-reaction-03 x1); plausibly noticed by about 15 of 80 (blocking); severity BUG
  - repro: `node scripts/playtest.mjs --scene tutorial --seed 34449409 --arg persona=adult-parent-first-time-01` (frame 1335); `node scripts/playtest.mjs --scene tutorial --seed 377074529 --arg persona=kid-masher-02` (frame 1333)
- **[BUG] cant** x4 - Capture the Flag practice, step 14 of 18 ("key"): a player following the card could not finish it in 45 s
  - hit by 4 personas (ctf-planner-02 x1, ctf-planner-04 x1, teen-friends-ctf-02 x1, teen-friends-ctf-05 x1); plausibly noticed by about 9 of 80 (blocking); severity BUG
  - repro: `node scripts/playtest.mjs --scene ctf-practice --seed 464416488 --arg persona=ctf-planner-02` (frame 3929); `node scripts/playtest.mjs --scene ctf-practice --seed 344916396 --arg persona=ctf-planner-04` (frame 3929)
#### jank-embedded: 5 root causes, 5 occurrences
- **[BUG] jank-embedded** (JANK) x1 - Coiny stood inside a solid platform for 30 frames (ffa)
  - hit by 1 personas (adult-parent-first-time-04 x1); plausibly noticed by about 56 of 80 (visible); severity BUG
  - repro: `node scripts/playtest.mjs --scene ffa --seed 734421662 --arg persona=adult-parent-first-time-04 --arg fighter=Bell --arg stage=dreamisle --arg kind=ffa` (frame 2933)
- **[BUG] jank-embedded** (JANK) x1 - Nickel stood inside a solid platform for 30 frames (ffa)
  - hit by 1 personas (adult-smash-veteran-05 x1); plausibly noticed by about 56 of 80 (visible); severity BUG
  - repro: `node scripts/playtest.mjs --scene 1v1 --seed 671378870 --arg persona=adult-smash-veteran-05 --arg fighter=Nickel --arg stage=ice --arg kind=1v1` (frame 3131)
- **[BUG] jank-embedded** (JANK) x1 - Starfruit stood inside a solid platform for 30 frames (ffa)
  - hit by 1 personas (wasd-habit-02 x1); plausibly noticed by about 56 of 80 (visible); severity BUG
  - repro: `node scripts/playtest.mjs --scene ffa --seed 752502026 --arg persona=wasd-habit-02 --arg fighter=Starfruit --arg stage=tlc --arg kind=ffa` (frame 1386)
- **[BUG] jank-embedded** (JANK) x1 - Toothpaste stood inside a solid platform for 30 frames (ctf/play)
  - hit by 1 personas (ctf-planner-01 x1); plausibly noticed by about 9 of 80 (visible); severity BUG
  - repro: `node scripts/playtest.mjs --scene ctf --seed 269379237 --arg persona=ctf-planner-01 --arg fighter=Remote --arg map=sky --arg n=4` (frame 7503)
- **[BUG] jank-embedded** (JANK) x1 - TV stood inside a solid platform for 30 frames (ctf/play)
  - hit by 1 personas (ctf-planner-04 x1); plausibly noticed by about 9 of 80 (visible); severity BUG
  - repro: `node scripts/playtest.mjs --scene ctf --seed 723477465 --arg persona=ctf-planner-04 --arg fighter=Salt --arg map=sky --arg n=4` (frame 2617)
#### pause: 1 root causes, 2 occurrences
- **[BUG] pause** x2 - Esc in a running match did not pause it
  - hit by 2 personas (menu-skipper-01 x1, teen-collector-04 x1); plausibly noticed by about 15 of 80 (design); severity BUG
  - repro: `node scripts/playtest.mjs --scene menus --seed 777792482 --arg persona=menu-skipper-01` (frame 150); `node scripts/playtest.mjs --scene menus --seed 765701680 --arg persona=teen-collector-04` (frame 150)

### STUCK (17 root causes)
#### match-never-ends: 16 root causes, 24 occurrences
- **[STUCK] match-never-ends** x4 - ffa match on canyon is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
  - hit by 4 personas (adult-parent-first-time-02 x1, adult-smash-veteran-02 x1, kid-sibling-rival-01 x1, teen-collector-03 x1); plausibly noticed by about 72 of 80 (blocking); severity STUCK
  - repro: `node scripts/playtest.mjs --scene ffa --seed 77564490 --arg persona=adult-parent-first-time-02 --arg fighter=Profily --arg stage=canyon --arg kind=ffa` (frame 10800); `node scripts/playtest.mjs --scene ffa --seed 347917553 --arg persona=adult-smash-veteran-02 --arg fighter=Pickle --arg stage=canyon --arg kind=ffa` (frame 10800)
- **[STUCK] match-never-ends** x3 - teams match on canyon is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
  - hit by 3 personas (adult-competitive-01 x1, adult-smash-veteran-01 x1, old-laptop-05 x1); plausibly noticed by about 72 of 80 (blocking); severity STUCK
  - repro: `node scripts/playtest.mjs --scene teams --seed 17312173 --arg persona=adult-competitive-01 --arg fighter=Leafy --arg stage=canyon --arg kind=teams` (frame 10800); `node scripts/playtest.mjs --scene teams --seed 791005407 --arg persona=adult-smash-veteran-01 --arg fighter=Goo --arg stage=canyon --arg kind=teams` (frame 10800)
- **[STUCK] match-never-ends** x2 - ffa match on grandplains is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
  - hit by 2 personas (adult-competitive-03 x1, wasd-habit-02 x1); plausibly noticed by about 72 of 80 (blocking); severity STUCK
  - repro: `node scripts/playtest.mjs --scene 1v1 --seed 340077645 --arg persona=adult-competitive-03 --arg fighter=Bonesaw --arg stage=grandplains --arg kind=1v1` (frame 10800); `node scripts/playtest.mjs --scene ffa --seed 959353646 --arg persona=wasd-habit-02 --arg fighter=Golf Ball --arg stage=grandplains --arg kind=ffa` (frame 10800)
- **[STUCK] match-never-ends** x2 - ffa match on yoyle is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
  - hit by 2 personas (teen-collector-02 x1, teen-platform-veteran-03 x1); plausibly noticed by about 72 of 80 (blocking); severity STUCK
  - repro: `node scripts/playtest.mjs --scene ffa --seed 773820524 --arg persona=teen-collector-02 --arg fighter=Test Tube --arg stage=yoyle --arg kind=ffa` (frame 10800); `node scripts/playtest.mjs --scene 1v1 --seed 362462761 --arg persona=teen-platform-veteran-03 --arg fighter=Match --arg stage=yoyle --arg kind=1v1` (frame 10800)
- **[STUCK] match-never-ends** x2 - teams match on yoyle is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
  - hit by 2 personas (teen-platform-veteran-01 x1, teen-platform-veteran-03 x1); plausibly noticed by about 72 of 80 (blocking); severity STUCK
  - repro: `node scripts/playtest.mjs --scene teams --seed 207363942 --arg persona=teen-platform-veteran-01 --arg fighter=Roboty --arg stage=yoyle --arg kind=teams` (frame 10800); `node scripts/playtest.mjs --scene teams --seed 50969097 --arg persona=teen-platform-veteran-03 --arg fighter=Candle --arg stage=yoyle --arg kind=teams` (frame 10800)
- **[STUCK] match-never-ends** x1 - ffa match on shift is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
  - hit by 1 personas (adult-parent-first-time-03 x1); plausibly noticed by about 72 of 80 (blocking); severity STUCK
  - repro: `node scripts/playtest.mjs --scene ffa --seed 849827428 --arg persona=adult-parent-first-time-03 --arg fighter=Tapey --arg stage=shift --arg kind=ffa` (frame 10800)
- **[STUCK] match-never-ends** x1 - ffa match on pillars is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
  - hit by 1 personas (adult-parent-first-time-03 x1); plausibly noticed by about 72 of 80 (blocking); severity STUCK
  - repro: `node scripts/playtest.mjs --scene ffa --seed 56298195 --arg persona=adult-parent-first-time-03 --arg fighter=Lollipop --arg stage=pillars --arg kind=ffa` (frame 10800)
- **[STUCK] match-never-ends** x1 - teams match on wind is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
  - hit by 1 personas (adult-smash-veteran-05 x1); plausibly noticed by about 72 of 80 (blocking); severity STUCK
  - repro: `node scripts/playtest.mjs --scene teams --seed 171881138 --arg persona=adult-smash-veteran-05 --arg fighter=Rocky --arg stage=wind --arg kind=teams` (frame 10800)
- ... and 8 more root causes of this kind (all in the JSON files)
#### no-exit: 1 root causes, 1 occurrences
- **[STUCK] no-exit** x1 - screen "select" has no way out: Esc and every button leave it where it is
  - hit by 1 personas (menu-skipper-01 x1); plausibly noticed by about 15 of 80 (blocking); severity STUCK
  - repro: `node scripts/playtest.mjs --scene menus --seed 777792482 --arg persona=menu-skipper-01` (frame 150)

### SLOW (4084 root causes)
#### jank-spike: 4045 root causes, 67542 occurrences
- **[SLOW] jank-spike** (JANK) x3192 - a 42 ms frame (median 0.3) in ffa; recent move: no recent move
  - hit by 70 personas (adult-smash-veteran-05 x184, teen-platform-veteran-03 x184, adult-smash-veteran-03 x155, older-slow-reaction-01 x145); plausibly noticed by about 70 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene ffa --seed 480978262 --arg persona=adult-casual-low-patience-01 --arg fighter=Naily --arg stage=grandplains --arg kind=ffa` (frame 3019); `node scripts/playtest.mjs --scene flow --seed 845250699 --arg persona=adult-casual-low-patience-01 --arg fighter=Test Tube` (frame 408)
- **[SLOW] jank-spike** (JANK) x2072 - a 41 ms frame (median 0.6) in teams; recent move: no recent move
  - hit by 33 personas (teen-platform-veteran-03 x173, adult-competitive-02 x125, old-laptop-02 x118, wasd-habit-04 x105); plausibly noticed by about 33 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene teams --seed 247341156 --arg persona=adult-competitive-01 --arg fighter=Tree --arg stage=canyon --arg kind=teams` (frame 1144); `node scripts/playtest.mjs --scene teams --seed 601507442 --arg persona=adult-competitive-01 --arg fighter=Ruler --arg stage=pillars --arg kind=teams` (frame 2400)
- **[SLOW] jank-spike** (JANK) x6440 - a 55 ms frame (median 0.7) in ctf/hide; recent move: no recent move
  - hit by 21 personas (worldcup-fan-04 x682, ctf-planner-01 x670, teen-friends-ctf-03 x533, ctf-planner-04 x475); plausibly noticed by about 21 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene flagcup --seed 605395360 --arg persona=adult-reader-explorer-01` (frame 121); `node scripts/playtest.mjs --scene flagcup --seed 96165298 --arg persona=adult-reader-explorer-01` (frame 104)
- **[SLOW] jank-spike** (JANK) x927 - a 34 ms frame (median 0.3) in boss; recent move: no recent move
  - hit by 21 personas (boss-rush-grinder-02 x170, boss-rush-grinder-01 x101, boss-rush-grinder-04 x97, kid-sibling-rival-03 x89); plausibly noticed by about 21 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene boss --seed 614095181 --arg persona=boss-rush-grinder-01 --arg fighter=Bell --arg boss=8` (frame 3490); `node scripts/playtest.mjs --scene boss --seed 891582844 --arg persona=boss-rush-grinder-01 --arg fighter=Leafy --arg boss=10` (frame 5184)
- **[SLOW] jank-spike** (JANK) x44 - a 37 ms frame (median 0.1) in ffa; recent move: Firey|ember.smash
  - hit by 16 personas (adult-parent-first-time-01 x14, older-slow-reaction-02 x6, adult-parent-first-time-04 x4, lefty-remapper-01 x4); plausibly noticed by about 20 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene tutorial --seed 34449409 --arg persona=adult-parent-first-time-01` (frame 1332); `node scripts/playtest.mjs --scene training --seed 43803849 --arg persona=adult-parent-first-time-01 --arg fighter=Firey` (frame 525)
- **[SLOW] jank-spike** (JANK) x83 - a 44 ms frame (median 0.3) in ffa; recent move: Match|spark.jab
  - hit by 15 personas (teen-platform-veteran-03 x17, wasd-habit-03 x15, old-laptop-02 x13, adult-parent-first-time-01 x6); plausibly noticed by about 20 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene flow --seed 338861478 --arg persona=adult-competitive-04 --arg fighter=Silver Spoon` (frame 1569); `node scripts/playtest.mjs --scene ffa --seed 843033476 --arg persona=adult-parent-first-time-01 --arg fighter=Yin-Yang --arg stage=bigincin --arg kind=ffa` (frame 1501)
- **[SLOW] jank-spike** (JANK) x95 - a 52 ms frame (median 0.3) in ffa; recent move: Fern|photo.jab
  - hit by 14 personas (lefty-remapper-03 x37, teen-platform-veteran-03 x18, menu-skipper-01 x8, adult-parent-first-time-03 x7); plausibly noticed by about 20 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene flow --seed 275709908 --arg persona=adult-competitive-01 --arg fighter=Teardrop` (frame 2617); `node scripts/playtest.mjs --scene flow --seed 358057205 --arg persona=adult-competitive-02 --arg fighter=Microphone` (frame 753)
- **[SLOW] jank-spike** (JANK) x970 - a 115 ms frame (median 1.5) in ctf/fix; recent move: no recent move
  - hit by 17 personas (teen-friends-ctf-01 x108, teen-friends-ctf-02 x107, adult-reader-explorer-03 x103, ctf-planner-01 x97); plausibly noticed by about 17 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene flagcup --seed 605395360 --arg persona=adult-reader-explorer-01` (frame 3263); `node scripts/playtest.mjs --scene flagcup --seed 96165298 --arg persona=adult-reader-explorer-01` (frame 1019)
- ... and 4037 more root causes of this kind (all in the JSON files)
#### jank-stutter: 7 root causes, 14364 occurrences
- **[SLOW] jank-stutter** (JANK) x1842 - 3 slow frames within a second in ffa
  - hit by 58 personas (lefty-remapper-02 x119, lefty-remapper-03 x119, menu-skipper-01 x110, adult-parent-first-time-02 x88); plausibly noticed by about 58 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene flow --seed 845250699 --arg persona=adult-casual-low-patience-01 --arg fighter=Test Tube` (frame 619); `node scripts/playtest.mjs --scene ffa --seed 31456317 --arg persona=adult-casual-low-patience-01 --arg fighter=MeTag --arg stage=grandplains --arg kind=ffa` (frame 180)
- **[SLOW] jank-stutter** (JANK) x3600 - 3 slow frames within a second in teams
  - hit by 32 personas (old-laptop-02 x290, adult-competitive-02 x227, wasd-habit-04 x223, teen-friends-ctf-01 x222); plausibly noticed by about 32 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene teams --seed 601507442 --arg persona=adult-competitive-01 --arg fighter=Ruler --arg stage=pillars --arg kind=teams` (frame 2752); `node scripts/playtest.mjs --scene teams --seed 779395486 --arg persona=adult-competitive-01 --arg fighter=Bomb --arg stage=needle --arg kind=teams` (frame 496)
- **[SLOW] jank-stutter** (JANK) x1872 - 3 slow frames within a second in ctf/hide
  - hit by 19 personas (ctf-planner-01 x222, worldcup-fan-04 x210, teen-friends-ctf-03 x176, ctf-planner-04 x155); plausibly noticed by about 19 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene flagcup --seed 605395360 --arg persona=adult-reader-explorer-01` (frame 768); `node scripts/playtest.mjs --scene flagcup --seed 96165298 --arg persona=adult-reader-explorer-01` (frame 128)
- **[SLOW] jank-stutter** (JANK) x306 - 3 slow frames within a second in boss
  - hit by 19 personas (boss-rush-grinder-02 x86, kid-sibling-rival-02 x37, boss-rush-grinder-04 x36, old-laptop-02 x24); plausibly noticed by about 19 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene boss --seed 465475152 --arg persona=boss-rush-grinder-01 --arg fighter=Test Tube --arg boss=4` (frame 8152); `node scripts/playtest.mjs --scene boss --seed 575683294 --arg persona=boss-rush-grinder-01 --arg fighter=Flower --arg boss=5` (frame 1336)
- **[SLOW] jank-stutter** (JANK) x231 - 3 slow frames within a second in ctf/fix
  - hit by 17 personas (adult-reader-explorer-03 x24, teen-friends-ctf-01 x23, teen-friends-ctf-02 x23, ctf-planner-01 x20); plausibly noticed by about 17 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene flagcup --seed 605395360 --arg persona=adult-reader-explorer-01` (frame 3265); `node scripts/playtest.mjs --scene flagcup --seed 96165298 --arg persona=adult-reader-explorer-01` (frame 1019)
- **[SLOW] jank-stutter** (JANK) x6512 - 3 slow frames within a second in ctf/play
  - hit by 13 personas (ctf-planner-01 x1376, ctf-planner-04 x1040, teen-friends-ctf-03 x838, teen-friends-ctf-04 x649); plausibly noticed by about 13 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene flagcup --seed 777108054 --arg persona=adult-reader-explorer-01` (frame 3440); `node scripts/playtest.mjs --scene flagcup --seed 722758312 --arg persona=adult-reader-explorer-03` (frame 3727)
- **[SLOW] jank-stutter** (JANK) x1 - 3 slow frames within a second in ctf/bid
  - hit by 1 personas (ctf-planner-01 x1); plausibly noticed by about 4 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene ctf --seed 858171064 --arg persona=ctf-planner-01 --arg fighter=Naily --arg map=sky --arg n=4` (frame 112)
#### jank-slow-click: 23 root causes, 376 occurrences
- **[SLOW] jank-slow-click** (JANK) x195 - a click on "⚙ Settings" at screen "title" took 4963 ms before the next screen was ready
  - hit by 23 personas (lefty-remapper-01 x15, lefty-remapper-02 x15, lefty-remapper-03 x15, lefty-remapper-04 x15); plausibly noticed by about 23 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene menus --seed 183679964 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene menus --seed 616683495 --arg persona=adult-reader-explorer-01`
- **[SLOW] jank-slow-click** (JANK) x19 - a click on "Skip" at screen "tutorial" took 257 ms before the next screen was ready
  - hit by 16 personas (adult-smash-veteran-05 x2, teen-collector-01 x2, teen-platform-veteran-02 x2, adult-casual-low-patience-03 x1); plausibly noticed by about 20 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene ffa --seed 821134853 --arg persona=adult-casual-low-patience-03`; `node scripts/playtest.mjs --scene flow --seed 275709908 --arg persona=adult-competitive-01`
- **[SLOW] jank-slow-click** (JANK) x65 - a click on "🎒 Locker" at screen "title" took 267 ms before the next screen was ready
  - hit by 15 personas (menu-skipper-02 x8, adult-reader-explorer-04 x7, teen-collector-01 x6, kid-masher-01 x5); plausibly noticed by about 15 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene menus --seed 183679964 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene menus --seed 616683495 --arg persona=adult-reader-explorer-01`
- **[SLOW] jank-slow-click** (JANK) x8 - a click on "◂ Only the fighters I have u" at screen "select" took 382 ms before the next screen was ready
  - hit by 8 personas (adult-casual-low-patience-03 x1, adult-competitive-03 x1, adult-competitive-04 x1, adult-smash-veteran-03 x1); plausibly noticed by about 20 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene flow --seed 788087964 --arg persona=adult-casual-low-patience-03`; `node scripts/playtest.mjs --scene teams --seed 869891047 --arg persona=adult-competitive-03`
- **[SLOW] jank-slow-click** (JANK) x60 - a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 584 ms before the next screen was ready
  - hit by 12 personas (adult-reader-explorer-01 x5, adult-reader-explorer-02 x5, adult-reader-explorer-03 x5, adult-reader-explorer-04 x5); plausibly noticed by about 12 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene flagcup --seed 605395360 --arg persona=adult-reader-explorer-01` (frame 3840); `node scripts/playtest.mjs --scene flagcup --seed 96165298 --arg persona=adult-reader-explorer-01` (frame 3840)
- **[SLOW] jank-slow-click** (JANK) x3 - a click on "Teams" at screen "select" took 280 ms before the next screen was ready
  - hit by 3 personas (adult-smash-veteran-03 x1, old-laptop-02 x1, teen-friends-ctf-02 x1); plausibly noticed by about 20 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene teams --seed 715724520 --arg persona=adult-smash-veteran-03`; `node scripts/playtest.mjs --scene teams --seed 142473706 --arg persona=old-laptop-02`
- **[SLOW] jank-slow-click** (JANK) x1 - a click on "Nickel (II)" at screen "select" took 266 ms before the next screen was ready
  - hit by 1 personas (adult-smash-veteran-05 x1); plausibly noticed by about 20 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene ffa --seed 865056363 --arg persona=adult-smash-veteran-05`
- **[SLOW] jank-slow-click** (JANK) x1 - a click on "6" at screen "select" took 296 ms before the next screen was ready
  - hit by 1 personas (teen-friends-ctf-03 x1); plausibly noticed by about 20 of 80 (feel); severity SLOW
  - repro: `node scripts/playtest.mjs --scene teams --seed 927114963 --arg persona=teen-friends-ctf-03`
- ... and 15 more root causes of this kind (all in the JSON files)
#### ctf-fix-long: 9 root causes, 9 occurrences
- **[SLOW] ctf-fix-long** x1 - CTF oak: the "check the way is open" phase took 22.8 s of game time
  - hit by 1 personas (ctf-planner-01 x1); plausibly noticed by about 9 of 80 (design); severity SLOW
  - repro: `node scripts/playtest.mjs --scene ctf --seed 260973126 --arg persona=ctf-planner-01 --arg fighter=Remote --arg map=oak --arg n=2` (frame 11164)
- **[SLOW] ctf-fix-long** x1 - CTF castle: the "check the way is open" phase took 16.8 s of game time
  - hit by 1 personas (ctf-planner-02 x1); plausibly noticed by about 9 of 80 (design); severity SLOW
  - repro: `node scripts/playtest.mjs --scene ctf --seed 72217653 --arg persona=ctf-planner-02 --arg fighter=Puffball --arg map=castle --arg n=3` (frame 10743)
- **[SLOW] ctf-fix-long** x1 - CTF castle: the "check the way is open" phase took 16.5 s of game time
  - hit by 1 personas (ctf-planner-02 x1); plausibly noticed by about 9 of 80 (design); severity SLOW
  - repro: `node scripts/playtest.mjs --scene ctf --seed 716259412 --arg persona=ctf-planner-02 --arg fighter=Firey --arg map=castle --arg n=3` (frame 10726)
- **[SLOW] ctf-fix-long** x1 - CTF forest: the "check the way is open" phase took 24.1 s of game time
  - hit by 1 personas (ctf-planner-03 x1); plausibly noticed by about 9 of 80 (design); severity SLOW
  - repro: `node scripts/playtest.mjs --scene ctf --seed 557436262 --arg persona=ctf-planner-03 --arg fighter=Tea Kettle --arg map=forest --arg n=3` (frame 11241)
- **[SLOW] ctf-fix-long** x1 - CTF castle: the "check the way is open" phase took 41.0 s of game time
  - hit by 1 personas (teen-friends-ctf-01 x1); plausibly noticed by about 9 of 80 (design); severity SLOW
  - repro: `node scripts/playtest.mjs --scene ctf --seed 725862543 --arg persona=teen-friends-ctf-01 --arg fighter=Woody --arg map=castle --arg n=3` (frame 12198)
- **[SLOW] ctf-fix-long** x1 - CTF castle: the "check the way is open" phase took 24.5 s of game time
  - hit by 1 personas (teen-friends-ctf-01 x1); plausibly noticed by about 9 of 80 (design); severity SLOW
  - repro: `node scripts/playtest.mjs --scene ctf --seed 954919802 --arg persona=teen-friends-ctf-01 --arg fighter=Gaty --arg map=castle --arg n=3` (frame 11237)
- **[SLOW] ctf-fix-long** x1 - CTF oak: the "check the way is open" phase took 26.8 s of game time
  - hit by 1 personas (teen-friends-ctf-03 x1); plausibly noticed by about 9 of 80 (design); severity SLOW
  - repro: `node scripts/playtest.mjs --scene ctf --seed 440882614 --arg persona=teen-friends-ctf-03 --arg fighter=Saw --arg map=oak --arg n=2` (frame 11404)
- **[SLOW] ctf-fix-long** x1 - CTF oak: the "check the way is open" phase took 18.4 s of game time
  - hit by 1 personas (teen-friends-ctf-03 x1); plausibly noticed by about 9 of 80 (design); severity SLOW
  - repro: `node scripts/playtest.mjs --scene ctf --seed 494393032 --arg persona=teen-friends-ctf-03 --arg fighter=Sidewalky --arg map=oak --arg n=2` (frame 10898)
- ... and 1 more root causes of this kind (all in the JSON files)

### FEEL (1094 root causes)
#### jank-teleport: 208 root causes, 3722 occurrences
- **[FEEL] jank-teleport** (JANK) x429 - Nickel moved 153 px in one frame (ffa; last move: Nickel|flip.up)
  - hit by 30 personas (boss-rush-grinder-02 x52, teen-platform-veteran-02 x46, adult-competitive-03 x42, teen-friends-ctf-03 x42); plausibly noticed by about 60 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene flow --seed 641936135 --arg persona=adult-casual-low-patience-02 --arg fighter=Microphone` (frame 1007); `node scripts/playtest.mjs --scene flow --seed 788087964 --arg persona=adult-casual-low-patience-03 --arg fighter=Pen` (frame 1706)
- **[FEEL] jank-teleport** (JANK) x227 - Balloony moved 248 px in one frame (ffa; last move: no move)
  - hit by 23 personas (old-laptop-03 x39, old-laptop-02 x26, adult-smash-veteran-05 x24, kid-sibling-rival-03 x20); plausibly noticed by about 60 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 398425307 --arg persona=adult-casual-low-patience-02 --arg fighter=Balloony --arg stage=pillars --arg kind=ffa` (frame 3761); `node scripts/playtest.mjs --scene flow --seed 915855723 --arg persona=adult-casual-low-patience-03 --arg fighter=Coiny` (frame 2849)
- **[FEEL] jank-teleport** (JANK) x395 - Lightning moved 177 px in one frame (teams; last move: Lightning|zap.up)
  - hit by 23 personas (old-laptop-03 x63, adult-competitive-04 x61, wasd-habit-01 x45, kid-sibling-rival-02 x41); plausibly noticed by about 60 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene teams --seed 933172197 --arg persona=adult-competitive-03 --arg fighter=Ice Cube --arg stage=bigincin --arg kind=teams` (frame 502); `node scripts/playtest.mjs --scene teams --seed 464113275 --arg persona=adult-competitive-04 --arg fighter=Knife --arg stage=needle --arg kind=teams` (frame 70)
- **[FEEL] jank-teleport** (JANK) x263 - Bracelety moved 164 px in one frame (teams; last move: Bracelety|sign.up)
  - hit by 21 personas (teen-friends-ctf-04 x54, adult-competitive-04 x44, old-laptop-03 x27, teen-platform-veteran-04 x22); plausibly noticed by about 60 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene teams --seed 321463854 --arg persona=adult-competitive-04 --arg fighter=Ice Cube --arg stage=canyon --arg kind=teams` (frame 84); `node scripts/playtest.mjs --scene flow --seed 435756716 --arg persona=adult-smash-veteran-01 --arg fighter=Tea Kettle` (frame 261)
- **[FEEL] jank-teleport** (JANK) x228 - Toothpaste moved 157 px in one frame (ffa; last move: Toothpaste|paste.up)
  - hit by 19 personas (wasd-habit-04 x45, wasd-habit-01 x41, teen-friends-ctf-03 x27, adult-competitive-03 x20); plausibly noticed by about 60 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene flow --seed 407696365 --arg persona=adult-casual-low-patience-03 --arg fighter=TV` (frame 832); `node scripts/playtest.mjs --scene teams --seed 779395486 --arg persona=adult-competitive-01 --arg fighter=Bomb --arg stage=needle --arg kind=teams` (frame 1128)
- **[FEEL] jank-teleport** (JANK) x145 - Starfruit moved 152 px in one frame (ffa; last move: Starfruit|onehit.up)
  - hit by 18 personas (teen-platform-veteran-02 x36, adult-smash-veteran-03 x23, teen-friends-ctf-05 x20, old-laptop-01 x14); plausibly noticed by about 60 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene 1v1 --seed 195829859 --arg persona=adult-smash-veteran-02 --arg fighter=Starfruit --arg stage=shift --arg kind=1v1` (frame 374); `node scripts/playtest.mjs --scene ffa --seed 58252319 --arg persona=adult-smash-veteran-03 --arg fighter=Marker --arg stage=forest --arg kind=ffa` (frame 292)
- **[FEEL] jank-teleport** (JANK) x389 - Bubble moved 154 px in one frame (ffa; last move: Bubble|float.up)
  - hit by 16 personas (adult-smash-veteran-04 x64, teen-friends-ctf-01 x47, teen-friends-ctf-02 x46, adult-competitive-03 x37); plausibly noticed by about 60 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene flow --seed 275709908 --arg persona=adult-competitive-01 --arg fighter=Teardrop` (frame 306); `node scripts/playtest.mjs --scene flow --seed 914866687 --arg persona=adult-competitive-02 --arg fighter=Bracelety` (frame 913)
- **[FEEL] jank-teleport** (JANK) x97 - Remote moved 151 px in one frame (teams; last move: Remote|battery.up)
  - hit by 16 personas (teen-friends-ctf-01 x19, adult-smash-veteran-02 x11, kid-masher-03 x10, lefty-remapper-02 x8); plausibly noticed by about 60 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene teams --seed 272674449 --arg persona=adult-competitive-02 --arg fighter=Remote --arg stage=needle --arg kind=teams` (frame 5025); `node scripts/playtest.mjs --scene ffa --seed 416657818 --arg persona=adult-smash-veteran-02 --arg fighter=Poppy --arg stage=tlc --arg kind=ffa` (frame 211)
- ... and 200 more root causes of this kind (all in the JSON files)
#### jank-snag: 420 root causes, 2225 occurrences
- **[FEEL] jank-snag** (JANK) x19 - the player held a walk key 24 frames on the ground and did not move (ffa, stage dreamisle)
  - hit by 13 personas (wasd-habit-02 x3, adult-competitive-01 x2, adult-smash-veteran-02 x2, kid-masher-01 x2); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene 1v1 --seed 829883682 --arg persona=adult-competitive-01 --arg fighter=Basketball --arg stage=dreamisle --arg kind=1v1` (frame 2138); `node scripts/playtest.mjs --scene 1v1 --seed 489612677 --arg persona=adult-competitive-03 --arg fighter=Dora --arg stage=dreamisle --arg kind=1v1` (frame 1036)
- **[FEEL] jank-snag** (JANK) x18 - the player held a walk key 24 frames on the ground and did not move (ffa, stage ice)
  - hit by 11 personas (kid-masher-02 x3, adult-casual-low-patience-04 x2, kid-bfdi-fan-02 x2, kid-masher-01 x2); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 924603085 --arg persona=adult-casual-low-patience-04 --arg fighter=Rose --arg stage=ice --arg kind=ffa` (frame 4534); `node scripts/playtest.mjs --scene 1v1 --seed 965817866 --arg persona=kid-bfdi-fan-02 --arg fighter=Remote --arg stage=ice --arg kind=1v1` (frame 4235)
- **[FEEL] jank-snag** (JANK) x21 - the player held a walk key 24 frames on the ground and did not move (ffa, stage ice)
  - hit by 10 personas (kid-bfdi-fan-02 x5, kid-masher-01 x4, older-slow-reaction-03 x4, kid-masher-02 x2); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene 1v1 --seed 965817866 --arg persona=kid-bfdi-fan-02 --arg fighter=Remote --arg stage=ice --arg kind=1v1` (frame 954); `node scripts/playtest.mjs --scene 1v1 --seed 668098220 --arg persona=kid-bfdi-fan-02 --arg fighter=Firey Jr. --arg stage=ice --arg kind=1v1` (frame 1703)
- **[FEEL] jank-snag** (JANK) x13 - the player held a walk key 24 frames on the ground and did not move (ffa, stage goiky)
  - hit by 8 personas (kid-bfdi-fan-02 x3, boss-rush-grinder-03 x2, kid-bfdi-fan-04 x2, kid-sibling-rival-01 x2); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene 1v1 --seed 84101174 --arg persona=adult-smash-veteran-01 --arg fighter=Tree --arg stage=goiky --arg kind=1v1` (frame 8360); `node scripts/playtest.mjs --scene boss --seed 42327569 --arg persona=boss-rush-grinder-03 --arg fighter=Fries --arg boss=4` (frame 7283)
- **[FEEL] jank-snag** (JANK) x11 - the player held a walk key 24 frames on the ground and did not move (ffa, stage goiky)
  - hit by 7 personas (boss-rush-grinder-01 x4, kid-bfdi-fan-02 x2, adult-smash-veteran-04 x1, boss-rush-grinder-03 x1); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 524300432 --arg persona=adult-smash-veteran-04 --arg fighter=Flower --arg stage=goiky --arg kind=ffa` (frame 3364); `node scripts/playtest.mjs --scene boss --seed 575683294 --arg persona=boss-rush-grinder-01 --arg fighter=Flower --arg boss=5` (frame 4433)
- **[FEEL] jank-snag** (JANK) x8 - the player held a walk key 24 frames on the ground and did not move (boss, stage goiky)
  - hit by 7 personas (old-laptop-05 x2, boss-rush-grinder-02 x1, boss-rush-grinder-03 x1, kid-bfdi-fan-02 x1); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene boss --seed 681373856 --arg persona=boss-rush-grinder-02 --arg fighter=Magnet --arg boss=5` (frame 3948); `node scripts/playtest.mjs --scene boss --seed 351229286 --arg persona=boss-rush-grinder-03 --arg fighter=Trophy --arg boss=11` (frame 6755)
- **[FEEL] jank-snag** (JANK) x7 - the player held a walk key 24 frames on the ground and did not move (ffa, stage dreamisle)
  - hit by 6 personas (kid-masher-01 x2, adult-parent-first-time-04 x1, lefty-remapper-03 x1, old-laptop-02 x1); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 734421662 --arg persona=adult-parent-first-time-04 --arg fighter=Bell --arg stage=dreamisle --arg kind=ffa` (frame 4369); `node scripts/playtest.mjs --scene ffa --seed 539958520 --arg persona=kid-masher-01 --arg fighter=Coiny --arg stage=dreamisle --arg kind=ffa` (frame 1199)
- **[FEEL] jank-snag** (JANK) x25 - the player held a walk key 24 frames on the ground and did not move (teams, stage ice)
  - hit by 6 personas (adult-smash-veteran-02 x6, teen-friends-ctf-03 x6, teen-platform-veteran-02 x4, wasd-habit-04 x4); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene teams --seed 323722878 --arg persona=adult-smash-veteran-02 --arg fighter=Cheesy --arg stage=ice --arg kind=teams` (frame 5609); `node scripts/playtest.mjs --scene teams --seed 272841406 --arg persona=old-laptop-03 --arg fighter=Book --arg stage=ice --arg kind=teams` (frame 909)
- ... and 412 more root causes of this kind (all in the JSON files)
#### jank-air-hang: 47 root causes, 180 occurrences
- **[FEEL] jank-air-hang** (JANK) x8 - Goo hung motionless in the air for 45 frames (ffa) at 490,515
  - hit by 3 personas (adult-casual-low-patience-01 x6, adult-smash-veteran-04 x1, teen-speedrunner-02 x1); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene flow --seed 845250699 --arg persona=adult-casual-low-patience-01 --arg fighter=Test Tube` (frame 3513); `node scripts/playtest.mjs --scene flow --seed 721676373 --arg persona=adult-casual-low-patience-01 --arg fighter=Bomby` (frame 5575)
- **[FEEL] jank-air-hang** (JANK) x8 - Balloony hung motionless in the air for 45 frames (ffa) at 576,596
  - hit by 3 personas (menu-skipper-03 x4, adult-competitive-04 x3, adult-casual-low-patience-02 x1); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 398425307 --arg persona=adult-casual-low-patience-02 --arg fighter=Balloony --arg stage=pillars --arg kind=ffa` (frame 3020); `node scripts/playtest.mjs --scene teams --seed 969824341 --arg persona=adult-competitive-04 --arg fighter=Yin-Yang --arg stage=pillars --arg kind=teams` (frame 2522)
- **[FEEL] jank-air-hang** (JANK) x3 - Balloony hung motionless in the air for 45 frames (teams) at 803,1057
  - hit by 2 personas (adult-smash-veteran-02 x2, adult-competitive-02 x1); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene teams --seed 272674449 --arg persona=adult-competitive-02 --arg fighter=Remote --arg stage=needle --arg kind=teams` (frame 4677); `node scripts/playtest.mjs --scene teams --seed 374186003 --arg persona=adult-smash-veteran-02 --arg fighter=Match --arg stage=needle --arg kind=teams` (frame 2644)
- **[FEEL] jank-air-hang** (JANK) x10 - Balloony hung motionless in the air for 45 frames (teams) at 2180,1231
  - hit by 2 personas (adult-smash-veteran-05 x8, old-laptop-03 x2); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene teams --seed 193274121 --arg persona=adult-smash-veteran-05 --arg fighter=David --arg stage=incin --arg kind=teams` (frame 498); `node scripts/playtest.mjs --scene ffa --seed 747974061 --arg persona=old-laptop-03 --arg fighter=Teardrop --arg stage=incin --arg kind=ffa` (frame 1612)
- **[FEEL] jank-air-hang** (JANK) x5 - Fan hung motionless in the air for 45 frames (ffa) at 2665,1167
  - hit by 2 personas (wasd-habit-04 x4, kid-sibling-rival-03 x1); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 804595787 --arg persona=kid-sibling-rival-03 --arg fighter=Sidewalky --arg stage=bigincin --arg kind=ffa` (frame 6150); `node scripts/playtest.mjs --scene ffa --seed 211491354 --arg persona=wasd-habit-04 --arg fighter=Bell --arg stage=bigincin --arg kind=ffa` (frame 2269)
- **[FEEL] jank-air-hang** (JANK) x4 - Goo hung motionless in the air for 45 frames (ffa) at 3568,1400
  - hit by 2 personas (lefty-remapper-03 x3, menu-skipper-01 x1); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene 1v1 --seed 669751511 --arg persona=lefty-remapper-03 --arg fighter=Ruler --arg stage=bigincin --arg kind=1v1` (frame 5937); `node scripts/playtest.mjs --scene ffa --seed 346067056 --arg persona=menu-skipper-01 --arg fighter=Basketball --arg stage=bigincin --arg kind=ffa` (frame 10686)
- **[FEEL] jank-air-hang** (JANK) x25 - Balloony hung motionless in the air for 45 frames (ffa) at 3535,1550
  - hit by 2 personas (old-laptop-03 x15, lefty-remapper-03 x10); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 860051606 --arg persona=lefty-remapper-03 --arg fighter=Loser --arg stage=fortress --arg kind=ffa` (frame 1525); `node scripts/playtest.mjs --scene ffa --seed 59304827 --arg persona=old-laptop-03 --arg fighter=TV --arg stage=fortress --arg kind=ffa` (frame 896)
- **[FEEL] jank-air-hang** (JANK) x1 - Fan hung motionless in the air for 45 frames (ffa) at 407,408
  - hit by 1 personas (adult-casual-low-patience-01 x1); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 572771788 --arg persona=adult-casual-low-patience-01 --arg fighter=Sidewalky --arg stage=incin --arg kind=ffa` (frame 2719)
- ... and 39 more root causes of this kind (all in the JSON files)
#### jank-camera-snap: 7 root causes, 50 occurrences
- **[FEEL] jank-camera-snap** (JANK) x1 - the camera jumped 178 px / zoom 0.00 in one frame (teams)
  - hit by 1 personas (adult-competitive-02 x1); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene teams --seed 87283014 --arg persona=adult-competitive-02 --arg fighter=Microphone --arg stage=canyon --arg kind=teams` (frame 7286)
- **[FEEL] jank-camera-snap** (JANK) x1 - the camera jumped 172 px / zoom 0.00 in one frame (teams)
  - hit by 1 personas (adult-smash-veteran-01 x1); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene teams --seed 676324726 --arg persona=adult-smash-veteran-01 --arg fighter=Bomb --arg stage=fortress --arg kind=teams` (frame 2627)
- **[FEEL] jank-camera-snap** (JANK) x4 - the camera jumped 241 px / zoom 0.00 in one frame (ffa)
  - hit by 1 personas (teen-collector-04 x4); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 297136938 --arg persona=teen-collector-04 --arg fighter=Lightning --arg stage=bigincin --arg kind=ffa` (frame 9373)
- **[FEEL] jank-camera-snap** (JANK) x1 - the camera jumped 176 px / zoom 0.00 in one frame (teams)
  - hit by 1 personas (teen-friends-ctf-03 x1); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene teams --seed 904899601 --arg persona=teen-friends-ctf-03 --arg fighter=Nickel --arg stage=ice --arg kind=teams` (frame 3651)
- **[FEEL] jank-camera-snap** (JANK) x1 - the camera jumped 168 px / zoom 0.00 in one frame (teams)
  - hit by 1 personas (teen-platform-veteran-01 x1); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene teams --seed 613030925 --arg persona=teen-platform-veteran-01 --arg fighter=Baseball --arg stage=bigincin --arg kind=teams` (frame 9219)
- **[FEEL] jank-camera-snap** (JANK) x1 - the camera jumped 166 px / zoom 0.00 in one frame (teams)
  - hit by 1 personas (teen-platform-veteran-02 x1); plausibly noticed by about 56 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene teams --seed 985382394 --arg persona=teen-platform-veteran-02 --arg fighter=Book --arg stage=tlc --arg kind=teams` (frame 8939)
- **[FEEL] jank-camera-snap** (JANK) x41 - the camera jumped 0 px / zoom 0.18 in one frame (ffa)
  - hit by 9 personas (ctf-planner-01 x5, ctf-planner-03 x5, teen-friends-ctf-01 x5, teen-friends-ctf-03 x5); plausibly noticed by about 9 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ctf-practice --seed 873328348 --arg persona=ctf-planner-01` (frame 2264); `node scripts/playtest.mjs --scene ctf-practice --seed 97621799 --arg persona=ctf-planner-01` (frame 2265)
#### long-match: 37 root causes, 509 occurrences
- **[FEEL] long-match** x120 - ffa match on goiky was still going after 2 min of game time
  - hit by 24 personas (adult-competitive-01 x5, adult-competitive-02 x5, adult-competitive-03 x5, adult-competitive-04 x5); plausibly noticed by about 72 of 80 (design); severity FEEL
  - repro: `node scripts/playtest.mjs --scene training --seed 998438075 --arg persona=adult-competitive-01 --arg fighter=Cake` (frame 5400); `node scripts/playtest.mjs --scene training --seed 732588867 --arg persona=adult-competitive-01 --arg fighter=Firey Jr.` (frame 5400)
- **[FEEL] long-match** x15 - ffa match on canyon was still going after 3 min of game time
  - hit by 15 personas (adult-parent-first-time-04 x1, adult-smash-veteran-02 x1, adult-smash-veteran-03 x1, adult-smash-veteran-05 x1); plausibly noticed by about 72 of 80 (design); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 372686775 --arg persona=adult-parent-first-time-04 --arg fighter=Golf Ball --arg stage=canyon --arg kind=ffa` (frame 10800); `node scripts/playtest.mjs --scene 1v1 --seed 947660885 --arg persona=adult-smash-veteran-02 --arg fighter=Naily --arg stage=canyon --arg kind=1v1` (frame 10800)
- **[FEEL] long-match** x15 - teams match on needle was still going after 3 min of game time
  - hit by 14 personas (old-laptop-02 x2, adult-competitive-01 x1, adult-competitive-02 x1, adult-competitive-04 x1); plausibly noticed by about 72 of 80 (design); severity FEEL
  - repro: `node scripts/playtest.mjs --scene teams --seed 779395486 --arg persona=adult-competitive-01 --arg fighter=Bomb --arg stage=needle --arg kind=teams` (frame 10800); `node scripts/playtest.mjs --scene teams --seed 272674449 --arg persona=adult-competitive-02 --arg fighter=Remote --arg stage=needle --arg kind=teams` (frame 10800)
- **[FEEL] long-match** x13 - ffa match on skytower was still going after 3 min of game time
  - hit by 12 personas (teen-collector-03 x2, adult-casual-low-patience-02 x1, adult-smash-veteran-02 x1, adult-smash-veteran-04 x1); plausibly noticed by about 72 of 80 (design); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 40242661 --arg persona=adult-casual-low-patience-02 --arg fighter=Sidewalky --arg stage=skytower --arg kind=ffa` (frame 10800); `node scripts/playtest.mjs --scene ffa --seed 255933792 --arg persona=adult-smash-veteran-02 --arg fighter=Sidewalky --arg stage=skytower --arg kind=ffa` (frame 10800)
- **[FEEL] long-match** x11 - ffa match on grandplains was still going after 3 min of game time
  - hit by 11 personas (adult-casual-low-patience-01 x1, adult-parent-first-time-01 x1, adult-parent-first-time-02 x1, kid-bfdi-fan-02 x1); plausibly noticed by about 72 of 80 (design); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 31456317 --arg persona=adult-casual-low-patience-01 --arg fighter=MeTag --arg stage=grandplains --arg kind=ffa` (frame 10800); `node scripts/playtest.mjs --scene ffa --seed 143290693 --arg persona=adult-parent-first-time-01 --arg fighter=Money --arg stage=grandplains --arg kind=ffa` (frame 10800)
- **[FEEL] long-match** x14 - teams match on incin was still going after 3 min of game time
  - hit by 11 personas (teen-platform-veteran-04 x3, teen-friends-ctf-02 x2, adult-competitive-03 x1, adult-smash-veteran-03 x1); plausibly noticed by about 72 of 80 (design); severity FEEL
  - repro: `node scripts/playtest.mjs --scene teams --seed 869891047 --arg persona=adult-competitive-03 --arg fighter=Woody --arg stage=incin --arg kind=teams` (frame 10800); `node scripts/playtest.mjs --scene teams --seed 195688981 --arg persona=adult-smash-veteran-03 --arg fighter=Rose --arg stage=incin --arg kind=teams` (frame 10800)
- **[FEEL] long-match** x13 - ffa match on bigincin was still going after 3 min of game time
  - hit by 10 personas (adult-smash-veteran-05 x2, menu-skipper-01 x2, teen-platform-veteran-03 x2, adult-competitive-01 x1); plausibly noticed by about 72 of 80 (design); severity FEEL
  - repro: `node scripts/playtest.mjs --scene 1v1 --seed 250713902 --arg persona=adult-competitive-01 --arg fighter=Lollipop --arg stage=bigincin --arg kind=1v1` (frame 10800); `node scripts/playtest.mjs --scene ffa --seed 895866883 --arg persona=adult-smash-veteran-05 --arg fighter=Cherries --arg stage=bigincin --arg kind=ffa` (frame 10800)
- **[FEEL] long-match** x9 - teams match on canyon was still going after 3 min of game time
  - hit by 9 personas (adult-competitive-01 x1, adult-competitive-04 x1, adult-smash-veteran-02 x1, adult-smash-veteran-04 x1); plausibly noticed by about 72 of 80 (design); severity FEEL
  - repro: `node scripts/playtest.mjs --scene teams --seed 247341156 --arg persona=adult-competitive-01 --arg fighter=Tree --arg stage=canyon --arg kind=teams` (frame 10800); `node scripts/playtest.mjs --scene teams --seed 321463854 --arg persona=adult-competitive-04 --arg fighter=Ice Cube --arg stage=canyon --arg kind=teams` (frame 10800)
- ... and 29 more root causes of this kind (all in the JSON files)
#### jank-audio-burst: 4 root causes, 135 occurrences
- **[FEEL] jank-audio-burst** (JANK) x39 - 8 sound calls in one frame (ffa)
  - hit by 26 personas (adult-parent-first-time-03 x4, lefty-remapper-01 x4, adult-parent-first-time-02 x3, teen-platform-veteran-02 x3); plausibly noticed by about 26 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 503644017 --arg persona=adult-casual-low-patience-03 --arg fighter=Rose --arg stage=forest --arg kind=ffa` (frame 2058); `node scripts/playtest.mjs --scene training --seed 184667718 --arg persona=adult-competitive-02 --arg fighter=Woody` (frame 525)
- **[FEEL] jank-audio-burst** (JANK) x90 - 17 sound calls in one frame (boss)
  - hit by 18 personas (boss-rush-grinder-03 x14, boss-rush-grinder-02 x10, boss-rush-grinder-04 x9, old-laptop-01 x8); plausibly noticed by about 18 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene boss --seed 465475152 --arg persona=boss-rush-grinder-01 --arg fighter=Test Tube --arg boss=4` (frame 119); `node scripts/playtest.mjs --scene boss --seed 933413996 --arg persona=boss-rush-grinder-01 --arg fighter=Dough --arg boss=0` (frame 5785)
- **[FEEL] jank-audio-burst** (JANK) x5 - 9 sound calls in one frame (teams)
  - hit by 5 personas (adult-smash-veteran-03 x1, adult-smash-veteran-04 x1, old-laptop-05 x1, teen-friends-ctf-01 x1); plausibly noticed by about 20 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene teams --seed 137677943 --arg persona=adult-smash-veteran-03 --arg fighter=Roboty --arg stage=grandplains --arg kind=teams` (frame 9963); `node scripts/playtest.mjs --scene teams --seed 821204465 --arg persona=adult-smash-veteran-04 --arg fighter=Gaty --arg stage=fortress --arg kind=teams` (frame 1594)
- **[FEEL] jank-audio-burst** (JANK) x1 - 12 sound calls in one frame (ctf/play)
  - hit by 1 personas (teen-friends-ctf-04 x1); plausibly noticed by about 1 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ctf-spectate --seed 318617995 --arg persona=teen-friends-ctf-04 --arg fighter=Apple --arg map=mines --arg n=4` (frame 4929)
#### cpu-idle: 2 root causes, 2 occurrences
- **[FEEL] cpu-idle** x1 - a CPU (Bonesaw) did not move or act for 10 s in a ffa match while foes were alive
  - hit by 1 personas (teen-speedrunner-03 x1); plausibly noticed by about 72 of 80 (design); severity FEEL
  - repro: `node scripts/playtest.mjs --scene 1v1 --seed 120075015 --arg persona=teen-speedrunner-03 --arg fighter=Blueberry --arg stage=skytower --arg kind=1v1` (frame 4880)
- **[FEEL] cpu-idle** x1 - a CPU (Marshmallow) did not move or act for 10 s in a ffa match while foes were alive
  - hit by 1 personas (teen-speedrunner-02 x1); plausibly noticed by about 7 of 80 (design); severity FEEL
  - repro: `node scripts/playtest.mjs --scene running --seed 895560197 --arg persona=teen-speedrunner-02` (frame 610)
#### jank-hitstop-drift: 113 root causes, 429 occurrences
- **[FEEL] jank-hitstop-drift** (JANK) x129 - Salt moved 27 px in one frame while in hitstop (ffa; last move: Salt|saltpepper.finisher)
  - hit by 18 personas (adult-smash-veteran-02 x15, ctf-planner-04 x15, adult-casual-low-patience-04 x12, boss-rush-grinder-02 x12); plausibly noticed by about 24 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 297997684 --arg persona=adult-casual-low-patience-04 --arg fighter=Ruler --arg stage=forest --arg kind=ffa` (frame 973); `node scripts/playtest.mjs --scene teams --seed 158266780 --arg persona=adult-competitive-02 --arg fighter=Tapey --arg stage=goiky --arg kind=teams` (frame 9763)
- **[FEEL] jank-hitstop-drift** (JANK) x45 - Nickel moved 87 px in one frame while in hitstop (ffa; last move: Nickel|flip.finisher)
  - hit by 15 personas (boss-rush-grinder-02 x13, boss-rush-grinder-03 x5, adult-competitive-03 x4, teen-platform-veteran-02 x4); plausibly noticed by about 20 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene flow --seed 641936135 --arg persona=adult-casual-low-patience-02 --arg fighter=Microphone` (frame 5542); `node scripts/playtest.mjs --scene 1v1 --seed 725621674 --arg persona=adult-competitive-01 --arg fighter=Nickel --arg stage=dreamisle --arg kind=1v1` (frame 2328)
- **[FEEL] jank-hitstop-drift** (JANK) x21 - Ice Cube moved 9 px in one frame while in hitstop (ffa; last move: Ice Cube|shatter.finisher)
  - hit by 8 personas (lefty-remapper-01 x5, adult-parent-first-time-03 x3, kid-bfdi-fan-02 x3, kid-bfdi-fan-03 x3); plausibly noticed by about 20 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 56298195 --arg persona=adult-parent-first-time-03 --arg fighter=Lollipop --arg stage=pillars --arg kind=ffa` (frame 8857); `node scripts/playtest.mjs --scene teams --seed 171881138 --arg persona=adult-smash-veteran-05 --arg fighter=Rocky --arg stage=wind --arg kind=teams` (frame 3317)
- **[FEEL] jank-hitstop-drift** (JANK) x5 - Pillow moved 73 px in one frame while in hitstop (ctf/play; last move: no move)
  - hit by 3 personas (ctf-planner-01 x2, ctf-planner-04 x2, lefty-remapper-01 x1); plausibly noticed by about 24 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ctf --seed 858171064 --arg persona=ctf-planner-01 --arg fighter=Naily --arg map=sky --arg n=4` (frame 9191); `node scripts/playtest.mjs --scene ctf --seed 240180941 --arg persona=ctf-planner-04 --arg fighter=Rose --arg map=sky --arg n=4` (frame 2593)
- **[FEEL] jank-hitstop-drift** (JANK) x8 - Goo moved 94 px in one frame while in hitstop (teams; last move: no move)
  - hit by 4 personas (old-laptop-01 x3, teen-platform-veteran-02 x3, adult-competitive-02 x1, teen-speedrunner-02 x1); plausibly noticed by about 20 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene teams --seed 87283014 --arg persona=adult-competitive-02 --arg fighter=Microphone --arg stage=canyon --arg kind=teams` (frame 2160); `node scripts/playtest.mjs --scene teams --seed 623559263 --arg persona=old-laptop-01 --arg fighter=Grassy --arg stage=needle --arg kind=teams` (frame 8972)
- **[FEEL] jank-hitstop-drift** (JANK) x7 - Basketball moved 44 px in one frame while in hitstop (ffa; last move: no move)
  - hit by 4 personas (wasd-habit-04 x3, teen-platform-veteran-04 x2, adult-parent-first-time-04 x1, lefty-remapper-04 x1); plausibly noticed by about 20 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 844719209 --arg persona=adult-parent-first-time-04 --arg fighter=Nickel (II) --arg stage=needle --arg kind=ffa` (frame 801); `node scripts/playtest.mjs --scene ffa --seed 589904972 --arg persona=lefty-remapper-04 --arg fighter=Lollipop --arg stage=dreamisle --arg kind=ffa` (frame 7335)
- **[FEEL] jank-hitstop-drift** (JANK) x6 - Rose moved 56 px in one frame while in hitstop (ffa; last move: no move)
  - hit by 3 personas (wasd-habit-03 x3, adult-casual-low-patience-01 x2, teen-speedrunner-01 x1); plausibly noticed by about 20 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene flow --seed 257238392 --arg persona=adult-casual-low-patience-01 --arg fighter=Bomby` (frame 569); `node scripts/playtest.mjs --scene flow --seed 405973711 --arg persona=teen-speedrunner-01 --arg fighter=Bell` (frame 1104)
- **[FEEL] jank-hitstop-drift** (JANK) x4 - Lightbulb moved 52 px in one frame while in hitstop (ffa; last move: no move)
  - hit by 3 personas (wasd-habit-03 x2, adult-smash-veteran-02 x1, adult-smash-veteran-04 x1); plausibly noticed by about 20 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 255933792 --arg persona=adult-smash-veteran-02 --arg fighter=Sidewalky --arg stage=skytower --arg kind=ffa` (frame 2379); `node scripts/playtest.mjs --scene flow --seed 162243497 --arg persona=adult-smash-veteran-04 --arg fighter=Woody` (frame 4970)
- ... and 105 more root causes of this kind (all in the JSON files)
#### jank-input-latency: 236 root causes, 1048 occurrences
- **[FEEL] jank-input-latency** (JANK) x10 - Trophy: atk took 7 frames (117 ms) from the key to the first change on the fighter
  - hit by 7 personas (lefty-remapper-02 x3, adult-smash-veteran-04 x2, ctf-planner-02 x1, old-laptop-01 x1); plausibly noticed by about 24 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 831629547 --arg persona=adult-smash-veteran-04 --arg fighter=Trophy --arg stage=goiky --arg kind=ffa` (frame 2333); `node scripts/playtest.mjs --scene ctf --seed 374169827 --arg persona=ctf-planner-02 --arg fighter=Trophy --arg map=castle --arg n=3` (frame 5554)
- **[FEEL] jank-input-latency** (JANK) x13 - Sidewalky: atk took 7 frames (117 ms) from the key to the first change on the fighter
  - hit by 10 personas (adult-casual-low-patience-01 x2, adult-smash-veteran-02 x2, old-laptop-02 x2, adult-smash-veteran-01 x1); plausibly noticed by about 20 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 572771788 --arg persona=adult-casual-low-patience-01 --arg fighter=Sidewalky --arg stage=incin --arg kind=ffa` (frame 1040); `node scripts/playtest.mjs --scene ffa --seed 422416664 --arg persona=adult-smash-veteran-01 --arg fighter=Sidewalky --arg stage=tlc --arg kind=ffa` (frame 519)
- **[FEEL] jank-input-latency** (JANK) x12 - Blocky: atk took 7 frames (117 ms) from the key to the first change on the fighter
  - hit by 6 personas (lefty-remapper-01 x4, teen-collector-03 x3, ctf-planner-04 x2, adult-competitive-04 x1); plausibly noticed by about 24 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene training --seed 586741427 --arg persona=adult-competitive-04 --arg fighter=Blocky` (frame 5089); `node scripts/playtest.mjs --scene ffa --seed 2152524 --arg persona=adult-smash-veteran-04 --arg fighter=Blocky --arg stage=incin --arg kind=ffa` (frame 1909)
- **[FEEL] jank-input-latency** (JANK) x15 - Ruler: atk took 7 frames (117 ms) from the key to the first change on the fighter
  - hit by 9 personas (adult-competitive-02 x3, adult-smash-veteran-02 x3, kid-bfdi-fan-02 x2, teen-speedrunner-01 x2); plausibly noticed by about 20 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 297997684 --arg persona=adult-casual-low-patience-04 --arg fighter=Ruler --arg stage=forest --arg kind=ffa` (frame 308); `node scripts/playtest.mjs --scene training --seed 741877091 --arg persona=adult-competitive-02 --arg fighter=Ruler` (frame 155)
- **[FEEL] jank-input-latency** (JANK) x32 - Teardrop: atk took 7 frames (117 ms) from the key to the first change on the fighter
  - hit by 9 personas (lefty-remapper-01 x10, lefty-remapper-02 x9, teen-platform-veteran-04 x5, lefty-remapper-03 x2); plausibly noticed by about 20 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 67532226 --arg persona=adult-parent-first-time-02 --arg fighter=Teardrop --arg stage=needle --arg kind=ffa` (frame 958); `node scripts/playtest.mjs --scene boss --seed 596063787 --arg persona=boss-rush-grinder-04 --arg fighter=Teardrop --arg boss=7` (frame 1884)
- **[FEEL] jank-input-latency** (JANK) x10 - Flower: smash took 5 frames (84 ms) from the key to the first change on the fighter
  - hit by 5 personas (adult-smash-veteran-05 x4, adult-smash-veteran-04 x3, older-slow-reaction-01 x1, teen-friends-ctf-02 x1); plausibly noticed by about 24 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 524300432 --arg persona=adult-smash-veteran-04 --arg fighter=Flower --arg stage=goiky --arg kind=ffa` (frame 2821); `node scripts/playtest.mjs --scene ffa --seed 102485283 --arg persona=adult-smash-veteran-05 --arg fighter=Flower --arg stage=skytower --arg kind=ffa` (frame 1860)
- **[FEEL] jank-input-latency** (JANK) x9 - Soap: atk took 7 frames (117 ms) from the key to the first change on the fighter
  - hit by 5 personas (menu-skipper-01 x4, lefty-remapper-01 x2, ctf-planner-04 x1, old-laptop-03 x1); plausibly noticed by about 24 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ctf --seed 89747701 --arg persona=ctf-planner-04 --arg fighter=Soap --arg map=oak --arg n=2` (frame 3074); `node scripts/playtest.mjs --scene 1v1 --seed 222510074 --arg persona=lefty-remapper-01 --arg fighter=Soap --arg stage=dreamisle --arg kind=1v1` (frame 364)
- **[FEEL] jank-input-latency** (JANK) x7 - Apple: atk took 7 frames (117 ms) from the key to the first change on the fighter
  - hit by 4 personas (adult-casual-low-patience-03 x3, adult-smash-veteran-01 x2, adult-smash-veteran-02 x1, ctf-planner-02 x1); plausibly noticed by about 24 of 80 (feel); severity FEEL
  - repro: `node scripts/playtest.mjs --scene ffa --seed 604214374 --arg persona=adult-casual-low-patience-03 --arg fighter=Apple --arg stage=yoyle --arg kind=ffa` (frame 792); `node scripts/playtest.mjs --scene 1v1 --seed 51517737 --arg persona=adult-smash-veteran-01 --arg fighter=Apple --arg stage=canyon --arg kind=1v1` (frame 5123)
- ... and 228 more root causes of this kind (all in the JSON files)
#### jank-esc-ignored: 15 root causes, 1113 occurrences
- **[FEEL] jank-esc-ignored** (JANK) x75 - Esc does nothing on screen "options" although it has a back/close button (a person presses Esc to go back)
  - hit by 15 personas (adult-reader-explorer-01 x5, adult-reader-explorer-02 x5, adult-reader-explorer-03 x5, adult-reader-explorer-04 x5); plausibly noticed by about 15 of 80 (menu); severity FEEL
  - repro: `node scripts/playtest.mjs --scene menus --seed 183679964 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene menus --seed 616683495 --arg persona=adult-reader-explorer-01`
- **[FEEL] jank-esc-ignored** (JANK) x75 - Esc does nothing on screen "controls" although it has a back/close button (a person presses Esc to go back)
  - hit by 15 personas (adult-reader-explorer-01 x5, adult-reader-explorer-02 x5, adult-reader-explorer-03 x5, adult-reader-explorer-04 x5); plausibly noticed by about 15 of 80 (menu); severity FEEL
  - repro: `node scripts/playtest.mjs --scene menus --seed 183679964 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene menus --seed 616683495 --arg persona=adult-reader-explorer-01`
- **[FEEL] jank-esc-ignored** (JANK) x63 - Esc does nothing on screen "stats" although it has a back/close button (a person presses Esc to go back)
  - hit by 15 personas (adult-reader-explorer-01 x5, adult-reader-explorer-02 x5, adult-reader-explorer-03 x5, adult-reader-explorer-04 x5); plausibly noticed by about 15 of 80 (menu); severity FEEL
  - repro: `node scripts/playtest.mjs --scene menus --seed 183679964 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene menus --seed 616683495 --arg persona=adult-reader-explorer-01`
- **[FEEL] jank-esc-ignored** (JANK) x75 - Esc does nothing on screen "learn" although it has a back/close button (a person presses Esc to go back)
  - hit by 15 personas (adult-reader-explorer-01 x5, adult-reader-explorer-02 x5, adult-reader-explorer-03 x5, adult-reader-explorer-04 x5); plausibly noticed by about 15 of 80 (menu); severity FEEL
  - repro: `node scripts/playtest.mjs --scene menus --seed 183679964 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene menus --seed 616683495 --arg persona=adult-reader-explorer-01`
- **[FEEL] jank-esc-ignored** (JANK) x75 - Esc does nothing on screen "tutorial" although it has a back/close button (a person presses Esc to go back)
  - hit by 15 personas (adult-reader-explorer-01 x5, adult-reader-explorer-02 x5, adult-reader-explorer-03 x5, adult-reader-explorer-04 x5); plausibly noticed by about 15 of 80 (menu); severity FEEL
  - repro: `node scripts/playtest.mjs --scene menus --seed 183679964 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene menus --seed 616683495 --arg persona=adult-reader-explorer-01`
- **[FEEL] jank-esc-ignored** (JANK) x75 - Esc does nothing on screen "test" although it has a back/close button (a person presses Esc to go back)
  - hit by 15 personas (adult-reader-explorer-01 x5, adult-reader-explorer-02 x5, adult-reader-explorer-03 x5, adult-reader-explorer-04 x5); plausibly noticed by about 15 of 80 (menu); severity FEEL
  - repro: `node scripts/playtest.mjs --scene menus --seed 183679964 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene menus --seed 616683495 --arg persona=adult-reader-explorer-01`
- **[FEEL] jank-esc-ignored** (JANK) x75 - Esc does nothing on screen "changelog" although it has a back/close button (a person presses Esc to go back)
  - hit by 15 personas (adult-reader-explorer-01 x5, adult-reader-explorer-02 x5, adult-reader-explorer-03 x5, adult-reader-explorer-04 x5); plausibly noticed by about 15 of 80 (menu); severity FEEL
  - repro: `node scripts/playtest.mjs --scene menus --seed 183679964 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene menus --seed 616683495 --arg persona=adult-reader-explorer-01`
- **[FEEL] jank-esc-ignored** (JANK) x75 - Esc does nothing on screen "vault" although it has a back/close button (a person presses Esc to go back)
  - hit by 15 personas (adult-reader-explorer-01 x5, adult-reader-explorer-02 x5, adult-reader-explorer-03 x5, adult-reader-explorer-04 x5); plausibly noticed by about 15 of 80 (menu); severity FEEL
  - repro: `node scripts/playtest.mjs --scene menus --seed 183679964 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene menus --seed 616683495 --arg persona=adult-reader-explorer-01`
- ... and 7 more root causes of this kind (all in the JSON files)
#### jank-flow: 1 root causes, 1 occurrences
- **[FEEL] jank-flow** (JANK) x1 - a walk key released while the game was paused: after resuming the fighter kept walking on its own (69 px, vx 0.9)
  - hit by 1 personas (adult-competitive-04 x1); plausibly noticed by about 16 of 80 (visible); severity FEEL
  - repro: `node scripts/playtest.mjs --scene flow --seed 242983219 --arg persona=adult-competitive-04 --arg fighter=MeTag` (frame 127)
#### jank-no-key-hint: 1 root causes, 4 occurrences
- **[FEEL] jank-no-key-hint** (JANK) x4 - a player who types WASD sees nothing happen and no on-screen hint during a match about which keys to use or where to change them
  - hit by 4 personas (wasd-habit-01 x1, wasd-habit-02 x1, wasd-habit-03 x1, wasd-habit-04 x1); plausibly noticed by about 4 of 80 (menu); severity FEEL
  - repro: `node scripts/playtest.mjs --scene wasdprobe --seed 397100809 --arg persona=wasd-habit-01` (frame 330); `node scripts/playtest.mjs --scene wasdprobe --seed 841853379 --arg persona=wasd-habit-02` (frame 330)
#### jank-tlc-ring-slack: 3 root causes, 501 occurrences
- **[FEEL] jank-tlc-ring-slack** (JANK) x258 - Firey Speaker Box THE TLC NEEDS TO BE FIXED!, phase 1: 198 of 258 landings (77%) put the fire ring closer to the nearest fighter than 15 frames of travel (median slack 6.3 frames; the landing is a median 62 px from the nearest fighter)
  - hit by 0 personas (run-wide statistic); plausibly noticed by about 4 of 80 (feel); severity FEEL
  - repro: (run-wide statistic: see the table in this report; the per-fighter repro is `node scripts/playtest.mjs --scene ffa --seed N --arg persona=<tag>` with a persona that plays that fighter)
- **[FEEL] jank-tlc-ring-slack** (JANK) x182 - Firey Speaker Box THE TLC NEEDS TO BE FIXED!, phase 2: 128 of 182 landings (70%) put the fire ring closer to the nearest fighter than 15 frames of travel (median slack 6 frames; the landing is a median 62 px from the nearest fighter)
  - hit by 0 personas (run-wide statistic); plausibly noticed by about 4 of 80 (feel); severity FEEL
  - repro: (run-wide statistic: see the table in this report; the per-fighter repro is `node scripts/playtest.mjs --scene ffa --seed N --arg persona=<tag>` with a persona that plays that fighter)
- **[FEEL] jank-tlc-ring-slack** (JANK) x61 - Firey Speaker Box THE TLC NEEDS TO BE FIXED!, phase 3: 39 of 61 landings (64%) put the fire ring closer to the nearest fighter than 15 frames of travel (median slack 9.8 frames; the landing is a median 99 px from the nearest fighter)
  - hit by 0 personas (run-wide statistic); plausibly noticed by about 4 of 80 (feel); severity FEEL
  - repro: (run-wide statistic: see the table in this report; the per-fighter repro is `node scripts/playtest.mjs --scene ffa --seed N --arg persona=<tag>` with a persona that plays that fighter)

### UI (135 root causes)
#### stray-banner: 101 root causes, 606 occurrences
- **[UI] stray-banner** x15 - a match shows "KO'd by Fanny − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
  - hit by 10 personas (lefty-remapper-01 x4, teen-speedrunner-02 x2, wasd-habit-02 x2, adult-casual-low-patience-03 x1); plausibly noticed by about 72 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene flow --seed 915855723 --arg persona=adult-casual-low-patience-03 --arg fighter=Coiny` (frame 272); `node scripts/playtest.mjs --scene 1v1 --seed 179209923 --arg persona=adult-smash-veteran-02 --arg fighter=Loser --arg stage=fortress --arg kind=1v1` (frame 8780)
- **[UI] stray-banner** x10 - a match shows "KO'd by Profily − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
  - hit by 9 personas (adult-smash-veteran-01 x2, adult-casual-low-patience-01 x1, adult-casual-low-patience-03 x1, adult-casual-low-patience-04 x1); plausibly noticed by about 72 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene ffa --seed 31456317 --arg persona=adult-casual-low-patience-01 --arg fighter=MeTag --arg stage=grandplains --arg kind=ffa` (frame 990); `node scripts/playtest.mjs --scene ffa --seed 222655058 --arg persona=adult-casual-low-patience-03 --arg fighter=Teardrop --arg stage=needle --arg kind=ffa` (frame 1010)
- **[UI] stray-banner** x14 - a match shows "KO'd by Naily − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
  - hit by 9 personas (adult-smash-veteran-01 x3, adult-competitive-01 x2, adult-smash-veteran-05 x2, wasd-habit-01 x2); plausibly noticed by about 72 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene flow --seed 275709908 --arg persona=adult-competitive-01 --arg fighter=Teardrop` (frame 70); `node scripts/playtest.mjs --scene flow --seed 404295635 --arg persona=adult-smash-veteran-01 --arg fighter=Silver Spoon` (frame 70)
- **[UI] stray-banner** x10 - a match shows "KO'd by Balloony − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
  - hit by 9 personas (menu-skipper-03 x2, adult-competitive-04 x1, adult-parent-first-time-01 x1, adult-smash-veteran-03 x1); plausibly noticed by about 72 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene teams --seed 969824341 --arg persona=adult-competitive-04 --arg fighter=Yin-Yang --arg stage=pillars --arg kind=teams` (frame 6520); `node scripts/playtest.mjs --scene ffa --seed 859104719 --arg persona=adult-parent-first-time-01 --arg fighter=Microphone --arg stage=incin --arg kind=ffa` (frame 1570)
- **[UI] stray-banner** x11 - a match shows "KO'd by Paintbrush − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
  - hit by 8 personas (adult-casual-low-patience-03 x2, adult-smash-veteran-05 x2, kid-bfdi-fan-02 x2, adult-competitive-02 x1); plausibly noticed by about 72 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene ffa --seed 503644017 --arg persona=adult-casual-low-patience-03 --arg fighter=Rose --arg stage=forest --arg kind=ffa` (frame 2870); `node scripts/playtest.mjs --scene flow --seed 423724048 --arg persona=adult-competitive-02 --arg fighter=Barf Bag` (frame 232)
- **[UI] stray-banner** x13 - a match shows "KO'd by Cheesy − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
  - hit by 8 personas (adult-smash-veteran-01 x3, adult-smash-veteran-02 x2, lefty-remapper-02 x2, teen-speedrunner-03 x2); plausibly noticed by about 72 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene ffa --seed 406685228 --arg persona=adult-parent-first-time-02 --arg fighter=Pencil --arg stage=grandplains --arg kind=ffa` (frame 8320); `node scripts/playtest.mjs --scene flow --seed 413685590 --arg persona=adult-smash-veteran-01 --arg fighter=David` (frame 100)
- **[UI] stray-banner** x12 - a match shows "KO'd by Tennis Ball − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
  - hit by 7 personas (kid-bfdi-fan-01 x4, adult-casual-low-patience-01 x2, older-slow-reaction-01 x2, adult-casual-low-patience-02 x1); plausibly noticed by about 72 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene flow --seed 768567990 --arg persona=adult-casual-low-patience-01 --arg fighter=Pen` (frame 100); `node scripts/playtest.mjs --scene ffa --seed 417349808 --arg persona=adult-casual-low-patience-02 --arg fighter=Loser --arg stage=incin --arg kind=ffa` (frame 1240)
- **[UI] stray-banner** x10 - a match shows "KO'd by Ruler − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
  - hit by 7 personas (adult-casual-low-patience-02 x2, adult-casual-low-patience-04 x2, lefty-remapper-03 x2, adult-competitive-03 x1); plausibly noticed by about 72 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene flow --seed 422779853 --arg persona=adult-casual-low-patience-02 --arg fighter=Blocky` (frame 70); `node scripts/playtest.mjs --scene ffa --seed 382231221 --arg persona=adult-casual-low-patience-04 --arg fighter=Knife --arg stage=yoyle --arg kind=ffa` (frame 4880)
- ... and 93 more root causes of this kind (all in the JSON files)
#### phone-wording: 5 root causes, 766 occurrences
- **[UI] phone-wording** x150 - screen "tutorial" says "Tap" in: "Tap Z while moving to sprint; hold Z to shield (blocks hits, not grabs" (a computer game: no phone or touch wording)
  - hit by 22 personas (adult-reader-explorer-01 x10, adult-reader-explorer-02 x10, adult-reader-explorer-03 x10, adult-reader-explorer-04 x10); plausibly noticed by about 22 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene tutorial --seed 34449409 --arg persona=adult-parent-first-time-01`; `node scripts/playtest.mjs --scene tutorial --seed 194978836 --arg persona=adult-parent-first-time-01`
- **[UI] phone-wording** x150 - screen "tutorial" says "tap" in: "hold a direction as the hit lands to bend your launch a little (DI); t" (a computer game: no phone or touch wording)
  - hit by 22 personas (adult-reader-explorer-01 x10, adult-reader-explorer-02 x10, adult-reader-explorer-03 x10, adult-reader-explorer-04 x10); plausibly noticed by about 22 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene tutorial --seed 34449409 --arg persona=adult-parent-first-time-01`; `node scripts/playtest.mjs --scene tutorial --seed 194978836 --arg persona=adult-parent-first-time-01`
- **[UI] phone-wording** x116 - screen "changelog" says "Tap" in: "New: SPRINT. Tap Z while you are running on the ground to sprint at 1." (a computer game: no phone or touch wording)
  - hit by 15 personas (menu-skipper-01 x10, menu-skipper-03 x9, teen-collector-02 x9, teen-collector-04 x9); plausibly noticed by about 15 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene menus --seed 183679964 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene menus --seed 616683495 --arg persona=adult-reader-explorer-01`
- **[UI] phone-wording** x175 - screen "controls" says "tap" in: "Sprint (tap while moving) / Shield (hold; the strong fighters get a Re" (a computer game: no phone or touch wording)
  - hit by 15 personas (menu-skipper-03 x19, menu-skipper-01 x16, menu-skipper-02 x15, kid-masher-01 x12); plausibly noticed by about 15 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene menus --seed 183679964 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene menus --seed 616683495 --arg persona=adult-reader-explorer-01`
- **[UI] phone-wording** x175 - screen "controls" says "tap" in: "Move · Jump (a quick press is a short hop; Down in the air fast-falls;" (a computer game: no phone or touch wording)
  - hit by 15 personas (menu-skipper-03 x19, menu-skipper-01 x16, menu-skipper-02 x15, kid-masher-01 x12); plausibly noticed by about 15 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene menus --seed 183679964 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene menus --seed 616683495 --arg persona=adult-reader-explorer-01`
#### jank-dead-button: 6 root causes, 77 occurrences
- **[UI] jank-dead-button** (JANK) x24 - on screen "title" the button "📣 Share the game" changed nothing visible on two clicks
  - hit by 12 personas (menu-skipper-03 x5, teen-collector-04 x3, adult-reader-explorer-02 x2, kid-masher-01 x2); plausibly noticed by about 15 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene menus --seed 665184461 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene menus --seed 962758730 --arg persona=adult-reader-explorer-02`
- **[UI] jank-dead-button** (JANK) x12 - on screen "options" the button "🔊 Sound: On" changed nothing visible on two clicks
  - hit by 10 personas (menu-skipper-01 x2, menu-skipper-03 x2, adult-reader-explorer-04 x1, kid-masher-01 x1); plausibly noticed by about 15 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene menus --seed 238275155 --arg persona=adult-reader-explorer-04`; `node scripts/playtest.mjs --scene menus --seed 314529130 --arg persona=kid-masher-01`
- **[UI] jank-dead-button** (JANK) x10 - on screen "editor" the button "Clear" changed nothing visible on two clicks
  - hit by 8 personas (menu-skipper-03 x3, adult-reader-explorer-01 x1, adult-reader-explorer-03 x1, kid-masher-02 x1); plausibly noticed by about 15 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene menus --seed 665184461 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene menus --seed 543943111 --arg persona=adult-reader-explorer-03` (frame 150)
- **[UI] jank-dead-button** (JANK) x15 - on screen "stats" the button "🗑 Reset my stats" changed nothing visible on two clicks
  - hit by 6 personas (menu-skipper-03 x4, kid-masher-01 x3, kid-masher-03 x3, menu-skipper-01 x3); plausibly noticed by about 15 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene menus --seed 874690935 --arg persona=kid-masher-01`; `node scripts/playtest.mjs --scene menus --seed 314529130 --arg persona=kid-masher-01`
- **[UI] jank-dead-button** (JANK) x6 - on screen "stats" the button "📋 Copy my stats" changed nothing visible on two clicks
  - hit by 5 personas (menu-skipper-02 x2, kid-masher-01 x1, menu-skipper-01 x1, menu-skipper-03 x1); plausibly noticed by about 15 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene menus --seed 393641610 --arg persona=kid-masher-01`; `node scripts/playtest.mjs --scene menus --seed 492869907 --arg persona=menu-skipper-01`
- **[UI] jank-dead-button** (JANK) x10 - on screen "controls" the button "Load file…" changed nothing visible on two clicks
  - hit by 3 personas (menu-skipper-03 x5, menu-skipper-02 x4, menu-skipper-01 x1); plausibly noticed by about 15 of 80 (menu); severity UI
  - repro: `node scripts/playtest.mjs --scene menus --seed 492869907 --arg persona=menu-skipper-01`; `node scripts/playtest.mjs --scene menus --seed 79920174 --arg persona=menu-skipper-02`
#### jank-slow-path: 8 root causes, 175 occurrences
- **[UI] jank-slow-path** (JANK) x55 - ffa: about 93 s of a person's clicking and reading from the title to a running match (limit 60 s)
  - hit by 11 personas (adult-parent-first-time-02 x5, adult-parent-first-time-03 x5, adult-parent-first-time-04 x5, adult-reader-explorer-01 x5); plausibly noticed by about 11 of 80 (feel); severity UI
  - repro: `node scripts/playtest.mjs --scene journey --seed 770380673 --arg persona=adult-parent-first-time-02`; `node scripts/playtest.mjs --scene journey --seed 167700542 --arg persona=adult-parent-first-time-02`
- **[UI] jank-slow-path** (JANK) x50 - worldcup: about 88 s of a person's clicking and reading from the title to a running match (limit 60 s)
  - hit by 10 personas (adult-parent-first-time-02 x5, adult-parent-first-time-03 x5, adult-parent-first-time-04 x5, adult-reader-explorer-01 x5); plausibly noticed by about 10 of 80 (feel); severity UI
  - repro: `node scripts/playtest.mjs --scene journey --seed 770380673 --arg persona=adult-parent-first-time-02`; `node scripts/playtest.mjs --scene journey --seed 167700542 --arg persona=adult-parent-first-time-02`
- **[UI] jank-slow-path** (JANK) x25 - tutorial: about 63 s of a person's clicking and reading from the title to a running match (limit 60 s)
  - hit by 5 personas (adult-parent-first-time-02 x5, adult-parent-first-time-03 x5, adult-reader-explorer-01 x5, adult-reader-explorer-02 x5); plausibly noticed by about 5 of 80 (feel); severity UI
  - repro: `node scripts/playtest.mjs --scene journey --seed 770380673 --arg persona=adult-parent-first-time-02`; `node scripts/playtest.mjs --scene journey --seed 167700542 --arg persona=adult-parent-first-time-02`
- **[UI] jank-slow-path** (JANK) x25 - flagcup: about 65 s of a person's clicking and reading from the title to a running match (limit 60 s)
  - hit by 5 personas (adult-parent-first-time-02 x5, adult-parent-first-time-03 x5, adult-reader-explorer-01 x5, adult-reader-explorer-02 x5); plausibly noticed by about 5 of 80 (feel); severity UI
  - repro: `node scripts/playtest.mjs --scene journey --seed 770380673 --arg persona=adult-parent-first-time-02`; `node scripts/playtest.mjs --scene journey --seed 167700542 --arg persona=adult-parent-first-time-02`
- **[UI] jank-slow-path** (JANK) x5 - 1v1: about 65 s of a person's clicking and reading from the title to a running match (limit 60 s)
  - hit by 1 personas (adult-reader-explorer-01 x5); plausibly noticed by about 3 of 80 (feel); severity UI
  - repro: `node scripts/playtest.mjs --scene journey --seed 140611760 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene journey --seed 783047765 --arg persona=adult-reader-explorer-01`
- **[UI] jank-slow-path** (JANK) x5 - teams: about 65 s of a person's clicking and reading from the title to a running match (limit 60 s)
  - hit by 1 personas (adult-reader-explorer-01 x5); plausibly noticed by about 3 of 80 (feel); severity UI
  - repro: `node scripts/playtest.mjs --scene journey --seed 140611760 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene journey --seed 783047765 --arg persona=adult-reader-explorer-01`
- **[UI] jank-slow-path** (JANK) x5 - boss: about 65 s of a person's clicking and reading from the title to a running match (limit 60 s)
  - hit by 1 personas (adult-reader-explorer-01 x5); plausibly noticed by about 3 of 80 (feel); severity UI
  - repro: `node scripts/playtest.mjs --scene journey --seed 140611760 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene journey --seed 783047765 --arg persona=adult-reader-explorer-01`
- **[UI] jank-slow-path** (JANK) x5 - ctf: about 65 s of a person's clicking and reading from the title to a running match (limit 60 s)
  - hit by 1 personas (adult-reader-explorer-01 x5); plausibly noticed by about 3 of 80 (feel); severity UI
  - repro: `node scripts/playtest.mjs --scene journey --seed 140611760 --arg persona=adult-reader-explorer-01`; `node scripts/playtest.mjs --scene journey --seed 783047765 --arg persona=adult-reader-explorer-01`
#### jank-text-overlap: 10 root causes, 118 occurrences
- **[UI] jank-text-overlap** (JANK) x44 - HUD text overlaps: "-N | Roles" (estimated boxes, ctf on ctf-sky)
  - hit by 9 personas (ctf-planner-03 x8, ctf-planner-01 x7, ctf-planner-04 x6, ctf-planner-02 x5); plausibly noticed by about 9 of 80 (visible); severity UI
  - repro: `node scripts/playtest.mjs --scene ctf --seed 944874132 --arg persona=ctf-planner-01 --arg fighter=Silver Spoon --arg map=sky --arg n=4` (frame 9796); `node scripts/playtest.mjs --scene ctf --seed 132747486 --arg persona=ctf-planner-01 --arg fighter=Pencil --arg map=oak --arg n=2` (frame 10584)
- **[UI] jank-text-overlap** (JANK) x10 - HUD text overlaps: "+N | Roles" (estimated boxes, ctf on ctf-oak)
  - hit by 4 personas (ctf-planner-04 x4, ctf-planner-01 x3, ctf-planner-03 x2, teen-friends-ctf-03 x1); plausibly noticed by about 9 of 80 (visible); severity UI
  - repro: `node scripts/playtest.mjs --scene ctf --seed 917258093 --arg persona=ctf-planner-01 --arg fighter=Liy --arg map=oak --arg n=2` (frame 10052); `node scripts/playtest.mjs --scene ctf --seed 269379237 --arg persona=ctf-planner-01 --arg fighter=Remote --arg map=sky --arg n=4` (frame 9796)
- **[UI] jank-text-overlap** (JANK) x13 - HUD text overlaps: "Front high front high | Front high front high N" (estimated boxes, ctf on ctf-sky)
  - hit by 3 personas (ctf-planner-01 x5, ctf-planner-04 x5, teen-friends-ctf-03 x3); plausibly noticed by about 9 of 80 (visible); severity UI
  - repro: `node scripts/playtest.mjs --scene ctf --seed 944874132 --arg persona=ctf-planner-01 --arg fighter=Silver Spoon --arg map=sky --arg n=4` (frame 9796); `node scripts/playtest.mjs --scene ctf --seed 771983171 --arg persona=ctf-planner-01 --arg fighter=Match --arg map=sky --arg n=4` (frame 9796)
- **[UI] jank-text-overlap** (JANK) x13 - HUD text overlaps: "Front high front high N | Yard high yard high N" (estimated boxes, ctf on ctf-sky)
  - hit by 3 personas (ctf-planner-01 x5, ctf-planner-04 x5, teen-friends-ctf-03 x3); plausibly noticed by about 9 of 80 (visible); severity UI
  - repro: `node scripts/playtest.mjs --scene ctf --seed 944874132 --arg persona=ctf-planner-01 --arg fighter=Silver Spoon --arg map=sky --arg n=4` (frame 9796); `node scripts/playtest.mjs --scene ctf --seed 771983171 --arg persona=ctf-planner-01 --arg fighter=Match --arg map=sky --arg n=4` (frame 9796)
- **[UI] jank-text-overlap** (JANK) x11 - HUD text overlaps: "Home high home high N | Rear high rear high N" (estimated boxes, ctf on ctf-factory)
  - hit by 3 personas (ctf-planner-03 x5, teen-friends-ctf-02 x3, teen-friends-ctf-05 x3); plausibly noticed by about 9 of 80 (visible); severity UI
  - repro: `node scripts/playtest.mjs --scene ctf --seed 778231012 --arg persona=ctf-planner-03 --arg fighter=Teddy Bear --arg map=factory --arg n=2` (frame 9796); `node scripts/playtest.mjs --scene ctf --seed 716617534 --arg persona=ctf-planner-03 --arg fighter=Liy --arg map=factory --arg n=2` (frame 10197)
- **[UI] jank-text-overlap** (JANK) x9 - HUD text overlaps: "Home high home high N | Yard high yard high N" (estimated boxes, ctf on ctf-forest)
  - hit by 3 personas (ctf-planner-03 x5, teen-friends-ctf-02 x2, teen-friends-ctf-05 x2); plausibly noticed by about 9 of 80 (visible); severity UI
  - repro: `node scripts/playtest.mjs --scene ctf --seed 632956090 --arg persona=ctf-planner-03 --arg fighter=Blocky --arg map=forest --arg n=3` (frame 9796); `node scripts/playtest.mjs --scene ctf --seed 557436262 --arg persona=ctf-planner-03 --arg fighter=Tea Kettle --arg map=forest --arg n=3` (frame 11241)
- **[UI] jank-text-overlap** (JANK) x7 - HUD text overlaps: "+N | Yard high yard high N" (estimated boxes, ctf on ctf-forest)
  - hit by 3 personas (ctf-planner-03 x3, teen-friends-ctf-02 x2, teen-friends-ctf-05 x2); plausibly noticed by about 9 of 80 (visible); severity UI
  - repro: `node scripts/playtest.mjs --scene ctf --seed 557436262 --arg persona=ctf-planner-03 --arg fighter=Tea Kettle --arg map=forest --arg n=3` (frame 11241); `node scripts/playtest.mjs --scene ctf --seed 22249599 --arg persona=ctf-planner-03 --arg fighter=Bonesaw --arg map=forest --arg n=3` (frame 10168)
- **[UI] jank-text-overlap** (JANK) x7 - HUD text overlaps: "+N | Home high home high N" (estimated boxes, ctf on ctf-forest)
  - hit by 3 personas (ctf-planner-03 x3, teen-friends-ctf-02 x2, teen-friends-ctf-05 x2); plausibly noticed by about 9 of 80 (visible); severity UI
  - repro: `node scripts/playtest.mjs --scene ctf --seed 557436262 --arg persona=ctf-planner-03 --arg fighter=Tea Kettle --arg map=forest --arg n=3` (frame 11241); `node scripts/playtest.mjs --scene ctf --seed 22249599 --arg persona=ctf-planner-03 --arg fighter=Bonesaw --arg map=forest --arg n=3` (frame 10168)
- ... and 2 more root causes of this kind (all in the JSON files)
#### jank-text-offscreen: 5 root causes, 9 occurrences
- **[UI] jank-text-offscreen** (JANK) x4 - HUD text runs off the canvas edge: "Lift rear (your side: the teammate guard" (estimated width, ctf on ctf-sky)
  - hit by 4 personas (ctf-planner-01 x1, ctf-planner-02 x1, ctf-planner-04 x1, teen-friends-ctf-04 x1); plausibly noticed by about 9 of 80 (visible); severity UI
  - repro: `node scripts/playtest.mjs --scene ctf --seed 269379237 --arg persona=ctf-planner-01 --arg fighter=Remote --arg map=sky --arg n=4` (frame 9796); `node scripts/playtest.mjs --scene ctf --seed 527713924 --arg persona=ctf-planner-02 --arg fighter=Ruby --arg map=mines --arg n=4` (frame 9796)
- **[UI] jank-text-offscreen** (JANK) x2 - HUD text runs off the canvas edge: "Jail rear low (your side: the teammate g" (estimated width, ctf on ctf-oak)
  - hit by 1 personas (ctf-planner-01 x2); plausibly noticed by about 9 of 80 (visible); severity UI
  - repro: `node scripts/playtest.mjs --scene ctf --seed 917258093 --arg persona=ctf-planner-01 --arg fighter=Liy --arg map=oak --arg n=2` (frame 10052); `node scripts/playtest.mjs --scene ctf --seed 260973126 --arg persona=ctf-planner-01 --arg fighter=Remote --arg map=oak --arg n=2` (frame 11164)
- **[UI] jank-text-offscreen** (JANK) x1 - HUD text runs off the canvas edge: "Jail rear (your side: the teammate guard" (estimated width, ctf on ctf-oak)
  - hit by 1 personas (ctf-planner-04 x1); plausibly noticed by about 9 of 80 (visible); severity UI
  - repro: `node scripts/playtest.mjs --scene ctf --seed 89747701 --arg persona=ctf-planner-04 --arg fighter=Soap --arg map=oak --arg n=2` (frame 9806)
- **[UI] jank-text-offscreen** (JANK) x1 - HUD text runs off the canvas edge: "Doors rear (your side: the teammate guar" (estimated width, ctf on ctf-sky)
  - hit by 1 personas (ctf-planner-04 x1); plausibly noticed by about 9 of 80 (visible); severity UI
  - repro: `node scripts/playtest.mjs --scene ctf --seed 185837939 --arg persona=ctf-planner-04 --arg fighter=Tennis Ball --arg map=sky --arg n=4` (frame 9796)
- **[UI] jank-text-offscreen** (JANK) x1 - HUD text runs off the canvas edge: "Rear low (your side: the teammate guards" (estimated width, ctf on ctf-factory)
  - hit by 1 personas (teen-friends-ctf-05 x1); plausibly noticed by about 9 of 80 (visible); severity UI
  - repro: `node scripts/playtest.mjs --scene ctf --seed 969464259 --arg persona=teen-friends-ctf-05 --arg fighter=Bonesaw --arg map=factory --arg n=2` (frame 9796)

## Input latency (key press -> first change on the fighter, in frames after the step that saw the key)
| action | samples | mean | max | outliers (>= 4) | never answered |
|---|---|---|---|---|---|
| jump | 20455 | 0.04 | 14 | 27 | 22 |
| atk | 25856 | 0.26 | 14 | 662 | 0 |
| grab | 1881 | 0.07 | 14 | 11 | 0 |
| special | 14011 | 0.06 | 14 | 69 | 0 |
| smash | 5150 | 0.52 | 14 | 277 | 0 |
| fin | 1719 | 0.03 | 14 | 2 | 0 |

## Early presses (within 6 frames of the last move ending): buffered or eaten
All fighters: buffered 1863, held through 1457, held and never fired 45, eaten 48 (eaten share 3% of buffered+eaten).
Fighters with the highest eaten share (>= 8 samples): Paintbrush 4/26, Cammy 1/9, Paper 3/27, Tea Kettle 2/19, Trophy 2/19, Yin-Yang 1/11, Naily 1/12, Gaty 1/14, Sidewalky 3/43, Bomb 2/30

## Boss Rush: warning between the start of a boss attack's telegraph and the hit on the player
| boss / move | hits on the player | median warning (frames) | 10th pct | under 18 frames | under that persona's own reaction time |
|---|---|---|---|---|---|
| Evil Leafy / evilleafy | 96 | 128 | 33 | 8 (8%) | 7 |
| Purple Face / swallow | 15 | 265 | 21 | 1 (7%) | 0 |
| MePhone4S / s4popup | 31 | 101 | 29 | 2 (6%) | 1 |
| Four / fourtower | 16 | 86 | 70 | 1 (6%) | 1 |
| MePhone4S / s4vista | 39 | 85 | 28 | 2 (5%) | 0 |
| MePhone4S / mephone4s | 21 | 46 | 31 | 1 (5%) | 1 |
| MePhone4S / s4shove | 89 | 66 | 31 | 4 (4%) | 3 |
| MePhone4S / s4car | 113 | 187 | 83 | 5 (4%) | 5 |
| Purple Face / pfaceTorture | 54 | 60 | 54 | 2 (4%) | 2 |
| MePhone4S / s4prizes | 57 | 81 | 37 | 2 (4%) | 2 |
| Puffball Speaker Box / rainbowbarf | 66 | 56 | 34 | 2 (3%) | 2 |
| Firey Speaker Box / youmust | 67 | 66 | 45 | 2 (3%) | 2 |
| Evil Leafy / elhole | 141 | 162 | 85 | 4 (3%) | 4 |
| Firey Speaker Box / furnace | 62 | 125 | 64 | 1 (2%) | 1 |
| Puffball Speaker Box / consequences | 67 | 129 | 65 | 1 (1%) | 1 |
| Purple Dragon / dragonwind | 72 | 161 | 134 | 1 (1%) | 1 |
| Firey Speaker Box / tlc | 148 | 166 | 78 | 2 (1%) | 2 |
| Puffball Speaker Box / private | 104 | 129 | 46 | 1 (1%) | 1 |
| Puffball Speaker Box / soundwave | 118 | 80 | 42 | 1 (1%) | 2 |
| Purple Dragon / dragonroar | 51 | 116 | 107 | 0 (0%) | 0 |
| Purple Dragon / dragon | 22 | 93 | 76 | 0 (0%) | 0 |
| Purple Dragon / dragonropes | 25 | 84 | 60 | 0 (0%) | 0 |
| Purple Dragon / dragonchar | 23 | 109 | 66 | 0 (0%) | 0 |
| Two / twoblocks | 59 | 104 | 86 | 0 (0%) | 0 |
| Two / twopower | 16 | 75 | 57 | 0 (0%) | 0 |
| Two / two | 27 | 75 | 68 | 0 (0%) | 0 |
| Two / twoclap | 18 | 160 | 65 | 0 (0%) | 0 |
| Two / twosun | 25 | 96 | 71 | 0 (0%) | 0 |
| Two / tworails | 28 | 224 | 123 | 0 (0%) | 0 |
| Springy / boxdrop | 44 | 269 | 62 | 0 (0%) | 0 |
| Springy / longarm | 59 | 80 | 50 | 0 (0%) | 0 |
| Springy / springy | 120 | 366 | 151 | 0 (0%) | 0 |
| Purple Face / pfaceRap | 30 | 110 | 72 | 0 (0%) | 0 |
| Purple Face / pfaceThanks | 63 | 47 | 39 | 0 (0%) | 0 |
| MePhone4 / maze | 105 | 112 | 88 | 0 (0%) | 0 |
| MePhone4 / mephone | 107 | 66 | 43 | 0 (0%) | 0 |
| MePhone4 / boomerang | 65 | 69 | 40 | 0 (0%) | 0 |
| MePhone4 / portal | 50 | 37 | 37 | 0 (0%) | 0 |
| Evil Leafy / elpossess | 84 | 263 | 117 | 0 (0%) | 0 |
| Evil Leafy / elbehind | 78 | 123 | 65 | 0 (0%) | 0 |
(A hit late in a multi-hit chain, e.g. the TLC hops, has a long warning measured from the first telegraph; the TLC table below measures per landing.)

## Firey Speaker Box, THE TLC NEEDS TO BE FIXED! (fire-ring landings)
The owner says he tracks you and fires with next to no delay. Per landing: how far the nearest fighter is, and the slack = frames the ring needs to reach a fighter standing still at that distance.
| phase | landings | median distance to nearest fighter (px) | landed on top (< 140 px) | median ring slack (frames) | slack under 15 | median hop length (frames) |
|---|---|---|---|---|---|---|
| 1 | 258 | 62 | 207 (80%) | 6.3 | 198 (77%) | 30 |
| 2 | 182 | 62 | 133 (73%) | 6 | 128 (70%) | 28 |
| 3 | 61 | 99 | 40 (66%) | 9.8 | 39 (64%) | 26 |
Hits on a player by the TLC move: 148; median warning from the first telegraph 166 frames.

## Journeys: title -> a running match with default choices (clicks + keys, a person's seconds)
| mode | runs | reached | median clicks | median keys | median seconds | max seconds |
|---|---|---|---|---|---|---|
| ffa | 110 | 110 | 4 | 0 | 62.6 | 126.1 |
| 1v1 | 110 | 110 | 4 | 0 | 33.2 | 65 |
| teams | 110 | 110 | 4 | 0 | 33.2 | 65 |
| boss | 110 | 110 | 4 | 0 | 33.2 | 65 |
| ctf | 110 | 110 | 4 | 0 | 33.2 | 65 |
| training | 110 | 110 | 3 | 0 | 23.4 | 45.7 |
| tutorial | 110 | 110 | 3 | 0 | 42.1 | 84.6 |
| worldcup | 110 | 110 | 6 | 0 | 59.3 | 118.8 |
| flagcup | 110 | 110 | 4 | 0 | 43.9 | 88.2 |

## Flow checks (pause, Esc, quit and return, result screen, Rematch)
- pause-opening: ok 80, not ok 0
- esc-spam: ok 80, not ok 0
- resume-click: ok 80, not ok 0
- pick-kept: ok 80, not ok 0
- result-reached: ok 0, not ok 43 - no result screen within 2 min of an idle player
- stuck-key-after-pause: ok 24, not ok 1 - a walk key released while the game was paused: after resuming the fighter kept walking on its own (69 px, vx 0.9)
- result-next: ok 37, not ok 0
- result-esc: ok 37, not ok 0
- rematch-settings: ok 37, not ok 0
- wasd-unbound: ok 0, not ok 4

## Esc on each screen (does it leave?)
- options: Esc left 0 of 75
- controls: Esc left 0 of 75
- stats: Esc left 0 of 63
- learn: Esc left 0 of 75
- tutorial: Esc left 0 of 75
- test: Esc left 0 of 75
- changelog: Esc left 0 of 75
- vault: Esc left 0 of 75
- quests: Esc left 0 of 75
- store: Esc left 0 of 75
- wardrobe: Esc left 0 of 75
- tourneySetup: Esc left 0 of 75
- ctfCupSetup: Esc left 75 of 75
- ctfCupTeams: Esc left 75 of 75
- lobby: Esc left 0 of 75
- editor: Esc left 0 of 75
- select: Esc left 0 of 75

## HUD text overlap (estimated boxes; canvas text drawn at the identity transform)
"-N | Roles" x352; "+N | Roles" x80; "Front high front high | Front high front high N" x13; "Front high front high N | Yard high yard high N" x13; "Home high home high N | Rear high rear high N" x11; "Home high home high N | Yard high yard high N" x9; "+N | Yard high yard high N" x7; "+N | Home high home high N" x7; "-N | Yard high yard high N" x2; "-N | Home high home high N" x2

## Frame time by phase (headless wall time; compare phases, not absolutes; shards ran 8 at a time)
- ctf:fix: 100250 frames, avg 19.35 ms, median of p99s 58.82, worst 2418 ms, over 16 ms 43473, over 50 ms 4805
- ctf:play: 750887 frames, avg 6.89 ms, median of p99s 45.15, worst 1745 ms, over 16 ms 66282, over 50 ms 15167
- ctf:hide: 304640 frames, avg 8.80 ms, median of p99s 43.49, worst 1094 ms, over 16 ms 43811, over 50 ms 6616
- teams:play: 1527777 frames, avg 2.76 ms, median of p99s 26.31, worst 935 ms, over 16 ms 47289, over 50 ms 6357
- ffa:play: 3729060 frames, avg 1.37 ms, median of p99s 16.92, worst 864 ms, over 16 ms 47031, over 50 ms 6425
- boss:play: 1191939 frames, avg 1.00 ms, median of p99s 11.31, worst 468 ms, over 16 ms 10185, over 50 ms 1336
- ctf:bid: 1674 frames, avg 3.13 ms, median of p99s 24.51, worst 236 ms, over 16 ms 61, over 50 ms 15
- ctf:-: 41 frames, avg 24.68 ms, median of p99s 14.18, worst 196 ms, over 16 ms 19, over 50 ms 3
- menu clicks: 40251 clicks, median of medians 7.1 ms, worst 10240 ms

