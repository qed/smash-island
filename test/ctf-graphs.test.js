import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { loadMonolith } from './helpers/load-monolith.js';

// THE SHIPPED ROUTE GRAPHS (artifacts/V1/assets/ctf/<map>-graph.json, made offline by scripts/ctf-build-graphs.mjs). The game loads one at match start instead of
// simulating every move of the map; so a map, a physics number or the move search that changes WITHOUT the files being rebuilt must fail here, loudly.
// Fast: the file is this map's (fingerprint) and fills the graph at once. Slow: it is exactly what the builder makes now (the whole graph, built again).

const MAPS = ['castle', 'mines', 'factory', 'forest', 'sky', 'oak', 'oak~'];   // (oak~: the asymmetric map with its sides swapped by the bid: its own graph, <id>-swap-graph.json)
const file = (id) => `artifacts/V1/assets/ctf/${id.replace('~', '-swap')}-graph.json`;   // (relative to the repo root, as loadMonolith reads the game)
const REBUILD = 'run: node scripts/ctf-build-graphs.mjs   (a map, a physics number or ctfNavProbe changed; the shipped graphs are stale)';

for (const id of MAPS) {
  describe(`route graph ${id}`, () => {
    it('is shipped, belongs to the current map and fills the graph at once', () => {
      expect(existsSync(file(id)), `no graph file for ${id}. ${REBUILD}`).toBe(true);
      const data = JSON.parse(readFileSync(file(id), 'utf8'));
      const { window: w } = loadMonolith(7);
      w.eval(`CTF_GRAPHS[${JSON.stringify(id)}] = ${JSON.stringify(data)};`);
      const r = JSON.parse(w.eval(`(function(){
        var M = ctfMapGet(${JSON.stringify(id.replace('~', ''))}, ${id.endsWith('~')}), nav = ctfNavMake(M);
        return JSON.stringify({ fp: ctfNavFingerprint(M), ready: nav.ready, shipped: !!nav.shipped, nodes: nav.nodes.length, moves: nav.nodes.reduce(function(a, n){ return a + n.edges.filter(function(e){ return e.kind !== 'walk'; }).length; }, 0), reach: !!(nav.reach[0] && nav.reach[1]) });
      })()`));
      expect(data.fp, `graph file is for another version of the ${id} map. ${REBUILD}`).toBe(r.fp);
      expect(r.ready).toBe(true);
      expect(r.shipped).toBe(true);
      expect(r.nodes).toBe(data.n);
      expect(r.moves, 'moves between the places').toBeGreaterThan(r.nodes);
      expect(r.reach).toBe(true);
    });

    it('is exactly what the builder makes now', { timeout: 240000 }, () => {
      const data = JSON.parse(readFileSync(file(id), 'utf8'));
      const { window: w } = loadMonolith(7);
      const built = JSON.parse(w.eval(`(function(){ CTF.noShipped = true; var nav = ctfNavNew(ctfMapGet(${JSON.stringify(id.replace('~', ''))}, ${id.endsWith('~')})); while(!nav.ready) ctfNavTick(nav, 500); return JSON.stringify(ctfNavPack(nav)); })()`));
      expect(built.fp).toBe(data.fp);
      expect(built.nodes.length).toBe(data.nodes.length);
      const bad = built.nodes.findIndex((l, i) => JSON.stringify(l) !== JSON.stringify(data.nodes[i]));
      expect(bad, `place ${bad}'s moves differ from the shipped file. ${REBUILD}`).toBe(-1);
    });
  });
}

describe('route graph loading', () => {
  for (const ok of [true, false]) {
    it(ok ? 'a fetched graph fills the map while the CPUs wait' : 'a failed fetch leaves the runtime builder to build it, as before', async () => {
      const data = JSON.parse(readFileSync(file('mines'), 'utf8'));
      const { window: w } = loadMonolith(7);
      w.fetch = ok ? async () => ({ ok: true, json: async () => data }) : async () => { throw new Error('offline'); };
      w.eval(`CTF.navs = {}; CTF.mapId = 'mines'; CTF.map = ctfMapGet('mines'); globalThis.__nav = CTF.navs.mines = ctfNavMake(CTF.map);`);
      expect(w.eval('__nav.pending && !__nav.ready')).toBe(true);
      w.eval('ctfNavTick(__nav, 50)');
      expect(w.eval('__nav.cursor'), 'nothing is built while the file is on its way').toBe(0);
      await new Promise((r) => setTimeout(r, 30));
      expect(w.eval('__nav.pending')).toBe(false);
      if (ok) { expect(w.eval('__nav.ready && __nav.shipped')).toBe(true); }
      else { w.eval('ctfNavTick(__nav, 5)'); expect(w.eval('__nav.cursor && !__nav.ready')).toBeTruthy(); }
      w.close();
    });
  }
});
