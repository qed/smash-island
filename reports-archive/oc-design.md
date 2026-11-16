# OCs (player-made original characters): design spec

*2026-11-09. Design only: nothing in the game was changed. Numbers below were read from the live monolith (smash-bal/artifacts/V1/index.html, booted headless with scripts/helpers/load-monolith.js) and from reports/frame-budget-audit.csv, reports/move-catalog.csv and reports/sweep-classification.csv. Scripts: the scratchpad folder ocdesign (dump.mjs, slots.mjs, text.mjs, vocab2.mjs). Unreleased fighters are called "unreleased" and are left out of every count that lists names.*

**The owner's decisions this spec builds on (not reopened):** the feature is called an OC; an OC has skins; four TYPES based on this game's own archetypes, each with FIXED stats; every OC has the roster's average weight; the player picks ONE of FOUR options in each of four slots (neutral special, down special, up special, neutral smash: 256 builds a type), and SHIELD or REFLECTOR; everything else is fixed per type; weight is never chosen; saved on the device; online play syncs the look and the picks; online names are filtered; keyboard only. **Added 2026-11-09 by the owner: "make new moves pls. I dont want them to be similar."** So every option is a NEW move, authored through the game's data-driven move vocabularies (section 2), not a copy of a roster move.

---

## 0. Summary

| Question | Answer |
|---|---|
| The four types | **Zoner**, **Grappler**, **Trapper**, **Trickster** (section 1) |
| Weight | **86** for every OC (mean 86.4 over the 102 released fighters; median 86; range 46-138) |
| New moves | **64** (4 types x 4 slots x 4 options); 60 need no engine code beyond one shared row-runner; 4 need a small listed helper |
| Engine change | one shared `ocRun(f, row)` (about 60 lines) + a per-slot key `ocKey(f, slot)` read at **14** dispatch/keying points; the other ~139 `kit.special` readers are per-fighter passives an OC key never matches |
| Shield/reflector | `isReflector(f)` gains `|| (f.oc && f.oc.rf)`; one direct `REFLECTOR_FIGHTERS.has` must become `isReflector` |
| Look | the game's existing no-sprite "blob" body (circle, eyes) in a per-type silhouette, coloured and patterned by the player, with the wardrobe's code-drawn hats, trails and KO effects; up to 3 looks ("skins") an OC |
| Save | `bfsi:ocs` through BStore (localStorage), up to 8 OCs, about 150 bytes each |
| Online | the OC's code rides in the hello name the way the cosmetics code does today (`name~code`); the host validates every field and filters the name; every client builds the same fighter from the code |
| Credit estimate | about **37% of a week** in 6 jobs (section 9); spread over 2-3 update cycles |

---

## 1. The four types

### 1.1 Why these four

The 111 roster rows carry 100 different `arch` labels. Grouped by what the kit does, the big families are: ranged pressure (Zoner 6 plus Light/Glass/Fluid/Spread/Chain/Ammo/Aggressive zoner, Sniper, Area denier, Zone control: 17 rows), close-range throwers and bruisers (Grappler 3, Brawler, Bruiser, Powerhouse, Strongman, Heavy x4, Bully: 14), stage control (Trapper 3, Controller 2, Setup, Saboteur, Detonator, Binder, Warden, Summoner: 11) and mix-up/mobility (Trickster 2, Disruptor 3, Speedster, Evasive, Mimic, Gambler, Ricochet, Flyer: 11). Those four families cover 53 of the 102 released fighters and are the four most distinct ways the game is already played; Counter, Support, Rager and the rest are one-offs.

| Type | What it is for (one line) | Plays closest to |
|---|---|---|
| **Zoner** | holds a lane with shots and arcs; wins by making the foe walk through fire | Lightbulb (eball), Taco (II) (lemon) |
| **Grappler** | close in, big single hits and pushes; wins the exchange it starts | Flower (quake), Liy (switch), Goo (engulf) |
| **Trapper** | puts things on the floor and makes the foe stand where they hurt | Blocky (anvil), Cherries, Toothpaste (paste) |
| **Trickster** | fast, in and out, status mix-ups; wins by never being where the hit lands | Gelatin (freeze), Knife (tricks) |

### 1.2 Fixed stats

A roster row is `{name, w, color, play, arch, kit:{special, desc}}`; the per-fighter multipliers live in `FIGHTER_STATS[name] = {run, air, jump, fall, dmg, rec}` (default 1 each; `statsFor(name, w)`), and the run speed and air drag follow the weight (`runK`, the above-100 air slowdown). `koCap = 150 + w`. Roster medians: run 1.00 (0.89-1.12), air 1.00 (0.94-1.12), jump 1.00 (0.92-1.10), fall 1.00 (0.88-1.11), dmg 1.00 (1.00-1.20), rec 1.00 (1.00-1.25).

| Type | w | koCap | run | air | jump | fall | dmg | rec | note |
|---|---|---|---|---|---|---|---|---|---|
| Zoner | 86 | 236 | 0.97 | 1.00 | 1.03 | 0.96 | 1.00 | 1.00 | floatier, a touch slower on the ground |
| Grappler | 86 | 236 | 1.00 | 0.97 | 0.96 | 1.06 | 1.06 | 1.00 | hits harder, falls faster, worse in the air |
| Trapper | 86 | 236 | 0.95 | 1.00 | 1.00 | 1.00 | 1.03 | 1.05 | slowest; a little extra recovery |
| Trickster | 86 | 236 | 1.06 | 1.05 | 1.05 | 0.97 | 0.96 | 1.00 | fastest and lightest-feeling; hits softest |

All within +/-0.06 of the median (the roster's own band is +/-0.12), so the type is a flavour, not a tier. The `rec` field is a recovery knob (share of the up-special's lift kept off-stage); the Trapper's 1.05 pays for its slow run.

### 1.3 Fixed moves per type

Each type is one new kit key (`oc_zoner`, `oc_grappler`, `oc_trapper`, `oc_trickster`) with its own `MOVESETS[key]` row (jab, ft/ut/dt, na/fa/ba/ua/da, grab + four throws, tech, `aiFit:true`), one `ATKSPECIALS[key]` finisher and one final smash. The owner's rule "the rest is fixed per type" means these are written once per type like any converted fighter's kit (the same `mvStart` runner). That is 4 x 13 = 52 ordinary MOVESETS entries plus 4 finishers and 4 final smashes, which is a normal "new fighter" kit each: the per-type jobs in section 9 include them. The finisher and final smash of each type should be modest (the shared circle finisher at FIN_CD_SHARED 180 is an acceptable placeholder for the first build).

---

## 2. The options: 64 new moves

### 2.1 The vocabularies the moves are written in (what exists today)

| Vocabulary | Where it runs | Fields (as used by the roster) |
|---|---|---|
| **MOVESETS row** (melee with motion) | `mvStart(f, S, key)` -> `mvTick` -> `mvStrike` | `n, d, pose (punch/uppercut/kick/throw/kickback/slam/dash/spin/chop/stompdn/kickup/hook/sweep), st, act, end, land, ac, jc, cd, start(f), fxt`; `boxes:[{s:{k:'c' capsule x1,y1,x2,y2,r | 'f' fan r0,r1,a0,a1,ox,oy | 'o' disc x,y,r}, dmg, kb:[x,y], stun, t0, t1, rehit, g, fx(f,t,mv)}]`; `mv:[{t0,t1, mode:set|add|stall|dive, vx, vy}]` (230 moves use `mv`); swept shapes are classed thrust / swing / disc by sweep-classification.csv |
| **Projectile spec** | `spawnProj(f, o)` | `vx, vy, grav, dmg, kb, r, color, life, bounce, maxBounces, boomerang, boomCurve, pierce, homing, fxTag (stun/root/bleed/slow/weaken/knockdown/scramble), fxN, shape, sticky, landsTrap, landsPuddle, noAim` |
| **UPSPEC row** (recovery) | `riseShape(f, s)` | `shape: hop (64 rows) / warp (17) / spin (12) / plunge (8)`; `power, dist, dx, invuln, frames, spinKb, hang, rad, dmg, kb, leave (stun/root/trap/puddle/lifesteal/taunt), ram, fall, push`; `hit:{off, fx, reach, dmg:[lo,hi], band, kb, eff, n}`; `self:{jumps, armor, invuln, empower, haste, healing, cloud}`; `shot:{...proj}`; `drop:{rider, dmg, kb, count, spread, r, vy, life, color, shape, volley}` |
| **SMASH_SPEC row** | `runSmashSpec` -> `SM_PAT[pat]` | `pat: lunge (21) / burst (15) / through (10) / beam (10) / leap (9) / rain (9) / plant (8) / mine (8) / walk (7) / reel (5) / horizon (1) / earth (1)`; `dmg (8-21, median 14), kb (5-18, median 12), effect (knockdown/stun/burn/slow/root/weaken/bleed/poison/freeze/ice/scramble/strip/drain/soak/crush/define), cost:{stun | cd | self | root | back}, color, n` + per-pattern fields (`reach, step, dash, spd, len, wide, rise, fwd, rad, wind, count, at, seek, r, life, pull, force, grow, r0, frames, far, up, rider`) |
| **DROP_RIDERS** | UPSPEC `drop` and `leave`; SMASH `rain`/`mine` `rider` | `burn, poison, freeze, root, scramble, trap, puddle, bounce, coin, van, plain` |
| **Statuses on hit** | `smashFx(f, list, fx, n)` (strings above) | a MOVESETS box applies one through `fx:(f,t)=>smashFx(f,[t],'burn',n)` (the one-liner the converted kits use) |
| **Stance / self buff** | `f.countering`, `f.armor`, `f.cloud`, `f._empower`, `f._hasteT`, `f.healing`, `f.invuln`, `f.jumps` | all already network flags (NET_FIGHTER_FLAGS) so a guest sees them |

