import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// Wave 2 — the quick map generator.
//
// The generator's whole promise is "one click, a level you can actually play". These tests hold it
// to that literally: every archetype × size × density combination is generated, mapped through the
// REAL setupWorld() into world pixels, and measured — because normalized-space arithmetic being
// self-consistent proves nothing about whether a fighter can climb the result.
//
// The load-bearing invariant is REACHABILITY. A custom level is the one arena path that never runs
// through fillClimbGaps(): setupWorld() maps CUSTOM_LEVEL.plats straight onto worldPlats, so a
// layer stranded more than a double jump above everything below it stays stranded for the entire
// match with nothing at runtime to repair it.

const TYPES = ['arena', 'towers', 'islands', 'staircase', 'cavern', 'gauntlet'];
const SIZES = ['compact', 'normal', 'tall', 'huge'];
const DENSITIES = ['sparse', 'normal', 'dense'];
const MAX_CLIMB_GAP = 180;   // a double jump gains ~160-180 world px (MAX_HOP_RISE = 170)

function gen(w, cfg) {
  return w.eval(`JSON.stringify(generateMap(${JSON.stringify(cfg)}))`);
}
// Load a generated level as the live CUSTOM_LEVEL and rebuild the world through the real code path.
function realize(w, cfg) {
  w.eval(`
    CUSTOM_LEVEL = generateMap(${JSON.stringify(cfg)});
    SETTINGS.mode='ffa'; SETTINGS.count=5; SETTINGS.mapSize='normal';
    resize(); setupWorld();
  `);
  return {
    W: w.eval('W'), H: w.eval('H'),
    plats: w.eval('JSON.parse(JSON.stringify(worldPlats))'),
    zones: w.eval('JSON.parse(JSON.stringify(worldZones))'),
    ground: w.eval('groundY()'),
    spawns: w.eval('JSON.parse(JSON.stringify(CUSTOM_LEVEL.spawns))'),
  };
}

describe('map generator — every combination produces a climbable arena', () => {
  it('never leaves a layer more than one double jump above the one below it', () => {
    const { window: w } = loadMonolith();
    const offenders = [];
    for (const type of TYPES) {
      for (const size of SIZES) {
        for (const density of DENSITIES) {
          const world = realize(w, { type, size, density, effects: 'none', seed: 4242 });
          // Every standable surface, floor included — exactly what climbLayers() measures for the
          // built-in stadiums. One-way tops can be jumped THROUGH from below, so a platform's own
          // top is the surface that matters.
          const ys = world.plats.map(p => p.y).concat([world.ground]).sort((a, b) => a - b);
          for (let i = 0; i < ys.length - 1; i++) {
            const gap = ys[i + 1] - ys[i];
            if (gap > MAX_CLIMB_GAP) {
              offenders.push(`${type}/${size}/${density}: ${Math.round(gap)}px gap at y=${Math.round(ys[i])}`);
            }
          }
        }
      }
    }
    expect(offenders, 'unclimbable gaps in generated maps').toEqual([]);
  });

  it('keeps every platform inside the arena and off the blast zones', () => {
    const { window: w } = loadMonolith();
    const bad = [];
    for (const type of TYPES) {
      for (const size of SIZES) {
        const world = realize(w, { type, size, density: 'dense', effects: 'none', seed: 77 });
        for (const p of world.plats) {
          if (p.x < -1 || p.x + p.w > world.W + 1) bad.push(`${type}/${size}: x=${Math.round(p.x)} w=${Math.round(p.w)} of ${world.W}`);
          if (p.y < 0 || p.y > world.ground) bad.push(`${type}/${size}: y=${Math.round(p.y)} vs ground ${Math.round(world.ground)}`);
          if (p.w < 10) bad.push(`${type}/${size}: platform ${Math.round(p.w)}px wide — nothing can land on it`);
        }
      }
    }
    expect(bad, 'platforms outside the playable arena').toEqual([]);
  });

  it('passes its own validator for every combination', () => {
    const { window: w } = loadMonolith();
    const failures = w.eval(`
      (function(){
        var out=[];
        var types=${JSON.stringify(TYPES)}, sizes=${JSON.stringify(SIZES)}, dens=${JSON.stringify(DENSITIES)};
        for (var a=0;a<types.length;a++) for (var b=0;b<sizes.length;b++) for (var c=0;c<dens.length;c++) {
          for (var s=1;s<=6;s++){
            var lvl = generateMap({type:types[a], size:sizes[b], density:dens[c], effects:'wild', seed:s*99991});
            var bad = mapgenValidate(lvl);
            if (bad.length) out.push(types[a]+'/'+sizes[b]+'/'+dens[c]+'#'+s+': '+bad[0]);
          }
        }
        return out;
      })()`);
    expect(failures, 'generated levels failing mapgenValidate').toEqual([]);
  });
});

