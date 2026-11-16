# Smash Ultimate vs Battle for Smash Island: move design, CPU play, high tier

## VERIFIED against ultimateframedata.com (2026-11-04, second pass)

*Method: each character page was read directly in the built-in browser pane, from the page's own labelled columns (startup, total frames, landing lag, damage, shield advantage, notes), not through a summariser. Pages read: https://ultimateframedata.com/steve, /sonic, /snake, /mr_game_and_watch, /rob, /minmin, /kazuya, /diddykong.php, /pyra, /mythra, /luigi, /peach, /yoshi, /fox, /joker, plus /mario as the baseline (15 pages for 14 characters, Pyra and Mythra being two pages). Numbers and one-line paraphrases only. G&W's page exists at /mr_game_and_watch (the first pass tried /gameandwatch and /gamewatch and got 404).*

*Not on the site, so NOT verified here: shield (frame 1, drop lag 11, perfect-shield window 5, 50 shield health), rage, the hitstun formula, KO percents, Computer-player behaviour, Snake down throw about 160%; those stay SmashWiki or Dignitas sources. Min Min's neutral B and side B rows are not on its page (the page parses to 50 move rows with only up B and down B), so Min Min's specials are partly unread. The "Stats" row of each page is an empty row in the markup and was not read.*

**Result in one line:** the speed numbers of the first pass were right (jab startup, dash attack startup and shield advantage, bair startup, grab, tilts, fsmash). What was wrong is a handful of ranges, one sweeping rule built on them (the "speed budget"), and three conclusions that change: throws, projectile damage and the back air.

### A. Earlier numbers that were WRONG or imprecise (each is also marked [V#] in the old text below)

| # | Earlier claim | Verified value (page) | Verdict |
|---|---|---|---|
| V1 | Jab 1 damage "1.0 to 3.0% per hit" | Jab 1: 1.8 to 3.0 for 14 of 15 fighters (Fox 1.8; Sonic, Diddy, Luigi, Peach, Joker, Mythra 2.0; Snake, Min Min 2.5; ROB, G&W, Kazuya, Yoshi, Pyra 3.0); Steve 2.7 to 4.5 by tool; median 2.5. 1.0 is Fox's jab 2 (/fox). The jab 3 finishers hit 4 to 6 (Mario 4, Sonic 4, Snake 6) and Kazuya's jab 10 is 12 and unblockable (/kazuya). Jab 1 startup "2 to 6, median 3" was RIGHT. | imprecise |
| V2 | "Ground moves of 10% or more start on frame 6 or later"; "a speed budget rule: no ground hit above about 4% before frame 6" | Fast strong ground hits exist: Snake dash attack frame 5 at 11 (-26 on shield, /snake), Mario down smash frame 5 at 10 (-30, /mario), Fox up tilt frame 3 at 6 to 8 (-17, /fox), Luigi forward tilt frame 5 at 9 (-18, /luigi), Yoshi forward tilt frame 5 at 8 (-16, /yoshi), Mario forward tilt frame 5 at 7 (-13). Every one is -13 or worse on shield. The rule in Smash is "fast and strong means a big shield disadvantage and a short total", not "strong means slow". | WRONG rule |
| V3 | "Smash's smashes start on frame 13 to 25 ... Kazuya 25 is the slowest of the seven, Snake 41" | Forward smash first hit: 12 to 41, median 16 over 15 fighters (Snake 41 is the slowest, Kazuya 25, Pyra 20, G&W 17); the "13 to 41, median 16" figure was right. But up and down smashes are much faster: the fastest smash per fighter is 5 to 12, median 8 (Diddy up smash 5, Mario down smash 5, Fox / Min Min / Luigi / Peach down smash 6, ROB / Yoshi 7, Steve / Snake / Mythra 8). So the "Kazuya is the slowest" sentence was wrong and "all Smash smashes have a 13+ frame wind-up" is wrong. | imprecise, one wrong sentence |
| V4 | Projectile "startup 9 to 25 ... 1.4 to 7 per shot" | Startup 8 (Snake grenade throw) to 41 (Nikita), median about 16 (Fox 9 to 20, Joker 12, Pyra 13, Diddy 16, Mario / Luigi 17, ROB 25, Kazuya 27). Damage per shot 1.4 to 23, not 1.4 to 7: Kazuya blaster 10 to 12 (/kazuya), ROB beam 7 uncharged and 15 to 22 charged (/rob), Mythra Buster 17 charged, Diddy popgun up to 15 (23 misfire), G&W sausage 5 / 13, Pyra Flame Nova up to 13, Luigi 6 / 5, Joker 5 / 3 / 1, Fox 1.4 to 3. | WRONG range |
| V5 | Down air "3 to 20 (median 15)"; "dair 8 vs 15" | For the first eight characters the median of those eight values is 16 (Snake 3, Fox 5, Mario 5, Min Min 15, Sonic 17, Kazuya 17, Steve 20, ROB 20). Over the 15 high-tier pages the median is 15, so "ours 8 vs 15" holds for the high tier. Landing lag 12 to 35 and damage 3 to 18 are right. | imprecise (15 stands) |
| V6 | Dash attack shield advantage "-16 to -38" | -12 to -38: Steve -15 (fist) to -12 (stone), Diddy -14, Peach -14. Startup over 15 fighters is 4 to 17 (Pyra 17, Kazuya 15, Yoshi 10). "Always punishable on shield" stays true (all 15 negative). | imprecise |
| V7 | G&W page "could not be fetched; G&W facts from SmashWiki only" | Read now (/mr_game_and_watch): jab 4 at 3.0; ftilt 8 at 12; utilt 10; dtilt 6 at 9; dash attack 6 at 10 (-21); fsmash 17, usmash 21, dsmash 12; bair is a 4-hit multi-hit starting 10 at 2 to 3 per hit, not a kill move; fair 10 and 44 (3 / 12); grab 6; back throw 26 for 8, up throw 26 for 12; Fire 3 with invulnerability 5 to 13; Oil Panic absorbs from frame 6 and overloads for 16 to 48. | gap filled |
| V8 | Spot dodge "intangible 3 to 17 (total 25)"; roll "intangible about 4 to 12 (total 26 to 29)" | Mario spot dodge: intangible 3 to 17, total shown as 20/25 (two values); Fox 3 to 14, total 18/23. Roll: Mario intangible 4 to 15, total 29; Fox 4 to 12, total 26. Air dodge: Fox 2 to 26, total 38, landing lag 10 (RIGHT); Mario 3 to 29, total 52. So "roll 4 to 12" is Fox only. | imprecise |
| V9 | Throws: "22 back and 22 up throws kill at 100% or less" (read as ours being too strong) | Smash back throw damage 4 to 14, median 10 over 15 fighters (Min Min 14, Kazuya 14, Diddy 12, Peach 11, Steve / ROB / Luigi / Joker 10); up throw median 8 (4 to 12). Ours: back throw median 7.6 (5.5 to 9.4), up throw 5.0 (4 to 6), from `move-catalog.csv` (31 fighters). Ours are WEAKER in damage than Smash's. Smash back throw startup 10 to 46, median 20 (Kazuya 46, Sonic 43, Min Min 31). Kazuya's throws "5 to 14" are 2 to 14. | conclusion changes (C2) |
| V10 | Steve "anvil down air: startup 20, 18% (10% landing)" | Dair startup 20, total 59, landing lag 18, damage 18 / 10 where 10 is the late hit, not the landing (/steve). | imprecise |
| V11 | Snake up B "startup 6"; Mario up B "intangible 3 to 6" | The site gives Snake's Cypher startup as "--" (armour on frames 7 to 94, hit 6.0); Mario's up B shows startup 3, landing lag 30 and no intangibility note. Neither "6" nor "3 to 6" is confirmed. | unverified |
| V12 | Snake C4 "place about 25 to detonate" | Placement startup 9 (total 24); detonation 25 frames, 17 damage, +20 / +11 on shield; the C4 explodes on its own after 26.6 s (/snake). | imprecise |
| V13 | "No timer lock / pin in the pages fetched" | Yoshi's Egg Lay (neutral B, startup 19) encases the foe (the egg appears on frame 33; /yoshi); the page does not give the escape rule. So the 14 do contain one lock-style move. | gap filled |
| V14 | True killer: bair "startup 6 to 19, median 11" and "ours has half the startup" | The first seven (Mario, Snake, Fox, Kazuya, Steve, Sonic, ROB) are right: 6 / 7 / 9 / 11 / 12 / 13 / 19. Over the 14 high-tier fighters (Min Min has no back air on the page) the range is 5 to 19, median 10: Diddy 5, Luigi 6, Peach 6, Joker 7, G&W 10 (multi-hit), Mythra 10, Yoshi 11, Pyra 16. Our median 5 equals the fastest Smash bair (Diddy 5, 9 damage, landing lag 7), so "half the startup" becomes "equal to the fastest". Landing lag is 7 to 19 in the 14. | imprecise (C4) |
| V15 | "Counters not fetched" | In the 14: G&W Oil Panic absorbs from frame 6; Peach Toad counter frames 9 to 34; Joker Rebel's Guard block from 3 (counterattack 8) and Arsene counter 4 to 31; Fox reflector 3 (reflects from 4); Kazuya Heaven's Door armour frames 5 to 13 (10% damage-based). | gap filled |
| V16 | "The S- seven were not analysed" | Analysed now (section C). | gap filled |

