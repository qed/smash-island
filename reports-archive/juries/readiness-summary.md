# Readiness juries: summary (2026-11-12)

Four juries, each with 6-8 personas. They read the code and the reports; nobody played a real or online match. Full reports are in this folder:
- readiness-competitive.md
- readiness-party-online.md
- readiness-new-players.md
- readiness-creators-retention.md

## Verdicts

| Area | Verdict |
|---|---|
| Casual online 1v1 | ALMOST |
| Ranked | NOT READY (no rating, no identity, the host has no lag) |
| Local tournament | ALMOST (no ruleset preset, timer or set counter) |
| Online tournament | NOT READY |
| 2-4 player online FFA | ALMOST |
| 8 player online FFA | NOT READY (FFA holds at most 5) |
| Online Teams / CTF | ALMOST |
| Event modes online | NOT READY (they refuse to start in a room) |
| New player, first 5 min / 30 min | ALMOST |
| New player, first week | NOT READY (judgement call) |
| Returning player | READY |
| A good video / a community event | ALMOST |
| A stream night with chat | NOT READY |
| Week-2 retention | ALMOST |
| Month-2 retention | NOT READY |

## The one problem every jury named
"Pressed, nothing came out": the simulated playtest logged 207 of these events. The cause is unknown, and the events came from bots, so it needs a diagnosis before any fix.

## Combined top list (impact over cost), with what the lead is doing

Small UI/UX polish (allowed under the freeze): being built now
1. Key strip for the first 3 matches, made from the player's real keys. The lesson and How-to-Play text also come from the real key map, because remapped and WASD players are told the wrong keys today.
2. In-match hint after 3 dead W/A/S/D presses.
3. Gamepad: Start button pauses, plus a shield button.
4. Online: say "room full" instead of "Cannot reach the relay".
5. Online: tell the host FFA holds at most 5, and offer Teams for 6 or more players.
6. Online: ready markers and a "2 players have not picked" warning on Start.
7. Online: when the host leaves, show a clear message with "new room, same players".
8. Diagnose "pressed, nothing came out" (diagnosis only; any fix goes to the owner).

Bigger: these need the owner's go (feature freeze / "pipis")
- A competitive preset: items off, 3 stocks, legal-stage list. Then a timer for normal matches, best-of sets and stage strikes.
- A small input delay on the host's own fighter to level the host's advantage, with ping shown.
- Letting a dropped guest reconnect into their seat.
- Event modes in online rooms.
- Official 6-8 player FFA (spawns, camera).
- Spectators in online rooms and replay saves.
- Ledge hang/getup and dodge depth.

Owner decisions (added to owner-decisions-pending.md)
- Where should the tip link point (SUPPORT_URL is empty, so the tip jar and Thanks roll are hidden)?
- Add a community/contact link? Where should it point?
- A "For creators" FAQ section: can people monetise videos? What music licence applies?
- Keep announced event weeks fixed, instead of re-dealing them when a new kit lands (O28)?
- Should the first match be gentler (3 fighters, Easy CPUs)?
- The fighter count says 102 on the static pages but 111 on the scorecard; which is right?
