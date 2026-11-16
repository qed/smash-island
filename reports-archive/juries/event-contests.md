# Jury: the six event contests (branch g-contests, ce47631a)

Juror: adversarial, headless only (jsdom), scratch copies, no browser, no edits to the branch, no relay. My scripts are in the scratchpad (cpu.mjs, human.mjs/human2/human3, pierev.mjs, noop.mjs). I changed no thresholds anywhere. Samples are small (5-6 runs per cell): read the numbers as direction, not odds.

## What I could NOT check
- No browser, no real person. Every "human" below is a bot. They use the builders' goal logic (for Black Hole that is the game's own CPU pathing), plus reaction lag, idle moments and a fight reflex.
- No human-like bot for 8-Ball, Foldy or Pie (time). For those I have CPU-only runs and code reading.
- Edge cases (KO while carrying, ties, timer) were read in code, not all driven. Pie's 3:00 timer path was never reached by any CPU run, mine or the builders'.
- HUD/text: read from source only, no rendered pixels reviewed.

## (5) Leaks: PASS
Compared against the merge base bca2d88f (ii-dlc has moved on to 96f4ad1f since the branch was cut). State hash, 600 frames, 4 CPUs, 23 scenarios: ordinary FFA, ordinary Teams, and event matches 1-3 of Eraser, Spongy and Cloudy, plus matches 1-2 of 8-Ball, Black Hole, Clock, Stapy, Foldy and Pie. Old and new outputs are diff-identical, 0 errors. (My first attempt printed "identical" on two empty files because of a launch bug. I caught that and redid it; each output has 23 real lines.) Cloudy's, Spongy's and Eraser's contests are unchanged. Not covered: the six new thirds (changed by design) and anything past frame 600. The clock was not frozen separately; the stepping is synchronous and the hashes matched.

## (1) Goal vs survival (CPU-only, 6 runs each, my own seeds)
"Goal" = CONTEST.winner was set before the match ended. When a goal wins, contestWin marks the other three dead. So "all three others out" at the end of a log is NOT evidence of fighting. I counted fighters already dead BEFORE the win.

| Contest | Ended by goal | Time (s) | Already KO'd before the end |
|---|---|---|---|
| Clock | 6/6 | 84-124 | 0 or 1 |
| Foldy | 6/6 | 108-176 | 0 or 1 |
| Stapy | 4/6 (2 ended on last fighter standing) | 96-194 | 2-3 in every run |
| 8-Ball | 6/6 | 47-85 | 0 or 1 |
| Pie | 6/6 | 88-105 | 0 (no KOs in this match) |
| Black Hole | 6/6 | 56-114 | 0 |

Only Stapy has the problem. The first KO lands at 62-115 s, and 2 of 6 runs end because three people are out while the leader has only 7-8 finds. With 9 finds at about 15 s each, the stock fight outlasts the search.

Fix for Stapy, my preference first: (a) a 3:00 timer where the most finds wins (a tie goes to whoever reached that count first); (b) SR.need 9 -> 7; (c) do not let a KO end the match here. Do not touch CPU brains (owner rule).

## (2) Fairness for a human
- Black Hole: the human-like bot (lag 8 frames, 12% idle, fight reflex) won 3/6 against 3 CPUs, in 68-126 s. The builders' passive bot won 0/5. So it is winnable. Caveat: my bot climbs with the game's CPU pathing, and a real kid may climb worse. CPU-only: nobody was KO'd in any run.
- Stapy: the same style of bot (it knows the 7 hiding spots, which a person does not) won 4/6 in 49-83 s. CPUs need about 150 s. I would not call it too easy for a real person.
- Clock: the result depends on one habit, staying in the light.
  - A bot that chases foes out of the light won 0/6 (lag 8), 1/5 (lag 4) and 0/5 (lag 1, no idle).
  - A bot that stays in the light and only hits what comes near (lag 4, 5% idle) won 4/5, in 42-60 s.
  - The builders' no-fight bot on my seeds won 4/5, in 51-70 s.
  - CPUs need 85-125 s. So the CPUs are weak at the goal. A competitive player who reads the rule wins about 80% of the time, and a new kid who brawls loses. That is a coherent skill check but easy once understood. If the owner finds it too easy, change CK.start or CK.alone for everyone, not the bots.
- Pie: with the default layout the player's slot (leftmost, right under steps 0-1) won 6/6 of my CPU-only runs (builders: 7/10). With the four start x values reversed, that slot's fighter won 2/6. The leftmost spawn looks like a real head start, and it goes to the human. It is an unearned edge, so consider shuffling the start slots. n is small.
- 8-Ball / Foldy: no human-like test by me. Builders' scripted human won Foldy 2/3.

## (3) Exploits and stuck states (code reading, plus the runs above)
- Stapy has no timer. If nobody can find Foldy and nobody dies, the match never ends. It did not happen in my 6 runs, but the 3:00 timer in (1)(a) closes it.
- Black Hole has no timer. A player who stands still just loses to the CPUs. A camper at the hole can hit arrivals ("any hit" is the design), and a loose ball near the hole is swallowed for nobody. No exploit seen.
- Clock: camping in the light IS the goal. Hitstun stops the clock. A tie at 0:00 goes to the first fighter in slot order (the player). Trivial.
- Pie: the timer path (highest wins, a tie goes to whoever got there first) was never exercised. Someone should drive it once before it ships.
- A KO while carrying: Black Hole puts the ball on the floor (placed, no sky drop). Foldy puts 3 pages back at the stack. A Foldy combo costs one page (36-frame window, 4 s safe).
- No CPU-only run of mine hung (all finished, 0 errors). I did not build my own stuck-CPU detector.

## (4) Design deviations: sensible
- Foldy 30 pages (design 12): 12 ended in 29 s per the builders; 30 gives 108-176 s. OK.
- Stapy 9 finds (design 3): 3 ended in 33 s. 9 makes it long enough that KOs decide it, hence the fix in (1).
- Clock items off: right, no sky drops.
- Pie 100 steps worth 5: fine; the text says 500 and the HUD shows n / 500.

## (6) Text and HUD
All six pre-match lines are one or two short sentences (about 90-110 characters) and read correctly. Goal lines: "Stand in the light to run out your clock", "Catch 30 pages", "Find Foldy 9 times", "Free 3 from the jawbreakers", "First to the top step wins", "Carry 5 balls up to the hole". Win banners are short and correct. One nit: Stapy's banner is "found Foldy!", but the goal is 9 finds; "found Foldy 9 times!" is clearer. Not seen rendered.

## Verdicts
- Clock "Fast Forward": MERGE. Note for the owner: easy for anyone who stays in the light.
- Foldy "Carried Off": MERGE.
- Stapy "The Search Party": FIX FIRST. 2/6 runs ended on last fighter standing and every run had 2+ KOs before the end. Exact fix: add a 3:00 timer (most finds wins, a tie to whoever got there first), and/or lower SR.need to 7; change the banner to "found Foldy 9 times!". Re-run 6 CPU-only runs and confirm at least 5/6 end on finds or the timer.
- 8-Ball "Lick Your Way to Freedom": MERGE (6/6 by goal in 47-85 s; I did no human test).
- Pie "500 Steps": MERGE, with notes. The leftmost start is a head start (consider shuffling), and the 3:00 path is untested.
- Black Hole "Back to the Top": MERGE (a human-like bot wins about half; the passive bot loses, as it should).
