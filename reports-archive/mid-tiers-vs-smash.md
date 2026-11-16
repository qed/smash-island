# Mid tiers: ours against Smash Ultimate's, and which weak fighters still use the shared finisher

*2026-11-05. Read-only research. Nothing in the game was edited, committed or pushed; no live relay was touched; nothing was downloaded. The game read is the working copy `smash-bal` (ffc5897). Measurements used the jsdom harness at BelowNormal priority, one process at a time, each under 15 seconds. Companion file: `mid-tier-table.csv` (21 of our mid fighters and 17 Smash mid characters, one row each). Earlier reports in this series: `why-weak-fighters-weak.md` (weak tier) and `smash-vs-ours.md` (high tier). The hidden prize fighters are not named or ranked. Clover is judged by the same numbers as everyone else, and her lack of a reliable kill move is not counted as a flaw.*

## Short answers

**Part 1.** **None of the 26 weak fighters uses the shared finisher now. In fact no fighter in the roster does.** All 109 roster kits have their own finisher row (`ATKSPECIALS`, checked in the live game: 109 of 109), so the shared 14% swing (`doAttackSpecial`'s fall-through, 180-frame cooldown against 74 for own finishers) has no user left. Of the 7 weak fighters whose "KOs come mostly from the finisher" in the 10-28 report, only **four** were really on the shared swing then (Tissues, Starfruit, Yin-Yang, Tea Kettle); Box, Teardrop and Book were already using their own, and the report's count meant "the finisher slot", not "the shared one". Update 1 gave six weak fighters their own (those four plus Clover and Teddy Bear). The useful question is therefore which of the 26 have a finisher that cannot finish: section 1.

**Part 2.** Our mid tier is a wide plateau, not a middle with a shape: 46 fighters (ranks 30 to 75 of 103) between 27% and 60% win rate, which one 15-match run (about plus or minus 2 wins, plus or minus 13 points) cannot separate from each other. Smash's mids are defined by *one or two elite tools plus a named, structural flaw* (a recovery, a body, a frame-data hole). Ours have gimmick specials that look like tools, but their flaws are almost always the same two stat flaws (light and floaty, or slow), and the stats that should separate tiers (weight, run, fall, jab, reach, smash launch) are **statistically the same in the upper, mid and low bands**: tiers are set by what the kit does with the CPU, mostly the jab (29% of mid KOs) and the finisher (22%), not by strengths and flaws a player could read off the card.

---

## 1. Part 1: the weak fighters and the finisher

### 1.1 How I checked
- **Own or shared?** In the live game, a finisher press calls `ATKSPECIALS[kit]`; if the kit has no row it falls through to the shared swing (a 14-damage circle, radius body + 26 px, centred 28 px ahead, launch (12, -9), hit on the press with no tell, cooldown `FIN_CD_SHARED` = 180 frames against `FIN_CD` = 74). I booted the real game headless (jsdom) and read `ATKSPECIALS` for every roster kit: **109 of 109 have a row**; none falls through. Update 1's list (Nickel (II), Test Tube, Saw, Fan, Soap, Tissues, Yin-Yang, Starfruit, Blueberry, Cherries, Clover, Jack, Magnet, MeTag, Poppy, Silver Spoon, Tapey, Tea Kettle, Teddy Bear and Bot as the "one more") is the set that still had the shared swing at the 10-28 run; the LEDGER rows for FIN lanes c1 and c2 (2026-11-02) say so.
- **Dates.** Batches 1 to 8 gave the other fighters their own finishers (batch 7 on 10-24, batch 8 on 10-27, found by git history for Bow, Box and Trophy), before the 10-28 win-rate run.
- **What the shared swing does** (for reference, measured by deleting the row in memory for Bow, Box and Tea Kettle against a weight-86 foe at stage centre): 14% damage (16.8% for Box, whose damage stat is 1.2), and the first KO appeared at a starting foe percent of 15 to 20, so about **32 to 34% total**. That is because the horizontal launch carries the foe to the near blast line of the small test arena, so read it as "kills almost at once if the foe is near an edge", not as a general KO percent. On 10-28 it gave Tea Kettle 6 of her 10 KOs and Tissues 5 of 8.

### 1.2 The 26 (weakest first, same order as the weak-fighter report)

"Best-case damage" is the most damage I measured from the finisher on a still weight-86 foe (Pickle) at stage centre, over distances of 50, 110, 180 and 260 px, 260 frames. "Lowest KO % seen" is the starting percent that first KO'd it, in steps of 5, plus the damage dealt (so a displayed percent). Many finishers need the foe to move, or an edge, or a set-up (Knife's shove needs an edge, Box's decoy needs a hit, Goo's drop needs a foe under him, Barf Bag needs poison, Yin-Yang needs a damage gap): those read 0 and are marked. The harness does not play the finisher like a person would, so these are bounds, not win rates.

