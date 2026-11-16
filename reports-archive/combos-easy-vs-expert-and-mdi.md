# Combos, Easy vs Expert, and MDI (measurement only; nothing in the game was changed)

Measured 2026-11-06 on `artifacts/V1/index.html` with the jsdom harness (read-only). Scripts and raw output are in
`C:\Users\carad\AppData\Local\Temp\claude\C--Users-carad--claude\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\combo-sim\`
(`mdi.mjs`, `sim.mjs` + `results.jsonl`, `analyze.py`, `clover2.mjs`, `bot.mjs`, `link.mjs`, `*.out`).

## 1. MDI: the game does not have it

**Short answer: there is no micro-directional input. In hit-stun every key is thrown away, for humans and for the CPU.**

- `step()` line 64564: `if(f.hitstun>0){ f.hitstun--; ... inp={left:false,right:false,jump:false,attack:false,special:false,smash:false}; }`.
  The fighter's real input is replaced by an all-false input for the whole stun, so left, right, up (jump) and down do nothing, and shield cannot be raised in stun (also stated in the in-game tips, line 17146).
  The real keys are still stored in `f._lastInput` (line 64549, saved before the wipe), but that is only used for puppets and respawn side. `applyHit`/`stampHit` never read the victim's keys, so there is no launch angle bend at the moment of impact either.
- Searches for DI, MDI, nudge, steer, drift, survive, tech, mash, struggle next to hitstun/knockback find nothing that is a steering mechanic. The only "steer" is the normal air drift that comes back **when the stun ends** (line 65017 onward: `if(f.hitstun<=0){ ... inp.left/right ...}`), plus jump/double jump.
- Stun length: `hitStunFrames` (line 88259) = `max(4, round(min(24, 6+dmg))) + 6` (the +6 is the 2026-10-20 combo rule). A 3% jab is 15 frames, a hit of 18% or more is 30. Hit-grace (`hitGraceFrames`, 88253) is about the same length. A jab cannot combo into a jab (jab lock, line 66777).
- CPU: `aiThink` (line 92646) returns "hurt, press nothing" in hit-stun. Even so, the CPU's "hands" layer leaves a held key on in some stun frames: I counted a direction/jump key present in **14% of hit-stun frames at Easy and 7% at Expert** (average over my 144-match run). `step()` discards these, so **the CPU gets no MDI at any level**. (Honest note: this reads `_lastInput` of the CPU, which is the brain's output before the wipe.)

### Measured effect (jsdom, Clover smash on Pen, foe held a key from the frame after the hit)

| test | none | left | right | up (jump) | down |
|---|---|---|---|---|---|
| x position at the frame the stun ended (foe at 0%, 30%, 60%, 90%) | 867, 1026, 1185, 512 | identical | identical | identical | identical |
| lowest KO % of Pen | 11 | 11 | 11 | 11 | 11 |
| Clover jab string on Pen (attacker follows perfectly): hits before KO | 5 | 5 | 5 | **4** | 5 |

The only difference: holding **jump** after the stun ended gave a double jump, which dropped the jab string from 5 to 4 hits and delayed a KO from frame 103 to 120 (30% launch). That is ordinary post-stun movement, not MDI. Holding a direction through the stun changes nothing. Can a foe escape a jab-into-jab string with MDI? No: jabs cannot be chained at all (jab lock), and a string of other moves ends only when the stun runs out before the next hit.

**For the owner:** the belief "the game has MDI" is wrong in the code. What exists is the 15 to 30 frame stun, grace, and freedom the instant it ends (jump, drift, shield after the stun), which is why a CPU or human can look like it "escaped".

## 2. Easy vs Expert: does a better CPU get more out of each opening?

Setup: subject fighter vs Pen (Pen's row vs Firey, a fighter cannot fight itself), both CPUs at the same level (the third argument of `__setupCustomMatch` sets `AI_LEVEL`: 0 Easy, 3 Expert), Goiky Field, items off, smash balls off, 3 stocks, 6000-frame cap, different seed each match. Exact hits from a wrap on `applyHit` (subject hitting the foe); total damage from per-frame percent deltas (so burn and poison ticks that bypass `applyHit` are in damage but not in combos). **Combo = hits by one attacker with at most 25 frames between hits.** "Opening" = a combo or a single hit. "Multi-hit combo" = 2 or more hits. N is 10 to 12 matches per cell (target was 12; Firey Expert and Bow Expert 10, Tennis Ball Easy 10; the machine was very busy and I stopped the top-up).

| fighter, level | N | dmg/min | openings/min | multi-hit combos/min | dmg per opening | mean multi-hit combo dmg | max combo dmg | mean combo hits | max combo hits | stocks taken per 100% dealt | stocks taken per match |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Clover Easy | 12 | 38 | 6.2 | 2.75 | 6.14 | 10.5 | 16.8 | 3.2 | 4 | 0.13 | 0.08 |
| Clover Expert | 12 | 130 | 20.3 | 8.30 | 6.43 | 10.8 | 28.4 | 3.0 | 7 | 0.46 | 1.00 |
| Toothpaste Easy | 12 | 93 | 13.5 | 4.15 | 6.90 | 5.7 | 18.0 | 2.2 | 4 | 0.80 | 1.25 |
| Toothpaste Expert | 12 | 214 | 26.5 | 5.10 | 8.09 | 10.8 | 28.0 | 2.5 | 7 | 0.54 | 1.92 |
| Pen (vs Firey) Easy | 12 | 50 | 12.4 | 0.55 | 4.01 | 7.3 | 10.0 | 2.0 | 2 | 1.01 | 0.83 |
| Pen Expert | 12 | 118 | 25.0 | 2.70 | 4.70 | 9.8 | 19.0 | 2.2 | 4 | 0.55 | 1.08 |
| Firey Easy | 12 | 79 | 10.9 | 2.15 | 5.86 | 9.2 | 20.5 | 2.1 | 4 | 0.44 | 0.58 |
| Firey Expert | 10 | 162 | 22.6 | 3.66 | 6.06 | 11.1 | 27.8 | 2.5 | 6 | 0.48 | 1.30 |
| Tennis Ball Easy | 10 | 37 | 8.0 | 0.42 | 4.67 | 11.8 | 24.0 | 2.3 | 3 | 1.13 | 0.70 |
| Tennis Ball Expert | 12 | 119 | 20.5 | 1.90 | 5.77 | 10.3 | 24.0 | 2.1 | 4 | 0.59 | 1.17 |
| Bow Easy | 12 | 26 | 7.4 | 0.36 | 3.51 | 10.1 | 14.6 | 2.3 | 3 | 0.58 | 0.25 |
| Bow Expert | 10 | 141 | 23.8 | 2.34 | 5.92 | 11.1 | 18.6 | 2.1 | 4 | 0.42 | 1.00 |

Expert / Easy ratios:

| fighter | dmg per match | openings/min | multi-hit combos/min | dmg per opening | mean multi-hit combo dmg | mean combo hits | combo dmg per min (rate x size) |
|---|---|---|---|---|---|---|---|
| Clover | 3.4x | 3.3x | 3.0x | 1.05x | 1.04x | 0.93x | 3.1x (29 to 90) |
| Toothpaste | 2.3x | 2.0x | 1.2x | 1.17x | 1.90x | 1.11x | 2.3x (24 to 55) |
| Pen | 2.4x | 2.0x | 4.9x | 1.17x | 1.35x | 1.07x | 6.6x (4 to 26) |
| Firey | 2.1x | 2.1x | 1.7x | 1.04x | 1.20x | 1.15x | 2.0x (20 to 40) |
| Tennis Ball | 3.2x | 2.6x | 4.5x | 1.24x | 0.88x | 0.93x | 4.0x (5 to 20) |
| Bow | 5.5x | 3.2x | 6.6x | 1.69x | 1.10x | 0.93x | 7.2x (3.6 to 26) |

### Interpretation

- **Skill mostly multiplies how often you get an opening (about 2 to 3.3x), not how much each opening is worth** (about 1.0 to 1.25x, Bow 1.7x). The size of a multi-hit combo is almost the same at Easy and Expert (10 to 11 damage, 2 to 3 hits). The longest combos grow (Clover and Toothpaste 4 to 7 hits, Firey 4 to 6), the average does not.
- **Which fighters' combos grow most:** by combo damage per minute, Bow (7.2x, from a tiny base) and Pen (6.6x), then Tennis Ball (4.0x). By average combo size, Toothpaste (1.9x) and Pen (1.35x). Clover and Firey grow least in size, but Clover already has the most multi-hit combos per minute at both levels (2.75 then 8.3) and the highest absolute combo damage rate (29 then 90 per minute), so she is the fighter whose gap between a newbie and an expert is biggest in absolute terms, with the first point of the owner's claim (newbies lose nothing they had, experts gain) holding.
- **Newbies are not helpless against combos:** the same ~10-damage combo exists at Easy; they just get it 3x less often. That supports the owner's "newbies lose nothing" claim, because the combos do not get larger with skill, only more frequent.
- Stocks per 100% dealt fell for most fighters at Expert (the foe at Expert also survives and recovers better), except Clover (0.13 to 0.46) and Firey: Clover at Easy rarely kills, at Expert she takes about one stock per match.

### Limits (be honest)

- The CPU is not a human. Both sides are at the same level, so a ratio mixes "the attacker is better" with "the defender is better"; the foe's defence at Easy is also weaker. A real expert human uses more of each opening than the Expert CPU does.
- N = 10 to 12 per cell. Cells with 0.4 to 0.6 multi-hit combos per minute (Pen, Tennis Ball, Bow at Easy) are only a handful of events, so the ratios of 4.5 to 6.6x are not stable. Mean combo size and max have wide error.
- Matches hit the 6000-frame cap often (a stock or two lost); damage is per minute played. The 25-frame gap rule counts a poke every 25 frames as a "combo" even if it is neutral, and ticks (burn, poison) are counted in damage but not as hits.
- Pen's row uses Firey as the foe. CPU key presses in hit-stun are the brain's output, wiped by `step()`.

## 3. Clover (owner questions)

All numbers: Clover vs Pen (and Puffball, Tree) on Goiky Field, jsdom, Clover scripted by me (she is not a human).

### 3a. Her finisher (V+C), Lucky Leaf Pinwheel (`finPinwheel`, line 76853)

- **Timeline (Pen at centre):** press at frame 0; spin in place frames 0 to 11 (`FIN_STARTUP` = 12, the tell); the disc drifts ahead at 7 px a frame; first hit frame 14, then hits at 22, 30, 38 (3% each, 12% in all); the fourth hit flings (frame 38: speed 6 sideways, 6.4 up at 0%); she turns at 48, is dizzy 49 to 62, free at about frame 63. Cooldown `FIN_CD` = 74 frames (1.2 s) between finishers.
- **Lowest KO percent of the fling** (foe 60 px in front of her):

| foe | centre of the stage | near the edge (she faces the blast line, foe between) |
|---|---|---|
| Puffball (light) | 21% | **0%** |
| Pen (mid) | 65% | 25 to 27% |
| Tree (heavy) | 115% | 79 to 81% |

- **Can the foe escape?** Only during the tell. A held jump or a held away key from frames 0 to 4 after her press dodges all four hits; pressed at frame 8 or later, all 4 hits land. Once caught the foe is carried and receives no input (stun wipes keys), so shield, jump, away, toward and up+away do nothing (4 hits for toward and shield, 0 hits only when the key was already held at frame 0). The escape window is about 5 frames, shorter than a person's reaction.
- **A hit on her cancels it at any time** (tested at frames 5, 20, 30, 40: the row ends and the foe took 0, 1, 3 and 4 hits). At frame 40, after the fling, nothing is left to cancel.
- **CPU use as Clover:** the CPU asked for the finisher (calls to `finPinwheel`, including attempts that could not start for lack of room and are not spent) about **11 times a minute at Expert** (36 in 3.3 min) and about **5 a minute at Easy** (25 in 5 min). I cannot separate real starts from failed attempts (the function returns nothing on success, my "started" counter read 0); treat the numbers as upper bounds.

### 3b. A hit links into the finisher, and the link cannot be escaped (this matters)

`link.mjs`: Clover hits Pen, then presses the finisher the first frame she is free (the finisher cooldown was reset, as at the start of a fight).

| opener | frames from the hit to the finisher press | foe stun left when she presses | finisher hits | flung |
|---|---|---|---|---|
| forward tilt (Leaf Jab) | 13 | 18 | 4 | yes |
| jab | 0, 3, 6 | 17, 17, 14 | 4 | yes |
| butterflies (C), 3 frames later | 3 | 15 | 1 | no (spacing; the foe is 90 px away) |
| butterflies, 6 frames later | 6 | 12 | 5 | yes |

The pinwheel's first hit comes 14 frames after the press, inside the stun the opener left. The foe has no steering in stun (section 1), so **tilt or jab, then finisher, is a guaranteed 4-hit fling with no escape: no MDI, no shield, no jump.** The finisher only needs 74 frames of cooldown, no meter. This is the owner's "unescapable thing", and it explains "she only has to win neutral 3 times": one opening per stock, hit then finisher, and Puffball at the edge dies at 0%, Pen at about 25% (after one tilt, 7%, he is already near that on the second opening).

### 3c. The butterfly chain (C, 4 butterflies, 4% each, cooldown 58 frames) against the CPU

My scripted Clover spams C at 70 to 220 px; the victim is a CPU at each level. A "cast" counts as escaped if no butterfly landed within 45 frames. 4 trials of 900 frames per cell (about 50 to 60 casts):

| victim, level | casts | landed | escaped | how it escaped (jump, walk away, shield) | mean chain (consecutive landed casts) | longest chain |
|---|---|---|---|---|---|---|
| Pen Easy | 61 | 41 | **33%** | 14, 2, 1 | 7.1 | 13 |
| Pen Normal | 59 | 43 | 27% | 10, 2, 2 | 7.9 | 21 |
| Pen Hard | 54 | 40 | 26% | 9, 0, 1 | 6.2 | 17 |
| Pen Expert | 53 | 37 | 30% | 11, 1, 2 | 5.4 | 18 |
| Pillow Easy | 61 | 42 | 31% | 9, 6, 1 | 7.0 | 16 |
| Pillow Normal | 62 | 50 | 19% | 5, 3, 1 | 11.2 | 18 |
| Pillow Hard | 56 | 44 | 21% | 6, 1, 2 | 6.9 | 20 |
| Pillow Expert | 50 | 36 | 28% | 8, 1, 2 | 4.9 | 23 |

Reading: the CPU does escape butterfly chains, about **20 to 33% of casts at every level, with no clear improvement from Easy to Expert** (the shorter chains at Expert, 4.9 to 5.4 against 7 to 11, hint at slightly better escapes in the later chain, but N is 4 trials). It is almost always a **jump after the stun has ended** (70% of escapes), sometimes walking away or shield; never an input in stun. This matches the owner's live observation that Pillow escaped "a couple of times": by a jump the instant the stun ran out (butterfly hit = 4% -> stun 16 frames, cooldown 58, so there are gaps), not by MDI. The exact input frame was not logged; escapes were classed from the foe's state in the 45 frames after the cast. Limits: Clover is a script, not a person; N small; Pillow 5-0 case was not reproduced.

### 3d. Clover's longest string from 0% (greedy bot, `bot.mjs`)

A crude bot (forward tilt and down tilt on the ground, aerials in the air, walk toward the foe) on a foe that holds still: 11 hits and 53% on Pen, 20 hits and 85% on Tree, 5 hits and 25% on Puffball before the string ended; with the foe holding toward, 24 hits and a KO of Tree at 106%. A foe holding away or jump shortened it (Pen: 7 hits and 24% holding away, 3 hits holding jump; Tree: 14 hits holding away, 11 holding jump, 3 pressing jump every other frame; Puffball holding away and shield: 1 hit). These are effects of the foe running or jumping after the stun, not MDI. The bot does not label moves in my log, so which move each hit was is not recorded, and it does not use the finisher. **No 0-to-KO with tilts and butterflies alone was found; the kill route is the finisher (3a), and the finisher links off any hit (3b).**

## 4. Recommendations (the owner decides; nothing applied)

1. **Clover's tilt/jab -> finisher link is an unescapable 4-hit fling** (3b). By the owner's rule ("unescapable is a bug; strong but escapable is fine") the clean fix is to copy the existing jab-lock rule: the pinwheel disc does not catch a foe who is still in the stun of Clover's own hit (like `jabLocked`, line 66777), so the finisher stays strong as a read after the stun ends (the foe then has about 5 frames to jump or walk away, 3a) but cannot be chained off a hit. Effect: her fastest kill route (tilt, then fling) becomes a read, not a certainty. Risk: it lowers her kill rate and her Expert CPU conversion (currently 1 stock a match); it adds a special case to a finisher rule shared with other kits only if written for her. The alternative, a longer wind-up (more than 12 frames), hurts every use. Not tested: whether the lock leaves a link at the very end of stun.
2. **Escape window of the finisher** (about 5 frames, below human reaction): if the owner wants it to be a read rather than a free hit, lengthen the spin-up tell by about 6 to 8 frames or let a short step of the disc start later. Risk: slows the finisher in all situations (the CPU too).
3. **MDI:** the game does not have it. If the owner wants it, the smallest version is "while in stun, held left or right bends the launch angle by a few degrees; held up or down raises or lowers it a little", never during the first frame, with a cap, and the CPU would have to press it (today the brain presses nothing in stun, 92646). Risk: it changes every kill percent, the online prediction (`netPred`), and the balance tables, and it would not rescue a foe from the finisher catch or a tilt string whose next hit lands inside stun (the foe is carried or hit without moving anyway). It would help against fling-away kills only.
4. **Butterflies:** the CPU escapes about 20 to 33% of casts at all levels by jumping when the stun ends. No change needed; the exit is already there, it is not skill-scaled for the CPU.
5. **Easy vs Expert:** combos are not bigger with skill (about 10 damage, 2 to 3 hits on average), they are 2 to 3 times more frequent. Matches the owner's claim; the strongest skill scaling is in Bow and Pen's combo rate and Toothpaste's combo size. No change suggested.
6. **For Expert CPU:** the brain does not press away or jump in stun anyway (the keys are wiped), so teaching it MDI only makes sense if the owner adds MDI (point 3).

## Not verified

- Human play (everything is CPU or scripted).
- Exact pixel drift in the post-stun air control (not measured; qualitative only).
- Which exact move starts each hit in the bot strings; the CPU's number of real finisher starts per minute (3a).
- The Pillow 5-0 live game; whether a longer search (a real optimiser) finds a 0-to-KO without the finisher.
- Online play: nothing touched the live relay.
