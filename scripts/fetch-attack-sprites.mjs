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
const KEYS = { white: keyWhite, green: keyGreen, glow: keyGlow, orb: keyOrb, balloon: keyBalloon, piano: keyPiano, prop: keyProp, ball: keyBall };

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
// Bot, Test Tube's summon, is a character render, so it is fetched the way every II render is:
//   node scripts/fetch-sprites.mjs --wiki=inanimateinsanity "Bot=Bot2024PoseAlt.png"
