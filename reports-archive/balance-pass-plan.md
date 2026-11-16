# Balance pass plan (for your OK)

*2026-10-28. Plan only. Nothing in the game has been changed. Built from `winrates.md`, `jab-study.md` and `bottom-fighters.md`.
I read the game on ii-dlc 4b3397f. The rules followed here: nerf only fighters that are too strong, and only down to the strong end
(about 12-13 wins in 15). Buff weak fighters toward the middle (the roster median is 6 in 15). Fun first, moves should take skill,
no CPU changes. **Bow is not touched anywhere in this plan.***

## 1. The jab fix

The jab study found that most "jab KOs" come from a hidden **empowered jab**. A few up-specials bank it, it never runs out, and on
its next press it hits for `damage x2.1 +3` and `launch x1.6 +2`, still on frame 2.

**Recommended (option 1):** the empowered jab **keeps its extra damage and loses its extra launch**. It still feels like a big hit,
but it is no longer a free smash.

- **Firey:** launch bonus removed, so the empowered jab uses the jab's own launch 7. Measured: his empowered jab now KOs at 142% in
  the middle and 83% at the ledge (was 87% / 21%). His record goes from 15/15 to 13/15. His jab KOs go from 25 to 14, at a median
  134% instead of 91%.
- **Magnet:** a milder cut, launch x1.3 instead of x1.6 +2. Today her jab KOs land at a median 37%. The full cut dropped her from
  13 to 10, which is too far. This milder cut is **not measured yet**. The target is to keep her at 12-13.
- **Everyone else who banks it keeps it as it is:** Trophy (2/15, 8 of his 10 KOs come from it), and the strong-end or middle
  fighters David, Cake, Fan and Blueberry.

Not in this plan, your call: option 3, "a jab can't combo into your own jab". It stops the hold-X-and-walk lock (2-13 jabs in a row
become 1), and that walking lock is the weird part a player feels. It changes every jab, Bow's included, so it is only in if you
say so.

## 2. Nerfs (only the 15/15 outliers)

- **Firey (15/15):** nothing beyond the jab fix above.
- **Bomby (15/15, 17 of 29 KOs from Proximity Mine):** **only one mine out at a time.** Laying a new mine removes the old one. The
  mine's damage (20) and launch (12) stay as they are.
  - Why: today a mine can be laid every 64 frames and each one lasts about 5.6 s, so up to about 5 can be out at once. It already
    hits harder than any smash mine in the game (those do 8-17).
  - Backup if he is still 15/15: mine launch 12 → 10.
- **Toothpaste (14/15) and Match (14/15): no change.** 14/15 is within the 2-win noise of the strong end.
  - Match wins by surviving: 11 timeouts, and his KOs land late, at a median 177%.
  - Toothpaste's finisher KOs land at a median 140%.
  - Both get re-checked in the re-run.

## 3. Buffs for the bottom 20 (Bow excluded)

**Shared change, the jab-reach fix.** Ten bottom kits get **jab reach 8**. Only the reach changes: damage and launch stay the same,
so no jab gets more KO power.
- Goo, Lifering, Yin-Yang, Starfruit, Cammy, Trophy, Clover and Candle each get their own jab row, a copy of the default jab with
  reach 8. The default jab itself stays as it is, because Fan, Blueberry, Jack and Tea Kettle use it too.
- Box and Tissues: reach 2 → 8.
- Your call: Tea Kettle (3/15) is also on the default jab. Should he get the reach-8 row too?

**Per fighter** (one line each; "reach-8 jab" means the shared change above):

