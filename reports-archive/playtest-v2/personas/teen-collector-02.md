# teen-collector-02

**Profile.** teen-collector-02: teen (17), casual; goal: collect tokens and finish quests; opens Locker, Quests, Store, Vault first; reads reward text.
**Hands.** reaction 302 ms (SD 51), key timing jitter 2.59 frames, slipped presses 4%, double-tap 74%, short hop 41%, 60 fps input, 0.9 s per menu target, 262 ms per word read (reads 30% of a screen).
**Keys.** arrows. **Patience.** menus 92 s, confused 36 s on one screen, rage-quits after 5 losses in a row.
**Plan.** menus, ffa, worldcup (x passes).

## What they did
- worldcup (seed 246357036): cup; menus took them about 44 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 246357036 --arg persona=teen-collector-02 --arg size=1 --arg fighter=Basketball`
- ffa (seed 584503788): ended; 38 s of game on forest, dealt 54, took 124, RIGHT@25% by Blueberry, RIGHT@99% by Knife; menus took them about 48 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 584503788 --arg persona=teen-collector-02 --arg fighter=Test Tube --arg stage=forest --arg kind=ffa`
- menus (seed 677647653): menus; menus took them about 550 s and 66 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 677647653 --arg persona=teen-collector-02`
- menus (seed 727346359): menus; menus took them about 2075 s and 271 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 727346359 --arg persona=teen-collector-02`
- menus (seed 969500283): menus; menus took them about 518 s and 66 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 969500283 --arg persona=teen-collector-02`
- worldcup (seed 114294172): cup; menus took them about 49 s and 14 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 114294172 --arg persona=teen-collector-02 --arg size=2 --arg fighter=Blocky`
- ffa (seed 892446579): ended; 70 s of game on dreamisle, dealt 418, took 109, LEFT@109% by Dough; menus took them about 48 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 892446579 --arg persona=teen-collector-02 --arg fighter=Clover --arg stage=dreamisle --arg kind=ffa`
- menus (seed 594136413): menus; menus took them about 2067 s and 273 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 594136413 --arg persona=teen-collector-02`
- ffa (seed 773820524): cap; 180 s of game on yoyle, dealt 89, took 26, BOTTOM@6% by Cherries, BOTTOM@20% by David, BOTTOM@0% fell; menus took them about 51 s and 13 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 773820524 --arg persona=teen-collector-02 --arg fighter=Test Tube --arg stage=yoyle --arg kind=ffa`
- ffa (seed 418168962): ended; 153 s of game on dreamisle, dealt 257, took 157, BOTTOM@19% by Rocky, BOTTOM@31% by Yin-Yang, RIGHT@106% by Blueberry; menus took them about 48 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 418168962 --arg persona=teen-collector-02 --arg fighter=Spikey --arg stage=dreamisle --arg kind=ffa`
- worldcup (seed 932633777): cup; menus took them about 44 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 932633777 --arg persona=teen-collector-02 --arg size=1 --arg fighter=Coiny`
- worldcup (seed 729529590): cup; menus took them about 44 s and 12 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 729529590 --arg persona=teen-collector-02 --arg size=1 --arg fighter=Goo`
- ffa (seed 108727030): cap; 180 s of game on ice, dealt 332, took 256, RIGHT@154% by an assist/hazard; menus took them about 48 s and 10 clicks. Repro: `node scripts/playtest.mjs --scene ffa --seed 108727030 --arg persona=teen-collector-02 --arg fighter=Teardrop --arg stage=ice --arg kind=ffa`
- worldcup (seed 586533666): cup; menus took them about 48 s and 14 clicks. Repro: `node scripts/playtest.mjs --scene worldcup --seed 586533666 --arg persona=teen-collector-02 --arg size=2 --arg fighter=Spikey`
- menus (seed 218089476): menus; menus took them about 2037 s and 269 clicks. Repro: `node scripts/playtest.mjs --scene menus --seed 218089476 --arg persona=teen-collector-02`

