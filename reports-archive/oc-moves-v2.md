# OC moves v2: the type is the main point, the moves are a designed pool

*2026-11-10. Design only, for the owner to approve: nothing in the game was changed. Built on reports/oc-design.md (the 64 options, as they ship today in OC_OPTIONS/OC_LISTS) and oc-viability.md (the numbers after the viability row fixes). The owner's rule this answers: "the archetype determines a main point, not the entire character", and, to pooling all 16 moves per slot, "NO. you make moves that are appropriate."*

## 1. The rule

**The type fixes the main point; the player picks the moves from a pool shaped for that type.** The type fixes: the stats, the basic kit (jab, tilts, aerials, grab and throws), the finisher, the Final Smash, the body silhouette and colour theme, and the angle it is strongest at (Zoner: the lane; Grappler: the hit it starts; Trapper: the floor; Trickster: never being where the hit lands). The player picks one move in each of the four slots (neutral special, down special, up special, neutral smash) and Shield or Reflector (free for every type). **The pool is shaped as CORE + TYPE MOVES:** each slot has a core of 4-5 general moves every object character can sensibly have (a quick dagger, a back hop, a roll-through, a plain rising hit, a leap, a spinning kick...) and a set of flavoured moves, each of which is given to one or two types whose main point it serves (a mortar for the Zoner, the Haymaker for the Grappler and Trapper, a rooting pod for the Trapper, a flat blink for the Trickster). So every type sees 7-9 options a slot (about 5,000 builds a type instead of 256), every combination reads as one character because the fixed kit carries the identity, and no type gets a move that fights its own main point (the Zoner never gets the rooted plants; the Trickster never gets armour). **Why this model:** it is the smallest change that gives the owner's variety (the current 64 moves become 57 after merging look-alikes; the editor list only grows), every option stays a hand-placed design decision ("appropriate"), and the balance pass stays small (the type-move sets are where the kill power lives, so the cross-type band is checked on 4 x 9 pools, not 4 x 16). *The alternative in one line:* tag every move with a compatibility list and let any type take any move whose tags fit; the same thing with more bookkeeping and a longer, harder-to-read editor list, so not recommended.

Rules every move keeps: a readable startup of 6 frames or more with a 2-6 frame tell on anything that launches; 18-28 frames of end lag on a whiffed strong move; no lock on a foe over 45 frames; no infinite loop (section 4, the mine rule); every move is an object-character move in the game's own vocabularies, never a copy of a roster fighter's signature. No role words (Damage, Zoning, Escape, Utility) appear anywhere in the UI; the rows keep them only for the CPU brain.

## 2. The move pool

