# Sprite assets — sourcing, licensing, and provenance

Battle for Smash Island is an **unaffiliated fan work**. Battle for Dream Island, its characters,
and its designs are the intellectual property of **jacknjellify** (Michael & Cary Huang).
This project is not affiliated with, endorsed by, or sponsored by jacknjellify.

## Inventory

Twelve character renders, one per batch-1 fighter. All were taken from the character infobox
originals on `battlefordreamisland.fandom.com` via the MediaWiki API, downscaled to 200px tall,
RGBA with verified alpha.

**Provenance for every file below:** jacknjellify's character artwork, via
battlefordreamisland.fandom.com; no formal license — used under fan-work norms in a disclaimed,
non-commercial fan game.

| Fighter | File | Source |
|---|---|---|
| Firey | `firey.png` | https://static.wikia.nocookie.net/battlefordreamisland/images/e/e2/Fireytpot21.png |
| Leafy | `leafy.png` | https://static.wikia.nocookie.net/battlefordreamisland/images/c/ca/TPOTLeafyColorCorrected.png |
| Bubble | `bubble.png` | https://static.wikia.nocookie.net/battlefordreamisland/images/a/a0/Bubble_18_Stance_5.png |
| Blocky | `blocky.png` | https://static.wikia.nocookie.net/battlefordreamisland/images/b/b3/Blockling.png |
| Pen | `pen.png` | https://static.wikia.nocookie.net/battlefordreamisland/images/a/ae/Tpot_renders0040.png |
| Pencil | `pencil-angry.png` | https://static.wikia.nocookie.net/battlefordreamisland/images/d/df/Angry_Pencil_TPOT_11.png |
| Match | `match.png` | https://static.wikia.nocookie.net/battlefordreamisland/images/e/e7/Tpot_renders0050.png |
| Ice Cube | `ice-cube.png` | https://static.wikia.nocookie.net/battlefordreamisland/images/1/1a/Tpot_renders0025.png |
| Puffball | `puffball.png` | https://static.wikia.nocookie.net/battlefordreamisland/images/a/ad/Tpot_renders0042.png |
| Teardrop | `teardrop.png` | https://static.wikia.nocookie.net/battlefordreamisland/images/0/08/Tpot_renders0043.png |
| Bomby | `bomby.png` | https://static.wikia.nocookie.net/battlefordreamisland/images/2/2e/Tpot_renders0015.png |
| Rocky | `rocky.png` | https://static.wikia.nocookie.net/battlefordreamisland/images/e/ee/Tpot_renders0027.png |

### Processing

- Downscaled to 200px tall, preserving aspect ratio.
- Transparency verified per image: all four corners fully transparent (alpha 0).
- `firey.png` had 985 near-zero-alpha artifact pixels, zeroed during processing.
- No background removal was otherwise required — the wiki infobox originals ship with alpha.
- Total on disk: ~249 KB.

### Notes on individual renders

- **`blocky.png`** — the wiki file is titled *Blockling*, which reads like a different character.
  The image was checked directly: it is Blocky (red beveled cube, slanted mischievous eyes,
  open smirk, round-tipped limbs). Correct, despite the filename.
- **`match.png`** — a turned/near-profile pose; her face is barely readable at gameplay scale.
  Functional, but a front-facing render would be a better swap if one is available.
- **`leafy.png`** — TPOT-era scowling expression rather than her usual neutral smile. On-model,
  just angrier than the rest of the cast. Deliberately kept — see the rejected candidates below.
- **`pencil-angry.png`** — replaced the original `pencil.png` (`PencilTPOT13+`, a wide friendly
  grin) after the owner read that render as too friendly for a fighting game. The TPOT-11 render
  is the same character in the same official style, scowling: angled brows, gritted teeth, one
  arm thrown out. 94x200 rather than 70x200, so it is still height-bound by `imgH:3.1` and no
  registry geometry changed. Re-measured on the facing audit as FRONT (see below); no `flip`.
- **`rocky.png`** — noticeably wider than tall. The registry contain-fits by `imgW` for him so he
  is not blown up to match the taller fighters.

### Replacement candidates that were evaluated and REJECTED

Fetched, pixel-inspected, and then deleted rather than shipped. Recorded because "we already
looked at that one" is worth more than the two minutes it costs to write down.

| Candidate | Intended for | Source | Why it was rejected |
|---|---|---|---|
| `LeafyNewPose.png` | Leafy | https://static.wikia.nocookie.net/battlefordreamisland/images/3/3b/LeafyNewPose.png | A *regression* on the brief. It is a relaxed running pose — dot eyes, one raised brow, a mild smirk. The `leafy.png` already in the repo is a full scowl: angled brows and a wide open snarl (1351 interior ink px vs the candidate's 102). The owner asked for less friendly; this is more. Current render kept. |
| `Puffball_Body_(TPOT_Intro).png` | Puffball | https://static.wikia.nocookie.net/battlefordreamisland/images/3/3f/Puffball_Body_%28TPOT_Intro%29.png | It is the *body layer* from the intro, not a character render: **zero** dark interior pixels, i.e. no eyes, no brows, no mouth at all. A render suppresses the shared BFDI face, so she would have shipped as a faceless pink blob. It also carries a white background matte on **99.6%** of its rim, which the transparency rule below forbids outright. Current render kept. |

