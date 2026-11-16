# Event fighters, phase 1: the ten kits, the events and the new assist bag

*Design only. Nothing in the game or the repo was changed. Written 26 Oct 2026, after a reviewer checked the first drafts against the real game file.*

---

## 1. Summary

**What this is.** Your ten phase-1 event fighters (the ten who are assists today) designed as full fighters, the weekly event system that unlocks them, the 30 new assist acts, a build plan, and every question I still need you to answer.

**The plan in short**
- One event a week, starting Monday 00:00 UTC. Each event features one fighter, and the ten take turns, so everyone comes back every 10 weeks.
- Each event has three special matches: a duel, their canon team, and a challenge from their episodes. The stages and twists are fixed. Playing them earns that fighter's own tokens, and 100 tokens unlocks the fighter for good.
- Until you unlock a fighter, you only meet them as a CPU in their own event matches. After that they are yours everywhere, online too. Each player brings their own unlocks into any room, and nothing new is sent over the relay.
- Every kit has the full ~22-move set the main roster has and uses art from one group only. None has a telegraph or a counter stance. Each is aimed at the middle of the pack, and each has a CPU that uses its kit sensibly at Hard.
- The assist bag goes from 17 to 32:
  - The Floor and Grotato keep their acts.
  - Blender and Shopping Cart get small changes.
  - 28 newcomers arrive.
  - The ten new fighters leave, and so do Selfie Stick, Toilet and MePad.

**What the review changed (all accepted)**
- **Your rules**
  - Everything new grows in over 12 frames (your 2026-10-25 change).
  - The name tags drawn over assists come off, because they are words in a match.
  - No move gives endless air time: every stall or lift works once per airtime.
  - Heights are fixed in the world, never "the top of the screen", so host and guest always agree.
  - Nothing spikes a grabbed foe over a pit.
- **Variety**
  - One shared SOAKED status and one wet list.
  - Only Foldy glides: Spongy's parachute, Cloudy's Drift and Black Hole's hover are gone.
  - Only Stapy clings to walls, and only Eraser has a wall trick.
  - Black Hole's up special is now a warp and Stapy's a plunge, instead of two more hops.
  - Three finishers used the same "catch, tick, tick, fling" hold: Stapy's, Cloudy's and Beach Ball's. They are now placed or travelling moves.
  - 8-Ball's and Stapy's Final Smashes are no longer floor lanes.
  - Pie loses her second self-explosion and Robot Flower's gun.
  - Only Eraser deletes shots, and only 8-Ball's bite breaks armour.
  - Eraser loses his heal, so only Clock heals himself.
  - Spongy's water is now ammo only, so only Beach Ball changes size.
  - 21 move names that clashed were renamed. The review found 19; I found two more: Clock's pummel "Tick" and Stapy's side tilt "Swing Open". I checked every final name against the file.
- **Numbers**
  - All stats stay inside the game's bounds.
  - Black Hole can no longer grab from 80 px with his up special.
  - Spongy's top bounces each fighter once per airtime.
  - Stapy no longer turns to face foes by himself.
  - Foldy's bell can't rescue her off-stage or carry a flag.
  - Five assists were toned down: Conch Shell, Snare Drum, Rubber Spatula, Clapboard and Battery.
- **Online**
  - The guest's prediction must include every new change to speed or falling.
  - Foldy's plane angle is worked out from her movement.
  - Rock Paper Scissors reads each pick late enough for a guest's keys to arrive.
  - Every new object has a clear rule for whether it can be erased, caught or eaten.
  - Dough's copy skips specials that only work for their owner.
  - Every new CPU is on the finisher list.
- **Events**
  - No daily token limit (a weekly one instead), and quick throwaway losses pay nothing.
  - A win pays only if you are still in at the end.
  - No Four and no Fourest anywhere, because they are spoilers.
  - The sponge floor bounces only hard landings.
  - Event matches don't count for One's chain.
  - The select screen's event group stays hidden until the first event.
  - Clock's team match now uses his real team.

**Where I went a different way from the review**
- **MePhone4's adds.**
  - The reviewer suggested Avocado, Leek and Kitchen Sink, with 9-Ball in place of Fourse.
  - But the same review asked that 9-Ball stop rolling, so it can no longer do the "line" job, and Fourse may become a contestant.
  - I picked Avocado (a shot), Leek (a line), Boom Mic (a slam) and Kitchen Sink (an aimed zone).
- **Black Hole's swung foe still knocks other fighters away.** The review mentioned it next to Stapy's bowling throw but only asked to change the throw. For Black Hole the swing is the point of his timed hammer throw, so I kept it small: 6%, once per fighter.
- **Spongy's parachute.** The review offered two options: a fixed slow fall or cutting it. I cut it from his recovery and kept it in his Final Smash. A chute that opens by itself would fight players who want to drop.
- **Camera.** The review asked me to settle Camera and Camera #2 one way. Neither uses a flash now, and the flash retires with Selfie Stick, which also removes one of the strongest control effects.
- **Team matches.**
  - Clock's team match is rebuilt around The Losers!, as asked.
  - I could not check the other nine against canon: the BFDI wiki refuses requests from here (HTTP 402), as it did for the reviewer.
  - Each kit job checks its own team when it fetches art.
- **Nothing was rejected outright.**

**The five answers I need most** (all in section 6): the token numbers (Q1); when events start (Q3); one SOAKED status that only slows (Q17); taking the name tags off assists (Q22); MePhone4's new adds (Q91).

---

## 2. How events work

### The week
- **Timing.** An event runs from Monday 00:00 UTC to the next Monday, the same moment the weekly quests change. It is worked out from the date alone, so every player sees the same event, even offline.
- **The first lap** follows your list: Eraser, Spongy, 8-Ball, Black Hole, Clock, Cloudy, Pie, Stapy, Foldy, Beach Ball. Then it goes round again.
  - Each fighter comes back every 10 weeks, or every 19 once phase 2 joins.
  - The order is a table that is only ever added to. A new lap is announced at least two weeks ahead.
  - Phase 2 joins at the start of a lap, so nobody's week is cut short.
- **Edge cases.**
  - A match that crosses Monday midnight pays toward the event it started in.
  - A computer with the wrong date sees a different week, as it does with quests today.

### The three event matches
| Match | What it is | Format |
|---|---|---|
| **Duel** | One against one with the event fighter, on a stage from their story, usually with their own twist | 1 v 1, 2 stocks |
| **Their team** | Their canon team as CPUs, against you and canon rivals | 2 v 2 or 3 v 3, 2 stocks |
| **Their challenge** | A moment from their episodes; sometimes they fight on your side | Free-for-all of 4, or an ally match, 2 stocks |

