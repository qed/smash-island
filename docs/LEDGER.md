# Work ledger — Battle for Smash Island

Every task from this run, done or not. Grouped by where it came from, because that is the
part that is easy to lose. Written 2026-09-03, extended 2026-09-10.

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

## D · The 2026-09-10 session

Typed into the CLI while playing, in this order.

| | Task | Status | Landed in |
|---|---|---|---|
| D1 | `up-specials dont do anything- rebuild the system` | **Done** | `1a93b31` |
| D2 | `puffball should have an option to cancel float with down` | **Done** | `1a93b31` |
| D3 | `the ai uses specials extremely quickly-why?` | **Done** | `1a93b31` |
| D4 | `i like moneys old smash, turn her current smash into her special` | **Done** | `1a93b31` |
| D5 | `barf bag is op` / `and its her smash` | **Done** | `1a93b31` |
| D6 | `you are able to spam the small versions and triple spike people` | **Done** | `1a93b31` |
| D7 | `do the 14` -- the smashes the rebuild never reached | **Done** | `1a93b31` |

**D1 was half a bug, and not the half it looked like.** The AI was fine: it already fired
up-specials in four branches, one for recovery and three for anti-air. The fault was entirely on
the human path -- `inp.up`/`inp.down` were read on the exact frame special was pressed, so the
direction had to be held ALREADY. Pressing special and *then* tilting resolved as the neutral
every time, which is why forty-eight authored up-specials appeared to do nothing. A press with a
direction held still fires instantly; a press with nothing held arms for `SPECIAL_DIR_WINDOW`
frames and takes the first direction to land.

**D6 is the third instance of the pattern in C1 and C6** -- a declared mechanic that never ran.
Two bugs stacked. The smash release branch fired whenever `smashHold` cleared its six-frame floor
with *no `atkCd` gate at all*, so a smash could be tapped out about every seven frames. And
`f.atkCd = full ? 30 : 18` ran AFTER `doSmash`, overwriting the cost `runSmashSpec` had just
applied -- so every `cost:{cd:48|54|56|74}` in `SMASH_SPEC` had been dead since it was written.
Refusing the wind-up during endlag is load-bearing, not cosmetic: `playstyle-and-juice` fails
without it, at 179px against a 181px threshold.

**D5's number had never been measured.** Barf Bag's smash was 112.8 total damage against a roster
runner-up of 40.0 and a norm near 24, because one move carried a top-of-roster hit, a 120-frame
burn AND a lingering poison trap that duplicated her own down-special. She is at 21.6 now,
sixteenth close in and sixth at range, which suits "Fluid zoner".

**D7 was twenty, not fourteen.** Six of the twenty are deliberate and stay on their own bodies:
Needle, Teardrop and Golf Ball land nothing by design (counter stance, cloud, curse aura), Naily
and Puffball are bespoke tested machinery, and Money's coins were restored by hand in D4. The
other fourteen were simply never reached, which is why Saw and Donut sat at 40.0. `smash-patterns`
caught seven `rowKey` collisions on the first pass, two of them between the new rows; each was
resolved with a design choice rather than a number nudge. SMASH_SPEC is 39 rows no longer -- it is
53, and the test asserts that count.

---

## OPEN

### O1 - Open the pull requests - **blocked on you**

One command, from PowerShell:

```
& "C:\Users\carad\Aardvark\smash-island\scripts\open-prs.ps1"
```

It opens your browser once for `gh auth login`, then creates all thirteen PRs stacked in order.
Re-running is safe; anything that already exists is skipped. `-Dry` shows what it would do.

Creating a PR is a write to your GitHub account. Pushing branches needs no credential handled here -
git fetches one from Windows Credential Manager itself - but the API wants a token in a header, and
the only way to supply one would be to pull your stored token out of the vault. That is the whole
reason this step needs you. Closing it also closes A5 and B12.

There is a bash twin at `scripts/open-prs.sh`. Two things to know if you edit either: `<` is a
reserved operator in PowerShell 5.1, and a BOM-less `.ps1` is read as ANSI, so any non-ASCII in it
is mis-decoded before the parser sees a single token.

### O3 - Re-run the A/B balance sweep  [DONE]

Re-run against the rebuilt moveset - `1560bef`, pr13. All sixteen null arms came back identical to
baseline, so the numbers are admissible. Cooldowns and raw knockback are the load-bearing families;
weight, which the previous sweep ranked first, is fourth. Full output in
`artifacts/balance-sweep-run.txt`.

Doing it turned up that the sweep **could not see the newest 87 moves in the game** - `dmg.all` and
`kb.all` match a digit straight after the colon, and every rebuilt smash and up-special writes
`dmg:[tap,full]`. Fixed in `f132a93` with two tiered knobs plus one for bleed, which had none.

Read the low end with care: thirty matches over fifty-nine fighters is two matches per fighter, so
the spread statistic is quantised and the ordering within the bottom eleven is not resolved.

### O4 · Delete the 53 superseded bodies in `SMASHES`

`doSmash` reads `SMASH_SPEC` first, so they are unreachable. A mechanical sweep of them orphaned
the continuation lines of the multi-line ones and broke the file, so they are marked rather than
deleted. Wants doing one at a time with a parse check between each. Was 39; D7 added fourteen
more rows and so superseded fourteen more bodies. The six still REACHABLE -- `counter`, `kick`,
`debuff`, `spike`, `fly`, `payday` -- must survive any such sweep.

