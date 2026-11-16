# ZERO -- Algebralien Boss Rush, boss 5 of 9 (design pass, 2026-11-02)

Read-only study of `ii-dlc` at a316e32 (`artifacts/V1/index.html`, 93,852 lines; line numbers below are for that commit and drift, so every
reference also names the function or table). Nothing in the game was edited. Canon below is from the Battle for Dream Island wiki
(battlefordreamisland.fandom.com), read as wikitext through the browser pane. Anything marked GAME TEXT / GAME DESIGN is mine, not canon.

## 0. One-screen summary

| | |
|---|---|
| Who | Zero, the "main Zero" and leader of the Zeroes: a gray, ring-shaped Algebralien in a blue-and-yellow cap. Anxious, bossy, easily embarrassed, with a megaphone that summons every Zero on the planet. |
| Place in the rush | 5th of 9, between Six and X. **Bar 1,800** (the owner's curve). Expect ~4 min for a bot, ~2.5-3.5 min for a good player. |
| Arena | **Zero's Bunker** (new, one key, three looks: dusty, lava seeping, destroyed and flooded). Not the Void. |
| Body | Smallest boss in the rush at the start (r 65), swells to **Giant Zero** (r 116) in phase 3. Code-drawn fallback exists; five wiki renders available (checked to exist, not yet looked at). |
| Attacks (5) | ROLL CALL! (the marching Zeroes) - TAPE TOSS! - DIVIDE BY ZERO! - STOP LAUGHING AT ME! (fridge breakout, phase 2) - THE FOOT! (phase 3) |
| Phases | 1 "Leader" (a coward who calls for backup) - 2 "Embarrassing Tapes" (squad laughs, he goes red and stops running) - 3 "All Zeroes, Combine!" (fusion, bunker torn open, Giant Zero) |
| Signature | **THE ZEROES: the horde and the fusion**, with one rule that is only his: **the megaphone can be made to fizzle.** Hit him hard during the call and the call fails; he is flustered and open. |
| Size | **Medium-large: ~850 lines full, ~600 lean.** No new art required; 5 optional wiki renders. |
| Biggest risk | Length: 1,800 HP is ~4x a roster boss, with five attacks. Tiers (section 4.6) and the interrupt are the answer; it is a rush-wide problem. |

## 1. Canon: what the wiki says

### 1.1 Pages read
BFDI wiki: `Zero`, `Zero/Relationships`, `Zeroes`, `Zero's Base` (and the redirect `Zero's Bunker`), `Equation Playground`,
`Thanks for 2,763,000 Subscribers!`, `Thanks for 3,517,000 Subscribers!` (the plot, credits and deaths), `Two Thousand Seven
Hundred Sixty-Three`, `X`, and the Zero lines of `Homeward Bound!`, `Nine`, `Six`, `Two`, `One`, `Three`. Inanimate Insanity wiki: a
search for "Zero Algebralien" and "Zeroes Four integer" returned nothing about him: **Zero is a BFDI-wiki character only.**

### 1.2 Who he is
- Species Integer (Algebralien), genderless, he/him, legal name "Zero Integer", voice Xander Archibald. Lavender Gray body #c7c7d0, Argent
  limbs #bfc1c0, Black outline. Cap: Dark Periwinkle #5661D5 with Blueberry #4C4A9E detail, brim and symbol Sandstorm #F4D53D. The cap
  carries Euler's identity (e to the i pi, plus 1, equals 0).
- The face is in the middle of the body, usually under the cap. Unlike the other numbers his limbs are a darker gray than his body.
- He is the leader of the five "subscriber" Zeroes (Zero 1 is him; Zeroes 2-5 look the same, with different voices and personalities:
  Zero 3 calm and flat and second in command, Zero 5 goofy, one cheerful, one whiny). There are also thousands of other Zeroes.
- First speaking Algebralien in the series' chronology (the flashback of "Alone"); first canonical appearance in TPOT "Alone"; minor
  antagonist in "Homeward Bound!", present in "All For One". Star of the two subscriber specials about 2763 (2.763M, and 3.517M, which the
  wiki dates September 28, 2026 and says is also titled "The Best Day of Zero's Life" in its description).
- Likes: Fifteen (a crush: the tape of him kissing a pillow), ice cream. Dislikes being made fun of. Turns pure red when extremely angry.

### 1.3 How he acts (personality, from the pages)
Controlling and bossy toward the other Zeroes, who tease him back; the wiki reads this as insecurity: the old VHS tapes show him failing
while the other four succeed. Easily embarrassed (he blushes on screen, one of the few characters who does). A coward when it counts:
hides under a desk, clings to 2763's arm to hide, runs from Fourteen and tries to flee the Negatives. Never means harm (apologises for
the scalding coffee, then smacks them anyway). Dances when nobody is looking. Calls himself worthless: literally nothing.

