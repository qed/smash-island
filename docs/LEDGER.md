# Work ledger — Battle for Smash Island

Every task from this run, done or not. Grouped by where it came from, because that is the
part that is easy to lose. Written 2026-09-03, extended 2026-09-10, 2026-09-11, 2026-09-14, 2026-09-15 and 2026-09-16.

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
| F10 | `change GB for O19` / `3 and 4 for the down-special` | **Done** | `3b244d1` |
| F11 | `do O21` (after Golf Ball and O17 land, in a second worktree) | **Done** | measured on `d946b18`, see O21 |
| F12 | `do O17` | **Done** | `d18d830` |
| F13 | `do O18` | **Done** | `e34c0f3`, fix `452e233` |
| F14 | `do O16` (three slates) | **Done** | measured, see O16 |
| F15 | `do O13` | **Done** | `e34c0f3` |
| F16 | `tell me what o8 and o14 are` -> `Both` | **Done** | `5ba6da7`, `040f663` |
| F17 | `some character buffs dont have icons` | **Done** | `5ed4b85` |
| F18 | `reduce assist time to 6s` | **Done** | `eb300fb`, `c4c9566` |
| F19 | `buff needle. who is number 1?` / `where are puffball and leafy` | **Done** | `b7e7408`, `1edb60f` |
| F20 | `add my winrates` (`I have a 81% winrate on puffball ... over 100 matches`) | **Done** | `58a9f12`, bake `ff9417c` |
| F21 | `do em all. also teach them how to play trap kits` -- the AI lessons, Needle's second step, the music timeout | **Done** | `4ced1e2` |
| F22 | the last two of O19: Taco and Roboty | **Done** | `920d4c8` |
| F23 | the verdict: three runs a side, the floors, `--player` | **Done** | `15c2f0a` |
| F24 | the bake pipeline: pooled runs, the staleness test, the re-bake | **Done** | `ff9417c` |
| F25 | the AI special gap comment | **Done** | `f8b528c` |
| F26 | `skip 5, and then immediately tell me to do 5 with you` -- the relay | **Done** | `eda2644`: a Cloudflare Worker with a Durable Object per room at `wss://smash-island-relay.caradoc-kuperman.workers.dev/ws`, `npm run relay:live` 17/17 |

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

**F10 gave Golf Ball all three of the wiki's abilities.** Zap Shooter is her special (TPOT "I SAID
CAREFUL!!!"): a bolt at 15 px a frame that lives 90 frames and leaves at the height of the nearest foe
ahead of her, so a target on a ledge is as easy as one on the floor; 9 damage, a 12-frame stun, an
84-frame cooldown. Presence is her smash: the curse aura, unchanged in numbers, under the wiki's name.
The Announcer Crusher stop is her down-special: 28 frames braced, the next hit stopped dead and its
attacker shoved off her for 6 -- a wall, not the generic counter's 1.4x riposte. The old
weaken-the-nearest special and the hit-and-curse down-special are gone; key `debuff` is `zapshooter`
in every table and both applyHit payoffs. She was a 92% fighter in real 1v1 once and was trimmed for
it; the F11 pair is the first bracket with this kit.

**F12, F13 and F15 are the smash system's loose ends, closed in the order the LEDGER listed them.**
O17: Balloony's airleak pays cd 56 and Bubble's float cd 48 (42 and 36 frames at SMASH_CD_SCALE), the
golden's only change; through the real key path Balloony went from 22 smashes in ten seconds to 14
and Bubble from 22 to 17, against Coiny's 16 and Money's 13. O18: the 52 rows' `[tap, full]` pairs
are single numbers, the pattern functions no longer index by charge, and the six hand-written bodies
lost their c-terms with the full value held exactly -- the golden regenerated on the collapsed build
is byte-identical to the one before it. That proof had a hole: Money's Make It Rain is the one caller
of the pattern machinery that is not a row, and it ran the burst as the tap tier with its own
`[5.8,5.8]` pairs. Collapsed rows, uncollapsed caller: a string of two numbers went into applyHit,
two fighters sat at NaN,NaN where nothing could KO them, and map-generator's seeded cavern match ran
its full 12,000 frames. The suite caught it, a probe bisected it to the commit in four runs, and
`452e233` pins the row, the radius (74, as it always burst) and finite damage. The knobs `dmg.all` and `kb.all`
see decimals now (the rows join them; RANGE_PROFILE's tenth-precision rows had been invisible to the
sweep since F3), writing each literal back with its author's decimals so a scale of 1.0 stays a
no-op. O13: smash-charge asserts the 140 px row, the connect frame, the cooldown and the self-damage
at both distances, so the drift that motivated it cannot recur silently.

