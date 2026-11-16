# The Algebralien Rush: how it fits the game (event system, date rule, flow, Two / Four / One)

Lens: how the rush fits what the game already has. Read-only on the game; built on `ii-dlc` at `57a9578` (the worktree was merged into twice while I read it, so
line numbers move: everything below is cited by function and constant name). Evidence I ran: `scratchpad\alg-rush\fit\daterule.js` (plain node, three time zones).

I also read `owner-rules.md` in this folder, which was written after my brief, and applied it: START 4 STOCKS, +2 after each boss, MAX 6; the HEALTH CURVE
(Two 1,000, Four 1,200, Nine 1,400, Six 1,600, Zero 1,800, X 2,100, One 2,400, Three 2,700, 2763 3,000); the rush's STAGES ARE LARGER and Two and Four need a
RUSH VERSION ("you can just outrun them in their current state"). Where my first reading differed (the gauntlet's old "+1 stock every third boss", the 1.5x HP rule,
the single-screen arena) the owner's rule wins and I say so.

## 0. The eight things only the owner can decide (details in section 8)

1. Online co-op or offline only (multiplayer means online). One's fight is local-only today, so an online rush would have to skip her.
2. Does a player who has not beaten One meet her in the rush? (My recommendation: no, her slot is skipped until she is beaten.)
3. Run length. The curve is 17,200 HP of boss: 29 to 48 minutes of fighting at the speeds the game has measured, about 36 at the middle. Accept it, or add a
   damage-to-rush-bosses multiplier so the bars still read 1k to 3k.
