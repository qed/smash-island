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
    expect(ws.filter(x => x.kind === 'wheel').length, 'one water wheel in the whole map: it is its own mirror').toBe(1);
    expect(ws.filter(x => x.kind === 'cog').length, 'and the cogs of the mill: the great one on the line, two a side in the gear room, the millstones').toBe(7);
    expect(ws[0].kind, 'the water wheel first').toBe('wheel');
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
    expect(out.wa.length, 'one angle a wheel and cog').toBe(8);
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

  it('the mill is wheel-only: the route graph reaches its hiding places by the wheel move (and the door it ends at) and by nothing else', { timeout:120000 }, () => {
    const { window: w } = loadMonolith(44);
    const r = JSON.parse(w.eval(`(function(){ var M = ctfMapGet('oak', false, 1); CTF.noShipped = true; var nav = ctfNavNew(M); while(!nav.ready) ctfNavTick(nav, 80);
      var spots = M.spots.filter(function(s){ return M.rooms.some(function(r){ return s.x >= r.x && s.x <= r.x + r.w && s.y > r.y && s.y <= r.y + r.h + 2; }); }), out = { n:spots.length, wheelEdges:0 };
      nav.nodes.forEach(function(n){ n.edges.forEach(function(e){ if(e.kind === 'wheel') out.wheelEdges++; }); });
      [false, true].forEach(function(noWheel){ var seen = new Uint8Array(nav.nodes.length), q = [];
        M.homes[0].spawns.forEach(function(sp){ var n = ctfNavNodeAt(nav, sp.x, sp.y, 12); if(n && !seen[n.id]){ seen[n.id] = 1; q.push(n.id); } });
        while(q.length){ var id = q.pop(); nav.nodes[id].edges.forEach(function(e){ if(noWheel && e.kind === 'wheel') return; if(e.doors.some(function(d){ return d[0] === 'J'; })) return; if(!seen[e.to]){ seen[e.to] = 1; q.push(e.to); } }); }
        var ok = 0; spots.forEach(function(s){ var n = ctfNavNodeAt(nav, s.x, s.y, 14); if(n && seen[n.id]) ok++; }); out[noWheel ? 'without' : 'with'] = ok; });
      return JSON.stringify(out); })()`));
    expect(r.n, 'the mill holds hiding places').toBeGreaterThanOrEqual(6);
    expect(r.wheelEdges, 'the graph has the wheel move').toBeGreaterThan(0);
    expect(r.with, 'all of them reached with it').toBe(r.n);
    expect(r.without, 'none without it: the wheel is the only way in').toBe(0);
  });

  it('a door is a press into it: it takes you into the room apart (one half or the other) and you cannot go out by it; the room cannot be seen into; a way out puts you elsewhere on your side', () => {
    const { window: w } = loadMonolith(45);
    start(w);
    const M = J(w, `{ WW:CTF.map.WW, portals:CTF.map.portals, rooms:CTF.map.rooms }`);
    const enters = M.portals.filter(p => p.kind === 'enter'), exits = M.portals.filter(p => p.kind === 'exit');
    expect(enters.length, 'a door in on each side of the line').toBe(2);
    expect(enters[0].dir, 'pressed the other way on the other side').toBe(-enters[1].dir);
    expect(exits.length, 'two ways out on each side').toBe(4);
    const f = w.eval('fighters[0].idx'), A = enters.find(p => p.dir < 0);
    const press = (dir, n, up) => { for (let i = 0; i < n; i++) w.eval(`(function(){ var f = fighters[${f}]; f._press = ${dir}; f._pressUp = ${!!up}; f.onground = true; ctfStepPortals(CTF.live); })()`); };
    // standing at the door on a paddle (level with the hub): a press into it goes in, to the half beside it
    w.eval(`(function(){ var f = fighters[${f}]; f.x = ${A.x + A.w/2}; f.y = ${A.y + A.h} - f.r; f.onground = true; f._room = null; })()`);
    press(0, 10); expect(w.eval(`fighters[${f}]._room`), 'not pressing: stays').toBeNull();
    press(A.dir, 8);
    expect(w.eval(`fighters[${f}]._room`), 'in the room apart').toBe(1);
    const inRoom = J(w, `{ x:fighters[${f}].x, y:fighters[${f}].y + fighters[${f}].r }`);
    expect(M.rooms.some(r => inRoom.x >= r.x && inRoom.x <= r.x + r.w && inRoom.y >= r.y && inRoom.y <= r.y + r.h + 2), 'put down inside it').toBe(true);
    expect(inRoom.x < M.WW/2, 'in the half beside the door it went through').toBe(A.dir < 0);
    // nobody outside sees in
    expect(w.eval(`(function(){ var o = fighters.find(function(g){ return g.idx !== ${f}; }); o._room = null; fighters[${f}].you = false; o.you = true; return ctfHiddenFrom(fighters[${f}]); })()`), 'from outside the room, a fighter in it is hidden').toBe(true);
    // it is no way out: the door it came through is far away, and the way out is a door in the room
    const ex = exits.find(p => p.x + p.w < M.WW/2);
    w.eval(`(function(){ var f = fighters[${f}]; f.x = ${ex.x + ex.w/2}; f.y = ${ex.y + ex.h} - f.r; f.onground = true; f._portCool = 0; })()`);
    press(-1, 30); press(1, 30);
    expect(w.eval(`fighters[${f}]._room`), 'walking into a way out is nothing: it wants Up').toBe(1);
    press(0, 12, true);
    expect(w.eval(`fighters[${f}]._room`), 'out of the room').toBeNull();
    const out = J(w, `{ x:fighters[${f}].x, y:fighters[${f}].y }`);
    expect(Math.abs(out.x - ex.tx), 'put down where the way out leads').toBeLessThan(2);
    expect(out.x < M.WW/2, 'on the same side of the map').toBe(true);
    // a shot from the map into the room (or out of it) is gone
    w.eval(`projectiles.push({ x:1000, y:CTF.map.pocketY + 600, life:100, ownerObj:fighters[${f}], dmg:5 }); ctfStepPortals(CTF.live);`);
    expect(w.eval('projectiles.filter(function(p){ return p.life > 0 && p.y > CTF.map.pocketY + 500; }).length'), 'nothing crosses').toBe(0);
  });

  it('a flag hidden on a paddle rides it, and the end-of-hiding check does not call the place impossible', () => {
    const { window: w } = loadMonolith(46);
    start(w);
    const id = J(w, `CTF.live.wheels[0].ids[0]`), fl = w.eval('CTF.live.flags[0].id');
    const at = () => J(w, `(function(){ var e = CTF.live.elevs[${id}], f = CTF.live.flags[${fl}]; return { px:e.x + e.w/2, py:e.y, fx:f.x, fy:f.y, pad:f.pad, st:f.st }; })()`);
    w.eval(`(function(){ var e = CTF.live.elevs[${id}], f = CTF.live.flags[${fl}]; ctfPlaceFlag(f, e.x + e.w/2, e.y); })()`);
    expect(at().pad, 'locked to the paddle').toBe(id);
    for (let i = 0; i < 200; i++) w.eval('ctfStepWheels(CTF.live)');
    const r = at();
    expect(Math.hypot(r.fx - r.px, r.fy - r.py), 'it went where the paddle went').toBeLessThan(2);
    expect(J(w, `ctfEditProblems(CTF.live, { nodes:[], nb:{}, reach:[[], []] }).filter(function(b){ return b === 'flag${fl}'; })`), 'not impossible').toEqual([]);
  });

  it('a trapdoor goes only over a drop: on a floor it would open onto the floor', () => {
    const { window: w } = loadMonolith(47);
    start(w, 'castle');
    const sp = J(w, `(function(){ var s = CTF.map.spots.filter(function(s){ return s.team===0 && s.y>1500 && s.x<8000; })[10]; return { x:s.x, y:s.y }; })()`), f = w.eval('fighters.filter(function(f){ return f.team === 0; })[1].idx');
    w.eval(`CTF.live.phase = 'hide'; CTF.live.pts[${f}] = 100;`);
    const chk = (y) => w.eval(`ctfEditCheck(fighters[${f}], 'trap', 'trapdoor', ctfEditShape('trap', 'trapdoor', ${sp.x}, ${y}))`);
    expect(chk(sp.y - 60), 'a plank just over the floor (it would drop you 60 px onto it): no').toBe('floor');
    expect([420, 540, 660, 780, 900, 1020].some(d => chk(sp.y - d) !== 'floor'), 'high over a drop: not refused for being on a floor').toBe(true);
  });

  it('nothing in the room is knocked out of it: a hard knock any way stays inside the walls; and from the map nothing reaches in', () => {
    const { window: w } = loadMonolith(48);
    start(w);
    const f = w.eval('fighters[0].idx'), py = w.eval('CTF.map.pocketY'), WW = w.eval('CTF.map.WW');
    const at = (x, y) => w.eval(`(function(){ var g = fighters[${f}]; g.x = ${x}; g.y = ${y} - g.r; g.vx = 0; g.vy = 0; g.hitstun = 0; g.onground = true; g.dead = false; })()`);
    for (const [vx, vy] of [[-180, 0], [180, 0], [0, -180], [0, 200], [-120, -120], [120, 120]]) {
      at(9300, 6600);   // (the great hall's floor, under the map)
      w.eval(`(function(){ var g = fighters[${f}]; g.vx = ${vx}; g.vy = ${vy}; g.hitstun = 60; })()`);
      for (let n = 0; n < 60; n++) w.eval('step()');
      const p = J(w, `{ x:fighters[${f}].x, y:fighters[${f}].y, room:fighters[${f}]._room }`);
      expect(p.y, 'under the map still (' + vx + ',' + vy + ')').toBeGreaterThan(py + 600);
      expect(p.x > 400 && p.x < WW - 400, 'inside the walls (' + vx + ',' + vy + ')').toBe(true);
      expect(p.room, 'still in the room').toBe(1);
    }
    // the camera stays in the room while you are in it, and in the map while you are not
    const cam = w.eval(`(function(){ var g = fighters[${f}]; g.you = true; var inn = camTarget(g.x, g.y, 0.9); g._room = null; var a = ctfViewRoom(); g.y = 800; g.x = 6000; var out = camTarget(g.x, g.y, 0.9); return JSON.stringify({ inn:inn.y, out:out.y, a:a }); })()`);
    const cj = JSON.parse(cam);
    expect(cj.inn + 360, 'from inside the view is inside the room: its top is under the map').toBeGreaterThanOrEqual(py - 1);
    expect(cj.out + 800 <= py + 1 || cj.out + 400 <= py, 'from the map the view never goes under it').toBe(true);
  });
});
