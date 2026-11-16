# Algebralien Boss Rush: Two's attack options (2026-11-02)

Read-only study of branch `ii-dlc` (`artifacts/V1/index.html`, nothing in the game was edited). The owner asked: the rush's stages are larger, Two's attacks "you can just outrun" in their current state, so buff them, and "give me options for the attacks" (the owner picks five, in question boxes). Two's health in the rush is 1,000 (the game's own rush hp for him is 285 x 1.5 = 428).

House rules applied to every option: the tell is in Two's body (no telegraph lines, no warning banners, no move-name popups; the names below are working names for the owner's questions, not on-screen text); anything that appears grows in over 12 frames; falling traps hit while falling; nothing unavoidable; the player can be any fighter in the roster, the fast ones included; one attack id per turn ("Harder, same damage"), so the most any single turn can take from you is the 22% hit cap (a volley shot is 0.8 of it, 17.6%).

## 1. What Two does now

Where it lives: roster row (line 23520: hp 285, `big` 2.6, `attack:"two"`, arena `twopark`), the `TWO` table (line 36513), the picker entry `BOSS_PICK.two` (line 28209), `twoMove` (line 36582), `twoBeginTelegraph` (line 36601), one function per move below it. The arena is the A-twos-ment Park: a grey floor at 82% of the screen height (floor y 590 of 720), the "S"tage (one platform, 393 px wide, 144 px above the floor, centred) and nothing else. In a rush the world is 1,100 x 720, one screen, no scrolling, and the floor runs wall to wall.

How it moves: it flies (24 to 170 px over the floor), never walks, keeps 250 / 200 / 280 px from you (phase 1 / 2 / 3), follows with a smoothed lag, and pops (shrinks away in 9 frames, re-forms in 9) to where a move begins if that is more than 240 px away. It has no contact hit.

Turn rhythm: wind-up 36 units x the 1.5 wind-up pace = 54 frames (0.9 s), the aim locks about 18 frames before it fires; after a move the gap is 140 / 110 / 95 frames x 1.2 pace = 168 / 132 / 114 frames. The picker chooses by where you stand (never the same move twice running).

Phases (at 66% and 33% health): 1 the sunset; 2 "Size Shift" (smaller, 88 -> 64 px, quicker, the sun sets, I LOVE RIDES! and CLAP! join); 3 "Power Ungrounded" (night, 96 px, takes no damage until a fighter stays within about 225 px for 30 frames, then stays grounded 240 frames and throws no orbs; the sun becomes a mace circling him; a derailed-coaster car lands on a mark every 7 s for 11%).

| Move | What it does | How it is dodged |
|---|---|---|
| MIND READ! (signature) | Hand lit, body tipped back; a rift opens 220 px behind you (the far side from Two) and 1 / 2 / 3 copies of your own last special fly out at 11.5 px/frame, 80 frames of life (about 920 px), leading your run, homing from phase 2. Then POWER DRAIN: anyone within 260 / 260 / 340 px of him takes +6% and heals him. Copies: the 22% cap. | Move after the lock, jump the copies; stay out of the drain's reach. |
| MAYBE YOU'D LIKE THIS! | The sun goes red and spiked, drops on the spot you stood, then bashes toward you in 2 / 3 / 4 hops (28 frames each, at most 294 px a hop), turning at every landing. 22%, once. | A jump on the beat, or leave the spot. |
| THE POWER OF TWO! | Eight orbs as four pairs from his body (6.5 px/frame, 130 frames of life, about 845 px); phase 2 pairs a big slow orb with a small fast one; phase 3 sends a second ring 36 frames later turned 45 degrees. First ring has a gap aimed at you. 17.6%. | Stand in the gap; step to the next gap for the second ring. |
| BLOCK TOWERS! | Three stacks (you and 200 px either side; two more from phase 2) grow, rock, then fall like dominoes 10 frames apart, bars 200 px long, the third leaning back toward you. They lie as steps for 3 s. 17.6%. | Read the lean; leave the row. |
| I LOVE RIDES! (phase 2+) | Two rails, floor and stage-top, block cars one at a time, alternating: 4 cars at 11 px/frame (phase 2), 6 at 14 (phase 3); a lamp burns 26 frames before a car leaves. 17.6%. | Jump the floor car; stand on the floor for the stage car. |
| CLAP! (phase 2+) | Two big hands from both edges meet on a line that follows you until the last 10 units; they arrive in 34 / 34 / 28 frames and pierce everything on the floor; phase 3 sends one high and one low and claps a second time where you moved. 17.6%. | Jump the low hand, or stand on the "S"tage. |

