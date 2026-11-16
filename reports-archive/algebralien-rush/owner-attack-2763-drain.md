# 2,763's DRAIN, the owner's change: it damages you and heals it (three options, 2026-11-02)

Design job for the owner's own attack (typed in the attack box): "Drain: in a radius, deals damage to you and heals." Read-only on the game: nothing was edited, committed or pushed.
Read first: `owner-rules.md`, `attack-picks.md`, `spec.md` (all of it), `boss-2763.md`, `attack-options-2763.md`. Read in the game for patterns only (names, not line numbers): Two's and One's POWER DRAIN
(`f.pct += 6` straight onto the meter; the boss heals 0.6 HP per 1% on Two's 285 bar and 2.8 on One's 2,000 bar; One's skips `f.invuln>0`), `bossDmg()` (22), the hush line (`_hushT`), `applyHit`'s knockback scale.
Read on the BFDI wiki today: the page "Two Thousand Seven Hundred Sixty-Three" as raw wikitext, in my own background tab (closed afterwards; nothing downloaded).
Labels: CANON = on that page. GAME = a choice made here. Every number is a starting value with a knob (section 2, R11); none is tuned to a bot. Pronoun for internal text: it/its.

---

## 0. The short version

- WHAT CHANGES: today the drain only silences specials inside about 220 px and fills the gauge LIGHTS throws. The owner wants it to ALSO hurt every fighter inside the radius and HEAL the boss. The silence stays; the radius is the same glow.
- THE THREE SHAPES: **A, THE HALO** (a steady glow that ticks, wider and harder each phase), **B, THE HUNGER** (the glow grows as you hurt the boss: small at full health, widest when it is nearly dead), **C, THE BREATH** (the glow breathes: quiet most of the time, then a flare that hits whoever is inside, on a count you can read).
- THE ONE GUARANTEE (all three, by rule, not by luck): the aura can add at most **450 HP in the whole fight** (100 / 150 / 200 by phase = 15% of the bar). At the bot rate (7.5 HP/s) that is at most +1:00 on a 6:40 fight; at the owner's slowest (4.2) at most +1:47. At the bot rate a melee player who spends about half the fight inside pays +0:46 to +1:00; a ranged player +0:14 to +0:19. The last 150 HP never heals. Heal only comes from damage the player chose to stand in. A fighter outside the glow takes nothing.
- DAMAGE: from the aura alone at most 4.4% a turn (A, B) or two pulses, 5% (C); the aura plus the turn's own move never above one boss hit (22%). Roughly 0.4 to 0.7%/s inside in A; 55 to 31 seconds inside to cost one boss hit.
- IT IS NOT A MOVE: ticks go straight on the meter with no knockback and no hitstun (as Two's and One's POWER DRAIN do), so "one attack id per turn, at most one hit from a move" still holds, and no popup, ring or line is added.
- RECOMMENDATION: **A** (section 8). It is the owner's sentence as written, the cheapest (+60 lines), keeps the radius the owner already accepted (190 / 210 / 220), and every phase gets harder in five separate ways. C is the one to pick if the owner wants the drain to feel like a pattern with tells.

---

## 1. The ask, today's drain, and what is canon

**The ask (owner, 2026-11-02):** "Drain: in a radius, deals damage to you and heals." (`attack-picks.md`: damage over time, boss heals; propose radius, tick, heal share, phases, inside the damage cap.)

**Today (spec.md section 1, `boss-2763.md` section 7):** inside about 220 px of its body centre fighters are hushed (no specials, no finishers; a Final Smash still goes; the hush wears off about 20 frames after leaving). What it drains becomes the lights that orbit it: 3 to start, +1 per 45 frames any fighter stands inside, cap 8; LIGHTS throws them all and drops back to 3. The aura never healed (spec section 2.5 ruling: "2,763's aura never heals"): this change reverses that ruling on purpose, so the spec's line should be updated if the owner picks one. It now overlaps Two's and One's POWER DRAIN in effect (damage plus heal); the shapes stay apart (theirs is one burst at the end of a move, this is a standing glow) and canon is on its side (One took the others' powers; 2,763 drains them all).

**Canon, read today (page "Two Thousand Seven Hundred Sixty-Three"):**

