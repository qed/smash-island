# Wave-1 integration report

**Branch:** `feat/animations` (integration base)
**Merge commit:** `b6ea91a` — `Merge branch 'feat/sprites' into feat/animations`
**Parents:** `dec4fa0` (base, incl. the `feat/music` merge) + `493150e` (`feat/sprites`)
**Date:** 2026-08-05

`feat/animations` now carries the full Wave-1 set: animation system, banner cleanup,
stadium work, `feat/music`, and `feat/sprites`.

---

## 1. The conflict

One conflict, in `test/credential-strip.test.js` — the deploy-security gate that pins what
is publicly reachable under `vercel.json`'s `outputDirectory` (`artifacts/V1`).

Both branches needed to widen the same guard, because both added the publish root's first
real asset subtree, and they widened it in incompatible ways:

| | `feat/music` | `feat/sprites` |
|---|---|---|
| Publish-root pin | recursive **exact file list** (7 music files + `index.html`) | top-level `['assets', 'index.html']` |
| One-HTML rule | implied by the exact list | **split out** as its own recursive assertion |
| Asset content rule | audio must be real MP3; `custom/` must hold no audio | `assets/` may hold images + `CREDITS.md` only |

Taken naively, either side alone regresses the other: the music exact-pin rejects every
sprite PNG, and the sprites `assets/` rule (`png|webp|svg` + `CREDITS.md`) rejects every
`.mp3` and the `custom/README.md`.

## 2. Resolution — union, strictest form of each

Resolved as the **union**, keeping the strongest version of every check. Nothing from
either branch was dropped, relaxed, or traded away.

- **Recursive exact pin kept** (music side's strictest artifact) and *extended* with the
  12 sprite PNGs + `assets/sprites/CREDITS.md`. This is the tightest possible guard: any
  new public URL fails the suite.
- **Top-level pin kept alongside it** (`['assets','index.html']`, sprites side), so a
  stray sibling directory is still caught if the recursive pin is ever relaxed to a rule.
- **"Exactly one HTML file, recursively" kept as its own assertion** (sprites side). This
  is the check that historically caught a second, un-stripped copy of the whole game
  sitting beside `index.html`; it stays independent of the pin rather than implied by it.
- **`assets/sprites/` — images + `CREDITS.md` only** (sprites side, unchanged, now scoped
  to the sprites subtree instead of all of `assets/`).
- **`assets/music/` — audio + `CREDITS.md` + `custom/README.md` only** — *new*, added as
  the mirror of the sprite rule. Without it the widened tree would have been policed on
  one side only, and an HTML/JS file smuggled into `assets/music/` would have been
  publicly reachable while passing every inherited check.
- **`assets/` confined to exactly those two subtrees** — *new*, so a third media
  directory cannot appear and inherit no content rule at all.
- **`assets/music/custom/` must stay empty of audio** (music side, unchanged) — the owner
  override slot is filled locally; a track landing there must be a deliberate, credited
  publishing decision, never an `git add -A` passenger.
- **Unchanged from music side:** real-MP3 validation (frame sync / ID3, >100 KB, so a
  saved error page cannot pass as audio), every `MUSIC_FILES` context resolves to a
  shipped file, every shipped track is credited with a licence + source.
- **Unchanged from base:** forbidden credential tokens (`sk-ant`, `anthropic`, `api key`,
  `PLAN_KEY`, `planSetKey`, key DOM ids/CSS, remote font import) across *every* published
  HTML file, no third-party network references, no orphaned inline `on*=` handler.

## 3. Genuine integration breakage fixed

Both branches independently added a top-level `function walk(dir)` helper to the same
module. Merged verbatim that is a **`SyntaxError`** — duplicate lexical declaration at ES
module top level — which would have failed the file at collection time, not at assertion
time. Deduped to the forward-slash-normalising variant (the sprites version), and the now
-redundant per-call `.replace(/\\/g,'/')` at each music-side call site was dropped.

No assertion was deleted to make anything pass.

## 4. Guards verified to actually bite

A gate that is green because it matches nothing is worthless, so each new guard was
mutation-tested against a planted violation before being accepted:

| Planted file | Tests that failed |
|---|---|
| `assets/stray.html` | exact pin, one-HTML-entry-point, `assets/` confinement |
| `assets/sprites/evil.js` | exact pin, `assets/` confinement, sprites-content rule |
| `assets/music/custom/owner-track.mp3` | exact pin, owner-override-empty rule |

5 failures on 3 planted files; all three files removed afterwards and the tree re-verified
at 21 published files.

Note: the music-content rule correctly stayed green for the planted `custom/owner-track.mp3`
— a `.mp3` is a legal file under `assets/music/`; catching it is the dedicated
owner-override test's job. The two rules are deliberately separate concerns.

## 5. Test suite

```
Test Files  14 passed (14)
     Tests  183 passed (183)
  Duration  ~42s
```

| Suite | Tests | | Suite | Tests |
|---|---:|---|---|---:|
| `stadium-size` | 47 | | `deploy-hardening` | 8 |
| `music` | 47 | | `tournament-sim` | 7 |
| `credential-strip` | 12 | | `net-roster-leak` | 5 |
| `unlock-ui` | 12 | | `scaffold` | 5 |
| `progression-hooks` | 10 | | `harness.selfcheck` | 2 |
| `sprites` | 10 | | `modules-eval` | 1 |
| `profile-store` | 9 | | `hardening` | 8 |

183 comfortably clears the ~130 expectation (music's 122-suite baseline + sprites' 10 +
the merged gate's growth from 9 to 12).

## 6. Headless boot sanity

Via `test/helpers/load-monolith.js`: FFA match started, **120 frames of the real
`step(); draw();` loop**, no throw.

```json
{ "fightersSpawned": 5, "spriteBackedFighters": 2, "framesStepped": 120,
  "threw": null, "aliveAfter": 5, "simulationAdvanced": true, "ok": true }
```

The merged animation, sprite, music and stadium draw/update paths all run together in one
frame without error, with both sprite-backed and blob-fallback fighters on screen.

## 7. Local serve check

`python -m http.server 8102` over `artifacts/V1`:

- `GET /` and `GET /index.html` → **200**, 489,205 bytes, `text/html`
- **12/12** sprite PNGs → 200, `image/png` (9 KB–31 KB each)
- **5/5** music MP3s → 200, `audio/mpeg` (1.9 MB–3.1 MB each)
- 19 requests served, **zero** non-200 responses in the server log

Asset paths were extracted from the *references inside `index.html`*, not from a directory
listing, so this confirms the shipped page's own URLs resolve — the referenced set and the
on-disk set match exactly (12 PNG, 5 MP3).

## 8. Concerns / follow-ups

- **The exact publish-root pin now lists 21 files.** It is the strictest available guard
  and it is deliberate, but every future asset addition must update this list. That is the
  intended friction (a new public URL should be a conscious act), not a defect — worth
  knowing before Wave 2 adds sprite batch 2.
- **`spriteBackedFighters: 2` of 5** in the boot check is expected: only the batch-1 twelve
  have art, and the rest of the roster is still on the blob fallback by design.
- **Not pushed**, per instruction. `feat/sprites` and the other Wave-1 branches are left
  intact; no branch cleanup performed.
- Pre-existing untracked files (`.claude/`, `scripts/balance-ranking*.json`) were left
  untouched and uncommitted.
