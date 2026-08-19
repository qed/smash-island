import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// THE LEVEL EDITOR — map size, panning, decorations, and the save format.
//
// Four things a builder was promised and did not get, pinned here so they cannot quietly go away:
//
//   1. MAP SIZE IS REAL      — a level built at Huge is PLAYED at Huge. setupWorld's CUSTOM_LEVEL
//                              branch used to pin WW=W, WH=H, which made the size control a
//                              decoration on every custom map, generated or hand-drawn.
//   2. OLD SAVES STILL LOAD  — the format is v2 and versioned by DEFAULTS: no `size` means
//                              'normal', no `deco` means none, and 'normal' is a one-screen world
//                              box, so a pre-v2 level rebuilds exactly as it always did.
//   3. SCREEN → WORLD        — every edit maps through the pan/zoom viewport, at every size, and a
//                              press is told from a pan by a movement threshold.
//   4. DECORATIONS DON'T HIT — scenery is drawn in play and never enters worldPlats, so dressing a
//                              stage cannot change how it plays.
//
// Everything is measured against the REAL setupWorld() output, never against normalized arithmetic
// agreeing with itself.

const SIZES = ['compact', 'normal', 'tall', 'huge'];
const MAX_CLIMB_GAP = 180;   // a double jump gains ~160-180 world px

// Arm a level exactly the way "▶ Play" and "🧪 Test the Feel" do, and build the match world.
function play(w, levelExpr) {
  return JSON.parse(w.eval(`(function(){
    queueCustomLevel(${levelExpr});
    SETTINGS.mode='ffa'; SETTINGS.count=5;
    resize(); setupWorld(); buildFighters();
    return JSON.stringify({
      W:W, H:H, WW:WW, WH:WH, scrolls:scrolls(), mapSize:SETTINGS.mapSize,
      plats:worldPlats.length, zones:worldZones.length,
      deco:(CUSTOM_LEVEL.deco||[]).length, size:CUSTOM_LEVEL.size,
      ground:groundY(),
      rects:worldPlats.map(function(p){ return {x:p.x,y:p.y,w:p.w,h:p.h,solid:!!p.solid}; }),
      spawnX:fighters.map(function(f){ return Math.round(f.x); }),
      spawnY:fighters.map(function(f){ return Math.round(f.y); })
    });
  })()`));
}

