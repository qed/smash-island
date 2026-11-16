# Prize skins: show looks for OJ, Suitcase and Cabby (list only, nothing downloaded)

Private report, not in git. 2026-10-25, branch g-prize-skins.

Where the numbers come from: each file's own wiki data (width, height, bytes, upload time). I read it through the wiki's
imageinfo API, which serves what the file page shows. No image file was downloaded for this list. Pictures marked
"seen" were already on disk in the session scratchpad from an earlier job (oj-s3.png, suitcase-21.png, cabby-s3.png,
prop-golden-cabby.png). The others are judged from their wiki caption and shape only: look at them when you OK the download.

## How a show look becomes a skin (what "fits" means)

A skin row is `src` (a PNG in assets/sprites/skins/, about 200 px tall after fetch-sprites cleans it), `flip`, `imgH`, `imgW`.
- The picture is drawn whole, in place of the fighter's render. It uses the fighter's own box, face and float, and it may
  grow up to 10% for a prop (COS_SKIN_ROOM).
- Limbs are NOT cut out and animated on a skin (LIMB_RIG is measured on the base render only). The arms and legs drawn in the
  picture stay as drawn, and the body still leans, squashes and flips. Hitboxes stay the base render's.
- So a good source is a transparent, full-body, standing cutout, front or three-quarter view, shaped like the base render. A hat
  or helmet that adds more than about 10% height makes the body draw smaller. An episode screenshot with a background needs
  cleanup first.

Base renders, for comparison: OJ2024Pose.png 1557x2461 (w/h 0.63), Suitcase2024PoseCropped.png 3609x3637 (0.99, faces left,
shown flipped), Cabby2024Pose.png 3600x3516 (1.02: her folder arm makes it wide).

House prices: 75 = outfit or prop (Chef Grassy, Snazzy Nickel, Detective Yin-Yang), 115 = recolour or big change
(Glow Fries, Broken Fries), 150 = transformation (Mech, Rockstar).

## OJ

| # | Look | Season / style | File page | Image URL | Pixels | Bytes | Fit | Price |
|---|---|---|---|---|---|---|---|---|
| 1 | **Kool-Aid OJ**: his glass full of Cherry Kool-Aid | Season 4 era, "The Taco Show" | https://inanimateinsanity.fandom.com/wiki/File:Kool_Aid.png | https://static.wikia.nocookie.net/inanimateinsanity/images/7/7c/Kool_Aid.png/revision/latest?cb=20260429031554 | 534x863 | 188,099 | Very likely good: w/h 0.62, the same shape as his base (0.63), so probably the current pose recoloured red. Not seen. | 115 |
| 2 | **Invitational OJ**: his 2021 design, thumbs up | Inanimate Insanity Invitational (S3), 2021 | https://inanimateinsanity.fandom.com/wiki/File:OJ_S3_21.png | https://static.wikia.nocookie.net/inanimateinsanity/images/2/2c/OJ_S3_21.png/revision/latest?cb=20210914215033 | 729x903 | 41,281 | Good, seen: full body, three-quarter view, legs and both arms drawn (thumb out on one side, hand on hip on the other), grey outline, pink-tinted glass. Wider (0.81) because of the arm, so it draws at his height and a bit wider. | 75 |
| alt | Classic OJ: his Season 1 look, remastered | Inanimate Insanity (S1) Remastered | https://inanimateinsanity.fandom.com/wiki/File:OJS1Remastered.png | https://static.wikia.nocookie.net/inanimateinsanity/images/0/03/OJS1Remastered.png/revision/latest?cb=20260428063541 | 1290x1583 | 339,348 | Probably fine (0.81, pose art). Not seen. | 75 |
| no | Zombie OJ, full of guacamole | War De Guacamole (Remastered) | https://inanimateinsanity.fandom.com/wiki/File:II_1_remaster_zombie_oj.png | https://static.wikia.nocookie.net/inanimateinsanity/images/b/b5/II_1_remaster_zombie_oj.png/revision/latest?cb=20260104064753 | 1920x1715 | 601,184 | Landscape (1.12) for a tall glass, so likely a scene crop. Poor fit. | - |

Also passed over: Claymation OJ (a clay style that clashes with the flat art), OJ Plush (merchandise), OJ Cork (OJ Cork.png
363x646, a cork in his top; it reads as a prop, and the game already uses his cork for a move picture).

## Suitcase

