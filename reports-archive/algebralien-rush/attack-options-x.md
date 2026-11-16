# X (the Variable), Algebralien Boss Rush: attack options (2026-11-02)

Read-only study. Nothing in the game was edited, committed or pushed, and no option was played: none of them exists in the game yet. Sources: `spec.md`, `boss-x.md` and `owner-rules.md` in this folder (the designed kit, its numbers, the rules), `attack-options-two.md` and `attack-options-four.md` (format, and the speed and jump yardsticks), and the Battle for Dream Island wiki read again as raw wikitext in the built-in browser (pages listed in section 6). Wiki facts are paraphrased, not copied. Everything in CAPITALS (move names) is game text, not canon.

The owner's ask: "give me options for the attacks". X is boss 6 of 9: 2,100 health, the common 2,400 x 860 stage with solid end walls, a 650 px leash, 4 stocks +2 per boss (max 6), the 500-Step Platform arena (a stepped pyramid in the middle: a top landing 290 px up and two steps each side at 85 and 175 px). The owner picks, and likes to pick more than five. Eight options below: the director's designed five (as designed) and three new ones. The signature, HIDE AND SEEK!, is a sixth move that stays whatever is picked (section 3).

Rules every option keeps (spec section 10): the tell is in X's body (a pose, a glow, a beat count, a white flicker in the last 8 frames); no telegraph lines, rings, reticles, banners or move-name popups; the only world marks are a real shadow under what falls, dust and grit, a glow at the source; anything that appears grows in over 12 frames; falling things hit while they fall; one attack id per turn, so a fighter takes at most one boss hit from a move (the engine caps one attack id at 22% unless a shot carries `bossCap`); nothing hits above one boss hit; no contact damage while idle; launches go up or toward the middle, never off the world (the end walls are solid); nothing is answered by running (each move is placed on you at its lock, or leads your run, or moves faster than 9 px a frame).

