# Fighter stats: the final numbers, with balance before and after

The owner, 2026-10-18: "give each fighter stats", then "Character, then balance", the spread "8-12%, damage smaller", and on the draft, "Looks good". These are the numbers now in `FIGHTER_STATS` (index.html, branch g-stats2): the approved v2 numbers, then one balance step for the weak (marked ↑ in the tables). This replaces the draft's tables; the reasons are the draft's.

## The five stats

| Stat | What it changes | Above 1 | Below 1 |
|---|---|---|---|
| **Run** | ground speed (top speed and acceleration) | faster on foot | slower on foot |
| **Air** | air drift (steering speed while airborne) | steers farther | steers less |
| **Jump** | jump strength (height grows about with its square: 1.09 is about 19% higher) | higher jump | lower jump |
| **Fall** | how hard gravity pulls *on the way down* (the rise is untouched) | heavier and snappier, lands sooner | floaty, hangs in the air longer |
| **Dmg** | damage they deal (every hit, and the card numbers) | hits harder | hits softer |

- Run, air, jump and fall sit between 0.88 and 1.12; dmg between 1.00 and 1.05 (nobody hits softer).
- 95 of 102 fighters have a row; 7 stay flat at 1.00 (Loser, Marker, Taco, Match, Taco (II), Microphone, Salt).
- **Bold** is above 1, *italic* below 1, and ↑ marks the stat the balance step raised.

## How balance was measured

- 1v1, Hard bots (their trained playbooks), 3 stocks, items off. Every fighter played each of the 7 flat fighters on both sides with 2 seeds: 28 games each (`scripts/balance-1v1.mjs` focus mode, seed 7).
- The yardstick is the flat fighters on purpose: their stats did not change, so it is the same before and after.
- **Before** is origin/main as it stood on 2026-10-18 at 14:29 (a7e35a6): the stats system already in, every stat 1. It does not have this branch's thin-air fix (the float timer reset, gravFor), so Bubble's change (50.0% to 42.9%) carries that fix too, not only her stats. **After** is this branch with the final numbers. Same matches, same seeds. origin/main has moved on since: 69a394f is merged here (CTF wall jumps and push zones, the spin-aura and Remote Jam fixes, Steve Cobs), and origin/main is now at 86e227f (the CTF practice tutorial, not merged); the 1v1 panel was not re-run on either.
- The average was 35.1% before, 34.2% with the v2 numbers and 36.4% after the balance step. It is below 50% because three of the yardstick fighters are strong (Match, Taco, Loser).
- **Noise:** one fighter's rate over 28 games has a standard error of about 9.4 points, so a before/after change carries about 13 points of noise. One game is 3.6 points. Read a single fighter's change of under about 15 points as possibly dice; the group averages below are firmer.

## Battle for Dream Island (59 fighters)

