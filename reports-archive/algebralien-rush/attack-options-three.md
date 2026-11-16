# Three, Algebralien Rush: attack options (2026-11-02)

Read-only study. Nothing in the game was edited, committed or pushed. Inputs: `spec.md`, `boss-three.md`, `owner-rules.md` in this folder, and the game (`artifacts/V1/index.html`, branch ii-dlc) read only for the picker (`PICK`, `bossSituation`, `bossPickWeight`).
Canon read again for this pass, as raw wikitext on the BFDI wiki through an already-open browser-pane tab (no navigation): **Three** (whole page), **Value** (the Decimals section), **Alone**, **Homeward Bound!/Plot**, **All For One/Plot**, **That's What Foes Are For/Plot**. The Inanimate Insanity wiki has nothing on Three and was not needed. The wiki is current to mid-2026 TPOT, so this file spoils TPOT 20-25. Wiki text is paraphrased, never copied.

The owner's ask: "give me options for the attacks" (the owner chooses in question boxes and likes to pick more than five). Three is boss 8 of 9: 2,700 hp, the common 2,400 x 860 stage with solid end walls, a 650 px leash, 4 stocks +2 per boss. Eight options: the director's designed five (marked DESIGNED, as designed) plus three new ones (marked NEW) found by rereading canon.

## 0. The eight at a glance

| # | Move | Source | Shape | Slip (colour plus pose) | Hit | Tag |
|---|---|---|---|---|---|---|
| 1 | DECIMALS | designed | a stream of four orbs, one per number | all four decimals in firing order | 0.7 to 0.9 (15-20%) | any |
| 2 | HALLWAY LASER | designed | a full-width row beam | steady Grapefruit, hands cupped | 1.0 (22%) | any |
| 3 | THE ARMORY | designed | steel lobbed in arcs | purple 2.9, one hand up | 0.8 (17.6%) | ground, air |
| 4 | LEAVE ME ALONE! | designed | a point burst round her body (the corner answer) | all four strobing, curled up | 0.9 (19.8%) | close |
| 5 | OVERSHOOT | designed | a dash through your row, ends in a wall bonk | dark yellow 3.1, backing off | 1.0 (22%) | far, wall |
| 6 | THE CATCH | NEW | a bouncing ball that goes out and comes back, toss then hurl | dark orange 3.1111... | 0.8 (17.6%) | any |
| 7 | CONTAGION | NEW | a fly-over that sows a hedge of glitch seeds on your line (a floor trap that spreads) | green 3.2, shaking, rising | 0.8 (17.6%) | any |
| 8 | THE CLAMP | NEW | an anti-air grab and slam, only for a fighter hanging in the air | purple and yellow split, top of her float | 1.0 (22%) | air |

Every hit is at or under one boss hit (22% of the fighter meter). The engine caps one attack id at `bossDmg()` and every part of a turn shares one id, so one turn costs a fighter at most 22%.

Rules every option meets: the tell is in her body (a slip, a pose, a glow at the source; no telegraph line, ring, reticle, banner or move-name popup); anything that appears grows in over 12 frames; the new moves change colour by crossfade no faster than every 20 frames (no strobe); the boss has no contact damage; launches go up or toward the middle; nothing makes her unhittable; every move starts with a slip, so the signature holds for all eight. One flag on the designed five: LEAVE ME ALONE! is written as colours "strobing" every few frames, and the house rule is no flash that strobes, so build that tell as a fast crossfade, not a flash.

## 1. The five the director designed (as designed; numbers are `boss-three.md` section 6 and 10)

