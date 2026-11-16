# Update 4 draft (Friday 13 November 2026), v3 (checked against ii-dlc 404feb93)

Paste-ready HTML for artifacts/V1/whats-new.html (goes above the Update 3 entry) and for the in-game CHANGELOG array. All [CHECK] items of v1 are settled; see reports/update-4-checks.md. The old drafts are reports/update-4-draft-v1.md and update-4-draft-v2.md.

```html
  <h2>13 November 2026 <span class="small">Update 4</span></h2>
  <ul class="cl">
    <li>Directional influence: hold a direction as a hit lands and your launch bends that way, up to 15 degrees, with the same speed. Tap directions during the hit freeze to slide a little (6 px a tap, 18 px at most per hit), enough to slip out of a later hit of a many-hit move. It does not work while you are grabbed, frozen, rooted, asleep or caught by a Final Smash. CPUs use it too: Easy rarely, Expert almost always.</li>
    <li>Swinging attacks now hit as they swing. A tilt or aerial that sweeps an arc hits only the part of the arc it has reached so far, tip first, so a far-away foe is no longer hit on the very first frame. Reach, damage, launch and frame counts are the same; only when each part can hit changed. The streak is drawn where the hit is.</li>
    <li>Frame budget: fast, strong specials, smashes and finishers now leave you stuck for a moment afterwards (18 to 28 frames for strong ones, 8 to 13 for weak ones, 12 to 20 for slow smashes), so a foe can punish a miss or a block. A move that connects recovers much sooner, so combos still work. Throws still come out on the press. Hard and Expert CPUs punish a fighter who is stuck.</li>
    <li>Very fast smashes, specials and finishers that could knock you out now show a short gather (glow, dust and a rising whistle) of at least 6 frames before they hurt (up specials and throws are not changed). No single move holds a foe without control for more than 45 frames (roots, holds, pins and freezes all stop at 45).</li>
    <li>Run speed now follows weight: the lightest fighters run about 25% faster than the middle, the heaviest about 25% slower. Heavy fighters no longer get the old extra slowdown on top.</li>
    <li>Air speed follows weight too: about 10% faster steering in the air for the lightest, 10% slower for the heaviest. The floaters (Puffball, Balloon, Balloony, Bubble) steer about 12% better than their weight says, and Tree stays slow in the air.</li>
    <li>Shield breakers: twelve neutral smashes now break a raised shield in one hit (the shield pops into the normal long stun and half the smash's damage goes through). Each one charges with a hot red glow so you can see it coming. Hard and Expert CPUs drop their shield when they see it. Up and down smashes do not break shields. The smash line on the fighter card says "Breaks shields."</li>
    <li>Unique moves: forty-six fighters had their tilts, aerials, specials or smashes remade so they no longer look like each other. Names are in the balance notes below.</li>
    <li>Final Smashes now stop at walls. A shot, hit or catch from a Final Smash no longer goes through solid rock or a wall, so Bow's chairs and others cannot hit a foe they cannot reach. Open stages are unchanged.</li>
    <li>Bow's finisher now comes out on small platforms and ledges: her chair tower can topple off a ledge or the other way, shrinks under a low ledge, and a finisher that finds no room on the ground gives the shared swing instead of a stray neutral special.</li>
    <li>Boss fights are fairer: more time and room to dodge. Swarm Wave now drops bugs in lit columns with a clear gap; the Sonic Blast has a longer phase 2 wind-up; You Must closes its hooks slower; Private shutters are narrower with the floor marked; Torture Time's panes shut later; the Announcer's crusher has a longer tell; the Purple Dragon, MePhone4S and Four got longer wind-ups on several moves; Consequences phase 3 was slowed and now shows where it will land. Firey Speaker Box's TLC now pauses where it lands before each ring, marks the next landing, keeps to the side it started toward instead of turning mid-chain, and its rings are spaced out and shorter; the high twin ring that could not be jumped is gone. Damage and knockback are unchanged.</li>
    <li>Capture the Flag: after 4 minutes with no capture, CPUs send more attackers (a fifth more each minute) so stalemates on maps like Crystal Deeps and Coral Deep end. Escape now closes the picker and goes back a screen on the Flag Cup screens. The map check shows a "Checking routes..." panel with a percent and the seconds so far.</li>
    <li>Esc now goes Back on the menu screens (Settings, Controls, Stats, How to Play, Training, the vault, quests, shop, wardrobe, rankings, World Cup setup, fighter select, and the lobby when you are not in a room). How to Play has a Back button, and a step-8 smash that misses says "Missed! Try again closer". If you press keys that do nothing (W A S D or I J K L on the default arrows), the pause or result screen shows a one-time line naming the keys that work.</li>
    <li>More of the show's own pictures on attack props: Fries' darts, Soap's cloth and vacuum, Money's coins and bags, Marshmallow's saw blade, Poppy's kernels, Teddy Bear's TV, Coiny's monitor, Book's quill and Profily's cactus.</li>
    <li>Trophy's handles are now part of his body instead of swinging like arms.</li>
    <li>Online: game snapshots are smaller (slow fighter details are sent only when they change).</li>
    <li>Secrets have been added...</li>
    <li>Balance: no more smashes or Final Smashes that drop from the sky. Nine neutral smashes that fell onto a shadow now come straight from the fighter as a fan of shots (one of them connects), with the same damage and launch: Leafy (Leaf Blower), Match (Strike Anywhere), Roboty (All Dashes), Ice Cube (Blast Chiller), Starfruit (Spoiled Lemon, Reunited), Paper (Eighty-Eight Keys), Lifering (Called in a Favor), Clover (Lucky Break), Yellow Face (Flash Sale, now a close flash around her). Blocky's Anvil Smash is now a swing of a drawn anvil in front of him after a wind-up (it still breaks shields, and shorter reach than the old drop). Money's and Book's Final Smashes now throw their coin bags and books from the fighter across the stage, and Paper's two pianos roll along the floor (both now connect, so it hits harder than before). Final Smash shots still stop at walls.</li>
    <li>Balance: run speed by weight (buffs and nerfs):
      <ul>
        <li>Buff: Puffball run 5.82 to 7.28</li>
        <li>Buff: Lightning run 7.10 to 8.52</li>
        <li>Buff: Needle run 6.40 to 7.47</li>
        <li>Buff: Grassy run 6.91 to 7.93</li>
        <li>Buff: Leafy run 7.10 to 8.01</li>
        <li>Buff: Bubble run 5.82 to 6.53</li>
        <li>Buff: Woody run 7.04 to 7.90</li>
        <li>Buff: Bow run 5.82 to 6.24</li>
        <li>Nerf: Pen and Tennis Ball run 6.40 to 5.95</li>
        <li>Nerf: Pencil run 6.91 to 6.42</li>
        <li>Nerf: Fries run 6.91 to 6.55</li>
        <li>Nerf: Blocky run 5.43 to 5.19</li>
        <li>Nerf: TV run 5.41 to 5.11</li>
        <li>Nerf: Magnet run 5.40 to 5.08</li>
        <li>Nerf: Bomby run 5.36 to 5.02</li>
        <li>Nerf: Roboty run 4.89 to 4.38</li>
        <li>Nerf: Tree run 4.84 to 4.28</li>
        <li>Median-weight fighters (Pickle, Box, Dough, weight 86) run about the same; every other fighter moves a little along the same curve.</li>
      </ul></li>
    <li>Balance: air speed by weight:
      <ul>
        <li>Buff: Bubble air 1.09 to 1.22; Puffball 1.09 to 1.22; Balloon 1.10 to 1.23; Balloony 1.11 to 1.24</li>
        <li>Buff: Lightning air 1.00 to 1.06; Needle 1.03 to 1.08; Grassy, Leafy, Woody a little</li>
        <li>Buff: Roboty air 0.86 to 0.89; Tree 0.85 to 0.86 (small)</li>
        <li>Nerf: Tennis Ball and Pencil air 1.00 to 0.95</li>
        <li>Nerf: Pen air 1.09 to 1.04</li>
        <li>Nerf: Bonesaw air 1.00 to 0.95</li>
        <li>Nerf: Donut air 1.00 to 0.96</li>
      </ul></li>
    <li>Balance: Fern's healing (Photosynthesis and Regen Stance) only heals while Fern is standing still on the ground (running or flying no longer heals; standing still is unchanged).</li>
    <li>Balance: shield breakers (neutral smash breaks a shield in one hit, half damage through): Blocky (Anvil Smash), Tree (Deadfall), Bomb (Big Kaboom), Teddy Bear (Rage Room), Book (Hardcover Slam), Knife (Blade Rush), Gelatin (Ice Breaker), Snowball (Ground Pound), Blueberry (Oatmeal Raisin), Pillow (Bedspring Boom), Barf Bag (Acid Reflux), Marshmallow (One Purchase Later). Damage, launch and timing of these smashes are unchanged.</li>
    <li>Balance: new tilts and aerials for the ten weakest fighters, each with a fast poke, a spacing move, a combo starter and a kill move, damage total within about 10% of before: Goo (Sticky Lift, Stretch Up, Slime Wall and more), Box, Lifering, Balloon, Tissues, Yin-Yang, Snowball, Teardrop, Starfruit, Cammy.</li>
    <li>Balance: new tilts and aerials for the ten strongest fighters, with aimed at lowering their total damage: Fries, Lollipop, Match, Naily, Toothpaste, Bomby, Rocky, Firey, Blocky, Tree. Spam moves pay for long reach with end lag (Firey's Meteor Cinder and Tree's Branch Up end lag 18).</li>
    <li>Balance: new up specials and smashes: Leafy (smash Leaf Blower, a fan of three leaves in front; one connects for 12%, launch 13), Basketball (smash Slam Dunk, 14%, launch 12), Knife (smash Caltrops, a mine that bleeds), Cheesy (smash Punchline, a beam that weakens; up special Cheese Wheel), Soap (smash Soap Slide, ices; up special Slip Away, heals 15), Gaty (smash Gate Swing, pulls foes in and strips armour), Sidewalky (smash Slab Down, roots then stuns; up special Cement Mixer), Trophy (smash Off the Iceberg, up special Horseplay), Blueberry (up special Berry Roll), Paintbrush (up special Pyrokinesis).</li>
    <li>Balance: new specials and smashes for seven more fighters: Ruby (down special Shard Spray, three bouncing gem shards), Firey Jr. (down special Flare Up, a ring of flame that burns; up special Fire Whirl), TV (down special Pause, roots the nearest foe for 34 frames after a wind-up; neutral special Scan Lines, two bars of static), Ruler (down special Straight Edge, reflects shots for 22 frames), Loser (down special Shrug It Off, clears every status, heals 6 and gives armour; smash Cold Snap, a ring of chill that ices), Coiny (down special Spare Change, three bouncing coins), Fanny (smash Cyclone, a whirlwind that travels through everyone).</li>
    <li>Balance: short gathers and end lag on very fast moves: Teardrop's kick (0 to 6 frames of gather, 26 frames stuck after a miss), Bomby's bomb and finisher (6 frames, 27 stuck), Firey's ember (5 frames, 18 stuck), Lifering's lifeguard dash (11 frames, 21 stuck), Pin's pierce (6 frames). Others with a 2 to 6 frame gather: Flower (quake and down special), Starfruit, Roboty, David, Nickel (II), Liy, Marshmallow, Silver Spoon, Trophy, Blueberry, Pencil's van, Bracelety, Nickel, Remote, Taco, Toothpaste, Tennis Ball (finisher and serve), Cake.</li>
    <li>Balance: new moves for six more fighters: Pencil (down special Erase, wipes out enemy shots nearby), Cake (down special Second Helping, the first 6% of the heal can't be interrupted: a small buff), Fan (Nice Save! smash is now a leap), Rose (down special Curtsy, a dodge that no longer punishes with 12%), Apple (neutral special Pencil Pair), Pin (smash Pushpin).</li>
    <li>Balance: new moves for three more fighters: Bracelety (down special Pep Talk, a cheer that speeds you up for about two-thirds of a second, heals about 4% and powers up your next Attack; no armour any more), Nickel (II) (up special Legs Only, a spin of kicking legs with the same damage and stun as before), Grassy (down special Take Root, armour for under half a second while rooted, and a bramble that springs up beside you and hurts foes who step on it).</li>
  </ul>
```

