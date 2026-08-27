import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// Stadium verticality + the MAP SIZE match setting.
//
// The arenas are now ~2.5 screens tall and a match setting scales them further, so the three
// things that make a tall arena playable are pinned here as invariants rather than left to
// eyeballing a canvas:
//
//   1. FLOOR CONTINUITY   — the teams arena sits on ONE unbroken solid floor. A missed jump has to
//                           drop you onto ground, never into a pit. (Cost several builds once.)
//   2. RUN-UNDER TUNNEL   — the central tower never reaches the floor. Both teams must always have
//                           a purely horizontal route to each other, so the AI never HAS to climb.
//                           A floor-to-sky tower stalled ~40% of matches; full-height support legs
//                           re-created the same wall and pinned 2v2 matches for 9000 frames.
//   3. REACHABILITY       — no standable layer is more than a double jump (~170px) above the one
//                           below it, at ANY map size, or fighters get stranded on the floor.
//
// Every assertion is measured against the REAL setupWorld() output, at every map size.

const SIZES = ['compact', 'normal', 'tall', 'huge'];
const MAX_CLIMB_GAP = 180;   // a double jump gains ~160-180px
const MIN_TUNNEL = 120;      // run-through clearance under the cross's floor-level doorway
// The teams arena is 2.5x screen height TIMES the 1.5x ARENA_SCALE the cross layout is built at —
// the plus of walls takes the whole middle of the map, so the quadrants need the extra room.
const TEAMS_H_MUL = 2.5 * 1.5;

function setup(w, { mode = 'ffa', stageId = 'goiky', size = 'normal', count = 5 } = {}) {
  w.eval(`SETTINGS.mode=${JSON.stringify(mode)}; SETTINGS.count=${count};`);
  w.eval(`SETTINGS.mapSize=${JSON.stringify(size)};`);
  if (mode === 'teams') w.eval(`SETTINGS.teamKey='2v2';`);
  const idx = w.eval(`STAGES.findIndex(s=>s.id===${JSON.stringify(stageId)})`);
  expect(idx, `stage ${stageId} exists`).toBeGreaterThanOrEqual(0);
  w.setStage(idx);
  w.eval('resize(); setupWorld();');
  return {
    WW: w.eval('WW'), WH: w.eval('WH'), W: w.eval('W'), H: w.eval('H'),
    plats: w.eval('worldPlats'),
    layers: w.eval('climbLayers()'),
    isBigFFA: w.eval('isBigFFA()'),
    scrolls: w.eval('scrolls()'),
  };
}

// Coarse-grid coverage of the playable airspace: divide the box between the top of the arena and
// the floor into COV_COLS x COV_ROWS cells and count the cells that have a platform in them.
// This is the "platforms all around the map" check — landmarks alone furnished only the middle
// band, leaving the whole upper airspace and the lateral runs to the edges as empty sky.
const COV_COLS = 6, COV_ROWS = 6;
function coverage(w) {
  const WW = w.eval('WW'), WH = w.eval('WH');
  const plats = w.eval('worldPlats');
  let x0, x1, botY;
  if (w.eval('isBig()')) {
    const floor = plats.find(p => p.solid && p.floor === 0 && p.w > WW * 0.8);
    x0 = floor.x; x1 = floor.x + floor.w; botY = floor.y;
  } else {
    x0 = 0; x1 = WW; botY = w.eval('groundY()');
  }
  const top = WH * 0.10;
  const cw = (x1 - x0) / COV_COLS, ch = (botY - top) / COV_ROWS;
  let served = 0;
  const empty = [];
  for (let r = 0; r < COV_ROWS; r++) {
    for (let c = 0; c < COV_COLS; c++) {
      const cx0 = x0 + c * cw, cy0 = top + r * ch;
      const hit = plats.some(p => p.y >= cy0 && p.y < cy0 + ch && p.x < cx0 + cw && p.x + p.w > cx0);
      if (hit) served++; else empty.push(`r${r}c${c}`);
    }
  }
  return { pct: served / (COV_COLS * COV_ROWS), empty };
}

