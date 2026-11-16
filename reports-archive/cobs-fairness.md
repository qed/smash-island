# Steve Cobs: which attacks are fair?

You said some of One's attacks are "too hard to justify" with this much movetech, then "same for cobs". So I checked every Cobs attack against what a player can do: jump, double jump, short hop, fast fall, run, drop through, wall jump.

How to read this:
- **T1-T5** are his tiers. He gets harder as his HP goes down. **Rage** is the 18 seconds after his 60% speech.
- **f** means frames. 60 f is 1 second. A human needs about 15-20 f to react.
- **fair** = you can see it coming and dodge it. **tight** = only one answer, or a very short window. **unfair** = no move works, or you can't react in time.

## The list (worst first)

| # | Attack | When | Mark | Why |
|---|---|---|---|---|
| 1 | DELETION! | T4-T5, rage | **unfair** | Two X's lunge twice each, so you need four back-turns timed off the siren with only about 8 f of X moving to see; about 1 try in 6 survives, and a miss costs about 90%. |
| 2 | THE FUTURE IS SO YESTERDAY! | T3-T4 | **unfair** | From the floor nothing works: the stressed rings and CARE! come so close together that you would have to be in the air and on the ground at once. |
| 3 | DEPLOYING UNITS! | rage | **unfair** | In rage the units pop in right next to you, and the first shot is in the air for only 7-8 f. |
| 4 | DELETION! | T1-T3 | tight | You have to turn your back by counting from the siren (a 19-21 f window), and a miss costs 57-74%. |
| 5 | MEEPLE PORTAL! | T3-T5, rage | tight | Only a double jump out works, and in rage you must start it within 16 f. |
| 6 | SPRINGTASTIC! | T3-T5, rage | tight | Only going toward him works, and at T5 the jump window is 13 f. |
| 7 | DEPLOYING UNITS! | T3-T5, no rage | tight | After a unit teleports, its shot can reach you in 14 f, right at the edge of reaction time. |
| 8 | THE FUTURE IS SO YESTERDAY! | T5, rage | tight | It needs one exact line (jump, fast fall, hop), but you can see each step coming. |
| 9 | TOXIC CANNON! | T1-T5 | fair | Each wall shows its gap early, with about a 21-f jump window. It only gets tight if one of his quick moves lands while the ship is up. |
| 10 | THE FIST THINGY! | T1-T5 | fair | From T3 only a double jump works, but it works at any point in his wind-up. |
| 11 | SUPER DEATH TRAP! | T1-T5 | fair | The floor is always safe, and dropping to it always works. |
| 12 | THE MEEPLE VAN! | T1-T5 | fair | You see it from across the floor, and standing on any platform dodges it. |
| 13 | MY OWN HANDS! | T1-T5 | fair | Both rows light up at the start, and jumping away always works. |
| 14 | MeKNIFE! | T1-T5 | fair | It flies at one fixed spot with no homing, and the yank line shows first. |
| 15 | MeMURDER! | T1-T5 | fair | The marks stop chasing you at a phone flash you can see. |
| 16 | BOOMERANGS! | T1-T5 | fair | The aim locks and the arcs never re-aim; run or jump away. |
| 17 | LOCKDOWN! | T1-T5 | fair | It homes, but slowly: jump over it from 140-220 px away, mash free, or break it. |
| 18 | FREE SAMPLES! | T1-T5 | fair | Shadows show where the boxes land, and the crumbs roll in straight lines. |
| 19 | PULL THE PLUG! | T1-T5 | fair | The pane spot is shown, and after that only falls hurt. |
| 20 | TICK, TOCK! | T1-T5 | fair | The first throw never hit, and the dial shows the volley 6-10 s early (the volley itself was not tested). |
| 21 | KERNEL POP! | T1-T5 | fair | His dive doesn't hit by itself; just stay off the puddles. |
| 22 | CHAINSAWS! | T1-T5 | fair | Nothing hit in any test. |
| 23 | MEEPLE PORTAL! | T1-T2 | fair | Running, jumping or double jumping all work. |
| 24 | SPRINGTASTIC! | T1-T2 | fair | Plain jumps work over a wide window. |
| 25 | DEPLOYING UNITS! | T1-T2 | fair | One slow unit; keep moving. |
| 26 | THE FUTURE IS SO YESTERDAY! | T1-T2 | fair | Jump the low rings 8-14 f early and stay down for the high ones. |

About the homing, laser, knife and kick attacks you asked about: MeKNIFE! is fair (no homing). LOCKDOWN! homes but is fair (slow, can be jumped over or broken). KERNEL POP!'s dive doesn't hit you. The one real homing problem is DELETION!'s turn-back, where X turns toward where you went and lunges again.