**F16.** O8: the relay test's describe says PARKED and an `it.todo` names the handshake test to write
once the worker is redeployed, so every run shows the gap instead of a green format check. O14 was
measured first: an AI Ice Cube threw 69% of every projectile in a 4-way FFA, thirty rings a minute
(six seeded matches, 18.8k frames). `AI_SPECIAL_HOLD` adds 240 frames to the AI's special gap for
her kit alone; the gap counts down from the cast alongside the cooldown, so her wait is the longer
of the two. After: 13.9 rings a minute, 108 projectiles a minute from 248, 43% of all projectiles.
Players keep the plain cooldown and no other kit's gap moved (asserted).

**F17 was an audit, then seven rows.** Every timed status on a fighter was read against the icon
table; seven had no row: Golf Ball's own Presence (the aura on her -- the skull is the victim's
stacks), the ice effect, Bubble's reform in hand, Puffball aloft, the boss's swallow, Pillow's
per-KO passive and the comeback bonus a comeback kit carries while it is behind. The last three
draw their count. Render-only like the rest; the checklist carries the five any fighter can hold,
and the two that depend on who holds them are checked on Pillow and on a comeback kit.

**F18.** ASSIST_DUR is six seconds, from twenty. The one-shot window (five seconds to find a moment)
and Black Hole's own three were already under it. Two assist tests stepped 600 and 400 frames and
read the assist afterwards -- at six seconds it had already left -- so they set their own tenure now;
they measure the climb and the walk, not the stay.

**F19.** Needle was 0-for-8 in six straight runs: everything she had was a stance and none of it
hurt. Her jab reaches like a needle now (12 px, three pricks of 2, from 6 px and 4.5); the Reflex
still takes a hit down to a quarter but puts 0.6 of it into the attacker as a prick, on a 90-frame
cooldown instead of 110; and the Riposte Stance, her smash, is where the full 1.4x hit back lives
-- one per stance, gone when it expires -- so the big punish is a committed read, as the owner's
earlier call intended. Measured after that step (seeds 1234 and 777 on `b7e7408`): 45th with one win in nine, then 59th at 0-for-8, a third of a KO a game -- so F21 launched her pin. After both steps, in the final three runs, 2-for-26 (7.7%), half a KO a game (O22). Number 1 on this balance, pooled over the four runs since F2:
Pencil at 48%, Remote 47%, Tennis Ball 46%. Leafy is 9th pooled over all six runs (33%), Puffball
50th (11%): the next Needle, if asked.

**F20 is the correction to every ranking above.** "what? I have a 81% winrate on puffball" -- over a
hundred matches, where the bot's Puffball sits at 11% pooled. The brackets are the AI piloting a
kit, and the AI never turns her movement vertical to win a chase, which is exactly how the owner
plays her. So the owner's numbers are a different table, and the game now keeps it: MY STATS lists
every fighter the player has held (the top-five cap hid the rest), the bot's bracket rate and rank
beside the player's own for the same fighter, and a Copy button that puts the table on the
clipboard as text -- the way those numbers reach this file. Two things follow. Puffball is not a
balance flag, whatever the bot says. And the bracket table baked into the game for World Cup
seeding was the old balance (Puffball 45%, Pencil 14% -- backwards against every run this session),
so it is re-baked from the pooled runs on the shipped build: `ff9417c`, three runs of eight tournaments on the shipped build (seeds 1234, 777, 4242; 1,776 fighter-games): Fries 51%, Rose 48%, Roboty 43%, mean 0.202, Sidewalky 0. Owner's record on file:
Puffball 81% over 100+ matches. The rest arrive when the Copy button is pressed.

**F21 taught the bot three things it never learned from its archetype.** `aiKitLessons` runs
before the class branches for every fighter, on reads and never on a timer, drawing no new random
number so planless matches keep their recorded sequences: a counter stance goes up while a foe's
swing is still coming (a smash charging, a circle winding up, an attack animation with the cooldown
fresh) within reach, for all eight counter kits; a down-special trap goes at the feet when a foe is
approaching or stunned at 70-260 px and never on top of one already laid, for all nineteen kits
whose down-special lays one; Puffball climbs to a foe above her once her jumps are spent, takes to
the air when a chase is being lost, and dives when she is over them. The trapper class no longer
lays on a coin flip anywhere: it lobs at range, drops when close, never onto a trap already near the
target. Needle's second step came with it -- her first left her 1-for-17 with a third of a KO a
game, so her up-special pin launches (4/10, kb 3/-14) and her pricks push (kb 6) -- and the music
test's double-boot case got 20 s after timing out at the 5 s default on every loaded run.

