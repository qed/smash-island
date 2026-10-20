import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';
import { readFileSync, existsSync } from 'node:fs';

// YOUR OWN HOME STAYS OPEN (the owner, 2026-10-19, on the Fleet side of the sky map, hiding: "it doesnt work... i dont enter" the captain's cabin). A real-browser repro: in about 4 runs in 10, at the first
// frame of the hiding, a CPU teammate (the waller, "See it, cannot reach") stood a stone wall and a block INSIDE the cabin, between the spawns and the door, and the human put down at the back of the cabin
// could not get past them. Nothing stopped it: the placing check never kept a side's own home clear, and the check at the end of the hiding asked only that flags, keys and jail doors be reached, by a side's
// spawns all together (one spawn stood beyond the wall). Now no wall or block goes in your own home or its way out (a person is refused, a CPU never tries), and a spawn that what was built shuts in
// (with plain moves) makes the end-of-hiding check take the smallest piece away. One test of his cabin (each of its three parts fails on the old code), then every map, band and side.

const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
const COUNT = [6, 10, 16];   // fighters for each band (small, normal, large)
const graphFile = (gid) => 'artifacts/V1/assets/ctf/' + gid.replace('~', '-swap').replace('.', '-') + '-graph.json';
const WALLS = '{ seeit:true, sealedbox:true, rings:true, zigzag:true, wallshort:true, airlock:true, boostdeny:true, cutbridge:true }';   // every setup that builds walls or blocks

function boot(seed) {
  const { window: w } = loadMonolith(seed);
  // the owner's box round a side's spawns (360 px either side of them, 480 px over them down to their floor), and the spawns of a side that cannot get across the middle line with plain moves
  // (no wall jump, never through a jail door; a spawn in the air falls to the floor under it), read off a graph: the test's own, not the game's
  w.eval(`window.__box = function(t){ var h = CTF.map.homes[t], xs = h.spawns.map(function(s){ return s.x; }), ys = h.spawns.map(function(s){ return s.y; }); return { x0:Math.min.apply(null, xs) - 360, x1:Math.max.apply(null, xs) + 360, y0:Math.min.apply(null, ys) - 480, y1:Math.max.apply(null, ys) }; };
    window.__inBox = function(b, e){ return e.x < b.x1 && e.x + e.w > b.x0 && e.y < b.y1 && e.y + e.h > b.y0; };
    window.__shut = function(nav, t){ var M = CTF.map, mid = M.WW/2, out = [];
      M.homes[t].spawns.forEach(function(sp){ var n = ctfNavNodeAt(nav, sp.x, sp.y, 12); if(!n){ (nav.nb[ctfNavBucket(sp.x)] || []).forEach(function(m){ if(m.y >= sp.y && sp.x >= m.x0 - 12 && sp.x <= m.x1 + 12 && (!n || m.y < n.y)) n = m; }); } if(!n) return;
        var seen = {}, q = [n.id], ok = false; seen[n.id] = 1;
        while(q.length && !ok){ var k = q.pop(), m = nav.nodes[k]; if(t === 0 ? m.x1 > mid + 1 : m.x0 < mid - 1){ ok = true; break; }
          m.edges.forEach(function(e){ if(seen[e.to] || e.kind === 'wall' || e.doors.some(function(d){ return d[0] === 'J'; })) return; seen[e.to] = 1; q.push(e.to); }); }
        if(!ok) out.push([sp.x, sp.y]); });
      return out; };`);
  return w;
}
// a match on map id, band, its sides swapped or not (an asymmetric map: the bid's result is forced), every fighter a CPU and away by the middle line (nobody stands where a piece is tried); the map's shipped graph when nav
function start(w, id, band, sw, nav) {
  const gid = w.eval(`(function(){ var d = CTF_MAPS['${id}']; return '${id}' + (${sw} && d.buildB ? '~' : '') + (d.bands ? CTF_BAND_SFX[${band}] : ''); })()`);
  if (nav) { expect(existsSync(graphFile(gid)), 'the shipped graph of ' + gid).toBe(true); w.eval(`if(!CTF_GRAPHS['${gid}']) CTF_GRAPHS['${gid}'] = ${readFileSync(graphFile(gid), 'utf8')};`); }
  w.eval(`CTF.skipNav = ${!nav}; SETTINGS.mode='ctf'; SETTINGS.count=${COUNT[band]}; SETTINGS.itemRate=0; CTF.forceMap='${id}'; beginMatchNow();
    fighters.forEach(function(f){ f.controller='ai'; f.you=false; }); CTF.bidRes = null; ctfBidApplyRes({ sw:${sw}, lo:-1, pay:0, win:-1, xo:-1, sd:[${sw}, ${1 - sw}] });
    fighters.forEach(function(f){ f.controller='ai'; f.you=false; f.x = CTF.map.WW/2 + (f.team ? 700 : -700); f.y = 100; f.vx = f.vy = 0; });`);
  expect(J(w, `{ gid:CTF.map.gid, phase:CTF.live.phase, nav:!!(CTF.nav && CTF.nav.ready) }`), gid).toEqual({ gid, phase: 'hide', nav: !!nav });
  return gid;
}
const configs = (w) => J(w, `(function(){ var out = []; ctfMapIds().forEach(function(id){ var d = CTF_MAPS[id]; (d.bands ? [0, 1, 2] : [1]).forEach(function(b){ (d.buildB ? [0, 1] : [0]).forEach(function(sw){ out.push([id, b, sw]); }); }); }); return out; })()`);

