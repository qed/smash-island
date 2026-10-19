import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// PUSH ZONES NEVER HOLD YOU (the owner, 2026-10-19: "wind can get you stuck in a corner"; "sometimes you go in one direction without controlling anything"): a wind, an updraft and a belt push a fighter and the fighter always wins:
// a wind lets go while you press against it and, left alone, carries you at most a drift (not the run's top speed); an updraft lets go while you hold Down and stops lifting under a ceiling; and whatever the shape of the place, a
// fighter who presses a key in a push zone and has not moved for a moment is let go for a while (a corner, a shaft with a lid). The keys here are REAL key events, and the places are built in the test, so the test does not depend on a map.

const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
function start(w, count = 4) {
  w.eval(`CTF.skipNav = true; SETTINGS.mode = 'ctf'; SETTINGS.count = ${count}; SETTINGS.itemRate = 0; CTF.forceMap = 'sky'; beginMatchNow(); fighters.forEach(function(f, i){ f.controller = i === 0 ? 'local' : 'still'; f.you = i === 0; f.stocks = 99; if(i){ f.x = -9000; f.y = -9000; } }); ctfEndHide(CTF.live);`);
}
const key = (w, code, on) => w.eval(`window.dispatchEvent(new KeyboardEvent('${on ? 'keydown' : 'keyup'}', { code:'${code}', key:'${code}', bubbles:true }))`);
// a made place: solid boxes [x, y, w, h] and zones; the fighter 0 stands at (x, y) (its middle)
function arena(w, solids, zones, x, y) {
  w.eval(`worldPlats = ${JSON.stringify(solids.map(([x0, y0, w0, h0]) => ({ x: x0, y: y0, w: w0, h: h0, solid: true })))}; worldZones = ${JSON.stringify(zones)}; (function(){ var f = fighters[0]; f.dead = false; f.x = ${x}; f.y = ${y}; f.vx = 0; f.vy = 0; f.onground = false; f.hitstun = 0; f.pct = 0; f._cf = -1; f.slowed = 0; f._pushOff = 0; f._pinT = 0; f._bonkT = -99; })()`);
}
const run = (w, n, keys = [], after) => {
  for (const k of keys) key(w, k, true);
  for (let i = 0; i < n; i++) { w.eval('fighters[0].slowed = fighters[0].slowed > 0 ? 9999 : 0; step()'); if (after) after(i); }
  for (const k of keys) key(w, k, false);
};
const me = (w) => J(w, `(function(){ var f = fighters[0]; return { x: Math.round(f.x), y: Math.round(f.y), vx: Math.round(f.vx*10)/10, vy: Math.round(f.vy*10)/10, g: f.onground }; })()`);

describe('push zones never hold a fighter', () => {
  it('a wind pressed against a wall does not win against a fighter pressing away, even a slowed flag carrier (whom the old wind pinned)', () => {
    const { window: w } = loadMonolith(201);
    start(w);
    // a floor, a wall at the east end, a wind blowing east along the floor
    arena(w, [[0, 2400, 8000, 400], [4000, 1200, 300, 1200]], [{ type: 'wind', x: 2400, y: 1500, w: 1600, h: 900, dir: 1, strength: 1 }], 3970, 2376);
    w.eval('(function(){ var f = fighters[0]; f._cf = 0; f.slowed = 9999; })()');   // a carrier (slower) who is also slowed: the run's push is 0.53 a step, the wind's 0.6
    run(w, 10);
    const x0 = me(w).x;
    run(w, 60, ['ArrowLeft']);
    expect(x0 - me(w).x, 'pressing away from the wall for a second takes the carrier at least 150 px out of the corner').toBeGreaterThan(150);
  });

  it('left alone in the air in a wind a fighter drifts, it is not thrown: the speed the wind alone gives stops at a drift', () => {
    const { window: w } = loadMonolith(202);
    start(w);
    arena(w, [[0, 4400, 20000, 400]], [{ type: 'wind', x: 1000, y: 500, w: 15000, h: 4000, dir: 1, strength: 1 }], 1200, 1000);
    let top = 0;
    run(w, 90, [], () => { top = Math.max(top, Math.abs(me(w).vx)); });
    expect(me(w).g, 'it is still in the air').toBe(false);
    expect(top, 'no runaway speed from the wind alone (the run tops out near 9.6; the old wind took a fighter there in 16 steps)').toBeLessThanOrEqual(4);
    expect(me(w).x, 'it did drift downwind').toBeGreaterThan(1500);
  });

  it('an updraft in a shaft with a lid lets a fighter out: holding Down it comes down, and a fighter pressing sideways against the walls is let go', () => {
    const { window: w } = loadMonolith(203);
    start(w);
    // a shaft: walls and a lid, a gust from the floor to the lid
    const place = () => arena(w, [[0, 2400, 6000, 400], [1000, 600, 200, 1800], [1600, 600, 200, 1800], [1000, 600, 800, 200]], [{ type: 'updraft', x: 1200, y: 800, w: 400, h: 1600, strength: 1.8 }], 1400, 2300);
    place();
    run(w, 110);
    expect(me(w).y, 'the gust carries it up to the lid').toBeLessThan(1000);
    run(w, 100, ['ArrowDown']);
    expect(me(w).y, 'holding Down, it comes back down to the floor').toBeGreaterThan(2000);
    place();
    run(w, 110);
    expect(me(w).y).toBeLessThan(1000);
    let lowest = 0;
    run(w, 200, ['ArrowLeft'], () => { lowest = Math.max(lowest, me(w).y); });   // pressed against the wall under the lid: the push lets go of a fighter who is trying and not moving
    expect(lowest, 'a fighter pressed into the corner of the shaft is let go of within a few seconds and falls out of the lid').toBeGreaterThan(2000);
  });

  it('every updraft of the sky lets a fighter out of each of its corners within a second of pressing away (the keys are real)', () => {
    const { window: w } = loadMonolith(204);
    start(w, 10);
    const n = w.eval(`(CTF.map.zones || []).filter(function(z){ return z.type === 'updraft'; }).length`);
    expect(n, 'the sky has updrafts').toBeGreaterThan(0);
    for (let zi = 0; zi < n; zi++) {
      const z = J(w, `(CTF.map.zones || []).filter(function(z){ return z.type === 'updraft'; })[${zi}]`);
      for (const px of [z.x + 26, z.x + z.w - 26]) for (const py of [z.y + z.h - 30, z.y + 40]) {
        const outs = ['ArrowLeft', 'ArrowRight'].map((k) => {
          w.eval(`(function(){ var f = fighters[0]; f.dead = false; f.x = ${px}; f.y = ${py}; f.vx = 0; f.vy = 0; f.onground = false; f.hitstun = 0; f._pushOff = 0; f._pinT = 0; })()`);
          let out = false;
          run(w, 30);
          run(w, 60, [k], () => { const m = me(w); if (m.x < z.x - 2 || m.x > z.x + z.w + 2 || m.y - 24 > z.y + z.h || m.y + 24 < z.y) out = true; });
          return out;
        });
        expect(outs.some(Boolean), `updraft ${zi} at column ${Math.round(z.x / 120)}: from the corner (${Math.round(px)}, ${Math.round(py)}) pressing away gets out within a second`).toBe(true);
      }
    }
  });
});
