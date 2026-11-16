# adult-reader-explorer-01

**Profile.** adult-reader-explorer-01: adult (42), casual; goal: explore every menu and read every card; reads every card; presses Esc everywhere.
**Hands.** reaction 294 ms (SD 64), key timing jitter 2.73 frames, slipped presses 6%, double-tap 55%, short hop 55%, 60 fps input, 0.97 s per menu target, 291 ms per word read (reads 84% of a screen).
**Keys.** arrows. **Patience.** menus 164 s, confused 79 s on one screen, rage-quits after 4 losses in a row.
**Plan.** menus, tutorial, journey, flagcup (x passes).

## What they did
- menus (seed 183679964): menus; menus took them about 5244 s and 257 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 183679964 --arg persona=adult-reader-explorer-01`
- menus (seed 665184461): menus; menus took them about 5196 s and 256 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 665184461 --arg persona=adult-reader-explorer-01`
- menus (seed 285311538): menus; menus took them about 1462 s and 63 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 285311538 --arg persona=adult-reader-explorer-01`
- tutorial (seed 680465936): complete; menus took them about 85 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 680465936 --arg persona=adult-reader-explorer-01`
- tutorial (seed 680639031): complete; menus took them about 85 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 680639031 --arg persona=adult-reader-explorer-01`
- tutorial (seed 998103161): complete; menus took them about 85 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 998103161 --arg persona=adult-reader-explorer-01`
- journey (seed 140611760): journey ffa:4c/126.1s 1v1:4c/65s teams:4c/65s boss:4c/65s ctf:4c/65s training:3c/45.7s tutorial:3c/84.6s worldcup:6c/117.8s flagcup:4c/88.2s; menus took them about 1017 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 140611760 --arg persona=adult-reader-explorer-01`
- journey (seed 259540442): journey ffa:4c/126.1s 1v1:4c/65s teams:4c/65s boss:4c/65s ctf:4c/65s training:3c/45.7s tutorial:3c/84.6s worldcup:6c/117.3s flagcup:4c/88.2s; menus took them about 1016 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 259540442 --arg persona=adult-reader-explorer-01`
- journey (seed 104918886): journey ffa:4c/126.1s 1v1:4c/65s teams:4c/65s boss:4c/65s ctf:4c/65s training:3c/45.7s tutorial:3c/84.6s worldcup:6c/118.8s flagcup:4c/88.2s; menus took them about 1018 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 104918886 --arg persona=adult-reader-explorer-01`
- flagcup (seed 924361100): watched 2, skipped 1; menus took them about 86 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 924361100 --arg persona=adult-reader-explorer-01`
- flagcup (seed 96165298): watched 2, skipped 1; menus took them about 85 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 96165298 --arg persona=adult-reader-explorer-01`
- journey (seed 645481884): journey ffa:4c/126.1s 1v1:4c/65s teams:4c/65s boss:4c/65s ctf:4c/65s training:3c/45.7s tutorial:3c/84.6s worldcup:6c/116.8s flagcup:4c/88.2s; menus took them about 1016 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 645481884 --arg persona=adult-reader-explorer-01`
- tutorial (seed 61130558): complete; menus took them about 85 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 61130558 --arg persona=adult-reader-explorer-01`
- journey (seed 783047765): journey ffa:4c/126.1s 1v1:4c/65s teams:4c/65s boss:4c/65s ctf:4c/65s training:3c/45.7s tutorial:3c/84.6s worldcup:6c/117.8s flagcup:4c/87.7s; menus took them about 1016 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 783047765 --arg persona=adult-reader-explorer-01`
- tutorial (seed 537759437): complete; menus took them about 85 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 537759437 --arg persona=adult-reader-explorer-01`
- menus (seed 290958377): menus; menus took them about 5254 s and 255 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 290958377 --arg persona=adult-reader-explorer-01`
- flagcup (seed 486249327): watched 2, skipped 1; menus took them about 86 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 486249327 --arg persona=adult-reader-explorer-01`
- flagcup (seed 605395360): watched 2, skipped 1; menus took them about 85 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 605395360 --arg persona=adult-reader-explorer-01`
- flagcup (seed 777108054): watched 2, skipped 1; menus took them about 85 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 777108054 --arg persona=adult-reader-explorer-01`
- menus (seed 616683495): menus; menus took them about 5337 s and 257 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 616683495 --arg persona=adult-reader-explorer-01`