| On the page (paraphrased) | What the game does with it |
|---|---|
| "Power draining": merely being near other Algebraliens and objects, it drains their power, strength and stamina and leaves them vulnerable. | CANON: closeness is the trigger and what is lost is power, strength and stamina. GAME: the radius, the silence, and the damage to the meter are the translation. |
| After draining the others' powers it "presumably" becomes stronger by absorbing them (the page hedges this itself). | CANON: it takes what it drains. GAME: the heal and the lights are how a game shows "stronger"; the wiki never says it heals. |
| Calm and rational, wants to trap rather than kill. | GAME: the aura only builds meter (no knockback), so it can wear you down but never KO by itself; it is steady (A) or on a slow count (C), never frantic. |
| The page lists no breathing, no hunger, no numbers, no attack names. | GAME (all of it): B's hunger and C's breath are inventions; so is every figure below. |

Fit by option: A is the closest to the page ("just by being around"). B leans on the "becomes stronger" line. C has nothing on the page behind its breath; its calm is the only link. The stolen power is also why the motes wear the colours of the bosses the player has beaten (the colours LIGHTS throws): the power it took from Two, Four, Nine and the rest, drifting in the halo. All of that is game text; nothing on screen prints a word.

---

## 2. What every option shares (the fairness frame)

### 2.1 Yardsticks used (the estimates are mine; the rest is from the files and the code)

| | |
|---|---|
| Stage and boss | 2,400 x 860, boss radius 102, belly 60 px over the floor in phase 1 and 30 in phases 2-3, so the centre is 162 / 132 px up; a floor fighter's centre is about 30 px up, so the vertical gap is about 132 (P1) and 102 (P2, P3). |
| Bands (engine cut 66 / 33) | P1 3,000 to about 1,980; P2 to about 990; P3 to 0. About 1,000 HP each, about 133 s each at 7.5 HP/s. |
| Player damage to it | bot 7.5 HP/s (the brief); the owner's own range 4.2 to 8.3 HP/s (`spec.md` 2.2). Length only, never tuning. Base fight: 6:40 at 7.5, 11:54 at 4.2, 6:01 at 8.3. |
| A boss turn | gap x1.2 (144 / 115 / 84 frames) plus about 175 frames of move = about 5.3 / 4.8 / 4.3 s (an estimate from `boss-2763.md`). |
| A boss hit | 22% of a fighter's meter. A hit's launch scales with the meter: (0.5 + 0.014 x meter%), so every 1% the aura adds makes the next hit throw a little further. That, not the number, is the aura's real cost. |
| Reach on the floor | a floor fighter is inside radius R when horizontal distance is under sqrt(R^2 - gap^2): R 190 in P1 = 137 px each side; R 210 in P2 = 184; R 220 in P3 = 195. Up is not out (measured in 2D). |

### 2.2 The rules (R1 to R11, in every option)

