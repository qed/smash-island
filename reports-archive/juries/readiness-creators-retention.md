# Readiness jury: creators, community, retention

Branch ii-dlc, file artifacts/V1/index.html (line numbers below are from that file as read 2026-11-12). Method: read code, the playtest-v2 reports, feature-scores.md, update-4-draft.md, whats-new.html and the static pages. No game was run, no browser, no relay, no scratch files needed. The playtest-v2 numbers come from SIMULATED people, not real ones, and I treat them as hints only.

## (1) Verdicts

| Goal | Verdict | Evidence in one breath |
|---|---|---|
| A good video | ALMOST | Strong raw material, thin on-ramp and some feel problems |
| A stream night | ALMOST (solo/vs-CPU), NOT READY (with chat) | Online is players-only by link; no audience mode found |
| A community event | ALMOST | Rooms, World Cup, CTF, weekly event fighter exist; no organiser tools, no community home |
| Week-2 retention | ALMOST | Roster opens in about 2 weeks of play; events, daily, quests then carry it |
| Month-2 retention | NOT READY | Little after the drip ends; shop paused; by design no streaks or hooks; no Support link live |

### A good video: ALMOST
For: 100+ BFDI/II fighters (title and static pages say 102; feature-scores says 111, probably counting hidden/event ones, a guess), 12 bosses, Boss Rush, World Cup of CPUs vs CPUs (the owner's own 50-result log shows it makes stories: PoTM, runner-up plays), Capture the Flag. Every match auto-records with sound and the result screen offers a "Video" download (webm, line 23331) and a "Save GIF" (line 23490); a KO instant replay loops on the result screen (lines 103281-103285); a share line exists (line 23380). The Update 4 notes are rich (new moves for ~46 fighters, balance lists, deadly gorges) and give a YouTuber a "what changed" video.
Against: the playtest-v2 simulated panel scored Feel 5.7, Clarity 6.0, overall 6.2 of 10 (game-rating.md); "my move did not come out" was the top real-looking complaint (207 events, cause unknown) and matches that stall for a minute (24 of 965). A video's first minute is exactly where a first-time viewer sees both. The first match is behind a ~1 minute How-to-Play path (summary.md #6, partly estimated). The webm download is not a format Discord or some editors like (code comment near line 23520 admits it does not autoplay inline).

### A stream night: ALMOST solo, NOT READY with chat
For: World Cup and CTF "Spectate" let a streamer watch CPUs play a whole match (line 9041, ctfSpectate), good for downtime. Music is Pixabay-licensed (title footer) with a custom-music option, so DMCA risk looks low (guess, not a legal opinion). Invite link `#room=CODE` (lines 124532, 124733) makes joining one click.
Against: multiplayer is online-only and every participant is a player on their own computer; I found no audience or spectator role for online rooms (only the CTF CPU spectator toggle). I did not verify the room size cap (could not find it by grep). There is no chat-vote or "streamer mode" (hiding the room code, no popups). Two hot keys per button are fine, but WASD players get no key hint until Update 4's one-time line.

### A community event: ALMOST
For: deterministic weekly event rotation from the date (EVENT_LAPS line 98490, eventOfWeek 98508), so everyone on one build sees the same week; World Cup 16/32/48 and a CTF tournament; Daily with a brag-card share (line 23461). Static pages for online play.
Against: no Discord, community or creator link anywhere in the game or about/faq (grep: 0 in about/faq, only a code comment in index). No human-vs-human bracket, no results or ranking page, no scoreboard (0 "leaderboard" hits). EVENT_LAPS says a newly built kit RE-DEALS every week's fighter (lines 98480-98485) so a mod cannot announce "event week 3 is X" safely across an update. EVENT_LAUNCH is set to 2026-06-22 with a comment that it was moved for testing (line 98497), which is fine if intended, but should be checked (see gaps).

### Week-2 retention: ALMOST
For: fighters unlock by matches played (dripCount, line 102065): 1 per match for 3, then every 2nd, then every 3rd; the 48 or so drip fighters finish around match 130 (my arithmetic, a guess at 8-15 hours). Trophies for deeds (World Cup win, Boss Rush, boss clears), a weekly event fighter with three matches, Daily, quests paying Win Tokens. Simulated "would keep playing": 45% yes, 55% maybe, none no (not real data).
Against: only 7 starters; the first unlocks happen fast, which is good, but after about a fortnight a regular is at the end of the drip. The weekly event is the main reason to return and its sparse fighters-built list means some weeks repeat (nine event kits built per update-4-draft; lap is 14).

### Month-2 retention: NOT READY
The owner's rule (code comment ~line 127445): "I dont want to hook ppl" means no streaks, login bonuses or countdowns; I respect it and do not propose any. But that leaves month-2 resting on: events (rotating), balance/update drops every second Sunday, Rush on 22 Nov (hidden, out of scope), and cosmetics from tokens, while the shop is paused (feature-scores: "the shop is paused"). With no leaderboard, no replay sharing page, no community, a player with all fighters has few reasons to open it. The simulated panel's weakest segment was teens (27% keep playing) and kids (33%).

## (2) Gaps with file:line

1. Support link is OFF: `const SUPPORT_URL = "";` index.html:127460. The row stays hidden (applySupportLink, 127463). `const THANKS = [];` is also empty (about line 127494), so the Settings Thanks section is hidden. Both are owner decisions (needs a page and consenting adult names). Same empty value on origin/main (line 114586 there). The "tip jar after the 2026-09-29 review" is therefore not live.
2. The CHANGELOG array tops out at Update 3 (index.html:19512) and whats-new.html says "Latest: Update 3, 8 November 2026" (its JSON-LD). Update 4 is pasted only in reports/update-4-draft.md, so a Friday video would find stale notes unless the push-day step is done. The Update 4 draft also says "Secrets have been added..."; keep as is.
3. Static pages say 102 fighters (about.html:180, faq.html:76) and the title footer is computed (index.html:133730). Check they agree on the push day.
4. No community / contact link in game or static pages; Discord appears only as a code comment (index.html:7, 23520). A YouTuber or mod has nowhere to send viewers or report issues.
5. No creator-use statement (can I monetise a video of this fan game?). faq.html:72 and about.html:178 only say "unofficial fan game" (not legal advice: whether to add one is the owner's call).
6. No audience mode for online rooms (spectate exists only for CTF CPUs, index.html:9041). Room size cap: not verified.
7. Replay download is webm only (index.html:23331); GIF is capped by the clip size (23490). The comment near 23520 states an mp4 or inline-playing form is not made.
8. Event rotation re-deals on kit landing (index.html:98480-98485) and EVENT_LAUNCH is a test-moved date (98497): confirm the week shown on Friday matches what the owner wants to announce.
9. Feel and clarity (playtest-v2 summary.md items 1-3): "move did not come out" cause unknown; stalled matches; Esc fix and key hint are in Update 4 but the panel ran before them (draft v4 says so; I did not re-run).
10. Slow first match: How to Play card path takes a median ~63 s in the sim (summary.md #6; the seconds are the model's estimate).
11. No per-fighter or per-stage shareable page for the "100 fighters" long tail beyond the 103 `fighters/` pages and 17 `stages/` pages; fine for SEO, but no "tier list" or "move list" hub for lore/completionist fans (guess at usefulness).
12. Retention surfaces that exist but are quiet: Locker (quests, store, wardrobe) is a text link, by the owner's design.

## (3) Top 10 improvements, ranked by impact / cost

1. Publish Update 4 notes the same moment as the push. Change: paste the draft block into whats-new.html and the CHANGELOG array (19512), bump the "Latest" text and dateModified, update sitemap lastmod. Verify: node reads CHANGELOG[0].version === 'Update 4'; whats-new.html h2 matches; the draft's list-item count equals the page's. Cost: tiny (already scheduled).
2. Add a one-line "Community" link row (Discord server or a public page) beside "Share the game", or a "Report / contact" link on about.html. Change: a text link row like the support one, hidden until a URL is set. Verify: row hidden when empty, visible and opens a new tab with rel=noopener when set. Cost: small; needs the owner to have a place.
3. Turn on the Support link only when the owner has a page (set SUPPORT_URL, 127460, to an https page). Verify: title footer shows one small link; nothing is unlocked. No paid packs. Cost: tiny; owner decision.
4. Add a "For creators" section to faq.html and about.html: how to record (the built-in Video/GIF), the music license (title footer), what is fine to show, and the share card. State only what the owner decides. Verify: page loads, links work, sitemap has it. Cost: small.
5. Name a stable event schedule: show "this week", "next week" and the date of the next change on one public page (the data exists in eventsComingUp, line 98516), and avoid re-dealing a week already announced (change EVENT_LAPS rule only for future weeks). Verify: node loads eventOfWeek for 6 weeks before and after adding a kit and the announced weeks do not change. Cost: medium; a rule change to an owner decision (O28), so ASK first.
6. Streamer niceties: an option to hide the room code and invite link on screen, and a spectator role for an online room (view only). Change: a "Hide code" toggle in the lobby (cheap) then spectator (larger). Verify: toggle hides the code in the lobby and invite text; spectator needs a real two-player test which I could not run. Cost: small for the toggle, large for spectator; spectator is a new big feature, so the feature freeze applies unless the owner's message says "pipis".
7. Make clip saving friendlier: add a "Copy clip link" or an MP4/mp4-friendly note, and a one-click "Save the KO replay as GIF" that appears on the result for KOs with big hits. Verify: download the GIF in a browser and open it in Discord (needs a person). Cost: medium. (UI polish, so allowed under the freeze if it is only a button; a new format is a guess.)
8. Find and fix "my move did not come out" (207 sim events; cause unknown). Change: one human check of the repro lines in playtest-v2, then fix or retire the detector. Verify: re-run only that scene; the rate drops from 0.21 per match, or the probe is shown to be wrong. Cost: medium, highest effect on video quality.
9. Skip-the-card entry for returning visitors: after the first run, "Take the Plunge" already goes to select (tutorialSeen); add a visible "Quick match" on first load too if the owner wants. Verify: from a clean profile count clicks to a running match (sim said 4 clicks, 63 s). Cost: small. Ask the owner (design choice).
10. Add a quiet "what to do next" panel on the result screen once all drip fighters are open: this week's event, today's Daily, one unfinished trophy. No streak or countdown, so within the owner's no-hooks rule. Verify: a profile with DRIP complete shows the panel and a fresh profile does not. Cost: small to medium.

## (4) One line per persona

- Small BFDI YouTuber: "The cast and Boss Rush are a video, and recording is built in, but I need Update 4 notes live and a line on whether I may monetise."
- Twitch streamer with chat: "Great solo and World Cup watching, but my chat can't watch a room, only join one; I'd want a hide-code toggle."
- Discord server mod: "I can run a weekly event night, but the event week can change under me, and I have no server link or bracket page."
- Completionist: "I'd finish the roster in about a fortnight and then want a checklist and stats; the shop being paused hurts."
- Lore fan: "Fighters and event fighters feel respectful; 111 versus 102 on the pages would nag me. I'd check each moveset write-up."
- Bored-after-a-week player: "Once the drip ends I'm down to the weekly event and Daily with no reason to chase tokens."
- Reviewer: "Content 7.8, feel 5.7: strong cast, floaty-or-unclear controls, nothing broken enough to stop a short review."
- Skeptic vs other free browser fighters: "No account, no ads and a real cast set it apart; the unfinished feel and no ranked or leaderboard stop it keeping me."

## (5) What I could not check

- Real humans: every "persona" here is my reading plus the sim's numbers; I did no playtest, no browser, no relay, no video export.
- Room size cap and whether the online lobby supports an audience: not found by grep, guess only.
- Whether the webm/GIF output works in Discord, YouTube editors or Safari.
- The unlock pace in hours (my arithmetic on dripCount, matches per hour guessed).
- Hidden content (out of scope), the Friday site state on origin/main, and the Vercel pages as deployed.
- I did not open all 128 static pages; I read about, faq, whats-new and online-play only.
- Legal questions (fan-game monetisation, music licence): not legal advice.
- No check was tuned; I changed no thresholds and edited no game files.
