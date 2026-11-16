# Unique smashes, batch 1: review list (2026-11-12)

You asked: "add the unique smashes". This is the old-vs-new list for you to pick from.
**Nothing is built. Nothing in the game was edited.** Tick the boxes you want; anything not ticked stays exactly as it is.

How I judged, by your rule: a move is a look-alike ONLY if its shape AND its effect AND its rough numbers all match another fighter's move. Same shape with a different effect is NOT a look-alike.

Read from the code on branch ii-dlc (SMASH_SPEC, the Final Smash rows, the menu lines). No game was run, so every number here is the number written in the code, not a measured result.

## Read this first: what I am sure of and what I am not

- **Neutral smashes: I am fairly sure.** They are one table with one row per fighter, and I compared every row.
- **Final Smashes: only partly sure.** 41 Final Smashes are built from 9 shared shapes (lane, hold, two rings, stream and so on). I compared all of those by numbers. The other 61 are hand-made scenes; I compared those by their menu line only and did NOT check their numbers. The look-alikes are almost all in the 41 shared-shape ones.
- **I could not find 10 neutral smashes that honestly need changing.** I found 7 worth offering. The other look-alikes are between moves you already said to keep, or moves that are straight from the show. They are listed, with no change offered.
- **Six of the ten Final Smash ideas change the EFFECT, not the shape** (for example: Rose's thorns now bleed). That is the smallest change, and by your rule it stops them being look-alikes. But the move will still LOOK much the same on screen. If you want them to look different too, say so and I will design new shapes for those instead (bigger job).
- Moves that add burn, bleed or poison do damage over time. I lowered the hit to make room, but the exact total can only be checked when it is built. The rule for the builder: the measured total must not be higher than today's.
- Show sources: I name the source where the game's own notes give one. I did not check any episode myself. "From the object" means it comes from what the character IS, not from a scene.
- Skipped: Steve Cobs's prize fighters, the nine event fighters (I could not tell from the code which are released, so I skipped all nine), and player-built characters.
- Not touched or offered: Bell, Gelatin, Fern, Fanny, Barf Bag, Marker, Pillow, Taco (II) put-backs; every move from batches 1 to 6 that you kept; Blocky's anvil.

## One thing you should know (not a change)

You said Tapey's smash has knockdown and TV's has scramble. In the code today: **Cammy = knockdown (yes), Remote = scramble (yes), but TV = stun and Tapey = stun.** So TV and Tapey are both stun beams (TV's is long and weak, Tapey's is shorter with a longer stun). I did not change anything. See neutral proposal N7.

---

# PART 1: FINAL SMASHES

## The true look-alike groups (shape + effect + rough numbers)

| Group | Shape | Effect | Fighters and numbers |
|---|---|---|---|
| A | Hold one foe, small hits, then a throw | pure damage | **Bracelety** 6 hits of 3 + throw 18, launch 22. **Rose** 6 hits of 3 + throw 18, launch 22 (the same numbers exactly). **Bot** 6 of 2 + 20, launch 23. **Box** 4 of 2 + 24, launch 24. **Bonesaw** 3 of 6 + 20, launch 23. |
| B | A stream of 14 blobs forward, then one big blob through everyone | pure damage | **Toothpaste** 14 blobs of 7 + big 18. **Tissues** 14 blobs of 5 + big 18. The two menu lines are nearly word for word. |
| C | A run along the floor through everyone | pure damage | **Fan** 20, launch 22, 700 px. **Lifering** 17, launch 21, 800 px. **Woody** 15, launch 18, 560 px. **Needle** 22, launch 20, 720 px (thinner and faster). |
| D | A wave of sound along the floor | pure damage | **Microphone** 16, launch 22, 800 px. **Tapey** 20, launch 22, 700 px. |
| E | A ring round the body, then a wider second ring | pure damage | **Bomb** 24 then 14 (hurts himself 16). **David** 22 then 12. **Nickel (II)** 14 then 14 (weaker, so only half a match). |
| F | Things thrown across the stage at the nearest foes, 5 per foe | pure damage | **Money** 13 each at 3 foes. **Book** 13 each at 2 foes. |
| G | Shockwaves along the floor both ways | pure damage | **Baseball** 18, launch 22. **Yin-Yang** 15, launch 19. |
| H | Mark a spot, then one blast there | pure damage | **Sidewalky** 28, launch 20. **Pickle** 24, launch 21. (Cammy's has stun and Trophy's weakens, so they are not look-alikes.) |

Not look-alikes by your rule, though the shape is shared: Golf Ball (hold + freeze), Fern (hold + heal), Candle (floor columns + stun) next to Grassy (floor columns, pure), Roboty (floor columns, launches straight up, much weaker), Lightbulb (one ring + scramble), Firey Jr. (sparks all round + burn) next to Spikey (spikes all round, pure), Salt (weakens), Apple (3 single pencils) next to Naily (15 nails).

Hand-made scenes that READ alike in the menu, numbers NOT checked: Gaty, MeTag and Poppy (a foe bounced back and forth); Pencil and Match (a van across the stage); Saw and Goo (a ring round the body that holds and hits); Tennis Ball and Cheesy (bouncing balls along the floor).

## Sky-drop check (your rule: no sky drops in Final Smashes)

- Sidewalky's slab: you already said it stays.
- **Pickle's "Loads of Experience" works the same way as Sidewalky's slab** (a mark, then a pickle comes down on the spot). I did not offer a change because I could not think of a good one. Question for you: does Pickle's count as a sky drop?
- Cake ("a grand cake lands on them") and Lightning ("landmarks down on them") read like drops in the menu line. Both are hand-made scenes on a foe already caught, which you said is fine. I did not check them further.

## The ten Final Smash proposals

### F1. Toothpaste (look-alike of Tissues, group B)
- [ ] **Yes, change Toothpaste's Final Smash**
- **Now:** You're My Enemy Now! Squirts 14 blobs of paste forward, then one big glob through everyone. Pure damage. 14 x 7, big glob 18, launch 24/26.
- **New:** You're My Enemy Now! (same name). The same squirt, but the paste STICKS: every blob slows whoever it hits. 14 x 6, big glob 16, same launch.
- **Source:** from the object (toothpaste is sticky); her own kit already roots and slows with paste (Long Smear, Squeeze Out). No episode checked.
- **Why it differs now:** Tissues's stream is pure damage; hers slows. Type of change: EFFECT.
- **Balance:** damage goes DOWN (116 to 100 if everything hits). Slow adds no damage.
- **Code reused:** the same stream row (fsHose); the slow tag projectiles already carry (fxTag 'slow').

### F2. Rose (exact twin of Bracelety, group A)
- [ ] **Yes, change Rose's Final Smash**
- **Now:** Thorn Lash. Binds the nearest foe in thorns, lashes them 6 times, then throws them. Pure damage. 6 x 3 + 18 = 36, launch 22.
- **New:** Thorn Lash (same name). The same bind, but the thorns make the foe BLEED. 6 x 3 + 14, launch 22, plus bleed.
- **Source:** from the object, and her own smash (Bramble Drag) already bleeds.
- **Why it differs now:** Bracelety's is pure damage; Rose's bleeds. Type of change: EFFECT.
- **Balance:** throw lowered 18 to 14 to pay for the bleed. Builder must measure: total with bleed must not pass 36.
- **Code reused:** the same hold row (fsLock) with its status option (bleed is already supported there).

### F3. Fan (look-alike of Lifering, group C)
- [ ] **Yes, change Fan's Final Smash**
- **Now:** You Leave Us Alone! An armoured charge along the floor through everyone. Pure damage. 20, launch 22.
- **New:** You Leave Us Alone! (same name). He opens up to full size and a wall of wind SHOVES every foe near him away, then one blast hits them. Pure damage. 20, launch 22.
- **Source:** his listed ability to expand (the game's note for his smash, A Kick in the Right Direction); the wind is from the object (he is a fan).
- **Why it differs now:** a shove-then-blast, not a run. No other Final Smash pushes. Type of change: SHAPE.
- **Balance:** same 20 and 22. He loses the armoured travel, so if anything it is weaker.
- **Code reused:** the pull row (fsPull) has a "push" switch that no fighter uses yet. NOTE: because nothing uses it, it has never run in a real match; it needs a careful test.

### F4. Tapey (look-alike of Microphone, group D)
- [ ] **Yes, change Tapey's Final Smash**
- **Now:** Playback. A wave plays back from her speaker and rolls along the floor. Pure damage. 20, launch 22.
- **New:** Playback and Rewind. The wave rolls out, then REWINDS back to her. A foe can be hit once each way. Pure damage. 10 out (small launch) + 10 back (launch 22, toward her).
- **Source:** from the object (a tape plays and rewinds). Invented staging.
- **Why it differs now:** out-and-back, two hits; Microphone's is one shout one way. Type of change: SHAPE.
- **Balance:** 10 + 10 = 20, the same as now, and only if both passes hit.
- **Code reused:** the lane row (fsLane). Needs a small new "comes back" option, about 15 lines.

### F5. David (look-alike of Bomb, group E)
- [ ] **Yes, change David's Final Smash**
- **Now:** Aw, Seriously! A ground pound ring, then a wider shockwave. Pure damage. 22 then 12, launch 20/14.
- **New:** Aw, Seriously! (same name). The same two rings, but the shout STUNS whoever it hits for a moment. 20 then 12.
- **Source:** his own smash (Aw Come On) already stuns; the line is his from the show.
- **Why it differs now:** Bomb's is pure damage and hurts himself; David's stuns. Type of change: EFFECT.
- **Balance:** first ring lowered 22 to 20. Stun adds no damage.
- **Code reused:** the two-ring row (fsCircle) with its status option (Lightbulb's ring already uses it).
- **Careful:** you rejected a David change once before (his down special). Skip this if you want David left alone.

### F6. Book (look-alike of Money, group F)
- [ ] **Yes, change Book's Final Smash**
- **Now:** Overdue. Books circle her, snap shut and fly across the stage at the two nearest foes, 5 each. Pure damage. 13 each.
- **New:** Overdue (same name). The same books, but each one that hits DEFINES the foe (her own mark: later hits land harder). 11 each.
- **Source:** her own special, Define, which the game's notes call her card.
- **Why it differs now:** Money's bags are pure damage; Book's mark the foe. Type of change: EFFECT.
- **Balance:** 13 down to 11 per book (65 down to 55 per foe). Define makes LATER hits stronger, so the builder must check the whole Final Smash still totals no more than today's.
- **Code reused:** her existing row; the define tag projectiles already carry.
- **Careful:** this Final Smash was already changed on 11-11 (books fly instead of falling), at your request.

### F7. Bot (look-alike in group A)
- [ ] **Yes, change Bot's Final Smash**
- **Now:** Gotcha! Holds the nearest foe, kicks 6 times, then "there's more!" for a big throw. Pure damage. 6 x 2 + 20 = 32, launch 23.
- **New:** Gotcha! (same name). Same hold and kicks, but "there's more!" is now a SLAM straight down into the floor, and the slam sends a small ring out that hits anyone standing close. Held foe: 6 x 2 + 16 = 28. Bystanders: 10.
- **Source:** the two lines are Bot's own (game notes). The slam is invented.
- **Why it differs now:** ends in a floor slam that hits others, not a throw. Type of change: SHAPE (only the ending). **This is the weakest idea on the list: it still reads as "hold, hits, finish".**
- **Balance:** the held foe takes 28, down from 32.
- **Code reused:** the hold row (fsLock) and the ring hit (fsBurst). Needs a small new ending option.

### F8. Box (look-alike in group A)
- [ ] **Yes, change Box's Final Smash**
- **Now:** Everything Packed. Packs the nearest foe in a box, knocks it 4 times, then ships them. Pure damage. 4 x 2 + 24 = 32, launch 24.
- **New:** Everything Packed (same name). Same packing and knocks, but "shipped" is now real: the crate is sent SLIDING along the floor and hits anyone else in its way. Packed foe: 4 x 2 + 20 = 28. Others hit by the crate: 12.
- **Source:** from the object (she is a box). Invented staging.
- **Why it differs now:** ends in a sliding crate, not a throw. Type of change: SHAPE (only the ending). Also a weaker idea, like F7.
- **Balance:** the packed foe takes 28, down from 32.
- **Code reused:** the hold row (fsLock) and the floor roller Paper's pianos use (fsFlyShot roll). The crate must not hit the packed foe a second time.
- **Left over if F2, F7 and F8 are all picked:** Bracelety and Bonesaw would still be a mild pair (6 quick hits against 3 slow ones).

### F9. Baseball (look-alike of Yin-Yang, group G)
- [ ] **Yes, change Baseball's Final Smash**
- **Now:** Ground Pound. Shockwaves run out along the floor both ways; hop them. Pure damage. 18, launch 22.
- **New:** Ground Pound (same name). The same shockwaves, but whoever they hit is SLOWED for a while. 16, launch 22.
- **Source:** his own smash (Out Of The Park) already slows.
- **Why it differs now:** Yin-Yang's is pure damage; Baseball's slows. Type of change: EFFECT.
- **Balance:** 18 down to 16. Slow adds no damage.
- **Code reused:** the lane row (fsLane) with its status option.

### F10. Woody (look-alike of Lifering, group C)
- [ ] **Yes, change Woody's Final Smash**
- **Now:** Fraidy Stampede. Bolts in fright, leaving a rush of splinters along the floor. Pure damage. 15, launch 18.
- **New:** Fraidy Stampede (same name). The same bolt, but the splinters make foes BLEED. 13, launch 18, plus bleed.
- **Source:** from the object (balsa wood splinters); the move's own text already says splinters.
- **Why it differs now:** Lifering's and Needle's runs are pure damage; Woody's bleeds. Type of change: EFFECT.
- **Balance:** 15 down to 13 to pay for the bleed. Builder must measure: total with bleed must not pass 15.
- **Code reused:** the lane row (fsLane) with its status option (bleed is supported).

---

# PART 2: NEUTRAL (MAIN) SMASHES

102 fighters checked (95 table rows plus 7 hand-written smashes: Needle, Teardrop, Tennis Ball, Golf Ball, Puffball, Money, Naily. Those 7 I judged by their description only, and they look like their own moves).

## The true look-alike groups

| Group | Shape | Effect | Fighters and numbers (damage / launch) | Can I offer a change? |
|---|---|---|---|---|
| 1 | Root, wind up, hit all round | knockdown | **Marshmallow** 15/13. **Bonesaw** 16/14. **Teddy Bear** 16/14. Nearly the same size too. | Yes: N1, N2 |
| 2 | Straight beam, 480 px long | knockdown | **Tissues** 13/14. **Nickel (II)** 14/14. Same length and width. | Yes: N3 |
| 3 | Step in and swing | burn | **Firey** 14/9. **Firey Jr.** 12/9 (the code's own note says "the same move, smaller"). | Yes: N4 |
| 4 | Ring bursting out round the body | knockdown | **Balloon** 13/12. **Goo** 13/14.5. | Yes: N5 |
| 5 | Step in and swing | knockdown | **Apple** 16/14. **Silver Spoon** 16/14 (his goes more upward). **Trophy** 14/14 (kept by you). | Borderline: N6 |
| 6 | Straight beam | stun | **TV** 12/9, 820 px. **Tapey** 13/11, 460 px. | Your call: N7 |
| 7 | Hop onto the nearest foe | knockdown | **Basketball** 14/12 and **Fan** 13/13 (both kept by you). **Jack** 17/14. **Nickel** 11/15. **Balloony** 10/12. | No. Basketball and Fan are kept; Jack's jump is straight from the show (the roof jump). |
| 8 | Something that travels along the floor through everyone | knockdown | **Fanny** 10/10 (kept). **Pencil** 12/10 (the FreeSmart van). | No. Fanny's is kept; the van is from the show. |
| 9 | Something short that slides along the floor | knockdown | **Lifering** 16/12. **Clover** 13/13. | No. Both kept (sky-drop removal). |
| 10 | Three or five shots fanned out of the front | knockdown | **Leafy** 12 x 3. **Starfruit** 9 x 5. | No. Both kept. |
| 11 | A trap left on the floor | bleed | **Knife** 11/8. **Pin** 15/10. | No. Both kept. |
| 12 | Ring bursting out round the body | stun | **Yellow Face** 16/11 (kept). **Bomb** 19/13 (hurts himself 8). | No. Yellow Face's is kept; an explosion is what Bomb is. |
| 13 | Straight beam | weaken | **Ruler** 12/13, 860 px. **Cheesy** 12/11, 380 px (kept). | No. Cheesy's is kept; Ruler's is the older one and less than half the match (length). |

Close, but NOT look-alikes by your rule (numbers too far apart): Flower and Box (hop + root, launch 9 against 12); Firey and Poppy (launch 9 against 12); Lollipop and Dough (trap + root, launch 9 against 6); Sidewalky and David (damage 14 against 18); Paintbrush and Bomby; Fries and Tea Kettle; Taco and Donut; Grassy and Paper; Bracelety, Pickle and Bell.

Everything else is the only move of its kind (for example Ruby is the only beam that burns, Fern the only burst that drains, Gaty the only smash that strips armour).

**Why knockdown is hard:** every smash shape in the game already has at least one knockdown smash. So for a knockdown look-alike I cannot "keep the effect and change the shape" without making a NEW look-alike. That is why most ideas below change the effect instead. Each one is a very small change.

## The seven neutral smash proposals

### N1. Marshmallow (group 1)
- [ ] **Yes, change Marshmallow's smash**
- **Now:** One Purchase Later. She roots, winds up, and hits everyone round her. Knockdown. 15 / launch 13.
- **New:** Sticky Situation (new name; or keep the old name if you prefer). Same root and hit all round, but foes are stuck in marshmallow: SLOWED, not knocked down. 15 / launch 13.
- **Source:** from the object (melted marshmallow is sticky). Invented name.
- **Why it differs now:** the only root-and-hit smash that slows.
- **Balance:** same numbers; slow replaces knockdown (which also stunned for half a second), so it is not stronger.
- **Code reused:** her own row; only the effect word changes (SM_FX.slow).

### N2. Bonesaw (group 1)
- [ ] **Yes, change Bonesaw's smash**
- **Now:** Truly Groundbreaking. He plants, drives his teeth in, and the floor breaks up round him. Knockdown. 16 / launch 14.
- **New:** Truly Groundbreaking (same name). Same move, but his teeth make foes BLEED, not fall. 14 / launch 14, plus bleed.
- **Source:** from the object (a saw); the name is his own pun (game notes: Point of No Return).
- **Why it differs now:** the only root-and-hit smash that bleeds.
- **Balance:** 16 down to 14 to pay for the bleed. Builder must measure: total with bleed must not pass 16.
- **Code reused:** his own row; only the effect word changes (SM_FX.bleed).
- **If N1 and N2 are both picked, Teddy Bear keeps the knockdown version alone and needs no change.**

### N3. Tissues (group 2)
- [ ] **Yes, change Tissues's smash**
- **Now:** Pollen Path. His biggest sneeze in a straight line; it throws him backwards too. Knockdown. 13 / launch 14.
- **New:** Pollen Path (same name). The same sneeze, but it makes foes SICK (poison), not fall. 11 / launch 14, plus poison.
- **Source:** he is always sick and sneezing (the show; the game's notes give Marsh on Mars for the sneeze's force).
- **Why it differs now:** the only beam that poisons. Nickel (II) keeps his as it is.
- **Balance:** 13 down to 11 to pay for the poison. Builder must measure: total must not pass 13.
- **Code reused:** his own row; only the effect word changes (SM_FX.poison).

### N4. Firey Jr. (group 3)
- [ ] **Yes, change Firey Jr.'s smash**
- **Now:** Tantrum Flare. Steps in with a swing of flame. Burn. 12 / launch 9.
- **New:** Hot Foot (invented name). A short quick DASH straight through the foe, setting them alight as he passes. Burn. 12 / launch 9.
- **Source:** invented. He is small and quick (the game's own note); no episode behind it.
- **Why it differs now:** a dash-through, not a swing. No other dash-through burns. The effect (burn) is kept.
- **Balance:** same 12 and 9, same burn time.
- **Code reused:** the dash-through shape (SM_PAT.through) that Salt and Woody use.

### N5. Goo (group 4)
- [ ] **Yes, change Goo's smash**
- **Now:** Puffed Up. He inflates and everyone touching him is thrown off. Knockdown. 13 / launch 14.5.
- **New:** Puffed Up (same name). The same inflate, but foes simply BOUNCE off: pure damage and launch, no knockdown.
- **Source:** the show, as the game's notes give it: he inflated to catch Clover and she bounced off (Best Served Cold).
- **Why it differs now:** the only burst that is pure damage; Balloon's POP! keeps the knockdown.
- **Balance:** same 13 and 14.5; losing the knockdown makes it a little WEAKER. I did not add anything back.
- **Code reused:** his own row; the effect is just removed.

### N6. Apple (group 5, borderline)
- [ ] **Yes, change Apple's smash**
- **Now:** Cut In Half. One slice, straight through. Knockdown. 16 / launch 14.
- **New:** Cut In Half (same name). The same slice, but a cut BLEEDS, not knocks down. 14 / launch 14, plus bleed.
- **Source:** the move's own name; the game's notes give The Tile Divide for the slice.
- **Why it differs now:** Silver Spoon's punch keeps the knockdown. Coiny's slap also bleeds but launches about half as far (8 against 14), so it is not a look-alike.
- **Balance:** 16 down to 14 to pay for the bleed. Builder must measure.
- **Code reused:** her own row; only the effect word changes.
- **My honest view:** this pair is borderline (Silver Spoon's already launches upward and has his gold boost). Leaving both is fine.

### N7. Tapey (group 6, your call)
- [ ] **Yes, change Tapey's smash**
- **Now:** Solo Track. A recording at full volume down one line. Stun. 13 / launch 11, 460 px.
- **New:** Solo Track (same name). THREE notes thrown out of her front in a small fan. Stun. 4 each (12 if all three hit) / launch 11.
- **Source:** from the object (music). Invented staging; the name is from Fan the Flames (game notes).
- **Why it differs now:** a fan of three shots, not a beam; no other fan stuns. The effect (stun) is kept. TV keeps the stun beam.
- **Balance:** 12 at most, down from 13.
- **Code reused:** the fan-of-shots shape (SM_PAT.volley) that Match and Roboty use.
- **My honest view:** you named Tapey's smash as a good, different one (you remembered it as knockdown). TV's beam is nearly twice as long and weaker. Leaving both is fine.

---

## If you pick everything

- Final Smashes: 10 changed (6 by effect, 4 by shape). Mild pairs still left: Bracelety and Bonesaw; Lifering and Needle; Bomb and Nickel (II); Pickle and Sidewalky.
- Neutral smashes: 7 changed (5 by effect or by removing one, 2 by shape). Groups 7 to 13 stay, because they are your kept moves.
- No sky drops are added anywhere. No hidden fighter is named or touched.