- **R1. A drain, not a hit.** Damage is `f.pct += x` with no knockback, no hitstun, no grace frames, no hit sound, no "POWER DRAIN!" banner (the rush shows no move names). The aura is not a move, so "at most one hit from a move per turn" is untouched.
- **R2. Who.** Living fighters only; not any fighter with `invuln > 0` (just respawned, starred, dodging: One's drain makes the same test); not one inside a Final Smash catch (`_fsLock`). Distance is to the fighter's outline, `hurtGap(f, x, y) < R - HURT_R0`, the way Two's and One's drains measure it.
- **R3. The turn clip.** Within one boss turn the aura plus the move's own damage (`_bossHitDmg` for the current attack id) never exceeds 22%, and the aura alone never exceeds the option's turn cap. A fighter just slammed for 20% takes at most 2% more from the glow that turn. State is one small number per fighter, reset when a new boss turn begins.
- **R4. The heal.** Only from damage actually dealt after R2 and R3, as a share of it (HP per 1%). A budget per band (**100 / 150 / 200 HP**, counted in HP actually restored, so a heal wasted at the top of a band costs nothing) and the heal can never lift the boss above the top of the band it is in (no un-phasing). **The last 150 HP (5%) never heals.** No heal in the intro, the 20-frame phase beats or the ending. Heal and budget are multiplied by `ALG_RUSH.dmgToBoss` so the ratio to the player's damage holds if the owner moves that knob. When the budget is spent the damage and the silence go on, but the motes drifting away from a drained fighter fade before they reach the boss (it is full): the one visible sign.
- **R5. The silence stays.** Same radius as the damage: one glow, one rule. The hush rides the current glow; Final Smashes still go.
- **R6. The tide puts it to sleep.** From the first frame of a FLOOD rise until 20 frames after the ebb, the aura does nothing (no damage, no heal, no silence); the glow sinks and the motes drift up into the lava. Why: the refuges (Division Symbols 110 px up, a standing cage, the platforms 144 px up) all sit at the boss's own height and inside any radius, so without this the only safe place from the lava would also be the aura. The cost to the boss is small (the tide is about 100 frames) and it is a reward for taking the flood correctly.
- **R7. The island clamp.** In phases 2-3, no radius may leave less than 80 px of dry island floor outside it: R_eff = min(R, sqrt((islandHalf - 80)^2 + gap^2)). The director's islands are 720 px (P2, half 360) and 560 px (P3, half 280): the cap is about 298 in P2 and **224 in P3**. All options top out at 220, so this is a guard if the island ever changes. Strip left on the island floor with the boss centred: P2 165 to 176 px each side, P3 85 px. (If the owner wants the P3 radius wider than 224, widen the band-3 island: 640 px allows 260 and leaves 81 px.)
- **R8. The leash.** A relocation lands the boss 300 to 500 px from the nearest fighter, outside every radius here (max 220), and its glide is 0.6 px/frame, so the glow never appears on someone; a runner is never drained, and nothing here is "answered by running": the aura asks for distance, not escape.
- **R9. The body shows it (nothing printed, no line).** The radius is the body's own glow: a dark violet-black halo, darkest at the body and falling to nothing exactly at R (no rim, no edge line, no ring), drawn under fighters and shots; it grows in over 12 frames; no strobe (nothing here changes faster than 12 frames). Inside it, motes (small lights in the colours of the bosses beaten, 8 / 12 / 16 by phase) drift slowly and never leave R, so where they stop is the edge. On every toll one mote lifts off the drained fighter (in that fighter's colour) and flies into the numerals over 14 frames: you watch your power go. Sound: a soft low thump on each toll through the existing SFX table at low volume, heard only while someone is being drained.
- **R10. Plain state (online stays possible).** `s._dr = { t, spent:[3], lights, turnId, taken:{idx:%}, t0 }`: numbers only. The radius is a pure function of boss HP and phase (A, B) or of the clock and `t0` (C); the host writes `pct`, the client draws from the same numbers. No `netshot` rows at launch (offline), none needed to add later. Never the live relay.
- **R11. Knobs.** `drainDmg` (1.0), `drainHeal` (1.0) and the three budget numbers, for the owner to set by feel after playing it; nothing is set from a bot.

### 2.3 How the glow meets the other moves (the same for all; the options' own differences are in italics)

| Move | Rule |
|---|---|
| SLAM (hands on shadows, 2 / 4 / 6) | Hands drop on each fighter wherever it stands, so standing back is no escape from SLAM and standing close only adds the tax. R3 keeps the turn under one hit: after a 20% slam the glow can add 2%. |
| WINDMILL (arms 240 px, tag "close") | The windmill's circle (240) contains every radius here (max 220): one step outside the arms is also one step outside the glow, "the circle you are drained in is nearly the circle that is struck". It is picked when someone is close, which is exactly where the aura is, so close fighters meet both in one turn (R3 clips it). |
| LIGHTS (the signature) | The lights come from what the aura actually took, after R2-R3 (a fighter who gave nothing gave no light). *A, B: +1 light per 0.3% taken (cap 8, floor 3). C: a pulse that lands gives 3 / 4 / 5 lights.* A thick spiral is the player's own bill for standing close. |
| CAGE (drops on the farthest fighter) | The counter to range: a player who answers the glow by standing far is the one CAGE picks, and LIGHTS is thin for them but never absent. Close is taxed by the glow and WINDMILL, far by CAGE: no spot is free. |
| FLOOD (lava, P2 on) | R6: the aura sleeps while the tide is up. A fighter forced up onto a symbol or platform is nearer (the vertical gap falls from 102 to 8-42, so the horizontal reach grows from 184-195 px to 206-220), but the glow is off then; it is on again 20 frames after the ebb, which is when a fighter on a symbol drops back to the floor nearest the boss. |
| PAN ACROSS (the hand on a head-high row) | No rule. The hand leaves the wrist and flies the whole row; the glow neither blocks nor helps it. |
| ROOT THEM OUT (a lava patch that chases, from band 1) | No rule. The patch spawns ahead of the heading and never leaves the dry floor, so it can drive a player toward the glow; R3 covers the turn. |
| HERCULEAN (glide, then three blows, band 2 on) | The glide stops about 260 px from the target (outside every radius here), then the blows reach about 300 px: backing out of the 300 px reach for the third blow is also leaving the glow. The glide is the camper's counter; the glow is the close fighter's tax; they never stack on a fighter standing still at range. |