**One new shared piece of engine code** is needed, because today a neutral special is a `switch` case in `doSpecial` (1005 lines, 114 cases) and a down special is a function in `DOWNSPECIALS` (111 functions), so neither slot has a data row form yet:

```
// ocRun(f, row): runs one OC option row by its kind. ~60 lines; no new mechanics.
//   kind 'mv'     -> mvStart(f, row.mv, slot)           (a MOVESETS-style melee/motion row)
//   kind 'shot'   -> spawnProj(f, row.shot) x row.count  (spread: vx*(1 - i*row.spread))
//   kind 'rise'   -> riseShape(f, row)                    (an UPSPEC row; up special only)
//   kind 'smash'  -> runSmashSpec(f, row)                 (a SMASH_SPEC row; smash only)
//   kind 'stance' -> f.flash, f.atkCd = row.frames, then row.self applied the way riseShape applies `self`
//   kind 'drop'   -> the drop-volley block of riseShape (index.html line ~68280) lifted into ocDrop(f, D) so a
//                    neutral/down special can drop riders too (the lift is the only refactor)
```

Every option also gets its own `ENDLAG_ADD` and `TELL_ADD` row (`<optionId>.<slot>`), so the frame budget applies through the existing tables, and a one-line `MOVE_TEXT`-style description for the editor and the move card.

### 2.2 Frame-budget rules applied to every option (from the ledger rows FRAME BUDGET and NO-TELL SWEEP, 2026-11-09)

