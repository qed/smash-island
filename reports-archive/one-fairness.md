# One: which attacks are fair?

You said some of One's attacks are "too hard to justify in a world with this level of movetech". So every One attack was tested against everything Lightning can do: run, jump, short hop, double jump, fast fall, drop through a platform, and his up-special (a 170 px jump with 10 frames where nothing can hurt him). There is no shield or air dodge, and her arena has no walls.

How to read this:
- **T1-T3** are her tiers. They go up as her HP goes down.
- **f** means frames. 60 f is 1 second. A human needs about 15-20 f to react.
- **fair** = you can see it coming and dodge it. **tight** = only one answer, or a very short window. **unfair** = no move works, or you can't react in time.

One thing explains a lot of this: she sits **level with you**, about 300-400 px away. So when an attack spreads out in a circle or a wedge from her, walking left or right doesn't change which part of it hits you. Only jumping does.

## The list (worst first)

| # | Attack | Tier | Mark | Why |
|---|---|---|---|---|
| 1 | HANDS FROM THE GROUND! | T3 | **unfair** | Only 20 f, and the hands cover about 800 px wide and 206 px up: nothing works, not even the up-special. |
| 2 | HANDS FROM THE GROUND! | T2 | **unfair** | 22 f to get out of about 620 px of hands; an up-special on exactly frame 21-22 beats wave 1, but nothing beats waves 2-3. |
| 3 | HANDS FROM THE GROUND! | T1 | **unfair** | 24 f to get out of 400 px of hands taller than a jump; only an up-special on exactly frame 24 works. |
| 4 | EYE LASERS! | T3 | **unfair** | After her eyes lock you get about 9 f to move before fanned, aimed-ahead beams arrive; nothing got past the bursts. |
| 5 | EYE LASERS! | T2 | **unfair** | The second burst hits where your dodge took you, and the wide sweep catches the rest; nothing escaped. |
| 6 | SCREECHY! | T3 | **unfair** | Only a jump changes where the ring hits you, and with 3 narrow random gaps almost no ring has a gap in jump reach. |
| 7 | OUT OF ORBIT! | T3 | **unfair** | The planet fans close the gaps between lanes, and the third kick re-aims at wherever you dodged to. |
| 8 | SCREECHY! | T2 | **unfair** | Same problem: only about 1 attack in 5 has a gap a jump can reach. |
| 9 | KNIFE FLURRY! | T3 | **unfair** | The knives turn faster than any jump or run can beat; only a perfectly timed up-special got out. |
| 10 | OUT OF ORBIT! | T2 | tight | The only answer is a double jump over her within about 18 f of the wind-up; no escape from a ledge or the air. |
| 11 | OUT OF ORBIT! | T1 | tight | Same single answer; the planet reaches you 15 f after it appears, too fast to jump on sight. |
| 12 | EYE LASERS! | T1 | tight | Only double jumps toward her work (11 of 343 tries at 18 f reaction); the sweep catches the rest. |
| 13 | MOON ROCKS! | T3 | tight | Only a nonstop run on open floor works; from a ledge or a platform you need the up-special. |
| 14 | MIND READ! | T3 | tight | She swoops inside the drain's reach, so you must back off within about 24 f; from a ledge you can't. |
| 15 | SHOCK RING! | T3 | tight | Six crossing bursts leave thin, moving lanes: one route per spot, none from a ledge. |
| 16 | KNIFE FLURRY! | T2 | tight | Needs one long move list (run, run, run, double jump) held until the last knife. |
| 17 | ZAP TO DUST! | T3 | tight | 27 f warnings leave about 9 f of moving after you react, and the ash slows you for the next wave. |
| 18 | ONE GROWS GIANT! (stomps) | T1-T3 | tight | Fair on a platform or far away, but a landing right next to you gives only 8-14 f. |
| 19 | FOLDING ISLAND! | T1-T3 | fair | The jaws show long before they shut, and running out sideways always works. |
| 20 | ZAP TO DUST! | T1 | fair | 75 f to leave a narrow band, then 33 f for the next one; keep moving. |
| 21 | ZAP TO DUST! | T2 | fair | Like T1 with less time; only ledge starts failed. |
| 22 | SCREECHY! | T1 | fair | Four wide gaps; on mid floor one was always in reach. |
| 23 | MIND READ! | T1 | fair | Slow orbs, and the drain misses at her normal range. |
| 24 | MIND READ! | T2 | fair | A plain jump clears it from anywhere. |
| 25 | KNIFE FLURRY! | T1 | fair | Weak homing; one timed jump over the stream works. |
| 26 | SHOCK RING! | T1 | fair | Wide spacing, straight shots. |
| 27 | SHOCK RING! | T2 | fair | The crossing arms are easy to read, with lots of room. |
| 28 | MOON ROCKS! | T1 | fair | A steady run beats them on open floor. |
| 29 | MOON ROCKS! | T2 | fair | Same answer as T1. |
| 30 | GHOST FIGHTER! | T1-T3 | fair | A thin ring of wisps, then an ordinary fighter, and she doesn't attack while it stands. |
| 31 | POWER UNGROUNDED! | T1-T3 | fair | Nothing to dodge: it's a shield, not an attack. |
| 32 | Vortex hop | all | fair | Nothing to dodge. |

