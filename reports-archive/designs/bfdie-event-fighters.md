# Bottle, Sticker, Needy, Jammy, Hot Dog: twists and movesets

*Design only. Nothing in the game was changed. For the owner to approve before anything is built.*

**Summary**

1. Each fighter has ONE big idea that runs through the whole kit: Bottle flips and hides, Sticker stashes and backstabs, Needy is Lazy or Trying, Jammy is Lid On or Lid Off, Hot Dog tries the same thing again, harder.
2. Every move has a hook (sweet spot, clean/late hit, hold, cancel, armour, status, movement or a strong picture). Each fighter has 2 sweet spots.
3. Three twist pitches per fighter (pick 2). None repeats a built twist, a contest, or an unstarred contest pitch.

---

## Read this first

**Move slots.** I matched the list the game really has (MS_SLOTS, the smash code and MOVE_TEXT in index.html):

- jab, up-tilt, down-tilt
- five air moves
- grab, pummel, four throws
- neutral, up and down special
- smash, up smash, down smash
- finisher, Final Smash

Three things you asked for are different in the game:

- **Dash attack:** the game has no dash-attack slot. None is designed.
- **Forward tilt:** side-tilts are switched off. Left/right + X is the jab. One stored line each, in case they come back.
- **Side special:** switched off too. One stored line each.

**Rules I held every move to**

- Anything that really launches (smashes, finishers, launching specials) has a tell of 20 frames or more. Smashes already have the 24-frame charge ring.
- Jabs, tilts and air moves only pop a foe a little, for combos. I read the tell rule as not meaning those. Say so if you want it on them too.
- No sky drops. Nothing falls on anyone from above the screen.
- No words drawn in a match.
- Numbers are rough. The builder tunes them. 60 frames = 1 second.

**Where the show facts come from**

- "Brief" = the wiki facts you gave me for this job. Safe.
- "Old doc" = `reports-archive/event-fighters-bfdie.md`, the earlier design of four of these fighters. I did not re-check its facts against the wiki. Each one is marked.
- Where a move is my own idea with no show moment behind it, the Source column says "character" (it comes from who they are, not from a scene).

**The old doc.** It already had kits for Hot Dog, Needy, Sticker and Jammy. This doc replaces those kits. I kept a few of its ideas where they were good (Needy's serum buff-then-crash, the trampoline, Hot Dog's fall off the pole) and say so in the tables. Bottle is new.

---

# A) TWISTS (pick 2 each)

A star marks the two I would pick. They are only my guess.

## Bottle

1. **Death P.A.C.T.** (star)
   Each fighter gets one save per stock.
   The first time you would be KO'd off the side, a P.A.C.T. net catches you and tosses you back.
   From: her team, which exists to stop deaths.
2. **Ooh, Shiny!** (star)
   An item pops up every 4 seconds, but it vanishes after 3.
   Grab it fast or lose it.
   From: she is easily distracted.
3. **Bottle Flip**
   Everyone's second jump is a full flip.
   Land it on a floating platform, on your feet, and your next hit is 25% stronger.
   From: bottle flipping.

## Sticker

1. **Backstab** (star)
   A hit to a fighter's back launches 30% farther.
   Watch which way you face.
   From: they backstabbed Beach Ball.
2. **Sunset** (star)
   The light slowly sets through the match.
   As it gets more orange, every launch gets a little longer: up to 25% more in the last 30 seconds.
   From: the sunset on their face.
3. **Lost Your Tape**
   Everyone wears a strip of tape.
   A launching hit knocks it off, and it lies where it fell.
   Without it you fly 20% farther. Walk over your own strip to stick it back on.
   From: they are helpless without their tape.
   (The most work of the three to build.)

## Needy

1. **Now I Care** (star)
   Whoever is losing glows pink and hits 15% harder.
   It moves to the new last place as the match changes.
   From: she finds out that caring about winning is exciting.
2. **On Point** (star)
   Every melee attack gets a sweet spot at its tip.
   Tip hits launch more. Close hits launch less.
   From: a syringe only works at the point.
3. **Mystery Dose**
   Pink syringes lie around as pick-ups.
   Each gives a 6-second effect you can't see coming: fast, strong, tiny or heavy.
   From: nobody knows what her pink liquid is.

## Jammy

1. **Lids On** (star)
   Everyone starts each stock with a lid.
   The first launching hit just pops the lid off with a "pop" and does no launch.
   From: her gingham lid, and being fragile.
2. **In the Jar** (star)
   The stage sits inside a giant glass jar, so the sides are walls.
   The only way out is the top. Every 30 seconds the lid lifts for 10.
   From: she is a jar.
3. **Spilled Jam**
   Every hard hit knocks a blob of peach jam out of the fighter who was hit.
   Anyone else can eat it to heal 3%.
   From: her jam spills when she cracks.

## Hot Dog

1. **Even Angrier** (star)
   Every time you lose a stock, you come back hitting 10% harder. It stacks.
   From: he kept dying on his pole and coming back for more.
2. **Too Stubborn to Flinch** (star)
   Weak hits (under 5%) still hurt, but they do not interrupt anyone.
   From: he is stubborn.
3. **No Mistakes**
   Miss with a smash and you are stuck 50% longer.
   Land one and you recover faster.
   From: he bluntly points out everyone's mistakes.

**Checked against:** real edges, food only, throwables only, spleef, sponge floor, dig floor, rising staircase, berries, shrinking floor, pull, low gravity, wind back, fast forward, rain, basket, collection, jawbreakers, sticky pillars, gusts, lights out. Also the five chosen contests and the ten unstarred pitches.