---

## 3. Option A: THE HALO (a steady glow that ticks)

**Shape.** One steady halo round the boss. Inside it, every half second, you lose a little and it heals. Wider, harder and darker each phase.

**Radius (to the outline) by phase.** P1 **190** (137 px each side on the floor); P2 **210** (184); P3 **220** (195). The old drain was a flat 220: the opening is a little kinder, the end the same. Island strip left (R7): P2 about 170 px each side, P3 85.

**What the player sees.** A dark halo hugging the boss, darkest at the body (alpha 0.28 / 0.34 / 0.40 by phase) and gone at the edge; slow motes inside it (8 / 12 / 16) that stop at the edge. Every 30 frames a mote lifts off any drained fighter and flies into the numerals, and the numerals swell 3% for 12 frames (soft; no flash). The glow steps darker at each phase beat (the lava light comes in from phase 2: an ember rim on the numerals from P2, all four numeral colours leaking from P3). Soft low thump on each toll.

**Damage.** A tick every 30 frames: **0.20% / 0.28% / 0.35%** = **0.40 / 0.56 / 0.70 %/s**. A whole turn standing inside: 2.1 / 2.7 / 3.0%. Seconds inside to cost one boss hit (22%): 55 / 39 / 31. **Cap:** 4.4% (0.2 of a hit) from the aura per fighter per turn, and R3's 22% with the move. Over a whole fight, about 105% of meter for a melee player who is inside half the time, about 35% for a ranged one (spread over a few stocks; a meter that resets at each KO).

**Heal.** **3.0 / 4.0 / 4.5 HP for every 1% it takes** = 1/1000, 1/750, 1/667 of the 3,000 bar per 1% (Two's drain is 1/475 of its bar, One's 1/714: this sits at One's, gentler than Two's, since this fight is already long). Per tick 0.6 / 1.1 / 1.6 HP, so **1.2 / 2.2 / 3.15 HP/s** to a player who stays inside the whole time. Budget 100 / 150 / 200: used up after 83 / 68 / 63 s of full-time standing inside. No heal inside the last 150 HP.

**Break-even and the fight length.** Net progress while inside is D - h, where D is the player's damage in HP/s and h the heal rate; break-even is D = h = 1.2 / 2.2 / 3.15. The bot (7.5) is 6.3x / 3.4x / 2.4x that; the owner's slowest (4.2) is 3.5x / 1.9x / 1.3x that, so even a player who never leaves the glow still moves the bar every second of every phase, and after the budget is gone the break-even is zero. Simulated (python, 0.25 s steps, `scratchpad\alg-rush\drain\sim.py`; exposure e = share of the fight inside):

| Player | Base | e = 0.15 (ranged) | e = 0.45 (melee) | e = 1.0 (sits in it) |
|---|---|---|---|---|
| bot, 7.5 HP/s | 6:40 | +0:17 (6:57) | +0:57 (7:37) | +1:00 (7:40) |
| owner slow, 4.2 | 11:54 | +0:57 | +1:47 | +1:47 |
| owner fast, 8.3 | 6:01 | +0:14 | +0:46 | +0:54 |

