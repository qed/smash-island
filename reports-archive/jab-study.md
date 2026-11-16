# Jab study: why jabs score so many KOs

*2026-10-28. Measurement only: nothing in the game was changed and nothing was committed. Every fix below was tried by patching the
game text in memory. Measured on ii-dlc 22a9830 / af8305c. Since the win-rate run's fa953d3, the only fighting changes are pummel damage
and Puffball's X / Grow, and neither touches jabs. Bow is not touched by any option except option 3, which touches every jab the
same way.*

## The short answer

1. **Most of the top "jab KOs" are not normal jabs.** Seven up-specials (Firey's Flare Up, Magnet's, Cake's, Blueberry's, Fan's,
   David's, Trophy's) give the fighter a banked **empowered jab**. It never runs out, only a jab spends it, and it turns a 6% jab
   into a 16% hit with almost twice the launch. It comes out on frame 2 like any jab. In replays of Firey's, Magnet's and Cake's
   45 win-rate matches, **66 of their 68 jab KOs were this empowered jab**, landed in the middle of the stage, on a foe who was not
   stunned and not off the stage. Magnet's KO'd at a median of **37%**.
2. **Normal jabs launch with the same formula as smashes.** How far a hit sends you depends on the move's launch number and the
   foe's %, **not on the hit's own damage**. A 6-10% jab with launch 7-11 sends people 60-90% as far as a typical smash (launch 12).
   So the strong normal jabs (Balloony, Profily, Saw, Pencil, Pen, Yellow Face, Firey Jr.) KO at 105-150% like a smash would, with
   no wind-up. Four of the 15 foes alone (Profily, Pen, Saw, Firey Jr.) scored half of all the jab KOs on the fighters measured.
3. **Jab into jab is a true combo if you walk forward** (each jab stuns 14-24 frames, the next is ready in 12). Holding X while
   walking carries the foe from the middle of the stage off the edge. **CPUs do not do this**: only 8% of their jab hits in the
   replays were a jab comboing into a jab, and no CPU ever strung more than 3. So it is not why CPUs lose, but it is the "weird" part
   a player feels, and it takes no skill.

CPUs cannot answer any of this: the game has no shield and no dodge, a stunned fighter cannot act, and a frame-2 move cannot be
reacted to. Win rates from CPU-vs-CPU are a rough guide only (the owner beats Expert CPUs without being hit).

## 1. What a jab is today (all 103 fighters, measured)

| | Typical (median) | Range |
|---|---|---|
| Damage per press | 7% | 3% (Leafy, Fanny, Teardrop) to 12% (Balloony) |
| Frames until it hits | 2 (the press frame +1) | 5 for Puffball's puff |
| Repeat after a jab that **lands** | 12 frames (14-16 with the hit freeze) | same for all |
| Repeat after a **miss** | 22 frames | same for all |
| Pressed vs held | the same: X is read as held every frame | only Ruler differed |
| Stun it gives | 19 frames | 14-24 (Puffball's puff 8) |
| Launch speed at 100% / 150% | 20 / 35 px a frame | Balloony 30 / 51 |
| One jab KOs a recovering CPU (medium weight), **middle of stage** | 182% | Balloony 118, Profily 132, Saw 133, Pencil 138; 17 fighters never below 200% |
| One jab KOs a recovering CPU **at the ledge** | 126% | Balloony 53, Profily 70, Saw 70, Pencil 76, Blocky 83, Yellow Face 89, Magnet 90, Pen 100 |

("Recovering CPU" = the house KO method: the dummy turns into a Hard CPU the frame it is hit and jumps / up-specials back; best of 3.)

One odd one to check: **MeTag's** plain jab (the same 8.5% / launch 9.5 numbers as Magnet's) KO'd the recovering CPU at the ledge
even at 0%. Something in his kit adds to it.

## 2. Cause 1: the banked empowered jab (the top of the jab-KO list)

**How it works.** These up-specials carry `self:{empower}`: Firey (Flare Up), David, Cake, Trophy, Fan, Blueberry, Magnet. (Fan's,
Blueberry's and Magnet's rows say `empower:45`, which reads like a time limit, but the number is not used.) After the up-special the
next **jab** does `round(damage x 2.1) + 3` and `round(launch x 1.6) + 2`. Smashes, tilts and specials do not spend it, and it never
runs out (only losing a stock clears it), so every recovery banks one. Also from specials: Bracelety, Money, Liy (switch on), Loser, Nickel (II), and the shots of
Puffball, Ruby and Fanny.

