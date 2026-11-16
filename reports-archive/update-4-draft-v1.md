# Update 4 draft (Friday 13 November 2026)

Paste-ready HTML for artifacts/V1/whats-new.html (goes above the Update 3 entry). Items marked [CHECK] must be verified by the lead before shipping; delete the marker when settled.

```html
  <h2>13 November 2026 <span class="small">Update 4</span></h2>
  <ul class="cl">
    <li>Directional influence: hold a direction as a hit lands and your launch bends that way, up to 15 degrees, with the same speed. Tap directions during the hit freeze to slide a little (6 px a tap, 18 px at most per hit), enough to slip out of a later hit of a many-hit move. It does not work while you are grabbed, frozen, rooted, asleep or caught by a Final Smash. CPUs use it too: Easy rarely, Expert almost always.</li>
    <li>Swinging attacks now hit as they swing. A tilt or aerial that sweeps an arc hits only the part of the arc it has reached so far, tip first, so a far-away foe is no longer hit on the very first frame. Reach, damage, launch and frame counts are the same; only when each part can hit changed. The streak is drawn where the hit is.</li>
    <li>Frame budget: fast, strong specials, smashes and finishers now leave you stuck for a moment afterwards (18 to 28 frames for strong ones, 8 to 13 for weak ones, 12 to 20 for slow smashes), so a foe can punish a miss or a block. A move that connects recovers much sooner, so combos still work. Throws still come out on the press. Hard and Expert CPUs punish a fighter who is stuck.</li>
    <li>Every very fast move that could knock you out now shows a short gather (glow, dust and a rising whistle) of at least 6 frames before it hurts. No single move holds a foe without control for more than 45 frames (roots, holds, pins and freezes all stop at 45).</li>
    <li>Run speed now follows weight: the lightest fighters run about 25% faster than the middle, the heaviest about 25% slower. Heavy fighters no longer get the old extra slowdown on top.</li>
    <li>Air speed follows weight too: about 10% faster steering in the air for the lightest, 10% slower for the heaviest. The floaters (Puffball, Balloon, Balloony, Bubble) steer about 12% better than their weight says, and Tree stays slow in the air.</li>
    <li>Shield breakers: twelve neutral smashes now break a raised shield in one hit (the shield pops into the normal long stun and half the smash's damage goes through). Each one charges with a hot red glow so you can see it coming. Hard and Expert CPUs drop their shield when they see it. Up and down smashes do not break shields. The smash line on the fighter card says "Breaks shields."</li>
    <li>Unique moves: thirty fighters had their tilts, aerials, up specials or smashes remade so they no longer look like each other. Names are in the balance notes below.</li>
    <li>Final Smashes now stop at walls. A shot, hit or catch from a Final Smash no longer goes through solid rock or a wall, so Bow's chairs and others cannot hit a foe they cannot reach. Open stages are unchanged.</li>
    <li>Bow's finisher now comes out on small platforms and ledges: her chair tower can topple off a ledge or the other way, shrinks under a low ledge, and a finisher that finds no room on the ground gives the shared swing instead of a stray neutral special.</li>
    <li>Boss fights are fairer: more time and room to dodge. Swarm Wave now drops bugs in lit columns with a clear gap; the Sonic Blast has a longer phase 2 wind-up; You Must closes its hooks slower; Private shutters are narrower with the floor marked; Torture Time's panes shut later; the Announcer's crusher has a longer tell; the Dragon, MePhone4S and Four got longer wind-ups on several moves; the TLC and Consequences phase 3 were slowed and now show where they will land. Damage and knockback are unchanged. [CHECK: that each boss named here is a regular Boss Rush boss and not hidden]</li>
    <li>Capture the Flag: after 4 minutes with no capture, CPUs send more attackers (a fifth more each minute) so stalemates on maps like the Mines end. Escape now closes the picker and goes back a screen on the Flag Cup screens.</li>
    <li>More of the show's own pictures on attack props: Fries' darts, Soap's cloth and vacuum, Money's coins and bags, Marshmallow's saw blade, Poppy's kernels, Teddy Bear's TV, Coiny's monitor, Book's quill and Profily's cactus.</li>
    <li>Trophy's handles are now part of his body instead of swinging like arms.</li>
    <li>Online: smaller game snapshots, so rooms with 3 or more players should lag less (slow fighter details are sent only when they change, and Yoyle Needle no longer re-sends its whole shape every frame). [CHECK: owner may prefer to hold this line until lag is confirmed better in real play; only offline measurement exists]</li>
    <li>Secrets have been added...</li>
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
        <li>Median-weight fighters (Pickle, Box, Dough, weight 85-86) run about the same; every other fighter moves a little along the same curve.</li>
      </ul></li>
    <li>Balance: air speed by weight:
      <ul>
        <li>Buff: Bubble air 1.09 to 1.22; Puffball 1.09 to 1.22; Balloon 1.10 to 1.23; Balloony 1.11 to 1.24</li>
        <li>Buff: Lightning air 1.00 to 1.06; Needle about +5%; Grassy, Leafy, Woody a little</li>
        <li>Buff: Roboty air 0.86 to 0.89; Tree 0.85 to 0.86 (small)</li>
        <li>Nerf: Tennis Ball and Pencil air 1.00 to 0.95</li>
        <li>Nerf: Pen air 1.09 to 1.04</li>
        <li>Nerf: Bonesaw air 1.00 to 0.95</li>
        <li>Nerf: Donut air 1.00 to 0.96</li>
      </ul></li>
    <li>Balance: Fern's Full Bloom only heals while she is standing still on the ground (running or flying no longer heals; standing still is unchanged).</li>
    <li>Balance: shield breakers (neutral smash breaks a shield in one hit, half damage through): Blocky (Anvil Smash), Tree (Deadfall), Bomb (Big Kaboom), Teddy Bear (Rage Room), Book (Hardcover Slam), Knife (Blade Rush), Gelatin (Ice Breaker), Snowball (Ground Pound), Blueberry (Oatmeal Raisin), Pillow (Bedspring Boom), Barf Bag (Acid Reflux), Marshmallow (One Purchase Later). Damage, launch and timing of these smashes are unchanged.</li>
    <li>Balance: new tilts and aerials for the ten weakest fighters, each with a fast poke, a spacing move, a combo starter and a kill move, damage total within about 10% of before: Goo (Sticky Lift, Stretch Up, Slime Wall and more), Box, Lifering (about -7% total), Balloon, Tissues, Yin-Yang, Snowball (about +6% total), Teardrop, Starfruit, Cammy.</li>
    <li>Balance: new tilts and aerials for the ten strongest fighters, with total damage lowered, not raised: Fries -3%, Lollipop -9%, Match -6%, Naily -9%, Toothpaste -8%, Bomby -8%, Rocky -10%, Firey -9%, Blocky -8%, Tree -7%. Spam moves pay for long reach with end lag (Firey's Meteor Cinder and Tree's Branch Up end lag 18).</li>
    <li>Balance: new up specials and smashes: Leafy (smash Leaf Fall, three leaves, 12% each, launch 13), Basketball (smash Slam Dunk, 14%, launch 12), Knife (smash Caltrops, a mine that bleeds), Cheesy (smash Punchline, a beam that weakens; up special Cheese Wheel), Soap (smash Soap Slide, ices; up special Slip Away, heals 15), Gaty (smash Gate Swing, pulls foes in and strips armour), Sidewalky (smash Slab Down, roots then stuns; up special Cement Mixer), Trophy (smash Off the Iceberg, up special Horseplay), Blueberry (up special Berry Roll), Paintbrush (up special Pyrokinesis).</li>
    <li>Balance: short gathers and end lag on very fast moves: Teardrop's kick (0 to 6 frames of gather, 26 frames stuck after a miss), Bomby's bomb and finisher (6 frames, 27 stuck), Firey's ember (5 frames, 18 stuck), Lifering's lifeguard dash (11 frames, 21 stuck), Pin's pierce (6 frames). Others with a 2 to 6 frame gather: Flower (quake and down special), Starfruit, Roboty, David, Nickel (II), Liy, Marshmallow, Silver Spoon, Trophy, Blueberry, Pencil's van, Bracelety, Nickel, Remote, Taco, Toothpaste, Tennis Ball (finisher and serve), Cake. [CHECK: owner may want per-fighter end-lag numbers for all 203 moves; only these are listed]</li>
  </ul>
```

