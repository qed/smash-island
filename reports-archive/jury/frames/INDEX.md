# Jury frames: current local main (ii-dlc), artifacts/V1/index.html, 2026-11-04

How these were made: the built-in browser pane (viewport emulated at 1100x720, canvas downscaled to 1100x720 PNG), the game served from localhost only.
Matches were started through the game's own beginMatchNow() with a chosen lineup (all CPU), then stepped with the game's own step() and drawn with its own drawView(), so every canvas picture is the game's own rendering, unedited.
Honest limits:
- To get a hit, a KO, a ledge hang or a Final Smash on cue, fighters were placed or launched by script (position, speed, damage %, a glowing Final Smash granted); the physics, effects and drawing after that are the game's. Any "invulnerable bubble" frames caused by that setup were deleted.
- The pane's screenshot tool crops wrongly once a match has started, so only 01 and 02 are true pane screenshots (JPG, 800x524). The pause menu (13), the results screen (14) and the two "with-hud" frames are canvas pictures with the page's DOM (cards, menus) re-rendered over them through an SVG: close, but a re-render, not a true screenshot. In 14 the winner-portrait canvas and the replay video are blank for that reason (not a game bug).
- Not captured: the new edge marker (ring at the screen edge / chevron) and an up-arrow recovery marker for a far-off recoverer. Every attempt to put a fighter far enough off stage to need one got it KO'd by the blast zone first, so no frame shows them. Bow's Final Smash ended before the capture marks (no frames). 28 pictures below instead of 40.

## 1. Title, select, pause
- 01-title-screen.jpg: title screen. Real pane screenshot. Title, daily match and event cards, "Take the Plunge" button.
- 02-fighter-select-kit-tab.jpg: fighter select, Firey chosen, the Kit tab open (move list). Goiky Field, FFA, 5 contestants. Real pane screenshot.
- 13-pause-menu.png: pause menu over a 4-CPU Goiky match (Pencil, Bow, Firey, Leafy), step 150, with the damage cards re-rendered.
What I saw:
- The select grid is dense (109 slots, many greyed out as locked) and the Kit tab text is long and small; it scrolls past the screen.
- The Kit list reads as plain text with no icons, one dense block per move.
- The pause card is small and plain: Resume, Move list, Quit to title; the match behind it dims but stays readable.

## 2. Four-CPU free-for-all, Goiky Field (Pencil, Bow, Firey, Leafy)
- 03-ffa-goiky-midfight.png: mid-fight, step 240. Firey on the platform, Bow and Pencil in the air, Leafy on the ground.
- 03-ffa-goiky-with-hud.png: step 100, one stock each, with the HUD damage cards re-rendered over it.
- 04-ffa-goiky-hit-landing.png: a hit landing (Leafy in hitstun, about step 21 after the last frame): slash arc, white ring, sparks, and Bow's pink burst to the right.
- 05-ffa-goiky-ko-fly-16.png: Firey launched toward the right edge at 190%, 16 steps in, speed lines and a wide spray of debris; Bow in a respawn bubble at the top.
- 05-ffa-goiky-ko-moment.png: the instant of a KO: a pink and white ring burst where the fighter left, Bow's respawn bubble at the top edge.
- 05-ffa-goiky-ko-offscreen-marker.png: two steps after a launch past the right side: Firey's burst ring at the right edge of the view; the camera sits at a zoomed-out 0.77 and the whole stage plus the sky fit.
What I saw:
- The KO ring burst is small next to the stage and easy to miss at this size; the debris spray around it is the bigger cue.
- The camera zoom-out is present (stage floor and a lot of sky in view) but on this flat stage a fighter flung sideways is KO'd before it ever leaves the picture, so no edge marker appears.
- The hit effect (arc + ring + sparks) reads clearly, but the fighters are small and the platform windmill art competes with it.

