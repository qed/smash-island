# Finisher ideas for OJ (prize fighter A, code key PZ_A): four pitches

Local report, never ships (reports/ is git-ignored). In this file he is OJ; in code he is PZ_A and none of the pitches needs his name: every kind name below (sulk, cookie, door, tantrum) is a plain word. Nothing here is built. Nothing in the game, a worktree or git was touched; no node script was run; nothing was downloaded. I read wikitext as text in one background browser tab of my own (opened, then closed).

The finisher is the V + C move. Today it is the shared swing: "a heavy swing right in front of you (short reach). On hit: 14%." His kit already has Attack (a short punch), Juice Spill (a puddle trip; pouring empties him, and empty he is moody: his hits land 25% harder and he flies 10% farther), Across the Line (a long low jump, then a sprint) and Cork (a 72-frame self-cork that stops shots and slicks). His smash is already the shatter (a ring of glass, costs him 5%). None of the four pitches clones any of those.

## What I read

- The inanimateinsanity wiki, as wikitext: the character page (OJ), its Quotes and Coverage pages, Hotel OJ, and the transcripts of Journey Through Memory Lane parts 1 and 2, Everything's A-OJ, The Overthinkers, Breaking the Ice and 4Seeing the Future. I did not watch any video; everything below is the wiki's text.
- The game: finisher-ideas-v2.md (style and rules), PRIZE_KIT (MOVE_TEXT, ATKSPECIALS, the Juice Spill and Cork code, the applyHit empty rider) and the FINISHERS V2 framework in artifacts/V1/index.html (finxStep, FINX, finxAdd, fxLock, fxHold and _fxBy, fxHit, fxTargets, fxBossShape, FX5_PRESS, the finx8Counter hook, FX5_LETGO, FINX_NET, SM_FX). The line numbers in that file moved by about 265 while I was reading, so someone is editing it; I cite function names, not lines.

## What OJ is: canon, game text, and what I could not confirm