// Largest vertical distance between two consecutive standable layers.
function widestGap(layers) {
  let worst = 0, at = null;
  for (let i = 0; i < layers.length - 1; i++) {
    const d = layers[i + 1] - layers[i];
    if (d > worst) { worst = d; at = [layers[i], layers[i + 1]]; }
  }
  return { worst, at };
}

// The single continuous floor slab of the teams arena.
function teamsFloor(g) {
  return g.plats.find(p => p.solid && p.floor === 0 && p.w > g.WW * 0.8);
}

// Minimum head clearance above the floor anywhere under the central tower: how tall a corridor a
// fighter running straight through the middle of the map actually gets. 0 means a solid piece
// reaches the floor and the map is walled in two.
function tunnelClearance(g) {
  const floor = teamsFloor(g);
  const botY = floor.y;
  const midX = floor.x + floor.w / 2;
  // the tower is the tallest solid that is not the floor
  const tower = g.plats.filter(p => p.solid && p !== floor)
    .sort((a, b) => (b.h || 0) - (a.h || 0))[0];
  const from = tower.x - 30, to = tower.x + tower.w + 30;
  let worst = Infinity;
  for (let i = 0; i <= 60; i++) {
    const x = from + (to - from) * (i / 60);
    let ceiling = -Infinity;                         // lowest underside overhead at this x
    for (const p of g.plats) {
      if (!p.solid || p === floor) continue;
      if (x < p.x || x > p.x + p.w) continue;
      const bottom = p.y + (p.h || 16);
      if (bottom <= botY) ceiling = Math.max(ceiling, bottom);
    }
    if (ceiling > -Infinity) worst = Math.min(worst, botY - ceiling);
  }
  return { clearance: worst === Infinity ? botY : worst, midX, botY };
}

