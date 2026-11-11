# The simulated playtester (`scripts/playtest.mjs`)

A headless PLAYER, not a CPU. It boots `artifacts/V1/index.html` in the jsdom harness (`scripts/helpers/load-monolith.js`) and plays
it through the real inputs: `KeyboardEvent`s on the page body (so the game's own keydown handlers fill `down[]`, with the keyboard's
auto-repeat for held keys) and clicks on the real menu buttons. It sets game state directly only to START a scene (a Boss Rush boss
number, the RUNNING! race, which has no door of its own). Computer only: nothing touch, nothing same-computer two-player.

## Run it

```
node scripts/playtest.mjs                      # a session: --minutes CPU minutes (default 12), a rotating seeded sample of scenes
node scripts/playtest.mjs --seed 7             # the same session again (Boss Rush aside: see below)
node scripts/playtest.mjs --only ctf,flagcup   # only these scenes (shards: run up to 3 processes with different --only lists)
node scripts/playtest.mjs --scene ffa --seed 99 [--arg fighter=Bomb --arg stage=canyon]   # ONE scene: how every finding is reproduced
node scripts/playtest.mjs --list               # the scenes
```

Flags: `--minutes N` (CPU time, with a wall limit of 4x; with `--scene` it caps that one scene too, which otherwise runs to its end),
`--wall-minutes N`, `--match-minutes N` (game-time cap of one match, default 3), `--out DIR` (default `playtest-out/`), `-v` (print
findings as they happen), `--no-idle`, `--force`. After each scene's line, a match scene prints a summary: the player's damage (and
on bosses), the player's KOs (where, at what %, and who hit last or `fell`), finishers fired/landed/damage, and the CTF phases.
A KO by an owner the game marks `idx -2` reads `a boss` only in Boss Rush (or with a boss on the field); elsewhere it is an assist
trophy or a hazard (`an assist/hazard`). `--arg stage=X` for a stage this fresh profile cannot pick (a secret stage still locked,
such as the Moon) plays the select screen's stage instead: the summary prints a NOTE, the repro line names the stage played, and the
report lists it under `stage-arg-ignored`.

It asks for Idle priority itself (`os.setPriority`). On a laptop it reads the battery: on battery under 40% it caps the session to
1 minute; on battery under 60% to 3 (`--force` overrides). Ctrl+C writes a partial report and exits; the report is also rewritten
after every scene.

Output: `playtest-out/<timestamp>-s<seed>.json` (everything) and `.md` (grouped BUG / STUCK / SLOW / FEEL / UI with counts and a
repro command each). `playtest-out/coverage.json` remembers which fighters, CTF maps and bosses have been played, so the next
session picks the least-played ones first.

## Scenes

`ffa`, `1v1`, `teams` (random stage, random least-played fighter, a persona), `ctf` (a map by coverage: hiding and placing a
flag, the planning menu on every tab, building in the free camera, then play), `ctf-spectate`, `flagcup` (Flag Cup, watch one
fixture, S to skip), `ctf-practice` (the Capture the Flag practice, played the way its cards ask: Enter on the reading cards,
"done hiding" only at its own step; a card it cannot finish in 45 s is a "can't" moment), `boss` (Boss Rush, a boss by coverage),
`worldcup` (a fixture you play), `training`, `tutorial` (follows the card's nine steps with the keys it names), `running` (RUNNING!),
and `menus` (the EXPLORER: every button of every screen, Esc everywhere, every fighter's card, the settings toggles, the key remap,
the pause card and its move list).

The `ctf` and `flagcup` scenes come as a player who has finished the practice: they write the game's own done key (`CTUT_DONE_KEY`,
`bfsi:ctfTutorialDone`) before the menus, the way a returning player has it. Without it the game runs the practice first, which
waits for its own keys, so the hiding phase never ended.

Personas: `new` (slow, mashes, walks off ledges), `tryhard` (spaces, uses every move, recovers), `explorer` (wanders, presses every key).

