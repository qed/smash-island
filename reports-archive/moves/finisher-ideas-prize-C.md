# Finisher ideas for Cabby (prize fighter C, code key PZ_C): four pitches

Written 2026-11-02. Local report, never ships (reports/ is git-ignored), so it uses her real name; in code she is PZ_C and her kit key is `files`. None of the four pitches needs her name in code: every kind name below (fan, correct, tumble, tryhard) is a plain word. Nothing here is built. I touched nothing in the game, a worktree or git; I ran no node script; I downloaded nothing. I read wikitext as text through one background browser tab of my own (opened, then closed).

The owner now says she has no finisher. Her V + C today is Big File: a big manila file slides under her and glides the way she faces for 5 seconds; standing on it she attacks 30% faster and her files fly at the nearest foe and come back. It has no hit of its own, so it does not read as a finisher. All four pitches below are hit-based; what to do with Big File is its own short section near the end.

## What her kit has now (so none of the four clones it)

- Attack: a short punch (5%).
- On File: flings one file from her drawer, flat and fast, long reach; 4% and the foe is on file for 6 s (her hits on them land 30% harder, applyHit's `_onFile` rider).
- Off the Cliff (up): rolls up and off, hangs a beat, drops drawer-first (13%, knockdown).
- Ride in the Drawer (down): bundles the foe in front into her lower drawer, rolls about 70 px, pops them out behind her dizzy (6%, stun).
- Her smash (V) is Drawer Slam: she rolls in and the lower drawer shoots open into the foe (a lunge, reach 30, 16%, knockdown). So a drawer shove, a roll-in lunge or a drawer grab would all be repeats, and I stayed away from them. Nothing in her kit hits all around her, answers a hit, or throws more than one file.

The rule for finishers, from finisher-ideas-v2.md and the brief: V + C, a short unique move that replaces the shared 14% swing; the tell is in the body (at most 12 frames, no lines, no popups, no letters); anything that appears grows in over 12 frames; 8 to 18% total on a landed finisher; a miss costs something or ends quickly; nothing unavoidable; computer only; no foe is moved into a wall or off the world by it; a simple CPU read; it runs from plain state online; bosses take a plain hit.

## What I read

- The Inanimate Insanity wiki, as wikitext: her character page, her Quotes page, her Coverage page (mostly "to be added" past episode 3, so I leaned on transcripts), and Cabby's Files; and the transcripts of Stranded in Paradise, The Shame of the Name, Snapshot Showdown, The Overthinkers, Tragedy at 60 Feet, Best Served Cold, I Am Chocolate!, Pesty Besties, Home Is Where the Heart Is, Friend or Froze, Spring on the Breakfast!, Blue Buried, The Great Bluish Bake Off, The Show Must Go On, A Jury of Your Fears, You Can't Do This Forever and The Future Is Today!. For the transcripts I read every line that names her, mentions a file or drawer, or is a stage direction about her, with the lines around the important ones; I did not read each transcript start to finish. I watched nothing; this is the wiki's text and stage directions only. The Battle for Dream Island wiki was not needed.
- The game: finisher-ideas-v2.md (style and rules), the finisher-ideas-prize-A.md and prize-B.md reports (format), PRIZE_KIT in artifacts/V1/index.html (MOVE_TEXT, SMASH_SPEC, UPSPEC, DOWNSPECIALS, ATKSPECIALS), the Big File engine (startFileRide, fileRideStep, atkSpeedSteps, aimBoomStep), and the FINISHERS V2 framework (finxStep, finxAdd, fxLock, fxTargets, fxHit, fxBossCircle, fxBossShape, finxPress with FX5_PRESS, the counter hook finx8Counter, fxWallDist, fxArt and fxTell, FINX_AI_KITS and finB1Ai). The line numbers move because someone is editing the file; I cite names.
- Scale used below: 60 frames is one second; maximum run 6.4 px a frame; a jump rises about 126 px (JUMP -12.5, GRAV 0.62, checked in the code); her hurt box is about 24.8 x 23.2 px (PRIZE_KIT.HURTBOX), so a foe her size is about 50 px wide and 46 px tall.

## What Cabby is: canon, game text, and what I could not confirm

Canon (the wiki; paraphrased):
- A periwinkle file cabinet with two drawers on her front, her face on the upper one, arms at her sides and four small wheels instead of legs. Her lower drawer opens, and she can open it without using her arms. She won Inanimate Insanity Invitational (Season 3) on a 7-6-2 jury vote over Balloon and Silver Spoon, after being voted out in Best Served Cold and rejoining in I Am Chocolate!. In Season 4 she is one of the three OSC leaders with OJ and Suitcase.
- Personality: diligent, meticulous, observant, puts a great deal of effort into everything. Her files are both her passion and a memory aid (she has long-term memory trouble). She lends files freely if asked, and gets upset and tends to retaliate when someone takes one without asking.
- Pesty Besties: in a rage she tells everyone to take a folder, "each and every folder must go", and throws the files to everyone (a stage direction). The wiki tags the line as rage.
- The Shame of the Name: Fan takes a file on himself out of her bottom drawer; she snatches it back, tells him not to touch her stuff and offers to rent him her file on good manners if he asks nicely. At the start of that episode she corrects MePhone about "fans" (she begins with the word "Correction").
- The Show Must Go On: in the drawing-guessing game she crosses out (X's) a wrong guess on her drawing. She calls herself a tryhard; Walkie Talkie says she tries too hard; she snaps at MePhone (a shouted STOP, tagged rage), puts her pen down, quits and leads a walkout; The Floor says everyone looks totally burnt out.
- Snapshot Showdown: she rolls up to OJ and pushes him with her bottom drawer (the game already uses this as Drawer Slam). Smug, she tells Silver Spoon she has read his file and he will not shoot; he does, and takes her picture; she photographs him back.
- You Can't Do This Forever, library flashback: she says she shot a photo of Silver and missed, he charged her full-force, and (Bot adds) she rammed into him.
- The Overthinkers: she lets go of the climbing rope and rolls down the hill screaming; Goo catches her like a slingshot; she opens her bottom drawer for a file and Bow, who was riding inside, looks dizzy.
- Stranded in Paradise: opens a drawer for her team and rolls off the cliff cheering (the game's Ride and Off the Cliff). Friend or Froze: Yin-Yang rides in "the Cab"; they roll down a cliff, bounce off a wall and land in quicksand.
- Home Is Where the Heart Is: a file on The Floor is used as bait on a fishing hook; she tickles The Floor and digs him up. The Future Is Today!: an alarm clock goes off and she takes it out of her lower drawer; she pulls out a blue sad-face file of complaints. I Am Chocolate!: she rolls into a pole to drop a bag, joins a letter-stacking challenge, and turns gold when Candle heats the Immunity Cookie. Best Served Cold: she hands MePhone a file of everyone's auras.

Game text (mine, not on screen): every number, every launch, the fan of files, the pen strokes, the spin, the stack of pages, the way each one costs her something. The scenes only supply the look and the attitude.

Could not confirm:
- Cabby's Files (a wiki page) says she puts a file onto Nickel's face in The Great Bluish Bake Off. The transcript text I read does not show it, so I did not use it.
- The wiki says her top drawer can open "according to the FLA files". It is not seen on screen, so I did not use it.
- That she ever hits anyone with a pen or a thrown file. The thrown files in Pesty Besties go "to everyone" as a rage toss, not at a foe. The red colour of the pen is game text. That she ever spins on purpose: she only rolls out of control, once.
- I did not watch any episode. The Coverage page has nothing for most Season 3 episodes.

## Engine pieces I would build on (all exist today unless flagged NEW)

- A finisher is a row in the kit's ATKSPECIALS that starts a FINX object (finxAdd with a plain kind name); finxStep runs it once a frame on the host; a guest only draws it from the `fnx` rows (FINX_NET). Her row stays `ATKSPECIALS.files`; it would be rewritten, and `startFileRide` would no longer be called from it.
- FIN_STARTUP = 12 (the body tell), FIN_GROW = 12 (a thing that appears is harmless until whole), FIN_CD = 74 (her row already puts her on this, not on the shared 180), one finisher out at a time.
- fxLock (commit the owner; a hit on her in a tell cancels the move), fxTell and fxArt (hit art drawn from the same numbers the hit uses), fxTargets and fxHit (a hit; the finisher's own earlier hits do not block its later ones), fxBossCircle and fxBossShape (a boss takes a plain hit once), fxWallDist and surfaceBelow (stop at a wall or a ledge, as the file ride does), FX5_PRESS (a second press). None of the four holds a foe, so FX5_LETGO is not needed.
- The counter hook: applyHit asks finx8Counter, which today answers only for Spikey's kit (`spikeburst`). A sibling branch for her kit key is how pitch 2 would work.
- The attack-speed buff (`atkSpd` and atkSpeedSteps) exists because Big File needs it. The CPU reads (FINX_AI_KITS and finB1Ai) are keyed by the kit's special key, here `files`; `files` is not in that list today (I checked), so any pitch needs one line added there, installed with the hidden fighter and removed with it, as ATKSPECIALS already is.
- Statuses that exist: SM_FX stun, slow, root, knockdown, onfile. Her special timer is `spCd` (Ride sets it to 120; I did not check what else shares it).
- On File's mark multiplies every hit of hers on a marked foe by 1.3. So every total below is the base number; a marked foe takes 30% more (the 14% swing would be 18.2%). I give the marked totals in the table.

## The four at a glance

| # | Pitch | Shape | Total on a clean landing | Marked foe (x1.3) | Needs NEW | Fun / Readable / Cheap |
|---|---|---|---|---|---|---|
| 1 | Take a Folder! | ranged fan of five files | 15% close, 9% mid | 19.5% / 11.7% | nothing big (one spent-files flag) | 4 / 4 / 4 |
| 2 | Correction. | counter-hit, red-pen X | 12% | 15.6% | a front-side test in the counter hook | 3 / 3 / 4 |
| 3 | Rolling Out of Control | close spin hitting all round | 13% | 16.9% | one full-turn spin of her sprite (art) | 4 / 4 / 3 |
| 4 | Try Hard | self-buff with a page-stack payoff | 5% to 13% | up to 16.9% | a landed-hit counter in applyHit | 3 / 3 / 3 |

House rules, all four: the tell is her body (a pose, at most 12 frames, no lines, popups or letters); anything that appears grows in over 12 frames; 8 to 18% on a landed finisher; a miss costs something; nothing unavoidable (every one has a jump, a distance or a timing answer); computer only; no foe is moved into a wall or off the world (the foe is only ever hit; Cabby's own step or creep stops at a wall or a ledge); a one-line CPU read; the host decides and a guest only draws; a boss takes a plain hit.

---

## Pitch 1: Take a Folder! (a ranged fan of files)

**Canon basis.** Pesty Besties: in a rage she cries for everyone to take a folder, each and every one, and throws the files to everyone (the stage direction). That scene is the loudest thing she does with her files, and it is a throw, not a lunge or a grab. Game text: five files in a fixed fan, their numbers, and the price. Not confirmed: she never throws a file at a foe on screen.

**In the body.**
- The tell (12 frames): her lower drawer slides open and folders bulge out of it; her face scrunches into the shout; the whole cabinet tips back on its wheels. Nothing is drawn around her.
- Frames 12 to 28: she heaves five files out of the open drawer, one every 4 frames, in the order outer-up, outer-down, inner-up, inner-down, centre. What grows in: each file leaves as a crumpled sheet and flares into a full manila folder over its first 12 frames of flight, harmless until whole. The centre file, thrown last, is the biggest.
- Then the empty drawer hangs open for 20 frames.

**Numbers.**
- Aim: fixed, the way she faces; no auto-aim (Big File's boomerang already aims at the nearest foe). Angles from level: 0 and plus or minus 10 and 20 degrees. Speed 5.5 px a frame, 24 frames of life, so each file starts about 20 px ahead of her middle and ends at about 152 px. A file that meets a floor, a wall or a solid block is spent there (fxWallDist). Hit circle r 15 (the centre file r 18).
- Because a file is harmless for its first 12 frames (66 px of flight), nothing closer than about 86 px from her middle can be hit. Live range is 86 to 152 px.
- Hits, one per file: 3% each, a flinch (launch about 1 px out and 2 up) for the four outer and inner files; the centre file, thrown last, is the launcher: 3% with launch 8 out, 9 up.
- What a foe her size takes (a foe 46 px tall, a file 15 px radius, so a file within about 38 px of the foe's middle height touches): from 86 to 104 px all five files overlap them, 5 hits, 15%; from 104 to 152 px the three middle files, 3 hits, 9%; closer than 86 or farther than 152, nothing. A jump clears the fan if the foe is about 65 px or more above her middle height as the files pass (a full jump rises 126 px).
- Status: none. Prop: none (a spent file just vanishes). A boss takes a plain 3% from each file that reaches it, once per file.
- With the mark (On File) each hit is 3.9%: 19.5% close, 11.7% mid.
- Hits 1 to 4 push so little that the foe stays in the band; if playtest shows the pushes carry them out of the five-file band, set the push to 0.

**Counterplay and miss cost.** Stand outside 152 px, or inside 86 px (right on her, where the files are still crumpled and she is open); jump the fan high; hit her in the 12-frame tell (it cancels); or hit her in the 28-frame throw, where she is locked and unarmoured. A miss costs her 12 + 16 frames of throwing and 20 of open drawer (48 frames, 0.8 s), then the 74-frame cooldown. And the price that applies hit or miss: she has thrown her files away, so her special timer (spCd) is held at 90 frames and On File, her damage engine, is gone for 1.5 s. She cannot throw and mark in the same breath.

**Engine pieces.** A FINX row `fan` (phases: draw, throw, end); fxLock; five points on the row, each with its own launch frame (0, 4, 8, 12, 16 after the tell), moved by finxStep and tested with fxTargets and a circle shape as Firey's jets are; fxBossCircle with one key per file; fxTell and fxArt. A guest draws file i from t0, face, x and y by plain arithmetic, so no per-file state rides the snapshot except which files are already spent (one small number on an existing FINX_NET key; I did not check which key is free). **NEW:** only that spent-files flag (tiny). The cost is `spCd`, no new field. FINX_AI_KITS gets `files`.

**Nearest cousin.** Her own On File (one flat, fast file that marks). The fan differs in shape and place: short and thick, not long and thin; no mark; and it empties her drawer. If the owner thinks two file throws are one too many, take pitch 3.

**CPU read.** On the ground, a grounded foe 86 to 150 px away and within 40 px of her height; then the usual small chance a frame (more at kill percent).

**Risks.** Stuck: none, all timers. Infinite: no; the throw, the cooldown and the 90-frame loss of On File. Camping: low; the band is narrow and a foe who stays outside 152 px takes nothing. Online: five points computed from the row; the host decides hits.

**Rating.** Fun 4, readable 4, cheap 4.

---

## Pitch 2: Correction. (a counter-hit that crosses the attacker out)

**Canon basis.** She is the one who corrects people: she corrects MePhone's remark about "fans" at the start of The Shame of the Name, insists on recording correct information (Spring on the Breakfast!), and in The Show Must Go On she crosses out a wrong guess on her drawing with an X. She says she has read your file and you will not do it (Snapshot Showdown; Silver then proves her wrong, which is why this one punishes a hit rather than predicting it), and she does not like her stuff being touched (The Shame of the Name). The red pen and the counter are game text. Not confirmed: she never uses a pen on a person.

**In the body.**
- The tell (12 frames): she raises a case file in front of her like a shield and clicks a red pen in the other hand; her eyes narrow, reading the nearest foe. Nothing is drawn round her.
- Then 36 frames of "ready": the file held up, the pen tip glowing red, her body locked and still. Nothing grows in.
- If nothing comes, she lowers the file and sighs for 14 frames (open).

**Numbers.**
- Trigger: the first melee hit (a fighter's own attack: not a shot, not a Final Smash, not a grab) that lands on her from the side she faces, from a fighter within 150 px. A boss's body or swing within 150 px on that side counts too (the same rule as Spikey's counter). A hit from behind is the cross-up: it lands normally and the stance ends.
- The hit does nothing to her (no damage, no push, no status); she is invulnerable 8 frames.
- The answer: she steps toward the attacker, up to 40 px at 10 px a frame (stopping short of a wall or a ledge), then two pen strokes, each a capsule 66 px long and 12 px wide, drawn as a red line: stroke 1 slants down and forward at +4 frames, 6%, a flinch (launch 2 out and 3 up); stroke 2 slants up and forward at +10 frames, 6%, launching 9 out and 10 up. Total 12%, two hits, drawn solid only on the frames they are live. The strokes are her arm moving, not a thing that appears, so no grow-in; if the owner reads the red line as appearing, lengthen the pen over 12 frames.
- Boss: the blocked hit gives it a plain 6% per stroke (fxBossShape, once each).
- Stands: nothing is left behind. Commit: 12 + 36 = 48 frames waiting, then about 26 frames if it fires.

**Counterplay and miss cost.** Wait out the 36 frames (the raised file and the glowing pen are the cue), hit her back (cross-up), throw a shot, grab her, or use a Final Smash; all go through and the stance is off (a shot or grab flinches her out of it). A miss costs 48 + 14 = 62 frames locked and then open, plus the 74-frame cooldown from the press: the longest miss of the four, and the one a patient foe punishes most.

**Engine pieces.** A FINX row `correct` (phases read, ready, step, stroke, end), modelled line for line on Spikey's row (finBristle, fxBristleStep); fxLock; the applyHit counter hook (finx8Counter) with a sibling branch for her kit key; fxWallDist and surfaceBelow for the step; fxTargets with a capsule; fxHit; fxBossShape; fxArt for the strokes; invulnerability as Spikey's block sets it. **NEW (small):** the front-side test, comparing the hitter's x with her facing (`face` is already on the row). No new system.

**Nearest cousin.** Spikey's Told You Not to Touch: a counter stance that answers the first close hit. Mine answers from the front only, steps in a short way and crosses the attacker out with two strokes instead of a spiked lunge with bleed. If one counter finisher in the game is enough, drop this one.

**CPU read.** The existing `counter` read (`ady < 24`, `gap` from -10 to 220) fits unchanged.

**Risks.** Stuck: none; the stance ends on time or on any hit that is not a front melee. Infinite: it cannot chain; the cooldown is 74. Camping: low; a foe can simply wait. Online: the host decides in applyHit; a guest draws the pose from `ph`, `face` and the row.

**Rating.** Fun 3, readable 3 (the front-only rule is the one thing a player must learn), cheap 4.

---

## Pitch 3: Rolling Out of Control (a close spin that hits all round her)

**Canon basis.** The Overthinkers: she lets go of the rope and rolls down the hill screaming, then is caught by Goo like a slingshot, and Bow, who was riding inside her, comes out dizzy. Friend or Froze: she and Yin-Yang roll down a cliff and bounce off a wall. Her four wheels and the bump-into-things habit (a pole in I Am Chocolate!) are canon. The tidy cabinet losing all control is the joke. Game text: spinning on purpose, the three passes and every number. Not confirmed: she never spins as an attack; this is her tumble made into a move.

**In the body.**
- The tell (12 frames): she rocks back onto her rear wheels, the wheels squeal and smoke, the lower drawer cracks open and a few files slip out. Then she tumbles: her body turns a full turn every 20 frames, the open drawer swinging out as the club. Nothing grows in; the spinning body is the hit, as a fighter's own body is in Spikey's lunge.

**Numbers.**
- Tumble: 40 frames, creeping forward 2 px a frame (80 px), along her floor only; it stops at a wall, and at a ledge (the same surfaceBelow test as the file ride's `fileRideBlocked`).
- Hits: three passes of a circle of radius 58 px round her middle (both sides, front and back; a foe's body touching the ring counts, so about 80 px centre to centre), at +8, +20 and +32 frames after the tell: 4%, 4% and 5%. A foe is hit once per pass. The first two flinch (launch 2 out from her and 3 up); the third launches, 9 away from her and 9 up. Total 13%, three hits.
- Status: none. Prop: none. A boss takes a plain 5% once.
- After it she is dizzy: 30 frames if any pass hit someone, 60 frames if all three found nobody (nothing and nobody was in reach, so she wobbles on much longer). Commit on a hit: 12 + 40 + 30 = 82 frames.

**Counterplay and miss cost.** Stay out of the ring (she creeps only 80 px, so backing off about 100 px beats it); hit her in the 12-frame tell (it cancels); or jump over her: she is a tall box, so the ring reaches about 58 px above her middle, and only a foe already high passes over. A whiff is the costliest of the four: 12 + 40 + 60 = 112 frames, nearly two seconds, then the 74-frame cooldown. A hit is cheaper because the third pass launches the foe clear.

**Engine pieces.** A FINX row `tumble` (phases tell, spin, dizzy); fxLock; the creep is Leafy's whirl or Lollipop's flurry movement with a wall test; three circle hits through fxTargets with a hit set per pass, as other multi-hit finishers keep; fxBossCircle; fxArt for the ring. **NEW (art only):** one full-turn rotation of her sprite about her middle. FIGHTER_ANIM has a deform hook that skews and scales about the feet (OJ's does); I did not check whether any fighter spins a full turn, so this is one small piece of drawing code, not a system.

**Nearest cousin.** Clover's Lucky Leaf Pinwheel (four 3% hits as she drifts 220 px, then a fling). Mine stays near where she started, hits three times and ends dizzy; and it is the only thing in her kit that hits behind her.

**CPU read.** A grounded foe about 80 px away or closer: `ady < 50` and `gap < 30`.

**Risks.** Stuck: none; the dizzy ends on a timer and the creep stops at walls and ledges, so she cannot roll off the world. Infinite: no; the dizzy and the cooldown. Camping: none; it needs a foe next to her. Online: the pass frames come from t0, so a guest draws the spin from the row; hits are the host's. Balance: a hit on a surround is the point; if it is too safe on a hit, lengthen the 30-frame dizzy.

**Rating.** Fun 4, readable 4 (a spinning cabinet with its drawer out says "keep away"), cheap 3 (the rotation art and the pass schedule).

---

## Pitch 4: Try Hard (a self-buff that pays off in a page slam)

**Canon basis.** The Show Must Go On: she calls herself a tryhard, Walkie Talkie says she tries too hard, she says the real shame would be not trying hard enough, then burns out with everyone else (The Floor says they all look totally burnt out). The wiki's own personality line is that she puts an incredible amount of effort into everything, and she is shown furiously writing in a file in many scenes. Game text: the window, the stack of pages and every number.

**In the body.**
- The tell (12 frames): she clicks her pen and bears down; the drawers rattle, steam puffs from her top, her face tightens. Nothing is drawn around her.
- Then she is free to move for 120 frames (2 s). A pile of loose pages sticks out of her lower drawer and visibly grows by one page for every hit of hers that lands (up to four). This is her own body's art, so nothing grows into the world.
- At the end (or on a second press) she grabs the stack in both arms, locks for 10 frames, and slams it down in front of her.

**Numbers.**
- Buff: 120 frames at 1.3 times attack speed (the owner's own Big File number; `atkSpd` 1.3 through atkSpeedSteps, reset to 1 when it ends or she is KO'd). She walks and fights normally.
- Pages: 1 per hit of hers that lands on a fighter or a boss, capped at 4.
- The payoff: a heavy slam in front, reach 80 px, one hit: 4% plus 2.25% for each page: 4% with none, 13% with four. Launch grows with the pages: 4 out and 4 up with none, 9 out and 11 up with four. It does not need her to have landed anything to be worth something; it just is weak then.
- Status: none. Prop: none. A boss takes a plain slam at the same number, once.
- Cost: if the slam hits nobody, she is burnt out: slowed (half walk speed, no attacks) for 60 frames. Hit or miss, the finisher cooldown (74) starts after the slam.

**Counterplay and miss cost.** Hit her during the 2 s (she is not armoured) and keep dodging, because only landed hits add pages; stay out of her 80 px slam reach at the end (the slam has a tell of its own: 10 frames of overhead gather); or just fight her normally and punish the burnout. A miss (slam into air) costs the 60-frame burnout on top of a window that gave a foe no reason to stand near her.

**Engine pieces.** A FINX row `tryhard` (phases tell, work, gather, slam, burn); fxLock only during the tell and the gather, not the window; the attack-speed buff (atkSpd and atkSpeedSteps, already built for Big File); FX5_PRESS for the optional early second press (as Toothpaste's turn does); a capsule hit through fxTargets, fxHit and fxBossShape; slow through SM_FX. **NEW (tiny):** a count of landed hits, one increment in applyHit when `from` has a tryhard row running. Nothing else.

**Nearest cousin.** Her own Big File (the same 30% speed buff), and Suitcase's soak-then-burst pitch (a buff that pays off when it ends). This is the least like a finisher at first look, because the damage lives in the window as well as the slam.

**CPU read.** A grounded foe within 140 px; the window is a fight the CPU already plays, and the slam fires by itself at 120 frames, or early at four pages with a foe within 80 px.

**Risks.** Stuck: none; the buff is a timer and is reset on a KO. Infinite: no; the cooldown starts after the slam. Camping: a foe who hides for 2 s makes her burn out, which is the point. Online: atkSpd, the page count and the phase ride the row. Balance: the speed buff plus the slam could be a lot on a marked foe (four 5% jabs and a 13% slam is over 30% in about 3 s); shorten the window to 90 frames or the speed to 1.2 before cutting the slam.

**Rating.** Fun 3, readable 3, cheap 3.

---

## Which one I would pick

Pitch 1, Take a Folder!. It is the most Cabby thing she does (her biggest rage, with her own files), it is the most readable (five folders fly out of an open drawer), it is hit-based and clearly a finisher at close range (15%, ending in a launching centre file), it answers a gap (no finisher, and her kit has nothing that hits more than once at a distance), and it costs her something that matters to her kit: On File is gone for 1.5 s. It needs no new system, only the throw schedule. The honest downside is that it shares "she throws a file" with On File.

If the owner wants something that looks like a finisher more than anything, pitch 3 is the runner-up: a spinning cabinet with its drawer flung out, a big whiff cost and a launching last pass. Pitch 2 is the cleverest and the cheapest to read in the code, but it is the closest to Spikey's finisher and rewards waiting. Pitch 4 is the least surprising and the hardest to balance.

## Big File: keep or replace (two lines)

1. Keep it, but not as the finisher: its cleanest home is as the bonus of whichever pitch is picked (a landed finisher slides the file under her for 3 s of the 30% attack speed and returning files), or as the partner of the down special (the file slides out after Ride in the Drawer pops the foe out), because the v2 rule lets a buff ride along with a hit; the ride code stands alone but its 240-frame wait lives on the finisher cooldown, so it needs its own timer if it moves. Replacing it loses only the owner's own idea.
2. To make it read as a finisher if he keeps it as one, give it a hit at each end: the file shoots out under her as a 9% shove (12-frame grow-in, launch 6 out and 6 up) and a second press flips it up in a 10% slam that ends the ride; with no hit it will keep reading as a stance.

## Ideas I looked at and dropped

- Exhibit A, a shove: in Tragedy at 60 Feet she pushes Clover off a cliff to show her luck. It would send a foe off the world, which a finisher may not do.
- A camera flash: in Snapshot Showdown and the finale she photographs Silver. Cammy's group photo and Flower's dazzle already cover it.
- The alarm clock from her drawer (The Future Is Today!): a ringing timer is Bomb's timer bomb with a different prop.
- A bait file on a hook (Home Is Where the Heart Is): a step-on trap is Grassy, Bell and the other prize fighter's door; and the hook scene is a plan for catching The Floor, not something she fights with.
- Read your file and aim ahead of the foe: a second flat file throw next to On File.
- A ram or charge (the finale ram, leading the walkout): her smash Drawer Slam is already a lunge.
- Educate Yourself, a file slapped onto the foe's face: a second close grab next to Ride in the Drawer, and the face-file scene is only on the wiki's Cabby's Files page.
- A backwards roll that hits behind her (The Overthinkers): the CPU would have to turn its back on the foe to use it.
- Golden Cabby (the Immunity Cookie): armour that pays off when it ends is the same shape as Suitcase's pitch 4.

## Question box lines

1. Take a Folder!: Cabby rips her drawer open and throws five files in a fan, 90 to 150 px out. Up close all five hit, 15% and a launch; mid-range 9%. She loses On File for 1.5 seconds.
2. Correction.: Cabby raises a file shield and clicks a red pen. The first hit on her front is blocked and she crosses the attacker out with two strokes, 12% and a launch. Hit her back.
3. Rolling Out of Control: Cabby tumbles on her wheels, drawer flung out, hitting all around her three times, 13% and a launch. Back off about 100 px; a miss leaves her dizzy.
4. Try Hard: Cabby bears down for 2 seconds, attacking 30% faster and stacking a page for every hit. Then she slams the stack, 4% to 13%. A whiff burns her out for a second.
