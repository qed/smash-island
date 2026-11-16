# Clover vs the 0-to-death fighters of other games

Read-only research, 2026-11-06. Nothing in the game was changed, no simulation was run, no live relay was touched. Clover's side is built from the owner's description only. The planned file `combos-easy-vs-expert-and-mdi.md` did NOT exist when this was written, so her escape rates and chain lengths are not verified against our own data.

## 1. Comparison table

| Axis | Clover (ours) | Luigi (Smash Ultimate) | Kazuya (Smash Ultimate) | Steve / Mr Game & Watch / Sonic (quick) |
|---|---|---|---|---|
| How a combo starts | Neutral special (C): four butterflies drift ahead and each catches one shot | Down throw after a grab (his grab is a slow tether), then aerials | Electric Wind God Fist (EWGF), throws, tilts into the chain | Steve: advantage state from blocks, then juggles. G&W: down throw, up throw, up tilt, Fire. Sonic: down tilt, up throw, spin dash into aerials |
| Starter risk | Low: a projectile-like call, safe from range, and butterflies keep going | High: slow-startup tether grab, easily shielded or whiffed | Medium-high: EWGF is a tight "just frame" input; failed inputs are punishable | Steve: low once walls are up. G&W/Sonic: normal move risk |
| Length / percent range | Indefinite chain of little hits (no cap known); finisher is 4 hits of 3% | Throw into 3 to 4 aerials, then up special; a "0 to death" on many weights, extra hit needed on the heaviest | EWGF string; the wiki says his 10-hit string deals 38% and he can kill from 0 on many characters | G&W reaches about 60% in one air-string. Steve and Sonic: no true 0-to-death on the wiki pages |
| Read or setup needed | None beyond landing one butterfly volley | Mostly execution plus per-weight routes; a setup is not needed, a grab is | Heavy execution; reading is secondary | Steve needs setup (blocks, mining). G&W/Sonic: mostly execution |
| Can the victim escape? | Yes, by MDI in hit-stun; the CPU did it twice. The average human is unlikely to know it | Yes: DI and the next-hit timing; sources disagree (one says the route works against any DI, another says some characters get out). Up special depends on DI | Yes, partly: the 10-hit string is "easy to DI out of" and cannot finish near a ledge; EWGF paralysis limits escape and shield | Sonic: spin charge and up air "can have trouble connecting", so escapes exist |
| Kill mechanism | Combo kill, then the finisher (V+C) flings; she has no kill smash | Combo kill with an up special at the top | Percent kill moves (up smash around 110%, Rage Drive after 100% rage) and combo kills | G&W: up air juggle. Steve: TNT, anvil, smash. Sonic: weak kill power, past 150% |
| What limits it | Unknown in game: no scaling, no known cap, finisher is the only exit | Weight, per-weight timing, ledge position, low percent window; heavy glass cannon | Execution under pressure, poor disadvantage, linear recovery, slow air speed | G&W: very light. Steve: tools reset on KO. Sonic: light, linear recovery |
| Counterplay cost for the attacker | None known: an escape returns the defender to neutral, but the attacker lost nothing and can call butterflies again | The defender gets out, and the attacker is punished for a missed grab or mis-timed aerial | The defender escapes a dropped input and punishes Kazuya's whiffs; Kazuya is also easy to combo | Steve loses blocks and tools on KO |

## 2. Judgement

**Within the genre range, or beyond it?** Both, and it matters which part you mean.

