# Six: boss design for the Algebralien Boss Rush (fourth of nine)

Written 2026-11-02 for the owner's "pipis! begin." job. Design only: nothing in the game was edited (one read-only jsdom probe of the current Boss Rush arena; its numbers are in section 3). Six is NEW: she is not a boss, a fighter or a sprite in the game today.

Build under study: `smash-bal`, branch `ii-dlc`, monolith `artifacts/V1/index.html` (the root `index.html` is a 12-line Vite stub). Line numbers move (a merge landed while I read), so symbols are cited by name.

## 0. At a glance

| | |
|---|---|
| Place | 4 of 9, after Nine, before Zero. HP **1,600** (the owner's curve), plus two soap-bubble shields of 120 each (section 5) |
| Fight | about 4 minutes for one fighter (3.4 to 4.7), see section 2 |
| Arena | **The Equation Playground** at golden hour, her home in the show: a tree, the house Two built, leaf piles. New and simple, all code-drawn |
| Body | a Water Blue (#2da7e4) 6 with a point on top. No Six art exists in the game yet: three wiki renders to add (idle, angry, powerless), everything else code-drawn |
| Signature | **THE BUBBLE**: she fights inside a soap bubble that soaks up the first 120 damage; popping it drops her to the floor, dazed. A new bubble every phase |
| Attacks | BUBBLES!, LEAF RAKE!, SLAP!, ROCK DROP!, and from phase 2 KICK OUT! |
| Phases | 2 (at 50%): Staying Behind, Revenge |
| Intro / defeat | bursts out of a leaf pile / goes pale (powerless) and flops back into the leaves: "Yay." |
| Size | medium: about 830 lines, 3 new PNGs |

## 1. Canon (what the wikis say)

Read: the BFDI wiki pages for Six, Algebraliens, X, Two Thousand Seven Hundred Sixty-Three, Zero, Nine, Fifteen, and the transcripts of Alone, Homeward Bound!, All For One and the 900,000 special (Six's lines only), plus Seasonal Shift. The Inanimate Insanity wiki has no Six (a search for her returned nothing). **X and 2763 both exist as characters** (X: yellow Variable, voiced by Cary Huang; 2763: a rose 2, cyan 7, lavender 6 and yellow 3 joined into one Algebralien, the antagonist of the 2,763,000 special). The wiki itself flags the Six page as incomplete (some TPOT 20 content missing). Everything below is paraphrased from those pages; the only quote is the one word Six says at the end of this fight.

**Who she is.** Six Integer, an Algebralien, "Six" (6), azure with a point on the top; her design is said to resemble Teardrop's (a blue circle with a point). BFB colours: body #2da7e4 Water Blue, limbs #7acdf3 Sky Blue, black outline. She/her (they/them also used; he/him is not used in BFDI canon). Voiced by Florence Chapell. First canon appearance: Don't Dig Straight Down (recommended character); major debut in TPOT's Bottle For Dream Island; placed 5th in BFPTM10 (4th in the special's own count).

**Personality.** Dry, bored, irritable and sarcastic, a jokester with a mean streak (kicks Seven, trips Ten, laughs at Seven's tears) and a leader's streak (tries to lead the lost group out in Bottle For Dream Island). Slaps Needle when shaken, twice, in two episodes. Cares about Three and about Two (flings Two toward the exit door in All For One just before One shuts it). Calls Four a narcissist. Would rather go exploring for Three than go through Four's door, which she finds boring. Artist. Owns a black cat with white face markings (a trivia fact).

**What she does, from the wiki's own list** (each marked: [ep] seen in an episode I read, [list] only in the Six page's ability list, which I could not confirm in the transcript):
- Blows bubbles: her first act in X Finds Out His Value, again in Alone (a bubble into Seven's eyes), and a stinger in Lo-Fi Beats [ep]. The Number Playground Chronicle mentions a Bubble Co. Baby Bubble Blower 7000 that she is not keen on buying (non-canon).
- Rakes leaves into a pile and flops into it with a flat, unenthusiastic cheer (Alone) [ep]. This is her last scene in the Equation Playground, left behind to guard it.
- Throws rocks into the sky and conjures rocks; tears up the Moon's surface with telekinesis [list; the rocks are in Alone's power-testing scene].
- Elastic arm (stretches it to shut a door) and limb retraction [list; the door is in Alone]. Light-blue light and an aura on her hands whenever she uses a power [list].
- Super speed (climbs a mountain at once), teleportation, flight (flew to the Moon with the others), reaction time (dodges every knife in All For One, and Three's blasts in Homeward Bound!) [ep for the knives; the rest list].
- Energy blast, said to be like Four's zappies, against Three [list; I did not find it in the transcript].
- Barrier binding: with the others she seals One inside the Moon (Alone) [ep]. Pain tolerance.
- Subscriber specials (the wiki marks these NON-canon): kicks Seven out of the count and cheerfully declares revenge on him, squeezes him to show he is light as a tennis ball; Eight is too heavy to kick; wears the Stone-O-Boot (a giant stone boot, after mining a mountain); joins with Nine as Fifteen; hides in a vent from 2763.
- Seasonal Shift: she is hosting when she rapidly changes through other hosts (Announcer, Green Face, speaker boxes, a VR headset). Not used here (it needs other bosses' art), see section 11.
- Powers: gets hers from the Yoylite (Alone); **One took them in All For One and she was the last powered Algebralien to lose them** (the wiki's trivia); depowered Six is paler (the "Six Powerless" render).

**Relationships to the rush, in its order.**

| | |
|---|---|
| Two | Six saves him in All For One (throws him through the door); Two built the house she shuts herself into in Alone; Six, Two and Eight shrug off the Pie and Pi fight in the Pi Day special |
| Four | the Six page lists Evil Six as Four's nickname for her; she calls him a narcissist; the page lists them as possible allies |
| Nine | frenemies per the page: Nine calls her a brother of another color, she sings that she has her own style; they join as Fifteen (6 + 9 = 15) in the 1.5M special and fall out |
| Zero | possible allies; Zero's base welcomes her in the 2,763,000 special |
| X | she opens X Finds Out His Value blowing bubbles; X shows her and Nine the Stone-to-Boot-O-Tron in the 900,000 special |
| One | listed as her arch-enemy; she helps seal One in the Moon (Alone); One zaps her away and takes her power (All For One) |
| Three | the page lists Three on both her ally and enemy lists; she grieves when Three shatters and later tells Three about One, and Three nearly zaps her (Homeward Bound!) |
| 2763 | it traps her with Two, Five, Seven and Eight at the end of its special; she hid in a vent from it |

Order matters in a nice way: Six (after Nine) is the Algebralien One fears and the last to lose her power, and she sits before One in the rush.

## 2. Place in the order, HP, how long it takes

- Position **4 of 9**. HP **1,600** (owner's curve: Two 1,000, Four 1,200, Nine 1,400, **Six 1,600**, Zero 1,800, X 2,100, One 2,400, Three 2,700, 2763 3,000).
- The existing bosses are 185 to 340 base HP and 277 to 510 after BOSS_HP_MULT (1.5): Six is about 3 times Four's bar in today's gauntlet (510). In `scripts/boss-rush-balance.json` a solo AI fighter dealt **6.5 to 9.0 HP per second** to the seven bosses measured (HP x 1.5 over `clearS`: MePhone4 7.2, Evil Leafy 7.2, MePhone4S 8.8, Dragon 6.5, Two 6.7, Springy 9.0, Four 8.0; mean 7.6).
- So Six alone: 1,600 / 7.6 = **210 s**; with the two shields (240) 1,840 / 7.6 = **242 s, about 4.0 minutes** (range 204 to 283 s, 3.4 to 4.7 min). A second fighter roughly halves it if the bar is not scaled by player count (the old rush scaled by 1 + 0.6 per extra fighter: see question 7).
- For the lead: the whole rush is 17,200 HP, about 2,260 s of damage time at 7.6 HP/s, **about 40 minutes** for one fighter with intros and endings.
- Pressure is set for a human, not for the bot: one turn about every 6 s in phase 1 and 5 s in phase 2, and **one boss hit at most per fighter per turn** (the `volley` rule). The bot harness is used only to read fight length. A 4-minute fight at Four's hit rate would be unfair against 4 stocks plus 2 a boss.
- Difficulty by length and layers rather than burst: she hits softer than Four (every hit x0.9 of the normal 22) and has a second health layer, so she is a "stay with it" fight between Nine and Zero.

## 3. Arena: The Equation Playground

**Canon fit.** The Equation Playground is the Algebraliens' home (a planet with a tree, a house Two built, the rake and the leaf pile, a Moon overhead). Alone shows Six there blowing bubbles, tripping Ten, testing her powers and, left alone, raking leaves. No arena in the game is it; the near ones are the wrong place: Four owns `exitclass` and `fourest`, One owns `onemoon`, Two `twopark`. So: a new key, `eqplayground`, small to build.

**The current Boss Rush arena** (read-only probe, 2026-11-02): Goiky Field, `WW` 1100, `WH` 720, floor line (`groundY`) y 590, three small ledges 64 to 108 px above the floor, a boss of radius 85 (big 2.5). The owner's rule says the rush's stages are LARGER and that bosses must not be outrunnable. **I do not know the rush stage's size**; everything below that has a distance is written so it holds for any width A: numbers are for A = 1100 and the ones marked [A] scale with it (the picker's own thresholds already do: near is 0.30 of WW, far 0.28 to 0.50, edge 0.20).

**Look** (all in the slots `sky`, `ground`, `decor`; nothing downloaded):
- Sky `eqplayground`: `["#8fcff0","#f6d9a0"]`, a blue afternoon fading to gold. Blue Six against gold and orange reads best (colour opposites). Phase 2: the sun sets over 90 frames (the dusk tint Two's `night[]` uses), the gold turns rose.
- Ground: autumn grass `#8d7a3b`, line `#4a3b14`, a pattern of scattered orange, red and yellow leaves.
- Decor: a large tree on the left (trunk plus three canopy blobs in orange, red, gold; its low branch is the left ledge), the small house Two built on the right (box, roof, round window, a door that is shut; its roof is the right ledge), a pale daytime Moon with one crack (a nod to sealing One in it, and a promise of One's night arena later), three clouds, small leaf piles at fixed fractions of A, and about 14 leaves drifting (a pure function of `hazardT`, so an online client draws the same ones). Scaled across A: a tree and house at each end, more piles between.
- Hazard: **none, on purpose**. The bubble is the fight's second layer; a gust would only fight the bubbles' aim. (If the owner wants one: wind gusts as the Dragon's, a push on fighters in the air.)

**Bigger-stage rule for Six** (so she cannot be outrun): she does not chase on foot. She keeps a stand-off of about 480 px (380 in phase 2) from the nearest fighter, **pops** (a short teleport, as Two's `twoPop`: a blue ring, 8 frames out and 8 in; the wiki lists teleportation) to wherever a move begins, and every move either tracks (BUBBLES! home, ROCK DROP! is aimed at each fighter) or reaches the whole floor (LEAF RAKE!). The position picker then punishes distance both ways: far tags (BUBBLES!, LEAF RAKE!) when you keep away, close tags (SLAP!, KICK OUT!) when you stay near.

## 4. Body and art

**Art in the game today** (`artifacts/V1/assets/sprites`, 398 files): no Six. Algebralien art that exists: `one.png`, `one-fish.png`, `two.png`, `four.png` plus eight more Four poses (`four-*.png`). Not stand-ins: the `teardrop*.png` files are Teardrop (a different character), `algebralien-needle.png` is a Needle skin. Usable shot art already there: `attacks/bubble.png` (55x56), `onemoonrock.png` (106x64, One's), `woodchip.png`, `bush.png`.

**Art to add** (the same route as Two's `two.png`, which came from `TwoTPOT20PromoArt.png`: wiki render, scaled to 200 px tall, listed in `CREDITS.md`, fetched by `scripts/fetch-sprites.mjs`). I checked each file through the wiki API and a pixel read: all have transparent corners and the right Water Blue body; **I could not look at them** (the pane would not paint), so each must be seen before it is kept, as the credits say.

| Key (file) | Wiki file | Size | Used for |
|---|---|---|---|
| `six` (`six.png`) | `SixTPOT20PromoArt.png` (the TPOT 20 promo art, the same family as Two's) | 1049x1091 | the idle render, phase 1 |
| `sixmad` | `Malicious Six.png` (alternative: `Six angry tpot20.png`, 339x353, darker palette) | 1323x1020 | phase 2 look (`bossLook`) |
| `sixpowerless` | `Six Powerless.png` | 832x897 | the defeat |
| optional | `PuttingArmOut.png` (473x485), `Six Scared.png`, `Six bored.png` (515x631) | | SLAP! wind-up, the pop, the stagger |

**Everything else is code-drawn**: the bubble (radial gradient, a slowly turning hue-shifted rim, two white highlights, a wobble), the stretched arm and hand (a tapered Sky Blue limb with a black outline, a bulb of a hand), the rake (a handle and a toothed head), leaf heaps, rock slabs, the Stone-O-Boot (a rounded grey stone boot with cracks), the leaf pile, the tree, the house. Fallback body in the `body` slot until a render loads: a Water Blue disc with a pointed top, black outline, two eyes, two fangs (the wiki lists fangs), Sky Blue limbs.

Roster row: `{name:"Six", color:"#2da7e4", hp:1600, big:2.5, attack:"six", arena:"eqplayground", stationary:false, sprite:"six"}`. Radius 34 x 2.5 = 85. Grounded. While bubbled she floats about 36 px up (the bubble lifts her), and when it pops she drops to the floor: a grounded Six is a hurt Six, readable from across the room.

**Tells are the body's** (`BOSS_TELLS.six`, the pose table the overhaul made: pose, glow, beats): her power glow is always light blue (the wiki: a light-blue light and an aura on the hands), so the colour means "a power is coming", and the pose says which.

| Move | pose | glow | beats | What you see |
|---|---|---|---|---|
| BUBBLES! | `puff` | #7fd8ff | 2 | she pouts and swells, a bubble grows at her mouth |
| LEAF RAKE! | `rear` | #e8a33a (leaf orange) | 2 | the rake lifted overhead, leaves kicked up at her feet |
| SLAP! | `coil` | #7acdf3 | 2 | drawn back away from you, the far arm cocked behind her, the hand glowing |
| ROCK DROP! | `rise` | #7acdf3 | 3 | arms up, the floor cracks open (`bossCrack`) and slabs rise round her with a blue aura |
| KICK OUT! | `crouch` | #9fb0c4 (stone grey) | 2 | blue ring where she was, she is gone, a ring where she lands, one leg back and a stone boot growing on the foot |

No lines, bands or banners on the floor. The two world marks used are the ones the overhaul allows: the crack for the slabs, the shadow under each falling rock (`bossFallShadow`). **Everything that appears grows in over 12 frames**: bubbles, leaf heaps, slabs, the arm, the boot, the pile, the shield.

## 5. The signature: THE BUBBLE

Six is the bubble blower of the show (her first scene, and the thing she does when she is bored), and the Algebraliens' barrier is canon too (the seal on the Moon). No boss in the game today has a pop-it layer (Two's grounding is a gate you earn by standing close, not a thing you pop); I have not read the other new rush bosses' designs, so the lead should check none of them has a shield too.

- She starts each phase inside a large iridescent bubble, radius 1.3 x her body (about 110 px), that **soaks up damage first**: the pool is 120 per bubble (**two bubbles in the fight, 240 in all**). A hit's damage goes into the pool instead of her HP; leftover damage from the hit that breaks it goes to her HP.
- The bubble **shows its health**: it shrinks and dulls as the pool drops, dents and ripples where it is hit, and the rim flickers when under a quarter. No bar, no number.
- **Pop** (pool 0): droplets, a ring of shine, a short high pop, `shake(8)`. Six drops to the floor and is **dazed 90 frames** (the `shake` pose, a stunned face, the Sky Blue glow gone). No attack starts for 100 frames: a free window of about 1.7 s that you earned by breaking the shield (the shield itself is about 16 s of hitting for one fighter at 7.6 HP/s). The bubble does not come back in phase 1.
- At 50% HP, the phase 2 bubble: she stops, the pose `puff`, a **new bubble** forms (12-frame grow-in) with a dusk rim; pool 120 again. Pop it for the same window and the final stretch is open Six.
- The bubble is her hit box while it stands: her radius rises 25% (to about 106) so hitting the bubble counts; it eases back when it pops.
- Cheap by design: the state is `_hz.bb = [pool, max, poppedAtFrame]`; everything on screen is a pure function of that and `hazardT`.

Engine hook (two places, both next to `twoUngroundedBlocks`): the boss branch of `damageSummon` and the shot-hits-boss branch; call it **after** the grace check and note the grace (`bossGraceNote`) so the hit that pops it counts as a hit. Every other way to hurt a boss goes through those two (I grepped every `hp -=` in the monolith: besides those two they are One's and Cobs's own take-damage functions, the Smash Ball's own hp and fighter-kit objects such as the sentry and the turret).

## 6. The five attacks

Numbers are frames at 60 a second, for an arena of A = 1100; a hit is a share of the base boss hit (22, `bossDmg()`, doubled each loop) times Six's 0.9: BUBBLES! x0.8 (16%), LEAF RAKE! x1.0 (20%), SLAP! x1.0 (20%), ROCK DROP! x1.1 (22%), KICK OUT! x1.2 (24%). Wind-up is the pose in section 4; "turn" is one attack id (a fighter takes at most one hit per turn).

**1. BUBBLES!** (signature move; tag far, air; from phase 1). Canon: she blows bubbles (X Finds Out His Value, Alone; the Baby Bubble Blower 7000 is the prop if one is wanted).
- Wind-up 34. A bubble swells at her mouth, her body puffs.
- Fire: a stream of **3 + one per living fighter** bubbles (cap 8; +2 in phase 2), one every 9 frames, each aimed at a fighter in turn with a little scatter. Radius 26, speed 3.4 (phase 2: 4.2), they curve toward their fighter (homing 0.012, phase 2: 0.02), drift up 0.25 a frame, life 220. Touch = a hit (kb 8, upward) and a pop; an unhit bubble pops at the end of its life, harmless.
- Reads: slow, big, rising: it catches jumpers and ledge-standers, and it follows across a wide stage.

**2. LEAF RAKE!** (ground, far; from phase 1). Canon: she rakes leaves in Alone.
- Wind-up 40. Rake overhead, leaves lift off the ground round her feet.
- Fire: the swing sends a heap of leaves along the floor toward the side you stand on, **across the whole floor** (radius 34, 70 px tall, speed 9: faster than a fighter runs at 6.4, so you cannot outrun it, and a jump reaches about 125 px, so you clear it). It ends at the floor's edge (`waveFloorAt`), never at a hole. Phase 2: a second swing the other way 26 frames later, so you jump twice.
- At the end of its run the heap bursts into harmless leaves.

**3. SLAP!** (close, ground; from phase 1). Canon: she slaps Needle (twice, two episodes); the arm stretches (wiki).
- Wind-up 30 (40 when she has to pop beside you first, a ring, 16 frames of it). Coil pose, the cocked arm behind her.
- Fire: the arm stretches along the row you stood in at the lock (10 frames before the hit), reach **330 (phase 2: 420)** [A, capped], hand radius 34, out in 11 frames, held 5, back in 9. It is a travelling, retracting shot (the code of Springy's `longarm` mitten: reuse it, about 35 lines) so the CPU's dodge and the one-attack watch both see it. Knock: 13 sideways and 7 up, **toward the middle of the arena** (a slap never sends you off an edge by itself).
- Phase 2: a backhand 20 frames after it comes back, the other way, 70% of the reach: it punishes rolling past her.

**4. ROCK DROP!** (spread, ground; from phase 1). Canon: she hurls rocks into the sky in Alone; she tears material from the Moon.
- Wind-up 46. Arms up; the floor cracks open at her feet and **three slabs** rise round her, glowing.
- Fire: the slabs are flung up past the top of the view (14 frames) and come down, one every 20 frames, **one on each fighter** in turn: **2 + living fighters** rocks (cap 6; +1 in phase 2), each landing where its fighter stood at the fling (phase 2: the last two led 20 frames by the fighter's velocity). A growing shadow on the floor under each (`bossFallShadow`); **a rock hurts only while it falls** (the house rule), radius 34, 36 frames of fall, then it breaks (shake, dust, debris, a floor scar) into rubble that is only a picture and fades in 90 frames. It lands on the surface the fighter stands on, a ledge included.
- Built the way the Announcer's cakes and Evil Leafy's falls are: a shot with `delay`, gravity and `landImpact`.

**5. KICK OUT!** (any; **phase 2 only**). Canon: the 800,000 and 900,000 specials, which the wiki calls non-canon: she kicks Seven out of the count, and wears the Stone-O-Boot.
- Wind-up 46: blue ring where she stands, she is gone (8 frames), a ring on the floor 150 px from the fighter she picked (any floor spot with 200 px of floor behind it), then a crouch with one leg back and the stone boot growing on the foot (12-frame grow-in). From the moment she is visible you have 24 frames.
- Fire: the boot swings an arc in front of her, low to high, in 8 frames (three hit spots, foot radius 46, reach 150 to 190), then lingers 18 frames and crumbles. Knock: 15, 14 up, **toward the middle** whatever side she stands on, with a spin (the fighter tumbles across the whole arena, kicked round the world). The lock is 10 frames before the kick.
- This is the pop-and-hit that stops a big stage from being outrun: she is always one move from you.

Picker tags (BOSS_PICK.six): `six:['far','air']`, `sixrake:['ground','far']`, `sixslap:'close'`, `sixrock:['spread','ground']`, `sixkick:'any'`; `moves: ph >= 2 ? all five : first four`; `busy` while an arm, a wave, a rock or the boot is out.

Gaps: 200 / 150 base, times the engine's 1.2 pace: **240 and 180 frames** (4.0 s and 3.0 s between turns), counted from the moment the last shot is gone (one attack at a time). A turn lasts about 2 s, so a turn comes every 6 s, then 5 s.

## 7. Phases (2)

| | Phase 1: Staying Behind (100% to 50%) | Phase 2: Revenge (under 50%) |
|---|---|---|
| Name | she was left to guard the playground in Alone | she kicks Seven out of the count in the special |
| Look | idle render, golden afternoon | the angry render, dusk, leaves swirling |
| Bubble | first bubble (120), no return once popped | at 50% a new bubble (120) with a dusk rim |
| Attacks | BUBBLES!, LEAF RAKE!, SLAP!, ROCK DROP! | all five: KICK OUT! unlocks; 2 more bubbles; a second rake swing; the backhand; 1 more rock, two of them led |
| Pace | gaps 240; stand-off 480 px | gaps 180; stand-off 380 px |

The engine runs three phases (66% and 33%); two is a one-line change (question 2). The phase card reads "Six, PHASE 2: Revenge" (the engine's own banner; the owner may want it off).

## 8. Intro and defeat

**Intro** (the `spawn` slot): a leaf pile in the middle of the floor, trembling, a few leaves hopping, 70 frames; she is inside it and cannot be hit. It bursts (60 leaf particles, `shake(6)`), she rises, and her first bubble swells round her over 12 frames. Her first attack timer is 150. No text. The engine's "BOSS: Six!" card is the only line.

**Defeat** (`BOSS_ENDINGS.six`, about 120 frames, the card held 900 ms): her bubble is long gone; the Sky Blue glow on her hands flickers out, her render cross-fades to the pale Powerless one (the look the wiki gives her once One has taken her power), she sways, and the leaves of the fight (every heap she raked, all the rubble) sweep together into a pile behind her; she falls backwards into it. The one line the ending allows: **"Yay."** (hers, flat, from the end of Alone), on the boss banner for the hold. One lone bubble drifts up from the pile and pops. The pile is the intro's pile: the fight ends where it began.

## 9. How it should look cool

1. The pile that explodes into a fight, and the golden light on it.
2. The bubble: a real soap film, with turning colour at the rim, a wobble when she moves, ripples where hits land, and a satisfying burst.
3. ROCK DROP!: the floor splitting, slabs lifting on a blue aura, flung into the sky, then the shadows closing in.
4. KICK OUT!: the ring, her gone, the second ring, the stone boot swelling, an arc with a blue afterimage, a fighter spinning across the whole stage.
5. The phase change: the sun going down in a second and a half, the angry render, a new bubble.
6. The ending: a pale Six, a flop, a flat "Yay.", one bubble rising. It is funny and it is hers.

## 10. What could go wrong

**Unfair or stuck spots**
- The bubble's hit box (section 5): drawn at 110 px but the engine hits at the body radius; fixed by raising her radius while it stands, and it must not change where her moves start (use a stored base radius).
- A hit that pops it and a hit that crosses 50% in the same frame: the leftover goes to HP and `onBossPhaseChange` runs once; give the stagger only on a pop, never on a phase change.
- KICK OUT! and SLAP! must never launch toward a nearby edge (both launch toward the middle by rule), and her landing spot must be on real floor (`floorSafeX`; the real-edges floor has holes): the Goiky floor runs from 10% to 90% of WW.
- ROCK DROP! must land on the surface the fighter stands on and not through a ledge onto someone under it; rubble and heaps have no collision (nothing to get stuck on).
- LEAF RAKE! at 9 px a frame across a long stage runs 270 frames at A = 2400: long, but it ends at the edge or a hole.
- The pile intro has a timer, so a missed bursting frame cannot leave her hidden and unhittable.

**Engine limits**
- `bossPaced()` is `BOSS_ROSTER.some(...)`: the picker, the one-attack watch, the gap pace and BOSS_TEL_PACE only apply to roster rows. Six must be a roster-style row; if the nine rush bosses are kept off the normal gauntlet (they must be), `bossPaced` has to read the rush list too. `BOSS_ROSTER.length` is also read by the title card, the "all bosses beaten" card and the rush awards.
- `spawnBossRushBoss` sets HP as `hp x BOSS_HP_MULT (1.5) x (1 + 0.6 per extra fighter)`: 1,600 only comes out if the rush sets it directly.
- The engine's `banner(bossTelName(s), 700, 'boss')` still pops the move's name at every wind-up. The owner's rule is no move-name popups: a guard (`if(name)`) and an empty `bossTelName` for Six (and a flag for Two and Four in the rush) is two lines.
- Phase thresholds are fixed at 66% and 33% (section 7).
- Nothing else lowers a roster boss's HP (verified by grep: the other `hp -=` lines are One's, Cobs's, the Smash Ball's and fighter-kit objects'), so Final Smashes, assists and shots all end in one of the two hooks and the shield catches them; a damage path added later must ask the shield too.

**Online** (the relay is never touched here): all of her state lives in `_hz` (bubble `bb`, the stagger frame, the arm, the boot, the pile, the ending's start `et0`), which the snapshot already carries; shots need `netshot` extras (`sixHeap`, `sixRock`, `sixHand`) and the ending is a pure function of the clock, as Two's. The pop's burst is drawn from `hazardT - poppedAt`, not from an event, so a guest that missed a packet still sees it. The shield hook runs on the host only.

**CPU:** CPU fighters already attack any boss and avoid shots. Slap and kick are shots/carriers so they see them; the bubble needs no CPU logic. If the AI ignores the signature (never pops it on purpose) it just fights the pool as plain HP.

**Length:** four minutes is a long boss; the beats (bubble, 50%, second bubble) are what keep it alive, and the pop window is what rewards the player.

## 11. Size, and what to build

**How the engine runs a boss** (what I read, so the build map below makes sense). `startBossRush` picks the flat stage and calls `spawnBossRushBoss`: a summon from the roster row (`makeBossSummon`), the arena key set, the boss's `spawn` slot run. Each frame `updateBossAttack` runs the boss's own movement (`move` slot), the phase check, its `tick` slot, then the cycle: a gap, the position picker (`bossPickTurn`, scored from the `BOSS_PICK` tags against where the fighters stand) names the move, the `tel` slot fixes aims, `bossTelLen` frames of wind-up play the pose from `BOSS_TELLS`, and the move fires (`BOSS_MOVES` for the extras, `fireBossAttack` for the signature) as shots carrying one attack id (`bossAtk`, `volley`). One attack at a time: the next gap starts only when the last shot is gone (`bossAttackWatch`). On a kill `bossRushCheck` heals, pays stocks, runs the boss's `BOSS_ENDINGS` row (`sweep`, `begin`, `holdMs`, `line`) and spawns the next boss 1.5 s plus the hold later; the loop turns over when the boss NAMED Four falls (a name check the nine-boss rush has to replace).

**Medium: about 830 lines, 3 new PNGs.** (Existing bosses: Puffball about 710, Dragon about 840, Two about 1,190, Four about 1,350.)

| Part | Lines |
|---|---|
| roster, extra, pick, moves, gap, phase, phasename (slots) | 35 |
| `SIX` table and helpers (state bag, phase, live, own shot) | 55 |
| spawn and intro pile | 30 |
| movement: stand-off, walk, hover, pops (reuse Two's `twoPop` shape) | 60 |
| the bubble: absorb, hook (2 sites), pop, stagger, new bubble | 75 |
| BUBBLES! 40, LEAF RAKE! 55, SLAP! 45 (reusing `longarm`), ROCK DROP! 60, KICK OUT! 60 | 260 |
| ending | 70 |
| draw: tell (blower, rake, hand, boot), bubble, body fallback, look | 90 |
| shapes (bubble, heap, rock, hand, boot), shot draw, netshot | 65 |
| sky, ground, decor (tree, house, moon, leaves) | 95 |

Reuse list: Two's pop machinery; Springy's `longarm` for the slap; Announcer cakes' and Evil Leafy's `delay` + falls; the Dragon's `volley`/`busy`; `BOSS_TELLS`, `bossCrack`, `bossFallShadow`. New engine lines: shield hook x2 (6), phase threshold (2), banner guard (2), HP set (3). Credits and `fetch-sprites.mjs` lines for the three renders. Checks to run when built (no test suite, per the owner): the game boots, one fight starts, each move forced once (`_pickForce`) fires without an error, the bubble pops and a new one forms at 50%, the ending plays.

**Overlaps to settle with the other nine docs** (I read One's code, not the other new bosses'): One already has MOON ROCKS! (horizontal rocks), OUT OF ORBIT! (a kick) and HANDS FROM THE GROUND!; Six's falling rocks, kick and slap are different in shape (down, an arc, along the row) but the same ideas. Two has a pop and a clap. A Seasonal Shift idea (Six changing into other hosts: the Announcer, the speaker boxes) was left out because it needs other bosses' art and it would repeat them.

## 12. Questions for the owner

1. **HP and the shield.** Is the shield on top of Six's 1,600 (default: 1,600 bar + 2 x 120) or inside it (bar 1,360 + 240, a literal 1,600)? About 4.0 minutes with the shield on top, 3.5 inside it (one fighter).
2. **Two phases or the engine's three?** Two (50%) is the brief, but it is a one-line engine change; three would put the second bubble at 66% and a third state at 33%.
3. **The Stone-O-Boot kick** and the revenge come from subscriber specials the wiki marks non-canon: keep KICK OUT! or swap for a canon move (a trip, as she trips Ten, or a telekinetic fling, as she flings Two: a fling needs a grab, so it is bigger)?
4. **Move-name popups.** The build still shows a yellow name at every wind-up. Remove it for the whole rush, Two and Four included?
5. **Overlaps with One.** Keep Six's rocks and kick even though One has moon rocks and an orbit kick?
6. **Art.** May three wiki renders be fetched (idle, angry, powerless)? Each must be looked at first.
7. **Player count.** Should 1,600 scale with the number of players (the old rush: x1.6 for two, x2.2 for three) or stay fixed?
