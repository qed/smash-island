# Why the bottom 20 lose (and the smallest buff for each)

*2026-10-28. Measurement only: nothing in the game was changed and nothing was committed. The data is the roster win-rate run (each
fighter plays 15 one-on-one matches against the same 15 mid-pack Hard CPUs, all from BFDI: 2 stocks, Goiky Field, items off), its
match logs (who KO'd whom, with which move), the live kit tables, and the CPU brain's code. The game read is ii-dlc 4b3397f. Since the
run's fa953d3, the only fighting changes are pummels at 2.5% and Puffball's X / Grow. Re-playing three of the run's matches on today's
build gave the same results. No buff below was measured. Each is a number to A/B before it ships.*

**Bow is left alone**, as you asked. Why her CPU goes 0/15 is in section 4. No change is proposed.

## The short answer

The bottom 20 (no Bow) are 15 Inanimate Insanity fighters and 5 BFDI ones (Snowball, Teardrop, Fern, Pillow, Barf Bag). They do not die
much earlier than everyone else: 22 deaths each against 17 for the rest of the roster. What they lack is KOs: **7.9 KOs in 15
matches against 17.2**. **The all-BFDI foe pool is not the cause.** Against a half-II pool, the six bottom II fighters tested won 6 of
90 matches instead of 5 (section 1). Four things cause most of it.

1. **Short jabs, and the CPU fights at jab range.** A CPU walks in until the foe is inside its own jab's reach, then mostly strings
   jabs, tilts and aerials. It saves specials, smashes and finishers for openings (section 3). So a jab with no reach means the CPU walks
   in to point-blank range and gets jabbed first. **Eight bottom kits have no jab row of their own.** They get the default jab: 5%,
   reach 0, the shortest in the game. These are Goo, Lifering, Yin-Yang, Starfruit, Cammy, Trophy, Clover and Candle. Box and Tissues
   have reach 2. Across the roster, the 22 fighters with jab reach 0-2 average **3.4 wins in 15**. Reach 3-8 averages 7.8, 9-13
   averages 8.4, and 14+ averages 6.6. **16 of those 22 are II fighters.** The II median jab reach is 4 against BFDI's 10, and no II
   jab does more than 9% a press, while nine BFDI jabs do. That is a big part of the II gap.
2. **Moves that do no damage.** Many bottom kits spend buttons on moves that never hurt anyone:
   - Goo's and Lifering's finishers do 0%.
   - Box has three specials that never hit.
   - Balloon, Starfruit, Clover and Candle each have two.
   - Barf Bag's special does no damage.
   - Starfruit's 14% special works once a stock unless he presses Recycle.

   The damage they do deal comes from their weak jab.
3. **The CPU misreads some kits.** Box and Barf Bag are treated as shooters, so they keep 230 px away and fire a move that is not a
   shot. Cammy's Snapshot is fired point-blank, but it only hits 170 px ahead. Starfruit never presses Recycle. Teardrop's 14% kick
   hardly gets used. Bow's Chair Slam and Snowballs are never pressed. Long smashes (Tissues' 480 px beam, Lightbulb's 520 px beam) are only
   fired point-blank. These are CPU problems, not kit problems. A player is not held back by them. This is why the win rates are only
   a rough guide (you hitless Expert CPUs).
4. **The foes' jabs.** 36% of the bottom 20's deaths (158 of 442) were a foe's jab. 118 of those 158 came from six foes: Profily 27,
   Puffball 27, Saw 20, Pen 19, Firey Jr. 13 and Yellow Face 12. Puffball's bop was narrowed today, after the run. The others are the
   "strong normal jabs" in `jab-study.md`. That study's option 2 (a ceiling on how fast a jab can launch) takes the most from exactly
   these, so **the jab fixes alone should lift the bottom** without touching them.

**Suggested order:** first the jab fixes from `jab-study.md`. Then one shared change, **jab reach 8** for the ten short-jab kits
(reach only: damage and launch stay as they are, so no jab gets more KO power). Then re-run the 15-match yardstick. Use the
one-number kit buffs below only on fighters still at the bottom after that.

## 1. The fairness check: is it the all-BFDI foe pool?

**No. The foe pool explains almost none of the gap.**

I took 6 bottom II fighters and 4 mid BFDI fighters (none of them in the foe pool) and gave each 15 matches against a **mixed pool**:
- **7 BFDI mid-pack foes:** Pen, Tennis Ball, Fanny, Firey Jr., Lightning, Profily and Yellow Face (their own average: 7.7 wins in 15).
- **8 II mid-pack foes:** Blueberry, Bonesaw, Test Tube, Pickle, Fan, Silver Spoon, Paintbrush and Spikey (8.0 wins in 15).

The rules were the yardstick's (2 stocks, Hard, Goiky Field, items off, sides alternating). The BFDI half is the win-rate run's own
matches against those 7: same seeds and rules, and re-playing three of them on today's build gave the same results. The 8 II matches
were played new (80 matches, 0 errors).

| | All-BFDI pool (15) | Mixed pool (15) | vs the 7 BFDI | vs the 8 II |
|---|---|---|---|---|
| Goo | 0 | 0 | 0 / 7 | 0 / 8 |
| Box | 1 | 0 | 0 / 7 | 0 / 8 |
| Lifering | 1 | 0 | 0 / 7 | 0 / 8 |
| Balloon | 1 | 1 | 1 / 7 | 0 / 8 |
| Tissues | 1 | 2 | 1 / 7 | 1 / 8 |
| Yin-Yang | 1 | 3 | 1 / 7 | 2 / 8 |
| **Bottom 6 II** | **5 / 90 (6%)** | **6 / 90 (7%)** | **3 / 42 (7%)** | **3 / 48 (6%)** |
| Fries | 9 | 10 | 4 / 7 | 6 / 8 |
| TV | 8 | 7 | 4 / 7 | 3 / 8 |
| Gelatin | 7 | 6 | 3 / 7 | 3 / 8 |
| Bell | 7 | 4 | 3 / 7 | 1 / 8 |
| **Mid 4 BFDI** | **31 / 60 (52%)** | **27 / 60 (45%)** | **14 / 28 (50%)** | **13 / 32 (41%)** |

- The bottom six lose to II mid-pack fighters exactly as often as to BFDI ones: 6% against 7%. Their KO and death counts are the same
  too (20 KOs / 76 deaths in 48 matches against II; 18 / 68 in 42 against BFDI).
- The mid BFDI fighters find the II mid-pack *a bit harder*, not easier (41% against 50%; within noise at 30 matches). So an II
  fighter is not held back by facing BFDI. The II mid-pack hold their own against both.
- **The bottom II fighters are weak, not unlucky in their foes.** The reasons are the kit ones in section 2 (short jabs, moves with no
  damage, CPU misreads), and most of them are not about BFDI at all. The franchise pattern exists because those weaknesses cluster in
  the II batches (the default and reach-2 jab rows, the shared finishers), not because of the foe pool.
- Noise: about +/-7 points on 42-48 matches, and +/-9 on 28-32. 33 of the 80 new matches went to the 2-minute cap.

## 2. Each fighter

The columns: wins in 15, KOs, deaths, the foe's average % at death (higher means they survive longer), and timeouts at the 2-minute cap
(43% of the bottom 20's matches timed out). **"Jab-range fix"** means jab reach goes to 8 (shared change, above).

| # | Fighter | Wins | KOs | Deaths (avg %) | Timeouts | Jab (dmg / launch / reach) | Weight |
|---|---|---|---|---|---|---|---|
| 1 | Goo | 0 | 5 | 21 (122%) | 9 | default 5 / 7 / 0 | 76 |
| 2 | Box | 1 | 3 | 20 (140%) | 9 | 6 / 7 / 2 | 86 |
| 3 | Lifering | 1 | 5 | 24 (118%) | 5 | default 5 / 7 / 0 | 75 |
| 4 | Balloon | 1 | 7 | 25 (102%) | 4 | 6 / 7 / 10 | 60 |
| 5 | Tissues | 1 | 8 | 22 (123%) | 7 | 6 / 7 / 2 | 83 |
| 6 | Yin-Yang | 1 | 9 | 23 (124%) | 6 | default 5 / 7 / 0 | 84 |
| 7 | Snowball (BFDI) | 1 | 9 | 24 (135%) | 5 | 8 / 9 / 2 | 94 |
| 8 | Teardrop (BFDI) | 1 | 10 | 22 (111%) | 7 | 3 / 5 / 0 | 66 |
| 9 | Starfruit | 2 | 6 | 17 (120%) | 9 | default 5 / 7 / 0 | 70 |
| 10 | Cammy | 2 | 6 | 21 (122%) | 7 | default 5 / 7 / 0 | 74 |
| 11 | Paper | 2 | 7 | 25 (111%) | 5 | 6 / 7 / 14 | 64 |
| 12 | Fern (BFDI) | 2 | 7 | 22 (140%) | 7 | 8 / 7 / 6 | 104 |
| 13 | Pillow (BFDI) | 2 | 9 | 22 (140%) | 6 | 8 / 8 / 7 | 92 |
| 14 | Lightbulb | 2 | 10 | 22 (109%) | 7 | 6 / 7 / 12 | 70 |
| 15 | Trophy | 2 | 10 | 24 (137%) | 4 | default 5 / 7 / 0 | 88 |
| 16 | Clover | 2 | 11 | 22 (117%) | 6 | default 5 / 7 / 0 | 70 |
| 17 | Knife | 2 | 13 | 21 (132%) | 6 | 7 / 8 / 16 | 88 |
| 18 | Candle | 3 | 6 | 21 (120%) | 8 | default 5 / 7 / 0 | 72 |
| 19 | Apple | 3 | 8 | 25 (113%) | 5 | 7 / 8 / 15 | 70 |
| 20 | Barf Bag (BFDI) | 3 | 9 | 19 (117%) | 7 | 2 x 5.2 / 9 / 14 | 88 |

For reference: the roster's median jab is 7% / launch 8 / reach 10, its median weight is 86, and its median smash launch is 12. The rest
of the roster averages 17 KOs and 17 deaths.

**1. Goo (0/15).** His five KOs each came from a different move, and **none from his smash**, though Puffed Up is one of the strongest
in the game (it KOs a medium CPU from about 37%). A CPU only smashes when it has just stunned the foe in reach, and Goo's reach-0 jab
seldom lands. So his CPU almost never gets the opening. His finisher, Drip From Above, does **0%**: it only roots for 0.8 s and needs a
follow-up the CPU does not do. Engulf is 2% + 6%.
*Smallest buff:* the jab-range fix, and Drip From Above **deals 8%** when he lands on someone (the root stays). It is a timed drop, so it
takes skill.

**2. Box (1/15; 3 KOs, the fewest in the roster).** She survives well (140% average, Lifeless Body armour) and cannot hurt anyone. Three
of her four specials never hit:
- Everything Packed only catches a shot that is already coming.
- Transcending Time and Space is a warp.
- Lifeless Body is armour.

Her jab has reach 2, and her tilts and aerials are 4-9%. The CPU also counts Everything Packed as a shot (it re-throws one), so half
the time it stands 230 px away pressing flaps at nothing.
*Smallest buff:* the jab-range fix (2 -> 8), and her raw **damage stat 1.15** (`FIGHTER_STATS`, inside the balance tools' 0.85-1.2
range). It lifts every hit she has without changing her kit.

**3. Lifering (1/15).** He has the most deaths to jabs in the bottom 20 (11), on a light 75 body. His damage tools are weak:
- the default jab;
- Proper Flying Formation, 4-8%;
- We've Got a Sinker!, an 8% sprint.

His finisher, Spare Ring, does **0%** to a foe (a 1 s stun). His down-special heals.
*Smallest buff:* the jab-range fix, and Spare Ring **deals 6%** to a foe it rings (the stun stays).

**4. Balloon (1/15).** He has the lightest II body (60) and is floaty (fall 0.91). He dies at **102%** on average, the earliest in the
bottom 20, and **15 of his 25 deaths are off the top**. Levitation and Insult Tirade do not hit. His KOs are Quick Air Release (4) and
up moves. POP! (his smash, launch 10) and Static Cling scored none.
*Smallest buff:* **weight 60 -> 66** (Teardrop's weight, still in the lightest tenth).

**5. Tissues (1/15).** He has a reach-2 jab and the shared finisher (14%, but a 3 s cooldown, because he has no finisher of his own).
That finisher scored 5 of his 8 KOs. His smash is a 480 px beam with launch 14, very strong in a player's hands. **The CPU never KO'd
with it**, because the CPU only smashes point-blank on an opening. Nap (his down-special) puts him to sleep, and the CPU rightly never
uses it.
*Smallest buff:* the jab-range fix only. The rest of his kit is fine for a player.

**6. Yin-Yang (1/15).** He has the default jab and the shared finisher (4 of his 9 KOs, at 137% on average). Yang Throws Yin (10%) is a
real ranged move, and the CPU uses it.
*Smallest buff:* the jab-range fix only, then re-measure.

**7. Snowball (BFDI, 1/15).** His archetype is "big body, launches easy". He is slow (run 0.91, jump 0.92) with a reach-2 jab, so he
cannot close the gap. 24 deaths at 135%; 8 to jabs and 5 to finishers. Rage Tackle (3 KOs) is his only way in.
*Smallest buff:* **run 0.91 -> 1.0** and jab reach 2 -> 6 (his jab already does 8 / 9, so not 8).

**8. Teardrop (BFDI, 1/15).** Her finisher, Silent Puddle Ambush, works (7 of 10 KOs). Her jab is deliberately the weakest (3%), and
her smash is a self-buff, which the CPU never uses as an attack. THE KICK is 14%, launch 14, instant, on a 1.6 s cooldown: a top-class
move. The CPU presses it on only about 15% of its close-range decisions, and it scored 1 KO. Her CPU is mostly jabbing for 3%.
*Smallest buff (for a player):* THE KICK's cooldown **97 -> 84 frames**. The jab stays as it is.

**9. Starfruit (2/15).** He has the default jab, and Flee! Flee! and Recycle do not hit. One-Hit Wonder is 14% with launch 14, then a
3% shove until he Recycles. **The CPU never presses Recycle** (it never uses a down-special that is not a trap or a heal), so it gets
one big hit per stock. The shared finisher scored half his KOs.
*Smallest buff:* the jab-range fix, and the Has-Been shove **3% -> 6%**, so a spent special is not a dead button.

**10. Cammy (2/15).** He has the default jab, and his whole kit is set-up:
- Snapshot, 4% and a stun;
- the USB, 5%;
- the self-timer, 6% and a freeze.

**The CPU fires Snapshot point-blank, but it only hits 170 px ahead**, so a CPU Cammy's special never lands. Half his KOs (3 of 6) are
his smash. It launches at 8, below the median 12. 12 of his 21 deaths are off the top.
*Smallest buff:* the jab-range fix, and smash **launch 8 -> 10**.

**11. Paper (2/15).** He is light (64) and floaty (air 1.12, fall 0.89). 25 deaths at 111%. His damage comes in small pieces: 6% paper
cuts, 4% cranes, 4-8% Gust. His KOs come late (135%).
*Smallest buff:* **weight 64 -> 70**.

**12. Fern (BFDI, 2/15).** She is a 104-weight healer with no forward tilt and no side special. She survives (140%) but cannot take
stocks: 7 KOs, mostly up-air and throws. Her smash launches at only 8, and she has many timeouts.
*Smallest buff:* smash **launch 8 -> 11**.

**13. Pillow (BFDI, 2/15).** She is heavy (92) but floaty (jump 1.08, fall 0.89), and **12 of 22 deaths are off the top**. Fluff Bounce
(16%) scored 3 KOs. Her smash and finisher both wind up. She was also at the bottom of the old baked table (4%).
*Smallest buff:* **fall 0.89 -> 0.97**, so she is launched less far upward.

**14. Lightbulb (2/15).** She is light (70) with the latest KO % in the bottom 20: **159%** on average. Her damage is fine (Electric Ball,
Flicker, the tiles), but nothing launches. Her smash, a 520 px beam, launches at 9.
*Smallest buff:* smash **launch 9 -> 11**.

**15. Trophy (2/15).** **8 of his 10 KOs are jabs: the banked empowered jab** from Horseplay. His plain jab is the 5% default, and his
KOs average 74%. Without the empowered jab he has nothing that KOs. So `jab-study.md`'s option 1 (empowered jab loses its launch bonus) would take his only KO move.
*Smallest buff:* the jab-range fix, and **keep Trophy's empowered jab as it is** if option 1 lands (the jab study says the same).

**16. Clover (2/15).** **8 of her 11 KOs are the shared finisher.** Everything else does almost nothing:
- the default jab;
- Butterflies, 2% (the CPU counts it as a shot, so it keeps away and plinks for 2%);
- Lucky Wind and Meant for Me, which do not hit.

*Smallest buff:* the jab-range fix, and Butterflies **2% -> 4%**.

**17. Knife (2/15).** He has the most KOs in the bottom 20 (13) and sound numbers: a 7 / 8 / 16 jab, Shove Off the Platform (5 KOs),
Blade Rush at launch 12. The CPU counts Bag of Tricks as a shot and keeps away half the time with a 4% opener. He is the closest to the
middle.
*Smallest buff:* **damage stat 1.1**. Or wait for the re-run after the jab fixes: he lost mostly jab trades (10 deaths to jabs).

**18. Candle (3/15).** She has the default jab, and Levitate and Crystal Chime do not hit. Inner-Flame (9%) is her only damaging
special. She took 6 deaths to projectiles (Apple took 7).
*Smallest buff:* the jab-range fix, and Inner-Flame **9% -> 11%**.

**19. Apple (3/15).** She is light (70). 25 deaths at 113%, and her KOs come late (147%). Her tools are fine on paper: a 7 / 8 / 15 jab,
an 8% piercing pencil, and a launch-14 smash.
*Smallest buff:* **weight 70 -> 76**.

**20. Barf Bag (BFDI, 3/15).** Outbreak (a 95 px cloud, no damage) is still on the CPU's list of shot specials from her old kit, so
**her CPU keeps 230 px off half the time and fires a short-range cloud from 110-420 px**. Her smash launches at 8.5. Most of her KOs (4
of 9) are Geyser, her up-air.
*Smallest buff:* smash **launch 8.5 -> 10.5**.

## 3. Why CPU results mislead for these kits

How the Hard CPU chooses (the brain's `brainFight`):
- **It walks in until the foe is within its jab's reach**: body + 24 + the jab row's reach. That is 48 px for a default-jab fighter,
  against 62-64 for Pen, Profily, Yellow Face and Firey Jr. Then it strings jabs, up-tilts, down-tilts and aerials.
- **A smash only on an opening**: the foe stunned or mid-swing, within about 20 px past jab reach (40% of decisions on Hard). It never
  starts a long smash from range.
- **The finisher only with the foe in jab reach and at 85% or more** (18% of decisions).
- **A special up close only 15% of the time** (Bow's never). Shot specials are fired from 110-420 px, and a shooter keeps 230 px away
  half the time.
- **A down-special only if it is a trap or a heal** (or a stance, when it guesses a swing is coming).
- **An up-special only to move**: to recover, or to climb to a foe well above it. It never picks one as an attack in a fight on the
  ground.

So the CPU plays every fighter as a jabber. Fighters whose strength is anywhere else do badly as CPUs: Bow, Teardrop's kick, Tissues'
and Lightbulb's beams, Starfruit's Recycle, Cammy's Snapshot. Three kit labels are wrong:
- Box counts as a shooter (Everything Packed re-throws a caught shot).
- Barf Bag counts as a shooter (`BRAIN_SHOOTERS` still lists `splash`).
- Cammy does not count as one (Snapshot is a far flash, not a projectile).

I propose no CPU changes ("never tune for bots"). But if you want the CPU win rates to mean more, these three labels and Starfruit's
Recycle are the plain bugs.

## 4. Bow (no change)

0/15, but she has the **fewest deaths in the bottom 20 (18)** and the **most timeouts in the whole roster (11)**: her CPU survives and
cannot finish. It scored only 6 KOs. Why:
- **Chair Slam (13%) is never pressed.** Every up-special press in the brain is a recovery press, and each one skips Bow by name.
- **Snowballs are never pressed** (her down-special is not a trap or a heal).
- **Teleport is used to recover, but hardly ever in neutral.** The close-range special pick skips her by name (`sp !== 'chair'`), and a
  neutral Teleport is kept only when it lands on a foe.
- The Musical Chairs walk-smash only comes out on an opening.
- The tower finisher only comes out with the foe at 85% or more, in jab reach.

So her CPU fights with the chair swing, tilts and aerials only. In a player's hands all of it comes out, which matches what you see.

## Method and files

Scripts and raw output are in `C:\Users\carad\AppData\Local\Temp\claude\C--Users-carad--claude\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\balance2\`
(a temp folder):
- `why.mjs`: the per-fighter digest of the run's match logs.
- `kitdump.mjs` and `kitdump.txt`: the live jab, smash, up-special and moveset rows.
- `brainkit.mjs`: how the CPU brain classifies each kit, and its engagement reach.
- `fair2.mjs`, `fair2.jsonl` and `fairsum.mjs`: the fairness check.

The jab reach and damage per fighter come from `jab-study.md`'s probe (`v0_s*.jsonl`).
