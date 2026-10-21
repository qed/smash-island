import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// INTERIORS (the owner, 2026-10-19: "THATS THE CABIN???? I THOUGHT IT WAS AN AREA LIKE THE MILL"): several areas apart under one map, each like the oak's mill (its own view, blackout, minimap and shot
// cutoff), entered by Up in a doorway and left by its ways out: two-way doors, mill-style exits, risky drops that hurt, holes, and ziplines; the CPUs path through them. A small lab map, built here
// for the test only (never in the game): a hall on the map, and under it one interior a side (an upper hall, a lower hall with a pit, a raised end under a zipline that crosses the pit to a ledge
// only it reaches).

const LAB = `CTF_MAPS.ivlab = { name:'Interior Lab', wip:true, noGraph:true, size:{ rows:16, half:30, pocket:14 }, theme:Object.assign({}, CTF_MAPS.castle.theme, { skinRects:[] }),
  build(g){
    var Y = function(r){ return r + 23; }, A = function(c0, r0, c1, r1){ g.box(Y(r0), c0, Y(r1), c1, '.'); }, S = function(c0, r0, c1, r1){ g.box(Y(r0), c0, Y(r1), c1, '#'); }, P = function(r, c, s){ g.put(Y(r), c, s); };
    S(0, 0, 29, 15); A(1, 1, 29, 9);                                                      // the hall on the map (floor row 10)
    S(1, 6, 4, 6); g.col(4, Y(7), Y(9), 'J'); P(9, 1, 'ppp'); g.keepClear(1, Y(7), 4, Y(9)); P(9, 10, 'PP'); P(9, 13, 'HHH');
    g.rock(); g.interior('lab', 2, Y(17), 27, Y(28), { name:'Lab' });
    A(3, 18, 26, 21);                                                                     // the upper hall (floor row 22)
    A(3, 24, 26, 27);                                                                     // the lower hall (floor row 28)
    A(18, 22, 19, 23); g.shaft(18, Y(27), Y(22));                                        // hops between them
    A(8, 28, 16, 28);                                                                     // a pit across the lower hall: its west ledge (cols 3-7) only the zipline reaches
    S(22, 26, 26, 27); g.fill(Y(27), 20, 21, '=');                                       // a raised end under the zipline's start, a hop up to it
    g.passage([20, Y(8), 21, Y(9)], [5, Y(20), 6, Y(21)]);                                 // a two-way front door: the hall <-> the upper hall
    g.entrance(25, Y(8), 26, Y(9), 23, Y(24));                                            // a door in: onto the raised end
    g.exitDoor(4, Y(26), 5, Y(27), 16, Y(8));                                             // the ledge's way out, to the hall
    g.drop(22, Y(20), 23, Y(21), 7, Y(8), 15);                                            // a risky drop out of the upper hall (Up)
    g.drop(8, Y(28), 16, Y(28), 18, Y(8), 10, { fall:true });                             // the pit: fall in and you are out, hurt
    g.zip(24, Y(24), 5, Y(24));                                                           // the zipline over the pit
    P(21, 10, 'B'); P(27, 6, 'C'); P(9, 7, 'W');
    g.back(3, Y(18), 26, Y(27), 'wood'); g.back(1, Y(1), 29, Y(9), 'brick');
  } };`;

function start(seed, nav) {
  const { window: w } = loadMonolith(seed);
  w.eval(LAB);
  w.eval(`${nav ? 'CTF.noShipped=true;' : 'CTF.skipNav=true;'} SETTINGS.mode='ctf'; SETTINGS.count=6; SETTINGS.itemRate=0; CTF.forceMap='ivlab'; beginMatchNow();
          fighters.forEach(function(f){ f.controller='still'; f.you=false; }); ctfEndHide(CTF.live);`);
  return w;
}
const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
const LAB_ID = `CTF.map.interiors.find(function(a){ return a.key === 'lab' && a.half === 0; }).id`;