## One fix for each tight or unfair attack (worst first)

Every fix keeps the attack scary and keeps the cue on her (her body, her eyes, her aura) or in the world (cracks, the ring itself, the stomp mark). There are no warning lines. Line numbers are in `artifacts/V1/index.html`. All ten are now in (branch g-boss-one) and were re-tested; see **After the fixes** at the end. Line numbers below are from before the fixes.

**1. HANDS FROM THE GROUND! T1-T3 (unfair): leave one side open, and give time to get there.**
Right now the hands come out 24/22/20 f after the crouch. They cover ±200 to ±400 px and stand 206 px tall, so you can't run far enough or jump high enough in time.
- Make the hands come up **only on her side of you**: keep the middle hand and the ones toward her, and skip the ones on the far side. Decide the side when the cracks open, store it on the spot, and use it for both the cracks and the hands, so the missing cracks show you the open side:
  - wave 1's spots: line 37728
  - waves 2-3's spots: line 38190
  - the hands: the `for(const o of T.offs)` loop in `oneHandWave`, line 37365
  - the cracks: `oneDrawCracks`, line 38405
- In `ONE_SPECIAL_TIERS.hands` (lines 36931-36933): `tel` 24/22/20 → **36/34/32**, and `crack` 24 → **32** on all three rows.

Then you only have to get about 70 px out, past the middle hand, on the open side. After an 18 f reaction you get 18/16/14 f of running (115/102/90 px), and 14 f (90 px) for waves 2-3. The hands stay just as big, fast and tall, and her side is still a wall up to 330 px wide.

**2. EYE LASERS! T3 and T2 (unfair), T1 (tight): longer eye tells.**
At T3 her eyes lock 16 f before the beams leave, so you get about 9 f to move after reacting. At every tier, the head turn before the sweep (42/38/34 f) is too short to get past her. Getting past her is the only way out of a wedge aimed at you while she's level with you.
- In `ONE_SPECIAL_TIERS.eyelasers` (lines 36919-36921): `lock` 24/20/16 → **24/24/24**, and `sweep.tel` 42/38/34 → **54/54/54**.

Then at T3 it's about 37 f from the eye flare to the hit (T1 now has 38 f). After she turns her head you get about 60 f of moving after reacting, which is enough to run or double jump through her to the clear side. The fans, the extra volleys, the aim-ahead-and-cross and the wider sweeps all stay.

**3. SCREECHY! T3 and T2 (unfair): one gap per ring opens a jump above you.**
Right now all the gaps are random, and most rings have none a jump can reach.
- In `oneScreechRing` (line 37322), when `T.split` is on (T2 and up), aim the first gap and keep the others random:
  `const t = oneNearestFoe(s.x, s.y);`
  `if(t && T.split){ const aim = Math.atan2(hurtCY(t) - s.y, t.x - s.x), up = Math.cos(aim) >= 0 ? -1 : 1; centers.push(aim + up*(T.half + 0.06)); }`
  then fill the rest with random gaps until there are `T.gaps`.

Standing still still gets you hit. A jump timed to each ring (rising about 55-60 px) puts you in the gap, ring after ring, so it becomes a rhythm. The rings, their speed, the shatter and the other gaps stay. T1 doesn't change.

**4. OUT OF ORBIT! T3 (unfair), T2 and T1 (tight): one fix per tier.**
- **T3:** in `ONE_SPECIAL_TIERS.orbitkick` (line 36948), `kicks:3` → **`kicks:2`**. The best tries got through kicks 1 and 2 and only the third, re-aimed kick caught them. The 4 lanes, the 4 planets per lane, the squeeze and the knockdown stay.
- **T2:** in `oneKickPass` (line 37384), the fan angle `0.22` → **`0.14`**. The planet fanned up from your lane then rises about 27 px instead of 43 px (at 300 px). That leaves a gap above your lane that a jump can sit in for about 20 f. This also helps T3.
- **T1:** make her aura knots flare **30 f** before each kick instead of 15 f:
  - line 38332: `s._tel < 15` → `s._tel < 30`
  - line 38377: give the later kicks' knots full brightness for their last 30 f

  Right now the first sign you can react to is the planet, and it reaches you in about 15 f. With the flare, a jump on the flare clears the one planet in your lane.

**5. KNIFE FLURRY! T3 (unfair), T2 (tight): gentler homing.**
- In `ONE_DECK_TIERS.knives` (lines 37038-37039): `home` 0.02 → **0.015** (T2), and 0.0275 → **0.017** (T3).

