# Why CPUs recover so high, and three human-like fixes

2026-11-02. Live build ii-dlc e5c52b2 (read only: nothing in the game was changed; the three options were run as in-memory source patches of a scratch copy, never in the repo).

The owner: "it is hard to ledgeguard, because cpus always go so high, i would never be able to hit them."

## The short answer

**The owner is right, and it is not bad luck: it is how the recovery is written.** The CPU's recovery has a sideways goal (a point 30 px inside the ledge) and no height goal at all, and it spends its jump and up-special by a height rule that does not look at how far the ledge is. So it arrives over the ledge at the top of an arc, the same way every time, and never reads who is standing there.

Headline numbers (Goiky Field, 168 real launches per level, nobody near the ledge):

| | Easy | Normal | Hard | Expert |
|---|---|---|---|---|
| Median highest point above the stage top | 286 px | 320 px | 324 px | 189 px |
| Free off-stage frames spent **inside the guard zone** (within 160 px of the ledge, up to 130 px above it) | 13% | 10% | 11% | 24% |
| ... spent **above 130 px** (out of reach) | 71% | 77% | 78% | 54% |
| ... spent below the ledge line | 3% | 1% | 1% | 0% |
| Time in the zone per recovery | 0.15 s | 0.12 s | 0.12 s | 0.24 s |
| Recoveries where a standing jab could reach on some frame | 11% | 7% | 11% | 14% |
| ... where it could reach for 8 frames in a row | 5% | 0% | 1% | 1% |
| ... where a jumping defender could in theory reach (upper bound) | 35% | 31% | 32% | 73% |
| Live defender who presses the jab the first frame it reaches, but 8 frames (0.13 s) late | 9% | 5% | 8% | 4% |
| Same defender, frame-perfect (0 frames late) | 35% | 36% | 35% | 29% |
| Return: lands on top / grabs the ledge / is KO'd | 96 / 1 / 2% | 96 / 1 / 3% | 96 / 2 / 1% | 99 / 1 / 0% |

So a normal-reaction defender hits about 1 recovery in 14 today, and even a frame-perfect one hits about 1 in 3. Easy, Normal and Hard are the worst: they go higher than Expert (they throw the jump and up-special away at the top of the arc).

## 1. What the CPU does now (artifacts/V1/index.html, line numbers of the live file)

- **brainRecover (72720-72764)** runs first in aiThink (72551; also 72516 when no foe is visible). It only runs when the CPU is off a side, falling out of the bottom, or (on a stage with real edges) over a drop. It forgets any press waiting for the hands, and then:
  - rolls the *recMiss* slip once per trip (72736; BRAIN_LV `recMiss` 0.35 / 0.2 / 0.1 / 0.04 by level): `late` (nothing pressed for one reaction: CPU_HUMAN.react 30 / 20 / 10 / 10 frames, 72743), `drift` (no steering for 22 frames), or `early` (jump and up-special thrown away in the first 24 frames, 72744);
  - steers left or right toward **edgeGoal** (below) at full stick, every frame (72738-72739);
  - Bow recovers through aiBowRecover (72740); a wall beside it is kicked off (72749);
  - **spends its moves** with a height rule only: Easy, Normal and Hard: the moment it is falling (`vy > 0.5`), or more than 30 px under the ledge line, press jump, and when the jumps are gone, up-special (72759-72762). That is the top of the launch arc, wherever that is. Expert (`recSmart`, BRAIN_LV row 4, 72751-72758): drift back first, and press only once it is falling and its feet, 6 frames on, would be lower than 20 px above the ledge line (the same jump, then the up-special).