describe('interiors: several rooms apart under one map', () => {
  it('the oak\'s mill is still everything under its map, id 1, with the same doors; a map\'s own interiors are numbered, one a side, each with its box', () => {
    const w = start(61);
    const oak = J(w, `(function(){ var M = ctfMapBuild('oak', false, 1); return { iv:M.interiors.map(function(a){ return [a.id, !!a.band, a.y]; }), band:!!M.ivBand, py:M.pocketY, at:[ctfInteriorAt(M, 500, M.pocketY + 10), ctfInteriorAt(M, 500, M.pocketY - 10)], enter:M.portals.filter(function(p){ return p.kind === 'enter'; }).length, exit:M.portals.filter(function(p){ return p.kind === 'exit'; }).length, iv2:M.portals.some(function(p){ return p.iv; }) }; })()`);
    expect(oak.band, 'the mill is the band under the map').toBe(true);
    expect(oak.iv, 'one room apart, id 1, its top the top of the rows under the map').toEqual([[1, true, oak.py]]);
    expect(oak.at, 'under the map is the mill, over it is not').toEqual([1, null]);
    expect([oak.enter, oak.exit, oak.iv2], 'its doors as they were: a door in a side, two ways out a side').toEqual([2, 4, false]);
    const M = J(w, `{ WW:CTF.map.WW, py:CTF.map.pocketY, iv:CTF.map.interiors.map(function(a){ return { id:a.id, key:a.key, half:a.half, x:a.x, y:a.y, w:a.w, h:a.h, name:a.name }; }), zips:CTF.map.zips.length }`);
    expect(M.iv.map(a => [a.id, a.key, a.half]), 'two interiors, numbered from 2: one a side').toEqual([[2, 'lab', 0], [3, 'lab', 1]]);
    expect(M.iv[0].y, 'under the map').toBeGreaterThanOrEqual(M.py);
    expect(M.iv[1].x, 'the other side\'s is this one turned over').toBe(M.WW - M.iv[0].x - M.iv[0].w);
    expect(M.zips, 'a zipline a side').toBe(2);
    expect(() => w.eval(`(function(){ CTF_MAPS.ivbad = { name:'x', wip:true, size:{ rows:16, half:30 }, theme:CTF_MAPS.ivlab.theme, build:function(g){ g.box(0, 0, 15, 29, '#'); g.interior('up', 2, 2, 5, 5); } }; ctfMapBuild('ivbad'); })()`), 'an interior on the map itself (not under it) is refused').toThrow(/under the map/);
  });

  it('Up in a doorway goes in and out: a two-way door (Up let go between), a door in, a mill-style way out; inside, the view keeps to the box, nobody outside sees in, shots stop at the edge, and the wire says which room', () => {
    const w = start(62);
    const id = w.eval(LAB_ID), f = w.eval('fighters.find(function(g){ return g.team === 0; }).idx');
    const P = J(w, `CTF.map.portals.filter(function(p){ return p.iv && p.x < CTF.map.WW/2; })`), box = J(w, `CTF.map.ivOf[${id}]`);
    const front = P.find(p => p.two && p.kind === 'enter'), back = P.find(p => p.two && p.kind === 'exit'), door = P.find(p => p.kind === 'enter' && !p.two), out = P.find(p => p.kind === 'exit' && !p.two && !p.dmg);
    const put = (p) => w.eval(`(function(){ var f = fighters[${f}]; f.x = ${p.x + p.w / 2}; f.y = ${p.y + p.h} - f.r; f.vx = 0; f.vy = 0; f.onground = true; f._portCool = 0; f._portHold = false; f._portT = 0; })()`);
    const hold = (n, up) => { for (let i = 0; i < n; i++) w.eval(`(function(){ var f = fighters[${f}]; f._press = 0; f._pressUp = ${!!up}; ctfStepPortals(CTF.live); })()`); };
    const me = () => J(w, `{ x:fighters[${f}].x, y:fighters[${f}].y, room:fighters[${f}]._room || null }`);
    put(front); hold(10, false); expect(me().room, 'standing in the doorway: nothing').toBeNull();
    hold(6, true); let m = me();
    expect(m.room, 'Up held: in the interior').toBe(id);
    expect(m.x > box.x && m.x < box.x + box.w && m.y > box.y && m.y < box.y + box.h, 'put down inside its box').toBe(true);
    expect(Math.abs(m.x - (back.x + back.w / 2)) < back.w, 'in the inside doorway').toBe(true);
    hold(80, true); expect(me().room, 'Up still held: no swinging back out').toBe(id);
    hold(1, false); hold(8, true); m = me();
    expect(m.room, 'let go and hold again: out by the same door').toBeNull();
    expect(Math.abs(m.x - (front.x + front.w / 2)) < front.w, 'standing in the front doorway').toBe(true);
    put(door); hold(6, true); m = me();
    expect(m.room, 'a door in').toBe(id);
    expect(Math.abs(m.x - door.tx), 'where it leads').toBeLessThan(2);
    // inside: the camera keeps to the box, the black covers the rest, outsiders do not see in, shots do not cross, the wire carries the room's id
    const cam = J(w, `(function(){ var g = fighters[${f}]; fighters.forEach(function(q){ q.you = false; }); g.you = true; var z = 0.9, t = camTarget(g.x, g.y, z), hw = (W/2)/z, hh = (H/2)/z, c = { x:t.x + W/2, y:t.y + H/2 }; return { x0:c.x - hw, x1:c.x + hw, y0:c.y - hh, y1:c.y + hh, vr:ctfViewRoom() }; })()`);
    expect(cam.vr, 'the view is of the interior').toBe(id);
    expect(cam.x0 >= box.x - 1 && cam.x1 <= box.x + box.w + 1 && cam.y0 >= box.y - 1 && cam.y1 <= box.y + box.h + 1, 'the view stays inside its box, both ways').toBe(true);
    expect(w.eval(`(function(){ try{ ctfDrawRoomMask(); ctfDrawMinimap(); return true; }catch(e){ return String(e); } })()`), 'the blackout and the minimap of the room draw').toBe(true);
    expect(w.eval(`CTF_MINI.id`), 'the minimap is of this interior').toContain('p' + id);
    const other = w.eval(`fighters.find(function(g){ return g.team === 0 && g.idx !== ${f}; }).idx`);
    expect(w.eval(`(function(){ var o = fighters[${other}]; o._room = null; fighters[${f}].you = false; o.you = true; return ctfHiddenFrom(fighters[${f}]); })()`), 'from outside, a fighter in it is hidden').toBe(true);
    w.eval(`(function(){ fighters[${other}].you = false; fighters[${f}].you = true; projectiles.push({ x:fighters[${f}].x + 40, y:fighters[${f}].y, life:100, ownerObj:fighters[${f}], dmg:5 }, { x:1500, y:900, life:100, ownerObj:fighters[${f}], dmg:5 }); ctfStepPortals(CTF.live); })()`);
    expect(w.eval(`projectiles.filter(function(p){ return p.life > 0; }).length`), 'its own shot flies on; one on the map from inside is gone').toBe(1);
    const wire = J(w, `(function(){ var o = {}; ctfNetFighter(fighters[${f}], o); var g = fighters[${other}]; g.rm = o.rm; g.zp = undefined; ctfNetFightersIn(); return { rm:o.rm, back:g._room }; })()`);
    expect(wire, 'online: the room\'s id goes on the wire and comes back').toEqual({ rm: id, back: id });
    // a way out, the mill's kind: somewhere else on the map
    put(out); hold(6, true); m = me();
    expect(m.room, 'out').toBeNull();
    expect(Math.abs(m.x - out.tx), 'where it leads, on the map').toBeLessThan(2);
  });

  it('a zipline carries you from its start to its end (over a pit nothing else crosses); a hit knocks you off', () => {
    const w = start(63);
    const id = w.eval(LAB_ID), f = w.eval('fighters.find(function(g){ return g.team === 0; }).idx');
    const z = J(w, `CTF.map.zips.find(function(z){ return z.x0 < CTF.map.WW/2; })`);
    const stand = () => w.eval(`(function(){ var f = fighters[${f}], sy = ctfSurfaceBelow(${z.x0}, ${z.y0}, 400); f.x = ${z.x0} + 20; f.y = sy - f.r; f.vx = 0; f.vy = 0; f.onground = true; f.hitstun = 0; f._portCool = 0; f._portHold = false; f._zip = null; f._room = ctfInteriorAt(CTF.map, f.x, f.y); f._pressUp = true; ctfStepPortals(CTF.live); })()`);
    stand();
    expect(J(w, `fighters[${f}]._zip`), 'Up under its start: hooked on').toMatchObject({ t: 0 });
    let maxX = 1e9, onLine = 0;
    for (let i = 0; i < 400; i++) { w.eval('step()'); const s = J(w, `{ x:fighters[${f}].x, zip:!!fighters[${f}]._zip }`); maxX = Math.min(maxX, s.x); if (s.zip) onLine++; }
    const end = J(w, `{ x:fighters[${f}].x, y:fighters[${f}].y + fighters[${f}].r, g:fighters[${f}].onground, room:fighters[${f}]._room, zip:fighters[${f}]._zip }`);
    expect(onLine, 'it rode the line for the length of it').toBeGreaterThan(Math.abs(z.x1 - z.x0) / 14);
    expect(end.zip, 'let go at the end').toBeNull();
    expect(Math.abs(end.x - z.x1), 'and landed by the end').toBeLessThan(400);
    expect(end.g, 'standing').toBe(true);
    expect(end.room, 'still in the interior').toBe(id);
    expect(end.y, 'on the ledge across the pit, not in it').toBeLessThan(w.eval(`CTF.map.portals.find(function(p){ return p.fall && p.x < CTF.map.WW/2; }).y`) + 2);
    stand(); for (let i = 0; i < 20; i++) w.eval('step()');
    w.eval(`fighters[${f}].hitstun = 20; ctfStepPortals(CTF.live);`);
    expect(J(w, `fighters[${f}]._zip`), 'hit: knocked off').toBeNull();
  });

  it('a risky drop lets you out and costs its damage; a hole takes you the moment you are in it, Up or not', () => {
    const w = start(64);
    const f = w.eval('fighters.find(function(g){ return g.team === 0; }).idx');
    const P = J(w, `CTF.map.portals.filter(function(p){ return p.dmg && p.x < CTF.map.WW/2; })`), up = P.find(p => !p.fall), hole = P.find(p => p.fall);
    w.eval(`(function(){ var f = fighters[${f}]; f.x = ${up.x + up.w / 2}; f.y = ${up.y + up.h} - f.r; f.onground = true; f.pct = 20; f._portCool = 0; f._portHold = false; })()`);
    for (let i = 0; i < 3; i++) w.eval(`fighters[${f}]._pressUp = true; ctfStepPortals(CTF.live);`);
    expect(w.eval(`fighters[${f}]._room`), 'not yet: Up is held a moment, as at any door').not.toBeNull();
    for (let i = 0; i < 3; i++) w.eval(`fighters[${f}]._pressUp = true; ctfStepPortals(CTF.live);`);
    let m = J(w, `{ x:fighters[${f}].x, room:fighters[${f}]._room || null, pct:fighters[${f}].pct }`);
    expect(m.room, 'out').toBeNull();
    expect(Math.abs(m.x - up.tx), 'where it leads').toBeLessThan(2);
    expect(m.pct, 'and hurt by its damage').toBe(20 + up.dmg);
    w.eval(`(function(){ var f = fighters[${f}]; f.x = ${hole.x + hole.w / 2}; f.y = ${hole.y + hole.h / 2}; f.vy = 8; f.onground = false; f.pct = 0; f._portCool = 0; f._portHold = false; f._pressUp = false; f._room = ctfInteriorAt(CTF.map, f.x, f.y); ctfStepPortals(CTF.live); })()`);
    m = J(w, `{ x:fighters[${f}].x, room:fighters[${f}]._room || null, pct:fighters[${f}].pct }`);
    expect([m.room, Math.abs(m.x - hole.tx) < 2, m.pct], 'fell in: out at once, where it leads, hurt').toEqual([null, true, hole.dmg]);
  });

  it('CPUs: every door, drop and the zipline is a plain move of the route graph (the ledge only the line reaches), a flag in there counts as reachable, and a CPU walks in by a door and rides the line', { timeout: 120000 }, () => {
    const w = start(65, true);
    const r = J(w, `(function(){ var M = CTF.map, nav = ctfNavNew(M); while(!nav.ready) ctfNavTick(nav, 80); CTF.nav = nav; CTF.navs = {}; CTF.navs[ctfNavId()] = nav;
      var pe = []; nav.nodes.forEach(function(n){ n.edges.forEach(function(e){ if(e.kind === 'portal') pe.push({ plain:!!e.plain, zip:e.zip != null, fall:!!e.fall, from:n.id, to:e.to, x:n.x0 }); }); });
      var ledge = M.zips.find(function(z){ return z.x0 < M.WW/2; }), ln = ctfNavNodeAt(nav, ledge.x1, ctfSurfaceBelow(ledge.x1, ledge.y1 + 40, 900), 8);
      var reach = function(noZip){ var seen = new Uint8Array(nav.nodes.length), q = []; M.homes[0].spawns.forEach(function(sp){ var n = ctfNavNodeAt(nav, sp.x, sp.y, 12); if(n && !seen[n.id]){ seen[n.id] = 1; q.push(n.id); } });
        while(q.length){ var id = q.pop(); nav.nodes[id].edges.forEach(function(e){ if(noZip && e.zip != null) return; if(e.doors.some(function(d){ return d[0] === 'J'; }) || ctfNavPitIn(nav, e)) return; if(!seen[e.to]){ seen[e.to] = 1; q.push(e.to); } }); } return seen; };
      var mo = ctfNavMoverOnly(nav), up = ctfNavNodeAt(nav, 1500, ctfSurfaceBelow(1500, 2200, 900), 8);
      return { pe:pe, ledge:ln ? ln.id : null, withZip:ln ? !!reach(false)[ln.id] : null, noZip:ln ? !!reach(true)[ln.id] : null, upMover:up ? mo[up.id] : null, flagOK:ctfAiReachable(0, ledge.x1, ctfSurfaceBelow(ledge.x1, ledge.y1 + 40, 900)), lx:ledge.x1, ly:ctfSurfaceBelow(ledge.x1, ledge.y1 + 40, 900) }; })()`);
    const left = r.pe.filter(e => e.x < w.eval('CTF.map.WW/2'));
    expect(left.length, 'the front door both ways, the door in, the way out, the drop, the pit and the zipline: a move each').toBeGreaterThanOrEqual(7);
    expect(r.pe.every(e => e.plain), 'all plain ways').toBe(true);
    expect(left.filter(e => e.zip).length, 'the zipline').toBe(1);
    expect(left.filter(e => e.fall).length, 'the pit').toBe(1);
    expect(r.ledge, 'the ledge is a place of the graph').not.toBeNull();
    expect(r.withZip, 'reached from home with the zipline').toBe(true);
    expect(r.noZip, 'and only with it').toBe(false);
    expect(r.upMover, 'the interior is not "a place only a mover reaches": its doors are plain ways in').toBe(0);
    expect(r.flagOK, 'a flag hidden on the ledge: the foe can get to it').toBe(true);
    // a CPU from home to the ledge: in by a door, along the raised end, along the line
    const f = w.eval('fighters.find(function(g){ return g.team === 0; }).idx'), id = w.eval(LAB_ID);
    w.eval(`(function(){ CTF.noPlan = true; CTF.stat = {}; var f = fighters[${f}]; f.controller = 'ai'; f._ai.goal = { kind:'guard', x:${r.lx}, y:${r.ly} }; f._ai.replan = 1e9; f._ai.role = 'att'; })()`);
    let best = null, rode = false;
    for (let i = 0; i < 5000 && !best; i++) { w.eval('step()'); if (i % 10 === 0) { const s = J(w, `{ x:fighters[${f}].x, y:fighters[${f}].y + fighters[${f}].r, room:fighters[${f}]._room || null, g:fighters[${f}].onground, zip:!!fighters[${f}]._zip }`); if (s.zip) rode = true; if (s.room === id && s.g && Math.abs(s.y - r.ly) < 8 && Math.abs(s.x - r.lx) < 500) best = s; } }
    expect(best, 'the CPU got to the ledge across the pit').not.toBeNull();
    expect(rode, 'riding the zipline').toBe(true);
    for (let i = 0; i < 20; i++) w.eval('step()');
    expect(J(w, 'CTF.stat.portalOK || 0'), 'in by a door (the end of the line is the place it was for)').toBeGreaterThanOrEqual(1);
  });
});