**Closest calls, so you can judge:**

- Death P.A.C.T. is the opposite of "real edges", not a copy of it.
- Mystery Dose is an item rule, like food only and throwables only, but the effect is hidden.
- Spilled Jam heals like berries, but the jam comes from hits, not from the sky.
- I dropped a "light as paper" twist for Sticker because it was too close to low gravity.

---

# B) MOVESETS

## 1. BOTTLE (she/her): the cheerful flipper

**Big idea: stick the landing.** Her best moves flip her. Press at the right moment and she lands upright and keeps going. Miss and she lands on her side.

**Stats (in words)**

- Weight: light (about 68). She is glass.
- Run: a little quick. Air: average. Jump: a little high. Fall: a little fast.

**Trait: Handle With Care.** Fair, I think: it is a weakness with a small sting.

- If she is launched and hits the floor very hard without recovering, she shatters.
- She takes no extra damage, but she gets up 20 frames slower.
- The shards nick anyone standing right there for 3%.
- Source: she shatters when she hits the ground too hard (brief).
- To decide: should she join the glass list? Marshmallow's scream does 17% to glass.

| Slot | Name | What you see and what it does | Hook | Source |
|---|---|---|---|---|
| Jab | Pat, Pat, Whoops | Two friendly pats, then she bumps heads by accident. 2%, 2%, 3%. | The third hit only comes if you keep pressing. Stop at two to grab instead. | character (oblivious) |
| Up-tilt | Ooh, What's That? | She looks up and points. Her finger pokes above her. 4%. | The foe looks up too: a few extra frames of stun, so an air move follows. | brief (distracted) |
| Down-tilt | Shoe's Untied | She bends to look at her foot and bonks low with her neck. 4%. | She ducks under high hits while she is bent over. | character |
| Forward tilt (stored) | High Five | A big open hand, forward. 5%. | Clean hit early, weak late. | character |
| Neutral air | Happy Twirl | Arms out, one spin. 2 hits of 2.5%. | The second hit pops them up toward her. | character |
| Forward air | Wave Hello | A big sweeping wave. 6%. | Clean hit (start of the wave) is strong, late hit is a tap. | character |
| Back air | Didn't See You There | She backs into them with her thick glass base. 9%. | SWEET SPOT: the centre of the base. A glass "clonk" and a longer launch. | character |
| Up air | Rim Shot | The rim of her neck jabs up. 5%. | Fast, low lag: it juggles into itself twice. | character |
| Down air | Bottoms Down | She drops base-first. 8%. | Hit a foe and she bounces off their head. Miss from high up and she lands hard (18 frames). | brief (fragile) |
| Grab / pummel | Bestie Hug / Squeeze | A hug. Each squeeze 1.5%. | Normal reach. | brief (best friends) |
| Forward throw | Off You Go! | A cheerful shove. 6%. | Sends them low, toward the edge. | character |
| Back throw | Whoops | She trips backward and they go over her head. 7%. | She ends up lying low, under high hits for a moment. | character |
| Up throw | Flip You | She flips the foe like a bottle. They spin up. 5%. | At low damage they land on their feet right in front of her: a guessing game. | brief (bottle flipping) |
| Down throw | Sit Down, Contestant | She sits them down, like a host. 4%. | Knockdown: she gets to act first. | brief (she hosted) |
| Neutral special | And You're Dead! | She points and happily calls it. A slow bubble with a dizzy face floats ahead (20-frame tell). 4%. | The foe it touches is "called" for 4 s: the next hit they take launches as if they had 25% more damage. If they are KO'd while called, she heals 5%. She was right, for once. | brief (catchphrase) |
| Up special | Flip It! | She flips up, spinning. 5% on the way up. | Press C again just as she comes upright: she sticks it, gets a small extra hop and no landing lag. Miss: she lands on her side, 20 frames. | brief (bottle flipping) |
| Down special | Best Hiding Spot | She ducks away and goes almost invisible for up to 1.5 s. She can walk slowly. Dust puffs show her steps. | Her first hit out of hiding from BEHIND a foe is a surprise: a short stun. Any hit on her ends it. | brief (hide-and-seek expert) |
| Side special (stored) | Ready or Not | A quick seeker's dash with the dash tell. 6%. | Passes behind a shielding foe. | brief |
| Smash | Out of Harm's Way | She winds up and shoves with both hands, "saving" them. 19%. | SWEET SPOT: her palms, at the very end of the shove. Close in, it is a weak push. | brief (Death P.A.C.T. prevents death) |
| Up smash | Yay! | She jumps for joy, both fists up. 16%. | Clean hit (the first frames) launches high. Late hit is weak. | brief (optimistic) |
| Down smash | Spin the Bottle | She drops flat and spins on the floor. Neck and base sweep both sides. 4 light hits, then a launch, 15% in all. | The spin drags foes round. Whoever her neck points at when it stops takes the launch. | character |
| Finisher | Test Dummy | She salutes (20-frame tell), then flings herself forward like a crash-test dummy. 13%. | Weak hits don't stop her. If she reaches a wall she shatters: the shards hit again for 4%, and she is slow to get up. Risk and reward. | brief (A-twos-ment Park test dummy) |
| Final Smash | Ready or Not, Here I Come | The lights go out. A flashlight sweeps, looking for her. She pops out behind the nearest foe ahead (and anyone beside them) three times, then bonks them away. About 28%. | The picture: the dark, the flashlight cone, and Bottle in a new spot every time. | brief (hide and seek) |

**Looks like something we have, and why it differs**

