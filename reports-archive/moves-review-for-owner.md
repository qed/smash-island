# Moves review for the owner (2026-11-11)

You said: "its okay to reduce the amounts of similar moves, but there are differences". So here a move only counts as a true look-alike if its shape, its effect (pure damage, knockdown, scramble, burn, root, stun, freeze, heal, reflect...) and its rough numbers all match another move. This list covers every move changed by Unique Moves batches 1 to 5 and by the Sky-Drop Smashes removal. Strike any line you want put back; the last column says what I think.

Read-only audit: nothing in the game was edited. "Old" is what is live now; "new" is what is on the working branch.

## Summary

| Verdict | Moves | Meaning |
|---|---|---|
| TRUE DUPLICATE | 164 | same shape, same effect, similar numbers as another move: the change is justified |
| DIFFERENT EFFECT | 13 | the old move did something no look-alike did: revert candidates |
| SKY DROP | 9 | the old smash fell from the sky: replaced by your no-sky-drop rule (Blocky's anvil is held, unchanged) |
| TWEAK ONLY | 2 | only landing timing changed; not a look-alike change |
| Total | 188 | |

### Revert candidates (DIFFERENT EFFECT)

- **Cammy** forward air: Flash Bang (circle round the body; stun) was changed to Flash Bang. no other move with the same shape, same effect and similar damage was found in the live game; audit named: Pencil Lead Thrust; Marker Long Stroke; Knife Lunge; same name, numbers/shape retuned
- **Match** up tilt: Head Flick (fan/arc swing; burn) was changed to Strike Up. no other move with the same shape, same effect and similar damage was found in the live game; audit named: Puffball Pop-Up; Bow Chair Lift; Pencil Eraser Up; David Hands Up
- **Rocky** down air: Rockfall (straight poke/line; poison) was changed to Sit Down. no other move with the same shape, same effect and similar damage was found in the live game; audit named: Bow Chair Drop; Blocky Anvil Drop; Pin Pin Drop; Flower Root Down
- **Knife** smash: Blade Rush (dash through the foe; strips armour) was changed to Caltrops. Only dash-through that strips armour in the game
- **Gaty** smash: Mirror Field (lunge forward; strips armour) was changed to Gate Swing. Only lunge in the game that strips armour; the shape (lunge) is common but the effect is not
- **Ruby** smash: Prism Burst (instant long beam (900 px); burns) was changed to Facet Flick (batch 4 first made Facet Fall, a sky drop). **Ruby: already being restored.** RUBY: already being restored. Only beam+burn in the game. (Code says burn; the owner remembers pure damage.)
- **Fern** smash: Full Bloom (burst round her; drains health) was changed to Root Burst. Only draining smash in the game
- **Barf Bag** smash: Acid Reflux (burst round her; poisons) was changed to Acid Reflux. Only poisoning burst in the game
- **Pin** smash: Pin Avalanche (dash through the foe; bleeds) was changed to Pushpin. Only dash-through that bleeds
- **Firey Jr.** up special: Spark Hop (hop and fire a spark; spark strips armour) was changed to Fire Whirl. 
- **Gelatin** down special: Freeze Mine (mine on the floor; freezes) was changed to Jelly Bounce. 
- **Taco (II)** neutral special: Lemon Spit (lob in an arc; slows) was changed to Lemon Squirt. 
- **Apple** neutral special: Pencil Throw (one flat piercing pencil; pure damage) was changed to Pencil Pair. 

### Other things to look at

- **New moves that now look like each other** (flagged in the last column of the tables): Leafy's and Starfruit's new smashes (volley + knockdown); Ruby's and Match's (volley + burn); Lifering's, Clover's and Fanny's (floor-walker + knockdown); Basketball's and Fan's (leap + knockdown); Knife's and Pin's (mine + bleed); Fern's and Tree's (plant + root); Cheesy's, Ruler's and Point Blank Earful's (beam + weaken); Paper's and Grassy's (walk + root); Coiny's Spare Change and Ruby's Shard Spray (3 bouncing bits).
- **No new sky drops.** The only sky-dropping smash left is Blocky's anvil (held for your OK).
- Leafy's and Ruby's smashes: the live ones were not sky drops. Batches 3 and 4 made them sky drops, and the sky-drop pass turned them into volleys. Ruby's live smash was the only beam that burns.
- **How I judged batches 1 and 2** (tilts and air attacks): shape, effect and damage compared against every other live tilt/air move, not just the four examples in the old audit, so some partners differ from the old audit's. The match is by hit shape and effect, not by the animation.
- Cake's partner (Money's heal) could not be confirmed in the code, and Soap's and Loser's moves carry a small extra (a heal); I marked those borderline.

## Fighter by fighter