## 3. Recovery
- 06-recovery-above-stage-marker.png: Firey and Bow in respawn bubbles high above the stage (Pencil just KO'd), Leafy on the platform; the fighters above the stage are all on screen, no up arrow shown.
- 07-recovery-ledge-defender.png: Firey (left) hanging just under the left ledge, Leafy standing at the ledge edge as the defender, Bow and Pencil on the right of the floor. Nobody in invulnerability.
What I saw:
- The ledge fight is easy to read at this zoom: the hanging fighter and the defender are both clear and the floor edge is sharp.
- The respawn bubbles pull the view up, and the stage shrinks toward the bottom.
- No on-screen arrow or marker was visible in either frame (see the limits above).

## 4. Final Smashes (Goiky Field, the holder in the middle, three foes close; 2 moments each)
- 09-finalsmash-pillow-1.png, 09-finalsmash-pillow-2.png: Pillow's Journal: a huge open book, then a tree growing out of its page over a darkened screen. Moments: just after the intro, and 60% through.
- 09-finalsmash-poppy-1.png, 09-finalsmash-poppy-2.png: Poppy, early and 60% through (the second shows silver Poppy copies standing around the stage with Poppy glowing in a rainbow ring, Leafy hit).
- 09-finalsmash-lightning-1.png, 09-finalsmash-lightning-2.png: Lightning, a few frames after the wind-up and 60% through (the first shows a rain cloud band along the top, a brown house and a furnace placed on the stage, Lightning in a rainbow bubble on the platform).
- 09-finalsmash-pencil-1.png, 09-finalsmash-pencil-2.png: Pencil's driving van sequence. The first shows the camera zoomed far out with Pencil only at the very bottom edge, pencil scraps flying; the second shows Pencil's burst ring on the right and Firey, Bow and Leafy bunched in bubbles at the top left, the stage not in view.
What I saw:
- Pillow's book fills a third of the screen and everything else is darkened: dramatic and readable.
- In Pencil's frames the action drifts off to the edges and the middle of the screen is empty sky and hills, so the viewer cannot tell what is happening.
- Poppy's and Lightning's Final Smashes put many small things on the stage at once, with little to show which one hurts.

## 5. Six-fighter teams (Pencil, Bow, Firey vs Leafy, Pillow, Lightning; 3v3)
- 10-teams-6-fighters-midfight.png: step 300, mid-fight (a large map with many platforms).
- 10-teams-6-fighters-hit.png: a hit landing (not examined closely).
- 10-teams-6-fighters-with-hud.png: step 300 with the team cards (TEAM 1 red, TEAM 2 blue), minimap and the 9-heart / 9-heart team tally re-rendered over it.
What I saw:
- The six damage cards fill the top-left and are readable, with team colours on the tab tops.
- Fighters are tiny on this map and half of them sit in bubbles or overlapping each other, so the lineup is hard to follow; the minimap is small and its dots are tiny.
- Plenty of platforms give the picture many lines and the fighters get lost against the green.

## 6. Boss Rush (Announcer, 4 fighters: Pencil, Bow, Firey, Leafy)
- 11-bossrush-boss-1-intro.png: the Announcer's arena with the boss bar ("679 HP") at the top, fighters bunched at the floor.
- 11-bossrush-announcer-attack-1.png: during the Announcer's balloon attack (a handful of projectiles in the air).
- 11-bossrush-announcer-attack-2.png: a later moment of the same fight: boss at 24 HP, Firey flung up, a water ring around Bow, a flame shot passing, a long black line at the right.
What I saw:
- The boss health bar is large, centered and clear.
- It is hard to see which object is the boss and which is a prop in the intro: a white card with a black circle sits next to the fighters.
- The attack frame is busy: fireballs, ring effects and projectiles overlap and a fighter's name tag sits over another's.

## 7. Crowded match with items (6 fighters: Pencil, Bow, Firey, Leafy, Pillow, Lightning; items on lots)
- 12-crowded-items-1.png: five pickups spawned with the game's own spawnItem() after 240 steps: wooden crates, Yoyleberries, a spiked ball, a floppy-disk-like prop; Leafy in a bubble.
- 12-crowded-items-2.png: a later moment with five items still on the field.
What I saw:
- Crates and yoyleberries are easy to spot and the glow helps.
- With six fighters and five items the stage fills and some objects (a spiked ball, a disk) read as hazards, not pickups.
- Items hang in mid-air over the platforms and the fighters rarely reach them (none were picked up in several hundred steps).

## 8. Results screen
- 14-results-screen.png: results after a Goiky FFA won by Pencil (1st), then Leafy, Firey, Bow, with "NEW FIGHTER UNLOCKED: Pin!" banner, replay box, Rematch / Change fighter / Title / Share buttons. DOM re-render, 1100x1078 (the whole scrolled page).
What I saw:
- The results table is clear (place, fighter, KOs and falls, a wins-to-losses bar).
- The gold unlock banner is the loudest thing on the page, louder than the winner.
- The page scrolls below the first screen: the replay box and the buttons are off the first view at 720 px high.