describe('map size applies to custom levels — generated and hand-built alike', () => {
  it('builds the world box the level was built at, not one screen', () => {
    const { window: w } = loadMonolith();
    const seen = {};
    for (const size of SIZES) {
      seen[size] = play(w, `generateMap({type:'arena', size:'${size}', density:'normal', effects:'none', seed:99})`);
      expect(seen[size].size, `${size}: the level carries its own size`).toBe(size);
      expect(seen[size].mapSize, `${size}: the match setting agrees with the level`).toBe(size);
    }
    // Compact and Normal stay exactly one screen — the box every pre-v2 level was drawn against.
    expect(seen.compact.WW).toBe(seen.compact.W);
    expect(seen.compact.WH).toBe(seen.compact.H);
    expect(seen.normal.WW).toBe(seen.normal.W);
    expect(seen.normal.WH).toBe(seen.normal.H);
    // Tall adds height. Huge adds both, and the camera has to scroll to see it.
    expect(seen.tall.WH, 'Tall is taller than the screen').toBeGreaterThan(seen.tall.H * 1.3);
    expect(seen.tall.WW, 'Tall does not widen').toBe(seen.tall.W);
    expect(seen.huge.WW, 'Huge is wider than the screen').toBeGreaterThan(seen.huge.W * 1.3);
    expect(seen.huge.WH, 'Huge is taller than the screen').toBeGreaterThan(seen.huge.H * 1.4);
    expect(seen.huge.scrolls, 'a Huge custom arena scrolls').toBe(true);
    expect(seen.normal.scrolls, 'a Normal custom arena still fits one screen').toBe(false);
  });

  it('a HAND-BUILT level honours the size too — not just a generated one', () => {
    const { window: w } = loadMonolith();
    // Two ledges and a spawn, drawn by hand: the same normalized shape at both sizes.
    const hand = (size) => `{v:2, name:'Hand', size:'${size}', hazard:'',
      plats:[{nx:0.2, ny:0.5, nw:0.3, hop:true, rot:0}, {nx:0.6, ny:0.35, nw:0.2, hop:false, rot:0}],
      spawns:[{nx:0.25, ny:0.4}], zones:[], deco:[]}`;
    const normal = play(w, hand('normal'));
    const huge = play(w, hand('huge'));
    expect(huge.WW, 'the hand-drawn Huge world is wider').toBeGreaterThan(normal.WW * 1.3);
    expect(huge.WH, 'the hand-drawn Huge world is taller').toBeGreaterThan(normal.WH * 1.4);
    // The layout keeps its proportions: a ledge at 20% of the map is at 20% of a bigger map.
    expect(huge.rects[0].x / huge.WW).toBeCloseTo(normal.rects[0].x / normal.WW, 6);
    expect(huge.rects[0].w / huge.WW).toBeCloseTo(normal.rects[0].w / normal.WW, 6);
    // …but a ledge stays as THICK as it was, because a fighter is the same size on a big map.
    expect(huge.rects[0].h, 'ledge thickness is absolute px, not scaled').toBe(normal.rects[0].h);
  });

  it('spawns land inside the world box, not in its left-hand screen', () => {
    const { window: w } = loadMonolith();
    // A spawn on the right of the map: read against the screen it would land mid-arena, and the
    // rightmost fighters would all start in the same place.
    const lvl = `{v:2, name:'Edges', size:'huge', hazard:'',
      plats:[{nx:0.05, ny:0.7, nw:0.9, hop:false, rot:0}],
      spawns:[{nx:0.1, ny:0.6},{nx:0.9, ny:0.6}], zones:[], deco:[]}`;
    const world = play(w, lvl);
    const right = Math.max(...world.spawnX);
    expect(right, 'the far-right spawn is out beyond one screen').toBeGreaterThan(world.W);
    expect(right, 'and still inside the world').toBeLessThanOrEqual(world.WW);
  });

  it('the size check would catch the old one-screen branch (mutation check)', () => {
    // The assertions above are only worth having if they REJECT the implementation that shipped:
    // `WW=W; WH=H` regardless of the level's size. Rebuild a Huge level that way and confirm the
    // very same measurement fails.
    const { window: w } = loadMonolith();
    const old = JSON.parse(w.eval(`(function(){
      queueCustomLevel(generateMap({type:'arena', size:'huge', density:'normal', effects:'none', seed:99}));
      SETTINGS.mode='ffa'; SETTINGS.count=5; resize();
      WW=W; WH=H;                                  // <- the pre-fix CUSTOM_LEVEL branch, verbatim
      return JSON.stringify({W:W, H:H, WW:WW, WH:WH, scrolls:scrolls()});
    })()`));
    expect(old.WW, 'the old branch collapses a Huge map onto one screen').toBe(old.W);
    expect(old.scrolls, 'and it never scrolls').toBe(false);
    // The live code, same level, must disagree:
    const now = play(w, `generateMap({type:'arena', size:'huge', density:'normal', effects:'none', seed:99})`);
    expect(now.WW).toBeGreaterThan(now.W);
    expect(now.scrolls).toBe(true);
  });

  it('every size stays climbable once it is built into world pixels', () => {
    const { window: w } = loadMonolith();
    const offenders = [];
    for (const size of SIZES) {
      for (const type of ['arena', 'towers', 'islands', 'staircase', 'cavern', 'gauntlet']) {
        const world = play(w, `generateMap({type:'${type}', size:'${size}', density:'normal', effects:'none', seed:2024})`);
        const ys = world.rects.map(r => r.y).concat([world.ground]).sort((a, b) => a - b);
        for (let i = 0; i < ys.length - 1; i++) {
          if (ys[i + 1] - ys[i] > MAX_CLIMB_GAP) {
            offenders.push(`${type}/${size}: ${Math.round(ys[i + 1] - ys[i])}px gap`);
          }
        }
      }
    }
    expect(offenders, 'a bigger world must mean more rungs, not longer jumps').toEqual([]);
  });
});