On the Puffball note in the facing audit: the render in the repo was re-measured on the live
canvas and reads **front-facing** — both eyes, both brows and a centred open smile, offset −0.009
of body width. She is symmetric, not turned; there is nothing for a `flip` to fix and no swap was
warranted.

## How the renders are used

Each entry in `SPRITES` (in `artifacts/V1/index.html`) carries `src` plus an `imgH`/`imgW` box.
The render is **contain-fitted** using its own aspect ratio, so nothing is ever stretched, and its
feet are placed on the same floor line the generic fighters stand on.

Because these are whole-character renders (limbs and face included), the shared stub limbs and the
shared BFDI face are **suppressed** while a render is live — otherwise every fighter would grow a
second set of arms and a second pair of eyes.

**The hand-authored vector art is still present for all twelve and is the automatic fallback.** If
a PNG is missing, 404s, or fails to decode, the fighter renders as vector art instead — no blank
fighter, no crash. Sprites are render-only; nothing here is serialized, so a missing asset can
never desync a match.

Note the limit of that fallback: it triggers on **load failure**, not on visual quality. A render
that loads successfully but carries a background matte would display the matte. Alpha therefore has
to be verified per image at download time, as it was above.

## Why the official asset packs were not used

The official-assets path was investigated first and rejected on two independent grounds. This
section is kept because it documents what *isn't* available, not just what is.

**Sources checked**

| Source | Genuinely official? | Verdict |
|---|---|---|
| `http://bfdi.tv/assets` | **Yes** — jacknjellify's own domain; the location is confirmed by jacknjellify's official X/Twitter post <https://x.com/jacknjellify/status/1298438798364119040> ("Download the .FLA files"). | Rejected — see below. |
| `https://archive.org/details/bfdi-assets-svg-pack` | **No** — uploaded by third-party user `PatoFlamejanteTV` (2023-11-27). The stated "Attribution-ShareAlike 4.0 International" is a licence the *uploader* applied, not a grant from the rights holder. | Rejected: unknown-provenance re-upload. |
| `https://archive.org/details/BFDI_Assets`, `.../bfdipack`, `.../assetsfla` | Uncertain — account names resemble the creators' but Internet Archive account names are not identity-verified. | Rejected: cannot confidently verify as jacknjellify-published. |

**Why `bfdi.tv/assets` was still not used**

1. **No terms are stated.** The page publishes files (`assets.zip`, `grass.fla`, `chase.zip`,
   `oldies.fla`, `candybar.zip`, `CandyBarAdventure.swf`, plus a Drive link to episode FLAs) with
   **no licence, no usage grant, and no redistribution permission of any kind**. Publishing source
   files is not the same as licensing them for redistribution inside another product.
2. **Wrong format.** The files are Adobe Animate/Flash sources (`.fla` / `.swf`), not sprite
   sheets. Turning them into per-character transparent PNGs requires Adobe Animate and a manual
   export pass.

**No formal license exists for any of the artwork in this directory, official or otherwise.** The
renders above are used under fan-work norms, non-commercially, in a disclaimed fan game. Nothing
here should be read as a claim of permission from the rights holder.

## Rules for anything added here later

- **Transparent background is required.** No matte, no checkerboard, no solid fill. If the source
  has one it must be cut out before commit, and the processing recorded above.
- **Record the source URL and the provenance line** in the inventory table.
- The loader (`spriteImage()`) constructs the `Image` on the **first draw**, never at script-eval
  time — the headless jsdom tests forbid top-level media constructors. Keep it that way.
- `test/credential-strip.test.js` pins what may appear in this directory: sprite images and this
  file, nothing else. Everything here is publicly served.

## Attribution

Characters, names, and designs © jacknjellify. Fan work, non-commercial, not affiliated with or
endorsed by the rights holder.


## Additional renders

<!-- RENDER-INVENTORY-START -->

**53 additional character renders**, fetched from the character infobox on
`battlefordreamisland.fandom.com` via the MediaWiki API, scaled server-side to 200px tall, PNG
with verified alpha and the invisible halo erased. Same provenance as the twelve above:
jacknjellify's character artwork, no formal license, used under fan-work norms in a disclaimed,
non-commercial fan game.