### 1.4 What he does and can do (episode events, then abilities)
Events I can build from (paraphrased; one wiki line used as a move name, marked below):
- The Zeroes fled with a box of tapes into the bunker (down tubes and a toilet) while he scolded them for a snack break; he **broadcast** a
  call to every Algebralien to come to his bunker.
- Played the tapes looking for the way to beat the Thing: mostly humiliations of him. The other Zeroes **locked him in the meat
  freezer** to watch the worst tape; he **counted down from three** to warn them, then **broke out in a pure red rage, roared and threw
  the TV over**.
- **Lava** rose into the bunker and burned his feet twice (the foot regenerates).
- 2763 took everyone but him, saying it had no use for him: he was nothing.
- 3.517M: flushed his hat down the toilet; grew a beard from beard serum in his coffee; Ten (a ghost) showed him that dividing 2763 by zero
  deletes it (a calculator vanishes); they chased the mythical **division symbol** (it shattered). A Zero wearing his hat pretended to be the leader
  and was crushed; he got the hat and the **megaphone** (it only works for the one in the hat) and ordered all Zeroes to combine. The
  five fused into a larger Zero; **thousands of Zeroes marched across the planet** (a news report calls it the Zeroes going crazy) and fused into
  a **Giant Zero**. 2763's beam did nothing: its powers only work on numbers, and he is nothing. He **raised a giant foot and
  stomped 2763, then 3517**. He split back into Zeroes, who walked off in a crowd. Fifteen slapped him: he owes her a new house.
- "Pie Vs Pi": a Zero took the **Division Symbol** and divided Pi away (the wiki says it is unclear this is the main Zero).

Abilities (the Zero page's list; several entries are the editors' own hypothetical reasoning, which I mark as thin):
Numerical Banishment (divided by zero, a number is destroyed: shown on screen); **Fusion** with other Zeroes (on screen);
**Summoning** by megaphone (on screen); Power/negation immunity and being "nothing" (on screen: 2763's laser fails); adrenaline boost / red
rage (on screen); regeneration (on screen); longevity (patient standing); **thin / speculative:** "assimilation" and "power
enlightenment" (the page derives them from the Donut-multiplies-Four event, never shown for Zero).

### 1.5 Relations to the other rush bosses
- **Two:** the Chronicle's page B4 article "Goiky By Zero Integer" is his; Two later congratulates him for saving everyone. Ten says Two can
  usually pull the division symbol out of thin air (their powers were drained that day). No fight canon.
- **Four:** his nickname for Zero is a little gray circle thing; Four greets him on 2763's arm and Zero shushes him because he is hiding; the wiki lists
  Four as a likely ally. The Zero page's assimilation idea comes from Four being multiplied by Donut ("Four Goes Too Far"), which is Donut, not Zero.
- **Nine:** answers Zero's bunker call from the drop tower (he called them "bro", so they feel they must come); Nine's page lists Zero as a likely ally and
  records "Bro" as their name for him; Zero's page does not list Nine.
- **Six:** Zero lets her into the bunker and shows her round; she thanks him after the stomp. Listed as a possible former ally.
- **X:** listed as a possible former ally on Zero's page (not on X's); X, Four and Five Hundred Sixty-Two are carried by 2763's hand past him.
- **One:** the infobox says enemy, the relationships page says "good terms" (Fourteen bumps him into her in "Alone" and she sees him bullied).
  The wiki contradicts itself; do not make one the other's foe.
- **Three:** good terms; protected him from Fourteen and sent him to Fifteen's cabin; the Zeroes watched her revive Fifteen.
- **2763:** enemy. 2763 dismisses him, and he kills it (stomped by the Giant Zero; the 2763 page calls the death debatable).

### 1.6 X and 2763 as characters (asked to say plainly)
Both exist on the wiki and both are characters. X is the yellow Latin-letter variable, Four's best friend, co-host of BFB, with a TPOT
role. 2763 (Two Thousand Seven Hundred Sixty-Three) is the antagonist of the two 2026 subscriber specials: a four-coloured Algebralien
(2 rose, 7 cyan, 6 lavender, 3 yellow) that drains power, floods the world with lava, grows at will, and is weak to Ten's guitar. Neither is
invented; the rush's author can read their own pages.

### 1.7 Not found / not canon
No page for how he "fights": he never fights on screen except stomping as the Giant, throwing the TV, and the coffee. Everything in section 3
that is an attack is a GAME DESIGN built from the events above. I did not find a Zero page on the Inanimate Insanity wiki. I could not
verify the wiki's art by eye (see 3.3).

### 1.8 The game's own "Zero" (asked: does it relate?)
No. There are two things named zero in the build and **neither is this character**: (1) Donut's finisher "Multiplied by Zero" (a hoop, and the
`zeroed` status: the foe's next hit does nothing, `fx6Zeroed`, `_zeroT`), and (2) Four's ending, where a Donut-tan ring called "the zero"
(`fourZero`, `drawFourEnd`) rolls over him. Both are the Donut gag ("Four Goes Too Far"). The name `ZERO` and prefix `zr` are free in the code. Do
not reuse the "zeroed" debuff for him; it belongs to Donut, and a second source would confuse the status icon.