### Goo

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Goo Geyser**: straight poke/line; pure damage; dmg 4.8 / launch 10.4 | **Sticky Lift**: circle round the body; slow; dmg 5 / launch 7 | Pin Hop and Point | TRUE DUPLICATE |  |
| down tilt | **Goo Snag**: straight poke/line; slow; dmg 4.3 / launch 7 | **Puddle Poke**: straight poke/line; pure damage; dmg 4.5 / launch 5.9 | Ink Slide (side, 4.2) (twin found by shape+effect+damage search, not in the audit's first four examples: Ink Slide (side, 4.2); Salt Slide (side, 4.3); Ink Blot (dt, 3.4)) | TRUE DUPLICATE |  |
| neutral air | **Splatter**: circle round the body; pure damage; dmg 3.2 / launch 2.9 | **Slime Arc**: fan/arc swing; pure damage; dmg 5 / launch 5.8 | Snowball Roll Out | TRUE DUPLICATE |  |
| forward air | **Goo Glob**: straight poke/line; pure damage; dmg 6.6 / launch 4.1 | **Long Reach**: straight poke/line; pure damage; dmg 6.5 / launch 5.2 | Snowball Snow Slam | TRUE DUPLICATE |  |
| back air | **Splat Back**: circle round the body; pure damage; dmg 8.2 / launch 9.5 | **Slime Wall**: fan/arc swing; pure damage; dmg 9.5 / launch 11 | Pillow Rear Cushion | TRUE DUPLICATE |  |
| up air | **Stretch Up**: straight poke/line; pure damage; dmg 4.7 / launch 9 | **Stretch Up**: straight poke/line; pure damage; dmg 5.5 / launch 8.4 | Bomby Rocket Jump (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| down air | **Drip Drop**: straight poke/line; pure damage; dmg 8 / launch 8.6 | **Goo Anchor**: straight poke/line; pure damage; dmg 9.5 / launch 9.2 | Snowball Avalanche | TRUE DUPLICATE |  |

### Box

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Lid Lift**: fan/arc swing; pure damage; dmg 5 / launch 10.6 | **Lid Flip**: fan/arc swing; pure damage; dmg 6 / launch 8 | Pencil Eraser Up | TRUE DUPLICATE |  |
| down tilt | **Corner Scoot**: straight poke/line; pure damage; dmg 4.2 / launch 7.2 | **Corner Jab**: circle round the body; pure damage; dmg 4 / launch 6.7 | Leafy Slide Kick | TRUE DUPLICATE |  |
| neutral air | **Tumble Pack**: circle round the body; pure damage; dmg 3.6 / launch 3 | **Tumble**: straight poke/line; pure damage; dmg 6 / launch 3.9 | Snowball Roll Out | TRUE DUPLICATE |  |
| forward air | **Parcel Post**: straight poke/line; pure damage; dmg 7.4 / launch 4.2 | **Parcel Shove**: straight poke/line; pure damage; dmg 8 / launch 5.7 | Snowball Snow Slam | TRUE DUPLICATE |  |
| back air | **Return to Sender**: straight poke/line; pure damage; dmg 8.4 / launch 9.5 | **Return to Sender**: circle round the body; pure damage; dmg 10 / launch 10.7 | Match Stick Sweep (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| up air | **Lid Pop**: straight poke/line; pure damage; dmg 4.8 / launch 8.8 | **Lid Pop**: fan/arc swing; pure damage; dmg 5.5 / launch 8.7 | Ice Cube Frozen Crown (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| down air | **Heavy Freight**: straight poke/line; pure damage; dmg 9 / launch 9.2 | **Heavy Freight**: fan/arc swing; pure damage; dmg 9 / launch 8.7 | Snowball Avalanche (same name, numbers/shape retuned) | TRUE DUPLICATE |  |

### Lifering

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Ring Lift**: fan/arc swing; pure damage; dmg 4.8 / launch 10.6 | **Ring Toss**: circle round the body; pure damage; dmg 5 / launch 8.8 | Rocky Pebble Pop | TRUE DUPLICATE |  |
| down tilt | **Hook Trip**: straight poke/line; pure damage; dmg 5.9 / launch 7.4 | **Line Hook**: straight poke/line; pure damage; dmg 5 / launch 6.6 | Leafy Slide Kick | TRUE DUPLICATE |  |
| neutral air | **Ring Spin**: circle round the body; pure damage; dmg 3.5 / launch 3 | **Ring Whirl**: fan/arc swing; pure damage; dmg 4.5 / launch 4.7 | Pencil Spin Stick | TRUE DUPLICATE |  |
| forward air | **Lifeline Lash**: straight poke/line; pure damage; dmg 7 / launch 4.2 | **Lifeline Lash**: straight poke/line; pure damage; dmg 7 / launch 4.5 | Pin Prick Flurry (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| back air | **Float Back**: circle round the body; pure damage; dmg 8.9 / launch 9.5 | **Buoy Swing**: fan/arc swing; pure damage; dmg 9.5 / launch 10.9 | Bomb Rear Pop | TRUE DUPLICATE |  |
| up air | **Buoy Up**: straight poke/line; pure damage; dmg 6.6 / launch 9 | **Whistle Bob**: straight poke/line; pure damage; dmg 6 / launch 8.6 | Ice Cube Frozen Crown | TRUE DUPLICATE |  |
| down air | **Dive In**: straight poke/line; pure damage; dmg 8.4 / launch 8.6 | **Dive In**: straight poke/line; pure damage; dmg 8 / launch 6.8 | Leafy Heel Drop (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| smash | **Called in a Favor**: shark dropped from sky; knocks down; 16 / launch 12 | **Called in a Favor**: shark swims straight out; knocks down; 16 / launch 12 | (no duplicate claim) (effect and numbers kept) | SKY DROP | Walk+knockdown same as Clover, Fanny |

### Balloon

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Helium Hoist**: fan/arc swing; pure damage; dmg 4.1 / launch 10.5 | **Knot Flick**: circle round the body; pure damage; dmg 4 / launch 8.7 | Coiny Backhand Rise | TRUE DUPLICATE |  |
| down tilt | **Squeak Sweep**: straight poke/line; pure damage; dmg 3.2 / launch 6.9 | **Squeak Sweep**: fan/arc swing; pure damage; dmg 3.5 / launch 6.9 | Pen Nib Tap (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| neutral air | **Balloon Spin**: circle round the body; pure damage; dmg 3 / launch 2.9 | **Puff Up**: circle round the body; pure damage; dmg 3 / launch 3.6 | Snowball Roll Out | TRUE DUPLICATE |  |
| forward air | **Prize Punch**: straight poke/line; pure damage; dmg 5.6 / launch 3.7 | **Prize Punch**: fan/arc swing; pure damage; dmg 5.5 / launch 4 | Pen Click-Click (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| back air | **Back Bounce**: straight poke/line; pure damage; dmg 6.8 / launch 8.6 | **Back Bounce**: straight poke/line; pure damage; dmg 8.5 / launch 10.3 | Ice Cube Icicle Kick (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| up air | **Buoyant Rise**: straight poke/line; pure damage; dmg 3.8 / launch 8.6 | **Buoyant Rise**: circle round the body; pure damage; dmg 4 / launch 8.8 | Needle Rising Stitch (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| down air | **Deflate Drop**: straight poke/line; pure damage; dmg 6.5 / launch 8.2 | **Deflate Drop**: straight poke/line; pure damage; dmg 6 / launch 6.7 | Tennis Ball Ace Drop (same name, numbers/shape retuned) | TRUE DUPLICATE |  |

### Tissues

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Wipe Up**: fan/arc swing; pure damage; dmg 4.6 / launch 10.6 | **Sneeze Up**: straight poke/line; pure damage; dmg 6.5 / launch 10.4 | Rocky Pebble Pop | TRUE DUPLICATE |  |
| down tilt | **Sniffle Trip**: straight poke/line; pure damage; dmg 4.1 / launch 7.2 | **Snot Trail**: straight poke/line; slow; dmg 3.8 / launch 4.8 | Leafy Slide Kick | TRUE DUPLICATE |  |
| neutral air | **Achoo Spin**: circle round the body; pure damage; dmg 3.1 / launch 2.9 | **Sneeze Cloud**: circle round the body; pure damage; dmg 5 / launch 4.1 | Leafy Leaf Spin | TRUE DUPLICATE |  |
| forward air | **Sneeze Blast**: straight poke/line; pure damage; dmg 6.4 / launch 4.2 | **Sneeze Blast**: straight poke/line; pure damage; dmg 6.5 / launch 5.6 | Pin Prick Flurry (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| back air | **Backwards Achoo**: circle round the body; pure damage; dmg 9.4 / launch 9.5 | **Backwards Achoo**: circle round the body; pure damage; dmg 9.6 / launch 10.8 | Bomb Rear Pop (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| up air | **Sneeze Up**: straight poke/line; pure damage; dmg 7.6 / launch 9 | **Slow Wipe**: fan/arc swing; pure damage; dmg 5.5 / launch 7.2 | Ice Cube Frozen Crown | TRUE DUPLICATE |  |
| down air | **Blow Down**: straight poke/line; pure damage; dmg 8.6 / launch 8.6 | **Blow Down**: straight poke/line; pure damage; dmg 7.5 / launch 6.6 | Leafy Heel Drop (same name, numbers/shape retuned) | TRUE DUPLICATE |  |

### Yin-Yang

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Yin Rise**: fan/arc swing; pure damage; dmg 6.1 / launch 10.8 | **Yin Roll-Over**: fan/arc swing; pure damage; dmg 6 / launch 8.7 | Pencil Eraser Up | TRUE DUPLICATE |  |
| down tilt | **Balance Sweep**: straight poke/line; pure damage; dmg 6.3 / launch 7.4 | **Yin Roll-Out**: straight poke/line; pure damage; dmg 5 / launch 6.9 | Leafy Slide Kick | TRUE DUPLICATE |  |
| neutral air | **Balance Spin**: circle round the body; pure damage; dmg 3.6 / launch 3 | **Split Apart**: straight poke/line; pure damage; dmg 6 / launch 5.4 | Snowball Roll Out | TRUE DUPLICATE |  |
| forward air | **Yang Strike**: straight poke/line; pure damage; dmg 7.3 / launch 4.4 | **Yang Haymaker**: straight poke/line; pure damage; dmg 9 / launch 10.1 | Pen Click-Click | TRUE DUPLICATE |  |
| back air | **Yin Kick**: straight poke/line; pure damage; dmg 9.6 / launch 9.7 | **Yin Heel**: straight poke/line; pure damage; dmg 7 / launch 9.4 | Pen Clip Back | TRUE DUPLICATE |  |
| up air | **Through Up**: straight poke/line; pure damage; dmg 5.1 / launch 9 | **Yin Lob**: circle round the body; pure damage; dmg 5.5 / launch 8.8 | Ice Cube Frozen Crown | TRUE DUPLICATE |  |
| down air | **Yang Drop**: straight poke/line; pure damage; dmg 8.4 / launch 9 | **Yang Drop**: straight poke/line; pure damage; dmg 9 / launch 9.1 | Snowball Avalanche (same name, numbers/shape retuned) | TRUE DUPLICATE |  |

### Snowball

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Snow Scoop**: fan/arc swing; pure damage; dmg 6 / launch 11 | **Snow Heave**: fan/arc swing; pure damage; dmg 7 / launch 10.6 | David Hands Up | TRUE DUPLICATE |  |
| down tilt | **Drift Under**: straight poke/line; pure damage; dmg 4.6 / launch 7.4 | **Snow Boulder**: circle round the body; pure damage; dmg 6 / launch 7.1 | Blocky Trip Block | TRUE DUPLICATE |  |
| neutral air | **Roll Out**: circle round the body; pure damage; dmg 3.8 / launch 3.2 | **Snow Spin**: circle round the body; pure damage; dmg 4 / launch 3.2 | Leafy Leaf Spin | TRUE DUPLICATE |  |
| forward air | **Snow Slam**: straight poke/line; pure damage; dmg 9.6 / launch 4.7 | **Snow Slam**: straight poke/line; pure damage; dmg 9.5 / launch 5.4 | Bomby Cannonball (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| back air | **Snow Slump**: circle round the body; pure damage; dmg 10.2 / launch 10.1 | **Snow Fling**: fan/arc swing; pure damage; dmg 10.5 / launch 10.8 | Goo Splat Back | TRUE DUPLICATE |  |
| up air | **Snow Plume**: straight poke/line; pure damage; dmg 6 / launch 8.6 | **Snow Plume**: straight poke/line; pure damage; dmg 6.5 / launch 10.6 | Roboty Beep Up (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| down air | **Avalanche**: straight poke/line; pure damage; dmg 9.5 / launch 7.8 | **Avalanche**: straight poke/line; pure damage; dmg 9.5 / launch 7.3 | Ruby Gem Drop (same name, numbers/shape retuned) | TRUE DUPLICATE |  |

### Teardrop

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Droplet Rise**: straight poke/line; pure damage; dmg 4.4 / launch 10.8 | **Droplet Pop**: straight poke/line; pure damage; dmg 4.2 / launch 8.6 | Toothpaste Paste Plume | TRUE DUPLICATE |  |
| down tilt | **Puddle Trip**: straight poke/line; pure damage; dmg 3.4 / launch 7.2 | **Puddle Slip**: fan/arc swing; pure damage; dmg 3.5 / launch 6.6 | Pen Nib Tap | TRUE DUPLICATE |  |
| neutral air | **Drizzle Spin**: circle round the body; pure damage; dmg 2.6 / launch 2.9 | **Drizzle Whirl**: fan/arc swing; pure damage; dmg 3.8 / launch 3.7 | Snowball Roll Out | TRUE DUPLICATE |  |
| forward air | **Tail Slash**: straight poke/line; pure damage; dmg 5.6 / launch 3.7 | **Tail Slash**: straight poke/line; pure damage; dmg 5.5 / launch 3.2 | Pen Click-Click (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| back air | **Rear Splash**: straight poke/line; pure damage; dmg 7.2 / launch 9 | **Heel Snap**: straight poke/line; pure damage; dmg 8.5 / launch 11.2 | Ice Cube Icicle Kick | TRUE DUPLICATE |  |
| up air | **Rain Up**: straight poke/line; pure damage; dmg 4.2 / launch 8.6 | **Rain Up**: straight poke/line; pure damage; dmg 4 / launch 8.2 | Ice Cube Frozen Crown (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| down air | **Falling Drop**: straight poke/line; pure damage; dmg 6.9 / launch 8.8 | **Falling Drop**: fan/arc swing; pure damage; dmg 6.5 / launch 8.6 | Ice Cube Drop Chill (same name, numbers/shape retuned) | TRUE DUPLICATE |  |

### Starfruit

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Star Point Up**: fan/arc swing; pure damage; dmg 5.7 / launch 10.6 | **Point Up**: straight poke/line; pure damage; dmg 6 / launch 8.6 | Coiny Backhand Rise | TRUE DUPLICATE |  |
| down tilt | **Has-Been Trip**: straight poke/line; pure damage; dmg 3.7 / launch 7.2 | **Has-Been Sweep**: fan/arc swing; pure damage; dmg 4.5 / launch 6.7 | Pen Nib Tap | TRUE DUPLICATE |  |
| neutral air | **Star Spin**: circle round the body; pure damage; dmg 3.3 / launch 2.9 | **Five Points**: fan/arc swing; pure damage; dmg 4.8 / launch 4.7 | Leafy Leaf Spin | TRUE DUPLICATE |  |
| forward air | **Spotlight Slam**: straight poke/line; pure damage; dmg 6.5 / launch 4.1 | **Star Spike**: straight poke/line; pure damage; dmg 8.5 / launch 9.2 | Pen Click-Click | TRUE DUPLICATE |  |
| back air | **Paparazzi Push**: circle round the body; pure damage; dmg 9.3 / launch 9.3 | **Backstage Shove**: straight poke/line; pure damage; dmg 7 / launch 7.5 | Bomb Rear Pop | TRUE DUPLICATE |  |
| up air | **Shooting Star**: straight poke/line; pure damage; dmg 4.7 / launch 9 | **Shooting Star**: straight poke/line; pure damage; dmg 5 / launch 8.5 | Ice Cube Frozen Crown (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| down air | **Falling Star**: straight poke/line; pure damage; dmg 7.3 / launch 8.6 | **Falling Star**: fan/arc swing; pure damage; dmg 7 / launch 8.4 | Leafy Heel Drop (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| smash | **Spoiled Lemon, Reunited**: 5 drops from sky; knocks down; 9 x5 / launch 10 | **Spoiled Lemon, Reunited**: 5 lemons in a fan; knocks down; 9 x5 / launch 10 | (no duplicate claim) (effect and numbers kept) | SKY DROP | Volley+knockdown same as Leafy's new smash |

### Cammy

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Tripod Up**: fan/arc swing; pure damage; dmg 4.3 / launch 10.6 | **Flash Above**: circle round the body; pure damage; dmg 5 / launch 8.7 | Coiny Backhand Rise | TRUE DUPLICATE |  |
| down tilt | **Strap Trip**: straight poke/line; pure damage; dmg 3.9 / launch 7.2 | **Strap Whip**: straight poke/line; pure damage; dmg 4.5 / launch 5.5 | Pen Nib Tap | TRUE DUPLICATE |  |
| neutral air | **Shutter Spin**: circle round the body; pure damage; dmg 3.7 / launch 2.9 | **Shutter Click**: straight poke/line; pure damage; dmg 5 / launch 3.8 | Leafy Leaf Spin | TRUE DUPLICATE |  |
| forward air | **Flash Bang**: circle round the body; stun; dmg 5.8 / launch 3.7 | **Flash Bang**: circle round the body; stun; dmg 5.5 / launch 3.8 | Pencil Lead Thrust; Marker Long Stroke; Knife Lunge (no other move with the same shape, same effect and similar damage was found in the live game; audit named: Pencil Lead Thrust; Marker Long Stroke; Knife Lunge; same name, numbers/shape retuned) | DIFFERENT EFFECT - REVERT? |  |
| back air | **Rear Flash**: circle round the body; pure damage; dmg 7 / launch 9 | **Rear Flash**: circle round the body; pure damage; dmg 7 / launch 8.7 | Balloony Rear Leak (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| up air | **Pop-Up Flash**: straight poke/line; pure damage; dmg 4.5 / launch 8.8 | **Pop-Up Flash**: circle round the body; pure damage; dmg 8.5 / launch 11 | Ice Cube Frozen Crown (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| down air | **Photo Drop**: straight poke/line; pure damage; dmg 7.2 / launch 8.4 | **Photo Drop**: circle round the body; pure damage; dmg 7 / launch 6.6 | Leafy Heel Drop (same name, numbers/shape retuned) | TRUE DUPLICATE |  |

### Fries

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Fry Flick Up**: straight poke/line; pure damage; dmg 4.3 / launch 10.4 | **Fry Fountain**: straight poke/line; pure damage; dmg 4.5 / launch 8.8 | Needle Darning Rise | TRUE DUPLICATE |  |
| down tilt | **Low Fry**: straight poke/line; pure damage; dmg 3.5 / launch 7.1 | **Fry Sweep**: fan/arc swing; pure damage; dmg 3.5 / launch 5.4 | Pen Nib Tap | TRUE DUPLICATE |  |
| neutral air | **Carton Spin**: circle round the body; pure damage; dmg 2.5 / launch 2.9 | **Fry Scatter**: straight poke/line; pure damage; dmg 2.3 / launch 5.4 | Leafy Leaf Spin | TRUE DUPLICATE |  |
| forward air | **Fry Volley**: straight poke/line; pure damage; dmg 5.8 / launch 3.7 | **Fry Skewer**: straight poke/line; pure damage; dmg 5.2 / launch 4.8 | Needle Thread Thrust | TRUE DUPLICATE |  |
| back air | **Fry Back**: straight poke/line; pure damage; dmg 7 / launch 9 | **Grease Spit**: circle round the body; pure damage; dmg 7.5 / launch 8.7 | Pen Clip Back | TRUE DUPLICATE |  |
| up air | **Fry Lob**: fan/arc swing; pure damage; dmg 4.5 / launch 8.6 | **Fry Toss**: circle round the body; pure damage; dmg 4.2 / launch 7.9 | Yellow Face Free Sample | TRUE DUPLICATE |  |
| down air | **Fry Plunge**: straight poke/line; pure damage; dmg 6.6 / launch 8.6 | **Fry Rain**: straight poke/line; pure damage; dmg 6 / launch 5.6 | Ice Cube Drop Chill | TRUE DUPLICATE |  |

### Lollipop

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Candy Twirl Up**: fan/arc swing; scramble; dmg 4.5 / launch 10.7 | **Sugar Pop**: circle round the body; scramble; dmg 4.3 / launch 8.8 | Sick Spray Up (ut, 4.4) (twin found by shape+effect+damage search, not in the audit's first four examples: Sick Spray Up (ut, 4.4)) | TRUE DUPLICATE |  |
| down tilt | **Sticky Trip**: straight poke/line; root; dmg 4.2 / launch 7.2 | **Sticky Sweep**: fan/arc swing; root; dmg 3.8 / launch 5.7 | Smear (dt, 3.6) (twin found by shape+effect+damage search, not in the audit's first four examples: Smear (dt, 3.6); Paste Skid (side, 4.9); Cuff-Tap (dt, 4.2)) | TRUE DUPLICATE |  |
| neutral air | **Lick Spin**: circle round the body; pure damage; dmg 2.9 / launch 2.9 | **Sugar Swirl**: fan/arc swing; pure damage; dmg 5 / launch 3.8 | Flower Pollen Whirl | TRUE DUPLICATE |  |
| forward air | **Candy Whack**: straight poke/line; pure damage; dmg 7.2 / launch 4 | **Candy Hook**: fan/arc swing; pure damage; dmg 6.4 / launch 4.3 | Pen Click-Click | TRUE DUPLICATE |  |
| back air | **Stick Back**: straight poke/line; pure damage; dmg 8.6 / launch 9.7 | **Stick Swing**: fan/arc swing; pure damage; dmg 8.2 / launch 9.8 | Pen Clip Back | TRUE DUPLICATE |  |
| up air | **Sweet Spot**: circle round the body; pure damage; dmg 6 / launch 9 | **Sweet Spot**: circle round the body; pure damage; dmg 5.6 / launch 8.6 | Bubble Float Up (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| down air | **Candy Drop**: straight poke/line; root; dmg 8 / launch 6.2 | **Candy Bounce**: circle round the body; root; dmg 7 / launch 6.4 | Pin Drop (da, 9.5) (twin found by shape+effect+damage search, not in the audit's first four examples: Pin Drop (da, 9.5); Paste Drop (da, 7.4); Nail It Down (da, 8.1)) | TRUE DUPLICATE |  |

### Match

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Head Flick**: fan/arc swing; burn; dmg 4 / launch 11 | **Strike Up**: straight poke/line; burn; dmg 3.8 / launch 8.8 | Puffball Pop-Up; Bow Chair Lift; Pencil Eraser Up; David Hands Up (no other move with the same shape, same effect and similar damage was found in the live game; audit named: Puffball Pop-Up; Bow Chair Lift; Pencil Eraser Up; David Hands Up) | DIFFERENT EFFECT - REVERT? |  |
| down tilt | **Stick Poke**: straight poke/line; pure damage; dmg 3.6 / launch 7.6 | **Spark Stamp**: circle round the body; pure damage; dmg 3.4 / launch 6.3 | Leafy Slide Kick | TRUE DUPLICATE |  |
| neutral air | **Spark Spin**: circle round the body; burn; dmg 2.6 / launch 2.9 | **Burning Stick**: straight poke/line; burn; dmg 4 / launch 5.2 | Flicker (na, 2.4) (twin found by shape+effect+damage search, not in the audit's first four examples: Flicker (na, 2.4)) | TRUE DUPLICATE |  |
| forward air | **Head Dive**: straight poke/line; burn; dmg 6 / launch 3.8 | **Head Chop**: fan/arc swing; burn; dmg 6.2 / launch 3.2 | Firey Fireball Punch | TRUE DUPLICATE |  |
| back air | **Stick Sweep**: straight poke/line; pure damage; dmg 7.8 / launch 9.2 | **Flare Back**: circle round the body; pure damage; dmg 7.6 / launch 9.4 | Ice Cube Icicle Kick | TRUE DUPLICATE |  |
| up air | **Flare Up**: straight poke/line; burn; dmg 4.6 / launch 8.4 | **Flame Lick**: circle round the body; burn; dmg 4.4 / launch 8.2 | Cinder Column (ut, 4.6) (twin found by shape+effect+damage search, not in the audit's first four examples: Cinder Column (ut, 4.6); Hothead Rush (side, 5.2); Strike (ft, 4.4)) | TRUE DUPLICATE |  |
| down air | **Match Drop**: straight poke/line; burn; dmg 7.2 / launch 8.2 | **Burnout**: fan/arc swing; burn; dmg 6.8 / launch 7.1 | Fireball Punch (fa, 6.0) (twin found by shape+effect+damage search, not in the audit's first four examples: Fireball Punch (fa, 6.0); Hothead Rush (side, 5.2); Head Dive (fa, 6.0)) | TRUE DUPLICATE |  |
| smash | **Strike Anywhere**: 3 drops from sky; burns; 9 x3 / launch 7 | **Strike Anywhere**: 3 sparks in a fan; burns; 9 x3 / launch 7 | (no duplicate claim) (effect and numbers kept) | SKY DROP | Volley+burn same as Ruby's new smash |

### Naily

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Claw Lift**: fan/arc swing; pure damage; dmg 4.7 / launch 10.8 | **Nail Point**: straight poke/line; pure damage; dmg 4.2 / launch 8.6 | Pencil Eraser Up | TRUE DUPLICATE |  |
| down tilt | **Toe Tack**: straight poke/line; pure damage; dmg 3.7 / launch 7.4 | **Hammer Tap**: circle round the body; pure damage; dmg 3.8 / launch 6.9 | Pen Nib Tap | TRUE DUPLICATE |  |
| neutral air | **Nail Wheel**: circle round the body; pure damage; dmg 2.9 / launch 3 | **Nail Arc**: fan/arc swing; pure damage; dmg 4.6 / launch 6.4 | Leafy Leaf Spin | TRUE DUPLICATE |  |
| forward air | **Hammer Swing**: straight poke/line; pure damage; dmg 7.4 / launch 4.5 | **Claw Rake**: straight poke/line; pure damage; dmg 7.4 / launch 6.4 | Pin Prick Flurry | TRUE DUPLICATE |  |
| back air | **Claw Back**: straight poke/line; pure damage; dmg 7.8 / launch 9.5 | **Hammer Hook**: fan/arc swing; pure damage; dmg 7.6 / launch 8.8 | Pen Clip Back | TRUE DUPLICATE |  |
| up air | **Pin Up**: fan/arc swing; pure damage; dmg 4.6 / launch 8.8 | **Tack Toss**: straight poke/line; pure damage; dmg 4.2 / launch 8.4 | Ruby Sparkle Up | TRUE DUPLICATE |  |
| down air | **Nail It Down**: straight poke/line; root; dmg 8.1 / launch 8.8 | **Tack Drop**: circle round the body; pure damage; dmg 6.5 / launch 5.7 | Pin Drop (da, 9.5) (twin found by shape+effect+damage search, not in the audit's first four examples: Pin Drop (da, 9.5); Paste Drop (da, 7.4); Candy Drop (da, 8.0)) | TRUE DUPLICATE |  |

### Toothpaste

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Paste Plume**: straight poke/line; pure damage; dmg 4.7 / launch 10.6 | **Cap Pop**: circle round the body; pure damage; dmg 4.4 / launch 8.8 | Needle Darning Rise | TRUE DUPLICATE |  |
| down tilt | **Smear**: straight poke/line; root; dmg 3.6 / launch 7.2 | **Long Smear**: straight poke/line; root; dmg 3.4 / launch 6.4 | Sticky Trip (dt, 4.2) (twin found by shape+effect+damage search, not in the audit's first four examples: Sticky Trip (dt, 4.2); Cuff-Tap (dt, 4.2)) | TRUE DUPLICATE |  |
| neutral air | **Squeeze Spin**: circle round the body; pure damage; dmg 2.8 / launch 2.9 | **Side Squirt**: straight poke/line; pure damage; dmg 4.6 / launch 4.8 | Pencil Spin Stick | TRUE DUPLICATE |  |
| forward air | **Glob Punch**: straight poke/line; pure damage; dmg 6.1 / launch 3.8 | **Glob Toss**: circle round the body; pure damage; dmg 5.8 / launch 4.9 | Pen Click-Click | TRUE DUPLICATE |  |
| back air | **Back Squirt**: straight poke/line; pure damage; dmg 7.5 / launch 9.3 | **Squeeze Flip**: fan/arc swing; pure damage; dmg 7.2 / launch 9.8 | Pen Clip Back | TRUE DUPLICATE |  |
| up air | **Tube Up**: straight poke/line; pure damage; dmg 4.6 / launch 8.6 | **Cap Flick**: fan/arc swing; pure damage; dmg 4.2 / launch 6.9 | Ice Cube Frozen Crown | TRUE DUPLICATE |  |
| down air | **Paste Drop**: straight poke/line; root; dmg 7.4 / launch 6 | **Squeeze Out**: straight poke/line; root; dmg 6.6 / launch 5.6 | Pin Drop (da, 9.5) (twin found by shape+effect+damage search, not in the audit's first four examples: Pin Drop (da, 9.5); Candy Drop (da, 8.0); Sticky Skate (side, 5.6)) | TRUE DUPLICATE |  |

### Bomby

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Pop Up**: straight poke/line; pure damage; dmg 6.2 / launch 11.2 | **Fuse Flare**: straight poke/line; pure damage; dmg 5.8 / launch 10.6 | Golf Ball Chip Up | TRUE DUPLICATE |  |
| neutral air | **Blast Ring**: circle round the body; pure damage; dmg 6 / launch 3.9 | **Blast Ring**: circle round the body; pure damage; dmg 5.6 / launch 3.7 | Blueberry Palanquin Swing (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| forward air | **Cannonball**: straight poke/line; pure damage; dmg 9.6 / launch 4.8 | **Shrapnel Burst**: circle round the body; pure damage; dmg 8.8 / launch 4.6 | Flower Stem Swing | TRUE DUPLICATE |  |
| back air | **Back Blast**: circle round the body; pure damage; dmg 10.4 / launch 10.3 | **Back Blast**: circle round the body; pure damage; dmg 9.6 / launch 10 | Donut Rear Roll (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| up air | **Rocket Jump**: straight poke/line; pure damage; dmg 5.6 / launch 8.8 | **Fuse Pop**: straight poke/line; pure damage; dmg 4.6 / launch 8.2 | David Jumpscare Up | TRUE DUPLICATE |  |
| down air | **Bomb Drop**: circle round the body; pure damage; dmg 10.8 / launch 9.6 | **Bomb Drop**: circle round the body; pure damage; dmg 10 / launch 9.2 | Pickle Needle Dive (same name, numbers/shape retuned) | TRUE DUPLICATE |  |

### Rocky

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Pebble Pop**: fan/arc swing; pure damage; dmg 6.1 / launch 11 | **Barf Geyser**: straight poke/line; poison; dmg 5.8 / launch 6.8 | Baseball Pop Fly | TRUE DUPLICATE |  |
| down tilt | **Gravel Spit**: straight poke/line; poison; dmg 5 / launch 7.4 | **Pebble Scatter**: fan/arc swing; poison; dmg 4.6 / launch 6.9 | Puddle Flick (dt, 3.7) (twin found by shape+effect+damage search, not in the audit's first four examples: Puddle Flick (dt, 3.7); Fizz Up (ua, 4.1)) | TRUE DUPLICATE |  |
| neutral air | **Rock Roll**: circle round the body; pure damage; dmg 4.2 / launch 3.2 | **Barf Column**: straight poke/line; poison; dmg 6.4 / launch 5.3 | Flower Pollen Whirl | TRUE DUPLICATE |  |
| forward air | **Boulder Charge**: straight poke/line; pure damage; dmg 9.7 / launch 4.7 | **Boulder Swing**: fan/arc swing; pure damage; dmg 8.8 / launch 5.7 | Bomby Cannonball | TRUE DUPLICATE |  |
| back air | **Back Slam**: straight poke/line; pure damage; dmg 10.4 / launch 10.1 | **Barf Burst**: circle round the body; poison; dmg 9.6 / launch 9.8 | Pin Head Back | TRUE DUPLICATE |  |
| up air | **Rock Up**: fan/arc swing; pure damage; dmg 6.2 / launch 8.6 | **Pebble Spray**: fan/arc swing; pure damage; dmg 5.6 / launch 8.8 | Blueberry Super Strength | TRUE DUPLICATE |  |
| down air | **Rockfall**: straight poke/line; poison; dmg 11.4 / launch 9.5 | **Sit Down**: straight poke/line; poison; dmg 10.8 / launch 8.8 | Bow Chair Drop; Blocky Anvil Drop; Pin Pin Drop; Flower Root Down (no other move with the same shape, same effect and similar damage was found in the live game; audit named: Bow Chair Drop; Blocky Anvil Drop; Pin Pin Drop; Flower Root Down) | DIFFERENT EFFECT - REVERT? |  |

### Firey

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Cinder Column**: straight poke/line; burn; dmg 4.6 / launch 10.5 | **Ember Column**: straight poke/line; burn; dmg 4.4 / launch 4.4 | Hothead Rush (side, 5.2) (twin found by shape+effect+damage search, not in the audit's first four examples: Hothead Rush (side, 5.2); Strike (ft, 4.4); Flare Up (ua, 4.6)) | TRUE DUPLICATE |  |
| down tilt | **Floor Fire**: straight poke/line; pure damage; dmg 3.8 / launch 7.4 | **Fire Line**: straight poke/line; burn; dmg 3.6 / launch 5.2 | Match Stick Poke | TRUE DUPLICATE |  |
| neutral air | **Flicker**: circle round the body; burn; dmg 2.4 / launch 2.6 | **Flame Wheel**: fan/arc swing; burn; dmg 4.4 / launch 5 | Spark Spin (na, 2.6) (twin found by shape+effect+damage search, not in the audit's first four examples: Spark Spin (na, 2.6)) | TRUE DUPLICATE |  |
| forward air | **Fireball Punch**: straight poke/line; burn; dmg 6 / launch 3.8 | **Flame Jet**: circle round the body; burn; dmg 6 / launch 6 | Match Head Dive | TRUE DUPLICATE |  |
| back air | **Backdraft**: straight poke/line; pure damage; dmg 7.5 / launch 9.5 | **Flashover**: straight poke/line; pure damage; dmg 7.2 / launch 9.2 | Match Stick Sweep | TRUE DUPLICATE |  |
| up air | **Hot Head**: straight poke/line; pure damage; dmg 4.3 / launch 8.6 | **Hot Head**: circle round the body; pure damage; dmg 4 / launch 8 | Coiny Rising Slap (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| down air | **Meteor Cinder**: circle round the body; burn; dmg 8 / launch 9 | **Meteor Cinder**: circle round the body; burn; dmg 8 / launch 9 |  (only the end/landing lag changed; not a look-alike change) | TWEAK ONLY |  |

### Blocky

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Block Pop**: circle round the body; pure damage; dmg 6.2 / launch 11.2 | **Block Pop**: circle round the body; pure damage; dmg 6 / launch 6.8 | Sidewalky Curb Lift (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| down tilt | **Trip Block**: straight poke/line; pure damage; dmg 5 / launch 7.6 | **Block Slide**: circle round the body; pure damage; dmg 4.8 / launch 6.7 | Flower Root Whip | TRUE DUPLICATE |  |
| neutral air | **Square Tumble**: straight poke/line; pure damage; dmg 4.4 / launch 3.2 | **Block Spin**: straight poke/line; pure damage; dmg 3.6 / launch 3.4 | Pickle Flurry | TRUE DUPLICATE |  |
| forward air | **Face Plant**: straight poke/line; pure damage; dmg 9.8 / launch 4.8 | **Block Throw**: circle round the body; pure damage; dmg 9 / launch 4.6 | Rocky Boulder Charge | TRUE DUPLICATE |  |
| back air | **Backward Fall**: straight poke/line; pure damage; dmg 10.6 / launch 10.3 | **Topple Back**: fan/arc swing; pure damage; dmg 9.8 / launch 8.6 | Rocky Back Slam | TRUE DUPLICATE |  |
| up air | **Top Corner**: circle round the body; pure damage; dmg 8 / launch 9.5 | **Top Corner**: circle round the body; pure damage; dmg 7.4 / launch 8.6 | Lollipop Sweet Spot (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| down air | **Anvil Drop**: straight poke/line; pure damage; dmg 11.5 / launch 9.6 | **Anvil Drop**: straight poke/line; pure damage; dmg 10.8 / launch 9.4 | Roboty Tank Drop (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| smash | **Anvil Smash**: anvil dropped from sky (shield breaker); knocks down; 16 / launch 10 | **(unchanged)**: ; ;  |  (the owner named it in the shield-breaker design; waiting for OK) | SKY DROP (HELD, not changed) |  |

### Tree

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up tilt | **Canopy Lift**: circle round the body; pure damage; dmg 7.2 / launch 11.5 | **Trunk Stretch**: straight poke/line; pure damage; dmg 6.6 / launch 7.6 | Sidewalky Curb Lift | TRUE DUPLICATE |  |
| down tilt | **Root Trip**: straight poke/line; pure damage; dmg 5.4 / launch 7.6 | **Root Heave**: fan/arc swing; pure damage; dmg 5 / launch 6.4 | Bot Spaggers! | TRUE DUPLICATE |  |
| neutral air | **Leaf Storm**: circle round the body; pure damage; dmg 3.4 / launch 3.4 | **Leaf Whirl**: circle round the body; pure damage; dmg 3 / launch 3.5 | Fern Leaf Blower | TRUE DUPLICATE |  |
| forward air | **Timber Fall**: straight poke/line; pure damage; dmg 11 / launch 5.1 | **Timber Fall**: straight poke/line; pure damage; dmg 10.2 / launch 5.9 | Bow Chair Swing (same name, numbers/shape retuned) | TRUE DUPLICATE |  |
| back air | **Trunk Bump**: straight poke/line; pure damage; dmg 10.8 / launch 10.6 | **Branch Lash**: fan/arc swing; pure damage; dmg 10 / launch 9.8 | Flower Thorn Back | TRUE DUPLICATE |  |
| up air | **Branch Up**: fan/arc swing; pure damage; dmg 6.6 / launch 9 | **Branch Up**: fan/arc swing; pure damage; dmg 6.6 / launch 9 |  (only the end/landing lag changed; not a look-alike change) | TWEAK ONLY |  |
| down air | **Stump Down**: straight poke/line; pure damage; dmg 12.4 / launch 9.8 | **Stump Down**: circle round the body; pure damage; dmg 11.6 / launch 9.6 | Roboty Tank Drop (same name, numbers/shape retuned) | TRUE DUPLICATE |  |

### Leafy

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Shadow Blitz**: dash through the foe; knocks down; 12 / launch 13 | **Leaf Blower (batch 3 first made it Leaf Fall, a sky drop; replaced 11-11)**: 3 leaves blown out of her front in a fan; knocks down; 12 x3 / launch 13 | Basketball, Cheesy, Spikey (all dash-through + knockdown) (The live move was not a sky drop; the sky drop was a batch 3 step that the sky-drop pass undid) | TRUE DUPLICATE | New volley+knockdown also looks like Starfruit's new lemon volley |

### Basketball

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Slam Dunk**: dash through the foe; knocks down; 14 / launch 12 | **Slam Dunk**: hops onto nearest foe and dunks; knocks down; 14 / launch 12 | Leafy, Cheesy, Spikey | TRUE DUPLICATE | Leap+knockdown now shared with Fan's new smash (and Jack) |

### Knife

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Blade Rush**: dash through the foe; strips armour; 13 / launch 12 | **Caltrops**: mine left on the floor ahead; bleeds; 11 / launch 8 | audit said Basketball, Cheesy, Leafy (same dash shape) (Only dash-through that strips armour in the game) | DIFFERENT EFFECT - REVERT? | Mine+bleed would equal Pin's Pushpin if both stay |

### Cheesy

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Why I Oughta**: dash through the foe; knocks down; 16 / launch 14 | **Punchline**: short beam straight ahead (380 px); weakens; 12 / launch 11 | Leafy, Basketball, Spikey | TRUE DUPLICATE | Beam+weaken is the same as Ruler's and Point Blank Earful's (only shorter) |
| up special | **Heckler in the Crowd**: hop up; knocks down; 4-8 | **Cheese Wheel**: spinning wheel, then jump back; slows; 3-5 per hit | Soap, Marshmallow, Apple and many other hop + knockdown | TRUE DUPLICATE | Spin+slow is the same as Bell's up special |

### Soap

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Clean Sweep**: pull foes in, then hit; knocks down; 15 / launch 15 | **Soap Slide**: bar slides along the floor; freezes/ices the first foe; 13 / launch 10.5 | Candle (pull in + knockdown 15/12) | TRUE DUPLICATE |  |
| up special | **It's a Cobweb!**: hop up, heals 30; knocks down + heals; 4-8 | **Slip Away**: blink up/ahead, soap slick left, heals 15; heals + slick; 3 | Cheesy (hop+knockdown); the heal is the only extra | TRUE DUPLICATE (borderline: it also heals) | Warp+heal similar to Bracelety's |

### Gaty

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Mirror Field**: lunge forward; strips armour; 13 / launch 14 | **Gate Swing**: pulls foes in, then hits; strips armour; 13 / launch 14 | audit said lunge-shape partners (Only lunge in the game that strips armour; the shape (lunge) is common but the effect is not) | DIFFERENT EFFECT - REVERT? |  |

### Sidewalky

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Concrete Check**: hop and stomp (leap); stuns; 14 / launch 12.5 | **Slab Down**: roots himself, slab comes down all round; stuns; 14 / launch 12 | Bot (leap + stun 14/13) | TRUE DUPLICATE | Plant+stun is also David's smash shape |
| up special | **Fresh Pavement**: plunge down, leaves wet cement; roots (cement); 9 | **Cement Mixer**: slow armoured spin dragging foes; roots; 3-5 per hit | Gaty, Bonesaw (plunge + root) | TRUE DUPLICATE |  |

### Trophy

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Off the Iceberg**: lunge forward; knocks down; 15 / launch 14 | **Off the Iceberg**: same lunge, longer, sweet at the toe; knocks down; 14 / launch 14 | Apple, Silver Spoon, Clock (lunge + knockdown) (Barely changed) | TRUE DUPLICATE | New move is still a lunge+knockdown like those three: only reach/band differ |
| up special | **Horseplay**: hop up, next hit stronger; knocks down; 5-9 | **Horseplay**: rising knee that pulls in; stuns; 6-10 | Blueberry, Jack, Lifering (hop + knockdown) | TRUE DUPLICATE | Hop+stun is shared with Baseball, Nickel, Bomby |

### Ruby

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Prism Burst**: instant long beam (900 px); burns; 15 / launch 8 | **Facet Flick (batch 4 first made Facet Fall, a sky drop)**: 2 crystals flicked out of her front; burns; 15 x2 / launch 10 | audit said TV, Ruler, Cheesy (beams, but they weaken/scramble/knock down, none burn) (RUBY: already being restored. Only beam+burn in the game. (Code says burn; the owner remembers pure damage.)) | DIFFERENT EFFECT - already being restored | Volley+burn is also Match's new smash |
| down special | **Gem Trap**: floor trap ahead; pure damage; 6 | **Shard Spray**: 3 shards thrown in a fan, bounce; pure damage; 4 each | Fries, Pen, Basketball, Blocky, Lightning (plain floor traps) | TRUE DUPLICATE | Coiny's new Spare Change is the same idea (3 bouncing tossed bits) |

### Loser

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Lunge (no name given)**: lunge forward; knocks down; 16 / launch 13 | **Cold Snap**: ring of chill round him; ices; 13 / launch 11 | Apple, Trophy, Silver Spoon, Clock | TRUE DUPLICATE |  |
| down special | **Heal Up**: armour 50 + heal 8; armour (+small heal); 0 | **Shrug It Off**: clears every status, heals 6, armour 30; cleanses; 0 | Sidewalky, Snowball, Tree (armour 50) | TRUE DUPLICATE (borderline: small heal) |  |

### Fern

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Full Bloom**: burst round her; drains health; 11 / launch 11 | **Root Burst**: roots herself, roots burst up all round; roots foes; 12 / launch 9 | audit named no partner (Only draining smash in the game) | DIFFERENT EFFECT - REVERT? | Plant+root is Tree's smash shape |

### Fanny

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Cyclone**: burst round her; knocks down; 10 / launch 9 | **Cyclone**: whirlwind travelling the floor through everyone; knocks down; 10 / launch 10 | Balloon, Goo, Fan, Spongy (burst + knockdown) | TRUE DUPLICATE | Floor-walker+knockdown is also Lifering's and Clover's new smashes |
| neutral special | **Gust**: charges next Air Blast; pure charge; 0 | **Gust**: charge plus shove foes ahead (170 px); shoves; 0 | Ruby (same charge line) | TRUE DUPLICATE | New one is no longer the same |

### Barf Bag

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Acid Reflux**: burst round her; poisons; 12 / launch 10.5 | **Acid Reflux**: gulps foes in, heaves them out; poisons; 12 / launch 10.5 | audit said Fries (burns), Fan (knocks down) (Only poisoning burst in the game) | DIFFERENT EFFECT - REVERT? |  |
| down special | **Poison Puddle**: one poison puddle; poisons; 2 | **Leaky Bag**: backs away leaking 3 small puddles; poisons; 1 each | Rocky (same puddle) | TRUE DUPLICATE | Still near Rocky's: just 3 smaller puddles |

### Fan

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Nice Save!**: burst round him; knocks down; 13 / launch 13 | **Nice Save!**: leaps onto nearest foe; knocks down; 13 / launch 13 | Balloon, Goo, Spongy, Fanny | TRUE DUPLICATE | Leap+knockdown now shared with Basketball's new smash |

### Pin

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Pin Avalanche**: dash through the foe; bleeds; 15 / launch 10 | **Pushpin**: pushpin mine on the floor; bleeds; 15 / launch 10 | audit said Salt, Needle (dash through, but they weaken/etc.) (Only dash-through that bleeds) | DIFFERENT EFFECT - REVERT? | Mine+bleed equals Knife's new Caltrops |

### Paintbrush

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up special | **Flame Bristles**: hop up; burns; 5-9 | **Pyrokinesis**: blink up/ahead, two burning blobs left; burns; 4 per blob | audit said Knife (bleeds). Real twin: Tea Kettle (hop + burn) | TRUE DUPLICATE |  |

### Blueberry

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up special | **Overhead Press**: hop up, armour 18; knocks down; 5-9 | **Berry Roll**: armoured spin pulling foes in; pulls in (no damage); 0 | Trophy, Jack (hop + knockdown + armour) | TRUE DUPLICATE |  |

### Firey Jr.

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| up special | **Spark Hop**: hop and fire a spark; spark strips armour; 4 | **Fire Whirl**: rising spiral of flame; burns; 2-4 per tick | audit said Fries (his spark slows). No hop+strip-spark partner found | DIFFERENT EFFECT - REVERT? |  |
| down special | **Fire Trap**: small fire on the floor; burns; 3 | **Flare Up**: ring of flame round him; burns; 3 | Firey, Match, Paintbrush (burning floor traps) | TRUE DUPLICATE |  |

### TV

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| neutral special | **Static Burst**: stun ring round him; stuns; 7 | **Scan Lines**: two bars of static shot ahead; pure damage; 5 each | Bell (stun ring 6) | TRUE DUPLICATE |  |
| down special | **Static Brace**: armour 30 + stun ring; stuns; 0 | **Pause**: windup, then pauses nearest foe; roots 34 frames; 0 | Bell (identical code) | TRUE DUPLICATE |  |

### Bell

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| down special | **Brace**: armour 30 + stun ring; stuns; 0 | **Toll**: short armour, then heavy toll; slows everyone near; 0 | TV (identical code) | TRUE DUPLICATE |  |

### Ruler

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| down special | **Precise Counter**: counter stance; counters; 22 frames | **Straight Edge**: held flat, reflects shots; reflects shots; 22 frames | Coiny, Rose, Leafy, Ice Cube (counter stances) | TRUE DUPLICATE | Reflect stance is also Gaty's (44 frames) |

### Gelatin

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| down special | **Freeze Mine**: mine on the floor; freezes; 4 | **Jelly Bounce**: bounces over a foe, sticky blob left; roots; 2 | audit said the common floor trap; no other freezing floor trap exists | DIFFERENT EFFECT - REVERT? | Left blob is a root trap like Lollipop's and Toothpaste's |

### Coiny

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| down special | **Counter**: counter stance; counters; 24 frames | **Spare Change**: 3 coins tossed that bounce; pure damage; 3 each | Ruler, Rose, Leafy, Ice Cube | TRUE DUPLICATE | Same idea as Ruby's Shard Spray |

### Marker

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| down special | **Slowing Puddle**: ink puddle ahead; slows; 3 | **Ink Flick**: blot of ink lobbed in an arc; slows; 5 | Donut (slowing puddle); audit named Toothpaste (roots, different) | TRUE DUPLICATE | Lob+slow like Taco's lemon |

### Pillow

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| down special | **Cushiony Guard**: armour 40; armour only; 0 | **Plump Up**: swells, bounces foes away, armour 14; shoves, no damage; 0 | David, Pin, Pencil (armour only) | TRUE DUPLICATE |  |

### Pencil

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| down special | **Super Armor**: armour 36; armour only; 0 | **Erase**: rubs out enemy shots within 220 px; erases shots; 0 | Pin, Pillow, Grassy (armour only) | TRUE DUPLICATE |  |

### Cake

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| down special | **Recover a Slice**: heal 18% over 100 frames; heals; 0 | **Second Helping**: 6% at once, 12% over 67 frames; heals; 0 | audit said Money; I could not confirm Money's heal in the code (her listed down is a coin volley) | TRUE DUPLICATE (unconfirmed) |  |

### Rose

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| down special | **Counter**: counter stance (28 frames); counters; 28 frames | **Curtsy**: untouchable and rooted 14 frames; invulnerable; 0 | Ice Cube, Coiny, Ruler, Leafy | TRUE DUPLICATE | Invulnerable-dodge like Woody's |

### Taco (II)

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| neutral special | **Lemon Spit**: lob in an arc; slows; 8 | **Lemon Squirt**: short fast straight squirt; slows; 8 | audit said Lightbulb (her lob STUNS and arcs to a second foe, so effect differs) | DIFFERENT EFFECT - REVERT? |  |

### Apple

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| neutral special | **Pencil Throw**: one flat piercing pencil; pure damage; 8 | **Pencil Pair**: two piercing pencils; pure damage; 8 | audit said Firey (his lob BURNS) | DIFFERENT EFFECT - REVERT? | Shape also differs (flat pierce vs lob) |

### Paper

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Eighty-Eight Keys**: piano dropped from sky; roots (clamped 45f); 16 / launch 12 | **Eighty-Eight Keys**: a row of keys slid along the floor; roots (clamped 45f); 16 / launch 12 | (no duplicate claim) (effect and numbers kept) | SKY DROP | Walk+root same as Grassy's |

### Yellow Face

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Flash Sale**: 1 drop from sky; stuns; 16 / launch 11 | **Flash Sale**: flash burst round her; stuns; 16 / launch 11 | (no duplicate claim) (effect and numbers kept) | SKY DROP |  |

### Roboty

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **All Dashes**: 3 drops from sky; scrambles; 11 x3 / launch 8 | **All Dashes**: 3 signal dashes in a fan; scrambles; 11 x3 / launch 8 | (no duplicate claim) (effect and numbers kept) | SKY DROP |  |

### Ice Cube

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Blast Chiller**: 4 drops from sky; freezes; 10 x4 / launch 10 | **Blast Chiller**: 4 ice shards in a fan; freezes; 10 x4 / launch 10 | (no duplicate claim) (effect and numbers kept) | SKY DROP |  |

### Clover

| Slot | Old (live) | New | Copied from | Verdict | New move looks like |
|---|---|---|---|---|---|
| smash | **Lucky Break**: banana peel dropped from sky; knocks down; 13 / launch 13 | **Lucky Break**: peel slides along the floor; knocks down; 13 / launch 13 | (no duplicate claim) (effect and numbers kept) | SKY DROP | Walk+knockdown same as Lifering, Fanny |
