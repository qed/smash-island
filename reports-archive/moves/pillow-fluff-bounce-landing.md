# Pillow's Fluff Bounce: why it landed 0 of 28, and the fix

The playtest saw "Pillow cast 28/0". Findings (2026-10-18):

- The ring hits every foe within 72 px (past her body) at the END of an 8-frame wind-up. On a still dummy it lands out to about 70-80 px centre to centre and not at 90+.
- A simulated player casts it from mid range (the playtest's "rangedSpecial" fires up to 380 px away). A foe that far off, or even 180 px off and not walking in, is out of reach by the time the ring goes off. The CPU casts closer and landed 23% of its casts.
- Fix: the ring's reach is a named constant, FLUFF_REACH, 72 > 96 px (the ring's puffs spread across it).

Real keys (Pillow pressed C, a moving Hard CPU foe closing in; each cell is lands / casts, cast the first frame the foe is within that many px):
| cast when foe within | 50 | 80 | 110 | 140 | 180 | 240 | 320 |
|---|---|---|---|---|---|---|---|
| before (72) | 7/19 | 8/21 | 10/23 | 9/24 | 0/24 | 0/24 | 0/24 |
| after (96) | 8/19 | 9/21 | 10/23 | 10/24 | 20/24 | 0/24 | 0/24 |

CPU Pillow vs Pen, Snowball and Firey (9 matches of 2400 frames, each level): lands per cast, Easy 33/141 (23%) > 44/148 (30%); Hard 32/138 (23%) > 48/150 (32%).
A foe 240 px away or more is still out of reach, by design: it is a close-range ring.