**Checked and RIGHT (no change):** jab 1 startup of all 8 first-pass characters; jab 1 shield advantage (Sonic -13, Snake -8); Mario's three jab hits 2.2 + 1.7 + 4.0 = 7.9 (the "over 73 frames" is not checkable on the page); dash attack startup (Fox 4, Sonic 5, Snake 5, Mario 6, Min Min 7, ROB 7, Steve 8, Kazuya 15) and damage; Fox dash attack 4 at 6; every shield-advantage value quoted for the first seven; utilt (3 to 9, median 5.5), dtilt (3 to 16, median 6.5 for the first eight) and ftilt (Mario 5, Snake 4+8, ROB 7, Min Min 14); bair startup, landing lag and damage for the first seven; fsmash median 16; grab 6 to 8 (Steve 13, Min Min 18); pummel 1.0 to 3.4; Snake utilt 6 at 14.5 and dtilt 6 at 12; C4 17 damage and +20 on shield; Nikita 41 at 7 / 14; Fox blaster 9 to 20; Mario fireball 17 at 5; ROB beam 25; Kazuya blaster 27; Kazuya EWGF 8, Rage Drive 10 to 14 at 12.6 to 14.3, dragon uppercut 5+15 at 22; Cypher armour 7 to 94; ROB Burner invulnerable 2 to 4; Fox reflector 3, invulnerable 2 to 3; G&W Fire startup 3; Steve dair 20 at 18; bursts (Mario nair 3, Fox nair 4, Sonic nair 6). The CSV `verified` column marks each row.

### B. Conclusions that change

- **C1 (change). The "speed budget" suggestion is wrong as worded.** Smash has at least ten fast strong ground hits (V2). What every one shares is a shield advantage of -13 or worse and a short total (25 to 41 frames), with a defender who can shield. The rule that carries over is "strong and fast must be punishable", which we cannot express without a shield. Our jab (frame 2, median 7.5%, up to 11.4, one hit, on all 31 fighters) is still far outside Smash: jab 1 hits 1.8 to 4.5 in the 15 pages, and the strongest hit on frame 3 or earlier is Fox's up tilt at 6 to 8.
- **C2 (change). Throws are not too strong in damage.** Ours are 7.6 (back) and 5.0 (up) against Smash's 10 and 8. The levers are the launch (22 back and 22 up throws kill at 100% or less) and the 4-frame grab, not damage.
- **C3 (change). Projectile damage is not 3x Smash's.** Our projectile median 8 sits inside Smash's 1.4 to 23 band (uncharged shots 1.4 to 12, charged 15 to 23). The real gap is startup: ours 2 (the jab-slot shots), Smash 8 to 41, median about 16. "Ranged damage at jab speed" survives; "ranged damage too high" does not.
- **C4 (softened). Our back air is not twice as fast as Smash's.** It equals Diddy's 5 (V14); the gap is launch (kills at low percent) and damage per hit (ours 8.45 median against 9 to 16), not startup.
- **C5 (change). Smash smashes are not all slow.** Fastest smash per character 5 to 12 (median 8), slowest 12 to 41 (median 16); ours are at least 58 frames from the press on every fighter. The direction ("ours are slower, the tell is fair") stands and is stronger: ours are slower than even Snake's 41-frame forward smash.
- **C6 (unchanged). Dash attacks:** Smash's are 4 to 17 startup, 4 to 18 damage, -12 to -38 on shield; ours stay about 3x the damage with a 16-frame tell and mid-dash invulnerability.
- **C7 (change, from section C). The high tier is not a trap-and-lock tier.** 3 trap moves and 1 lock in 64 tagged specials. Our repeat winners have 4x the trap rate and about 20x the lock rate. The first pass's "traps are the one place ours resembles the high tier" is wrong in degree: Steve and Snake do it, but Diddy's banana is the only other trap among the other twelve.

