# Zero, Algebralien Boss Rush: attack options (2026-11-02)

Read-only study (nothing in any worktree was edited, committed or pushed). The owner's ask: "give me options for the attacks", picked in question boxes, and they like to pick more than five when they like them. Zero is boss 5 of 9: health 1,800, the common 2,400 x 860 stage with solid end walls, a 650 px leash, 4 stocks +2 per boss. Sources: `spec.md` (section 1.1, paragraph 5; section 14, M9 and M10), `boss-zero.md` (the designer's numbers, copied below), `owner-rules.md`, and the BFDI wiki read again today as raw wikitext in the browser pane: Zero, Zeroes, "Thanks for 2,763,000 Subscribers!" (the whole plot), "Thanks for 3,517,000 Subscribers!" (the whole plot), and the Zero lines of "Homeward Bound!". The game was only grepped (commit a316e32) to confirm the helpers the options lean on: `bossShot`, `bossShotLive` (shots that `linger` do not hold a turn), `bossFallShadow`, `arenaHazardHit`, `bossDmg`. Everything in CAPITALS is game text, not canon, and the wiki is paraphrased, not copied.

## 0. At a glance: eight options

Five are the director's designed kit, kept exactly as designed. Three are new, each from a canon moment and each in a shape none of the five has.

| # | Attack | Source | Shape | The player's job | Phases | Hit |
|---|---|---|---|---|---|---|
| 1 | ROLL CALL! (signature) | designed | a sweep along the floor, with an interrupt | hop the line, or hit him mid-call | 1, 2, 3 | 17.6% |
| 2 | TAPE TOSS! | designed | area denial: a lobbed comb with shadows | read the shadows, walk out | 1, 2, 3 | 13.2% |
| 3 | DIVIDE BY ZERO! | designed | a close chop that erases shots | back off or air-dodge | 1, 2, 3 | 22% |
| 4 | STOP LAUGHING AT ME! | designed | a gap-closer: a red roll into the far wall | hop it, stand on a platform | 2 (see flag B) | 22% |
| 5 | THE FOOT! | designed | a vertical: a stomp on a locked shadow | walk out from under | 3 | 22% |
| 6 | SORRY, SORRY! | new | a combo: a lob, a scurry, a swing | move on the cue | 1, 2 | 17.6% |
| 7 | STAND STILL! | new | a floor trap that wakes: three pounces | weave, cross under an arc | 1, 2, 3 | 17.6% |
| 8 | GET HIM! | new | a chase: a scuffle cloud that homes | hop, platform, or lure it into a wall | 2, 3 | 17.6% |

The signature is ROLL CALL! (the megaphone fizzle). It must stay. Every other option can be dropped without touching what Zero is.

## 1. Rules every option obeys

