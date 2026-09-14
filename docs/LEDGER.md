# Work ledger — Battle for Smash Island

Every task from this run, done or not. Grouped by where it came from, because that is the
part that is easy to lose. Written 2026-09-03, extended 2026-09-10, 2026-09-11 and 2026-09-14.

`origin/main` carries everything below. The stacked `pr1`..`pr14` branches were merged earlier, and
the D and E sessions were pushed straight to `main` on 2026-09-11 at the owner's request (O1).

---

## A · The original Claude CLI queue

These are the four things typed into the CLI on 27 Aug, plus the order agreed there.

| | Task | Status | Landed in |
|---|---|---|---|
| A1 | `bug: money counts boss hp as smash percent, rendering her a 1cs` | **Done** | `56c6f37` · pr3 |
| A2 | `do a check to see if we have all features discussed in the design doc and adversial review` | **Done** | previous session |
| A3 | `personalized smashes by charecters` | **Done** | pr5, pr7, pr8, pr12 |
| A4 | `do an a b test of all stats to balance... hidden stats like weight, cooldown and ticks of effects` | **Done** | `22541cb` · pr4 |
| A5 | Open the follow-up PR for the two orphaned commits | **Done** | in `main` (pr1 merged) |

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
| B12 | `cant you just give me a "merge pr" button?` | **Superseded** | pushed to main (O1) |

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

## E · The 2026-09-11 session

| | Task | Status | Landed in |
|---|---|---|---|
| E1 | `all of the ones that make a circle around you feel broken` | **Done** | `541372d` |
| E2 | Stacked zoners stood still; a small stage's drop was a jump (found testing E1) | **Done** | `8748cc1` |
| E3 | `the charge up smashes ... infinite projectile spam` | **Done** | `e9426ed` |
| E4 | `adding GOOD sprites to all projectiles` | **Done** | `9237a88` |
| E5 | `a kick andimation, or a punch animation, for attacks` | **Done** | `4af37bf` |
| E6 | `add a small amount of iframes` / `an indicator of iframes` | **Done** | `b587e69` |
| E7 | `each one should have a custom hitbox` -- size, shape, and hit kept apart from hurt | **Done** | `f178e00` |
| E8 | `change TBs mechanic- he should have an assortement of gadgets` | **Done** | `7d42439` |
| E9 | `do not change` -- Tree | **Kept** | untouched |
| E10 | The golden fixture's unasserted fields had drifted (found) | **Done** | `87282f7` |
| E11 | The A/B harness had refused every run since D, which is what blocked O6 (found) | **Done** | `18f4059` |
| E12 | `you cant jump while chargin a smash` | **Done** | `be3f609` |
| E13 | `money hasnt changed...` | **Done** | `be3f609` |
| E14 | `buff TB's turret- it should have a health bar. buff the battery ...` | **Done** | `fefd2c5` |
| E15 | `everything needs to flow better- right now you cant chain well` | **Done** | `42d07d5` |
| E16 | `push to main for A` | **Done** | `15b60eb..18f4059` |
| E17 | `also, buff all projectile survival time` | **Done** | `6883580` |
| E18 | `remove tap smashes. if needed, just make the charge time short. but keep the charge time` | **Done** | `42d07d5` |
| E19 | `ship and merge` | **Done** | fast-forwarded `main` |

**E3 was one fighter, not the charge system.** Money's hand-written smash had no cost at all, so
she fired 22 smashes in ten seconds against a roster norm of nine to eleven, and the other five
hand-written bodies were free too. `LEGACY_SMASH_COST` prices all six. The heaviest AI projectile
source left is Ice Cube's special ring, which predates this branch -- see O14.