**What the player does.** Fight at range (outside R: only a ranged or long-reach kit, about 90 to 120 px past the body's edge, can hit it from outside the glow and keep every special; a melee kit is inside whenever it connects); fight in bursts (step in, combo, step out: 5 s inside is 2 to 3.5% and 6 to 16 HP of heal); or take the tide's quiet (R6: beside a symbol, specials work and nothing ticks). Standing in is a trade the player chooses, never a surprise.

**Phase escalation (all five change each phase).**

| | P1 | P2 | P3 |
|---|---|---|---|
| Radius | 190 | 210 | 220 |
| Damage per second | 0.40 | 0.56 | 0.70 |
| Heal per 1% / per second | 3.0 / 1.2 | 4.0 / 2.2 | 4.5 / 3.15 |
| Heal budget | 100 | 150 | 200 |
| Look | 8 motes, alpha 0.28 | 12 motes, ember rim, 0.34 | 16 motes, four colours leaking, 0.40 |
| LIGHTS per second inside | 1.3 | 1.9 | 2.3 |

**Canon.** The closest fit (section 1). Game text: all numbers, the mote colours, the budget.

**Size.** About **+60 lines** on the director's 70-line drain (the tick and clip 25, the budget and clamps 15, the glow and motes 20), shared rules included; about 130 lines in all.

**Risks.** (1) The glow edge must be read by the motes, not guessed: a soft gradient alone is a poor edge, so the motes must never cross R (a one-line check). (2) Melee kits pay a constant tax and ranged kits do not: that is the point of a drain, but the owner should feel it with a melee fighter first. (3) It is the easiest to forget standing in: the thump and the motes are the reminders.

---

## 4. Option B: THE HUNGER (a glow that grows as you hurt it)

**Shape.** The radius, the tick and the heal all grow with how much of the boss is missing: m = 1 - HP / 3,000. A healthy boss has a small, weak halo; a wounded one is hungry. Feeding it makes it fuller and the glow shrinks a hair: it steadies itself.

**Radius (to the outline).** R = 150 + 70 x m, chasing its target at no more than 1 px a frame (never a jump). At m = 0 **150** (71 px each side on the floor); at the P1/P2 line (m about 0.34) **174** (113); at the P2/P3 line (m about 0.67) **197** (169); at m = 1 **220** (195). Island strips as in A at the end (85 px).

**What the player sees.** The same dark halo and motes as A, but its size and darkness are the boss's health read back to you: every exchange swells it a little, every feed shrinks it. The motes and the darkness scale with m (8 to 16 motes, alpha 0.28 to 0.40), so a player can tell "it is getting hungrier" by eye; each phase beat adds the ember rim (P2) and the four leaking colours (P3). Toll thump as A.

**Damage.** **0.25 + 0.5 x m %/s**: 0.25 at full health, 0.42 at the P1/P2 line, 0.58 at P2/P3, 0.75 at the end. A whole turn inside (phase average): 1.8 / 2.4 / 2.9%. **Cap:** 4.4% per turn and R3. Over a fight, about 94% (melee) or 32% (ranged).

**Heal.** **2.5 + 2.0 x m HP per 1%** (2.5 at full health, 3.2, 3.8, 4.5 at the end). Heal rate to a player inside the whole time: **0.6 HP/s at full health, 1.3 at the P1/P2 line, 2.2 at P2/P3, 3.2 at the last point that still heals** (0.6 to 1.3 in P1, 1.3 to 2.2 in P2, 2.2 to 3.2 in P3). Budget 100 / 150 / 200; no heal in the last 150 HP (m above 0.95), so the rate never peaks exactly when the boss is nearly dead (the radius and the tick still reach 220 and 0.75%/s there). The heal lowers m, which shrinks the glow, the tick and the share: a built-in brake (a healed boss is a less hungry boss), so it cannot snowball.

**Break-even and the fight length.** Same method as A. Break-even D = h(m): 0.6 to 3.2 HP/s, rising as the fight goes. The bot (7.5) clears the worst point 2.3x, the owner's slowest (4.2) 1.3x, which is close: that is why the last 150 HP is clean and the budget caps the damage to the run.

| Player | Base | e = 0.15 | e = 0.45 | e = 1.0 |
|---|---|---|---|---|
| bot, 7.5 | 6:40 | +0:14 | +0:46 | +1:00 |
| owner slow, 4.2 | 11:54 | +0:46 | +1:47 | +1:47 |
| owner fast, 8.3 | 6:01 | +0:12 | +0:37 | +0:54 |

(The gentlest on a typical melee player, because the heal is small while the boss is healthy.)

**What the player does.** Fight it close early while the halo is small and gentle; as it gets hurt, shift to bursts and range; hit-and-leave; finish from range or in the last 150 HP, where nothing heals. A player who plays well is met with a wider glow, which is the point of a catch-up boss; a player who plays badly meets a small one.

**Phase escalation.**

| | P1 | P2 | P3 |
|---|---|---|---|
| Radius | 150 to 174 | 174 to 197 | 197 to 220 |
| Damage per second | 0.25 to 0.42 | 0.42 to 0.58 | 0.58 to 0.75 |
| Heal per second (inside) | 0.6 to 1.3 | 1.3 to 2.2 | 2.2 to 3.2 |
| Heal budget | 100 | 150 | 200 |
| Look | 8 motes | 12, ember rim | 16, four colours |
| LIGHTS (0.3% per light) | 1.2 s each to 0.7 s | 0.7 to 0.5 s | 0.5 to 0.4 s |

This is the most naturally Cobs-like escalation (the harder it is hurt, the harder it bites) and every phase's range is a different slice of the same curve.

**Canon.** Leans on "becomes stronger by absorbing". Nothing on the page says hunger: pure game text.

**Size.** About **+80 lines** over the director's drain (A's 60 plus the formula, the smoothing and the slope, 20); about 150 in all.

