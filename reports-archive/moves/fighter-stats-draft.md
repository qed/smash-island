# Fighter stats: draft for all 102 fighters

The owner, 2026-10-18: "give each fighter stats". The chosen approach was **character first, balance second**. Each fighter's numbers start from who they are: heavy or light, fast or slow, floaty, hard-hitting. That comes from the BFDI and Inanimate Insanity wikis plus their in-game kit and card text. After that, weak fighters get nudged up.

This is a draft. Nothing in the game has changed: `FIGHTER_STATS` in index.html still holds 1 for everyone. The values the game would read are in `fighter-stats-draft.json`, next to this file. It lists only the numbers that differ from 1.

## The five stats

| Stat | What it changes | Above 1 | Below 1 |
|---|---|---|---|
| **Run** | ground speed (top speed and acceleration) | faster on foot | slower on foot |
| **Air** | air drift (steering speed while airborne) | steers farther | steers less |
| **Jump** | jump strength (height grows about with its square: 1.08 is about 17% higher) | higher jump | lower jump |
| **Fall** | how hard gravity pulls *on the way down* (it does not touch the rise) | heavier and snappier, lands sooner | floaty, hangs in the air longer |
| **Dmg** | damage they deal (every hit, including card numbers) | hits harder | hits softer |

- Every value sits between **0.88 and 1.12** (plus or minus 8-12% at most). Most fighters move only 2 or 3 of the 5 stats. 1.00 means nothing about them says otherwise.
- In the tables, **bold** is above 1 and *italic* is below 1.
- **Fall is a trade, not a buff or a nerf.** A floaty fall helps recovery but leaves you in the air longer. A heavy fall lands quickly but sinks faster off the edge.
- **Dmg is the strongest knob,** so it moves rarely and only a little. 12 fighters have it, never above 1.05, and nobody hits softer.

## Rules the edit applied

1. Similar bodies get similar numbers:
   - the coins all fall at 1.06;
   - both fans fall at 0.92;
   - single sheets of paper drift at 1.08 and fall at 0.90;
   - both bombs hit at 1.04;
   - hoverers run at 0.94-0.95;
   - the heavy tier (weight 105-129) runs at 0.94 and falls at 1.06-1.08;
   - the two giants (Roboty w134, Tree w138) run at 0.90.
2. No "just better" fighters. Anyone with two or more ups (run, air, jump or dmg above 1) also has a down. The only exceptions are weak and near-weak fighters (under about 36%), where the extra up is the balance lean.
3. Strong fighters (over about 65%) get no net buff. Their numbers are a trade, or flat. Following the owner's rule, nobody strong is nerfed for balance either: they only get character trades that roughly cancel out.
4. Weak fighters (under about 30%) and near-weak ones (30-36%) may lean up.
5. Jump stays at 1.08 or below, because height grows with its square.

**Count:** 102 fighters. 95 have at least one stat off 1.00 and 7 stay fully flat (Loser, Marker, Taco, Match, Taco (II), Microphone, Salt).

**Standing** (in brackets after each name) is a win rate:
- BFDI fighters: the 2-a-side Hard-bot moveset panels (batch8-before, 2026-10-18, 32-64 games each; batch6 and batch7 for the fighters in those batches). See `batch6-and-7-panel.md` and `batch8-before.json` in this folder.
- Inanimate Insanity fighters: the 1v1 whole-roster run of 2026-10-09 (100 games), as reported by the drafters.
- "no data" means the fighter is in no recent panel. "Old" figures come from the September 5-way brackets, where the mean was 20%, not 50%.

## Battle for Dream Island (59 fighters)