The extra damage is added **before** the launch is worked out, and it also makes the stun 26-30 frames instead of 18. So the foe
flies farther and drifts out of control longer.

**What the empowered jab does** (recovering medium CPU; middle / ledge):

| Jab row | Normal jab | Empowered jab | Their own smash (middle) |
|---|---|---|---|
| 6% / launch 7 (Firey, Loser, Nickel) | 193% / 133% | **87% / 21%** (16%, launch 13) | Firey 87% (earlier smash run) |
| 8% / launch 9 (Pen's row) | 161% / 100% | **51% / 0%** (20%) | |
| 10% / 10 (Pencil's row) | 138% / 76% | **35% / 0%** (24%) | |
| 10% / 9 (Yellow Face's row) | 148% / 89% | **47% / 0%** (24%) | |
| Bracelety / Money (their special banks it) | 174 / 109, 192 / 126 | 58 / 3, 77 / 14 | |

So Firey's free empowered jab is as strong as his full smash in the middle of the stage, and near the ledge it KOs at 21%. On
Goiky Field the side KO line is only about 220 px past the ledge and nothing slows a stunned fighter sideways (see
`reports/edge-ko-study.md`). That is why it kills so early at the edge.

**In matches.** I replayed Firey's, Magnet's and Cake's 15 win-rate matches (same seeds) and logged every jab:

| | Firey | Magnet | Cake |
|---|---|---|---|
| Jab KOs / all KOs | 25 / 29 | 21 / 25 | 22 / 23 |
| ...that were the empowered jab | **25** | **20** | **21** |
| Foe's % when the KO jab hit (median) | 91% | **37%** | 92% |
| Foe off the stage when hit | 0 | 0 | 0 |
| KO jab came inside a combo | 4 | 0 | 1 |
| Distance from the ledge (median) | 286 px | 251 px | 208 px |
| Empowered jabs that KO'd | 45% (25 of 55) | 45% (20 of 44) | 30% (21 of 70) |
| Their jab hits that came inside a combo | 21% | 8% | 16% |
| Longest jab string | 2 | 2 | 2 |

In the whole win-rate run, the seven up-special fighters scored **121 of their 157 KOs with a jab (77%)**. Everyone else: 336 of 1402
(24%).

**Top vs average.** On paper Firey's jab is average: 6%, launch 7, the same numbers as Loser, Nickel, Bell, Basketball and Box. Those
five scored 12, 4, 4, 0 and 0 jab KOs. Firey scored 23. Loser is the only one of them with a banked empowered jab too (from his
special), and he has the most of the five.

## 3. Cause 2: normal jabs launch like small smashes

How far any hit sends you = `launch x (0.5 + 1.4% per % of damage) x weight x (more past 100%)`. The hit's own damage is not in it,
so a jab's launch number counts as much as a smash's. Jab launch numbers are 4-11 (median 8); smash launch numbers are about 12.
Add the frame-2 start and the 12-frame repeat, and the strong normal jabs are KO moves that cannot be seen coming.

The foes in the win-rate run show it. The bottom 30 (mostly Inanimate Insanity) fighters died to a foe's jab 233 times out of 647.
Across the whole run, 323 of the 635 jab deaths came from four strong normal jabs: Profily 108 (71% of all his KOs; his price-tag mark also adds damage), Pen 80, Saw 74, Firey Jr. 61.
Median KO %: 105-152%. Jab KOs leave through the side 78% of the time. Other KOs mostly leave through the top.

## 4. Cause 3 (for players): jab into jab is a true combo when you walk

A jab that lands stuns 14-24 frames, and the next jab is ready in 12. The owner asked for that +6 stun so combos can be done by hand
("I cant spam at the speed of light"). But jab into jab links too. **Standing still**, one jab pushes the foe out of reach (multi-hit
jabs land their 2-3 hits). **Holding X and walking forward** links jab after jab:

- median 5 jabs in a row, 0% to 33% (most: Fanny, Leafy, Teardrop 13; Ruby 11; Liy 12; David 9; Firey, Cake, Blueberry 7);
- it carries the foe from the middle of the stage **off the edge** for 101 of 103 fighters;
- a CPU that gets control back is locked just as long (a stunned fighter cannot act). Fanny, Paintbrush, Dough and Cammy KO'd a CPU
  with nothing but held X + walking within 15 s.

CPUs do not play like this. In the replays (887 CPU jab hits, both sides) 83% of jab hits were not part of any combo, only 8% were a
jab comboing into a jab, and the longest jab string was 3. So this is not why CPUs lose, but a player can do it and it takes no skill.

## 5. Why CPUs lose to jabs

- **No defence exists.** There is no shield and no dodge in the game. In stun a fighter cannot act. Out of stun its only answers are
  to move away, jump or hit first.
- **Jabs cannot be reacted to.** They hit on frame 2 after the press. The empowered jab looks like any jab (only a small buff icon).
- **The KO jab is a clean single hit**, not a string and not off the stage: the CPU is simply standing in range of a frame-2 hit that
  launches like a smash.
- **Jab launch grows like a smash's at high %** (+0.6% per % past 100%), and nothing slows a stunned fighter sideways near the edge.

## 6. Fix options (with numbers)

### Option 1 (main): the empowered jab keeps its damage but loses its launch bonus

Change `kb = round(kb x 1.6) + 2` to `kb` (the damage stays `round(dmg x 2.1) + 3`, so it still feels like a big hit). Optional: make
the bank run out (the `empower:45` in three rows suggests it was meant to), or let any attack spend it.

| Empowered jab, recovering CPU (middle / ledge) | Today | Option 1 | Bigger cut (dmg x1.3 +2, launch x1.1) |
|---|---|---|---|
| 6% / 7 row (Firey, Loser, Nickel) | 87 / 21 | **142 / 83** | 165 / 102 |
| Pen's 8 / 9 row | 51 / 0 | **107 / 42** | 128 / 65 |
| Pencil's 10 / 10 row | 35 / 0 | **94 / 29** | |
| Yellow Face's 10 / 9 row | 47 / 0 | **103 / 38** | |

With option 1 the empowered jab is about as strong as the strongest normal jabs (Pencil's 138 / 76). It stays a reward, but it is not a
free full smash.

In matches: the same 15 seeds, foes and sides, with the change on for both sides (David, one of the 15 foes, banks one too).

| | Today (replay) | Option 1 |
|---|---|---|
| **Firey** wins | 15 / 15 | **13 / 15** |
| Firey KOs (by jab) | 29 (25) | 27 (14) |
| Foe's % when Firey's KO jab hit: median (lowest tenth) | 91% (48%) | **134% (110%)** |
| Firey's deaths | 9 | 12 |
| **Magnet** wins | 12 / 15 (13 in the win-rate run) | **10 / 15** |
| Magnet KOs (by jab) | 25 (21) | 21 (14) |
| Foe's % when Magnet's KO jab hit: median (lowest tenth) | 37% (21%) | **72% (15%)** |
| Magnet's deaths | 10 | 14 |

(Puffball changed between the two builds. Leaving out the Puffball match gives the same picture: Firey 14/14 to 13/14, Magnet 12/14
to 9/14.) Firey drops to the strong end and his other moves take over the KOs. The jab still scores half of them, at 134% instead of 91%.

**Balance care.** This hits all seven up-special fighters. Only Firey (15/15) is above the strong end, and Magnet already falls to
about 10. Magnet 13, David 13 and Cake 12 are at the strong end. Blueberry 9 and Fan 8 are in the middle, and Trophy (2/15) is at the
bottom with 8 of his 10 KOs from it. Under the house rules: give Firey option 1. Give Magnet a milder cut (for example launch x1.3
instead of x1.6 +2; not measured) so her KOs stop happening at 37% without pulling her into the middle. Leave Trophy's as it is, or make
it stronger. Re-check David, Cake, Fan and Blueberry before touching them.

### Option 2: a ceiling on how fast a jab can launch (for the strong normal jabs)

A jab, normal or empowered, never launches faster than **36 px a frame** (what a 6% / 7 jab does at about 150%).

- Middle of the stage: **no normal jab KOs a recovering CPU below 200%** any more (today: median 182%; Balloony 118, Profily 132,
  Saw 133, Pencil 138). Tested on Firey, Pen, Pencil, Nickel, Yellow Face, Bracelety, Liy, Loser and Money: all went to "no KO".
- At the ledge: unchanged (Firey 133, Pen 100, Pencil 76...). Jabs can still finish a foe at the edge.
- The empowered jab: unchanged (87 / 21). Its KOs happen at lower speeds, through the long stun and the close KO line. **So option 2
  does not replace option 1.** It targets the foes' strong normal jabs at high %.
- A lower ceiling would not reliably stop ledge KOs. Pen's and Pencil's jabs KO at the ledge at launch speeds of only 21-24 px a
  frame (their longer stun does the rest), so a ceiling low enough to stop those would also flatten every jab.

### Option 3: a jab cannot combo into your own jab (stops the walking lock)

While a foe is still stunned by your jab, your next jab is stopped by their hit-grace (it misses). Every other move still combos off a
jab (tilts, aerials, smash, specials), and a combo still has no length limit, as the owner asked.

| Hold X + walk, from 0% in the middle | Today | Option 3 | Alternative: jab roots you for 10 frames when it lands |
|---|---|---|---|
| Firey | 7 jabs, 0 to 42% | 1, 6% | 1, 6% |
| Cake | 7, 42% | 1, 6% | 1, 6% |
| David | 9, 45% | 1, 5% | 2, 10% |
| Fanny | 13, 39% | 1, 3% | 3, 9% |
| Leafy | 13, 39% | 1, 3% | 2, 6% |
| Ruby | 11, 44% | 1, 4% | 2, 8% |
| Pen | 3, 24% | 1, 8% | 1, 8% |
| Pencil | 2, 20% | 1, 10% | 1, 10% |

With option 3, holding X lands a jab every 36-37 frames instead of every 14-16, so the foe gets about 18 free frames between jabs. It
barely changes CPU-vs-CPU KO numbers, because CPUs hardly string jabs.

Also tried: a longer repeat gap after a jab lands (`JAB_HIT_CD` 12 to 20). The lock ends after 1 jab for every jab that stuns less than 20
frames. Pencil's 22-frame stun still links twice. But held X then lands a jab every 22-23 frames, so the foe only gets 3-5 free frames.
Against a CPU in 15 s that was still 16-27 jab hits for Fanny, Leafy, Ruby and David, against 18 free frames with option 3. It also
slows every landed jab, not just jab into jab. Not recommended.

### What I would do

1. **Option 1 first**, because it is the cause of the top of the jab-KO list. Firey gets the full version (measured: 15/15 to 13/15).
   Magnet gets a milder cut. Trophy keeps his or gets a stronger one. The others get re-checked first.
2. **Option 3** as a feel fix. It takes nothing from combos that go from a jab into other moves.
3. **Option 2** only if, after option 1, the strong normal jabs (Balloony, Profily, Saw, Pencil, Pen) still feel like smashes.

Pair all of this with whatever `edge-ko-study.md` lands. A closer side KO line makes every edge hit stronger, jabs included.

## Method and files

All scripts and raw output are in
`C:\Users\carad\AppData\Local\Temp\claude\C--Users-carad--claude\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\balance2\` (a temp folder).

- Jab numbers: `scratchpad/balance2/jabprobe.mjs` (house KO method from `botsmash/kopct.mjs`: Goiky Field, Pen dummy at weight 90,
  turned into a Hard CPU when hit, best of 3, halving search on 0-200%). Real presses for the repeat, combo and walking tests.
  Output: `balance2/v0_s0-2.jsonl`, table `balance2/v0_table.txt`; empowered and option runs `balance2/ko2_*.jsonl` and
  `balance2/old/ko2_*.jsonl`; combo-lock runs `balance2/lock_*.jsonl`.
- Match replays: `balance2/jabmatch.mjs` (the win-rate run's seeds, foes and sides; logs every jab hit and KO), `m_<variant>_<fighter>.jsonl`.
  They are not frame-identical to the win-rate run (pummels went to 2.5% in between), but the results line up (Firey 15/15).
- In-memory variants: `balance2/jabtx.mjs`.
- The PC was running slow after 11:20 (CPU at about a third of its speed), so the option runs cover a smaller set of fighters than the
  as-shipped run.