describe('the save format is versioned, and old levels still load', () => {
  it('reads a PRE-v2 save — no version, no size, no deco — as the level it always was', () => {
    const { window: w } = loadMonolith();
    // Exactly what the editor wrote before any of this existed.
    const legacy = `{name:'Old Map', hazard:'lava',
      plats:[{nx:0.1, ny:0.6, nw:0.4, hop:true},{nx:0.55, ny:0.45, nw:0.2, nh:0.06, solid:true}],
      spawns:[{nx:0.2, ny:0.5}], zones:[{nx:0.1, ny:0.55, nw:0.4, nh:0.05, type:'ice', strength:1.2}]}`;
    const adopted = JSON.parse(w.eval(`(function(){
      openEditor();
      edAdoptLevel(${legacy});
      return JSON.stringify({size:ED.size, deco:ED.deco.length, plats:ED.plats.length,
                             zones:ED.zones.length, hazard:ED.hazard});
    })()`));
    expect(adopted.size, 'a level with no size is read as Normal').toBe('normal');
    expect(adopted.deco, 'a level with no decorations gets none, not a crash').toBe(0);
    expect(adopted.plats).toBe(2);
    expect(adopted.zones).toBe(1);
    expect(adopted.hazard).toBe('lava');

    // And it BUILDS the way it always did: one screen, same rectangles.
    const world = play(w, legacy);
    expect(world.WW).toBe(world.W);
    expect(world.WH).toBe(world.H);
    expect(world.plats).toBe(2);
    expect(world.rects[0]).toEqual({ x: 0.1 * world.W, y: 0.6 * world.H, w: 0.4 * world.W, h: 12, solid: false });
    expect(world.zones).toBe(1);
  });

  it('round-trips a dressed, resized level through real editor storage', async () => {
    const { window: w } = loadMonolith();
    const saved = w.eval(`(async function(){
      openEditor();
      edSetSize('huge');
      genQuickMap(31337);
      ED.deco.push(edMakeDeco('tree', 0.30, 0.82));
      ED.deco.push(edMakeDeco('banner', 0.70, 0.82));
      ED.deco.push(edMakeDeco('cloud', 0.50, 0.10));
      document.getElementById('edName').value = 'Round Trip';
      const before = JSON.stringify(edCurrentLevel());
      await edSave();
      // Wipe the editor the way navigating away and coming back does…
      edClear(); edSetSize('compact');
      await edLoad('Round Trip');
      const after = JSON.stringify(edCurrentLevel());
      return JSON.stringify({ before:before, after:after, raw: await BStore.get('levels:custom') });
    })()`);
    const r = JSON.parse(await saved);
    // Deep equality, not string equality: edAdoptLevel normalises key ORDER (it defaults `rot`
    // ahead of the spread), and a reshuffled key is not a lost one.
    expect(JSON.parse(r.after), 'what came back is what went in').toEqual(JSON.parse(r.before));
    const stored = JSON.parse(r.raw)['Round Trip'];
    expect(stored.v, 'the save is stamped v2').toBe(2);
    expect(stored.size, 'the map size persists').toBe('huge');
    const parsed = JSON.parse(r.before);
    expect(parsed.size).toBe('huge');
    // The generated map arrives dressed; the three hand-placed props are the ones on the end.
    expect(stored.deco.length, 'every decoration persists').toBe(parsed.deco.length);
    expect(stored.deco.slice(-3).map(d => d.k)).toEqual(['tree', 'banner', 'cloud']);
    expect(stored.deco.slice(-3).map(d => d.nx)).toEqual([0.3, 0.7, 0.5]);
  });
});

