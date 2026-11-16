# Finisher ideas, prize B (Suitcase): four pitches

Written 2026-11-02. Pitches only: nothing is built, no game file was touched. This is a local report (reports/ is git-ignored), so it uses her real name; the game calls her PZ_B and her kit key is `voices`, so none of this needs her name in code (her row would sit in PRIZE_KIT.ATKSPECIALS under `voices`, exactly where Cabby's `files` row sits).

## Where she stands now

- Her finisher (V + C) is the shared swing: "a heavy swing right in front of you (short reach). On hit: 14%." (PRIZE_KIT.MOVE_TEXT). She has no ATKSPECIALS row, so she gets the shared swing and the long shared cooldown (FIN_CD_SHARED 180). A row of her own switches her to the normal finisher cooldown (FIN_CD 74, one at a time).
- Not to be cloned, so none of the four does these: Attack (a kick), Full of Voices (a slow wave ahead, 5%, scrambles controls up to about 0.9 s), Rocket to Mars (rides a rocket straight up, the blast under her burns), All the Tools We Need (a wrench trap on the floor ahead, 4%, stun). Her smash (V) is also taken: Something Glowing Inside, a glowing bomb she sets down as a mine (17%). So I stayed away from the bomb scene, a wrench or tool trap, and a scramble.
- A note on the request: the kit text shows the shared swing for her and for the hidden fighter A. Fighter C already has a finisher row (Big File, your own 2026-10-19 design), so a pitch for C should start from that.

## What I read, and what is canon

Read as wikitext on the Inanimate Insanity wiki (no downloads): her character page, her Coverage page, her Quotes page, and the transcripts of Marsh on Mars, Objects in Mirror, Mazed and Confused, Hatching the Plan, Kick the Bucket, Breaking the Ice, The Reality of the Situation (stage directions), The Future Is Today! and Run the Risk!. The Battle for Dream Island wiki was not needed.

Canon, in short (paraphrased):
- She is a twine-coloured suitcase with sunflower-coloured straps, armless, and she opens herself whenever she likes to store things. Her bio says she keeps her feelings packed tightly inside but is not afraid to open up when needed, that she is full of useful tools, and that she is also full of voices.
- Marsh on Mars: she opens to show the tools, lends them all, then volunteers to ride the rocket to rescue Marshmallow, who was knocked into the sky and landed on Mars. She and Balloon float on Mars.
- Kick the Bucket: Balloon throws his bucket to her and she opens herself up to carry it; she dives for a dropped one while hearing voices and seaweed wraps her foot.
- Hatching the Plan: she carries a chunk of metal over and throws it on a pile, then closes herself when her anxieties start. She also says they have been to space before, so it should be easy.
- Objects in Mirror: she explains the red-line race (outrun the red striped line or be demolished; it may only take your legs and leave a ghost tail; images are projected to distract you) and cheers everyone to the start with "Off to the races!". Afterwards Steve Cobs takes the glowing thing out of her and it blows him up. She wins the season for it.
- The Future Is Today! (Season 4): she is the OSC's leader of Safety. She shuts the main water valve, and when Nickel shoots out of the pipe and bounces off the floor she is the one who catches him (Cabby says she can). Run the Risk!: she patrols safety like a parole officer.
- The Reality of the Situation: a stage direction has her kick open the door to Cobs's office. Coverage (Breaking the Ice): she kicks a dodgeball and is caught out.

Game text (mine, not canon): every number, every launch, the spring in the catch, the line speeding up, the rocket pad and its countdown, the burst that grows with what she soaked up.

Could not confirm:
- "Rocket enthusiast": no page calls her that. What is canon is two space trips (volunteering for Mars, then the Egg Spaceship episode) and that she is willing. I treat it as "rocket veteran".
- She never fights anyone on screen; the nearest are the door kick, the dodgeball kick and the Cobs bomb. Everything offensive here is game invention on top of traits.
- The red line's speed: the transcript says only that a glowing red line follows the runners and deletes those who stop. That it speeds up, and that she starts it, are game text.
- I did not watch any episode; this is the wiki's text and stage directions only.

## The engine pieces the pitches use (FINISHERS V2)

Names are the ones in artifacts/V1/index.html (the framework runs from about line 49554).
- A finisher is a row in the kit's ATKSPECIALS that starts a FINX object (finxAdd); finxStep runs it once a frame, finxDraw draws it, and the snapshot carries it (FINX_NET), so the host runs it and a guest only draws.
- The lock: fxLock keeps the owner committed; a hit on her in a tell cancels the move. The hold on a foe: fxHold marks the foe `_fxBy`, nothing else takes them, and the let-go list (FX5_LETGO) frees them on a KO, a jail or a Final Smash catch.
- The tell is the fighter's own startup (FIN_STARTUP = 12 frames, fxTell). A placed thing grows in over FIN_GROW = 12 frames and cannot hurt until whole. A hit area is drawn solid only on the frames it is live (fxArt); bosses take a plain hit once (fxBossShape, fxBossCircle). Walls are checked with fxWallDist, fxWallSpan and fxClear; a floor end is checked with surfaceBelow.
- A prop with hit points is Pen's cap sentry (fxSentryDmg, wired to finxSwingHit and finxShotHit). Statuses: SM_FX (burn, bleed, root, slow, stun...), the scramble (applyCtrlRev, capped at 55 frames), and armour (f.armor with braceUp: damage x0.6, launch x0.4 in applyHit).
- The CPU: the kit key goes in FINX_AI_KITS with a want line (finB1Ai: a read on where the foe is, then a small chance per frame, more at kill percent). A kit not in that list never presses its finisher.
- Scale: maximum run speed 6.4 px a frame, a jump rises about 126 px (JUMP -12.5, GRAV 0.62), 60 frames is one second, her body radius is about 24 px.

---

## Pitch 1: Safety Net (a close catch that ends in a launch)

**Canon basis.** Canon: in The Future Is Today! Nickel shoots out of a pipe, bounces off the floor and Suitcase catches him; Cabby says she can; she is the OSC's leader of Safety. In Kick the Bucket she opens herself up to catch Balloon's thrown bucket. Game text: the airborne-only catch, the springy launch, all numbers. Not confirmed: she never throws or launches anyone.

**In the body.**
- The tell (12 frames): she crouches, her lid swings up and back and her straps pull taut across the opening like a net. This is the existing lid animation, held open.
- What grows in: nothing. The open lid is the whole move; a caught foe is drawn sitting in it.
- Then 24 frames with the lid held open (the live window), and if nobody landed, 16 frames of the lid closing slowly.

**Numbers.**
- Reach: a catch box above and around her, a vertical capsule 68 px wide (34 px each side of her middle), from her top edge to 70 px above it. It is never drawn; the lid is the cue. Only a foe who is in the air in that box is caught; a foe on the ground is not.
- Hits: 2. The catch is 3%; the foe is held in the lid 14 frames (she squats, then springs); the spring is 10%, launch 6 px a frame forward and 14 up. Total 13%.
- Status: the hold only (`_fxBy`, 14 frames). No prop. A boss in the box takes a plain 13% once (too big to catch).

**Counterplay and miss cost.** Do not jump or fall onto her while the lid is up; the open lid is a 12-frame warning, a hit on her in the tell cancels it, and a foe on the ground walks up and hits her while she is open. On a miss she is open and hittable for about 52 frames (12 + 24 + 16), the longest miss of the four, then the 74-frame cooldown.

**Engine pieces.** finxAdd row with phases (up, open, bounce, yawn); fxLock; fxTargets with a capsule from fxCap, filtered to airborne foes; fxCanHit and fxHit for the two hits; fxHold plus a FX5_LETGO entry for the hold; fxBossCircle for a boss; the usual FINX_NET, FINX_AI_KITS and FIN_CD wiring. A small draw tweak: the prize lid animation held open for 36 frames instead of its 24-frame curve. NEW: nothing. Check overhead: if a solid sits in the box (a block on Moon Caves, a low platform), fxClear says no and the catch does not come out (not spent).

**CPU read.** Press it when the foe is in the air, within 70 px sideways, 20 to 130 px above her, and not still rising.

**Risks.** Stuck state: none if she is hit, KO'd or jailed mid-hold, because the foe is freed through the let-go list. Infinite: none (one catch a press, then the cooldown). Camping: none, she stands open. Online: all from the FINX row and the foe's `_fxBy`, no random roll. It looks like Cabby's Ride in the Drawer (a foe bundled into a container) but triggers on a different thing (air only) and does not move her; and like Loser's Effortless Catch, which is a counter, while this is an active window.

**Ratings.** Fun 3, readable 4, cheap to build 3.

---

## Pitch 2: Off to the Races (a ranged wall that speeds up)

**Canon basis.** Canon: in Objects in Mirror she is the one who explains the red-line race to everyone (outrun the red striped line, it takes your legs and leaves ghost tails) and then sends everyone off to the start. Game text: that she starts the line, that it speeds up, every number. Not confirmed: the line's real speed, or any scene where she controls it.

**In the body.**
- The tell (12 frames): she rears back and her lid flaps wide like a starter's flag.
- What grows in: a low red-and-white striped barrier rises out of the floor 42 px ahead of her middle over 12 frames, harmless while it grows (drawn as the thing itself, no outline or marker). Then it slides ahead along the floor, getting faster each frame.

**Numbers.**
- Reach: it starts 42 px ahead and travels about 333 px (45 frames), so it ends about 375 px out, and stops short at a solid wall or where her floor ends. It is 14 px thick and 60 px tall, leg height, so any jump clears it.
- Speed: 3 px a frame, rising 0.2 every frame, to about 12 at the end. It passes the top run speed (6.4) around frame 17, 80 px along. A foe who runs away at full speed from the moment it starts moving escapes unless they began within about 45 px of the line's start; everyone else has to jump or be hit.
- Hits: 1 per foe, 12%, launch 7 px a frame forward and 11 up. No status. No prop beyond the line itself, which exists about 69 frames from the press (24 to form, 45 to run) and then is gone. A boss it touches takes a plain 12% once.

**Counterplay and miss cost.** Back off during the 12 + 12 frames it takes to form, run clear early, or jump it; jump late if it is fast. On a miss she is committed 24 frames (tell and grow), then free, and the line just trundles off; the finisher's cooldown runs from when the line is gone (about 45 frames later) plus 74.

**Engine pieces.** The Leafy whirl's step is the template (a moving capsule with a once-per-foe list), plus Firey's rule of stopping where the floor ends. finxAdd row (up, grow, sweep); fxLock until it is whole; fxTargets and fxHit; fxBossShape for a boss; FINX_LEFT entry so the sweep hits only the target and does not freeze her; FINX_NET fields for a guest to draw it. The speeding up is one line in the step (add 0.2 a frame). NEW: nothing.

**CPU read.** Reuse Firey's ember read (both on the ground, within 36 px of her height, foe 50 to 300 px ahead).

**Risks.** Stuck state: none, it ends by time. Infinite: none. Camping: it zones the ground in front of her for about a second, nothing more. A foe in hitstun near her is hit when it is whole, which makes it a combo ender (intended). Online: x, speed and phase in the FINX row, a guest draws it. It resembles things that travel along the floor ahead (Leafy's whirl, Marshmallow's rolling log, Snowball's bowled ball); the differences are a tall thin stripe, a hit once, and the run-or-jump race from the speed-up.

**Ratings.** Fun 4, readable 5, cheap to build 4.

---

## Pitch 3: Lift-Off Pad (a prop with a countdown that flies foes up)

**Canon basis.** Canon: in Marsh on Mars the team's rocket takes off, Marshmallow is knocked into the sky and lands on Mars, and Suitcase volunteers to ride the rocket to fetch her; in Hatching the Plan she says they have been to space before. Game text: the pad, the three-blink countdown, the foe riding up. Not confirmed: she never fires a rocket at anyone, and "rocket enthusiast" is not a canon trait.

**In the body.**
- The tell (12 frames): her lid opens and tools clatter as she hauls something out.
- What grows in: a stubby white rocket with a red nose and fins (the Rocket to Mars art, reused) bolts together out of the floor over 12 frames, 34 px wide and 86 px tall, 90 px ahead of her. Harmless while it grows and while it counts.
- Then 36 frames of fuse: the nose light blinks three times (every 12 frames) and smoke curls at the nozzle. It ignites at frame 60 from the press.

**Numbers.**
- Placement: 90 px ahead (her radius plus 66) on her own floor, only with floor under it and 150 px of clear air overhead; otherwise it does not come and the finisher is not spent.
- Reach: the plume is a circle of radius 40 px at the base, live 8 frames. A foe inside is hit for 4% and strapped on; the rocket carries them straight up 22 frames at 6 px a frame (about 132 px; it stops short under any solid above, or 40 px under the top of the world), then pops and releases them, 8%, launch 6 forward and 8 up. Total 12%.
- Status: the hold (about 22 frames). Prop: the rocket stands about 90 frames from the press (24 to form, 36 of fuse, then it flies off) and has 8 hit points: two jabs, or one hard hit, topple it and it fizzles with no plume. A boss in the plume takes a plain 12% once.

**Counterplay and miss cost.** Step 40 px away from the base in the 60 frames before it lights, jump clear, or knock it over. On a miss she is committed only 24 frames, but the finisher waits until the rocket is gone, about 90 frames, plus 74: the longest lockout of the four.

**Engine pieces.** finxAdd row (up, grow, fuse, lift, gone); fxTell; fxCircle for the plume; fxHold and fxFree for the ride plus a FX5_LETGO entry; the prop's hit points as Pen's sentry has them (fxSentryDmg through finxSwingHit and finxShotHit); fx1CorkSpot as the template for the place-it check; fxClear for the 150 px of clear air; FINX_LEFT so the ignition hits only the target. NEW: nothing, but the straight-up carry with a ceiling check is the one thing to build carefully (there is no ready-made vertical band test, so fxClear on a vertical line does it).

**CPU read.** Press it when a foe is on the ground 60 to 130 px ahead on her floor, or is stunned or rooted near there (a willing foe will walk off a visible fuse, so it will not hit every time).

**Risks.** Stuck state: the carried foe must be released on a KO, a jail, a Final Smash catch, and if the rocket is toppled after ignition; the carry ends by time and by any solid above. Infinite: none. Camping: one rocket at a time, and the cooldown starts when it is gone. Online: base position, phase and hit points in the FINX row. It looks like Bomb's Tick-Tock Timer Bomb (a countdown prop that blasts) and like her own Rocket to Mars (a rocket); the difference is that this one carries a foe up instead of a ring blast, and it is the only pitch that uses the rocket, on purpose.

**Ratings.** Fun 3, readable 5, cheap to build 3.

---

## Pitch 4: Stay in a Shell (a stance that grows what she soaks up, then opens)

**Canon basis.** Canon: her 2018 bio says she keeps her feelings packed tightly inside but is not afraid to open up when needed; in Mine Your Own Business she says she wishes she could stay in a shell; in Hatching the Plan she closes herself when her anxieties start; in Alternate Reality Show she hides behind Baseball when a fire bursts. Game text: the armour, the damage tally, the burst. Not confirmed: she never bursts open at anyone except through the Cobs bomb, which is her smash already.

**In the body.**
- The tell (12 frames): she hops and her lid slams shut, straps cinched.
- The shell (42 frames): a shut, shuddering case. Every hit she soaks makes it shudder harder and the straps strain (drawn from the damage she has taken). From frame 30 the lid starts to rattle up a crack, which is the warning that it is about to go.
- The burst: the lid bangs open and tools, bolts and scrap fly out in a ring, drawn solid only on its live frames. Nothing grows in: the burst is the move's hit, and the shell is the warning.

**Numbers.**
- Armour for the shell: damage x0.6 and launch x0.4 (the engine's armour, kept up with braceUp). She cannot move or act.
- Burst: a circle of radius 88 px around her middle, live 6 frames, one hit per foe, damage 8% plus the percent she took during the shell (the difference in her damage from the press to the burst), at most 18% in all, launch away from her 8 px a frame sideways and 10 up. She opens early if she has taken 10% in the shell. A boss in the ring takes a plain hit of the same size once.
- Hits: 1. No status on foes, no prop. After the burst she is open for 10 frames.

**Counterplay and miss cost.** Stay outside 88 px for the shell's 42 frames, or shoot her: ranged hits chip her through the armour. Attacking her up close feeds the burst: a 10% hit she soaks as 6% makes the burst 14%. If nobody is near, it is 8% to nothing and she has spent about 64 frames (12 + 42 + 10) shut and stuck, with a single big hit still able to KO her at high percent.

**Engine pieces.** finxAdd row (up, shell, burst, open); fxLock and the armour set each frame as the shell runs (f.armor held at 2 or more, braceUp, as Grassy's stance does); fxCircle, fxTargets, fxHit; fxBossCircle for a boss. The shell must end by time, not by armour: a grab or a strip takes her armour off, and she should still burst (8%) rather than get stuck. NEW: nothing; the one extra is reading her percent at the press and at the burst.

**CPU read.** Press it when a foe is on the ground within 44 px of her body and within 40 px of her height (Snowball's quake read).

**Risks.** Stuck state: covered above (ends by time). Infinite: none. Camping: she stands still for 0.7 s, which is a risk for her, not for them. Online: percent at the press and the phase in the FINX row. This is a stance first, so under your v2 rule it only passes because the hit on foes is the point and the stance is how it is charged (like Spikey's bristle, which is a stance with an answer); if you read that rule strictly, this is the pitch to drop. It overlaps Spikey's counter and Spongy's soak-and-wring, though here nothing is blocked and the burst always happens. The 18% top end is above the 14% swing it replaces, so it should stay hard to land.

**Ratings.** Fun 3, readable 4, cheap to build 4.

---

## Side by side

| # | Name | Shape | Reach | Hits and total | Staying power | Miss cost | New engine piece | Fun / Read / Cheap |
|---|---|---|---|---|---|---|---|---|
| 1 | Safety Net | close catch, anti-air | 68 px wide, 70 px above her | 2 hits, 13% | the lid open 24 frames | open and hittable 52 frames | none | 3 / 4 / 3 |
| 2 | Off to the Races | ranged, a speeding wall | about 375 px | 1 hit, 12% | the line, 69 frames | committed 24 frames | none | 4 / 5 / 4 |
| 3 | Lift-Off Pad | placed prop, delayed carry | 90 px ahead, plume radius 40 px | 2 hits, 12% | the rocket, about 90 frames | cooldown waits for the rocket | none (careful with the vertical carry) | 3 / 5 / 3 |
| 4 | Stay in a Shell | self-buff with a payoff | ring radius 88 px | 1 hit, 8% to 18% | the shell, 42 frames | stuck about 64 frames | none | 3 / 4 / 4 |

All four stay inside 8 to 18% on a landed finisher, none needs a random roll, none moves a foe into a wall or off the world by itself (the holds are straight up with a ceiling check, or the foe stays where the hit leaves them), and bosses take a plain hit once.

## My pick: Off to the Races

- Her kit has no long-reach move: Full of Voices is medium, the rest are short or a floor mine. This is the only pitch with real reach, about 375 px, so it fills the gap instead of repeating a short move.
- It is the easiest to read (a red striped wall you can see grow and move) and the cheapest to build (the Leafy whirl's step with one speed line added), and it has no new engine piece and the least that can go wrong.
- The speed-up gives a real decision each time: run clear early or jump, instead of one fixed dodge. The canon hook, her cheering everyone to the red-line race, is the most specific of the four, with the one honest caveat that she only explains the line in canon.
- If you want the pitch that is most her rather than most fun, take Safety Net: catching someone who falls from above is the clearest thing she does for anyone on screen.

## Ideas I looked at and dropped

- Kick the Door In (a lunging kick that breaks stances): canon is solid (she kicks open Cobs's door), but it is just another lunge (Lollipop, Remote, Toothpaste).
- Popcorn spray: the same scene as her bomb smash.
- A volley of tools: the same source as her wrench special.
- Kick the Bucket (a kicked bucket): a lob like Fries' carton and Gelatin's glob, and her page says she is afraid of water.
- A leg-cuff or snare trap: a trap that stuns on a step is her wrench again.
- A pile of scrap in the way: Blueberry's boulder.

## Question box lines

1. Safety Net: she flips her lid open like a net. A foe who jumps or falls onto her is caught, sprung up and flung for 13%. Miss and she is left open.
2. Off to the Races: a red-striped wall rises ahead and speeds along the floor, about 330 px, 12% and a launch. Run clear early, or jump it.
3. Lift-Off Pad: she hauls out a small rocket that blinks three times, then lights. A foe at its base is flown up and flung for 12%. Step away or knock it over.
4. Stay in a Shell: she snaps shut and shrugs off hits for under a second, then bursts open in a ring: 8% plus what she soaked up, at most 18%.