### O5 · Angling a smash (up / down)

The research called it the best depth-per-line available, and the engine already carries launch
angle in `kbx`/`kby`.

### O6 · `tick.buff` is unmeasurable by the A/B sweep

The tournament harness disables items on purpose, so item-buff durations come back a clean
`0.0000` — which reads exactly like "this does not affect balance" and means nothing of the kind.
Needs an items-on variant.

### O7 · `test/music.test.js` is flaky under load

`test/music.test.js` "overlaps the two decks" fails in the full 643-test run and passes every
time in isolation. A timing assumption in the test, not a regression in the game.

Under-scoped as originally written: during the D session the failing test was "persists the
choice and honours it on the next load", a different case in the same file, and it also passed
on the next two full runs. Whatever the timing assumption is, it is shared across the file
rather than local to the crossfade case.

### O8 · `relay/` points at a dead server

`RELAY_URL` returns `000`. The guard test asserts the URL *format*, so the suite stays green
while multiplayer cannot connect. Multiplayer is parked by your call — this is only the note
that the test proves less than it looks like it proves.

### O9 · Blocky's anvil no longer homes  [DONE]

The legacy body scanned for the nearest fighter and dropped on their x. `rain` placed its drop at
a fixed `face * at` offset and the vocabulary had no way to say "aim this", so D7 traded the
homing for a longer reach and left a note at the row.

Fixed as a flag, not a bespoke body: `seek: <px>` on any `rain` row drops on the nearest enemy
within that range and falls back to the offset when nobody is there. Blocky carries `seek:220`.
The property worth protecting is that a row WITHOUT the flag is bit-for-bit unchanged -- every
other rain row was authored against the fixed offset -- and `test/smash-seek.test.js` asserts
that against Yellow Face as well as asserting Blocky now tracks.

**Tree is the other one that lost homing** and is not covered by this. His legacy `timber` scanned
within 320px and dropped on the target; he is now on `plant`, which roots you and detonates around
YOU, so `seek` does not apply to him -- restoring it means moving him back to `rain` and giving up
the wind-up telegraph that suits a falling tree. That is a design call, not a bug fix.

### O10 · The golden fixture is re-baselined for sixteen fighters

`test/golden/smash-charge.json` exists to prove nobody drifted by accident. D4, D5 and D7 changed
sixteen smashes on purpose, so those sixteen were re-measured and the other forty-three left
alone. The file still guards those forty-three; it no longer holds pre-change numbers for the
sixteen, which is unavoidable when the change is the point.

### O11 · Smash charge is still flat across all 59  [DONE]

Done in `f9dbf96`. `smashFullOf`/`smashFloorOf`/`smashHoldMaxOf` derive the windows from `f.w`.
Puffball reaches full in 32 frames, Tree takes 58, twenty-two distinct values across the roster;
bluff time keeps its 3x ratio. The constants stay as the documented baseline.

**Centre the curve on the MEDIAN weight, not the light end.** Centring on light made the median
fighter 9% faster and light fighters 38% faster, and `playstyle-and-juice` caught it at 177px
against a 182px threshold -- its metric counts jabs, not smashes, so a shorter wind-up means
fewer frames charging instead of jabbing and the two styles converge. Centred on the median, a
mid-weight fighter still charges in exactly the 45 frames everyone used to.

That test has now caught two separate changes in this area (the D6 cooldown gate and this one).
It is doing real work; do not loosen its threshold to make a change fit.

### O12 · `the main menu`  [DONE]

The complaint, once it arrived, was `you should say what the smash does in the main menu`. It was
not a rendering fault at all -- the move card showed the same "Smash — biggest hit" for all
fifty-nine fighters, so a smash had a name, a colour and a sound since the identity pass and
nothing anywhere said what it did.

Done in `f9dbf96`. The sentence is DERIVED from the `SMASH_SPEC` row -- pattern verb, dmg/kb
ratio, effect -- rather than written out fifty-nine times and then drifting as the numbers move.
The six fighters with their own bodies are a closed, deliberate set and get written lines. The
card also shows that fighter's charge and tap frames, which is the only place O11's variance is
visible to a player. Nothing is left on the generic string.

The 404 noted here was wrong twice over: there were **two**, and neither was a missing game
asset. `/_vercel/insights/script.js` is the deployed analytics script and 404s only when the file
is served locally -- removing it would break the deploy. The real one was that the head carried no
icon link at all, so every load asked for `/favicon.ico` and missed. Fixed in `08bbcb2`.

It is a 412-byte PNG inlined as base64, NOT an SVG, and the reason is worth keeping: an SVG data
URI has to carry the w3.org SVG namespace to render, and `credential-strip` counts every http(s)
host in the file against a one-host allowlist. It counts hosts inside comments too -- the first
draft of the explanatory comment failed the test by quoting the namespace it was explaining.

---

## Scoreboard

| | Count |
|---|---|
| Done | 38 |
| Open | 7 |
| Blocked on you | 1 (O1, which unblocks O2) |

The D session added nine done and two open (O11 and O12 were opened and closed within it). Suite is **643 of 643 passing**; the O7 flake did
not reproduce in any of the six full runs it took to land D1-D7.
