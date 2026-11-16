# 2,763, Algebralien Boss Rush: attack options (2026-11-02)

Read-only study (nothing in the game was edited, committed or pushed). Sources: `spec.md`, `boss-2763.md` and `owner-rules.md` in this folder, and the BFDI wiki read again today as raw wikitext in the built-in browser: the character page "Two Thousand Seven Hundred Sixty-Three", and the plot sections of the two subscriber specials ("Thanks for 2,763,000 Subscribers!" and "Thanks for 3,517,000 Subscribers!"). Wiki text is paraphrased, not copied. Move names are game text for code and this file only: nothing is printed on screen.

The owner's ask: "give me options for the attacks"; they like to pick more than five when they like them. 2,763 is the finale (3,000 HP, 4 stocks +2 per boss, max 6) on the common 2,400 x 860 stage with solid end walls and a 650 px leash. It must stay a surprise: the boss card says ??? until the "2763" sign in its intro.

House rules every option meets: the tell is in the body (a pose, a glow, a beat count, a 14-frame gather or an 8-frame flicker): no telegraph lines, rings, reticles, banners or move-name popups; anything that appears grows in over 12 frames; a real shadow under a falling thing is allowed; one attack id per turn, so a fighter takes at most ONE hit from a turn and never more than 22% (one boss hit); no contact damage from the body; nothing unavoidable; computer only; offline.

## 1. The five the director designed (marked "designed", as designed)

| # | Move | Shape | Wind-up | Damage per hit | Bands |
|---|---|---|---|---|---|
| 1 | SLAM | vertical: black hands fall on shadows | 54 | 0.9 (20%) | all (2 / 4 / 6 hands by band) |
| 2 | WINDMILL | close sweep: six arms turning round it | 48 | 0.8 (18%) | all (3 arms, then 6) |
| 3 | LIGHTS | projectile spiral of the drained lights | 50 | 0.6 each (13%), turn capped at 22% | all (second spiral from band 2) |
| 4 | CAGE | floor trap: a cage dropped on the farthest fighter | 60 | 0.9 (20%) | all (two cages from band 2) |
| 5 | FLOOD | area denial: the lava rises, Division Symbols are the refuge | 72 | 0.7 (15%), then 0.2 (4%) ticks | phase 2 on (first tide opens it and leaves the dry island) |

