# Unique up and down smashes, v2 redesign (12 fighters, for approval)

Design only. Nothing is built, no game file was changed, nothing was run or seen on screen. Written 2026-11-12 against `artifacts/V1/index.html` on ii-dlc. Replaces `unique-up-down-smashes-batch1.md` (v1).

Fighters: Firey, Leafy, Needle, Pin, Snowball, Bomby, Bubble, Teardrop, Flower, Tennis Ball, Blocky, Coiny.

## What changed from v1

- **No down smash keeps the two-low-lines shape.** All 12 have a new outline (see the shape table at the end).
- **Teardrop's up smash is replaced** (it was an arc over the head, like today's).
- 15 of the 24 moves are new; 9 keep their v1 idea, most with a new shape (marked "v1 idea kept").
- Sources: 10 of 24 are tied to a show gag, 2 are partly (Snowball down, Blocky down), 12 are "invented" from what the object is. All show sources are **from memory**; I could not check episodes here. Please correct any that are wrong.

## Rules held to

- Up smash hits upward. Down smash covers the floor or both sides.
- Nothing falls from the sky. Everything comes from the fighter or up out of the floor.
- Damage and launch are at or under today's for every move. Where a move reaches somewhere today's does not, it is flagged under "Could it make them stronger?".
- No hidden fighters are named. Event fighters are not named.
- The whole move (start + live + end) is never shorter than today's.

## How to read the numbers

- Numbers are before the fighter's own damage setting, same for old and new. "Launch" is the knock-away strength before the foe's % scales it.
- Sizes are pixels for a normal-size fighter (radius 24). x is forward, y is down (negative y is up). The fighter's feet are at about y = +24.
- Today's generated moves, for comparison: up smash = one wedge over the head reaching 90 px, start 5, live 4. Down smash = two low lines reaching 104 px each side, start 4, live 5. End = `20 + round(D*0.45)`.
- Frames count from the press, as in the tilt rows. `g` is the hit group (one hit per foe per group).

## Shared build (all 12)

- **New code A, own-row lookup (about 10 lines):** a table `DSM_OWN = { kit: { up:{...}, down:{...} } }` of rows in the tilt row format (`n, d, pose, st, act, end, land, ac, smash:true, boxes, mv, start`). `dirSmashSpec` returns `DSM_OWN[sp][up?'up':'down']` when it exists, else the generated row. `dirSmashText` reads the same row. `dirSmash` (cooldown, end-lag arm, sound) is unchanged. `DSM`, `DSM_K` and `DSM_NAMES` stay as they are for the other 100 fighters.
- **New code B, `rad` box flag (about 6 lines in the strike code):** a box with `rad:K` launches the foe straight away from the fighter's centre with strength K (a small upward floor so a grounded foe lifts). Used by Bomby down, Bubble down, Coiny down. Without it those need a left box and a right box each.
- **Sweep rule:** the comment above `SW_EXC` says smashes are untouched by the swing sweep, but these rows run through the tilt runner. I did not confirm which applies. If the sweep does run on `usmash`/`dsmash`, every fan here that is not a swing needs an `SW_EXC` pin to `'thrust'` (listed per move).
- **Size:** `mvShape` already scales row shapes by the fighter's size, so fixed pixel numbers are fine.
- **Also to update:** end-lag rows and frame-budget table for `usmash`/`dsmash`, move-list text, the 12 fighter pages, the What's-new entry with per-fighter notes.
- **Art:** each move lists its props. Without them the game draws only the pose and the hit streak, and several of these shapes will not read.

---

## Firey

| | Name | Shape and what it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up now | Rising Lunge | wedge over the head | none | 18.5 / 8.1 | generated |
| Up v1 | Hang Glider Heave | flat bar high overhead | none | 17.5 / 8.1 | |
| **Up v2** | **Hang Glider Heave** | He snaps his hang glider open over his head: a wide **arrowhead** (two wings sloping down from a nose), high up. The nose hits hardest. Misses anyone standing beside him. | none | nose 17.5 / 8.1, wings 14.5 / 7.8 | His hang glider, BFDI 25 "Return of the Hang Glider" (from memory). v1 idea kept, reshaped. |
| Down now | Low Lunge | two low lines | none | 17.2 / 7.6 | generated |
| Down v1 | Scorched Earth | two low flame lines | burn | 16.9 / 6.6 | |
| **Down v2** | **Twin Torches** | Two tongues of flame shoot **up and out from his feet in a V**. Close to him they are at the floor; at their ends they are at head height. | burn 1 s (about 2.4) | 14.5 + burn = 16.9 / 6.7, up and out | invented (he is fire) |

- **Closest existing moves:** Up: nothing in the tilt rows is two boxes mirrored left and right of the fighter (my search of one-line `boxes:` rows found none). His own neutral-air Flame Wheel is an arc round his head for 4.4. Down: his up-tilt Ember Column is one slanting column ahead for 4.4; his finisher is jets straight up along the floor ahead. Neither is a V on both sides.
- **Could it make him stronger?** Up: no. It misses grounded foes beside him, which today's hits. Down: mixed. Floor reach drops from 104 px to about 75, but the V ends catch a foe short-hopping beside him, which today's does not. He was 15/15 in the win-rate run; if in doubt, cut the burn to 0.7 s.

**BUILD SPEC, up (`ember.up`)**: `pose:'uppercut', st:5, act:4, end:29, land:12, ac:999, smash:true`
- nose: `{ s:MvO(0,-92,14), g:'a', dmg:17.5, kb:[0.8,-8.1] }` (listed first, so it wins)
- wings: `{ s:MvC(0,-90, 62,-62, 10), g:'a', dmg:14.5, kb:[2.6,-7.4] }` and `{ s:MvC(0,-90, -62,-62, 10), g:'a', dmg:14.5, kb:[-2.6,-7.4] }`
- Prop: a red-and-yellow triangular glider, nose at (0,-92), wingtips at (±62,-62), drawn on the live frames, folding away over 6 frames.

