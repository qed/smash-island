# Skins audit: fighters with no regular skin, and the art to fix it

The owner: "TREE DOESNT HAVE A NON HALLOWEEN SKIN!!" This report checks every fighter and lists the art that would fill the gap. **Nothing was downloaded and nothing in the game was changed.** Every size below comes from the BFDI wiki's own API (`imageinfo`: pixel size, file size, upload history), the same way the earlier art lists were made.

Source read: `artifacts/V1/index.html` -- `ROSTER` (102 fighters), the skin rows of `COSMETICS`, `COS_SKIN_THUMBS`, `SPRITES` / `renderSprite`, `cosSkinSprite` / `cosSkinBox`, `LIMB_RIG`, `POSE_SETS`. The three prize fighters (`PRIZE_ROSTER`) are left out; another job covers them.

## The answer in one line

**Tree is the only fighter with no regular skin.** Every other fighter has 1 to 3. Tree was skipped on purpose when the 153 skins were added, because of the old rule "Do not change Tree" (`assets/sprites/CREDITS.md` says so twice). That rule is out of date now, so Tree just needs his skins.

## How the skins are counted

- **255 skin rows** in `COSMETICS`. **102** are the Halloween costumes (`month:10`, one per fighter, drawn live over the fighter's render). The other **153** are regular skins: each has its own picture (`src` in `assets/sprites/skins/`) and a baked thumbnail in `COS_SKIN_THUMBS` (153 thumbnails, one per skin, so none is missing). All 153 picture files are on disk.
- There is no month skin other than the Halloween ones, and no code path that stops Tree from wearing a skin. He just has no rows.
- The spread is lower than "2-4": **60 fighters have 1 regular skin, 30 have 2, 11 have 3, nobody has 4, and Tree has 0.**

## Counts: fighter -> regular skins (Halloween costume not counted; every fighter has exactly one of those)

| # | Fighter | Regular skins | Which (price in Win Tokens) |
|---|---|---|---|
| 1 | Firey | 1 | Mech Firey (150) |
| 2 | Leafy | 3 | Witch Leafy (75); Yoyle Metal Leafy (115); Sweater Leafy (75) |
| 3 | Needle | 1 | Algebralien Needle (115) |
| 4 | Pin | 1 | Robot Pin (150) |
| 5 | Snowball | 1 | Zombieball (115) |
| 6 | Bomby | 1 | Bandaged Bomby (75) |
| 7 | Bubble | 3 | Yoyleball (115); Balloon Bubble (75); Aloe Bubble (115) |
| 8 | Teardrop | 2 | Sweater Teardrop (75); Blindfolded Teardrop (75) |
| 9 | Flower | 3 | Missing Petal Flower (115); Yoyle Metal Flower (115); Frozen Flower (115) |
| 10 | Tennis Ball | 3 | Chef Tennis Ball (75); Yoyle Metal Tennis Ball (115); Sleepy Tennis Ball (75) |
| 11 | Blocky | 2 | Shades Blocky (75); Glove Blocky (75) |
| 12 | Coiny | 1 | Robo Coiny (150) |
| 13 | Pen | 1 | Capless Pen (75) |
| 14 | Pencil | 2 | Gear Earrings Pencil (75); Purple Shoes Pencil (75) |
| 15 | Golf Ball | 1 | Cracked Golf Ball (75) |
| 16 | Rocky | 3 | Tangerine Rocky (115); Cracked Rocky (115); Frozen Rocky (115) |
| 17 | Book | 1 | Shattered Book (75) |
| 18 | Fries | 2 | Broken Fries (115); Glow Fries (115) |
| 19 | Gelatin | 3 | Headphone Gelatin (75); Sweater Gelatin (75); Dyed Gelatin (115) |
| 20 | Nickel | 3 | Triangle Hole Nickel (115); Pink Nickel (115); Square Hole Nickel (115) |
| 21 | Puffball | 2 | Frozen Puffball (115); Thinking Hat Puffball (75) |
| 22 | Ruby | 3 | Yoyle Metal Ruby (115); Snowy Ruby (115); Bandaged Ruby (115) |
| 23 | Yellow Face | 2 | Yoyle Metal Yellow Face (115); Frozen Yellow Face (115) |
| 24 | Barf Bag | 2 | Zombie Barf Bag (115); Yoyle Metal Barf Bag (115) |
| 25 | Basketball | 1 | Yoyle Metal Basketball (115) |
| 26 | Bell | 2 | Snowy Bell (115); Twinkle Bell (115) |
| 27 | Bracelety | 2 | Magenta Bracelety (115); Purple Bracelety (115) |
| 28 | Fanny | 1 | Jetpack Fanny (75) |
| 29 | Gaty | 2 | Holey Gaty (115); Unpainted Gaty (115) |
| 30 | Grassy | 1 | Chef Grassy (75) |
| 31 | Lightning | 2 | Sunglasses Lightning (75); Glowing Lightning (115) |
| 32 | Liy | 2 | Jetpack Liy (75); Big Boots Liy (75) |
| 33 | Lollipop | 2 | Sweater Lollipop (75); Scribbled Lollipop (115) |
| 34 | Loser | 1 | Backpack Loser (75) |
| 35 | Marker | 2 | Uncapped Marker (75); Burnt Marker (115) |
| 36 | Money | 1 | Soaked Money (115) |
| 37 | Naily | 1 | Happy Naily (115) |
| 38 | Pillow | 1 | Charred Pillow (115) |
| 39 | Remote | 2 | Acid Remote (115); Siren Remote (75) |
| 40 | Rose | 2 | Frozen Rose (115); Flamethrower Rose (75) |
| 41 | Saw | 2 | Sizzling Saw (115); Handleless Saw (115) |
| 42 | Taco | 2 | Fishless Taco (115); Evil Taco (115) |
| 43 | TV | 1 | Upgraded TV (150) |
| 44 | Woody | 1 | Mech Woody (150) |
| 45 | Toothpaste | 1 | Half-Frozen Toothpaste (115) |
| 46 | Dora | 1 | Bob-Cut Dora (115) |
| 47 | Match | 1 | Knight Match (75) |
| 48 | David | 1 | Tangerine David (115) |
| 49 | Firey Jr. | 1 | Grinning Firey Jr. (115) |
| 50 | Fern | 1 | Frozen Fern (115) |
| 51 | Ruler | 1 | Crowned Ruler (75) |
| 52 | Sidewalky | 3 | Shades Sidewalky (75); Snowy Sidewalky (115); Cracked Sidewalky (115) |
| 53 | Balloony | 2 | Tangerine Balloony (115); One-Eyed Balloony (115) |
| 54 | Roboty | 2 | Open Chest Roboty (115); Plunger Roboty (75) |
| 55 | Profily | 2 | Leaf Profily (115); Watch Profily (75) |
| 56 | **Tree** | **0** | none -- only the Halloween costume (Lumberjack Tree) |
| 57 | Ice Cube | 3 | Headphone Ice Cube (75); Pink Ice Cube (115); Springy Shoes Ice Cube (75) |
| 58 | Cake | 1 | Caked Cake (115) |
| 59 | Donut | 1 | Doughnut (115) |
| 60 | Balloon | 2 | Hard Hat Balloon (75); Blue Ray Balloon (115) |
| 61 | Bomb | 1 | Snorkel Bomb (75) |
| 62 | Knife | 1 | Damaged Knife (115) |
| 63 | Lightbulb | 1 | Rockstar Lightbulb (115) |
| 64 | Paintbrush | 2 | Painted Paintbrush (115); Ice Cream Paintbrush (75) |
| 65 | Taco (II) | 2 | Blindfolded Taco (75); Soggy Taco (115) |
| 66 | Bow | 1 | Tattered Bow (115) |
| 67 | Marshmallow | 2 | Burnt Marshmallow (115); Guacamole Marshmallow (115) |
| 68 | Apple | 1 | Snotty Apple (115) |
| 69 | Baseball | 1 | Chocolate Baseball (115) |
| 70 | Pickle | 1 | Boxing Pickle (75) |
| 71 | Nickel (II) | 1 | Snazzy Nickel (75) |
| 72 | Paper | 1 | Rockstar Paper (150) |
| 73 | Microphone | 1 | Blindfolded Microphone (75) |
| 74 | Salt | 1 | Face Mask Salt (75) |
| 75 | Test Tube | 1 | Lab-Coat Test Tube (75) |
| 76 | Box | 1 | Blindfolded Box (75) |
| 77 | Trophy | 2 | Blindfolded Trophy (75); Whistle Trophy (75) |
| 78 | Goo | 2 | Blindfolded Goo (75); Muscular Goo (115) |
| 79 | Lifering | 1 | Investigator Lifering (75) |
| 80 | Bonesaw | 1 | Blindfolded Bonesaw (75) |
| 81 | Spikey | 2 | Blindfolded Spikey (75); Tangled Spikey (75) |
| 82 | Candle | 1 | Blindfolded Candle (75) |
| 83 | Cammy | 1 | Camera #1 (115) |
| 84 | Cheesy | 1 | Blindfolded Cheesy (75) |
| 85 | Dough | 1 | Solid Dough (115) |
| 86 | Fan | 1 | Battered Fan (115) |
| 87 | Soap | 2 | Blindfolded Soap (75); Oily Soap (115) |
| 88 | Tissues | 1 | Snotty Tissues (115) |
| 89 | Yin-Yang | 1 | Detective Yin-Yang (75) |
| 90 | Starfruit | 1 | Rockstar Starfruit (115) |
| 91 | Blueberry | 1 | Golden Blueberry (115) |
| 92 | Cherries | 1 | Blindfolded Cherries (75) |
| 93 | Clover | 2 | Detective Clover (75); Deerstalker Clover (75) |
| 94 | Jack | 1 | Tattered Jack (75) |
| 95 | Magnet | 1 | Blindfolded Magnet (75) |
| 96 | MeTag | 1 | Blindfolded MeTag (75) |
| 97 | Poppy | 1 | Rockstar Poppy (150) |
| 98 | Silver Spoon | 3 | Glowing Gold Spoon (115); Ice Cream Spoon (75); Hard Hat Silver Spoon (75) |
| 99 | Tapey | 1 | Rockstar Tapey (150) |
| 100 | Tea Kettle | 1 | Blindfolded Tea Kettle (75) |
| 101 | Teddy Bear | 1 | Tired Teddy Bear (115) |
| 102 | Bot | 1 | Damaged Bot (115) |

## Tree: the art list

**Tree's main art group is BFB+TPOT.** His render (`tree.png`, 170x200, flipped) is `File:Tree the Purple.png` (TPOT 19-25, 644x756). That means his skins must come from BFB or TPOT art. Nothing from BFDI, BFDIA or IDFB can be used, and neither can the other art styles (BFDI is Back, CGI, early-2010, pixel, Roblox).

**How a skin fits the game (why pose matters):** a skin replaces the whole render picture. It keeps Tree's own box (it can grow at most 1.1x for a prop, `COS_SKIN_ROOM`), plus his anchor, face and his `FIGHTER_ANIM` sway/squash. But the painted leg rig (`LIMB_RIG`, measured on the base picture) and any pose-picture swaps are switched off while a skin is worn. Tree has no `POSE_SETS`, so nothing extra is lost. Hits always use the base outline (`HURT_POLY`). So the best skin is the same standing pose, about the same shape (base ratio 0.852 wide:tall), as a clean cut-out with his face visible.

### Pick 1 -- Tree the Green (his normal green look)

| | |
|---|---|
| Skin name | **Tree the Green** (Four's own nickname for him, listed on the wiki) |
| Price | **115** (whole-body recolour, priced like Pink Nickel, Tangerine Rocky, Golden Blueberry) |
| Wiki file page | https://battlefordreamisland.fandom.com/wiki/File:Tpot_renders0002.png |
| Static image | https://static.wikia.nocookie.net/battlefordreamisland/images/d/d0/Tpot_renders0002.png/revision/latest?cb=20250202023830 |
| Size | 644 x 756 px, 51,926 bytes (50.7 KB) |
| Season | TPOT (the "TPOT" image in Tree's infobox). The same render has been used through BFB/TPOT, and on the wiki's Intros page |
| Art group | BFB+TPOT (matches the main art) |
| Fit | **Perfect.** It has exactly the same pixel size as `Tree the Purple.png` (644x756), because the purple render is this picture recoloured. Same pose, same outline, faces the same way (`flip:true`), and the same box (`imgH:2.8, imgW:2.3`, no prop room needed). It is also the green colour his roster colour (`#3f8a3a`) already promises. |
| Note | The file was vandalised once. The current version (2025-02-02) is a restore of the original (same sha1 as the 2021/2023 version), not the vandal's 360x722 upload. |

### Pick 2 -- Snowy Tree

| | |
|---|---|
| Skin name | **Snowy Tree** (the wiki's own caption) |
| Price | **115** (same as Snowy Ruby, Snowy Bell, Snowy Sidewalky) |
| Wiki file page | https://battlefordreamisland.fandom.com/wiki/File:SnowTree.png |
| Static image | https://static.wikia.nocookie.net/battlefordreamisland/images/f/f1/SnowTree.png/revision/latest?cb=20241109204914 |
| Size | 810 x 952 px, 218,461 bytes (213.3 KB) |
| Season | TPOT 14, "I SAID CAREFUL!!!" (Tree's Designs gallery) -- the same episode as the Snowy Ruby and Jetpack Fanny skins already in the game |
| Art group | BFB+TPOT (matches the main art) |
| Fit | **Very good (expected).** Its shape is 0.851 wide:tall, against 0.852 for the base, so it is almost surely the standing render with snow on him. It is from before TPOT 19, so the leaves are green under the snow. `imgH`/`imgW` start at 2.8/2.3. If the snow on top adds height, use about 2.94/2.42, like the other prop skins (still inside `COS_SKIN_ROOM`). `flip` gets measured by `fetch-sprites.mjs` when it is fetched. The wiki has a separate half-covered version (`HALFSNOWTREE.png`, 1130x1058, wider), but this one is the cleaner fit. |

### Runner-up (if the owner wants a third, or rejects one above)

| Skin name | Price | File page | Static image | Size | Season | Fit |
|---|---|---|---|---|---|---|
| Jetpack Tree | 75 (like Jetpack Fanny / Jetpack Liy) | https://battlefordreamisland.fandom.com/wiki/File:TREEJETP.A.C.T.png | https://static.wikia.nocookie.net/battlefordreamisland/images/7/75/TREEJETP.A.C.T.png/revision/latest?cb=20250727175451 | 390x452, 109,055 B (106.5 KB) | TPOT 14 | Good: shape 0.863, the jetpack is a back prop that fits the 1.1x room. Same episode as the Jetpack Fanny skin. |
| Twinkle Tree | 115 (like Twinkle Bell) | https://battlefordreamisland.fandom.com/wiki/File:Tree_Twinkle.png | https://static.wikia.nocookie.net/battlefordreamisland/images/e/e4/Tree_Twinkle.png/revision/latest?cb=20190907194244 | 3625x3806, 1,048,322 B (1,023.8 KB) | BFB 6 | Probably fine: shape 0.952, a bit wider than the base. A big source file, but the pipeline asks the wiki for a 200 px copy. |

### Looked at and left out

- **Wrong art group (BFDI/BFDIA/IDFB):** `Treebfdi.png`, `TreeinTLCinLOL.png`, `Tree Stand.png`, `Poisoned Tree.png`, the taped Tree (BFDIA 16-21), `Tree Early.png`, `BFDIA Tree the Purple.png`.
- **Other art styles:** `Tree BIB.png` (BFDI is Back style), `CGITree-removebg-preview.png`, `Tree in early 2010 style .png`, `PixelatedTree).png`, `Roblox Tree.png`.
- **Not from the show:** `Fall tree.png` and `TREETHEBLUE.png` ("Frozen Tree") are social-media posts. A Frozen Tree would match the other "Frozen" skins if the owner allows non-episode art.
- **Bad fit or against the existing skin rules:** `POPPYHATTREE.png` (a Popper covers his face), `TREENOODLES.png` (hanging upside down), `Tree new.png` / giant / vine Trees (limbless or giant, TPOT 8-10), bug-blood Trees (TPOT 13, gore), `Hole Tree.png` (576x433, landscape crop), `FORKTREE.png` (forks stuck in him), `GreenArmTreee.png` (a one-moment prop in TPOT 19, wide).
- **Plain duplicates of Pick 1:** `Tree book.png` (BFB) and `Tree pose.png` (Early BFB) are the same green look in another pose.
- **Different characters:** the "Variations of Tree" page (Robot Tree, Evil Tree, Bonsai, Blue Tree and so on) lists other recommended characters, not Tree. Skins only use looks the fighter himself really has.

## Summary of the art list

- **One fighter is missing regular skins: Tree.** He needs at least one; two keeps him in line with the 30 fighters who have 2.
- **Pick 1: Tree the Green** (115): the TPOT green render. Same pose and size as his purple main art. 50.7 KB at the wiki.
- **Pick 2: Snowy Tree** (115): TPOT 14. Joins the Snowy Ruby/Bell/Sidewalky family. 213.3 KB at the wiki.
- Runners-up: Jetpack Tree (75, TPOT 14) and Twinkle Tree (115, BFB 6).
- All are BFB+TPOT art, matching his main art. **Total for the two picks: 270,387 bytes (264 KB) at full size at the wiki.** The pipeline (`fetch-sprites.mjs`) asks the wiki for a 200 px-tall copy, so the real fetch is much smaller.
- **Downloading needs the owner's OK.** After that, each one goes through the usual skins pipeline. Each picture is looked at before it is kept (one character, face visible, no lettering). New rows go at the **end** of the skin rows, because the order is append-only for online codes (suggested ids `sk_tree_green`, `sk_tree_snowy`). Each also gets a thumbnail in `COS_SKIN_THUMBS`, a line in `scripts/sprite-manifest-skins.json`, and a credits line in `CREDITS.md`. Also remove the "(Tree has none ...)" note there.
