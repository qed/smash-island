# Up and down smashes, batch 7: old against new (branch g-smash7b, 2026-11-19)

Built and committed on the branch. NOT pushed, NOT merged, nothing is live. Please say yes, no, or "change this one" for each move before anything merges.

## Who

8 public fighters still had the shared "Skyburst / Floor Ring" pair. This batch does all 8:
**Balloon, Bomb, Fern, Goo, Microphone, Pillow, Taco (II), Tea Kettle.**
Not done: Trophy and Yin-Yang (the last two public fighters on Rising Lunge / Low Lunge). I left them for the next batch to keep this one small enough to review. The event fighters on either pair (Spongy, 8-Ball, Eraser, Clock, Pie, Stapy, Foldy) are not touched.

## The old pair (the same for all 8)

- **Up: Skyburst** - a wide swing over the head that launches straight up.
- **Down: Floor Ring** - a low sweep that hits both sides at once and sends them low and out.

## How to read the numbers

- "dmg / launch" is per hit. Every new hit is at or under the old one. The most one foe can take from the whole move (burn and poison included) is at or under the old damage. No move is shorter in frames than the old one.
- "frames" = startup (smash charge included) / active / end lag, measured with the frame data script. The old down smashes had no measured row stored, so their numbers are worked out from the old row the same way (one frame before the old up smash's startup, 5 active).

## The table

| Fighter | | NEW: what it does | Hook | Numbers (old -> new) |
|---|---|---|---|---|
| Balloon | up | **I Demand a Prize!** (his A Lemony Lesson line) He stamps and pounds his fists up over his head three times. | The first two pounds hold the foe up there, the third launches. | 17.6 / 10.9 -> 3 + 3 + 10 / 10.6. Frames 29/4/29 -> 29/8/25 |
| Balloon | down | **Rubbed the Wrong Way** He rubs himself on the floor in a huff; static crackles out both sides, about 125 px. | Whoever it reaches clings to the floor (rooted about 2/3 s) and is barely moved. | 16.4 / 10.2 -> 12 / 3.1 + root. Frames 28/5/29 -> 28/7/27 |
| Bomb | up | **Mushroom Cloud** A pop at his feet, then the smoke blooms into a mushroom cloud high over him, about 200 px across. | Only the cap hits, high and wide, a moment after the pop. | 25.5 / 11.8 -> 22 / 11.5. Frames 29/4/33 -> 33/4/29 |
| Bomb | down | **Fuse Trail** He lights a fuse along the floor; the spark runs out and the blast goes off at the far end, about 140 px away. | It hits far from him and late; nothing near him is hit. | 23.8 / 11.0 -> 21 / 10.6. Frames 28/5/33 -> 36/2/28 |
| Fern | up | **Overhead Press** (he works out) He plants his feet and presses his fronds up like a barbell. | Armour for the first 12 frames: hits on him do less and push far less. | 15 / 10.0 -> 14.5 / 9.8. Frames 31/4/28 -> 31/5/27 |
| Fern | down | **Soak It Up** He spreads his fronds flat along the floor both sides. | Photosynthesis: Fern heals 4% for each foe caught. | 13.9 / 9.3 -> 13 / 9.2 + heal. Frames 30/5/28 -> 30/6/27 |
| Goo | up | **Like Glue!** (his "Winning is like glue!" analogies that don't stick) A bubble of goo swells over his head and pops. | Whoever it pops on is slowed, sticky, for 1.5 s. | 17.6 / 13.1 -> 16 / 12.5 + slow. Frames 29/4/29 -> 29/6/27 |
| Goo | down | **Dragged Off** (his goo dragged Bonesaw and Spikey off) Two arms of goo shoot out flat along the floor, about 150 px each way. | They drag the foe IN along the floor to Goo (measured: they land right at him), held a moment. | 16.4 / 12.3 -> 13 / 3.9. Frames 28/5/29 -> 28/6/28 |
| Microphone | up | **I'm NOT That Loud!!!** She screams straight up, a column of sound to about 150 px. | Ears ringing: their arrows are mixed up for 3/4 s. | 18.5 / 10.0 -> 15 / 9.8 + scramble. Frames 29/4/29 -> 29/6/27 |
| Microphone | down | **Is This Thing On?** She taps the mic on the floor; the sound runs out both ways about 130 px and its echo comes back. | Two hits: going out it holds them, the echo coming back throws them. | 17.2 / 9.3 -> 9 + 6 / 9.0. Frames 28/5/29 -> 28/11/23 |
| Pillow | up | **Shake the Tree** (she shook Snowball out of a tree for her notes) She shakes the air over her head hard. | The foe falls out SIDEWAYS, the way she faces, not up. | 15 / 10.9 -> 14 / 10.0. Frames 29/4/28 -> 29/6/26 |
| Pillow | down | **Acid Test** (she once dropped Price Tag in acid) She tips a flask out on both sides. | Poisons them for 1 s. | 13.9 / 10.2 -> 10 + poison (12.4 measured) / 5.8. Frames 28/5/28 -> 29/5/27 |
| Taco (II) | up | **Reel Them In** Her retractable arms shoot up to about 200 px, catch, reel the foe down, and she bops them back up off her shell. | Reaches higher than any other up smash; a foe just over her gets only the bop. | 18.5 / 10.9 -> 4 + 12 / 10.6. Frames 29/4/29 -> 29/9/24 |
| Taco (II) | down | **Hovercraft Skid** She drops onto her hovercraft and skids forward. | She moves about 35 px; the front bowls over a foe in front, the fan blasts one behind (8%). | 17.2 / 10.2 -> 15 / 10.1. Frames 28/5/29 -> 28/8/26 |
| Tea Kettle | up | **Spout Off** A jet of steam from her spout, up and forward on a slant. | Aimed on a slant, and it burns. | 20.2 / 12.7 -> 16 + burn (about 18 measured) / 12.4. Frames 30/4/30 -> 30/6/28 |
| Tea Kettle | down | **Sit Down, Dear** The den mother pats the floor firmly on both sides. | Whoever is beside her is knocked off their feet and only nudged (about 70 px at 60%), so she can follow up. | 18.9 / 11.8 -> 15 / 3.9 + knockdown. Frames 29/5/30 -> 29/6/29 |

## Things you should know before saying yes

- **Look-alike check: 13 of 16 have no match.** Three are LISTED, not changed:
  - Goo's Dragged Off matches two of the shared generated down smashes (Naily's Low Sweep Smash, Toothpaste's Floor Trap) by shape and numbers. The check cannot see direction: Goo's pulls the foe IN to him, theirs throw them out.
  - Pillow's Shake the Tree matches Bottle's Yay! (a flat hit over the head). The check sees launch strength, not direction: Pillow's throws them sideways, Bottle's straight up.
  - Bomb's Fuse Trail matches Yellow Face's up smash Now 50% More! (one round hit in front). Bomb's is on the floor 140 px away and comes 12 frames in; Yellow Face's is high and close.
  - Redesigned on the way: my first Microphone down smash (a thump that got weaker the further it went) was really the same move as Ice Cube's Shattered! and Hot Dog's Onion Scatter. It is now the echo.
- **Hooks that could make a move stronger than the numbers say** (not proven safe, no win-rate run): Balloon's root, Fern's armour and self-heal, Goo's slow, Microphone's scramble, Tea Kettle's knockdown with a small push (made for following up).
- **Slower startups:** Bomb up comes 4 frames later than the old one (33 against 29) and Bomb down 8 frames later (36 against 28). That's the point of them (the cloud has to rise, the spark has to run), but it does make them harder to land.
- **Range, where a move covers less than the old one:** Balloon up, Bomb up, Goo up, Taco up and Pillow up hit only above, not a foe standing beside. Bomb up needs the foe about 70 px or more above him. Bomb down misses anyone closer than about 90 px. Pillow down reaches about 80 px, less than the old 106.
- **Fern's armour** lasts 12 frames on a whiff, which covers the whole lift. On a hit it lasts a few frames longer, because the game's hit pause also holds the timer.
- **Bomb's numbers in a match are 4% higher** than the table (his own damage stat is 1.04). The old moves were scaled the same way.
- **Where the ideas come from:** what the game already quotes from the wikis (Balloon's "I demand a prize!", Goo's goo dragging Bonesaw and Spikey off and his analogies, Microphone's "I'M NOT THAT LOUD!!!", Pillow shaking Snowball out of a tree and the acid, Fern working out, Taco's retractable arms and hovercraft, Tea Kettle as the den mother), plus my memory. I didn't check any of it against the episodes. Mushroom Cloud and Fuse Trail come from Bomb being a bomb, not from a scene.
- **I haven't seen any of the 16 drawings** (no browser). They run with 0 errors.
- **Not done:** Trophy and Yin-Yang, CPU matches with these moves, the online check, a win-rate run.
