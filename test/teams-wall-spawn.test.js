import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// TEAMS: THE BIG WALL SPAWN ZONE (2TDM, 1v1 up to 10v10)
//
// The owner, 2026-10-05, verbatim:
//   "what about teams, which still doesnt have a 10v10 big wall spawn zone. i asked for that in the A tests!!!! thats 3 months ago!!!!"
// Asked what the "big wall spawn zone" is, they answered:
//   "so what I meant to do, was that in 2tdm, you would spawn along the vertical section of the map. and 3."
// ("3." is option 3 of the question they were asked: "Whole side wall: the full height of each team's side wall is its
// safe spawn zone, with 10 spawn spots stacked along it.")
//
// So, with exactly TWO teams, each team's safe zone is a band along its OWN side edge of the map (left team left, right
// team right), floor to top, with ten spawn spots stacked up it. The zone keeps its rules exactly (your own zone protects
// you and disables your attacks; an enemy's protects nobody). Three and four teams keep the corner pockets. Teams always
// plays on the Yoyle Crossing, a scrolling arena at every map size, so "a small stage and a big map" are the Compact and
// the Huge MAP SIZE: the smallest world and the biggest one.

// A teams match with one fixed fighter in every slot (nothing wanders off its spot on its own: Goo hops by himself) and no
// one steering. Fighters 0..N/2-1 are team 0, the rest team 1 (a fixed roster is not shuffled).
function start(w, key, count, size = 'normal') {
  w.eval(`
    SETTINGS.mode='teams'; SETTINGS.teamKey='${key}'; SETTINGS.count=${count}; SETTINGS.mapSize='${size}';
    SETTINGS.itemRate=0; SETTINGS.stocks=3;
    window.__netRoster = []; for (var i=0;i<${count};i++) window.__netRoster.push('Pen');
    beginMatchNow(); window.__netRoster = null;
    fighters.forEach(function(f){ f.controller='still'; f.you=false; });
  `);
}

// Everything the assertions read, in one plain object.
const info = (w) => JSON.parse(w.eval(`JSON.stringify({
  WW: WW, WH: WH, floorY: floors[0].y,
  zones: bases.map(function(b){ return teamZoneOf(b.team); }),
  spots: bases.map(function(b){ return b.spawns.map(function(s){ return { x:s.x, y:s.y }; }); }),
  plats: worldPlats.map(function(p){ return { x:p.x, y:p.y, w:p.w, h:p.h, solid:!!p.solid, pad:!!p.pad }; }),
  fighters: fighters.map(function(f){ return { team:f.team, x:f.x, y:f.y, r:f.r, onground:f.onground, own:inOwnTeamZone(f) }; })
})`));

// Which of its team's spots a fighter was formed on: where a spot puts a fighter (40 above its top). The match has already run
// its first frame by the time a test can look (beginMatchNow draws one), so a fighter is a pixel or two into its fall: the
// height is matched to within 8px, the across to within 1. BOTH, because every pad in a column shares an x.
const spotOf = (g, f) => g.spots[f.team].findIndex((s) => Math.abs(s.x - f.x) < 1 && Math.abs(s.y - 40 - f.y) < 8);

const SIZES = [['1v1', 2, 'compact'], ['5v5', 10, 'normal'], ['10v10', 20, 'huge']];

