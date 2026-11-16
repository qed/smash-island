# Flag Cup: a "Normal" (you play) option — plan

Owner, 2026-10-19: "flag cup should have a 'normal' option". Read as: like the World Cup's Normal mode, the Flag Cup gets a
played mode next to today's watch-only cup. Only the played mode goes through the Capture the Flag practice.

Studied in `artifacts/V1/index.html`: the Flag Cup (`ctfCup*`, ~6960-7915), the strategist (`ctfStrat*`, ~7915-8260), the World
Cup Normal flow (`kickOffTournament` / `startTournament` / `showTourneyHub` / `simRestOfRound`, ~14840-15440) and the practice
gate (`ctfTutGate`, ~14550-14583). Nothing was edited and nothing was run.

## How it plays

1. **Setup screen.** A new first row, **Mode**: `Watch (CPUs only)` | `Normal (you play)`. Every other row stays: teams
   (4 / 8 / 16), team size (2v2 to 8v8), maps (rotate / random / one map), CPU skill, advanced rules, group and knockout caps.
   The summary line adds "you play your team's N matches" in Normal.
2. **Team builder.** The same cards. In Normal, one card is **Your team** (Team 1 by default; a "Make this my team" chip on the
   others moves it). Seat 1 on that card is **You**: the fighter you play (picked from the same list, or left to the draw).
   Seats 2+ are your CPU teammates, picked or drawn as now. The other teams are built exactly as today: fighters, CPU skill,
   plan and kits.
3. **Your team's plan.** The strategist is off for your side: you run the plan in the match with the usual plan menu, as in any
   Capture the Flag match. If your card has a saved plan (Plan: fixed) or a loaded kit, that is your starting plan: it fills
   your own vote, so you can still change or clear it in the match. The kit's jobs, areas, budgets, flag spots and IF-THEN
   rules still steer your CPU teammates. The CPU skill chip on your card sets your teammates' skill.
4. **Kick Off.** Normal goes through the practice gate first (below). Then the hub, as the World Cup's Normal hub: the brand
   reads "Flag Cup · Your Team: ...", your fixture is highlighted with **▶ Play**, the big button is **▶ Play My Match** until
   your fixture of the round is played, then **Sim rest & Continue**.
5. **Which fixtures you play.** Every fixture with your team in it: 3 group matches plus each knockout round you reach
   (8 teams: up to 5 matches; 16 teams: up to 6; 4 teams: up to 4). You play seat 1 on your team's side (team A = side 0,
   team B = side 1; side 1 already works for humans online). Your match is never simulated (the hub forces it).
6. **CPU-vs-CPU fixtures.** Unchanged: **▶ Watch** any of them (the spectator camera and keys, S settles the rest of it), or
   let **Sim rest & Continue** settle them with the strategist's model (`ctfStratSim`, falling back to the rating roll).
7. **Maps.** The cup's map rule applies to your fixtures too (`ctfCupFxMap`: one map, random, or rotating by round); the hub
   shows each fixture's map before you play it. On a two-sided map the side bid runs with you in it, as in a normal match.
8. **Caps.** The cup's caps apply (group 8 min, knockout 12 min by default): past the cap it is flags, then fighters still free,
   then a draw (group) or a coin (knockout), as now.
9. **Knocked out.** If your team misses the knockouts or loses a knockout match, the rest of the cup becomes watch-only, as in
   the World Cup. The champion screen says "You win the Flag Cup!" when it is yours.

## What it reuses (no change needed)

- The World Cup's Normal plumbing, already generic over `TOURNEY.mode === 'normal'` and `TOURNEY.myTeam`: the hub's
  Play My Match button, `simRestOfRound` refusing to sim your match, the "▶ Play" and highlighted rows in `renderGroupHub`,
  `wireWatchButtons`' `youPlay`, group and knockout elimination tracking.
- The Flag Cup: `ctfCupMakeTeams`, the builder, the picker, the plan editor, kits (save / load / AI import),
  `ctfCupFxMap`, `ctfCupCap` / `ctfCupCapEnd`, `ctfCupDone` / `ctfCupRecord`, `ctfCupSimFixture`, the strategist for both
  sides of every CPU-vs-CPU fixture, `ctfStratLearn` (the other teams learn your plans as the cup goes on).
- The match: `beginMatchNow`, the plan menu (`ctfMenuToggle` / `ctfPlanVoteIn`), the side bid, `CTF.skillOf` per side.
- The practice gate `ctfTutGate`. The comment above `ctfCupKickOff` already says a played Flag Cup should use it.

## What is new (about 150-250 lines)

1. `ctfCupClean`: `play` (0/1) and `mine` (team index); a Mode row in `CTFCUP_ROWS`; the setup foot text and summary say which
   mode is on.
2. Builder: the "Your team" chip, seat 1 labelled "You", the plan chip on your card reading "Your plan: none / saved plan".
3. `ctfCupKickOff`: Normal → `ctfTutGate(()=>ctfCupStart(), 'cup')`; Watch unchanged. One line in `ctutWhy` for the
   'cup' reason ("Then your Flag Cup starts.").
