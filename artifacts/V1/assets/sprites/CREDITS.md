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

**47 additional character renders**, fetched from the character infobox on
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
| Fanny | `fanny.png` | 158×200 | -0.129 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/e/e7/Tpot_renders0004.png/revision/latest?cb=20210113223402 |
| Fern | `fern.png` | 151×200 | 0 | https://static.wikia.nocookie.net/battlefordreamisland/images/e/ea/FernIntroRecreation.png/revision/latest?cb=20260102040323 |
| Firey Jr. | `firey-jr.png` | 241×200 | 0.008 | https://static.wikia.nocookie.net/battlefordreamisland/images/a/ac/Tpot_renders0048.png/revision/latest?cb=20260410150529 |
| Flower | `flower.png` | 161×200 | 0.013 | https://static.wikia.nocookie.net/battlefordreamisland/images/1/13/BFDI-TPOT_7_Flower.png/revision/latest?cb=20260131062732 |
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
| Woody | `woody.png` | 167×200 | 0.02 | https://static.wikia.nocookie.net/battlefordreamisland/images/6/64/Woody_in_TPOT_%28fair_enough%29.png/revision/latest?cb=20260701141213 |
| Yellow Face | `yellow-face.png` | 194×200 | -0.059 (flipped) | https://static.wikia.nocookie.net/battlefordreamisland/images/a/a7/Yellowface.png/revision/latest?cb=20190908174021 |
<!-- RENDER-INVENTORY-END -->