## Lead notes

Counts (recounted by hand): 24 list items, of which 16 are news (including the one teaser line) and 8 are Balance items. Balance fighter entries: run speed 16 named, air speed 12 named, Fern 1, shield breakers 12 (in one line), unique moves 10 + 10 + 10, tells 5 named plus about 18 grouped, so roughly 90 fighter mentions, not one line each in every case (breakers, batch lists and tells are comma lists).

Left out on purpose (hidden or not news), all covered only by the single teaser line:
- The Algebralien Rush and all its bosses (RUSH_OPEN false), including the "last boss" work and its sprites.
- Original-character editor and all four OC types and viability work (OC_OPEN, OC_RELEASED false).
- Moon Caves v4 (MC_V4_OPEN false) and its CPU, stuck-in-rock fix.
- The Yoyle Needle Teams map (not in this branch's player-facing flags).
- Dream Island Teams map (v1 to v5): ledger says "hidden-stage rules as v4" and the code has no flag in diWanted. I could not confirm it is visible Friday, so I left it out. If it is live (Teams on Dream Island), add: "Teams on Dream Island now has its own map: four home islands with bridges, breaking planks, fall damage, day and night."
- Boss fairness items for the hidden final boss (omitted from the boss line).
- The merge of origin/main (website pages, 56d0386b) and the "Site links from game page / about page" commit: not news (site pages are already live on main).
- Art-only and CPU-internal items: Trophy aside, CPU Trapper anti-loop (OC), CPU cave graph (Moon v4).
- Event kits, shop and the Rush pay ledger: not in the diff as player-facing.
- Air speed for Foldy and Cloudy (event/non-public fighters; not listed).
- The in-game CHANGELOG array has no Update 4 entry yet, so this draft has to be added there too, not just to whats-new.html. Also update the meta description and dateModified lines in whats-new.html.

[CHECK] list:
1. Boss fairness line: bosses named (Announcer, Dragon, MePhone4S, Four, TLC, Consequences, Swarm Wave, Sonic Blast, You Must, Private, Torture Time) are regular, visible Boss Rush content. The boss-rush page names Announcer, Four, Evil Leafy, MePhone4, Purple Face, Purple Dragon and Speaker Box; TLC and Consequences boss belonging could not be confirmed.
2. Online lag line: only offline measurement exists.
3. Dream Island Teams map visibility (excluded).
4. Per-fighter tell/end-lag lines: grouped, numbers only for five fighters.
5. Run-speed and air-speed numbers are from the ledger; later tuning after those rows (for example the Leafy smash and other balance trims) could change them. Re-run the speed CSVs (reports/run-speed-by-weight.csv, reports/air-speed-by-weight.csv) before shipping.
6. Fern is a public fighter (has a fighters page) but the ledger calls her event work; confirm she is selectable Friday.
7. Capture the Flag "Mines" map name and the Flag Cup Escape change visible Friday.
8. Teaser wording "Secrets have been added..." should be finished by the lead; it is the only hint of hidden content.
9. Ledger and sources were read in part (ledger rows were truncated at 2 to 6 KB each); the V1 index.html stat diff was not grepped line by line, so numbers come from ledger text only.

## Owner decisions (2026-11-11)
- Dream Island Teams map stays HIDDEN on Friday (not in notes).
- Teaser stays exactly: "Secrets have been added..."
