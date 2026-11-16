# Queue for after the weekly reset (Sun 2026-11-15 18:00 UTC): every score to 10

**STARTED 2026-11-15** (owner: "start"; usage reset to 0%). Running now (7 at once): Stapy round 3 (0b-0e), Foldy hits+wind (0f0), Black Hole physics+edges (0h), Pie/Clock/8-Ball (0f, 0g, 0i), TLC Teams map BIGGER (new: owner "the TLC on teams is too small"), easy wins (E1, E3, E4, E7), and the critical events jury (0a). Next: E5 shop, E6 event-fighter skins, then wave 1.

Written 2026-11-14 on the owner's ask: "make a queue for the reset to make all scores 10's". Scores are from `feature-scores.md`.

- Jobs run up to 7 at a time (owner's limit), each in its own worktree.
- Every job gets a juror before merging.
- Nothing goes live except on an update day or when you say "ship now".
- **[YOU]** marks the items only the owner can close: a decision or a play test. Those areas can't reach 10 without you. Their open questions are in `owner-decisions-pending.md`.

## Wave 0: first thing after the reset

| # | Job | Area |
|---|---|---|
| 0a | **Critical jury of the events** (owner: "do a critical jury of the events soon"). Three harsh reviewers with different eyes: a competitive player, a show fan checking it against BFDI/BFDIA, and a bug hunter. They review all 10 contests and the 10 event fighters on the preview build (localhost:8223) and report flaws, not praise. | Event contests |
| 0b | Stapy: why Firey (the player slot) wins most CPU runs (owner: "sure, ig") | Event contests |
| 0c | Stapy: add PITS back (owner: "maybe add pits"). Falling in costs a stock and you respawn on the plaza. Pits go in the dark outside, between the plaza and the lighthouses. CPUs must be able to jump them; the first build removed pits because CPUs got trapped in them. | Event contests |
| 0d | Stapy: HARD, REQUIRED PARKOUR and BIGGER lighthouses (owner 2026-11-14/15: "parkour should be hard and REQUIRED, because right now, there are platforms to skip the parkour entirely"). Both routes are hard parkour on every floor, with NO platform anywhere that bypasses it (prove it: no route from the bottom to a lever avoids the parkour pieces). The rooms get bigger, and the camera is at normal zoom inside. ALSO: (1) the rooms sit next to each other in the sky, so Bow can teleport out of one tower sideways straight into another. Put them far apart, walled off, and stop warps from leaving a room (like the Beach Ball net fix). Check every teleport or warp move. (2) The emblem's 4 pieces must have NO gaps between them; it is one whole emblem. | Event contests |
| 0e | Stapy: EMBLEMS IN THE BACKDROP (owner 2026-11-15: "make the emblems part of the backdrop, so we can see that, when your emblem is complete, it drowns out the others"). The 4 emblems are drawn huge in the sky behind everything, as part of the backdrop, not as a HUD. When a fighter's emblem completes, it grows, brightens and fills the sky, swamping and fading the other three. That is the win moment, and you get to SEE it before the win screen comes (owner: "and you get to see it before the winscreen comes"), so hold the win screen back for a few seconds while the emblem fills the sky. | Event contests |
| 0f0 | Foldy: the owner APPROVED my suggestion ("1 is okay" = OK, change it): make HITS and the WIND count much more. Right now a hit costs under 1 s of a 3-minute race and the wind adds only 5-27% to your speed. Make the hit pushback a real setback and make the wind a strong, felt force, while keeping your normal run speed and the ~3 min race. Show the before/after numbers to the owner. | Event contests |
| 0f | Pie: the crumble CHASES CLOSER, so it pressures the leader too, not just the stragglers (it caught someone in only 3 of 10 runs). Owner: "2 is a yes". | Event contests |
| 0g | Clock: CPUs must actually GO FOR THE CLOCKS (owner: "they dont grab the clocks"), and a fighter who loses all stocks KEEPS their points and can still win. NOT wanted: longer timers or a normal-size stage. | Event contests |
| 0h | Black Hole: the PHYSICS ARE INCONSISTENT (owner: "with the same inputs from negligeably different spots, there are huge differences"). This is a bug. Find out why (the pull's falloff, the hit-redirect, the air-refresh rule, debris shoves or frame-order effects) and make the climb consistent: the same inputs from nearly the same spot must give nearly the same result. Prove it with a probe that replays one input sequence from many nearby start spots and measures the spread before and after. ALSO FIX: at the stage edges the normal Sky Towers background shows; the apocalypse must reach every edge. No climb cap unless the owner asks. | Event contests |
| 0i | 8-Ball: one-shot assists wait a few seconds before restarting (no nonstop Eraser wipes), and jawbreakers drop more often in the falling part. Owner: "sure for those". | Event contests |

## Next: MOVE BUILD (owner 2026-11-15)

| # | Job | Area |
|---|---|---|
| M1 | Build ALL small fixes from moves/move-pass-A/B/C.md (names, drawings, card text; same moves and numbers). | Fighters |
| M2 | Build ALL redesigns from move-pass-A/B/C.md, on a branch, for the owner to play on the preview and veto before merging. Includes the 13. Run the look-alike checks the documents name. | Fighters |
| M3 | Sky drops: replace Blocky's anvil special (a non-sky version) and Tree's Timber (he lobs his own branch). Sidewalky's 'Physically' (a slab from the sky) too, using the designer's Fresh Pavement. | Fighters |
| M4 | Taco: her OWN down special instead of the one borrowed from Taco (II). Knife: Caltrops STAYS (the owner didn't pick Blade Rush). | Fighters |
| M5 | Plus S1 (the v2 smash fixes above). Build M1-M5 as one move program, split across 2-3 builders. | Fighters |

## Wave 0b: events jury fixes (juries/events-critical-jury.md; owner answers 2026-11-15)

| # | Job | Area |
|---|---|---|
| J1 | Cloudy: SHORTER hold of all 9 (e.g. 5 s) and the golden seed drops only on a STRONG hit (owner). | Event contests |
| J2 | ~~Eraser~~: DROPPED. Owner 2026-11-15: "dont fix eraser". Leave Eraser's contest as it is. | Event contests |
| J3 | Spongy: REMOVE the glints and hint rings (owner: you don't know where your moves are buried); remove the 'FIGHT!' and 'caving in!' banners (no phase names); fix the 2-3 CPUs frozen 5 s+ at the start. | Event contests |
| J4 | Beach Ball: MOVES MATTER: strong moves (smashes, specials) hit the ball harder and further, jabs just bump it (owner). | Event contests |
| J5 | Black Hole: hits knock toward the hole ONLY when the attacker is ABOVE the victim (otherwise normal knockback); SWALLOWED players get something to do, e.g. throwing debris at the climbers (owner). | Event contests |
| J6 | The player's slot (Firey) wins too often in several contests (Eraser 3/3, Spongy 2/3, Pie, Stapy): check start slots and anything the player slot gets, across ALL contests. | Event contests |
| J7 | Before shipping any contest: make sure the preview-only F9 event picker and the moved launch date never reach ii-dlc. KEEP the name 'Spleef' (the owner's word; the jury wanted to rename it). | Release |

## Wave 0.5: easy wins the owner approved (2026-11-15: "do 1, do 2, do 3, do 4, sure ... give skins to event fighters once you unlock them. fix the bugs")

| # | Job | Area |
|---|---|---|
| E1 | Yoyle Needle Teams, two teams: for EACH map layout, measure every pair of bases and use the MOST EVEN pair (owner 2026-11-15). The lead's earlier 'east/west already even' claim was WRONG (they measured 1.6-1.7x). Plus: the CPU ledge brake never runs on Yoyle Needle Teams (stgBrain returns early when STG.statics is empty); fix that. | Big Teams maps, CPU |
| E2 | DONE 2026-11-15: Faultline (Shifting Isles) and Windy Heights Teams maps OPENED on ii-dlc (jury fixes were merged); they ship with the next update. | Big Teams maps |
| E3 | Input-drop fixes: a one-step key press latch, reading keys during the Final Smash slow-mo, and a short 'no battery'/'hushed' cue when a special is refused. NOT the bigger 4-6 frame buffer. | Online, Menus |
| E4 | Merge the CPU 'finish them at 100%+' change (branch g-stalemate) after a re-check | CPU players |
| E5 | Unpause the shop (owner: "sure"). Check what was paused and why first (memory: the shop was paused around the boss overhaul); no paid packs (support plan). | Economy |
| E6 | EVENT FIGHTER SKINS: each event fighter comes with a skin once you unlock them (owner: "give skins to event fighters once you unlock them"). Use the existing skin system; a show-style alternate look per event fighter. | Fighters |
| E7 | Bugs (the own-base bleed was ALREADY fixed 2026-11-11; the Needle ledge falls are covered in E1): CTF mines timeout with 8 players; CTF Forest hide freeze | Teams, CPU, CTF |

## Next job (owner 2026-11-15): THOUGHTFUL SMASHES

| # | Job | Area |
|---|---|---|
| S1 | REVIEW DONE (moves/smash-thought-review.md: 6 of 43 thoughtless). BUILD (owner 2026-11-15): Leafy up = Yoyleland Knife; Snowball up = Up You Go; Bomby down = Stamp It Out!; Firey Jr. main = Tantrum Flare (a real tantrum); Baseball FS = Ground Pound; Pickle FS = a low racing dive. Small fixes: Tennis Ball drop the slow; Tapey's beam back (instead of Playback Trap); Tapey FS renamed 'Eject!'; Fan flaps himself (paper fan, no blades). FS names: bring back the old catchphrase names. Look-alike checks: Bomby vs Coiny's Penny Spin, Firey Jr. vs Puffball. Show old vs new before merging. | Fighters, Final Smashes |

## Wave 1: finish what is almost done (areas at 9)

| # | Job | Area, score |
|---|---|---|
| 1 | Fix what the events jury finds (biggest flaws first) | Event contests 8 |
| 2 | **[YOU]** Review the new up/down smashes, main smashes and Final Smashes on the preview (`moves/smash-review-for-owner.md`: Bonesaw's air slam, Box on several foes, Toothpaste, Pickle, Woody). Then merge. | Fighters 9, Final Smashes 9 |
| 3 | Capture the Flag leftovers: mines timeout with 8 players, Forest hide freeze | CTF 9 |
| 4 | Final Smashes: Book/Money rain in roofed caves, Bow at 2 CTF spots, Money 1 CTF case | Final Smashes 9 |

## Wave 2: areas at 8

| # | Job | Area, score |
|---|---|---|
| 5 | Look at the newest stages by eye (pictures from the built-in browser) and fix what looks off | Normal stages 8 |
| 6 | Open Moon Caves: **APPROVED by the owner 2026-11-14** ("i say yes to all of the 'say yes to doing x'"). First a release check against its plan (it was released at M1 by mistake once) and a look at the cloud sessions' Moon Caves work (cloud owned it). Then entry polish, unhide it, and include it in the next update's notes. | Moon Caves 8 |
| 7 | **[YOU]** Algebralien Rush play test (it opens 22 Nov); Zero and Four's screech fixes | Algebralien Rush 8 |
| 8 | World Cup and tournaments small polish (from a juror pass) | World Cup 8 |
| 9 | Menus/UI pass on the newest screens (OC editor, Rush page, event pages, contest HUDs) | Menus and UI 8 |
| 10 | Website and search pages refresh after the next update | Website 8 |

## Wave 3: areas at 7

| # | Job | Area, score |
|---|---|---|
| 11 | **[YOU]** Frozen Pond direction (item 34), Yoyle Needle 4-6 player fairness (item 35, lead pick a), and a look at Faultline and Windy Heights before they open | Big Teams maps 7, Teams mode 7 |
| 12 | A fresh balance panel after all the new moves; the reflector re-pick | Balance 7 |
| 13 | CPUs: stand-stills on big maps, and CPUs using set pieces | CPU players 7 |
| 14 | Boss Rush: TLC phase 3 is fiddly near walls (fixes tried, none measurable), plus a fresh fairness pass. The old 'tell us what felt impossible' was MY note, not something the owner said. | Live Boss Rush 7 |
| 15 | **[YOU]** Online: a test with real players. We never connect to or touch the live relay ourselves. | Online 7 |
| 16 | **[YOU]** Economy: the shop is paused; say if and when to unpause it | Economy 7 |
| 17 | Art: replace the remaining drawn props with show pictures (one style per move). This is the polish phase you asked for. | Art 7 |
| 18 | **[YOU]** The input-drop fixes (item 33): a press latch and slow-mo keys. Which do you want? | Menus/UI, Online |

## Wave 4: lowest

| # | Job | Area, score |
|---|---|---|
| 19 | **[YOU]** OCs: balance (defaults "prob bad", trims merged) and the public release decision | OCs 6 |
| 20 | Event fighters Hot Dog, Needy, Sticker and Jammy, 3 at a time, each with its contest. You said earlier these come after the reset. | Event contests |

## Wave 5: the bigger online items (owner 2026-11-15: "those are okay for after too, the bigger items")

| # | Job | Area |
|---|---|---|
| O1 | Reconnect after a drop | Online |
| O2 | Event modes and contests online | Online |
| O3 | Host input delay setting | Online |
| O4 | 6-8 player FFA | Online |
| O5 | Spectators | Online |
| O6 | Competitive preset (timer, sets) | Online |
| O7 | **[YOU]** A real-player test: two computers, a few matches (we never touch the live relay ourselves) | Online |

## Rules that still apply
- Feature freeze: no new big features unless your message says "pipis". Most of this queue is fixes and polish.
- Polish phase (after the current work): show-style animation, one style per move, no gameplay changes.
- Keep your concepts. Ask before changing what a match, stage or move IS.
- Budget: the 95% cap was for the science fair, which is finished. Still check usage and do the most important first.
