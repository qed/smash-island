# kid-masher-01

**Profile.** kid-masher-01: kid (10), first-time; goal: win by button mashing; mashes every button; button-checker: presses every key to see what it does.
**Hands.** reaction 355 ms (SD 63), key timing jitter 4.34 frames, slipped presses 12%, double-tap 43%, short hop 36%, 60 fps input, 1.98 s per menu target, 443 ms per word read (reads 6% of a screen).
**Keys.** arrows. **Patience.** menus 78 s, confused 24 s on one screen, rage-quits after 3 losses in a row.
**Plan.** ffa, menus, tutorial, running (x passes).

## What they did
- running (seed 42017784): lost:fell; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 42017784 --arg persona=kid-masher-01`
- running (seed 383302058): lost:hit; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 383302058 --arg persona=kid-masher-01`
- ffa (seed 391937639): ended; 38 s of game on dreamisle, dealt 273, took 238, BOTTOM@147% by ?, BOTTOM@91% by ?; menus took them about 33 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 391937639 --arg persona=kid-masher-01 --arg fighter=Bomb --arg stage=dreamisle --arg kind=ffa`
- tutorial (seed 509546914): complete; menus took them about 15 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 509546914 --arg persona=kid-masher-01`
- tutorial (seed 612339654): complete; menus took them about 15 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 612339654 --arg persona=kid-masher-01`
- ffa (seed 539958520): ended; 148 s of game on dreamisle, dealt 375, took 126, RIGHT@81% by Firey, LEFT@45% by Firey, BOTTOM@0% fell; menus took them about 33 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 539958520 --arg persona=kid-masher-01 --arg fighter=Coiny --arg stage=dreamisle --arg kind=ffa`
- ffa (seed 3651226): ended; 111 s of game on ice, dealt 1006, took 108, BOTTOM@0% fell, BOTTOM@19% by Candle, BOTTOM@89% fell; menus took them about 33 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 3651226 --arg persona=kid-masher-01 --arg fighter=Pencil --arg stage=ice --arg kind=ffa`
- menus (seed 757481875): menus; menus took them about 1266 s and 291 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 757481875 --arg persona=kid-masher-01`
- menus (seed 874690935): menus; menus took them about 1280 s and 288 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 874690935 --arg persona=kid-masher-01`
- menus (seed 326785744): menus; menus took them about 357 s and 73 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 326785744 --arg persona=kid-masher-01`
- tutorial (seed 991493209): complete; menus took them about 15 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 991493209 --arg persona=kid-masher-01`
- running (seed 229327120): lost:fell; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 229327120 --arg persona=kid-masher-01`
- menus (seed 314529130): menus; menus took them about 1280 s and 291 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 314529130 --arg persona=kid-masher-01`
- menus (seed 393641610): menus; menus took them about 318 s and 71 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 393641610 --arg persona=kid-masher-01`
- ffa (seed 33560020): ended; 72 s of game on pillars, dealt 472, took 66, LEFT@37% by Pickle, LEFT@29% by Naily, LEFT@0% fell; menus took them about 33 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 33560020 --arg persona=kid-masher-01 --arg fighter=Flower --arg stage=pillars --arg kind=ffa`
- tutorial (seed 278242108): complete; menus took them about 15 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 278242108 --arg persona=kid-masher-01`
- tutorial (seed 351292661): complete; menus took them about 15 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 351292661 --arg persona=kid-masher-01`
- ffa (seed 556796439): ended; 153 s of game on goiky, dealt 360, took 139, BOTTOM@24% by ?, BOTTOM@8% by ?, BOTTOM@107% by Marshmallow; menus took them about 39 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 556796439 --arg persona=kid-masher-01 --arg fighter=Bomb --arg stage=goiky --arg kind=ffa`
- running (seed 978121319): lost:fell; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 978121319 --arg persona=kid-masher-01`
- running (seed 279990843): lost:fell; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 279990843 --arg persona=kid-masher-01`

