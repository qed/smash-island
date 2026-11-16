# Comeback mechanics: ours vs Smash Ultimate's rage / comeback style

Read-only study, 2026-11-04. No game file was edited; no balance change is applied. Every Smash number is from SmashWiki (ssbwiki.com, the same wiki as smashwiki.com) pages read today; the URLs are in section 5. ultimateframedata.com was not used for thresholds (it lists frame data, not damage gates: see `smash-vs-ours.md`). Our numbers are from `artifacts/V1/index.html` (line numbers are for the file as read today).

## 1. The table first

### 1a. Smash Ultimate

| Mechanic | Trigger | Effect | Duration / cost | What the player does with it |
|---|---|---|---|---|
| **Kazuya Rage** | Own damage 100% (25% of max HP in Stamina). Once per stock | All his attacks do 1.1x damage; grab, down special and the command input become the stronger Rage Drive (11.5 to 18% per hit part; the wiki lists 15/18 for the fall to bystanders); a charged forward smash kills at 22% instead of 26% | No timer. It ends when a landed Rage Drive spends it, or when he has taken about 37% more damage (formula: 110 per missed grab or down special plus 17.6 per damage taken reaches 650). Missing the Rage Drive costs part of it | Looks for the grab or command input; the opponent sees a charged-up Kazuya (a visible state) |
| **Joker Arsene (Rebellion Gauge)** | Gauge, not a percent: about 1.3 units per damage taken, 1.625x one stock behind, 1.95x two or more behind, so about 77% damage from empty in a 1v1 (wiki: "about 77%"). Also a slow passive fill (about 3 minutes), Rebel's Guard fills it about 6.7x faster, a KO resets it to 20 to 30 units | Summons Arsene: three-bullet gun, stronger Eiha (Eigaon), flight with intangibility, a 1.6x counter and reflector, boosted attacks, a meteor down air | 30 seconds (1,800 frames); each damage taken in a 1v1 removes 16 frames (15% costs 4 seconds). Gauge empties when he loses his last stock | A cinematic and a mask-off tell; the opponent can drain it by hitting |
| **Rage (global)** | Attacker's own damage, from 35% | Knockback multiplier 1.0x rising to 1.1x at 150% (about 1.057x at 100%). Not applied to set-knockback moves | Always on; no cost | Nothing: the visual is red flash and steam from 100%. Tiny by design (SSB4 was 1.15x) |
| **Terry Go! (Super Specials)** | Own damage 100% (30% of max HP in Stamina) | Power Geyser (about 15 to 26%) and Buster Wolf (5 + 20 + 15% hit grab), with armour in the start-up | Usable any number of times while above the threshold; both have large ending lag, punished on a miss or shield | A "GO" icon beside the portrait |
| **Sephiroth Winged Form** | Damage depends on the stock and score: about 90% at even standing, as low as 30% two stocks down, as late as 110% two stocks up | Third jump, 1.3x damage, much faster movement, armour on smashes (soaks up to 20%) | Timed; shortened by attacking and most by KOs; cannot return until he is KO'd | Wing model; armour smashes are readable and become predictable |
| **Cloud Limit Break** | Gauge: 100% taken or 150% dealt, plus a 5.6 s charge | Faster, single-use upgraded specials, some intangible in the start-up | 15 s if unspent; any Limit special empties it | A visible charged state; the player can choose to hold or spend |

### 1b. Ours (all read from `index.html`)

| Mechanic (fighters) | Trigger | Effect and numbers | Duration / cost | What the CPU or player does with it |
|---|---|---|---|---|
| **COMEBACK table** (line 65562): Naily, Firey Jr., Ruler, Gelatin, Fries (shots); Dora, Coiny, Yellow Face, Gaty, Toothpaste (range); Grassy (range plus armour) | **Stocks lost, not a percent.** A death is 1 point, a KO is 0.25, cap 5 (3 in Boss Rush except Fries). A death only counts while a stock remains (line 88277) | Shot kits +2 shots per point (so 3 to 7 Naily/Fries volleys at 2 deaths, 1 to 5 for Ruler, Firey Jr., Gelatin); range kits +14 px per point (Coiny slap 40 to 68 at 2 deaths, Yellow Face cone 66 to 94, Gaty reflect +28, Toothpaste glob and trap +28); every hit grants 1 frame less hit-grace per point (floored at 9 frames); Gelatin freeze +12 frames per point, then the 45-frame cap (so only +13 on a 40% foe, about 0 on a 100% foe); Grassy armour +10 frames per point | **None.** Permanent for the match, no cost, no window, never ends; it grows the more the fighter dies and also by a quarter per KO | Plain scaling. The CPU does not read it (grep: no AI code touches `comebackPoints`); the only visible tell is a small orange "rise" status icon with a count (line 103404), no flash, no cinematic |
| **Paintbrush rage** (`fury`, lines 87811 to 87812, 82774) | Damage taken fills a 0 to 100 meter (about 2.5 per damage); decays 0.05 per frame (3 a second) | Her hits do up to +50% damage (`fury/200`: +25% at 50, +50% at 100); from 50 the hits burn; at 100 the special is a Heat Explosion (18%, burn 120 frames, radius body + 120 px) that empties the meter | Decays by itself; a hit on her while she winds up a paint move cancels it; the explosion spends it | Three face states (rage-1 to 3) with growing shake, a flame icon at 50: the clearest tell in our game |
| **Pillow** (`fluff`, line 87805) | KOs scored | +3% damage per KO, permanent, no cap | None | Icon with count. It rewards the leader, not the one behind |
| **Pickle** (line 87814) | Own percent | Up to +10% damage; reaches the cap at only 26% own damage | None | Effectively always on after the first hits; no tell |
| **Nickel** (`snark`, line 87818) | Foe's percent | +1 to +60% damage (`pct/220`): +45% on a foe at 100%, the cap at 132% | None; the card says "stronger the more they have taken" | Every hit, always on, no tell; it favours the fighter already ahead |
| **Gelatin freeze gate / payoff** (lines 79394, 87802) | Foe over 40% (15% for anyone else) | Freeze 28 to 45 frames, hard cap 45; frozen foes take 1.6x damage and 1.5x launch from her | 45-frame cap, 12 frame re-freeze gap | A hit-confirm, not a comeback |
| **Cobs Keynote Rage** (boss only, 60% of his HP) | His own health | Wind-ups x0.8, gaps x0.85; he stops for a speech | The speech can be cut: damage during it shortens the rage; a fixed number of frames | A boss rule, with a long tell and counter-play |
| **Global rage** | none | No attacker-percent knockback bonus exists (grep found none) | | |