describe('the band is the whole side wall, on the smallest world and the biggest', () => {
  for (const [key, count, size] of SIZES) {
    it(`${key} on a ${size} map: world edge to a little way in, floor to top, ten spots stacked up it`, () => {
      const { window: w } = loadMonolith();
      start(w, key, count, size);
      const g = info(w);
      const [left, right] = g.zones;
      // the world's own edges, and the whole height from the floor line to the top of the world
      expect(left.x, 'the left team owns the left edge').toBeCloseTo(0, 3);
      expect(right.x + right.w, 'the right team owns the right edge').toBeCloseTo(g.WW, 3);
      for (const z of g.zones) {
        expect(z.y, 'starts at the top of the arena').toBeCloseTo(0, 3);
        expect(z.y + z.h, 'comes down to the floor').toBeCloseTo(g.floorY, 3);
        expect(z.w, 'a band down the wall, not a blanket over the map').toBeLessThan(g.WW * 0.2);
        expect(z.w, 'wide enough for two columns of ledges').toBeGreaterThan(300);
      }
      expect(left.w).toBeCloseTo(right.w, 3);
      // ten spots on each wall, mirror images of each other, every one inside its own band
      expect(g.spots.map((s) => s.length)).toEqual([10, 10]);
      g.spots[0].forEach((s, i) => {
        expect(g.WW - g.spots[1][i].x, 'the right wall mirrors the left').toBeCloseTo(s.x, 3);
        expect(g.spots[1][i].y).toBeCloseTo(s.y, 3);
      });
      g.spots.forEach((spots, t) => {
        const z = g.zones[t];
        for (const s of spots) {
          expect(s.x >= z.x && s.x <= z.x + z.w, `spot x ${Math.round(s.x)} inside the band`).toBe(true);
          expect(s.y >= z.y && s.y < z.y + z.h, `spot y ${Math.round(s.y)} inside the band`).toBe(true);
        }
        // stacked UP the wall: the lowest is on the home ledge by the floor, the highest is high on the wall
        const ys = spots.map((s) => s.y);
        expect(g.floorY - Math.max(...ys), 'the lowest spot is by the floor').toBeLessThan(150);
        expect(Math.min(...ys), 'the highest spot is up the wall').toBeLessThan(g.WH * 0.5);
        // never two on one place: no pair of spots close enough that a fighter on one counts as standing on the other
        // (pickSpawnPad treats a mate within 95 across and 115 up as crowding a pad)
        for (let i = 0; i < spots.length; i++) for (let j = i + 1; j < spots.length; j++) {
          const near = Math.abs(spots[i].x - spots[j].x) < 95 && Math.abs(spots[i].y - spots[j].y) < 115;
          expect(near, `spots ${i} and ${j} are apart`).toBe(false);
        }
      });
    });
  }

  it('every spot is the top of a ledge in the band, so a fighter who forms up there has footing', () => {
    for (const [key, count, size] of SIZES) {
      const { window: w } = loadMonolith();
      start(w, key, count, size);
      const g = info(w);
      g.spots.forEach((spots, t) => {
        for (const s of spots) {
          const ledge = g.plats.find((p) => Math.abs(p.y - s.y) < 0.5 && s.x >= p.x && s.x <= p.x + p.w && (p.solid || p.pad));
          expect(ledge, `${key}/${size} team ${t}: something to stand on at ${Math.round(s.x)},${Math.round(s.y)}`).toBeTruthy();
          expect(ledge.w, 'a ledge a fighter (48px) can stand on').toBeGreaterThanOrEqual(100);
        }
      });
    }
  });
});

describe('2TDM spawns: 1v1, 5v5 and 10v10 land inside their own side band, one to a spot, with footing', () => {
  for (const [key, count] of [['1v1', 2], ['5v5', 10], ['10v10', 20]]) {
    it(`${key}: every fighter forms up in its own band, each on a different spot`, () => {
      const { window: w } = loadMonolith();
      start(w, key, count);
      const g = info(w);
      expect(g.fighters.length).toBe(count);
      for (const f of g.fighters) {
        const z = g.zones[f.team];
        expect(f.own, `team ${f.team} fighter at ${Math.round(f.x)},${Math.round(f.y)} is in its own zone`).toBe(true);
        expect(f.x >= z.x && f.x <= z.x + z.w, 'inside its band across').toBe(true);
        expect(f.team === 0 ? f.x < g.WW * 0.25 : f.x > g.WW * 0.75, 'on its own side of the map').toBe(true);
      }
      for (const t of [0, 1]) {
        const mine = g.fighters.filter((f) => f.team === t);
        // each stands exactly where a spot puts a fighter (40 above its top), and no two on the same one
        const which = mine.map((f) => spotOf(g, f));
        expect(which.every((i) => i >= 0), 'every fighter is on a spot').toBe(true);
        expect(new Set(which).size, `team ${t}: ${mine.length} fighters, ${mine.length} different spots`).toBe(mine.length);
      }
    });

    it(`${key}: and every one has footing: it lands on its own spot and stays in the band`, () => {
      const { window: w } = loadMonolith();
      start(w, key, count);
      const before = info(w);
      w.eval('for (var i=0;i<90;i++) step();');
      const g = info(w);
      g.fighters.forEach((f, i) => {
        const spot = before.spots[f.team][spotOf(before, before.fighters[i])];
        expect(spot, `fighter ${i} (team ${f.team}) was formed on a spot`).toBeTruthy();
        expect(f.onground, `fighter ${i} (team ${f.team}) is standing, not falling past its spot`).toBe(true);
        expect(f.y + f.r, 'its feet are on the top of its own spot').toBeCloseTo(spot.y, 0);
        expect(Math.abs(f.x - spot.x), 'and it has not slid off it').toBeLessThan(10);
        expect(f.own, 'still inside its band').toBe(true);
      });
    });
  }
});