## 2. The rules that bind this boss

### 2.1 The owner's rules for the rush (`owner-rules.md`, 2026-11-02)
Bar 1,800 for Zero. Start with 4 stocks, +2 per boss, max 6. **Stages are larger than the normal boss arenas, and attacks must cover them
("you can just outrun them in their current state")**: so nothing of Zero's can be answered by running away. Live days and order are the lead's.

### 2.2 House rules I design to
No telegraph lines or warning lines. No move-name popups (a designed sign or word is allowed now and then). Anything that appears grows in
over 12 frames. Falling traps hit while falling. Computer-only. Online means ONLINE (client draws from the snapshot); never touch the live relay.
Tells are the body's ("BOSS BODY TELLS", 2026-10-22: a count of beats, a pose, a glow, a white flicker in the last 8 frames; the few world tells
allowed are a real shadow under what falls, grit, a glow at the source, a crack). Harder in dodging, not in damage or speed. One attack at a
time. Zero has no contact damage (One has none since 2026-10-06; Evil Leafy still does). **Conflict to settle:** the shared engine line `banner(bossTelName(s), 700, 'boss')` at the end of
`updateBossAttack` still raises a 76 px yellow move name on every wind-up of every boss. The rush bosses must skip it (one `if`) or the rule is broken.

### 2.3 How a boss is built here (what I read)
A Boss Rush boss is a `BOSS_ROSTER` row plus a "slot" in ~30 tables: `BOSS_EXTRA`, `BOSS_PICK` (tags: close/far/ground/platform/air/wall/bunch/spread/
any, and `moves` by phase), `BOSS_MOVES`, `bossTelLen`, `bossAtkGapBase`, `onBossPhaseChange` / `bossPhaseName`, `BOSS_TELLS`, `BOSS_ENDINGS`,
`BOSS_ARENA_SKY / GROUND / HAZARD / ROOFED`, `drawArenaDecor`, `BOSS_SPRITE_SRC`, `drawBossSprite`, and (online) `netshot`/`net`. Shots are
`bossShot(...)` through `addProj` with one `++BOSS_ATK_ID` per move, so **a move is at most one hit on a fighter** (damage `bossDmg()` = 22%
now, doubled per loop). The compact model is Springy (~410 lines, no slot pairs); the large ones are 840-1,350 lines (Dragon 836, Evil Leafy 984,
Two 1,186, Four 1,353 across their slots, art included). The new boss will get its own `BOSS_PICK`, which `bossPaced()` only grants to rows of
`BOSS_ROSTER` (see risks).

## 3. The design

### 3.1 Place in the order and the bar
Rank 5 of 9 on the owner's curve: Six 1,600 | **Zero 1,800** | X 2,100. Phase edges at 66% and 33% of the bar (the engine's rule): 1,188 and 594.
Roster rows are ~340 at most and the engine multiplies a row by 1.5 and by (1 + 0.6 per extra fighter) at spawn: the rush needs the 1,800 to be
the final bar for one fighter (a row flag, or a row of 1,200 so the 1.5 lands on 1,800). **Length** (rates measured in `scripts/boss-rush-balance.json`: 6.5-9 HP/s, mean
7.6): Zero is ~237 s for the solo bot (200-280), about 80 s a phase; a good player maybe 150-210 s. The whole rush is 17,200 HP: ~38 minutes at
the bot's rate, 25-30 for a good player. A phase is ~14 turns of ~5.5 s, so each of his five moves is thrown about 9-14 times: the **tiers** in 4.6 exist
to keep that fresh.