| Fighter | File | Size | Facing | Source |
|---|---|---|---|---|
| Balloony | `balloony.png` | 90×200 | -0.08 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/1/12/Balloony_updated.png/revision/latest?cb=20260604131116 |
| Barf Bag | `barf-bag.png` | 208×200 | 0.032 | https://static.wikia.nocookie.net/battlefordreamisland/images/a/a6/Tpot_renders0012.png/revision/latest?cb=20250715154408 |
| Basketball | `basketball.png` | 181×200 | 0.058 | https://static.wikia.nocookie.net/battlefordreamisland/images/f/ff/Tpot_renders0029.png/revision/latest?cb=20251117003502 |
| Bell | `bell.png` | 186×200 | -0.007 | https://static.wikia.nocookie.net/battlefordreamisland/images/6/69/Tpot_renders0035.png/revision/latest?cb=20210113224327 |
| Book | `book.png` | 206×200 | 0.094 | https://static.wikia.nocookie.net/battlefordreamisland/images/a/aa/Tpot_renders0020.png/revision/latest?cb=20210113223840 |
| Bracelety | `bracelety.png` | 358×200 | -0.005 | https://static.wikia.nocookie.net/battlefordreamisland/images/5/56/Tpot_renders0045.png/revision/latest?cb=20240622132009 |
| Cake | `cake.png` | 147×200 | 0.101 | https://static.wikia.nocookie.net/battlefordreamisland/images/1/14/Tpot_renders0018.png/revision/latest?cb=20250202025229 |
| Coiny | `coiny.png` | 209×200 | 0.019 | https://static.wikia.nocookie.net/battlefordreamisland/images/6/61/Tpot_renders0009.png/revision/latest?cb=20260225071053 |
| David | `david.png` | 103×200 | -0.052 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/8/86/HD_David.png/revision/latest?cb=20241210131638 |
| Donut | `donut.png` | 212×200 | -0.057 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/a/a0/Tpot_renders0011.png/revision/latest?cb=20251212031403 |
| Dora | `dora.png` | 150×200 | 0.068 | https://static.wikia.nocookie.net/battlefordreamisland/images/d/df/Dora2.png/revision/latest?cb=20231226113012 |
| Evil Leafy | `evil-leafy.png` | 110×200 | -0.001 | https://static.wikia.nocookie.net/battlefordreamisland/images/4/4c/Evil_Leafy_Bfdia_6.png/revision/latest?cb=20240514042356 |
| Fanny | `fanny.png` | 158×200 | -0.129 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/e/e7/Tpot_renders0004.png/revision/latest?cb=20210113223402 |
| Fern | `fern.png` | 151×200 | 0 | https://static.wikia.nocookie.net/battlefordreamisland/images/e/ea/FernIntroRecreation.png/revision/latest?cb=20260102040323 |
| Firey Jr. | `firey-jr.png` | 241×200 | 0.008 | https://static.wikia.nocookie.net/battlefordreamisland/images/a/ac/Tpot_renders0048.png/revision/latest?cb=20260410150529 |
| Firey Speaker Box | `firey-speaker-box.png` | 141×200 | 0.025 | https://static.wikia.nocookie.net/battlefordreamisland/images/1/1c/BFDIA-7FlyingFireySpeaker.png/revision/latest?cb=20240124231428 |
| Flower | `flower.png` | 161×200 | 0.013 | https://static.wikia.nocookie.net/battlefordreamisland/images/1/13/BFDI-TPOT_7_Flower.png/revision/latest?cb=20260131062732 |
| Four | `four.png` | 190×200 | -0.055 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/9/90/TPOT_Four_Pose.png/revision/latest?cb=20260226000911 |
| Fries | `fries.png` | 142×200 | 0.146 | https://static.wikia.nocookie.net/battlefordreamisland/images/e/e9/Tpot_renders0041.png/revision/latest?cb=20240619061744 |
| Gaty | `gaty.png` | 278×200 | -0.022 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/2/21/Tpot_renders0013.png/revision/latest?cb=20210113223705 |
| Gelatin | `gelatin.png` | 193×200 | 0.004 | https://static.wikia.nocookie.net/battlefordreamisland/images/4/43/Gelatin_sad.png/revision/latest?cb=20260725082718 |
| Golf Ball | `golf-ball.png` | 173×200 | 0.043 | https://static.wikia.nocookie.net/battlefordreamisland/images/a/a9/Tpot_renders0038.png/revision/latest?cb=20251212031805 |
| Grassy | `grassy.png` | 139×200 | 0.126 | https://static.wikia.nocookie.net/battlefordreamisland/images/8/83/Tpot_renders0031.png/revision/latest?cb=20251020024751 |
| Lightning | `lightning.png` | 185×200 | -0.031 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/4/48/Tpot_renders0007.png/revision/latest?cb=20210113223529 |
| Liy | `liy.png` | 177×200 | 0.041 | https://static.wikia.nocookie.net/battlefordreamisland/images/7/74/Tpot_renders0054.png/revision/latest?cb=20251025194741 |
| Lollipop | `lollipop.png` | 96×200 | -0.061 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/f/fc/LollipopTPOT18.png/revision/latest?cb=20260223232846 |
| Loser | `loser.png` | 167×200 | -0.034 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/7/7a/Moments_before_disaster_2.png/revision/latest?cb=20260201133147 |
| Marker | `marker.png` | 83×200 | -0.059 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/3/38/Placeholdermarker.png/revision/latest?cb=20260401163852 |
| Money | `money.png` | 188×200 | -0.055 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/3/3c/MoneyIntroRecreation.png/revision/latest?cb=20260103223422 |
| Naily | `naily.png` | 340×200 | 0.024 | https://static.wikia.nocookie.net/battlefordreamisland/images/6/68/Tpot_renders0017.png/revision/latest?cb=20210113223805 |
| Needle | `needle.png` | 42×200 | -0.005 | https://static.wikia.nocookie.net/battlefordreamisland/images/4/41/Tpot_renders0008.png/revision/latest?cb=20251117000950 |
| Nickel | `nickel.png` | 186×200 | -0.011 | https://static.wikia.nocookie.net/battlefordreamisland/images/5/58/Tpot_renders0021.png/revision/latest?cb=20210113223911 |
| Pillow | `pillow.png` | 151×200 | -0.062 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/b/b9/Tpot_renders0019.png/revision/latest?cb=20231104233931 |
| Pin | `pin.png` | 120×200 | 0.059 | https://static.wikia.nocookie.net/battlefordreamisland/images/2/2d/Tpot_renders0010.png/revision/latest?cb=20250802161226 |
| Profily | `profily.png` | 206×200 | -0.01 | https://static.wikia.nocookie.net/battlefordreamisland/images/c/c7/Profiley_sitting.png/revision/latest?cb=20250622231638 |
| Puffball Speaker Box | `puffball-speaker-box.png` | 165×200 | -0.025 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/d/d8/Newpsb.png/revision/latest?cb=20260519112421 |
| Purple Face | `purple-face.png` | 195×200 | -0.049 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/9/91/PurpleFaceNewPose.png/revision/latest?cb=20230408121013 |
| Remote | `remote.png` | 202×200 | 0.029 | https://static.wikia.nocookie.net/battlefordreamisland/images/9/9c/Tpot_renders0006.png/revision/latest?cb=20210113223517 |
| Roboty | `roboty.png` | 84×200 | 0 | https://static.wikia.nocookie.net/battlefordreamisland/images/f/f1/Roboty_book.png/revision/latest?cb=20190908174044 |
| Rose | `rose.png` | 144×200 | 0.004 | https://static.wikia.nocookie.net/battlefordreamisland/images/2/2d/RoseBFDIE.png/revision/latest?cb=20260102044136 |
| Ruby | `ruby.png` | 237×200 | 0.001 | https://static.wikia.nocookie.net/battlefordreamisland/images/8/8a/Ruby_jumping.png/revision/latest?cb=20260617122628 |
| Ruler | `ruler.png` | 104×200 | 0 | https://static.wikia.nocookie.net/battlefordreamisland/images/a/a2/RulerBFDIE.png/revision/latest?cb=20260101212420 |
| Saw | `saw.png` | 103×200 | -0.035 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/7/74/Tpot_renders0014.png/revision/latest?cb=20210113223714 |
| Sidewalky | `sidewalky.png` | 202×200 | 0.164 | https://static.wikia.nocookie.net/battlefordreamisland/images/4/4f/Sidewalky.png/revision/latest?cb=20260102200752 |
| Snowball | `snowball.png` | 201×200 | 0.064 | https://static.wikia.nocookie.net/battlefordreamisland/images/6/6b/Tpot_renders0032.png/revision/latest?cb=20250111195131 |
| Taco | `taco.png` | 220×200 | 0.037 | https://static.wikia.nocookie.net/battlefordreamisland/images/1/19/Taco-but-EHHHHHHHH.png/revision/latest?cb=20260228201027 |
| Tennis Ball | `tennis-ball.png` | 183×200 | 0.074 | https://static.wikia.nocookie.net/battlefordreamisland/images/e/e2/Tpot_renders0039.png/revision/latest?cb=20250620002606 |
| Toothpaste | `toothpaste.png` | 110×200 | 0.034 | https://static.wikia.nocookie.net/battlefordreamisland/images/2/26/Toothpaste_BFDIE.png/revision/latest?cb=20260101214409 |
| Tree | `tree.png` | 170×200 | -0.053 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/8/81/Tree_the_Purple.png/revision/latest?cb=20250714210826 |
| TV | `tv.png` | 219×200 | 0.002 | https://static.wikia.nocookie.net/battlefordreamisland/images/c/cc/Tpot_renders0036.png/revision/latest?cb=20210113224339 |
| Two | `two.png` | 255×200 | -0.006 | https://static.wikia.nocookie.net/battlefordreamisland/images/2/2e/TwoTPOT20PromoArt.png/revision/latest?cb=20260131061643 |
| Woody | `woody.png` | 167×200 | 0.02 | https://static.wikia.nocookie.net/battlefordreamisland/images/6/64/Woody_in_TPOT_%28fair_enough%29.png/revision/latest?cb=20260701141213 |
| Yellow Face | `yellow-face.png` | 194×200 | -0.059 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/a/a7/Yellowface.png/revision/latest?cb=20190908174021 |
<!-- RENDER-INVENTORY-END -->

