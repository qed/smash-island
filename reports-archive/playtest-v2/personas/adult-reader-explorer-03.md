# adult-reader-explorer-03

**Profile.** adult-reader-explorer-03: adult (43), casual; goal: explore every menu and read every card; reads every card; presses Esc everywhere.
**Hands.** reaction 285 ms (SD 58), key timing jitter 2.44 frames, slipped presses 7%, double-tap 70%, short hop 58%, 60 fps input, 1.31 s per menu target, 230 ms per word read (reads 76% of a screen).
**Keys.** arrows. **Patience.** menus 162 s, confused 51 s on one screen, rage-quits after 4 losses in a row.
**Plan.** menus, tutorial, journey, flagcup (x passes).

## What they did
- menus (seed 3323166): menus; menus took them about 3743 s and 246 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 3323166 --arg persona=adult-reader-explorer-03`
- menus (seed 226181884): menus; menus took them about 3745 s and 247 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 226181884 --arg persona=adult-reader-explorer-03`
- menus (seed 957729509): menus; menus took them about 3709 s and 245 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 957729509 --arg persona=adult-reader-explorer-03`
- tutorial (seed 198924803): complete; menus took them about 62 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 198924803 --arg persona=adult-reader-explorer-03`
- tutorial (seed 509935985): complete; menus took them about 62 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 509935985 --arg persona=adult-reader-explorer-03`
- tutorial (seed 981957672): complete; menus took them about 62 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 981957672 --arg persona=adult-reader-explorer-03`
- journey (seed 912150975): journey ffa:4c/92.6s 1v1:4c/48.9s teams:4c/48.9s boss:4c/48.9s ctf:4c/48.9s training:3c/34.5s tutorial:3c/62.3s worldcup:6c/87.2s flagcup:4c/65.2s; menus took them about 758 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 912150975 --arg persona=adult-reader-explorer-03`
- journey (seed 813243173): journey ffa:4c/92.6s 1v1:4c/48.9s teams:4c/48.9s boss:4c/48.9s ctf:4c/48.9s training:3c/34.5s tutorial:3c/62.3s worldcup:6c/86.9s flagcup:4c/64.8s; menus took them about 757 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 813243173 --arg persona=adult-reader-explorer-03`
- journey (seed 100917170): journey ffa:4c/92.6s 1v1:4c/48.9s teams:4c/48.9s boss:4c/48.9s ctf:4c/48.9s training:3c/34.5s tutorial:3c/62.3s worldcup:6c/86.9s flagcup:4c/64.8s; menus took them about 757 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 100917170 --arg persona=adult-reader-explorer-03`
- flagcup (seed 356673031): watched 2, skipped 1; menus took them about 63 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 356673031 --arg persona=adult-reader-explorer-03`
- journey (seed 828084675): journey ffa:4c/92.6s 1v1:4c/48.9s teams:4c/48.9s boss:4c/48.9s ctf:4c/48.9s training:3c/34.5s tutorial:3c/62.3s worldcup:6c/86.9s flagcup:4c/65.2s; menus took them about 758 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 828084675 --arg persona=adult-reader-explorer-03`
- flagcup (seed 722758312): watched 2, skipped 1; menus took them about 63 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 722758312 --arg persona=adult-reader-explorer-03`
- tutorial (seed 641547193): complete; menus took them about 62 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 641547193 --arg persona=adult-reader-explorer-03`
- journey (seed 835197302): journey ffa:4c/92.6s 1v1:4c/48.9s teams:4c/48.9s boss:4c/48.9s ctf:4c/48.9s training:3c/34.5s tutorial:3c/62.3s worldcup:6c/88.3s flagcup:4c/66.2s; menus took them about 760 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 835197302 --arg persona=adult-reader-explorer-03`
- tutorial (seed 139275603): complete; menus took them about 62 s and 3 clicks. Repro: `node scripts/playtest.mjs --scene tutorial --seed 139275603 --arg persona=adult-reader-explorer-03`
- flagcup (seed 705632386): watched 2, skipped 1; menus took them about 63 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 705632386 --arg persona=adult-reader-explorer-03`
- menus (seed 729810314): menus; menus took them about 3736 s and 244 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 729810314 --arg persona=adult-reader-explorer-03`
- menus (seed 543943111): menus; menus took them about 1038 s and 61 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 543943111 --arg persona=adult-reader-explorer-03`
- flagcup (seed 397018295): watched 2, skipped 1; menus took them about 63 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 397018295 --arg persona=adult-reader-explorer-03`
- flagcup (seed 750597388): watched 2, skipped 1; menus took them about 63 s and 4 clicks. Repro: `node scripts/playtest.mjs --scene flagcup --seed 750597388 --arg persona=adult-reader-explorer-03`

