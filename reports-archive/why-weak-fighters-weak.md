# Why weak fighters are weak: ours, Smash Ultimate's, and the comparison

*2026-11-04. Read-only research. Nothing in the game was edited, committed or pushed; no live relay was touched; no new simulation was run (the existing win-rate and balance-pass data were enough, see section 1). The game read is the working copy `smash-bal` (ii-dlc, adc4f68), which already contains the 10-28 balance pass. Companion file: `weak-fighters-causes.csv` (one row per fighter). Clover is judged by the same numbers as everyone else; her lack of a reliable kill move is not counted as a flaw (it is the owner's deliberate trade-off: her combos replace it), and nothing here proposes giving her one. The hidden prize fighters are not named.*

## The short answer

**Ours.** The weak fighters are not weak because they die sooner or because their kills come late. Against the other 84 fighters they die at nearly the same percent (median 126% against 131%) and take their KOs at nearly the same percent (118% against 125%). What they do is **land half as many stocks: 7.8 KOs in 15 matches against 16.9**, while losing about 5 more stocks (21.9 deaths against 17.2) and timing out more often (6.7 matches against 5.3 of 15). They lose the neutral: they land fewer hits that matter. The causes that are over-represented in the weak group, against the rest of the roster:

| Cause | Weak (26) | Rest (76) |
|---|---|---|
| Light or floaty (weight 76 or less, or fall 0.91 or less) | 14 (54%) | 34% |
| Weak jab (5% or less, or reach 2 or less) | 11 (42%) | 26% |
| Two or more specials that never hit | 8 (31%) | 13% |
| The CPU cannot use the kit (misread or never pressed) | 9 (35%) | not counted |
| KOs come mostly from the shared finisher | 7 (27%) | not counted |
| Slow run (0.92 or less) | 5 (19%) | 20%: not a cause |
| Recovery too short | 0 | |

**Smash.** The same 11 low-tier characters read from SmashWiki are weak mostly through **movement and disadvantage**: 9 of 11 are slow in the air or on the ground, all 11 have a named disadvantage or edgeguard problem (8 of them through the recovery move itself), 7 cannot approach or have short range, 5 are big and easy to combo, 5 have laggy, unsafe frame data. **Almost none of that is the problem in our game**, and the one thing we share (light or floaty bodies die early) is only one line in theirs.

**What keeps weak characters playable in Smash** is a universal defensive floor (shield, spot dodge, roll, air dodge for everyone), plus at least one elite tool each (Ganondorf's forward smash, Little Mac's KO Uppercut, Dedede's forward smash, Simon's range), plus rankings that come from human tournament results where specialists lift their characters (Mega Man rose 21 places, Isabelle 11, Duck Hunt 10 on the 2026 list). Ours has none of the floor, and our ranking is CPU against CPU.

---

## 1. Which of our fighters are weak, and how I know

**Sources (all ours).**
- `winrates.md`: the 2026-10-28 run, 102 fighters, 15 matches each against the same 15 mid-pack Hard CPUs (2 stocks, Goiky Field, items off). Noise is about +/-2 wins per fighter.
- `balance-pass-results.md`: after the pass (weight, damage stat, jab reach and launch buffs for about 20 fighters), 26 fighters played 30 matches. This is the better current estimate where it exists.
- The match logs of the 10-28 run (`scratchpad/winrates/shard*.jsonl.matches.jsonl`, every KO with the victim's percent and where it happened), recomputed here for all 102 fighters.
- `bottom-fighters.md` (the 10-28 diagnosis of the bottom 20), `jab-study.md`, `world-cup-results.md`, `move-catalog.csv` (31 fighters), and a fresh read of the live kit data (weight, stats, jab row, up-special row, move rows, kit text) of all 109 roster entries by booting the real game headless (jsdom).

**The weak set (26).** Everyone at 0 to 2 wins of 15 (18 fighters, Clover included), plus eight at 3 to 5 wins that the owner's control group or the 15-match noise makes relevant (Candle, Apple, Barf Bag, Tea Kettle, Teddy Bear, Book, Basketball, Taco (II)). "Now" is the 30-match result after the pass where there is one.

| Fighter | 10-28 (of 15) | After pass (of 30) | Fighter | 10-28 (of 15) | After pass (of 30) |
|---|---|---|---|---|---|
| Bow | 0 | not re-measured | Starfruit | 2 | 2 |
| Goo | 0 | 6 | Lightbulb | 2 | 6 |
| Lifering | 1 | 1 | Trophy | 2 | 15 |
| Balloon | 1 | 2 | Cammy | 2 | 1 |
| Box | 1 | 5 | Fern | 2 | 6 |
| Snowball | 1 | 10 | Paper | 2 | 5 |
| Yin-Yang | 1 | 7 | Pillow | 2 | 6 |
| Tissues | 1 | 5 | Candle | 3 | 7 |
| Teardrop | 1 | 5 | Apple | 3 | 5 |
| Clover | 2 | 9 | Barf Bag | 3 | 13 |
| Knife | 2 | 10 | Tea Kettle | 3 | 4 |
| | | | Teddy Bear / Book / Basketball / Taco (II) | 3 / 5 / 4 / 3 | not re-measured |

**The bottom ~10 now** (30-match result where there is one, otherwise 15): Cammy 1, Lifering 1, Balloon 2, Starfruit 2, Tea Kettle 4, Box 5, Teardrop 5, Paper 5, Tissues 5, Apple 5, plus Bow (0 of 15, not re-measured) and Goo (0 of 15, 6 of 30). The earlier control fighters Dora and Bubble were weak in an earlier Hard-CPU run: Dora is 11 of 15 in the 10-28 run; Bubble was 11 of 15 only while her reform passive lasted, and was about 3.5 of 15 after it went (weight 66 was not enough; fall 0.97 and damage 1.1 were added on 11-02, per the comment in `FIGHTER_STATS`).

I did not run a new simulation: the 10-28 run covers all 102 fighters and the pass re-measured 26 of them, so a 20-match free-for-all (about 7 appearances per fighter) would have been noisier than what already exists.

## 2. What the data says about *how* they lose

Computed from the 10-28 match logs, weak 18 (0 to 2 wins) against the other 84:

| Per 15 matches | Weak 18 | Other 84 |
|---|---|---|
| KOs scored | **7.8** | **16.9** |
| Deaths | 21.9 | 17.2 |
| Median foe % when they KO | 118 | 125 |
| Median own % when they die | 126 | 131 |
| Deaths off the top (share) | 45% | 40% |
| Deaths to a foe's jab (share) | 36% | 34% |
| Matches that went to the 2-minute cap | 6.7 | 5.3 |

So: the weak ones are **not** unusually fragile in each stock, and **not** short of kill power when a kill is on. They take half the stocks. That is a neutral and damage problem (they hit less, and the CPU fights at jab range), not a "no kill move" problem. Win rate by single stat across all 102 fighters (stats from the live build, win rates from 10-28, so about 20 buffed fighters are slightly off):

| Stat | Bottom bin: mean wins of 15 | Top bin |
|---|---|---|
| Jab damage | 5% or less (27 fighters): 5.6 | over 8% (17): 8.9 |
| Weight | 72 or less (22): 5.5 | 100 or more (21): 8.7 |
| Fall stat (floaty to heavy) | 0.91 or less (24): 5.5 | 1.01 or more (39): 7.3 |
| Jab reach | 0-2 (9): 5.8 | 9-13 (16): 8.4 |
| Up-special rise | 191 px or more (12): 4.5 | 120-150 px (47): 7.4 |

Spearman correlation with wins: weight +0.28, jab damage +0.25, fall +0.22, air control -0.26, up-special rise -0.18, hurtbox size -0.04, run -0.02. Two readings. (1) The signals are real but modest (3 wins from bottom to top bin): no single stat explains the bottom. (2) **The generous recoveries and big smashes our weak fighters carry did not turn into wins**: more up-special rise goes with fewer wins, which means the kit budget was spent on tools that do not win the neutral.

**Recovery is not a cause.** The jump bank (two jumps plus the up-special, by the game's gravity: rise = v squared over 2g) is 229 px at the very lowest and 398 px at the median; the weak group's median up-special rise is 163 px against 140 for the rest, and no weak fighter has a recovery under about 280 px (Bow, 283, recovers with a 240 px Teleport instead; Snowball, 329, also has the stat `rec` 1.25). Balloon's is 476 px and he still has the worst death numbers in the set, because he dies off the top.

**Weight matters about as much as Smash's gap.** Knockback is multiplied by min(1.7, 100 / weight): 1.52 for Balloon (66), 1.43 for Starfruit, Lightbulb and Clover (70), 1.16 for the median fighter (86), 0.96 for Fern (104). In a direct test (the live game, a template up-throw launch of 12, ground hit at centre stage, Goiky Field) a 66 body dies at 90%, a 76 at 110%, an 86 at 120%, a 104 at 130%. That is a 40-point spread, the same size as the 40-to-60-point light-to-heavy gap Dignitas gave for Smash in 2019.

**Kill ability among normal moves is the same for everyone.** The tilts, aerials and throws are shared templates: every fighter's up tilt launches 10.0 to 11.0, best back air 8.6 to 10.2, up throw 11.4 to 12.1 (all 109 rows). The same template up-throw kills an 86 body at about 120% for everybody, the weakest included. The differences in KO power come only from smashes, finishers, jab boosts and special moves. So "no kill move" is the wrong frame for most of the group; "the special that kills is out of reach or used once" is the right one.

## 3. Cause table, with counts (26 fighters)

Rules for each tag are in the CSV. A fighter can have several.

| # | Cause | Count | Who |
|---|---|---|---|
| 1 | **Light or floaty body** (weight 76 or less, or fall 0.91 or less): knockback x1.3 to x1.5, dies early or off the top | 14 | Bow, Goo, Lifering (fall), Balloon, Tissues, Teardrop, Clover, Starfruit, Lightbulb, Cammy, Paper, Candle, Barf Bag (fall), Teddy Bear (fall) |
| 2 | **Weak jab as the neutral tool** (5% or less, or reach 0-2). The jab is 30% of all KOs and the top damage move of most kits | 11 | Goo, Lifering, Yin-Yang, Teardrop (3%, reach 0), Clover, Starfruit, Trophy, Cammy, Candle, Tea Kettle, Teddy Bear (reach 2) |
| 3 | **The CPU cannot use the kit** (misread as a shooter, move never pressed, beam only fired point-blank). Real for a human player, so these rates understate the fighter | 9 | Bow, Box, Barf Bag, Starfruit (Recycle), Cammy (Snapshot), Teardrop (THE KICK), Tissues, Lightbulb (beams), Clover (Butterflies) |
| 4 | **Two or more specials that never hit** (escapes, buffs, heals, armour) | 8 | Balloon, Box (3), Teardrop, Clover, Starfruit, Candle, Barf Bag, Book |
| 5 | **KOs come from the shared or one finisher**, not from the kit's own moves | 7 | Box, Teardrop, Tissues, Starfruit, Yin-Yang (4 of 9), Tea Kettle, Book. Clover is excluded as a flaw: her 8 of 11 is the combo-and-finisher design |
| 6 | **Dies off the top** (half or more of deaths) | 7 | Balloon (15 of 25), Pillow (13 of 22), Cammy (12 of 21), Trophy, Basketball, Paper, Box: the vertical cost of cause 1 |
| 7 | **Slow run** (0.92 or less) | 5 | Bow, Goo, Starfruit, Candle, Teddy Bear (Snowball was one until the pass). Not over-represented (20% of the rest too) |
| 8 | **Recovery too short** | 0 | none |
| 9 | **No flaw visible on paper** (decent weight, jab 7%+, normal kit; loses jab trades) | 4 | Knife, Apple, Taco (II), Snowball after his fix: expect 15-match noise and CPU habits |

Cause 2 and the foes' jabs are the same story from two sides: 36% of the weak group's deaths are to a foe's jab (`bottom-fighters.md`: 118 of those 158 came from six foes), and nobody in our game has a shield, a spot dodge or an air dodge to answer one (section 5).

## 4. The fighters, one line each (bottom first)

The full numbers (weight, stats, jab, up-special rise, KOs, deaths, off-the-top, jab deaths, finisher KOs) are in the CSV.

**Bow (0 of 15).** Light (74, x1.35), slow, floaty. Her CPU never presses Chair Slam (13%) or Snowballs; Teleport is used only to recover; 18 deaths (fewest) but 11 time-outs (most in the roster). A CPU problem first; the owner has said to leave her alone.
**Goo (0, then 6 of 30).** Weight 76, run 0.91, jab 5% (reach 0 before the pass, 8 now). His finisher does 0%. His smash Puffed Up is among the strongest in the game (launch 14.5, KOs a medium foe from about 37%) but scored 0 of his 5 KOs in the 15 matches, because the CPU only smashes on an opening and a reach-0 jab rarely makes one; after the pass it was his top KO move (9 of 27).
**Lifering (1, then 1 of 30).** 11 of 24 deaths to jabs on a light body (weight 75, 81 now); jab 5%; his finisher stuns for 0%; the down special heals. Weight +6 did nothing measurable.
**Balloon (1, then 2).** The lightest body (66, x1.52), floaty; dies at 104%; 15 of 25 deaths off the top; Levitation and Insult Tirade never hit; up-special bank 476 px. A light-body problem and nothing else.
**Starfruit (2, then 2).** Light (70), slow (0.92), jab 5%. One-Hit Wonder is 14% once per stock, then a 6% shove until he presses Recycle, which the CPU never does.
**Cammy (2, then 1).** Light (74), jab 5%, a kit that is all set-up; the CPU fires Snapshot point-blank though it hits 170 px ahead; 12 of 21 deaths off the top. Still bottom after smash launch 10 to 12.
**Tea Kettle (3, then 4).** Weight 94, jab 5%; 6 of 10 KOs from the shared finisher (he has his own since Update 1). The pass did not touch him.
**Box (1, then 5).** Weight 86, fine. Three of four specials never hit, 3 KOs in 15 matches (fewest in the roster), and the CPU counts Everything Packed as a shot and stays 230 px away.
**Teardrop (1, then 5).** Light (72, x1.39), jab 3% with reach 0 by design. THE KICK (14%, launch 14) is a top move, pressed about 15% of close decisions. 7 of 10 KOs are her finisher.
**Paper (2, then 5).** Light (76), floaty (fall 0.89), air 1.12; damage in small pieces; median KO at 145%.
**Tissues (1, then 5).** Weight 83, fall 0.90, jab 7% / reach 8; a 480 px beam smash the CPU only fires point-blank; 5 of 8 KOs are the shared finisher.
**Apple (3, then 5).** Weight 82 (70 before), jab 7% / reach 15, a launch-14 smash. No visible flaw; KOs late (median 145%).
**Clover (2, then 9 of 30).** Judged on the numbers, she is weak on the first run and middling (30%) after the pass. Causes that are real: light (70, x1.43), floaty (fall 0.89), the earliest median death in the group (115%), a 5% jab, two specials that never hit (Lucky Wind and Meant for Me), and the CPU treats Butterflies as a shot and plinks for 2%. Her recovery is the best in the roster (232 px up, bank 562 px), so it is not that. Her 8 of 11 KOs coming from the finisher is the design trade-off, not a finding. I cannot verify the combo claim: a CPU plays every kit as a jabber, so her combo game is mostly invisible in these numbers. What a change would target, if the owner wants one: body weight or fall, the jab, or her damaging special (Butterflies, 2%), not a kill move.
**Goo, Pillow, Lightbulb, Fern, Yin-Yang, Candle (6 to 7 of 30), Snowball and Knife (10), Trophy (15), Barf Bag (13):** see the CSV. Trophy's jump from 2 of 15 to 15 of 30 came from the reach-8 jab while keeping the empowered jab; Snowball's 1 to 10 from run 0.91 to 1.0 and jab reach 2 to 6; Knife's 2 to 10 from a 1.1 damage stat.

**What the pass teaches.** Buffs that changed the neutral tool (jab reach, damage stat, run) moved fighters by 5 to 11 wins per 30; buffs that were one weight number (Lifering +6, Paper +6, Apple +12, Teardrop +6) moved them by 0 to 3, inside the noise. The 10 fighters buffed by one number each went from 29 to 37 wins in 300 matches, and still die about 45 times per 30.

**The World Cup disagrees with the CPU run in a useful way.** In the owner's 50 Expert-CPU results the low CPU rankers kept making the memorable plays: Pillow made the PoTM in finals #9 and #32 (and lost both), Bow made the PoTM in #10, Goo in final #35 (`world-cup-results.md`). That fits cause 3: some of these fighters are weak mostly because of how the CPU plays them.

## 5. Smash Ultimate: why its low tier is weak

**The list.** UltRank's fourth official tier list, released 2026-05-06, read directly from the UltRank post (Medium, "UltRank 2026 Official Tier List for Smash Bros. Ultimate", https://medium.com/@ultrankssb/the-fourth-ultrank-tier-list-2026-9c5f6964f7e3, read 2026-11-04 in the built-in browser; EventHubs reported it on 2026-05-09, https://www.eventhubs.com/news/2026/may/09/ultrank-fourth-tier-list/). The owner's picture matches it. Bottom of the list:
- **E:** Simon/Richter, Little Mac, Ganondorf.
- **D-:** Marth, Dr. Mario, Ike, King K. Rool, King Dedede, Villager.
- **D+:** Mii Swordfighter, Mewtwo, Zelda.
- **C-:** Banjo & Kazooie, Bowser Jr., Lucario, Jigglypuff, Chrom, Link, Bowser, Incineroar, Kirby, Piranha Plant.

The post says the bottom tiers are characters held back by inconsistencies and fundamental gaps in the game plan, that Japan ranked the Belmonts last (below Ganondorf), that NA and EU named King Dedede as the third worst, and that every region put Little Mac above Ganondorf. Tiers come from 73 panelists' 1-10 ratings, grouped by k-means.

**Why each is weak** (SmashWiki character pages, read 2026-11-04, paraphrased; ranks are SmashWiki's "of 82", no list date given, and they agree with the UltRank membership above: E = 80 to 82, D- = 74 to 79):

| Character (rank of 82) | Main weaknesses | Numbers found | Source |
|---|---|---|---|
| Ganondorf (82, E) | Slow everywhere, poor approach, worst-in-class recovery (Dark Dive short, Flame Choke mashable), laggy unsafe moves, short grab, no projectile, throws do not kill | weight 118; jab frame 7; up tilt frame 60 (95 total); forward smash frame 29, KO about 56%; run 1.34, air speed 0.83 | https://www.ssbwiki.com/Ganondorf_(SSBU); frame data https://ultimateframedata.com/ganondorf |
| Little Mac (81, E) | Poor air game, among the worst recoveries (one Haymaker per airtime, air dodge lag 50), short range and no disjoint, falls fast so combo food | weight 87; jab frame 1; third-fastest dash; KO Uppercut kills before 40% when the meter is full | https://www.ssbwiki.com/Little_Mac_(SSBU) |
| Simon/Richter (80, E) | Recovery among the worst, slow ground and air movement, poor disadvantage, narrow whip hitboxes, Holy Water limited to one | second-longest disjoint in the game; walk 4th slowest | https://www.ssbwiki.com/Simon_(SSBU) |
| Villager (79, D-) | Weak approach and close range, slow grab, beaten by reflectors and fast rushdown, hard to KO in neutral; the faster pace and low rage hurt his plan | weight 92; ranks 69, 72, 76, 79 across lists; neutral air frame 3 | https://www.ssbwiki.com/Villager_(SSBU) |
| King Dedede (78, D-) | Slowest air speed, slowest jab and dash attack, huge hurtbox so combo food, bad disadvantage, Gordo can be reflected | weight 127; forward smash up to 25%; ranks 80, 79, 77 | https://www.ssbwiki.com/King_Dedede_(SSBU) |
| King K. Rool (77, D-) | Heavy end lag, few moves safe on shield, large and fast-falling (combo food), slow predictable recovery, ledge trapped | weight second-heaviest; jab frame 3; belly armor has a durability limit | https://www.ssbwiki.com/King_K._Rool_(SSBU) |
| Ike (76, D-) | Poor disadvantage, laggy aerials, predictable straight-line recovery, slow | weight tied 13th heaviest; forward smash KO about 75%; counter frame 9 | https://www.ssbwiki.com/Ike_(SSBU) |
| Dr. Mario (75, D-) | Slow on the ground and in the air, short recovery, short range, fewer KO confirms | middleweight; speeds about 0.79 of Mario's; damage about 1.18x Mario | https://www.ssbwiki.com/Dr._Mario_(SSBU) |
| Marth (74, D-) | Needs the tipper, weak outside it, linear recovery, hard to escape juggles, no projectile, weak throws | fast walker; tipper smashes KO early | https://www.ssbwiki.com/Marth_(SSBU) |
| Zelda (73, D+) | Poor mobility, floaty and tall in disadvantage, committal Phantom, inconsistent combos, outcamped | light; **good** recovery (Farore's Wind); strong KO power | https://www.ssbwiki.com/Zelda_(SSBU) |
| Mewtwo (72, D+) | Light, large body, poor disadvantage, trouble approaching | tied 7th lightest; **excellent** recovery; third-fastest air speed | https://www.ssbwiki.com/Mewtwo_(SSBU) |

**Community sources for the bottom two.** EventHubs, "Who are the 10 worst characters in Super Smash Bros. Ultimate?" (Justin Gordon, 2021-07-31, https://www.eventhubs.com/news/2021/jul/30/worst-characters-ssbu-panda-global): Ganondorf an automatic pick, Little Mac held back by weak aerials and a very poor recovery. A search summary of the Hungrybox and LumiRank lists (2024) also put Ganondorf alone at the bottom and said Little Mac lost his best kill confirm when his down tilt was nerfed (not read at the source; treat as unverified).

**Counts across the 11:**

| Cause | Characters | Count |
|---|---|---|
| Slow ground or air movement | Ganondorf, Little Mac (air), Simon, Villager, Dedede, K. Rool, Ike, Dr. Mario, Zelda | 9 |
| Bad disadvantage or edgeguard problem | all 11 | 11 |
| ...through the recovery move itself | Ganondorf, Little Mac, Simon, Ike, Dr. Mario, Marth, Dedede, K. Rool | 8 |
| Cannot approach, or short range | Ganondorf, Little Mac, Villager, Dr. Mario, Zelda, Mewtwo, Marth | 7 |
| Big or heavy, easy to combo | Little Mac, Dedede, K. Rool, Ike, Mewtwo | 5 |
| Laggy, unsafe frame data | Ganondorf, Dedede, K. Rool, Ike, Simon | 5 |
| KOs are hard to confirm in neutral | Villager, Dr. Mario, Marth, Ganondorf, Zelda, Dedede | 6 |

Bad recovery is the headline cause in Smash's bottom; note that Zelda and Mewtwo have good recoveries and are still low, because the disadvantage state is the problem, not the up-special.

## 6. The comparison

### Same kind of weakness
1. **Light bodies die early.** Smash: Mewtwo, Zelda. Ours: 14 of 26, with knockback x1.3 to x1.5 and a 40-point KO spread between a 66 and a 104 body, the same size as Smash's light-to-heavy gap.
2. **Cannot win the neutral.** Smash: 7 of 11 cannot approach or lack range. Ours: the CPU fights at jab range and a 5% or reach-0 jab loses the trade (cause 2); KOs halve while KO percent stays the same.
3. **A game plan that needs set-up or advantage.** Smash: Villager, Dedede's Gordo, Zelda's Phantom. Ours: Starfruit's Recycle, Cammy's set-up kit, Box's three non-hitting specials.
4. **Strong tool, hard to reach.** Smash: Ganondorf's forward smash starts on frame 29; Marth's tipper is a spacing test. Ours: Puffed Up, THE KICK, the 480 and 520 px beams.

### Unique to us
1. **Recovery is not a weakness at all (0 of 26)**, where it is Smash's top cause (8 of 11). Our up-specials are budgeted generously (median bank 398 px).
2. **Heavy and big is not punished.** In Smash five of the bottom nine have a big or heavy body that gets combo'd (Dedede 127, K. Rool, Ganondorf 118, Ike, Little Mac). Ours: weight is almost pure upside (it only slows run and air above 100, up to -15%); the hurtbox is drawn from the art and has **no relation to weight** (correlation -0.01) **and no relation to wins** (-0.04), though its area varies 3x across the roster. Heavy fighters win more (100+ body: 8.7 of 15 against 5.5 for 72 or less).
3. **Dead-button specials.** 8 of 26 weak kits have two or more specials that never hit (13% of the rest). Smash kits have no equivalent: every low-tier character's specials do something that wins or loses exchanges.
4. **The CPU decides part of the ranking (9 of 26).** Smash tiers are human tournament results (73 panelists rating players' real results); ours are Hard-CPU win rates in 15 matches.
5. **The jab is the main weapon and the main killer** (30% of KOs, 38% of damage; Smash's jab is its weakest move), so a weak jab is the whole neutral.
6. **All kits share one set of tilt, aerial and throw launches**, so kill ability among normals cannot differ. Smash's bottom characters differ most in exactly those moves.

### What keeps weak characters playable in Smash
- **A defensive floor the same for everyone**: shield (starts on frame 1), spot dodge (intangible from frame 3), roll, air dodge, which is why a frame-2 poke is fair there. Numbers are in `smash-vs-ours.md` section 4 (SmashWiki Shield, Spot dodge, Air dodge, Roll pages, read earlier today; I did not re-read them for this report). Ours has none of the four.
- **At least one elite tool each**: Ganondorf's forward smash KOs near 56% centre stage, Little Mac's KO Uppercut before 40%, Dedede's forward smash up to 25%, Ike's forward smash near 75%, Simon's second-longest disjoint, Dr. Mario's 1.18x damage. The opponent must respect something.
- **Endurance for the heavy**: Ganondorf 118, Dedede 127 survive much longer than their tier suggests; **speed or recovery for the light**: Mewtwo and Zelda have the best recoveries in the game. A weakness is paid for somewhere. Ours spends the budget on recovery for the light, which does not win.
- **Rage** (up to about 1.1x knockback, 35% to 150%): a small help for the heavy at high percent.
- **Specialists and patches lift characters**: Mega Man +21 places, Isabelle +11, Duck Hunt +10, Donkey Kong +7 on the 2026 list; Dedede and K. Rool were buffed in updates.

### Ranked lessons for us (what a change would target; none applied, none a number)
1. **Give every weak kit one reachable damaging tool, and audit the 8 dead-button kits.** Target: the second or third special of Balloon, Box, Teardrop, Starfruit, Candle, Barf Bag, Book (Clover's two are escapes and a counter, her design). Smash's rule is that every kit has something to win exchanges with.
2. **Pay the light body back in the neutral, not in recovery.** Target: the 14 light or floaty kits; Smash's light characters get speed or a strong recovery and kill early because of it. Ours get a big recovery that is not the problem. Candidates: run or air speed, jab damage or reach, or a lower knockback multiplier floor.
3. **Fix the jab as a trade tool rather than a stat.** Target: the 11 weak jabs (5% or reach 0-2) and the empowered-jab banks. The pass showed this is what moves win rates (Trophy 2 to 15 of 30), while weight-only buffs did not.
4. **Measure with a second yardstick.** Smash ranks results by people; the owner's World Cup already shows Pillow, Bow and Goo making finals and PoTMs. Treat the 9 CPU-misread kits as "unknown", not "weak", before spending balance changes on them. (This is not a request to tune the CPU.)
5. **Keep the strengths that already work**: no hurtbox penalty for heavies and generous recoveries are why recovery is not a problem; these should stay.
6. **A speed budget in place of a shield** (`smash-vs-ours.md`, lesson 3): without a defensive option, the fastest hits cannot also be the strongest. This is the structural cause behind why foes' jabs take 36% of the weak group's stocks.

## 7. Honest limits

- **CPU against CPU.** Every win rate is Hard-CPU against Hard-CPU, 15 matches (+/-2 wins), one per-fighter seed set. At least 9 fighters' results are partly the CPU's misuse of the kit; a human may find them fine. 563 of 1530 matches hit the 2-minute cap and were decided on damage.
- **Mixed builds.** Win rates are from 10-28 (before the balance pass, jab reach 8 and the 20 own finishers of Update 1); the stats I tabulate and correlate are from the live working copy. About 20 fighters changed in between, so the bin tables are slightly off. The post-pass figures are 30-match totals (+/-2 to 3 wins); 26 fighters have one, Bow, Teddy Bear, Book, Basketball and Taco (II) have not.
- **The cause tags are rules over data, not experiments.** I did not A/B any cause. Correlations (weight +0.28, jab +0.25) are modest and confounded by the kit budget.
- **Hurtbox, knockback and recovery** numbers come from the code and from a small controlled test (weights 66, 76, 86, 104, one launch vector, 10% steps); the recovery bank is calculated, not measured in a match.
- **KO percent per move** exists only for 10 of the group (`move-catalog.csv`, a 30-match simulation); for the rest I used launch size and the match logs.
- **Smash numbers** are from SmashWiki pages read through a page summarizer (no list date on the ranks, no section past the first 100,000 characters read on any page), plus ultimateframedata for Ganondorf only (jab 7, up tilt 60); the Little Mac and Dedede frame-data pages could not be opened. Smash's low-percent KOs are cited from one 2019 Dignitas article in `smash-vs-ours.md`. The Hungrybox/LumiRank claims in section 5 come from a search summary only.
- **Clover:** I could not check that her combos are strong; no measure here sees them.
- **Nothing was changed.** The owner decides on every item in the ranked list.

## 8. Sources

- UltRank, "UltRank 2026 Official Tier List for Smash Bros. Ultimate", Medium, 2026-05-06: https://medium.com/@ultrankssb/the-fourth-ultrank-tier-list-2026-9c5f6964f7e3
- EventHubs, "UltRank releases their fourth official tier list...", 2026-05-09: https://www.eventhubs.com/news/2026/may/09/ultrank-fourth-tier-list/
- EventHubs (Justin Gordon), "Who are the 10 worst characters in Super Smash Bros. Ultimate?", 2021-07-31: https://www.eventhubs.com/news/2021/jul/30/worst-characters-ssbu-panda-global
- SmashWiki SSBU pages (read 2026-11-04): Ganondorf, Little_Mac, Simon, Villager, King_Dedede, King_K._Rool, Ike, Dr._Mario, Marth, Zelda, Mewtwo at https://www.ssbwiki.com/<name>_(SSBU) (Dr._Mario, King_K._Rool use those spellings).
- Ultimate Frame Data, Ganondorf: https://ultimateframedata.com/ganondorf (read 2026-11-04).
- Dignitas (2019-02-19), via `smash-vs-ours.md`: https://dignitas.gg/articles/news/smash/13317/how-to-finish-your-opponent-in-smash-bros.-ultimate-kill-moves-for-each-character
- Ours: `winrates.md`, `balance-pass-results.md`, `bottom-fighters.md`, `jab-study.md`, `world-cup-results.md`, `move-catalog.csv`, `smash-vs-ours.md`; game code `artifacts/V1/index.html` (applyHit knockback at about line 87895, `FIGHTER_STATS` at 23384, `HURTBOX` at 22612, `HEAVY_SLOW` at 23500, `UPSPEC` at 67376); scratchpad scripts and data in `weakwhy\` (`dump.mjs`, `an.py`, `ev.py`, `build.py`, `ko.mjs`, `hb.mjs`).
