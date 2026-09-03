# Queue — Battle for Smash Island

Everything asked for that is **not yet done**, in the order I'd take it. Written 2026-09-03.
Tick a box and I'll pick it up from here.

Shipped this session, for reference: assist trophies rebuilt (body/AI/20s/immunity/doc
behaviours), the Money "1cs" bug found and fixed (a piercing shot damaged a boss once per
*frame*), the A/B balance sweep built and run, all 59 smashes given a name + sound + colour,
the charge split into two real tiers, Naily's smash authored from scratch, 48 up-specials
rebuilt into four shapes, Needle nerfed. Ten branches pushed, `pr1`..`pr10`.

---

## 1. Open the pull requests  ← blocked on you

`gh` 2.99.0 is installed but not logged in, and the login is an interactive browser flow I
can't drive. One command in your terminal:

```
"C:\Program Files\GitHub CLI\gh.exe" auth login --hostname github.com --git-protocol https --web
```

Then I create all ten PRs in one go and you get real merge buttons. Until then the compare
links work but each needs a click to open.

- [ ] `gh auth login` (you)
- [ ] create PRs 1–10, stacked in order (me)

## 2. Author the remaining 39 smashes  ✅ DONE

All thirty-nine now have a row in `SMASH_SPEC`: a movement PATTERN (ten of them, none carrying
more than six fighters), an EFFECT that outlives the hit, a dmg/kb RATIO that is the move's job,
and a COST paid whether it connects or not. Written from each character's design-doc entry.
`test/smash-patterns.test.js` asserts no two are the same move.

## 3. Smaller things noted along the way

- [ ] **`tick.buff` is unmeasurable by the A/B sweep.** The tournament harness disables items
      on purpose, so item-buff durations come back a clean `0.0000` — which reads exactly like
      "this doesn't affect balance" and means nothing of the kind. Needs an items-on variant.
- [ ] **The music crossfade test is flaky under load.** `test/music.test.js` "overlaps the two
      decks" fails in the full 617-test run and passes every time in isolation. It's a timing
      assumption in the test, not a regression in the game.
- [ ] **`relay/` points at a dead server.** `RELAY_URL` returns `000`; the guard test asserts
      the URL *format*, so the suite is green while multiplayer cannot connect. Multiplayer is
      parked by your call — this is just the note that the test proves less than it looks like.

## 4. Not started, from earlier in the queue

- [ ] **Angling a smash** (up/down) — the research called it the best depth-per-line available,
      and the engine already carries launch angle in `kbx/kby`.
- [x] **Sweet/sour bands on the smashes.** Six of the ten lunges now opt in — Gaty is sweet at the
      latch, Bell at the hilt.
- [ ] **The 39 superseded bodies in `SMASHES` are dead code.** `doSmash` reads `SMASH_SPEC` first,
      so they are unreachable. A mechanical sweep of them orphaned the continuation lines of the
      multi-line ones and broke the file, so they are marked rather than deleted. Removing them
      wants doing one at a time with a parse check between each.
- [ ] **Re-run the A/B balance sweep.** Thirty-nine smashes, forty-eight up-specials and the assist
      overhaul all changed the numbers the last sweep measured, so its output is now stale.