## One (the secret boss)

One is not a roster fighter, so her render sits outside the generated inventory above (a re-run of
`scripts/wire-sprites.mjs` would otherwise wire her into the fighter registry). Same provenance:
jacknjellify's character artwork, via battlefordreamisland.fandom.com; no formal license, used under
fan-work norms in a disclaimed, non-commercial fan game.

| Boss | File | Size | Facing | Source |
|---|---|---|---|---|
| One | `one.png` | 148×200 | 0.041 | https://static.wikia.nocookie.net/battlefordreamisland/images/b/b8/One_TPOT_19.png/revision/latest?cb=20250817043721 |

- `File:One_TPOT_19.png`, front-facing, full body with both legs and her eyes. Chosen over the One page's
  infobox image (`File:OneTPOT20PromoArt.png`) because that file's upload history carries two troll
  uploads, and the bytes served for it did not match the sha1 the wiki reports; this one's did
  (a0e2e97aba3bed4f711b6ed461815198a7cc92d5), and its three revisions are all by one uploader.
- Scaled server-side to 200px tall (`scale-to-height-down/200`, `format=original`), all four corners
  alpha 0, 686 near-zero-alpha halo pixels erased, facing measured the fetch-sprites.mjs way.

## Attack art

What a fighter THROWS, in the show's own art, fetched by scripts/fetch-attack-sprites.mjs from the
same wiki (and, for the Inanimate Insanity DLC, from inanimateinsanity.fandom.com, AnimationEpic's
designs), cropped to the alpha box and downscaled to 56px tall (never more than 128px on the long side),
RGBA with verified alpha. Only art that is the thrown thing itself is used: renders of the character and
episode screenshots were rejected on sight. scripts/attack-sprite-manifest.json records each file's
size, source and the kit it is for.

