# Why Expert CPUs run circles around each other

2026-10-29. Build fbc9009 (live main). Nothing in the game was changed. Every fix below was tried in memory, on a copy of the game's code inside the test harness.

The owner, watching Expert CPU-vs-CPU World Cups: "the cpus still run circles around each other, even if they are productive ones."

## The short answer

**What it is.** Two Expert CPUs leapfrog each other. One jumps. The other jumps up after it. They pass each other in the air, come down on opposite sides, turn round and do it again, about every half second.

- In an Expert 1v1 they swap sides **77 times a minute**, more than once a second.
- **45 of those swaps a minute lead to no hit at all.**
- The gap between them flips from closing to opening, or back, about **170 times a minute**: in, out, in, out.

**Why.** A rule meant for reaching a foe on another floor also fires on a foe that has only jumped.

- The CPU's "getting there" rule (ANOTHER LEVEL) treats any foe more than 80 px above it as up on another level.
- So the CPU stops fighting, walks to right under the foe, and jumps up after it.
- That jump puts *it* above the other CPU, which then does the same.
- On the way down, the twin rule for "a foe below" steers it onto the other's head.
- Neither rule ever attacks.
- **30% of all Expert CPU time** goes on this, and **85% of all their jumps** come from it.

Two smaller things add to it:

- **It runs under or over a foe it can't reach.** When the foe is out of reach only up or down, the CPU walks or drifts to right under or over it. Nothing slows a fighter in the air, so it sails on past.
- **Its hop-in gives up its aerial too early.** It checks 8 frames after the hop, while it is still about 60 px above the foe, finds the foe out of reach, and flies over.

**The fix.** Three small rule changes take out most of it, without making the CPU any faster:

- **F1:** chase a foe up or down only when it's on a *different floor* from you, or has stayed in the air over 1.5 s (a flyer). Don't chase a foe that jumped from your own floor.
- **F2:** don't walk or drift under or over a foe that is out of reach only up and down; hold your spot. In the air, drift back a little (one held press) so you come down in front of it.
- **F3:** a hop-in waits to throw its aerial until the foe is in reach on the way down, instead of giving up.

Over the same 24 matches:

| | now | with F1 + F2 + F3 |
|---|---|---|
| Side swaps a minute (not counting knock-backs and recoveries) | 61.7 | **27.5** (-55%) |
| Side swaps a minute with no hit after | 45.0 | **15.5** (-66%) |
| In-out flips a minute | 170 | **94** (-45%) |
| Hits a minute | 34.3 | **47.1** (+37%) |
| Seconds of neutral play per hit | 1.39 | **0.84** |
| Share of play in dry spells of 4 s or more | 29% | **3%** |
| Time spent chasing up and down | 30% | **11%** (now only after a foe whose floor is the platform, or the other way round) |
| Jumps a minute (both CPUs) | 68 | 34 |
| Hop-ins that actually throw their aerial | 12% | 36% |
| Average match length (3 stocks) | 2.6 min | 1.8 min |

F1 and F2 do almost all of the work. F3 makes the hop-in do what it was meant to do.

A fourth idea, **F4** (a cap on waiting out swings), made no difference and isn't needed.

**None of this makes the CPU faster.**

- It sees exactly as late as before (1/6 s).
- It presses through the same hand limit (7.5 inputs a second; the limit allows 9 in any 60 frames).
- With the limit on, the most inputs any CPU made in 60 frames stayed at 9, the same as now.
- With the fixes the CPUs make *fewer* inputs a second, because they stop jumping all the time.

## How this was measured

