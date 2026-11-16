# kid-masher-02

**Profile.** kid-masher-02: kid (9), first-time; goal: win by button mashing; mashes every button; button-checker: presses every key to see what it does.
**Hands.** reaction 407 ms (SD 61), key timing jitter 3.37 frames, slipped presses 13%, double-tap 35%, short hop 35%, 60 fps input, 2.45 s per menu target, 438 ms per word read (reads 6% of a screen).
**Keys.** arrows. **Patience.** menus 52 s, confused 17 s on one screen, rage-quits after 3 losses in a row.
**Plan.** ffa, menus, tutorial, running (x passes).

## What they did
- running (seed 174068070): lost:fell; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 174068070 --arg persona=kid-masher-02`
- running (seed 183190519): lost:hit; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 183190519 --arg persona=kid-masher-02`
- tutorial (seed 747008181): complete; menus took them about 16 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 747008181 --arg persona=kid-masher-02`
- tutorial (seed 868286434): complete; menus took them about 16 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 868286434 --arg persona=kid-masher-02`
- ffa (seed 201016322): ended; 100 s of game on ice, dealt 464, took 133, RIGHT@15% by Tree, RIGHT@114% by Pencil; menus took them about 38 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 201016322 --arg persona=kid-masher-02 --arg fighter=Taco --arg stage=ice --arg kind=ffa`
- ffa (seed 322585155): cap; 180 s of game on yoyle, dealt 153, took 3, RIGHT@0% fell, BOTTOM@0% fell; menus took them about 38 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 322585155 --arg persona=kid-masher-02 --arg fighter=Pin --arg stage=yoyle --arg kind=ffa`
- ffa (seed 378373494): ended; 133 s of game on pillars, dealt 721, took 232, LEFT@72% by Teardrop; menus took them about 38 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 378373494 --arg persona=kid-masher-02 --arg fighter=Lollipop --arg stage=pillars --arg kind=ffa`
- menus (seed 44054385): menus; menus took them about 322 s and 63 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 44054385 --arg persona=kid-masher-02`
- menus (seed 22555637): menus; menus took them about 328 s and 66 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 22555637 --arg persona=kid-masher-02`
- menus (seed 87780738): menus; menus took them about 1265 s and 264 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 87780738 --arg persona=kid-masher-02`
- menus (seed 84052256): menus; menus took them about 329 s and 64 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 84052256 --arg persona=kid-masher-02`
- tutorial (seed 59774694): complete; menus took them about 16 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 59774694 --arg persona=kid-masher-02`
- menus (seed 968658991): menus; menus took them about 1249 s and 262 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 968658991 --arg persona=kid-masher-02`
- tutorial (seed 312440153): complete; menus took them about 16 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 312440153 --arg persona=kid-masher-02`
- running (seed 402707423): lost:fell; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 402707423 --arg persona=kid-masher-02`
- ffa (seed 542764155): ended; 91 s of game on goiky, dealt 302, took 129, BOTTOM@31% by Nickel, BOTTOM@74% by Nickel; menus took them about 38 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 542764155 --arg persona=kid-masher-02 --arg fighter=MeTag --arg stage=goiky --arg kind=ffa`
- tutorial (seed 377074529): left; menus took them about 16 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 377074529 --arg persona=kid-masher-02`
- running (seed 495006693): lost:fell; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 495006693 --arg persona=kid-masher-02`
- ffa (seed 236593886): ended; 132 s of game on skytower, dealt 111, took 0, BOTTOM@0% fell, BOTTOM@0% fell; menus took them about 45 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 236593886 --arg persona=kid-masher-02 --arg fighter=Taco --arg stage=skytower --arg kind=ffa`
- running (seed 164518038): lost:fell; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 164518038 --arg persona=kid-masher-02`

