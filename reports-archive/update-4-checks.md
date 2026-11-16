# Update 4 checks (2026-11-11, branch ii-dlc 46d60dd5, read-only)

Method: grep of artifacts/V1/index.html on ii-dlc and on origin/main (git show), docs/LEDGER.md, git log origin/main..ii-dlc. No code run, no browser, no tests.

## 1. Boss fairness line
All named bosses are rows of BOSS_ROSTER (the normal Boss Rush list, startBossRush uses it), not the hidden Rush mode:
- Swarm Wave = The Bug Swarm (Boss 4); Sonic Blast, Consequences, Private = Puffball Speaker Box (Boss 2); You Must and the TLC = Firey Speaker Box (Boss 3); Torture Time = Purple Face (Boss 5); Announcer crusher (Boss 1); MePhone4S (Boss 8); Purple Dragon (Boss 9); Four (Boss 11 / final).
- Ledger rows BOSS FAIRNESS (11-09), BOSS FIXES 2 and 3 (11-10) confirm each change (swarm columns, Sonic Blast P2 wind-up 48, hooks 40/36/32, Private shutters 14% with floor marked, Torture Time panes 40, Announcer crusher 54 to 70, Dragon wind-up 44 to 60, MePhone4S shove/pop-up, Four wind-ups, TLC ring wait, Consequences lane lock). These changes are only on ii-dlc (not in origin/main).
- Removed: nothing named is hidden. Changed "the Dragon" to "the Purple Dragon" (the roster name). The ledger row also mentions the hidden boss and Rush bosses: none of those is in the draft. [CHECK] marker removed.
- Caveat: the ledger says the TLC and Consequences phase 3 are NOT shown fair by the test bots (a human test is needed). The line says "slowed and now show where they will land", which is true, and does not claim fair. Owner may want to soften "fairer" for those two.

## 2. Online lag line
Only offline measurement exists. Rewritten to "Online: game snapshots are smaller (slow fighter details are sent only when they change)." No lag claim, Yoyle Needle detail dropped. Moved the decision to Lead notes ("owner may delete it").

## 3. Run and air speed numbers (re-derived from the current code)
Formulas (index.html ~27271-27345):
- Run: px/frame = MAXVX (6.4) x FIGHTER_STATS run x runK(w). runK: two straight legs, RUN_W = {min 46, med 85, max 138, span 0.25}; u = (85-w)/39 for w <= 85, else -(w-85)/53; runK = round(1 + 0.25 x clamp(u,-1,1), 3). RUN_EXC is empty.
- Air: st.air = FIGHTER_STATS air x airK(w). airK = round(0.979 x (1 + 0.10 x clamp(u,-1,1)), 3), same u. AIR_EXC: Puffball, Balloon, Balloony, Bubble, Foldy, Cloudy = 1.12; Tree = 0.86 (these replace the curve, FIGHTER_STATS air is still multiplied in).
- Old (origin/main): run = 6.4 x run x heavySlowK(w), air = air x heavySlowK(w); heavySlowK = 1 - 0.15 x sqrt((w-100)/38) above weight 100, else 1.
- Script: scratchpad u4\speeds.py parses ROSTER weights and FIGHTER_STATS from origin/main and from ii-dlc and applies both formulas for all 111 rows (result matches reports/run-speed-by-weight.csv for the rows I compared).

Results for every fighter in the draft:
- Run: Puffball 5.82 to 7.28; Lightning 7.10 to 8.52; Needle 6.40 to 7.47; Grassy 6.91 to 7.93; Leafy 7.10 to 8.01; Bubble 5.82 to 6.53; Woody 7.04 to 7.90; Bow 5.82 to 6.24; Pen and Tennis Ball 6.40 to 5.95; Pencil 6.91 to 6.42; Fries 6.91 to 6.55; Blocky 5.43 to 5.19; TV 5.41 to 5.11; Magnet 5.40 to 5.08; Bomby 5.36 to 5.02; Roboty 4.89 to 4.38; Tree 4.84 to 4.28. ALL MATCH the draft. Pickle 5.89 to 5.86, Box 6.53 to 6.50, Dough 6.40 to 6.37: same. Fix: those three weigh 86 (not "85-86").
- Air: Bubble 1.090 to 1.221; Puffball 1.090 to 1.221; Balloon 1.100 to 1.232; Balloony 1.110 to 1.243; Lightning 1.000 to 1.057; Grassy 1.037, Leafy 1.029, Woody 1.027 (small); Roboty 0.858 to 0.888; Tree 0.850 to 0.860; Tennis Ball and Pencil 1.000 to 0.951; Pen 1.090 to 1.037; Bonesaw 1.000 to 0.953; Donut 1.000 to 0.955. All match the draft EXCEPT Needle: the draft said "about +5%", actual 1.030 to 1.076 (+4.4%); now written "1.03 to 1.08".
- Not listed in the draft but changed more than 0.5 px in run: Balloon 6.02 to 6.75, Test Tube 6.08 to 6.82, Microphone and Salt 6.40 to 7.10, Bracelety 7.10 to 7.79, Lightbulb 6.98 to 7.65, Money, Firey Jr. and Clover 6.40 to 7.01, Donut 6.98 to 6.55, Bonesaw 6.02 to 5.62, Marshmallow 6.40 to 6.93, plus event fighters (Foldy 6.66 to 8.23, Spongy 5.57 to 5.10, Stapy 5.24 to 4.97, Cloudy). The draft's closing line covers them in general words; the owner may want more names.

