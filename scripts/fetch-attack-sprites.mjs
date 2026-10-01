// ============================================================================
//  fetch-attack-sprites.mjs — pull the show's own art for what the fighters THROW
// ============================================================================
// Same footing as fetch-sprites.mjs: Battle for Smash Island is an unaffiliated, non-commercial fan
// work; this fetches artwork from battlefordreamisland.fandom.com (jacknjellify's designs) and, for the
// Inanimate Insanity DLC, inanimateinsanity.fandom.com (AnimationEpic's designs), and records the exact
// source URL of every file for CREDITS.md. A file that fails a guarantee is REJECTED:
//   · a real PNG (gif/jpg/webp are skipped -- no transparency, or none we can trust)
//   · genuinely transparent: at least 12% of the canvas is clear once any colour key the pick names
//     has run (a plain screenshot, with no key, is ~0% clear and fails)
//   · substantial after cropping to its alpha box: at least 24px on its long side
// THE OWNER'S RULE for this art: the file is the THROWN OBJECT ITSELF from the show -- not a render of
// a character flying across the screen, and not an episode screenshot. Every output is looked at before
// it ships; the ones that failed on sight are listed at the bottom of this file.
// Output: <out>/<name>.png at TARGET_H tall (aspect kept, never more than MAX_SIDE on its long side),
// <out>/manifest.json, <out>/credits.txt.
//
//   node fetch-attack-sprites.mjs <outDir> [name ...]
import { mkdirSync, writeFileSync } from 'node:fs';
import { PNG } from 'pngjs';

const WIKIS = {
  bfdi: 'https://battlefordreamisland.fandom.com',
  ii:   'https://inanimateinsanity.fandom.com',
};
const UA = { 'User-Agent': 'smash-island-fan-game/1.0 (personal fan project)' };
const TARGET_H = 56;
const MAX_SIDE = 128;   // test/attack-sprites.test.js: projectile-sized