## 2. Why a player outruns it on a big stage

Numbers first. A fighter runs at 6.4 px/frame times the fighter's run stat (0.91 to 1.12), so 5.8 to 7.2 px/frame (350 to 430 px a second); a jump lasts 40 frames and peaks about 126 px up (from `MAXVX`, `JUMP`, `GRAV` and `FIGHTER_STATS`).

1. **Every move is a place, not a pursuit.** Each one aims once, at where you stood about 18 frames before it fires, and covers a small, fixed patch: the sun hops at most 294 px at a time (882 px of reach in phase 2, 1,176 px in phase 3), the stacks cover about 400 px either side of the lock, the clap's meeting line is about 90 px wide, the first orb ring has a gap on you. Wind-up is 54 frames, so a runner has moved 350 px or more from the aim point by the time anything lands.
2. **Two does not chase.** Its follow is two smoothing lags in a row (follow 0.03 / 0.05 / 0.034, glide 0.06 / 0.09 / 0.06), so a runner at 6.4 px/frame drags it about 320 / 200 / 295 px behind the point it aims for, on top of its 250 / 200 / 280 px standoff: roughly 570 / 400 / 575 px of daylight, outside the drain (260 / 260 / 340) and far outside the phase 3 mace (about 150 px circle). It has no contact damage.
3. **It is idle most of the time.** Measured over 90 s per phase (blind-shuttle probe below): wind-up 17% of the time in every phase; a move in the air 13% / 28% / 43%; the gap between turns 70% / 55% / 40%. A turn starts about every 5.3 to 5.6 s.
4. **The orb ring and the copies are cast from the middle and run out.** The ring leaves from the stage's middle with at most 845 px of reach (1,040 for phase 2's fast orb); the copies fly 920 px. The wall of a 2,400 px arena is 1,200 px from the middle, so an edge is outside the ring. The clap's hands arrive in a fixed 34 frames: on 2,400 px that is 35 px/frame (nearly 5 times a runner, and not readable), so it must be re-timed rather than just stretched; the rails' cars simply take twice as long to cross.