- **Number of openings per stock: within range.** Luigi and Kazuya also take a stock from one opening, so "win neutral 3 times for 3 stocks" is the same rule as the best 0-to-death characters in Ultimate. Luigi sits in the middle of S- (10th of 82) and Kazuya at the end of S+ in the Smash Wiki tier pages, so the genre accepts it. Kazuya shows the cost: some regional events banned Kazuya and Steve in 2023, so the community does fight over it.
- **Beyond range in four ways:**
  1. **Execution.** Luigi's and Kazuya's combos take tough timing (Kazuya's EWGF has a window of about 3 frames on the wiki page) and per-weight routes. Clover's volley needs one key press. Strong combos are accepted largely because only experts finish them.
  2. **The chain has no stop.** In fighting games combos shrink through damage scaling, shorter hit-stun, and juggle limits. Clover's butterfly chain, as described, repeats with no loss, so its strength is fixed rather than falling hit by hit.
  3. **The only escape is hidden knowledge.** MDI is real counterplay, but it is invisible to casual players, so the practical escape rate for average players is far lower than the CPU's. Luigi's and Kazuya's escapes (DI, shield, ledge, mashing) are more widely known.
  4. **No cost to the attacker.** Luigi's slow grab and Kazuya's finicky input punish a failed attempt. Clover's starter is safe, so a failed combo costs nothing.
- **Different feel, not different power:** having no kill smash is not itself a problem. It makes her kill depend on the finisher, which is a good place for a limit. The finisher's Attack Up lets one opening feed the next one, which is what turns "one stock per opening" into "a snowball".

## 3. Recommendations (the owner decides; nothing applied; all keep the combo escapable)

1. **Diminishing returns on the chain (best fit).** After the second or third catch in one chain, each further butterfly hit loses some hit-stun, as Tekken and Street Fighter do with damage scaling. A strong but escapable combo remains, and a bad victim still loses a stock early on, but the chain eventually releases without needing the MDI trick.
2. **A visible tell as the chain gets long.** For example, butterflies glow or flutter faster, and an on-screen icon shows when MDI would work. The attacker still gets the combo, and the defender can learn it. This also helps average players escape, which fits "nothing unescapable".
3. **Limit butterfly reuse.** A short cooldown, or a rule that one victim cannot be caught again for about one second after a chain ends, so the AI's escape returns the defender to neutral instead of back into the loop.
4. **Finisher tuning (optional).** Keep the Attack Up but let it decay faster, or require a minimum percent before the 4th hit launches. This keeps a 0 percent opening from converting at full strength.
5. **Do not touch the number of openings.** It matches Luigi and Kazuya, and is the least surprising part.

## 4. Tekken and Street Fighter (general knowledge, not looked up)

Fighting games usually allow one opening to take a large part of a life bar. Damage scaling cuts the damage of later hits, and Tekken adds juggle limits and wall carry that run out; Street Fighter also uses scaling, with a minimum damage floor, and meter limits big combos. Neither has a universal combo breaker (Killer Instinct does). The community accepts one-opening-big-damage because the starter is hard to land or punishable, because execution is hard, and because the defender's life bar is small only to a point (scaling stops it from ending the round at hit one). The lesson for Clover is scaling plus a risky starter, which she lacks.

## 5. Sources and what was not verified

All pages read 2026-11-06. Pages longer than the fetch window were read only for the first 100,000 characters (the remainder was not read).

- Luigi (SSBU) - SmashWiki, https://www.ssbwiki.com/Luigi_(SSBU): zero-to-death route (down throw, down air, neutral air, up air, up special), tier 10th of 82 (S-), Update 2.0.0 weakened it, no exact percent ranges given.
- Luigi (SSBU) / Down throw - SmashWiki, https://www.ssbwiki.com/Luigi_(SSBU)/Down_throw: 3.0% base, no percent ranges or DI notes.
- Luigi - Ultimate Frame Data, https://ultimateframedata.com/luigi: down throw 3.0 percent, up air 5/26, down air 10/28 (startup/total); other numbers in the page were not extracted.
- Luigi has very little going for him outside his touch-of-death combo - EventHubs, https://eventhubs.com/news/2020/jan/01/luigi-has-very-little-going-him-outside-his-touch-death-combo-super-smash-bros-ultimate: combo varies with weight and some characters escape it; the "any DI" claim, from a search summary on one guide, is not verified.
- Kazuya (SSBU) - SmashWiki, https://www.ssbwiki.com/Kazuya_(SSBU): EWGF 3-frame window, 10-hit string 38%, rage from 100% with 1.1x damage and once per stock, Rage Drive kills before 80% at the ledge, tier end of S+, 2023 local bans.
- Steve (SSBU) - SmashWiki, https://www.ssbwiki.com/Steve_(SSBU); Mr. Game & Watch (SSBU) - SmashWiki, https://www.ssbwiki.com/Mr._Game_%26_Watch_(SSBU); Sonic (SSBU) - SmashWiki, https://www.ssbwiki.com/Sonic_(SSBU): quick rows only. None of these pages names a classic 0-to-death.
- Search snippets about Kazuya, https://www.invenglobal.com/articles/14413/kazuya-nerf-super-smash-bros-ultimate and https://eventhubs.com/news/2021/jul/27/kazuya-eight-ewgf-combo-ssbu: not opened, only used as search-result lead lines.

**Not verified:** exact percent ranges where Luigi's down throw combos and stops; Kazuya wall carry and "heat" (the SmashWiki page does not cover either); DI escape rates for Luigi and Kazuya; the Tekken and Street Fighter paragraph is general knowledge; Clover's chain length, escape rate for average players, and the current finisher numbers were taken from the owner's message and not checked in the game.
