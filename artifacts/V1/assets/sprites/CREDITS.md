# Sprite assets — sourcing, licensing, and how to drop official art in

Battle for Smash Island is an **unaffiliated fan work**. Battle for Dream Island, its characters,
and its designs are the intellectual property of **jacknjellify** (Michael & Cary Huang).
This project is not affiliated with, endorsed by, or sponsored by jacknjellify.

## What is actually shipped here

**Nothing.** This directory contains no image files.

Every fighter sprite in the game is **vector art authored inside this repository** — plain 2D
canvas draw calls in `artifacts/V1/index.html` (`const SPRITES = { … }`), written from the prose
"Visual / on-model" descriptions in `docs/animation-move-design.md`. No BFDI image file was
downloaded, traced, copied, re-drawn from, or bundled. There is therefore no third-party image
licence to satisfy and no background to remove.

## Why not the official asset packs

The official-assets path was investigated first and rejected on two independent grounds.

**Sources checked**

| Source | Genuinely official? | Verdict |
|---|---|---|
| `http://bfdi.tv/assets` | **Yes** — jacknjellify's own domain; the location is confirmed by jacknjellify's official X/Twitter post <https://x.com/jacknjellify/status/1298438798364119040> ("Download the .FLA files"). | Rejected — see below. |
| `https://archive.org/details/bfdi-assets-svg-pack` | **No** — uploaded by third-party user `PatoFlamejanteTV` (2023-11-27). The stated "Attribution-ShareAlike 4.0 International" is a licence the *uploader* applied, not a grant from the rights holder. | Rejected: unknown-provenance re-upload. |
| `https://archive.org/details/BFDI_Assets`, `.../bfdipack`, `.../assetsfla` | Uncertain — account names resemble the creators' but Internet Archive account names are not identity-verified. | Rejected: cannot confidently verify as jacknjellify-published. |
| BFDI Fandom wiki / DeviantArt / image search | **No** — fan uploads, unknown licence. | Rejected by policy. |

**Why `bfdi.tv/assets` was still not used**

1. **No terms are stated.** The page publishes files (`assets.zip`, `grass.fla`, `chase.zip`,
   `oldies.fla`, `candybar.zip`, `CandyBarAdventure.swf`, plus a Drive link to episode FLAs) with
   **no licence, no usage grant, and no redistribution permission of any kind**. Publishing source
   files is not the same as licensing them for redistribution inside another product. Without an
   explicit grant there is nothing to record in this file beyond "no terms given", which does not
   meet the bar for bundling art into a repo.
2. **Wrong format.** The files are Adobe Animate/Flash sources (`.fla` / `.swf`), not sprite
   sheets. Turning them into per-character transparent PNGs requires Adobe Animate and a manual
   export pass, which is outside what this change can do or verify.

So the build took the second sanctioned path: **self-authored on-model vector sprites**. They read
as the real characters, carry zero licensing risk, and — critically — the sprite *system* is
identical either way, so official PNGs can replace them later with a one-line change per fighter.

## Pending: swapping in real character renders

A follow-up decision is open to replace these vector sprites with actual character artwork
(official pack first, BFDI Fandom wiki standing/neutral renders second). Nothing has been
downloaded yet — pulling third-party image files into this repo is a step that needs the repo
owner's own go-ahead through the permission system, not a relayed instruction, because the files
land in git history and are then served publicly from this directory.

The system is already built for it. When approved, each image drops in with a single added line
(see below) and no rendering-code change. Target filenames, one per batch-1 fighter:

| Fighter | Target file | Current source |
|---|---|---|
| Firey | `firey.png` | vector |
| Leafy | `leafy.png` | vector |
| Bubble | `bubble.png` | vector |
| Blocky | `blocky.png` | vector |
| Pen | `pen.png` | vector |
| Pencil | `pencil.png` | vector |
| Match | `match.png` | vector |
| Ice Cube | `ice-cube.png` | vector |
| Puffball | `puffball.png` | vector |
| Teardrop | `teardrop.png` | vector |
| Bomby | `bomby.png` | vector |
| Rocky | `rocky.png` | vector |

Fill in the "current source" column with the URL and a transparency note as each file is added.
Downscale renders to roughly 2x the in-game draw size (~120-200px tall) — the fighter radius is
24px, so anything larger is wasted bytes. `test/credential-strip.test.js` pins what may appear in
this directory: sprite images and this file, nothing else.

## Dropping official PNGs in later

If a properly licensed, verified-official asset pack becomes available, no rendering code has to
change. Add `src` to the fighter's entry in `SPRITES`:

```js
Firey: {
  src: "assets/sprites/firey.png",   // <- add this line; the vector art stays as the fallback
  w:2.1, h:2.6, anchorY:-0.12, ...
}
```

Rules for any PNG added here:

- **Transparent background is required.** No matte, no checkerboard, no white/solid fill behind the
  character. If the source art has a background it must be cut out before the file is committed,
  and the processing (tool + steps) recorded in this file next to the asset.
- **Record source URL and terms in this file** for every asset added, alongside the exact terms
  granted by the rights holder.
- The loader (`spriteImage()`) constructs the `Image` on the **first draw**, never at script-eval
  time — the headless jsdom tests forbid top-level media constructors. Keep it that way.
- If the PNG 404s or fails to decode, the fighter silently keeps rendering the vector art. Sprites
  are render-only; nothing here is serialized, so a missing asset can never desync a match.

## Attribution

Characters, names, and designs © jacknjellify. Fan work, non-commercial, not affiliated with or
endorsed by the rights holder.