**E6 took three follow-ups, all found by the suite.** Longer grace blocked the moves built to hit
twice (Naily's back-jab, a spin's later ticks, the dash-past swing-back); `graceBlocks` lets one
move land its own later hits through the grace its earlier ones opened, and nothing else. Two
launchers told grace from real invulnerability by size alone (> 16, the old cap); `_graceLeft`
now tracks the grace share. Snowball's shot was the one E4 missed. One side effect is a buff:
at 140px the dash-past smashes used to lose their swing-back to the old six frames of grace,
so Leafy, Pin, Basketball, Lightning, Liy and Woody now land their whole smash at range, and
Naily's back-jab lands there too. E15 is where the longer grace met chaining.

**E7 moved no smash numbers** -- the golden fixture regenerates identically once its dummy is
pinned to the old 24px target -- but it exposed Meteor Puff's payoff: the point-blank hit reached
116px, so the real threshold was never the 90px `PLUNGE_HEIGHT` claims. Fixed in the same commit,
which also carries O5: the long-range check in `playstyle-and-juice` read 30.1px on O4, 17.1 with
hitboxes alone, 6.7 with angling alone and 38.7 with both, against a 20px bar, so neither half
could land green by itself. O15 is what that check turned out to be measuring.

**E8** is a rack, not a random hatch: ball, mine, turret, battery. The down-special steps it on
an 18-frame cooldown, the special uses what is loaded, the smash fires a much stronger version,
and the CPU loads for the range. `SMASH_SPEC` is 52 rows now; the test asserts that.

**E11.** `patch()` rounded every knob to a whole number, and D wrote the first decimal full-charge
values (Money's special, Barf Bag's splash), so the two tiered knobs stopped being a no-op at 1.0,
`verify` failed, and `balance-ab` refused every run after it. The knobs keep two decimals now and
`balance-knobs.test.js` runs the identity check on every change.

**E12** was O5's doing: angling made up aim instead of jump while a smash charged. The charge already
keeps building in the air, so the jump simply came back; up held at release still angles the smash.

**E13: Money had changed; the game you could reach had not, and nothing she showed said so.** Until
E16 the hosted build was `main` at `15b60eb`, which predates D4 -- anyone playing it played the old
Money. On this branch her select-screen text and move card still called her C "Cha-Ching -> coins
that hit harder on hurt foes", which described her old special, and every move of hers was the same
gold before and after, so swapping which button threw the coins read as no change. Her C is "Make It
Rain" now (the name the code already quoted as canon), the burst and her up-special coin are banknote
green, and gold is only her smash's coins. The build label still read v68 on both builds; it moves
with this session's last commit.

**E14** makes the turret breakable (45 health, 70 from the smash, with a bar), a real threat in
return (more, faster, further shots), and the battery a projectile-and-trap: it shocks if it hits and
leaves acid if it misses. His smash costs 40 frames instead of 66; every gadget covers more ground.

**E15 was measured before it was touched, and the measurement overturned the plan.** The hypothesis
was that the longer iframes (E6) had closed the combo window. They had -- for every hit under 7.5
damage there is no frame where a target is both stunned and hittable -- but that was never what
stopped a follow-up. The jab's own 22-frame lockout outlasts the target's 9-15 frames of hitstun in
every build, including the ones before the iframes: jab-to-jab had never chained. Restoring the old
grace would have reopened projectile walls and fixed nothing. The other thing the audit found was
not on anyone's list: smash costs pay in the attacker's own hitstun, which gates movement and
jumping, so 24 of 59 fighters could not move for up to 34 frames after a tap smash. That is what
"stuck" felt like.