- A move that can launch shows a wind-up: a **tell** of 2-6 frames (`TELL_ADD`) on top of a readable startup floor of **6 frames**. Light pokes (under 8% and a launch under 9) are exempt.
- Fast strong moves pay **18-28 frames of end lag** on a whiff (`ENDLAG_ADD`); a connecting hit cuts what is left to 35% (at least 4). Weak pokes pay 8-12; slow moves (startup 16+) pay 12-16 (the audit's class targets).
- **No single move locks a foe past 45 frames** (stun, root, freeze, hitstun from one hit). Every status duration below is 45 or less.
- Smash costs sit in the row band: `stun` 20-26 (self end lag) or `cd` 40-62.
- Recoveries ("exempt (up)") are not made to fall on a whiff but still pay their listed end lag; a warp with no hit is the price for i-frames.

### 2.3 Roles

Each slot's four options have four distinct ROLES so that no two options in a slot compete for the same job and most of the 256 builds are a real choice rather than a strictly dominated one:

| Role | Neutral special | Down special | Up special | Neutral smash |
|---|---|---|---|---|
| **Damage** | the big hit / big shot | the heavy ground hit | the recovery that hits hard | the big single hit |
| **Zoning** | the lane-holder | floor control | a shot or drop on the rise | the ranged smash |
| **Escape** | the get-out | the dodge or hop | the far / invulnerable rise | the smash that moves you |
| **Utility** | a buff, heal or mark | a cleanse, buff or lure | a jump refund or buff on the rise | a status smash (less damage) |

Columns: **St** startup (tell included where marked T), **Act** active, **End** end lag on a whiff, **Dmg** %, **Kb** launch. Colour theme per type is the hit-art colour (`hitArt`/`color` fields): Zoner teal `#4ec9e0`, Grappler ember `#e0663a`, Trapper violet `#9a6ee0`, Trickster magenta `#d14fc9`; every move is drawn by the generic hit art (capsule/fan/disc outlines, puffs, the projectile's circle with `shape` left unset) so no new art is needed.

### 2.4 ZONER (teal)

**Neutral special**

| Id | Name | Role | What it does | Vocabulary | St | Act | End | Dmg | Kb | Nearest existing move and why this is different |
|---|---|---|---|---|---|---|---|---|---|---|
| Z-N1 | Skyfall Spark | Damage | lobs a spark almost straight up; it falls nearly vertical about two body-lengths ahead | shot `{vx:3, vy:-13, grav:true, r:8, life:70}` | 8 (T4) | - | 22 | 11 | 8 | Firey's Ember Spit is a low arc at 8%; this is a tall mortar that comes down on a spot, slower, and lands behind a shield-holder |
| Z-N2 | Drift Orb | Zoning | a slow fat orb that floats down the lane for 2.5 s and passes through foes | shot `{vx:2.5, grav:false, r:12, life:150, pierce:true}` | 10 | - | 12 | 5 | 3 | TV's Static sits on the floor; the orb travels, is slow enough to walk behind, and is a moving wall rather than a patch |
| Z-N3 | Backstep Flare | Escape | hops back a body-length with 6 i-frames and leaves a small dart flying forward | mv `{st:2, act:6, end:10, mv:[{t0:0,t1:7,mode:'set',vx:-9}], start: invuln 6 + spawnProj dart {vx:9, dmg:4, kb:3, r:5, life:30}}` | 2 | 6 | 10 | 4 | 3 | Woody's Fraidy is a 17-frame run-away; this is one instant hop with a parting shot and no run |
| Z-N4 | Overcharge | Utility | stands 20 frames charging; the next hit in 4 s does +30% | stance `{frames:20, self:{empower:240}}`, spCd 110 | 20 | - | 6 | - | - | Loser's Cool is a speed/damage self-buff over time; this buffs one hit only and costs standing still |

**Down special**

| Id | Name | Role | What it does | Vocabulary | St | Act | End | Dmg | Kb | Nearest and why different |
|---|---|---|---|---|---|---|---|---|---|---|
| Z-D1 | Floor Arc | Damage | a low teal arc swept along the ground ahead; launches up and out | mv `{pose:'sweep', st:9 (T3), act:4, end:20, boxes:[{s:{k:'f', r0:10, r1:70, a0:0.3, a1:-0.3, oy:10}, dmg:10, kb:[6,-5], stun:20}]}` | 9 | 4 | 20 | 10 | 6/-5 | the roster's down-tilts are 4% pokes; this is a smash-weight swing (a fan swept over 4 frames) with real launch and the end lag to match |
| Z-D2 | Glass Shards | Zoning | three sparks fall just ahead; each roots a foe 20 frames where it lands | drop `{rider:'root', count:3, spread:3, dmg:3, r:5, vy:6, life:40}` | 12 | - | 14 | 3 x3 | 1 | Cherries' bait is a lasting trap; these are instant, short-lived, and root rather than catch |
| Z-D3 | Light Hop | Escape | a small backward-up hop with 4 i-frames | mv `{st:1, act:8, end:8, mv:[{t0:0,t1:7,mode:'set',vx:-4,vy:-9}], start: invuln 4}` | 1 | 8 | 8 | - | - | Bubble's float is a glide; this is a short committed hop that leaves the ground and nothing else |
| Z-D4 | Recharge | Utility | stands still 36 frames and heals 4%; a hit cancels it | stance `{frames:36, self:{healing:4}}`, spCd 240 | 36 | - | 8 | heal 4 | - | Fern's Photosynthesis is a sustain drip; this is one burst with a long cooldown and no movement |

**Up special**

| Id | Name | Role | What it does | Vocabulary | St | Act | End | Dmg | Kb | Nearest and why different |
|---|---|---|---|---|---|---|---|---|---|---|
| Z-U1 | Spark Pillar | Damage | a straight rise with a stunning column above | rise `{shape:'hop', power:-12, hit:{off:-14, fx:4, reach:18, dmg:[6,10], band:-0.6, kb:[2,-11], eff:'stun', n:60}}` | 3 | rise | 6 | 6-10 | 2/-11 | Knife's rise bleeds; this stuns (30 frames, under the lock cap) and reaches higher |
| Z-U2 | Beacon Drop | Zoning | a rise that fires one shot straight down to cover the landing | rise `{shape:'hop', power:-11, shot:{vx:0, vy:8, grav:false, dmg:5, kb:4, r:7, life:30}}` | 3 | rise | 6 | 5 | 4 | Lightbulb's warp fires a homing shot sideways; this fires under the body, so it guards the spot below, not the lane |
| Z-U3 | Blink | Escape | a long warp up and a little sideways, 12 i-frames, no hit | rise `{shape:'warp', dist:150, dx:40, invuln:12}` | 4 | - | 8 | - | - | the 17 warps carry a shot or a hit; this is longer and safer and does nothing else |
| Z-U4 | Glide Lamp | Utility | a modest rise that hands the air jump back and leaves a spark behind | rise `{shape:'hop', power:-10, self:{jumps:1}, drop:{rider:'plain', count:1, dmg:3, r:5, vy:5, life:30}}` | 3 | rise | 6 | 3 | 1 | Puffball's float boost keeps her flying; this just refunds a jump and marks where she left |

**Neutral smash**

| Id | Name | Role | What it does | Vocabulary | Wind-up | Dmg | Kb | Effect | Cost | Nearest and why different |
|---|---|---|---|---|---|---|---|---|---|---|
| Z-S1 | Lance Beam | Damage | a long thin beam straight ahead | smash `{pat:'beam', len:150, wide:16, n:90}` | charge + 24 | 16 | 12 | knockdown | stun 24 | the beam rows are wide and short or far-anchored; this is the longest and thinnest, a lance not a wall |
| Z-S2 | Star Rain | Zoning | four small stars fall ahead, each drifting a little toward the foe | smash `{pat:'rain', count:4, at:18, seek:0.3, r:8}` | charge + 20 | 7 x4 | 6 | slow | cd 56 | the rain rows drop 1-3 heavy things; this is four light ones that slow |
| Z-S3 | Light Leap | Escape | leaps forward and up, hitting around the body on landing | smash `{pat:'leap', rise:12, fwd:5, rad:36}` | charge + 18 | 11 | 9 | - | stun 20 | Leafy's leap roots; this is the mobility pick: lower damage, no status, carries the Zoner out of a corner |
| Z-S4 | Dimmer | Utility | a wide weak burst that weakens whoever it touches | smash `{pat:'burst', frames:10, r0:24, rad:90, grow:22, n:80}` | charge + 16 | 8 | 6 | weaken | cd 54 | Taco (II)'s burst slows at 14%; this trades half the damage for weaken and a shorter charge |

### 2.5 GRAPPLER (ember)

**Neutral special**

| Id | Name | Role | What it does | Vocabulary | St | Act | End | Dmg | Kb | Nearest and why different |
|---|---|---|---|---|---|---|---|---|---|---|
| G-N1 | Haymaker | Damage | a wide hook that launches up and out | mv `{pose:'hook', st:8 (T6), act:3, end:24, boxes:[{s:{k:'c', x1:10, y1:-4, x2:54, y2:-4, r:14}, dmg:13, kb:[9,-6], stun:26}]}` | 8 | 3 | 24 | 13 | 9/-6 | Pin's Point Pierce is a straight stab at 11%; this is a round hook with a bigger box and a diagonal launch, slower and laggier |
| G-N2 | Shove Wave | Zoning | a big push around the body: little damage, a lot of distance | mv `{pose:'punch', st:7, act:4, end:14, boxes:[{s:{k:'o', x:8, y:0, r:44}, dmg:5, kb:[8,-2], stun:18}]}` | 7 | 4 | 14 | 5 | 8/-2 | Fanny's gust is wind with no hit; this is a real hit that is almost all push, the Grappler's "get off me" |
| G-N3 | Roll-Through | Escape | rolls forward through the foe with 8 i-frames, no damage | mv `{pose:'dash', st:2, act:10, end:10, mv:[{t0:0,t1:9,mode:'set',vx:10}], start: invuln 8}` | 2 | 10 | 10 | - | - | Leafy's Sprint is an invincible dash that hits for 10%; this never hits and is half the length: a dodge that changes sides |
| G-N4 | Brace | Utility | plants the feet 24 frames with 24 frames of armour | stance `{frames:24, self:{armor:24}}`, spCd 120 | 24 | - | 10 | - | - | Snowball's tackle is an armoured charge; this is armour standing still, so it beats a dash in and nothing else |

**Down special**

| Id | Name | Role | What it does | Vocabulary | St | Act | End | Dmg | Kb | Nearest and why different |
|---|---|---|---|---|---|---|---|---|---|---|
| G-D1 | Ground Pound | Damage | slams both fists down: a ring at the feet that launches straight up; from the air it dives first | mv `{pose:'slam', st:10 (T6), act:3, end:22, land:8, boxes:[{s:{k:'o', x:0, y:10, r:40}, dmg:12, kb:[4,-9], stun:24}], mv:[{t0:0,t1:9,mode:'dive',vy:10}]}` | 10 | 3 | 22 | 12 | 4/-9 | Flower's Quake is a 5% down hit with a long tell; this is the heavy version that also works as a dive |
| G-D2 | Low Sweep | Zoning | a long low sweep on both sides that knocks down | mv `{pose:'sweep', st:8, act:3, end:12, boxes:[{s:{k:'c', x1:-40, y1:18, x2:40, y2:18, r:12}, dmg:6, kb:[5,-3], stun:20, fx:knockdown}]}` | 8 | 3 | 12 | 6 | 5/-3 | Taco's Trip is one-sided and 4%; this covers both sides and floors them, buying the Grappler a free approach |
| G-D3 | Back Vault | Escape | a backward hop with 6 i-frames | mv `{st:1, act:8, end:8, mv:[{t0:0,t1:7,mode:'set',vx:-8,vy:-6}], start: invuln 6}` | 1 | 8 | 8 | - | - | the same job as Z-D3 but lower and longer: it covers ground, not height |
| G-D4 | Shrug Off | Utility | shakes off every status on the body and heals 2% | stance `{frames:30, self:{healing:2}}` + `ocCleanse(f)` (clears burn, slowed, rooted, weakened, frozen, ctrlRev, curse, _poisonT), spCd 180 | 30 | - | 8 | heal 2 | - | Soap's Disinfect is an anti-stance hit; this is self-only and hits nothing. **Needs ocCleanse: ~10 lines of new code** |

**Up special**

| Id | Name | Role | What it does | Vocabulary | St | Act | End | Dmg | Kb | Nearest and why different |
|---|---|---|---|---|---|---|---|---|---|---|
| G-U1 | Rising Knee | Damage | a rise whose knee comes out late and knocks down | rise `{shape:'hop', power:-13, hit:{off:-10, fx:6, reach:22, dmg:[7,11], band:-0.3, kb:[3,-10], eff:'knockdown', n:70}}` | 3 | rise | 6 | 7-11 | 3/-10 | most rising hits are out on frame 1; this one lands in the second half of the rise (band -0.3), rewarding the read |
| G-U2 | Shockwave Hop | Zoning | a hop that throws two rock chunks off to either side | rise `{shape:'hop', power:-11, drop:{rider:'plain', count:2, spread:4, dmg:5, kb:5, r:8, vy:7, life:40}}` | 3 | rise | 6 | 5 x2 | 5 | the drop volleys fall on the spot; these go sideways, covering both approaches |
| G-U3 | Wall Spring | Escape | the highest hop in the game, 8 i-frames, no hit | rise `{shape:'hop', power:-15, self:{invuln:8}}` | 3 | rise | 6 | - | - | the default hop is -13 with a hit; this gives up the hit for height and i-frames |
| G-U4 | Armoured Climb | Utility | a rise under 18 frames of armour | rise `{shape:'hop', power:-12, self:{armor:18}}` | 3 | rise | 6 | - | - | Bomb's Collide spins with armour; this is the armour alone, so it beats an edge-guard hit but does no damage |

**Neutral smash**

| Id | Name | Role | What it does | Vocabulary | Wind-up | Dmg | Kb | Effect | Cost | Nearest and why different |
|---|---|---|---|---|---|---|---|---|---|---|
| G-S1 | Pile Driver | Damage | both fists into the floor: a slow big ring that floors them | smash `{pat:'plant', wind:8, rad:44, n:90}` | charge + 26 | 19 | 15 | knockdown | stun 26 | the plant rows sit at 14-17%; this is the heaviest at the highest cost |
| G-S2 | Shoulder Rush | Zoning | a shoulder charge through the foe that strips armour | smash `{pat:'through', dash:10, spd:13, reach:28, n:80}` | charge + 20 | 12 | 10 | strip | stun 22 | the through rows burn or knock down; strip is new to the pattern and is the Grappler's answer to armour |
| G-S3 | Vault Slam | Escape | a leap forward and up, landing on them | smash `{pat:'leap', rise:13, fwd:4, rad:38}` | charge + 20 | 12 | 9 | - | stun 22 | as Z-S3 but higher: the Grappler's only way over a wall of shots |
| G-S4 | Grip Reel | Utility | reaches out and reels the foe in, weakened | smash `{pat:'reel', pull:7, force:9, reach:90, n:70}` | charge + 20 | 9 | 6 | weaken | cd 50 | Rose's thorn pull is a special; this is the only grab-shaped option and it is deliberately weak (9%, a cooldown) so the average-weight body cannot stack it: it sets up G-N1, it does not kill |

### 2.6 TRAPPER (violet)

**Neutral special**

| Id | Name | Role | What it does | Vocabulary | St | Act | End | Dmg | Kb | Nearest and why different |
|---|---|---|---|---|---|---|---|---|---|---|
| T-N1 | Tack Volley | Damage | three tacks at three speeds that string out into a line | shot `{count:3, spread:0.12, vx:9, grav:false, r:4, dmg:4, kb:3, life:40}` | 7 (T3) | - | 18 | 4 x3 | 3 | Match's sparks fan out; these stay in one line at staggered speeds, so one shield or one dodge rarely covers all three |
| T-N2 | Tripwire Pod | Zoning | lobs a pod that arms where it lands and roots whoever steps on it (20 frames) | shot `{vx:6, vy:-4, grav:true, r:8, dmg:3, life:60, landsTrap:true}` | 10 | - | 14 | 3 | 1 | Blocky's anvil falls on a spot; the pod waits. **Flag: `landsTrap` today makes the one trap kind the roster has (Cherries' bait); if the owner wants a different look, a generic 'oc' trap kind is ~15 lines** |
| T-N3 | Smoke Pop | Escape | a back hop in a puff of smoke that hides the Trapper's tells for a second | mv `{st:1, act:8, end:8, mv:[{t0:0,t1:7,mode:'set',vx:-7,vy:-4}], start: cloud 60}` | 1 | 8 | 8 | - | - | Z-N3 leaves a dart; this leaves smoke (the `cloud` flag the CPU's tell-reader respects), a Trapper escape |
| T-N4 | Caltrop Patch | Utility | two slick patches land ahead; foes who walk on them slip | drop `{rider:'puddle', count:2, spread:3, dmg:0, r:5, vy:5, life:40}` , spCd 150 | 12 | - | 14 | 0 | - | Barf Bag's Splash is a damaging glob; this does nothing on the throw and everything on the floor |

