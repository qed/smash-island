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
  it('each half has a water wheel and an iron cog, their paddles on a circle, level, all of them one-way ledges, the other half turning the other way', () => {
    const { window: w } = loadMonolith(41);
    start(w);
    const ws = J(w, `CTF.live.wheels.map(function(x){ return { kind:x.kind, dir:x.dir, n:x.n, R:x.R, x:x.x, y:x.y, ids:x.ids }; })`);
    expect(ws.filter(x => x.kind === 'wheel').length, 'a water wheel a side').toBe(2);
    expect(ws.filter(x => x.kind === 'cog').length, 'a cog a side').toBe(2);
    const big = ws.filter(x => x.kind === 'wheel');
    expect(big[0].R, 'a big wheel: 6 rows from hub to paddle').toBe(720);
    expect(big[0].dir, 'the halves turn opposite ways').toBe(-big[1].dir);
    expect(Math.abs(big[0].x + big[1].x - w.eval('CTF.map.WW')), 'one is the other turned over').toBeLessThan(1);
    step(w, 400);
    for (const x of ws) for (const id of x.ids) {
      const e = J(w, `(function(){ var e = CTF.live.elevs[${id}]; return { x:e.x, y:e.y, w:e.w, ry:e.rect.y, rx:e.rect.x, hop:e.rect.hop }; })()`);
      expect(Math.hypot(e.x + e.w/2 - x.x, e.y - x.y), 'on its circle').toBeCloseTo(x.R, 0);
      expect(e.ry === e.y && e.rx === e.x && e.hop, 'the ledge is where the paddle is, and one-way').toBe(true);
    }
    expect(w.eval(`CTF.live.wheels.every(function(x){ return Math.abs(x.a - x.a0) > 0.1; })`), 'they turn').toBe(true);
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
    expect(out.wa.length, 'one angle a wheel').toBe(4);
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
});