**BUILD SPEC, down (`ember.down`)**: `pose:'kick', st:4, act:5, end:29, smash:true`
- `{ s:MvC(10,20, 66,-30, 12), g:'df', dmg:14.5, kb:[4.6,-4.8], fx:msBurn(60) }` and the mirror `{ s:MvC(-10,20, -66,-30, 12), g:'db', dmg:14.5, kb:[-4.6,-4.8], fx:msBurn(60) }`
- Prop: two flame tongues along the capsules, reuse the Ember Column flame art, mirrored.

## Leafy

| | Name | Shape and what it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up now | Rising Volley | wedge over the head | none | 15.8 / 11.7 | generated |
| Up v1 | Leaf Twirl | 3-hit disc overhead | none | 15.2 / 10.5 | |
| **Up v2** | **Knife Toss** | Flings two knives, one up-left and one up-right: a **Y with a gap straight above her**. A foe directly overhead and more than about 50 px up is not hit. | bleed 0.7 s (about 1.1) | 12.6 + bleed = 13.7 / 10.5, up and out | BFDIA 5 "Get in the Van": Leafy throws knives at FreeSmart (from memory; I am not sure of the episode) |
| Down now | Low Volley | two low lines | none | 14.8 / 11.0 | generated |
| Down v1 | Leafy's Knives | two low knife jabs | bleed | 13.1 / 9.7 | |
| **Down v2** | **Falling Leaf** | Sways down like a falling leaf: a **U-shaped swing** that starts behind her, dips under her feet and comes up in front. The back half is a light hit that carries the foe under her; the front half launches. Always sends them the way she faces. | none (2 hits) | back 5 + front 9.2 = 14.2 / 10.3; a foe in front takes only 9.2 | invented (how a leaf falls) |

- **Closest existing moves:** Up: two existing rows are bands of a wedge (inner radius 30), both single arcs ahead, neither split in two. Her own up-tilt Leaf Whip is a wedge for 3.5. Down: her finisher also carries foes forward, but it travels 350 px and hits four times for 2. No tilt row has a back box and a front box.
- **Could it make her stronger?** Up: weaker straight overhead (blind spot), stronger at catching foes coming in diagonally, plus a small bleed paid for with 2.1 less damage. Down: weaker in front (9.2 against 14.8). New: it throws foes behind her forward, so she picks the side they fly to. That helps near a ledge. Small, but real.
- **Knives on kind Leafy:** canon but dark. If you would rather not, the same Y works as two leaf blades with no bleed at 13.7 damage.

**BUILD SPEC, up (`dash.up`)**: `pose:'throw', st:5, act:4, end:28, smash:true`
- `{ s:MvC(14,-22, 64,-82, 6), g:'a', dmg:12.6, kb:[3.2,-10.0], fx:msFx('bleed',42) }` and the mirror `{ s:MvC(-14,-22, -64,-82, 6), g:'a', dmg:12.6, kb:[-3.2,-10.0], fx:msFx('bleed',42) }`
- Prop: two small knives drawn travelling along the capsules over the 4 live frames.

