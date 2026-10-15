import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// THE MILL'S WHEEL (the owner, 2026-10-15: "the riverside mill should have a large spinning waterwheel", its paddles platforms you can ride up and around, like a Ferris wheel's cars).
// A wheel is a lift that never stops: paddles on a circle, each a one-way ledge that stays level and carries whoever stands on it; online it is sent as one angle.

function start(w, map = 'oak') {
  w.eval(`CTF.skipNav=true; SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.forceMap='${map}'; beginMatchNow();
          fighters.forEach(function(f){ f.controller='still'; f.you=false; }); ctfEndHide(CTF.live);`);
}
const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
const step = (w, n = 1) => { for (let i = 0; i < n; i++) w.eval('step()'); };

describe('the mill wheel', () => {
  it('there is one water wheel, hub on the middle line, its paddles on a circle, level, all of them one-way ledges', () => {
    const { window: w } = loadMonolith(41);
    start(w);
    const ws = J(w, `CTF.live.wheels.map(function(x){ return { kind:x.kind, dir:x.dir, n:x.n, R:x.R, x:x.x, y:x.y, ids:x.ids }; })`);
    expect(ws.length, 'one wheel in the whole map: it is its own mirror').toBe(1);
    expect(Math.abs(ws[0].x - w.eval('CTF.map.WW/2')), 'its hub is on the middle line').toBeLessThan(1);
    expect(ws[0].R, 'paddles 4 rows out').toBe(480);
    step(w, 400);
    for (const id of ws[0].ids) {
      const e = J(w, `(function(){ var e = CTF.live.elevs[${id}]; return { x:e.x, y:e.y, w:e.w, ry:e.rect.y, rx:e.rect.x, hop:e.rect.hop }; })()`);
      expect(Math.hypot(e.x + e.w/2 - ws[0].x, e.y - ws[0].y), 'on its circle').toBeCloseTo(ws[0].R, 0);
      expect(e.ry === e.y && e.rx === e.x && e.hop, 'the ledge is where the paddle is, and one-way').toBe(true);
    }
    expect(w.eval(`CTF.live.wheels[0].a !== CTF.live.wheels[0].a0`), 'it turns').toBe(true);
  });

  it('whoever stands on a paddle rides it up and round, and stays on it', () => {
    const { window: w } = loadMonolith(42);
    start(w);
    const wl = J(w, `(function(){ var x = CTF.live.wheels.filter(function(x){ return x.kind === 'wheel'; })[0]; return { ids:x.ids, dir:x.dir }; })()`);
    const id = wl.ids[0], f = w.eval('fighters[0].idx');
    const top = () => J(w, `(function(){ var e = CTF.live.elevs[${id}]; return { x:e.x + e.w/2, y:e.y }; })()`);
    const p0 = top();
    w.eval(`(function(){ var f = fighters[${f}]; f.x = ${p0.x}; f.y = ${p0.y} - f.r; f.vx = 0; f.vy = 0; f.invuln = 0; f.dead = false; })()`);
    step(w, 6);
    const from = J(w, `{ x:fighters[${f}].x, y:fighters[${f}].y + fighters[${f}].r }`);
    step(w, 300);
    const now = top(), me = J(w, `{ x:fighters[${f}].x, y:fighters[${f}].y + fighters[${f}].r, g:fighters[${f}].onground }`);
    expect(Math.hypot(now.x - p0.x, now.y - p0.y), 'the paddle went a long way round').toBeGreaterThan(400);
    expect(me.g, 'still standing').toBe(true);
    expect(Math.abs(me.y - now.y), 'feet on the paddle').toBeLessThan(10);
    expect(Math.abs(me.x - now.x), 'at the same place on it').toBeLessThan(40);
    expect(Math.hypot(me.x - from.x, me.y - from.y), 'and carried with it').toBeGreaterThan(400);
  });

  it('online, a wheel is its angle: the snapshot carries it and a guest\'s paddles follow', () => {
    const { window: w } = loadMonolith(43);
    start(w);
    step(w, 50);
    const out = J(w, 'ctfNetOut()');
    expect(out.wa.length, 'one angle a wheel').toBe(1);
    expect(out.wa[0]).toBeCloseTo(w.eval('CTF.live.wheels[0].a'), 3);
    expect(out.el.length, 'the paddles are not lifts on the wire').toBe(w.eval('CTF.map.elevs.length'));
    const e0 = J(w, `{ x:CTF.live.elevs[CTF.map.elevs.length].x, y:CTF.live.elevs[CTF.map.elevs.length].y }`);
    w.eval(`(function(){ var x = CTF.live.wheels[0]; x.a += 1; ctfWheelPlace(CTF.live, x); })()`);
    const e1 = J(w, `{ x:CTF.live.elevs[CTF.map.elevs.length].x, y:CTF.live.elevs[CTF.map.elevs.length].y }`);
    expect(Math.hypot(e1.x - e0.x, e1.y - e0.y), 'a different angle puts a paddle elsewhere').toBeGreaterThan(100);
    w.eval(`(function(){ window.NET = window.NET || { myIdx:0 }; })()`);
    const c = JSON.parse(JSON.stringify(out));
    w.eval(`ctfNetIn(${JSON.stringify(c)})`);
    const e2 = J(w, `{ x:CTF.live.elevs[CTF.map.elevs.length].x, y:CTF.live.elevs[CTF.map.elevs.length].y }`);
    expect(Math.abs(e2.x - e0.x) + Math.abs(e2.y - e0.y), 'the host\'s angle puts it back').toBeLessThan(1);
  });

  it('the mill hall is wheel-only: the route graph reaches its hiding places by the wheel move and by nothing else', { timeout:120000 }, () => {
    const { window: w } = loadMonolith(44);
    const r = JSON.parse(w.eval(`(function(){ var M = ctfMapGet('oak', false, 1); CTF.noShipped = true; var nav = ctfNavNew(M); while(!nav.ready) ctfNavTick(nav, 80);
      var spots = M.spots.filter(function(s){ return s.y < 2000 && s.y > 1500 && Math.abs(s.x - M.WW/2) < 1000; }), out = { n:spots.length, wheelEdges:0 };
      nav.nodes.forEach(function(n){ n.edges.forEach(function(e){ if(e.kind === 'wheel') out.wheelEdges++; }); });
      [false, true].forEach(function(noWheel){ var seen = new Uint8Array(nav.nodes.length), q = [];
        M.homes[0].spawns.forEach(function(sp){ var n = ctfNavNodeAt(nav, sp.x, sp.y, 12); if(n && !seen[n.id]){ seen[n.id] = 1; q.push(n.id); } });
        while(q.length){ var id = q.pop(); nav.nodes[id].edges.forEach(function(e){ if(noWheel && e.kind === 'wheel') return; if(e.doors.some(function(d){ return d[0] === 'J'; })) return; if(!seen[e.to]){ seen[e.to] = 1; q.push(e.to); } }); }
        var ok = 0; spots.forEach(function(s){ var n = ctfNavNodeAt(nav, s.x, s.y, 14); if(n && seen[n.id]) ok++; }); out[noWheel ? 'without' : 'with'] = ok; });
      return JSON.stringify(out); })()`));
    expect(r.n, 'the hall holds hiding places').toBeGreaterThanOrEqual(3);
    expect(r.wheelEdges, 'the graph has the wheel move').toBeGreaterThan(0);
    expect(r.with, 'all of them reached with it').toBe(r.n);
    expect(r.without, 'none without it: the wheel is the only way in').toBe(0);
  });
});