**Down special**

| Id | Name | Role | What it does | Vocabulary | St | Act | End | Dmg | Kb | Nearest and why different |
|---|---|---|---|---|---|---|---|---|---|---|
| T-D1 | Bear Trap Snap | Damage | a snap at the floor just ahead that launches straight up and leaves them bleeding | mv `{pose:'slam', st:12 (T4), act:2, end:20, boxes:[{s:{k:'c', x1:10, y1:16, x2:40, y2:16, r:14}, dmg:12, kb:[2,-10], stun:28, fx:bleed}]}` | 12 | 2 | 20 | 12 | 2/-10 | Blocky's anvil is 13% after a 45-frame fall; this is instant, at the feet, two live frames, and bleeds |
| T-D2 | Mine Seed | Zoning | drops a seed that sits on the floor up to 5 s and goes off underfoot | shot `{vx:0, vy:-8, grav:true, r:9, dmg:8, kb:6, life:300}` | 10 | - | 14 | 8 | 6 | the mine smashes are rows of `pat:'mine'`; this is a special-slot mine built from a resting projectile. **Verify in the harness that a resting shot hits on contact; else reuse the mine pattern's placement code (~10 lines)** |
| T-D3 | Trapdoor Hop | Escape | a back-up hop that leaves a spark where the Trapper stood | mv `{st:2, act:8, end:8, mv:[{t0:0,t1:7,mode:'set',vx:-6,vy:-8}]}` + `ocDrop` plain spark at the start spot | 2 | 8 | 8 | 3 | 1 | Z-D3 is a clean hop; this one punishes the chase |
| T-D4 | Lie Low | Utility | crouches 30 frames in smoke, healing 2% | stance `{frames:30, self:{cloud:120, healing:2}}`, spCd 200 | 30 | - | 8 | heal 2 | - | Z-D4 heals more and shows; this heals less and hides the next tell |

**Up special**

| Id | Name | Role | What it does | Vocabulary | St | Act | End | Dmg | Kb | Nearest and why different |
|---|---|---|---|---|---|---|---|---|---|---|
| T-U1 | Spring Snap | Damage | a rise whose hit roots the foe where it catches them | rise `{shape:'hop', power:-12, hit:{off:-8, fx:4, reach:24, dmg:[8,12], band:-0.5, kb:[4,-9], eff:'root', n:60}}` | 3 | rise | 6 | 8-12 | 4/-9 | the three rooting rises are light; this is a heavy one with a shorter reach |
| T-U2 | Seed Scatter | Zoning | a hop that scatters three rooting seeds below | rise `{shape:'hop', power:-11, drop:{rider:'root', count:3, spread:4, dmg:3, r:5, vy:6, life:40}}` | 3 | rise | 6 | 3 x3 | 1 | Flower's pollen scrambles; seeds root |
| T-U3 | Cable Warp | Escape | a long warp mostly sideways | rise `{shape:'warp', dist:120, dx:60, invuln:10}` | 4 | - | 8 | - | - | Z-U3 goes up; this goes across: the Trapper's way back from under a ledge |
| T-U4 | Trap Hop | Utility | a rise that leaves a trap where it was cast | rise `{shape:'hop', power:-12, leave:'trap'}` | 3 | rise | 6 | - | - | shares the `leave:'trap'` rider one roster rise uses; different lift and no hit |

**Neutral smash**

| Id | Name | Role | What it does | Vocabulary | Wind-up | Dmg | Kb | Effect | Cost | Nearest and why different |
|---|---|---|---|---|---|---|---|---|---|---|
| T-S1 | Spike Press | Damage | a slow press into the floor that bleeds | smash `{pat:'plant', wind:10, rad:40, n:90}` | charge + 26 | 18 | 14 | bleed | stun 26 | heavier than every bleeding row; a longer wind |
| T-S2 | Minefield | Zoning | plants one big mine that roots | smash `{pat:'mine', at:36, r:20, life:240, n:80}` | charge + 20 | 13 | 11 | root | cd 60 | the mine rows knock down or burn; a rooting mine chains into T-D1 |
| T-S3 | Rebound Dash | Escape | a short dash through them with a recoil back | smash `{pat:'through', dash:8, spd:15, reach:26}` | charge + 18 | 10 | 8 | - | stun 20, back 6 | the only through row that ends behind where it started: an escape disguised as an attack |
| T-S4 | Tar Burst | Utility | a wide weak burst that slows | smash `{pat:'burst', frames:10, r0:24, rad:86, grow:20, n:80}` | charge + 16 | 7 | 5 | slow | cd 54 | Z-S4 weakens; this slows, which the Trapper's floor pieces want |

### 2.7 TRICKSTER (magenta)

**Neutral special**