**BUILD SPEC, down (`dash.down`)**: `pose:'spin', st:4, act:7, end:26, smash:true` (live frames 4 to 10; the move is 37 frames, today's is 37)
- back half: `{ s:MvC(-70,-6, -22,22, 13), t0:4, t1:6, g:'a', dmg:5, kb:[3.4,-1.6], stun:14 }` (kx is positive: it pushes them forward, under her)
- front half: `{ s:MvC(22,22, 70,-6, 13), t0:7, t1:10, g:'b', dmg:9.2, kb:[9.0,-5.0] }`
- Needs a look when built: whether a foe hit by the back half reliably reaches the front half.
- Prop: a green swoosh along the U; her body tilts with it.

## Needle

| | Name | Shape and what it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up now | Rising Smash | wedge over the head | none | 9.7 / 7.2 | generated |
| Up v1 | Don't Call Me Needy! | narrow arc up and ahead | stun 1/3 s | 8.2 / 6.3 | |
| **Up v2** | **Don't Call Me Needy!** | The slap, swung from straight ahead up to straight overhead: a **thin crescent at arm's length**, a quarter circle in front of her. Nothing behind her. | stun 1/3 s | 8.2 / 6.3, up and away | The "Needy" slap, her running gag in BFDI season 1 (from memory, confident). v1 idea kept, reshaped. |
| Down now | Low Sweep Smash | two low lines | none | 9.0 / 6.8 | generated |
| Down v1 | Stitch Down | two short low lines | root | 7.4 / 4.7 | |
| **Down v2** | **Double Stitch** | Stabs the floor and two needles come **up through the floor, one each side**, like a stitch coming up through cloth: two thin tall spikes 52 px away. They pop foes upward. A foe pressed right against her is not hit. | bleed 0.7 s (about 1) | 7.6 + bleed = 8.6 / 6.3, upward | invented (a sewing needle) |

- **Closest existing moves:** Up: Lightning's up-tilt Lightning Rod is also an upward arc that stuns (4.2 damage, launch 10.6). The crescent's hole near her is small (a foe closer than about 22 px), so in play this is a front quarter-arc, not a new idea of area. It is the least reshaped move in v2; the slap is too much her to drop. Down: Ice Cube's Ice Spike and Pin's up moves are single spikes; none is a pair flanking the fighter.
- **Could it make her stronger?** Up: yes, a little, same as v1. A stun with a weak launch leaves the foe near her three-prick jab. If too good, shorten the stun first. Down: the root is gone (v1's biggest worry). New worry: a weak upward pop next to her can lead into her up-air. Reach is 83 px against 104, with a blind spot inside about 21 px.

**BUILD SPEC, up (`counter.up`)**: `pose:'uppercut', st:5, act:4, end:25, smash:true`
- `{ s:MvF(46, 72, -1.65, -0.15, -4, 0), dmg:8.2, kb:[3.6,-5.2], fx:msFx('stun',20) }`
- It is a real swing, so the sweep (low to high) is right; no pin.
- Prop: none needed beyond a hand streak; a small "!" over the foe on hit.

**BUILD SPEC, down (`counter.down`)**: `pose:'stompdn', st:4, act:5, end:25, smash:true`
- `{ s:MvC(52,26, 52,-44, 7), g:'df', dmg:7.6, kb:[1.2,-6.2], fx:msFx('bleed',40) }` and the mirror at x = -52 with `kb:[-1.2,-6.2]`, `g:'db'`
- Prop: two grey needle tips rising out of the floor with a loop of thread between them.

## Pin

| | Name | Shape and what it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up now | Spring Trap | wedge over the head | none | 20.2 / 9.0 | generated |
| Up v1 | Flat Top | round hit right above her | none | 19.5 / 9.0 | |
| **Up v2** | **Flat Top** | Bucks her wide flat head upward with a small hop: a **low, flat, wide plate** just over her that rises with her. Wider than she is, but low. | none | 19.5 / 9.0, straight up | invented (a thumbtack's flat head). v1 idea kept, reshaped. |
| Down now | Floor Trap | two low lines | none | 18.9 / 8.5 | generated |
| Down v1 | Point Spin | round hit at floor level, close | none | 18 / 8.4 | |
| **Down v2** | **Wobbling Top** | Spins on her point like a top and **wanders**: 30 px forward, 60 back, 30 forward to where she began. Her spinning body is the hit: a light hit on the way out, a light hit on the way back, and the last leg launches. | none (up to 3 hits) | 5 + 5 + 8 = 18 / 8.0 | invented (a tack spun on its point) |

- **Closest existing moves:** Up: 17 tilt rows are a plain disc overhead (v1 count). This is a flat bar 80 px wide that moves up with her, 34 px over her centre, not a disc. Her own up-tilt Hop and Point uses the same hop but is a thin spike. Firey's new glider is also wide, but high, sloped and still. Down: one existing row goes out and back (an event fighter's no-hit dodge). Tennis Ball's new down smash also moves him, but in two hops to two landing spots.
- **Could it make her stronger?** Up: no. It tops out about 70 px up against 90, and no longer hits in front. Down: no on damage (18 needs all three legs; one leg is 5 or 8). The move is 5 frames longer than today's. Watch: she moves during it, so near a ledge she can slide off, and the game then ends the move in the air.

**BUILD SPEC, up (`pierce.up`)**: `pose:'uppercut', st:5, act:4, end:30, land:12, ac:999, smash:true`
- `{ s:MvC(-40,-34, 40,-34, 9), dmg:19.5, kb:[0,-9.0] }`
- `mv:[{ t0:5, t1:5, mode:'set', vy:-4.5 }]` (the same hop as her up-tilt; the runner lets a lifting move carry on in the air)
- Prop: none; her own head is the plate. A flat white streak over it.

**BUILD SPEC, down (`pierce.down`)**: `pose:'spin', st:4, act:20, end:20, smash:true` (44 frames; today's is 39)
- `mv:[{ t0:4, t1:8, mode:'set', vx:6 }, { t0:9, t1:18, mode:'set', vx:-6 }, { t0:19, t1:23, mode:'set', vx:6 }, { t0:24, t1:24, mode:'set', vx:0 }]` (the last step stops the slide, as the existing out-and-back row does)
- `{ s:MvO(0,10,34), t0:4, t1:8, g:'a', dmg:5, kb:[2.2,-2.4], stun:16 }`
- `{ s:MvO(0,10,34), t0:9, t1:18, g:'b', dmg:5, kb:[-2.2,-2.4], stun:16 }`
- `{ s:MvO(0,10,34), t0:19, t1:23, g:'c', dmg:8, kb:[7.2,-3.6] }`
- Prop: none; spin lines round her and a scratch mark on the floor.

## Snowball

| | Name | Shape and what it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up now | Skyburst | wedge over the head | none | 15.8 / 6.0 | generated |
| Up v1 | Snow Pillar | column in front, from the floor | none | 15 / 6.0 | |
| **Up v2** | **Snowman** | Slams two more snowballs onto his own head: a **snowman**, wide at the bottom and small at the top. The small top ball hits hardest. Straight up only. | none | head 15 / 6.0, middle 13 / 5.6 | invented (he is the bottom ball) |
| Down now | Floor Ring | two low lines | none | 14.8 / 5.6 | generated |
| Down v1 | Temper Stomp | two low snow sprays | slippery | 12.8 / 5.0 | |
| **Down v2** | **Roll Out** | Stamps in a rage and a snowball **rolls away from him on each side, growing as it rolls**. Small and weak beside him, big and strong at the end of its run. Each foe is hit once. | slippery 1.2 s, far ball only | near 9, middle 11.5, far 13.5 / 5.0 | His temper (BFDI season 1, general); the growing snowball is the "snowball effect" saying. The move is invented. |

- **Closest existing moves:** Up: v1's pillar matched Ice Cube's up-tilt Ice Spike in shape; this does not. His own up-air Snow Plume is a plain column (6.5). Bubble's new up smash is also discs overhead, but one bubble that grows over time and hits three times. Down: his finisher also rolls a growing snowball, but one, forward, with a foe packed inside. No tilt row has boxes that move outward on both sides.
- **Could it make him stronger?** Slightly, and he was one of the weakest ten. Up: reaches 107 px up against 90, but is only as wide as he is. Down: reaches 108 px against 104, but the far ball arrives 6 frames later than today's hit, and a foe beside him takes 9 instead of 14.8. It rewards spacing, which is new for him.

**BUILD SPEC, up (`tackle.up`)**: `pose:'uppercut', st:5, act:4, end:28, smash:true`
- head: `{ s:MvO(0,-92,15), g:'a', dmg:15, kb:[0.4,-6.0] }` (first), middle: `{ s:MvO(0,-52,24), g:'a', dmg:13, kb:[0.4,-5.6] }`
- Prop: two white snowballs stacked on him, the top one with a carrot nose; they crumble on the end frames.

**BUILD SPEC, down (`tackle.down`)**: `pose:'stompdn', st:4, act:9, end:24, smash:true` (37 frames, same as today)
- each side, one group (`'df'` / `'db'`), mirrored in x:
- `{ s:MvO(30,14,12), t0:4, t1:6, dmg:9, kb:[4.5,-2.1] }`
- `{ s:MvO(58,10,17), t0:7, t1:9, dmg:11.5, kb:[4.5,-2.1] }`
- `{ s:MvO(86,4,22), t0:10, t1:12, dmg:13.5, kb:[4.5,-2.1], fx:msFx('ice',70) }`
- Prop: a snowball each side drawn rolling from x = 30 to 86 and growing from radius 12 to 22, leaving a snow trail.

## Bomby

| | Name | Shape and what it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up now | Rooted Uppercut | wedge over the head | none | 28.2 / 11.7 | generated |
| Up v1 | Fuse Sparkler | tall narrow fountain | burn 1.2 s | 26.8 / 10.5 | |
| **Up v2** | **Fuse Sparkler** | His fuse spits a **thin jet with a ball of sparks at the top**, like a lit sparkler. Narrow all the way; the hit is one. | burn 1.2 s (about 2.8) | 24 + burn = 26.8 / 10.5, straight up | His fuse being lit, as Firey does to him (BFDI season 1; episode not checked). v1 idea kept. |
| Down now | Rooted Sweep | two low lines | none | 26.2 / 11.0 | generated |
| Down v1 | Backfire | small blast both sides of his feet | he takes 3% | 24.5 / 10.6 | |
| **Down v2** | **Backfire** | A blast under him: **one low dome** hugging the floor, centred on him, 66 px each way. It throws foes straight away from him. It costs him 3%. | none (he takes 3%) | 24.5 / 10.6, away from him | Blowing up hurts him too (BFDI season 1; episode not checked). v1 idea kept, reshaped. |

- **Closest existing moves:** Up: Pen's up-air Cap Launch is a tall narrow shape with no burn (5 damage); Match's Head Chop is a burning arc (6.2). Coiny's new up smash starts as a thin line but turns into a wide disc. Down: his neutral smash, neutral special and neutral-air are full rings round his whole body; this is flat on the floor and does not reach above his waist. Coiny's, Bubble's and Teardrop's new down smashes are also centred on the fighter (see the shape table for how they differ).
- **Could it make him stronger?** No. Both are under today's numbers. The sparkler reaches 118 px up against 90 but is 44 px wide against about 128. The dome reaches 66 px against 104 and costs him percent. He was 15/15 in the win-rate run, so these lean weak on purpose.

**BUILD SPEC, up (`bomb.up`)**: `pose:'uppercut', st:5, act:4, end:34, smash:true`
- `{ s:MvO(0,-96,22), g:'a', dmg:24, kb:[0.5,-10.5], fx:msBurn(70) }` and `{ s:MvC(0,-30, 0,-72, 11), g:'a', dmg:24, kb:[0.5,-10.5], fx:msBurn(70) }`
- No fan, so no sweep pin (v1 needed one).
- Prop: a yellow spark jet from the fuse tip with a crackling star at the top.

**BUILD SPEC, down (`bomb.down`)**: `pose:'slam', st:4, act:5, end:34, smash:true`
- `start:(f) => { f.pct += 3; }` (the `start` hook exists in `mvStart`; use whatever his Light My Fuse uses to charge himself so the same rules apply)
- with new code B: `{ s:MvC(-36,18, 36,18, 30), dmg:24.5, rad:10.6 }`
- without it: `{ s:MvC(4,18, 36,18, 30), g:'a', dmg:24.5, kb:[9.3,-5.0] }` and `{ s:MvC(-4,18, -36,18, 30), g:'a', dmg:24.5, kb:[-9.3,-5.0] }`
- Prop: a flat orange blast dome and soot on his feet.

## Bubble

| | Name | Shape and what it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up now | Sky Hop | wedge over the head | none | 10.6 / 6.3 | generated |
| Up v1 | Bubble Stack | three bubbles popping one above the other | none | 10.2 / 6.3 | |
| **Up v2** | **Blow-Up** | Blows one bubble over her head that **swells in three steps**, small, medium, big, then pops. Each step is a light hit; the pop launches. | none (3 hits) | 3 + 3 + 4.2 = 10.2 / 6.3, straight up | invented (blowing a bubble) |
| Down now | Ground Pound | two low lines | none | 9.8 / 5.9 | generated |
| Down v1 | Bubble Bounce | a bubble pops at each side of her feet | none | 9.2 / 5.9 | |
| **Down v2** | **Oh Noio!** | She pops. The pop is a **thin ring that spreads outward from her** in three steps, weaker the further it gets. It throws foes straight away from her. She is not untouchable while popped. | none | inner 9.2, middle 8, outer 6.5 / 5.9, away from her | Her popping and her "Oh noio!", all through BFDI and BFB (from memory, confident on the gag) |

- **Closest existing moves:** Up: Blocky's up-tilt Block Pop is the nearest disc overhead on numbers (6.0 / 6.8, one hit). Her own up-tilt Bubble Rise is one bubble ahead (3.8) and her up-air Float Up one overhead (3.6); neither grows or hits more than once. Down: her up special is also a pop, but she vanishes and reappears high with a drip falling; this stays put and is a ring. Bomby's neutral-air Blast Ring is a filled disc round him (5.6); this is hollow and moves.
- **Could it make her stronger?** A little. Up: the biggest bubble tops out 104 px up against 90. Down: the ring also reaches above her (74 px at its widest, for 6.5), so it is a weak anti-air that today's down smash is not. Side reach is 74 px against 104. If the overhead cover is too much, make the ring only its lower half.

**BUILD SPEC, up (`float.up`)**: `pose:'uppercut', st:5, act:9, end:20, smash:true` (34 frames, same as today)
- `{ s:MvO(0,-42,14), t0:5, t1:7, g:'a', dmg:3, kb:[0,-1.5], stun:14 }`
- `{ s:MvO(0,-54,24), t0:8, t1:10, g:'b', dmg:3, kb:[0,-1.5], stun:14 }`
- `{ s:MvO(0,-68,36), t0:11, t1:13, g:'c', dmg:4.2, kb:[0.6,-6.3] }`
- Prop: one bubble drawn growing through the three sizes, then a pop burst.

**BUILD SPEC, down (`float.down`)**: `pose:'spin', st:4, act:6, end:24, smash:true` (34 frames, same as today). **Needs new code B (`rad`).**
- one group `'a'`, three full-circle bands:
- `{ s:MvF(14,34, -3.14,3.14, 0,0), t0:4, t1:5, g:'a', dmg:9.2, rad:5.9 }`
- `{ s:MvF(32,54, -3.14,3.14, 0,0), t0:6, t1:7, g:'a', dmg:8, rad:5.9 }`
- `{ s:MvF(50,74, -3.14,3.14, 0,0), t0:8, t1:9, g:'a', dmg:6.5, rad:5.9 }`
- Not confirmed: that a fan from -3.14 to 3.14 hits as a full ring, and that its inner radius is honoured. Existing fans only go up to about half a circle. If not, build each band from a front and a back half. Sweep pin: `'float.dsmash':'thrust'` if the sweep applies.
- Draw: her body is hidden on frames 4 to 9 and fades back in over the end frames (drawing only; her hurtbox stays).
- Prop: a spreading soap-film ring with droplets.

## Teardrop

| | Name | Shape and what it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up now | Rising Smash | wedge over the head | none | 9.7 / 7.2 | generated (her neutral smash has no hit) |
| Up v1 | Speechless Backflip | arc over the head, she lands a step back | none | 9.2 / 7.0 | |
| **Up v2** | **Dot Dot Dot** | An empty speech bubble pops up over her head and its three dots appear one at a time: **three small hits in a row, side by side**, back, middle, front. The last dot launches. | none (up to 3 hits) | 3 + 3 + 3.2 = 9.2 / 7.0, up | She cannot talk: her whole character in BFDI and BFB (confident on the gag; the speech bubble is invented) |
| Down now | Low Sweep Smash | two low lines | none | 9.0 / 6.8 | generated |
| Down v1 | Puddle Split | two thin low puddle lines | slow | 7.8 / 5.4 | |
| **Down v2** | **Down the Drain** | Melts into a whirlpool. The hit **starts far out on both sides and closes in on her**, dragging foes toward her, then a splash in the middle pops them up. | none (up to 3 hits) | 2.6 + 2.6 + 3.6 = 8.8 / 5.4, pulled in, then up | invented (she is water). Her finisher is also a puddle. |

- **Closest existing moves:** Up: no tilt row has three boxes, and none is a row of dots (my search of one-line rows found no row with three or more boxes; rows written over several lines were not searched). This answers v1's weak spot: it is not an arc and not one hit. Down: no tilt row pulls foes toward the fighter from both sides. Her finisher's puddle travels to the foe and erupts once; this drags the foe to her.
- **Could it make her stronger?** Up: weaker. It tops out 77 px up against 90 and a foe off to one side meets only one or two dots. Down: damage and launch are under today's, the slow is gone, reach is 88 px against 104. **But the pull is a new kind of power**: it brings foes to her, and can drag one back from a ledge or into a teammate's hit. The middle splash sends them up and away again so she does not get a free follow-up, but this is the one to watch for her.

**BUILD SPEC, up (`kick.up`)**: `pose:'uppercut', st:5, act:7, end:22, smash:true` (34 frames, same as today)
- `{ s:MvO(-30,-64,13), t0:5, t1:6, g:'a', dmg:3, kb:[0.8,-1.2], stun:14 }`
- `{ s:MvO(0,-64,13), t0:7, t1:8, g:'b', dmg:3, kb:[0.8,-1.2], stun:14 }`
- `{ s:MvO(30,-64,13), t0:9, t1:11, g:'c', dmg:3.2, kb:[0.8,-7.0] }`
- Prop: a white speech bubble outline over her head, tail pointing at her, with three dark dots filling in one by one. No sound on the first two (she is silent); a soft pop on the third.

**BUILD SPEC, down (`kick.down`)**: `pose:'slam', st:4, act:9, end:21, smash:true` (34 frames, same as today)
- `{ s:MvO(72,16,16), t0:4, t1:6, g:'a', dmg:2.6, kb:[-3.2,-1.0], stun:14 }` and mirror `{ s:MvO(-72,16,16), t0:4, t1:6, g:'a', dmg:2.6, kb:[3.2,-1.0], stun:14 }` (kx points at her)
- `{ s:MvO(44,16,16), t0:7, t1:9, g:'b', dmg:2.6, kb:[-2.6,-1.0], stun:14 }` and mirror at x = -44 with `kb:[2.6,-1.0]`
- `{ s:MvO(0,8,34), t0:10, t1:12, g:'c', dmg:3.6, kb:[1.5,-5.2] }`
- Needs a look when built: whether a pulled foe arrives in time for the next step.
- Prop: a blue spiral on the floor shrinking toward her, then a short splash.

## Flower

| | Name | Shape and what it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up now | Sky Hop | wedge over the head | none | 20.2 / 4.2 | generated |
| Up v1 | So Beautiful! | round hit above and beside her head | stun 1/4 s | 17.5 / 4.2 | |
| **Up v2** | **So Beautiful!** | Strikes a pose and her petals flare: **five separate petals in a half-ring** over her head, like a crown. One hit. It just clears a foe standing beside her. | stun 1/4 s (dazzled) | 17.5 / 4.2, straight up | Her vanity, "I'm so beautiful", BFDI season 1 (from memory, confident on the gag). v1 idea kept, reshaped. |
| Down now | Ground Pound | two low lines | none | 18.9 / 3.9 | generated |
| Down v1 | Non-Slip Shoes, So Ha! | low kick, front then back | knockdown | 16.5 / 3.9 | |
| **Down v2** | **So Ha!** | Plants her non-slip shoes and **shoves with both hands, one to each side, at chest height**. Short reach. It pushes them away flat along the floor, not up, and they slide. | slippery 0.8 s | 16.5 / 3.9, flat and out | BFDI 1 "Take the Plunge": she shoves others off the balance beam and says "I've got non-slip shoes, so ha!" (from memory) |

- **Closest existing moves:** Up: her own up-tilt Pollen Bloom is one disc up and ahead that scrambles (5.4), her up-air Petal Pop a wedge (5.9). Nothing in the tilt rows is five boxes. Pin's new Flat Top is a flat bar at half this height with no effect. Down: her down special and neutral special are stomps that shake the floor; this is hands, not feet, and it is not on the floor at all. Bubble's back-air and forward tilt are single discs at this height on one side.
- **Could it make her stronger?** Up: the half-ring covers both sides of her head where today's wedge leans forward; paid for with 2.7 less damage. The outer petals end 3 px above a standing foe's head, which is tight: if a build shows them clipping grounded foes, raise them. Down: reach is 66 px against 104 and damage is 2.4 lower. **Flag: a flat launch is better near a ledge than today's low-and-out one**, because it pushes a foe off the stage low. Her launch (3.9) is the lowest of the 12, which limits it. If it is too good, tilt it up a little (`kb:[3.6,-1.5]`).

**BUILD SPEC, up (`quake.up`)**: `pose:'uppercut', st:5, act:4, end:30, smash:true`
- five discs, all `g:'a', dmg:17.5, kb:[0.3,-4.2], fx:msFx('stun',15)`: `MvO(0,-74,13)`, `MvO(30,-64,13)`, `MvO(-30,-64,13)`, `MvO(52,-40,13)`, `MvO(-52,-40,13)`
- Prop: five big pink petals at those spots and a sparkle; her own petals fold down for the live frames.

**BUILD SPEC, down (`quake.down`)**: `pose:'punch', st:4, act:5, end:30, smash:true`
- `{ s:MvO(46,-4,20), g:'df', dmg:16.5, kb:[3.9,-0.4], fx:msFx('ice',50) }` and mirror `{ s:MvO(-46,-4,20), g:'db', dmg:16.5, kb:[-3.9,-0.4], fx:msFx('ice',50) }`
- Prop: two open hands; a small "non-slip" tread flash under her shoes. The rig has one punch arm: the back hand needs drawing.

## Tennis Ball

| | Name | Shape and what it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up now | Rising Smash | wedge over the head | none | 15.8 / 14.0 | generated |
| Up v1 | Topspin Bounce | bounces himself straight up; his body is the hit | none | 14.5 / 12.5 | |
| **Up v2** | **Topspin Bounce** | Squashes flat, then **bounces himself straight up about 50 px**; his whole body is the hit, only on the way up. He comes down with a landing lag. | none | 14.5 / 12.5, straight up | invented (he is a ball). v1 idea kept. |
| Down now | Low Sweep Smash | two low lines | none | 14.8 / 13.2 | generated |
| Down v1 | Double Fault | two bounces on the spot, low lines both sides | none | 13.4 / 12.2 | |
| **Down v2** | **Double Fault** | Two bounces: a short one that **lands 36 px in front**, then a long one **back over where he stood to land 36 px behind**. Each landing thumps a round patch of floor under him. The second is the strong one. He ends behind where he started. | none | front landing 10 / 9.0; back landing 13.4 / 12.2 | invented (the tennis term: two bad bounces) |

- **Closest existing moves:** Up: no tilt or generated smash is a body hit that carries the fighter up. It does feel like a hop up special; his own up special hops and lobs a ball, and it is usable in the air, which this is not. Down: Pin's new Wobbling Top also moves the fighter, but along the floor, out and back to the start, hitting the whole way. This hits only where he lands, in two spots, and does not bring him back.
- **Could it make him stronger?** Up: a small free hop, ground only, so it is no help getting back to the stage. Down: a foe on one side takes one landing, 10 or 13.4 against today's 14.8. A foe knocked forward by the first cannot normally be reached by the second, but **if both ever land that is 23.4, over today's 14.8**; I do not expect it but could not test it. It also moves him 36 px back, a small retreat. The move is about 5 frames longer than today's.

**BUILD SPEC, up (`serve.up`)**: `pose:'uppercut', st:5, act:6, end:26, land:14, ac:999, smash:true` (37 frames, same as today)
- `mv:[{ t0:5, t1:5, mode:'set', vy:-8 }]` (with `GRAV` 0.62 that is about 52 px of rise; I did not check whether fighters have their own gravity)
- `{ s:MvO(0,-6,30), t0:5, t1:10, dmg:14.5, kb:[0.4,-12.5] }`
- Prop: none; a squash on the start frames and a spin on the way up.

**BUILD SPEC, down (`serve.down`)**: `pose:'slam', st:4, act:24, end:14, smash:true` (42 frames; today's is 37)
- `mv:[{ t0:4, t1:4, mode:'set', vy:-3.1 }, { t0:4, t1:13, mode:'set', vx:3.6 }, { t0:16, t1:16, mode:'set', vy:-3.1 }, { t0:16, t1:25, mode:'set', vx:-7.2 }, { t0:26, t1:26, mode:'set', vx:0 }]`
- front landing: `{ s:MvO(0,16,34), t0:13, t1:15, g:'a', dmg:10, kb:[7.6,-4.8] }`
- back landing: `{ s:MvO(0,16,34), t0:25, t1:27, g:'b', dmg:13.4, kb:[-10.8,-5.7] }`
- **Timing is worked out on paper** (a hop of vy -3.1 is in the air about 10 frames at `GRAV` 0.62). The builder must check the landings fall on frames 13 and 25 and move the windows if not. If that is fiddly, the fallback is a small new hook, "box goes live on the frame the fighter lands" (about 8 lines in `mvTick`).
- Near a ledge he can bounce off the stage; the runner lets a lifting move carry on in the air, so the move would finish as he falls.
- Prop: none; a dust ring at each landing.

## Blocky

| | Name | Shape and what it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up now | Rising Swing | wedge over the head | none | 21.1 / 9.0 | generated |
| Up v1 | Funny Doings Pop-Up | glove on a spring, slanting up and ahead | controls reversed 2/3 s | 18.5 / 8.5 | |
| **Up v2** | **Funny Doings Pop-Up** | A boxing glove on a spring pops out of the floor ahead of him, **slanting up and forward: a thin spring with a fat glove on the end**. The glove is the real hit and the only part that pranks; the spring is a weak hit. Nothing straight above him. | glove only: controls reversed 2/3 s | glove 18.5 / 8.5; spring 14 / 7.2 | Blocky's Funny Doings International, his prank ads in BFDI season 1 (from memory, confident on the ads). The glove itself is invented. v1 idea kept, with a sweet spot. |
| Down now | Low Swing | two low lines | none | 19.7 / 8.5 | generated |
| Down v1 | Whoopee Cushion | low blast of air both ways | weakened 1.5 s | 16.5 / 7.9 | |
| **Down v2** | **Snakes in a Can** | Cracks open a prank can at his feet and a spring snake **leaps out to each side in an arch**: up to head height, then down to the floor 84 px away. The rising half comes first, the falling half a moment later. | none | 17.5 / 8.0, up and out | Funny Doings International in spirit; the can is invented |

- **Closest existing moves:** Up: Ice Cube's up-tilt Ice Spike is a column in front with no effect (4.2); with Snowball's pillar gone from v2, nothing else new is a slant from the floor. Roboty's neutral smash is the nearest scrambling smash (17 / 8, three shots). Down: no tilt row is an arch, and none has two boxes per side. His down special is a trap that waits; this is instant.
- **Could it make him stronger?** Up: one new effect, paid for with 2.6 less damage; it cannot hit a foe straight above him, so it is a worse anti-air than today's. Down: v1's weaken is dropped, so he gains only one effect in all. **Flag: the arch is taller than today's low lines** (it reaches about 55 px up), so it catches short hops beside him; floor reach is about 93 px against 104 and damage is 2.2 lower. The gap under the arch is for looks only: a normal-size fighter does not fit in it.

**BUILD SPEC, up (`anvil.up`)**: `pose:'uppercut', st:5, act:4, end:31, smash:true`
- glove (first): `{ s:MvO(58,-62,18), g:'a', dmg:18.5, kb:[2.6,-8.1], fx:msFx('scramble',40) }`
- spring: `{ s:MvC(34,24, 52,-40, 8), g:'a', dmg:14, kb:[1.5,-7.0] }`
- CPU note (from v1, still true): the CPU asks for an up smash when a foe is above and within 90 px either side, so it will whiff this on a foe overhead or behind.
- Prop: a red boxing glove on a zigzag spring coming out of a small floor hatch at x = 34.

**BUILD SPEC, down (`anvil.down`)**: `pose:'slam', st:4, act:6, end:30, smash:true` (40 frames; today's is 40)
- each side one group (`'df'` / `'db'`), mirrored in x:
- rise: `{ s:MvC(12,-6, 44,-46, 9), t0:4, t1:6, dmg:17.5, kb:[6.6,-4.6] }`
- fall: `{ s:MvC(44,-46, 84,14, 9), t0:7, t1:9, dmg:17.5, kb:[6.6,-4.6] }`
- If the sweep applies, pin both to `'thrust'` or reword so the row has no swing words.
- Prop: a striped can at his feet and two green spring snakes following the arches.

## Coiny

| | Name | Shape and what it does | Effect | Damage / launch | Source |
|---|---|---|---|---|---|
| Up now | Rising Lunge | wedge over the head | none | 20.2 / 7.2 | generated |
| Up v1 | Heads Up! | very thin, very tall line | none | 19 / 7.2 | |
| **Up v2** | **Heads or Tails** | Flips on the spot like a tossed coin. Edge-on first: **a very thin, very tall line**. Then face-on: **a wide round disc, but short**. One hit; the thin early part is the strong one. | none | edge 19 / 7.2; face 16 / 6.6, straight up | invented (a coin toss). It is not random: the same every time. |
| Down now | Low Lunge | two low lines | none | 18.9 / 6.8 | generated |
| Down v1 | Penny Spin | three quick hits round his feet | none | 16.2 / 6.8 | |
| **Down v2** | **Penny Spin** | Drops and spins flat like a coin settling on a table: **a round patch at his feet that shrinks with each wobble**, three quick hits, the last one throws them away from him. | none (3 hits) | 5.3 + 5.3 + 5.6 = 16.2 / 6.8, away from him | invented (a spinning coin). v1 idea kept; the shrinking is new. |

- **Closest existing moves:** Up: 68 tilt rows are a plain column upward (v1 count), all under half the damage; his own up-air Rising Slap is one (3.9). The change of shape halfway is what sets this apart; no row I read changes shape during the move. Down: his neutral-air Slap Spin is a multi-hit disc round his body in the air (2.9 a hit); this is on the floor and shrinks. Nickel's neutral smash is coin-themed but is a leap.
- **Could it make him stronger?** Up: no. The line reaches 108 px up against 90 but is 16 px wide, and the disc is as wide as today's wedge only at half the height. Down: no. Reach is 50 px against 104 and full damage needs all three hits.

**BUILD SPEC, up (`slap.up`)**: `pose:'spin', st:5, act:6, end:28, smash:true` (39 frames, same as today)
- edge: `{ s:MvC(0,-20, 0,-100, 8), t0:5, t1:7, g:'a', dmg:19, kb:[0.3,-7.2] }`
- face: `{ s:MvO(0,-50,36), t0:8, t1:10, g:'a', dmg:16, kb:[0.3,-6.6] }`
- Prop: his own body drawn stretched thin and tall on frames 5 to 7, then as a big gold coin face on 8 to 10. Needs a squash-and-stretch draw step; if the rig cannot, draw a large coin over him.

**BUILD SPEC, down (`slap.down`)**: `pose:'spin', st:4, act:11, end:24, smash:true` (39 frames, same as today)
- `{ s:MvO(0,14,50), t0:4, t1:6, g:'a', dmg:5.3, kb:[0.6,-1.2], stun:14 }`
- `{ s:MvO(0,16,44), t0:8, t1:10, g:'b', dmg:5.3, kb:[0.6,-1.2], stun:14 }`
- `{ s:MvO(0,18,38), t0:12, t1:14, g:'c', dmg:5.6, rad:6.8 }` (new code B; without it, split into a front and a back disc with `kb:[±5.8,-3.6]`)
- Prop: his body drawn flat and wobbling, with a ring-of-metal sound that speeds up.

---

## All 24 shapes side by side

| Fighter | Up smash shape | Down smash shape |
|---|---|---|
| Firey | arrowhead, wide and high | V of flame rising from the feet |
| Leafy | Y, with a gap straight overhead | U-swing, back to front, sends forward |
| Needle | thin crescent, front quarter | two thin spikes up through the floor, one each side |
| Pin | low flat plate that rises with a hop | she wanders out and back, body is the hit |
| Snowball | snowman (taper stack) | balls rolling outward, growing |
| Bomby | thin jet with a ball on top | one low dome under him, costs him 3% |
| Bubble | one bubble swelling in 3 steps | thin ring spreading outward |
| Teardrop | three dots in a row, one at a time | hit closes inward and pulls, then a splash |
| Flower | five petals in a half-ring | two hands at chest height, flat shove |
| Tennis Ball | his body, bouncing up | two landings: in front, then behind |
| Blocky | slanted spring with a glove on the end | two arches |
| Coiny | thin line, then a wide disc | round patch that shrinks, 3 hits |

Honest notes on "different":
- Four down smashes are centred on the fighter (Bomby, Bubble, Teardrop, Coiny). They differ by motion: still, spreading out, closing in, shrinking with three hits. In a still picture Bomby's and Coiny's look alike.
- Three down smashes move the fighter (Pin, Tennis Ball, and Leafy's is a swing that does not). Pin slides and returns; Tennis Ball hops and does not return.
- Needle's up smash is the least changed in area (see her section).
- Leafy's Y and Blocky's arch have gaps that are real for Leafy (overhead) and for looks only for Blocky.

## How the look-alike check was done (and its limits)

The rule: a look-alike needs the same shape AND the same effect AND numbers within about 25%. I did not loosen it. I also did **not** re-run v1's script; this check was done by reading, so it is weaker than v1's in coverage and should be re-run by script on the built rows.

What I compared each new move with:
- every tilt, aerial and side row of these 12 fighters (read in full, shapes and numbers);
- the special, up special, down special and finisher text of these 12;
- today's generated up and down smash (by construction: none of the 24 is a single wedge or two low lines);
- the other 23 new moves (table above).

Against the other 100 or so kits I only ran four coarse searches of the one-line `boxes:` rows (560 rows): fans with an inner radius of 30 or more (2 found, both single arcs), rows with three or more boxes (0 found), rows with a box on each side of the fighter (0 found), rows that push the fighter one way then the other (1 found, a no-hit dodge). Rows written across several lines, neutral smashes, specials and finishers of the other kits were **not** checked in v2. v1's counts (17 discs overhead, 68 columns upward) are quoted from v1, not recounted.

Result within those limits: no look-alike found for any of the 24.

## Where a fighter could get stronger (all flags in one place)

| Fighter | Flag |
|---|---|
| Firey | down: V catches short hops beside him (burn kept) |
| Leafy | down: always throws foes the way she faces |
| Needle | up: stun next to her jab (same as v1). down: weak upward pop near her |
| Pin | none on numbers; she moves during the down smash |
| Snowball | up 17 px taller; down 4 px longer and rewards spacing |
| Bomby | up 28 px taller but much narrower |
| Bubble | up 14 px taller; down also reaches overhead |
| Teardrop | **down pulls foes to her: a new kind of power** |
| Flower | **down launches flat: better near a ledge** |
| Tennis Ball | up is a small ground-only hop; down could reach 23.4 if both landings ever hit one foe |
| Blocky | up reverses controls; down arch is taller than today's lines |
| Coiny | none |

No move has more damage or more launch per hit than today's. What I could not judge without playing: how much the pull, the flat launch, the stun and the taller shapes are worth. I priced effects at about 2 to 3 damage each by feel, as v1 did.

## New code needed

- A: own-row lookup, about 10 lines (all 12).
- B: `rad` launch flag, about 6 lines (Bomby down, Bubble down, Coiny down). Optional: each has a no-new-code fallback except Bubble's ring, which needs a front half and a back half per step.
- Bomby: 3% self-damage in a `start` hook, 1 line.
- Bubble down: hide her body for 6 frames, drawing only, a few lines.
- Coiny up: stretch-and-face draw step, or a drawn coin prop.
- Tennis Ball down: only if frame-timed landings prove fiddly, a "live on landing" hook, about 8 lines.
- Possibly `SW_EXC` pins (Bubble down, Blocky down) if the swing sweep applies to these rows.
- Everything else is row data: `MvF`, `MvC`, `MvO`, `msFx`, `msBurn`, `t0/t1`, `g`, `mv`, `start`. No new effect types.

## Things I was unsure of

- Every show source is from memory. Least sure: the episode for Leafy's knives, and the episodes for Bomby's fuse.
- Whether a full-circle fan with an inner radius hits as a ring (Bubble down).
- Whether the swing sweep runs on up/down smash rows.
- Tennis Ball's and Pin's movement timing, and what happens to both at a ledge.
- Whether multi-step moves chain (Leafy down, Teardrop down, Bubble up, Coiny down): the light hits use `stun:14`, a guess.
- Current damage and launch figures are taken from v1. I re-derived the end-lag from them and spot-checked Leafy's against `SMASH_SPEC`; I did not recheck all 12.
- Nothing was run, played or seen. Reach and "does it hit a standing foe" are worked out from the shapes on paper.

## Pick list (tick what you approve)

- [ ] Firey up: Hang Glider Heave (arrowhead)  - [ ] Firey down: Twin Torches
- [ ] Leafy up: Knife Toss  - [ ] Leafy down: Falling Leaf
- [ ] Needle up: Don't Call Me Needy!  - [ ] Needle down: Double Stitch
- [ ] Pin up: Flat Top  - [ ] Pin down: Wobbling Top
- [ ] Snowball up: Snowman  - [ ] Snowball down: Roll Out
- [ ] Bomby up: Fuse Sparkler  - [ ] Bomby down: Backfire (dome)
- [ ] Bubble up: Blow-Up  - [ ] Bubble down: Oh Noio!
- [ ] Teardrop up: Dot Dot Dot  - [ ] Teardrop down: Down the Drain
- [ ] Flower up: So Beautiful!  - [ ] Flower down: So Ha!
- [ ] Tennis Ball up: Topspin Bounce  - [ ] Tennis Ball down: Double Fault
- [ ] Blocky up: Funny Doings Pop-Up  - [ ] Blocky down: Snakes in a Can
- [ ] Coiny up: Heads or Tails  - [ ] Coiny down: Penny Spin
- [ ] New code B (`rad` launch flag) is OK to add
- [ ] Leafy keeps knives (untick for leaf blades, no bleed)