4. `ctfCupStart`: `mode: play ? 'normal' : 'spectate'`, `myTeam: teams[mine]`.
5. `watchFixture` passes `youPlay` on: `ctfCupWatch(fx, youPlay)` sets `CTF.cupFix.you` (0, 1, or -1).
6. `ctfSpecSetup` / `ctfCupSeat`: when `cup.you >= 0`, seat 1 of your side is `controller:'local', you:true`, no `CTF.spec`,
   and Explore is forced off (today `L.explore` checks `!CTF.spec` only, so a player with Explore on would get a frozen fixture).
7. Strategist: `ctfStratBegin` marks your side as the player's: no `ctfStratApply` / pseudo-vote `ctfStratApplyFixed` for it
   (the pseudo-vote would be merged with your vote and you could never untick it), and `ctfStratTeam` skips it. Your saved
   plan seeds your own vote (`CTF.menu.vote` + `ctfPlanVoteIn(L, t, you.idx, ...)`); `fx.plans` shows "Your plan".
8. `ctfCupDone` after your match: crown on the spot after your final (the World Cup does this in `finishWatchedKnockout`);
   champion text for a Normal win; guard the champion screen's One's-chain Moon check with `TOURNEY.game !== 'ctf'` (it runs
   before the Flag Cup's own text today, so a Normal Flag Cup win could trigger it).
9. Your fixture: block R (today R mid-match calls `startMatch` and would replay a losing fixture from the start); S stays
   spectator-only.
10. Optional, by the owner's answers: forfeit from the pause menu, save and resume the cup.

Tests: one layer, the Flag Cup layer (`test/ctf-cup.test.js` with `ctf-strategist`, `ctf-spectate`, `ctf-tutorial`,
`tournament-sim`). One new test is worth it: a Normal cup seats you on your side, never sims your fixture, and leaves your plan
vote alone.

## The practice gate

- Normal Kick Off (both Kick Off buttons: setup screen and builder) runs the practice first if it is not done; once it is
  finished the cup starts by itself (`CTUT.after`). Watch mode never waits, as now.
- The gate sits at **Kick Off, never at the first fixture**: `ctutComplete` ends with `go('title')`, which ends any running
  cup (`TOURNEY.active = false`).
- Done and grandfathered players go straight in. Quitting the practice part-way returns to the title with nothing started;
  its step is saved, as now.

## Edge cases

- **Quitting mid-cup.** The hub's Quit (with its confirm) ends the cup, as now. Pause → Quit inside your match goes to the
  title and also ends the whole cup today (both cups). Proposed: in your fixture, pause offers "Forfeit this match" (a loss,
  back to the hub) next to "Quit the cup".
- **Saving progress.** Neither cup saves a run today: `TOURNEY` is memory only (only the setup is saved, `bfsi:ctfcup`). A played
  cup can run 30-60 minutes. Proposed: snapshot at the hub after every result (teams by member names, fixtures and bracket by
  team id, results, the strategist's memo) to a new key, and a "Resume Flag Cup" button on the setup screen. A match in progress
  is never saved: resuming starts that fixture again.
- **The Spectate toggle** (`bfsi:ctfspec`) must not turn your fixture into a watched one; the cup's own seating decides.
- **Roster changes** between setup and Kick Off (a fighter erased by One, or locked): `ctfCupMakeTeams` already drops a name not
  in the pool and draws a replacement; the same covers your seat-1 fighter, with a banner saying who you got.
- **Hidden prize fighters:** the pool rule is unchanged (`ctfCupPool`: unlocked, playable, not banned).
- **Online:** not offered. The Normal Flag Cup is a local cup with one player and touches no relay. No same-computer 2-player.
- **Rewards:** today a Flag Cup fixture earns nothing (`ctfEnd` skips progress for cup fixtures) and the cup win skips
  `awardWorldCup`. Kept that way until the owner says otherwise (question 4).
- **Scope:** the feature-freeze memory allows no new big features unless the owner's message says "pipis". This is a small
  extension of an existing cup, asked for by the owner, and most of it is reuse. Flagged so nobody is surprised.

## Questions for the owner

1. **Picking your side:** mark one team "Your team" in the Flag Cup builder (seat 1 is you, the rest picked or drawn), or go
   through the World Cup's fighter-select screens (you, then each teammate)? Recommended: the builder.
2. **Your team's strategist:** off for your side (you run the plan in the match; a saved plan is only where you start), or may
   it plan for your CPU teammates when you set nothing? Recommended: off.
3. **Quitting and saving:** should quitting your match mid-way count as a forfeit and take you back to the cup (instead of ending
   it), and should the cup save between matches with a Resume button? Recommended: yes to both.
4. **Rewards:** should a played fixture count as a match (progress, unlocks), and a won Normal Flag Cup count for anything (a
   title on the profile; never One's or Steve Cobs's cup chains)? Recommended: matches count, a Flag Cup title count, no chains.
5. **The other teams in Normal:** keep them fully buildable (fighters, plans, kits) as in the watch cup, or draw them at random
   like the World Cup? Recommended: buildable, with the existing "Everything random" button.