## Where they got stuck or confused
- BUG cant: How to Play, step 8 ("Press V once to SMASH"): a player following the card's instruction could not finish it in 22 s
- running: was knocked out 2 s into the match (BOTTOM at 0%)
- ffa: was knocked out 11 s into the match (RIGHT at 15%)
- ffa: 6 presses slipped (a person's missed keys)
- ffa: was knocked out 14 s into the match (RIGHT at 0%)
- ffa: 5 presses slipped (a person's missed keys)
- ffa: 19 presses slipped (a person's missed keys)
- menus: spent 29 s on screen "title" (limit 17 s before they would leave confused or bored)
- menus: spent 39 s on screen "options" (limit 17 s before they would leave confused or bored)
- menus: spent 55 s on screen "controls" (limit 17 s before they would leave confused or bored)
- menus: spent 45 s on screen "stats" (limit 17 s before they would leave confused or bored)
- menus: spent 35 s on screen "learn" (limit 17 s before they would leave confused or bored)
- menus: spent 75 s on screen "tutorial" (limit 17 s before they would leave confused or bored)
- menus: spent 47 s on screen "test" (limit 17 s before they would leave confused or bored)
- menus: spent 42 s on screen "changelog" (limit 17 s before they would leave confused or bored)
- menus: spent 28 s on screen "vault" (limit 17 s before they would leave confused or bored)
- menus: spent 46 s on screen "quests" (limit 17 s before they would leave confused or bored)
- menus: spent 50 s on screen "store" (limit 17 s before they would leave confused or bored)
- menus: spent 36 s on screen "wardrobe" (limit 17 s before they would leave confused or bored)
- menus: spent 37 s on screen "tourneySetup" (limit 17 s before they would leave confused or bored)
- menus: spent 56 s on screen "ctfCupSetup" (limit 17 s before they would leave confused or bored)
- menus: spent 54 s on screen "ctfCupTeams" (limit 17 s before they would leave confused or bored)
- menus: spent 35 s on screen "lobby" (limit 17 s before they would leave confused or bored)
- menus: spent 34 s on screen "editor" (limit 17 s before they would leave confused or bored)
- menus: spent 30 s on screen "select" (limit 17 s before they would leave confused or bored)
- menus: would have quit in the menus: 322 s of clicking and reading (63 clicks, key remap not counted) before the first match; their patience is 52 s
- menus: spent 31 s on screen "title" (limit 17 s before they would leave confused or bored)
- menus: spent 44 s on screen "options" (limit 17 s before they would leave confused or bored)
- menus: spent 44 s on screen "stats" (limit 17 s before they would leave confused or bored)
- menus: spent 76 s on screen "tutorial" (limit 17 s before they would leave confused or bored)
- menus: spent 25 s on screen "vault" (limit 17 s before they would leave confused or bored)
- menus: spent 39 s on screen "quests" (limit 17 s before they would leave confused or bored)
- menus: spent 55 s on screen "wardrobe" (limit 17 s before they would leave confused or bored)
- menus: spent 36 s on screen "tourneySetup" (limit 17 s before they would leave confused or bored)
- menus: spent 53 s on screen "ctfCupSetup" (limit 17 s before they would leave confused or bored)
- menus: spent 52 s on screen "ctfCupTeams" (limit 17 s before they would leave confused or bored)
- menus: would have quit in the menus: 328 s of clicking and reading (66 clicks, key remap not counted) before the first match; their patience is 52 s
- menus: spent 22 s on screen "title" (limit 17 s before they would leave confused or bored)
- menus: spent 42 s on screen "options" (limit 17 s before they would leave confused or bored)
- menus: spent 30 s on screen "learn" (limit 17 s before they would leave confused or bored)
- menus: spent 38 s on screen "quests" (limit 17 s before they would leave confused or bored)
- menus: spent 53 s on screen "ctfCupTeams" (limit 17 s before they would leave confused or bored)
- menus: spent 38 s on screen "lobby" (limit 17 s before they would leave confused or bored)
- menus: spent 54 s on screen "options" (limit 17 s before they would leave confused or bored)
- menus: spent 43 s on screen "changelog" (limit 17 s before they would leave confused or bored)
- menus: spent 54 s on screen "wardrobe" (limit 17 s before they would leave confused or bored)
- menus: spent 34 s on screen "tourneySetup" (limit 17 s before they would leave confused or bored)
- menus: spent 36 s on screen "editor" (limit 17 s before they would leave confused or bored)
- menus: would have quit in the menus: 329 s of clicking and reading (64 clicks, key remap not counted) before the first match; their patience is 52 s
- menus: spent 26 s on screen "title" (limit 17 s before they would leave confused or bored)
- menus: spent 39 s on screen "wardrobe" (limit 17 s before they would leave confused or bored)
- running: was knocked out 3 s into the match (BOTTOM at 0%)
- ffa: was knocked out 12 s into the match (BOTTOM at 31%)
- ffa: 4 presses slipped (a person's missed keys)
- ffa: was knocked out 4 s into the match (BOTTOM at 0%)
- ffa: 2 presses slipped (a person's missed keys)

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
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage ice) (in 2 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 2 scenes)
- [SLOW] jank-spike (JANK): a 47 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.1) in ffa; recent move: Firey|ember.special
- [SLOW] jank-spike (JANK): a 48 ms frame (median 0.1) in ffa; recent move: Firey|ember.smash
- [UI] stray-banner: a match shows "KO'd by Tree − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 75 ms frame (median 0.6) in ffa; recent move: Taco|jawbreaker.smash
- [SLOW] jank-spike (JANK): a 75 ms frame (median 0.6) in ffa; recent move: Pin|pierce.jab
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.7) in ffa; recent move: Pin|pierce.smash
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.6) in ffa; recent move: Pin|pierce.ut
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.6) in ffa; recent move: Pin|pierce.da
- [SLOW] jank-spike (JANK): a 92 ms frame (median 0.6) in ffa; recent move: Pin|pierce.fa
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.6) in ffa; recent move: Pin|pierce.ba
- [SLOW] jank-spike (JANK): a 63 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 143 ms frame (median 0.4) in ffa; recent move: Pin|pierce.down
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.6) in ffa; recent move: Pin|pierce.na
- [SLOW] jank-spike (JANK): a 60 ms frame (median 0.2) in ffa; recent move: Gaty|reflect.up
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.2) in ffa; recent move: Tapey|tape.jab
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.3) in ffa; recent move: Tapey|tape.finisher
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.2) in ffa; recent move: Gaty|reflect.ut

## When they would have quit
- menus: would have quit in the menus: 322 s of clicking and reading (63 clicks, key remap not counted) before the first match; their patience is 52 s
- menus: would have quit in the menus: 328 s of clicking and reading (66 clicks, key remap not counted) before the first match; their patience is 52 s
- menus: would have quit in the menus: 329 s of clicking and reading (64 clicks, key remap not counted) before the first match; their patience is 52 s