Canon (the wiki):
- He is a glass cup of orange juice, not a bottle. The cork is a prize he is given in the finale (Journey Through Memory Lane part 1, "How is a cork gonna help me?") and wears to cross the water; it is not a permanent cork on his head. So "bottle" and "cork on his head" are the game's look.
- He won season 1, spent the million on Hotel OJ (a big orange hotel shaped like him) and manages it; he later co-leads the OSC and is "in charge of keeping things Orderly".
- Personality (the wiki's own words, paraphrased): prideful, assertive, irritable, takes credit, and when he feels out of control he orders people around and insists on leading. He holds grudges for betrayal.
- Moody and sick when empty (The Great Escape: everyone drinks him; The Tile Divide: he is empty, weird and moody, yells at Paper for not helping). Sick when filled with water; afraid of water. He shatters constantly. His juice usually does not obey gravity, except in the finale.
- Taco's lollipop knocks him over and spills his juice in the finale; he knocks Taco down and holds her to the ground to stop her stealing the case.
- Betrayal thread: Bomb shoves him at the finish line of Double Digit Desert (he shatters, Bomb wins); in Aquatic Conflict he quits the alliance over it; in Crappy Anniversary and The Great Escape he still calls Bomb a backstabber.
- 4Seeing the Future: MePhone4S throws a cookie at each contestant (one is poisoned: four seconds to live); OJ says chocolate bases are bad for his acidic structure and gives his cookie to Bomb, who throws it away. The wiki also says he is the only contestant to have eaten one of MePhone4's cookies (finale prize: he finds it tastes terrible).
- Everything's A-OJ: he finds a door with a "do not enter or you will die" sign (MePhone4 hid the eliminated contestants in his closet), says to wait, then lets Pepper open it; Trophy springs out. As host for a day he picks Suitcase to be eliminated at random and walks her backwards off-screen, makes everyone clean and sing, then settles a "challenge" with a coin toss. After the credits an elimination portal spits the eliminated contestants into the hotel, crashing, and he says welcome and offers to show them to their rooms.
- Inanimate Smackdown: he tries to kick, push and punch Taco, who does not budge. Stranded in Paradise: he likes twirling with Paintbrush.

Game text (my own, not on screen): every move in the four pitches is an invention built on those traits. Where a pitch borrows a scene it says whose scene it is (the closet and the cookies are MePhone's props; OJ only reacts to them).

Not confirmed: the wiki's trivia about scrapped liquids (orange soda "150% more energy", fruit punch "cool surfer dude", apple juice "less intelligent") comes from creator Tumblr posts whose links are marked dead, so I used only the moody-when-empty part, which the show does confirm. I did not confirm what the closet's contents look like on screen, or whether OJ ever throws anything but a rock (Arena of Death, per the wiki's summary).

## Engine pieces I would build on (all exist today unless flagged NEW)

- A finisher is a FINX row: ATKSPECIALS.spill (inside PRIZE_KIT, installed and removed by installPrizeKit and uninstallPrizeKit) calls finxAdd with a plain kind name; finxStep runs it each frame on the host; a guest only draws it from the `fnx` snapshot rows (FINX_NET carries ph, face, x, y, tgt, bx, go and others).
- FIN_STARTUP = 12 (the body tell), FIN_GROW = 12 (what appears grows in, harmless until whole), FIN_CD = 74, one finisher out at a time, the cooldown running from when it ends.
- fxLock (commit the owner), fxHold and _fxBy (a held foe), fxFree and FX5_LETGO (a KO or jail lets go), fxHit, fxTargets, fxBossShape and fxBossCircle (a boss takes a plain hit once), FX5_PRESS (a second press), the applyHit counter hook (finx8Counter, Spikey's), FINX_LEFT (what a finisher leaves behind hits only its target), fxArt and fxTell (hit art and startup).
- Statuses that exist: SM_FX.poison, burn, root, slow, stun, knockdown; OJ's own `_empty` and `_corked` timers (Juice Spill and Cork).
- Hidden-fighter rule: FINX_AI_KITS (a Set keyed by kit special) and the CPU-read switch (finB1Ai) are keyed by kit, so 'spill' must be added at install and removed at uninstall, as ATKSPECIALS already is; otherwise a game with the gate shut would list it. FINX_STEP and the draw tables are keyed by kind, so they can sit between the prize block's markers.
- The new MOVE_TEXT finisher line would be written from the pitch's numbers at install, like the other lines.

## The four at a glance

| # | Pitch | Shape | Total on a clean landing | Needs NEW | Fun / Readable / Cheap |
|---|---|---|---|---|---|
| 1 | That's What You Get | counter (back-turned bait) answered with a grab | 12% | one small branch in the counter hook | 3 / 3 / 4 |
| 2 | Have My Cookie | ranged lob with poison | 10.4% (6% + 4.4% poison) | nothing | 3 / 5 / 5 |
| 3 | Don't Go In There! | trap prop that catches, holds, flings | 12% | nothing | 4 / 4 / 3 |
| 4 | Weird and Moody | self-buff (goes empty) with a three-hit payoff | 11% base, 13.75% moody | nothing | 3 / 4 / 5 |

House rules, all four: tell is the body (a pose, at most 12 frames, no lines, popups or letters); anything that appears grows in over 12 frames; 8-18% total; a miss costs something or ends quickly; nothing unavoidable; computer only; no foe is moved into a wall or off the world (holds keep the foe where they are, launches are ordinary hit knockback); the CPU gets a one-line read; all of it runs on the host from plain state and a guest only draws; bosses take a plain hit.

---

## Pitch 1: That's What You Get (counter)

**Canon basis.** The grudge thread: Bomb shoves him at the finish line of Double Digit Desert, he leaves the alliance in Aquatic Conflict over the betrayal, and in Crappy Anniversary and The Great Escape he still calls Bomb a backstabber. Also the finale: he knocks Taco down and wrestles her to the ground rather than let her take the case. The turned back is game text: the pose is the bait, the grudge is the canon.

**In the body.** Tell, 12 frames: he turns his back on the nearest foe, folds his arms and droops, cork sagging, a sulk. Nothing is drawn around him. Then he holds the sulk, locked, for 42 frames (0.7 s), swaying a little. Nothing grows in.

**Numbers.**
- Trigger: the first melee hit (a fighter's own swing: not a shot, not a Final Smash, not a grab) that lands on him from the side his back is turned to, within 120 px. A boss's close hit (the boss within 150 px, on that side) counts too.
- The hit does nothing to him (no damage, no push), 10 frames of invulnerability. He spins in 4 frames and grabs the hitter: held 24 frames (two wrestling hits of 3%, at +6 and +14), then a slam at +24: 6%, knockdown (30 frames) in place, a small hop (kby -6), no sideways launch. Total 12%, three hits.
- Hit from the front side (cross-up), by a shot, a grab or a Final Smash: it lands normally and the stance ends.
- Boss: the hit on him is blocked and the boss takes a plain 8% (an elbow); no hold.
- Stands: nothing is left behind. Commit: 12 + 42 = 54 frames, plus 14 of recovery if nothing came.

**Counterplay and miss cost.** Wait out the 42 frames (the tell tells you which side is his back), hit his front by crossing up, or throw a shot. A miss costs him 54 + 14 = 68 frames locked, open at the end, and then the 74-frame cooldown from the press; a foe who simply waits gets a free approach.

**Engine pieces.** A FINX row (phases turn, wait, grab, slam, end), fxLock, the applyHit counter hook (finx8Counter is Spikey's; add a sibling branch for this kind), fxHold and _fxBy for the grab, fxHit, fxBossShape, FX5_LETGO. **NEW (small):** the back-side test: store the side he turned from on the row (`bx` already rides the snapshot) and compare the hitter's x. No new system.

**Nearest cousin.** Spikey's Told You Not to Touch (a counter that answers any close hit with a lunge). Mine answers only from behind and with a wrestle and slam, not a lunge; if that is still too close for the owner, drop this one.

**CPU read.** On the ground, a grounded foe 10-70 px away at about his height and not in hitstun, rolled at roughly one frame in eight (fxRand), so it is not a constant.

**Risks.** Stuck state: the hold is at most 24 frames and ends on a KO or jail of either fighter. Infinite: it cannot chain; the cooldown is 74 and the slam leaves him 12 frames of recovery. Camping: low; each use costs him 68 frames locked and a foe can just wait. Online: the host decides in applyHit; guests draw the pose from ph, face and bx.

**Rating.** Fun 3, readable 3 (the back-side rule is the one thing a player has to learn), cheap 4.

---

## Pitch 2: Have My Cookie (ranged)

**Canon basis.** 4Seeing the Future: cookies are handed round (MePhone4S throws one at each contestant and poisons one), and OJ says chocolate is bad for his acidic structure and gives his away. The wiki also says he is the only contestant to have eaten one of MePhone4's cookies (the finale prize). OJ lobbing a cookie at a foe is game text; the poison is the game's own poisoned-cookie status from the MePhone4S fight.

**In the body.** Tell, 12 frames: he reaches behind his back and scrunches his face, the way he looked at a cookie he could not eat. The cookie is out of sight until the toss. At frame 12 he lobs it underhand; it leaves his hand as a crumb and swells to full size over its first 12 frames of flight (the grow-in: harmless until whole).

**Numbers.**
- Arc: vx 8, vy -6.5, gravity 0.38 per frame: about 270 px on level ground, peaking about 55 px up, about 34 frames in the air. Hit circle r 14.
- Because it is harmless for its first 12 frames (about 96 px), nothing within roughly 100 px of him can be hit: it is a mid-to-long poke, not a point-blank move. Hits land from about 100 to 270 px.
- One hit, 6% (kbx 3, kby -4), plus poison for 110 frames (SM_FX.poison: +0.04% a frame, 4.4%). Total 10.4%. It crumbles on the floor in 20 frames, or at 60 frames of life.
- I would not use the engine's cookie collapse (a stun 4 s later): a delayed stun at a time the foe cannot choose is the nearest thing to unavoidable in these four.
- Boss: a plain 6%, no poison. Stands: nothing (the crumbs are harmless).

**Counterplay and miss cost.** Jump it (its arc is slow), sidestep it, or close to inside 100 px where it is still a crumb. A miss costs 14 frames of wiping his hand plus the 74-frame cooldown; it is cheap, which is why the damage is the lowest of the four.

**Engine pieces.** A lob like Fries' carton, Gelatin's glob and Dora's bubble; the 12-frame grow-in; SM_FX.poison; hitCircle and fxBossCircle; fxLock for the tell and recovery. **NEW:** none (the cookie's sprite is art only).

**Nearest cousin.** Fries' and Gelatin's lobs, Test Tube's flask. The difference is the dead zone (nothing close can be hit) and the poison.

**CPU read.** On the ground, a grounded foe 110-250 px away within 36 px of his height; lob it.

**Risks.** Stuck: none. Infinite: none. Camping: a 10% poke every 74 frames from full range is the worry if foes cannot dodge; if it proves too safe, lengthen the recovery to 24 frames. Online: it is one projectile row, and poison already syncs.

**Rating.** Fun 3, readable 5, cheap 5. It also fills the one hole in his kit: he has no ranged tool.

---

## Pitch 3: Don't Go In There! ... Go Right Ahead (trap prop)

**Canon basis.** Everything's A-OJ: the strange door in his hotel with the death warning, his "wait, don't go in there" and then "never mind, go right ahead", and what is behind it (the eliminated contestants, who spring out; and, after the credits, the elimination portal spitting them into the hotel, crashing, with his offer to show them to their rooms). The closet and the portal are MePhone4's, not OJ's; he only reacts. Using the door as his own trap, and the pile as what catches a foe, is game text.

**In the body.** Tell, 12 frames: he stamps and holds up one palm, "wait". In the same 12 frames a plain closet door grows up out of the floor 76 px ahead of him (the grow-in: harmless while it rises). Its warning is a skull picture on the door, no letters.

**Numbers.**
- Door: 34 px wide, 76 px tall (a normal jump clears it, as with Leafy's whirl), 76 px ahead of him on the floor he stands on. It is not solid: nothing is blocked, shots pass through it. It stands up to 240 frames (4 s) and sinks away when it ends. Two hits from a foe's attacks break it.
- Opens when a foe's body touches it once it is whole (a foe still standing in its box when it finishes rising has the 12 growing frames to step off), or when OJ presses the finisher again with a foe within 110 px of it (the "go right ahead").
- The foe nearest the door (within 48 px) is pulled in: held 48 frames at the door with the door flung open over them and a tangle of arms and silhouettes (no faces, no names) drawn over them. Three thumps at +12, +24 and +36: 3% each. At +48 the door bursts and a last 3% flings them away from OJ (kbx 9, kby -11). Total 12%, four hits.
- If OJ is hit while they are inside, they drop free at once and the remaining thumps are lost (the same rule as every held foe, as in the slap fight).
- Boss: too big to pull in; it takes a plain 6% when it touches the door, and the door opens.
- Placement: it needs 34 px of level floor at 76 px; a wall, a gap or an edge within that and the move is not spent (as Firey's stamp in the air).

**Counterplay and miss cost.** Walk or jump around it, break it with two hits, or wait out 4 s; a caught foe can be freed by a hit on OJ. If nobody touches it in 4 s it sinks away and nothing happens. One at a time: his finisher is unavailable while it stands, and the 74-frame cooldown starts when it ends, so a wasted door costs him about 5 s of finisher; he is free to fight meanwhile.

**Engine pieces.** A FINX row (grow, stand, catch, burst, end) like Grassy's patch and Bell's doorbell (the first foe who touches it); a held foe like Fries' carton (`_fxBy`, drawn over, bursts); FX5_PRESS for the second press (Goo's drip drops on a press); FX5_LETGO so a KO or jail ends it; FINX_LEFT so what it hits counts as the door's; fxBossCircle. **NEW:** none. (The foe is not hidden; the door and arms are drawn over them, as Fries' carton is, so no hide-the-foe piece is needed.)

**Nearest cousin.** Grassy's patch, Bell's doorbell and Fries' carton. Honest overlap with his own Juice Spill: both wait for a foe to walk into them. The door differs by catching and holding, and by OJ choosing the moment with a second press.

**CPU read.** Plant it when a grounded foe approaches 120-230 px away at his height and none is out; press again when a foe is within 60 px of the door.

**Risks.** Stuck: the hold is at most 48 frames and ends on a KO, a jail or OJ being hit; the door ends if OJ is KO'd. Infinite: one door at a time, 12% total. Camping: he can stand behind his own door, which is only a bait. Online: the door and the hold are FINX rows that ride `fnx`; the second press uses the same input path as Goo's.

**Rating.** Fun 4, readable 4, cheap 3 (the door, the arms and the hold are new art and a new row, but every mechanic already exists).

---

## Pitch 4: Weird and Moody (self-buff with a payoff)

**Canon basis.** The Tile Divide: he is empty, sick and "weird and moody", cannot pour enough from Paper's juice box, and shouts at Paper. The Great Escape: everyone drinks him down to an empty glass and he keeps competing. Inanimate Smackdown: he tries to kick, push and punch Taco. The game already turns empty into moody (Juice Spill); this makes the finisher the same state on purpose, with the tantrum as the payoff.

**In the body.** Tell, 12 frames: he tips himself back and the juice drains out of the glass until it is pale and empty, brow down, cork rattling. That is the whole tell, drawn on the glass itself.

**Numbers.**
- The glass is empty at frame 12 (the empty timer is set then, so a hit in the tell cancels the move and he is not moody): `_empty` is set to now + 180 frames (3 s), or left alone if he is already empty.
- The tantrum: three beats, each only on a foe the one before hit, each stepping him 14 px forward, 10 frames apart: a low kick (reach 52 px, 4 live frames) 3%; a shove (reach 52 px) 3% that nudges the foe back 12 px; an uppercut punch (reach 56 px) 5% that launches (kbx 6, kby -12). Base 11%.
- The empty rider (already in applyHit) takes it to 13.75%: his hits land 25% harder while empty. The same rider is the price: the empty glass flies 10% farther when he is hit, and he cannot Juice Spill until he has refilled.
- Boss: the kick, shove and punch collapse into one plain 6%.
- Stands: nothing. Total animation about 36 frames after the tell.

**Counterplay and miss cost.** Hit him in the 12-frame drain (it cancels everything), back out of the 52 px reach, or jump the low kick. A whiffed kick leaves him stumbling 20 frames; he is empty either way, so a miss costs a launch 10% longer for 3 s and no Spill for 3 s. If it lands, he enjoys a 3 s window of 25% harder follow-ups: that is the payoff, and it is the part to tune (120 to 180 frames).

**Engine pieces.** A FINX row (drain, kick, shove, punch, end); fxLock; the lunge-flurry machinery Lollipop's finisher uses; `_empty` and its applyHit rider; the pale-glass drawing the Juice Spill already uses (the drawing reads `_empty`, so it must already ride the snapshot; I did not confirm that). **NEW:** none; the gradual drain of the juice level in the 12-frame tell is drawing only.

**Nearest cousin.** Lollipop's flurry and OJ's own Spill. The difference is that the buff is the point.

**CPU read.** On the ground, a grounded foe within 40 px (the kick's reach) at his height.

**Risks.** Stuck: none, all timers. Infinite: the empty timer does not stack and the cooldown is 74. Camping: none. Online: `_empty` and the row's phase ride the snapshot. Balance: the 3 s of 25% harder hits after a landing may be strong; shorten before nerfing the damage.

**Rating.** Fun 3, readable 4, cheap 5.

---

## Which one I would pick

Pitch 3, the closet door. It is the most OJ (his hotel, his own wait-then-let-them-in line), it has a mind game the others lack (a bait he can spring early with a second press), it is clearly a different shape from everything else he has, and every mechanic it needs already exists (Grassy's first-foe trigger, Fries' hold, Goo's second press), so the cost is art and one row, not a new system. The honest downside is that it shares the "wait for a foe to walk into it" feel with his Juice Spill.

If the owner wants the cheapest and most readable, and a ranged tool for a kit that has none, pitch 2 (the cookie) is the safe runner-up. Pitch 1 is the cleverest but the hardest to read and the closest to an existing finisher (Spikey's). Pitch 4 is cheap but the least surprising.

## Question box lines

1. That's What You Get: OJ turns his back and folds his arms. A foe who hits his back is grabbed, wrestled and slammed, 12%. A front hit or waiting beats it; a miss leaves him open.
2. Have My Cookie: OJ lobs a cookie up to 270 px (harmless for the first 100 px). A foe it hits takes 6% and is poisoned for 2 seconds, about 10% in all. Jump or sidestep it.
3. Don't Go In There!: a closet door with a skull sign grows up ahead for 4 seconds. A foe who touches it is pulled in, thumped three times and flung out, 12%. Jump it or break it.
4. Weird and Moody: OJ drains himself empty, then kicks, shoves and punches, about 14%. He stays moody 3 seconds: hits harder, flies farther. A missed kick leaves him stumbling.
