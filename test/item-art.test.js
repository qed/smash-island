import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from './helpers/prng.js';

// THE PICKUPS, IN THE SHOW'S OWN ART.
//
// The owner: "make items look better." Asked how, they chose "Show art + polish": each item uses the show's own art
// where it exists, with a soft glow and a gentle bob, and a clean drawn icon where no art exists. The art is fetched by
// scripts/fetch-item-sprites.mjs (scripts/item-sprite-manifest.json is its record) and drawn by drawItem (ITEM_ART,
// ITEM_ICON in index.html). Pinned here: every kind has art or a drawn icon; the files exist, are transparent and
// credited; drawing every item every frame throws nothing and writes no text ("remove item popups"); and picking one
// up does exactly what it did before -- this was a change to how items LOOK, never to what they do.

const DIR = 'artifacts/V1/assets/sprites/items';
const manifest = JSON.parse(readFileSync('scripts/item-sprite-manifest.json', 'utf8'));
const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
const entries = Object.values(manifest);
const read = (f) => PNG.sync.read(readFileSync(`${DIR}/${f}`));

// A boot whose canvas records every call and every property set, so the real draw path can be read back.
function bootRecording(seed = 11) {
  const html = readFileSync('artifacts/V1/index.html', 'utf8');
  const rec = [];
  const grad = { addColorStop() {} };
  const dom = new JSDOM(html, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
        get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 })
          : p === 'canvas' ? { width: 1100, height: 720 }
          : p === 'getImageData' ? () => ({ data: [] })
          : (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createPattern') ? () => grad
          : (...args) => { rec.push({ op: p, args }); }),
        set: (_t, p, v) => { rec.push({ op: 'set:' + String(p), args: [v] }); return true; },
      });
      window.Math.random = mulberry32(seed);
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
    },
  });
  return { w: dom.window, rec };
}

let W, REC;
beforeAll(async () => { const b = bootRecording(); W = b.w; REC = b.rec; await W.eval('profileReady'); });