// name -> the wiki file that is the show's version of what this fighter throws. The name is the output
// file (<name>.png); `kits` are the kits (kit.special) it is for -- for the first seven, the PROJ_SHAPE
// key it replaced. Optional, per pick:
//   wiki    'bfdi' (default) or 'ii'
//   crop    a stream asset: keep only its first N rows (its head)
//   region  [x0, y0, x1, y1] in the ORIGINAL file's pixels: cut this out before anything else
//   poly    [[x, y], ...] in the ORIGINAL file's pixels: a hand mask -- everything outside this polygon is made clear before
//           the key runs (a prop that lies across another prop, where no colour test can part them)
//   key     'white' -- flood the border's near-white away (a prop sheet on white paper)
//           'green' -- chroma-key a flat green backdrop away
//           'glow'  -- a glowing bolt on a flat sky: brightness above the sky becomes alpha (`floor`: how far
//                      above the sky a pixel must rise to count; lower keeps more of the bolt's cyan glow)
//           'orb'   -- keep only the near-white orb, and close the bites a hand left in it
//           'balloon' -- keep only the blue balloon (fill, shine, dark-blue outline): its largest connected piece
//           'piano' -- keep what is wood and gold, and what the wood closes round (the keys, its insides)
//           'prop'  -- a prop that exists only inside an episode frame (the owner's call: "Cut from the frames"): keep the
//                      pixels the pick's own `keep(r, g, b)` passes, then only their largest connected piece, so the
//                      room behind the prop goes and the gaps in it (a cage's bars) stay clear
//           'ball'  -- a ball on a flat green backdrop: the green key, then everything outside the ball's own disc
//   png     the wiki file is a JPEG: Vignette converts it (format=png) so it can be keyed; the key makes the alpha
//   srcH    download height (default 400; larger where a key needs the detail)
//   h       output height (default TARGET_H)
//   solid   the object is itself a rectangle that fills its own canvas edge to edge (Remote's battery cell), so it
//           cannot be 12% clear; looked at and confirmed to be the object, not a frame
//   minClear  a lower transparency floor than 12% for an object whose clear margin is thin but real (a tilted board)
//   skipped files looked at in the game and turned down; recorded, never fetched
const PICKS = {
  // --- the seven that shipped first
  shatter:  { who: 'Ice Cube',   kits: ['shatter'],  file: "Ice Cube's Shatter.png",    note: 'her shatter' },
  slice:    { who: 'Cake',       kits: ['atstake'],  file: 'Cake slice.png',            note: 'a slice of cake' },
  van:      { who: 'Pencil',     kits: ['van'],      file: 'SuperVAN!2340001.png',      note: 'the Supervan' },
  bubble:   { who: 'Bubble',     kits: ['float'],    file: "Bubble's asset.png",        note: 'a bubble' },
  cap:      { who: 'Pen',        kits: ['cap'],      file: 'Pen Cap.png',               note: 'his cap' },
  tag:      { who: 'Price Tag',  kits: ['pricetag'], file: 'Price Tag S2 Asset.png',    note: 'a price tag' },
  measure:  { who: 'Ruler',      kits: ['measure'],  file: ["Ruler's Asset.png", 'Bfdia 12 ruler asset.png', 'Ruler Asset BFDIE.png', 'Ruler Asset.png'], note: 'the ruler itself' },

  // --- BFDI: the owner's picks, kit by kit (the first file that passed an adversarial check, then the next)
  fireball:   { who: 'Firey / Firey Jr.', kits: ['ember', 'emberjr'], file: ['17body fireball.png', 'Firey Flame0001.png'], note: 'a fireball (the BFDI 17 Fireball body, faceless)' },
  landmine:   { who: 'Bomby',       kits: ['bomb'],       file: ['11body landmine.png', 'Coiny Bomb Transparent.png'], note: 'a landmine' },
  poof:       { who: 'Flower / Fanny', kits: ['quake', 'gust'], file: 'Poof.png',           note: 'a puff cloud' },
  tennisball: { who: 'Tennis Ball', kits: ['serve'],      file: ['16body pinktennisball.png', '17body bluetennisball.png'], note: 'a served tennis ball (faceless, pink)' },
  anvil:      { who: 'Blocky',      kits: ['anvil'],      file: '2b anvil.png',             note: 'an anvil' },
  zapbolt:    { who: 'Golf Ball',   kits: ['zapshooter'], file: ['Lightning 2.png', '15fb balllightning.png'], note: 'a zap bolt' },
  barf:       { who: 'Rocky',       kits: ['barf'],       file: ['Rocky barf (TPOT Intro).png', 'Barf long.png'], note: 'his barf stream (TPOT intro)' },
  fry:        { who: 'Fries',       kits: ['fry'],        file: ['Single Fry.png', 'Single Fry copy.png'], note: 'one fry' },
  syringe:    { who: 'Gelatin',     kits: ['freeze'],     file: 'Freeze Juice.png',         note: 'a Freeze Juice syringe' },
  // Nickel: the first pick, Coins.png, is a stack of copper pennies that reads as a brown cylinder at the 18px a coin
  // is drawn at. The next verified pick, the TPOT yellow token, reads as one coin.
  coins:      { who: 'Nickel',      kits: ['flip'],       file: ['YellowToken.png', 'BFDIE Handful Of Coins.png'], skipped: ['Coins.png'], note: 'a coin (the TPOT yellow token)' },
  gem:        { who: 'Ruby',        kits: ['beam'],       file: ['RedGemBFDIE.png', 'RubyShatteredBit3.png'], note: 'a red gem' },
  star:       { who: 'Yellow Face', kits: ['buynow'],     file: 'Star (BFB 21).png',        note: 'a star (a BFB 21 gift item)' },
  vomit:      { who: 'Barf Bag',    kits: ['splash'],     file: ['Leafy-ShapedVomit.png', 'Barf rainbow long.png'], note: 'a splat of vomit' },
  basketball: { who: 'Basketball',  kits: ['dribble'],    file: ['Basketball prop (bfb 28)0001.png', 'CloudysBasketball.png'], note: 'a basketball prop' },
  // Bracelety: the first pick, the blank board, is a flat white rectangle with not one clear pixel -- no richer than a
  // drawn one -- so it fails the transparency guarantee now that nothing exempts it. The ICY sign she holds up for
  // Ice Cube in BFB 1 is the next verified pick: tilted, lettered, and clear round its edges -- 9% of its canvas, which
  // is thin beside the 12% floor but is real: a screenshot is 0%.
  sign:       { who: 'Bracelety',   kits: ['sign'],       file: ['Bracelety Sign Blank.png', 'ICY Sign (Bracelety) (BFB 1).png'], note: 'her ICY sign (BFB 1)', minClear: 0.08 },
  bush:       { who: 'Grassy',      kits: ['grasstree'],  file: ['Bush.png', 'Grass TuftBFB17.png'], note: 'a bush' },
  candy:      { who: 'Lollipop',    kits: ['sucker'],     file: ['Lollipop Piece 5.png', 'Lollipop puddle asset.png'], note: 'a piece of her candy' },
  inkball:    { who: 'Marker',      kits: ['ink'],        file: '16bb inkball.png',         note: 'a ball of ink' },
  coin:       { who: 'Money',       kits: ['payday'],     file: ['28b linecoin.png', 'Coins.png', 'BFDIE Handful Of Coins.png'], note: 'one gold coin' },
  nail:       { who: 'Naily',       kits: ['spike'],      file: ['BFDI 11 Nail.png', 'Spike (BFDI 10).png'], note: 'a nail (BFDI 11)' },
  battery:    { who: 'Remote',      kits: ['battery'],    file: ['Batteryremote.png', 'A single Battery.png'], note: "Remote's battery", solid: true },
  sawblade:   { who: 'Saw',         kits: ['saw'],        file: ['Sawblade.png', 'Spinning Buzzsaw.png'], note: 'a saw blade' },
  jawbreaker: { who: 'Taco',        kits: ['jawbreaker'],    file: ['Jawbreaker better quality.png', 'Jawbreaker.png'], note: 'the jawbreaker' },
  woodchip:   { who: 'Woody',       kits: ['fraidy'],     file: ['8B3728F4-AFD6-4BD3-A90D-AD47726D9235.png', 'Wood chip.png'], note: 'a chip of Woody' },
  toothpaste: { who: 'Toothpaste',  kits: ['paste'],      file: 'Toothpaste Splat.png',     note: 'a splat of toothpaste' },
  flame:      { who: 'Match',       kits: ['spark'],      file: '2b fire0001.png',          note: 'a flame' },
  branch:     { who: 'Tree',        kits: ['timber'],     file: ['21body twigy.png', '14body branchy.png'], note: 'a leafy branch' },
  sprinkles:  { who: 'Donut',       kits: ['glaze'],      file: 'Bfdia 17body sprinkles.png', note: 'sprinkles' },
  rainbow:    { who: 'Puffball',    kits: ['fly'],        file: 'Barf rainbow long.png',    note: 'the rainbow barf (BFDIA)' },
  beep:       { who: 'Roboty',      kits: ['antenna'],    file: 'BEEP!.png',                note: 'BEEP lettering' },
  // Lightning: "use the art from tpot 7". No isolated file of it exists on the wiki, so the strike that
  // hits the Volcano in "The Seven Wonders of Goiky" is lifted off its plain sky: brightness over the sky
  // becomes alpha, the sky becomes nothing. What ships is the bolt alone.
  // The floor is low enough to keep the strike's cyan glow, so it is not a thin white squiggle; the sky's pale shards,
  // which a low floor would let through, are a white wash and not cyan, so keyGlow drops them all the same. The game
  // adds a blue halo round it (ATTACK_SPRITES `halo`) so it reads on a light stage too.
  tpot7bolt:  { who: 'Lightning',   kits: ['zap'],        file: 'Tpot7dpacas lightningrampage (25).png', note: 'his TPOT 7 strike, lifted off the sky', key: 'glow', floor: 12, region: [420, 0, 1250, 578], srcH: 1080, h: 88 },

  // --- Inanimate Insanity
  lemon:      { who: 'Taco (II)',   kits: ['lemon'],      wiki: 'ii', file: ['Lemon.png', 'OLDLemon.png'], note: 'a lemon' },
  chair:      { who: 'Bow',         kits: ['chair'],      wiki: 'ii', file: ['Chair Remaster.png', 'Chair.png'], note: 'a chair (S1 remaster design)' },
  book:       { who: 'Baseball',    kits: ['heavy'],      wiki: 'ii', file: 'Twilight Book II Remastered.png', note: 'his Twilight book (the remastered cover, off its white sheet)', key: 'white', region: [415, 15, 920, 465], srcH: 543 },
  pencil:     { who: 'Apple',       kits: ['split'],      wiki: 'ii', file: 'Pencil Prize.png',     note: 'a pencil (Minor Items/Prizes)' },
  fist:       { who: 'Knife',       kits: ['tricks'],     wiki: 'ii', file: 'Fist Thingy II.png',   note: 'the Fist Thingy (the hook in his Bag of Tricks)' },
  taser:      { who: 'Knife',       kits: ['tricks'],     wiki: 'ii', file: 'Temp Paralyzer.png',   note: 'the Temporary Paralyzer (the smoke in his Bag of Tricks)' },
  shimmerorb: { who: 'Lightbulb',   kits: ['eball'],      wiki: 'ii', file: 'Box with Shimmer Orb (S2E18).png', note: "the Shimmer Orb, cut out of Box's hands", key: 'orb', region: [688, 478, 1016, 798], srcH: 968 },
  // The Paint bombs page's only picture is a crop of the episode: the blue balloon over dark streaks, a black shadow and
  // the green backdrop. Only the balloon is kept (key 'balloon'); a green key alone left the streaks and the shadow.
  paintbomb:  { who: 'Paintbrush',  kits: ['fury'],       wiki: 'ii', file: 'Paint Bombs.png',      note: "MePhone4's paint bomb, the balloon alone", key: 'balloon', srcH: 161 },
  // Paper: "There is a grand piano from the unremastered s1." The only season-1 file of it is a frame of Episode 2: the
  // piano where it landed on Paper, against the pole. The piano is lifted out of it (key 'piano'); Paper, the pole and
  // the grass go. Same footing as the TPOT 7 strike: the owner named this piece of the show's art.
  piano:      { who: 'Paper',       kits: ['evilpaper'],  wiki: 'ii', file: 'Ep2 Piano.png',        note: 'the season-1 grand piano (Episode 2), lifted out of the frame', key: 'piano', region: [470, 240, 1010, 670], srcH: 700, h: 72 },
  // --- Inanimate Insanity DLC, batch 3 (g1: Box, Trophy, Goo, Lifering). Box packs other people's shots and Goo swallows
  // people, so neither throws a thing of their own; Trophy's camera and Lifering's whistle have no clean file and are drawn
  // (PROJ_SHAPE, the owner's Q2). The shark is the show's: "Called in a Favor" (Seas the Day), Minor Characters' Shark.
  shark:      { who: 'Lifering',    kits: ['lifeguard'],  wiki: 'ii', file: 'Shark Shorts.png',     note: 'the shark he called in a favor from (Seas the Day)' },
  // Spikey (batch 3): no file of a lone spike exists. The owner's call (Q3, "Crop from their art"): one spike cut from his
  // own body asset -- the top one, above where the ball begins, so none of the body comes with it -- and turned per
  // direction in the game (ATTACK_SPRITES.spikeburst aims it, point first).
  spike:      { who: 'Spikey',      kits: ['spikeburst'], wiki: 'ii', file: 'Spikey Body Front.png', note: 'one spike, cut from his body asset (the top one)', region: [389, 0, 618, 248], srcH: 400, h: 40 },
  // ---- Inanimate Insanity DLC, batch 3 (Cheesy, Dough, Soap: Fan throws nothing) ----
  // Cheesy: the soccer ball from 'A Kick in the Right Direction'. The only file is a JPEG on flat green, uploaded the day
  // S2E5 aired and drawn in the show's style.
  soccerball: { who: 'Cheesy',      kits: ['pun'],        wiki: 'ii', file: 'Soccer Ball.JPG', png: true, key: 'ball', srcH: 108, h: 40, note: "the soccer ball (A Kick in the Right Direction), off its green" },
  // Dough: the Loser Cage exists only in S4E5's frames ("I already owned this!"). The cage is navy with pale trim; the
  // purple wallpaper and the floor between its bars are not, so they key away and the bars stay see-through.
  losercage:  { who: 'Dough',       kits: ['copycat'],    wiki: 'ii', file: 'S4E5 "I already owned this!".png', key: 'prop', region: [140, 14, 574, 462], srcH: 477, h: 64,
    keep: (r, g, b) => (b >= r + 6 && b >= g - 4) || (r >= 150 && g >= 110 && b >= 95 && r - b < 90), note: 'the Loser Cage, lifted out of the S4E5 frame' },
  // Soap: her portable vacuum, whole in one S2E6 frame (Let 'Er R.I.P.): the red body, the grey hose and nozzle, the brown
  // handles, the wheels. The dark room and Bow's pink ghost are none of those.
  vacuum:     { who: 'Soap',        kits: ['disinfect'],  wiki: 'ii', file: 'S2e6 bow escapes out of the vacuum.png', key: 'prop', region: [98, 412, 562, 724], srcH: 768, h: 56,
    // the frame is dark: the body is (125,15,0), the hose, nozzle and wheels a NEUTRAL grey, the handles a lighter tan, the
    // outline near-black -- and the room is a warm brown throughout, which none of those are
    keep: (r, g, b) => (r >= 80 && r > g + 50 && r > b + 60) || (Math.max(r, g, b) - Math.min(r, g, b) < 13 && g >= 45)
      || (r >= 90 && r - g >= 20 && r - g <= 70 && g >= 55 && b >= 30 && b < g) || Math.max(r, g, b) < 32,
    note: "her portable vacuum, lifted out of the S2E6 frame" },
  // Soap: the small blue cloth she scrubs everything with, off her SoapPro render (her hand and arm are not blue).
  cloth:      { who: 'Soap',        kits: ['disinfect'],  wiki: 'ii', file: 'SoapPro.png', key: 'prop', region: [0, 640, 130, 910], srcH: 1142, h: 40,
    keep: (r, g, b) => b > r + 60 && b > 150, note: 'her blue cleaning cloth, off the SoapPro render' },

  // ---- batch 3, group 4: Tissues, Yin-Yang, Starfruit ("add the last set of dlc fighters")
  // Tissues' snot exists only inside his sneezing pose; the owner's call (Q3) was "Crop from their art": the region is
  // the green jet from its tip to just short of his box, so none of the teal body or its outline comes with it.
  snot:        { who: 'Tissues',   kits: ['condishawn'], wiki: 'ii', file: 'Tissues Sneezing.png',   note: 'his snot jet, cut out of his sneezing pose (Q3: crop from their art)', region: [18, 250, 184, 346], srcH: 408, h: 60 },
  // Yin-Yang: Yang picks Yin up and throws him (Tri Your Best) -- the thrown thing IS Yin, his own III half render.
  yin:         { who: 'Yin-Yang',  kits: ['yinyang'],    wiki: 'ii', file: 'Yin III.png',            note: 'Yin, the half Yang throws (Tri Your Best)' },
  // Starfruit's smash: the reunited Spoiled Lemon jump in for the chorus (Mazed and Confused), each on their own SL pose.
  slpineapple: { who: 'Starfruit', kits: ['onehit'],     wiki: 'ii', file: 'SL Pineapple Pose.png',  note: 'Pineapple of Spoiled Lemon, jumping in for the chorus' },
  sllemon:     { who: 'Starfruit', kits: ['onehit'],     wiki: 'ii', file: 'SL Lemon Pose.png',      note: 'Lemon of Spoiled Lemon, jumping in for the chorus' },
  sltomato:    { who: 'Starfruit', kits: ['onehit'],     wiki: 'ii', file: 'SL Tomato Pose.png',     note: 'Tomato of Spoiled Lemon, jumping in for the chorus' },
  slguava:     { who: 'Starfruit', kits: ['onehit'],     wiki: 'ii', file: 'SL Guava Pose.png',      note: 'Guava of Spoiled Lemon, jumping in for the chorus' },
  slmangosteen:{ who: 'Starfruit', kits: ['onehit'],     wiki: 'ii', file: 'SL Mangosteen Pose.png', note: 'Mangosteen of Spoiled Lemon, jumping in for the chorus' },
  // --- batch 3 (g5): Blueberry, Cherries, Clover, Jack. Q1 "Cut from the frames": the Cherries' rock and olive-oil slick
  // and Jack's pager exist only inside episode frames, so each is the show's own pixels lifted off its frame by a key
  // below (rock, slick, pager). The cookie, the butterfly and the peel are transparent files already.
  oatcookie:  { who: 'Blueberry',   kits: ['blueberry'],  wiki: 'ii', file: 'Cookie Season 3.png',  note: "the season-3 cookie (Q7: the Oatmeal Raisin smash sets it down; the show's S3 cookie, not a fan edit)" },
  marsrock:   { who: 'Cherries',    kits: ['cherries'],   wiki: 'ii', file: 'MarshmallowHitByRock.png', note: 'the huge rock that sent Marshmallow to Mars, lifted off its frame (Marsh on Mars)', key: 'rock', region: [110, 85, 440, 415], srcH: 448 },
  oliveoil:   { who: 'Cherries',    kits: ['cherries'],   wiki: 'ii', file: 'S4E4 The Cherries slip.png', note: 'their olive-oil slick, lifted off the floor they slipped on (Fan the Flames)', key: 'slick', region: [0, 340, 653, 480], srcH: 480, h: 24 },
  butterfly:  { who: 'Clover',      kits: ['clover'],     wiki: 'ii', file: 'Butterfly.png',        note: "one of Clover's butterflies" },
  bananapeel: { who: 'Clover',      kits: ['clover'],     wiki: 'ii', file: 'Banana Peel.png',      note: 'a banana peel (Q8: her luck puts it under a foe)' },
  pager:      { who: 'Jack',        kits: ['jack'],       wiki: 'ii', file: "S04E02 Pager hits Bot's leg.png", note: "his pager in flight, lifted off its frame (Cob Mentality: it hits Bot's leg)", key: 'pager', region: [750, 170, 1110, 400], srcH: 1080 },
  // --- batch 3, group 6 (Magnet, MeTag, Poppy, Silver Spoon). The owner, Q1: "Cut from the frames" -- Poppy's ghost
  // vacuum and capture pod exist only inside All Play and No Work (S4E5), so the show's own pixels are lifted out of the
  // two frames the plan names. The Immunity Cookie has its own clean file.
  ghostvacuum: { who: 'Poppy',     kits: ['vacuum'],     wiki: 'ii', file: 'S4E5 Poppy uses a vacuum to trap Gnife.png', note: 'the ghost-hunting vacuum (All Play and No Work), lifted out of the frame', key: 'vacuum', region: [694, 318, 786, 434], srcH: 477, h: 56 },
  capturepod:  { who: 'Poppy',     kits: ['vacuum'],     wiki: 'ii', file: 'S4E5 Poppy and Paper in ghost hunting gear.png', note: 'a capture pod from the vacuum (All Play and No Work), lifted out of the hand of Paper', key: 'pod', region: [426, 200, 506, 278], srcH: 477, h: 48 },
  immunitycookie: { who: 'Silver Spoon', kits: ['glowgold'], wiki: 'ii', file: 'Immunitycookie.png', note: 'the Immunity Cookie (III)', h: 40 },
  // ---- batch 3, group 7 (Tapey, Tea Kettle, Teddy Bear) ----
  // Tea Kettle: her hors d'oeuvres tray (Minor Items/Food), already a clean transparent file on the II wiki.
  horstray:   { who: 'Tea Kettle',  kits: ['hors'],       wiki: 'ii', file: "Hors d'oeuvres.png",  note: "her hors d'oeuvres tray", srcH: 269 },
  // Teddy Bear: the owner's Q1, "Cut from the frames". The only paintballs are the pink ones in her gun's hopper in the
  // remaster frame (War De Guacamole, S1RE6); the pink paint is keyed out of the hopper window and masked round (key 'paintball').
  paintball:  { who: 'Teddy Bear',  kits: ['paintball'],  wiki: 'ii', file: 'S1RE6 Teddy grabs a paintball gun.png', note: "a paintball: the pink paint in her gun's hopper (War De Guacamole remaster), cut from the frame", key: 'paintball', region: [472, 186, 528, 242], srcH: 477, h: 40 },
  // ---- ONE, the secret boss (the boss overhaul, 2026-09-30; she has no slot, so her block sits above the slots): the show's own art for
  // what she throws. Every file is a clean, transparent asset on the BFDI wiki (One's Gallery and the TPOT 10, 4 and 23 asset pages).
  // The knife of KNIFE FLURRY! is the Cake at Stake knife the Puffball Speaker Box pick (psbknife) already fetched, so it has no pick here.
  //   onemoonrock  MOON ROCKS!: File:Moonpeice11.png, the grey cratered Moon piece of TPOT 10 (she hurled Moon pieces, "Alone")
  //   oneearth     OUT OF ORBIT!: File:EarthTPOT4.png, Earth, which she compressed and kicked out of orbit ("Last One Standing")
  //   oneweird     OUT OF ORBIT!: File:Weirdplanettbig.png, the Really Weird Planet in the Orion Nebula she destroyed
  //   oneskate     OUT OF ORBIT!: File:Nine's Planet.png, the Skateboard Planet, left split into five pieces around its core
  onemoonrock: { who: 'One (MOON ROCKS!)',   kits: ['moonrock'], file: 'Moonpeice11.png',      note: 'a piece of the Moon (TPOT 10 asset; she hurled Moon pieces and a mountain in "Alone")', h: 64 },
  oneearth:    { who: 'One (OUT OF ORBIT!)', kits: ['oneearth'], file: 'EarthTPOT4.png',       note: 'Earth, which she compressed and kicked out of orbit ("Last One Standing")', h: 64 },
  oneweird:    { who: 'One (OUT OF ORBIT!)', kits: ['oneweird'], file: 'Weirdplanettbig.png',  note: 'the Really Weird Planet in the Orion Nebula, which she destroyed ("Last One Standing")', h: 64 },
  oneskate:    { who: 'One (OUT OF ORBIT!)', kits: ['oneskate'], file: "Nine's Planet.png",    note: 'the Skateboard Planet, left split into five pieces around its core', h: 64 },
  // ---- the boss overhaul (2026-09-29): PICKS SLOTS -- each early-six builder adds its bosses' shot art between its own two
  // markers and nowhere else (artifacts/V1/index.html, BOSS SLOTS, has the rule and the list) ----
  // @boss:announcer:begin picks
  // ---- ANNOUNCER (Boss 1): the Cake at Stake show's own art for what he throws and what he stands beside. Every file is a clean
  // standalone asset on the BFDI wiki except the acid glob and the press, which are cut out of a scene and an asset sheet.
  // Sources (battlefordreamisland.fandom.com): the Cake at Stake page's prizes -- a slice (BFDI 2), key lime pie (BFDI 3), ice
  // chunks (BFDI 4), the explosive blueberry pie (BFDI 16); the Cake Tosser (the arm he gives cakes with); the water balloons of
  // "A Leg Up in the Race"; the acid he cries (Announcer trivia: "Announcer cries acid instead of tears"; Speaker Box (species):
  // File:Thats crying or barfing.png); the crusher's press (Announcer Crusher, File:Old announcer crusher.png, BFDI 2); and the
  // sparkle round the Laser Powered Teleportation Device's beam (File:Pointy Star.png).
  annslice:   { who: 'Announcer (CAKE AT STAKE!)',   kits: ['annslice'],   file: 'Cake Slice Strawberry side.png', note: 'the strawberry slice he tosses (Cake at Stake, BFDI 2)' },
  annlime:    { who: 'Announcer (CAKE AT STAKE!)',   kits: ['annlime'],    file: 'Cake Lime Slice.png',            note: 'the key lime slice (Cake at Stake, BFDI 3)' },
  annice:     { who: 'Announcer (CAKE AT STAKE!)',   kits: ['annice'],     file: 'Ice Slice.png',                  note: 'the chunk of ice (Cake at Stake, BFDI 4)' },
  annpie:     { who: 'Announcer (CAKE AT STAKE!)',   kits: ['annpie'],     file: 'One slice of pie.png',           note: 'the explosive blueberry pie (Cake at Stake, BFDI 16)' },
  anntosser:  { who: 'Announcer (CAKE AT STAKE!)',   kits: ['anntosser'],  file: 'Cake Tosser.png',                note: 'the Cake Tosser, the arm cakes come out of', h: 40 },
  annballoon: { who: 'Announcer (WATER BALLOONS!)',  kits: ['annballoon'], file: 'Water balloon.png',              note: 'a water balloon (A Leg Up in the Race: "Ha, ha, water balloons.")' },
  annacid:    { who: 'Announcer (ACID TEARS!)',      kits: ['annacid'],    file: 'Thats crying or barfing.png',    note: 'the acid he cries, cut out of the glob in its scene (Speaker Box (species), Scenes)', key: 'prop', region: [375, 118, 556, 234], srcH: 347, h: 40,
    keep: (r, g, b) => g >= r + 45 && g >= b + 35 },
  annspark:   { who: 'Announcer (QUADRUPLE LASER!)', kits: ['annspark'],   file: 'Pointy Star.png',                note: "a sparkle along the Laser Powered Teleportation Device's beam" },
  annpress:   { who: 'Announcer (CRUSHER ARM!)',     kits: ['annpress'],   file: 'Old announcer crusher.png',      note: "the crusher's press, the grey block under its arm (Announcer Crusher, BFDI 2), cut from the asset (a block: it fills its own canvas)", region: [100, 505, 1800, 1990], srcH: 400, h: 56, solid: true },
  // @boss:announcer:end picks

  // @boss:puffball:begin picks
  // Puffball Speaker Box. Catch These Hands: "Puffball Speaker Box slices Book to pieces with several knives" -- the Cake at Stake knife
  // (File:One knife.png: the wiki's own clean, transparent file of it) is what CONSEQUENCES! throws, and the one stuck in her back from phase 2.
  // PRIVATE!'s notes are the BFDIA 14 note body (faceless, like the other NNbody props above). The sound rings and the lake are drawn.
  psbknife: { who: 'Puffball Speaker Box', kits: ['psbknife'], file: 'One knife.png', note: 'one of the knives that slice Book to pieces (Catch These Hands: "slices Book to pieces with several knives"), the Cake at Stake knife; the same knife is the one stuck in her back', h: 100 },
  psbnote:  { who: 'Puffball Speaker Box', kits: ['psbnote'],  file: 'Bfdia 14body musicnote.png', note: 'a note of her song in PRIVATE! (the BFDIA 14 note body, faceless)' },
  // @boss:puffball:end picks

  // @boss:firey:begin picks
  // Firey Speaker Box (Boss 3; the boss overhaul, 2026-09-29). The show's own files, no key needed (each is already a transparent
  // PNG on the wiki), for what he throws and what a beaten one leaves. Boss art that is a render (his hoverboard, his metal look)
  // is in CREDITS.md's table beside the other renders, and the fire he throws is the fireball and the flame already above.
  //   fsbarm       YOU MUST!: "Pin's limbs are removed by mechanical hands from the Speaker Box" (Get in the Van/Transcript); the
  //                arm is File:Fsb arm.png on his Gallery ("Firey speaker box's Arm")
  //   firemonster  the volcano's Fire Monster, which "eats Flower when she runs into it" (Don't Pierce My Flesh/Transcript) and
  //                lives in the magma (Volcano, Trivia); the hazard at the arena's two edges draws it
  //   fsbpart1-7   "broken into 7 pieces" (Firey Speaker Box, Designs: Fireyspeakerboxparts.png, and Gallery: Fsb 1-7.png): his
  //                ending. Each is its own file, torn wiring and all, drawn as one of seven pieces flung out of him
  fsbarm:      { who: 'Firey Speaker Box', kits: ['fsbarm'], file: 'Fsb arm.png', note: "his arm, the mechanical hands of YOU MUST! (File:Fsb arm.png)", srcH: 400, h: 120 },
  firemonster: { who: 'Firey Speaker Box', kits: ['fsbmonster'], file: 'Fire Monster.png', note: "the Fire Monster that lives in the volcano (File:Fire Monster.png)", srcH: 300, h: 128 },
  fsbpart1:    { who: 'Firey Speaker Box', kits: ['fsbpart1'], file: 'Fsb 1.png', note: 'piece 1 of the seven he was broken into (File:Fsb 1.png)', h: 120 },
  fsbpart2:    { who: 'Firey Speaker Box', kits: ['fsbpart2'], file: 'Fsb 2.png', note: 'piece 2 of the seven he was broken into (File:Fsb 2.png)', h: 120 },
  fsbpart3:    { who: 'Firey Speaker Box', kits: ['fsbpart3'], file: 'Fsb 3.png', note: 'piece 3 of the seven he was broken into (File:Fsb 3.png)', h: 120 },
  fsbpart4:    { who: 'Firey Speaker Box', kits: ['fsbpart4'], file: 'Fsb 4.png', note: 'piece 4 of the seven he was broken into (File:Fsb 4.png)', h: 120 },
  fsbpart5:    { who: 'Firey Speaker Box', kits: ['fsbpart5'], file: 'Fsb 5.png', note: 'piece 5 of the seven he was broken into (File:Fsb 5.png)', h: 120 },
  fsbpart6:    { who: 'Firey Speaker Box', kits: ['fsbpart6'], file: 'Fsb 6.png', note: 'piece 6 of the seven he was broken into (File:Fsb 6.png)', h: 120 },
  fsbpart7:    { who: 'Firey Speaker Box', kits: ['fsbpart7'], file: 'Fsb 7.png', note: 'piece 7 of the seven he was broken into (File:Fsb 7.png)', h: 120 },
  // @boss:firey:end picks

  // @boss:swarm:begin picks
  // The Bug Swarm (Boss 4): the Bugs page's own assets ("The swarm and every bug wear the wiki's Bugs art"). Every one is a
  // clean transparent PNG of the thing itself on the wiki (the Bugs page's Assets/Poses gallery and infobox), so none needs a
  // key: the purple- and red-spotted bugs, the stinger bug, the egg and the egg sac, the crushed bug's adhesive, the big bug,
  // the Host Bug, the mutated bug of TPOT 21-23, the larva and the Queen. The Bugs page says of them: "a sticky adhesive
  // that can come in colors of grey, green, and purple", "a bug with poison stingers", "A big bug", "A bag of 10 million Bug
  // Larvae". Their drawings are crude scribbles by design (the wiki files them under Poorly Drawn Characters).
  bugpurple: { who: 'The Bug Swarm', kits: ['bugpurple'], file: 'Purple bug.png',  note: 'a purple-spotted bug, the Bugs page asset (BFDIA 3+)' },
  bugred:    { who: 'The Bug Swarm', kits: ['bugred'],    file: 'Red bug.png',     note: 'a red-spotted bug, the Bugs page asset (BFDIA 3+)' },
  bugcool:   { who: 'The Bug Swarm', kits: ['bugcool'],   file: 'Cool bug.png',    note: "a purple-spotted bug (BFDI 24, BFDIA 12), the swarm's other drawing of one", srcH: 436 },
  bugsting:  { who: 'The Bug Swarm', kits: ['bugsting'],  file: 'Bug stinger.png', note: 'a bug with poison stingers, the Bugs page asset', srcH: 167 },
  bugegg:    { who: 'The Bug Swarm', kits: ['bugegg'],    file: 'Bug egg.png',     note: 'a bug egg, the Bugs page asset' },
  bugeggs:   { who: 'The Bug Swarm', kits: ['bugeggs'],   file: 'Bug eggs.png',    note: "multiple bug eggs: the egg sac Flower throws (Insectophobe's Nightmare 2)" },
  bugsplat:  { who: 'The Bug Swarm', kits: ['bugsplat'],  file: 'Bug Crushed.png', note: 'a crushed bug and its sticky adhesive, the Bugs page asset', srcH: 400 },
  bugbig:    { who: 'The Bug Swarm', kits: ['bugbig'],    file: 'Big buggy.png',   note: "a big bug, the Bugs page asset (the swarm's core)", h: 128 },
  bughost:   { who: 'The Bug Swarm', kits: ['bughost'],   file: 'Bug.png',         note: "the Host Bug (Insectophobe's Nightmare 4), the Host Bug page's image", h: 128 },
  bugmutant: { who: 'The Bug Swarm', kits: ['bugmutant'], file: 'GiantInsectMonsterBug.png', note: "the mutated bug (TPOT 21-23), the Bugs page infobox's Monstrous", h: 128 },
  buglarva:  { who: 'The Bug Swarm', kits: ['buglarva'],  file: 'Freakywormcritter.png', note: "a bug as a larva (BFB 21), the Bugs page infobox's Larvae" },
  bugqueen:  { who: 'The Bug Swarm', kits: ['bugqueen'],  file: 'Screenshot 2024-05-16 6.37.23 PM-removebg-preview.png', note: "the Queen Bug (BFDIA 12), 15 pinkish spots, the Bugs page infobox's Queen", srcH: 103 },
  // @boss:swarm:end picks

  // @boss:purpleface:begin picks
  // Purple Face (Boss 5), the boss overhaul: the show's own art for what he throws and what stands in his warehouse. Every file is the
  // thing itself from the show -- a transparent PNG on the BFDI wiki -- and each note says the moment it is from. Names are prefixed
  // `pface` so no other boss's pick can share one.
  pfacebug:    { who: 'Purple Face', kits: ['pfacebug'],    file: 'Purple bug.png', h: 40,
    note: "the Purple-spotted Bug (the Bugs page: BFDI 22, BFDIA 3+), hundreds of which Purple Face drops into Flower's tank in TORTURE TIME! (SOS (Save Our Show): \"Purple Face releases the bugs into Flower's tank.\")" },
  pfacetotem:  { who: 'Purple Face', kits: ['pfacetotem'],  file: ['Black totem (teardrop).png', 'Black totem.png'], h: 56,
    note: 'a black totem, rolled out by THANK YOU FOR COMING! (The Tweested Temple: "A totem emerges from the floor." / "The totem rolls away")' },
  pfacetotemw: { who: 'Purple Face', kits: ['pfacetotemw'], file: 'White totem -lollipop-.png', h: 56,
    note: "a white totem, rolled out beside the black one (The Tweested Temple's totem set)" },
  pfaceshoe:   { who: 'Purple Face', kits: ['pfaceshoe'],   file: 'Total Slip Shoe So Wah.png', h: 44,
    note: "Purple Face's \"Total Slip Shoes So Wah\", lobbed by TOTAL SLIP SHOES! (Catch These Hands: \"Purple Face puts some clown shoes on Yellow Face.\")" },
  pfacestar:   { who: 'Purple Face', kits: ['pfacestar'],   file: 'Pointy Star.png', h: 40,
    note: "a pointy star (the BFDI assets), the spark on the big beat of FREESTYLE RAP!" },
  pfacemagnet: { who: 'Purple Face', kits: ['pfacemagnet'], file: "World's Strongest Magnet (TPOT 5).png", h: 96,
    note: "the World's Strongest Magnet over Yellow Face's Warehouse (Fishes and Dishes: \"forced the shelves from other sides to fall on top of the team\")" },
  // @boss:purpleface:end picks

  // @boss:dragon:begin picks
  // ---- Purple Dragon (Boss 6): what it throws. The flame: File:Dragony3.png (Dragon page gallery: "The dragon breathing fire") is a frame of the Fishes and Dishes dragon
  // on a plain sky, the fire a swirl of orange and yellow in front of its mouth; the pixels that are fire are kept, the largest piece of them, and the sky in the ring stays clear.
  // Roboty is his book render (the one his fighter wears): "Roboty flies in" through the door in the wind lottery (Category One). The Steakhouse sign, the Recovery Center, the
  // couch, the chainsaw, the paper and the key the wind lottery threw are DRAWN (PROJ_SHAPE): the sign's and the Recovery Center's files have their lettering baked in, and a match
  // shows no words -- "Yes, cut or draw" (the owner, 2026-09-29).
  dragonflame:  { who: 'Purple Dragon', kits: ['dragon'], file: 'Dragony3.png', key: 'prop', region: [668, 340, 860, 500], srcH: 767, h: 44,
    keep: (r, g, b) => r >= 200 && g >= 120 && b <= 175 && r - b >= 70, note: 'the flame of its breath (Dragon page: "The dragon breathing fire"), lifted out of the frame' },
  dragonroboty: { who: 'Purple Dragon', kits: ['dragon'], file: 'Roboty book.png', h: 64, note: 'Roboty, who "flies in" through the door in the wind lottery (Category One)' },
  // @boss:dragon:end picks

  // @boss:mephone4:begin picks
  // ---- MEPHONE4 (Boss 6), rebuilt in the boss overhaul: the show's own art for what he throws and opens. Names are prefixed `mp4` so no other boss's pick can share one.
  // The glove: File:Late II Fist Thingy.png (the Fist Thingy page: "a red boxing glove with the label 'Fist Thingy' on it attached to a gray or white pole") is a clean
  // transparent asset, but its cuff band carries the label and a match shows no words, so only the glove is cut (the region ends where the band begins); the cuff, the band
  // (blank) and the pole are drawn in code beside it ("Yes, cut or draw", the owner, 2026-09-29).
  mp4glove:  { who: 'MePhone4 (FIST THINGY!)',       kits: ['mp4glove'],  wiki: 'ii', file: 'Late II Fist Thingy.png', region: [0, 0, 200, 215], h: 96,
    note: 'the red glove of the Fist Thingy, cut from File:Late II Fist Thingy.png before its labelled cuff band (the band and the pole are drawn)' },
  // The Rejection Portal page: "a vertical, circular vortex ... It has yellow and pink on the inside and will fade away if an object enters it." File:Rejection Portal (Bigger Version).png
  // is the wiki's own isolated oval of it.
  mp4portal: { who: 'MePhone4 (REJECTION PORTAL!)',  kits: ['mp4portal'], wiki: 'ii', file: 'Rejection Portal (Bigger Version).png', h: 128,
    note: 'the Rejection Portal, pink with yellow rings (the wiki\'s isolated oval of it)' },
  // The Great Escape/Transcript: "(MePhone4 throws a boomerang at Party Hat, but before it can reach him, it rebounds and returns to MePhone4's hand.)" The boomerang is the one in his hand in
  // File:S1RE14 MePhone's boomerangs.png (a remaster frame): the peach body and red tips are warm, the TV behind it dark navy and the frame's bar a pale grey, so the warm pixels are the cut.
  mp4boom:   { who: 'MePhone4 (BOOMERANGS!)',        kits: ['mp4boom'],   wiki: 'ii', file: "S1RE14 MePhone's boomerangs.png", key: 'prop', region: [385, 60, 480, 185], srcH: 508, h: 56,
    keep: (r, g, b) => r >= 140 && r - b >= 40, note: "one of MePhone4's boomerangs, lifted out of his hand in the Great Escape remaster frame" },
  // @boss:mephone4:end picks

  // @boss:evilleafy:begin picks
  // ---- Evil Leafy (Boss 7), the boss overhaul. "Colours: ... Evil Leafy red with black vines 'and add sprites for the tendrils'" (the owner, 2026-09-29): her vines wear the
  // wiki's own art. Both files are clean transparent PNGs of the thing itself on the BFDI wiki, so neither needs a key.
  //   elvine    File:Evil Leafy's Vines.png (Evil Leafy/Gallery; 1280x1170): the black thorny vine mass that "invades the whole screen" (She Deserves This/Transcript) -- the thicket
  //             a TENDRILS! vine is built of, what a possessed platform thrashes, the curtain at the edge of the forest, and the rim of the BLACK HOLE! ("Her vines start to grow
  //             again, until it turns into a black circle void that resembles a black hole"): the mass is a ring of vines round an empty heart, so it is the hole's rim as it is
  //   elfrozen  File:Frozen Evil Leafy.png (Evil Leafy page): "Golf Ball uses freeze juice to freeze Evil Leafy ... Coiny grabs a computer monitor and throws it at her, shattering
  //             and killing her" (She Deserves This) -- her ending
  elvine:   { who: 'Evil Leafy', kits: ['elvine'],   file: "Evil Leafy's Vines.png", h: 120, note: "the black thorny vine mass of Evil Leafy's tendrils (Evil Leafy/Gallery; She Deserves This: her tentacles invade the whole screen)" },
  elfrozen: { who: 'Evil Leafy', kits: ['elfrozen'], file: 'Frozen Evil Leafy.png',   h: 128, note: 'Evil Leafy frozen solid, the moment before she shatters (She Deserves This: Golf Ball freezes her, Coiny throws a monitor)' },
  // @boss:evilleafy:end picks

  // @boss:mephone4s:begin picks
  // @boss:mephone4s:end picks

  // @boss:two:begin picks
  // ---- Two (Boss 10): what he throws, stacks and rides. The spiked sun is File:Spike Ball aka Sun (BFB 16).png (a red ball with eight steel spikes: "Two transforms the sun into a spiked ball and begins
  // bashing Four's head with it", The Escape from Four/Transcript). The Power of Two's orbs wear the prize's own icon (File:TPOT(prize).svg: a lime blob round a yellowish-green heart, "Outside: Lime Green /
  // Inside: Yellowish Green"; the wiki's file is an SVG, so the server rasterises it: png). A copy of your special that has no art of its own comes back as the green glow of File:Two's Powers.png. The blocks that
  // stack, fall, lie as steps and make up the cars of the rails are the show's own team blocks (the Blocks page: File:TSTOE Block.png red, File:JN Block.png yellow, File:TheS Block.png periwinkle, File:AYO Block.png
  // green -- "the seats were made out of blocks" is Are You Okay's rollercoaster). His hands (CLAP!), the rails and carts, the park and the landing pad of his ending are DRAWN: no file of them is clean ("Yes, cut or draw").
  twosun:    { who: 'Two', kits: ['two'], file: 'Spike Ball aka Sun (BFB 16).png', h: 110,
    note: 'the spiked sun he bashes with and circles himself with ("Two transforms the sun into a spiked ball", The Escape from Four)' },
  twoprize:  { who: 'Two', kits: ['two'], file: 'TPOT(prize).svg', png: true, h: 48,
    note: "the Power of Two's prize, the orbs of THE POWER OF TWO! (The Power of Two (prize): \"Outside: Lime Green / Inside: Yellowish Green\")" },
  twoglow:   { who: 'Two', kits: ['two'], file: "Two's Powers.png", h: 64,
    note: "the green glow of Two's power, what a MIND READ! copy with no art of its own comes back as" },
  twoblock0: { who: 'Two', kits: ['two'], file: 'TSTOE Block.png', h: 48, solid: true, note: "a red team block (The Strongest Team on Earth's): BLOCK TOWERS! and the carts of I LOVE RIDES!" },
  twoblock1: { who: 'Two', kits: ['two'], file: 'JN Block.png', h: 48, solid: true, note: "a yellow team block (Just Not's): BLOCK TOWERS! and the carts of I LOVE RIDES!" },
  twoblock2: { who: 'Two', kits: ['two'], file: 'TheS Block.png', h: 48, solid: true, note: "a periwinkle team block (The S!'s): BLOCK TOWERS! and the carts of I LOVE RIDES!" },
  twoblock3: { who: 'Two', kits: ['two'], file: 'AYO Block.png', h: 48, solid: true, note: "a green team block (Are You Okay's): BLOCK TOWERS! and the carts of I LOVE RIDES!" },
  // @boss:two:end picks

  // @boss:four:begin picks
  // ---- FOUR (Boss 12): what he throws. LOVE HEARTS!: the show's Love Heart -- "a type of item that Four shoots out of his body when he sees something he adores ... The hearts
  // themselves appear to be solid, thus they can hurt someone" (the Love Hearts page; "Today's Very Special Episode": "Four spews out a flood of hearts. One hits Eraser and he flies
  // off beyond the horizon"). File:Love hearts0001.png ("A bunch of Love Hearts. (BFB)", 500x500) is the wiki's own clean, transparent file of the BFB (pink) hearts, so it needs no key:
  // the middle heart is cut out of it (File:BFB Heart.png holds a heart only 26 px across). Everything else he does is DRAWN, "Yes, cut or draw" (the owner, 2026-09-29): there is no
  // file of a sound wave that is not a character (SCREECHY!'s ring); the beam of the Zappies page is an episode frame (File:FourEnergyBeam.png, 1920x1080, 0% clear) with no beam to
  // cut; his hills and cactus are drawn in the show's colours after The Fourest's trees and the Four cactus of Chapter Complete (no file of either on the wiki); and I DO THIS!'s
  // shards are drawn in the marked fighter's own colours ("only their color palette is intact": the files of a mutilation, File:Pin Mutilated.png and File:Foldy Mutilated.png,
  // are of Pin and Foldy).
  fourheart: { who: 'Four (LOVE HEARTS!)', kits: ['fourheart'], file: 'Love hearts0001.png', region: [190, 222, 299, 326], srcH: 500, h: 48, note: 'a Love Heart, the middle one of the wiki bunch of BFB hearts (Love Hearts page: "Four shoots out of his body when he sees something he adores")' },
  // @boss:four:end picks

  // ---- Steve Cobs's fight (the boss overhaul, 2026-09-30): what he throws, in the show's art ("Yes, cut or draw": cut from frames where the show
  // has them, draw where it has none). The MeKnife, the lollipops and the Fist Thingy (reused: fist.png) and the pencil (reused: pencil.png) are standalone
  // files; the boomerang, the van and the popcorn are lifted out of frames (the van and the popcorn hand-masked: poly is their silhouette, traced off the
  // frame, holes filled; the boomerang is its own colours on the dark screen behind it). The Meeple Watch's frame is a 529x313 close-up of Cobs with the
  // watch a smudge in the corner, so it stays drawn. His chainsaws keep Saw's blade (sawblade.png; the II wiki has no chainsaw file).
  cobsknife:     { who: 'Steve Cobs', kits: ['meepleknife'], wiki: 'ii', file: 'MeKnife.png', h: 100, note: 'the MeKnife, a knife with the Meeple logo on its handle (File:MeKnife.png), point up' },
  cobslolli1:    { who: 'Steve Cobs', kits: ['cobslolli1'], wiki: 'ii', file: 'Lollipop1.png', h: 44, note: 'a lollipop, the red swirl (The Tile Divide: lollipops and chainsaws thrown together)' },
  cobslolli2:    { who: 'Steve Cobs', kits: ['cobslolli2'], wiki: 'ii', file: 'Lollipop2.png', h: 50, note: 'a lollipop, the green one (The Tile Divide), candy at the left' },
  cobsboomerang: { who: 'Steve Cobs', kits: ['cobsboomerang'], wiki: 'ii', file: "S1RE14 MePhone's boomerangs.png", key: 'prop', region: [393, 62, 472, 180], srcH: 508, h: 60,
    keep: (r, g, b) => (r >= 190 && r - b >= 50) || (r >= 110 && r - g >= 55 && r - b >= 40), note: 'the prize boomerang, orange with red tips (The Great Escape), lifted off the dark screen behind MePhone4' },
  cobsvan:       { who: 'Steve Cobs', kits: ['meeplevan'], wiki: 'ii', file: 'S2e7 a police van throws mephone4 out of back.png', key: 'prop', region: [535, 55, 1308, 586], srcH: 768, h: 64,
    poly: [[1145,58],[1168,63],[1171,85],[1233,88],[1261,97],[1303,287],[1292,397],[1291,425],[1298,428],[1293,466],[1245,463],[1235,510],[1221,530],[1205,534],[1166,528],[1155,517],[1146,492],[1106,503],[1089,501],[1084,535],[1069,567],[1050,580],[1014,580],[993,574],[976,547],[950,555],[853,544],[849,493],[754,483],[753,532],[676,524],[675,462],[569,450],[550,394],[539,323],[542,251],[558,134],[667,136],[675,109],[682,104],[780,90],[914,83],[1158,85],[1162,65],[1152,63],[1149,68],[1139,60]],
    keep: () => true, note: 'the van that pulls up, throws MePhone4 out of its back doors and drives away (season 2, episode 7), hand-masked out of the frame' },
  cobspopcorn:   { who: 'Steve Cobs', kits: ['popcorn'], wiki: 'ii', file: 'Popcorn Everywhere!.png', key: 'prop', region: [698, 42, 1250, 672], srcH: 1080, h: 48,
    poly: [[901,46],[922,46],[949,64],[966,107],[993,81],[1023,86],[1110,159],[1109,209],[1160,187],[1184,197],[1197,216],[1198,232],[1172,267],[1232,299],[1241,321],[1245,372],[1231,439],[1215,469],[1174,515],[1149,529],[1087,511],[1093,540],[1087,559],[1043,584],[1014,571],[990,540],[968,603],[947,634],[929,654],[886,668],[842,661],[797,643],[769,628],[752,603],[742,560],[749,531],[813,397],[722,359],[705,324],[702,290],[733,182],[771,165],[840,181],[829,119],[834,102],[859,72]],
    keep: () => true, note: 'a popped kernel, from the frame of the popcorn he exploded into (Objects in Mirror), hand-masked' },
  // ---- Steve Cobs's prize (OJ, Suitcase, Cabby): begin ----
  // The three II winners, allowed in only as Steve Cobs's prize ("3, but only after you beat cobs."). The owner's art answers
  // (2026-09-29): OJ's shards -- "crop the shards that were stuck to book in shattered." and then "the episode bfdia 23." --
  // come out of BFDIA 23 ("Shattered!", the BFDI wiki), File:BookSmashesThroughtheGlass.png: Book bursting up through the pane,
  // its shards flying round him. The cut is the long shard at his right shoulder: pale rainbow glass with a dark outline over
  // saturated sky blue, which the glass never is (key 'glass'). His juice puddle is DRAWN (a flat orange puddle with a paler
  // rim), per the owner, so it has no pick.
  ojshard:  { who: 'OJ',        kits: ['spill'],  file: 'BookSmashesThroughtheGlass.png', note: 'a glass shard, cropped out of the BFDIA 23 (Shattered!) frame where Book smashes up through the glass (the owner: "crop the shards that were stuck to book in shattered", "the episode bfdia 23.")', key: 'glass', region: [835, 212, 962, 296], srcH: 598, h: 40 },
  // Suitcase's bomb -- "cut from an Objects in Mirror frame" (find the frame where the bomb is clearest, hand-mask it): the
  // episode's frames are JPEGs (II218_1..189); II218_140 is Cobs holding the bomb up against the sky in his two black hands,
  // the clearest of them. Flat white with a pale shade: the near-white is kept and the bites his fingers left are closed with
  // its own colour (key 'orb', the Shimmer Orb's), so what ships is the bomb alone. The game adds the glow.
  casebomb: { who: 'Suitcase',  kits: ['voices'], wiki: 'ii', file: 'II218 140.jpeg', png: true, note: 'the bomb Cobs took out of her (Objects in Mirror), cut from the frame where he holds it up', key: 'orb', region: [1545, 705, 2290, 1430], srcH: 1080, h: 44 },
  // Suitcase's wrench -- "cut from the Marsh on Mars frame": File:S2e2 wow, this should make this challenge a walk in the park!.png,
  // where she stands open with a wrench, a hammer and a ruler inside. The wrench lies across the hammer's handle and under its
  // claw, so it is hand-masked first (poly, in the frame's own pixels: the open jaw and the handle up to the claw) and then keyed
  // grey (key 'prop'): the case's brown interior, the sunflower straps and what is left of the hammer go.
  wrench:   { who: 'Suitcase',  kits: ['voices'], wiki: 'ii', file: 'S2e2 wow, this should make this challenge a walk in the park!.png', note: 'the wrench from inside her (Marsh on Mars), hand-masked out of the frame', key: 'prop', region: [1028, 552, 1104, 604], srcH: 768, h: 40,
    poly: [[1037, 557], [1062, 557], [1075, 560], [1075, 571], [1100, 571], [1100, 589], [1075, 589], [1074, 592], [1061, 599], [1039, 599], [1034, 595], [1039, 584], [1051, 577], [1039, 564], [1034, 560]],
    keep: (r, g, b) => Math.max(r, g, b) - Math.min(r, g, b) < 30 },
  // Cabby's file: File:Cabby file pose.png is a clean, transparent manila folder on its own.
  file:     { who: 'Cabby',     kits: ['files'],  wiki: 'ii', file: 'Cabby file pose.png', note: 'a file from her drawer (File:Cabby file pose.png)', h: 40 },
  // ---- Steve Cobs's prize: end ----
  // ---- Springy's MY PURPOSE! (the boss overhaul, Round 10: "give him 1 more: the bot toy"): Spring-Bot itself. Springy has no picks slot, so
  // this is the one block, at the end of the list. File:Springbot.png is the toy's own render (the Spring-toys page's gallery, season 3), a clean
  // transparent PNG: no key and no cut. Green, with the red antenna, the speaker in its mouth, the grey claws and the black feet.
  springbot: { who: 'Springy', kits: ['springbot'], wiki: 'ii', file: 'Springbot.png', srcH: 508, h: 80, note: "Spring-Bot, the toy Springy programmed in the image of Bot (File:Springbot.png): the toy of MY PURPOSE!, whose speaker plays back the specials it hears" },
};

