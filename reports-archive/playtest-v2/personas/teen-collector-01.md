# teen-collector-01

**Profile.** teen-collector-01: teen (15), casual; goal: collect tokens and finish quests; opens Locker, Quests, Store, Vault first; reads reward text.
**Hands.** reaction 265 ms (SD 54), key timing jitter 2.58 frames, slipped presses 5%, double-tap 72%, short hop 53%, 60 fps input, 0.96 s per menu target, 295 ms per word read (reads 33% of a screen).
**Keys.** arrows. **Patience.** menus 116 s, confused 36 s on one screen, rage-quits after 5 losses in a row.
**Plan.** menus, ffa, worldcup (x passes).

## What they did
- worldcup (seed 287198528): cup; menus took them about 53 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 287198528 --arg persona=teen-collector-01 --arg size=1 --arg fighter=Pin`
- menus (seed 126636470): menus; menus took them about 2474 s and 269 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 126636470 --arg persona=teen-collector-01`
- menus (seed 188760412): menus; menus took them about 2438 s and 268 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 188760412 --arg persona=teen-collector-01`
- menus (seed 127679666): menus; menus took them about 2400 s and 265 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 127679666 --arg persona=teen-collector-01`
- worldcup (seed 516747023): cup; menus took them about 58 s and 14 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 516747023 --arg persona=teen-collector-01 --arg size=2 --arg fighter=Pencil`
- ffa (seed 815284758): ended; 141 s of game on pillars, dealt 531, took 154, LEFT@30% by Bonesaw, RIGHT@80% by Bonesaw, RIGHT@15% fell; menus took them about 58 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 815284758 --arg persona=teen-collector-01 --arg fighter=Lightning --arg stage=pillars --arg kind=ffa`
- ffa (seed 854651736): ended; 62 s of game on wind, dealt 373, took 159, BOTTOM@66% by Test Tube, TOP@92% by Test Tube; menus took them about 61 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 854651736 --arg persona=teen-collector-01 --arg fighter=Blueberry --arg stage=wind --arg kind=ffa`
- ffa (seed 453786629): ended; 66 s of game on forest, dealt 257, took 326, MAX@261% by Teddy Bear; menus took them about 61 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 453786629 --arg persona=teen-collector-01 --arg fighter=Firey --arg stage=forest --arg kind=ffa`
- ffa (seed 488782220): ended; 133 s of game on pillars, dealt 352, took 299, TOP@203% by Magnet; menus took them about 58 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 488782220 --arg persona=teen-collector-01 --arg fighter=Poppy --arg stage=pillars --arg kind=ffa`
- menus (seed 174099533): menus; menus took them about 2446 s and 265 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 174099533 --arg persona=teen-collector-01`
- ffa (seed 898421245): cap; 180 s of game on grandplains, dealt 106, took 160, BOTTOM@0% fell, BOTTOM@117% fell, BOTTOM@2% fell; menus took them about 61 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 898421245 --arg persona=teen-collector-01 --arg fighter=Golf Ball --arg stage=grandplains --arg kind=ffa`
- worldcup (seed 279643061): cup; menus took them about 58 s and 14 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 279643061 --arg persona=teen-collector-01 --arg size=2 --arg fighter=Snowball`
- worldcup (seed 172779643): cup; menus took them about 58 s and 14 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 172779643 --arg persona=teen-collector-01 --arg size=2 --arg fighter=Bot`
- menus (seed 768220333): menus; menus took them about 2530 s and 270 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 768220333 --arg persona=teen-collector-01`
- worldcup (seed 960415081): cup; menus took them about 58 s and 14 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 960415081 --arg persona=teen-collector-01 --arg size=2 --arg fighter=Pin`

## Where they got stuck or confused
- BUG playtest-credit: the player's finisher move type counts 0 hits but the player's finisher move landed 1 (the playtester's own bookkeeping, not the game)
- BUG playtest-credit: the player's finisher move type counts 0 hits but the player's finisher move landed 2 (the playtester's own bookkeeping, not the game)
- worldcup: 3 presses slipped (a person's missed keys)
- menus: spent 55 s on screen "title" (limit 36 s before they would leave confused or bored)
- menus: spent 93 s on screen "options" (limit 36 s before they would leave confused or bored)
- menus: spent 134 s on screen "controls" (limit 36 s before they would leave confused or bored)
- menus: spent 96 s on screen "stats" (limit 36 s before they would leave confused or bored)
- menus: spent 67 s on screen "learn" (limit 36 s before they would leave confused or bored)
- menus: spent 194 s on screen "tutorial" (limit 36 s before they would leave confused or bored)
- menus: spent 98 s on screen "test" (limit 36 s before they would leave confused or bored)
- menus: spent 115 s on screen "changelog" (limit 36 s before they would leave confused or bored)
- menus: spent 75 s on screen "vault" (limit 36 s before they would leave confused or bored)
- menus: spent 143 s on screen "quests" (limit 36 s before they would leave confused or bored)
- menus: spent 126 s on screen "store" (limit 36 s before they would leave confused or bored)
- menus: spent 102 s on screen "wardrobe" (limit 36 s before they would leave confused or bored)
- menus: spent 84 s on screen "tourneySetup" (limit 36 s before they would leave confused or bored)
- menus: spent 129 s on screen "ctfCupSetup" (limit 36 s before they would leave confused or bored)
- menus: spent 123 s on screen "ctfCupTeams" (limit 36 s before they would leave confused or bored)
- menus: spent 80 s on screen "lobby" (limit 36 s before they would leave confused or bored)
- menus: spent 73 s on screen "editor" (limit 36 s before they would leave confused or bored)
- menus: spent 77 s on screen "select" (limit 36 s before they would leave confused or bored)
- menus: spent 57 s on screen "title" (limit 36 s before they would leave confused or bored)
- menus: spent 92 s on screen "options" (limit 36 s before they would leave confused or bored)
- menus: spent 105 s on screen "quests" (limit 36 s before they would leave confused or bored)
- menus: spent 82 s on screen "tourneySetup" (limit 36 s before they would leave confused or bored)
- menus: spent 75 s on screen "editor" (limit 36 s before they would leave confused or bored)
- menus: spent 79 s on screen "title" (limit 36 s before they would leave confused or bored)
- menus: spent 94 s on screen "options" (limit 36 s before they would leave confused or bored)
- menus: spent 95 s on screen "stats" (limit 36 s before they would leave confused or bored)
- menus: spent 96 s on screen "test" (limit 36 s before they would leave confused or bored)
- menus: spent 50 s on screen "vault" (limit 36 s before they would leave confused or bored)
- menus: spent 93 s on screen "quests" (limit 36 s before they would leave confused or bored)
- menus: spent 84 s on screen "wardrobe" (limit 36 s before they would leave confused or bored)
- worldcup: was knocked out 2 s into the match (BOTTOM at 0%)
- ffa: 6 presses slipped (a person's missed keys)
- ffa: 7 presses slipped (a person's missed keys)
- ffa: 10 presses slipped (a person's missed keys)
- menus: spent 45 s on screen "title" (limit 36 s before they would leave confused or bored)
- menus: spent 97 s on screen "test" (limit 36 s before they would leave confused or bored)
- menus: spent 92 s on screen "quests" (limit 36 s before they would leave confused or bored)
- menus: spent 135 s on screen "wardrobe" (limit 36 s before they would leave confused or bored)
- menus: spent 83 s on screen "tourneySetup" (limit 36 s before they would leave confused or bored)
- menus: spent 74 s on screen "editor" (limit 36 s before they would leave confused or bored)
- ffa: was knocked out 10 s into the match (BOTTOM at 0%)
- worldcup: 6 presses slipped (a person's missed keys)
- worldcup: 9 presses slipped (a person's missed keys)
- menus: spent 98 s on screen "title" (limit 36 s before they would leave confused or bored)
- menus: spent 109 s on screen "options" (limit 36 s before they would leave confused or bored)
- menus: spent 97 s on screen "stats" (limit 36 s before they would leave confused or bored)
- menus: spent 78 s on screen "lobby" (limit 36 s before they would leave confused or bored)
- worldcup: 1 presses slipped (a person's missed keys)

## What went wrong (everything the playtester noted while they played)
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
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage fortress) (in 4 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage forest) (in 4 scenes)
- [SLOW] jank-stutter (JANK): 3 slow frames within a second in teams (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (ffa, stage pillars) (in 2 scenes)
- [FEEL] jank-snag (JANK): the player held a walk key 24 frames on the ground and did not move (teams, stage needle) (in 2 scenes)
- [FEEL] jank-input-latency (JANK): Pin: atk took 7 frames (117 ms) from the key to the first change on the fighter
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4271 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4084 ms before the next screen was ready
- [UI] jank-dead-button (JANK): on screen "editor" the button "Clear" changed nothing visible on two clicks
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 7930 ms before the next screen was ready
- [UI] jank-dead-button (JANK): on screen "title" the button "📣 Share the game" changed nothing visible on two clicks
- [SLOW] jank-slow-click (JANK): a click on "🎒 Locker" at screen "title" took 254 ms before the next screen was ready
- [UI] jank-dead-button (JANK): on screen "options" the button "🔊 Sound: On" changed nothing visible on two clicks
- [SLOW] jank-slow-click (JANK): a click on "Skip" at screen "tutorial" took 258 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "🥊 Training" at screen "learn" took 806 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "🎓 Learn" at screen "title" took 258 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "Get W75" at screen "store" took 604 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "◂ Only the fighters I have u" at screen "select" took 309 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "Take the Plunge ▶" at screen "title" took 283 ms before the next screen was ready
- [SLOW] jank-spike (JANK): a 40 ms frame (median 0.5) in teams; recent move: Pencil|van.up

## When they would have quit
No quit moment in this run: they would have kept playing (as far as this model goes).