4. A defeat: retry that boss (my recommendation) or the run ends.
5. How much larger the stages are, and confirm the Two / Four "buff" is reach, leash and new patterns, not damage ("Harder, same damage" stands).
6. Rewards: Win Tokens plus two reward-only looks, and the caps.
7. A release switch: build it OFF, owner flips it (the Moon Caves rule). The first live days are 22-23 November, 20 days away.
8. Items in the rush (on at the usual rate, or off as in One's story fight).

---

## 1. How a rush event fits beside the weekly lap

**It is a sibling, not a new row in the lap.** The weekly event is built around a fighter: `eventOfWeek(wk)` returns `{ name, ... }` from `EVENT_LAPS`,
`PROFILE.event.tok[name]` holds that fighter's tokens, `refreshEventCard` and `buildEventPage` both stop unless a ROSTER row with `event:true` exists, and the three
matches are `EVENT_MATCHES[name]`. A rush has no fighter, no tokens to 100, and no week (its windows are 1 to 3 days). Forcing it into the lap would break
`eventNames()`, `eventUnlocks`, `eventHint` and `eventsComingUp` (it would count as a week), and the save: `eventNorm` throws away any payout line that does
not match `EVENT_PAY_LINE` (`w<week>:<name>:f1-f3 | id`). So the lap, `PROFILE.event` and the fighter event page are not touched at all, and a live save keeps every token.

| | Reused as it is | New |
|---|---|---|
| Date | `shopNow()` and its `SHOP_CLOCK` test hook, `shopWeekNo` (names a window), UTC-only maths | `rushWindowOf`, `isRushLive`, `rushNext` (section 2) |
| Words | `eventEndsWords` (it only reads `ev.end`), `eventEl`, the `ev*` CSS (`evhead evtok evbar evcards evcard evsoon`) | the nine-slot strip, local-time "next live" line |
| Title | `.titlecards` (a flex row that wraps): a third card beside the Daily and the weekly event card | `refreshRushCard`, shown only on live days |
| Page | the `go(id)` pattern (`go('event')` builds its page), Esc/Back, `#event` markup | `#rush` screen and `buildRushPage` |
| Select screen | `EVENT_PICK`, `syncEventSelect`, the `evmode` class (hides every setting, shows the strip), `EVENT_LOAN` / `returnEventLoan` | `EVENT_PICK = { rush:true }` branch, strip text, no CPU-skill row |
| Result | `showEventNote` / `hideEventNote` and the "Event ▸" button, the `RACE.retry` trick of relabelling Rematch "Retry" | rush victory and defeat texts |
| Saving | `saveProfile`, `mergeProfiles`, `shopCatchUp`, the upward-only merge idea of `mergeEvent` / `mergeOne` | `PROFILE.rush` (records, seen, pay lines), one line in `freshProfile`, `mergeProfiles`, `shopCatchUp` |
| Bosses | `makeBossSummon(row, hp)`, `bossEndingBegin` (the exit scenes and their hold), `BOSS_ARENA`, the boss slots, `startOneFight(lineup, { onEnd })` | the conductor (section 3.8), the nine-row table, per-boss HP |
| Rewards | `walletEarn`, the Win Token wallet, `walletState().owned` (a price-0 entry is a gift, as `bonus_one` is) | `rushPay`, two reward-only looks |

**Not shared on purpose:** `awardBossCleared` (it would hand out the `boss:Four` trophy and write `bossesCleared`, `soloBosses`, `oneRushKill` and `cobsBossFell`),
`BOSSRUSH.loop` and the Four-falls branch of `bossRushCheck` (`wasFour`: the victory card, the loop and `oneRushHook`, which the rush must never trigger), and every
One-chain function (`oneAfterMatch`, `awardOneDefeated`, `oneFightEnded`). Rush bosses count for quests (`questAdd('boss', 1)`) the way event matches do, and for nothing else.

**The Play button is live only on live days.** `rushPlayable()` is `isRushLive(shopNow())` (or the owner's preview switch). On the page the button is disabled
with a quiet line: "Next live: Sun 22 Nov, 00:00 UTC (Sat 21 Nov, 7:00 PM your time)". No badge, no countdown that shouts: the events' "No pushing" rule. A run in
progress is not stopped (section 2).

**Secrets: One and 2763.**
- Nothing names One before her own chain does (`stageOpen`: "so nothing names it before her chain does"; the Boss Rush pick shows her only once `oneUnlocked()`). The
  rush list is built per player: `algRushList()` drops the One row unless `oneUnlocked()`. A player who has not beaten her sees and plays the rush without her slot
  (the run goes X to Three); the day they beat her the list grows by one and she is in. The page never prints a boss count.
- 2763 is "?" for everyone until they reach it. `PROFILE.rush.seen` is a set of boss ids (union-merged), written when a fight starts. The nine-slot strip, the title
  card, the interlude card and the page draw an unseen boss as a dark silhouette with a "?"; the name appears when its fight begins. After the first sighting it is
  an ordinary slot. (Canon, for the blurb: 2763 is "The Most Powerful Number", nicknamed "That Thing" and "Mister Mysterious Thing", first seen in "Thanks for
  2,763,000 Subscribers!"; Algebraliens are "extraterrestrial beings from the Math Planet that resembling mathematical symbols", BFDI wiki.)
- The changelog line and the page blurb say "Algebralien Rush" and nothing about how many bosses or who.

---

## 2. THE DATE RULE

### Your reading is correct: it depends only on the month length

A weekday that occurs five times in a month has its first occurrence on day `d0 <= L - 28`; its 4th is `d0 + 21` and its 5th `d0 + 28`. So the live days are every
day 29 to L (a day 29-31 is always a 5th occurrence) plus day 22 to L - 7 (a 4th occurrence that is followed by a 5th). Nothing else enters.

| Month length | Live days | Count | Notes |
|---|---|---|---|
| 31 | 22-24 and 29-31 | 6 | |
| 30 | 22-23 and 29-30 | 4 | |
| 29 (leap February) | 22 and 29 | 2 | two one-day windows |
| 28 (February) | none | 0 | |

Live days a year: 58 in a common year, 60 in a leap year (checked 2026 to 2030 and 2100). That is about 22 windows a year. Windows never join across a month end
(the 31st is followed by the 22nd of next month at the earliest).

### The code (this is the sketch; run and proved)

```js
function daysInMonthUTC(y, m){ return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }   // m is 0-11
// The live window holding this UTC date, or null: { y, m, first, last } (days of the month, both live).
function rushWindowOf(d){
  const y = d.getUTCFullYear(), m = d.getUTCMonth(), D = d.getUTCDate(), L = daysInMonthUTC(y, m);
  if(D >= 29) return { y, m, first:29, last:L };                    // the 5th occurrence of its weekday
  if(D >= 22 && D <= L - 7) return { y, m, first:22, last:L - 7 };  // the 4th, of a weekday that has a 5th (D + 7 <= L)
  return null;
}
function isRushLive(d){ return rushWindowOf(d) !== null; }          // d = shopNow() in the game
// A window is named by the week its first day is in (shopWeekNo's own formula), so every window has its own distinct, rising key: the payout ledger's key.
function rushKey(w){ return Math.floor((Math.floor(Date.UTC(w.y, w.m, w.first)/86400000) + 3)/7); }
// The window live now, or the next: { live, startMs, endMs (first ms after the last live day), key }. The longest wait is 49 days (1 Feb to 22 Mar).
function rushNext(now){
  const t0 = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  for(let k = 0; k < 60; k++){
    const w = rushWindowOf(new Date(t0 + k*86400000));
    if(w){ const s = Date.UTC(w.y, w.m, w.first), e = Date.UTC(w.y, w.m, w.last + 1);
      return { live: now.getTime() >= s && now.getTime() < e, startMs:s, endMs:e, key:rushKey(w) }; }
  }
  return null;
}
```
Only `getUTC*` is read, so a player's time zone changes nothing; a computer with a wrong date sees other days, exactly as with the quests and the weekly event.

### Twelve test dates (all UTC; the rule and a literal "count the weekday's occurrences" check agree on every one)

| # | Moment | Live? | Why |
|---|---|---|---|
| 1 | 2026-10-21 23:59:59 | no | 31-day month, the second before the window |
| 2 | 2026-10-22 00:00:00 | YES | first live second (Thursday 4th of 5) |
| 3 | 2026-10-31 23:59:59 | YES | last second of a 31-day month (Thu, Fri, Sat occur five times) |
| 4 | 2026-11-01 00:00:00 | no | the next second |
| 5 | 2026-11-23 23:59:59 | YES | 30-day month, last live second of the first window (23 = 30 - 7) |
| 6 | 2026-11-24 00:00:00 | no | 24 is the 4th Tuesday of four |
| 7 | 2026-11-30 23:59:59 | YES | last second of a 30-day month |
| 8 | 2027-02-22 12:00:00 | no | 28-day February: every weekday occurs exactly four times |
| 9 | 2027-02-28 23:59:59 | no | last second of that February |
| 10 | 2028-02-22 12:00:00 | YES | leap February (Tuesday occurs five times) |
| 11 | 2028-02-23 12:00:00 | no | |
| 12 | 2028-02-29 23:59:59 | YES | the 29th |

Also proved: all 157,420 days from 1970-01-01 to 2400-12-31 (including 2000, 2100, 2200, 2300 and 2400) give 0 disagreements with the literal definition, and
each month length always yields the same live set. The output is byte-identical under `TZ=UTC`, `America/Los_Angeles` and `Asia/Tokyo`.

### The windows from today (UTC)

22-23 Nov 2026 | 29-30 Nov | 22-24 Dec | 29-31 Dec | 22-24 Jan 2027 | 29-31 Jan | (49 days off) 22-24 Mar | 29-31 Mar | 22-23 Apr | 29-30 Apr | 22-24 May ...
The gaps are 4, 5 or 6 days between a month's two windows, 21 days to next month's first, and 49 days over a common-year February (21 in a leap year). The window keys
are distinct and rise (2968, 2969, 2973, 2974, 2977, 2978, 2986 ...).

### A run in progress at 23:59:59 UTC

The window only gates STARTING: Play and "Start over" read `isRushLive` and refuse with the quiet next-live line; nothing reads it mid-run. A run that began live
finishes (the next boss, a retry of the boss you just lost, the victory), and what it earns is paid under the window it STARTED in (`run.key`), the same rule the
events use ("a match that crosses Monday midnight pays toward the event it started in"). There is nothing to abuse: a payout is capped per window, and leaving the
rush (title, menu, a closed tab) ends the run, so an overnight pause gains nothing. The page's "Live now" line is worked out when the page opens, so a page left open
across midnight is stale until the player re-enters it (the weekly page behaves the same).

### Local time, and the preview problem

Windows are UTC days, so for the Americas a window starts the previous evening (22nd 00:00 UTC is 7:00 PM EST / 4:00 PM PST on the 21st) and ends the same
evening of the last day. The page must therefore print both: "Live now, ends in 14 hours" (`eventEndsWords` wording) and "Next live: from Sun 22 Nov 00:00 UTC (your
time: Sat 21 Nov, 7:00 PM)" via `toLocaleString`. The one-day leap-February windows (22 and 29) are the ones a player will miss without it.

The owner cannot see a live day until 22 November, so the build needs two constants beside the date code: `RUSH_DEV` (force live, for the owner and the sweeps) and
`RUSH_OPEN` (false until the owner flips it). This is exactly the `MCAVE_DEV` / `MCAVE_OPEN` pattern, and the ledger's rule that a release is the owner's call
(Moon Caves was released at M1 by mistake once; memory "Release check").

---

## 3. THE RUSH FLOW

### 3.1 One run, start to end

Event page, Play ▶, select screen (the strip, pick a fighter), Play ▶. Then nine fights in a row (eight for a player without One), each its own arena, with an
interlude card between them. After the last boss falls: the victory screen. Lose every stock in a fight: the defeat screen with Retry.

### 3.2 How long it is (the numbers you asked for)

Total boss health 17,200. The speed a solo fighter does damage to a boss is the one unknown. Two measurements exist: the committed bot sweep (`scripts/boss-rush-balance.json`,
solo AI, 5400-frame cap, so it flatters fast clears) gives Two 427 HP in 63.7 s (6.7 HP/s), Four 510 in 63.7 s (8.0), Springy 9.0, MePhone4 7.2, Evil Leafy 7.2,
MePhone4S 8.8, Dragon 6.5; and the owner's own One brief: 2,000 HP "abt 4-8 mins" is 4.2 to 8.3 HP/s. I use 6, 8 and 10 HP/s (these are for the length only; no
difficulty is tuned to a bot, as the owner's rule says).

| Boss | HP | at 6 HP/s | at 8 HP/s | at 10 HP/s |
|---|---|---|---|---|
| Two | 1,000 | 2:47 | 2:05 | 1:40 |
| Four | 1,200 | 3:20 | 2:30 | 2:00 |
| Nine | 1,400 | 3:53 | 2:55 | 2:20 |
| Six | 1,600 | 4:27 | 3:20 | 2:40 |
| Zero | 1,800 | 5:00 | 3:45 | 3:00 |
| X | 2,100 | 5:50 | 4:22 | 3:30 |
| One | 2,400 | 6:40 | 5:00 | 4:00 |
| Three | 2,700 | 7:30 | 5:37 | 4:30 |
| 2763 | 3,000 | 8:20 | 6:15 | 5:00 |
| **Fighting** | 17,200 | **47:47** | **35:50** | **28:40** |

Add about 10 s a boss for the walk-in, the exit scene (Two holds 0.6 s, Four 1.7 s) and the interlude: about 1.5 minutes. **So a clean clear is about 30 to 50
minutes, about 37 at the middle**, and a first clear with a retry or two is over an hour. Two honest corrections: a larger stage costs damage time (the player has to
close distance; the bot numbers are from one flat screen), so lean to the slow column; and the back half is the long half (X onward is 59% of the HP). One at
2,400 lands inside the owner's own "4-8 minutes" for 2,000. The knob if this is too long: one number, `ALG_RUSH.dmgToBoss` (default 1), read at one line in
`damageSummon` and in `oneTakeDamage`, so the bars still read 1k to 3k and every fight is shorter by that factor.

### 3.3 Lives and healing (the owner's rule)

- Start with 4 stocks. When a boss falls: +2 stocks, capped at 6 (`stocks = min(6, stocks + 2)`).
- Each boss is a new match, so you meet it at 0% damage (the old gauntlet's "-30% heal" is not needed: a fresh body is a full heal). Only stocks carry. Items on the
  floor, power-ups and assists do not.
- Entry stocks are never below 3 after boss 1 (the worst survivor has 1 left, plus 2). A boss is therefore almost its own fight: attrition does not pile up, which
  is what the +2 rule says. Within One's own fight her phase lines still pay a heal and, at her second line, a stock back "every 2 phases" (`onePhaseReward`), but only up to the stocks you walked in with
  (`_oneStocks0`); that stays as it is.
- Fixed for everyone (as the event matches are): one fighter, no allies, no CPU-skill row, items per `ALG_RUSH.items` (my default: the usual rate, no change to the
  pool). Smash Balls never appear in a boss fight (`fsAllowed` refuses mode `boss`), so there is nothing to decide there.

### 3.4 Interludes (no words except a designed sign)

Between fights a card of about 3 s, skippable after 1 s with any key, grows in over 12 frames. It is drawn, not printed: the next boss's own render (`BOSS_SPRITE_SRC`;
the procedural drawer if it is not loaded) on a chalkboard, nine small slots under it (beaten filled, next ringed, unseen a dark "?"), and your stocks as dots. An
unseen boss (2763; One for a player who cannot meet her) is a black silhouette. No names, no hit counts, no lines. After the last card the match begins with the
usual "GO!". The first card (before Two) is the same card with no slot filled.

### 3.5 A defeat

All stocks gone: after the existing 800 ms beat the result screen shows "Defeated" and one line ("Zero was the fifth. Retry it with 5 stocks."), with Rematch
relabelled "Retry boss ▶" (the `RACE.retry` trick) and "Rush ▸" (the `Event ▸` button). Retry starts that boss again with the stocks you walked in with. R mid-fight is
the same retry (`startMatch` already routes R through the one entry point). "Start over" is on the page. Retries are counted (`run.continues`) and shown on the result as a
quiet line, and a clean clear (zero continues) is a record of its own, nothing more. The alternative, stricter reading (a defeat ends the run) is question 4.

### 3.6 Progress and records

`PROFILE.rush = { best:{ boss ids beaten, most in one run }, fast:seconds of the fastest clear, clears, clean, seen:[ids], pay:{ 'k<window>:<id>': tokens } }`, merged upward
(max, min, union), saved at each boss that falls (as `awardBossCleared` saves "at the deed, not at run end"). Run time is the sum of the fights on the winning path (a retried
boss counts once). The page shows "Your best: 6 bosses · fastest clear 38:40 · cleared twice". The existing "Share result" gets one more kind beside `'rush'`.

### 3.7 Which fighter, allies, online

- Any fighter you own, with One's bans (`oneCoercePick`, called in `startMatch` before any pick branch); event fighters you own are allowed. Solo only: the gauntlet's
  HP scaling `1 + (n-1)*0.6` and per-ally state are exactly what a fixed 1,000 to 3,000 curve does not want.
- Offline only at launch (the event matches refuse in a room: `startEventMatch` checks `inNetSession()`). The online Boss Rush exists (`BOSSRUSH.card` and
  `bossCleared` ride the snapshot), but One's fight is local-only (`startOneFight` returns false in a net session), so an online rush needs One online, or her slot skipped,
  or a version that is eight bosses online. Multiplayer means online, so this is the owner's call (question 1).

### 3.8 How it is built: a conductor of matches, not the old gauntlet

The old gauntlet fights every boss in the same match on one fixed screen and swaps `BOSS_ARENA`. The rush cannot: One's arena is a different world (the teams map without
walls, 5 screens wide, `groundY()` reads `ONEFIGHT.active`), and the owner wants larger stages for all nine. So **each boss is its own match**, as One's and Cobs's fights are,
and a small conductor carries four things between them (stocks, the fighter, the run's clock and the profile):

```js
let ALGRUSH = { active:false, run:null };   // run: { key, list, i, entry (stocks walked in with), secs:[], continues, fighter }
function startAlgRush(){ /* refuse in a room or off a live day; lend the settings (EVENT_LOAN); run = {...}; algRushBegin(0) */ }
function algRushBegin(i){
  if(ONEFIGHT.active) oneFightRestore();
  const b = ALGRUSH.run.list[i];
  if(b.kind === 'one') startOneFight([chosen.name], { stocks:ALGRUSH.run.entry, hp:b.hp, onEnd:algRushOneEnd });   // onEnd returning true takes the screen
  else beginMatchNow();   // beginMatchNow: if(ALGRUSH.active) algRushSpawn() instead of startBossRush(); BOSSRUSH = { active:true, alg:true, bossIdx:<row>, dmgMult:1 }
}
```
The hooks in the engine (each a few lines, in the places RACE, ONEFIGHT and COBSFIGHT already have a branch): `beginMatchNow` (spawn the rush boss), `buildFighters`
(`f.stocks = run.entry` for you, the same line the 3 vs 1 uses with `youStocks`), `setupWorld` (the rush arena), `checkWin` (the rush's win and lose), `bossRushCheck` (an `alg`
branch before the cycle and before `wasFour`: no card, no loop, no `awardBossCleared`), `go` (leaving clears the run; its result screen keeps Retry), `startMatch` (R and
Retry). Why per-match: a retry is simply "begin boss i again"; nothing leaks between bosses (the in-place gauntlet needs `projectiles.filter(cookie, cobsTrap, springy)` and
the like to stop that); and One already works this way. The cost: the music and the run recording restart per boss (the result's replay is the last fight), and a
1 to 2 s cut at each interlude, which the card covers. A boss row for the six new bosses lives in an `ALG_ROSTER` of the same shape as `BOSS_ROSTER` rows and is NOT added to `BOSS_ROSTER`
(that list is the gauntlet: adding to it would put six new bosses in the twelve-boss rush and move Four from last); `bossPaced` and `BOSS_TEL_PACE` must be told about those rows
so they get the usual 1.2x gaps and wind-up pace.

---

## 4. REWARDS (small, and capped)

Paid the moment a boss falls (no pushing), into the Win Token wallet (`walletEarn`): nothing new to learn, and it only ever "buys a look" as the events' tokens do.

| What | Pays | Limit |
|---|---|---|
| A boss felled, the first time in a window | 10 Win Tokens | once per boss per window |
| A full clear (all of your bosses, in one run, continues allowed) | +60 | once per window |
| **Window cap** | **150** | one cap per window key; a clear with all nine is exactly 150 |
| First clear ever | two reward-only looks: a profile card and a title (a price-0 entry in `wallet.owned`, never in the Store list, wearable from the Wardrobe) | once |
| Records | best, fastest, clears, clean clears | no tokens |

Scale, so it stays small: a daily quest pays 9 to 18, a weekly 36 to 72, One's reward was 500 once, a look costs 45 to 150. At most 150 a window and about 22 windows a year,
so a perfect year is about 3,300 tokens against about 22,000 a year from quests (three dailies at 9 to 18 and three weeklies at 36 to 72). The ledger is `PROFILE.rush.pay` with lines `k<windowKey>:<bossId>` and `k<windowKey>:clear`,
kept for this window and the one before and merged by union (a payout is never paid twice by two tabs: `mergeEvent`'s idea). It is NOT in `PROFILE.event`
(`eventNorm` would delete the lines). Looks must not name One or 2763: the title could be "Top of the Class" (a pun on Four's classroom), the card a night sky of drawn numerals;
art and names are the owner's pick.

---

## 5. What Two, Four and One need

### Two and Four: they need a RUSH VERSION (the owner's rule), and it is real work

Today Two and Four are a "boss slot" pair each (`@boss:two:` and `@boss:four:` markers), built for one screen: `WW` is the screen. On a stage 2 to 5 screens wide, three things break,
and all of them are why "you can just outrun them":

1. **Anchors that are the arena's middle or edges.** Two's moves go to `W2 = WW*0.5` (THE POWER OF TWO!, BLOCK TOWERS!, CLAP!, I LOVE RIDES! all `twoGoTo(s, W2, ...)`); his claps close
   "from the edges" in 28 to 34 frames (on a world 5 screens wide that is about 100 px a frame, so it cannot work), the rails are `WW` long (the cars' life is `(WW + ...)/speed`), the sun's
   home is `WW*0.8`. Four's slither goes to `WW - tgt.x` (the mirror across the world: on a wide stage he leaves the screen), SCREECHY!'s ring lives long enough to reach the farthest wall,
   TAKE THE TOWER!'s ripple runs from the far side across `WW`. About 30 sites in Two and 20 in Four.
2. **Reach.** Two's orbs start from the middle of the world; Four's bye-bye pull (500 to 700 px) and his cactus walk (about 400 to 600 px) are bounded, so a fighter far from the boss is simply out of range.
   His screech ring is the other way round: it lives until it has crossed to the farthest wall (6 to 7.5 px a frame, so about 7 s over 3,000 px), and its gaps widen with the radius (a 0.2 rad gap is
   about 120 px wide at 600 px and 600 px wide at 3,000), so far away it is slow and almost not a ring.
3. **Chasing.** Two follows with two first-order filters, so a running fighter (6.4 px a frame) stays about 200 to 320 px ahead of his glide, on top of his 250 stand-off. Four follows with
   `follow: 0.012`, an 83-frame time constant: a running fighter pulls about 500 px ahead of him, and at a gap that wide his ring, his pull and his cactus fall short.

**The recipe, three parts, all behind `BOSSRUSH.alg` so the ordinary Boss Rush fights are byte for byte what the overhaul tuned:**

- **A local arena.** A window the width of the camera's view (`W / CAM_ZOOM`, about 1,780 px on a 1280 window), centred on the fighter at the moment a turn begins, clamped inside the world
  and held for that turn. Every `0`, `WW` and `WW*0.5` that is an anchor reads `aL()`, `aR()` and `aM()` instead (flat stages: the world, as now). The stage can then be any size: the boss fights in the
  window and the stage is for the player's legs.
- **A leash.** At the start of every turn (and after a long gap) a boss more than `LEASH` (about 650) px from the nearest fighter relocates to the window with the move it already has: Two pops
  (`twoPop`, `twoGoTo`), Four becomes a puddle and slithers (his own slither, with the mirror replaced by "your far side inside the window"). One's rule is the proof it plays well:
  `ONE_TELE_DIST` 1000, `ONE_TELE_HOLD` 30, `ONE_TELE_CD` 180 (shorter here, because the view's half width is about 890 px). The cobs-style option is to give Two and Four `oneMove`
  with their own `*_MOVE_CFG` (a table, `ONE_MOVE_CFG`), but that changes how they move in every phase; the leash does not.
- **Buffs that are new attacks or wider ones, never damage.** "Harder, same damage" stays: every part of a turn shares its one attack id, so a fighter takes at most one boss hit from it.
  Candidates, one line each: Two's CLAP! gets a third hand mark that lands where you will be (a lead, like `lead:0.35`) and its rails run two lanes at once at the window's width; MAYBE YOU'D LIKE
  THIS! bounces one more time toward you; Four's SCREECHY! gets its second ring from phase 1 (`ring2` is phase 3's today) with gaps that do not line up with the first; ZAPPIES! locks a column on where you were and one on where you are;
  GO BYE-BYE!'s reach grows with the window; I DO THIS! marks two fighters-widths of the stage ahead of you. All the owner's rules for a new thing hold: it shows in the body animation,
  no telegraph lines, anything that appears grows in over 12 frames, anything that falls hits while it falls.
- **Health:** Two 1,000 and Four 1,200 are set at spawn (`makeBossSummon(row, hp)`), not by `BOSS_HP_MULT` (1.5) or the ally formula; both read `bossDmg()`, which includes `BOSSRUSH.dmgMult`, so a harder
  rush is one number per boss (`dmgMult`), free, and One keeps `ONE_DMG_MULT`. Both already break at 66% and 33% of `maxHp`, so any curve works; Two's phase 3 (immune until grounded) is 330 HP of his 1,000.
- **Size:** about 250 to 400 changed lines each, most of them mechanical (the anchor swap), plus the leash and the new patterns. The rush rows are copies `{ ...row, hp, wide:true }`
  in the rush table; their `BOSS_ROSTER` rows stay as they are, because Four is still the gauntlet's last boss.
- **Not touched:** their exit scenes (`BOSS_ENDINGS.two`: 0.6 s, `.four`: 1.7 s; the conductor waits for `ending.hold` as `bossRushCheck` does), their phase names and their tell art.

### Four is the gauntlet's FINAL boss: he is second here

Nothing in the rush may reach the `wasFour` branch. The rush's second boss is not "the end": no victory card, no loop, no `awardRushLoop` or `oneRushHook`
("reaching Boss Rush loop 2 with Lightning"), and no `boss:Four` trophy (it would give a fighter by a shorter road than the twelve-boss rush).

### One: as she is, with five small changes

She is already built for a wide arena (the teams map without walls, her orbit, her swoop, her teleport), and she has all of Two's and Four's attacks (the eight she inherited: ZAP TO DUST!, SCREECHY!,
MIND READ!, ONE GROWS GIANT!, POWER UNGROUNDED!, and three from the II bosses) plus five of her own (MOON ROCKS!, EYE LASERS!, HANDS FROM THE GROUND!, OUT OF ORBIT!, GHOST FIGHTER!). Meeting
them in fights 1 and 2 first and again in fight 7 is the point of the order (canon: she took Two's and Four's power in "Last One Standing"); nothing to change in her kit. The changes:

1. HP 2,000 to 2,400: `spawnOneBoss` reads `ONE_BOSS.hp` (give it `opts.hp`).
2. **Her phase lines are a constant, `ONE_PHASE_HP = 500`, read in four places** (the `while` in the damage path that raises a line, `onePhaseUp`'s banner, the drain's heal cap and the bar's ticks). At 2,400 the lines
   would fall at 1,900, 1,400 and 900 and the last phase would be 900 HP long, 1.8 times the others. Make it per boss, `maxHp / 4` (600: 1,800, 1,200, 600).
3. Stocks: `buildOneFighters` reads `ONEFIGHT.story ? 3 : SETTINGS.stocks`; add `opts.stocks` (the rush's entry stocks). `story` stays false (no Cobs-style story rules).
4. Her result: she is started with her own `onEnd` that returns true (the screen is the rush's) and calls `oneFightRestore()` before the next boss. The chain functions (`oneFightEnded`,
   `awardOneDefeated`, `oneAfterMatch`) are never called, so the rush can neither unlock nor re-count her.
5. A player who has not beaten her is never given her slot (section 1).

Her bed (`MUSIC_FILES.one`) plays as it does; a rush bed and the bosses' beds are the owner's pick (the gauntlet's `musicRerollContext('boss')` per boss is the default).

### What the six new bosses must follow (the interface the shell needs)

A row like a `BOSS_ROSTER` row (`name, color, big, attack, arena, stationary, sprite`) in `ALG_ROSTER`, its HP from the curve, its slots inside its own `@boss:<key>:` marker pairs (the overhaul's merge rule),
an ending in `BOSS_ENDINGS` keyed by its `attack` (the conductor waits for `holdMs`), a render in `BOSS_SPRITE_SRC` (the interlude card uses it), and `ONE`-style rule: no contact damage, one attack id per turn.

---

## 6. THE UI

**Title.** On live days a third card in the `.titlecards` row, beside the Daily and the weekly event card (it wraps if the window is narrow; the title keeps its six buttons because the
button is inside the card, as the Daily's and the event's are):
`★ ALGEBRALIEN RUSH` / the nine-slot strip (seen bosses as small renders, unseen as dark "?") / `Live now · ends in 2 days` / `Rush ▶`. Off days: nothing on the title. The off-day door is one
quiet line at the foot of the weekly event page, under "Next week": `Algebralien Rush · next live Sun 22 Nov`, a link to the rush page.

**The page (`#rush`, `buildRushPage`).** Title "Algebralien Rush". Status line: `Live now · ends in 14 hours`, or `Next live: Sun 22 Nov, 00:00 UTC (Sat 21 Nov, 7:00 PM your time)`.
A canon-safe blurb ("Algebraliens are living numbers from the Math Planet, and they are lined up to fight you."). The slot strip. The rules in one sentence: "You alone, one fighter. Start with 4 stocks; each boss you beat
gives 2 back, up to 6. Lose them all and you can retry that boss. Each boss pays Win Tokens the first time in a window, a full clear pays more: up to 150 a window." Your records. `Play ▶` (disabled off days, with
the next-live line). `◀ Back`. Esc goes back. Everything is a button; the keyboard reaches it (the events' rule). No word of how many bosses.

**Select screen.** `EVENT_PICK = { rush:true }` through the existing path; `syncEventSelect` shows the strip `Algebralien Rush · you alone · 4 stocks, +2 after each boss (max 6) · items on`, hides
the CPU-skill row, Play ▶ starts `startAlgRush`. Esc or Back returns to the rush page.

**In the match.** The boss bar stays (name and HP), and `cleared N` is replaced by the nine pips drawn as shapes. No move names, no lines. The interlude is section 3.4.

**Results.** Victory: "Rush cleared" with the run time, the records line and the pay note (reusing `#eventNote`, `+60 Win Tokens · first clear: two new looks`), buttons Share / Rush ▸ / Menu. Defeat: section 3.5.

---

## 7. RISKS, AND THE SIZE OF THE SHELL

**Risks**
1. **Length.** 30 to 50 minutes a clean run (section 3.2) is the single biggest design risk. The checkpoint per boss and the +2 stocks soften a loss, but not the time. The one-number multiplier is
   the mitigation; the owner tunes it by feel (never to a bot).
2. **Larger stages against the old single-screen rule.** The game deliberately keeps Boss Rush on one screen: `forcedScroll()` says "boss tells are unreadable behind a panning camera". The leash (a boss
   never farther than about half a view from you) is what makes a scrolling boss fight readable, and One's fight proves it works. Without the leash the rush versions would be unreadable as well as outrunnable.
   The camera also needs a rule (frame the boss and you, not just you); that belongs to the stage work.
3. **Two and Four rewritten around the ordinary Boss Rush.** Everything must stay behind `BOSSRUSH.alg`, or the overhaul's tuned fights change under the owner's feet. About 700 changed lines for both.
4. **Secret leaks:** One's slot, 2763's slot, the title card, the strip, the interlude silhouette, the share text, the changelog, the page blurb and the profile's `seen`. A checklist item for the checker.
5. **A save branch.** `PROFILE.rush` is new: `freshProfile`, `mergeProfiles` and `shopCatchUp`. A bug there is a lost payout, not a lost fighter (it touches no unlocked list).
6. **Live days nobody can see.** Windows are UTC days, 1 to 3 days, and the first is 22 Nov. Local-time words on the page and `RUSH_DEV` / `RUSH_OPEN` are the answer. A common-year February is 49 days of nothing.
7. **The One chain.** The rush must not count toward it (`oneRushKill`, `oneRushHook`, `oneAfterMatch`) and must not unlock her (`awardOneDefeated`); each is a one-line guard and the first thing to check.
8. **The worktree is moving.** While I read, `ii-dlc` took a merge (`g-bow-fs`) and a second one is in progress with `docs/LEDGER.md` unmerged; the build lands on a moving target. Every cite here is by name.
9. **Per-match restarts.** Music and the run recording restart at every boss; the result's replay is the last fight only. Accepted in section 3.8; the owner may want the replay of the whole run (cost: a recorder that survives `beginMatchNow`).
10. **No tests exist (since 2026-10-21):** build, check it boots, show the owner. For the date rule I did the proof above; the shell is checked by playing it with `RUSH_DEV`.

**Size of the event shell alone (not the six bosses, not the wide arenas, not Two's and Four's rush versions)**

| Piece | Lines |
|---|---|
| The date rule, windows, the next-live words, `RUSH_DEV` / `RUSH_OPEN` | 70 |
| The table of nine, the constants, the secret helpers (`algRushList`, `seen`) | 70 |
| The conductor and its hooks (`beginMatchNow`, `buildFighters`, `setupWorld`, `checkWin`, `bossRushCheck`, `go`, `startMatch`), One's opts (`stocks`, `hp`, her phase line at four sites) | 260 |
| `PROFILE.rush`: normalise, merge, pay ledger, records, awards, the two looks | 130 |
| Screens: title card, `#rush` markup and builder, select strip branch, victory and defeat | 230 |
| Interlude card and the HUD pips | 130 |
| **Total** | **about 900 (700 to 1,100)** |

For scale, the event-fighters' calendar, tokens, runner and screens (steps 3, 4, 7 and 9) are about 500 lines; the rush is bigger because of the conductor, the interlude and the records.
Outside the shell: Two's and Four's rush versions about 500 to 800 lines together, One's changes about 30, the wide arenas and the six new bosses are other lenses.

---

## 8. Questions for the owner

1. **Online?** The rush is offline and solo at launch. An online co-op rush needs One online (her fight is local-only today), or her slot skipped for the room, or an eight-boss online version. Which, if any?
2. **One before her chain.** Players who have not beaten her: skip her slot (an eight-boss rush that grows a boss the day they unlock her), or let everyone meet her in the rush (it names her and fights her before her
   Moon scene)? Recommended: skip.
3. **Run length.** The curve is about 36 minutes of fighting at the middle (29 to 48). Keep it, or add the damage-to-rush-bosses multiplier (default 1) so the bars read 1k to 3k and the fights are shorter? Recommended:
   build the knob, leave it at 1, let you feel the first two bosses.
4. **A defeat.** Retry that boss with the stocks you walked in with (recommended: unlimited, counted, a clean clear is a record) or the run ends and you start over?
5. **How much larger,** and what "buffed" means for Two and Four. Recommended: one wide factor of about 2.2 screens at the usual zoom, not One's 5 screens for all nine; the buffs are the leash, the window and a few wider or new
   patterns, never more damage per turn. Is that what you meant by "buffed four"?
6. **Rewards.** Win Tokens (10 a boss the first time in a window, +60 for a clear, 150 a window) and two reward-only looks (a card and a title) on the first clear. Yes, or other numbers, or a different prize?
7. **A release switch.** Build it hidden (`RUSH_OPEN` off, `RUSH_DEV` for you) and you flip it? The first live days are 22-23 November.
8. **Items.** The usual items in the rush (recommended: they are the gauntlet's own, and the HP curve is long), or none, as in One's story fight?
