# OC viability: the yardstick, the gap, and the design to close it

*2026-11-09. Design and measurement only: no game file was changed. Build read: smash-bal at the OC EDITOR commit (all four types present; only the Zoner is public). Numbers come from the reports (winrates.md, move-catalog.csv, frame-budget-audit.csv, cup-batch-250.md, balance-pass-results.md), the five OC ledger rows, and headless probes in the scratchpad folder `ocviab` (yard.py, dump.mjs, ko.mjs, match.mjs, match2.mjs). Unreleased fighters are not named. The owner's rule for this pass: not every option has to be good; some may be situational. The target is that each type's BEST builds reach mid-top and every slot has at least one strong option; weak options are allowed to be weak.*

**The owner's words:** "the OC's are bad. they will not be viable competitively" -- not enough damage or kill power; the finisher and Final Smash are placeholders; the moves feel awkward or slow; and the principle: a move that is hard to play around must pay a reward (knockdown, high damage, a status, low startup plus low end lag, or a combo).

## 0. Summary

| Question | Answer |
|---|---|
| Where a good OC build sits today | **bottom third.** Vs a mid-top panel of 8 (Expert CPUs both sides, 2 stocks): the best Zoner build 21-38%, Grappler 38%, Trapper 29%, Trickster 13%; the panel's own members score 48-76% on the same gauntlet. The owner's two builds (14411, 23141): 21% each. |
| The biggest gap | **kill power, not damage.** The damage builds' damage per opening is at or above the roster median (38-48% vs 36.6). But no OC move KOs a still 86-weight foe from the centre under 133% (the two 32-34-frame rooted plants), the kill aerials need 165%, the shared finisher 175%; the panel's smashes KO at 68-133% and their finishers about 105-111% in play. |
| Second gap | **the big hits are slow and the fast hits are light.** The Zoner's and Trickster's aerials are 1-3% under every roster aerial median; the kill moves need 24-51 frames; the CPU lands a smash 1-2.8 times a match. |
| The reward audit | 100 moves scored (64 options + 36 fixed). **9 are hard to play around and pay no reward** (fix: add the reward), **7 pay a reward but are trivially avoidable** (fix: faster, or less). 84 pass as they are. |
| Finisher / Final Smash | one of each per type, all built from existing machinery: 3 of the 4 finishers need **zero new engine code** (an ATKSPECIALS row that calls the smash patterns), the Trickster's about 25 lines; the four Final Smashes are FINAL_SMASHES rows plus **one 5-line keying change** (`fsOf` and 4 readers must look up an OC by `f.oc.type`, not `f.name`). |
| After the proposed Zoner row fixes (applied in memory only) | the best Zoner build 21% -> **46%** (n 24 each, +/-10 noise) -- into the mid-top band's bottom edge before any finisher or FS exists. |
| Build plan | 4 lean jobs, about **17% of a week** (section 7). |

---

## 1. The yardstick: what "mid-top" is in numbers

### 1.1 Win-share bands (the roster win-rate run, 102 released fighters, each 15 matches vs the same 15 mid-pack Hard CPUs, 2 stocks, Goiky)

| Band | Record of 15 | Fighters (34 each) |
|---|---|---|
| **Top third** | 8-15 (53-100%) | Bomby, Firey, Toothpaste, Match, Magnet, David, Lollipop, Taco, Ruler, Golf Ball, Cake, Naily, Bubble, Gaty, Ruby, Balloony, Saw, Pencil, Remote, Dora, Tree, Donut, Woody, Blueberry, Blocky, Grassy, Rocky, Bonesaw, Yellow Face, Fries, Pickle, Test Tube, Silver Spoon, TV |
| **Middle** | 5-8 (33-53%) | Fan, Fanny, Tennis Ball, Firey Jr., Lightning, Paintbrush, Gelatin, MeTag, Bell, Pen, Sidewalky, Spikey, Ice Cube, Loser, Profily, Nickel, Rose, Marker, Money, Baseball, Puffball, Bracelety, Soap, Pin, Microphone, Flower, Bot, Bomb, Book, Dough, Needle, Poppy, Jack, Salt |
| **Bottom third** | 0-5 | Marshmallow, Roboty, Coiny, Basketball, Cheesy, Liy, Tapey, Candle, Taco (II), Teddy Bear, Tea Kettle, Barf Bag, Nickel (II), Cherries, Leafy, Apple, Clover, Pillow, Knife, Starfruit, Lightbulb, Trophy, Cammy, Fern, Paper, Teardrop, Tissues, Yin-Yang, Snowball, Box, Balloon, Lifering, Bow, Goo |

Since that run the balance pass trimmed Firey, Magnet and Bomby (now 23-26 of 30) and lifted ten bottom fighters (Trophy, Barf Bag, Snowball, Knife, Clover to 9-15 of 30); the 250-cup batch (3 stocks, Expert, 48-team cups) puts Fries, Roboty, Rocky, Lollipop, Rose, Blocky, Pen and Tennis Ball at the top of the cup table. "Mid-top" = the lower half of the top third and the upper middle: ranks about 20-45.

**The MID-TOP PANEL used below (8):** Fries, Rocky, Blocky, Yellow Face (ranks 24-30), Pickle, Tennis Ball, Lightning, Pen (31-40). Playing this panel 1v1 at Expert, 2 stocks, 5400-frame cap, its own members score: Lightning 76%, Pen 71%, Pickle 62%, Fries 48% (21 matches each). **A mid-top OC should score 45-60% on it.**

### 1.2 Per-move numbers (move-catalog.csv: 31 fighters, every slot; frame-budget-audit.csv: 102 fighters)