describe('decorations are scenery and nothing else', () => {
  it('renders in play and never enters the collision world', () => {
    const { window: w } = loadMonolith();
    const bare = `{v:2, name:'Bare', size:'normal', hazard:'',
      plats:[{nx:0.2, ny:0.6, nw:0.4, hop:true, rot:0}], spawns:[{nx:0.3, ny:0.5}], zones:[], deco:[]}`;
    const dressed = `{v:2, name:'Dressed', size:'normal', hazard:'',
      plats:[{nx:0.2, ny:0.6, nw:0.4, hop:true, rot:0}], spawns:[{nx:0.3, ny:0.5}], zones:[],
      deco:[{k:'tree',nx:0.25,ny:0.82,s:1},{k:'rock',nx:0.5,ny:0.82,s:1},{k:'cameo',nx:0.8,ny:0.82,s:1,n:'Coiny'}]}`;
    const a = play(w, bare), b = play(w, dressed);
    expect(b.deco, 'the decorations came along').toBe(3);
    expect(b.plats, 'and changed nothing about the geometry').toBe(a.plats);
    expect(b.rects).toEqual(a.rects);

    // draw() paints them — through the very painter the editor canvas calls.
    const painted = w.eval(`(function(){
      var calls = 0, g = { save(){}, restore(){}, translate(){}, scale(){}, rect(){}, arc(){},
        ellipse(){}, moveTo(){}, lineTo(){}, quadraticCurveTo(){}, closePath(){}, beginPath(){},
        fill(){ calls++; }, stroke(){ calls++; }, fillRect(){ calls++; }, drawImage(){ calls++; } };
      paintDecoList(g, CUSTOM_LEVEL.deco, WW, WH, 0);
      return calls;
    })()`);
    expect(painted, 'every prop draws something').toBeGreaterThan(6);
  });

  it('a generated level arrives already dressed, with its props on the ground and its clouds up high', () => {
    const { window: w } = loadMonolith();
    const lvl = JSON.parse(w.eval(`JSON.stringify(generateMap({type:'islands', size:'huge', density:'normal', effects:'light', seed:7}))`));
    expect(lvl.deco.length, 'a generated map comes furnished').toBeGreaterThan(5);
    for (const d of lvl.deco) {
      expect(d.nx, `${d.k} is inside the map`).toBeGreaterThan(0);
      expect(d.nx).toBeLessThan(1);
      if (d.k === 'cloud') expect(d.ny, 'clouds sit in the sky').toBeLessThan(0.2);
      else expect(d.ny, `${d.k} stands on the ground line`).toBeCloseTo(0.82, 3);
    }
  });

  it('an unknown prop kind is dropped on load rather than throwing at paint time', () => {
    const { window: w } = loadMonolith();
    const kept = w.eval(`(function(){
      openEditor();
      edAdoptLevel({name:'X', plats:[], spawns:[], zones:[],
                    deco:[{k:'tree',nx:0.5,ny:0.8},{k:'spaceship',nx:0.2,ny:0.8},null]});
      return ED.deco.length;
    })()`);
    expect(kept, 'only kinds the palette knows survive').toBe(1);
  });
});