### C. The 14-character high-tier comparison (file: `smash-high-tier-kits.csv`)

Tier list: UltRank fourth list, 2026-05-06, the owner's picture. **S+:** Steve, Sonic, Snake, Mr. Game & Watch, R.O.B., Min Min, Kazuya. **S-:** Diddy Kong, Pyra/Mythra, Luigi, Peach, Yoshi, Fox, Joker.

**Tagging rule.** A character's kit is the special moves listed on its frame-data page (4 specials plus named variants such as Kazuya's Rage Drive and Gates of Hell, Steve's Crafting Table, Pyra/Mythra's two sets, Joker's Arsene). One primary category per move from our taxonomy (`move-categories-report.md` section 1); armour, invulnerable, reflect and counter frames are noted as secondary. Our counts are the same codes over `kit6` in `move-totals-by-fighter.csv` (jab, 3 specials, smash, finisher: 6 moves); the finisher plays the role of Smash's fourth special, so ours is 3 specials + finisher against 4.6 tagged specials per Smash character (64 tagged specials in all). What every fighter has (jab, tilts, aerials, dash attack, grab) is not tagged and sits in the numeric columns. Min Min is tagged on the 2 specials the page shows. Pyra and Mythra are one character with 8 specials.

**Counts over the 14 (moves, fighters with at least one, per fighter) against ours (per fighter, kit6):**

| Category | Moves | Fighters | Per fighter | Ours: repeat winners / single winners / control |
|---|---|---|---|---|
| RECOVERY | 15 | 14 of 14 | 1.07 | 0.57 / 0.22 / 0.50 |
| PROJECTILE | 15 | 10 of 14 (not Steve, Sonic, Min Min, Yoshi) | 1.07 | 1.00 / 0.83 / 1.00 |
| MOBILITY/DASH | 11 | 9 of 14 | 0.79 | 0.43 / 0.17 / 0.83 |
| COUNTER + ARMOURED (primary) | 5 | 5 of 14 (G&W, Kazuya, Peach, Fox, Joker) | 0.36 | 0.29 / 0.44 / 0.33 |
| armour / invulnerable / reflect / counter frames on at least one special (secondary or primary) | n/a | 9 of 14 | 0.64 | not tagged |
| TRAP/MINE | 3 (Steve TNT, Snake C4, Diddy banana) | 3 of 14 | 0.21 | **0.86** / 0.22 / 0.17 |
| lock effects (pin + freeze + pull; our `effects` columns) | 1 (Yoshi egg) | 1 of 14 | 0.07 | **1.43** / 0.83 / 0.67 |
| MULTI-HIT (special) | 3 | 3 of 14 | 0.21 | 0.29 / 0.17 / 0.17 |
| COMMAND GRAB (special) | 2 (both Kazuya) | 1 of 14 | 0.14 | 0 / 0.06 / 0 |
| ZONING WALL | 1 (Steve) | 1 of 14 | 0.07 | 0 / 0.17 / 0 |
| SELF-BUFF / stance swap | 3 (Min Min, Pyra/Mythra, Joker) | 3 of 14 | 0.21 | 0.14 / 0.39 / 0.33 |
| BURST | 0 | 0 of 14 | 0 | 0.14 / 0.39 / 0 |
| distinct categories per fighter (ours without jab and finisher) | n/a | n/a | 3.86 | 3.29 / 3.33 / 3.83 |

**What the 14 share:**
1. **Every one has a recovery special (14 of 14), and 9 of 14 have invulnerable, armoured, reflecting or counter frames on a special.** Ours: recovery 0.22 to 0.57 per fighter and no general escape.
2. **Ten of 14 own a projectile and it is slow** (8 to 41, median about 16; the fastest, Snake's grenade throw at 8, follows a 21-frame pull-pin animation). Ours: 1.0 per fighter, the fastest at frame 2.
3. **Dashes or lunges in the special slot: 9 of 14** (Sonic has three). Dash attack startup 4 to 17, -12 to -38 on shield.
4. **They rarely trap or lock:** 3 trap moves and 1 lock in 14 fighters. Ours: repeat winners 0.86 traps and 1.43 lock effects per fighter, 4x and about 20x the high-tier rate. Single winners are closer (0.22 and 0.83), control 0.17 and 0.67. So of the traits in winner-move-types.md (pin, pull or freeze ranked first), the pin / pull / freeze is exactly what Smash's top characters do not rely on.
5. **Normals are bounded by slot** (see the CSV): jab 1 median 3 frames (2 to 6), 2.5% (1.8 to 4.5); utilt median 6; dtilt median 7; fastest smash median 8, slowest 16; grab median 7 (6 to 18); back throw median 10 damage at 20 startup.
6. **Variety is the same:** 3.86 distinct categories per fighter against 3.29 to 3.83 for ours; the high tier does not have a richer toolbox, it has different tools (recovery, slow shots, dashes, counters) and fewer locks.

**Smash traits the high tier has that our strong fighters lack or overdo (numbers):**

| Trait | High tier (14) | Our strong fighters | Verdict |
|---|---|---|---|
| Timer locks (pin, freeze, pull) | 0.07 per fighter | 1.43 per repeat winner | OVERDONE about 20x |
| Traps | 0.21 per fighter | 0.86 per repeat winner | OVERDONE 4x (single winners 0.22: equal) |
| Projectile speed | startup 8 to 41, median about 16 | startup 2 on the jab-slot shots | OVERDONE (too fast) |
| Projectile damage | 1.4 to 23 | median 8 | NOT overdone (corrected) |
| Jab damage and shape | 1.8 to 4.5, the weakest hit in the kit | median 7.5 (up to 11.4); 6 of 7 repeat winners have 8% or more or a banked boost | OVERDONE about 3x |
| Throw damage | back median 10, up median 8 | back 7.6, up 5.0 | ours WEAKER; launch is the issue |
| Counters and armour | 0.36 per fighter primary, 0.64 with secondary | 0.29 / 0.44 / 0.33 primary | EQUAL on primary; ours has no frames on recoveries |
| Recovery special | 1.07 per fighter | 0.57 / 0.22 / 0.50 | LACK (single winners 0.22) |
| Mobility special | 0.79 per fighter | 0.43 / 0.17 / 0.83 | LACK for repeat and single winners |
| Command grab, zoning wall | 0.14 and 0.07 | 0 / 0.06 and 0 / 0.17 | EQUAL (rare in both) |
| Smash tempo | fastest smash 5 to 12, slowest 12 to 41 | at least 58 from the press | ours too SLOW to matter |
| Named weakness | every character has one (SmashWiki, first pass) | few | LACK (unchanged) |

**Could not read or not confirmed:** Min Min's neutral and side B (not on the page); the Stats row of each page; the escape rule of Yoshi's egg and Steve's tool effects; Mario's and Snake's up B notes; everything that is SmashWiki-only (shield, rage, hitstun, CPU); KO percents (the site has no KO data; still one 2019 article).

---


*Read-only analysis, 2026-11-04. Nothing in the game was edited, committed or pushed. Smash numbers come from the pages listed in section 6 (each cited by page); our numbers come from `move-catalog.csv`, `move-categories-report.md`, `winner-move-types.md`, `measure-lightning-yinyang-pins.md`, `world-cup-results.md` and a read-only look at `artifacts/V1/index.html`. No Nintendo assets are used or proposed; this compares numbers and rules only. Clover is balanced and is not touched or analysed. Hidden prize fighters are not named. Companion file: `smash-vs-ours.csv` (one row per category plus 8 slot rows).*

**How to read the numbers.** Both games run at 60 frames per second (ours: `STEP_CLOCK.ms = 1000/60`). "Startup" is the frame the hit appears. Our "lowest KO %" is the lowest foe percent at which that move was *seen* to KO in the 30-match simulation (a move with no KO seen has no number), not a centre-stage test. "Kill-capable at 100% or less" is the catalog's flag (launch of 12 or more, or 9.5 or more with 6.5 sideways; the catalog's own test showed a launch of 10 kills at 100% and 14 at 60%). Median startup is over the moves that have a startup number at all: specials, finishers and dashes have none in the catalog.