describe('respawns go back into the band', () => {
  it('a fighter knocked out on the far side of the map forms up again in its OWN band, on a spot', () => {
    const { window: w } = loadMonolith();
    start(w, '5v5', 10);
    const out = JSON.parse(w.eval(`(function(){
      var rows = [];
      fighters.forEach(function(f){
        f.stocks = 3; f.x = (f.team === 0 ? WW*0.85 : WW*0.15); f.y = WH + 300;   // past the blast line, on the enemy's side
        eliminate(f);
        var on = bases[f.team].spawns.some(function(s){ return Math.abs(s.x - f.x) < 0.01 && Math.abs(s.y - 40 - f.y) < 0.01; });
        rows.push({ team: f.team, dead: f.dead, stocks: f.stocks, own: inOwnTeamZone(f), onSpot: on, invuln: f.invuln,
                    side: f.team === 0 ? f.x < WW*0.25 : f.x > WW*0.75 });
      });
      return JSON.stringify(rows);
    })()`));
    expect(out.length).toBe(10);
    for (const o of out) {
      expect(o.dead).toBe(false);
      expect(o.stocks, 'one stock gone').toBe(2);
      expect(o.own, 'back in its own zone').toBe(true);
      expect(o.side, 'on its own side wall').toBe(true);
      expect(o.onSpot, 'on one of the spots').toBe(true);
      expect(o.invuln, 'with its spawn protection').toBeGreaterThan(0);
    }
  });

  it('a real knockout past the side blast line comes back up the wall too, and lands standing', () => {
    const { window: w } = loadMonolith();
    start(w, '1v1', 2);
    const r = JSON.parse(w.eval(`(function(){
      var rows = [];
      [0, 1].forEach(function(i){
        var f = fighters[i]; f.x = (i === 0 ? -200 : WW + 200); f.y = WH*0.4; f.vx = 0; f.vy = 0;
        step();                                           // the blast line takes him
        var fell = f.stocks === 2;
        for (var k=0;k<80;k++) step();
        rows.push({ fell: fell, own: inOwnTeamZone(f), standing: f.onground, side: i === 0 ? f.x < WW*0.25 : f.x > WW*0.75 });
      });
      return JSON.stringify(rows);
    })()`));
    for (const o of r) expect(o).toEqual({ fell: true, own: true, standing: true, side: true });
  });

  it('ten teammates knocked out on the same frame form up on ten different spots', () => {
    for (const seed of [0xC0FFEE, 0xBEEF, 0x1234, 0xFACE]) {
      const { window: w } = loadMonolith(seed);
      start(w, '10v10', 20);
      const sets = JSON.parse(w.eval(`(function(){
        var keys = [[], []];
        fighters.forEach(function(f){ f.stocks = 3; f.x = WW*0.5; f.y = WH + 300; });
        fighters.forEach(function(f){ eliminate(f); keys[f.team].push(Math.round(f.x) + ':' + Math.round(f.y)); });
        return JSON.stringify(keys);
      })()`));
      expect(new Set(sets[0]).size, `seed ${seed}: team 0, ten fighters, ten places`).toBe(10);
      expect(new Set(sets[1]).size, `seed ${seed}: team 1, ten fighters, ten places`).toBe(10);
    }
  });

  it('with nine teammates standing on nine spots, the tenth lands on the empty one, whichever it is', () => {
    const { window: w } = loadMonolith();
    start(w, '10v10', 20);
    const bad = JSON.parse(w.eval(`(function(){
      var mates = fighters.filter(function(f){ return f.team === 0; }), spots = bases[0].spawns, bad = [];
      for (var free = 0; free < spots.length; free++){
        var me = mates[0], others = mates.slice(1), k = 0;
        for (var i = 0; i < spots.length; i++){
          if (i === free) continue;
          var m = others[k++]; m.dead = false; m.x = spots[i].x; m.y = spots[i].y - 24;
        }
        me.stocks = 3; me.x = WW*0.5; me.y = WH + 300;
        eliminate(me);
        if (Math.abs(me.x - spots[free].x) > 0.01 || Math.abs(me.y + 40 - spots[free].y) > 0.01) bad.push(free);
      }
      return JSON.stringify(bad);
    })()`));
    expect(bad, 'a spot already taken was chosen').toEqual([]);
  });
});