- **edgeGoal (72767-72775)**: the floor span nearest where its speed is taking it, clamped to **30 px inside the span's end**. No height, no look at the cliff face, no look at the foe. Once it is over the stage it is no longer "off", brainRecover returns false and the fight code takes over (in the air it carries on toward its target, which is why a CPU with the foe far inside lands about 240 px in, and with the foe at the ledge lands 60-90 px in).
- **The ledge catch is not a hang** (cliffWalls 21228-21243, LEDGE_CATCH 30 at 16553): moving into a cliff face with the feet 0-30 px under the top, not in hitstun, not rising fast, puts the fighter up on the ledge with both jumps and the up-special back. A CPU aimed 30 px inside the ledge never moves into the face, so it almost never gets this (1-2% on Goiky Field, 5-10% in a pit).
- **brainLedge (72779-72797)** only stops a CPU on its feet from walking off. **brainDashEdge (73432)** is the dash and leap edge sense (BRAIN_LV `edge`). `brainAirEdge` and `pitSoftGoal` are not in this build: edgeGoal above is the whole recovery goal.
- **The moves' real lift**: GRAV 0.62, JUMP -12.5 (23121): one jump rises about 126 px; most up-specials about 130-170 (UPSPEC rows from 48889: hop power -11 to -17, warp 110-170 px, some with a jump back); the stat `rec` (recK / recV, 21252-21258) gives 17 fighters 10-25% more lift while off the stage (Snowball, Golf Ball, Gaty, TV, Spikey, Sidewalky, Spongy 1.25; Blocky, Coiny, Nickel, Bell, Test Tube, Bomb, Baseball 1.2; Yellow Face, 8-Ball 1.15; Cloudy 1.1). Two jumps and an up-special are about 390 px of lift in the bank.
- **The hands in a recovery**: the engine passes the keys through cpuHumanKeys (45966) with `fight` = a foe within 450 px (CPU_HUMAN.fightReach, 73714). With the owner standing at the ledge that is true, so presses are paced (inputGap 20 / 12 / 10 / 8 frames, a burst of 2). With nobody near, the recovery's keys go through as they are.
- **The eyes**: aiThink runs on a delayed view of every foe (cpuSeeBegin, react frames), so anything read about the foe is what the CPU saw a moment ago.
- **A defender is never read by the recovery**: brainRecover does not look at f.aiTarget or at any other fighter.

## 2. What was measured

