# Guest controls: move-by-move parity and feel check

**Build tested:** what is live, ii-dlc at `d5d9e09` (the same as origin/ii-dlc, 2026-10-26 18:52). **Read-only:** nothing in the game was changed, nothing was committed or pushed.

## What this round adds

- **The first round of measurements still describes what is live.** That round ran 978 move-by-move tests on `cb417a8`. I compared every line between that build and `d5d9e09`, and the online code has not changed. What did change is the held-X pummel, which way Bow's smash goes, Bot's self-cheer, one ring sent to guests and the Settings page. Only the held pummel touches a guest's keys, so it was tested here.
- **The two prediction bugs found in the first round are still in the live file.** Their line numbers are updated below.
- **New this round:**
  - ledge and cliff play;
  - grab holds (the held pummel is new, and the struggle when you are the one held);
  - menus between matches.
- **One new problem was found:** the guest's prediction knows nothing about cliff walls (problem 2). There is also one menu problem (problem 8).
- **The computer was overloaded the whole time.** Every run has to use Idle priority, and one page boot took 20 to 30 minutes. So the new checks used one fighter (Coiny) with 1 or 2 tries per case. The cliff problem comes from code that every fighter shares (see problem 2).

## How it was tested

- The real game page was started twice in one process, once as the host and once as the guest. They were joined by a stand-in relay that uses the relay's own routing code (`scripts/helpers/net-pair.js`). **Nothing connected to the live relay.**
- The network between them was simulated:
  - a delay each way;
  - jitter: each message gets its own random extra delay, but messages stay in order like a real connection;
  - stalls: a lost packet holds up everything behind it.
- Real key events were pressed on the guest's page at exact moments inside a 60th of a second. The same keys were also pressed by a local player on the host's own page. Two things were compared:
  - what the host actually played: which buttons, on which frame, and which moves came out;
  - what the guest saw of their own fighter, frame by frame.
- The game's random numbers were set the same for both runs, so any difference comes from the controls, not from luck.
- **First round:**
  - Fighters: Spikey, Needle, Goo, Apple, Coiny, Lightbulb, Toothpaste and Nickel.
  - Each fighter had every input on its move card tested, 40 to 43 inputs each, 3 tries each. That is 978 guest runs.
  - Separate targeted tests covered held keys, taps, mashing, pause, focus loss, lost packets and latency changes.
- **This round:** cliffs, grab holds and menus, all with Coiny.
- Most tests used **80 ms ± 30 ms each way**. That jitter is harsh, like a bad Wi-Fi link. Tests that showed problems were also run with less jitter or none.

## Summary

With **no jitter**, a guest's presses match local play exactly: every move, hop height and timing is the same. The 160 "together" presses gave 0 wrong moves. Grab holds match too. A held X pummels at exactly the local rate, and you struggle free in the same number of presses.

What a guest notices comes from five sources:
1. **The design:** a guest's moves only show once the host has run them (problem 1).
2. **Gaps in the prediction:** cliffs and the ledge (problem 2), and the host pausing (problem 9).
3. **Two bugs** in the prediction's clock (problems 3 and 4).
4. **Jitter and lost packets** change the timing between presses (problems 5, 6 and 7).
5. **One menu** that leads nowhere for a guest (problem 8).

## Problems, ranked by how much a player would notice

### 1. Pressing a move while moving makes your own fighter freeze, then rubber-band, and the move shows up late
*Felt on almost every attack.*

This is how the prediction is designed, not a slip in the code:
- when the guest presses attack, special or smash, their screen stops predicting the fighter;
- it then waits for the host's picture to come back, which is a full round trip old.

**Measured (Coiny, 80 ± 30 ms):**
- **Run right and press X at frame 20.** Locally, the fighter keeps sliding forward through the jab. On the guest's screen it:
  - stands still for **7 to 11 frames**;
  - then shoots forward at 16 to 21 px a frame to catch up;
  - ends up as far as **84 to 95 px** from where it would be locally.
