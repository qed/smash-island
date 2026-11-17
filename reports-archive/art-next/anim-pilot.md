# Animation redraws: the pilot (Bow, Needle, Match, Clover, Blueberry)

Branch `g-anim1`, cut from `g-update6` at `beca9bb5`. Drawing only. Not pushed or merged.

## What changed

- **Every swing has its own timeline of key poses.** Each move gets a key pose every 2 to 3 ticks of an 18-tick jab: anticipation, a stretched smear frame on the hit, follow-through past it, and a settle with a small overshoot. The game eases from key to key, so every drawn frame is its own pose. Before, there were 6 held frames shared by every fighter.
  - Faces swap with the move: wind-up, hit, follow-through and recover. Each fighter keeps their own temperament: Bow and Clover beam and shout, Needle glares, Match stays smug, and Blueberry is half-lidded and never opens his mouth.
  - The painted arms and legs swing through each move.
- **Turnarounds, in the show's way.** Spinning moves turn the flat picture about its upright: edge-on, its back, edge-on, then round again. This covers Bow's chair jab, her Teleport, Clover's Butterflies, Match's twirl and her down smash.
- **Signature moves drawn one by one:**
  - Bow: chair jab, Teleport, Chair Slam, Snowballs, up smash.
  - Needle: three pricks, Riposte, Reflex, The Point.
  - Match: head strike, Triple Spark, Struck Match twirl, down smash, neutral smash.
  - Clover: punch, Butterflies, Lucky Wind, Meant for Me, Lucky Break, up smash, down smash, Lucky Leaf Pinwheel.
  - Blueberry: lazy punch, Palanquin Catch, Play Dead, stomp smash, up smash.
  - Every other move (tilts, aerials, grabs, throws) uses a shared shape for its kind. That shape is drawn in the fighter's own faces and sized to them.
- **A held smash winds into the smash's first pose.** It trembles once it is nearly full, and the release comes straight out of that pose.
- **Walk and run are one continuous stride** instead of 4 held steps. The body squashes as the legs pass under it, and each fighter has their own arm swing, leg swing and run face.
- **The jump is one continuous arc:** stretched on the way up, loose at the top, arms up on the way down.
- **Getting hit:** the 3 flinch frames are now blended into each other instead of held.

**One style per move.** Needle's prick (jab), stance (neutral and down special, and the counter) and mad (smash and its charge) are pictures from the show. Those moves keep the show picture all the way through. Their timelines only move the body that carries the picture: no drawn limbs or faces are added to them. Every other move is drawn on the fighter's own picture all the way through.

No new pictures were downloaded or made, so `assets/sprites/CREDITS.md` is unchanged.

## What to look at (keys: X attack, C special, V smash, arrows move and jump, Z sprint/shield)

Best in Training or a 1v1 against a still CPU, on a flat stage. Watch for the wind-up before the hit, the stretched smear frame, the swing carrying past the hit and settling back, and the face changing during the move.

| Fighter | Look at | Keys |
|---|---|---|
| **Bow** | Chair jab: she twists back, does a full turnaround on a skip, then lands happy | X |
| | Snowballs: hands up, eyes shut, rises on her toes, flings both ways | ↓ + C |
| | Teleport: two fast turns, stretching thinner as she fades | C |
| | Chair Slam: three spins with the chair out, then the chair overhead, then squashed flat | ↑ + C |
| | Up smash: hold the charge, see the crouch and tremble, then the swing up | ↑ + V |
| | Run and jump: continuous stride; stretched rise, loose top, arms up falling | ← / →, ↑ |
| **Needle** | Three pricks (show picture): three stabs, the last carried through | X |
| | Riposte Stance (show picture, mad): reared back, then the thrust | V |
| | Up special (drawn): straight up, point first | ↑ + C |
| | A tilt and an aerial (drawn shapes, glaring face) | ↑ + X, ↓ + X, X in the air |
| **Match** | Head strike: rocks back off her head, whips it through, rings back | X |
| | Triple Spark: nod back, head flick | C |
| | Twirl up special | ↑ + C |
| | Down smash: low, two full turns with the leg out | ↓ + V |
| | Neutral smash: head swung back, then brought down, flattened | V |
| **Clover** | Punch with a skip and a quarter twirl, a hop on landing | X |
| | Butterflies: arms up, full twirl | C |
| | Lucky Wind: tipped back, arms out like a leaf, a lazy half turn | ↑ + C |
| | Meant for Me: a pleased shrug up on her toes | ↓ + C |
| | Lucky Break (neutral smash): bends right down, then springs up tall | V |
| | Up / down smash | ↑ + V, ↓ + V |
| | Lucky Leaf Pinwheel (finisher): spins up, faster and faster | V + C |
| **Blueberry** | Lazy punch: slow lean, a long hold, one heavy shove, left out there | X |
| | Palanquin Catch: arms up lifting, a straining hold, then dropped | C |
| | Play Dead: drops flat, eyes shut, gets up late | ↓ + C |
| | Stomp smash: foot up slow and high, down like a weight | V |
| | Up smash heave | ↑ + V |

If something looks wrong, these are the likeliest places:
- Arms swung on a picture whose painted limbs are odd (Clover's back arm is painted raised; Blueberry's legs are painted sideways).
- The turnaround drawn with the chair prop.
- A small snap when Match's down smash or Blueberry's up smash is released: their charge pose is not quite their first pose.
- Unchecked moves: moves the test matches never used fall back to the shared shape for their kind. Examples are Blueberry's Heave-Ho, Match's Burn Trap and the throws. I never saw any of them drawn.

## Checks

- Syntax check: 2 scripts, 0 failed.
- Boot check (alone, below normal): 0 bad positions, no errors, 0 control bytes, 0 bare LF, no hidden names, kit guard ok.
- **State-hash no-op:** three seeded CPU matches of 3600 frames each, with `draw()` called after every `step()`. The game state was hashed every frame: every fighter field, the projectiles, item and summon counts, and the dice count.
  - Run on `beca9bb5` (the `g-update6` commit this branch starts from) and on `g-anim1`, every frame's hash is identical: 0 differing frames in all 3 matches. `draw()` rolled 0 dice on both.
  - The harness makes every picture "decode" at once, so the frame layer and limb paths really run. A counting pass confirmed the new code ran tens of thousands of times per match.
  - The harness also freezes the wall clock to 1/60 s per frame. Without that, two runs of the same build already differed, because the CPU uses time budgets.