- **Flip It!** vs Eraser's Steakhouse Flip (a backflip kick) and Beach Ball's Way Too High (straight up). Hers is a timing press to land upright. Nobody has that.
- **And You're Dead!** vs Profily's Price Tag (marks the nearest foe for 30% more damage, 5 s). Hers is a slow shot you can dodge. It changes one launch, not damage, and it heals her if she called it right.
- **Best Hiding Spot** vs the "lights out" twist. Lights out is only a look. This is one fighter, 1.5 s, with dust puffs. Builder note: the CPUs need a rule for it (they should lose her, not track her).
- **Bottoms Down** vs the other head-bounce down airs (Pencil Plant and others). The bounce is shared. The hard landing on a miss is hers.
- The name "Flip" is also in Liy's Flip Switch and Taco's Griddle Flip. Different moves, similar word.

---

## 2. STICKER (they/them): the dirty glider

**Big idea: cheat.** They stash what is thrown at them, slip behind you, and bring their own trampoline.

**Stats (in words)**

- Weight: very light (about 56).
- Run: average. Air: quick. Jump: average. Fall: slow.

**Trait: Side to Side.**

- Hold jump while falling and they flutter down slowly, swaying left and right like a falling sticker. You steer the sway.
- It is not a dart like Foldy's plane. It gains no height.
- It stops for 2 s when they are carrying a stashed shot (see the neutral special).
- Source: they glide side to side when falling (brief).
- Their weakness is built in: paper is light, so they die early.