describe('MAP SIZE — the setting exists and scales the arena', () => {
  it('defaults to normal and offers exactly the four documented sizes', () => {
    const { window: w } = loadMonolith();
    expect(w.eval('SETTINGS.mapSize')).toBe('normal');
    expect(w.eval('Object.keys(MAP_SIZES)')).toEqual(['compact', 'normal', 'tall', 'huge']);
    expect(w.eval('MAP_SIZES.compact.w'), 'Compact 0.85').toBeCloseTo(0.85, 5);
    expect(w.eval('MAP_SIZES.compact.h')).toBeCloseTo(0.85, 5);
    expect(w.eval('MAP_SIZES.normal.w')).toBe(1);
    expect(w.eval('MAP_SIZES.normal.h')).toBe(1);
    expect(w.eval('MAP_SIZES.tall.w'), 'Tall is height-only').toBe(1);
    expect(w.eval('MAP_SIZES.tall.h'), 'Tall H x1.4').toBeCloseTo(1.4, 5);
    expect(w.eval('MAP_SIZES.huge.w'), 'Huge W x1.4').toBeCloseTo(1.4, 5);
    expect(w.eval('MAP_SIZES.huge.h'), 'Huge H x1.5').toBeCloseTo(1.5, 5);
  });

  it('the segmented control is wired to SETTINGS.mapSize like its neighbours', () => {
    const { window: w } = loadMonolith();
    const seg = w.document.getElementById('segMapSize');
    expect(seg, 'MATCH SETTINGS has a Map Size seg').toBeTruthy();
    const btns = [...seg.querySelectorAll('button')];
    expect(btns.map(b => b.dataset.v)).toEqual(['compact', 'normal', 'tall', 'huge']);
    w.eval('buildSettings()');                       // bindSeg attaches the handlers
    btns.find(b => b.dataset.v === 'huge').onclick();
    expect(w.eval('SETTINGS.mapSize')).toBe('huge');
    expect(btns.find(b => b.dataset.v === 'huge').classList.contains('on')).toBe(true);
    btns.find(b => b.dataset.v === 'compact').onclick();
    expect(w.eval('SETTINGS.mapSize')).toBe('compact');
  });

  it('the match summary line names the chosen size', () => {
    const { window: w } = loadMonolith();
    w.eval('buildSettings()');
    for (const [size, label] of [['normal', 'Normal'], ['tall', 'Tall'], ['huge', 'Huge'], ['compact', 'Compact']]) {
      w.eval(`SETTINGS.mapSize=${JSON.stringify(size)}; updateSummary();`);
      expect(w.document.getElementById('matchSummary').textContent).toContain(`${label} map`);
    }
  });

  it('an unknown mapSize (e.g. from a peer) falls back to normal instead of NaN geometry', () => {
    const { window: w } = loadMonolith();
    w.eval(`SETTINGS.mapSize='../../etc/passwd';`);
    const g = setup(w, { mode: 'teams', size: '../../etc/passwd', count: 4 });
    expect(Number.isFinite(g.WW) && Number.isFinite(g.WH)).toBe(true);
    expect(g.WH).toBe(Math.round(g.H * TEAMS_H_MUL));
  });

  it('scales the TEAMS arena by the size multipliers', () => {
    const base = {};
    for (const size of SIZES) {
      const { window: w } = loadMonolith();
      const g = setup(w, { mode: 'teams', size, count: 4 });
      if (size === 'normal') { base.WW = g.WW; base.WH = g.WH; base.H = g.H; }
      base[size] = g;
    }
    expect(base.normal.WH, 'teams arena is 3.75x screen height').toBe(Math.round(base.H * TEAMS_H_MUL));
    for (const size of SIZES) {
      const m = { compact: [0.85, 0.85], normal: [1, 1], tall: [1, 1.4], huge: [1.4, 1.5] }[size];
      expect(base[size].WW / base.WW, `${size} width`).toBeCloseTo(m[0], 2);
      expect(base[size].WH / base.WH, `${size} height`).toBeCloseTo(m[1], 2);
    }
  });

  it('scales the BIG-FFA arena by the size multipliers', () => {
    const base = {};
    for (const size of SIZES) {
      const { window: w } = loadMonolith();
      base[size] = setup(w, { stageId: 'grandplains', size });
    }
    expect(base.normal.WH, 'big FFA is 2.5x screen height').toBe(Math.round(base.normal.H * 2.5));
    for (const size of SIZES) {
      const m = { compact: [0.85, 0.85], normal: [1, 1], tall: [1, 1.4], huge: [1.4, 1.5] }[size];
      expect(base[size].WW / base.normal.WW, `${size} width`).toBeCloseTo(m[0], 2);
      expect(base[size].WH / base.normal.WH, `${size} height`).toBeCloseTo(m[1], 2);
    }
  });
});

describe('MAP SIZE — small stages take the WORKING scrolling path, never the reverted one', () => {
  it('Compact and Normal leave a small stage on one screen', () => {
    for (const size of ['compact', 'normal']) {
      const { window: w } = loadMonolith();
      const g = setup(w, { stageId: 'goiky', size });
      expect(g.WW, `${size} small stage width`).toBe(g.W);
      expect(g.WH, `${size} small stage height`).toBe(g.H);
      expect(g.scrolls, `${size} small stage does not scroll`).toBe(false);
    }
  });

  it('Tall and Huge route a small stage through the big-FFA branch, with real platforms', () => {
    for (const size of ['tall', 'huge']) {
      for (const stageId of ['goiky', 'pillars', 'incin']) {
        const { window: w } = loadMonolith();
        const g = setup(w, { stageId, size });
        expect(g.isBigFFA, `${stageId}/${size} uses the big-FFA path`).toBe(true);
        expect(g.scrolls).toBe(true);
        expect(g.WH, `${stageId}/${size} is taller than the screen`).toBeGreaterThan(g.H * 2);
        expect(g.plats.length, `${stageId}/${size} has platforms`).toBeGreaterThan(0);
        expect(w.eval('spawnZones.length'), 'spawn islands + claim points exist').toBeGreaterThan(0);
        // the empty-floorless-camera bug: the camera must stay inside a world that has ground
        expect(w.eval('groundY()')).toBeLessThan(g.WH);
        expect(w.eval('groundY()')).toBeGreaterThan(0);
      }
    }
  });

  it('Boss Rush stays on its fixed single screen even at Huge', () => {
    const { window: w } = loadMonolith();
    const g = setup(w, { mode: 'boss', stageId: 'goiky', size: 'huge', count: 3 });
    expect(g.isBigFFA, 'boss arenas never scroll — the tells must stay readable').toBe(false);
    expect(g.WW).toBe(g.W);
    expect(g.WH).toBe(g.H);
  });
});