---

## 1. Design lessons, ranked

Ranked by how far our rule-breaking is from Smash's pattern and how much simulated damage or KOs it touches. Each ends with what a change would *target*; none is applied or recommended as a number.

**1. A jab is a combo tool in Smash, and a kill move in ours (jab = 38% of damage, 30% of KOs).**
- Ours: jab is on frame 2 for all 31 fighters, median 7.5% in *one* hit (range 2 to 11.4), whiff lag 22 frames; 11 of 31 jabs are kill-capable at 100% or less; seen KOs at 13% (Book), 32 (Barf Bag), 34 (Blueberry), 42 (Magnet). The jab slot is the top damage move for 24 of 31 fighters.
- Smash: jab 1 starts on frame 2 to 6 (Mario 2, Fox 2, Sonic 3, Snake 3, R.O.B. 3, Steve 4, Min Min 5, Kazuya 6; median 3, VERIFIED) and hits for 1.0 to 3.0% [V1: really 1.8 to 3.0, Steve to 4.5] (Mario 2.2, Fox 1.8, Sonic 2.0). Mario's whole three-press chain is about 7.9% over 73 frames. SmashWiki calls the jab the weakest and shortest-range ground normal, used as a low-% combo finisher, a get-off-me, a frame trap. Sonic's jab 1 is -13 on shield; Snake's is -8.
- Why it matters: a frame-2 hit is fair in Smash only because shield (1 frame) and spot dodge (intangible from frame 3) answer it. We have neither.
- A change would target: jab damage per hit and launch (the kill flag), or the empowered-jab banks (Cake about 6% to 16% at frame 2, Magnet, David, Blueberry, Puffball, Money), not the CPU's use of jab.

