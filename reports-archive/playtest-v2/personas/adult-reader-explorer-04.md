# adult-reader-explorer-04

**Profile.** adult-reader-explorer-04: adult (29), casual; goal: explore every menu and read every card; reads every card; presses Esc everywhere.
**Hands.** reaction 252 ms (SD 52), key timing jitter 2.28 frames, slipped presses 8%, double-tap 68%, short hop 39%, 60 fps input, 1.37 s per menu target, 231 ms per word read (reads 64% of a screen).
**Keys.** arrows. **Patience.** menus 170 s, confused 59 s on one screen, rage-quits after 5 losses in a row.
**Plan.** menus, tutorial, journey, flagcup (x passes).

## What they did
- menus (seed 102138125): menus; menus took them about 3639 s and 266 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 102138125 --arg persona=adult-reader-explorer-04`
- menus (seed 203143013): menus; menus took them about 3642 s and 267 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 203143013 --arg persona=adult-reader-explorer-04`
- menus (seed 238275155): menus; menus took them about 3604 s and 265 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 238275155 --arg persona=adult-reader-explorer-04`
- tutorial (seed 66489912): complete; menus took them about 54 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 66489912 --arg persona=adult-reader-explorer-04`
- tutorial (seed 249495629): complete; menus took them about 54 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 249495629 --arg persona=adult-reader-explorer-04`
- tutorial (seed 865523109): complete; menus took them about 54 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 865523109 --arg persona=adult-reader-explorer-04`
- journey (seed 114727544): journey ffa:4c/79.4s 1v1:4c/42.4s teams:4c/42.4s boss:4c/42.4s ctf:4c/42.4s training:3c/30s tutorial:3c/53.5s worldcup:6c/75.6s flagcup:4c/56.2s; menus took them about 655 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 114727544 --arg persona=adult-reader-explorer-04`
- journey (seed 110066599): journey ffa:4c/79.4s 1v1:4c/42.4s teams:4c/42.4s boss:4c/42.4s ctf:4c/42.4s training:3c/30s tutorial:3c/53.5s worldcup:6c/75s flagcup:4c/56.2s; menus took them about 654 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 110066599 --arg persona=adult-reader-explorer-04`
- journey (seed 287479190): journey ffa:4c/79.4s 1v1:4c/42.4s teams:4c/42.4s boss:4c/42.4s ctf:4c/42.4s training:3c/30s tutorial:3c/53.5s worldcup:6c/75.6s flagcup:4c/55.9s; menus took them about 655 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 287479190 --arg persona=adult-reader-explorer-04`
- flagcup (seed 534307093): watched 2, skipped 1; menus took them about 54 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 534307093 --arg persona=adult-reader-explorer-04`
- journey (seed 343559196): journey ffa:4c/79.4s 1v1:4c/42.4s teams:4c/42.4s boss:4c/42.4s ctf:4c/42.4s training:3c/30s tutorial:3c/53.5s worldcup:6c/75.6s flagcup:4c/55.9s; menus took them about 655 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 343559196 --arg persona=adult-reader-explorer-04`
- tutorial (seed 963184221): complete; menus took them about 54 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 963184221 --arg persona=adult-reader-explorer-04`
- flagcup (seed 629724167): watched 2, skipped 1; menus took them about 54 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 629724167 --arg persona=adult-reader-explorer-04`
- journey (seed 729739642): journey ffa:4c/79.4s 1v1:4c/42.4s teams:4c/42.4s boss:4c/42.4s ctf:4c/42.4s training:3c/30s tutorial:3c/53.5s worldcup:6c/75.9s flagcup:4c/55.9s; menus took them about 655 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 729739642 --arg persona=adult-reader-explorer-04`
- flagcup (seed 243208358): watched 2, skipped 1; menus took them about 55 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 243208358 --arg persona=adult-reader-explorer-04`
- tutorial (seed 330673580): complete; menus took them about 54 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 330673580 --arg persona=adult-reader-explorer-04`
- menus (seed 702285262): menus; menus took them about 3603 s and 265 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 702285262 --arg persona=adult-reader-explorer-04`
- menus (seed 875626407): menus; menus took them about 957 s and 64 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 875626407 --arg persona=adult-reader-explorer-04`
- flagcup (seed 641779377): watched 2, skipped 1; menus took them about 55 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 641779377 --arg persona=adult-reader-explorer-04`
- flagcup (seed 659169035): watched 2, skipped 1; menus took them about 54 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 659169035 --arg persona=adult-reader-explorer-04`