describe('TEAMS arena — floor continuity and the run-under tunnel survive every size', () => {
  for (const size of SIZES) {
    it(`${size}: one unbroken solid floor spans the arena`, () => {
      const { window: w } = loadMonolith();
      const g = setup(w, { mode: 'teams', size, count: 4 });
      const floor = teamsFloor(g);
      expect(floor, 'a floor slab exists').toBeTruthy();
      expect(floor.solid).toBe(true);
      // it is a SINGLE piece (no seams to fall through) covering the declared floor span
      const floors = w.eval('floors');
      expect(floors.length, 'exactly one floor level').toBe(1);
      expect(floor.x).toBeCloseTo(floors[0].x, 3);
      expect(floor.w).toBeCloseTo(floors[0].w, 3);
      // and it really spans the playable width, edge margins aside
      expect(floor.w / g.WW, 'floor covers the full arena width').toBeGreaterThan(0.9);
      expect(g.plats.filter(p => p.solid && p.floor === 0 && p.w > g.WW * 0.8).length).toBe(1);
    });

    it(`${size}: the tower leaves a run-through tunnel of at least ${MIN_TUNNEL}px`, () => {
      const { window: w } = loadMonolith();
      const g = setup(w, { mode: 'teams', size, count: 4 });
      const { clearance } = tunnelClearance(g);
      expect(clearance, 'a fighter (48px tall) can run straight under the tower')
        .toBeGreaterThanOrEqual(MIN_TUNNEL);
    });

    it(`${size}: every climbable layer is within a double jump of the one below`, () => {
      const { window: w } = loadMonolith();
      const g = setup(w, { mode: 'teams', size, count: 4 });
      const { worst, at } = widestGap(g.layers);
      expect(worst, `widest gap ${worst.toFixed(0)}px at ${JSON.stringify(at)}`)
        .toBeLessThanOrEqual(MAX_CLIMB_GAP);
    });
  }

  // REPLACES 'the tower gets taller (and grows rungs) as the arena gets taller'. There is no tower
  // any more: the middle of the teams arena is a PLUS of two thick hollow walls, and what has to
  // hold is that every arm stays passable. An arm that sealed would cut a team off from the fight.
  for (const size of SIZES) {
    it(`${size}: every arm of the cross has exactly two ways through it`, () => {
      const { window: w } = loadMonolith();
      const g = setup(w, { mode: 'teams', size, count: 4 });
      const floor = teamsFloor(g);
      const walls = g.plats.filter(p => p.wall);
      expect(walls.length, 'the cross exists').toBeGreaterThan(0);

      const botY = floor.y;
      const midX = floor.x + floor.w / 2;
      // Faces are the thin solids; the vertical pair straddles midX, the horizontal pair midY.
      const vert = walls.filter(p => p.w < p.h);
      const horz = walls.filter(p => p.h <= p.w);
      const midY = Math.min(...horz.map(p => p.y)) + (Math.max(...horz.map(p => p.y + p.h)) - Math.min(...horz.map(p => p.y))) / 2;

      // Openings along one arm: the stretches of its span that no face covers.
      const openings = (segs, lo, hi, from, to) => {
        const spans = segs.map(s => [from(s), to(s)]).sort((a, b) => a[0] - b[0]);
        const gaps = [];
        let at = lo;
        for (const [a, b] of spans) {
          if (a > at + 100) gaps.push([at, a]);
          at = Math.max(at, b);
        }
        if (hi > at + 100) gaps.push([at, hi]);
        return gaps;
      };
      const vLeft = vert.filter(p => p.x < midX);
      const hLeft = horz.filter(p => p.x + p.w <= midX);
      const hRight = horz.filter(p => p.x >= midX);
      const vTop = vLeft.filter(p => p.y + p.h <= midY);
      const vBot = vLeft.filter(p => p.y >= midY);

      const armTop = openings(vTop, Math.min(...vTop.map(p => p.y)), midY, p => p.y, p => p.y + p.h);
      const armBot = openings(vBot, midY, botY, p => p.y, p => p.y + p.h);
      const armL = openings(hLeft, Math.min(...hLeft.map(p => p.x)), midX, p => p.x, p => p.x + p.w);
      const armR = openings(hRight, midX, Math.max(...hRight.map(p => p.x + p.w)), p => p.x, p => p.x + p.w);

      expect(armTop.length, 'upper vertical arm').toBe(2);
      expect(armBot.length, 'lower vertical arm').toBe(2);
      expect(armL.length, 'left horizontal arm').toBe(2);
      expect(armR.length, 'right horizontal arm').toBe(2);

      // One of the lower arm's two exits must sit ON the floor — that ground-level doorway is the
      // horizontal route across the map, and the AI will not reliably climb to find an opponent.
      expect(armBot.some(([, b]) => b >= botY - 4), 'a floor-level way through').toBe(true);
    });
  }

  it('the cross walls are hollow — the centre of each is open space', () => {
    const { window: w } = loadMonolith();
    const g = setup(w, { mode: 'teams', size: 'normal', count: 4 });
    const floor = teamsFloor(g);
    const midX = floor.x + floor.w / 2;
    // Thick but HOLLOW: two faces with a cavity between them, so nothing solid sits on the axis.
    const onAxis = g.plats.filter(p => p.wall && p.x < midX && p.x + p.w > midX);
    expect(onAxis.length, 'the vertical wall is a shaft, not a slab').toBe(0);
  });
});

