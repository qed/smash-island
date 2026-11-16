# ALGEBRALIEN RUSH: the one spec (design director, 2026-11-02)

Merges `fit.md`, `boss-nine.md`, `boss-six.md`, `boss-zero.md`, `boss-x.md`, `boss-three.md`, `boss-2763.md`, `attack-options-two.md`,
`attack-options-four.md` and `owner-rules.md` in this folder. READ-ONLY on the game: nothing was edited, committed or pushed. The word
"pipis" lifted the feature freeze for this event (owner, 2026-11-02). Everything in CAPITALS (move names, phase names) is game text, not canon.

What I verified myself (not just carried over): (1) the live-day rule, by an independent script (section 4); (2) on the BFDI wiki, as raw
wikitext in my own browser-pane tab, that all nine are Algebraliens (species lines of Two, Four, Nine, Six, Zero, X [a Variable], One,
Three and 2,763 all read Algebralien), that X and 2,763 have their own character pages (2,763: voiced by Jackie Skinner, the villain of the
two subscriber specials, the first of which carries the wiki's non-canon-content template); (3) in the game, that every hook this spec
names exists (`bossPaced`, `BOSS_ROSTER`, `damageSummon`, `twoUngroundedBlocks`, `ONE_PHASE_HP` read at four sites, the banner call,
`forcedScroll`, `shopNow`/`SHOP_CLOCK`, `startOneFight`, `oneUnlocked`, `walletEarn`, `MCAVE_OPEN`/`MCAVE_DEV` ...), and that the engine
caps a fighter's damage from one attack id at `bossDmg()` (22%) unless the shot carries `bossCap` (this corrected four numbers, section 2.4).

---

## 0. The whole thing on one screen

- WHAT: a special event, a SIBLING of the weekly lap (not a row in it): nine Algebralien bosses back to back, one fighter, 4 stocks, +2 after
  each boss (max 6), each boss in its own larger arena. Order: Two, Four, Nine, Six, Zero, X, One, Three, 2,763. Bars: 1,000 / 1,200 / 1,400 /
  1,600 / 1,800 / 2,100 / 2,400 / 2,700 / 3,000 (17,200 HP).
- WHEN (UTC): in a month where a weekday occurs five times, the last two occurrences of it, any weekday = days 22-24 and 29-31 of a 31-day
  month, 22-23 and 29-30 of a 30-day month, 22 and 29 of a leap February, never in a 28-day February. 58 live days a year (60 in a leap year),
  about 22 windows. First live days: 22-23 Nov 2026 (20 days from today). Every live day opens the whole rush.
- HOW IT RUNS: a small conductor starts one match per boss (the way One's and Cobs's fights already work), carries the stocks, pays Win Tokens
  the moment a boss falls, and shows an interlude card between fights. A defeat offers "Retry boss". Offline and solo at launch.
- HOW IT IS BUILT: seventeen small milestones, each one cheap agent. The shell and a shared "big stage + boss hooks" kit land first, hidden
  behind `RUSH_OPEN` (off) and `RUSH_DEV` (the owner's preview). Every shared engine edit lands ONCE in that kit, so each boss milestone touches
  only its own `@boss:<key>:` marker pairs and the three lanes can build in parallel. All nine can exist by 19 Nov; the owner flips
  `RUSH_OPEN` on the evening of 21 Nov (= 00:00 UTC on the 22nd), or on 28 Nov for the 29th if the 18 Nov go/no-go says no.
- SIZE: about 7,850 lines in `index.html` for everything (lean path about 6,900; range 6,600-9,300), plus about 20 wiki renders to fetch and
  look at. Honest note: that is the size of the whole 12-boss overhaul. 20 days is tight and works only with three parallel lanes.
- LENGTH (the owner should hear this first): at the speeds the game has measured (6.5-9 HP/s), a clean clear is about 36 minutes of fighting
  (29-48), plus about 1.5 minutes of walk-ins, and a first clear with retries is over an hour. The knob for it is one number, built at 1.0.

---

## 1. The rush, boss by boss

Order is the owner's. Time at 8 HP/s (the middle of the measured range; 6 and 10 HP/s are in section 2.2). Lines are the monolith lines each
needs (full / lean).

| # | Boss | HP | Arena (key) | Signature (what the player must do) | Moves | Phases | Defeat | Fight | Lines |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Two (rush version) | 1,000 | A-twos-ment Park (`twopark`, existing) on the big stage | MIND READ!: copies your last special; becomes DOUBLE TAKE | the owner's five | engine 3 (66/33) | existing exit | 2:05 | 350 |
| 2 | Four (rush version) | 1,200 | Exit class then the Fourest (existing) | SCREECHY!: the ring, now THE LONG NOTE | the owner's five | engine 3 | existing exit | 2:30 | 350 |
| 3 | Nine | 1,400 | The Skate Park (`skatepark`, new) | GLUED TO THE BOARD: dodge a commit and Nine is exposed | 5 | 2 acts + a tempo bump | stuck on a drop tower | 2:55 | 950 / 750 |
| 4 | Six | 1,600 + 2x120 bubble | The Equation Playground (`eqplayground`, new) | THE BUBBLE: pop it for a free window | 5 (one only from phase 2) | 2 (50%) | pale, flops into the leaves: "Yay." | 3:50 | 830 |
| 5 | Zero | 1,800 | Zero's Bunker (`zerobunker`, new, 3 looks) | the megaphone FIZZLE: hit him during the call and it fails | 5 (one per phase from 2) | 3 (66/33): Leader, Embarrassing Tapes, Combine | the Giant splits into a crowd that marches off | 3:45 | 850 / 600 |
| 6 | X | 2,100 | The 500-Step Platform (`x500`, `x500sun`, new) | HIDE AND SEEK!: cups and ball, finding X pays | 6 | 2 (50%) | his baskets carry him off the top | 4:22 | 1,250 / 1,000 |
| 7 | One | 2,400 | her own world (`onemoon`, existing teams map) | existing (a phase line every quarter; she inherits Two's and Four's moves) | 13, as she is | 4 bars (per-boss quarter) | existing | 5:00 | 60 |
| 8 | Three | 2,700 | The Fourtress (`fourtress`, new) | THE VALUE SLIP: the colour she slips to is the move | 5 | 2 (50%) | sinks, pulls a blanket over her head, "Going home." | 5:37 | 700 |
| 9 | 2,763 | 3,000 | The Void (`void2763`, new) | THE DRAIN: no specials near it; what it drains becomes lights | 5 (FLOOD from phase 2) | 2 designed (3 bands) | the giant Zero's foot comes down | 6:15 | 1,100 / 900 |

### 1.1 The nine, one paragraph each

**1. Two (1,000, the gentle start; the owner's picks).** The existing Boss 10 (flies, pops, the sun, the blocks, the clap), rebuilt for a stage
2.2 screens wide so he cannot be outrun: every anchor that was the world's middle or edge reads the local window around you, he is on a
leash (a pop to within 650 px of you at the start of every turn), and his kit is the owner's five picked from the eight in
`attack-options-two.md`. His signature stays whichever five are picked (MIND READ!, the copy of your last special, as DOUBLE TAKE: two rifts
placed relative to you, so a runner meets the second). My recommended five: SUN HUNT (the sun hops after you), TOWER ROW (blocks marching
toward where you run), CLAP FULL SPAN (hands sweeping at a fixed 17 px a frame that lead your run), DOUBLE TAKE, HI GUYS! (he pops 150 px from
you and lunges). His three phases and exit scene are unchanged. Place in the curve: the lesson is "read a body tell on a big stage"; about two
minutes; the lowest bar in the run, so the highest tolerance for a mistake.

**2. Four (1,200, the old final boss, now second).** The existing Boss 12: the Exit class, the Fourest, SCREECHY!. Same recipe as Two (local
window, leash: his slither now goes to 500-700 px from you on the side with more room, not to the mirror of the world). Nothing in the rush may
reach the old "Four fell" branch (no victory card, no loop, no `boss:Four` trophy). My recommended five from `attack-options-four.md`: THE LONG NOTE
(the ring, faster than a run, a second ring from phase 1, gaps sized to the nearest fighter), ZAPPIES! BLUE MARK AHEAD (columns placed where you will be),
THE CACTUS DRIVE (two cacti that accelerate to a sprint, from opposite sides), FIVE PAIRS OF ARMS (palms sweeping along the floor, a safe pocket
under his chin for the brave), SOUP'S ON! (pools that deny the floor you flee across). Place in the curve: the first fight where a ring, a lead and
a floor trap all matter; about two and a half minutes.

**3. Nine (1,400).** The skater: the only boss that is on the ground, fast, made of stunts; Two and Four float and pop, Nine rolls. Arena: Nine's
skatepark on dusk indigo-to-pink (quarter-pipes, string lights, a collapsed loop), the planet behind cracks at the act change. SIGNATURE, GLUED TO THE BOARD
(canon: Nine's feet are superglued to the board): Nine cannot stop, turn or cancel a stunt, so lane and landing lock 18-20 frames before it starts, and every
dodgeable stunt ends with Nine EXPOSED (a wipeout after the long runs, a stuck landing after the jump and the grind): no attacks and +50% damage until back up.
It is the one boss where DODGING opens the boss. Moves: TUBULAR! (the board run; from act 2 also the motorcycle run that explodes against a dead tree, canon:
explosion resistance), CLEANUP CREW! (the Skateboarding Aliens' boards roll past on uneven gaps, a platform lane in act 2), BOOYAH! (a flip, then the fall),
STONE-TO-BOOT! (act 2: a stone boot falls on your spot and kicks you inward), GRIND! (up a quarter-pipe, along the platform, off in an arc). Acts: "Totally
Tubular", "Not Radical" (he cries, the planet cracks, the lights go out), then "Clobber Time" (a tempo bump). Defeat: the glasses and board fly, a drop tower
grows and Nine lands seated on it, throws the glasses at the down button, an orange glow rises along the floor: the gag from the 3,517,000 special, and the first
seed of the lava that belongs to the last boss. Place: the first commit-and-punish rhythm, a gentle boss to hit; about three minutes. Correction applied: BOOYAH!
loses its landing shock waves (they belong to X's dive, section 2.5) and the motorcycle and boot hits are written at 1.0, not 1.1.

**4. Six (1,600, plus two bubbles of 120).** The bored, sarcastic artist who blows bubbles and rakes leaves. Arena: the Equation Playground at golden hour (a big
tree whose branch is a ledge, the house Two built whose roof is a ledge, a pale cracked Moon; dusk in phase 2). SIGNATURE, THE BUBBLE: she fights inside an
iridescent bubble that soaks up the first 120 damage of each phase; the bubble shows its health by shrinking and rippling (no bar). Pop it and she drops to the floor,
dazed 90 frames, no attack for 100 frames: a window the player earned. A new bubble forms at 50%. Moves: BUBBLES! (homing bubbles, her signature move), LEAF RAKE!
(a heap of leaves runs the whole floor, faster than a run, jump it), SLAP! (the elastic arm along your row, reuses Springy's long arm), ROCK DROP! (slabs flung up and
dropped one per fighter, shadows first), and from phase 2 KICK OUT! (she pops beside you, a stone boot swings, you tumble toward the middle). She never chases: a
stand-off of 480 px (380 in phase 2) and a pop to wherever a move begins. Phases: Staying Behind, Revenge (she is angry, the sun sets). Defeat: the glow on her hands
goes out, her render fades to the pale Powerless one, the leaves of the fight sweep into a pile and she falls back into it with a flat "Yay.", one bubble rises and
pops. Place: the long fight with a second health layer; about 3 minutes 50 seconds with the shields. Corrections applied: KICK OUT! and ROCK DROP! are written at 22%
(the engine's cap), and her gaps are lowered from 200/150 to 170/130 base so she does not sit at twice the pace of the boss after her (section 2.3).

**5. Zero (1,800).** The coward who leads the Zeroes: the smallest boss of the rush (a grey ring in a blue-and-yellow cap, radius 65) who ends as the Giant. Arena: Zero's
Bunker in three looks read from the boss's state (dusty concrete with a CRT TV, tapes and pipes; then the TV plays the pillow tape, four small Zeroes laugh on the
shelf and a lava glow seeps in; then the wall is torn off onto a red world with rows of tiny Zeroes marching in). SIGNATURE, THE MEGAPHONE FIZZLES: ROLL CALL! summons
a conga line of Zeroes, but if he loses 18 HP between the start of the call and its end the megaphone cracks, no Zeroes come, and he stands flustered 90 frames
(he blushes: canon). It is the player's active answer to a boss that keeps his distance. Moves: ROLL CALL! (the marching line, two lines from phase 2, a line along the platform
from phase 3), TAPE TOSS! (tapes lobbed in a comb across your spot, shadows first), DIVIDE BY ZERO! (a big white division sign chops in front of him and erases your shots; its dots roll away
later), STOP LAUGHING AT ME! (phase 2: the freezer door bangs three times, then he rolls out pure red and hits the far wall: a stun), THE FOOT! (phase 3 only: the Giant's
foot falls on a shadow). Phases: Leader (a coward who hides in pipes), Embarrassing Tapes (red rage, he walks at you), All Zeroes, Combine! (the fusion flash, the bunker torn open,
Giant Zero r 116, planted). Defeat: the Giant splits into a dozen small Zeroes that bump into each other and march off both sides, the hat rolls last (the one sign, a cardboard
"THE BEST DAY OF ZERO'S LIFE", is optional). Place: crowd control with an arc and an interrupt; about 3 minutes 45 seconds. Corrections applied: his optional lava hazard is
CUT (lava is 2,763's; the seep stays as scenery), and the giant foot drawer is built here as a shared helper so 2,763's ending can reuse it (the setup and its payoff).

**6. X (2,100).** The BFB host (a yellow Variable, the letter X, an Algebralien), baskets, a snap, flames. Arena: the 500-Step Platform (a stepped pyramid with the button on top, the long
stair rising behind into the clouds; in phase 2 the sky crossfades to hot orange and a big sun comes close). SIGNATURE, HIDE AND SEEK!: every fifth turn X ducks into one of three (four in phase 2)
propeller baskets that swap like cups; the real one hangs 6 px lower; find him (hit the right basket) and he tumbles out dizzy for 100 frames, takes 2.5% of his max HP at once and x1.5
damage; a wrong basket bursts and nicks you lightly; if you take too long he pops out annoyed and every basket drops on you (a BASKET RAIN). Moves: BASKET RAIN! (a row of propeller baskets
that fall and lie as low steps), SNAP! (the floor goes to static in alternating columns, then they are deleted: three-beat count), ROCKET DIVE! (up off the top, a lone shadow, down head-first into
the floor, two low waves, stuck 70 frames), ARROW DASH! (an arrow across the whole stage on your row), BURNING! (phase 2 opener: a figure-eight flight shedding embers, x1.25 damage while he panics).
Phases: The Host, Pushed To The Limit (below 50%: alight for good, a passive ember drip). Defeat: the baskets swoop in, clamp on and lift him off the top of the screen (the stinger of BFB 1).
Place: the longest pattern fight, a hunt inside it, about 4 minutes 20 seconds; the bounty is a quarter of his HP, which is what keeps it under five. He is the second-largest build (cut list:
ARROW DASH, the third snap and second dive, the ember patches).

**7. One (2,400).** Not rebuilt: she is the existing secret boss and the rush's one fight in a world that is already wide (the teams map, about five screens, her teleport, her orbit). She carries eight
of Two's and Four's moves plus five of her own (MOON ROCKS!, EYE LASERS!, HANDS FROM THE GROUND!, OUT OF ORBIT!, GHOST FIGHTER!): meeting them in fights 1 and 2 and again here is the point of the order
(canon: she took their powers). Five small changes (about 60 lines): HP from the curve, her phase line becomes a quarter of her own bar (it is a constant, 500, read at four sites, and would leave the last
bar 1.8 times the others), the stocks she starts with come from the run, her own end-of-fight hook returns true so the rush takes the screen, and she is never in the list of a player who has not beaten her.
The rush can neither unlock her nor count toward her chain. Place: the complexity spike of the run (13 moves); the two bosses after her climb by phase and stage, not by kit size (section 2.3). Note for the owner:
the live game's comment says One was trimmed from 2,400 to 2,000 on 2026-10-06 ("abt 4-8 mins"); the curve puts her back at 2,400 (question 8).

**8. Three (2,700).** The frightened one: One broke her, then "fixed" her wrong. She backs away from you, and she is most dangerous when you corner her (a 45-frame counter forces a burst, then a 300-frame cool-down).
Arena: the Fourtress, a pocket-dimension hall in Four's world (three barred cells across a stone wall: an armory, her grey cell, an empty one; a barred window onto the Fourest, reusing Four's backdrop). SIGNATURE,
THE VALUE SLIP: before every attack her body slips to a decimal and the colour she slips to is the move (2.9 purple, 3.1 dark yellow, 3.2 green, 3.1111... dark orange; steady Grapefruit for the beam), with a pose for each so colour is
never the only tell. Moves: DECIMALS (four orbs, each behaving as its number does: falls short, overshoots, bigger, repeats), HALLWAY LASER (a row beam from her hands: floor, platform or high), THE ARMORY
(steel from the cell floats up and is thrown), LEAVE ME ALONE! (a point burst around her body, the answer to being crowded), OVERSHOOT (a dash through your row that ends in a wall bonk). Phases: Valueless, All For One (below 50%:
she shatters into six hanging pieces, pulls together swollen, wearing One's mint-and-blue aura; both hands fire, a second row, a second burst). Defeat: she goes steady Grapefruit, sinks exhausted, pulls a grey blanket over her head,
a small pop and the blanket falls empty, the cell door swings shut ("Going home." is optional). Place: second-hardest; about 5 and a half minutes; the escalation is the phase-2 aura and doubled moves, not new moves.
Risk to watch: her laser follows One's EYE LASERS in the order (section 2.5).

**9. 2,763 (3,000, the finale and the surprise).** The four-coloured Algebralien (a rose 2, cyan 7, lavender 6, yellow 3; ten eyes, six black arms), shown as "?" until its fight begins. Arena: The Void (violet to ember, lit from below by lava, the
Division Symbol as a refuge that rises with the tide). SIGNATURE, THE DRAIN: inside about 220 px of it fighters cannot use specials (their power is drained), and what it drains becomes the lights that orbit it, which LIGHTS later throws; standing
close buys you melee range and costs you your specials and a thicker spiral. Moves: SLAM (black hands fall on shadows, 2/4/6 by band), WINDMILL (six arms turning, a slow turn is the warning), LIGHTS (a spiral of the drained lights, one colour per boss you
beat), CAGE (a barred cage drops on the farthest fighter and stays as a wall), FLOOD (phase 2: the lava rises over the floor, the Division Symbols rise as refuge, and the first tide leaves a DRY ISLAND centred on the boss so that nobody can outrun it).
Phases: calm; then the final phase in two bands (a smaller island, a double tide, six hands). Intro: ten eyes open in the dark one by one, a soft flash, the sign "2763". Defeat: its arms go limp, a shadow grows from above, the giant Zero's foot comes down (reusing the
foot from boss 5), the numerals pop out, the eight lights fly home. Place: the finale where the stage itself fights; about 6 minutes; gaps are longer and hits 0.6-0.9 of a boss hit because 3,000 HP at Four's hit rate would burn more than the 6 stocks. The target
for a good human is about 3 of 6 stocks lost.

---

## 2. The difficulty curve, checked

### 2.1 The climb

HP: 1,000, 1,200, 1,400, 1,600, 1,800, 2,100, 2,400, 2,700, 3,000: steps of +200 (four times) then +300 (four times); every boss is 1.11-1.20x the one before (1.20, 1.17, 1.14, 1.13, 1.17, 1.14, 1.13, 1.11). Monotonic and smooth: sensible. The "all but one" exception the owner mentioned
is not identifiable from the values (the only boss with a known standalone number is One, 2,000, trimmed from 2,400 on 2026-10-06): question 8.

### 2.2 How long it is (a number to give the owner plainly)

Measured: solo bots deal 6.5-9.0 HP/s to bosses (`scripts/boss-rush-balance.json`); the owner's own One brief is 4.2-8.3 HP/s. Used only to estimate length, never to tune difficulty.

| Boss | HP | 6 HP/s | 8 HP/s | 10 HP/s |
|---|---|---|---|---|
| Two | 1,000 | 2:47 | 2:05 | 1:40 |
| Four | 1,200 | 3:20 | 2:30 | 2:00 |
| Nine | 1,400 | 3:53 | 2:55 | 2:20 |
| Six (with 240 of bubble) | 1,840 | 5:07 | 3:50 | 3:04 |
| Zero | 1,800 | 5:00 | 3:45 | 3:00 |
| X | 2,100 | 5:50 | 4:22 | 3:30 |
| One | 2,400 | 6:40 | 5:00 | 4:00 |
| Three | 2,700 | 7:30 | 5:37 | 4:30 |
| 2,763 | 3,000 | 8:20 | 6:15 | 5:00 |
| Fighting | 17,440 | 48:27 | 36:20 | 29:04 |

Add about 1.5 minutes of walk-ins, exit scenes and interludes. A clean clear is about 30-50 minutes (about 37 in the middle); a first clear with retries is over an hour; X onward is 59% of the HP; a larger stage costs damage
time, so lean to the slow column. The exposed windows (Nine +50%, X x1.5) shave about a tenth. One at 2,400 sits at the top of the owner's own "4-8 minutes for 2,000". The mitigation is one number, `ALG_RUSH.dmgToBoss` (default 1.0), read at one
place in the shared hit pipeline (section 7) and in `oneTakeDamage`: bars keep reading 1k-3k and every fight is shorter by that factor.

### 2.3 Kit size, pace and hits

- Moves: Two 5, Four 5, Nine 5 (+ the bike form), Six 5, Zero 5, X 6, One 13, Three 5, 2,763 5. The size to beat is the overhaul's five. The complexity spike at One is the owner's order, not a flaw: Three and 2,763 therefore climb by
  phase (Three's second phase wears One's aura and doubles her moves; 2,763's stage changes: the island, the double tide) rather than by number of moves.
- Gap between turns (frames before the engine's x1.2 pace), phase 1/2/3: Two 140/110/95 (existing), Four 104/78/56 (existing), Nine 80/66/54, Six 170/130 (the designer wrote 200/150, which is nearly twice Zero's pace: lowered), Zero 100/76/58,
  X 110/84, Three 96/68, 2,763 120/96/70. Starting values; the owner tunes by feel with two free knobs per boss, `dmgMult` (already in `bossDmg()`) and `gapMult` (new, default 1). NEVER tuned to a bot (owner rule).
- Hits: every move is written at 1.0 of a boss hit (22%) or less. The engine caps a fighter's damage per attack id at `bossDmg()` unless a shot carries `bossCap`, so the designers' 1.1 (Nine's bike and boot, Six's rock) and 1.2 (Six's kick) would have been
  silently clamped; they are now written at 1.0. One turn costs at most 22% ("Harder, same damage").
- Stocks: 4 at the start, +2 per boss (cap 6), every boss met at 0%. A flawless run has 6 from the second boss on. Feel target (by playing, not by bots): a good player loses about 0-1 stocks a boss through Zero, about 1-2 for X, One and Three, about 3 on 2,763.

### 2.4 Signature mechanics: all distinct

Two: copies your last special. Four: the ring and the room. Nine: dodge a commit, the boss is exposed. Six: pop the shield. Zero: interrupt the call. X: find him among the baskets. One: her quarter-lines and her inherited kit. Three: read the colour. 2,763: the aura that silences specials.
"A window opens" appears for four bosses (Nine, Six, Zero, X), but each is opened by a different player action; the window itself is ONE shared state (section 7) so it looks and pays the same.

### 2.5 Collisions found between the designs, and the rulings

| Collision | Where | Ruling |
|---|---|---|
| Drop on a locked shadow, throw two low waves each way, stand stuck | Nine BOOYAH!, X ROCKET DIVE!, and the Two/Four options CRATER LANDING, SO BIG, HEAD THEM OFF | X owns it. Nine's BOOYAH! drops its landing waves (the landing circle and the stuck-landing window stay). Two and Four do not pick CRATER LANDING or SO BIG. |
| Lava | 2,763 (tide, island), Zero's optional edge hazard, Nine's defeat glow, Two's LAVA SPIN option | Lava is 2,763's. Zero's hazard is cut (the seep stays as scenery); Nine's glow stays as the one-frame seed; LAVA SPIN is not in the recommended five (it is the first boss and the story is "the lava creeps in during Nine and Zero, then 2,763 owns it"). X's embers are fire on a body, not lava. |
| "Drain" | Two's and One's POWER DRAIN (damage and heal at the end of a move) vs 2,763's aura that silences specials | Different mechanics, a coherent story (One drained their powers; 2,763 drains them all). Keep; 2,763's aura never heals. |
| Three "rain" moves in a row | Six ROCK DROP (4), Zero TAPE TOSS (5), X BASKET RAIN (6) | Keep as designed (each leaves something different: rubble, a tape that lies 20 frames, a basket that becomes a step). Pre-agreed swap if the owner's playthrough finds them samey: Zero's tapes become a flat spinning throw at three heights. |
| Beams in adjacent bosses | One EYE LASERS (7), Three HALLWAY LASER (8) | Keep (it is Three's canon move); hers is a row-locked beam from the hands, One's are eye bursts and a sweep. Cut candidate if it reads the same. |
| Boss relocates to stay near you | pops (Two, Six, X), puddle (Four), pipes (Zero), skates (Nine), glide (Three, 2,763) | ONE shared leash (section 8), a different visual per boss. |
| Window/stun rewards | Nine, Six, Zero, X (and Three's dash bonk) | ONE shared exposed state and hit pipeline (section 7). |
| Reused places | Three reuses Four's Fourest backdrop and floor | Allowed (canon: the same pocket dimension, one door down); fallback for a short build is the existing `fourest` arena as it is. |
| Designed words and signs | Nine BOOYAH!, Six "Yay.", Zero's sign, X's button, Three "Going home.", 2,763's digits | The house rule allows them occasionally: at most one per boss, only at an intro or an ending. Default keeps Six, Zero, Three, 2,763; drops Nine's burst and X's button. |

---

## 3. The event shell

Kind: a SPECIAL EVENT (fighter-less, calendar windows of 1-3 days), a sibling of the weekly lap. The lap, `PROFILE.event` and the fighter event page are not touched, so a live save keeps every token. Reasons: the lap is fighter-shaped
(`eventOfWeek` returns a name; tokens per fighter; `eventNorm` deletes any pay line that is not `w<week>:<name>:f1-f3`), a rush has no fighter, no unlock and no week. Name in the UI: "Algebralien Rush" (the old mode is already "Boss Rush").

Reused as it is: `shopNow()` and `SHOP_CLOCK`, `shopWeekNo`, `eventEndsWords`, `eventEl` and the `ev*` styles, the `.titlecards` row, the `go(id)` page pattern with Esc/Back, `EVENT_PICK` + `syncEventSelect` + the `evmode` class, `EVENT_LOAN`/`returnEventLoan`,
`showEventNote`, the `RACE.retry` trick, `saveProfile`/`mergeProfiles`/`shopCatchUp`, `makeBossSummon`, `bossEndingBegin`, `startOneFight(lineup,{onEnd})`, `walletEarn`, price-0 `wallet.owned` entries.
Not shared on purpose: `awardBossCleared` (it hands out the `boss:Four` trophy and writes `bossesCleared`, `soloBosses`, `oneRushKill`, `cobsBossFell`), the Four-falls branch of `bossRushCheck`, `BOSSRUSH.loop`, every One-chain function (`oneAfterMatch`, `awardOneDefeated`, `oneFightEnded`).
Rush bosses count for quests only (`questAdd('boss',1)`).

Screens (everything is a button; Esc goes back; no boss count is printed anywhere):
- Title: on live days only, a third card in the `.titlecards` row beside the Daily and the weekly event: "ALGEBRALIEN RUSH", the slot strip (seen bosses as small renders, unseen as dark "?"), "Live now - ends in 2 days", "Rush". Off days: nothing on the title; one quiet line at the foot of the weekly event page, "Algebralien Rush - next live Sun 22 Nov".
- Page `#rush`: the title; status ("Live now - ends in 14 hours" or "Next live: Sun 22 Nov, 00:00 UTC (Sat 21 Nov, 7:00 PM your time)"); a blurb ("Algebraliens are living numbers and letters from the Math Planet, and today they are lined up to fight you."); the strip; the rules in one sentence
  ("You alone, one fighter. Start with 4 stocks; each boss you beat gives 2 back, up to 6. Lose them all and you retry that boss. Each boss pays Win Tokens the first time in a window; a full clear pays more, up to 150 a window."); your records ("Your best: 6 bosses - fastest clear 38:40 - cleared twice");
  Play (disabled off days, with the next-live line); Back.
- Select screen: `EVENT_PICK={rush:true}`; the strip "Algebralien Rush - you alone - 4 stocks, +2 after each boss (max 6) - items on"; the CPU-skill row hidden; any fighter you own, One's bans through `oneCoercePick`.
- In the match: the boss bar stays; "cleared N" becomes nine pips drawn as shapes; no move names, no lines.
- Interlude (about 3 s, skippable after 1 s, grows in over 12 frames, drawn not printed): the next boss's own body (`drawBossSprite`, so a code-drawn body such as 2,763's works, not only a PNG) on a chalkboard, the strip under it (beaten filled, next ringed, unseen a dark "?"), your stocks as dots.
- Results: victory "Rush cleared" with the run time, the records line and the pay note in `#eventNote`, buttons Share / Rush / Menu; defeat as in section 6.

Secrets: One's slot is dropped from the list unless `oneUnlocked()` (nothing names her before her chain does); a player without her gets an eight-boss run that grows a boss the day they beat her. 2,763 is a dark silhouette and "?" on the strip, title card, interlude and page until `PROFILE.rush.seen`
(a union-merged set of boss ids, written when its fight begins) holds it; the engine's boss card says "???" until the sign in its intro. The changelog line and blurb say "Algebralien Rush" and nothing else.

Switches (beside the date code, the `MCAVE_DEV`/`MCAVE_OPEN` pattern): `RUSH_OPEN` (false until the owner flips it: with it false there is no title card, no page link, no off-day line) and `RUSH_DEV` (force live and a `algJump(boss, phase)` console jump so the owner can preview any boss the day it lands). The release is the owner's call only (Moon Caves was released at M1 by mistake once).

---

## 4. The live-day rule (UTC), proved

It depends only on the month length L. A weekday with five occurrences has its first on day d0 <= L-28, so its 4th is d0+21 and its 5th d0+28. Live = every day 29..L, plus every day 22..L-7.

```js
function daysInMonthUTC(y, m){ return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }   // m is 0-11
function rushWindowOf(d){                    // the live window holding this UTC date, or null
  const y = d.getUTCFullYear(), m = d.getUTCMonth(), D = d.getUTCDate(), L = daysInMonthUTC(y, m);
  if(D >= 29) return { y, m, first:29, last:L };                    // the 5th occurrence of its weekday
  if(D >= 22 && D <= L - 7) return { y, m, first:22, last:L - 7 };  // the 4th, of a weekday that has a 5th
  return null;
}
function isRushLive(d){ return rushWindowOf(d) !== null; }          // d = shopNow(), so SHOP_CLOCK stands on any date
function rushKey(w){ return Math.floor((Math.floor(Date.UTC(w.y, w.m, w.first)/86400000) + 3)/7); }   // distinct and rising: the pay ledger's key
// rushNext(now): scan up to 60 days from today's UTC date for the first window; returns { live, startMs, endMs, key }
```

| Month length | Live days | Count |
|---|---|---|
| 31 | 22-24 and 29-31 | 6 |
| 30 | 22-23 and 29-30 | 4 |
| 29 (leap Feb) | 22 and 29 | 2 (two one-day windows) |
| 28 (Feb) | none | 0 |

Proof (run twice more by me, under TZ=Asia/Tokyo and America/Los_Angeles, script `scratchpad\alg-rush\spec\date-check.js`): every day from 1970-01-01 to 2400-12-31 (157,420 days, 2000/2100/2200/2300/2400 included) agrees with a literal "count the weekday's
occurrences and take the last two when there are five" check: 0 disagreements. Live days a year: 58 (2026, 2027, 2029, 2030), 60 (2028).

Twelve test dates (all UTC; rule and literal check agree, 12 of 12): 2026-10-21 23:59:59 off | 2026-10-22 00:00:00 LIVE | 2026-10-31 23:59:59 LIVE | 2026-11-01 00:00:00 off | 2026-11-23 23:59:59 LIVE | 2026-11-24 00:00:00 off | 2026-11-30 23:59:59 LIVE |
2027-02-22 12:00:00 off | 2027-02-28 23:59:59 off | 2028-02-22 12:00:00 LIVE | 2028-02-23 12:00:00 off | 2028-02-29 23:59:59 LIVE.

Windows from today: 22-23 Nov 2026 | 29-30 Nov | 22-24 Dec | 29-31 Dec | 22-24 Jan 2027 | 29-31 Jan | (49 days off, a common-year February) | 22-24 Mar | 29-31 Mar | 22-23 Apr | 29-30 Apr. Gaps: 4-6 days inside a month, 21 to the next month, 49 over February.

A run in progress at 23:59:59: the window only gates STARTING (Play, Start over). Nothing reads it mid-run; a run that began live finishes and pays under the window it started in (`run.key`), the events' own rule. Leaving the rush ends the run, so there is nothing to abuse. Local time: windows are UTC days; the first one opens at
7:00 PM EST / 4:00 PM PST on 21 Nov, so the page prints both "Live now, ends in N hours" and "Next live ... (your time: ...)" through `toLocaleString`. A computer with a wrong clock sees other days, exactly as the weekly event does.

---

## 5. The flow of a run

1. Title card or event-page line, Play, select screen (pick a fighter), Play. Refused in a room (`inNetSession`) and off a live day (unless `RUSH_DEV`).
2. The conductor `startAlgRush` lends the settings (`EVENT_LOAN`), builds the list (`algRushList()`: nine rows, One dropped unless unlocked), starts run `{key, list, i, entry:4, secs:[], continues, fighter}` and calls `algRushBegin(0)`.
3. Each boss is its own match: `algRushBegin(i)` restores One's world if needed, then `beginMatchNow()` spawns the rush boss on the big stage (`BOSSRUSH={active:true, alg:true, bossIdx:<row>, dmgMult:1}`), or `startOneFight([you],{stocks, hp, onEnd})` for One.
   The player has `entry` stocks and 0%. The boss's intro scene plays (untouchable), the engine's boss card, the fight.
4. A boss falls: its ending scene plays and the conductor waits for its hold (`holdMs`); the token pay lands (section 7); `entry = min(6, stocksLeft + 2)`; the profile saves ("at the deed, not at the end"); the interlude card; `algRushBegin(i+1)`.
5. After the last boss: "Rush cleared", the run time (the sum of the fights on the winning path; a retried boss counts once), records, the pay note, Share / Rush / Menu.
6. Out of stocks: after the existing 800 ms beat, the result screen says "Defeated" and one line ("Zero was the fifth. Retry it with 5 stocks."), with the Rematch button relabelled "Retry boss" and a "Rush" button. Retry starts that boss again with the stocks you walked in with; R mid-fight is the same.
   Retries are counted (`run.continues`); a clean clear (zero continues) is a record of its own and nothing more.
7. Each boss is a fresh match, so nothing leaks between bosses (no projectile clean-up), a retry is just "begin boss i again", and One already works this way. Costs: the music and the run recording restart per boss (the replay is the last fight only) and a 1-2 s cut the interlude covers.
8. New bosses live in `ALG_ROSTER` (the same shape as `BOSS_ROSTER` rows) and NEVER in `BOSS_ROSTER`: that list is the 12-boss gauntlet, the item boss's roll, and the "all bosses beaten" count; adding to it would put six new bosses in the old rush and move Four from last.

---

## 6. Records and the save

`PROFILE.rush = { best, fast, clears, clean, seen:[ids], pay:{ 'k<windowKey>:<bossId>': tokens } }`, merged upward only (max, min, union) so two tabs never pay twice; one line each in `freshProfile`, `mergeProfiles`, `shopCatchUp`. It is NOT in `PROFILE.event`.
Pay lines are kept for this window and the one before. A bug here loses a payout, never a fighter (it touches no unlocked list). The shell milestone checks that an old profile without `PROFILE.rush` loads.

## 7. Rewards (small and capped)

Win Tokens through `walletEarn`, paid the moment a boss falls (no pushing), so they only ever "buy a look".

| What | Pays | Limit |
|---|---|---|
| A boss felled, the first time in a window | 10 | once per boss per window |
| A full clear (all of your bosses in one run, retries allowed) | +60 | once per window |
| Window cap | 150 | one cap per window; a nine-boss clear is exactly 150 (an eight-boss clear, without One, is 140) |
| First clear ever | two reward-only looks (a profile card and a title) as price-0 `wallet.owned` entries, never in the Store, wearable from the Wardrobe | once |
| Records | best, fastest, clears, clean clears | no tokens |

Scale: a daily quest pays 9-18, a weekly 36-72, One's reward was 500 once, a look costs 45-150. At most 150 a window and about 22 windows is about 3,300 a year against about 22,000 from quests. "Window" is the run of consecutive live days (1-3), not each day (question 7).
The looks must not name One or 2,763: for example the title "Top of the Class" (a pun on Four's classroom) and a card of drawn numerals on a night sky; art and names are the owner's pick.

---

## 8. The big stage, the camera and the leash (one kit, landed once)

The owner: the rush's stages are larger, and Two and Four "can just be outrun". The three Two/Four reports disagree on width (about 2.2 screens; 2,400; 3,000); everything else is written relative to the target in the game's 1,100 x 720 view. One decision for all:

- RUSH STAGE: 2,400 x 860 (2.2 screens), floor at 82% of the height, SOLID END WALLS and no pits (this is what lets "toward the middle" never mean "off the world", gives Zero's roll and Three's corner rule a wall to use, and ends Six's rake at a wall), a centre platform 393 px wide and 144 px up (Nine's GRIND! needs 360+),
  two ledges 200 px wide and 144 px up at 20% and 80%. Each arena overrides platforms where its design needs to (X's pyramid; Six's branch and roof ledges). One keeps her teams map.
- CAMERA: the existing big-stage path (CAM_ZOOM 0.72, about 1,528 px of world on screen) must frame the boss AND the nearest fighter, not just the fighter. The old rule that Boss Rush stays one screen because "tells are unreadable behind a panning camera" is answered by the leash.
- LEASH: at the start of every turn (and after any gap longer than about 90 frames), a boss farther than 650 px from the nearest living fighter relocates to 300-500 px from them on the side with more room, using its own visual (pop ring for Two, Six, X; puddle and slither for Four; pipes for Zero; skates for Nine, whose own cruise rule already does it; a fast glide for Three and 2,763).
  650 px is inside the half-view (764 px), so the boss is on screen when a tell starts. One's own rule (1,000 px, hold 30, cooldown 180) is the proof that this plays well.
- LOCAL WINDOW (Two and Four only, because their moves anchor on the world's middle and edges): a window the width of the camera's view centred on you when a turn begins, held for the turn; every `0`, `WW`, `WW*0.5` anchor reads `aL()`, `aR()`, `aM()`. About 30 sites in Two, 20 in Four.
- THE GUARANTEE every rush boss must meet (the check is "hold run away for 60 s and take hits"): each move is placed on you at its lock (a shadow, a rift, a lock), or leads your run, or moves faster than 9 px a frame, or is leashed. Nothing in the rush is answered by running.

## 9. Shared boss hooks (all in the kit, so lanes never edit the same engine line)

1. `bossPaced(s)` also reads `ALG_ROSTER`, so the picker, the one-attack watch, `BOSS_PACE` and `BOSS_TEL_PACE` apply to the new rows.
2. The move-name banner `banner(bossTelName(s),700,'boss')` is skipped when the name is empty or `BOSSRUSH.alg` (the house rule: no move-name popups; the live 12-boss rush still shows them, question 12).
3. HP is set at spawn from the curve through `makeBossSummon(row, hp)`; `BOSS_HP_MULT` (1.5) and the per-ally scaling are bypassed (solo only).
4. A per-boss phase-cut table: default 66%/33%; Six, X and Three cut once at 50% (a two-phase boss never shows a "PHASE 3" card); Nine, Zero, 2,763 keep the engine's three (2,763's two designed phases are three bands). About 6 lines at the one place the engine reads 0.66/0.33.
5. ONE hit pipeline `algBossHit(s, f, dmg)` called at the two places that lower a roster boss's HP (the boss branch of `damageSummon` beside `twoUngroundedBlocks`, and the shot-hits-boss branch; every other `hp -=` is One's, Cobs's, the Smash Ball's or a kit object's): in order, `dmgToBoss`, the exposed
   multiplier (`s._xposeT`, `s._xposeMult`: Nine's +50%, X's x1.5 found and x1.25 burning), then a per-boss filter table (`ALG_HIT[attack]`: Six's bubble absorbs here). Boss milestones plug in and never edit `damageSummon`.
6. Defaults for the leash relocation (a pop), plus `algExpose(s, frames, mult)`, the shared "exposed" look hook, and `algDrawFoot` (the Giant's foot, written in Zero's milestone, reused by 2,763).
7. Everything a boss draws is a pure function of its `_hz` bag of plain numbers and the clock (the house habit). No `netshot`/`net` rows at launch because the rush is offline (question 5); this saves about 200 lines across the nine and keeps online possible later.
8. A dev jump `algJump(boss, phase)` under `RUSH_DEV`.

## 10. Rules every boss follows (the contract in each milestone brief)

Tells are the body's (pose, glow colour, beat count, a 14-frame gather, an 8-frame white flicker; Nine's is a glint on the glasses): no telegraph lines, rings, reticles or move names. The only world marks allowed are a real shadow under what falls, grit and dust, a glow at the source, a floor crack. Anything that appears grows in over 12 frames.
Falling things hit while they fall. One attack id per turn. No hit above 1.0 of a boss hit. No contact damage. No flash that strobes. Launches go up or toward the middle, never off the world. At most one designed word or sign, at an intro or ending only. Nothing makes a boss unhittable except a 20-frame phase beat and Two's existing grounding rule (the owner has already said that rule "makes him take way too long";
see the risks). Computer only. Never touch the live relay. Phase names are game text.

## 11. Two and Four: the rush versions (how, and the owner's picks)

Both are rebuilt behind `BOSSRUSH.alg` so the ordinary Boss Rush fights are byte for byte what the overhaul tuned (about 250-400 changed lines each, mostly the anchor swap): the local window and the leash (section 8), HP set at spawn (Two 1,000, Four 1,200; both already cut phases at 66/33 of `maxHp`, so any curve works),
and "buffs" that are wider or new attacks, never damage. Their exit scenes (Two 0.6 s, Four 1.7 s) and phase names are unchanged. The owner picks five attacks for each from `attack-options-two.md` and `attack-options-four.md`; the signature stays.

Recommended Two: SUN HUNT, TOWER ROW, CLAP FULL SPAN, DOUBLE TAKE (his signature), HI GUYS!. Not LAVA SPIN (the lava story), not CRATER LANDING (X's dive shape), MOON HAIL is the safe swap.
Recommended Four: THE LONG NOTE (his signature), ZAPPIES! BLUE MARK AHEAD, THE CACTUS DRIVE, FIVE PAIRS OF ARMS, SOUP'S ON!. Not SO BIG or HEAD THEM OFF (the landing/stuck shape and Two's pop-and-punch); THE RIPPLE is the safe swap.
Two's phase 3 (immune until a fighter stays within about 225 px for 30 frames) is 330 HP of his 1,000 and the one rule the owner has called too slow: keep the look, and decide after the owner feels him at the first gate whether the rush version keeps the immunity.

## 12. Canon (read 2026-11-02; details in each boss file)

All nine are Algebraliens on the BFDI wiki (confirmed by me from the species lines). Nothing about any of them as a FIGHT is canon: every attack is a canon event, ability or prop turned into a move, flagged as game text in each file. Pronouns, for internal text only (no boss prints text): Nine they/them, Six she/her, Zero he/him, X they/them (genderless),
Three she/her, 2,763 it/its (he/him in later material), Two and Four as the game already has them.

Could not confirm, and the proposal:
- X: exists (X Variable, the BFB host; a letter, not a number, which the 2,763 page uses to say X outranks it). No canon fight, no scene with Zero, Six, Nine or 2,763. The II wiki's "X" is MePhoneX, a different character, not used. PROPOSAL: use the BFB/TPOT X; build from baskets, the snap, the flames and the 500-step platform; never call X a number.
- 2,763: exists (page "Two Thousand Seven Hundred Sixty-Three", Jackie Skinner, villain of the Feb 2025 and Sep 2026 subscriber specials; the first special carries the wiki's non-canon-content template, and the wiki's trivia, marked citation needed, ranks X and One above it). No stats, attack names or official boss description exist.
  PROPOSAL: the finale is a GAME choice, not a canon claim; never print "strongest" (the tape says "The Most Powerful Number"); a code-drawn body (a flat render cannot sprout arms); "?" until its fight begins.
- Nine: no fight canon; the poses were classified by file name and pixels because the agents' browser pane would not paint; the Skateboard planet page, the BFDI Mouth transcript, Mini Resort and the BFB episodes were not read. GRIND! and the wipeout windows are inventions; the motorcycle explosion and the drop tower are canon gags.
- Six: the wiki flags her page as incomplete; "energy blast" is list-only (not seen in a transcript); KICK OUT! (the Stone-O-Boot and kicking Seven) comes from subscriber specials the wiki marks non-canon; her three renders are unviewed.
- Zero: no fight canon (only the Giant's stomp, the TV throw and the coffee); the "assimilation" and "power enlightenment" abilities are editors' derivations and are not used; the wiki contradicts itself on One (enemy vs good terms), so they are not made foes; "The Best Day of Zero's Life" is an alternate title in a description.
- Three: the decimals and their colours are canon, the decimal-to-move mapping is ours; the four decimal renders are wide and may not be cut-outs (unchecked); no Three-2,763 relationship found (the order is only a wink).
- One, Two, Four: existing bosses, as built; the rush versions are design.
- The wiki is current to mid-2026 TPOT, so the Three file spoils TPOT 20-25.

## 13. Art

New wiki renders to fetch through `scripts/fetch-sprites.mjs` with `CREDITS.md` rows (the unaffiliated-fan-work wording): Nine 9 renders + 2 props (the loose board is a prop, the sunglasses), Six 3, X 3 (+1 optional), Three 3 (+ the four decimal looks as an optional upgrade over a tint). Zero and 2,763 are code-drawn (Zero has 5 optional renders; 2,763 none). Every render must be looked at by eye before it is kept (the lead does it in the browser pane;
the design agents could not). Everything else is code: Nine's bike, boot, tower, tree and ramps; Six's bubble, rake, arm and boot; Zero's props; X's baskets and flames; Three's armour and orbs; 2,763's whole body.

---

## 14. Size and milestones

Method for every milestone (the owner's rules): one cheap agent per task; a nested worktree off current `main` after `git fetch origin` and a read of `docs/LEDGER.md` (the owner also works in cloud sessions); `index.html` is CRLF so Python load/save only (never Git Bash `sed -i`); no node_modules links, never `npx`; processes at BelowNormal; NO tests (the suite is deleted): build, check it boots,
play the thing, show the owner a picture from the lead's browser pane (no agent launches Edge); never connect to the live relay (every brief says so); ship by PR, the owner OKs each push; each boss edits only inside its own `@boss:<key>:` marker pairs; merged worktrees are removed and `git gc` run (OneDrive quota). Everything stays hidden behind `RUSH_OPEN`.

| # | Milestone | Lines | Check | Needs |
|---|---|---|---|---|
| M0 | Owner answers the questions; the lead fetches and LOOKS at the ~20 renders | 0 | the renders are cut-outs on transparent backgrounds and look like the characters | none |
| M1 | Shell A: the date rule, windows, `RUSH_OPEN`/`RUSH_DEV`, `PROFILE.rush` (fresh, merge, catch-up, pay ledger, records, the two looks), `#rush` page, title card (live days), select strip | 450 | boots with `RUSH_OPEN` false and the title and weekly page are unchanged; with `RUSH_DEV` the card and page show; the rule passes the 12 dates and the 157,420-day sweep; earning the same pay line twice pays once; an old profile loads | none |
| M2 | Shell B: the conductor with `ALG_ROSTER` (nine STUB rows, each in its own marker pair, on today's flat stage), hooks (`beginMatchNow`, `buildFighters`, `setupWorld`, `checkWin`, `bossRushCheck`, `go`, `startMatch`), interlude card, HUD pips, victory/defeat/Retry, `algRushList`, `seen`, `dmgToBoss`, `algJump` | 450 | play all nine stub fights: stocks 4 -> 6 -> capped, Retry works, leaving ends the run, a pay line writes once, One's slot is absent when she is not unlocked, 2,763 shows "?", NO `awardBossCleared`, trophy, `oneRushHook`; a normal 12-boss Boss Rush still starts and kills one boss | M1 |
| M3 | Big-stage + boss hooks kit (section 8-9): stage, camera framing boss and fighter, leash, `bossPaced`, banner guard, per-boss HP, phase-cut table, `algBossHit` + exposed, `gapMult`, `algDrawFoot` hook slot | 350 | the old Boss Rush is unchanged (the diff shows every hook guarded by the alg flag); on the 2,400 stage with stubs the camera keeps boss and fighter on screen, the leash relocates a boss at 650+ px, no NaN | M2 |
| M4 | Two, rush version (the owner's five; local window; leash; HP 1,000) | 350 | force each move once per phase (`_pickForce`); hold run away 60 s and take hits; the ordinary Two fight in Boss Rush is unchanged | M3 |
| M5 | Four, rush version (the owner's five; slither fix; HP 1,200) | 350 | same; no path reaches the Four-falls branch | M3 |
| G1 | OWNER FEEL CHECK on Two and Four (`algJump`): decides `dmgToBoss`, stage width, stock pace, Two's phase-3 immunity | 0 | the owner plays | M4, M5 |
| M6 | Nine A: row, arena, body, intro, ending, TUBULAR! (board), CLEANUP CREW!, exposure | 500 | force each move once; a dodged run opens the window and damage reads x1.5 | M3 |
| M7 | Nine B: BOOYAH!, STONE-TO-BOOT!, GRIND!, the bike form, acts and beats | 450 | all five moves once per act; the act beat waits for an idle; GRIND! drops out if no 360 px platform | M6 |
| M8 | Six (the whole boss) | 830 | bubble pops, daze, second bubble at 50%; each move once per phase; ending plays | M3 |
| M9 | Zero A: row, arena (3 looks), body, intro, ROLL CALL! with the fizzle, TAPE TOSS!, DIVIDE BY ZERO! | 500 | an 18-HP hit during the call cancels it; the line is hoppable | M3 |
| M10 | Zero B: STOP LAUGHING AT ME!, phase beats, the Giant, THE FOOT!, ending, `algDrawFoot` | 350 | three phases play; the Giant splits and marches off | M9 |
| M11 | X A: row, arena (`x500`, `x500sun`), body, intro, BASKET RAIN!, SNAP!, ROCKET DIVE!, the 50% cut and beat | 650 | each move once; the phase beat swaps the sky | M3 |
| M12 | X B: ARROW DASH!, BURNING!, HIDE AND SEEK!, ending | 600 | the shuffle ends found or timed out and X's radius is restored; no stuck state | M11 |
| M13 | One's rush options: `opts.hp`, `opts.stocks`, her own `onEnd`, per-boss phase line at the four `ONE_PHASE_HP` sites | 60 | her fight in the rush ends on the rush's screen and leaves her chain untouched; her ordinary fight is unchanged | M3 |
| M14 | Three (the whole boss) | 700 | each move once per phase; the shatter beat; the corner counter | M3 |
| M15 | 2,763 A: row, body, arena, intro, SLAM, WINDMILL, the drain, LIGHTS | 600 | the aura silences specials and the lights count up; ten eyes open in the dark | M3 |
| M16 | 2,763 B: FLOOD, Division Symbols, the island, CAGE, phase bands, ending | 500 | the first tide leaves an island; the foot ending plays | M15, M10 (or its own foot) |
| M17 | THE FULL RUSH and the release gate: nine in order, secrets sweep (grep "2763" and "One" in every title/strip/blurb/share/changelog string), One-chain guards, old-profile load, 12 date checks, a pacing pass by feel, a play of the whole run by the owner | 150 | the owner finishes a run; then the owner flips `RUSH_OPEN` | all |

Totals: full path about 7,850 lines (shell 900, kit 350, Two 350, Four 350, Nine 950, Six 830, Zero 850, X 1,250, One 60, Three 700, 2,763 1,100, final 150); lean path about 6,900 (Nine 750 without the bike, the platform lane and act-3 extras; Zero 600; X 1,000; Three 650; 2,763 900 without CAGE). Cut order if time is short:
X's ARROW DASH, third snap, second dive and ember patches; Nine's bike, then the second boot and the crew's return pass; 2,763's CAGE, then the lights gauge and the island's second shrink; Zero's pipe pops, dots, second foot and sign; Three's right-hand cell and the optional slabs. The signatures never get cut.

Schedule (UTC; 2 Nov is day 0; first live days 22-23 Nov). Lane A: M4, M5, M8, M14, M13 (about 2,290 lines). Lane B: M6, M7, M9, M10 (about 1,800). Lane C: M11, M12, M15, M16 (about 2,350). M1 Nov 2-4, M2 Nov 4-6, M3 Nov 6-8, then the three lanes Nov 8-19 (G1 about Nov 11), M17 Nov 18-21.
Go/no-go on Nov 18: if all nine are not in the checker's hands, the target becomes the 29-30 Nov window (flip on Nov 28); the next after that is 22 Dec. The owner flips on the evening of Nov 21 US time. Lanes need three agents at once; with two, plan for 29 Nov.

## 15. Risks

1. LENGTH (36 minutes of fighting, over an hour for a first clear) is the biggest design risk; the knob and the retry soften it, not remove it. 2. The calendar: 7,850 lines in 20 days. 3. A larger stage against the old one-screen rule: the camera and leash are new and must be proven in M3 before any boss builds. 4. Two and Four rewritten behind a flag: a leak into the ordinary Boss Rush
changes fights the owner already tuned (diff review in M3, M4, M5). 5. Secret leaks (One, 2,763) across about eight strings. 6. A new save branch (a lost payout, never a lost fighter). 7. The One chain must not be counted or unlocked by the rush (one-line guards, the first thing checked). 8. Live days nobody can see: windows are UTC and 1-3 days; `RUSH_DEV` and the local-time words are the answer.
9. The worktree moves (ii-dlc took merges while the reports were written): every cite is by name. 10. Art risk: about 20 renders unviewed. 11. Per-match restarts: music and recording restart and the replay is the last fight. 12. Two's grounding rule (330 HP of an immune phase) and Three's and Six's "window" pacing may add a minute each. 13. No tests: every check is a play.

## 16. Questions for the owner (recommendation first)

Fourteen questions, the first eight are needed before M1-M3 can finish; the rest are needed before the boss they name. Recommendation first in each.

1. RUN LENGTH (a clean clear is about 36 minutes of fighting, 29-48; over an hour with retries). (a) Recommended: build the damage-to-boss knob at 1.0, you feel Two and Four at the first gate and the number is set then. (b) Start the knob at 1.25 (fights about a fifth shorter, a clean clear about 29 minutes). (c) No knob, accept 36-48 minutes.
2. STAGE SIZE. (a) Recommended: one common stage 2,400 wide (2.2 screens) with solid end walls and the leash for all eight bosses (One keeps her own map). (b) 3,000 wide (Four's report: more run room, more camera work). (c) 1,800 wide (cheaper, less run-away room).
3. A DEFEAT. (a) Recommended: retry that boss with the stocks you walked in with, unlimited and counted; a clean clear is a record. (b) The run ends and you start over from Two. (c) Three retries a run, then it ends.
4. ONE BEFORE HER CHAIN. (a) Recommended: her slot is skipped until the player has beaten her (eight bosses that grows to nine). (b) Everyone fights her in the rush (it names her and fights her before her Moon scene).
5. ONLINE. (a) Recommended: offline and solo at launch. (b) Online later (One skipped in rooms); the bosses already draw from plain state so it stays possible. (c) Online at launch with eight bosses (about +250 lines, tested with a local guest only; the live relay is never touched).
6. RELEASE. (a) Recommended: a hidden build; you flip `RUSH_OPEN` after your own playthrough; go/no-go on 18 Nov; the fallback is the 29-30 Nov window. (b) Open automatically on 22 Nov if the checks pass. (c) Aim at 22 Dec (a calm month, more time).
7. REWARDS. (a) Recommended: 10 Win Tokens per boss the first time in a window, +60 for a clear, 150 cap per window (a run of live days), two reward-only looks on the first clear. (b) The same, but the cap is per live day (a 3-day window can pay 3 times). (c) Looks only, no tokens. (d) Bigger numbers (name them).
8. THE HP EXCEPTION AND ONE'S 2,400. The live game trimmed One from 2,400 to 2,000 on 2026-10-06 ("abt 4-8 mins"). (a) Recommended: all nine as you gave them, One 2,400 in the rush (her normal fight stays 2,000). (b) One keeps 2,000 in the rush (she is the exception). (c) A different boss is the exception (name it).
9. TWO'S FIVE (the owner picks). (a) Recommended: SUN HUNT, TOWER ROW, CLAP FULL SPAN, DOUBLE TAKE (his signature), HI GUYS!; the old list is replaced. (b) The same five plus THE POWER OF TWO! kept as a sixth. (c) Swap HI GUYS! for MOON HAIL. (d) Pick your own five of the eight (LAVA SPIN would break the lava story; CRATER LANDING repeats X's dive).
10. FOUR'S FIVE (the owner picks). (a) Recommended: THE LONG NOTE (his signature), ZAPPIES! BLUE MARK AHEAD, THE CACTUS DRIVE, FIVE PAIRS OF ARMS, SOUP'S ON!. (b) The report's five: THE LONG NOTE, ZAPPIES! BLUE MARK AHEAD, FIVE PAIRS OF ARMS, HEAD THEM OFF, SOUP'S ON!. (c) Swap the cactus for THE RIPPLE. (d) Pick your own.
11. TWO-PHASE BOSSES. (a) Recommended: a per-boss phase cut: Six, X and Three cut once at 50% (about 6 engine lines, no stray "PHASE 3" card), the rest keep 66/33. (b) Keep the engine's 66/33 for every boss (their designed second phase then spans two tiers).
12. MOVE-NAME POPUPS (the live 12-boss rush shows a yellow move name at every wind-up today, against your rule). (a) Recommended: off for every rush boss, Two and Four included. (b) Off in the rush and in the live Boss Rush too. (c) Keep them.
13. ART. (a) Recommended: fetch about 20 wiki renders (Nine 11, Six 3, X 3, Three 3), the lead looks at each before it ships; Zero and 2,763 are code-drawn. (b) Code-drawn only (no downloads, plainer bosses). (c) Also fetch Zero's five optional renders.
14. 2,763'S DRAIN (it also silences an up-special recovery near it). (a) Recommended: specials are silenced inside about 220 px of it. (b) Slow instead of silence (same lights). (c) Silence only on the ground.

Defaults applied unless the owner says otherwise: items on at the usual rate (Smash Balls never appear in a boss fight); Six's bubbles on top of her 1,600; Nine's exposure +50% and the bike form kept, the drop-tower defeat, phase names "Not Radical" and "Clobber Time"; Zero's megaphone fizzle at 18 HP, phase 3 in his own destroyed bunker, no lava hazard; X's bounty 2.5%, the baskets carry him off, the 500-step arena; Three backs away and wears One's aura in phase 2; 2,763 in "?" with its "2763" digit sign, a code-drawn body, the giant Zero's foot ending, CAGE kept
(first cut); UI name "Algebralien Rush"; no `netshot`/`net` rows; the rush is solo with any owned fighter.

## 17. Sources

The nine files in this folder (their canon sections cite the wiki pages they read); the BFDI wiki pages Two, Four, Nine, Six, Zero, X, One, Three, Two Thousand Seven Hundred Sixty-Three, Algebraliens and the 2,763,000 special read by me as raw wikitext; `artifacts/V1/index.html` (names cited, never line numbers, because the file moved while the reports were written: BOSS_ROSTER, bossPaced, damageSummon, applyHit's `bossCap`, `bossDmg`, ONE_BOSS, ONE_PHASE_HP, ONE_DMG_MULT); `scripts/boss-rush-balance.json` (as quoted by the reports); my scratch script
`C:\Users\carad\AppData\Local\Temp\claude\C--Users-carad--claude\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\alg-rush\spec\date-check.js`.
