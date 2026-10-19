import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// A FLAG ON SOMETHING THAT GIVES WAY (the owner, 2026-10-19, with a screenshot of a flag floating high between two tall stone columns over a floor: "issue. i made an unfeasible flag (breakable platform
// camp), and it didnt get flagged"). The check at the end of the hiding counted a crumbling ledge as ground: his flag up on one between his columns passed (wall jumps up between the columns reach it), and
// once the ledge gave way the flag hung in the air where nobody could get to it. Now a flag must be reachable with everything that can give way standing AND gone (the wall jumps count in both), a flag
// resting on such a piece never passes (it goes to the nearest prepared place that passes both, the rule for a flag with no road; no piece is taken away for it, since none would help), the hiding
// refuses such a place, and in a match a flag whose floor gives way anyway falls to what is under it.

const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
const X = 5580, Y = 3240;   // the factory's long floor on the first side, cleared above (the place of the wall-jump tests)
const LX = 5640, RX = 5940, FX = (LX + 60 + RX) / 2, LEDGE = Y - 420;   // his two columns (two walls each, 480 tall) with 240 px of floor between, the crumbling ledge high between them, his flag in the middle of it

function boot(seed) {
  const { window: w } = loadMonolith(seed);
  w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.forceMap='factory'; beginMatchNow(); fighters.forEach(function(f){ f.controller='ai'; f.you=false; });`);
  for (let i = 0; i < 4000 && w.eval('!(CTF.nav && CTF.nav.ready && CTF.live.phase === "hide")'); i++) { w.eval('step()'); if (i % 50 === 0) w.eval('CTF.nav && !CTF.nav.ready && ctfNavTick(CTF.nav, 200)'); }
  return w;
}
// everyone home and still, every other flag in its owner's hands (only his flag is judged); the space cleared; the crumbling ledge the map's (a plat with tm, as the map builder makes one); his columns
// and a step outside them (the way up), placed as a player places them
function build(w) {
  return J(w, `(function(){ var L = CTF.live, M = CTF.map, X = ${X}, Y = ${Y};
    fighters.forEach(function(f){ f.controller = 'still'; f.you = false; var sp = M.homes[f.team].spawns[0]; f.x = sp.x + (f.idx % 5)*30; f.y = sp.y - f.r; f.vx = f.vy = 0; });
    var f = fighters.find(function(q){ return q.team === 0; }); L.pts[f.idx] = 9999;
    var fl = L.flags.find(function(q){ return q.team === 0; }); L.flags.forEach(function(q){ if(q !== fl){ q.st = 0; q.car = q.owner; } });
    L.edits = []; ctfRebuildDyn(L);
    M.plats = M.plats.filter(function(q){ return !(q.y < Y - 5 && q.y + q.h > Y - 900 && q.x < X + 900 && q.x + q.w > X - 620); });
    var away = function(z){ return !(z.y < Y + 10 && z.y + z.h > Y - 900 && z.x < X + 900 && z.x + z.w > X - 620); };
    M.zones = (M.zones || []).filter(away); worldZones = worldZones.filter(away);
    M.plats.push({ x:${LX + 60}, y:${LEDGE}, w:${RX - LX - 60}, h:16, hop:true, tm:{ kind:'crumble', delay:30, back:300 } });
    worldPlats = M.plats.map(function(p){ return Object.assign({}, p); }); ctfTimedInit(L); ctfRebuildDyn(L);
    var put = function(t, k, x, y){ var e = ctfEditPlaceAt(f, t, k, x, y); return e ? { id:e.id, tool:e.tool, x:e.x, y:e.y, w:e.w, h:e.h } : null; };
    var out = [put('wall', 'wall', ${LX + 30}, Y - 120), put('wall', 'wall', ${LX + 30}, Y - 360), put('wall', 'wall', ${RX + 30}, Y - 120), put('wall', 'wall', ${RX + 30}, Y - 360), put('plat', 'plat', ${RX + 150}, Y - 240)];
    ctfPlaceFlag(fl, ${FX}, ${LEDGE});
    return out; })()`);
}

describe('capture the flag: a flag on something that gives way', () => {
  it("the owner's camp (his flag high between his two tall columns, on a crumbling ledge): the old check passed it; now it is flagged and put right with every piece standing; the hiding refuses the place; in a match a flag whose ledge gives way falls to the floor below", { timeout: 300000 }, () => {
    const w = boot(93);
    const pieces = build(w);
    expect(pieces.every(Boolean), 'his columns and the step went down as a player places them').toBe(true);
    expect(w.eval(`ctfOnBreakable(${FX}, ${LEDGE})`), 'the flag rests on the crumbling ledge').toBe(true);

    // THE OLD CHECK (what the end of the hiding asked before): the graph with his pieces in it, where the wall jumps up between the columns reach the ledge. Nothing unreachable: it passed.
    const old = J(w, `(function(){ var L = CTF.live, nav = ctfEditNav(L, L.edits.length); while(!nav.ready) ctfNavTick(nav, 80, 6); window.__N = nav;
      var fl = L.flags.find(function(q){ return q.team === 0; }), n = ctfNavNodeAt(nav, fl.x, fl.y, 10), into = [];
      nav.nodes.forEach(function(m){ m.edges.forEach(function(e){ if(n && e.to === n.id && nav.reach[1][m.id]) into.push(e.kind); }); });
      return { problems:ctfEditProblems(L, nav), reach:!!(n && nav.reach[1][n.id]), into:into, now:ctfBreakProblems(L, nav, null) }; })()`);
    expect(old.problems, 'the old check: nothing unreachable, so his flag passed (the bug)').toEqual([]);
    expect(old.reach, 'the ledge is reached with everything standing').toBe(true);
    expect(old.into, 'up between the columns with wall jumps (they still count)').toContain('wall');
    expect(old.now, 'the second pass (everything that gives way gone) flags it: it rests on the ledge').toEqual(['flag0']);

    // THE CHECK NOW, end to end: the flag is flagged and goes to a prepared place both passes reach; no piece is taken away (none would help); the match starts
    const r = J(w, `(function(){ var L = CTF.live, fl = L.flags.find(function(q){ return q.team === 0; }); ctfFixBegin(L); L.fix.navs[ctfFixKey(L.fix, L.fix.set.length)] = __N;
      var g = 0; while (L.fix && g++ < 100000) ctfFixStep(L);
      var n = ctfNavNodeAt(CTF.nav, fl.x, fl.y, 10);
      return { removed:L.removedByFix || 0, left:L.edits.length, phase:L.phase, x:fl.x, y:fl.y, st:fl.st, onBrk:ctfOnBreakable(fl.x, fl.y), reach:!!(n && CTF.nav.reach[1][n.id]), checked:CTF.nav === __N,
        spot:CTF.map.spots.some(function(s){ return s.team === 0 && s.x === fl.x && s.y === fl.y; }), problems:ctfEditProblems(L, CTF.nav).concat(ctfBreakProblems(L, CTF.nav, null)) }; })()`);
    expect(r.removed, 'no piece taken away').toBe(0);
    expect(r.left, 'both columns and the step stand').toBe(5);
    expect(r.phase).toBe('play');
    expect(r.checked, 'the match plays on the checked graph').toBe(true);
    expect(r.x !== FX || r.y !== LEDGE, 'the flag was moved off the ledge').toBe(true);
    expect(r.spot, 'to a prepared place of its side').toBe(true);
    expect(r.st).toBe(1);
    expect(r.onBrk, 'not on anything that gives way').toBe(false);
    expect(r.reach, 'and the other side can get to it').toBe(true);
    expect(r.problems, 'both passes pass').toEqual([]);

    // THE SECOND PASS KEEPS THE WALL JUMPS: the graph with everything that gives way gone has no place on the ledge, the floor between the columns is still reached, and wall-jump moves are in it
    const b = J(w, `(function(){ var nb = ctfNavBroken(__N); while(!nb.ready) ctfNavTick(nb, 80, 6); var sh = ctfNavNodeAt(nb, ${FX}, ${Y}, 10), on = ctfNavNodeAt(nb, ${FX}, ${LEDGE}, 10);
      return { ledge:!!(on && on.y === ${LEDGE}), shaft:!!(sh && nb.reach[1][sh.id]), walls:nb.nodes.reduce(function(a, n){ return a + n.edges.filter(function(e){ return e.kind === 'wall'; }).length; }, 0),
        reprobed:nb.nodes.filter(function(n){ return !n.reused; }).length, all:nb.nodes.length }; })()`);
    expect(b.ledge, 'no place on the ledge').toBe(false);
    expect(b.shaft, 'the floor between the columns is still reached').toBe(true);
    expect(b.walls, 'wall jumps count in the second pass too').toBeGreaterThan(0);
    expect(b.reprobed, 'only the places that had a move onto the ledge are probed again').toBeLessThan(b.all / 4);

    // THE HIDING REFUSES IT: the free camera's cursor over the ledge snaps to it, the old rule (own side, and the other side can get there) said yes, now it is no; a trapdoor is refused the same way
    const cam = J(w, `(function(){ var f = fighters.find(function(q){ return q.team === 0; }); f._cam = { x:${FX}, y:${LEDGE - 30} }; var s = ctfCamSnap(f); f._cam = null;
      return { y:s.y, ok:s.ok, old:ctfHideValid(0, ${FX}, s.y) && ctfAiReachable(0, ${FX}, s.y),
        trap:(function(){ var L = CTF.live; L.edits.push({ id:999, team:0, owner:f.idx, tool:'trap', kind:'trapdoor', x:${X - 390}, y:${Y - 300}, w:180, h:16, fy:${Y - 300}, cx:${X - 300}, open:false }); ctfRebuildDyn(L);
          var v = ctfOnBreakable(${X - 300}, ${Y - 300}); L.edits.pop(); ctfRebuildDyn(L); return v; })() }; })()`);
    expect(cam.y, 'the cursor snaps to the ledge').toBe(LEDGE);
    expect(cam.old, 'the old rule let a flag go there').toBe(true);
    expect(cam.ok, 'now the hiding refuses it').toBe(false);
    expect(cam.trap, 'a trapdoor gives way too').toBe(true);

    // IN A MATCH: a flag lying on the ledge when it gives way (the safety net: say one dropped there) falls to the floor between the columns, and is hidden there (the other side gets to it)
    const p = J(w, `(function(){ var L = CTF.live, fl = L.flags.find(function(q){ return q.team === 0; }); ctfPlaceFlag(fl, ${FX}, ${LEDGE});
      var q = L.timed.find(function(t){ return t.wp.y === ${LEDGE}; }); q.st = 2; q.ct = q.tm.back; q.wp.w = 0;   /* (it gave way: as ctfStepTimed does it) */
      var hang = ctfSurfaceBelow(fl.x, fl.y, 4) === null, stranded = ctfFlagStranded(L, fl), ys = [];
      for(var i = 0; i < 90; i++){ ctfStepFlags(L); if(i < 3) ys.push(Math.round(fl.y)); }
      for(var i = 0; i < 300; i++){ ctfStepTimed(L); ctfStepFlags(L); }   /* (the ledge comes back: the flag stays where it fell) */
      return { hang:hang, stranded:stranded, ys:ys, x:fl.x, y:fl.y, hx:fl.hx, hy:fl.hy, st:fl.st, fall:fl.fall, back:q.st, reach:ctfAiReachable(0, fl.x, fl.y) }; })()`);
    expect(p.hang, 'nothing under it once the ledge has gone').toBe(true);
    expect(p.stranded, 'the match sees it').toBe(true);
    expect(p.ys[2], 'it falls (not snapped)').toBeGreaterThan(LEDGE);
    expect(p.ys[2], 'gradually').toBeLessThan(Y);
    expect({ x: p.x, y: p.y, hx: p.hx, hy: p.hy, st: p.st, fall: p.fall }, 'on the floor below, hidden there').toEqual({ x: FX, y: Y, hx: FX, hy: Y, st: 1, fall: false });
    expect(p.back, 'the ledge is back').toBe(0);
    expect(p.reach, 'and the other side can get to it').toBe(true);
  });
});