The floor the player sees is the game's own: on a stage with real edges (`stage.edges`, built into `FLOOR_SEGS` for that match) the
main floor is those spans, with cliffs and pits between and beyond them; on any other stage it runs the world's width and no further,
because walking past a screen side there is a KO at 0% (by design). A player watches their feet every frame: a held walk stops at a
cliff, and in the air it brakes before one (also against a move's drift with no key held). A tryhard never walks off on purpose and
jumps a pit that has floor on its far side; a new player's walk is sometimes a blunder (`walkoff`), and then nothing stops it.
Stepping off a platform onto the floor under it is just walking.

## What it records

BUG: exceptions in `step()`/`draw()`/clicks, console errors, the loop error flag, NaN/Infinity, undefined text, "can't" moments (a key
pressed on a ready fighter that changed nothing for 14 frames; a tutorial step that cannot be finished; a flag that will not go
down). STUCK: a screen with no way out, a match that does not end, a held key that goes nowhere for 10 s, a menu that will not
close. SLOW: step times by mode and phase (p50/p99/worst), long CTF fix phases. FEEL: match length, early KOs of the player, moves
that fired often and never landed, the player's damage by move type, CPUs idle for 10 s, CPUs bunched in a corner. UI: words a
match puts up beyond GO!, KO lines, boss/system lines (the tutorial and the World Cup are exempt), phone/touch wording on any screen.

How hits are counted: every hit through `applyHit` (on fighters) and `bossGraceNote` (on bosses, whatever the route: melee, shot,
dash, bolt) counts for the hitter's damage, its move type and its move; on a fighter only a rise in % counts (a hit that reaches the
damage cap counts up to the % at the KO). A finisher is ONE move: its first swing names it, the inner
swings are not moves of their own, and its hits -- in its start (`doAttackSpecial`), from its objects (`finxStep`, the game's
`HITSTOP_FIN` says whose) and from the shots it put out (tagged with the finisher and its fighter) -- go to it, not to whatever the
fighter pressed since. A finisher press that comes out as something else (no meter: a smash) never counts as a finisher hit, in the
move list or in the move types. Self-check, both ways: a hit the game marks as a finisher's and the playtester credits elsewhere, or a
player's `finisher` move type whose hits differ from what the player's finisher move landed, is a `playtest-credit` BUG.