- **The real game, headless** (jsdom), under the cup's knockout rules: 1v1, 3 stocks, no timer, items off. Both CPUs on **Expert**. Each match was capped at 4 minutes; 1 match in 24 hit the cap.
- **Stage: Goiky Field.** It's a floor with a cliff at each end and **one wide platform in the middle**: 42% of the stage's width, about 150 px up. In the timelines the floor is at y 606 and the platform top at y 452. I also checked Stone Pillars (solid blocks) and Sky Towers (a big map); see further down.
- **8 pairs, 3 matches each, sides swapped in the middle one:** 24 matches, about 63 minutes of play.
  - Melee vs melee: Coiny vs Firey, Pen vs Match.
  - Melee vs zoner: Coiny vs Ruby, Tennis Ball vs Puffball.
  - World Cup finalists: Snowball vs Teardrop (#12), Blocky vs Pillow (#9), Leafy vs Bow (#10), Bow vs Knife (#14's semi).
- **Every frame was logged:** both fighters' places, the brain state each was in, which brain rule decided what, and the keys that actually went out after the hand limit.
- **Every fix was played on the same 24 seeds.** The game is deterministic: the baseline gave the same numbers every time it was run.
- **Words used below:**
  - *Side swap*: the two change order left to right. It counts once they are 10 px past each other.
  - *Neutral*: neither fighter is in hitstun, getting back to the stage, or KO'd.
  - *Flip*: their distance stops growing and starts shrinking, or the other way round, by at least 25 px, while they're within 250 px of each other.

## What the circling looks like, in numbers (now)

**Side swaps: 77 a minute.** By cause:

| Cause | Share | A minute |
|---|---|---|
| Over the top, in the up-and-down chase (ANOTHER LEVEL) | 35% | 27.4 |
| Over the top in an aerial string (mostly right after a chase jump) | 21% | 16.4 |
| Knocked past by a hit (productive) | 16% | 12.5 |
| Over the top while walking in through the air | 13% | 10.4 |
| Walking through each other on the ground | 5% | 3.7 |
| Getting back to the stage, or respawning | 4% | 3.1 |
| Over the top on a hop-in | 4% | 3.0 |
| Dashes | 0.3% | 0.2 |

So almost all of it happens **in the air, over the other fighter's head**. Walking through each other and dashing past hardly happen.

**Where the time goes** (both fighters, every frame):

| State | Share |
|---|---|
| Walking in (approach) | 32% |
| **Climbing to a foe "above"** | **20.5%** |
| In hitstun | 12% |
| **Dropping to a foe "below"** | **9.3%** |
| Aerial string | 6.3% |
| Ground string | 5.7% |
| Getting back to the stage | 3.5% |
| Wait | 2.8% |
| Waiting out a swing (Expert spacing) | 2.7% |
| Retreat | 1.3% |

**The climbing is almost never at a foe on the platform.** In 91% of the frames spent climbing, the foe it was climbing after was in the air when the CPU saw it.

**Jumps:** 68 a minute (both CPUs together). **85% of them are pressed by the climb rule.**

**Time between hits.** Half of all gaps are under 1.2 s, so the CPUs *do* hit each other. But 29% of all play sits in dry spells of 4 s or more. That's the "productive" circling: hits land in between long stretches of leapfrog.

**Hop-ins** (the Expert's hop forward for an aerial), 667 of them:

- 66% gave up the aerial before pressing it. The foe was out of reach up and down, a median 60 px below.
- Only 12% pressed the aerial at all.
- 31% ended in a side swap with no hit.
- 23% came while the other CPU was hopping in too, within half a second.

**Backing off, waiting and spacing:**

- Of 2,652 retreats, waits and wait-outs, 34% came to nothing: no hit either way within 1.5 s. Up to 9 came to nothing in a row.
- The Expert's "wait out the swing, then step in": after 1,562 waits, its punish landed 272 times and it got hit itself 296 times.
- So it's a real habit, but a small one: 2.7% of the time.

**Retreating through the foe.** The retreat that walks back toward the middle walked a CPU into its foe for only 302 frames in 63 minutes. Not a cause.

## What it looks like (the worst stretches)

How to read these:

- One row every 8 frames (about 1/8 s).
- x,y is the fighter's middle; lower y is higher up. The floor is y 606 and the platform top y 452, so all of this happens on and above the platform.
- "climb" and "drop" are the ANOTHER LEVEL rule; "approach" is walking in.
- Keys: L/R arrows, J jump.
- CROSS marks a side swap. A few frames between rows are left out, so not every swap shows a CROSS.

No hit lands in either stretch.

**Snowball vs Teardrop, 4 seconds: 11 side swaps, 22 flips, no attack pressed.** They take turns. One jumps; the other walks under it and jumps after it ("climb", R then J). The one coming down lands on the far side, turns, and does the same.

```
frame | A Snowball  doing      keys | B Teardrop  doing      keys | events
2920  |  521,374   approach   -    |  569,418   climb      J    |
2936  |  513,452   climb      R    |  554,332   drop       L    | CROSS
2944  |  561,421   climb      J    |  503,350   approach   -    |
2960  |  528,351   approach   L    |  522,452   climb      R    | CROSS
2984  |  501,452   climb      R    |  506,334   approach   L    | CROSS
3000  |  527,356   approach   L    |  463,445   approach   R    | CROSS
3008  |  477,356   approach   L    |  512,440   climb      J    |
3024  |  456,452   climb      R    |  509,335   approach   L    | CROSS
3032  |  505,431   climb      J    |  458,342   drop       -    |
3048  |  484,351   approach   L    |  463,452   climb      R    | CROSS
3064  |  441,430   approach   R    |  508,346   approach   L    | CROSS
3072  |  489,452   climb      R    |  461,333   approach   L    |
3088  |  491,352   approach   L    |  429,433   approach   R    | CROSS
3096  |  440,362   approach   L    |  479,429   climb      J    |
3112  |  397,452   climb      R    |  464,333   approach   L    | CROSS
3120  |  442,431   climb      J    |  413,346   drop       -    |
3136  |  421,351   approach   L    |  405,452   climb      R    | CROSS
3152  |  378,430   approach   R    |  450,346   approach   L    | CROSS
```

**Teardrop vs Snowball, another match, about 3 seconds of a 4-second stretch with 12 side swaps.** The one aerial thrown (8824) comes out at the air and misses.

```
frame | A Teardrop  doing      keys | B Snowball  doing      keys | events
8704  |  517,334   drop       -    |  478,431   climb      J    |
8712  |  549,368   approach   L    |  461,371   approach   R    |
8720  |  525,445   approach   L    |  499,351   approach   R    | CROSS
8744  |  514,332   approach   R    |  546,452   climb      L    |
8760  |  576,422   approach   L    |  498,363   approach   R    |
8768  |  533,452   climb      L    |  543,352   approach   R    | CROSS
8792  |  562,336   drop       R    |  539,452   climb      L    |
8808  |  583,452   approach   L    |  504,352   wait       -    |
8816  |  528,452   climb      L    |  498,362   wait       -    |
8824  |  480,390   approach   -    |  508,412   approach   -    | A aerial
8832  |  454,342   air-string R    |  520,452   approach   L    | A missed
8840  |  471,334   drop       R    |  487,452   climb      L    | CROSS
8856  |  562,445   approach   L    |  431,359   approach   -    |
8864  |  550,452   climb      L    |  431,354   approach   R    |
8872  |  496,452   climb      L    |  473,388   approach   R    | CROSS
```

## Why: the brain rules (artifacts/V1/index.html at fbc9009)

**1. ANOTHER LEVEL fires on a foe that has only jumped (lines 63778-63788). This is the main cause.**

- The two rules are `if(ady > 70 && dy < -80)` (climb, line 63779) and `if(ady > 70 && dy > 110)` (drop, line 63784).
- They read the guessed foe position (line 63678), which follows an airborne foe along its jump. So a foe near the top of an ordinary jump counts as "well above".
- The climb (`steerClimb`) walks to within 22 px of right under the foe, then jumps (lines 63457-63458). If the foe is over 150 px up and the special is ready, it also throws its up-special at it (line 63780).
- The drop, on a small stage, steers a CPU in the air toward the foe's x, so it comes down on top of it (lines 63784-63787).
- Both rules `return` before the fight code (brainFight), so a CPU doing either never attacks.
- It feeds itself: the climber's jump makes *it* the "foe above" for the other CPU.
- The rule sits in the "GETTING THERE: none of this is fighting" block. It was meant for a foe on a higher floor.

**2. The walk-in heads for the foe's exact x, even when the foe is out of reach only up and down (line 63995).**

- The rule is `else if(!inReach && adx > 6) brainWalk(...)`.
- "In reach" needs the foe within 44 px up or down (line 63617).
- So a foe in the air above gets walked right under, and a CPU in the air drifts right over its foe.

**3. Nothing slows a fighter in the air.**

- Friction only applies on the ground (line 43575).
- A CPU drifting at its foe keeps going after it lets go of the arrow, and sails past.
- A person drifts back to land in front; the CPU never does.

**4. The aerial string drifts until it is on top of the foe (line 64078).** It keeps pressing toward the foe until it's within 20 px across.

**5. The hop-in gives up its aerial too early (line 64039, then lines 64066-64067).**

- The aerial is checked 8 frames after the hop (`next:now + 8`). By then the CPU is about 60 px above the foe.
- The string's reach check (`!inReach && !brainInReach(f, t, 26)`) uses the same 44 px limit, so the string ends with nothing pressed.
- The CPU then carries on over the foe.

**6. Expert spacing (brainSpace, lines 64046-64056) is only a small part.** Its wait-then-punish ping-pong is real, but small.

**Not causes, in 1v1:**

- Re-targeting: a 1v1 has only one foe.
- The retreat's way back to the middle (lines 63981-63983): about 5 s an hour.
- Dashes: 0.3% of side swaps.

## The fixes, tried in memory

All of them keep the eyes and the hands exactly as they are:

- Eyes: CPU_HUMAN.react 10 frames (1/6 s).
- Hands: inputGap 8 (7.5 inputs a second).

They only change what the CPU decides to do with them.

**F1: "another level" means another floor** (lines 63778-63788).

- The CPU climbs or drops to a foe only in one of these cases:
  - the surface under the foe and the surface under the CPU differ by more than 40 px;
  - the foe has been in the air more than 1.5 s (a flyer);
  - either of them is over no surface at all (off the stage, or over a pit).
- It reads the foe where it *saw* it, so the 1/6 s delay still applies.
- It still climbs to a foe on the platform or a higher ledge, still drops to one below, and still goes after a flyer. It just stops jumping after every jump from its own floor.
- (`surfaceBelow` is the game's own "top of the first surface under x" helper, line 19966.)

```js
// just before "// Holding a foe":
B.tAir = (ts._isBoss || ts.onground) ? 0 : (B.tAir || 0) + 1;   // how long the foe has been in the air, as it saw it
// just before "// ANOTHER LEVEL":
const fT = ts._isBoss ? null : surfaceBelow(ts.x, ts.y + (ts.r || 24) - 6), fM = surfaceBelow(f.x, f.y + f.r - 6);
const onLevel = ts._isBoss || B.tAir > 90 || fT == null || fM == null || Math.abs(fT - fM) > 40;
if(ady > 70 && dy < -80 && onLevel){ ...climb, as now... }
if(ady > 70 && dy > 110 && onLevel){ ...drop, as now... }
```

I first tried a simpler F1: chase only a foe it saw *standing*, and drop only while standing itself.

- On Goiky it did as well (the "F1" columns below).
- On the big map it also stopped real ledge-to-ledge chasing: time spent climbing fell from 31% to 7%, against 17.5% with the floor version.
- On Goiky it also left twice as many side swaps around recoveries at the ledge: 9.7 a minute, against 4.5 with the floor version.
- So the floor version is the one to use.

**F2: hold your spot under or over a foe you can't reach, and fade back in the air** (line 63995).

- If the foe is out of reach only up and down, and already within reach across, the CPU stops walking at it. The foe comes down in front of it.
- In the air, it may still be carrying on toward a foe it is nearly on (within 150 px up or down). Then it holds the arrow away for 8 frames, at most once every 28 frames.
- That's one input through the same hands, and it comes down in front of the foe instead of past it.

```js
else if(!inReach && adx > 6 && !(ady >= 44 && adx < brainReach(f) + (t.r || 24)*0.5)) brainWalk(f, inp, toward, sp, t.x);
if(!f.onground && ady < 150 && adx < brainReach(f) + 40 && f.vx*toward > 1.5 && !(B.fadeT > now - 20)) B.fadeT = now + 8;
if(!f.onground && B.fadeT > now){ inp.left = toward > 0; inp.right = toward < 0; }
```

**F3: the hop-in commits to its aerial** (brainString, lines 64058-64079).

- While the hop is in the air and the foe is within its reach across (and within 130 px up or down), the string doesn't end for "out of reach".
- The aerial goes out as soon as the foe is in reach, usually on the way down.
- In the air, it drifts in only until the foe is at 60% of its reach, then fades back the same way as F2.
- The aerial is pressed through the same hands, so it is no quicker.

```js
const hopWait = S.move === 'air' && S.n === 0 && !f.onground && !inReach && Math.abs(t.x - f.x) < brainReach(f) + 50 && Math.abs(t.y - f.y) < 130;
if(now >= S.next && !hopWait){ ...the press, as now... }
```

The full brainString for F3 is in variants.mjs, listed under Files.

**F4: a cap on waiting out swings** (brainSpace, line 64047). After two wait-outs in a row with no damage either way, the CPU goes in through the next swing.

### Results (24 matches each, the same seeds)

In this table "F1" is the simple first version (a foe seen standing). The last column is the recommended set, with the floor version of F1.

| | now | F1 | F2 | F3 | F4 | F1+F2 | F1+F2+F3 | **F1 (floor) + F2 + F3** |
|---|---|---|---|---|---|---|---|---|
| Side swaps / min (not counting knock-backs, recoveries) | 61.7 | 41.5 | 46.1 | 59.0 | 61.4 | 27.8 | 26.9 | **27.5** |
| Side swaps with no hit after / min | 45.0 | 29.1 | 31.7 | 42.9 | 45.2 | 17.6 | 17.3 | **15.5** |
| Flips / neutral min | 170 | 143 | 137 | 165 | 170 | 99 | 98 | **94** |
| Hits / min | 34.3 | 43.9 | 36.2 | 34.4 | 33.2 | 46.1 | 47.4 | **47.1** |
| Seconds of neutral per hit | 1.39 | 0.91 | 1.24 | 1.38 | 1.41 | 0.86 | 0.83 | **0.84** |
| Play in 4 s+ dry spells | 29% | 6% | 22% | 30% | 30% | 7% | 4% | **3%** |
| Time chasing up and down | 30% | 3.6% | 30% | 29% | 30% | 3.5% | 3.0% | **11%** |
| Jumps / min | 68 | 33 | 63 | 68 | 68 | 33 | 33 | **34** |
| Hop-ins that throw their aerial | 12% | 10% | 17% | 36% | 12% | 10% | 37% | **36%** |
| Hop-in fly-overs / min | 3.0 | 5.7 | 2.1 | 0.6 | 3.8 | 2.9 | 0.6 | **0.3** |
| Back-offs, waits, wait-outs that came to nothing | 34% | 15% | 32% | 37% | 33% | 13% | 13% | **12%** |
| Match length (min) | 2.64 | 1.97 | 2.71 | 2.51 | 2.68 | 1.98 | 1.71 | **1.84** |
| Falls with no hit in the 4 s before (of ~110) | 1 | 3 | 1 | 0 | 1 | 1 | 0 | **1** |
| Inputs a second, hands limited | 3.9 | n/a | 4.1 | 3.9 | n/a | 3.5 | 3.5 | **3.6** |
| Most inputs in any 60 frames, hands limited (limit 9) | 9 | n/a | 9 | 9 | n/a | 8 | 9 | **9** |

All four fixes together gave the same numbers as F1+F2+F3: F4 adds nothing. "n/a": the first runs of F1 and F4 counted inputs a different way, so their numbers aren't comparable.

**Every one of the 8 pairs gets better with the recommended set.** In every pair, side swaps (not counting knock-backs and recoveries) fall by half or more, and hits a minute rise by 21-51%.

| Pair | Side swaps / min: now → fixed | Hits / min: now → fixed |
|---|---|---|
| Coiny vs Firey | 65.9 → 26.0 | 33.0 → 49.2 |
| Snowball vs Teardrop | 70.2 → 31.3 | 32.1 → 47.9 |
| Blocky vs Pillow | 55.7 → 27.8 | 30.4 → 41.2 |
| Leafy vs Bow | 75.0 → 36.3 | 27.2 → 41.1 |
| Bow vs Knife | 61.6 → 28.2 | 31.9 → 43.1 |
| Pen vs Match | 52.8 → 23.1 | 40.1 → 52.4 |
| Coiny vs Ruby | 53.5 → 23.8 | 41.0 → 49.6 |
| Tennis Ball vs Puffball | 51.0 → 21.7 | 41.3 → 52.9 |

**What each fix does:**

- **F1 is the big one.** On its own it takes out a third of the side swaps, halves the jumps, and gives 28% more hits.
- **F2 on its own helps less:** 25% fewer side swaps and 6% more hits, because the climb rule overrides it most of the time. Together with F1 it doubles the effect. Once the CPUs stop jumping after each other, holding the spot and fading back stops them sailing over each other.
- **F3 does what it says.** Three times as many hop-ins throw their aerial (12% to 36%), and hop-in fly-overs all but stop. Alone, it hardly changes the circling.
- **F4 changed nothing measurable.** The spacing habit isn't what makes the circling.

**I also tried a twitchier fade-back:** press away on every frame the CPU is still drifting in.

- It did a bit better on paper: 23.8 side swaps a minute with F1.
- But when the foe was far below, the CPU's hands weren't limited, and it then flicked the arrows up to 36 times in 60 frames.
- No person could do that, so I dropped it for the held press above.
- With the held press, the most a CPU did with free hands was 10 in 60 frames (17 now).

**On other stages** (16 matches each, both sides, capped at 3 minutes; now → the recommended set):

| Stage | Side swaps / min (not counting knock-backs, recoveries) | Hits / min | Matches that hit the cap | Falls with no hit before |
|---|---|---|---|---|
| Stone Pillars (solid blocks) | 63.7 → 39.6 | 31.3 → 42.3 | 2 → 0 | 0 of 72 → 0 of 71 |
| Sky Towers (big map, real ledges) | 49.7 → 23.3 | 23.3 → 32.1 | 12 → 8 | 4 of 42 → 8 of 60 |

On Sky Towers the CPUs still climb to a foe standing on another ledge: 17.5% of their time, against 31% now.

## Still human, still imperfect

**The eyes and hands are untouched.** Same 1/6 s late view, same 7.5 inputs a second, same 4-7 frames to decide, same gaps in a string.

- With the hand limit on, the most inputs any CPU made in 60 frames was 9, with or without the fixes.
- Its average went from 3.9 to 3.6 inputs a second.
- The fade-back is one held arrow, the kind of thing a person does.

**It keeps its mistakes.**

- 72% of its attack presses still miss (79% now).
- It still hops in as often (25% of the chances), still hesitates, still waits out swings, and still guesses a counter on a swing it sees.
- It still falls for the bait from the cup notes: a slow swing at the edge of your reach, then hit it as it steps in.

**It doesn't get better at anything a player would mind.** It wins neutral sooner mostly because it stops wasting time in the air. A player facing it sees a CPU that waits under a jumping foe instead of jumping after it. That's what people do.

## Things to know before shipping

- **Matches get shorter:** about 1.8 minutes for 3 stocks, against 2.6, because hits come faster. Cup finals will be quicker.
- **Who wins can shift.**
  - Three matches per pair is far too few to call matchups, but some moved.
  - Bow beat Leafy 2-1 with the fixes; now she loses 0-2 with a draw.
  - Bow took a game off Knife (0-3 now), and Coiny took one off Ruby (0-3 now).
  - If the fixes go in, a balance re-check (the usual 1v1 run) should follow.
- **Self-destructs.**
  - On Goiky: 0-3 out of about 110 falls in every variant.
  - On Sky Towers: 8 of 60 falls with the fixes, against 4 of 42 now. More falls overall because more fighting happens there, but a slightly higher share with no hit just before. Too few to be sure. Worth a look on the big maps if the fixes go in.
- **What's left of the side swaps is mostly productive.** About 13 a minute are knock-backs and 4.5 are recoveries over a foe's head at the ledge. About 10 a minute are still over the top in an aerial string, 6 while walking in through the air, and 6 in a real up-and-down chase to a foe on the platform.
- **Bow's tower is a real level.** When Bow stands on it, a foe on the floor still climbs at her, and sometimes can't get up there. F1 leaves that alone.
- **The bot-fixes branch** (g-bot-fixes, diff from 3e39cf3) doesn't touch any of these lines. It does change the hop-in line (64039) for its ledge check, but F3 changes brainString, not that line, so the two fit together.

## Files

Scripts and raw results are in C:\Users\carad\AppData\Local\Temp\claude\C--Users-carad--claude\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\circling\

- circ.mjs: the match runner. It adds the measurement tags and applies the fixes as text replacements in memory.
- variants.mjs: the fixes, as code. The recommended set is `g123`: F1b (the floor version), F2 and F3.
- analyse.mjs: the measurements.
- agg.mjs: the tables.
- res-*.jsonl: one line per match.
