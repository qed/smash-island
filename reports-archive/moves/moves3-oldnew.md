# Moves 3: old against new (branch g-moves3, 2026-11-15)

Built on the worktree `.worktrees/moves3` (branch `g-moves3`, from ii-dlc a70b7ce3, plus the three v2 smash branches). Not pushed, not merged. The live relay was never touched.

How to read the numbers: damage is what a foe takes in a match (the smash damage you see, the row times 1.5 where the doc gave raw rows), launch is the strength of the throw. "Old" is the build you had on the preview (ii-dlc + the three v2 branches) unless it says "live".

Everything below was measured on the built game with a scripted dummy foe (hits, damage, launch) unless it says "not measured".

## Step 0: the three v2 branches merged
g-updsm, g-nsv2 and g-fsv2 merged into g-moves3. Conflicts: `docs/LEDGER.md` (kept both) and one line in index.html (`drawDsmProps` and `drawNsvProps` both kept). syncheck 0 failed, bootcheck clean.

## Step 1: your v2 picks

| Fighter | Move | Old (preview) | New | Numbers (old -> new) |
|---|---|---|---|---|
| Leafy | up smash | Leaf Blades: two blades in a Y | **Yoyleland Knife**: one thrown knife, steep slant, thin line about 100 px, bleed 0.7 s | 13.7 (+0 bleed) -> 12.6 + bleed (measured 12.6 on hit, 13.5 with the bleed), launch 10.5 -> 10.5 |
| Snowball | up smash | Snowman: three stacked balls | **Up You Go**: both fists from chest to overhead in front; throws the foe up and BEHIND | 15 -> 15, launch 6.0 -> 5.9 (measured 4.1 against 3.6 before; both are well under the live 15.8 / 6.0 one) |
| Bomby | down smash | Backfire: a burning dome, costs him 3% | **Stamp It Out!**: front stamp 5, back stamp 5, then both 9 (a foe on one side 14, pressed against him 19); no burn, costs him nothing | 22 -> 19 at most, launch 10.6 -> 9.5 (measured 7.1 and 6.6) |
| Firey Jr. | main smash | Hot Foot: a dash through the foe | **Tantrum Flare**: on his back, four fast low kicks: 3, 3, 3, then 9 and burn on the last | 18 -> 18, launch 9 -> 9.0 (measured 7.3: the first three kicks hold the foe) |
| Baseball | Final Smash | Home Run: runs the bases | **Ground Pound**: rocks 40 frames, lands; crater 130 px each side: 18, thrown up and out; the rest of the floor within 400 px: 4 and knocked down; air untouched | live 18 to everyone within 700 px -> crater only. Measured (match damage x2 as in a Final Smash): foe at 60, 150: 36; at 250, 350: 8; airborne: 0 |
| Pickle | Final Smash | Loads of Experience: crosshair | **Loads of Experience**: a starting block, then a low racing dive 260 px ahead (never more than 60 px up), body hit 6, splash at the landing 18 | 24 at most / launch 21 -> same. Measured: foe in the dive path 12, foe at the landing 36, none at 500 px |
| Tennis Ball | down smash | Double Fault with a slow | **Double Fault**, slow removed | 11.4 -> 11.4 (front 8, back 11.4) |
| Tapey | main smash | Playback Trap (a recorder on the floor) | **Solo Track**: the old stun beam is back | old live row |
| Tapey | Final Smash | Rewind | **Eject!** (big eject button drawn as it throws them) | same hits |
| Fan | Final Smash | Full Blast, drawn with spinning blades | the same move; he flaps himself with a pleated paper fan, no blades | same hits |
| 12 fighters | Final Smash names | new names | old catchphrases: You're My Enemy Now!, Thorn Lash, You Leave Us Alone!, Aw Seriously!, Overdue, Gotcha!, Everything Packed, Ground Pound, Fraidy Stampede, Loads of Experience, Cuts Right to the Core; Tapey's is Eject! as you picked | names only |

