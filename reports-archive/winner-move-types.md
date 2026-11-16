# Which move types do the winning fighters share?

*Read-only analysis, 2026-11-04. Evidence: the owner's 50 logged World Cup finals (`world-cup-results.md`, CPU vs CPU on Expert), the in-game move cards (card table about line 17996 of `index.html`: jab, special, up special, down special, finisher), the smash table (`SMASH_SPEC`, about line 66874) and the Hard-CPU win-rate and kit-usage reports (`winrates.md`, `cpu-kit-usage.md`, both from 2026-10-28, before Update 1). Nothing in the game was edited. The three hidden prize fighters are left out of the analysis.*

## 1. Short answer

No single move type explains winning. The traits below are ranked by how much evidence supports them, and none is strong. The most common features of winners (a long-reach shot, a trap, a reaching finisher) are almost as common among the fighters that never win, so they are not the cause.

What winners have more often than the control group:

1. **A way to pin, pull or freeze the foe** (root, freeze, pull-in, grab) on a main move.
2. **A strong jab (8% or more), or a "next attack hits much harder" boost** on an up or down special. This matters most because the CPU's main attack is its jab.
3. **A smash that reaches or lingers** (mine, beam, anvil, pull). This is a trait of one-time winners more than of repeat winners.
4. **A finisher that reaches** (long reach, auto-aimed or area).

The strongest result is about luck, not moves. Only **Toothpaste and Puffball (4 wins each)** are clearly above chance. Everyone else's record is close to what luck alone would give (section 6).

## 2. Groups

All 1v1 finals with a result (39 of them) are counted. Team wins are not counted.