1. **DECIMALS** (signature, `attack:"three"`). Tell 46 frames: four slips of 9 frames in the firing order (2.9 purple, 3.1 dark yellow, 3.2 green, 3.1111... dark orange), an orb swelling at her raised hand each time, the last 8 frames steady on orange while the aims lock. Four orbs, one every 14 frames, each aimed at where you stand as it leaves: 2.9 falls short (arcs, dies at its first floor touch, 0.7); 3.1 overshoots (flat, 120 px over your feet, goes on to the wall, 0.8); 3.2 is bigger (radius 22, homes 60 frames, 0.9); 3.1111... repeats (sheds a smaller copy every 20 frames, 3 copies, a train of "1"s, 0.8). Phase 2: the four fly twice, the second time in reverse. Dodge: one answer per orb, learned from the colour.
2. **HALLWAY LASER** (`threelaser`). Tell 54: pure Grapefruit (the only calm tell), she drifts onto one of three fixed rows (floor, platform, high) in 28 frames, cups both hands, a white-hot spark swells; the last 16 frames she holds still so the row is readable. Beam 44 px tall, grows in 12, full until frame 24, 1.0, knock 14 away and 8 up. Phase 2: both hands, then a second beam 20 frames later on the row you are in now. Dodge: leave the row; a full jump clears it (tight, about 25-30 frames above a 24-frame beam). On the big stage cap the beam at about 1,100 px from her hands.
3. **THE ARMORY** (`threearmory`, 2.9). Tell 48: purple, one hand rises palm up, the left cell glows and its bars bend open (12 frames), five pieces of steel (helm, sword, round shield, axe, boot) lift out, grow in and hover in a fan above her. One piece every 12 frames at your spot as it leaves, 9 px a frame, gravity 0.18, 0.8, knock 9. Phase 2: seven pieces, two at once, one from each side (the right cell opens in the shatter beat). Dodge: keep moving, step under each arc.
4. **LEAVE ME ALONE!** (`threepanic`). Tell 36: she curls up, arms over her face, squashed to 80% and shaking, colours strobing through the four decimals at random, static tight to her body (no ring). A static burst grows to body radius + 150 over 12 frames, stays 8 more, 0.9, knock 17 away and 11 up. Phase 2: a second burst 24 frames later, 40 px bigger. The corner counter forces it (cornered 45 frames, then a 300-frame cool-down). Dodge: you need about 21 frames to run clear from touching her; the wind-up is 36 plus pace, so it is a trade you can win.
5. **OVERSHOOT** (`threechase`, 3.1). Tell 40: dark yellow, she backs toward the wall behind her (12 frames), hunches toward you, tilted forward about 25 degrees, the last 14 frames still, row locked. She flies along the row at 15 px a frame through your spot; only her core (0.7 of her radius) hurts, 1.0, knock 14 and 9 up. At the wall she bonks (dust, shake) and is stunned 24 frames, the one scripted free hit in her kit. Phase 2: she bounces straight back on a re-locked row. Never starts closer than 260 px. On the 2,400 stage cap the run at about 900 px past you or the wall, whichever comes first.

## 2. The three new ones

