# menu-skipper-02

**Profile.** menu-skipper-02: adult (20), casual; goal: start a match as fast as possible; clicks the first big button; never reads.
**Hands.** reaction 297 ms (SD 58), key timing jitter 1.99 frames, slipped presses 8%, double-tap 66%, short hop 53%, 60 fps input, 1.34 s per menu target, 247 ms per word read (reads 0% of a screen).
**Keys.** arrows. **Patience.** menus 28 s, confused 7 s on one screen, rage-quits after 3 losses in a row.
**Plan.** journey, ffa, menus (x passes).

## What they did
- journey (seed 181512455): journey ffa:4c/5.4s 1v1:4c/5.4s teams:4c/5.4s boss:4c/5.4s ctf:4c/5.4s training:3c/4s tutorial:3c/4s worldcup:6c/8s flagcup:4c/5.4s; menus took them about 71 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 181512455 --arg persona=menu-skipper-02`
- journey (seed 97675267): journey ffa:4c/5.4s 1v1:4c/5.4s teams:4c/5.4s boss:4c/5.4s ctf:4c/5.4s training:3c/4s tutorial:3c/4s worldcup:6c/8s flagcup:4c/5.4s; menus took them about 71 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 97675267 --arg persona=menu-skipper-02`
- journey (seed 947623985): journey ffa:4c/5.4s 1v1:4c/5.4s teams:4c/5.4s boss:4c/5.4s ctf:4c/5.4s training:3c/4s tutorial:3c/4s worldcup:6c/8s flagcup:4c/5.4s; menus took them about 71 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 947623985 --arg persona=menu-skipper-02`
- ffa (seed 313942842): ended; 19 s of game on needle, dealt 91, took 3, BOTTOM@3% by Microphone, BOTTOM@0% fell; menus took them about 13 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 313942842 --arg persona=menu-skipper-02 --arg fighter=Roboty --arg stage=needle --arg kind=ffa`
- ffa (seed 602712615): ended; 47 s of game on incin, dealt 373, took 148, LEFT@47% by Snowball, LEFT@76% by Sidewalky; menus took them about 17 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 602712615 --arg persona=menu-skipper-02 --arg fighter=Flower --arg stage=incin --arg kind=ffa`
- menus (seed 213478258): menus; menus took them about 122 s and 78 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 213478258 --arg persona=menu-skipper-02`
- menus (seed 233314271): menus; menus took them about 122 s and 79 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 233314271 --arg persona=menu-skipper-02`
- ffa (seed 285268754): ended; 91 s of game on incin, dealt 194, took 326, LEFT@161% by Yin-Yang, RIGHT@64% by Bot, RIGHT@76% by an assist/hazard; menus took them about 13 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 285268754 --arg persona=menu-skipper-02 --arg fighter=Golf Ball --arg stage=incin --arg kind=ffa`
- menus (seed 21108384): menus; menus took them about 437 s and 293 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 21108384 --arg persona=menu-skipper-02`
- ffa (seed 507484932): ended; 43 s of game on forest, dealt 203, took 388, TOP@216% by an assist/hazard, RIGHT@172% by Lightbulb; menus took them about 13 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 507484932 --arg persona=menu-skipper-02 --arg fighter=Rocky --arg stage=forest --arg kind=ffa`
- journey (seed 948753774): journey ffa:4c/5.4s 1v1:4c/5.4s teams:4c/5.4s boss:4c/5.4s ctf:4c/5.4s training:3c/4s tutorial:3c/4s worldcup:6c/8s flagcup:4c/5.4s; menus took them about 71 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 948753774 --arg persona=menu-skipper-02`
- menus (seed 72289722): menus; menus took them about 117 s and 76 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 72289722 --arg persona=menu-skipper-02`
- menus (seed 79920174): menus; menus took them about 447 s and 299 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 79920174 --arg persona=menu-skipper-02`
- ffa (seed 495871054): cap; 180 s of game on grandplains, dealt 236, took 39, BOTTOM@0% fell, BOTTOM@0% fell, BOTTOM@4% fell; menus took them about 13 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 495871054 --arg persona=menu-skipper-02 --arg fighter=Candle --arg stage=grandplains --arg kind=ffa`
- journey (seed 341941933): journey ffa:4c/5.4s 1v1:4c/5.4s teams:4c/5.4s boss:4c/5.4s ctf:4c/5.4s training:3c/4s tutorial:3c/4s worldcup:6c/8s flagcup:4c/5.4s; menus took them about 71 s and 50 clicks. Repro: `node scripts/playtest.mjs --scene journey --seed 341941933 --arg persona=menu-skipper-02`

