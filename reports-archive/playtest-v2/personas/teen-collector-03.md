# teen-collector-03

**Profile.** teen-collector-03: teen (16), casual; goal: collect tokens and finish quests; opens Locker, Quests, Store, Vault first; reads reward text.
**Hands.** reaction 307 ms (SD 48), key timing jitter 2.72 frames, slipped presses 6%, double-tap 68%, short hop 53%, 60 fps input, 1.15 s per menu target, 263 ms per word read (reads 43% of a screen).
**Keys.** arrows. **Patience.** menus 157 s, confused 38 s on one screen, rage-quits after 5 losses in a row.
**Plan.** menus, ffa, worldcup (x passes).

## What they did
- worldcup (seed 158671614): cup; menus took them about 62 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 158671614 --arg persona=teen-collector-03 --arg size=1 --arg fighter=Ruby`
- menus (seed 786942983): menus; menus took them about 2659 s and 256 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 786942983 --arg persona=teen-collector-03`
- menus (seed 837650934): menus; menus took them about 2716 s and 258 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 837650934 --arg persona=teen-collector-03`
- menus (seed 282580424): menus; menus took them about 745 s and 66 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 282580424 --arg persona=teen-collector-03`
- worldcup (seed 910511812): cup; menus took them about 68 s and 14 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 910511812 --arg persona=teen-collector-03 --arg size=2 --arg fighter=Sidewalky`
- ffa (seed 353138025): ended; 123 s of game on wind, dealt 179, took 100, RIGHT@88% by an assist/hazard, BOTTOM@12% by Liy; menus took them about 68 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 353138025 --arg persona=teen-collector-03 --arg fighter=Spikey --arg stage=wind --arg kind=ffa`
- ffa (seed 29526098): cap; 180 s of game on skytower, dealt 21, took 0, BOTTOM@0% fell, BOTTOM@0% fell; menus took them about 68 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 29526098 --arg persona=teen-collector-03 --arg fighter=Basketball --arg stage=skytower --arg kind=ffa`
- ffa (seed 89004609): cap; 180 s of game on canyon, dealt 190, took 123, BOTTOM@0% fell, BOTTOM@123% fell; menus took them about 68 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 89004609 --arg persona=teen-collector-03 --arg fighter=Nickel (II) --arg stage=canyon --arg kind=ffa`
- menus (seed 590757281): menus; menus took them about 2648 s and 256 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 590757281 --arg persona=teen-collector-03`
- ffa (seed 234128432): cap; 180 s of game on skytower, dealt 186, took 142, BOTTOM@71% fell, BOTTOM@6% fell, BOTTOM@116% fell; menus took them about 72 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 234128432 --arg persona=teen-collector-03 --arg fighter=Cherries --arg stage=skytower --arg kind=ffa`
- ffa (seed 359160289): ended; 136 s of game on dreamisle, dealt 828, took 286, RIGHT@103% by Teddy Bear, TOP@141% by Toothpaste; menus took them about 68 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 359160289 --arg persona=teen-collector-03 --arg fighter=Coiny --arg stage=dreamisle --arg kind=ffa`
- worldcup (seed 711010228): cup; menus took them about 62 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 711010228 --arg persona=teen-collector-03 --arg size=1 --arg fighter=Naily`
- worldcup (seed 12408777): cup; menus took them about 62 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 12408777 --arg persona=teen-collector-03 --arg size=1 --arg fighter=Tree`
- menus (seed 39444061): menus; menus took them about 2648 s and 259 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 39444061 --arg persona=teen-collector-03`
- worldcup (seed 752499127): cup; menus took them about 68 s and 14 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 752499127 --arg persona=teen-collector-03 --arg size=2 --arg fighter=Teardrop`

## Where they got stuck or confused
- BUG playtest-credit: the player's finisher move type counts 0 hits but the player's finisher move landed 1 (the playtester's own bookkeeping, not the game)
- STUCK match-never-ends: ffa match on canyon is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
- BUG cant: Coiny: "smash (V)" was pressed on a ready fighter and nothing happened for 14 frames
- worldcup: 1 presses slipped (a person's missed keys)
- menus: spent 55 s on screen "title" (limit 38 s before they would leave confused or bored)
- menus: spent 106 s on screen "options" (limit 38 s before they would leave confused or bored)
- menus: spent 156 s on screen "controls" (limit 38 s before they would leave confused or bored)
- menus: spent 111 s on screen "stats" (limit 38 s before they would leave confused or bored)
- menus: spent 77 s on screen "learn" (limit 38 s before they would leave confused or bored)
- menus: spent 133 s on screen "tutorial" (limit 38 s before they would leave confused or bored)
- menus: spent 112 s on screen "test" (limit 38 s before they would leave confused or bored)
- menus: spent 133 s on screen "changelog" (limit 38 s before they would leave confused or bored)
- menus: spent 86 s on screen "vault" (limit 38 s before they would leave confused or bored)
- menus: spent 73 s on screen "quests" (limit 38 s before they would leave confused or bored)
- menus: spent 92 s on screen "store" (limit 38 s before they would leave confused or bored)
- menus: spent 156 s on screen "wardrobe" (limit 38 s before they would leave confused or bored)
- menus: spent 97 s on screen "tourneySetup" (limit 38 s before they would leave confused or bored)
- menus: spent 150 s on screen "ctfCupSetup" (limit 38 s before they would leave confused or bored)
- menus: spent 147 s on screen "ctfCupTeams" (limit 38 s before they would leave confused or bored)
- menus: spent 91 s on screen "lobby" (limit 38 s before they would leave confused or bored)
- menus: spent 86 s on screen "editor" (limit 38 s before they would leave confused or bored)
- menus: spent 89 s on screen "select" (limit 38 s before they would leave confused or bored)
- menus: spent 105 s on screen "title" (limit 38 s before they would leave confused or bored)
- menus: spent 108 s on screen "options" (limit 38 s before they would leave confused or bored)
- menus: spent 78 s on screen "learn" (limit 38 s before they would leave confused or bored)
- menus: spent 113 s on screen "test" (limit 38 s before they would leave confused or bored)
- menus: spent 134 s on screen "changelog" (limit 38 s before they would leave confused or bored)
- menus: spent 87 s on screen "vault" (limit 38 s before they would leave confused or bored)
- menus: spent 74 s on screen "quests" (limit 38 s before they would leave confused or bored)
- menus: spent 157 s on screen "wardrobe" (limit 38 s before they would leave confused or bored)
- menus: spent 143 s on screen "ctfCupTeams" (limit 38 s before they would leave confused or bored)
- menus: spent 85 s on screen "editor" (limit 38 s before they would leave confused or bored)
- menus: spent 84 s on screen "title" (limit 38 s before they would leave confused or bored)
- menus: spent 81 s on screen "learn" (limit 38 s before they would leave confused or bored)
- menus: spent 114 s on screen "test" (limit 38 s before they would leave confused or bored)
- menus: spent 119 s on screen "wardrobe" (limit 38 s before they would leave confused or bored)
- menus: spent 92 s on screen "lobby" (limit 38 s before they would leave confused or bored)
- menus: would have quit in the menus: 745 s of clicking and reading (66 clicks, key remap not counted) before the first match; their patience is 157 s
- worldcup: 15 presses slipped (a person's missed keys)
- ffa: 4 presses slipped (a person's missed keys)
- ffa: was knocked out 6 s into the match (BOTTOM at 0%)
- ffa: 1 presses slipped (a person's missed keys)
- ffa: was knocked out 7 s into the match (BOTTOM at 0%)
- ffa: 9 presses slipped (a person's missed keys)
- menus: spent 63 s on screen "title" (limit 38 s before they would leave confused or bored)
- menus: spent 58 s on screen "vault" (limit 38 s before they would leave confused or bored)
- menus: spent 90 s on screen "select" (limit 38 s before they would leave confused or bored)
- ffa: 15 presses slipped (a person's missed keys)
- ffa: 17 presses slipped (a person's missed keys)
- worldcup: 2 presses slipped (a person's missed keys)
- worldcup: 4 presses slipped (a person's missed keys)
- menus: spent 69 s on screen "title" (limit 38 s before they would leave confused or bored)
- menus: spent 125 s on screen "options" (limit 38 s before they would leave confused or bored)
- menus: spent 99 s on screen "wardrobe" (limit 38 s before they would leave confused or bored)
- menus: spent 150 s on screen "ctfCupTeams" (limit 38 s before they would leave confused or bored)
- worldcup: 11 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
- [UI] phone-wording: screen "changelog" says "Tap" in: "New: SPRINT. Tap Z while you are running on the ground to sprint at 1." (a computer game: no phone or touch wording) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "options" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [UI] phone-wording: screen "controls" says "tap" in: "Sprint (tap while moving) / Shield (hold; the strong fighters get a Re" (a computer game: no phone or touch wording) (in 5 scenes)
- [UI] phone-wording: screen "controls" says "tap" in: "Move · Jump (a quick press is a short hop; Down in the air fast-falls;" (a computer game: no phone or touch wording) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "controls" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
- [FEEL] jank-esc-ignored (JANK): Esc does nothing on screen "stats" although it has a back/close button (a person presses Esc to go back) (in 5 scenes)
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
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage needle) (in 4 scenes)
- [UI] jank-dead-button (JANK): on screen "title" the button "📣 Share the game" changed nothing visible on two clicks (in 2 scenes)
- [FEEL] long-match: ffa match on skytower was still going after 3 min of game time (in 2 scenes)
- [SLOW] jank-spike (JANK): a 42 ms frame (median 0.4) in ffa; recent move: Ruby|beam.fa
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.3) in ffa; recent move: no recent move
- [FEEL] jank-hitstop-drift (JANK): Salt moved 27 px in one frame while in hitstop (ffa; last move: Salt|saltpepper.finisher)
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4051 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "🎒 Locker" at screen "title" took 251 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 5051 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4945 ms before the next screen was ready
- [UI] jank-dead-button (JANK): on screen "options" the button "🔊 Sound: On" changed nothing visible on two clicks
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.5) in teams; recent move: Blocky|anvil.smash
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.5) in teams; recent move: Profily|pricetag.finisher
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.6) in teams; recent move: Blocky|anvil.jab
- [FEEL] jank-input-latency (JANK): Blocky: atk took 14 frames (234 ms) from the key to the first change on the fighter
- [SLOW] jank-spike (JANK): a 35 ms frame (median 0.5) in teams; recent move: Blocky|anvil.na
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.5) in teams; recent move: Profily|pricetag.jab
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.6) in teams; recent move: Profily|pricetag.ut
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.4) in teams; recent move: no recent move
- [SLOW] jank-spike (JANK): a 38 ms frame (median 0.4) in teams; recent move: Cheesy|pun.up

## When they would have quit
- menus: would have quit in the menus: 745 s of clicking and reading (66 clicks, key remap not counted) before the first match; their patience is 157 s
