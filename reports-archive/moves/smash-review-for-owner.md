# New smashes: review before merge (2026-11-13)

Not in today's push. Everything sits on branches, merged together on a preview branch `g-smash-preview` that passes all checks. Nothing is merged into the game you ship until you say so.

## Play them yourself
Run the preview build at http://localhost:8223 (the lead starts the "smash-preview-local" server). The full old-vs-new lists:
- Up/down smashes, 12 fighters: `updown-v2-oldnew.md`. Picture of all 24 props: `preview/updown-props-sheet.jpg`
- Main smashes, 7 fighters: `neutral-v2-oldnew.md`
- Final Smashes, 12 fighters: `finalsmash-v2-oldnew.md` (its "FIX ROUND" section is the latest)

## What was checked (all three sets)
- No other fighter or move in the game changed (state-hash proof).
- No hit is stronger than today's. Each set went through a juror and then fixes.
- 0 errors in CPU matches.
- Online: host and guest see the same thing (fake connections only; the live relay was never touched).
- No look-alikes under your rule: shape AND effect AND numbers.
- No sky drops.

## Things for you to decide
1. **Up/down smashes (12 fighters).** The juror said MERGE. Wins went 171 to 168, which is noise.
   - Leafy got leaf blades, not knives.
   - Five up smashes hit only overhead (anti-air).
   - Bomby's down smash is the closest to his own main smash: both burn, but the shape differs.
2. **Main smashes (7 fighters), after the jury fixes.**
   - Their up/down smashes are back to exactly today's.
   - Apple's win jump didn't hold up on a re-run.
   - Tissues won less (7 to 2 of 32).
   - **Bonesaw now slams down first when he uses it in the air.** Keep or remove?
3. **Final Smashes (12 fighters), after the jury fixes.**
   - Pickle and Bonesaw now have real escapes: a 44-frame warning. That makes them slower.
   - Woody is still hard to dodge.
   - **Box** hits 2-3 foes for 46% / 31% MORE than the old move (less on one foe). Keep or trim?
   - **Toothpaste** lands less now (a still foe takes 25 vs 61 before; a moving one 60 vs 73). Retune?
   - Rose, Box and Baseball land less on one foe than before.
   - Pickle is still "mark a spot, then blast", like a few others. OK?
4. **Nobody has looked closely at every prop in a real match yet.** The up/down sheet looked clean and flat. Pin's up smash prop is a thin white line, and Tennis Ball's are faint arcs.
