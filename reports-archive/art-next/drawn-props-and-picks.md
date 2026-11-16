# Drawn attack props and show-picture picks (2026-11-12)

Survey of `PROJ_SHAPE` entries in artifacts/V1/index.html (branch ii-dlc) with no `ATTACK_SPRITES` entry. Hidden-content props (hidden fighters, bosses, OCs, the hidden boss mode, event-boss kits) are skipped and not named.

Count: 101 PROJ_SHAPE keys had no picture. About 45 belong to hidden content and are skipped. Of the roughly 56 visible-fighter props, only a few depict a real object that the show has a picture of. The rest are effects (waves, puddles, sparks, rings, flecks) or things the show never draws (caltrops, a speech bubble, a heat wave), so no picture fits.

## Done in this job (batch 4, commit c0f9c10c on branch g-art5, worktree .worktrees/art5; not pushed)

Downloaded from the BFDI wiki, cut out, looked at, wired through ATTACK_SPRITES (the drawn glyph stays until the image loads), credits rows added to CREDITS.md.

| Fighter | Move | Prop | File | URL | Notes |
|---|---|---|---|---|---|
| Stapy (assist) | assist staple | staple | File:Staple.png | https://battlefordreamisland.fandom.com/wiki/File:Staple.png | already transparent; legs-first via aim |
| Pie (assist) | assist pie | pie | File:Pie.png | https://battlefordreamisland.fandom.com/wiki/File:Pie.png | legs cut off; its face stays on the tin |
| Spongy | Final Smash cannonballs | iron ball | File:Cannonball Attack.png | https://battlefordreamisland.fandom.com/wiki/File:Cannonball_Attack.png | ball cut from a shot with speed lines and an egg; white fringe removed |
| Microphone | dodgeball shot (key `mic`) | red dodgeball | File:Dodgeball.png | https://battlefordreamisland.fandom.com/wiki/File:Dodgeball.png | white background keyed out |
| Pickle | needle (key `pickle`) | needle | File:Needle - huh.png | https://battlefordreamisland.fandom.com/wiki/File:Needle_-_huh.png | legs cut off; tip leads |
| Firey Jr. | big fireball | fireball | (reuses `fireball.png`) | n/a | no new download |

## Still drawn, with a possible picture (not done, left for approval or later)

| Fighter | Move | Prop | Candidate | Notes |
|---|---|---|---|---|
| Cammy | USB (`usbstick`) | USB stick | File:USB.png | the wiki file is the USB character "Onyx" with a face and legs; not the episode prop. Poor fit. |
| Test Tube | flask shot (`testtube`) | flask | File:Flask's asset.png / File:Acid Flask Asset.png | fan-made, not from the show. Rejected. |
| Snowball, Golf Ball | `tackle` | packed snow / golf ball | File:Snowball.png, File:Golf Ball.png | they are the characters (faces); not the thrown object. Not recommended. |
| Salt | `saltpepper`, `pepper` | shake of salt | File:Salt shaker.png | a shaker, but the shot is grains. Not recommended. |

## No fitting picture (effects or things the show never draws)

Loser's catchball, Pen's ink dart, Marshmallow's boxed purchase (`wallmart`), Nickel's speech bubble (`snark`), Knife's caltrops, Paintbrush's heat wave, Microphone's Feedback waves, Paper's paper cut, Blocky's conjured block, puddles (`puddle`, `goopuddle`, `juicepuddle`, `gadgetAcid`), Barf's fluid, Donut's glaze, Taco's salsa, Roboty's morse dots, Gaty's latch, Sidewalky's cement, Bell's ring, Candle's tuning fork and crystal, Tapey's playback rings, plus the unnamed `pun`, `copycat`, `pierce` and `voices` glyphs. For these I searched the wiki for matching files (Needle, Flask, Staple, Pie, Dodgeball, Cannonball, Salt shaker, Microphone, Paintbrush, Test Tube) and found only characters or fan art.

## Notes

- Ranking was by frequency and size: Spongy's cannonballs (big, Final Smash), Microphone's dodgeball (a basic shot), the assist staple and pie, then the needle (thin, about 4 px wide in play).
- The 15-item list the owner asked for does not exist: only 5 new downloads had a good fit, and all are done. No further names need approving.
- Not run: the "no-op match with a fake frame clock" check (I did not know its script; the change is drawing-only). Run: syncheck (failed 0) and bootcheck (clean, guards ok). I did not see the props in a running game; I only looked at the PNGs. Sizes are by calculation from the `h` values.
- Images were converted with the Pillow in the virology-networks venv because C:\Python314 has no PIL.
- A shot with no shape of its own for `mic` or `pickle` would draw the new sprite, as the older entries do.
- LEDGER.md has no "Show sprites" rows; batches 1 to 3 are narrated in CREDITS.md, so the batch 4 row went there.
