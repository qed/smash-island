# Unique up and down smashes, batch 1 (for approval)

Design only. Nothing is built and no game file was changed. Written 2026-11-12 against `artifacts/V1/index.html` on ii-dlc.

## What this is

Today every fighter's up smash and down smash are made automatically from their neutral smash (`dirSmashSpec`): the up smash is always the same wide swing over the head, the down smash is always the same low sweep to both sides, with no effect. Only the name and the numbers change. This batch gives 12 fighters their own.

## The 12, and why these

Firey, Leafy, Needle, Pin, Snowball, Bomby, Bubble, Teardrop, Flower, Tennis Ball, Blocky, Coiny.

These are the first 12 rows of the roster (`ROSTER`): the original ten playable fighters plus the first two of the next group. I picked by roster order because **there is no data on who real players pick**. The game's counter only counts visitors, and the reports I found (`winrates.md`, `cpu-kit-usage.md`, `cup-batch-250.md`) measure CPUs, not people. If you would rather start with other fighters, say which.

## Rules I held to

- Damage and launch are at or under the fighter's current up/down smash, never over. Where a move adds an effect (burn, root and so on), the damage or launch is cut to pay for it.
- No move falls from the sky. Everything comes from the fighter's body or up out of the floor.
- Up smashes hit upward. Down smashes cover the floor on both sides.
- Start-up after the charge, recovery and cooldown stay what they are today unless the build note says otherwise.
- No hidden fighters are named or used.

Numbers are before the fighter's own damage setting (`statsFor().dmg`), the same way for old and new. "Launch" is the strength of the knock-away before the foe's % scales it. Sizes assume a normal-size fighter (radius 24).

## How the look-alike check was done (and its limits)

Event fighters' moves were included in the check but are not named in this report, in case they are not released yet.

I wrote the rule into a script before running it and did not loosen it afterwards: a look-alike is **same shape class AND same effect AND damage within 25% AND launch within 25%**.

Each of the 24 new moves was compared with:
- 978 tilt and aerial rows from 114 kits (everything in `MOVESETS`),
- the generated up smash and down smash of all 111 kits (222 moves),
- the other 23 new moves.

Result: **0 look-alikes for all 24**, after two changes the first run forced:
- Teardrop's up smash was first a plain flip kick. It matched six moves, mostly other fighters' generated up smashes. I changed it so she flips backward as she kicks.
- Tennis Ball's down smash was first a roll back and forth. It matched his own new up smash. I replaced it with Double Fault.

Limits you should know:
- **Neutral smashes** (111 rows) were compared by pattern, effect and numbers. None of the new moves uses a neutral-smash pattern (dash, hop, ring, beam, mine, pull, rolling shot), so none matches. The table below names the nearest neutral smash with the same effect.
- **Up specials** (about 105 rows) were read one by one, not scored. They are all recoveries that lift the fighter and do 3 to 13 damage, so none is near a smash on numbers. Tennis Ball's new up smash is the one that feels like one (see his table).
- **Neutral specials, down specials, finishers and Final Smashes** are hand-written code. I checked each of the 12 fighters' own ones by reading their move text. I did **not** check the new moves against the other 100 fighters' specials and finishers.
- Shape classes are coarse (for example "bar over the head", "column in front", "two low lines"). The script does not look at launch angle or timing.
- A move that hits several times was compared by its total damage, but existing multi-hit tilts were entered at one hit's damage.
- Seven of the new down smashes keep the same two-low-lines shape as today's generated down smash and differ by effect and numbers. Your rule allows that, but they will look familiar until they have their own art.

## Show sources: how sure I am

I had no way to check episodes here, so every source is from memory. 13 of the 24 moves are marked "invented": they come from what the object is, not from a scene. Please correct any source you know is wrong.

---

## Firey