## Where they got stuck or confused
- menus: spent 125 s on screen "title" (limit 51 s before they would leave confused or bored)
- menus: spent 108 s on screen "options" (limit 51 s before they would leave confused or bored)
- menus: spent 237 s on screen "controls" (limit 51 s before they would leave confused or bored)
- menus: spent 167 s on screen "stats" (limit 51 s before they would leave confused or bored)
- menus: spent 117 s on screen "learn" (limit 51 s before they would leave confused or bored)
- menus: spent 202 s on screen "tutorial" (limit 51 s before they would leave confused or bored)
- menus: spent 170 s on screen "test" (limit 51 s before they would leave confused or bored)
- menus: spent 204 s on screen "changelog" (limit 51 s before they would leave confused or bored)
- menus: spent 130 s on screen "vault" (limit 51 s before they would leave confused or bored)
- menus: spent 112 s on screen "quests" (limit 51 s before they would leave confused or bored)
- menus: spent 141 s on screen "store" (limit 51 s before they would leave confused or bored)
- menus: spent 102 s on screen "wardrobe" (limit 51 s before they would leave confused or bored)
- menus: spent 147 s on screen "tourneySetup" (limit 51 s before they would leave confused or bored)
- menus: spent 138 s on screen "ctfCupSetup" (limit 51 s before they would leave confused or bored)
- menus: spent 217 s on screen "ctfCupTeams" (limit 51 s before they would leave confused or bored)
- menus: spent 136 s on screen "lobby" (limit 51 s before they would leave confused or bored)
- menus: spent 128 s on screen "editor" (limit 51 s before they would leave confused or bored)
- menus: spent 137 s on screen "select" (limit 51 s before they would leave confused or bored)
- menus: spent 146 s on screen "tourneySetup" (limit 51 s before they would leave confused or bored)
- menus: spent 139 s on screen "lobby" (limit 51 s before they would leave confused or bored)
- menus: spent 129 s on screen "editor" (limit 51 s before they would leave confused or bored)
- menus: spent 136 s on screen "select" (limit 51 s before they would leave confused or bored)
- menus: spent 131 s on screen "title" (limit 51 s before they would leave confused or bored)
- menus: spent 88 s on screen "vault" (limit 51 s before they would leave confused or bored)
- menus: spent 138 s on screen "lobby" (limit 51 s before they would leave confused or bored)
- menus: spent 160 s on screen "title" (limit 51 s before they would leave confused or bored)
- menus: spent 145 s on screen "tourneySetup" (limit 51 s before they would leave confused or bored)
- menus: spent 105 s on screen "title" (limit 51 s before they would leave confused or bored)
- menus: spent 121 s on screen "learn" (limit 51 s before they would leave confused or bored)
- menus: spent 131 s on screen "editor" (limit 51 s before they would leave confused or bored)
- menus: would have quit in the menus: 1038 s of clicking and reading (61 clicks, key remap not counted) before the first match; their patience is 162 s

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
- [UI] jank-slow-path (JANK): ffa: about 93 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 5 scenes)
- [UI] jank-slow-path (JANK): tutorial: about 62 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 5 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/hide (in 5 scenes)
- [FEEL] long-match: ctf match on ctf-castle was still going after 1 min of game time (in 5 scenes)
- [UI] jank-slow-path (JANK): worldcup: about 87 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 4 scenes)
- [UI] jank-slow-path (JANK): flagcup: about 65 s of a person's clicking and reading from the title to a running match (limit 60 s) (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/fix (in 4 scenes)
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 5956 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4497 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "🎒 Locker" at screen "title" took 477 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 9462 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "Skip" at screen "tutorial" took 532 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 78 ms frame (median 12.6) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 178 ms frame (median 19.0) in ctf/fix; recent move: no recent move
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 718 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 40 ms frame (median 6.7) in ctf/hide; recent move: no recent move
- [SLOW] jank-spike (JANK): a 74 ms frame (median 8.0) in ctf/fix; recent move: no recent move
- [SLOW] jank-spike (JANK): a 49 ms frame (median 6.2) in ctf/play; recent move: no recent move
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ctf/play
- [SLOW] jank-slow-click (JANK): a click on "Sim rest & Continue ▶" at screen "tourneyHub" took 671 ms before the next screen was ready

## When they would have quit
- menus: would have quit in the menus: 1038 s of clicking and reading (61 clicks, key remap not counted) before the first match; their patience is 162 s
