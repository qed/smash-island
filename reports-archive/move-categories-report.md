# Move categories of the World Cup winners: catalog, owner call-outs vs simulation, totals

*Read-only analysis, 2026-11-04. Nothing in the game was edited. Fighters: 25 cup-final winners (7 repeat, 18 single; Lightning counted with the repeat group because she has 1 win and 5 final losses) and 6 controls (Teddy Bear, Yin-Yang, Knife, Book, Taco, Basketball). The three hidden prize fighters are left out of the analysis; where the owner's words are about one of them, the report says "prize fighter". Companion files in the same folder: `move-catalog.csv` (640 rows, one per move, with the simulated numbers added) and `move-totals-by-fighter.csv` (the counts of section 5).*

**Sources.** The real move data of `artifacts/V1/index.html` read through the jsdom harness (`MOVESETS`, `SMASH_SPEC`/`SMASH_ID`, `MOVE_TEXT`, `rangeProfile`, `FINAL_SMASHES`/`FS_BLURBS`), the owner's log `world-cup-results.md`, and 30 move-instrumented CPU-vs-CPU matches I ran for this report (section 4). Scripts: `scratchpad\movesim\` (`extract.mjs`, `sim.mjs`, `build.py`, `analyze.py`, `part23.py`, `callouts.py`, `report.py`).

## 0. The answer in brief

**Categories ranked by how much they help** (details and caveats in section 6; the ranking averages three ranks: share of simulated damage, share of simulated KOs, and how many more moves of that category a winner has than a control fighter):

1. **FAST POKE** (jabs and quick pokes): first on all three measures. The jab slot alone is 38% of all simulated damage and 30% of KOs, and is the top damage move for 24 of 31 fighters.
2. **FINISHER** (V+C): 8% of damage but 13% of KOs, 5.3 KOs per 100 uses (the best of any large category), and 21 of the owner's 46 praising call-outs.
3. **PROJECTILE**: second in damage (22%) and in KOs (15%), but a little *less* common among winners than control.
4. **BURST** and **SPIKE/METEOR** (they rank 4th and 5th only because of the winners-minus-control column; BURST is 8 moves, SPIKE/METEOR is 34 near-identical down airs, so treat both as weak evidence).
5. **MULTI-HIT**, **TRAP/MINE** (second most praised by the owner, but 0.3% of simulated KOs), **COMBO STARTER** (13% of KOs, mostly template up-tilts and up-airs), and **MOBILITY/DASH ATTACK** (5.7% of damage and 10.8% of KOs from 2% of uses: 19.6 KOs per 100 uses, by far the most efficient, yet fewer winners have one than controls).

