# Four, the "Who Stole Donut's Diary?" slot: three attack options (2026-11-02)

Read-only. Nothing in the game was run or changed. The owner's ask: Four's rush kit takes one attack "from 'who stole donuts diary'" (the BFB episode, BFB 22, "Who Stole Donut's Diary?"). This file reads the episode, finds what Four does in it, and proposes three attacks for the 2,400 px rush stage. Wiki text is paraphrased, not copied; the only words kept are the move names.

Four's other six (do not duplicate their shapes): THE LONG NOTE (ring), ZAPPIES! blue mark ahead (columns), THE RIPPLE (floor crests), THE CACTUS DRIVE (two cacti), FIVE PAIRS OF ARMS (palms along the floor), SOUP'S ON! (pools).

## 1. Pages checked

Battle for Dream Island wiki (raw wikitext, read in the built-in browser pane):
- "Who Stole Donut's Diary?" (infobox, plot, trivia, continuity, deaths). The infobox lists the prize as the pieces of Donut's diary and the cake as broken flower pot pieces.
- Its Transcript page, in full: every Four line and every stage direction.
- "Donut's Diary" (what happens to the book), "The Courtroom", "Big Rotating Building" (the cages and the spin), "Four" (Powers and abilities, the kill list).
Game and reports (read only): `artifacts/V1/index.html` (`FOUR`, `fourLook`, `BOSS_PICK.four`), `reports/algebralien-rush/spec.md` section 8 (stage, leash, the guarantee), `owner-rules.md`, `attack-options-four.md`.
Not done: the video was not watched, so how a prop looks (the gavel, the BRB's cages, the clap) comes from the transcript's stage directions only. The first transcript fetch returned HTTP 522; a retry returned 200.

## 2. What Four does in the episode

Cold open to Cake at Stake: he presents the stolen diary as the prize and goes off to help X; comes back, finds it gone and goes loud and angry; takes Flower's pot as the backup prize (X smashes it with a hammer). He starts a speech, is accused of eating last time's cake, throws the speech away. He reads the votes (56,990 cast, everyone over 10,000), throws a pot piece at Blocky (who catches it), sings the elimination song, then runs a long suspense that cuts faster and faster until he holds up one finger and says the margin was one vote ("less than four"). He jumps into X's aloe vera garden, which lifts a platform; he reveals the Big Rotating Building (a three-beat fanfare, eliminated contestants swung around, a cage lowered); the last digit of Taco's votes flickers until it stops.

Court: the platform descends into a courthouse; he claps, which teleports the Have Cots in; bangs a gavel ("Court is now in session!"); turns the challenge into a court case. When Bubble calls his quick return suspicious he goes angry ("I was counting the votes!"), then rage ("I'm not on trial here!") and pops her. He translates Woody (in Woody's flashback a scary, distorted Four threatens to eat everyone), pulls off Blocky's grape costume, reads X's mind with a memory beam ("Did you just scan my brain?" "I sure did!"), recovers Leafy on Firey's request, announces the verdict, says the budget has no jail so the thief goes free, and hands the remaining Have Nots their equal shares of the diary, now in pieces (the Donut's Diary page says he tears it up). Stinger: Firey must clean the railway; Blocky has put 58 pages of the diary online.

Props and abilities in play: the diary, pot pieces, a gavel, the aloe garden platform, the BRB and its cages, a clap that teleports, a memory beam, a hand that recovers, size and voice changes, a mood scale from calm to angry to rage.

## 3. What the rush needs (from spec.md section 8 and the earlier Four report)

- Stage 2,400 x 860, floor 705 px under the top, solid end walls, a centre platform 393 px wide and 144 px up, two ledges 200 px wide and 144 px up at 20% and 80% of the width. Camera: about 1,528 px of world on screen, framing boss and fighter. Leash: he is within 650 px of you at the start of every turn.
- The guarantee: each move is placed on you at its lock, or leads your run, or moves faster than 9 px a frame, or is leashed; nothing is answered by running.
- House rules: the tell is in his body (no lines, banners or move-name popups); anything that appears grows in over 12 frames; falling things hit while falling; one hit per attack id per fighter; at most one full boss hit (22% of the fighter meter); everything drawn is a pure function of the `_hz` bag and the clock (offline at launch, so online stays possible).
- Yardsticks: a lateral dodge must work at 5 px a frame (Tree's run less margin); the weakest jump rises 107 px; wind-ups run 1.25 times the table (a 50 is about 62 frames). Bands: light 0.3 hit (6.6%), medium 0.8 (17.6%), heavy 1.0 (22%).
- The six picks lean on jumping (ripple, arms, pools, cacti) or on leaving a spot (columns, ring). What they do not have: a wide slow thing you read and weave, and a move that punishes standing at his chin. Options 1 and 2 are those; option 3 is the only aimed throw.

## 4. The three options

### 1. EQUAL SHARES  [new, the whole stage, a curtain with lanes]  (RECOMMENDED)
- Tell, in his body (frames at the 1.25 pace, about 62): a small blue book (the diary: blue cover, a yellow oval, drawn in code) grows in his hands over 12 frames; he rises 50 px and trembles (about 3 px, a slight widen) for 30 frames; both hands pull apart (a lean back, a squash) and the book tears; pages burst up out of his hands and leave the top of the view. Rising pages do no harm.
- What happens: 58 pages (the stinger's count) fall from the top (141 frames to the floor at 5 px a frame). The 2,400 px stage is cut into four equal shares of 600 px (the four who got equal shares). Each share has 14 or 15 pages, 56 x 70 px, spawned one about every 5 frames for 70 frames, with a clear lane 180 px wide left in it. All pages in a share sway together, 50 px either way on a 96 frame sine, so the lane slides at most 3.3 px a frame. Lane centres sit within 120 px of each share's middle (seeded by the attack id). Pages vanish on the floor and on any platform: standing under the centre platform or a ledge is cover, standing on top is not.
- Phases: 2, lane 150 px and a second wave 70 frames after the first, its lanes re-placed at least 240 px from where you stand when it starts (so staying put in lane one is answered, and the move is placed on you at its lock); 3, three waves, lane 150 px. Phase 1 is one wave.
- Dodge: find the lane (the nearest is at most 420 px from anywhere: 84 frames at 5 px a frame; the first pages show about 20 frames after the rip and take 141 frames to land, so there are 100 frames or more), step in, follow its slide (3.3 px a frame, under any run). The camera shows two lanes at once.
- Why distance and running stop working: nothing is aimed, so nothing can be outrun or outwaited; it covers the whole width, so a wall is not a refuge; it is slow, so every dodge is a read, not a reflex; and the sway makes camping a lane drift into the curtain.
- Damage: light. 0.3 hit (6.6%) per page, each page its own id, at most three per fighter per turn (19.8%, under one boss hit).
- Canon: the episode's prize is the pieces of Donut's diary (infobox) and he hands out equal shares of it; the Donut's Diary page says he tears it apart; 58 pages online (stinger); four have-nots share it (Woody, Firey, Flower, Blocky). The curtain and the lanes are game text.
- Build: pages are a pure function of the clock and a few numbers (start frame, four lane centres, sway phase), so a client draws them from `_hz` with no per-page state; one hit test per page per frame. Art: the drawn book and one page shape (paper with a few blue symbols).

### 2. I'M NOT ON TRIAL HERE!  [new, the close punisher, a blast around him]
- Tell, in his body (about 64 frames): he flies to 220 px from you on the side of you with less room (the rule GO BYE-BYE already uses); wears the angry render (`fourmad`) with a small shake for about 26 frames; then the next-level-mad render (`fournext`) while he swells to 1.7 times and shakes harder; a 4 frame squeeze; then the pop. In phase 2 he already wears `fourmad` and in phase 3 `fournext` (see `fourLook`), so the move forces the look up a step (angry to next-level) and in phase 3 the swell and shake carry it.
- What happens: a round blast, 340 px from his middle, grows from his edge outward over 12 frames and stays live 8 frames. It is a round blast, so a ledge inside the circle is hit and a jump does not help. After it he is spent: he shrinks back over 20 frames and is stuck 30 frames (the free hits are the reward for having stepped back).
- Dodge: be 380 px or more from his middle at the pop. From 220 px that is 160 px in about 50 frames, 3.2 px a frame, well under the 5 px yardstick. He chooses the side with less room, so the room to back away into is always there.
- Why it fits: the set has nothing that hits the brave. FIVE PAIRS OF ARMS leaves a safe pocket under his chin, and this is the answer to a player who lives there. It is placed on you at its lock (he comes to you, then locks). Honest limit: a player who runs the whole tell escapes it, as with any one-spot move; the leash and the other six cover that.
- Damage: heavy. 1.0 hit (22%) and a big knock away from him, once.
- Canon: transcript: a question about his quick return makes him angry (face for angry), then rage (louder, bigger), and he pops Bubble ("We're gonna need a new question asker"); the Four page's kill list names Bubble in this episode; the Four page lists voice amplified to cosmic levels and size growth. The blast's shape and radius are game text.
- Build: one circle test (like I DO THIS! uses), two renders that exist, scale and shake hooks that exist; no new art. Picker tag: close.

### 3. A PIECE OF THE POT  [new, the only aimed throw, a piece that breaks twice]
- Tell, in his body (about 62 frames): he reaches behind his back and brings out a big curved clay piece (orange-brown, with the pot's rim; drawn in code), leans back and squashes for 40 frames, then heaves it forward two-handed over 8 frames (a lean forward, a stretch).
- What happens: the piece is lobbed to where you will be: your last 10 frames of velocity times the 36 frame flight, at most 380 px ahead (it is thrown like a pass), apex about 220 px. On landing it breaks into two halves (44 px) that arc out both ways (range about 260 px, apex about 130 px, so they pass over a standing fighter at the top of the arc and come down at both ends); where each half lands it breaks into two small pieces (28 px) that skip along the floor 8 px a frame for 90 frames and are 30 px tall. Four small pieces in all.
- Dodge: step 110 px off the landing spot after the release (22 frames at 5 px a frame, 36 available); slip under the arcs near the top of their flight (the safe place is under the apex); hop the skippers (a hop is above 30 px for about 17 frames). The lob moves 9 to 18 px a frame depending on range, so a far fighter cannot wait it out.
- Why distance stops working: it leads a runner, and the break gives it a second and a third reach after the first miss. Honest limit: it is the closest of the three to SOUP'S ON! (a lob that leaves things on the floor) and to LOVE HEARTS! (arcs that bounce). The difference is the break: it turns on the landing spot and leaves nothing standing.
- Damage: medium. The big piece 0.8 hit (17.6%), a half 0.5 (11%), a small piece 0.3 (6.6%); one hit per turn, so never more than 17.6%.
- Canon: in the episode he throws a piece of the pot at Blocky, who catches it; the cake is the broken pieces of Flower's pot (infobox); he plans to break the pot into pieces for Cake at Stake and X smashes it. The lead, the halving and the skipping are game text.
- Build: shots like the existing hearts (bounce and arc), one split event, two sizes of one drawn shard. Picker tag: any.

## 5. Recommendation

EQUAL SHARES. Reasons: it is the episode's own prize (the diary in pieces, and the owner's own words name the diary), so it reads as that episode at once; it is the only one of the three that no run, wall or wait answers, which is the point of the rush kit; it brings a new verb (find a lane and follow it) to a set that is all hopping and leaving; its damage is light, so it paces the heavy moves; and it is the cheapest to build and to keep online-safe, because every page is a function of the clock. If the owner wants a second pick from this list, I'M NOT ON TRIAL HERE! is the better one: it is nearly free to build (two renders that already exist) and it is the only move that punishes standing at his chin.

## 6. Spare canon, and why I did not offer it

- THE GAVEL ("Court is now in session!", the episode's featured line): a gavel that slams a spot is a column on a lock, the same shape as ZAPPIES!. Kept as a sound and a prop for another move if the owner wants it.
- THE CLAP (it teleports the Have Cots in): with the 650 px leash he is never far, so pulling you to him gains nothing; and Two's CLAP FULL SPAN is already in the rush, one boss earlier, so two clappers in a row would repeat the gesture; it would also be the first move that relocates the fighter, which the earlier Four report's HEAD THEM OFF (a teleport-in) did not win.
- THE BIG ROTATING BUILDING (cages swung around quickly): a cage on a chain swings like a pendulum. Low enough to hit a standing fighter, it sweeps through at up to 20 px a frame with no jump over it (unavoidable); high enough to be fair, it only hits a jumper, which is trivial. A cage lowered on a spot is another column.
- THE MEMORY BEAM (reads X's mind): close to Two's MIND READ!, which exists in the game; a replay of your last seconds is harmless to a runner or unfair to one standing still.
- THE AMBUSH BEHIND YOU (X teleports behind Firey): a teleport-in, as above.
- STAND PERFECTLY STILL (Woody's flashback, in Four's voice) with the vote suspense as the tell: the only move that punishes running, but a "do not move" check is a gotcha with no banner to teach it, and a knock-back or a spark would count as moving.
- JUMP ROPE (the cold open): repeats a floor sweep you jump on a beat (arms and ripple).
- THE EATING THREAT (Woody's flashback): GO BYE-BYE! already exists in the base game; its pull is slower than a run, so a buffed version would be a gap closer, but the leash already closes the gap.

## 7. Notes

- Everything here is read from the wiki and the code and designed; none of it was played.
- Not checked: how the gavel, the clap and the BRB look on screen; the exact visual of the pop (the transcript says only that he pops her); whether this episode shows a cloud timer (the Four page lists cloud timers as an ability but this episode's pages do not mention one).
- The owner's Four list is seven attacks: the six above plus one from this episode, so one of the three is taken. With EQUAL SHARES the set is a ring, columns, crests, cacti, arms, pools and a curtain; with I'M NOT ON TRIAL HERE! it is the same six and a point-blank blast.