## One fix for each tight or unfair attack

Each fix keeps the attack scary and keeps every cue on him or his own stuff, with no warning lines. Line numbers are in `artifacts/V1/index.html`. None of these were tried in a match yet.

**1. DELETION! T4-T5 (unfair): take away the turn-back.**
In the T4 and T5 rows of `COBS_TIERS.deletion` (line 40022), change `again:1` to `again:0`.
Then the X in front lunges, and the X behind you lunges 24 f later. That's "turn, and turn back": two lunges, not four, and the second X is in a fixed spot you can see. The damage (82-91%), the special lock and the trails all stay. The first turn is still counted from the siren, like T1-T3, so fix 4 can go on these rows too.

**2. THE FUTURE IS SO YESTERDAY! T3-T4 (unfair): start the stressed finale at T5.**
Change `fin3:1` to `fin3:0` in the T3 row (line 40064, its last entry) and the T4 row (line 40065, its first entry).
T3-T4 then end like T2: their rings, then CARE! 30 f after the last ring. By the code, the last low ring at T3 gets about a 16-f jump window, and at T4 about 11 f if you fast fall. You still hop for CARE!. This also fixes the odd part where T5 was easier than T3-T4.

**3. DEPLOYING UNITS! in rage (unfair): put the units back at a distance.**
In `cobsSpawnUnit` (lines 41026-41030), while he is raging, place each new unit the way `cobsUnitBlink` does (line 41948): on its own side, 7-35 degrees up, 340-480 px from you. Also set its `_post` there, so it hovers there (line 41895) and doesn't follow him.
Right now `cobsAddFrom` (line 41022) returns his own position in rage, and he is on foot near you, so the units appear beside you. With this fix the first shot still comes 40 f after the puff, but it flies about 19 f or more.

**4. DELETION! T1-T3 (tight): lock X earlier.**
In the T1, T2 and T3 rows (line 40021), change `aim:12`, `aim:11`, `aim:10` to `aim:22`.
X already stops flickering and gets a white outline when it locks (line 42085). With this change that happens about 31 f before it hits you instead of 19-21 f, so you can turn your back when you see X lock. You don't have to count from the siren. The turn-back lunge and the trail stay.

**5. MEEPLE PORTAL! T3-T5 (tight): longer wind-up from T3.**
In `cobsTelLen` (line 40487), add 8 f for `portal` at tier 3 and up: 36 to 44 f, which is 29 to 35 f in rage. T1-T2 stay the same.
It's still a double jump, but the window grows to about f0-32 at T3, f0-30 at T5 and f0-22 in rage.

**6. SPRINGTASTIC! T3-T5 (tight): two rows at T4-T5, like T3.**
In the T4 and T5 rows of `COBS_TIERS.springs` (line 39965), change `n:3` to `n:2`. That removes the third mitten row, the one 80 px above you.
T3 already has two rows, and it gave a 21-f jump-toward window and a 37-f double-jump-toward window. T4-T5 keep their faster mittens, the box and the clone.

**7. DEPLOYING UNITS! T3-T5, no rage (tight): teleports land farther away.**
In `cobsUnitBlink` (line 41948), change `d = 260 + Math.random()*160` to `d = 340 + Math.random()*140` (340-480 px from you).
At 16-18 px/f, shots then fly about 19-30 f instead of 14-26 f. The pink flash still comes at least 26 f before each shot. This also affects T2, whose units teleport too.

**8. THE FUTURE IS SO YESTERDAY! T5 (tight): CARE! a little later.**
In `keynote` (line 41496), change `burstAt = at + 28` to `burstAt = at + 48`.
Right now, about 240 px from the podium (where he puts you), the stressed high ring reaches you almost exactly when CARE! goes off. So you must be off the ground and low at the same time. With 20 f more, that ring has passed anyone within about 400 px before CARE!, so it becomes jump, duck, then hop.

## How I know, and what I didn't test

- A scripted Knife (the only fighter his story fight allows) tried each dodge from the middle of the floor, near a ledge and on a low platform, with the arena hazard off. Bot results are only evidence. The fixes are not tuned for a bot.
- These runs were made earlier today (4:00-5:37 PM). Since then no Cobs, movement or hitbox code has changed.
- Not tested, so I read the code instead: the TICK, TOCK! volley at zero, DEPLOYING UNITS! at T3-T5 without rage, the T2 keynote, and every fix above.
- Side note: each turn still shows his move name as a banner, and his HP bar shows the six special names. That's text in a match, if the no-words rule covers boss banners.