| Fighter | Run | Air | Jump | Fall | Dmg | Why |
|---|---|---|---|---|---|---|
| **Firey** (53%) | 1.00 | 1.00 | **1.05** | *0.95* | 1.00 | Fire is light and rises: a higher jump and a slightly floaty fall (shared with Firey Jr.). |
| **Leafy** (no 2v2 data (old brackets: top)) | **1.10** | 1.00 | *0.96* | *0.92* | 1.00 | BFDI's famous runner: top footspeed, and a leaf settles slowly. Built for the sprint, not the high jump (her one down). |
| **Needle** (44%) | 1.00 | 1.00 | **1.06** | **1.05** | 1.00 | Tall, thin steel needle: long legs give a higher hop, and metal drops point-first. |
| **Pin** (41%) | *0.94* | 1.00 | 1.00 | **1.06** | **1.04** | Heavy pushpin (w112) with a sharp point: slower on foot, drops hard, Point Pierce bites a little deeper. |
| **Snowball** (47%) | *0.95* | 1.00 | *0.96* | 1.00 | **1.05** | BFDI's self-proclaimed strongest, a muscle-bound bully: hits harder, but his big snow body is slow and earthbound. |
| **Bomby** (no 2v2 data (old brackets: ~14%, low)) | *0.94* | 1.00 | 1.00 | **1.08** | **1.04** | A heavy iron bomb (w120), slow-talking and slow-moving: falls like a dropped bomb, and his blasts carry a little extra. |
| **Bubble** (72% strong) | *0.95* | **1.06** | 1.00 | *0.90* | 1.00 | A soap bubble floats rather than walks: drifts well, sinks slowly, plods on the ground. A trade, no net gain. |
| **Teardrop** (44%) | **1.04** | 1.00 | 1.00 | **1.06** | 1.00 | A small, silent water drop: drops fast like a falling droplet, quick and quiet on her feet. |
| **Flower** (31% near-weak) | 1.00 | 1.00 | 1.00 | **1.05** | **1.04** | BFDI's violent diva who crushes contestants: hits a touch harder, comes down heavy for Stomp Quake. |
| **Tennis Ball** (50%) | 1.00 | 1.00 | **1.06** | 1.00 | 1.00 | A bouncy felt ball and calm tinkerer: a springier jump, nothing else. |
| **Blocky** (47%) | *0.96* | 1.00 | 1.00 | **1.06** | 1.00 | A solid cube (w110) that cannot roll: a bit slow on foot, lands like a brick. |
| **Coiny** (66% strong) | 1.00 | 1.00 | 1.00 | **1.06** | 1.00 | A dense copper penny: drops fast. His slap-fight speed lives in his kit, not his stats. |
| **Pen** (22% weak) | 1.00 | **1.05** | **1.05** | 1.00 | 1.00 | Light, tall, thin plastic pen: a higher jump and better drift to keep his Cap Shot angles. |
| **Pencil** (no data) | **1.04** | 1.00 | 1.00 | 1.00 | 1.00 | The peppy, bossy leader of the Alliance (BFDI): a quicker step. |
| **Golf Ball** (91% strong) | *0.94* | **1.05** | 1.00 | **1.06** | 1.00 | Dense and brainy (w108), a thinker, not an athlete: slower run, drops hard. Real golf balls carry far on their dimples, so she drifts well. |
| **Rocky** (59%) | *0.94* | 1.00 | 1.00 | **1.08** | 1.00 | A silent rock that barely moves in canon: slow to run, falls like a stone. |
| **Book** (no data) | 1.00 | **1.04** | 1.00 | *0.97* | 1.00 | Flat pages catch the air: slightly better drift and a gentler fall. |
| **Fries** (no 2v2 data) | **1.04** | 1.00 | 1.00 | *0.96* | 1.00 | A light cardboard carton and a driven, competitive BFB contestant: a touch quicker, a touch lighter in the air. |
| **Gelatin** (no 2v2 data (old brackets: weakest)) | *0.96* | 1.00 | **1.08** | 1.00 | 1.00 | A jiggly block of gelatin: bounces higher off the ground, but wobbles along rather than runs. |
| **Nickel** (no data) | *0.96* | 1.00 | 1.00 | **1.06** | 1.00 | A deadpan nickel, a bigger coin than Coiny: dense, falls hard, a bit slower on foot. |
| **Puffball** (no panel; owner sees ~81%) | *0.94* | **1.06** | 1.00 | *0.90* | 1.00 | Legless canon flyer, light as fluff (w46): floats down slowly, drifts well, slow when grounded. A trade (the owner sees her win often). |
| **Ruby** (no data) | *0.96* | 1.00 | 1.00 | **1.06** | 1.00 | A solid gemstone, the durable brawler: heavy, drops hard, a little slower to get going. |
| **Yellow Face** (no data) | **1.04** | 1.00 | 1.00 | 1.00 | 1.00 | The hyperactive BUY NOW! infomercial pitchman, all energy: a quicker step. |
| **Barf Bag** (no 2v2 data (old brackets: ~10%, low)) | 1.00 | **1.05** | 1.00 | *0.94* | 1.00 | A light paper bag that catches the air: drifts farther and settles slowly. |
| **Basketball** (no data) | 1.00 | 1.00 | **1.08** | **1.04** | 1.00 | A regulation basketball (Self-Dribble kit): a big springy jump, back down hard like a dribble. |
| **Bell** (no 2v2 data (old FFA: above mean)) | *0.94* | 1.00 | 1.00 | **1.08** | 1.00 | A brass-and-copper bell (in-game canon note), a w112 heavy: slower feet, falls heavy. |
| **Bracelety** (34% near-weak) | **1.06** | 1.00 | **1.04** | *0.96* | 1.00 | A light hoop (w70), BFB's upbeat singer with a cheer-sign kit: quick feet and a springy jump. |
| **Fanny** (22% weak) | *0.96* | **1.10** | **1.04** | *0.92* | 1.00 | An electric fan (BFB) whose blades blow wind (Gust kit): strong drift, a floaty fall on her own updraft. She sits on a base, so her run dips. |
| **Gaty** (45%) | *0.96* | 1.00 | 1.00 | **1.06** | 1.00 | A sturdy garden gate (BFB, w101) that swings rather than sprints: a bit slower, heavier fall. |
| **Grassy** (58%) | **1.04** | 1.00 | 1.00 | *0.94* | 1.00 | A small, light patch of grass (BFB, w62); Grasstree gives him heft, so his base form is quick and a bit floaty. |
| **Lightning** (73% strong) | **1.10** | 1.00 | *0.94* | **1.06** | 1.00 | A lightning bolt (BFB): very fast and very light (w54). A bolt strikes down, not up: snappy fall, lower jump. |
| **Liy** (23% weak) | **1.08** | 1.00 | **1.04** | 1.00 | 1.00 | A light switch (BFB) whose kit is a LIGHTS ON blitz-grab dash: a faster run and a peppier hop. |
| **Lollipop** (no 2v2 data) | *0.96* | 1.00 | **1.06** | 1.00 | 1.00 | A candy head on a single leg: pogo hops and a Candy Twirl rise, a little slower on the ground. |
| **Loser** (73% strong) | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | BFDI's modest do-everything athlete: the all-rounder, so every stat stays at 1.00, the baseline the rest are measured against. |
| **Marker** (48%) | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | Nothing in canon or in his ink-debuff kit points to speed, weight or power. |
| **Money** (36% near-weak) | 1.00 | **1.08** | 1.00 | *0.90* | 1.00 | A paper bill (BFDIE 1) whose up-special is Drifting Bill: drifts well and falls slowly, like Paper. |
| **Naily** (28% weak) | **1.06** | 1.00 | **1.04** | **1.06** | 1.00 | A thin steel nail (TPOT): light but metal, so a fast fall. The I NAILED IT! dash wants quick feet. |
| **Pillow** (41%) | *0.96* | **1.06** | **1.04** | *0.90* | 1.00 | A soft pillow; her card says floaty recovery and a springy Fluff Bounce. A soft body flops along on the ground. |
| **Remote** (28% weak) | **1.06** | 1.00 | 1.00 | **1.04** | 1.00 | A battery-powered robot remote (BFB) in dense plastic: heavier fall; quicker feet offset her reserve-power slowdown. |
| **Rose** (58%) | 1.00 | **1.04** | 1.00 | *0.96* | 1.00 | A light flower on a thin stem with a thorn whip: a touch floaty, good drift. |
| **Saw** (25% weak) | 1.00 | 1.00 | 1.00 | **1.06** | **1.05** | A metal handsaw (in-game canon note): falls heavy and the teeth cut deep. |
| **Taco** (77% strong) | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | Nothing in canon makes her fast, heavy or floaty. |
| **TV** (no 2v2 data (old FFA: above mean)) | *0.94* | 1.00 | 1.00 | **1.08** | 1.00 | A big TV set (w117), among the heaviest: slow feet, falls like a brick. |
| **Woody** (38-48%) | **1.08** | 1.00 | 1.00 | *0.92* | 1.00 | Balsa wood (BFDI): featherlight, fragile and terrified. Panic-running is his whole kit (Fraidy Dash): fast run, floaty fall. |
| **Toothpaste** (no 2v2 data (old FFA: 13% vs 20% mean, low)) | **1.04** | **1.04** | 1.00 | 1.00 | 1.00 | A hotheaded tube (TPOT). Her kit is traps and a teleport, nothing heavy: a slightly quicker run and drift. |
| **Dora** (53%) | **1.06** | 1.00 | 1.00 | 1.00 | 1.00 | A small flurry rushdown (w69) whose Energy Boost card is about running: quick feet. |
| **Match** (81% strong) | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | A thin matchstick (BFDI); nothing makes her fast or heavy. |
| **David** (no 2v2 data) | **1.04** | 1.00 | 1.00 | **1.08** | 1.00 | A stick figure with real running legs (BFDI); his card is a super-heavy ground-pounder: decent run, slams down hard. |
| **Firey Jr.** (59%) | 1.00 | **1.06** | 1.00 | *0.94* | 1.00 | Firey's little cousin (BFB), small and light (w70). Heat rises: nimble drift, a slightly floaty fall. |
| **Fern** (36% near-weak) | 1.00 | **1.04** | **1.06** | 1.00 | 1.00 | A fern (TPOT 24) whose Pole Jump springs extra high, and the fronds glide: better jump and drift. |
| **Ruler** (38%) | 1.00 | **1.06** | 1.00 | *0.95* | 1.00 | A thin, flat ruler (TPOT): light and a little floaty, with the drift her Sniper kit needs to kite. |
| **Sidewalky** (no 2v2 data (old FFA: never won, low)) | *0.94* | 1.00 | 1.00 | **1.08** | **1.05** | A slab of concrete pavement (TPOT, w110): slow on foot, drops like a brick, and Pavement Slam hits like one. |
| **Balloony** (45%) | *0.95* | **1.10** | 1.00 | *0.88* | 1.00 | A balloon (BFB) that floats and zips on air jets (Air Leak): the best drift, the floatiest fall, a bit slow on the ground. |
| **Roboty** (no 2v2 data (old FFA: top 3)) | *0.90* | 1.00 | *0.96* | **1.10** | **1.04** | A boxy robot on treads, the 'immobile tank' (BFDI wiki), w134: slow run, weak jump, heavy fall, and a tank's blows land heavy. |
| **Profily** (33% near-weak) | 1.00 | **1.06** | **1.04** | *0.96* | 1.00 | A flat profile-picture icon (TPOT) with a light 2D body: a higher hop, more drift, a softer fall. |
| **Tree** (no 2v2 data) | *0.90* | 1.00 | 1.00 | **1.08** | **1.04** | A big, timid, rooted tree (BFDI wiki), w138: slow run, falls heavy, and a dropped branch (Timber) lands hard. |
| **Ice Cube** (41%) | **1.08** | **1.04** | *0.96* | 1.00 | 1.00 | Small, slippery, fragile ice (BFDI wiki): slides fast on the ground and in the air, but her short body jumps lower. |
| **Cake** (56%) | *0.96* | 1.00 | 1.00 | **1.05** | 1.00 | The dense, layered Cake at Stake cake (BFDIA): a touch slow, falls a little harder. |
| **Donut** (67% strong) | **1.06** | 1.00 | *0.95* | 1.00 | 1.00 | A rolling ring of dough (Sprinkle Roll): quick along the ground, but a heavy pastry jumps lower. A trade. |

