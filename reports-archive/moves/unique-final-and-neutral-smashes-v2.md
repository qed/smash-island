# Unique smashes v2: new SHAPES, not just new effects (2026-11-12)

Status: see the last section ("Done / not done") for what is finished.

You said about batch 1: "change what is needed. and make them better and more different."
So every move below gets a new SHAPE and a new idea that you can see on screen. None is only an effect swap.

**Nothing is built. Nothing in the game was edited. Nothing was run or simulated.**
Every "now" number is the number written in the code on branch ii-dlc. Every "new" number is a proposal on paper.

## Read this first (honest notes)

- **I did not check any episode.** Sources are (a) what the game's own code notes say, (b) what the object is, or (c) "invented". Where I name an episode from memory I say "from memory, not checked".
- **Look-alike check.** I checked each new move against (1) all 102 Final Smash menu lines, (2) all neutral smash rows by shape + effect + numbers, and (3) the other new moves here. I did NOT read the code of the 61 hand-made Final Smash scenes, so that check is by their menu line only.
- **Strength.** I kept the total damage and launch at or under today's. But 4 of these (Rose, Bot, Box, Bonesaw) now hit EVERYONE in an area where the old move held ONE foe, and others cover a new area. That can make a fighter stronger, most of all in 4-player games. 14 of the 19 moves carry a "COULD BE STRONGER" flag (table near the end). They need a look when built.
- **Line numbers.** The Final Smash factories are at about 35597-36060 in this file today (the brief said about 35130-35470). SM_FX is at 75067, SM_PAT at 75754, SMASH_SPEC at 75944.
- **How a Final Smash is timed in the code** (so the specs below make sense): each has an ENTRANCE of W frames (30 to 40) that is its tell. A "catch" lands 14 frames (FS_WIND) before the blast: foes inside the catch area at that moment are locked. So "how to dodge" always means: be outside the drawn area before frame W-14.
- **Tells: a clash you should know about.** The code has a standing note "NO TELLS" on the shared ring and blast art (the hit area is drawn only as it lands; the wind-up pose is the tell). Several designs here DO show the area first as a prop (Book's page, Box's belt, Baseball's chalk lines, Bonesaw's dotted line, Pickle's crosshair), because this job asked for a clear tell. If the no-tells rule still stands, say so: those five would need their props shown only from the catch frame.
- **Not touched:** Bell, Gelatin, Fern, Fanny's neutral, Barf Bag, Marker, Pillow, Taco (II), every kept batch 1-6 move, Blocky's anvil, Sidewalky's slab (you said it stays). No hidden fighter or event fighter is named or changed.
- **No sky drops.** Nothing below comes down from above. Pickle's is redesigned (F11). Marshmallow's neutral today is "something arrives from the store and comes down on you"; the new one slides in along the floor (N1).

## Who keeps the old shape in each group

| Group | Keeps the old move | Gets a new move here |
|---|---|---|
| A hold + hits + throw | Bracelety | Rose F2, Bot F7, Box F8, Bonesaw F12 |
| B stream of blobs | Tissues | Toothpaste F1 |
| C run along the floor | Lifering (and Needle, see end) | Fan F3, Woody F10 |
| D sound wave | Microphone | Tapey F4 |
| E two rings | Bomb (and Nickel (II), see end) | David F5 |
| F thrown at nearest foes | Money | Book F6 |
| G shockwaves both ways | Yin-Yang | Baseball F9 |
| H mark then blast | Sidewalky | Pickle F11 |
| N1 root and hit all round | Teddy Bear | Marshmallow N1, Bonesaw N2 |
| N2 beam + knockdown | Nickel (II) | Tissues N3 |
| N3 step and swing + burn | Firey | Firey Jr. N4 |
| N4 ring + knockdown | Balloon | Goo N5 |
| N5 step and swing + knockdown | Silver Spoon (Trophy is kept by you) | Apple N6 |
| N6 beam + stun | TV | Tapey N7 (optional) |

---

# PART 1: FINAL SMASHES

## F1. Toothpaste: "You're My Enemy Now!" becomes THE BIG SWIRL

- [ ] **Yes, build this**

| | Now | New |
|---|---|---|
| Shape | 14 blobs squirt forward, then one big glob (same as Tissues) | One long ribbon of paste winds out round her in a growing SPIRAL, like paste on a brush. Then the whole swirl flashes mint-white and bursts. |
| Effect | pure damage | ribbon slows (sticky); pure damage hits |
| Damage | 14 x 7 + 18 (116 on paper if every blob hits one foe) | tip 12 (up to twice) + burst 20 = 44 at most |
| Launch | 24 / big 26 | tip 8 (a small pop), burst 24 |
| Who it hits | whoever is in the stream | everyone within 340 px, all round her |

- **Source:** from the object (the swirl of paste on a toothbrush). Her kit already slows with paste (code notes: Long Smear, Squeeze Out). Staging invented.
- **Tell:** her existing squeeze entrance (3 pulses, 34 frames) and the cap popping off. Then the ribbon itself is slow enough to read: it takes 48 frames to reach full size.
- **How to dodge:** get more than 340 px away, or stand in the gap between two coils (140 px apart) and hop the tip when it comes round. Do not touch the ribbon when it flashes.
- **Look-alike check:** no Final Smash is a spiral. Clock's hands "sweep round" (a straight hand, with freeze). Not a match in shape, effect or numbers.
- **Balance:** on paper the top total falls from 116 to 44. I do not know what the old stream really lands on average (the blobs fall and many will miss). Builder: measure the old move first, then set the burst so the new average is not higher. COULD BE STRONGER: it now covers all round her, not just in front.

**BUILD SPEC (needs new code, about 70 lines, a hand-made row like Book's at 35521):**
- Row: `id:'enemynow'`, keep `fsaA_wrap` and the TOOTHPASTE_FS entrance (W 34). `catch`: circle r 110 round her (only the first coil locks anyone; the rest can be dodged).
- Frames (t counted from the blast, t=0 at W): t 0-48 the tip travels. Angle a(t) = a0 + face x 0.262 x t (two full turns; a0 = straight ahead, turning upward first). Radius r(t) = 60 + 5.8 x t (ends at 340).
- Tip hitbox: circle r 30 at the tip. Hit: 12 damage, kb 8 outward from her, ky -8. Each foe at most once per turn (store the turn number in `st.hitTurn[idx]`).
- Ribbon: keep the points in `st.pts` (one every 2 frames). A foe within 22 px of any point gets `fsStatus(x, f, {slow:90})`. No damage.
- t 58: the flash. Every foe within 26 px of any ribbon point: 20 damage, kb 24 away from her, ky -12 (about 27 degrees up). Use `applyHit` directly, as fsCircle's second ring does.
- End lag: 30 frames. `dur` = W + 58 + 30.
- Draw: ribbon = thick white line (16 px) with a blue stripe (#4cc3ff) and a red stripe, dark outline; the tip is a round blob; at the flash the ribbon goes white for 4 frames then breaks into FS_GLYPH.paste blobs. Body: reuse the tube-squash deform `fsaA_toothBody`.
- Remove: the fsHose row for her at 37636 (Tissues keeps fsHose).

---

## F2. Rose: "Thorn Lash" becomes BRIAR PATH

- [ ] **Yes, build this**

| | Now | New |
|---|---|---|
| Shape | binds the nearest foe, 6 lashes, throw (exact twin of Bracelety) | A thorn vine grows out of the floor at her feet and SNAKES forward in big waves, a rose blooming on each crest. It stands for a moment as a thorn hedge, then she whips it back. |
| Effect | pure damage | bleed (as her own smash, Bramble Drag) |
| Damage | 6 x 3 + 18 = 36 | growing vine 12 + whip-back 16 = 28, plus bleed |
| Launch | 22 | vine 6 (a pop), whip-back 22 toward her side, upward |
| Who it hits | one foe | everyone on the vine's path, 640 px ahead |

- **Source:** from the object; her own kit bleeds (code note on Bramble Drag). Staging invented.
- **Tell:** her entrance, then the vine visibly grows from her feet at 16 px a frame, so far foes see it coming for up to 40 frames.
- **How to dodge:** the vine is a wave. Stand under a crest or jump over a dip; or be behind her. The whip-back only hits foes touching the hedge.
- **Look-alike check:** Fern and Tree wrap ONE foe in vines (holds). Needle's is a straight thin cut. Cherries's is a flat oil slick. No snaking wall exists.
- **Balance:** 36 down to 28 to pay for the bleed and for hitting more than one foe. Builder: the measured total with bleed must not pass 36. COULD BE STRONGER: hits several foes (was one).

**BUILD SPEC (needs new code, about 60 lines, hand-made row; replaces the fsLock row at 37425):**
- Keep `fsaB_row(..., fsaB_rose)` at 43636, but the entrance's bind art must be cut down to her own pose (there is no held foe any more).
- `catch`: box ahead, 0 to 160 px, 120 tall (`fsBoxAhead(f, 0, 160, 120, f.r)`): only the first wave locks.
- Path: x(s) = feet + face x s, y(s) = floor - 60 - 60 x sin(s / 41.4), for s from 0 to 640 (wavelength 260 px, crests 120 px above the floor, dips on the floor). Head position s = 16 x t, t 0-40.
- Head hitbox: circle r 26. Hit: 12 damage, kb 6 x face, ky -6, then `fsStatus(x, f, {bleed:150})`. Once per foe (`st.hit`).
- t 40-64: the hedge stands. No damage. Drawn only.
- t 64: whip-back. Every foe within 30 px of the path (sample every 20 px): 16 damage, kb -22 x face (thrown back toward and past her), ky -14 (about 32 degrees up). A foe hit by the head CAN be hit again here.
- End lag 26 frames.
- Draw: dark green vine 10 px thick with thorns every 24 px, a rose (FS_GLYPH.rose) at each crest opening as the head passes; whip-back = the vine pulls straight in 4 frames with loose petals.

---

## F3. Fan: "You Leave Us Alone!" becomes FULL BLAST

- [ ] **Yes, build this**

| | Now | New |
|---|---|---|
| Shape | an armoured charge along the floor (same as Lifering) | He plants his feet, his blades spin up, and a CONE of wind blows from his face for a full second. Foes are pushed away and pelted with loose blog pages. One last gust launches them. |
| Effect | pure damage | push (new for a Final Smash), pure damage |
| Damage | 20 | 4 pages x 2 + last gust 12 = 20 |
| Launch | 22 | pages 0 (the wind moves them), last gust 22 |
| Who it hits | everyone on a 700 px line | everyone in a cone 560 px long, 35 degrees up and down |

- **Source:** he is a fan (the object). His blog is from the show (II season 2, from memory, not checked); the flying pages are invented.
- **Tell:** entrance: he digs his heels in and the blades blur (30 frames). During the wind, streak lines show the whole cone.
- **How to dodge:** be behind him or above the cone before it starts. Inside it, hold toward him: the wind pushes 5 px a frame, so a fast fighter can fight it, and the last gust only hits foes still in the cone.
- **Look-alike check:** Fanny's wind sends ONE held foe up a shaft. Soap vacuums one foe. Nothing else pushes an area. v1's idea used the round push (fsPull's push switch); a cone reads more like a fan.
- **Balance:** same 20 and 22. He loses the armoured travel. COULD BE STRONGER near a blast line: 60 frames of push can carry a foe toward the side before the gust. Builder: cap the total push at 300 px per foe.

**BUILD SPEC (needs new code, about 55 lines; copy fsPull at 35908 and change the area test. Note: fsPull's `push` switch is used by no fighter today, so it has never run in a match):**
- New factory `fsCone(o)` or a hand-made row. Entrance: replace the dash art in the `fsaA_wrap` at 44523.
- `catch`: fan shape `{ kind:'fan', cx:f.x, cy:f.y, r0:0, r1:200, a0:-0.61, a1:0.61, face }` (the shape fsFan's catch returns, about 35790).
- t 0-60 (from the blast): each frame, every foe inside the cone (distance under 560, angle within 0.61 rad of his facing): `x.x += face x 5 x (1 - 0.5 x d/560)`; stop once `st.pushed[idx]` reaches 300.
- Pages: at t 8, 20, 32, 44 one hit of 2 damage, kb 0, on every foe in the cone (`applyHit(x, 2, 0, -1, f)`, as fsLock's pin hits do).
- t 60: last gust. Foes still in the cone: 12 damage, kb 22 x face, ky -10 (about 24 degrees up).
- End lag 30 frames. He does not move.
- Draw: white streak lines flowing along the cone (reuse the streak loop in fsPull's draw), 6 to 8 small paper sheets tumbling down-wind, blades drawn as a blur disc on his face (FS_GLYPH.fanblade spun fast).

---

## F4. Tapey: "Playback" becomes REWIND

- [ ] **Yes, build this**

| | Now | New |
|---|---|---|
| Shape | a sound wave rolls along the floor (same as Microphone) | A ribbon of tape shoots out of her deck in a straight line and STICKS to everyone it touches. Then she rewinds: the tape reels them all the way back to her. Then EJECT: her deck door pops and blasts them away. |
| Effect | pure damage | drag-in (reel), pure damage |
| Damage | 20 | tape 4 + eject 16 = 20 |
| Launch | 22 | tape 0, eject 22 |
| Who it hits | everyone on a 700 px line, 100 tall | everyone on a 700 px line, but only 44 tall |

- **Source:** from the object (a cassette: play, rewind, eject). Her entrance in the code already has a rewind and an eject recoil. Staging invented.
- **Tell:** entrance (34 frames: her reels spin backwards, the grille swells). The ribbon takes 25 frames to reach full length.
- **How to dodge:** hop over the ribbon (it is thin and chest-high), or be behind her. Once taped you are reeled in; you cannot break off.
- **Look-alike check:** Microphone keeps the wave. Remote "rewinds" ONE held foe (a hold, with mute). Lollipop and Black Hole drag foes to a round patch. Blueberry hauls one foe. A straight reel line that drags several foes does not exist.
- **Balance:** same 20 and 22. The hit zone is thinner (44 against 100), so it is easier to avoid. Foes are launched from HER spot, the way she faces, not from where they stood. That is weaker when she faces the middle of the stage. COULD BE STRONGER when she stands near a ledge facing out: the reel brings far foes to the ledge before the launch.

**BUILD SPEC (needs new code, about 55 lines; start from fsLane at 35739 for the out-run and fsPull's drag loop at 35908 for the reel):**
- Keep `fsaB_row(..., fsaB_tapey)` at 52304 (W 34, its 50 px eject recoil stays, moved to the eject frame).
- `catch`: `fsBoxAhead(f, 0, 160, 22, 22)` moved to chest height (only the first 160 px locks).
- t 0-25: ribbon head at x = start + face x 28 x t (700 px). Hitbox: box 40 wide at the head, 44 tall, centred on her chest height (fixed at start, `st.cy`). On touch: `applyHit(x, 4, 0, -1, f)`, add to `st.caught`, `fsPin` them where they are.
- t 25-31: hold (the tape goes taut, a click).
- t 31 on: rewind. Each frame every caught foe moves 28 px toward the point 60 px in front of her (`fsPin(x, nx, st.cy)`), stopping there. All have arrived by t 56 at the latest.
- t 58: EJECT. `fsBurst(f, st, f.x + face x 60, st.cy, 110, 16, 22 x face, -12, null)` (about 29 degrees up). Clear `st.hit` first so caught foes take it.
- End lag 26 frames.
- Draw: brown tape ribbon 8 px (#5a3a22) with a shine line, slightly wavy going out, dead straight when taut; caught foes get two loops of tape round them; on rewind her two reels spin and the ribbon shortens; eject = her deck door flips open with a white flash (reuse the entrance's eject art).

---

## F5. David: "Aw, Seriously!" becomes TANTRUM CLOUD

- [ ] **Yes, build this** (careful: you rejected a David change once before, his down special. Skip this if David should be left alone.)

| | Now | New |
|---|---|---|
| Shape | a ground-pound ring, then a wider ring (same as Bomb) | He throws a tantrum and turns into a cartoon FIGHT CLOUD: a scribbled dust ball with his stick arms and legs poking out. It rolls slowly forward, swallows anyone it touches, pummels them, then bursts. |
| Effect | pure damage | pure damage |
| Damage | 22 (first ring) or 12 (second ring) | up to 4 scribble hits x 3 + burst 10 = 22 |
| Launch | 20 / 14 | scribble 0, burst 20 |
| Who it hits | everyone within 260 px (then 360) | everyone the cloud touches on a 390 px roll; the cloud is 100 px in radius |

- **Source:** "Aw, seriously!" is his line in the show (BFDI). He is a hand-drawn stick figure, so a scribble cloud suits him. The fight cloud itself is a cartoon gag: invented here.
- **Tell:** entrance (30 frames): he stamps twice and scribble lines start to circle him. The cloud then moves at only 7 px a frame, slower than most fighters run.
- **How to dodge:** walk away from it, get behind where he started, or go over the top (it is 200 px tall, so that needs a double jump).
- **Look-alike check:** Saw's blade ring and Goo's swallow stay on the spot. Foldy's dodecahedron rolls over foes three times (it does not hold them). Black Hole pulls. A slow travelling cloud that carries foes along does not exist.
- **Balance:** 22 at most, as now, and a foe caught late takes fewer scribble hits. Reach is smaller than the old 360 px ring. COULD BE STRONGER: it carries caught foes up to 390 px toward the side he faces before the launch. Builder: if that kills too early, launch from the burst straight up (kb 0, ky -20).

**BUILD SPEC (needs new code, about 65 lines, hand-made row; replaces the fsCircle row at 37684; body travel as Pencil's van does it, `fsPencilPlace` at 32765):**
- `catch`: circle r 100 on him.
- t 0-56: centre moves x = start + face x 7 x t along the floor he stands on. Stop early at a ledge or wall (do not roll off; test with `landable` as SM_PAT.leap does). David's own position follows the centre; he is hidden (`hides`) and cannot be hit by foes' ordinary moves no more than any holder can today (leave that as the framework has it).
- Each frame: any foe within 100 px of the centre and not yet caught is added to `st.caught` with `st.t0[idx] = t`. Caught foes are `fsPin`ned to the centre plus a small fixed offset.
- Scribble hits: for each caught foe, at t0 + 8, + 18, + 28, + 38 (while t is under 56): `applyHit(x, 3, 0, -1, f)`.
- t 56: burst. Every caught foe: 10 damage, kb 20 x face, ky -14 (about 35 degrees up).
- End lag 30 frames: he sits on the floor, arms crossed.
- Draw: an off-white scribble ball (6 overlapping wobbly circles, redrawn from the frame number, no random), black scribble loops, 3 or 4 of his stick limbs poking out at changing angles, yellow stars, the feet or hands of caught foes poking out too. No words in the art.

---

## F6. Book: "Overdue" becomes TURN THE PAGE

- [ ] **Yes, build this** (careful: this Final Smash was already changed on 11-11, books fly instead of falling.)

| | Now | New |
|---|---|---|
| Shape | books fly across the stage at the 2 nearest foes, 5 each (same as Money) | A giant page lies flat on the floor in front of her. She TURNS it: the page swings up from the floor and over her head, scooping up everyone standing on it, and flings them away behind her. |
| Effect | pure damage | pure damage |
| Damage | 13 a book (65 on paper if all 5 hit one foe) | scoop 10 + fling 20 = 30 |
| Launch | 22 | scoop 0 (carried), fling 22, backward and up |
| Who it hits | the 2 nearest foes, anywhere within about 650 px | everyone on the page: 320 px in front of her |

- **Source:** from the object (she is a book). Invented staging. (Her Define mark is NOT added: it would make later hits stronger.)
- **Tell:** entrance: the huge cream page unrolls along the floor in front of her and stays there, its corner curling, for about 30 frames. The page shows exactly where the move hits.
- **How to dodge:** get off the page (walk past its end, or get behind her). Jumping does not help: the page comes up from under you.
- **Look-alike check:** nothing in the game swings up from the floor and over. Stapy's floor "snaps shut" on stapled foes (a trap, thrown up). Clock's hands sweep round after a freeze. Bow swings a chair at one trapped foe. Not a match.
- **Balance:** on paper 65 down to 30, but the old move needed 5 separate books to land. Reach is much shorter (320 against about 650) and one-sided. It can now hit more than 2 foes. COULD BE STRONGER only if several foes stand close in front. Builder: measure the old average first.
- **Sky-drop check:** the page rises from the floor. Foes behind her are NOT hit when it lands; only the scooped foes are thrown. Nothing comes down on anyone.

**BUILD SPEC (needs new code, about 60 lines, hand-made row; replaces the row at 35521 and the entrance `fsaB_book` at 42045):**
- Entrance W 36: page length grows 0 to 320 px along the floor in front (frames 4 to 20), then lies still.
- `catch`: `fsBoxAhead(f, 0, 320, 60, f.r)` sitting on the floor (foes standing on the page).
- t 0-26: the page is a line from her feet, length 320, at angle A(t) = 180 degrees x ease(t / 26), measured from the floor in front, up and over to the floor behind.
- t 0-13 (front quarter): any foe within 28 px of the line is scooped: `applyHit(x, 10, 0, -1, f)` once, added to `st.caught`, then pinned to the line at their own distance from her (`fsPin`).
- At A = 135 degrees (about t 18): release. Each caught foe: 20 damage, kb -22 x face (behind her), ky -16 (about 36 degrees up).
- t 18-26: the page finishes the turn and lies flat behind her. No hitbox.
- End lag 28 frames.
- Draw: a cream page (#f4ecd8) with grey ruled lines and a soft shadow, slightly bowed while it turns (a quadratic curve, bowing back against the turn), her own covers open wide as the spine. No readable words: lines only.

---

## F7. Bot: "Gotcha!" becomes the STILT MARCH

- [ ] **Yes, build this**

| | Now | New |
|---|---|---|
| Shape | holds the nearest foe, 6 kicks, big throw (group A) | Both legs stretch into tall black stilts (the Bridge the Gap! leg), lifting Bot high up. Bot takes three giant strides forward. Each stride swings a big oval foot low along the floor: kick ("Gotcha!"), kick, and "there's more!" for the big third kick. |
| Effect | pure damage | pure damage |
| Damage | 6 x 2 + 20 = 32 | 6 + 6 + 20 = 32 if all three land |
| Launch | 23 | kicks 1 and 2: 9 (they knock the foe forward into the next kick); kick 3: 23 |
| Who it hits | one foe within 420 px | everyone in the way of a foot, over 480 px of floor |

- **Source:** the stilt leg and oval foot are Bot's own up-special art (code note: Bridge the Gap!). "Gotcha!" and "there's more!" are Bot's lines (code notes). The march is invented.
- **Tell:** entrance (30 frames): the joy hop that is there now, then the legs grow and Bot's body rises 160 px. A fighter on stilts is easy to read.
- **How to dodge:** the feet swing LOW (50 px tall). Hop each one, like a skipping rope: three hops, 14 frames apart. Or be behind Bot.
- **Look-alike check:** Pin's mech "stomps all over" one foe (from above, on a held foe). Lifering sprints once. Tennis Ball and Cheesy send balls. Three walking kicks do not exist. The feet move sideways along the floor; nothing comes down on anyone.
- **Balance:** 32 as now, but only if a foe is hit by all three kicks. COULD BE STRONGER: it hits several foes (was one), and Bot ends 480 px further on. The old one could not miss a foe it caught; this one can be hopped.

**BUILD SPEC (needs new code, about 60 lines, hand-made row; replaces the fsLock row at 52558; keep the hop from `fsaB_bot` at 40971 and reuse its stilt-leg and foot drawing):**
- `catch`: `fsBoxAhead(f, 0, 160, 50, f.r)` on the floor (the first stride only).
- Three strides, each 14 frames, each moving Bot 160 px forward on the surface it stands on (stop at a ledge or wall; a stride that cannot go forward is done on the spot). Place the body with `fsPencilPlace` (32765).
- Foot hitbox in stride k (k = 0, 1, 2), frame j (0-13): box 70 wide, 50 tall, on the floor, centred at strideStart + face x (160 x j/13 + 40).
- Kicks 1 and 2: 6 damage, kb 9 x face, ky -5 (about 29 degrees). Kick 3: 20 damage, kb 23 x face, ky -12 (about 28 degrees). Each kick hits each foe once (`st.hitK[k]` sets).
- End lag 30 frames: the legs shrink back.
- Draw: two black stilt legs from the body down to the floor, oval feet, the swinging foot drawn with a motion arc; the body 160 px up, bobbing each stride. A star flash on kick 3.

---

## F8. Box: "Everything Packed" becomes the CONVEYOR

- [ ] **Yes, build this**

| | Now | New |
|---|---|---|
| Shape | packs the nearest foe, 4 knocks, ships them (group A) | A conveyor belt rolls out along the floor on both sides of her. Everyone standing on it is carried to her. Each foe that arrives is packed, taped, rattled, and SHIPPED: shot out of her other side as a parcel. |
| Effect | pure damage | drag (floor only), pure damage |
| Damage | 4 x 2 + 24 = 32 | 4 x 2 + 20 = 28 |
| Launch | 24 | 24 |
| Who it hits | one foe within 460 px | every foe STANDING on the belt, 360 px each side of her |

- **Source:** from the object (a cardboard box is for packing and shipping). Invented staging. The flaps, tape and packing peanuts are her entrance art in the code today.
- **Tell:** entrance (34 frames): her flaps open, and the belt rolls out both ways along the floor with its rollers turning. The belt is the hit area.
- **How to dodge:** do not stand on the belt. Jump and stay in the air, stand on a platform, or get past its end. A foe who jumps off before reaching her is free.
- **Look-alike check:** Yellow Face, Loser and Blocky box a foe they have already caught. Lollipop's round sticky patch drags foes in the air too. A floor belt you can jump off does not exist.
- **Balance:** 32 down to 28, same launch. COULD BE STRONGER: it can pack several foes (was one). It is also easier to avoid than the old hold: airborne foes are never taken.

**BUILD SPEC (needs new code, about 65 lines, hand-made row; replaces the fsLock row at 43886; reuse the flap, tape and peanut art in `fsaB_box` at 41771):**
- `catch`: a floor box 120 px each side of her, 50 tall (foes standing right next to her).
- t 0-50: the belt runs. Each frame, every foe that is on the ground, on HER surface, within 360 px: `x.x` moves 7 px toward her. (Do not move airborne foes. Do not pin: they keep their controls and may jump.)
- Arrival: a foe within 40 px of her centre is packed: added to `st.caught` with its own clock, hidden and held with `fsPin`. Knocks at +6, +12, +18, +24: `applyHit(x, 2, 0, -1, f)`.
- Ship at +30: 20 damage, kb 24 in the direction they were travelling (out of her far side), ky -12 (about 27 degrees up).
- The belt stops at t 50; foes packed before then still finish their own 30 frames. `dur` = W + 80 + 24 end lag.
- Draw: a grey belt 14 px thick on the floor with dark rollers every 40 px and moving chevrons pointing at her; her flaps snap shut on each arrival, a strip of brown tape, a shake per knock; the shipped foe flies out wrapped as a small taped parcel for 10 frames (drawn over the foe), a few peanuts behind it.

---

## F9. Baseball: "Ground Pound" becomes HOME RUN

- [ ] **Yes, build this** (new name. Or keep "Ground Pound" as the name if you prefer.)

| | Now | New |
|---|---|---|
| Shape | shockwaves along the floor both ways (same as Yin-Yang) | Four white bases pop up in a diamond and chalk lines join them. He runs the bases as a blur: up to first, over the top to second, down to third, then dives and SLIDES into home along the floor in a cloud of dust. |
| Effect | pure damage | pure damage |
| Damage | 18 | 18 (a foe is hit once only) |
| Launch | 22 | 22, away from the middle of the diamond; the slide launches forward |
| Who it hits | everyone on the floor within 700 px, both sides | everyone on the chalk lines, and on the 240 px slide |

- **Source:** from the object (a baseball diamond, running the bases, sliding into home). Invented staging. No arms are needed: it is all legs.
- **Tell:** entrance (40 frames): the four bases land with a pop and the chalk lines draw themselves. The lines are exactly his path.
- **How to dodge:** do not stand on a chalk line. Inside the diamond is safe, outside is safe. On the floor, keep out of the 240 px in front of home.
- **Look-alike check:** Yin-Yang keeps the floor waves. Balloony "zips about the stage" (free path, air jets). Donut and Gaty bounce a held foe. A fixed drawn loop does not exist.
- **Balance:** same 18 and 22. Against foes on the floor it reaches much LESS (240 px one way, against 700 px both ways). Against foes in the air or on platforms it reaches more. Overall I think it is weaker; a builder should check.

**BUILD SPEC (needs new code, about 70 lines, hand-made row; replaces the fsLane row at 43817 and the entrance `fsaB_base` at 41402; scripted body travel as Pencil's van, `fsPencilPlace` 32765):**
- Points from home H (his start, feet on the floor): first = H + (face x 280, -80), second = H + (0, -160), third = H + (-face x 280, -80), back to H, then slide to H + (face x 240, 0). Clamp each point inside the stage with `fsClampPos` (31526).
- Timing: 10 frames per leg for the four legs (t 0-40), slide t 40-52 (20 px a frame, slowing).
- Hitbox: circle of his radius + 26 at his position every frame. Hit: 18 damage, once per foe (`st.hit`). Launch: kb 22 x sign(foe.x - diamond centre x), ky -12; on the slide kb 22 x face, ky -10.
- `catch`: `fsBoxAhead(f, 0, 120, 100, f.r)` (the start of the first leg).
- He passes through platforms while running (scripted), but the slide follows the floor and stops at a ledge.
- End lag 26 frames (he sits up in the dust).
- Draw: 4 white square pads (22 px), white dashed chalk lines 4 px, a white speed blur behind him, his stitches spinning; slide = tan dust puffs drawn from the frame number (no random).

---

## F10. Woody: "Fraidy Stampede" becomes a real PANIC

- [ ] **Yes, build this**

| | Now | New |
|---|---|---|
| Shape | one bolt along the floor (group C) | He sees something scary, screams, and bolts forward. He meets something scary THERE too, turns, and bolts all the way back past where he started. Scared again, he runs home and faints flat on the floor. Three passes. |
| Effect | pure damage | pure damage |
| Damage | 15 | 4 (first pass) + 7 (the long pass back) + 4 (run home) = 15 at most |
| Launch | 18 | passes 1 and 3: 5, a small pop upward. Pass 2: 18, the way he is running (backward) |
| Who it hits | everyone on a 560 px line in front | everyone within 360 px on BOTH sides, along the floor |

- **Source:** he is scared of everything (BFDI, from memory, not checked). The move's name in the game is already Fraidy. The faint is invented.
- **Tell:** entrance: he shakes, eyes wide, and an exclamation mark pops over him (30 frames). Each turn has a 4-frame skid, feet scrabbling, before he runs again.
- **How to dodge:** jump over him each time he passes (he is 90 px tall as a hit), or stay more than 360 px away. The skids show which way he goes next.
- **Look-alike check:** Lifering and Needle run once, one way. Balloony zips freely round the stage with air jets. A there-and-back-and-home floor run does not exist. (v1 gave an out-and-back to Tapey's wave; Tapey now has the reel, F4, so there is no clash.)
- **Balance:** 15 at most, as now, and a foe must be hit three times to take it all. COULD BE STRONGER: it now covers both sides (720 px in all, was 560 one way) and the main launch goes BEHIND him. After it he lies fainted for 34 frames (longer end lag than now), which pays some of it back.

**BUILD SPEC (small new code, about 40 lines: extend fsLane at 35739 with a list of passes, or a hand-made row; replaces the row at 37569, keep its `fsaA_wrap`):**
- Speed 22 px a frame (as now), hit box as now: hw 34, H 90, along the floor he stands on.
- Pass 1: t 0-16, forward 360 px. Skid 4 frames. Pass 2: t 20-53, back 720 px. Skid 4 frames. Pass 3: t 57-73, forward 360 px, home.
- Each pass has its own hit set. Pass 1 and 3: 4 damage, kb 0, ky -9 (straight up, a pop). Pass 2: 7 damage, kb 18 x (-face), ky -10 (about 29 degrees up).
- A pass stops early at a ledge or wall; the next pass starts from there.
- `catch`: `fsBoxAhead(f, 0, 160, 90, f.r)`.
- End lag 34 frames: he lies flat (squash the body with the deform the wrap already uses).
- Draw: splinters (FS_GLYPH.splinter) behind him as now, sweat drops, a dust skid mark at each turn, one "!" glyph (a mark, not a word).

---

## F11. Pickle: "Loads of Experience" with NOTHING from above

- [ ] **Yes, build this**

| | Now | New |
|---|---|---|
| Shape | marks the nearest foe, then a pickle belly-flops DOWN on the spot (a sky drop, same as Sidewalky's slab) | He pulls out a game controller. A square pixel CROSSHAIR follows the nearest foe, then locks. He mashes the button: a jagged pixel zap runs along the line from his controller to the crosshair, and the crosshair bursts into chunky pixels. |
| Effect | pure damage | pure damage |
| Damage | 24 | burst 24. The zap line does 6 to anyone else standing on it. |
| Launch | 21, mostly upward | burst 21, the same angle. Line 6. |
| Who it hits | everyone within 100 px of the mark | everyone within 100 px of the mark, plus a thin line between him and the mark |

- **Source:** Pickle plays video games (II, from memory, not checked). The name is already a game word (experience points). The crosshair and zap are invented.
- **Tell:** the crosshair is on screen for the whole entrance (36 frames), following the foe. It turns red and stops 18 frames before the shot, exactly when the code fixes the mark today.
- **How to dodge:** when the crosshair turns red and stops, step out of it. Do not stand between Pickle and the crosshair.
- **Look-alike check:** Sidewalky keeps the slab that drops. Cammy's flash stuns "whoever is in frame" ahead of him; Trophy's weakens. Nickel zaps one foe from a storm cloud (from above). A zap line from the fighter's hand to a marked spot does not exist.
- **Honest note:** underneath, this is still "mark a spot, then blast it". What is new is where it comes from (his hand, sideways, not the sky) and the line. If you want the mark gone too, say so and I will design another.
- **Balance:** the burst is the same 24 and 21. COULD BE STRONGER, a little: the line adds 6 damage to foes between him and the mark. Set the line to 0 damage if you want it exactly as strong as now.

**BUILD SPEC (small new code, about 35 lines; keep the fsLock row at 43822 almost as it is):**
- Keep `fsLock({ id:'loadsofexperience', R:100, bx:440, by:260, effect:'blast', delay:8, dmg:24, kb:21, ky:-16 })`. The mark, the catch and the burst do not change.
- Remove the falling art: in fsLock's draw (about 35897) the `o.art` call draws "what comes down, coming down" 120 px above the mark. Add an option `noFall:true` that skips it, and pass it for Pickle only. Change the entrance `fsaB_pickle` (41439): no belly-flop; he holds a controller and bobs to the button presses.
- New: at t = w + delay (the burst frame), a line hit from his hand (f.x + face x f.r, f.y) to the mark (f.fsAx, f.fsAy): every foe within 15 px of the segment, not already hit by the burst, takes `applyHit(x, 6, 6 x face, -4, f)`.
- Crosshair: drawn at the nearest foe (`fsPick(f, 440, 260)`) from frame 6 of the entrance; green until t = w - 18, then red at (fsAx, fsAy). Square, 100 px half-size, 4 corner brackets, 8 px pixel steps.
- Burst art: 12 to 16 green and white squares (8 to 16 px) flying out to exactly 100 px; a few small squares then drift from the mark back to Pickle (the "experience"). No numbers or words.
- Zap art: `fsBolt` (34897) drawn in right-angle steps, green (#6aa83a) with a white core, 4 frames.

---

## F12. Bonesaw: "Cuts Right to the Core" becomes CUT HERE

- [ ] **Yes, build this** (not in batch 1. Added because Bonesaw is the fifth member of group A: without this, he and Bracelety stay a pair.)

| | Now | New |
|---|---|---|
| Shape | holds the nearest foe, 3 slow saw strokes, a big cut (group A) | A dotted "cut here" line appears from the floor to the top of the screen at the nearest foe. Bonesaw dives into the floor and saws straight UP along the line. The whole picture splits in two for a moment, the halves slipping apart, then snaps back. |
| Effect | pure damage | pure damage |
| Damage | 3 x 6 + 20 = 38 | 3 x 6 + 20 = 38 (the same) |
| Launch | 23 | 23, sideways, away from the line |
| Who it hits | one foe within 400 px | everyone standing in a column 80 px wide, as tall as the screen |

- **Source:** from the object (a saw cuts along a line). The name is his own pun in the game. His neutral smash note says he "never saws a floor on screen" in the show, so this is invented staging.
- **Tell:** the dotted line and a small scissors mark at its foot, for the whole entrance. It stops following the foe 18 frames before the cut.
- **How to dodge:** step off the dotted line once it stops. It is only 80 px wide. Height does not save you: the cut goes all the way up.
- **Look-alike check:** Needle's cut runs ALONG the floor. Stapy opens a crack in the floor. Sidewalky and Pickle mark a round spot. A full-height vertical cut that splits the screen does not exist. The blade rises from the floor; nothing comes down.
- **Balance:** the same 38 and 23. It can now hit more than one foe if they stand in the same 80 px column (COULD BE STRONGER, rarely). It is easier to avoid than the old hold.

**BUILD SPEC (needs new code, about 50 lines; start from fsLock at 35866, which already places a mark with `fsLockAt` and `fsPick`; replaces the row at 44273, keep its `fsaA_wrap`):**
- Mark: at t = w - 18, `fsLockAt(f, st, fsPick(f, 400, 240), 150)` as now; only the x is used (`st.cutX = f.fsAx`).
- `catch`: a box 80 wide centred on the mark x, from the floor up 400 px (the cap on catch areas, `fsCapSh`, may shorten it; that is fine).
- t 0-30 (from the blast): the blade rises from the floor at the mark x at 30 px a frame. Foes in the column (|x - cutX| under 40 + their radius) are held with `fsPin` where they are, and take 6 damage at t 4, 14 and 24 (`applyHit(x, 6, 0, -1, f)`), as the pin does today.
- t 30: the split. Each held foe: 20 damage, kb 23 x sign(foe.x - cutX) (or his facing if dead centre), ky -12 (about 28 degrees up).
- Screen split: for 10 frames draw the world in two halves, left half shifted 6 px down and right half 6 px up, with a white gap 4 px at cutX. Render only; it must not move any fighter. If that is too costly, draw only a tall white slash and two offset floor lines.
- End lag 28 frames. Bonesaw reappears at his start spot (he does not really travel: draw him diving in and popping back out).
- Draw: dashed white line with dark outline, scissors glyph at the floor end, his blade teeth (FS_GLYPH.blade) running up the line with sawdust from the frame number.

---

# PART 2: NEUTRAL (MAIN) SMASHES

The neutral smash shapes in the code today: lunge (step and swing), through (dash through), leap (hop), plant (root and hit all round), walk (roller along the floor), mine (trap), reel (pull in and swing), burst (ring), beam, volley (fan of shots), swing (Blocky's anvil). Every one of them already has a knockdown smash. So a knockdown smash can only stop being a look-alike with a NEW shape. Five of the seven below add a small new shape (20 to 35 lines each).

How a row is run: `runSmashSpec` calls `SM_PAT[row.pat](f, row)`; a shape that lasts more than one frame leaves a state in `f._sm` that the fighter loop drives (search `_sm`). Effects are `SM_FX[row.effect]`.

## N1. Marshmallow: "One Purchase Later" becomes the SPRING PARCEL

- [ ] **Yes, build this**

| | Now | New |
|---|---|---|
| Shape | roots, winds up, hits all round (same as Teddy Bear and Bonesaw). In the story the purchase "comes down on you". | She roots. A parcel slides in along the floor from behind her and stops just in front. It bursts open: it is a spring launchpad, and it fires whoever is on it up and away. |
| Effect | knockdown | knockdown |
| Damage / launch | 15 / 13 | 15 / 13 (the same size of launch, but steep: mostly upward) |
| Area | a circle round her, her radius + 62 | a pad on the floor in front: 96 px wide, 70 tall, centred 56 px ahead |

- **Source:** the title-card gag and her buying things are in the code notes; she bought a launchpad (her up-special note). The parcel sliding in is invented.
- **Tell:** the parcel slides past her for 15 frames (the same wind-up as now) and lands where it will hit.
- **How to dodge:** do not stand on the parcel; step back or get behind her.
- **Look-alike check:** no smash is a floor pad that fires at once. Mines (Cherries 15/18 knockdown) wait on the floor until stepped on: a different shape. Nothing comes from above.
- **Balance:** same 15 and 13. It no longer hits behind or above her, so it is WEAKER in area. Not stronger.

**BUILD SPEC (needs new code, about 25 lines: new `SM_PAT.pad`):**
- Row: `wallmart: {pat:'pad', wind:15, at:56, w:96, h:70, dmg:15, kb:5, up:-12, effect:'knockdown', cost:{root:26}, color:'#d9dde2'}`.
- `pad(f, s)`: root her for wind + 4 (as plant does), `startWindup(f, 15, cb, color, null)`; in cb, test every foe against the box (x within at +/- w/2 of her, in front; feet within h of her floor) the way fsLane tests its box by hand; `applyHit(t, 15, face x 5, -12, f)`; `SM_FX.knockdown(t, f)`.
- Launch: kb 5 forward and 12 up is the same length as 13 flat (about 67 degrees up).
- Draw: a brown parcel (26 px) sliding from 40 px behind her to the spot over the 15 frames; on the hit frame the lid flips and a grey pad on a zigzag spring pops 30 px up for 8 frames.

---

## N2. Bonesaw: "Truly Groundbreaking" becomes a real BURROW

- [ ] **Yes, build this**

| | Now | New |
|---|---|---|
| Shape | roots, drives his teeth in, hits all round (same as Teddy Bear) | He dives teeth-first INTO the floor, a crack races forward, and he bursts up out of the floor 140 px ahead, throwing up everyone standing there. |
| Effect | knockdown | knockdown |
| Damage / launch | 16 / 14 | 16 / 14 |
| Area | a circle round him, his radius + 64 | a circle where he comes up, his radius + 50, 140 px ahead |

- **Source:** his own pun, in the code note: he calls the plan to hide under the ground "truly groundbreaking" (Point of No Return, as the note gives it). The note also says he never saws a floor on screen, so the burrow is invented.
- **Tell:** a 10-frame dive, then the crack runs along the floor for 8 frames to the spot where he will come up.
- **How to dodge:** watch the crack; jump or step away from its end.
- **Look-alike check:** Spikey's dash-through (14/12 knockdown) hits everyone ALONG the dash. This hits only where he comes up. No smash goes under the floor.
- **Balance:** same 16 and 14. COULD BE STRONGER: it moves him 140 px and hits at a distance, so it is a better way in than the old one. He can still be hit while under (see spec). It no longer hits next to where he started.

**BUILD SPEC (needs new code, about 35 lines: new `SM_PAT.burrow` and a branch in the `_sm` driver):**
- Row: `coresaw: {pat:'burrow', wind:10, dist:140, frames:8, rad:50, dmg:16, kb:14, effect:'knockdown', cost:{root:20, cd:20}, color:'#924e3c'}`.
- Dive: 10 frames rooted (as plant). Then 8 frames: his x moves 17.5 px a frame along the surface he stands on; stop early at a ledge or wall (`landable`, as leap uses). His hurtbox stays ON (no invulnerability): only the drawing changes.
- Come up: one hit, circle of his radius + 50 at his new place, with `smashSwing` or the plant release code: 16 damage, kb 14, effect knockdown.
- In the air: SLAM_ROWS (88334) holds only "tackle" and "barf" today, so add "coresaw" to it: cast in the air he drops to the floor first, then burrows.
- Draw: body squashed to nothing over the dive; a dark zigzag crack and small rubble bumps moving along the floor; on the hit he pops up with 6 floor chips.

---

## N3. Tissues: "Pollen Path" becomes the BIG SNEEZE CLOUD

- [ ] **Yes, build this**

| | Now | New |
|---|---|---|
| Shape | a thin straight beam, 480 px (same as Nickel (II)) | One huge sneeze: a fat green CLOUD puffs out in a short wide cone in front of him, and the sneeze throws him backwards (as now). |
| Effect | knockdown | poison (he is always ill) |
| Damage / launch | 13 / 14 | 11 / 14, plus poison |
| Area | 480 px long, 40 px thick | a cone 190 px long, 35 degrees up and down |

- **Source:** the code notes: his sneezes are strong enough to launch him (Marsh on Mars); the name is his line (Point of No Return). The cloud is from the object.
- **Tell:** a 6-frame "ah... ah..." lean back. Short, like the beam is today.
- **How to dodge:** it is short. Stay more than 190 px away or be behind him.
- **Look-alike check:** no wedge-shaped smash poisons (step-and-swing rows: burn, bleed, stun, knockdown, weaken, define). Barf Bag's poison is a root-and-hit-all-round, Test Tube's a trap. Not a match.
- **Balance:** damage 13 down to 11 to pay for the poison; the builder must measure that the total with poison is not over 13. Reach falls from 480 to 190, so it is WEAKER at range and a little better against foes above and below him.

**BUILD SPEC (needs new code, about 20 lines: new `SM_PAT.cone`, built on the wedge the lunge already uses):**
- Row: `condishawn: {pat:'cone', wind:6, len:190, half:0.61, dmg:11, kb:14, effect:'poison', n:80, cost:{back:8, stun:24}, color:'#7cc242'}`.
- `cone(f, s)`: after the wind, build a fan shape `{ kind:'fan', cx:f.x, cy:f.y, r0:0, r1:190, a0:-0.61, a1:0.61, face }`, take `shapeTargets(f, fan)` (as `lungeSwing` does at about 75738), `applyHit(t, 11, face x 14, -6, f)`, `SM_FX.poison(t, f, 80)`. Show it with `hitArt(f, 'lunge', fan, ...)`.
- Draw: 8 to 10 soft green puffs filling the cone for 12 frames, a few yellow pollen dots.

---

## N4. Firey Jr.: "Tantrum Flare" becomes HOT FOOT

- [ ] **Yes, build this** (the same idea as batch 1, N4: it was already a new shape. Added: the fire trail you can see.)

| | Now | New |
|---|---|---|
| Shape | steps in and swings a flame (the code says "the same move" as Firey, smaller) | A short, fast DASH straight through the foe, leaving small burning footprints behind him. |
| Effect | burn | burn |
| Damage / launch | 12 / 9 | 12 / 9 |
| Area | a swing, his radius + 28 | a dash of 135 px (9 frames at 15 px), hitting his radius + 22 on the way |

- **Source:** invented. The code note says he is "smaller and quicker".
- **Tell:** a 3-frame crouch with a flare at his feet.
- **How to dodge:** jump it or shield; it goes in a straight line.
- **Look-alike check:** dash-through rows today: weaken, knockdown, scramble, stun, slow. None burns.
- **Balance:** same numbers and burn time (90). The footprints are DRAWN ONLY: they do not hurt. He ends behind the foe, which is how every dash-through works.

**BUILD SPEC (no new shape; a row change plus about 8 lines of drawing):**
- Row: `emberjr: {pat:'through', dash:9, spd:15, reach:22, dmg:12, kb:9, effect:'burn', n:90, cost:{stun:20}, color:'#f0803a'}` (the same fields Woody's `fraidy` row uses).
- Draw: every 3 frames of the dash leave a small flame (10 px) on the floor that fades over 20 frames, from the frame number, no hitbox.

---

## N5. Goo: "Puffed Up" becomes PUFF AND SPLAT

- [ ] **Yes, build this**

| | Now | New |
|---|---|---|
| Shape | inflates; a ring bursts out round him (same as Balloon's POP!) | He inflates to giant size (the show moment, kept as the wind-up), then lets go and SPLATS flat: a low wave of goo runs out along the floor both ways. |
| Effect | knockdown | slow (stuck in goo) |
| Damage / launch | 13 / 14.5 | 13 / 14.5 |
| Area | a ring out to about 138 px, all round | along the floor, 170 px each side, only 36 px tall |

- **Source:** the inflate is from the show as the code note gives it (he inflated to catch Clover, Best Served Cold; the giant render exists). The splat is from the object (he is goo): invented.
- **Tell:** the giant inflate, 12 frames. Nobody can miss it.
- **How to dodge:** hop. The wave is low and takes 8 frames to run out.
- **Look-alike check:** Balloon keeps the ring with knockdown. Donut's and Taco's slow rollers go one way only (11/12 and 11/7). Taco (II)'s slow is a ring (14/12). No smash is a low floor wave both ways.
- **Balance:** same 13 and 14.5. Slow replaces knockdown. It can be hopped and no longer hits above him, so it is WEAKER against foes in the air. Not stronger.

**BUILD SPEC (needs new code, about 30 lines: new `SM_PAT.splat` and a branch in the `_sm` driver):**
- Row: `engulf: {pat:'splat', wind:12, len:170, frames:8, h:36, dmg:13, kb:14.5, effect:'slow', n:90, cost:{self:4, cd:58}, color:'#3a86f0'}`.
- `splat(f, s)`: `startWindup(f, 12, cb, color, null)` (the giant render shows during it, FIGHTER_ANIM.Goo). In cb set `f._sm = {pat:'splat', t:8, ...hit:{}}`.
- Driver, each of the 8 frames: two fronts at f.x +/- (len x k/8). A foe whose feet are within 36 px of his floor and within 24 px of a front, not yet hit: `applyHit(t, 13, dir x 14.5, -6, f)`, `SM_FX.slow(t, f, 90)`.
- Only on the surface he stands on; a front stops at a ledge.
- Draw: his body squashed to a third of its height and twice its width for the 8 frames, a blue ripple at each front, small droplets.

---

## N6. Apple: "Cut In Half" becomes a real SPLIT

- [ ] **Yes, build this** (borderline pair, as batch 1 said: Silver Spoon's punch already launches upward and has his gold boost. Leaving both is fine.)

| | Now | New |
|---|---|---|
| Shape | steps in, one slice forward (same as Silver Spoon and Trophy) | She splits into two halves that shoot apart, one left and one right, then snap back together. |
| Effect | knockdown | knockdown |
| Damage / launch | 16 / 14 | 15 / 14, outward |
| Area | a swing in front, her radius + 32, with a step forward | 110 px to each side of her |

- **Source:** the move's own name and the code note (the Split, The Tile Divide). Coming apart in two halves is invented staging.
- **Tell:** a white line down her middle for 8 frames.
- **How to dodge:** stay more than 110 px away, or be above her.
- **Look-alike check:** no smash hits both sides with two dashing halves. Spikey's dash goes one way and moves him.
- **Balance:** damage 16 down to 15 because it now hits both sides. She no longer steps forward, so her reach in front is about the same. COULD BE STRONGER when foes are on both sides of her.

**BUILD SPEC (needs new code, about 30 lines: new `SM_PAT.halves` and a branch in the `_sm` driver):**
- Row: `split: {pat:'halves', wind:8, out:110, frames:6, rad:14, dmg:15, kb:14, effect:'knockdown', cost:{stun:26}, color:'#d9433f'}`.
- After the 8-frame wind: for 6 frames the two halves are at f.x +/- (110 x k/6); each is a circle of her radius + 14. A foe touched, not yet hit: `applyHit(t, 15, dir x 14, -6, f)`, `SM_FX.knockdown(t, f)`. Then 6 frames coming back with no hitbox.
- Her own hurtbox and place do not change (the halves are drawn; she stays where she is).
- Draw: her sprite cut down the middle, each half drawn at its offset with the pale inside and two seeds showing; a red-white slash line between them.

---

## N7. Tapey: "Solo Track" becomes a PLAYBACK TRAP (optional)

- [ ] **Yes, build this** (your call. In the code TV and Tapey are both stun beams, but TV's is 820 px and weak, hers 460 px with a longer stun. You named hers as a good one. Leaving both is fine.)

| | Now | New |
|---|---|---|
| Shape | a straight beam of sound, 460 px (TV's shape) | She sets a small tape recorder on the floor in front of her. When a foe comes near it, it plays the recording at full volume. |
| Effect | stun (40) | stun (40), the same |
| Damage / launch | 13 / 11 | 13 / 11 |
| Area | a line 460 px long | a trap 38 px ahead, 18 px radius, that waits 240 frames |

- **Source:** the code note: cued for the "solo track", she played Poppy's confession by accident and everyone gasped (Fan the Flames). A recording going off at the wrong moment is that gag.
- **Tell:** the recorder is on the floor in plain sight, with its reels turning; it arms after 24 frames (as every trap does).
- **How to dodge:** do not walk into it; it lasts 4 seconds. Only one can be out at a time.
- **Look-alike check:** traps today: burn, knockdown, root, bleed, poison, slow, freeze, ice. None stuns.
- **Balance:** same numbers. COULD BE STRONGER, and this is the one I am least sure of: a trap that stuns for 40 frames lets her follow up, which a beam at range does not. To be safe I shortened its life to 240 frames (other traps: 360 to 460) and raised its cooldown to 50. If in doubt, skip this one.

**BUILD SPEC (no new shape; a row change plus about 10 lines of drawing; uses `SM_PAT.mine` as it is):**
- Row: `tape: {pat:'mine', at:38, r:18, life:240, dmg:13, kb:11, effect:'stun', n:40, cost:{cd:50}, color:'#c91745'}`.
- Draw: a small grey recorder with two turning reels; when it goes off, three red sound rings.
- Check: Dough's Knockoff and her own tape copy read `_lastSmashKind`; a trap row must behave there as the other trap rows do.

---

# What is left over (not redesigned, and why)

- **Needle's Final Smash** (group C): a thin fast cut, 22 damage / launch 20 over 720 px, against Lifering's sprint, 17 / 21 over 800 px. Batch 1 called this a mild pair. With Fan and Woody changed, these two are the only runs left. I did NOT write a new move. Idea only, if you want one: "Don't call me Needy!", one giant slap in front of her (the slap gag is from BFDI, from memory, not checked).
- **Nickel (II)'s Final Smash** (group E): two rings of 14, against Bomb's 24 then 14 that hurts himself. Half a match. I did NOT write a new move.
- **Bracelety, Tissues, Microphone, Money, Yin-Yang, Sidewalky, Lifering, Bomb**: each is now the only one of its shape. No change.
- **Silver Spoon and Trophy** (neutral): still close (16/14 and 14/14, step and swing, knockdown). Trophy is one you kept; Silver Spoon's goes upward and has the gold boost.
- **Teddy Bear, Nickel (II), Firey, Balloon, TV** (neutral): each keeps its move and is now alone in its group.

# The new moves checked against each other

| Move | Shape in one line | Closest other new move | Why they differ |
|---|---|---|---|
| F1 Toothpaste | growing spiral ribbon round her | F2 Rose (a ribbon that stays) | spiral all round, slow / wave forward, bleed |
| F2 Rose | snaking vine wall forward, whip-back | F4 Tapey (a line forward that pulls back) | Rose's stays and hits in place; Tapey's drags foes to her |
| F3 Fan | cone of wind that pushes | F4 Tapey | push away / pull in |
| F4 Tapey | thin tape line, reel in, eject | F8 Box (both drag foes to the fighter) | air-high line you hop over / floor belt you jump off; Box packs one at a time |
| F5 David | slow rolling fight cloud that carries foes | F7 Bot (both walk forward) | one held cloud / three separate low kicks |
| F6 Book | page swings up and over, flings behind | none close | |
| F7 Bot | three low stilt kicks, marching | F10 Woody | Bot goes one way in 3 steps; Woody there, back and home |
| F8 Box | floor belt both sides, pack and ship | F4 Tapey | see F4 |
| F9 Baseball | drawn diamond loop, slide home | F10 Woody | loop in the air / floor only |
| F10 Woody | three floor passes, faint | F7 Bot | see F7 |
| F11 Pickle | crosshair, zap line from his hand, pixel burst | F12 Bonesaw (both mark the nearest foe) | round spot + side line / full-height thin column, multi-hit |
| F12 Bonesaw | dotted line, saw up, screen splits | F11 Pickle | see F11 |
| N1 Marshmallow | spring pad in front, launches up | N2 Bonesaw | pad next to her / burrow 140 px away |
| N2 Bonesaw | burrow and come up ahead | N4 Firey Jr. | hits only where he comes up / hits along the dash, burn |
| N3 Tissues | short wide poison cloud | none close | |
| N4 Firey Jr. | dash-through, burn | N2 Bonesaw | see N2 |
| N5 Goo | low floor wave both sides, slow | N6 Apple (both hit left and right) | floor wave you hop, slow / two body halves, knockdown |
| N6 Apple | two halves fly apart | N5 Goo | see N5 |
| N7 Tapey | stun trap | none close | |

# Strength flags in one place

| Move | Flag |
|---|---|
| F1 Toothpaste | paper total 116 to 44; old real average unknown; now all round her |
| F2 Rose | hits several foes (was one); bleed total must be measured |
| F3 Fan | long push near a blast line; cap the push at 300 px |
| F5 David | carries foes up to 390 px before the launch |
| F6 Book | paper total 65 to 30; can hit more than 2 foes |
| F7 Bot | hits several foes (was one); moves Bot 480 px |
| F8 Box | packs several foes (was one) |
| F10 Woody | covers both sides; main launch goes behind him |
| F11 Pickle | line adds 6 to foes in between |
| F12 Bonesaw | several foes if in the same 80 px column |
| N2 Bonesaw | moves him 140 px and hits at range |
| N6 Apple | hits both sides |
| N7 Tapey | a stun trap allows follow-ups; least sure |
| F4 Tapey | far foes are reeled to her before the launch (stronger at a ledge facing out) |
| F9, N1, N3, N4, N5 | same or weaker, as far as I can tell on paper |

# Tick list

Final Smashes
- [ ] F1 Toothpaste: The Big Swirl (spiral of paste)
- [ ] F2 Rose: Briar Path (snaking thorn vine)
- [ ] F3 Fan: Full Blast (cone of wind)
- [ ] F4 Tapey: Rewind (tape reel-in, eject)
- [ ] F5 David: Tantrum Cloud (rolling fight cloud)
- [ ] F6 Book: Turn the Page (page swings over)
- [ ] F7 Bot: Stilt March (three low kicks)
- [ ] F8 Box: Conveyor (belt, pack, ship)
- [ ] F9 Baseball: Home Run (runs the bases)
- [ ] F10 Woody: three-pass panic and faint
- [ ] F11 Pickle: crosshair and zap, nothing from above
- [ ] F12 Bonesaw: Cut Here (vertical cut, screen splits)

Neutral smashes
- [ ] N1 Marshmallow: Spring Parcel
- [ ] N2 Bonesaw: Burrow
- [ ] N3 Tissues: Big Sneeze Cloud
- [ ] N4 Firey Jr.: Hot Foot
- [ ] N5 Goo: Puff and Splat
- [ ] N6 Apple: real Split (borderline, fine to skip)
- [ ] N7 Tapey: Playback Trap (optional, fine to skip)

Questions for you
- [ ] Do you want new moves for Needle's and Nickel (II)'s Final Smashes too? (Not written.)
- [ ] F9: rename to "Home Run", or keep "Ground Pound"?
- [ ] F11: is "mark, then a zap from his hand" different enough, or should the mark go as well?

# Done / not done

- Done: 12 Final Smash designs and 7 neutral smash designs, each with an old-vs-new table and a build spec.
- Not done: Needle and Nickel (II) Final Smashes (ideas only, above).
- Not checked: any episode; the code of the 61 hand-made Final Smash scenes (menu lines only); any real match numbers. Rough line counts for new code are estimates.
- Total new code if everything is picked: about 660 lines for the Final Smashes and about 160 for the neutral smashes, by my estimate.
- Every Final Smash here also needs its menu line (FS_BLURBS, about 91120) rewritten, and most need their entrance animation changed. That is not counted above.
