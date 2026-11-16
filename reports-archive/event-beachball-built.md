# Beach Ball (they/them), event fighter 10: what was built

Branch `g-ev-beachball` (worktree `.worktrees/ev-beachball`), on g-contests `958654b1`. Not pushed, not merged, no relay. Scripts and outputs: `reports/event-beachball-scripts/`.

## What you have
- **Playable event fighter**, hidden and locked until won (checked: in ROSTER as an event row, `eventLocked` true, in no pick list or training roster, never named by the Daily over 500 days, the title count leaves them out). Their lap week is the 10th of the lap.
- **Kit** per the design card: Big Bounce, Way Too High, Inflation Pump, Best Picture Sandquake, Blow Through the Noodle, Way Too Big, the eight tilts and aerials, grab and four throws. Size is real (Normal, Pumped, Fully Pumped, Popped), body and hurtbox both.
- **Art:** no download. The BFDIE render already in the game (credited), and everything else drawn in code. Nothing new in CREDITS except a note.
- **Three event matches:** The Fighting Contest (duel), Cheaters' Alliance (you plus Beach Ball against Rose and David), Elsewhere on Earth (your own keep-up spec: a contest).
- Their ASSIST trophy is untouched.

## Checks (honest)
| Check | Result |
|---|---|
| syncheck | failed 0 |
| bootcheck | clean |
| No-op hash vs 958654b1 (ordinary ffa, teams, items-lots, 27 event matches of the other nine) | 30 of 30 identical |
| Look-alike script (shape + effect + numbers, 115 other fighters) | none, after one change: the first draft matched 20 moves, so I changed the kb and stun numbers I had chosen (the design gives only damage); damage numbers are the design's |
| Win share, CPU 1v1 Expert vs Pen, Firey, Bomby, Match, 32 matches | dmg 1.0: 78%. dmg 0.9: 69%. dmg 0.8: 72% (same seeds). dmg 0.7: 66% (fresh seeds). Final code: **62.5%** (20 of 32, fresh seeds). Inside the band but at the top; noise is about +-8 points. Bomby beats them (1 to 3 of 8). |
| Moves come out, 0 errors | all moves fired from real keys (`moves2.txt`); CPU used every ground and air move, the pump and the smash; 0 errors in every run |
| Final Smash dodge (keys only; falls and stock loss count as failure) | a plain jump pressed anywhere in frames 4-30 of the catch window escapes (37 of 40 trials; the three failures are a jump at frame 40, too late). The old 180-trial grid: 54 escapes, 42 starting in front. |
| Event matches to a finish (CPU) | duel 105 s; ally match 279-392 s (3 of 3); keep-up 70-134 s (3 of 3 after the fixes) |
| Scripted human in keep-up | won 3 of 3 (72-97 s, no stock lost: the script is a good player) |
| Stuck CPUs | none in the duel and ally match; one CPU stood still 5 s once in 3 keep-up runs, waiting for the ball |