| Id | Name | Role | What it does | Vocabulary | St | Act | End | Dmg | Kb | Nearest and why different |
|---|---|---|---|---|---|---|---|---|---|---|
| K-N1 | Trick Knife | Damage | a very fast short dagger with a visible wind-up | shot `{vx:13, grav:false, r:5, dmg:9, kb:6, life:28}` | 6 (T3) | - | 20 | 9 | 6 | Lightning's zap is instant and chains; this is a 6-frame tell, a short range (about 1.5 body-lengths) and real end lag |
| K-N2 | Bubble Lure | Zoning | a slow orb that drifts toward the foe for 2 s and slows whoever it touches | shot `{vx:4, grav:false, r:9, dmg:4, kb:2, life:120, homing:0.06, fxTag:'slow', fxN:12}` | 9 | - | 12 | 4 | 2 | Lightbulb's homing shot is on a warp and stuns; this is a stand-alone slow lure |
| K-N3 | Switch Hop | Escape | dashes through the foe with 8 i-frames and ends facing them | mv `{pose:'dash', st:1, act:8, end:6, mv:[{t0:0,t1:7,mode:'set',vx:11}], start: invuln 8}` | 1 | 8 | 6 | - | - | G-N3 is the same shape; the Trickster's is faster and shorter. **Flag: "ends facing them" needs 2 lines at the move's end (`f.face = -f.face`); drop it if not wanted** |
| K-N4 | Confetti | Utility | throws six harmless confetti that scramble a foe's controls 30 frames on touch | shot `{count:6, spread:0.08, vx:7, vy:-3, grav:true, r:4, dmg:1, kb:0, life:45, fxTag:'scramble', fxN:30}` | 8 | - | 14 | 1 x6 | 0 | Yellow Face's Buy Now is a priced poke; six near-zero shots whose only job is the status |

**Down special**

| Id | Name | Role | What it does | Vocabulary | St | Act | End | Dmg | Kb | Nearest and why different |
|---|---|---|---|---|---|---|---|---|---|---|
| K-D1 | Heel Spin | Damage | a grounded spin that hits once all round and launches diagonally | mv `{pose:'spin', st:6 (T4), act:6, end:20, boxes:[{s:{k:'o', x:0, y:0, r:40}, dmg:10, kb:[7,-7], stun:22}]}` | 6 | 6 | 20 | 10 | 7/-7 | Taco's Twirl is a 3.4% x2 air move; this is a grounded one-hit launcher |
| K-D2 | Marble Spill | Zoning | four marbles that bounce away along the floor | drop `{rider:'bounce', count:4, spread:5, dmg:2, kb:2, r:4, vy:4, life:60}` | 8 | - | 12 | 2 x4 | 2 | the bounce rider is one ball on the roster; four small ones make a rolling carpet |
| K-D3 | Fake-Out | Escape | dashes forward 5 frames then back 5, ending where it started, i-frames on the way out | mv `{pose:'dash', st:0, act:10, end:8, mv:[{t0:0,t1:4,mode:'set',vx:9},{t0:5,t1:9,mode:'set',vx:-9}], start: invuln 4}` | 0 | 10 | 8 | - | - | Leafy goes somewhere; this baits a swing and goes nowhere |
| K-D4 | Second Wind | Utility | 20 frames of breath: the air jump comes back and the run quickens for 2 s | stance `{frames:20, self:{jumps:1, haste:120}}`, spCd 150 | 20 | - | 6 | - | - | Puffball's float is flight; this is a refund and a sprint |

**Up special**

| Id | Name | Role | What it does | Vocabulary | St | Act | End | Dmg | Kb | Nearest and why different |
|---|---|---|---|---|---|---|---|---|---|---|
| K-U1 | Corkscrew | Damage | a rising hit that scrambles controls | rise `{shape:'hop', power:-12, hit:{off:-12, fx:4, reach:20, dmg:[6,10], band:-0.6, kb:[5,-8], eff:'scramble', n:60}}` | 3 | rise | 6 | 6-10 | 5/-8 | the two scrambling rises are drops; this one is the hit itself |
| K-U2 | Flare Back | Zoning | a rise that fires one shot back and down the way it came | rise `{shape:'hop', power:-11, shot:{vx:-8, vy:4, grav:false, dmg:5, kb:4, r:6, life:30}}` (vx is in the fighter's facing) | 3 | rise | 6 | 5 | 4 | Z-U2 guards below; this guards behind: the chaser eats it |
| K-U3 | Vanish | Escape | the lowest, longest sideways blink, 14 i-frames | rise `{shape:'warp', dist:110, dx:90, invuln:14}` | 4 | - | 8 | - | - | the roster's warps go up; this is nearly flat: a sideways escape, little recovery height (the Trickster's weakness) |
| K-U4 | Spring Heel | Utility | a rise that hands the jump back and leaves a slick spot behind | rise `{shape:'hop', power:-13, self:{jumps:1}, leave:'puddle'}` | 3 | rise | 6 | - | - | Z-U4 leaves a spark; this leaves a slip |

**Neutral smash**

| Id | Name | Role | What it does | Vocabulary | Wind-up | Dmg | Kb | Effect | Cost | Nearest and why different |
|---|---|---|---|---|---|---|---|---|---|---|
| K-S1 | Pirouette Kick | Damage | a step and a spinning kick that floors them | smash `{pat:'lunge', step:5, reach:34, fx:40, n:90}` | charge + 20 | 15 | 12 | knockdown | stun 22 | the lightest-costed 15% lunge; no status beyond the knockdown |
| K-S2 | Card Spray | Zoning | five cards rain ahead, each curving a little toward the foe, scrambling | smash `{pat:'rain', count:5, at:14, seek:0.2, r:6, n:60}` | charge + 18 | 5 x5 | 5 | scramble | cd 58 | Z-S2 slows with four; this scrambles with five lighter ones |
| K-S3 | Dash Through | Escape | the fastest through-dash | smash `{pat:'through', dash:9, spd:16, reach:24}` | charge + 18 | 11 | 9 | - | stun 20 | G-S2 strips; this is pure speed and distance |
| K-S4 | Hex Ring | Utility | a quick small burst that weakens | smash `{pat:'burst', frames:8, r0:20, rad:80, grow:18, n:70}` | charge + 14 | 6 | 4 | weaken | cd 52 | the quickest and smallest burst; a set-up, never a kill |

### 2.8 Honest notes on novelty and sharing

- **Melee and projectile options (32 of 64)** are new shapes/motions in the MOVESETS and `spawnProj` vocabularies: no roster move has these boxes, arcs or speeds. **Up specials (16)** are new UPSPEC rows; the four shapes (hop/warp/spin/plunge) are shared by the whole roster, novelty is in the hit/shot/drop/self mix. **Smashes (16)** are the least novel: all 12 `SM_PAT` patterns are used by 1-21 fighters already, so an OC smash is a new combination of pattern x status x cost x colour, not a new shape. If the owner wants truly new smash shapes, each is about 30 lines of new `SM_PAT` code; candidates: `orbit` (a ring that circles the body once), `pillar` (a column rising from the floor one body-length ahead), `fork` (two short beams on the up and down diagonals), `ricochet` (one shot that bounces off the floor twice). Recommended: ship the 16 as rows first, add one new pattern per type later if the owner asks.
- **Shared between types:** the four Escape hops (Z-D3, G-D3, T-D3, K-D3) and the four Escape warps differ in numbers, not kind; the two cleanse/heal utilities (Z-D4, G-D4, T-D4) share `ocCleanse`/healing. If the owner prefers fewer moves, the Escape row of the down special could be one shared move per type family (hop vs dash), cutting 64 to 60 distinct moves. Default: keep 64 so every type's list reads as its own.
- **Dependencies checked:** no option reads another fighter's body part, sprite, summon or kit-keyed state. The only kit-keyed systems an option touches are the tables listed in 2.9. The `landsTrap`, `leave:'trap'`, `puddle` and `bounce` riders draw the generic trap/puddle/ball art the roster already shares.
- **Viability of the 256 builds:** because each slot's four options hold four roles, a build is a role mix (e.g. Damage/Zoning/Escape/Utility or Damage/Damage/Escape/Damage), never a duplicate of another slot's job; the dominated builds the owner expects will be the all-Utility and all-Escape corners (no kill move) and the all-Damage corners (no way back to the stage). Section 8 measures this.

### 2.9 How an option is attached and dispatched (the engine change)

