# Event contests v1 (design only)

Status: COMPLETE (all six contests written). Design only.

Scope: a CONTEST third match for 8-Ball, Black Hole, Clock, Pie, Stapy, Foldy.
No code was edited. Nothing here was run or simulated.

## Read first (honest notes)

- Sources: the BFDI wiki was NOT opened in this job (read-only job, no browser). Every episode below is from memory and is marked "unchecked". Anything I made up is marked "invented".
- Times ("about 2 minutes") are paper estimates. Nothing was run. Each contest has one number to turn if CPUs finish too fast or too slow.
- Online: the three contests that exist are offline only (the code says startEventMatch refuses in a room). These six are specified the same way: offline, nothing on the snapshot. I did not read startEventMatch itself, only the comments that say so.
- No sky drops: Cloudy's contest uses contestDrop(sky) and contestDropNew, which come down from the sky. None of these six may call them. Everything here GROWS IN where it stands (GROW_IN, as the jawbreaker shell does).
- Computer only: no touch anything.
- No fighter's moves change.

## The six at a glance

| Fighter | Contest | Kind of goal | Win |
|---|---|---|---|
| 8-Ball | Lick Your Way to Freedom | break targets | free 3 |
| Black Hole | Back to the Top | carry and deliver | 5 balls into the hole |
| Clock | Fast Forward | hold a zone | run your 40 s clock to 0 |
| Pie | 500 Steps | climb race | reach the top step |
| Stapy | The Search Party | hide and seek | find Foldy 3 times |
| Foldy | Carried Off | catch moving things | catch 12 pages |

The three that exist: hold nine items (Cloudy), last one standing going down (Eraser), dig then fight (Spongy). None of the six repeats those.

## Shared build notes (do these once)