| Fighter | Run | Air | Jump | Fall | Dmg | Before | After | Change | Why |
|---|---|---|---|---|---|---|---|---|---|
| **Firey** | 1.00 | 1.00 | **1.09** | *0.91* | 1.00 | 35.7% | 35.7% | +0.0 | Fire is light and rises: a higher jump and a slightly floaty fall (shared with Firey Jr.). |
| **Leafy** | **1.11** | 1.00 | *0.92* | *0.90* | 1.00 | 50.0% | 53.6% | +3.6 | BFDI's famous runner: top footspeed, and a leaf settles slowly. Built for the sprint, not the high jump (her one down). |
| **Needle** | 1.00 | **1.03↑** | **1.09** | **1.09** | 1.00 | 21.4% | 7.1% | -14.3 | Tall, thin steel needle: long legs give a higher hop, and metal drops point-first. |
| **Pin** | *0.94↑* | 1.00 | 1.00 | **1.09** | **1.04** | 10.7% | 17.9% | +7.1 | Heavy pushpin (w112) with a sharp point: slower on foot, drops hard, Point Pierce bites a little deeper. |
| **Snowball** | *0.91* | 1.00 | *0.92* | 1.00 | **1.05** | 25.0% | 28.6% | +3.6 | BFDI's self-proclaimed strongest, a muscle-bound bully: hits harder, but his big snow body is slow and earthbound. |
| **Bomby** | *0.94↑* | 1.00 | 1.00 | **1.10** | **1.04** | 53.6% | 50.0% | -3.6 | A heavy iron bomb (w120), slow-talking and slow-moving: falls like a dropped bomb, and his blasts carry a little extra. |
| **Bubble** | *0.91* | **1.09** | 1.00 | *0.89* | 1.00 | 50.0% | 42.9% | -7.1 | A soap bubble floats rather than walks: drifts well, sinks slowly, plods on the ground. A trade, no net gain. |
| **Teardrop** | **1.08** | 1.00 | 1.00 | **1.09** | 1.00 | 42.9% | 60.7% | +17.9 | A small, silent water drop: drops fast like a falling droplet, quick and quiet on her feet. |
| **Flower** | 1.00 | 1.00 | 1.00 | **1.09** | **1.04** | 53.6% | 60.7% | +7.1 | BFDI's violent diva who crushes contestants: hits a touch harder, comes down heavy for Stomp Quake. |
| **Tennis Ball** | 1.00 | 1.00 | **1.09** | 1.00 | 1.00 | 50.0% | 53.6% | +3.6 | A bouncy felt ball and calm tinkerer: a springier jump, nothing else. |
| **Blocky** | *0.92* | 1.00 | 1.00 | **1.09** | 1.00 | 42.9% | 57.1% | +14.3 | A solid cube (w110) that cannot roll: a bit slow on foot, lands like a brick. |
| **Coiny** | **1.02↑** | 1.00 | 1.00 | **1.09** | 1.00 | 35.7% | 35.7% | +0.0 | A dense copper penny: drops fast. His slap-fight speed lives in his kit, not his stats. |
| **Pen** | 1.00 | **1.09** | **1.09** | 1.00 | 1.00 | 25.0% | 35.7% | +10.7 | Light, tall, thin plastic pen: a higher jump and better drift to keep his Cap Shot angles. |
| **Pencil** | **1.08** | 1.00 | 1.00 | 1.00 | 1.00 | 71.4% | 71.4% | +0.0 | The peppy, bossy leader of the Alliance (BFDI): a quicker step. |
| **Golf Ball** | *0.94↑* | **1.09** | 1.00 | **1.09** | 1.00 | 67.9% | 75.0% | +7.1 | Dense and brainy (w108), a thinker, not an athlete: slower run, drops hard. Real golf balls carry far on their dimples, so she drifts well. |
| **Rocky** | *0.91* | 1.00 | 1.00 | **1.10** | 1.00 | 64.3% | 57.1% | -7.1 | A silent rock that barely moves in canon: slow to run, falls like a stone. |
| **Book** | 1.00 | **1.08** | 1.00 | *0.92* | 1.00 | 28.6% | 35.7% | +7.1 | Flat pages catch the air: slightly better drift and a gentler fall. |
| **Fries** | **1.08** | 1.00 | 1.00 | *0.92* | 1.00 | 57.1% | 50.0% | -7.1 | A light cardboard carton and a driven, competitive BFB contestant: a touch quicker, a touch lighter in the air. |
| **Gelatin** | *0.95↑* | 1.00 | **1.10** | 1.00 | 1.00 | 50.0% | 42.9% | -7.1 | A jiggly block of gelatin: bounces higher off the ground, but wobbles along rather than runs. |
| **Nickel** | *0.92* | 1.00 | 1.00 | **1.09** | 1.00 | 53.6% | 50.0% | -3.6 | A deadpan nickel, a bigger coin than Coiny: dense, falls hard, a bit slower on foot. |
| **Puffball** | *0.91* | **1.09** | 1.00 | *0.89* | 1.00 | 75.0% | 64.3% | -10.7 | Legless canon flyer, light as fluff (w46): floats down slowly, drifts well, slow when grounded. A trade (the owner sees her win often). |
| **Ruby** | *0.92* | 1.00 | 1.00 | **1.09** | 1.00 | 53.6% | 57.1% | +3.6 | A solid gemstone, the durable brawler: heavy, drops hard, a little slower to get going. |
| **Yellow Face** | **1.10↑** | 1.00 | 1.00 | 1.00 | 1.00 | 25.0% | 14.3% | -10.7 | The hyperactive BUY NOW! infomercial pitchman, all energy: a quicker step. |
| **Barf Bag** | 1.00 | **1.09** | 1.00 | *0.91* | 1.00 | 14.3% | 32.1% | +17.9 | A light paper bag that catches the air: drifts farther and settles slowly. |
| **Basketball** | 1.00 | **1.03↑** | **1.10** | **1.08** | 1.00 | 28.6% | 14.3% | -14.3 | A regulation basketball (Self-Dribble kit): a big springy jump, back down hard like a dribble. |
| **Bell** | *0.94↑* | 1.00 | 1.00 | **1.10** | 1.00 | 46.4% | 28.6% | -17.9 | A brass-and-copper bell (in-game canon note), a w112 heavy: slower feet, falls heavy. |
| **Bracelety** | **1.11↑** | 1.00 | **1.08** | *0.92* | 1.00 | 32.1% | 7.1% | -25.0 | A light hoop (w70), BFB's upbeat singer with a cheer-sign kit: quick feet and a springy jump. |
| **Fanny** | *0.95↑* | **1.11** | **1.08** | *0.90* | 1.00 | 21.4% | 32.1% | +10.7 | An electric fan (BFB) whose blades blow wind (Gust kit): strong drift, a floaty fall on her own updraft. She sits on a base, so her run dips. |
| **Gaty** | *0.95↑* | 1.00 | 1.00 | **1.09** | 1.00 | 21.4% | 28.6% | +7.1 | A sturdy garden gate (BFB, w101) that swings rather than sprints: a bit slower, heavier fall. |
| **Grassy** | **1.08** | 1.00 | 1.00 | *0.91* | 1.00 | 25.0% | 25.0% | +0.0 | A small, light patch of grass (BFB, w62); Grasstree gives him heft, so his base form is quick and a bit floaty. |
| **Lightning** | **1.11** | 1.00 | *0.94↑* | **1.09** | 1.00 | 82.1% | 64.3% | -17.9 | A lightning bolt (BFB): very fast and very light (w54). A bolt strikes down, not up: snappy fall, lower jump. |
| **Liy** | **1.12↑** | 1.00 | **1.08** | 1.00 | 1.00 | 42.9% | 25.0% | -17.9 | A light switch (BFB) whose kit is a LIGHTS ON blitz-grab dash: a faster run and a peppier hop. |
| **Lollipop** | *0.92* | 1.00 | **1.09** | 1.00 | 1.00 | 60.7% | 53.6% | -7.1 | A candy head on a single leg: pogo hops and a Candy Twirl rise, a little slower on the ground. |
| **Loser** (yardstick) | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 72.1% | 73.2% | +1.1 | BFDI's modest do-everything athlete: the all-rounder, so every stat stays at 1.00, the baseline the rest are measured against. |
| **Marker** (yardstick) | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 65.5% | 64.7% | -0.8 | Nothing in canon or in his ink-debuff kit points to speed, weight or power. |
| **Money** | 1.00 | **1.12↑** | 1.00 | *0.89* | 1.00 | 7.1% | 7.1% | +0.0 | A paper bill (BFDIE 1) whose up-special is Drifting Bill: drifts well and falls slowly, like Paper. |
| **Naily** | **1.11↑** | 1.00 | **1.08** | **1.09** | 1.00 | 28.6% | 28.6% | +0.0 | A thin steel nail (TPOT): light but metal, so a fast fall. The I NAILED IT! dash wants quick feet. |
| **Pillow** | *0.95↑* | **1.09** | **1.08** | *0.89* | 1.00 | 28.6% | 32.1% | +3.6 | A soft pillow; her card says floaty recovery and a springy Fluff Bounce. A soft body flops along on the ground. |
| **Remote** | **1.09** | 1.00 | 1.00 | **1.08** | 1.00 | 50.0% | 57.1% | +7.1 | A battery-powered robot remote (BFB) in dense plastic: heavier fall; quicker feet offset her reserve-power slowdown. |
| **Rose** | 1.00 | **1.08** | 1.00 | *0.92* | 1.00 | 35.7% | 53.6% | +17.9 | A light flower on a thin stem with a thorn whip: a touch floaty, good drift. |
| **Saw** | **1.02↑** | 1.00 | 1.00 | **1.09** | **1.05** | 25.0% | 14.3% | -10.7 | A metal handsaw (in-game canon note): falls heavy and the teeth cut deep. |
| **Taco** (yardstick) | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 77.6% | 77.9% | +0.3 | Nothing in canon makes her fast, heavy or floaty. |
| **TV** | *0.94↑* | 1.00 | 1.00 | **1.10** | 1.00 | 17.9% | 25.0% | +7.1 | A big TV set (w117), among the heaviest: slow feet, falls like a brick. |
| **Woody** | **1.10** | 1.00 | 1.00 | *0.90* | 1.00 | 39.3% | 46.4% | +7.1 | Balsa wood (BFDI): featherlight, fragile and terrified. Panic-running is his whole kit (Fraidy Dash): fast run, floaty fall. |
| **Toothpaste** | **1.08** | **1.08** | 1.00 | 1.00 | 1.00 | 28.6% | 25.0% | -3.6 | A hotheaded tube (TPOT). Her kit is traps and a teleport, nothing heavy: a slightly quicker run and drift. |
| **Dora** | **1.09** | 1.00 | 1.00 | 1.00 | 1.00 | 14.3% | 25.0% | +10.7 | A small flurry rushdown (w69) whose Energy Boost card is about running: quick feet. |
| **Match** (yardstick) | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 81.3% | 80.8% | -0.5 | A thin matchstick (BFDI); nothing makes her fast or heavy. |
| **David** | **1.10↑** | 1.00 | 1.00 | **1.10** | 1.00 | 10.7% | 17.9% | +7.1 | A stick figure with real running legs (BFDI); his card is a super-heavy ground-pounder: decent run, slams down hard. |
| **Firey Jr.** | 1.00 | **1.11↑** | 1.00 | *0.91* | 1.00 | 53.6% | 53.6% | +0.0 | Firey's little cousin (BFB), small and light (w70). Heat rises: nimble drift, a slightly floaty fall. |
| **Fern** | 1.00 | **1.10↑** | **1.09** | 1.00 | 1.00 | 14.3% | 21.4% | +7.1 | A fern (TPOT 24) whose Pole Jump springs extra high, and the fronds glide: better jump and drift. |
| **Ruler** | 1.00 | **1.09** | 1.00 | *0.91* | 1.00 | 57.1% | 67.9% | +10.7 | A thin, flat ruler (TPOT): light and a little floaty, with the drift her Sniper kit needs to kite. |
| **Sidewalky** | *0.94↑* | 1.00 | 1.00 | **1.10** | **1.05** | 32.1% | 32.1% | +0.0 | A slab of concrete pavement (TPOT, w110): slow on foot, drops like a brick, and Pavement Slam hits like one. |
| **Balloony** | *0.91* | **1.11** | 1.00 | *0.88* | 1.00 | 46.4% | 42.9% | -3.6 | A balloon (BFB) that floats and zips on air jets (Air Leak): the best drift, the floatiest fall, a bit slow on the ground. |
| **Roboty** | *0.89* | 1.00 | *0.92* | **1.11** | **1.04** | 46.4% | 50.0% | +3.6 | A boxy robot on treads, the 'immobile tank' (BFDI wiki), w134: slow run, weak jump, heavy fall, and a tank's blows land heavy. |
| **Profily** | 1.00 | **1.11↑** | **1.08** | *0.92* | 1.00 | 21.4% | 46.4% | +25.0 | A flat profile-picture icon (TPOT) with a light 2D body: a higher hop, more drift, a softer fall. |
| **Tree** | *0.89* | 1.00 | 1.00 | **1.10** | **1.04** | 39.3% | 42.9% | +3.6 | A big, timid, rooted tree (BFDI wiki), w138: slow run, falls heavy, and a dropped branch (Timber) lands hard. |
| **Ice Cube** | **1.10** | **1.08** | *0.92* | 1.00 | 1.00 | 32.1% | 42.9% | +10.7 | Small, slippery, fragile ice (BFDI wiki): slides fast on the ground and in the air, but her short body jumps lower. |
| **Cake** | *0.92* | 1.00 | 1.00 | **1.09** | 1.00 | 28.6% | 35.7% | +7.1 | The dense, layered Cake at Stake cake (BFDIA): a touch slow, falls a little harder. |
| **Donut** | **1.09** | 1.00 | *0.94↑* | 1.00 | 1.00 | 53.6% | 42.9% | -10.7 | A rolling ring of dough (Sprinkle Roll): quick along the ground, but a heavy pastry jumps lower. A trade. |