| Slot | Damage med / p75 | Startup med | End lag on whiff med / p75 | Launch med / p75 | Lowest KO % seen in play, med (p25) |
|---|---|---|---|---|---|
| Jab (full string) | 7.5 / 8.4 | 2 | - | - | 111 (72) |
| Forward tilt | 6.0 / 6.8 | 4 | 8 | - | - |
| Forward air | 7.2 / 9.2 | 5 | 10 | - | 129 (114) |
| Back air (the kill aerial) | 8.4 / 9.5 | 5 | 11 | - | 126 (95) |
| Down air (spike) | 8.0 / 9.4 | 8 | 11 | - | 85 (80) |
| Neutral special | 7 / 10 | 6 (p25 3) | 14 / 18 | 7 / 10.5 | 126 (94) |
| Down special | 6 / 8 | 6 | 16 / 20 | 8.6 / 10.9 | 134 (120) |
| Up special | 7 / 9 | - | - | 8.2 / 10.3 | 132 (118) |
| Smash (charged) | 21 / 23 | 35 (p25 26) | 18 / 19 | 13.4 / 14.8 | 106 (81) |
| Finisher | 8.5 / 10 (14 for the shared swing) | 22 (12 + grow-in) | - | 7.2 / 11.6 | 111 (106) |
| Final Smash | FS_DEFAULT surge: 24% + the fighter's finisher inside it (38% with the shared swing), R 240 | wind 14-40 (med 34) | - | 20 / -13 | always |