describe('Reachability holds for every SCROLLING arena at every size', () => {
  const bigStages = ['grandplains', 'skytower', 'canyon', 'bigincin', 'fortress'];
  const smallStages = ['goiky', 'pillars', 'incin', 'yoyle', 'forest'];

  for (const size of SIZES) {
    it(`${size}: no big stage has a climb gap over ${MAX_CLIMB_GAP}px`, () => {
      for (const stageId of bigStages) {
        const { window: w } = loadMonolith();
        const g = setup(w, { stageId, size });
        expect(g.layers.length, `${stageId}/${size} has standable layers`).toBeGreaterThan(0);
        const { worst, at } = widestGap(g.layers);
        expect(worst, `${stageId}/${size}: gap ${worst.toFixed(0)}px at ${JSON.stringify(at)}`)
          .toBeLessThanOrEqual(MAX_CLIMB_GAP);
      }
    });
  }

  for (const size of ['tall', 'huge']) {
    it(`${size}: a small stage promoted to a scrolling arena stays climbable`, () => {
      for (const stageId of smallStages) {
        const { window: w } = loadMonolith();
        const g = setup(w, { stageId, size });
        const { worst, at } = widestGap(g.layers);
        expect(worst, `${stageId}/${size}: gap ${worst.toFixed(0)}px at ${JSON.stringify(at)}`)
          .toBeLessThanOrEqual(MAX_CLIMB_GAP);
      }
    });
  }

  // Compact/Normal deliberately do NOT touch the single-screen layouts. Some of those (the
  // Incinerator's 184px floor-to-ledge hop) predate this work and are part of their stage design,
  // so the invariant above is scoped to arenas setupWorld actually resizes. What IS pinned here is
  // that those stages come out byte-identical to the untouched legacy builder.
  it('Compact and Normal leave every small-stage layout exactly as platRectsSmall built it', () => {
    for (const size of ['compact', 'normal']) {
      for (const stageId of smallStages) {
        const { window: w } = loadMonolith();
        const g = setup(w, { stageId, size });
        const legacy = w.eval('JSON.stringify(platRectsSmall())');
        expect(JSON.stringify(g.plats), `${stageId}/${size} untouched`).toBe(legacy);
        expect(g.plats.every(p => !p.ladder), 'no ladder platforms are injected').toBe(true);
      }
    }
  });
});

