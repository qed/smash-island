# adult-reader-explorer-02

**Profile.** adult-reader-explorer-02: adult (41), casual; goal: explore every menu and read every card; reads every card; presses Esc everywhere.
**Hands.** reaction 270 ms (SD 45), key timing jitter 1.83 frames, slipped presses 4%, double-tap 59%, short hop 54%, 60 fps input, 1.18 s per menu target, 235 ms per word read (reads 79% of a screen).
**Keys.** arrows. **Patience.** menus 189 s, confused 63 s on one screen, rage-quits after 6 losses in a row.
**Plan.** menus, tutorial, journey, flagcup (x passes).

## What they did
- menus (seed 451395392): menus; menus took them about 4154 s and 260 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 451395392 --arg persona=adult-reader-explorer-02`
- menus (seed 848945688): menus; menus took them about 4055 s and 251 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 848945688 --arg persona=adult-reader-explorer-02`
- menus (seed 804454389): menus; menus took them about 1170 s and 66 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 804454389 --arg persona=adult-reader-explorer-02`
- tutorial (seed 400750251): complete; menus took them about 66 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 400750251 --arg persona=adult-reader-explorer-02`
- tutorial (seed 344402456): complete; menus took them about 66 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 344402456 --arg persona=adult-reader-explorer-02`
- tutorial (seed 610161660): complete; menus took them about 66 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 610161660 --arg persona=adult-reader-explorer-02`
- journey (seed 950916518): journey ffa:4c/97.5s 1v1:4c/51.1s teams:4c/51.1s boss:4c/51.1s ctf:4c/51.1s training:3c/36s tutorial:3c/65.5s worldcup:6c/92.1s flagcup:4c/69.1s; menus took them about 796 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 950916518 --arg persona=adult-reader-explorer-02`
- journey (seed 756492444): journey ffa:4c/97.5s 1v1:4c/51.1s teams:4c/51.1s boss:4c/51.1s ctf:4c/51.1s training:3c/36s tutorial:3c/65.5s worldcup:6c/92.9s flagcup:4c/68s; menus took them about 795 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 756492444 --arg persona=adult-reader-explorer-02`
- journey (seed 399410487): journey ffa:4c/97.5s 1v1:4c/51.1s teams:4c/51.1s boss:4c/51.1s ctf:4c/51.1s training:3c/36s tutorial:3c/65.5s worldcup:6c/92.5s flagcup:4c/69.1s; menus took them about 796 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 399410487 --arg persona=adult-reader-explorer-02`
- flagcup (seed 324384975): watched 2, skipped 1; menus took them about 66 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 324384975 --arg persona=adult-reader-explorer-02`
- journey (seed 113185338): journey ffa:4c/97.5s 1v1:4c/51.1s teams:4c/51.1s boss:4c/51.1s ctf:4c/51.1s training:3c/36s tutorial:3c/65.5s worldcup:6c/91.7s flagcup:4c/68s; menus took them about 794 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 113185338 --arg persona=adult-reader-explorer-02`
- flagcup (seed 257087619): watched 2, skipped 1; menus took them about 67 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 257087619 --arg persona=adult-reader-explorer-02`
- tutorial (seed 36183266): complete; menus took them about 66 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 36183266 --arg persona=adult-reader-explorer-02`
- journey (seed 618812607): journey ffa:4c/97.5s 1v1:4c/51.1s teams:4c/51.1s boss:4c/51.1s ctf:4c/51.1s training:3c/36s tutorial:3c/65.5s worldcup:6c/91.7s flagcup:4c/68.4s; menus took them about 794 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 618812607 --arg persona=adult-reader-explorer-02`
- tutorial (seed 697448918): complete; menus took them about 66 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 697448918 --arg persona=adult-reader-explorer-02`
- flagcup (seed 928399860): watched 2, skipped 1; menus took them about 66 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 928399860 --arg persona=adult-reader-explorer-02`
- flagcup (seed 267519464): watched 2, skipped 1; menus took them about 67 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 267519464 --arg persona=adult-reader-explorer-02`
- menus (seed 962758730): menus; menus took them about 1144 s and 66 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 962758730 --arg persona=adult-reader-explorer-02`
- flagcup (seed 627762781): watched 2, skipped 1; menus took them about 67 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 627762781 --arg persona=adult-reader-explorer-02`
- menus (seed 133803102): menus; menus took them about 4119 s and 256 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 133803102 --arg persona=adult-reader-explorer-02`

