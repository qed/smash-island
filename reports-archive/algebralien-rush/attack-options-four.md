# Four, Algebralien Boss Rush: attack options (2026-11-02)

Read-only study of `artifacts/V1/index.html` (branch ii-dlc; line numbers are what the file had when read and drift as other work lands, so the function names are the anchors). Canon read on the Battle for Dream Island wiki (Four page: Powers and abilities, Personality, Kills; episode pages checked are named per option). Wiki text is paraphrased, not copied.

The owner's ask: the rush's stages are LARGER than the normal boss arenas, Four (1,200 hp in the rush) can just be outrun in his current state, so buff him; give options for the attacks, the owner picks five. Starts with 4 stocks, +2 per boss, max 6. House rules honoured by every option: the tell is in his body (no telegraph lines, banners or move-name popups), anything that appears grows in over 12 frames, falling things hit while falling (a real shadow under them is allowed: owner, 2026-10-22), nothing unavoidable, any roster fighter can be the player.

## 1. What Four does now

Roster row (BOSS_ROSTER, "Four"): hp 340 (x1.5 = 510 in the old rush; the rush spec makes it 1,200), body radius 95 px (34 x 2.8), arena `exitclass`, `stationary:false`. He flies (`hover`): his belly floats 20 to 64 px over the floor on a slow swing, sways 110 / 160 / 210 px by phase, and follows you. Phases at 66% and 33% hp: phase 2 "Zap to Dust" (a tube bursts, sparks start), phase 3 "Reality Buckles" (the classroom's walls tear away onto The Fourest). Turn gaps 104 / 78 / 56 frames. Wind-ups run a quarter longer than the table (BOSS_TEL_PACE.four = 1.25), so a "50" is about 62 real frames.

How an attack is written: the picker (BOSS_PICK.four: `moves` by phase, `tags` = what each move punishes: close, far, air, ground, wall, bunch, any) draws a move; `FOUR_PLAN[kind]` fixes its aim when the wind-up starts; `FOUR_WIND[kind]` plays the body pose per frame (`H.look` picks a render, `H.rot/sx/sy` lean and squash); the fire function (`fourScreechy`, `fourBye`, `fourTower`, `fourHearts`, `fourCactus`, `fourIdo`, `fourZappies`) either adds shots (`fourShot`/`bossShot`) or starts a script `s._fr`, which `fourStep` runs per frame until `fourDone` (then `fourSlither`). What a client draws is numbers in the `b._hz` bag. Every part of a turn shares one attack id, so a fighter takes at most ONE boss hit per turn ("harder, same damage"). A full hit is `bossDmg()` = 22% of the meter; a fighter dies at 150 + weight percent (about 240 for a 90-weight fighter).

| Move | What it does | Dodge |
|---|---|---|
| SCREECHY! (signature, form 1) | Ring of 360 shots (one a degree) from his belly, 5 / 4 / 3 gaps of half-width 0.24 / 0.21 / 0.18 rad, speed 6 / 6.8 / 7.5 px/frame, stops at the floor, passes hills; phase 3 adds a second ring 24 frames behind, gaps a half-gap off. Full hit. | Stand in a gap, or hop. |
| ZAPPIES! (form 2) | A blue splotch follows you, locks about 15 frames before the bolt; a column 52 px (phase 1) or 88 px (phase 2+) wide falls for 10 frames; from phase 2 a second column 20 frames later where you stood 30 frames before the lock. Full hit. | Leave the locked mark. |
| GO BYE-BYE! | He stands 300 to 360 px from you on the side with less room, inhales: pull of 4 px/frame at the mouth easing to 2 at the edge, reach 500 / 600 / 700 px, two breaths every phase; capture radius 43 px, you are held 18 frames then spat out for 0.8 hit. | Run away (6.4 beats 4). |
| TAKE THE TOWER! | Three hills 110 to 140 px wide under you, 200+ px beside you, and one that follows you until 14 frames before it rises; 6 to 10 frames apart; 0.8 hit and a throw; they stand 240 frames as footing and cover. Phase 3 adds a ripple of 46 px humps every 6 frames, 96 px apart (16 px/frame), from the side farthest from you. | Step 70 px, or be in the air for the ripple. |
| I DO THIS! | A scribbled ring on you, locks 26 frames before the snap, radius 160 / 180 / 200 px, 0.8 hit, you are drawn as a squiggle for 36 frames and cannot be picked again for 10 s. Phase 2 two rings (Venn pair), phase 3 every fighter. | Leave the circle (about 5 px/frame needed). |
| LOVE HEARTS! (phase 1 on) | 4 / 5 / 6 waves 8 frames apart: two high arcs from the eyes (horizontal speed 4.6 up to 9.1) and one big low heart from the mouth toward you (5.2 up to 7.7, x1.12 in phase 3); solid, bounce 3 times, life 240 frames; 0.8 hit, big knock. | Hop under the arcs, step off the low line. |
| DON'T HUG THE CACTUS! (phase 3 only) | A Four-shaped cactus (76 px wide, 100 px tall) grows beside you and walks at 2.1 / 2.7 / 3.3 px/frame for 180 frames, two in phase 3; 0.8 hit, thrown straight up. He stays a puddle, hittable. | Walk away, or jump it. |
| Sparks (arena, phase 2 on) | A burst tube drops a spark at fixed floor spots (five tubes at 12% + 19% steps of the width; three trees in The Fourest) every 230 / 180 frames, 44 frames of flicker, 10 live, 34 px radius, 0.3 hit. | Not be there. |

Between turns he SLITHERS: sinks, runs along the floor to the mirror of your position (`WW - your x`, clamped to 14%..86% of the width) in 36 / 28 / 22 frames, re-forms.

## 2. Why a player outruns him on a big stage

Yardsticks: a run is 6.4 px/frame (MAXVX); the roster runs from about 5.4 (Tree, heavy slowdown) to 7.2 (Liy, x1.12); specials add dashes of 12 to 22 px/frame for 10 to 18 frames. A full jump rises 126 px (weakest jumper 107), a short hop 54 px.

1. Every moving thing he throws is SLOWER than a run or barely level with it: ring 6.0 / 6.8 / 7.5, pull 2 to 4, cactus 2.1 / 2.7 / 3.3, hearts 4.6 to 9 for at most 240 frames. A runner moving away is never touched by phase 1 and 2 rings or the cactus, and the pull never closes.
2. Everything aimed is a SNAPSHOT: zap columns, hills, I DO THIS! rings land where you stood 15 to 38 frames earlier and nothing leads you. Moving 60 to 200 px after the tell beats all of them (a runner covers 100 px in 16 frames).
3. The ring's gaps are ANGLES, so they get wider the farther you are: a 0.24 rad gap is 190 px each side at 800 px. At range you can stand still in the hole.
4. His reach is short: pull radius 500 / 600 / 700 px, ring shots live only as far as the farthest wall, hills, rings and columns sit on you. On the 1,100 px classroom the pull covers nearly all of the room wherever he stands; on 3,000 px a 700 px radius covers at most 47% of the width, and the pull starts where he put himself (300 to 360 px from you), so anyone past about 800 px is outside everything of his.
5. His own movement never closes distance: he follows at 1.2% of the gap per frame plus an easing of 6%, which is a steady 640 px behind a runner at 6.4, and the slither puts him on the mirror side of the stage, up to 0.72 of the width away (2,160 px on 3,000 px). The 1,100 px room forced contact; a big one lets the player be where nothing of his reaches.

So the fix is not bigger numbers on the same shapes. It is: faster than any run, aimed AHEAD of a runner, reach that grows with distance, a way to close the gap, and a floor that is not safe to flee across.

## 3. How big the rush arena should be, and the baseline rules

Recommended for Four: 3,000 px wide (about 2.7 times today's 1,100), same floor height and ceiling (about 720), solid end walls, three platforms (one over the centre, two about 800 px out and 160 px up) so the "be in the air" answers exist. Why: at 7.2 px/frame it is 417 frames (6.9 s) wall to wall, 9.3 s for a heavy; a wider room shows the scrolling camera, which draws at CAM_ZOOM 0.72, so about 1,528 px of world is on screen: the player sees half the stage at once. The family can run 2,400 to 4,000 px (the Teams map is about 5,500); if a different width is chosen, scale REACHES by width / 3,000 and never the speeds.

Three baseline changes every option assumes, because the tell is his body and the body must be on screen:
- A leash: when he is more than about 650 px from you he flies back at up to 10 px/frame (faster than any run; canon: he flies and is absurdly fast). Slower follow stays for the float itself.
- The slither goes to a spot 500 to 700 px from you on the side with more room, not to `WW - x`.
- The sparks (`fourSparkSpots`: five tubes at 12% + 19% steps of the width, 570 px apart on 3,000 px) keep their spots, but the next spark should pick the spot nearest the player so the hazard is on screen.

## 4. Fairness checks used for every option

A lateral dodge must fit in the frames given at 5 px/frame (Tree's run less margin); a jump must work with the weakest jump (107 px, a full jump) and a window of at least 9 frames; wind-ups are real frames after the 1.25 factor; one hit per turn; damage never above one full hit (22%). Bands: light 0.3 hit (6.6% of the meter), medium 0.8 (17.6%), heavy 1.0 (22%); a 22% hit is about 9% of one stock and about 2.3% of a 4-stock run (4 x 240), plus the launch.

## 5. The eight options (reaches given for a 3,000 px stage)

### 1. THE LONG NOTE (SCREECHY! buffed)  [buffed current, a fast expanding ring]
- Looks like: the existing screech: he rears back, shakes, mouth wide (render `fourscreech`), about 62 frames.
- Buff: ring speed 9.5 / 10.5 / 11.5 px/frame (faster than the fastest run, 7.2); a second ring 20 frames behind from phase 1, a third from phase 3 (gaps each a half-gap off the last); gap width fixed at one fighter + 70 px at the NEAREST fighter's range when it fires (so range no longer widens it), and the number of gaps rises with range (5 up to 9) so the nearest gap is never more than 5 px/frame x (frames until arrival - 20) away.
- Dodge: walk into the nearest gap and step across at the next ring.
- Why distance stops working: faster than a sprint, and the hole is as narrow at 1,000 px as at 300.
- Damage: heavy, one 22% hit, one hit per turn.
- Canon: Four page, Screechy (a screech that stuns a targeted contestant; he screeches under strong emotion; Take the Tower has one aimed at a contestant). The ring is game text.

### 2. ZAPPIES! BLUE MARK AHEAD (buffed)  [buffed current, vertical, a chase]
- Looks like: hands up (`fourzap`), the blue paint splotch on you (already drawn); locked splotches go white and glisten.
- Buff: a chain of four columns, 16 frames apart; each is placed where you will be if you keep your speed and heading (your last 10 frames of velocity x the 20 frames to its lock), and locks 15 frames before it lands; widths 52 / 88 px as now. Whole stage in reach: a bolt falls from above anywhere.
- Dodge: stop, reverse or sidestep 60 px after each white lock (4 px/frame is enough); a standing player is not hit by a lead aimed at a runner, so the rhythm is read, not guessed.
- Why distance stops working: nothing travels, it is placed on you; and it leads a runner.
- Damage: heavy, one 22% hit however many land.
- Canon: Four page: electricity from his hands, charged or instant; paint firing (blue paint tags a contestant, no contact needed, The Power of Four); the rampage where he zaps the whole cast (Oneirophobe's Nightmare). Weakness listed: poor aim (Bake-Off), hence the modest lead.

### 3. THE RIPPLE (TAKE THE TOWER! buffed)  [buffed current, a floor trap, two crests]
- Looks like: he waves a hand (`fourtower`, about 55 frames); the floor trembles and the blue light shows in cracks first at the far ends of a 1,800 px band around you (the existing floor-crack tell, grows in over 12 frames).
- Buff: from phase 1, the phase-3 ripple runs in from BOTH ends toward you at 16 px/frame (96 px apart, one every 6 frames), crosses at you and runs on; every 5th crest is an 80 px tower, the rest 46 px; after it the three hills of the old move remain as cover and footing.
- Dodge: be airborne as a crest passes: hop the low ones (a hop is above 30 px for about 17 frames), full jump the towers (the weakest jump is above 80 px for about 18 frames), or stand on a platform.
- Why distance stops working: 16 px/frame is 2.2x the fastest run and it comes from both sides, so running either way meets a crest.
- Damage: medium, 0.8 hit (17.6%) and a throw, once.
- Canon: Four page, Terraforming (hills raised with a wave of his hand, Take the Tower); the episode has him make two towers level with each other, hence two ends.

### 4. THE CACTUS DRIVE (DON'T HUG THE CACTUS! buffed)  [buffed current, a chase]
- Looks like: he melts into a puddle (`fourpuddle`, existing); two Four-shaped cacti grow out of the floor in 12 frames, one 500 px to one side of you and one 1,000 px to the other.
- Buff: from phase 2 (not only 3); they accelerate from 2 to 7.8 px/frame at 0.1 per frame (a sprint is 7.2) and chase the nearest fighter for 240 frames; height 70 px instead of 100 (a hop cannot clear it, a full jump can with a window of about 9 frames even at the weakest jump, 107 px); touching still throws you straight up.
- Dodge: jump each as it arrives (they arrive about a second apart, since they start 500 px apart), or stand on a platform. The puddle is hittable the whole time: dodging buys the chance to hit him.
- Why distance stops working: top speed above a sprint, two of them from opposite sides (running from one is running into the other), a 4 s life.
- Damage: medium, 0.8 hit (17.6%) plus a big throw, once.
- Canon: Four page, Warping (touching a cactus form of Four warps, lifts and pops a contestant); Chapter Complete's death list: a contestant is popped after hugging a Four cactus.

### 5. FIVE PAIRS OF ARMS  [new, a sweep and a combo]
- Looks like: he drops low, mouth stretched wide (`fourscreech` plus drawn arms); five pairs of arms unfurl from the mouth and lie coiled; the pair that goes next lifts about 10 frames before it swings.
- Does: every 24 frames one pair sends a palm sweeping along the floor both ways at 18 px/frame (palm 120 px wide, 40 px tall), reaching 600, 800, 1,000, 1,200, then 1,400 px; the arm stays as a visible rope behind it. The first 200 px under his chin is safe (the arms start there): a brave player can walk in and hit him, which is the answer a 1,200 hp boss should reward.
- Dodge: jump on the beat. A palm takes about 8 frames to pass; a full jump is above 40 px for about 33 frames, so one jump clears two palms 24 frames apart (about three jumps for five); a short hop clears one with a 5 frame window.
- Why distance stops working: no safe side, 18 px/frame is 2.5x a sprint, and the fifth palm reaches farther than a runner gets in the 100 frames since the start.
- Damage: medium, 0.8 hit (17.6%), once.
- Canon: The Four is Lava (five pairs of arms come out of his mouth when he is asked to recover a contestant); Four page, Malleability (a hand comes out of his mouth in Oneirophobe's Nightmare) and the Bake-Off fist that crushes Barf Bag.

### 6. HEAD THEM OFF  [new, a gap-closer]
- Looks like: his body flashes white twice (the despawn flash is canon) and he is gone; 30 frames later his body grows in (12 frames) 450 px ahead of where you are heading (450 px toward the nearer end if you stand still), fist raised.
- Does: 22 frames after he is whole the fist slams: a 260 px zone, then low waves (46 px) both ways at 11 px/frame for 450 px. Afterwards he is stuck 45 frames, fist in the floor.
- Dodge: reverse, stop or step out (about 4 px/frame over the 34 frames from grow-in to slam), hop the waves. A runner heading into him sees him arrive in the way.
- Why distance stops working: he reappears in your path at any distance, and the next move then starts at close range.
- Damage: heavy, 1.0 hit (22%) if you run into the fist; the waves alone are medium. One hit per turn.
- Canon: Great Goikian Bake-Off (Four teleports in front of Snowball as he heads for the kitchen, blocking him; Four also crushes Barf Bag with a fist); Four page, Teleportation.

### 7. SOUP'S ON!  [new, area denial]
- Looks like: a ladle grows in his hand and he winds back (the `fourlove` bounce reused for the wind-up; the ladle is drawn in code).
- Does: eight blobs of soup arc out 10 frames apart (54 frame flight), landing 300 to 1,500 px away, the first where you will be, the rest about 360 px apart alternating sides. Each lands as a steaming pool 160 px wide that grows in over 12 frames, stands 300 frames and scalds on touch (0.3 hit, again after 40 frames). A blob that lands on you hits while falling (0.5 hit).
- Dodge: full-jump a pool (a runner covers about 290 px in a full jump, a pool plus body is about 185 px), walk the 200 px gaps, stand on a platform, and watch the blobs (a real shadow under each). The pools leave about 44% of the stage covered for 5 s, which pushes a runner toward him or the platforms.
- Why distance stops working: it denies the ground you are fleeing across, and the first lob leads a runner.
- Damage: light to medium: 0.3 hit per pool touch (6.6%), 0.5 for a blob, pools use their own ids like the sparks.
- Canon: Return of the Rocket Ship (he serves hot soup as the episode's cake, throws spoonfuls that scald contestants); Four page: creation of soup and cakes, an exceptionally talented cook.

### 8. SO BIG  [new, a jump-in from above]
- Looks like: he swells (1x to 2.2x in 40 frames, existing scale hooks) while rising out of the top of the view, glides up to 24 px/frame to a point ahead of a runner, stops there (the lock), and drops; a real shadow grows under him; the body is the hitbox while it falls.
- Does: 40 frames from the lock to the landing; landing zone 150 px either side; low waves (46 px) 700 px each way at 12 px/frame. He lies stuck 70 frames afterwards, enormous and easy to hit: the biggest punish in the set.
- Dodge: step 160 px out in the 40 frames after he stops (4 px/frame), hop the waves.
- Why distance stops working: he crosses up to 1,200 px in an arc faster than any run, lands on the lead point of a runner, and the waves travel at 12 px/frame.
- Damage: heavy, 1.0 hit (22%) for the body; the waves are capped under the same id.
- Canon: Four page, Size manipulation (grows to immense size in Return of the Rocket Ship, Take the Tower and The Tweested Temple), Flight, and Superhuman strength. The dive itself is game text.

## 6. Notes

- Suggested five (one of each shape that matters, and the signature fixed): THE LONG NOTE, ZAPPIES! BLUE MARK AHEAD, FIVE PAIRS OF ARMS, HEAD THEM OFF, SOUP'S ON!. Alternates: THE RIPPLE (best floor trap), THE CACTUS DRIVE (best chase), SO BIG (best punish window). Phase fit: 1 and 2 get the first two; arms and head-off from phase 2; soup and the alternates from phase 3.
- Art: options 1 to 4 reuse existing renders and hooks. Arms need drawn arms over `fourscreech`; Head Them Off needs only a flash and a scale; Soup needs a ladle and a pool drawn in code; So Big needs only scale and a shadow.
- Spare canon, not counted: TONGUE LASH (a long fast tongue along the floor that grabs and reels in: grabs a contestant with his tongue, screeches her, swallows her, Return of the Rocket Ship; also licks, Take the Tower); EYE BEAMS (he zaps with his eyes, Chapter Complete; lasers are named in Four Goes Too Far); SPEED FLIGHT (a pass across the stage at a runner's height; canon speed is absurd, Chapter Complete).
- Not checked: the exact episode of the bus-driving line on the Four page (a bus charge would be game text); the transcript lines the game's comments cite (Enter the Exit, Chapter Complete transcripts) were not re-read, only the Four page and the episode summaries named above.
- Everything above was read and designed, nothing was run or changed in the game.