**Damage per opening** (jab string + best aerial + best special or smash, the catalog's 31): median **36.6** (p25 32.9, p75 39.5); top band 38.8. **Best single move**: median 20 (p75 23; always the charged smash). **Lowest KO % in play**: median 81 (p25 48, p75 96); top band 88.

**Controlled KO probe** (ko.mjs: a still 86-weight Pen, no recovery, hit from the stage centre; the same probe for roster and OC): Pen smash 94%, Rocky smash 68%, Fries smash 133%, Lightning smash 133%, Pickle smash 175%; the roster's push-off smashes (Tennis Ball, Blocky, Yellow Face) knock a non-recovering foe off at under 20%.

### 1.3 The targets for an OC at "mid-top"

| Measure | Target |
|---|---|
| Win share vs the MID-TOP panel (Expert, 2 stocks, best build) | **45-60%** (the panel's own members: 48-76%) |
| Damage per opening (the best build) | **36-44%** |
| Best kill move, the controlled probe from the centre | **<= 110%** (uncharged smash or special); the kill aerial <= 150% |
| Damage dealt per 5400-frame match vs the panel | **>= 170** (the panel's own: 187-245; OCs today 121-159) |
| Finisher | 14-18%, KOs by **<= 120%** from the centre, tell 12 + grow-in, FIN_CD 74 (its own, not the 180 shared) |
| Final Smash | **38-45% total**, wind 14 (+ a 14-20-frame tell), every lock <= 45 frames, dodgeable |
| Frame data | neutral special startup 6-10 and end 14-18; down special 6-10 / 16-20; smash 24-35 / 16-19; nothing under the 6 floor; strong fast moves (>= 8% or launch >= 9) pay 18-28 on whiff; locks <= 45 |

---

## 2. The gap, per type

Measured with ko.mjs (frame data, damage, KO %), the ledger's probes, and match2.mjs (vs the MID-TOP panel, Expert, 2 stocks, 5400 cap, 24 matches a build unless marked). Default jab = 3 x 2.3 = 6.9 (the shared three-hit jab, read from the probe).

| | Zoner | Grappler | Trapper | Trickster | Yardstick |
|---|---|---|---|---|---|
| Damage per opening, damage build | 6.9 + 7.5 (Back Glare) + 24 (Lance Beam) = **38.4** | 7.3 + 10.1 (Mule Kick) + 30.7 (Pile Driver) = **48** | 7.2 + 8.8 + 30.2 = **46** | 6.6 + 6.7 + 22.1 = **35.4** | 36-44 |
| Damage per opening, the owner's builds | 14411: 38.4 on paper (but see 2.1); 23141: 6.9 + 7.5 + 12 (Dimmer) = **26.4** | | | | lowest roster fighter 22.8 |
| Best option damage (charged smash) | 24 (beam) | 30.7 (plant, 32 f rooted) | 30.2 (plant, 34 f rooted) | 22.1 (lunge) | 21 / p75 23 |
| Best kill move, probe from centre | Lance Beam **173%**, Floor Arc 175 | Pile Driver **133%**, Shoulder Rush 133, Haymaker 175 | Spike Press **133%**, Bear Trap 175 | Pirouette **133%**, Trick Knife 133 | <= 110 (Pen 94, Rocky 68) |
| Kill aerial (back air) | 7.5%, KO 165 | 10.1%, KO 165 | 8.8%, KO 167 | 6.7%, KO 165 | 8.4%, KO ~126 (p25 95) |
| Fixed aerials vs the roster medians (fa 7.2 / ba 8.4 / da 8.0) | 6.5 / 7.5 / 6.0 (**all under**) | 9 / 9.5 / 8 (at or over) | 7.5 / 8.5 / 7 (about even) | 6 / 7 / 6 (**all under**, by design) | |
| Startup of the kill move | 24 (rooted) | 32 (rooted) | 34 (rooted) | 24 | smash p25 26, med 35 |
| Reach of the kill move | 150 px lane | 44 px ring | 40 px ring | 34 + 5-step lunge | |
| Finisher | shared swing 14%, KO 175, cd 180 | same | same | same | 8.5-10% but KO ~111 in play; cd 74 |
| Final Smash | FS_DEFAULT surge (24% + the shared swing) | same | same | same | a row of its own |
| Win share vs the panel, best main-effect build | **Z1141 50% (n 8)**, Z1111 21-38% | G1111 / G1211 **38%** | T1111 / T1112 **29%** | K1111 / K2111 **13%** | 45-60 |
| Dealt / taken per match | 142 / 195 | 145-159 / 188-192 | 141 / 185-194 | 121-138 / 186-195 | 187-245 / 147-182 |
| Frames per KO | 7,600 | 5,700-6,400 | 8,500 | 8,600-18,000 | 4,200-6,000 |

**Where each type is short.** Zoner: kill power (nothing under 165% but the 24-frame beam at 173) and a light aerial kit; its damage is fine. Grappler: the closest to viable (38%, 159 dealt); its kill moves are the slow plant and a 175% hook: the Haymaker is a "kill punch" in name only. Trapper: the floor pieces do their job (141 dealt) but every conversion is a 34-frame rooted plant or a 175% snap, so KOs come at 8,500 frames. Trickster: the lightest hits in the game (dmg 0.96 on 3-7% moves) and no kill route under 133%; it is the one type whose damage per opening is under the median, and it shows (13%, 121 dealt).

### 2.1 The owner's two builds, measured

The build code is the editor's order: Neutral, Down, Up, Smash, then Z; the last digit 1 = **Shield** (the editor lists Shield first, Reflector second). So both are Zoners with a shield.

| Build | Picks | Damage per opening | Kill route | Vs the panel (24 matches) | Dealt / taken | Frames per KO | Why it feels bad |
|---|---|---|---|---|---|---|---|
| **14411** | Skyfall Spark, Recharge, Glide Lamp, Lance Beam | 38.4 on paper | Lance Beam only: 24 rooted frames, KO 173% from the centre | **21%** (5 wins), 1 of 24 matches finished before the cap | 133 / 202 | 9,900 | Two of the four picks do no damage (Recharge stands 44 frames to heal 4%; Glide Lamp is a recovery with a 3% spark). The mortar takes 74 frames to land, so the foe walks out of it. The one hit that matters is a rooted 24-frame beam that does not KO under 170%. The build is "poke and wait" with nothing to wait for. |
| **23141** | Drift Orb, Light Hop, Spark Pillar, Dimmer | **26.4** (lowest in the game would be 22.8) | none: Dimmer 12% KO >260, Spark Pillar 10% stun, Drift Orb 5% | **21%** (5 wins), 2 finished | 129 / 189 | 10,700 | Three of the four picks are low damage or no damage (orb 5%, hop 0, Dimmer 12% weaken); the strongest hit on the whole character is the 12% burst at 36 frames. No move ever kills a foe who recovers. It feels slow because the orb (47 frames to reach a foe at 120 px) and Dimmer (36 frames) are the two things it presses most (10 orbs a match in the CPU's hands). |

Both builds pick the Zoning / Escape / Utility corners the design itself called dominated; the sections below make the Damage picks pay and give every slot one strong, broadly useful option, so a player who picks for feel still has a kill route.

---

## 3. The reward audit (the owner's principle)

**Scoring.** *Hard to play around* 1-3: 1 = seen coming and walked out of (startup over 30, or a slow shot, or stands still); 2 = needs a read or a jump (reach over 60 px, startup 10-24, a lane or a floor piece, a two-sided or round hit, 8+ safe frames); 3 = beats most answers (startup under 10 with reach or a round box, a trap on the path, a homing or multi-shot). *Reward*: KD knockdown; DMG high damage (>= 10 a hit or >= 20 charged); FX a status (root, stun, bleed, slow, weaken, scramble, strip); FAST low startup and low end lag together (<= 8 and <= 12); COMBO it leads into a follow-up (stun or root long enough to land the type's next hit); ESC the move's own i-frames or distance (an escape pays itself). **Verdict:** OK = the pay matches the difficulty; **NO REWARD** = hard (2-3) and pays nothing; **FREE REWARD** = pays a reward but is trivially avoidable (1) or over-paid for its safety. Startup and free (frames until the OC acts again) are the ledger's measured numbers on a still foe. Measured damage includes the type's dmg multiplier; smashes at the smash multiplier.

### 3.1 Zoner

| Move | Startup / free | Dmg | Hard | Reward | Verdict | Fix (row numbers) |
|---|---|---|---|---|---|---|
| Z-N1 Skyfall Spark | 74 / 35 | 11 | 1 | DMG | FREE REWARD (lands too late to be a threat; the CPU still fires 6 a match) | shot `vy:-11 -> -9, vx:1.6 -> 2.6` (lands about frame 50, still two body-lengths out), `dmg 11 -> 12, kb 8 -> 9` |
| Z-N2 Drift Orb | 47 / 27 | 5 | 2 (a 2.5 s pierce wall) | - | **NO REWARD** | `dmg 5 -> 6, fxTag:'slow', fxN:24, vx 2.5 -> 3.5, life 150 -> 110` (same range, out at about 34) |
| Z-N3 Backstep Flare | 7 / 22 | 4 | 1 | ESC + 4 | OK | - |
| Z-N4 Overcharge | 20 / 30 | - | 1 | the next jab only | FREE... in reverse: it pays almost nothing | `_empower` should also multiply the next special or smash hit (1.3x; ~6 lines in applyHit where `_empower` is read); `frames 20 -> 14` |
| Z-D1 Floor Arc | 8 / 37 | 10 | 2 | DMG + COMBO (stun 25 -> Sky Lamp) | OK | optional: `kb [6,-5] -> [6,-6.5], dmg 10 -> 11` so it launches at the edge |
| Z-D2 Glass Shards | 14 / 20 | 3x3 | 2 | FX root 45 + COMBO (45 is enough for Lance Beam's 24) | OK (strong) | - |
| Z-D3 Light Hop | 1 / 17 | - | 1 | ESC | OK | - |
| Z-D4 Recharge | 36 / 44 | heal 4 | 1 | small | OK, but under-paid for 44 frames | `frames 36 -> 30, healing 22 -> 33` (6%), `spCd 240 -> 200` |
| Z-U1 Spark Pillar | 0 (cast frame) / 4 | 10 | 2 | FX stun 29 + COMBO | OK | - |
| Z-U2 Beacon Drop | rise / 4 | 5 | 1 | covers the landing | OK | - |
| Z-U3 Blink | 4 | - | - | ESC 12 i-frames | OK | - |
| Z-U4 Glide Lamp | rise / 4 | 3 | 1 | a jump back | OK | - |
| Z-S1 Lance Beam | 24 / 44 | 24 | 2 (a 150 px lane) | DMG + KD | OK on paper, but KO 173%: the type's kill move must kill | `kb 12 -> 14, len 150 -> 170` (launch p75 is 14.8); keep stun cost 24 and end +16 |
| Z-S2 Star Rain | 68 / 42 | 10.5 x4 | 1 | DMG + FX slow | FREE REWARD (68 frames) | `at 60 -> 44` (first star about 50) |
| Z-S3 Light Leap | 46 / 59 | 16.5 | 1 | DMG + distance | FREE REWARD (46 frames, 59 free) | `rise 12 -> 10` (lands about 40) |
| Z-S4 Dimmer | 36 / 52 | 12 | 1-2 | FX weaken 79 | OK (a utility smash) | `grow 22 -> 16` (out at about 28) |
| ft Beam Poke | 5 / 8 | 5 | 2 (84 px) | FAST | OK | - |
| ut Lamp Arc | 5 | 4.5 | 1 | COMBO (launch -10.5, stun 27) | OK | - |
| dt Floor Flicker | 4 | 3.5 | 1 | FAST + pop-up | OK | - |
| na Halo | 5 | 3.5 | 1 | FAST | OK | - |
| fa Lance Thrust | 7 | 6.5 | 2 (92 px) | reach | OK | `dmg 6.5 -> 7.5` (roster fa median 7.2) |
| ba Back Glare | 6 | 7.5 | 2 | the kill aerial, KO 165 | under-paid | `dmg 7.5 -> 8.5, kb [-8.8,-4.4] -> [-10,-5]` (roster ba med 8.4) |
| ua Sky Lamp | 4 | 5 | 1 | COMBO | OK | - |
| da Drop Beam | 7 | 6 | 1 (reach 18) | spike | OK but hard to land | box `x2 +8, r +4` (reach 18 -> 30) |
| throws | lag 14-22 | 6-7 | - | position | OK | - |

### 3.2 Grappler

| Move | Startup / free | Dmg | Hard | Reward | Verdict | Fix |
|---|---|---|---|---|---|---|
| G-N1 Haymaker | 12 / 44 | 13.8 | 2 | DMG (KO 175) | OK as damage; **not a kill punch** | `kb [9,-6] -> [11,-6]`; keep end 24 |
| G-N2 Shove Wave | 11 / 32 | 5.3 | 2 (round, 52 px) | position (127 px push toward the edge) | OK | - |
| G-N3 Roll-Through | 2 / 26 | - | 1 | ESC 8 i-frames, side change | OK | - |
| G-N4 Brace | 24 / 38 | - | 1 | armour 24 | OK (beats a dash) | - |
| G-D1 Ground Pound | 9 / 40 | 12.7 | 2 (ring 40, dives from the air) | DMG + COMBO (stun 24 -> Head Toss / Rising Knee) | OK | - |
| G-D2 Low Sweep | 10 / 26 | 6.4 | **3** (two-sided, 10 f, free at 26) | KD 29 | **FREE REWARD** (a knockdown at whiff end 12 breaks the budget: strong fast moves pay 18-28) | `end 12 -> 18` (hit recovers at 35% as everything does) |
| G-D3 Back Vault | 1 / 17 | - | 1 | ESC | OK | - |
| G-D4 Shrug Off | 30 / 38 | heal 2 + cleanse | 1 | cleanse | OK | - |
| G-U1 Rising Knee | cast / 4 | 7.4-11 | 2 | KD 29 | OK | - |
| G-U2 Shockwave Hop | rise | 5.3 x2 | 1 | covers both sides | OK | - |
| G-U3 Wall Spring / G-U4 Armoured Climb | rise | - | - | ESC / armour | OK | - |
| G-S1 Pile Driver | 32 rooted / 46 | 30.7 | 1 | DMG + KD, KO 133 | OK (a slow big move keeps its tell) | `rad 44 -> 52` so the ring lands on a foe who steps back once |
| G-S2 Shoulder Rush | 27 / 45 | 19.1 | 2 (137 px through) | DMG + FX strip | OK | - |
| G-S3 Vault Slam | **51** / 64 | 19.1 | 1 | DMG | **FREE REWARD** (51 frames) | `rise 13 -> 10, fwd 4 -> 6` (lands about 40) |
| G-S4 Grip Reel | 38 / 50 | 14.8 | 2 (pull radius 170) | DMG + FX weaken + pull 86 px | OK | - |
| ft Palm Shove 7 / ut Headbutt 7 / dt Heel Stomp 5 / na Body Check 7 | 6-7 | | 1-2 | FAST / push / launch | OK | Headbutt reach 26 is short for an up tilt (roster med 64): box `x2 10 -> 24` |
| fa Hammer Fist 9 (end 18) / ba Mule Kick 10.1 (end 18) / ua Head Toss 6 / da Elbow Drop 8 | 6-9 | | 2 | DMG at a cost | OK | - |
| throws 6-8.5 | lag 14-20 | | - | | OK | - |

### 3.3 Trapper

| Move | Startup / free | Dmg | Hard | Reward | Verdict | Fix |
|---|---|---|---|---|---|---|
| T-N1 Tack Volley | 21 at 120 px / 28 | 4.1 x3 | 2 (three in a line) | 12 if all land | OK | - |
| T-N2 Tripwire Pod | lands at 43, 200 px out | 3 + root 45 | 2 | FX root | OK, but the root is too far away to convert | `vx 6 -> 4.5` (lands about 140 px: inside a run-in to Bear Trap Snap) |
| T-N3 Smoke Pop | 1 / 21 | - | 1 | ESC + cloud 60 | OK | - |
| T-N4 Caltrop Patch | 16 / 22 | 1 + slow 8 while in it | 1 | weak | OK (the slow does not outlast the puddle) | `puddle` rider gets `fxN:20` if the rider supports a lasting slow; else leave it |
| T-D1 Bear Trap Snap | 11 / 38 | 14.2 | 2 | DMG + FX bleed + COMBO (stun 33) | OK (the type's best move) | - |
| T-D2 Mine Seed | laid at 16, first damage 40 | 8.2 (5.5 x 1.5) | 2 (a floor piece, 7 s) | DMG | OK | `dmg 5.5 -> 7` (10.5 at the trap multiplier) |
| T-D3 Trapdoor Hop | 2 / 18 | 3 | 1 | ESC + a spark | OK | - |
| T-D4 Lie Low | 30 / 38 | heal 2 | 1 | cloud 120 | OK | - |
| T-U1 Spring Snap | cast | 8-12 | 2 | FX root 39 + COMBO (-> Bear Trap on landing) | OK | - |
| T-U2 Seed Scatter | rise | 3.1 x3 + root 45 | 2 | FX | OK | - |
| T-U3 Cable Warp / T-U4 Trap Hop | rise | - / a 6% trap | - | ESC / a trap | OK | - |
| T-S1 Spike Press | 34 rooted / 47 | 30.2 + bleed | 1 | DMG + FX, KO 133 | OK | - |
| T-S2 Minefield | first damage 53 | 20.6 + root 40 | 2 (a rooting mine on the approach) | DMG + FX + COMBO | OK (strong) | - |
| T-S3 Rebound Dash | 27 / 44 | 15.5 | 2 | DMG + 125 px | OK | - |
| T-S4 Tar Burst | **41** / 52 | 11.3 + slow 79 | 1 | FX | **FREE REWARD** (41 frames) | `grow 20 -> 14, frames 10 -> 8` (out at about 30) |
| ft Stake Thrust 6 / ut Spring Lift 6 / dt Trip Line 4 / na Chain Whirl 5.5 | 5-6 | | 1-2 | FAST / pop-up | OK | - |
| fa Wire Lash 7.5 / ba Back Snap 8.8 / ua Hook Up 5.5 / da Anchor Drop 7 | 5-8 | | 2 | | OK; the kill aerial KOs at 167 | ba `kb [-9,-3.5] -> [-10,-4.5]` |
| throws 5-7 | lag 14-20 | | | | OK | - |

### 3.4 Trickster

| Move | Startup / free | Dmg | Hard | Reward | Verdict | Fix |
|---|---|---|---|---|---|---|
| K-N1 Trick Knife | 13 at 80 px / 21 | 8.6 | 2 (fast, 111 px) | DMG-ish + COMBO (hitstun 21, the run-in is 10 frames) | OK | - |
| K-N2 Bubble Lure | 34 / 26 | 3.8 + slow 60 | 2 (homing) | FX + COMBO | OK | - |
| K-N3 Switch Hop | 1 / 19 | - | 1 | ESC + side change | OK | - |
| K-N4 Confetti | 22 / 27 | 1 x6 + scramble 30 | 2 (six in an arc) | FX | OK | - |
| K-D1 Heel Spin | **5** / 36 | 9.6 | **3** (5 frames, round the body) | DMG + COMBO (hitstun 27) | pays, but sits **under the 6-frame startup floor** with no tell | `TELL_ADD K-D1 4 -> 5` (first damage 6-7); keep end 20 |
| K-D2 Marble Spill | 14 / 19 | 3.8 (2 of 4 land) | 1-2 | weak | OK | `dmg 2 -> 3` |
| K-D3 Fake-Out | 0 / 18 | - | 1 | ESC bait (4 i-frames) | OK | - |
| K-D4 Second Wind | 20 / 26 | - | 1 | a jump back + haste 120 | OK | - |
| K-U1 Corkscrew | cast | 5.8-10 + scramble 44 | 2 | FX | OK | - |
| K-U2 Wake Dart | rise | 4.8 | 1 | guards the chase | OK | - |
| K-U3 Vanish / K-U4 Spring Heel | rise | - | - | ESC 14 i-frames / jump + slick | OK | - |
| K-S1 Pirouette Kick | 24 / 43 | 22.1 | 2 | DMG + KD, KO 133 | OK; the type's one kill move should kill at the edge | `kb 12 -> 13` |
| K-S2 Card Spray | **68** / 42 | 7.7 (2 of 5 land) + scramble 45 | 1 | FX | **FREE REWARD** (68 frames) | `at 40 -> 26` (first card about 50), `dmg 5 -> 6` |
| K-S3 Dash Through | 27 / 46 | 16.3 | 2 (152 px) | DMG | OK | - |
| K-S4 Hex Ring | 36 / 50 | 8.6 + weaken 69 | 1-2 | FX | OK (utility) | `grow 18 -> 12` (out at about 28) |
| ft Dart Stab 4.5 / ut Flip Kick 4.5 / dt Toe Tap 3 / na Tumble Spin 4 | 3-5 | | 2 (the fastest tilts in the game) | FAST | OK (speed is the pay) | - |
| fa Ribbon Slash 6 / ba Heel Flip 6.7 / ua Sky Flick 4.5 / da Drop Heel 6 | 4-7 | | 2 | FAST | OK, but the kill aerial KOs at 165 | ba `dmg 7 -> 7.5, kb [-8.5,-4] -> [-9.5,-4.5]` |
| throws 4.5-6 | lag 8-12 | | | FAST | OK | - |

**Count.** NO REWARD: Drift Orb (and Overcharge pays too little). FREE REWARD: Skyfall Spark, Star Rain, Light Leap, Low Sweep, Vault Slam, Tar Burst, Card Spray (7). Under the budget's floor: Heel Spin. Kill moves that do not kill: Lance Beam, Haymaker, Pirouette Kick and all four back airs (these are "reward too small for the type's one kill route"). Everything else passes. 28 row-number changes in all, every one inside the frame-budget rules (startup floor 6, 18-28 whiff lag on strong fast moves, 45-frame lock cap, slow big moves keep their tell).

**Every slot keeps at least one option that carries a build** (the owner's rule): after the fixes each slot's highest-damage option is at or above the roster's slot median on damage and launch (sections 1.2 and 2), and the Zoning, Escape and Utility picks are left as they are -- good against a style, in a corner, or for a combo or escape need, and allowed to be weaker in general. No option is tagged in the game or in these tables; the numbers do the sorting.

---

## 4. The awkward and slow moves

From the frame table (startup over 20 with no tell reward, free over 40, reach under 40 on a non-grab that is not an up or down air, where the roster's own medians are 21 and 19):

| Move | Today | Why it feels awkward | Fix | After |
|---|---|---|---|---|
| Skyfall Spark | lands at 74 | the foe walks out from under it | `vy -9, vx 2.6` | lands about 50 |
| Drift Orb | 47 to a foe at 120 px | a wall that arrives after the foe has moved | `vx 3.5, life 110` | about 34 |
| Star Rain | first star 68 | a smash that lands after its own stun cost ends | `at 44` | about 50 |
| Light Leap | lands 46, free 59 | the longest "escape" in the kit | `rise 10` | lands about 40, free about 52 |
| Dimmer | 36, free 52 | | `grow 16` | about 28 |
| Vault Slam | lands 51, free 64 | the slowest OC move | `rise 10, fwd 6` | lands about 40 |
| Tar Burst | 41, free 52 | | `grow 14, frames 8` | about 30 |
| Card Spray | first card 68 | | `at 26` | about 50 |
| Hex Ring | 36, free 50 | | `grow 12` | about 28 |
| Grip Reel | 38, free 50 | a reel is slow by nature | leave (its 170 px pull is the pay) | - |
| Headbutt (G ut) | reach 26 | an up tilt that misses a foe a step away | box `x2 24` | reach 40 |
| Drop Beam (Z da) | reach 18 on a 7-frame spike | | box `x2 +8, r +4` | reach 30 |
| Recharge / Lie Low / Shrug Off | free 38-44 standing | stances | Recharge 30 frames for 6% | the others stay |
| The two rooted plants (Pile Driver 32, Spike Press 34) | | slow big moves keep their tell (the budget rule); they already KO at 133 | leave; Pile Driver `rad 52` | - |

Risk kept honest: every speed-up above is on a move whose startup stays at or above the roster's smash p25 (26) or its own class target, and no end lag is cut.

---

## 5. Finishers and Final Smashes

**How the roster's are authored.** A finisher is `ATKSPECIALS[kitKey](f)` (the dispatcher looks the row up by `f.kit.special`, which for an OC is already `oc_zoner` etc., so **a row keyed `oc_<type>` needs no registry change**); the row returns false if it cannot start here. Most rows start a FINX object (`finxAdd(f, kind, o)`, stepped by `FINX_STEP[kind]`, drawn from its own hit numbers, tell by `fxTell`, live art by `fxArt`), with the owner's rules: FIN_STARTUP 12 frames of wind-up, what it puts in the world GROWS IN and cannot hurt until whole, ONE AT A TIME, every lock <= 45. A finisher of its own gets FIN_CD 74 (the shared swing pays 180). The simplest rows are one-liners that call existing hit code (`bomb`: `applyHit` in a radius; `serve`: `spawnProj`) -- the smash patterns (`runSmashSpec(f, row)`, SM_PAT beam / plant / mine / rain / through) are callable the same way, which is what three of the four designs below do.

A Final Smash is `FINAL_SMASHES[name] = { id, wind, dur, reach, catch(f), start(f, st), tick(f, st, t), end?, ai(f), needFoe?, exact?, catchMax?, lockEnd }`; `fsaA_wrap(base, E)` adds the shared entrance. Catch shapes: `fsBoxAhead(f, near, far, up, dn)` or a circle; holds: `fsLockOn(f, st, t)` / `fsLockStep` / `fsLockDone` (the fsc2_* helpers pin one foe through a sequence: Leafy); hits: `fsBurst(f, st, x, y, R, dmg, kbx, kby)`, `fsc2_hit`; CPU trigger `fsFoeNear(f, R)`. **The one keying change:** `fsOf(f)` returns `FINAL_SMASHES[f.name] || FS_DEFAULT`, and four more readers (fsHides, the FS card draw at about line 26958, the pose picture at 35328, fsaA_row at 38478) index by `f.name`. An OC's name is the player's, so: `function fsKeyOf(f){ return f.oc ? 'oc:' + f.oc.type : f.name; }` and those five sites read `FINAL_SMASHES[fsKeyOf(f)]` (5 one-line edits). The CPU's FS use needs nothing: `ai(f)` is on the row.

| Type | Finisher (ATKSPECIALS.oc_<type>) | Frames and numbers | Pieces | New code |
|---|---|---|---|---|
| **Zoner** | **Lamp Lance**: a lane-long thin beam, the lane drawn as an aim line during the wind-up | FIN_STARTUP 12 + 8 tell (fxTell), beam at 20: `runSmashSpec(f, {pat:'beam', len:420, wide:18, dmg:16, kb:14, effect:'knockdown', n:30, cost:{stun:22}})`; KO target <= 120 from the centre; end lag 22; FIN_CD 74 | SM_PAT.beam (the `beams` hit array), fxTell, endLagArm 'finisher' | **0** (a 4-line row) |
| **Grappler** | **Lariat Drive**: a step in and a huge slam ring (the command-grab feel without a grab) | 12 + 10 rooted wind, ring at 22: `runSmashSpec(f, {pat:'plant', rad:64, wind:10, dmg:18, kb:16, effect:'knockdown', n:30, cost:{stun:24}})`; KO target <= 110 | SM_PAT.plant, fxTell | **0** |
| **Trapper** | **Mine Row**: three mines grow in one after another in a line ahead (36 / 100 / 164 px), each roots; they expire in 4 s | 12 tell, mines at 12 / 32 / 52 (one at a time, each with its own grow-in): three `runSmashSpec(f, {pat:'mine', at, r:20, life:240, dmg:11, kb:10, effect:'root', n:36, cost:{cd:0}})` calls from one small FINX row that fires them on frames 12/32/52 | SM_PAT.mine, finxAdd + a 10-line FINX_STEP 'ocmines' (a counter that fires three rows), `ocTrapCap` must skip finisher pieces (`p._slot === 'finisher'`, 1 line) | **~12 lines** |
| **Trickster** | **Thousand Cuts**: a flurry: three dashes through the foe, each 6%, the last knocks down | 12 tell, dashes at 12 / 26 / 40: `runSmashSpec(f, {pat:'through', dash:8, spd:16, reach:26, dmg:6, kb:[6, 12 on the last], effect: last 'knockdown', cost:{stun:18}})` x3 driven by a FINX row that turns the fighter round between dashes | SM_PAT.through, a 25-line FINX_STEP 'occuts' (fires the three rows, flips facing) | **~25 lines**; the zero-code fallback is `pat:'rain'` of 7 cards (count 7, at 18, seek 220, dmg 4, scramble 30) |

All four: a visible 12-frame wind-up plus a tell, dodgeable (jump the beam, step out of the ring, jump the mines, roll past the dashes), total 16-18% single or 18-33% if everything lands, every lock <= 45, their own FIN_CD 74 (the shared swing's 180 is itself a reason the OC feels slow: a roster fighter gets its finisher back 2.4x as often).

| Type | Final Smash (FINAL_SMASHES['oc:<type>']) | Frames and numbers | Pieces | New code |
|---|---|---|---|---|
| **Zoner** | **Sunlamp**: a lane-long beam that pulses three times, then bursts | wind 14 + 20 tell (aim line via hitArt), pulses at 34 / 46 / 58 (`beams.push` x3, len 520, w 24, 10% each, kb 6/-4), final `fsBurst(f, st, x+260, y, 120, 14, 18, -10)` at 70; total 44; dur 100 | catch `fsBoxAhead(f, 0, 520, 44, 40)`, beams, fsBurst, armAtk | 0 beyond the row (~30 lines) |
| **Grappler** | **Pile Driver Supreme**: catches the one foe ahead, rises, slams | wind 14, catch box 96 px ahead (`needFoe`, `exact`, `catchMax 1`); fsc2 sequence: lift 8% at 20, 8% at 34, slam `fsc2_hit` 26% kb 20/-12 at 44; total 42; lock 30 frames (<= 45); dur 70 | fsBoxAhead, fsc2_begin / fsc2_pin / fsc2_hit (Leafy's family) | 0 beyond the row (~40 lines) |
| **Trapper** | **Minefield**: five traps grow in one after another across 320 px, then all detonate | wind 14 + 16 tell; traps at 30 / 42 / 54 / 66 / 78 (`spawnProj trap:true, arm:12, life:240, 9%, root 30`), detonation at 100: `fsBurst` R 60 at each (10%); total up to 45 if a foe stands in two; dur 120 | spawnProj (TRAPS FALL idiom), fsBurst, armAtk | the ocTrapCap skip (1 line, shared with the finisher) |
| **Trickster** | **Thousand Cuts (Grand)**: catches everyone within 120 px, eight 3% cuts every 4 frames with scramble 30, then a 14% launch | wind 14, catch circle R 120 (`fsFoeNear`), `fsLockOn` each caught foe, cuts at 18..46 (`fsLockKeep`), launch at 50 kb 17/-9 (`fsBurst` R 140); lock 32 frames; total 38; dur 70 | fsLockOn / fsLockStep / fsLockKeep / fsLockDone, fsBurst | 0 beyond the row (~35 lines) |

Parity: FS_DEFAULT is 24% + the finisher (38 with the shared swing); the roster's bespoke rows run 30-45 with winds 14-40; these sit at 38-45 with wind 14 plus a tell.

---

## 6. The target balance method

**Builds per type (22):** the 16 main-effect builds (one option swapped into the all-first-options build, as the ledger probes did), 4 corner builds (all-Damage, all-Zoning, all-Escape, all-Utility), and the type's two best mixed builds named by the audit (e.g. Zoner N1 D2 U1 S1 and N1 D1 U3 S1). For the Zoner add the owner's 14411 and 23141.

**Gauntlet:** the MID-TOP panel (Fries, Rocky, Blocky, Yellow Face, Pickle, Tennis Ball, Lightning, Pen), 1v1, Expert CPUs both sides, 2 stocks, Goiky Field, items off, 5400-frame cap, win = more stocks, else lower percent. 8 matches a build (one per panel member) in pass 1; the best three builds of the type re-run at 24 (3 repeats). Record win share, dealt, taken, KOs, falls, frames per KO, option uses a match. **Cost measured: 0.6-0.8 s a match headless** (match2.mjs: 24 matches in 18-20 s), so a type's pass 1 is 176 matches, about 2.5 minutes, and the whole method about 15 minutes of machine time and about 1.5% of a week in agent credits per pass.

**Thresholds.** A type passes when (a) its **best build scores 45-60%** on 24 matches (the panel's own members score 48-76%; above 60 on 24 is a flag to re-check the kill move's launch); (b) **every slot has at least one option whose main-effect build is at or above the median main-effect build of that slot** and lands at least once a match in the CPU's hands; (c) dealt per match >= 170 for the best build. An option is flagged **broken** only if its main-effect build is strictly worse than every sibling on all three of win share, dealt and taken, or it never lands in 8 matches; an option that is merely weak is left alone (the owner: some moves are situational). Noise: 8 matches is +/-2 wins, 24 is +/-10 points, so no single-option change is made on an 8-match number.

**Stop rule:** at most 3 passes per type; stop early when (a)-(c) hold on the 24-match re-run; if after 3 passes the best build is under 45, the type goes back to design (a stat line change, not another row tweak).

**Controls every pass:** Pen and Pickle run the same gauntlet (they scored 71% and 62%); if either moves more than 10 points between passes the build or the harness changed, not the OC.

**CPU note (so a CPU OC is a fair test).** Today: the down-slot back hops (Light Hop, Back Vault, Trapdoor Hop, Fake-Out) are never pressed (ocBrainKit maps ai kind 'hop'/'dash' in the down slot to 'other'); smashes are pressed 0.9-2.8 times a match; the stance heals are pressed at any distance. Three small rules in ocBrainKit / the brain's OC branch: (1) `down:'escape'` for a back hop or dash: press it when a foe is inside 60 px, the OC is free, and the foe is in a tell (the same read the roster's dodge uses); (2) a `smBand` per smash option from its reach (beam `[40, len]`, lunge/through `[20, reach + dash*spd/2]`, plant/burst `[0, rad]`, rain/mine `[40, at + 60]`) so the brain fires the smash in range instead of on the generic timer; (3) stances and heals only when the nearest foe is over 220 px away and (for heals) the OC is over 60%. About 20 lines, measured by the uses-a-match column.

---

## 7. The build plan

| # | Job | Scope | Acceptance | Credit |
|---|---|---|---|---|
| 1 | **Rows** (default model) | the 28 row changes of sections 3-4 (OC_OPTIONS / MOVESETS.oc_* / TELL_ADD / ENDLAG_ADD), nothing else | the no-tell / frame-budget audit over the 64 options and 36 fixed moves: every row in its class target, no lock over 45; ko.mjs: Lance Beam / Pile Driver / Pirouette / Spike Press KO <= 120 from the centre, the four back airs <= 150; boot check clean; the owner sees the Zoner's four Damage picks in training | ~4% |
| 2 | **Finishers and Final Smashes** | the four ATKSPECIALS rows, the two small FINX steps (Trapper, Trickster), the ocTrapCap skip, `fsKeyOf` and its 5 readers, the four FINAL_SMASHES rows, FIN_CD 74 for OCs; the move card names them | each lands on a still foe at the numbers above and whiffs cleanly on a dodging one; the shared swing is no longer reachable by an OC; a CPU OC fires both; roster digest loop (111) identical; FS card draws | ~7% |
| 3 | **CPU and the balance pass** | the three brain rules; then section 6, pass 1 for all four types and the 24-match re-runs; one more row pass only on moves the thresholds name | the pass report (reports/oc-balance.md: the 22-build table per type, the controls, the flags); each type's best build at 45-60 or an honest "back to design" line | ~5% |
| 4 | **Changelog, balance notes, owner playtest** | the What's-new entry (no hidden names), per-type balance notes in the owner's words, the owner plays 14411, 23141 and the type's best build | the owner's verdict on feel; nothing pushed to main except on an update day or "ship now" | ~1% |

Order 1 -> 2 -> 3 -> 4; job 2 can run in parallel with job 1 if two agents are affordable (they touch different tables). **Total about 17% of a week.** Everything stays behind OC_OPEN until the owner flips it.

**What the fixes alone buy (measured, in memory):** with only job 1's Zoner numbers applied, the all-Damage Zoner went from 21% to **46%** (n 24, dealt 142 -> 149, frames per KO 7,600 -> 5,900); the Zoning / Escape / Utility corners moved little (21-29%), which is the intended shape: a real kill route for the player who picks for it, situational options that stay situational. The owner's two builds stayed at 13-21%: they have no Damage pick, and no row tweak should make a no-kill build viable.

## 8. Open questions for the owner (with a recommended default)

1. **Zoner first, or all four types' rows at once?** Default: **all four** in job 1 (the rows are cheap and the other types are not public yet), but only the Zoner's finisher and FS in job 2 if credits are tight.
2. **Finishers as smash-pattern rows (zero code, this doc) or bespoke FINX kinds (30-80 lines each, more character)?** Default: **rows now**; a bespoke kind per type later if a finisher feels generic.
3. **Overcharge: keep it jab-only (today) or let it empower the next special or smash too (~6 lines)?** Default: **next special or smash** (a 1.3x Lance Beam is the Zoner's one burst option).
4. **The kill-power lever: raise the kill moves' launch (this doc: Lance Beam kb 14, Haymaker 11, Pirouette 13, back airs 10) or give every type a true kill move in the fixed kit instead?** Default: **the options** (the player's pick should be what kills; the fixed kit stays honest).
5. **The panel: the eight named here, or a panel of the owner's choosing?** Default: **these eight** (they bracket rank 24-40 and are all live-roster fighters).