### 6. THE CATCH (`threecatch`)  [NEW: a ball that goes out and comes back]
- Looks like: she holds out one hand, palm up; a red ball pops into it (a puff, grows in over 12 frames) and her good eye follows you. She stays PLANTED for the whole move, so she is hittable the entire time the ball is out. Rhythm: TOSS, then HURL (phase 2: TOSS, TOSS, HURL).
- Tell: slip to dark orange 3.1111... (the decimal that repeats; the ball repeats) and the pose, 44 frames for the first toss (slip 10, ball in 12, underhand arm back). The HURL has its own longer tell, 20 frames more: arm drawn right back, body leaning backward, eye squeezed shut. That is the body saying "this one is hard".
- The ball: radius 26, leaves her hand toward your spot with a lead of 8 frames of your velocity, and BOUNCES on the floor (gravity 0.3), timed so a touchdown lands on your spot. Toss: 9 px a frame, apex about 150 px (the arch is about 220 px wide at body height, so a fighter can stand under it), a bounce about every 500 px. Hurl: 13 px a frame, flat (apex about 50 px), so it has to be jumped (a short hop does not clear it). It flies out to your distance + 200 px (at least 520, at most 760), HANGS for 6 frames (the ball tells its own return), then flies straight back to her hand at 15 px a frame (the hurl's return at 17) and she catches it with a clap of the hand.
- Dodge: toss, walk under the arch or step off the touchdown; hurl, jump it; the return, leave its line (jump, or drop to a ledge). The return is what catches a player who only ever runs away from her.
- Why it works on 2,400 px: it is faster than any run on both legs, its reach is bounded (760 px), and the return leg is the "leads your run" answer. About 5 seconds in phase 1, 7 in phase 2, all of them with her standing still (so the boss takes the hits while you dodge a ball).
- Damage: medium, 0.8 = 17.6% (one hit per turn whichever pass lands).
- Canon: "Alone" (TPOT 20), the 2009 flashback: Three throws the ball to Five, Five throws it so hard it hurts her and gives her the black eye (plot and Three's page read). The bounce, the return and the toss-toss-hurl rhythm are game text.
- Collision check: X's ARROW DASH is a straight line across the stage on your row and does not return; Four's hearts bounce but are not in his picks. Cost about 80 lines (a shot with a reverse, a planted rule, a catch pose).

### 7. CONTAGION (`threeglitch`)  [NEW: a fly-over that sows a hedge; a floor trap that spreads]
- Looks like: she shakes hard and a strip of green glitch shears off her outline; she rises to the top of her float band, then glides across the hall past you at 12 px a frame, a seed dropping from her hand every 20 frames. A seed is a small hovering glitch (a 2.9 / 3.1 / 3.2 digit glyph that crossfades slowly, never a strobe), body radius 40, centre 40 px above the floor. Each seed grows in over 12 frames, flickers harmlessly for 24 more, then goes solid green and pulses slowly: armed.
- Tell: slip to green 3.2 (the decimal that is "bigger": the glitch spreads), shaking and rising, 50 frames. The fly-over itself is the second tell: the seeds appear where she passes, a few steps ahead of you.
- Fire: she glides from her side to 320 px past your x, so the seeds lie ON and AHEAD of your line. Phase 1: 4 seeds, 240 px apart; phase 2: 6 seeds. Touching an armed seed makes it burst (radius 110, live 8 frames, 0.8, knock up and toward the middle). CONTAGION: when a seed bursts, whether you touched it or hit it, every other armed seed within 260 px bursts 14 frames after the one beside it, a domino along the row (phase 2: 320 px). Seeds fade harmlessly after 360 frames. No seed lands within 160 px of a fighter or 140 px of an end wall, so nothing is dropped on you and no corner is sealed.
- Dodge: go round by a ledge, full-jump a seed (the top is 80 px up; tune the height so the weakest full jump, 107 px, clears it), or walk the gap between two (160 px between their bodies). A seed hit from range (a shot or a long attack) bursts at once and sets the row off, so a ranged fighter clears the hedge from afar; a melee fighter has to jump it or take the long way.
- Why it works on 2,400 px: the glide is faster than 9 px a frame, the seeds sit on your running line, and the hedge stays 6 seconds, so chasing her across it costs jumps and she gets her distance back. It is the only move that changes the hall instead of firing into it.
- Damage: medium, 0.8 = 17.6%. A seed hits a fighter once (each seed its own id) and its knock throws you away from the row (120 px), so at most one or two seeds reach one fighter in a pass.
- Canon: the Value page and Three's trivia: a ray from an Algebralien with a broken value makes objects glitchy, and the glitch is contagious (Pineapple, "That's What Foes Are For" flashback, plot read: Three glitches and accidentally zaps Pineapple, who stays corrupted). Seeds, arming and the domino are game text.
- Collision check: not Four's SOUP'S ON (always-on pools you stand in), not X's SNAP (columns of floor static that are then deleted; these are small digit glyphs in the air), not Zero's TAPE TOSS (tapes lie 20 frames; seeds stay 6 seconds), not 2,763's FLOOD or LIGHTS. Cost about 90 lines.

### 8. THE CLAMP (`threeclamp`)  [NEW: anti-air, a vertical grab and slam]
- Looks like: she rises to the top of her float band, turns to a fighter who is in the air, and lifts one hand, fingers spread, a purple glow growing at the palm (a glow at the source). A translucent force hand (about 160 px) then grows in over 12 frames around the fighter, tracking them; if they are still airborne it closes and slams them down.
- Tell: the one two-tone slip, purple on the left half of her body and dark yellow on the right (the two decimals either side of 3), 28 frames: rise 10, hand up 18. Her good eye locks on the airborne fighter. After the 28 frames the hand takes 12 frames to grow in and close, so a fighter has 40 frames in all to be on something.
- Fire: at the close the clamp holds 14 frames, then slams them to the floor under them at 16 px a frame: 1.0, dust and shake, knock up 10 and toward the middle. A fighter who is standing (floor or ledge) when the hand closes is not touched: the hand closes on air, fades, and she lowers her arm for a 24-frame free beat. Range 600 px from her (her stand-off is 380). Phase 2: range 800 px (drifting away no longer works, only coming down does) and a second hand 18 frames behind the first, on where the fighter is at that moment.
- Guards (nothing unavoidable): never fires at a fighter in hitstun or inside a special, and never within 24 frames of the last hit she landed, so a launched or committed fighter is not clamped. Picked by the engine's own `air` tag, which makes it six times as likely when a fighter is airborne and plain odds otherwise; if nobody is airborne it whiffs and is a free beat.
- Dodge: land (drop to a ledge, fast-fall), air-dodge, or drift 220+ px away (from her stand-off of 380 that is past 600 in the 40 frames).
- Why it works on 2,400 px: its reach is long, so distance does not save someone hanging in the air; the only answer is to come down. It is the answer to jumping over her HALLWAY LASER, which is why the two make a pair.
- Damage: heavy, 1.0 = 22%.
- Canon: "Homeward Bound!" (plot read): Three floats into the air and uses her powers to slam Six against the cage door. Slamming a fighter who is airborne, and the guards, are game text.
- Collision check: 2,763's SLAM is black hands falling on shadows on the floor; this is a grab of a fighter in the air. No landing waves and no stuck window (X's dive keeps those). Four's GO BYE-BYE is a pull and is not in his picks. Cost about 60 lines.

## 3. Which attack carries the signature (and must stay)

DECIMALS carries THE VALUE SLIP and must stay: it is the only move that shows all four colours in order, so it teaches the colour language the rest of the fight reads. LEAVE ME ALONE! should stay too, because the corner counter forces it and it is her movement identity (the wall is the fight). Everything else can be swapped. All three new moves keep the signature by starting with their own slip and pose.

## 4. Tell table (colour is never the only tell)

| Move | Colour | Pose |
|---|---|---|
| HALLWAY LASER | steady Grapefruit | hands cupped at her chest, settles on a row, holds still |
| THE ARMORY | purple 2.9 | one hand up, steel lifting out of the left cell, head tilted |
| OVERSHOOT | dark yellow 3.1 | backing off, hunched, tilted forward, shaking |
| DECIMALS | four, in order | arms out, a flicker sequence, an orb at her hand |
| LEAVE ME ALONE! | strobing through all four | curled up, squashed, shaking |
| THE CATCH | dark orange 3.1111... | palm up with a red ball, arm back (hurl: leaning backward, eye shut) |
| CONTAGION | green 3.2 | shaking, green shear off her outline, rising, then a long glide |
| THE CLAMP | purple left, yellow right | top of her float, one hand up toward you, glow at the palm |

Green and orange also appear inside DECIMALS' slip sequence (its third and fourth orbs), and the CLAMP's split reuses the ARMORY's purple and OVERSHOOT's yellow: that is deliberate, the sequence teaches the four colours and the single-colour moves reuse them, and the pose is what tells two moves apart. The split is the only two-tone tell, so nothing else reads like it.

## 5. What I dropped, and why (if the owner wants one back, say so)

- The face blast (canon: in the flashback her failed self-repair bursts fire from her eye and mouth with electricity and throws Four back). A fire jet that pivots up through a fighter is not fairly dodgeable (a jump does not clear a jet that rises with you) and not readable without a line, and a fixed jet is HALLWAY LASER again. Could return as a row-locked jet with a recoil.
- Three copies of her closing in from three sides (the Decimals are listed as her relatives). Two's CLAP FULL SPAN owns "closing in from both sides".
- The grey blanket as a move. It is her intro and her ending ("a small pop and the blanket falls empty"); as an attack it would be seen 20 times and the ending would lose its surprise.
- Flora (the branch she grew to shelter everyone from the rain in "Alone"). The first pass skipped it for Evil Leafy's vines, and rain is already crowded (Six, Zero, X).
- A telekinetic yank into the cage door at the end wall. It only hits someone hugging a wall, and 2,763 owns CAGE.

## 6. Picking and cost

Recommended seven (the owner picks): DECIMALS, HALLWAY LASER, LEAVE ME ALONE!, OVERSHOOT, THE CATCH, CONTAGION, THE CLAMP. That gives seven different shapes (stream, beam, burst, dash, out-and-back, hedge, anti-air) and leaves THE ARMORY as the first cut, since it is a second thing thrown at you in an arc. The designer's main risk for Three is repetition (about 100 turns in 2,700 hp); more than five moves is the cheap answer, and seven is still far below One's thirteen.
Cost (full-boss estimate 700 lines for the designed five): THE CATCH +80, CONTAGION +90, THE CLAMP +60. All three on top of the five is about 930 lines. Phase 2 stays "the same moves, doubled": the second toss, six seeds with a wider chain, a second hand.

## 7. A heads-up for the kit (M3)

The picker's distances are fractions of `WW`: `near` 0.30, `farFrom` 0.28, `farTo` 0.50, `edge` 0.20. On a 2,400 px stage that is `close` inside 720 px, `far` from 672 px, `wall` inside 480 px of an end. With her 380 px stand-off the body-to-body gap is about 295 px, so `close` reads 0.59 and LEAVE ME ALONE! (tag `close`) weighs about 4 against 2 for an `any` move, all the time, while OVERSHOOT's `far` reads 0 until the gap passes 672 px and its `wall` needs a fighter inside 480 px of an end. Unless the rush kit keeps `PICK` in pixels, her tags stop meaning what the designer wrote (the same holds for every rush boss that uses them). `air` is unaffected (it reads feet against the floor line), so THE CLAMP is safe as it stands. Worth a line in the M3 brief.

## 8. Questions for the owner

1. Which of the eight (the recommended seven above, or more)?
2. THE CLAMP only grabs fighters in the air, and punishes hanging there: keep, or would a grab feel unfair?
3. Want the face-blast back as a row-locked jet?