describe('map generator — spawns are somewhere you can actually stand', () => {
  it('places a spawn for a full 5-fighter FFA, spread across the arena', () => {
    const { window: w } = loadMonolith();
    const world = realize(w, { type: 'islands', size: 'tall', density: 'normal', effects: 'none', seed: 5 });
    expect(world.spawns.length, 'one spawn per MAX_FFA slot').toBe(5);
    const xs = world.spawns.map(s => s.nx).sort((a, b) => a - b);
    expect(xs[0], 'leftmost spawn is off the wall').toBeGreaterThan(0.05);
    expect(xs[xs.length - 1], 'rightmost spawn is off the wall').toBeLessThan(0.95);
    for (let i = 0; i < xs.length - 1; i++) {
      expect(xs[i + 1] - xs[i], 'spawns are not stacked on top of each other').toBeGreaterThan(0.05);
    }
  });

  it('drops every spawn onto a surface rather than into dead air', () => {
    // A spawn is sound if there is a standable surface below it within a short fall — either a
    // one-way platform it lands on, or the floor. Anything else is a fighter falling from the
    // spawn point through the whole map on frame one.
    const { window: w } = loadMonolith();
    const orphans = [];
    for (const type of TYPES) {
      const world = realize(w, { type, size: 'huge', density: 'sparse', effects: 'none', seed: 31337 });
      for (const s of world.spawns) {
        const sx = s.nx * world.W, sy = s.ny * world.H;
        const below = world.plats.filter(p => !p.solid && sx >= p.x && sx <= p.x + p.w && p.y >= sy)
          .map(p => p.y).concat([world.ground]).sort((a, b) => a - b)[0];
        if (below - sy > MAX_CLIMB_GAP * 2) orphans.push(`${type}: spawn at y=${Math.round(sy)} has nothing until ${Math.round(below)}`);
      }
    }
    expect(orphans, 'spawns hanging over nothing').toEqual([]);
  });
});

