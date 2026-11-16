# Three, the owner's own attack: negative numbers that shoot two beams each (2026-11-02)

Design only. Nothing in the game was edited, committed, pushed or run. The owner typed, in the attack box: "summons negative numers that shoot 2 beams at you each." (Three summons negative numbers, such as -1, -2, -3, and each shoots two beams at you.)

Read for this pass: `owner-rules.md`, `attack-picks.md`, `spec.md`, `boss-three.md`, `attack-options-three.md` and the other attack-options files (for the shapes already taken), all in this folder. The game (`artifacts/V1/index.html`, branch ii-dlc) was read only at `damageSummons`, `damageSummon`, `hurtHostileAdd`, `hitJumpBack` and Steve Cobs's METAGS rows, to check that killable adds already exist. Wiki: the BFDI wiki as raw wikitext, in the built-in browser pane, in my own background tab (closed afterwards); nothing downloaded. The wiki is current to mid-2026 TPOT, so this file spoils TPOT 20-25.

Shapes already taken on Three (not cloned): DECIMALS (a stream of four orbs), HALLWAY LASER (an instant row beam from her hands on one of three fixed rows), THE ARMORY (hovering steel thrown in arcs), LEAVE ME ALONE! (a point burst), CONTAGION (a fly-over that sows seeds which burst when touched). Elsewhere in the rush: Four's ZAPPIES (a vertical bolt on a marked spot), 2,763's WINDMILL (six turning arms) and PAN ACROSS (a hand that sweeps the stage), X's ARROW DASH (a line across the stage), Zero's ROLL CALL (a marching file). None of the three options below uses a fixed row, an instant beam, a vertical bolt, a turning arm or a marching file.

---

## 1. Canon: what I could and could not confirm