Five are CUT OUT of a larger picture, because the object exists nowhere on the wiki on its own; the
cut is in the fetch script, so it reproduces exactly:
- book.png: the remastered cover alone, lifted off the white prop sheet it shares with the season-1 cover.
- shimmerorb.png: only the orb's near-white; Box, his face and his hands are gone, and the two bites
  his hands left in its lower edge are closed with the orb's own flat white.
- paintbomb.png: the page's only picture of a paint bomb is a small crop from the episode, the blue
  balloon over dark streaks, a black shadow and a green backdrop. Only the balloon is kept (its blue
  fill, its shine and its dark-blue outline, as one piece); the streaks, the shadow and the green go.
- piano.png: the owner: "There is a grand piano from the unremastered s1." Its only season-1 file is a
  frame of Episode 2, the piano where it landed on Paper against the pole. The piano is lifted out: its
  wood and gold, and the keys and insides the wood closes round. Paper, the pole and the grass go.
- tpot7bolt.png: the owner asked for "the art from tpot 7". The strike that hits the Volcano in
  "The Seven Wonders of Goiky" is lifted off its plain sky (brightness above the sky becomes alpha,
  anything warm is dropped, and so are the sky's pale shards, a white wash where the glow is cyan), so the bolt
  ships alone, with its cyan glow, and none of the frame.

One fills its own canvas edge to edge, so it is not 12% clear and was passed by eye: Remote's battery
(his own cell, from the BFB accessories). Bracelety's blank board was the same, and no richer than a
drawn rectangle, so her ICY sign (BFB 1) ships instead: tilted, lettered, 9% clear round its edges.
Nickel's first pick, a stack of copper pennies, read as a brown cylinder at the size a coin is drawn,
so the TPOT yellow token ships instead.

- Ice Cube (shatter.png): her shatter — File:Ice Cube's Shatter.png — https://static.wikia.nocookie.net/battlefordreamisland/images/5/54/Ice_Cube%27s_Shatter.png/revision/latest?cb=20170818055658
- Cake (slice.png): a slice of cake — File:Cake slice.png — https://static.wikia.nocookie.net/battlefordreamisland/images/e/e8/Cake_slice.png/revision/latest?cb=20200331160339
- Pencil (van.png): the Supervan — File:SuperVAN!2340001.png — https://static.wikia.nocookie.net/battlefordreamisland/images/e/e0/SuperVAN%212340001.png/revision/latest?cb=20240726151857
- Bubble (bubble.png): a bubble — File:Bubble's asset.png — https://static.wikia.nocookie.net/battlefordreamisland/images/d/db/Bubble%27s_asset.png/revision/latest?cb=20180311133454
- Pen (cap.png): his cap — File:Pen Cap.png — https://static.wikia.nocookie.net/battlefordreamisland/images/f/fe/Pen_Cap.png/revision/latest?cb=20171204165618
- Price Tag (tag.png): a price tag — File:Price Tag S2 Asset.png — https://static.wikia.nocookie.net/battlefordreamisland/images/8/8f/Price_Tag_S2_Asset.png/revision/latest?cb=20250629215323
- Ruler (measure.png): the ruler itself — File:Ruler's Asset.png — https://static.wikia.nocookie.net/battlefordreamisland/images/c/cf/Ruler%27s_Asset.png/revision/latest?cb=20200704043629
- Firey / Firey Jr. (fireball.png): a fireball (the BFDI 17 Fireball body, faceless) — File:17body fireball.png — https://static.wikia.nocookie.net/battlefordreamisland/images/9/9c/17body_fireball.png/revision/latest?cb=20190725180222
- Bomby (landmine.png): a landmine — File:11body landmine.png — https://static.wikia.nocookie.net/battlefordreamisland/images/5/54/11body_landmine.png/revision/latest?cb=20250226003955
- Flower / Fanny (poof.png): a puff cloud — File:Poof.png — https://static.wikia.nocookie.net/battlefordreamisland/images/c/ce/Poof.png/revision/latest?cb=20171206033639
- Tennis Ball (tennisball.png): a served tennis ball (faceless, pink) — File:16body pinktennisball.png — https://static.wikia.nocookie.net/battlefordreamisland/images/8/8e/16body_pinktennisball.png/revision/latest?cb=20190722175753
- Blocky (anvil.png): an anvil — File:2b anvil.png — https://static.wikia.nocookie.net/battlefordreamisland/images/7/7c/2b_anvil.png/revision/latest?cb=20190808181533
- Golf Ball (zapbolt.png): a zap bolt — File:Lightning 2.png — https://static.wikia.nocookie.net/battlefordreamisland/images/d/dd/Lightning_2.png/revision/latest?cb=20180408173117
- Rocky (barf.png): his barf stream (TPOT intro) — File:Rocky barf (TPOT Intro).png — https://static.wikia.nocookie.net/battlefordreamisland/images/b/bd/Rocky_barf_%28TPOT_Intro%29.png/revision/latest?cb=20230619005953
- Fries (fry.png): one fry — File:Single Fry.png — https://static.wikia.nocookie.net/battlefordreamisland/images/c/cc/Single_Fry.png/revision/latest?cb=20190807024659
- Gelatin (syringe.png): a Freeze Juice syringe — File:Freeze Juice.png — https://static.wikia.nocookie.net/battlefordreamisland/images/4/4c/Freeze_Juice.png/revision/latest?cb=20191120233106
- Nickel (coins.png): a coin (the TPOT yellow token) — File:YellowToken.png — https://static.wikia.nocookie.net/battlefordreamisland/images/8/8d/YellowToken.png/revision/latest?cb=20220621111213
- Ruby (gem.png): a red gem — File:RedGemBFDIE.png — https://static.wikia.nocookie.net/battlefordreamisland/images/d/d5/RedGemBFDIE.png/revision/latest?cb=20260130170625
- Yellow Face (star.png): a star (a BFB 21 gift item) — File:Star (BFB 21).png — https://static.wikia.nocookie.net/battlefordreamisland/images/2/2c/Star_%28BFB_21%29.png/revision/latest?cb=20210211181436
- Barf Bag (vomit.png): a splat of vomit — File:Leafy-ShapedVomit.png — https://static.wikia.nocookie.net/battlefordreamisland/images/c/cf/Leafy-ShapedVomit.png/revision/latest?cb=20170905020203
- Basketball (basketball.png): a basketball prop — File:Basketball prop (bfb 28)0001.png — https://static.wikia.nocookie.net/battlefordreamisland/images/a/a8/Basketball_prop_%28bfb_28%290001.png/revision/latest?cb=20210116222221
- Bracelety (sign.png): her ICY sign (BFB 1) — File:ICY Sign (Bracelety) (BFB 1).png — https://static.wikia.nocookie.net/battlefordreamisland/images/e/ef/ICY_Sign_%28Bracelety%29_%28BFB_1%29.png/revision/latest?cb=20210619191443
- Grassy (bush.png): a bush — File:Bush.png — https://static.wikia.nocookie.net/battlefordreamisland/images/a/a1/Bush.png/revision/latest?cb=20161105234307
- Lollipop (candy.png): a piece of her candy — File:Lollipop Piece 5.png — https://static.wikia.nocookie.net/battlefordreamisland/images/1/13/Lollipop_Piece_5.png/revision/latest?cb=20210715132545
- Marker (inkball.png): a ball of ink — File:16bb inkball.png — https://static.wikia.nocookie.net/battlefordreamisland/images/8/88/16bb_inkball.png/revision/latest?cb=20200409194604
- Money (coin.png): one gold coin — File:28b linecoin.png — https://static.wikia.nocookie.net/battlefordreamisland/images/4/41/28b_linecoin.png/revision/latest?cb=20210118010346
- Naily (nail.png): a nail (BFDI 11) — File:BFDI 11 Nail.png — https://static.wikia.nocookie.net/battlefordreamisland/images/3/36/BFDI_11_Nail.png/revision/latest?cb=20200311100209
- Remote (battery.png): Remote's battery — File:Batteryremote.png — https://static.wikia.nocookie.net/battlefordreamisland/images/3/3b/Batteryremote.png/revision/latest?cb=20250728054259
- Saw (sawblade.png): a saw blade — File:Sawblade.png — https://static.wikia.nocookie.net/battlefordreamisland/images/f/ff/Sawblade.png/revision/latest?cb=20260203050959
- Taco (jawbreaker.png): the jawbreaker — File:Jawbreaker better quality.png — https://static.wikia.nocookie.net/battlefordreamisland/images/3/31/Jawbreaker_better_quality.png/revision/latest?cb=20171217213634
- Woody (woodchip.png): a chip of Woody — File:8B3728F4-AFD6-4BD3-A90D-AD47726D9235.png — https://static.wikia.nocookie.net/battlefordreamisland/images/f/fe/8B3728F4-AFD6-4BD3-A90D-AD47726D9235.png/revision/latest?cb=20191012181511
- Toothpaste (toothpaste.png): a splat of toothpaste — File:Toothpaste Splat.png — https://static.wikia.nocookie.net/battlefordreamisland/images/5/56/Toothpaste_Splat.png/revision/latest?cb=20260205023536
- Match (flame.png): a flame — File:2b fire0001.png — https://static.wikia.nocookie.net/battlefordreamisland/images/8/86/2b_fire0001.png/revision/latest?cb=20190808182350
- Tree (branch.png): a leafy branch — File:21body twigy.png — https://static.wikia.nocookie.net/battlefordreamisland/images/2/24/21body_twigy.png/revision/latest?cb=20190729232049
- Donut (sprinkles.png): sprinkles — File:Bfdia 17body sprinkles.png — https://static.wikia.nocookie.net/battlefordreamisland/images/8/84/Bfdia_17body_sprinkles.png/revision/latest?cb=20250502025230
- Puffball (rainbow.png): the rainbow barf (BFDIA) — File:Barf rainbow long.png — https://static.wikia.nocookie.net/battlefordreamisland/images/b/b9/Barf_rainbow_long.png/revision/latest?cb=20180209063246
- Roboty (beep.png): BEEP lettering — File:BEEP!.png — https://static.wikia.nocookie.net/battlefordreamisland/images/0/0c/BEEP%21.png/revision/latest?cb=20180331203345
- Lightning (tpot7bolt.png): his TPOT 7 strike, lifted off the sky — File:Tpot7dpacas lightningrampage (25).png — https://static.wikia.nocookie.net/battlefordreamisland/images/6/61/Tpot7dpacas_lightningrampage_%2825%29.png/revision/latest?cb=20230917130637
- Taco (II) (lemon.png): a lemon — File:Lemon.png — https://static.wikia.nocookie.net/inanimateinsanity/images/3/35/Lemon.png/revision/latest?cb=20180215211341
- Bow (chair.png): a chair (S1 remaster design) — File:Chair Remaster.png — https://static.wikia.nocookie.net/inanimateinsanity/images/1/10/Chair_Remaster.png/revision/latest?cb=20260424195043
- Baseball (book.png): his Twilight book (the remastered cover, off its white sheet) — File:Twilight Book II Remastered.png — https://static.wikia.nocookie.net/inanimateinsanity/images/f/f0/Twilight_Book_II_Remastered.png/revision/latest?cb=20260406075642
- Apple (pencil.png): a pencil (Minor Items/Prizes) — File:Pencil Prize.png — https://static.wikia.nocookie.net/inanimateinsanity/images/4/49/Pencil_Prize.png/revision/latest?cb=20220817165350
- Knife (fist.png): the Fist Thingy (the hook in his Bag of Tricks) — File:Fist Thingy II.png — https://static.wikia.nocookie.net/inanimateinsanity/images/0/0e/Fist_Thingy_II.png/revision/latest?cb=20230618141946
- Knife (taser.png): the Temporary Paralyzer (the smoke in his Bag of Tricks) — File:Temp Paralyzer.png — https://static.wikia.nocookie.net/inanimateinsanity/images/e/ef/Temp_Paralyzer.png/revision/latest?cb=20190205224400
- Lightbulb (shimmerorb.png): the Shimmer Orb, cut out of Box's hands — File:Box with Shimmer Orb (S2E18).png — https://static.wikia.nocookie.net/inanimateinsanity/images/c/c1/Box_with_Shimmer_Orb_%28S2E18%29.png/revision/latest?cb=20260513002327
- Paintbrush (paintbomb.png): MePhone4's paint bomb, the balloon alone — File:Paint Bombs.png — https://static.wikia.nocookie.net/inanimateinsanity/images/a/ab/Paint_Bombs.png/revision/latest?cb=20220206005836
- Paper (piano.png): the season-1 grand piano (Episode 2), lifted out of the frame — File:Ep2 Piano.png — https://static.wikia.nocookie.net/inanimateinsanity/images/4/47/Ep2_Piano.png/revision/latest?cb=20110504235029


## Inanimate Insanity DLC

Inanimate Insanity, its characters and designs are the property of **AnimationEpic** (Adam Katz and Taylor
Grodin). Same footing as above: an unaffiliated, non-commercial fan game, no formal license, used under
fan-work norms. Fetched with `node scripts/fetch-sprites.mjs --wiki=inanimateinsanity`, the 2024 pose set,
downscaled to 200px tall, alpha verified, facing measured.

| Fighter | File | Source |
|---|---|---|
| Balloon | `balloon.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/c/cd/Balloon2024Pose.png |
| Bomb | `bomb.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/f/fc/Bomb2024Pose.png |
| Knife | `knife.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/9/97/Knife2024Pose.png |
| Lightbulb | `lightbulb.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/d/db/Lightbulb2024Pose.png |
| Paintbrush | `paintbrush.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/3/3f/Paintbrush2024Pose.png |
| Taco (II) | `taco-ii.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/8/8f/Taco2024PoseAlt.png |
| Bow | `bow.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/d/d5/Bow2024Pose.png |
| Marshmallow | `marshmallow.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/5/51/Marshmallow2024Pose.png |
| Apple | `apple.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/4/48/Apple2024Pose.png |
| Baseball | `baseball.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/d/db/Baseball2024Pose.png |
| Pickle | `pickle.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/e/e5/Pickle2024Pose.png |
| Nickel (II) | `nickel-ii.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/c/cf/Nickel2024Pose.png |
| Paper | `paper.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/8/82/Paper2024Pose.png |
| Microphone | `microphone.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/0/04/Microphone2018Pose.png |
| Salt | `salt.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/d/d3/Salt2024Pose.png |
| Pepper (Salt's partner) | `pepper.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/b/b7/Pepper2024Pose.png |
| Test Tube | `test-tube.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/0/00/Blue_Ray_Test_Tube_S4.png |
| Bot (Test Tube's robot, her summon) | `bot.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/d/da/Bot2024PoseAlt.png |
<!-- @b3:g1 Box, Trophy, Goo, Lifering -->

<!-- @b3:g2 Bonesaw, Spikey, Candle, Cammy -->

<!-- @b3:g3 Cheesy, Dough, Fan, Soap -->
| Cheesy | `cheesy.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/0/0f/Cheesy2024Pose.png/revision/latest?cb=20250628193516 |
| Dough (the owner's pick: GhostDoughBannerPose, the ghost with a tail, his infobox image) | `dough.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/e/ec/GhostDoughBannerPose.png/revision/latest?cb=20260617153251 |
| Fan | `fan.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/1/1e/Fan2024PoseAlt.png/revision/latest?cb=20250628193516 |
| Soap | `soap.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/c/cf/Soap2024Pose.png/revision/latest?cb=20250628193841 |
| Cheesy's soccer ball (A Kick in the Right Direction), off its green -- File:Soccer Ball.JPG | `attacks/soccerball.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/c/c9/Soccer_Ball.JPG/revision/latest?cb=20131103220257 |
| Dough's Loser Cage, cut from the S4E5 frame (owner: "Cut from the frames") -- File:S4E5 "I already owned this!".png | `attacks/losercage.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/3/3e/S4E5_%22I_already_owned_this%21%22.png/revision/latest?cb=20260407144512 |
| Soap's portable vacuum, cut from the S2E6 frame (owner: "Cut from the frames") -- File:S2e6 bow escapes out of the vacuum.png | `attacks/vacuum.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/6/61/S2e6_bow_escapes_out_of_the_vacuum.png/revision/latest?cb=20170827172834 |
| Soap's blue cleaning cloth, off her render -- File:SoapPro.png | `attacks/cloth.png` | https://static.wikia.nocookie.net/inanimateinsanity/images/5/5f/SoapPro.png/revision/latest?cb=20130526185952 |

<!-- @b3:g4 Tissues, Yin-Yang, Starfruit -->

<!-- @b3:g5 Blueberry, Cherries, Clover, Jack -->

<!-- @b3:g6 Magnet, MeTag, Poppy, Silver Spoon -->

<!-- @b3:g7 Tapey, Tea Kettle, Teddy Bear -->