describe('zone protection still works in the band', () => {
  // A fighter of `team` put at `where` (a page expression for {x, y}), hit by a foe standing out in the open, outside
  // every zone, so the only thing that can stop the hit is the zone the victim is in.
  const hitAt = (w, team, where) => JSON.parse(w.eval(`(function(){
    var t = fighters.filter(function(f){ return f.team === ${team}; })[0];
    var foe = fighters.filter(function(f){ return f.team !== ${team}; })[0];
    var at = ${where};
    t.x = at.x; t.y = at.y; t.vx = 0; t.vy = 0; t.pct = 0; t.invuln = 0; t.hitstun = 0;
    foe.x = WW*0.5; foe.y = WH*0.3; foe.invuln = 0;
    applyHit(t, 40, 12, -9, foe);
    return JSON.stringify([t.pct, t.vx, t.vy, inOwnTeamZone(t)]);
  })()`));
  const zoneAt = (team, fx, y) => `(function(){ var z = teamZoneOf(${team}); return { x: ${fx}, y: ${y} }; })()`;

  it('your own band: no damage and no knockback, at the top, the middle and the floor, on either wall', () => {
    const { window: w } = loadMonolith();
    start(w, '5v5', 10);
    for (const team of [0, 1]) {
      for (const [label, y] of [['top', '60'], ['middle', 'WH*0.5'], ['floor', 'floors[0].y - 24']]) {
        for (const fx of ['z.x + 5', 'z.x + z.w/2', 'z.x + z.w - 2']) {
          const [pct, vx, vy, own] = hitAt(w, team, zoneAt(team, fx, y));
          expect(own, `team ${team} ${label} ${fx} is inside`).toBe(true);
          expect([pct, vx, vy], `team ${team} ${label} ${fx}: hit, and nothing happened`).toEqual([0, 0, 0]);
        }
      }
    }
  });

  it('but a step outside the band, the same hit lands', () => {
    // Guards the test above from passing because damage is broken everywhere.
    const { window: w } = loadMonolith();
    start(w, '5v5', 10);
    for (const team of [0, 1]) {
      const [pct, , , own] = hitAt(w, team, zoneAt(team, team === 0 ? 'z.x + z.w + 3' : 'z.x - 3', 'floors[0].y - 24'));
      expect(own, `team ${team}: just outside`).toBe(false);
      expect(pct, `team ${team}: damage lands outside its band`).toBeGreaterThan(0);
    }
  });

  it('an ENEMY band protects nobody: you are hit standing in it', () => {
    const { window: w } = loadMonolith();
    start(w, '5v5', 10);
    const [pct] = hitAt(w, 0, zoneAt(1, 'z.x + z.w/2', 'WH*0.5'));
    expect(pct, 'a team-0 fighter standing in team 1\'s band takes the hit').toBeGreaterThan(0);
    const [pct1] = hitAt(w, 1, zoneAt(0, 'z.x + z.w/2', 'WH*0.5'));
    expect(pct1).toBeGreaterThan(0);
  });

  it('and you still cannot attack out of your own band: the swing does not even start', () => {
    const { window: w } = loadMonolith();
    start(w, '5v5', 10);
    const r = JSON.parse(w.eval(`(function(){
      var f = fighters[0], z = teamZoneOf(f.team), row = {};
      f.atkCd = 0; f._atkAnim = 0; projectiles.length = 0;
      f.x = z.x + z.w/2; f.y = WH*0.5;
      doAttack(f); doSpecial(f); doSmash(f, 40);
      row.inside = [f._atkAnim, projectiles.length];
      f.atkCd = 0; f.spCd = 0; f._atkAnim = 0; projectiles.length = 0;
      f.x = z.x + z.w + 300; f.y = floors[0].y - 24;
      doAttack(f);
      row.outside = f._atkAnim;
      return JSON.stringify(row);
    })()`));
    expect(r.inside, 'no swing and no shot from inside').toEqual([0, 0]);
    expect(r.outside, 'attacks work outside it').toBeGreaterThan(0);
  });
});

