# Readiness jury: casual party play ONLINE (friends in a lobby, 4-8 players)

Build read: artifacts/V1/index.html on ii-dlc (the Friday build). Read-only. No game edits, no push, no browser, no live relay contact, no node runs (static reading of code and reports only). Line numbers are from the file as read today and may drift.
Hidden content (unreleased fighters, hidden Teams maps, hidden Rush, Moon Caves, OCs) is out of scope.

HONESTY NOTE: every verdict is from reading code and existing reports. Nobody ran a real 8-person online night. All playtest-v2 personas are simulated and none played online. The only online measurements in the repo are offline (two game pages in one process, no socket): reports/online-lag.md.

## 1. Verdicts per format

| Format | Verdict | Why (evidence) |
|---|---|---|
| 2-4 player online FFA | ALMOST | Room code plus copy-link invite (renderRoomCard ~124380), host-only settings with live preview for guests, per-player fighter pick, a version-mismatch guard that blocks Start (versionCheck ~124060), guest prediction, a leaver's seat goes to a CPU (seatsLeft ~124090). Offline lag work cut bytes (online-lag.md: 4 players 93 to 67 KB/s). Missing: any real-network measurement, reconnect, and survival of the host leaving. |
| 8 player online FFA | NOT READY | Not offered. MAX_FFA = 5 (line 6381); countOptions for FFA is [2,3,4,5] (6386). The relay allows 8 peers (relay/src/index.js MAX_PEERS = 8). With 6-8 humans the lobby shows a single count button equal to the human count (renderLobbySettings ~124520) and buildFighters seats every human (~27530), so it probably starts, but this path was never named, designed or tested. GUESS: one-screen stages and the camera/HUD were not tuned for that many. The only 8-fighter data is CPU-only and offline (129 KB/s on Canyon Huge). |
| Online Teams | ALMOST | Lobby side blocks with Join/Stay/Full and AUTO tags (renderSides ~124290), CPUs fill sides, splits like 2v2v2v2 (teamSplitsFor 6409), up to 20 contestants, team colour plus shape marks (drawTeamMark). Screens exist (reports/online-side-pick-*.png). Gaps: Big Teams maps score 6/10 ("other stages still the generic cross", feature-scores.md); no real-people test; relay cap of 8 humans. |
| Online CTF | ALMOST | Best-tested mode: audit 0 errors, stalemate rule, radar ping, plan votes carried on the guest input path (~17235), 2-8 a side; CTF scores 9/10. But a practice gate forces host and joiner through a tutorial first (host() ~124228, join sets _ctutCheck), and "mines 8p timeout" and "Forest hide freeze" are still open (feature-scores.md). |
| Event modes online | NOT READY | Event matches refuse in a room ("startEventMatch refuses in a room", line ~98811; spleef is off online at ~99647; comments at ~99241 and ~99597 say event rooms are "build step 14", not built). Event contests are 6/10 even offline. Boss Rush is in the lobby mode list but is not a party format. |

## 2. Blockers and jank