| Weak fighter (rank, weakest first) | Finisher now (bespoke) | Since | 10-28: finisher KOs / all KOs | Best-case damage on a still mid foe | Lowest KO % seen on that foe |
|---|---|---|---|---|---|
| Lifering | Man Overboard! Spare Ring | before 10-28 | 0 / 5 | 6% | no KO up to 200% (a damage move) |
| Cammy | Self-Timer Group Photo | before 10-28 | 1 / 6 | 6% | no KO up to 200% (a damage move) |
| Balloon | Static Cling Lunge | before 10-28 | 0 / 7 | 9% | 109% |
| Starfruit | Mic Drop on a Screaming Amp | Update 1 (11-02) | 3 / 6 | 12% | 117% |
| Tea Kettle | Pour a Fresh Cup | Update 1 (11-02) | 6 / 10 | 18.2% | no KO up to 200% (a damage move) |
| Box | Which One Is Box? | before 10-28 | 2 / 3 | 0% | set-up move: not measurable on a still foe |
| Teardrop | Silent Puddle Ambush | before 10-28 | 7 / 10 | 11% | 101% |
| Paper | Origami Crane Flock | before 10-28 | 0 / 7 | 12% | 72% |
| Tissues | Achoo, Borrowed Hanky | Update 1 (11-02) | 5 / 8 | 9% | 149% |
| Apple | Finally Got My Pony | before 10-28 | 1 / 8 | 9% | 64% |
| Bow | Topple the Chair Showroom | before 10-28 | 0 / 6 | 12% | 102% |
| Goo | Drip From Above | before 10-28 | 0 / 5 | 0% | set-up move: not measurable on a still foe |
| Snowball | The Snowball Effect | before 10-28 | 0 / 9 | 6.3% | no KO up to 200% (a damage move) |
| Yin-Yang | Meet in the Middle | Update 1 (11-02) | 4 / 9 | 0% | set-up move: not measurable on a still foe |
| Lightbulb | Light-Up Disco Tiles | before 10-28 | 1 / 10 | 12% | no KO up to 200% (a damage move) |
| Trophy | That's Mine Now, Thanks | before 10-28 | 0 / 10 | 9% | 79% |
| Clover | Lucky Leaf Pinwheel | Update 1 (11-02) | 8 / 11 | 12% | 27% |
| Knife | Shove Off the Platform | before 10-28 | 5 / 13 | 0% | set-up move: not measurable on a still foe |
| Fern | Spores Sprout Snapping Fernlings | before 10-28 | 0 / 7 | 16% | 116% |
| Pillow | Sleepover Pillow Smack | before 10-28 | 0 / 9 | 9% | 139% |
| Candle | Hold Every Shot Midair | before 10-28 | 1 / 6 | 6% | 86% |
| Barf Bag | Somebody Refill Me! | before 10-28 | 0 / 9 | 0% | set-up move: not measurable on a still foe |
| Teddy Bear | Paint Grenade, Then Paintballs | Update 1 (11-02) | 5 / 14 | 7% | 162% |
| Book | Pop-Up Page | before 10-28 | 7 / 11 | 9% | 99% |
| Basketball | Bank Shot, Shot Clock | before 10-28 | 3 / 12 | 8% | 108% |
| Taco (II) | I Merely Pretended | before 10-28 | 1 / 12 | 10% | 80% |

**Reading it.** The "10-28 finisher KOs" column counts the shared swing for the six Update 1 fighters and their own finisher for the rest. 20 of the 26 fighters' finishers were their own before Update 1; the six that changed in Update 1 are Tissues, Yin-Yang, Starfruit, Clover, Tea Kettle and Teddy Bear (no re-measure of win rates exists for them since: the 5/30 Tissues, 2/30 Starfruit and 4/30 Tea Kettle in `balance-pass-results.md` are all with the shared swing). Their new finishers are weak as KOs: Tea Kettle's pours 12 to 18% and never KOs a still foe up to 200%; Tissues' honk is 9% and KOs only at about 149%; Teddy Bear's paint is 7% (about 162%).

### 1.3 Which weak fighters would gain most from a new finisher idea

Nothing here is built. The test is: weak result, a finisher that does little damage or cannot kill, and a kit that already has the set-up. Ranked:

