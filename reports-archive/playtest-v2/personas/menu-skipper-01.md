# menu-skipper-01

**Profile.** menu-skipper-01: teen (17), casual; goal: start a match as fast as possible; clicks the first big button; never reads.
**Hands.** reaction 273 ms (SD 48), key timing jitter 2.8 frames, slipped presses 7%, double-tap 72%, short hop 63%, 60 fps input, 0.71 s per menu target, 274 ms per word read (reads 0% of a screen).
**Keys.** arrows. **Patience.** menus 29 s, confused 6 s on one screen, rage-quits after 4 losses in a row.
**Plan.** journey, ffa, menus (x passes).

## What they did
- journey (seed 779670190): journey ffa:4c/2.8s 1v1:4c/2.8s teams:4c/2.8s boss:4c/2.8s ctf:4c/2.8s training:3c/2.1s tutorial:3c/2.1s worldcup:6c/4.3s flagcup:4c/2.8s; menus took them about 39 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 779670190 --arg persona=menu-skipper-01`
- journey (seed 182275648): journey ffa:4c/2.8s 1v1:4c/2.8s teams:4c/2.8s boss:4c/2.8s ctf:4c/2.8s training:3c/2.1s tutorial:3c/2.1s worldcup:6c/4.3s flagcup:4c/2.8s; menus took them about 39 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 182275648 --arg persona=menu-skipper-01`
- journey (seed 446829774): journey ffa:4c/2.8s 1v1:4c/2.8s teams:4c/2.8s boss:4c/2.8s ctf:4c/2.8s training:3c/2.1s tutorial:3c/2.1s worldcup:6c/4.3s flagcup:4c/2.8s; menus took them about 39 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 446829774 --arg persona=menu-skipper-01`
- ffa (seed 979016513): ended; 116 s of game on goiky, dealt 77, took 102, LEFT@39% by Teardrop, BOTTOM@64% by Fern; menus took them about 7 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 979016513 --arg persona=menu-skipper-01 --arg fighter=Paintbrush --arg stage=goiky --arg kind=ffa`
- menus (seed 777792482): menus; menus took them about 74 s and 81 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 777792482 --arg persona=menu-skipper-01`
- menus (seed 492869907): menus; menus took them about 81 s and 88 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 492869907 --arg persona=menu-skipper-01`
- ffa (seed 868611404): cap; 180 s of game on yoyle, dealt 906, took 213, BOTTOM@67% by Pencil, BOTTOM@38% by Pencil; menus took them about 7 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 868611404 --arg persona=menu-skipper-01 --arg fighter=Soap --arg stage=yoyle --arg kind=ffa`
- ffa (seed 69013323): cap; 180 s of game on canyon, dealt 356, took 21, BOTTOM@4% fell, BOTTOM@14% fell; menus took them about 7 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 69013323 --arg persona=menu-skipper-01 --arg fighter=Money --arg stage=canyon --arg kind=ffa`
- menus (seed 662922980): menus; menus took them about 80 s and 86 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 662922980 --arg persona=menu-skipper-01`
- ffa (seed 346067056): cap; 180 s of game on bigincin, dealt 760, took 115, no KOs; menus took them about 9 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 346067056 --arg persona=menu-skipper-01 --arg fighter=Basketball --arg stage=bigincin --arg kind=ffa`
- menus (seed 779086525): menus; menus took them about 286 s and 335 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 779086525 --arg persona=menu-skipper-01`
- ffa (seed 40454348): cap; 180 s of game on bigincin, dealt 442, took 794, MAX@285% by Lollipop, TOP@235% by Lollipop, TOP@259% by Lollipop; menus took them about 9 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 40454348 --arg persona=menu-skipper-01 --arg fighter=Bomby --arg stage=bigincin --arg kind=ffa`
- journey (seed 48494385): journey ffa:4c/2.8s 1v1:4c/2.8s teams:4c/2.8s boss:4c/2.8s ctf:4c/2.8s training:3c/2.1s tutorial:3c/2.1s worldcup:6c/4.3s flagcup:4c/2.8s; menus took them about 39 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 48494385 --arg persona=menu-skipper-01`
- journey (seed 232351598): journey ffa:4c/2.8s 1v1:4c/2.8s teams:4c/2.8s boss:4c/2.8s ctf:4c/2.8s training:3c/2.1s tutorial:3c/2.1s worldcup:6c/4.3s flagcup:4c/2.8s; menus took them about 39 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 232351598 --arg persona=menu-skipper-01`
- menus (seed 799309625): menus; menus took them about 290 s and 339 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 799309625 --arg persona=menu-skipper-01`

## Where they got stuck or confused
- BUG pause: Esc in a running match did not pause it
- STUCK no-exit: screen "select" has no way out: Esc and every button leave it where it is
- BUG cant: Basketball: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG cant: Bomby: "attack (X)" was pressed on a ready fighter and nothing happened for 14 frames
- ffa: was knocked out 12 s into the match (LEFT at 39%)
- ffa: 4 presses slipped (a person's missed keys)
- menus: spent 7 s on screen "title" (limit 6 s before they would leave confused or bored)
- menus: spent 9 s on screen "options" (limit 6 s before they would leave confused or bored)
- menus: spent 12 s on screen "controls" (limit 6 s before they would leave confused or bored)
- menus: spent 9 s on screen "learn" (limit 6 s before they would leave confused or bored)
- menus: spent 12 s on screen "tutorial" (limit 6 s before they would leave confused or bored)
- menus: spent 11 s on screen "test" (limit 6 s before they would leave confused or bored)
- menus: spent 7 s on screen "vault" (limit 6 s before they would leave confused or bored)
- menus: spent 8 s on screen "quests" (limit 6 s before they would leave confused or bored)
- menus: spent 8 s on screen "store" (limit 6 s before they would leave confused or bored)
- menus: spent 9 s on screen "wardrobe" (limit 6 s before they would leave confused or bored)
- menus: spent 11 s on screen "tourneySetup" (limit 6 s before they would leave confused or bored)
- menus: spent 12 s on screen "ctfCupSetup" (limit 6 s before they would leave confused or bored)
- menus: spent 13 s on screen "ctfCupTeams" (limit 6 s before they would leave confused or bored)
- menus: spent 8 s on screen "lobby" (limit 6 s before they would leave confused or bored)
- menus: spent 10 s on screen "editor" (limit 6 s before they would leave confused or bored)
- menus: spent 7 s on screen "select" (limit 6 s before they would leave confused or bored)
- menus: would have quit in the menus: 74 s of clicking and reading (81 clicks, key remap not counted) before the first match; their patience is 29 s
- menus: spent 8 s on screen "title" (limit 6 s before they would leave confused or bored)
- menus: spent 13 s on screen "stats" (limit 6 s before they would leave confused or bored)
- menus: spent 10 s on screen "learn" (limit 6 s before they would leave confused or bored)
- menus: spent 10 s on screen "test" (limit 6 s before they would leave confused or bored)
- menus: spent 6 s on screen "vault" (limit 6 s before they would leave confused or bored)
- menus: spent 9 s on screen "quests" (limit 6 s before they would leave confused or bored)
- menus: spent 9 s on screen "store" (limit 6 s before they would leave confused or bored)
- menus: spent 8 s on screen "tourneySetup" (limit 6 s before they would leave confused or bored)
- menus: spent 11 s on screen "editor" (limit 6 s before they would leave confused or bored)
- menus: spent 8 s on screen "select" (limit 6 s before they would leave confused or bored)
- menus: would have quit in the menus: 81 s of clicking and reading (88 clicks, key remap not counted) before the first match; their patience is 29 s
- ffa: 27 presses slipped (a person's missed keys)
- ffa: 5 presses slipped (a person's missed keys)
- menus: spent 11 s on screen "options" (limit 6 s before they would leave confused or bored)
- menus: spent 8 s on screen "learn" (limit 6 s before they would leave confused or bored)
- menus: spent 10 s on screen "quests" (limit 6 s before they would leave confused or bored)
- menus: spent 10 s on screen "wardrobe" (limit 6 s before they would leave confused or bored)
- menus: spent 12 s on screen "ctfCupTeams" (limit 6 s before they would leave confused or bored)
- menus: spent 8 s on screen "editor" (limit 6 s before they would leave confused or bored)
- menus: would have quit in the menus: 80 s of clicking and reading (86 clicks, key remap not counted) before the first match; their patience is 29 s
- ffa: 23 presses slipped (a person's missed keys)
- menus: spent 8 s on screen "options" (limit 6 s before they would leave confused or bored)
- menus: spent 10 s on screen "tourneySetup" (limit 6 s before they would leave confused or bored)
- menus: spent 9 s on screen "editor" (limit 6 s before they would leave confused or bored)
- ffa: 11 presses slipped (a person's missed keys)
- menus: spent 9 s on screen "title" (limit 6 s before they would leave confused or bored)
- menus: spent 10 s on screen "options" (limit 6 s before they would leave confused or bored)
- menus: spent 10 s on screen "lobby" (limit 6 s before they would leave confused or bored)

## What went wrong (everything the playtester noted while they played)
- [UI] phone-wording: screen "changelog" says "Tap" in: "New: SPRINT. Tap Z while you are running on the ground to sprint at 1." (a computer game: no phone or touch wording) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "options" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [UI] phone-wording: screen "controls" says "tap" in: "Sprint (tap while moving) / Shield (hold; the strong fighters get a Re" (a computer game: no phone or touch wording) (in 5 scenes)
- [UI] phone-wording: screen "controls" says "tap" in: "Move · Jump (a quick press is a short hop; Down in the air fast-falls;" (a computer game: no phone or touch wording) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "controls" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "learn" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [UI] phone-wording: screen "tutorial" says "Tap" in: "Tap Z while moving to sprint; hold Z to shield (blocks hits, not grabs" (a computer game: no phone or touch wording) (in 5 scenes)
- [UI] phone-wording: screen "tutorial" says "tap" in: "hold a direction as the hit lands to bend your launch a little (DI); t" (a computer game: no phone or touch wording) (in 5 scenes)
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
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage yoyle) (in 2 scenes)
- [UI] jank-dead-button (JANK): on screen "options" the button "🔊 Sound: On" changed nothing visible on two clicks (in 2 scenes)
- [SLOW] jank-slow-click (JANK): a click on "🎒 Locker" at screen "title" took 341 ms before the next screen was ready (in 2 scenes)
- [FEEL] long-match: ffa match on bigincin was still going after 3 min of game time (in 2 scenes)
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.6) in ffa; recent move: Marshmallow|wallmart.up
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.5) in ffa; recent move: Paintbrush|fury.smash
- [SLOW] jank-spike (JANK): a 43 ms frame (median 0.5) in ffa; recent move: Teardrop|kick.jab
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.6) in ffa; recent move: Paintbrush|fury.dt
- [UI] stray-banner: a match shows "KO'd by Teardrop − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [FEEL] jank-input-latency (JANK): Paintbrush: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.6) in ffa; recent move: Paintbrush|fury.special
- [SLOW] jank-spike (JANK): a 152 ms frame (median 0.6) in ffa; recent move: Paintbrush|fury.jab
- [SLOW] jank-spike (JANK): a 134 ms frame (median 0.8) in ffa; recent move: Paintbrush|fury.na
- [SLOW] jank-spike (JANK): a 59 ms frame (median 0.6) in ffa; recent move: Cammy|shutter.dt
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.2) in ffa; recent move: Marshmallow|wallmart.jab
- [SLOW] jank-spike (JANK): a 67 ms frame (median 0.2) in ffa; recent move: Fern|photo.jab
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.5) in ffa; recent move: Cammy|shutter.up

## When they would have quit
- menus: would have quit in the menus: 74 s of clicking and reading (81 clicks, key remap not counted) before the first match; their patience is 29 s
- menus: would have quit in the menus: 81 s of clicking and reading (88 clicks, key remap not counted) before the first match; their patience is 29 s
- menus: would have quit in the menus: 80 s of clicking and reading (86 clicks, key remap not counted) before the first match; their patience is 29 s