Not built, only proposed: Hot Dog's comeback armour (+10 frames of armour per stock lost, to 30) in `event-fighters-bfdie.md`, "only if he tests low".

## 2. Where the two differ: shape, not just size

1. **The gate.** Smash's gates are the attacker's damage (Kazuya 100%, Terry 100%, Rage from 35%) or a gauge fed by damage taken (Joker, Cloud). Ours is the number of stocks lost, with no percent at all. The percent gate has a feel Smash relies on: the buff arrives at a moment the player can see on the damage number. Ours arrives at the respawn after a death and cannot be seen coming.
2. **A window or a cost.** Every Smash mechanic has one: Kazuya's Rage is spent by one landed Rage Drive or drains with damage; Arsene lasts 30 seconds and drains per hit taken; Winged Form shortens with KOs; Terry's moves have large ending lag; Cloud's is single-use. Ours: Paintbrush decays and is spent by the explosion (like Smash), the COMEBACK kits do neither.
3. **A tell.** Smash shows the state on the character (steam, a cinematic, a mask, a GO icon). Ours: the COMEBACK kits show a small status icon with a number; Paintbrush shows three faces, a good tell.
4. **Size.** Smash's global Rage is tiny (+5.7% knockback at 100%). The character-specific ones are about 1.1x (Kazuya), 1.3x (Sephiroth), and the new moves. Ours: the COMEBACK kits give a different kind of power (more shots, more reach, less grace), which at 2 deaths is moderate; Paintbrush gives +50% damage at full meter, which is the biggest multiplier we have, and Nickel gives +45% on a 100% foe.
5. **Who it helps.** Smash's comebacks lean to the one behind (Sephiroth's gate drops with stocks behind, Joker's fill rises by stock deficit). Pillow's (per KO), Nickel's (foe's percent) and part of ours (a quarter point per KO) help the one already ahead.

## 3. What Smash's thresholds and costs teach

