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

## Wave 3.5 — Juice (queued)

Presentation only, no new modes or menus — the filter is "deepens what already exists".

1. KO instant-replay on the result screen (pairs with the share-clip GIF)
2. "Cake at Stake" elimination stingers
3. Victory quips, grounded in the wiki personalities
4. Daily Match — one seeded matchup a day, one attempt
5. Rival memory — the fighter who has KO'd you most gets a badge on the select screen
6. Crowd cameos from the design doc's benched non-fighters

## Wave 4 — Character depth ✅ shipped

All 59 fighters now have BESPOKE animation, verified by walking the roster against the registry
rather than counting batches: 0 without an entry. Delivered in five batches of ~10, each spec'd
into docs/animation-move-design.md before any code.

1. **Extend `docs/animation-move-design.md` first.** It covers 12 characters. The other 47 need
   wiki-grounded notes (idle tell, attack flourish, one signature deform tied to their special)
   before any code — that discipline is what kept batch 1 on-model.
2. **Five batches of ~10**, the cadence that worked for the sprite rollout, each landing with tests.
3. Much cheaper than batch 1: the rig and the art already exist, so each character is a
   `deform`/`over` hook rather than new illustration.
4. Verification is already solved — the motion-energy measurement from batch 1 (idle 25 → walk 64 →
   run 89 → attack 198 → hitstun 610) proves states are genuinely distinct.

Lessons kept:  never  (a render must survive); a rotation past a quarter turn needs a
CENTRE pivot, not the feet (Saw orbited off the platform); and a deform multiplied by a sine of
hazardT can collapse to identity on some frames, making an attack pixel-identical to standing still.

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

## Wave 5 — The AI learns you

Two halves of one idea: an AI that is *about* the player rather than a generic difficulty slider.

1. **AI coach.** Parked since Wave 1 pending a UX decision on where the API key lives. The review
   panel's own compromise: hide it behind an "Advanced" menu rather than the title screen — never
   the title-screen key box that was removed for trust reasons.
2. **Per-character play-style learning (owner's design).** The AI observes how *the player* plays a
   given character and updates how it plays that same character. Beat someone as aggressive Firey
   and the CPU Firey you meet next starts pressuring the way you did.

   Notes for whoever builds it:
   - The data source already exists — `balance:matchlog` and `balance:tallies` record real matches,
     and the balance runner proves the engine can be driven headlessly to measure behaviour.
   - Keep it **per character**, not global: the whole appeal is that Firey learns Firey.
   - It must stay **local and offline** like the rest of the profile layer; this is a behaviour
     profile, not an account.
   - Beware the trap Wave 2 documented: a naive "copy the winner" rule is a feedback loop that
     converges on one degenerate style. Sample from the player's tendencies, keep a floor of variety.

---

## Not a wave, but blocking an original requirement

**The installable desktop app does not work.** `src/main.js` is still a placeholder, `dist/` holds
only that stub, and `electron/main.cjs` loads `dist/` — so `npm run dist` packages a blank window.
The playable game is `artifacts/V1/index.html`, which is what Vercel serves.

Two ways out:

- **Point Electron at the monolith** and package that. Delivers the installable app quickly, no
  refactor. Recommended.
- **Finish the modularization** (the 32-task plan is still in `docs/superpowers/plans/`). Correct
  long-term, but it is a large refactor of the file every wave now depends on.