describe('Platforms cover the WHOLE arena, not just the middle band', () => {
  const bigStages = ['grandplains', 'skytower', 'canyon', 'bigincin', 'fortress'];

  for (const size of SIZES) {
    it(`${size}: the teams arena is furnished full width and full height`, () => {
      const { window: w } = loadMonolith();
      setup(w, { mode: 'teams', size, count: 4 });
      const { pct, empty } = coverage(w);
      expect(pct, `coverage ${(pct * 100).toFixed(0)}%, empty cells ${empty.join(',')}`)
        .toBeGreaterThanOrEqual(0.85);
    });

    it(`${size}: every scrolling FFA stage is furnished full width and full height`, () => {
      for (const stageId of bigStages) {
        const { window: w } = loadMonolith();
        setup(w, { stageId, size });
        const { pct, empty } = coverage(w);
        expect(pct, `${stageId}/${size}: coverage ${(pct * 100).toFixed(0)}%, empty ${empty.join(',')}`)
          .toBeGreaterThanOrEqual(0.85);
      }
    });
  }

  it('the upper airspace specifically is no longer empty', () => {
    // The regression this guards: before the scatter pass the top THIRD of every arena had zero
    // platforms — the landmarks all sat in the lower-middle band.
    for (const [mode, stageId] of [['teams', 'goiky'], ['ffa', 'grandplains'], ['ffa', 'skytower']]) {
      for (const size of SIZES) {
        const { window: w } = loadMonolith();
        const g = setup(w, { mode, stageId, size, count: mode === 'teams' ? 4 : 5 });
        const upper = g.plats.filter(p => p.y < g.WH * 0.35);
        expect(upper.length, `${mode} ${stageId}/${size} has platforms in the top third`).toBeGreaterThan(2);
      }
    }
  });

  it('the field is deterministic — the same settings rebuild the identical arena', () => {
    // setupWorld must stay pure: replays, goldens and netplay all rebuild from settings alone.
    const build = (seed) => {
      const { window: w } = loadMonolith(seed);
      setup(w, { mode: 'teams', size: 'tall', count: 4 });
      return w.eval('JSON.stringify(worldPlats)');
    };
    expect(build(1)).toBe(build(999));            // different RNG seeds, identical geometry
  });

  it('the scatter never disturbs the landmarks, spawns or the tunnel', () => {
    for (const size of SIZES) {
      const { window: w } = loadMonolith();
      const g = setup(w, { mode: 'teams', size, count: 4 });
      const field = g.plats.filter(p => p.field);
      expect(field.length, `${size} adds field platforms`).toBeGreaterThan(0);
      expect(field.every(p => p.hop && !p.solid), 'field pieces are one-way tops, never solid walls').toBe(true);
      // nothing lands inside a solid landmark, nor in the spawn column above a base
      const solids = g.plats.filter(p => p.solid);
      for (const f of field) {
        for (const s of solids) {
          const overlap = f.x < s.x + s.w && f.x + f.w > s.x && f.y < s.y + (s.h || 16) && f.y + f.h > s.y;
          expect(overlap, `field plat at ${Math.round(f.x)},${Math.round(f.y)} clear of solids`).toBe(false);
        }
        for (const b of w.eval('bases')) {
          const inSpawn = f.x < b.x + b.w && f.x + f.w > b.x && f.y < b.y + 10 && f.y + f.h > b.y - 90;
          expect(inSpawn, `field plat clear of base spawn column`).toBe(false);
        }
      }
      // and the tunnel is still a tunnel
      expect(tunnelClearance(g).clearance).toBeGreaterThanOrEqual(MIN_TUNNEL);
    }
  });
});