So the package is attacker-side. A jab or ground move that connects recovers in 12 / 16 frames
instead of 22 / 26; the same attacker's next move may land through the grace their own hit opened
while the target is still stunned, at most three times, each link stunning for 25% less, and only a
NEW move may do it -- a lingering hitbox re-landing through its own grace was caught by the golden
fixture (Puffball's Meteor Puff) and ruled out. Grace is unchanged for everyone else; projectiles
never chain. Measured attacking every frame the rules allow: every fighter chains to exactly three,
the worst continuous stun-lock is 20 frames where it had been 266, and the target is free to act
for 162-185 of every 300 frames.

Then the owner removed tap smashes. A press past the mis-press floor commits: the smash fires when
its charge is full and the endlag has ended, held or not; holding past full waits for the release;
a press during endlag comes out when both are done (the first attempt at buffering remembered a
release for a fixed 12 frames, shorter than most endlags, and never fired -- found by a probe, not
a test). The charge is 18-32 frames by weight, from 32-58; declared costs are scaled by 0.75,
endlag is 26, self-stun 0.6x. Through the real key path no pattern beats one smash per
charge-plus-cost: 149 per ten seconds over ten fighters, against 231 with taps and the flow
package, 133-149 with the D gates, and 581 for the pre-D spam. Two rows pay no cooldown at all
(Balloony's airleak, Bubble's float) and sit at the endlag's 22-23 -- see O17.

Also found and fixed on the way: Money's special locked her jab for 62 frames (it paid its
runSmashSpec cost into atkCd), and every neutral special paid 8 frames of input delay to the
direction window (5 now). Every projectile lives 1.4x longer on the owner's call, through one door
(addProj) that a test guards; on screen that is 1.43 -> 2.04 in CPU duels, not a wall.

**E16** was a fast-forward of `origin/main` from `15b60eb` to `18f4059`, nineteen commits, after checking
that every stacked `pr*` branch was already in `main`. Vercel reported the deploy complete. Nothing
was force-pushed.

---

## F · The 2026-09-14 session

| | Task | Status | Landed in |
|---|---|---|---|
| F1 | `team members never do anything but ram straight ... in 4tdm, some go up as well` | **Done** | `57eab9b` |
| F2 | `do a winrates pass` | **Done** | `930e176` |
| F3 | `add a new degree of precision to damage: 0.1 ... buff some charecters by adding multihitting` | **Done** | `930e176` |
| F4 | `nerf the turrets accuracy on tb` | **Done** | `34408ec` |
| F5 | `add buff/debuff icons` | **Done** | `03220ec` |
| F6 | `the characters in the preview dont match the ones I actually am with` | **Done** | `b1c082b` |
| F7 | `add sprites from the actual show ... if it doesnt make sense, change the ability` | **Done** | `c5a1654` (art), `0767b6d` (Grassy, Remote); Taco and Roboty stay O19 |
| F8 | `ship and merge` / `just push it when they pass` | **Done** | pushed to `main` |
| F9 | `change Grassy, and remote` / `doesnt grassy have something going for him in tpot? also, remote uses batteries` | **Done** | `0767b6d` |

**F1 was measured before it was believed.** A first probe staged `count=4` in team mode and got
four one-fighter teams (`1v1v1v1` is the first split the game offers), so nobody had a teammate and
nothing changed. With a real split -- `2v2` and `2v2v2v2` -- the odd slot of each team now steers at
a point two pad rows above its target while far from it and drops on it once overhead. The second
teammate is a full pad row above the first 43% of the time in 2v2, up from 24%, and 35% in the
four-team split, up from 26%; damage dealt and KOs per match held. A flanker at kill percent leaves
the high road to danger mode. The behavioural control in the test was itself confounded by the
arena (in FFA the same fighter still hops a bluff), so the test asserts the structural fact the code
relies on instead: in FFA every fighter is its own team and nobody is ever slot 1.

**F2 and F3 are one pass, because the second decides where the first's buffs go.** 128 real matches
in eight brackets: Ruby 50%, then Fanny, Leafy, Sidewalky at 42%; Puffball, Toothpaste, Grassy,
Bubble, Barf Bag, Woody, Gelatin and Needle 0-for-8. `auto-balance` nerfs the top seven (six points
of weight, one of jab damage, knockback and reach); with one run its dead band is wide, so the
bottom clears it nowhere. The bottom eight are buffed by multi-hit: a profile row may declare
`multi:{hits, every}`, the jab lands its first hit and the rest at that interval through the grace
its own earlier hit opened (the designed multi-hit path, not the chain window), a hit on the
attacker cancels the rest, and per-hit damage is authored to a tenth -- which the HUD now shows.
Puffball's jab is a shot, so hers ticks three times where it lands. The engine had always carried
fractional damage; burn ticks 0.04 a frame. Two profile rows were mislabelled for years: `barf` is
Rocky's, and the first draft of this buff went to him until the test said Barf Bag's `multi` was
null. Her special is `splash`. Verified by a second tournament pair: **not conclusive.** Roster spread (sigma of win rates) went 0.114 before to 0.132 after, wider by 16%, with a bootstrap 95% interval of [-0.026, 0.047] over the four runs and P(tighter) 31.5%; KOs per game held at 1.71, so nothing got blunter. The nerfs landed where aimed (Ruby, 50% before, went 0-for-8 in one after run), but the roster did not get flatter at this sample size. O20 and O21 carry it.