## Inanimate Insanity (43 fighters)

| Fighter | Run | Air | Jump | Fall | Dmg | Why |
|---|---|---|---|---|---|---|
| **Balloon** (no data) | *0.95* | **1.08** | 1.00 | *0.95* | 1.00 | A helium balloon (II wiki: Levitation, Slow Falling): lift and drift like Balloony, slow on foot. His kit already cuts his fall to 0.55x, so fall dips only a little. |
| **Bomb** (no data) | *0.96* | 1.00 | 1.00 | **1.06** | **1.04** | A round, heavy bomb who explodes on contact (II wiki): a bit slow, falls hard, and his blasts hit a little harder, like Bomby's. |
| **Knife** (no data) | **1.06** | 1.00 | 1.00 | **1.04** | 1.00 | Sharp, brash and quick-tempered (II wiki): quicker feet, and a metal blade drops firmly. His bite stays in his kit. |
| **Lightbulb** (no data) | **1.06** | *0.96* | **1.04** | 1.00 | 1.00 | Hyperactive and ditzy ('OMGA!', II wiki): a faster run and a higher jump, but bouncing off the walls is hard to steer in the air. |
| **Paintbrush** (no data) | 1.00 | **1.05** | 1.00 | 1.00 | 1.00 | A slim, high-strung artist (II wiki): a light brush flicks through the air. Rage already scales their hits, so dmg stays 1. |
| **Taco (II)** (no data) | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | Canon (scheming actress, retractable arms, II wiki) says nothing about how she moves; her arms and Lemon Spit cover reach. |
| **Bow** (no data) | *0.95* | **1.08** | 1.00 | *0.90* | 1.00 | A ghost who levitates (II wiki, Abilities: As a Ghost): floaty fall and strong drift, and like every hoverer, slower on foot. |
| **Marshmallow** (no data) | 1.00 | **1.06** | 1.00 | *0.92* | 1.00 | 'Never used gravity properly' (II wiki): a floatier fall and more drift. |
| **Apple** (no data) | 1.00 | 1.00 | **1.05** | 1.00 | 1.00 | A small, sunny, ditzy apple (II wiki), a light fruit always bouncing around: a higher jump. |
| **Baseball** (no data) | **1.04** | *0.95* | **1.06** | **1.08** | 1.00 | The sporty one, 'all legs, no arms' (II wiki, kit): strong legs to run and jump, but a dense w110 ball falls hard and steers little once airborne. |
| **Pickle** (no data) | *0.96* | 1.00 | 1.00 | **1.08** | 1.00 | A gloomy veteran whose special is a belly-flop dive (II wiki, kit): falls heavy. Hurt-scaling already boosts his hits. |
| **Nickel (II)** (no data) | *0.96* | 1.00 | 1.00 | **1.06** | 1.00 | A dry, unbothered snarker (II wiki) and a dense metal coin: unhurried on foot, falls hard, like the other coins. |
| **Paper** (no data) | 1.00 | **1.08** | 1.00 | *0.90* | 1.00 | A single sheet of paper (II wiki), among the lightest at w64: flutters down slowly and drifts far. |
| **Microphone** (no data) | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | A loud performer (II wiki) with nothing in canon about how she moves; her Loud/Quiet button already changes her power. |
| **Salt** (no data) | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | A gentle salt shaker; Pepper echoes every move (II wiki: inseparable duo), so Salt's own numbers stay neutral. |
| **Test Tube** (no data) | *0.96* | 1.00 | 1.00 | 1.00 | 1.00 | A brainy lab scientist (II wiki), no athlete: a touch slow on foot. Her tracking darts do the chasing. |
| **Box** (38%) | 1.00 | 1.00 | 1.00 | **1.08** | 1.00 | II wiki: she sinks straight to the bottom of any water (the 'sinker' Lifering dives for), so she falls heavy. |
| **Trophy** (39%) | *0.96* | 1.00 | 1.00 | **1.06** | 1.00 | Cast gold, proud and showy (II): a heavy metal body falls hard and struts rather than sprints. |
| **Goo** (49%) | *0.94* | **1.06** | 1.00 | 1.00 | 1.00 | A blob that oozes along the floor but stretches out to grab (All Play and No Work). |
| **Lifering** (34% near-weak) | **1.06** | 1.00 | **1.04** | *0.94* | 1.00 | The lifeguard sprints and dives in for a sinking Box (Tri Your Best); a foam ring floats, so his fall is a bit floaty. |
| **Bonesaw** (45%) | *0.94* | 1.00 | 1.00 | **1.06** | **1.04** | A saw cuts in strokes and 'he is never fast' (S4E1); a metal variant of Knife that cuts to the core. |
| **Spikey** (36% near-weak) | 1.00 | 1.00 | 1.00 | **1.06** | **1.04** | Iron spikes on a ball that doesn't give (II4): dense, so it falls hard, and the spikes sting. |
| **Candle** (55%) | *0.94* | **1.06** | 1.00 | *0.92* | 1.00 | A weary wax candle with telekinesis (Inner-Flame): slow on her feet, but she hovers and drifts on mind power. |
| **Cammy** (47%) | 1.00 | 1.00 | 1.00 | **1.04** | 1.00 | A stiff camera body falls straight down; canon says nothing about his speed. |
| **Cheesy** (24% weak) | **1.08** | 1.00 | **1.04** | 1.00 | 1.00 | 'All puns and no brakes', the cheese wedge who kicks a soccer ball (Kick! Soccer! Pun!): quick feet and a happy hop. |
| **Dough** (33% near-weak) | 1.00 | **1.04** | 1.00 | *0.94* | 1.00 | Soft all the way through, and copies Bow seconds later (II wiki): a bendy, slightly floaty body. |
| **Fan** (79% strong) | 1.00 | 1.00 | 1.00 | *0.92* | 1.00 | An electric fan: the updraft from his own blades softens his fall (same as Fanny). He is strong, so that trade is all. |
| **Soap** (27% weak) | **1.08** | **1.04** | 1.00 | 1.00 | 1.00 | A slick bar of soap slides along (she slipped in the Cherries' olive oil, Fan the Flames). |
| **Tissues** (31% near-weak) | *0.96* | **1.06** | 1.00 | *0.92* | 1.00 | Very sickly (II wiki, Personality), so a touch slow on foot; light tissue paper floats and drifts. |
| **Yin-Yang** (38%) | 1.00 | **1.06** | 1.00 | 1.00 | 1.00 | Mindful positioning lets one half take full control (II wiki, Abilities), which reads as precise air control. |
| **Starfruit** (44%) | *0.96* | **1.04** | 1.00 | 1.00 | 1.00 | The Has-Been (Cob Mentality) is past his sprinting days; his star-shaped body catches the air. |
| **Blueberry** (44%) | *0.96* | 1.00 | 1.00 | **1.04** | **1.04** | A strongman who lifts foes and slams them (Palanquin Catch): the muscle hits harder, weighs his fall down, slows his run. |
| **Cherries** (52%) | *0.96* | 1.00 | **1.06** | 1.00 | 1.00 | Two cherries bouncing on one stem; two bodies keeping step (and slipping in their own oil) run slightly slow. |
| **Clover** (19% weak) | 1.00 | **1.08** | **1.04** | *0.90* | 1.00 | A four-leaf clover, light as a leaf: floats and drifts, and a lucky bounce adds a little jump. |
| **Jack** (36%) | 1.00 | **1.06** | 1.00 | *0.94* | 1.00 | A stiff playing card (II4): flat and light, so he flutters down and glides sideways. |
| **Magnet** (42%) | *0.94* | 1.00 | 1.00 | **1.08** | 1.00 | One of the heaviest (w118), a solid metal magnet: lumbers on foot and drops hard. |
| **MeTag** (43%) | **1.04** | 1.00 | 1.00 | **1.04** | 1.00 | A tracker and enforcer (II wiki: the logo glows while tracking) who runs a target down; a dense device falls firmly. |
| **Poppy** (34% near-weak) | 1.00 | 1.00 | **1.08** | *0.94* | 1.00 | A popcorn kernel in a pan, all enthusiasm (II4): pops up high, and puffed popcorn comes down light. |
| **Silver Spoon** (57%) | *0.96* | 1.00 | 1.00 | **1.06** | 1.00 | Solid silver that turns gold at will (II wiki): the metal body falls hard, and the pampered rich kid ambles. |
| **Tapey** (40%) | 1.00 | **1.04** | 1.00 | *0.96* | 1.00 | A light plastic cassette (II wiki, Appearance): the flat body drifts and settles gently. |
| **Tea Kettle** (69% strong) | 1.00 | 1.00 | 1.00 | **1.06** | 1.00 | A kettle full of water drops heavily. She is strong, so no speed is added: one trade only. |
| **Teddy Bear** (47%) | *0.96* | **1.04** | 1.00 | *0.94* | 1.00 | A stuffed plush, soft and floaty; she tires out ('Ugh, I'm tired!', War De Guacamole), so her run is a bit slower. |
| **Bot** (23% weak) | **1.04** | 1.00 | **1.08** | 1.00 | 1.00 | II wiki: Bot can stretch their legs at will and kick with them: long strides and springy jumps. |

## Leaning up for balance

These fighters get more than their character alone would give, because the panels have them losing:

- **Clover (19%), Pen (22%), Liy (23%), Bot (23%), Cheesy (24%), Soap (27%), Naily (28%):** two plain ups and no down (Bot also stretches to jump 1.08).
- **Fanny (22%):** air 1.10, the joint highest drift, plus a jump up. Her small run cut is her only down.
- **Saw (25%):** dmg 1.05, and no slow run despite a weight-106 metal body.
- **Remote (28%):** a quick run (1.06) instead of the slow one her weight-106 body would normally get.
- **Near-weak fighters (31-36%)** keep two ups with no down:
  - Bracelety (34%), Fern (36%), Profily (33%) and Lifering (34%);
  - Poppy (34%) has jump 1.08;
  - Flower (31%) and Spikey (36%) have dmg 1.04;
  - Money (36%) has the full paper drift.
- **Likely weak on old data only:**
  - Toothpaste (13% against a 20% mean) keeps run and air up;
  - Bomby (about 14%) runs at 0.94, not the 0.92 his weight-120 body would suggest;
  - Sidewalky (never won an old FFA) keeps dmg 1.05.

## Strong fighters held to a trade (no net gain, no balance nerf)

- **Golf Ball (91%):** slow run and heavy fall, balanced by better drift (dimples).
- **Lightning (73%):** run 1.10, balanced by a lower jump.
- **Bubble (72%) and Puffball (owner sees about 81%):** float and drift, balanced by a slow run.
- **Donut (67%):** run up, jump down.
- **Coiny (66%), Tea Kettle (69%) and Fan (79%):** a fall change only.
- **Loser (73%):** stays all 1.00. As BFDI's do-everything all-rounder, he is the baseline.
- **Match (81%) and Taco (77%):** stay all 1.00.

## Notes and things I was unsure of

- **Capture the Flag:**
  - The code comment on `FIGHTER_STATS` says the CTF CPU route graphs assume every stat at 1. A jump under 1 can come up short of a ledge they count on.
  - Six fighters here have jump under 1: Leafy 0.96, Snowball 0.96, Roboty 0.96, Ice Cube 0.96, Donut 0.95 and Lightning 0.94.
  - CPU CTF ledges should be checked with these six before this goes live.
- **Small net trims on mid fighters:**
  - Some mid or no-data fighters get only a run cut plus a fall change, which is a small net trim (about 4-6%): Rocky, Bell, TV, Magnet, Nickel, Nickel (II), Ruby, Trophy, Silver Spoon, Pickle, Gaty, Blocky, Cake and Test Tube.
  - That follows from their bodies (heavy metal and stone). If the balance step finds any of them under 35%, they are the first to give back.
- **Balloon's fall:** his kit already cuts his fall to 0.55x, so his fall 0.95 stacks on top of that to about 0.52x. Check how it feels.
- **My inventions, to stop a big up from being free:**
  - Leafy's jump 0.96 ("built for the sprint");
  - Lightning's jump 0.94 ("a bolt strikes down");
  - Lightbulb's air 0.96 (too ditzy to steer);
  - Baseball's air 0.95.
  - Golf Ball's air 1.05 comes from real golf-ball physics, not show canon.
- **Source of the Inanimate Insanity standings:** they come from the drafters' notes on a 1v1 run of 2026-10-09. I could not find that run's file to confirm the numbers. Puffball's standing is also split: bot panels have had her low, but the owner reports about 81% over 100+ matches (ledger F20).

## Main changes from the first drafts

- **Dmg capped at 1.05:**
  - Snowball, Saw and Sidewalky were 1.06 and are now 1.05.
  - Tree, Bomb and Blueberry were 1.05 and are now 1.04.
  - Dmg was removed from Bell, TV and Knife (thin reasons, and Bell and TV were above the mean in old data).
  - Dmg was added to Roboty to offset his slow-tank package.
- **Strong fighters' net buffs removed:** Lightning, Loser and Coiny. Golf Ball's net nerf was also softened.
- **Two ups with no down, fixed:**
  - Firey, Leafy, Tennis Ball, Pencil, Yellow Face, Woody, Dora, Ruler, Knife, Paintbrush and Apple each lost an up.
  - Pillow, Lightbulb, Baseball and Gelatin each gained a small down.
- **Body consistency:**
  - TV, Bomby, Sidewalky and Bonesaw now run at 0.94 (heavy tier), and Gaty at 0.96 (w101).
  - Nickel (II) now runs at 0.96 like Nickel.
  - Fan now falls at 0.92 like Fanny.
  - Money and Paper now match (air 1.08, fall 0.90).
  - Bow joined the hoverers (run 0.95).
  - Knife falls at 1.04 like the other metal blades.
- **Size of lean-ups:**
  - Bot's and Poppy's jumps were cut from 1.10 to 1.08.
  - Lifering's run was cut from 1.08 to 1.06.
  - Bracelety's jump was cut from 1.06 to 1.04.
  - Rocky, Snowball, Roboty and Test Tube had their jump and run cuts softened.
