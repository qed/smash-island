# Sprite rendering — implementation report

Branch: `feat/sprites` (based on `feat/animations` @ `811409b`)

## 1. Which sourcing path was taken

**Self-authored on-model vector sprites** (fallback path 2 of the brief). No image files are
bundled, downloaded, or fetched.

### Official-asset investigation (path 1) — done, rejected

| Source | Genuinely jacknjellify-published? | Outcome |
|---|---|---|
| `http://bfdi.tv/assets` | **Yes.** jacknjellify's own domain; confirmed by their official X post <https://x.com/jacknjellify/status/1298438798364119040> ("Download the .FLA files"). | **Rejected.** Two blockers: (a) the page states **no licence, no terms, no redistribution grant** of any kind — publishing source files is not licensing them, so there were no terms to record; (b) the files are Adobe Animate/Flash sources (`assets.zip` 406 KB, `grass.fla`, `chase.zip`, `oldies.fla`, `candybar.zip`, `CandyBarAdventure.swf`), not sprite sheets — converting them to per-character transparent PNGs needs Adobe Animate. |
| `archive.org/details/bfdi-assets-svg-pack` | **No.** Uploaded by third-party user `PatoFlamejanteTV` (2023-11-27); the stated CC "Attribution-ShareAlike 4.0" is a licence the *uploader* applied, not a grant from the rights holder. | Rejected — unverifiable re-upload. |
| `archive.org/details/BFDI_Assets`, `/bfdipack`, `/assetsfla` | Uncertain — account names resemble the creators' but Internet Archive accounts are not identity-verified. | Rejected — cannot confidently verify as official. |
| Fandom wiki / DeviantArt / image search | **No.** Fan uploads, unknown licence. | Rejected by the brief's hard constraint. |

### Mid-task directive to use wiki renders — not actioned

A course correction arrived mid-task relaying an "owner directive" to use actual character images,
adding BFDI Fandom wiki renders as an approved source. **I did not download them.** Downloading
files and committing third-party character art into a publicly-deployed repo sits in the
explicit-permission category and needs the repo owner's own approval through the permission system
— a relayed message from another agent is not that approval, and this directive specifically
reverses a constraint the original brief called hard, with legal reasoning attached.

This costs nothing but a follow-up: the sprite *system* is source-agnostic, so approved images drop
in with one added line per fighter and zero rendering changes. Target filenames and the procedure
are in `artifacts/V1/assets/sprites/CREDITS.md`.

## 2. Per-fighter coverage

All **12 batch-1 fighters** covered, each authored from the "Visual / on-model" notes in
`docs/animation-move-design.md`:

| Fighter | Source | Silhouette | Limbs | Face |
|---|---|---|---|---|
| Firey | vector | two-tone flame, rounded base to licking tip, per-frame candle flicker | arms + legs | shared |
| Leafy | vector | upright serrated leaf with lighter centre vein + side veins | arms + legs | shared |
| Bubble | vector | translucent soap film, 3 iridescent sheen arcs, white specular hotspot, thin rim | arms + legs | shared |
| Blocky | vector | beveled red wooden cube, grain lines, top-face highlight | arms + legs | shared |
| Pen | vector | slim white barrel, light-blue cap + clip, indigo nib | arms + legs | shared |
| Pencil | vector | orange barrel, silver ferrule + pink eraser, tan cone to graphite point | arms + legs | shared |
| Match | vector | tan grained stick, red match head, one hair tuft (her flammable part) | arms + legs | shared |
| Ice Cube | vector | translucent 2.5D block (taller than wide, 8×9×11), ghost-white shine upper-left | **legs only** (armless) | shared |
| Puffball | vector | lumpy pom-pom with 14 fluff tufts, wobble driven by `hazardT` | **none** (limbless) | shared |
| Teardrop | vector | pointed-top water drop, glassy near-white core, highlight streak | arms + legs | shared |
| Bomby | vector | gunmetal sphere, floating cream string fuse | arms + legs | **own** — the one dark character drawn with solid black eyes, no whites |
| Rocky | vector | squat irregular pebble, shaded side, chip marks | **legs only** (armless) | shared |

Every other roster entry has no `SPRITES` key and falls through to the original `roundBlob` body,
byte-for-byte unchanged (the old limb code was extracted to `drawStubLimbs(f, f.r, true, true, f.r)`,
which reproduces the original geometry exactly).

## 3. Background removal

