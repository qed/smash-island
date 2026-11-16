# The simulated playtester (`scripts/playtest.mjs`)

A headless PLAYER, not a CPU. It boots `artifacts/V1/index.html` in the jsdom harness (`test/helpers/load-monolith.js`) and plays
it through the real inputs: `KeyboardEvent`s on the page body (so the game's own keydown handlers fill `down[]`, with the keyboard's
auto-repeat for held keys) and clicks on the real menu buttons. It sets game state directly only to START a scene (a Boss Rush boss
number, the RUNNING! race, which has no door of its own). Computer only: nothing touch, nothing same-computer two-player.

## Run it

```
node scripts/playtest.mjs                      # a session: --minutes CPU minutes (default 12), a rotating seeded sample of scenes
node scripts/playtest.mjs --seed 7             # the same session again
node scripts/playtest.mjs --only ctf,flagcup   # only these scenes (shards: run up to 3 processes with different --only lists)
node scripts/playtest.mjs --scene ffa --seed 99 [--arg fighter=Bomb --arg stage=canyon]   # ONE scene: how every finding is reproduced
node scripts/playtest.mjs --list               # the scenes
```

Flags: `--minutes N` (CPU time, with a wall limit of 4x), `--wall-minutes N`, `--match-minutes N` (game-time cap of one match, default 3),
`--out DIR` (default `playtest-out/`), `-v` (print findings as they happen), `--no-idle`, `--force`.

It asks for Idle priority itself (`os.setPriority`). On a laptop it reads the battery: on battery under 40% it caps the session to
1 minute; on battery under 60% to 3 (`--force` overrides). Ctrl+C writes a partial report and exits; the report is also rewritten
after every scene.

Output: `playtest-out/<timestamp>-s<seed>.json` (everything) and `.md` (grouped BUG / STUCK / SLOW / FEEL / UI with counts and a
repro command each). `playtest-out/coverage.json` remembers which fighters, CTF maps and bosses have been played, so the next
session picks the least-played ones first.

## Scenes

`ffa`, `1v1`, `teams` (random stage, random least-played fighter, a persona), `ctf` (a map by coverage: hiding and placing a
flag, the planning menu on every tab, building in the free camera, then play), `ctf-spectate`, `flagcup` (Flag Cup, watch one
fixture, S to skip), `boss` (Boss Rush, a boss by coverage), `worldcup` (a fixture you play), `training`, `tutorial` (follows the
card's nine steps with the keys it names), `running` (RUNNING!), and `menus` (the EXPLORER: every button of every screen,
Esc everywhere, every fighter's card, the settings toggles, the key remap, the pause card and its move list).

Personas: `new` (slow, mashes, walks off ledges), `tryhard` (spaces, uses every move, recovers), `explorer` (wanders, presses every key).

## What it records

BUG: exceptions in `step()`/`draw()`/clicks, console errors, the loop error flag, NaN/Infinity, undefined text, "can't" moments (a key
pressed on a ready fighter that changed nothing for 14 frames; a tutorial step that cannot be finished; a flag that will not go
down). STUCK: a screen with no way out, a match that does not end, a held key that goes nowhere for 10 s, a menu that will not
close. SLOW: step times by mode and phase (p50/p99/worst), long CTF fix phases. FEEL: match length, early KOs of the player, moves
that fired often and never landed, the player's damage by move type, CPUs idle for 10 s, CPUs bunched in a corner. UI: words a
match puts up beyond GO!, KO lines, boss/system lines (the tutorial and the World Cup are exempt), phone/touch wording on any screen.

## Honest limits

- jsdom has no layout: overlapping or clipped text is not measurable here (use a headless Edge screenshot for that).
- `updateHUD` runs every 8th step (its `querySelector`s were 40% of a frame in jsdom); step times exclude most of the HUD.
- Step times are wall-clock on a shared machine: compare phases to each other, not to a 16 ms budget.
- A text box left focused by jsdom (it never unfocuses a hidden control) can swallow keys; the playtester moves the focus on every
  click the way a browser does.
- Findings are leads. Reproduce one from its seed (`--scene ... --seed ...`) before acting on it.