Columns: who gets it (all, or the types); the strength note is damage % / launch / how it feels to start. "Type moves" are listed first in each slot because the editor lists them first (the type's own moves, then the core), with no marker and no label.

### 2.1 Neutral special (14 moves; Zoner sees 9, Grappler 7, Trapper 9, Trickster 9)

| Move | What it does | Who | Strength |
|---|---|---|---|
| Skyfall Spark | lobs a spark high; it falls almost straight down about two body-lengths ahead, landing behind a shield | Zoner | 12%, launch 9, lands about frame 50; slow but it owns a spot |
| Drift Orb | a fat slow orb floats down the lane, passes through foes and slows each one | Zoner, Trickster | 6%, slow 24, out in about 34 frames; a moving wall to walk behind |
| Tack Volley | three tacks at three speeds that string out into one line | Zoner, Trapper | 4% x3, startup 7 with a 3-frame tell; one dodge rarely clears all three |
| Confetti | six harmless scraps that scramble a foe's controls for half a second | Zoner, Trickster | 1% x6, scramble 30; a set-up, never a hit |
| Haymaker | a wide hook that launches up and out: the kill punch | Grappler, Trapper | 13%, launch 11/-6, startup 8 with a 6-frame tell, 24 end lag; KILL MOVE |
| Brace | plants the feet under armour for 24 frames; beats a dash in and nothing else | Grappler | no damage; cooldown 120 |
| Tripwire Pod | lobs a pod that settles where it lands, arms, and roots whoever steps on it | Trapper | 2% + root 30; lands about 140 px out; ROOT MOVE, floor piece |
| Smoke Pop | a back hop in a puff of smoke that hides the next tell for a second | Trapper, Trickster | no damage; 60 frames of smoke; startup 1 |
| Bubble Lure | a slow orb drifts toward the foe for two seconds and slows whoever it touches | Trickster | 4%, slow 60, homing; a lure |
| Trick Knife | a very fast short dagger with a visible wind-up and real end lag | all (core) | 9%, launch 6, startup 6 with a 3-frame tell, 20 end lag; about 1.5 body-lengths |
| Backstep Flare | hops back a body-length with six safe frames and leaves a dart flying forward | all (core) | 4% dart; the instant get-out |
| Roll-Through | rolls forward through the foe with eight safe frames and ends facing them; no hit | all (core) | no damage; startup 1-2; you change sides (merged Roll-Through + Switch Hop) |
| Shove Wave | a big push all round the body: little damage, a lot of distance | all (core) | 5%, pushes about 120 px; the "get off me" |
| Overcharge | stands 14 frames charging; the next jab, special or smash hits much harder | all (core) | +30% damage on one hit for 4 s; cooldown 110 |

### 2.2 Down special (14; Zoner 8, Grappler 9, Trapper 9, Trickster 9)

| Move | What it does | Who | Strength |
|---|---|---|---|
| Glass Shards | three sparks fall just ahead; each roots a foe where it lands | Zoner, Trapper | 3% x3, root up to 45 (never past the stun of what follows); ROOT MOVE |
| Mine Seed | drops a seed at the feet; it arms in a beat and goes off under the first foe to tread on it | Zoner, Trapper | 10.5%, launch 6, arms 24, lives 7 s; floor piece, no root |
| Marble Spill | four marbles bounce away along the floor: a rolling carpet of small hits | Zoner, Trickster | 3% each, usually two land; cover while you move |
| Ground Pound | both fists into the floor: a ring at the feet that launches straight up; from the air it dives first | Grappler | 12-13%, launch 4/-9, startup 10 with a 6-frame tell, 22 end lag; stun 24 leads into a rising hit |
| Low Sweep | a long low sweep to both sides that floors them | Grappler | 6%, knockdown; startup 8, end lag 18 (pays for being two-sided) |
| Bear Trap Snap | a snap at the floor just ahead that launches straight up and leaves them bleeding | Trapper | 12-14%, launch 2/-10, bleed; startup 12 with a 4-frame tell, two live frames |
| Trapdoor Hop | a hop up and back that leaves a spark where you stood; punishes the chase | Trapper, Trickster | 3% spark; startup 2 |
| Fake-Out | dashes forward five frames then back five, ending where it started, safe on the way out | Grappler, Trickster | no damage; baits a swing |
| Shrug Off | stands 30 frames and shakes every status off the body; heals about 2% | Grappler, Trickster | heal 2 + cleanse; cooldown 180 |
| Floor Arc | a low arc swept along the ground ahead; launches up and out | all (core) | 11%, launch 6/-6.5, startup 9 with a 3-frame tell, 20 end lag; the general low swing |
| Heel Spin | a grounded spin that hits once all round and launches diagonally | all (core) | 10%, launch 7/-7, startup 6 with a 5-frame tell, 20 end lag |
| Back Vault | a low backward hop with five safe frames | all (core) | no damage; startup 1 (merged Light Hop + Back Vault) |
| Recharge | stands still 30 frames and heals about 6%; a hit stops it | all (core) | heal 6; cooldown 200 |
| Second Wind | twenty frames of breath: the air jump comes back and the run quickens for two seconds | all (core) | no damage; cooldown 150 |

### 2.3 Up special (15; Zoner 8, Grappler 8, Trapper 9, Trickster 9)

Every up special lifts at least the plain hop height, except Vanish (the Trickster's known weakness, Trickster only), so the up slot is always a recovery.

| Move | What it does | Who | Strength |
|---|---|---|---|
| Spark Pillar | a straight rise with a stunning column above | Zoner, Grappler | 6-10%, launch 2/-11, stun 30 |
| Corkscrew | a rising hit that scrambles the foe's controls | Zoner, Trickster | 6-10%, launch 5/-8, scramble 44 |
| Seed Scatter | a hop that scatters three rooting seeds below | Zoner, Trapper | 3% x3, root 30; ROOT MOVE, floor pieces |
| Shockwave Hop | a hop that throws a rock chunk off to either side | Grappler | 5% x2; covers both approaches |
| Armoured Climb | a rise under eighteen frames of armour; beats an edge-guard hit, does no damage | Grappler, Trapper | no damage |
| Spring Snap | a rise whose hit launches them high and roots them where they land; short reach, heavy | Trapper | 8-12%, launch 4/-9, root under the landing stun; ROOT MOVE |
| Trap Hop | a plain rise that leaves an armed trap where it was cast | Trapper | trap 6%; floor piece |
| Wake Dart | a rise that fires one shot back and down the way it came; the chaser eats it | Trickster | 5%, launch 4 |
| Vanish | the lowest, longest sideways blink, fourteen safe frames; little height | Trickster | no damage; the escape with a cost |
| Spring Heel | a rise that hands the jump back and leaves a slick spot that slows whoever steps in it | Trickster | no damage; slow puddle |
| Rising Knee | a rise whose knee comes out late and knocks them down; rewards the read | all (core) | 7-11%, launch 3/-10, knockdown |
| Wall Spring | the highest plain hop there is, eight safe frames, no hit | all (core) | no damage |
| Blink | a long warp, up or mostly sideways the way you steer, twelve safe frames, no hit | all (core) | no damage (merged Blink + Cable Warp: the stick picks the angle) |
| Double Spring | a rise that hands the air jump back | all (core) | no damage (Glide Lamp renamed; its spark dropped) |
| Beacon Drop | a rise that fires one shot straight down to cover the landing | all (core) | 5%, launch 4 |

### 2.4 Neutral smash (14; Zoner 7, Grappler 7, Trapper 8, Trickster 7)

| Move | What it does | Who | Strength |
|---|---|---|---|
| Lance Beam | a long thin beam straight ahead that floors them | Zoner | 16% (24 charged), launch 14, 170 px, wind 24; KILL MOVE |
| Star Rain | four small stars fall on the nearest foe; each slows | Zoner | 7% x4, slow; first star about frame 50 |
| Tar Burst | a wide weak burst that slows whoever it touches | Zoner, Trapper | 7%, slow; out at about 30; cooldown 54 |
| Pile Driver | both fists into the floor after a rooted wind-up: a big ring that floors them | Grappler | 19% (31 charged), launch 15, knockdown, 32 rooted frames; KILL MOVE |
| Shoulder Rush | a shoulder charge through the foe that strips armour and stances | Grappler | 12%, launch 10, strip; 137 px |
| Grip Reel | reaches out and reels the foe in, weakened; sets up the next hit | Grappler, Trickster | 9%, weaken, pull about 85 px; cooldown 50 |
| Spike Press | a slow press of spikes into the floor after a rooted wind-up; it bleeds | Trapper | 18% (30 charged), launch 14, bleed, 34 rooted frames; KILL MOVE |
| Minefield | plants one big mine a step ahead that roots whoever treads on it; one out at a time | Trapper | 13% (21 charged), root 30 (now shorter than its stun), 120-frame immunity after it goes off; ROOT MOVE, floor piece |
| Rebound Dash | a short dash through them with a recoil back: the rush that ends behind where it began | Trapper, Trickster | 10%, launch 8; 125 px |
| Card Spray | five cards fall in a fan on the nearest foe; each scrambles | Trickster | 6% x5 (two land), scramble 45; first card about frame 50 |
| Pirouette Kick | a step and a spinning kick that floors them; the lightest-costed big hit | all (core) | 15% (22 charged), launch 13, knockdown, wind 24; KILL MOVE |
| Vault Slam | a high leap forward that lands on them: the way out of a corner | all (core) | 12%, launch 9; lands about frame 40 (merged Light Leap + Vault Slam) |
| Dash Through | the fastest dash through the foe: pure speed and distance | all (core) | 11%, launch 9; 152 px |
| Hex Ring | a quick ring round the body that weakens whoever it touches; a set-up, never a kill | all (core) | 8%, weaken 70; out at about 28; cooldown 52 (merged Dimmer + Hex Ring) |

## 3. Kept, merged, renamed, dropped

- **Kept as they are (51):** every move above not named below, with the viability numbers (oc-viability.md section 3) already applied. Each becomes a core move or a type move; nothing else about it changes.
- **Merged (5):** Switch Hop into **Roll-Through** (same dash, the Trickster's "ends facing them" kept for everyone); Light Hop into **Back Vault** (two back hops differing only in angle); Cable Warp into **Blink** (one warp, the stick picks up or sideways: the Zoner's and the Trapper's recoveries were the same move at two angles); Light Leap into **Vault Slam** (two leaps, the higher one kept, the Zoner's lower damage dropped); Dimmer into **Hex Ring** (two weakening bursts: the quick small one is the better design). Reason: a pool shared across types must not hold two moves that differ only in a number, or the list reads as padding.
- **Renamed (1):** Glide Lamp becomes **Double Spring** and loses its 3% spark (a jump refund is a general move; the spark made it a Zoner move for no gain).
- **Dropped (2):** Caltrop Patch (nothing on the throw, a weak slow on the floor; the Trapper keeps Tar Burst and the Trickster Spring Heel for slicks) and Lie Low (a third standing heal, under smoke; Smoke Pop covers the smoke and Recharge the heal). Reason: both were the weakest row of their slot in the viability pass and neither does anything another pool move does not.
- **Moved to the core (19: 5 + 5 + 5 + 4):** Trick Knife, Backstep Flare, Roll-Through, Shove Wave, Overcharge, Floor Arc, Heel Spin, Back Vault, Recharge, Second Wind, Rising Knee, Wall Spring, Blink, Double Spring, Beacon Drop, Pirouette Kick, Vault Slam, Dash Through, Hex Ring: the moves any object character could carry. The rest stay with the one or two types whose main point they serve (section 2).
- **Fixed per type, unchanged:** the four basic kits, the four finishers (Lamp Lance, Lariat Drive, Mine Row, Thousand Cuts) and the four Final Smashes.

## 4. Guardrails for mixed builds

Each is a rule the editor enforces or warns about, and a check the balance pass runs.

1. **One kill move a build.** The kill moves are Haymaker, Lance Beam, Pile Driver, Spike Press and Pirouette Kick. Four are smashes, so the rule only bites one pairing: a build with Haymaker takes a non-kill smash (Shoulder Rush, Grip Reel, Vault Slam, Dash Through, Hex Ring...). The Grappler who wants Pile Driver pokes with Trick Knife or Shove Wave instead. *(Owner question: today's Grappler default has both; if the owner wants to keep that, the alternative is Haymaker at launch 9 when a kill smash is also picked.)*
2. **A recovery is guaranteed.** Every up special lifts; none is a pure attack. Vanish, the one flat blink, stays Trickster-only, so a Zoner or Grappler can never pick itself out of a way back.
3. **One root move a build, and a root never outlasts the stun.** Root moves: Tripwire Pod, Glass Shards, Seed Scatter, Spring Snap, Minefield. At most one in a build. In the rows, a root applied with a hit is capped at that hit's stun; a floor piece's root is 30 (under the 45 lock cap and under the stun of every follow-up). **The Minefield loop the owner found** (root 40 outlasting a 30-frame stun, the next mine planted under the stuck foe) is closed by the 2026-11-10 rule, a foe a mine has just gone off under is immune to that owner's mines for 120 frames, and that rule extends to EVERY OC floor piece (Pod, Seed, Scatter, Trap Hop, Minefield) under this design, with the owner cap of three live floor pieces kept. No build can chain root into root.
4. **One scramble a build** (Confetti, Corkscrew, Card Spray) and at most two slow sources (Drift Orb, Bubble Lure, Star Rain, Tar Burst, Spring Heel), so no build is a wall of status.
5. **At most one standing move a build** among Overcharge, Brace, Recharge, Shrug Off, Second Wind is a warning, not a block: the editor says plainly "This build stands still a lot."
6. **A big hit is expected.** If a build's hardest hit is under 12% (the owner's 23141 shape), the editor says "This build has no big hit." and lets the player keep it.
7. **The band.** Cross-type builds go through the viability method (the mid-top panel, 24 matches): a type passes when its best build scores 45-60%; a pairing above 60 is trimmed by its numbers, never by removing it from the type.

**How the editor shows this without role labels.** Nothing is tagged. A row the rules forbid is greyed with a plain sentence under the list when it is hovered: "Not with Haymaker: that would be two kill hits." / "Not with Glass Shards: one rooting move a build." The strip under the preview shows numbers and nothing else: `Hardest hit 24% · Rises high · Floor pieces 1 · Stands still 30 frames`. The type's own moves sit at the top of each list, the core below, in a fixed order with no divider.

## 5. Example builds (three a type)

| Type | Build | Neutral / Down / Up / Smash | Feel |
|---|---|---|---|
| Zoner | Lamplighter | Skyfall Spark / Glass Shards / Blink / Lance Beam | the classic lane: a mortar, a root, a long beam |
| Zoner | Lantern Brawler | Trick Knife / Floor Arc / Spark Pillar / Pirouette Kick | a Zoner who pokes up close and kills with a kick |
| Zoner | Fog | Drift Orb / Mine Seed / Beacon Drop / Tar Burst | slow walls and a seeded floor; no kill but a wall of slows (the editor says so) |
| Grappler | Haymaker Hands | Haymaker / Ground Pound / Rising Knee / Shoulder Rush | the kill punch build; the smash strips armour instead of killing |
| Grappler | Bait and Plant | Trick Knife / Fake-Out / Spark Pillar / Pile Driver | baits a swing, stuns on the rise, lands the plant |
| Grappler | Pusher | Shove Wave / Low Sweep / Armoured Climb / Grip Reel | no kill move: wins by pushing off the edge (the editor says "no big hit") |
| Trapper | Minelayer | Tripwire Pod / Mine Seed / Wall Spring / Spike Press | the floor build: one root, one seed, the bleeding press |
| Trapper | Snapper | Haymaker / Bear Trap Snap / Spring Snap / Rebound Dash | a melee Trapper: snaps, a rooting rise, the kill punch |
| Trapper | Tackboard | Tack Volley / Glass Shards / Blink / Vault Slam | a ranged Trapper with a leap out of the corner |
| Trickster | Knife Dancer | Trick Knife / Heel Spin / Vanish / Pirouette Kick | pure speed; the flat blink is the price |
| Trickster | Confetti Cannon | Bubble Lure / Marble Spill / Wake Dart / Card Spray | a status build: one scramble, slows, a carpet of marbles |
| Trickster | Shadow | Smoke Pop / Shrug Off / Spring Heel / Grip Reel | the annoying one: smoke, cleanse, slicks, a reel; no big hit |

## 6. What building it costs (for the plan, not for approval)

The rows already exist; the change is the lists. `OC_LISTS[type][slot]` becomes the type's view of the pool (type moves, then core), `ocNorm` accepts any id in that view, the editor list grows to 7-9 rows with the greyed-row sentences and the number strip, the build code and the online hello carry ids from the pool (the host validates against the type's view), `ocBrainKit` already reads per-option `ai` rows so a cross-type move needs no new brain code, and the mine-immunity rule is widened from Minefield to every OC floor piece. Then the viability method on the four pools. About the size of one type job.