## Lead notes

Counts (recounted by script on the HTML block): 29 list items (v2 had 25), of which 17 are news (including the one teaser line) and 12 are Balance items (the batch-6 item is new; the Esc/key-hint item is new). Roughly 100 fighter mentions; breakers, batch lists and tells are comma lists.

Owner to decide:
- Online lag line: the line now only says snapshots are smaller. Only offline measurement exists (reports/ledger "ONLINE LAG": 59 to 93 KB/s before at 2 to 4 players, no after-number checked in real play). It does NOT claim less lag. Owner may delete it entirely.
- Per-fighter end-lag numbers: only five fighters have numbers; the rest are grouped. Add more only if the owner wants.
- The run-speed list names the 17 big movers; other fighters (for example Donut 6.98 to 6.55, Balloon 6.02 to 6.75, Bonesaw 6.02 to 5.62, Microphone and Salt 6.40 to 7.10) also changed and are covered by the "moves a little along the same curve" line. Full table: reports/run-speed-by-weight.csv.

Left out on purpose (hidden or not news), all covered only by the single teaser line:
- The hidden Rush mode and all its bosses (RUSH_OPEN false).
- Original-character editor, OC types, OC online sync (OC_RELEASED false; OC_OPEN only by a private console switch; OC_PUBLIC_TYPES holds one internal type but nothing is reachable without OC_OPEN).
- Moon Caves v4 (MC_V4_OPEN false), including V8b online and V9.
- The Yoyle Needle Teams map.
- Dream Island Teams map (DI_TEAMS_OPEN false; owner: keep hidden).
- Boss fairness items for the hidden boss (the ledger row names one; the draft has none of its attacks).
- Website pages merge and site links: not news.
- Art-only and CPU-internal items.
- Event fighters (nine rows with event:true in ROSTER): not selectable until won, so no speed lines for them.
- Builder-character (OC) smash options changed in the sky-drop job: hidden, not written.
- Credits file change (hidden Rush names moved out): not player news.

