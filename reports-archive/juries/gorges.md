# Jury: deadly gorges (branch g-gorges, fee65f57, vs ii-dlc)

Verdict: FIX FIRST. The code is clean and contained, but it kills fighters who could still recover, it switches off one fighter's once-a-stock save, and the branch's own probe says it does not fix stalled matches.

## What I ran (scratch copy, one node process at a time, BelowNormal, no relay, no sockets beyond the branch's offline fake pair)
- The branch's scripts/gorge-check.mjs: ALL OK (10 no-op configs identical with the gorge on and off, a KO below the line, no KO under a floor span, host and guest agree on the stock loss).
- My own recovery sim (rec.mjs, scratch only): 111 roster fighters, Yoyle Canyon FFA, a "human" input macro (hold toward the nearest wall, tap jump for the air jump and wall jump, up-special when the jumps are gone). Each case was run twice, gorge on versus gorge off (GORGE_KO set huge). I compare "KO'd now" with "landed safely before".
- Limits: artificial placements, one stage (Canyon), a simple macro (not an expert player), 200 frames. I did not run Sky Towers or Grand Plains, did not look at the art in a browser, and did not test CPU behaviour at gorge edges.

## (1) Unfair KOs: found
Fighter placed at depth D under the floor line in the gap, with the stated vertical speed and hitstun:
- Lip fall, depth 30, one air jump left, vy -4, hitstun 40 frames: 18 of 111 fighters landed safely with the gorge off but are KO'd with it on. All 18 had gone deeper than 300 px (344 to 410 px) before recovering.
- Depth 120, two jumps, vy +6, hitstun 20: 13 of 111 recovered before (they went 357 to 385 px deep, so they would have climbed out) and are KO'd now. Examples are the heavier or lower-jump bodies (a tree, a TV, a robot, a donut).
- Depth 120, one jump, vy -4, hitstun 40: 6 of 111.
- Where no hitstun is involved (depth 100 to 280, free to act), the change is almost invisible: 1 of 111 newly KO'd at 280. The unfairness comes from a hit at the lip. The 300 px line is crossed during the stun, before the fighter can press anything. A stun of 20 to 40 frames falls 150 to 400 px.
- Fighters with no air resources left (jumps 0 and up-special spent) die either way. That is the intended kill.
- The comment in the code says a double jump is "about 170 px". By the game's own constants (JUMP -12.5, GRAV 0.62) a plain jump rises about 126 px (less for low-jump fighters). The 300 px margin is reasoned from the wrong number.
- Marshmallow's gravity save (kit "wallmart", once a stock, halts and flings her back up between WH+60 and the bottom KO line, step() ~line 71358 and fsKoFlight ~line 29746) can never fire in a gorge. The gorge line is 300 px under the floor and her save zone starts about 440 px under it (WH+60), so she is KO'd first. In my runs the save fired with the gorge off (flung ~1000 px up) and never with it on. I did not show that the save would have led to a recovery, but a signature stock-saving passive is silently voided on three stages.
- Not tested: respawn platforms (they spawn at the top, not in gorges), moving floors (none of the three plain-floor stages has one), wall-jump chains by a real player.

## (2) Leaks
Read from the code: gorgesOn needs FLOOR_SEGS with 2+ spans, no BAR, no DIG, and isBigFFA (excludes Teams, CTF, custom levels, One's and Cobs's arenas, Race). FLOOR_SEGS only exists when edgesAllowed (FFA mode, not tutorial, not test mode, not big). The branch's 10 fake-clock configs back this up. Gaps in my coverage: boss fights and event modes other than Dig/Bar on these three stages. I believe other FFA event twists on Canyon would still get gorges, which seems consistent with "big FFA", but I did not run them. Fortress has no gap, so no gorges (the ledger says this).

## (3) Drawn line versus real depth
The red line is drawn at groundY + GORGE_KO in world coordinates, and the KO test uses the fighter's centre at the same y. The match is exact at any zoom. The body's feet are ~r below the centre, so a fighter visually "touches" the line a little before the KO. That is fine. I did not view the art, so I cannot judge clarity. From the code: a 0 to 0.96 black gradient over 300 px, a solid black fill below the line, a 3 px red band plus a pulsing red glow 60 px above it. It reads as "dark and dangerous", not as ground. Weak point: the red line only shows when the camera is low enough to see 300 px under the floor.

## (4) Jank
- It goes through the same eliminate() as a bottom fall, so one KO, one stock, same sound and effects. The test confirms exactly one stock lost. Respawn moves the fighter, so no double KO with koB.
- KO banner for the local player: "KO'd!" or "KO'd by <last attacker within 10 s>". It says nothing about the gorge. A new kid dropping into one gets no explanation and may think it is a bug. This is polish, not a blocker.
- CPU: the branch says CPU recovery is unchanged. The ledger says nearly all gorge entries are CPU self-falls (about 1 per match). So the gorge mostly kills clumsy CPUs, not the player's chosen victims. I did not test CPUs stuck at edges.

## (5) Sync
Branch check passes (host and guest both gorgesOn, guest sees the host's stock loss). gorgeKo depends only on FLOOR_SEGS and groundY, which both sides share. I did not test guest-side prediction separately.

## Does it achieve the owner's goal? Probably not
The branch's own ledger line: with the gorge on, median time to first KO did not improve (Canyon 4-FFA 51 s to 59 s, stalled minutes 7 to 5, both inside run-to-run noise). Few fighters ever enter a gorge. So the change is accepted for stalled matches but the data says it does not address them.

## Personas
- New kid: falls in, gets "KO'd!" with no clue. The dark gorge helps a little. Likely harmless, a bit confusing.
- Competitive player: mostly fine (if you are in the stun at the lip you were nearly dead anyway) but will notice the lip hits that used to be recoverable are now deaths, and that their heavy main loses the old recovery window. Will call it a nerf to recovery and to the save fighter.
- 8-player party host: more chaos on Canyon and Sky Towers, a few more cheap KOs. Fun, but it does not shorten the long stalls.

## Exact fixes
1. Either deepen the line so a stunned fighter at the lip gets a recoverable window, or make the gorge KO wait until the stun is over (for example do not KO while f.hitstun > 0 and the fighter is above, say, the old safe depth). My numbers say 300 px kills 13 to 18 of 111 fighters who would have recovered.
2. Make Marshmallow's save work in a gorge: either put the gorge line below her save trigger or trigger the save at the gorge line.
3. Correct the comment (a jump rises about 126 px, not 170) and re-derive GORGE_KO from the real jump numbers.
4. Optional: a short on-screen line or banner text for a gorge KO.
5. Before merging, answer whether this solves stalled matches. Their own probe says no. If the owner still wants it, state that it is a flavour change, not the stall fix.

Scratch files: smash-bal/reports/juries/_gscratch (copy of the branch's index.html and helpers, my rec.mjs and result JSONs). The branch worktree was not edited.