## Where they got stuck or confused
- menus: spent 79 s on screen "title" (limit 59 s before they would leave confused or bored)
- menus: spent 138 s on screen "options" (limit 59 s before they would leave confused or bored)
- menus: spent 203 s on screen "controls" (limit 59 s before they would leave confused or bored)
- menus: spent 144 s on screen "stats" (limit 59 s before they would leave confused or bored)
- menus: spent 144 s on screen "learn" (limit 59 s before they would leave confused or bored)
- menus: spent 293 s on screen "tutorial" (limit 59 s before they would leave confused or bored)
- menus: spent 147 s on screen "test" (limit 59 s before they would leave confused or bored)
- menus: spent 174 s on screen "changelog" (limit 59 s before they would leave confused or bored)
- menus: spent 76 s on screen "vault" (limit 59 s before they would leave confused or bored)
- menus: spent 139 s on screen "quests" (limit 59 s before they would leave confused or bored)
- menus: spent 190 s on screen "store" (limit 59 s before they would leave confused or bored)
- menus: spent 154 s on screen "wardrobe" (limit 59 s before they would leave confused or bored)
- menus: spent 126 s on screen "tourneySetup" (limit 59 s before they would leave confused or bored)
- menus: spent 194 s on screen "ctfCupSetup" (limit 59 s before they would leave confused or bored)
- menus: spent 186 s on screen "ctfCupTeams" (limit 59 s before they would leave confused or bored)
- menus: spent 119 s on screen "lobby" (limit 59 s before they would leave confused or bored)
- menus: spent 112 s on screen "editor" (limit 59 s before they would leave confused or bored)
- menus: spent 117 s on screen "select" (limit 59 s before they would leave confused or bored)
- menus: spent 117 s on screen "title" (limit 59 s before they would leave confused or bored)
- menus: spent 140 s on screen "options" (limit 59 s before they would leave confused or bored)
- menus: spent 100 s on screen "learn" (limit 59 s before they would leave confused or bored)
- menus: spent 113 s on screen "vault" (limit 59 s before they would leave confused or bored)
- menus: spent 126 s on screen "wardrobe" (limit 59 s before they would leave confused or bored)
- menus: spent 110 s on screen "editor" (limit 59 s before they would leave confused or bored)
- menus: spent 116 s on screen "select" (limit 59 s before they would leave confused or bored)
- menus: spent 68 s on screen "title" (limit 59 s before they would leave confused or bored)
- menus: spent 141 s on screen "options" (limit 59 s before they would leave confused or bored)
- menus: spent 145 s on screen "test" (limit 59 s before they would leave confused or bored)
- menus: spent 112 s on screen "vault" (limit 59 s before they would leave confused or bored)
- menus: spent 140 s on screen "quests" (limit 59 s before they would leave confused or bored)
- menus: spent 195 s on screen "ctfCupTeams" (limit 59 s before they would leave confused or bored)
- menus: spent 120 s on screen "lobby" (limit 59 s before they would leave confused or bored)
- menus: spent 90 s on screen "title" (limit 59 s before they would leave confused or bored)
- menus: spent 158 s on screen "quests" (limit 59 s before they would leave confused or bored)
- menus: spent 190 s on screen "ctfCupTeams" (limit 59 s before they would leave confused or bored)
- menus: spent 103 s on screen "title" (limit 59 s before they would leave confused or bored)
- menus: spent 104 s on screen "learn" (limit 59 s before they would leave confused or bored)
- menus: spent 124 s on screen "tourneySetup" (limit 59 s before they would leave confused or bored)
- menus: would have quit in the menus: 957 s of clicking and reading (64 clicks, key remap not counted) before the first match; their patience is 170 s

## What went wrong (everything the playtester noted while they played)
- [UI] phone-wording: screen "tutorial" says "Tap" in: "Tap Z while moving to sprint; hold Z to shield (blocks hits, not grabs" (a computer game: no phone or touch wording) (in 10 scenes)
- [UI] phone-wording: screen "tutorial" says "tap" in: "hold a direction as the hit lands to bend your launch a little (DI); t" (a computer game: no phone or touch wording) (in 10 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "options" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [UI] phone-wording: screen "controls" says "tap" in: "Sprint (tap while moving) / Shield (hold; the strong fighters get a Re" (a computer game: no phone or touch wording) (in 5 scenes)
- [UI] phone-wording: screen "controls" says "tap" in: "Move · Jump (a quick press is a short hop; Down in the air fast-falls;" (a computer game: no phone or touch wording) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "controls" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "stats" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "learn" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
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
- [UI] jank-slow-path (JANK): ffa: about 79 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/hide (in 5 scenes)
- [FEEL] long-match: ctf match on ctf-castle was still going after 1 min of game time (in 5 scenes)
- [UI] jank-slow-path (JANK): worldcup: about 76 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/fix (in 4 scenes)
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 5396 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "🎒 Locker" at screen "title" took 270 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4436 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "🎒 Locker" at screen "title" took 290 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "🎒 Locker" at screen "title" took 394 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 5883 ms before the next screen was ready
- [UI] jank-dead-button (JANK): on screen "options" the button "🔊 Sound: On" changed nothing visible on two clicks
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.2) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.2) in ffa; recent move: Firey|ember.smash
- [SLOW] jank-spike (JANK): a 105 ms frame (median 0.1) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 48 ms frame (median 0.1) in ffa; recent move: Firey|ember.jab
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.1) in ffa; recent move: Firey|ember.special
- [SLOW] jank-spike (JANK): a 53 ms frame (median 0.1) in ffa; recent move: Firey|ember.na
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.1) in ffa; recent move: Firey|ember.grab
- [UI] jank-slow-path (JANK): worldcup: about 75 s of a person's clicking and reading from the title to a running match (limit 60 s)

## When they would have quit
- menus: would have quit in the menus: 957 s of clicking and reading (64 clicks, key remap not counted) before the first match; their patience is 170 s