## Where I changed the design or the brief (please look)
1. **Final Smash damage** is 10/10/10/20 (100% in play), not the design's 6/6/6/12 (60%), to follow your standing "about 100%" rule for Final Smashes. Easy to put back.
2. **Damage stat 0.7** (design 1). A nerf, because the first measurement was 78% (allowed since 2026-10-26). The design's "if they land low" never applied.
3. **Cheaters' Alliance is an ally match** (kind `team`, pays as a normal match), as the brief said. The other nine have a 3 vs 1 in this slot by your 2026-10-28 rule. Say if you want a 3 vs 1 here too.
4. **Elsewhere on Earth is your keep-up spec** (relayed by the lead), with the design's cast and place (Sky Towers, sponge floor, David and Pin). The ball is never dropped from the sky: it grows in near the fighters after each landing, hangs there until touched, gets heavier as the match goes on, and nothing is named on screen except the 5 s goal line. 3 stocks, no items, no Smash Balls. I kept the design's match name. The ball counts a touch by body as well as a swing (a swing knocks it harder).
5. **Not built:** the size table's jump and bounce factors; Pin's Point Pierce +20% on inflatables (question 85: it changes another fighter's move); the assist leaving the bag at their week (you said keep the assist exactly as it is).
6. Way Too High rises 266 px from a standstill (the other event fighters 130-180, Pen's rocket 286): the strongest straight-up recovery, as the design says.

## Not verified
- Nothing was seen in a browser (no screenshots). The look of the squash, noodle, ball of air, giant and the keep-up ball is code only.
- The online pair and a guest's view were not run (the host runs everything; flags and size ride the snapshot as for the others).
- Best Picture Sandquake can land on a platform above the foe instead of on them (the shared leap smash's behaviour; on Goiky Field's centre platform it whiffed at three of four distances in my test, and hit on the open floor).
- Win share was not tuned further after the last small changes (Sandquake rise 13.5); the final 62.5% run was before that one number.
- Guest prediction of the size's speed change goes through `ctfSpeedK` and `f._inf` (carried), but it was not exercised.

## Update 2026-11-13: your four answers
1. **Final Smash rows** stay 10/10/10/20.
2. **Cheaters' Alliance is now a 3 vs 1** (you alone against Beach Ball, Rose and David; Grand Plains; 3 stocks for you, 2 each; usual items; no Smash Balls), built like the other nine's. CPU runs: finished in 256 s and 308 s, 0 errors.
3. **Pin:** the only change is that Point Pierce's inflatable list now includes Beach Ball (list: Balloony, Bubble, Puffball, Basketball, Beach Ball). One Point Pierce (Pin's damage stat 1.04): Beach Ball before 11.44%, after 32.24%. The four others were 32.24% before and after; non-inflatable fighters (Pen, Tree) 11.44% before and after.
4. **Sandquake fixed.** The shared leap smash got a flag only Beach Ball sets: from the apex it falls through thin platforms over its foe until level with them. Test under Goiky Field's centre platform with Pen 40, 90, 150 px ahead, and 220 px (open floor): before, 0% at 40/90/150 and 22.4% at 220; after, 22.4% at all four, landing on the floor.

Re-checks: syncheck failed 0, bootcheck clean; no-op hash vs 958654b1 30 of 30 identical (Pin appears in Clock's The Losers!, which does not contain Beach Ball, so it cannot change); win share after the fix, fresh seeds: 19 of 32 (59.4%).

## Update 2026-11-13 (3): Elsewhere on Earth is now beach volleyball
Your words: "no one hits it, because there should be teams of 2 ... like volleyball"; a net, a point for the other team when it lands, hits cross the net, the stage is a beach. Built as `CONTEST_RULES.keepup` (same match name), replacing the last-toucher stock rule.

- **Teams:** you + Beach Ball (CPU partner) against David + Pin. I kept David and Pin from the design; Beach Ball is your partner.
- **Court:** its own beach world for this match only (sand, sea, sun, clouds, palms, an umbrella, the net), a solid net wall in the middle nobody can cross, walls at both ends. Sky Towers and every other stage are untouched.
- **Ball:** the giant beach ball. A swing sends it up and the way you aim (up = higher, down = flat spike); a body touch bumps it. A ring, a squash, a shake and a sound mark a hit; a dotted mark on the sand shows where it will land, coloured by the side it is over.
- **Points:** the ball touching the sand on a side is a point for the other team. The scoring side serves (the ball grows in over their half and hangs until touched; left alone it falls, and that is a point for the other side). The net bounces the ball below its top.
- **Fighting:** hits cross the net as always. KOs cost nothing and put you back on your half (stocks are 99 and never decide anything).
- **Heavy ball:** kept; gravity grows with the match clock.
- **HUD:** the score and the clock; goal line "Keep the ball off your sand" for 5 s; no phase names.

**Numbers (constants table `BV` in the code):** first to **6 points**, or the most at **2:30** (a tie plays on to the next point); heavy ball: gravity x(1 + t/2000); ball radius 56; court 1500 wide, net 200 tall; serve pause 70 frames; an untouched serve falls after 6 s. N and the heavy rate came from measuring (below), not from the first guess.

**CPU proof (10 runs, 2 seed sets):** all 10 finished, 116-136 s (mean 126 s); 0 errors. **Touches per rally: mean 17.2** (13.9 to 23.6 a match; every rally had at least one touch; the first rally of a match is longest, 54-120 touches). About 140 swing hits to 20 bumps a match; each fighter touched the ball 25-62 times. A scripted human team (you by keys + the CPU Beach Ball) won 1 of 3 (6-1; lost 3-6 and 5-6).

**Honest notes:**
- My first version had two bugs the runs found: the right team never scored (a bad clamp) and fighters fell through the floor in the Teams arena (its floor is a block, not the main floor line).
- With the first heavy rate (5400) rallies never ended (140 touches, no point), so I raised the heaviness to the rate above. The CPUs are good at this; humans will be worse.
- A fighter idling at home while their partner receives counts as "still 5 s" in my stuck check (0-4 a match). They are waiting, not stuck.
- Not seen in a browser. The court art and hit feel are code only. The online pair was not run (the contest is offline like the others).
- Re-checks: syncheck failed 0, bootcheck clean, no-op hash vs 958654b1 30 of 30 identical.

## Update 2026-11-13 (4): the spike has value
Your pick: a spike is FAST and HARD TO RETURN (not: 2 points, knocking back receivers, spiking only from high up). Volleyball contest only; no move of any fighter changed.

- **How:** a hit with DOWN held is a spike. The ball goes toward the net at 14 px a frame and down at up to 10 (a normal hit is 7.5 across and 12.5 up): 17.2 total against 14.6, 1.9 times the sideways speed, and it comes down instead of up, so it reaches the sand in roughly half the time. It takes the steepest line that still clears the net; from low or far back it becomes a lob, never into the net.
- **Look and sound:** a fire-coloured streak behind the ball and a fire ring at the moment of the hit, a bigger shake, a low thump with a rising saw and a noise burst.
- **Returning it:** any hit that reaches it in time; it is hard because the ball is fast and low, so only a defender already close to where it lands gets there.
- **CPUs spike** when they are in the air near the net with a high ball (2 times in 3).
- **N is now 7 points** (it was 6): spikes shortened the CPU matches to 80-100 s. The time limit is still 2:30.

**Numbers, 10 CPU runs (2 seed sets):** all finished, 95-128 s (mean 110 s), 0 errors. **104 spikes (about 10 a match): 47 scored (45%), 57 returned (55%).** Touches per rally mean 13.1 (11.5 and 14.6 for the two sets): spikes do not end every rally; the one- and two-touch rallies are serves and quick spikes, and the long ones are still there.

Re-checks: syncheck failed 0, bootcheck clean, no-op hash vs 958654b1 30 of 30 identical. Not seen in a browser.

## Update 2026-11-13 (5): Bow's neutral special broke the volleyball
**Reproduced and fixed.** Bow's Teleport lands where her body fits 240 px along the aim and passes through solids on the way (her own rule). From the left half near the net, aimed right, she ended on the other team's half (719 -> 959) and stayed there; a Bow CPU did it on its own (442 bad frames in 6 runs), and so did a Bow with keys (14 in 64 trials). The net is solid for walking, not for a warp. Nothing in the contest kept anyone on their own half.

**Fix, in the contest only:** every fighter is brought back inside their own half and out of the sand, each frame (before the contest's step, after everyone has moved, and before drawing), so a warp is put right on the frame it lands. Bow's move is unchanged; she warps as ever and the court puts her at the net.

**Tested:**
- Bow on each team as a CPU (3 seeds each): all 6 matches finished (91-112 s), 0 bad frames, 0 errors. Before: 442 bad frames.
- Bow as the human, 4 spots x 8 aims x ground/air = 64 trials: 0 bad frames. Before: 14.
- **Every other playable fighter's neutral special** (111 fighters), 3 places (ground by the net, air by the net, ground by the wall) x 6 aims, then 600 frames to see the ball and the score go on: 1998 trials. Before the fix only Bow was flagged; after, none, 0 errors, no stuck match. This includes every teleport, warp and long-dash neutral special, and Dough's copy of them.
- Looked for: crossing the net or the end walls, ending in the sand, NaN or far-off positions, the ball lost or off court, a point never scored, a match that ends without a winner or never ends, errors.
- Not tested: Final Smashes and finishers that move a fighter (beyond the same clamp); online.

syncheck failed 0, bootcheck clean, no-op hash vs 958654b1 30 of 30 identical.