**Risks.** (1) The slow growth (70 px over a six-minute fight) is easy to miss, so the darkness and the mote count have to carry it; if the owner feels it is invisible, A is simpler. (2) The finish: the radius and tick peak just where a melee player wants to close, so the last third is the hardest to get through; the clean last 150 HP and the budget are the answer. (3) The first third is almost aura-free for a floor fighter (71 px each side at full health): the signature is weak in the opening, which is a kind start and a thin one. (4) A stand-off needs D below the heal rate and a player inside: at the owner's slowest (4.2) the tail of P3 is within 1.3x of the heal rate; watch it by playing.

---

## 5. Option C: THE BREATH (a glow that breathes, with a flare you can read)

**Shape.** A cycle of quiet, a count, and a flare. Between flares the glow is small and only silences close to the body. Every cycle it breathes out: the glow flares wide for an instant, everyone inside takes a pulse of damage, and it heals. The beat can be dodged outright by leaving in time.

**Radius.** Quiet R_lo **150 / 160 / 170** (71 / 123 / 136 px each side on the floor); flare R_hi **190 / 210 / 220** (137 / 184 / 195). The silence follows the glow: wide on the flare, close to the body between.

**The cycle (frames, one pass).** Cycle length **180 / 160 / 140** (3.0 / 2.7 / 2.3 s, never faster than 0.43 Hz).
0 to 11: the flare grows R_lo to R_hi (a filled light, brightest at the body, no edge line); at frame 12 the pulse lands on every eligible fighter inside R_hi; 12 to 47 the glow decays back to R_lo. Then quiet, the glow steady at R_lo.
The count: at 40 and 20 frames before the next flare the numerals throb twice, and from 40 frames out the motes turn and stream INTO the body from as far out as R_hi (so the motes now mark the flare's reach); in the last 14 frames the body swells 4% and the ten eyes narrow (the house gather). Then the flare. A weak kit running at 5.4 px/frame covers 220 px in 41 frames; the player has 52 from the first throb: enough from anywhere inside.

**What the player sees.** The halo breathing: wide and dark on the flare and fading over about half a second, small and quiet between, then the twin throb, the motes pouring in, the body swelling, and the flare. Sound: a soft inhale rising over the count and a low thump on the flare (existing SFX, low volume, only when it lands on someone).

**Damage.** A pulse of **1.5% / 2.0% / 2.5%** (about 0.5 / 0.75 / 1.07 %/s if every pulse is taken). A whole turn inside takes about two pulses: 3.0 / 4.0 / 5.0%. **Cap:** two pulses a turn (5.0% = 0.23 of a hit) and R3. If every pulse is taken a fight costs about 325% (e = 0.45 of the pulses: about 146%; a careful player taking 15%: about 49%). A pulse is all or nothing: the pulse that hits a late fighter misses an early one.

**Heal.** **3.0 / 3.0 / 3.2 HP per 1%** = 4.5 / 6.0 / 8.0 HP per pulse = **1.5 / 2.25 / 3.4 HP/s** if every pulse is taken. Budget 100 / 150 / 200; no heal in the last 150 HP. A boss whose pulses all miss heals nothing.

**Break-even and the fight length.** Break-even D = 1.5 / 2.25 / 3.4 if every pulse is taken; the bot clears it 5x / 3.3x / 2.2x, the owner's slowest 2.8x / 1.9x / 1.2x. Here e is the share of pulses taken, not time inside.

| Player | Base | 15% of pulses | 45% of pulses | all pulses |
|---|---|---|---|---|
| bot, 7.5 | 6:40 | +0:19 | +1:00 | +1:00 |
| owner slow, 4.2 | 11:54 | +1:02 | +1:47 | +1:47 |
| owner fast, 8.3 | 6:01 | +0:15 | +0:51 | +0:54 |

**What the player does.** Fight in bursts to the beat: from the moment a pulse has landed until the first throb (the burst window, 127 / 107 / 87 frames, about 2.1 / 1.8 / 1.5 s) no pulse can touch you (the boss's moves still can): step in, hit, and be out of the flare's reach within 52 frames of the first throb; a well-timed fighter takes almost no pulses and heals nothing. Or fight at range and never meet it. The lava gap (R6) works the same: the beat is held while the tide is up, and the cycle restarts when the aura wakes (20 frames after the ebb) with the first flare 90 frames later. Because the answer is a read, it asks the player for the same attention the other tells do.

**Phase escalation.**

| | P1 | P2 | P3 |
|---|---|---|---|
| Cycle | 180 | 160 | 140 |
| Quiet radius / flare radius | 150 / 190 | 160 / 210 | 170 / 220 |
| Pulse damage | 1.5% | 2.0% | 2.5% |
| Heal per pulse | 4.5 | 6.0 | 8.0 |
| Heal budget | 100 | 150 | 200 |
| Burst window (pulse landed to first throb), frames | 127 | 107 | 87 |
| Lights per pulse taken | 3 | 4 | 5 |
| Look | 8 motes | 12, ember rim | 16, four colours |

**C-only rule.** A beat never starts inside a move's final 24 wind-up frames (the lock): it waits, up to 40 frames, so two tells never land at once.

**Canon.** Nothing on the page backs a breath; the page's calm is the only link. All game text.

**Size.** About **+115 lines** over the director's drain (the cycle machine 40, the flare and inhale drawing 45, the throb and the wait rule 15, shared rules 15), about 185 in all.

**Risks.** (1) The flare must be a filled glow, never a ring: a soft rim would read as the forbidden ring line (the build check is that the edge alpha is 0 and no stroke is drawn). (2) The quiet radius (150 to 170) is smaller than the accepted 220, so the silence, the signature, is weakest between beats; the variant is a fixed silence at 200 with the breath only for damage (two radii: more to read). (3) It is the only option with a timing read, and the player must also read SLAM, CAGE and the rest: hence the wait rule. (4) The most code, the most to check by playing. (5) The flare is 12 frames at no more than 0.43 Hz and never a hard flash, below any strobe limit.

---

## 6. Side by side

| | A THE HALO | B THE HUNGER | C THE BREATH |
|---|---|---|---|
| Shape | steady, ticks | grows as it is hurt | quiet, count, flare |
| Radius P1 / P2 / P3 | 190 / 210 / 220 | 150-174 / 174-197 / 197-220 | 150-190 / 160-210 / 170-220 |
| Damage inside | 0.40 / 0.56 / 0.70 %/s | 0.25 to 0.75 %/s | 1.5 / 2.0 / 2.5% a pulse (0.5 to 1.07 %/s if all taken) |
| Turn cap (aura) | 4.4% | 4.4% | 5.0% (two pulses) |
| Heal inside, full time | 1.2 / 2.2 / 3.15 HP/s | 0.6 to 3.2 HP/s | 1.5 / 2.25 / 3.4 HP/s |
| Budget per phase | 100 / 150 / 200 | 100 / 150 / 200 | 100 / 150 / 200 |
| Fight, bot 7.5, melee | +0:57 | +0:46 | +1:00 |
| Fight, worst case | +1:00 (bot), +1:47 (4.2) | the same | the same |
| The dodge | range, bursts, tide | early close, later range | timing |
| Size over the old drain | +60 | +80 | +115 |
| Best for | the owner's sentence, simplest | a story and a catch-up | a drain that feels like a pattern |
| Main risk | a constant tax is forgotten | slow growth invisible, hard finish | most code, a weaker silence |

The whole nine-boss run adds at most about 1:00 (about 3% of 36 minutes) at the bot rate. The budget is the same everywhere, so the fight-length risk does not differ by option; what differs is how the player feels the damage and the read.

---

## 7. A shape not offered: the pull

A drag toward the boss (a force on the player) was considered and left out. (1) It is a launch toward the middle of the danger and collides with "nothing is unavoidable"; at a short range it reads as unavoidable. (2) A ring or a pull is Four's shape (`attack-options-2763.md` section 2). (3) A velocity the player did not choose has to be replicated for online and for CPU fighters. If the owner wants one anyway, the safest place is C's inhale (a draw of 0.4 px/frame for 40 frames that any jump or dash cancels), and I would not build it without a separate ask.

---

## 8. Recommendation

**Build A, THE HALO.** Reasons: (1) it is what the owner typed, no extra to explain, and one glow shows both the silence and the damage; (2) it keeps the radius the owner already accepted (190 / 210 / 220 against the old flat 220), so the signature is intact; (3) every phase hardens five ways at once (radius, damage, heal share, budget, look) and LIGHTS thickens faster; (4) the cheapest (+60 lines) and the easiest to keep fair, with every number a knob; (5) the 450 HP budget bounds the heal for every option alike, so the fight cannot be out-healed. B is the better story (it gets hungrier as it is hurt) but its growth is slow, hard to see, and peaks at the finish; C is the best feel for an owner who likes beats and tells, and the one to take if the drain should read like a pattern; its cost is the most code and a weaker silence between flares.

How to check it by playing (no tests): hold the boss for 60 s and see the heal stop at its budget (motes fade before they arrive); stand outside the glow for a whole fight and take nothing; die in the glow and respawn with no tick; watch the tide switch it off and on; look at the edge with the motes and find no line; read the toll on a melee fighter and a ranged one.

---

## 9. One-line descriptions for a question box (plain words, at most 200 characters)

- **A, THE HALO:** A steady dark glow round it. Stand inside and you lose a little health every half second and it heals; specials stay off. It grows wider and bites harder each phase.
- **B, THE HUNGER:** The glow grows as you hurt it. At full health a small halo; nearly dead, a wide one that bites and heals more. Fight it close early and from range at the end.
- **C, THE BREATH:** The glow breathes. Between breaths you can stand close; on each out-breath everyone inside takes a pulse and it heals. Step out in time. Faster and harder each phase.

---

## 10. Open points for the owner (recommendation first) and what was not checked

1. WHICH SHAPE: (a) A, recommended; (b) B; (c) C.
2. SPECIALS: keep them silenced inside the same glow (recommended; the director's accepted rule), or only damage and heal with no silence (weakens the signature).
3. THE HEAL CEILING: 450 HP a fight (recommended; at most +1:00 at the bot rate), or a lower or higher budget (a number).
4. THE BAND-3 ISLAND: the director's 560 px caps every radius at 224; widen it to 640 only if the owner wants a visibly wider P3 glow (a number from the owner).

Not checked: the SFX names to use; real fighters' heights and the weakest jumper against the vertical gap; whether the CPU reads a danger list the glow could join (the rush is solo, so only a test fighter would walk in); the exact island geometry once the boss glides; `_fsLock` as the right Final Smash flag (read in passing, not traced). The turn length, the fighter exposure e and the fighter-height gap are estimates; the simulation measures length only. Nothing was played.

Sources: `owner-rules.md`, `attack-picks.md`, `spec.md`, `boss-2763.md`, `attack-options-2763.md` (this folder); the game's `index.html` (POWER DRAIN of Two and One, `bossDmg`, the hush line, `applyHit`'s cap and knockback); the BFDI wiki page "Two Thousand Seven Hundred Sixty-Three" (raw wikitext, own tab, closed); `scratchpad\alg-rush\drain\sim.py` (fight-length simulation, python, no node).
