import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// THE TEAMS ARENA'S CENTRAL SHAFT has a rung every SHAFT_STEP (104 px) all the way up, through the centre chamber too.
// It used to skip the chamber: two rungs missing, a 312 px hole no jump clears (a CPU hung at its mouth for 8 s at a time).
// One's and Steve Cobs's arenas are cut from the same layout and keep the chamber clear.

function rungs(w, quadsOnly) {
  return w.eval(`(function(){
    SETTINGS.mode = 'teams'; SETTINGS.count = 4; SETTINGS.teamKey = '2v2'; SETTINGS.mapSize = 'normal';
    TEAMS_QUADS_ONLY = ${quadsOnly ? 'true' : 'false'};
    try { resize(); setupWorld(); } finally { TEAMS_QUADS_ONLY = false; }
    var hops = worldPlats.filter(function(p){ return p.hop && !p.solid && p.floor === 0 && p.w > 140 && p.w < 200; });
    var best = {};
    hops.forEach(function(p){ var k = Math.round(p.x); best[k] = (best[k] || []); best[k].push(p.y); });
    var col = Object.keys(best).sort(function(a, b){ return best[b].length - best[a].length; })[0];
    return best[col].sort(function(a, b){ return a - b; });
  })()`);
}

describe('teams arena: the central shaft ladder', () => {
  it('has no gap taller than a double jump clears', async () => {
    const { window: w } = loadMonolith(5);
    await new Promise((r) => setTimeout(r, 200));   // let the boot's async tasks land before the window closes
    try {
      const ys = rungs(w, false);
      expect(ys.length).toBeGreaterThan(10);
      let worst = 0;
      for (let i = 1; i < ys.length; i++) worst = Math.max(worst, ys[i] - ys[i - 1]);
      expect(worst).toBeLessThanOrEqual(110);
    } finally { try { w.close && w.close(); } catch { /* best effort */ } }
  }, 60000);

  it('One\'s and Cobs\'s arena (the corner layout) keeps its centre chamber clear', async () => {
    const { window: w } = loadMonolith(5);
    await new Promise((r) => setTimeout(r, 200));
    try {
      const ys = rungs(w, true);
      let worst = 0;
      for (let i = 1; i < ys.length; i++) worst = Math.max(worst, ys[i] - ys[i - 1]);
      expect(worst).toBeGreaterThan(200);
    } finally { try { w.close && w.close(); } catch { /* best effort */ } }
  }, 60000);
});