## Where they got stuck or confused
- running: was knocked out 2 s into the match (BOTTOM at 0%)
- ffa: 1 presses slipped (a person's missed keys)
- ffa: 6 presses slipped (a person's missed keys)
- ffa: was knocked out 2 s into the match (BOTTOM at 0%)
- ffa: 12 presses slipped (a person's missed keys)
- menus: spent 30 s on screen "title" (limit 24 s before they would leave confused or bored)
- menus: spent 38 s on screen "options" (limit 24 s before they would leave confused or bored)
- menus: spent 52 s on screen "controls" (limit 24 s before they would leave confused or bored)
- menus: spent 40 s on screen "learn" (limit 24 s before they would leave confused or bored)
- menus: spent 71 s on screen "tutorial" (limit 24 s before they would leave confused or bored)
- menus: spent 43 s on screen "test" (limit 24 s before they would leave confused or bored)
- menus: spent 40 s on screen "changelog" (limit 24 s before they would leave confused or bored)
- menus: spent 35 s on screen "vault" (limit 24 s before they would leave confused or bored)
- menus: spent 43 s on screen "quests" (limit 24 s before they would leave confused or bored)
- menus: spent 47 s on screen "store" (limit 24 s before they would leave confused or bored)
- menus: spent 51 s on screen "wardrobe" (limit 24 s before they would leave confused or bored)
- menus: spent 49 s on screen "tourneySetup" (limit 24 s before they would leave confused or bored)
- menus: spent 52 s on screen "ctfCupSetup" (limit 24 s before they would leave confused or bored)
- menus: spent 81 s on screen "ctfCupTeams" (limit 24 s before they would leave confused or bored)
- menus: spent 35 s on screen "lobby" (limit 24 s before they would leave confused or bored)
- menus: spent 46 s on screen "editor" (limit 24 s before they would leave confused or bored)
- menus: spent 38 s on screen "select" (limit 24 s before they would leave confused or bored)
- menus: spent 25 s on screen "title" (limit 24 s before they would leave confused or bored)
- menus: spent 50 s on screen "options" (limit 24 s before they would leave confused or bored)
- menus: spent 41 s on screen "changelog" (limit 24 s before they would leave confused or bored)
- menus: spent 54 s on screen "quests" (limit 24 s before they would leave confused or bored)
- menus: spent 75 s on screen "ctfCupTeams" (limit 24 s before they would leave confused or bored)
- menus: spent 45 s on screen "editor" (limit 24 s before they would leave confused or bored)
- menus: spent 39 s on screen "select" (limit 24 s before they would leave confused or bored)
- menus: spent 44 s on screen "title" (limit 24 s before they would leave confused or bored)
- menus: spent 62 s on screen "stats" (limit 24 s before they would leave confused or bored)
- menus: spent 44 s on screen "learn" (limit 24 s before they would leave confused or bored)
- menus: spent 53 s on screen "quests" (limit 24 s before they would leave confused or bored)
- menus: spent 47 s on screen "tourneySetup" (limit 24 s before they would leave confused or bored)
- menus: spent 32 s on screen "lobby" (limit 24 s before they would leave confused or bored)
- menus: would have quit in the menus: 357 s of clicking and reading (73 clicks, key remap not counted) before the first match; their patience is 78 s
- running: was knocked out 3 s into the match (BOTTOM at 0%)
- menus: spent 41 s on screen "title" (limit 24 s before they would leave confused or bored)
- menus: spent 40 s on screen "options" (limit 24 s before they would leave confused or bored)
- menus: spent 42 s on screen "wardrobe" (limit 24 s before they would leave confused or bored)
- menus: spent 50 s on screen "ctfCupSetup" (limit 24 s before they would leave confused or bored)
- menus: spent 39 s on screen "options" (limit 24 s before they would leave confused or bored)
- menus: spent 66 s on screen "stats" (limit 24 s before they would leave confused or bored)
- menus: spent 53 s on screen "ctfCupSetup" (limit 24 s before they would leave confused or bored)
- menus: spent 49 s on screen "ctfCupTeams" (limit 24 s before they would leave confused or bored)
- menus: would have quit in the menus: 318 s of clicking and reading (71 clicks, key remap not counted) before the first match; their patience is 78 s
- ffa: 7 presses slipped (a person's missed keys)
- ffa: was knocked out 4 s into the match (BOTTOM at 24%)
- ffa: 5 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [UI] phone-wording: screen "tutorial" says "Tap" in: "Tap Z while moving to sprint; hold Z to shield (blocks hits, not grabs" (a computer game: no phone or touch wording) (in 10 scenes)
- [UI] phone-wording: screen "tutorial" says "tap" in: "hold a direction as the hit lands to bend your launch a little (DI); t" (a computer game: no phone or touch wording) (in 10 scenes)
- [UI] phone-wording: screen "changelog" says "Tap" in: "New: SPRINT. Tap Z while you are running on the ground to sprint at 1." (a computer game: no phone or touch wording) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "options" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [UI] phone-wording: screen "controls" says "tap" in: "Sprint (tap while moving) / Shield (hold; the strong fighters get a Re" (a computer game: no phone or touch wording) (in 5 scenes)
- [UI] phone-wording: screen "controls" says "tap" in: "Move · Jump (a quick press is a short hop; Down in the air fast-falls;" (a computer game: no phone or touch wording) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "controls" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
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
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage ice) (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage dreamisle) (in 3 scenes)
- [UI] jank-dead-button (JANK): on screen "stats" the button "🗑 Reset my stats" changed nothing visible on two clicks (in 3 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 2 scenes)
- [UI] jank-dead-button (JANK): on screen "title" the button "📣 Share the game" changed nothing visible on two clicks (in 2 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "stats" although it has a back/close button (a person presses Esc to go back) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 114 ms frame (median 0.4) in ffa; recent move: Bomb|collide.special
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.4) in ffa; recent move: Bomb|collide.fa
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: Bomb|collide.jab
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.3) in ffa; recent move: Bomb|collide.smash
- [SLOW] jank-spike (JANK): a 45 ms frame (median 0.1) in ffa; recent move: Firey|ember.jab
- [SLOW] jank-spike (JANK): a 72 ms frame (median 0.1) in ffa; recent move: Firey|ember.special
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.1) in ffa; recent move: Firey|ember.na
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.1) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.1) in ffa; recent move: Firey|ember.smash
- [SLOW] jank-slow-click (JANK): a click on "Skip" at screen "tutorial" took 336 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.7) in ffa; recent move: Coiny|slap.smash
- [SLOW] jank-spike (JANK): a 48 ms frame (median 0.6) in ffa; recent move: Coiny|slap.jab
- [SLOW] jank-spike (JANK): a 35 ms frame (median 1.0) in ffa; recent move: Lollipop|sucker.dt
- [FEEL] jank-hitstop-drift (JANK): Magnet moved 41 px in one frame while in hitstop (ffa; last move: no move)
- [SLOW] jank-spike (JANK): a 175 ms frame (median 0.7) in ffa; recent move: Coiny|slap.finisher

## When they would have quit
- menus: would have quit in the menus: 357 s of clicking and reading (73 clicks, key remap not counted) before the first match; their patience is 78 s
- menus: would have quit in the menus: 318 s of clicking and reading (71 clicks, key remap not counted) before the first match; their patience is 78 s
