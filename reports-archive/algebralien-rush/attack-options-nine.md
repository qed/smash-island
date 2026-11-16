# Nine, Algebralien Boss Rush: attack options (2026-11-02)

READ-ONLY on the game (branch ii-dlc): nothing was edited, committed or pushed. Sources: `spec.md`, `boss-nine.md`, `owner-rules.md` in this folder, the BFDI wiki read again as raw wikitext in my own browser-pane tab (Nine; the transcripts of Alone, Seasonal Shift and the 800,000, 900,000, 1,000,000 and 1,500,000 subscriber specials; Skateboarding aliens; Evil Canyon; BFDI Mini Resort), and three game constants checked in `index.html` (jump -12.5, gravity 0.62, run 6.4; the traced fighter hurtboxes).

The owner's ask: "give me options for the attacks". Nine is boss 3 of 9, health 1,400, on the common 2,400 x 860 stage (solid end walls, no pits, a 393 px centre platform and two 200 px ledges, all 144 px up), a 650 px leash, 4 stocks +2 per boss. The owner picks, and likes to pick more than five. EIGHT options below: the director's designed five exactly as designed, plus THREE new ones in canon.

House rules every option meets: the tell is in the body (a pose, a glow colour, a beat count, a 14-frame gather); no telegraph lines, rings, banners or move-name popups; only the allowed world marks (a real shadow under what falls, dust, a glow at the source); anything that appears grows in over 12 frames; falling things hit while they fall; one attack id per turn, so a fighter takes at most ONE hit from a move; nothing above one boss hit (22%); no contact damage; no strobe; launches go up or toward the middle; nothing is answered by running; nothing is unavoidable.

## 1. Yardsticks used (so the numbers can be checked)

- Run 6.4 px/frame. Jump: a full jump rises 126 px (JUMP -12.5, GRAV 0.62; the weakest jumper 107 px per `attack-options-four.md`), a short hop 54 px. A fighter's traced hurtbox is only about 65-70 px tall and 50-60 px wide, so a standing fighter's head is near 70 px; a short hop lifts it to about 125 px, a full jump to about 195 px.
- Boss hit bands: light 0.3 (6.6%), 0.6 (13.2%), medium 0.8 (17.6%), 0.9 (19.8%), heavy 1.0 (22%). One boss hit is 22% of the fighter meter.
- Big-stage contract from `boss-nine.md`: every move is measured from the TARGET (the fighter the wind-up locked on), never from a wall; lane and landing lock 14-20 frames before the stunt; no pass is faster than 24 px/frame; a pass runs on until it has overtaken the locked fighter by 260 px. Nine's gap is 80 / 66 / 54 frames by act.
- The exposure rule (GLUED TO THE BOARD): every dodgeable stunt ends with Nine EXPOSED (no attacks, +50% damage). Windows in frames: board run 56 / 50 / 44, bike 44 / 38, BOOYAH! 26 / 22 / 20, GRIND! 30 / 26 / 22; CLEANUP CREW! and STONE-TO-BOOT! leave none.

## 2. The director's designed five (as designed; spec.md section 1 and boss-nine.md section 6, with the spec's corrections applied)