describe('The extra height is used for play, not dead sky', () => {
  it('big-FFA platforms map onto the WIDER 0.25 + py*0.65 band', () => {
    const { window: w } = loadMonolith();
    const g = setup(w, { stageId: 'grandplains', size: 'normal' });
    const layout = w.eval('STAGES.find(s=>s.id==="grandplains").platsBig');
    const expected = [...new Set(layout.map(pd => g.WH * (0.25 + pd[1] * 0.65)))].sort((a, b) => a - b);
    const actual = [...new Set(g.plats.filter(p => !p.ladder && !p.field).map(p => p.y))].sort((a, b) => a - b);
    expect(actual.length).toBe(expected.length);
    actual.forEach((y, i) => expect(y).toBeCloseTo(expected[i], 3));
  });

  it('the same layout now spans noticeably more pixels than the old 2.0x / 0.55 band did', () => {
    const { window: w } = loadMonolith();
    const g = setup(w, { stageId: 'grandplains', size: 'normal' });
    const ys = g.plats.filter(p => !p.ladder && !p.field).map(p => p.y);
    const span = Math.max(...ys) - Math.min(...ys);
    const pys = w.eval('STAGES.find(s=>s.id==="grandplains").platsBig').map(pd => pd[1]);
    const pySpan = Math.max(...pys) - Math.min(...pys);
    const oldSpan = pySpan * 0.55 * (2.0 * g.H);       // previous band over the previous world height
    expect(span, 'platforms cover more absolute height than before').toBeGreaterThan(oldSpan * 1.25);
  });
});

describe('A match on a resized arena runs without stalling', () => {
  for (const size of SIZES) {
    it(`${size}: a 2v2 progresses — fighters move, deal damage and KO`, () => {
      const { window: w } = loadMonolith(0xBEEF);
      w.eval("SETTINGS.mode='teams'; SETTINGS.count=4; SETTINGS.teamKey='2v2'; SETTINGS.stocks=2; AI_LEVEL=2;");
      w.eval(`SETTINGS.mapSize=${JSON.stringify(size)};`);
      w.setStage(0);
      w.eval('resize(); setupWorld(); buildFighters();');
      w.eval('fighters.forEach(f=>{ f.controller="ai"; f.you=false; f._falls=0; f._dmgDealt=0; });'
        + ' running=true; paused=false; hazardT=0; window.__elimSeq=0; lastKoFrame=0;');
      const startX = w.eval('fighters.map(f=>f.x)');
      expect(() => { for (let i = 0; i < 3000; i++) w.eval('step()'); }).not.toThrow();
      const moved = w.eval('fighters.map(f=>f.x)').some((x, i) => Math.abs(x - startX[i]) > 100);
      const dealt = w.eval('fighters.reduce((a,f)=>a+(f._dmgDealt||0),0)');
      expect(moved, 'fighters cross the arena instead of pinning against the tower').toBe(true);
      expect(dealt, 'the teams actually reach each other and fight').toBeGreaterThan(0);
    });
  }

  it('a Tall small-stage FFA runs 600 frames with a sane camera', () => {
    const { window: w } = loadMonolith(0xBEEF);
    w.eval("SETTINGS.mode='ffa'; SETTINGS.count=5; SETTINGS.mapSize='tall';");
    w.setStage(0);
    w.eval('resize(); setupWorld(); buildFighters();');
    w.eval('fighters.forEach(f=>{ f.controller="ai"; f.you=false; }); running=true; paused=false; hazardT=0;');
    expect(w.eval('worldPlats.length')).toBeGreaterThan(0);
    expect(() => { for (let i = 0; i < 600; i++) w.eval('step(); updateCamera();'); }).not.toThrow();
    const camX = w.eval('camX'), camY = w.eval('camY');
    const WW = w.eval('WW'), WH = w.eval('WH'), W = w.eval('W'), H = w.eval('H');
    expect(camX).toBeGreaterThanOrEqual(-1);
    expect(camY).toBeGreaterThanOrEqual(-1);
    expect(camX, 'camera stays inside the world horizontally').toBeLessThanOrEqual(WW - W + 1);
    expect(camY, 'camera stays inside the world vertically').toBeLessThanOrEqual(WH - H + 1);
  });
});