describe('the editor canvas is a viewport you can pan', () => {
  it('maps screen pixels to world pixels correctly under pan and zoom, at every size', () => {
    const { window: w } = loadMonolith();
    for (const size of SIZES) {
      const r = JSON.parse(w.eval(`(function(){
        openEditor(); edSetSize('${size}'); edZoomOne();
        ED.view.x = 0; ED.view.y = 0;
        var origin = edToWorld(edOx(), edOy());
        edPan(-50, -30);                              // drag the map 50px left, 30px up
        var panned = edToWorld(edOx(), edOy());
        return JSON.stringify({ w:ED.w, h:ED.h, zoom:ED.zoom, origin:origin, panned:panned,
                                viewX:ED.view.x, viewY:ED.view.y, cw:ED.cw, ch:ED.ch });
      })()`));
      // The canvas corner is the view origin, whatever the zoom.
      expect(r.origin.x, `${size}: unpanned origin`).toBeCloseTo(0, 6);
      expect(r.origin.y, `${size}: unpanned origin`).toBeCloseTo(0, 6);
      // After panning, the same canvas pixel names a different world point — by exactly the drag
      // distance converted through the zoom.
      expect(r.panned.x, `${size}: x follows the drag`).toBeCloseTo(r.viewX, 6);
      expect(r.panned.y, `${size}: y follows the drag`).toBeCloseTo(r.viewY, 6);
      const scrollable = r.w > r.cw / r.zoom + 1;
      expect(r.viewX > 0, `${size}: pans only where there is map to pan to`).toBe(scrollable);
    }
  });

  it('clamps the view to the map — you cannot pan off the edge of the world', () => {
    const { window: w } = loadMonolith();
    const r = JSON.parse(w.eval(`(function(){
      openEditor(); edSetSize('huge'); edZoomOne();
      edPan(-99999, -99999);
      var far = {x:ED.view.x, y:ED.view.y};
      edPan(99999, 99999);
      var back = {x:ED.view.x, y:ED.view.y};
      return JSON.stringify({far:far, back:back, w:ED.w, h:ED.h, cw:ED.cw, ch:ED.ch, zoom:ED.zoom});
    })()`));
    expect(r.far.x).toBeCloseTo(r.w - r.cw / r.zoom, 6);
    expect(r.far.y).toBeCloseTo(r.h - r.ch / r.zoom, 6);
    expect(r.back.x).toBe(0);
    expect(r.back.y).toBe(0);
  });

  it('tells a pan from a click with a movement threshold', () => {
    // The same discrimination the roster line makes between a pick and a pull: a press that has
    // not travelled far enough is still a click, so nudging the mouse while selecting must not
    // scroll the map out from under the builder.
    const { window: w } = loadMonolith();
    const drag = (dx) => JSON.parse(w.eval(`(function(){
      openEditor(); edSetSize('huge'); edZoomOne();
      ED.tool='move'; ED.view.x=0; ED.view.y=0;
      var cv=document.getElementById('edcanvas');
      cv.getBoundingClientRect = function(){ return {left:0, top:0, width:ED.cw, height:ED.ch}; };
      cv.onpointerdown({preventDefault(){}, clientX:200, clientY:200, button:0});
      var started = !!(ED.drag && ED.drag.mode==='pan');
      cv.onpointermove({preventDefault(){}, clientX:200+${dx}, clientY:200, button:0});
      var moved = ED.view.x;
      cv.onpointerup({preventDefault(){}, clientX:200+${dx}, clientY:200, button:0});
      return JSON.stringify({started:started, moved:moved, plats:ED.plats.length});
    })()`));
    // Negative dx = pulling the map leftwards, which is the direction with map to reveal when the
    // view starts at the left edge. (Pulling the other way is correctly clamped to nothing.)
    const nudge = drag(-2);
    expect(nudge.started, 'a press on empty space arms a pan').toBe(true);
    expect(nudge.moved, 'but 2px of travel does not move the map').toBe(0);
    expect(nudge.plats, 'and the Move tool never draws anything').toBe(0);
    const pull = drag(-40);
    expect(pull.moved, '40px of travel pans').toBeGreaterThan(0);
    expect(pull.plats, 'a pan is still never a placement').toBe(0);
  });

  it('places what you click where you clicked, even after panning a Huge map', () => {
    const { window: w } = loadMonolith();
    const r = JSON.parse(w.eval(`(function(){
      openEditor(); edClear(); edSetSize('huge'); edZoomOne();
      var cv=document.getElementById('edcanvas');
      cv.getBoundingClientRect = function(){ return {left:0, top:0, width:ED.cw, height:ED.ch}; };
      edPan(-300, -120);                              // scroll well into the map
      ED.tool='spawn';
      cv.onpointerdown({preventDefault(){}, clientX:100, clientY:80, button:0});
      var s = ED.spawns[0];
      var expected = edToWorld(100, 80);
      return JSON.stringify({ nx:s.nx, ny:s.ny, ex:expected.x/ED.w, ey:expected.y/ED.h, viewX:ED.view.x });
    })()`));
    expect(r.viewX, 'the map really did scroll').toBeGreaterThan(0);
    expect(r.nx, 'the spawn landed under the cursor in WORLD space').toBeCloseTo(r.ex, 9);
    expect(r.ny).toBeCloseTo(r.ey, 9);
  });
});