| Slot | Name | What you see and what it does | Hook | Source |
|---|---|---|---|---|
| Jab | Corner Flick | Two flicks with a peeling corner. 2%, 2.5%. | Hold X for a paper flutter of fast light hits that ends in a slap. | character |
| Up-tilt | Peel Up | The top corner peels up over their head. 4%. | The sticky side drags the foe down in front of them, ready for a combo. | character (sticky) |
| Down-tilt | Paper Slide | They go flat and slide forward along the floor. 3.5%. | Slides under shots. Pops the foe up behind them. | character (paper) |
| Forward tilt (stored) | Edge Swipe | A quick swipe with the paper edge. 5%. | Very fast start. | character |
| Neutral air | Loose Flutter | They flap round like a sticker in the wind. 4 hits of 1.5%. | Slows their fall while it lasts. | brief (lightweight) |
| Forward air | Sharp Edge | A quick slice with the paper edge. 5%. | Fast enough to land two in one jump. | character |
| Back air | Sticky Side | They turn their gummed back to the foe. 6%. | The foe sticks to them for a moment and is carried along, then pops off. Risky off the edge: Sticker is light. | character (sticky) |
| Up air | Corner Poke | Two quick pokes upward. 2% and 3%. | The second poke only comes out if the first one hit. | character |
| Down air | Stick the Landing | They go flat and drop onto the foe below. 6%. | They stick to the foe's head for a beat, then kick off (a free jump). It pushes the foe down a little. It does not spike. | old doc (kept) |
| Grab / pummel | Sticky Hand / Peel | The grab reaches a little farther but starts slower. Pummel 1.3%. | Reach for speed. | character |
| Forward throw | Slip Switch | They swap places with the foe and shove. 6%. | Puts THEM on the safe side. | old doc (not re-checked) |
| Back throw | Nothing Personal | A smile, then a shove in the back. 8%, their strongest throw. | Launches farther near an edge. | brief (backstab) |
| Up throw | Bounce Them | A small trampoline pops under the foe. 4%. | The bounce is the same height at any damage: a reliable air combo. | brief (trampoline) |
| Down throw | Tape Down | They tape the foe flat to the floor. 4%. | Knockdown. Sticker gets a free step. | brief (tape) |
| Neutral special | Under the Sticker | They lift a corner for a moment. An enemy shot that touches it is stashed (a lump shows under them). Press C again to whip it back: same damage plus 2%. | They keep it for up to 6 s and pick the moment. Empty stash: they flick a scrap of the Announcer, 4%. | brief (stores things; hid the Announcer's parts) |
| Up special | Trampoline Cheat | A trampoline slaps down under them and they bounce high. 5% at take-off only. | On the ground it stays 3 s and ANYONE can use it, foes too. SWEET SPOT: land dead centre for a higher bounce. | brief (trampoline up the pole) |
| Down special | Backstab | A sunny smile and a hand held out (20-frame tell). Then they slip behind the foe in front and slap. | SWEET SPOT: the slap lands on the foe's back: 10% and a launch. If the foe turned round in time: 4% and a tap. Nobody in reach: they stumble and are open. | brief (backstabbed Beach Ball) |
| Side special (stored) | Head Start | A sneaky early dash, with the dash tell. 5%. | Goes through a foe. | brief (cheater) |
| Smash | Peel Out | They peel their corner back like a spring, then it cracks forward like a whip. 18%. | Only the corner tip launches hard. Close in it is weak. | character |
| Up smash | Curl Up | Both top corners curl up and snap. 15%. | Pulls foes in from the sides first, then launches them up. | character (paper curls) |
| Down smash | Doormat | They lie flat on the floor, then whip both ends up. 14%. | While charging they are flat, and high hits miss them. Hits both sides. | character |
| Finisher | Everything Under the Sticker | They lift themself like a lid (20-frame tell). A burst of stashed junk sprays ahead: springs and scraps, then a speaker box. 5 hits, 13% in all. The last one launches. | A stashed shot is added to the volley. | brief (hid the Announcer's broken parts) |
| Final Smash | Stuck On You | They grow huge and slap onto the screen like a sticker on the camera. The sunset fills the view and flattens the nearest foe ahead and anyone beside them. Then they peel off, and the foes come away stuck to the back and are flung. About 27%. | The picture: the whole screen is the sticker. | brief (it is a sunset sticker) |

**Looks like something we have, and why it differs**

- **Under the Sticker** vs three moves:
  - Tapey's Record/Playback keeps a damage number. Sticker keeps the shot itself.
  - Black Hole's Accretion takes loose items into orbit. Sticker takes enemy shots.
  - Ruler's Straight Edge turns a shot back at once. Sticker holds it and chooses when.
- **Side to Side** vs Foldy's Fold and Fly. Foldy darts forward 330 px. Sticker only sways down slowly.
- **Trampoline Cheat** vs the spring item and Book's Pop-Up Page. It is shared with foes, and it has a centre sweet spot. The idea was in the old doc.
- **Backstab** vs Liy's Flip Switch (an untouchable dash that grabs). Sticker's is a step behind, and it is only strong on the back.
- **Paper Slide** and **Doormat** go flat on the floor. Profily's Edge-On Slice goes thin sideways and glides. Different shape.
- Profily's Price Tag "slaps a sticker" on a foe. No Sticker move puts a sticker on anyone, on purpose.

**If Sticker has no arms** (I have not checked their picture). Most of the kit is corners, edges and the sticky back, and needs none. These rows would change:

- Grab (Sticky Hand): a top corner peels out and sticks to the foe instead. Same reach.
- Back throw (Nothing Personal): a smile, then a flat body bump in the back.
- Down throw (Tape Down): they press their own sticky side over the foe to pin them. No tape is pulled.
- Down special (Backstab): the tell is the sunny smile and a friendly lean in, with no hand held out. The hit is a corner slap.
- Up special (Trampoline Cheat): the trampoline slides out from under the sticker, which fits the stash anyway.

---

## 3. NEEDY (she/her): lazy, until she isn't

**Big idea: Lazy or Trying.** She starts every stock Lazy. Fighting wakes her up.

- **Lazy:** slow, weak, half-shut eyes. She heals slowly.
- **Trying:** she switches after she lands 5 hits or takes 30%. Wide eyes, serum bubbling. She moves faster, her moves start 3 frames sooner and hit 10% harder. She stops healing.
- Her nap (down special) takes her back to Lazy.

**Stats (in words)**

- Weight: light-middle (about 72).
- Ground speed: slow when Lazy, quick when Trying. Air: average. Jump: average. Fall: a little slow.
- How she moves: she has no legs. She slides along the floor, pushed by small pumps of her plunger. Lazy: a slow drift. Trying: quick pumps. Her jump is a bounce.

**Trait: Regenerate.**

- Lazy only: 1% every 2 seconds, after 3 seconds of not being hit and not attacking. At most 15% a stock.
- Fair, I think: it only works while she is at her weakest, and it has a cap.
- Source: she can regenerate (brief).

**Doses.** She carries 3 doses of serum. One comes back every 8 s.

**No limbs at all (owner, 2026-11-17; checked on her BFDIE picture).** Needy is a syringe lying on its side: plunger at the back, needle at the front, face on the barrel. No arms, no legs. Every move below uses her needle, her plunger (it moves by itself), the serum, or her whole body sliding, rolling and bouncing. Rows marked CHANGED were rewritten for no arms. Rows marked CHANGED: limbless were rewritten again for no legs.

| Slot | Name | What you see and what it does | Hook | Source |
|---|---|---|---|---|
| Jab (CHANGED: limbless) | Lazy Poke | She barely moves. She slides forward a little and the needle pokes once. 3%. | The longest jab reach of the five. Trying: three fast pokes instead. | brief (lazy) |
| Up-tilt (CHANGED) | Eye Roll | She rolls her eyes, rocks back onto her plunger end, and her needle tips up over her head. 4%. | Only the tip pricks: longer stun there. | brief (apathetic) |
| Down-tilt (CHANGED: wording) | Trip Wire | She flops down flat so her needle lies low along the floor, and lets them walk into it. 3.5%. | Hold it for up to 1 second. It trips whoever touches it. | character (lazy) |
| Forward tilt (stored) | Long Poke | The needle goes out long and thin. 5%. | Range. | old doc |
| Neutral air | Barrel Roll | She rolls over and over like a dropped syringe. Lazy: 2 hits of 3%. | Trying: 4 faster hits of 2%. | old doc (kept) |
| Forward air | Point First | The needle straight ahead. 6%. | SWEET SPOT: the very tip, 8% and a real pop. The barrel is a weak bump. | character |
| Back air | Plunger Bash | The flat plunger end knocks into whoever is behind. 8%. | Wide and flat: easy to land, slow to start. | character |
| Up air | Squirt | A small pink squirt upward. 3%. | It reaches past her body. A foe it tints is slowed for half a second. | brief (pink liquid) |
| Down air | Point Down | She drops needle-first. 7%. | Clean hit (first frames) knocks them down and forward. Miss and the needle sticks in the floor for 16 frames. Trying: she can jump out of a hit. | old doc (kept) |
| Grab / pummel (CHANGED) | Needle Pin / Sip | A short lunge: the needle pins the foe and they hang on the tip. Each sip draws a little out of them, 1.3%. | Short reach, but it starts fast. No hands needed. | old doc (reworked) |
| Forward throw (CHANGED) | Not My Problem | With the foe stuck on her needle, she gives one bored toss of her head and they slide off. 6%. | Fast: little time to react. | brief (apathetic) |
| Back throw (CHANGED: limbless) | Roll Over | She rolls sideways over the foe like a dropped syringe and they pop out behind her. 7%. | Moves her forward as she does it. | character |
| Up throw (CHANGED: wording) | Pump | She tips her needle up and her plunger pumps once by itself: a puff pops them off the tip. 5%. | Sets up Squirt or Point First. | character |
| Down throw (CHANGED: limbless) | Booster Shot | She drops the foe, bounces up once, and comes down needle-first on them. 4%. | Uses a dose: a short Evil Serum (3 s, with a 6% crash). No dose: just the 4%. | brief (serum) |
| Neutral special (CHANGED: wording) | Evil Serum | Her plunger slides back by itself and the pink glows (20-frame tell). Then she lunges, needle first. Uses a dose. | SWEET SPOT: the needle tip injects. The foe goes evil for 6 s: red eyes, and THEY hit 20% harder. Then they wobble and crash: 12% and a knockdown. The barrel: 4%, no serum, dose kept. | brief (evil serum, then they die) |
| Up special (CHANGED: limbless) | Leave the Rest | Her back half, plunger and all, pops off like a rocket stage and she shoots up needle-first. The dropped half hits right below her for 5%, at the split only. | She is "half" for 2 s while it grows back: smaller, lighter, and she cannot do it again until she is whole. | brief (regrew her burnt-off lower body) |
| Down special (CHANGED: limbless) | Why Bother | She just stops, shuts her eyes and settles on the floor for a nap. Heals 6% over 1.5 s. | It puts her back to Lazy. Any hit wakes her. She chooses: stay strong, or rest. | brief (lazy) |
| Side special (stored) (CHANGED: limbless) | Plunger Scoot | Her plunger pumps once and she shoots ahead along the floor, needle first. 5%. | Movement, with the dash tell. | character |
| Smash (CHANGED: wording) | Full Plunge | Her plunger slides all the way back while it charges, then slams home by itself: a hard pink jet. 18%. | The jet reaches farther the longer you charge. Close in, it launches. The far end only splashes and slows. | old doc (kept) |
| Up smash (CHANGED: limbless) | Piston | She bounces up and sticks her needle in the floor, balanced on her tip. Her plunger shoots up, flat end first. 15%. | Lazy: one pump. Trying: two, and the second catches a foe who jumped the first. | character |
| Down smash (CHANGED: limbless) | Knocked Over | She rolls along the floor one way, then back, like a syringe knocked off a table. 14%. | Hits both sides. Hold a direction to choose which side she ends on. | character |
| Finisher (CHANGED: limbless) | I Actually Care Now | She jolts awake, eyes wide (20-frame tell). Her plunger pumps her forward in short bursts, a stab with each pump, then one big plunge that launches. 12%. | From Lazy it flips her straight to Trying. Already Trying: 8 stabs, not 5 (14%). | brief (becomes competitive) |
| Final Smash (CHANGED: wording) | Maximum Dose | She leaps and lands needle-first on the nearest foe ahead. Her plunger drives all the way down by itself. They swell pink, go red-eyed, and pop. About 30%. Foes beside them are splashed: they wobble and fall over. | The picture: the swell and the pop. No puppets, no control changes. | brief (evil serum) |

**Looks like something we have, and why it differs**

- **Evil Serum** vs Gelatin's syringe moves (three jab pokes; a thrown Freeze Syringe). Needy's is one melee thrust with a tip. It makes the foe STRONGER first, then crashes them. No freeze, no poison. The buff-then-crash idea was in the old doc.
- **Up special.** The old doc gave her "Plunger Jet", squirting down to fly. That is Rocky's Barf Jet Rocket again, so I dropped it. Leave the Rest replaces it.
- **Up smash.** Needle's Skyward Prick is a tip-up stab, so Needy does NOT stab up. Hers is the flat plunger, a different shape.
- **Point Down** vs Pencil's Pencil Plant (dive point-first, jump out on hit). Same shape. Needy's differs by sticking in the floor on a miss, and the jump-out only when Trying. If that is still too close, tell me and I will swap it.
- **Why Bother** vs Spongy's Soak Up and Eraser's Rub It Off (stand still, get something). Hers heals and changes her mode.
- **Lazy/Trying** vs Beach Ball's pump sizes and Liy's lights. It changes with the fight, not with a button, and the nap is the cost.
- **Why Bother** vs a finisher we have, "I Merely Pretended" (flops down as if knocked out, as a trick). Needy's nap is a real rest that heals and changes her mode. It is no trick.
- **Plunger Scoot** and her plunger-pump movement push her along the floor. That is not Rocky's Barf Jet Rocket, which flies upward on a stream.
- **Needle Pin** (the grab) is new. Grabs are not listed in MOVE_TEXT, so I could not check it against the other fighters' grabs.

---

## 4. JAMMY (she/her): the careful jar

**Big idea: Lid On or Lid Off.**

- **Lid On:** tidy, sturdy, exact.
- **Lid Off:** jam sloshes out of every move. More reach, and it "jams" the foe: their jumps are half height for 1.5 s. But she is launched 15% farther.
- She takes the lid off herself (neutral special). A single hit of 12% or more knocks it off for her.
- The lid lies where it fell. Touch it to put it back on. It rolls home by itself after 6 s. Foes cannot take it.

**Stats (in words)**

- Weight: light-middle (about 76).
- Run: a little slow. Air: average. Jump: average. Fall: a little fast (a full glass jar).

**Trait: the lid** (above). Fair, I think: her stronger mode is also her fragile one.

- "Jammed" (half-height jumps) is the same effect as Golf Ball's curse, by the old doc. It is said here openly.
- Source: fragile, and her jam spills when she is cracked (brief).

| Slot | Name | What you see and what it does | Hook | Source |
|---|---|---|---|---|
| Jab | Lid Tap | Two small bonks with her lid, tipping forward. 2.5%, 3%. | Lid Off: a blob of jam flicks out instead, a bit longer. | character |
| Up-tilt | Um, Excuse Me | She meekly raises a hand. It pokes above her. 4%. | Hold it up to keep the hand raised: it pokes again. | brief (meek; tried to get the Announcer's attention) |
| Down-tilt | Low Slosh | She tilts forward and the jam swings low. 4%. | Lid Off: it spills at their feet and jams them. | brief (jam) |
| Forward tilt (stored) | Jar Nudge | She leans in and nudges. 5%. | Fast. | old doc |
| Neutral air | Jar Rattle | One spin. The jam inside keeps going after she stops. 3%, then 3%. | A late second hit (the slosh) catches a foe who came in after the first. | character |
| Forward air | Lid Bonk | She swings her lid edge forward. 6%. | Lid Off: no lid. A wider, weaker jam swipe that jams. | character |
| Back air | Glass Bottom | She bumps backward with the thick base. 8%. | SWEET SPOT: the centre of the base. A "clink" and a longer launch. | character |
| Up air | Bubble Up | A jam bubble rises from her top and pops. 4%. | The pop reaches above her body. Lid On: a quick lid flip instead, faster and shorter. | character |
| Down air | Heavy Bottom | She tips over and drops base-first. 7%. | Lid Off: landing splashes jam to both sides. No cancel: glass lands heavy. | old doc (kept) |
| Grab / pummel | Henchman's Grip / Jam Dab | Normal reach. 1.4%. | | brief (henchman) |
| Forward throw | Excuse Me | A polite shove. 6%. | Low, toward the edge. | brief (meek) |
| Back throw | Henchman Carry | She lugs them backward three steps, then dumps them. 7%. | Carries them toward the edge behind her. | brief (henchman) |
| Up throw | Lid Lift | She pops them up off her lid. 5%. | Lid On only. Lid Off: a weaker jam toss. | character |
| Down throw | In the Jam | She dunks them. 4%. | Jams them: an easy follow-up. | brief (Sticker drowned in her jam) |
| Neutral special | Lid Off | She twists her gingham lid off (20-frame tell) and spins it ahead about 200 px. 6%. It lies where it lands. | This is the switch to Lid Off. With the lid already off: nothing to throw, a short jam flick, 3%. | brief (gingham lid) |
| Up special | Seal Pop | She ducks into her jar and pressure builds. Then a "pop" shoots her up. 5% to anyone beside her. | Lid On: a high pop. Lid Off: no seal, so only a small hop. Messy mode has the bad recovery. | character (a sealed jar) |
| Down special | Duck and Cover | Lid On: she pulls the lid down over herself for half a second. Hits do half damage and cannot launch her. A grab beats it. | Lid Off: it calls the lid home. It rolls back along the floor and trips foes on the way (3%). Throw it past them, then call it back through them. | brief (meek; a henchman so she would not be dropped) |
| Side special (stored) | I Want Out | She backs away fast. | Movement. | old doc |
| Smash | Jar Slam | She tips forward and slams her whole jar down, glass first. 19%. | SWEET SPOT: the bottom edge of the jar. Lid Off: a wave of jam rolls out ahead, with more reach, and jams. | character |
| Up smash | Screw Top | Her lid twists up in a spiral: three small hits, then a pop. 15%. | Lid Off: one wide burst of jam upward. Fewer hits, bigger area. | character |
| Down smash | Stir | She spins on her base. 14%. | Lid On: the glass hits both sides, close. Lid Off: a wider ring of jam, weaker, jams. | character |
| Finisher | I SAW That! | A deep breath and her glass fogs (20-frame tell). Then the one loud shout of her life, a cone ahead. 12%. | CAUGHT IN THE ACT: a foe hit in the middle of their own attack is launched half again as far. | brief (tried to report the cheating) |
| Final Smash | Drowned in Jam | She cracks wide open and a wave of peach jam rolls ahead. The nearest foe and anyone beside them sink in it and struggle, then a jam geyser throws them out. About 27%. She seals back up. | The picture: the orange wave, and only their hands showing. | brief (Sticker drowned in her jam) |

**Looks like something we have, and why it differs**

- **Lid Off** vs Pen's Cap Shot (a cap boomerang) and Cap Sentry. Jammy's lid does not come back by itself in flight and does not shoot. Throwing it changes her whole kit.
- **Jam** vs the many puddles (Barf Bag, Donut, Marker, Rocky, Pen, Bubble). I gave her NO puddle that lies on the floor. Jam only comes out with a hit.
- **I SAW That!** vs Marshmallow's Shattering Scream (a stun). Jammy's is a launch with a bonus for catching a foe mid-attack.
- **Duck and Cover** vs the armour stances (Sidewalky, David, Liy). Half a second, Lid On only, and a grab beats it. The lid recall is the part nobody has.
- **Drowned in Jam** is close to the unstarred "Jam Flood" pitch in name only. That was a match rule. This is her Final Smash.
- **Glass Bottom** and Bottle's **Didn't See You There** are both a glass-base back air with a centre sweet spot. That is a look-alike INSIDE this set. If you want only one, I would keep Jammy's and give Bottle a clean/late hit.

**If Jammy has no arms** (I have not checked her picture). These rows would change:

- Up-tilt (Um, Excuse Me): she tips her lid up like a raised hand. Holding it keeps the lid up.
- Forward air (Lid Bonk): she nods her whole jar forward so the lid edge hits.
- Grab (Henchman's Grip): she tips forward and catches the foe under her lid.
- Forward throw (Excuse Me): a small jar nudge.
- Back throw (Henchman Carry): she carries them balanced on her lid, three steps back, then tips them off.
- Down throw (In the Jam): she tips over and pours a little jam on them.
- Neutral special (Lid Off): she spins on the spot and the lid unscrews and flies off.
- Down special (Duck and Cover): she ducks down into her jar and the lid drops shut over her.

---

## 5. HOT DOG (he/him): the stubborn one

**Big idea: I Can Do THIS One.**

- When one of his moves fails (it missed, was blocked, or he was hit out of it), the SAME move done again right away is a "retry".
- A retry does 15% more and shrugs off weak hits.
- It stacks twice. Steam comes off him so you can see it.
- Any other move, or 3 seconds, clears it.
- You can read him, because he keeps doing the same thing. That is the point of him.

**Stats (in words)**

- Weight: middle-heavy (about 100).
- Ground speed: a little slow. Air: a little slow. Jump: average. Fall: a little fast.
- How he moves: he has no legs. He rocks and hops along on the bottom of his bun, and slides when he charges. His jump is a bounce.
- A long, low body: easy to hit from the side. No shots at all.

**Trait:** the retry rule above. Fair, I think: it only rewards a move that just failed.

- Source: he kept climbing the same deadly pole and dying, and would not switch (brief).

**No limbs at all (owner, 2026-11-17; checked on his BFDIE picture).** Hot Dog is a bun with a sausage, mustard and onions, and his face is on the bun. No arms, no legs. Every move below uses his bun (bumping, scooping, clamping shut), his sausage ends, mustard, onions, the pole, or his whole body hopping, sliding and spinning. Rows marked CHANGED were rewritten for no arms. Rows marked CHANGED: limbless were rewritten again for no legs.

| Slot | Name | What you see and what it does | Hook | Source |
|---|---|---|---|---|
| Jab (CHANGED: limbless) | Bun Bump | He rocks back and bumps with his bun. 3%, 3.5%. | Hold X and he keeps bumping, one small hop forward each time. | character |
| Up-tilt | Bun Flip | He rears up and flips his front end over. 5%. | His back end swings too, so it hits behind him as well. | old doc (kept) |
| Down-tilt (CHANGED: limbless) | Bun Scoop | He dips, and the bottom lip of his bun scoops under the foe. 4%. | It tips them up and over him, so they land BEHIND him, ready for Tail End. | character |
| Forward tilt (stored) | Bun Shove | The flat of his bun, forward. 6%. | Pushes far. | old doc |
| Neutral air | Roller Grill | He spins along his length like a hot dog on a grill. 4 hits of 2%. | The last hit pushes away. | old doc (kept) |
| Forward air | Headlong | He throws himself bun-first. 7%. | It carries him forward: an air move that is also movement. | old doc (kept) |
| Back air (CHANGED: limbless) | Tail End | He bucks, and the back end of his sausage swings out behind him. 9%. | SWEET SPOT: the very tip of the sausage. Nearer the bun it is weak. | character |
| Up air | Mustard Pop | A short squirt of mustard straight up. 4%. | Reaches above him. Weak, but it juggles. | brief (mustard) |
| Down air | All the Way Back Down | He goes stiff and drops end-first, the way he fell off his pole. 9%. | No cancel, ever. He bounces if he lands on a foe. Miss and he is stuck for a moment. | brief (kept falling off his pole) |
| Grab / pummel (CHANGED: wording) | In the Bun / Bun Press | He lunges and his bun snaps shut on the foe like a mouth. Each squeeze 1.8%. | The bun is the grab: no hands needed. Short reach, strong hold. | old doc |
| Forward throw (CHANGED: limbless) | Shown the Door | With the foe clamped in his bun, he hops forward three times, then opens up and bumps them out with his sausage end. 7%. | Carries them toward the edge. | character (blunt) |
| Back throw (CHANGED: limbless) | Wrong Way | He spins round on the spot with the foe in his bun and opens up mid-spin, so they fly out behind him. 8%. | He ends up facing the other way. | character (blunt) |
| Up throw (CHANGED: wording) | Up the Pole | He opens his bun and a pole pops up under the foe. 5%. | Sets up Mustard Pop. | brief (his pole) |
| Down throw (CHANGED) | Told You | He drops the foe and thumps his bun shut on them three times, scowling. 5%. | Knockdown. | brief (blunt and rude) |
| Neutral special (CHANGED) | That's Wrong. | He rears back, scowling (20-frame tell), then jabs his whole front end at the foe, nose to nose. Reach about 120 px. 6%. | SWEET SPOT, by timing: hit a foe who has just MISSED a move and it is 12% and a dizzy stun. He is telling them their mistake to their face. | brief (bluntly points out mistakes) |
| Up special (CHANGED: limbless) | Same Pole | A pole shoots up under him and he rides it up, balanced on the top. He rises with little drift: up, not out. | Hold C and the pole pushes up again, up to 3 pushes, each slower. At the very top the trap goes off: it hits everyone there, HIM too (3%), and throws him even higher. The pole stands 2 s and anyone can stand on it. | brief (kept going up his deadly pole) |
| Down special (CHANGED: limbless) | Not Leaving | He drops flat, bun clamped shut, glaring, for up to 1.5 s. He will not budge: he cannot be launched. He still takes the damage. A grab beats it. | Let go and he lunges forward, bun first: 6%, plus 3% for each hit he took while down (up to 2). | brief (stayed in the Tinier Loser Chamber after it was destroyed) |
| Side special (stored) (CHANGED: limbless) | Go Through Me | He tucks down and slides a short way, shoving. 7%. | Dash tell. | old doc (not re-checked) |
| Smash (CHANGED: limbless) | Through You | He tucks down and slides a short way along the floor, bun first. 20%. | Weak hits do not stop the slide. If he reaches a wall he bonks and is dazed. | character (stubborn) |
| Up smash (CHANGED: wording) | Mustard Squeeze | His bun clamps tight on him and a zigzag of mustard shoots straight up. 15%. | Tall and thin. Strong low down, weak at the top. | brief (mustard) |
| Down smash (CHANGED: limbless) | Onion Scatter | He bounces up and thumps down hard. Chopped onions burst off him at floor height, both sides. 14% up close. | Like a shotgun: the closer the foe, the more pieces hit. | brief (onions) |
| Finisher (CHANGED: limbless) | Deadly Pole | He thumps the floor, and his pole grows up just ahead. It is harmless while it grows (over 20 frames). Then he rams it with his bun and its traps go off from the bottom up. 13% in all. | Where you stand decides what you get: low is a knockdown, the middle is small hits, the top is the launch. | brief (deadly pole) |
| Final Smash (CHANGED: limbless) | Tinier Loser Chamber | The chamber slams shut round him, the nearest foe ahead and anyone beside them. He will not leave. It blows apart and the foes go flying. He is still there in the rubble, bun shut, scowling. About 28%. | The picture: the last shot of him, not having moved. | brief (stayed after it was destroyed) |

**Looks like something we have, and why it differs**

- **Same Pole** vs Fern's Pole Jump (a spring up that roots). Hot Dog's leaves a real pole, is held to rise higher, and hurts him at the top.
- **Not Leaving** vs the armour stances (Sidewalky's Heavy Brace, David's Big Armor, Liy's lights). His is flat on the floor, a grab beats it, and it pays out as a lunge.
- **That's Wrong.** vs Jammy's **I SAW That!** Both reward a read, inside this set. His punishes a move that already missed. Hers catches a move in progress. Different timing, but tell me if two is one too many.
- **Through You** vs Life Ring's sprint and the other dash specials. His is the smash, with the charge ring as its tell, and the wall bonk as its cost.
- **Deadly Pole** vs Book's Pop-Up Page and Taco's Griddle Flip (a thing on the floor that flings). His hits differently at three heights.
- **Tinier Loser Chamber** is the name of an unstarred contest pitch. Here it is only his Final Smash.
- **Told You** (down throw) vs a finisher we have, "Sits Right On Them" (rolls onto a foe, sits and bounces on them). My first draft had Hot Dog sit on the foe too. I changed it to three bun thumps so it is not the same picture.
- **Same Pole**, now ridden instead of climbed, vs an up special we have, "No Prob-" (climbs straight up, slips, comes down on whoever is below). His does not come down on anyone, and the pole stays as a platform.
- **Not Leaving** stays put. It is a guard, not an attack on a pinned foe, so it is not "Sits Right On Them" either.
- **Down-tilt.** My limbless first thought was a hop and a thump that shakes both sides. That is the plain down-tilt about twenty fighters already have ("a low shockwave on both sides"), so I did not use it. Bun Scoop tips the foe over behind him instead.
- **Onion Scatter** does hit both sides low, as every down smash does. The onion pieces and the close-range bonus are what make it his.

---

# Not sure: please check before building

I did not look these up. I would rather say so than guess.

- **Arms.**
  - Settled on 2026-11-17: Hot Dog and Needy have no arms and no legs. I looked at their two BFDIE pictures myself. Their kits were redone twice, and the changed rows are marked.
  - How the game moves limbless fighters: 8-Ball, Cloudy, Stapy, Foldy and Beach Ball are listed with no arms and no legs, and their bodies do every move. I read that list and the comments beside it. I did not read each one's walk code, so "hops" and "slides" here are my description for the builder, not a copy of an existing walk.
  - Sticker and Jammy: I still have not checked. Each has an "if no arms" list under their table.
  - Bottle: I believe she has arms and legs, but I did not check. Her pats, wave, point, hug and shove need them.
- **Hot Dog's pole traps.** The brief says "deadly pole". The old doc names the traps: buzzsaws, spikes, a syringe, a flamethrower. I left the exact traps out of the tables until that is checked.
- **Old-doc facts I reused without re-checking:** Sticker's slip switch; Needy walking on water; "go through me".
- **The scraps in Sticker's stash.** The brief says they hid the Announcer's broken parts. Exactly which parts is my guess (springs, a speaker box).
- **Bottle's hosting.** I only used "she hosted and made mistakes". No episode moments are invented.

# Questions for you

1. Which 2 twists for each fighter?
2. Bottle on the glass list (Marshmallow's scream does 17%)? The old doc asked the same about Needy. Jammy is a glass jar too.
3. Two glass-base back airs (Bottle and Jammy): keep both, or change Bottle's?
4. Is Needy's Point Down too close to Pencil Plant?
5. Should the 20-frame tell also apply to tilts and air moves that only pop?
6. Bottle's Best Hiding Spot makes her nearly invisible for 1.5 s. Fun, or annoying to play against?
