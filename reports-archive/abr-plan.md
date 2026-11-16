# ABR plan: ART A, ART B and the RUSH lanes (scoping, 2026-11-09)

Read-only scoping. Nothing in the game was edited, nothing downloaded, no browser, the live relay untouched.
Evidence: `git log` of `g-rush-core` / `g-rush-a`, the branch ledger (`.worktrees/rush-a/docs/LEDGER.md` rows M1-M4), `docs/LEDGER.md`
on `ii-dlc` (jury 2 / 2B / 2C, FIX EM, FS POLISH 1, SHOW SPRITES 1 and 2, WEBSITE PAGES), `reports/algebralien-rush/*`, `reports/fs-sprite-survey.md`,
`reports/art-batch1`, `reports/art-journal`, `reports/art-spider`, `reports/event-art-list.md`, `scripts/gen-seo-pages.mjs`, and `index.html`
(`RUSH_OPEN`, `BOSS_ROSTER`).

Credit estimates are in % of a week. Pace rule applied: at most 2 jobs at once, finish before starting new ones, about 14% a day, weekly use under 95%.
A "job" below is one cheap single agent on the default model, in its own nested worktree, CRLF-safe Python edits, boot check, no tests, show the owner.

Two facts the brief had wrong, corrected from the repo:
- The live Boss Rush has TWELVE roster rows, not seven: Announcer, Puffball Speaker Box, Firey Speaker Box, The Bug Swarm, Purple Face, MePhone4,
  Evil Leafy, MePhone4S, Purple Dragon, Two, Springy, Four (`BOSS_ROSTER`, `index.html` line 26225). Cobs and One are separate story fights.
- The rush branches sit 344 commits behind `ii-dlc` (`git rev-list --count g-rush-a..ii-dlc` = 344). Both were cut from `a316e32` (2 Nov).

---

## 1. ART A: polish of EXISTING content (own branch, independent of balance, the owner's first priority)