## Where they got stuck or confused
- BUG playtest-credit: the player's finisher move type counts 0 hits but the player's finisher move landed 2 (the playtester's own bookkeeping, not the game)
- STUCK match-never-ends: ffa match on yoyle is a stalemate: no stock lost for a minute and it did not end in 3 min of game time
- worldcup: 3 presses slipped (a person's missed keys)
- ffa: was knocked out 3 s into the match (RIGHT at 25%)
- ffa: 4 presses slipped (a person's missed keys)
- menus: spent 56 s on screen "title" (limit 36 s before they would leave confused or bored)
- menus: spent 76 s on screen "options" (limit 36 s before they would leave confused or bored)
- menus: spent 110 s on screen "controls" (limit 36 s before they would leave confused or bored)
- menus: spent 79 s on screen "stats" (limit 36 s before they would leave confused or bored)
- menus: spent 81 s on screen "learn" (limit 36 s before they would leave confused or bored)
- menus: spent 158 s on screen "tutorial" (limit 36 s before they would leave confused or bored)
- menus: spent 79 s on screen "test" (limit 36 s before they would leave confused or bored)
- menus: spent 94 s on screen "changelog" (limit 36 s before they would leave confused or bored)
- menus: spent 61 s on screen "vault" (limit 36 s before they would leave confused or bored)
- menus: spent 86 s on screen "quests" (limit 36 s before they would leave confused or bored)
- menus: spent 103 s on screen "store" (limit 36 s before they would leave confused or bored)
- menus: spent 84 s on screen "wardrobe" (limit 36 s before they would leave confused or bored)
- menus: spent 69 s on screen "tourneySetup" (limit 36 s before they would leave confused or bored)
- menus: spent 107 s on screen "ctfCupSetup" (limit 36 s before they would leave confused or bored)
- menus: spent 102 s on screen "ctfCupTeams" (limit 36 s before they would leave confused or bored)
- menus: spent 65 s on screen "lobby" (limit 36 s before they would leave confused or bored)
- menus: spent 85 s on screen "editor" (limit 36 s before they would leave confused or bored)
- menus: spent 63 s on screen "select" (limit 36 s before they would leave confused or bored)
- menus: would have quit in the menus: 550 s of clicking and reading (66 clicks, key remap not counted) before the first match; their patience is 92 s
- menus: spent 37 s on screen "title" (limit 36 s before they would leave confused or bored)
- menus: spent 89 s on screen "options" (limit 36 s before they would leave confused or bored)
- menus: spent 78 s on screen "learn" (limit 36 s before they would leave confused or bored)
- menus: spent 80 s on screen "test" (limit 36 s before they would leave confused or bored)
- menus: spent 75 s on screen "quests" (limit 36 s before they would leave confused or bored)
- menus: spent 102 s on screen "store" (limit 36 s before they would leave confused or bored)
- menus: spent 110 s on screen "wardrobe" (limit 36 s before they would leave confused or bored)
- menus: spent 105 s on screen "ctfCupSetup" (limit 36 s before they would leave confused or bored)
- menus: spent 101 s on screen "ctfCupTeams" (limit 36 s before they would leave confused or bored)
- menus: spent 64 s on screen "lobby" (limit 36 s before they would leave confused or bored)
- menus: spent 84 s on screen "editor" (limit 36 s before they would leave confused or bored)
- menus: spent 48 s on screen "title" (limit 36 s before they would leave confused or bored)
- menus: spent 77 s on screen "options" (limit 36 s before they would leave confused or bored)
- menus: spent 78 s on screen "stats" (limit 36 s before they would leave confused or bored)
- menus: spent 42 s on screen "vault" (limit 36 s before they would leave confused or bored)
- menus: spent 116 s on screen "quests" (limit 36 s before they would leave confused or bored)
- menus: spent 68 s on screen "tourneySetup" (limit 36 s before they would leave confused or bored)
- menus: spent 88 s on screen "editor" (limit 36 s before they would leave confused or bored)
- menus: would have quit in the menus: 518 s of clicking and reading (66 clicks, key remap not counted) before the first match; their patience is 92 s
- worldcup: 10 presses slipped (a person's missed keys)
- ffa: 8 presses slipped (a person's missed keys)
- menus: spent 58 s on screen "title" (limit 36 s before they would leave confused or bored)
- menus: spent 74 s on screen "options" (limit 36 s before they would leave confused or bored)
- menus: spent 54 s on screen "learn" (limit 36 s before they would leave confused or bored)
- menus: spent 76 s on screen "quests" (limit 36 s before they would leave confused or bored)
- menus: spent 109 s on screen "wardrobe" (limit 36 s before they would leave confused or bored)
- menus: spent 116 s on screen "ctfCupSetup" (limit 36 s before they would leave confused or bored)
- menus: spent 66 s on screen "lobby" (limit 36 s before they would leave confused or bored)
- ffa: was knocked out 3 s into the match (BOTTOM at 6%)
- ffa: was knocked out 8 s into the match (BOTTOM at 19%)
- worldcup: 5 presses slipped (a person's missed keys)
- ffa: 17 presses slipped (a person's missed keys)
- menus: spent 80 s on screen "title" (limit 36 s before they would leave confused or bored)
- menus: spent 41 s on screen "vault" (limit 36 s before they would leave confused or bored)
- menus: spent 86 s on screen "editor" (limit 36 s before they would leave confused or bored)

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
- [UI] jank-dead-button (JANK): on screen "title" the button "📣 Share the game" changed nothing visible on two clicks (in 2 scenes)
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.4) in ffa; recent move: Basketball|dribble.ba
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.3) in ffa; recent move: Basketball|dribble.fa
- [SLOW] jank-spike (JANK): a 57 ms frame (median 0.3) in ffa; recent move: Tea Kettle|hors.special
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.2) in ffa; recent move: Basketball|dribble.jab
- [SLOW] jank-spike (JANK): a 37 ms frame (median 0.2) in ffa; recent move: Tea Kettle|hors.up
- [SLOW] jank-spike (JANK): a 33 ms frame (median 0.2) in ffa; recent move: Basketball|dribble.na
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.2) in ffa; recent move: Basketball|dribble.special
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ffa; recent move: Basketball|dribble.smash
- [SLOW] jank-spike (JANK): a 39 ms frame (median 0.2) in ffa; recent move: Match|spark.dt
- [UI] stray-banner: a match shows "KO'd by Blueberry − a stock" (banner kind none; only GO!, KO lines, boss and system lines are allowed)
- [SLOW] jank-spike (JANK): a 34 ms frame (median 0.3) in ffa; recent move: no recent move
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4244 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 4264 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "⚙ Settings" at screen "title" took 6687 ms before the next screen was ready
- [UI] jank-dead-button (JANK): on screen "options" the button "🔊 Sound: On" changed nothing visible on two clicks
- [SLOW] jank-spike (JANK): a 52 ms frame (median 0.2) in ctf/hide; recent move: Firey|ember.fa
- [SLOW] jank-spike (JANK): a 41 ms frame (median 0.3) in ctf/hide; recent move: no recent move
- [SLOW] jank-slow-click (JANK): a click on "🎒 Locker" at screen "title" took 305 ms before the next screen was ready
- [SLOW] jank-slow-click (JANK): a click on "🛍 Store" at screen "quests" took 266 ms before the next screen was ready

## When they would have quit
- menus: would have quit in the menus: 550 s of clicking and reading (66 clicks, key remap not counted) before the first match; their patience is 92 s
- menus: would have quit in the menus: 518 s of clicking and reading (66 clicks, key remap not counted) before the first match; their patience is 92 s