**Three biggest agreements** between the owner and the simulation:
1. *Finishers, and Toothpaste's Squeeze Rocket in particular.* The owner's most praised type; in the simulation it is Toothpaste's top damage move (33% of her damage) and 13 of her 15 KOs.
2. *Long-reach shots as a fighter's main damage.* Puffball's spit (the owner's best move in #2), Ruby's Gem Bolt (#8) and Pencil's van (#22) are each that fighter's top damage move, and they are the top three single moves of the whole sample by damage (Pencil's van 1,432, Puffball's spit 1,208, Gem Bolt 1,201).
3. *Tennis Ball's plain jab and "REALLY big hits" (#13, #33).* It is Tennis Ball's top damage move (51%); across all 28 praised call-outs that map to a move, 14 are the fighter's top damage move and 19 are in its top three.

**Three biggest disagreements:**
1. *Traps.* Nine praising call-outs (second most), but trap and mine moves are 2.5% of uses, 2.8% of damage and 1 of 325 attributed KOs (Toothpaste's two traps: 0 KOs). The owner is describing set-up value (a root into a rocket); my counter credits the KO to the finisher. Not a refutation.
2. *Jabs.* The simulation's biggest source of damage and KOs, but only 7 of 46 praising call-outs name a jab. The owner names the jabs that stand out (Tennis Ball, spit, Gem Bolt); the CPU just uses them all the time.
3. *Dash attacks.* The owner only criticises them (Leafy's kamikaze Sprint, Snowball falling off, tactic 6: 3 criticising call-outs, 0 praising), yet they are the most efficient killers in the simulation (Bomb's Collision 11 KOs from 30 uses).

**Who has the most of the helpful effects** (lock effects pin/pull/freeze/stun plus kill-capable at 100% or less, on the six kit moves): Magnet 7, Toothpaste 6, Gelatin 6, then Tennis Ball, Coiny, Rose, Bomb 5. No control fighter has more than 3. Mean lock moves per fighter: repeat winners 1.86, single winners 1.17, control 0.83.

**Could not verify:** startup frames and cooldowns of specials and finishers (not in the data); CPU-versus-human use; the 30 matches are 4-fighter free-for-alls, not the owner's 1v1 finals; and the same 30 lineups gave different numbers on three runs (KO shares moved by up to 7 points, see section 6). Pin and freeze starts were measured only in the last run. Clover is not in the set and was not touched; her Butterflies (the owner's "best move overall") are described as a zoning wall in section 4.

## 1. Taxonomy (one primary category per move)

Every move gets exactly one primary category and zero or more secondary effects. 24 categories: all 22 from the brief, plus **2 added** (BURST, SKY DROP). RECOVERY is used with or without a hitbox. The brief's "FINAL SMASH" is used for the Smash Ball move only.

| Category | One-line definition (as used here) |
|---|---|
| FAST POKE | Startup 6 frames or less, small knockback, mostly a jab or a plain tilt/aerial; the move you throw to trade or chip. |
| SPACING POKE | Fast (startup 6 or less) with long reach (75 px or more) for its slot: hits from outside the foe's own reach. |
| MULTI-HIT | One press lands several hits (a 2-3 hit jab, a spinning neutral air, a 3-5 hit special). |
| COMBO STARTER | Low knockback and a long hitstun, or a pop-up that sets up a follow-up (up tilt, down tilt, up air, up/down throw). |
| TRUE KILLER | High knockback, quick and reliable (a back air with launch of about 9.5+, or a launching fair). |
| READ KILLER | Slow, committal, huge damage and knockback; you win by guessing right (the rooted blast smashes). |
| PROJECTILE | A thrown, fired or auto-aimed shot or beam that travels to the foe (includes instant beams and bouncing balls). |
| ZONING WALL | A lingering or area attack that stays on the stage and keeps hitting (puddles, repeating traps). |
| TRAP/MINE | Set on the floor, waits for a foe to step on it, then hits or holds. |
| COMMAND GRAB/GRAB | A grab that cannot be blocked by armour or a stance (the shared X+C grab and a special that lifts and slams). |
| PIN/HOLD | A move whose job is to root or hold the foe in place. |
| PULL | Drags the foe toward you (whips, magnets, reels). |
| FREEZE/STUN | A move whose point is a status (freeze, stun, control scramble, control steal) rather than damage. |
| ARMOURED/INVINCIBLE STARTUP | No hit; the move is armour or untouchability for a moment. |
| COUNTER | A stance that punishes the foe's hit. |
| MOBILITY/DASH ATTACK | A dash, lunge or charge that hits whoever it runs into. |
| RECOVERY | An up special or blink used to get back up, with or without a hitbox. |
| SELF-BUFF | Buffs the next attack or the fighter (empower, mark, immunity, curse aura). |
| HEAL/RESOURCE | Heals, or stores or swaps something (tape, gadget). |
| SPIKE/METEOR | Hits downward, or drops on the foe from above (down air; the dive and crash up specials). |
| FINISHER | The V+C move. Its subtype (projectile, trap zone, grab, pin chain, ...) is in the effects list. |
| FINAL SMASH | The Smash Ball cinematic. Not reachable in the item-off cups or in my simulation. |
| **BURST** (added) | A point-blank shockwave, ring or spin that hits everyone around the fighter. |
| **SKY DROP** (added) | A drop from above onto the nearest foe or the aimed spot, after a warning. |

**Secondary effects used:** stun, pin, pull, freeze, knockdown, launch, kill<=100 (kill-capable at 100% damage or less), trap, buff, heal, armour, invulnerable, projectile, multihit, mobility, spike, grab, slow, bleed, burn, poison, curse, scramble, silence, debuff, control-steal, bait-friendly (a move whose value is a read, a counter or a set-up), combo-hitstun (a long hitstun, 22+ frames).

**How the category was decided.**
- *Tilts, aerials, throws and the grab* come from the per-fighter move table `MOVESETS[kit]` (a shared archetype template with each fighter's own numbers). They were classed by rule from the data: slot, startup, reach, the launch vector, hitstun, the effect text, and whether a box re-hits (multi-hit). Kill-capable = launch magnitude 12 or more, or 9.5 or more with 6.5 or more sideways (a test with a foe at centre stage showed a launch of 10 kills at 100%, 14 at 60%).
- *Jab, neutral/up/down special, finisher and smash* were classed by hand from the move-card text (`MOVE_TEXT`), the smash rows (`SMASH_SPEC`, `SMASH_ID`) and `rangeProfile` (jab damage, launch, multi-hit). The card text gives damage and reach words, not startup frames or cooldowns, so startup for specials and finishers reads "not in data".
- *Kill-capable at 100% or less* is also set where the simulation saw that move KO a foe at 100% or less.
- *Inactive moves.* Forward tilts (`SIDE_TILTS = false`) and side specials (`SIDE_SPECIALS = false`) are switched off in the game today. They are in the catalog (marked inactive) but are not counted in any total. Puffball has no neutral air (X in the air is her spit) and Ruby has none (X is her Gem Bolt): they have 13 active attack slots instead of 14.

## 2. Part 1: the move catalog

**What is in it.** 640 rows: for each of the 31 fighters, the jab, forward tilt (inactive), up tilt, down tilt, neutral/forward/back/up/down air, neutral/up/down special, side special (inactive), smash, finisher, the grab and four throws, and the Final Smash. 554 are active moves. Each row has the category, the effects, and the key numbers the data gives (damage, startup frames, launch vector and its magnitude, reach in px, cooldown/end lag). Where a move comes from a shared archetype template (`MOVESETS[kit]`: tilts, aerials, grab, throws) the row says so in the CSV `source` column and carries the fighter's own numbers. The full table with notes is `move-catalog.csv`; the per-fighter tables below are the same data in short form, with the simulated uses, damage and KOs (section 4) in the last column.

**How to read the numbers.** `dmg` is the raw hit value (fighter damage multipliers and the smash x1.5 are not applied to tilts and aerials; the smash and special cards are the final shown %), `st` is startup frames, `kb` is the launch vector (x, y; negative y is up) and its magnitude, `reach` is px (for specials it is the card's word). "Sim uses/dmg/KOs" is the instrumented 30-match run (section 4); a dash means not simulated (inactive or Final Smash). Smash startup is `SMASH_SPEC.at` plus the charge time in frames.

**Count of moves per category** (active moves; the grab and throws are excluded because they are the same for everyone):

| Category | Kit moves (6 per fighter, 186 total) | Template moves (7 per fighter, 217) | Active moves total |
|---|---|---|---|
| COMBO STARTER | 3 | 91 | 94 |
| FAST POKE | 27 | 11 | 38 |
| MULTI-HIT | 6 | 29 | 35 |
| SPIKE/METEOR | 3 | 31 | 34 |
| FINISHER | 31 | 0 | 31 |
| PROJECTILE | 28 | 0 | 28 |
| TRUE KILLER | 0 | 27 | 27 |
| SPACING POKE | 1 | 22 | 23 |
| TRAP/MINE | 11 | 0 | 11 |
| RECOVERY | 11 | 0 | 11 |
| MOBILITY/DASH ATTACK | 11 | 0 | 11 |
| SELF-BUFF | 10 | 0 | 10 |
| ARMOURED/INVINCIBLE STARTUP | 8 | 0 | 8 |
| BURST | 8 | 0 | 8 |
| PULL | 6 | 2 | 8 |
| COUNTER | 4 | 0 | 4 |
| SKY DROP | 4 | 0 | 4 |
| HEAL/RESOURCE | 3 | 0 | 3 |
| FREEZE/STUN | 3 | 0 | 3 |
| ZONING WALL | 3 | 0 | 3 |
| READ KILLER | 3 | 0 | 3 |
| COMMAND GRAB/GRAB | 1 | 0 | 1 |
| PIN/HOLD | 1 | 0 | 1 |

## 3. Per-fighter move tables

Order: repeat winners, single winners, controls. Inactive moves are marked and not counted.

### Toothpaste (repeat winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | MULTI-HIT | multihit | dmg 5.7x2; st ~2 (hit on the press; owner notes: frame 2); kb 9; reach 12 | 79 / 703 / 2 |
| ftilt | Squirt *(inactive)* | FAST POKE | - | dmg 5.5; st 4; kb 3.2,-4.2 (mag 5.3); reach 74; active 3, end 8 | - |
| utilt | Paste Plume | COMBO STARTER | combo-hitstun | dmg 4.7; st 4; kb 0.5,-10.6 (mag 10.6); reach 37; active 3, end 8 | 7 / 9 / 0 |
| dtilt | Smear | COMBO STARTER | combo-hitstun, pin | dmg 3.6; st 4; kb 1.5,-7 (mag 7.2); reach 74; active 3, end 7 | 22 / 89 / 0 |
| nair | Squeeze Spin | MULTI-HIT | multihit | dmg 2.8/hit; st 4; kb 1.2,-2.6 (mag 2.9); reach 48; active 7, end 6 | 3 / 3 / 0 |
| fair | Glob Punch | SPACING POKE | - | dmg 6.1; st 5; kb 2.6,-2.8 (mag 3.8); reach 76; active 3, end 9 | 17 / 18 / 0 |
| bair | Back Squirt | TRUE KILLER | - | dmg 7.5; st 5; kb -8.2,-4.4 (mag 9.3); reach 76; active 3, end 10 | 15 / 22 / 0 |
| uair | Tube Up | COMBO STARTER | combo-hitstun | dmg 4.6; st 4; kb 0.3,-8.6 (mag 8.6); reach 16; active 3, end 7 | 8 / 14 / 0 |
| dair | Paste Drop | SPIKE/METEOR | knockdown, pin, spike | dmg 7.4; st 7; kb 0.4,6 (mag 6.0); reach 16; active 4, end 11 | 17 / 65 / 0 |
| nspecial | Paste Trap | TRAP/MINE | trap, pin, projectile, bait-friendly | dmg 12%, roots them in place; reach long reach | 53 / 594 / 0 |
| uspecial | Teleport | RECOVERY | invulnerable, mobility, slow | dmg 5%, slows them; reach short reach | 33 / 55 / 0 |
| dspecial | Root Trap | TRAP/MINE | trap, pin, bait-friendly | dmg 6%, roots them in place | 10 / 30 / 0 |
| sidespecial | Paste Skid *(inactive)* | MOBILITY/DASH ATTACK | pin | dmg 4.9; st 2; kb 4.2,-3.8 (mag 5.7); reach 66 | - |
| smash | Whole Tube | TRAP/MINE | trap, freeze | dmg 15%, ices them over; st 34 (+charge 24); kb 5; reach 20 | 10 / 86 / 0 |
| finisher | Squeeze Rocket | FINISHER | kill<=100, launch, mobility, pin, projectile | dmg 10% | 91 / 830 / 13 |
| grab | Grab + pummel (Dab) | COMMAND GRAB/GRAB | grab, pin | dmg 2.5 pummel; st 4; reach 32 | 5 / 6 / 0 |
| fthrow | Squeeze Out | COMMAND GRAB/GRAB | grab | dmg 7.2; st after grab; kb 7.8,-4.2 (mag 8.9) | n/a / 0 / 0 |
| bthrow | Tube Flip | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 7.6; st after grab; kb 8.4,-4.8 (mag 9.7) | n/a / 0 / 0 |
| uthrow | Cap Pop | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 5; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 0 / 0 |
| dthrow | Stuck Down | COMBO STARTER | grab, combo-hitstun | dmg 4.8; st after grab; kb 1.8,-8.8 (mag 9.0) | n/a / 0 / 0 |
| Final Smash | You're My Enemy Now! *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 34; reach 440 | - |

### Puffball (repeat winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | PROJECTILE | kill<=100, multihit, projectile | dmg 2; st ~2 (hit on the press; owner notes: frame 2); kb 4; reach 15 | 219 / 1208 / 4 |
| ftilt | Cheek Bump *(inactive)* | FAST POKE | - | dmg 4; st 4; kb 3.6,-4.6 (mag 5.8); reach 56; active 2, end 6 | - |
| utilt | Pop-Up | COMBO STARTER | combo-hitstun | dmg 4; st 4; kb 0.6,-11 (mag 11.0); reach 64; active 3, end 7 | 4 / 2 / 0 |
| dtilt | Roll Under | COMBO STARTER | combo-hitstun | dmg 3.5; st 3; kb 1.8,-7.5 (mag 7.7); reach 70; active 2, end 6 | 25 / 36 / 0 |
| uair | Sky Pop | COMBO STARTER | combo-hitstun | dmg 4; st 3; kb 0.3,-8.5 (mag 8.5); reach 60; active 3, end 6 | 4 / 13 / 0 |
| dair | Belly Drop | SPIKE/METEOR | knockdown, spike | dmg 6.5; st 8; kb 0.6,8.5 (mag 8.5); reach 20; active 4, end 12 | 4 / 6 / 0 |
| nspecial | Flight | SELF-BUFF | buff, mobility |  | 0 / 0 / 0 |
| uspecial | Float Boost | RECOVERY | mobility, buff |  | 22 / 12 / 0 |
| dspecial | Hover | RECOVERY | mobility |  | 0 / 0 / 0 |
| sidespecial | Zoom *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 3.5; st 1; kb 4.5,-3 (mag 5.4); reach 50 | - |
| smash | Meteor Puff | SPIKE/METEOR | buff, kill<=100, launch, spike |  | 14 / 291 / 5 |
| finisher | Grow | FINISHER | buff, knockdown | dmg 9% | 15 / 58 / 0 |
| grab | Grab + pummel (Nibble) | COMMAND GRAB/GRAB | grab, pin | dmg 1.9 pummel; st 4; reach 26 | 3 / 0 / 0 |
| fthrow | Rainbow Spit | COMMAND GRAB/GRAB | grab | dmg 6.5; st after grab; kb 7.5,-4 (mag 8.5) | n/a / 17 / 0 |
| bthrow | Rollercoaster | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 7; st after grab; kb 8.4,-5 (mag 9.8) | n/a / 0 / 0 |
| uthrow | Up She Goes | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 4.5; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 4 / 0 |
| dthrow | Pounce | COMBO STARTER | grab, combo-hitstun | dmg 4; st after grab; kb 1.8,-9 (mag 9.2) | n/a / 0 / 0 |
| Final Smash | Vocoder Trance *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 34; reach 270 | - |

### Tennis Ball (repeat winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | bait-friendly | dmg 8; st ~2 (hit on the press; owner notes: frame 2); kb 8; reach 20 | 100 / 835 / 5 |
| ftilt | Bounce Check *(inactive)* | FAST POKE | - | dmg 6; st 5; kb 3.8,-3.8 (mag 5.4); reach 58; active 3, end 8 | - |
| utilt | Overhead Lob | COMBO STARTER | combo-hitstun | dmg 4.8; st 5; kb 0.7,-10.5 (mag 10.5); reach 84; active 3, end 9 | 13 / 24 / 0 |
| dtilt | Net Cord | COMBO STARTER | combo-hitstun | dmg 3.7; st 4; kb 1.6,-7 (mag 7.2); reach 70; active 2, end 7 | 18 / 24 / 0 |
| nair | Spin Serve | MULTI-HIT | multihit | dmg 3/hit; st 4; kb 1.3,-2.6 (mag 2.9); reach 46; active 6, end 6 | 8 / 18 / 0 |
| fair | Drop Shot | SPACING POKE | - | dmg 5.8; st 5; kb 2.6,-2.6 (mag 3.7); reach 75; active 2, end 9 | 27 / 105 / 0 |
| bair | Backhand Bounce | TRUE KILLER | - | dmg 7.7; st 5; kb -8.4,-4.4 (mag 9.5); reach 71; active 3, end 10 | 21 / 45 / 1 |
| uair | Smash Up | COMBO STARTER | combo-hitstun | dmg 4.7; st 4; kb 0.3,-8.8 (mag 8.8); reach 17; active 3, end 7 | 15 / 64 / 1 |
| dair | Ace Drop | SPIKE/METEOR | knockdown, spike | dmg 7.6; st 7; kb 0.7,8.6 (mag 8.6); reach 15; active 4, end 11 | 10 / 22 / 0 |
| nspecial | Gadget Rack | PROJECTILE | kill<=100, projectile, stun, trap | dmg 8% | 73 / 322 / 2 |
| uspecial | Overhead Lob | PROJECTILE | projectile, knockdown | dmg 6%, knocks them down; reach long reach | 46 / 134 / 1 |
| dspecial | Swap Gadget | HEAL/RESOURCE | buff |  | 1 / 4 / 0 |
| sidespecial | Rally Roll *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 5.4; st 2; kb 4.6,-3.6 (mag 5.8); reach 42 | - |
| smash | Grand Slam | PROJECTILE | projectile, trap, stun |  | 8 / 42 / 2 |
| finisher | Finisher | FINISHER | projectile | dmg 14% | 11 / 12 / 0 |
| grab | Grab + pummel (Fuzz Rub) | COMMAND GRAB/GRAB | grab, pin | dmg 2.3 pummel; st 4; reach 32 | 4 / 0 / 0 |
| fthrow | Serve! | COMMAND GRAB/GRAB | grab | dmg 7.2; st after grab; kb 7.8,-4.2 (mag 8.9) | n/a / 0 / 0 |
| bthrow | Backcourt Return | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 7.6; st after grab; kb 8.2,-4.8 (mag 9.5) | n/a / 0 / 0 |
| uthrow | Lob | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 5; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 0 / 0 |
| dthrow | Bounce Pass | COMBO STARTER | grab, combo-hitstun | dmg 4.6; st after grab; kb 1.8,-9 (mag 9.2) | n/a / 0 / 0 |
| Final Smash | Ball Machine *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 40; reach 650 | - |

### Gelatin (repeat winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | MULTI-HIT | kill<=100, launch, multihit | dmg 2.8x3; st ~2 (hit on the press; owner notes: frame 2); kb 7; reach 14 | 96 / 512 / 7 |
| ftilt | Syringe Jab *(inactive)* | FAST POKE | - | dmg 4.4; st 4; kb 3.1,-4.3 (mag 5.3); reach 67; active 2, end 6 | - |
| utilt | Fork Toss Up | COMBO STARTER | bleed, combo-hitstun | dmg 4.1; st 4; kb 0.5,-10.5 (mag 10.5); reach 35; active 4, end 7 | 8 / 18 / 1 |
| dtilt | Ankle Jab | COMBO STARTER | combo-hitstun | dmg 3.1; st 3; kb 1.4,-6.9 (mag 7.0); reach 65; active 2, end 6 | 22 / 56 / 0 |
| nair | Wobble Spin | MULTI-HIT | multihit | dmg 2.7/hit; st 3; kb 1.2,-2.6 (mag 2.9); reach 44; active 6, end 6 | 4 / 41 / 0 |
| fair | Syringe Stab | SPACING POKE | - | dmg 5.4; st 5; kb 2.5,-2.8 (mag 3.8); reach 76; active 3, end 8 | 19 / 40 / 0 |
| bair | Jelly Back | FAST POKE | - | dmg 6.9; st 5; kb -7.8,-4.3 (mag 8.9); reach 71; active 3, end 9 | 17 / 28 / 0 |
| uair | Fork Up | COMBO STARTER | combo-hitstun | dmg 4; st 3; kb 0.3,-8.5 (mag 8.5); reach 20; active 3, end 6 | 7 / 18 / 0 |
| dair | Syringe Drop | SPIKE/METEOR | knockdown, spike | dmg 6.5; st 6; kb 0.4,8.6 (mag 8.6); reach 13; active 4, end 11 | 9 / 6 / 0 |
| nspecial | Freeze Syringe | PROJECTILE | projectile, freeze | dmg 6%, freezes them once they are above 40%; reach medium reach | 25 / 126 / 0 |
| uspecial | Fork Toss | PROJECTILE | projectile, bleed | dmg 5%, leaves them bleeding; reach long reach | 40 / 115 / 1 |
| dspecial | Freeze Mine | TRAP/MINE | trap, freeze | dmg 6%, freezes them once they are above 40% | 30 / 30 / 0 |
| sidespecial | Slip Slide *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 4.5; st 2; kb 4.4,-3.6 (mag 5.7); reach 42 | - |
| smash | Ice Breaker | TRAP/MINE | trap, freeze | dmg 18%, freezes them once they are above 40%; st 44 (+charge 24); kb 12; reach 20 | 14 / 42 / 0 |
| finisher | Jelly Legs | FINISHER | projectile, slow | dmg 7% | 21 / 92 / 0 |
| grab | Grab + pummel (Poke) | COMMAND GRAB/GRAB | grab, pin | dmg 1.9 pummel; st 4; reach 28 | 9 / 0 / 0 |
| fthrow | Jelly Toss | COMMAND GRAB/GRAB | grab | dmg 6.2; st after grab; kb 7.4,-4.1 (mag 8.5) | n/a / 6 / 1 |
| bthrow | Shake Off | COMMAND GRAB/GRAB | grab | dmg 6.6; st after grab; kb 7.9,-4.6 (mag 9.1) | n/a / 0 / 0 |
| uthrow | Syringe Lift | COMBO STARTER | grab, combo-hitstun | dmg 4.4; st after grab; kb 0.5,-11.6 (mag 11.6) | n/a / 9 / 0 |
| dthrow | Set Down | COMBO STARTER | grab, combo-hitstun | dmg 4.2; st after grab; kb 1.8,-8.6 (mag 8.8) | n/a / 0 / 0 |
| Final Smash | Jelly Quake *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 38; reach 230 | - |

### Coiny (repeat winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | - | dmg 9; st ~2 (hit on the press; owner notes: frame 2); kb 5; reach 4 | 57 / 464 / 0 |
| ftilt | Quick Slap *(inactive)* | FAST POKE | - | dmg 4.8; st 3; kb 3.4,-4.4 (mag 5.6); reach 67; active 2, end 5 | - |
| utilt | Backhand Rise | COMBO STARTER | combo-hitstun | dmg 4.4; st 4; kb 0.6,-10.6 (mag 10.6); reach 60; active 3, end 7 | 6 / 4 / 0 |
| dtilt | Coin Skid | COMBO STARTER | combo-hitstun | dmg 3.2; st 3; kb 1.5,-7 (mag 7.2); reach 69; active 2, end 6 | 12 / 12 / 0 |
| nair | Slap Spin | MULTI-HIT | multihit | dmg 2.9/hit; st 3; kb 1.3,-2.6 (mag 2.9); reach 44; active 6, end 5 | 3 / 0 / 0 |
| fair | Double Slap | FAST POKE | multihit | dmg 4.8/hit; st 4; kb 3.2,-3 (mag 4.4); reach 71; active 6, end 7 | 12 / 23 / 0 |
| bair | Back Slap | TRUE KILLER | - | dmg 6.8; st 4; kb -8.2,-4.4 (mag 9.3); reach 69; active 3, end 9 | 10 / 0 / 0 |
| uair | Rising Slap | COMBO STARTER | combo-hitstun | dmg 3.9; st 3; kb 0.3,-8.6 (mag 8.6); reach 18; active 3, end 5 | 12 / 16 / 0 |
| dair | Coin Stomp | SPIKE/METEOR | knockdown, spike | dmg 6.4; st 6; kb 0.6,8.4 (mag 8.4); reach 17; active 4, end 10 | 15 / 38 / 0 |
| nspecial | Slap | FAST POKE | - | dmg 9%; reach short reach | 12 / 54 / 1 |
| uspecial | Rising Backhand | COMBO STARTER | stun | dmg 4%, or 8% right up close, stuns; reach short reach | 31 / 44 / 0 |
| dspecial | Counter | COUNTER | counter, bait-friendly |  | 7 / 44 / 1 |
| sidespecial | Slap Rush *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 5.6; st 2; kb 5,-3.4 (mag 6.0); reach 63 | - |
| smash | Slap Cyclone | MOBILITY/DASH ATTACK | mobility, bleed | dmg 23%, leaves them bleeding; kb 8 | 8 / 92 / 2 |
| finisher | Slap Fight Rematch | FINISHER | kill<=100, launch, pin, pull, stun | dmg 2% a slap (the finale: 10%) | 12 / 38 / 2 |
| grab | Grab + pummel (Slap) | COMMAND GRAB/GRAB | grab, pin | dmg 2.8 pummel; st 4; reach 30 | 9 / 0 / 0 |
| fthrow | Slap Shove | COMMAND GRAB/GRAB | grab | dmg 6.8; st after grab; kb 7.6,-4.2 (mag 8.7) | n/a / 0 / 0 |
| bthrow | Over the Shoulder | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 7.2; st after grab; kb 8.2,-4.8 (mag 9.5) | n/a / 0 / 0 |
| uthrow | Coin Toss | COMBO STARTER | grab, combo-hitstun | dmg 4.6; st after grab; kb 0.5,-11.8 (mag 11.8) | n/a / 0 / 0 |
| dthrow | Heads Down | COMBO STARTER | grab, combo-hitstun | dmg 4.4; st after grab; kb 1.8,-8.8 (mag 9.0) | n/a / 4 / 0 |
| Final Smash | The Monitor *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 14; reach 420 | - |

### Snowball (repeat winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | kill<=100 | dmg 8; st ~2 (hit on the press; owner notes: frame 2); kb 9; reach 6 | 76 / 653 / 6 |
| ftilt | Snow Shove *(inactive)* | FAST POKE | - | dmg 7.2; st 6; kb 4.4,-4 (mag 5.9); reach 66; active 3, end 10 | - |
| utilt | Snow Scoop | COMBO STARTER | combo-hitstun | dmg 6; st 6; kb 0.6,-11 (mag 11.0); reach 74; active 3, end 10 | 22 / 117 / 2 |
| dtilt | Drift Under | COMBO STARTER | combo-hitstun | dmg 4.6; st 5; kb 1.7,-7.2 (mag 7.4); reach 81; active 3, end 9 | 12 / 40 / 0 |
| nair | Roll Out | MULTI-HIT | multihit | dmg 3.8/hit; st 4; kb 1.5,-2.8 (mag 3.2); reach 44; active 8, end 7 | 3 / 20 / 0 |
| fair | Snow Slam | FAST POKE | - | dmg 9.6; st 7; kb 3.6,-3 (mag 4.7); reach 88; active 3, end 11 | 23 / 91 / 1 |
| bair | Snow Slump | TRUE KILLER | kill<=100, launch | dmg 10.2; st 7; kb -9,-4.6 (mag 10.1); reach 64; active 3, end 13 | 12 / 21 / 1 |
| uair | Snow Plume | COMBO STARTER | combo-hitstun | dmg 6; st 5; kb 0.4,-8.6 (mag 8.6); reach 24; active 3, end 9 | 9 / 19 / 0 |
| dair | Avalanche | SPIKE/METEOR | knockdown, spike | dmg 9.5; st 9; kb 0.6,7.8 (mag 7.8); reach 56; active 5, end 13 | 7 / 20 / 0 |
| nspecial | Rage Tackle | MOBILITY/DASH ATTACK | mobility, armour | dmg 10; reach medium reach | 46 / 481 / 2 |
| uspecial | Cold Clock | COMBO STARTER | slow | dmg 5; reach short reach | 47 / 168 / 1 |
| dspecial | Dig In | ARMOURED/INVINCIBLE STARTUP | armour |  | 14 / 5 / 0 |
| sidespecial | Snow Roll *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 7; st 3; kb 5.6,-4 (mag 6.9); reach 50 | - |
| smash | Ground Pound | BURST | freeze | dmg 19%, freezes them once they are above 15%; kb 9 | 4 / 57 / 0 |
| finisher | The Snowball Effect | FINISHER | grab, knockdown | dmg 6 | 30 / 108 / 0 |
| grab | Grab + pummel (Pack) | COMMAND GRAB/GRAB | grab, pin | dmg 3.1 pummel; st 4; reach 34 | 13 / 0 / 0 |
| fthrow | Snowball Toss | COMMAND GRAB/GRAB | grab | dmg 8.5; st after grab; kb 8,-4.4 (mag 9.1) | n/a / 18 / 2 |
| bthrow | Roll Off | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 9; st after grab; kb 8.6,-5 (mag 9.9) | n/a / 0 / 0 |
| uthrow | Snow Lift | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 5.5; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 0 / 0 |
| dthrow | Pack Down | COMBO STARTER | grab, combo-hitstun | dmg 6; st after grab; kb 1.8,-9 (mag 9.2) | n/a / 0 / 0 |
| Final Smash | Avalanche *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 30; reach 520 | - |

### Lightning (repeat winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | - | dmg 5; st ~2 (hit on the press; owner notes: frame 2); kb 6; reach 12 | 48 / 310 / 1 |
| ftilt | Spark Jab *(inactive)* | FAST POKE | - | dmg 4.5; st 3; kb 3.1,-4.3 (mag 5.3); reach 70; active 3, end 7 | - |
| utilt | Lightning Rod | COMBO STARTER | combo-hitstun, stun | dmg 4.2; st 4; kb 0.5,-10.6 (mag 10.6); reach 76; active 3, end 8 | 7 / 53 / 0 |
| dtilt | Ground Arc | COMBO STARTER | combo-hitstun | dmg 3.3; st 3; kb 1.6,-7 (mag 7.2); reach 75; active 2, end 6 | 19 / 51 / 0 |
| nair | Static Ring | MULTI-HIT | multihit | dmg 2.6/hit; st 3; kb 1.2,-2.6 (mag 2.9); reach 48; active 7, end 6 | 1 / 10 / 0 |
| fair | Bolt Straight | SPACING POKE | - | dmg 5.7; st 4; kb 2.5,-2.7 (mag 3.7); reach 84; active 3, end 8 | 11 / 62 / 0 |
| bair | Rear Zap | TRUE KILLER | - | dmg 7.1; st 4; kb -8.1,-4.3 (mag 9.2); reach 73; active 3, end 9 | 10 / 7 / 0 |
| uair | Sky Bolt | COMBO STARTER | combo-hitstun | dmg 4.4; st 3; kb 0.3,-8.7 (mag 8.7); reach 80; active 3, end 7 | 7 / 36 / 0 |
| dair | Thunder Drop | SPIKE/METEOR | knockdown, spike | dmg 6.7; st 6; kb 0.4,8.5 (mag 8.5); reach 14; active 3, end 10 | 8 / 13 / 0 |
| nspecial | Chain Bolt | PROJECTILE | projectile, multihit | dmg 8%; reach long reach | 30 / 458 / 2 |
| uspecial | Flash | RECOVERY | invulnerable, mobility, burn | dmg 5%, sets them burning | 24 / 44 / 0 |
| dspecial | Floor Trap | TRAP/MINE | trap | dmg 11% | 17 / 154 / 0 |
| smash | Arc Cascade | MOBILITY/DASH ATTACK | kill<=100, launch, mobility, stun | dmg 20%, stuns, launches far; kb 14 | 6 / 134 / 4 |
| finisher | Pocket Thundercloud | FINISHER | projectile, multihit | dmg 7% a bolt (up to 4) | 31 / 47 / 0 |
| grab | Grab + pummel (Shock) | COMMAND GRAB/GRAB | grab, pin | dmg 1.9 pummel; st 4; reach 28 | 5 / 11 / 0 |
| fthrow | Chain Throw | COMMAND GRAB/GRAB | grab | dmg 6.2; st after grab; kb 7.4,-4.2 (mag 8.5) | n/a / 0 / 0 |
| bthrow | Crossed Wires | COMMAND GRAB/GRAB | grab | dmg 6.6; st after grab; kb 7.9,-4.6 (mag 9.1) | n/a / 0 / 0 |
| uthrow | Jolt Up | COMBO STARTER | grab, combo-hitstun | dmg 4.2; st after grab; kb 0.5,-11.6 (mag 11.6) | n/a / 0 / 0 |
| dthrow | Grounded | COMBO STARTER | grab, combo-hitstun | dmg 4; st after grab; kb 1.8,-8.6 (mag 8.8) | n/a / 4 / 0 |
| Final Smash | The Storm of Goiky *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 14; reach 320 | - |

### Lightbulb (single winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | - | dmg 6; st ~2 (hit on the press; owner notes: frame 2); kb 7; reach 12 | 68 / 407 / 1 |
| ftilt | Static Zap *(inactive)* | FAST POKE | - | dmg 4.8; st 4; kb 3.4,-4.2 (mag 5.4); reach 73; active 2, end 7 | - |
| utilt | Bright Idea | COMBO STARTER | combo-hitstun | dmg 4.2; st 4; kb 0.5,-10.6 (mag 10.6); reach 58; active 3, end 7 | 7 / 29 / 1 |
| dtilt | Cord Trip | COMBO STARTER | combo-hitstun | dmg 3.4; st 3; kb 1.5,-6.8 (mag 7.0); reach 75; active 2, end 7 | 11 / 39 / 0 |
| nair | Lumen Ring | MULTI-HIT | multihit, stun | dmg 2.8/hit; st 3; kb 1.1,-2.5 (mag 2.7); reach 42; active 6, end 6 | 4 / 6 / 0 |
| fair | Arc Jab | SPACING POKE | - | dmg 5.4; st 4; kb 2.4,-2.8 (mag 3.7); reach 79; active 2, end 7 | 12 / 43 / 0 |
| bair | Backfire | FAST POKE | - | dmg 6.6; st 4; kb -7.8,-4 (mag 8.8); reach 66; active 3, end 9 | 16 / 19 / 0 |
| uair | Flicker Up | COMBO STARTER | combo-hitstun | dmg 3.9; st 3; kb 0.3,-8.6 (mag 8.6); reach 13; active 3, end 6 | 8 / 18 / 0 |
| dair | Burn Out | SPIKE/METEOR | knockdown, spike | dmg 6.8; st 6; kb 0.6,8.2 (mag 8.2); reach 16; active 4, end 10 | 5 / 20 / 0 |
| nspecial | Electric Ball | PROJECTILE | projectile, stun, multihit | dmg 8%, stuns; reach medium reach | 41 / 256 / 2 |
| uspecial | Flicker | RECOVERY | invulnerable, stun, projectile | dmg 4%, stuns; reach long reach | 32 / 138 / 0 |
| dspecial | Bright Flash | FREEZE/STUN | scramble |  | 5 / 0 / 0 |
| sidespecial | Short Circuit *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 4.8; st 3; kb 4.4,-3.4 (mag 5.6); reach 46 | - |
| smash | Spotlight | PROJECTILE | debuff, kill<=100, projectile | dmg 20%, marks them to take more; kb 11 | 15 / 258 / 5 |
| finisher | Light-Up Disco Tiles | FINISHER | stun, trap | dmg 6% a tile | 21 / 102 / 0 |
| grab | Grab + pummel (Spark) | COMMAND GRAB/GRAB | grab, pin | dmg 1.9 pummel; st 4; reach 26 | 6 / 12 / 0 |
| fthrow | Shock Toss | COMMAND GRAB/GRAB | grab | dmg 6; st after grab; kb 7,-4 (mag 8.1) | n/a / 0 / 0 |
| bthrow | Pull the Plug | COMMAND GRAB/GRAB | grab | dmg 6.4; st after grab; kb 7.6,-4.4 (mag 8.8) | n/a / 0 / 0 |
| uthrow | Light Show | COMBO STARTER | grab, combo-hitstun | dmg 4.2; st after grab; kb 0.5,-11.5 (mag 11.5) | n/a / 4 / 0 |
| dthrow | Cookie Crumble | COMBO STARTER | grab, combo-hitstun | dmg 4.2; st after grab; kb 1.8,-8.5 (mag 8.7) | n/a / 0 / 0 |
| Final Smash | Bright Flash *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 36; reach 270 | - |

### Money (single winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | - | dmg 7; st ~2 (hit on the press; owner notes: frame 2); kb 7; reach 14 | 47 / 332 / 2 |
| ftilt | Bill Fold Jab *(inactive)* | FAST POKE | - | dmg 5.6; st 4; kb 3.3,-4.3 (mag 5.4); reach 72; active 3, end 8 | - |
| utilt | Paper Cut | COMBO STARTER | bleed, combo-hitstun | dmg 4.5; st 4; kb 0.5,-10.5 (mag 10.5); reach 72; active 3, end 8 | 8 / 18 / 0 |
| dtilt | Coin Flick | COMBO STARTER | combo-hitstun | dmg 3.5; st 3; kb 1.5,-7.1 (mag 7.3); reach 72; active 2, end 7 | 15 / 34 / 0 |
| nair | Bill Fan | MULTI-HIT | multihit | dmg 2.6/hit; st 4; kb 1.2,-2.6 (mag 2.9); reach 50; active 7, end 6 | 3 / 2 / 0 |
| fair | Wad Punch | SPACING POKE | - | dmg 6.2; st 5; kb 2.8,-2.8 (mag 4.0); reach 77; active 3, end 9 | 13 / 49 / 0 |
| bair | Back Pocket | TRUE KILLER | - | dmg 7; st 5; kb -8,-4.4 (mag 9.1); reach 75; active 3, end 10 | 16 / 35 / 0 |
| uair | Raise | COMBO STARTER | combo-hitstun | dmg 4.4; st 4; kb 0.3,-8.7 (mag 8.7); reach 72; active 3, end 7 | 4 / 13 / 1 |
| dair | Foreclosure | SPIKE/METEOR | knockdown, spike | dmg 7.1; st 6; kb 0.5,8.5 (mag 8.5); reach 15; active 4, end 10 | 11 / 14 / 0 |
| nspecial | Make It Rain | BURST | bleed | dmg 6%, leaves them bleeding; st short wind-up; reach short reach | 5 / 17 / 0 |
| uspecial | Drifting Bill | RECOVERY | invulnerable, heal | dmg 5%, heals you 3%; reach short reach | 29 / 45 / 0 |
| dspecial | Bank It | SELF-BUFF | buff, armour |  | 0 / 0 / 0 |
| smash | Jackpot Spread | PROJECTILE | projectile |  | 6 / 303 / 1 |
| finisher | Piggy Bank, Compound Interest | FINISHER | trap | dmg 4% early, up to 12% at full | 18 / 0 / 0 |
| grab | Grab + pummel (Coin Slot) | COMMAND GRAB/GRAB | grab, pin | dmg 2 pummel; st 4; reach 30 | 7 / 0 / 0 |
| fthrow | Cash Out | COMMAND GRAB/GRAB | grab | dmg 6.4; st after grab; kb 7.2,-4.1 (mag 8.3) | n/a / 6 / 0 |
| bthrow | Hostile Takeover | COMMAND GRAB/GRAB | grab | dmg 7; st after grab; kb 7.8,-4.6 (mag 9.1) | n/a / 0 / 0 |
| uthrow | Pay Raise | COMBO STARTER | grab, combo-hitstun | dmg 4.6; st after grab; kb 0.5,-11.8 (mag 11.8) | n/a / 9 / 0 |
| dthrow | Foreclosed | COMBO STARTER | grab, combo-hitstun | dmg 4.4; st after grab; kb 1.8,-8.8 (mag 9.0) | n/a / 0 / 0 |
| Final Smash | Make It Rain *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 36; reach 600 | - |

### Cake (single winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | buff, kill<=100 | dmg 6; st ~2 (hit on the press; owner notes: frame 2); kb 6; reach 6 | 51 / 313 / 2 |
| utilt | Candle Rise | COMBO STARTER | combo-hitstun | dmg 5; st 5; kb 0.5,-10.7 (mag 10.7); reach 72; active 4, end 9 | 16 / 60 / 1 |
| dtilt | Frosting Spread | COMBO STARTER | combo-hitstun, slow | dmg 3.8; st 4; kb 1.6,-7 (mag 7.2); reach 72; active 3, end 8 | 18 / 68 / 1 |
| nair | Layer Spin | MULTI-HIT | multihit | dmg 3/hit; st 5; kb 1.3,-2.7 (mag 3.0); reach 52; active 8, end 7 | 4 / 18 / 0 |
| fair | Fork Thrust | SPACING POKE | - | dmg 7.2; st 6; kb 3.4,-3.1 (mag 4.6); reach 77; active 3, end 10 | 18 / 22 / 0 |
| bair | Crumb Back | TRUE KILLER | kill<=100, launch | dmg 8; st 6; kb -8.6,-4.6 (mag 9.8); reach 75; active 3, end 10 | 12 / 32 / 0 |
| uair | Top Tier | COMBO STARTER | combo-hitstun | dmg 5; st 5; kb 0.4,-8.8 (mag 8.8); reach 72; active 3, end 8 | 9 / 30 / 0 |
| dair | Cake Drop | SPIKE/METEOR | knockdown, spike | dmg 8.1; st 7; kb 0.6,8.8 (mag 8.8); reach 18; active 4, end 12 | 13 / 41 / 0 |
| nspecial | Cake at Stake | PROJECTILE | projectile, heal | dmg 9%, heals you 6% | 42 / 285 / 0 |
| uspecial | ...and Eat It Too | SELF-BUFF | buff, launch | dmg 4% (7% point-blank); reach short reach | 34 / 50 / 0 |
| dspecial | Recover a Slice | HEAL/RESOURCE | heal |  | 13 / 0 / 0 |
| smash | Have Your Cake | PULL | pull, drain | dmg 18%, drains them; kb 8 | 8 / 46 / 0 |
| finisher | Wheel Out the Cake Tosser | FINISHER | projectile, heal, trap | dmg 5% a slice | 27 / 45 / 0 |
| grab | Grab + pummel (Frosting Smear) | COMMAND GRAB/GRAB | grab, pin | dmg 2.3 pummel; st 4; reach 30 | 7 / 0 / 0 |
| fthrow | Serve Up | COMMAND GRAB/GRAB | grab | dmg 7.2; st after grab; kb 7.5,-4.2 (mag 8.6) | n/a / 0 / 0 |
| bthrow | Second Helping | COMMAND GRAB/GRAB | grab | dmg 7.7; st after grab; kb 8,-4.7 (mag 9.3) | n/a / 8 / 1 |
| uthrow | Candle Blow | COMBO STARTER | grab, combo-hitstun | dmg 5; st after grab; kb 0.5,-11.9 (mag 11.9) | n/a / 10 / 0 |
| dthrow | Face Plant | COMBO STARTER | grab, combo-hitstun | dmg 4.8; st after grab; kb 1.8,-8.9 (mag 9.1) | n/a / 0 / 0 |
| Final Smash | The Ceremony *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 14; reach 520 | - |

### Tapey (single winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | kill<=100 | dmg 7.5; st ~2 (hit on the press; owner notes: frame 2); kb 9; reach 4 | 27 / 202 / 2 |
| ftilt | Tape Strip *(inactive)* | SPACING POKE | - | dmg 6; st 5; kb 3.8,-4 (mag 5.5); reach 78; active 3, end 9 | - |
| utilt | Rewind Up | COMBO STARTER | combo-hitstun | dmg 5; st 5; kb 0.5,-10.8 (mag 10.8); reach 64; active 4, end 9 | 3 / 5 / 0 |
| dtilt | Eject Kick | COMBO STARTER | combo-hitstun | dmg 4.7; st 4; kb 1.6,-7.2 (mag 7.4); reach 76; active 3, end 9 | 2 / 5 / 0 |
| nair | Reel Spin | MULTI-HIT | multihit | dmg 3.7/hit; st 5; kb 1.4,-2.7 (mag 3.0); reach 50; active 6, end 8 | 5 / 15 / 0 |
| fair | Record Button | SPACING POKE | - | dmg 7.2; st 6; kb 3.2,-3 (mag 4.4); reach 82; active 3, end 9 | 9 / 22 / 0 |
| bair | Play It Back | TRUE KILLER | kill<=100, launch | dmg 8.5; st 6; kb -8.6,-4.4 (mag 9.7); reach 77; active 3, end 10 | 11 / 8 / 0 |
| uair | Tape Whip Up | COMBO STARTER | combo-hitstun | dmg 4.8; st 4; kb 0.4,-8.8 (mag 8.8); reach 13; active 3, end 8 | 5 / 10 / 0 |
| dair | Stop Button | SPIKE/METEOR | knockdown, spike | dmg 8.6; st 8; kb 0.7,9 (mag 9.0); reach 20; active 4, end 12 | 7 / 0 / 0 |
| nspecial | Playback | PROJECTILE | projectile | dmg the taped damage, up to 14%; 3% with nothing on tape; reach long reach | 27 / 48 / 0 |
| uspecial | Leap of Faith | RECOVERY | mobility, knockdown | dmg 8%, knocks them down; reach short reach | 16 / 32 / 0 |
| dspecial | Record | HEAL/RESOURCE | buff |  | 0 / 0 / 0 |
| sidespecial | Fast Forward *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 5.2; st 3; kb 5.6,-3.6 (mag 6.7); reach 63 | - |
| smash | Solo Track | PROJECTILE | kill<=100, projectile, stun | dmg 20%, stuns; kb 11 | 17 / 400 / 8 |
| finisher | Rewind Them Two Seconds | FINISHER | pull, stun | dmg 8%; stunned 0 | 21 / 88 / 0 |
| grab | Grab + pummel (Static) | COMMAND GRAB/GRAB | grab, pin | dmg 2.5 pummel; st 4; reach 30 | 3 / 0 / 0 |
| fthrow | Playback | COMMAND GRAB/GRAB | grab | dmg 7.8; st after grab; kb 7.8,-4.2 (mag 8.9) | n/a / 8 / 0 |
| bthrow | Rewind | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 8.2; st after grab; kb 8.4,-4.8 (mag 9.7) | n/a / 0 / 0 |
| uthrow | Eject | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 5.2; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 5 / 0 |
| dthrow | Record Over | COMBO STARTER | grab, combo-hitstun | dmg 5.6; st after grab; kb 1.8,-9 (mag 9.2) | n/a / 6 / 0 |
| Final Smash | Playback *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 34; reach 700 | - |

### Magnet (single winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | kill<=100 | dmg 8.5; st ~2 (hit on the press; owner notes: frame 2); kb 9.5; reach 3 | 57 / 649 / 11 |
| ftilt | Pole Push *(inactive)* | SPACING POKE | - | dmg 6.2; st 5; kb 4.4,-3.8 (mag 5.8); reach 78; active 3, end 9 | - |
| utilt | North Pole | COMBO STARTER | combo-hitstun, kill<=100 | dmg 5.2; st 5; kb 0.5,-10.6 (mag 10.6); reach 64; active 4, end 9 | 14 / 52 / 1 |
| dtilt | Drag In | COMBO STARTER | combo-hitstun | dmg 4.4; st 5; kb -2.4,-6.6 (mag 7.0); reach 78; active 3, end 8 | 16 / 64 / 1 |
| nair | Magnetic Field | MULTI-HIT | multihit | dmg 4.1/hit; st 5; kb 1.4,-2.7 (mag 3.0); reach 54; active 6, end 8 | 4 / 8 / 0 |
| fair | South Pole Slug | SPACING POKE | - | dmg 9.4; st 6; kb 4.4,-3.4 (mag 5.6); reach 79; active 3, end 10 | 13 / 40 / 0 |
| bair | Repel | TRUE KILLER | kill<=100, launch | dmg 11.2; st 6; kb -10.6,-4.8 (mag 11.6); reach 72; active 3, end 10 | 19 / 107 / 0 |
| uair | Pole Up | COMBO STARTER | combo-hitstun | dmg 6.7; st 4; kb 0.4,-9 (mag 9.0); reach 15; active 3, end 8 | 12 / 26 / 0 |
| dair | Magnetic Slam | SPIKE/METEOR | knockdown, spike | dmg 10.2; st 8; kb 0.7,9.4 (mag 9.4); reach 21; active 4, end 12 | 6 / 0 / 0 |
| nspecial | C'mon, Bestie! | PULL | kill<=100, pull | dmg 12%; reach medium reach | 51 / 108 / 1 |
| uspecial | Climbing Gear | SELF-BUFF | buff, stun, mobility | dmg 7%, stuns them; reach short reach | 40 / 113 / 2 |
| dspecial | Like Poles Repel | BURST | shove | dmg 7%; st short wind-up; reach short reach | 9 / 63 / 1 |
| sidespecial | Pole Position *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 8.2; st 3; kb 6.4,-4 (mag 7.5); reach 72 | - |
| smash | By Popular Demand | PULL | kill<=100, pull, stun | dmg 20%, stuns; kb 11 | 7 / 80 / 2 |
| finisher | Stuck Together Like Fridge Magnets | FINISHER | pull, pin, stun | dmg 4%, then 6% to each when they clash; stunned 0 | 40 / 184 / 0 |
| grab | Grab + pummel (Static Pinch) | COMMAND GRAB/GRAB | grab, pin | dmg 2.5 pummel; st 4; reach 30 | 2 / 0 / 0 |
| fthrow | Bestie Toss | COMMAND GRAB/GRAB | grab | dmg 7.4; st after grab; kb 7.6,-4.2 (mag 8.7) | n/a / 7 / 0 |
| bthrow | Like Poles Repel | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 7.8; st after grab; kb 8.2,-4.8 (mag 9.5) | n/a / 0 / 0 |
| uthrow | Climbing Gear | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 5; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 5 / 0 |
| dthrow | Attract Down | COMBO STARTER | grab, combo-hitstun | dmg 5.4; st after grab; kb 1.8,-9 (mag 9.2) | n/a / 0 / 0 |
| Final Smash | Like Poles Repel *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 28; reach 310 | - |

### Blueberry (single winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | kill<=100 | dmg 5; st ~2 (hit on the press; owner notes: frame 2); kb 7; reach 0 | 62 / 511 / 7 |
| ftilt | Mighty Shove *(inactive)* | SPACING POKE | - | dmg 6.8; st 6; kb 4.4,-4 (mag 5.9); reach 82; active 3, end 9 | - |
| utilt | Overhead Heave | COMBO STARTER | combo-hitstun | dmg 6; st 6; kb 0.5,-11.2 (mag 11.2); reach 68; active 4, end 10 | 11 / 37 / 1 |
| dtilt | Berry Kick | COMBO STARTER | combo-hitstun | dmg 4.8; st 5; kb 1.7,-7.2 (mag 7.4); reach 77; active 3, end 9 | 14 / 45 / 0 |
| nair | Palanquin Swing | MULTI-HIT | multihit | dmg 4.2/hit; st 6; kb 1.6,-2.8 (mag 3.2); reach 56; active 6, end 9 | 3 / 0 / 0 |
| fair | Bake-Off Haymaker | FAST POKE | - | dmg 9.4; st 7; kb 3.6,-3 (mag 4.7); reach 85; active 3, end 11 | 18 / 29 / 0 |
| bair | Elbow Back | TRUE KILLER | kill<=100, launch | dmg 9.4; st 6; kb -9,-4.4 (mag 10.0); reach 76; active 3, end 11 | 12 / 59 / 1 |
| uair | Super Strength | COMBO STARTER | combo-hitstun | dmg 6.2; st 5; kb 0.4,-9.2 (mag 9.2); reach 64; active 3, end 10 | 10 / 32 / 0 |
| dair | Dropped on Silver | SPIKE/METEOR | knockdown, spike | dmg 10.8; st 9; kb 0.8,9.6 (mag 9.6); reach 24; active 4, end 13 | 17 / 86 / 0 |
| nspecial | Palanquin Catch | COMMAND GRAB/GRAB | grab, knockdown | dmg 10; reach short reach | 18 / 138 / 1 |
| uspecial | Overhead Press | SELF-BUFF | buff, armour, knockdown | dmg 9; reach short reach | 38 / 84 / 1 |
| dspecial | Play Dead | ARMOURED/INVINCIBLE STARTUP | invulnerable, buff |  | 0 / 0 / 0 |
| sidespecial | Palanquin Charge *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 6.6; st 4; kb 5.2,-4 (mag 6.6); reach 74 | - |
| smash | Oatmeal Raisin | TRAP/MINE | trap, burn | dmg 23%, sets them burning; st 40 (+charge 24); kb 12; reach 22 | 5 / 72 / 1 |
| finisher | Big Rock, Little Effort | FINISHER | projectile, trap, knockdown | dmg 12 | 12 / 87 / 0 |
| grab | Grab + pummel (Squeeze) | COMMAND GRAB/GRAB | grab, pin | dmg 3.1 pummel; st 4; reach 32 | 7 / 0 / 0 |
| fthrow | Catch and Throw | COMMAND GRAB/GRAB | grab, kill<=100 | dmg 8.6; st after grab; kb 8.2,-4.4 (mag 9.3) | n/a / 18 / 1 |
| bthrow | Drop on Silver | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 9; st after grab; kb 8.6,-5 (mag 9.9) | n/a / 0 / 0 |
| uthrow | Overhead Press | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 5.6; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 0 / 0 |
| dthrow | Slam Down | COMBO STARTER | grab, combo-hitstun | dmg 6.2; st after grab; kb 1.8,-9 (mag 9.2) | n/a / 6 / 0 |
| Final Smash | Palanquin Catch *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 40; reach 320 | - |

### Rose (single winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | kill<=100 | dmg 9; st ~2 (hit on the press; owner notes: frame 2); kb 9; reach 14 | 86 / 761 / 9 |
| ftilt | Thorn Prick *(inactive)* | SPACING POKE | - | dmg 5.9; st 4; kb 3.4,-4.2 (mag 5.4); reach 77; active 3, end 8 | - |
| utilt | Petal Rise | COMBO STARTER | combo-hitstun | dmg 4.8; st 4; kb 0.5,-10.7 (mag 10.7); reach 74; active 4, end 8 | 6 / 10 / 0 |
| dtilt | Creeping Root | COMBO STARTER | combo-hitstun, knockdown | dmg 3.6; st 4; kb 1.5,-7 (mag 7.2); reach 73; active 2, end 7 | 17 / 47 / 0 |
| nair | Petal Storm | MULTI-HIT | multihit | dmg 2.6/hit; st 4; kb 1.2,-2.6 (mag 2.9); reach 50; active 7, end 7 | 5 / 13 / 0 |
| fair | Stem Lash | SPACING POKE | - | dmg 6.1; st 5; kb 3,-3.4 (mag 4.5); reach 86; active 3, end 10 | 21 / 28 / 0 |
| bair | Barbed Back | TRUE KILLER | - | dmg 7.4; st 5; kb -8.2,-4.5 (mag 9.4); reach 74; active 3, end 10 | 28 / 74 / 1 |
| uair | Bloom Up | COMBO STARTER | combo-hitstun | dmg 4.3; st 4; kb 0.3,-8.7 (mag 8.7); reach 76; active 3, end 7 | 3 / 0 / 0 |
| dair | Thorn Drop | SPIKE/METEOR | bleed, knockdown, spike | dmg 7.3; st 6; kb 0.5,8.5 (mag 8.5); reach 12; active 4, end 10 | 4 / 0 / 0 |
| nspecial | Thorn Lash | PULL | pull, projectile | dmg 7%; reach long reach | 61 / 336 / 0 |
| uspecial | Rising Lash | PIN/HOLD | pin, pull | dmg 7% (4% up close), roots them in place; reach short reach | 27 / 47 / 0 |
| dspecial | Counter | COUNTER | counter, bait-friendly |  | 8 / 12 / 1 |
| smash | Bramble Drag | PULL | pull, bleed | dmg 23%, leaves them bleeding; kb 7 | 13 / 115 / 1 |
| finisher | Shh! Vow of Silence | FINISHER | silence, launch | dmg 8%, silenced 3 s | 34 / 160 / 2 |
| grab | Grab + pummel (Prick) | COMMAND GRAB/GRAB | grab, pin | dmg 2.2 pummel; st 4; reach 34 | 5 / 0 / 0 |
| fthrow | Bouquet Toss | COMMAND GRAB/GRAB | grab | dmg 6.8; st after grab; kb 7.4,-4.2 (mag 8.5) | n/a / 0 / 0 |
| bthrow | Thorny Turn | COMMAND GRAB/GRAB | grab | dmg 7.3; st after grab; kb 8,-4.7 (mag 9.3) | n/a / 0 / 0 |
| uthrow | Petals Up | COMBO STARTER | grab, combo-hitstun | dmg 4.7; st after grab; kb 0.5,-11.9 (mag 11.9) | n/a / 5 / 0 |
| dthrow | Pressed Flower | COMBO STARTER | grab, combo-hitstun | dmg 4.5; st after grab; kb 1.8,-8.9 (mag 9.1) | n/a / 0 / 0 |
| Final Smash | Thorn Lash *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 36; reach 460 | - |

### Bomb (single winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | - | dmg 8; st ~2 (hit on the press; owner notes: frame 2); kb 8; reach 10 | 51 / 364 / 1 |
| ftilt | Shoulder Bump *(inactive)* | SPACING POKE | - | dmg 7; st 5; kb 4.2,-4 (mag 5.8); reach 77; active 3, end 9 | - |
| utilt | Fuse Flare | COMBO STARTER | combo-hitstun | dmg 5.2; st 5; kb 0.5,-10.8 (mag 10.8); reach 70; active 4, end 9 | 7 / 36 / 2 |
| dtilt | Sizzling Heel | PULL | combo-hitstun, pull | dmg 4.8; st 4; kb 1.8,-7.2 (mag 7.4); reach 76; active 3, end 8 | 13 / 35 / 0 |
| nair | Tick Tock | MULTI-HIT | multihit | dmg 3.8/hit; st 6; kb 1.4,-2.8 (mag 3.1); reach 50; active 6, end 9 | 5 / 4 / 0 |
| fair | Fuse Kick | SPACING POKE | - | dmg 8.2; st 6; kb 3.4,-3 (mag 4.5); reach 79; active 3, end 10 | 16 / 8 / 0 |
| bair | Rear Pop | TRUE KILLER | kill<=100, launch | dmg 9; st 6; kb -8.8,-4.6 (mag 9.9); reach 72; active 3, end 11 | 16 / 28 / 0 |
| uair | Skyrocket | COMBO STARTER | combo-hitstun | dmg 5.4; st 4; kb 0.4,-9 (mag 9.0); reach 21; active 3, end 8 | 3 / 0 / 0 |
| dair | Dive Bomb | SPIKE/METEOR | knockdown, spike | dmg 9.6; st 9; kb 0.8,9.4 (mag 9.4); reach 26; active 4, end 13 | 8 / 10 / 0 |
| nspecial | Collision | MOBILITY/DASH ATTACK | invulnerable, kill<=100, mobility | dmg 18 | 30 / 514 / 11 |
| uspecial | Dizzy Spin | MULTI-HIT | armour, kill<=100, multihit | dmg 4 hits of 4; reach short reach | 29 / 210 / 2 |
| dspecial | Stay Back! | BURST | shove |  | 0 / 0 / 0 |
| sidespecial | Fuse Hop *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 6.4x2; st 3; kb 3.4,-5 (mag 6.0); reach 54 | - |
| smash | Big Kaboom | BURST | kill<=100, launch, stun | dmg 30%, stuns; kb 13 | 4 / 121 / 2 |
| finisher | Tick-Tock Timer Bomb | FINISHER | kill<=100, trap | dmg 14 | 13 / 81 / 2 |
| grab | Grab + pummel (Tick) | COMMAND GRAB/GRAB | grab, pin | dmg 2.5 pummel; st 4; reach 30 | 4 / 0 / 0 |
| fthrow | Lob and Boom | COMMAND GRAB/GRAB | grab | dmg 8.2; st after grab; kb 8,-4.4 (mag 9.1) | n/a / 0 / 0 |
| bthrow | Fuse Flip | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 8.6; st after grab; kb 8.4,-5 (mag 9.8) | n/a / 9 / 0 |
| uthrow | Spark Toss | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 5.4; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 0 / 0 |
| dthrow | Pop Under | COMBO STARTER | grab, combo-hitstun | dmg 5.8; st after grab; kb 1.8,-9 (mag 9.2) | n/a / 0 / 0 |
| Final Smash | Literally *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 36; reach 180 | - |

### Barf Bag (single winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | MULTI-HIT | kill<=100, multihit | dmg 5.2x2; st ~2 (hit on the press; owner notes: frame 2); kb 9; reach 14 | 108 / 815 / 5 |
| ftilt | Quick Heave *(inactive)* | SPACING POKE | - | dmg 5.5; st 4; kb 3.1,-4.2 (mag 5.2); reach 75; active 3, end 8 | - |
| utilt | Sick Spray Up | COMBO STARTER | combo-hitstun, scramble | dmg 4.4; st 5; kb 0.5,-10.5 (mag 10.5); reach 70; active 3, end 9 | 18 / 64 / 2 |
| dtilt | Puddle Flick | COMBO STARTER | combo-hitstun, poison | dmg 3.7; st 4; kb 1.5,-7 (mag 7.2); reach 74; active 2, end 8 | 18 / 62 / 1 |
| nair | Heave Spin | MULTI-HIT | multihit | dmg 2.8/hit; st 4; kb 1.2,-2.7 (mag 3.0); reach 50; active 7, end 7 | 5 / 6 / 0 |
| fair | Bag Flap | SPACING POKE | - | dmg 6; st 5; kb 2.6,-2.8 (mag 3.8); reach 75; active 3, end 10 | 16 / 39 / 0 |
| bair | Back Splash | TRUE KILLER | - | dmg 7.6; st 5; kb -8.1,-4.4 (mag 9.2); reach 76; active 3, end 11 | 28 / 36 / 0 |
| uair | Geyser | COMBO STARTER | combo-hitstun | dmg 4.6; st 4; kb 0.3,-8.6 (mag 8.6); reach 74; active 3, end 8 | 13 / 37 / 3 |
| dair | Downpour | SPIKE/METEOR | knockdown, spike | dmg 7.3; st 7; kb 0.5,8.5 (mag 8.5); reach 20; active 4, end 11 | 14 / 10 / 0 |
| nspecial | Outbreak | FREEZE/STUN | control-steal, bait-friendly | dmg no damage; they copy her moves and fight on her side for about 2 seconds; st short wind-up; reach short reach | 13 / 5 / 0 |
| uspecial | Sick Spray | FREEZE/STUN | scramble | dmg 4%, scrambles their controls; reach short reach | 36 / 38 / 0 |
| dspecial | Poison Puddle | ZONING WALL | trap, poison | dmg 2% over and over, poisons | 48 / 111 / 0 |
| sidespecial | Slosh *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 4.8; st 3; kb 4.4,-3.8 (mag 5.8); reach 68 | - |
| smash | Acid Reflux | BURST | poison | dmg 18%, poisons; kb 10.5 | 13 / 99 / 1 |
| finisher | Somebody Refill Me! | FINISHER | heal, poison | dmg the rest of their poison | 23 / 114 / 0 |
| grab | Grab + pummel (Retch) | COMMAND GRAB/GRAB | grab, pin | dmg 2.3 pummel; st 4; reach 30 | 12 / 0 / 0 |
| fthrow | Bag Toss | COMMAND GRAB/GRAB | grab | dmg 7; st after grab; kb 7.6,-4.2 (mag 8.7) | n/a / 7 / 0 |
| bthrow | Over the Rim | COMMAND GRAB/GRAB | grab | dmg 7.4; st after grab; kb 8.1,-4.7 (mag 9.4) | n/a / 22 / 0 |
| uthrow | Heave Up | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 4.9; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 5 / 0 |
| dthrow | Spill | COMBO STARTER | grab, combo-hitstun | dmg 4.7; st after grab; kb 1.8,-9 (mag 9.2) | n/a / 5 / 0 |
| Final Smash | Outbreak *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 14; reach 240 | - |

### Golf Ball (single winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | curse | dmg 5; st ~2 (hit on the press; owner notes: frame 2); kb 5; reach 13 | 50 / 260 / 0 |
| ftilt | Putt *(inactive)* | FAST POKE | curse | dmg 5.6; st 6; kb 3.8,-4 (mag 5.5); reach 71; active 3, end 9 | - |
| utilt | Chip Up | COMBO STARTER | combo-hitstun | dmg 5; st 5; kb 0.6,-10.5 (mag 10.5); reach 38; active 3, end 9 | 3 / 5 / 0 |
| dtilt | Dimple Roll | COMBO STARTER | combo-hitstun | dmg 3.8; st 4; kb 1.6,-7.2 (mag 7.4); reach 72; active 2, end 8 | 5 / 14 / 0 |
| nair | Dimple Spin | MULTI-HIT | curse, multihit | dmg 3.4/hit; st 5; kb 1.4,-2.6 (mag 3.0); reach 46; active 6, end 7 | 2 / 0 / 0 |
| fair | Drive | FAST POKE | - | dmg 8; st 7; kb 3.6,-3 (mag 4.7); reach 79; active 3, end 10 | 10 / 43 / 1 |
| bair | Slice | TRUE KILLER | kill<=100, launch | dmg 8.8; st 6; kb -8.6,-4.4 (mag 9.7); reach 74; active 3, end 11 | 9 / 35 / 1 |
| uair | Lob Wedge | COMBO STARTER | combo-hitstun | dmg 4.8; st 5; kb 0.4,-8.8 (mag 8.8); reach 20; active 3, end 8 | 6 / 32 / 0 |
| dair | Hole in One | SPIKE/METEOR | knockdown, spike | dmg 7.2; st 8; kb 0.7,9 (mag 9.0); reach 19; active 4, end 12 | 4 / 0 / 0 |
| nspecial | Zap Shooter | PROJECTILE | kill<=100, projectile, stun | dmg 9%, stuns | 28 / 241 / 4 |
| uspecial | Water Hazard | SPIKE/METEOR | spike, trap, curse | dmg 8%, curses them; reach short reach | 26 / 57 / 1 |
| dspecial | Announcer Crusher | COUNTER | counter, armour |  | 7 / 21 / 1 |
| sidespecial | Fairway Roll *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 6; st 3; kb 5,-4 (mag 6.4); reach 48 | - |
| smash | Presence | SELF-BUFF | buff, curse |  | 11 / 0 / 0 |
| finisher | Sand Wedge Blast | FINISHER | slow, curse | dmg 9%, they sink for 2 s (slowed, short jumps) and are cursed twice | 21 / 125 / 3 |
| grab | Grab + pummel (Tap) | COMMAND GRAB/GRAB | grab, pin | dmg 2.8 pummel; st 4; reach 32 | 2 / 0 / 0 |
| fthrow | Tee Off | COMMAND GRAB/GRAB | grab | dmg 7.6; st after grab; kb 7.8,-4.2 (mag 8.9) | n/a / 0 / 0 |
| bthrow | Backspin | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 8; st after grab; kb 8.4,-4.8 (mag 9.7) | n/a / 0 / 0 |
| uthrow | Pop Fly | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 5; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 0 / 0 |
| dthrow | Divot | COMBO STARTER | grab, combo-hitstun | dmg 5.2; st after grab; kb 1.8,-9 (mag 9.2) | n/a / 0 / 0 |
| Final Smash | Freeze Juice *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 36; reach 520 | - |

### David (single winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | kill<=100 | dmg 5; st ~2 (hit on the press; owner notes: frame 2); kb 5; reach 4 | 65 / 549 / 4 |
| ftilt | Big Jab *(inactive)* | SPACING POKE | - | dmg 8.3; st 5; kb 4.8,-4 (mag 6.2); reach 80; active 3, end 9 | - |
| utilt | Hands Up | COMBO STARTER | combo-hitstun | dmg 7.1; st 5; kb 0.5,-11.2 (mag 11.2); reach 68; active 4, end 9 | 9 / 71 / 0 |
| dtilt | Foot Stomp | COMBO STARTER | combo-hitstun | dmg 6.2; st 5; kb 1.7,-7.2 (mag 7.4); reach 78; active 2, end 8 | 17 / 74 / 0 |
| nair | Seriously Spin | MULTI-HIT | multihit | dmg 4.7/hit; st 5; kb 1.6,-2.8 (mag 3.2); reach 54; active 7, end 8 | 5 / 38 / 0 |
| fair | Fed Up Punch | SPACING POKE | - | dmg 11.7; st 6; kb 4.7,-3.2 (mag 5.7); reach 84; active 3, end 10 | 12 / 23 / 0 |
| bair | Fed-Up Elbow | TRUE KILLER | kill<=100, launch | dmg 12.3; st 6; kb -10.2,-4.8 (mag 11.3); reach 77; active 3, end 10 | 13 / 62 / 1 |
| uair | Jumpscare Up | COMBO STARTER | combo-hitstun | dmg 7.3; st 4; kb 0.4,-9 (mag 9.0); reach 21; active 4, end 8 | 6 / 7 / 0 |
| dair | Ground Pound | SPIKE/METEOR | knockdown, spike | dmg 13.3; st 8; kb 0.9,10.2 (mag 10.2); reach 26; active 5, end 12 | 10 / 40 / 0 |
| nspecial | Aw Seriously | BURST | shove | dmg 11% up close, less farther out; reach medium reach | 15 / 254 / 2 |
| uspecial | Jumpscare | SELF-BUFF | buff, debuff | dmg 5%, weakens their hits; reach short reach | 57 / 85 / 0 |
| dspecial | Big Armor | ARMOURED/INVINCIBLE STARTUP | armour |  | 10 / 0 / 0 |
| sidespecial | Stomp Along *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 8.8; st 2; kb 6,-4.2 (mag 7.3); reach 71 | - |
| smash | Aw Come On | READ KILLER | kill<=100, stun | dmg 27%, stuns; kb 13.5 | 3 / 27 / 1 |
| finisher | Aw, Seriously? Shoulder Toss | FINISHER | grab, launch | dmg 10% | 55 / 290 / 3 |
| grab | Grab + pummel (Flick) | COMMAND GRAB/GRAB | grab, pin | dmg 3.1 pummel; st 4; reach 34 | 5 / 0 / 0 |
| fthrow | Aw, Seriously | COMMAND GRAB/GRAB | grab | dmg 8.4; st after grab; kb 8,-4.4 (mag 9.1) | n/a / 8 / 0 |
| bthrow | Fed Up | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 8.9; st after grab; kb 8.6,-5 (mag 9.9) | n/a / 0 / 0 |
| uthrow | Big Lift | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 5.6; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 0 / 0 |
| dthrow | Sit On | COMBO STARTER | grab, combo-hitstun | dmg 6.1; st after grab; kb 1.8,-9 (mag 9.2) | n/a / 6 / 0 |
| Final Smash | Aw, Seriously! *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 38; reach 260 | - |

### Lollipop (single winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | - | dmg 9; st ~2 (hit on the press; owner notes: frame 2); kb 8; reach 16 | 80 / 621 / 3 |
| ftilt | Stick Jab *(inactive)* | SPACING POKE | - | dmg 6.4; st 4; kb 3.5,-4.2 (mag 5.5); reach 76; active 3, end 8 | - |
| utilt | Candy Twirl Up | COMBO STARTER | combo-hitstun, scramble | dmg 4.5; st 5; kb 0.5,-10.7 (mag 10.7); reach 66; active 3, end 9 | 12 / 50 / 1 |
| dtilt | Sticky Trip | PULL | combo-hitstun, pin, pull | dmg 4.2; st 4; kb 1.5,-7 (mag 7.2); reach 77; active 2, end 8 | 23 / 80 / 0 |
| nair | Lick Spin | MULTI-HIT | multihit | dmg 2.9/hit; st 4; kb 1.2,-2.6 (mag 2.9); reach 50; active 7, end 7 | 5 / 6 / 0 |
| fair | Candy Whack | SPACING POKE | - | dmg 7.2; st 5; kb 2.9,-2.8 (mag 4.0); reach 75; active 3, end 9 | 25 / 36 / 0 |
| bair | Stick Back | TRUE KILLER | kill<=100, launch | dmg 8.6; st 5; kb -8.7,-4.4 (mag 9.7); reach 75; active 3, end 10 | 23 / 47 / 0 |
| uair | Sweet Spot | COMBO STARTER | combo-hitstun | dmg 6x2; st 4; kb 0.4,-9 (mag 9.0); reach 16; active 3, end 7 | 15 / 37 / 0 |
| dair | Candy Drop | SPIKE/METEOR | knockdown, pin, spike | dmg 8; st 7; kb 0.4,6.2 (mag 6.2); reach 15; active 4, end 11 | 7 / 8 / 0 |
| nspecial | Sticky Sucker | PROJECTILE | projectile, pin | dmg 5%, roots them in place; reach very long reach | 45 / 176 / 0 |
| uspecial | Candy Twirl | MULTI-HIT | multihit, scramble | dmg 3 hits of 4%, scrambles their controls; reach short reach | 55 / 243 / 1 |
| dspecial | Rooting Trap | TRAP/MINE | trap, pin, bait-friendly | dmg 6%, roots them in place | 34 / 108 / 0 |
| sidespecial | Sticky Skate *(inactive)* | MOBILITY/DASH ATTACK | pin | dmg 5.6; st 2; kb 4.5,-3.8 (mag 5.9); reach 66 | - |
| smash | Stuck On You | TRAP/MINE | trap, pin | dmg 21%, roots them in place; st 40 (+charge 24); kb 9; reach 16 | 8 / 21 / 0 |
| finisher | Sugar Rush Flurry | FINISHER | multihit, mobility, launch | dmg 5 hits of 3% (the last launches) | 22 / 117 / 4 |
| grab | Grab + pummel (Lick) | COMMAND GRAB/GRAB | grab, pin | dmg 2.5 pummel; st 4; reach 32 | 4 / 0 / 0 |
| fthrow | Sticky Toss | COMMAND GRAB/GRAB | grab | dmg 7.2; st after grab; kb 7.8,-4.2 (mag 8.9) | n/a / 7 / 0 |
| bthrow | Stick Swing | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 7.6; st after grab; kb 8.4,-4.8 (mag 9.7) | n/a / 0 / 0 |
| uthrow | Sucker Punch Up | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 5; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 0 / 0 |
| dthrow | Stuck to the Floor | COMBO STARTER | grab, combo-hitstun | dmg 4.8; st after grab; kb 1.8,-8.8 (mag 9.0) | n/a / 0 / 0 |
| Final Smash | Sticky Trap *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 34; reach 270 | - |

### Leafy (single winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | - | dmg 3; st ~2 (hit on the press; owner notes: frame 2); kb 4; reach -2 | 67 / 230 / 0 |
| ftilt | Quick Kick *(inactive)* | FAST POKE | - | dmg 3.5; st 3; kb 3.2,-4.4 (mag 5.4); reach 68; active 2, end 5 | - |
| utilt | Leaf Whip | COMBO STARTER | combo-hitstun | dmg 3.5; st 3; kb 0.5,-10.5 (mag 10.5); reach 60; active 2, end 6 | 18 / 30 / 2 |
| dtilt | Slide Kick | COMBO STARTER | combo-hitstun | dmg 3; st 3; kb 1.6,-7 (mag 7.2); reach 71; active 2, end 5 | 22 / 41 / 1 |
| nair | Leaf Spin | MULTI-HIT | multihit | dmg 3/hit; st 3; kb 1.4,-2.6 (mag 3.0); reach 42; active 4, end 5 | 7 / 12 / 0 |
| fair | Flying Punch | FAST POKE | - | dmg 5; st 4; kb 2.2,-2.8 (mag 3.6); reach 71; active 2, end 6 | 18 / 25 / 0 |
| bair | Back Kick | FAST POKE | - | dmg 6; st 4; kb -7.6,-4 (mag 8.6); reach 69; active 3, end 9 | 12 / 12 / 1 |
| uair | Up Kick | COMBO STARTER | combo-hitstun | dmg 3.5; st 3; kb 0.3,-8.5 (mag 8.5); reach 18; active 2, end 5 | 12 / 10 / 0 |
| dair | Heel Drop | SPIKE/METEOR | kill<=100, knockdown, spike | dmg 5.5; st 6; kb 0.6,8 (mag 8.0); reach 17; active 4, end 10 | 12 / 15 / 1 |
| nspecial | BFDIA Sprint | MOBILITY/DASH ATTACK | invulnerable, kill<=100, mobility | dmg 10%; reach long reach | 47 / 390 / 3 |
| uspecial | Sprint Up | RECOVERY | invulnerable, kill<=100, mobility |  | 25 / 60 / 1 |
| dspecial | Kindness Parry | COUNTER | counter |  | 9 / 37 / 1 |
| smash | Shadow Blitz | MOBILITY/DASH ATTACK | kill<=100, knockdown, launch, mobility | dmg 18%, knocks them down, launches far; kb 13 | 5 / 144 / 6 |
| finisher | Leaf Whirl Slipstream | FINISHER | multihit, launch | dmg 4 hits of 2% | 6 / 30 / 0 |
| grab | Grab + pummel (Chart Flick) | COMMAND GRAB/GRAB | grab, pin | dmg 1.6 pummel; st 4; reach 30 | 6 / 0 / 0 |
| fthrow | Nice Try | COMMAND GRAB/GRAB | grab | dmg 5; st after grab; kb 7,-4 (mag 8.1) | n/a / 0 / 0 |
| bthrow | Backhand Kindness | COMMAND GRAB/GRAB | grab | dmg 5.5; st after grab; kb 7.5,-4.4 (mag 8.7) | n/a / 0 / 0 |
| uthrow | Lift Up | COMBO STARTER | grab, combo-hitstun | dmg 4; st after grab; kb 0.5,-11.5 (mag 11.5) | n/a / 0 / 0 |
| dthrow | Niceness Chart | COMBO STARTER | grab, combo-hitstun | dmg 3.5; st after grab; kb 1.8,-8.5 (mag 8.7) | n/a / 4 / 0 |
| Final Smash | Into the Starry Void *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 14; reach 300 | - |

### Blocky (single winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | - | dmg 9; st ~2 (hit on the press; owner notes: frame 2); kb 10; reach 8 | 82 / 708 / 4 |
| ftilt | Block Shove *(inactive)* | FAST POKE | - | dmg 7.5; st 7; kb 4.6,-4 (mag 6.1); reach 84; active 3, end 10 | - |
| utilt | Block Pop | COMBO STARTER | combo-hitstun | dmg 6.2; st 6; kb 0.5,-11.2 (mag 11.2); reach 56; active 4, end 11 | 13 / 55 / 1 |
| dtilt | Trip Block | COMBO STARTER | combo-hitstun, knockdown | dmg 5; st 6; kb 1.6,-7.4 (mag 7.6); reach 95; active 3, end 9 | 9 / 32 / 0 |
| nair | Square Tumble | MULTI-HIT | multihit | dmg 4.4/hit; st 5; kb 1.6,-2.8 (mag 3.2); reach 68; active 6, end 8 | 3 / 9 / 0 |
| fair | Face Plant | FAST POKE | - | dmg 9.8; st 8; kb 3.8,-3 (mag 4.8); reach 84; active 3, end 11 | 11 / 32 / 0 |
| bair | Backward Fall | TRUE KILLER | kill<=100, launch | dmg 10.6; st 8; kb -9.2,-4.6 (mag 10.3); reach 82; active 3, end 13 | 15 / 23 / 2 |
| uair | Top Corner | COMBO STARTER | combo-hitstun | dmg 8x2; st 5; kb 0.4,-9.5 (mag 9.5); reach 22; active 3, end 9 | 8 / 0 / 0 |
| dair | Anvil Drop | SPIKE/METEOR | knockdown, spike | dmg 11.5; st 11; kb 0.8,9.6 (mag 9.6); reach 28; active 4, end 14 | 10 / 34 / 0 |
| nspecial | Prank Rig | SKY DROP | projectile, knockdown | dmg 13% | 56 / 168 / 3 |
| uspecial | Block Spawning | SKY DROP | trap | dmg 6%; reach short reach | 24 / 30 / 0 |
| dspecial | Trap | TRAP/MINE | trap, bait-friendly | dmg 12% | 21 / 48 / 0 |
| sidespecial | Block Slide *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 7; st 3; kb 5.6,-4 (mag 6.9); reach 76 | - |
| smash | Anvil Smash | SKY DROP | knockdown, bait-friendly | dmg 24%, knocks them down; st 90 (+charge 27); kb 10; reach 18 | 6 / 48 / 0 |
| finisher | Prankster's Switcheroo | FINISHER | bait-friendly | dmg 8% | 11 / 152 / 0 |
| grab | Grab + pummel (Corner Press) | COMMAND GRAB/GRAB | grab, pin | dmg 3.1 pummel; st 4; reach 34 | 7 / 0 / 0 |
| fthrow | Block Toss | COMMAND GRAB/GRAB | grab | dmg 8.5; st after grab; kb 8,-4.4 (mag 9.1) | n/a / 8 / 0 |
| bthrow | Prank Hurl | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 9; st after grab; kb 8.6,-5 (mag 9.9) | n/a / 9 / 1 |
| uthrow | Block Spawn | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 5.5; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 0 / 0 |
| dthrow | Funny Doings | COMBO STARTER | grab, combo-hitstun | dmg 6; st after grab; kb 1.8,-9 (mag 9.2) | n/a / 0 / 0 |
| Final Smash | Infinite Recovery Loop *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 30; reach 300 | - |

### Tree (single winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | - | dmg 7; st ~2 (hit on the press; owner notes: frame 2); kb 7; reach 5 | 45 / 321 / 2 |
| ftilt | Branch Swing *(inactive)* | FAST POKE | - | dmg 9; st 8; kb 4.8,-4 (mag 6.2); reach 86; active 4, end 12 | - |
| utilt | Canopy Lift | COMBO STARTER | combo-hitstun | dmg 7.2; st 7; kb 0.5,-11.5 (mag 11.5); reach 62; active 5, end 12 | 16 / 88 / 0 |
| dtilt | Root Trip | COMBO STARTER | combo-hitstun | dmg 5.4; st 6; kb 1.8,-7.4 (mag 7.6); reach 106; active 3, end 10 | 5 / 11 / 0 |
| nair | Leaf Storm | MULTI-HIT | multihit | dmg 3.4/hit; st 6; kb 1.6,-3 (mag 3.4); reach 64; active 8, end 9 | 3 / 42 / 0 |
| fair | Timber Fall | FAST POKE | - | dmg 11; st 9; kb 4,-3.2 (mag 5.1); reach 98; active 3, end 13 | 6 / 11 / 0 |
| bair | Trunk Bump | TRUE KILLER | kill<=100, launch | dmg 10.8; st 8; kb -9.4,-4.8 (mag 10.6); reach 92; active 3, end 13 | 17 / 49 / 0 |
| uair | Branch Up | COMBO STARTER | combo-hitstun | dmg 6.6; st 6; kb 0.5,-9 (mag 9.0); reach 92; active 4, end 10 | 6 / 34 / 0 |
| dair | Stump Down | SPIKE/METEOR | knockdown, spike | dmg 12.4; st 12; kb 0.9,9.8 (mag 9.8); reach 28; active 4, end 15 | 11 / 26 / 0 |
| nspecial | Timber | SKY DROP | projectile | dmg 11; reach long reach | 55 / 232 / 2 |
| uspecial | Topple | SPIKE/METEOR | spike, trap | dmg 10; reach short reach | 31 / 138 / 0 |
| dspecial | Rooted Armour | ARMOURED/INVINCIBLE STARTUP | armour |  | 7 / 0 / 0 |
| sidespecial | Root Shuffle *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 7.8; st 4; kb 5.8,-4 (mag 7.0); reach 78 | - |
| smash | Deadfall | READ KILLER | pin | dmg 28%, roots them in place; kb 12 | 7 / 0 / 0 |
| finisher | Bent Branch Catapult | FINISHER | grab, kill<=100, launch | dmg 11 | 17 / 34 / 2 |
| grab | Grab + pummel (Bark Rub) | COMMAND GRAB/GRAB | grab, pin | dmg 3.4 pummel; st 4; reach 38 | 6 / 0 / 0 |
| fthrow | Branch Toss | COMMAND GRAB/GRAB | grab | dmg 9; st after grab; kb 8.2,-4.4 (mag 9.3) | n/a / 9 / 0 |
| bthrow | Leaf Pile | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 9.4; st after grab; kb 8.8,-5 (mag 10.1) | n/a / 0 / 0 |
| uthrow | Treetop Lift | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 6; st after grab; kb 0.5,-12.2 (mag 12.2) | n/a / 6 / 0 |
| dthrow | Rooted | COMBO STARTER | grab, combo-hitstun | dmg 6.4; st after grab; kb 1.8,-9.2 (mag 9.4) | n/a / 0 / 0 |
| Final Smash | Cut Down to Size *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 14; reach 420 | - |

### Fries (single winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | - | dmg 8; st ~2 (hit on the press; owner notes: frame 2); kb 8; reach 14 | 102 / 719 / 6 |
| ftilt | Fry Jab *(inactive)* | FAST POKE | - | dmg 4.9; st 4; kb 3.3,-4.4 (mag 5.5); reach 71; active 2, end 7 | - |
| utilt | Fry Flick Up | COMBO STARTER | combo-hitstun | dmg 4.3; st 4; kb 0.6,-10.4 (mag 10.4); reach 37; active 3, end 8 | 4 / 8 / 0 |
| dtilt | Low Fry | COMBO STARTER | combo-hitstun | dmg 3.5; st 3; kb 1.5,-6.9 (mag 7.1); reach 76; active 2, end 7 | 18 / 78 / 1 |
| nair | Carton Spin | MULTI-HIT | multihit | dmg 2.5/hit; st 4; kb 1.2,-2.6 (mag 2.9); reach 46; active 7, end 6 | 2 / 0 / 0 |
| fair | Fry Volley | SPACING POKE | - | dmg 5.8; st 5; kb 2.5,-2.7 (mag 3.7); reach 87; active 3, end 8 | 24 / 15 / 0 |
| bair | Fry Back | TRUE KILLER | - | dmg 7; st 5; kb -8,-4.2 (mag 9.0); reach 75; active 3, end 9 | 25 / 93 / 0 |
| uair | Fry Lob | COMBO STARTER | combo-hitstun | dmg 4.5; st 4; kb 0.4,-8.6 (mag 8.6); reach 84; active 3, end 6 | 10 / 60 / 1 |
| dair | Fry Plunge | SPIKE/METEOR | knockdown, spike | dmg 6.6; st 6; kb 0.5,8.6 (mag 8.6); reach 12; active 3, end 10 | 10 / 0 / 0 |
| nspecial | Fry Dart | PROJECTILE | projectile | dmg 4% a fry, sometimes two land; reach very long reach | 60 / 486 / 1 |
| uspecial | Fry Flick | PROJECTILE | projectile, slow | dmg 4%, slows them; reach very long reach | 50 / 72 / 0 |
| dspecial | Fry Trap | ZONING WALL | trap | dmg 8% | 27 / 176 / 0 |
| sidespecial | Salt Slide *(inactive)* | MOBILITY/DASH ATTACK | slow | dmg 4.3; st 2; kb 4,-3.8 (mag 5.5); reach 64 | - |
| smash | Deep Fryer | BURST | burn | dmg 18%, sets them burning; kb 9 | 13 / 178 / 2 |
| finisher | Carton Over Their Head | FINISHER | projectile, pin, burn | dmg 9% | 49 / 70 / 0 |
| grab | Grab + pummel (Salt Shake) | COMMAND GRAB/GRAB | grab, pin | dmg 2.2 pummel; st 4; reach 30 | 6 / 0 / 0 |
| fthrow | Take Out | COMMAND GRAB/GRAB | grab | dmg 6.8; st after grab; kb 7.6,-4.2 (mag 8.7) | n/a / 20 / 0 |
| bthrow | Dip | COMMAND GRAB/GRAB | grab | dmg 7.3; st after grab; kb 8.1,-4.7 (mag 9.4) | n/a / 0 / 0 |
| uthrow | Super Size | COMBO STARTER | grab, combo-hitstun | dmg 4.8; st after grab; kb 0.5,-11.8 (mag 11.8) | n/a / 0 / 0 |
| dthrow | Squashed Fry | COMBO STARTER | grab, combo-hitstun | dmg 4.6; st after grab; kb 1.8,-8.8 (mag 9.0) | n/a / 0 / 0 |
| Final Smash | Get Digging *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 14; reach 420 | - |

### Ruby (single winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | PROJECTILE | projectile | dmg 4; st ~2 (hit on the press; owner notes: frame 2); kb 4; reach 8 | 285 / 1201 / 2 |
| ftilt | Facet Cut *(inactive)* | FAST POKE | - | dmg 6.1; st 5; kb 3.6,-4.1 (mag 5.5); reach 72; active 3, end 8 | - |
| utilt | Gem Rise | COMBO STARTER | combo-hitstun | dmg 5.3; st 5; kb 0.5,-10.9 (mag 10.9); reach 74; active 3, end 9 | 10 / 46 / 0 |
| dtilt | Low Facet | COMBO STARTER | combo-hitstun | dmg 4.1; st 4; kb 2.2,-5.6 (mag 6.0); reach 74; active 2, end 8 | 21 / 62 / 0 |
| fair | Hard Jab | SPACING POKE | - | dmg 7.8; st 5; kb 3.2,-3 (mag 4.4); reach 77; active 3, end 9 | 43 / 70 / 1 |
| bair | Reverse Cut | TRUE KILLER | kill<=100, launch | dmg 8.7; st 5; kb -8.5,-4.4 (mag 9.6); reach 75; active 3, end 10 | 47 / 149 / 3 |
| uair | Sparkle Up | COMBO STARTER | combo-hitstun | dmg 5.1; st 4; kb 0.3,-8.8 (mag 8.8); reach 74; active 3, end 8 | 9 / 34 / 0 |
| dair | Gem Drop | SPIKE/METEOR | knockdown, spike | dmg 8.5; st 8; kb 0.7,9.1 (mag 9.1); reach 21; active 4, end 12 | 6 / 17 / 0 |
| nspecial | Refraction Beam | SELF-BUFF | buff, projectile |  | 0 / 0 / 0 |
| uspecial | Gem-Hard | ARMOURED/INVINCIBLE STARTUP | armour, mobility | dmg 7% at the edge of the swing, 3% up close; reach short reach | 73 / 84 / 0 |
| dspecial | Gem Trap | ZONING WALL | trap | dmg 9% | 41 / 172 / 0 |
| sidespecial | Crystal Rush *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 5.9; st 3; kb 5.2,-3.8 (mag 6.4); reach 69 | - |
| smash | Prism Burst | PROJECTILE | projectile, burn | dmg 23%, sets them burning; kb 8 | 17 / 253 / 0 |
| finisher | Refracting Prism | FINISHER | projectile, trap, launch | dmg 10%, pops them up | 27 / 118 / 3 |
| grab | Grab + pummel (Facet Scrape) | COMMAND GRAB/GRAB | grab, pin | dmg 2.5 pummel; st 4; reach 30 | 3 / 0 / 0 |
| fthrow | Polished Toss | COMMAND GRAB/GRAB | grab | dmg 7.4; st after grab; kb 7.8,-4.3 (mag 8.9) | n/a / 0 / 0 |
| bthrow | Cut and Cast | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 7.8; st after grab; kb 8.3,-4.8 (mag 9.6) | n/a / 0 / 0 |
| uthrow | Gem Toss | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 5; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 0 / 0 |
| dthrow | Set in Stone | COMBO STARTER | grab, combo-hitstun | dmg 5; st after grab; kb 1.8,-9 (mag 9.2) | n/a / 0 / 0 |
| Final Smash | Refraction *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 28; reach 600 | - |

### Pencil (single winner)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | - | dmg 10; st ~2 (hit on the press; owner notes: frame 2); kb 10; reach 10 | 84 / 832 / 1 |
| ftilt | Lead Jab *(inactive)* | SPACING POKE | - | dmg 9x2; st 6; kb 5.2,-3.4 (mag 6.2); reach 92; active 3, end 9 | - |
| utilt | Eraser Up | COMBO STARTER | combo-hitstun | dmg 5.5; st 5; kb 0.5,-11 (mag 11.0); reach 74; active 3, end 9 | 10 / 38 / 1 |
| dtilt | Point Poke | COMBO STARTER | combo-hitstun | dmg 4.5; st 5; kb 1.8,-7.2 (mag 7.4); reach 86; active 2, end 8 | 16 / 32 / 1 |
| nair | Spin Stick | MULTI-HIT | multihit | dmg 4.5/hit; st 5; kb 1.6,-2.8 (mag 3.2); reach 52; active 5, end 8 | 6 / 14 / 0 |
| fair | Lead Thrust | FAST POKE | - | dmg 8.5x2; st 7; kb 3.8,-3 (mag 4.8); reach 100; active 3, end 10 | 14 / 0 / 0 |
| bair | Eraser Back | TRUE KILLER | kill<=100, launch | dmg 9.5; st 7; kb -8.8,-4.4 (mag 9.8); reach 83; active 3, end 11 | 18 / 19 / 0 |
| uair | Point Up | COMBO STARTER | combo-hitstun | dmg 5.5; st 5; kb 0.4,-9 (mag 9.0); reach 16; active 3, end 8 | 9 / 16 / 1 |
| dair | Pencil Plant | SPIKE/METEOR | knockdown, spike | dmg 8.5; st 8; kb 0.5,9.5 (mag 9.5); reach 14; active 5, end 14 | 10 / 8 / 0 |
| nspecial | Supervan | PROJECTILE | kill<=100, projectile | dmg 15% | 71 / 1432 / 2 |
| uspecial | Fire Spit | PROJECTILE | projectile, burn | dmg 5%, sets them burning; reach very long reach | 42 / 75 / 0 |
| dspecial | Super Armour | ARMOURED/INVINCIBLE STARTUP | armour |  | 6 / 0 / 0 |
| sidespecial | Dash Out *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 6; st 2; kb 6.5,-4 (mag 7.6); reach 50 | - |
| smash | Supervan Ram | PROJECTILE | projectile, knockdown | dmg 18%, knocks them down; kb 10; reach 16 | 19 / 414 / 5 |
| finisher | Ramp Sketch Dive | FINISHER | mobility, knockdown | dmg 13%, knocks them down | 30 / 114 / 1 |
| grab | Grab + pummel (Poke) | COMMAND GRAB/GRAB | grab, pin | dmg 3.1 pummel; st 4; reach 34 | 4 / 0 / 0 |
| fthrow | She's Got Him | COMMAND GRAB/GRAB | grab | dmg 7.5; st after grab; kb 8.2,-4.2 (mag 9.2) | n/a / 8 / 0 |
| bthrow | Over the Shoulder | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 8; st after grab; kb 8.8,-5 (mag 10.1) | n/a / 0 / 0 |
| uthrow | Sharpen | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 5.5; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 11 / 0 |
| dthrow | Plant | COMBO STARTER | grab, combo-hitstun | dmg 5.5; st after grab; kb 1.8,-8.5 (mag 8.7) | n/a / 0 / 0 |
| Final Smash | The Power of Two and Four *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 84; reach 300 | - |

### Teddy Bear (control)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | - | dmg 6; st ~2 (hit on the press; owner notes: frame 2); kb 7; reach 2 | 62 / 343 / 1 |
| ftilt | Gun Butt *(inactive)* | FAST POKE | - | dmg 5.6; st 4; kb 3.6,-4.2 (mag 5.5); reach 69; active 3, end 8 | - |
| utilt | Stuffing Uppercut | COMBO STARTER | combo-hitstun | dmg 5; st 4; kb 0.5,-11 (mag 11.0); reach 62; active 3, end 8 | 12 / 55 / 4 |
| dtilt | Bear Trip | COMBO STARTER | combo-hitstun, knockdown | dmg 4.4; st 4; kb 1.7,-7.2 (mag 7.4); reach 75; active 3, end 9 | 10 / 44 / 0 |
| nair | Berserk Flail | MULTI-HIT | multihit | dmg 2.8/hit; st 4; kb 1.1,-2.5 (mag 2.7); reach 46; active 7, end 8 | 6 / 3 / 0 |
| fair | Paint Slug | SPACING POKE | - | dmg 6; st 5; kb 2.6,-2.8 (mag 3.8); reach 87; active 2, end 9 | 8 / 10 / 0 |
| bair | Recoil Kick | TRUE KILLER | kill<=100, launch | dmg 8; st 5; kb -8.6,-4.4 (mag 9.7); reach 74; active 3, end 10 | 13 / 8 / 0 |
| uair | Skyward Shot | COMBO STARTER | combo-hitstun | dmg 4.9; st 4; kb 0.4,-9 (mag 9.0); reach 12; active 3, end 8 | 8 / 15 / 0 |
| dair | Plop Down | SPIKE/METEOR | knockdown, spike | dmg 7.8; st 7; kb 0.6,8.8 (mag 8.8); reach 19; active 4, end 11 | 8 / 0 / 0 |
| nspecial | Paint Gun | PROJECTILE | projectile, launch | dmg 5%; reach very long reach | 35 / 110 / 0 |
| uspecial | Respect THIS! | MULTI-HIT | multihit, pull, mobility | dmg 5% a punch, about 17% in all; reach short reach | 34 / 214 / 0 |
| dspecial | Front of the Crowd | MOBILITY/DASH ATTACK | mobility, knockdown | dmg 6%; reach medium reach | 5 / 24 / 1 |
| sidespecial | Dive for Cover *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 5.4; st 2; kb 4.8,-3.6 (mag 6.0); reach 63 | - |
| smash | Rage Room | READ KILLER | kill<=100, knockdown, launch | dmg 24%, knocks them down; kb 14 | 7 / 134 / 0 |
| finisher | Paint Grenade, Then Paintballs | FINISHER | projectile, debuff | dmg 7%, painted for 4 s | 10 / 112 / 0 |
| grab | Grab + pummel (Stuffing Pull) | COMMAND GRAB/GRAB | grab, pin | dmg 2.5 pummel; st 4; reach 28 | 3 / 0 / 0 |
| fthrow | Point Blank | COMMAND GRAB/GRAB | grab | dmg 7.2; st after grab; kb 7.8,-4.2 (mag 8.9) | n/a / 0 / 0 |
| bthrow | Bear Hug Fling | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 7.6; st after grab; kb 8.2,-4.8 (mag 9.5) | n/a / 0 / 0 |
| uthrow | Toss Up | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 5; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 0 / 0 |
| dthrow | Knees Down | COMBO STARTER | grab, combo-hitstun | dmg 5; st after grab; kb 1.8,-9 (mag 9.2) | n/a / 0 / 0 |
| Final Smash | Yes!!! Smash!!! *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 36; reach 230 | - |

### Yin-Yang (control)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | - | dmg 5; st ~2 (hit on the press; owner notes: frame 2); kb 7; reach 8 | 42 / 201 / 0 |
| ftilt | Yang Punch *(inactive)* | FAST POKE | - | dmg 7.2; st 4; kb 3.6,-4.2 (mag 5.5); reach 74; active 3, end 8 | - |
| utilt | Yin Rise | COMBO STARTER | combo-hitstun | dmg 6.1; st 5; kb 0.5,-10.8 (mag 10.8); reach 64; active 3, end 9 | 6 / 24 / 0 |
| dtilt | Balance Sweep | COMBO STARTER | combo-hitstun | dmg 6.3; st 4; kb 1.7,-7.2 (mag 7.4); reach 76; active 3, end 8 | 12 / 66 / 0 |
| nair | Balance Spin | MULTI-HIT | multihit | dmg 3.6/hit; st 5; kb 1.4,-2.7 (mag 3.0); reach 50; active 5, end 8 | 1 / 0 / 0 |
| fair | Yang Strike | SPACING POKE | - | dmg 7.3; st 5; kb 3.2,-3 (mag 4.4); reach 78; active 3, end 9 | 13 / 22 / 0 |
| bair | Yin Kick | TRUE KILLER | kill<=100, launch | dmg 9.6; st 5; kb -8.6,-4.4 (mag 9.7); reach 74; active 3, end 10 | 8 / 27 / 0 |
| uair | Through Up | COMBO STARTER | combo-hitstun | dmg 5.1; st 4; kb 0.4,-9 (mag 9.0); reach 15; active 3, end 9 | 8 / 5 / 0 |
| dair | Yang Drop | SPIKE/METEOR | knockdown, spike | dmg 8.4; st 8; kb 0.7,9 (mag 9.0); reach 20; active 4, end 12 | 3 / 8 / 0 |
| nspecial | Yang Throws Yin | PROJECTILE | projectile, knockdown | dmg 10%; reach long reach | 38 / 529 / 3 |
| uspecial | Through the Roof | RECOVERY | invulnerable, knockdown | dmg 5% (9% up close); reach short reach | 24 / 103 / 2 |
| dspecial | Mindful Positioning | SELF-BUFF | buff |  | 0 / 0 / 0 |
| sidespecial | Symbol Roll *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 5.8; st 3; kb 4.8,-3.6 (mag 6.0); reach 48 | - |
| smash | The Right Goal | MOBILITY/DASH ATTACK | kill<=100, knockdown, mobility | dmg 24%, knocks them down; kb 5 | 5 / 72 / 2 |
| finisher | Meet in the Middle | FINISHER | bait-friendly | dmg up to 15% each way, 10% on a boss | 7 / 0 / 0 |
| grab | Grab + pummel (Yang Poke) | COMMAND GRAB/GRAB | grab, pin | dmg 2.5 pummel; st 4; reach 28 | 4 / 0 / 0 |
| fthrow | Yin Toss | COMMAND GRAB/GRAB | grab | dmg 7.2; st after grab; kb 7.8,-4.2 (mag 8.9) | n/a / 7 / 0 |
| bthrow | Yang Hurl | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 7.6; st after grab; kb 8.2,-4.8 (mag 9.5) | n/a / 0 / 0 |
| uthrow | Balance Lift | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 5; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 0 / 0 |
| dthrow | Fused Press | COMBO STARTER | grab, combo-hitstun | dmg 5.4; st after grab; kb 1.8,-9 (mag 9.2) | n/a / 0 / 0 |
| Final Smash | Yang Throws Yin *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 34; reach 450 | - |

### Knife (control)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | - | dmg 7; st ~2 (hit on the press; owner notes: frame 2); kb 8; reach 16 | 45 / 351 / 2 |
| ftilt | Quick Stab *(inactive)* | FAST POKE | - | dmg 5.6; st 4; kb 3.4,-4.2 (mag 5.4); reach 74; active 2, end 7 | - |
| utilt | Blade Flip | COMBO STARTER | combo-hitstun | dmg 4.8; st 5; kb 0.5,-10.6 (mag 10.6); reach 60; active 3, end 8 | 14 / 53 / 2 |
| dtilt | Low Slash | COMBO STARTER | combo-hitstun | dmg 4; st 4; kb 1.6,-7 (mag 7.2); reach 75; active 2, end 7 | 15 / 63 / 0 |
| nair | Blade Spin | MULTI-HIT | multihit | dmg 3.3/hit; st 4; kb 1.3,-2.6 (mag 2.9); reach 46; active 5, end 7 | 1 / 0 / 0 |
| fair | Lunge | SPACING POKE | bleed | dmg 8.6x2; st 5; kb 3,-2.8 (mag 4.1); reach 86; active 2, end 8 | 7 / 26 / 0 |
| bair | Back Stab | TRUE KILLER | kill<=100, launch | dmg 8.2; st 5; kb -8.6,-4.4 (mag 9.7); reach 70; active 3, end 9 | 8 / 0 / 0 |
| uair | Blade Up | COMBO STARTER | combo-hitstun | dmg 6; st 4; kb 0.4,-9 (mag 9.0); reach 12; active 3, end 8 | 6 / 13 / 0 |
| dair | Dive Stab | SPIKE/METEOR | knockdown, spike | dmg 8.4; st 8; kb 0.5,9.4 (mag 9.4); reach 11; active 3, end 11 | 11 / 28 / 0 |
| nspecial | Bag of Tricks | PROJECTILE | projectile, stun, trap, pull | dmg 4 | 36 / 185 / 0 |
| uspecial | Rising Stab | SPACING POKE | bleed | dmg 5 | 22 / 41 / 0 |
| dspecial | Fake-Out | ARMOURED/INVINCIBLE STARTUP | invulnerable, mobility |  | 0 / 0 / 0 |
| sidespecial | Slip Through *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 5; st 2; kb 4.8,-3.6 (mag 6.0); reach 63 | - |
| smash | Blade Rush | MOBILITY/DASH ATTACK | mobility, debuff | dmg 21%, strips armour and stances; kb 12 | 8 / 176 / 2 |
| finisher | Shove Off the Platform | FINISHER | kill<=100, launch, mobility | dmg 9 | 42 / 79 / 3 |
| grab | Grab + pummel (Nick) | COMMAND GRAB/GRAB | grab, pin | dmg 2.2 pummel; st 4; reach 28 | 3 / 0 / 0 |
| fthrow | Fist Thingy | COMMAND GRAB/GRAB | grab | dmg 7; st after grab; kb 7.6,-4.2 (mag 8.7) | n/a / 0 / 0 |
| bthrow | Boomerang | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 7.4; st after grab; kb 8.2,-4.8 (mag 9.5) | n/a / 0 / 0 |
| uthrow | Paralyzer | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 4.8; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 0 / 0 |
| dthrow | Caltrops | COMBO STARTER | grab, combo-hitstun | dmg 5; st after grab; kb 1.8,-9 (mag 9.2) | n/a / 0 / 0 |
| Final Smash | Bag of Tricks *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 40; reach 520 | - |

### Book (control)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | kill<=100 | dmg 8; st ~2 (hit on the press; owner notes: frame 2); kb 8; reach 6 | 59 / 523 / 4 |
| ftilt | Page Slap *(inactive)* | FAST POKE | - | dmg 5.3; st 4; kb 3.3,-4.3 (mag 5.4); reach 68; active 3, end 8 | - |
| utilt | Page Turn | COMBO STARTER | combo-hitstun | dmg 4.6; st 4; kb 0.5,-10.7 (mag 10.7); reach 72; active 4, end 8 | 7 / 45 / 1 |
| dtilt | Bookmark | COMBO STARTER | combo-hitstun | dmg 3.5; st 4; kb 1.5,-7 (mag 7.2); reach 67; active 2, end 7 | 11 / 31 / 0 |
| nair | Flip Through | MULTI-HIT | multihit | dmg 2.7/hit; st 4; kb 1.3,-2.6 (mag 2.9); reach 48; active 7, end 6 | 0 / 0 / 0 |
| fair | Hardcover | SPACING POKE | - | dmg 7.4; st 6; kb 3,-3 (mag 4.2); reach 79; active 3, end 9 | 10 / 17 / 0 |
| bair | Spine Back | TRUE KILLER | - | dmg 8.4; st 5; kb -8.2,-4.4 (mag 9.3); reach 74; active 3, end 10 | 14 / 30 / 0 |
| uair | Page Fan | COMBO STARTER | combo-hitstun | dmg 4.9; st 4; kb 0.3,-8.7 (mag 8.7); reach 72; active 3, end 7 | 9 / 19 / 1 |
| dair | Book Drop | SPIKE/METEOR | knockdown, spike | dmg 7.9; st 7; kb 0.6,8.6 (mag 8.6); reach 20; active 4, end 11 | 7 / 18 / 0 |
| nspecial | Define | SELF-BUFF | buff, debuff |  | 54 / 0 / 0 |
| uspecial | Gravity Page | RECOVERY | knockdown | dmg 3%, or 6% right up close, knocks them down; reach short reach | 29 / 59 / 0 |
| dspecial | Brace | ARMOURED/INVINCIBLE STARTUP | armour |  | 15 / 0 / 0 |
| sidespecial | Page Glide *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 5; st 3; kb 4.4,-3.8 (mag 5.8); reach 69 | - |
| smash | Hardcover Slam | MOBILITY/DASH ATTACK | mobility, debuff | dmg 23%, marks them to take more; kb 11 | 9 / 274 / 2 |
| finisher | Pop-Up Page | FINISHER | trap, launch | dmg 9%, launches up | 15 / 53 / 2 |
| grab | Grab + pummel (Paper Cut) | COMMAND GRAB/GRAB | grab, pin | dmg 2.3 pummel; st 4; reach 30 | 9 / 0 / 0 |
| fthrow | Slam Shut | COMMAND GRAB/GRAB | grab | dmg 7; st after grab; kb 7.6,-4.2 (mag 8.7) | n/a / 0 / 0 |
| bthrow | Flip Back | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 7.5; st after grab; kb 8.2,-4.8 (mag 9.5) | n/a / 0 / 0 |
| uthrow | Book Report | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 5; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 12 / 0 |
| dthrow | Press Flat | COMBO STARTER | grab, combo-hitstun | dmg 4.8; st after grab; kb 1.8,-9 (mag 9.2) | n/a / 5 / 0 |
| Final Smash | Overdue *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 36; reach 600 | - |

### Taco (control)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | - | dmg 8; st ~2 (hit on the press; owner notes: frame 2); kb 8; reach 10 | 58 / 477 / 2 |
| ftilt | Shell Crunch *(inactive)* | FAST POKE | - | dmg 6.8; st 5; kb 3.6,-4.2 (mag 5.5); reach 74; active 3, end 9 | - |
| utilt | Taco Toss | COMBO STARTER | combo-hitstun | dmg 5.4; st 5; kb 0.5,-10.8 (mag 10.8); reach 74; active 4, end 9 | 8 / 19 / 0 |
| dtilt | Salsa Slide | COMBO STARTER | combo-hitstun, slow | dmg 4.6; st 4; kb 1.6,-7.1 (mag 7.3); reach 75; active 3, end 8 | 9 / 40 / 0 |
| nair | Shell Twirl | MULTI-HIT | multihit | dmg 3.2/hit; st 5; kb 1.4,-2.7 (mag 3.0); reach 54; active 8, end 7 | 5 / 16 / 0 |
| fair | Hard Shell Punch | SPACING POKE | - | dmg 8.4; st 6; kb 3.6,-3.2 (mag 4.8); reach 81; active 3, end 11 | 20 / 62 / 0 |
| bair | Rear Shell | TRUE KILLER | kill<=100, launch | dmg 9.4; st 6; kb -9,-4.6 (mag 10.1); reach 78; active 3, end 11 | 16 / 19 / 1 |
| uair | Cilantro Up | COMBO STARTER | combo-hitstun | dmg 5.4; st 5; kb 0.4,-8.8 (mag 8.8); reach 74; active 3, end 8 | 9 / 38 / 1 |
| dair | Platter Drop | SPIKE/METEOR | knockdown, spike | dmg 9.6; st 8; kb 0.7,9.2 (mag 9.2); reach 20; active 4, end 13 | 13 / 19 / 0 |
| nspecial | Jawbreaker | PROJECTILE | projectile, pin | dmg 12%, roots them in place; reach very long reach | 52 / 429 / 0 |
| uspecial | Quick Bite | RECOVERY | heal | dmg 6%, heals you 3%; reach short reach | 43 / 69 / 0 |
| dspecial | Retractable Arms | PULL | pull, stun, trap | dmg 6%, stuns them; the puddle hits 2% and slows them; reach long reach | 20 / 168 / 0 |
| smash | Combo Platter | PROJECTILE | projectile, slow | dmg 17%, slows them; kb 7; reach 15 | 10 / 85 / 3 |
| finisher | Griddle Flip | FINISHER | trap, launch, burn | dmg 9%, sets them burning | 9 / 18 / 1 |
| grab | Grab + pummel (Guac Squeeze) | COMMAND GRAB/GRAB | grab, pin | dmg 2.7 pummel; st 4; reach 36 | 4 / 0 / 0 |
| fthrow | Taco Tuesday | COMMAND GRAB/GRAB | grab | dmg 7.8; st after grab; kb 7.7,-4.3 (mag 8.8) | n/a / 0 / 0 |
| bthrow | Fold Over | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 8.2; st after grab; kb 8.2,-4.8 (mag 9.5) | n/a / 8 / 1 |
| uthrow | Fill It Up | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 5.2; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 0 / 0 |
| dthrow | Squash Flat | COMBO STARTER | grab, combo-hitstun | dmg 5.4; st after grab; kb 1.8,-9 (mag 9.2) | n/a / 0 / 0 |
| Final Smash | Retractable Arms *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 36; reach 320 | - |

### Basketball (control)

| Slot | Move | Category | Effects | Key numbers | Sim uses/dmg/KOs |
|---|---|---|---|---|---|
| jab | Attack (jab) | FAST POKE | - | dmg 6; st ~2 (hit on the press; owner notes: frame 2); kb 7; reach 16 | 90 / 503 / 1 |
| ftilt | Bounce Pass *(inactive)* | FAST POKE | - | dmg 6.6; st 5; kb 3.9,-4.1 (mag 5.7); reach 60; active 3, end 8 | - |
| utilt | Alley-Oop Up | COMBO STARTER | combo-hitstun | dmg 4.7; st 4; kb 0.7,-10.8 (mag 10.8); reach 56; active 4, end 8 | 4 / 9 / 1 |
| dtilt | Low Bounce | COMBO STARTER | combo-hitstun | dmg 3.9; st 4; kb 1.6,-7.1 (mag 7.3); reach 78; active 2, end 7 | 24 / 55 / 0 |
| nair | Spin Move | MULTI-HIT | multihit | dmg 3.1/hit; st 4; kb 1.4,-2.7 (mag 3.0); reach 50; active 7, end 7 | 6 / 6 / 0 |
| fair | Fast Break | SPACING POKE | - | dmg 7.9; st 5; kb 3.7,-2.9 (mag 4.7); reach 80; active 3, end 9 | 25 / 95 / 1 |
| bair | Rebound | TRUE KILLER | kill<=100, launch | dmg 9.6; st 6; kb -8.9,-4.6 (mag 10.0); reach 62; active 3, end 10 | 17 / 8 / 0 |
| uair | Jump Shot | COMBO STARTER | combo-hitstun | dmg 5.2; st 4; kb 0.4,-8.9 (mag 8.9); reach 70; active 3, end 8 | 11 / 21 / 0 |
| dair | Slam Dunk | SPIKE/METEOR | kill<=100, knockdown, spike | dmg 9.3; st 8; kb 0.7,9.6 (mag 9.6); reach 21; active 4, end 12 | 11 / 19 / 1 |
| nspecial | Self-Dribble | PROJECTILE | projectile | dmg 7% | 45 / 217 / 0 |
| uspecial | Alley-Oop | COMBO STARTER | mobility, launch | dmg 4% (8% up close); reach short reach | 49 / 100 / 2 |
| dspecial | Bouncy Mine | TRAP/MINE | trap | dmg 8% | 19 / 32 / 0 |
| sidespecial | Dribble Drive *(inactive)* | MOBILITY/DASH ATTACK | - | dmg 6.5; st 3; kb 5.3,-4 (mag 6.6); reach 48 | - |
| smash | Slam Dunk | MOBILITY/DASH ATTACK | mobility, knockdown | dmg 21%, knocks them down; kb 12 | 10 / 202 / 0 |
| finisher | Bank Shot, Shot Clock | FINISHER | projectile, stun, debuff | dmg 8%, and a 5-second shot clock: if they land no hit before the buzzer, they are stunned 0 | 69 / 306 / 2 |
| grab | Grab + pummel (Palm) | COMMAND GRAB/GRAB | grab, pin | dmg 2.5 pummel; st 4; reach 30 | 3 / 0 / 0 |
| fthrow | Chest Pass | COMMAND GRAB/GRAB | grab | dmg 7.2; st after grab; kb 7.7,-4.2 (mag 8.8) | n/a / 0 / 0 |
| bthrow | Behind the Back | COMMAND GRAB/GRAB | grab, launch, kill<=100 | dmg 7.6; st after grab; kb 8.2,-4.8 (mag 9.5) | n/a / 0 / 0 |
| uthrow | Alley-Oop | COMBO STARTER | grab, combo-hitstun, launch, kill<=100 | dmg 5; st after grab; kb 0.5,-12 (mag 12.0) | n/a / 5 / 0 |
| dthrow | Bounce Down | COMBO STARTER | grab, combo-hitstun | dmg 4.8; st after grab; kb 1.8,-9 (mag 9.2) | n/a / 0 / 0 |
| Final Smash | Best Friend Slam *(Smash Ball only)* | FINAL SMASH | cinematic, catch | st 14; reach 420 | - |

## 4. Part 2: what the owner said against the simulation

### 4a. Every owner call-out, mapped to a move and a category

I went through `world-cup-results.md` (the cups #1-#50, the "Tactics found so far" list and "The owner's observations") and listed **59 call-outs** of a move, a play or a misuse: 52 from the numbered cups, 5 tactics, 2 observations. Each has the owner's words (shortened), the move it maps to, its category, the owner's stance (**praised** = best move / PoTM / good play; **criticised** = EoTM, misuse, design complaint; **named** = mentioned without a verdict), and what the simulation says about that move. 39 map to a move of the 31 fighters here (28 of them praised); 20 are about fighters outside this analysis (Loser, Pillow, Bow, Bot, Clover, Eraser, Gaty, Goo, Grassy, Pen, the prize fighter) or about no fighter (tactics), so only their category is counted. "Rank" is the move's rank by simulated damage among all that fighter's moves. Voided: the #14 Bow-Knife semifinal PoTM is not counted (the owner voided it).

| # | Cup | Fighter | Owner words | Mapped move (slot) | Category | Stance | Sim: uses / dmg / KOs (rank by damage in the fighter) |
|---|---|---|---|---|---|---|---|
| 1 | 1 | Lightning | "Best move in finals: Finisher for lightning. not kill move, best move" | Pocket Thundercloud (fin) | FINISHER | praised | 31 / 47 / 0 (rank 8) |
| 2 | 2 | Puffball | "Best move: spit(PB)" | Attack (jab) (jab) | PROJECTILE | praised | 219 / 1208 / 4 (rank 1) |
| 3 | 3 | Toothpaste | "the dash thingy. Very versatile. Good for ledgeguards, kills, and chipping" (best move) | Squeeze Rocket (fin) | FINISHER | praised | 91 / 830 / 13 (rank 1) |
| 4 | 3 | Toothpaste | "Best Play: ledgeguard double trap" (bait into a trap, knockback sets up the ledge) | Paste Trap (sp), Root Trap (dn) | TRAP/MINE | praised | 63 / 624 / 0 (rank 3+8) |
| 5 | 4 | Loser | "Best move: loser's smash" (Winner's Aura, a spaced lunge) | (fighter not in this analysis) | MOBILITY/DASH ATTACK | praised | not simulated |
| 6 | 4 | Puffball | "PB got shopping cart, but fell and was barely able to recover ... her incredible recovery" (best play AND worst misplay) | Flight (sp), Float Boost (up) | SELF-BUFF / RECOVERY | praised | 22 / 12 / 0 (rank None+7) |
| 7 | 6 | Ruby | PoTM "baited coiny into a finisher by pretending to be an easy target, but then got a lot of damage" | Refracting Prism (fin) | FINISHER | praised | 27 / 118 / 3 (rank 5) |
| 8 | 6 | Coiny | EoTM "kept countering when ruby was baiting him" | Counter (dn) | COUNTER | criticised | 7 / 44 / 1 (rank 4) |
| 9 | 8 | Ruby | PoTM "Pie and her finisher for absolutely ABSURD stage control" (the prism) | Refracting Prism (fin) | FINISHER | praised | 27 / 118 / 3 (rank 5) |
| 10 | 8 | Ruby | "its gem bolt, uncharged with 3 different angles" | Attack (jab) (jab) | PROJECTILE | praised | 285 / 1201 / 2 (rank 1) |
| 11 | 9 | Pillow | PoTM "baited Blocky with the hammer thing, causing him to fall off" (her sleep finisher) | (fighter not in this analysis) | FINISHER | praised | not simulated |
| 12 | 10 | Bow | PoTM "used the finisher to double-hit leafy, and also block her from items" (tower) | (fighter not in this analysis) | FINISHER | praised | not simulated |
| 13 | 10 | Leafy | EoTM "KAMIKAZE DASH BY LEAFY!!!" (BFDIA Sprint off the edge) | BFDIA Sprint (sp) | MOBILITY/DASH ATTACK | criticised | 47 / 390 / 3 (rank 1) |
| 14 | 11 | Toothpaste | PoTM "made a safe zone with two traps", then "trap into trap into dash into stock ... twice" | Paste Trap (sp), Root Trap (dn), Squeeze Rocket (fin) | TRAP/MINE / FINISHER | praised | 154 / 1454 / 13 (rank 3+8+1) |
| 15 | 13 | Tennis Ball | "a move that kept on countering [prize fighter]'s attacks and knocked him back VERY well" (measured: the plain 8% jab) | Attack (jab) (jab) | FAST POKE | praised | 100 / 835 / 5 (rank 1) |
| 16 | 13 | prize fighter | "uses his trap not only as a trap, but as an attack used stratigacelly to stage control" (a puddle trap) | (fighter not in this analysis) | TRAP/MINE | praised | not simulated |
| 17 | 14 | Bot | PoTM "used her up-special to ledgeguard absurdly well" (stilt stomp) | (fighter not in this analysis) | SPIKE/METEOR | praised | not simulated |
| 18 | 14 | Golf Ball | PoTM "gb predicted and placed a trap there" (Water Hazard puddle on the up-special) | Water Hazard (up) | SPIKE/METEOR | praised | 26 / 57 / 1 (rank 4) |
| 19 | 16 | David | PoTM "david predicted and used his finisher" (Shoulder Toss on a whiffed up-air) | Aw, Seriously? Shoulder Toss (fin) | FINISHER | praised | 55 / 290 / 3 (rank 2) |
| 20 | 16 | Lightning | EoTM "failed ledgeguard by lightning" | Chain Bolt (sp) | PROJECTILE | criticised | 30 / 458 / 2 (rank 1) |
| 21 | 17 | Lollipop | EoTM "tried to go on platforms with traps on the edge" | Rooting Trap (dn) | TRAP/MINE | criticised | 34 / 108 / 0 (rank 5) |
| 22 | 18 | Puffball | EoTM "pb used her finisher for no reason, missed, and got a stock taken" (Grow) | Grow (fin) | FINISHER | criticised | 15 / 58 / 0 (rank 3) |
| 23 | 19 | Lollipop | PoTM "baited needle into a free hit, but then trapped+finisher'd her" | Rooting Trap (dn), Sugar Rush Flurry (fin) | TRAP/MINE / FINISHER | praised | 56 / 225 / 4 (rank 5+4) |
| 24 | 20 | Lightbulb | "she used her beam well to ledgeguard! almost cost me a stock ... light-up is pretty good" | Spotlight (smash), Light-Up Disco Tiles (fin) | PROJECTILE / FINISHER | praised | 36 / 360 / 5 (rank 2+5) |
| 25 | 20 | Clover | "best move overall: clover's butterflies" (a projectile wall + debuff) | (fighter not in this analysis) | ZONING WALL | praised | not simulated |
| 26 | 20 | Bow | "best up-c bow's" (Chair Slam) and "best smash: bow's" (Musical Chairs) | (fighter not in this analysis) | SPIKE/METEOR | praised | not simulated |
| 27 | 20 | Toothpaste | "best finisher: toothpaste's" | Squeeze Rocket (fin) | FINISHER | praised | 91 / 830 / 13 (rank 1) |
| 28 | 20 | Lightning | "best down-c: lightning's" (Floor Trap) | Floor Trap (dn) | TRAP/MINE | praised | 17 / 154 / 0 (rank 3) |
| 29 | 20 | Eraser | "best attacks, airs, and tilts: eraser's" | (fighter not in this analysis) | FAST POKE | praised | not simulated |
| 30 | 21 | Gaty | "gaty beat pb. ig thats expected (gaty counters projectiles)" | (fighter not in this analysis) | COUNTER | praised | not simulated |
| 31 | 22 | Pencil | "cool play by pencil: van, into ramp to refresh the van early, into van" | Supervan (sp), Ramp Sketch Dive (fin) | PROJECTILE / FINISHER | praised | 101 / 1546 / 3 (rank 1+4) |
| 32 | 22 | Pencil | EoTM "used the ramp, but missed and lost stage control" | Ramp Sketch Dive (fin) | FINISHER | criticised | 30 / 114 / 1 (rank 4) |
| 33 | 26 | Blocky | "easy play for blocky's anvil could be an option" | Prank Rig (sp) | SKY DROP | named | 56 / 168 / 3 (rank 2) |
| 34 | 26 | Snowball | "sb fell without doing anything" / "sb killed himself" (his own dash) | Rage Tackle (sp) | MOBILITY/DASH ATTACK | criticised | 46 / 481 / 2 (rank 2) |
| 35 | 29 | Gelatin | "GELATIN IS GOING CRAZY (20.4% vs 94%)" ... "GELATIN FINISHED HIM"; #30 "kills at low percent" | Freeze Syringe (sp), Freeze Mine (dn), Ice Breaker (smash), Attack (jab) (jab) | PROJECTILE / TRAP/MINE / MULTI-HIT | praised | 165 / 710 / 7 (rank 2+9+6+1) |
| 36 | 30 | Lightbulb | "stopping a grab combo with his finisher" (made Ice Cube misplay) | Light-Up Disco Tiles (fin) | FINISHER | praised | 21 / 102 / 0 (rank 5) |
| 37 | 30 | Magnet | "used the control scramble to combo HARD!!! and then won" | C'mon, Bestie! (sp), Attack (jab) (jab) | PULL / FAST POKE | praised | 108 / 757 / 12 (rank 4+1) |
| 38 | 31 | Bomb | "he is like ganon, he either wins fast, or you do" | Collision (sp), Big Kaboom (smash) | MOBILITY/DASH ATTACK / BURST | praised | 34 / 634 / 13 (rank 1+4) |
| 39 | 32 | Barf Bag | PoTM "bb is forcing spacing at the ledge" and "bb used a trap to stop ledgeguards" | Poison Puddle (dn), Acid Reflux (smash) | ZONING WALL / BURST | praised | 61 / 210 / 1 (rank 3+4) |
| 40 | 32 | Pillow | "hammer-smash bait combo for the stock by pillow! 2 potms" | (fighter not in this analysis) | READ KILLER | praised | not simulated |
| 41 | 33 | Tennis Ball | "tb has REALLY big hits, so with just 6 hits, [prize fighter] is in orange" | Attack (jab) (jab), Finisher (fin) | FAST POKE / FINISHER | praised | 111 / 847 / 5 (rank 1+12) |
| 42 | 35 | prize fighter | "has a REALLY high knockback down-tilt", used for both kills | (fighter not in this analysis) | TRUE KILLER | praised | not simulated |
| 43 | 35 | Goo | PoTM "finisher into a smash" | (fighter not in this analysis) | FINISHER | praised | not simulated |
| 44 | 37 | Ruby | PoTM "uses her finisher to bait gelatin into a bad landing spot" | Refracting Prism (fin) | FINISHER | praised | 27 / 118 / 3 (rank 5) |
| 45 | 38 | Bow | PoTM "used her finisher to send the combat onto the other ledge" | (fighter not in this analysis) | FINISHER | praised | not simulated |
| 46 | 38 | Money | EoTM "money keeps misuising the finisher" | Piggy Bank, Compound Interest (fin) | FINISHER | criticised | 18 / 0 / 0 (rank 15) |
| 47 | 42 | Toothpaste | "bait trap into the finisher" and "hit into a trap into a hit into a finisher into a stock" | Root Trap (dn), Squeeze Rocket (fin) | TRAP/MINE / FINISHER | praised | 101 / 860 / 13 (rank 8+1) |
| 48 | 42 | Grassy | "grassy doing a blitzkrieg" and "WHAT A FINISHER BY GRASSY" | (fighter not in this analysis) | FINISHER | praised | not simulated |
| 49 | 43 | Tapey | "tapeys strong hits took a stock early" | Solo Track (smash), Attack (jab) (jab) | PROJECTILE / FAST POKE | praised | 44 / 602 / 10 (rank 1+2) |
| 50 | 43 | Toothpaste | design note: Squeeze Rocket "can charge it during hitstun and release within a frame ... inhuman timings" | Squeeze Rocket (fin) | FINISHER | criticised | 91 / 830 / 13 (rank 1) |
| 51 | 44 | Pen | "pen's finisher putting in the work!" | (fighter not in this analysis) | FINISHER | praised | not simulated |
| 52 | 50 | Yin-Yang | the owner: the smash "can ko at 24 percent if used right" | The Right Goal (smash) | MOBILITY/DASH ATTACK | praised | 5 / 72 / 2 (rank 4) |
| 53 | T4 | any | Tactic 4 "Burn the counter, then go in" (CPU counters on any swing) | (fighter not in this analysis) | COUNTER | named | not simulated |
| 54 | T3 | any | Tactic 3 "Traps are free hits" (cups #3, #6, #8, #11, #13) | (fighter not in this analysis) | TRAP/MINE | praised | not simulated |
| 55 | T5 | any | Tactic 5 "Reach beats speed" (a jab a little longer than theirs wins every trade) | (fighter not in this analysis) | FAST POKE | praised | not simulated |
| 56 | T2 | any | Tactic 2 "Bait the punish" (a slow, obvious move at the edge of reach) | (fighter not in this analysis) | READ KILLER | praised | not simulated |
| 57 | T6 | any | Tactic 6 "Dash fighters near the edge" (Leafy Sprint kamikaze) | (fighter not in this analysis) | MOBILITY/DASH ATTACK | criticised | not simulated |
| 58 | O1 | Toothpaste | obs. 2026-10-29: "toothpaste uses her full kit more than any other fighter I have seen" | Paste Trap (sp), Teleport (up), Root Trap (dn), Squeeze Rocket (fin), Whole Tube (smash) | TRAP/MINE / RECOVERY / FINISHER | praised | 197 / 1595 / 13 (rank 3+7+8+1+5) |
| 59 | O2 | Cake | obs. 2026-10-29: "the only fighter who took a stock ... is cake" (later corrected; the empowered-jab note stands) | ...and Eat It Too (up), Attack (jab) (jab) | SELF-BUFF / FAST POKE | named | 85 / 363 / 2 (rank 5+1) |

**Owner-praised categories, counted by call-out** (a call-out with moves in two categories counts once in each), next to what the simulation ranks them (rank out of 24 categories):

| Category | Praised call-outs | Criticised | Named | Sim damage share (rank of 24) | Sim KO share (rank) | KOs per 100 uses |
|---|---|---|---|---|---|---|
| FINISHER | 21 | 4 | 0 | 8.3% (3) | 13.2% (3) | 5.3 |
| TRAP/MINE | 9 | 1 | 0 | 2.8% (7) | 0.3% (17) | 0.5 |
| PROJECTILE | 6 | 1 | 0 | 22.3% (2) | 14.8% (2) | 3.4 |
| FAST POKE | 6 | 0 | 1 | 29.0% (1) | 24.9% (1) | 4.4 |
| MOBILITY/DASH ATTACK | 3 | 3 | 0 | 5.7% (6) | 10.8% (5) | 19.6 |
| SPIKE/METEOR | 3 | 0 | 0 | 2.5% (8) | 2.5% (8) | 2.2 |
| RECOVERY | 2 | 0 | 0 | 1.4% (13) | 0.9% (14) | 1.1 |
| ZONING WALL | 2 | 0 | 0 | 1.0% (15) | 0.0% (19) | 0.0 |
| BURST | 2 | 0 | 0 | 1.8% (12) | 2.5% (9) | 12.7 |
| READ KILLER | 2 | 0 | 0 | 0.4% (18) | 0.3% (18) | 5.9 |
| COUNTER | 1 | 1 | 1 | 0.3% (19) | 1.2% (13) | 12.9 |
| TRUE KILLER | 1 | 0 | 0 | 2.4% (9) | 3.7% (7) | 2.6 |
| SELF-BUFF | 1 | 0 | 1 | 0.8% (17) | 0.9% (15) | 1.3 |
| PULL | 1 | 0 | 0 | 2.2% (10) | 1.2% (12) | 2.0 |
| MULTI-HIT | 1 | 0 | 0 | 6.8% (5) | 5.2% (6) | 3.3 |
| SKY DROP | 0 | 0 | 1 | 1.1% (14) | 1.5% (11) | 3.5 |

The owner praised finishers by a wide margin (21 of 46 praising call-outs, nearly half), then traps (9), projectiles (6) and jabs/pokes (6). The simulation orders the same categories differently: pokes, projectiles, finishers, combo starters.

### 4b. The simulation

**Set-up.** 30 four-fighter free-for-alls (3 stocks, Expert CPU, items off as in the cups after #14, Goiky Field), run in the jsdom harness at BelowNormal priority, about 2-3 s each. Lineups were shuffled so every one of the 31 fighters appears 3 or 4 times (120 fighter-slots). 29 matches ended with one survivor, 1 hit the 9,000-frame cap; about 196,000 frames (54 minutes of game time) in all. The Final Smash never happened (it needs a Smash Ball item).

**Instrumentation.** In the page I wrapped the game's move entry points (`doAttack` = jab, `mvAttack` = tilts and aerials, `fireSpecial` split into neutral/up/down by the held key, `fireSmash`, `doAttackSpecial` = finisher, `mvGrabStart`, plus the old CPU fallbacks `doGroundMove` and `doUpTilt`) to count uses and to tag the fighter with its current move. `applyHit` was wrapped to add up hits and damage per attacker and move; a one-line patch of the source text gives every projectile (shots, traps, mines) the tag of the move that launched it. A KO is credited to the move of the last hit on the victim within 5 seconds (else "self"). Status starts (rooted, frozen, controls scrambled, hitstun of 30 frames or more) are counted on the frame they begin and credited to a hit in the 12 frames before. The tally: 8,797 attributed move uses, 44,134 damage, 325 KOs (1 unattributed, 6 damage unattributed).

**By category.** Share of damage is per category over the 24; "uses" counts a press, "hits" counts landed hit events (a multi-hit move counts each hit).

| Category | Moves in catalog | Uses (share) | Damage (share) | KOs (share) | Damage per use | KOs per 100 uses | Root starts | Freeze starts | Scramble starts | Long-stun starts (hitstun 30+) |
|---|---|---|---|---|---|---|---|---|---|---|
| FAST POKE | 38 | 1830 (20.8%) | 12807 (29.0%) | 81 (24.9%) | 7.0 | 4.4 | 10 | 1 | 0 | 34 |
| PROJECTILE | 28 | 1422 (16.2%) | 9859 (22.3%) | 48 (14.8%) | 6.9 | 3.4 | 63 | 15 | 0 | 77 |
| FINISHER | 31 | 810 (9.2%) | 3665 (8.3%) | 43 (13.2%) | 4.5 | 5.3 | 24 | 0 | 0 | 1 |
| COMBO STARTER | 94 | 1126 (12.8%) | 3580 (8.1%) | 42 (12.9%) | 3.2 | 3.7 | 22 | 2 | 25 | 365 |
| MULTI-HIT | 35 | 513 (5.8%) | 3004 (6.8%) | 17 (5.2%) | 5.9 | 3.3 | 6 | 5 | 17 | 5 |
| MOBILITY/DASH ATTACK | 11 | 179 (2.0%) | 2501 (5.7%) | 35 (10.8%) | 14.0 | 19.6 | 0 | 1 | 0 | 27 |
| TRAP/MINE | 11 | 221 (2.5%) | 1217 (2.8%) | 1 (0.3%) | 5.5 | 0.5 | 70 | 5 | 0 | 6 |
| SPIKE/METEOR | 34 | 359 (4.1%) | 1081 (2.5%) | 8 (2.5%) | 3.0 | 2.2 | 10 | 0 | 0 | 4 |
| TRUE KILLER | 27 | 453 (5.1%) | 1043 (2.4%) | 12 (3.7%) | 2.3 | 2.6 | 3 | 0 | 0 | 0 |
| PULL | 8 | 196 (2.2%) | 967 (2.2%) | 4 (1.2%) | 4.9 | 2.0 | 15 | 0 | 0 | 11 |
| SPACING POKE | 23 | 401 (4.6%) | 892 (2.0%) | 2 (0.6%) | 2.2 | 0.5 | 3 | 1 | 0 | 49 |
| BURST | 8 | 63 (0.7%) | 788 (1.8%) | 8 (2.5%) | 12.5 | 12.7 | 0 | 3 | 0 | 12 |
| RECOVERY | 11 | 277 (3.1%) | 616 (1.4%) | 3 (0.9%) | 2.2 | 1.1 | 0 | 0 | 0 | 5 |
| SKY DROP | 4 | 141 (1.6%) | 478 (1.1%) | 5 (1.5%) | 3.4 | 3.5 | 0 | 0 | 0 | 2 |
| ZONING WALL | 3 | 116 (1.3%) | 459 (1.0%) | 0 (0.0%) | 4.0 | 0.0 | 0 | 0 | 0 | 0 |
| COMMAND GRAB/GRAB | 1 | 188 (2.1%) | 379 (0.9%) | 8 (2.5%) | 2.0 | 4.3 | 1 | 0 | 0 | 6 |
| SELF-BUFF | 10 | 234 (2.7%) | 332 (0.8%) | 3 (0.9%) | 1.4 | 1.3 | 3 | 0 | 0 | 2 |
| READ KILLER | 3 | 17 (0.2%) | 161 (0.4%) | 1 (0.3%) | 9.5 | 5.9 | 0 | 0 | 0 | 4 |
| COUNTER | 4 | 31 (0.4%) | 114 (0.3%) | 4 (1.2%) | 3.7 | 12.9 | 0 | 0 | 0 | 1 |
| ARMOURED/INVINCIBLE STARTUP | 8 | 125 (1.4%) | 88 (0.2%) | 0 (0.0%) | 0.7 | 0.0 | 0 | 0 | 0 | 1 |
| PIN/HOLD | 1 | 27 (0.3%) | 46 (0.1%) | 0 (0.0%) | 1.7 | 0.0 | 8 | 0 | 0 | 0 |
| FREEZE/STUN | 3 | 54 (0.6%) | 43 (0.1%) | 0 (0.0%) | 0.8 | 0.0 | 0 | 0 | 8 | 0 |
| HEAL/RESOURCE | 3 | 14 (0.2%) | 3 (0.0%) | 0 (0.0%) | 0.3 | 0.0 | 0 | 0 | 0 | 0 |

**Replication check.** The same 30 lineups and seeds were run three times (the page is not bit-reproducible, so results differ). Damage shares are stable to about 2 points; KO shares are not:

| Category | Damage share, run 1 / 2 / 3 | KO share, run 1 / 2 / 3 |
|---|---|---|
| FAST POKE | 30.4 / 31.1 / 29.0 | 21.8 / 24.8 / 24.9 |
| PROJECTILE | 20.7 / 22.0 / 22.3 | 12.9 / 18.9 / 14.8 |
| FINISHER | 8.3 / 9.0 / 8.3 | 13.2 / 13.3 / 13.2 |
| COMBO STARTER | 7.9 / 7.7 / 8.1 | 12.3 / 14.6 / 12.9 |
| MOBILITY/DASH ATTACK | 6.1 / 4.8 / 5.7 | 13.8 / 7.1 / 10.8 |
| TRAP/MINE | 2.4 / 2.3 / 2.8 | 0.3 / 0.9 / 0.3 |

The ordering poke > projectile > finisher, the finisher's 13% of KOs, the dash attack's disproportionate KOs and the traps' near-zero KOs held in all three runs. Everything below uses run 3 (the only run that also recorded status starts). Small per-move numbers (a few KOs) move a lot between runs; individual-move claims below are marked when they did not repeat.

**By fighter.** The move that dealt the most damage and the move that caused the most KOs, per fighter, with how many of the 14 move slots (jab, up tilt, down tilt, five aerials, three specials, smash, finisher, grab) the CPU used at all:

| Fighter | Group | Top damage move (share of the fighter's damage) | Most KOs (count) | Moves used | Sim record |
|---|---|---|---|---|---|
| Toothpaste | repeat | Squeeze Rocket (finisher) 33% | Squeeze Rocket (finisher) 13 | 14 of 14 | 4 matches, 3 wins, 15 KOs, 2525 dmg |
| Puffball | repeat | Attack (jab) (projectile) 73% | Meteor Puff (spike/meteor) 5 | 9 of 14 | 4 matches, 0 wins, 9 KOs, 1655 dmg |
| Tennis Ball | repeat | Attack (jab) (fast poke) 51% | Attack (jab) (fast poke) 5 | 14 of 14 | 4 matches, 1 wins, 12 KOs, 1652 dmg |
| Gelatin | repeat | Attack (jab) (multi-hit) 45% | Attack (jab) (multi-hit) 7 | 14 of 14 | 4 matches, 2 wins, 10 KOs, 1144 dmg |
| Coiny | repeat | Attack (jab) (fast poke) 56% | Slap Cyclone (mobility/dash attack) 2 | 14 of 14 | 4 matches, 0 wins, 6 KOs, 870 dmg |
| Snowball | repeat | Attack (jab) (fast poke) 36% | Attack (jab) (fast poke) 6 | 14 of 14 | 4 matches, 1 wins, 16 KOs, 1817 dmg |
| Lightning | repeat | Chain Bolt (projectile) 33% | Arc Cascade (mobility/dash attack) 4 | 14 of 14 | 4 matches, 1 wins, 7 KOs, 1392 dmg |
| Lightbulb | single | Attack (jab) (fast poke) 30% | Spotlight (projectile) 5 | 14 of 14 | 4 matches, 1 wins, 9 KOs, 1374 dmg |
| Money | single | Attack (jab) (fast poke) 38% | Attack (jab) (fast poke) 2 | 13 of 14 | 4 matches, 0 wins, 4 KOs, 877 dmg |
| Cake | single | Attack (jab) (fast poke) 30% | Attack (jab) (fast poke) 2 | 14 of 14 | 4 matches, 0 wins, 5 KOs, 1029 dmg |
| Tapey | single | Solo Track (projectile) 47% | Solo Track (projectile) 8 | 13 of 14 | 3 matches, 1 wins, 10 KOs, 853 dmg |
| Magnet | single | Attack (jab) (fast poke) 43% | Attack (jab) (fast poke) 11 | 14 of 14 | 4 matches, 3 wins, 19 KOs, 1508 dmg |
| Blueberry | single | Attack (jab) (fast poke) 42% | Attack (jab) (fast poke) 7 | 13 of 14 | 4 matches, 0 wins, 13 KOs, 1215 dmg |
| Rose | single | Attack (jab) (fast poke) 47% | Attack (jab) (fast poke) 9 | 14 of 14 | 4 matches, 2 wins, 14 KOs, 1607 dmg |
| Bomb | single | Collision (mobility/dash attack) 36% | Collision (mobility/dash attack) 11 | 13 of 14 | 3 matches, 3 wins, 20 KOs, 1420 dmg |
| Barf Bag | single | Attack (jab) (multi-hit) 55% | Attack (jab) (multi-hit) 5 | 14 of 14 | 4 matches, 1 wins, 12 KOs, 1478 dmg |
| Golf Ball | single | Attack (jab) (fast poke) 31% | Zap Shooter (projectile) 4 | 14 of 14 | 3 matches, 0 wins, 11 KOs, 834 dmg |
| David | single | Attack (jab) (fast poke) 36% | Attack (jab) (fast poke) 4 | 14 of 14 | 4 matches, 1 wins, 11 KOs, 1535 dmg |
| Lollipop | single | Attack (jab) (fast poke) 40% | Sugar Rush Flurry (finisher) 4 | 14 of 14 | 4 matches, 1 wins, 9 KOs, 1555 dmg |
| Leafy | single | BFDIA Sprint (mobility/dash attack) 38% | Shadow Blitz (mobility/dash attack) 6 | 14 of 14 | 4 matches, 1 wins, 16 KOs, 1040 dmg |
| Blocky | single | Attack (jab) (fast poke) 52% | Attack (jab) (fast poke) 4 | 14 of 14 | 4 matches, 0 wins, 11 KOs, 1360 dmg |
| Tree | single | Attack (jab) (fast poke) 32% | Timber (sky drop) 2 | 14 of 14 | 4 matches, 0 wins, 6 KOs, 1011 dmg |
| Fries | single | Attack (jab) (fast poke) 36% | Attack (jab) (fast poke) 6 | 14 of 14 | 4 matches, 1 wins, 11 KOs, 1981 dmg |
| Ruby | single | Attack (jab) (projectile) 54% | Refracting Prism (finisher) 3 | 12 of 14 | 4 matches, 1 wins, 9 KOs, 2207 dmg |
| Pencil | single | Supervan (projectile) 48% | Supervan Ram (projectile) 5 | 14 of 14 | 4 matches, 1 wins, 12 KOs, 3014 dmg |
| Teddy Bear | control | Attack (jab) (fast poke) 32% | Stuffing Uppercut (combo starter) 4 | 14 of 14 | 4 matches, 0 wins, 6 KOs, 1072 dmg |
| Yin-Yang | control | Yang Throws Yin (projectile) 50% | Yang Throws Yin (projectile) 3 | 13 of 14 | 3 matches, 0 wins, 7 KOs, 1089 dmg |
| Knife | control | Attack (jab) (fast poke) 35% | Shove Off the Platform (finisher) 3 | 13 of 14 | 4 matches, 1 wins, 9 KOs, 1014 dmg |
| Book | control | Attack (jab) (fast poke) 48% | Attack (jab) (fast poke) 4 | 13 of 14 | 4 matches, 1 wins, 10 KOs, 1094 dmg |
| Taco | control | Attack (jab) (fast poke) 33% | Combo Platter (projectile) 3 | 14 of 14 | 4 matches, 1 wins, 9 KOs, 1470 dmg |
| Basketball | control | Attack (jab) (fast poke) 32% | Bank Shot, Shot Clock (finisher) 2 | 14 of 14 | 4 matches, 1 wins, 8 KOs, 1578 dmg |

**Group results in the simulation.** Wins per slot: repeat winners 8 of 28 (29%), single winners 17 of 69 (25%), controls 4 of 23 (17%); 25% is what chance gives in a four-fighter match. KOs per slot: 2.7, 2.9, 2.1. The groups are not separated at this sample size (a gap of 8 points on 23 slots is well inside the noise), so the simulation neither supports nor contradicts "winners have better kits".

**Pins and freezes.** Status starts per category (table above): the simulation saw 433 root starts, 33 freeze starts and 57 control scrambles in total. Trap and mine moves start a root on 70 of their 221 uses (0.32 per use, the highest rate of any large category; Toothpaste's Paste Trap alone started 47 roots), but trap moves caused 1 KO. So a root is landing; what it is worth is what comes after it, which my counter credits to the follow-up move. That fits the owner's picture of traps as set-up (#3, #11, #19, #42), and it is why "trap" must not be read as weak just because it has no KOs of its own. I did not test the follow-up chain itself.

### 4c. Comparing the owner's words with the simulation

**Praised moves.** Of the 28 praised call-outs that map to a move: 14 are the fighter's top damage move in the simulation, 19 are in its top three, and 23 scored at least one KO. The owner mostly praises moves that the CPU also uses constantly: a fighter's best damage move is the one a viewer sees most, which is partly why they agree.

**Where they agree**
- *Finishers* (owner: 21 praising call-outs; simulation: #3 for damage, #3 for KOs, best KOs per use among the big categories). Toothpaste's Squeeze Rocket is the clearest case: the owner's "best finisher" (#3, #20), "trap into trap into dash into stock" (#11), "bait trap into the finisher" (#42); the simulation makes it 33% of her damage and 13 of her 15 KOs. Also in line: Lightbulb's finisher breaking a combo (#30) and David's Shoulder Toss on a whiffed up-air (#16) did land (David's finisher is 2nd in his damage, 3 KOs).
- *The criticised finishers are the ones the CPU wastes.* Money's finisher (#38 "keeps misusing"): 18 uses, 0 damage, 0 KOs. Puffball's Grow (#18 "for no reason, missed"): 15 uses, 58 damage, 0 KOs. Pencil's ramp dive (#22 missed): 30 uses, 114 damage, 1 KO (the finisher lands on average 0.61 hits per use across all fighters: 495 hits from 810 uses).
- *Jabs and long shots as a fighter's main damage* (#2 spit, #8 Gem Bolt, #13 and #33 Tennis Ball's hits, #22 the van, #30 Magnet): the top damage move for Puffball (73% of her damage), Tennis Ball (51%), Ruby, Magnet, Lightning (Chain Bolt) and Pencil (the van); Magnet's jab is the top KO move of the sample after the Squeeze Rocket (11 KOs).
- *Bomb "wins fast"* (#31): Collision is his top move, 11 KOs from 30 uses.

**Where the owner's best moves rank low in the simulation, and why**
- *Traps* (9 praising call-outs): 0.3% of KOs. Why: their value is the root and what follows it (see above), and my counter credits that KO to the follow-up move, not to the trap. Toothpaste's special (Paste Trap) was the 3rd damage move (594) and her down-special trap the 8th; neither got a KO of its own.
- *Counters and baits* (Gaty countering projectiles #21, Coiny's counter as EoTM #6, tactic 4): counters are 0.4% of uses and 1.2% of KOs; bait plays (Ruby's finisher as bait #37, Golf Ball's puddle #14, Pillow's hammer #9 and #32) are by definition a read the CPU only makes by chance. The simulation cannot see a bait.
- *Golf Ball's Water Hazard puddle (#14 PoTM)*: 26 uses, 57 damage, 1 KO. A play of the match, not a strong damage move.
- *Lightning's finisher "best move" (#1)*: 31 uses, 47 damage, 0 KOs. Her damage comes from Chain Bolt and Floor Trap; "not kill move, best move" in the owner's own words fits chip damage that this sample does not show.
- *Lightbulb's finisher (#20, #30)*: 21 uses, 102 damage, 0 KOs, 5th of her moves; her smash beam is the real earner (15 uses, 258 damage, 5 KOs).

**Moves the simulation rates highly that the owner never mentioned**
- *Jabs of Rose (761 damage, 9 KOs), Blueberry (7 KOs), Snowball (6), Fries (6) and Barf Bag (815 damage)*. The CPU leans on the jab for every fighter (the owner's own #10 note and the lead's reading), so the jab slot is 38% of all damage. No call-out names them because a jab never makes a play of the match.
- *Dash smashes and lunges* (Leafy's Shadow Blitz, 6 KOs from 5 uses; 4 KOs in the previous run, so it repeats) and *Pencil's Supervan Ram smash* (5 KOs from 19 uses; one run only).
- *Combo starters.* 13% of KOs, never praised by name. Mostly template up tilts and up airs that pop a foe toward the top blast zone (up air 9 KOs, up tilt 24 KOs in this run). I did not check whether those are combos or plain launches; **not verified**.

**Where the owner criticised and the simulation agrees or not.** Dash attacks (Leafy's Sprint, Snowball's tackle, tactic 6): the owner is describing a suicide risk (running off the ledge), which my KO credit (last hit within 5 s) cannot see; as damage and KOs these moves are the best per use. Lightning's failed ledgeguard (#16): Chain Bolt is her top damage move (458, 2 KOs), so the failure is the CPU's positioning, not the move. Toothpaste's Squeeze Rocket (design note #43: "inhuman timings" out of hitstun): a complaint about how it is used, not about its output, but the output is the highest in her kit, so a change would target the rocket's start (a hitstun escape, already cut to a delay `FIN_HS_DELAY` on 2026-11-04) rather than its damage.

**Honest limits of the comparison.** The owner's words are about single plays in 1v1 cup finals; the simulation counts every use in 4-fighter matches; "praised" moves are mapped by me from the lead's notes; 28 praised moves is a small sample; damage and KOs do not value bait, spacing, stage control or threat.

## 5. Part 3: totals by fighter

Counted on the **six kit moves** of each fighter (jab, neutral, up and down special, smash, finisher), because the seven tilt/aerial moves and the grab come from one shared template per archetype and look nearly the same for everyone (they are shown separately). One move can carry several effects, so a row adds up to more than 6. Not counted: forward tilts and side specials (inactive), the Final Smash, and the grab and four throws (identical for everyone). "kill" = kill-capable at 100% damage or less, from the launch rule or from a KO seen in the simulation at 100% or less (so it is partly simulation-derived). "grab" counts only special/finisher grabs, not the shared X+C grab. Group means use 7 repeat winners, 18 single winners, 25 winners together and 6 controls. The same numbers are in `move-totals-by-fighter.csv`.

### Effects per fighter, kit moves (jab, 3 specials, smash, finisher = 6 moves)

| Fighter | Group | stun | pin | pull | freeze | knockdown | proj | trap | multi | arm/inv | buff/heal | mobil | spike | grab | kill | total |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Toothpaste | repeat | 0 | 3 | 0 | 1 | 0 | 2 | 3 | 1 | 1 | 0 | 2 | 0 | 0 | 1 | 14 |
| Puffball | repeat | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 1 | 0 | 4 | 3 | 1 | 0 | 2 | 13 |
| Tennis Ball | repeat | 2 | 0 | 0 | 0 | 1 | 4 | 2 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 11 |
| Gelatin | repeat | 0 | 0 | 0 | 3 | 0 | 3 | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 10 |
| Coiny | repeat | 2 | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 6 |
| Snowball | repeat | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 2 | 0 | 1 | 0 | 1 | 1 | 7 |
| Lightning | repeat | 1 | 0 | 0 | 0 | 0 | 2 | 1 | 2 | 1 | 0 | 2 | 0 | 0 | 1 | 10 |
| Lightbulb | single | 3 | 0 | 0 | 0 | 0 | 3 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 1 | 10 |
| Money | single | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 2 | 2 | 0 | 0 | 0 | 0 | 6 |
| Cake | single | 0 | 0 | 1 | 0 | 0 | 2 | 1 | 0 | 0 | 5 | 0 | 0 | 0 | 1 | 10 |
| Tapey | single | 2 | 0 | 1 | 0 | 1 | 2 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 2 | 10 |
| Magnet | single | 3 | 1 | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 3 | 12 |
| Blueberry | single | 0 | 0 | 0 | 0 | 3 | 1 | 2 | 0 | 2 | 2 | 0 | 0 | 1 | 1 | 12 |
| Rose | single | 0 | 1 | 3 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 6 |
| Bomb | single | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 2 | 0 | 1 | 0 | 0 | 4 | 10 |
| Barf Bag | single | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 1 | 0 | 0 | 0 | 1 | 4 |
| Golf Ball | single | 1 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 1 | 1 | 0 | 1 | 0 | 1 | 7 |
| David | single | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 0 | 1 | 2 | 6 |
| Lollipop | single | 0 | 3 | 0 | 0 | 0 | 1 | 2 | 2 | 0 | 0 | 1 | 0 | 0 | 0 | 9 |
| Leafy | single | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 2 | 0 | 3 | 0 | 0 | 3 | 10 |
| Blocky | single | 0 | 0 | 0 | 0 | 2 | 1 | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 |
| Tree | single | 0 | 1 | 0 | 0 | 0 | 1 | 1 | 0 | 1 | 0 | 0 | 1 | 1 | 1 | 7 |
| Fries | single | 0 | 1 | 0 | 0 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 5 |
| Ruby | single | 0 | 0 | 0 | 0 | 0 | 4 | 2 | 0 | 1 | 1 | 1 | 0 | 0 | 0 | 9 |
| Pencil | single | 0 | 0 | 0 | 0 | 2 | 3 | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 1 | 8 |
| Teddy Bear | control | 0 | 0 | 1 | 0 | 2 | 2 | 0 | 1 | 0 | 0 | 2 | 0 | 0 | 1 | 9 |
| Yin-Yang | control | 0 | 0 | 0 | 0 | 3 | 1 | 0 | 0 | 1 | 1 | 1 | 0 | 0 | 1 | 8 |
| Knife | control | 1 | 0 | 1 | 0 | 0 | 1 | 1 | 0 | 1 | 0 | 3 | 0 | 0 | 1 | 9 |
| Book | control | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 0 | 1 | 1 | 1 | 0 | 0 | 1 | 6 |
| Taco | control | 1 | 1 | 1 | 0 | 0 | 2 | 2 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 8 |
| Basketball | control | 1 | 0 | 0 | 0 | 1 | 2 | 1 | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 7 |

**Mean per fighter (kit moves)**

| Group (n) | stun | pin | pull | freeze | knockdown | proj | trap | multi | arm/inv | buff/heal | mobil | spike | grab | kill | total |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| repeat (7) | 0.71 | 0.57 | 0.14 | 0.71 | 0.43 | 1.71 | 1.14 | 0.71 | 0.57 | 0.71 | 1.29 | 0.14 | 0.14 | 1.14 | 10.1 |
| single (18) | 0.61 | 0.39 | 0.44 | 0.00 | 0.50 | 1.33 | 0.89 | 0.33 | 0.78 | 0.83 | 0.50 | 0.11 | 0.17 | 1.22 | 8.1 |
| winners (25) | 0.64 | 0.44 | 0.36 | 0.20 | 0.48 | 1.44 | 0.96 | 0.44 | 0.72 | 0.80 | 0.72 | 0.12 | 0.16 | 1.20 | 8.7 |
| control (6) | 0.50 | 0.17 | 0.50 | 0.00 | 1.17 | 1.33 | 0.83 | 0.17 | 0.50 | 0.50 | 1.50 | 0.00 | 0.00 | 0.67 | 7.8 |
| winners minus control | +0.14 | +0.27 | -0.14 | +0.20 | -0.69 | +0.11 | +0.13 | +0.27 | +0.22 | +0.30 | -0.78 | +0.12 | +0.16 | +0.53 | |

### Effects per fighter, template moves (up/down tilt, 5 aerials = 7 moves; same shapes for everyone)

| Fighter | Group | stun | pin | pull | freeze | knockdown | proj | trap | multi | arm/inv | buff/heal | mobil | spike | grab | kill |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Toothpaste | repeat | 0 | 2 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 |
| Puffball | repeat | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
| Tennis Ball | repeat | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 |
| Gelatin | repeat | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 |
| Coiny | repeat | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 2 | 0 | 0 | 0 | 1 | 0 | 0 |
| Snowball | repeat | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |
| Lightning | repeat | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 |
| Lightbulb | single | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 |
| Money | single | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 |
| Cake | single | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |
| Tapey | single | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |
| Magnet | single | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 2 |
| Blueberry | single | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |
| Rose | single | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 |
| Bomb | single | 0 | 0 | 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |
| Barf Bag | single | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 |
| Golf Ball | single | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |
| David | single | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |
| Lollipop | single | 0 | 2 | 1 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |
| Leafy | single | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |
| Blocky | single | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |
| Tree | single | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |
| Fries | single | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 |
| Ruby | single | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 |
| Pencil | single | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |
| Teddy Bear | control | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |
| Yin-Yang | control | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |
| Knife | control | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |
| Book | control | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 0 |
| Taco | control | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 1 |
| Basketball | control | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 | 2 |

### Primary-category counts per fighter, kit moves (6 each)

| Fighter | Group | FP | MH | PR | TM | ZW | PU | PH | GR | FZ | AR | CT | MD | RC | SB | HR | SM | BU | SD | RK | CS | SP | FN |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Toothpaste | repeat |  | 1 |  | 3 |  |  |  |  |  |  |  |  | 1 |  |  |  |  |  |  |  |  | 1 |
| Puffball | repeat |  |  | 1 |  |  |  |  |  |  |  |  |  | 2 | 1 |  | 1 |  |  |  |  |  | 1 |
| Tennis Ball | repeat | 1 |  | 3 |  |  |  |  |  |  |  |  |  |  |  | 1 |  |  |  |  |  |  | 1 |
| Gelatin | repeat |  | 1 | 2 | 2 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 1 |
| Coiny | repeat | 2 |  |  |  |  |  |  |  |  |  | 1 | 1 |  |  |  |  |  |  |  | 1 |  | 1 |
| Snowball | repeat | 1 |  |  |  |  |  |  |  |  | 1 |  | 1 |  |  |  |  | 1 |  |  | 1 |  | 1 |
| Lightning | repeat | 1 |  | 1 | 1 |  |  |  |  |  |  |  | 1 | 1 |  |  |  |  |  |  |  |  | 1 |
| Lightbulb | single | 1 |  | 2 |  |  |  |  |  | 1 |  |  |  | 1 |  |  |  |  |  |  |  |  | 1 |
| Money | single | 1 |  | 1 |  |  |  |  |  |  |  |  |  | 1 | 1 |  |  | 1 |  |  |  |  | 1 |
| Cake | single | 1 |  | 1 |  |  | 1 |  |  |  |  |  |  |  | 1 | 1 |  |  |  |  |  |  | 1 |
| Tapey | single | 1 |  | 2 |  |  |  |  |  |  |  |  |  | 1 |  | 1 |  |  |  |  |  |  | 1 |
| Magnet | single | 1 |  |  |  |  | 2 |  |  |  |  |  |  |  | 1 |  |  | 1 |  |  |  |  | 1 |
| Blueberry | single | 1 |  |  | 1 |  |  |  | 1 |  | 1 |  |  |  | 1 |  |  |  |  |  |  |  | 1 |
| Rose | single | 1 |  |  |  |  | 2 | 1 |  |  |  | 1 |  |  |  |  |  |  |  |  |  |  | 1 |
| Bomb | single | 1 | 1 |  |  |  |  |  |  |  |  |  | 1 |  |  |  |  | 2 |  |  |  |  | 1 |
| Barf Bag | single |  | 1 |  |  | 1 |  |  |  | 2 |  |  |  |  |  |  |  | 1 |  |  |  |  | 1 |
| Golf Ball | single | 1 |  | 1 |  |  |  |  |  |  |  | 1 |  |  | 1 |  | 1 |  |  |  |  |  | 1 |
| David | single | 1 |  |  |  |  |  |  |  |  | 1 |  |  |  | 1 |  |  | 1 |  | 1 |  |  | 1 |
| Lollipop | single | 1 | 1 | 1 | 2 |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | 1 |
| Leafy | single | 1 |  |  |  |  |  |  |  |  |  | 1 | 2 | 1 |  |  |  |  |  |  |  |  | 1 |
| Blocky | single | 1 |  |  | 1 |  |  |  |  |  |  |  |  |  |  |  |  |  | 3 |  |  |  | 1 |
| Tree | single | 1 |  |  |  |  |  |  |  |  | 1 |  |  |  |  |  | 1 |  | 1 | 1 |  |  | 1 |
| Fries | single | 1 |  | 2 |  | 1 |  |  |  |  |  |  |  |  |  |  |  | 1 |  |  |  |  | 1 |
| Ruby | single |  |  | 2 |  | 1 |  |  |  |  | 1 |  |  |  | 1 |  |  |  |  |  |  |  | 1 |
| Pencil | single | 1 |  | 3 |  |  |  |  |  |  | 1 |  |  |  |  |  |  |  |  |  |  |  | 1 |
| Teddy Bear | control | 1 | 1 | 1 |  |  |  |  |  |  |  |  | 1 |  |  |  |  |  |  | 1 |  |  | 1 |
| Yin-Yang | control | 1 |  | 1 |  |  |  |  |  |  |  |  | 1 | 1 | 1 |  |  |  |  |  |  |  | 1 |
| Knife | control | 1 |  | 1 |  |  |  |  |  |  | 1 |  | 1 |  |  |  |  |  |  |  |  | 1 | 1 |
| Book | control | 1 |  |  |  |  |  |  |  |  | 1 |  | 1 | 1 | 1 |  |  |  |  |  |  |  | 1 |
| Taco | control | 1 |  | 2 |  |  | 1 |  |  |  |  |  |  | 1 |  |  |  |  |  |  |  |  | 1 |
| Basketball | control | 1 |  | 1 | 1 |  |  |  |  |  |  |  | 1 |  |  |  |  |  |  |  | 1 |  | 1 |

**Mean per fighter, kit moves**

| Group | FP | MH | PR | TM | ZW | PU | PH | GR | FZ | AR | CT | MD | RC | SB | HR | SM | BU | SD | RK | CS | SP | FN |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| repeat | 0.71 | 0.29 | 1.00 | 0.86 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.14 | 0.14 | 0.43 | 0.57 | 0.14 | 0.14 | 0.14 | 0.14 | 0.00 | 0.00 | 0.29 | 0.00 | 1.00 |
| single | 0.89 | 0.17 | 0.83 | 0.22 | 0.17 | 0.28 | 0.06 | 0.06 | 0.17 | 0.28 | 0.17 | 0.17 | 0.22 | 0.39 | 0.11 | 0.11 | 0.39 | 0.22 | 0.11 | 0.00 | 0.00 | 1.00 |
| winners | 0.84 | 0.20 | 0.88 | 0.40 | 0.12 | 0.20 | 0.04 | 0.04 | 0.12 | 0.24 | 0.16 | 0.24 | 0.32 | 0.32 | 0.12 | 0.12 | 0.32 | 0.16 | 0.08 | 0.08 | 0.00 | 1.00 |
| control | 1.00 | 0.17 | 1.00 | 0.17 | 0.00 | 0.17 | 0.00 | 0.00 | 0.00 | 0.33 | 0.00 | 0.83 | 0.50 | 0.33 | 0.00 | 0.00 | 0.00 | 0.00 | 0.17 | 0.17 | 0.17 | 1.00 |
| winners minus control | -0.16 | +0.03 | -0.12 | +0.23 | +0.12 | +0.03 | +0.04 | +0.04 | +0.12 | -0.09 | +0.16 | -0.59 | -0.18 | -0.01 | +0.12 | +0.12 | +0.32 | +0.16 | -0.09 | -0.09 | -0.17 | +0.00 |

**Share of fighters with at least one such move (kit moves)**

| Effect on at least one kit move | Repeat (7) | Single (18) | Winners (25) | Control (6) |
|---|---|---|---|---|
| stun | 3 (43%) | 6 (33%) | 9 (36%) | 3 (50%) |
| pin / root | 2 (29%) | 5 (28%) | 7 (28%) | 1 (17%) |
| pull | 1 (14%) | 4 (22%) | 5 (20%) | 3 (50%) |
| freeze | 3 (43%) | 0 (0%) | 3 (12%) | 0 (0%) |
| knockdown | 3 (43%) | 5 (28%) | 8 (32%) | 4 (67%) |
| projectile | 5 (71%) | 13 (72%) | 18 (72%) | 5 (83%) |
| trap | 4 (57%) | 12 (67%) | 16 (64%) | 4 (67%) |
| multi-hit | 4 (57%) | 5 (28%) | 9 (36%) | 1 (17%) |
| armour / invulnerable | 3 (43%) | 10 (56%) | 13 (52%) | 3 (50%) |
| buff / heal | 2 (29%) | 9 (50%) | 11 (44%) | 3 (50%) |
| mobility | 5 (71%) | 7 (39%) | 12 (48%) | 5 (83%) |
| pin, pull, freeze or stun (any lock) | 6 (86%) | 11 (61%) | 17 (68%) | 4 (67%) |
| kill-capable at 100% or less | 7 (100%) | 13 (72%) | 20 (80%) | 4 (67%) |

**What separates winners from control (kit moves, mean per fighter).** With only 6 controls a difference of 0.17 is one fighter, so only gaps that show in both the means and the shares are worth noting.
- *Lock effects (pin, pull, freeze, stun):* 1.86 moves per repeat winner, 1.17 per single winner, 0.83 per control. Pin alone: 0.44 winners against 0.17 control; freeze: 0.20 against 0 (Toothpaste, Gelatin, Snowball's smash, all repeat winners); multi-hit: 0.44 against 0.17. 6 of 7 repeat winners have at least one lock move against 4 of 6 controls (86% against 67%), so the gap is mostly in how many, not whether.
- *Kill-capable kit moves:* 2.29 per repeat winner, 1.61 per single winner, 1.17 per control. Partly circular, since a move that KO'd at 100% or less in my matches was flagged, and winners get more KOs.
- *Buff or heal:* 0.80 against 0.50; *armour or invulnerable:* 0.72 against 0.50. Single winners carry these (0.83 and 0.78), repeat winners less (0.71 and 0.57).
- *Mobility (dash, blink, flight):* repeat winners 1.29, single 0.50, **control 1.50**. Controls have *more* dash attacks than winners (MOBILITY/DASH ATTACK 0.83 per control fighter against 0.24 per winner), the opposite of what its simulated KO rate suggests.
- *Knockdown:* 1.17 per control against 0.48 per winner (Yin-Yang 3 moves, Teddy Bear 2, Basketball 1, Book 1: dash and lunge smashes, blink or hop moves that knock down).
- *Equal in all groups:* projectile (1.33 to 1.71) and trap (0.83 to 1.14). The earlier winner-move-types report reached the same verdict on the long-reach shot and the trap.
- *Category counts (all active moves, kit plus template):* winners have more BURST (+0.32 per fighter), TRAP/MINE (+0.23), SKY DROP (+0.16), COUNTER (+0.16) and FAST POKE (+0.28); fewer MOBILITY/DASH (-0.59), SPACING POKE (-0.53, which is the long-reach forward air of the template), RECOVERY (-0.18), COMBO STARTER (-0.17) and TRUE KILLER (-0.16). The template-driven categories (COMBO STARTER, TRUE KILLER, SPACING POKE) differ only because a few fighters' aerials fall on the other side of my thresholds; read them as noise.

**Cross-check with the simulation (section 4).** The simulation agrees on the *direction* for the lock effects only weakly: root and freeze starts are common (433 and 33), but they produce few KOs themselves. It disagrees on mobility: dash attacks are the best killers per use yet a smaller share of winners have one. In the simulation itself, repeat winners won 29% of their slots, single winners 25% and controls 17% (chance is 25%): the same order as the lock-effect counts, but far too few matches to call it a result.

## 6. Ranking: which categories help the most

Three measures per category: **share of simulated damage** and **share of simulated KOs** (run 3, 30 matches), and **winners minus control**, the difference in the mean number of moves of that category per fighter (all active moves: 25 winners against 6 controls). The rank column is the mean of the three ranks (lower is better). KOs per 100 uses is shown for efficiency but is not in the rank.

| Rank | Category | Moves (31 fighters) | Sim damage share (rank) | Sim KO share (rank) | KOs per 100 uses | Winners minus control, moves per fighter (rank) | Mean of the three ranks |
|---|---|---|---|---|---|---|---|
| 1 | FAST POKE | 38 | 29.0% (1) | 24.9% (1) | 4.4 | +0.28 (2) | 1.3 |
| 2 | FINISHER | 31 | 8.3% (3) | 13.2% (3) | 5.3 | +0.00 (13) | 6.3 |
| 3 | PROJECTILE | 28 | 22.3% (2) | 14.8% (2) | 3.4 | -0.12 (18) | 7.3 |
| 4 | SPIKE/METEOR | 34 | 2.5% (8) | 2.5% (8) | 2.2 | +0.12 (6) | 7.3 |
| 5 | BURST | 8 | 1.8% (12) | 2.5% (9) | 12.7 | +0.32 (1) | 7.3 |
| 6 | MULTI-HIT | 35 | 6.8% (5) | 5.2% (6) | 3.3 | -0.05 (15) | 8.7 |
| 7 | TRAP/MINE | 11 | 2.8% (7) | 0.3% (17) | 0.5 | +0.23 (3) | 9.0 |
| 8 | COMBO STARTER | 94 | 8.1% (4) | 12.9% (4) | 3.7 | -0.17 (20) | 9.3 |
| 9 | SKY DROP | 4 | 1.1% (14) | 1.5% (11) | 3.5 | +0.16 (4) | 9.7 |
| 10 | PULL | 8 | 2.2% (10) | 1.2% (12) | 2.0 | +0.11 (10) | 10.7 |
| 11 | MOBILITY/DASH ATTACK | 11 | 5.7% (6) | 10.8% (5) | 19.6 | -0.59 (23) | 11.3 |
| 12 | TRUE KILLER | 27 | 2.4% (9) | 3.7% (7) | 2.6 | -0.16 (19) | 11.7 |
| 13 | COMMAND GRAB/GRAB | 1 | 0.9% (16) | 2.5% (10) | 4.3 | +0.04 (11) | 12.3 |
| 14 | COUNTER | 4 | 0.3% (19) | 1.2% (13) | 12.9 | +0.16 (5) | 12.3 |
| 15 | ZONING WALL | 3 | 1.0% (15) | 0.0% (19) | 0.0 | +0.12 (7) | 13.7 |
| 16 | SELF-BUFF | 10 | 0.8% (17) | 0.9% (15) | 1.3 | -0.01 (14) | 15.3 |
| 17 | RECOVERY | 11 | 1.4% (13) | 0.9% (14) | 1.1 | -0.18 (21) | 16.0 |
| 18 | SPACING POKE | 23 | 2.0% (11) | 0.6% (16) | 0.5 | -0.53 (22) | 16.3 |
| 19 | READ KILLER | 3 | 0.4% (18) | 0.3% (18) | 5.9 | -0.09 (16) | 17.3 |
| 20 | FREEZE/STUN | 3 | 0.1% (22) | 0.0% (22) | 0.0 | +0.12 (8) | 17.3 |
| 21 | PIN/HOLD | 1 | 0.1% (21) | 0.0% (21) | 0.0 | +0.04 (12) | 18.0 |
| 22 | HEAL/RESOURCE | 3 | 0.0% (23) | 0.0% (23) | 0.0 | +0.12 (9) | 18.3 |
| 23 | ARMOURED/INVINCIBLE STARTUP | 8 | 0.2% (20) | 0.0% (20) | 0.0 | -0.09 (17) | 19.0 |

**Reading the ranking.**
- *Solid:* FAST POKE is first on every measure (it is mostly the jab, and the CPU plays every fighter as a jabber). PROJECTILE is second and FINISHER third on damage and KOs; the finisher is the only large category with a KO share clearly above its damage share and use share (13% of KOs from 9% of uses).
- *Efficient but rare:* MOBILITY/DASH ATTACK (11 moves) gets 10.8% of KOs from 2% of uses, and BURST (8 moves) 2.5% of KOs from 0.7% of uses. Few moves, so each is rated on a handful of events.
- *Big but diluted:* COMBO STARTER is the largest category (94 moves, mostly the shared tilts and airs) and holds 12.9% of KOs, but 3.7 KOs per 100 uses is average.
- *Winners-vs-control leaders are small categories* (BURST, TRAP/MINE, SKY DROP, COUNTER: 4 to 11 moves, differences of 0.16 to 0.32 of a move per fighter). Treat their high ranks as a hint, not a result. SPIKE/METEOR sits fourth only because 34 template down airs tilt slightly toward winners.
- *Last:* FREEZE/STUN, PIN/HOLD, HEAL/RESOURCE and ARMOURED/INVINCIBLE STARTUP deal almost no damage and get no KOs; their value (pin into rocket, a heal, armour while a shot lands) is not in these three measures.

**What a change would target, without recommending one.** The finisher is where the sample's KOs concentrate for the repeat winners (Toothpaste's Squeeze Rocket: 13 of her 15 KOs); the jab slot is where the damage is (so a fighter's jab damage, reach or empowered-jab bonus, e.g. Cake's, Puffball's spit, Magnet's, is the number that moves a simulated result most); dash attacks have the highest KO yield per use (Bomb's Collision, Leafy's smash). Clover is balanced and was not touched or analysed.

## 7. What I could not verify, and the limits

- **Startup frames and cooldowns** for specials and finishers: the move cards give damage and reach words only, the timing sits in code that is not tabulated. Only jab (about frame 2), tilts, aerials, throws and the smash (`SMASH_SPEC.at`, charge time) have frame numbers. The CSV says "n/a" there.
- **Human versus CPU.** The owner's finals are CPU versus CPU, as are my matches, but a person's use differs: baits, spacing, traps with a read, finishers at kill range. Damage and KOs do not value those. Where the owner praises a bait or a set-up, "low in the simulation" is not a finding about the move.
- **Match format.** My 30 matches are 4-fighter free-for-alls on Goiky Field, 3 stocks; the owner's finals are 1v1 and the stage is not stated. FFA lets the nearest-foe habit of the CPU spread hits.
- **Sample size and noise.** 120 fighter-slots (3 to 4 per fighter), 325 KOs, and three runs of the same lineups differ (table in 4b). Single-move claims (a few KOs) are weak, and the simulation is not bit-reproducible.
- **Attribution.** A KO is credited to the move of the last hit within 5 seconds, so a root or trap that sets up a rocket gets no KO credit, and a dash that carries its user off the edge shows only the hit that came before. Projectile and trap hits are credited to the move that launched them. Status starts were measured only in the last run.
- **Final Smashes** were never reached (items off). They are in the catalog (with the in-game line) and not counted in any total.
- **Category judgement.** The tilt, aerial and throw categories come from rules on the data and the special, smash and finisher categories from my reading of the cards. Several are judgement calls (for example Golf Ball's Water Hazard as SPIKE/METEOR, Blocky's Block Spawning as SKY DROP, the finishers all as FINISHER with the type in the effects). The CSV lists every assignment.
- **Control group.** The task named six controls; the earlier report used eight (Dora and Bubble are not included here), so figures differ from that report.
- **Inactive moves.** Forward tilts (30 fighters have one) and side specials (25) are present in the data but switched off in the game today. If they are switched on, the totals change.
- **Not done:** the winners were not tested for statistical significance (the groups are too small), and no change to any fighter was proposed or tested.