- **Repeat winners (7):** Toothpaste (4 wins), Puffball (4), Tennis Ball (3, plus a team win), Gelatin (3), Coiny (2), Snowball (2), and Lightning (1 win, 5 final losses: #16, #17, #40, #48, #49).
- **Single winners (18):** Lightbulb, Money, Cake, Tapey, Magnet, Blueberry, Rose, Bomb, Barf Bag, Golf Ball, David, Lollipop, Leafy, Blocky, Tree, Fries, Ruby, and **Pencil** (won #22, which the owner's list left out). The prize fighter who won #35 is skipped.
- **Control (8):** Teddy Bear (never reached a semifinal, #50 note), Yin-Yang (lost the #50 final), Knife (34 mentions, never won a final), and five fighters with zero or near-zero mentions in the log: Book, Taco, Basketball, Dora, Bubble.

Weakness of the control group: Taco (87% in the Hard-CPU run), Bubble (73%) and Dora (73%) are strong in that other measurement. Zero mentions in the log may mean they were unlucky or rarely entered, not that they are weak. I could not check how many cups each fighter entered. They are useful as a test, though. They have many winner-like features and still never reached a reported final.

## 3. Move-type tags (how each fighter was tagged)

Tilts and aerials were left out. They come from a per-archetype template (the "plain share" in the MOVESETS code, about line 80440), so they barely differ between fighters. The tags use the jab, special, up special, down special, finisher and smash.

| Tag | Rule |
|---|---|
| A. Long reach | A move beyond the free "Ranged" shot that hits from far away, or auto-aims: the card says long, very long or whole-stage reach, or "nearest foe". |
| B. Trap or lingering hazard | A mine, trap, puddle, summon, log or zone that stays on the stage. |
| C. Pin, pull or freeze | A root, freeze, pull-in, grab, hold or control-steal on a special, finisher or smash. |
| D. Armour or counter | An armoured move, brace, counter stance or parry. |
| E. Buff or banked hit | A self-buff or a hit stored for later. |
| F. Heal | Heals on a move. |
| G. Untouchable or flight | An untouchable dash, blink or reappear, or free flight. |
| H. Reaching finisher | A finisher with long reach, a wide area, or auto-aim. |
| I. Strong jab | A jab of 8% or more, or an empowered jab. |
| J. Reaching smash | A smash that is a mine, beam, anvil, coins, gadget, roller or pull (not a close lunge, dash or burst). |
| K. Next-attack boost | A sub-tag of E: "your next Attack (X) hits much harder". |

## 4. Fighter by fighter

Y = has it. "(b)" = borderline.

| Fighter | Group | A | B | C | D | E | F | G | H | I | J | Notes from the kit cards |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Toothpaste | repeat | Y | Y | Y |  |  |  | Y | Y | Y |  | root traps, teleport, rocket finisher; mine smash (counted as J) |
| Puffball | repeat | Y |  |  |  | Y |  | Y |  | Y(b) |  | free flight on 3 moves, Flight boosts next X (K), cloud jab spans the whole stage, close "bop" 13% |
| Tennis Ball | repeat | Y | Y |  |  |  |  |  | Y | Y | Y | gadget ball, mine, battery; jab 8% with the longest racket; whole-stage finisher 14% |
| Gelatin | repeat | Y | Y | Y |  |  |  |  | Y | Y | Y | freeze syringe, freeze mine, 3-hit jab, jelly glob |
| Coiny | repeat |  |  | Y | Y |  |  |  |  | Y |  | 9% jab, counter, slap-fight hold finisher |
| Snowball | repeat |  |  | Y | Y |  |  |  | Y | Y |  | armoured charge, Dig In armour, pack-and-bowl finisher, 8% jab |
| Lightning | repeat | Y | Y |  |  |  |  | Y | Y |  |  | Chain Bolt auto-aim, floor trap, Flash blink, thundercloud; 5% jab |
| Lightbulb | single | Y | Y |  |  |  |  | Y | Y |  | Y | beam smash 520 px, tile finisher |
| Money | single |  | Y |  | Y | Y | Y | Y |  |  | Y | Bank It (K), piggy bank, heals 3% |
| Cake | single | Y | Y | Y |  | Y | Y |  | Y | Y | Y | empowered jab (K), heal, pull smash |
| Tapey | single | Y |  | Y |  | Y |  |  | Y |  | Y | tapes the biggest hit and plays it back, beam smash, rewind finisher |
| Magnet | single | Y |  | Y |  | Y |  |  | Y | Y | Y | pull, Climbing Gear (K), pull smash, 8.5% jab |
| Blueberry | single | Y | Y | Y | Y | Y |  | Y | Y | Y | Y | lift-and-slam, armoured Overhead Press (K), Play Dead, boulder, mine smash |
| Rose | single | Y |  | Y | Y |  |  |  |  | Y | Y | whip pull, root, counter, pull smash, 9% jab |
| Bomb | single |  | Y |  | Y |  |  | Y | Y | Y |  | untouchable Collision, timer bomb, 8% jab |
| Barf Bag | single |  | Y | Y(b) |  |  | Y |  | Y | Y |  | puddle, takes control of foes for 2 s, drain finisher |
| Golf Ball | single | Y | Y |  | Y | Y |  |  |  |  |  | Zap Shooter hits the whole stage, puddle, brace, curse aura |
| David | single |  |  | Y | Y | Y |  |  |  | Y |  | grab finisher, Big Armor, Jumpscare (K), empowered jab |
| Lollipop | single | Y | Y | Y |  |  |  |  | Y | Y | Y | sticky shot, rooting trap, flurry finisher |
| Leafy | single |  |  |  | Y |  |  | Y | Y |  |  | untouchable Sprint and blink, parry, 3% jab |
| Blocky | single | Y | Y |  |  |  |  |  | Y | Y | Y | anvil, trap, swap finisher, 9% jab |
| Tree | single | Y | Y | Y | Y |  |  |  |  |  |  | Timber, log, armour, root smash |
| Fries | single | Y | Y | Y(b) |  |  |  |  | Y | Y |  | fry shots, trap, carton cap 0.8 s |
| Ruby | single | Y | Y |  | Y | Y |  |  | Y |  | Y | long bouncing bolt, gem trap, prism, 900 px beam smash |
| Pencil | single | Y |  |  | Y |  |  |  | Y | Y | Y | van across the stage, fire spit, super armour, 400 px dive, 10% jab |
| Teddy Bear | control | Y |  |  |  |  |  |  | Y |  |  | paint gun, grenade; 6% jab |
| Yin-Yang | control | Y |  |  |  |  |  | Y |  |  |  | throws Yin, untouchable up special |
| Knife | control | Y | Y | Y |  |  |  | Y |  |  |  | Bag of Tricks (shock, boomerang, caltrops, drag), Fake-Out |
| Book | control |  |  |  | Y | Y |  |  |  | Y |  | Define mark, brace, 8% jab |
| Taco | control | Y | Y | Y |  |  | Y |  |  | Y | Y | root jawbreaker, drag, salsa puddle, roller smash, heal |
| Basketball | control | Y | Y |  |  |  |  |  | Y |  |  | whole-stage dribble, mine |
| Dora | control |  |  |  | Y |  |  |  | Y | Y |  | 3-hit rant, brace, 9% jab |
| Bubble | control |  | Y |  | Y |  |  | Y | Y |  |  | shield, untouchable reform, drifting bubble |

## 5. Three-way table (counts and share of each group)

Repeat winners n = 7, single winners n = 18, control n = 8.

| Tag | Repeat winners | Single winners | Control | Reading |
|---|---|---|---|---|
| A. Long reach | 5 (71%) | 13 (72%) | 5 (63%) | **common to all**: not the cause |
| B. Trap or lingering | 4 (57%) | 12 (67%) | 4 (50%) | **common to all**: not the cause |
| C. Pin, pull or freeze | 4 (57%) | 10 (56%) | 2 (25%) | winners about 2x control |
| D. Armour or counter | 2 (29%) | 10 (56%) | 3 (38%) | not a repeat trait |
| E. Buff or banked hit | 1 (14%) | 8 (44%) | 1 (13%) | **single winners only** |
| K. Next-attack boost | 1 (14%) | 5 (28%) | 0 | **single winners only** (Puffball, Money, Cake, David, Magnet, Blueberry) |
| F. Heal | 0 | 3 (17%) | 1 (13%) | too rare to say |
| G. Untouchable or flight | 3 (43%) | 5 (28%) | 3 (38%) | **common to all**: not the cause |
| H. Reaching finisher | 5 (71%) | 13 (72%) | 4 (50%) | slight edge for winners |
| I. Strong jab | 6 (86%) | 11 (61%) | 3 (38%) | repeat winners highest |
| J. Reaching smash | 3 (43%) | 11 (61%) | 1 (13%) | **largest gap to control**, but repeat winners are lower than singles |

Traits that a one-time winner already has (so they may be what gets a fighter a win at all): J (reaching smash), E and K (buffs), D (armour or counter), C (pin). Traits only the repeat winners have in higher numbers: I (strong jab, 86% against 61% and 38%) and, a little, H, A and B. These counts are small (n = 7), so even this split is weak.

Two further numbers:
- **Trap plus a pin on the same kit (B and C):** 2 of 7 repeat winners, 6 of 18 single winners, 2 of 8 control. That is no real difference, so "trap plus a lock" is not a winner trait in this data.
- **CPU kit-usage rank** (of about 106, from `cpu-kit-usage.md`, lower is better). Repeat winners: Toothpaste 2, Snowball 3, Lightning 4, Gelatin 5, Coiny 47, Tennis Ball 72, Puffball 90. Single winners: median about 33 (Golf Ball 6, Lollipop 11, Pencil 7, up to Tapey 99). Control: best Bubble 31, then Basketball 36, Dora 38, Book 39, then Teddy Bear 70, Taco 75, Knife 82, Yin-Yang 87. Four of the seven repeat winners sit in the top five. No control fighter does.

## 6. How good is the evidence

**Is the "repeat winner" label luck?** About 100 fighters and 39 reported 1v1 finals give a chance of roughly 0.38 wins per fighter. If everyone were equally strong:
- 2 or more wins would be expected for about 6 fighters. We see Coiny and Snowball, which is what luck gives. Coiny and Snowball are therefore not clearly strong.
- 3 wins would be expected for about 0.7 fighters. We see Tennis Ball and Gelatin (plus Gelatin was a finalist at only 7/15 Hard rate). That is a little high but plausible.
- 4 wins would be expected for about 0.07 fighters. We see **Toothpaste and Puffball**. That is a real signal.
- Lightning reached 6 finals but won 1. She is a "gets there, doesn't finish" fighter, not a strong one.

This assumes every fighter had the same chance of being in a cup. That is not verified: #9 and #26 were hand-picked low-rank cups, and in #20 the owner changed the entrants.

**Era confound.** Six of the eight wins by Toothpaste and Puffball (all but #42 and #49) came before Update 1, and the early ones before the bot fixes too (the exact dates of #15 and #18 against the fixes are not verified). Toothpaste won #3, #11 and #15 before them, and Puffball won #4, #7 and #18. Puffball's early wins also leaned on CPU gaps that the 2026-10-29 edge-guard fixes later closed (#4, #7: the CPU judged her as not able to recover and did not ledgeguard). In the 15 finals since Update 1 (#36-#50) there were 14 different winners and only Gelatin repeated. That looks like many coin flips, and the winners include Rose, Tapey, Money and Blueberry, who are not in the top of any ranking.

**Other limits.**
- The sample is small: 8 control fighters and 7 repeat winners, with no significance test that would hold up.
- The matches are CPU vs CPU, so a move counts only if the CPU uses it. The CPU plays shots, traps, heals, stances, jab and tilt strings, finishers at kill % and up specials to recover (the owner's #15 note and the lead's reading). It does not use most up specials as attacks.
- The 2026-10-28 Hard-CPU win rates and kit-usage ranks pre-date the balance pass and Update 1. Several kits changed since (new finishers, a Squeeze Rocket start delay, Cake and Firey changes).
- Not verified: frame data (startup and cooldown) for specials; the card text was read, not the code of every move. Tilts and aerials were not tagged.
- Weights do not separate the groups. Mean weight is about 79 for repeat winners, 90 for singles and 85 for control, and the repeat winners include the two lightest fliers.

## 7. The top shared traits, ranked by evidence

### 1. A pin, pull or freeze on a main move (tag C), best supported by the log

- **Who:** Toothpaste, Gelatin, Coiny, Snowball (4 of 7 repeat winners). Singles: Cake, Tapey, Magnet, Blueberry, Rose, David, Lollipop, Tree, plus borderline Barf Bag and Fries. Control: only Knife and Taco.
- **Log support:**
  - Toothpaste: #3, #11 (two stocks from the same string), #15 and #42, the trap, hit and Squeeze Rocket string.
  - Lollipop: #17 and #19, the rooting trap into the flurry.
  - Gelatin: freeze kills at low % (#29, #30).
  - David: #16, the grab on a whiffed up-air.
- **CPU effect:** the CPU walks straight into laid traps and roots (log tactics 3 and 4). The hazard-sense fix (about 2026-11-01) makes this less free.
- **Balance question for the owner:** if you decide any of them is too strong, a nerf would target the follow-up after the pin (Toothpaste's rocket right after a root, Lollipop's flurry after a root, Gelatin's freeze threshold). Her root-chain fix and the rocket's 9 to 8 launch and start delay are already in. The owner decides.

### 2. A strong or boosted jab (tags I and K)

- **Who:** 6 of 7 repeat winners (not Lightning) have a jab of 8% or more, or a bop. Banked "next Attack harder" kits are Puffball, Money, Cake, David, Magnet and Blueberry (6 of 25 winners, 0 of 8 control). Firey also has one and lost a final.
- **Log support:** Tennis Ball's plain 8% racket jab was the move that beat OJ in #13 (measured: 513 hits, about 13 a match, because its reach is longer than OJ's). Cake's empowered jab took 22 of 23 KOs in the Hard run, and the owner called it a hit no one can react to. Magnet's jab had 23 of 27 KOs in the Hard run.
- **CPU effect:** the CPU plays every fighter mostly as a jabber (log #10 note), so a fighter with a strong jab gets more out of the CPU than a fighter whose best moves are non-jab.
- **Counter-evidence:** Book, Taco and Dora also have 8%+ jabs and never reached a final.
- **Balance question for the owner:** an empowered jab that comes out on frame 2 (Cake, David, Magnet, Blueberry) is a hit that cannot be avoided on reaction. The owner already softened Firey's and Magnet's launch bonus. A change would target the launch bonus of Cake's (and David's and Blueberry's) boost; the owner decides.

### 3. A reaching or lingering smash (tag J), best at getting a single win

- **Who:** 3 of 7 repeat winners (Toothpaste, Gelatin, Tennis Ball), 11 of 18 singles (Lightbulb, Money, Cake, Tapey, Magnet, Blueberry, Rose, Lollipop, Blocky, Ruby, Pencil), 1 of 8 control (Taco). This is the largest winner-versus-control gap (56% against 13%).
- **Log support** is thin: Lightbulb's 520 px beam ledgeguard (#20), Loser's spaced smash (#4), Blocky's anvil (#26 note). Pillow's hammer smash and Bell's smash plays were from fighters that lost.
- **Balance question:** none follows on its own. Several of these fighters (Lightbulb, Barf Bag, Fern, Goo) were buffed in the 2026-10-28 balance pass specifically to give their smash kill power, so the gap may partly be the buffs working.

### 4. A reaching finisher (tag H)

- **Who:** 5 of 7 repeat winners, 13 of 18 singles, 4 of 8 control. Reaching finishers include Gelatin's glob, Tennis Ball's whole-stage ball, Lightning's thundercloud, Tapey's tape, Magnet's pulse, Ruby's prism and Pencil's dive.
- **CPU effect:** the log's most common error is a finisher thrown with no reach check (34 to 35% of simulated matches, the owner chose to leave it, #18). Finishers that auto-aim or cover a wide area are exactly the ones that survive this CPU habit.
- **Evidence:** weak. The control group has it in half its members.

### 5. Common to every group, so not the cause

- A long-reach shot (A): 71%, 72% and 63%.
- A trap (B): 57%, 67% and 50%.
- An untouchable or flight escape (G): 43%, 28% and 38%.
- Armour or counter (D) and heals (F) are about equal across groups or too rare to say.
- Traps are the log's most-cited winning play (#3, #6, #8, #9, #11, #14, #19, #42), but presence is not what separates winners from control. Knife, Taco, Basketball and Bubble all have traps and never won.

## 8. Two other points

- **Lightning (5 final losses).** Her kit has A, B, G and H but no pin, no strong jab (5%) and no reaching smash. The log blames her errors: a failed ledgeguard (#16) and walking into a trap on a platform (#17). That fits her missing C, I and J, but it is one fighter and not verified.
- **Clover is balanced and must not be touched without asking the owner.** Nothing here suggests changing her. She has not won a reported final, and her Butterflies (the owner's "best move overall" in #20) are a projectile wall and a debuff, not one of the traits above.

*Source locations (read-only): move cards about line 17996, `SMASH_SPEC` about line 66874, templated normals (`MOVESETS`) about line 80440 of `C:\Users\carad\Aardvark\smash-island\smash-bal\artifacts\V1\index.html`.*