**F4.** The turret aimed with atan2 and never missed; each shot now carries an error that grows with
range (about 4.6 degrees point blank, ten at 400px), the smash-built turret 40% tighter, from the
game's own seeded RNG so replays hold.

**F5 and F6** are a table of glyphs above the head, render-only and randomness-free by test, and a
one-draw memo for the lineup: `refreshTeamChat` and the match both called `buildFighters()`, two
random draws, so the teammates you planned with were never the ones you got. Starting the match
spends the memo, so the next preview rolls fresh; netcode lineups stay the host's.

**F7 was an inventory before it was art.** Every kit's attack was searched on the wiki the fighter
renders came from; nineteen files came through the fetcher's guarantees (a real PNG, transparent,
substantial), and then they were LOOKED at. Twelve were the character -- Firey, Donut, Lollipop,
Match, Fries, Bomby, Gelatin holding her syringes, Bracelety holding her sign -- or unreadable at
20px. Seven are the thrown thing itself and are in: Ice Cube's shatter, Cake's slice, the Supervan,
Bubble's bubble, Pen's cap, the price tag, the ruler. Puffball's rainbow vomit has no clean asset
and is drawn as the show draws it. The art loads lazily and draws only once loaded, so the headless
suite sees no change and the goldens do not move. Money's coins keep their glyph: the wiki's only
coin art is a pile. Tennis Ball is excluded on purpose.

**F9 changed the two abilities F7 could not draw.** Grassy's mower and Remote's signal bolt had no
counterpart in the show, and you named the counterparts: in TPOT 16 and 17 Grassy pilots Tree's
body, and Remote is battery-powered -- she spent half an episode unconscious without one. Grassy's
special is now Grasstree: four seconds up a tree, armoured on every frame, his jab at 1.4x damage,
1.3x knockback and 14px longer, walking at 0.85, with Tree's own sprite drawn behind him (Tree
himself is untouched). Remote's is Battery Swap: she hurls her battery -- heavy, bouncing, a
30-frame stun where it lands -- and runs on reserve power until a fresh one clicks in 150 frames
later, at 0.75 speed with specials refused before their cooldown is spent; the new battery heals
three. Her smash "Backwards Day" stays; his rolling wave is "Overgrowth" now. The keys were renamed
in every table (`mower` to `grasstree`, `hack` to `battery`), and `canon-abilities` checks each
effect frame by frame, its wearing off, and that no table still knows an old name. The F2
verification pair ran on the build before this change, so its Grassy and Remote are the old ones
(O21).

---

## OPEN

### O1 - Open the pull requests  [SUPERSEDED]

Every stacked branch (`pr1`..`pr14`) turned out to be in `main` already, and on 2026-09-11 the owner
asked for this branch to go straight to `main` instead (E16). `scripts/open-prs.ps1` and its bash twin
stay for any future stack. Closing this closes A5 and B12 with it.

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

### O4 · Delete the 53 superseded bodies in `SMASHES`  [DONE]

Done in `f5421ac`, from the parse tree: acorn finds each property of `SMASHES`, deletion is by whole
lines, and the file is re-parsed with the same 749 top-level statements before it is written.
21.6k characters went; the six below stayed.

