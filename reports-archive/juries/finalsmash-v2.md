# Jury: Final Smashes v2 (branch g-fsv2, commit e5aac121)

VERDICT: FIX FIRST. Do not merge as it stands. Not a reject: the no-op, the leak check and the fake-socket check are mostly clean. The dodges are the problem.

Done in a scratch copy, up to 2 node at BelowNormal, timeouts on all, no live relay, no browser, no pictures, branch untouched.

## What I did NOT do (be honest)
- No pictures, no jank/camera/slow-mo/entrance/KO-banner runtime check (only read the diff and menu lines).
- No independent look-alike script run (read menu lines and the builder's table only).
- My multi-foe damage harness gave broken results (the old build showed 0 for moves that obviously hit), so I do NOT use it. Only an unreliable hint: on the new build, Rose hit two spread foes for 61 and 63 (about 123 total, against 72 for one foe in the old hold), Bot 24+24 on a cluster, Woody 30 on all three. Multi-foe strength is UNVERIFIED and Rose looks like the one to watch in 4-player games.

## (1) Dodges, my own independent check
Script: dodge2.mjs (scratch). The foe is a human-style player: key held from D = 0/8/16/24 frames after the intro freeze ends, run toward or away for 20/40/80 frames, plain hop or double jump at 12 timings, run+hop. 280 tries per move. Starts at -150 (behind the holder), 100, 200, 300 and 400 px in front. Falls, stock loss, KO and off-stage count as FAILURE. Escapes per start (100/200/300/400):
- Pickle 0/0/0/7
- Toothpaste 1/0/3/31 (400 is outside its reach)
- Fan 18/6/0/0
- David 12/3/2/1
- Book 10/5/1/24
- Rose 14/8/2/1
- Baseball 7/4/5/24
- Woody 5/4/6/10
- Box 8/11/17/24
- Bot 15/14/12/9
- Bonesaw 14/11/11/11
- Tapey 16/18/14/12

Baseline: the SAME script on untouched Final Smashes gives Sidewalky 0/0/0/24, Trophy 0/0/0/2, Cammy 8/0/0/0, Bracelety about 10 total. So "can't be dodged from normal range" is the existing standard of the game's catch (everyone inside the catch box is LOCKED about 22 frames after the freeze ends; a foe runs about 6 px/frame, so about 130 px). The new moves are not worse than that standard, but the owner's rule is "every one must be dodgeable", and these claims are wrong:

1. **Pickle, FAIL (the worst).** 0 of 840 tries at 100/200/300 px. The cause: the mark is fixed at row-time 0 and the catch box (440 x 260) lands at that same frame. So when the crosshair turns red, every foe in the box is already held. The tell "step out when it turns red" is false; the crosshair shows after you can no longer move. The 18-frame delay added after the burst changes nothing because the catch, not the burst, is what holds you. (The builder's 3 of 180 are the same 400 px edge cases.) The menu line, design file and the oldnew file all promise a step-out.
2. **Bonesaw, FAIL on tell honesty.** The dotted line stops following at the same frame as the column catch. Only run-through-the-holder works (11 of 280 at 200 px; every escape at 200-400 px is run-left, none running away). A player who sees the line stop is already held.
3. **Toothpaste, Woody, David, Book, Baseball, Rose, Fan** are thin at 200-300 px: 0 to 6 escapes of 280, and Woody only by double jump at frames 30-48 (a window of 18 frames). Fine for a skilled player who knows the move; thin for a new kid.
4. Bot, Box, Tapey, Bonesaw's run-through and Fan at 100 px are acceptable: 8 to 18 escapes of 280, and several are timing-based that a human can see.

## Exact fixes
- Pickle: fix the mark at least 24 frames BEFORE the catch frame, and make the catch only the circle (R 100 + radius) round the mark, not the 440 x 260 box; or hold nobody until the burst and let the burst alone hit within 100 px. Then re-run: a foe must be able to leave the red 100 px circle in the 18 frames after it locks (needs only about 110 px, which is 18 frames at 6 px/frame: tight, so make it 24).
- Bonesaw: same: the line must stop at least 24 frames before the catch/column check, and the catch must be the 80 px column only.
- Woody, Toothpaste: widen the safe gap. Toothpaste: make the coils at least 180 px apart or let the slow tip pass; Woody: lower the bolts so one plain hop clears them (single-hop window today is zero).
- Rose: check 3-4 foe games; consider 1 foe hit at most per pass.

## (2) Strength
Builder's own admissions stand: Rose 72 to 41 on one foe, Box 77 to 56/34, Baseball 36 to 24: weaker on a lone foe, but my partial multi-foe hint says Rose can hit several. Not measured properly by me. Nothing looks too weak outright: every move can do 24+ on a stationary foe.

## (3) Look-alikes
I only read menu lines and the builder's table. I agree with the builder's one real finding: Pickle is still "mark then blast" like Sidewalky, Trophy and Cammy (same catch, same mark frame, now with a sideways line). Given point 1, it is also the same dodge. Owner decision needed: accept, or redesign the mark itself.

## (4) Leaks
- Diff touches only the one inserted block (about 840 lines after the last row) and FS_BLURBS lines for the 12 names. Nothing else in the file changed; the LEDGER gets one line.
- No-op hash on the FINAL commit (file hash 33b976da7496 is exactly the commit's): old and new identical, 4 of 4 runs (104, 60, 60, 60 checkpoints). The builder's hash was taken before two edits; mine is on the final file.
- Old names still appear in unrelated places (kit descs, move-guide text at lines 2197, 2277, 2333, 20437+, code comments). They are other moves (specials) named the same, so I am not asking for changes. In the menu lines, Toothpaste keeps its name and Pickle keeps its name; the other ten renamed.
- The 12 old rows remain in the file (overwritten at @finalsmash:end) as dead code: a maintainability cost, not a bug.

## (5) Jank
Not run (see above). Builder's CPU runs reported no stuck hold, lock, slow-mo or camera leftover after one Final Smash per fighter; unverified by me.

## (6) Online
I ran the fake-socket host/guest check on the final commit (no network code in the script). 11 of 12 matched exactly: 0 wire diffs and 0 draw diffs. **Pickle: 48 of 188 drawn frames differed, up to 56 px, starting at frame 71** (host wire showed 0,0 where the guest showed null,null for the mark fields) when run in the all-12 pass; run alone, Pickle gave 0 diffs. So the Pickle guest picture can drift, depending on what ran before. The builder reported 0. Needs an explanation before merge (likely stale or unsent mark fields on the guest).

## Order of work
1. Pickle and Bonesaw: tell before the catch (above). 2. Find the Pickle guest draw drift. 3. Re-run the dodge, hash and sync checks. 4. Owner: look at the pictures, and say whether Pickle keeps "mark then blast".
Files: scratch checks in the session scratchpad (dodge2.mjs, d*.json, probe.mjs); this report is the only file written in the project.