1. **Lifering** (1 of 30; finisher 6% and a 1 s stun, no KO, 0 of 5 finisher KOs). Idea: make **Man Overboard!** a tow. The ring lands on the foe and drags them along the floor toward the nearest edge, then lets go (the lifeguard throwing the swimmer back where they came from). It fits the ring, gives him a kill route near an edge, and does not touch his jab.
2. **Cammy** (1 of 30; 6% and a 0.8 s freeze). Idea: **Self-Timer Group Photo** ends with the print: after the flash, the framed photo drops on the frozen foes as a heavy launch. The freeze already is the set-up.
3. **Balloon** (2 of 30; lightest body, dies off the top, 9% carry then a pop). Idea: **Static Cling Lunge** pops the carried foe upward for a launch at the top of the one-second carry (kills near 100% instead of 109% plus). It fits his name and his pop-and-reinflate theme.
4. **Starfruit** (2 of 30; the amp's pulses are 6% each). Idea: the amp's last pulse is an **encore blast** that launches along the floor; the set-up (the amp standing for 4 s) is already there.
5. **Tea Kettle** (4 of 30; a 12 to 18% pour that cannot KO). Idea: when the pour ends, the kettle **boils over** in a short steam geyser straight up, a launch for whoever stands in the splash.
6. **Goo** (6 of 30; Drip From Above does 8% and a 0.8 s root, 0 KOs on a still foe). Idea: let the root be the combo: a foe he drops on is stuck for 0.8 s, and his next smash (Puffed Up, launch 14.5, his best move) cannot be avoided. Only a number change on the root, no new move.

Not listed on purpose: Box's, Barf Bag's and Yin-Yang's finishers are set-up moves the CPU misuses (9 of 26 weak kits are misread by the CPU, `why-weak-fighters-weak.md`), and Knife's, Teardrop's and Book's already take 5 to 7 KOs; they are not finisher problems. Clover's finisher is her design.

---

## 2. Part 2: how I defined our mid tier

### 2.1 The ranking
- **Win rate, best available per fighter.** The 10-28 run (102 fighters, 15 matches each, `winrates.md`) for everyone; replaced by the 30-match result for the 26 fighters re-measured in `balance-pass-results.md` (after-adjustment numbers where there are any) and the 19 heavies re-measured in `heavies-results.md` (the "after" column, the build that is live; the five that were played 60 matches use their 60).
- **Cups.** 1v1 final wins in the owner's 50 cups (`winner-move-types.md`): Toothpaste and Puffball 4, Tennis Ball and Gelatin 3, Coiny and Snowball 2, 19 more with one. These are weak evidence (the same report says only Toothpaste and Puffball are above chance), so I add **5 points per cup win** (cap 20) to the win percentage instead of the 30% weight used in `shield-reflector-design.md`. Score = win % + 5 x cup wins. The simulated damage columns exist for 31 fighters only and are left out.
- **Result.** 103 ranked fighters (Bow, 0 of 15, last). **Upper = ranks 1 to 29** (win rate 40 to 93%, median 73%), **mid = ranks 30 to 75** (46 fighters, 27 to 60%, median 40%), **low = ranks 76 to 103** (0 to 32%). Cut lines: the top cut is at the 60% win rate, where the density of fighters drops (see 4.3); the bottom cut is at one-third (5 of 15 or 10 of 30), roughly where the weak-fighter report's set starts (its weak set includes some 5s, so its list overlaps rank 66 to 75 a little). Strong in the shield report's sense (about the top 10: Toothpaste, Magnet, Tennis Ball, David, Puffball, Firey, Bomby, Lollipop, Pencil, Match) is inside my upper band, though my ranking, without the cups at 30% and sim terms, puts Golf Ball, Tree, Cake, Taco and Ruler near the top as well.
- **Clover:** rank 77 (9 of 30, 30%). Her number is within noise of Knife (10 of 30, rank 74), so I include her as an edge row in the table, marked as such.

The **mid band, in order** (rank, name): 30 Bonesaw, 31 Yellow Face, 32 Lightning, 33 Pickle, 34 Test Tube, 35 Silver Spoon, 36 Fan, 37 Fanny, 38 Firey Jr., 39 Remote, 40 TV, 41 Trophy, 42 Barf Bag, 43 Gaty, 44 Paintbrush, 45 Pen, 46 Spikey, 47 Ice Cube, 48 Rose, 49 Money, 50 Sidewalky, 51 Snowball, 52 Bell, 53 Loser, 54 Profily, 55 Nickel, 56 Marker, 57 Bracelety, 58 Soap, 59 Microphone, 60 Bomb, 61 Coiny, 62 Roboty, 63 MeTag, 64 Pin, 65 Flower, 66 Bot, 67 Book, 68 Dough, 69 Needle, 70 Poppy, 71 Jack, 72 Salt, 73 Marshmallow, 74 Knife, 75 Tapey.

**Staleness warning, first thing to know.** Every win rate here was measured **before** two changes: the jab nerf of 11-04 (every jab is now 2 to 4%; Firey's went 6 to 2.5, Barf Bag 5.2 to 2.3, Toothpaste 5.7 to 2.4) and, for 20 fighters, Update 1's finishers. The jab was the top KO move of many mids (Fan 15 of 19, Firey Jr. 9 of 18, Ice Cube 9 of 16, Yellow Face 9 of 19, Trophy 8 of 10). Their ranks are therefore probably wrong now, and nothing here can say by how much. The tier shape in 4.3 is the 10-28 shape.

---

## 3. The mid tiers side by side

### 3.1 Ours (21 of the 46; one row each in the CSV)

Weight, run, fall and recovery are from the live build (11-04); jab is the **current** value (`jab-nerf-table.csv`), always on frame 2 (`move-catalog.csv`, all 31 jab rows); the kill column is the fighter's top KO move in the 10-28 CPU matches (count of its KOs, median foe percent, lowest) and is pre-nerf.

| Fighter (rank) | Wt | Run / fall | Jab now (reach px) | Best kill move (10-28 CPU matches) | Projectile | Recovery | Finisher | Does well | Does poorly |
|---|---|---|---|---|---|---|---|---|---|
| Yellow Face (31) | 82 | 1.10 / 1.00 | 3.5 (66) | jab, 9 of 19, median 137%, lowest 85% | star only | warp 130 | bespoke, earlier | best jab of the band, stun special, comeback kit | average kills |
| Lightning (32) | 54 | 1.11 / 1.09 | 2.3 (62) | Chain Bolt, 4 of 17, median 172% | yes, chain hits 3 | warp 170 | bespoke, earlier | reach, speed, multi-target special | light, kills late (median 164%) |
| Pickle (33) | 86 | 0.92 / 1.10 | 2.8 (65) | smash Cucumber Smackdown, 6 of 21, median 64%, lowest 25% | no | hop 165 | bespoke, earlier | the only mid with real early kills | slow, fast-falling |
| Test Tube (34) | 66 | 0.95 / 1.00 | 2.5 (63) | dart, 9 of 23, median 81%, lowest 39% | yes, dart | warp 130 | bespoke, Update 1 | dart knocks the foe out 1.2 s | light, one tool |
| Silver Spoon (35) | 94 | 0.92 / 1.09 | 2.9 (54) | finisher, 7 of 17, median 116% | no | hop 214 | bespoke, Update 1 | big body, 6 s gold buff, long recovery | slow, short jab reach |
| Fan (36) | 72 | 1.00 / 0.90 | 2.3 (50) | jab, 15 of 19, median 94%, lowest 20% | no | hop 202 | bespoke, Update 1 | banked empowered jab (before the nerf) | light; lived on the nerfed jab |
| Firey Jr. (38) | 70 | 1.00 / 0.91 | 3.3 (64) | jab, 9 of 18, median 145% | yes, fireball | hop 174 | bespoke, earlier | shots, burn, comeback kit | light, kills late |
| TV (40) | 117 | 0.94 / 1.10 | 3.3 (58) | finisher headbutt, 9 of 19, median 135% | no | warp 130 | bespoke, earlier | very heavy, stun ring | slow, short recovery |
| Trophy (41) | 88 | 0.95 / 1.09 | 2.3 (58) | jab, 8 of 10, median 66%, lowest 28% | no | hop 145 | bespoke, earlier | banked empowered jab (2 to 15 of 30) | 24 deaths; his tool was nerfed |
| Barf Bag (42) | 88 | 1.00 / 0.91 | 2.3 x2 (64) | Geyser (up air), 4 of 9, median 138% | no | hop 150 | bespoke, earlier | poison pressure, 2-hit jab | few KOs |
| Spikey (46) | 92 | 1.00 / 1.09 | 2.8 (53) | finisher, 7 of 15, median 132% | yes, spike volley | spin 90 | bespoke, earlier | burst special, finisher | shortest recovery of the band |
| Ice Cube (47) | 72 | 1.10 / 1.00 | 3.5 (60) | jab, 9 of 16, median 127% | yes, ring of 8 | hop 136 | bespoke, earlier | fast, freeze tool | smash launch 10 (weakest), late kills |
| Rose (48) | 83 | 1.00 / 0.92 | 3.3 (64) | Counter, 5 of 16, median 117% | no | hop 172 | bespoke, earlier | pull, root, counter | average jab, dies at 128% |
| Money (49) | 70 | 1.00 / 0.89 | 2.8 (64) | Drifting Bill, 9 of 17, median 132% | yes | warp 130 | bespoke, earlier | invulnerable up special that kills and heals | light, floaty |
| Snowball (51) | 94 | 1.00 / 1.00 | 3.0 (56) | Rage Tackle, 3 of 9, median 108% | no | hop 116 | bespoke, earlier | armoured charge | few KOs, jump 0.92 |
| Paintbrush (44) | 78 | 1.00 / 1.00 | 2.6 (64) | finisher, 8 of 19, median 120% | yes, bomb | hop 136 | bespoke, earlier | rage meter, +50% damage | has to be hit to charge |
| Soap (58) | 88 | 1.12 / 1.00 | 2.6 (53) | finisher, 5 of 11, median 123% | no | hop 181 | bespoke, Update 1 | strips armour and counters, heals | few KOs |
| Roboty (62) | 134 | 0.89 / 1.11 | 2.5 (56) | Antenna Spring, 11 of 15, median 101%, lowest 55% | no | hop 123 | bespoke, earlier | most durable (dies at 173%) | slowest runner |
| Needle (69) | 59 | 1.00 / 1.09 | 2 x3 (62) | jab, 5 of 12, median 76% | no | hop 107 | bespoke, earlier | 3-hit jab, counter | lightest of these, few KOs |
| Tapey (75) | 90 | 1.00 / 0.92 | 2.9 (54) | finisher, 7 of 10, median 120% | yes, wave | hop 126 | bespoke, Update 1 | Playback of a taped hit | needs a hit first |
| Clover (77, edge) | 70 | 1.00 / 0.89 | 2.3 (58) | finisher, 8 of 11, median 126% | yes, butterflies | hop 232 | bespoke, Update 1 | best recovery in the roster | light, two dead specials |

Full text and the extra columns (combo tools, comeback kit, lowest KO % over all moves, median KO %) are in the CSV. Every one of the 21 has its own finisher (the shared one is not used by any fighter). Comeback kits among the whole band: the COMEBACK table covers Yellow Face, Firey Jr., Coiny, Gaty (and, outside the band, Naily, Ruler, Gelatin, Fries, Dora, Toothpaste, Grassy); own-damage buffs are Paintbrush (rage), Pickle, Nickel (`comeback-vs-rage.md`).

### 3.2 Smash Ultimate's mid tiers

**The list.** UltRank's fourth official tier list, 2026-05-06 (Medium, https://medium.com/@ultrankssb/the-fourth-ultrank-tier-list-2026-9c5f6964f7e3, read in the built-in browser 2026-11-05), 82 characters, panelists' 1 to 10 ratings grouped by k-means. The mid rows, as published (the owner's picture matches):
- **A-:** Corrin, Falco, Shulk, Captain Falcon, Greninja.
- **B+:** Terry, Pokemon Trainer, Lucina, Ken, Zero Suit Samus, Pac-Man, Toon Link, Young Link, Pit/Dark Pit, Rosalina & Luma, Ice Climbers, Donkey Kong.
- **B-:** Pichu, Inkling, Ness, Sheik, Byleth, Meta Knight, Sephiroth, Duck Hunt.
- **C+:** Isabelle, Mii Gunner, Lucas, Wii Fit Trainer, Robin, Ridley.
That is 31 of 82 characters (A- to C+).

**17 picked across B+, B- and C+** (a spread of weights from 62 to 127): the numbers below are from each character's SmashWiki SSBU page read through a page summarizer (jab startup was not stated for 7 of them; ultimateframedata.com could not be reached from here, section 6). Weight is the wiki's value (Mario is 98). Where a percent has no stage given it is the page's wording; most are middleweight foes at the Final Destination edge.

| Character (tier) | Weight | Jab 1 | Run | Projectile | Best kills (page, percent) | Recovery | Tool | Flaw |
|---|---|---|---|---|---|---|---|---|
| Donkey Kong (B+) | 127 | 4%, startup n/s | 1.87 | no | fsmash sweetspot 98%, up smash 92%, back air ~130% | poor, no vertical | power, meteors | recovery, big hurtbox, laggy |
| Toon Link (B+) | 91 | frame 5, 2% | 1.91 | yes | back throw ~138% | tether, predictable | zoning, bombs | floaty, short range |
| Zero Suit Samus (B+) | 80 | frame 1, 1.5% | 2.31 | yes | whip ~135%, fair offstage ~100% | strong, long | speed, aerials | light, cannot close stocks |
| Rosalina & Luma (B+) | 82 | frame 5, 2% | 1.80 | yes | back throw ~176% | long, meteor-able | disjoint with Luma | weak without Luma |
| Pac-Man (B+) | 95 | frame 4, 2% | 1.67 | yes | back throw ~140%, up smash ~130% | excellent | zoning | few early KOs |
| Sheik (B-) | 78 | frame 2, 2% | 2.42 | yes | Vanish ~100%, Fish ~120% | flexible | mobility, neutral | tiny damage, weak KO |
| Ness (B-) | 94 | 2%, n/s | 1.61 | yes | fsmash ~50% at ledge, dash attack ~150% | exploitable | grab, aerials | slow ground, short range |
| Meta Knight (B-) | 80 | frame 4, 1% | 2.09 | no | down smash <190%, neutral air <150% | best in game | speed, combos | light, tiny hitboxes |
| Duck Hunt (B-) | 86 | 1.5%, n/s | 1.79 | yes | back air ~120% | slow, exploitable | zoning, traps | weak ground game |
| Inkling (B-) | 94 | frame 3, 2% | 1.93 | yes | fsmash with ink ~90% | long, linear | speed, ink boost | few reliable KOs |
| Sephiroth (B-) | 79 | n/s, 2.5% total | 1.86 | yes | up tilt tip 85%, back air ~70% | short, slow | range | light, slow moves |
| Pichu (B-) | 62 | ~1.2%, n/s | 1.89 | yes | down smash ~125% | excellent | combos, hurtbox | lightest, recoil |
| Isabelle (C+) | 88 | n/s, 2% | 1.48 | yes | back throw ~150% | long, no hitbox | ledge traps | low damage, sluggish |
| Lucas (C+) | 94 | frame 2, 2.5% | 1.65 | yes | up smash ~81%, down smash <60% at ledge | long, flexible | edgeguard, smashes | poor out of shield |
| Wii Fit Trainer (C+) | 96 | n/s, 2% | 1.87 | yes | fsmash ~78%, down smash ~86% | strong | damage, KO power | blind spots, few reliable kills |
| Robin (C+) | 95 | frame 4, 2% | 1.27 | yes | Thoron ~90%, Levin back air <80% | far, laggy | zoning, Levin | durability, slow |
| Ridley (C+) | 107 | frame 4, 2% | 1.80 | yes | fsmash <80% (centre), up smash ~105% | slow, weak | aerials, advantage | big hurtbox, light for a heavy |

Sources, one per row: SmashWiki, "<name> (SSBU)", https://www.ssbwiki.com/<name>_(SSBU) (Rosalina_%26_Luma_(SSBU)), read 2026-11-05. UltRank for the tier. The wiki's own "rank of 82" for these runs 39 to 60 (ZSS 39, Pac-Man 40, Toon Link 41, Rosalina 44, DK 46, Pichu 47, Inkling 48, Ness 49, Sheik 50, MK 52, Sephiroth 53, Duck Hunt 54, Isabelle 55, Lucas 57, Wii Fit 58, Robin 59, Ridley 60), which agrees with the UltRank rows. The wiki's text has small inconsistencies (Duck Hunt also named 64th in an older section, Lucas 57 and 58); I used the infobox rank.

---

## 4. The comparison

### 4.1 What Smash's mids share: a tool and a flaw, and both are structural
Reading the 17 rows:
- **Every one has a named elite tool.** Sheik's speed and combos, DK's forward and up smash (98% and 92%), ZSS's mobility, Meta Knight's recovery and ladder combos, Duck Hunt's three projectiles, Sephiroth's range, Lucas's edgeguard and up smash (about 81%), Wii Fit's smashes (about 78 to 86%), Pichu's combos and Ridley's aerials. A mid is a character with a **sharp** tool, not a character with no tools.
- **Every one has a flaw that is about the shape of the game, not a stat.** The page text names: a bad disadvantage state or recovery (DK, Ridley, Isabelle, Duck Hunt, Toon Link, Rosalina), a body problem (lightest in the game, Pichu; light and tall, ZSS; light and fast-falling, MK, Sephiroth; huge hurtbox, DK and Ridley), a frame-data hole (Sephiroth's slow moves; Wii Fit's laggy dash attack), or "cannot close the stock" (Sheik, ZSS, Isabelle, Wii Fit). The flaw is the price of the tool: the fast characters (Sheik 2.42, ZSS 2.31, MK 2.09) are light; the power characters (DK 127, Ridley 107) have recovery and hurtbox problems; the zoners (Duck Hunt, Robin, Isabelle) are slow or low-damage.
- **They are spread, not clustered.** Weight 62 to 127 (median 91), run 1.27 to 2.42, 15 of 17 have a projectile (not DK, not Meta Knight), and recoveries run from poor (DK) to the best in the game (MK). 12 of 17 have a stated move that kills at about 105% or earlier (DK, ZSS offstage, Sheik, Ness, Duck Hunt's sweetspot, Inkling, Sephiroth, Lucas, Wii Fit, Robin, Ridley, Pac-Man's down air near the side line); the other five (Toon Link, Rosalina, Meta Knight, Isabelle, Pichu) kill later but win by combos, range or traps. All counts are from the wiki text; stage and DI conditions differ from line to line.
- **Jabs are fast and tiny.** Stated jab damage 1 to 2.5% (DK 4%), stated startup frame 1 to 5 (median 4 over the ten that give one); no mid wins with the jab itself.
- **Their position is made by people.** UltRank's own text says the characters held back are held back by "inconsistencies and fundamental gaps in their gameplan" (paraphrase), and its mid movers are specialists: Isabelle up 11 places, Duck Hunt up 10, Donkey Kong up 7, Mega Man up 21 on strong results from a few players. A mid is a tier a skilled person can lift; the list is ratings by 73 top players grouped by k-means, not a match-up table (I did not find match-up numbers; see limits).

### 4.2 Ours: tools yes, flaws mostly the same two
- **A tool, usually.** Most of the 21 mids have a special that is a clear tool: Pickle's smash and dive (KOs as low as 25% and 12%), Test Tube's dart (median 81%), Roboty's Antenna Spring (11 of 15 KOs, median 101%), Money's invulnerable Drifting Bill, Silver Spoon's gold buff, Soap's strip-and-heal, Rose's counter. These behave like Smash's tools: a few kits have one sharp thing.
- **The flaw is a stat flaw.** Of the 21, 8 are light or floaty (Lightning 54, Needle 59, Test Tube 66, Firey Jr., Money, Clover 70, Fan and Ice Cube 72), 4 are slow runners (Roboty 0.89, Pickle, Silver Spoon 0.92, TV 0.94), one has a short recovery as the standout (Spikey's 90 px is the only mid under 100). Almost none has a *kit-level* flaw: a recovery that can be edge-guarded (every mid recovers 90 to 232 px up with a jump bank), a body that is a bigger target (the hurtbox has no link to weight or wins, `why-weak-fighters-weak.md`), or a move with end lag a foe can punish (there is no shield, spot dodge or air dodge to punish with). The Smash flaw palette (recovery, hurtbox, frame data, disadvantage) is mostly unavailable to us, so the flaw reduces to "light" or "slow".
- **Kill moves are the same template everywhere.** Normal moves share launch templates for every fighter (up tilt 10 to 11, back air 8.6 to 10.2, up throw 11.4 to 12.1: `why-weak-fighters-weak.md`), so mids differ only in smashes, finishers, jab boosts and specials. Median foe percent at a KO is 129% (upper), 124% (mid), 121% (low): the three bands kill at almost the same percent. In Smash a mid has one move at 50 to 100% and the rest at 130% and up; ours have a fixed late-kill template plus a few outliers.
- **Mids take KOs from the same two moves as the top.** Share of KOs from the jab and the finisher: upper 34% and 28%, mid 29% and 22%, low 17% and 32% (10-28 logs). The top move accounts for a median 59% of an upper fighter's KOs, 46% of a mid's, 50% of a low's. A mid is mostly an upper fighter with a little less of the same.

### 4.3 Where our mids sit relative to our strong and weak
Win rate over all 103 (10-28 plus later runs, 4.1 caveat applies): 19 fighters at 70% or more, 9 at 55 to 70%, 30 at 40 to 55%, 22 at 25 to 40%, 23 below 25%. So:
- **There is no shortage of mids by count (46, or 45%, against 31 of 82, 38%, in Smash)**, but the middle has **no internal order**: the 46 span 27 to 60%; a fighter 8 of 15 against one at 6 of 15 is a 2-win gap, the size of the noise. A tier list of 46 undifferentiated fighters is a plateau.
- **The shape is a cliff at both ends and a plateau between**: 19 clear winners at 70%+, then only 9 fighters between 55 and 70%, then 30 between 40 and 55%. The thin 55 to 70% zone is where Smash's upper mids (B+, A-) would be: ours has a gap there, so the step from mid to strong is a jump, not a ramp. The weak end is similar (22 at 25 to 40%, 23 below 25%).
- **Stats do not separate the bands** (quartiles; jab is the current post-nerf value per press, so multi-hit jabs count all hits):

| | Upper (29) | Mid (46) | Low (28) |
|---|---|---|---|
| Weight, median (range) | 91 (46 to 138) | 88 (54 to 134) | 81 (65 to 110) |
| Run, median | 1.00 | 1.00 | 1.00 |
| Fall, median | 1.00 | 1.00 | 1.00 |
| Jab per press now, median | 3.1 | 2.85 | 2.5 |
| Jab reach px, median | 60 | 61 | 63.5 |
| Smash launch, median | 12 | 14 | 14 |
| Up-special rise px, median | 145 | 140 | 158 |
| KOs per 15 matches, median | 21 | 15.5 | 9 |
| Median foe % at KO | 129 | 124 | 121.5 |

  Only weight and jab (and KO count) tilt with the band, mildly; **the upper band has a lower smash launch than the low band**. Weight spread (standard deviation) is 19 (upper), 16 (mid) and 12 (low): the lows are the narrow group, which fits the weak-fighter report's finding that the weak ones are light and have the same jab. Our whole roster's weight is 17 fighters at 70 or less, 34 at 71 to 85, 33 at 86 to 100, 19 above 100; Smash's 17 mids are 12 at 94 or less, 3 at 95 to 96 and two heavies (Ridley 107, DK 127).

### 4.4 Does each of ours have a defining strength and a clear flaw?
Mostly a strength, rarely a clear flaw, and where there is one it is not the kind a player can play around:
- Clear strength and clear flaw, in Smash's sense: **Pickle** (smash and dive kills at 12 to 25% against slow, fast-falling), **Roboty** (durable, kills with one special against slowest run and short recovery), **Test Tube** (dart that knocks out against a 66 body), **Spikey** (finisher and burst against the shortest recovery), **Ice Cube** (screen-wide shards and freeze against the weakest smash launch). Five of 21.
- Strength only, flaw is "light" or nothing: Yellow Face, Silver Spoon, Soap, Rose, Money, Paintbrush, Snowball.
- Average at everything, tool nerfed or unclear: Fan, Trophy and Firey Jr. (the jab was their tool; it is now 2.3 to 3.3% like everyone's), Barf Bag, Tapey, Needle.
So most of our mids are **average at the stat level with one gimmick**, where Smash's mids are lopsided at the stat level (Sheik's speed against her damage, DK's power against his recovery).

### 4.5 What keeps mids viable in Smash, and what does not exist here
1. **A defensive floor for everyone** (shield, spot dodge, roll, air dodge; `smash-vs-ours.md`): a mid with a bad matchup can still survive it. Ours has none.
2. **Specialists and match-ups**: ranks move with who plays them (Isabelle, Duck Hunt, DK, Mega Man); every mid has at least one matchup it wins on its tool (zoners against rushdown, grabbers against zoners). Ours: the CPU plays every kit as a jabber, so tool-based matchups barely exist in the data (the owner's cups: the low CPU rankers still make the memorable plays, `world-cup-results.md`).
3. **A recovery that offsets a light body** (MK, Pichu, Pac-Man, Sheik): a mid pays for its tool in one place and is paid back in another. Ours pays the light with a big recovery that does not matter (0 of 26 weak fighters lose to recovery).
4. **Patches and the long game**: Smash mids are retuned across years. Ours are retuned in passes, and this one's data is now stale (4.1).

---

## 5. Lessons for us (what a change would target; none applied, none a number)

1. **Make the middle readable first: re-measure.** The mid tier's order is from before the jab nerf and Update 1. A 30-match run of the 46, plus the 6 Update 1 fighters, would turn the plateau into a ranking; until then any "mid" tuning is guessing. (A measurement, not a request to tune the CPU.)
2. **Give each mid a defining strength and a flaw of a different kind.** Our flaws are "light" or "slow". A target would be kit-level flaws: a recovery with a gap, a finisher with end lag a foe can answer, a heavy kill that is easy to see coming. Smash's rule: a mid gets one elite tool and pays for it somewhere a person can punish.
3. **Add a ramp between mid and strong.** The 55 to 70% zone has 9 fighters. Candidates to look at first, by the numbers: fighters at 53 to 60% that already have a clear tool (Bonesaw, Yellow Face, Pickle, Test Tube, Silver Spoon, Fan, Fanny, Firey Jr.), rather than pushing up the weak.
4. **Let a smash or special differ by archetype.** Today the upper band's median smash launch (12) is below the low band's (14) and the median foe percent at a KO is almost equal across bands, so tiers are not set by kill power. A mid's tool in Smash is a kill at 50 to 100%; a target would be the smash or one special of each mid (Pickle's, Roboty's and Test Tube's already do it).
5. **Do not rely on the jab for the middle.** The jab was 29% of mid KOs; with every jab at 2 to 4% the mid has lost its common tool. Watch Fan, Trophy, Firey Jr., Ice Cube and Yellow Face first.
6. **A weak fighter's finisher is the cheapest place to add a kill route** (section 1.3), and it adds a tool without touching the jab.

---

## 6. Honest limits

- **Stale win rates.** The 10-28 run is before the jab nerf (11-04) and the Update 1 finishers; 26 fighters (balance pass) and 19 (heavies) have later numbers, and the 15-match numbers are plus or minus 2 wins. The mid ranks are not a measurement of today's game.
- **CPU against CPU.** Hard CPUs misuse at least 9 kits (`why-weak-fighters-weak.md`). Cup wins are weak evidence (the report says so).
- **My ranking is a choice.** Score = win % + 5 x cup wins; the cut at ranks 30 and 75 follows the owner's "about 30 to 75". Another formula (the 50/30/20 one in the shield report, which needs sim data for 31 fighters only) would move fighters by 5 to 10 ranks, mostly in the plateau.
- **KO columns are CPU-match counts.** The best kill move, median and lowest KO percent come from 5 to 23 KOs per fighter on a small flat stage; lowest is an outlier by nature. They are not comparable to Smash's "kills at X% at the edge". Comparing the two is by pattern only.
- **Finisher measurement.** The harness uses a still foe; set-up finishers read 0. The KO totals depend on the stage edge (the test arena is small; a horizontal launch carries a foe to a blast line at about 35%). Nothing here is a win rate.
- **Smash numbers** come from SmashWiki pages through a page summarizer (one per character; the first 100,000 characters only, 11,000 to 87,000 left unread per page). The jab startup is missing for seven (DK, Ness, Duck Hunt, Isabelle, Wii Fit, Sephiroth, Pichu); I tried ultimateframedata.com through WebFetch (connection reset) and the built-in browser (navigation refused), so no frame number from that site is in this report, and the earlier verified numbers in `smash-vs-ours.md` are not extended. Several KO percentages have no stage or DI condition. Meta Knight's jab startup (frame 4) and Isabelle's "under frame 10" are the wiki summariser's text; Meta Knight's real jab is commonly cited as frame 3, which I could not check. The wiki rank "of 82" and UltRank's tiers agree in order.
- **Matchup spread in Smash.** I found no matchup-chart numbers; the statement "every mid wins some matchups on its tool" rests on the wiki's strengths and weaknesses lists only.
- **Hidden fighters** are not ranked or named. Nothing was changed.

## 7. Sources
- UltRank, "UltRank 2026 Official Tier List for Smash Bros. Ultimate", Medium, 2026-05-06: https://medium.com/@ultrankssb/the-fourth-ultrank-tier-list-2026-9c5f6964f7e3 (read 2026-11-05; WebFetch returned 403, so the built-in browser pane was used, in my own tab, closed after).
- SmashWiki SSBU pages, read 2026-11-05: Donkey_Kong, Toon_Link, Zero_Suit_Samus, Rosalina_%26_Luma, Pac-Man, Sheik, Ness, Meta_Knight, Duck_Hunt, Inkling, Sephiroth, Pichu, Isabelle, Lucas, Wii_Fit_Trainer, Robin, Ridley, each at https://www.ssbwiki.com/<name>_(SSBU).
- Ours: `winrates.md`, `balance-pass-results.md`, `heavies-results.md`, `winner-move-types.md`, `world-cup-results.md`, `shield-reflector-design.md`, `jab-nerf-table.csv`, `move-catalog.csv`, `comeback-vs-rage.md`, `why-weak-fighters-weak.md`, `smash-vs-ours.md`, `docs/LEDGER.md` (FIN lanes c1, c2, 2026-11-02); the game `artifacts/V1/index.html` (`ATKSPECIALS` at about line 68479, `doAttackSpecial`, `FIN_CD` and `FIN_CD_SHARED` at 68477). Scratch scripts and data: the session scratchpad `mid\` folder (`fin.mjs`, `pw.mjs`, `master.py`, `kos.py`, `dist.py`, `mk.py`) and `weakwhy\` from the earlier report.
