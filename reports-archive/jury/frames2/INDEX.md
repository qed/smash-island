# Jury 2 frames (art focus): current local build, artifacts/V1/index.html, 2026-11-04

How these were made: the built-in browser pane (own tab, viewport emulated at 1100x720, device pixel ratio 2), the game served from 127.0.0.1 only, nothing downloaded, game not edited.
- 01 to 12, 24 and 25 are true pane screenshots (JPG, about 800x524 to 800x730; the pane letterboxes the page).
- Every PNG is the game's own canvas, drawn by its own drawView() after its own step() calls, saved with canvas.toDataURL. Full frames are 1100x720; "closeup" frames are a 2x crop of the same canvas.

Honest limits:
- Matches were started with the game's own beginMatchNow() and a chosen lineup, all CPU. To get a hit, a KO, a skin look or a Final Smash on cue, fighters were placed or launched by script, a Smash Ball glow was granted with the game's own fsGrant() and fsTryFire(), and CPU skins were made certain by setting the CPU look share to 100% (the game's own "CPUs wear skins" rule). The drawing, effects and physics after that are the game's.
- The hit moments, the pause menu and the results screen are staged. In 25 the places and the "you win" were set by script, so the KO and fall counts there are not real. The wardrobe shows nothing because this profile owns no skins (0 Win Tokens); skins are shown on bodies in group 5 instead.
- There is NO Final Smash line on the select cards: the Kit and All moves tabs list moves only (checked Firey, Blueberry, Leafy, Pencil, Poppy). So no frame shows one.
- Not captured as asked: an 8-fighter match on one flat stage (Free-for-all is capped at 5; 8 exists only in Teams, so the crowded picture is a 4v4 Teams match on the big Teams map). Goiky Field and Yoyleland are one-screen stages; the scrolling stage is Grand Plains.
- Pane screenshots of the select grid can show a few cards still grey while portraits load (02 only).

## 1. Title, select, store, wardrobe
- 01-title.jpg: title screen (logo, daily match and event cards, "Take the Plunge").
- 02-select-firey-kit.jpg, 03-select-blueberry-kit.jpg, 06-select-leafy-kit.jpg, 07-select-pencil-kit.jpg, 08-select-poppy-kit.jpg: fighter select with the Kit tab for five different fighters.
- 04-select-blueberry-all-moves.jpg: the All moves tab. 05-select-blueberry-skins-tab.jpg: the Skins tab (Default look, Amber Blueberry, Light Blue Blueberry, store prices).
- 09-store-skins-top.jpg, 10-store-skins-costumes-mid.jpg, 11-store-costumes-lower.jpg: the Store: skin cards with thumbnails and Win Token prices, further down the costume-style skins (Backpack Firey, Sunglasses Lightning and so on).
- 12-wardrobe-empty.jpg: the Wardrobe page ("Nothing to wear yet").
What I saw:
- The select grid gives a strong, readable portrait per fighter once loaded; locked fighters are flat grey silhouettes, so about half the grid looks empty. The right-hand panel is a long wall of small text.
- The store cards are tidy and legible (thumbnail, name, "for X", price) but every card has the same weight, so nothing says which skin is the good one. The wardrobe page is mostly blank and gives no preview of a skin on the body.

## 2. Stages at the real match size (fighters on them)
- 13-goiky-ffa-5.png: Goiky Field, 5 fighters, step 240 (Poppy in a hit bubble).
- 14-yoyleland-ffa.png: Yoyleland, 5 fighters (Leafy in a bubble near the gear; white and blue skins visible).
- 22-grandplains-scroll-ffa.png, 22-grandplains-scroll-hit.png: Grand Plains, a scrolling stage, step 300 and the next hit (minimap top right).
- 18-teams-arena-start-4v4.png: the Teams arena, 4v4, a wide scrolling map with many platforms and a minimap; a team ring under every fighter.
What I saw:
- On the one-screen stages the fighters are about 40 px tall in a 1100x720 picture and the stage fills the rest; the nameplates are nearly as large as the bodies.
- Goiky and Grand Plains have a bright sky and green hills that sit close to the green and orange fighters (Leafy, Firey), so contrast is lowest for them; Yoyleland's grey-blue backdrop lets fighters stand out best.
- The Teams arena is a lot of thin platform lines; the fighters are tiny, and the team-coloured rings under their feet are what tells the sides apart.

## 3. Crowded 8-fighter match (Teams 4v4: Firey, Leafy, Blueberry, Pencil, Poppy, Pin, Book, Bomby)
- 19-crowd8-lineup-full.png: all eight in a row on the arena floor.
- 19-crowd8-lineup-closeup.png: a 2x crop of the row (red or blue ring per team).
What I saw:
- The silhouettes are distinct: leaf, pencil, book, bomb and pin each differ at a glance; Firey (orange) and Poppy (yellow and green) are the two that blur into the grass and hills behind them.
- The team rings are the only team cue and they are thin; two fighters of different teams standing close read as one clump.

## 4. Hit sparks and KO effect, close up
- 15-hit-sparks-full-1.png: a hit landing in a 5-fighter Goiky brawl (full frame).
- 15-hit-sparks-closeup-1.png: the same moment, 2x crop (a tiny white spark on Pencil; Leafy wears a witch hat, Firey a backpack).
- 16-ko-flight-a.png: Firey at 185% five steps after a hard hit, a white ring burst and sparks at the contact point.
- 16-ko-ring-full.png: the KO moment, Firey leaving at the right edge: a red and white double ring, debris on the floor.
- 16-ko-ring-closeup.png: the KO ring, 2x crop, with the fighter as a small burst in the middle.
- 16-ko-ring-plus6-closeup.png: six steps later, the ring grown and fading, spokes flying outward.
What I saw:
- The ordinary hit spark is very small next to 40 px fighters; the weight of a hit is carried by the body's squash, not the effect.
- The KO ring is the strongest effect at this size: clean, high contrast, readable at once. It sits at the screen edge, so it can be half cut off.

## 5. Skins and costumes on bodies (CPU look share set to 100%)
- 21-skins-A-full.png: Firey (Backpack Firey), Poppy (Spiky Wig), Fries (Glow), Pin (Robot), Woody (Mech) in a row.
- 21-skins-B-full.png: Blueberry (paint look), Bomby (Bandaged), Starfruit (Star Paint), Paper (Party), Match (Rainbow).
- 21-skin-A-0-Firey.png, 21-skin-A-1-Poppy.png, 21-skin-A-3-Pin.png, 21-skin-B-1-Bomby.png, 21-skin-B-2-Starfruit.png, 21-skin-B-4-Match.png: six single fighters, 2x crop (the crops sit a little low on some fighters).
- Also seen in 13, 14, 15: Amber and light-blue Blueberry, a witch hat on Leafy.
What I saw:
- The skins keep each fighter's silhouette and read clearly at match size; the Spiky Wig is the one that changes the outline most.
- A skin shows much more on a plain white or yellow body (Starfruit, Match) than on dark ones (Bomby, Robot Pin); on dark skins the face is lost.

## 6. Final Smashes (Goiky Field, holder in the middle, three foes close; 2 moments each)
- 20-fs-pillow-1.png, 20-fs-pillow-2.png: Pillow: an open journal with red pincers across a darkened screen, then a tree grown out of its page.
- 20-fs-poppy-1.png, 20-fs-poppy-2.png: Poppy: three mirror-ball Poppy copies on a thin web of lines, a rainbow ring round the holder.
- 20-fs-lightning-1.png, 20-fs-lightning-2.png: Lightning: a dark cloud band, a long bolt, a house and a furnace placed on the stage; later the furnace bursting into shards.
- 20-fs-blueberry-1.png, 20-fs-blueberry-2.png: Blueberry: a purple palanquin with a red seat on a plank; later it lifted up with a rope of cookies and an orange arc.
- 20-fs-gelatin-1.png, 20-fs-gelatin-2.png: Gelatin: a faded screen with a jelly circle round a foe; then his steakhouse set (curtains, neon sign, tables) with a green jelly dome.
- 20-fs-cake-1.png, 20-fs-cake-2.png: Cake: a nested-square frame round the screen, a pan and a cake stand; later a blue burst round a foe and a flung party-coloured shape.
What I saw:
- All six painted, no blank frames. Pillow and Gelatin take the whole screen and read at once; Poppy's, Blueberry's and Cake's are mostly small props at floor level.
- In Blueberry's and Cake's frames it is hard to say which object is the attack; in Lightning's the long bolt is the clear hero and the house and furnace are quiet.

## 7. Boss
- 23-boss-1.png: Boss Rush against the Announcer (704 HP bar), four fighters in the air over a white platform, a mic stand and a hanging block.
- 23-boss-2.png: 240 steps later (672 HP), a dark blue block with a yellow ring among the fighters.
What I saw:
- The big red HP bar with the boss name is clear, and the dark purple arena makes the bright fighters pop.
- The fighters bunch together with overlapping nameplates (Pencil and Leafy overlap) and the boss body is a small part of the picture.

## 8. Pause menu and results
- 24-pause-menu-move-list.jpg: the pause menu with Move list open for Blueberry (Resume, Hide move list, Quit to title; HUD cards top-left). A true pane screenshot.
- 25-results-screen.jpg: results ("YOU WIN!", the winner, the places table with a wins-to-losses bar, replay box, Rematch / Change fighter / Title / Share). Placements staged by script (see limits).
What I saw:
- The move list is a dense wall of small text in a scrolling box; the orange key column is easy to find, the descriptions are not.
- The results screen has a clear order (title, winner, table); the replay box and buttons sit at the bottom edge of the first screen.
