# Shield, reflector and damage tool: design facts for the owner

*Research and analysis only, 2026-11-04. Nothing in the game was edited. The built-in browser tab was my own and is closed. No relay was touched.*

## 0. In brief

- **Fox's Reflector** (the reference): reflect starts about frame 4, held as long as the button is down, at least 36 frames in total, and it can be held for as long as you like. It reflects at **1.4x damage and 1.4x speed**, and it has a small hit on the way in (**2%**, weak semi-spike) that is **not** a kill move. It cannot stop melee or grabs. It is balanced by end lag and by being a stance, not by a short timer.
- **We already have a reflector.** Gaty's "Reflect Stance" (down special, about 44 frames, no hit) turns enemy shots around at the same damage, and Blueberry's Palanquin Catch and Gaty's Swing Open reflect while they attack. Reflecting is in the engine (`f.reflecting`, `index.html` about line 65442). So a general Z reflector is new tuning, not new tech.
- **Strong list by the numbers** (top 9 firm, Match as the borderline tenth): Toothpaste, Magnet, Tennis Ball, David, Puffball, Firey, Bomby, Lollipop, Pencil, (Match).
- **Damage tool** for the strong: a 20-frame-tell ring pulse, **3.5% damage, set weak knockback, no kill, no reflect, no block**.

## 1. Reflector research table (Smash Ultimate)

Frames are at 60 per second. UFD = Ultimate Frame Data page (`https://ultimateframedata.com/<character>.php`, read in my own browser tab). Wiki = SmashWiki. Multipliers are damage / speed from the SmashWiki "Reflection" table (the page itself says it needs more technical data, so treat the multipliers as likely, not certain).

| Character | Move | Startup | Active reflect | Total frames / end lag | Hit on the reflector | Reflect mult (dmg / speed) | Source |
|---|---|---|---|---|---|---|---|
| **Fox** | Reflector (down B) | 3 (invulnerable frames 2-3; reflects from frame 4) | held as long as the button is down | 36 total (UFD); wiki says final frame 37 | 2% on activation, weak semi-spike (wiki) | 1.4 / 1.4 | UFD "Fox - Ultimate Frame Data"; SmashWiki "Reflector (Fox)" and "Fox (SSBU)" |
| **Falco** | Reflector | 5 | reflects frames 1-33 | 44 total; 30 frames of end lag | 5% hit on frames 5-14 (UFD) | 1.2 / 1.3 | UFD "Falco"; wiki "Reflector (Falco)" (cannot be reflected itself) |
| **Wolf** | Reflector | 6 (invulnerable 5-8; reflects from frame 9) | held; 12 frames of end lag after extended use | 30 minimum | zap 3% and set knockback, the weakest of the three (wiki; UFD lists 4.0) | 1.5 / 1.8 | UFD "Wolf"; wiki "Reflector (Wolf)" |
| Mario | Cape (side B) | 12 | reflects frames 9-20 | 35 total, 21 end lag | cape hit 7% (turns foes round) | 1.5 / 1.0 | UFD "Mario"; wiki Reflection table |
| Dr. Mario | Super Sheet | 12 | reflects frames 9-22 | 35 total, 19 end lag | 8.2% | 1.6 / 1.0 | UFD "Dr. Mario" |
| Palutena | Counter / Reflect Barrier | 7 | counter and reflect frames 7-34 | 70 total | none on reflect; barrier lingers to frame 45 | 1.4 / 1.25 | UFD "Palutena" |
| Pit / Dark Pit | Guardian Orbitars | 7 | held; blocks as well as reflects | 39 minimum, 18 end lag on release | none | 1.5 / 1.7 | UFD "Pit"; "Dark Pit" |
| R.O.B. | Arm Rotor (side B) | 13 | reflects frames 13-35 | 85 total, 41 end lag | multi-hit 1.5% / 3% | 1.5 / 1.3 | UFD "R.O.B." |
| Zelda | Nayru's Love | 11 | reflects frames 4-40, intangible 4-13 | 57 total, 31 end lag | multi-hit 2% / 5% | 1.25 / 1.4 | UFD "Zelda" |
| Mewtwo | Confusion | 10 | reflector active 10-33 | 39 total, 26 end lag | grab and hurl | 1.4 / 1.2 | UFD "Mewtwo" |
| King K. Rool | Gut Check | 5 | counter and reflect frames 5-28 | 62 total | counter attack | 1.5 / 2.0 | UFD "King K. Rool" |
| Mii Gunner | Echo Reflector | 3 (reflects from 4) | held | 38 minimum, 15 end lag | 2% | 1.5 / 1.9 | UFD "Mii Gunner" |
| Mii Swordfighter | Reversal Slash | 16 (can reflect from 5) | reflects frames 8-24 | 36 total, 19 end lag | 6% | 1.8 / 1.5 | UFD "Mii Swordfighter" |
| Lucas / Ness | Forward smash (bat) | 14 / 21 | reflects frames 11-19 / 18-30 | 45 / 54 total, 30 / 32 end lag | the smash itself (14%+ / 18%+) | 1.5 / 1.5 (Lucas), 2.0 / 2.5 (Ness) | UFD "Lucas"; "Ness" |
| Min Min | Up smash | 8 | reflects frames 6-15 | 53 total, 37 end lag | 16% | 1.8 / 2.4 | UFD "Min Min" |
| Kazuya | Left Splits Kick | 13 | reflects frames 7-17 | 40 total, 25 end lag | 18% | 2.4 / 1.8 | UFD "Kazuya" |
| Joker | Makarakarn (Arsene) | 4 | reflects frames 4-31 | 57 total | none | 1.6 / 1.9 (min 12% to max 50%) | UFD "Joker" |
| Mr. Game & Watch | Oil Panic | 6 | absorbs frames 6-30 | 43 total | none (stored oil is released later) | absorbs, then returns | UFD "Mr. Game and Watch" |
| Ness / Lucas | PSI Magnet | 7 (absorb start) | absorb about 6 frames | 24 total | 4% (Ness) | absorbs and heals, no reflect | UFD "Ness" |
| Villager / Isabelle | Pocket | 8 | pockets frames 8-23, invulnerable 5-23 | 50 total, 27 end lag | none | stores, then throws back | UFD "Villager" |
| Bayonetta / Corrin / Marth line / Sora | Witch Time, Counter Surge, Counter, Counterattack | 6 to 8 | counter window about 20 frames | 64 to 67 total | counter hit (only if it connects) | countering, not reflecting (a counter reflects nothing) | UFD pages of each |

