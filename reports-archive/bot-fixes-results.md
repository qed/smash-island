# Bot fixes: before and after

**Headline:** the CPU now goes to the ledge most times its foe is knocked off (45% of the time before, 70% now). It lands more edge-guards (212 hits before, 335 now; edge-guard KOs 8 before, 13 now, over 30 Expert finals) and walks into Ruby's prism burst less (26 times before, 16 now). Overall win rates barely moved (130 wins of 300 before, 127 now), but two World Cup finals changed winners: **Coiny now beats Ruby 8-2 (it was 3-7) and Leafy now beats Bow 7-3 (it was 3-7).** Firey drops from 15 of 15 to 10 of 15 against the yardstick.

## What changed (CPU behaviour only, no fighter's kit or numbers)

- **Edge-guarding, your way:** the CPU goes to the ledge the foe is coming back to. It fires its projectile while they try to get back up, and uses a strong jab if they jump up into reach. A fighter that lays traps puts one there first. The higher the level, the more often it does this and the better it judges the foe's way back.
- **Hazards:** it looks far enough ahead to hop a trap or wait outside a prism burst in time. It drifts off a small trap it would land on.
- **Kits it misused:** Box catches shots and throws them back. Bow's Chair Slam is used up close. Teardrop uses her kick more. Starfruit recycles to get rid of an ailment. Cammy aims Snapshot from the gap she sees.
- **Fewer self-destructs:** no dash that ends near the side KO line (Leafy's Sprint used to carry her off). The guard lands on the stage before walking to the ledge.

## Against the BFDI yardstick (15 matches each, Hard)

Both builds use the same seeds and sides. "Before" is the game as merged into the bot-fixes branch (live main plus heavies slower, the prize-fighter jabs and Eraser 1.35), so the CPU is the only difference. The yardstick's foes are CPUs too, so they also got the fixes.

| Fighter | Before | After | Change |
|---|---|---|---|
| Box | 4 | 2 | -2 |
| Barf Bag | 9 | 7 | -2 |
| Cammy | 0 | 2 | +2 |
| Starfruit | 2 | 3 | +1 |
| Teardrop | 3 | 3 | 0 |
| Bow | 2 | 6 | **+4** |
| Puffball | 6 | 7 | +1 |
| Leafy | 0 | 2 | +2 |
| Toothpaste | 14 | 13 | -1 |
| Ruby | 7 | 4 | -3 |
| Coiny | 5 | 4 | -1 |
| Tennis Ball | 5 | 7 | +2 |
| Firey | 15 | 10 | **-5** |
| Bomby | 12 | 11 | -1 |
| Pen | 6 | 7 | +1 |
| Rocky (mid-pack) | 12 | 9 | -3 |
| Fries (mid-pack) | 8 | 9 | +1 |
| Ice Cube (mid-pack) | 8 | 10 | +2 |
| Bell (mid-pack) | 7 | 5 | -2 |
| Loser (mid-pack) | 5 | 6 | +1 |
| **Total** | **130** | **127** | |

With 15 matches, a change of 2 either way is within luck. The real moves are **Firey -5** (all 5 losses were 0-1 on stocks; he now gets KO'd at 67-161%), **Bow +4**, and Ruby and Rocky at -3. Cammy and Leafy are off zero. 97 of the 300 single results came out differently. So the fixes reshuffle who wins each match, not how strong the cast is overall. No errors, no draws.

## The World Cup finals (10 Expert vs Expert matches each, 1v1, 3 stocks, Goiky Field, no items)

| Final | Wins before | Wins after | Comebacks | Went to the ledge (share of knock-offs) | Edge-guard hits | Edge-guard KOs | Walked into a trap or prism |
|---|---|---|---|---|---|---|---|
| Puffball vs Match | Puffball 6-4 | 5-5 | 1 -> 2 | 30% -> 70% | 87 -> 126 | 4 -> 4 | 0 -> 0 (Match laid 37 -> 29 traps) |
| Ruby vs Coiny | Ruby 7-3 | **Coiny 8-2** | 3 -> 3 | 52% -> 69% | 84 -> 110 | 1 -> 3 | Coiny into the prism burst 26 -> 16; Ruby's traps 0 -> 0 |
| Bow vs Leafy | Bow 7-3 | **Leafy 7-3** | 4 -> 5 | 51% -> 71% | 41 -> 99 | 3 -> 6 (all Leafy's) | none to walk into |

What the finals look like now:

- **More ledge play.** Over the three finals, the guard stood at the ledge after 70% of knock-offs (45% before). Edge-guard hits went from 41% to 46% of knock-offs, and edge-guard KOs from 8 to 13. Bow vs Leafy changed most: 99 edge-guard hits (41 before), and Leafy's 6 edge-guard KOs on Bow are what flipped it.
- **Ruby vs Coiny flipped** because Coiny stopped walking into Ruby's prism burst as often (16, was 26), and Coiny's own edge-guarding rose (43 hits, was 30).
- **Comebacks:** 10 of 30 finals were won by the fighter who fell a stock behind first (8 before).
- **Traps:** no fighter walked into a small trap in either build at Expert. Ruby's and Match's traps ran out or were stepped round. The prism burst is the only hazard they still walk into.
- Matches are a little shorter in two finals: Ruby vs Coiny 155 -> 140 s, Bow vs Leafy 166 -> 146 s. Puffball vs Match got a little longer, 107 -> 117 s. Self-destructs stayed at 1 (Leafy, in both builds).

How these were counted (the same counting on both builds, only watching): "knocked off" means hit and then off the stage with nothing below. "Went to the ledge" means the other fighter stood on the floor within 90 px of an edge during that time. Standing near an edge while fighting counts too, which is why "before" isn't zero. An "edge-guard hit" means hitting them while they were off the stage and out of hitstun (trying to get back), or within 45 frames of them landing back. An "edge-guard KO" means they died after such a hit.