| | Name | What it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up smash now | Rising Lunge | Wide swing over the head, launches up | none | 18.5 / 8.1 | generated |
| **Up smash NEW** | **Hang Glider Heave** | Snaps his hang glider open flat over his head. A wide bar high above him, to both sides. It does not hit anyone standing next to him. | none | 17.5 / 8.1, straight up | His hang glider, BFDI 25 "Return of the Hang Glider" (from memory) |
| Down smash now | Low Lunge | Low sweep both sides, sends them low and out | none | 17.2 / 7.6 | generated |
| **Down smash NEW** | **Scorched Earth** | A thin line of flame runs out along the floor both ways. A short hop clears it. | burn for 1 second (about 2.4 more damage) | 14.5 + burn = 16.9 / 6.6, low and out | invented (he is fire) |

- **Closest existing move:** Up: one event fighter's up-tilt is the only other bar over the head (6.2 damage, a combo starter; this is a 17.5 finisher). Down: today's generated down smashes (same shape, no burn); in his own kit, Fire Line (down-tilt) is a one-sided flame line for 3.6. Nearest burning neutral smash: Fries's oil ring (18, a ring, not a line).
- **Could it make him stronger?** The up smash is weaker on the ground (it misses foes beside him) and equal in the air. The down smash reaches the same distance as now, is thinner, and adds a burn with total damage just under today's. He was 15/15 in the win-rate run, so if anything trim the burn.
- **Build note:** two rows of data, `MvC` capsules, `msBurn(60)`. Glider needs a small drawn prop or it shows as the pose plus the hit streak.

## Leafy

| | Name | What it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up smash now | Rising Volley | Wide swing over the head, launches up | none | 15.8 / 11.7 | generated |
| **Up smash NEW** | **Leaf Twirl** | Twirls like a falling leaf. A disc over her head hits twice lightly, then a third hit launches. | none (three hits) | 4 + 4 + 7.2 = 15.2 / 10.5, straight up | invented (a leaf twirling) |
| Down smash now | Low Volley | Low sweep both sides | none | 14.8 / 11.0 | generated |
| **Down smash NEW** | **Leafy's Knives** | Two quick low knife jabs, one to each side. | bleed for 0.7 s (about 1 more damage) | 12 + bleed = about 13.1 / 9.7, low and out | BFDIA 5 "Get in the Van": Leafy throws knives at FreeSmart (from memory) |

