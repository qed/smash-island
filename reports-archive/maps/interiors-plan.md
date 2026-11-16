# Mill-style interiors for the sky and factory maps

**A plan for your approval (2026-10-19). Nothing has been built or changed.**

This covers the buildings you chose:
- **Sky map:** the Skiff, and Cloud City's three towers (the Penthouse, the Grand Hotel and the Observatory).
- **Factory map:** the Works machine hall and its yard buildings, the Neon City buildings, and the rail yard stations.

The flagship was not on your list. There is a question about it in section 4.

This is a big new feature, so under the feature freeze nothing here gets built until you give the go-ahead.

---

## 1. What "like the mill" means

### Today's buildings vs the mill

| | Today's skiff cabin (and every sky/factory building) | The Riverside Mill |
|---|---|---|
| Where it is | A room on the main map | A separate area hidden under the map |
| Going in | Walk through an opening | Stand in the doorway and hold Up. A puff and a door sound, and you are moved inside |
| What you see | The whole map, the same as outside | Only that area. Everything else goes black, and the minimap shows only the area |
| Who sees you | Everyone | Only people in the same area |
| Shots | Fly in and out | Stop at the area's edge |
| Getting out | Walk out | Through exit doors, which can drop you somewhere else |
| Size | One or two rooms | Six rooms, each with its own kind of platforming |

That is why the cabin looked like just a room: it is one.

### How going in works (the mill's rules, kept for every interior)
- **Going in:** stand in a doorway and hold Up for a moment. A jump inside the doorway counts too. You land on the ground inside, your speed and any hitstun are cleared, and there is a short wait before you can use another door.
- **Who can use doors:** either team can use any door, carrying flags and keys through. Knocked-out and jailed fighters cannot.
- **What goes black:** inside, the camera stays within that one area. Fighters outside are hidden from you, and you from them. CPUs ignore enemies who are not in their area.
- **Getting out:** through exit doors. Some come back out where you went in; others drop you somewhere else on that side.

### Which side an interior belongs to
- Each interior sits wholly on one team's half and counts as that team's ground.
  - Only the owners can hide flags there.
  - An enemy knocked out inside goes to the owners' jail.
  - A raider who grabs a flag inside still has to get out and cross the middle line.
- The one exception is **the Underline**, the rail yard subway. Like the mill's great hall, it is cut in two by the middle line, and a carrier who crosses the line inside it captures.

### Rules every interior follows
- **Size:**
  - Most interiors have about 5-6 rooms, like the mill.
  - The three big ones are each a whole small level of about 10 rooms: the sky Grand Hotel, the Works hall and the Neon hotel.
- **Its own trick:** every interior has its own main kind of platforming, and no two are alike.
- **A plain way through:** every room can be crossed using only springs, ledges, slopes, drops, belts, wind and water. That is the route CPUs use.
  - Lifts, cogs, wheels, crumbling ledges, shutters, presses and tides are only shortcuts or timing challenges. None of them is ever the only way.
- **At least two ways out of every interior.** Homes get a clearly marked quick exit; the other exits are tucked among the props, as in the mill.
- **The outside:**
  - Each building becomes a closed shell, with lit windows and arched doors.
  - Its roof can still be stood on.
  - Some roofs today can only be reached by springs inside the building. Those shells get an outside way up instead: a fire escape of ledges, or a roof spring moved outside.
- **Inside, the view changes:** each interior has its own backdrop (wallpaper, stars, planks, tiles and so on).
- **Cover:** cover props for hiding flags are placed by hand in every room.

### Legend for the sketches
```
#  wall/rock     =  ledge (jump up through)   ^  spring      v  drop / hole
>  <  belt or wind   :  updraft or crumbling (named in the room list)
~  water         o @  wheel / cog              |  lift (shortcut)   [ ] shutter
D  door (in, and back out)   E  entrance only   X  exit only   C  cannon
S H  spawns   P  home pad   h  shield boost   b  boost   J  jail   !  jail door
V  vault   L  locked vault door   K  key   y  team buff   F c  cover (flag spot)
%  dark   i _  ice   ,  sticky   *  press/gate   / \  slope   ?  secret wall
```

---

## 2. Sky map

| Interior | Side | Size | Holds |
|---|---|---|---|
| The Skiff | B (Fleet) | 6 rooms | the cannon |
| Penthouse Tower | A (Cloud City) | 5 floors plus a spine | home and jail |
| Grand Hotel | A | about 10 rooms (big) | the vault |
| Observatory | A | 5 rooms | maybe the vault key (question 6) |
| Flagship | B | 7 rooms (designed below, 2.5; you said "Yes, flagship too") | home, jail and vault |

### 2.1 The Skiff (side B): the one you pointed at

**Spirit:** a little ship that is bigger on the inside. You run below decks from stern to bow. At the end, a cannon fires you out over the sky toward the other side. It is wide and level, unlike the towers.

**Doors (your "an entrance and exit there"):**
- **E stern door:** where the gangplank from the flagship lands, on the cabin's west end.
- **X bow door:** comes out on the skiff's bow deck, facing the islet.
- **C the cannon:** the second way out (see below).

**Rooms** (stern to bow):

| Room | Platforming | Notes |
|---|---|---|
| Cargo hold | climbing crate stacks; a cargo crane runs along the ceiling (shortcut) | the entrance |
| Crew quarters | hammocks are low springs: bounce from one to the next over sea chests | sea chests are flag spots |
| Rigging loft (above the quarters) | wind in the sails lifts you (updrafts); rope nets are ledges | the captain's lookout; sail folds for cover |
| Engine room | a turning propeller blows a sideways wash toward the bow: fast with it, slow against it | |
| Bilge (under the whole ship) | floods and drains on a pump clock, about 15 s each way. Dry, it is a fast run to the bow; flooded, you swim | the decks above are always the plain way |
| Gun deck (bow) | | the cannon and the bow exit |

