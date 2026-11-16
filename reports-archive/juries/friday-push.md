# Friday push jury (2026-11-11)

## Juror 1, hidden-content leaks: NO way for a normal player to reach hidden content.
- LOW-MED: assets/sprites/CREDITS.md ships publicly and names the Rush bosses (file names, roles), plus the new boss/OC sprite PNGs; reachable only by guessing the URL; origin/main already had secret-boss sections there (same pattern). Option: hold those CREDITS paragraphs back until release.
- LOW: hidden code/strings ship in the bundle (view-source only); accepted baseline, nothing visible in the UI.
- Checked clean: Rush gate (RUSH_OPEN/rushOn/date logic, cosmetics), Moon Caves v4 gate (all stage lists), DI/YN Teams gates, OC gates, pages, sitemap, changelog HTML.

## Juror 2, regressions/crashes (PARTIAL sweep): no crash found in what it read.
- Checked clean: online beginMatch roster/moon/OC merge site, snapshot size changes, merge damage (no markers/control bytes), directional influence + SDI, frame budget/end lag, 45-frame lock cap, sky-drop replacement rows, reward/wallet merge.
- To verify: the new volley smash may lose its 2nd+ shots to the hit-grace window at point blank (Starfruit 5 lemons, Ice Cube 4 shards): text vs data; Starfruit lemon sprite may draw as a plain circle.
- NOT checked: swinging attacks, speed by weight, shield breakers, batches 1-5 beyond a few rows, FS wall rule, Bow ledges, CTF, Boss Rush, World Cup, menus, ledger claims. -> juror 2b sent.

## Juror 3, owner rules and honesty: NO cheating found; disclosures held up.
- Fixed in the draft: the 6-frame tell line overclaimed (up specials/throws unchanged); unverifiable per-fighter damage % removed; Cake buff and Rose counter loss noted.
- False alarm: Cloudy/Eraser/Spongy in the Update 3 contests line were already named on the live page (owner-authored commit a3458e32).
- For the owner: batches 1-2 meet the ~10% rule per kit, not per move (46 of 140 remade moves changed damage over 10%, 77 launch; the batch-2 launch cuts were deliberate nerfs). Bosses: PRIVATE! phases 2-3 and the Announcer phase 3 centre have no hitless line in the bot oracle (left as design calls); TLC/Consequences need a human test. Roboty's scramble lasts 55 frames (reversed controls, not a lock).
- Honesty notes: the item-sync check also skipped the blackout samples (disclosed loosely); Pin's mine was tuned to the similarity metric (disclosed); fake-clock claims real; panels match their claims.

## Moon Caves V10 jury (1 juror): MERGE. No leak with MC_V4_OPEN false; no regression (rec.moon only on v4; nanNote callers unaffected; file names unchanged elsewhere); no per-frame cost. Minor: MC4.resultId can go stale after a dev-mode v4 match (dev only).

## Juror 2b: CONFIRMED BUG + crash smoke clean
- BUG: the new volley smash (Starfruit 5, Ice Cube 4, Leafy 3, Roboty 3, Ruby 2, Match 3 shots) lands ONE shot at every range (shots travel together; hit-grace eats the rest), while its text says each shot is a hit. Damage equals one old drop, so the sky-drop "same damage" holds, but the text and the changelog wording ("12% each") mislead. Tagging all shots as hits would make Starfruit's smash 70% (no). Fix queued: honest text ("fans out N; one connects") + Starfruit's lemon sprite picked once per shot (it flickers mid-flight).
- Crash smoke: all 102 normal fighters in FFA, plus Teams, CTF, 3 Boss Rush bosses: 0 errors, 0 NaN.
- Still unchecked: swing hitboxes, speed by weight, shield breakers, batch spot-check, FS wall rule, Bow ledges, CTF stalemate rule firing, TLC/swarm, World Cup, menus.

## FSB TLC jury: MERGE WITH FIXES (sent back)
- Code does what it says (lit 26/24/22-frame pause, marks before the hop, no turning mid-chain).
- EVIDENCE WRONG: the dodge harness never counted falling off the stage as a hit; 22 of 24 "dodges" were falls. Honest figure 2/30. Builder re-running with a fall check + making it honestly dodgeable; mark-clearing bug to fix.
- CONSEQUENCE: earlier boss/Rush "dodge proven" results that used the same style of harness may also count falls as dodges. Queue: re-audit every logged dodge proof (Rush bosses incl. combos, Six, Four, normal Boss Rush) by replaying with a fall/KO = hit rule.

- Credits: Rush names moved to docs/CREDITS-hidden-rush.md (owner OK); restore when the Rush opens.

## Sky drops round 2 jury: MERGE WITH FIXES (sent back): no sky drop left in smashes/FS; walls OK; a guest online did not see Blocky's anvil (fixing); Paper's FS hit rate vs moving foes being measured (owner's call if it got weaker).