- **Jump and press X 8 frames in.** The fighter:
  - hangs in the air for 3 to 4 frames;
  - sinks about 20 px, then rises again;
  - is up to **50 to 64 px** off the local path.

  A smash in the air is worse: up to **99 to 106 px** off.
- **The move itself appears late on the guest's own screen.** The table gives the frames from the press to the first frame the move is drawn. Each figure is the median over all 8 fighters, with the worst case in brackets.

| Move | Local | Guest |
|---|---|---|
| Attacks | 5 | 18 (worst 31) |
| Specials | 2 | 14 (worst 29) |
| Grabs | 1 | 12 |
| Smashes | 2 | 13 |
| Finishers | 1 | 12 |

- Walking, running and jumping show on the guest's screen within **1 to 2 frames**, because they are predicted.

**Repro:** `wave2/guest/freeze.mjs Coiny`. In a real game: play as a guest at about 80 ms ping, run, and tap attack.

**Possible direction (needs the owner's call, bigger job):**
- keep predicting the fighter's own momentum and gravity until the host confirms the move, instead of freezing at the press;
- start the move's look locally at once.

### 2. NEW: At the cliff and the ledge, your own fighter sinks into the rock, then pops up
*Felt on almost every recovery.*

The guest's prediction (`netPredRun`, line 73366) moves its own fighter by the run, jump, gravity, floor and platform rules. It does not use the host's cliff rules (`cliffWalls`, line 18991). Three things are missing:
- the cliff face, which holds you off the rock;
- **the ledge catch**, which puts you up on the ledge when your feet are within 30 px of its top;
- the wall jump.

So, for a few frames, the guest's screen lets its fighter fall past the ledge and into the rock. When the host's picture arrives, the fighter is dragged back out.

**Measured (Coiny, Goiky Field's right cliff, 60 ms each way, no jitter, from the press of ←):**

| What the player does | On the host | On the guest's own screen |
|---|---|---|
| Feet just below the ledge, hold back toward the stage (**ledge catch**) | on the ledge at frame 5 | falls on to **75 px below the top and 32 px into the rock**, then is pulled up **82 px** over about 4 frames. On the ledge at frame 10 |
| Drift back to the stage at about floor height (**ledge catch**) | on the ledge at frame 11 | falls to **81 px below the top and 45 px into the rock**, then a **96 px** correction. On the ledge at frame 16 |
| Fall beside the cliff holding toward it | slides down the face | drawn up to **57 px inside the rock** for the whole slide. The prediction is 16 px off the host's position at the median |
| Jump against the cliff while holding toward it (**wall jump**) | wall jump | corrections up to **58 px** when the air jump is still unused (the prediction plays a double jump instead), and up to 21 px when it is used up |
| Falling well away from the stage (an earlier run) | | median 6 px off, no correction over 16 px: fine |

- The second row is the common one. Coming back at floor height, the fighter's edge reaches the cliff before its middle is over the floor. The host catches it there. The prediction only lands the fighter on the floor once its middle is over the floor, and by then its feet are past the 30 px allowance, so it keeps falling.
- These corrections are eased over a few frames, not snapped. The biggest single-frame move drawn was 20 to 22 px. They are still the biggest corrections measured anywhere in normal play, and they come at the tensest moment.
- This is code every fighter shares, on every stage with cliffs. Only Coiny was measured, because the machine was overloaded.

**Repro:** `wave2/guest/last.mjs` (the LEDGE section). It places the fighter beside the cliff on the host page and holds ← on the guest page. In a real game: play as a guest at about 60 ms or more, jump off the stage, and drift back to the ledge at floor height.

**Possible direction:**
- give `netPredRun` the same cliff face and ledge catch as `cliffWalls` (the guest already has the stage's floor spans);
- then the wall jump (it needs the host's "this wall already used" flag sent along).

### 3. Your own fighter keeps getting nudged: the prediction is always one frame behind
*Felt as constant small corrections on every jump, turn and stop.*

This is a bug. The host tells the guest which of the guest's frames it has played so far (`netAck`, line 73314). That number comes out **one frame too high**:
- the host's step counter is read after the step;
- the message timing it is compared with was read before the step.

The proof is that the host's figure runs 1 frame past the newest message it has received, which should never happen. As a result, the guest replays one frame too few of its own keys every time.

**Measured (40 s of running, hopping, turning and fast falls; nothing hits the fighter).** A "correction" is a new jump in where the fighter is drawn.

| Network | Corrections over 3 px per minute | Corrections over 10 px per minute | Prediction vs the host, median |
|---|---|---|---|
| 30 ms, steady | 112 | 22 | 6.6 px |
| 80 ± 30 ms | 217 | 105 (biggest 68 px) | 13.5 px |
| 150 ± 60 ms | 288 | 211 | 32.5 px |

**Tested in memory only** (the game file was not touched), with the figure one frame lower:
- a steady 30 ms link drops to **58 corrections a minute** and **0.4 px** median error, so the prediction becomes exact;
- at 80 ± 30 ms, corrections over 10 px fall from **105 to 67** a minute.

**Repro:** `wave2/guest/pred.mjs fix` (case `[A]`).

### 4. If your ping gets worse mid-match, your fighter stays wrong for the rest of the match
*Felt as constant jitter on your own fighter. Common on home Wi-Fi when someone starts a download.*

This is a bug, on line 73296 of `index.html`:

```js
if(!m.u) S.offs.push([f - (N.inTick || 0), now]);   // (an urgent one went mid-frame: not a measure of the network) while(S.offs.length > 1 && now - S.offs[0][1] > NET_IN.win) S.offs.shift();
```

The `while(...)` that should keep only the last 2 seconds of timing samples is **inside the comment**. Because of that:
- the host keeps every sample from the whole match (about 10 a second, never freed);
- it judges the guest's clock by the **fastest message of the whole match**;
- when latency goes up, its figure never follows.

**Measured (latency goes from 30 ms to 130 ms at 8 s):**

| Version | Corrections over 3 px per minute | Prediction error |
|---|---|---|
| As live | **594** | **45 px** median, **93 px** at the 95th percentile (the host's figure stays 7 frames off for the rest of the run) |
| Tested in memory with the 2-second trim restored | 140 | **20 px** at the 95th percentile, 12 s after the change |
| With both fixes (this one and problem 3) | 56 | **8 px** |

- A short freeze on the host (8 frames) also leaves the figure 3 frames off for the rest of the match. With the trim restored it is 1 frame off.

**Repro:** `wave2/guest/pred.mjs fix` (cases `30->130`, `[T]` and `[A+T]`).

### 5. A lost packet turns your next presses into the wrong moves
*Happens a few times a minute on a lossy link (a packet held up for around 200 to 300 ms).*

After a stall, the guest's held-up presses all reach the host together. The host keeps the real gaps between presses only when they were pressed **less than 12 frames apart** (`NET_IN.near`, line 73274). Presses further apart are played on back-to-back frames.

**Test settings:** Spikey, a 250 ms stall starting just before the first key, otherwise 50 ± 10 ms.

| Input | Local | Guest (as the host played it) | Result |
|---|---|---|---|
| Jump, then X 14 frames later | up air | X 1 frame after the jump | **up tilt on the ground: wrong move** |
| X, then X again 24 frames later | two jabs | second X 12 frames after | **one jab: press lost** |
| Smash tap, then ↑+C 30 frames later | smash only | ↑+C at 17 | **an extra up special** |
| Jump, then jump again 18 frames later | double jump at the top | second jump 6 frames after | double jump almost at once |

- Down air, run then special, and jab-jab at 14 frames came out as the right moves, just 11 to 13 frames early.

**Repro:** `wave2/guest/burst.mjs fighter=Spikey`.

**Possible direction:** keep the pressed gaps for presses that arrive bunched together, even when they are 12 or more frames apart.

### 6. Two keys pressed a frame apart split further on the host, and the wrong move comes out
*Only with jittery links.*

A press made in one 60th of a second goes out with the next one. Two keys can fall on either side of that edge, for example X and then ↓ 10 ms later. They then travel in two messages:
- the host plays each one the moment it arrives;
- jitter can push the second one 2 to 3 frames behind the first;
- the game's local leniency does not stretch that far.

**Test settings:** Spikey, two keys 0 to 25 ms apart at a random moment, either order, 8 key pairs, 30 tries each.

**How often the wrong move came out:**

| Network | Wrong moves |
|---|---|
| 80 ± 30 ms | **14 of 240** |
| 60 ± 8 ms | **2 of 240** |
| No jitter | **0 of 160** |

**Which pairs went wrong at 80 ± 30 ms:**

| Input | Wrong | What the guest got |
|---|---|---|
| X+C while running (grab) | 5 of 30 | **jab instead of grab** |
| ↓+X in the air, ↓ a hair after X | 5 of 30 | **up air instead of down air** (2 of 30 even at ± 8 ms) |
| ↑+X in the air, X first | 2 of 30 | neutral air instead of up air |
| ↑+X on the ground | 1 of 30 | up air instead of up tilt |
| X+C, C first | 1 of 30 | neutral special and then grab |

The move-by-move runs found the same thing in 12 of their 15 wrong-move runs (the other 3 are in problem 7):
- **Running, X then C a frame later** came out as **jab + side special** instead of a grab, once each for Spikey, Needle, Lightbulb and Nickel.
- **↑ then X a frame later** came out as **up air** instead of up tilt for Spikey, Needle, Goo (twice), Lightbulb and Nickel.
- **X then C a frame later:** Lightbulb got the grab but **lost the special** after it in 2 of 3 tries.

**Repro:** `wave2/guest/rate.mjs Spikey n=30 lat=80 jit=30` (and `jit=8`, `jit=0`). In a real game: online on Wi-Fi, run and press X and C nearly together, X first. Offline it is always a grab. Online it is sometimes a jab.

**Possible direction (owner's call):**
- a small fixed wait of 1 to 2 frames on the guest's presses would absorb this, at a cost of 17 to 33 ms of delay. The owner has asked for nothing to wait in a buffer;
- or, when a press arrives one step late, let it join the step before if it was pressed within a frame of it.

### 7. Jitter moves your later presses by 1 to 3 frames
*Short hops, run length, timed presses, grab mashing.*

The host plays every press when it arrives, so the gap between two presses shifts by the difference in their delays. Across the 978 runs, the gap between one key change and the next came out like this:

| Gap compared with the press | Share |
|---|---|
| Exact | 66% |
| 1 frame longer | 17% |
| 2 frames longer | 8% |
| 3 frames longer | 2% |
| 1 to 3 frames shorter | 7% |

What a player notices:
- **Short hops come out taller.**
  - With no jitter the heights match local exactly: a 2-frame tap gives 73 px, 3 frames 84 px and 4 frames 94 px.
  - At 80 ± 30 ms, the host held the jump key 1 to 2 frames longer in 7 of 24 short-hop tries, for hops 10 to 20 px higher. A 3-frame tap came out at 94 or 103 px instead of 84.
- **Runs come out a different length.**
  - Holding → for 20 frames goes 140 px locally. For the guest, the host ran it 134 to 166 px.
  - Holding it for 6 frames went 62 px instead of 44 in 1 of 6 tries.
  - The guest's own screen ends where the host does (within 0.5 px), so the fighter slides up to about 26 px after you let go.
- **Smash charge timing shifts.** A 24-frame hold was played as 21 to 27 frames, and a 70-frame hold as 67 to 73. Coiny's smash still came out as the same move with the same damage in 36 of 36 tries.
- **Timed presses miss their window.** Nickel's finisher bounce, with presses at frames 24, 54 and 84, gave the guest an **extra neutral air** at the end in 3 of 3 tries. The presses reached the host 2 to 3 frames early compared with the finisher.
- **Damage that depends on position changes.** In 9 of 978 runs a 1 to 3 frame shift changed which hits landed. For example, Coiny's smash aimed up missed in 1 of 3 tries, and Lightbulb's finisher hit 3 times instead of 2.
- **New this round: mashing X in a grab can lose a pummel** (Coiny, 80 ± 30 ms, X every 4 frames). Locally that gives 4 pummels. The guest got 4 in one try and **3 in the other**: a 5-frame gap moved a pummel past the moment the hold ran out. **Holding X** (the new held pummel) is not affected: 5 of 5 every try, the same as local.

### 8. NEW: A guest cannot change fighter between matches; "Change fighter" leads to a screen that does nothing

**FIXED (2026-10-27, g-guest-pick 15798e3):** online, Change fighter (host or guest) opens the room's lobby picker; the pick goes out as a hello and the next Rematch uses it. Offline it still opens the select screen.
*Felt by any guest who wants a different fighter for the rematch.*

The guest's result screen shows Change fighter, Title and Share. Rematch is rightly hidden (it is the host's call), and the screen says "Waiting for the host to rematch." Tested in a real two-page room:
- **Change fighter** takes the guest to the offline fighter select (`go('select')`, line 1815) while they stay in the room. A pick there is never sent to the host, so nothing is sent at all. When the host presses Rematch, the guest is pulled back in with their **old** fighter.
- **Start Match** on that screen goes nowhere: the guest lands back on the result screen and nothing is sent.
- The only way to change fighter is **Title**, which leaves the room, and then joining again with the code.

The host's next Rematch works normally from any of these screens: the guest's keys work in the next match, and nothing breaks.

**Repro:** `wave2/guest/last.mjs` (the MENUS section). In a real game: as a guest, finish a match, press Change fighter, pick someone, wait for the host's Rematch.

**Possible direction (UI polish, owner's call):** online, make the guest's Change fighter open the room's lobby picker, which already sends the new pick (`sayHello`), or hide the button for guests.

### 9. When the host pauses, a guest holding a key sees their fighter run off and then snap back
*Rare: only when the host pauses an online match.*

The host sends no pictures while paused, so the guest's world freezes. The guest's own fighter keeps being predicted for up to 30 frames.

**Test settings:** 80 ms, the guest holds →, the host presses Esc at frame 20 and again at frame 80.
- The guest's fighter runs on for **26 frames, 196 px** past where the host froze it, and stands there for the rest of the pause.
- When the host resumes, the fighter **jumps back 190 px in one frame**, then lurches forward up to 39 px a frame to catch up.
- If the guest holds nothing during the pause, there is only a 12 px wobble.

**Repro:** `wave2/guest/hostpause.mjs lat=80 jit=0`.

**Possible direction:** have the host tell guests "paused" (so the prediction stops), or stop predicting when pictures stop arriving.

## Checked and fine

- **Grab holds (new on the live build):**
  - Holding X pummels at exactly the local rate (Coiny: every 11 frames, 5 hits in 60 frames, the same as local), only shifted 1 frame by jitter.
  - The new rule that a held X repeats the pummel applies to guests, since `isHumanCtrl` counts an online guest as a person.
  - Hold X, then ↓ gives the same pummels and the same down throw as local.
- **Being grabbed:**
  - With no presses, the guest is held 59 frames, the same as local.
  - Mashing X frees you in **37 to 38 frames against 35 locally**. That 2 to 3 frame gap is just the time your presses take to reach the host.
  - Your own fighter is drawn perfectly still while held (it never moved more than 0.5 px a frame): the prediction rightly stops during grabs and holds.
- **Two keys on the same frame always land together** (↑+X, X+C, V+C, ↓+C and so on). There were no wrong moves without jitter. At 80 ± 30 ms there were still none for ↑+C, V+C and ↓+C.
- **Input delay to the host** is the one-way delay plus 17 to 33 ms, against 0 to 17 ms for a local press. That is about 1 frame more than local, by design: a press goes out with the next 60th of a second.
- **Held keys:**
  - The computer repeating a held key does not double presses. X, → or C held for 50 frames with key repeats gave the same moves as local.
  - If the window loses focus while → is held, the host lets go about 5 frames later. No key gets stuck.
  - Held smash: the same move and the same damage in 36 of 36 tries (6 hold lengths, 6 tries each).
- **The guest's own pause (Esc):**
  - their fighter lets go on the host 4 to 7 frames later;
  - X pressed during the pause is never played;
  - a key still held when they resume picks up again.
- **Menus between matches** (apart from problem 8):
  - the guest's result screen comes up with Rematch hidden and the "waiting for the host" line;
  - R, Esc, Enter and Space do nothing there and send nothing (R can no longer restart a match of its own on a guest's page);
  - the host's Rematch starts the guest every time, and the guest's keys work in the new match.
- **Jumps:**
  - full hops and every hop height match local exactly when there is no jitter;
  - on the guest's own screen, a jump follows the host's to within about 4 px.
- **Running and stopping:**
  - no backward steps on the guest's own screen (0 px in 24 runs);
  - the fighter ends within 0.5 px of where the host has it.
- **No hard snaps (over 160 px) in normal movement** on any network tried: 30 ms, 130 ms, 80 ± 30, 150 ± 60, a jump from 30 to 130 ms, upload stalls and host freezes. The only big jumps drawn were a KO'd fighter reappearing at its respawn spot, which is expected.
- **No missed or doubled presses:**
  - In all 978 move-by-move runs, the host played exactly as many key changes as were pressed.
  - Quick re-presses all arrived: pummels, double jumps, and Coiny's 14-tap finisher mash. That mash hit 7 or 9 times instead of 8 in 2 of 3 tries, because of timing (problem 7), not a lost tap.
  - The only lost press came from a lost packet (problem 5).
- **Tapping a key down and up inside one 60th of a second** counts for a guest: the guest's page remembers it until it is sent.
- **The flag and edit keys** (Capture the Flag) travel in the guest's frames like the other buttons, and they stop the prediction as a move press does. This was checked by reading the code, not by playing.

**Noticed along the way, not a guest problem:**
- On the host's own keyboard, and in offline play, a very quick tap is **lost**. X, C or V tapped for about 9 ms inside one frame gave nothing locally, but gave a jab, special or smash as a guest.
- Locally, mashing X in a grab is slower than holding it. Coiny got 4 pummels from a mash every 4 frames, against 5 from holding, because a press that lands while the pummel is not ready does nothing. The code's comment says "holding is never faster than mashing", but it is.

## Not covered

- **Prediction errors fighter by fighter**, and the input delay broken down by ping: these runs could not finish on the overloaded machine. The measured snap-back numbers are for Coiny on Goiky Field. The cliff gap and the two clock bugs are in code shared by every fighter.
- **Lobby picking and Capture the Flag keys in a live CTF match**, played: the code was read, but nothing was run.
- **The game has no shield button**, so there was nothing to test for a held shield.

All scripts are in `C:\Users\carad\AppData\Local\Temp\claude\C--Users-carad--claude\82251bbe-13a2-473f-9c20-558b0b86c2bf\scratchpad\wave2\guest\`. Raw outputs are the `out-*.txt` files in the same folder; this round's are `out-mini.txt` and `out-last.txt`. To run them, the working directory must be the smash-bal worktree. They must run one at a time at Idle priority (`run.ps1`, or `run2.ps1 <minutes>` for a longer cap). Everything runs in one process with a stand-in relay. None of it touches the live relay.