`doSmash` reads `SMASH_SPEC` first, so they are unreachable. A mechanical sweep of them orphaned
the continuation lines of the multi-line ones and broke the file, so they are marked rather than
deleted. Wants doing one at a time with a parse check between each. Was 39; D7 added fourteen
more rows and so superseded fourteen more bodies. The six still REACHABLE -- `counter`, `kick`,
`debuff`, `spike`, `fly`, `payday` -- must survive any such sweep.

### O5 · Angling a smash (up / down)  [DONE]

Done in `f178e00`, together with E7 (see E7 for why). Held at release, up or down tilts the launch
about 22 degrees at the same strength. Charging no longer takes the jump away (E12).

The research called it the best depth-per-line available, and the engine already carries launch
angle in `kbx`/`kby`.

### O6 · `tick.buff` is unmeasurable by the A/B sweep  [MEASURED: below the noise]

Measured on 2026-09-11, once E11 let the harness run at all, with item pickups on (`--items 2`). The
answer is that this harness cannot see it: buff length's effect on roster spread is smaller than the
noise any change at all introduces.

| Run | ×0.75 buffs | ×1.33 buffs |
|---|---|---|
| 24 matches, default slate | spread +0.0%, pace +2.0% | spread −7.9%, pace +10.6% |
| 60 matches, default slate | spread +15.8%, pace −2.6% | spread +13.4%, pace +1.3% |
| 60 matches, slate seed 7 | spread −12.1%, pace −10.3% | spread −5.0%, pace −4.6% |
| **noise floor**: 60 matches, ×0.99 / ×1.01 | spread +5.6%, pace −6.1% | spread +43.1%, pace −2.7% |

The last row is the one that decides it. Moving every buff by a single percent -- 300 frames to 297 or
303 -- moved spread by up to 43%, more than either real arm; and the same factor changed sign between two
slates. The null arm coming back IDENTICAL only proves the harness is deterministic: any change to the
source reshuffles which fighter wins which match, and with four matches per fighter that reshuffle is
most of what spread measures. Measuring a knob this small would take several slates per arm, read against
a ×0.99/×1.01 floor measured the same way. See O16.


The tournament harness disables items on purpose, so item-buff durations come back a clean
`0.0000` — which reads exactly like "this does not affect balance" and means nothing of the kind.
Needs an items-on variant.

### O7 · `test/music.test.js` is flaky under load  [DONE]