describe('capture the flag: your own home stays open', () => {
  it("the owner's cabin (the Fleet's captain's cabin, each band, each side): his wall and block are refused; the waller never tries a wall in the cabin round flags hidden there; built anyway, the end of the hiding takes the wall away and everyone gets out", { timeout: 300000 }, () => {
    const w = boot(101);
    for (const band of [0, 1, 2]) for (const sw of [1, 0]) {
      const gid = start(w, 'sky', band, sw, true), fleet = sw ? 0 : 1;
      // the cabin: its floor spawns from the back wall toward the door; the repro's wall just behind the seventh (840..900 x 1440..1680 on the left side, the mirror on the right) and the block over it
      const r = J(w, `(function(){ var L = CTF.live, M = CTF.map, t = ${fleet}, dir = t === 0 ? 1 : -1, h = M.homes[t], fy = Math.max.apply(null, h.spawns.map(function(s){ return s.y; }));
        var fl = h.spawns.filter(function(s){ return s.y === fy; }).sort(function(a, b){ return (a.x - b.x)*dir; }), sx = fl[6].x, box = __box(t), out = { sx:sx, fy:fy, nSpawns:fl.length };
        // A PERSON: the wall and the block go nowhere (the grey puff, the red ghost); a platform still goes in (only the solid pieces are kept out)
        var me = fighters.find(function(q){ return q.team === t; }); me.controller = 'local'; me.you = true; L.pts[me.idx] = 99;
        L.denied = null; out.wall = !!ctfEditPlaceAt(me, 'wall', 'wall', sx - dir*30, fy - 120); out.whyW = L.denied && L.denied.why;
        L.denied = null; out.block = !!ctfEditPlaceAt(me, 'wall', 'block', sx, fy - 300); out.whyB = L.denied && L.denied.why;
        me._cam = { x:sx - dir*30, y:fy - 120 }; me._tool = CTF_TOOLS.indexOf('wall'); me._piece = CTF_PIECES.wall.indexOf('wall'); var gh = ctfEditGhost(me); out.ghost = gh && gh.ok; me._cam = null;
        out.plat = !!ctfEditPlaceAt(me, 'plat', 'plat', sx - dir*240, fy - 240);
        me.controller = 'ai'; me.you = false;
        // THE CPUS: every flag of the side hidden in the cabin and the waller's setup asked for: no wall or block of theirs in the cabin, none even tried there
        L.edits = []; ctfRebuildDyn(L); L.bld = null; fighters.forEach(function(f){ L.pts[f.idx] = CTF_EDIT_PTS; });
        var k = 0; fighters.forEach(function(f){ if(f.team === t) ctfPlaceFlag(L.flags[f.idx], sx - dir*(160 + 90*(k++ % 4)), fy); });
        var pl = L.plans[t]; pl.built = false; pl.log = []; pl.allow = { seeit:true };
        var tried = [], o = ctfEditPlaceAt; ctfEditPlaceAt = function(f, tool, kind, x, y){ var sh = ctfEditShape(tool, kind, x, y); if(tool === 'wall' && sh && __inBox(box, sh)) tried.push(kind + '@' + sh.x + ',' + sh.y); return o(f, tool, kind, x, y); };
        try { ctfPlanBuildTeam(L, pl); } finally { ctfEditPlaceAt = o; }
        out.tried = tried; out.built = L.edits.filter(function(e){ return e.tool === 'wall' && e.team === t && __inBox(box, e); }).map(function(e){ return e.kind + '@' + e.x + ',' + e.y; }); out.log = pl.log;
        // BUILT ANYWAY (as the old code let the waller): the wall and the block put in without the check; the end of the hiding takes the wall away, alone, and every spawn gets out
        L.edits = []; ctfRebuildDyn(L); L.flags.forEach(function(q){ q.st = 0; }); L.removedByFix = 0; L.fixGone = [];
        var a = ctfEditAdd(me, 'wall', 'wall', ctfEditShape('wall', 'wall', sx - dir*30, fy - 120)), b = ctfEditAdd(me, 'wall', 'block', ctfEditShape('wall', 'block', sx, fy - 300));
        out.at = [a.x, a.y, a.w, a.h, b.x, b.y, b.w, b.h];
        var nav = ctfEditNav(L, 2); while(!nav.ready) ctfNavTick(nav, 200); out.shutBefore = __shut(nav, t).length;
        ctfFixBegin(L); var g = 0; while(L.fix && g++ < 100000) ctfFixStep(L);
        out.gone = (L.fixGone || []).map(function(e){ return e.id; }); out.ids = [a.id, b.id]; out.phase = L.phase; out.shutAfter = __shut(CTF.nav, t);
        return out; })()`);
      const tag = gid + ' (the Fleet is team ' + fleet + ')';
      expect(r.nSpawns, tag + ': the cabin floor holds seven spawns').toBe(7);
      expect(r.at, tag + ': the repro spot (on the left side of the normal band the wall at 840 x 1440, the block at 840 x 1320)').toEqual([fleet === 0 ? r.sx - 60 : r.sx, r.fy - 240, 60, 240, r.sx - 60, r.fy - 360, 120, 120]);
      expect([r.wall, r.block], tag + ': a person cannot put the wall or the block in the cabin').toEqual([false, false]);
      expect([r.whyW, r.whyB], tag + ': refused as the home').toEqual(['home', 'home']);
      expect(r.ghost, tag + ': the ghost says no').toBe(false);
      expect(r.plat, tag + ': a platform still goes in the cabin').toBe(true);
      expect(r.tried, tag + ': the CPUs never even try a wall or a block in the cabin').toEqual([]);
      expect(r.built, tag + ': and none stands there').toEqual([]);
      expect(r.shutBefore, tag + ': built anyway, the wall and block shut the back of the cabin in (no way out without a wall jump)').toBeGreaterThanOrEqual(6);
      expect(r.gone, tag + ': the end of the hiding takes away the wall, and only the wall').toEqual([r.ids[0]]);
      expect(r.phase, tag).toBe('play');
      expect(r.shutAfter, tag + ': and every spawn gets out').toEqual([]);
    }
  });

  it('every map, band and side: a person cannot put a wall or a block in their own home or its way out (refused), and can still build out of it', { timeout: 300000 }, () => {
    const w = boot(102), cfgs = configs(w);
    expect(cfgs.length, 'every map, band and side').toBeGreaterThanOrEqual(33);
    for (const [id, band, sw] of cfgs) {
      const gid = start(w, id, band, sw, false);
      const r = J(w, `(function(){ var L = CTF.live, M = CTF.map, S = CTF_CELL, out = [];
        [0, 1].forEach(function(t){ var me = fighters.find(function(q){ return q.team === t; }); me.controller = 'local'; me.you = true; L.pts[me.idx] = 999;
          var cells = Array.from(ctfHomeCells(M, t)), set = new Set(cells), o = { t:t, n:cells.length, spawnsIn:M.homes[t].spawns.every(function(s){ return set.has(Math.floor((s.y - 1)/S)*4096 + Math.floor(s.x/S)); }), placed:[], home:0, tries:0, free:0 };
          // a wall and a block centred on every cell of the home: none goes in
          cells.forEach(function(k){ var x = (k % 4096 + 0.5)*S, y = (Math.floor(k/4096) + 0.5)*S;
            ['wall', 'block'].forEach(function(kind){ o.tries++; L.denied = null; var e = ctfEditPlaceAt(me, 'wall', kind, x, y); if(e){ o.placed.push(kind + '@' + e.x + ',' + e.y); L.edits.splice(L.edits.indexOf(e), 1); ctfRebuildDyn(L); } else if(L.denied && L.denied.why === 'home') o.home++; }); });
          // out of it a wall still goes down somewhere on the side's prepared places (the home is not the whole side)
          M.spots.forEach(function(s){ if(s.team !== t || o.free) return; [-240, 240].forEach(function(dx){ if(o.free) return; var e = ctfEditPlaceAt(me, 'wall', 'wall', s.x + dx, s.y - 120); if(e){ o.free = 1; if(ctfHomeHit(M, t, e)) o.free = -1; L.edits.splice(L.edits.indexOf(e), 1); ctfRebuildDyn(L); } }); });
          me.controller = 'ai'; me.you = false; out.push(o); });
        return out; })()`);
      for (const o of r) {
        const tag = gid + ' team ' + o.t;
        expect(o.spawnsIn, tag + ': every spawn stands in the home').toBe(true);
        expect(o.n, tag + ': the home is a home, not half the side').toBeLessThan(160);
        expect(o.placed, tag + ': no wall or block went in the home').toEqual([]);
        expect(o.home, tag + ': refused as the home where nothing else stops it (' + o.home + ' of ' + o.tries + ')').toBeGreaterThan(o.tries / 6);
        expect(o.free, tag + ': a wall still goes down out of the home').toBe(1);
      }
    }
  });

  it('every map, band and side: the CPUs never build (or even try) a wall or a block in their own home over many seeds, with flags hidden in and round it, and still build their walls elsewhere', { timeout: 600000 }, () => {
    const w = boot(103), cfgs = configs(w);
    expect(cfgs.length, 'every map, band and side').toBeGreaterThanOrEqual(33);
    const SEEDS = 6;
    for (const [id, band, sw] of cfgs) {
      const gid = start(w, id, band, sw, true);
      const r = J(w, `(function(){ var L = CTF.live, M = CTF.map, res = { tried:[], built:[], walls:[0, 0], runs:[0, 0] };
        var o = ctfEditPlaceAt; ctfEditPlaceAt = function(f, tool, kind, x, y){ var sh = ctfEditShape(tool, kind, x, y); if(tool === 'wall' && sh && ctfHomeHit(M, f.team, sh)) res.tried.push(f.team + ':' + kind + '@' + sh.x + ',' + sh.y); return o(f, tool, kind, x, y); };
        try {
          for(var s = 0; s < ${SEEDS}; s++){
            L.edits = []; ctfRebuildDyn(L); L.bld = null; fighters.forEach(function(f){ L.pts[f.idx] = CTF_EDIT_PTS; });
            [0, 1].forEach(function(t){
              // the side's flags: half at the prepared places nearest its home (the cabin's flags, the penthouse's...), half anywhere on its side
              var h = M.homes[t], cx = h.spawns.reduce(function(a, q){ return a + q.x; }, 0)/h.spawns.length, cy = h.spawns.reduce(function(a, q){ return a + q.y; }, 0)/h.spawns.length;
              var sp = M.spots.filter(function(q){ return q.team === t && ctfHideValid(t, q.x, q.y); }).sort(function(a, b){ return Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy); });
              fighters.forEach(function(f){ if(f.team !== t) return; var q = Math.random() < 0.5 ? sp[Math.floor(Math.random()*Math.min(4, sp.length))] : sp[Math.floor(Math.random()*sp.length)]; ctfPlaceFlag(L.flags[f.idx], q.x, q.y); });
              var pl = L.plans[t]; pl.built = false; pl.log = []; pl.camps = []; pl.ambush = []; pl.overhangs = []; pl.allow = s % 2 ? ${WALLS} : null;   // (every other seed the CPUs' own judgement, the rest every wall setup asked for)
              ctfPlanBuildTeam(L, pl); if(pl.log.length) res.runs[t]++;
            });
            L.edits.forEach(function(e){ if(e.tool !== 'wall') return; res.walls[e.team]++; if(ctfHomeHit(M, e.team, e)) res.built.push(e.team + ':' + e.kind + '@' + e.x + ',' + e.y); });
          }
        } finally { ctfEditPlaceAt = o; }
        return res; })()`);
      expect(r.tried, gid + ': no CPU tried a wall or a block in its own home').toEqual([]);
      expect(r.built, gid + ': none stands there').toEqual([]);
      expect(r.runs, gid + ': both sides built every time').toEqual([SEEDS, SEEDS]);
      expect(r.walls[0] > 0 && r.walls[1] > 0, gid + ': and both sides still put walls and blocks down elsewhere: ' + r.walls).toBe(true);
    }
  });

  // (one side a band, the other the next: every half of every map on both sides; the graphs with pieces in are slow to make, so not both at once)
  it('every map, band and side: a spawn shut in by pieces put in without the check (a box round the floor spawn farthest from the middle line: the other spawns of the side still get out) loses the box\'s front wall at the end of the hiding, that piece alone, and every spawn gets out', { timeout: 600000 }, () => {
    const w = boot(104), cfgs = configs(w);
    expect(cfgs.length, 'every map, band and side').toBeGreaterThanOrEqual(33);
    for (const [id, band, sw] of cfgs) {
      const gid = start(w, id, band, sw, true), t = (band + sw) % 2;
      const r = J(w, `(function(){ var L = CTF.live, M = CTF.map, S = CTF_CELL, t = ${t}, dir = t === 0 ? 1 : -1, me = fighters.find(function(q){ return q.team === t; }), out = {};
        L.edits = []; ctfRebuildDyn(L); L.flags.forEach(function(q){ q.st = 0; }); L.removedByFix = 0; L.fixGone = [];
        var floorAt = function(x, y, stone){ return M.plats.some(function(p){ return !p.tm && (p.solid || (!stone && p.hop)) && x >= p.x && x < p.x + p.w && Math.abs(p.y - y) < 2; }); };
        var q = M.homes[t].spawns.filter(function(p){ return floorAt(p.x, p.y); }).sort(function(a, b){ return (a.x - b.x)*dir; })[0];   // nobody stands behind it
        var X = Math.floor(q.x/S)*S, F = q.y, add = function(x, y, w, h, kind){ return ctfEditAdd(me, 'wall', kind, { x:x, y:y, w:w, h:h, fy:y + h, cx:x + w/2 }).id; };
        if([X - 30, X + 60, X + 150].some(function(x){ return !floorAt(x, F, true); })){ add(X - 60, F, S, S, 'block'); add(X + 60, F, S, S, 'block'); }   // a floor you drop through, or none under a wall: stone under it all
        add(X, F - 240, S, S, 'block'); add(t === 0 ? X - 60 : X + S, F - 240, 60, 240, 'wall'); out.front = add(t === 0 ? X + S : X - 60, F - 240, 60, 240, 'wall');   // the roof, the wall behind, the wall in front
        var nav = ctfEditNav(L, L.edits.length); while(!nav.ready) ctfNavTick(nav, 200);
        out.shutBefore = [__shut(nav, 0).length, __shut(nav, 1).length]; out.q = [q.x, q.y];
        ctfFixBegin(L); var g = 0; while(L.fix && g++ < 200000) ctfFixStep(L);
        out.gone = (L.fixGone || []).map(function(e){ return e.id; }); out.phase = L.phase; out.shutAfter = [__shut(CTF.nav, 0), __shut(CTF.nav, 1)];
        return out; })()`);
      const tag = gid + ' team ' + t + ' (the spawn at ' + r.q + ')';
      expect(r.shutBefore[t] >= 1 && r.shutBefore[t] <= 2 && r.shutBefore[1 - t] === 0, tag + ': that spawn (and one that falls in) shut in, the rest of the side free: ' + r.shutBefore).toBe(true);
      expect(r.gone, tag + ': the end of the hiding takes away one piece, the front wall').toEqual([r.front]);
      expect(r.phase, tag).toBe('play');
      expect(r.shutAfter, tag + ': and every spawn gets out').toEqual([[], []]);
    }
  });
});
