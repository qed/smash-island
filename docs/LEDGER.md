# Work ledger — Battle for Smash Island

Every task from this run, done or not. Grouped by where it came from, because that is the
part that is easy to lose. Written 2026-09-03.

`origin/main` is at PR #20. Everything below sits on twelve pushed branches, `pr1`..`pr12`,
each stacked on the one before. Suite: **630 of 631 passing** (the one failure is a known
flake, listed under OPEN).

---

## A · The original Claude CLI queue

These are the four things typed into the CLI on 27 Aug, plus the order agreed there.

| | Task | Status | Landed in |
|---|---|---|---|
| A1 | `bug: money counts boss hp as smash percent, rendering her a 1cs` | **Done** | `56c6f37` · pr3 |
| A2 | `do a check to see if we have all features discussed in the design doc and adversial review` | **Done** | previous session |
| A3 | `personalized smashes by charecters` | **Done** | pr5, pr7, pr8, pr12 |
| A4 | `do an a b test of all stats to balance... hidden stats like weight, cooldown and ticks of effects` | **Done** | `22541cb` · pr4 |
| A5 | Open the follow-up PR for the two orphaned commits | **Blocked** | pushed as pr1 |

**A1 was real, and it was not Money.** A piercing shot damaged a boss once per *frame* instead
of once. Any fighter with a piercing projectile melted bosses; Money was simply the one that got
noticed. The previous session's three "cannot reproduce" measurements were all aimed at her,
which is why it stayed hidden.

**A4's output is now stale** — see O3.

---

## B · Added during this session

| | Task | Status | Landed in |
|---|---|---|---|
| B1 | Assists should have AI, take no damage, act for 20 s, some exempt (Black Hole) | **Done** | `3d505bc` · pr2 |
| B2 | `none of them do much, save for 8 ball and pie` · `they get stuck on the ground` | **Done** | `3d505bc` · pr2 |
| B3 | Check the design doc for the assists' intended features | **Done** | `3d505bc` · pr2 |
| B4 | One-shot assists loitering after firing | **Done** | `bc4652d` · pr6 |
| B5 | Black Hole measurably did nothing (−0.1 against a 63.3 baseline) | **Done** | `c462e6f` · pr6 |
| B6 | Rebuild the moves using the Smash Bros wiki research | **Done** | pr9, pr12 |
| B7 | `most fighters dont have an up-c` | **Done** | `155fd4a` · pr9 |
| B8 | `nerf needles special cooldown, and the counter should only minimize damage` | **Done** | `5a3f112` · pr10 |
| B9 | `put some of our updates into a queue` | **Done** | `dc06220` · pr11 |
| B10 | `do the 39` — author the remaining smashes | **Done** | `5101932` · pr12 |
| B11 | `push with several prs` | **Done** | 12 branches |
| B12 | `cant you just give me a "merge pr" button?` | **Blocked** | see O1 |

**B2's cause.** 8-Ball and Pie were the only two assists that act at *range*. Every other one
needed contact, and assists had no jumping and no platform collision at all — only a floor snap.
Two were worse: Spongy could never hit anyone (his check only looked *below* him, while he sat on
the floor), and the Shopping Cart required the *owner* to ride it, which an AI never did.

**B7's cause.** They all had an up-C. Thirty of them had the *same* one — a hop plus a hitbox two
integers apart — and nineteen more were a hop plus one dropped projectile.

---

## C · Found while working, not asked for

| | Task | Status | Landed in |
|---|---|---|---|
| C1 | Smash charge was a switch, not a dial — every `c*` term in all 59 bodies was dead code | **Done** | `8368a50` · pr7 |
| C2 | Smash payoff machinery + Puffball's Meteor Puff as the first one | **Done** | `c462e6f` · pr6 |
| C3 | All 59 smashes given a name, a sound and a colour | **Done** | `defc880` · pr5 |
| C4 | `hitCircle`'s `dmgLow` was dead in all 57 call sites — now the sour half of a sweet/sour band | **Done** | pr9, pr12 |
| C5 | The effect pass hit nobody: it ran after the hit and honoured the invulnerability the hit grants | **Done** | `5101932` · pr12 |
| C6 | A declared cost that did nothing — `back` was overwritten by every pattern that sets velocity | **Done** | `5101932` · pr12 |
| C7 | `through` and `leap` overshot their targets by up to 174px | **Done** | `5101932` · pr12 |
| C8 | `reel` pulled and swung on one frame, failing at the exact problem it exists to solve | **Done** | `5101932` · pr12 |

---

## OPEN

### O1 · Open the pull requests · **blocked on you**

`gh` 2.99.0 is installed but not logged in, and the login is an interactive browser flow that
cannot be driven from here. One command in your terminal:

```
"C:\Program Files\GitHub CLI\gh.exe" auth login --hostname github.com --git-protocol https --web
```

Then all twelve PRs get created in one go and you get real merge buttons. Until then the compare
links work but each needs a click to open. This also unblocks A5 and B12.

### O2 · Create the twelve PRs, stacked in order

Waiting on O1. Merge order is pr1 → pr12; each diff shows only its own change.

### O3 · Re-run the A/B balance sweep

Thirty-nine smashes, forty-eight up-specials and the whole assist overhaul changed the numbers
the last sweep measured. Its output no longer describes this build.

### O4 · Delete the 39 superseded bodies in `SMASHES`

`doSmash` reads `SMASH_SPEC` first, so they are unreachable. A mechanical sweep of them orphaned
the continuation lines of the multi-line ones and broke the file, so they are marked rather than
deleted. Wants doing one at a time with a parse check between each.

### O5 · Angling a smash (up / down)

The research called it the best depth-per-line available, and the engine already carries launch
angle in `kbx`/`kby`.

### O6 · `tick.buff` is unmeasurable by the A/B sweep

The tournament harness disables items on purpose, so item-buff durations come back a clean
`0.0000` — which reads exactly like "this does not affect balance" and means nothing of the kind.
Needs an items-on variant.

### O7 · The music crossfade test is flaky under load

`test/music.test.js` "overlaps the two decks" fails in the full 631-test run and passes every
time in isolation. A timing assumption in the test, not a regression in the game.

### O8 · `relay/` points at a dead server

`RELAY_URL` returns `000`. The guard test asserts the URL *format*, so the suite stays green
while multiplayer cannot connect. Multiplayer is parked by your call — this is only the note
that the test proves less than it looks like it proves.

---

## Scoreboard

| | Count |
|---|---|
| Done | 25 |
| Open | 8 |
| Blocked on you | 1 (O1, which unblocks O2) |