// THE SKIFF (the sky map, the Fleet's half): the first interior in a shipped map. Outside, the cabin is a closed shell with a door at each end; inside, six rooms under the map, the crane's zipline, the bilge's
// drain (a hole) and the CANNON (g.cannon): Up in its breech, a fuse, then a fixed arc out over the sky to the dock end of the Sky Fair; a flag carrier may not ride it (the owner, 2026-10-19).
function sky(seed, count = 10) {
  const { window: w } = loadMonolith(seed);
  w.eval(`CTF.skipNav=true; SETTINGS.mode='ctf'; SETTINGS.count=${count}; SETTINGS.itemRate=0; CTF.forceMap='sky'; beginMatchNow();
          fighters.forEach(function(f){ f.controller='still'; f.you=false; }); ctfEndHide(CTF.live);`);
  return w;
}

describe('the skiff: the sky map\'s first interior, and its cannon', () => {
  it('is one interior on the Fleet\'s half in every size and either way round, with its doors both ways, the hatch to the roof, the drain, the zipline and a cannon whose arc ends on the fair\'s dock end, clear of the map', () => {
    const { window: w } = loadMonolith(91);
    const r = J(w, `[0, 1, 2].reduce(function(out, band){ [false, true].forEach(function(sw){ var M = ctfMapBuild('sky', sw, band), col = [0, 0, 24][band] + 66 + [14, 28, 40][band] - 2, iv = M.interiors, P = M.portals.filter(function(p){ return p.iv; }), k = M.cannons[0], A = k && ctfCannonPath(M, k, 40);
      var clear = true; if(A) for(var t = 0; t <= A.T; t++){ var q = ctfCannonPos(A, t); M.plats.forEach(function(p){ if(p.solid && q.x > p.x - 30 && q.x < p.x + p.w + 30 && q.y > p.y - 30 && q.y < p.y + p.h + 30 && t < A.T - 2) clear = false; }); }
      out.push({ band:band, sw:sw, n:iv.length, key:iv[0] && iv[0].key, half:iv[0] && iv[0].half, band1:!!M.ivBand, under:iv[0] && iv[0].y >= M.pocketY,
        two:P.filter(function(p){ return p.two; }).length, out:P.filter(function(p){ return p.kind === 'exit' && !p.two && !p.dmg; }).length, hole:P.filter(function(p){ return p.fall && p.dmg === 8; }).length,
        zips:M.zips.length, cans:M.cannons.length, sameHalf:!!A && (A.x1 < M.WW/2) === (iv[0].half === 0), lands:!!A && Math.abs(A.y1 + 42 - 14*120) < 2, fair:!!A && Math.abs(A.x1 - (iv[0].half === 0 ? col*120 + 60 : M.WW - col*120 - 60)) < 2, clear:clear, T:A && A.T }); }); return out; }, [])`);
    for (const m of r) {
      const at = `band ${m.band}${m.sw ? ' swapped' : ''}`;
      expect([m.n, m.key, m.under, m.band1], `${at}: one interior, the skiff, under the map, not a mill`).toEqual([1, 'skiff', true, false]);
      expect(m.half, `${at}: on the Fleet's half`).toBe(m.sw ? 0 : 1);
      expect([m.two, m.out, m.hole, m.zips, m.cans], `${at}: two doors both ways (four doorways), the hatch to the roof, the drain, the crane's zipline, the cannon`).toEqual([4, 1, 1, 1, 1]);
      expect([m.sameHalf, m.lands, m.fair], `${at}: the cannon lands on the fair's dock-end island, on its own half`).toEqual([true, true, true]);
      expect(m.clear, `${at}: the arc never goes through the map`).toBe(true);
    }
  });

  it('the cannon: Up in its breech lights a fuse, a second later you are fired along the arc with no steering and land on the fair; a carrier is refused; a hit knocks you out of the barrel, or off the arc', () => {
    const w = sky(92);
    const k = J(w, `(function(){ var k = CTF.map.cannons[0], A = ctfCannonPath(CTF.map, k, 40); return { x:k.x, y:k.y, w:k.w, h:k.h, mx:k.mx, my:k.my, lx:k.lx, fuse:k.fuse, T:A.T }; })()`);
    const f = w.eval(`fighters.find(function(g){ return g.team === CTF.map.interiors[0].half; }).idx`);
    const put = () => w.eval(`(function(){ var f = fighters[${f}]; f.x = ${k.x + k.w / 2}; f.y = ${k.y + k.h} - f.r; f.vx = 0; f.vy = 0; f.onground = true; f.hitstun = 0; f.dead = false; f._cf = -1; f._portCool = 0; f._portHold = false; f._portT = 0; f._fuse = null; f._can = null; f._room = ctfInteriorAt(CTF.map, f.x, f.y); })()`);
    const up = (n) => { for (let i = 0; i < n; i++) w.eval(`fighters[${f}]._pressUp = true; ctfStepPortals(CTF.live);`); };
    const me = () => J(w, `{ x:fighters[${f}].x, feet:fighters[${f}].y + fighters[${f}].r, room:fighters[${f}]._room || null, fuse:!!fighters[${f}]._fuse, can:!!fighters[${f}]._can, g:fighters[${f}].onground }`);
    put(); up(3); expect(me().fuse, 'Up held a moment, as at a door').toBe(false);
    up(1); let m = me(); expect([m.fuse, m.room != null], 'in the barrel, the fuse lit, still inside').toEqual([true, true]);
    for (let i = 0; i < k.fuse - 2; i++) w.eval('step()');
    expect(me().fuse, 'the fuse burns about a second').toBe(true);
    for (let i = 0; i < 4; i++) w.eval('step()');
    m = me(); expect([m.can, m.room], 'fired: out of the ship, on the arc').toEqual([true, null]);
    expect(Math.hypot(m.x - k.mx, m.feet - k.my), 'from the muzzle').toBeLessThan(400);
    expect(J(w, `(function(){ var r = ctfFilterInput(fighters[${f}], { left:true, right:false, jump:true, up:true, down:false, attack:true, special:false, smash:false, flag:false, edit:false }); return [r.left, r.jump, r.attack]; })()`), 'no steering in the air').toEqual([false, false, false]);
    let n = 0; for (; n < k.T + 120; n++) { w.eval('step()'); m = me(); if (!m.can && m.g) break; }
    expect(m.g, 'down again').toBe(true);
    expect(Math.abs(m.x - k.lx), 'on the fair\'s dock-end island, where it always lands').toBeLessThan(200);
    expect(Math.abs(m.feet - 14 * 120), 'on its top').toBeLessThan(4);
    put(); w.eval(`fighters[${f}]._cf = 0;`); up(8); expect(me().fuse, 'a flag carrier may not ride it').toBe(false);
    put(); up(4); for (let i = 0; i < 20; i++) w.eval('step()');
    w.eval(`fighters[${f}].hitstun = 15; fighters[${f}].vx = -6;`); w.eval('step()'); m = me();
    expect([m.fuse, m.can, m.room != null], 'hit in the barrel: knocked out of it, still inside (it fires empty)').toEqual([false, false, true]);
    put(); up(4); for (let i = 0; i < k.fuse + 40; i++) w.eval('step()');
    expect(me().can, 'in the air').toBe(true);
    w.eval(`fighters[${f}].hitstun = 15; fighters[${f}].vx = 6; fighters[${f}].vy = 2;`); w.eval('step()');
    expect(me().can, 'hit in the air: off the arc').toBe(false);
    expect(J(w, `(function(){ var o = {}, g = fighters[${f}]; g._fuse = { i:0, t:3 }; ctfNetFighter(g, o); g._fuse = null; return o.cn; })()`), 'online: who is in a barrel goes on the wire').toEqual([0, 1]);
  });

  it('CPUs: the cannon is a plain way for a free fighter only, the drain\'s move starts on the floor at its edge, and a Fleet CPU sent to the cannon\'s landing goes in by a door (over the roof to the bow door, the quick way) and is fired', { timeout: 240000 }, () => {
    const { window: w } = loadMonolith(93);
    w.eval(`CTF.noShipped=true; SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.forceMap='sky'; beginMatchNow(); fighters.forEach(function(f){ f.controller='still'; f.you=false; }); ctfEndHide(CTF.live);
            var nav = ctfNavMake(CTF.map); while(!nav.ready) ctfNavTick(nav, 200); CTF.nav = nav; CTF.navs = {}; CTF.navs[ctfNavId()] = nav; ctfAiBegin(CTF.live, nav);`);
    const r = J(w, `(function(){ var M = CTF.map, nav = CTF.nav, N = nav.nodes, can = [], hole = [];
      N.forEach(function(n){ n.edges.forEach(function(e){ if(e.kind !== 'portal') return; if(e.can != null) can.push({ plain:!!e.plain, prof:e.prof || '', pit:!!n.pit }); if(e.fall) hole.push({ pit:!!n.pit, inside:ctfInteriorAt(M, (n.x0 + n.x1)/2, n.y - 10) }); }); });
      return { can:can, hole:hole, iv:M.interiors[0].id }; })()`);
    expect(r.can, 'one move for the cannon, plain, for a free fighter (a carrier\'s plan never takes it)').toEqual([{ plain: true, prof: 'f', pit: false }]);
    expect(r.hole, 'the drain: one move, from the bilge\'s floor, not from the bottom of the hole').toEqual([{ pit: false, inside: r.iv }]);
    const f = w.eval('fighters.find(function(g){ return g.team === CTF.map.interiors[0].half; }).idx');
    const g = J(w, `(function(){ var k = CTF.map.cannons[0], A = ctfCannonPath(CTF.map, k, 40), d = CTF.map.portals.find(function(p){ return p.iv && p.two && p.kind === 'enter' && Math.abs(p.ty - 38*120) < 200; }); return { x:k.lx, y:A.y1 + 42, dx:d.x + d.w/2, dy:d.y + d.h }; })()`);
    w.eval(`(function(){ CTF.noPlan = true; CTF.stat = {}; var f = fighters[${f}]; f.controller = 'ai'; f.x = ${g.dx} + (${g.dx} > CTF.map.WW/2 ? 1 : -1)*200; f.y = ${g.dy} - f.r - 2; f.vx = 0; f.vy = 0; })()`);
    let inside = false, fired = false, best = null;
    for (let i = 0; i < 4000 && !best; i++) {
      w.eval(`(function(){ var a = fighters[${f}]._ai; if(!a.goal || a.goal.x !== ${g.x}){ a.goal = { kind:'guard', x:${g.x}, y:${g.y} }; a.path = null; } a.replan = 1e9; a.role = 'att'; })(); step()`);
      const s = J(w, `{ x:fighters[${f}].x, feet:fighters[${f}].y + fighters[${f}].r, room:fighters[${f}]._room || null, can:!!fighters[${f}]._can, g:fighters[${f}].onground }`);
      if (s.room) inside = true; if (s.can) fired = true;
      if (fired && !s.can && s.g) best = s;   // (the first footing after the shot)
    }
    expect([inside, fired], 'in by a door, out by the cannon').toEqual([true, true]);
    expect(best && Math.abs(best.x - g.x) < 300 && Math.abs(best.feet - g.y) < 8, 'and down on the fair where it lands').toBe(true);
  });
});