**Today.** A fighter's whole kit hangs on one string, `f.kit.special` (e.g. `"lemon"`): `doSpecial` switches on it (114 cases); `doDownSpecial` runs `DOWNSPECIALS[k]`; `doUpSpecial` runs `UPSPEC[k]` (101 rows) or `UPSPECIALS[k]` (10 functions); `doSmash` runs `SMASH_SPEC[k]` (104 rows) through `runSmashSpec`/`SM_PAT`, or `SMASHES[k]` (7); `msOf(f)` returns `MOVESETS[k]` for jab/tilts/aerials/throws; `ATKSPECIALS[k]` is the finisher; `endLagArm(f, slot)` and `tellAdd(f, slot)` look up `k + '.' + slot` in `ENDLAG_ADD` (203 rows) and `TELL_ADD` (27).

**Proposed.** The OC's fixed moves hang on the TYPE key exactly as today (`f.kit.special = 'oc_zoner'`), and the four picks live beside it:

```
f.oc = { type:'zoner', picks:{ ns:'Z-N2', ds:'Z-D1', us:'Z-U3', sm:'Z-S4' }, rf:0, look:{...}, name:'...' }
function ocKey(f, slot){ return (f.oc && f.oc.picks[slot]) || (f.kit && f.kit.special) || ''; }   // slot: 'ns' | 'ds' | 'us' | 'sm'
```

`OC_OPTIONS[id] = { slot, role, name, text, kind, ...row }` (64 rows). In each of the four dispatchers, one line before today's lookup: `if(f.oc){ ocRun(f, OC_OPTIONS[f.oc.picks.<slot>]); return; }`, after `armAtk`, `tellAdd` and `endLagArm` so tells, end lag, the attack animation and `_atkSeq` behave as for every fighter.

**Every place that reads `f.kit.special` (grep count: 153 lines; 98 spell it `f.kit.special`, the rest read it into a local `k`/`sp`)**, bucketed by the function it sits in:

| Bucket | Count | What they do | Must learn per-slot picks? |
|---|---|---|---|
| `applyHit` (19), `step` (10), `eliminate`/`ctfEliminate` (8), `fireSpecialInner` (5), `drawFighter` (5), `drawTendrils`, `wetSoak`, `isSpongy`, `isClock`, `foldyStep`, `puffPose`, `oneCatchShots`, `fsc1_hit`, `fsaB_pose`, `finx8Counter`, `finC2_histRec`, `fx8FallAt`, `stickyOk`, `empowerJabKb`, `mt*`/`wallJumpK` (6), `comebackPoints`, `teamAiContext`, `updateSummons`, `hitGraceFrames`, `hitCircle`, `hitShape`, `jabWas`, `freezePct`, `fighterAnchor`, `originX/Y`, `soakHit`, `swReaches`, `doAttack`, `doGroundMove`, `doUpTilt`, `genericSmash`, `netPredOut` ... | ~139 | `if(f.kit.special === "counter")`-style per-fighter passives (Needle's riposte, Paintbrush's fury, Pickle's scaling, Marshmallow's helium...) | **No.** An OC key (`oc_*`) never equals a roster key, so each is a dead branch for an OC. Zero risk, zero edits. |
| **Dispatch**: `doSpecial`, `doDownSpecial`, `doUpSpecial`, `doSmash` (+ `smashIdOf`, `smashKindOf`, `playSmashSfx`) | 7 | choose the move body | **Yes**: the one-line `if(f.oc)` hook each; the smash id/sfx helpers take `ocKey(f,'sm')` |
| **Keyed tables**: `endLagArm`, `tellAdd`, `mvId`, `swShapeAt` (via `mvStrike`), `runSmashSpec` (SLAM_ROWS) | 5 | build `key.slot`, pick swept shapes, mark slams | **Yes**: replace `f.kit.special` with `ocKey(f, slot)` (slot is already a parameter in four of them) |
| **Move card / audit**: `moveRowsFor`, `msWords`, `smashHowText`, `smashBlurb`, `rangeProfile`, `kitOfName`, `refreshSel` | 7 | the move list text and the headless audits | **Yes, cosmetically**: an OC's rows come from `OC_OPTIONS[...].text`; one branch in `moveRowsFor` |
| **Online**: `netFighter` | 1 | sends `kit:{special}` in the slow fields | **Yes**: also send the OC code (section 6) |
| **CPU**: `aiThink`, `planThreat`, `brainKit`, `brainRecover(sp)`, `ZONERS_PLAN`, `FINX_AI_KITS`, `DASH_KITS` | ~6 | what the brain knows about a kit | **Yes, for a CPU-played OC**: `brainKit` should read an `OC_AI` row per option (section 6) |

Total that must change: **14 dispatch/keying points + 7 text/audit sites + 1 network + ~6 brain sites ≈ 28 edits**, all one-liners except `ocRun` (~60 lines), `ocDrop` (a lift of ~15 existing lines), `ocCleanse` (~10) and the editor UI. Risk: **low-medium**; the dangerous part is not the count but `doSpecial`'s 1005-line switch, where the hook must sit after `tellAdd`/`endLagArm` and before the `switch`, and `fireSpecialInner` (5 readers: the press-to-special path) which must not short-circuit an OC. The existing frame-budget audit (frame-budget-audit.csv's generator) re-run over the 64 options is the acceptance check.

---

## 3. Shield or reflector

