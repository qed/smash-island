# kid-masher-04

**Profile.** kid-masher-04: kid (11), first-time; goal: win by button mashing; mashes every button; button-checker: presses every key to see what it does.
**Hands.** reaction 373 ms (SD 70), key timing jitter 3.52 frames, slipped presses 15%, double-tap 47%, short hop 36%, 60 fps input, 2.49 s per menu target, 580 ms per word read (reads 6% of a screen).
**Keys.** arrows. **Patience.** menus 73 s, confused 28 s on one screen, rage-quits after 2 losses in a row.
**Plan.** ffa, menus, tutorial, running (x passes).

## What they did
- running (seed 616289516): lost:fell; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 616289516 --arg persona=kid-masher-04`
- running (seed 629639549): lost:fell; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 629639549 --arg persona=kid-masher-04`
- ffa (seed 406664864): ended; 14 s of game on needle, dealt 13, took 9, BOTTOM@0% fell, BOTTOM@9% by Ruler; menus took them about 50 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 406664864 --arg persona=kid-masher-04 --arg fighter=Golf Ball --arg stage=needle --arg kind=ffa`
- tutorial (seed 149720520): complete; menus took them about 19 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 149720520 --arg persona=kid-masher-04`
- tutorial (seed 201311842): complete; menus took them about 19 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 201311842 --arg persona=kid-masher-04`
- ffa (seed 44495995): ended; 89 s of game on shift, dealt 507, took 32, BOTTOM@12% by Bracelety, BOTTOM@0% fell, BOTTOM@20% fell; menus took them about 50 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 44495995 --arg persona=kid-masher-04 --arg fighter=Knife --arg stage=shift --arg kind=ffa`
- menus (seed 362992361): menus; menus took them about 1567 s and 280 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 362992361 --arg persona=kid-masher-04`
- menus (seed 425777895): menus; menus took them about 1613 s and 286 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 425777895 --arg persona=kid-masher-04`
- menus (seed 941397286): menus; menus took them about 1621 s and 287 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 941397286 --arg persona=kid-masher-04`
- tutorial (seed 599498457): complete; menus took them about 19 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 599498457 --arg persona=kid-masher-04`
- menus (seed 270435967): menus; menus took them about 1557 s and 281 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 270435967 --arg persona=kid-masher-04`
- ffa (seed 652996283): cap; 180 s of game on skytower, dealt 128, took 45, BOTTOM@0% fell, BOTTOM@0% fell, BOTTOM@45% fell; menus took them about 50 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 652996283 --arg persona=kid-masher-04 --arg fighter=Flower --arg stage=skytower --arg kind=ffa`
- running (seed 543994510): lost:hit; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 543994510 --arg persona=kid-masher-04`
- tutorial (seed 838101247): complete; menus took them about 19 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 838101247 --arg persona=kid-masher-04`
- ffa (seed 28954188): ended; 68 s of game on shift, dealt 404, took 65, BOTTOM@62% fell, BOTTOM@3% fell; menus took them about 50 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 28954188 --arg persona=kid-masher-04 --arg fighter=Sidewalky --arg stage=shift --arg kind=ffa`
- running (seed 727719474): lost:fell; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 727719474 --arg persona=kid-masher-04`
- ffa (seed 343432271): ended; 105 s of game on skytower, dealt 94, took 46, BOTTOM@0% fell, RIGHT@46% by Soap; menus took them about 42 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 343432271 --arg persona=kid-masher-04 --arg fighter=Marker --arg stage=skytower --arg kind=ffa`
- menus (seed 699435947): menus; menus took them about 417 s and 70 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 699435947 --arg persona=kid-masher-04`
- tutorial (seed 338587229): complete; menus took them about 19 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 338587229 --arg persona=kid-masher-04`
- running (seed 45315978): lost:fell; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 45315978 --arg persona=kid-masher-04`