- **Fixed for everyone:** the stage, backdrop, lineup, sides, items, Smash Balls and twist.
- **Your choice:** your fighter (any you own; One's bans apply) and the CPU skill. Wins on Easy count the same.
- **The CPUs** are regular roster fighters plus the event fighter, and never:
  - another event fighter;
  - a Vault fighter;
  - anything secret;
  - Four or The Fourest;
  - The Moon, or One's or Steve Cobs's places.
- **What they count for:** quests, stats and My Stats. They do not count for the Daily, the World Cup or One's chain.
- **Your settings** are borrowed for the match and all handed back afterwards (mode, contestants, stocks, items, stage, size and Smash Balls), the same way the Daily does it.

### Twists (built once, reused by every event)
Twists change the rules. They never add a new thing that can hurt you, and anything that pushes or slows eases in over the 12-frame grow-in time. In a match a twist shows only through art and sound, never words.

- **Stage:** any open stage.
- **Backdrop:** the Cake at Stake place or the A-twos-ment Park, drawn behind a normal stage without their boss or hazards.
- **Items:** food only, throwables only, or lots.
- **Low gravity anywhere:** Yoyleland's gravity on any stage.
- **Sponge floor:** a hard landing on the main floor bounces you back up. Standing and walking are normal.
- **Pull:** a gentle pull toward the middle, never more than a quarter of walking speed, so you can always walk out.
- **Rain:** 8 seconds of rain, then 8 dry, repeating. Everyone runs 15% slower while it rains.
- **Gusts:** every 10 seconds, a 2-second sideways push at about a fifth of walking speed, alternating direction. You hear wind and see the clouds race.
- **Wind Back:** every 20 seconds a tick-tock plays, then everyone's damage goes back to what it was 10 seconds earlier. Damage only ever goes down, and a lost stock never comes back.
- **Fast forward:** everyone has the speed power-up all match.

(The one-boss co-op twist is no longer needed in phase 1, because 8-Ball's match against Four is gone.)

### The 30 event matches
| Fighter | 1. Duel | 2. Their team | 3. Their challenge |
|---|---|---|---|
| **Eraser** (he) | *Take the Plunge*: Goiky Field, real edges, no items | *Pen and Eraser*: Eraser + Pen vs you + Blocky, food-only items ("gimme gimme food") | *The Trebuchet*: Sky Towers, sponge floor; you vs Eraser, Fries and Puffball (his TPOT team) |
| **Spongy** (he) | *Sponge Floor*: Goiky Field, sponge floor | *Team Ice Cube!*: Spongy + Barf Bag + Firey Jr. vs you + Lollipop + Ice Cube | *Get Digging*: Evil Forest, Evil Leafy roaming as usual; you vs Spongy, Ice Cube and Book |
| **8-Ball** (he) | *Basket Into X*: Goiky Field, throwables only (the BFB 1 basket) | *A Better Name Than That*: 8-Ball + Golf Ball + Tennis Ball vs you + Blocky + Pencil | *Lick Your Way to Freedom*: Stone Pillars, food-only items; you vs 8-Ball, Golf Ball and Lollipop |
| **Black Hole** (he) | *Gravity*: Goiky Field, pull | *Death P.A.C.T. Again*: Black Hole + Remote + Tree vs you + Pen + Fries | *Back to the Top*: Sky Towers, low gravity; you vs Black Hole, Pen and Flower |
| **Clock** (he) | *Wind Back*: Stone Pillars, wind back | *The Losers!*: Clock + Loser + Pin vs you + Teardrop + Bracelety | *Fast Forward*: A-twos-ment Park backdrop, fast forward; you vs Clock, Ice Cube and Cake |
| **Cloudy** (he) | *Thunderstorm*: Goiky Field, rain (his storm when the seeds hit his window) | *Beep*: Cloudy + Leafy + Woody vs you + Fries + Coiny | *The Collection*: Sky Towers, lots of items; you vs Cloudy, Yellow Face and Rocky (his TPOT team) |
| **Pie** (she) | *Cake at Stake*: the Cake at Stake backdrop on Goiky Field | *Death P.A.C.T.*: Pie + Pen + Remote vs you + Flower + Bomby | *500 Steps*: Yoyle Fortress, lots of throwables; you vs Pie, Remote and Bomby |
| **Stapy** (he) | *Wall to Wall*: Stone Pillars, no items (walls to staple to) | *Free Food*: Stapy + Marker + Fries vs you + Lollipop + Saw | *The Search Party*: Evil Forest; you vs Stapy, Liy and Match (his search group) |
| **Foldy** (she) | *Windy*: Goiky Field, gusts (the wind carried her off) | *The Strongest Team on Earth*: Foldy + Bell + Snowball vs you + Marker + Rocky | *Carried Off*: Yoyleland (low gravity); you vs Foldy, Fries and Liy |
| **Beach Ball** (they) | *The Fighting Contest*: Goiky Field, no items | *Cheaters' Alliance*: you + **Beach Ball as your ally** vs Rose + David | *Elsewhere on Earth*: Sky Towers, sponge floor; you vs Beach Ball, David and Pin (sharp things pop them) |

### Tokens and the unlock
- **Separate tokens.** Each event fighter has their own tokens (for example "Eraser tokens"). They can't be bought and can't buy anything else, so Win Tokens stay exactly as they are.
- **What a match pays:**

| What happens | Tokens |
|---|---|
| Win, if you are still in at the end (in an ally match you can't let the CPU finish it for you) | 10 |
| Loss, if you dealt at least 20% damage in total or lasted 60 seconds (so instant losses earn nothing) | 5 |
| First win on each of the three matches during this event | +10 each |

- **Limits:** no daily limit, and at most **100 tokens per fighter per event week**.
- **100 tokens unlocks the fighter for good.** Tokens are never lost: a missed week simply waits for their next turn.
- **How fast it goes:**
  - A keen player can unlock in one sitting: about seven wins, including the three first-win bonuses.
  - A casual player (two matches a day, winning one) takes about 4–5 days.
  - Someone who never wins needs about 20 losses in which they really fought.
- **What pays nothing:** Test mode, the Level Creator, the tutorial and watched matches.
- **No pushing.** Tokens are paid the moment a match ends. There are no badges, no "last chance" and no countdown that shouts.
- **After the unlock** the matches stay playable all week, for fun and for quests.

### Where event fighters appear
| Place | Before you unlock | After you unlock |
|---|---|---|
| Their own event matches | As a CPU (foe, or sometimes ally) | Yes, and you can play as them |
| Select screen | In an "Event fighters" group, greyed out with a hint | Playable |
| Offline CPU foes and allies, Boss Rush allies, Capture the Flag | Never | Yes |
| World Cup, Test mode, training | Never | Yes |
| Daily Match | Never | Still never, so it stays the same for everyone |
| Fighter Rankings | Hidden | Shown |
| Online rooms | Only when a player who owns them picks them | You can bring them |
| Crowd cameos | Unchanged | Unchanged |

### Screens
- **Title: the event card.** It sits beside the Daily card and shows the portrait, a token bar (40/100) and "Event ▶". Once you own the fighter it says "✓ Eraser is yours · Next week: Spongy". The title keeps its six buttons.
- **The event page** has:
  - the portrait and a short canon blurb with the right pronouns;
  - "ends in 3 days";
  - the token bar and the rules in one plain sentence;
  - the three match cards, each with a twist icon, a tick for the first-win bonus and "Play ▶";
  - "See their moves", using the existing move list;
  - a quiet "Coming up" strip.
- **Play ▶** goes to the select screen. A strip shows the fixed setup ("Take the Plunge · Goiky Field · you vs Eraser · 2 stocks · no items").
- **Select screen.** The "Event fighters" group sits after the BFDI cast and before the Inanimate Insanity group. It stays hidden until the first event. A locked cell's hint says "their event is on this week, 40 of 100 tokens" or "back in 6 weeks (40 saved)".
- **Result screen.** A note such as "+10 Eraser tokens · first win on Free Food +10 · 70/100", plus Rematch and "Event ▸" buttons.
- Everything works with the keyboard alone. No words are drawn in a match.

### Saving
- **Token totals** for each fighter only ever go up.
- **Two open tabs** merge their recent payouts the way Win Tokens already do, so nothing is paid twice or lost.
- **The unlock** is the fighter's name added to your unlocked list.
- **Very old saves** don't get event fighters.
- **Computers that can't save** get them opened (question 6).

### Online
- **Normal rooms: each player brings their own unlocks.**
  - Every copy of the game contains every event fighter, so any computer can run and draw them.
  - Your pick travels in your join name, as it does today. The host doesn't check unlocks, because it can't see yours.
  - In the lobby, a pick the host hasn't unlocked gets a small EVENT tag.
- **Online CPU seats never use event fighters**, because the host can't know what its guests own.
- **The snapshot.** Everything a guest sees of an event fighter travels in the host's snapshot, like every fighter's. There is no new relay message, and nothing ever touches the live relay.
- **Event rooms (optional, question 9).**
  - The host chooses Mode "Event". The week and the match number ride in the lobby preview and start messages that already exist.
  - The event fighter's seat is always a CPU.
  - Guests are paid too, from the final snapshot, but only if the host's week is theirs or the one just before.
- **Being honest about trust.** Unlocks live only on each computer, so someone who edits their save can play early. That costs nobody anything: there is no ranked play and no prizes.

---

## 3. The ten kits

### How to read the cards
- **Numbers.**
  - 60 frames is one second.
  - Smash percentages are what the move card shows.
  - Final Smash numbers are the row values, with the doubled amount you see in play in brackets.
  - "The grow-in time" means 12 frames.
- **Startups.** Every finisher starts with the fighter's own 12-frame animation and every Final Smash with its 14-frame wind-up. Nothing is ever drawn ahead of a hit.
- **Side rows.** Side tilts and side specials stay switched off, as for everyone, but are kept as data rows.
- **The CPU** works at Hard pace (6 inputs a second), picks tilts only when they reach, never counters, and never acts from hitstun.

### 3.0 Shared pieces (used by several kits)

**SOAKED** is one status shared by everyone. A soaked fighter:
- drips;
- gets the game's usual slow;
- has any fire put out;
- takes a third more from Cloudy's bolt;
- if it's Foldy, goes soggy: no glide, no Fold and Fly, and she falls 10% faster.

It lasts as long as the move says (1 to 2.5 seconds) and travels online as one flag.

**Wet hits** (they soak whoever they hit):
- Spongy: Wring Out and Big Squish.
- Cloudy: Drizzle, Cloudburst, Rained On and Rain Cloud.
- Kitchen Sink's splash.
- Rocky's barf, Barf Bag's splash and Golf Ball's water hazard.
- Marker's ink and Toothpaste's paste, to confirm (question 18).

**Puddles Spongy can soak up:** Barf Bag's poison puddle, Rocky's puddle, Donut's glaze, Taco's salsa, Pen's slick, Bubble's drip slick, Cherries' oil, Golf Ball's water, Blender's smoothie splats and Shampoo's lather. Never fire.

**What can remove each new thing.** Three rules, then the table:
- Rub Out erases shots in flight and anything a hit could already break.
- Onigiri eats foes' thrown items, puddles and floor traps, never shots.
- Accretion catches only loose items and its own clod.

Smash, finisher and Final Smash objects are never erased, caught or eaten.

| New thing | Rub Out erases it | Onigiri eats it | Accretion catches it | Anything else |
|---|---|---|---|---|
| Stapy's staple, flying | yes | no | no | — |
| Stapy's staple link (on two fighters) | no | no | no | a hard launch knocks it out |
| Stapy's Staple Ladder staples | no | no | no | — |
| Pie's berry, flying | yes (no pop) | no | no | pops on the first foe |
| Pie's berry, stuck | yes (no pop) | yes (no pop) | no | pops when a foe touches it |
| Pie's fork | no | no | no | — |
| Cloudy's Earth and his rain | no | no | no | — |
| 8-Ball's trebuchet and basket | no | no | no | — |
| Black Hole's clod or orbiting item | yes | no | — | — |
| Foldy's Magic Bell | yes | yes | no | breaks on any hit |
| Clock's swingset | no | no | no | stops if Clock is hit |
| Beach Ball's air puff | no | no | no | — |
| Blender's splats, Shampoo's lather | yes | yes | no | — |

**Dough's copy move** skips seven new specials that run on their owner's own gauge or objects: Clock Hands, Wring Out, Accretion/Slingshot, Stop Shot, Big Bounce, Explosive Blueberry and Staple Together. Foldy's Fold and Fly gets checked in her job.

**Guest prediction.** Online, a guest's own fighter is predicted on their own computer, so every new change to speed, jumping or falling must be included there. That means:
- Beach Ball's sizes;
- Foldy's glide and soggy;
- Stapy's slower trance;
- Black Hole's Singularity drift;
- Pie's Arm Flutter;
- being soaked;
- the rain, gusts, pull and sponge floor twists.

Each is read from what the snapshot already carries, or those frames count as busy. Otherwise the guest's fighter snaps back on their screen.

---

### 3.1 Eraser (he/him)
**Who he is.** A grumpy, bored, smug eraser ("WHICH IS?") who sabotages other teams out of boredom. He is secretly athletic: he kicks off a wall into a backflip ("some people are blessed with talents") and spins three basketballs on his fingertips. He appears in BFDI, in BFB (Free Food) and in TPOT, and hosted part of BFDIA. He plays a quick, short-reach brawler who erases things: the shots and traps in front of him, the ailments on him and, for a moment, a foe.

**Stats:** weight 88 · run 1.07 · air 1.00 · jump 1.06 · fall 1.03 · damage 1 · recovery 1 (measure first) · wall jump 15% higher.

**Art:** BFB+TPOT. His TPOT render, already in the game as his assist picture. Poses come from BFB/TPOT, and missing ones are drawn in that style. No BFDI-era art.

**Moves**
- *Jab* · **Blah Blah Whatever**: rolls his eyes, then gives a bored backhand swat just ahead (short reach); 7%.
- *Up tilt* · **Scrub Up**: scrubs the air over his head and tosses them straight up; 4.8%.
- *Down tilt* · **Crumb Sweep**: crouches and scrubs the floor, popping up whoever is at his feet; 4.2%.
- *Neutral air* · **Cube Roll**: tucks and tumbles like a block, clipping all round; 2 hits of 3.2%.
- *Forward air* · **Hard Edge**: chops with his hard rubber edge, and he can jump out of it on a hit; 6%.
- *Back air* · **Smug Heel**: shrugs and kicks behind him without looking; his strongest air hit; 8%.
- *Up air* · **Three-Ball Spin**: spins three basketballs on his fingertips overhead; 3 hits of 2.2%, the last 2.6%.
- *Down air* · **Stomp Out**: hangs for a beat, then stamps straight down and spikes; 7.6%.
- *Grab* · reaches a short way (30 px); *pummel* **Scrub**, 1.5%.
- *Throws*:
  - **Which Is?!** (forward), 7.2%.
  - **Flung to the TLC** (back), 7.8%.
  - **High Five** (up), 5.2%, which sets up Three-Ball Spin.
  - **Doormat** (down), 5%.
- *Special* · **Rub Out**: he rubs side to side for 10 frames (his own wiggle), then wipes the space 18–112 px ahead clean.
  - Every enemy shot it touches is erased, and so is every enemy trap or puddle a hit could already break.
  - A foe in the wipe takes 7%.
  - It never touches teammates' things, bosses, unbreakable shots, or smash, finisher or Final Smash objects.
  - In the air he hangs during it once per airtime. Cooldown 78 frames.
- *Up special* · **Steakhouse Flip**: a quick crouch, then a backflip up and back that kicks whoever is in front; 8% close, 4% at the tip. If he touches a wall in the first 16 frames, he kicks off it and gets a jump back (once per airtime). The steakhouse wall is from The Seven Wonders of Goiky.
- *Down special* · **Rub It Off**: no hit. He scrubs himself for 24 frames, and a hit stops it.
  - It rubs off his own burn, bleed, poison, slow, root, scrambled keys, weakness and curses.
  - No heal, and marks other fighters put on him stay.
  - Cooldown 5 s, or 1 s if there was nothing to rub off.
- *Smash* · **Hard Rub**: a lunge (medium reach); 21%, and it weakens their hits.
- *Finisher* · **Out of the Picture**: he squints and leans back, grabs the foe right in front of him, and rubs them out over three rubs, fading them a third each time.
  - They are gone for 18 frames, then drawn back in a step away and flung.
  - They can mash to slip out between rubs. A hit on him lets go, and a whiff leaves him open for 22 frames.
  - 3% a rub, then 8% (launches far).
- *Final Smash* · **Wipe the Slate Clean**: every enemy shot and trap on the stage is erased, then a giant pink eraser sweeps the whole floor from edge to edge. Jump it or stand on a platform. 21% (42%).
- *Side rows* · **Shove Off**, 5.4% · **Cap and Run**, 5.4% (Pen's cap).
- *Movetech* · short hop, fast fall and wall jumps. His wall jump is a backflip 15% higher. Hard Edge jump-cancels on a hit. No cling.

**Balance.**
- Strengths: he is a counter-pick against zoners and trappers, but nobody else's numbers change.
- Weaknesses: he is light (88), every move has short reach, and he has no projectile.
- The review took away his air bonus and his heal to bring him to mid-pack.
- If he lands low, raise run and jump toward 1.1 first, then shorten Rub Out's cooldown.

**CPU.**
- Rub Out when an enemy shot is within 120 px ahead or a foe is within 100 px.
- Rub It Off only with an ailment on him and no foe within 140 px.
- The finisher on a grounded foe within 40 px, at most once every 6 s.

---

### 3.2 Spongy (he/him)
**Who he is.** The biggest contestant: a huge, armless, gentle kitchen sponge who soaks up liquid and crushes hosts by landing on them. His squishy top bounced the Squashy Grapes back out of a pit. His hobbies are skydiving and flying, and in BFB he flew his jet, dropped cannonballs he bought on sale, and parachuted down. He appears in BFDI, BFDIA, IDFB and BFB (Team Ice Cube!). He plays a super-heavy living trampoline whose one resource is water.

**Stats:** weight 128 · run 0.89 · air 0.93 · jump 0.90 · fall 1.10 · damage 1.04 · recovery 1.2 for now (set from the measure, within 1.15–1.25) · the biggest body in the game.

**Art:** BFB+TPOT. His TPOT 25 render, already in the game; the assist copy stays for the boss endings and the crowd. BFB poses: the voting pose, the walk, being zapped, the suction frames and the jet. No classic-era art.

**Moves**
- *Passive* · **Squishy Top**: anyone who lands on his top, foe or teammate, springs back up off it. Each fighter bounces once per airtime, and it does no damage. Foes can't camp on his head.
- *Passive* · **His water**: he holds 0–3 levels, shown as darker holes and drips. One level drips out every 8 s. It is ammo only: it never makes him heavier or slower.
- *Jab* · **Wobble Bump**: rocks back on his heels, then wobbles into whoever is in front; 8.5%.
- *Up tilt* · **Spring Top**: squashes down, and his top springs up and tosses them straight up; 6.2%.
- *Down tilt* · **Hole Squirt**: soapy water squirts low out of his bottom holes (medium reach) without using his water; 5%.
- *Neutral air* · **Tumble**: tumbles end over end, his corners clipping all round; 2 hits of 4.4%.
- *Forward air* · **Corner Check**: tips forward and leads with a corner; jump-cancels on a hit; 9.6%.
- *Back air* · **Face Slide**: his face slides round to his back, then he bumps backward; his strongest air hit; 10.8%.
- *Up air* · **Baker's Dozen**: the bread loaves on his top wobble, then flip up through whoever is above; 6%.
- *Down air* · **Crushed by Spongy**: hangs for a beat, wobbling, then drops flat on his face; a clean hit spikes; 12%. A miss costs 18 frames of landing lag.
- *Grab* · slow and heavy (34 px), and his holes soak them in; *pummel* **Sop**, 2%.
- *Throws*:
  - **Squeezed Out** (forward), 8.6%: out of his front holes.
  - **Out the Other Side** (back), 9.4%: through his hollow body, from Enter the Exit.
  - **Out of the Pit** (up), 5.6%: how he sprang Bubble out of the pit.
  - **Tip Over** (down), 6.4%.
- *Special* · **Wring Out**: he twists himself for 14 frames, then everything he holds gushes out straight ahead, low enough to jump over. It spends all his water, and water hits soak.

  | Water held | Reach | Damage |
  |---|---|---|
  | Dry | 40 px puff | 3% |
  | 1 level | 120 px | 6% |
  | 2 levels | 220 px | 9% |
  | Full (3) | 320 px, carries foes along | 12% |

  Cooldown 66.
- *Up special* · **Squash and Spring**: squashes flat for 6 frames, then bounces high, popping up whoever is beside him; 8% close, 5% far. No jump back and no parachute.
- *Down special* · **Soak Up**: no hit. He swells for 30 frames (a hit stops it) and gains one water level. If there is a puddle, slick or spill from the shared list within 90 px, he soaks that up instead: two levels, and the puddle is gone. Cooldown 50.
- *Smash* · **Big Squish**: a burst (medium reach) as he springs back to full size; 23%, soaks them.
- *Finisher* · **Falls From the Sky**: he squats, springs up to 300 px above his floor (capped by the stage's ceiling, so it is the same on every screen), drifts across and drops on the spot where the nearest foe within 420 px stood when he jumped.
  - He is visible the whole way, and nothing is drawn on the floor.
  - Under him: 14%, knocked down and pinned flat for 24 frames. Beside him: 5%.
  - He sits for 28 frames afterwards. A hit while he rises or hangs drops him harmlessly.
- *Final Smash* · **Cannonballs Were on Sale**: he flies his one-seat jet high above the stage and drops cannonballs on the two nearest foes four times, moving along each time, then parachutes down. 15% a cannonball (30%). Keep moving.
- *Side rows* · **Side Squish**, 7.6% · **Unicycle Ram**, 7.4%.
- *Movetech* · short hop, fast fall and wall jumps. No cling. Corner Check jump-cancels on a hit. Squishy Top and his water are listed here on the move list.

**Balance.**
- Strengths: he is very hard to KO and has the widest hitboxes.
- Weaknesses: the biggest hurtbox, the slowest run, a low jump, a fast fall and a weak recovery (one bounce).
- Soaked foes are only slowed.
- What the review changed:
  - His water is ammo only. The old "heavier and slower" ladder pushed him past every stat bound and copied Beach Ball's pump.
  - No parachute in his recovery.
  - No cling.
  - His top bounces each fighter once per airtime.
- If he lands low: recovery from the measure first, then run, then Wring Out's reach.

**CPU.**
- Soak Up only with no foe within 260 px.
- Wring Out when a foe is in line within that water level's reach.
- Big Squish with a foe within about 140 px.
- The finisher on a grounded foe 160–420 px away with floor under them, once every 8 s.
- Recovery: air jump, then Squash and Spring.

---

### 3.3 8-Ball (he/him)
**Who he is.** A deadpan, limbless billiard ball who moves by rolling and keeps telling everyone he doesn't have a favourite number.
- In BFB 1 he was the counterweight in Golf Ball's basket plan, then ran the team and launched the basket into X with Tennis Ball's trebuchet.
- In BFB 2 he bit open the jawbreaker Golf Ball was stuck in.

He appears in BFB (A Better Name Than That) and as a TPOT EXITor. He plays a grounded momentum heavy who rolls, bites and breaks.

**Stats:** weight 110 · run 1.06 · air 0.95 · jump 0.92 · fall 1.10 · damage 1 · recovery 1.15 for now (measure).

**Art:** BFB+TPOT. His TPOT render, already in the game; it rotates as he rolls and settles upright when he stops. BFB spin frames, the mad face, the scared face, and the flattened picture for KOs. The open-mouth "bite" frame is cut from the render.

**Moves**
- *Jab* · **Nudge**: rocks back a hair, then bumps forward with his whole body; 7%.
- *Up tilt* · **Top Spin**: spins on the spot and flicks them straight up off his top; 6%.
- *Down tilt* · **Ankle Bite**: snaps at their feet a step ahead; 5%. It starts combos below about 40%.
- *Neutral air* · **Spinning Eight**: one fast spin, hardest as it starts; 7% (4% late).
- *Forward air* · **Straight In**: body-checks forward and a little down; jump-cancels on a hit; 9%.
- *Back air* · **Reverse English**: back-spins hard into whoever is behind; his strongest air hit; 10.5%.
- *Up air* · **Eight on Top**: bonks upward with the top of him; 6%.
- *Down air* · **Sink the Eight**: hangs, then drops like a dead weight. The very bottom spikes for 9%, the rest knocks aside for 5%. Jump-cancels on a hit.
- *Grab* · **Jaws**: lunges with his open mouth (30 px) and holds on a long time; *pummel* **Gnaw**, 1.8%.
- *Throws*:
  - **Called Pocket** (forward), 8%: rolls into them and knocks them ahead like a called shot.
  - **Roll Over** (back), 8.6%.
  - **Jaw Flick** (up), 5.5%.
  - **Crushed by the Moon** (down), 6%.
- *Special* · **Stop Shot**: hold C and he spins up in place for 10–40 frames (his own spin is the cue).
  - Let go and he rolls straight ahead, 130–340 px. The first foe he meets takes all his momentum: he stops dead and they fly off low and flat.
  - 6% tapped, up to 12% fully spun.
  - **Draw:** hold the opposite arrow while rolling and he spins back about 100 px after the hit, but the launch is weaker.
  - He stops at ledges.
  - In the air it is a short 100 px roll for 6%, once per airtime.
  - A whiff leaves him open for 16 frames. Cooldown 55.
- *Up special* · **Cushion Bounce**: squashes for 5 frames, then springs up like a ball off a cushion, popping whoever is at his feet; 5–7%. No wall rebound: the wall trick is Eraser's.
- *Down special* · **Jawbreaker Bite**: opens wide for 8 frames, then chomps right in front of him.
  - It bites through armour, a brace, ice, a freeze, a root or a jawbreaker, and breaks it: 14% instead of 9%.
  - On a stuck teammate it frees them and does no harm.
  - It never waits for a hit, so it is not a counter. Cooldown 64.
- *Smash* · **Break Shot**: a burst as the rack scatters; 21%, knocks down, launches far.
- *Finisher* · **Trebuchet Basket**: a small trebuchet grows in behind him (scenery that never hurts). He hops onto its counterweight, and his dead weight lobs a big wicker basket at the nearest foe ahead within 420 px, or 300 px straight ahead if nobody is there.
  - The basket only hurts on the way down, after about 40 frames in the air; 12%, knocks down.
  - A hit on him before the drop tips the trebuchet over.
  - Ground only. It is his only ranged option.
- *Final Smash* · **The Break**: he spins up in place, then breaks.
  - A burst round him (220 px) hits every caught foe three times as the rack scatters: 3%, 3%, then 14% with a launch (6%, 6%, 28%).
  - Seven coloured balls fly out one at a time, each harmless for its first 12 frames, and bounce twice off floors and walls, bumping anyone else for 3% (6%).
- *Side rows* · **Cue Up**, 7.5% · **Long Roll**, 7%.
- *Movetech* · short hop, fast fall and wall jumps. No cling. Stop Shot can be jump-cancelled after 10 frames of rolling and keeps its speed. Straight In and Sink the Eight jump-cancel on a hit.

**Balance.**
- Strengths: he is heavy, his ground punishes are strong, and the Bite is an answer to armour that changes nobody else's numbers.
- Weaknesses:
  - no ranged pressure except the basket;
  - poor air drift;
  - a short grab;
  - a fast fall;
  - a full spin-up anyone can see;
  - a short recovery.
- What the review changed: air 0.95 (0.92 would have been the lowest in the game), the wall rebound is gone, and the Final Smash is no longer a floor lane.
- If he lands low: recovery first, then air.

**CPU.**
- Taps Stop Shot at a grounded foe 60–150 px ahead, and uses the full spin only at 200–340 px.
- Bites an armoured, braced or frozen foe within 45 px, or frees a stuck teammate first.
- Break Shot with two foes within 110 px.
- The basket at a foe 180–420 px ahead.

---

### 3.4 Black Hole (he/him)
**Who he is.** A calm, faceless, limbless black hole who values life above everything and spouts space trivia. He can't push, but he can "pull like there's no tomorrow":
- he sent Bomby back up the 500 steps;
- he caught falling teammates in mid-air;
- he flung pests away;
- he sucked up 28 laser shots.

He appears in BFB (Death P.A.C.T.) and TPOT (Death P.A.C.T. Again). He plays a floaty controller whose hits pull toward him. **The Death P.A.C.T. rule:** none of his hits ever send a foe downward.

**Stats:** weight 88 · run 0.92 · air 1.10 · jump 1 · fall 0.88 · damage 1 · recovery 1 · floats with a gentle bob (look only).

**Art:** BFB+TPOT. His one render, already in the game; it never changed between seasons. Every pose is the render scaled, spun, squashed or stretched, since he has no face or limbs. The clod and the pull streaks are drawn in code, and only while a pull is live.

**Moves**
- *Jab* · **Tug**: a quick tug of gravity pulls the foe a step toward him; 5.5%.
- *Up tilt* · **Boost Up**: gravity lifts whoever is over or beside him; his combo starter; 6%.
- *Down tilt* · **Tidal Drag**: drags their feet toward him and pops them up; 4.5%.
- *Neutral air* · **Accretion Spin**: his disk drags everything near round three times, then flicks them out; 3 hits of 2.5%, then 3.5%.
- *Forward air* · **Tidal Stretch**: space stretches long and thin ahead of him and snaps back, hauling them in and up (medium reach, easy to duck); 6.5%.
- *Back air* · **Fling Away**: flings whoever is behind him away; his strongest air hit; 10%.
- *Up air* · **Liftoff**: a column of gravity launches them straight up; his air KO move; 7.5%.
- *Down air* · **Catch**: pulls whoever is below up into him and pops them out to the side, never down; jump-cancels on a hit; 6.5%.
- *Grab* · **Captured**: gravity seizes them a little farther away than a hand could (36 px); *pummel* **Stretch Thin**, 1.5%.
- *Throws*:
  - **Escape Velocity** (forward), 7.5%.
  - **Swing Round** (back), 8%.
  - **Gravity Boost** (up), 6%: his KO throw, how he sent Bomby back up the stairs.
  - **Low Orbit** (down), 5%.
- *Special* · **Accretion / Slingshot**: his disk speeds up for 10 frames, then he pulls the nearest loose item within 260 px into orbit.
  - If there is none, he tears a clod out of the floor below him. It grows in over the grow-in time and needs floor within 120 px.
  - Whatever orbits circles him for 6 s and bumps foes it passes for 3%.
  - Press C again to **Slingshot** it off on its curve at the nearest foe ahead: a clod does 8%, an item 12%.
  - He never takes foes' shots; Box and Gaty already do that.
  - Cooldowns: 50 for Accretion, 30 for Slingshot.
- *Up special* · **Wormhole**: his disk spins into a tunnel for 6 frames. He drops through and comes out up to 150 px away in the direction held (straight up if none), untouchable while inside.
  - Coming out, a small gravity pop hits whoever is right beside him (24 px): a foe takes 6% and is popped up, and a teammate gets a jump back.
  - Once per airtime.
- *Down special* · **Singularity**: he shrinks to a point over 5 frames and is untouchable for 22 frames, drifting slowly.
  - Gravity stays on, so it never holds him up in the air.
  - Then he snaps back to full size and tugs anyone within 90 px a step toward him, with no damage.
  - Nothing is hit back, so it is not a counter. Cooldown 150.
- *Smash* · **Event Horizon**: a pull that reels nearby foes in (220 px) and hits them at his rim; 21%, slows them. It launches up or flat, never down.
- *Finisher* · **Spaghettify**: his disk winds tight, then space stretches toward the nearest foe 0–150 px ahead and pulls them long and thin into orbit round him.
  - While they circle they are torn at, and anyone they swing into is knocked away (6%, once each).
  - Press C to let go along their path, a timed hammer throw, or he lets go by himself after 1.5 s.
  - They can mash free sooner, and a hit on him drops them. A whiff leaves him open for 18 frames.
  - 2%, then 1.5% three times, then 8% (launches far).
- *Final Smash* · **Mass of Twenty Suns**: he swells to his true size and pulls everyone within 420 px toward him, eating every shot near him. Whoever reaches his core is held and torn at, then launched straight up. 4 × 2%, then 14% (4 × 4%, then 28%).
- *Side row* · **Gravity Slide**, 5%: glides 160 px, dragging anyone he passes.
- *Movetech* · short hop, fast fall and a plain wall jump. No cling and no hover. The Death P.A.C.T. rule is listed here.

**Balance.**
- Strengths: he steals items (not shots), has long pulls and plenty of upward KO power, a Singularity escape and a floaty recovery.
- Weaknesses:
  - slow up close (5–8 frame startups);
  - light-ish and floaty, so he is KO'd early off the top;
  - no spike;
  - the clod needs a floor;
  - Event Horizon costs him 28 frames of stun;
  - Singularity has a 2.5 s cooldown.
- What the review changed:
  - fall 0.88;
  - Accretion takes no shots;
  - the up special is a warp with a 24 px reach (no more 80 px carry);
  - Singularity has a 150 cooldown and gravity stays on;
  - Event Horizon slows instead of breaking armour.

**CPU.**
- Accretion when no foe is within 120 px.
- Slingshot at a foe 120–420 px ahead with a clear line.
- Singularity against a smash or finisher wind-up within 110 px, at most once every 6 s.
- Spaghettify on a foe 40–150 px ahead, letting go when the swing points up and out.

---

### 3.5 Clock (he/him)
**Who he is.** A blue minimalist wall clock with no arms who sticks to the rules, badly wants to help, and hates anyone touching his hands. The Official Character Guide says that if he waits for his hands to move naturally, they are infinitely powerful. He appears in BFB (The Losers!) and TPOT. He plays the patient fighter.

**Stats:** weight 86 · run 0.95 · air 1 · jump 1 · fall 1.04 · damage 1 · recovery 1.

**Art:** BFB+TPOT. His TPOT render, already in the game, plus one edited copy with the hands painted out so the hands can be drawn turning. Bruised picture for hurt, the happy pose for wins, and the BFB alarm ring for the smash charge. Colour: his BFB/TPOT blue.

**Moves**
- *Passive* · **Natural Time**: his hands tick round his face by themselves. After 6 s without a special they reach twelve, he chimes once, and he is "on the hour".
  - Clock Hands spends all of it and Fall Back spends a third. Getting hit and his other moves don't spend it.
  - A KO empties it.
  - It is shown only by his own hands.
- *Jab* · **Second Hand**: flicks his minute hand out; 6%.
- *Up tilt* · **Twelve Sharp**: both hands snap up to twelve in a narrow V; 5%.
- *Down tilt* · **Six O'Clock Sweep**: his hour hand sweeps low along the floor ahead; 4.2%.
- *Neutral air* · **Pendulum**: rocks like a pendulum, a bump in front and then one behind; 4% each.
- *Forward air* · **Clockwise**: chops his minute hand from twelve down to three; jump-cancels on a hit; 7.5%.
- *Back air* · **Counterclockwise**: swings both hands the wrong way round behind him; his strongest air hit; 9.5%.
- *Up air* · **Ten to Two**: snips his hands from ten to two overhead (his TPOT pose); 5%.
- *Down air* · **Off the Wall**: falls face-first like a clock knocked off the wall; spikes; jump-cancels on a hit; 9.5%.
- *Grab* · **Bends All Logic**: he has no arms but grabs anyway (TPOT 6), reach 28 px; *pummel* **Tick Away**, 1.5%.
- *Throws*:
  - **Quarter Turn** (forward), 7%.
  - **Back an Hour** (back), 8%.
  - **Basket to X** (up), 5% (BFB 1).
  - **Jawbreaker Cracker** (down), 5% (BFB 2).
- *Special* · **Clock Hands**: his hands snap up to twelve for 10 frames, then sweep clockwise through three to six in a big half-circle in front of him (medium reach).
  - Right after another special it does 6%. On the hour it does up to 16% and launches far.
  - It spends all his Natural Time and works in the air. Cooldown 48.
- *Up special* · **Spring Forward**: his hands whirl an hour ahead and spring him up and forward, hardest at the tips of his hands; 5% (8% at the tips). It doesn't spend Natural Time.
- *Down special* · **Fall Back**: no hit. His hands whirl backwards for 16 frames (a hit stops it), and he takes back half the damage he took in the last 3 s, at most 10%.
  - It costs a third of his Natural Time; with less than that, nothing happens.
  - Cooldown 8 s. It is today's Clock assist in a small dose.
- *Smash* · **Strike Twelve**: he rattles like an alarm clock while it charges, then lunges and chops both hands down from twelve, hardest at the tips; 23%, knocks down, launches far.
- *Finisher* · **Daylight Savings Swingset**: a swingset grows in just ahead of him. His hands spin its top bar an hour ahead, and the seat whips round three loops in about a second (BFB 3).
  - He is rooted while it spins, and a hit on him stops it.
  - 3%, 3%, then 8%, flung up and away.
- *Final Smash* · **Infinitely Powerful**: his face grows huge in the sky behind him.
  - Only the foes caught within 300 px lose their colour and freeze. Nobody else stops.
  - His hands tick twelve times on their own, nicking each caught foe, then sweep round once.
  - 12 × 0.5%, then 13% (12 × 1%, then 26%).
- *Side rows* · **Quarter Past**, 5.5% · **Watchers Are Wannabes**, 5.5%.
- *Movetech* · short hop, fast fall and wall jumps. No cling. Clockwise and Off the Wall jump-cancel on a hit. Natural Time is listed here.

**Balance.**
- Strengths: his damage is average, and his KO threats are Strike Twelve and a full Clock Hands every 6 s, if he holds his specials back.
- Weaknesses:
  - no projectile;
  - a short armless grab;
  - his on-the-hour threat shows on his face;
  - his recovery is one forward spring.
- Fall Back costs gauge and 16 frames standing still.
- What the review changed:
  - No cling (only Stapy clings among the new fighters).
  - The neutral air was renamed, because Bomb already has "Tick Tock".
  - The Final Smash text was corrected.
- If he lands low:
  - Clock Hands from 6% to 7% when empty;
  - a higher Spring Forward;
  - Fall Back's cooldown down to 6 s.

**CPU.**
- Clock Hands only at two-thirds gauge or more with a foe inside the half-circle, and full gauge against foes at 90% or more.
- Fall Back after taking 8% or more in 3 s, with a third of the gauge and no foe within 160 px.
- Strike Twelve within 140 px.
- The finisher on a foe 60–150 px ahead.

---

### 3.6 Cloudy (he/him)
**Who he is.** A puffy, limbless cumulus whose weather follows his mood: white when happy, rain when sad, a storm when mad ("Hey, my window!" when Blueberry seeds hit him in BFB 1). He collects everything: 37 favourite numbers, planets (complete once he got the Earth), and Remote's battery. He appears in BFB (Beep) and TPOT. He plays a storm-setter from above: soak first, then strike.

**Stats:** weight 58 · run 0.90 · air 1.10 · jump 0.95 · fall 0.88 · damage 1 · recovery 1 (measure) · a wide body. Below about 59, weight doesn't change knockback, so his light weight only means he is KO'd earlier.

**Art:** BFB+TPOT. His TPOT render, already in the game. The BFB "striking lightning" picture for the bolt, and the BFB "jawbreakers inside him" picture for the smash charge. His moods are tints of the render: grey for rain, dark for thunder.

**Moves**
- *Jab* · **Puff**: pushes a soft bump of cloud out of his front; 5.5%.
- *Up tilt* · **Billow**: his top billows up and tosses them straight up; 4.5%.
- *Down tilt* · **Drizzle**: a quick spatter of rain at their feet; 3.6%, soaks briefly.
- *Neutral air* · **Cumulus Bump**: puffs out all round in one soft bump; 6%.
- *Forward air* · **Static Puff**: static crackles along his front; jump-cancels on a hit; 6.5%.
- *Back air* · **Rumble**: a clap of thunder behind him; his strongest air hit; 9%.
- *Up air* · **Top Puff**: a puff of rising air from his top; 4.5%.
- *Down air* · **Cloudburst**: he holds still and bursts a heavy shower straight down; it spikes and soaks; 7.5%. He holds still only once per airtime; after that he falls through it.
- *Grab* · **Collect**: wraps them in cloud (32 px). In item matches, whatever they were holding goes into his collection and he holds it now. *Pummel* **Drip**, 1.4%.
- *Throws*:
  - **Static Shove** (forward), 7%.
  - **Onto the Pile** (back), 7.5%.
  - **Carry Up** (up), 5%.
  - **Rained On** (down), 4.5%, soaks.
- *Special* · **Hey, My Window!**: he scowls, darkens and rumbles for 14 frames (his own temper).
  - In the air he holds still for it, once per airtime; on later casts he keeps falling. A bolt cracks straight down from under him to the floor below, through thin platforms: 9% (12% if soaked), and it burns.
  - On the ground it crackles round his base: 6%, knocks down.
  - Cooldown 80.
- *Up special* · **Thunderhead**: billows into a tall thunderhead and pulls himself up to its top, popping whoever is just above or beside him; 4–7%, knocks down.
- *Down special* · **Rain Cloud**: no hit. His face falls and he turns grey for 8 frames, then rains straight down for 3 s, and the rain follows him.
  - The rain reaches the floor over the grow-in time.
  - Anyone under it is soaked while they are there and for 2 s after.
  - Fire goes out on everyone in it.
  - He can fight while it rains. Cooldown 6 s.
- *Smash* · **Spit Out the Earth**: he swells while it charges, then spits the Earth out of his collection. It grows to full size as it drops and only hurts once it is rolling (very long reach); 20%, knocks down.
- *Finisher* · **Fell Right Through**: he scowls and puffs up, then swoops 160 px straight ahead at his own height.
  - Anyone he swoops into falls right through him (Rocky did, in TPOT 1) and comes out of his back under a downpour: 12%, launched up and back behind him, soaked.
  - Nothing is held and nothing goes downward.
  - Sidestep or jump the swoop. A whiff leaves him floating for 16 frames.
- *Final Smash* · **Perfect Storm**: the sky darkens over everyone he caught (480 px to each side, more below him). Rain, then three bolts on each of them, and the last throws them up and away. 4%, 4%, 9% (8%, 8%, 18%).
- *Side rows* · **Puff Shove**, 4.5% · **Drift Over**, 4.5%.
- *Movetech* · short hop, fast fall and a plain wall jump. No cling and no drift, because the held glide is Foldy's. Static Puff jump-cancels on a hit.

**Balance.**
- Strengths: he owns the space above his foes.
- Weaknesses: he is weak at his own level, light, and wide.
- His bolt only goes straight down and has a 14-frame cue.
- What the review changed:
  - Drift is gone, and his stalls work once per airtime.
  - His finisher no longer carries a foe and spikes them; it could KO from a grab over a pit.
  - His grab and forward throw no longer copy Goo's "Absorb and Spit".
  - Soaked is the shared status.
- If he lands low: weight 62, then the bolt to 10%, then recovery.

**CPU.**
- Sits 100–160 px above the nearest foe.
- Rain Cloud when a foe is under him.
- The bolt when a foe is under him, sooner if they are soaked, but not if they are already stepping out.
- The Earth at a grounded foe 120–450 px ahead and below.
- The finisher at a foe 60–130 px ahead, level with him.

---

### 3.7 Pie (she/her)
**Who she is.** A blueberry pie in a tin, and in BFDI blueberries explode. She is mellow, sassy and clever ("Yeah. Totally safe." · "Move it or lose it"). She bends her arms and legs in impossible ways and always comes back together. She appears in BFB and TPOT (Death P.A.C.T., then Death P.A.C.T. Again). She plays a long-limbed detonator: seed berries, get close, set them off.

**Stats:** weight 78 · run 0.94 · air 1.06 · jump 1 · fall 0.93 · damage 1 · recovery 1 (measure).

**Art:** BFB+TPOT. Her TPOT render, already in the game. Her BFB voting icon (limbs stretched) for the stretch moves, the forked picture for hurt, and the BFB book pose for wins. Stretch, flutter and crumb frames are drawn from the render. Colour: blueberry blue.

**Moves**
- *Jab* · **Bendy Slap**: her arm stretches into a slap (medium reach); 6%.
- *Up tilt* · **Contortion**: bends her arm over her head the wrong way in one big arc; 5.6%.
- *Down tilt* · **Long Leg**: one leg stretches out low along the floor and trips (medium reach); 4.6%.
- *Neutral air* · **Tin Spin**: spins round in her tin; 2 hits of 3.6%.
- *Forward air* · **Stretch Punch**: her arm shoots far ahead (medium reach, a frame slower than most); 7.6%.
- *Back air* · **Wrong-Way Kick**: a leg bends the wrong way and kicks behind her; 9.2%.
- *Up air* · **Filling Pop**: a squirt of filling pops out of her top and sets off any of her berries it touches. It costs her nothing; 6%.
- *Down air* · **Upside Down**: flips upside down and drops crust-first; spikes; jump-cancels on a hit; 9.8%.
- *Grab* · **Stretch Grab**: the longest grab in the game (42 px), but slow to get there (6 frames) and a 36-frame whiff; *pummel* **Are You a Murderer?**, 1.5%.
- *Throws*:
  - **Move It or Lose It** (forward), 7.4%.
  - **Make a Four** (back), 8.2%.
  - **Blueberry Boost** (up), 5.6%: pops a berry under them, and sets off her berries within 120 px. It costs her nothing.
  - **Totally Safe** (down), 5.2%.
- *Special* · **Explosive Blueberry**: she plucks a berry (8 frames) and flicks it in a low arc (medium reach).
  - It pops on the first foe it touches.
  - If it lands, it sticks to the floor or wall and settles for the grow-in time. Then it pops when a foe touches it, when another of her pops reaches it, or after 1 s.
  - Two out at most; a third sets off the oldest.
  - It never hurts her team.
  - 7%, pops them up. Cooldown 50.
- *Up special* · **Arm Flutter**: her arms stretch wide and flap like wings, three flaps upward, and she can steer. The flapping arms clip anyone beside her; 3 hits of 3%. No jump back.
- *Down special* · **Set Them Off**: she snaps her fingers (8 frames) and every berry she has out pops at once. With none out, she sets one down at her feet instead; it grows in, then works like a landed berry. No blast round her and no cost to her. Cooldown 40.
- *Smash* · **Taffy Snap**: while it charges she stretches her whole body far ahead like taffy, then snaps forward through everyone in the way (medium reach); 20%, knocks down. The obliteration gun stays with Robot Flower for phase 2.
- *Finisher* · **Fork in the Pie**: she looks at a fork and flicks it straight up. It comes down where she threw it about 0.7 s later, and she can move in the meantime.
  - **If it lands on her,** she explodes. This is her only self-explosion: 15% round her (medium reach), launches far. It costs her 6%, sets off her berries, and leaves her in crumbs for 20 frames.
  - **If it lands on a foe,** it sticks in them for 7%, and they bleed.
  - **If it lands on nobody,** it sticks in the floor.
- *Final Smash* · **Chain Reaction**: her cheek puffs, and a blueberry grows onto each foe within 300 px, one at a time. She snaps her fingers and they pop from foe to foe in a chain, three rounds: 4%, 4%, then 10% with a launch (8%, 8%, 20%). She isn't hurt.
- *Side rows* · **Stretch Slap**, 6.4% · **Roll the Tin**, 6% (she tips onto her tin's rim and rolls forward).
- *Movetech* · short hop, fast fall and a plain wall jump. No cling. Arm Flutter steers. Upside Down jump-cancels on a hit.

**Balance.**
- Her damage is at or just under each slot's usual.
- Her long reach is paid for with slower starts.
- Weaknesses:
  - weight 78;
  - the fork blast costs her 6%;
  - a 36-frame grab whiff;
  - a normal-height recovery;
  - only two berries at a time.
- What the review changed:
  - Kaboom! is gone. It overlapped Bomby, and now nothing blasts round her except the fork.
  - The gun smash went back to Robot Flower.
  - The up throw no longer costs her damage.
  - The Final Smash is no longer a blast round her.
- If she lands low: recovery first, then berry damage.

**CPU.**
- Flicks a berry at a foe 120–320 px away, once every 1.5 s at most.
- Set Them Off when a foe is next to one of her berries.
- The fork with a foe within about 80 px. She stays under it only below 100% with a foe close.
- Taffy Snap at a foe 60–190 px ahead.

---

### 3.8 Stapy (he/him)
**Who he is.** A calm, teasing desk stapler with arms and no legs. He hops on his base, "never runs out of staples", and falls into a stapler-instinct trance where he staples the closest thing in sight. His staples split the landscape in half (Fortunate Ben), and in Out of the Blue they pinned Liy to a wall and became a ladder. He appears in BFB (Free Food) and as a TPOT EXITor. He plays a heavy grappler who binds foes together.

**Stats:** weight 114 · run 0.90 · air 0.94 · jump 0.94 · fall 1.10 · damage 1 · recovery 1.2 for now (measure).

**Art:** BFB+TPOT. His TPOT render, already in the game. The BFB book pose for wins and the dazed BFB picture for the end of the trance and for hurt. The open, clamped, pressed and glazed frames are drawn from the render. His run is a hop on his base. Colour: his handle's watermelon pink.

**Moves**
- *Jab* · **Clack**: his top snaps shut on whoever is in front of him; 8%.
- *Up tilt* · **Top Pop**: flips his top open straight up; 6.4%.
- *Down tilt* · **Base Scoot**: scoots his base along the floor into their ankles; 5.2%.
- *Neutral air* · **Paper Jam**: spins with his top flapping open and shut; 3 hits of 3.6%.
- *Forward air* · **Chomp**: opens wide and chomps shut. The front, where the staple comes out, is the sweet spot; 7.8% (10.4% at the front).
- *Back air* · **Back Bump**: bumps his heavy base back into whoever is behind; 10.6%.
- *Up air* · **Jaw Snap Up**: snaps his top open straight up; 6.2%.
- *Down air* · **Heaviest Contestant**: drops like one of the heaviest contestants; spikes; jump-cancels on a hit; 12%.
- *Grab* · **Clamp** (34 px); *pummel* **Staple**, 2%.
- *Throws*:
  - **Full Force** (forward), 9%: a plain, strong launch.
  - **Horse Ride** (back), 9.2%: Liy rode him into battle.
  - **Spring Up** (up), 5.8%.
  - **Stapled Flat** (down), 6.2%.
- *Special* · **Staple Together**: he opens wide (10 frames) and fires one big staple straight ahead, fast (about 520 px). It hits for 6% and staples the foe to the nearest thing:
  - another foe within 170 px: the two can't get more than about 80 px apart for 2 s;
  - otherwise a wall they are against, for 0.7 s;
  - otherwise the floor, if they are standing, for 0.6 s.

  A hard launch on either fighter knocks the staple out. One link at a time, and never on his teammates. Cooldown 70.
- *Up special* · **Staple Down**: presses his top down, springs up a modest height, hangs for a beat, then drops jaws-first like a stapler pressing down on whoever is under him; 10%, knocks down. No jump back.
- *Down special* · **Stapler Instincts**: his eyes glaze and his top clacks twice (14 frames), then 3 s of trance.
  - Every hit he lands staples a standing foe to the floor for 18 frames, but never the same foe twice in a second.
  - He moves 10% slower.
  - You steer him as normal; there is no automatic turning.
  - Afterwards he snaps out of it, dazed for 20 frames. Cooldown 5 s.
- *Smash* · **Heavy-Duty Clack**: lunges and clamps down on the first foe he touches, with the front of his jaws as the sweet spot; 23%, they bleed, launches far.
- *Finisher* · **Staple Ladder**: he opens wide and spits three giant staples into the floor in a line toward the nearest grounded foe's spot (90–260 px ahead; 260 px if nobody), one at a time, each taller than the last, like the ladder in Out of the Blue.
  - Each one grows up out of the floor over the grow-in time, harmless while it grows, then clamps shut. Whoever is standing on it is popped up (5%, the first two) or launched (11%, the tallest).
  - His mouth stays open for 20 frames afterwards.
  - Step between them or jump each clamp. The line stops at ledges.
- *Final Smash* · **Split the Landscape**: he opens wide and leans down, then spits a torrent of staples into the floor and the ground splits under him.
  - Every grounded foe within 400 px on his floor, and anyone within 160 px of him, is stapled flat into the crack.
  - They take four stitches, then the ground snaps shut and throws them up: 4 × 2%, then 14% (4 × 4%, then 28%).
  - Be in the air, or on another floor, when the wind-up starts.
- *Side rows* · **Top Swing**, 7.6% · **Hop Rush**, 7.4%.
- *Movetech* · short hop, fast fall and wall jumps. He clings to a wall for about 1 s, stapling himself to it; he is the only new clinger. Heaviest Contestant jump-cancels on a hit.

**Balance.**
- Strengths: a heavy grappler, strong up close.
- Weaknesses:
  - slow and big;
  - a weak recovery (a plunge with no jump back);
  - a 10-frame start on his only projectile;
  - the daze at the end of the trance.
- His roots are short and few.
- What the review changed:
  - No automatic turning (it took control away from players).
  - His forward throw no longer bowls foes into each other; Snowball's finisher already does that.
  - His finisher is no longer a hold.
  - His up special is a plunge with no rooting staple.
  - His Final Smash is a pin, not a floor lane.
  - The Rock Paper Scissors option was dropped; it is Foldy's.
  - His side tilt was renamed, because Gaty already has "Swing Open".
- If he lands low: recovery first, then the staple's speed.

**CPU.**
- Fires the staple at a foe ahead within about 480 px, preferring two foes close together or a foe by a wall.
- Instincts with a foe within about 200 px, at most once every 6 s.
- Throws chosen by the situation.
- The finisher at a grounded foe 100–260 px ahead.

---

### 3.9 Foldy (she/her)
**Who she is.** A cyan-green sheet of acid-free paper folded into one module of a dodecahedron: armless, light, aerodynamic, kind and eager, and quick to hold a grudge (Liy).
- She plays Rock Paper Scissors with Stapy and Marker.
- She glided back to kick Blocky off Puffball over the lava.
- In TPOT she carried the Magic Bell, which conjures things that can't leave its vicinity.

She appears in BFB (Free Food) and TPOT. She plays a light glider who is very hard to keep off the stage.

**Stats:** weight 48 · run 1.04 · air 1.10 · jump 1.05 · fall 0.86 (the floatiest in the game) · damage 1 · recovery 1.

**Art:** BFB+TPOT. Her TPOT render (new to the game; today's assist is drawn in code). The BFB "half-folded" frame for the plane fold, the unfolded frame for KOs, and the TPOT 1 barf-soaked picture for soggy. Plane, glide, rock, scissors and cheer are drawn from the render. Colour: her real cyan-green, not the assist's white.

**Moves**
- *Jab* · **Flap and Kick**: a wing flap, then a kick; 2 hits of 3%.
- *Up tilt* · **Wing Flick**: flicks both wings up over her head; 4%.
- *Down tilt* · **Fold-Flat Slide**: flattens and slides into their feet; 3.6%.
- *Neutral air* · **Twelve-Fold Twirl**: twirls edge-on like a pinwheel; 3 hits of 2.2%.
- *Forward air* · **Paper Dart Kick**: one leg shoots out like a paper dart; jump-cancels on a hit; 5%.
- *Back air* · **Grudge Kick**: glances back over her wing and kicks hard; her strongest air hit; 7%.
- *Up air* · **Flutter Up**: flutters both wings straight up; 3.8%.
- *Down air* · **Downflap**: flaps both wings down hard and knocks whoever is below downward (a soft spike); 5%. The small lift it gives her works once per airtime.
- *Grab* · **Fold In**: folds a flap over them (26 px, the shortest grab); *pummel* **Crease**, 1.2%.
- *Throws*:
  - **Flying Start** (forward), 6.5%.
  - **Over the Flap** (back), 7%.
  - **Thrown in the Air** (up), 4.5%.
  - **Crease Them Flat** (down), 4%.
- *Special* · **Fold and Fly**: she folds into a paper plane (10 frames) and darts 330 px ahead. Hold up or down to tip the nose.
  - The first foe she noses into takes the hit, and she bounces off and unfolds. A wall stops her.
  - Once per airtime, and not while soaked.
  - 8%. Cooldown 55.
- *Up special* · **Press the Buzzer**: crouches, then floats back up the way she came up the 500 steps, kicking up at whoever is over her; 4–7%, stuns for a moment. No jump back.
- *Down special* · **Magic Bell**: no hit. She stamps a small green call bell down where she stands. It grows in, lasts 6 s, and breaks on any hit.
  - Press again to tap it from afar. If she is within 420 px, she shimmers for 10 frames (a hit cancels it) and is conjured back beside the bell, and the bell is spent.
  - She can't tap it while off the stage or carrying a flag.
  - She can't set it in a base or vault, and it never warps her through walls, doors or bars.
  - Cooldown 2 s after a warp.
- *Smash* · **Glide-Back Kick**: sails forward low and flat and kicks, the way she kicked Blocky off Puffball. The toe is the sweet spot; 18%, knocks down, launches far.
- *Finisher* · **Rock, Paper, Scissors, Shoot!**: she squares up and folds a wing into a fist, then challenges the foe right in front of her.
  - There are three beats. Each player's pick is the last arrow they press during the beats: left is rock, down is paper, right is scissors, and nothing pressed is rock.
  - The reveal comes a moment after the last beat, so an online player's pick always arrives in time.
  - **She wins:** a launching kick for 13%.
  - **Tie:** they play once more. A second tie pushes them apart for 4%.
  - **She loses:** the foe bops her (she takes 5%) and she is open for 24 frames.
  - A CPU picks fairly at random. Small hand-sign pictures (no words) appear only at the reveal.
- *Final Smash* · **Twelve Foldys Make a Dodecahedron**: she rings the Magic Bell, and eleven more Foldys pop in one at a time. They fold together with her into a giant paper dodecahedron that rolls across and back three times, never more than 420 px from where she rang. Caught foes are rolled over on each pass, and the last pass launches. 7%, 7%, 12% (14%, 14%, 24%).
- *Side rows* · **Wing Swat**, 4.5% · **Flown Off Course**, 4%.
- *Movetech* · short hop, fast fall and a plain wall jump. No cling. Paper Dart Kick jump-cancels on a hit.
  - **Glide:** hold jump while falling with no jumps left and she glides down slowly, for up to 1.5 s an airtime.
  - **Soggy:** while she is soaked she can't glide or use Fold and Fly, and she falls 10% faster.

**Balance.**
- Strengths: a superb recovery, though the bell now works on the stage only.
- Weaknesses:
  - the second lightest fighter (anything under about 59 takes the same knockback; she is simply KO'd earlier);
  - short reach and low damage;
  - soaking shuts off her air tools;
  - Rock Paper Scissors can backfire.
- What the review changed:
  - The Downflap lift works once per airtime.
  - The bell can't save her off the stage or ferry a flag.
  - Her plane angle is worked out from her movement online.
  - One shared wet list.
  - Renames: Fold and Fly, Fold In, Flutter Up.
- If she lands low: Fold and Fly to 9%, a longer glide, Grudge Kick to 7.5%.

**CPU.**
- The plane at a foe 150–330 px ahead at her height, or off-stage toward a ledge 150–330 px away.
- Glides only off-stage above the ledge.
- Sets the bell mid-stage with no foe within 260 px, and taps it as an on-stage escape at 100% or more.
- Rock Paper Scissors on a grounded foe within 50 px.

---

### 3.10 Beach Ball (they/them)
**Who they are.** A jovial, slightly oblivious six-panel beach ball with arms, legs and a huge grin.
- BFDIE opens with them bouncing on a trampoline with their best friend Sticker. They are launched way too high, dodge David's knives and land on a pole.
- In BFDI Mini Resort they built a sandcastle, kicked Pearl and Sunscreen off boats, and blew through a pool noodle.
- They pop on nearly every sharp thing they meet.

They appear in BFDIE (11th). They play a big, bouncy, pump-up body you can see coming.

**Stats:** weight 70 · run 0.95 · air 0.95 · jump 1.10 · fall 0.90 · damage 1 · recovery measured (expect 1.1–1.15; all of it is straight up).

**Art:** BFDI+BFDIA+IDFB group (BFDIE is drawn in the classic style). Their BFDIE render, already in the game. Squash, stretch, pumped, popped, hug and win are drawn from it. The pool noodle is a plain foam tube drawn in code. No BFB-era recommended designs.

**Moves**
- *Jab* · **Noodle Bonk**: bonks with a pool noodle (a little longer than most jabs); 7%.
- *Up tilt* · **Head Bounce**: bounces their round top up through whoever is above; 5%.
- *Down tilt* · **Sandcastle Dig**: digs and flings sand at their feet; 4.2%.
- *Neutral air* · **Body Bump**: sucks in, then puffs out, bigger when pumped; 7% (4% late).
- *Forward air* · **Noodle Lunge**: thrusts the noodle, with the soft tip as the sweet spot; 8% at the tip, 5.5% along it.
- *Back air* · **Off the Boat!**: kicks behind them, the way they kicked Pearl and Sunscreen off the boat; 9%.
- *Up air* · **Beach Volley**: volleys up overhead; 4.8%.
- *Down air* · **Bounce Off**: drops body-first. On a hit they bounce back up off the foe, higher when pumped; 7%, knocks them down and away.
- *Grab* · **Bear Hug** (34 px); *pummel* **Hug Tighter**, 1.6%.
- *Throws*:
  - **Beach Toss** (forward), 7.4%.
  - **Rafty Bounce** (back), 8%.
  - **Trampoline** (up), 5%.
  - **Buried in the Sand** (down), 5%.
- *Special* · **Big Bounce**: they squash (10 frames) and bounce forward in a big, slow, high arc, landing on whoever is underneath.
  - Keep C held for up to three bounces, steering as they go. You can walk under them.
  - Bounces are higher when pumped; when popped, they manage one little hop.
  - 6% a landing. Cooldown 58.
- *Up special* · **Way Too High**: squashes, then shoots straight up, way too high, and higher still when pumped; 4–6%, knocks down. No sideways drift and no jump back.
- *Down special* · **Inflation Pump**: no hit. Three pump strokes take 24 frames; they can't move, and a hit stops it.
  - Each pump goes up a size: Normal, then Pumped, then Fully Pumped.
  - A fourth pump at full pops them.
  - The air leaks back down one size every 10 s.
  - Cooldown 40.
- *Smash* · **Best Picture Sandquake**: springs up high at the nearest foe and comes down in a sandquake, bigger when pumped; 21%, knocks down, launches far.
- *Finisher* · **Blow Through the Noodle**: they put the noodle to their mouth and puff their cheeks full, then blow a big ball of air out through it. It goes straight ahead at their height, 7 px a frame for 360 px, and is bigger when they are pumped. The first foe it meets swells up round like a beach ball for a moment and bounces up and away; 12%, launches. Jump it or step aside. Nothing is held.
- *Final Smash* · **Way Too Big**: they swell to giant size and bounce across the stage four times, landing on caught foes in turn, then let the air out with a hiss. 6%, 6%, 6%, 12% (12%, 12%, 12%, 24%).
- *Side rows* · **Noodle Swing**, 6% · **Roll Along**, 6%.
- *Movetech* · short hop, fast fall and a plain wall jump. No cling. Bounce Off bounces them up on a hit.
  - **Inflation:**

    | Size | Size change | Hits | Run and air | Jump and bounce |
    |---|---|---|---|---|
    | Pumped | ×1.12 | ×1.07 | ×0.95 | ×1.06 |
    | Fully Pumped | ×1.25 | ×1.15 | ×0.9 | ×1.12 |
    | Popped (2.5 s) | ×0.8 | ×0.75 | ×0.9 | ×0.78 (jump) |

    Nothing drops below the game's 0.85 floor.
  - While pumped, a pointed fighter (Pin, Needle, Naily) pops them.

**Balance.**
- Strengths: big body hitboxes that grow, and the strongest straight-up recovery.
- Weaknesses:
  - the biggest hurtbox among the light fighters;
  - a floaty fall;
  - no sideways recovery;
  - pumping costs time and leaks away;
  - pointed fighters pop them;
  - Popped is a punish window.
- What the review changed:
  - The popped numbers are capped at the stat floor.
  - The finisher is no longer a hold.
  - The up tilt and pummel were renamed.
  - Their leap isn't the highest after all: Bubble's is.
- If they land low: a shorter pump, a slower leak, Big Bounce to 7%.

**CPU.**
- Pumps only with no foe within 320 px. It goes to Pumped, and to Full only when no pointed foe is alive. It never over-pumps.
- Big Bounce at a foe 140–420 px ahead.
- The finisher at a foe in line within about 300 px.
- Way Too High from nearly under the ledge.

---

## 4. The new assist bag (30 acts)

**Rules for every act**
- Each assist pops out over 30 harmless frames and never walks faster than 4.2 px a frame.
- Every startup is the character's own body moving.
- Anything an assist leaves behind grows in over the grow-in time, one at a time.
- Trophy damage is ×1.5, as today.
- Nothing needs a new relay message.
- The TPOT newcomers use their TPOT 14 vote pictures (BFB+TPOT). The Inanimate Insanity seven use one II look each.
- No name tags drawn over them.
- \* = they/them until checked against the wiki.

**Unchanged:** The Floor (chomp) and Grotato (mines).

1. **9-Ball** (they/them\*, TPOT) · **Stay Put**: hops into place between their summoner and the nearest foe and refuses to move. A solid billiard ball that bounces any foe who touches it back the way they came; 5%, light knockback, once per foe per second, for the whole stay. No rolling.
2. **Avocado** (they/them\*, TPOT) · **Pit Spit**: keeps 200–380 px away, gapes (30 frames) and spits their pit straight ahead (420 px); 9%. Then they waddle over and gulp it back. 3 a stay. *MePhone4 add.*
3. **Battery** (they/them\*, TPOT) · **Live Wire**: clips on (36 frames). A crackling wire grows in between Battery and the summoner and is live for 3 s. A foe who touches it takes 5% and a 6-frame flinch (no stun), and can't be zapped again for 45 frames. It snaps if stretched past 380 px.
4. **Blender** (they/them, TPOT; already in the bag) · **Vortex, plus Overflow**: today's vortex, unchanged. In the last 2 s the lid pops and five blueberry globs fountain out one at a time. Each does 5% with a 1 s slow and leaves a smoothie splat that grows in and slows for 2 s.
5. **Boom Mic** (she/her, TPOT) · **Boom Swing**: her pole wobbles and she hauls it overhead (34 frames), sweeping out to 210 px for 9%. Then she overbalances and the mic thunks down 220 px ahead for 6%. 2 a stay. *MePhone4 add.*
6. **Camera** (she/her, TPOT) · **Print Out**: her face appears on her lens and it zooms in steps (50 frames). Click, no flash, and a printed photo shoots out of her mouth flat ahead (360 px); 7%. 3 a stay. If she is shoved mid-zoom she turns green and the photo flops out short.
7. **Clapboard** (he/him, TPOT) · **CUT!**: his clapstick lifts (32 frames). On the clap, every grounded foe within 240 px freezes for 40 frames.
   - The freeze ends on the first hit they take, and that hit's knockback is halved.
   - Jumping dodges it. Twice a stay.
8. **Conch Shell** (he/him, TPOT) · **Horn Blast**: puffs up (40 frames) and blows a slow sound ring the way he faces (480 px); 4%, ordinary knockback. 3 a stay.
9. **Discy** (he/him, TPOT) · **Turntable**: rolls harmlessly to a spot on solid ground ahead of a grounded foe, flops flat and spins up (26 frames), then spins for 3 s. Stepping on him spins you off for 7%, once per placement. 3 a stay.
10. **Fourse** (it, BFDI–TPOT) · **Stampede**: rears and screeches (38 frames), then gallops one straight line along the floor (up to 900 px or a wall, leaping gaps); 11%. Whoever shoves it becomes its next target, with a shorter rear-up. 3 a stay.
11. **Income Tax Return Document** (he/him, TPOT) · **Audit**: folds small, then snaps open (32 frames). A foe still within 70 px gets him stapled on for 5 s: their hits deal 30% less, and each hit they land heals the summoner by 30% of it. No damage of his own. 2 a stay. He skips bosses.
12. **Kitchen Sink** (he/him, TPOT) · **Show-Off**: turns his tap (34 frames), and a jet arcs to where the foe stood and pours there for 70 frames: 8% when it lands, and the splash soaks. For the last 15 frames the stream creeps 120 px further. 2 a stay. *MePhone4 add.*
13. **Leek** (they/them\*, TPOT) · **Floor Routine**: a gymnast's lunge (30 frames), then three cartwheels in a line, 110 px each. Each hand-plant does 5% with a pop, and the last is a double-leaf whack for 9%. Never off an edge. 2 a stay. *MePhone4 add.*
14. **Onigiri** (they/them\*, TPOT) · **Clean-Up Duty**: follows the summoner and gulps foes' thrown items, puddles and floor traps within 90 px (200 px when nothing is coming). They chew for 24 frames between bites, 10 bites a stay. They never eat shots.
15. **PDA** (they/them\*, TPOT) · **Robbed Blind**: pulls out the stylus (36 frames). A foe within 80 px loses their held item and timed power-ups to the summoner. With nothing to take, it is a 7% jab. Never a flag or a Final Smash glow. 3 a stay.
16. **Rubber Spatula** (he/him, TPOT) · **Swat**: flinches back (30 frames), hops and swats down 110 px wide.
   - A grounded foe takes 8%, a 30-frame stun and a small pop.
   - An airborne foe takes 8% and is popped up and sideways. No spike.
   - 3 a stay.
17. **Salt Lamp** (they/them\*, TPOT) · **Warm Glow**: follows the summoner. The summoner and teammates within 150 px heal 1% every quarter second, with a half-second click-off every 2 s. About 25% at most per stay.
18. **Scissors** (they/them\*, TPOT) · **Snip**: their blades spread (30 frames), then they lunge 100 px and snap; 9%, and the foe bleeds. If the summoner is held, rooted, stapled, cuffed, caged or swallowed within 200 px, the next snip cuts them free instead. 3 a stay.
19. **Shampoo** (they/them\*, TPOT) · **Lather Trail**: scampers round the nearest foe, leaving lather patches. Each grows in and lasts 4 s, at most 8 at once. Stepping on lather makes you slip for 1 s.
20. **Shopping Cart** (she/her, TPOT; already in the bag) · **Ride**, with the same numbers as today. With no rider, she rolls harmlessly to her summoner and rattles so a human can hop on, and she droops when her rider jumps off.
21. **Snare Drum** (she/her, TPOT) · **Drumroll**: plants herself within 260 px. Four beats, then six quick ones, each sending a floor ripple both ways (1% and a tiny flinch). Then the crash, 260 px wide, for 10%. Jumping on the beat dodges. One song a stay.
22. **Tape** (they/them\*, TPOT; BFDI's tape dispenser, not Tapey) · **Tape Swing**: flings a strip up to a platform's underside, or to a fixed height that is the same on every screen. They swing one pendulum arc across, over solid ground. Whoever they touch sticks (6%), is carried along and is flung at the end. 2 a stay.
23. **VHSy** (they/them\*, TPOT) · **Reel Back**: records the summoner's path. When the summoner is launched hard, a tape strip reels them back to where they were a second earlier: the knockback is cancelled and the hitstun cut short, but the damage stays. Twice a stay.
24. **Walkie-Talkie** (she/her, II) · **Radio Silence**: her antenna extends and she crackles with static (40 frames). Every foe within 260 px is muted for 3.5 s: no specials or finishers, though a Final Smash still works. No damage. 2 a stay.
25. **Camera #2** (she/her, II) · **On the Spot**: hurries up behind the nearest foe and leans in (30 frames). Within 70 px, they are rooted for 1.5 s (they can still attack), then bonked for 8%. 2 a stay.
26. **Dr. Fizz** (he/him, II) · **Blows His Top**:
   - He checks the summoner's vitals and cures them and nearby teammates of burn, bleed, poison, slow, root, weakness, curses and scrambled keys.
   - Then he frets, shaking faster the more foes are near, and blows a geyser straight up (70 × 320 px). Foes in it take 9%, launched up. Teammates in it are doused and lifted gently.
   - 2 a stay.
27. **Zoetrope** (he/him, II) · **Stop-Motion**: his drum spins up (40 frames), then a flickering light cone (360 px long) shines for 4 s. Foes inside move at half speed, and for half a second after they leave. 2 a stay.
28. **Sprinkles** (she/her, II) · **Pesty Bestie**: hovers above the nearest foe, folds her wings and barks (26 frames), then dives at where they were; 6%, up to 5 dives. Any hit from a foe pops her into harmless confetti.
29. **Tyler Bombard** (he/him, II) · **Sneak Attack**: creeps behind the nearest grounded foe and rises up (30 frames). If they are still close, on the ground and not in hitstun, he slams them for 10%. 2 a stay.
30. **Groscer** (she/her, II) · **And the Award Goes To…**: a one-shot in three beats.
   - She appears at a fixed height over the nearest grounded foe, teetering in plain view (36 frames).
   - She drops: 14% under her, and a 6% floor shock beside her.
   - She stands for 5 s, then wobbles toward the nearest foe and topples full length (260 px) for 10%. No platform on her top.

**Bag size and timing**
- Today the bag has 17 assists: the ten new fighters, Selfie Stick, Toilet, MePad, Blender, Shopping Cart, The Floor and Grotato.
- At the end it has 32: The Floor, Grotato, Blender, Shopping Cart and 28 newcomers.
- The newcomers arrive in four batches of seven:
  - **A1:** Avocado, Leek, Boom Mic, Kitchen Sink (MePhone4's new adds, so they must come first), plus Camera, Shampoo and Discy.
  - **A2:** Battery, Clapboard, Conch Shell, Rubber Spatula, Scissors, Snare Drum, 9-Ball.
  - **A3:** Income Tax Return Document, Onigiri, PDA, Salt Lamp, Tape, VHSy, Fourse.
  - **A4:** the seven Inanimate Insanity characters, last, once their art look is chosen.
- Never below 17:
  - A1 (+7, with Selfie Stick, Toilet and MePad leaving) takes the bag to 21.
  - The first four kits bring it back to 17.
  - **A2 must land before kit 5.**
- MePhone4's adds switch to Avocado, Leek, Boom Mic and Kitchen Sink in A1, before any kit removes its row. None of them needs a summoner or leaves anything behind after the fight.

---

## 5. Build plan

**House rules for every step**
- One cheap agent per task.
- Edit the game file with Python only; it uses CRLF line endings.
- No test suite: build it, check it boots, take screenshots and show you.
- Headless Edge is fine for screenshots, but always end the Edge process tree.
- Online checks use the in-process host-and-client pair, never the live relay.
- Nothing is pushed until you have seen it and said yes.

**The steps**
1. **Shared groundwork** (nothing visible): the SOAKED status and wet list; per-fighter size, which Beach Ball needs; the object rules from section 3.0; Dough's skip list. *Check:* it boots.
2. **The lock rule.**
   - Event fighters sit at the end of the roster, marked as event fighters.
   - Until unlocked, they are left out of every pick list, CPU pool, the unlock drip, the opener for very old saves and "unlock everything". They never appear in the Daily.

   *Check,* in a scratch copy with one existing fighter marked as an event fighter: it never appears while locked, and the Daily pairings from 2026-08-11 to 2027-12-31 are unchanged (compare a fingerprint of the list before and after).
3. **The calendar:** this week's event and the next few. *Check:* the same 30-week table comes out in UTC, Los Angeles and Tokyo time, and it flips exactly at Monday 00:00 UTC.
4. **Tokens and saving:** payouts, the weekly limit, first wins, the loss rule, the alive rule, the unlock, two tabs open at once, computers that can't save. *Check:* a small merge script, with its output shown to you.
5. **Assist batch A1:** seven newcomers in; Selfie Stick, Toilet and MePad out; MePhone4's adds switched; name tags removed. The bag goes from 17 to 21. *Check:* screenshots of a newcomer in a match and of MePhone4 summoning his adds.
6. **Kit 1, Eraser.** See the checklist below.
7. **The event match runner**, using Eraser's three matches: the fixed setup, settings handed back, pay, the result note, and the Rematch and Event buttons. *Check:* all three run CPU against CPU to the end.
8. **Twists**, two per job: items and backdrops; sponge floor and pull; rain and gusts; then wind back, fast forward and low gravity anywhere. *Check:* a screenshot of each, a couple of CPU matches that finish normally, and the pair harness showing the guest's screen matching the host's.
9. **Event screens:** the title card, the event page, the select-screen group and hints, the result note. *Check:* screenshots at normal and small window sizes, keyboard only, and the title still has six buttons.
10. **Online, normal rooms:** the EVENT tag, and no event fighters in online CPU seats. *Check:* in the pair harness, a host without the unlock and a guest with it play the guest's Eraser, and his special, finisher and Final Smash look the same on both screens.
11. **Kits 2–4:** Spongy, 8-Ball, Black Hole. The bag goes from 21 to 17.
12. **Assist batch A2**, before kit 5. The bag goes to 24.
13. **Kits 5–7** (Clock, Cloudy, Pie), then **A3**, then **kits 8–10** (Stapy, Foldy, Beach Ball), then **A4**. The final bag is 32.
14. **Event rooms**, if you want them: both players are paid correctly, and a guest whose clock is wrong is paid nothing and told why.
15. **Launch:** the first week's date, at least two weeks after the last kit lands; a changelog line; screenshots of the event page for the first three weeks.

**Every kit job also does these**
- **Roster and move list.** Adds its row at the end of the roster, marked as an event fighter, with move cards. Its passives go in the movetech line of the move list.
- **Names, pronouns, art.** Uses canon pronouns, checks its names against the file, and uses art from one group only.
- **CPU.** Its CPU uses the kit sensibly at Hard, since that is the first impression players get in event matches, and the kit is added to the CPU finisher list.
- **Online.**
  - Everything it draws travels to guests in the snapshot.
  - The guest's own-fighter prediction includes its speed and fall changes.
  - No new relay message, and never the live relay.
- **Events and the bag.** Adds its three event matches, checks its team against canon, and removes its own assist row.
- **Checks.**
  - It boots.
  - Screenshots of its special, finisher and Final Smash.
  - A short CPU match.
  - The pair harness.
  - One 15-match tournament for balance, buffing only if it lands low.
  - Shown to you before any push.

---

## 6. Open questions

Each question comes with my recommended answer.

### A. The event system
1. **Token numbers.** Win 10 (if you're still in at the end); loss 5 (if you dealt 20% or lasted 60 s); +10 for the first win on each match; no daily limit; at most 100 a week per fighter; 100 to unlock. *Recommended: yes.*
2. **Separate tokens** for each fighter, or Win Tokens? *Recommended: separate, so Win Tokens stay "only buys a look".*
3. **When do events start?** *Recommended: once all ten kits are built, with the first week announced two weeks ahead.*
4. **The first lap** in your listed order? *Recommended: yes.*
5. **"Unlock every fighter ▸":** should it open event fighters? *Recommended: no, the same as Vault fighters.*
6. **Computers that can't save:** open event fighters there, following the game's open-everything rule? *Recommended: yes.*
7. **The Daily Match:** keep event fighters out of it for good? *Recommended: yes.*
8. **Online CPU seats:** never use event fighters, or allow the ones every player in the room owns? The second needs a short "owned" code in each join name, but no new message. *Recommended: never.*
9. **Event rooms:** do you want friends to be able to play event matches together? *Recommended: yes, built last, once normal rooms are perfect.*
10. **One's chain:** event matches don't count for it. *Recommended: don't count.*
11. **Tokens past 100:** keep counting them quietly for a later event costume, or stop at 100? *Recommended: keep counting.*
12. **An event quest?** *Recommended: no ("I dont want to hook ppl").*
13. **Select screen:** the "Event fighters" group between the BFDI cast and the Inanimate Insanity group, hidden until the first event? *Recommended: yes.*
14. **The 30 event matches:** anything to change? New maps from episodes (X's baskets, the TPOT roof) later, each as its own job? *Recommended: ship with today's stages; maps later.*
15. **Canon teams:** OK for each kit job to check its team match against the wiki and swap a CPU if it's wrong? (The wiki refused me.) *Recommended: yes.*

### B. Rules for all ten
16. **Grow-in:** everything new grows in over 12 frames, including assist leftovers and twists that push or slow? *Recommended: yes.*
17. **SOAKED:** one shared status that drips, slows, puts fire out, adds a third to Cloudy's bolt, and makes Foldy soggy. Should it also lower jumps? *Recommended: slow only.*
18. **The wet list** in section 3.0: should Marker's ink and Toothpaste's paste count? *Recommended: count both.*
19. **Cloudy's rain** puts out fire on everyone in it, foes included? *Recommended: everyone.*
20. **Spongy's fire twist:** soaked means he can't burn, and dry means he burns longer? *Recommended: no, keep it simple.*
21. **Side tilts and side specials** stay off for event fighters, kept as data rows? *Recommended: yes.*
22. **Assist name tags** come off every assist (they are words in a match)? The blue/red chip and the hostile health bar stay. *Recommended: yes, in batch A1.*

### C. The kits

**Eraser**
23. Rub Out erases only foes' things that a hit could already break, so not Taco's griddle, Ruby's prism or Book's castle? *Recommended: yes.*
24. Rub It Off is a cleanse only, with no heal (Clock keeps one)? *Recommended: yes.*
25. Out of the Picture shows the caught foe fading out and gone for 18 frames. OK? *Recommended: yes.*
26. Weight 88, or nearer Pen's 100? *Recommended: 88.*
27. The Final Smash erases the screen and then sweeps. Keep both parts? *Recommended: keep both.*
28. His fear of pentagons (a scared face when Eggy hits him)? *Recommended: leave it out for now.*

**Spongy**
29. Art group BFB+TPOT (keeping today's TPOT 25 render), or classic? *Recommended: BFB+TPOT.*
30. Water is ammo only, with no "heavier and slower"? *Recommended: yes.*
31. Squishy Top: everyone bounces off his head, once per airtime? *Recommended: keep it.*
32. The parachute only in his Final Smash, not his recovery? *Recommended: yes.*
33. Final Smash: the jet and its cannonballs (BFB 15), or the hose prank? *Recommended: the jet.*
34. Recovery set from the measure, within 1.15–1.25? *Recommended: yes.*
35. The boss endings keep his cameo (falling on the Announcer and on Puffball Speaker Box)? *Recommended: yes.*

**8-Ball**
36. Stop Shot: hold to spin up, or a fixed roll? *Recommended: hold.*
37. Keep the Draw? *Recommended: keep it.*
38. His roll stops at a ledge, rather than rolling off like a scratch? *Recommended: it stops.*
39. Jawbreaker Bite frees stuck teammates and also breaks Taco's jawbreaker? *Recommended: yes to both.*
40. The trebuchet drawn as Tennis Ball's plain wooden one? *Recommended: yes.*
41. The new Final Smash, The Break (a burst plus scattering balls)? *Recommended: yes.*
42. The bite frame cut from his TPOT render, and "8-Ball Flat" as his KO picture? *Recommended: yes.*

**Black Hole**
43. The Death P.A.C.T. rule: no spikes, launches only up or sideways? *Recommended: keep it.*
44. Accretion takes only items and floor clods, never foes' shots? *Recommended: yes.*
45. One thing in orbit at a time? *Recommended: one.*
46. Wormhole, a warp up special with a tiny teammate save (24 px, a jump back)? *Recommended: yes.*
47. His hurtbox is the black middle only, with the disk drawn but not hittable? *Recommended: yes.*
48. Singularity: 22 untouchable frames, cooldown 150, gravity stays on? *Recommended: yes.*
49. Event Horizon slows instead of breaking armour? *Recommended: yes.*

**Clock**
50. His hands painted out of the render and drawn in code, so they sweep and show Natural Time? *Recommended: yes.*
51. Fall Back heals only, or also rewinds where he stands? *Recommended: heal only.*
52. Finisher: the swingset, or the Twinkle hot potato? *Recommended: the swingset.*
53. Colour: his BFB/TPOT blue instead of the assist's tan? *Recommended: blue.*
54. Should getting hit pause Natural Time? *Recommended: no.*
55. The "rewind" assist act retires with him (VHSy has its own act)? *Recommended: yes.*

**Cloudy**
56. His downward bolt sits near Lightning's Pocket Thundercloud. Keep it? *Recommended: keep it; it comes from his own body, it is one strike, and it has the soak bonus.*
57. No Drift, so only Foldy glides? *Recommended: yes.*
58. Moods drawn as tints of his TPOT render? *Recommended: yes.*
59. Smash: the Earth roller, or a thunderclap burst? *Recommended: the Earth (the game already has 16 bursts).*
60. His grab collects a foe's held item in item matches? *Recommended: yes.*
61. The new finisher, Fell Right Through, as a swoop with nothing held and no spike? *Recommended: yes.*

**Pie**
62. Down special Set Them Off (no self-blast), so the fork is her only self-explosion? *Recommended: yes.*
63. Up special: Arm Flutter, or Propulsion? *Recommended: Arm Flutter (Propulsion is too close to Bomby).*
64. Do pointed fighters hit her harder? *Recommended: no.*
65. Colour: blueberry blue, or crust gold? *Recommended: blue.*
66. The new smash, Taffy Snap, with the obliteration gun saved for Robot Flower? *Recommended: yes.*
67. Leave the Death P.A.C.T. clones unused for now? *Recommended: yes.*

**Stapy**
68. Staple Together's two-foe link, or a simple pin? *Recommended: keep the link.*
69. The new finisher, Staple Ladder? *Recommended: yes.*
70. Final Smash Split the Landscape as a pin? *Recommended: yes.*
71. Up special Staple Down, a plunge? *Recommended: yes.*
72. Weight 114? *Recommended: yes.*
73. KO tumble: the TPOT 25 "Stapy Dead" picture, or a drawn tumble? *Recommended: drawn (the picture is too grim).*
74. Colour: watermelon pink? *Recommended: yes.*
75. He clings for about 1 s, the only new clinger? *Recommended: yes.*

**Foldy**
76. The held glide? *Recommended: yes.*
77. Soggy is the same as soaked? *Recommended: yes.*
78. A real Rock Paper Scissors that she can lose, with hand-sign pictures shown only at the reveal? *Recommended: yes.*
79. Final Smash: the dodecahedron, or the Death P.A.C.T. clones? *Recommended: the dodecahedron.*
80. The Magic Bell warps her back (on the stage only), or pulls the nearest foe to it? *Recommended: warp back.*
81. Weight 48, the second lightest? *Recommended: yes.*
82. Should Grudge Kick hit Liy and Match harder? *Recommended: no.*

**Beach Ball**
83. Their real size changes, both drawing and hurtbox (a new engine piece)? *Recommended: yes.*
84. Only Pin, Needle and Naily pop them? *Recommended: yes.*
85. Join the inflatables, so Pin's Point Pierce does +20%? *Recommended: yes.*
86. Keep the pop on a fourth pump? *Recommended: keep it (the CPU never does it).*
87. Final Smash: they pump themselves, rather than showing Sticker (a locked event fighter)? *Recommended: yes.*
88. The pool noodle as a plain foam tube? *Recommended: yes.*
89. The new finisher, a puff of air through the noodle with nothing held? *Recommended: yes.*

### D. The assist bag
90. Selfie Stick, Toilet and MePad leave the bag? *Recommended: yes.*
91. MePhone4's adds become Avocado, Leek, Boom Mic and Kitchen Sink, switched in batch A1? *Recommended: yes.*
92. Blender keeps its vortex and gains the Overflow ending? *Recommended: yes.*
93. Sprinkles pops into confetti from any foe's hit, breaking "assists can't be hurt"? *Recommended: yes.*
94. Which look for the seven Inanimate Insanity characters? *Recommended: the IV look where a clean picture exists, otherwise drawn in code, one look per character.*
95. Walkie-Talkie: the mute (a third way to block specials, after Rose and Tea Kettle), or her other canon power? *Recommended: the mute, kept short at 3.5 s.*
96. Healing and theft (Income Tax Return Document's refund, Salt Lamp's ~25%, PDA's power-up theft): OK? *Recommended: yes, with only timed power-ups counting as stealable.*
97. The remaining control effects (Clapboard's soft freeze, Camera #2's root, Walkie-Talkie's mute, Zoetrope's slow, Rubber Spatula's stun, Shampoo's slip): OK? *Recommended: yes.*
98. Skip Groscer's platform, since the guest's prediction can't see it? *Recommended: skip it.*
99. Fourse moves to event fighters if it wins the TPOT 26 vote? *Recommended: yes, in a later phase.*
100. 9-Ball's new act (Stay Put, a bumper) and Camera's new act without a flash? *Recommended: yes.*
101. Pronouns: eleven newcomers default to they/them until the batch job checks the wiki? *Recommended: yes.*
102. The crowd keeps showing the phase-1 characters? *Recommended: yes; the crowd already includes fighters.*