What the reflector does and does not do:
- **Max-damage cap.** A shot stronger than the reflector's cap (50% for most, 80% for Ness, Kazuya, Min Min) ignores the reflector and hits the user. Reflected shots change owner and can be reflected up to 7 times (wiki "Reflection").
- **Melee and grabs get through.** A reflector is a projectile answer only; it never blocks melee or throws. Pit and Dark Pit's Orbitars are the exception (they block too).
- **Balance.** Smash keeps reflectors honest with: a stance that leaves the user stuck and open to melee and grabs; 15 to 30 frames of end lag on release; very short windows on the cape and smash reflectors (about 10 to 25 frames); no hitbox or a weak one; and a cap on how strong a shot can be. Fox, Falco and Wolf are the cheap, long-lasting ones, balanced by being weak on offence.
- **Other platform fighters (not checked).** Rivals of Aether's Clairen has an energy field that wipes out shots and pushes foes (only a secondary aggregator page; unverified). I found nothing usable for Rivals 2 or Brawlhalla.

## 2. Design options for our game

Our scale (60 per second; `move-catalog.csv` medians): fast pokes 6.6% damage with a startup of about 4 frames; true killers 8.6% (startup about 5); spikes 8.0% (about 8); combo starters 4.7%; grabs 2.5%; traps about 19% (startup about 40). The existing Gaty stance is 44 frames long with no hit and the same damage on the reflected shot.

### (i) Reflector on Z (for fighters with a fitting kit)

| Setting | Proposal | Reason |
|---|---|---|
| Startup | 6 frames, no invulnerability | Fox's 3 is too safe; ours is closer to Wolf and Pit |
| Active window | up to 36 frames while Z is held, then forced drop | Gaty's 36 to 44 is the precedent; Smash holds forever but we have no end lag pressure yet |
| End lag on release | 22 frames (Falco 30, Fox about 33, Mii 15) | the punish window |
| Cooldown | 30 frames after the end lag before Z works again | stops flicker-spamming |
| Reflect | projectiles only, **1.3x damage, 1.3x speed**, reflected shot belongs to the reflector, cap of 12% on shots that can be turned | Fox 1.4, Falco 1.2, Wolf 1.5; the cap is Smash's max-damage rule in our scale |
| Melee, grabs, traps, beams | pass through. A grab beats it, as it beats any stance (`index.html` line 79722) | matches the owner's rule that grabs beat the shield |
| Hit on activation | none (keeps the tool separate from the damage tool); optional 1% tickle like Fox's 2% if the owner wants it | no kill power, no tell needed |
| Tell | the bubble glints for 6 frames and flashes blue when it turns a shot | readable |