describe('map generator — the controls actually control something', () => {
  it('is deterministic: the same settings and seed rebuild the identical map', () => {
    const { window: w } = loadMonolith();
    const cfg = { type: 'cavern', size: 'tall', density: 'dense', effects: 'heavy', seed: 8675309 };
    expect(gen(w, cfg)).toBe(gen(w, cfg));
  });

  it('gives a different map for a different seed', () => {
    const { window: w } = loadMonolith();
    const base = { type: 'islands', size: 'normal', density: 'normal', effects: 'none' };
    expect(gen(w, { ...base, seed: 1 })).not.toBe(gen(w, { ...base, seed: 2 }));
  });

  it('PLATFORMS raises the platform count and SIZE raises the layer count', () => {
    const { window: w } = loadMonolith();
    const count = (cfg) => JSON.parse(gen(w, cfg)).plats.length;
    const layers = (cfg) => new Set(JSON.parse(gen(w, cfg)).plats.map(p => p.ny.toFixed(4))).size;
    const base = { type: 'islands', effects: 'none', seed: 9 };
    expect(count({ ...base, size: 'normal', density: 'dense' }))
      .toBeGreaterThan(count({ ...base, size: 'normal', density: 'sparse' }));
    expect(layers({ ...base, size: 'huge', density: 'normal' }))
      .toBeGreaterThan(layers({ ...base, size: 'compact', density: 'normal' }));
  });

  it('EFFECTS controls the number of zones, and none means none', () => {
    const { window: w } = loadMonolith();
    const zones = (effects) => JSON.parse(gen(w, { type: 'arena', size: 'tall', density: 'normal', effects, seed: 12 })).zones;
    expect(zones('none').length).toBe(0);
    expect(zones('light').length).toBe(2);
    expect(zones('heavy').length).toBe(4);
    expect(zones('wild').length).toBe(6);
    // …and a zone has to be a real, typed, bounded area or it does nothing in play
    for (const z of zones('wild')) {
      expect(Object.keys(w.eval('JSON.parse(JSON.stringify(ZONE_TYPES))'))).toContain(z.type);
      expect(z.nw).toBeGreaterThan(0);
      expect(z.nh).toBeGreaterThan(0);
      expect(z.strength).toBeGreaterThan(0);
      expect(z.strength, 'zone strength stays inside the editor slider range').toBeLessThanOrEqual(3);
    }
  });

  it('never stacks two zones on the same platform', () => {
    // Overlapping zones combine their effects invisibly and draw their labels on top of each
    // other — it reads as a rendering fault, not a stage feature. Caught in a real browser.
    const { window: w } = loadMonolith();
    for (const type of TYPES) {
      const lvl = JSON.parse(gen(w, { type, size: 'tall', density: 'normal', effects: 'wild', seed: 88 }));
      const seen = new Set();
      for (const z of lvl.zones) {
        const key = `${z.nx.toFixed(4)}@${z.ny.toFixed(4)}`;
        expect(seen.has(key), `${type}: two effect zones on the same platform`).toBe(false);
        seen.add(key);
      }
    }
  });

  it('never buries the spawn line in effect zones', () => {
    // Zones on the lowest layer would sit under every fighter at match start — six damage tiles
    // across the starting line is not a stage, it is a countdown.
    const { window: w } = loadMonolith();
    for (const type of TYPES) {
      const lvl = JSON.parse(gen(w, { type, size: 'normal', density: 'dense', effects: 'wild', seed: 4 }));
      const floorN = w.eval('MAPGEN_FLOOR_N');
      for (const z of lvl.zones) {
        expect(z.ny, `${type}: zone on the spawn line`).toBeLessThan(floorN - 0.14);
      }
    }
  });

  it('each archetype produces a structurally different map from the others', () => {
    const { window: w } = loadMonolith();
    const shapes = TYPES.map(type => gen(w, { type, size: 'tall', density: 'normal', effects: 'none', seed: 2024 }));
    expect(new Set(shapes).size, 'two archetypes generate the same layout').toBe(TYPES.length);
  });
});

describe('map generator — a generated map is a real, playable match', () => {
  // Every fighter must be driven by the AI. Fighter 0 is the CHOSEN fighter and is controller
  // 'local' — with no keyboard attached it stands motionless wherever it spawned, and a lone AI
  // opponent will not reliably finish off an idle target. Measured: that alone accounted for every
  // apparent "stall" in an earlier version of these tests, on generated and shipped stages alike.
  const ALL_AI = `fighters.forEach(function(f){ f.controller='ai'; f.you=false; });`;

  it('boots a full FFA on a generated arena and fighters stand on its geometry', () => {
    const { window: w } = loadMonolith();
    w.eval(`
      CUSTOM_LEVEL = generateMap({type:'staircase', size:'tall', density:'normal', effects:'light', seed:606});
      SETTINGS.mode='ffa'; SETTINGS.count=5; SETTINGS.stocks=2; SETTINGS.itemRate=0;
      beginMatchNow(); ${ALL_AI}
    `);
    expect(w.eval('fighters.length'), 'a full FFA lineup spawned').toBe(5);
    // Run the real loop for a while, then check nobody fell through the world on frame one.
    w.eval('for (var i=0;i<600 && running;i++) step();');
    const fs = JSON.parse(w.eval(`JSON.stringify(fighters.map(function(f){ return {y:f.y, dead:f.dead}; }))`));
    const H = w.eval('H');
    const alive = fs.filter(f => !f.dead);
    expect(alive.length, 'not everyone fell out of a generated map immediately').toBeGreaterThan(0);
    for (const f of alive) {
      expect(f.y, 'a live fighter is inside the arena, not below it').toBeLessThan(H * 1.6);
    }
  });

  it('resolves matches at least as reliably as the shipped stages do', () => {
    // Geometry that walls the AI apart produces matches that never end — a real failure mode on
    // this engine (it cost the taller stadiums a build, and a first cut of this generator parked
    // survivors against the left wall for 12,000 frames).
    //
    // But some matches simply do not resolve on THIS engine regardless of stage: the shipped
    // arenas stall too, at a comparable rate. So the assertion is comparative — a generated arena
    // must be no worse to fight in than a hand-built one — rather than an absolute that would be
    // measuring the AI's quirks and calling them the generator's.
    const play = (setup, seed) => {
      const { window: w } = loadMonolith(seed);
      w.eval(setup + `
        SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.stocks=1; SETTINGS.itemRate=0;
        beginMatchNow(); ${ALL_AI}
        for (var i=0;i<12000 && running;i++) step();
      `);
      return !w.eval('running');
    };
    const generated = TYPES.map((type, i) =>
      play(`CUSTOM_LEVEL = generateMap({type:'${type}', size:'normal', density:'normal', effects:'none', seed:${(i + 1) * 101}});`, (i + 1) * 101));
    const shipped = ['goiky', 'yoyle', 'pillars'].map((id, i) =>
      play(`CUSTOM_LEVEL=null; stage=STAGES[STAGES.findIndex(function(s){return s.id==='${id}';})];`, (i + 1) * 101));

    const genRate = generated.filter(Boolean).length / generated.length;
    const shipRate = shipped.filter(Boolean).length / shipped.length;
    expect(genRate, `generated ${genRate} vs shipped ${shipRate}`).toBeGreaterThanOrEqual(shipRate - 1e-9);
    expect(genRate, 'most generated arenas must resolve outright').toBeGreaterThanOrEqual(0.8);
  }, 300000);
});

