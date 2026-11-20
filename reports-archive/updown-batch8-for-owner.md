# Up and down smashes, batch 8: old against new (branch g-smash8, 2026-11-19)

Built and committed on the branch. NOT pushed, NOT merged, nothing is live. Please say yes, no, or "change this one" for each move before anything merges.

## Who

9 public fighters still had the shared "Rolling Uppercut / Low Roll" pair. You asked for Bow first, then the rest by name, up to 8:
**Bow, Clover, Fanny, Grassy, Lifering, Marker, Paper, Saw.**
Not done: Soap (the 9th on this pair), and Trophy and Yin-Yang (the last two on Rising Lunge / Low Lunge). No time left for them in this batch. The event fighters are not touched.

## The old pair (the same for all 8)

- **Up: Rolling Uppercut** - a wide swing over the head that launches straight up.
- **Down: Low Roll** - a low sweep that hits both sides at once and sends them low and out.

## How to read the numbers

- "dmg / launch" is per hit. Every new hit is at or under the old one, and the most one foe can take from the whole move is at or under the old damage.
- "frames" = startup (smash charge included) / active / end lag, measured with the frame data script. The old down smashes had no measured row, so theirs is worked out from the old up smash (one frame earlier, 5 active).
- In a match the numbers are scaled by each fighter's own damage stat (Saw's are about 5% higher, Grassy's 10% lower), as the old moves were.

## The table

| Fighter | | NEW: what it does | Hook | Numbers (old -> new) |
|---|---|---|---|---|
| Bow | up | **Lasso** (your design) She twirls her lasso and throws the loop up over her head. | It's a grab, not a hit: it catches only above her and a little to the sides, goes through armour and counters, then reels them over her and slams them into the floor in front of her, knocked down. | 15.8 / 9.0 -> 2 (rope) + 12 (slam) / 6.7. Frames 29/4/28 -> 30/10/21 |
| Bow | down | **Take a Bow** She takes a deep bow. | Two different sides: her head knocks the foe in front off their feet; her ribbon tails snap up behind her and throw that foe up and away (10%). | 14.8 / 8.5 -> 13 / 8.4. Frames 28/5/28 -> 29/5/27 |
| Clover | up | **Make a Wish** She blows a dandelion; the seeds puff up and drift slowly out both ways. | It lingers: a foe who jumps in late, on either side, still gets caught. | 17.6 / 11.8 -> 14 / 11.2. Frames 29/4/29 -> 30/10/22 |
| Clover | down | **Wishbone** She snaps a wishbone; the halves skid out both ways. | Bad luck (her luck is taken from others): their hits do up to 6% less, wearing off over about 18 s. | 16.4 / 11.0 -> 13 / 9.5. Frames 28/5/29 -> 28/6/28 |
| Fanny | up | **Ceiling Fan** Her blades spin flat over her head. | Two turns hold them, the third spins them off SIDEWAYS, to whichever side of her they are on. | 13.2 / 9.0 -> 3 + 3 + 7 / 8.9. Frames 29/4/27 -> 29/10/21 |
| Fanny | down | **Oscillate** She turns her head side to side like an oscillating fan. | The gust goes front (holds them), behind (blows them away), front again (blows them away). | 12.3 / 8.5 -> 4 + 8 in front, 8 behind / 8.3. Frames 28/5/27 -> 28/12/20 |
| Grassy | up | **Greener on the Other Side** Two tall blades shoot up a step to each side of her. | Only beside her: it also hits a foe standing next to her, but nothing straight over her head. | 17.6 / 10.0 -> 16 / 9.9. Frames 29/4/29 -> 29/6/27 |
| Grassy | down | **Itchy** Her blades sprout along the floor both ways. | Grass is itchy: their arrows are mixed up for 3/4 s. | 16.4 / 9.3 -> 12 / 3.9. Frames 28/5/29 -> 28/6/28 |
| Lifering | up | **Whistle Blast** The lifeguard blows his whistle straight up. | Whoever it catches stops dead: stunned in the air for half a second, only lifted a little, ready for a follow-up. | 21.1 / 13.6 -> 15 / 7.0. Frames 29/4/31 -> 29/6/29 |
| Lifering | down | **Wave Pool** He slaps the floor and a wave rolls out in front. | The wave carries them along (4% a wave, three times) and breaks about 130 px out (7%). | 19.7 / 12.7 -> 4+4+4+7 / 12.2. Frames 28/5/31 -> 28/14/22 |
| Marker | up | **Pop the Cap** His cap pops off and rises straight up. | It carries them up with it (3% three times) and pops them off the top, about 125 px up (6%). | 17.6 / 6.3 -> 3+3+3+6 / 6.2. Frames 29/4/29 -> 29/11/22 |
| Marker | down | **Mark My Words** He underlines his point along the floor in front, out to about 160 px. | Whoever it underlines is marked for 3 s (his next hits on them land harder). Front only. | 16.4 / 5.9 -> 13 / 5.7. Frames 28/5/29 -> 28/8/26 |
| Paper | up | **Fortune Teller** He folds into an origami fortune teller over his head. | The flaps snap in from both sides and pull the foe to the middle (6%), then it snaps shut and throws them up (12%). | 21.1 / 10.9 -> 6 + 12 / 10.6. Frames 29/4/31 -> 30/7/27 |
| Paper | down | **Folded Flat** He folds in half and slaps flat on the floor in front, a beat late. | Whoever it flattens skids away along the floor, barely leaving it. Front only. | 19.7 / 10.2 -> 18 / 10.0. Frames 28/5/31 -> 31/4/29 |
| Saw | up | **Back and Forth** She saws up and ahead of her on a slant. | Four strokes: three hold them on her teeth (3% each), the fourth throws them (6%). | 15.8 / 6.3 -> 3+3+3+6 / 6.2. Frames 32/4/28 -> 32/12/20 |
| Saw | down | **Pull Stroke** A long pull stroke along the floor, front to back. | Whoever her teeth catch, in front or behind, is thrown out BEHIND her. | 14.8 / 5.9 -> 13 / 5.7. Frames 31/5/28 -> 31/7/26 |

