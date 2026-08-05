# Background music — implementation report

Branch: `feat/music` (based on `feat/animations`)
Deliverable: real, licensed background music for `artifacts/V1/index.html`, wired to four game
contexts, under the existing Sound toggle, with the old synth loop kept as the fallback.

---

## 1. Tracks chosen

The owner asked for an Undertale feel (menus/battle) and a Hollow Knight / Silksong feel (bosses).
**No commercial soundtrack was downloaded, embedded, or covered.** Nothing by Toby Fox or
Christopher Larkin — no rips, no fan re-uploads, no arrangements of their compositions — is in this
branch. These are independent style-alike tracks whose licence was read on the track's own page
before download.

| Context | File | Title | Author | Licence | Source |
|---|---|---|---|---|---|
| Menu / character select / lobby / tutorial / creator / stats | `menu.mp3` | Chill/Calming Chiptune Loop | Reganati | Pixabay Content License | https://pixabay.com/music/electronic-chillcalming-chiptune-loop-527182/ |
| Arena matches (FFA, 1v1, teams, World Cup fixtures, tutorial) | `battle.mp3` | 8-Bit Chiptune Action Music for Video Games | HauntSync | Pixabay Content License | https://pixabay.com/music/video-games-8-bit-chiptune-action-music-for-video-games-329940/ |
| Boss Rush | `boss.mp3` | Dark Orchestral Battle Tension | Montogoronto | Pixabay Content License | https://pixabay.com/music/build-up-scenes-dark-orchestral-battle-tension-395613/ |
| World Cup setup + tournament hub | `tourney.mp3` | Epic Orchestral Anthem Loop | Sonican | Pixabay Content License | https://pixabay.com/music/main-title-epic-orchestral-anthem-loop-308394/ |

All live in `artifacts/V1/assets/music/`. Full details, verbatim licence terms and the attribution
text are in `artifacts/V1/assets/music/CREDITS.md`.

### Payload

| File | Bytes | Length | Format |
|---|---|---|---|
| `menu.mp3` | 2,458,368 | 1:16.8 | MP3 256 kbps 48 kHz |
| `battle.mp3` | 3,083,520 | 1:36.4 | MP3 256 kbps 48 kHz |
| `boss.mp3` | 1,922,612 | 1:00.1 | MP3 256 kbps 44.1 kHz |
| `tourney.mp3` | 2,583,823 | 1:20.7 | MP3 256 kbps 44.1 kHz |
| **total** | **10,048,323 (9.6 MiB)** | | |

Short loops were preferred over long tracks specifically to keep each file under ~3 MB. There is
no `ffmpeg` on this machine, so re-encoding to a lower bitrate was not an option; picking 1–1.5
minute loops achieved the same budget and is the better shape for game music anyway. Nothing is
fetched until the player's first interaction, so a visitor who bounces off the title screen
downloads **zero** bytes of audio (verified in a real browser — see §4).

### Licence position

