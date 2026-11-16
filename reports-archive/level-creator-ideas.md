# Level Creator: ideas to make it better

You said: "make the level creator better." Three helpers looked at it in three ways. One played it like a first-time builder. One read the code and tested it. One compared it with Smash Stage Builder and Mario Maker. This list puts all three together.

Nothing in the game was changed. This is only a list for you to pick from.

**How I checked:** I looked up every bug in the game's code myself. All of them are real. I dropped 1 small detail I could not confirm: a fighter starting half off the left edge of an empty map. No idea broke your rules. I left out one small part, drawing wind streaks in matches, so matches stay free of drawn signs.

## The editor today

Empty editor, as a new player first sees it:

![Empty editor](level-creator-today-1-empty.png)

A level being built:

![Level being built](level-creator-today-2-built.png)

After Quick map:

![Quick map](level-creator-today-3-quickmap.png)

The Test the Feel screen:

![Test the Feel](level-creator-today-4-testfeel.png)

Scrolled down to the floor and the Save buttons:

![Scrolled down](level-creator-today-5-scrolled-down.png)

---

## Bugs to fix

These are broken now. All of them are recommended.

**1. Tilted platforms don't hold you**
When you rotate a platform, fighters slide right through it after a moment. At the steepest angles they can hardly stand on it at all. Fix: stop the fall when you land on a slope, and only offer angles that can hold someone.
Size: medium. Recommended: yes

**2. Bounce zones throw everyone out at 0%**
Each bounce goes higher than the one before, until the fighter flies off the top. Two CPUs on a bounce zone were both knocked out in about 5 seconds. Fix: make every bounce the same height, like landing on Spongy.
Size: small. Recommended: yes

**3. A fighter placed on a ledge falls through it**
The editor draws the spawn picture with its feet on the spot. The game puts the fighter's middle there. So a fighter you put on a ledge starts inside it and drops to the floor. Fix: start them standing on the spot.
Size: small. Recommended: yes

**4. On Tall and Huge maps you can build outside the map**
The dark strips at the sides are not part of the map, but clicks there still place things. A spawn placed there is knocked out right away. Fix: ignore clicks outside the map, and keep pieces inside its edges.
Size: small. Recommended: yes

**5. After playing your level, normal matches go wrong**
After ▶ Play, your next normal match is a flat, empty arena with your level's name on it. Map size and game mode stay changed too. And if you pick a stadium while your level is waiting, you get your platforms with that stadium's gravity and hazard. Fix: put the old stadium and settings back, and show your level as the stadium while it is waiting.
Size: small. Recommended: yes

**6. The editor picture is stretched sideways**
The drawing box is 31% too wide. Round things look like ovals, and gaps look shorter than they really are. Clicks still land in the right place. Only the picture is wrong. Fix: keep the box the same shape as the game screen.
Size: small. Recommended: yes

**7. The drawing box jumps up and down**
The row with Rotate, Decoration and Effect appears and hides above the box. Each time, the box moves by up to 44 pixels, so your next click can miss. Fix: give that row a fixed height, or move it beside the box.
Size: small. Recommended: yes

**8. Locked fighters show up in the editor**
Spawn pictures and Cameo props can show fighters you have not unlocked. That breaks your new rule. Fix: only use unlocked fighters. A saved level whose cameo is locked again shows a plain crowd shape instead. Prize fighters A, B and C are already hidden the right way.
Size: small. Recommended: yes

**9. ▶ Play ignores how many spawns you placed**
Play always uses the menu's fighter count, which is 5 at first. So on a map with 2 spawns, 5 fighters pile onto 2 spots. A map with no spawns at all still starts. Fix: use the number of spawns you placed, and show "Playing as Firey vs 3 CPUs" on the button. If there are no spawns, show a short note in the editor, never in the match.
Size: small. Recommended: yes

**10. You can't get back to your level after ▶ Play**
The pause menu and the results screen have no "Back to editor" button. "Change fighter" quietly drops your level, so the next match is on a normal stadium. Fix: add "Back to editor" when you came from the editor, and keep your level through "Change fighter".
Size: small. Recommended: yes

**11. Clear, Quick map and Load wipe your work without asking**
One click on Clear, Generate or Load replaces everything, and there is no undo. Generate even renames your level. Fix: ask "Replace your map?" when you have changes you have not saved.
Size: small. Recommended: yes