describe('a full 2TDM match still ends', () => {
  // The zone must not make a match unwinnable by letting a losing team hide forever: you cannot attack from inside it, so
  // holding the band cannot win. The four are named (the lineup test/team-zone.test.js plays), not drawn.
  it('a 2v2 plays to the last stock', () => {
    const { window: w } = loadMonolith();
    w.eval(`
      SETTINGS.mode='teams'; SETTINGS.teamKey='2v2'; SETTINGS.count=4;
      SETTINGS.stocks=1; SETTINGS.itemRate=0;
      window.__netRoster = ['Firey', 'Salt', 'Gelatin', 'Match'];
      beginMatchNow(); window.__netRoster = null;
      fighters.forEach(function(f){ f.controller='ai'; f.you=false; });
      for (var i=0;i<20000 && running;i++) step();
    `);
    expect(w.eval('running'), 'the match ended').toBe(false);
    const teamsLeft = w.eval('Array.from(new Set(fighters.filter(function(f){ return !f.dead; }).map(function(f){ return f.team; }))).length');
    expect(teamsLeft, 'no more than one team left standing').toBeLessThanOrEqual(1);
  }, 180000);

  it('and so does a 2v2 on the smallest world', () => {
    // (Not a 1v1 of Firey against Match: on Compact that one walks into the cross's central shaft and stands there with one
    // above the other for good, 20,000 frames and no hit. It is the AI stall test/team-zone.test.js already flags, two
    // fighters a ladder rung apart under the AI's 110px drop threshold. Nobody is in a zone when it happens, and whether two
    // fighters meet in the shaft depends on every platform on the way there: six other 1v1 lineups end in under 3,000 frames.)
    const { window: w } = loadMonolith();
    w.eval(`
      SETTINGS.mode='teams'; SETTINGS.teamKey='2v2'; SETTINGS.count=4; SETTINGS.mapSize='compact';
      SETTINGS.stocks=1; SETTINGS.itemRate=0;
      window.__netRoster = ['Firey', 'Salt', 'Gelatin', 'Match'];
      beginMatchNow(); window.__netRoster = null;
      fighters.forEach(function(f){ f.controller='ai'; f.you=false; });
      for (var i=0;i<20000 && running;i++) step();
    `);
    expect(w.eval('running'), 'the match ended').toBe(false);
  }, 180000);
});

