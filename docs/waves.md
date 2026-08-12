# Battle for Smash Island — wave plan

Work is organised into **waves**: one coherent, shippable slice at a time, each landing on the live
site before the next starts. The rule that produced this structure is that five 90%-done features
are worth less than one shipped one.

Status as of the Wave 4 release.

---

## Wave 1 — Ship the look and sound ✅ shipped

Vertical stadiums + MAP SIZE presets · arena-wide platform fields · licensed background music with a
clutch-moment trigger and local custom-music playlists · the first twelve character renders ·
squash/stretch and the multi-state fighter rig · the teams-arena stall fix.

## Wave 2 — Make the competition real ✅ shipped

- **Balance pass 3.** Measured from 384 real in-engine matches, twice (before and after). Puffball
  65.4% → 44.7%, Liy 58.3% → 48.8%, and all eight bottom-tier fighters left the bottom eight. Roster
  spread tightened (σ 0.132 → 0.101) and no fighter is winless any more.
- **Real fighter ratings in the World Cup.** `teamStrength()` counted team SIZE and nothing else, so
  every unwatched fixture was a coin flip. It now sums measured per-fighter ratings baked from the
  balance runs. Tuned over 20,000 simulated fixtures: a mid-range pairing is upset ~40% of the time,
  the roster's best beats its worst about 75–25.
  **⚠️ The ratings must never come from `RANGE_PROFILE`** — that is a compensation table whose strong
  numbers mark historically *weak* fighters, so rating from it ranks the roster backwards while every
  spread check still looks healthy. The tests assert the SIGN of the correlation for this reason.
- **Quick map generator.** Six AI-authored archetypes combined procedurally from a seed, with
  guaranteed climbability, an open KO lane down each side, and spawns on real surfaces.

## Wave 3 — Growth loops ✅ shipped

- **Touch controls.** A phone or Chromebook touchscreen previously could not play at all. The pad
  writes into the same `down` map the keyboard uses, so the sim, AI, netcode and replay paths never
  learn touch exists — and remapping a key remaps the touch button for free.
- **Share the clip.** A raw `.webm` is not a share loop: it does not play inline in a chat and cannot
  be pasted. The last ~4 seconds are captured into a bounded ring and encoded to a **GIF** on demand.
  There is no backend, so "copy link" copies a link to the **game** — a link to a clip would 404.

### Sprites — the whole roster ✅ shipped alongside Wave 3

All 59 fighters now use official character renders (was 12). Fetched, verified and wired by
`scripts/fetch-sprites.mjs` → `wire-sprites.mjs` → `audit-sprites.mjs`, with every source URL
recorded in `assets/sprites/CREDITS.md`.

---

## Wave 3.5 — Juice ✅ shipped

Presentation only, no new modes or menus — the filter is "deepens what already exists".

1. ~~KO instant-replay~~ ✅ replays the tail of the share-clip ring at a third speed, looping
2. ~~Cake at Stake stingers~~ ✅ fires only on the LAST stock — a mid-match KO is not a ceremony
3. ~~Victory quips~~ ✅ 45+ character-voiced lines; a fighter with no entry gets silence rather than a generic line
4. ~~Daily Match~~ ✅ date-seeded, identical for everyone, one attempt a day
5. ~~Rival memory~~ ✅ built from balance:matchlog, appears only after two losses
6. ~~Crowd cameos~~ ✅ twelve benched characters watching from the back, hopping after every KO

## Wave 4 — Character depth ✅ shipped

All 59 fighters now have BESPOKE animation, verified by walking the roster against the registry
rather than counting batches: 0 without an entry. Delivered in five batches of ~10, each spec'd
into docs/animation-move-design.md before any code.

Writing the spec table for each batch *before* the code is what kept the cast on-model, and it is
the part to repeat. What the wave taught, all of it learned the hard way:

1. **Use `deform`, never `body`.** `body` suppresses the character render to draw a shape. That was
   right for Leafy's blade-dash and wrong for everyone else once all 59 had real art.
2. **A rotation past a quarter turn needs a CENTRE pivot, not the feet.** `deformAboutFeet` pivots
   where a fighter stands, so at a half turn the body swings in a circle *around the foot point* —
   Saw visibly orbited off the platform. Now caught automatically by a test.
3. **Never multiply a whole deform by a sine of `hazardT`.** On frames where the sine crosses zero
   the animation collapses to the identity transform and the attack is pixel-identical to standing
   still — while passing every test, because it was true at *other* frame phases.