## Bow's lasso, in plain words

- It only catches someone **above her or a little to the side**. A foe standing next to her on the floor is not caught.
- It follows the grab rules: no teammates, no one already held or frozen, no one in a Final Smash, no one invulnerable. Armour and counters don't stop it (checked).
- **A question for you:** with a shield, the game's grab doesn't catch. It breaks the shield and stuns the grabber. The lasso does the same: shield broken, no catch, Bow stunned for 40 frames. If you want the lasso to catch through a shield instead, say so.
- Once caught, they go up over her and down in front, and are slammed at her feet on frame 15. They bounce a little and stay knocked down for half a second. If someone else hits them, or Bow is hit, the rope lets go.
- I also left bosses out (it doesn't catch a boss). Say if you want it to.

## Things you should know before saying yes

- **Look-alike check: 14 of 16 have no match.** Two are LISTED, not changed:
  - Clover's Make a Wish matches Puffball's down smash Rainbow Whirl. The check can't see height: Clover's is over her head and drifts up slowly, Puffball's is a spin on the floor.
  - Paper's Fortune Teller matches Ice Cube's down smash Shattered!, for the same reason: Paper's is over his head and pulls inward, Ice Cube's is on the floor and pushes out.
  - Redesigned on the way: Paper's first up smash (a page popping up out of the floor in front of him) was really Poppy's Jack-in-the-Box, so it's now the fortune teller. Clover's first Make a Wish drifted forward like Gelatin's Order Up!, so the seeds now spread out both ways.
- **Close to their own specials (please look):** Fanny's Ceiling Fan has spinning blades over her head, like her Helicopter up special. The Helicopter lifts her and ices them. The Ceiling Fan stays on the floor and spins them off sideways.
- **Much weaker than the old move:** Lifering's Whistle Blast has 15% and a small launch, against the old 21% and a big launch. It's a setup move now (the stun), not a kill move.
- **Hooks that could be stronger than the numbers say** (not proven safe, no win-rate run): Lifering's air stun, Grassy's scramble, Clover's bad luck (it lasts long, but it's small), Marker's mark, Bow's knockdown after the slam, Paper's flat skid (a low launch at high % may be hard to recover from).
- **Slower or shorter:** Paper's down smash comes 3 frames later than the old one (31 against 28). Bow's up smash comes 1 frame later (30 against 29). Bow's down smash, behind her, reaches only about 30 px for a standing foe (further for one in the air). Marker's down smash and Paper's down smash hit only in front.
- **Where the ideas come from:** Bow's lasso is yours. Take a Bow is a pun on her name. Clover's bad luck comes from the wiki line the game already quotes ("her luck is reduced from her fellow players"). The rest come from what each one is: a fan, grass, a lifeguard's whistle and pool, a marker's cap, origami, a saw. I didn't check any of it against the episodes.
- **I haven't seen any of the 16 drawings** (no browser). They run with 0 errors.
- **Not done:** Soap, Trophy, Yin-Yang. Also no CPU matches with these moves, no online check, no win-rate run, no ledge test for the lasso slam (a slam facing off a ledge puts the foe over the drop).