Yardsticks (from the Two and Four option files, so the three bosses read alike): a run is 6.4 px/frame (the roster tops out at about 7.2); a full jump rises 126 px (the weakest fighter 107); a short hop 54; the camera shows about 1,528 px of the 2,400. One boss hit is 22% of the fighter meter (`bossDmg()`); bands: light 0.3 (6.6%), medium 0.8 (17.6%), heavy 1.0 (22%). A turn is ONE attack id, so a fighter takes at most one boss hit from it and no hit is above 22%. Wind-ups are `tel` x 1.25 frames. Gaps after a move: 100 / 76 / 58 by phase, then x1.2. Tiers are two a phase (six in all, cut at each phase's midpoint) and change counts and coverage only, never speed or damage.

Every option meets the rush's own tests:
- Tells are the body's (pose, a glow colour, a count of beats, the last 8 frames flicker white). No line, ring, reticle, banner or move-name popup anywhere. The only world marks used are the allowed ones: a real shadow under what falls, grit, a glow at the source. Anything that appears grows in over 12 frames.
- Nothing is answered by running (the "hold run away for 60 s" check): each move is placed on you at its lock, or leads your run, or homes, or is faster than a sprint.
- Falling things hit while they fall. No contact damage. No strobing flash. Launches go up or toward the middle, never off the world.
- Numbers are STARTING values for the owner to tune by feel. They are never tuned to a bot.

## 2. The designed five (as designed)

Numbers are from `boss-zero.md` section 3.5 (frames at 60 fps; `tel` x 1.25 is the real wind-up). The picker's tags are in brackets.

### 1. ROLL CALL!  (signature)  [ground]  designed
- Tell: `tel 48` = 60 frames. Pose `rise` (he stretches tall), glow cap-blue #7f8cff, 3 beats (a three-count chant), white flicker f52-60. World: grit shakes off the pipes; in phase 2 the shelf Zeroes turn their heads.
- Fire: a conga line of hypnotised Zeroes (r 24, blank stare) grows in over 12 frames at the floor end farthest from the nearest fighter, never closer than 140 px, and marches along the floor at 7 px/frame, 310 px apart. They are shots (`pierce`, one id), 0.8 of a hit (17.6%), knock 10 up and away, armed 12 frames after the grow-in. The first marcher reaches the nearest fighter in at most about 128 frames (start 900 px or less) and the line ends about 400 px past the last fighter.
- Tiers: 4, 5 | two lines from both ends, 4+4, 5+5 | plus a line along the centre platform, 4+4+4 | 6+6+5.
- The fizzle (the signature): if Zero loses 18 HP or more between the start of the wind-up and the end of the call, the megaphone squeals and cracks, no Zeroes come, and he stands flustered for 90 frames (hands over his face, pink cheeks). Checked in his own tick, so no engine edit. Zero stands still holding the megaphone for the whole move: that is where you hit him.
- Dodge: hop each one (apex 126 against a Zero 48 px tall), stand on a platform that has no line on it (phase 3 puts a line on the platform), or interrupt.
- Canon: Zero page, Summoning (the main Zero alone works the megaphone that calls every Zero); the 3,517,000 special (thousands of Zeroes march in droves, the megaphone is locked unless the hat-wearer holds it). The fizzle is game text.

### 2. TAPE TOSS!  [bunch]  designed
- Tell: `tel 36` = 45 frames. Pose `rear` (winds the box back), glow steel #9aa0b4, 2 beats.
- Fire: 4 / 5 / 6 / up to 8 VHS tapes lobbed in an arc, flight 55-70 frames: one at the spot you stood when it left, the rest in a comb across it. A real shadow (`bossFallShadow`) grows and darkens under each tape in its last 30 frames, the only world tell. They hit while falling (r 18, 0.6 of a hit = 13.2%, knock 8), then lie for 20 frames and shrink away. From phase 2 each tape leaves a different shelf Zero's hands.
- Dodge: move out of your own spot; the comb is wider than a jump, so it is a walk.
- Note for the lead: the report gives the comb spacing as "0.11 of the stage width, or 130 px". On 2,400 px those are 264 px and 130 px (a comb of eight is then 1,850 px or 910 px wide). Pick one when M9 is briefed.
- Canon: the box of tapes and the humiliating tapes (the 2,763,000 special plot; Zero page). Lobbing them is game text.

### 3. DIVIDE BY ZERO!  [close]  designed
- Tell: `tel 44` = 55 frames. He draws a big white division sign (it grows in over 12 frames at his hand) and leans away: pose `coil`, glow white, 2 beats; in the last 14 frames he steps 70 px toward you.
- Fire: the sign chops in front of him: a tall box (1.7 of his radius tall, reach 1.6 radius + 60, so 164 px at radius 65, 246 px for the Giant), active 10 frames, 1.0 of a hit (22%), knock 14 away and up, one frame of white. Whatever it touches is divided away: it deletes fighters' shots and traps in its box, with a small white ring where each vanished. From tier 3 its two dots shake loose and roll away, one each way, 7 px/frame, r 18, 0.6 of a hit (13.2%); from tier 5 they are bigger; at tier 6 he chops twice (a backhand 22 frames later). 24 frames of recovery.
- Dodge: back off past the reach, air-dodge, or hop the dots. It punishes crowding him, so the picker weights it high exactly when someone is close.
- Note for the lead: section 4.5 of the report sums a rolling dot at 8.8% while the move text says 0.6 (13.2%). I used the move text; the lead should settle it.
- Honest big-stage note: this is the one designed move that does not cover distance. It fires only at close range. The other moves carry the range, which is why it is fine.
- Canon: Zero page, Numerical Banishment (a number divided by Zero is destroyed); the 3,517,000 special (the calculator that vanishes at "2763/0", the hunt for the division symbol). The chop is game text.

### 4. STOP LAUGHING AT ME!  [ground, wall]  designed
- Tell: `tel 54` = 68 frames; the door is the body. He pops into a freezer door 600-900 px from the nearest fighter (the side with more room); the door bangs three times, each harder, frost and a cold glow leaking, the last bang at f58; glow red #ff3b2a, 3 beats, no pose. He is hidden but still hittable at the door.
- Fire: the door blasts off as a shot (0.5, knock 12) and he rolls out in red, flattened to about 70% height so a normal jump clears him, 12.5 px/frame along the floor, 1.0 of a hit (22%), knock 14, up to 1,400 px. He hits the far wall and stays stunned 55 frames. Tier 5 and up: he bounces off and rolls back before the stun.
- Dodge: hop the roll, or stand on a platform; do not stand at the door. The stun is the reward.
- Canon: the 2,763,000 special: locked in the meat freezer, counts down from three, bursts out in a pure red rage and throws the TV over; Zero page, Adrenaline Boost. The roll and the wall are game text.

### 5. THE FOOT!  [any]  designed
- Tell: `tel 46` = 58 frames. The Giant leans back and lifts a leg: pose `tilt`, glow Sandstorm #f4d53d, 2 beats. A real shadow grows under the landing spot, follows the nearest fighter until 12 frames before the drop, then locks; grit falls from the ceiling.
- Fire: a gray foot (a rounded oval, 220 px wide) falls from above the screen at 30 px/frame (about 20 frames), hits while falling, 1.0 of a hit (22%), knock 14 up and out. It lands with a shake and a scar and stays planted 30 frames (hurts nobody). Tier 6: a second foot 28 frames after the first lands, where you are then.
- Dodge: walk out from under the shadow.
- Canon: the 3,517,000 special: the Giant Zero raises a giant foot and stomps 2,763, then 3,517 (hence two feet). The shadow and the numbers are game text. The same drawn foot is reused by 2,763's ending.

## 3. The three new options

All three are built from code-drawn Zero glyphs and props: no new art, no new sound. Each needs one or two new body poses (`cup`, `hush`, `point`), drawn in the code body, about 10 to 15 lines each, already inside the line estimates.

### 6. SORRY, SORRY!  (the coffee, then the smack)  new  [any]
Shape: a combo (a lob, a scurry, a swing). Phases 1 and 2 (the planted Giant cannot scurry).

- Looks like: Zero cups a steaming mug in both hands. After two sips it slips out of his hands. He covers his mouth, bows twice, and on the second bow runs at you with his arms flapping and swings one big flat backhand "by accident".
- Tell: `tel 36` = 45 frames. Pose `cup`, glow coffee-orange #d9863a, 2 beats (two sips: his head tips back at f14 and f30), the mug slips at f38 with his arms flying up, white flicker f37-45. Nothing else is on the stage but steam.
- Fire, beat 1 (the mug): a flat lob to the spot you will be (your position plus your last 10 frames of run), flight 36-52 frames, up to 700 px. A real shadow grows under it in its last 24 frames. On landing a splash, radius 110 px, active 14 frames, 0.8 of a hit (17.6%), knock 8 up.
- Between the beats (24 frames): he bows twice (f0-10 and f12-22), open and hittable. The deeper second dip is the cue.
- Fire, beat 2 (the scurry and smack): at the end of the second bow he locks your spot (plus 12 frames of your run) and scurries along the floor to 130 px short of it, 14 px/frame, at most 420 px (30 frames or less). On arrival one flat backhand in front of him: reach 190 px, active 8 frames, 0.8 of a hit (17.6%), knock 10 up and toward the middle. Then 30 frames with his hands over his face.
- One id: splash or smack, never both, so the worst case is 17.6% and there is nothing to gain by eating the splash on purpose.
- Tiers (it only lives in tiers 1-4): tiers 1-2 as above; tier 3 the splash grows to 130 px; tier 4 after the smack he says sorry again (18 frames) and swings a second backhand the other way, 22 frames after the first.
- Dodge: stay out of the splash as the mug lands; at the second bow stop or reverse and put 190 px or more between you and the spot you were on. A steady runner is led and gets caught, a player who answers the cue is not.
- Why it works on 2,400 px: the mug leads your run and flies 700 px; the scurry (14 px/frame) beats any sprint, and a 420 px scurry plus the 190 px swing covers the whole 650 px leash. No pop, no teleport: you watch him come.
- Damage: medium, 17.6% (0.8).
- Not a repeat: Six's KICK OUT! pops in beside you and kicks (this one is a visible run, with a lob first); Nine's stunts end in an exposed window with a damage bonus (here the bow is a plain 24-frame beat with no bonus and no stun).
- Canon (page checked): the opening of the 2,763,000 special: one Zero throws a mug of coffee at another by accident, apologises, then hurts them again (Zero page, Personality; Zeroes page gallery: coffee on a face, burn marks). The apology-then-second-hit is why tier 4 swings twice. The scurry and the numbers are game text.
- Build: about 70 lines. The mug is a `bossShot` lob with `bossFallShadow`; the scurry is a boss script like the roll in STOP LAUGHING; the swing is a short-lived shot at his hands; one drawn mug prop.

### 7. STAND STILL!  (the statues)  new  [any]
Shape: a floor trap that wakes (an ambush of three pounces). All phases.

- Looks like: Zero puts a finger to his lips, freezes stiff, then points at the floor three times. At each spot a rigid Zero grows in, arms at its sides, eyes front. Then, one at a time, each shivers and sweats for a beat and pounces in a high arc onto where you are standing at that moment.
- Tell: `tel 40` = 50 frames. Pose `hush` (finger to lips f0-14, frozen f14-28, then three jabs at the floor f28-50, one statue growing in per jab), glow roster-gray #c7c7d0, 3 beats (the three jabs), white flicker f42-50.
- The statues: three Zeroes (r 24), planted (a) 300 px ahead of you in your run direction (the side with more room if you stand still), (b) 300 px behind you, (c) on the nearest platform or ledge within 500 px, otherwise on the floor 600 px out on the side with more room. They cannot be hit and do nothing until they wake. They wake 45, 85 and 125 frames after the tell ends, in jab order, so the first possible hit is 63 frames after the tell.
- The wake: a shiver of 18 frames (the body rattles, a sweat drop, the eyes find the nearest fighter). At the shiver's end it locks on the nearest fighter's spot (plus 10 frames of their run) and leaps: 34 frames in the air, apex 150 px. It hits only on the way down (the last 14 frames) and for 6 frames after landing (r 56): 0.8 of a hit (17.6%), knock 8 up and toward the middle. A puff and it is gone. No waves, no stuck window.
- One id: one hit at most from the whole move. Zero himself holds the pose (hushing the room) and stays hittable the whole time, so the player may spare a glance at him: the risk is the reward. The shots do not `linger`, so no new attack starts until the last pounce is done.
- Tiers: 1-2 three statues; 3-4 four (two on the floor each side, the platform one, one 600 px out); 5-6 five, the last two waking together (shiver 14 frames).
- Dodge: after a statue's shiver, run under its arc (the arc is above 70 px for most of its flight, and it only hurts coming down) or step 130 px or more from the locked landing (about 3.8 px/frame over the flight). Nothing needs a jump.
- Why it works on 2,400 px: the statues are planted around YOU, not at him; one is on the platform, so the platform is no refuge; a runner is led; the three timings are staggered so one dodge does not do for all.
- Damage: medium, 17.6% (0.8) a pounce.
- Not a repeat: not X's dive (that is a drop from the sky with waves and a stuck window; this is a sideways arc, no waves, no stuck); not Two's or Six's drops on a shadow (no shadow); not 2,763's CAGE (nothing stays standing).
- Canon (page checked): Zero page, Longevity: the Zeroes stood in the exact same spot for three years; Zeroes page: they stand by the whiteboard for three days "like they usually do" (the 2,000,000 special) and began as still props in the subscriber count. The pounce is game text.
- Build: about 80 lines. Three "sleeper" shots with a state timer (idle, shiver, leap), the leap on the same arc physics the tapes use, drawn as a pure function of the clock; one pose.

### 8. GET HIM!  (the posse)  new  [far]
Shape: a chase. Phases 2 and 3 (the squad is out of the pipes).

- Looks like: Zero stamps and jabs an arm at you twice. Far off a scuffle cloud pops out of a pipe mouth, a rolling tangle of arms, legs, hats and tiny Zero faces with dust puffs, and rolls after you, getting faster. It skids when it overshoots, bounces off one wall, then bursts into five dizzy Zeroes who walk off.
- Tell: `tel 32` = 40 frames. Pose `point`, glow lavender #b9a6ff, 2 beats (the two jabs); the shelf Zeroes jump and cheer; white flicker f32-40.
- Fire: at the nearest pipe mouth 600-900 px from you (never closer than 300 px), on the side with more room, the cloud grows in over 12 frames (armed 12 frames later). Radius 36 (72 px tall). It rolls along the floor toward the nearest fighter, homing: 5.4 px/frame rising 0.03 a frame to 8.6 (about 107 frames); passing you it skids 24 frames, turns, and re-accelerates from 3. One bounce off an end wall. It lasts 300 frames or two passes, whichever is first, then bursts (harmless, 40 frames). Hit: 0.8 of a hit (17.6%), knock 10 up and away from it (toward the middle), one id.
- Tiers: 3 one cloud; 4 two (one from each end, 40 frames apart); 5 two, each lasting through two wall bounces; 6 three.
- Dodge: hop it (the weakest jump is above 72 px for about 21 frames, and the contact lasts about 13 at top speed), or stand on a platform or ledge (their tops are 144 px, the cloud is 72), or lure it into the wall and hop the skid.
- Why it works on 2,400 px: it homes, it starts 600-900 px away so the first contact is 90 to 125 frames after it appears (a readable chase, not an ambush), and after about 35 frames it is faster than a standard run (6.4), after about 60 faster than the fastest fighter (7.2). Running away is not the answer, and the cloud cannot be outrun for the 300 frames it lives.
- Damage: medium, 17.6% (0.8).
- Not a repeat: nearest cousins are Four's THE CACTUS DRIVE and Two's SUN HUNT (both picked by the owner, so a chase is already in the rush twice). This one is a different chase: it overshoots and skids, it bounces, it ends by bursting, and the platform is a refuge. If three chases is too many, THE HAT TRICK (section 6) is the swap.
- Canon (pages checked): Zeroes page, Tennis Ball: the Zeroes chase after Tennis Ball; Zero page, Fusion and the 3,517,000 special: the Zeroes merge into one and split back into the crowd. The cloud is game text.
- Build: about 90 lines. A `bossShot` that homes on the nearest fighter along the floor with a speed ramp, a skid, a wall bounce and a burst (Six's homing bubbles are the precedent for the homing); one drawn scuffle with a rotation and a few limbs.

## 4. The eight side by side

### 4.1 Tells (no two alike)

| # | Pose | Glow | Beats | World mark |
|---|---|---|---|---|
| 1 ROLL CALL! | rise (megaphone up) | cap-blue #7f8cff | 3 | grit off the pipes |
| 2 TAPE TOSS! | rear (winds back the box) | steel #9aa0b4 | 2 | tape shadows |
| 3 DIVIDE BY ZERO! | coil (sign at his hand) | white | 2 | none |
| 4 STOP LAUGHING AT ME! | none (the door bangs) | red #ff3b2a | 3 | frost at the door |
| 5 THE FOOT! | tilt (one leg up) | Sandstorm #f4d53d | 2 | the foot's shadow, grit |
| 6 SORRY, SORRY! | cup (two sips) | coffee-orange #d9863a | 2 | steam, the mug's shadow |
| 7 STAND STILL! | hush (finger to lips, three jabs) | roster gray #c7c7d0 | 3 | each statue grows in |
| 8 GET HIM! | point (two jabs, a stamp) | lavender #b9a6ff | 2 | the cloud far off |

### 4.2 What each one asks of the player

| # | Verb | Reach | Where the boss is |
|---|---|---|---|
| 1 | hop, or rush him and interrupt | up to 900 px off, 400 px past you | standing still, megaphone up |
| 2 | read shadows, walk out | a wide comb around you | winding back, then idle |
| 3 | back off, air-dodge | 164 px | in your face |
| 4 | hop, platform | up to 1,400 px | in the freezer, then rolling |
| 5 | walk out of a shadow | anywhere | planted (the Giant) |
| 6 | read a two-beat cue, then move | 700 px mug, 610 px scurry plus swing | in the open, hittable the whole move |
| 7 | weave, run under an arc | around you, floor and platform | still, finger to lips, hittable |
| 8 | hop, platform, kite it into a wall | the whole stage | pointing, then idle |

### 4.3 Shapes other bosses own (the check)

| Owned shape | Owner | Is it repeated here? |
|---|---|---|
| lava | 2,763 | no |
| drop, then low waves, then stuck | X | no (THE FOOT has no waves and no stuck window; STAND STILL pounces sideways) |
| the ring | Four | no |
| copying your special | Two | no |
| the bubble shield | Six | no |
| interrupting a call | Zero | ROLL CALL! only (it is his own); none of the three new ones adds an interrupt |
| dodge a commit, then punish | Nine | see flag C |
| reading the colour | Three | no |

## 5. If the owner picks them all

Suggested layout (the picker draws a move by phase, never the same twice in a row):

- Phase 1, Leader: ROLL CALL!, TAPE TOSS!, DIVIDE BY ZERO!, SORRY, SORRY! (4 moves; the designed kit had 3).
- Phase 2, Embarrassing Tapes: those four, plus STOP LAUGHING AT ME!, STAND STILL!, GET HIM! (7).
- Phase 3, Combine!: ROLL CALL!, TAPE TOSS!, DIVIDE BY ZERO!, STAND STILL!, GET HIM!, THE FOOT! (6; SORRY and the roll both need legs a planted Giant does not have, see flag B).

With about 14 turns a phase (the report's own figure), the designed kit throws each move about 4.7, 3.5 and 2.8 times in phases 1, 2 and 3 (counting STOP LAUGHING AT ME! in phase 3); with all eight it is about 3.5, 2 and 2.3. That is the point of picking more than five: the fight stays fresh at 1,800 HP.

Cost, against the spec's own milestone numbers: SORRY about 70 lines, STAND STILL about 80, GET HIM about 90, 240 for all three (the whole rush estimate of about 7,850 lines becomes about 8,090). Where they land: SORRY and STAND STILL go in M9 (Zero A, 500 lines, becomes about 650); GET HIM goes in M10 (Zero B, 350, becomes about 440). The lean cut (no pipe pops, dots, second foot, sign) is unchanged. None of them touches shared engine code: they sit inside Zero's own `@boss:zero:` marker pairs.

## 6. Considered and left out (swaps if the owner wants a different shape)

- THE HAT TRICK: he takes off the hat (bare-headed, the `zerobare` look) and throws it three times: low skim, high arc, straight at you; each time it returns to wherever he stands. Canon: the hat is the megaphone's key (only the hat-wearer works it) and one Zero throws the hat and megaphone to the main Zero in the 3,517,000 special. Shape: an out-and-back boomerang. Left out because it is a second sweep next to ROLL CALL! and a projectile; it is the swap for GET HIM! if the owner has had enough chases.
- BEARD SERUM!: he drinks the serum coffee and beards sprout on the floor around you, growing from stubble to a whipping mane before they fall limp. Canon: the beard growth serum in his coffee (the 3,517,000 special). Shape: a slow-growing floor trap. Left out because it reads as a delayed zap column (Four's ZAPPIES!) and Four already owns the sticky floor shape (SOUP'S ON!).
- THE SHUFFLE: he dances at you in a four-step routine. Canon: his silly dancing before Six appears in the vent. Left out because it is a second close-range combo beside SORRY, SORRY! and it makes the coward walk at you in phase 1.
- THE SUBWAY: a train crosses the floor. Canon: Zero rides the train in both specials. Left out because it is one more floor sweep (Six's rake, Nine's boards, ROLL CALL!).
- THE TV THROW: he heaves the TV over. Canon: he destroys the TV in the 2,763,000 special. Left out because it is a lob like TAPE TOSS!; the roll already carries that breakout.
- THE TRACKING CHIP (wiki trivia only), the pancake, the scooter (Nine's board territory), the spelling-bee gag (a word on the stage, against the house rule on signs): not buildable as clean attacks.

## 7. Flags for the lead

A. Two small slips in the designer's numbers, copied as written: the dot damage (0.6 in the move text, 8.8% in section 4.5) and the tape comb spacing (130 px or 0.11 of the stage width).

B. The Giant cannot do the roll as written. A Giant of radius 116, flattened to 70% height, is about 162 px tall, over any jump. The spec's paragraph says STOP LAUGHING AT ME! is "phase 2" while the designer's table says "phase 2 on". I treat it as phase 2 only (and SORRY, SORRY! likewise stops at phase 2). If the roll should stay in phase 3, the Giant needs a lower roll.

C. STOP LAUGHING AT ME!'s wall stun is the same idea as Nine's "dodge a commit, then punish". It is the director's move and stays as designed. The difference: Nine's is an exposed window with +50% damage and the boss is the one who cannot stop; Zero's is a plain 55-frame stun with no bonus. If the owner wants the shapes cleaner, the swap is to end the roll in a skid with no stun.

D. THE FOOT is a drop on a locked shadow, like Six's ROCK DROP! and 2,763's SLAM. It is the canon payoff (and its drawn foot comes back in 2,763's ending), so it stays; there are no waves and no stuck window, so it is not X's shape.

E. Three Zero-squad moves in one kit (ROLL CALL!, STAND STILL!, GET HIM!) and three "hop the thing on the floor" answers (1, 4 and 8) could feel samey if the owner picks all of them. Their looks differ (a conga line, rigid statues that leap, a scuffle cloud) and so do their jobs (a line, a surround, a chase), and the picker never repeats a move twice running. TAPE TOSS! shares the "rain" worry with Six's ROCK DROP! and X's BASKET RAIN!: the spec's pre-agreed swap is a flat spinning throw at three heights.

F. Canon limits: Zero has no canon fight. Every option is a canon prop, ability or moment turned into a move; the one-line sources are in each option. The Homeward Bound! page on the wiki mentions Zero only in trivia and the soundtrack, so the chase behind GET HIM! rests on the Zeroes page; the Inanimate Insanity wiki has no Zero page (the designer's finding, not re-read).
