# Lightning's kill power, Yin-Yang's smash, and the pin / pull / freeze moves

*Read-only measurement, 2026-11-04, current main checkout (`artifacts/V1/index.html`). Nothing in the game was edited. Numbers come from a jsdom scene (scripts in the session scratchpad `measure1\`). Where a change "would target" something it is said as a target only: the owner decides.*

## How the numbers were measured (read this first)

- **Scene:** Goiky Field, the attacker at the centre of the floor (x 512), the foe standing still (no steering, no shield, no recovery), 3 stocks. "Light / mid / heavy" = Puffball (weight 46), Pen (100), Tree (138). Lightning weighs 54 (light), Yin-Yang 84.
- **Lowest KO %** = the lowest foe percent at which the move's hit (with the best of several foe positions the move reaches) sends the foe out of the arena. Two readings, shown as `A / B`:
  - **A "launched KO"**: the foe is still in hitstun (cannot act) when it crosses the line. This is the honest "this hit kills" number.
  - **B "no-recovery KO"**: the foe leaves at all, including a foe that skids off a ledge and drifts out after its hitstun ended. A real player or CPU could usually recover from these, so B is a floor, not a kill.
- **Near the edge** = attacker 190 to 340 px from the left ledge, hitting outward, foe 20 to 150 px from the attacker.
- Expert CPU numbers: 1v1, 3 stocks, Expert, Goiky Field, items off, 50 matches per fighter against the same five opponents (Pen, Tennis Ball, Puffball, Nickel, David). One 50-match run is noisy (a win count can move by about 6).
- Mid-pack comparison fighters: Fanny, Remote, Saw, Gaty, Yellow Face (all mid-table in the Hard-CPU win-rate report).

---

## 1. Lightning: kill power and closing

### 1a. Lowest KO % of each move (centre stage, `launched / no-recovery`)

| Move (Lightning) | Frames | Hit | Light | Mid | Heavy |
|---|---|---|---|---|---|
| **Smash** (a dash through the foe, stuns) | hits on frame 8, busy 29, **12 frames of self-stun** | 20% | **11 / 0** | **58 / 29** | **91 / 68** |
| **Final Smash** (storm, 100% on one foe) | catch, 79 frames to first hit, 237 total | 100% | 0 | 1 | 17 |
| Up tilt, Lightning Rod | st4 / act3 / end8 | 4.2% | 99 / 83 | 142 / 129 | 173 / 158 |
| Back air, Rear Zap | st4 / act3 / end9 | 7.1% | 124 / 69 | 179 / 121 | 220 / 163 |
| Up air, Sky Bolt | st3 / act3 / end7 | 4.4% | 112 / 98 | 158 / 141 | 192 / 172 |
| Chain Bolt (special) | instant, busy 18 | 8% | 140 / 70 | 201 / 119 | 246 / 164 |
| Jab (instant) | busy 18 | 5% | 175 / 103 | 245 / 155 | 283 / 209 |
| Floor Trap (down special) | hits on frame 7 | 11% | 161 / 105 | 228 / 154 | 277 / 209 |
| Finisher, Pocket Thundercloud | first bolt on frame 66, up to 4 bolts | 7% each | 189 / 120 | 243 / 173 | 281 / 238 |
| Forward air, Bolt Straight | st4 / act3 / end8 | 5.7% | 191 / 147 | 245 / 208 | 283 / 269 |
| Down tilt, Ground Arc | st3 / act2 / end6 | 3.3% | 140 / 117 | 193 / 168 | 232 / 203 |
| Up special, Flash (burning bolt) | hits on frame 12 | 5% + burn | 191 / 174 | 245 / 241 | 283 / 283 |
| Neutral air, down air | st3-6 | 2.6 to 6.7% | 190+ | 244+ | 282+ |

Near the ledge the smash falls to **0 / 0 (light), 27 / 7 (mid), 59 / 0 (heavy)** launched; the other moves barely change (Chain Bolt 163 mid, jab 207 mid).

**Plain reading:** Lightning has exactly one real kill move, the smash. Everything else needs the foe at 140% or more (mid weight) and 170% or more (heavy). Her up tilt (142) and her Chain Bolt (201) are chip and setup, not kills.

### 1b. Against five mid-pack fighters (mid foe, centre, `launched / no-recovery`)

| Fighter | Smash (L / M / H) | Best non-smash move (mid) | Moves that kill a mid foe at 100% or less |
|---|---|---|---|
| **Lightning** | 11 / 58 / 91 | 142 (up tilt) | smash only |
| Fanny | 53 / 106 / 136 | 137 (up tilt) | none |
| Remote | 92 / 140 / 176 | 119 (special) | none |
| Saw | 79 / 125 / 159 | 131 (up tilt) | none |
| Gaty (same smash row as Lightning) | 11 / 58 / 91 | 135 (finisher) | smash only |
| Yellow Face | 25 / 81 / 108 | 141 (up tilt) | smash only |

On paper Lightning is **not weaker** at killing than the mid-pack: her non-smash threshold (142) sits inside their range (119 to 141), and her smash is the **17th lowest of 109** fighters for a mid foe (18th for light, 17th for heavy). Her weakness is not the table.

### 1c. What she does in Expert CPU play (50 matches each, same opponents)

| Fighter | Match wins | Damage dealt / min | Damage taken / min | KOs scored | **Median foe % at her KO** | Own stocks lost (per match) |
|---|---|---|---|---|---|---|
| **Lightning** | 9 / 50 | 195 | **167** | 73 | **144** | **106 (2.1)** |
| Fanny | 5 / 50 | 146 | 174 | 57 | 127 | 92 (1.8) |
| Remote | 21 / 50 | 183 | 207 | 85 | 132 | 73 (1.5) |
| Saw | 26 / 50 | 195 | 205 | 104 | 122 | 76 (1.5) |
| Gaty | 14 / 50 | 174 | 202 | 80 | 133 | 86 (1.7) |
| Yellow Face | 16 / 50 | 187 | 187 | 84 | 134 | 87 (1.7) |

Lightning deals the most damage per minute (tied with Saw) and takes the least, yet she kills the **latest** (median 144%, mean 135%, against 122 to 134 for the others) and **loses the most stocks**. Many of the others' KOs come from their jab or a special that launches (Saw: 64 of 104 KOs from the jab).

**How the Expert CPU uses her kit** (uses per minute, and the KOs each move produced with the median foe % at the KO):

| Move | Uses / min | KOs (of 73) | Median foe % at KO |
|---|---|---|---|
| Jab | 15.0 | 7 | 185 |
| Up special (Flash) | 6.5 | 4 | 181 |
| Finisher (thundercloud) | 6.0 | 4 | 161 |
| Chain Bolt | 5.9 | 12 | 158 |
| Up tilt | 3.9 | 21 | 145 |
| Down special (Floor Trap) | 3.5 | 2 | 202 |
| Down tilt | 3.2 | 2 | 194 |
| Back air / forward air / up air / down air | 2.3 / 2.3 / 0.6 / 1.1 | 2 / 0 / 2 / 0 | 199 / - / 169 / - |
| **Smash** | **1.05** | **17** | **85** |

(A KO is credited to the last move she pressed before it, so a trap or cloud KO may be credited to a later press.) The smash is thrown about once a minute but takes 23% of her KOs, at the lowest percent by far. The up tilt (21 KOs at 145%) is her main closer, the move the table says needs 142% on a mid foe. The Final Smash never came up (no smash ball with items off).

### 1d. Why she may fail to close a stock (plain words)

1. **No reliable kill below 140% except the smash.** The up tilt kills a mid foe at 142, a heavy at 173. Chain Bolt, jab, trap, thundercloud and flash do 5 to 11% and launch very little (the Chain Bolt launch is about 4 px a frame). Her own CPU needs the foe near 145% to take a stock, 10 to 20 points later than the others.
2. **The one kill move is a dash with a cost.** It hits on frame 8, then she is stunned for 12 frames and busy for 29. It is a straight dash that stops at ledges, so a foe who steps back, jumps it or shields it punishes her. The Expert CPU throws it only once a minute.
3. **She is light (weight 54).** The others lose 1.5 to 1.8 stocks a match; she loses 2.1. A light fighter that also kills late spends more of the match low on stocks.
4. **Her best chip is not a combo that kills.** Ground Arc (3.3%) into Lightning Rod (4.2%) fits inside the stun (the down tilt hits on frame 3 and stuns 22 frames; she is free around frame 15 and the up tilt hits 4 frames later), but that is 7.5% together and the up tilt launches straight up. Chain Bolt (8%, instant, long reach, arcs to two more foes) is her best chip and launches almost nothing.
5. **Her Final Smash is a sure KO (0 to 17% on every weight) but only if she has a smash ball.** It needs the ball (an item) and a foe within 320 px at the catch. I could not confirm whether it was available in the five lost finals (see the end).

*What a change would target, for the owner:* the only levers the numbers point at are the up tilt's launch (the move the CPU actually closes with), the frames the smash costs her afterwards, and her weight. This is a report of where the gap is, not a recommendation.

---

## 2. Yin-Yang's smash: "The Right Goal"

### 2a. What the smash is

`SMASH_SPEC.yinyang` is a **lunge**: `{pat 'lunge', step 5, reach 32, dmg 16, kb 5, up -20, effect 'knockdown', cost {stun 28}}`.

| Part | Value |
|---|---|
| Startup / active | **Hits on frame 0** if the foe is in reach (a swing wedge about 56 px from his centre); otherwise he lunges 6 frames at 13 px a frame (about 78 px) and hits the first foe he touches |
| Damage | 16 x 1.5 = **24%** |
| Launch | `kb 5` forward and `up -20` (almost straight up). Launch speed scales with (0.5 + foe% x 0.014) x weight factor (100 / weight, at most 1.7) |
| After it | **17 frames of his own stun** (28 x 0.6), busy 23 frames, then the usual 26-frame smash cooldown; effect: knocks the foe down |
| Charge | None (every smash is "full" now) |
| Angle | Holding up or down tilts the launch about 22 degrees (`SMASH_ANGLE_TILT 0.38`) |
| Buff that matters | **Attack Up** (his Yang Throws Yin special sets it for 125 frames, "Yang alone hits harder"): damage x 1.4, launch x 1.2 |

### 2b. Lowest KO % (`launched / no-recovery`)

| Situation | Light (Puffball) | Mid (Pen) | Heavy (Tree) |
|---|---|---|---|
| Centre, plain smash | **21 / 2** | **72 / 46** | **98 / 84** |
| Centre, held up (tilted up) | 20 / 4 | 71 / 49 | 98 / 84 |
| Centre, **Yang alone** (after the special) | **0 / 0** | **42 / 19** | **74 / 58** |
| Centre, Yang alone and held up | 0 / 0 | 42 / 22 | 74 / 57 |
| Centre, held down (tilted down) | 26 / 0 | 82 / 19 | 109 / 60 |
| Near the left ledge (attacker 190 px from it), plain | 21 / 0 | 72 / 17 | 98 / 46 |
| Near the left ledge, Yang alone | 0 / 0 | 42 / 0 | 74 / 20 |
| **Foe on the very ledge (about 8 px in), held down** | **0 / 0** | **20 / 0** | **51 / 9** |

(Across all roster fighters with the best foe position, Yin-Yang's plain smash is 18 / 68 / 95: 37th, 35th and 27th lowest of 109. The roster median is 29 / 85 / 111. Four fighters' smashes do not KO even at 300% in this scene.)

### 2c. Is 24% a setup or just a hit?

- **On a light foe it is just a hit.** The plain smash kills Puffball (weight 46) at 21% (18% from the best spot): a foe at 24% dies to one clean hit, no setup, no charge. This comes from the foe being light and the launch being almost straight up, so the top of the arena is reached.
- **On a mid foe (weight 100) it is 72%; on a heavy (138) it is 98%.** 24% is not reachable by a plain hit on these.
- **Setups that lower it:** Yang alone (special first, 125 frames) makes it 42% on mid and 74% on heavy and kills a light foe at 0%. A down-angled smash on a foe standing at the very edge of the ledge (foe within about 10 px of the drop, he faces outward, V with down held) kills a mid foe at 20% and a heavy at 51%: that is the nearest thing to "24% if used right" for a normal-weight foe, and it needs the foe stood on the ledge.
- **Compared with the others:** the lowest smash KOs in the roster are 45 to 54% on a mid foe for the top ten (Money 45, Eraser 48, Dora, Baseball, Nickel (II), Jack, Tapey 52). Yin-Yang is 35th at 68%: above average, not special. What sets his smash apart is that it hits on frame 0 against a foe who is already close, and that Yang alone and the ledge down-angle bring it far below that.

---

## 3. Pin / pull / freeze moves

**Method:** for each fighter in the winner-move-types "pin, pull or freeze" list, each of the five main moves (special, up, down, smash, finisher) was fired at a still foe at six positions and foe percents 0, 60 and 120. I recorded how many frames the foe is rooted, frozen or held (an effect that takes its control: grab, stun, hold), the user's own cooldown and stun, and then asked: **if the user follows up in the first free frame with a smash, jab or up tilt, at what foe percent does it KO** (a launched KO of a mid foe), against the move alone. Whether the foe can escape comes from the code (what a root, a freeze and a hold do to the foe's inputs), because a CPU foe walking out of a shot is not an escape test.

**What the game does with each state:**

| State | What the foe can do | Ends by | Safety valves in code |
|---|---|---|---|
| **Root** (`rooted`) | Cannot walk (its sideways speed is zeroed every frame). Still attacks, jumps straight up, uses specials. | Timer only; no mash | Toothpaste's root: a foe she just rooted cannot be rooted by her traps again for 60 frames |
| **Freeze** (`frozen`) | **Nothing:** every input is masked. | Timer; any hit on a frozen foe ends it and hits 1.6 x damage, 1.5 x launch | Cap 45 frames in code; **70 frames of freeze immunity** after it; Gelatin's own freeze applies only to a foe above 40% |
| **Hold by a finisher** (`_fxBy`) | Nothing; the foe is moved with the move, with 2 frames of invulnerability each frame, so no one else can hit them. | Timer; a hit on the **holder** ends it (Snowball's hitstun ends the ball) | None for the foe: no mash |
| **Grab-hold** (`_hold`) | Mashing adds struggle time | Struggle or timer | Mash works |

### 3a. Measured holds (mid foe, still foe)

| Fighter and move | What it does | Foe held (frames) | User cost | Best follow-up and KO % (mid) | Escape |
|---|---|---|---|---|---|
| **Gelatin**, Freeze Syringe (special) | freeze at foe above 40% | **frozen 48** | special cooldown 48 | **up tilt 102** (move alone 244) | None while frozen; 70 f immunity afterwards; ice breaks on a hit |
| Gelatin, Freeze Mine (down) | mine, freeze on step | frozen 48 | none listed | up tilt 102 | same |
| Gelatin, smash | freeze | frozen 51 | smash cd 42 | **up tilt 90** (smash alone 154) | same |
| **Snowball**, smash | freeze at foe above 40% | frozen 50 (at 120%) | smash cd 42 | none better than alone (226) | none while frozen |
| **Snowball**, finisher (pack and bowl) | grabs, packs, bowls the ball | **held 67**, in hitstun throughout | finisher cooldown 74 | 6 to 12% then knockdown, no kill (jab follow-up 236) | **None.** Dodging the grab is the only counter; once caught, only a hit on Snowball frees the foe, and the foe can't be hit by anyone else |
| **Toothpaste**, special (shot) | root | **rooted 64** (+44 f hitstun) | special cooldown 55 | **up tilt 129** (alone 238) | Timer only; can still attack; 60 f re-root immunity |
| Toothpaste, Root Trap (down) | root on step | rooted 63 | none listed | up tilt 135 | same |
| **Lollipop**, Sticky Sucker (special) | root | rooted 63 | special cooldown 67 | up tilt 135 | Timer only |
| Lollipop, Rooting Trap (down) | root on step | rooted 63 | none | up tilt 134 | same |
| Lollipop, smash | root, extra launch on a rooted foe | **rooted 76** | smash cd 39 | up tilt 120 (alone 183) | Timer only |
| **Coiny**, finisher (Slap Fight) | pull the foe into a slap fight | held 62 | finisher cooldown | no kill (finale 10%) | **Mash.** "Out-slap them or they break free": escapable by design |
| **Magnet**, finisher (fridge magnets) | root, drag to another foe | **rooted 89** | finisher cooldown | up tilt 137 (smash 184) | Timer only, can still attack |
| Magnet, smash | pull, hit | held 29 | self-stun 16 | smash alone 102 | n/a |
| **Fries**, finisher (carton) | cap over the foe 0.8 s | rooted 53 (+24 hitstun) | finisher cooldown | up tilt 145 | Timer only |
| **Tree**, smash | root smash | rooted 75 | none | smash alone 170 | Timer only |
| **Taco**, Jawbreaker (special) | root | rooted 40 | special cooldown 72 | up tilt 123 | Timer only |
| Taco, Retractable Arms (down) | drag, stun | held 21 | none | up tilt 128 | n/a |
| **Rose**, Rising Lash (up) | root | rooted 33 | none | up tilt 127 | Timer only |
| **Tapey**, smash | taped hit, stun | held 46 | smash cd 15, self-stun 12 | smash 77 (alone 77) | stun only |
| Tapey, finisher (rewind) | winds the foe back 2 s | held 45 | finisher cooldown | **smash 77** (alone 242) | A hit on Tapey snaps the tape |
| **David**, finisher (Shoulder Toss) | grab and toss | held 18 | finisher cooldown | **smash 72** (alone 157) | n/a (grab) |
| Knife, special | shock | held 32 | special cooldown 60 | smash 88 | stun only |
| Blueberry, Coiny, Magnet, others (up specials, some finishers) | short stuns | 14 to 36 | none | 74 to 135 | stun only |

Cake and Barf Bag showed no loss of control in the probe. Cake's pull and Barf Bag's control steal (2 s "fights on her side") were not caught by it (see the end).

### 3b. What these show

- **The freeze is the only real "pin into a kill".** Gelatin's freeze plus one up tilt kills a mid foe at **about 100%** (90% with the smash freeze), against 244% for the move alone. The foe can do nothing for 48 to 51 frames. The freeze starts from a shot or a mine that can be dodged, only works on a foe above 40%, and the 70-frame immunity stops a chain. The ice breaks on the hit and the hit is 1.6 x as strong, so the kill comes from that bonus.
- **Roots are weak pins.** A root (33 to 89 frames) stops walking only; the foe can still hit back and jump straight up. The best follow-up kills a mid foe at 120 to 145%, about the same as the up tilt kills anyone. Roots mostly set up chip damage and corners.
- **David's finisher and Tapey's rewind lead to a smash that kills a mid foe at 72 to 77%**, but Tapey's smash alone also kills at 77: it is her smash that does it, not the pin.
- **Hard-to-escape things to flag:**
  1. **Snowball's finisher: 67 frames, no escape, and no one else can hit the foe.** Once the grab lands, the only way out is to hit Snowball. It costs the foe 6 to 12% and a knockdown, with no follow-up kill. By the owner's "an unescapable thing is a bug" rule this is the one that needs an owner decision (it is timer-limited, not permanent).
  2. **Gelatin's freeze (48 to 51 frames, all inputs masked, no mash).** Timer-limited, can't chain (70-frame immunity), ends on any hit. Same question, but it has the strongest safety valves of the list.
  3. **Magnet's finisher root (89 frames, 1.5 s)** is the longest root; the foe can still attack.
  4. Tapey's rewind and the held finishers (45 to 62 frames) are timer-limited.
  No pin in this list is **permanent**: every one ends on a timer. I did not find one with an unbounded hold.

---

## What I could not verify

- **Whether Lightning's Final Smash was available in her five lost finals.** The smash ball is an item; several finals were played "items off". The 0 to 17% Final Smash KO is a sure KO when she has it, but I could not tell from the log whether she did.
- **A CPU's real escape from a freeze or hold.** The CPU victims in the probe moved out of shots and traps instead of being held, so escape rules come from reading the code (inputs masked while frozen; no struggle code for finisher holds), not from a CPU test. Foe kill percents are for a foe that does not steer or recover: a real foe could shave some of these (especially the "no-recovery" B column).
- **The 24% claim itself.** A plain hit gets it only on a light foe (Puffball 21%); heavier foes need Yang alone or the ledge. I don't know which fighter and position the owner saw.
- **Barf Bag's and Cake's pins** (control steal, pull) were not measured as a loss of control, only as a missing signal.
- **The win counts** (Lightning 9/50) differ from the cup finals (1 win, 5 final losses) because the opponent mix and format differ; 50 matches is noisy.
- Some measured freezes run 48 to 51 frames although the code's freeze cap is 45; I did not trace why.
