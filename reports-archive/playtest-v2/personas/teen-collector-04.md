# teen-collector-04

**Profile.** teen-collector-04: teen (14), casual; goal: collect tokens and finish quests; opens Locker, Quests, Store, Vault first; reads reward text.
**Hands.** reaction 274 ms (SD 49), key timing jitter 1.85 frames, slipped presses 6%, double-tap 63%, short hop 46%, 60 fps input, 0.73 s per menu target, 249 ms per word read (reads 30% of a screen).
**Keys.** arrows. **Patience.** menus 136 s, confused 44 s on one screen, rage-quits after 6 losses in a row.
**Plan.** menus, ffa, worldcup (x passes).

## What they did
- worldcup (seed 58474241): cup; menus took them about 40 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 58474241 --arg persona=teen-collector-04 --arg size=1 --arg fighter=Teardrop`
- menus (seed 171323545): menus; menus took them about 1990 s and 283 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 171323545 --arg persona=teen-collector-04`
- menus (seed 219233279): menus; menus took them about 2054 s and 282 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 219233279 --arg persona=teen-collector-04`
- menus (seed 30698204): menus; menus took them about 574 s and 75 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 30698204 --arg persona=teen-collector-04`
- worldcup (seed 753684559): cup; menus took them about 45 s and 14 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 753684559 --arg persona=teen-collector-04 --arg size=2 --arg fighter=Firey`
- ffa (seed 256633562): cap; 180 s of game on pillars, dealt 526, took 169, RIGHT@16% by Yellow Face, LEFT@16% by Yellow Face; menus took them about 47 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 256633562 --arg persona=teen-collector-04 --arg fighter=Cake --arg stage=pillars --arg kind=ffa`
- ffa (seed 116413421): ended; 162 s of game on shift, dealt 0, took 13, BOTTOM@13% by Apple, BOTTOM@0% fell; menus took them about 47 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 116413421 --arg persona=teen-collector-04 --arg fighter=Leafy --arg stage=shift --arg kind=ffa`
- ffa (seed 92748878): cap; 180 s of game on fortress, dealt 238, took 113, no KOs; menus took them about 45 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 92748878 --arg persona=teen-collector-04 --arg fighter=Lightning --arg stage=fortress --arg kind=ffa`
- worldcup (seed 574669147): cup; menus took them about 41 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 574669147 --arg persona=teen-collector-04 --arg size=1 --arg fighter=Silver Spoon`
- ffa (seed 297136938): cap; 180 s of game on bigincin, dealt 278, took 159, TOP@50% by Roboty; menus took them about 45 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 297136938 --arg persona=teen-collector-04 --arg fighter=Lightning --arg stage=bigincin --arg kind=ffa`
- ffa (seed 788298011): cap; 180 s of game on fortress, dealt 233, took 42, no KOs; menus took them about 45 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 788298011 --arg persona=teen-collector-04 --arg fighter=Money --arg stage=fortress --arg kind=ffa`
- worldcup (seed 838416690): cup; menus took them about 41 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 838416690 --arg persona=teen-collector-04 --arg size=1 --arg fighter=Puffball`
- worldcup (seed 785515919): cup; menus took them about 40 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 785515919 --arg persona=teen-collector-04 --arg size=1 --arg fighter=Balloony`
- menus (seed 765701680): menus; menus took them about 575 s and 71 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 765701680 --arg persona=teen-collector-04`
- menus (seed 68175874): menus; menus took them about 2032 s and 284 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 68175874 --arg persona=teen-collector-04`

## Where they got stuck or confused
- BUG cant: Cake: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- BUG pause: Esc in a running match did not pause it
- worldcup: 1 presses slipped (a person's missed keys)
- menus: spent 60 s on screen "title" (limit 44 s before they would leave confused or bored)
- menus: spent 71 s on screen "options" (limit 44 s before they would leave confused or bored)
- menus: spent 103 s on screen "controls" (limit 44 s before they would leave confused or bored)
- menus: spent 75 s on screen "learn" (limit 44 s before they would leave confused or bored)
- menus: spent 149 s on screen "tutorial" (limit 44 s before they would leave confused or bored)
- menus: spent 75 s on screen "test" (limit 44 s before they would leave confused or bored)
- menus: spent 88 s on screen "changelog" (limit 44 s before they would leave confused or bored)
- menus: spent 57 s on screen "vault" (limit 44 s before they would leave confused or bored)
- menus: spent 71 s on screen "quests" (limit 44 s before they would leave confused or bored)
- menus: spent 96 s on screen "store" (limit 44 s before they would leave confused or bored)
- menus: spent 64 s on screen "wardrobe" (limit 44 s before they would leave confused or bored)
- menus: spent 91 s on screen "tourneySetup" (limit 44 s before they would leave confused or bored)
- menus: spent 99 s on screen "ctfCupSetup" (limit 44 s before they would leave confused or bored)
- menus: spent 95 s on screen "ctfCupTeams" (limit 44 s before they would leave confused or bored)
- menus: spent 82 s on screen "lobby" (limit 44 s before they would leave confused or bored)
- menus: spent 81 s on screen "editor" (limit 44 s before they would leave confused or bored)
- menus: spent 79 s on screen "select" (limit 44 s before they would leave confused or bored)
- menus: spent 61 s on screen "title" (limit 44 s before they would leave confused or bored)
- menus: spent 70 s on screen "options" (limit 44 s before they would leave confused or bored)
- menus: spent 104 s on screen "controls" (limit 44 s before they would leave confused or bored)
- menus: spent 111 s on screen "stats" (limit 44 s before they would leave confused or bored)
- menus: spent 73 s on screen "learn" (limit 44 s before they would leave confused or bored)
- menus: spent 110 s on screen "quests" (limit 44 s before they would leave confused or bored)
- menus: spent 97 s on screen "store" (limit 44 s before they would leave confused or bored)
- menus: spent 65 s on screen "wardrobe" (limit 44 s before they would leave confused or bored)
- menus: spent 60 s on screen "lobby" (limit 44 s before they would leave confused or bored)
- menus: spent 82 s on screen "editor" (limit 44 s before they would leave confused or bored)
- menus: spent 93 s on screen "select" (limit 44 s before they would leave confused or bored)
- menus: spent 54 s on screen "title" (limit 44 s before they would leave confused or bored)
- menus: spent 84 s on screen "options" (limit 44 s before they would leave confused or bored)
- menus: spent 120 s on screen "stats" (limit 44 s before they would leave confused or bored)
- menus: spent 76 s on screen "learn" (limit 44 s before they would leave confused or bored)
- menus: spent 79 s on screen "wardrobe" (limit 44 s before they would leave confused or bored)
- menus: would have quit in the menus: 574 s of clicking and reading (75 clicks, key remap not counted) before the first match; their patience is 136 s
- ffa: 13 presses slipped (a person's missed keys)
- ffa: was knocked out 2 s into the match (BOTTOM at 13%)
- ffa: 9 presses slipped (a person's missed keys)
- ffa: 5 presses slipped (a person's missed keys)
- ffa: 11 presses slipped (a person's missed keys)
- worldcup: 3 presses slipped (a person's missed keys)
- menus: spent 69 s on screen "title" (limit 44 s before they would leave confused or bored)
- menus: spent 99 s on screen "options" (limit 44 s before they would leave confused or bored)
- menus: spent 112 s on screen "stats" (limit 44 s before they would leave confused or bored)
- menus: spent 89 s on screen "changelog" (limit 44 s before they would leave confused or bored)
- menus: spent 81 s on screen "quests" (limit 44 s before they would leave confused or bored)
- menus: spent 92 s on screen "tourneySetup" (limit 44 s before they would leave confused or bored)
- menus: spent 102 s on screen "ctfCupSetup" (limit 44 s before they would leave confused or bored)
- menus: spent 96 s on screen "ctfCupTeams" (limit 44 s before they would leave confused or bored)
- menus: would have quit in the menus: 575 s of clicking and reading (71 clicks, key remap not counted) before the first match; their patience is 136 s
- menus: spent 71 s on screen "title" (limit 44 s before they would leave confused or bored)
- menus: spent 83 s on screen "options" (limit 44 s before they would leave confused or bored)
- menus: spent 121 s on screen "stats" (limit 44 s before they would leave confused or bored)
- menus: spent 101 s on screen "ctfCupSetup" (limit 44 s before they would leave confused or bored)
- menus: spent 83 s on screen "editor" (limit 44 s before they would leave confused or bored)

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
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage incin) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "stats" although it has a back/close button (a person presses Esc to go back) (in 4 scenes)
- [UI] jank-dead-button (JANK): on screen "title" the button "📣 Share the game" changed nothing visible on two clicks (in 3 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage fortress) (in 3 scenes)
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4306 ms before the next screen was ready
- [UI] jank-dead-button (JANK): on screen "stats" the button "🗑 Reset my stats" changed nothing visible on two clicks
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4148 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4543 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "🎒 Locker" at screen "title" took 259 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 46 ms frame (median 0.5) in teams; recent move: no recent move
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.6) in teams; recent move: Teddy Bear|paintball.special
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.6) in teams; recent move: Fern|photo.up
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.6) in teams; recent move: Teddy Bear|paintball.jab
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.5) in teams; recent move: Firey|ember.fa
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.5) in teams; recent move: Firey|ember.jab
- [SLOW] jank-spike (JANK): a 36 ms frame (median 0.6) in teams; recent move: Teddy Bear|paintball.fa
- [FEEL] jank-input-latency (JANK): Teddy Bear: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.6) in teams; recent move: Teddy Bear|paintball.ba
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.6) in ffa; recent move: Cake|atstake.smash
- [FEEL] jank-input-latency (JANK): Cake: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.4) in ffa; recent move: Cake|atstake.jab

## When they would have quit
- menus: would have quit in the menus: 574 s of clicking and reading (75 clicks, key remap not counted) before the first match; their patience is 136 s
- menus: would have quit in the menus: 575 s of clicking and reading (71 clicks, key remap not counted) before the first match; their patience is 136 s
