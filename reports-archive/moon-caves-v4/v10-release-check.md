# Moon Caves v4: V10 release check (dry run) and the owner's checklist

State of the build (branch g-moon-v10, not pushed): `MC_V4_OPEN = false`. Moon Caves v4 is still hidden. Only you can open it.

## What V10 added (all invisible while the switch is off)
- Hook 10: the match record carries `moon` ("4-09@p1") for a v4 match only (v3 and every other stage: no key); the NaN log row's `moon` field is the id for v4 (still true/false elsewhere); the replay downloads are named `bfsi-match-moon-4-09.webm` and `bfsi-clip-moon-4-09.gif` (v4 only; v3 names unchanged).
- The result screen: for a v4 match one short sentence is added to the line under the title: "Team 1 takes Moon Caves v4 - ... Moon 4-09." Nothing about the moon is drawn in a match.
- The stage card, lobby drop-down, online summary line and online picker needed no new code: they all go through `stageOpen()`, whose first test is the v4 switch. The lobby moon picker was NOT built (your answer: later). No One-reward line was added.

## Dry run (test copy with the switch forced on IN MEMORY only; the real file is untouched)
- Switch off (the real build): the Moon Caves v4 card, lobby option and online option are absent; The Moon and Moon Caves (v3) show as before.
- Switch on (test copy): Moon Caves v4 appears in the stage cards, the lobby drop-down and the online summary, in Teams mode only (as v3).
- A guest joins a host whose switch is on (fake sockets, never the live relay): same moon, same plan hash and piece hash at 2, 4 and 7 a side; a message with the old tag p0 is refused; a guest given another moon's message ends on that moon.
- v3 unchanged: piece hashes at 2, 4, 7, 10, 15 a side equal ii-dlc's.

## Your checklist to open it (only on your yes)
1. Look at the three curation sheets once more if you want (the V9 sheets v9-sheet-4/-10/-15.png, from the V9 branch) and play a few v4 matches with the dev flag (localStorage `bfsi:mcv4dev` = 1 in one browser), alone and with a friend if possible.
2. Known open points to decide on: S4 (CPUs standing in place in long matches) was improved but not proven gone; 2-5 a side tops and the Hot Plates furnace pole still repeat; no browser look has been done on V10's result-screen line (all checks were headless).
3. If yes: change `const MC_V4_OPEN = false;` to `true` (one word), add a What's-new changelog line (do not name the hidden fighters), and ship on an update day or "ship now".
4. Right after opening: check the stage cards (Teams mode), the lobby drop-down, and one online match with a friend.
5. To take it back: set it to `false` again; nothing else needs to change (saved or in-flight rooms keep their stage id, v3 keeps its own id).