## 4. Fern
ROSTER row 2195: play:true, no event:true; the nine event rows are Eraser, Spongy, 8-Ball, Black Hole, Clock, Cloudy, Pie, Stapy, Foldy. Fern is in the normal roster (AI team lists use her too). Line kept. Fixed the wording: the ledger's "Full Bloom" name is gone from the code (the sound entry is now "Root Down", the smash). The healing rule applies to Photosynthesis (neutral special, sets _healStill) and Regen Stance (down special, sets _healStill); the heal tick (line ~69541) is still in the code. Draft now says "Fern's healing (Photosynthesis and Regen Stance)". Also removed pronouns for Fern (the ledger uses both).
Open: the bc596651 Fern heal change is on ii-dlc only, so the line is correct for Update 4.

## 5. CTF lines
- CTF_MAPS.mines exists in origin/main and ii-dlc, not wip, no beta flag: visible. The player-facing name is "Crystal Deeps and Coral Deep" (name field), NOT "Mines". Draft line changed to say "maps like Crystal Deeps and Coral Deep".
- The dry-spell rule (CTF_DRY_START 14400 frames = 4 minutes, CTF_DRY_STEP 3600) and the Flag Cup Escape key are in ii-dlc only (origin/main has 0 hits for CTF_DRY_START), so both are news. The Flag Cup button is on the CTF screen with no flag.