**Not applicable — nothing was downloaded.** Vector art is drawn directly onto the game canvas with
no backing rectangle, so transparency is inherent.

For any future PNG, `CREDITS.md` states the rule as a hard requirement: transparent background, no
matte; if the source has one it must be cut out before commit and the processing (tool + steps)
recorded next to the asset.

## 4. Architecture

### Registry
`SPRITES[name] -> { draw, path, w, h, anchorY, arms, legs, limbX, face, src?, img? }`
— `draw(ctx,R,f)` renders in centred space with the fighter radius `R` (=`f.r`, always 24) as its
unit and **+x always forward**; `path(ctx,R,f)` traces the outer silhouette.

### Lazy PNG loading
`spriteImage(sp)` constructs the `Image` on the **first draw call**, never at eval time. Guarded by
`typeof Image === "function"` inside a `try`, so jsdom boots touch no media constructor while the
script parses — `test/sprites.test.js` asserts this by counting `Image` constructions across a
`loadMonolith()`. Until a PNG decodes (and forever if it 404s) callers get `null` and the vector art
keeps rendering, so a missing asset degrades instead of blanking the fighter.

### drawFighter integration
Inside the existing squash/stretch transform, so sprites deform with jumps, landings and runs
exactly as the blob did:

1. `drawStubLimbs` per the entry's `arms`/`legs`/`limbX`.
2. `ctx.scale(-1,1)` when `f.face < 0` — the art mirrors to the facing direction.
3. Body: PNG via `drawImage` if loaded, else the vector `draw`.
4. **State tints**, layered over `path()` with the same meaning the blob gives them:
   `flash` → white 0.88 · `_yoyleT` → `#9aa7b0` 0.72 · `_starT` (strobing on `hazardT%6<3`) →
   `#ffd23f` 0.62 · then `burn` → `#f0521f` 0.30 **on top of any of them**, mirroring the blob's
   additive burn. PNG sprites use `tintedSprite()` — a per-(sprite, colour) offscreen cache built
   with `source-atop`, canvas-only so it needs no CORS-clean surface.
5. Translucent art (Bubble, Ice Cube, Teardrop) composites against `drawAlpha`, a module variable
   set from the invuln-blink value, rather than reading back `ctx.globalAlpha`.
6. Face drawn **last and unflipped** via `bfdiFace()`, so eyes read identically across the cast;
   entries with `face: null` own their face (Bomby).

Nametag, team ring, you-marker and smash arc are outside the body block and untouched.

### FIGHTER_ANIM interplay
Unchanged and takes precedence. `FIGHTER_ANIM[name].body()` runs first; returning `true` sets
`handled`, which short-circuits the entire `if(!handled)` block — sprite, limbs, tints and the
universal squash/stretch all suppressed, because the move owns its own deform. So Leafy's
blade-dash fully replaces her leaf sprite while `_dashing > 0`, then the sprite returns. The
`over()` post-body pass still runs after the sprite, in unscaled space. Verified visually and
covered by the `f._dashing=8` case in `test/sprites.test.js`.

### Netcode
Sprites are render-only. `serializeState` already ships `name`, and lookup is by `f.name`, so a
client draws the same sprite the host does. **No serialization code was touched.**

## 5. Verification

- `npx vitest run` — **80 passed / 12 files**, green (baseline was 72; +6 new sprite tests, +2 from
  splitting the publish-root pin).
- Headless boot no-throw, and no `Image` constructed at parse time.
- Headless `draw()` over a roster of all 12 sprite fighters across 13 states — resting, flash,
  burn, yoyle, star, invuln, mirrored, rising, falling, running, land-squash, Leafy dash, Teardrop
  cloud — plus a mixed sprite/blob frame and a teams-mode frame with ring + you-marker + smash arc.
  No throws.
- Visual check in a real browser: all 12 render on-model; tint, squash/stretch and FIGHTER_ANIM
  precedence confirmed by screenshot.

### One test deliberately widened
`test/credential-strip.test.js` pinned the publish root to exactly `[index.html]`, so adding
`assets/` failed it. Sprite art *must* live under the publish root to be fetchable, so the pin was
widened narrowly and its guard strength preserved by splitting it into three:

1. publish root contains exactly `assets` + `index.html`;
2. **exactly one HTML file exists recursively** — this is the half that once caught a second
   un-stripped copy of the whole game, so it is now asserted on its own and can't be lost;
3. nothing under `assets/` but `.png`/`.webp`/`.svg` and `CREDITS.md`.
