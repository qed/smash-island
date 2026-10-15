import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// THE CAPTURE THE FLAG MAPS, each checked the same way on the real game: it builds, it is the mirror of itself, every side has what a match needs (a home with a pad and spawns,
// a jail with its no-go zone clear of the spawns, doors and keys, a lift), and the CPU's graph of it says every hiding place, key, boost, pad and the jail's door can be reached from
// home, with only the vaults behind their locked doors.

const MAPS = ['castle', 'mines', 'factory', 'forest', 'sky'];

for (const id of MAPS) {
  describe(`map ${id}`, () => {
    it('has a home, a jail clear of the spawns, doors with keys, a lift, hiding places, and is its own mirror', { timeout: 120000 }, () => {
      const { window: w } = loadMonolith(51);
      const r = JSON.parse(w.eval(`(function(){
        var M = ctfMapGet('${id}'), out = {};
        out.WW = M.WW; out.plats = M.plats.length; out.spawns = M.homes.map(function(h){ return h.spawns.length; }); out.pads = M.homes.map(function(h){ return !!h.pad; });
        out.jails = M.jails.length;
        out.spawnInZone = [0, 1].some(function(t){ var z = M.jails[t].zone; return M.homes[t].spawns.some(function(s){ return s.x > z.x && s.x < z.x + z.w && s.y > z.y && s.y < z.y + z.h; }); });
        out.doors = M.doors.length; out.keys = M.keys.length; out.elevs = M.elevs.length; out.spots = M.spots.length; out.coverKinds = Object.keys(M.spots.reduce(function(a, s){ if(s.cover) a[s.cover] = 1; return a; }, {})).length;
        out.zoneKinds = Object.keys((M.zones || []).reduce(function(a, z){ a[z.type] = 1; return a; }, {})).length;
        out.backKinds = Object.keys((M.back || []).reduce(function(a, b){ a[b.kind || 'brick'] = 1; return a; }, {})).length;
        // the mirror: every solid has its twin
        var key = function(p){ return Math.round(p.x) + ',' + Math.round(p.y) + ',' + Math.round(p.w) + ',' + Math.round(p.h) + (p.solid ? 's' : 'h'); };
        var set = {}; M.plats.forEach(function(p){ set[key(p)] = 1; });
        out.mirrored = M.plats.every(function(p){ return set[key({ x:M.WW - p.x - p.w, y:p.y, w:p.w, h:p.h, solid:p.solid })]; });
        return JSON.stringify(out);
      })()`));
      // each map's world width: the castle was 21600 until the owner, 2026-10-14: "the map should be a bit bigger" (castle v3, 110 columns a side); then 2026-10-15: "about 15 screens wide and 4 tall", "some maps could be small with good spots" (castle v4: 84 columns a side, 28 rows); the others are 108 a side now
      expect(r.WW).toBe({ castle: 20160, mines: 25920, factory: 25920, forest: 25920, sky: 25920 }[id]);
      expect(r.mirrored, 'the right half is the left half turned over').toBe(true);
      expect(r.spawns[0], 'spawns').toBeGreaterThanOrEqual(8);
      expect(r.pads).toEqual([true, true]);
      expect(r.jails).toBe(2);
      expect(r.spawnInZone, 'no spawn stands in its own jail zone').toBe(false);
      expect(r.doors, 'a vault with its doors').toBeGreaterThanOrEqual(4);
      expect(r.keys).toBeGreaterThanOrEqual(2);
      expect(r.elevs, 'a lift a side').toBeGreaterThanOrEqual(2);
      expect(r.spots, 'places to hide').toBeGreaterThanOrEqual(80);
      expect(r.coverKinds, 'a wide choice of cover').toBeGreaterThanOrEqual(6);
      expect(r.zoneKinds, 'areas that do things').toBeGreaterThanOrEqual(3);
      expect(r.backKinds, 'more than one wall behind the rooms').toBeGreaterThanOrEqual(3);
    });

    it('has no big empty rooms: no view at play zoom is mostly bare back wall (something to stand on, jump to or hide behind in reach of most of it)', { timeout: 120000 }, () => {
      const { window: w } = loadMonolith(53);
      const r = JSON.parse(w.eval(`(function(){
  var M = ctfMapGet('${id}'), C = 120, cols = Math.round(M.WW/C), rows = Math.round(M.WH/C), z = (typeof CTF_ZOOM !== 'undefined' ? CTF_ZOOM : 0.75);
  var vw = Math.round(1280/z/C), vh = Math.round(720/z/C);   // the view in cells
  var solid = new Uint8Array(cols*rows), serve = new Uint8Array(cols*rows), inBack = new Uint8Array(cols*rows);
  var idx = function(c, r){ return r*cols + c; };
  M.plats.forEach(function(p){ var c0 = Math.floor(p.x/C), c1 = Math.ceil((p.x + p.w)/C) - 1, r0 = Math.floor(p.y/C), r1 = Math.max(r0, Math.ceil((p.y + p.h)/C) - 1);
    for(var r = r0; r <= r1; r++) for(var c = c0; c <= c1; c++) if(c >= 0 && c < cols && r >= 0 && r < rows) solid[idx(c, r)] = p.solid ? 1 : 0;
    // what a plat serves: the cells within 2 of its top edge, a side or an end (something to stand on, or to jump to)
    for(var r = r0 - 1; r <= r1 + 1; r++) for(var c = c0 - 1; c <= c1 + 1; c++) if(c >= 0 && c < cols && r >= 0 && r < rows) serve[idx(c, r)] = 1; });
  var mark = function(x, y, rr){ var c = Math.floor(x/C), r = Math.floor((y - 1)/C); for(var dr = -rr; dr <= rr; dr++) for(var dc = -rr; dc <= rr; dc++){ var cc = c + dc, r2 = r + dr; if(cc >= 0 && cc < cols && r2 >= 0 && r2 < rows) serve[idx(cc, r2)] = 1; } };
  M.spots.forEach(function(s){ mark(s.x, s.y, 1); }); M.keys.forEach(function(k){ mark(k.x, k.y, 1); }); M.boosts.forEach(function(b){ mark(b.x, b.y, 1); }); M.doors.forEach(function(d){ mark(d.x, d.y + d.h/2, 1); });
  M.buffs.forEach(function(b){ mark(b.x, b.y, 1); });
  (M.back || []).forEach(function(b){ if(b.kind === 'sky') return; var c0 = Math.floor(b.x/C), c1 = Math.ceil((b.x + b.w)/C) - 1, r0 = Math.floor(b.y/C), r1 = Math.ceil((b.y + b.h)/C) - 1;
    for(var r = r0; r <= r1; r++) for(var c = c0; c <= c1; c++) if(c >= 0 && c < cols && r >= 0 && r < rows) inBack[idx(c, r)] = 1; });
  var res = [], seen = 0;
  for(var cr = 2; cr < rows - 1; cr += 3) for(var cc = 3; cc < cols/2; cc += 3){
    if(!inBack[idx(cc, cr)] || solid[idx(cc, cr)]) continue;
    var back = 0, bare = 0;
    for(var r = cr - Math.floor(vh/2); r < cr + Math.ceil(vh/2); r++) for(var c = cc - Math.floor(vw/2); c < cc + Math.ceil(vw/2); c++){
      if(c < 0 || c >= cols/2 || r < 0 || r >= rows) continue; var i = idx(c, r); if(!inBack[i] || solid[i]) continue; back++; if(!serve[i]) bare++; }
    seen++;
    if(back > 60 && bare/back > 0.6) res.push({ c:cc, r:cr - (M.dr || 0), f:Math.round(100*bare/back), back:back });
  }
  res.sort(function(a, b){ return b.f - a.f; });
  return JSON.stringify({ view:[vw, vh], sampled:seen, bare:res.length, worst:res.slice(0, 25) });
})()`));
      expect(r.worst, 'views more than 60% bare').toEqual([]);
    });

    it('can be walked: every hiding place, key, boost, pad and the jail door is reachable, vaults only through their doors', { timeout: 180000 }, () => {
      const { window: w } = loadMonolith(52);
      const r = JSON.parse(w.eval(`(function(){
        var M = ctfMapGet('${id}'), nav = ctfNavNew(M); while(!nav.ready) ctfNavTick(nav, 80);
        var bad = [], chk = function(label, x, y){ var n = ctfNavNodeAt(nav, x, y, 10); if(!n) bad.push(label + '(' + Math.round(x/120) + ',' + Math.round(y/120) + ') no node'); else if(!nav.reach[0][n.id]) bad.push(label + '(' + Math.round(x/120) + ',' + Math.round(y/120) + ') unreachable'); };
        M.spots.forEach(function(s){ if(s.team === 0) chk('spot', s.x, s.y); });
        M.keys.forEach(function(k){ chk('key' + k.door, k.x, k.y); });
        M.boosts.forEach(function(b){ chk('boost' + b.kind, b.x, b.y); });
        M.homes.forEach(function(h){ if(h.pad) chk('pad' + h.team, h.pad.x + h.pad.w/2, h.pad.y); });
        M.jails.forEach(function(j){ chk('jail' + j.owner, j.door.x + (j.face === 1 ? j.door.w + 50 : -50), j.door.y + j.door.h); });
        // the other half's mirror reaches the same: the second home reaches the first's jail
        var j0 = M.jails[0], n0 = ctfNavNodeAt(nav, j0.door.x + j0.door.w + 50, j0.door.y + j0.door.h, 10);
        var viaOther = !!(n0 && nav.reach[1][n0.id]);
        // no trap: from every place one can reach, the way back home exists (doors ignored; the super jump not counted)
        var N = nav.nodes, rev = N.map(function(){ return []; });
        N.forEach(function(a){ a.edges.forEach(function(e){ if(e.need || e.doors.some(function(d){ return d[0] === 'J'; })) return; rev[e.to].push(a.id); }); });
        var canHome = new Uint8Array(N.length), q = [];
        M.homes[0].spawns.forEach(function(sp){ var nd = ctfNavNodeAt(nav, sp.x, sp.y, 12); if(nd && !canHome[nd.id]){ canHome[nd.id] = 1; q.push(nd.id); } });
        while(q.length){ var id = q.pop(); rev[id].forEach(function(p){ if(!canHome[p]){ canHome[p] = 1; q.push(p); } }); }
        var trapped = 0; for(var i = 0; i < N.length; i++) if(nav.reach[0][i] && !canHome[i]) trapped++;
        return JSON.stringify({ bad: bad, viaOther: viaOther, nodes: nav.nodes.length, trapped: trapped });
      })()`));
      expect(r.bad, 'unreachable or off the graph').toEqual([]);
      expect(r.viaOther, 'the far side can walk to the jail on this side').toBe(true);
      expect(r.trapped, 'no place you can walk into and not walk out of').toBe(0);
    });
  });
}