BLOCKERS for a party night
1. No 8-player FFA (MAX_FFA=5 at 6381, 6386, 20116, 27517). A host with 6-8 friends in FFA gets an undocumented accidental path. Decide: officially support 8, or tell the host in the lobby.
2. The host is a single point of failure. If the host closes the tab or loses wifi every guest is dropped to the lobby: "The host left the match" (~124132), onclose to dropped() (~124017). No migration, no pause-and-wait.
3. No reconnect for a guest. A two-second wifi blip means out of the match for good (the seat goes to a CPU, which is good, but the person cannot take it back). Quit confirm even says "You cannot come back to it".
4. "Room full" is mislabelled. The relay answers 409 at the 9th peer (relay/src/index.js:29-30); the browser only sees a failed socket and onerror prints "Cannot reach the relay - check it is deployed" (~124020). The 9th friend will think the game is down. (The live relay's real cap was not checked.)
5. Event contests cannot be hosted online (above).

JANK
6. No Ready indicator and no countdown: host Start (startAsHost ~124539) fires with everyone as they are, including a friend still choosing. A joiner during a running match sits in the lobby until the Rematch (GUESS from reading the roster handler ~124135).
7. No chat, emotes or quick phrases in the lobby or match (the huddle phrases are CTF-only). Friends need voice elsewhere.
8. With more than 5 humans in FFA the lobby offers one count button; Stocks, Items and CPU Skill still show even though there may be no CPUs.
9. The version guard is strict and the game is "pushed several times a day" (comment ~123898): a room that spans a push is blocked and the host must create a new room and everyone re-joins.
10. CTF tutorial gate and the "Checking routes..." wait (focus-group item 7) slow set-up for casual groups.
11. Weak laptop host: the host runs the whole simulation and encodes snapshots (node numbers: step 1.5 ms and encode 0.26 ms at 8, online-lag.md; a real laptop was not measured). Old-laptop personas rate Feel 4.4/10 and 0 of 5 would recommend (game-rating.md). Nothing in the lobby tells a friend not to host.
12. High ping: the guest's own fighter is predicted and glides on correction (netPredict ~123821); hits are host-authoritative. I found no ping display.
13. Stalls: 24 of 965 simulated matches had no stock lost for 60 s (focus-group #3); the Friday deadly gorges "do not shorten stalls" (update-4-draft.md).
14. "Move did not come out" reports (focus-group #1) are probably mostly the test tool but unresolved; online adds input delay on top.

## 3. Top 10 improvements (impact divided by cost)

1. Say what FFA holds, and block or bless 6-8 humans. Change: in renderLobbySettings (~124520), when humans > MAX_FFA show "Free-for-all holds 5. Switch to Teams for 6 or more" and offer a one-click switch (or raise the cap for online only after a spawn/camera pass). Cost: tiny to medium. Verify: feed 6 fake hellos into the roster with an offline fake socket, read the lobby text, start and count fighters.
2. Fix the room-full message. Change: in connect() onerror (~124020), if the socket never opened say "Could not join: the room may be full (8 players) or the code is wrong" instead of "relay not deployed". Cost: tiny. Verify: a fake WebSocket that errors before open, read the status line.
3. Ready markers plus a Start warning: show a check beside each roster row once picked, and warn on Start ("2 players have not picked"). Cost: small (the pick already rides the hello). Verify: roster with one player lacking a pick; Start shows the warning.
4. Let a dropped guest take their seat back. The seat list (_seats) and stable id already exist ("a rejoin is the same id", ~124055). Change: client retries the socket with "Reconnecting..." instead of dropped(); host flips the seat ai to remote when that id reappears. Cost: medium. Verify: fake socket drops and reopens with the same id; snapshots resume and controller returns to remote.
5. Host-left message with a way forward: "Host left. Host a new room with the same players?" keeping the code, and keep the last score visible. (True host migration is large; mark as later.) Cost: small for the message. Verify: roster with no isHost mid-match shows the message and its button works.
6. Host advice in the lobby: "Use the fastest computer as host" and a small frame-time/ping readout for the host during a match. Cost: small. Verify: text shows for the host only.
7. Quick phrases/emotes in the lobby and match, reusing the huddle phrase UI (.planphrases). The relay forwards only hello/input/state/start, so the phrase must ride the hello name or an input field as OC and plan votes do. Cost: small to medium. Verify: two fake clients exchange a phrase.
8. Skip the CTF practice gate for joiners who have already done it, and let the host skip it when hosting. Cost: small. Verify: with the done flag set, host and join go straight to the lobby.
9. After a refresh for a build mismatch, auto-fill the last room code (lastJoin is already stored). Cost: small. Verify: set lastJoin, reload, the join box is filled.
10. A real 6-8 person online night (or 8 tabs against a local relay copy, never the live one) before calling it ready; log disconnects, ping, and which fighters were unreadable. Cost: owner time. Verify: a written log of that night.

## 4. One line per persona

- Host of an 8-player night: I cannot make an 8-person FFA and one wifi blip kicks everyone; Teams or CTF are my real options and they look fine.
- Friend who joins late on a weak laptop: I land in the lobby and wait for the Rematch, an older build blocks me, and if I drop I cannot get my seat back.
- Kid who wants chaos: items, Smash Balls and CPU fill-ins make 2-5 players chaotic enough; 5 is the FFA ceiling.
- Parent playing along: the code-and-link flow is simple and the pick grid is big; with no ready check I get thrown in while still choosing.
- Friday regulars: sides and rematch suit a recurring group; I want reconnect, chat and a room that survives an update.
- High ping: my own fighter feels predicted, but hits are the host's word and nothing tells us who should host.
- Hates menus: the lobby is one screen, but the CTF tutorial gate and route-check waits slow me down.
- BFDI fan: the roster is the draw and works; I cannot play the events together, which is what I would want.

## 5. What I could not check

- Anything over a real network: latency, jitter, wifi, the live relay's room cap and fan-out (forbidden to touch). The repo relay says 8; the deployed one was not compared.
- A real 6-8 human FFA start (code reading only; no node runs were done).
- Camera, HUD crowding, KO feed and name tags at 6-8 fighters (I did not inspect them; anything said about them is a guess).
- Pause behaviour for a guest, spectating after a KO, and the result screen for a large room.
- Host performance on a weak laptop with 8 humans.
- Uneven human counts per team beyond reading renderSides.
- Whether Boss Rush online is fun as a party format.