## Where they got stuck or confused
- ffa: was knocked out 11 s into the match (BOTTOM at 3%)
- ffa: 2 presses slipped (a person's missed keys)
- ffa: 3 presses slipped (a person's missed keys)
- menus: spent 8 s on screen "title" (limit 7 s before they would leave confused or bored)
- menus: spent 13 s on screen "options" (limit 7 s before they would leave confused or bored)
- menus: spent 21 s on screen "controls" (limit 7 s before they would leave confused or bored)
- menus: spent 22 s on screen "stats" (limit 7 s before they would leave confused or bored)
- menus: spent 11 s on screen "learn" (limit 7 s before they would leave confused or bored)
- menus: spent 15 s on screen "tutorial" (limit 7 s before they would leave confused or bored)
- menus: spent 13 s on screen "test" (limit 7 s before they would leave confused or bored)
- menus: spent 7 s on screen "changelog" (limit 7 s before they would leave confused or bored)
- menus: spent 12 s on screen "vault" (limit 7 s before they would leave confused or bored)
- menus: spent 9 s on screen "quests" (limit 7 s before they would leave confused or bored)
- menus: spent 10 s on screen "store" (limit 7 s before they would leave confused or bored)
- menus: spent 8 s on screen "wardrobe" (limit 7 s before they would leave confused or bored)
- menus: spent 13 s on screen "tourneySetup" (limit 7 s before they would leave confused or bored)
- menus: spent 14 s on screen "ctfCupSetup" (limit 7 s before they would leave confused or bored)
- menus: spent 22 s on screen "ctfCupTeams" (limit 7 s before they would leave confused or bored)
- menus: spent 11 s on screen "lobby" (limit 7 s before they would leave confused or bored)
- menus: spent 13 s on screen "editor" (limit 7 s before they would leave confused or bored)
- menus: spent 11 s on screen "select" (limit 7 s before they would leave confused or bored)
- menus: would have quit in the menus: 122 s of clicking and reading (78 clicks, key remap not counted) before the first match; their patience is 28 s
- menus: spent 9 s on screen "title" (limit 7 s before they would leave confused or bored)
- menus: spent 12 s on screen "options" (limit 7 s before they would leave confused or bored)
- menus: spent 22 s on screen "controls" (limit 7 s before they would leave confused or bored)
- menus: spent 21 s on screen "stats" (limit 7 s before they would leave confused or bored)
- menus: spent 11 s on screen "quests" (limit 7 s before they would leave confused or bored)
- menus: spent 11 s on screen "store" (limit 7 s before they would leave confused or bored)
- menus: spent 9 s on screen "wardrobe" (limit 7 s before they would leave confused or bored)
- menus: spent 15 s on screen "editor" (limit 7 s before they would leave confused or bored)
- menus: spent 8 s on screen "select" (limit 7 s before they would leave confused or bored)
- menus: would have quit in the menus: 122 s of clicking and reading (79 clicks, key remap not counted) before the first match; their patience is 28 s
- ffa: 8 presses slipped (a person's missed keys)
- menus: spent 11 s on screen "options" (limit 7 s before they would leave confused or bored)
- menus: spent 20 s on screen "controls" (limit 7 s before they would leave confused or bored)
- menus: spent 10 s on screen "learn" (limit 7 s before they would leave confused or bored)
- menus: spent 8 s on screen "quests" (limit 7 s before they would leave confused or bored)
- menus: spent 10 s on screen "wardrobe" (limit 7 s before they would leave confused or bored)
- menus: spent 12 s on screen "ctfCupSetup" (limit 7 s before they would leave confused or bored)
- menus: spent 10 s on screen "lobby" (limit 7 s before they would leave confused or bored)
- menus: spent 14 s on screen "editor" (limit 7 s before they would leave confused or bored)
- menus: spent 9 s on screen "select" (limit 7 s before they would leave confused or bored)
- ffa: 7 presses slipped (a person's missed keys)
- menus: spent 9 s on screen "options" (limit 7 s before they would leave confused or bored)
- menus: spent 14 s on screen "learn" (limit 7 s before they would leave confused or bored)
- menus: spent 12 s on screen "quests" (limit 7 s before they would leave confused or bored)
- menus: would have quit in the menus: 117 s of clicking and reading (76 clicks, key remap not counted) before the first match; their patience is 28 s
- menus: spent 12 s on screen "title" (limit 7 s before they would leave confused or bored)
- menus: spent 18 s on screen "stats" (limit 7 s before they would leave confused or bored)
- menus: spent 8 s on screen "changelog" (limit 7 s before they would leave confused or bored)
- menus: spent 12 s on screen "wardrobe" (limit 7 s before they would leave confused or bored)
- menus: spent 13 s on screen "ctfCupSetup" (limit 7 s before they would leave confused or bored)

## What went wrong (everything the playtester noted while they played)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "options" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [UI] phone-wording: screen "controls" says "tap" in: "Sprint (tap while moving) / Shield (hold; the strong fighters get a Re" (a computer game: no phone or touch wording) (in 5 scenes)
- [UI] phone-wording: screen "controls" says "tap" in: "Move · Jump (a quick press is a short hop; Down in the air fast-falls;" (a computer game: no phone or touch wording) (in 5 scenes)
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
- [UI] jank-dead-button (JANK): on screen "controls" the button "Load file…" changed nothing visible on two clicks (in 4 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "stats" although it has a back/close button (a person presses Esc to go back) (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in ffa (in 2 scenes)
- [UI] jank-dead-button (JANK): on screen "stats" the button "📋 Copy my stats" changed nothing visible on two clicks (in 2 scenes)
- [UI] jank-dead-button (JANK): on screen "title" the button "📣 Share the game" changed nothing visible on two clicks (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage grandplains) (in 2 scenes)
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.4) in ffa; recent move: no recent move
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.3) in ffa; recent move: Roboty|antenna.jab
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.2) in ffa; recent move: Roboty|antenna.smash
- [SLOW] jank-spike (JANK): a 51 ms frame (median 0.4) in ffa; recent move: Roboty|antenna.special
- [SLOW] jank-spike (JANK): a 60 ms frame (median 0.5) in ffa; recent move: Microphone|mic.special
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.5) in ffa; recent move: Roboty|antenna.grab
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: Roboty|antenna.na
- [SLOW] jank-spike (JANK): a 44 ms frame (median 0.2) in ffa; recent move: Roboty|antenna.dt
- [SLOW] jank-spike (JANK): a 83 ms frame (median 0.4) in ffa; recent move: Microphone|mic.jab
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.4) in ffa; recent move: Microphone|mic.ua
- [UI] stray-banner: a match shows "KO'd by Microphone − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.5) in ffa; recent move: Roboty|antenna.ut
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.2) in ffa; recent move: Roboty|antenna.up
- [FEEL] jank-input-latency (JANK): Flower: special took 4 frames (67 ms) from the key to the first change on the fighter
- [FEEL] jank-input-latency (JANK): Flower: atk took 6 frames (100 ms) from the key to the first change on the fighter

## When they would have quit
- menus: would have quit in the menus: 122 s of clicking and reading (78 clicks, key remap not counted) before the first match; their patience is 28 s
- menus: would have quit in the menus: 122 s of clicking and reading (79 clicks, key remap not counted) before the first match; their patience is 28 s
- menus: would have quit in the menus: 117 s of clicking and reading (76 clicks, key remap not counted) before the first match; their patience is 28 s
