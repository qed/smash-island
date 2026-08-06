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