Still to do on the push day (the lead): see "What else must change" in reports/update-4-checks.md.

## Owner decisions (2026-11-11)
- Dream Island Teams map stays HIDDEN on Friday (not in notes).
- Teaser stays exactly: "Secrets have been added..."

- Lead 2026-11-11: sky-drop smash removal merged (37e7d825); line added; Leafy/Ruby/Fern names updated. Blocky's Anvil Smash is held for the owner.

- Lead 2026-11-11: TLC/Consequences fix job found no measurable improvement and shipped nothing; the boss line stays factual ("slowed ... show where they will land"), no new fairness claim.

- Lead 2026-11-11: UNIQUE MOVES batch 5 merged (fe51441d) but NOT yet in this draft: add a line only if the owner says it ships Friday (see owner-decisions-pending #14).

- Lead 2026-11-11 late: owner OK'd batch 5 for Friday; its line is added; the unique-moves count says fifty.

- Lead 2026-11-11 jury fixes: the tells line now says which moves (up specials and throws unchanged); the per-fighter damage % for the ten strongest and for Lifering/Snowball were removed (the CSVs count hits per move, not re-hits, so the totals could not be verified); batch 5 notes Cake's buff and Rose's lost counter damage. Event-contest names in the Update 3 line are fine: they were already on the live page.
- Lead 2026-11-11 owner review 1: Bell, Gelatin, Fern, Fanny's neutral special, Barf Bag, Marker, Pillow and Taco (II) were put back to their live moves (branch g-revert1); their parts are removed from the batch 4/5 lines; the fighters count says forty-three.
- Lead 2026-11-11 v3 (by the update job): Ruby's smash is Prism Burst again (no line; she is only in the down-special batch-4 item); Bell, Gelatin, Fern, Fanny's neutral special, Barf Bag, Marker, Pillow, Taco (II) were already out of the lines. Batch 6 (Bracelety, Nickel (II), Grassy; David rejected) added: count is now forty-six. Sky drops: line now covers Final Smashes (Blocky, Money, Book, Paper). TLC, Esc/key hint/Checking routes/step 8 lines added.
- Owner to decide: Paper's pianos now BOTH connect (+32% damage on a still foe in the ledger test, outside the 10% target); the line says it hits harder. Delete that clause if the owner prefers.