**12. Saving has hidden problems**
A blank name saves as "Custom", so two unnamed levels overwrite each other. Saving with a name you already used replaces that level without asking. It says "Saved" even when saving failed, and one broken save can wipe all your other levels. Fix: ask for a name, ask before replacing, and check that the save really worked.
Size: small. Recommended: yes

**13. A level can trap fighters forever**
Nothing checks a hand-made level. A wall from floor to sky between two CPUs ran for 5 minutes with no damage and no end. Fix: a "Check my level" step on Save and Play. It warns about walls that cut the map in two, spawns inside blocks or off the map, ledges too high to reach, and bounce zones. The warnings are in the editor, never in the match.
Size: medium. Recommended: yes

**14. Tall and Huge levels show empty space past the edges**
In a match, Tall and Huge custom maps are zoomed out so far that they barely scroll. You can see empty space past both sides, and fighters can stand out there on floor you can't see. The editor's "Zoom in" says it matches the game, but it doesn't for these sizes. Fix: zoom custom maps so the map fills the screen, and make the editor match.
Size: medium. Recommended: yes

**15. CPUs ignore effect zones**
CPUs stand in damage zones, walk into bounce zones, and never use heal zones. They simply can't see zones. Fix: teach CPUs to step out of damage and bounce zones.
Size: medium. Recommended: yes

**16. Wind always blows right**
Wind zones have no direction, so they always push to the right. Fix: add a Left or Right choice for each wind zone, and let Quick map use both.
Size: small. Recommended: yes

**17. Custom matches count in the fighter rankings**
Matches on your own levels are scored in the DWS fighter rankings like normal fights. A trap level can hand out fake big wins. Fix: leave custom-level matches out of the rankings.
Size: small. Recommended: yes

**18. Spawn pictures stay blank**
If a fighter picture finishes loading late, the spawn marker keeps a grey blank shape until you click something. Fix: redraw the editor once each picture loads.
Size: small. Recommended: yes

**19. Scenery can hide effect zones in a match**
The editor draws zones on top of scenery, but the match draws scenery on top of zones. So a tree can cover a damage zone when you play. Ice and wind are also almost the same blue. Fix: draw them in the same order in both places, and give each zone its own color.
Size: small. Recommended: yes

---

## Quick polish

These make the editor easier to use. They are fine under your feature freeze.

**20. Fit the whole editor on one screen**
The editor is about one and a half screens tall. You can't see the tools and the floor at the same time, so you scroll up and down all the time. Fix: put the tools in a slim strip, join some rows, shrink Quick map, and size the drawing box to fit.
Size: medium. Recommended: yes

**21. Undo and Redo**
There is no undo at all. Add Undo and Redo buttons, plus Ctrl+Z and Ctrl+Y. Then any mistake is one key away from fixed. New builders will miss this most.
Size: medium. Recommended: yes

**22. Keep a draft so a reload doesn't lose your work**
Your level only lives in memory. Reload the page or close the tab, and an unsaved level is gone. Fix: keep a draft by itself and offer it back when you open the editor.
Size: small. Recommended: yes

**23. Keyboard shortcuts**
Right now only Space does anything. Add Delete to remove the picked piece, arrows to nudge it, Ctrl+D to copy it, R to rotate, and number keys to pick tools. Each tool button shows its key and a short tip when you point at it.
Size: small. Recommended: yes

**24. Resize pieces after placing them**
A piece stays the size you made it, and a Hop is always the same width. To change it you must erase and redraw. Fix: drag handles on the ends and corners of the picked piece.
Size: medium. Recommended: yes

**25. Drag to erase**
The eraser removes only one thing per click. Let it keep erasing while you hold the button and drag.
Size: small. Recommended: yes

**26. Better scrolling and zoom**
The mouse wheel over the drawing box stops the page from scrolling, so Save is hard to reach. Fix: let the wheel scroll the page when the map doesn't need moving, and let Ctrl+wheel zoom toward the mouse. Also stop the small map in the corner from hiding part of your level.
Size: small. Recommended: yes

**27. Choose the Cameo fighter**
Each Cameo click places a random fighter, and you can't change it. Add a fighter list when a Cameo is picked. It shows unlocked fighters only.
Size: small. Recommended: yes