## Inanimate Insanity (43 fighters)

| Fighter | Run | Air | Jump | Fall | Dmg | Before | After | Change | Why |
|---|---|---|---|---|---|---|---|---|---|
| **Balloon** | *0.94↑* | **1.10** | 1.00 | *0.91* | 1.00 | 7.1% | 17.9% | +10.7 | A helium balloon (II wiki: Levitation, Slow Falling): lift and drift like Balloony, slow on foot. His kit already cuts his fall to 0.55x, so fall dips only a little. |
| **Bomb** | *0.92* | 1.00 | 1.00 | **1.09** | **1.04** | 53.6% | 64.3% | +10.7 | A round, heavy bomb who explodes on contact (II wiki): a bit slow, falls hard, and his blasts hit a little harder, like Bomby's. |
| **Knife** | **1.09** | 1.00 | 1.00 | **1.08** | 1.00 | 10.7% | 32.1% | +21.4 | Sharp, brash and quick-tempered (II wiki): quicker feet, and a metal blade drops firmly. His bite stays in his kit. |
| **Lightbulb** | **1.09** | *0.95↑* | **1.08** | 1.00 | 1.00 | 75.0% | 64.3% | -10.7 | Hyperactive and ditzy ('OMGA!', II wiki): a faster run and a higher jump, but bouncing off the walls is hard to steer in the air. |
| **Paintbrush** | 1.00 | **1.09** | 1.00 | 1.00 | 1.00 | 32.1% | 35.7% | +3.6 | A slim, high-strung artist (II wiki): a light brush flicks through the air. Rage already scales their hits, so dmg stays 1. |
| **Taco (II)** (yardstick) | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 56.3% | 60.3% | +4.0 | Canon (scheming actress, retractable arms, II wiki) says nothing about how she moves; her arms and Lemon Spit cover reach. |
| **Bow** | *0.91* | **1.10** | 1.00 | *0.89* | 1.00 | 67.9% | 64.3% | -3.6 | A ghost who levitates (II wiki, Abilities: As a Ghost): floaty fall and strong drift, and like every hoverer, slower on foot. |
| **Marshmallow** | 1.00 | **1.09** | 1.00 | *0.90* | 1.00 | 35.7% | 28.6% | -7.1 | 'Never used gravity properly' (II wiki): a floatier fall and more drift. |
| **Apple** | 1.00 | **1.03↑** | **1.09** | 1.00 | 1.00 | 25.0% | 14.3% | -10.7 | A small, sunny, ditzy apple (II wiki), a light fruit always bouncing around: a higher jump. |
| **Baseball** | **1.08** | *0.94↑* | **1.09** | **1.10** | 1.00 | 21.4% | 10.7% | -10.7 | The sporty one, 'all legs, no arms' (II wiki, kit): strong legs to run and jump, but a dense w110 ball falls hard and steers little once airborne. |
| **Pickle** | *0.92* | 1.00 | 1.00 | **1.10** | 1.00 | 67.9% | 71.4% | +3.6 | A gloomy veteran whose special is a belly-flop dive (II wiki, kit): falls heavy. Hurt-scaling already boosts his hits. |
| **Nickel (II)** | *0.92* | 1.00 | 1.00 | **1.09** | 1.00 | 14.3% | 35.7% | +21.4 | A dry, unbothered snarker (II wiki) and a dense metal coin: unhurried on foot, falls hard, like the other coins. |
| **Paper** | 1.00 | **1.12↑** | 1.00 | *0.89* | 1.00 | 14.3% | 28.6% | +14.3 | A single sheet of paper (II wiki), among the lightest at w64: flutters down slowly and drifts far. |
| **Microphone** (yardstick) | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 51.6% | 57.1% | +5.5 | A loud performer (II wiki) with nothing in canon about how she moves; her Loud/Quiet button already changes her power. |
| **Salt** (yardstick) | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 49.5% | 46.6% | -2.9 | A gentle salt shaker; Pepper echoes every move (II wiki: inseparable duo), so Salt's own numbers stay neutral. |
| **Test Tube** | *0.95↑* | 1.00 | 1.00 | 1.00 | 1.00 | 39.3% | 25.0% | -14.3 | A brainy lab scientist (II wiki), no athlete: a touch slow on foot. Her tracking darts do the chasing. |
| **Box** | **1.02↑** | 1.00 | 1.00 | **1.10** | 1.00 | 21.4% | 28.6% | +7.1 | II wiki: she sinks straight to the bottom of any water (the 'sinker' Lifering dives for), so she falls heavy. |
| **Trophy** | *0.95↑* | 1.00 | 1.00 | **1.09** | 1.00 | 14.3% | 25.0% | +10.7 | Cast gold, proud and showy (II): a heavy metal body falls hard and struts rather than sprints. |
| **Goo** | *0.91* | **1.09** | 1.00 | 1.00 | 1.00 | 25.0% | 39.3% | +14.3 | A blob that oozes along the floor but stretches out to grab (All Play and No Work). |
| **Lifering** | **1.09** | 1.00 | **1.08** | *0.91* | 1.00 | 25.0% | 25.0% | +0.0 | The lifeguard sprints and dives in for a sinking Box (Tri Your Best); a foam ring floats, so his fall is a bit floaty. |
| **Bonesaw** | *0.94↑* | 1.00 | 1.00 | **1.09** | **1.04** | 14.3% | 17.9% | +3.6 | A saw cuts in strokes and 'he is never fast' (S4E1); a metal variant of Knife that cuts to the core. |
| **Spikey** | 1.00 | 1.00 | 1.00 | **1.09** | **1.05↑** | 21.4% | 21.4% | +0.0 | Iron spikes on a ball that doesn't give (II4): dense, so it falls hard, and the spikes sting. |
| **Candle** | *0.91* | **1.09** | 1.00 | *0.90* | 1.00 | 25.0% | 42.9% | +17.9 | A weary wax candle with telekinesis (Inner-Flame): slow on her feet, but she hovers and drifts on mind power. |
| **Cammy** | 1.00 | 1.00 | 1.00 | **1.08** | 1.00 | 32.1% | 39.3% | +7.1 | A stiff camera body falls straight down; canon says nothing about his speed. |
| **Cheesy** | **1.12↑** | 1.00 | **1.08** | 1.00 | 1.00 | 28.6% | 14.3% | -14.3 | 'All puns and no brakes', the cheese wedge who kicks a soccer ball (Kick! Soccer! Pun!): quick feet and a happy hop. |
| **Dough** | 1.00 | **1.10↑** | 1.00 | *0.91* | 1.00 | 21.4% | 25.0% | +3.6 | Soft all the way through, and copies Bow seconds later (II wiki): a bendy, slightly floaty body. |
| **Fan** | 1.00 | 1.00 | 1.00 | *0.90* | 1.00 | 60.7% | 71.4% | +10.7 | An electric fan: the updraft from his own blades softens his fall (same as Fanny). He is strong, so that trade is all. |
| **Soap** | **1.12↑** | **1.08** | 1.00 | 1.00 | 1.00 | 35.7% | 17.9% | -17.9 | A slick bar of soap slides along (she slipped in the Cherries' olive oil, Fan the Flames). |
| **Tissues** | *0.95↑* | **1.09** | 1.00 | *0.90* | 1.00 | 21.4% | 35.7% | +14.3 | Very sickly (II wiki, Personality), so a touch slow on foot; light tissue paper floats and drifts. |
| **Yin-Yang** | 1.00 | **1.11↑** | 1.00 | 1.00 | 1.00 | 3.6% | 14.3% | +10.7 | Mindful positioning lets one half take full control (II wiki, Abilities), which reads as precise air control. |
| **Starfruit** | *0.92* | **1.08** | 1.00 | 1.00 | 1.00 | 28.6% | 39.3% | +10.7 | The Has-Been (Cob Mentality) is past his sprinting days; his star-shaped body catches the air. |
| **Blueberry** | *0.95↑* | 1.00 | 1.00 | **1.08** | **1.04** | 10.7% | 7.1% | -3.6 | A strongman who lifts foes and slams them (Palanquin Catch): the muscle hits harder, weighs his fall down, slows his run. |
| **Cherries** | *0.95↑* | 1.00 | **1.09** | 1.00 | 1.00 | 14.3% | 14.3% | +0.0 | Two cherries bouncing on one stem; two bodies keeping step (and slipping in their own oil) run slightly slow. |
| **Clover** | 1.00 | **1.10** | **1.08** | *0.89* | 1.00 | 50.0% | 46.4% | -3.6 | A four-leaf clover, light as a leaf: floats and drifts, and a lucky bounce adds a little jump. |
| **Jack** | 1.00 | **1.11↑** | 1.00 | *0.91* | 1.00 | 3.6% | 21.4% | +17.9 | A stiff playing card (II4): flat and light, so he flutters down and glides sideways. |
| **Magnet** | *0.94↑* | 1.00 | 1.00 | **1.10** | 1.00 | 57.1% | 25.0% | -32.1 | One of the heaviest (w118), a solid metal magnet: lumbers on foot and drops hard. |
| **MeTag** | **1.08** | 1.00 | 1.00 | **1.08** | 1.00 | 42.9% | 46.4% | +3.6 | A tracker and enforcer (II wiki: the logo glows while tracking) who runs a target down; a dense device falls firmly. |
| **Poppy** | 1.00 | **1.03↑** | **1.10** | *0.91* | 1.00 | 35.7% | 21.4% | -14.3 | A popcorn kernel in a pan, all enthusiasm (II4): pops up high, and puffed popcorn comes down light. |
| **Silver Spoon** | *0.92* | 1.00 | 1.00 | **1.09** | 1.00 | 32.1% | 42.9% | +10.7 | Solid silver that turns gold at will (II wiki): the metal body falls hard, and the pampered rich kid ambles. |
| **Tapey** | 1.00 | **1.10↑** | 1.00 | *0.92* | 1.00 | 42.9% | 39.3% | -3.6 | A light plastic cassette (II wiki, Appearance): the flat body drifts and settles gently. |
| **Tea Kettle** | 1.00 | 1.00 | 1.00 | **1.09** | 1.00 | 25.0% | 25.0% | +0.0 | A kettle full of water drops heavily. She is strong, so no speed is added: one trade only. |
| **Teddy Bear** | *0.92* | **1.08** | 1.00 | *0.91* | 1.00 | 21.4% | 28.6% | +7.1 | A stuffed plush, soft and floaty; she tires out ('Ugh, I'm tired!', War De Guacamole), so her run is a bit slower. |
| **Bot** | **1.10↑** | 1.00 | **1.10** | 1.00 | 1.00 | 32.1% | 14.3% | -17.9 | II wiki: Bot can stretch their legs at will and kick with them: long strides and springy jumps. |

## The balance step

Following "Character, then balance" and "buff the weak, never nerf the strong": everyone who **dropped 10 or more points** with the v2 numbers, or **ended under 25%**, got one step up, chosen by character:
- a run, air or jump below 1 was given back 0.03 (the heavy bodies' slow run first, as the draft planned: "they are the first to give back");
- otherwise their own up stat +0.02 (run or air; never past 1.12);
- **never more jump**: across the panel, the 23 fighters with a jump above 1 lost 7.4 points on average (±2.8) while those with no jump change gained 1.6 (±1.6). So a jump-only fighter got air 1.03 instead (Basketball, Poppy, Apple, Needle);
- Spikey (no run or air to lean on) got dmg 1.05; Coiny, Box and Saw got run 1.02.

Nobody was lowered. Re-measured on the same matches, the nudged fighters gained 4.1 points on average (single fighters swing by the noise). The four who were strong before the stats dropped too; they are below the table.

| Fighter | Step | Before | v2 | After |
|---|---|---|---|---|
| Apple | air 1.00 → 1.03 | 25.0% | 14.3% | 14.3% |
| Balloon | run 0.91 → 0.94 | 7.1% | 17.9% | 17.9% |
| Baseball | air 0.91 → 0.94 | 21.4% | 21.4% | 10.7% |
| Basketball | air 1.00 → 1.03 | 28.6% | 3.6% | 14.3% |
| Bell | run 0.91 → 0.94 | 46.4% | 35.7% | 28.6% |
| Blueberry | run 0.92 → 0.95 | 10.7% | 17.9% | 7.1% |
| Bomby | run 0.91 → 0.94 | 53.6% | 39.3% | 50.0% |
| Bonesaw | run 0.91 → 0.94 | 14.3% | 17.9% | 17.9% |
| Bot | run 1.08 → 1.10 | 32.1% | 17.9% | 14.3% |
| Box | run 1.00 → 1.02 | 21.4% | 14.3% | 28.6% |
| Bracelety | run 1.09 → 1.11 | 32.1% | 10.7% | 7.1% |
| Cheesy | run 1.10 → 1.12 | 28.6% | 21.4% | 14.3% |
| Cherries | run 0.92 → 0.95 | 14.3% | 3.6% | 14.3% |
| Coiny | run 1.00 → 1.02 | 35.7% | 25.0% | 35.7% |
| David | run 1.08 → 1.10 | 10.7% | 21.4% | 17.9% |
| Donut | jump 0.91 → 0.94 | 53.6% | 35.7% | 42.9% |
| Dough | air 1.08 → 1.10 | 21.4% | 14.3% | 25.0% |
| Fanny | run 0.92 → 0.95 | 21.4% | 21.4% | 32.1% |
| Fern | air 1.08 → 1.10 | 14.3% | 17.9% | 21.4% |
| Firey Jr. | air 1.09 → 1.11 | 53.6% | 39.3% | 53.6% |
| Gaty | run 0.92 → 0.95 | 21.4% | 21.4% | 28.6% |
| Gelatin | run 0.92 → 0.95 | 50.0% | 39.3% | 42.9% |
| Golf Ball | run 0.91 → 0.94 | 67.9% | 53.6% | 75.0% |
| Jack | air 1.09 → 1.11 | 3.6% | 17.9% | 21.4% |
| Lightbulb | air 0.92 → 0.95 | 75.0% | 64.3% | 64.3% |
| Lightning | jump 0.91 → 0.94 | 82.1% | 57.1% | 64.3% |
| Liy | run 1.10 → 1.12 | 42.9% | 21.4% | 25.0% |
| Magnet | run 0.91 → 0.94 | 57.1% | 42.9% | 25.0% |
| Money | air 1.10 → 1.12 | 7.1% | 7.1% | 7.1% |
| Naily | run 1.09 → 1.11 | 28.6% | 7.1% | 28.6% |
| Needle | air 1.00 → 1.03 | 21.4% | 17.9% | 7.1% |
| Paper | air 1.10 → 1.12 | 14.3% | 14.3% | 28.6% |
| Pillow | run 0.92 → 0.95 | 28.6% | 21.4% | 32.1% |
| Pin | run 0.91 → 0.94 | 10.7% | 21.4% | 17.9% |
| Poppy | air 1.00 → 1.03 | 35.7% | 25.0% | 21.4% |
| Profily | air 1.09 → 1.11 | 21.4% | 17.9% | 46.4% |
| Saw | run 1.00 → 1.02 | 25.0% | 10.7% | 14.3% |
| Sidewalky | run 0.91 → 0.94 | 32.1% | 14.3% | 32.1% |
| Soap | run 1.10 → 1.12 | 35.7% | 21.4% | 17.9% |
| Spikey | dmg 1.04 → 1.05 | 21.4% | 21.4% | 21.4% |
| Tapey | air 1.08 → 1.10 | 42.9% | 32.1% | 39.3% |
| Test Tube | run 0.92 → 0.95 | 39.3% | 21.4% | 25.0% |
| Tissues | run 0.92 → 0.95 | 21.4% | 21.4% | 35.7% |
| Trophy | run 0.92 → 0.95 | 14.3% | 17.9% | 25.0% |
| TV | run 0.91 → 0.94 | 17.9% | 10.7% | 25.0% |
| Yellow Face | run 1.08 → 1.10 | 25.0% | 14.3% | 14.3% |
| Yin-Yang | air 1.09 → 1.11 | 3.6% | 10.7% | 14.3% |

**The four who were strong before the stats** (review, 2026-10-19: "never nerf the strong" holds for them too). Lightning, Golf Ball, Puffball and Lightbulb all dropped with the v2 numbers. They were played again on a second set of matches (seed 4242, 28 more games each against the same yardstick, before and after) and pooled with the first, 56 games each; a fighter's change then carries about 9 points of noise:

| Fighter | Step | Before | v2 | Final |
|---|---|---|---|---|
| Lightning | jump 0.91 → 0.94 | 80.4% | 58.9% | 71.4% |
| Golf Ball | run 0.91 → 0.94 | 75.0% | 53.6% (first set) | 76.8% |
| Lightbulb | air 0.92 → 0.95 | 73.2% | 64.3% (first set) | 62.5% |
| Puffball | none: the v2 numbers | 71.4% | 67.9% | 67.9% |

- **Lightning** (-25 with v2 on the first set; the second set confirmed it) keeps her step: 8.9 points under her old rate, inside the noise. **Golf Ball** keeps hers and is back where she was.
- **Puffball's** step (run 0.94) overshot: 89.3% on the first set, 14 points over her old rate. Without it she is 3.6 points under it, inside the noise, so she keeps the v2 numbers.
- **Lightbulb, for the owner:** with her step she is still 10.7 points under her old rate (73% to 62.5%, about one standard error), and still far above the middle (the average is about 36%). One more step on top, run 1.09 → 1.12, measured 57.1% (no gain), so it was not kept. The choices: leave her as she is (a strong fighter a little less strong), give back more air (0.95 → 0.98, deeper inside the band, see below), or retrain her playbook on the new numbers.

**The step pulls stats back toward 1 (for the owner).** In the v2 numbers every run, air, jump and fall was either 1 or 8-12% away from it ("spread 8-12%"). A give-back of 0.03 lands inside that band, so 29 values now sit between 0.92 and 1.08: Coiny, Box and Saw run 1.02; Apple, Basketball, Needle and Poppy air 1.03; Test Tube run 0.95 (her only stat); Donut and Lightning jump 0.94; Baseball air 0.94; Lightbulb air 0.95; and run 0.94 or 0.95 on Pin, Bomby, Bell, TV, Sidewalky, Balloon, Bonesaw, Magnet, Golf Ball, Gelatin, Fanny, Gaty, Pillow, Trophy, Tissues, Blueberry and Cherries. That is inside the brief's bounds (0.88-1.12) but softer than the spread and the draft's characters. If the band should hold, the same help can come from the other side instead: push a stat that is already up (a 1.09 run to 1.12), or add a new trade of 8% or more; each needs its own re-measure.

## Over 65% (for the owner)

- **Match** 80.8% (a flat yardstick fighter: no stats; this is its rate against the whole roster)
- **Taco** 77.9% (a flat yardstick fighter: no stats; this is its rate against the whole roster)
- **Golf Ball** 75.0% (before 67.9%)
- **Loser** 73.2% (a flat yardstick fighter: no stats; this is its rate against the whole roster)
- **Pencil** 71.4% (before 71.4%)
- **Pickle** 71.4% (before 67.9%)
- **Fan** 71.4% (before 60.7%)
- **Ruler** 67.9% (before 57.1%)
- Pooled with the second set of matches (seed 4242, 56 games each): Lightning 71.4% (before 80.4%), Golf Ball 76.8% (before 75.0%) and Puffball 67.9% (before 71.4%) are over 65% too; Lightbulb is 62.5% (before 73.2%).

Nobody strong was lowered. Golf Ball is over after the step that gave back her v2 drop (both sets pooled: 76.8% against 75.0% before). Pencil (run 1.08), Pickle (run 0.92, fall 1.10), Fan (fall 0.90) and Ruler (air 1.09, fall 0.91) are over 65% on this yardstick; Pencil and Pickle were already 71% and 68% before the stats.

## Still under 25%

On this yardstick the average is about 36%, so 25% is the bottom third, not the far tail. Most of these were already under 25% on the live game, before any stats:
- Needle 7.1% (before 21.4%)
- Blueberry 7.1% (before 10.7%)
- Bracelety 7.1% (before 32.1%)
- Money 7.1% (before 7.1%)
- Baseball 10.7% (before 21.4%)
- Cheesy 14.3% (before 28.6%)
- Bot 14.3% (before 32.1%)
- Yellow Face 14.3% (before 25.0%)
- Apple 14.3% (before 25.0%)
- Saw 14.3% (before 25.0%)
- Yin-Yang 14.3% (before 3.6%)
- Basketball 14.3% (before 28.6%)
- Cherries 14.3% (before 14.3%)
- Pin 17.9% (before 10.7%)
- David 17.9% (before 10.7%)
- Soap 17.9% (before 35.7%)
- Balloon 17.9% (before 7.1%)
- Bonesaw 17.9% (before 14.3%)
- Poppy 21.4% (before 35.7%)
- Spikey 21.4% (before 21.4%)
- Fern 21.4% (before 14.3%)
- Jack 21.4% (before 3.6%)

The ones the stats themselves cost the most, even after the step: Bracelety, Needle, Bot, Soap, Cheesy, Basketball and Poppy. Six of the seven have a jump above 1 (see above): if the owner wants, bringing those jumps back toward 1.04 is the obvious next lean, or retraining their playbooks on the new jump.

## Capture the Flag

The CPU route graphs are prebuilt on the shared numbers (every stat 1), so with stats some of their moves cannot be made the way the CPU takes them: a lower jump or a heavier fall comes up short of a ledge, and a faster run, a floatier fall or a higher jump sails past a narrow one or meets a ceiling. A CPU whose run, air, jump or fall is not 1 has each jump and drop of its paths checked with its own numbers, and a move it cannot make is left out of its routes. With the final numbers, on all 33 shipped graphs, every 10th of their 47,459 jump and drop moves checked (4,762 moves per fighter, so a rate carries about 0.3 points of noise; the worst graph counts only graphs with 100 or more sampled moves).

| Fighter | Moves turned down, carrying a flag | Free | Worst graph (carrying) |
|---|---|---|---|
| Roboty (run 0.89, jump 0.92, fall 1.11) | 3.4% | 0.9% | oak~ 6.1% |
| Lightning (run 1.11, jump 0.94, fall 1.09) | 5.1% | 3.3% | oak.l 13.1% |
| Leafy (run 1.11, jump 0.92, fall 0.90) | 5.0% | 3.6% | oak~.l 12.0% |
| Ice Cube (run 1.10, air 1.08, jump 0.92) | 4.8% | 3.3% | oak 11.7% |
| Snowball (run 0.91, jump 0.92) | 1.9% | 1.0% | castle.l 4.1% |
| Donut (run 1.09, jump 0.94) | 4.6% | 3.3% | oak~.l 12.4% |
| Cheesy and Liy (run 1.12, jump 1.08) | 4.3% | 4.3% | oak 11.3% |
| Bracelety (run 1.11, jump 1.08, fall 0.92) | 4.2% | 3.9% | oak 11.3% |
| Naily (run 1.11, jump 1.08, fall 1.09) | 4.2% | 3.6% | oak 11.3% |
| Bot (run 1.10, jump 1.10) | 4.1% | 3.7% | oak 11.3% |
| Basketball (air 1.03, jump 1.10, fall 1.08) | 0.8% | 1.4% | oak~.s 2.1% |
| Box (run 1.02, fall 1.10) | 4.4% | 3.1% | oak.l 11.6% |

Off the oak (see below), a fighter loses 0.6-3.0% of the moves carrying a flag: the low jumpers the most (Roboty 3.0%, Leafy 2.7%), the fast high jumpers (Cheesy, Liy, Bracelety, Naily, Bot) about 2%, as they sail past narrow ledges and meet ceilings the plan passed under. A turned-down move is not a lost place (see "Never the last way").

**The oak's wind (for the lead, not the stats):** on the oak graphs (both sides, every band) every fighter whose run is above their air (Lightning, Leafy, Ice Cube, Donut, Cheesy, Liy, Bracelety, Naily, Bot, Box) has about 10-11% of the moves turned down, against 1-5% for the others and about 2-3% for everyone on the other five maps. A run of only 1.02 does it (Box), and a fighter whose air rises with the run does not. Those moves ride the oak's wind far farther than the game lets anyone (one straight-up jump crosses 2,300 px): the route simulation (`ctfNavZoneFx`, used by the graph builder, the live look-ahead and the check) still adds the wind without the cap the push-zone change gave the game (`applyZone`: at most WIND_DRIFT, origin/main 7835434), and leaves the speed uncapped in the air when nothing is held; only the running-jump ease in the check caps it back. So these moves are most likely out of reach for every fighter in the real game (not tried live here), and the check turning them down is the closer reading. Bringing the simulation in line (and rebuilding the graphs of maps with wind) is a separate fix.

**The check is the CPU itself** (rebuilt after the review, 2026-10-19: the first check flew each move with fixed holds and brakes, turned down moves the live CPU made, and on the large factory map left a Lightning carrier with no way home). It now runs the CPU's own way of taking the move on a stand-in with the fighter's numbers (`ctfNavStatGen`): the run-up along the floor with the take-off look-ahead at every step, then in the air the keys `ctfAiFollow` chooses, re-aimed every step from where it is, never giving up while it can still reach the target; running off a step of a slope short of the take-off, down to the next floor and on from there; a jump pressed against a wall as the plain jump the game makes of it. Turned-down moves checked against the live CPU (the real game, the check switched off, 3 tries each; 24 moves sampled on the medium castle for Roboty and on the large oak for Lightning at her v2 jump 0.91): of 72 tries, 3 made it (all on one move), 15 came down somewhere as high or higher (no harm: the CPU plans again from there) and 54 missed.

**Never the last way.** When the moves the check turned down leave a CPU no path at all, it plans with them and takes them (`ctfAiPlan`); a move it then makes is that stat set's again (`ctfAiFollow`). So every place from which a carrier can get home without the check, it can get home from with it. Tested on the small castle: with every jump and drop turned down for Roboty's numbers, every place on the far half that has a way home keeps it (`test/ctf-stat-check.test.js`). In live matches on the large factory map (both sides) and the large oak, a lone Lightning carrier (at her v2 jump 0.91, the case the review found) at the far end of the enemy half, with every jump and drop turned down for her numbers, planned past the check and took the flag home every time (factory: 16 moves, all made, home in about 39 s; oak: 4 moves). Wall-jump moves (from origin/main 1d3fa65) are not the stat check's: their own check already flies them with the fighter's numbers (`ctfAiWallOK`).

**Never a frozen frame.** One check flies many look-aheads (on average 34 ms of work on a loaded machine; a turned-down move, flown with its own numbers and then with every stat at 1, up to 23,987 look-aheads. Each of the two is capped at 12,000: one that would fly more keeps the move, as a check that could not tell). So it is never done in one go: the moves of a path are queued as it is planned and worked through a few look-aheads a step (`ctfNavStatTick`: 3 ms of each step, 6 while the flags are hidden; headless, a fixed number of look-aheads, the same on any machine). A move the CPU reaches before its turn goes to the head of the queue and is tried meanwhile. A CPU's own call to the check now flies nothing (`test/ctf-stat-check.test.js`: 0 look-aheads in the call, at most 12 in a headless step, and every move of the path gets its verdict); the review's worst single call was 102 ms in a match and 400 ms in its probe.

A smoke check in real CPU-only matches (castle and oak, 10 CPUs all on Lightning's v2 numbers, one seed each, the check on against off): on castle the match played out the same; on oak, carriers never failed to find a plan (228 failed plans with the check off, 0 with it on) and unsticks fell (26 to 21), but more moves were missed (11 to 22). One seed each, so read it as a smoke check, not a measurement.

## Bot goldens

All 12 bot goldens (test/golden/bot-legacy.json) replay differently now: every golden match has at least one fighter with stats (only Taco is flat). They were not re-recorded.
