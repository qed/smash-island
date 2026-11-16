# kid-masher-03

**Profile.** kid-masher-03: kid (8), first-time; goal: win by button mashing; mashes every button; button-checker: presses every key to see what it does.
**Hands.** reaction 436 ms (SD 74), key timing jitter 3.44 frames, slipped presses 11%, double-tap 52%, short hop 24%, 60 fps input, 1.68 s per menu target, 542 ms per word read (reads 5% of a screen).
**Keys.** arrows. **Patience.** menus 72 s, confused 21 s on one screen, rage-quits after 3 losses in a row.
**Plan.** ffa, menus, tutorial, running (x passes).

## What they did
- running (seed 862015792): lost:hit; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 862015792 --arg persona=kid-masher-03`
- running (seed 762895362): lost:fell; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 762895362 --arg persona=kid-masher-03`
- ffa (seed 804511462): ended; 29 s of game on needle, dealt 103, took 70, BOTTOM@62% fell, BOTTOM@0% fell, BOTTOM@8% by Taco (II); menus took them about 35 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 804511462 --arg persona=kid-masher-03 --arg fighter=Dora --arg stage=needle --arg kind=ffa`
- ffa (seed 2330302): ended; 40 s of game on goiky, dealt 100, took 23, BOTTOM@3% by Knife, BOTTOM@16% by Knife, BOTTOM@0% fell; menus took them about 30 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 2330302 --arg persona=kid-masher-03 --arg fighter=Tennis Ball --arg stage=goiky --arg kind=ffa`
- tutorial (seed 458382092): complete; menus took them about 14 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 458382092 --arg persona=kid-masher-03`
- tutorial (seed 116418398): complete; menus took them about 14 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 116418398 --arg persona=kid-masher-03`
- ffa (seed 233438311): cap; 180 s of game on grandplains, dealt 36, took 0, BOTTOM@0% fell, BOTTOM@0% fell, BOTTOM@0% fell; menus took them about 30 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 233438311 --arg persona=kid-masher-03 --arg fighter=Pencil --arg stage=grandplains --arg kind=ffa`
- menus (seed 19281878): menus; menus took them about 1199 s and 289 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 19281878 --arg persona=kid-masher-03`
- menus (seed 663255660): menus; menus took them about 1131 s and 277 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 663255660 --arg persona=kid-masher-03`
- menus (seed 571885188): menus; menus took them about 1149 s and 283 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 571885188 --arg persona=kid-masher-03`
- tutorial (seed 675317770): complete; menus took them about 14 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 675317770 --arg persona=kid-masher-03`
- menus (seed 91219400): menus; menus took them about 316 s and 71 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 91219400 --arg persona=kid-masher-03`
- tutorial (seed 591166951): complete; menus took them about 14 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 591166951 --arg persona=kid-masher-03`
- running (seed 871542710): lost:fell; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 871542710 --arg persona=kid-masher-03`
- running (seed 985381164): lost:hit; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 985381164 --arg persona=kid-masher-03`
- menus (seed 7736059): menus; menus took them about 1154 s and 284 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 7736059 --arg persona=kid-masher-03`
- ffa (seed 271857477): cap; 180 s of game on dreamisle, dealt 134, took 40, BOTTOM@28% by Flower, BOTTOM@12% by Remote; menus took them about 30 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 271857477 --arg persona=kid-masher-03 --arg fighter=Blocky --arg stage=dreamisle --arg kind=ffa`
- ffa (seed 719325334): ended; 62 s of game on pillars, dealt 314, took 420, RIGHT@183% by Match, RIGHT@65% by Match, RIGHT@171% by Pen; menus took them about 30 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 719325334 --arg persona=kid-masher-03 --arg fighter=Bomb --arg stage=pillars --arg kind=ffa`
- tutorial (seed 924175572): complete; menus took them about 14 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 924175572 --arg persona=kid-masher-03`
- running (seed 110069066): lost:fell; menus took them about 0 s and 0 clicks. Repro: `node scripts/playtest.mjs --scene running --seed 110069066 --arg persona=kid-masher-03`

## Where they got stuck or confused
- running: was knocked out 2 s into the match (BOTTOM at 0%)
- ffa: 3 presses slipped (a person's missed keys)
- ffa: was knocked out 6 s into the match (BOTTOM at 3%)
- ffa: 2 presses slipped (a person's missed keys)
- ffa: was knocked out 14 s into the match (BOTTOM at 0%)
- ffa: 1 presses slipped (a person's missed keys)
- menus: spent 37 s on screen "title" (limit 21 s before they would leave confused or bored)
- menus: spent 43 s on screen "options" (limit 21 s before they would leave confused or bored)
- menus: spent 50 s on screen "controls" (limit 21 s before they would leave confused or bored)
- menus: spent 66 s on screen "stats" (limit 21 s before they would leave confused or bored)
- menus: spent 37 s on screen "learn" (limit 21 s before they would leave confused or bored)
- menus: spent 69 s on screen "tutorial" (limit 21 s before they would leave confused or bored)
- menus: spent 40 s on screen "test" (limit 21 s before they would leave confused or bored)
- menus: spent 40 s on screen "changelog" (limit 21 s before they would leave confused or bored)
- menus: spent 33 s on screen "vault" (limit 21 s before they would leave confused or bored)
- menus: spent 52 s on screen "quests" (limit 21 s before they would leave confused or bored)
- menus: spent 45 s on screen "store" (limit 21 s before they would leave confused or bored)
- menus: spent 40 s on screen "wardrobe" (limit 21 s before they would leave confused or bored)
- menus: spent 46 s on screen "tourneySetup" (limit 21 s before they would leave confused or bored)
- menus: spent 50 s on screen "ctfCupSetup" (limit 21 s before they would leave confused or bored)
- menus: spent 49 s on screen "ctfCupTeams" (limit 21 s before they would leave confused or bored)
- menus: spent 33 s on screen "lobby" (limit 21 s before they would leave confused or bored)
- menus: spent 43 s on screen "editor" (limit 21 s before they would leave confused or bored)
- menus: spent 38 s on screen "select" (limit 21 s before they would leave confused or bored)
- menus: spent 25 s on screen "title" (limit 21 s before they would leave confused or bored)
- menus: spent 37 s on screen "options" (limit 21 s before they would leave confused or bored)
- menus: spent 38 s on screen "learn" (limit 21 s before they would leave confused or bored)
- menus: spent 39 s on screen "changelog" (limit 21 s before they would leave confused or bored)
- menus: spent 34 s on screen "quests" (limit 21 s before they would leave confused or bored)
- menus: spent 46 s on screen "store" (limit 21 s before they would leave confused or bored)
- menus: spent 32 s on screen "wardrobe" (limit 21 s before they would leave confused or bored)
- menus: spent 47 s on screen "ctfCupTeams" (limit 21 s before they would leave confused or bored)
- menus: spent 31 s on screen "lobby" (limit 21 s before they would leave confused or bored)
- menus: spent 37 s on screen "select" (limit 21 s before they would leave confused or bored)
- menus: spent 39 s on screen "title" (limit 21 s before they would leave confused or bored)
- menus: spent 36 s on screen "options" (limit 21 s before they would leave confused or bored)
- menus: spent 34 s on screen "wardrobe" (limit 21 s before they would leave confused or bored)
- menus: spent 47 s on screen "tourneySetup" (limit 21 s before they would leave confused or bored)
- menus: spent 65 s on screen "stats" (limit 21 s before they would leave confused or bored)
- menus: spent 42 s on screen "learn" (limit 21 s before they would leave confused or bored)
- menus: spent 37 s on screen "quests" (limit 21 s before they would leave confused or bored)
- menus: spent 50 s on screen "wardrobe" (limit 21 s before they would leave confused or bored)
- menus: would have quit in the menus: 316 s of clicking and reading (71 clicks, key remap not counted) before the first match; their patience is 72 s
- running: was knocked out 3 s into the match (BOTTOM at 0%)
- menus: spent 40 s on screen "title" (limit 21 s before they would leave confused or bored)
- menus: spent 42 s on screen "options" (limit 21 s before they would leave confused or bored)
- menus: spent 41 s on screen "test" (limit 21 s before they would leave confused or bored)
- menus: spent 32 s on screen "vault" (limit 21 s before they would leave confused or bored)
- menus: spent 42 s on screen "editor" (limit 21 s before they would leave confused or bored)
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
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 3 scenes)
- [UI] jank-dead-button (JANK): on screen "stats" the button "🗑 Reset my stats" changed nothing visible on two clicks (in 3 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "stats" although it has a back/close button (a person presses Esc to go back) (in 2 scenes)
- [UI] jank-dead-button (JANK): on screen "title" the button "📣 Share the game" changed nothing visible on two clicks (in 2 scenes)
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.2) in ffa; recent move: Dora|rant.smash
- [SLOW] jank-spike (JANK): a 221 ms frame (median 0.5) in ffa; recent move: Dora|rant.special
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.6) in ffa; recent move: Dora|rant.dsmash
- [FEEL] jank-teleport (JANK): Yellow Face moved 160 px in one frame (ffa; last move: Yellow Face|buynow.up)
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.5) in ffa; recent move: Dora|rant.jab
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.6) in ffa; recent move: Dora|rant.na
- [SLOW] jank-spike (JANK): a 88 ms frame (median 0.2) in ffa; recent move: Dora|rant.fa
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.5) in ffa; recent move: Dora|rant.ut
- [SLOW] jank-spike (JANK): a 95 ms frame (median 0.5) in ffa; recent move: Balloon|airrel.fa
- [UI] stray-banner: a match shows "KO'd by Taco (II) − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 97 ms frame (median 0.5) in ffa; recent move: Dora|rant.dt
- [SLOW] jank-spike (JANK): a 61 ms frame (median 0.5) in ffa; recent move: Dora|rant.da
- [SLOW] jank-spike (JANK): a 68 ms frame (median 0.4) in ffa; recent move: Dora|rant.up
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.7) in ffa; recent move: Tennis Ball|serve.smash
- [UI] stray-banner: a match shows "KO'd by Knife − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.6) in ffa; recent move: Tennis Ball|serve.fa
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.3) in ffa; recent move: Needle|counter.dt

## When they would have quit
- menus: would have quit in the menus: 316 s of clicking and reading (71 clicks, key remap not counted) before the first match; their patience is 72 s