What I measured (scripted probe in jsdom, BelowNormal, one seed, 90 s per phase, a blind fighter that never jumps or reads a tell; phase forced by setting Two's health; scratch files in `scratchpad\alg-rush\two-attacks\`). Damage taken, percent per minute:

| Probe | phase 1 | phase 2 | phase 3 |
|---|---|---|---|
| Blind shuttle, left-right at full speed, 1,100 px arena (today) | 161 | 191 | 226 |
| The same shuttle, 2,400 x 860 arena | 73 | 94 | 153 |
| Blind camper in the far corner, 1,100 px | 155 | 109 | 158 |
| The same camper, 2,400 px | 114 | 129 | 205 |

Read it honestly: the bigger arena roughly halves the damage to a mover (down 55%, 51%, 32%), and in phase 1 on 2,400 px the sun and the towers did not land once; only MIND READ copies hit, because its rift is placed relative to you, wherever you are. A camper in the corner is not safe (MIND READ, the rails and the hands all reach it). So the weakness is moving, not distance: a patch-sized, place-locked attack is left behind by anyone who keeps moving, and a larger stage makes the patches a smaller share of the floor. One seed, a dumb player, and the probe's 2,400 arena has the "S"tage scaled to 857 px wide and 172 px high (the layout is in screen fractions), bigger than the stage I propose: treat these as direction, not exact numbers.

## 3. How big the rush arena should be

Recommended: **2,400 wide x 860 tall** (2.2 times today's width, 1.2 times the height), floor at 82% (y about 705), platforms kept at today's absolute sizes because a fighter does not grow: the "S"tage 393 px wide, 144 px up, centred, and two ledges 200 px wide, 144 px up, at about 20% and 80% of the width (x about 480 and 1,920). Why 2,400: half the width (1,200 px) is just past the longest current reach from the middle (the fast orb's 1,040 px), so a wall is out of range of everything Two throws from where it stands now, and crossing it takes 375 frames (6.3 s), about one whole turn of Two's. A smaller choice is 1,800 (still past the 845 px ring, 4.7 s to cross). I would not go under about 1,600: it is too close to today's stage for the buffs to change much.

How the options use it: HI GUYS!, CRATER LANDING and DOUBLE TAKE are placed relative to the player, so size changes nothing for them; SUN HUNT, TOWER ROW, CLAP and MOON HAIL stretch to 1,100 to 2,400 px of reach and are timed in px per frame, not in frames, so a bigger stage cannot make them faster or slower than a human can read; LAVA SPIN spreads over about 1,050 px either side, so no corner is left clear.

Build warnings, so the owner knows what the size costs:
- The single-screen arenas do not scroll (`WW = W`); the file's own comment says an earlier widened, scrolling small-stage arena was reverted for a camera bug. The rush needs either the big-stage camera path (zoom 0.72) or the custom-map one (zoom 1, scrolling), kept so that Two and every tell are always on screen. Nothing may hit the player from off-screen.
- Moves that cast from the middle (`twoGoTo(s, W2, ...)` for the orbs, the stacks, the clap, the rails) must instead pop to the player's flank, or the middle-cast reach rule above keeps the far edge safe.
- The clap's fixed 34-frame arrival must become a fixed speed.

## 4. The eight options

Damage bands: light about 7 to 11%, medium 17.6% (the volley standard), heavy 22% (the hit cap). A turn is one attack id, so a heavy turn costs at most 22% however many parts it has. If a stock holds roughly 100 to 130% against a boss hit's knockback (my assumption, not measured), 22% is about 4 to 5% of a four-stock run and 17.6% about 3.5%.

### 1. SUN HUNT: a chase. Buffed MAYBE YOU'D LIKE THIS!
- Looks like: Two points up and the sun swells, red and spiked; it drops where you stood, then hops after you 6 / 7 / 8 times (it is 2 / 3 / 4 now), up to 420 px a hop (294 now), each hop 30 frames. On every landing it squashes flat for 12 frames with the spikes splayed, then leaps; the next landing spot is fixed 8 frames before the leap.
- Tell in the body: Two's hand lit toward the sun, the sun's swell; then each squash.
- Dodge: run under it mid-hop (it needs the 12-frame squash to turn, about an 80 px head start), or jump on the beat. After it lands its one hit it rises and is spent.
- Why distance fails: 14 px/frame against your 6.4 to 7.2: it gains about 7 px a frame, about 210 px a hop, and an 8-hop chase covers about 3,300 px.
- Damage: heavy, 22% once per hunt.
- Canon: Two turns the sun into a spiked ball and bashes Four's head with it, several times (The Escape from Four transcript; Two/Coverage; both read). The hop count and speed are game design.

### 2. TOWER ROW: a floor trap. Buffed BLOCK TOWERS!
- Looks like: Two snaps (both hands lit); a stack of the show's blocks grows from the floor at your feet, then another every 9 frames, marching 400 px apart toward where you are running (toward the nearer wall if you stand still): 5 stacks in phase 1, 6 in phases 2 and 3 (2,400 px holds six at that spacing; the row runs the long way from your end). Each grows over 12 frames, rocks toward its fall for 14 frames, then falls over 24 frames onto the 200 px of floor in front of it. Bars lie 4 s as 50 px hurdles (3 s now) that slow a runner and can be stood on.
- Tell in the body: the snap, then the order the stacks grow in shows the direction; the rock shows which side each falls toward.
- Dodge: stand in the 200 px pocket beside a stack on the side it does not fall toward; reverse out of the row; stand on a ledge.
- Why distance fails: the fall front moves 400 px per 9 to 15 frames, 27 to 44 px/frame, faster than any runner, and the lying blocks block the way.
- Damage: medium, 17.6% once per row.
- Canon: Two leaves stacks of blocks across the grasslands and they topple and crush contestants (Two/Coverage, Getting Puffball To Think About Rollercoasters; read); Two makes blocks out of thin air with a snap (Two's powers, Creation). The marching row is game design.

### 3. CLAP, FULL SPAN: a sweep. Buffed CLAP!
- Looks like: Two spreads both hands, glowing; two huge hands grow in over 12 frames at the arena's edges and sweep in along the floor at a fixed 17 px a frame (about 70 frames edge to middle on 2,400 px), meeting where you will be in 45 frames at your present velocity, not where you stand. In phase 2 and up a second clap follows 30 frames later where you landed (it is phase 3 only now); in phase 3 one hand is high and one low, alternating, as now. Both claps are one hit.
- Tell in the body: both of Two's hands glow and rise; for the second, they relight.
- Dodge: jump the low hand as it reaches you, stand on the "S"tage or a ledge; for a high hand stay on the floor. No gap to run through.
- Why distance fails: 17 px/frame against 7.2 at the very most, and it sweeps your whole half of the floor; the aim leads a runner.
- Damage: medium, 17.6% for both claps.
- Canon: Two claps their hands over a contestant to eliminate them (Two/Coverage: The Worst Day of Black Hole's Life, Balancing P.A.C.T., Outbreak At Stake; read). The size, speed and lead are game design.

### 4. DOUBLE TAKE: a combo of two waves. Buffed MIND READ!
- Looks like: as now, the hand lights, Two tips back, a dark rift opens 220 px behind you and 1 / 2 / 3 copies of your last special come out of it. Then his hand relights, he tips forward, and a second rift grows in over 12 frames on his side of you, 220 px from you, firing 1 / 1 / 2 more at your new position. Both waves share one hit. Drain and drain reach as now.
- Tell in the body: the lit hand and the tip back for the first; the relight and the tip forward for the second.
- Dodge: jump the first copies and hold your ground rather than running (running from rift one runs into rift two's line), then jump the second.
- Why distance fails: both rifts are placed relative to you, and the second sits where a runner is heading.
- Damage: heavy, 22% for both waves together (a hit from wave one leaves wave two with nothing left to deal that turn).
- Canon: Two can absorb other characters' powers, like Four (Two's powers page; read). The second rift is game design.

### 5. LAVA SPIN: area denial. New
- Looks like: Two raises one arm; a ball of magma gathers and spins over his hand, growing in over 12 frames. He flings 3 / 4 / 4 globs in arcs that land across the arena: one on your spot at the lock, the others 350 px or more from each other and from it, alternating sides, the furthest about 1,050 px away. A glob that lands splashes (a hit while it falls and as it lands) and becomes a lava strip 220 px wide and 24 px high that burns for 5 s, growing in over 12 frames.
- Tell in the body: the raised arm and the spinning ball; the arc is the glob's own flight, with its real shadow on the floor, not a line.
- Dodge: leave the landing circle (r about 50), hop a strip (24 px high) or stand on a platform; strips shrink the safe floor over the next turns.
- Why distance fails: one glob lands in every part of the stage, the far corner included, and what stays is area denial for 5 s.
- Damage: medium splash, 17.6% once; touching a strip, light, about 7% once per strip.
- Canon: Two takes lava out of Yoyle Mountain, spins and shapes it, and flings some at a contestant ("Oops!"), and starts a timer in lava numbers (The Escape from Four transcript, The Worst Day of Black Hole's Life coverage; read). Counts and strips are game design.

### 6. HI GUYS!: a gap-closer. New
- Looks like: Two shrinks away in a lime ring (the pop he already has) and re-forms about 150 px from you on the side you are running toward (the wall side if you stand still), facing you, fist cocked behind his shoulder and glowing for 40 frames, body leaning back; then he lunges 200 px along your row at 14 px/frame and eases back. Re-forming grows in over 12 frames.
- Tell in the body: the pop, the lean and the glowing fist.
- Dodge: jump the low fist, or back off past about 330 px from him before it goes (the fist's whole reach is about 330 px from his middle; starting 150 px away, the slowest fighter, at 5.8 px/frame, walks 232 px in the 40 frames, so every fighter can make it).
- Why distance fails: he arrives where you are, not where you were.
- Damage: heavy, 22%, one punch, with a strong knock (super strength).
- Canon: Two arrives shouting "Hi guys!" and teleports to a scene out of nowhere (The Escape from Four; Two's powers, Teleportation, and the Buttons episode coverage); Two punches a hanging block with all their strength and sends it flying (Two/Coverage, Getting Puffball To Think About Rollercoasters; all read). The lunge is game design.

### 7. CRATER LANDING: a jump-in. New
- Looks like: Two crouches (squashing for 20 frames, green glow in his legs), springs up and out through the top of the screen. His real shadow forms on the floor and slides toward you for about 40 frames, then holds for the last 18; he comes down on it. The landing makes a crater and two dust waves run along the floor to both walls, 30 px high at 12 px/frame, the second 14 frames behind the first.
- Tell in the body: the crouch and the glow; the shadow is his real one, growing as he falls (no ring or line).
- Dodge: be off the shadow when it holds, then jump each wave or stand on the stage or a ledge.
- Why distance fails: the shadow tracks you, and the waves run to both walls faster than a run.
- Damage: heavy, 22% for a landing on you; the dust waves 11% (they share the one hit).
- Canon: Two lands in front of Four and makes a crater in the ground (The Escape from Four; Two/Coverage); Two jumps from the ground to the top of the hotel with ease (Two's powers, Jump-boost; read). The waves are game design.

### 8. MOON HAIL: a vertical one. New
- Looks like: Two throws both arms up, lit; pale moon chunks form above the top of the screen and fall in a line of 8, 200 px apart, one every 10 frames, the first at your spot and the line leading the way you run (1,400 px long). Each chunk hits while it falls (radius about 36) and breaks in a dust puff on the floor or on a platform; its shadow grows on the floor as it comes down.
- Tell in the body: the raised, lit arms; the chunks forming and the shadows growing.
- Dodge: reverse past the first chunk (the line only leads one way), or weave the gaps (200 px apart); a platform is no cover, they land on it too.
- Why distance fails: the line is as long as the arena is wide and leads a runner.
- Damage: medium, 17.6% once per hail.
- Canon: Two hands out pieces of the moon to stick on a roof (Oneirophobe's Nightmare, Two/Coverage); Two survives being crushed by the moon (Two's powers, Extreme durability); Two can move planets with a snap (Space manipulation; all read). The hail is game design, built on that.

## 5. Notes for the owner

- Two is boss 1 of 9 at 1,000 health, the gentlest start of the curve: five of these eight is plenty; all eight would make the first boss the busiest. Moves that share a slot (a gap-closer vs a jump-in vs a vertical one) are best not all picked together.
- A set that covers the main shapes once is these six: SUN HUNT (chase), TOWER ROW (floor trap), CLAP, FULL SPAN (sweep), LAVA SPIN (area), HI GUYS! (gap-closer). The owner picks five, so one of the six goes. DOUBLE TAKE, CRATER LANDING and MOON HAIL are the ones that most punish a moving player, if the owner wants the runner hunted harder.
- Left as they are: THE POWER OF TWO! (its ring needs Two to pop to your flank, not the middle, so it is not a centre-cast) and I LOVE RIDES! (its cars scale with the width on their own, about 1.5 to 2 seconds longer to cross). The phase 3 grounding rule still needs a fighter within about 225 px: LAVA SPIN and HI GUYS! add pressure to being close, so check the grounding window stays fair.
- Picker tags if they are built (what each punishes): SUN HUNT ground, platform; TOWER ROW ground, wall; CLAP any; DOUBLE TAKE any, far; LAVA SPIN far, ground; HI GUYS! far (a fighter standing far from him); CRATER LANDING any; MOON HAIL air, far.

## 6. What I read, and the limits

Game: the Two section of `index.html` end to end (roster, `TWO`, `BOSS_PICK.two`, the move functions, the arena, the phases), `startBossRush`, `spawnBossRushBoss`, `applyHit`'s boss damage cap, the player's movement constants. Canon (BFDI wiki, read in the built-in browser): the Two page (abilities and weaknesses), Two/Coverage, and The Escape from Four/Transcript. The Inanimate Insanity wiki was not needed: Two is a BFDI character. Wiki facts here are paraphrased; the only wiki words quoted are "Hi guys!" and "Oops!".

Not done: I did not play any option; none of them exist in the game. The probe numbers above are one seed and a blind fighter. The "stock holds 100 to 130%" figure is an assumption.