describe('the files', () => {
  it('the folder and the manifest agree, file for file, size for size', () => {
    const onDisk = readdirSync(DIR).filter((f) => f.endsWith('.png')).sort();
    expect(onDisk).toEqual(entries.map((e) => e.file).sort());
    expect(readdirSync(DIR).filter((f) => !f.endsWith('.png')), 'only PNGs in items/').toEqual([]);
    for (const e of entries) {
      const png = read(e.file);
      expect([png.width, png.height], e.file).toEqual([e.width, e.height]);
    }
  });

  it('each is pickup-sized: at most 128px on its long side, and not a speck', () => {
    for (const e of entries) {
      const png = read(e.file);
      expect(Math.max(png.width, png.height), `${e.file} is too big`).toBeLessThanOrEqual(128);
      expect(Math.max(png.width, png.height), `${e.file} is a speck`).toBeGreaterThanOrEqual(24);
    }
  });

  it('each is genuinely transparent: clear corners, and at least 12% clear even cropped to its alpha box', () => {
    // An opaque box (a screenshot, a flat crate face) has no clear pixel at all; these were turned down on sight.
    for (const e of entries) {
      const png = read(e.file);
      const a = (x, y) => png.data[(y * png.width + x) * 4 + 3];
      const corners = [a(0, 0), a(png.width - 1, 0), a(0, png.height - 1), a(png.width - 1, png.height - 1)];
      expect(corners.every((v) => v < 16), `${e.file} has an opaque corner: ${corners}`).toBe(true);
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      expect(clear / (png.width * png.height), `${e.file} is not transparent`).toBeGreaterThanOrEqual(0.12);
    }
  });

  it('each came from the show\'s wiki and is credited in CREDITS.md with its exact source', () => {
    expect(credits).toMatch(/## Item art/);
    for (const e of entries) {
      expect(e.source, e.file).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/battlefordreamisland\/images\//);
      expect(credits, `${e.file} is not credited`).toContain(`(${e.file})`);
      expect(credits, `${e.file}'s source URL is not in CREDITS.md`).toContain(e.source);
    }
  });

  it('the fetch script rebuilds every file (each manifest entry is one of its picks)', () => {
    const script = readFileSync('scripts/fetch-item-sprites.mjs', 'utf8');
    for (const e of entries) expect(script, `${e.srcTitle} is not a pick in the fetch script`).toContain(`'${e.srcTitle}'`);
  });
});

describe('every item kind has the show\'s art or a drawn icon', () => {
  it('every kind in ITEM_KINDS has a drawn icon and a glow colour', () => {
    const r = W.eval(`ITEM_KINDS.map(function(k){ var ic = ITEM_ICON[k];
      return { k: k, draw: !!ic && typeof ic.draw === 'function', c: ic && ic.c }; })`);
    for (const x of r) {
      expect(x.draw, `${x.k} has no drawn icon`).toBe(true);
      expect(x.c, `${x.k} has no colour`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('every art entry is an item kind, points at a file that exists, and is the one the manifest records', () => {
    const art = W.eval(`Object.keys(ITEM_ART).map(function(k){ return { k: k, src: ITEM_ART[k].src, h: ITEM_ART[k].h }; })`);
    const kinds = W.eval('ITEM_KINDS.slice()');
    for (const a of art) {
      expect(kinds, a.k).toContain(a.k);
      expect(existsSync(`artifacts/V1/${a.src}`), `${a.src} is missing`).toBe(true);
      expect(manifest[a.k] && `assets/sprites/items/${manifest[a.k].file}`, a.k).toBe(a.src);
      expect(a.h, a.k).toBeGreaterThan(1);
    }
    expect(art.map((a) => a.k).sort()).toEqual(Object.keys(manifest).sort());
  });

  it('the kinds with no art are marmalade (none exists on the wiki) and the boss capsule (a summons) -- drawn', () => {
    expect(W.eval(`ITEM_KINDS.filter(function(k){ return !ITEM_ART[k]; })`).sort()).toEqual(['boss', 'marmalade']);
  });
});

describe('drawing', () => {
  const KINDS = ['heal', 'marmalade', 'throw', 'power', 'assist', 'yoyle', 'boss'];
  // Stage one loose item of every kind, draw them all for two seconds of frames, and return what the canvas saw.
  function drawAll(loaded) {
    REC.length = 0;
    const err = W.eval(`(function(){
      var fake = { complete: true, naturalWidth: 64, naturalHeight: 64 };
      ${loaded ? 'Object.keys(ITEM_ART).forEach(function(k){ ITEM_IMG[k] = fake; });'
               : 'Object.keys(ITEM_ART).forEach(function(k){ ITEM_IMG[k] = null; });'}
      var list = ${JSON.stringify(KINDS)}.map(function(k, i){
        return { kind: k, x: 200 + i*80, y: 500, vx: 0, vy: 0, r: k === 'boss' ? 0 : 16, taken: false, life: 1800, _land: i % 2 === 0 }; });
      try { for (var f = 0; f < 120; f++){ hazardT++; list.forEach(function(it){ drawItem(it); }); } } catch(e){ return e.message; }
      return null;
    })()`);
    return { err, ops: REC.slice() };
  }

  it('the drawn icons: every kind, every frame, throws nothing, writes no text, and leaves the canvas as it found it', () => {
    const { err, ops } = drawAll(false);
    expect(err).toBe(null);
    const count = (op) => ops.filter((o) => o.op === op).length;
    expect(count('fillText') + count('strokeText'), 'an item wrote text').toBe(0);
    expect(count('drawImage'), 'no art has loaded, so none is drawn').toBe(0);
    expect(count('save')).toBe(count('restore'));
    expect(count('save')).toBeGreaterThanOrEqual(KINDS.length * 120);
  });

  it('the art, once loaded: drawn for exactly the kinds that have it, every frame, with no text', () => {
    const { err, ops } = drawAll(true);
    expect(err).toBe(null);
    const withArt = W.eval('Object.keys(ITEM_ART).length');
    const images = ops.filter((o) => o.op === 'drawImage');
    expect(images.length).toBe(withArt * 120);
    // drawn at the pickup's size, centred on it (h = r * ITEM_ART.h; a square fake keeps w = h)
    for (const o of images) { expect(o.args[3]).toBeGreaterThan(24); expect(o.args[3]).toBeLessThan(48); expect(o.args[1]).toBeCloseTo(-o.args[3] / 2); }
    expect(ops.filter((o) => o.op === 'fillText' || o.op === 'strokeText').length).toBe(0);
    W.eval('Object.keys(ITEM_ART).forEach(function(k){ delete ITEM_IMG[k]; })');
  });

  it('a soft glow in the item\'s own colour, and a gentle bob of a few pixels', () => {
    REC.length = 0;
    W.eval(`hazardT = 0; drawItem({ kind: 'yoyle', x: 300, y: 500, r: 16, _land: true });`);
    const fills = REC.filter((o) => o.op === 'set:fillStyle').map((o) => o.args[0]);
    expect(fills).toContain(W.eval('ITEM_ICON.yoyle.c'));
    const ys = [];
    for (let t = 0; t < 160; t += 4) {
      REC.length = 0;
      W.eval(`hazardT = ${t}; drawItem({ kind: 'heal', x: 300, y: 500, r: 16, _land: true });`);
      const tr = REC.filter((o) => o.op === 'translate');
      ys.push(tr[1].args[1]);   // the second translate is the bob (the first puts it at the item)
    }
    const span = Math.max(...ys) - Math.min(...ys);
    expect(span, 'it bobs').toBeGreaterThan(3);
    expect(span, 'gently').toBeLessThanOrEqual(6.01);
  });

  it('the real frame draws every kind of loose item without a throw', () => {
    const drawn = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow();
      items = ${JSON.stringify(KINDS)}.map(function(k, i){ return { kind: k, x: 200 + i*80, y: groundY()-16, vx:0, vy:0, r: k==='boss'?0:16, taken:false, life:1800, _land:true }; });
      var calls = 0, real = drawItem;
      drawItem = function(it, c){ calls++; return real(it, c); };   // count that the frame reaches every item
      try { for (var f = 0; f < 30; f++){ hazardT++; draw(); } } catch(e){ return e.message; } finally { drawItem = real; }
      return calls;
    })()`);
    expect(drawn, 'draw() threw, or did not draw every item every frame').toBe(30 * KINDS.length);
  });

  it('drawItem itself holds no text call at all', () => {
    const src = W.eval('String(drawItem) + Object.keys(ITEM_ICON).map(function(k){ return String(ITEM_ICON[k].draw); }).join("")');
    expect(src).not.toMatch(/fillText|strokeText/);
  });
});

describe('picking one up does exactly what it did before', () => {
  // Stage a fighter at 50% and hand it an item of the kind, with the dice set to `roll`.
  function pick(kind, roll = 0.5) {
    return W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 700, groundY()-24, 1);
      A.team=0; D.team=1; A.controller='still'; D.controller='still'; fighters=[A,D];
      A.pct = 50; A.invuln = 0;
      var rnd = Math.random; Math.random = function(){ return ${roll}; };
      var it = { kind: ${JSON.stringify(kind)}, x: A.x, y: A.y };
      try { pickUpItem(A, it); } finally { Math.random = rnd; }
      return { taken: it.taken, pct: A.pct, holding: A._holding || null, emp: A._empowerT || 0, haste: A._hasteT || 0,
        star: A._starT || 0, invuln: A.invuln, yoyle: A._yoyleT || 0,
        summons: summons.map(function(s){ return { type: s.type, team: s.team, owner: s.owner }; }), idx: A.idx };
    })()`);
  }

  it('heal takes 25%, marmalade 40%', () => {
    expect(pick('heal')).toMatchObject({ taken: true, pct: 25 });
    expect(pick('marmalade')).toMatchObject({ taken: true, pct: 10 });
  });
  it('a throwable is held for the next attack', () => {
    expect(pick('throw').holding).toEqual({ r: 12, dmg: 16, kb: 12 });
  });
  it('a power-up is attack up, speed up or invincible, one of the three by the dice', () => {
    expect(pick('power', 0.1)).toMatchObject({ emp: 360, haste: 0, star: 0 });
    expect(pick('power', 0.5)).toMatchObject({ emp: 0, haste: 360, star: 0 });
    const s = pick('power', 0.9);
    expect(s).toMatchObject({ emp: 0, haste: 0, star: 300 });
    expect(s.invuln).toBeGreaterThanOrEqual(300);
  });
  it('a Yoyleberry turns you to metal for eight seconds', () => {
    expect(pick('yoyle')).toMatchObject({ taken: true, yoyle: 480, pct: 50 });
  });
  it('an assist trophy calls an assist on your side; a boss capsule calls a boss against everyone', () => {
    const a = pick('assist');
    expect(a.summons).toEqual([{ type: 'assist', team: 0, owner: a.idx }]);
    const b = pick('boss');
    expect(b.summons).toEqual([{ type: 'boss', team: -1, owner: b.idx }]);
  });
  it('a loose item still falls, lands and is grabbed by whoever touches it', () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 400, groundY()-24, 0);
      A.controller='still'; fighters=[A]; A.pct = 50;
      items = [{ kind:'heal', x: 900, y: -40, vx:0, vy:0, r:16, taken:false, life:1800, _land:false },
               { kind:'heal', x: A.x, y: A.y, vx:0, vy:0, r:16, taken:false, life:1800, _land:true }];
      var far = items[0];
      for (var i = 0; i < 120; i++) updateItems();
      return { left: items.length, farY: far.y, gy: groundY(), landed: far._land, pct: A.pct };
    })()`);
    expect(r.left, 'the touched one is gone, the far one stays').toBe(1);
    expect(r.pct).toBe(25);
    expect(r.landed).toBe(true);
    expect(r.farY).toBe(r.gy - 16);
  });
});