Difference from the bubble: it never shrinks and never breaks, so it has a cost instead (it does nothing against melee). That is the trade the owner wants.

### (ii) Damage tool for the strong (no shield, no reflect, no block)

"Pulse": a ring burst around the fighter, built from Fox's hit-on-activation idea but with the 20-frame tell the owner requires.

| Setting | Proposal |
|---|---|
| Tell (startup) | **20 frames**: a visible charging ring (the existing HIT ART tells fit) |
| Active | 3 frames, a ring of the fighter's body size plus about 24 px, hits both sides, ground and air |
| Damage | **3.5%** (below the fast-poke median 6.6% and the combo-starter median 4.7%: it is a chip tool, not a combo move) |
| Knockback | small, **set** (no scaling) so it cannot kill at any percent; mostly horizontal (angle about 20 degrees up, magnitude about 5) |
| Hitstun | 12 frames. The end lag is longer, so it does not combo into itself |
| End lag | 24 frames |
| Cooldown | 90 frames after the end lag (1.5 s) |
| Versus shields | does shield damage equal to its damage (3.5), so a strong fighter can still chip, but weakly; the owner decides (see open questions) |
| Does not | reflect, block, absorb, armour or grant invulnerability |

A strong fighter ends up with 47 frames of commitment for 3.5%: a deliberate nerf, since it gains a tool it does not need and loses the defence the others get.

## 3. The strong list by the numbers

**How the score works (0 to 100).** Score = 50% Hard-CPU win rate + 30% cup final wins + 20% simulated damage and KO share.
- *Win rate*: wins out of 15 from the 2026-10-28 Hard-CPU run (`winrates.md`, 102 fighters, 15 matches each against the same 15 opponents).
- *Cup wins*: 1v1 final wins in the owner's 50 logged cups (`world-cup-results.md`, tallied in `winner-move-types.md`), 4 wins = 100 points, capped at 4.
- *Sim share*: the average of the fighter's percentile in total simulated damage and in simulated KOs (`move-catalog.csv`, 30 CPU matches). **Only 31 fighters have these columns**; for everyone else the sim term is dropped and the other two terms are scaled up. That is the biggest weakness of the method.