Then the knives turn about as tightly as T1's (a turning circle of about 950 px, against 985 px at T1). They still fly faster than T1's, so it's still harder, but T1's answer (jump and run over the stream) works. The six knives, their speed, the hang and the homing time stay.

**6. MOON ROCKS! T3 (tight): aim less far ahead.**
- In `ONE_SPECIAL_TIERS.moonrocks` (line 36905), T3 `lead:16` → **`lead:9`**.

T3 rocks fly so fast that a 16 f lead lands almost exactly on a steady runner. With 9 f the rocks still lead your run, but a steady run stays about 55 px ahead, the same room T2 gives. The 10 rocks, speed 17 and the knockdown stay.

**7. MIND READ! T3 (tight): the drain reaches a bit less far.**
- Lines 37100 (`oneDrainR`) and 38110 both say `onePhase(s) >= 3 ? 340 : 260`. Change **340 → 280** in both.

At T3 it then reaches 256 px from her middle. That's still more than T1-T2's 236 px, but short of where she swoops to (300 px), so standing your ground or stepping back is safe and walking in gets you drained. The golden motes show the new reach by themselves.

**8. SHOCK RING! T3 (tight): shorter curl.**
- In `ONE_DECK_TIERS.ring` (line 37042), T3 `spinT:40` → **`spinT:24`**.

The bursts still curl just as hard at the start, but stop after 24 f. That's the same total turn as T2, so the lanes straighten out sooner. The 6 bursts of 16 stay.

**9. ZAP TO DUST! T3 (tight): T1's warning time.**
- In `ONE_DECK_TIERS.zap` (line 37027), T3 `warn:27` → **`warn:33`**.

That gives about 15 f of moving after you react, instead of 9 f. The 4 waves, the 42 f between them and the ash stay.

**10. ONE GROWS GIANT! stomps (tight): the waves wait longer at her feet.**
- In `ONE_STOMP` (line 37428), `delay:8` → **`delay:18`**.

The ring and bright line at her feet already show where she landed. Now even a landing right next to you gives about 24 f (the worst case measured was 14 f). The waves, their speed, the damage and "stomps twice" stay.

## Also worth knowing

- **Eye Lasers is the only attack that can hit you more than once.** Its first burst, its later bursts and its sweep count as three separate hits, which is up to about 89% at T1 and 114% plus burn at T3. Every other attack hits once at most. Leaving it like that or not is your call; the fix above is only about dodging.
- **Ledges are the weak spot.** Starting next to a ledge, nothing escaped Zap T2-T3, Knife Flurry T1-T3, Shock Ring T3, Moon Rocks T1-T3, Mind Read T3 or Out of Orbit T1-T3. That's what being cornered means, so no fixes are proposed for it.
- **How it was tested:** the real game file was run without a browser. She was made to use one attack at one tier, about 400 px away, against Lightning, starting on mid floor, next to a ledge, on a platform and in the air. Reactions of 8, 12, 18, 24 and 30 f were tried after each cue, along with every move and up to 648 move combinations. A dodge only counted if Lightning got through the whole attack without being hit. Only Lightning was tested.

## After the fixes (re-tested 2026-10-27)

A second check ran the same tests on the fixed game. Every attack the study called unfair now has a way out. Two fixes needed a follow-up, and both are in:

- **HANDS FROM THE GROUND! T2-T3:** the wind-up was 34/32 f, which left only 1-3 f of slack after an 18 f reaction. It is now **36 f at every tier**, like T1. Running to the open side now works up to a 22 f reaction at T2 and T3. Standing still is still hit (frame 36).
- **EYE LASERS!:** the longer head turn alone did not help, because she flies faster than you run and backed away from anyone running at her. Now **she holds still while her head is turned** before the sweep. That's a change to how she moves only; nothing new is drawn. Move lists that get through the whole attack: T2 went from 2-5 of 540 to 75-90 of 540, and T3 from 0-2 of 960 to 16 of 960 (both sweep directions). Standing still is still hit at every tier (frames 64/61/59). This is the one change that makes her behave differently, so say if you don't want it.

A correction: the study called **KNIFE FLURRY! T3** unfair, but a wider search on the old game found a few answers (7 of 625 move lists at T3). The fix still helps: T3 now works at reactions from 8 to 30 f, where before it worked only at 8 and 30.

Left as they are (small, and your call):
- **OUT OF ORBIT! T3:** a plain jump on the aura flare doesn't work at any tier (it rises into the copy lane above). At T1-T2 a jump toward her on the flare works; at T3 the only answer is the old one (double jump toward her early, then run toward her).
- **ONE GROWS GIANT! stomps:** if you are standing under the outer part of her body when she lands, the wave starts right on you and needs about a 15 f reaction. Her own landings were dodgeable at every tier.
- **HANDS FROM THE GROUND! next to a ledge, with her on the stage side:** the open side is the drop, so nothing works there. That counts as cornered, like the other ledge cases.
