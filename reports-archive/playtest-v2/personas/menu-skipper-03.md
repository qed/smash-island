# menu-skipper-03

**Profile.** menu-skipper-03: teen (17), casual; goal: start a match as fast as possible; clicks the first big button; never reads.
**Hands.** reaction 274 ms (SD 42), key timing jitter 2.23 frames, slipped presses 5%, double-tap 78%, short hop 49%, 60 fps input, 0.94 s per menu target, 296 ms per word read (reads 0% of a screen).
**Keys.** arrows. **Patience.** menus 23 s, confused 11 s on one screen, rage-quits after 2 losses in a row.
**Plan.** journey, ffa, menus (x passes).

## What they did
- journey (seed 607044691): journey ffa:4c/3.8s 1v1:4c/3.8s teams:4c/3.8s boss:4c/3.8s ctf:4c/3.8s training:3c/2.8s tutorial:3c/2.8s worldcup:6c/5.6s flagcup:4c/3.8s; menus took them about 51 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 607044691 --arg persona=menu-skipper-03`
- journey (seed 154783125): journey ffa:4c/3.8s 1v1:4c/3.8s teams:4c/3.8s boss:4c/3.8s ctf:4c/3.8s training:3c/2.8s tutorial:3c/2.8s worldcup:6c/5.6s flagcup:4c/3.8s; menus took them about 51 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 154783125 --arg persona=menu-skipper-03`
- journey (seed 496082528): journey ffa:4c/3.8s 1v1:4c/3.8s teams:4c/3.8s boss:4c/3.8s ctf:4c/3.8s training:3c/2.8s tutorial:3c/2.8s worldcup:6c/5.6s flagcup:4c/3.8s; menus took them about 51 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 496082528 --arg persona=menu-skipper-03`
- ffa (seed 560146506): ended; 52 s of game on needle, dealt 303, took 105, BOTTOM@0% fell, BOTTOM@12% by Paintbrush; menus took them about 9 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 560146506 --arg persona=menu-skipper-03 --arg fighter=Yin-Yang --arg stage=needle --arg kind=ffa`
- ffa (seed 189122301): ended; 90 s of game on pillars, dealt 139, took 183, LEFT@96% by Balloony; menus took them about 9 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 189122301 --arg persona=menu-skipper-03 --arg fighter=Golf Ball --arg stage=pillars --arg kind=ffa`
- ffa (seed 216320780): ended; 46 s of game on incin, dealt 440, took 59, no KOs; menus took them about 9 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 216320780 --arg persona=menu-skipper-03 --arg fighter=David --arg stage=incin --arg kind=ffa`
- menus (seed 430223312): menus; menus took them about 105 s and 90 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 430223312 --arg persona=menu-skipper-03`
- menus (seed 592306735): menus; menus took them about 111 s and 96 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 592306735 --arg persona=menu-skipper-03`
- ffa (seed 370962046): ended; 41 s of game on pillars, dealt 282, took 165, RIGHT@128% by Soap; menus took them about 9 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 370962046 --arg persona=menu-skipper-03 --arg fighter=Bomb --arg stage=pillars --arg kind=ffa`
- menus (seed 48615051): menus; menus took them about 112 s and 98 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 48615051 --arg persona=menu-skipper-03`
- journey (seed 28218404): journey ffa:4c/3.8s 1v1:4c/3.8s teams:4c/3.8s boss:4c/3.8s ctf:4c/3.8s training:3c/2.8s tutorial:3c/2.8s worldcup:6c/5.6s flagcup:4c/3.8s; menus took them about 51 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 28218404 --arg persona=menu-skipper-03`
- menus (seed 485445494): menus; menus took them about 119 s and 104 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 485445494 --arg persona=menu-skipper-03`
- menus (seed 542327040): menus; menus took them about 115 s and 100 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 542327040 --arg persona=menu-skipper-03`
- ffa (seed 984387869): ended; 123 s of game on goiky, dealt 225, took 60, RIGHT@15% by Clover, RIGHT@45% by Clover; menus took them about 9 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 984387869 --arg persona=menu-skipper-03 --arg fighter=Leafy --arg stage=goiky --arg kind=ffa`
- journey (seed 516663073): journey ffa:4c/3.8s 1v1:4c/3.8s teams:4c/3.8s boss:4c/3.8s ctf:4c/3.8s training:3c/2.8s tutorial:3c/2.8s worldcup:6c/5.6s flagcup:4c/3.8s; menus took them about 51 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 516663073 --arg persona=menu-skipper-03`

## Where they got stuck or confused
- ffa: was knocked out 10 s into the match (BOTTOM at 0%)
- ffa: 2 presses slipped (a person's missed keys)
- ffa: 10 presses slipped (a person's missed keys)
- menus: spent 13 s on screen "title" (limit 11 s before they would leave confused or bored)
- menus: spent 18 s on screen "options" (limit 11 s before they would leave confused or bored)
- menus: spent 16 s on screen "controls" (limit 11 s before they would leave confused or bored)
- menus: spent 13 s on screen "learn" (limit 11 s before they would leave confused or bored)
- menus: spent 16 s on screen "tutorial" (limit 11 s before they would leave confused or bored)
- menus: spent 18 s on screen "test" (limit 11 s before they would leave confused or bored)
- menus: spent 16 s on screen "quests" (limit 11 s before they would leave confused or bored)
- menus: spent 14 s on screen "store" (limit 11 s before they would leave confused or bored)
- menus: spent 15 s on screen "wardrobe" (limit 11 s before they would leave confused or bored)
- menus: spent 16 s on screen "tourneySetup" (limit 11 s before they would leave confused or bored)
- menus: spent 15 s on screen "ctfCupSetup" (limit 11 s before they would leave confused or bored)
- menus: spent 21 s on screen "ctfCupTeams" (limit 11 s before they would leave confused or bored)
- menus: spent 13 s on screen "lobby" (limit 11 s before they would leave confused or bored)
- menus: spent 15 s on screen "editor" (limit 11 s before they would leave confused or bored)
- menus: spent 14 s on screen "select" (limit 11 s before they would leave confused or bored)
- menus: would have quit in the menus: 105 s of clicking and reading (90 clicks, key remap not counted) before the first match; their patience is 23 s
- menus: spent 15 s on screen "options" (limit 11 s before they would leave confused or bored)
- menus: spent 20 s on screen "controls" (limit 11 s before they would leave confused or bored)
- menus: spent 19 s on screen "stats" (limit 11 s before they would leave confused or bored)
- menus: spent 15 s on screen "learn" (limit 11 s before they would leave confused or bored)
- menus: spent 16 s on screen "wardrobe" (limit 11 s before they would leave confused or bored)
- menus: spent 15 s on screen "tourneySetup" (limit 11 s before they would leave confused or bored)
- menus: spent 14 s on screen "lobby" (limit 11 s before they would leave confused or bored)
- menus: spent 17 s on screen "editor" (limit 11 s before they would leave confused or bored)
- menus: spent 12 s on screen "select" (limit 11 s before they would leave confused or bored)
- menus: would have quit in the menus: 111 s of clicking and reading (96 clicks, key remap not counted) before the first match; their patience is 23 s
- menus: spent 11 s on screen "title" (limit 11 s before they would leave confused or bored)
- menus: spent 21 s on screen "controls" (limit 11 s before they would leave confused or bored)
- menus: spent 15 s on screen "tutorial" (limit 11 s before they would leave confused or bored)
- menus: spent 18 s on screen "quests" (limit 11 s before they would leave confused or bored)
- menus: spent 14 s on screen "wardrobe" (limit 11 s before they would leave confused or bored)
- menus: spent 17 s on screen "tourneySetup" (limit 11 s before they would leave confused or bored)
- menus: spent 19 s on screen "ctfCupSetup" (limit 11 s before they would leave confused or bored)
- menus: spent 22 s on screen "ctfCupTeams" (limit 11 s before they would leave confused or bored)
- menus: would have quit in the menus: 112 s of clicking and reading (98 clicks, key remap not counted) before the first match; their patience is 23 s
- menus: spent 12 s on screen "title" (limit 11 s before they would leave confused or bored)
- menus: spent 16 s on screen "options" (limit 11 s before they would leave confused or bored)
- menus: spent 20 s on screen "stats" (limit 11 s before they would leave confused or bored)
- menus: spent 13 s on screen "wardrobe" (limit 11 s before they would leave confused or bored)
- menus: spent 14 s on screen "tourneySetup" (limit 11 s before they would leave confused or bored)
- menus: spent 14 s on screen "editor" (limit 11 s before they would leave confused or bored)
- menus: would have quit in the menus: 119 s of clicking and reading (104 clicks, key remap not counted) before the first match; their patience is 23 s
- menus: spent 12 s on screen "learn" (limit 11 s before they would leave confused or bored)
- menus: spent 15 s on screen "quests" (limit 11 s before they would leave confused or bored)
- menus: spent 16 s on screen "editor" (limit 11 s before they would leave confused or bored)
- menus: would have quit in the menus: 115 s of clicking and reading (100 clicks, key remap not counted) before the first match; their patience is 23 s
- ffa: was knocked out 6 s into the match (RIGHT at 15%)
- ffa: 5 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [UI] jank-dead-button (JANK): on screen "title" the button "📣 Share the game" changed nothing visible on two clicks (in 5 scenes)
- [UI] phone-wording: screen "controls" says "tap" in: "Sprint (tap while moving) / Shield (hold; the strong fighters get a Re" (a computer game: no phone or touch wording) (in 5 scenes)
- [UI] phone-wording: screen "controls" says "tap" in: "Move · Jump (a quick press is a short hop; Down in the air fast-falls;" (a computer game: no phone or touch wording) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "options" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [UI] jank-dead-button (JANK): on screen "controls" the button "Load file…" changed nothing visible on two clicks (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "controls" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "learn" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [UI] phone-wording: screen "tutorial" says "Tap" in: "Tap Z while moving to sprint; hold Z to shield (blocks hits, not grabs" (a computer game: no phone or touch wording) (in 5 scenes)
- [UI] phone-wording: screen "tutorial" says "tap" in: "hold a direction as the hit lands to bend your launch a little (DI); t" (a computer game: no phone or touch wording) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "tutorial" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "test" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [UI] phone-wording: screen "changelog" says "Tap" in: "New: SPRINT. Tap Z while you are running on the ground to sprint at 1." (a computer game: no phone or touch wording) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "changelog" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "vault" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "quests" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "store" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "wardrobe" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "tourneySetup" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "lobby" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "editor" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "select" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [UI] jank-dead-button (JANK): on screen "stats" the button "🗑 Reset my stats" changed nothing visible on two clicks (in 4 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "stats" although it has a back/close button (a person presses Esc to go back) (in 4 scenes)
- [UI] jank-dead-button (JANK): on screen "editor" the button "Clear" changed nothing visible on two clicks (in 3 scenes)
- [UI] jank-dead-button (JANK): on screen "options" the button "🔊 Sound: On" changed nothing visible on two clicks (in 2 scenes)
- [SLOW] jank-spike (JANK): a 64 ms frame (median 0.5) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.5) in ffa; recent move: Yin-Yang|yinyang.smash
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.4) in ffa; recent move: Yin-Yang|yinyang.jab
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.5) in ffa; recent move: Yin-Yang|yinyang.da
- [FEEL] jank-input-latency (JANK): Yin-Yang: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [UI] stray-banner: a match shows "KO'd by Paintbrush − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ffa; recent move: Paintbrush|fury.jab
- [SLOW] jank-slow-click (JANK): a click on "Skip" at screen "tutorial" took 289 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 50 ms frame (median 0.2) in ffa; recent move: Golf Ball|zapshooter.ua
- [SLOW] jank-spike (JANK): a 55 ms frame (median 0.2) in ffa; recent move: Golf Ball|zapshooter.na
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa
- [SLOW] jank-spike (JANK): a 50 ms frame (median 0.2) in ffa; recent move: Golf Ball|zapshooter.jab
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.2) in ffa; recent move: Golf Ball|zapshooter.dt
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.5) in ffa; recent move: Golf Ball|zapshooter.grab
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.4) in ffa; recent move: Golf Ball|zapshooter.finisher

## When they would have quit
- menus: would have quit in the menus: 105 s of clicking and reading (90 clicks, key remap not counted) before the first match; their patience is 23 s
- menus: would have quit in the menus: 111 s of clicking and reading (96 clicks, key remap not counted) before the first match; their patience is 23 s
- menus: would have quit in the menus: 112 s of clicking and reading (98 clicks, key remap not counted) before the first match; their patience is 23 s
- menus: would have quit in the menus: 119 s of clicking and reading (104 clicks, key remap not counted) before the first match; their patience is 23 s
- menus: would have quit in the menus: 115 s of clicking and reading (100 clicks, key remap not counted) before the first match; their patience is 23 s