## Where they got stuck or confused
- running: was knocked out 3 s into the match (BOTTOM at 0%)
- running: was knocked out 2 s into the match (BOTTOM at 0%)
- ffa: was knocked out 2 s into the match (BOTTOM at 0%)
- ffa: 11 presses slipped (a person's missed keys)
- menus: spent 36 s on screen "title" (limit 28 s before they would leave confused or bored)
- menus: spent 46 s on screen "options" (limit 28 s before they would leave confused or bored)
- menus: spent 66 s on screen "controls" (limit 28 s before they would leave confused or bored)
- menus: spent 78 s on screen "stats" (limit 28 s before they would leave confused or bored)
- menus: spent 35 s on screen "learn" (limit 28 s before they would leave confused or bored)
- menus: spent 92 s on screen "tutorial" (limit 28 s before they would leave confused or bored)
- menus: spent 55 s on screen "test" (limit 28 s before they would leave confused or bored)
- menus: spent 52 s on screen "changelog" (limit 28 s before they would leave confused or bored)
- menus: spent 44 s on screen "vault" (limit 28 s before they would leave confused or bored)
- menus: spent 69 s on screen "quests" (limit 28 s before they would leave confused or bored)
- menus: spent 61 s on screen "store" (limit 28 s before they would leave confused or bored)
- menus: spent 46 s on screen "wardrobe" (limit 28 s before they would leave confused or bored)
- menus: spent 62 s on screen "tourneySetup" (limit 28 s before they would leave confused or bored)
- menus: spent 71 s on screen "ctfCupSetup" (limit 28 s before they would leave confused or bored)
- menus: spent 62 s on screen "ctfCupTeams" (limit 28 s before they would leave confused or bored)
- menus: spent 45 s on screen "lobby" (limit 28 s before they would leave confused or bored)
- menus: spent 58 s on screen "editor" (limit 28 s before they would leave confused or bored)
- menus: spent 50 s on screen "select" (limit 28 s before they would leave confused or bored)
- menus: spent 48 s on screen "title" (limit 28 s before they would leave confused or bored)
- menus: spent 64 s on screen "options" (limit 28 s before they would leave confused or bored)
- menus: spent 87 s on screen "stats" (limit 28 s before they would leave confused or bored)
- menus: spent 50 s on screen "learn" (limit 28 s before they would leave confused or bored)
- menus: spent 60 s on screen "store" (limit 28 s before they would leave confused or bored)
- menus: spent 66 s on screen "ctfCupSetup" (limit 28 s before they would leave confused or bored)
- menus: spent 42 s on screen "lobby" (limit 28 s before they would leave confused or bored)
- menus: spent 50 s on screen "title" (limit 28 s before they would leave confused or bored)
- menus: spent 57 s on screen "options" (limit 28 s before they would leave confused or bored)
- menus: spent 88 s on screen "stats" (limit 28 s before they would leave confused or bored)
- menus: spent 45 s on screen "vault" (limit 28 s before they would leave confused or bored)
- menus: spent 54 s on screen "wardrobe" (limit 28 s before they would leave confused or bored)
- menus: spent 60 s on screen "tourneySetup" (limit 28 s before they would leave confused or bored)
- menus: spent 57 s on screen "select" (limit 28 s before they would leave confused or bored)
- menus: spent 37 s on screen "title" (limit 28 s before they would leave confused or bored)
- menus: spent 53 s on screen "changelog" (limit 28 s before they would leave confused or bored)
- menus: spent 46 s on screen "quests" (limit 28 s before they would leave confused or bored)
- menus: spent 43 s on screen "wardrobe" (limit 28 s before they would leave confused or bored)
- ffa: 5 presses slipped (a person's missed keys)
- ffa: 8 presses slipped (a person's missed keys)
- ffa: was knocked out 4 s into the match (BOTTOM at 0%)
- menus: spent 32 s on screen "title" (limit 28 s before they would leave confused or bored)
- menus: spent 52 s on screen "options" (limit 28 s before they would leave confused or bored)
- menus: spent 56 s on screen "learn" (limit 28 s before they would leave confused or bored)
- menus: spent 63 s on screen "tourneySetup" (limit 28 s before they would leave confused or bored)
- menus: spent 69 s on screen "ctfCupSetup" (limit 28 s before they would leave confused or bored)
- menus: spent 64 s on screen "ctfCupTeams" (limit 28 s before they would leave confused or bored)
- menus: spent 69 s on screen "editor" (limit 28 s before they would leave confused or bored)
- menus: would have quit in the menus: 417 s of clicking and reading (70 clicks, key remap not counted) before the first match; their patience is 73 s

## What went wrong (everything the playtester noted while they played)
- [UI] phone-wording: screen "tutorial" says "Tap" in: "Tap Z while moving to sprint; hold Z to shield (blocks hits, not grabs" (a computer game: no phone or touch wording) (in 10 scenes)
- [UI] phone-wording: screen "tutorial" says "tap" in: "hold a direction as the hit lands to bend your launch a little (DI); t" (a computer game: no phone or touch wording) (in 10 scenes)
- [UI] phone-wording: screen "changelog" says "Tap" in: "New: SPRINT. Tap Z while you are running on the ground to sprint at 1." (a computer game: no phone or touch wording) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "options" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [UI] phone-wording: screen "controls" says "tap" in: "Sprint (tap while moving) / Shield (hold; the strong fighters get a Re" (a computer game: no phone or touch wording) (in 5 scenes)
- [UI] phone-wording: screen "controls" says "tap" in: "Move · Jump (a quick press is a short hop; Down in the air fast-falls;" (a computer game: no phone or touch wording) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "controls" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "stats" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "learn" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "tutorial" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "test" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "changelog" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "vault" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "quests" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "store" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "wardrobe" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "tourneySetup" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "lobby" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "editor" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "select" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 2 scenes)
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.1) in ffa; recent move: Firey|ember.dt
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.1) in ffa; recent move: Firey|ember.grab
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.1) in ffa; recent move: no recent move
- [UI] stray-banner: a match shows "KO'd by Bracelety − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-teleport (JANK): Bracelety moved 163 px in one frame (ffa; last move: Bracelety|sign.up)
- [FEEL] jank-teleport (JANK): TV moved 166 px in one frame (ffa; last move: TV|static.up)
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.5) in ffa; recent move: TV|static.dt
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 6108 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "🎒 Locker" at screen "title" took 269 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4665 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "🎒 Locker" at screen "title" took 486 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 6909 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.1) in ffa; recent move: Firey|ember.jab
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.1) in ffa; recent move: Firey|ember.smash
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4306 ms before the next screen was ready
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage skytower)
- [FEEL] jank-teleport (JANK): Woody moved 245 px in one frame (ffa; last move: no move)
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.6) in ffa; recent move: Sidewalky|slam.usmash

## When they would have quit
- menus: would have quit in the menus: 417 s of clicking and reading (70 clicks, key remap not counted) before the first match; their patience is 73 s