Corrections already in the spec: BOOYAH! has no landing shock waves (X's dive owns that shape); the motorcycle and the boot are written at 1.0, not 1.1.

| # | Move | Shape | Acts | Tag (what it punishes) | Tell (body) | Hit |
|---|---|---|---|---|---|---|
| 1 | TUBULAR! (board run; act 2 also the motorcycle run) | gap-closer: a pass along the floor | 1-3 (bike 2-3) | ground, far (bike: ground, wall) | backroll 170 px, crouch, blue glow, 2 beats, sparks; the bike: headlight glow and engine roar at the camera edge, a dead tree grows in 760 px past you | board 1.0 (22%); bike 1.0, blast 1.0, shards 0.6 |
| 2 | CLEANUP CREW! | floor trap: a rolling rhythm of low boards | 1-3 (platform lane from 2) | ground, platform (act 2) | arm points to the side, dark-blue glow, 3-beat count, dust from the far edge | 0.6 each (13.2%) |
| 3 | BOOYAH! | jump-in: a flip, then the fall | 1-3 (a pair from 2) | close, air | one deep crouch, cream glow, a shadow grows under the landing | flip 0.8 (17.6%), fall 1.0 (22%) |
| 4 | STONE-TO-BOOT! | vertical: a drop, then a kick | 2-3 | close, ground | cranks a machine, stone-grey glow, 3 beats, pebbles shake loose, a boot-shaped shadow follows you | fall 1.0 (22%), kick 0.9 (19.8%) |
| 5 | GRIND! | combo: up a ramp, along a platform, off in an arc | 1-3 | platform, air, far | pumps toward the quarter-pipe, yellow glow, 2 beats, the rail glows faintly cream | rail 0.9 (19.8%), fall 1.0 (22%) |

## 3. The eight options

### 1. TUBULAR! (designed; the board run, with the motorcycle form in act 2)  [shape: gap-closer]
- Looks like: Nine backrolls 170 px away from you (pose `coil`), blue glow, 2 beats; the last 14 frames a low crouch, sparks and dust; a glint on the sunglasses on the last frame.
- Does: rides straight through your locked spot on the floor at 16 / 18 / 20 px/frame and keeps going until 260 px past it (cap 1,700 px); a trail ribbon in the board's three colours is visual only. The hit circle is 46 px, 46 px up. Ends in the wipeout (the window).
- Act 2 form: the motorcycle, 22 px/frame, tree 760 px past you, a blast of radius 100 for 6 frames and eight shards (7-12 px/frame, 0.6 each), Nine walks out of the fire (canon: explosion resistance).
- Dodge: hop it (about 22 frames spare with a full jump). Why it works on 2,400 px: it starts beside you, is placed on your lock, and is faster than any run.
- Damage: heavy, 22% (bike 22%, shards 13%). Canon: the board and the slang; the glued feet are the 900,000 special; the motorcycle explosion is the 1,500,000 special (the crash into a tree is in its transcript). The stunt is game text.

### 2. CLEANUP CREW! (designed)  [shape: floor trap, a rhythm]
- Looks like: Nine raises an arm to the side the boards come from (pose `rear`), dark-blue glow (the crew's colour), a 3-beat count.
- Does: 4 / 5 / 6 Skateboarding Alien boards (dark blue, conjoined eyes that track you) roll in from 640 px away at 8 / 9 / 10 px/frame, 1,500 px each, gaps 150, 150, 270 px and repeat. Act 2: three more roll the other way along the top of the nearest platform a second later. Act 3: the floor boards turn at the end and come back 2 px/frame faster.
- Dodge: hop each board; the gaps give a rhythm. No window (the reward is that it is slow and long).
- Damage: 0.6 each (13.2%), one hit per fighter. Canon: Alone (Nine calls the aliens the cleanup crew; the aliens are skateboards with eyes). The rolling lanes are game text.

### 3. BOOYAH! (designed)  [shape: jump-in]
- Looks like: one deep crouch (pose `crouch`), cream glow, one beat, then up; the aim follows you and locks 14 frames before takeoff; a real shadow grows under the landing from takeoff.
- Does: a high arc (54 / 48 / 44 frames, apex 240 px) to your spot. Frames 14-36 a flip with a hit circle of radius 100 around the body (the catch for a jumper); the falling body hits while it falls (radius 76). No landing waves. Act 2: a second ollie 20 frames after the first landing, to where you moved.
- Dodge: move after the lock; do not jump into the flip. The stuck landing after the last landing is the window (26 / 22 / 20).
- Damage: flip 0.8 (17.6%), fall 1.0 (22%). Canon: the 800,000 special (the entrance flip) and Seasonal Shift ("Booyah!"); the arc is game text.

### 4. STONE-TO-BOOT! (designed; act 2 on)  [shape: vertical, drop and kick]
- Looks like: Nine cranks a machine (pose `shake`), stone-grey glow, 3 beats, pebbles and dust shake loose over your spot; a boot-shaped shadow grows in over 12 frames and follows you until 14 frames before the fall.
- Does: a code-drawn stone boot falls 14 frames from 420 px up (radius 72); on landing `impact()`; 12 frames later it kicks along the floor toward the stage's middle (240 px in 12 frames, radius 70); rests 30 frames, sinks. Act 3: a second boot 32 frames after the first kick.
- Dodge: step off the shadow, then hop the kick lane. No window.
- Damage: fall 1.0 (22%), kick 0.9 (19.8%). Canon: the 900,000 special (Nine and Six build a huge boot in the Stone-To-Boot-O-Tron); the fight use is game text.

### 5. GRIND! (designed)  [shape: combo, rail then leap]
- Looks like: Nine pumps toward the quarter-pipe at the nearest platform end (back 120 px, forward 160, 2 beats; pose `lunge`), Sunglow-yellow glow, the platform's rail lights faintly cream.
- Does: up the ramp, along the platform top at 13 / 15 / 17 px/frame, 40 px up (sparks, a white flicker; hit circle radius 50, front of the board); at the far end an ollie off in a 46-frame arc to your spot, locked 20 frames before the leave; the falling body hits (radius 70).
- Dodge: a fighter on the platform jumps the grinder (slower than the floor run); a fighter on the floor is safe from the rail but dodges the landing by moving after the lock. Stuck landing 30 / 26 / 22 is the window. Needs a platform 360 px long (the picker drops it if none).
- Damage: rail 0.9 (19.8%), fall 1.0 (22%). Canon: game text only, a skater's trick in the spirit of Alone's skatepark.

### 6. THE STACK!  [new option; shape: sweep, a tower tips over a pivot]
- Canon: the 800,000 special (Four, X, Eight and Nine stand on top of Seven to make a tower, Nine near the top) and Alone (the aliens are Nine's cleanup crew; Nine tumbles over them). The crew standing in for the numbers is game text. The wiki marks the subscriber specials non-canon.
- Looks like (about 62 frames): crew boards roll in from the camera's edge behind Nine and hop onto each other end on end, four hops of about 8 frames (the eyes track you), Nine rising with them until he stands on top; dust at the base. The whole column then sways three times, each sway bigger, toward the side it will fall (the three-beat count, in the body of the tower); the last 14 frames a hard lean.
- Does: four boards on end (about 380 px) with Nine on top (about 160 px more) tip over toward you and fall in about 40 frames (slow for 12, then fast); the base is placed so the tip lands on the spot you lock 18 frames before the fall (plus your run's lead). ONLY the top 350 px (the top two boards and Nine) hurt: circles of radius 56 along that stretch, knock up 12 and away from the base 6; the lower two boards are harmless. Falling things hit while they fall. After the slam the boards clatter and roll on 300 px at 9 px/frame as low boards (radius 26, 0.6, the same attack id: a fighter the tip hit takes nothing more). Nine tumbles off at the tip (the NineScared render, glasses crooked) and lies flat: the window, 50 / 46 / 40 frames.
- Dodge: take two or three steps PAST the tip (60-100 px, easy in the 58 frames from the lock to the slam), then hop the rolling boards. A platform inside the hot band (190 to 540 px from the base) is not safe: drop to the floor. A jump into the band is hit. The brave answer is to run in under the harmless base. Act 3: five boards (a 550 px column), the rolling boards 2 px/frame faster.
- Why it works on 2,400 px: it is the tallest thing in the park, so it reads from the edge of the screen; the base goes on the middle side, so the fall runs toward the nearer solid wall (never off the world); the reach is over 500 px, so a fighter standing off at 400-600 px is still inside it; placed on your lock and leading your run, so running is not the answer.
- Damage: heavy, 22% (the rolling boards 13%). Tags: ground, platform, far. Acts: 2 on. Size: about 110 lines (the drawn tower 40, the state machine 40, the hit and tumble 30); reuses the crew boards and eyes from CLEANUP CREW!.
- Nearest relatives, and why this is not them: BOOT and BOOYAH! come down on a spot; X's ROCKET DIVE drops on a locked shadow and throws low waves (this throws none); the tower is a long arc around a pivot with a harmless base.

### 7. CANYON JUMP!  [new option; shape: area denial in the air]
- Canon: the Nine page's Powers list ("gravity manipulation": a motorcycle over Evil Canyon without falling) and the Yoylite's white aura ("Nine [white aura]" in the Homeward Bound transcript; the Nine page's Yoylite Power picture); Alone opens with Nine and the aliens rolling off a cliff edge and making a gesture before Nine tumbles; the wiki files Nine under Flyers. The flat glide is game text. CAUTION: the canyon crossing itself is only on the Nine page and on Evil Canyon's non-canon list; the 1,500,000 transcript opening I read shows only the motorcycle, Six jumping off and the crash into the tree.
- Looks like (about 52 frames): a kicker ramp (a low wedge, about 160 px long, 50 px high) grows out of the floor in front of Nine over 12 frames; Nine backrolls 120 px, then rolls up it; at the lip a white aura flares around Nine and the board (grows in over 12 frames, no flash) and Nine floats FLAT with his arms out (the gesture) for 14 frames. Those 14 frames are the lock: the heading and height are fixed there.
- Does: glides level across the stage at 18 / 20 / 22 px/frame about 215 px above the floor (a hit circle of radius 60, so the band is 155 to 275 px up), through your lock and 260 px past it (cap 1,500 px), then drops off the aura in a 20-frame glide slope and wipes out at the end: the window, 48 / 44 / 38 frames.
- Dodge: stay on the floor; a short hop is under the band (the head reaches about 125 px); a full jump or a platform (a fighter on a 144 px platform spans 144 to about 212) is hit. If you are on a ledge, drop through it during the 52-frame tell. The floor is the answer, and the reward is that the wipeout lands at the end of a lane you have just walked under.
- Why it works on 2,400 px: a glide of 700+ px at 18-22 px/frame is nearly three times a run, from a ramp that grows on Nine's side, 380 px from you, so the start is always on screen. It is the move that makes a ledge and a high jump costly in act 1, where the spec's ledge rule (a fighter on a platform must not be nearly safe) has only GRIND! to lean on.
- Damage: medium-heavy, 0.9, 19.8%, one hit, knock up 12 and 6 along the glide. Tags: air, platform (the picker draws it only when someone is up: a floor-only fight would never get it). Acts: 1-3. Size: about 90 lines (the ramp and aura draw 30, the state machine 40, the hit and window 20).
- Nearest relatives, and why this is not them: X's ARROW DASH is an arrow across the stage on your row and Three's HALLWAY LASER is a row beam (floor, platform or high), both instant lines; this is a slow body with a long, readable look that you beat by staying LOW. Its end (the wipeout) is Nine's signature, not theirs.

### 8. SKATE AWAY!  [new option; shape: chase and grab, the only move that carries you]
- Canon: Alone: Nine, tearing up, picks Ten up in his arms and they skate away together on Nine's new board (checked in the transcript). Also the 1,500,000 special (Nine rides a motorcycle with Six as a passenger; Nine knocks Fifteen out by accident), which the wiki marks non-canon. The grab and carry on a fighter is game text.
- Looks like (about 46 frames): Nine rolls to a spot about 300 px BEHIND you (on the side nearer a wall, so the carry runs toward the middle), stands with his knees bent and both arms swung wide open (pose `scoop`), sways slowly side to side twice (two beats, Sunglow-yellow glow), then in the last 14 frames drops into a low crouch with his arms low and spread and the wheels spark. His face is the crying render (canon: he is tearing up). The pose and the two slow sways are the difference from GRIND!'s pump, which shares the glow colour.
- Does: bursts 20 / 22 / 24 px/frame along the floor for up to 14 frames through the spot you lock 16 frames before; a scoop box 100 px wide and 60 px high at his front. If it connects, you are held in his arms (the hold-and-spit state Four's GO BYE-BYE! already has), carried about 30 frames at 14 px/frame (about 420 px) toward the middle and set down with a toss (up 14, 6 inward). If it misses, he cannot stop (glued): 260 px on, then the wipeout window, 44 / 40 / 36 frames.
- Dodge: be above 60 px when the scoop passes: a full jump (the weakest jump has about 24 frames above 60 px; a short hop does not); or be out of its reach. The tag keeps it from being drawn at range, so a far fighter is simply not chosen.
- Why it works on 2,400 px: at 20-24 px/frame the burst is 3 to 3.75 times a run and starts 300 px behind you on screen; the carry is the stage-size answer to a fighter who hangs back, because it MOVES YOU 420 px (toward the middle, where Nine's other moves reach). It is the answer to crowding him for a melee string, without being a point burst (Three's).
- Damage: medium, 0.8, 17.6%, at the set-down (the carry itself does none; about 0.5 seconds of lost control, one hit per turn). Tags: close. Acts: 1-3. Size: about 100 lines (the state machine 50, the hold 30, the scoop and carry draw 20).
- Nearest relatives, and why this is not them: Six's KICK OUT! (she pops BESIDE you, a boot swings, you tumble toward the middle) also relocates you; this one is a floor rush and a carry, and Nine starts behind you. Four's old GO BYE-BYE! (an inhale and a spit) is not on the owner's picks for Four.

## 4. How the eight fit together

| Lane / answer | Moves |
|---|---|
| Floor pass, hop it | TUBULAR! (and the bike), SKATE AWAY! (the scoop box is 60 px) |
| Floor rhythm, hop each | CLEANUP CREW! |
| Move after the lock | BOOYAH!, STONE-TO-BOOT!, GRIND!'s landing, THE STACK!'s tip |
| Platform is hot | GRIND!, CLEANUP CREW! (act 2), THE STACK! (the band), CANYON JUMP! |
| Stay LOW | CANYON JUMP! (the only one) |
| Run IN under the base | THE STACK! (the brave answer) |
| Do not crowd him | SKATE AWAY! |

Every one of the eight ends in a visible payoff for dodging except CLEANUP CREW! and STONE-TO-BOOT! (long and slow by design): the wipeout (board, bike, CANYON JUMP!, SKATE AWAY!'s miss), the stuck landing (BOOYAH!, GRIND!) or the tumble off the tower (THE STACK!). Windows are the same shared exposed state with +50%.

## 5. The signature

GLUED TO THE BOARD is carried by TUBULAR! (the board run): it is the first and cleanest commit (the lane locks 18-20 frames early, he cannot stop, turn or cancel), it sets the rule that DODGING opens the boss, and the wipeout is its proof. It must stay. If the owner drops it, move the 56 / 50 / 44-frame wipeout rule to CANYON JUMP! and SKATE AWAY! and keep at least one run that ends in the window in act 1.

## 6. Ideas I looked at and dropped, and why

- A skate loop ridden or orbited (canon: Alone, the aliens skate a loop and it collapses): in a side view a ring of hazards reads like Four's ring, and a ridden loop collapses into a TUBULAR! pass with an air section. The collapsed loop stays background scenery (as the spec has it).
- Glue puddles (canon: the glued feet; glue in the sub-count spot): pools that deny the floor are Four's SOUP'S ON!.
- A campfire or marshmallows (canon: Alone): fire patches are X's ember patches, and lava is 2,763's.
- A homing pet board or "Skatecat" (canon: the aliens are petted pets): homing and poppable is Six's BUBBLES!, a ground chaser is Four's CACTUS DRIVE.
- A handstand spin (canon: the 900,000 special, "brother of another color", the 6/9 gag): in side view it is a low bar or a head-height wall that cannot be answered; kept only as an optional garnish at the top of BOOYAH!'s flip, as `boss-nine.md` has it.
- A 360 spin or windmill around his body: 2,763's WINDMILL. A point burst when crowded: Three's LEAVE ME ALONE!.
- A third thing falling on a spot (a drop tower as an attack): BOOYAH!, STONE-TO-BOOT! and X's dive already come down on you; the drop tower is also Nine's defeat gag.
- Seasonal Shift's host swaps (Nine becomes the Cheese Orb, a VR headset, a flute): the wiki line says it, but it is the timeline replacing the host, so claiming a power from it would be a stretch. Left out.
- A beam from the sunglasses' shine: One's EYE LASERS! and Three's HALLWAY LASER already own beams.
- Fifteen (the 6 + 9 fusion), the BFDI Mouth, a pick-the-safe-one choice (X's and Three's), interrupting a call (Zero's), copying your special (Two's), the shield (Six's): other bosses' signatures or characters outside the rush.

## 7. Canon checked on 2026-11-02, and what I could not confirm

- Read as raw wikitext: Nine; Skateboarding aliens; Evil Canyon; BFDI Mini Resort and four of its episode pages (Nine is only a host there; nothing used); the transcripts of Alone, Seasonal Shift (Nine hosts Cake at Skate, is kicked into the sky), and the subscriber specials 800,000, 900,000, 1,000,000, 1,500,000.
- Alone is canon; the subscriber specials are on the wiki's non-canon list (the 800,000 tower, the 900,000 boot and glue, the 1,500,000 motorcycle). Every move here is a canon moment, ability or prop turned into game text; the wiki has no Nine fight.
- Not confirmed: the Evil Canyon crossing as a scene (only the Nine page and the Evil Canyon page say it); Nine standing on top of the number tower (the transcript says Four, X, Eight and Nine stand on top of Seven; the order up the tower is not given); the "Why is the BFDI Mouth everywhere?" page body (not read).
- Pronouns (internal text only, nothing prints): they/them, as in `boss-nine.md`.

## 8. Suggested sets and questions for the owner

- All eight work together: act 1 would draw from TUBULAR!, CLEANUP CREW!, BOOYAH!, GRIND!, CANYON JUMP!, SKATE AWAY!; act 2 adds the bike, STONE-TO-BOOT!, THE STACK!, the crew's platform lane and BOOYAH! as a pair. Nine A and B (M6, M7) grow from about 950 lines to about 1,250 with all three new ones (lean path 750 to about 1,000).
- If the owner wants fewer: keep TUBULAR! (the signature), CLEANUP CREW!, BOOYAH! and GRIND!, then add one new one per taste: CANYON JUMP! if the ledge should cost something in act 1, THE STACK! for the biggest set piece, SKATE AWAY! for the one move that touches you differently.
- Cut order if the build is short: THE STACK!'s rolling boards, the bike, the platform lane, then SKATE AWAY! (the hold is the costly part), then THE STACK!. TUBULAR!, CLEANUP CREW!, BOOYAH! and GRIND! stay.
- Questions: (1) Is it all right that CANYON JUMP! can never hit a fighter who stays on the floor (the picker only draws it when someone is up)? (2) Is about half a second of lost control in SKATE AWAY! acceptable (30 frames; Four's old hold-and-spit was 18)? (3) Does the 800,000 special's tower, with the crew standing in for the numbers, read as Nine, or would the owner rather have the numbers themselves (more art)?
