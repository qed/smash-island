# Up and down smash RANGE, and Golf Ball's up / down smash (branch g-smrange, 2026-11-17)

Built and committed on the branch, NOT pushed, NOT merged. Nothing here is live.

You said: "the new up smashes have so little range." / "some of the down smashes too." / "I cant use gb's up and down smashes".

## 1. Golf Ball: why you could not use them, and the fix

**Cause (reproduced with the real keys, ↑ / ↓ + V, by a scripted player):** her up and down smash themselves came out fine when the smash key was free. But a press of ↑ + V or ↓ + V made **while the smash cooldown was still running** lost its arrow: ↑ started a jump and ↓ was forgotten, so when the charge went off it was the **neutral smash** instead. Golf Ball's neutral smash is **Presence** (it hits nothing) and it leaves **173 frames (about 3 s) of smash cooldown**, the longest there is. So after one Presence, every up or down smash you tried in the next 3 seconds came out as another Presence, which started another 3 seconds: she was stuck. Measured, base build, tapping the arrow with V 90 frames after a Presence: up smash -> Presence, down smash -> Presence. Every other fighter had the same hole, but only for their own (short) cooldown, and their neutral smash hits, so it was much less visible.

The same thing happened in **landing lag** (found by the same test: Blocky's neutral smash lands with 3 frames of it; ↑ / ↓ + V pressed in them was the neutral smash again).

**Fix:** the press keeps its arrow through the cooldown and the landing lag (smashCancel no longer returns early for those two). The charge still waits for the cooldown exactly as before; then the up or down smash comes out. After the fix, for all 36 fighters with their own pair (tap, hold, walking, just after a neutral smash, smash cooldown 40, just after landing): the up / down smash every time (Golf Ball after Presence: up smash, down smash); see check 2 for exactly what was re-run after the landing-lag part. The move card for Golf Ball, Needle and Teardrop now also says how to do the up and down smash (it said nothing for fighters whose neutral smash is a stance or aura).

Her moves were also small: Lift-Off reached only 54 px ahead (a thin rocket just in front of her) and Backspin 66 px behind. Both were grown (table below), but Lift-Off is still short of the old move ahead (66 against 96) and covers nothing behind her (its idea: the rocket climbs from the floor just ahead of her). **Question for you:** should Lift-Off cover more around her (a wider exhaust plume, say), even though that changes how it looks?

## 2. Range: how it was measured and what was done

For each of the 72 own moves and for the generated move it replaced, the move is thrown for real (facing right, flat floor) and every hit shape the engine tests is recorded on its own frame (travel, sweeps and timing included); then a still dummy (Coiny) is put on a 6 px grid and the game's own hit test says where it is hit. Numbers are px between the two fighters' middles (high = how high the dummy's FEET can be and still be hit right over the fighter; ahead / behind = for an up smash at head height and above, for a down smash standing on the floor). The old generated up smash reaches 132 high and 96 / 90 to the sides; the old down smash 126 each side along the floor.

Each move that was smaller was **stretched** (its box numbers rewritten in DSM_OWN): x past 12 px from the fighter's middle by kx, y more than 24 px above the middle by ky, every radius by kr. The drawing gets the **same** stretch (DSM_GROW, in drawDsmProps), so what you see is what hits. Damage, launch, stun, effects and every frame number are **unchanged** (checked by comparing every row's numbers with the base build: identical; the only text change is Tennis Ball's ripple, "about 70 px wide" -> "about 100 px wide"). No other move changed.

The stretch was capped so a move keeps its look (a body hit at most 1.6x its size, a thin line at most 1.5-1.6x as thick, clouds and bubbles up to 2.2x). Moves still short at their cap are listed below rather than blown up further.

Before -> **after** (unchanged numbers shown once). "area" = how many 6 px grid spots around the fighter the dummy is hit at.

| Fighter | Up smash | high | ahead | behind | area | Down smash | ahead | behind | area | stretch (kx, ky, kr) up / down |
|---|---|---|---|---|---|---|---|---|---|---|
| *generated (old)* | *Rising Smash* | *132* | *96* | *90* | *550* | *Low Sweep* | *126* | *126* | *247* | |
| Firey | Hang Glider Heave | 138 | 96 | 96 | 433 | Twin Torches | 84 → **138** | 72 → **132** | 381 → **602** | - / 1.88,1,1.44 |
| Leafy | Yoyleland Knife | 114 | 96 | 12 | 276 | Falling Leaf | 108 → **138** | 96 → **132** | 301 → **390** | - / 1.48,1,1.24 |
| Needle | Don't Call Me Needy! | 114 → **132** | 96 → **114** | 36 | 358 → **461** | Double Stitch | 84 → **132** | 84 → **132** | 333 → **379** | 1,1.6,1.6 / 2.06,1,1.53 |
| Pin | Flat Top | 84 → **90** | 72 → **96** | 72 → **96** | 306 → **418** | Wobbling Top | 84 → **102** | 84 → **102** | 258 → **430** | 1.64,1,1.19 / 1.6,1,1.6 |
| Snowball | Up You Go | 150 → **162** | 72 → **96** | 24 → **30** | 394 → **510** | Roll Out | 132 | 132 | 346 | 1.86,1,1.43 / - |
| Bomby | Fuse Sparkler | 150 → **180** | 48 → **72** | 48 → **72** | 329 → **607** | Stamp It Out! | 78 | 78 | 190 | 1.6,1,2.2 / - |
| Bubble | Blow-Up | 138 → **168** | 60 → **96** | 60 → **96** | 368 → **783** | Oh Noio! | 102 → **132** | 102 → **126** | 579 → **874** | 1.9,1,1.9 / 2.1,1,2.1 |
| Teardrop | Dot Dot Dot | 108 → **138** | 66 → **96** | 66 → **96** | 273 → **462** | Down the Drain | 114 → **126** | 114 → **126** | 287 → **346** | 1.92,1.46,1.66 / 1.24,1,1.12 |
| Flower | So Beautiful! | 120 → **132** | 90 → **96** | 90 → **96** | 432 → **485** | So Ha! | 90 | 78 | 262 | 1.08,1.18,1.1 / - |
| Tennis Ball | Topspin Bounce | 102 → **120** | 54 → **72** | 54 → **72** | 308 → **465** | Double Fault | 96 → **114** | 78 → **96** | 138 → **201** | 1,1,1.6 / 2.2,1,1.6 |
| Blocky | Funny Doings Pop-Up | 96 → **114** | 102 | 18 → **12** | 262 → **310** | Snakes in a Can | 114 → **132** | 120 → **132** | 486 → **532** | 1,1.4,1.12 / 1.16,1,1.08 |
| Coiny | Heads or Tails | 138 → **150** | 60 → **90** | 60 → **90** | 411 → **679** | Penny Spin | 72 → **102** | 72 → **102** | 253 → **496** | 1.8,1,1.8 / 1.6,1,1.6 |
| Pen | Check Mark | 138 → **132** | 78 → **96** | 60 → **72** | 310 → **420** | Cross It Out | 120 → **132** | 114 → **132** | 548 → **603** | 1.48,1,1.8 / 1.16,1,1.08 |
| Pencil | Alliance Cheer | 138 → **144** | 84 → **96** | 84 → **96** | 478 → **558** | Demoted! | 132 | - | 241 | 1.18,1.18,1.15 / - |
| Match | Like, OMG! | 126 → **156** | 66 → **96** | 66 → **96** | 408 → **747** | Shake It Out | 132 | 132 | 585 | 1.62,1.06,1.72 / - |
| Ice Cube | Served Cold | 144 → **138** | 66 → **96** | 66 → **96** | 439 → **656** | Shattered! | 132 | 132 | 341 | 2.2,1,1.6 / - |
| Golf Ball | Lift-Off | 150 → **156** | 54 → **66** | 12 | 298 → **376** | Backspin | 132 → **186** | 66 → **90** | 292 → **515** | 1.4,1,1.8 / 1.6,1,1.6 |
| Rocky | Down the Hatch | 132 → **150** | 84 → **96** | 84 → **96** | 492 → **643** | Stubbed Toe | 66 | 66 | 228 | 1.3,1,1.3 / - |
| Woody | I Surrender! | 132 | 78 → **96** | 78 → **96** | 374 → **465** | Knock on Wood | 60 | 60 | 195 | 1.52,1,1.26 / - |
| Book | Slam Shut | 144 | 108 | 108 | 541 | Footnote | 114 → **132** | 114 → **132** | 173 → **188** | - / 1.26,1,1.13 |
| Ruby | Glint | 150 → **156** | 66 → **90** | 66 → **90** | 332 → **459** | Dispersion | 132 | 126 | 479 | 2.2,1,1.6 / - |
| Puffball | All Aboard | 126 → **144** | 48 → **66** | 48 → **66** | 329 → **507** | Rainbow Whirl | 96 → **132** | 96 → **132** | 267 → **401** | 1,1,1.6 / 1.62,1,1.37 |
| Gelatin | Order Up! | 144 → **150** | 78 → **96** | 36 → **42** | 333 → **412** | Bounce House | 132 | 132 | 251 | 1.6,1,1.3 / - |
| Fries | Out With the Old | 138 | 30 | 96 | 370 | Hands Off My Fries! | 78 | 78 | 323 | - / - |
| Nickel | No Arms Needed | 138 → **150** | 42 → **48** | 42 → **48** | 294 → **367** | Can't Touch | 90 → **138** | 84 → **132** | 338 → **450** | 1.6,1,1.6 / 1.96,1,1.48 |
| Yellow Face | Now 50% More! | 132 → **150** | 66 → **96** | 30 → **36** | 230 → **392** | Side Effects May Include | 102 → **132** | 96 → **132** | 318 → **393** | 2.2,1,1.6 / 1.62,1,1.31 |
| Donut | Borrowed Powers | 150 → **156** | 42 → **48** | 42 → **48** | 293 → **355** | Keep Out! | 114 → **132** | 12 → **6** | 98 → **127** | 1.74,1,1.59 / 1.24,1,1.12 |
| Dora | Two-Second Climb | 156 → **174** | 48 → **66** | 48 → **66** | 434 → **633** | Dirt Flinger | 18 | 144 | 346 | 1,1,1.6 / - |
| David | No! | 132 → **138** | 78 → **96** | 78 → **96** | 377 → **527** | Blank Stare | 132 | - | 322 | 1.6,1,1.3 / - |
| Loser | High Five | 132 → **144** | 60 → **84** | 18 → **24** | 237 → **328** | Made You Look | 132 | 24 | 271 | 2.2,1,1.72 / - |
| Lollipop | Stuck-Up | 150 → **156** | 42 → **48** | 48 → **60** | 254 → **336** | Sugar Crash | 102 → **126** | 6 → **-** | 160 → **213** | 2,1,1.6 / 1.54,1,1.32 |
| Taco | Catch of the Day | 138 → **150** | 48 → **60** | 48 → **60** | 317 → **435** | I Didn't Abandon You! | 108 → **132** | 48 → **54** | 126 → **172** | 2.2,1,1.72 / 1.36,1,1.18 |
| Barf Bag | Barf Molecules | 144 → **174** | 48 → **72** | 48 → **72** | 324 → **658** | Actually... | 66 | 18 | 207 | 1,1,2.2 / - |
| Bell | Stop Climbing My String! | 192 | 30 → **36** | 30 → **36** | 330 → **393** | String Cut | 90 → **132** | 90 → **132** | 143 → **210** | 1,1,1.5 / 1.76,1,1.38 |
| Tree | Bottled | 144 → **162** | 48 → **66** | 48 → **66** | 237 → **438** | Preventing Death | 132 | 132 | 297 | 1,1,1.8 / - |
| Gaty | Return to Sender | 102 → **132** | 72 → **96** | 72 → **96** | 288 → **437** | Come On In | 108 → **132** | 108 → **132** | 405 → **525** | 1.66,1.7,1.61 / 1.36,1,1.18 |

## 3. For you: moves still short of the old coverage, and why

**Close range by their idea: NOT grown** (each row's words say short reach; growing them would change what the move is, so I ask first): Bomby **Stamp It Out!** (stamps at his own feet, 78 px), Flower **So Ha!** ("short reach", 90 / 78), Rocky **Stubbed Toe** ("very short reach", 66), Woody **Knock on Wood** ("right around him", 60), Fries **Hands Off My Fries!** ("short reach", 78), Barf Bag **Actually...** ("a short hit", 66). Should any of these reach as far as the old sweep (126)?

**Only one side, by their idea** (the other side was left as it was): up smashes Leafy (nothing behind, nothing straight overhead), Needle, Snowball, Blocky (nothing straight above), Pen, Gelatin, Yellow Face, Loser, Golf Ball (front), Fries (back); down smashes Pencil, Donut, David, Loser, Lollipop, Taco, Barf Bag (front), Dora (behind).

**Grown to their cap and still short:** up smashes Bomby (72 to the sides: a narrow jet), Tennis Ball (120 high, 72 wide: his body is the hit), Coiny (90), Golf Ball (66 ahead), Ruby (90), Puffball (144 high, 66 wide: her body), Nickel (48: kicks straight up), Donut (48: the bolt), Dora (66: her head), Loser (84), Lollipop (48 / 60), Taco (60), Barf Bag (72), Bell (36: the rope), Tree (66), Pin (90 high: the low flat plate over her); down smashes Pin (102), Tennis Ball (114 / 96), Coiny (102), Golf Ball (90 behind).

**Small losses from the stretch** (honest list): Pen up 138 -> 132 high, Ice Cube up 144 -> 138 high, Blocky up 18 -> 12 behind, Donut down 12 -> 6 behind, Lollipop down lost its 6 px sliver behind her. Needle's Double Stitch: the needles moved out to reach 132, so the gap right beside her where nothing hits grew from 18 to 60 px (its idea says "nothing right against her").

**Dora's Dirt Flinger** (hits only behind her) never hits a foe a person aims it at: the smash turns her to FACE the nearest foe, so the dirt goes the other way. It works only while you hold the arrow away from the foe. Its words say "she has to turn her back on them", so I left it; tell me if the smash should turn her back to the foe instead (the CPU already does that).

## 4. Fairness

Damage, launch and frames: unchanged on all 72. But a bigger area is easier to land. Moves now clearly bigger than the old generated move by area: Bubble's up (783 grid cells against 550) and down (874 against 247), Match up (747), Barf Bag up (658), Dora up (633), Firey down (602), Coiny down (496), Golf Ball down (515). Most down smashes now cover 1.5x to 3.5x the old sweep's AREA, mostly because they also reach higher than the old ankle-high sweep; along the floor they reach 126-138 px, the old 126. The CPU matches below are the only strength measure; there was no win-rate run.

CPU against CPU, the build before this branch against this one, the same 4 seeds (6 fighters a match, all 24 with own pairs that were grown or listed, level 2, 5400 frames, 8 matches): up smash pressed 9 -> 9 (landed 1 -> 3), down smash 19 -> 21 (landed 14 -> 17), neutral 4 -> 6, stocks lost 36 -> 39 (6.0 -> 6.5 a minute), errors 0 -> 0. More smashes land, as expected from bigger areas; 8 matches are too few to say more, and nothing was tuned on them. Note: the CPU picks an own down smash when one of its boxes reaches the foe (brainDsmLands), so it now asks for the grown ones from further away.

## 5. Checks

- **Human keys, all 72 moves** (a scripted player presses the real keys: ↑/↓ and V together, or the arrow first; dummy above for up, beside for down, 6 spots, 2 ways): every one of the 72 came out every time (24 of 24 presses); 71 of 72 hit the dummy at least once; Dora's Dirt Flinger never (see above). Pressing the arrow 14 frames AFTER V gives a jump and the neutral smash for ↑ (as designed: a jump that has left the ground is a jump) and the down smash for ↓.
- **Cooldown / lag / play-like presses, all 36 fighters** (tap, hold, walking, 90 frames after a neutral smash, smash cooldown 40, on landing): with the cooldown fix, 430 of 432 gave the up or down smash; the 2 misses were Blocky just after his own neutral smash (landing lag), fixed next and re-run for Blocky, Golf Ball, Pin and Dora (48 of 48; the other 32 fighters were not re-run after that last one-line change, which only removes a guard). Before: every fighter turned an arrow+V into the neutral smash in the cooldown case, Golf Ball also after Presence (173 frames), Blocky after his own neutral smash (landing lag).
- **Numbers unchanged:** every DSM_OWN row compared with the build before (all fields but the box shapes): identical, except Tennis Ball's down smash description (70 -> 100 px). All 116 MOVESETS kits, NSM_MV, NSM_FIN and the 76 generated up/down pairs: identical.
- **Reach:** measured again after the rows were rewritten: the table above (it matches what the stretch search predicted). This, the numbers comparison and the 72-move key test ran before the landing-lag line changed; that change touches only the smash press, not shapes or numbers.
- **Look-alike** (the batch 3 script, unchanged, 1247 rows): the build before had 8 of the 72 own moves flagged (Bubble down, Teardrop up and down, Tennis Ball down, Coiny up, Golf Ball down, Lollipop up, Gaty down); this build has the same 8 plus **Leafy down** (Falling Leaf against the generated Low Volley: stretched wider its U got shallower, so the script reads two flat low lines). Listed, not changed.
- **Props:** all 72 drawn through the stretch, frames 0-40, both facings: 0 exceptions (drawings still never seen: no browser).
- **Online** (two jsdom pages joined by fake sockets; nothing real, never the relay): 71 of 72 OK. Flower's So Ha! (not changed here) is NOT OK by the script: the guest's place is 3.27 px off the host's against a 3 px line, the same 3.27 on the build before this branch (it slides the foe on ice).
- **CPU:** 8 matches, 0 errors (above).
- syncheck: 0 failed. bootcheck: clean (0 bad positions, 0 control bytes, 0 bare LF, hidden names none).
- NOT DONE: no win-rate run; drawings not seen; the rowcheck from batches 2-3 was not re-run (its job, damage / launch / frames at or under the old move, is covered by the numbers-unchanged comparison).
