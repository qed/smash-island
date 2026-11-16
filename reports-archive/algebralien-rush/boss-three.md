# Boss Three (Boss 8 of 9) -- design pass for the Algebralien Boss Rush

Design only. No game file was edited, and no game code was run. The build read is `C:\Users\carad\Aardvark\smash-island\smash-bal` (branch ii-dlc, `artifacts/V1/index.html`); HEAD moved during this pass (the g-pencil-fs merge, a316e32, landed while I was reading), so every line number below is approximate and I name functions and constants instead. Wiki read 2026-11-02 in the built-in browser pane (my own tab, closed). The wiki is current to mid-2026 TPOT, so this document spoils TPOT 20-25.

Order in the rush: Two, Four, Nine, Six, Zero, X, One, **Three**, 2763. Health (owner's final curve): **2,700**.

---

## 0. The pitch

Three is the frightened one. One broke her, then "fixed" her wrong; Four hid her inside himself; she wants to be left alone. So she is a boss that **backs away from you**, hangs on to her blanket, and is most dangerous **when you corner her**. Her value is broken, so she is never exactly 3: before every attack she **slips onto a decimal** (2.9 purple, 3.1 dark yellow, 3.2 green, 3.1111... dark orange, all four colours straight off the wiki) and the colour she slips to is the tell. Halfway down she **shatters** (the way One shattered her in "Alone"), pulls herself together with all of One's power (the way "All For One" has it), and the second half is the strongest Algebralien in TPOT, frightened and furious. It comes right after the player has beaten One, which is the canon order of cause: One made Three, Three ended One.

Signature mechanic (one): **THE VALUE SLIP**, section 5.
Movement identity: **the corner rule** (she flees, cornering her makes her burst), section 4.

---

## 1. Canon (what the wikis say; nothing invented)

### 1.1 Pages read
- `battlefordreamisland.fandom.com`: **Three** (full wikitext: infobox, appearance, personality, powers, background, coverage, deaths, kills, trivia), **Homeward Bound!** and its **/Plot** subpage (her fight with Six's group), **All For One** and its **/Plot** subpage (the Gelatin disguise, the power transfer, the end of One), **Template:Three Random Quote** (her quote list), **2,763** and **Two Thousand Seven Hundred Sixty-Three** (the character).
- Not needed and not read: the II wiki (Three is not an Inanimate Insanity character). I did not read X's, Nine's, Six's, Zero's or Two's own pages: their relationship to Three is what Three's page says.

### 1.2 The character
- **Three Integer**, an Algebralien, an integer, **she/her** (the page asks for she/her to match TPOT; the infobox also lists they/them and he/him from lesser sources). Debut in canon: "Out of the Blue" (a hand from a cage), speaking debut "Alone" (TPOT 20), TPOT 23 and 25 are her big episodes. She is a "deuteragonist" of TPOT per the page. Voice: Em Mintz-Kreyns (TPOT 20+).
- **Look.** A light red numeral 3 with limbs. TPOT colours on the wiki: Grapefruit #fd575a body, Cra-Z Pink #fe7077 limbs, Almond bandage, black outline (and a dull Marsala #995656 "valueless" set). After One's recovery: paler, her **right eye is missing** (viewers' left), her colour and border shift erratically.
- **Personality.** Before: friendly, caring, observant (a note she wrote that says FAILURE; she bandages Five, tries to fix Nine's skateboard, shoos Fourteen off Zero), loves science, impulsive and bad at keeping a promise (she told the others about the Yoylite). Now: shut herself in a cage and cell for years, trauma from being "helped" by One, lashes out when approached; softens only with Purple Face (shared sad stories).
- **How she fights (Homeward Bound!).** Six finds her in the Fourtress cell. She refuses help, says the last time she was helped it broke her, and fires a **laser** that smashes the door of a nearby jail cell **full of weapons and armour**. She **floats up** and **slams Six into the cage door** with her power; Six answers by hurling a pile of that armour at her. Three **chases** the group down the E.X.I.T. halls, and later flies over and fires a **laser down the hallway** that turns Fifteen, Loser, Bottle, Golf Ball and Pen to ash; then she **flies back to the Fourtress, wanting only to be left alone**. Her lines there are all variations on telling them to stay away and get out and asking what they want, ending in "I've... had... ENOUGH!" (the one wiki quote in this file, kept short on purpose).
- **How she fights (All For One).** Disguised as Gelatin (possession) and flickering. One gives Three **all her power** to let her fix herself. Three fires a beam at One; Pencil shoves One aside and is disintegrated; Three, in an unhinged tone, says she missed her, chases her down the hall **firing lasers** until one hits, then **seizes One with her power; One's body cracks and, as Three clenches her fist, shatters**. Three drops exhausted onto some recycling bins, says she is leaving the E.X.I.T. and going home, and **teleports away**.
- **Powers on the page.** Regular (before): telekinesis, teleportation (same planet), matter creation (a new skateboard for Nine), abstract existence (embodies 3), flora manipulation (a tree branch grown into shelter), near-limitless power from the Yoylite (she was the second to take it). Corrupted (now): **electricity beams from her hands** (weaker than Four's), **flight/levitation**, **value alteration** (nearby values to **2.9, 3.1, 3.2, 3.1111...**, probably unintended; the glitch can be contagious), **possession** (Gelatin). Temporary nigh-omnipotence after "All For One": she holds Two's, Four's and the other numbers' powers; the page calls her the strongest Algebralien in TPOT.
- **The decimals (her best-documented glitch).** Valueless, she flickers into decimals near 3 and changes colour each time: **2.9 (Purple), 3.1 (Dark Yellow), 3.2 (Green), 3.1111... (Dark Orange)**. The wiki has a render of each (see 3.2).
- **Deaths:** once, "Alone" (shattered by One). **Kills:** eight (the accidental hallway victims, Pencil, One, Bomby).

### 1.3 Her relationships to the other numbers
| Number | In canon (from Three's page and the episodes read) | Use in the rush |
|---|---|---|
| Two | Ally; later given most of the power by the others after the One incident (Three was the catalyst for how they got powers). | Two is boss 1: the player has already met Two's orbs; Three has none of Two's tricks. |
| Four | Took her inside himself to protect her after One broke her (the Fourtress, the E.X.I.T.); "Buddy"; formerly her protector; later neglected her while chasing power, so she isolated herself. | **Her arena is inside Four**: the rush fought Four in his classroom and the Fourest; her cell is a few rooms away. Reuse is canon-perfect. |
| Nine | Pre-BFDI: she tried to glue Nine's broken skateboard and made a new one out of thin air. | Optional wink (a skateboard among the armory pieces), not used. |
| Six | Six comes to rescue her (TPOT 23) and Three attacks her group; they were friends before; Six stayed on the home planet. | Her fight with Six is the model for her attacks. |
| Zero | Pre-BFDI: she protected Zero from Fourteen. | None. |
| X | Formerly an ally: she encouraged X in "X Finds Out His Value"; both she and One scoff at Four calling seven lucky; in a non-canon 2024 New Year video X kicks her out of the way. | None. |
| One | First to befriend One, second to take the Yoylite; told the others the secret, so One shattered her, then recovered her wrong; Three ends One in "All For One". | One is boss 7: Three follows her. Phase 2 wears One's power. |
| 2,763 | **No relationship found.** The wiki's trivia: of the Algebraliens, Three alone is missing from the 2,763,000 Subscribers special even though 2763 ends in 3 (Six holds a paper 3 in its thumbnail instead). 2763 is a character (a multicolour Algebralien, its 3 yellow "Summertime"), but the page says the specials are non-canon. | The order is a wink (the boss before 2763 is the number it contains and the one that was never in its special). Game text only. |
| X, 2763 as characters | **Both are characters**; I found pages for 2763 and Three's page links X as a character. I did not read X's own page. | n/a for this pass. |

Not used from canon, on purpose: possession/Gelatin disguise (needs a decoy system; the `gelatin.png` render exists if the owner wants a Phase 2 gag), matter creation, flora (Evil Leafy's vines are already in the game), "value alteration" on the fighters (would touch the HUD or the controls), the "contagious" glitch as a status effect.

---

## 2. Place in the rush

- **Difficulty position 8 of 9.** HP **2,700** = 2.7x Two, 2.25x Four, 1.125x One, 0.9x 2763. She is the second-hardest, so: a second-from-last pattern budget (five attacks, two phases, a numbers-only ramp at 25%), wind-ups as long as the last three bosses get (a quarter longer than the base, `BOSS_TEL_PACE` style), gaps a little shorter than Four's.
- Nothing in her fight stops damage (no grounding, no shield, no invulnerable phases). The owner said of Two's Power Ungrounded that it "just makes him take way too long"; at 2,700 hp every second she cannot be hurt is a second added to a six-minute fight.
- Row proposal (the rush's own table; the engine's roster row is `BOSS_ROSTER`-shaped):
  `{name:"Three", color:"#fd575a", hp:2700, big:2.5, attack:"three", arena:"fourtress", stationary:false, sprite:"three"}`.
  Grapefruit #fd575a is the wiki's TPOT 20+ body colour. `big:2.5` gives a body radius of 85 px (Two and Four are 88 and 95). She floats (like Two and Four) but is not stationary.

---

## 3. Arena and body

### 3.1 Arena: THE FOURTRESS (a new, simple arena key `fourtress`)
- Canon: the Fourtress is the castle inside Four's inner world; Three's gray cell is one of a row of jail cells; another cell is stuffed with weapons and armour (the armory); the EXIT hallway has lockers. The rush already used the classroom/Fourest for Four, so Three's room is the same pocket dimension, one door down.
- The floor and platform are the Boss Rush flat stage's (Goiky: 1100 x 720, floor at 82% of the height, one platform at 62% height, 42% wide), so no geometry changes. What is new is the dressing only:
  - A dark stone wall with **three barred cells** across the back: left = the armory (piled steel, glows purple in her attack), centre = her gray cell with its blanket and door (the intro, the end), right = an empty cell that a phase 2 beat opens.
  - A high barred window with **the Fourest** behind it: call the existing `drawFourFourest()` (it works with no Four standing: it reads `fourBoss()` and falls back to an empty bag) for the trees and floating islands in the dark.
  - Ground: reuse `fourFourestFloor` (cracked tiles, blue showing through the cracks). Sky: the `fourest` colours (`#0d1738`, `#03071c`). Cool torch-blue light, low.
  - Add `fourtress` to `BOSS_ARENA_SKY`, `BOSS_ARENA_GROUND`, `BOSS_ARENA_ROOFED` and `drawArenaDecor`; a netcode client drops an arena key that is missing from the sky table.
- Fallback if the owner wants zero new art: use the existing `fourest` arena as it is. It is a lesser fit (no cells for the armory and the intro) but costs nothing.
- Hazard: none. Her room does no part of the work.

### 3.2 Body
- **No Three sprite exists in the game.** `artifacts/V1/assets/sprites` holds One, Two, Four (nine renders: the pose renders for his moves), Gelatin, Pencil, Purple Face, Tennis Ball and so on, but no Three; the game has no "Three" anywhere. There is `assets/sprites/attacks/zapbolt.png` and `tpot7bolt.png` for electricity, which she does not need.
- **The wiki has the renders**, the same pipeline as Four's eight (`scripts/fetch-sprites.mjs`, credits in `assets/sprites/CREDITS.md`, the unaffiliated-fan-work wording). Checked with the wiki's image API (size and type only, nothing downloaded):

| Look (our key) | Wiki file | Size | Use |
|---|---|---|---|
| `three` | Angy corrupted three.png | 572 x 703 | idle, phase 1: pale, glitchy, right eye missing (TPOT 20+). **Needed.** |
| `threecrack` | Cracked three.png | 831 x 891 | the shatter beat. **Needed.** |
| `threepow` | Three with 1+2+4's power.png (curly apostrophe in the real name) | 604 x 810 | phase 2: "all of One's power". **Needed.** |
| `threeblanket` | Three covered in blanket.png | 1094 x 618 | the intro lump. Optional (code-drawn lump is easy). |
| `three29` `three31` `three32` `three3111` | TwoPointNine.png, Thirty one.png, Thirty two.png, Thirty one one one.png (and Thirty one one one one.png) | 589x424 to 1392x716 | the four decimal looks. **Wide images: probably screenshots with a background, not cutouts; not checked for transparency.** Fallback: tint the idle render or the drawn body in the decimal's colour. |
| gelatin | Three as gelatin.png / `gelatin.png` already in the game | | not used |

  Also available, unused: Three paper cutout (754 x 802, valueless), Three in recover progress (490 x 566), Three anger (217 x 300), TPOT20ThreePose31 (about to shatter).
- **Drawn fallback** (every boss keeps one, shown until the render loads): a salmon "3" built from two arcs and a stroke like Two's path-drawn "2" (no text), two stick limbs, one eye (the left, viewers' right: the right eye is missing). About 25 lines in the `body` slot, with a `case` for every look key.
- **Colour language** (hex ours, names the wiki's): steady 3 = Grapefruit #fd575a; 2.9 purple (about #9a5fd0); 3.1 dark yellow (about #c9a21a); 3.2 green (about #8fd13f, yellow-green on purpose so it does not read as Two's #44C549); 3.1111... dark orange (about #d9731a).
- **Glitch look** (cheap): draw her render twice more, offset a few pixels left and right with `globalCompositeOperation:'lighter'` in a faint red and cyan, and shear her in two horizontal slices a couple of pixels apart. The wiki says her border does not hold still when she is broken: this is that.
- Size: phase 2 swells her radius by 12% (to about 95 px).

---

## 4. Movement: the corner rule

She floats (`s.hover = true`, as `twoMove` does) and never chases.
- **Keeps away.** She aims to hang about 380 px from the nearest fighter, on the side with more room, gliding at a factor of 0.04 a frame with a speed cap of about 3.4 px a frame (a fighter runs 6.4, so she can always be caught). Her height follows the target inside a band (30 to 190 px over the floor, like Two's) so she is always hittable from the floor with a jump.
- **Cornered.** If she is within about 90 px of a wall and the nearest fighter is within about 230 px, a counter runs; at 45 frames (0.75 s) the next turn is forced to LEAVE ME ALONE! (the burst; `BOSS_PICK.three.force`, which the picker already has), and the counter will not fire again for 300 frames, so nobody can be burst-locked.
- Effect: the fight is "chase a frightened boss to the wall, take a burst on your terms (the wind-up is long enough to step out, see 6), hit her in the gap, repeat". Her room is a corridor; the wall is the fight.
- Planted during wind-ups (they say where she is going); the beam's row alignment and the dash's back-step are her only wind-up moves.
- Two fighters on opposite sides: she holds the middle and uses the same counter on whoever is nearer (hysteresis so she does not twitch).

---

## 5. Signature mechanic: THE VALUE SLIP

Her value is broken, so she cannot hold 3. Before an attack her body **slips** to a decimal: the render (or tint) changes to that decimal's colour, the glitch shear and fringe flare, a small orb of the same colour swells at her raised hand. **The colour she slips to is the move**:

| What her body shows | Move |
|---|---|
| steady Grapefruit, hands cupped and white-hot, holding still at a row | the beam (HALLWAY LASER) |
| purple, one hand up, steel lifting out of the left cell | the armory (THE ARMORY, 2.9) |
| all four decimals one after another, 9 frames each, in the order the orbs will fly | the orbs (DECIMALS) |
| strobing through all four at random, speeding up, body curled | the burst (LEAVE ME ALONE!) |
| dark yellow, backing off and leaning in | the dash (OVERSHOOT, 3.1) |

- **Why this is the signature.** Nobody else in the rush has a tell made of colour, and none of her moves ever starts without a visible slip: the player learns five colours and five silhouettes, and everything is on the body (no line, no banner). The mapping is **game design, not canon**: the wiki gives the four decimals and their colours; I assigned them to moves by the decimal's meaning (2.9 falls short, 3.1 overshoots, 3.1111... repeats).
- **Readability for colour-blind players:** colour is redundant. Each move also has its own pose (hands cupped at a wall, one hand raised under floating steel, arms out and a flicker sequence, curled and shaking, hunched and backing off).
- It costs one colour table and the `bossLook`/`tell`/`body` slots; no new rule, no damage gating.

---

## 6. The five attacks

Damage is a fraction of `bossDmg()` (22 base, doubled per Boss Rush loop). Every part of one turn shares that turn's one attack id (the `volley` rule), so a fighter takes at most one boss hit from it ("Harder, same damage"). Anything that appears (a beam, an orb, a piece lifting out of the cell, a burst, a new "1" in the chain) grows in over 12 frames. Frame numbers are at 60 fps, before the wind-up pace multiplier; all are starting values to measure.

### 6.1 DECIMALS -- the signature move (`attack:"three"`)
- **Tell (46 frames):** four slips of 9 frames in the firing order (2.9 purple, 3.1 yellow, 3.2 green, 3.1111... orange); at each, an orb in that colour swells at her raised hand; the last 8 frames she holds the orange one steady and the aims lock.
- **Fire:** four orbs, one every 14 frames, each aimed at where the target stands as it leaves. 2.9: **falls short** (arcs, gravity 0.22, dies on its first floor touch, 0.7). 3.1: **overshoots** (flat, aimed 120 px over the target's feet; it goes on to the wall: a jumper's shot, 0.8). 3.2: **bigger** (radius 22, 5 px/frame, homes for 60 frames, 0.9). 3.1111...: **repeats** (radius 13, 6 px/frame, sheds a smaller copy of itself every 20 frames: 3 copies in phase 1, 4 in phase 2; the copies fly straight, so it becomes a train of "1"s you weave through, 0.8).
- **Phase 2:** the four fly twice, the second time in reverse order, after a short second flicker (24 frames).
- Tags `any`, with `spread` on the 3.1111... train when more than one fighter is up (`bossSituation`).

### 6.2 HALLWAY LASER (`threelaser`)
- Canon: the laser down the E.X.I.T. hallway, and the beams in "All For One".
- **Tell (54):** the steady one. She settles into pure Grapefruit (the only calm tell), drifts to the **row** she will fire on (three fixed rows: floor, platform, high; the one the target stands in) in the first 28 frames, turns, cups both hands at her chest, and a white-hot spark swells between them over the whole wind-up; the cell bars behind her start to catch the light. The last 16 frames she **holds still**: the row is fixed and the player can see it, because the row is her height.
- **Fire:** a beam 44 px tall from her hands to the far wall, thickness grows in over 12 frames, full until frame 24, thins out over 6, hits anyone it overlaps once it is half thick: **1.0**, knock 14 away and 8 up. The arena lights flare white and the bars throw long shadows across the hall (`ctx` additive, no lines drawn ahead of time).
- **Phase 2:** beams out of **both hands** (left and right on the row; nothing is "behind her"), then 20 frames later a second beam on the row the target is in now (28-frame wind-up, locks 12 before it fires). One hit per turn at most.
- **Dodge:** leave the row. A full jump keeps a standing fighter's feet above a 44-px beam centred on their body for about 25 to 30 frames (the game's GRAV 0.62 and JUMP -12.5, my arithmetic, not measured in play) against 24 live frames: tight, fair, not forgiving. A short hop does not clear it. Dropping off the platform or climbing onto it also does.
- Tag `any`. Not blocked by anything.

### 6.3 THE ARMORY (`threearmory`, value 2.9)
- Canon: the laser blows open a jail cell of weapons and armour; she slams Six with telekinesis; Six throws armour back.
- **Tell (48):** purple. One hand rises palm up; the left cell glows purple, its bars bend open (12 frames), and **five pieces** of steel (helm, sword, round shield, axe, boot) lift off its floor, grow in, and hover in a fan above her, bobbing and slowly turning while she tilts her head as if listening. The hover is the tell; each piece's aim locks 10 frames before it leaves.
- **Fire:** one piece every 12 frames at the target's spot as it leaves, 9 px/frame, gravity 0.18 (an arc), 14 px radius, **0.8**, knock 9; on the floor it clatters (puffs) and is gone in 20 frames.
- **Phase 2:** **seven** pieces, two launching together, one from each side (the right cell opens in the shatter beat and has its own pile).
- Art: five **code-drawn** silhouettes in steel grey with a purple glow (`PROJ_SHAPE`). Tag `ground`, `air`.

### 6.4 LEAVE ME ALONE! (`threepanic`)
- Canon: she orders them away and out, and the wiki has her snap at the crowd, "I've... had... ENOUGH!" (the quote above). The close-range answer to being crowded; the move the corner rule forces.
- **Tell (36):** she **curls up**: arms over her face, body squashed to 80% and shaking, colours strobing through the four decimals at random, faster every few frames, a fringe of static round the body (tight to the body, **no ring marking the burst**: the new rule keeps the tell on the body).
- **Fire:** she snaps open; a burst of static grows in from her body to **body radius + 150** over 12 frames and stays 8 more; **0.9**, knock 17 away and 11 up (it throws you back across the hall: "leave me alone"). From the worst spot (touching her) a fighter needs about 21 frames to run clear of it at 6.4 px a frame; the wind-up is 36 plus the pace multiplier, so it is a trade you can win.
- **Phase 2:** a second burst 24 frames later, 40 px bigger.
- Tag `close`.

### 6.5 OVERSHOOT (`threechase`, value 3.1)
- Canon: she **chases** them down the corridors.
- **Tell (40):** dark yellow. She backs toward the wall behind her (12 frames), hunches toward the target, body tilted forward about 25 degrees, shaking, yellow static trailing; the last 14 frames she holds still, the **row** (floor, platform, high) locked.
- **Fire:** she flies along the row at 15 px/frame **through** the target's spot (to the far wall; "overshoots 3"). The hit is her **core** (0.7 of her radius) so it can be cleared; **1.0**, knock 14 along her heading and 9 up. At the wall she bonks (shake 8, dust), spins and is stunned 24 frames: the one scripted, generous punish window in her kit.
- **Phase 2:** she bounces straight back along a row re-locked after a 14-frame hunch (there and back; one hit per turn at most).
- Rule: it never starts if she is closer than 260 px (she cannot back off), so a fighter pinned at her wall gets the burst or the armory instead. Tags `far`, `wall`.

### 6.6 What each move avoids
- Four's ZAPPIES! is a vertical bolt on a marked spot; her laser is horizontal, full-width and row-based. Four's SCREECHY! is an expanding ring; her burst is a point burst around her body, not a ring. Two's orbs come in pairs from a ring; hers come by colour in a line. One's kit is "Two's and Four's attacks"; nothing here copies either. No blocks, no hearts, no hills, no rails, no clap.

---

## 7. Phases (two)

| | Phase 1: Valueless (100 to 50%) | Phase 2: All For One (50 to 0%) |
|---|---|---|
| Look | pale, glitchy, one eye (`three`) | swollen 12%, the power-up render (`threepow`), One's mint and light-blue aura (`ONE_AURA`) |
| Gap after a turn (before the engine's 1.2 pace) | 96 | 68 |
| Beam | one beam, one row | both hands, then a second row |
| Armory | 5 pieces, one side | 7 pieces, both sides |
| Orbs | four, once | four, twice (second reversed) |
| Burst | one | two |
| Dash | one way | there and back |
| Room | cells and the barred Fourest window | the back wall comes apart (see below) |
| Numbers ramp at 25% | | no card: gap 68 to 58, +1 armory piece, +1 "1" in the chain |

- **The shatter beat (phase 2 begins, about 110 frames):** every timer is held; she cracks (`threecrack`), the lights drop, she bursts into **six pieces that hang in the air** (the render drawn through six clipped wedges, from a fixed table so a client draws the same), then the pieces pull back together with a flash, now in the power-up look with the aura, flickering. This is the canon death, staged the way the wiki stages it: the pieces, the recovery, the power that comes with it. During the beat she can be hit but nothing attacks.
- **The room:** the back wall's bricks drop away, the bars bend, the right cell stands open, and `drawFourFourest` shows through where the wall was (the same trick as Four's tear). Optional stretch, one small addition: two or three floating slabs (`worldPlats` entries with a boss tag, like Two's steps) hang in the hall so the high row has something to stand on. Cheap, but keep it out of the first cut.
- **Engine detail:** `updateBossAttack` hard-wires the phases at 66% and 33% (`newPhase`), and every change plays a "NAME - PHASE n" card. Two phases at 50% therefore needs a **per-boss threshold** hook (about 4 lines) or the workaround: Three's phase 2 = the engine's phases 2 and 3 (switch at 66%, the third card named the same), which leaves phase 1 only 900 hp. I recommend the hook (it serves the whole rush).

---

## 8. Intro and defeat

### Intro (about 150 frames before her first wind-up)
The arena comes up dark with a heavy vignette closing on the central gray cell (in Seasonal Shift the wiki has a darkening vignette zooming in on her as she opens her mouth; this is that shot). A lump under a gray blanket trembles in the cell, its edges flickering purple; the barred door swings open with a creak; the blanket slides, she grows in over 12 frames and rises, and the vignette opens out over about 40 frames to the whole hall. `_atkTimer` starts around 200 so the player has the beat. No text (an optional hand-lettered paper sign on the bars, "KEEP OUT", is game text, ours; skip it unless the owner wants a sign).

### Defeat (about 150 frames, card held back about 2,600 ms)
The slips stop. She goes steady Grapefruit for the first time, the aura goes out, and she **sinks to the floor, exhausted** (the recycling-bin beat). She looks at the player with her one eye. A gray blanket grows in beside her; she pulls it over her head; a small pop, and the blanket falls empty (she teleports, as the wiki has it: she says she is leaving for home and vanishes); the cell door swings shut on its own; the vignette closes, then opens on the next boss. Optional single word, the ending's one line: **"Going home."** (game text, ours, from the canon event). There is nothing violent in it: it is the kind ending for the character the rush has just asked the player to beat.

---

## 9. How it should look cool (the set-piece list)
1. The **vignette and the blanket** intro: one cell, one lump, a long creak.
2. The **colour slips**: the body tearing into two offset slices with red and cyan fringes, settling back to steady Grapefruit between turns.
3. The **hallway beam**: the whole corridor goes white for a moment, the bars cast long shadows, the dust on the floor jumps along the row.
4. The **armory**: the cell door bends, five pieces of steel float out like a halo and take their turns.
5. The **repeating decimal**: a trail of small orange "1"s, drawn as simple digit paths or dots on discs.
6. The **shatter**: six pieces hanging in the dark, then the flash.
7. The **ending**: a quiet beat, one small pop, the cell door swinging shut.
Sound is the synth the game already has (`tone`, `noise`): a crackle with a filter sweep on each slip, a rising hum under the beam's charge, steel clatter for the armory, nothing new on disk. Music stays the shared boss playlist.

---

## 10. Draft numbers (starting values, one table like `TWO` and `FOUR`)

```
THREE = {
  phaseAt:0.5, ramp:0.25,                         // phase 2 at 50%; a numbers-only ramp at 25%
  tel:{ three:46, threelaser:54, threearmory:48, threepanic:36, threechase:40 },  // pace x1.25 like the last bosses
  gaps:[0, 96, 68],                                // x BOSS_PACE (1.2) = 115 / 82 frames: the window she is open
  move:{ stand:380, glide:0.04, cap:3.4, hover:{lo:30, hi:190, bob:8}, corner:{pad:90, near:230, hold:45, cool:300} },
  laser:{ h:44, grow:12, live:24, lock:16, dmg:1.0, kb:14, p2:{ gap:20, tel2:28 } },
  armory:{ n:[0,5,7], rise:36, every:12, v:9, g:0.18, r:14, dmg:0.8, kb:9, lock:10 },
  dec:{ each:9, fire:14, r:[12,12,22,13], dmg:[0.7,0.8,0.9,0.8], chain:{ every:20, copies:[0,3,4] }, p2:{ again:24 } },
  panic:{ reach:150, grow:12, live:8, dmg:0.9, kb:17, p2:{ again:24, more:40 } },
  chase:{ v:15, core:0.7, dmg:1.0, kb:14, bonk:24, near:260, p2:{ back:14 } },
  shatter:{ total:110, shards:6 }, end:{ total:150, hold:2600 }
}
```

Pick tags (the `BOSS_PICK` entry): `three`:`any`; `threelaser`:`any`; `threearmory`:`ground`,`air`; `threepanic`:`close`; `threechase`:`far`,`wall`. `force`: the corner counter. `busy`: the beam, the pieces in the air, the dash, the burst, the shatter beat (the turn's next wind-up waits for all of it, the "one attack at a time" rule).

---

## 11. How long, and what that means

- Measured by the repo's own harness (`scripts/boss-rush-balance.json`, 15 fighters as bots, 16 seeds): Four at 510 hp took about 64 s, so about **8 hp a second** of damage on the boss. The owner's own One calibration ("2000 hp is good ... a casual nkg, so abt 4-8 mins") is 4 to 8 hp a second.
- Three at 2,700 hp: about **5.6 minutes at 8 hp/s**, **5.4 to 10.8 minutes** on the owner's One scale. Plan for six to nine. A turn is about 3.8 s in phase 1 (56 wind-up + 55 action + 115 gap frames) and 3.2 s in phase 2, so the fight is roughly **100 turns, about 20 of each move**.
- **The whole rush:** 1,000 + 1,200 + 1,400 + 1,600 + 1,800 + 2,100 + 2,400 + 2,700 + 3,000 = **17,200 hp**: about **36 minutes at 8 hp/s** (28 to 68 on the owner's scale), plus about 4 s of ending between bosses.
- This is the biggest risk to the fight, not to the code: **repetition**. Five moves, two phases and a ramp is thin for a 100-turn fight. The picker's variety rule keeps the order shuffled but not new. Cheap mitigations: each move has two or three random variants (row choice, orb order, piece order, dash side); the 25% ramp; a damage multiplier for the event (the owner's call).
- Check: is 2,700 final (does the rush skip `BOSS_HP_MULT` 1.5 and the +60% per extra fighter)? If either applies it is 4,050 or more.

---

## 12. Build notes

- **Slots used** (`// @boss:three:begin <slot>` pairs, the boss overhaul's rule): roster, extra (`BOSS_EXTRA.Three`: laser, armory, chase, panic; the signature is DECIMALS), pick, moves (four entries), helpers (the `THREE` table and functions), spawn (`threeSpawn`: the intro), move (`threeMove`: float, flee, corner counter), tick, tel, fire (the signature), gap, tellen, phase, phasename, telname, ending, netshot, net, shotdraw, fx (the vignette, the beam, the burst: drawn in world space from `b._hz` and `hazardT`), look (`bossLook`), tell, body (the drawn fallback), sky, ground, decor, sprite, flip, shape (`PROJ_SHAPE`: five armour glyphs, four orb glyphs). Outside the file: `scripts/fetch-sprites.mjs` picks and `CREDITS.md`.
- **Engine hooks the rush needs anyway** (outside any boss's slots): (1) `bossPaced()` looks in `BOSS_ROSTER` only: the event's roster must be seen by it (do **not** append the nine to `BOSS_ROSTER`: `BOSS_ROSTER.length` feeds the "All N bosses beaten" card, the `rush2` award, the loop-on-Four logic and the item boss); (2) a per-boss phase threshold; (3) skip the `banner(bossTelName(s), ...)` call when the name is empty (the move-name popup rule: `bossTelName` returns `""`); (4) the event's HP bypass of `BOSS_HP_MULT`.
- Reuse, not rewrite: `impact`, `puff`, `shake`, `tone`/`noise`, `bossShot`, `addProj` (orbs and armour), `applyHit` with `{bossAtk:id, volley:true}` (the beam and the burst, the way `fourZapStep` does it), `drawFourFourest`, `fourFourestFloor`, `ONE_AURA`, the carrier pattern from `twoCarrier` for the hovering armour.
- Netcode: the beam, burst, shatter and the intro's vignette must be pure functions of `b._hz` (a few plain numbers) and `hazardT`, no `Math.random` in a draw; the orbs and pieces are ordinary shots with a `shape` and a digit in their own field so a client draws the right one; the shatter's six wedges come from a fixed table.

---

## 13. What could go wrong

1. **Repetition** (section 11): the main risk.
2. **Beam rows.** If the row follows the target's exact y it moves under a falling or jumping fighter. Use three fixed rows and lock the row 16 frames before the fire. Row 1 (platform) hits a fighter standing on it; row 2 (high) hits only a fighter in the air, so she picks it only then.
3. **Corner trap.** Two fighters, one each side: she cannot flee, her counter can twitch. Use the nearer fighter, a dead zone, and the 300-frame cool-down. A fighter cornered between her and a wall must be able to leave in the burst's wind-up: 36 frames, 21 needed.
4. **Dash.** A pinned fighter at the end wall has only the row to dodge by; the rule that it never starts inside 260 px is what keeps that fair. The platform fighter versus the floor fighter versus the air fighter each have a row; confirm the core radius (0.7) clears on a jump from the floor (the floor row's centre is a body's height up; a jump clears about 126 px).
5. **CPU.** The beam and the burst hit through `applyHit` from the hazard bag, not as projectiles, so the CPU's projectile-dodging will not see them; CPU fighters will also chase her to the wall and trigger the burst constantly. Measure with `scripts/boss-solo.mjs` (BelowNormal, at most two node processes); per the owner's rule do not tune her for bots.
6. **Online.** Everything a client draws must come from the snapshot (section 12). The mid-fight shatter and the intro are scripted beats on a clock (`hazardT` offsets): safe, but they are the easiest place to desync a late joiner.
7. **Boss Rush engine.** `bossAttackWatch` holds the next wind-up until the last shot is over: the beam, the burst, the dash and the hovering pieces are not shots, so `BOSS_PICK.three.busy` must say they are live. The 50% threshold needs the hook (section 7). A stray "PHASE 3" card would show at 33% without it.
8. **Art.** The four decimal renders are wide and probably not cutouts; if they are not usable the tint fallback must still read (it is the signature). Three renders are enough for the first cut.
9. **Colour is a tell, not the only tell.** Every move also has its own pose (section 5); test them in grayscale.
10. **Damage immunity creeping in.** The shatter beat holds attacks, not damage; nothing else may make her unhittable (the Two lesson).
11. **A boss with no contact damage** (like One: "remove the damage-box for one"): nothing else of hers should touch a fighter outside a move's hit window; the corner rule is how the fight pushes back, not a body hitbox.

---

## 14. Size

**Medium**: about **650 to 800 lines** across 25 slots (a rebuilt early boss is 750 to 1,100 lines with comments; Two is 1,200, Four 1,400, Springy about 500). By part: the table and movement and corner rule about 90; the five moves about 330 (laser 70, armory 80, decimals 90, burst 40, dash 50); the shatter and the intro and the ending about 130; the body, tells, looks and glyphs about 110; the arena dressing about 110 (the decor; sky and ground are two lines each); netcode and pick and tel and phase glue about 50.
**Art:** up to **nine renders** from the wiki (three needed: idle, cracked, power-up), **one arena** (code-drawn, reusing the Fourest backdrop and floor), **nine code-drawn glyphs** (five armour pieces, four orbs), **no audio files**.

---

## 15. Questions for the owner

1. Two phases at 50% needs a tiny per-boss phase-threshold hook (the engine has 66 and 33 fixed). OK, or should her second phase start at 66%?
2. A boss that **backs away** and bursts when cornered: OK, or should she hold the middle like Two?
3. Phase 2 wears **One's mint and light-blue aura** ("All For One"): OK?
4. Pull her renders from the wiki the way Four's were (Angy corrupted three, Cracked three, the 1+2+4 power render, with credits), or draw her only in code?
5. The ending word "Going home." (ours, from the canon event): keep, or no text?
6. Is 2,700 final, bypassing the usual 1.5x and the per-fighter hp scaling?

---

## 16. Canon versus game text

- **Canon (from the wiki):** her look and colours; the corrupted powers (beams, flight, telekinesis, value alteration, the four decimals and their colour names); the cell, the armoury cell, the hallway laser, the chase, the Gelatin disguise, the power transfer, the crack-and-shatter of One, the exhausted collapse and teleport home, her blanket, the vignette in Seasonal Shift; the relationships in 1.3.
- **Game text, ours:** the mapping of decimals to moves, every hex value except the two the wiki states (#fd575a, and her limb pink), all numbers and timings, the five armour pieces, the shatter staging, the phase names (they use the wiki's own words "valueless" and the episode title), "Going home.", the optional "KEEP OUT" sign, and the fight itself.
- **Not found:** no canon for Three and 2763 as a pair; no canon for how X relates to her in the main timeline beyond what Three's page says.