describe('🧪 Test the Feel tests the map you are actually looking at', () => {
  it('queues the current level at its own size, with its decorations', () => {
    const { window: w } = loadMonolith();
    const r = JSON.parse(w.eval(`(function(){
      openEditor(); edSetSize('huge'); genQuickMap(4242);
      ED.deco.push(edMakeDeco('torch', 0.4, 0.82));
      document.getElementById('edName').value='Feel Test';
      edTestFeel();
      return JSON.stringify({ name:CUSTOM_LEVEL.name, size:CUSTOM_LEVEL.size,
                              deco:CUSTOM_LEVEL.deco.length, mapSize:SETTINGS.mapSize,
                              pending:PENDING_CUSTOM, plats:CUSTOM_LEVEL.plats.length });
    })()`));
    expect(r.name).toBe('Feel Test');
    expect(r.size, 'the sandbox uses the size the map was built at').toBe('huge');
    expect(r.mapSize).toBe('huge');
    expect(r.deco, 'and its decorations').toBeGreaterThan(0);
    expect(r.pending, 'the map survives a detour through fighter select').toBe(true);

    // …and starting the sandbox actually builds that world.
    const world = JSON.parse(w.eval(`(function(){
      TESTMODE.active=true; TESTMODE.dummies=1;
      resize(); setupWorld(); buildFighters();
      return JSON.stringify({ W:W, WW:WW, H:H, WH:WH, scrolls:scrolls(),
                              deco:(CUSTOM_LEVEL.deco||[]).length,
                              onMap:fighters.every(function(f){ return f.x>=0 && f.x<=WW; }) });
    })()`));
    expect(world.WW, 'the sandbox arena is the Huge one').toBeGreaterThan(world.W * 1.3);
    expect(world.WH).toBeGreaterThan(world.H * 1.4);
    expect(world.scrolls).toBe(true);
    expect(world.deco).toBeGreaterThan(0);
    expect(world.onMap, 'the dummies spawn inside it').toBe(true);
  });
});

describe('the editor paints what the match builds', () => {
  it('draws from the same rectangles setupWorld collides against', () => {
    const { window: w } = loadMonolith();
    const same = JSON.parse(w.eval(`(function(){
      openEditor(); edSetSize('tall'); genQuickMap(808);
      var lvl = edCurrentLevel();
      var edRects = levelPlatRects(ED.plats, ED.w, ED.h).map(function(p){
        return [p.x/ED.w, p.y/ED.h, p.w/ED.w, p.h];
      });
      queueCustomLevel(lvl); resize(); setupWorld();
      var worldRects = worldPlats.map(function(p){ return [p.x/WW, p.y/WH, p.w/WW, p.h]; });
      return JSON.stringify({ed:edRects, world:worldRects});
    })()`));
    expect(same.ed.length).toBeGreaterThan(4);
    expect(same.world, 'the canvas and the arena are the same geometry').toEqual(same.ed);
  });
});