4. **Measure at real gameplay scale, against idle, over a full cycle.** Sprites are ~67px on screen.
   Deform alone moves about five pixels and measures as "working" while being invisible in play.
   That mistake shipped twice before the swipe arc, run dust and hit spark were added to carry it.

## Art and effects (owner-requested) — mostly shipped



1. ~~**Boss sprites and animations.**~~ ✅ Six of the nine now use official renders, animated with
   an idle breath, a wind-up swell into the telegraph, a rage tempo and a white hit-flash. The
   Announcer, Bug Swarm and Purple Dragon keep their hand-drawn bodies: the Announcer's only
   transparent wiki candidate was a cropped speaker cone, and the other two are not wiki characters.
   Boss 2 and Boss 3 shared one sprite key, so they would have worn identical art — Boss 3 has its own now.
2. ~~**Projectile sprites.**~~ ✅ Shapes derived at draw time from the owner's kit — flame, ice shard,
   lightning bolt, fluid droplet, fused bomb, saw blade, spike, star — plus a motion trail on every
   shot. No spawn site changed, so the sim, netcode and goldens are untouched.
3. **Sprite / attack coherence — the owner's rule.** (applied to projectiles; still open for fighters) Where a sprite does not fit the move it is
   attached to, change the RELATIONSHIP rather than forcing the art: adjust the attack, its type,
   its effect, or its lore justification so that what you see matches what it does. The art is the
   fixed point; the move description bends to it.

## Wave 5 — The AI learns you (started)

Two halves of one idea: an AI that is *about* the player rather than a generic difficulty slider.

1. **AI coach.** Parked since Wave 1 pending a UX decision on where the API key lives. The review
   panel's own compromise: hide it behind an "Advanced" menu rather than the title screen — never
   the title-screen key box that was removed for trust reasons.
2. ~~**Per-character play-style learning (owner's design).**~~ ✅ **shipped.** `observePlaystyle()`
   watches only human-driven fighters and records three tendencies — how often you close, the range
   you attack from, and how much you favour specials over basics. `commitPlaystyles()` folds each
   match into a running mean in `style:v1`; `styledProfile()` blends it into the AI's class profile.

   How the constraints were met:
   - **Per character.** Learning Firey provably leaves Leafy untouched (tested).
   - **Local and offline.** It lives in `BStore` beside the profile layer; nothing leaves the device.
   - **Bounded, to avoid the "copy the winner" feedback loop.** The learned style only ever shifts
     the hand-authored archetype part of the way (`STYLE_WEIGHT` = 0.55), ramping in over 3→12
     matches, and `AI_PROFILE` is never mutated — a new object is returned, or one player's habits
     would leak onto every fighter sharing the archetype.

   **Measuring this needed care.** Two obvious metrics are confounded: average distance is dominated
   by KNOCKBACK (a brawler that lands hits sends the opponent flying, which *widens* the gap), and
   "fraction of frames closing" is dominated by the ideal range itself (a short-range CPU is already
   in position, so it closes less). The clean signal is **the distance at which the CPU chooses to
   attack** — measured 170px for a learned long-range style against 119px for a close-range one.

---

## The installable desktop app ✅ fixed

It had **never worked**. `electron/main.cjs` loaded `dist/`, whose entry point `src/main.js` is
still `console.log('BFSI boot placeholder')`, so `npm run dist` packaged a blank window — and every
test passed, because nothing asserted that the thing being packaged was the game.

It now loads `artifacts/V1`. Three further bugs were fixed on the way, each of which would have
broken it even pointed at the right directory:

- `app://index.html` parses **index.html as the hostname**, so every relative asset resolved to
  `artifacts/V1/index.html/assets/…`. The host is now fixed and the file is in the path.
- `net.fetch` was handed `'file://' + path`, which on **Windows** produces `file://C:\…` — not a
  valid URL. Now `pathToFileURL`.
- The protocol handler had no containment check, so a crafted `app://game/../..` could read outside
  the game directory.

A test now asserts the packaged `index.html` is hundreds of KB, contains the roster and the game
loop, and is not the placeholder — the check that would have caught this on day one.

**Not verified by running the installer** (no GUI available here) — worth one `npm run dist`.

The modularization plan in `docs/superpowers/plans/` remains the long-term option, but is no longer
blocking anything.
- **Finish the modularization** (the 32-task plan is still in `docs/superpowers/plans/`). Correct
  long-term, but it is a large refactor of the file every wave now depends on.
