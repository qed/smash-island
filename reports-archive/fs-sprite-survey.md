# Final Smash props: which still draw stand-ins, and the show pictures that could replace them (survey, 2026-11-04)

Nothing was downloaded, nothing in the game was edited. The three hidden prize fighters are left out. Lookups: read-only wiki API calls (File search, imageinfo) from my own tab in the built-in browser; for the shortlisted files I also LOOKED at small thumbnails in that tab (loaded in the browser only, nothing saved) to tell an object render from a character pose. Confidence below comes from that look plus the file name and uploader; a full-size check still happens after the owner's OK, as with the Algebralien Rush files.

## How the game draws Final Smashes now (from the code)
- 138 `FINAL_SMASHES[...]` assignments, about 100 fighters. Almost every row draws its props with canvas shapes (`FS_GLYPH`, `fsaA_/fsaR_/fsb1-3_/fsc1-3_` draw functions).
- Show pictures inside Final Smash drawing exist for only a few: `attackImage('van')` (Pencil), `bossImage('evilleafy')` (Leafy), `attackImage('tvspider')` (TV), `'sign'` (Bracelety), `'battery'` (Remote), `'jawball'` (Taco), `'anntosser'` (Cake's tosser), `'bugeggs'/'bugpurple'` (Flower), `attackImage(key)` for Clover's butterflies; Pen/Blueberry/Ice Cube/Bomby/Gaty/Grassy/Money/Fern draw their OWN fighter sprite as the hero.
- Many props already HAVE a show picture in `assets/sprites/attacks/` (used for that fighter's ordinary shots) but the Final Smash still draws a shape. Those need NO download, only wiring: marked "local" in the table.
- Limit: I read the code by searching (the file is 97,000 lines), and took each fighter's prop from the code plus `final-smash-animations.md`. Match's Van lane and the five event fighters were not traced.

## STEP 1: main prop per fighter
Now: A = already a show picture, B = drawn shape, C = the fighter's own sprite. "local" = the game already holds a show picture of that object (assets/sprites/attacks/NAME.png).

| Fighter | Main prop(s) | Now |
|---|---|---|
| Firey | flame columns | B (fireball.png local) |
| Leafy | the void, Evil Leafy | A (boss picture) + B void |
| Pencil | Supervan | A (van.png) |
| Puffball | rainbow barf tsunami | B (rainbow.png local) |
| Bow | chairs | B (chair.png local) |
| Flower | hand mirror, petals, bugs | A bugs, B mirror |
| Bubble | bubbles | B (bubble.png local) |
| Blocky | boxes / X ring | B / C |
| Pen | cap, giant X | C cap cut from own picture, B X |
| Match | the Van | B (van.png local; reuse not checked) |
| Ice Cube | frozen block | C |
| Teardrop | blank signs | B (sign.png local) |
| Bomby | bomb, fuse | C |
| Rocky | sludge, red ball, block | B |
| Lightning | storm cloud, bolt, HOUSE, FURNACE | B (bolt: tpot7bolt.png local; house, furnace, cloud drawn) |
| Fanny | wind | B |
| Dora | jabs | B |
| Saw | blade | B (sawblade.png local) |
| Tennis Ball | balls | B (tennisball.png local) |
| Snowball | snowballs | B |
| Book | books | B (book.png local) |
| Ruby | gem bolts | B (gem.png local) |
| Needle | slash lane | B |
| Pin | red pin, balloon | B |
| Coiny | MONITOR, coin slaps | B (coin.png local) |
| Golf Ball | freeze juice | B (syringe.png local) |
| Fries | fry darts | B (fry.png local) |
| Gelatin | STEAKHOUSE set and sign, jelly | B |
| Nickel | static storm | B |
| Barf Bag | sick cloud | B |
| Basketball | balls, HOOP | B (basketball.png local) |
| Bell | rings | B |
| Bracelety | ICY sign | A (sign.png) |
| Gaty | gate slam | C |
| Grassy | blades, tree | C / B |
| Liy | blast | B |
| Lollipop | sticky patch | B (candy.png local) |
| Marker | ink | B (inkball.png local) |
| Money | coin bags | C / B |
| Naily | nails | B (nail.png local) |
| Pillow | feather rings, journal, pincers | B (journal checked and rejected before) |
| Remote | battery | A (battery.png) |
| Rose | thorns | B |
| Taco | jawbreaker | A (jawbreaker.png) |
| TV | Robotic Spider | A (tvspider.png) |
| Woody | splinters | B (woodchip.png local) |
| Toothpaste | paste | B (toothpaste.png local) |
| David | ring | B |
| Firey Jr. | sparks | B |
| Fern | vines | C / B |
| Ruler | straight edge, PROTRACTOR (design) | B (measure.png local) |
| Sidewalky | slab | B |
| Yellow Face | metal box, stickers | B |
| Loser | chamber | B (losercage.png local) |
| Paintbrush | paint drops, waves | B (paintbomb.png local) |
| Balloony | air jet | B |
| Roboty | antennas | B |
| Profily | CACTUS | B |
| Tree | branches | B (branch.png local) |
| Cake | slices, candle, tosser, pan | A tosser, B rest (pan checked: no file) |
| Donut | wheel, Earth | B (oneearth.png local) |
| Balloon | tirade ring | B |
| Bomb | blast | B |
| Knife | bag of tricks | B |
| Lightbulb | flash, socket (design) | B (shimmerorb.png local) |
| Taco (II) | lemons, arms | B (lemon.png local) |
| Marshmallow | scream, saw blade (design) | B (sawblade.png local) |
| Apple | pencils | B (pencil.png local) |
| Baseball | ground pound | B |
| Pickle | pickle | B |
| Nickel (II) | zinger bubbles | B |
| Paper | PIANOS | B (piano.png local) |
| Microphone | speakers, shout | B |
| Salt | shaker, grains | B |
| Test Tube | glass | B |
| Box | the box | B |
| Trophy | CAMERA | B |
| Goo | engulf pool | B |
| Lifering | whistle, sprint | B (shark.png is his other move) |
| Bonesaw | cuts | B |
| Spikey | spikes | B (spike.png local) |
| Candle | tuning fork, crystals | B |
| Cammy | lens, flash | B |
| Cheesy | soccer balls | B (soccerball.png local) |
| Dough | purgatory mansion, wordplay | B |
| Fan | blade charge | B |
| Soap | lather, vacuum | B (vacuum.png, cloth.png local) |
| Tissues | snot | B (snot.png local) |
| Yin-Yang | Yin rolls | B (yin.png local) |
| Starfruit | bandmates, mic | B (sl*.png five bandmates local) |
| Blueberry | palanquin (checked: only episode shots) | C figure, B palanquin |
| Cherries | oil, rock | B (oliveoil.png, marsrock.png local) |
| Clover | butterflies, hammer | A butterflies |
| Jack | handcuffs, cards | B (pager.png local) |
| Magnet | poles | B |
| MeTag | walls, logo | B |
| Poppy | PAN, kernels, copies | B (ghostvacuum.png, capturepod.png local) |
| Silver Spoon | gold | B (immunitycookie.png local) |
| Tapey | tape, speaker | B |
| Tea Kettle | hug, boil | B (horstray.png local) |
| Teddy Bear | table, plate, TV, paint gun | B (paintball.png local) |
| Bot | stilt leg | B |
| Eraser | giant eraser | C |
| 8-Ball, Spongy, Black Hole, Clock, Cloudy, Pie | event kits | not traced |

Tally (about 96 fighters, one hero prop each, event kits excluded): A (show picture) 9 (Leafy, Pencil, Bracelety, Remote, Taco, TV, and partly Cake, Clover, Flower); C (own sprite as hero) 8; B (drawn) about 79, of which about 50 already have a matching local show picture (needs wiring, not a download).

## STEP 2: show pictures found (nothing downloaded)

Wikis: BFDI = battlefordreamisland.fandom.com, II = inanimateinsanity.fandom.com. Fetch with `format=original` (as the Rush vetting did). Bytes are the wiki's imageinfo sizes. "object" = the prop alone, no face; "character" = a face and limbs.

### DOWNLOAD LIST (the owner OKs each batch by name)

#### Batch 1: the big, loud props (8 files)
| Fighter / prop | Wiki | File title | px | bytes | mime | object or character | confidence |
|---|---|---|---|---|---|---|---|
| Gelatin / steakhouse sign (neon sign of his set) | BFDI | File:SteakhouseSign.png | 1016x416 | 350,774 | image/png | object (logo sign "gelatin's STEAKHOUSE") | high |
| Poppy / the frying pan | BFDI | File:Pan new asset 2020 (2).png | 800x235 | 28,208 | image/png | object (side-on pan, handle right) | high |
| Lightning / the furnace | BFDI | File:Metal Furnace (BFDI 23 and 24).png | 5081x2418 | 164,972 | image/png | object ("METAL FURNACE" on it); alt File:Metal Furnace.png 2200x1000, 52,318 | high |
| Lightning / the house | BFDI | File:Other House.png | 2881x2221 | 176,308 | image/png | object (orange roof, chimney) | medium: I could not confirm it is THE house of that scene; File:Giant House.png (2057x1693, 166,162) is a smiling character house, not suitable |
| Tennis Ball / trebuchet | BFDI | File:Tennis Ball's Trebuchet.png | 8192x7266 | 539,821 | image/png | object (huge: scale down) | high |
| Basketball / hoop | BFDI | File:Basketball Hoop.png | 3256x6930 | 284,195 | image/png | object (pole and backboard) | high |
| Basketball / net | BFDI | File:Basketball Net.png | 1715x1446 | 100,947 | image/png | object (white net) | medium (optional, pairs with the hoop) |
| Pin / red balloon | BFDI | File:RedBalloon.png | 869x1105 | 10,994 | image/png | object | medium-high (alt File:Balloon asset.png, 1138x1111, 149,643, a pink-orange balloon) |

#### Batch 2: smaller props (8 files)
| Fighter / prop | Wiki | File title | px | bytes | mime | object or character | confidence |
|---|---|---|---|---|---|---|---|
| Teddy Bear / the TV in the rage room | BFDI | File:Television's asset.png | 987x814 | 138,423 | image/png | object (blank black CRT, no face) | high |
| Coiny / the monitor | BFDI | File:Monitor (BFB 16).png | 2151x1236 | 484,361 | image/png | object (small monitor, no face, lots of empty margin) | medium-high (File:Monitor.png is the character with legs and a face: no) |
| Money / money bag | BFDI | File:Money bag.png | 494x512 | 7,003 | image/png | object (sack with $) | high |
| Book / the quill | BFDI | File:Quill pen in color asset.png | 414x1090 | 201,323 | image/png | object (feather quill) | high |
| Ruler / protractor | BFDI | File:Protractor (BFB 23).png | 1173x1667 | 105,811 | image/png | object (pale, faint) | medium-high |
| Profily / cactus | BFDI | File:Cactus (BFB 27).png | 1022x1606 | 29,023 | image/png | object (no face) | high |
| Flower / hand mirror | BFDI | File:Mirror(tpot20).png | 1098x879 | 223,500 | image/png | object (gilt frame, no face) | medium (the game's mirror is a hand mirror; this one is a wall frame) |
| Trophy / camera | BFDI | File:Camera-side.png | 1411x1101 | 125,816 | image/png | object (black camera, side view) | medium |

#### Batch 3: weak or optional (4 files, I would skip unless wanted)
| Fighter / prop | Wiki | File title | px | bytes | mime | object or character | confidence |
|---|---|---|---|---|---|---|---|
| Pillow / pincers (closest) | BFDI | File:Claw.PNG | 309x397 | 13,522 | image/png | object (claw-machine claw, grey) | low: not red pincers |
| Clover / hammer (closest) | BFDI | File:Hammer (BFB 16).png | 1841x2598 | 521,017 | image/png | object (claw hammer) | low: unsure it is her hammer |
| Box / opened cardboard box | BFDI | File:Opened Cardboard Box (BFB 21).png | 5183x5038 | 378,887 | image/png | object | low: Box's smash uses her own sprite |
| Dough / mansion | II | File:Purgatory Mansion Day.png | 716x392 | 340,157 | image/png | scene with sky, NOT a clean object | low: only if the owner accepts a cut-out |

No download needed (the game already holds the picture; just wire the Final Smash to it): Pencil's van for Match's Van lane, chair.png for Bow, piano.png for Paper, sawblade.png for Saw and Marshmallow, soccerball.png, tennisball.png, basketball.png (balls), nail.png, gem.png, measure.png, syringe.png, fry.png, book.png, snot.png, yin.png, vacuum.png, losercage.png, tpot7bolt.png for Lightning's bolt, the five Spoiled Lemon bandmates for Starfruit, ghostvacuum.png and capturepod.png for Poppy. (File:Piano.png on the BFDI wiki has a WHITE background, 1740x1056: worse than the local piano.png.)

### NONE FOUND (and the closest, with why not)
- Cake's pan, Blueberry's palanquin, Pillow's journal: already rejected by the owner's earlier check.
- Lightning's storm cloud: closest File:Storm Cloud pose.png (BFDI), a character with a face.
- Gelatin's steakhouse BUILDING: File:Steakhouse logoless.png (488x201) is a scene crop with sky, not a prop.
- Needle's horseshoe magnet / Magnet's poles: File:Magnet.png (770x636) is the Magnet character.
- Salt / Fries salt shaker: File:Salt shaker.png (2280x2720) is the Salt character.
- Cherries' olive-oil bottle: File:Olive Oil.png (2781x4482) is the Olive Oil character with a face.
- Microphone's speaker cabinets: File:Speaker.png (610x515) is the Speaker character; II File:Puffball Speaker Box.png is a character.
- Golf Ball's juice box: File:Juice box tpot pose.png is a character; File:Bfb16-juice-box.png is an episode screenshot.
- Jack's handcuffs: File:Needle and Handcuffs.png is a scene; II File:Mephone Handcuffs.png is a character.
- Teddy Bear's table and plate: File:Table.png and File:Plate.png are the characters; paint gun only as the episode shot File:TPOT 24 Paint Gun.png (rejected).
- Candle's tuning fork, Cammy's zoom lens, Yellow Face's metal box, Barf Bag's pitcher, Knife's drawstring sack, Lightbulb's socket (File:Socket.png is a wall outlet), Test Tube, Bonesaw, Fan, Soap's foam: no object file by any searched name.
- Dough's "For Rent" sign: no file.

## What I could not check
- Whether each file is the exact object the scene needs (I judged from thumbnails and names, not the episodes).
- Transparent corners (not tested without a download; the thumbnails sat on a checkerboard and looked clean except Piano.png).
- Fighters 8-Ball, Spongy, Black Hole, Clock, Cloudy, Pie (event kits) and Match's Van.
- Wiki file-usage lists were empty over the API, so "official asset" status is inferred (BFDI Makerr, Reddy2068, and similar uploaders post show assets).
- Only the BFDI wiki produced hits; the II wiki has mostly episode frames and characters.