Pixabay Content License summary (read 2026-08-05, https://pixabay.com/service/license-summary/):

- Allowed: *"Use Content for free"*, *"Use Content without having to attribute the author"*,
  *"Modify or adapt Content into new works"*.
- Prohibited: selling or distributing Content *"on a Standalone basis"*, i.e. where no creative
  effort has been applied and it remains substantially as published.

Attribution is **not required** for any of the four. It is given anyway, in two places:
`assets/music/CREDITS.md`, and a `#musicCredits` line in the title-screen footer naming all four
titles, all four authors and the licence. (No CC-BY track ended up in the set, so the "must surface
CC-BY in the footer" requirement is satisfied by a stricter behaviour than it asked for.) The footer
line deliberately carries **no URLs** — `test/credential-strip.test.js` forbids any third-party host
reference in the shipped HTML, and that gate stays green.

---

## 2. Wiring

All changes are inside the monolith's existing audio section plus two call sites.

**New state on `SND`:** `gesture`, `_el`, `_elKind`, `_kind`, `_pendingKind`, `_fileBad`.

**New functions**

| Function | Role |
|---|---|
| `MUSIC_FILES` | context → path map. Swap a file at the same path and it is picked up with no code change. |
| `MUSIC_VOLUME` | per-context level (0.30–0.34) so music sits under the SFX. |
| `MUSIC_SCREENS` | screen id → bed. Drives music from the existing `go()` router. |
| `musicEl()` | lazily builds the ONE reused `<audio>`; returns `null` where media is unavailable. |
| `musicPlaying()` | true if either the file or the synth bed is currently sounding. |
| `startMusicFile(kind)` | tries the recorded track; returns false when the caller should use the synth. |
| `startMusic(kind)` | the single entry point — unchanged name, unchanged call sites. |
| `musicUnlock()` | called from the first-gesture hook; starts whatever was parked. |
| `currentMusicKind()` | what the game *should* be playing right now (used by the sound toggle and the cold-load path). |
| `startSynthMusic(kind)` | the original `startMusic` body, renamed. Behaviour untouched. |

**Changed call sites**

- `go(id)` — ends with `startMusic(MUSIC_SCREENS[id])` when the screen maps to a bed. Matches use
  `go('_none_')`, which maps to nothing, so they keep their own bed.
- `finishWatchSetup()` — added `startMusic('battle')`. A World Cup fixture is an arena match; without
  this the hub's anthem played straight through every fight.
- `toggleSound()` — turning sound back on now resumes the bed the current context wants.
- `stopMusic()` — now stops *both* paths (clears the synth timer, pauses the element, clears
  `_kind`/`_pendingKind`).
- the first-gesture listener — now also calls `musicUnlock()`.

Existing `startMusic('battle')` / `startMusic('boss')` calls in `startTutorial`, `startBossRush`
and `beginMatchNow` were left exactly as they were.

### Autoplay

No `Audio` object is constructed until `SND.gesture` is true, which only the
`pointerdown`/`keydown`/`touchstart` listener sets. A `startMusic` before that parks the kind in
`SND._pendingKind` and returns; `musicUnlock()` starts it. If `play()` is still rejected by a policy
we did not anticipate, the `.catch` re-parks the request and runs the synth bed meanwhile, so the
context is never silent.

**Cold-load bug found and fixed during live testing:** the title screen carries `class="active"` in
the HTML, so a fresh load never routes through `go('title')` and *nothing ever requested music* —
the front page sat silent until the first navigation. `musicUnlock()` now falls back to
`currentMusicKind()` (the active screen) when nothing is parked. Covered by a regression test.

### Fallback behaviour

1. **Context has no file** → `startSynthMusic(kind)`, the original loop.
2. **File 404s / fails to decode** → the element's `error` handler marks `SND._fileBad[kind]`, drops
   the element, and starts the synth bed for that context. The kind stays on the synth for the rest
   of the session; other contexts are unaffected.
3. **`play()` rejected** → re-parked for the next gesture, synth bed meanwhile.
4. **No `Audio` constructor / no Web Audio at all (jsdom)** → every path is a guarded no-op and
   nothing throws.

Sound toggle off pauses the element AND clears the synth timer AND clears `_kind`, so a later
`startMusic` from any code path stays silent while muted. Verified both headlessly and live.

### Test-harness safety

- No top-level media construction: verified by a test asserting the event log is empty after boot.
- `test/credential-strip.test.js` pinned the publish root with a **non-recursive** `readdirSync`.
  Adding `assets/` would have made it pin the directory as one opaque name and stop noticing
  anything inside it — the exact blind spot the gate exists to close. It now walks the whole tree
  and pins all six published paths, and additionally asserts every `MUSIC_FILES` path resolves to a
  >100 KB file that starts with MP3 frame sync or an ID3 tag (a saved error page would play as
  silence, which is worse than a missing file).

---

## 3. Tests

`npx vitest run` — **12 files, 87 tests, all passing** (baseline on `feat/animations`: 11 files,
72 tests).

New `test/music.test.js` (13 tests) boots the monolith in jsdom with a fake `AudioContext` and a
*spying* `Audio` class, and asserts:

- exactly four contexts declared, each backed by a file that exists on disk
- zero audio elements constructed at boot
- no autoplay before a gesture; the request is parked instead
- the parked bed starts on the first gesture, looping, at a sane volume
- a cold load (no `go()` ever called) still starts the menu bed on first click
- title → select → controls → title does not restart the loop
- each context plays its own file; the hub gets the anthem, a match gets the battle bed, Boss Rush
  gets the boss bed
- the sound toggle silences the file layer, leaves nothing armed, ignores `startMusic` while muted,
  and restores the right bed when switched back on
- a bad file falls back to the synth loop
- a platform with no media support at all boots and runs every music call without throwing
- CREDITS.md names an author, source and licence for all four, and the title-screen footer surfaces
  every author plus the licence

**Mutation-checked** (both reverted, file diffed back to identical):

| Mutation | Result |
|---|---|
| remove the `!SND.gesture` autoplay guard | 2 tests fail |
| make `go()` never pick a bed | 3 tests fail |

## 4. Live browser verification

Served `artifacts/V1` over HTTP and drove it in a real browser:

- cold load: `SND._el` null, `SND.gesture` false, **zero** `.mp3` network requests
- one click on empty space: `menu.mp3` fetched and playing, `loop=true`, `volume=0.34`
- title → select: same element still playing, no restart
- `startMatch()` → `battle.mp3` (96.36 s, `readyState` 4, `currentTime` advancing)
- Boss Rush → `boss.mp3` (60.08 s)
- tournament hub → `tourney.mp3` (80.74 s)
- Sound: Off → element paused, `_kind` null, synth timer clear; Sound: On → `tourney.mp3` resumes
- pointed `MUSIC_FILES.boss` at a missing path → `_fileBad.boss` true, element dropped, synth bed
  running. No silence.

## 5. Concerns / follow-ups

- **9.6 MiB total.** Fine for a static deploy that fetches nothing before the first click, but if
  the payload ever matters, re-encoding these four to ~96 kbps would cut it to roughly 3.6 MiB with
  little audible loss on game music. Needs `ffmpeg`, which is not installed here.
- **Loop seams.** `HTMLAudioElement.loop` can leave a few ms of gap on some browsers. Truly gapless
  would mean decoding to a WebAudio buffer, which for 9.6 MiB of MP3 is >100 MiB of PCM in memory —
  a bad trade for a browser game. The tracks were chosen partly because they are published as loops.
- **Track fit is judged from title, genre and duration, not from listening.** The four are
  defensible matches for the brief, but the owner should give them a listen; swapping any one is a
  single file replacement at the same path plus a CREDITS.md/footer edit.
- **Music does not duck or pause when the game is paused.** Not in scope; easy to add later in
  `togglePause`.