Gaps between turns 120 / 96 / 70 frames (before the engine's x1.2 pace); wind-ups run x1.25 (`BOSS_TEL_PACE`). Signature, THE DRAIN: inside about 220 px of it no specials; what it drains becomes the lights it throws.

## 2. What the stage and the boss ask of any new move

Yardsticks: a run is 6.4 px/frame (roster 5.4 to 7.2); a full jump rises 126 px (weakest 107), a short hop 54; platforms and ledges are 144 px up; the boss is a hovering giant, radius 102, belly 60 px over the floor, gliding after the fighters at 0.6 px/frame; it is leashed to 650 px of the nearest fighter. The camera shows about 1,528 px of the 2,400.

The guarantee every rush move meets ("hold run away for 60 seconds and take hits"): placed on you at its lock, or leads your run, or moves faster than 9 px a frame, or leashed. The three new options each meet it a different way (section 4).

What is missing from the designed five (this is why the three new ones are what they are): the five hold a vertical, a close sweep, a projectile, a floor trap and area denial. They have no CHASE (a thing that hunts you), no GAP-CLOSER or COMBO (the boss comes to the camper and strings blows), and no sweep that punishes jumping. Not used, because another boss owns the shape: a beam (One's eye lasers, Three's hallway laser), hands from the ground (One), a ring or a pull (Four), a drop on a lock followed by low waves and a stuck boss (X), a pop-and-lunge (Two, Six, X), a stomp or boot (Zero, Nine, the ending), a copy of your special (Two), a bubble (Six), a colour to read (Three), an interrupt window (Zero), a dodge-then-punish window (Nine).

Damage bands used: light about 0.3 of a hit (7%), medium 0.5 to 0.8 (11 to 18%), heavy 0.9 to 1.0 (20 to 22%).

## 3. The three new options in full

### 6. PAN ACROSS: a sweep that punishes jumping  [new]
- Looks like: the boss leans back; its three-armed side winds up over 24 frames and the hand glows rose-gold; then the hand LEAVES THE WRIST (a huge black hand, palm about 130 px) and the arm regrows in 12 frames. The hand flies out at head height along your side of the stage, past you to the far wall at 12 px/frame, then turns and skims back along the floor at 14 px/frame to the boss, who takes it back.
- Tell in the body: the lean, the wind-up arm, the glowing hand, the arm shedding the hand (a pane of the Void's glass shatters in grit where the hand leaves: grit and dust only, no line).
- Dodge: stay on the floor for the first pass (step down off a platform; do not jump), then hop the second pass (a 40 px band; a short hop clears it with a window of about 16 frames). The hand is on screen the whole flight and its shadow runs on the floor.
- Why it works on 2,400 px: it spans the whole row to the wall and covers every spot of it at the pass height, so no corner is safe and no run helps (12 and 14 px/frame against a 6.4 run); the stage's only answer is height, which flips between passes.
- Damage: medium, 0.7 (15%) once per turn (the first pass launches up and toward the middle; the return then has nothing left to deal).
- Canon: special 2 (read): the giant hand pans across the screen while it talks to the prisoners; special 1 (read): a hand crashes through the window and takes Seven, then the arms take Two, Five, Six and Eight; the character page (read): extra limbs at will. The detached hand, the heights and the out-and-back are game text.
- Fit: from band 1. Picker tags: air, platform (it punishes the jumper and the platform-stander). Differs from the rush's other sweeps: Two's clap and Four's palms are on the floor and answered by a jump; this one is head high and answered by staying down, with a low return to switch you back. Check on a real kit: the band must sit above the tallest standing fighter's head (110 to 190 px up), and the jump apex of the weakest jumper (107 px) must stay under it.
- Size: about 110 lines (the hand drawer, two passes, the regrow).

### 7. ROOT THEM OUT: a chase  [new, uses lava, see the note]
- Looks like: the boss lowers its arms, fingers spread, glowing yellow; the floor cracks and a bubbling patch of lava (130 px wide, 18 px high) breaks out of it about 380 px AHEAD of where you are heading (the nearer wall if you stand still), growing in over 12 frames. It creeps at you from 3 px/frame, gaining 0.045 a frame to a top of 10 (a sprint is 7.2). When it is within 70 px it stops, swells and spits embers for 24 frames, then bursts as a column 140 px wide and 240 px tall, live for 14 frames (tall enough to reach a platform). Life 240 frames at most.
- Tell in the body: the lowered arms and yellow glow; the patch itself is the chaser (an ember glow at the source, which the house rules allow); the swell is its own last tell.
- Dodge: hop the patch as it arrives (18 px high; touching the sliding patch is only 0.3), then walk 60 px or more off the swell before the column; a runner heading into it turns around, one running away is caught by a patch at 10 px/frame. It never leaves the dry floor (in the second phase it hunts only on the island and stops at its edge).
- Why it works on 2,400 px: it is placed ahead of your run (leads you) and then moves faster than a sprint, so neither running nor camping works; the 24-frame swell gives a walking dodge on any stage.
- Damage: medium, column 0.8 (18%); the sliding patch 0.3 (7%); the turn is capped at the column's 18%.
- Canon: special 1 (read): the voice raises the lava to root the others out; Two tests the lava with a hand thinking it is orange soda and is burned; a wave of lava comes for Two and Eight; the character page (read): lava manipulation. The hunting patch is game text.
- Fit: from band 1. Picker tags: ground, far. NOTE for the owner: lava is the finale's (FLOOD) and Two's picked LAVA SPIN already puts burning ground in the rush, so this would be the second lava move at 2,763. If lava should arrive only with FLOOD, leave this one out; the swap is HERCULEAN or PAN ACROSS.
- Size: about 120 lines (patch, chase, swell, column, island clamp).

### 8. HERCULEAN: a gap-closer and a three-blow combo  [new]
- Looks like: the boss dips its belly to 40 px and glides at the nearest fighter, over 28 frames at up to 10 px/frame, stopping about 260 px away and AHEAD of a runner (the lead is the speed you were running at the lock). Then three blows from its arms, each after a shoulder dip and an 8-frame flicker: a LOW jab along the floor (24 frames after the glide), a HIGH jab at head height 22 frames later, then a WIDE swing from both big arms that covers both heights 26 frames after that. Each arm grows in over 12 frames; reach about 300 px from the body.
- Tell in the body: the dip and the glide (the whole body leans at you), and a shoulder dip and flicker before each blow, which also says which arm and which height.
- Dodge: hop the low jab, stay down for the high one, then back out of the 300 px reach before the swing; a player who simply backs off from the start loses only the boss's turn. The three beats change the answer each time (jump, down, away).
- Why it works on 2,400 px: it is the move that goes to a camper; the glide is faster than a run, leads one, and ends just outside the drain's 220 px, so stepping in to punish the string costs you your specials.
- Damage: medium, 0.5 (11%), 0.5 (11%), 0.8 (18%); a turn is capped at 22% under one attack id.
- Canon: special 2 (read): the boss, annoyed, lifts its hand and a massive fist crushes a Zero; the character page (read): super strength and, from the tape, arms of "herculean strength" (the one quote used); special 1 (read): the arms that take the prisoners. The three-blow string and the glide are game text.
- Fit: from band 2 (a gentler first band). Picker tags: far, ground (it fires when someone is outside about 260 px). It is the camper's counter, as WINDMILL is the punisher of someone already close. Differs from Two's pop-and-lunge (a teleport and one punch), Three's OVERSHOOT (a dash that ends in a wall) and X's ARROW DASH (an arrow across the whole stage): this one is a glide and a string.
- Size: about 130 lines (glide, three blows, the arm drawer shared with WINDMILL and SLAM).

## 4. How each new one meets "nothing is answered by running"

| Move | How |
|---|---|
| PAN ACROSS | covers the whole row at 12 to 14 px/frame; the answer is height, not distance |
| ROOT THEM OUT | placed ahead of your heading, then faster than a sprint |
| HERCULEAN | the glide is faster than a run and leads you; the blows are inside 300 px |

## 5. The eight at a glance

| # | Move | Source | Shape | Damage | Rests on |
|---|---|---|---|---|---|
| 1 | SLAM | designed | vertical | 0.9, heavy | the hands that crash in and take the prisoners (specials 1 and 2) |
| 2 | WINDMILL | designed | close sweep | 0.8, medium | extra limbs at will (page) |
| 3 | LIGHTS | designed | projectile spiral | 0.6 each, medium | power draining and the glow of harnessed power (page, special 2) |
| 4 | CAGE | designed | floor trap | 0.9, heavy | lifts a whole metal cage (page, special 1) |
| 5 | FLOOD | designed | area denial | 0.7, medium | lava floods; the shattered Division Symbol (page, specials 1 and 2) |
| 6 | PAN ACROSS | new | high sweep, out and back | 0.7, medium | the hand that pans across the screen (special 2) |
| 7 | ROOT THEM OUT | new | chase | 0.8, medium | lava raised to root them out; the orange soda gag (special 1) |
| 8 | HERCULEAN | new | gap-closer and combo | 0.5, 0.5, 0.8 (cap 22%), medium | the massive fist (special 2); herculean arms (page) |

## 6. Notes for the owner

- THE SIGNATURE: LIGHTS carries it and must stay. THE DRAIN itself (no specials within about 220 px) is on in every turn whatever you pick, but LIGHTS is the attack that pays it off: what it drains becomes the lights it throws, and the spiral thickens the longer you stand close. WINDMILL and HERCULEAN share the drain's circle, so they are the moves that make standing close cost something.
- Eight is a lot: 3,000 HP is about 75 turns, so a wide kit repeats each move less (about 9 turns each at eight, 15 at five), which is why the owner's habit of picking more than five suits this boss. Phase fit if all eight: band 1 gets SLAM, WINDMILL, LIGHTS, CAGE, PAN ACROSS and ROOT THEM OUT; band 2 adds FLOOD (the opening tide) and HERCULEAN; band 3 keeps all of them with the designed doublings.
- A set that covers each shape once is the designed five plus HERCULEAN (gap-closer and combo) and ROOT THEM OUT (chase), with PAN ACROSS the one to drop if the rush's sweeps feel samey (Two's clap, Four's palms).
- Cut order if the build is short (the director's first, then mine): CAGE, then PAN ACROSS, then the lights gauge; the signature is never cut.
- Build cost on top of the five (estimates, not measured): about 360 lines for the three; they reuse the arm drawer, the shadow helper and the island clamp the five already need, so the milestones M15 and M16 grow by about a third if all three are taken.
- Check by playing, not by bots: the band heights for PAN ACROSS against the tallest fighter, the swell times for ROOT THEM OUT with the slowest runner (about 5.4 px/frame), and that HERCULEAN's glide never ends inside a wall.
- Spare canon, not counted: HEAT BEAM (the charged laser at the giant Zero; it repeats the beam shape of One and Three, so only if one of those goes); ERUPT (lava columns at several spots; close to One's hands from the ground); a grab-and-carry (the hand carries Four, X and Five Hundred Sixty-Two to the void; close to Six's slap and Four's pull); the red-eyed sting of its friend 3,517 at the ending (the director's optional sting).
- Not checked: the Void's own page was not read again today (the designer read it; the shattered Division Symbol was confirmed in special 2's plot); no wiki text gives any attack names or numbers for 2,763, so every move here is a canon event or power turned into a fight and is flagged as game text.