**F22 closed O19.** Taco: JAWBREAKER, from BFB 2-3 where she was stuck inside one -- a heavy bouncing
ball, whoever it hits rooted in it for 36 frames -- and HEATPROOF from the Character Guide's 1,000 C,
so a burn never ticks on her; salsa stays as her smash, plunge and trap. Roboty: ANTENNA SPRING, from
the Character Guide's line that his super-springy antenna gives his teammates lots of mobility --
foes on him go up and away, teammates go high with their jumps back, he gets a little lift -- with
morse kept as his smash and the armour stance kept because durability is canon too. Every kit's
attack is from the show now.

**F23 and F24 are the tooling.** The verdict refuses to be anything but "add runs" below three runs
a side and says what it would have read; it prints the measured floors (O16, balance-noise) with
every verdict; and `--player` takes the text MY STATS copies and prints the owner's record beside
the bot's, marking a fighter with 30+ human games as measured by the player. auto-balance's dead
band was already scaled from a measured 35pp swing and stays. `merge-rankings` pools runs into one
ranking file, `baked-ratings` fails the suite when the baked table names a file that is gone, disagrees
with it, or is older than the newest dated measurement on disk. `ff9417c` is the first bake through it: merge-rankings pooled the three final runs into `scripts/balance-ranking-2026-09-15-final.json`, and the test holds the table to that file.

**F11 and F14 are the two machine-time items.** Both ran in spare worktrees beside the batch, and both were restarted once after the O18 hole was found, so no number here comes from a build that could not finish a match. F11 is O21: two tournament runs on `d946b18`. F14 is O16: three A/B slates on the same build. The final three runs on `15c2f0a` (seeds 1234, 777, 4242; 384 matches) are O22, and are what `ff9417c` bakes: against the four runs before them, sigma 0.124 to 0.108 (-13%), P(tighter) 88%, still inside the interval, KOs a game 1.70 to 1.73.

---

## G · The 2026-09-15 and 2026-09-16 sessions