describe('map generator — the Generate button', () => {
  it('loads the generated level into the editor, ready to edit, save or play', () => {
    const { window: w } = loadMonolith();
    w.eval('openEditor()');
    const before = w.eval('ED.plats.length');
    expect(before, 'the editor starts empty').toBe(0);
    const ok = w.eval(`(function(){
      document.getElementById('genType').value='towers';
      document.getElementById('genSize').value='tall';
      document.getElementById('genDensity').value='dense';
      document.getElementById('genEffects').value='heavy';
      var lvl = genQuickMap(12345);
      return JSON.stringify({ lvl: !!lvl, plats: ED.plats.length, spawns: ED.spawns.length,
        zones: ED.zones.length, name: document.getElementById('edName').value,
        seedLabel: document.getElementById('genSeedLabel').textContent, gen: GEN });
    })()`);
    const r = JSON.parse(ok);
    expect(r.lvl, 'generation succeeded').toBe(true);
    expect(r.plats, 'platforms landed in the editor').toBeGreaterThan(4);
    expect(r.spawns).toBe(5);
    expect(r.zones).toBe(4);
    expect(r.name, 'the level is pre-named so Save works immediately').toBeTruthy();
    expect(r.seedLabel, 'the seed is shown so a map can be reproduced').toMatch(/seed \w+/);
    expect(r.gen.type).toBe('towers');
    expect(r.gen.seed).toBe(12345);
  });

  it('↻ Again with the same seed reproduces the same map exactly', () => {
    const { window: w } = loadMonolith();
    w.eval('openEditor()');
    const first = w.eval(`(function(){ genQuickMap(555); return JSON.stringify(ED.plats); })()`);
    w.eval('genQuickMap()');                       // a fresh random seed in between
    const again = w.eval(`(function(){ genQuickMap(555); return JSON.stringify(ED.plats); })()`);
    expect(again).toBe(first);
  });

  it('generated levels save and reload through the normal editor storage', () => {
    const { window: w } = loadMonolith();
    w.eval('openEditor()');
    w.eval(`genQuickMap(4321); document.getElementById('edName').value='GenTest';`);
    return w.eval('edSave()').then(async () => {
      const raw = await w.eval(`BStore.get('levels:custom')`);
      const saved = JSON.parse(raw);
      expect(Object.keys(saved), 'the generated level persisted').toContain('GenTest');
      expect(saved.GenTest.plats.length).toBeGreaterThan(4);
      expect(saved.GenTest.spawns.length).toBe(5);
    });
  });
});