**28. Nicer saving and saved list**
Save and Delete use browser pop-up boxes. Fix: show a small "Saved" note on the screen instead. Each saved level gets a tiny picture and bigger buttons, and Delete moves away from Play.
Size: small. Recommended: yes

**29. Snap to grid**
Lining up two ledges at the same height is guesswork now. A Snap button (and the G key) makes pieces line up. Faint grid lines show in the editor only, never in a match.
Size: small. Recommended: yes

**30. Clear limits and clear names**
Spawns stop working after 8 with no message, but only 5 fighters can play. Compact maps are the same size as Normal. Platform and Hop don't say how they differ. The help is a long, faint paragraph under the box, and Test the Feel never says which fighter you are. Fix: a "Spawns 5/5" counter, short tips, a one-line hint for the tool you are using, and "Testing as Firey".
Size: small. Recommended: yes

**31. Warn before map size stretches your level**
Switching to Huge stretches every platform and gap about 1.4 times, but fighters and jumps stay the same size. Jumps that worked can stop working. Fix: warn first, or keep sizes the same and add empty space around them.
Size: small. Recommended: yes

**32. Come back at your spawn points**
After a knockout on your level, fighters come back at the top middle, not at the spawns you placed. Fix: bring them back at a free spawn point.
Size: small. Recommended: yes

**33. Dragging off the box drops your piece**
If the mouse leaves the drawing box during a drag, the piece is placed or dropped right there. Fix: keep the drag going outside the box, and move the map when you drag near an edge.
Size: small. Recommended: yes

**34. Pick several pieces at once**
Shift-click or Shift-drag to pick a group, then move, copy or erase it all together. Handy, but less needed than the others.
Size: medium. Recommended: no

---

## Bigger features

These are new things. Under your feature freeze, each one needs your special word before anyone builds it.

**35. Real edges: cliffs and pits**
The game already has real edges on stages like Goiky Field and Yoyleland, but custom levels always get a full floor. A Floor tool would let you cut pits and make floating stages. Getting knocked off and fighting your way back is the heart of a Smash stage.
Size: medium. Recommended: yes

**36. Pick a background theme**
Custom levels always use the plain sky and the Goiky platform look. A Theme list would let you use a real stage's art, like Yoyleland or the Moon. Art only: how the level plays stays the same.
Size: medium. Recommended: yes

**37. Mirror button**
One button copies the left half onto the right, flipped. It's a quick way to make a fair, even stage.
Size: small. Recommended: yes

**38. Test from here**
Hold a key and click to start Test the Feel at that exact spot. Great for checking one hard jump high up on a big map without climbing there each time.
Size: small. Recommended: yes

**39. Play your levels from the normal match setup**
Right now your levels only play from inside the editor. Add "My levels" to the stadium list, so you can set up a match the normal way.
Size: medium. Recommended: yes

**40. Level codes to share**
Copy your level as a short code and send it to a friend. They paste it in and get your level. Codes are checked when pasted, so a broken code can't harm anything.
Size: medium. Recommended: yes

**41. Start from a real stage**
Open one of the game's own one-screen stages in the editor and remix it.
Size: small. Recommended: no

**42. Jump and knockout guides**
Faint marks in the editor, never in a match, show how high a double jump reaches and where the side knockout lanes are. They help you build ledges people can reach. "Check my level" (item 13) covers most of this.
Size: small. Recommended: no

**43. New parts**
Crumbling platforms fall a set time after you stand on them, with no warning marks, and come back later. Conveyor belts carry you sideways. The game also already has springs, updrafts, water and a bouncy platform the editor could offer.
Size: medium. Recommended: no

**44. Moving platforms**
Platforms that glide back and forth along a path. They make a stage feel alive, but they touch physics, CPUs, saving and online play.
Size: big. Recommended: no

**45. Play your level online**
Pick a saved level in the online lobby and play it with friends. This is a big online job. It must be built and tested without ever touching the live relay. Level codes (item 40) should come first.
Size: big. Recommended: no

---

## Questions for you

- Should bosses be allowed as Cameo props, or only unlocked fighters?
- Compact maps are the same as Normal right now. Should Compact be smaller, or go away from the Level Creator?
- Undo (item 21) is listed as polish. Tell us if you think it needs your special word.
