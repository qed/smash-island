# Algebralien Rush: the phases audit (2026-11-02)

The owner's rule (2026-11-02): "remember to give bosses phases, and ALL attacks should get harder by phase, like cobs." This file audits every attack the owner picked, boss by boss, against that rule: what the attack is in each phase, which numbers change, a verdict, and for every FLAT or thin attack a concrete proposed ladder. READ-ONLY on the game; nothing was edited, run or downloaded. Sources: `attack-picks.md`, `owner-rules.md`, `spec.md`, the six boss files, the eight `attack-options-*.md` files (Two, Four, Four's diary slot, Nine, Six, Zero, X, Three, 2,763), and Steve Cobs's fight in `artifacts/V1/index.html` (`COBS_TIERS`, `COBS_GAPS`, `cobsTierUp`, the 2026-10-27 fairness notes), plus One's `ONE_DECK_TIERS`.

How to read it:
- P1, P2, P3 are the engine's phases (cut at 66% and 33%) for Two, Four, Nine, Zero and 2,763 (three bands). Six, X and Three are cut once at 50%, so they have P1 and P2 only. Zero's six tiers and Three's 25% ramp are inner rungs, written inside the cells.
- "Designed" means the number in the owner's option file or the boss file. Where a file gives one number for every phase, that number is "the designed number", and my ladder puts it on the rung where it is already at the fairness limit (usually P3) or in the middle (P2), with gentler rungs before it.
- Verdicts. ESCALATES: every phase step is harder in at least one number. FLAT: at least one phase step changes nothing (a violation of the rule). PHASE-GATED: the attack only exists from phase N (fine, but its later phases are shown). "thin" means it escalates but each step is one small change; an optional second lever is proposed.
- The boss-level gap between turns is not counted for any attack: every boss already has a gap ladder (Two 140/110/95, Four 104/78/56, Nine 80/66/54, Six 170/130, Zero 100/76/58, X 110/84, Three 96/68 then 58, 2,763 120/96/70, all x1.2).
- The damage cap holds everywhere: no proposal changes a hit (every move is already at or under one boss hit, 22%, and one attack id is one hit).

---

## 0. Summary

| Boss | Phases | Picked attacks | Already ESCALATE (thin) | FLAT, must change | TO DESIGN | Cobs-style ladder |
|---|---|---|---|---|---|---|
| Two | 3 | 7 | 3 (2) | 4: TOWER ROW, LAVA SPIN, CRATER LANDING, MOON HAIL | 0 | DOUBLE TAKE |
| Four | 3 | 7 | 2 (1) | 5: ZAPPIES, THE RIPPLE, THE CACTUS DRIVE, FIVE PAIRS OF ARMS, SOUP'S ON! | 0 | THE LONG NOTE |
| Nine | 3 | 6 | 6 (3) | 0 | 0 | CLEANUP CREW! |
| Six | 2 | 5 | 5 (1) | 0 | 0 | BUBBLES! |
| Zero | 3 (6 tiers) | 6 | 5 (1) | 1: STOP LAUGHING AT ME! | 0 | ROLL CALL! |
| X | 2 | 7 | 6 (2) | 0 | 1: the juice box | ROCKET DIVE! |
| One | her own | her fight | not audited | - | - | (kept) |
| Three | 2 (+25% ramp) | 6 | 5 (0) | 0 | 1: negative numbers | DECIMALS |
| 2,763 | 3 bands | 9 | 3 (0) | 5: WINDMILL, CAGE, PAN ACROSS, ROOT THEM OUT, HERCULEAN | 1: the drain | SLAM |
| Total | | 53 | 35 (10 thin) | 15 | 3 | |