| # | Look | Season / style | File page | Image URL | Pixels | Bytes | Fit | Price |
|---|---|---|---|---|---|---|---|---|
| 1 | **Winner Suitcase**: wearing a "Winner!" sash | Inanimate Insanity II, ep. 14 (wiki: S2E14) | https://inanimateinsanity.fandom.com/wiki/File:Suitcase_in_a_%22Winner!%22_Sash_(S2E14).png | https://static.wikia.nocookie.net/inanimateinsanity/images/e/ea/Suitcase_in_a_%22Winner%21%22_Sash_%28S2E14%29.png/revision/latest?cb=20260322015730 | 879x913 | 353,751 | Good: w/h 0.96, nearly her base's 0.99, and a sash adds no height. II-era art, likely facing right, so `flip` is set when cleaned. Not seen. | 75 |
| 2 | **Miner Suitcase**: mining helmet with lamp | Inanimate Insanity II, ep. 13 (wiki: S2E13) | https://inanimateinsanity.fandom.com/wiki/File:Suitcase_in_a_Mining_Helmet_(S2E13.png | https://static.wikia.nocookie.net/inanimateinsanity/images/1/1d/Suitcase_in_a_Mining_Helmet_%28S2E13.png/revision/latest?cb=20260322015728 | 775x992 | 388,322 | OK: the helmet makes it 0.78, about 25% taller than her body, more than the 10% prop room, so her body draws about 15% smaller unless the helmet is allowed more room. Not seen. | 75 |
| alt | II-era Suitcase: her 2021 design | Inanimate Insanity II (2021 art) | https://inanimateinsanity.fandom.com/wiki/File:Suitcase_21.png | https://static.wikia.nocookie.net/inanimateinsanity/images/4/4c/Suitcase_21.png/revision/latest?cb=20240521200729 | 4190x4281 | 452,707 | Fits perfectly, seen (0.98, standing, faces right, needs `flip`). But it is very close to her current render, so a weak buy. | 75 |
| alt | Spring! clone Suitcase | Invitational (S3E14, S3E19) | https://inanimateinsanity.fandom.com/wiki/File:SuitcaseIII.png | https://static.wikia.nocookie.net/inanimateinsanity/images/e/ea/SuitcaseIII.png/revision/latest?cb=20241009200116 | 702x671 | 211,614 | Shape fits (1.05). Not seen; it is a spring-toy version, so check the face. | 115 |

## Cabby

| # | Look | Season / style | File page | Image URL | Pixels | Bytes | Fit | Price |
|---|---|---|---|---|---|---|---|---|
| 1 | **Golden Cabby**: gold, holding the Immunity Cookie | Invitational, ep. 10 and 14 (wiki: S3E10, S3E14) | https://inanimateinsanity.fandom.com/wiki/File:Golden_Cabby.png | https://static.wikia.nocookie.net/inanimateinsanity/images/a/a1/Golden_Cabby.png/revision/latest?cb=20240622103610 | 1025x1600 | 401,567 | Good, seen: straight front view, both drawers shut, arms at her sides, cookie at one foot, sparkles. Narrower than her base (0.64 vs 1.02, which has the folder arm), so it draws at her height and slimmer. Soft edges, as from an episode frame, so it needs the halo clean. | 115 |
| 2 | **Hard Hat Cabby**: a construction hard hat | Invitational, ep. 17 "The Show Must Go On" (the final four all wear hard hats) | https://inanimateinsanity.fandom.com/wiki/File:Hard_Hat_Cabby_(S3E17).png | https://static.wikia.nocookie.net/inanimateinsanity/images/2/29/Hard_Hat_Cabby_%28S3E17%29.png/revision/latest?cb=20260315063441 | 443x755 | 103,186 | OK: tall (0.59) because of the hat, so the body draws smaller unless the hat gets more room. Small source, but enough for a 200 px skin. Not seen. | 75 |
| alt | II-era Cabby: her cameo design in II | Inanimate Insanity II | https://inanimateinsanity.fandom.com/wiki/File:Cabby_in_inanimate_insanity_II.png | https://static.wikia.nocookie.net/inanimateinsanity/images/4/44/Cabby_in_inanimate_insanity_II.png/revision/latest?cb=20240907213701 | 775x1023 | 99,299 | Shape fits (0.76). Not seen. | 75 |
| no | Invitational Cabby, 2021 design | Invitational (2021 art) | https://inanimateinsanity.fandom.com/wiki/File:Cabby_S3_21.png | https://static.wikia.nocookie.net/inanimateinsanity/images/9/93/Cabby_S3_21.png/revision/latest?cb=20250806165627 | 4456x4128 | 188,636 | Seen: her bottom drawer is pulled open. Her kit draws the drawer opening as a move (that is why her base render has the drawers shut), so this one would show the drawer open twice. Not recommended. | - |

## Summary

- Recommended (two each): Kool-Aid OJ (115) and Invitational OJ (75); Winner Suitcase (75) and Miner Suitcase (75);
  Golden Cabby (115) and Hard Hat Cabby (75).
- Every source is small (41 KB to 402 KB). A cleaned 200 px skin comes out at roughly 10 to 40 KB each.
- To make them: get the owner's OK to download, then add the six to scripts/sprite-manifest-skins.json and fetch them with
  scripts/fetch-sprites.mjs (credit each one in assets/sprites/CREDITS.md). Put the rows in the gated prize block of COSMETICS
  (cosPrizeHidden already hides any look whose fighter is a prize fighter). Append them after the three costumes so no online
  code moves.
- Secrecy: CREDITS.md is a public file and already names the three (lines 661-663), and their render files are named
  oj.png / suitcase.png / cabby.png. Both were there before this job; new credit lines would add to it.

## The Halloween costumes (done, on g-prize-skins)

| Costume | Fighter | Price | Notes |
|---|---|---|---|
| Tiger OJ | OJ | 75 | round tiger ears, painted stripes, a striped tail that swishes |
| Mimic Suitcase | Suitcase | 115 | a toothy mimic mouth across her top, a lolling tongue, gold corner plates |
| Judge Cabby | Cabby | 115 | full-bottomed white wig, lace jabot, black robe behind her (`noHat`) |

The pictures are in prize-costumes.png in this folder.
