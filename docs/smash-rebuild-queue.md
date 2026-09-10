# Queue — Battle for Smash Island

Everything asked for that is **not yet done**, in the order I'd take it. Written 2026-09-03.
Tick a box and I'll pick it up from here.

Shipped this session, for reference: assist trophies rebuilt (body/AI/20s/immunity/doc
behaviours), the Money "1cs" bug found and fixed (a piercing shot damaged a boss once per
*frame*), the A/B balance sweep built and run, all 59 smashes given a name + sound + colour,
the charge split into two real tiers, Naily's smash authored from scratch, 48 up-specials
rebuilt into four shapes, Needle nerfed. Ten branches pushed, `pr1`..`pr10`.

---

## 1. Open the pull requests  ← blocked on you

`gh` 2.99.0 is installed but not logged in, and the login is an interactive browser flow I
can't drive. One command in your terminal:

```
"C:\Program Files\GitHub CLI\gh.exe" auth login --hostname github.com --git-protocol https --web
```

Then I create all ten PRs in one go and you get real merge buttons. Until then the compare
links work but each needs a click to open.

- [ ] `gh auth login` (you)
- [ ] create PRs 1–10, stacked in order (me)

## 2. Author the remaining 39 smashes  ← the main body of work

Naily set the pattern and it's the template for the rest: **a recognisable movement pattern,
an effect that outlives the hit, a damage/knockback ratio that says what the move is FOR, a
cost that makes it a choice** — plus a tap tier, and nothing too complex.

39 of the 59 are still one of three generic shapes. They differ in name, colour and numbers
and in nothing you can play differently. Each needs its own row.

Done as reference: **Naily** (dash-through, jab back, bleed, 30f self-stun) and **Puffball**
(plunge from height pays Momentum).

### AoE burst — 21 fighters, every one of them "a ring of damage around me"

- [ ] **Gaty** (`reflect`, w101) — Swing Open → reflects projectiles back
- [ ] **Bell** (`ring`, w112) — RING → chargeable AoE stun
- [ ] **Yellow Face** (`buynow`, w82) — BUY NOW! → soundwave stun cone
- [ ] **Bubble** (`float`, w60) — Thermal Rise → long float; pops but reforms
- [ ] **Lightning** (`zap`, w54) — Chain Bolt → lightning that arcs between enemies
- [ ] **TV** (`static`, w117) — Static Burst → stunning screen-flash aura
- [ ] **Pillow** (`fluff`, w79) — Fluff Bounce → springy shockwave, floaty recovery
- [ ] **Bomby** (`bomb`, w120) — Light My Fuse → detonate for huge radius, hurt self
- [ ] **Coiny** (`slap`, w88) — Slap → fast chainable hit, +bonus vs fire
- [ ] **Fries** (`fry`, w96) — Fry Dart → rapid thrown fries
- [ ] **Gelatin** (`freeze`, w82) — Freeze Syringe → freezes at high %
- [ ] **Liy** (`switch`, w68) — Flip Switch → LIGHTS ON blitz-grab that pulls & hurls
- [ ] **Marker** (`ink`, w91) — Ink Spray → cone that slows and weakens
- [ ] **Rose** (`thorn`, w83) — Thorn Lash → tether that yanks a foe in
- [ ] **Dora** (`rant`, w69) — Rapid Rant → machine-gun flurry of jabs
- [ ] **David** (`seriously`, w110) — Aw Seriously → ground-pound shockwave
- [ ] **Fern** (`photo`, w88) — Photosynthesis → heal over time + vine strike
- [ ] **Sidewalky** (`slam`, w116) — Pavement Slam → body-slam that stuns
- [ ] **Balloony** (`airleak`, w68) — Air Leak → jets of released air zip Balloony around and shove foes
- [ ] **Profily** (`pricetag`, w82) — Price Tag → slaps a sticker that makes a foe take more damage
- [ ] **Cake** (`atstake`, w90) — Cake at Stake → lobs a slice and recovers a little on hit

### Single projectile — 11 fighters, every one "spawn one shot"

- [ ] **Tennis Ball** (`serve`, w100) — Bounce Serve → ricocheting ball, gains speed
- [ ] **Rocky** (`barf`, w92) — Barf → lobbed puddle projectile, poisons
- [ ] **Basketball** (`dribble`, w103) — Self-Dribble → ricocheting ball that speeds up
- [ ] **Bracelety** (`sign`, w70) — Sign Wave → hurls a cheer sign that flies out and boomerangs back
- [ ] **Match** (`spark`, w90) — Triple Spark → three-way fireball spread
- [ ] **Taco** (`salsa`, w91) — Salsa Splat → lobbed puddle that slows
- [ ] **Lollipop** (`sucker`, w93) — Sticky Sucker → rooting projectile that pins foes
- [ ] **Remote** (`hack`, w100) — Remote Hack → bolt that reverses enemy controls
- [ ] **Flower** (`quake`, w102) — Stomp Quake → grounded shockwave
- [ ] **Pen** (`cap`, w100) — Cap Shot → boomerang cap projectile
- [ ] **Pencil** (`van`, w100) — Supervan → drives across the ground, ramming

### Volley — 7 fighters, every one "spawn N shots in a fan"

- [ ] **Pin** (`pierce`, w102) — Point Pierce → pops inflatables, big poke
- [ ] **Nickel** (`flip`, w90) — Heads or Tails → random buff or self-launch
- [ ] **Money** (`payday`, w70) — Cha-Ching → coins that hit harder on hurt foes
- [ ] **Woody** (`fraidy`, w66) — Fraidy Dash → panic-dash with fear splinters
- [ ] **Toothpaste** (`paste`, w88) — Paste Trap → sticky glob that roots foes
- [ ] **Roboty** (`morse`, w134) — Morse Beep → a dot-dot-dash burst of signal bolts
- [ ] **Ice Cube** (`shatter`, w72) — Cold Snap → bursts an icy shard ring that can freeze

## 3. Smaller things noted along the way

- [ ] **`tick.buff` is unmeasurable by the A/B sweep.** The tournament harness disables items
      on purpose, so item-buff durations come back a clean `0.0000` — which reads exactly like
      "this doesn't affect balance" and means nothing of the kind. Needs an items-on variant.
- [ ] **The music crossfade test is flaky under load.** `test/music.test.js` "overlaps the two
      decks" fails in the full 617-test run and passes every time in isolation. It's a timing
      assumption in the test, not a regression in the game.
- [ ] **`relay/` points at a dead server.** `RELAY_URL` returns `000`; the guard test asserts
      the URL *format*, so the suite is green while multiplayer cannot connect. Multiplayer is
      parked by your call — this is just the note that the test proves less than it looks like.

## 4. Not started, from earlier in the queue

- [ ] **Angling a smash** (up/down) — the research called it the best depth-per-line available,
      and the engine already carries launch angle in `kbx/kby`.
- [ ] **Sweet/sour bands on the smashes.** The machinery shipped with the up-specials
      (`hitCircle`'s `dmgLow`, dead in all 57 call sites since the first commit, is now the sour
      value) but only the up-specials opt in so far.