| | Task | Status | Landed in |
|---|---|---|---|
| G1 | `nerf smash charge time(make it longer for all "short" charge time characters) and reduce the time between specials` | **Done** | `8f73657` |
| G2 | `Change the up-specials to custom ones ... They should actually DO stuff. I like teardrop tho. Buff it slightly` | **Done** | `86e11a7`, `8f73657` |
| G3 | `momentum doesnt have a status icon, neither do effects on hit` | **Done** | `c11688c` |
| G4 | `ship, push, and merge all changes` | **Done** | pushed to `main` |
| G5 | `supervan can be shot in air but not on platforms ... do a check on specials and smashes to see if gravity and wording are changing my interntions` | **Done** | `ff96a87`; the audit's 41 bugs `306ee6d`, its 22 questions `8c22717` |
| G6 | `order the characters by appearance in the show. add the options of the main game to multiplayer.` | **Done** | `9e77a0d`, `25abf39` |
| G7 | `add attack descriptions to everything` (`Full lines like the smash`) | **Done** | smash lines `329d7bc`; the other six inputs `0f4b7dc` |
| G8 | `traps cant fall on platforms. also, traps should FALL, not appear.` | **Done** | `306ee6d` |
| G9 | `player 1 cant choose characters, or other settings` (`player 1 being the host`) | **Done** | `dcee25e` |
| G10 | `Smashes still feel overcomplicated and hard to use, especially against enemies with movetech. make instructions in the main menu clearer. if it says your gonna dash, the smash should make you dash, and if you connect, the effect and damage will apply.` | **Done** | `329d7bc` |
| G11 | The Cloudflare MCP server in Claude Code | **Yours** | it needs `/mcp` in an interactive `claude` session; the relay itself (F26) does not depend on it |
| G12 | `run the tournament. Anything that should be changed? ask questions in a question box. tell me about flags in that` | **Done** | 15 runs (6 before, 6 after, 3 tuned); four questions, the flags in them |
| G13 | `if you angle it, you can also wait and see when you come down and THEn fire it` | **Done** | `0f4b7dc` |
| G14 | Dash damage: `Wait for 6 runs, then decide` | **Done** | the drop did not hold (18.5% -> 18.2% over 6 runs a side); dashes unchanged |
| G15 | Roboty and Gelatin: `Tune both` | **Done** | `0f4b7dc` |
| G16 | The review of `329d7bc`: 32 confirmed findings | **Done** | `0f4b7dc` |
| G17 | `how many lines of code does this project have?` | **Answered** | 31,541: the game 15,721, tests 13,303, scripts 2,227, relay 290 |
| G18 | `Specials and smashes should have seperate cooldowns, and also attacks` | **Done** | this commit: X waits on atkCd, C on spCd, V on smCd, and none touches the others |
| G19 | `just do 15 matches for testing(this is the new "tournament")` | **Done** | `node scripts/balance-tournament.mjs quick`: every fighter once, 15 heats |
| G20 | Roboty: `Longer special cooldown` | **Done** | Antenna Spring about 1.5 s (spCd 70 -> 112) |
| G21 | `Probe and buff the bottom 4` | **Done** | Needle and Woody: the third jab launches (16, 14); Nickel jab reach 6 -> 14; Pillow's shockwave 7 -> 16. 15 probed matches each, same seeds |
| G22 | Finisher: `Its own cooldown` | **Done** | fnCd; and a drop smash no longer blocks a drop special (the last shared timer) |
| G23 | `check stuff for boss rush` | **Done** | `058b31b`: every boss hit 30 -> 22, the Dragon grab 22 -> 14, second attacks for every boss, a victory card after Four with an optional loop, the comeback bonus capped at 3 (Fries excepted), Screechy slower with wider gaps. Median cleared 1 -> 4 over 15 solo runs |
| G24 | `make a dlc: inanimate insanity` (batch 1) | **Done** | `325cd2c`: Knife, Balloon, Lightbulb, Paintbrush, Bomb, unlocked from the start in their own group on the board. No one from the OSC |
| G25 | `the hurtboxes and hitboxes should be their actual shape and size` -> `Both, traced from the art` | **Done** | `fa63e5f`: HURT_POLY traces every render into a 22-band outline; a jab is the fan an arm sweeps, a stab a capsule, a dash the attacker's own body, a beam a line. Rings stay round |
| G26 | `add the next set of 12 ii characters, based on canon` | **Done** | this commit: Taco (II), Bow, Marshmallow, Apple, Baseball, Pickle, Nickel (II), Paper, Microphone, Salt, Test Tube, and Pepper as Salt's partner. Researched against the wiki and checked by a second pass that threw out the invented canon |
| G27 | `you only gain 1 stock per 3 bosses` | **Done** | this commit: `BOSS_STOCK_EVERY`; the heal still comes every boss |
| G28 | `lightning needs a buff or rework` | **Done** | this commit. Measured first over 20 probe matches: she WINS 6 of 20, above the 20% a five-way field implies, so she was never weak -- she was one move. The chain did 3801 damage and 15 of her 16 KOs; her jab did 72 over 26 uses and her smash landed 3 times in 20 matches. So the chain's damage is untouched and the rest is fixed: jab reach 6 -> 12 and 3 -> 5 damage, the smash dash 8 -> 11 frames and reach 26 -> 31, the trap 5 -> 7, and a chain that finds nobody costs 22 frames instead of 74 |
| G29 | `I feel like she is really janky to play` -> `its cuz i stop moving after using any abilities` | **Done** | this commit. Reproduced: holding right after her up-special she runs at 8.96 and drops to 6.4 in ONE frame when the haste expires, key still held. Haste was a hard on/off switch on both the acceleration and the speed cap; both now ease off over the last 20 frames. Loser and Balloony had the same cliff. Two earlier probes -- distance travelled, and frames of lost control -- both said she was among the LEAST affected fighters, because neither could see a speed change mid-run |
| G30 | Lightning: `Chain hits the wrong person` | **Done** | the first link now takes a foe she is FACING and only turns round when there is nobody in front; the links after it still jump to the nearest, which is what a chain is |
| G31 | Lightning: `She gets hit right out of the teleport` | **Done** | warp invuln 6 -> 10. Six was the shortest of any teleport in the game; the others give 8, 10 and 18 |
| G32 | Knife: `an order to the abilities he uses from his bag of tricks`, `make knifes stuff move faster`, `an expanding ring at medium range for smoke bomb` | **Done** | a fixed rotation (smoke, blade, caltrops, hook) instead of a die roll; the blade 12 -> 17 and the hook 10 -> 15; the smoke is a ring that grows out to medium range instead of an instant hit inside 80px |
| G33 | `Bow's kit should have a bit more to do with her abilities as a ghost. this is for the special only` | **Done** | her special is POSSESSION, from the wiki's own description: marionette strings, "anything Bow does or says transfers to the possessed", and "it ends if she is distracted" (Kick the Bucket). The possessed mirror her and count as hers; the moment she is hit it ends, and what she was riding "destroys itself" on the way out (Let 'Er R.I.P.). Reuses the Outbreak puppet machinery rather than a new one. Everything else is still chairs |
| G34 | `bow shouldnt go higher in her up-special` | **Done** | the chair slam has no lift at all; her down special is the recovery. `power:0` used to fall through to the -13 default because 0 is falsy, so riseShape now treats 0 as a value |
| G35 | `marshmallow could be different. rethink her kit` | **Done** | the Wall-Mart list was mostly other people's purchases (the aluminium tree was Paintbrush's, the rowboat Paper's) and the time machine is the one thing canon says she CANNOT use once Apple tears her card. Rebuilt on what the wiki gives her: a scream that shattered Test Tube (17% against anything glass), fire that heals her (Knife roasted her into a s'more), poor gravity (she drifts), the mop she beat Apple with, and the boardwalk button. The launchpad stays |
| G36 | `maybe rework salt slightly` | **Done** | Pepper only ever echoed the special, so the jab and smash on Salt's card were false. She now echoes all three, and the down special |
| G37 | `peppers projectiles get blocked by salt, remove friendly fire blocking` | **Done** | a flying shot that met a teammate did nothing to them but was still consumed, so standing behind your own partner ate your shots. It passes through now. Traps already worked this way |
| G38 | `stocks only render on the hosts side for multiplayer, for others they get stuck at 3 visually` | **Done** | the snapshot always carried stocks; updateHUD only ran inside step(), and a client never runs step(), so every card on a client froze at its starting numbers (damage too). Clients refresh the HUD every frame now. Found with it: Infinity stocks arrived over JSON as null and drew nothing, and a client's cards could name the wrong CPU fighters, since it fills those slots at random -- the cards rebuild from the host's lineup |
| G39 | `do a balance pass and rework any flags. ask me questions abt the flags` | **Done** | three rounds, each measured on the same 24 seeds (every fighter 24 five-way games). Round 1: Leafy's dash hitbox shrunk and 12 -> 10 dmg (length untouched, as asked), Pickle's injury cap 45% -> 25%, Coiny's jab kb 9 -> 5, Paper's meter twice as fast plus a little when hit, smashes that land for Nickel, Dora and Taco. Spread 14.1% -> 11.5%, zero-win fighters 3 -> 0. Round 2: Pickle's smash kb 19 -> 14, landing-and-killing smashes for David, Ice Cube, Gelatin, Pillow and Dora, Dora's special two hard jabs instead of four soft ones, Pillow +3% a KO. Round 3: Pickle's dive 16 -> 11 and injury cap to 10%; Gelatin's hits shatter a frozen foe |
| G40 | `tacos smash should have something to do with Truth or Flare` | **Done** | AT WHAT COST?! -- her shell cracks under the stress and shatters, the vegetables go everywhere (Truth or Flare; the wiki's "first death"), a burst around her that costs her too. The lemon rain it replaced landed 2 times in 16 games |
| G41 | Marshmallow: perfect pitch and `halted right before hitting the spinning saw and flung back upwards` | **Done** | perfect pitch is RESONANCE: her scream also shatters the shots and traps in front of her. The gravity save is involuntary, once a stock: falling to a knockout, she is stopped and thrown back up (War De Guacamole) |

**G10 was measured before and after.** Every smash was pressed through the real keys against a dummy
that stood at 70 and 150 px, walked away, walked in from 300 px, walked past from 90 px, and hopped.
Before: 50 / 28 / 7 / 32 / 18 / 17 of 59 landed. Five things were in the way, and none of them were on a
screen. A dash did 30% of its number on contact and the real hit was a swing *behind* you after the
dash; a lunge was a 3 px nudge and one swing on the press frame; a hop was a fixed arc that landed
only on someone who stood still for the whole of it; four of the five falling smashes dropped at a
fixed spot; and a lunge with a sweet spot dealt 55% of its damage anywhere else. The input had a
mis-press floor that threw nothing and a hold that waited for the release, and the menu said
"hold V". After: 50 / 38 / 7 / 45 / 41 / 23, and not one smash lands less than its stated number.

What changed: press V once, and the smash goes off by itself when the charge is full (the owner's 24-32
frame charge is untouched); it turns to the nearest foe unless ← or → is held (Puffball's Meteor Puff
is not turned); a lunge moves you and hits the first foe it touches; a dash's contact is the whole
hit; a hop steers at the nearest foe and stomps; every falling smash seeks, with a volley starting on
the target; a sweet spot only changes the launch; Naily's dash contact is the 16 and the jab back the
7. A lunge stops at a ledge and a hop only steers at a foe over something it can land on. Tree's
TIMBER is the row it was. The move card names the kind (Lunge, Dash, Hop, Pull, Ring, Root & blast,
Roller, Beam, Drop, Trap), the reach, the damage and the effect, and How to Play explains the press,
the charge, the aim and all ten kinds -- readably, which the old light-on-light text was not.

Two bugs came out of it. A key held through a smash's own self-stun read as released on the stun's
last frame and came back as a new press: one hold, four smashes, for players and for the AI, which
holds nine frames past full. That one is why Ice Cube's AI hold test failed on the first run. And the
How to Play card grid was 470 px wide on a 375 px phone. Walking straight away at full speed from the
moment the key is pressed still escapes almost everything (7 of 59), and that is left alone: half a
second of charge is the owner's.

**G12 is the tournament and what it flagged.** Six runs of `8c22717` against six of `329d7bc` (seeds 1234, 777,
4242, 99, 2026, 31337): sigma 0.114 -> 0.106 (-7.2%, P(tighter) 73%, not conclusive), KOs a game 1.69 -> 1.70.
By smash kind the Beam (15.9% -> 24.0%) and Roller (20.1% -> 24.2%) rose with aim, Lunge rose (19.7% -> 22.3%),
the Shockwave (18.7% -> 13.5%) and Pull (28.6% -> 20.3%) fell back as everything else started landing, and the Dash
did not move (18.5% -> 18.2%), which is G14. Roboty (71.4% / 62.1%) and Gelatin (2.0% / 2.0%) sat at the two
ends on both builds, far outside the 20pp per-fighter floor, which is G15. The review workflow on `329d7bc` (four
lenses, each finding put to a skeptic) confirmed 32 findings, several found by more than one lens, and refuted 4; G16 is the fixes.

**G13: a charged smash waits.** Once the charge is full, holding ↑ or ↓ keeps it waiting (up to 1.5 s, SMASH_WAIT_MAX)
and letting go fires it at the angle that was held, so a smash can be carried through a jump and thrown on the way
down. The AI does not wait. The angle now belongs to the smash rather than to a 24-frame clock: it lasts as long
as the move that carries it (a lunge, dash, hop, wind-up, Naily's dash, Puffball's dive), and a drop, trap or
roller the smash threw carries its own, so a drop lands angled 45 frames after it was thrown. Before, ↑/↓ did
nothing to Drops, Traps, Tree's smash, the slower Hops and far Rollers, and the card's "hold ↑ to aim" made you
jump into a miss.

**G15: one change each, measured before it was chosen.** Forty instrumented 5-way matches per fighter credited every
point of damage and every knockout to the move that dealt it. Roboty: 154 of his 182 knockouts came from Antenna
Spring (a special scores 5% of everyone else's), used nine times a match and landing every time, 26 wins in 40. A
shorter reach (70 -> 30) only took him to 23; a softer launch (ANTENNA_FOE_VY -24 -> -16) took him to 19 and 2.9
KOs a match, and that is the change. Gelatin dealt normal damage (168 a match against 188) and took normal damage,
but scored 0.45 knockouts a match: every move she has launches weakly. The third syringe jab now launches
(RANGE_PROFILE multi.finalKb 18; tested 12, 16 and 20: 0.82, 1.27 and 1.70 KOs a match). Three tournament runs on
the tuned build: Roboty 62.1% -> 51.2% (still first; Ruler 45%), Gelatin 2.0% -> 17.2% and 0.31 -> 1.31 KOs a
game, the best-to-worst spread 60.1 -> 47.2 points, sigma not yet conclusive over three runs.

**G16: the review's findings, fixed.** Lunges and dashes had stopped hurting bosses, assists and turrets (the contact
check looked only at fighters); holding a direction during a hop sped it up without limit (Bubble reached 35 px a
frame and flew off the stage); aim turned dashes and hops toward a foe past a ledge, a dash had no ledge stop, and a
lunge that ended on the ground slid off one through its self-stun; aim ranked foes by horizontal gap only, so a foe on
a platform overhead won over one in front; a V press still held when a stun ended was dropped; the drop smashes could
drop nothing while the special's shared drop cooldown ran; a lunge's sweet spot could never be hit travelling in, so
"launches far" was false for the four hilt lunges; the easy AI threw two smashes a decision and every AI held V for nine
dead frames; the tutorial's smash step needed 28% on the dummy; a frozen fighter's charge still fired and moved it. The
words: Puffball's card said she rises (she dives), "freezes" left out that it needs 15% (40% for Gelatin), Drops and
Hops gave no reach, the van does not ride surfaces, "Ring" meant both the charge and a kind (the kind is Shockwave now),
the roller reach said the whole stage at 650 px, and How to Play pushed its buttons below the fold. Each has a test in
`test/smash-simple` that fails on `329d7bc`.

**G7: every move in words.** A workflow wrote one line for each of the 354 other inputs (59 fighters x X, ↓+X, C, ↑+C,
↓+C, X+C) from the move's code and a measurement of every move at 40, 110 and 220 px, and a second reader checked each
line against both and corrected 39. `test/move-text` measures every move again and holds each line's first-hit
number to what the move lands, and every "no hit:" line to landing nothing.

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

### O8 · `relay/` points at a dead server  [DONE: the test says so]

**Closed** in F16 (`5ba6da7`): the describe is marked PARKED and an `it.todo` names the missing handshake test. The relay itself is F26: `npx wrangler login` is the owner's step, the deploy and the test are mine once it is done.

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

### O13 · The golden fixture asserts only its 60px row  [DONE]

**Closed** in F15 (`e34c0f3`): every recorded column is asserted at 60 and 140 px.

`smash-charge` compares damage and launch at 60px. The fixture also records `atkCd`, `hitFrame`
and a 140px row, and three commits in a row moved them without a failure -- including a real
change in damage at range for seven fighters. Asserting the 140px row would have caught it.

### O14 · Ice Cube's special ring is the heaviest AI projectile source  [DONE]

**Closed** in F16 (`040f663`): the AI holds her ring 240 frames; 30 rings a minute became 14, her share of all projectiles 69% became 43%.

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

### O16 · The A/B harness has no noise floor  [MEASURED: 2026-09-14, three slates]

Three seed slates on `d946b18`, 24 paired matches each, arms x0.99 / x1.0 / x1.01 on `tick.buff`. The null arm reproduced its baseline byte for byte on every slate. A one-percent nudge moved roster spread by -6.8% / -22.1% (slate 20260902), +0.0% / +23.6% (424242) and +7.3% / -16.5% (777777), and pace by 3-12%, with the sign unstable across slates. That is the floor: a 24-match A/B reading inside +/-24% on spread and +/-12% on pace is noise (the harness itself flags 24 matches as thin, 1.6 per fighter). The verdict prints this with every verdict (F23); auto-balance's dead band was already scaled from a measured 35pp swing and stands.

Found by O6. `balance-ab` compares each arm against a baseline on the same seeds and calls the harness
sound when a x1.0 arm reproduces it -- which proves determinism, not signal. Any change to the source
reshuffles match outcomes, and at 60 matches a single-percent nudge to buff lengths moved roster spread
by up to 43%. Every sensitivity it reports, including O3's ranking, should be read against a x0.99 /
x1.01 floor measured the same way, and across more than one slate. Until then its rankings are
suggestions.

### O17 · Two smash rows pay no cooldown at all  [DONE]

**Closed** in F12 (`d18d830`): cd 56 and 48; cadence 22 -> 14 and 22 -> 17 in ten seconds.

Balloony's `airleak` ({back:3}) and Bubble's `float` ({self:6}) declare no `cd` and no `stun`, so the
only wait between their smashes is the flat 26-frame endlag: through the real key path they reach 22-23
smashes in ten seconds where everyone else sits at 11-16. Bubble pays 6% of her own health per throw,
which limits her; Balloony pays nothing. The gates audit flagged them as where spam returns first. A
`cd` in the band the other rows use (44-74, paid at 0.75x) would bring them in line; it is a design
call for those two fighters, not a bug.

### O18 · The tap tier in every SMASH_SPEC row is unreachable from input  [DONE]

**Closed** in F13 (`e34c0f3`, and `452e233` for the one caller outside the rows): the rows are single numbers, the golden is byte-identical.

`dmg:[tap, full]` and `kb:[tap, full]` are still authored in all 52 rows and asserted by the fixture's
tap/full ratio test, but since E18 no input path passes c=0 -- only direct calls in tests and probes do.
The balance harness's `dmg.tiered` knob scales both tiers together, so nothing is wrong; it is dead data
that a later pass could collapse to a single value, taking the ratio test with it.

### O19 · Which non-canon abilities to change  [DONE]

"if it doesnt make sense, change the ability." **Closed** in F22 (`920d4c8`): Grassy and Remote
(F9), Golf Ball (F10), Taco and Roboty (F22). Every kit's attack is from the show now: the jawbreaker
Taco was stuck in, the antenna Balloony used as a spring.

### O20 · The bottom eight's second tournament pair

F2's verdict is recorded above from two tournament pairs. Eight matches per fighter per run is still
thin at the bottom -- 0-for-8 is what a 128-match bracket says about a bad fighter AND about an
unlucky one -- so a fighter that stays at 0% across all four runs is real, and one that moves is
noise. Across the four runs only Needle never won a match. Bubble and Gelatin were 0-for-16 before the pass and won after it; Cake, Teardrop and Liy were 0-for-16 after it and had won before. Treat the multi-hit numbers as a first step sized to be safe (+15% to +40% on the
jab), not a finished balance.

### O21 · Grasstree and Battery Swap have no tournament yet  [MEASURED]

Two runs on `d946b18` (the build with the O18 hole closed), seeds 1234 and 777, against the F2 pair: sigma 0.132 to 0.125 (-5.0%), bootstrap 95% interval [-0.035, 0.022], P(tighter) 76%, KOs a game 1.71 to 1.70 -- not conclusive. Golf Ball 12th then 38th, Remote 17th then 2nd, Grassy 36th then 43rd; Bubble, 0-for-16 before F2, 4th in the first run; Needle 0-for-8 in both. The three-run measurement that followed (O22) is the fuller read, and the verdict script now refuses two-run pairs outright (F23).

The F2 verification pair ran on the balance of `c5a1654`, before F9. In its first run the old
Remote won 64.7% of her matches and two brackets, the best of anyone, with a signal bolt that no
longer exists; the new Remote is a strong throw with a 150-frame price, the new Grassy a stat buff
on a 90-frame cooldown, and neither has a bracket behind it. A pair of runs on the F9 build is the
next balance step; until then the win rates above describe a roster two fighters out of date.

### O22 · What the final three runs say, and why nothing was tuned on them

Three runs on the shipped build (`ff9417c`'s table), pooled: Fries 51%, Rose 48%, Roboty 43%, Donut
42%, Rocky 39% at the top; Sidewalky the only fighter with no win in all three. Two reads are
consistent across the runs and are not acted on, on purpose. Roboty went 3rd / 11th / 2nd with the
antenna spring -- a 70-frame-cooldown launch that also hits -- and Golf Ball went 50th / 52nd / 28th
with her three abilities, where the bot now raises her Crusher stance on reads and may be holding
it where a swing was the answer. Needle is 2-for-26 after both of her steps (pooled 7.7%, half a KO
a game), Puffball 34th / 42nd / 3rd with the flying reads, Leafy 42nd. Every one of these sits
inside the floors O16 measured, and the verdict script now refuses to call three runs conclusive
per roster; per fighter, eight to sixteen games a run is thinner still. The next balance step is
another three runs on the same build, not a knob: if Roboty and Golf Ball hold their places over
six, they are real.

---

## Scoreboard

| | Count |
|---|---|
| Done | 114 |
| Open | 2 (O20, O22) |
| Superseded | 2 (O1, B12) |
| Blocked on you | 1 (G11: the Cloudflare MCP authorization) |

Counted row by row: A1-A5, B1-B11, C1-C8, D1-D7, E1-E8, E10-E19, F1-F26, G1-G10, G12-G22, O3-O19 and O21.
Suite: **924 passed (80 files) on the shipped file, with G22**.