1. **Power spike at 100%, with a ledger.** Kazuya (100%) and Terry (100%) both turn on at one number a player can see, give a distinct new move rather than a bigger stat, and have an off-switch (Kazuya spends it on the Rage Drive; Terry's moves have heavy ending lag). Our COMEBACK buffs are the opposite: stat creep with no off-switch.
2. **The meter is escapable.** Joker's can be drained by hitting him (16 frames per damage), Sephiroth's shortens as he succeeds, Cloud's is unspent after 15 seconds. The opponent has a lever. Paintbrush has one (hit her while she charges a paint move); the COMEBACK kits give the opponent no lever except avoiding the kill.
3. **Rage is small on purpose.** Smash cut its rage from 1.15x to 1.1x. Ultimate's lesson is that a global percent bonus should not decide stocks; character kits carry the identity.
4. **Gate by standing, not just by percent.** Joker (1.625x and 1.95x behind) and Sephiroth (30 to 110%) scale their gate by stocks. Our stock-gated design is closer to that than to a pure percent gate, but ours has no upper bound at the other end (a leader is not slowed).
5. **A cinematic or a state is part of the cost.** Arsene's summon, Terry's GO icon, Sephiroth's wing all cost the player a visible announcement. Ours do not announce; the "no tell" rule from the owner is the one these break.

## 4. Where ours is stronger, weaker or more hidden

- **More hidden:** all 11 COMEBACK kits. The only tell is a small icon; no cinematic, no flash. Smash's equivalents show on the character.
- **Weaker:** the COMEBACK kits in a standard 3-stock match. The practical maximum is 2 points from deaths plus a quarter per KO, so +4 shots / +28 px / 2 frames of hit-grace; the kits that did best in the CPU runs (Toothpaste, Gelatin, Coiny, Fries all appear as repeat or single winners in `move-categories-report.md`) do not need a death to win, so the buff is mostly not what gives them wins. I could not separate how much came from the buff: the CPU run logs do not record comeback points.
- **Stronger than Smash's:** Paintbrush (+50% damage at full meter vs Kazuya 1.1x; the meter fills after about 40% damage taken, vs Joker's 77%), Nickel (+45% on a 100% foe vs Smash's Rage +5.7% knockback) and Pillow (+30% after 10 KOs) are all bigger multipliers than Smash's; Paintbrush is readable and decays, Nickel and Pillow do not decay and give no tell beyond a card line or an icon.

### Possible design problems (the owner decides; nothing applied)

Judged against the owner's rules (always-on, undodgeable, no tell):

1. **COMEBACK kits: always-on after the first death, permanent, no tell worth the name, no cost.** It is mild in size at 3 stocks (see above), so it is a rule problem more than a numbers problem. A change would target: show the state on the fighter (a glow like Paintbrush's faces) and/or give it a window (last stock only, or until the next KO). Smash's "once per stock, spent when used" is the pattern. The reach range kits (Coiny +28 px, Yellow Face +28 px) are the ones that most affect a fight's feel, since reach is not telegraphed.
2. **Nickel's damage scale is always on and tied to the victim's percent; no tell and no cost.** At 100% on the foe that is +45% damage per hit; the size is above any Smash gate. A change would target the cap (0.6) or the divisor (220); a Smash-like version would gate it behind a window.
3. **Pickle's +10% saturates at 26% own damage**, so it is a flat +10% for almost the whole match, not a comeback. A change would target the divisor (260) so it scales to a real threshold (about 100%), if the owner wants it to be one. Small, low priority.
4. **Paintbrush: the Heat Explosion in the `fury` branch applies immediately in that code (18% plus burn, radius body + 120 px).** I could not confirm from this read whether the caller adds a wind-up; if it does not, that is an undodgeable close-range burst that Smash's Arsene and Terry moves avoid by long start-up or ending lag. Worth one check by whoever next opens that move.
5. **Pillow's passive is uncapped** (+3% per KO). That is a snowball, not a comeback; at the usual 3-stock FFA it stays small. Mention only because it sits in the same code block.

Clover is not in the COMEBACK table, is not treated as weak here, and no kill move is suggested. Toothpaste is in the table (range kit). The owner's earlier doubt about her comeback mechanic: I could not find it in the memory file or the cups log (only the hit-grace line in the design-feedback note mentions the comeback table); her measured strength (14 of 15 wins in the roster run, per `world-cup-results.md`) comes mainly from her finisher and traps, not the buff.

## 5. Not verified

- **Joker 125%: not found.** SmashWiki's Rebellion Gauge page gives a damage-fill figure of about 1.3 units per damage (about 77% damage from empty in a 1v1), not 125%. The owner's number may be a different measure (for example a handicap or a Training Mode number); it was not confirmed on the wiki. **Kazuya 100% is verified.**
- ultimateframedata.com was not queried for thresholds (frame data only).
- How much the COMEBACK buff mattered in the CPU runs: not measured; comeback points are not logged.
- I did not read the Smash pages past the first 100,000 characters (Kazuya, Joker, Cloud, Sephiroth): the thresholds above came from the first part and from the separate Rebellion Gauge page; a later section could add detail.
- Not read: the Heat Explosion's caller for a wind-up; AI code beyond a grep.

## Sources (SmashWiki, read 2026-11-04; all paraphrased)

- Kazuya (SSBU): https://www.ssbwiki.com/Kazuya_(SSBU) (Attributes; Moveset, Rage, Down special, Forward smash)
- Joker (SSBU): https://www.ssbwiki.com/Joker_(SSBU) (Attributes; Moveset)
- Rebellion Gauge: https://www.ssbwiki.com/Rebellion_Gauge (Technical data: damage fill, Rebel's Guard fill, respawn fill, drain)
- Rage: https://www.ssbwiki.com/Rage (formula 35% to 150%, 1.0x to 1.1x)
- Terry (SSBU): https://www.ssbwiki.com/Terry_(SSBU) (Go! meter)
- Sephiroth (SSBU): https://www.ssbwiki.com/Sephiroth_(SSBU) (Winged Form)
- Cloud (SSBU): https://www.ssbwiki.com/Cloud_(SSBU) (Limit Break)
- Our files: `artifacts/V1/index.html` (COMEBACK at 65562, applyHit at 87802 to 87830, hit-grace 87603, freeze 87434 to 87460, VOLLEY_CAP 87574, death handling 88273, status icon 103404); `docs/LEDGER.md` (rows G23, F17); `reports/world-cup-results.md`, `reports/move-categories-report.md`, `reports/event-fighters-bfdie.md`, `reports/smash-vs-ours.md` (Addendum 2).