## Where they got stuck or confused
- menus: spent 100 s on screen "title" (limit 63 s before they would leave confused or bored)
- menus: spent 201 s on screen "options" (limit 63 s before they would leave confused or bored)
- menus: spent 250 s on screen "controls" (limit 63 s before they would leave confused or bored)
- menus: spent 177 s on screen "stats" (limit 63 s before they would leave confused or bored)
- menus: spent 124 s on screen "learn" (limit 63 s before they would leave confused or bored)
- menus: spent 213 s on screen "tutorial" (limit 63 s before they would leave confused or bored)
- menus: spent 179 s on screen "test" (limit 63 s before they would leave confused or bored)
- menus: spent 216 s on screen "changelog" (limit 63 s before they would leave confused or bored)
- menus: spent 136 s on screen "vault" (limit 63 s before they would leave confused or bored)
- menus: spent 118 s on screen "quests" (limit 63 s before they would leave confused or bored)
- menus: spent 149 s on screen "store" (limit 63 s before they would leave confused or bored)
- menus: spent 189 s on screen "wardrobe" (limit 63 s before they would leave confused or bored)
- menus: spent 154 s on screen "tourneySetup" (limit 63 s before they would leave confused or bored)
- menus: spent 238 s on screen "ctfCupSetup" (limit 63 s before they would leave confused or bored)
- menus: spent 228 s on screen "ctfCupTeams" (limit 63 s before they would leave confused or bored)
- menus: spent 145 s on screen "lobby" (limit 63 s before they would leave confused or bored)
- menus: spent 136 s on screen "editor" (limit 63 s before they would leave confused or bored)
- menus: spent 144 s on screen "select" (limit 63 s before they would leave confused or bored)
- menus: spent 84 s on screen "title" (limit 63 s before they would leave confused or bored)
- menus: spent 199 s on screen "options" (limit 63 s before they would leave confused or bored)
- menus: spent 176 s on screen "stats" (limit 63 s before they would leave confused or bored)
- menus: spent 92 s on screen "vault" (limit 63 s before they would leave confused or bored)
- menus: spent 155 s on screen "wardrobe" (limit 63 s before they would leave confused or bored)
- menus: spent 155 s on screen "tourneySetup" (limit 63 s before they would leave confused or bored)
- menus: spent 144 s on screen "lobby" (limit 63 s before they would leave confused or bored)
- menus: spent 135 s on screen "editor" (limit 63 s before they would leave confused or bored)
- menus: spent 107 s on screen "title" (limit 63 s before they would leave confused or bored)
- menus: spent 200 s on screen "options" (limit 63 s before they would leave confused or bored)
- menus: spent 249 s on screen "controls" (limit 63 s before they would leave confused or bored)
- menus: spent 126 s on screen "learn" (limit 63 s before they would leave confused or bored)
- menus: spent 137 s on screen "vault" (limit 63 s before they would leave confused or bored)
- menus: spent 250 s on screen "wardrobe" (limit 63 s before they would leave confused or bored)
- menus: spent 264 s on screen "ctfCupSetup" (limit 63 s before they would leave confused or bored)
- menus: spent 146 s on screen "lobby" (limit 63 s before they would leave confused or bored)
- menus: spent 142 s on screen "editor" (limit 63 s before they would leave confused or bored)
- menus: would have quit in the menus: 1170 s of clicking and reading (66 clicks, key remap not counted) before the first match; their patience is 189 s
- menus: spent 112 s on screen "title" (limit 63 s before they would leave confused or bored)
- menus: spent 170 s on screen "options" (limit 63 s before they would leave confused or bored)
- menus: spent 175 s on screen "stats" (limit 63 s before they would leave confused or bored)
- menus: spent 240 s on screen "ctfCupTeams" (limit 63 s before they would leave confused or bored)
- menus: would have quit in the menus: 1144 s of clicking and reading (66 clicks, key remap not counted) before the first match; their patience is 189 s
- menus: spent 132 s on screen "title" (limit 63 s before they would leave confused or bored)
- menus: spent 172 s on screen "options" (limit 63 s before they would leave confused or bored)
- menus: spent 156 s on screen "wardrobe" (limit 63 s before they would leave confused or bored)
- menus: spent 134 s on screen "editor" (limit 63 s before they would leave confused or bored)

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
- [UI] jank-slow-path (JANK): ffa: about 98 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 5 scenes)
- [UI] jank-slow-path (JANK): tutorial: about 66 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/hide (in 5 scenes)
- [FEEL] long-match: ctf match on ctf-castle was still going after 1 min of game time (in 5 scenes)
- [UI] jank-slow-path (JANK): worldcup: about 92 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 3 scenes)
- [UI] jank-slow-path (JANK): flagcup: about 68 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 3 scenes)
- [UI] jank-dead-button (JANK): on screen "title" the button "📣 Share the game" changed nothing visible on two clicks (in 2 scenes)
- [UI] jank-slow-path (JANK): flagcup: about 69 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 2 scenes)
- [UI] jank-slow-path (JANK): worldcup: about 93 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 2 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/fix (in 2 scenes)
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4547 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "🎒 Locker" at screen "title" took 284 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 5049 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4105 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 36 ms frame (median 1.4) in ctf/hide; recent move: no recent move
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 583 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 33 ms frame (median 3.1) in ctf/hide; recent move: no recent move
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 672 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.1) in ffa; recent move: Firey|ember.smash
- [SLOW] jank-spike (JANK): a 91 ms frame (median 2.5) in ctf/hide; recent move: no recent move

## When they would have quit
- menus: would have quit in the menus: 1170 s of clicking and reading (66 clicks, key remap not counted) before the first match; their patience is 189 s
- menus: would have quit in the menus: 1144 s of clicking and reading (66 clicks, key remap not counted) before the first match; their patience is 189 s