- 15 of 53 picked attacks are FLAT in at least one phase step and must change before they are built: all 15 have a ladder in this file. Another 10 escalate but thinly; optional second levers are given.
- The worst bosses for this rule are Two (4 of 7 flat or half flat, because the new options were written as single designs), Four (5 of 7, same reason) and 2,763 (5 of 9: three moves repeat their band 2 numbers in band 3, two never change at all). Nine, Six, Zero, X and Three were designed with phases and are clean or nearly so.
- Pattern behind the flat ones: most are the NEW options (written once, at one strength) and the Two/Four "buffs" (written as the end state). The exceptions are 2,763's WINDMILL and CAGE and Zero's STOP LAUGHING AT ME!, designed with bands or tiers whose last rung was never written (or sits in a phase where the move cannot be drawn).
- Every ladder below is "one rung below the designed number in P1" for moves that were written at one strength. So several designed moves start gentler than the option file shows, and the file's number becomes P2 or P3. The 60-second "hold run away" check still has to pass at P1 (each P1 value is still placed on you, leads your run, or moves faster than 9 px a frame).
- Three owner-designed attacks (X's juice box, Three's negative numbers, 2,763's drain) are rows marked TO DESIGN (must escalate); each needs its own ladder from its designer.

---

## 1. What "like Cobs" means in numbers

Steve Cobs (2,500 HP) has five tiers (a line every 500 HP), and every attack has a row per tier in `COBS_TIERS`. At each tier line he flies off the top of the screen, the building sheds pieces and his gap drops: gaps 100, 84, 70, 58, 48 (T5 is 0.48 of T1). Two passives bolt on at 60% (a keynote rage: wind-ups x0.8, an extra punch) and below 20% (every hit he takes pops kernels). Most attacks keep their wind-up (only MePhone X's falls, 72 to 48 f, and rage shortens every wind-up by x0.8); the ladder is in the numbers.

| Cobs move | T1 | T3 | T5 | Levers that move |
|---|---|---|---|---|
| BOOMERANGS | 2 out, 16 px/f, lock 18 f | 3, 18 px/f, lock 14 | 4, 20 px/f, lock 10, bleed | count, speed, lock, a status |
| THE VAN | 1 van, 18 px/f, no phones | 2 vans, 23, a phone thrown out, stun | 3 vans, 27, two phones, knockdown | count, speed, a follow-up, a status |
| SUPER DEATH TRAP | 2 platforms, delay 44 f | 4, delay 36, rows stagger 8 f, alternating | 8, delay 28, whole reach, 3 leaps | count, delay, chain, leaps |
| MeMURDER | 2 poles, delay 48 f | 6, delay 36, pairs | 10, delay 24, lingers 90 f | count, delay, pairing, lingering |
| THE FIST THINGY | 1 glove, 20 px/f | 2, 24, pincer | 3, 28, pincer, gap 20 f | count, speed, a second side |
| TOXIC CANNON | 4 laser walls, 12 px/f, every 64 f | 5, 13, every 58, boat rocks 60 | 6, 14, every 54, rocks 80 | count, speed, interval, a sway |
| KEYNOTE | 2 rings, gap 40 f, no finale burst | 3 rings, gap 32, burst 1.0 | 5 rings, gap 24, three-beat finish | count, interval, a finale |

The seven levers (every Cobs rung uses two to four of them): (1) COUNT (x2 to x4 over the fight); (2) SPEED (+15% to +65%); (3) LOCK / DELAY / WINDOW shortened (-35% to -50%); (4) INTERVAL between parts shortened; (5) a NEW LAYER switched on (his "twists": off at T1, on at T2, stronger at T3); (6) a FOLLOW-UP chained under the same id (a second pass, a second row, a clone, a leap); (7) REACH or SIZE. Damage also rises in his rows (0.8 to 1.0 of his hit), but the rush keeps every hit as designed (see above).

Rung targets for the rush: for the three-phase bosses P1 = Cobs T1, P2 = his T3, P3 = his T5. For the two-phase bosses P1 = T1 and P2 = about his T4 (one big jump). In practice: count +1 (or +25%) at P2 and +2 (or +50%) at P3; speed +10% at P2 and +20% at P3; each lock or squash or stun shrinks 2 to 4 frames a rung; one follow-up or second pass enters at P2 or P3. Cobs's own rungs go further than this; the rush's stop at the floors below, because the rush's attacks are placed on you and a one-fighter run has no crowd to hide in.

Floors (where the ladder must stop; the option files and the owner's fairness fixes of 2026-10-27, where One's warn went 27 to 33 f "about 15 frames to move after reacting", Cobs's springs went from 3 rows to 2, his keynote finale moved from T3 to T5, his portal wind-up gained 8 f, and the owner said "too hard to justify in a world with this level of movetech"):
- the tell in the body is never under 14 frames; a lock (the frames the aim is frozen) is never under 14 to 15;
- a sideways dodge must fit at 5 px a frame (75 px in 15 f); the weakest full jump is 107 px and its window must be 9 frames or more; a short hop clears only what the option file says it clears;
- windows the player earns only shrink, and only down to those floors;
- a faster number never makes the dodge faster: above 9 px a frame the dodge is made at the tell, so speed only shortens the arrival;
- no new attack id (every follow-up shares the move's id: one hit, 22% at most).

---

## 2. TWO (1,000 HP; P1 sunset, P2 Size Shift, P3 Power Ungrounded)

Frame: Two's kit is the owner's seven only (the old POWER OF TWO and I LOVE RIDES are not picked). Wind-up 54 to 60 frames; P3 is the grounded-until-close phase (about 225 px for 30 f) with the sun as a mace. Numbers marked (g) come from the game's own `TWO` table.

| Attack | P1 | P2 | P3 | Levers that change | Verdict |
|---|---|---|---|---|---|
| SUN HUNT | 6 hops, up to 420 px, 30 f a hop, 14 px/f, squash 12 f | 7 hops, same | 8 hops, same | hop count only (2/3/4 in the game today) | ESCALATES (thin) |
| TOWER ROW | 5 stacks, 400 px apart, one per 9 f, rock 14 f, fall 24 f, bars lie 4 s | 6 stacks, same | 6 stacks, same | count P1 to P2 only | FLAT P2 to P3 |
| CLAP FULL SPAN | not drawn (the game's CLAP joins in P2) | hands at 17 px/f meet where you will be in 45 f; second clap 30 f later where you landed | same, plus one hand high and one low, alternating | second clap (P2), hi/lo (P3) | PHASE-GATED (P2); ESCALATES (thin P2 to P3) |
| DOUBLE TAKE | rift 220 px behind you: 1 copy (11.5 px/f, life 80); second rift: 1 copy; drain 260 px | 2 copies, homing; second rift 1; drain 260 | 3 copies, homing; second rift 2; drain 340 | copies, second wave, homing, drain reach (g) | ESCALATES |
| LAVA SPIN | 3 globs, farthest 1,050 px, strips 220 x 24 px, burn 5 s | 4 globs, same | 4 globs, same | globs P1 to P2 only | FLAT P2 to P3 |
| CRATER LANDING | crouch 20 f, shadow slides 40 f then holds 18 f; two waves 30 px high at 12 px/f, 14 f apart | same | same | none | FLAT |
| MOON HAIL | 8 chunks, 200 px apart, one per 10 f, a 1,400 px line leading your run | same | same | none | FLAT |

Assumption to confirm: CLAP FULL SPAN keeps the game's P2 gate. If the owner wants it in P1 it needs a P1 rung (a single clap at 15 px/f, no second clap).

Proposed ladders (the designed number sits on the rung shown as "designed"):

| Attack | P1 | P2 | P3 | Fairness check |
|---|---|---|---|---|
| SUN HUNT (optional second lever) | 6 hops, 380 px a hop (12.7 px/f), squash 18 f | 7 hops, 420 px (14 px/f), squash 16 f | 8 hops, 460 px (15.3 px/f), squash 14 f | squash is the per-hop tell: floor 14 (the head start under the sun goes 115 to 90 px); every hop still re-aimed 8 f before the leap |
| TOWER ROW | 5 stacks, one per 10 f, rock 16 f, bars lie 3 s | 6 stacks, one per 9 f (designed), rock 15 f, bars 4 s (designed) | 6 stacks, one per 8 f, rock 14 f (designed), bars 5 s, plus a return row of 3 stacks marching back from the far end 40 f after the last falls, led to where you stand (same id) | rock 14 is the floor; the 200 px safe pocket never changes; the fall front (400 px per 8 f) is read from the lean, not raced |
| CLAP FULL SPAN | not drawn | 17 px/f, second clap 30 f later (designed) | 19 px/f, hi/lo hands, second clap 24 f later, led by your run | the second clap's relight tell stays 14 f or more; both claps one hit |
| LAVA SPIN | 3 globs, strips 200 px wide, burn 4 s | 4 globs, 220 px, 5 s (designed) | 5 globs in two volleys (3, then 2 flung 24 f later, led by 10 f of your run), 240 px, 6 s | landings stay 350 px or more apart, so a gap of 110 px or more is always walkable; strips are light (7%, once each); at most 50% of the floor |
| CRATER LANDING | waves 12 px/f, 2 waves 14 f apart, shadow hold 18 f | 13 px/f, 3 waves 12 f apart (designed waves 2 at 14: this adds one) | 14 px/f, 3 waves, then a second crater: he springs up again 28 f after the first landing (14 f crouch), the shadow holds 18 f on where you are, 2 waves | hold stays 18 (a 90 px sidestep at 5 px/f); a full jump is above 30 px for about 34 f, so it clears three waves 12 f apart; one id, 22% once |
| MOON HAIL | 6 chunks, one per 12 f, 220 px apart | 8, one per 10 f, 200 px (designed) | 10, one per 8 f, 180 px (a 1,620 px line) | free gap between chunks is spacing minus 72 px: 108 px at P3 (a 54 px walk, 11 f); shadows grow as designed |

Cobs-style ladder: DOUBLE TAKE (the signature: copies 1/2/3, a second wave 1/1/2, homing from P2, the drain's reach 260 to 340 px) is already the one that shows Two getting angrier.

---

## 3. FOUR (1,200 HP; P1 classroom, P2 Zap to Dust, P3 Reality Buckles)

Frame: wind-ups x1.25 (a 50 is about 62 f); the arena's sparks start in P2 (every 230 f, then 180 f) and are not a picked attack. Numbers marked (g) come from the game's `FOUR` table. All of Four's hits are light to medium (0.3 to 0.8) except the ring and columns.

| Attack | P1 | P2 | P3 | Levers that change | Verdict |
|---|---|---|---|---|---|
| THE LONG NOTE | ring at 9.5 px/f, 2 rings 20 f apart, nearest gap = fighter + 70 px | 10.5 px/f, 2 rings | 11.5 px/f, 3 rings | speed (P1 to P2), third ring (P3) | ESCALATES (thin P1 to P2) |
| ZAPPIES! blue mark ahead | chain of 4 columns, 16 f apart, 52 px wide, lock 15 f | 88 px wide | 88 px wide | width P1 to P2 only (g: 52/88/88) | FLAT P2 to P3 |
| THE RIPPLE | both ends toward you at 16 px/f, crests 96 px apart (one per 6 f), every 5th an 80 px tower, band 1,800 px, then 3 hills | same | same | none | FLAT |
| THE CACTUS DRIVE | not drawn | 2 cacti (500 and 1,000 px away), 2 to 7.8 px/f, 240 f, 70 px tall | same | none | PHASE-GATED (P2); FLAT P2 to P3 |
| FIVE PAIRS OF ARMS | 5 pairs, 24 f apart, palms 18 px/f, reach 600 to 1,400 px, chin pocket 200 px | same | same | none | FLAT |
| SOUP'S ON! | 8 blobs 10 f apart (54 f flight), pools 160 px, stand 300 f | same | same | none | FLAT |
| EQUAL SHARES | 1 wave of pages, lane 180 px | 2 waves 70 f apart, lane 150 px, lanes re-placed 240 px or more from you | 3 waves, lane 150 px | waves, lane width | ESCALATES |

Proposed ladders:

| Attack | P1 | P2 | P3 | Fairness check |
|---|---|---|---|---|
| THE LONG NOTE (optional second lever) | 9.5 px/f, 2 rings 22 f apart, nearest gap = fighter + 90 px | 10.5 px/f, 20 f, + 70 (designed) | 11.5 px/f, 3 rings 18 f apart, + 50 | the nearest-gap-in-reach rule of the option file holds at any range; + 50 px leaves a 25 px tolerance each side (5 f at 5 px/f); 18 f is a step across a half-gap |
| ZAPPIES! blue mark ahead | chain of 3, 18 f apart, 52 px | chain of 4, 16 f, 88 px (designed) | chain of 5, 14 f, 88 px; the fifth lands where you stood at the first lock | the lock stays 15 f on every column (75 px at 5 px/f, enough for a column 88 px wide): never shorten it |
| THE RIPPLE | 14 px/f, crests 84 px apart, band 1,500 px, one crossing | 16 px/f, 96 px, band 1,800 px (designed) | 18 px/f, 108 px, band 2,100 px, a second crossing 36 f after the first ends | the beat is 6 f at every rung (spacing scales with speed), so a tower is 30 f after the last one: one full jump each; the game's own hills after it already step 110/126/140 px at 10/8/6 f (g) |
| THE CACTUS DRIVE | not drawn | 2 cacti, top 7.0 px/f, life 210 f | 3 cacti: the first two as designed, a third grows 40 f later 700 px ahead of your heading; top 7.8 px/f, life 240 f | height stays 70 px (a 9 f jump window at the weakest jump); arrivals are placed 36 f or more apart so each is one jump |
| FIVE PAIRS OF ARMS | 4 pairs, 28 f apart, 16 px/f, reach 600 to 1,200 px, pocket 200 px | 5 pairs, 26 f, 18 px/f, reach to 1,400 px, pocket 180 px | 6 pairs, 24 f, 19 px/f, reach to 1,600 px, pocket 150 px | 24 f is the designed floor (one full jump clears two palms 24 f apart with 3 f to spare): never lower; the pocket is the brave answer, so it shrinks but stays |
| SOUP'S ON! | 5 blobs, pools 140 px, stand 240 f | 7 blobs, 150 px, 300 f | 8 blobs, 160 px, 360 f (the designed blob count) | pool cover on the 2,400 px stage is 29% / 44% / 53%; landings stay 360 px apart alternating, so 200 px gaps remain; blob flight and the 0.5-hit fall unchanged |
| EQUAL SHARES (optional) | as designed | as designed | lane 130 px | the lane slides 3.3 px/f at most; 130 px still fits one fighter plus 70 px |

Cobs-style ladder: THE LONG NOTE (rings 2/2/3, a faster front each phase, a narrower nearest gap, and Four's face going calm, then mad, then next-level mad as the classroom tears away).

---

## 4. NINE (1,400 HP; act 1 Totally Tubular, act 2 Not Radical, act 3 Clobber Time)

Frame: the designer's tempo bump is already inside these numbers (speeds +2 px/f, windows shorter in act 3). Wind-ups do not shrink by tier (Nine's design rule). Hits are 0.6 to 1.0, one id per move. The bike form of TUBULAR! is counted with TUBULAR!.

| Attack | P1 | P2 | P3 | Levers that change | Verdict |
|---|---|---|---|---|---|
| TUBULAR! | board 16 px/f, wipeout window 56 f | board 18, window 50; bike form 22 px/f (tree 760 px past you, blast r 100, 8 shards), window 44 | board 20, window 44; bike 24 px/f, window 38 | speed, window, the bike form (P2), a faster bike | ESCALATES; the bike is PHASE-GATED (P2) |
| CLEANUP CREW! | 4 boards at 8 px/f, gaps 150/150/270 px repeating | 5 boards at 9 px/f, plus 3 boards the other way on the nearest platform one second later | 6 boards at 10 px/f, the floor boards turn at the end and come back 2 px/f faster | count, speed, a platform lane, a return pass | ESCALATES |
| BOOYAH! | flight 54 f, stuck-landing window 26 f | flight 48 f, a pair (second ollie 20 f after the first landing), window 22 | flight 44 f, pair, window 20 | flight and window (small), pair (P2) | ESCALATES (thin P2 to P3) |
| STONE-TO-BOOT! | not drawn | one boot (falls in 14 f, kicks 240 px in 12 f, rests 30 f) | plus a second boot 32 f after the first kick | second boot (P3) | PHASE-GATED (P2); ESCALATES (thin) |
| GRIND! | rail 13 px/f, arc 46 f, window 30 f | 15 px/f, window 26 | 17 px/f, window 22 | speed +15%, window -4 f each step | ESCALATES |
| SKATE AWAY! | scoop burst 20 px/f (up to 14 f), carry about 30 f at 14 px/f, miss window 44 f | 22 px/f, window 40 | 24 px/f, window 36 | speed and miss window, both small | ESCALATES (thin) |

Proposed second levers (for the thin ones):

| Attack | P1 | P2 | P3 | Fairness check |
|---|---|---|---|---|
| BOOYAH! | as designed | as designed | second ollie 16 f after the first landing (was 20), its landing led by 10 f of your run | the second crouch stays 14 f or more; the landing is still locked 14 f before takeoff and the flight is 44 f, so the sidestep is easy |
| STONE-TO-BOOT! | not drawn | as designed | kick 300 px (was 240), toward the middle | the kick lane is hopped, not raced; still toward the middle, never off the world |
| SKATE AWAY! | burst up to 12 f (240 px), window 44 | burst 14 f (308 px), scoop box 110 px, window 40 | burst 14 f, window 36, plus a second pass 40 f after the first (Nine rides off-screen and in from the far edge, lock 16 f); no second pass if the first catches you | one id, set-down hit 0.8 once; the control loss stays about 30 f (the owner's open question 2); the lock 16 f is the designed value |

Cobs-style ladder: CLEANUP CREW! (boards 4/5/6, speed 8/9/10, a platform lane appears in act 2, a return pass in act 3: four levers, the clearest "he is getting angrier"). TUBULAR! with the bike is the star but climbs mostly by speed and the bike.

---

## 5. SIX (1,600 HP plus two bubbles; P1 Staying Behind, P2 Revenge; cut at 50%)

Frame: stand-off 480 px in P1, 380 px in P2; a new bubble forms at 50%; gaps 170/130 (x1.2). Hits 0.8 to 1.0 of a boss hit.

| Attack | P1 | P2 | Levers that change | Verdict |
|---|---|---|---|---|
| BUBBLES! | stream of 3 + 1 per living fighter (cap 8), one per 9 f, 3.4 px/f, homing 0.012 | +2 bubbles, 4.2 px/f, homing 0.02 | count, speed, homing | ESCALATES |
| LEAF RAKE! | one heap, 9 px/f, 70 px tall, radius 34 | the same heap, then a second swing the other way 26 f later | a follow-up only | ESCALATES (thin) |
| SLAP! | arm reach 330 px, out in 11 f | reach 420 px, plus a backhand 20 f after it returns, the other way, 70% reach | reach, follow-up | ESCALATES |
| ROCK DROP! | 2 + 1 per living fighter (cap 6) rocks, one per 20 f, each where its fighter stood at the fling | +1 rock, the last two led by 20 f of your run | count, lead | ESCALATES |
| KICK OUT! | not drawn | 24 f to leave the arc; boot reach 150 to 190 px; knock toward the middle | - | PHASE-GATED (P2 only; no later phase to ladder) |

Proposed second lever:

| Attack | P1 | P2 | Fairness check |
|---|---|---|---|
| LEAF RAKE! | 9 px/f, radius 34 | 10.5 px/f, radius 38, second swing 22 f later (was 26) | the heap passes a point in about 13 f against a jump window of about 30 f (above 70 px); the second heap starts at the far end, so the two arrivals are separated by its travel |

Optional for all two-phase bosses (see section 11): a numbers-only ramp at 25%, as Three's design already has, would give KICK OUT! a P2b rung (a second boot swing 26 f after the first, the other way, toward the middle).

Cobs-style ladder: BUBBLES! (her signature move: in a solo run 4 bubbles in P1 and 6 in P2, faster, and curving harder, with her angry render, dusk and a fresh bubble shield).

---

## 6. ZERO (1,800 HP; P1 Leader, P2 Embarrassing Tapes, P3 All Zeroes Combine; six tiers)

Frame: two tiers a phase (a rung at each phase's midpoint: 1,494 / 891 / 297 HP). The designer's rule is that tiers change counts and coverage, never speed or damage. Form: small coward who backs off (P1), red and walking at you (P2), the planted Giant (P3). Gaps 100/76/58.

| Attack | P1 (T1, T2) | P2 (T3, T4) | P3 (T5, T6) | Levers that change | Verdict |
|---|---|---|---|---|---|
| ROLL CALL! (signature) | one line, 4 then 5 Zeroes, 7 px/f, 310 px apart | two lines from both ends, 4+4 then 5+5 | three lines (adds the centre platform), 4+4+4 then 6+6+5 | count, number of lines, coverage; the fizzle (18 HP) stays | ESCALATES |
| TAPE TOSS! | 4 then 5 tapes in a comb (flight 55 to 70 f) | 6 then 6 or 7; tapes now leave the shelf Zeroes' hands | 7 then 8 | count; thrower (P2) | ESCALATES (thin) |
| DIVIDE BY ZERO! | chop only (reach 1.6 r + 60 px, 10 f live, 1.0) | T3: two dots roll away (7 px/f, r 18, 0.6) | T5: bigger dots; T6: a double chop (backhand 22 f later) | dots (P2), size (T5), a chain (T6) | ESCALATES |
| STOP LAUGHING AT ME! | not drawn | roll 12.5 px/f up to 1,400 px, door bangs 3 times, wall stun 55 f | not drawn: the Giant cannot roll (the Zero options' flag B) | none inside P2: the designer's only rung (a bounce-back run) is tier 5, which is P3 | PHASE-GATED (P2); FLAT inside P2 |
| THE FOOT! | not drawn | not drawn | T5: one foot (220 px wide, 30 px/f fall); T6: a second foot 28 f after the first lands | second foot (T6) | PHASE-GATED (P3); ESCALATES |
| GET HIM! | not drawn | T3: one cloud (5.4 up to 8.6 px/f, one wall bounce); T4: two clouds, one from each end, 40 f apart | T5: two clouds, each lasting through two bounces; T6: three clouds | count, bounces | PHASE-GATED (P2); ESCALATES |

The designer wrote TAPE TOSS! only as "4 / 5 / 6 / up to 8", so the six-tier row above is my reading; the comb spacing is also unresolved (0.11 of the stage width is 264 px; "130 px" is the other reading).

Proposed ladders:

| Attack | P2a (T3) | P2b (T4) | Fairness check |
|---|---|---|---|
| STOP LAUGHING AT ME! | roll 12.5 px/f, one run, wall stun 55 f | roll 13.5 px/f, the bounce-and-return run brought forward from tier 5 (the stun comes after the second run), stun 48 f | the door bangs and the 68 f tell are unchanged; the return run starts 1,400 px away, so about 100 f to read; window only shrinks. If the owner wants it in P3 the Giant needs a low roll (flag B), else it is absent there |

| Attack (optional second lever) | P1 | P2 | P3 | Fairness check |
|---|---|---|---|---|
| TAPE TOSS! comb spacing | 190 px | 170 px | 150 px | a tape is 36 px wide: at 150 px a 114 px gap stays (a 60 px fighter plus margin); the spacing note above must be settled first |

Cobs-style ladder: ROLL CALL! (four Zeroes in one line become seventeen in three lines, while the boss goes from a small coward to a red walker to the Giant).

---

## 7. X (2,100 HP; P1 The Host, P2 Pushed To The Limit; cut at 50%)

Frame: P2 is alight for good (ember drip every 45 f, a hot sky, a close sun); gaps 110/84; X keeps 260 px from you in P1 and 220 in P2. BURNING! is the P2 opener. The signature HIDE AND SEEK! fires every fifth turn.

| Attack | P1 | P2 | Levers that change | Verdict |
|---|---|---|---|---|
| BASKET RAIN! | one row, about 215 px apart (8 to 9 baskets), one per fighter locks 14 f before the drop; fall about 35 f | the same row, then a second row 40 f later placed where you stand now | a follow-up only | ESCALATES (thin) |
| SNAP! | 2 snaps 28 f apart, columns glitch 44 f | 3 snaps, glitch 38 f | snap count, the window | ESCALATES |
| ROCKET DIVE! | one dive, a 70 f stuck window after it | no window after the first dive; a second dive 30 f later on the next fighter's lock; the window after the second | chain length, the window removed from the first | ESCALATES |
| ARROW DASH! | one pass at 30 px/f on your row | plus a second pass 20 f later on a different row | a follow-up only | ESCALATES (thin) |
| BURNING! | not drawn (see the note) | figure-eight, 150 f, up to 11 px/f, embers every 7 f, two passes (the second lower), x1.25 damage to him while it lasts | - | PHASE-GATED (P2 only) |
| HIDE AND SEEK! (signature) | 3 baskets, 3 swaps 50 f apart, clock 330 f | 4 baskets, 5 swaps 36 f apart, clock 270 f | baskets, swaps, swap speed, clock | ESCALATES |
| JUICE BOX (owner's own) | TO DESIGN (must escalate) | TO DESIGN (must escalate) | - | needs a P1 and a P2 rung, a hit at or under 22%, every part one id, the tell in the body |

Note on BURNING!: the options file also lists P1 numbers for it (an ember every 9 f, one pass, doused by steam) but the spec and `boss-x.md` give it as the P2 opener and X's P1 kit as four attacks plus the shuffle, so I treat it as P2 only. If the owner wants it in both phases, the numbers are already written: P1 ignition (ember every 9 f, one pass, steam at the end), P2 flare (every 7 f, two passes, no dousing).

Proposed second levers:

| Attack | P1 | P2 | Fairness check |
|---|---|---|---|
| BASKET RAIN! | row spacing 240 px (7 to 8 baskets) | row spacing 215 px (8 to 9, designed), second row 40 f later | a gap of at least a body wide stays in both rows; the shadow still locks 14 f before the drop |
| ARROW DASH! | 28 px/f, one pass | 32 px/f, second pass 34 px/f, 20 f later | the dodge (change row) is made at the 45 f tell and the 14 f row lock, so speed only shortens the arrival; a pass across 2,400 px is still 70 f or more |

Cobs-style ladder: ROCKET DIVE! (one dive and a free window, then two dives with the window taken away: the clearest "X is pushed to the limit"). HIDE AND SEEK! is the strongest signature ladder (3 to 4 baskets, 3 to 5 swaps, faster, a shorter clock).

---

## 8. ONE (2,400 HP in the rush)

One keeps her fight. Her deck moves already carry a row per tier in `ONE_DECK_TIERS` (three tiers, `onePhase` caps at 3, so with a phase line every quarter of her bar her last two bars share tier 3, as the last 1,000 HP of her ordinary fight does today); nothing is audited or changed here.

---

## 9. THREE (2,700 HP; P1 Valueless, P2 All For One; cut at 50% plus a numbers-only ramp at 25%)

Frame: she floats 380 px from you and never chases; the corner rule forces LEAVE ME ALONE!; P2 begins with the shatter beat and she wears One's aura. Gap 96 in P1, 68 in P2, 58 after the ramp (the ramp also adds one armory piece and one "1" to the decimal chain).

| Attack | P1 | P2 | Levers that change | Verdict |
|---|---|---|---|---|
| DECIMALS (signature) | 4 orbs 14 f apart (2.9 falls short, 3.1 overshoots, 3.2 homes 60 f, 3.1111... sheds 3 copies every 20 f) | the four fly twice, the second time in reverse after a 24 f flicker; 4 copies | passes, order, copies; +1 copy at 25% | ESCALATES |
| HALLWAY LASER | one beam, 44 px tall, one row, 54 f tell | both hands, then a second beam 20 f later on the row you are in (28 f tell, lock 12 f) | beams, a follow-up row | ESCALATES |
| THE ARMORY | 5 pieces, one per 12 f, from one side (left cell) | 7 pieces, two launch together, one from each side | count, sides; +1 piece at 25% | ESCALATES |
| LEAVE ME ALONE! | one burst, body radius + 150 px, 8 f live | a second burst 24 f later, 40 px bigger | burst count, size | ESCALATES |
| CONTAGION | 4 seeds 240 px apart, chain reach 260 px, domino 14 f apart | 6 seeds, chain reach 320 px | count, chain reach | ESCALATES |
| NEGATIVE NUMBERS (owner's own: two beams each) | TO DESIGN (must escalate) | TO DESIGN (must escalate) | - | needs a P1 and a P2 rung (how many numbers, beam speed or count), two beams each, a hit at or under 22%, every part one id, the tell in the body |

Nothing else needs a change. She is the best-laddered boss: every phase-2 line is "the same moves, doubled".

Cobs-style ladder: DECIMALS (four orbs become eight in reverse order, with another "1" at 25%, while she goes from pale and glitchy to swollen in One's aura).

---

## 10. 2,763 (3,000 HP; three bands P1 3,000-2,000, P2 2,000-1,000, P3 1,000-0; the designer's two phases are bands 1 and 2-3)

Frame: gaps 120/96/70; the belly drops 30 px and the numerals grow 10% at P2; from P2 the floor is lava round a dry island that is 720 px wide and 560 px in P3 (not a picked attack). Phase names "THE FINAL PHASE" and "ALL SIX ARMS".

| Attack | P1 | P2 | P3 | Levers that change | Verdict |
|---|---|---|---|---|---|
| SLAM | 2 hands, locked for the last 16 f, sit 40 f | 4 hands | 6 hands | hand count (all six arms at P3) | ESCALATES |
| WINDMILL | 3 arms, one turn at 0.045 rad/f (140 f), arm 240 px | 6 arms, 1.5 turns at 0.04 rad/f (236 f) | same | arms, turns (P1 to P2 only) | FLAT P2 to P3 |
| LIGHTS (signature) | N = lights carried (3 to 8), one spiral, 4.4 px/f, one per 7 f | plus a second spiral the opposite way 28 f later | orbs 5.2 px/f, N +2 | spirals, speed, count | ESCALATES |
| CAGE | one cage on the farthest fighter, stays 220 f | two cages 40 f apart | same | count (P1 to P2 only) | FLAT P2 to P3 |
| FLOOD | not drawn | the first tide opens the phase: surge 56 px, holds 70 f; island 720 px | a second surge 84 px 30 f later; island 560 px | surges, island size | PHASE-GATED (P2); ESCALATES |
| PAN ACROSS | hand out at head height 12 px/f, then skims back at 14 px/f | same | same | none | FLAT |
| ROOT THEM OUT | patch 3 up to 10 px/f, swell 24 f, column 140 x 240 px, 14 f live; from P2 it stays on the island | same | same | none | FLAT |
| HERCULEAN | not drawn | glide up to 10 px/f, then a low jab (24 f later), a high jab (22 f later), a wide swing (26 f later); reach 300 px | same | none | PHASE-GATED (P2); FLAT P2 to P3 |
| THE DRAIN (owner's change: damages and heals inside a radius) | TO DESIGN (must escalate) | TO DESIGN (must escalate) | TO DESIGN (must escalate) | - | needs a rung per band (radius, tick damage, heal share), the tick well under a boss hit, and the old no-specials hush kept |

Proposed ladders:

| Attack | P1 | P2 | P3 | Fairness check |
|---|---|---|---|---|
| WINDMILL | 3 arms, 1 turn (designed) | 6 arms, 1.5 turns (designed) | 6 arms, 2 turns with the direction reversing at the midpoint after a 10 f slowdown, arm 270 px, 0.04 rad/f | the slow turn stays the warning (60 f wind-up); an arm passes a point every 26 f; 270 px is past the 220 px drain, so stepping out still works from inside it |
| CAGE | one cage (designed) | two cages 40 f apart (designed) | two cages 32 f apart, the second led by 20 f of your run, both stand 260 f | never a third: on the 560 px island two 110 px cages leave 340 px of floor, and the cage top is still a refuge; knock is out from the centre line, so nobody is caught inside |
| PAN ACROSS | out 12 px/f, back 14 px/f | out 13, back 15 | out 14, back 15.5, plus a second hand 30 f behind the first on the same out-and-back path (one id) | the return is capped at 15.5 so the hop window stays near the designed 16 f; the first pass is still dodged by staying low, the second by hopping |
| ROOT THEM OUT | top 8 px/f, one patch, column 140 px, swell 28 f | top 9, a second patch 50 f later 380 px ahead of your heading, column 150 px, swell 28 f | top 10 (designed), two patches, column 160 px, swell 28 f | a 28 f swell is a 4 px/f walk off a 160 px column; patches are clamped inside the island from P2 |
| HERCULEAN | not drawn | designed (gaps 24 / 22 / 26 f, reach 300 px) | gaps 20 / 18 / 22 f, reach 330 px, a fourth blow (a backhand wide swing 22 f after the third) | each blow keeps 18 f or more after the last; the engine caps one id at one boss hit (22%), so the sum of 0.5, 0.5, 0.8, 0.5 is trimmed to it |

Cobs-style ladder: SLAM (2, then 4, then all 6 black hands: the phase-card name "ALL SIX ARMS" is the same thing). LIGHTS is the signature ladder (one spiral, two opposite spirals, faster and fatter).

---

## 11. Notes, open points, and how to check it

1. STOP LAUGHING AT ME! (Zero): as written the move is flat inside phase 2 because its only rung (the bounce-back) sits at tier 5, which is phase 3, where the Giant cannot roll. The ladder above moves the rung to tier 4. The owner's call: absent in P3, or a low Giant roll.
2. BURNING! (X): treated as P2 only, per the spec; the P1 numbers in the options file are leftovers (see section 7).
3. CLAP FULL SPAN (Two): assumed P2 on, as the game's CLAP. A P1 version needs a rung.
4. Two-phase bosses (Six, X, Three): P2 is one big rung. If the owner wants a third rung cheaply, copy Three's numbers-only ramp at 25% to Six and X (no card, gap down, one more of something per attack). It is not needed to satisfy the rule.
5. Damage is not used as a lever: every move stays as designed. The cap leaves headroom (a 0.8 move could go 0.8 / 0.9 / 1.0), which Cobs does use; the owner can add it as a pure copy later.
6. Where a ladder lowers P1 below the designed number, the 60-second "hold run away" check still has to pass at P1.
7. THE CHECK for builders and checkers (the owner asked for it per attack): force each move at each phase (`algJump(boss, phase)` plus a forced pick) and read the numbers off. Pass = no two adjacent columns of this table are equal for any attack that exists in both phases, no tell under 14 f, no lock under 14 to 15 f, no window that grew, no second hit under one id.
8. The three owner-designed attacks (juice box, negative numbers, the drain) must come back with a rung per phase before they are briefed.