- **Closest existing move:** Up: one event fighter's up-air is the only other multi-hit disc overhead (2.6 a hit). In her own kit, Leaf Spin (neutral-air) spins round her body, not above. Down: generated down smashes (no bleed); nearest bleeding neutral smash is Knife's Caltrops (17, a trap left on the floor).
- **Could it make her stronger?** The up smash only does full damage if all three hits land, so it is a little weaker than today's single hit. The bleed is new, paid for with 2.8 less damage and less launch.
- **Build note:** data only. The multi-hit uses a `rehit` box then a later box (as Pen's Click-Click does). Knives on kind Leafy are canon but dark: say if you would rather she swept with her leaf instead.

## Needle

| | Name | What it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up smash now | Rising Smash | Wide swing over the head | none | 9.7 / 7.2 | generated (her neutral smash is a stance with no hit) |
| **Up smash NEW** | **Don't Call Me Needy!** | One sharp rising slap, a narrow arc up and ahead. | stun, a third of a second | 8.2 / 6.3, up | The "Needy" slap, her running gag from BFDI season 1 (from memory) |
| Down smash now | Low Sweep Smash | Low sweep both sides | none | 9.0 / 6.8 | generated |
| **Down smash NEW** | **Stitch Down** | Stabs the floor on each side and stitches their feet to it. Short reach. | root, under half a second | 7.4 / 4.7, low | invented (a sewing needle) |

- **Closest existing move:** Up: Lightning's up-tilt Lightning Rod (an upward arc that stuns, 4.2 damage, launch 10.6: half the damage, far more launch). Coiny's up special Rising Backhand is also a stunning slap but is a hop. Down: generated down smashes (no root); Pin's down-air Pin Drop roots but is a dive from the air. Nearest rooting neutral smash: Dough's cage trap (18).
- **Could it make her stronger?** Yes, a little, and this is the one to watch. A stun or a root with a weak launch leaves the foe next to her, which sets up her three-prick jab. Damage and launch are both cut to pay for it. If it turns out too good, shorten the stun and root first.
- **Build note:** data only (`msFx('stun', 20)`, `msFx('root', 28)`). Narrower arc and shorter reach than today's.

## Pin

| | Name | What it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up smash now | Spring Trap | Wide swing over the head | none | 20.2 / 9.0 | generated |
| **Up smash NEW** | **Flat Top** | Bucks her wide flat head straight up. A round hit right above her only. | none | 19.5 / 9.0, straight up | invented (a thumbtack's flat head) |
| Down smash now | Floor Trap | Low sweep both sides | none | 18.9 / 8.5 | generated |
| **Down smash NEW** | **Point Spin** | Spins on her point like a top. One round hit at floor level on both sides at once, close in. | none | 18 / 8.4, low and out | invented (a pin spinning on its point) |

- **Closest existing move:** Up: 17 tilts and aerials are a plain disc overhead, the nearest on numbers being Cammy's Pop-Up Flash (8.5), under half the damage. Her own up-air and up special are thin stabs, not her head. Down: only the new Bomby and Bubble down smashes share the two-low-discs shape (24.5 and 9.2 damage).
- **Could it make her stronger?** No. Both cover less ground than today's (the up smash no longer hits in front, the down smash reaches about 58 px instead of 104).
- **Build note:** data only. The spin is two overlapping discs in one hit group so a foe is hit once and sent away from her.

## Snowball

| | Name | What it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up smash now | Skyburst | Wide swing over the head | none | 15.8 / 6.0 | generated |
| **Up smash NEW** | **Snow Pillar** | Punches the floor and a pillar of packed snow shoots up just in front of him. Nothing above or behind him. | none | 15 / 6.0, straight up | invented (it rises from the floor, it does not fall) |
| Down smash now | Floor Ring | Low sweep both sides | none | 14.8 / 5.6 | generated |
| **Down smash NEW** | **Temper Stomp** | Stamps in a rage. Snow sprays low to both sides and leaves them sliding. | slippery for about 1.2 s | 12.8 / 5.0, low and out | His temper (BFDI season 1, general); the move is invented |

- **Closest existing move:** Up: Ice Cube's up-tilt Ice Spike is the only other column in front (4.2 damage). His own up-air Snow Plume is a column straight above him (6.5). Down: generated down smashes (no effect); nearest slippery neutral smash is Toothpaste's puddle trap (15).
- **Could it make him stronger?** Slightly, on purpose it is small: he was one of the weakest ten. The pillar is taller than today's swing (about 100 px against 90) but only in front. The slide is mostly feel.
- **Build note:** data only (`msFx('ice', 70)`). The CPU asks for an up smash when a foe is above and within 90 px either side, so it will sometimes whiff the pillar on a foe directly overhead or behind.

## Bomby

| | Name | What it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up smash now | Rooted Uppercut | Wide swing over the head | none | 28.2 / 11.7 | generated |
| **Up smash NEW** | **Fuse Sparkler** | His fuse spits a tall narrow fountain of sparks straight up. | burn for 1.2 s (about 2.8 more damage) | 24 + burn = 26.8 / 10.5, straight up | His fuse being lit (BFDI season 1; episode not checked) |
| Down smash now | Rooted Sweep | Low sweep both sides | none | 26.2 / 11.0 | generated |
| **Down smash NEW** | **Backfire** | A small blast at his feet, both sides, close in. It costs him 3%. | none (he takes 3%) | 24.5 / 10.6, low and out | Blowing up hurts him too (BFDI season 1; episode not checked) |

- **Closest existing move:** Up: Match's forward-air Head Chop is the only other burning arc (6.2 damage). Pen's up-air Cap Launch has the same tall narrow cone with no burn (5). Down: the new Pin and Bubble down smashes share the shape (18 and 9.2). His own neutral smash and neutral special are full rings round him; this is only at the feet.
- **Could it make him stronger?** No. Both are under today's numbers, the fountain is narrower than the swing, and the down smash now costs him percent. He was 15/15 in the win-rate run, so these lean weak on purpose.
- **Build note:** data, plus a `start` hook on the row for the 3% (the hook exists). The fountain is a fan shape, which the game sweeps like a swing: it needs one `SW_EXC` pin (`'bomb.usmash':'thrust'`) so the whole fountain hits at once.

## Bubble

| | Name | What it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up smash now | Sky Hop | Wide swing over the head | none | 10.6 / 6.3 | generated |
| **Up smash NEW** | **Bubble Stack** | Blows three bubbles that pop one above the other, climbing. The top one launches. Tall and thin. | none (three hits) | 3 + 3 + 4.2 = 10.2 / 6.3, straight up | invented |
| Down smash now | Ground Pound | Low sweep both sides | none | 9.8 / 5.9 | generated |
| **Down smash NEW** | **Bubble Bounce** | A bubble pops at each side of her feet and bounces whoever is there straight up, not out. | none | 9.2 / 5.9, upward | invented |

- **Closest existing move:** Up: Blocky's up-tilt Block Pop (a disc overhead, 6.0 / 6.8) is the nearest on numbers, a single hit. Her own up-tilt Bubble Rise is one bubble ahead of her (3.8). Down: the new Pin and Bomby down smashes share the shape but send foes out; this one sends them up.
- **Could it make her stronger?** A little. The stack reaches higher than today's swing (about 114 px against 90) though it is only as wide as a bubble. Bubble Bounce pops foes up at a low launch, which can start a juggle. If that is too good, change the launch to low and out.
- **Build note:** data only: three discs live one after another, each its own hit group.

## Teardrop

| | Name | What it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up smash now | Rising Smash | Wide swing over the head | none | 9.7 / 7.2 | generated (her neutral smash has no hit) |
| **Up smash NEW** | **Speechless Backflip** | A silent backflip kick: her tail sweeps from in front, over her head, to behind, and she lands a step back. Sends them up and behind her. | none | 9.2 / 7.0, up and backward | invented (built on her silent kicks) |
| Down smash now | Low Sweep Smash | Low sweep both sides | none | 9.0 / 6.8 | generated |
| **Down smash NEW** | **Puddle Split** | Melts flat for a moment; a thin puddle shoots out both ways along the floor. | slow for 0.75 s | 7.8 / 5.4, low and out | invented (she is a drop of water) |

- **Closest existing move:** Up: **this is the closest of the 24 to today's generated up smash.** It is still an arc over the head with no effect and near-identical numbers. It passes the check only because she moves backward and the launch goes behind her. If that is not different enough for you, the simplest fix is to add a short slow ("soaked"). Down: Tissues's Snot Trail, Taco's Salsa Slide and Paintbrush's Paint Drag are slowing floor lines, but one-sided tilts for 3.8 to 4.6. Her finisher is also a puddle, but one that travels and erupts.
- **Could it make her stronger?** The backflip moves her about 40 px back, a small safe retreat. The slow is new and paid for with 1.2 less damage and less launch.
- **Build note:** data only (`mv` step for the flip, `msFx('slow', 45)`).

## Flower

| | Name | What it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up smash now | Sky Hop | Wide swing over the head | none | 20.2 / 4.2 | generated |
| **Up smash NEW** | **So Beautiful!** | Strikes a pose and her petals flare out round her head: a round hit above her and to both sides of her head. | stun, a quarter of a second (dazzled) | 17.5 / 4.2, straight up | Her vanity, BFDI season 1 (from memory) |
| Down smash now | Ground Pound | Low sweep both sides | none | 18.9 / 3.9 | generated |
| **Down smash NEW** | **Non-Slip Shoes, So Ha!** | A low spinning kick: the front first, then behind her a moment later. Whoever it catches trips. | knockdown (short) | 16.5 / 3.9, low | "I've got non-slip shoes, so ha!", BFDI 1 (from memory) |

- **Closest existing move:** Up: the new Pin up smash has the same disc-overhead shape with no stun and twice the launch; no existing tilt has a stunning disc overhead. Down: Blocky's Topple Back and Naily's Hammer Hook are low arcs with no knockdown (9.8 and 7.6). Her down special and neutral special are both stomps that shake the floor; this is a kick, and it hits one side at a time.
- **Could it make her stronger?** The pose covers both sides of her head where today's swing covers mostly the front, in exchange for 2.7 less damage and shorter forward reach. The trip is new, paid for with 2.4 less damage. Her launch is already the lowest of the 12, so neither is a kill move.
- **Build note:** data only. `msFx('knockdown', 16)` is new for a tilt-style row: the effect exists but no row uses it this way yet, so it needs a look when built.

## Tennis Ball

| | Name | What it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up smash now | Rising Smash | Wide swing over the head | none | 15.8 / 14.0 | generated |
| **Up smash NEW** | **Topspin Bounce** | Bounces himself straight up off the floor; his whole body is the hit. He is in the air afterwards. | none | 14.5 / 12.5, straight up | invented (he is a ball) |
| Down smash now | Low Sweep Smash | Low sweep both sides | none | 14.8 / 13.2 | generated |
| **Down smash NEW** | **Double Fault** | Bounces twice on the spot. Each bounce thumps the floor on both sides; the second one launches. | none (two hits) | 6.2 + 7.2 = 13.4 / 12.2, low and out | invented (the tennis term) |

- **Closest existing move:** Up: no tilt, aerial or generated smash has a body hit that carries the fighter upward. It does feel like a hop up special (for example Loser's or Basketball's, 5 to 9 damage); his own up special hops and lobs a ball instead. Down: nothing else is a two-hit low line; the nearest on numbers is Nickel's generated down smash (13.9 / 12.7, one hit).
- **Could it make him stronger?** The bounce gives a little height, like a small free hop, but he lands with the smash's full recovery. Double Fault needs both hits for full damage.
- **Build note:** data only (`mv` step with an upward speed; the runner already lets such a move carry on in the air).

## Blocky

| | Name | What it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up smash now | Rising Swing | Wide swing over the head | none | 21.1 / 9.0 | generated |
| **Up smash NEW** | **Funny Doings Pop-Up** | A boxing glove on a spring pops up out of the floor, slanting up and ahead of him. | controls reversed for two thirds of a second (pranked) | 18.5 / 8.5, up | Blocky's Funny Doings International, his prank ads in BFDI season 1 (from memory). The glove itself is invented. |
| Down smash now | Low Swing | Low sweep both sides | none | 19.7 / 8.5 | generated |
| **Down smash NEW** | **Whoopee Cushion** | Sits down hard on a whoopee cushion; a low blast of air goes out both ways. | weakened for 1.5 s (their hits do less) | 16.5 / 7.9, low and out | Funny Doings International in spirit; the cushion is invented |

- **Closest existing move:** Up: the new Snowball pillar and Ice Cube's Ice Spike are the other columns in front, neither with an effect. Nearest scrambling neutral smash: Roboty's three signal shots (17 / 8). Down: generated down smashes (no effect); nearest weakening neutral smash: Marker's rolling ink (20 / 7).
- **Could it make him stronger?** Two new effects, paid for with 2.6 and 3.2 less damage and shorter reach on the down smash (78 px against 104). Weaken for 1.5 s makes him a bit safer after a hit. If you want only one effect on him, drop the weaken.
- **Build note:** data only (`msFx('scramble', 40)`, `msFx('weaken', 90)`). Both want small drawn props.

## Coiny

| | Name | What it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up smash now | Rising Lunge | Wide swing over the head | none | 20.2 / 7.2 | generated |
| **Up smash NEW** | **Heads Up!** | Stands on his edge and stretches tall like a coin on its rim: a very thin, very tall hit from his feet to far above him. | none | 19 / 7.2, straight up | invented (a coin toss) |
| Down smash now | Low Lunge | Low sweep both sides | none | 18.9 / 6.8 | generated |
| **Down smash NEW** | **Penny Spin** | Drops and spins flat like a coin settling on a table: three quick hits round his feet, the last one launches. | none (three hits) | 5.3 + 5.3 + 5.6 = 16.2 / 6.8, low and out | invented (a spinning coin) |

- **Closest existing move:** Up: 68 tilts and aerials are a plain column upward, the nearest on numbers being Bot's Bridge Kick (8.2), Tree's Trunk Stretch (6.6) and Jack's Head Rise (7.8), all under half the damage. His own up-air Rising Slap is one of them at 3.9. Down: nothing else is a multi-hit disc at the floor; Nickel's neutral smash is also coin-themed but is a leap.
- **Could it make him stronger?** Heads Up! reaches higher than today's swing (about 110 px against 90) but is only 20 px wide. Penny Spin has less damage and much less reach than today's sweep.
- **Build note:** data only.

---

## What the build needs (all 12 together)

- **New code, small:** a table of own up/down smash rows per kit, and two lookups so `dirSmashSpec` and `dirSmashText` use a fighter's own row when it has one and the generated one when it does not. About ten lines. Everything else is row data in the format the tilts already use (`MvF`, `MvC`, `MvO`, `msFx`, `msBurn`, `rehit`, `mv`, `start`).
- **No new hitbox shapes and no new effect types.** Every effect used already exists in `SM_FX`.
- **Also to update:** the end-lag rows for `usmash`/`dsmash`, the frame-budget table, the move-list text, one `SW_EXC` pin (Bomby), the 12 fighter pages on the site, and the What's-new entry with per-fighter notes.
- **Art:** none of these has art yet. The poses are reused and the game draws the hit streak by itself. The glider, the knives, the snow pillar, the glove and the cushion would read much better with small drawn props.
- **Not done here:** nothing was run in the game, no matches were played, and nothing was seen on screen. The numbers are from reading the code. Reach and "does it hit a standing foe" are worked out from the shapes, not tested.

## Things I was unsure of

- Which fighters real players use most (no data exists; I used roster order).
- Every show source (from memory; 13 of 24 are invented).
- Teardrop's up smash is the weakest on "is it really different".
- Needle's two moves and Bubble Bounce are the likeliest to make a fighter stronger.
- How much a 1 to 1.5 second weaken, slide or reversed controls is really worth. I priced each at roughly 2 to 3 damage by feel, not by measurement.
- An older design report (`reports/updown-smash-design.md`) already lists an up and down smash idea for all 112 fighters under different rules (no effects, no show sources). I did not reuse it. At least one of its names is now a tilt name (Snow Heave), so it is out of date in places.

## Pick list (tick what you approve)

- [ ] Firey up: Hang Glider Heave  - [ ] Firey down: Scorched Earth
- [ ] Leafy up: Leaf Twirl  - [ ] Leafy down: Leafy's Knives
- [ ] Needle up: Don't Call Me Needy!  - [ ] Needle down: Stitch Down
- [ ] Pin up: Flat Top  - [ ] Pin down: Point Spin
- [ ] Snowball up: Snow Pillar  - [ ] Snowball down: Temper Stomp
- [ ] Bomby up: Fuse Sparkler  - [ ] Bomby down: Backfire
- [ ] Bubble up: Bubble Stack  - [ ] Bubble down: Bubble Bounce
- [ ] Teardrop up: Speechless Backflip  - [ ] Teardrop down: Puddle Split
- [ ] Flower up: So Beautiful!  - [ ] Flower down: Non-Slip Shoes, So Ha!
- [ ] Tennis Ball up: Topspin Bounce  - [ ] Tennis Ball down: Double Fault
- [ ] Blocky up: Funny Doings Pop-Up  - [ ] Blocky down: Whoopee Cushion
- [ ] Coiny up: Heads Up!  - [ ] Coiny down: Penny Spin