## Step 2: small fixes (same moves, same numbers; names, card text, words)
- Flower: Root Whip -> Shin Kick, Thorn Back -> Out of My Way!, Root Down -> Heel Stomp, Vine Pull -> Runway Strut, the wall-cling line, and the smash name Announcer Crusher -> Flower Crusher.
- Fern: Canopy Rise -> Frond Rise, Leaf Blower -> Frond Whirl, Trunk Swing -> Frond Swing, Branch Back -> Frond Back, Seed Drop -> Spore Drop.
- Trophy: Attack -> Shoulder Check, Podium Punch -> Podium Kick (now a kick pose), Sore Loser Elbow -> Sore Loser Shove, Victory Lap "chest out and chin up".
- Box Flap Flick, Candle Nudge, Tea Kettle Spout Peck, Starfruit Point Poke (the Attack card text), Bonesaw Rev and Run -> Saw Through, Test Tube ranged -> Fizz Pop (option A), David's Big Armor -> No!.
- Smash names: Teardrop Cloud Cover, Bubble Popped on Arrival, Nickel Coin Flop, Bracelety Go Icy!, TV Dead Air, Ruler Cut Once, Baseball Heavy Landing, Salt OMGA!.
- NOT DONE: new pictures. The Attack moves of Box, Candle, Tea Kettle, Starfruit and Trophy, Flower's four moves, Fern's, Bonesaw's Saw Through and Saw's spinning blade (the doc asked for sawing strokes) were not redrawn. Only the words changed (Trophy's two aerials changed pose). Test Tube's Fizz Pop shot is still drawn as the old shot.

## Step 3: the redesigns

### Neutral smashes (now written as move rows; damage in match units)
| Fighter | Old (live) | New | Old -> new |
|---|---|---|---|
| Leafy | Leaf Blower: three leaves in a fan | **Run-Around**: sprints one tight loop in front of her and ends where she began, knocks down | 18 / 13 -> 16.5 / 12 (measured 16.5; launch 8.6 against 11.6) |
| Match | Strike Anywhere: three sparks in a fan | **Strike Anywhere**: one head-strike arc over and down in front, 55 px, burn | 16 / 7 -> 13.5 / 7 |
| Ice Cube | Blast Chiller: four shards | **Revenge!**: skates 120 px low at whoever hit her last, kick at the end, freeze | 15 / 10 -> 15 / 10 |
| Roboty | All Dashes: three signals in a fan | **All Dashes**: dot, dot, DASH along one line (about 180 px); dots flinch, the dash launches and scrambles | 16.5 / 8 -> 16.5 / 8 (measured 17.2: 3.1 + 3.1 + 10.9) |
| Starfruit | Spoiled Lemon, Reunited: five lemons | **Spoiled Lemon, Reunited**: the band runs in from 150 px ahead and 150 px behind; carried to him and knocked down | 14 / 10 -> 13.5 / 5.6 |
| Paper | Eighty-Eight Keys: keys slide | **Eighty-Eight Keys**: folds a paper piano ahead and slams the lid, root | 24 / 12 -> 22.5 / 11 |
| Lifering | Called in a Favor: shark slides | **Called in a Favor**: the shark jumps out of the floor, over in an arch, back in 170 px ahead; a foe under the arch is missed | 24 / 12 -> 24 dive-in / 12, arch clip 15 / 8 |
| Clover | Lucky Break: banana peel | **Lucky Break**: bends to pick a clover, stands up into whoever is in front | 19.5 / 13 -> 18 / 12 |
| Soap | Soap Slide: a bar slides | **Spotless**: three scrub strokes ahead (out, back, out), slippery | 19.5 / 10.5 -> 4.5 + 4.5 + 10.5 / 10.5 |
| Fanny | Cyclone: a whirlwind travels | **Full Speed**: pulls from behind, blows out the front, stands still | 15 / 10 -> blades 15 / 10, foes in front 6 and slid |
| Pin | Pushpin: a floor trap | **Get to the Point!**: holds her point out 70 px ahead for 40 frames; more damage the faster the foe comes onto it | 22.5 / 10 -> 13.5 to 22.5 / 10 |
| Yellow Face | Flash Sale: a ring | **Flash Sale**: two pops in front, "and a SECOND one FREE" | 24 / 11 -> 9 then 15 / 11 |
| Loser | Cold Snap: a ring of chill | **Fifty Spins**: a swing seat whirled upright in front, twice | 19.5 / 11 -> 7.5 then 12 / 11 |
| Gelatin | Ice Breaker: a freeze mine | **Double Dose**: syringe stab 6, plunge 12 and freeze | 18 / 12 -> 18 / 12 |
| Lollipop | Stuck On You: a root trap | **Fork Repellent**: a spray cone 110 px long, pushes away, no status | 21 / 9 -> 18 / 9 |
| Saw | Ripsaw Roll: a blade rolls 840 px | **Handle's Off!**: the blade flies off the handle, 260 px straight, through everyone, bleed, long wait after | 18 / 7 -> 18 / 7 |
| Woody | Splinter Scramble: dash forward | **Splinter Scramble**: bolts 135 px BACKWARD, splinters burst where he stood, slow; costs him 4% | 13.5 / 9 -> 13.5 / 9 |
| Fan | Nice Save!: a leap at the nearest foe | **Nice Save!**: snaps open into a wall of fan in front of him; it does not find the foe | 19.5 / 13 -> 19.5 / 13 |

### Finishers, specials and a Final Smash
| Fighter | Old | New | Numbers |
|---|---|---|---|
| Bomby finisher | "Finisher": explodes all round him, costs 4% | **Stop, Drop and Roll**: fuse lit, 30 frames panic, rolls 160 px; knocked down; ends flat; costs nothing | 18 / 13 -> 10 / 8.0 (measured 10.4) |
| Tennis Ball finisher | "Finisher": one big ball across the stage | **Calculated Bounce**: dotted path with three marks 100 px apart; he bounces along it, hitting only at the marks | 14 -> 4 + 4 + 6, launch only on the third |
| Taco down special | Retractable Arms (Taco (II)'s move) | **Stuck Inside**: a jawbreaker shuts round her 0.6 s; the first foe who attacks her up close is stuck to it (rooted 0.5 s) | 6% -> 6% roots (measured 6 and 29 frames rooted); salsa puddle kept |
| Dora down special | Jabby Brace: armour + stun | **Get Digging**: digs down, cannot be hit 12 frames, pops up in the same place; dirt burst stuns within about 40 px; stuck half out 10 frames | stun 16 frames, 0% (as before) |
| Tree special | Timber: a branch from the sky | **Timber**: he lobs a branch off his own crown to where the foe stands | 11 -> 11 (measured 11.4) |
| Blocky special | Prank Rig: an anvil from the sky | **Prank Rig**: he heaves the anvil in a quick arc onto the foe's spot | 13 -> 13 |
| Blueberry up special | Berry Roll: a spinning ball that pulls foes in | **Heave-Ho**: a squat, then straight up with both arms overhead; foes over him ride up and pop | up to 12.5 -> 8.3 (measured) |
| Sidewalky Final Smash | Physically: a slab from the sky on a marked foe | **Fresh Pavement**: a strip of wet pavement 380 px ahead, then the slabs tip up one by one and throw whoever stands on it | 28 / 20 -> same, measured 58.8 in both |

Kept as you said: Knife's Caltrops, Starfruit's name. Doc options taken: Test Tube option A, Pin option "Get to the Point!", Taco "her own down special" (the doc's Stuck Inside).

## NOT built, or built smaller than the doc (honest list)
- Match: the floor flame left behind on a miss.
- Clover: the low body (half as tall) for 12 frames; right now she bends only in the animation, she is not harder to hit with a high move, and the move is weaker for it.
- Lollipop: the "a rooted foe is sent flying farther" rider.
- Roboty: the three signals do not travel; all three hit the whole line at 8-frame spacing, so one foe on the line takes the dots and the dash.
- Starfruit: a foe is pulled toward him by the hit's launch, not carried by a visible runner.
- Fanny: tested only for a foe in front. The smash turns her toward the nearest foe, so a foe "behind" exists only with a second foe in front (not measured).
- Saw, Flower, Fern, Trophy, Bonesaw, Box, Candle, Tea Kettle, Starfruit: pictures (see step 2).
- Ice Cube's "whoever hit her last" uses the game's `lastHitBy`; not checked in a real fight.
- Pin's extra damage reads the foe's speed before the hit; it is capped so the total never passes the old 22.5.
- Bomby's finisher and Tennis Ball's finisher: the CPU used Tennis Ball's once in one test and not in the next; sample too small to say.

## Checks
See the end of this file (appended after the runs).

## Checks (all run on the built file, one node process at a time; no browser, no relay)

- **syncheck** failed 0; **bootcheck** clean (no bad positions, no control bytes, no bare LF, no hidden names) after every step.
- **State-hash no-op**: 64 fighters not changed by this branch (their MOVESETS rows, neutral smash row and name, up/down smash rows, move-list text, finisher / down / up special / Final Smash rows) are byte-identical to the build at 046ae554 (a70b7ce3 + the three merged branches), and 6 seeded CPU matches among unchanged fighters (1500 frames, 50 state hashes each) gave identical hashes. Script: moves3-scripts/noop.mjs.
- **CPU uses the new moves**: 8 CPU-vs-CPU matches of the changed fighters, 3600 frames each, 0 errors; in the first run 13 of the 19 fighters with a new neutral smash pressed it at least once (Match, Soap, Fanny, Pin, Woody and Fan did not in that minute), and a second run (longer, 8000 frames per group) counted every smash press in the old and the new build (same lineups; CPUs pressed the smash about as often: Woody 2/3, Soap 3/7, Taco 4/1, Fan 4/1, Dora 9/4, Tree 3/5, Tapey 1/6). Specials, up and down specials, finishers and Final Smashes were also pressed by CPUs in the new build for every changed fighter, except Tennis Ball's finisher (0 in that run, 1 in the first run). The CPUs press the smash by the fighter's jab reach, so moves that reach far (Roboty, Saw, Pin) are thrown when the foe is close.
- **Online (fake sockets only)**: the five new Final Smashes (Baseball, Pickle, Fan, Tapey, Sidewalky) on the existing host/guest pair test: wire fields 0 differences, draws 0 differences. For the 29 smash, up/down-smash, finisher and special moves, a host and a guest world joined by the snapshot string: the guest draws every prop and the shared `_nsv` props agree. Honest limit: a guest works out the move's frame from the attack animation, one frame behind the host's counter (the same as the up and down smash props that shipped), so I compared the host one frame back, and even then 17 of the 29 moves differ by 1 px or by one frame at the first or last frame of a prop (rounding in the snapshot). Nothing is missing on the guest; I did not run the real-input guest test (net-pair) for these moves.
- **Look-alike script** (shape class + effect + numbers within 25%), run on the 4 changed up/down smashes, the 18 new neutral smashes, Firey Jr.'s, and the 2 finishers, against 1211 tilt / aerial / side / up-down rows and the other new moves. 7 full matches:
  - Tennis Ball down smash (now with no slow) against four down-airs (Bomby's, Tree's, Pencil's and Bomb's rows): same class (one disc, moving, low) and numbers, no effect. They are aerial spikes; the owner's call whether it still counts as different (the slow was the only effect).
  - Yellow Face's Flash Sale against Loser's Fifty Spins: both are a round hit in front, twice, no effect, 15 / 12 and launch 11.0 against 11.0. Honest: these two are alike by this script; they differ in size and place (60 px ahead and growing, against an upright circle 50 px ahead) and in the stun on the first pop.
  - Tennis Ball's Calculated Bounce against Pin's Wobbling Top (three hits that move, 6 and 8 at launch 8.1): alike by the script; the bounce hits only at three marks, the top wanders back and forth.
  - Also 47 coarse matches against neutral smashes (pattern class only, no geometry); I did not go through them one by one. The named pairs: Bomby's Stamp It Out! against Coiny's Penny Spin: NO match (two foot patches that alternate, then both, against one round patch). Firey Jr.'s Tantrum against Puffball's smash: no match. Fan's wall against Gaty's smash: no match (in front only, no pull). Blueberry's Heave-Ho against Snowball's Up You Go: specials are code, the script does not cover them; by eye: one is a ground smash that throws backward (15), the other an up special that hops (up to 8).
- **Win share** (60 FFA matches of 4 CPUs, 2 stocks, the same lineups in the old and the new build, drawn from the 47 changed fighters): 51 of 60 matches were won by a changed fighter in the old build and 49 in the new. By fighter (appearances; wins old -> new; small numbers, one match is one win): Bomby (9) 7 -> 2, Firey Jr. (8) 3 -> 0, Roboty (8) 4 -> 2, Taco (5) 3 -> 1, Tree (4) 2 -> 0, Salt (5) 2 -> 0 (Salt only got a smash name, so that one is noise); up: Pickle (7) 0 -> 4, Candle (7) 0 -> 3 (a text change only: noise), Flower (5) 1 -> 3, Soap (5) 1 -> 3, Blocky (2) 0 -> 2. With 2 to 10 matches per fighter none of this is a measurement; Bomby and Firey Jr. falling is what the nerfs ought to do, and Pickle rising (his dive finds nobody, but the CPU's Final Smash use may have changed) is worth a bigger sample before anything is tuned. I tuned nothing.