**2. Dash attacks: Smash's are fast, weak and always punishable; ours are slow-ish, huge and cannot be punished.**
- Ours: 11 dash moves, median damage 20% (range 6 to 24), lowest seen KO 23 to 28% (Leafy Sprint, Bomb Collision, Leafy Shadow Blitz), 5 of 11 kill-capable at 100% or less; 2% of uses give 10.8% of KOs (19.6 KOs per 100 uses against 5.3 for finishers). The dash specials set `invuln` to 2 on every frame of the dash unless armoured (index.html about line 64804; `case "dash"`, 16 frames at 22 px per frame, line 82427), so a foe cannot hit the attacker mid-dash. Today's working copy of index.html adds a 16-frame tell (`DASH_TELL_FRAMES = 16`, line 82059 on; the catalog predates it, so its startup says "n/a"). The owner's own rule is 20 or more.
- Smash: dash attack startup 4 to 8 (Fox 4, Sonic 5, Snake 5, Mario 6, Min Min 7, R.O.B. 7, Steve 8; Kazuya 15), damage 4 to 14% (Mario 8/6, Fox 6/4, Snake 11 to 6, Kazuya 14 to 16), total 31 to 49 frames, and shield advantage -16 to -38 [V6: really -12 to -38] (Fox -16, Mario -17, R.O.B. -17, Kazuya -19, Min Min -23, Snake -26, Sonic -38). SmashWiki: committal, easy to punish on shield.
- A change would target: damage and launch (3x Smash's), the dash's invulnerability, a punish window after the dash (Lightning's smash dash already costs her 12 frames of self-stun and 29 busy, which is the Smash shape), and the tell length (16 against the owner's 20 or more).

**3. Smash lets fast moves be fast because every one has a 1-to-3-frame answer. We have none, so speed and damage must be budgeted instead.**
- Smash answers: shield starts on frame 1 (drop lag 11), perfect-shield window 5 frames; spot dodge intangible frames 3 to 17 (total 25) [V8: 20/25 shown]; roll intangible about 4 to 12 (total 26 to 29) [V8: Mario 4 to 15]; air dodge intangible 2 to 26 for Fox (total 38, landing lag 10, once per airtime).
- Our escapes (grepped, not guessed): a double jump (`f.jumps = 2`), short hop (quick press), fast fall (down in the air after the top of the jump), hold down to drop through a platform, a wall jump (once per wall), and a dodge only inside special moves (Final Smash and dash invulnerability, no button). There is no shield, no air dodge, no spot dodge, no roll. The in-game help text (index.html line 1880) lists only these movement tricks.
- Smash's pattern across 8 characters: ground moves of 10% or more start on frame 6 or later [V2 WRONG: Snake dash attack f5 at 11, Mario dsmash f5 at 10] (Snake utilt 6 at 14.5, Snake dtilt 6 at 12, Mario fsmash 15, Fox dash attack 4 at 6%). Ours: the jab hits 7.5 to 11.4% on frame 2 (Pencil 10 and Blocky 10 on frame 2), and the grab is on frame 4.
- A change would target: a "speed budget" rule (no ground hit above about 4% before frame 6) as the stand-in for the missing shield. [V2/C1 WRONG as worded: fast strong hits exist in Smash, each -13 or worse on shield]

**4. Our kill moves start earlier than Smash's and kill at lower percent.**
- Ours: back air startup 5 (median), 18 of 30 kill-capable at 100% or less, lowest seen KO 59; utilt launches 10.6 but is not kill-capable (1 of 31); smash startup 34 to 44 plus 24 frames of charge (at least 58 from the press); throws: 22 back throws and 22 up throws are kill-capable at 100% or less, off a 4-frame grab.
- Smash: kill aerials (back air) startup 6 to 19 (median 11, Mario 6, Snake 7, Fox 9, Kazuya 11, Steve 12, Sonic 13, R.O.B. 19) with landing lag 6 to 19; smashes startup 13 to 41 (median 16; forward smash only, the fastest smash per fighter is 5 to 12, median 8 [V3]) with KOs of about 45 to 135% by weight (Dignitas 2019: typical 60 to 120, light-to-heavy gap 40 to 60 points); throws (damage back median 10, up median 8; ours 7.6 and 5.0 [V9, C2]) kill about 120 to 160%+ (Snake down throw about 160%, SmashWiki).
- A change would target: the throws' launch (22 of 31 fighters), the back air's startup or launch.

**5. Our fastest ranged moves are as fast as our jab; Smash's are 9 to 25 frames.**
- Ours: Puffball's spit and Ruby's Gem Bolt are the jab slot (frame 2 to 4), the top damage moves of the sample (1,208 and 1,201 damage), and Pencil's van another (1,432). Projectiles are 22% of damage, 15% of KOs.
- Smash: Fox blaster 9 to 20 at 1.4 to 3%, Mario fireball 17 at 5%, R.O.B. beam 25, Kazuya blaster 27 (at 10 to 12, not 1.4 to 7 [V4]), Snake Nikita 41 at 7 to 14% (projectile range really 8 to 41 startup, 1.4 to 23 damage [V4/C3]); they are shielded, reflected (Fox's reflector, startup 3, reflect from 4) or dodged.
- A change would target: startup and refire of the jab-slot shots.

**6. Smash has no timer-only lock; ours has several.**
- Ours (from `measure-lightning-yinyang-pins.md`): roots 33 to 89 frames (walk-only; the foe can still attack and jump), Gelatin's freeze 48 to 51 frames (all input masked, no mash, ends on any hit, 70-frame re-freeze immunity), Snowball's finisher holds the foe 67 frames with no escape except hitting him. The report already flags Snowball's as against the owner's "an unescapable thing is a bug" rule.
- Smash: the lock is hitstun, 0.4 x knockback minus 1 frames (100 knockback is 39 frames), with directional influence and tech, and an air dodge or aerial can cancel it from about frame 40 to 45 (SmashWiki Hitstun). That is a window of 39-ish frames with options. Ours is 48 to 89 frames with none.
- A change would target: mash-out or a shorter hold on Snowball's finisher and Gelatin's freeze.

**7. A slow tell is not the problem; a tell with a long duration of danger is.** Smash's smashes start on frame 13 to 25 (a visible wind-up) [V3 WRONG: forward smashes 12 to 41, up and down smashes 5 to 12] and ours start at 58 or more from the press, so our smashes obey the owner's 20-frame rule with room to spare (Kazuya 25 is the slowest of the seven, Snake 41) [V3 WRONG: Snake 41 is the slowest, Kazuya 25 second]. The 20-frame rule is broken by: back airs (5), the grab (4), the jab (2), bursts (get-off-me moves of about 18% median against Smash's 5 to 12%), and the dash specials (16). The mismatch is that the fastest moves are also the strongest.

**8. Burst and get-off-me moves are the largest hits in our kits.** Ours: 8 bursts, median 18%, Bomb 30; Smash: the get-off-me options are G&W Fire (frame 3), Mario up B (frame 3) and fast neutral airs at 5 to 12%. A change would target the burst's damage.

**9. Traps and pins stack into free combos because the CPU walks into them.** Smash traps (Snake C4, 25 frames to detonate, 17%, +20 on shield for the sticky hit; Steve's TNT) are hitboxes that can be shielded, dodged or blown up. Ours root on 32% of uses (70 roots in 221 uses), and the trap-into-finisher string is the owner's most praised play (9 praising call-outs). This is the one place where ours is closer to Smash's high-tier (Steve, Snake): set-up play is the strength, not the flaw.

**10. The CPU's habits decide the meta more than the move numbers (section 4).** Reach beats speed (tactic 5), jab spam, dashes at the ledge, finisher with no reach check. Smash's level 9 CPU does the opposite: it defends perfectly (one-frame shield and dodge) and punishes, so Smash's pros learn from the CPU less than ours can.

---

## 2. Per-category table (ours vs Smash)

"n" is active moves in our catalog (554 total; the Final Smash and inactive forward tilts and side specials are excluded). Smash source for every row is `ultimateframedata.com` for Mario, Fox, Sonic, Snake, R.O.B., Kazuya, Steve and Min Min (see section 6), plus the SmashWiki pages named. A dash means no Smash number was fetched.

| Category | n | Ours: median startup / damage % / lowest seen KO % / kill-capable at 100 or less | Smash Ultimate | Gap and one line |
|---|---|---|---|---|
| FAST POKE | 38 | 2 / 7.75 / 13 (median of per-move lowest 114) / 8 of 38 | jab 1: 2 to 6 (median 3), 1.0 to 3.0 per hit, no KO | Same speed, 3x the damage per hit and it kills. The poke is cheap in Smash because it loses to shield. |
| SPACING POKE | 23 | 5 / 7.2 / 144 / 0 | tilts with reach: 4 to 14 (Min Min 14, longest melee range in the game), 6 to 11 | Ours has long reach on a 5-frame startup; Smash trades reach for startup. Forward tilts are off today, so these are up tilts. |
| MULTI-HIT | 35 | 4 / 3.2 total (Gelatin 2.8x3, Barf Bag 5.2x2) / 32 / 3 of 35 | rapid jab hits 0.5 to 0.6 each, first hit on 5 to 9; multi-hit aerials 1 to 5 per hit | Shape matches; our jab multi-hits total 8 to 16 on frame 2. |
| COMBO STARTER | 94 | 4 / 4.65 / 78 / 1 of 94 | utilt 3 to 9 (median 5.5), about 6 (Snake 14.5); hitstun 0.4 x KB - 1 | The closest match of any category. Check that the follow-up is escapable. |
| TRUE KILLER | 27 | 5 / 8.6 / 59 / 18 of 27 | bair 6 to 19 (median 11), 10.5 to 17.5, landing lag 6 to 19; KO about 100 to 130 (G&W fair about 115 at the ledge) | Half the startup, 60% of the damage, kills at 100% or less. The fastest killer in the comparison. |
| READ KILLER | 3 | 34 to 44 plus 24 charge / 27 / 48 / 2 of 3 | fsmash 13 to 41 (median 16), 12 to 26; KO 45 to 135 by weight (2019) | We are slower (tell is fair); the 3 read killers hit harder than Smash's (24 to 28). Tiny sample. |
| PROJECTILE | 28 | 2 (jab shots; n = 2 of 28) / 8 / 35 / 6 of 28 | 9 to 25 (Fox 9 to 20, Mario 17, R.O.B. 25); 1.4 to 7 per shot | Biggest speed gap: our fast shots fire at jab speed. |
| ZONING WALL | 3 | not in data / 8 / none seen / 0 | Steve blocks and lava, Snake C4, Min Min range (page text) | Only 3 moves; Smash's high tier is built on this, and Clover's wall was the owner's best move. |
| TRAP/MINE | 11 | 40 (n = 4; smash traps) / 12 / 124 / 0 | Snake C4 [V12: placed on frame 9, explodes 25 frames after detonation], 17%, +20 on shield; Nikita 41 | Ours roots and the CPU walks in; Smash's can be shielded or destroyed. |
| GRAB (grab slot) | 31 | 4 / 2.5 pummel / n/a / 0 | 6 to 8 (Steve 13, Min Min 18), dash grab 9 to 11, pummel 1.3 to 3.4 | Faster than any Smash grab (verified: 6 to 18, median 7); Smash's grab beats a shield, ours has no shield to beat. |
| THROWS | 124 | after grab / 6.05 / 71 / 45 of 124 | throws 5 to 14; KO about 120 to 160+ (Snake down throw about 160) | 22 back and 22 up throws kill at 100% or less. [V9: but our throw damage is lower than Smash's] |
| COMMAND GRAB (special) | 1 | not in data / 10 / 135 / 0 | Kazuya Rage Drive 10 to 14 startup, 12.6 to 14.3 (verified; Gates of Hell, a second command grab, starts on 7) | One move; nothing to compare. |
| PIN/HOLD | 1 | not in data / 7 / none / 0 | no timer lock in the pages fetched [V13: Yoshi Egg Lay]; hitstun 39 frames at 100 KB with DI and tech | Ours: roots 33 to 89, finisher hold 67, no escape. |
| PULL | 8 | 4 (n = 2) / 9.5 / 97 / 2 of 8 | none in the 8 fetched | Magnet (jab plus pull) won 3 of 4 sim matches. |
| FREEZE/STUN | 3 | not in data / 3 / none / 0 | none fetched; Kazuya EWGF pushes out of shield | Ours-only category. Gelatin freeze 48 to 51 frames, no input. |
| ARMOURED/INVINCIBLE | 8 | not in data / 7 / none / 0 | i-frames 2 to 6 on recoveries (Mario up B 3 to 6 [V11 unverified], Fox reflector 2 to 3, R.O.B. burner 2 to 4); Snake Cypher armour 7 to 94 | Ours gives a whole dash (10 to 18 frames) of invulnerability to the attacker. |
| COUNTER | 4 | not in data / n/a / 106 / 0 | Fox reflector startup 3 (a reflector); counters not fetched [V15: now read, counters start on 3 to 9] | The CPU guesses counters on any swing near it (tactic 4): a coin flip. |
| MOBILITY/DASH | 11 | now 16 tell (was n/a) / 20 / 23 / 5 of 11 | dash attack 4 to 15 (median 6.5), 4 to 16 damage, shield adv -16 to -38 | 3x the damage, kills at 23 to 28%, invulnerable while dashing. |
| RECOVERY | 11 | not in data / 5 / 61 / 1 of 11 | up B 3 to 20 (Mario 3, Snake 6, Kazuya 12, Fox 20), early intangibility | Comparable; not the differentiator. |
| SELF-BUFF | 10 | not in data / 6 / 117 / 0 | rage max 1.1x knockback from 35 to 150%; tools need mining (Steve) | Smash buffs cost time or percent; ours bank an instant frame-2 jab boost. |
| HEAL/RESOURCE | 3 | not in data / n/a / none / 0 | not covered | 14 uses in 30 matches, no damage. |
| SPIKE/METEOR | 34 | 8 / 8 / 69 / 3 of 34 | dair 3 to 20 (median 15 over 15 fighters, 16 over the first eight [V5]), 3 to 18, landing lag 12 to 35 | About twice as fast as Smash's dair, with no airdodge to escape. |
| FINISHER (V+C) | 31 | not in data / 8.5 / 90 / 5 of 31 | no analogue (Smash has 4 specials) | 13% of KOs from 9% of uses; CPU throws it with no reach check. |
| FINAL SMASH | 31 | 34 to 40 listed / n/a / not simulated | not fetched | Out of scope: items and balls off. |
| BURST | 8 | not in data / 18 / 112 / 1 of 8 | get-off-me: G&W Fire 3, Mario up B 3, Mario nair 3, Fox nair 4, Sonic nair 6; 5 to 12 | 3x Smash's damage. |
| SKY DROP | 4 | 90 / 12 / 101 / 0 | Steve down air: startup 20, 18 / 10 (10 is the late hit, not the landing [V10]) | The slowest tell in either game. |

Slot rows (jab, utilt, dtilt, bair, dair, smash, grab, throws) are in the CSV. Compact version: utilt 5 vs 5.5 and dtilt 4 vs 6.5 (ours are Smash-like), dair 8 vs 15, smash 58 or more vs 16.

---

## 3. The high tier

**Source and date.** UltRank (formerly LumiRank), **fourth official tier list, released 2026-05-06**, as reported by EventHubs on 2026-05-09 ("UltRank releases their fourth official tier list..."). **S+: Steve, Sonic, Snake, Mr. Game & Watch, Kazuya, Min Min, R.O.B.** The article names an **S-** group (Diddy Kong, Fox, Joker, Yoshi, Luigi, Peach, Daisy, Pyra & Mythra) and does not list the middle S tier, so places 8 to 10 cannot be named from it. Cross-check: Dabuz's tier list (EventHubs, 2026-01-18) has Steve, Sonic, G&W, Snake, R.O.B. as upper top tier and Kazuya, Pyra & Mythra, Cloud, Fox, Samus, Bayonetta, Palutena, Luigi, Roy, Joker, Diddy Kong, Min Min as lower top tier. The third UltRank list (luminosity.gg, 2025-02-17) had S+ Steve, Sonic, Snake. The Medium post and the Smashboards thread of the fourth list returned 403 and were not read. SmashWiki's character pages (rank "of 82", no date given) place Steve 1, Sonic 2, Snake 3, G&W 4, R.O.B. 5, Min Min 6, Kazuya 7.

**What the seven have in common** (SmashWiki character pages, paraphrased; frame numbers from ultimateframedata):

| Trait | Who | Evidence |
|---|---|---|
| Strong neutral: zoning, stage control, traps | Steve (blocks, TNT, minecart), Snake (grenade on frame 1, C4, Nikita), R.O.B. (beam 25, Gyro), Min Min | Steve's Create Block builds walls; Snake's grenades pull on 21 frames; C4 17% |
| Disjointed or longest reach | Min Min (longest melee range in the game), G&W (disjointed), Steve (tools), R.O.B. | Min Min ftilt startup 14 |
| Kill confirms and combos into KOs | R.O.B. (Arm Rotor, Gyro: zero-to-death), Kazuya (EWGF, rage), Steve (axe ladders), Snake (down throw about 160%) | EWGF startup 8; R.O.B. fast reliable finisher |
| Mobility | Sonic (fastest dash in the game) | Spin Dash, dash dance |
| Safe or invulnerable recovery, good out of shield | G&W Fire (frame 3, best out-of-shield option), Sonic spring jump (early intangibility), R.O.B. burner, Snake Cypher (armour 7 to 94) | Mario's up B is 3 to 6 intangible, for context |
| Heavy kill power with a trade-off | Snake/Kazuya/R.O.B. heavy and slow; Sonic/G&W light and weak at KO | Each has a named weakness: poor disadvantage, weak air game, short life |

None of them is the top tier because of a jab, and none of the seven has a dash attack in its list of strengths (Snake's is the only one SmashWiki names as strong). All seven have a *named weakness* (Sonic's kills, G&W's weight, Snake's end lag, Kazuya's mobility, Min Min's recovery, Steve's reach and resources, R.O.B.'s hurtbox).

**Our strong fighters.** Repeat winners (Toothpaste, Puffball, Tennis Ball, Gelatin, Coiny, Snowball, Lightning) and the sim winners (Toothpaste 3 of 4 matches, Magnet 3 of 4, Bomb 3 of 3, Rose 2, Gelatin 2). From `winner-move-types.md` the shared traits are a pin, pull or freeze (best supported), a strong or boosted jab, a reaching smash, a reaching finisher; the evidence is thin and only Toothpaste and Puffball (4 wins each) are clearly above chance.

| Smash high-tier trait | Do ours have it? |
|---|---|
| Zoning / stage control | **Have, a little**: Toothpaste's two traps plus root chain, Pencil's van, Puffball's spit, Ruby's prism; only 3 zoning-wall moves exist, but traps and finishers do the job. |
| Disjointed reach | **Have too much**: reach beats speed (tactic 5), the CPU swings from its own reach and loses every trade to a jab a little longer than its own. Tennis Ball's 8% jab won #13 by length. |
| Kill confirms into KOs | **Have, in a different shape**: Gelatin's freeze plus one up tilt kills a mid foe at about 100% (90 with the smash freeze); Toothpaste's root plus up tilt at 129 to 135%. Smash's confirms are 40-frame hitstun windows with DI; ours are timer locks. |
| Mobility | **Lack**: no fighter has a dash faster than a special's; the dash attacks are the kill tool instead (Bomb, Leafy). |
| Safe recovery / out-of-shield option | **Lack**: no shield; burst moves play the get-off-me role but with 18% damage. |
| A named weakness | **Lack**: our strong fighters mostly have none; only the CPU's own misuse (Money, Puffball's Grow wasted) holds them back. |
| Weak jab | **Opposite**: 6 of 7 repeat winners have a jab of 8% or more or a banked boost, and the jab is the top damage move of 24 of 31 fighters. Smash's jab is the weakest hit in the kit. |

Too much of: jab damage, ranged damage at jab speed, dash attacks, timer locks. Lacking: defensive tools, trade-offs, mobility variety. Ours have, in Smash's sense: a neutral based on set-up and a finisher/kill that rewards it.

---

## 4. Our CPU against Smash play

**Our Expert CPU** (from `world-cup-results.md`, tactics 1 to 9 and the owner's notes): reacts in about 10 frames (Easy 30), presses the jab constantly and plays every kit mostly as a jabber (jab slot 38% of damage, 20.8% of uses; 29% of damage is FAST POKE); guesses a counter stance on any swing within about 110 px (30%, then not again for 4 to 7 s); walks into traps and puddles (tactic 3); waits out a swing then steps in (tactic 2); fires full-length dashes at you near the ledge (tactic 6, the Leafy Sprint kamikaze); throws the finisher with no reach check in 34 to 35% of matches. Its move reader uses a move only if it fits a known type (a shot, a trap, a heal, a stance), which is why Toothpaste uses all 14 slots and many kits skip their best moves.

**Smash**:

| Move | Good Smash players | SSBU CPU (level 9) | Ours |
|---|---|---|---|
| Jab | combo finisher at low %, get-off-me, frame trap; weakest hit in the kit (SmashWiki Jab). | Not singled out; level 9 favours aerials, smashes and grabs more than lower levels (SmashWiki Computer player). | 38% of damage, 20.8% of uses. |
| Dash attack | approach tool that interrupts an initial dash; punished on shield (-16 to -38); throw it when the foe is dashing, not into a shield. | Not singled out. | Thrown at range with a tell of 16 and 20% damage; the CPU fires it near ledges. |
| Smash attacks | read or punish tool with a charge and a visible wind-up; kills 60 to 120%. | Used more than at lower levels. | Slow (58+ frames) and used well by few CPUs (Lightbulb's beam, Tapey's Solo Track). |
| Grab | beats shield, 6 to 8 frames; the answer to over-shielding. | Used more often at level 9; players note that shielding vs level 9 invites a grab. | 4-frame grab, kill throws; CPU grab 2.1% of uses, 8 KOs. |

Level 9 CPU in Smash: one-frame reactions, perfect shield and dodge, mashes out of sleep and shield break at frame-perfect speed, near-perfect air dodge from level 7 up (SmashWiki Computer player). Players beat it with grabs and baiting; it cannot mind game. Ours is the reverse: it never defends (no tools) and loses to reach and bait.

**Where our CPU's habits distort the meta.** (1) The CPU plays by reach, and the owner's cups are CPU against CPU, so the winners are fighters with the longest 8% jab or a shot at jab speed (Tennis Ball, Puffball, Ruby, Magnet): the matches measure jab reach, not kit quality. (2) The dash attacks look worse than they are in a Smash sense, because a CPU that uses them near a ledge kills itself, and better than they are in the data, because 11 KOs from 30 uses of Collision came with no one punishing them. (3) Because the finisher is thrown with no reach check, only auto-aim and wide finishers survive. (4) Because there is no shield or air dodge, nothing in the CPU's repertoire can be baited by a read besides the counter stance, so every match is a damage race.

**What Smash's counterplay gives that ours lacks.** Shield: frame 1, 50 shield health, drop lag 11, perfect-shield window 5 frames, shield grab; spot dodge: intangible from frame 3 to 17, 25 frames total; roll: intangible about 4 to 12, 26 to 29 total; air dodge: intangible 2 to 26 (Fox), 38 total, landing lag 10, once per airtime. Rage (context): from 35% to 150% damage, up to 1.1x knockback; hitstun 0.4 x knockback minus 1 frames.

**What ours provides instead (grepped).** Double jump (`jumps = 2`), short hop, fast fall, drop through platforms (hold down), a wall jump once per wall (Celeste-style dash jumps in Capture the Flag only), and the 2-frame invulnerability inside dashes and finishers (I found no general invulnerability after a hit); no roll, no spot dodge, no air dodge, no shield. The only way to "dodge" a hit is to be out of its shape in time: the game draws the hit's art only while it is live, and startups are the fighter's own gather (the owner's 2026-10-22 rule).

---

## 5. Not verified

- **Smash KO percents** are from one 2019 Dignitas article (Final Destination, no DI, 2019 balance); not a current centre-stage list. I could not find a current per-character KO page. The "about 100 to 130% for a good aerial" figure is only the G&W fair (SmashWiki) and my reading; other aerial KO numbers are not cited.
- **[Superseded by the VERIFIED section at the top] Frame data was read through a page-to-text summary**; some pages had no column labels (the summariser inferred them). Spot-check any number you plan to build on against `ultimateframedata.com` directly. Mr. Game & Watch's frame data page could not be fetched (404 on two names); G&W facts are from SmashWiki only. [V7: the page is /mr_game_and_watch and was read in the second pass] Min Min's grab/throw and Steve's jab are the least clear.
- The Smash numbers are from eight characters (Mario and Fox as baselines, six of the seven S+). The game version of the page is not stated.
- Smash counter moves, healing, pulls, freezes and the Final Smash were not fetched.
- Our startup for specials, finishers and dashes is not in the catalog (a dash tell of 16 frames is in today's index.html, not the catalog). Our "lowest KO" is the lowest seen in 30 simulated matches, not a measured centre-stage number, and the simulation is not bit-reproducible.
- The 2026 date of the tier list comes from EventHubs' report; the original Medium post was not readable.

---

## 6. Sources (title, URL, date read 2026-11-04)

- UltRank fourth official tier list, EventHubs, "UltRank releases their fourth official tier list for Super Smash Bros. Ultimate...", https://www.eventhubs.com/news/2026/may/09/ultrank-fourth-tier-list/ (list released 2026-05-06, article 2026-05-09). Original: https://medium.com/@ultrankssb/the-fourth-ultrank-tier-list-2026-9c5f6964f7e3 (403, not read).
- Dabuz tier list, EventHubs, https://eventhubs.com/news/2026/jan/18/new-tier-list-dabuz-ssbu (2026-01-18).
- Luminosity, "Smash Ultimate's 3rd Official Tier List", https://www.luminosity.gg/news/smash-ultimates-3rd-official-tier-list (2025-02-17).
- Ultimate Frame Data (MetalMusicMan, data credit Zeckemyro): https://ultimateframedata.com/mario, /fox, /sonic, /snake, /rob, /kazuya, /steve, /minmin.
- SmashWiki: https://www.ssbwiki.com/Shield, /Spot_dodge, /Air_dodge, /Roll, /Dash_attack, /Jab, /Rage, /Hitstun, /Computer_player, /Steve_(SSBU), /Sonic_(SSBU), /Mr._Game_%26_Watch_(SSBU), /Snake_(SSBU), /Kazuya_(SSBU), /R.O.B._(SSBU), /Min_Min_(SSBU).
- Dignitas, "How To Finish Your Opponent in Smash Bros. Ultimate: Kill Moves For Each Character", https://dignitas.gg/articles/news/smash/13317/how-to-finish-your-opponent-in-smash-bros.-ultimate-kill-moves-for-each-character (2019-02-19).
- Ours: `reports/move-catalog.csv`, `move-categories-report.md`, `winner-move-types.md`, `measure-lightning-yinyang-pins.md`, `world-cup-results.md`; `artifacts/V1/index.html` lines about 1783, 1880, 23186, 64804, 81956, 82052 to 82075, 82427.

## Addendum (2026-11-04): the tier list picture from the owner

The owner supplied the picture of the fourth UltRank tier list (https://medium.com/@ultrankssb/the-fourth-ultrank-tier-list-2026-9c5f6964f7e3), which the agent could not fetch (403). Read from the picture (portraits; names are the lead's reading, so spot-check):
- **S+:** Steve, Sonic, Snake, Mr. Game & Watch, R.O.B., Min Min, Kazuya (matches the agent's list).
- **S-:** Diddy Kong, Pyra/Mythra, Luigi, Peach, Yoshi, Fox, Joker. These are the spots 8 to 14 the agent could not name.
- **A+:** Samus, Palutena, Pikachu, Olimar, Wario.
The high-tier trait comparison above used only the S+ seven; the S- seven are analysed in the VERIFIED section at the top [V16].

## Addendum 2 (2026-11-04): rage thresholds from the owner

The owner supplied (not on ultimateframedata.com, not verified by the lead): the damage percent at which each character's comeback/rage mechanic is available is **100% for Kazuya** and **125% for Joker**. Context for our comparison: Smash gates a power spike behind taking damage; our COMEBACK table (grep COMEBACK in index.html) does the same for some fighters; thresholds and effects have not been compared yet.