1. contestWin() is written for Cloudy: its banner says "holds all 9" and it ranks the rest by contestCount. Give a rule two optional hooks: `winText(f)` and `score(f)`; fall back to today's behaviour so Cloudy's does not change.
2. Each rule needs `EVENT_TWIST_WORDS['contest:<rule>']` with icon, short, words (about 130 characters) and `.goal` (the 5-second line, drawEventGoal).
3. A contest row has twist:'contest', so it cannot also say 'lowgrav', 'fast', 'dark' or 'gusts'. eventMatchReady checks the whole twist string against EVENT_TWISTS_BUILT, so 'contest+dark' would fail it unless that exact string is added. Simplest: a helper `contestIs(rule)` and one `||` in each of lowGravOn(), darkOn(), the 'fast' and 'gusts' lines of twistStep(). CHECK how MATCH_TWIST is set before choosing; I did not read it.
4. Stocks: 3 each unless said. At 0 stocks you are out as in any match, and if one fighter is left checkWin ends it as ever (Cloudy's works the same). The contest goal is the main way to win.
5. Smash Balls off in all six: a Final Smash would decide a score race.
6. CPU hooks: want() for the errand, focus() to turn on the leader. Copy the shape of CONTEST_RULES.collection.want (aiSafeStep, "a foe within 150 px comes first").
7. The HUD panels reuse Cloudy's panel code (top right, one row per fighter, you first). The over-head pill reuses its badge().
8. Per owner rule there is no test suite. "How to test" below means: build, boot, play one match, and watch one CPU-only match with a stopwatch.

---

## 1. 8-Ball: Lick Your Way to Freedom

- Source: BFB 2, "Lick Your Way to Freedom" (the jawbreakers with contestants sealed inside; a team is safe once it frees one). Unchecked here; the game's own notes cite the same episode.
- Pitch: break the jawbreakers; first to free three wins.

### Rules
- Row: stage 'pillars', sides you / 8-Ball / Golf Ball / Lollipop (as now), items 'off', smashBalls false, twist 'contest', contest 'lick', stocks 3.
- Three jawbreakers stand on the stage at all times, on fixed spots (left floor, middle platform, right floor). They grow in where they stand. They never melt.
- A shell is today's shell: 40 hp, chipped by any hit, the top pops off at 20 hp and shows what is inside. Popping the top still heals 10%.
- Half are empty (the puff of air that shoves, as now). Half hold somebody. Use a shuffled bag of [full, empty] so there are never more than two empties in a row.
- The LAST hit on a full one frees them: +1 for that fighter, and the 5 s of safety as now.
- A new shell grows in 2 s (120 frames) after one goes, on a free spot.
- A score never goes down. A KO costs a stock only.
- Win: 3 freed. No timer.
- HUD: panel "FREED", three slots per fighter. Pill over each head "n/3".
- Goal line: "Free 3 from the jawbreakers"
- Pre-match words: "8-Ball's contest: break the jawbreakers. Half hold somebody. The last hit frees them. First to free 3 wins."

### CPU behaviour
- want(): no foe within 150 px -> walk to the nearest shell and swing (jawbItem already makes a shell a target; an open one with somebody inside is worth more).
- focus(): a rival at 2 freed is everyone's foe.
- Estimate: a shell is about five hits. Three shells in parallel, half full, winner needs 3, worst case 9 frees. Paper estimate 60 to 120 s. Knob: LK.need (3) or shell hp (40).

### Build spec
- Reuse the JAWB machinery (jawbStep, jawbHit, jawbShots, jawbItem, JB numbers) with three changes behind `contestIs('lick')`: (a) `sh` becomes a list of up to 3 shells, (b) shells appear in place on LK.spots instead of dropping, so the falling bonk never happens, (c) melt and openMelt are off.
- New constants: `LK = { need:3, shells:3, regrow:120, gang:2 }`.
- CONTEST_RULES.lick: begin() places three shells; step() regrows and checks need; score lives in f._lk; hud(), badge(), focus(), want(), winText "<name> freed 3!".
- The freed figure that scurries off is today's art.

### How to test
- Play it: free 3, see the win screen and the pay.
- Check a last hit stolen by a rival scores for the rival.
- CPU-only match: it must end by the goal, not by stocks. Time three runs.
- Check no shell ever falls from above.

### Risks
- JAWB assumes one shell (`sh`); making it a list touches jawbHit, the draw and jawbItem. This is the main work.
- If all four CPUs pile on one shell the other two sit unused; want() should pick the nearest, not the best.
- Last-hit stealing may feel unfair to a human who did the chipping. It is the show's joke and today's rule; say so in the words.

---

## 2. Black Hole: Back to the Top

- Source: BFB 9, "This Episode Is About Basketball" (balls into a basket, and Black Hole's pull). Unchecked, and I am not sure of his exact part in it. The dunk rule itself is invented.
- Pitch: carry balls from the floor up to the black hole at the top; first to five.

### Rules
- Row: stage 'skytower', sides you / Black Hole / Pen / Flower (as now), items 'off', smashBalls false, twist 'contest', contest 'top', stocks 3. Low gravity stays on (shared note 3).
- A small black hole (a prop, not the fighter; radius 46) hangs over the highest middle platform, one low-gravity jump above it.
- Three balls lie on the floor, grown in at fixed floor spots.
- Touch a ball to carry it. One ball at a time. It shows over your head.
- Touch the hole (within 60 px) with a ball: +1. That ball grows in again on the floor 1.5 s later.
- ANY hit knocks the ball out of your hands. It hops beside you and is not yours again for 30 frames (the Golden Seed's rule).
- A loose ball within 260 px of the hole is pulled in and swallowed for nobody. It comes back on the floor.
- A KO drops your ball where the floor is nearest (placed, not dropped from the sky).
- Win: 5 balls in. No timer.
- HUD: panel "BACK TO THE TOP", five slots per fighter. A ball icon over a carrier.
- Goal line: "Carry 5 balls up to the hole"
- Pre-match words: "Black Hole's contest: carry a ball up to the hole. Any hit knocks it loose. First to 5 wins."

### CPU behaviour
- No ball: go to the nearest loose ball unless a foe is within 150 px.
- With a ball: climb. Each step, aim at the nearest platform above within 170 px in the hole's direction, walk under it, jump. At the top platform, jump at the hole.
- focus(): a carrier within 400 px is the target; a rival at 4 is everyone's foe.
- Estimate: a trip is 6 to 8 s in low gravity; with three balls and four fighters about one dunk every 7 s; the winner at 5 comes at about 17 dunks in the worst case, near 2 minutes. Knob: TP.need (5).

### Build spec
- No new world: Sky Towers as built. One prop (the hole) and three ball objects in CONTEST state: `{ x, y, vx, vy, by:null|idx, back:frame }`. Do NOT put them in `items` (the item hunt, the timeout and the pool would all touch them); draw and step them from the rule.
- `TP = { need:5, balls:3, holeR:46, dunkR:60, pullR:260, pull:0.35, back:90, np:30, gang:4, climb:170 }`.
- Hooks: begin() (place the hole from the stage's highest platform, place balls with floorSafeX), step() (pick up, carry, dunk, pull, regrow), hit() (drop the ball), ko() (place the ball on the floor), hud(), badge(), focus(), want(), winText "<name> fed the hole 5!".
- Loose ball physics: gravity and floor/platform landing only; reuse the item landing helper if it works without `items`.

### How to test
- Play it: five dunks, win screen, pay.
- Check one jump from the top platform reaches the hole with every body size (measure, do not guess).
- CPU-only: watch that every CPU can get from the floor to the hole. Time three runs.
- Check a ball lost off the stage comes back on the floor.

### Risks
- BIGGEST: CPU climbing on Sky Towers is not proven. Cloudy's want() refuses anything higher than one jump. If CPUs cannot climb, move the hole down to one jump above the middle platform and put the balls at the two far ends; the contest still works but the name fits less.
- A hole near the top blast zone could cost stocks on the jump. Keep it well under the zone.
- "Any hit drops the ball" may make dunks rare with four fighters. If so, change to hits of 10% or more.
- The prop must not be confused with Black Hole the fighter. Draw it smaller, with a ring.

---

## 3. Clock: Fast Forward

- Source: invented. The gag is Clock as the timer: everybody gets a clock and has to run it out.
- Pitch: stand in the lit spot to run your clock down; first to zero wins.

### Rules
- Row: stage 'goiky', backdrop 'twopark', sides you / Clock / Ice Cube / Cake (as now), items 'on', smashBalls false, twist 'contest', contest 'clock', stocks 3. Everyone is fast all match, as now (shared note 3).
- Every fighter has a clock that starts at 40.0 s.
- THE LIGHT: a lit strip of floor 220 px wide and 140 px tall. Your clock runs only while you are in it and not in hitstun.
- Alone in the light, your clock runs at double speed (the fast forward). Shared, everyone in it runs at normal speed.
- The light moves every 12 s to another of five fixed floor spots, never the same twice. The next spot blinks for 2 s first.
- A clock never goes back up. A KO costs a stock only.
- Win: your clock reaches 0:00. No other timer.
- HUD: panel "FAST FORWARD", one clock per fighter (ss.t), gold when under 10 s, a ">>" mark while it runs double. A small clock over each head.
- Goal line: "Stand in the light to run out your clock"
- Pre-match words: "Clock's contest: your clock runs while you stand in the light. Alone, it runs double. First to zero wins."

### CPU behaviour
- want(): outside the light and no foe within 150 px -> walk to it. In the last 2 s before a move, walk to the blinking spot.
- Inside: fight as usual, but do not chase a foe more than 200 px out of the light.
- focus(): a rival under 10 s is everyone's foe.
- Estimate: four in the light at normal speed with fights knocking them out; if the leader is in it half the time, 40 s takes about 80 s; alone time shortens it. Paper estimate 60 to 100 s. Knob: CK.start (40).

### Build spec
- No new world. State: `CONTEST.zone = { x, w, until, next }`, clocks in f._ck (frames).
- `CK = { start:2400, w:220, h:140, move:720, tell:120, spots:5, alone:2, gang:600, leash:200 }`.
- Spots: five x values spread over the floor with floorSafeX, 110 px clear of each edge.
- Hooks: begin(), step() (move the light, run the clocks, check zero), hud(), badge(), focus(), want(), winText "<name> ran out the clock!".
- In hitstun: use whatever flag the brain already reads for hitstun; do not add one.
- Draw the light in world space under the fighters: a soft column and a clock hand on the floor that sweeps once per 12 s, so the hand shows when it will move.

### How to test
- Play it: run 40 s out, win screen, pay.
- Check alone = double, shared = normal, hitstun = stopped.
- CPU-only: time three runs; check they follow the light when it moves.
- Check the light never sits over a gap or off the floor.

### Risks
- With four CPUs always in the light, "alone" may never happen for them; it is then mostly a bonus for the human. That may be too easy. Do not fix it by tuning for the bots; change CK.alone for everyone instead.
- A brawl in a 220 px strip is crowded. Wider is the fix (CK.w).
- Items stay on here; a speed item on top of the fast twist does nothing. Check a heavy item does not decide it.
- This is the only one of the six with an invented source.

---

## 4. Pie: 500 Steps

- Source: the long stairs up Yoyle Mountain (BFDIA 5 / IDFB, as I remember it). Unchecked. The game's row already calls this match "500 Steps" at the Yoyle Fortress.
- Pitch: a race up a tall staircase; a good hit knocks you back down it.

### Rules
- Row: stage 'fortress' (for the sky and art), sides you / Pie / Remote / Bomby (as now), items 'throw', smashBalls false, twist 'contest', contest 'steps', stocks 1.
- Its own world: a shaft with two solid walls, a solid floor at the bottom, and 50 steps going up in a zigzag. Each step counts 10, so the top is 500.
- Steps are one-way ledges: jump up through, drop through with down. Each is one jump from the last.
- Damage never KOs here and nobody can fall out (Spleef's rule: percent stops at 300, walls hold everyone in). A hit only throws you, usually down the stairs.
- Throwables grow in on steps near the fighters, at most four at once. Nothing falls from above.
- Win: land on the top step (wide, gold, a pie on it).
- Timer: 3:00. If nobody is up by then, the highest fighter wins.
- HUD: Spleef's tall bar at the side with a dot per fighter, and your count "230 / 500".
- Goal line: "First to the top step wins"
- Pre-match words: "Pie's contest: race up 500 steps. Damage never KOs, but a hit knocks you back down. First to the top wins."

### CPU behaviour
- want(): no foe within 150 px, or the only foes are below -> walk under the next step and jump (jump when within 90 px across and on the ground).
- A foe on the same step or the one above: fight (the brain as it is).
- A throwable on its own step: pick it up (today's item hunt).
- focus(): the highest fighter within two steps is the target.
- Estimate: 50 jumps at about 0.8 s is 40 s with no fighting; with four fighters knocking each other down, paper estimate 90 to 130 s. Knob: SK.n (50; the label stays "500" by counting 500/n per step).

### Build spec
- stepsBuildWorld(), modelled on spleefBuildWorld (called from setupWorld the same way, behind `stepsWanted()` = event match, not in a net session, contest 'steps'). WW = W*1.4, walls as Spleef's (80 px, solid). Unlike Spleef keep a real floor: one FLOOR_SEGS span wall to wall.
- Steps: reuse STAIRK's sizes: rise 92, w 190, dx 230, h 14, top step w 260. Zigzag over four columns (0,1,2,3,2,1,0,...). Step i at y = floorY - (i+1)*92. All 50 exist from the start (no rising).
- `SK = { n:50, rise:92, w:190, dx:230, topW:260, pctCap:300, items:4, itemEvery:300, time:10800 }`.
- No-KO: reuse the switch Spleef uses for the two percent-cap KOs and the percent cap; make it read "SPLEEF or steps".
- Items: reuse the stairs twist's on-step rest (`it._stair`, stairsItemSpot) so a throwable sits on a step; choose a step within 3 of a random fighter.
- f._stN = the highest step stood on now (not the best ever): the bar shows where you are.
- Hooks: begin() (everyone on the floor, side by side), step() (track steps, items, win, timer), hud() (copy Spleef's bar, flipped so up is up), want(), focus(), winText "<name> climbed 500 steps!".
- Camera: follows you as in Spleef.

### How to test
- Play it: climb to the top, win screen, pay.
- Check every step can be reached from the one below by the lowest jumper in the roster of this match.
- Check a big launch cannot leave the shaft or cost the stock.
- CPU-only: time three runs; check it ends at the top, not on the timer.

### Risks
- It is a tall shaft like Spleef. The play is the opposite (up, race, first wins) but it will look related. If the owner wants it further apart, make it a wide staircase going sideways and up instead of a shaft.
- High percent with no KO means late hits throw very far: the leader can fall 20 steps. That may be fun or maddening. Knob: the percent cap.
- Four CPUs that all just climb may never fight. The "foe on the same step" rule has to win over climbing.
- The fortress stage's own hazards are not in this world; say so if the owner expects them.

---

## 5. Stapy: The Search Party

- Source: BFB 1 and 2: Foldy is lost and her team gets her back in the jawbreaker episode. Unchecked. The hide and seek itself is invented.
- Pitch: Foldy is hiding in the dark forest; find her three times.

### Rules
- Row: stage 'forest', sides you / Stapy / Liy / Match (as now), items 'off', smashBalls false, twist 'contest', contest 'search', stocks 3. The dark stays on (shared note 3).
- Eight hiding spots on the floor and the platforms, at least 300 px apart.
- Foldy (her sprite, small, not a fighter) hides at one. You only see her inside your own light (220 px, the dark twist's patch).
- Touch her (within 40 px): FOUND, +1. She is gone, and 1.5 s later she is hiding at another spot, never one of the two nearest the finder.
- Warmer: within 480 px of her, the edge of your light turns gold.
- LIGHTS OUT: a hit of 10% or more puts the victim's light out for 3 s (it shrinks to 60 px).
- A score never goes down. A KO costs a stock only.
- Win: 3 finds. No timer.
- HUD: panel "THE SEARCH PARTY", three slots per fighter. Pill "n/3" over heads.
- Goal line: "Find Foldy 3 times"
- Pre-match words: "Stapy's contest: Foldy hides in the dark. You see her only in your light. A hard hit puts a light out. Find her 3 times."

### CPU behaviour
- CPUs do NOT know where she is. Each keeps a shuffled list of the spots it has not checked this round and walks to the nearest.
- Within its own light radius of her (220 px, or 60 px with its light out) it sees her and goes straight for her.
- A foe within 150 px comes first, as ever.
- focus(): a rival at 2 finds is everyone's foe.
- Estimate: eight spots, four searchers: a find every 8 to 12 s; worst case 9 finds; paper estimate 70 to 110 s. Knob: SR.need (3) or SR.spots (8).

### Build spec
- No new world. State: `CONTEST.spots[]`, `CONTEST.at` (index), `CONTEST.back` (frame), f._sr (finds), f._srOut (light-out frame), f._srSeen[] (spots checked this round).
- `SR = { need:3, spots:8, apart:300, touch:40, see:220, dim:60, dimT:180, loose:10, warm:480, back:90, gang:2 }`.
- Spots: in begin(), sample the stage's floor and platforms (floorSafeX, worldPlats that are not hazards) and keep eight that are 300 px apart. If the forest gives fewer than six, stop and report; do not invent floating ones.
- Light: the dark twist draws a lit patch of DARKK.r round each fighter; read the radius through a function so a fighter with its light out gets 60. Draw Foldy only when inside the human's patch.
- Hooks: begin(), step() (touch, rehide), hit() (light out), hud(), badge(), focus(), want(), winText "<name> found Foldy!".
- Art: assets/sprites/foldy.png at about 0.6 size, a leaf puff when found.

### How to test
- Play it: find her three times, win screen, pay.
- Check she is not drawn outside your light, and never rehides next to the finder.
- CPU-only: check CPUs search (they must not walk straight to her from across the stage). Time three runs.
- Check the dark twist's own match elsewhere is unchanged.

### Risks
- The dark twist's words say nobody is hidden from the CPUs. Here CPUs must be blind to Foldy; that is new logic and the place a builder could quietly cheat. Check it by watching.
- The forest has Evil Leafy roaming. She may make searching miserable; the row could turn her off for this match. Owner's call.
- With her visible in only 220 px, a human could wander for a long time. The gold "warmer" edge is the help; if it is still slow, raise SR.warm.
- Foldy appears here as a prop in Stapy's match while also being her own event fighter. Fine in the show's terms; flag it in case the owner minds.

---

## 6. Foldy: Carried Off

- Source: the game's own note for her first match ("the wind carried her off"). I could not place the episode from memory, so treat the contest as invented.
- Pitch: the wind blows pages off a stack; catch twelve before they are carried off.

### Rules
- Row: stage 'yoyle' (its own low gravity), sides you / Foldy / Fries / Liy (as now), items 'off', smashBalls false, twist 'contest', contest 'pages', stocks 3. The gusts of her first match are on (shared note 3).
- A stack of paper stands on the floor in the middle.
- Every gust (about every 6 s) lifts four pages off the stack. They flutter downwind, up to 260 px above the floor, and are gone at the edge of the stage.
- Between gusts, one page every 2 s rises and hovers 120 px over the stack.
- Touch a page: +1.
- A hit of 10% or more knocks ONE page out of the victim; it flutters off downwind for anyone. Hits within 0.6 s are one attack, and the victim is then safe from this for 4 s (Cloudy's steal lesson).
- A KO puts three of your pages back at the stack (they rise from it).
- Pages never run out.
- Win: 12 pages. No timer.
- HUD: panel "CARRIED OFF", a count "n/12" and a bar per fighter. Pill over heads.
- Goal line: "Catch 12 pages"
- Pre-match words: "Foldy's contest: gusts blow pages off the stack. Catch 12. A hard hit knocks one out of you."

### CPU behaviour
- want(): the nearest page within 560 px and no higher than one jump (260 px here) -> go under it and jump. Never past the floor's edge (aiSafeStep).
- No page in reach and no foe within 150 px: drift back to the stack.
- focus(): a rival at 9 is everyone's foe.
- Estimate: about six pages a cycle of 6 s, some lost off the edge; the leader gets about two a cycle; paper estimate 60 to 100 s. Knob: PG.need (12).

### Build spec
- No new world. Pages are their own list in CONTEST (not `items`): `{ x, y, vx, ph, t0, np, npT }`. Motion: x += vx (2.2 px a frame in the gust's direction, 0.4 when calm), y = base - rise + 18*sin(ph), rise growing to a random 80 to 260 over 60 frames.
- `PG = { need:12, burst:4, calmEvery:120, hover:120, vx:2.2, maxUp:260, loose:10, combo:36, safe:240, koDrop:3, reach:560, gang:9, life:600 }`.
- Gusts: read the direction and timing from the GUSTS twist's own state (gustTwistStep); do not make a second wind clock.
- Hooks: begin() (place the stack with floorSafeX at the middle), step() (spawn, move, catch, cull), hit() (the one-page knock, with combo and safe as CONTEST_RULES.collection.hit), ko(), hud(), badge(), focus(), want(), winText "<name> caught 12 pages!".
- Art: a white page with a fold line, turning as it flies; the stack a short white pile.

### How to test
- Play it: catch 12, win screen, pay.
- Check a multi-hit move knocks out one page, not several.
- Check every page starts at the stack (none from above or from off-screen).
- CPU-only: time three runs; watch that no CPU runs off the edge after a page.

### Risks
- Pages fly sideways off the stage. That is not a sky drop, but it is things leaving the screen; if the owner counts that the same, make them settle on the floor at the stage's ends instead.
- Low gravity plus gusts already push airborne fighters; chasing pages in the air near an edge may cost stocks. That is the contest's tension, but watch it with CPUs.
- It is the nearest of the six to Cloudy's (pick things up, a hit knocks one out). The difference: one kind, moving targets, a plain count, no hold timer.
- Yoyleland's layout was not read in this job; the middle may not be floor. begin() must check.

---

## What a builder should do first

1. Shared notes 1 to 3 (winText/score, the words, the twist flags).
2. Build in this order, easiest first: Clock, Foldy, Stapy, 8-Ball, Black Hole, Pie (Pie needs a world; Black Hole needs CPU climbing).
3. Add each row to EVENT_MATCHES only when its rule exists (eventMatchReady refuses a contest with no rule, so a half-built one hides itself).

## Not done / not known

- No episode was checked against the wiki.
- No stage layout was read (Sky Towers, the forest, Yoyleland, Stone Pillars): spot positions are left to begin() with checks.
- MATCH_TWIST's setting and startEventMatch were not read.
- No time estimate was measured.