## Where they got stuck or confused
- menus: spent 110 s on screen "title" (limit 79 s before they would leave confused or bored)
- menus: spent 221 s on screen "options" (limit 79 s before they would leave confused or bored)
- menus: spent 324 s on screen "controls" (limit 79 s before they would leave confused or bored)
- menus: spent 226 s on screen "stats" (limit 79 s before they would leave confused or bored)
- menus: spent 159 s on screen "learn" (limit 79 s before they would leave confused or bored)
- menus: spent 277 s on screen "tutorial" (limit 79 s before they would leave confused or bored)
- menus: spent 231 s on screen "test" (limit 79 s before they would leave confused or bored)
- menus: spent 281 s on screen "changelog" (limit 79 s before they would leave confused or bored)
- menus: spent 175 s on screen "vault" (limit 79 s before they would leave confused or bored)
- menus: spent 153 s on screen "quests" (limit 79 s before they would leave confused or bored)
- menus: spent 193 s on screen "store" (limit 79 s before they would leave confused or bored)
- menus: spent 243 s on screen "wardrobe" (limit 79 s before they would leave confused or bored)
- menus: spent 199 s on screen "tourneySetup" (limit 79 s before they would leave confused or bored)
- menus: spent 308 s on screen "ctfCupSetup" (limit 79 s before they would leave confused or bored)
- menus: spent 295 s on screen "ctfCupTeams" (limit 79 s before they would leave confused or bored)
- menus: spent 187 s on screen "lobby" (limit 79 s before they would leave confused or bored)
- menus: spent 173 s on screen "editor" (limit 79 s before they would leave confused or bored)
- menus: spent 188 s on screen "select" (limit 79 s before they would leave confused or bored)
- menus: spent 174 s on screen "title" (limit 79 s before they would leave confused or bored)
- menus: spent 220 s on screen "options" (limit 79 s before they would leave confused or bored)
- menus: spent 323 s on screen "controls" (limit 79 s before they would leave confused or bored)
- menus: spent 225 s on screen "stats" (limit 79 s before they would leave confused or bored)
- menus: spent 158 s on screen "learn" (limit 79 s before they would leave confused or bored)
- menus: spent 229 s on screen "test" (limit 79 s before they would leave confused or bored)
- menus: spent 280 s on screen "changelog" (limit 79 s before they would leave confused or bored)
- menus: spent 117 s on screen "vault" (limit 79 s before they would leave confused or bored)
- menus: spent 152 s on screen "quests" (limit 79 s before they would leave confused or bored)
- menus: spent 200 s on screen "wardrobe" (limit 79 s before they would leave confused or bored)
- menus: spent 198 s on screen "tourneySetup" (limit 79 s before they would leave confused or bored)
- menus: spent 177 s on screen "editor" (limit 79 s before they would leave confused or bored)
- menus: spent 187 s on screen "select" (limit 79 s before they would leave confused or bored)
- menus: spent 136 s on screen "title" (limit 79 s before they would leave confused or bored)
- menus: spent 162 s on screen "learn" (limit 79 s before they would leave confused or bored)
- menus: spent 118 s on screen "vault" (limit 79 s before they would leave confused or bored)
- menus: spent 325 s on screen "wardrobe" (limit 79 s before they would leave confused or bored)
- menus: spent 201 s on screen "tourneySetup" (limit 79 s before they would leave confused or bored)
- menus: spent 314 s on screen "ctfCupSetup" (limit 79 s before they would leave confused or bored)
- menus: spent 299 s on screen "ctfCupTeams" (limit 79 s before they would leave confused or bored)
- menus: spent 185 s on screen "lobby" (limit 79 s before they would leave confused or bored)
- menus: spent 172 s on screen "editor" (limit 79 s before they would leave confused or bored)
- menus: would have quit in the menus: 1462 s of clicking and reading (63 clicks, key remap not counted) before the first match; their patience is 164 s
- menus: spent 173 s on screen "title" (limit 79 s before they would leave confused or bored)
- menus: spent 160 s on screen "learn" (limit 79 s before they would leave confused or bored)
- menus: spent 230 s on screen "test" (limit 79 s before they would leave confused or bored)
- menus: spent 244 s on screen "wardrobe" (limit 79 s before they would leave confused or bored)
- menus: spent 188 s on screen "lobby" (limit 79 s before they would leave confused or bored)
- menus: spent 176 s on screen "editor" (limit 79 s before they would leave confused or bored)
- menus: spent 118 s on screen "title" (limit 79 s before they would leave confused or bored)
- menus: spent 222 s on screen "options" (limit 79 s before they would leave confused or bored)
- menus: spent 178 s on screen "editor" (limit 79 s before they would leave confused or bored)

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
- [UI] jank-slow-path (JANK): ffa: about 126 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 5 scenes)
- [UI] jank-slow-path (JANK): 1v1: about 65 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 5 scenes)
- [UI] jank-slow-path (JANK): teams: about 65 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 5 scenes)
- [UI] jank-slow-path (JANK): boss: about 65 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 5 scenes)
- [UI] jank-slow-path (JANK): ctf: about 65 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 5 scenes)
- [UI] jank-slow-path (JANK): tutorial: about 85 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 5 scenes)
- [UI] jank-slow-path (JANK): flagcup: about 88 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/hide (in 5 scenes)
- [FEEL] long-match: ctf match on ctf-castle was still going after 1 min of game time (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/fix (in 3 scenes)
- [UI] jank-slow-path (JANK): worldcup: about 118 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 2 scenes)
- [UI] jank-slow-path (JANK): worldcup: about 117 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 2 scenes)
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 584 ms before the next screen was ready (in 2 scenes)
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4963 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "🎒 Locker" at screen "title" took 267 ms before the next screen was ready
- [UI] jank-dead-button (JANK): on screen "title" the button "📣 Share the game" changed nothing visible on two clicks
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4565 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "🎒 Locker" at screen "title" took 297 ms before the next screen was ready
- [UI] jank-dead-button (JANK): on screen "editor" the button "Clear" changed nothing visible on two clicks
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4570 ms before the next screen was ready

## When they would have quit
- menus: would have quit in the menus: 1462 s of clicking and reading (63 clicks, key remap not counted) before the first match; their patience is 164 s