**The cannon (a new launcher; the game has nothing like it yet):**
- **Firing:**
  - Hold Up in the breech in the bow wall. A 1-second fuse burns, with the barrel glowing and smoking.
  - If you are hit during the fuse, you are knocked out of the barrel and it fires empty.
  - Otherwise you are fired from the muzzle on the skiff's bow outside, in a long fixed arc toward the middle. You cannot steer until you land or are hit.
- **Landing:** its power is set for each map size so it always lands in the same place. Proposed: side B's end of the Sky Fair, just short of the zeppelin dock.
  - This keeps it on side B's half.
  - Anyone carrying a flag still has to fight through the dock.
- **CPUs:** they learn it as one more route, from the breech to the landing spot.

**Doors, the outside and the view:** inside you see planks, with portholes where clouds slide past, so the moored ship feels under way.

**CTF roles:**
- No home, jail, vault or buff.
- Flag spots everywhere: crates, sea chests, sail folds.
- The cannon is the prize: a launch tube from side B's home toward the front.

```
 ################################################
 #  :  RIGGING  :  ==net==   :   ===  lookout  F #          RIGGING   updrafts, nets
 #####=################=######################=##
 E crates ===  # ^_  ^_  ^_ hammocks #  >>>> o >>>> # [C>>  HOLD | QUARTERS | ENGINE
 # crane<====> #  F    F     F       #  prop wash   #  X      GUN DECK: cannon + exit
 ####v################################v##########^##
 #~~~~~~~~~~~~~~~~ BILGE (floods / drains) ~~~~~~~~^#          BILGE     tide shortcut
 ####################################################
   (the middle line is off to the right; the cannon fires that way)
```

### 2.2 Penthouse Tower (side A): home and jail

**Spirit:** your team's private sky tower. You wake at the top and drop down through a rich person's home to the street door. The jail is in the lobby at the bottom.

**Doors (all go both ways):**
- **Lobby front door:** on the east face, where today's ground-floor door is.
- **Suite balcony door:** on the east face, upstairs, onto the plank to the islet.
- **Roof hatch:** a spring up through the suite ceiling, onto the roof outside.

Three ways out of the suite means the spawns cannot be bottled up.

**Floors** (top down):