Falls: a stock the player lost past a blast line with no hit, stun or damage from anything in the 3 s before (`fell` in the KO list;
the `player-falls` line counts them per persona, on edged stages and overall). Damage counts however it came: a rise in the % that
`applyHit` did not cause (Evil Leafy's hit, burn, bleed, lava, an enemy zone) is a touch too, and on the player it is added to
`taken` and shown apart as `other`. A damage-cap KO (`MAX`) is never a fall. A tryhard should have none; a new player may.

Boss Rush, `boss-untouched` (FEEL): nobody damaged the boss for 40 s. Each boss has its own clock, started when it arrives (a boss
not on the field before, or its health jumping up), and the clock does not run in the gap between two bosses (headless, the next
boss's 1.5 s real-time spawn timer is 40-80 s of game time). The summary line gives the longest wait between bosses. Because that
timer is wall-clock, the gaps between bosses (and so what follows them) depend on how fast the machine runs: the same seed does not
repeat a Boss Rush scene exactly once a second boss is due.

## Honest limits

- jsdom has no layout: overlapping or clipped text is not measurable here (use a headless Edge screenshot for that).
- `updateHUD` runs every 8th step (its `querySelector`s were 40% of a frame in jsdom); step times exclude most of the HUD.
- Step times are wall-clock on a shared machine: compare phases to each other, not to a 16 ms budget.
- A text box left focused by jsdom (it never unfocuses a hidden control) can swallow keys; the playtester moves the focus on every
  click the way a browser does.
- Findings are leads. Reproduce one from its seed (`--scene ... --seed ...`) before acting on it.

## PLAYTEST v2 (2026-11-11): 80 personas, jank detectors, the big run

```
node scripts/playtest.mjs --scene ffa --seed 7 --arg persona=adult-smash-veteran-01     # one person, one scene (every finding's repro line looks like this)
node scripts/playtest.mjs --plan plan.json --out DIR --priority below                    # one person's session: [{scene, seed, args}] in order, patience carried over
node scripts/playtest-big.mjs --shards 8 --passes 5 --out playtest-out/big [--dry]       # the big run: one process per (persona, pass), BelowNormal, partial aggregates
node scripts/playtest-aggregate.mjs --in playtest-out/big --report-dir DIR               # summary.md + personas/<tag>.md + ranked.json
```
New scenes: `journey` (title to a running match in every mode with default choices: clicks, keys, a person's seconds), `flow` (pause in the first
frames, a key released while paused, Esc spam, Resume, quit and come back, the result screen, Rematch keeping the settings), `wasdprobe` (WASD on a fresh game:
does anything say which keys to use). A persona with a key map (`wasd`, `lefty`) remaps through the real Settings > Keys screen before the match scenes
(ffa, 1v1, teams, boss, training, worldcup, running); the other scenes use literal keys and are played on the defaults.

### The persona library (`scripts/helpers/personas.mjs`)

20 archetypes, 80 people (tag = archetype + number, e.g. `kid-bfdi-fan-03`). Each person = an archetype (age band, skill, goal, habits, patience, key layout,
frame rate) plus a seeded draw of motor numbers from the archetype's range. The numbers are USED by the playtester:

| number | what it does in the input generation |
|---|---|
| reaction (ms, SD) | the think interval and the perception delay of the player (frames = ms / 16.7) |
| key timing jitter (frames) | every press starts a little late (half-normal) and its hold length varies (normal); a short hop is not jittered, it just succeeds or not |
| slipped presses (%) | that share of moves/jumps never happens (a slip), and is counted in the person's log |
| short-hop success | when a short hop was meant, this share comes out; the rest are full hops |
| double-tap success | a second jump that is meant lands in time; the rest come 6-14 frames late |
| aim error | the share of attacks aimed the wrong way (the legacy `aim` field, by skill) |
| mash rate | random extra presses (kids, skippers) |
| input fps | a person on a 25-35 fps machine: their keys reach the game only every 2nd frame (a tap shorter than the gap is lost). ASSUMPTION: the game steps at 60 per second and only the person's input is sampled at the lower rate |
| click seconds, ms per word, share read | a menu click costs that long, a new screen costs (its words x ms per word x share read): the "a person's seconds" of the journey and of the patience checks |
| patience | menu seconds before the first match (a "would have quit in the menus" event), seconds on one screen before they give up on it (the menu explorer stops clicking there), losses in a row before they would rage-quit |

Sources and honesty. This job ran offline; the figures are the author's recollection of published ranges, rounded, NOT looked up again, and the per-archetype
ranges are ESTIMATES built on them. Treat each as plausible, not measured.
- Simple visual reaction time: about 200-250 ms for young adults in lab work (Der and Deary 2006 for the age trend: slower and more variable with age, roughly
  +20-30% at 60+); online tests report about 250-280 ms because of screen and input lag (Human Benchmark). Kids 8-12: about 300-450 ms, falling with age
  (developmental RT studies; the exact ages are an estimate). Competitive fighting-game players: about 170-230 ms for a simple cue (estimate).
- Key timing jitter: tapping studies give SD of roughly 20-60 ms; mapped to 0.6-5 frames by skill (estimate).
- Reading speed: adults about 240 words per minute silent reading of non-fiction (Brysbaert 2019 meta-analysis) = 250 ms per word; children 8-12 about 100-160 wpm
  (oral-reading fluency norms, Hasbrouck and Tindal) = 400-600 ms per word; the "share read" of a screen (0-85%) is an estimate of skimming.
- Slip rate, short-hop and double-tap success, early-press rate, menu seconds per target, patience limits, frame rates of old laptops: ESTIMATES (no source).
- Age bands and goals follow what the owner described (kids 8-12 who know the show, teens, adults; boss rush, Capture the Flag with friends online, World Cup).

### The jank detectors (`scripts/helpers/jank.mjs`, group JANK in the reports)

Thresholds are in `THRESH` (printed at the top of every report). THEY WERE FIXED AND COMMITTED BEFORE THE BIG RUN AND ARE NOT TO BE CHANGED AFTER SEEING
RESULTS (commit "PLAYTEST v2" of 2026-11-11). Threshold log: no threshold has been changed. Two tool corrections (not thresholds) were made after the first
smoke runs and before the big run: Training-mode respawns and the frame of a KO are excluded from the teleport check (the dummies respawn at the top by design),
and a menu button that is already selected is not counted as a dead button.

| detector | how | root-cause key |
|---|---|---|
| jank-input-latency | key press to the first change on the fighter (frames after the step that saw it); outlier at >= 4 | fighter, action |
| jank-input-eaten | an attack pressed up to 6 frames before the last move's end-lag ended and released before it ended: buffered or lost; flagged at >= 50% lost with >= 8 samples | all, per fighter |
| jank-teleport | a live fighter moves > 150 px in one frame, no KO/respawn/jail change within 3 frames, not Training, not tutorial | fighter, last move |
| jank-hitstop-drift / -long | a fighter in hitstop moves > 8 px in a frame (not in a move/grab); hitstop longer than 24 frames | fighter, last move |
| jank-camera-snap / -jitter | camera centre moves > 160 px or zoom > 0.06 in a frame; >= 10 velocity flips of 2-8 px in 30 frames | stage |
| jank-snag, -air-hang, -embedded | the player holds a walk key 24 frames and moves < 3 px; a fighter motionless in the air 45 frames; a centre inside a solid platform 30 frames | stage, position |
| jank-text-overlap / -offscreen | words drawn on the canvas at the identity transform: boxes estimated as 0.55 x font px x characters; overlap > 35% of the smaller; or past the canvas edge. ESTIMATE of text width (jsdom has no font metrics) | text pair |
| jank-two-clicks, -dead-button, -esc-ignored | a menu button that did nothing on click 1 and something on click 2; nothing on two clicks (not a selected option); Esc does nothing on a screen that has a back button | screen, button |
| jank-many-clicks, -slow-path, -no-path | the `journey` scene: > 6 clicks+keys or > 60 person-seconds from the title to a running match with default choices; no path | mode |
| jank-slow-click, -slow-start | one click takes > 250 ms; Start Match > 800 ms (wall time, headless, 8 processes at once: noisy) | screen, button |
| jank-spike, -stutter | a frame slower than max(33 ms, 6 x the median of the last 90); 3 such within a second. Wall time on a loaded machine: only repeated spikes at the same event mean anything | mode, recent move |
| jank-audio-burst / -spam | > 8 sound calls (tone/noise) in a frame or > 90 in a second. Counts calls, not what a speaker plays | mode |
| jank-flow | pause in the opening, a walk key released while paused (stuck key after resume), Esc spam, Resume, pick remembered after quit, result screen offers Rematch and a way back, Rematch keeps settings | check |
| jank-boss-short-warning | per boss move: hits on the player that came < 18 frames after the telegraph began (>= 25% of >= 8 hits) | boss, move |
| jank-tlc-ring-slack | Firey Speaker Box THE TLC NEEDS TO BE FIXED!: per landing, the frames a fire ring needs to reach the nearest fighter standing still; < 15 in >= 25% of >= 8 landings. Also logged: how far the landing is from the nearest fighter ("tracks you") | phase |
| jank-no-key-hint | `wasdprobe`: WASD does nothing on a fresh game and no on-screen text mentions keys | - |

Not measurable here and so not claimed: real overlap or clipping of DOM text (jsdom has no layout; the canvas HUD check uses estimated widths), real frame rate,
real audio. A headless run says whether a thing happens, not how it looks.

### The report and the "plausibly noticed" estimate

`summary.md` merges the per-process JSON by root cause: count, which personas hit it, how many of the 80 would plausibly notice it, severity, a repro command.
"Plausibly notice" is a MODEL, an estimate made before the run: a finding has a class (blocking, visible glitch, feel, menu friction, design) with a minimum
sensitivity (0, 0.3, 0.6, 0.25, 0.2); a person's sensitivity is 0.25 first-time, 0.45 casual, 0.75 veteran, 0.95 competitive; a person counts if their sensitivity
reaches the class minimum and their plan includes a scene where the finding appeared. The top-15 score = annoyance weight (1.0, 0.6, 0.5, 0.45, 0.35) x
(noticers / 80) x (0.5 + 0.5 x share of those noticers who actually hit it). The per-persona logs say what that person did, what went wrong, where they got
stuck or confused, and when they would have quit.