describe('three and four teams keep the corner zones they had', () => {
  // The numbers are what the corner layout built before two teams got their walls, recorded from that build at this
  // harness's screen size (1024 x 768), Normal map.
  const corner = (w, key, count) => JSON.parse(w.eval(`(function(){
    SETTINGS.mode='teams'; SETTINGS.teamKey='${key}'; SETTINGS.count=${count}; SETTINGS.mapSize='normal'; SETTINGS.itemRate=0;
    beginMatchNow();
    var r = function(v){ return Math.round(v); };
    return JSON.stringify({
      zones: bases.map(function(b){ return [b.team, r(b.zone.x), r(b.zone.y), r(b.zone.w), r(b.zone.h)]; }),
      pads: bases.map(function(b){ return b.spawns.map(function(s){ return [r(s.x), r(s.y)]; }); }),
      bluffs: worldPlats.filter(function(p){ return p.solid && !p.wall && p.floor === 0 && p.h === 96; })
                        .map(function(p){ return [r(p.x), r(p.y), r(p.w), r(p.h)]; }),
      walls: bases.filter(function(b){ return b.wall; }).length
    });
  })()`));

  it('three teams: a pocket per team round six pads, two on the bottom corners and one on top', () => {
    const { window: w } = loadMonolith();
    const c = corner(w, '2v2v2', 6);
    expect(c.zones).toEqual([[0, 164, 2253, 1322, 348], [1, 3982, 2253, 1322, 348], [2, 164, 971, 1322, 348]]);
    expect(c.pads.map((p) => p.length)).toEqual([6, 6, 6]);
    expect(c.pads[0]).toEqual([[409, 2495], [788, 2495], [1167, 2495], [598, 2363], [977, 2363], [1356, 2363]]);
    expect(c.bluffs).toEqual([[194, 2531, 300, 96], [4974, 2531, 300, 96], [194, 1249, 300, 96]]);
    expect(c.walls, 'no side-wall band with three teams').toBe(0);
  });

  it('four teams: one pocket per corner, five pads each', () => {
    const { window: w } = loadMonolith();
    const c = corner(w, '2v2v2v2', 8);
    expect(c.zones).toEqual([[0, 166, 971, 1144, 348], [1, 4028, 971, 1336, 348], [2, 166, 2253, 1144, 348], [3, 4028, 2253, 1336, 348]]);
    expect(c.pads.map((p) => p.length)).toEqual([5, 5, 5, 5]);
    expect(c.pads[0]).toEqual([[412, 1213], [796, 1213], [1180, 1213], [604, 1081], [988, 1081]]);
    expect(c.bluffs).toEqual([[196, 1249, 300, 96], [5034, 1249, 300, 96], [196, 2531, 300, 96], [5034, 2531, 300, 96]]);
    expect(c.walls, 'no side-wall band with four teams').toBe(0);
  });

  it('they are still pockets round the pads, nowhere near a full-height wall', () => {
    for (const [key, count] of [['2v2v2', 6], ['2v2v2v2', 8]]) {
      const { window: w } = loadMonolith();
      const g = (start(w, key, count), info(w));
      for (const z of g.zones) {
        expect(z.y, `${key}: not up to the ceiling`).toBeGreaterThan(0);
        expect(z.h, `${key}: a pocket`).toBeLessThan(g.WH * 0.5);
        expect(z.x, `${key}: not out to the world edge`).toBeGreaterThan(100);
      }
    }
  });

  it('and FFA has no zones at all', () => {
    const { window: w } = loadMonolith();
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=4; beginMatchNow();`);
    expect(w.eval('teamZoneOf(0)')).toBe(null);
    expect(w.eval('bases.length')).toBe(0);
  });
});

describe('what the walls must not touch', () => {
  it('a net client draws the very band the host plays in', () => {
    // The world geometry crosses the wire without the zone and the client fell back to a column round the home ledge: it
    // would have drawn a band nowhere near the one the host enforces.
    const { window: w } = loadMonolith();
    start(w, '5v5', 10);
    const [host, client] = JSON.parse(w.eval(`(function(){
      var rect = function(){ return bases.map(function(b){ var z = teamZoneOf(b.team); return [z.x, z.y, z.w, z.h].map(Math.round); }); };
      var host = rect();
      var geo = JSON.parse(JSON.stringify(worldGeo()));                          // what goes over the wire
      var saved = bases;
      bases = geo.bases.map(function(b){ return Object.assign({}, b); });         // what applySnapshot does with it
      var client = rect();
      bases = saved;
      return JSON.stringify([host, client]);
    })()`));
    expect(client).toEqual(host);
    expect(host[0][3], 'and it is the tall one').toBeGreaterThan(2000);
  });

  it("One's arena (and Steve Cobs's) is still cut from the corner layout, not given walls", () => {
    // Her map is "the teams map without its walls". It is built by running the 2v2 teams builder, so the side bands would
    // have leaked into her fight and changed it. Hash of the whole arena as built before 2TDM got its walls, recorded from
    // that build with the default 1100 x 720 screen: if this fails after a change you MEANT to make to her arena, re-record it.
    const hashOf = (flag) => {
      const { window: w } = loadMonolith();
      return JSON.parse(w.eval(`(function(){
        SETTINGS.mode='boss'; SETTINGS.count=1; SETTINGS.mapSize='normal'; ${flag}.active = true;
        setupWorld();
        var h = 2166136261, str = JSON.stringify(worldPlats) + JSON.stringify(bases) + JSON.stringify(floors) + WW + ':' + WH;
        for (var i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
        return JSON.stringify({ h: h, n: worldPlats.length, bases: bases.length, flag: TEAMS_QUADS_ONLY });
      })()`));
    };
    for (const flag of ['ONEFIGHT', 'COBSFIGHT']) {
      expect(hashOf(flag), flag).toEqual({ h: 2007264286, n: 139, bases: 0, flag: false });
    }
  });
});