| Fighter (wins in 15) | Weakness | Exact change |
|---|---|---|
| Goo (0) | finisher does 0% | reach-8 jab; Drip From Above **deals 8%** when he lands on someone (the root stays) |
| Box (1) | 3 specials never hit; 3 KOs, the fewest in the game | reach-8 jab; damage stat **1.0 → 1.15** |
| Lifering (1) | finisher does 0% | reach-8 jab; Spare Ring **deals 6%** to a foe it rings (the stun stays) |
| Balloon (1) | dies at 102%, 15 of 25 deaths off the top | weight **60 → 66** |
| Tissues (1) | reach-2 jab | reach-8 jab only |
| Yin-Yang (1) | default jab | reach-8 jab only |
| Snowball (1) | slow, can't close the gap | run **0.91 → 1.0**; jab reach **2 → 6** (not 8: his jab already does 8% / launch 9) |
| Teardrop (1) | her 14% kick hardly comes out | THE KICK cooldown **97 → 84 frames** (her 3% jab stays the weakest, on purpose) |
| Starfruit (2) | his special is a 3% shove after its first use | reach-8 jab; Has-Been shove **3% → 6%** |
| Cammy (2) | weak smash, set-up kit | reach-8 jab; smash launch **8 → 10** |
| Paper (2) | light and floaty, 25 deaths | weight **64 → 70** |
| Fern (2) | can't take stocks (7 KOs) | smash launch **8 → 11** |
| Pillow (2) | 12 of 22 deaths off the top | fall **0.89 → 0.97** |
| Lightbulb (2) | nothing launches (KOs at 159%) | smash launch **9 → 11** |
| Trophy (2) | default jab; his empowered jab is his only KO move | reach-8 jab; his empowered jab is kept as it is (section 1) |
| Clover (2) | 8 of 11 KOs from the shared finisher | reach-8 jab; Butterflies **2% → 4%** |
| Knife (2) | loses jab trades; the closest to the middle | damage stat **1.0 → 1.1** |
| Candle (3) | default jab, one damaging special | reach-8 jab; Inner-Flame **9% → 11%** |
| Apple (3) | light, 25 deaths | weight **70 → 76** |
| Barf Bag (3) | weak smash | smash launch **8.5 → 10.5** |

None of these buffs is measured yet. All of section 3 goes in together, then gets measured once (section 4).

No CPU changes. Some kits are misread by the CPU: Box and Barf Bag are treated as shooters, Cammy fires Snapshot point-blank,
Starfruit never presses Recycle, and Bow never presses Chair Slam or Snowballs. These are left alone ("never tune for bots"), and they
are why some of these fighters' CPU numbers understate them.

## 4. How it gets measured afterwards

- **Who:** the 23 changed fighters: Firey, Magnet, Bomby and the 20 above. Toothpaste and Match get re-checked too.
- **Two foe pools, each 15 matches:**
  - (a) **BFDI:** the yardstick's same 15 mid-pack Hard CPUs.
  - (b) **Mixed:** 7 BFDI and 8 II mid-pack foes, as in the fairness check. The BFDI half is Pen, Tennis Ball, Fanny, Firey Jr.,
    Lightning, Profily and Yellow Face. The II half is Blueberry, Bonesaw, Test Tube, Pickle, Fan, Silver Spoon, Paintbrush and
    Spikey.
- **Two seed sets:** set A is the win-rate run's own seeds, a straight before/after. Set B is new seeds. That is 60 matches per
  fighter, 4 x 15.
- **Same rules:** 2 stocks, Hard, Goiky Field with the off-stage room, items off, sides alternating.
- **Barf Bag is also a yardstick foe.** As a foe she keeps today's numbers, so the yardstick does not move. Her buff is measured
  only when she plays as the fighter.
- **What counts as on target:**
  - Firey, Bomby and Magnet land at 11-13 of 15. If one drops below 11, that cut is backed off.
  - The buffed fighters land at 4-8 of 15. If one goes above 9, that fighter's line is taken back. If one is still at 0-2, they get
    the next option from `bottom-fighters.md` section 2.
  - Judge on the 60-match total, not on one 15-match run, because one 15-match run is about +/-2 wins of noise.
- **Reminder:** CPU-vs-CPU win rates are only a rough guide. You beat Expert CPUs without being hit, and Bow is 0/15 as a CPU but
  strong in your hands. So after the numbers, you try Firey, Bomby and a few of the buffed fighters by hand before anything ships.
  Then it gets built, checked that it boots and shown to you, and every push waits for your yes.