Done in `dad5747`: every wait in the file has a ceiling that load cannot overrun. It has not
failed in any full run since. (One full run on 2026-09-11 lost a vitest worker outright -- the
`unlock-ui` file's twelve tests never ran; the file passes on its own. Environmental, not this.)

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

Since: `87282f7` caught up the fields it records but never asserts, and `7d42439` and `fefd2c5`
re-measured Tennis Ball and no one else. See O13.

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

### O13 · The golden fixture asserts only its 60px row

`smash-charge` compares damage and launch at 60px. The fixture also records `atkCd`, `hitFrame`
and a 140px row, and three commits in a row moved them without a failure -- including a real
change in damage at range for seven fighters. Asserting the 140px row would have caught it.

### O14 · Ice Cube's special ring is the heaviest AI projectile source

Measured while chasing E3. It predates this branch and was not part of the complaint, so it was
left alone; it is the first place to look if the projectile spam comes back.

### O15 · The long-range check in `playstyle-and-juice` was a coin flip per seed  [DONE]

Done in `6ebaf05`. It plays each style in its OWN window on the same seed -- both matches start from
identical state, which removes the order bias (a no-effect gap of 5.6px becomes about 2.2px)
and nearly halves the spread -- and the verdict is the mean over sixteen fixed seeds. The bar,
10px, is derived from measured noise on the shipped build: the effect is about 21.2px
(sd 20.2, 32 seeds) against a no-effect baseline of 2.2px (sd 10.9, 32 seeds); resampling
whole seeds, a build with no style effect clears it about 0.2% of the time and the shipped build
misses it about 1.2%. Eight seeds at 14px would have been 0.1% / 15.1% on this build.

Worth recording: the effect was about 29px before E15 and about 21.2 after it. The flow package
changed how the CPU throws smashes, and the metric counts a smash's lunge as an attack, so the
long-range CPU's attacks now start from less further out than they did. The style is still read;
it is just a smaller lever than it was, and the test now says so in its comment rather than
flaking about it.

### O16 · The A/B harness has no noise floor

Found by O6. `balance-ab` compares each arm against a baseline on the same seeds and calls the harness
sound when a x1.0 arm reproduces it -- which proves determinism, not signal. Any change to the source
reshuffles match outcomes, and at 60 matches a single-percent nudge to buff lengths moved roster spread
by up to 43%. Every sensitivity it reports, including O3's ranking, should be read against a x0.99 /
x1.01 floor measured the same way, and across more than one slate. Until then its rankings are
suggestions.

### O17 · Two smash rows pay no cooldown at all

Balloony's `airleak` ({back:3}) and Bubble's `float` ({self:6}) declare no `cd` and no `stun`, so the
only wait between their smashes is the flat 26-frame endlag: through the real key path they reach 22-23
smashes in ten seconds where everyone else sits at 11-16. Bubble pays 6% of her own health per throw,
which limits her; Balloony pays nothing. The gates audit flagged them as where spam returns first. A
`cd` in the band the other rows use (44-74, paid at 0.75x) would bring them in line; it is a design
call for those two fighters, not a bug.

### O18 · The tap tier in every SMASH_SPEC row is unreachable from input

`dmg:[tap, full]` and `kb:[tap, full]` are still authored in all 52 rows and asserted by the fixture's
tap/full ratio test, but since E18 no input path passes c=0 -- only direct calls in tests and probes do.
The balance harness's `dmg.tiered` knob scales both tiers together, so nothing is wrong; it is dead data
that a later pass could collapse to a single value, taking the ratio test with it.

### O19 · Which non-canon abilities to change

"if it doesnt make sense, change the ability." Grassy and Remote are done (F9). The kits whose
attack still has no counterpart in the show are thematic rather than from an episode: Taco's salsa
(her episodes are about the jawbreaker and her leaving, not a projectile), Roboty's morse bolts (he
speaks morse, so these already make sense), Golf Ball's curse aura. Swapping a move for a canon one
is a design call per fighter, not an art fix. Say which, and they change.

### O20 · The bottom eight's second tournament pair

F2's verdict is recorded above from two tournament pairs. Eight matches per fighter per run is still
thin at the bottom -- 0-for-8 is what a 128-match bracket says about a bad fighter AND about an
unlucky one -- so a fighter that stays at 0% across all four runs is real, and one that moves is
noise. Across the four runs only Needle never won a match. Bubble and Gelatin were 0-for-16 before the pass and won after it; Cake, Teardrop and Liy were 0-for-16 after it and had won before. Treat the multi-hit numbers as a first step sized to be safe (+15% to +40% on the
jab), not a finished balance.

### O21 · Grasstree and Battery Swap have no tournament yet

The F2 verification pair ran on the balance of `c5a1654`, before F9. In its first run the old
Remote won 64.7% of her matches and two brackets, the best of anyone, with a signal bolt that no
longer exists; the new Remote is a strong throw with a 150-frame price, the new Grassy a stat buff
on a 90-frame cooldown, and neither has a bracket behind it. A pair of runs on the F9 build is the
next balance step; until then the win rates above describe a roster two fighters out of date.

---

## Scoreboard

| | Count |
|---|---|
| Done | 68 |
| Open | 9 (O8, O13, O14, O16, O17, O18, O19, O20, O21) |
| Superseded | 2 (O1, B12) |
| Blocked on you | 0 |

Counted row by row: A1-A5, B1-B11, C1-C8, D1-D7, E1-E8, E10-E19, F1-F9, O3-O7, O9-O12 and O15.
Suite: **762 of 762 on the shipped file (62 files)**.