- **What exists.** Z held raises a shield bubble (`zsStep`, `_zsOn/_zsM/_zsBrk`) for everyone except the nine in `REFLECTOR_FIGHTERS` (Toothpaste, Magnet, Tennis Ball, David, Puffball, Firey, Bomby, Lollipop, Pencil), whose Z is a reflector pane (`_rfT/_rfF`: 6 frames to arm, up to 36 held, 22 end lag, 30 before it can be raised again; shots back at 1.8x speed, 1.3x damage, 12% cap; melee and grabs pass). `isReflector(f)` is the single test (8 callers) and there is **one** direct `REFLECTOR_FIGHTERS.has(...)` call that should become `isReflector(f)`.
- **The OC flag.** `f.oc.rf` (0 = bubble, 1 = reflector). Change: `function isReflector(f){ return !!f && (REFLECTOR_FIGHTERS.has(f.name) || !!(f.oc && f.oc.rf)); }`. Confirmed easy: one line plus the one direct call.
- **Balance note.** The owner gave the reflector to the nine strong fighters because a bubble on top of their stats was too much; for an OC the choice is a real trade (a reflector loses the bubble's melee cover), so no option is gated by it. The editor text: "Shield: a bubble that blocks everything and shrinks. Reflector: no bubble; turns shots back harder. Melee goes through."

---

## 4. Skins and the look

**What the wardrobe is today.** `COSMETICS` has 320 `skin` rows (each a second PNG of ONE fighter, `fighter:` bound, drawn by `drawSpriteBody`), 13 `hat` rows (code-drawn by `drawCosHat(c, id, s, topY, eyeY)`: only a top line and an eye line are needed), 9 `trail`, 9 `ko`, 6 `pose`, 8 `card`, 8 `title`. `cosOf(f)` returns `{skin, hat, trail, ko}` for a fighter; online a look travels as a compact position code (`cosNetCode`) inside the hello name. Hats, trails and KO effects are fighter-independent; skins are not.

**The honest cheapest body.** The renderer already has a no-sprite fallback ("the blob": a filled circle of radius `f.r` with eyes that follow the facing, used whenever `SPRITES[name]` is missing or still loading; the hurtbox falls back to the 24 px circle when `hurtboxFor(name)` is null). An OC is that body, drawn by a small `drawOcBody(f, look)` in place of the sprite branch:

| Part | Picks | How |
|---|---|---|
| Silhouette | fixed per type: Zoner circle, Grappler rounded square, Trapper tall capsule, Trickster diamond | 4 small path functions; hurtbox stays the 24 px circle for all four so looks never change hits |
| Body colour | 16 palette swatches (the roster's colours, so nothing clashes with the maps) | `look.c` 0-15 |
| Pattern | none / stripe / dots / split / rim | `look.p` 0-4, drawn with the second palette colour `look.c2` |
| Eyes | 4 (dot, oval, half-lid, cross) | `look.e` |
| Mouth | 4 (smile, flat, grin, open) | `look.m` |
| Hat | any of the 13 wardrobe hats the player owns, or none | `look.hat` = cosmetic id; `drawCosHat` as today |
| Trail, KO effect | the player's worn global trail/ko (they are per-player today) | nothing new |

**OC skins.** An OC holds up to **3 looks** (`looks[0..2]`, the first is the default). In fighter select the Skins tab (`buildSelSkins`, `MC_TAB = 'skins'`) lists them like a fighter's skins; the editor's "Look" step edits the selected one. No PNGs, no Store rows, no Win Token prices (OC looks are free: they are the player's own art).

**Name field.** 1-16 characters, letters, digits, spaces, `'` `-` `.` `!`; trimmed; run through the filter (section 7) on save; the name is drawn where a fighter's name goes (name tag, KO banner, result card). Default name: the type ("Zoner").

---

## 5. UI

**Entry.** One `OC` button on the fighter select board (next to the move card's tabs; the title screen stays as it is: the owner's menus are already full) and an "OC" tile in the roster grid that opens the saved-OC list. Keyboard only: arrows move, Enter picks, Esc backs out, as every other screen.

**Editor flow** (one screen, a left-to-right step bar; each step is a list):

```
+----------------------------------------------------------------------------------+
|  MAKE AN OC          [Type] [Look] [Neutral] [Down] [Up] [Smash] [Z] [Name] [Save] |
|----------------------------------------------------------------------------------|
|  TYPE                                   |  preview                                 |
|  > Zoner      holds a lane with shots   |    (the blob in its silhouette, colours, |
|    Grappler   big hits up close         |     hat; plays the picked move's hit art |
|    Trapper    things on the floor       |     on a dummy when a slot is hovered)   |
|    Trickster  in and out, mix-ups       |                                          |
|----------------------------------------------------------------------------------|
|  Stats: weight 86 (same for every OC) · run 0.97 · jump 1.03 · fall 0.96 · dmg 1.0 |
+----------------------------------------------------------------------------------+
```

```
|  NEUTRAL SPECIAL (pick one)                                                      |
|  > Skyfall Spark   DAMAGE   lobs a spark high; it falls almost straight down       |
|    Drift Orb       ZONING   a slow orb floats down the lane and passes through    |
|    Backstep Flare  ESCAPE   hops back with 6 safe frames and a dart               |
|    Overcharge      UTILITY  stand 20 frames; your next hit does +30%              |
|  12% · starts in 8 · 22 frames of lag on a miss                                   |
```

```
|  Z                                                                               |
|  > Shield     a bubble that blocks everything and shrinks as it takes hits        |
|    Reflector  no bubble; turns shots back harder; melee goes through              |
|  NAME  [ Sparky_______ ]   (letters, numbers, 16 at most)                         |
|  SAVE  -> "Saved. Pick it from the OC tile on the fighter board."                 |
```

**Saved list** (the OC tile): up to **8** OCs, each row: silhouette + name + type + the four pick names; Enter = pick for this match, E = edit, D = delete (asks once), N = new (greyed at 8). Picking an OC puts it in the player's slot like a fighter; the slot's card shows "OC · Zoner · Sparky". CPU slots may also be given a saved OC from the same list (the AI picker gains an "OC" row).

**Move card.** The kit tab lists the four picked options with their role labels and the fixed type moves below; the skins tab lists the OC's looks. Texts come from `OC_OPTIONS[id].text` (one line each, as above).

---

## 6. Save and online

### 6.1 Data format

```json
{ "v":1, "id":"k7f3q2zd", "name":"Sparky", "type":"zoner", "rf":0,
  "picks":{"ns":"Z-N2","ds":"Z-D1","us":"Z-U3","sm":"Z-S4"},
  "looks":[{"c":4,"c2":11,"p":1,"e":0,"m":2,"hat":"hat_crown"},{"c":9,"c2":0,"p":0,"e":3,"m":0,"hat":null}],
  "worn":0 }
```

About 150 bytes an OC (under 220 with three looks); 8 OCs under 2 KB. `v` is the schema version; a loader drops unknown types/picks to the type's defaults rather than refusing the file.

### 6.2 Where it is stored

Through `BStore` (the game's storage layer: `window.storage` in the artifact host, else `localStorage`; every touch wrapped, as `profile:v1`, `bfsi:keymap`, `bfsi:ctfkits` are) under **`bfsi:ocs`** = `{ "v":1, "list":[...] }`. Kept separate from `profile:v1` so a corrupt OC file can never cost the player their unlocks or wallet, and so the no-storage path (`PROFILE.migratedFrom === 'no-storage'`) still lets a player make a one-session OC that simply does not persist.

### 6.3 Online sync

**What travels today.** A player announces `fighterName~cosCode|side` (`helloName` -> `netHelloName` -> `cosNetCode`); the host builds the roster as a list of fighter names, validating each against `ROSTER` (`ROSTER.some(r => r.play && r.name === n) ? n : "Firey"`), and every client runs `__setupCustomMatch(roster, ...)` from the same list; afterwards the host's snapshot (`netFighter`) carries each fighter's `name`, `color`, `koCap`, `team` and `kit:{special}` in the slow fields (`NET_STAT`, once a second) plus the flag list `NET_FIGHTER_FLAGS`.

**Cheapest sync.** The OC rides where the cosmetics code rides: the hello name becomes `OC~<code>` where `<code>` is the OC JSON above, minified, base64url (about 200 characters; the hello field is free text with no fixed cap today). Then:

1. **Host validates** on arrival (`netSplitName` branch for the `OC~` prefix): `type` in the four; each pick an id in `OC_OPTIONS` of the right slot and type; `rf` in {0,1}; look indices in range; `hat` an existing cosmetic id (the host cannot check ownership, and should not: a hat is a look); name 1-16 chars, filtered (section 7). Anything invalid is replaced by the type's defaults, a bad name by "OC". A roster entry is then the canonical re-encoded code, so a tampered OC cannot pick two Damage options or invent a fifth type: **the host is the only authority on what the OC is**, as it is on every hit.
2. **Roster list** entries may be `OC~<code>` (the validation line above gains the `OC~` case; `ocRow(code)` builds a ROSTER-shaped row `{name, w:86, color, play:true, arch, kit:{special:'oc_'+type}, oc:{...}}` and `makeFighter` copies `r.oc` to `f.oc`). Every client builds the same fighter from the same code: nothing else needs to travel.
3. **Late joiners / spectators** need the code too: `netFighter`'s slow fields add `oc:<code>` beside `kit:{special}` (once a second, only for OC fighters; ~200 bytes), and `applySnapshot` builds the row if it has none. Prediction (`netPredOut`) is unchanged: the moves run the same code on both sides.
4. **Versioning.** A client on an older build that does not know `OC~` falls into today's `"Firey"` fallback, which is the graceful failure: the match still starts.

The live relay is not touched by any of this and must not be: the OC code is payload inside the messages the relay already forwards.

### 6.4 Can a CPU use an OC?

Yes, with one table. The brain's knowledge of a kit is `brainKit(f)` plus kit lists (`ZONERS_PLAN` for ranged pressure, `FINX_AI_KITS`, `DASH_KITS`) and `brainRecover(f, inp, B, sp)` for the way back; cpu-kit-usage.md (2026-10-29) found the reader only knows a few move kinds: a shot, a trap, a heal, a stance (counter or brace), and a finisher. So each option carries `ai:{kind:'shot'|'melee'|'trap'|'heal'|'stance'|'dash'|'warp'|'hop', range, up:bool}` in `OC_OPTIONS` and `brainKit` returns the OC's four `ai` rows when `f.oc` is set; a Zoner OC is also counted as ranged pressure in `planThreat`. Without this, a CPU OC would jab and nothing else (the gap the kit-usage report measured for 56 roster fighters). The idle playtest can then run CPU OCs against the roster for free.

---

## 7. Name filter

**Approach.** A short local list (about 60-80 stems: the common English profanities and slurs, their plural/ -ing forms are covered by stem matching), applied as `nameOk(s)`:

1. normalise: lower-case; map leetspeak (`0->o 1->i 3->e 4->a 5->s 7->t 8->b @->a $->s !->i`); drop everything that is not a-z; collapse runs of the same letter (`fuuuck` -> `fuck`);
2. match: for each stem, substring match; stems of 4 letters or fewer (where "Scunthorpe"-style false hits live) match only as whole words in the un-collapsed, space-kept form;
3. also reject: empty after trimming, over 16 chars, any name equal (after normalising) to a roster fighter, "Steve Cobs", a hidden prize fighter or an unreleased fighter (impersonation), and the single word "OC" is allowed only as the fallback.

**Where it runs** (the same function in all three places so they cannot disagree): the editor on save (shows "Pick another name" and keeps the old one), the host on hello (replaces the name with "OC" in the canonical code, so every client sees the clean one), and each client on display as a belt-and-braces (a host on an older build forwards names it did not check). It also covers the only other player-typed text online today, nothing: fighter names are the roster's. Level names (`edName`, 24 chars) are local only.

**Limits.** A word list cannot catch everything: other languages, deliberate misspellings beyond leetspeak, split words, allusions and names that are offensive in context. It will also wrongly reject a few real words (the whole-word rule for short stems keeps that rare). There is no report button and no server, so what the list misses stays until the owner adds the stem; keep the list in one `const OC_BAD_STEMS = [...]` so adding one is a one-line change. The list itself should be written by the build agent and never pasted into owner-facing docs.

---

## 8. Balance test plan

**Harness.** Headless, as the existing batches (`scripts/helpers/load-monolith.js` + `match-setup.js`; the pattern in the scratchpad `fin-c2/lib.mjs`: `boot(seed)`, `__setupCustomMatch(names, ...)`, `step()`), one node process, BelowNormal, each run under 100 s (so a batch is many short runs writing one CSV). An OC in the harness is a roster row from `ocRow(code)`, so the same code path the game uses.

**Design: main effects first, full builds second.** 256 builds x 4 types all-against-all is 260k matches: not needed, since the slots are independent choices.

| Stage | What runs | Matches per type | Measures |
|---|---|---|---|
| A. Option main effects | for each slot, each of the 4 options with the other three slots at the type's default (option 1), vs a 6-fighter reference panel (Firey, Leafy, Pin, Taco (II), Flower, Gelatin: the type references plus a heavy and a fast one), Expert CPU both sides, 2 seeds, 2 stages | 16 builds x 6 x 2 x 2 = 384 | win share, damage dealt/taken, mean KO time, uses per match of the option (`f._used[slot]`) |
| B. Corner builds | the 16 builds the stage-A effects predict as best 8 and worst 8, same panel | 16 x 24 = 384 | the same, plus "no win in a stock" rate |
| C. Mirror and cross-type | each type's default build vs the other three types' defaults, 2 seeds | 12 x 2 = 24 | type-vs-type parity |

**Thresholds (flags for the owner, never silent tuning):** an option whose main-effect win share is outside **40-60%** vs the panel; a build over **65%** or under **35%**; an option the Expert CPU uses under **once a match** (the brain cannot play it: fix `ai` row, not the move); a status whose lock exceeds 45 frames in the log; any frame-budget audit row outside its class target. "Dominated" = an option whose every build is beaten by the same slot's alternative in both win share and damage ratio.

**Cost.** About 790 matches a type, roughly 1 s each headless at 2 stocks: 15-20 minutes of BelowNormal CPU a type, four types in one evening of background runs. Agent tokens: one lean agent per type to run and read the CSV, about 25k tokens each (the matches are automated; the cost is reading the table and writing the flags): **~1.5% of a week per type**. This is the "balance check after each type job" in section 9. The owner's memory rule (a tournament is 15 matches; fewer tokens) applies to the owner's visible tournaments, not to the headless batch, but the batch results should still be reported as one short table.

---

## 9. Build plan

Lean single agents, one per job, in order; each job ends with the acceptance checks listed and with the build shown to the owner (no tests: build, check it boots, show the owner, per the house rule). Pushes to main only on an update day or "ship now".

| # | Job | Scope | Acceptance | Credit |
|---|---|---|---|---|
| 1 | **Engine** | `OC_OPTIONS` table shell (ids, slots, roles, text: empty rows), `ocKey`, `ocRun` (+ `ocDrop` lift, `ocCleanse`), the 14 dispatch/keying edits, `isReflector` flag, `ocRow`/`makeFighter` copying `oc`, the four type rows with placeholder fixed kits (a copy of the generic jab/tilt/aerial set), `drawOcBody` with the four silhouettes + palette, `bfsi:ocs` load/save | boots with 0 errors; a hard-coded OC plays a full CPU match headless with all four slots pressed (`f._used` shows ns/ds/us/sm); the frame-budget audit script runs over `OC_OPTIONS` without crashing; a reflector OC turns a shot | ~8% |
| 2 | **Zoner** | the 16 Zoner options as rows (section 2.4), the Zoner fixed kit (13 MOVESETS moves, finisher placeholder), ENDLAG_ADD/TELL_ADD rows, `ai` rows; then the section-8 batch | audit: every option in its class target; batch flags written to reports/oc-balance-zoner.md; owner sees the four neutral specials in training | ~5% |
| 3 | **Grappler** | as job 2 for section 2.5 (incl. G-D4 `ocCleanse`) | as job 2 | ~5% |
| 4 | **Trapper** | as job 2 for section 2.6 (verify T-D2 resting shot, T-N2 trap kind) | as job 2 | ~5% |
| 5 | **Trickster** | as job 2 for section 2.7 (K-N3 face flip) | as job 2 | ~5% |
| 6 | **Editor + select + save UI** | the editor screen, the OC tile and saved list (8), the Skins tab for looks, the move card text, the name field + filter, keyboard navigation, the CPU "OC" picker row | the owner makes an OC from the keyboard, plays it vs a CPU, closes and reopens the game and it is still there; a bad name is refused; a 9th OC is refused | ~6% |
| 7 | **Online** | `OC~` hello code, host validation + canonical re-encode, roster `OC~` case, `netFighter`/`applySnapshot` slow field, the name filter on the host and on display; tested host/client in two headless windows with the existing net harness; **never the live relay** | two headless peers show the same OC body and picks; a tampered code (fifth pick, bad name) arrives as the type default; an old-build client falls back to Firey without an error | ~4% |
| 8 | **Changelog + balance notes** | the What's-new entry for the update (no hidden names), per-type balance notes from the four batch reports, an "OCs" line in How to Play | reads clean; the owner approves | ~1% |

**Total: about 37-39% of a week.** Jobs 2-5 are independent of each other once job 1 lands and can go in any order; job 6 can start after job 1 too, so the work spreads naturally over two or three update cycles (e.g. jobs 1-2-6 in one cycle to ship Zoner OCs first, the other three types next). Under the 2026-11-03 credit rule (weekly use under 95%, no new heavy workflows) that spread is the recommendation, not a single week.

---

## 10. Open questions for the owner (with recommended defaults)

1. **Ship one type first or all four?** Default: **Zoner first** (jobs 1, 2, 6 in one update), the other three the next cycle; the editor shows the other types greyed "coming".
2. **Smash shapes: rows only, or one new `SM_PAT` per type (orbit / pillar / fork / ricochet, ~30 lines each)?** Default: **rows only** now; add new patterns in a later update if the 16 smashes feel too familiar.
3. **Looks: is the code-drawn blob body acceptable, or must OCs use pictures?** Default: **the blob** (it already exists as every fighter's fallback); pictures would mean an upload path and an art review on every online name, which this spec does not cover.
4. **Hats on OCs: any wardrobe hat the player owns, or every hat free for OCs?** Default: **owned hats only** (keeps the Store meaningful; a hat on an OC is still the hat they bought).
5. **CPU OCs in Expert World Cups and the idle playtest?** Default: **yes, only when the player picks an OC for a CPU slot**; the automatic rosters stay roster-only so the owner's 50 World Cup results stay comparable.
6. **Number of saved OCs: 8?** Default: **8** (fits one list screen; under 2 KB of storage); raise later if asked.

*Not asked, decided by the owner already: no weight choice; no stat sliders; no touch; no new paid packs (tip-jar rule); the OC is never called a Mii.*

## 2026-11-10 OWNER: "the archetype does not determine all the moves for ocs!" / "the archetype determines a main point, not the entire character."
New rule: the TYPE sets the main point only (its basic attacks/feel, finisher and Final Smash); the four slots (neutral special, down special, up special, neutral smash) each pick from ONE SHARED POOL of all four types' options for that slot (16 per slot). Shield-or-reflector is free for every type (owner: yes). Still no weight choice, no role labels/tags anywhere, called OC. Needs: editor UI for 16-option slots, wire codes/online, CPU reads for cross-type moves, a balance pass for cross-type builds (best cross-type builds must not exceed the band). Queued as OC job 4.

## 2026-11-10 OWNER APPROVED oc-moves-v2.md ("yes for 1 and 2"): the move list incl. drops/merges approved; the Grappler keeps BOTH Haymaker and Pile Driver (no paired nerf). Balance band for OCs stays 25-40% win share (the draft's 45-60% was wrong).