### Done (all merged into `ii-dlc`)
| What | Evidence |
|---|---|
| Jury 2 fixes: 12 items (name tags lifted apart, clouds, FS vignette, hit spark ring, team ring, contact shadow, dark thumb tile, skins tab, move-list key column, sticky Back/Start, contrast, Boss Rush preloads the boss's renders on spawn) | LEDGER row "JURY 2 FIXES" 2026-11-04 (branch g-jury2) |
| Jury 2B: crowd faces off in Boss Rush / Teams / CTF / FS scenes; tags pushed inside the screen; Pillow's journal kept drawn | LEDGER "JURY 2B" (g-jury2b) |
| Jury 2C: Pencil FS camera, Steakhouse floor, Grand Plains respawn island art, locked cards, dark-skin halo, winner glow, team ring under-stroke + pip, Goiky waterline, store October line | LEDGER "JURY 2C" (g-jury2c) |
| FS POLISH 1 and FIX EM (Gelatin, Blueberry, Cake looks after the third jury) | LEDGER 2026-11-04 (g-fixem) |
| Show sprites batch 1: 5 Final Smash props from 8 approved downloads (Gelatin sign, Poppy pan, Tennis Ball trebuchet, Basketball net, Pin balloon) | LEDGER "SHOW SPRITES BATCH 1"; files `reports/art-batch1/` (8); branch g-art1 merged |
| Show sprites batch 2: 20 props wired to pictures the game already held; Pillow's Journal cameo; Puffball bop | LEDGER "SHOW SPRITES BATCH 2"; `reports/art-journal/BFB_Journal.png`; g-art2 merged |
| TV's spider picture | `reports/art-spider/Robotic_Spider.png` (wired earlier) |

### Remaining (sized)
| # | Task | Size | Needs |
|---|---|---|---|
| A1 | Wire the props batch 2 did NOT reach, from files the game already holds: Fries (fry.png), Soap (vacuum.png, cloth.png), Coiny's coin slaps (coin.png), Marshmallow's saw blade (sawblade.png), Match's Van lane (van.png, reuse unchecked), Poppy's copies/kernels. Same pattern as batch 2 (draw-only, old shape until load). ~6 props, ~150 lines | small | nothing |
| A2 | Boss Rush presentation audit: the 12 bosses' walk-ins, arenas, banner, HUD, preload timing, crowd (now off), interlude; fix the small safe items. Lead looks in the browser pane (RUSH_DEV off) | medium | lead's eyes, ~10 screenshots |
| A3 | Show-picture props batch 3 (DOWNLOADS, section 2): Teddy Bear TV, Coiny monitor, Money bag, Book quill, Ruler protractor, Profily cactus, Flower mirror, Trophy camera. Cut + wire + CREDITS rows + `scripts/fetch-sprites.mjs` picks | medium | owner's OK by file name |
| A4 | Jury-2 leftovers still open: hit-stop (changes timing: owner decision), Gelatin set clamp, name banners (skipped "as asked": confirm still skipped), Blueberry palanquin and Cake pan (no wiki object exists: keep drawn or redesign) | small | 2 owner answers |
| A5 | Title screen, select screen, stages, hit effects: one look pass by the lead in the browser pane (a jury-3-shaped list, fix the small safe ones; nothing changes damage/knockback/timing) | medium | lead's eyes |
| A6 | S4 art-consistency pass (`reports/moves/anim-consistency-download-list.md`, 9 files, 3.3 MB; the owner said "Yes, download them" on 2026-10-21, a run wf_63b215c0 started): NO ledger row says it landed. Verify branches `g-art-s4` / `g-art-s4b`; if not landed, re-confirm the OK (it is three weeks old) before any fetch | small check, medium build | verify, then OK |

---

## 2. Decisions and DOWNLOAD OKs (nothing downloaded; sizes are the wiki's imageinfo bytes)

### Downloads that need the owner's OK, by file (ART A, batch 3; all BFDI wiki, static.wikia.nocookie.net, fetch with `format=original`)
| # | For | File | Pixels | Bytes | Confidence |
|---|---|---|---|---|---|
| 1 | Teddy Bear / rage-room TV | File:Television's asset.png | 987x814 | 138,423 | high |
| 2 | Coiny / the monitor | File:Monitor (BFB 16).png | 2151x1236 | 484,361 | medium-high |
| 3 | Money / money bag | File:Money bag.png | 494x512 | 7,003 | high |
| 4 | Book / the quill | File:Quill pen in color asset.png | 414x1090 | 201,323 | high |
| 5 | Ruler / protractor | File:Protractor (BFB 23).png | 1173x1667 | 105,811 | medium-high |
| 6 | Profily / cactus | File:Cactus (BFB 27).png | 1022x1606 | 29,023 | high |
| 7 | Flower / hand mirror | File:Mirror(tpot20).png | 1098x879 | 223,500 | medium (wall frame, not a hand mirror) |
| 8 | Trophy / camera | File:Camera-side.png | 1411x1101 | 125,816 | medium |
Total 8 files, 1,315,260 bytes (about 1.25 MB). Recommended default: OK 1-6 (6 files, 966 KB); skip 7-8 unless the owner wants them.
NOT recommended (survey batch 3, low confidence): File:Claw.PNG, File:Hammer (BFB 16).png, File:Opened Cardboard Box (BFB 21).png, II File:Purgatory Mansion Day.png.
Plus, conditionally, the 9 S4-consistency files (3.3 MB) if A6 finds they never landed: re-ask with the list.

RUSH needs NO new download: the 20 renders were approved ("Yes, all 20"), fetched and vetted on 2026-11-02 (`reports/algebralien-rush/art-vetted/`, 20 PNGs, 5.1 MB). Zero and 2,763 are drawn in code by design.

### Owner decisions, with a recommended default
| Item | Decision | Default |
|---|---|---|
| D1 | Hit-stop (jury 2 deferred): add a few frames of freeze on heavy hits? It is a feel/timing change, not art | No for ART A; park it for a balance pass |
| D2 | Blueberry's palanquin and Cake's pan have no wiki object file | keep the drawn shapes; polish them in A5 |
| D3 | Four's diary attack: one attack from "Who Stole Donut's Diary?" must be approved (`attack-picks.md`); options were written (`attack-options-four-donut.md`) | pick one in a question box before M5 |
| D4 | Rush target window: 22-23 Nov (go/no-go 18 Nov) or 29-30 Nov. 12 milestones + a 344-commit catch-up in 9 days collides with ART A first and the 95% cap | 29-30 Nov; flip RUSH_OPEN on the evening of 28 Nov; keep 22-23 only if the owner says "rush first" |
| D5 | The health-curve "save for one" exception (which boss) | the nine values in `owner-rules.md` stand; ask once, low priority |
| D6 | Rush push: the hidden code rides the next Update day or "ship now"; RUSH_OPEN stays false on main until the owner flips it | ride the update; flip on live by a one-line commit the owner approves |
| D7 | Batch 3 downloads: which of files 1-8 | 1-6 |

---

## 3. Dependencies and ORDER

```
ART A (A1, A2, A5 now; A3 after D7; A4 after D1/D2; A6 after a check) ──────────────┐
RUSH  R0 catch-up ─> M5 (D3) ─> lanes {M6-M7 Nine, M8 Six, M9-M10 Zero} ─> {M11-M12 X, M14 Three, M13 One, M15-M16 2,763} ─> M17 gate ─> push hidden ─> flip
Moon Caves v4 V4-V10 (CLOUD session owns it: never touch MCAVE/mc*) ────────────────┤
                                                                                     └─> ART B (after both)
```
- ART A can run now and is independent of balance and of the rush (different files touched: FS draw functions, UI, stages).
- R0 (bring `g-rush-core` + `g-rush-a` up to current `ii-dlc`) must come before any new rush milestone: M1-M3 put ~50 guarded hook lines in the shared engine
  (`beginMatchNow`, `buildFighters`, `setupWorld`, `checkWin`, `bossRushCheck`, `go`, `startMatch`, `bossPaced`, `damageSummon`, the banner call) and the 9 Nov
  BOSS FAIRNESS branch (g-bossfix) edited boss code in the same region. Every day adds conflicts.
- M5 waits on D3. M6-M16 wait only on M3 (already built); the two lanes may run as the two concurrent slots. M16 wants M10's foot (or its own).
- M17 (full run, secrets sweep, date checks, SEO guard) waits on all. ART B waits on M17 and on Moon Caves v4's last stage-art milestone.

---

## 4. BUILD PLAN (lean single-agent jobs, default model)

| Job | Scope | Acceptance checks | Credit |
|---|---|---|---|
| A1 Props from local files | wire Fries, Soap, Coiny, Marshmallow, Match's van, Poppy to pictures already in `assets/sprites/attacks`; draw-only | before/after headless fire of each FS on a mid foe: identical catch frame, damage steps, KO frame; boot clean; control bytes 0, bare LF 0 | 4% |
| R0 Rush catch-up | merge `ii-dlc` into `g-rush-core`, then into `g-rush-a`; resolve the hook lines; keep RUSH_OPEN false | boot with RUSH_DEV off: title/pages byte-identical to ii-dlc behaviour; RUSH_DEV on: card, page, strip, Two's fight start; the ordinary Two/Four Boss Rush fights unchanged | 5% |
| A2 Boss Rush look audit | lead's browser-pane pass over the 12 bosses; one agent fixes the small safe items | list with before/after pictures in `reports/`; no damage/knockback/timing change | 6% |
| R1 M5 Four rush | the owner's seven picks + the diary attack (D3); 1,200 HP; slither fix | `_pickForce` each move once per phase; run away 60 s and take hits; no path reaches the Four-falls branch | 5% |
| R2 M6+M7 Nine | row, arena `skatepark`, body from the vetted renders, 6 picks, acts, exposure | each move once per act; a dodged commit opens the window, damage x1.5; GRIND! drops out without a 360 px platform | 8% |
| R3 M8 Six | whole boss, bubble, 5 picks | bubble pops, daze, second bubble at 50%; ending plays | 6% |
| R4 M9+M10 Zero | 3-look bunker, ROLL CALL! fizzle, the Giant, THE FOOT!, `algDrawFoot`; drawn in code | 18-HP hit during the call cancels it; three phases; the Giant splits and marches off | 7% |
| R5 M11+M12 X | `x500`/`x500sun`, 6 picks + SQUIRT!, HIDE AND SEEK! | the shuffle ends found or timed out, radius restored, no stuck state; the sky swaps at 50% | 8% |
| R6 M14 Three + M13 One | Fourtress, VALUE SLIP, NEGATE!; One's `opts.hp/stocks/onEnd`, per-boss phase line at the four `ONE_PHASE_HP` sites | shatter beat, corner counter; One's ordinary fight unchanged, her chain untouched | 7% |
| R7 M15+M16 2,763 | the Void, drain (THE HUNGER), LIGHTS, FLOOD, island, CAGE, foot ending; drawn in code | aura silences specials, lights count up, first tide leaves an island, foot ending | 8% |
| R8 M17 gate | nine in order by `_pickForce`; secrets sweep (grep "2763", "2,763", "Algebralien", "One" in every title/strip/blurb/share/changelog string); add the rush names to `gen-seo-pages.mjs`'s memory-only list; old-profile load; 12 date checks; pacing by feel | sweep returns 0 public hits; gen-seo-pages exits 0 and writes no rush text; RUSH_OPEN false; the owner plays the run with RUSH_DEV | 5% |
| A3 Props batch 3 | after D7: fetch into `reports/art-batch3/` (untrusted staging), look, cut, wire, CREDITS | as A1, plus every file is a real PNG with alpha corners | 5% |
| A4+A5 Leftovers + look pass | hit-stop/banners per D1; Gelatin clamp; title/select/stages/hit-effects small fixes from the lead's pass | pictures before/after; nothing changes numbers | 6% |
| B1 ART B consistency pass | after Moon v4 V10 and R8: every new stage, the nine rush bodies at ~200 px, HUD pips, interlude/title cards, Moon Caves art, one contact sheet; fix mismatches of scale, outline, shadow | contact sheet in `reports/`; no number changes | 6% |
| B2 ART B fixes round 2 | what the owner marks on the sheet | same | 4% |

Totals: ART A 21%, RUSH 59%, ART B 10%: about 90% of one week, spread over 7-8 days at the pace rule (that is a whole week's budget, so other
queues pause or the rush slips to 29-30 Nov: see D4). Order at 2 slots: A1 + R0, then A2 + R1, then R2 + R3, R4 + R5, R6 + R7, A3 + R8, A4/A5, then B1, B2.

---

## 5. Risks
- RUSH_OPEN must stay `false` on every branch and on main; the owner flips it. R0 and every R job must assert the constant after the merge (`const RUSH_OPEN = false;`, line 67482 today).
- Hidden names: the three prize fighters, the secret boss's name and "2763"/"2,763" must not appear in public text (title, strips, blurbs, share text, CHANGELOG,
  What's-new notes, the SEO pages). `gen-seo-pages.mjs` filters ROSTER rows and checks the prize names, event names, the secret-boss word and a Vault code,
  but it does not yet know the rush: `boss-rush.html` and `whats-new.html` are built from text the rush could leak into. R8 adds "Algebralien", "2763",
  "2,763" and the new boss keys to its memory-only list until RUSH_OPEN is on.
- The 344-commit gap: the longer R0 waits, the worse the merge in the shared boss code (g-bossfix touched bosses on 9 Nov). R0 first.
- The lane memory says M5, M8, M14, M13 were in a running lane on 2 Nov; only M4 is committed. Treat anything uncommitted as lost; rebuild from the spec.
- Budget: the 95% weekly cap. Rush is ~59%; starting both the rush and ART A at full pace leaves nothing for OC, events or Moon Caves. D4 decides.
- Run length: a clean clear is ~36 min; the knob is `ALG_RUSH.dmgToBoss` (built at 1.0). R8's pacing pass may ask the owner to set it.
- Downloads are untrusted data: staging folders under `reports/` only, each batch in a fresh folder, Python with `-I`, never run from inside them.
- No Edge windows, no live relay, no network from builders (only the approved fetches, by the lead).
- Update cadence: the hidden rush code and ART A ride an update day (or "ship now"); every push is shown to the owner first.

---

## RECOMMENDED FIRST JOB (start now, no download): A1 "Props from local files"

Brief (8 lines):
1. Branch `g-art3` in a nested worktree off current `ii-dlc` (fetch origin, read `docs/LEDGER.md` first); `index.html` is CRLF: Python load/save only.
2. Draw-only: wire these Final Smash props to pictures already in `assets/sprites/attacks/`: Fries (fry.png), Soap (vacuum.png, cloth.png), Coiny's coin slaps (coin.png), Marshmallow's saw blade (sawblade.png), Match's Van lane (van.png), Poppy's copies (check her sprite keys).
3. Follow SHOW SPRITES BATCH 2's pattern exactly: same place, size and angle as the drawn shape; the drawn shape shows until the picture has loaded; `ATTACK_SPRITES` entries only.
4. Nothing else changes: no timing, damage, hitbox, catch window, launch.
5. Check: headless fire of each of the six on a mid foe before and after: identical catch frame, damage steps, KO frame, per-frame positions; a recording-canvas run with pictures "loaded" throws nothing.
6. Guards: syntax, boot clean, control bytes 0, bare LF 0, no new network, no download, no Edge.
7. Ledger row in the branch's `docs/LEDGER.md` naming the six props and what was NOT wired and why; a 6-line note for the owner in `reports/`.
8. Do not push; report the diff size and the branch; the lead shows the owner.