async function api(wiki, params) {
  const r = await fetch(`${WIKIS[wiki]}/api.php?${new URLSearchParams({ ...params, format: 'json' })}`, { headers: UA });
  if (!r.ok) throw new Error(`api ${r.status}`);
  return r.json();
}
async function fileUrl(wiki, title) {
  const j = await api(wiki, { action: 'query', titles: `File:${title}`, prop: 'imageinfo', iiprop: 'url|size|mime' });
  const p = Object.values(j.query.pages)[0];
  const i = p && p.imageinfo && p.imageinfo[0];
  return i ? { url: i.url, w: i.width, h: i.height, mime: i.mime } : null;
}
// `?format=original` is load-bearing (see fetch-sprites.mjs): Wikia content-negotiates to WebP even when
// the URL ends in .png. scale-to-height-down has the server shrink giant renders before they travel.
function originalUrl(url, h, png) {
  const base = url.split('/revision/')[0];
  return `${base}/revision/latest/scale-to-height-down/${h}?format=${png ? 'png' : 'original'}`;
}
async function download(url, h, png) {
  const r = await fetch(originalUrl(url, h, png), { headers: UA });
  if (!r.ok) throw new Error(`download ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}
function alphaBox(png) {
  let x0 = png.width, y0 = png.height, x1 = -1, y1 = -1, clear = 0;
  for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
    const a = png.data[(y * png.width + x) * 4 + 3];
    if (a < 16) { clear++; continue; }
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return { x0, y0, x1, y1, clearFrac: clear / (png.width * png.height) };
}
// box-filter downscale of a cropped region to height H (aspect kept, long side capped at MAX_SIDE);
// pngjs RGBA, premultiplied average
function shrink(png, box, H) {
  const sw = box.x1 - box.x0 + 1, sh = box.y1 - box.y0 + 1;
  const scale = Math.min(1, H / sh, MAX_SIDE / sw), W = Math.max(1, Math.round(sw * scale)), HH = Math.max(1, Math.round(sh * scale));
  const out = new PNG({ width: W, height: HH });
  for (let y = 0; y < HH; y++) for (let x = 0; x < W; x++) {
    const sx0 = box.x0 + Math.floor(x / scale), sx1 = Math.min(box.x1, box.x0 + Math.floor((x + 1) / scale) - 1);
    const sy0 = box.y0 + Math.floor(y / scale), sy1 = Math.min(box.y1, box.y0 + Math.floor((y + 1) / scale) - 1);
    let r = 0, g = 0, b = 0, a = 0, n = 0;
    for (let sy = sy0; sy <= Math.max(sy0, sy1); sy++) for (let sx = sx0; sx <= Math.max(sx0, sx1); sx++) {
      const i = (sy * png.width + sx) * 4, al = png.data[i + 3] / 255;
      r += png.data[i] * al; g += png.data[i + 1] * al; b += png.data[i + 2] * al; a += al; n++;
    }
    const o = (y * W + x) * 4;
    if (a > 0) { out.data[o] = r / a; out.data[o + 1] = g / a; out.data[o + 2] = b / a; out.data[o + 3] = Math.round(255 * a / n); }
    else { out.data[o] = out.data[o + 1] = out.data[o + 2] = 0; out.data[o + 3] = 0; }
  }
  return out;
}

// ---- cutting an object out of a sheet or a frame -------------------------------------------------
function cut(png, [x0, y0, x1, y1]) {
  const w = x1 - x0, h = y1 - y0, out = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) png.data.copy(out.data, y * w * 4, ((y0 + y) * png.width + x0) * 4, ((y0 + y) * png.width + x1) * 4);
  return out;
}
// A hand mask (`poly`): the polygon is drawn in the ORIGINAL file's pixels; `region` is where the cut began and `s` the scale
// the download came back at. Ray casting, one pixel at a time: outside becomes air.
function maskPoly(png, poly, region, s) {
  const { width: w, height: h, data: d } = png;
  const inside = (x, y) => { let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; }
    return c; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!inside(region[0] + (x + 0.5) / s, region[1] + (y + 0.5) / s)) d[(y * w + x) * 4 + 3] = 0;
}
const minC = (d, i) => Math.min(d[i], d[i + 1], d[i + 2]);
const lum = (d, i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
// 'white': flood from every border pixel through near-white; what the flood reaches is the paper. The
// ring of pixels it touched is the anti-aliased outline, blended with white: un-blend it so no pale
// halo is left behind. Near-white INSIDE the object (pages, highlights) is not reachable and stays.
function keyWhite(png) {
  const { width: w, height: h, data: d } = png, bg = new Uint8Array(w * h), stack = [];
  const push = (x, y) => { const k = y * w + x; if (!bg[k] && minC(d, k * 4) >= 232) { bg[k] = 1; stack.push(k); } };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) { const k = stack.pop(), x = k % w, y = (k - x) / w;
    if (x > 0) push(x - 1, y); if (x < w - 1) push(x + 1, y); if (y > 0) push(x, y - 1); if (y < h - 1) push(x, y + 1); }
  for (let k = 0; k < w * h; k++) {
    const i = k * 4;
    if (bg[k]) { d[i + 3] = 0; continue; }
    const x = k % w, y = (k - x) / w;
    const edge = (x > 0 && bg[k - 1]) || (x < w - 1 && bg[k + 1]) || (y > 0 && bg[k - w]) || (y < h - 1 && bg[k + w]);
    if (!edge) continue;
    const a = Math.min(1, Math.max(0.15, (255 - minC(d, i)) / 160));
    for (let c = 0; c < 3; c++) d[i + c] = Math.max(0, Math.min(255, Math.round((d[i + c] - (1 - a) * 255) / a)));
    d[i + 3] = Math.round(255 * a);
  }
}
// 'green': a flat green backdrop. Green-dominant pixels go; the margin by which green dominates sets a
// soft edge, and the survivors are despilled so no green fringe rides along.
function keyGreen(png) {
  const d = png.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2], m = g - Math.max(r, b);
    if (m >= 28) { d[i + 3] = 0; continue; }
    if (m > 8) d[i + 3] = Math.round(d[i + 3] * (28 - m) / 20);
    if (m > 0) d[i + 1] = Math.max(r, b);
  }
}
// 'glow': a white-hot bolt with a cyan glow on a flat sky. The sky is the median of the border; how far a
// pixel rises above it in brightness is its alpha, and its colour is what it was before the sky showed
// through. Faint shapes in the sky (under `floor`) fall away, and so does anything warm (red over blue):
// the bolt is white and cyan, so the golden flare where it hits, and the ground it hits, are not it.
// The sky's pale shards are a thin WHITE wash over it (red, green and blue rise alike, by about 25); the glow
// is CYAN (green rises far above red) and the core is white-hot. So a pixel that is neither well above the
// shards in brightness nor cyan is a shard, and goes -- a low `floor` keeps the glow without keeping them.
function keyGlow(png, pick = {}) {
  const floor = pick.floor != null ? pick.floor : 36;
  const { width: w, height: h, data: d } = png, border = [];
  for (let x = 0; x < w; x++) border.push((0 * w + x) * 4, ((h - 1) * w + x) * 4);
  for (let y = 0; y < h; y++) border.push((y * w) * 4, (y * w + w - 1) * 4);
  const med = (c) => { const v = border.map(i => d[i + c]).sort((a, b) => a - b); return v[v.length >> 1]; };
  const sky = [med(0), med(1), med(2)], skyL = 0.299 * sky[0] + 0.587 * sky[1] + 0.114 * sky[2];
  for (let i = 0; i < d.length; i += 4) {
    const rise = lum(d, i) - skyL, cyan = (d[i + 1] - sky[1]) - (d[i] - sky[0]);
    const notShard = Math.max(Math.min(1, Math.max(0, (rise - 45) / 30)), Math.min(1, Math.max(0, (cyan - 6) / 20)));
    const a = d[i] > d[i + 2] + 6 ? 0 : notShard * Math.max(0, Math.min(1, (rise - floor) / (255 - skyL - floor)));
    if (a <= 0) { d[i + 3] = 0; continue; }
    for (let c = 0; c < 3; c++) d[i + c] = Math.max(0, Math.min(255, Math.round((d[i + c] - (1 - a) * sky[c]) / a)));
    d[i + 3] = Math.round(255 * a);
  }
}
// 'orb': the Shimmer Orb is flat near-white, held in Box's two black hands against his brown side. Keep
// the near-white only; the hands leave two bites in its lower edge, so close them with the orb's own
// white out to its convex hull -- one flat white, as the show draws it, so no outline of a finger is
// left behind. Nothing of Box survives: his brown and his hands are not near-white.
function keyOrb(png) {
  const { width: w, height: h, data: d } = png, pts = [];
  let sr = 0, sg = 0, sb = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (d[i + 3] > 200 && minC(d, i) >= 205) { pts.push([x, y]); sr += d[i]; sg += d[i + 1]; sb += d[i + 2]; }
  }
  const n = pts.length, fill = [sr / n, sg / n, sb / n];
  // monotone-chain convex hull
  pts.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const p of pts) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop(); lower.push(p); }
  for (let k = n - 1; k >= 0; k--) { const p = pts[k]; while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop(); upper.push(p); }
  const hull = lower.slice(0, -1).concat(upper.slice(0, -1));
  const inside = (x, y) => { for (let k = 0; k < hull.length; k++) if (cross(hull[k], hull[(k + 1) % hull.length], [x, y]) < 0) return false; return true; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (!inside(x, y)) { d[i + 3] = 0; continue; }
    d[i] = fill[0]; d[i + 1] = fill[1]; d[i + 2] = fill[2]; d[i + 3] = 255;
  }
}
// Square-element morphology on a 0/1 mask (separable: rows, then columns). grow: dilate, else erode.
function morph(m, w, h, rad, grow) {
  const t = new Uint8Array(w * h), o = new Uint8Array(w * h), off = grow ? 0 : 1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = off;
    for (let k = -rad; k <= rad; k++) { const xx = x + k, s = xx < 0 || xx >= w ? off : m[y * w + xx]; if (s !== off) { v = 1 - off; break; } }
    t[y * w + x] = v;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = off;
    for (let k = -rad; k <= rad; k++) { const yy = y + k, s = yy < 0 || yy >= h ? off : t[yy * w + x]; if (s !== off) { v = 1 - off; break; } }
    o[y * w + x] = v;
  }
  return o;
}
// Flood from every border pixel through `pass`; returns what the flood reached.
function floodBorder(pass, w, h) {
  const seen = new Uint8Array(w * h), stack = [];
  const push = (k) => { if (!seen[k] && pass[k]) { seen[k] = 1; stack.push(k); } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (stack.length) { const k = stack.pop(), x = k % w;
    if (x > 0) push(k - 1); if (x < w - 1) push(k + 1); if (k >= w) push(k - w); if (k < (h - 1) * w) push(k + w); }
  return seen;
}
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const touches = (m, k, w, N) => { const x = k % w; return (x > 0 && m[k - 1]) || (x < w - 1 && m[k + 1]) || (k >= w && m[k - w]) || (k < N - w && m[k + w]); };
// 'balloon': MePhone4's paint bomb is a blue balloon in an episode crop, over dark grey-green streaks, a black shadow
// and the green backdrop. Blue-dominant pixels -- its fill, its shine, its dark-blue outline -- are the balloon; of
// those only the largest connected piece is kept (the bomb, knot and all), anything its outline closes round stays,
// and the edge is as soft as the pixel is blue. The streaks, the shadow and the green are not blue, so none of it stays.
function keyBalloon(png) {
  const { width: w, height: h, data: d } = png, N = w * h;
  const blue = (i) => clamp01(Math.min((d[i + 2] - d[i] - 12) / 28, (d[i + 2] - d[i + 1] + 4) / 16));
  const m = new Uint8Array(N); for (let k = 0; k < N; k++) m[k] = blue(k * 4) > 0.5 ? 1 : 0;
  const comp = new Int32Array(N).fill(-1); let best = -1, bestN = 0, id = 0;
  for (let k0 = 0; k0 < N; k0++) { if (!m[k0] || comp[k0] >= 0) continue;
    let n = 0; const stack = [k0]; comp[k0] = id;
    while (stack.length) { const k = stack.pop(), x = k % w; n++;
      for (const q of [x > 0 ? k - 1 : -1, x < w - 1 ? k + 1 : -1, k - w, k + w]) if (q >= 0 && q < N && m[q] && comp[q] < 0) { comp[q] = id; stack.push(q); } }
    if (n > bestN) { bestN = n; best = id; } id++; }
  const keep = new Uint8Array(N); for (let k = 0; k < N; k++) keep[k] = comp[k] === best ? 1 : 0;
  const outside = floodBorder(keep.map((v) => 1 - v), w, h);
  for (let k = 0; k < N; k++) {
    const i = k * 4;
    if (keep[k]) { d[i + 3] = Math.round(255 * blue(i)); continue; }
    if (!outside[k]) { d[i + 3] = 255; continue; }                          // closed round by the balloon
    d[i + 3] = touches(keep, k, w, N) ? Math.round(255 * blue(i)) : 0;
  }
}
// 'piano': Paper's season-1 grand piano where it landed on him, against the pole, on the grass. The piano is wood and
// gold: warm (red over blue, and not green). Its white keys and the black of its insides are not warm, but the wood
// closes round them, so they stay as holes in it. Paper is white with black lines and one thin red margin, the pole is
// grey, the grass green: nothing warm but the margin, a stroke on its own that does not survive an opening (the
// piano's gold trim does, because it lies along the wood). What the wood does not close round goes.
function keyPiano(png) {
  const { width: w, height: h, data: d } = png, N = w * h;
  // warm: red over blue, not green, and not pink -- the margin's red leans blue (b over g), the wood's never does
  const warm = (i) => clamp01(Math.min((d[i] - d[i + 2] - 20) / 30, (d[i] - d[i + 1] + 10) / 40, (d[i + 1] - d[i + 2] + 4) / 8));
  const m = new Uint8Array(N); for (let k = 0; k < N; k++) m[k] = warm(k * 4) > 0.5 ? 1 : 0;
  const thick = morph(morph(m, w, h, 2, false), w, h, 3, true);           // an opening, then room for the trim beside it
  for (let k = 0; k < N; k++) if (!thick[k]) m[k] = 0;
  const closed = morph(morph(m, w, h, 2, true), w, h, 2, false);           // seal hairline gaps in the wood
  const outside = floodBorder(closed.map((v) => 1 - v), w, h);
  // A small white hole is Paper showing through a gap the wood closes round (under the keyboard, by the pedals): the
  // keyboard is the one big white hole, the insides are dark. So a mostly-white hole under 1500px goes too.
  const seen = new Uint8Array(N);
  for (let k0 = 0; k0 < N; k0++) { if (m[k0] || outside[k0] || seen[k0]) continue;
    const got = [k0], st = [k0]; seen[k0] = 1; let white = 0;
    while (st.length) { const k = st.pop(), x = k % w; if (minC(d, k * 4) > 200) white++;
      for (const q of [x > 0 ? k - 1 : -1, x < w - 1 ? k + 1 : -1, k - w, k + w]) if (q >= 0 && q < N && !m[q] && !outside[q] && !seen[q]) { seen[q] = 1; st.push(q); got.push(q); } }
    if (got.length < 1500 && white / got.length >= 0.5) for (const k of got) outside[k] = 1; }
  for (let k = 0; k < N; k++) {
    const i = k * 4;
    if (m[k] || !outside[k]) { d[i + 3] = 255; continue; }                 // the wood, and what it closes round
    const a = touches(m, k, w, N) ? warm(i) : 0;
    d[i + 3] = Math.round(255 * a);
    if (a > 0 && d[i + 1] > d[i]) d[i + 1] = d[i];                          // no green fringe off the grass
  }
  // specks: what is left of the margin where it crossed Paper's lines is loose dashes; the piano is one piece, so
  // anything under a tenth of the biggest piece goes
  const done = new Uint8Array(N), pieces = [];
  for (let k0 = 0; k0 < N; k0++) { if (done[k0] || d[k0 * 4 + 3] === 0) continue;
    const got = [k0], st = [k0]; done[k0] = 1;
    while (st.length) { const k = st.pop(), x = k % w;
      for (const q of [x > 0 ? k - 1 : -1, x < w - 1 ? k + 1 : -1, k - w, k + w]) if (q >= 0 && q < N && !done[q] && d[q * 4 + 3] > 0) { done[q] = 1; st.push(q); got.push(q); } }
    pieces.push(got); }
  const biggest = Math.max(0, ...pieces.map((p) => p.length));
  for (const p of pieces) if (p.length < biggest / 10) for (const k of p) d[k * 4 + 3] = 0;
}
function keyProp(png, pick) {
  const { width: w, height: h, data: d } = png, N = w * h, m = new Uint8Array(N);
  for (let k = 0; k < N; k++) { const i = k * 4; m[k] = d[i + 3] >= 128 && pick.keep(d[i], d[i + 1], d[i + 2]) ? 1 : 0; }
  const comp = new Int32Array(N).fill(-1); let best = -1, bestN = 0, id = 0;
  for (let k0 = 0; k0 < N; k0++) { if (!m[k0] || comp[k0] >= 0) continue;
    let n = 0; const stack = [k0]; comp[k0] = id;
    while (stack.length) { const k = stack.pop(), x = k % w; n++;
      for (const q of [x > 0 ? k - 1 : -1, x < w - 1 ? k + 1 : -1, k - w, k + w]) if (q >= 0 && q < N && m[q] && comp[q] < 0) { comp[q] = id; stack.push(q); } }
    if (n > bestN) { bestN = n; best = id; } id++; }
  for (let k = 0; k < N; k++) if (comp[k] !== best) d[k * 4 + 3] = 0;
}
function keyBall(png) {
  keyGreen(png);
  const box = alphaBox(png), cx = (box.x0 + box.x1) / 2, cy = (box.y0 + box.y1) / 2, rad = Math.min(box.x1 - box.x0, box.y1 - box.y0) / 2 - 0.5;
  for (let y = 0; y < png.height; y++) for (let x = 0; x < png.width; x++) {
    const i = (y * png.width + x) * 4, dd = Math.hypot(x - cx, y - cy);
    if (dd > rad + 0.5) png.data[i + 3] = 0; else if (dd > rad - 0.5) png.data[i + 3] = Math.round(png.data[i + 3] * (rad + 0.5 - dd));
    else png.data[i + 3] = 255;   // inside the disc the ball is whole: the green key must not eat its JPEG-soft seams
  }
}
const KEYS = { white: keyWhite, green: keyGreen, glow: keyGlow, orb: keyOrb, balloon: keyBalloon, piano: keyPiano, prop: keyProp, ball: keyBall, paintball: keyPaintball };
// ---- batch 3 (g5): the rock, the slick and the pager, cut out of their frames (Q1 "Cut from the frames"). One PIECE key does
// all three: a test says how much a pixel looks like the object, the biggest connected piece that passes is the object,
// what it closes round stays (the rock's spots, the pager's screen and buttons), and its edge is as soft as the test.
//   rock   the rock is flat grey with a darker grey outline; the grass, the sky, the impact flash and the rope are all
//          coloured or bright, so none of it is grey and dark at once
//   pager  the pager's body is a dark purple (blue and red over green); the backdrop is a grey-green that never is
//   slick  the oil is olive (red and green well over blue); the planks are brown (green barely over blue) and the
//          Cherries red. They sit ON the slick, so their bites out of it are filled with the slick's own mean colour,
//          out to its hull -- the show's pixels wherever the oil shows, the oil's colour where a cherry covered it.
function keyPiece(png, score, o = {}) {
  const { width: w, height: h, data: d } = png, N = w * h;
  const m = new Uint8Array(N); for (let k = 0; k < N; k++) m[k] = score(d, k * 4) > 0.5 ? 1 : 0;
  const comp = new Int32Array(N).fill(-1), sizes = [];
  for (let k0 = 0; k0 < N; k0++) { if (!m[k0] || comp[k0] >= 0) continue;
    const id = sizes.length, stack = [k0]; let n = 0; comp[k0] = id;
    while (stack.length) { const k = stack.pop(), x = k % w; n++;
      for (const q of [x > 0 ? k - 1 : -1, x < w - 1 ? k + 1 : -1, k - w, k + w]) if (q >= 0 && q < N && m[q] && comp[q] < 0) { comp[q] = id; stack.push(q); } }
    sizes.push(n); }
  const big = Math.max(0, ...sizes), keepId = sizes.map((n) => o.minPiece ? n >= big * o.minPiece : n === big);
  const keep = new Uint8Array(N); for (let k = 0; k < N; k++) keep[k] = comp[k] >= 0 && keepId[comp[k]] ? 1 : 0;
  if (o.hull) {
    const pts = []; let sr = 0, sg = 0, sb = 0;
    for (let k = 0; k < N; k++) if (keep[k]) { pts.push([k % w, (k / w) | 0]); sr += d[k * 4]; sg += d[k * 4 + 1]; sb += d[k * 4 + 2]; }
    const n = pts.length, fill = [sr / n, sg / n, sb / n];
    pts.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
    const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const lower = [], upper = [];
    for (const p of pts) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop(); lower.push(p); }
    for (let k = n - 1; k >= 0; k--) { const p = pts[k]; while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop(); upper.push(p); }
    const hull = lower.slice(0, -1).concat(upper.slice(0, -1));
    const inside = (x, y) => { for (let k = 0; k < hull.length; k++) if (cross(hull[k], hull[(k + 1) % hull.length], [x, y]) < 0) return false; return true; };
    for (let k = 0; k < N; k++) { if (keep[k]) continue; const x = k % w, y = (k / w) | 0;
      if (inside(x, y)) { d[k * 4] = fill[0]; d[k * 4 + 1] = fill[1]; d[k * 4 + 2] = fill[2]; d[k * 4 + 3] = 255; keep[k] = 2; } }
  }
  const outside = floodBorder(keep.map((v) => v ? 0 : 1), w, h);
  for (let k = 0; k < N; k++) {
    const i = k * 4;
    if (keep[k] === 2) continue;                                                // a bite, filled with the object's colour
    if (keep[k]) { d[i + 3] = Math.round(255 * Math.min(1, score(d, i) * 1.5)); continue; }
    if (!outside[k]) { d[i + 3] = 255; continue; }                             // closed round by the object
    d[i + 3] = touches(keep, k, w, N) ? Math.round(255 * score(d, i)) : 0;
  }
}
const ROCK_GREY = (d, i) => lum(d, i) > 165 ? 0 : clamp01((34 - (Math.max(d[i], d[i + 1], d[i + 2]) - minC(d, i))) / 12);
const PAGER_PURPLE = (d, i) => clamp01(Math.min((d[i + 2] - d[i + 1] - 8) / 20, (d[i] - d[i + 1] + 10) / 20));
const OIL_OLIVE = (d, i) => (d[i] - d[i + 1] > 50) ? 0 : clamp01((d[i + 1] - d[i + 2] - 10) / 12);
Object.assign(KEYS, { rock: (png) => keyPiece(png, ROCK_GREY), pager: (png) => keyPiece(png, PAGER_PURPLE), slick: (png) => keyPiece(png, OIL_OLIVE, { hull: true, minPiece: 0.03 }) });
// 'glass' (Steve Cobs's prize, OJ): the shard in File:BookSmashesThroughtheGlass.png is pale rainbow glass with a dark outline;
// the sky round it is a saturated blue (blue well over red, bright), which neither the glass nor its outline is. The biggest
// piece that is not sky is the shard. The glass is see-through, so the sky shows inside its outline too; that stays
// see-through (a faint pane: anything near sky blue inside the outline) and the stage shows through it instead.
const SKY_BLUE = (d, i) => clamp01(Math.min((d[i + 2] - d[i] - 45) / 20, (d[i + 2] - 180) / 20, (d[i + 1] - 140) / 20));
function keyGlass(png) {
  keyPiece(png, (d, i) => 1 - SKY_BLUE(d, i));
  const d = png.data; for (let i = 0; i < d.length; i += 4) if (d[i + 3] && SKY_BLUE(d, i) > 0.25) d[i + 3] = Math.min(d[i + 3], 90);
}
Object.assign(KEYS, { glass: keyGlass });
// ---- batch 3, group 6: two more keys for frame cuts, added beside KEYS so no shared line changes ----
// Keep the largest connected piece of what `test` calls the object, everything it closes round, and a soft one-pixel
// edge. `lift` brightens what is kept: the S4E5 frames are the haunted house at night, and a prop that dark would
// read as a smudge on a daylight stage.
function keyLargest(png, test, lift) {
  const { width: w, height: h, data: d } = png, N = w * h;
  const m = new Uint8Array(N); for (let k = 0; k < N; k++) m[k] = test(d, k * 4) ? 1 : 0;
  const comp = new Int32Array(N).fill(-1); let best = -1, bestN = 0, id = 0;
  for (let k0 = 0; k0 < N; k0++) { if (!m[k0] || comp[k0] >= 0) continue;
    let n = 0; const stack = [k0]; comp[k0] = id;
    while (stack.length) { const k = stack.pop(), x = k % w; n++;
      for (const q of [x > 0 ? k - 1 : -1, x < w - 1 ? k + 1 : -1, k - w, k + w]) if (q >= 0 && q < N && m[q] && comp[q] < 0) { comp[q] = id; stack.push(q); } }
    if (n > bestN) { bestN = n; best = id; } id++; }
  const keep = new Uint8Array(N); for (let k = 0; k < N; k++) keep[k] = comp[k] === best ? 1 : 0;
  const outside = floodBorder(keep.map((v) => 1 - v), w, h);
  for (let k = 0; k < N; k++) {
    const i = k * 4, inside = keep[k] || !outside[k];
    d[i + 3] = inside ? 255 : (touches(keep, k, w, N) ? 110 : 0);
    if (lift && d[i + 3]) for (let c = 0; c < 3; c++) d[i + c] = Math.min(255, Math.round(d[i + c] * lift));
  }
}
// 'vacuum': Poppy's canister vacuum on the floorboards. Its body is a dark red (red well over green and blue), its base,
// hose and wheel a slate blue (blue well over red); the floor is a purple-brown that is neither.
function keyVacuum(png) { keyLargest(png, (d, i) => (d[i] - d[i + 1] > 28 && d[i] - d[i + 2] > 14) || (d[i + 2] - d[i] > 22), 1.6); }
// 'pod': the capture pod in Paper's hand is a pale silver ball against a dark wall; his hand under it is black.
function keyPod(png) { keyLargest(png, (d, i) => lum(d, i) > 72); }
Object.assign(KEYS, { vacuum: keyVacuum, pod: keyPod });
// 'paintball': Teddy's paintballs exist only as the pink paint inside her gun's hopper in an episode frame. Pink pixels
// (red and blue over green) are the paint; a disc inscribed in their box is kept whole -- a paintball is round -- and
// everything outside it (the hopper's grey frame, the sky, her paw) goes.
function keyPaintball(png) {
  const { width: w, height: h, data: d } = png;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4;
    if (d[i] - d[i + 1] > 30 && d[i + 2] - d[i + 1] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.min(x1 - x0, y1 - y0) / 2;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, r = Math.hypot(x - cx, y - cy);
    d[i + 3] = r <= R - 1 ? 255 : r <= R ? 128 : 0; }
}

const outDir = process.argv[2];
if (!outDir) { console.error('usage: node fetch-attack-sprites.mjs <outDir> [name ...]'); process.exit(1); }
mkdirSync(outDir, { recursive: true });
const only = new Set(process.argv.slice(3));
const manifest = {}, credits = [];
for (const [name, pick] of Object.entries(PICKS)) {
  if (only.size && !only.has(name)) continue;
  const wiki = pick.wiki || 'bfdi';
  const line = (msg) => console.log(`${name.padEnd(11)} ${pick.who.padEnd(18)} ${msg}`);
  const candidates = Array.isArray(pick.file) ? pick.file : [pick.file];
  for (const sk of pick.skipped || []) line(`skip ${sk}: looked at in the game and turned down (see its pick)`);
  let done = false;
  for (const cand of candidates) { if (done) break; try {
    const info = await fileUrl(wiki, cand);
    if (!info) { line(`skip: no such file "${cand}" on ${wiki}`); continue; }
    if (info.mime !== 'image/png' && !pick.png) { line(`REJECT: ${info.mime}, not a PNG`); continue; }
    const buf = await download(info.url, pick.srcH || 400, pick.png);
    let png = PNG.sync.read(buf);
    if (pick.region) {
      const s = png.width / info.w, [x0, y0, x1, y1] = pick.region;
      png = cut(png, [Math.round(x0 * s), Math.round(y0 * s), Math.round(x1 * s), Math.round(y1 * s)]);
    }
    if (pick.poly) maskPoly(png, pick.poly, pick.region || [0, 0, info.w, info.h], png.width / ((pick.region ? pick.region[2] - pick.region[0] : info.w)));   // hand mask: outside the polygon is air
    if (pick.key) KEYS[pick.key](png, pick);
    const box = alphaBox(png);
    if (box.x1 < 0) { line(`skip ${cand}: fully transparent`); continue; }
    if (box.clearFrac < (pick.minClear || 0.12) && !pick.solid) { line(`skip ${cand}: not transparent (${(100 * box.clearFrac).toFixed(0)}% clear)`); continue; }
    if (pick.crop) box.y1 = Math.min(box.y1, box.y0 + pick.crop - 1);   // a stream asset: keep its head
    const cw = box.x1 - box.x0 + 1, ch = box.y1 - box.y0 + 1;
    if (Math.max(cw, ch) < 24) { line(`skip ${cand}: ${cw}x${ch} after cropping`); continue; }
    const small = shrink(png, box, pick.h || TARGET_H);
    const file = `${name}.png`;
    writeFileSync(`${outDir}/${file}`, PNG.sync.write(small));
    manifest[name] = { who: pick.who, kits: pick.kits, file, wiki, source: info.url, srcTitle: cand, width: small.width, height: small.height,
      clearFrac: +box.clearFrac.toFixed(3), note: pick.note, ...(pick.key ? { key: pick.key } : {}), ...(pick.region ? { region: pick.region } : {}), ...(pick.solid ? { solid: true } : {}),
      ...(pick.skipped ? { skipped: pick.skipped } : {}) };
    credits.push(`- ${pick.who} (${file}): ${pick.note} — File:${cand} — ${info.url}`);
    line(`ok ${cand}: ${info.w}x${info.h} -> ${small.width}x${small.height} (${(100 * box.clearFrac).toFixed(0)}% clear${pick.key ? `, ${pick.key}-keyed` : ''})`); done = true;
  } catch (e) { line(`${cand} FAILED: ${e.message}`); } }
  if (!done) line('REJECT: no candidate passed');
}
writeFileSync(`${outDir}/manifest.json`, JSON.stringify(manifest, null, 2));
writeFileSync(`${outDir}/credits.txt`, credits.join('\n') + '\n');
console.log(`\n${Object.keys(manifest).length} sprites written to ${outDir}`);

// ---- looked at and turned down (so nobody re-fetches them) -----------------------------------------
// Paper's piano ("the grand piano from the unremastered s1"): the only season-1 piano on the II wiki is
//   File:Ep2 Piano.png, an episode frame (0% clear) with the piano landing on Paper against the pole.
//   S1RE2/S1RE10 Piano.png are remastered frames, which the owner did not ask for. No isolated file of it
//   exists, so the piano is lifted out of Ep2 Piano.png by the 'piano' key above.
// Bracelety Sign Blank.png: a flat white board, 0% clear -- nothing a drawn rectangle is not. The ICY sign ships.
// Coins.png (Nickel): a stack of copper pennies; at the 18px a coin is drawn it is a brown cylinder.
// Lightning's TPOT 7 art: the episode's gallery and asset pages hold no isolated bolt; every file of the
//   strike is a frame (Tpot7dpacas lightningrampage 1-36). BFB Lightning Bolt.png and the other "bolt"
//   files are characters with faces, or fan art. Hence the keyed-out strike above.
// Where Babies Come From II Remastered.png (Baseball's other book): two episode screenshots side by side,
//   with Baseball's face behind the book. The Twilight book sheet is the clean one.
// Bot (a playable fighter now, they/them, the season-4 look) is a character render, so it is fetched the way every II render is:
//   node scripts/fetch-sprites.mjs --wiki=inanimateinsanity "Bot=Bot Bandaged S4.png"
