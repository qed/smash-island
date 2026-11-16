# Algebralien Boss Rush: the owner's rules (2026-11-02; the design pass wf_52a9c96c-6f8 was briefed before the last two)

- ORDER: Two, Four, Nine, Six, Zero, X, One, Three, 2763 (nine bosses).
- LIVE DAYS (UTC): in a month where a weekday occurs five times, the last two occurrences of it, any weekday (31-day months: 22-24 and 29-31; 30-day: 22-23 and 29-30; leap Feb: 22 and 29; never in a 28-day Feb). Each live day opens the WHOLE rush.
- STOCKS (owner, mid-design): "you gain 2 stocks back EACH boss ... max of 6 stocks."  So defeating a boss gives the player +2 stocks, capped at 6 in total.
- BOSS HEALTH (owner): "all bosses (save for one) have health that starts at 1k, and finishes at 3k." So the nine bosses' health climbs from 1,000 (the first) to 3,000 (the last), with ONE boss as the exception (which one is not said: ask; the lead's guess is One, the secret boss, or 2763). The game's normal bosses are 185-340 hp, so the rush's numbers are about ten times those: the damage values and the fighter's hits must be considered (a 1k-3k boss with the game's usual hit sizes is a long fight: say how long) -- the design pass should state the expected length per boss and the whole run.
- The word "pipis" lifted the feature freeze for this event (2026-11-02).

## THE HEALTH CURVE (owner, 2026-11-02, final)
Two 1,000 | Four 1,200 | Nine 1,400 | Six 1,600 | Zero 1,800 | X 2,100 | One 2,400 | Three 2,700 | 2763 3,000.
(The owner earlier said "all bosses save for one" start at 1k and finish at 3k; which boss is the exception was not said: all nine values are given above, so the exception is probably a boss whose number does not follow the pattern (the steps are +200 for four bosses, then +300): ask once, low priority.)

## More rules (owner, 2026-11-02)
- START WITH 4 STOCKS (then +2 after each boss, maximum 6).
- THE RUSH'S STAGES ARE LARGER than the normal boss arenas. Two and Four (existing bosses) need a RUSH VERSION: "make the attacks adjust for larger stages for two and four, because you can just outrun them in their current state. they should be buffed four(get it?) this." So their attacks must cover a bigger arena (reach, speed, tracking, area, new patterns so a player cannot simply run away), i.e. BUFFED for the rush. The same must hold for every boss on a larger arena. (The design pass wf_52a9c96c-6f8 was briefed before these; reconcile.)

## THE OWNER ACCEPTED ALL OF THE DIRECTOR'S RECOMMENDATIONS (2026-11-02; spec.md has the 14 questions)
- RUN LENGTH: a damage-to-boss knob ALG_RUSH.dmgToBoss built at 1.0; the owner plays Two and Four at the first gate (G1) and sets it by feel.
- STAGE: one common stage 2,400 wide (2.2 screens), solid end walls, the camera framing boss and fighter, a 650 px leash, for all eight bosses (One keeps her own map).
- A DEFEAT: retry that boss with the stocks you walked in with, unlimited and counted; a clean clear (no retries) is a record.
- ONE BEFORE HER CHAIN: skip her slot until the player has beaten her (an eight-boss rush that grows to nine when she is unlocked; the page never prints a boss count).
- ONLINE: offline and solo at launch (bosses draw from plain state so online stays possible later).
- RELEASE: a hidden build behind RUSH_OPEN; the owner flips it after their own playthrough; go/no-go on Nov 18; fallback the Nov 29-30 window (flip on Nov 28). First live days Nov 22-23 (UTC).
- REWARDS: 10 tokens per boss the first time in a window, +60 for a clear, a 150 cap per window (a run of consecutive live days), and two reward-only looks (a card and a title) on the first clear.
- HP: all nine as the owner gave them; One 2,400 in the rush (her normal fight stays 2,000).
- ATTACKS: the owner's own picks override the spec's recommended five: Two SEVEN (Sun Hunt, Tower Row, Clap Full Span, Double Take, Lava Spin, Crater Landing, Moon Hail; NOT Hi Guys!), Four SEVEN (The Long Note, Zappies blue mark ahead, The Ripple, The Cactus Drive, Five Pairs of Arms, Soup's On!, + one from "Who Stole Donut's Diary?"). (The spec says LAVA SPIN would clash with 2,763's lava and CRATER LANDING with X's dive: the owner picked them anyway: build them, and adjust 2,763's and X's shapes if a clash shows.)
- PHASES: a per-boss phase cut (Six, X, Three cut once at 50%; the rest 66/33).
- MOVE-NAME POPUPS: off for every rush boss (Two and Four included).
- ART: fetch the about 20 wiki renders (Nine 11, Six 3, X 3, Three 3) with credits and the lead looks at each before it ships: NEEDS THE OWNER'S OK NAMING THE FILES BEFORE ANY DOWNLOAD (ask with the list: names, source, size).
- 2,763's DRAIN: specials silenced inside about 220 px of it.
- STILL TO CHOOSE: the attack options for Nine, Six, Zero, X, Three, 2,763 (eight each, in question boxes; One keeps her fight).


- 2026-11-02 owner rule: every boss has phases and ALL attacks get harder by phase, like Cobs (see attack-picks.md).
- 2026-11-10: Four's diary-slot attack is the owner's own: 8 mallets boomerang in a teardrop (out, to the side, back). Replaces EQUAL SHARES.
- 2026-11-10 OWNER: "the bosses are not hard enough! I want them to be a BIG challenge, something that players have to spend a couple attempts on." Chosen levers: (1) LESS REST between attacks, overlapping moves in later phases; (2) HITS HURT MORE, about 1.5x boss damage to the player; (3) FEWER STOCKS: start 3 (was 4), +1 per boss beaten (was +2), cap 5 (was 6); (4) COMBOS in every boss's LAST phase (two moves chained, each with its own tell). Not chosen: more boss HP. Every attack still keeps a visible tell and a real dodge (hard, not unfair).

## OWNER PLAY NOTE (2026-11-11)
"four can have undodgeable screechy in 3rd phase, and has little to no delay after the telegraph for zappies" -> sent to the Zero rework job (rush-zero2) to fix with dodge proofs.
"and screechy is nigh on impossimble in 3rd phase" -> Four's P3 screech: readable tell, a human-size dodge window, ~20-frame reaction gap after the previous move.
