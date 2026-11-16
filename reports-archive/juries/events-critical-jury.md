# Critical jury: event contests (preview build g-smash-preview, artifacts/V1/index.html)

Scope and honesty notes
- Read-only. Code read plus headless CPU-only runs with contests-scripts/contest_run.mjs (3 runs each, cap 330 s). The machine was overloaded (10+ node processes from other jobs) and the lead cut me to ONE node process midway, so the run set is thin:
  - Run: Cloudy (2 of 3 runs finished; the script's 900 s timeout killed the 3rd), Eraser 3, Spongy 3, 8-Ball 3, Beach Ball 3, Black Hole 2 (then I stopped it, one-process order).
  - NOT run by me: Clock, Pie, Foldy, Stapy. The build notes' own numbers for them are not re-verified. Their rows below are code reading only.
  - NOT run: scripted human (the script's human bots exist only for old Clock/Foldy/Stapy designs), idle human, quitting mid-match, pause/resume, win screens in a browser, event-week rotation under real dates. Code read only.
- Tokens paid: every run printed result.pay = null, even for wins. The headless harness has no PROFILE/quests (eventPay returns null on its first line), so token payment is UNVERIFIED, not "broken".
- Known issues for Stapy, Foldy, Black Hole, Pie, Clock, 8-Ball are not repeated.

## Verdict table
| Contest | Verdict | One line |
|---|---|---|
| Cloudy (collection) | NEEDS WORK | one run never ended in 330 s; goal almost unreachable |
| Eraser (spleef) | NEEDS WORK | fixed spawn slots, Firey won 3/3; 30 rows vs the owner's 10 |
| Spongy (dig) | NEEDS WORK | hints contradict the owner's design; CPUs idle early; phase banners |
| 8-Ball (lick) | NEEDS WORK (light) | runs end 96-191 s; one-sided blowouts |
| Black Hole (top) | NEEDS WORK | 2 runs ended 162/164 s; hit rule favours the lower attacker (code read) |
| Clock | NEEDS WORK (unverified) | not run by me |
| Pie | NEEDS WORK (unverified) | not run by me |
| Foldy | NEEDS WORK (unverified) | not run by me; nothing new found |
| Stapy | NEEDS WORK (unverified) | not run by me; nothing new found |
| Beach Ball (keepup) | NEEDS WORK | hits on people do not matter; every move swats the ball the same |

Nothing was BROKEN in my runs: 0 script errors in all 16 finished runs.

## 1. Competitive player

### Cloudy
1. The goal is practically unreachable. Win = hold all 9 for 10 s (CC.hold 600), but the Golden seed drops on ANY hit (rule hit(): `if(contestHas(t,'seed')) contestDrop(t,'seed')`), the window drops on a hit of 10+ damage, and every 3rd hit steals one. Evidence: 2 runs, 0 collection wins. Run 0 ended at 252 s only because three fighters ran out of stocks; run 1: NO FINISH at 328 s with stocks [out,1,1,1]. Bad (a match can run on for minutes while CPUs trade KOs). Fix: seed drops only on a stealing (3rd) hit, or the hold timer survives non-stealing hits.
2. No time cap or convergence: stocks are the only terminator. Fix: a 3:30 cap, the most kinds held (then longest hold) wins.
3. The leader gets ganged up on by design (focus() targets anyone holding 6+), so the best play is to sit at 5 and wait: a stalling strategy. Fix: reward leading (higher steal threshold for the holder of 7+).

### Eraser (spleef)
1. Start slots are fixed (spleefBegin: x = span*(i+1)/(n+1)), not dealt at random. The player's slot (Firey, leftmost) won 3 of 3 headless runs (120, 121, 117 s, stocks [1,out,out,out]). Pie and Black Hole were given random slots after the last jury; Eraser was not. n=3, so direction only. Fix: shuffle slots like Pie.
2. Hits barely matter: damage never KOs (pctCap 300, KO off), so a hit only shoves someone toward cracking tiles. Follows the spec, but plays as a race down. Owner to confirm he is happy with that.
3. Flyers (Puffball is in the match) can hover over a cracking row; only the stall rule (600 frames, then tiles crack on their own) ends that. Not shown to break in runs.

### Spongy (dig)
1. The owner's skill ("you do NOT know where your moves are; knowing when to stop digging") is gone: the build gives a glint within 2 cells (DGK.hint) and two ringed hint areas (f._dgHint drawn in drawDigc). That turns it into a treasure map. Needs the owner's decision.
2. Buffs are tiny: first out x1.25, then 1.15, 1.05, 1; late ones start at +15/30/45%. The incentive to rush is weak. Tune after the owner decides.
3. A human who never exits is forced out by a cave-in at 150 s + 10 s (DGK.stall, DGK.cave): 2:40 of waiting for everyone else.

### 8-Ball (lick)
1. Blowouts: run 0 ended at 96 s with Lollipop on 6 of 6 stocks and the other three out. Runs 96, 164, 191 s. Little counterplay once a fighter leads in assists. Fix: slow the jawbreaker fall when the stock gap is large.

### Black Hole (top)
1. hit() sets _bhHit (knock toward the hole) for any attacker, even one below the victim; a lower fighter can drop the climber above at no cost. Fix: only when the attacker is above the victim.
2. A human who is swallowed early just watches for most of the 162-164 s (no spectate aid, no fast return).

### Clock / Pie / Foldy / Stapy
Not re-run. I cannot prove anything new for them.

### Beach Ball (volleyball)
1. Combat is irrelevant. The ball check is `swing && d < body + K.reach` with `swing = _atkAnim>0 || _mv || _sm` and K.reach fixed at 44: ANY move of ANY fighter returns the ball identically, aimed by the held direction. Fighters are held on their own half (beachKeep) and the net is solid, so only projectiles and long moves can hit across it. This contradicts the owner's core rule "every hit has an implication for the goal". Fix: a hit on a receiver (stun) should cost them the ball, and moves should differ in reach or power.
2. Only one CPU per team defends: `want` returns goHome unless that fighter is the receiver, so the other idles (CPUs stood still 5 s+ at x about 1200 in runs 1-2, 6 flags). Looks like doing nothing.
3. The human's team (Firey + Beach Ball) won 1 of 3; results depend on the CPU teammate. n=3.

## 2. Show fan
- Cloudy: item names (window, raindrop jar, golden seed) fit. The match name "The Collection" is generic, no show moment.
- Eraser: the match is called "Spleef", a Minecraft word, not a show moment. Rename and draw the erasing.
- Spongy: HUD uses debug labels (SM, SP, UP, DN, FN) and "EXIT" signs; banners "The dirt is caving in!", "Caved in!", "FIGHT!" breach the owner's 2026-11-13 rule "no phase names, they should just happen".
- 8-Ball: "Lick Your Way to Freedom" is the show's own episode name. Good.
- Black Hole: HUD shows metres ("59 m"), the show has none; harmless.
- Beach Ball: row "Elsewhere on Earth" with David and Pin: I could not tie this to a show moment from the code. The art (beach, palms, net) is generic.
- EVENT_TWIST_WORDS paragraphs are textwalls again (owner 2026-11-07: less textwalls). Spleef's words say "30 floors" while the owner's spec says 10 rows (SPLK.rows is 30); I found no approval of 30 in the message log.

## 3. Bug hunter (what I actually ran)
- Errors: 0 in all finished runs.
- No finish: Cloudy run 1 (328 s, stocks [out,1,1,1]). Others ended: Black Hole 162/164 s, Eraser 117-121 s, Spongy 162/190/216 s, 8-Ball 96/164/191 s, Beach Ball 100/106/122 s.
- Stuck CPUs: Spongy had 2-3 CPUs immobile 5 s+ in the first 13-21 s in every run, always at the spawn x (717, 986, 1254). Not diagnosed. Beach Ball CPUs standing idle at home are expected.
- Player-slot bias (Firey is the human's seat, AI-driven in these runs): wins Eraser 3/3, Spongy 2/3; the build notes say Pie 7/10 and Stapy 4/10. Worth a look: Firey is strong, or the player slot gets a better AI/stats. Small n.
- Not tested: 1 human vs 3 CPUs with an idle human, quitting, pause/resume. Code read: hazardT drives everything so a pause just halts; Cloudy's missing cap and Spongy's cave-in are the only "never ends" candidates.
- Event-week rotation: EVENT_LAPS order Eraser, Spongy, 8-Ball, Black Hole, Clock, Cloudy, Pie, Stapy, Foldy, Beach Ball (then four unbuilt). The preview build overrides eventThisWeek with an F9 picker and EVENT_LAUNCH 2026-06-22 (moved for testing): that must not ship. Not run under a real date.

## Ranked top 10 fix list
1. Cloudy: add a match cap and make the win attainable (one run never ended).
2. Beach Ball: make hitting opponents matter; today every move is the same ball swat.
3. Player-slot bias: find out why Firey wins most CPU runs (Eraser, Spongy, Pie, Stapy).
4. Eraser: random start slots; confirm 10 vs 30 rows and fix words/HUD.
5. Spongy: confirm or remove the hint rings and glints; remove the FIGHT!/caving-in banners.
6. Spongy: diagnose CPUs frozen 5 s+ at spawn.
7. Black Hole: knock-toward-hole only from an attacker above the victim; help swallowed players.
8. 8-Ball: reduce blowouts.
9. Preview-only code: remove the F9 event picker and the moved EVENT_LAUNCH before any ship.
10. Cut textwalls in EVENT_TWIST_WORDS; rename "Spleef" and "Elsewhere on Earth" to show moments.
