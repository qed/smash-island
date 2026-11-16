# Yoyle Needle Teams map: size scaling rule (phase A)

- ONE fixed scale: the core layout (design 6500 x 3000) is drawn at K.k = 0.75 and never stretched, so every jump, step and gap is the same at every size and count (steps stay under CLIMB_REACH 130 design px; the floor gaps keep their 300 design px and the rail movers that bridge them).
- More players and a bigger MAP SIZE ADD content (ynBuild, the "SIZE SCALING" block):
  - nW annex bays = clamp(round(1.0*(players-4)/2 + 3.6*(MAP w - 0.85) + 0.1), 0, 4), each 1200 design px wide, split west/east of the central shaft (west gets the extra one). A bay = a hall workshop (floor, block stair, shelves, a rail mover and a lift), a machine-room annex (tunnel pieces, block stair, shelves, a four-tooth gear) and, on tall maps, its own deck rows.
  - hb extra hall floors = clamp(round(0.8*(players-4)/2 + 3*(MAP h - 0.85) + 0.1), 0, 4), each 780 design px tall: a deck row with a mover over its middle gap and a zigzag stair (steps ~100 design px apart), in the west wing, the east wing and every bay, plus a longer ledge stair up the shaft and a longer cage elevator.
  - Insertion is by pivots (x >= 2000 shifts by the west bays, x >= 4800 by the east bays, y >= 1021 by the floors); pieces wider than 600 (or taller than 400) stretch across a pivot, smaller ones move whole. Hall lamps and the terrace sign stay under the roof.
- Same settings, same map (no Math.random; only count, MAP SIZE, variant). The 4 variants keep their ideas and mirroring.
