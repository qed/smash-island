# Boss dodge audit, fall rule (2026-11-11)

Audit job, read-only on the repo. Code under test: a COPY of artifacts/V1/index.html from ii-dlc `b51680bb` (in the scratchpad `dodgeaudit/`); the Rush gate opened only in that copy (the harnesses' own transform of `localStorage.getItem('bfsi:rushdev') === '1'`, SHOP_CLOCK 2026-11-22). No game file was changed, nothing was tuned or re-searched, no relay, no browser, one node process at a time at BelowNormal. Hidden fighters other than the Rush bosses already named in the Rush reports are not named; the two hidden quest bosses' own oracle cells were NOT re-run.

**The rule used for every replay:** a plan is a dodge only if, from the start of the move to its end, the fighter takes NO boss hit (any applyHit with a boss attack id), loses NO health from any source (pct never rises, so lava ticks and aura chip count), loses no stock, is not dead, and is not below the floor line or outside the arena. Where a column says `strict` the last boss's hunger aura is counted too (section 5).

**Verdicts.** `holds` = the logged plan replays clean under that rule on the current code. `falls-only` = the claim only held because the fighter fell off the stage (a scripted line that runs off an edge takes 0 damage and respawns). `stale` = the logged plan no longer dodges on the current code (it takes a boss hit; no fall involved): the claim is no longer backed by a plan, which is NOT a proof that the move is unfair. `not replayable` = the move no longer exists, or the proof was a model with no plan.

## 1. Did each harness count a fall / KO / respawn / stock loss / hazard hit?

| Harness (scratchpad folder) | Used for | Counts a fall off the stage? | Deciding line |
|---|---|---|---|
| scripts/boss-dodge-audit.mjs (repo; the oracle: ~127 scripted lines x 4 spots) | every non-Rush boss claim in boss-dodge-audit.md and boss-fairness-fixes.md (swarm, sonic blast, you must, private, torture, announcer, TLC, consequences ...) | NO. A KO is seen only if `dead` is still true after the step; with spare stocks the fighter respawns inside the step. Pass condition: `r.dmg === 0 && r.hazDmg === 0 && !r.ko`. The oracle's own run-off-the-edge lines (runL, runR, away) count as 'dodged' when they fall. | `if(fighters[0].dead) ko = true;` (line 195) |
| bp3/h.mjs + bp3/search.mjs (TLC, CONSEQUENCES) | 'oracle finds a no-hit line in 4 of 4 spots' for TLC and CONSEQUENCES (Boss Fixes 2) and logs tlc-*, cons-* | NO (the juror's finding). Only KO. The fixed copy (fsb/h.mjs, juryfsb/b/h.mjs) adds the fall test. | bp3: `if(f.dead){ hits.push({ ..., d:-1, ko:1 }); break; }`; fixed: `if(e0 != null && f.y > 690){ hits.push({ e:i - e0, d:-2, fall:1 }); break; }` |
| rush-hard/h/dodge.mjs (Two, Four, Nine, X sequences and combos) | Rush combo proofs, Difficulty pass 2 | NO. `hits` is `__hits.filter(h.dealt>0 && h.atk<=cap)`. No pct, stock, dead or y test. The Rush arena is walled (below), so a fall is impossible without a boss hit anyway. | `if (st.hits > 0 && hitAt == null) { hitAt = e; ... break; }` |
| rush-2763/search.mjs (last boss, 87 pairs) | last-boss combo fairness (NG_NOCHAIN / NG_NOAFTER) | NO for falls (walled arena). Lava ticks ARE boss hits (applyHit with bossAtk, index.html line 120609). The hunger aura (`nbAura`) adds pct with NO attack id, so it is NOT counted. | `hits: __hits.filter(function(h){ return h.dealt > 0; }` ... `if (st.hits > 0 && hitAt == null)` |
| rush-fu/dodge3.mjs (Three: NEGATE! > HALLWAY LASER) | the combo later removed | NO. | `if (J("__hits.filter(function(h){ return h.ask > 0; }).length") > 0 && hitAt == null)` |
| rush-z2/dodgez.mjs and dodgef.mjs (Zero; Four screechy/zappies/soup) | Zero and Four dodge searches | YES in the last version: stock loss, dead, y and x out of range all fail the run. Earlier dz1/dz2 logs may predate the test (not checked). A hazard-only pct tick is not counted. | `var fail = (yy.stocks < 99 || yy.dead || yy.y > groundY() + 300 || yy.x < -50 || yy.x > WW + 50) ? 1 : 0;` and `if ((st[2] > 0 || st[5]) && hitAt == null)` |
| rush-three/fair3.mjs (Three single moves and combos, hold search) | DECIMALS, THE ARMORY, laser>seeds ... 'proved by plan search' | N/A by construction: x and y are OVERWRITTEN every frame from the plan, clamped 40..2360, so the fighter cannot fall, be knocked or die; only `h.ask > 0` is counted. | `f.x = ${x}; f.y = groundY() - f.r - ${feet}; f.vx = 0; f.vy = 0;` |
| rush-nine/fair9.mjs, rush-x/fairx.mjs, rush-four/ringfair.mjs + malfair.mjs, rush-zero/fair.mjs, rush-2763/fair.mjs | single-move fairness models | N/A: position-driven or analytical path models on a walled floor; they cannot fall. | - |

**Rush arenas are walled.** Probe on the copy: Tree held LEFT for 880 frames from x 1500 in Two's arena; x stopped at 24 and y stayed on the floor (681), 99 stocks, 0 pct. So in the Rush fights a dodge cannot be found by falling; the Rush replays below pass or fail on boss hits (and the aura) alone. The falls-only problem sits on the older Boss Rush stages (void edges): the repo oracle and the TLC / CONSEQUENCES harnesses.

## 2. Rush Two / Four / Nine / X: sequences and combos (rush-hard/h/dodge.mjs plans, 72 logged DODGE FOUND)

Claimed: dodge found at the two spots (x 1500 and 500), latest log per key. Replay: the logged plan (with its reactive-hop D) on the current code. A spot passes only if clean under the rule. (`seq` = lead then follower picked as the picker would; `combo` = chained.)

| Boss | mode | ph | lead > follower | claimed | harness counted falls? | replay @1500 | replay @500 | verdict |
|---|---|---|---|---|---|---|---|---|
| two | combo | 3 | twosun > twocrater | @1500 dodge found; @500 dodge found | no | clean | boss hit at f198 | stale at one spot |
| two | seq | 3 | two > twocrater | @1500 not found | no | no plan (claim was NOT FOUND) | - | claim was not-found |
| two | seq | 3 | two > twohail | @1500 dodge found | no | clean | - | holds |
| two | seq | 3 | two > twoblocks | @1500 dodge found | no | clean | - | holds |
| two | seq | 3 | two > twoclap | @1500 dodge found | no | clean | - | holds |
| two | seq | 3 | two > twopower | @1500 dodge found | no | boss hit at f10 | - | stale (boss hit, no fall) |
| two | seq | 3 | two > tworails | @1500 dodge found | no | clean | - | holds |
| two | combo | 3 | twoclap > twohail | @1500 dodge found; @500 dodge found | no | clean | clean | holds |
| two | combo | 3 | twohail > twoblocks | @1500 dodge found; @500 dodge found | no | clean | boss hit at f107 | stale at one spot |
| two | combo | 3 | twolava > twoclap | @1500 dodge found; @500 dodge found | no | clean | boss hit at f98 | stale at one spot |
| four | combo | 3 | screechy > zappies | @1500 dodge found; @500 dodge found | no | clean | clean | holds |
| four | combo | 3 | fourarms > foursoup | @1500 dodge found; @500 dodge found | no | clean | clean | holds |
| four | combo | 3 | fourmallets > fourtower | @1500 dodge found; @500 dodge found | no | clean | clean | holds |
| four | combo | 3 | foursoup > screechy | @1500 dodge found; @500 dodge found | no | boss hit at f123 | boss hit at f145 | stale (boss hit, no fall) |
| nine | combo | 3 | nine > nineyah | @1500 dodge found; @500 dodge found | no | clean | boss hit at f140 | stale at one spot |
| nine | combo | 3 | ninebike > ninecrew | @1500 dodge found; @500 dodge found | no | clean | boss hit at f135 | stale at one spot |
| nine | combo | 3 | ninecrew > nineboot | @1500 dodge found; @500 dodge found | no | clean | boss hit at f139 | stale at one spot |
| nine | combo | 3 | nineyah > nine | @1500 dodge found; @500 dodge found | no | clean | clean | holds |
| x | combo | 2 | xrain > xsnap | @1500 dodge found; @500 dodge found | no | boss hit at f236 | clean | stale at one spot |
| x | combo | 2 | xsnap > xdash | @1500 dodge found; @500 dodge found | no | clean | clean | holds |
| x | combo | 2 | xdive > xrain | @1500 dodge found; @500 dodge found | no | clean | boss hit at f6 | stale at one spot |
| x | combo | 2 | xdash > xdive | @1500 dodge found; @500 dodge found | no | boss hit at f179 | boss hit at f204 | stale (boss hit, no fall) |
| two | seq | 3 | twocrater > twoblocks | @1500 dodge found | no | boss hit at f206 | - | stale (boss hit, no fall) |
| two | seq | 3 | twocrater > twolava | @1500 dodge found | no | clean | - | holds |
| two | seq | 3 | twocrater > twosun | @1500 dodge found | no | boss hit at f111 | - | stale (boss hit, no fall) |
| two | seq | 3 | twocrater > twoclap | @1500 dodge found | no | boss hit at f149 | - | stale (boss hit, no fall) |
| two | seq | 3 | twohail > twolava | @1500 dodge found | no | clean | - | holds |
| two | seq | 3 | twohail > twoclap | @1500 dodge found | no | clean | - | holds |
| x | combo | 2 | xrain > xdash | @1500 b never; @500 b never | no | no plan (claim was B never) | no plan (claim was B never) | claim was not-found |
| x | combo | 2 | xrain > xdive | @1500 b never; @500 dodge found | no | no plan (claim was B never) | boss hit at f98 | stale (boss hit, no fall) |
| x | seq | 2 | xrain > xsnap | @1500 dodge found; @500 dodge found | no | boss hit at f236 | clean | stale at one spot |
| x | seq | 2 | xrain > xdash | @1500 dodge found; @500 dodge found | no | clean | clean | holds |
| x | seq | 2 | xrain > xburn | @1500 dodge found; @500 dodge found | no | clean | clean | holds |
| x | seq | 2 | xsquirt > xdive | @1500 dodge found; @500 dodge found | no | clean | clean | holds |
| two | seq | 3 | twohail > twosun | @1500 dodge found; @500 dodge found | no | boss hit at f271 | boss hit at f221 | stale (boss hit, no fall) |
| four | seq | 3 | screechy > zappies | @1500 dodge found | no | boss hit at f90 | - | stale (boss hit, no fall) |
| four | seq | 3 | screechy > fourarms | @1500 dodge found | no | clean | - | holds |
| four | seq | 3 | screechy > fourbye | @1500 dodge found; @500 dodge found | no | clean | clean | holds |
| four | seq | 3 | screechy > fourhearts | @1500 dodge found; @500 dodge found | no | clean | boss hit at f125 | stale at one spot |
| four | seq | 3 | fourmallets > screechy | @1500 dodge found | no | clean | - | holds |
| four | seq | 3 | fourmallets > foursoup | @1500 dodge found | no | clean | - | holds |
| four | seq | 3 | screechy > fourido | @1500 dodge found; @500 dodge found | no | clean | clean | holds |
| nine | seq | 3 | ninecrew > nine | @1500 dodge found; @500 dodge found | no | boss hit at f77 | clean | stale at one spot |
| nine | seq | 3 | ninecrew > nineyah | @1500 dodge found; @500 dodge found | no | clean | clean | holds |
| nine | seq | 3 | ninecrew > ninebike | @1500 dodge found; @500 dodge found | no | clean | clean | holds |
| x | seq | 2 | xsquirt > xsnap | @1500 dodge found; @500 dodge found | no | boss hit at f236 | clean | stale at one spot |

Plans: 72 replayed, 48 clean, 24 hit a boss (no falls or KOs: none are possible here). Of the 24 hits re-run on a fresh boot, 2 became clean (x|combo|2|xrain|xdive|500, four|seq|3|screechy|fourhearts|500). Pairs by verdict: {'stale at one spot': 12, 'claim was not-found': 2, 'holds': 23, 'stale (boss hit, no fall)': 9}.

Not replayable: the overlap-tail proofs (CRATER dust, HAIL chunks, LONG NOTE / MALLETS / CREW / RAIN / JET tails) and the single-move models (fair9, fairx, malfair, ringfair): no stored plans, or kinematic models. Two's CRATER second spring was proved by a bot, no plan log.

## 3. Rush Three: NEGATE! > HALLWAY LASER (rush-fu/dodge3.mjs; the combo the lead later removed)

Harness counts `h.ask > 0` only. Claimed: dodge found for Tree (tier 2 at 5 starts, tier 3 at 5 starts; ds.log, ds2.log) and Spongy tier 3 at 4 starts. All 14 logged plans replayed:

| plan id (fighter / move pair / tier / start) | replay | verdict |
|---|---|---|
| Tree|threeneg|threelaser|2|1580 | boss hit at f587 | stale (boss hit) |
| Tree|threeneg|threelaser|2|1000 | boss hit at f387 | stale (boss hit) |
| Tree|threeneg|threelaser|2|300 | boss hit at f546 | stale (boss hit) |
| Tree|threeneg|threelaser|2|2100 | boss hit at f661 | stale (boss hit) |
| Tree|threeneg|threelaser|2|60 | boss hit at f564 | stale (boss hit) |
| Tree|threeneg|threelaser|3|820 | boss hit at f253 | stale (boss hit) |
| Tree|threeneg|threelaser|3|1580 | boss hit at f520 | stale (boss hit) |
| Tree|threeneg|threelaser|3|1000 | boss hit at f528 | stale (boss hit) |
| Tree|threeneg|threelaser|3|300 | boss hit at f617 | stale (boss hit) |
| Tree|threeneg|threelaser|3|2100 | boss hit at f690 | stale (boss hit) |
| Spongy|threeneg|threelaser|3|820 | boss hit at f508 | stale (boss hit) |
| Spongy|threeneg|threelaser|3|1580 | boss hit at f563 | stale (boss hit) |
| Spongy|threeneg|threelaser|3|300 | boss hit at f629 | stale (boss hit) |
| Spongy|threeneg|threelaser|3|2100 | boss hit at f508 | stale (boss hit) |

0 of 14 hold. The combo is already removed (TH.combo), so nothing is exposed. The fair3 hold-search proofs (DECIMALS, THE ARMORY, laser>seeds, seeds>armory ...) are kinematic (position overwritten) and their plans are not engine plans: **not replayable here**; they cannot fall by construction.

## 4. Rush Zero and Four (rush-z2 dodgez.mjs / dodgef.mjs; logs dz1..dz3, out/*)

These harnesses DO count stock loss, dead and y (section 1). Latest log line per (fighter, move, tier or phase, lane/side, start, boss x) was replayed with the replay mode these files already have, plus the pct rule. Moves present in the logs but missing from the current build cannot be replayed.

| Boss | lead > partner | tier/phase | replayed plans clean (Tree + Spongy, all starts) | verdict |
|---|---|---|---|---|
| zero | zrfoot > - | T5 | 1/5 | stale at some starts |
| zero | zrfoot > - | T6 | 0/3 | stale (boss hit) |
| zero | zrdiv > - | T1 | 9/10 | stale at some starts |
| zero | zrdiv > - | T2 | 6/8 | stale at some starts |
| zero | zrdiv > - | T3 | 5/8 | stale at some starts |
| zero | zrdiv > - | T4 | 1/8 | stale at some starts |
| zero | zrdiv > - | T5 | 2/8 | stale at some starts |
| zero | zrdiv > - | T6 | 1/8 | stale at some starts |
| zero | zrfoot > zrget | T5 | 1/4 | stale at some starts |
| zero | zrfoot > zrget | T6 | 0/4 | stale (boss hit) |
| zero | zero > zrdiv | T5 | 0/4 | stale (boss hit) |
| zero | zero > zrdiv | T6 | 0/4 | stale (boss hit) |
| zero | zero > - | T1 | 2/2 | holds |
| zero | zero > - | T2 | 2/2 | holds |
| zero | zero > - | T3 | 2/2 | holds |
| zero | zero > - | T4 | 2/2 | holds |
| zero | zero > - | T5 | 0/2 | stale (boss hit) |
| zero | zero > - | T6 | 0/2 | stale (boss hit) |
| zero | zrtape > - | T1 | 1/2 | stale at some starts |
| zero | zrtape > - | T2 | 1/2 | stale at some starts |
| zero | zrtape > - | T3 | 0/2 | stale (boss hit) |
| zero | zrtape > - | T4 | 0/2 | stale (boss hit) |
| zero | zrtape > - | T5 | 0/2 | stale (boss hit) |
| zero | zrtape > - | T6 | 0/2 | stale (boss hit) |
| zero | zrget > - | T3 | 2/2 | holds |
| zero | zrget > - | T4 | 2/2 | holds |
| zero | zrget > - | T5 | 2/2 | holds |
| zero | zrget > - | T6 | 2/2 | holds |
| zero | zrfridge > - | T3 | 0/2 | stale (boss hit) |
| zero | zrfridge > - | T4 | 0/2 | stale (boss hit) |
| four | screechy > - | T3 | 2/7 | stale at some starts |
| four | screechy > - | T2 | 0/6 | stale (boss hit) |
| four | screechy > - | T1 | 0/8 | stale (boss hit) |
| four | zappies > - | T3 | 0/8 | stale (boss hit) |
| four | zappies > - | T2 | 2/8 | stale at some starts |
| four | zappies > - | T1 | 0/8 | stale (boss hit) |
| four | screechy > zappies | T3 | 0/7 | stale (boss hit) |
| four | foursoup > screechy | T3 | 0/5 | stale (boss hit) |
| zero | zrhoop > - | T1 | 0/6 (move not in the current build) | not replayable |
| zero | zrhoop > - | T2 | 0/6 (move not in the current build) | not replayable |
| zero | zrhoop > - | T3 | 0/6 (move not in the current build) | not replayable |
| zero | zrhoop > - | T4 | 0/6 (move not in the current build) | not replayable |
| zero | zrhoop > - | T5 | 0/5 (move not in the current build) | not replayable |
| zero | zrhoop > - | T6 | 0/6 (move not in the current build) | not replayable |
| zero | zrhoop > zrzin | T5 | 0/6 (move not in the current build) | not replayable |
| zero | zrhoop > zrzin | T6 | 0/2 (move not in the current build) | not replayable |
| zero | zrnought > - | T3 | 0/12 (move not in the current build) | not replayable |
| zero | zrnought > - | T4 | 0/12 (move not in the current build) | not replayable |
| zero | zrnought > - | T5 | 0/12 (move not in the current build) | not replayable |
| zero | zrnought > - | T6 | 0/12 (move not in the current build) | not replayable |
| zero | zrzin > - | T1 | 0/6 (move not in the current build) | not replayable |
| zero | zrzin > - | T2 | 0/6 (move not in the current build) | not replayable |
| zero | zrzin > - | T3 | 0/6 (move not in the current build) | not replayable |
| zero | zrzin > - | T4 | 0/6 (move not in the current build) | not replayable |
| zero | zrzin > - | T5 | 0/6 (move not in the current build) | not replayable |
| zero | zrzin > - | T6 | 0/6 (move not in the current build) | not replayable |

Totals: 48 of 167 replayable plans clean; 127 further logged plans are for moves that no longer exist in ii-dlc (zrhoop, zrnought, zrzin). The Zero search logs came from candidate builds (`zero-cand*.html`), and `seeds.sh` retried a search with up to 8 different search seeds until a dodge was found, so a 'found' line is the best of up to 8 searches. Every replay failure here is a boss hit: none was a fall or a hazard-only tick.

## 5. The last boss (rush-2763/search.mjs, 87 pairs, NG_NOCHAIN / NG_NOAFTER)

Harness counts boss hits only. Lava ticks are boss hits (they count). The HUNGER AURA (`nbAura`: 0.25 to 0.75 % per second inside 150 to 220 px of the boss, at most 4.4 % a turn) raises pct with no attack id and was never counted by the old harness. Two replay columns: `no boss hit` (the old rule, plus lava) and `strict` (also zero aura chip). No fall is possible (walled arena, lava is a hit).

| mode | ph | lead > follower | spots with a claimed plan | replay: no boss hit | replay: strict | verdict |
|---|---|---|---|---|---|---|
| chain | 2 | n2763 > ngslam | 4/4 found | 0/4 | 0/4 | stale (boss hit at every spot) |
| chain | 2 | ngcage > ngroot | 2/4 found | 1/2 | 0/2 | stale at some spots |
| chain | 2 | ngherc > n2763 | 3/4 found | 0/3 | 0/3 | stale (boss hit at every spot) |
| chain | 2 | ngpan > ngwind | 4/4 found | 1/4 | 0/4 | stale at some spots |
| chain | 2 | ngroot > ngslam | 4/4 found | 0/4 | 0/4 | stale (boss hit at every spot) |
| chain | 2 | ngslam > ngpan | 4/4 found | 0/4 | 0/4 | stale (boss hit at every spot) |
| chain | 2 | ngwind > ngslam | 2/4 found | 0/2 | 0/2 | stale (boss hit at every spot) |
| chain | 3 | n2763 > ngslam | 5/5 found | 3/5 | 1/5 | stale at some spots |
| chain | 3 | ngcage > ngroot | 3/5 found | 0/3 | 0/3 | stale (boss hit at every spot) |
| chain | 3 | ngherc > n2763 | 4/5 found | 1/4 | 0/4 | stale at some spots |
| chain | 3 | ngpan > ngwind | 4/5 found | 1/4 | 0/4 | stale at some spots |
| chain | 3 | ngroot > ngslam | 4/5 found | 3/4 | 1/4 | stale at some spots |
| chain | 3 | ngslam > ngpan | 5/5 found | 4/5 | 0/5 | stale at some spots |
| chain | 3 | ngwind > ngslam | 4/5 found | 4/4 | 0/4 | holds, aura chip only |
| overlap | 1 | n2763 > ngcage | 2/2 found | 2/2 | 1/2 | holds, aura chip only |
| overlap | 1 | n2763 > ngpan | 2/2 found | 2/2 | 0/2 | holds, aura chip only |
| overlap | 1 | n2763 > ngroot | 2/2 found | 1/2 | 1/2 | stale at some spots |
| overlap | 1 | n2763 > ngslam | 2/2 found | 1/2 | 0/2 | stale at some spots |
| overlap | 1 | n2763 > ngwind | 2/2 found | 2/2 | 1/2 | holds, aura chip only |
| overlap | 1 | ngcage > n2763 | 2/2 found | 1/2 | 1/2 | stale at some spots |
| overlap | 1 | ngcage > ngpan | 2/2 found | 1/2 | 0/2 | stale at some spots |
| overlap | 1 | ngcage > ngroot | 2/2 found | 0/2 | 0/2 | stale (boss hit at every spot) |
| overlap | 1 | ngcage > ngslam | 2/2 found | 1/2 | 1/2 | stale at some spots |
| overlap | 1 | ngcage > ngwind | 2/2 found | 2/2 | 2/2 | holds |
| overlap | 1 | ngslam > n2763 | 2/2 found | 2/2 | 2/2 | holds |
| overlap | 1 | ngslam > ngcage | 2/2 found | 2/2 | 1/2 | holds, aura chip only |
| overlap | 1 | ngslam > ngpan | 2/2 found | 2/2 | 0/2 | holds, aura chip only |
| overlap | 1 | ngslam > ngroot | 2/2 found | 0/2 | 0/2 | stale (boss hit at every spot) |
| overlap | 1 | ngslam > ngwind | 2/2 found | 2/2 | 2/2 | holds |
| overlap | 2 | n2763 > ngcage | 4/4 found | 4/4 | 0/4 | holds, aura chip only |
| overlap | 2 | n2763 > ngherc | 3/4 found | 0/3 | 0/3 | stale (boss hit at every spot) |
| overlap | 2 | n2763 > ngpan | 3/4 found | 0/3 | 0/3 | stale (boss hit at every spot) |
| overlap | 2 | n2763 > ngroot | 4/4 found | 2/4 | 1/4 | stale at some spots |
| overlap | 2 | n2763 > ngslam | 3/4 found | 0/3 | 0/3 | stale (boss hit at every spot) |
| overlap | 2 | n2763 > ngwind | 4/4 found | 3/4 | 1/4 | stale at some spots |
| overlap | 2 | ngcage > n2763 | 4/4 found | 2/4 | 0/4 | stale at some spots |
| overlap | 2 | ngcage > ngherc | 4/4 found | 3/4 | 0/4 | stale at some spots |
| overlap | 2 | ngcage > ngpan | 4/4 found | 3/4 | 0/4 | stale at some spots |
| overlap | 2 | ngcage > ngroot | 4/4 found | 3/4 | 1/4 | stale at some spots |
| overlap | 2 | ngcage > ngslam | 4/4 found | 4/4 | 0/4 | holds, aura chip only |
| overlap | 2 | ngcage > ngwind | 2/4 found | 0/2 | 0/2 | stale (boss hit at every spot) |
| overlap | 2 | ngslam > n2763 | 4/4 found | 3/4 | 0/4 | stale at some spots |
| overlap | 2 | ngslam > ngcage | 4/4 found | 2/4 | 0/4 | stale at some spots |
| overlap | 2 | ngslam > ngherc | 4/4 found | 2/4 | 0/4 | stale at some spots |
| overlap | 2 | ngslam > ngpan | 4/4 found | 3/4 | 0/4 | stale at some spots |
| overlap | 2 | ngslam > ngroot | 4/4 found | 3/4 | 0/4 | stale at some spots |
| overlap | 2 | ngslam > ngwind | 4/4 found | 3/4 | 0/4 | stale at some spots |
| overlap | 3 | n2763 > ngcage | 5/5 found | 3/5 | 1/5 | stale at some spots |
| overlap | 3 | n2763 > ngherc | 3/5 found | 0/3 | 0/3 | stale (boss hit at every spot) |
| overlap | 3 | n2763 > ngpan | 5/5 found | 3/5 | 1/5 | stale at some spots |
| overlap | 3 | n2763 > ngroot | 5/5 found | 2/5 | 1/5 | stale at some spots |
| overlap | 3 | n2763 > ngslam | 5/5 found | 4/5 | 2/5 | stale at some spots |
| overlap | 3 | n2763 > ngwind | 4/5 found | 4/4 | 1/4 | holds, aura chip only |
| overlap | 3 | ngcage > n2763 | 5/5 found | 2/5 | 0/5 | stale at some spots |
| overlap | 3 | ngcage > ngherc | 5/5 found | 3/5 | 0/5 | stale at some spots |
| overlap | 3 | ngcage > ngpan | 5/5 found | 3/5 | 0/5 | stale at some spots |
| overlap | 3 | ngcage > ngroot | 5/5 found | 0/5 | 0/5 | stale (boss hit at every spot) |
| overlap | 3 | ngcage > ngslam | 5/5 found | 3/5 | 0/5 | stale at some spots |
| overlap | 3 | ngcage > ngwind | 2/5 found | 0/2 | 0/2 | stale (boss hit at every spot) |
| overlap | 3 | ngslam > n2763 | 4/5 found | 3/4 | 0/4 | stale at some spots |
| overlap | 3 | ngslam > ngcage | 5/5 found | 2/5 | 0/5 | stale at some spots |
| overlap | 3 | ngslam > ngherc | 5/5 found | 2/5 | 0/5 | stale at some spots |
| overlap | 3 | ngslam > ngpan | 5/5 found | 4/5 | 0/5 | stale at some spots |
| overlap | 3 | ngslam > ngroot | 5/5 found | 2/5 | 1/5 | stale at some spots |
| overlap | 3 | ngslam > ngwind | 5/5 found | 4/5 | 0/5 | stale at some spots |
| solo | 1 | n2763 > n2763 | 2/2 found | 2/2 | 1/2 | holds, aura chip only |
| solo | 1 | ngcage > ngcage | 2/2 found | 2/2 | 2/2 | holds |
| solo | 1 | ngpan > ngpan | 2/2 found | 2/2 | 1/2 | holds, aura chip only |
| solo | 1 | ngroot > ngroot | 2/2 found | 1/2 | 0/2 | stale at some spots |
| solo | 1 | ngslam > ngslam | 2/2 found | 2/2 | 1/2 | holds, aura chip only |
| solo | 1 | ngwind > ngwind | 2/2 found | 1/2 | 1/2 | stale at some spots |
| solo | 2 | n2763 > n2763 | 4/4 found | 3/4 | 0/4 | stale at some spots |
| solo | 2 | ngcage > ngcage | 4/4 found | 4/4 | 0/4 | holds, aura chip only |
| solo | 2 | ngflood > ngflood | 4/4 found | 4/4 | 1/4 | holds, aura chip only |
| solo | 2 | ngherc > ngherc | 4/4 found | 4/4 | 0/4 | holds, aura chip only |
| solo | 2 | ngpan > ngpan | 4/4 found | 4/4 | 0/4 | holds, aura chip only |
| solo | 2 | ngroot > ngroot | 4/4 found | 1/4 | 0/4 | stale at some spots |
| solo | 2 | ngslam > ngslam | 4/4 found | 4/4 | 0/4 | holds, aura chip only |
| solo | 2 | ngwind > ngwind | 4/4 found | 3/4 | 3/4 | stale at some spots |
| solo | 3 | n2763 > n2763 | 5/5 found | 5/5 | 0/5 | holds, aura chip only |
| solo | 3 | ngcage > ngcage | 5/5 found | 2/5 | 0/5 | stale at some spots |
| solo | 3 | ngflood > ngflood | 5/5 found | 5/5 | 2/5 | holds, aura chip only |
| solo | 3 | ngherc > ngherc | 5/5 found | 4/5 | 1/5 | stale at some spots |
| solo | 3 | ngpan > ngpan | 5/5 found | 4/5 | 0/5 | stale at some spots |
| solo | 3 | ngroot > ngroot | 5/5 found | 4/5 | 2/5 | stale at some spots |
| solo | 3 | ngslam > ngslam | 5/5 found | 5/5 | 0/5 | holds, aura chip only |
| solo | 3 | ngwind > ngwind | 5/5 found | 4/5 | 3/5 | stale at some spots |

Plans: 316 replayed; 193 with no boss hit or lava tick; 42 also with zero aura chip; 123 take a boss hit on the current code. Pairs by verdict: {'stale (boss hit at every spot)': 15, 'stale at some spots': 48, 'holds, aura chip only': 20, 'holds': 4}.

Note on 'stale': the last boss was changed after the proofs (sprites, pace, island size, combos), so plans found on an older build can hit now. The pairs with a hit at every spot need a fresh search before the NG_NOCHAIN / NG_NOAFTER lists are trusted; none of this is a fall.

## 6. The repo oracle (non-Rush Boss Rush stages): the fall rule applied

Re-ran the same oracle (`oracleSpecs()`, 127 lines, the 4 start spots, seed 1000+spot, early exit on the first success) on a copy of boss-dodge-audit.mjs with one added test kept apart: `fell` = stocks below the trial's starting stocks, or y below groundY()+30. `old rule` = the published rule (dmg 0, haz 0, `!ko`). `fall rule` = old rule AND not fell. 'first old line fell' = at how many of the 4 spots the first line the old rule accepted was a fall.

| Boss | ph | attack key | old rule | fall rule | first old line fell (spots) | verdict |
|---|---|---|---|---|---|---|
| The Bug Swarm | 2 | swarm | 4/4 | 4/4 | 1 | holds |
| The Bug Swarm | 3 | swarm | 4/4 | 4/4 | 4 | holds |
| The Bug Swarm | 2 | swarmseek | 4/4 | 3/4 | 4 | falls-only at 1 of 4 spots |
| The Bug Swarm | 3 | swarmseek | 4/4 | 2/4 | 4 | falls-only at 2 of 4 spots |
| Puffball Speaker Box | 2 | soundwave | 4/4 | 4/4 | 1 | holds |
| Puffball Speaker Box | 1 | private | 3/4 | 3/4 | 0 | holds |
| Puffball Speaker Box | 2 | private | 2/4 | 2/4 | 0 | holds |
| Puffball Speaker Box | 3 | private | 2/4 | 2/4 | 0 | holds |
| Puffball Speaker Box | 1 | consequences | 4/4 | 4/4 | 0 | holds |
| Puffball Speaker Box | 2 | consequences | 4/4 | 3/4 | 1 | falls-only at 1 of 4 spots |
| Puffball Speaker Box | 3 | consequences | 4/4 | 4/4 | 0 | holds |
| Puffball Speaker Box | 2 | rainbowbarf | 4/4 | 4/4 | 0 | holds |
| Puffball Speaker Box | 3 | rainbowbarf | 4/4 | 4/4 | 2 | holds |
| Firey Speaker Box | 1 | youmust | 4/4 | 4/4 | 2 | holds |
| Firey Speaker Box | 2 | youmust | 4/4 | 4/4 | 1 | holds |
| Firey Speaker Box | 3 | youmust | 4/4 | 4/4 | 3 | holds |
| Firey Speaker Box | 1 | tlc | 4/4 | 4/4 | 4 | holds |
| Firey Speaker Box | 2 | tlc | 4/4 | 3/4 | 4 | falls-only at 1 of 4 spots |
| Firey Speaker Box | 3 | tlc | 4/4 | 3/4 | 3 | falls-only at 1 of 4 spots |
| Purple Face | 1 | pfaceTorture | 4/4 | 4/4 | 4 | holds |
| Purple Face | 2 | pfaceTorture | 4/4 | 0/4 | 4 | FALLS-ONLY |
| Purple Face | 3 | pfaceTorture | 4/4 | 0/4 | 4 | FALLS-ONLY |
| Purple Face | 1 | pfaceThanks | 4/4 | 4/4 | 3 | holds |
| Purple Face | 3 | pfaceThanks | 4/4 | 4/4 | 3 | holds |
| Announcer | 3 | announcer | 3/4 | 3/4 | 3 | holds |
| Announcer | 2 | annlaser | 4/4 | 0/4 | 4 | FALLS-ONLY |
| Announcer | 3 | annlaser | 3/4 | 3/4 | 3 | holds |
| MePhone4 | 1 | mephone | 4/4 | 4/4 | 3 | holds |
| MePhone4 | 3 | mephone | 4/4 | 4/4 | 3 | holds |
| MePhone4 | 1 | boomerang | 4/4 | 4/4 | 3 | holds |
| MePhone4 | 3 | boomerang | 4/4 | 4/4 | 4 | holds |
| Evil Leafy | 2 | elhole | 4/4 | 3/4 | 2 | falls-only at 1 of 4 spots |
| Evil Leafy | 2 | elbehind | 4/4 | 4/4 | 3 | holds |
| Evil Leafy | 2 | evilleafy | 4/4 | 4/4 | 3 | holds |
| MePhone4S | 3 | s4shove | 4/4 | 4/4 | 2 | holds |
| MePhone4S | 3 | s4popup | 4/4 | 4/4 | 2 | holds |
| MePhone4S | 3 | s4prizes | 4/4 | 2/4 | 2 | falls-only at 2 of 4 spots |
| Purple Dragon | 2 | dragonropes | 4/4 | 3/4 | 4 | falls-only at 1 of 4 spots |
| Two | 2 | twoclap | 4/4 | 4/4 | 2 | holds |
| Two | 2 | two | 4/4 | 4/4 | 4 | holds |
| Four | 1 | fourido | 4/4 | 4/4 | 3 | holds |
| Four | 3 | fourido | 4/4 | 4/4 | 4 | holds |
| Four | 3 | fourtower | 4/4 | 4/4 | 3 | holds |
| Four | 3 | fourbye | 4/4 | 4/4 | 2 | holds |

Cells re-run: 44. Verdicts: {'holds': 33, 'falls-only': 8, 'FALLS-ONLY': 3}. A `holds` cell may still have had a fall as its FIRST accepted line (column 6); the fall rule kept searching and found a non-falling line, so the dodge is real there.

Not re-run: the two hidden quest bosses' cells (own scene code), Springy and the roster bosses not named in the two ledger rows, and the survival-bot figures (h18/h12 use `ko` the same way, so their clean counts may include respawn after a fall; the CSV was not regenerated).

## 7. TLC and CONSEQUENCES human-plan searches (bp3/*.log, fsb/res-*.log; 105 logged DODGE FOUND)

Replayed with the juror's fixed harness (fall = y > 690, KO, any boss hit; the 2 locked blocks and the 3 shifts -3/0/3 as in search.mjs; the move must run to its end). A plan holds only if all three shifts are clean. Phase is P3 where the old log carries none (search.mjs default PH=3).

| log | move | ph | plans | holds | falls-only | stale (boss hit) | other |
|---|---|---|---|---|---|---|---|
| cons-before.log | consequences | 3 | 10 | 9 | 1 | 0 | 0 |
| cons-tree-before.log | consequences | 3 | 5 | 1 | 1 | 3 | 0 |
| cons-wide.log | consequences | 3 | 5 | 5 | 0 | 0 | 0 |
| res-after.log | tlc | 1 | 8 | 0 | 6 | 2 | 0 |
| res-after.log | tlc | 2 | 7 | 0 | 4 | 3 | 0 |
| res-after.log | tlc | 3 | 9 | 0 | 6 | 3 | 0 |
| res-after2.log | tlc | 1 | 4 | 1 | 0 | 3 | 0 |
| res-after2.log | tlc | 2 | 4 | 0 | 0 | 4 | 0 |
| res-after2.log | tlc | 3 | 6 | 0 | 0 | 6 | 0 |
| tlc-after-s.log | tlc | 3 | 4 | 0 | 4 | 0 | 0 |
| tlc-after-t.log | tlc | 3 | 5 | 0 | 5 | 0 | 0 |
| tlc-before.log | tlc | 3 | 9 | 0 | 9 | 0 | 0 |
| tlc-tree-before.log | tlc | 3 | 5 | 0 | 4 | 1 | 0 |
| tlc-wide.log | tlc | 3 | 4 | 1 | 3 | 0 | 0 |
| tlc-wide2.log | tlc | 3 | 3 | 0 | 1 | 2 | 0 |
| tlc-wide2t.log | tlc | 3 | 3 | 0 | 1 | 2 | 0 |
| tlc-wide3.log | tlc | 3 | 3 | 1 | 2 | 0 | 0 |
| tlc-wide3t.log | tlc | 3 | 4 | 0 | 3 | 1 | 0 |
| tlc-wide4.log | tlc | 3 | 3 | 1 | 2 | 0 | 0 |
| tlc-wide4t.log | tlc | 3 | 4 | 0 | 3 | 1 | 0 |

Totals: 105 plans: 19 hold, 55 falls-only, 31 stale (boss hit), 0 other. fsb/res-after.log (the juror's input) reproduces: its plans are falls-only or hit.

## 8. Falls-only list (needs a real fix or a chain removal; nothing changed in this job)

**Whole claims whose accepted dodges were ALL falls (fall rule: 0 of 4 spots):**
- Purple Face P2 pfaceTorture: old rule 4/4, fall rule 0/4.
- Purple Face P3 pfaceTorture: old rule 4/4, fall rule 0/4.
- Announcer P2 annlaser: old rule 4/4, fall rule 0/4.

**Claims that lose spots under the fall rule (some spots only dodged by falling):**
- The Bug Swarm P2 swarmseek: old 4/4, fall rule 3/4.
- The Bug Swarm P3 swarmseek: old 4/4, fall rule 2/4.
- Puffball Speaker Box P2 consequences: old 4/4, fall rule 3/4.
- Firey Speaker Box P2 tlc: old 4/4, fall rule 3/4.
- Firey Speaker Box P3 tlc: old 4/4, fall rule 3/4.
- Evil Leafy P2 elhole: old 4/4, fall rule 3/4.
- MePhone4S P3 s4prizes: old 4/4, fall rule 2/4.
- Purple Dragon P2 dragonropes: old 4/4, fall rule 3/4.

**THE TLC (Firey Speaker Box) and its human-plan logs:** 55 of the 105 TLC and CONSEQUENCES logged plans are falls-only (section 7); the repo oracle gives P2 3/4 and P3 3/4 (section 6). The Boss Fixes 2 line 'oracle finds a no-hit line in 4 of 4 spots in every phase' for the TLC does not survive the fall rule.

**Rush:** no falls-only proof exists (walled arenas). The Rush problem is different: stale plans (sections 2 to 5), and the aura, which the last-boss harness never counted.

## 9. Counts

- Harness rows reviewed: 8 (section 1). Count falls: 1 (Zero / Four dodgez, dodgef). Do not count falls: 5 (repo oracle, bp3 h.mjs, rush-hard dodge, rush-2763 search, rush-fu dodge3); the last three are only safe because the Rush arena is walled. Cannot fall by construction: kinematic or model families (fair3, fair9, fairx, ringfair, malfair, fair).
- Plans replayed: Rush hard 72 (48 clean), Three 14 (0 clean), Zero + Four 167 (48 clean; 127 more for removed moves), last boss 316 (193 no boss hit, 42 strict), TLC/CONSEQUENCES 105 (19 hold, 55 falls-only); oracle cells 44 ({'holds': 33, 'falls-only': 8, 'FALLS-ONLY': 3}).
- Limits: one fighter per run (Tree or Spongy for Rush and human plans; the roster's Pen for the oracle), one boot seed; a stale plan says only that the old plan no longer works; a `holds` replay proves a dodge exists for that fighter and start on today's code; the oracle early-exits at the first accepted line; the y > groundY()+30 / y > 690 floor tests are stage-dependent thresholds (the stock-loss test is not).