Yardsticks (from the Four report, which read them in the game): a run is 6.4 px a frame (the roster runs from about 5.4 to 7.2); a full jump rises 126 px (weakest 107); a short hop 54 px. Damage bands: light 0.3 of a boss hit (6.6% of the fighter's meter), medium 0.8 (17.6%), heavy 1.0 (22%).

## 1. The eight at a glance

| # | Move | Source | Shape | Hits for | Reach on a 2,400 px stage |
|---|---|---|---|---|---|
| 1 | BASKET RAIN! | designed | a vertical (a falling row) | heavy, 20% | one basket on every fighter, a row across the stage |
| 2 | SNAP! | designed | a floor trap | heavy, 22% | half the floor at a time, wall to wall |
| 3 | ROCKET DIVE! | designed | a jump-in with a window | heavy, 22% | a shadow that follows you, then waves to 460 px each way |
| 4 | ARROW DASH! | designed | a gap-closer | heavy, 22% | the whole stage on your row, 30 px a frame |
| 5 | BURNING! | designed | area denial (a panic flight) | medium, 13% | 85% of the width, and embers where he passed |
| 6 | TAG, YOU'RE IT! | new | a chase | medium, 17.6% | pops 240 px away and steers after you at 9.2 px a frame |
| 7 | LEG BOOMERANG! | new | a sweep that comes back | medium, 17.6% | thrown out to 1,100 px on your row, then back to him |
| 8 | CAKE AT STAKE! | new | a combo (a volley, then a lift) | medium, 17.6% (capped 22%) | slices from 260 to 900 px, then a column on you |

Each of the three new ones is a shape the designed five does not have (a chase, a sweep, a combo), and none is a shape another boss owns: not lava (2,763), not the ring (Four), not copying your special (Two), not the bubble shield (Six), not interrupting a call (Zero), not dodge-a-commit-then-punish (Nine), not reading the colour (Three), and not the drop-then-low-waves shape (X's own dive).

## 2. The eight options

### 1. BASKET RAIN!: a vertical. Designed
- Looks like: X rises toward the top of the screen, arms up, a warm white glow on his hands (two beats and a rising whirr). Over his last 12 frames a pile of baskets grows in above him, propellers turning, and fans out over 22 frames into a row across the stage at a high lane. One basket per living fighter follows that fighter until 14 frames before the drop and then locks; the rest fill the row about 215 px apart (eight or nine on 2,400 px), never closer than 70 px to a wall, always leaving a gap at least a body wide. A real shadow under each grows in over 12 frames. The propeller pops off and the basket falls (about 35 frames from 560 px), hitting while it falls (radius 34, knock 8 aside and 9 up), then lies upside down as a one-way low step for 90 frames before its propeller returns and it lifts away. Phase 2: a second row 40 frames later, placed where you stand now.
- Tell in the body: the rise, the lit hands, the pile growing in; then the shadows.
- Dodge: leave your shadow (it locks 14 frames out); gaps always remain; a landed basket is a step, never a wedge.
- Why distance fails: one basket is always aimed at you, and the row spans the stage.
- Damage: heavy, 20% (0.9 of a boss hit), once per turn.
- Canon: X's baskets fly and carry things (Getting Teardrop to Talk, This Episode Is About Basketball; both read). The rain is game text. The same code is the signature's timeout punishment.

### 2. SNAP!: a floor trap. Designed
- Looks like: X floats to the middle of the pyramid's height, one hand raised with the four fingers pinched and a small glint at the hand, body tipped back. Three beats, the same every time: one, two, three, snap (a click and a one-frame white flash). Half of the 150 px floor columns (the half with the most fighters in it) glitch to static over 12 frames and flicker for 44 frames (38 in phase 2). Then they are DELETED: for 6 frames anything inside a column up to 360 px high takes the hit and is launched mostly up (-14) with a small push toward the middle. They show black static for 24 frames (harmless) and fade back. A second snap 28 frames later does the other half. Phase 2 adds a third snap.
- Tell in the body: the pinched fingers, the tilt, the count of three.
- Dodge: step to the next column over (at most 150 px: 24 frames at a run, 43 at a slow 3.5); or be in the air above 360 px. The top step (290 px) is not a refuge.
- Why distance fails: it covers the floor wall to wall, and the first half is the one with you in it.
- Damage: heavy, 22% (1.0), once per turn.
- Canon: X deletes (despawns) a host with a snap in BFB 28, and snaps contestants away to the BRB in Take the Tower and The Hidden Contestant (X page, Deletion; read).

### 3. ROCKET DIVE!: a jump-in with a window. Designed
- Looks like: one beat, X crouches, then shoots up off the top of the screen (a streak). While he is gone a real shadow grows under the nearest fighter (the target rotates), follows until 14 frames before impact, then locks; a bright glow grows at the top edge over that spot. About 46 frames later he comes down in 18 frames (about 36 px a frame) head-first onto the lock (impact radius 110, launch -15 up and 6 out, a floor scar, shake 12). Then two low waves run each way (36 px high, 8 px a frame, 460 px far). X is then stuck head-first in the floor for 70 frames (legs kicking, below ground level so nothing jams), cannot attack, and takes hits normally. Phase 2: no window after the first dive; a second dive 30 frames later onto the next fighter's lock, and the window after the second.
- Tell in the body: the crouch and the streak; the shadow is his own, growing as he falls.
- Dodge: be off the shadow when it locks, then hop each wave.
- Why distance fails: the shadow follows you, and the waves run out 460 px at 8 px a frame.
- Damage: heavy, 22% for the landing; the waves 15% (0.7); one hit per turn, never above 22%.
- Canon: Return of the Rocket Ship (X is hurled into the Earth's core at 2,763 mph and breaks the crust; X page, G-force resistance and Strength; read). The shadow, the waves and the stuck window are game text.

### 4. ARROW DASH!: a gap-closer. Designed
- Looks like: X zips to the edge of the stage farther from the marked fighter, on that fighter's row (floor, ledge or jump height, clamped to 40 to 260 px over the floor; the row follows the fighter until 14 frames before the dash, then locks). He tilts into an arrow pointing across the stage, squashed long and thin, bright yellow, a short afterimage tail, flickering white for the last 14 frames. Then he crosses the whole stage at 30 px a frame and leaves the screen. Phase 2: a second pass back on a different row (the next one up or down), 20 frames later.
- Tell in the body: the zip to the edge, the arrow tilt, the white flicker.
- Dodge: change your row (hop it, or stand on the top step at 290 px, which is over the clamp).
- Why distance fails: 30 px a frame against 7.2, and it covers the whole stage; it cannot be outrun, only jumped.
- Damage: heavy, 22% (1.0), once per pass (the second pass shares the id).
- Canon: X takes the shape of an arrow and has super speed (X page, Powers; Who Stole Donut's Diary? re-read for the speed; the arrow-shape pages are carried from the designer's report, not re-checked). The dash is game text.

### 5. BURNING!: area denial. Designed
- Looks like: X snaps once and bursts into flame (the burning render, an orange glow, a crown of flames), trembling for 20 frames with wide eyes. In phase 2 he is already alight, so this is a flare, not an ignition. Then a fixed flight: a figure-eight across 85% of the stage width over 150 frames (three learned variants, mirrored by his starting side), up to 11 px a frame, 90 to 260 px over the floor, so he crosses at head height and over the pyramid. His body hits for 0.6 (knock 12, 120 frames of grace). He sheds an ember every 9 frames (7 in phase 2): it falls (0.3), then lies burning for 90 frames as a patch of radius 22 that hits for 0.25 once every 40 frames; at most 8 alive. Phase 2: two passes, the second lower. While he panics, damage dealt to him is x1.25: the window.
- Tell in the body: the snap, the flames, the trembling.
- Dodge: weave the figure-eight (it is fixed and learnable), hop or leave the ember patches, and hit him while he is at head height.
- Why distance fails: he crosses most of the stage and what he leaves stays for 90 frames.
- Damage: medium, body 13% (0.6); ember 7% (0.3); a burning patch 5.5% (0.25) once per 40 frames.
- Canon: X ignites himself with a snap (BFB 28, Chapter Complete; X page) and burns because the sun is closer (How Loe Can You Grow?, A Taste of Space; both re-read). The flight and the window are game text.

### 6. TAG, YOU'RE IT!: a chase. New
- Looks like: X pops (the small shrink ring he already has) to 240 px from you, on the side with more room (the middle side, so you are never pinned), faces you and clamps both hands over his eyes (a code-drawn overlay on the face). He counts: three slow bobs, 20 frames apart, 60 frames in all. On the third he peeks through a finger gap (a glint), drops his hands, throws his arms wide and points at you (the open-armed render, a yellow glow, white flicker for the last 8 frames). Then he flies after you at 9.2 px a frame (9.8 in phase 2, and the count is two bobs), steering slowly: the turn is limited to 0.045 rad a frame (a turning circle about 205 px wide), and he rides the floor under you, 36 px up, climbing no faster than 3 px a frame. The tag circle is 56 px. He gives up after 140 frames. A tag is one yellow-paint splat on the fighter (1.5 s, cosmetic), a knock of 12 along his path and 6 up, and the chase ends there.
- Tell in the body: the hands over the eyes and the three bobs, the peek, then the pointing pose.
- Dodge: jump over him as he arrives. His circle tops out at about 92 px, so even the weakest full jump (107 px) clears him, and he cannot climb to follow it. Then run the other way: he needs about 70 frames to turn round, and one clean hop usually ends the move. Stand still or run away in a straight line and he has you: he starts 240 px off and gains 2.8 px a frame on a 6.4 runner (86 frames), 3.8 on the slowest (63 frames), both inside the 140.
- Why it works on 2,400 px: he starts close, so distance never decides it, and he is faster than any run. Walls end a runner's run; the side-with-more-room rule means the open stage is behind him when you jump him.
- Damage: medium, 17.6% (0.8), one tag. No exposure window and no damage bonus (that shape is Nine's).
- Canon: The Power of Four (X is a seeker in the hide-and-seek challenge, flies after Liy and Pen, startles them out of a tree and tags the caught with yellow paint; X/Coverage, Power of Four section; read). The count stands in for the hiding timer, and X points down in The Four is Lava (read). The pursuit numbers are game text. It is the seeker half of the signature: the baskets hide, this one hunts.

### 7. LEG BOOMERANG!: a sweep that comes back. New
- Looks like: X floats up to about 120 px, wraps his right leg in white bandage (a white glow, 14 frames), rocks back onto the other leg with his arm cocked (one beat), and the leg pops off with a small puff. He throws it spinning flat along your row (floor, ledge or jump height; the row follows you until 14 frames before the throw, then locks, the way ARROW DASH's does). It goes out at 14 px a frame to your distance plus 320 px (at least 700, at most 1,150 px), hangs and spins in place for 18 frames at the far end, then whirls back to X at 16 px a frame. About 166 frames in all at full range. X hops wobbling on one leg meanwhile, and when it comes home he catches it, bandages it on and twirls. Phase 2: both legs: the second leaves 24 frames after the first, on the row you are on at its own lock.
- Tell in the body: the white bandage glow, the rock back and the cocked arm, the pop. The far-end hover is a visible stop.
- Dodge: hop it going out and hop it again coming back (the second hop is the one people mistime). Do not stand beside X or under the far-end hover. Its circle is radius 44 on the floor row, so a hop of 107 px or more clears it.
- Why it works on 2,400 px: it is thrown to your x, so a camper in the far corner is reached; at 14 to 16 px a frame it outpaces any run; and it returns to X, so standing next to him is not safe either.
- Damage: medium, 17.6% (0.8), once per throw (out and back share one hit). The knock is along its path and up, toward the middle near a wall.
- Canon: Fortunate Ben (Four removes a limb of X and X is sent to the limb reattachment center; the stinger shows X with bandages round his lower right, happy to have his legs back; X page, Regeneration: X can reattach whole limbs with bandages) and Enter the Exit (X's dislocated leg heals almost at once; read). The throw and the boomerang path are game text only. Build note: a flat render cannot lose a leg, so the leg is a code-drawn overlay and the stump is a bandage patch drawn over the render; if it reads badly on the real render, the fall-back is the same move with an arm.

### 8. CAKE AT STAKE!: a combo (a volley, then a lift). New
- Looks like: X floats up a little and holds up a layered cake in one hand and a vote card in the other (both code-drawn, growing in over 12 frames). He reads: three nods, 20 frames apart, and on each nod he flicks a slice at high speed (15 px a frame) in a flat arc, aimed at where you will be when it lands (it leads your run, one way only). Each slice (radius 22) splats harmlessly in pink and white. After the third he looks at you, points and snaps (a finger glint): the spot under you (led by your velocity) locks 20 frames before the hit, and a pale column of floating light, 110 px wide, grows in over the 12 frames before it hits. Anything in it is lifted straight up (launch -20: about 330 px, a 65-frame trip) and comes back down. Phase 2: four slices.
- Tell in the body: the cake and the card, the three nods (a slice on each), then the pointing arm and the finger glint. The cake is what separates it from SNAP!, whose three beats have none.
- Dodge: sidestep or hop each slice's landing spot, or reverse (they only lead one way); then change direction after the last slice and take one step of 70 px or more off the spot, which the lock leaves 20 frames for (13 frames at the slowest run). Running straight gets sliced, standing still gets lifted.
- Why it works on 2,400 px: slices reach 260 to 900 px in 17 to 60 frames, so a far fighter is hit in a second; the column is placed on you; and the two parts punish the two lazy answers.
- Damage: medium, slices 9% each (0.4), the lift 17.6% (0.8); one turn never above 22%.
- Canon: Enter the Exit (X announces who is safe while throwing slices of cake at high speed; one pops Bubble); Take the Tower (X hosts Cake at Stake and sends the eliminated to the BRB), and The Hidden Contestant (X snaps Profily to the BRB; all read). The combo and its numbers are game text. If SNAP! and this are both picked, change this one's last beat from a snap to a point (the Four-is-Lava pinpoint) so the two read differently.

## 3. The signature stays: HIDE AND SEEK! (not one of the eight)

Every fifth turn X ducks into one of three propeller baskets (four in phase 2) that swap like cups; the real one hangs 6 px lower; the first hit on it finds him (he tumbles out dizzy for 100 frames, takes 2.5% of his health at once and x1.5 damage); a wrong basket bursts and nicks you lightly; if he is not found in time the baskets drop in a BASKET RAIN (spec section 1.1 and `boss-x.md` section 6.3). It is X's sixth designed move, outside the picks: no choice below removes it. Two knock-on facts for the pick: BASKET RAIN's code is the signature's timeout punishment, so un-picking RAIN only stops it appearing as an ordinary turn; and BURNING! is X's first turn of phase 2 by the spec's `first` hook, so if it is not picked the first phase-2 turn is any other move (the passive ember drip and the sky change stay).

## 4. Notes for the owner

- X is a long pattern fight (2,100 health, 45 to 75 turns). Five picks plus the signature means each move is seen 8 to 12 times; eight picks plus the signature (nine moves) keeps it from reading as a loop, at the price of build time. The designed five are about 500 lines; the three new ones are about 295 (TAG about 90, LEG BOOMERANG about 85, CAKE AT STAKE about 120), all code-drawn overlays, no new renders beyond the planned x, xoh and xburn (and the optional xhappy).
- Two of your earlier picks overlap with designed X moves, which the spec said to adjust if a clash showed. ROCKET DIVE! (a drop on a locked shadow, then two low waves) is the same shape as Two's CRATER LANDING, and BASKET RAIN! (a falling row that leads you) is close to Two's MOON HAIL. X's versions differ (the streak off the top, the 70-frame head-first window, the double dive; shadows locked per fighter, baskets that stay as steps), but if you want X to feel different from boss 1, DIVE! is the one to leave out for TAG, YOU'RE IT! or LEG BOOMERANG!. Both options are open: the kit works either way.
- If you want one of each shape with the signature fixed: SNAP! (floor trap), BASKET RAIN! (vertical), ARROW DASH! (gap-closer), TAG, YOU'RE IT! (chase), LEG BOOMERANG! (sweep), plus BURNING! as the phase-2 opener if you want the x1.25 window. CAKE AT STAKE! is the one that punishes a player who has learned to dodge the others; ROCKET DIVE! is the one that gives the player the biggest opening.
- Picker tags if they are built (what each punishes): BASKET RAIN ground, spread; SNAP ground, platform; ROCKET DIVE close, ground; ARROW DASH far; BURNING air, far; TAG far, any; LEG BOOMERANG far, ground; CAKE AT STAKE any, far.
- Moves that start from the same pose are best not all picked together: ROCKET DIVE! and ARROW DASH! are both "X leaves at speed"; TAG, YOU'RE IT! and ARROW DASH! are both "X flies at you", told apart by the hands over the eyes and by steering (a line against a chase). If the build has to shrink, the spec's cut list takes ARROW DASH first.
- Untested numbers: the turn rate, the climb cap and the 140 frames of TAG; the lanes and the 18-frame hover of the boomerang; the 20-frame lock, the column width and the -20 launch of the lift. They are starting values, tuned by feel, never to a bot.

## 5. Fairness checks used for every option

- A sideways dodge fits in the frames given at 5 px a frame (the slowest runner, less a margin); a jump works with the weakest jump (107 px) and a window of at least 9 frames.
- No option is faster than a run and also unaimed: each is placed on you at a lock, leads your run, or moves faster than 9 px a frame (TAG 9.2 to 9.8, the leg 14 to 16, the slices 15, ARROW DASH 30).
- Nothing makes X unhittable (the count in TAG and the hover in LEG BOOMERANG leave him hittable).
- One attack id per turn: a fighter takes at most one hit from any of the eight.
- No ring-outs: every launch is up, or along the path toward the middle.

## 6. What I read, and the limits

Canon (BFDI wiki, raw wikitext in the built-in browser, in a tab that was already open and not navigated): X (Powers and abilities, Deaths, Kills), X/Coverage (the BFB and TPOT sections), Take the Tower, This Episode Is About Basketball, Get to the Top in 500 Steps, Enter the Exit, Fortunate Ben, The Four is Lava, Who Stole Donut's Diary?, Getting Teardrop to Talk, Chapter Complete, Return of the Rocket Ship, X Marks the Spot, Outbreak At Stake, Seasonal Shift and What Do You Think of Roleplay? (X's paragraphs only). The Inanimate Insanity wiki was not needed (its "X" is MePhoneX, a different character). Not re-checked: the pages the designer cited for the arrow shape. Nothing in the three new options is a canon fight: each is a canon moment turned into a move, flagged as game text above.

Not done: I did not open the game (the speeds and jump heights are the Four report's, which read them there), I did not play or run anything, and no render was fetched or viewed. Ideas read and set aside: eye lasers (X vaporizes Teardrop in BFB 28; One's EYE LASERS! and Four's ZAPPIES! already own the shape, and One is the next boss), the aloe garden (hurdles again, as Two's TOWER ROW), a clone chase (Four's cactus), and a pop-in clap (patty cake with Two; that is Two's pop-and-punch).