- The real game, headless (jsdom), the live build, one boot per fighter. Harness: scratchpad cpu-recovery (matrix.mjs, scene.mjs, variants.mjs; checked: a re-run of one fighter reproduced the stored results line for line).
- **12 fighters**: Needle, Firey, Snowball, Baseball (vertical hops), Tree (heavy, plunge), Puffball and Balloon (floaty), Leafy (diagonal warp), Lightning (teleport), Tea Kettle (a hop that pushes sideways), Clock (default hop), Bow (no lift: recovers with her neutral special). All four levels.
- **Stages**: Goiky Field (one floor, open sides) and Grand Plains, a scrolling stage, whose ledge is the edge of a 317 px pit between two plateaus (the outer sides of its map run to the world's edge, so there is no open-side ledge there).
- **Launches**: seven real hits (applyHit from a defender standing on the ledge; knockback x, y and the victim's percent: H1 9 / -8 / 0%, H2 12 / -5 / 60%, H3 9 / -8 / 60%, H4 7 / -12 / 60%, H5 11 / 2 / 60%, H6 9 / 4 / 70%, H7 10 / -3 / 90%), 2 seeds each, so 168 recoveries per level per stage per condition. Where the CPU first has control back (Needle; height above the ledge line, px past the ledge): H1 (35, 81), H2 (113, 317), H3 (202, 235), H4 (322, 179), H5 (-101, 295), H6 (-170, 265), H7 (90, 348). Real hits rarely leave a fighter below the ledge line when control returns (only H5 and H6 do), so the brief's "0-250 px below" is the minority case here.
- **Every frame while the CPU is free** (out of hitstun, until it lands): height of the feet above the ledge line, distance past the nearest ledge, keys pressed, jump and up-special use, and what a defender could reach.
- **Guard zone**: within 160 px of a ledge and feet between 40 px under and 130 px over the ledge line. For reference, the game's own plain jab (jabFan, 64658) is a fan of radius body+26 px (50 px from the middle for a plain fighter) from 31 degrees above to 26 degrees below straight ahead, so a standing jab reaches only about 35 px above the defender's middle line: the 130 px zone is generous. A jumping defender is the upper bound (a defender anywhere from 0 to 126 px up).
- **Defender conditions**: (far) nobody near, the hypothetical defender 20 px in from the ledge, facing out; (ledge, live) Pin stands 20 px in from the ledge and presses a real jab on the first frame it reaches the CPU, after 0 or 8 frames of reaction, one swing every 20 frames. Grand Plains: the live defender guards the ledge the launch came from, or (dd8g) the far side of the pit.

Per fighter (Goiky Field, nobody near; median highest point above the stage top / share of free frames in the zone):

| Fighter (recovery kind) | Hard | Expert |
|---|---|---|
| Balloon (floaty, hop with a jump back) | 489 / 3% | 165 / 25% |
| Puffball (floaty, flight) | 407 / 9% | 183 / 23% |
| Leafy (diagonal warp) | 505 / 5% | 258 / 21% |
| Lightning (teleport) | 487 / 7% | 214 / 16% |
| Needle (hop) | 490 / 12% | 211 / 19% |
| Firey (spin) | 481 / 9% | 193 / 19% |
| Clock (default hop) | 392 / 11% | 193 / 26% |
| Baseball (heavy hop) | 377 / 9% | 206 / 28% |
| Snowball (hop, rec 1.25) | 310 / 13% | 167 / 34% |
| Tea Kettle (hop with a push) | 296 / 13% | 190 / 31% |
| Tree (heavy plunge) | 255 / 35% | 187 / 43% |
| Bow (no lift, neutral special) | 136 / 25% | 136 / 26% |

By launch (all levels): H1 apex 159 / zone 52% (a low knock: they are in reach); H2 310 / 8%; H3 383 / 8%; H4 537 / 3%; H7 380 / 7%; H5 and H6 (control back below the line): 0 / 20-31%.

Grand Plains pit (nobody near): median highest point 265 / 265 / 303 / 164 (Easy to Expert); zone 22 / 21 / 22 / 42%; above 130 px 69 / 71 / 72 / 54%; return: 83-93% on top, 5-10% ledge catch, 1-8% KO. The same shape as Goiky Field, a little lower because the pit is narrow. In the stage-wide free-for-all run (4 CPUs, base build, one match per level) 88% of free off-stage frames were above 130 px and 6% inside the zone.

## 3. Why they go so high

All of these apply; the first two are the big ones.

1. **The first moves are spent at the top of the arc (Easy, Normal, Hard).** The jump is pressed at a median 78 px above the ledge line (the feet are above the line in about 80% of those jumps, and above 130 px in one in three) and at a median 163-181 px out from the ledge; the up-special is used in about 30% of trips, at a median 270-300 px above the line (a 136 px boost thrown in 300 px up). 89% of the frames above 130 px come after the first jump press; only 11% are the launch alone (before any move / after the jump / after the up-special: 11 / 66 / 23% at Hard). Against the same launch with the CPU's keys off, the three levels peak 200-240 px higher on the launches that carry them over the ledge (H2, H3, H7) and 120 px higher on H4; Expert peaks where the launch alone does (added 0 px). Example, Hard Needle on H3: control back at 224 px up, first jump at 322 px, second jump at 488 px, highest 594 px above the stage top, and still 214 px up when it is 324 px inside the ledge.
2. **Expert's "wait until sinking" rule has no idea how far away the ledge is.** It presses once it is falling and its feet, 6 frames on, would be lower than 20 px above the ledge line. At a fall speed of 5 px a frame that is anything under 50 px up, at 15 px a frame anything under 110 px up. Measured: Expert's jump goes out at a median 49 px above the line (80% of its jumps with the feet above the line) and a median **193 px out from the ledge** (59% of them 100 px or more out). The 126 px rise then peaks over the ledge column. Example, Expert Needle on H3: jump at 122 px up and 32 px out, highest point 251 px.
3. **The goal is 30 px inside the ledge and has no height.** Nothing steers it to the cliff face or the 30 px band under the top where the ledge catch works (1% catch on Goiky Field). It lands on top 96-99% of the time.
4. **It never looks at who is at the ledge.** brainRecover reads no foe, so a guard at the ledge changes nothing (recovery heights with a live guard 274 / 320 / 345 / 190 against 286 / 320 / 324 / 189 without).
5. **The same path every time.** Two seeds of the same fighter, level and launch peak within 15 px of each other in 80% of cases and end the same way in 96%. The only variety is the recMiss slip (35 / 20 / 10 / 4% a trip), and it makes the CPU worse, not different.
6. **The levels are the wrong way round for height.** The best level (Expert) comes back lowest (189 px) and the middle levels highest (324 px): the "smart" rule is the only one that waits.
7. **A launch that sends a fighter high is high before the CPU does anything.** The same launches with no CPU keys peak at a median 136 (H1), 193 (H2), 229 (H3), 433 (H4), 193 (H7). For Expert that is nearly all of it (36% of its frames above 130 px are before any move). Nothing in a recovery can bring that down; only what the CPU adds on top can, which is why no option gets the zone share above 40-50% by level.

The fighters' abilities set how high the stack goes (Balloon, Leafy and Lightning highest at Hard, Tree and Bow lowest, the stat `rec` and the up-special's lift in the list above) but every fighter shows the same pattern and the same order of the levels. The hands are not a cause: the heights were the same with the foe within 450 px, where the hands are paced, as with nobody near (286 / 320 / 324 / 189 and 274 / 320 / 345 / 190).

**What a good human does instead**: mixes low, ledge-hugging recoveries with high ones; looks at the defender and takes the other path (a defender at the ledge means over the top or from below, a defender off stage means the ledge); spends the jump late and low, near the ledge, so the arc peaks at the ledge and not 300 px over it; aims at the cliff face to use the catch; and sometimes gets hit.

## 4. Three options (scratch prototypes; each keeps every fighter's real recovery moves and every level's meaning)

All three share the same scaffolding (full code at the end of this file):

- **New block before brainRecover (insert before line 72720):** `recPath(f, inp, B, goal, held, E)` plus four helpers: `recEdgeOf` (the ledge it heads for), `recGuarder` (a foe standing at that ledge, or just above it within 220 px in, from what the CPU saw; and whether that foe is swinging), `recChaser` (a foe in the air over the drop that came out after it), `recSpend` (jump, then up-special: the same press brainRecover makes).
- **One new branch in brainRecover's chain (between line 72750 and 72751):** `} else if(goal && recPath(f, inp, B, goal, held, E)){ }`. The `late`, `early` and `drift` slips, Bow's recovery and the wall kick still come first. recPath returns false for the path "own", which falls through to today's code (Easy-Hard jump at the top, Expert sinking).
- **Paths a trip can take** (chosen once as the trip starts, by level):
  - `hug` (low and fast): head to the ledge column, easing off the stick on arrival, spend the jump or up-special only when sinking to 6 px under the ledge line (and not at all if the fall would still end above the catch height). It arrives at ledge height.
  - `below` (from underneath): hold off the cliff face 58 px out while falling to 50 px under the top, then go up the face leaning in.
  - `mid` (option C only): spend the move when sinking to 80 px above the ledge line.
  - `own`: today's way.
- **Chances by level** (new rows in the same style as the bot fixes: rolled once, more of it the higher the level; placeholders, not tuned to a target): look at who is at the ledge 30 / 55 / 80 / 95%; take the ledge first when nothing stops it 30 / 50 / 70 / 90%; respect a guard it has seen 20 / 40 / 60 / 75%. No BRAIN_LV or CPU_HUMAN number was changed.
- **Information used** (human only): where the foe stands and whether it is swinging, both from the delayed view; nothing about its keys or its kit.

**Option A, ledge first.** The chooser: if it looked and saw a guard, respect it by level (go the old high way); otherwise take `hug` by level, else the old way. Human terms: "go straight for the ledge, but go over if someone is standing there".
**Option B, read the defender.** A foe out in the air after it: the old way. A guard at the ledge: respect it by level, and then half `below`, half `own`; if it does not respect it, `hug` 4 times in 5, else `below`. Nobody there: `hug` by level, else `own`. Human terms: "a defender at the ledge makes it go over or from underneath; with nobody there it takes the ledge". With nobody at the ledge B is exactly A (the two tables below agree digit for digit).
**Option C, a mixup.** No reading at all: 35% `hug`, 30% `mid`, 35% `own`, by die roll. Human terms: "a person who simply varies the way back".

### Measured (Goiky Field, 672 recoveries per row; all levels together unless stated)

Nobody near the ledge (A is B):

| | Now | A / B | C |
|---|---|---|---|
| Median highest point | 255 px | 159 px | 193 px |
| Free frames in the guard zone | 14% | **29%** | 25% |
| ... above 130 px | 71% | 52% | 56% |
| A standing jab could reach (some frame) | 11% | **38%** | 27% |
| ... for 8 frames in a row | 2% | 8% | 6% |
| A jumping defender could reach (upper bound) | 43% | 61% | 66% |
| Fail to get back (KO) | 2% | 2% | 2% |
| Lands on top / grabs the ledge | 97 / 1% | 98 / 1% | 97 / 1% |

By level, nobody near (zone / above 130 / jab could reach): Easy 13 / 71 / 11 now, A 22 / 61 / 24; Normal 10 / 77 / 7 now, A 26 / 57 / 34; Hard 11 / 78 / 11 now, A 32 / 48 / 43; Expert 24 / 54 / 14 now, A 39 / 40 / 52. Highest point by level now 286 / 320 / 324 / 189, with A 199 / 186 / 156 / 149: the levels now go in order (a better level comes back lower and safer).

A defender standing at the ledge (live Pin), all levels:

| | Now | A | B | C |
|---|---|---|---|---|
| Free frames in the guard zone | 19% | 27% | **34%** | 30% |
| ... above 130 px | 69% | 55% | 44% | 52% |
| A standing jab could reach (some frame) | 36% | 43% | **51%** | 47% |
| Late jab (8 frames) lands on a recovery | 7% | 11% | **16%** | 11% |
| Frame-perfect jab lands | 34% | 43% | **52%** | 45% |
| Fail to get back (includes the live hits) | 8% | 9% | 12% | 11% |

By level for B, late jab lands: Easy 18%, Normal 14%, Hard 16%, Expert 14% (now 9 / 5 / 8 / 4%). Fail to get back with a live guard now 16 / 8 / 7 / 3% by level, B 27 / 10 / 8 / 4%: the order of the levels holds, and the extra KOs are the ledge guard hitting, which is the point.

Grand Plains pit, all levels. Nobody near: zone 25% now, A/B 38%, C 34%; above 130 px 67% now, A/B 56%, C 60%; jab could reach 37% now, A/B 50%, C 45%; KO 5% now, A/B 4%, C 3%. Live guard on the launch ledge: late jab lands 1% now, A 2%, B 5%, C 3% (the CPU mostly comes back on the other side of the pit). Live guard on the far side: 11% now, A 16%, B 19%, C 15%.

### Match flow (Goiky Field, 4 CPUs of mixed fighters, 2 stocks, 2 minute cap, 4 matches per level and option, 16 per option; Grand Plains was too slow to run (24 s a match) and its base-only check is above)

| | Now | A | B | C |
|---|---|---|---|---|
| Falls per match (7 ends it) | 6.1 | 6.6 | 6.9 | 6.7 |
| Matches that ended inside the cap | 63% | 63% | 88% | 75% |
| Fewest falls in any match | 3 | 5 | 6 | 5 |
| Off-stage trips per match | 44 | 46 | 45 | 41 |
| Trips that got back | 89% | 88% | 87% | 87% |
| KO per trip | 0.069 | 0.070 | 0.069 | 0.079 |

No stalemates, no collapse in falls, and no option made recovering worse in the matches. Only 4 matches a cell, so read this as "nothing broke", not as a ranking.

### Risks (all three)

- They apply to every level, so Easy and Normal CPUs also hug the ledge now and then (30% and 50% when unguarded). Measured: no change in how often they get back with nobody near (KO 2%), more KOs only when someone is actually hitting them.
- CPUs edge-guard each other (BRAIN_LV `eg`): a CPU-versus-CPU match may see more recovery KOs. Measured in the free-for-alls: KO per trip flat (0.069 to 0.079).
- The chances (look, ledge, respect) are placeholders by level, like the bot-fix rows; the builder should set them from the same human reasoning (a better player notices more), not to reach a number.
- Fighters with their own recovery hooks (Bow, Eraser's flip, Black Hole's wormhole, Cloudy) keep them: recPath only presses the generic jump and up-special, which those kits already gate in brainOut.
- The launch itself (a fighter hit high stays high for 30-40 frames) is not touched by any option; the zone share rises from 14% to 25-40% by level, it does not reach 100%.
- Option B's `below` path comes up the cliff face where a standing jab at the ledge can reach: it is a real risk for the CPU, as it is for a person.

## 5. Files and what is not covered

- Scratchpad `C:\Users\carad\AppData\Local\Temp\claude\C--Users-carad--claude\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\cpu-recovery\`: scene.mjs (the recorder), matrix.mjs (the runner), variants.mjs (the three prototypes), launches.mjs, an.mjs, cmp.mjs, causes.mjs, ctl.mjs, ffa.mjs, ffa-an.mjs, trace.mjs, recpath_block.js (the prototype block below), out\*.jsonl (the results: base_*, A_*, B_*, C_*, baseL_* are the launch-only controls, ffa_*).
- Not covered: Yoyleland (the earlier ledgeguard-test found the same shape there), the other scrolling stages, teams and Capture the Flag (real edges are off there), a real person's mixing of jump and aerial (the "upper bound" row is only that), and CPU versus CPU edge-guarding at a bigger sample.
- The shorter recoveries for everyone, which the owner also picked (ledgeguard-owner-picks.md), would be a mechanic for every fighter including the player; this study is only about the CPU's way of recovering. Measured here: at Easy-Hard the CPU's own moves add 200-240 px to the arc, so capping the lift would help those levels most.

## 6. Appendix: the prototype block (inserted before brainRecover; MODE is 'A', 'B' or 'C')

```js
// ===== STUDY PROTOTYPE (scratch only): a recovery that chooses its PATH =====
// MODE: 'A' ledge first (over only when the ledge is guarded and swinging), 'B' reads the defender (low-fast / over / from below), 'C' a mixup (no reading)
const REC_MODE = '__MODE__';
const REC_READ = [0.3, 0.55, 0.8, 0.95];   // LOOK: the chance, by level, that it notices who is at the ledge (once a trip): a person looks, or does not
const REC_LEDGE = [0.3, 0.5, 0.7, 0.9];    // LEDGE: the chance, by level, that a trip goes for the ledge first when nothing stops it (else the level's own way, as now)
const REC_RESPECT = [0.2, 0.4, 0.6, 0.75]; // RESPECT: the chance, by level, that a foe it has seen at the ledge sends it over the top instead
function recEdgeOf(f, goal){   // the span end it is heading for: { x, inl } (inl: +1 when the stage lies to the right of x)
  let best = null, bd = Infinity;
  for(const q of FLOOR_SEGS){
    if(goal.x < q.x0 - 1 || goal.x > q.x1 + 1) continue;
    for(const c of [[q.x0, 1], [q.x1, -1]]){ const d = Math.abs(f.x - c[0]); if(d < bd){ bd = d; best = { x:c[0], inl:c[1] }; } }
  }
  return best;
}
// who is at that ledge, as the CPU sees it (late: the foes are swapped back to what it saw): a foe on its feet, or just above, within 220 px in from the edge
function recGuarder(f, e){
  const gy = groundY(); let g = null;
  for(const o of fighters){
    if(o.dead || o === f || o.team === f.team || o._isBoss) continue;
    const dxo = (o.x - e.x)*e.inl; if(dxo < -40 || dxo > 220) continue;
    if(!(o.onground || gy - (o.y + o.r) < 150)) continue;
    const atk = o.smashHold > 0 || !!o._windup || !!o._mv || o._atkAnim > 0;
    if(!g || (atk && !g.atk)) g = { o:o, atk:atk };
  }
  return g;
}
// a foe that has come out after it: in the air over the drop (or a flyer), near
function recChaser(f){
  for(const o of fighters){
    if(o.dead || o === f || o.team === f.team || o._isBoss || o.onground) continue;
    if(overDrop(o) && Math.hypot(o.x - f.x, o.y - f.y) < 330) return o;
  }
  return null;
}
function recSpend(f, inp, held){
  if(f.jumps > 0) inp.jump = !held;
  else if(f.spCd <= 0 && !brainKit(f).uStance){ inp.special = true; inp.up = true; }
}
function recPath(f, inp, B, goal, held, E){
  const e = recEdgeOf(f, goal); if(!e) return false;
  const gy = groundY(), feet = f.y + f.r, out = -e.inl, dxl = (f.x - e.x)*out, lvl = brainLevel(f);
  if(E.rd == null) E.rd = Math.random() < REC_READ[lvl];   // does it look at who is at the ledge this trip
  if(!E.path){   // chosen once, as the trip begins
    const g = E.rd ? recGuarder(f, e) : null, rr = Math.random(), ro = Math.random();
    if(REC_MODE === 'A'){   // ledge first; over only when it has seen the ledge guarded, and then only now and then
      E.path = (g && rr < REC_RESPECT[lvl]) ? 'own' : (ro < REC_LEDGE[lvl] ? 'hug' : 'own');
    } else if(REC_MODE === 'B'){   // reads the defender: a foe out after it -> over; a foe at the ledge -> over or from below (or the ledge anyway); nobody -> ledge first
      const c = E.rd ? recChaser(f) : null;
      if(c) E.path = 'own';
      else if(g) E.path = rr < REC_RESPECT[lvl] ? (ro < 0.5 ? 'below' : 'own') : (ro < 0.8 ? 'hug' : 'below');
      else E.path = ro < REC_LEDGE[lvl] ? 'hug' : 'own';
    } else {   // C: a different path each time, nobody read
      E.path = rr < 0.35 ? 'hug' : rr < 0.65 ? 'mid' : 'own';
    }
  }
  if(E.path === 'own') return false;   // the level's own way (brainRecover's old branches)
  const out_ = out, dirIn = e.inl, air = (f.st || STAT_ONE).air, acc = MOVE*air, cap = MAXVX*air, g = gravAt(f);
  const age = hazardT - E.at, steer = !(E.err === 'drift' && age < 22);
  const vin = -(f.vx || 0)*out_;
  if(steer){
    // where it heads: the ledge column ('below': just outside the face), slowing as it gets there
    const tgtDx = E.path === 'below' ? (f.r + 34) : -10, dist = dxl - tgtDx - Math.max(vin, 0)*8;   // (8 frames in hand: it lets off the stick early)
    const want = dist > 4 ? Math.min(cap, Math.sqrt(2*acc*0.7*dist) + 0.8) : (dist < -6 ? -Math.min(cap, Math.sqrt(2*acc*0.7*(-dist)) + 0.8) : 0);
    inp.left = false; inp.right = false;
    if(vin < want - 0.3){ if(dirIn < 0) inp.left = true; else inp.right = true; }
    else if(vin > want + 1.6){ if(dirIn < 0) inp.right = true; else inp.left = true; }
  }
  // the moves
  let spend = false;
  if(E.path === 'below'){
    // under the ledge first: hold off the face while falling, go down a little under the top, then up it leaning in (jump, the up-special when it sinks again)
    if(!E.first) spend = f.vy > 0.5 && feet + f.vy*4 > gy + 50;
    else { inp.left = dirIn < 0; inp.right = dirIn > 0; spend = f.vy > 0.5 && feet + f.vy*4 > gy - 10; }
  } else {
    const aim = E.path === 'hug' ? -6 : 80;   // the height above the ledge line at which it spends a move while sinking
    if(f.vy > 0.5 && feet + f.vy*4 > gy - aim){
      spend = true;
      if(E.path === 'hug' && f.jumps > 0){   // it makes the ledge column still above the catch height: no move needed
        const vEff = Math.max(1.5, Math.min(cap, Math.max(vin, 0) + 0.5*acc*8)), tx = dxl > 0 ? dxl/vEff : 0, fp = feet + f.vy*tx + 0.5*g*tx*tx;
        if(fp < gy - 14) spend = false;
      }
    }
  }
  if(spend){ recSpend(f, inp, held); if(!E.first && (inp.jump || inp.special)) E.first = hazardT; }
  return true;
}
// ===== END STUDY PROTOTYPE =====
```

The hook: in brainRecover, between the wall-kick branch and the recSmart branch:

```js
  } else if(goal && recPath(f, inp, B, goal, held, E)){
    // (handled by the study prototype)
  } else if(goal && BRAIN_LV[brainLevel(f)].recSmart){
```

## Question box lines

- A. Ledge first: CPUs head low for the ledge and go over the top only when they see you guarding it. Time in your reach doubles (14% to 29%); how often they get back stays the same.
- B. Read the guard: with you at the ledge they go over the top or come up from below, with nobody there they hug the ledge. Most hittable: a late jab lands on 16% of recoveries, not 7%.
- C. Mix it up: every recovery is low, middle or high at random, never looking at you. Smallest change (14% to 25% of the time in reach) and it cannot react to where you stand.

**Recommendation: B.** With nobody at the ledge B is exactly A (the ledge first), so nothing is lost; with you at the ledge it reacts the way a person does (over the top or from underneath), which is what gives you the most to hit (zone time 19% to 34%, a late jab landing on 16% of recoveries, not 7%) while the CPUs still get back as often. C is the smallest change and cannot react to you; A is B without the reading. Tell the builder to set the look / ledge / respect chances by level from the same reasoning as the bot-fix rows.
