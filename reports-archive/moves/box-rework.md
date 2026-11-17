# Box rework: old against new (branch g-box, 2026-11-17)

Your words: "box's only playable move is smash", "the finisher sucks". Your picks: **Real jab + ranged** and **Specials that hurt**. Not picked, so not touched: her smash and her dmg 1.2.

Every move keeps its idea. Not pushed, not merged. The live relay was never touched. Only Box's kit changed.

How to read the numbers: % is what a foe takes in a match (her dmg 1.2 is already in it). "Reach" is how far from her middle a move hits. Measured on the built game with a still dummy foe, and in CPU matches.

## The table

| Move | OLD | NEW |
|---|---|---|
| **Flap Flick** (jab) | 3%, reaches 65 px from her middle (41 px past her body), launch 7 | **not changed** (see "Why the jab is not changed") |
| **Corner Jab** (ranged, down + X) | a corner jab at the shins; hits 69 px out (one of the 9 shortest of 117), 4.8%, starts on frame 3 | the same jab, **hits 80 px out** (the roster middle is 79; now about 50th of 117). Same size, same 4.8%, same speed. Its card now says "medium reach" (worked out from the numbers) |
| **Everything Packed** (special) | catches the nearest shot and throws it back 20% harder. With no shot near: nothing happens | catch and throw back **the same**. With no shot near: **the flaps snap shut just in front of her: 6%**, a small push. Hits a foe whose middle is 40 to 90 px from hers |
| **Transcending Time and Space** (up) | blinks up 120 px, untouchable for a moment, a jump back. No hit | the same blink, **and whoever is where she reappears is hit: 6%**, knocked up (hits within about 70 px of where she appears) |
| **Lifeless Body** (down) | goes limp for about half a second: hits do 60% and barely move her | the same soak, **then the limp body flops over the way she faces onto whoever is beside her: 4.8%**, a small pop (40 to 100 px out). The idea is kept: she is still a limp body, it just falls over at the end |
| **Which One Is Box?** (finisher) | she blinks back up to 160 px, leaving an identical empty box. **Needs 60 px of room behind her, or nothing happens.** The box waits **5 s**. Only a foe that **hits** the box springs it. The glove reaches **64 px** past the box (5 frames). 14.4% | the same decoy-and-glove trap. **No room behind her: she blinks the other way; no room either way: straight up 110 px.** The box waits **8 s**. A foe that hits it **or walks up to it** (within 70 px of its side) springs it. The glove reaches **100 px** (6 frames, a little thicker). 14.4%, launch unchanged |

### The words in the game (move list), old and new

- **Everything Packed.** OLD: "...press again and it flies back out, hers and 20% harder. no hit: on its own." NEW: "...press again and it flies back out, hers and 20% harder. With no shot to catch, the flaps snap shut on whoever is just in front of her (short reach). On hit: 6%."
- **Transcending Time and Space.** OLD: "no hit: she blinks out and back in, higher up, briefly untouchable, with a jump back." NEW: "she blinks out and back in, higher up, briefly untouchable, with a jump back, and knocks whoever is where she reappears (short reach). On hit: 6%."
- **Lifeless Body.** OLD: "no hit: she goes limp as her old lifeless body; for half a second hits do little over half and barely move her." NEW: "...barely move her, then the limp body flops over onto whoever is beside her (short reach). On hit: 4.8%."
- **Which One Is Box?** OLD: "...blinks back along her floor (up to 160 px)... For 5 s, the first foe to hit the box, with a swing or a shot, springs its flap... (short reach). The box stops a shot. Needs room behind her. On hit: 14.4%." NEW: "...blinks back along her floor (up to 160 px; the other way if there is no room, or straight up)... For 8 s, the first foe to walk up to the box or hit it, with a swing or a shot, springs its flap... (medium reach). The box stops a shot. On hit: 14.4%."
- **Corner Jab.** OLD "(short reach)", NEW "(medium reach)". Same words otherwise.
- I chose "snap shut", not "slam shut": the game picks a move's body animation from words on its card, and "slam" would have changed the special's animation. It still plays the same animation as before.

### Why the jab is not changed

You asked for a real jab, and the brief said: land her in the middle, not the top. Measured, Flap Flick already is in the middle or a little above it:

| | Reach from her middle | Past her body | Damage |
|---|---|---|---|
| Box | 65 | 41 | 3% |
| Roster middle (113 melee jabs) | 62 | 38 | 2.8% |
| Roster top quarter starts at | 65 | 41 | 3% |
| The 6 mid fighters below (Fries, Rocky, Blocky, Yellow Face, Pickle, Tennis Ball) | 58 to 70 | 34 to 46 | 2.8 to 3.5% |

So more reach or damage would have put it in the top quarter. In the CPU matches the jab was already her biggest source of damage (a third of it). **Your call:** if you still want the jab stronger, the next step would be a small reach bump (8 -> 12 in its row, 65 -> 69 px, about 10th of 113).

What does look weak up close is her **speed**, not her reach: her up-tilt and aerials start on frame 8.7 on average (the roster's is 5.8; she is 109th of 117). That is a different change (it would make moves faster), so I did not touch it. See hop-smash-and-archetypes.md.

## The CPU

- Everything Packed: the CPU's table of where each special lands now says 40-90 px, 6%, so the CPU uses it up close (it used it 2 times in 36 matches before, 105 times after, 75 hits). It still catches shots first.
- Transcending Time and Space: the CPU reads the new hit from the move itself (no table to change). It hit 129 times in 36 matches (was 1).
- Lifeless Body: still a stance for the CPU (it raises it when a hit is coming). The flop landed 6 times in 36 matches: small, as meant.
- Which One Is Box?: the CPU no longer checks for room (it always goes off on a floor now), and sets it for a foe up to 120 px away (was 90). Because a foe who walks up springs it, CPU foes now fall for it: 166 glove hits in 36 matches (was 49).

## Measured: Box against 6 mid fighters

The panel: Fries, Rocky, Blocky, Yellow Face, Pickle, Tennis Ball (a mid-roster panel). 1v1, Hard CPUs both sides, items off, Smash Balls off, 3 stocks, 9000-frame cap, Goiky Field. Every pairing twice with sides swapped.

Note: the game is not fully repeatable (the same seed can give a different winner on a second run), so 12 matches are noisy. I also ran 36 (each pairing 3 times each way).

| | Before | After |
|---|---|---|
| **12 matches (the asked run)** | **3 wins** | **7 wins** |
| 36 matches | 8 wins (22%) | 15 wins (42%) |
| Her KOs / her falls (36) | 52 / 80 | 73 / 72 |
| Damage dealt / taken (36) | 10277 / 11421 | 12107 / 11369 |
| Wins per foe (36, of 6) | Fries 3, Rocky 0, Blocky 1, Yellow Face 1, Pickle 1, Tennis Ball 2 | Fries 3, Rocky 2, Blocky 2, Yellow Face 4, Pickle 1, Tennis Ball 3 |

42% against mid fighters is the middle, not the top. A 36-match win rate has a margin of about 8 points.

**How she scored (36 matches).** A KO is put on the last move of hers that hit the foe before they fell. Hits that land a moment after the move (a shot, a move's later frames) are put on the last move she started, so a few hits are counted to the wrong move.

| Move | Before: damage share, KOs | After: damage share, KOs |
|---|---|---|
| Flap Flick (jab) | 34%, 11 | 27%, 7 |
| Smash (on the ground) | 21%, 7 | 15%, 3 |
| Smash in the air | 6%, 6 | 6%, 3 |
| **Which One Is Box?** | 7%, 16 | **20%, 42** |
| **Transcending Time and Space** | 0% (no hit of its own), 0 | **6%, 8** |
| **Everything Packed** | 0% (no hits) | **4%, 1** |
| Corner Jab (ranged) | 7%, 0 | 4%, 0 |
| Lid Pop (up air) | 6%, 7 | 5%, 6 |
| Lifeless Body | 0 | 0.2%, 0 |
| everything else (tilts, other aerials, up/down smash, throws) | 19% | 13% |

So she no longer lives on the smash and the jab: the specials now hurt, and the finisher went from a rare trick to her main KO move.

**Worth knowing:** after the change the finisher makes 42 of her 73 KOs (58%). That is because CPU foes cannot tell the decoy from her and walk up to it. If that feels like too much, the easy dials are the walk-up distance (70 px) and the 8 s.

## Checks

- syncheck: 2 scripts, 0 failed. Boot check (alone, below-normal): FFA and Teams play with no errors, 0 control bytes, 0 bare LF, no hidden names.
- Online: nothing new is sent to a guest. The host runs every new hit; the decoy's new "straight up" mark is not in the guest's snapshot fields (a guest draws the box and Box as before). The flop's wait uses the existing wind-up, which guests already get.
