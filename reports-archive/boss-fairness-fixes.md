# Boss fairness fixes (2026-11-09) -- branch g-bossfix (on ii-dlc 9a94769f; not pushed; no relay touched; ii-dlc has since moved on to the Moon Caves v4 merge, so expect a rebase before merging)

The owner: "some boss attacks are unfair, like swarm wave, you must, and phase 2+ sonic blast ... check all bosses". Rule kept: harder, same damage -- no hit, knockback or count was raised; every change is a timing or size constant in the boss's own table (plus two tells drawn in the bosses' own draw code). Input: `boss-dodge-audit.md` / `.csv` (pass 2 numbers; the CSV was refreshed from pass 2 today, Announcer cells 0-1 and 0-2 re-run as the audit's note asked).

How to read the numbers. "18f" = the survival bot that reacts to what it saw 18 frames ago (shots, the marked spot, the boss body, platforms -- NOT tell shapes: rows, rings, hills, lanes, pulls, tanks, pinches); 3 seeds x 4 spots = 12 trials (the two hidden bosses: 1 seed x 4 spots). "oracle" = the best of ~130 scripted lines from each of the 4 spots: x/4 spots with a 0-damage line; a KO is never a dodge, hazard damage counts, lines never run past 10%/90% of the width. Before = pass 2 of the audit (today, same rules); after = the same cells re-run on this branch. Where the bot is blind to the tell the proof is the geometry (column "note").

## The table

| Boss | Attack | Phase | Constant before -> after | 18f before -> after | Oracle before -> after | Note |
|---|---|---|---|---|---|---|
| The Bug Swarm | SWARM WAVE! | 2 | `SWARM.tide[2].gaps` 200,160,200,160 -> 240 x4 | 0.25 -> 0.33 | 4/4 -> 4/4 | 240 px at 6.8 px/f = 35 frames clear between crests (was 23-29): a landing and a second jump fit |
| The Bug Swarm | SWARM WAVE! | 3 | `tide[3].gaps` 200,175,200,175 -> 240 x4 | 0.42 -> 0.50 | 4/4 -> 4/4 | 32 frames clear at 7.4 px/f (was 24-27); the bot's remaining losses are the hive's plant (hazard) when it flees to the edge |
| Puffball Speaker Box | SONIC BLAST! | 2 | `PSB.soundwave2` 60 units = 48 frames (new; it shared phase 1's 44 = 35 frames) | 0.75 -> 0.92 | 4/4 -> 4/4 | phase 1 keeps 44, phase 3 keeps 72; rings, lanes, waves unchanged |
| Firey Speaker Box | YOU MUST! | 1 | `FSB.hookT[1]` 26 -> 40 frames (8.5 px/f over the same 340 span) + the hooks' row lit through the wind-up | 0.00 -> 0.00 | 4/4 -> 4/4 | still-bot first hit 58 -> 71. Every 18f loss is the PINCH (22, a full hit), never the hook (18.7): the bot leaves the spot by 64 px and stands inside the 78-px pinch, a tell shape it does not read. Geometry: hook seen 18 frames late + 8 frames to rise over it = 26 < 40 (margin 14; was 0); the pinch zone is lit from the lock, 20 + 40 frames before it closes |
| Firey Speaker Box | YOU MUST! | 2 | `hookT[2]` 22 -> 36 | 0.00 -> 0.00 | 4/4 -> 4/4 | first hit 51 -> 63; margin 10 frames (was -4) |
| Firey Speaker Box | YOU MUST! | 3 | `hookT[3]` 20 -> 32 | 0.25 -> 0.33 | 4/4 -> 4/4 | margin 6 frames (was -6); the high arm's row is lit on its side |
| Puffball Speaker Box | PRIVATE! | 1 | `PSB.priv.shutW` 0.2 -> 0.14 (205 -> 143 px a side) + the floor strip marked for the last 30 frames | 0.42 -> 0.83 | 3/4 -> 3/4 | the failing spot (floorR, 15% from the wall) still overlaps the 143-px zone by its body; a human reads the strip and steps 20 px in |
| Puffball Speaker Box | PRIVATE! | 2 | same | 0.00 -> 0.00 | 2/4 -> 2/4 | traced: the shutters no longer hit a runner; what hits from the sides is the SONG -- notes in pairs (a floor note and a platform-height note at once) over four seconds -- and the lake; the oracle finds hop rhythms from the middle and the platform only. Not changed: the pairs are the owner's Round 17 pick |
| Puffball Speaker Box | PRIVATE! | 3 | same | 0.08 -> 0.00 | 1/4 -> 2/4 | as phase 2, plus the 160-px lake under the floorL spot (hazard) |
| Purple Face | TORTURE TIME! | 1 | `PFACE.tank.close` 24 -> 40 frames | 0.00 -> 0.67 | 4/4 -> 4/4 | the real trap: the panes shut on whoever is still within 100 px of the marked tank; 24 frames left 6 after an 18-frame read; 40 leaves 22 (141 px of running) |
| Purple Face | TORTURE TIME! | 2 | second tank +-300 -> +-420 px; `close` 18 -> 40 | 0.00 -> 0.00 | 3/4 -> 4/4 | the middle spot had NO line (shut in at 18); now `runL`. 420 leaves an 80-px lane between the two 340-px bands. The bot is blind to the tank ring (not a shot) |
| Purple Face | TORTURE TIME! | 3 | same | 0.00 -> 0.00 | 3/4 -> 4/4 | as phase 2 |
| Announcer | CRUSHER ARM! (and every phase-3 move from the centre platform) | 3 | `ANN.crush.every[3]` 270 -> 360, `crush.tell` 54 -> 70 | 1.00 -> 1.00 | 3/4 -> 3/4 | the platform spot still fails every scripted line for all four moves: traced, the 22 is the CRUSHER pressing the platform inside the attack window (its clock runs free of the turn, so a scripted line that starts with the wind-up is under it). The reactive bot dodges it 12/12. Fixing the spot needs the press zone moved off the platform (engine) -- not done; the longer tell and rhythm are kept |
| Announcer | QUADRUPLE LASER! | 2 / 3 | `ANN.laser.cross2` 109 -> 130 | 0.00 -> 0.00 / 0.42 -> 0.42 | 4/4 -> 4/4 / 3/4 -> 3/4 | beams are not shots: the bot is blind; the second (diagonal) burst now comes 21 frames later than before (`calm` 30 after the first cross's row is 30 + 51 + 21 = 102; 130 leaves a 28-frame stand) |
| One (hidden) | MOON ROCKS! | tier 4 | top-tier `n` 10 -> 9 | 0/4 -> 0/4 | 3/4 -> 4/4 | one rock fewer over the ledge (the audit's one-liner) |
| One (hidden) | EYE LASERS! | tier 4 | top-tier `lock` 24 -> 36 | 0/4 -> 0/4 | 2/4 -> 3/4 | 12 frames more between the aim's lock and the burst |
| One (hidden) | OUT OF ORBIT! | tiers 1/3/4 | `ONE_TEL.orbitkick` 72 -> 84 -> TAKEN BACK (72) | 1/4, 0/4, 0/4 -> same | 3/4, 3/4, 2/4 -> 3/4, 1/4, 1/4 with 84 | the longer wind-up gave the scripted lines fewer clean windows (1 seed); reverted, no change ships |
| One (hidden) | KNIFE FLURRY! | tiers 3/4 | top-tier `every` 8 -> 12 -> TAKEN BACK (8) | 0/4 -> same | 3/4 -> 2/4 with 12 | same: reverted, no change ships |
| MePhone4 | FIST THINGY COMBO! | 1 / 3 | `MEPHONE_GLOVE.lock` 8 -> 24 (the row holds 24 frames before the glove flies; BOOMERANGS! reads the same lock) | 0.00 -> 0.00 / 0.00 -> 0.00 | 4/4 -> 4/4 | the lit row is a tell shape (blind bot). Geometry: 24 frames of a held row + ~25 frames of flight across the stage at 20 px/f - 18 of reading = 31 frames to leave a 44-px row |
| Evil Leafy | BLACK HOLE! | 2 | `EL.holeOpen` 26 -> 56 (the pull and the 0.8-hit core grow in over 56 frames: a whisper for the first 30) | 0.08 -> 0.08 | 4/4 -> 4/4 | the pull is not a shot (blind bot); the core's reach at frame 30 is now 0.54 of full (was full) |
| Evil Leafy | BEHIND THE TREES! | 2 | `EL.tel.elbehind` 50 -> 64 | 0.00 -> 0.00 | 4/4 -> 4/4 | the lit lane is a tell shape (blind bot); the rush now comes at ~71 frames (was 57): a double jump onto the platform (~40) fits after an 18-frame read |
| Evil Leafy | TENDRILS! | 2 | the gap three vines wide (was two: `elRow` gi..gi+2) | 0.33 -> 0.33 | 4/4 -> 4/4 | vines are not shots (blind bot); free ground 162 px (was 108) |
| The Bug Swarm | SEEKERS! | 2 / 3 | `SWARM.seek[2..3].turn` 0.06 / 0.075 -> 0.035 | 0.00 -> 0.08 / 0.08 -> 0.17 | 4/4 -> 4/4 | 4 / 5 homing stingers that out-turned a jump; still HARD |
| Two | MIND READ! / CLAP! / POWER UNGROUNDED! | 2 | `TWO.read.lock` 12 -> 20, `clap.lock` 10 -> 20, `power.lock` 8 -> 20 units (x1.5 pace = 30 frames held) | 0.00 -> 0.00 / 0.00 -> 0.00 / FAIR already (not re-run) | 4/4 -> 4/4 | MIND READ!'s copies home (0.053) after the lock, so a 30-frame hold alone does not free the bot; CLAP!'s hands are not shots (blind). Kept as the audit's one-liner; no measured gain |
| Four | I DO THIS! | 1 / 3 | `FOUR.idoLock` 26 -> 40 units (~50 frames: the whole wind-up in phases 2-3), `tel.fourido[3]` 34 -> 44 units | 0.25 -> 1.00 / 0.00 -> 1.00 | 4/4 -> 4/4 | from the lock a run clears the 160/180/200-px snap: 50 - 18 = 32 frames = 205 px; phase 3's wind-up (55 frames) leaves 37 |
| Four | TAKE THE TOWER! | 3 | `tel.fourtower` 44 -> 54 units (the hill under you throws at ~70 frames, was 57) | 0.00 -> 0.00 | 4/4 -> 4/4 | hills are tell shapes (blind bot); 70 - 18 = 52 frames to leave a 70-px hill |
| Four | GO BYE-BYE! | 3 | `tel.fourbye` 46 -> 62 units (+20 frames before the inhale) | 0.50 -> 0.50 | 4/4 -> 4/4 | kept (the audit's one-liner); no measured gain |
| Purple Dragon | LIGHTNING ROPES! (all five moves) | 2 | `DRAGON.tel` 44 -> 60 (one wind-up for all five; the anchors are lit for the whole of it) | 0.00 -> 0.00 (12f 0.00 -> 0.25) | 4/4 -> 4/4 | the bolt is not a shot (blind bot); the first strike came the frame the 44 tell ended, now at 60 |
| MePhone4S | QUICKSAND SHOVE! | 3 | `S4.tel.shove` 46 -> 58 | 0.08 -> 0.08 | 4/4 -> 4/4 | the charge's lane is a tell shape; kept, no measured gain |
| MePhone4S | POP UP! | 3 | `S4.pop.lock` 16 -> 28 | 0.08 -> 0.08 | 4/4 -> 4/4 | the audit proposed "lock 16 out" but 16 was already the value; 28 - 18 = 10 frames... the boil's 76 px + body needs ~15: still short for the bot; a human reads the boil through the whole 46-frame wind-up |
| MePhone4S | ONE OF EACH! | 3 | `S4.prize.lolliAt` 12 -> 20 | 0.08 -> 0.17 | 4/4 -> 4/4 | 20 frames between the chainsaw and the lollipop |
| Purple Face | THANK YOU FOR COMING! | 1 / 3 | `PFACE.thanks.pop` 20/18/16 -> 28 | 0.33 -> 0.33 / 0.00 -> 0.00 | 4/4 -> 4/4 | the pop's ring is a tell shape (blind bot); kept, no measured gain |
| Steve Cobs (hidden) | every raging turn (tier 3+) | 3 | `COBS_TEL_FLOOR` 36: a raging wind-up is never under 36 frames (0.8 x 34-44 was 27-35) | CHAINSAWS! 3/4 -> 2/4 (1 seed), MeKNIFE! 1/4 -> 3/4 | 4/4 -> 4/4 | CHAINSAWS! tel 29 -> 36, MeKNIFE! 27 -> 36 |
| Puffball Speaker Box | RAINBOW BARF! | 2 / 3 | second stream 12 frames behind the first -> TAKEN BACK | 0.08 -> 0.08 | 4/4 -> 4/4 | the streams are shots the bot sees, and nothing moved: reverted, no change ships |

Not re-run (same constant as a measured phase): YOU MUST!'s second pinch (`pinch2.T` 32, unchanged), FIST THINGY COMBO! phase 2, BOOMERANGS! (shares the glove lock), the Dragon's other four moves (+16 frames of wind-up each), MePhone4S phases 1-2, Two phase 1 and 3, Four phases 1-2 of TAKE THE TOWER! / GO BYE-BYE!, the crusher in phases 1-2 (tell 70 applies there too).

## Skipped (and why)
- THE TLC NEEDS TO BE FIXED! (+10 frames before the first ring): the first landing happens in `fsbTlcStart` itself (`fsbLand` on the wind-up's last frame); a delay needs a hop-in-place before it -- engine logic, not a constant.
- Springy's JUST WANTED A HAND! / TRY NOT TO FALL! phase 3 ("hit at 12 frames"): that 12 is the PHASE-3 ENTRY hole (`springyHole` under the nearest fighter the moment phase 3 begins, `bossEnterPhase`), which has no wind-up at all -- a telegraph for it is engine work; the holes a slam leaves are already marked by the slam.
- FURIOUS ROAR! (mark the dive 20 frames earlier), LOVE HEARTS! (aim at where you stood), STRAFING RUN! (same edge twice), MAZED AND CONFUSED! (drop the body beam = removing part of an attack), BOOMERANGS! (the return `back` is a speed in px/frame, not a frame count -- and its row lock did move with the glove's): logic changes, not constants.
- DON'T HUG THE CACTUS! ("1.3x run speed -> 0.9x"): the cacti walk at `cacSpd` 3.3 px/frame = 0.52 of a run (6.4); the audit's premise does not match the code, and cacti are not shots (blind bot). Nothing changed.
- WIND LOTTERY!, GRAB & CARRY!, BUDGET CUTS!, ACID TEARS! phase 2 (the puddle step is already one value in every phase), Two's BLOCK TOWERS! / MAYBE YOU'D LIKE THIS! / I LOVE RIDES! (no lock constant exists for the blocks, the sun or the cars): no constant to move.

## Checks
- No damage, knockback or count raised: the diff's only `dmg`/`kb` lines are unchanged values on lines whose timing constants moved; MOON ROCKS! top tier has one rock fewer (a cut, allowed).
- syncheck: scripts checked 2, failed 0. Boot check (this worktree): ffa bad positions 0, teams bad positions 0, errors none; guards: control bytes 0, bare LF 0, hidden names none; kit guard ok.
- Boss Rush start for every roster boss (idx 0-11 but Springy, untouched) and both hidden fights: 1200 frames with CPU fighters, no errors, no bad positions, every boss took damage and was busy with turns.
- 3 CPU free-for-alls of 3000 frames: no errors, no bad positions.
- The swept/MDI/frame-budget/run-speed code is untouched (the diff is boss tables, two tell draws, one tellen line, one tank-row constant).

## Side effects and known gaps
- `DRAGON.tel` is one wind-up for all five Dragon moves: all are +16 frames. `MEPHONE_GLOVE.lock` also governs BOOMERANGS!' row lock (now 24). `ANN.crush.tell` 70 applies in every phase.
- Purple Face's tank draw guesses the phase from `close` (`close <= 18 ? 2 : 1`), so with 40 in every phase the pane animation is timed to the phase-1 wind-up (66) in phases 2-3: cosmetic only.
- The g-bossaudit branch also carried an older index.html and ledger (it predates today's ii-dlc work), so it was NOT merged: only its script was taken (pass-2 rules), pointed at this worktree.
- PRIVATE! phases 2-3 and the Announcer's phase-3 platform remain UNFAIR by the harness for the reasons above (the paired notes + lake; the crusher's free clock); both need design/engine decisions, not constants.
- One and Steve Cobs: 1 seed.
- The audit's wind-up numbers for Two/Four/Springy are in units (x1.5 / x1.25 pace); this table says which.