| Rank | Fighter | Score | Hard win rate | Cup final wins | Sim damage / KOs | Notes |
|---:|---|---:|---|---:|---|---|
| 1 | Toothpaste | 95.4 | 14/15 | 4 | 2524 / 15 | the only fighter strong on every measure |
| 2 | Magnet | 67.0 | 13/15 | 1 | 1506 / 19 | most sim KOs of the sampled group |
| 3 | Tennis Ball | 65.3 | 8/15 | 3 | 1651 / 12 | cups better than the Hard run |
| 4 | David | 64.4 | 13/15 | 1 | 1534 / 11 | |
| 5 | Puffball | 62.6 | 6/15 | 4 | 1647 / 9 | uncertain: the Hard run is low, the cup wins are 4 and partly from CPU gaps since closed (see `winner-move-types.md` section 6) |
| 6 | Firey | 62.5 | 15/15 | 0 | no data | uncertain: no cup win (lost the #31 final), no sim data, and her kit changed since the run |
| 7 | Bomby | 62.5 | 15/15 | 0 | no data | uncertain: no cup win, no sim data. Not the same fighter as Bomb (Bomb won a cup, 5/15 Hard) |
| 8 | Lollipop | 62.4 | 13/15 | 1 | 1557 / 9 | |
| 9 | Pencil | 61.9 | 11/15 | 1 | 3013 / 12 | most simulated damage of anyone |
| 10 | Match | 58.3 | 14/15 | 0 | no data | borderline: wins by surviving (the owner's #7, #10 note), no cup win |
| 11 | Ruby | 58.0 | 11/15 | 1 | 2206 / 9 | |
| 12 | Gelatin | 55.2 | 7/15 | 3 | 1139 / 10 | |
| 13 | Golf Ball | 54.9 | 12/15 | 1 | 833 / 11 | |
| 14 | Ruler | 54.2 | 13/15 | 0 | no data | |
| 15 | Taco | 53.7 | 13/15 | 0 | 1467 / 9 | strong in the Hard run, never in a reported final |

**Proposed cut line.** The only real gap in the scores is between Pencil (61.9) and Match (58.3). So: **strong = ranks 1 to 9, and Match as a flagged tenth** (the owner's "about 8 to 10"). Everything from Ruby down is within 5 points of one another, so do not pull any of them in without a new run.

**Flags.**
- The Hard-CPU run predates the balance pass and Update 1, and one 15-match run is noisy (about plus or minus 2 wins).
- Puffball, Firey, Bomby and Match are the least certain; Tennis Ball is solid on cups but only average on the Hard run.
- Clover is 2/15 in the Hard run and has no cup win, so the numbers do not put her on the list. The three hidden prize fighters are not listed and not ranked.
- The cup log has few repeat winners that are not luck (`winner-move-types.md`: only Toothpaste and Puffball are clearly above chance), so the cup term is weak evidence.

## 4. Reflector-fit fighters by kit (at most 15; none in the strong cut)

Judged from name, look and kit text in `ROSTER` (`index.html` lines 2063 to 2372). "Shots" means the fighter has a projectile worth reflecting back (kit text, or PROJECTILE moves in `move-catalog.csv`). **Gaty is already the reflector fighter** (Swing Open and Reflect Stance), so she is not listed as new.

| # | Fighter | Why the object fits | Own shots? |
|---|---|---|---|
| 1 | Silver Spoon | a polished spoon bowl is a literal mirror; heavy (94) | no |
| 2 | Coiny | a shiny coin, flat and round; his counter already deflects | no (a quick chain) |
| 3 | Nickel | a coin; "heads or tails" fits a flipped-back shot | no |
| 4 | Nickel (II) | a coin and a zoner whose sarcasm shockwave grows with damage | yes (shockwave) |
| 5 | Trophy | polished gold, glints | no |
| 6 | Bell | brass, a ringing shield-like dome (112 weight) | no |
| 7 | Lifering | a flat ring and round buoy; has no damaging kit, so it gains an answer | yes (Spare Ring) |
| 8 | Clock | a round glass face (event fighter) | no |
| 9 | Bubble | a clear sphere; she already carries a shield, so this would be a swap | yes (drifting bubble) |
| 10 | Lightbulb | glass bulb, shiny | yes (Electric Ball) |
| 11 | Basketball | a round ball | yes (dribble ricochet) |
| 12 | 8-Ball | glossy round ball (event fighter) | no |
| 13 | Microphone | a round shiny head | yes (the thrown ball) |
| 14 | Golf Ball | a round dimpled ball | yes (Zap Shooter). Rank 13 on the strong list, just outside the cut: the owner may prefer to keep him strong |
| 15 | Tea Kettle | a polished metal body with a lid | no |

Not listed on purpose: Tennis Ball (strong, rank 3). Fighters whose shots a reflector hurts most are the shooters the owner's cups show are common (Toothpaste, Lightning, Pen, Golf Ball, Lightbulb).

## 5. Open questions for the owner

1. Is Match in the strong group? (He is the only one on the line.)
2. Should the reflector hit anything on activation, like Fox's 2% (I proposed none)?
3. Should the reflector's multiplier be flat 1.3x, or vary by fighter (Falco-style 1.2x to Wolf-style 1.5x)?
4. Does the damage tool chip shields (my proposal, equal to its damage), or does it bounce off?
5. Gaty keeps her stance as a down special; does she also get Z? (Her special already exists.)
6. Bubble is on the fit list but already has a shield kit: swap or keep?
7. Should there be a rerun of the Hard-CPU win rate before the cut is final? The numbers are from 2026-10-28.

## 6. What I could not verify

- **Fox's active frames, 2% hit knockback and reflect multipliers in Ultimate.** UFD gives startup 3, total 36, damage 2.0, and no "active" field; SmashWiki gives 2%, a semi-spike with the aerial angle lowered from 40 to 24 degrees, and final frame 37. The 1.4 and 1.4 multipliers come only from the SmashWiki Reflection table, which says it needs more data. Ultimate-specific multipliers for Fox and Falco are not on their own pages.
- **Wolf's hit:** UFD lists 4.0, SmashWiki says 3%.
- Falco's multipliers (1.2 and 1.3) and Wolf's (1.5 and 1.8) are from the same table; they are consistent with the individual pages.
- **Other platform fighters:** nothing usable found beyond one unverified line on Rivals' Clairen.
- **The strong list:** the sim columns exist for only 31 fighters; I did not run a new simulation; the final losses of each fighter in the cups were not tallied (only Lightning's 5 are known); the Hard-CPU run is pre-Update 1.