### 3.2 The arena: Zero's Bunker (`zerobunker`)
Canon (Zero's Base page and the two plots): the bunker is underground and stocked (a bed, food, water, a TV set, power, a bucket, a garbage chute,
storage, a fridge) with a monitoring room; the AV room has a dusty TV with a cassette player and tapes littering the floor; the Zeroes drop in
through tubes and a toilet; lava floods the bunker; later it is destroyed and flooded, the world red.
Look (code-drawn, three states read from the boss's `_hz` bag: p2 and p3 frames, so a client draws it the same):
- State 1, dusty: dark concrete wall (#2a2f36 to #14181d), pipes and a garbage-chute mouth, a big CRT TV glowing blue-gray (static), shelves of VHS
  tapes and food crates, a cot, water jugs, a monitoring-room window with a dish silhouette, hanging bulbs. Floor: concrete slabs with tapes
  and a mug on them (a floor pattern, `BOSS_ARENA_GROUND`). **Pipe mouths** and **walk-in freezer doors** are repeated at a fixed pitch (pipes every
  ~600 px, freezers every ~700 px) so a bigger stage just has more of them.
- State 2 (phase 2): the TV plays a tape (a drawn pink heart over a pillow: no art needed), the shelf fills with four small Zeroes laughing, lava
  glow creeps in at the floor's ends and its seam cracks.
- State 3 (phase 3): the back wall is torn off; behind it a red world (Math Planet at night), flooded floor edges, and rows of tiny Zero silhouettes
  marching in from both horizons toward the middle (parallax, slow).
Add `zerobunker` to `BOSS_ARENA_ROOFED` (no drifting stage clouds in any state; state 3's red world paints its own sky and has none).
Why not the Void: it is 2763's own place (its pocket void dimension) and the owner's rule from the overhaul is that each boss has its own place; ask
before giving the Giant the Void (it is faithful, but then 2763 has to find another).
**Optional hazard (can be cut): LAVA AT THE ENDS** from phase 2: the outer 5% of each floor end bubbles and, from tier 3, bites for 0.4 of a
boss hit once per burst (`arenaHazardHit`, one id per burst, never within a second of a fighter's respawn); the Evil Leafy vine curtains are the
precedent. Cut if the rush stage has no floor ends to speak of.

### 3.3 The body
- **Look:** the show's render when present, the code-drawn body otherwise. Code body (a `case "zero"` in `drawBossSprite`, ~30 lines): a lavender-gray
  ring (outer r, inner r*0.62), the face in the middle (two eyes with pupils, a small mouth), Argent stick limbs, the cap with a Sandstorm brim. It also
  covers the render not loaded yet, as every other boss does.
- **Renders that exist on the wiki** (checked through the API: all present): `Tpot zero.png` 567x677 (with cap, TPOT), `Zero3517.png` 471x530 (with cap,
  the special's look), `Zero's leader.png` 1093x897 (no cap: the intro and the ending), `RedAngryZero.png` 1550x844 (the raging look, phase 2),
  `Big zero.png` 1840x1624 (five fused: the fusion beat), `Giant zero.png` 1657x1826 (phase 3), `BurntZro.png` 528x472 (burnt foot, optional).
  None of them has been looked at by me; the fetch pipeline's rule is "looked at before it ships". Sprites keys: `zero`, `zerobare`, `zeroangry`,
  `zerobig`, `zerogiant`; the red look has a free fallback (`bossTintCol(key, im, '#ff2a1a')` over the base render: "his skin fuming red").
  Credits go in `assets/sprites/CREDITS.md` and the picks in `scripts/fetch-sprites.mjs` as for every boss.
- **Size:** `big 1.9` (r = 34 x 1.9 = 65 px, a "little grey circle thing", the smallest boss of the rush). Phase 3 sets `s.r = round(s.r * 1.8)` = 116 (Two's
  phase beat does exactly this with 0.72 and 1.5; no new engine rule).
- **Hands:** a megaphone (a cone and a handle, drawn), a box of tapes, the ÷ symbol, the hat as a separate drawn prop (it lands on his head in the intro).
  All shapes, no text.
- **Colour:** roster colour #c7c7d0 (puffs, phase card); his glow colours are the cap blue #5661D5 and rage red.

### 3.4 Movement (the character in how he moves)
- **Phase 1, the coward:** he keeps ~300 px from the nearest fighter, backing off at 3.4 px/frame (slower than a fighter's 6.4: he is catchable, never
  stuck). Cornered (a floor end within 150 px behind him and a fighter inside 200 px) he drops into the nearest pipe mouth and pops out of another on the
  far side after 36 frames ("hides in the pipes": the Two pop, with a grow-in ring). He never touches anyone.
- **Phase 2, the rage:** he stops backing off and walks at you (the default chase, `approach` ~120 px) in red. He is still never a contact hit.
- **Phase 3, the Giant:** planted near the middle of the stage; his feet are his attacks. `stationary` true after the fusion.
  (Flee distance and pops are stage-size proof: both are measured in px from the fighters and the pipes are on a pitch.)

### 3.5 The five attacks
All times are frames at 60 fps; "tel" is the engine's wind-up unit and `BOSS_TEL_PACE` for him is 1.25 (unit x 1.25 = frames), as for the last bosses.
The body tell is a `BOSS_TELLS` row (pose from `BOSS_POSE`, glow, beats): the beats are the learnable "dance", the last 14 frames gather into the
pose, the last 8 flicker white. Damage is a share of `bossDmg()` (22% at loop 1); a move shares one attack id, so a fighter takes at most one hit from it.
Gap after a move (`bossAtkGapBase`): 100 / 76 / 58 by phase, then x1.2 (`BOSS_PACE`), counted from the moment the last shot of the move is gone.

**1. ROLL CALL! (signature; megaphone; all phases)** - he raises the megaphone and the Zeroes march in.
- Tell, tel 48 = 60 frames: pose `rise` (he stretches tall), glow cap-blue #7f8cff, beats 3 (a three-count chant), white flicker f52-60. The world:
  grit shakes off the pipes along the back wall and the shelf Zeroes (phase 2) turn their heads. Nothing is drawn on the floor.
- Fire: a conga line of hypnotized Zeroes (small drawn glyphs, r 24, a blank stare) grows in over 12 frames at the floor end **away from the nearest
  fighter**, never closer than 140 px to anyone, and **marches along the floor at 7 px/frame** with **310 px between them** (44 frames: one hop each is
  possible). They are shots: `bossShot`, `pierce`, one id, 0.8 of a boss hit (17.6%), knockback 10 up-and-away. They are armed after the grow-in plus 12
  frames. The first marcher is placed so it reaches the nearest fighter in at most ~128 frames (start distance <= 900 px), and the line ends ~400 px past
  the last fighter, so a huge stage does not mean a long wait; a pit under the line is crossed (a small drawn hop).
- Phase-by-tier counts: 4, 5 | two lines from both ends, offset half a gap, 4+4, 5+5 | + a line along the centre platform's top, 4+4+4 | 6+6+5.
- Answer: hop each one (jump apex ~126 px, a Zero is 48 px), or stand on a platform that has no line on it (phase 3 puts one on the platform: the
  platform is no longer a hiding place), or **interrupt it** (the signature, 4.1). Zero stands still holding the megaphone for the whole move: this is
  where you hit him. Tag `ground`.

**2. TAPE TOSS! (all phases; the box of tapes)**
- Tell, tel 36 = 45 frames: pose `rear` (winds the box back), glow steel #9aa0b4, beats 2.
- Fire: 4 / 5 / 6 / up to 8 VHS tapes (drawn: a black brick with a white label and two reels) lobbed in an arc: one at the spot you stood when it left, the
  rest in a comb across it (0.11 of the stage width apart, or 130 px). From phase 2 each tape leaves a different shelf Zero's hands. Flight 55-70 frames.
  A **real shadow** (`bossFallShadow`) grows and darkens under each tape over its last 30 frames: the only world tell. They hit while falling (r 18, 0.6 of
  a hit = 13.2%, knockback 8), then land: `impact()` small, the tape lies for 20 frames (`lingers`), then shrinks away.
- Answer: move out of your own spot; the comb is wider than a jump, so it is a walk. Tag `bunch` (a comb across the group).

**3. DIVIDE BY ZERO! (all phases; "Numerical Banishment" and the Pi Day division symbol)**
- Tell, tel 44 = 55 frames: he draws a big white ÷ (its glyph grows in over 12 frames at his hand) and leans away: pose `coil`, glow white, beats 2; the
  last 14 frames he steps in 70 px toward you.
- Fire: the ÷ chops in front of him: a tall box (the ÷ is as tall as 1.7 of his radius, reach 1.6 radius + 60), active 10 frames, 1.0 of a hit (22%),
  knockback 14 away-and-up, one frame of white. **Whatever it touches is divided away: it deletes fighters' shots and traps in its box** (the Eraser's
  precedent), with a small white ring where each vanished. From tier 3 its two dots shake loose and roll away along the floor (one each way, 7 px/frame,
  r 18, 0.6 of a hit); from tier 5 they are bigger; at tier 6 he chops twice (a backhand, 22 frames after). 24 frames of recovery.
- Answer: back off past the reach (170 px), air-dodge, or hop the dots. It punishes standing next to him. Tag `close`; the picker weights it high
  exactly when someone is close, which is what a cornered coward would do.

**4. STOP LAUGHING AT ME! (phase 2 on; the fridge breakout)** - the one line of his the move is named for (GAME TEXT; the wiki quotes it in his personality section).
- Tell, tel 54 = 68 frames, **the door is the body**: he pops into the freezer at the pitch ~600-900 px from the nearest fighter (the side with more room);
  the door bangs **three times** (canon: he counted down from three), each harder, frost and a cold glow leaking, the last bang at f58; glow red #ff3b2a,
  beats 3, pose none (the door moves). He is hidden but still hittable at the door.
- Fire: the door blasts off as a shot (0.5, knockback 12) and he **rolls out in red**, flattened to ~70% height so a normal jump clears him, 12.5
  px/frame along the floor, 1.0 of a hit (22%), knockback 14, up to 1,400 px. He **hits the far wall and stays stunned for 55 frames** ("a miss ends in the
  wall": Purple Face's AD BREAK is the precedent); where there is no wall (a cliff edge) he skids and teeters on it with his arms windmilling: the same stun.
  Tier 5+: he bounces off and rolls back the other way before the stun (the stun is the reward, so a second run costs you the window).
- Answer: hop the roll (or the platform); do not stand at the door. Tag `ground` and `wall`.

**5. THE FOOT! (phase 3 only; "raised a giant foot and stomped 2763")**
- Tell, tel 46 = 58 frames: Giant Zero leans back and lifts a leg: pose `tilt`, glow Sandstorm #f4d53d, beats 2; the world: a **real shadow** on the
  floor grows under the landing spot (follows the nearest fighter until 12 frames before the drop, then locks) and grit falls from the ceiling.
- Fire: a giant gray foot (a rounded oval, 220 px wide, drawn) falls from above the screen at 30 px/frame (~20 frames), **hits while falling**, 1.0 of a
  hit (22%), knockback 14 up and out; lands with `impact({shake:12, dust:2, debris:7, scar:true, r:130})`, stays planted for 30 frames
  (hurts nobody; it is the shot's `lingers`), then lifts. Tier 6: a second foot 28 frames after the first lands, where you are then.
- Answer: walk out from under the shadow. Tag `any`.

### 3.6 Phases (two changes: 1 to 2 at 1,188, 2 to 3 at 594)
1. **"Leader" (1,800 to 1,188):** small, in the cap, megaphone in hand, backing away, a coward. Moves: ROLL CALL!, TAPE TOSS!, DIVIDE BY ZERO!. Lesson:
   read the beats, hop the line, and close in on the call.
2. **"Embarrassing Tapes" (1,188 to 594):** the phase beat is a 90-frame scene: the TV lights and plays the pillow tape, four small Zeroes climb out of the pipes
   onto the shelf and laugh (their bodies shake), he shakes, goes **pure red**, roars (a brief shake and one `impact`), and stops running: he walks at you. New
   move STOP LAUGHING AT ME!; the shelf Zeroes now throw the tapes and join the marches; lava seeps in (the optional hazard); a first ROLL CALL has two lines.
3. **"All Zeroes, Combine!" (594 to 0):** the four shelf Zeroes jump down and run into him, a bright flash and energy radiate off them (the five-Zero fusion; the
   `zerobig` render for ~40 frames), the bunker wall tears away, the red world and the marching crowd appear behind, and he swells to Giant Zero (r 116, the
   `zerogiant` render), no longer back-pedalling. New move THE FOOT!; ROLL CALL! gains a platform line. During the beat no attack starts for 90 frames, and
   `invuln` is the engine's standard 20.

### 3.7 THE SIGNATURE MECHANIC: the horde, the fusion, and the fizzle
Every other boss in the rush is one body with a kit; Zero is the one who is never alone, and the fight is the story of that: **a lone coward who calls for backup
(phase 1), a squad that laughs at him and a rage (phase 2), the whole planet fusing into him (phase 3).** What makes it a mechanic and not a costume:

**The megaphone fizzles.** In canon the megaphone is locked unless the right Zero holds it, and the first try in the 3.517M special simply does not work. In the
fight: if Zero loses **18 HP or more between the start of ROLL CALL!'s wind-up and its end**, the call fails: the megaphone squeals and cracks (a drawn crack, a
puff), the beats stop, **no Zeroes come**, and he is **flustered for 90 frames**: hands over his face, pink cheeks (he is one of the few who blush), no move
starts. It is checked in his tick (`s._hp0 - s.hp`), not in the shared damage code, so it needs no engine edit. 18 is about a smash plus a jab; tune it by
measuring (HP is 1,800 so the number is small in percent and large in play). This gives the player an active answer to the signature. No roster boss has a
damage-threshold interrupt today, but the pattern is proven: Steve Cobs's secret fight has two (40 damage cancels his rage and skips his finale). It is also the answer to a coward on a big stage: **you have to rush him mid-call or take the line.** A fizzled call
costs him the turn, a successful one costs you a hit if you misjudge. Phase 2's laughing squad cannot be hit and has no part in the check.

Rejected for being worse: (a) **Which Zero wears the hat** (a shell game with decoys): the engine finds "the boss" as the first Boss Rush summon, decoys would
be shots, and the hat is trivial to see in 2D; (b) **power immunity** (only melee hurts the Giant): Two and One already force you to stand close, and it
would lock ranged fighters out; (c) the Donut `zeroed` debuff (it is Donut's); (d) the hole in his middle (his face fills it).

### 3.8 Intro and defeat
- **Intro (~90 frames):** the garbage chute at the top of the bunker coughs and **Zero drops out** (hat not on), lands with a small `impact`, looks round, shrugs;
  a second pipe spits out the hat, it spins and **lands on his head**; he picks up the megaphone, and the boss card runs as the engine always does. (Canon: the
  hat pops out of the pipes in the 3.517M special.) Render `zerobare` until the hat lands. Spawn hook: `zrSpawn(boss)`.
- **Defeat (hold ~1,800 ms, no text):** the Giant **splits back into Zeroes**: the body bursts into a dozen small ones that scatter, bump each other, then
  **march off both sides of the screen in a crowd**, and the hat tumbles last and rolls to a stop on the floor; a tiny hand-lettered cardboard sign is
  carried by the last marcher: "THE BEST DAY OF ZERO'S LIFE" (the alternate title in the wiki's description of the 3.517M special: GAME DESIGN, the one designed sign of
  the fight; the owner may prefer none). A pure function of `(et0, ex, ey, er, ef)` and the clock, a `zrEnd` carrier shot like `drawTwoEnd`, so a client draws it.
  (Optional link for the lead: the rush's final boss is 2763, whom the Giant stomped in canon; its ending could reuse THE FOOT's drawn foot for ~20 lines.)

### 3.9 Why it should look cool (the set-piece list)
1. The scale arc: the smallest boss of the rush becomes the biggest body, with the show's own fusion picture for the beat.
2. The fridge door banging three times and bursting, the red roll, the crash into the wall and the dizzy teeter.
3. The marching conga of blank-eyed Zeroes, hopped one by one, then on the platform too ("droves").
4. The ÷ chop that wipes your shots, with the dots rolling away.
5. The giant foot's shadow filling the floor, and the stomp's shake and scar.
6. The hat dropping onto him and rolling away at the end; the crowd marching off.

## 4. How it plays, in numbers

### 4.1 The table (one `const ZERO`, as Springy and Two do)
`hp 1800`, `big [0,1.9,1.9,3.4]`, `tel {zero:48, zrtape:36, zrdiv:44, zrfridge:54, zrfoot:46}`, `BOSS_TEL_PACE.zero 1.25`, `gaps [0,100,76,58]`, `flee 3.4`,
`stand 300`, `fizzle 18`, `flust 90`, `march {v:7, space:310, r:24, dmg:0.8, kb:10, near:140, start:900, tail:400}`, `tape {n by tier, r:18, dmg:0.6, comb:0.11}`,
`div {reach:1.6, tall:1.7, dmg:1.0, kb:14, dots from tier 3}`, `fridge {v:12.5, dmg:1.0, door:0.5, stun:55, flat:0.7, max:1400}`, `foot {w:220, v:30, dmg:1.0, plant:30,
lock:12}`. Everything in px or fractions, never in a fixed stage size.

### 4.2 Pick (`BOSS_PICK.zero`)
`tags {zero:'ground', zrtape:'bunch', zrdiv:'close', zrfridge:['ground','wall'], zrfoot:'any'}`, `moves` by phase (3, then 4, then 5), `first` opens a phase with its new
move (the picker's fresh-move rule shows it soon anyway), `busy` while he is rolling, the foot is planted or marchers are alive (the engine's one-attack-at-a-time watch
also reads the shots' `bossAtk` ids; planted things are `lingers`).

### 4.3 Where it hooks into the engine (the work list)
Roster row (a rush roster, see risks) | `BOSS_PICK.zero` | `BOSS_MOVES.zrtape / zrdiv / zrfridge / zrfoot` and `fireBossAttack` for ROLL CALL | `zrBeginTelegraph` | `zrMove`
(flee, pop, rage walk) | `zrTick` (fizzle check, squad positions, flustered, tiers, lava) | `bossTelLen`, `bossAtkGapBase`, `onBossPhaseChange` and `bossPhaseName` rows |
`BOSS_TELLS.zero` | `BOSS_ENDINGS.zero` | `BOSS_ARENA_SKY / GROUND / HAZARD` and `drawArenaDecor("zerobunker")` | `BOSS_SPRITE_SRC` and a drawn `case "zero"` | `PROJ_SHAPE`
glyphs (`zrmarch`, `zrtape`, `zrdiv`, `zrdot`, `zrfoot`, `zrdoor`) | `netshot` fields (which Zero a marcher is: 0-3) | no `net` row (everything rides `_hz`: squad x, door
frame, hat, flust, lava, p2/p3 frames, tier).

### 4.4 Tells, one by one (the `BOSS_TELLS.zero` row)
`zero:{pose:'rise', glow:'#7f8cff', beats:3}`, `zrtape:{pose:'rear', glow:'#9aa0b4', beats:2}`, `zrdiv:{pose:'coil', glow:'#ffffff', beats:2}`,
`zrfridge:{pose:null, glow:'#ff3b2a', beats:3}` (the door's bangs are the beats), `zrfoot:{pose:'tilt', glow:'#f4d53d', beats:2}`. No banner on any of them.

### 4.5 Damage, summed
One hit a move: 17.6% (march), 13.2% (tape), 22% (÷, roll, foot), 8.8% (a rolling dot), door 11% (inside the roll's id). Loop 2 doubles all of it, as the engine does.

### 4.6 Tiers (the answer to 4x length)
Six tiers, two a phase, by half of each phase's HP (tier = 2*(phase-1) + 1 + [HP below the phase's midpoint]; midpoints 1,494 / 891 / 297). A tier changes **counts and
coverage only**, never speed or damage (the owner's "harder in dodging"): marchers 4/5/4+4/5+5/+platform/6+6+5; tapes 4 to 8; ÷ adds dots, bigger dots, a backhand; the roll adds a
return run; the foot adds a second. The picker's variety rule (never the same move twice) and the unlock gates do the rest.

## 5. Size

**Medium-large.** Full: ~850 lines (table and picker 60; spawn and intro 35; movement 70; tick 70; five moves 320; phase beats 60; hazard 50; ending 55; drawing 190;
arena 120; table rows 45). **Lean cut: ~600**: no lava hazard, no dots, no second foot, no pipe pops (a fade-out and a fade-in), no sign. For scale: Springy is ~410, the Dragon 836,
Evil Leafy 984. **New art: none required** (everything has a code-drawn form); optional: five wiki renders and their credits. New sounds: none (the existing boss and
phase SFX do). Needs a look from the lead on `bossPaced()` and the banner line.

## 6. What could go wrong

### 6.1 Unfair spots (and what stops them)
- A line spawning on a fighter pinned at the floor's end: spawn at the end farthest from the nearest fighter, never within 140 px, armed 12 frames after the grow-in.
- The fridge door opening next to someone: the door is chosen 600-900 px away; if every freezer is near a fighter, the farther side wins; the door's own hit is 11% inside the
  roll's one id.
- The roll over a platform fighter: it is a low roll; the platform is safe; the stun after is the reward.
- The foot's lock: it follows the nearest fighter until 12 frames before the drop; two stacked fighters take one hit between them per id.
- Lava biting after knockback: only the outer 5% of each end, from tier 3, 0.4 of a hit, once per burst. Cut it if the rush stage is mostly pits.
- The fizzle punishing nobody: if 18 HP is too easy, it is trivial; if too hard, it is a dead rule. Measure with `scripts/boss-solo.mjs`.

### 6.2 Stuck spots
Cornered coward (pops through a pipe); a march stopped by something (shots move by `vx` only; `bossShotGone` already kills shots out past an edge); the stunned roll with no wall (teeters
at the floor end); the 90-frame phase scenes blocking an attack timer (they set `_atkTimer` and clear it); a pit under a line (the line is drawn hopping, a pit is not a floor for them).

### 6.3 Engine limits that matter
- **`bossPaced()` is `BOSS_ROSTER.some(...)`:** a boss that is not a row of that array gets no picker, no one-attack-at-a-time watch, no `BOSS_PACE` and no `BOSS_TEL_PACE`; he would
  run the old fixed turn cycle. The rush needs either its own roster merged into the check, or `bossPaced` widened. Same for `summonBoss` (the item boss rolls any
  `BOSS_ROSTER` row: do **not** add Zero to the 12-row list or he joins the old gauntlet, the "all twelve" count and Four's loop end).
- **`bossRushCheck`** ends a lap on `boss.name === "Four"`; the rush needs its own end rule. `awardBossCleared(boss.name)` writes `PROFILE` by name: "Zero" must be allowed there.
- **HP:** the spawn multiplies the row by `BOSS_HP_MULT` 1.5 and (1 + 0.6(n-1)); the 1,800 has to be a final bar. At that size a fight is roughly 250-300 landed hits (grace per attacker already spaces a
  character's hits); a long fight raises the odds of rare stuck cases, so `scripts/boss-glitch.mjs` and `scripts/boss-solo.mjs` should have Zero added.
- **Online:** everything a client draws must be a pure function of `_hz` plus shots (the Two model): squad and hat and door and crowd in `_hz`; marchers, tapes, ÷, dots, foot, door and the ending as
  shots with `netshot` fields; the new arena key in `BOSS_ARENA_SKY` (a client drops a key it does not have); the phase-3 look from `_hz.p3`, not from a swapped `BOSS_ARENA`, so no key
  swap is needed. Never the live relay.
- **CPU:** bots read shots, not zones: the floor lava and the fridge's route are zones. Everything dangerous is a shot with an id except the lava (optional) and the foot's shadow
  (the foot itself is a shot). The solo bot fell into Springy's holes most; expect the same of lava.
- **Bigger stage:** every distance is in px or a pitch, never a fixed stage; the march start, the roll length and the pipe pitch are the three numbers to retune when the rush's stage size
  is known. Floor segments with pits (`FLOOR_SEGS`) must be respected by pops (land on a floor), the roll (floor ends) and the marchers (they cross pits).
- **The banner line** (2.2): without gating `banner(bossTelName(s), ...)` he shouts "!" in 76 px yellow at every wind-up.
- **Renders:** the five wiki files are unviewed; the ones used must be looked at, cut out (the red one is wide, 1550x844: probably an arms-up pose), and credited.

## 7. Questions for the owner
1. Is the arc (coward, then rage, then the Giant) the right Zero, or should he be one-note? And is the **megaphone fizzle** the signature you want?
2. Move-name popups: the engine still puts one up per wind-up for every boss. Skip it for the whole rush (my assumption), or keep it?
3. Phase 3 in Zero's own destroyed bunker (my pick), or in the Void (canon, but it is probably 2763's)?
4. How big is the rush's stage, and does it have pits and floating platforms? (The marches, the roll and the lava need it.)
5. Keep the optional lava, the sign "THE BEST DAY OF ZERO'S LIFE" at the end, and Giant Zero stomping 2763 in the finale?