### Confirmed (BFDI wiki: Negative Algebraliens, Algebraliens, Value, Yoylite, Homeward Bound!/Plot, X Finds Out His Value, Operators, Zappies, Three)
- **Negative numbers are canon, and they are TPOT 23's.** They debut in "Homeward Bound!". A lone Yoylite chunk turned Seventeen negative; Negative Seventeen zapped Fifty-Five, who turned negative too; Twenty-Seven is a third. The Zeroes rounded them up and they moved to a desert on the Math Planet. The wiki's own names for them: "the Negatives" and "Negative Numbers" (that page also wears the wiki's "conjecture" and "ignored name" banners, so it is a fan-compiled page; the Algebraliens page carries the same facts more plainly). "All For One" mentions them (Book says they remain on the Math Planet and must still be dealt with). Cary and/or Michael said at the 2026 BFDI x II tour that negatives will return in future episodes.
- **What they look like.** The colour is inverted from the original (Fifty-Five: Flamethrower Red body, Robin Egg Blue when negative, close to a plain RGB inverse); a **minus sign appears on the body, before the number**; the eyes go black. The pages disagree on the pupils: the Algebraliens page says dark eyes with coloured pupils, the Negative Algebraliens page says black eyes with transparent pupils.
- **What they do.** No will or purpose ("mindless and erratic, like rabid animals"). Powers: **teleportation** (Fifty-Five vanishes right after shooting an energetic charge), **energy blasts** (Fifty-Five fires a laser in the distance, then disappears), and **infection by a beam** (a positive integer hit directly by an infected one's energy beam turns negative; the Value page says the same: a ray from a value-reversed algebralien reverses the target's value, "similar to value loss").
- **A negative three is canon too.** In "X Finds Out His Value" Four combines "-3 and 8 to form 5", and X says he did not know the 3 had a negative variable. Four also teaches the rule that a number moved across the equals sign flips its sign: "if a number is positive, it becomes negative, and vice versa". (The plot page links that 3 to the number character; it does not say it is Three herself.)
- **The minus sign is a character on the wiki.** The Operators page lists Minus (-) as an operator (marked unseen), with a picture of it from "X Finds Out His Value"; "Minus Operator" is also in the phone-book list of minor Algebraliens.
- **Three's own page**: beams from her hands (the wiki links them to the Zappies page), weaker than Four's on her page, and far deadlier in "Homeward Bound!" on the Zappies page; value alteration (her decimals); the Yoylite (she was the second to take it). Her page never mentions negative numbers.
- **BFB had a "Negative Four"**: a cave-drawing recommended character, from "How Loe Can You Grow?" and "A Taste of Space". So "-4" has a canon image, not a role.

### The Inanimate Insanity wiki
Checked on `inanimateinsanity.fandom.com`: there are no pages for Three, Four, Algebralien, Negative or Integer (all return not found), and a text search for "Algebralien" finds only the 2023 BFDI x Inanimate Insanity event video. Nothing about negative numbers or the algebraliens lives there. It does not help.

### Not confirmed: the game's invention
- That Three can **summon** negatives. The wiki has nothing linking her to them (her broken value and the negative infection are neighbouring conditions, nothing more). The Negatives live on the Math Planet; the rush stage is the Fourtress inside Four. This is the owner's idea, not canon.
- The numbers **-1, -2, -3, -5** as characters (canon has -17, -27, -55 and BFB's -4), and the number each one gets.
- Where the beams leave the body (the wiki says only "energetic charge", "laser", "blast"). I chose the eyes, because the black eyes with a lit pupil give a tell on the body; hands would also do.
- Every number, frame, px and colour below. The four decimals' colours (2.9 purple, 3.1 dark yellow, 3.2 green, 3.1111... dark orange) are canon; the teal of the negative slip is mine.
- I did not watch the episodes: everything is from the wikis' text.

---

## 2. What every option shares (so the options below only say what differs)

### 2.1 The body of a negative number
- **Look.** A code-drawn digit (path-drawn like Two's "2", no text, five glyphs for 1-5), a short flat bar in front (the minus sign, 14 px off the digit), a black outline, **black eyes with a pale lit pupil** (the glow at the source: the pupil is where the beam leaves). Body colour is the inverse of the positive's colour from the game's own table (-3 is the inverse of Three's Grapefruit #fd575a: about #02a8a5, teal). I did not read the other numbers' colours; check that -2's inverse does not read as 2.9's purple (give the numbers the black eyes and the minus bar so nothing else in the fight looks like them). Hit circle r 32, floats (`hover:true`), bobs 8 px.
- **Three's own slip for this move: she goes negative.** She crossfades over 20 frames to the inverse of her Grapefruit (teal), eyes black. It is the fifth colour of the Value Slip and sits away from the four decimals' colours and from steady Grapefruit (the laser's calm). A crossfade, never a strobe. She stays **planted** (hovering, bobbing 8 px) from the slip until the last beam is gone, so she is hittable the whole time (the cost of the move is a free hit for anyone who can dodge and attack).
- **Hit path (already in the game).** MePhone4's units and Steve Cobs's METAGS are `hostile:true`, `hover:true` summons with `hp`; `damageSummons` hits them, `hurtHostileAdd` kills them at 0 hp (14 puffs), and `damageSummon` gives the attacker the hit-jump (`hitJumpBack`). Shots hit them too. A negative number uses that path: `{type:"negnum", hostile:true, hover:true, team:-1, r:32, hp}`. Cobs's METAGS carry 75 hp and "ONE TAG AT A TIME" (a new summon is refused while one stands); I copy that rule: one wave of numbers at a time. I did not measure ordinary hit sizes (a jab to a smash is roughly 5 to 12 by my reading, to check), so each option's hp is a starting value in "hits".
- **No contact damage.** The body hurts nothing; only its beams do.

### 2.2 Rules every option meets
- One attack id per turn (`id = ++BOSS_ATK_ID`, `applyHit(f, dmg, kbx, kby, from, {bossAtk:id, volley:true})`, as `fourZapStep` does it): **a fighter takes at most one hit from the whole move**, whichever beam lands first. Knock goes up and toward the middle.
- Anything that appears (a number, a beam's thickness, a crack, a mirror) grows in over 12 frames. A beam hits only once it is half thick. A number is not hittable while it is growing in or flickering out.
- The tell is in the body: the slip, the pose, a beat count, the pupil glow, and a **gaze that freezes** for the last N frames before every beam (the aim is fixed, the player can read where it goes from the pupil and the number's tilt). No telegraph line, ring, banner or move-name popup. World marks used: a floor crack, dust, a glow at the source, only.
- Every beam has a **head that travels** (a few px a frame) and then a lit body, not an instant row: nothing here is HALLWAY LASER. Every beam is aimed along a real vector at a fighter's centre, from a number that floats 170 px up, so it slopes down at about 20 to 30 degrees at 340 px: a **sidestep of about 120 px along the floor** (19 frames of the 28 between a gaze freezing and the head arriving) or **a full jump** (above a 36 px beam for about 30 frames; a short hop clears nothing) answers it. It ends at the floor or the end wall.
- Yardsticks (the Four report's and the game's): run 6.4 px a frame, full jump 126 px, short hop 54, stage 2,400 x 860, floor at 82% height, solid end walls, a platform and two ledges 144 px up, 650 px leash, Three's stand-off 380 px.
- **Stuck-state guard.** Every number carries its own countdown; the move carries a clock `b._hz.t`; when it passes the option's cap every number pops and every unfired beam is dropped. All numbers are also removed on the phase-2 shatter beat (nothing attacks during it), on Three's defeat and on a retry. The picker's `busy` flag for `BOSS_PICK.three` must list the numbers as live, so the next wind-up waits (the "one attack at a time" rule).
- **Online (offline at launch, kept possible).** Everything drawn comes from `b._hz.nums`, a short array of plain rows (number, x, y, state, timers, aim points), and `hazardT`. A beam's lit length is `head speed x (frames since its fire)`; no `Math.random` in a draw; the 12-frame grow-ins are functions of the frame count. With two fighters a number picks the nearer at each lock and its second beam stays on the same one.
- Picker: tag `any`, new attack id `threeneg`, a normal turn (wind-up, action, then the gap of 96 / 68 / 58 frames before the engine's pace). Frames below are at 60 fps, before the wind-up pace (x1.25 on the tell).

### 2.3 Damage, in boss-hit bands
Light 0.3 = 6.6%, 0.6 = 13.2%, 0.8 = 17.6%, 0.9 = 19.8%, 1.0 = 22%. No beam is above 1.0, and one move costs a fighter at most one of them.

---

## 3. THE MENU: three ways to build it

| | 1. DOUBLE NEGATIVE! | 2. NEGATE! | 3. SIGN FLIP! |
|---|---|---|---|
| Shape | a crossfire of planted sentries | a relay: fire, vanish, reappear on your other side | hunters that hold off, plus a beam out of the floor |
| The numbers | rise out of floor cracks around you, stand still | pop in one by one, live about 100 frames each | spat out by Three, drift in to 330 px and hover |
| The two beams | white at where you ARE, then dark at where you are GOING | a thin needle from one side, then a wide slow wave from the other | a steep beam down at your feet, then a beam out of the cracked floor |
| Beats running by | the second beam is an intercept | the copy appears on the side you run toward | stepping off the drop walks you into the rise |
| Pop a number | cancels its second beam | cancels its next beam | cancels its next beam; pop all three and Three is exposed |
| Cost | about 130 lines | about 160 lines | about 210 lines |

---

### OPTION 1: DOUBLE NEGATIVE! (the owner's idea, built straight: a crossfire of sentries)

**Looks like (the tell, 58 frames).** Three crossfades to teal over frames 0-20, black eyes, hovering 20 px lower, a cold teal glow at her palms. Then **three presses** at frames 20, 33 and 46: both palms slam down toward the floor; on each press a floor crack opens at a station with a puff of dust and a number grows out of it in 12 frames, rising to float 170 px up: -1, -2, -3 in that order. Three beats, three numbers; after the third she stays planted, palms down. Each number's eyes are shut until its turn.

**What it does with numbers.**
- **How many at once:** 3 (phase 1), 4 (phase 2), 5 (the 25% ramp).
- **Where they appear:** stations on the stage, chosen at each press from the target's x at that frame: -1 on the side with more room, 340 px from the target, at least 140 px from the end wall; -2 on the other side, 340 px (pulled in to 140 px from its wall, never closer than 200 px to a fighter); -3 on the nearest platform or ledge within 700 px, else on the floor 620 px toward the middle. No two within 220 px.
- **When they fire:** counted from the end of the tell (T0): the gaze of -1 freezes for 14 frames, its **beam A** leaves at T0+14 and its **beam B** 24 frames after A; -2 is 28 frames behind -1, -3 28 frames behind -2. So the beats run A1, B1, A2, B2, A3, B3 about 28 apart; each number leaves 20 frames after its B.
- **The beam (a LANCE).** Leaves the pupil along its aim; thickness grows from 0 to 36 px over 12 frames; its head travels at 26 px a frame to 880 px (34 frames) or to the floor or wall; it holds 8 frames at full length, then the tail retracts at 40 px a frame.
- **The two beams differ, readably.** **A comes from the number's left eye, white, and goes where you are at its freeze** (the 14-frame gaze). **B comes from the right eye, black-cored with a teal rim, and is an intercept**: it is aimed at where you will be when its head arrives if you hold your current velocity (up to 200 px of lead; a standing fighter gets B on the same line as A, a runner gets it ahead of them). B's gaze freezes 14 frames before it fires. The left eye then the right eye is the order, every time.
- **Life:** each number lives about 130 frames after the tell at most; the move clock caps at 300 frames.
- **Remove them:** hp 36 (about 3 to 6 hits). Pop a number before its A fires and it fires neither; between A and B it fires no B. A beam already in flight finishes. A pop gives the hit-jump, nothing else. Numbers float 170 px up, so a melee fighter has to jump at one; ranged fighters shoot up at them.
- **Damage:** A 0.6 (13.2%), B 0.8 (17.6%).

**The dodge, and why running or a wall does not beat it.** Read the gaze: when a number's pupil freezes, sidestep 120 px or full-jump (28 frames of clearance against a lance that is live for about 14 at your spot). For B, do not keep running straight: **stop or reverse after A lands**, because B is the one aimed at your run; a runner who holds a straight line meets the head. Running away fails because stations are on both sides of you at 340 px, each lance is 880 px long and ends only at the floor or the wall (it cannot be waited out behind the wall), and B leads a runner: nowhere on a 2,400 px stage is outside every number's reach. A cornered fighter still faces two lances (the stations pull in to 200 px from the fighter on the open side, so nothing is dropped on them and the corner is not sealed): a jump takes A, a stop takes B.

**PHASE ESCALATION.**

| | Phase 1 (100 to 50%) | Phase 2 (50 to 0%, the numbers wear One's mint aura) | 25% ramp (numbers only, no card) |
|---|---|---|---|
| Count | 3 numbers | 4 (-4 on the platform, firing down at about 25 degrees) | 5 (-5 on a ledge) |
| Faster | head 26 px a frame | head 30 | head 32 |
| Tighter | stagger 28, A to B 24, freeze 14, stations 340 | stagger 22, A to B 18, freeze 12, stations 300 | stagger 18, A to B 14, freeze 12, stations 260 |
| Wider | thickness 36, B lead up to 200 px | thickness 40, B lead up to 260 px | thickness 44, B lead up to 300 px |
| Tougher | hp 36 | hp 44 | hp 44 |
| Damage | A 0.6 / B 0.8 | A 0.8 / B 0.9 | A 0.8 / B 1.0 |

**Exposure window:** none. She is planted, so the whole move is a free target; the gap after it is the normal window.

**Canon.** Negatives are mindless, wear a minus sign, have black eyes, and fire energy beams (Negative Fifty-Five fires a laser); the numbers 1-3 and the eye beams are the game's. Three's slip to the inverse of her own colour is the inversion canon gives the negatives.

**Size:** about 130 lines (the `negnum` summon and its table 25, five glyphs and the minus bar 30, the gaze and fire tick 35, the beam hit and draw 25, the tell and slip 15).

**Risks.** (1) The ramp's ten beams in about 110 frames may be too dense to read: cut it to 4 numbers if a play says so (the owner tunes by feel; never to a bot). (2) A fighter above 170 px (on a ledge) gets a flatter lance: the sidestep gets longer, the jump is the answer; check a ledge fighter against -3 on the platform. (3) If nobody ever pops a number (170 px is high for a melee fighter), drop the hover to 140 px. (4) It can look like a second HALLWAY LASER if the beams were flat: they are not (aimed, sloped, travelling head, from numbers). (5) No stuck state: every number has its own countdown and the clock caps the move; no infinite: a fixed table, nothing re-summons. (6) Online: the stations, aims and timers are plain numbers in `_hz.nums`.

---

### OPTION 2: NEGATE! (a relay: fire, vanish, reappear on the other side of you)

**Looks like (the tell, 44 frames).** Three crossfades to teal over frames 0-20, black eyes. She then holds **her left arm straight out sideways, flat, like a minus sign**, and pinches the air in front of her face with the other hand: **two pinches**, at frames 24 and 36 (two beams each). The minus-arm stays out until the last number's last beam is gone. A teal glow at her pinch. At frame 44 the first number flickers in.

**What it does with numbers.**
- **How many at once:** 3 (phase 1), 4 (phase 2 and the ramp), but they are staggered: at most 3 stand at one moment.
- **Where they appear:** -1 arrives 340 px from the target on the side with more room; -2 arrives 30 frames later 340 px from the target on the other side (offset 120 px outward if it would land within 160 px of another number); -3 30 frames after -2 on the first side again. Never closer than 200 px to a fighter, 140 px from an end wall. Each flickers in over 12 frames (a teal glow at the spot first) and floats 170 px up.
- **Each number's life (phase 1), about 100 frames:** arrives (12 frames, not hittable), eyes open, gaze 22 frames (the last 12 frozen) -> **NEEDLE** fires at +34. The needle's head reaches your spot about 10 frames later; **10 frames after firing the number NEGATES**: it flickers out (8 frames, not hittable) and **reappears at the mirror point** x' = 2 x_target - x_number, where x_target is where you stand on the first frame of the flicker (kept 140 px from a wall and at least 200 px from you; if that is impossible, because you stand at a wall, it reappears on the same side as the needle 200 px from you instead, so a wall does not hide you). The copy grows in over 12 frames, eyes open, gaze 22 frames (the last 10 frozen), then fires the **WAVE** 52 frames after the needle; it fades 12 frames later.
- **The two beams differ, readably.** **The NEEDLE is thin and fast**: 16 px, head 34 px a frame, pale white, from the side the number first stood. **The WAVE is wide and slow**: 56 px, head 18 px a frame, dark with a teal rim, from the **opposite** side. A prick, then a push.
- **Remove them:** hp 18 (about 2 hits) while fully grown and not mid-flicker. Pop the first form before the needle and it fires neither (no mirror comes); pop the copy and there is no wave. A pop gives the hit-jump, nothing else. Because the copy appears on the side you were heading, a ranged fighter can pop it in the 12 + 22 frames it takes to arrive and aim.
- **Life:** each number about 100 frames; the clock caps the move at 280 frames.
- **Damage:** needle 0.6 (13.2%), wave 0.9 (19.8%).

**The dodge, and why running or a wall does not beat it.** Needle: sidestep 120 px or full-jump when the gaze freezes. Then **read the vanish**: the copy appears the same distance from you on the OTHER side, so running away from the first number runs you toward the copy's muzzle (the wave's lock is 10 frames, its head needs about 20 to reach 366 px: you are running into it). Right answers: hold your ground or reverse a step, then **full-jump the wave (28 frames above a 56 px beam; a sidestep needs 145 px, so jump)** when the copy's pupil freezes, or pop the copy from range. A wall does not help because the mirror is computed from where you stand when it vanishes and, at a wall, the copy comes from the open side instead; the walls end the beams but never come between you and the muzzle. Distance does not help because the numbers are placed 340 px from you and the lines reach 880 px, so no point of the stage is out of range; the mirror also leads whoever runs.

**PHASE ESCALATION.**

| | Phase 1 (100 to 50%) | Phase 2 (50 to 0%, mint aura) | 25% ramp (numbers only) |
|---|---|---|---|
| Count | 3 numbers | 4 numbers | 4, chained (see below) |
| Faster | needle head 34, wave head 18 | needle 40, wave 22 | needle 40, wave 24 |
| Tighter | stagger 30, mirror 340 px | stagger 22, each number at its own distance (300 / 380 / 460 / 540), the copy is placed on the LAST frame of the flicker (a quick reversal during the vanish no longer fools it), flicker 8 -> 6 | stagger 14, distance 260 px, gaze 22 -> 18 (the freezes stay 12 and 10) |
| Wider | needle 16 px, wave 56 px | needle 18, wave 62 | needle 20, wave 72 |
| Chained | none | none | each number's vanish is the next number's arrival, at the vanished number's old spot: a hand-off, so the move is one continuous count |
| Damage | needle 0.6 / wave 0.9 | needle 0.8 / wave 1.0 | needle 0.8 / wave 1.0 |

**Exposure window:** none. She is planted with the minus-arm out the whole move (about 200 frames), the longest free target of the three, and the normal gap follows.

**Canon.** Teleporting right after shooting is exactly what Negative Fifty-Five does ("fires a laser in the distance before disappearing"), and teleportation is on the negatives' power list; a number mirrored through you is the game's pun on negation (x becomes -x). The flat arm as a minus sign is a pose joke.

**Size:** about 160 lines (the 130 of Option 1 minus the stations, plus the vanish and mirror logic 30 and two beam types).

**Risks.** (1) The wave is the closest of the three to HALLWAY LASER in look (a wide beam at your height): the sloped aim, the 18 px head and the other-side muzzle separate it; if the owner still sees a second laser, give the copy a higher hover (260 px) so the wave comes down at about 35 degrees. (2) A mirror point with no legal spot (a wall, a platform in the way): the fallback above, and if no spot exists at all the number fires from where it stands; no stuck state, because the clock pops everything at 280. (3) The flicker must not strobe: 8 frames out and 12 in, a soft teal glow either side. (4) Two fighters: the mirror uses the nearer at the vanish, the wave goes to the same fighter. (5) If a number is popped mid-flicker it cannot be (it is not hittable then), so no half-state. (6) Online: positions and timers are plain; the mirror x is stored in the row when the flicker starts.

---

### OPTION 3: SIGN FLIP! (hunters you can pop, and a beam out of the floor)

**Looks like (the tell, 50 frames).** Three crossfades to teal over frames 0-20, black eyes. She **draws a long breath**, swelling 8% and tipping her head back, and **blows out three dark teal puffs** at frames 28, 36 and 44 (three beats); each puff grows in 12 frames into a number in front of her mouth: -1, -2, -3. They are born at her, not at the floor. A glow at her mouth on each puff.

**What it does with numbers.**
- **How many at once:** 3 (phase 1), 4 (phase 2), 4 in pairs (the ramp).
- **Where they go:** each drifts out at 9 px a frame, then at 3.0 px a frame, to hover 170 px up, **330 px from the target** (they hold 300-360 px: if you close in they back off at 3 px a frame, never closer than 300 px, until they have fired), at least 160 px from each other and Three, 140 px from an end wall. They bob 8 px. Because they stay out, they are alive and visible the whole move.
- **When they fire:** counted from the end of the tell: -1 at +80, -2 at +110, -3 at +140 (30 apart).
- **The two beams differ, readably, and the second comes out of the floor.**
  - **The DROP** (white): from the number steeply down at **your feet at the freeze** (about 30 degrees at 330 px): the gaze drops to the floor for 14 frames, a **floor crack** opens at your feet spot S (the allowed mark; it is the bounce point), then the beam leaves, head 28 px a frame, 34 px thick, and **ends at S**, with dust. A fighter standing on S is hit; stepping away from the number even 50 px is safe.
  - **The RISE** (dark, teal rim): when the drop lands, S **glows** for 22 frames (12 grow, 10 frozen: the crack widens and a pale glare fills it, the glow at the source) and then a beam leaves **from the crack** along a shallow line at where you are by then (an intercept in phase 2), 34 px thick, head 28 px a frame, up to 520 px. The first beam plants the second muzzle in the floor.
- **Remove them:** hp 30 (about 2 to 5 hits). A pop before the drop lands cancels both (no crack). A pop between the drop and the rise cancels the rise (the glare dims). **A popped number flips**: its minus falls off, and a harmless +n floats up into Three and pops against her. A pop gives the hit-jump.
- **Damage:** drop 0.6 (13.2%), rise 0.9 (19.8%).
- **Life:** each hunter about 150 frames; it rises and fades 20 frames after its rise; the clock caps the move at 300 frames.

**The dodge, and why running or a wall does not beat it.** Drop: step 50 px away from the number when the gaze drops (easy: it is the light beam, it exists to push you). The trap is **where that step puts you**: the rise leaves the crack at S aimed at where you are heading, so stepping off S and running on walks you into it. Answer the rise: **full-jump it** when the crack's glare freezes (28 frames above a 34 px beam), or step back **toward** the hunter, under the drop's line, or pop the hunter before the rise. Running away does not beat it: the hunters hold 330 px off and do not follow beyond their stand-off, but S is placed at your feet and the rise leaves from S, so it starts where you are; the intercept (phase 2) leads a runner. A wall changes nothing: S is on the floor wherever you stand, the rise's reach is 520 px, and a cornered fighter jumps it like anyone.

**PHASE ESCALATION.**

| | Phase 1 (100 to 50%) | Phase 2 (50 to 0%, mint aura) | 25% ramp (numbers only) |
|---|---|---|---|
| Count | 3 hunters | 4 (the 4th hovers 260 px up for a steeper drop, about 40 degrees) | 4, firing in pairs from both sides |
| Faster | head 28, drift 3.0 | head 32, drift 3.6 | head 34, drift 3.6 |
| Tighter | stagger 30, drop freeze 14, glow 22 | stagger 22, freeze 12, glow 18 | stagger 18 (a pair every 36), freeze 12, glow 16 |
| Smarter | the drop and the rise aim at your spot | both aim as an intercept (they lead a runner, up to 260 px) | the pair crosses: a drop and a rise from opposite sides overlap |
| Tougher | hp 30 | hp 38 | hp 38 |
| Damage | drop 0.6 / rise 0.9 | drop 0.8 / rise 0.9 | drop 0.8 / rise 1.0 |

**Exposure window: yes, small.** If **all** the numbers are popped before the last rise leaves, the move ends at once and Three is **exposed for 120 frames at x1.5** (the shared `algExpose(s, 120, 1.5)`; her colour goes steady Grapefruit for the window: the calm is the look). A partial clear gives no window. Honest worth: at the measured 8 hp a second that is about 8 extra hp of 2,700, so it is a flourish; the real prize is the cancelled beams and the early end of the move. If the owner wants the pop to pay, raise the multiplier (the shared state takes any).

**Canon.** "If a number is positive, it becomes negative, and vice versa" (Four in "X Finds Out His Value") is the pop; a floor-planted second muzzle, hovering hunters and the drift are the game's. Negatives are mindless and fire energy; hunting at a standoff is a game choice.

**Size:** about 210 lines (Option 1's 130, plus the hunters' hold-off drift 20, the crack and the floor muzzle 30, the pop-flip and exposure 20, the 4th hunter and pairs 10).

**Risks.** (1) The largest build, and the most to tune (drift, standoff, the glow time). (2) If hunters stay out of reach and nobody pops them, the window is never used: acceptable, it is a bonus. (3) The crack must be a floor crack with a glare, not a ring or a line: it is the allowed mark, nothing more. (4) The rise is a low beam from the floor and can look like a floor-row beam for a moment: it is short (520 px), aimed and travelling. (5) Two fighters: each hunter picks the nearer at the drop's freeze and its rise stays on that fighter; hunters need a spacing rule (160 px) so they do not stack on Three. (6) Stuck state: a hunter that cannot reach its stand-off (a wall) fires from where it is; the clock pops everything at 300; a popped hunter's crack is removed with it. (7) Online: the hunters' positions, S and the timers are plain rows.

---

## 4. Recommendation

**Pick Option 2, NEGATE!.** Why:
1. It is the best answer to the rule that **nothing is answered by running**: the copy appears on the side you run toward, at the same distance, and a wall cannot be used (at a wall the copy comes from the open side). Options 1 and 3 beat a runner with an intercept; this one beats the whole idea of fleeing the first number.
2. **The two beams differ the most**: a pale thin needle from one side, then a dark wide wave from the other, with a visible vanish between. The player learns "prick, flip, push" in two uses.
3. It has the strongest canon of the three for a game move: Negative Fifty-Five fires and then vanishes, teleportation is on the negatives' power list, and "negation" gives the mirror its name.
4. The numbers live about 100 frames each, so the owner's "summons" never becomes a standing crowd, the stuck-state surface is small, and Three stays planted with the minus-arm out (a fair free hit for a player who dodges).
5. Mid cost: about 160 lines against Option 3's 210, and no new hit path (the game's hostile adds already take hits).

Choose differently if: you want the cheapest and most literal build (Option 1: planted numbers, two beams, nothing else); or you want the numbers to be something you **fight**, like Cobs's tags, with a reward for clearing them (Option 3, the only one with an exposure window and the one most worth the extra lines).

Open for the owner: whether a number should be hittable at all (all three say yes, with the game's existing add path; Option 2's 18 hp makes a pop optional); whether the minus-teal slip is the right sixth look for her; whether to name the numbers beyond -3 (-4 has a canon image, from BFB; -5 is ours).

---

## 5. The question-box lines (at most 200 characters each)

1. DOUBLE NEGATIVE!: -1, -2 and -3 rise around you and stand guard. Each shoots two beams, one where you are and one where you are heading. Pop one to cancel its second beam. Grows to 5 numbers.
2. NEGATE!: -1, -2, -3 pop in one by one, shoot a thin beam at you, vanish and reappear on your OTHER side for a wide, slow beam. Run from the first and you run into the second.
3. SIGN FLIP!: three floating negatives hold off and shoot a beam down at your feet, then a second beam out of the cracked floor. Pop all three and Three is left wide open for two seconds.

---

## 6. What I did not do

- I did not open or run the game beyond reading the add functions named above; I did not play, measure a fighter's hit size, or read the other numbers' colour table.
- I fetched wikitext only (no image, no file); I did not view any render of the negatives, so the glyph design (digit, minus bar, black eyes, lit pupil) follows the wiki's words.
- I did not decide the hp values by test: they are starting values in "hits", to be tuned by the owner's playthrough, not by a bot.