| Floor | Platforming | Notes |
|---|---|---|
| 1. Suite | slopes: a sunken lounge you run down into and back up out of | **HOME:** spawns on the raised ends; the pad and shield boost by the window; a skylight shows the city |
| 2. Gym | trampolines: three in a row, each bounce higher; the last reaches a climbing-wall ledge | |
| 3. Gallery | a glass catwalk over a light well cracks under you and resets (crumbling); rail ledges along the walls are the slow way | **secret:** a safe behind a painting, one very good flag spot |
| 4. Wine cellar | climbing in the dark: wine racks are the ledges, lanterns mark them | barrels for cover |
| 5. Lobby | a plain flat run, so a rescue is decided by fighting, not jumping | **JAIL** (the porter's lockup) at the west end |
| The spine | a glass lift (shortcut), a spring stack beside it (plain way), and a laundry chute: a fast drop from the suite to the lobby, with dryer vents puffing you side to side | joins every floor |

**Special:**
- The chute lands next to the front door. Defenders can reach the jail in about 2 seconds and stand in the rescuers' way out, but rescuers only have one room to cross.
- A barred window on the outside shows one lit pip per prisoner, so rescuers know someone is inside.

**CTF roles:** home, jail, and flag spots in the suite, the gym, the cellar and the safe.

```
 ##############D###########################   D roof hatch (spring up)
 #S S S S  \____ sunken lounge ____/ P  ^  D   1 SUITE    slopes        D balcony
 #######|################=##############v#
 #      | ^   ^    ^   T===         ^   v #   2 GYM      trampolines
 #######|##########=############^#######v#
 #  =   | %%%%%%%%%%%%%%%%%%%  =  [safe] v #   3 GALLERY  glass catwalk; painting safe
 #######|##.....light well.....###=#####v#
 # F =  |  F  =   F  =  F  dark  =  F   v #   4 CELLAR   dark rack climbing
 #######|#######################=#######v#
 #J J J !       F     desk      ^   F   v D   5 LOBBY    flat run; front door
 ##########################################
   | glass lift (shortcut)   ^ spring stack (plain way)   v laundry chute
```

### 2.3 Grand Hotel (side A): the vault, a whole small level

**Spirit:** a little level of its own. You go in through the front door, then either up through the ballroom to the sky pool or down to the boiler basement, where the vault is.

**Doors:**
- **D front door:** west face, where the low islet's plank arrives.
- **D terrace door:** east face, to the observatory plank. It opens onto the ballroom balcony.
- **D roof door:** on the roof, by the roof spring. It opens into the roof garden.
- **X staff door:** one way, from the kitchen. It comes out on the small islet near the Penthouse. That is a quick way home for defenders, and it drops raiders deep in enemy ground.

**Rooms:**

| Room | Platforming | Notes |
|---|---|---|
| Lobby (west) | twin grand staircases (slopes) rise to a mezzanine, with the reception desk between them | entrance |
| Luggage room (east) | a luggage carousel loops on two levels running opposite ways (belts) | trunks and bags for cover; a chute drops lost bags, and you, into the boiler basement |
| Guest corridor | a long hall of coloured guest-room doors: red goes to the kitchen, blue to the roof garden, gold to the ballroom balcony | the other doors are closets, good flag spots; colours only, no words |
| Ballroom (8 rows tall) | a polished ice dance floor; the chandeliers high up are crumbling ledges; a balcony ring is the plain way round | a band stage |
| Roof garden and sky pool | a deep pool to swim; a high diving board (spring) up to the hedge tops | **secret:** a grotto behind the pool's waterfall |
| Kitchen (west) | a syrup spill (sticky); pot racks overhead are ledges over it; a dumbwaiter (shortcut) | the staff exit |
| Boiler basement | dark; steam vents (updrafts) lift you over humps of hot pipes | |
| Vault (east, at the bottom) | behind two locked doors | **VAULT:** a chest, an urn and a speed boost |
| Elevator bank (the spine) | two lifts running out of step (shortcut), with a service stair of springs beside them | joins every level |
| Conference Wing (large games only) | folding partitions are shutters that open and close on the match clock; a long way round is always open | |

**By game size:**
- **Small:** the lobby, the elevator bank, the ballroom, the basement and the vault.
- **Medium:** adds the corridor, the kitchen, the luggage room and the pool.
- **Large:** adds the Conference Wing.

**CTF roles:**
- The vault.
- The key: either it stays outside on the low islet, or it moves into the Observatory (question 6).
- Many flag spots: closets, the grotto, bags, the boiler dark.

```
 ##################|#=###############################D##   D roof door
 # hedge=== ^dive  |~~~~~~~~ SKY POOL ~~~~~~~~[falls] blue#   POOL      swim; grotto
 ####=#############|^###############################=####
 #  %    %    %    |^ chandeliers   %    %   stage  gold D   BALLROOM  ice; D terrace
 # ===balcony===   |^ iiiiiiiiiiiiiiiiiiiiiiii  ===balc=#
 ##################|^###############=####################
 #  red   [ ]   blue   [ ]   gold   [ ]   [ ]  =        #   CORRIDOR  colour doors
 ####=#############|^##########=##########=##############
 D   /stair\  desk |^ /stair\  #  >>>>>>>>>>>>>>>>>   v #   LOBBY slopes | LUGGAGE belts
 #  ==mezzanine==  |^          #  <<<<<<<<<<<<<<<<<   v #
 ####=#############|^###########################=#####v##
 # X red  KITCHEN ,,,  ===pots===   # : BOILER : L  V  L #  KITCHEN | BOILER | VAULT
 ########################################################
```

### 2.4 Observatory (side A): a climb into the dome

**Spirit:** a stargazer's tower you climb into a dome. Every storey is a different kind of "up". It is narrow and tall, where the hotel is wide.

**Doors:**
- **D front door:** on the west face of the ground floor.
- **X dome slit:** one way, out onto the observatory roof.

**Rooms** (bottom up):

| Room | Platforming | Notes |
|---|---|---|
| Orrery hall | brass planets on arms circle the sun and stay level: ride one up (shortcut); springs at the walls are the plain way | entrance |
| Clock room | the great clock's shutters open in a wave, one after another; a ladder of ledges on the far wall is the slower, always-open way | |
| Star-chart room | dark for stargazing; glowing constellation ledges are the only lit things, so you climb a constellation | map chests for cover |
| Weather deck | a gale blows in through an open side (wind): jump across gaps into it | |
| The dome | the great telescope's barrel is a long slope up to the eyepiece; the observer's chair rides the dome's rail (shortcut) | night sky in the slit; a super-jump boost |

**Special (optional; a new mechanic, see question 10): telescope peek.** Hold Up at the eyepiece and your view swings out over the main map for as long as you stand still. You see only what you would normally see, and no hidden flags.

**CTF roles:** flag spots and the super-jump boost. Proposed: the vault key moves here, to the eyepiece. That links the two towers into one route: raid the dome, then the hotel basement.

```
        ____#######____
     __/   *    *    * \__        X slit (out onto the roof)
    #  chair =====>     X  #      5 DOME     telescope ramp, chair on the rail, K?
    #    /telescope__  =   #
    ######=#############=###
    #  >>>>>>  gale  >>>>> #      4 WEATHER  jump into the wind
    ###=############=#######
    #  *  =    *   =   *   #      3 STARS    dark; climb the lit constellation
    ###=##########=#########
    # [ ] [ ] [ ] [ ]   =  #      2 CLOCK    shutters open in a wave; ladder way round
    ######=############=####
    #  o   (sun)    o    ^ #      1 ORRERY   ride a planet; springs at the walls
    D    o        o      ^ #      D front door
    ########################
```

### 2.5 Flagship (side B): the Fleet's home, jail and vault

*(Added 2026-10-21, after you said "Yes, flagship too". Designed the same way as the rooms above.)*

**Spirit:** the Fleet's warship, walked through from stern to bow on three decks. The captain's cabin is home at the top, the brig is below it, and the hold is at the bottom. At the bow, the gangplank's door leads through to the skiff.

**Doors:**
- **D cabin door:** on the deck, east face of the cabin. Both ways, into the captain's cabin.
- **D deck hatch:** on the deck. Both ways, down into the wheelhouse onto the helm platform.
- **D bow door:** at the gangplank's end, on the hull's bow. Both ways, onto the gun deck.
- **X stern windows:** a risky way out of the cabin. It drops you under the stern onto the cloud sea, with 8% damage.
- **G gangplank door:** inside, in the chain locker. Both ways, through to the skiff's cargo hold, beside the skiff's stern door.

**The outside:**
- The hull is closed, and its deck is walked on.
- The cabin is a closed shell on the deck, and a bowsprit sits at the bow.
- The way back up from the gangplank to the deck is a balloon spring on a beam over the gangplank's end, up to the bowsprit.

**Rooms:**

| Room | Platforming | Notes |
|---|---|---|
| Captain's cabin (top, stern) | a raised stern gallery and the captain's bunk to hop onto | **HOME:** spawns on the floor and on the bunk, the pad and the shield boost; the stern windows; a companionway down |
| Wheelhouse (top) | the ship's wheel turns: ride a handle up to the helm platform (shortcut); a ladder up the far wall is the plain way | the deck hatch is on the helm platform |
| Gun deck (middle) | cannons on their carriages to hop; low gravity in the ship's waist, where she rolls the most | **JAIL** (the brig) at the stern, on the flat; the bow door at the bow |
| Hold (bottom) | dark; cargo nets to climb (ledges), lanterns | **VAULT** at the stern behind two locked doors, with an antechamber between them: a chest, an urn and a speed boost |
| Magazine (bottom) | a pitch spill on the floor (sticky); the shot trolley rides its rail over it (shortcut) | powder kegs for cover |
| Chain locker (bottom, bow) | the anchor chain is a lift up to the gun deck (shortcut); its links are a ladder up to a hatch (plain way) | the gangplank door to the skiff |

**Joins between decks:** a sprung barrel up through a hatch and a plain hole down, on every deck, as in the Penthouse. No two of them stand one over the other.

**CTF roles:**
- Home, jail and vault, all inside.
- The vault key stays outside on the deck.
- The team buff stays outside in the crow's nest.

```
 #################################################
 #   =bunk=           #      (wheel)   ==helm=D=  ^ #  1 CABIN (home)   | WHEELHOUSE   D deck hatch
 #X ##S S S S S S P h v D    o     o      ^     ^ #     X stern windows    D cabin door
 ############^#######v#####^##########^#################
 #J J J !     ^   v   [gun]  [gun]  :float:  [gun] | = D #  2 GUN DECK: the brig, cannons, low gravity in the waist; D bow door
 #################^#####v##############|=###########
 #V V L L  % nets %     # ,,,trolley,,, #  | ^  k  G #  3 HOLD + VAULT | MAGAZINE | CHAIN LOCKER; G gangplank door to the skiff
 #################################################
```

---

## 3. Factory map

| Interior | Side | Size | Holds |
|---|---|---|---|
| Works hall: The Line | A (Works) | 10 rooms (big) | home, jail, vault |
| Vat house: The Dye Works | A | 5 rooms | none |
| Pipe house: The Plumbing | A | 5 rooms | the Works key (moved in) |
| Generator tower: The Dynamo | A | 6 rooms | the Works team buff (moved in) |
| Hotel: The Neon Arms | B (Neon) | 11 rooms (big) | home, jail |
| Bank: Neon Savings and Loan | B | 6 rooms | the vault |
| Tower: The Broadcast Spire | B | 6 rooms | the Neon team buff (moved in) |
| Shop: The Big Store | B | 5 rooms | the Neon key |
| Warehouse: The Stockpile | B | 5 rooms | none |
| Rail yard stations: The Underline | shared, cut by the middle line | 6 rooms a side | none |

### 3.1 Works machine hall: THE LINE (side A, big)

**Spirit:** you walk through one giant machine along its product line. Ore comes in at the dock and is melted, pressed and assembled, while the control room watches over it all from the top.

**Doors:**
- **In** (all on the east face):
  - **D1 ground door → Loading Dock.** It works both ways.
  - **D2 feed-floor door** (catwalk) **→ Assembly Line**, east end.
  - **D3 press-floor door** (catwalk) **→ Press Line**, east end.
- **Out:**
  - **X1 Control Room hatch → the hall's roof.** This is home's quick exit.
  - **X2 Smelter slag chute → the street**, in the alley between the vat house and the pipe house.
  - **X3 Boiler Room steam stack → the vat house roof.**

**Rooms:**

| Room | Platforming | Notes |
|---|---|---|
| Main Shaft (the spine) | one spring up and one hole down per level, like the mill's stair tower | the fast way between home and jail |
| Control Room (top, west) | flat; consoles and lockers for cover; windows | **HOME:** spawns, pad, shield boost; X1 |
| Gearbox (top, east) | big turning cogs to ride up (shortcut), zigzag ledges beside them | the raiders' high road toward home |
| Boiler Room (west) | steam valves (springs) between the boilers; steam jets (wind) over the gaps | X3 |
| Press Line (east) | three presses slam in turn: dash through the gaps, or take the catwalk over them | the signature room; D3 |
| Assembly Line | two long belts stacked, running opposite ways; robot-arm ledges between them | super-jump boost; D2 |
| Smelter (tall, west) | furnace heat (updraft) lifts you from the slag pit up to the ladle catwalk; a spring beside it | X2 |
| Casting Pit (tall, east) | sand heaps (slopes) and mould pits (holes down to the crawl) | |
| The Crawl (bottom, dark, low) | low running in the dark | **JAIL** at the west end; **VAULT** in the middle behind two locked doors; ghost boost |
| Loading Dock (bottom, east) | crate stacks (short hops); a freight lift (shortcut) with a spring beside it | D1 |

**By game size:**
- **Small:** the Control Room, the Press Line, the Assembly Line, the Smelter, the Crawl with the Dock, and the Main Shaft.
- **Medium:** adds the Boiler Room and the Casting Pit.
- **Large:** adds the Gearbox and the Scrap Heap wing: scrap piles as rough slopes, with a magnet crane across them. The wing replaces today's outdoor Boiler Rooms.

**CTF roles:**
- **Home:** the Control Room.
- **Jail:** the Crawl, two rooms from D1.
- **Vault:** the Crawl, with a chest, an urn and a speed boost. Its key moves to the pipe house.
- **Team buff:** moves to the generator.
- **Flags:** cover in every room.

```
##############################################
#H H H H P h  CONTROL ROOM  c  X1 #^# GEARBOX#
#====consoles====    c    ===     #^#@ = @ =c#
###########v######################^^#===v#####
#c BOILER ROOM ^ w>> ^ w>> ^   X3 #^#* * * D3#
############v#####################^^#=catwalk#
#b > > > > > > ASSEMBLY > > > > > #^#> > > D2#
#< < < < < < < < < < < < < < < < <#^#< < < < #
#####v######################v#####^^#####v####
#  SMELTER    ::::   c       X2   #^#CASTING #
#  c  slag    ::::   ====         #^#/\ v /\c#
#####v############################^^#####v####
#%J ppp%%%%%  b  THE CRAWL  %%L c b L%DOCK D1#
##############################################
```

### 3.2 Vat house: THE DYE WORKS (side A)

**Spirit:** a dye works whose three colour vats fill and drain on a clock. You swim across them when they are full and run along their bottoms when they are empty.

**Doors:**
- **In:**
  - **D1 ground door** (west face) **→ Dye Store.**
  - **D2 plank door** (east face) **→ Mixing Gantry.**
- **Out:**
  - **X1 Drying Loft hatch → the roof.**
  - **X2 Spill Room drain → the street**, in the alley by the generator.

**Rooms:**

| Room | Platforming | Notes |
|---|---|---|
| Dye Store (ground, west) | barrel stacks to hop up | D1 |
| Vat Hall | three vats (red, blue, yellow) rise and fall out of step, so one is always low: swim the tops or climb out of the bottoms | the signature room; the vat walls are always walkable |
| Mixing Gantry (over the vats) | rusty gratings give way (crumbling) between fixed catwalk ends | D2; slow down and you fall into a vat |
| Drying Loft (top) | big fans blow across it (wind, a different way in each half) | X1; hanging cloth to hide behind |
| Spill Room (east, tall) | spilled dye is sticky; valve springs lift you out | X2 |

**CTF roles:** none. Good flag spots behind the cloth and on the vat ledges.

```
########################################
#  DRYING LOFT   w> > > >   < < < <w X1#
#  c curtains   ====    ====  curtains #
####v###############################^###
#: : MIXING GANTRY : : : : : D2  #  ^  #
#  =         =         =        ##SPILL#
#  #~~~~~~~~#~~~~~~~~~#~~~~~~~~# #,,^,,#
#c #~ RED ~~#~ BLUE ~~#~YELLOW~# #,,^,,#
#D1#~~~~~~~~#~~~~~~~~~#~~~~~~~~#X2 ,,c #
#STORE#####################b############
########################################
```

### 3.3 Pipe house: THE PLUMBING (side A)

**Spirit:** you crawl through the inside of the pipes themselves: a tangle of fat tubes with rushing air that pushes you along.

**Doors:**
- **In:**
  - **D1 ground door** (east face) **→ Pump Room.**
  - **D2 plank door** (west face, from the vat house) **→ the Tangle.**
- **Out:**
  - **X1 top of the Riser → the roof**, by the pad up to the vat house roof.
  - **X2 Sump grate → the Underline**, onto the Works platform. This is the yard's back way into the subway (question 8).

**Rooms:**

| Room | Platforming | Notes |
|---|---|---|
| Pump Room (ground) | the big pump wheel turns (ride it as a shortcut); ledges around it | D1 |
| The Riser (west, tall) | a column of pressure valves (springs) straight up | X1 |
| The Tangle (top) | a small maze of pipes 2 rows high, with loops and dead ends, joined by holes and valve springs | **THE WORKS KEY** sits in a dead end |
| Wind Main (middle) | one long straight pipe with air rushing east: fast with it, a struggle against it | the signature room |
| Sump (bottom, dark) | shallow water to wade, a low ceiling | X2 |

**CTF roles:** the Works key (moved here from the hall).

**Optional, only if the skiff's cannon gets built:** the Riser could become a pressure pipe that fires you over the alley onto the vat house roof.

```
########################################
#RISER ^#  THE TANGLE (pipes 2 high)   #
#   ^   #==v=====  ====^=====  ==v===  #
#   ^   #  ###v##  ^  ###  v###  ^  K  #
#X1 ^   #==#=========##=====#=====##D2 #
#   ^   #  w> > > > WIND MAIN > > >  ^ #
####^###############v################^##
#PUMP  @   =   @   #%%% SUMP ~~~~~ X2 %#
#D1  c  =====   c  v%%%~~~~~~~~~~~%%%%%#
########################################
```

### 3.4 Generator tower: THE DYNAMO (side A)

**Spirit:** a humming power station. The turbine turns, the magnets pull you up, and the team buff crackles inside the coil at the very top.

**Doors:**
- **In:**
  - **D1 ground door** (west face) **→ Switch Room.**
  - **D2 plank door** (west face) **→ Battery Racks.**
- **Out:**
  - **X1 Coil Chamber hatch → the tower roof**, which is now just a lookout.
  - **X2 end of the Cable Run → the station roof** in the rail yard, following the power line.

**Rooms:**

| Room | Platforming | Notes |
|---|---|---|
| Switch Room (ground) | breaker shutters (open 3 s, shut 3 s), with a spring way round them | D1 |
| Turbine Hall | ride the huge turbine's blades (shortcut); zigzag ledges beside it | |
| Battery Racks | narrow shelves: a zigzag climb of short ledges | D2 |
| Magnet Lift (east, tall) | a field that pulls you up (an updraft drawn as blue sparks) | the signature room |
| Coil Chamber (top) | a cage of ledges around the coil | **TEAM BUFF** (moved in from the roof); X1 |
| Cable Run (bottom, dark) | a low crawl along the cable trays | X2 |

**CTF roles:** the Works team buff.

```
######################################
#  COIL CHAMBER  y       X1 # MAGNET #
#  ==== coil cage ====   ^  # LIFT : #
##########v##############^##  :  :   #
# BATTERY RACKS  ===   ^    # :  : : #
#  ===   ===   ===   ===  D2#  :  :  #
######v#############^########:  : ^ ##
#  TURBINE HALL  @     @   = =  =  ^ #
#  =      @   (turbine)   @    ^ #####
#D1 c  SWITCH ROOM  [ ] c  ^  ########
#%%%%%%%%%%% CABLE RUN %%%%%%%%%% X2 #
######################################
```

### 3.5 Hotel: THE NEON ARMS (side B, big)

**Spirit:** an all-night hotel stacked like a layer cake: lobby, kitchen, casino, club and pool. The home team's penthouse is on top and the jail is in the cellar.

**Doors:**
- **In** (east face unless noted):
  - **D1 street door → Lobby.** A revolving door that works both ways.
  - **D2 plank door → Kitchen.**
  - **D3 upper plank door → Casino.**
  - **D4 west door, large games only** (from the Scrapyard) **→ Laundry.**
- **Out:**
  - **X1 Penthouse balcony → the hotel roof.** This is home's quick exit.
  - **X2 Kitchen back door → the street**, in the alley by the bank.
  - **X3 Pool overflow → the street**, in the alley between the bank and the tower.

**Rooms:**

| Room | Platforming | Notes |
|---|---|---|
| Elevator (the spine) | a lift car from the cellar to the penthouse (shortcut), beside a service stair with a spring per storey | the laundry chute is the fast way down |
| Penthouse (top) | flat; sofas and a piano for cover | **HOME:** spawns, pad, shield boost; X1 |
| Rooftop Pool | a deep pool; a diving board (spring) up to a high sun deck | X3 |
| Nightclub | a polished ice dance floor; the DJ booth on a high ledge, reached by speaker springs | |
| Casino | a giant roulette wheel turning in the middle (shortcut); balconies of ledges; slot machines for cover | D3 |
| Guest Corridor | a long hall: hop over luggage carts | the chute hatch |
| Kitchen | the dish line (belts), pan racks as ledges | D2; X2 |
| Lobby (ground) | flat; the front desk and a chandelier to jump on | D1 |
| Laundry | dryers blow across the room (wind); the chute lands here | D4 |
| Cellar (bottom, dark) | low wine racks to hop | **JAIL** at the west end |
| Parking Garage (large games, west wing) | spiral ramps (slopes) | a second way between the Laundry and the Lobby |

**By game size:**
- **Small:** the Penthouse, the Casino, the Kitchen, the Lobby, the Cellar and the Elevator. Here the chute runs from the Casino to the Cellar.
- **Medium:** adds the Pool, the Nightclub and the Laundry.
- **Large:** adds the Guest Corridor and the Parking Garage.

**CTF roles:**
- **Home:** the Penthouse.
- **Jail:** the Cellar, two rooms from D1.
- **Flags:** cover on every storey.

```
##################################
#H H H H P h  PENTHOUSE  c  X1 |^#
#~~~~ POOL ~~~~  =dive=  ^  X3 |^#
#____ NIGHTCLUB ____ =DJ= ^  c |^#
#c CASINO  c  @roulette@ c  D3 |^#
#c  GUEST CORRIDOR  luggage  v |^#
#KITCHEN < < < < < c  X2  D2   |^#
#c  LOBBY   =chandelier=   D1  |^#
#LAUNDRY  <w <w   v chute   D4 |^#
#%J ppp%%%% CELLAR %%%%%%%%%%% |^#
##################################
```

### 3.6 Bank: NEON SAVINGS AND LOAN (side B)

**Spirit:** a heist movie inside a building. A marble hall up front, laser gates and secret panels behind it, and the vault at the bottom.

**Doors:**
- **In:**
  - **D1 west street door → Banking Hall.**
  - **D2 east plank door → Deposit Box Wall**, halfway up.
- **Out:**
  - **X1 Manager's Office hatch → the bank roof**, beside the billboard pad.
  - **X2 armoured-car bay → the street**, in the alley between the tower and the shop.

**Rooms:**

| Room | Platforming | Notes |
|---|---|---|
| Banking Hall | teller counters as ledges, velvet ropes for cover | D1 |
| Laser Corridor | laser gates (open 2 s, shut 2 s, in a running wave) | the signature room; X2 |
| Air Duct (dark crawl) | runs over the corridor: the slow, safe way round the lasers | |
| The Vault (bottom, dark) | behind two locked doors | **VAULT:** chest, urn, speed boost; the key is in the shop |
| Deposit Box Wall (east, tall) | a zigzag climb up walls of deposit boxes | D2 |
| Manager's Office (top) | flat; a desk and a safe for cover | super-jump boost; X1; **secret:** a painting you can walk through into a hidden stash |

**CTF roles:** the vault and the super-jump boost.

```
######################################
#X1 MANAGER'S OFFICE  b    ?SECRET c #
#====desk====  c   ^       ?STASH  ^ #
#######v###########^##############^###
#D1 BANKING HALL  =teller= c #DEPOSIT#
#  c  ropes  =teller=     v  #  =  ^ #
####v######################v##=  =  ^#
#%%v AIR DUCT (the way round)%#=  D2 #
# * * * LASER CORRIDOR * * * X2 ##v###
###########L%%% VAULT c b %%L#########
######################################
```

### 3.7 Tower: THE BROADCAST SPIRE (side B)

**Spirit:** a TV station stacked up a spire. Every storey is a different live show, and the transmitter at the tip holds the team buff.

**Doors:**
- **In:**
  - **D1 west ground door → Green Room.**
  - **D2 east plank door → Weather Studio.**
- **Out:**
  - **X1 Transmitter hatch → the tower roof.**
  - **X2 the News Studio's camera window → the warehouse roof.**

**Rooms** (bottom up):

| Room | Platforming | Notes |
|---|---|---|
| Green Room | flat; sofas and make-up tables for cover | D1 |
| Cable Shaft (dark) | a zigzag of ledges between bundles of cable | |
| Game Show Studio | a spinning prize wheel (shortcut), audience bleachers (slopes), podium ledges | |
| Weather Studio | the wind machine blows across the set; a green screen | D2 |
| News Studio | a camera dolly rolls across a gap on its track (shortcut); the anchor desk and ledges are the plain way | X2 |
| Transmitter | ledges around the mast | **TEAM BUFF** (moved in from the roof); X1 |

**CTF roles:** the Neon team buff. Every storey has a spring up and a hole down; each studio's toy is extra.

```
##################
#  TRANSMITTER y #
#   ==mast== X1  #
#####v######^#####
# NEWS [dolly]-> #
# =desk=  ^  = X2#
#####v######^#####
# WEATHER w> > > #
# =  ^ green  D2 #
#####v#######^####
# GAME SHOW  @   #
# /bleachers\ ^  #
#####v#####^######
#% CABLE SHAFT  %#
#%  =  =  ^  =  %#
#####v######^#####
#D1 GREEN ROOM c #
##################
```

### 3.8 Shop: THE BIG STORE (side B)

**Spirit:** a department store after closing. You ride the escalators, bounce through the toy department, and hide among the mannequins and in the fitting rooms.

**Doors:**
- **In:**
  - **D1 west street door → Shop Front.**
  - **D2 west plank door → Toy Department.**
- **Out:**
  - **X1 Stockroom hatch → the shop roof**, beside the pad up to the tower roof.
  - **X2 behind the last fitting-room curtain → the street**, in the alley by the warehouse.

**Rooms:**

| Room | Platforming | Notes |
|---|---|---|
| Shop Front (ground) | glass counters as ledges, mannequins for cover | D1 |
| Escalators | moving stairs (slopes with belts), one up and one down; walking against one is slow | the signature room |
| Toy Department (top) | a bouncy castle (low springs everywhere) and a ball pit (slows you like water) | D2 |
| Stockroom | high shelves (ledges), boxes for cover | **THE NEON KEY** on the top shelf; X1 |
| Fitting Rooms (bottom) | a row of curtained booths, some of them dead ends | the best place in the city to hide a flag; X2 |

**CTF roles:** the Neon key.

```
######################################
# TOY DEPT ^ ^ ^ bounce ^  ~ball pit~#
#D2  =   =   =    ^ ^   ~~~~~~~~~~ v #
####v#########/>>>>>>>################
# STOCKROOM =K= #  ESCALATORS  <<<<\ #
#  ===  ===  X1 #  />>>>      <<<<<\ #
######v######/>>>>#####v##############
#D1 SHOP FRONT  c mannequins =glass= #
#####v################################
# FITTING |c|c|c|c|X2| rooms  c      #
######################################
```

### 3.9 Warehouse: THE STOCKPILE (side B)

**Spirit:** a cramped warehouse of cardboard box towers that cave in under you. The forklift is the steady way up.

**Doors:**
- **In:**
  - **D1 west ground door → Loading Bay.**
  - **D2 west plank door → High Racks.**
- **Out:**
  - **X1 Packing Line hatch → the street**, at the station's west door in the rail yard.
  - **X2 Freight Basement → the Underline**, onto the Neon platform. This is the city's back way into the subway (question 8).

**Rooms:**

| Room | Platforming | Notes |
|---|---|---|
| Loading Bay (ground) | pallets for cover; a forklift lift (shortcut) with a spring beside it | D1 |
| Box Canyon | towers of boxes that give way (crumbling), with steel shelf tops between them as safe steps | the signature room |
| High Racks | tall pallet racking: a zigzag climb | D2 |
| Packing Line (top) | a conveyor (belt) and spilled packing tape (sticky) | X1 |
| Freight Basement (bottom, dark) | a ramp (slope) down into the dark | X2 |

**CTF roles:** none. The Neon ghost boost stays on its alley plank outside.

```
######################################
# PACKING LINE  < < < < < ,tape,  X1 #
#  =   ,tape,   = < < < <   =    ^   #
######v##########################^####
#D2 HIGH RACKS  =   =   =   =    ^ | #
#  =   =   =   =   =   =   =  =    | #
######v####################v#######|##
# BOX CANYON : :  ::  : :  :: ===  | #
#D1 LOADING BAY  c pallets c       | #
#########v############################
#%% FREIGHT BASEMENT \ ramp   X2 %%%%#
######################################
```

### 3.10 Rail yard stations: THE UNDERLINE (shared, cut by the middle line)

**Spirit:** both stations lead down to one subway under the switchyard. Each side's train shuttles from its own platform to the Interchange on the middle line. This is the only interior that both sides share, like the mill.

**How the two sides divide it:**
- Each half is a mirror of the other.
- The halves meet in the Interchange, which the middle line cuts in two, like the mill's great hall.
- Each side's train stops at the line and never crosses it.
- During the hiding phase, the wall runs through the Interchange.

**Doors (each half):**
- **In:**
  - **D1 the station's west ground door → Ticket Hall.**
  - **D2, large games only: the signal tower's ground door → Signal Room.**
  - **Back doors:** the pipe house sump (Works half) and the warehouse basement (Neon half) land on the platform.
- **Out:**
  - **X1 Interchange stairs → up into that half's switchyard ground floor.**
  - **X2 back out of the station door.**

**Rooms (each half):**

| Room | Platforming | Notes |
|---|---|---|
| Ticket Hall | turnstiles to hop, ticket machines for cover | D1 / X2 |
| Long Stair | one long slope down (the escalator is broken) | |
| Platform | the train pulls in, waits, and rolls to the Interchange (shortcut) | back doors land here |
| Track Tunnel (dark) | under the platform: the slow way to the Interchange on foot, with a spring up at the end | |
| Interchange (on the line) | a tall tiled hall with a footbridge of ledges across it | X1; a carrier who crosses the line here captures |
| Carriage Depot (medium and up) / Signal Room (large) | parked carriages with belts on their roofs / a lever room with a high walkway | D2 (large) |

**CTF roles:**
- No home, jail, vault or buff. The middle buff stays on the switchyard roof.
- Each side may hide flags on its own half, at least 500 px from the line.

```
##################################!##################
#D1 TICKET HALL =gate=  c   X2 ###!##################
############\  LONG STAIR  #######!##################
#############\###############     !                 #
## PLATFORM  [==TRAIN==] >>>>>>   !   INTERCHANGE   #
#################v######  =    ^  !  =footbridge= X1#
##%%%%%%% TRACK TUNNEL %%%%%%%^   !    c       c    #
##################################!##################
   (! is the middle line; the other side is a mirror)
```

### 3.11 Who holds what, both maps

| Role | Sky A (Cloud City) | Sky B (Fleet) | Factory A (Works) | Factory B (Neon) |
|---|---|---|---|---|
| Home | Penthouse: Suite | Flagship cabin (outside, unless question 1) | Works hall: Control Room | Hotel: Penthouse |
| Jail | Penthouse: Lobby | Flagship brig (outside) | Works hall: the Crawl | Hotel: Cellar |
| Vault | Grand Hotel: basement | Flagship hold (outside) | Works hall: the Crawl | Bank: the Vault |
| Key | low islet, or the Observatory dome | flagship deck | Pipe house: the Tangle | Shop: Stockroom |
| Team buff | high islet (outside) | crow's nest (outside) | Generator: Coil Chamber | Tower: Transmitter |

The factory keeps its character. The Works is a deep fort, with home, jail and vault in one keep. Neon City spreads across five linked buildings with more doors.

---

## 4. Open questions (your call)

1. **The flagship.** It was not on your list. Should it get its own mill-style interior too? It holds side B's home, jail, vault and buff.
   - If it stays as it is, side B's home is out in the open while side A's is hidden in the Penthouse. That is uneven.
   - Space is kept free for it in side B's part of the area under the map.
2. **Shared or one side's own?**
   - Proposed: anyone can go in through any door, like the mill. Each interior still counts as its owner's ground.
   - The alternative is owners only, with the doors shut to the enemy. That would make homes safe rooms. I advise against it, because raiders need a way in.
3. **Homes inside?** The Penthouse (sky), the Works Control Room and the Neon hotel's Penthouse put spawns inside a hidden area. Or should the spawns stay outside on the roofs, with only the jails and vaults inside?
4. **Doors.**
   - Proposed: front doors that work both ways, plus hidden one-way exits.
   - The alternative is strictly the mill's way, where you always come out somewhere else.
5. **The cannon.**
   - Can a flag carrier ride it? Today, being launched very fast makes you drop the flag.
   - Where should it land? Options:
     - just short of the zeppelin dock (proposed; stays on side B's half);
     - right on the dock;
     - over the line, into enemy ground.
6. **Moving things inside.** Is it all right to move these?
   - the sky vault key to the Observatory dome;
   - the Works key to the pipe house;
   - both factory team buffs into the generator and the tower.
7. **The rail yard.** One shared subway under the middle, like the mill (proposed)? Or should each station be its own small interior on its own side?
8. **Back doors into the subway** from the pipe house and the warehouse: keep them or drop them?
9. **The Works hall's outside** becomes a tall empty shell, 33 columns wide. Should it shrink to give the yard more room?
10. **Telescope peek** in the Observatory (a new mechanic): yes or no?

---

## 5. Engine work this needs (done once, used by every interior)

1. **Many areas instead of one.** Today the game supports only one hidden area per map. Every interior gets its own area, and that area decides:
   - the camera, kept within the area in both width and height;
   - the blackout;
   - who is hidden from whom;
   - where shots stop;
   - which enemies CPUs see;
   - the minimap;
   - what online play sends to the other players.

   The oak mill becomes area number 1 and must play exactly as it does now.
2. **Room under the map.**
   - The sky map gets 42 rows underneath, like the oak. The factory gets 52.
   - The rock is filled in solid, and each interior is carved out of its own side's half.
3. **CPUs.**
   - They learn to use entrance doors. Today they only use exits and the mill's wheel.
   - The "can only be reached by a moving thing" check must treat doors as ordinary ways in. Otherwise a home inside an interior would make the whole outside map look unreachable.
4. **The cannon:** a fuse, a fixed launch, and a fired state the CPUs can plan around.
5. **Cover placed by hand** in every room, because the automatic scatter never reaches below the map.
6. **Rebuild the six shipped route graphs** for each map after its shapes change.

---

## 6. Suggested build order (one map at a time, sky first)

**Sky map (first, because that is where you are):**
1. **Engine: many areas.** Check that the oak mill still plays exactly the same.
2. **The Skiff, without the cannon:** its rooms, the stern entrance and the bow exit. This fixes "that's the cabin?" and is the first thing you can play.
3. **The cannon,** plus CPUs learning to use it.
4. **The Observatory:** small and holds nothing, so it proves a second area works on side A.
5. **The Penthouse:** home and jail move inside, with the CPU reachability fix.
6. **The Grand Hotel:** the big one, with the vault.
7. **The Flagship,** if you say yes to question 1.
8. **Rebuild the sky route graphs,** run a CPU playtest at all three game sizes, and send it to you for review.

**Factory map (after you have played the sky interiors and approved them):**

9. **Room under the map, plus the small Works buildings:** the generator (buff), the pipe house (key) and the vat house.
10. **The Works hall:** the big one, with home, jail and vault.
11. **The small Neon buildings:** the tower (buff), the shop (key), the warehouse and the bank (vault).
12. **The Neon hotel:** the big one, with home and jail.
13. **The Underline,** last, because it joins both halves and takes the back doors.
14. **Rebuild the factory route graphs,** run a CPU playtest at all three sizes, and send it to you for review.

Each step is shown to you before anything is pushed.