## 6. Merged since v1 and visible
Added: unique moves batch 4 (ledger row "UNIQUE MOVES batch 4" and reports/moves-batch4.csv; names verified present in the code's fighter text or tables): Ruby (Shard Spray, Facet Fall), Firey Jr. (Flare Up, Fire Whirl), Bell (Toll), TV (Pause, Scan Lines), Ruler (Straight Edge), Gelatin (Jelly Bounce), Loser (Shrug It Off, Cold Snap), Fern (Root Down), Coiny (Spare Change), Fanny (Gust now shoves foes ahead, Cyclone). Also changed "thirty fighters" to "forty fighters" and "up specials or smashes" to "specials or smashes". Canon note: all batch-4 design bases are unverified against episodes; the draft makes no canon claim.
Stay out (checked):
- DI_TEAMS_OPEN = false (line 24666): Dream Island Teams map hidden. Latest commits (spread out, whale island) are still hidden.
- MC_V4_OPEN = false (line 3718): Moon Caves v4 (V8b online, V9) hidden.
- RUSH_OPEN = false (line 100004): the Rush mode and its bosses hidden.
- OC_RELEASED = false, OC_OPEN only via a private localStorage switch; OC_PUBLIC_TYPES = ['zoner'] only matters inside the editor: OCs and OC online sync are NOT public Friday, nothing written.
- Yoyle Needle Teams map: nothing player-facing found, not written.
- Sky-drop smash removal: other branch, not in ii-dlc log, not written.
- No other player-visible commit in git log origin/main..ii-dlc after the draft was written besides batch 4 (the others are Moon v4, OC, DI map, Rush).

## 7. Teaser
Kept exactly: "Secrets have been added..."

## 8. Hidden-name grep of the final draft (update-4-draft.md)
Searched for: One (as a name), 2763 / 2,763, OJ, Suitcase, Cabby, Algebralien, Cobs, the nine event fighters (Eraser, Spongy, 8-Ball, Black Hole, Clock, Cloudy, Pie, Stapy, Foldy). Result: no hits except the word "One" inside the visible move name "One Purchase Later" (Marshmallow's smash, in the shield-breaker list; it was in v1 and is a normal released move), not the hidden fighter. Moon, Dream Island and OC appear only in the Lead notes "left out" list (not part of the paste-ready HTML block); the lead should delete the Lead notes section before anything is pasted into the game. The HTML block contains none of them. (Final grep run after the last edit: no hits for 2763, OJ, Suitcase, Cabby, Algebralien, Cobs or the event fighters.)

## What else must change for the push (lead, on Friday)
1. In-game CHANGELOG array in artifacts/V1/index.html (near line 19436/19497; index.html is CRLF, use Python load/save only): add an Update 4 entry at the top with the same lines (text only, no HTML tags). Currently there is no Update 4 entry.
2. artifacts/V1/whats-new.html: paste the HTML block above the Update 3 entry; update the meta description line and the dateModified (13 November 2026 / 2026-11-13).
3. SEO pages: run node scripts/gen-seo-pages.mjs --date 2026-11-13 (lead, later) and commit the regenerated pages.
4. Update the fighter pages / card text if the generator reads them (it should from index.html).
5. Push only on the owner's OK; main only on update day or "ship now". Do not touch the live relay.
6. Delete the Lead notes and Owner decisions sections of the draft before pasting.

## Still uncertain
- Boss phase 3 of the TLC and Consequences: bots do not prove them fair; human test pending.
- Online line: no real-play measurement. 
- Needle air number is rounded (1.076 shown as 1.08); Donut 0.955 shown as 0.96, Bonesaw 0.953 as 0.95.
- I did not run the game, so move names are checked against code text only, not by firing them.

## Corrections (from the checker itself, 2026-11-11)
- Speed numbers come from its own script; only about 7 rows were compared with run-speed-by-weight.csv, not a full comparison.
- "Four (Boss 11 / final)" is wrong: Springy is Boss 11; Four is the last boss.
- The Flag Cup button was seen ungated in one place only; not every gate was checked.
- Fern: two moves are named "Root Down"; the batch-4 smash is being renamed in the sky-drop job.

## 9. v3 update (2026-11-11, against ii-dlc 404feb93)
Read ledger rows: RUBY smash restored, MOVES PUT BACK (owner review 1), UNIQUE MOVES batch 6, SKY DROPS removed (g-nosky2), BOSS RUSH FSB TLC, UI POLISH, CREDITS. Code checked in artifacts/V1/index.html (the game is there, not in the root index.html): Pep Talk, Legs Only, Take Root texts present; Ruby's beam smash is Prism Burst (no Facet Fall/Flick left); Shard Spray, Cyclone, Bedspring Boom, Acid Reflux, Ice Breaker present; Full Bloom, Freeze Mine, Cushiony Guard, Slowing Puddle, Poison Puddle, Lemon Spit present (Bell/Gelatin/Fern/Barf Bag/Marker/Pillow/Taco (II) back); Blocky's swung anvil comment and still in SHIELD_BREAKERS; Money/Paper/Book Final Smash texts say thrown/roll; "Checking routes..." panel; "Missed! Try again closer"; ESC_BACK table; key hint (keyHintKeys); FSB ringLag.
Unique-moves count: batches 1-5 = 50; fully put back (no move left): Bell, Gelatin, Fern, Barf Bag, Marker, Pillow, Taco (II) = 7 -> 43 (Fanny keeps Cyclone, Ruby keeps Shard Spray); batch 6 kept: Bracelety, Nickel (II), Grassy (David rejected) = +3 -> 46. No fighter appears in two batches. Not checked: whether any batch 1-3 fighter lost a move in another revert (no ledger row says so).
Left out on purpose: builder-character options in the sky-drop row, the credits move, the Algebralien Rush.
Uncertain: the FSB TLC line says only what changed; the ledger's own dodge measurements are mixed, so no fairness claim. Is Firey Speaker Box in the PUBLIC boss rush? boss-rush.html does not name him; index.html has 28 hits; the draft already mentioned the TLC, so kept. Paper's pianos now both connect (+32%): the line says so; owner may cut it. Not run in a browser; Esc list taken from the ledger row (14 screens), first-listed names loosely mapped to screens (options = Settings).
Hidden-name grep of the HTML block (word match: One, 2763, OJ, Suitcase, Cabby, Algebralien, Cobs, Eraser, Spongy, 8-Ball, Black Hole, Clock, Cloudy, Pie, Stapy, Foldy, Moon, Dream, Yoyle, Rush, OC, builder, Nine, Six, Zero, Three, X, Fourse): hits only "One Purchase Later" (Marshmallow, released), "Blade Rush" (Knife, released) and the word "Nine" in "Nine neutral smashes". No hidden name.

## Bug-fix add (v4)
Ledger rows checked: g-spawnfix (stgRespawn, koCap sweep, eliminate ending holds: _swallowTick/_grabbed present in artifacts/V1/index.html), g-koname (hzMark/hzBy present), g-basebleed (enemyZoneOf present). Skipped: DREAM ISLAND TEAMS MAP CPU row (hidden). One new "Fixes" list item before the teaser; teaser unchanged. Not run in game; claims taken from ledger rows plus symbol greps. Ledger notes: Yoyle Needle CPU falls only reduced (20 of 58 to 9 of 46), worded "less"; the Yoyle Needle fix mentions the map name, which is public (the hidden thing is its Teams map).
Hidden-name grep of the HTML block (One, 2763, OJ, Suitcase, Cabby, Algebralien, Cobs, Eraser, Spongy, Moon, Dream, Rush, OC, builder, Yoyle): see report; only "Yoyle" (public map) and old released hits "One Purchase Later", "Blade Rush" expected.
