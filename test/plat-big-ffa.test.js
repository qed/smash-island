import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';
import { SETUP_SRC } from './helpers/match-setup.js';

// THE BIG FFA ARENAS: a CPU climbs to a ledge instead of pacing under it.
//
// Measured 2026-10-13 (scripts/plat-probe.mjs): on Grand Plains the spawn-point goal sits 800 px above the floor, and the CPU walked
// under it and hopped at it from the floor for the whole 17 s the stale clock gave it; and a jump that carried its feet past the top of
// the step it was climbing to dropped that step and swung away in mid-air. One invariant: alone with a still foe on the far side, a CPU
// on the floor of Grand Plains is standing on, or above, the row of the claim points inside 900 steps (15 s).

describe('big FFA arenas: pathing to a ledge', () => {
  it('a CPU on the Grand Plains floor climbs to the spawn points\' row within 15 s', () => {
    const { window: w } = loadMonolith(11005);
    try {
      w.eval(SETUP_SRC);
      w.eval(`__setupCustomMatch(["Firey","Pen"], 3, 2)`);
      w.eval(`(function(){
        stage = STAGES.find(function(s){ return s.id === 'grandplains'; });
        resize(); setupWorld();
        var a = fighters[0], b = fighters[1];
        a.x = WW*0.12; a.y = groundY() - a.r; b.x = WW*0.88; b.y = groundY() - b.r;
        b.controller = 'still';
      })()`);
      const info = w.eval('({ big: isBigFFA(), claimY: Math.min.apply(null, spawnZones.filter(function(z){ return z.kind === "claim"; }).map(function(z){ return z.y; })), floor: groundY() })');
      expect(info.big).toBe(true);
      let top = Infinity;
      for (let i = 0; i < 900; i++) {
        w.eval('step()');
        top = Math.min(top, w.eval('fighters[0].y + fighters[0].r'));
      }
      // the claim points are ~800 px above the floor; reaching within 120 px of their row is a climb of the whole ledge field
      expect(info.floor - top).toBeGreaterThan(info.floor - info.claimY - 120);
    } finally { try { w.close && w.close(); } catch { /* best effort */ } }
  }, 120000);
});
