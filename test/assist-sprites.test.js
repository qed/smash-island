import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { loadMonolith } from './helpers/load-monolith.js';
import { spyMediaConstructors } from './helpers/harness.js';
import { mulberry32 } from './helpers/prng.js';

// "sprites for assist trophies." Every assist in ASSIST_ROSTER is a BFDI character; twelve have a render on the BFDI wiki,
// fetched, checked and credited like the fighters' and the bosses'. Selfie Stick has none -- there is no such character
// on the wiki, and no art beats wrong art -- so it keeps the drawn body. Same contract as the boss registry: images are
// constructed on first draw, never at parse, and the drawn body stays underneath until the render has loaded.

const CREDITS = 'artifacts/V1/assets/sprites/CREDITS.md';

describe('assist sprites', () => {
  it('gives every assist but Selfie Stick a render that exists on disk, keyed by the name that crosses the net', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      var rows = {}; ASSIST_ROSTER.forEach(function(a){ rows[a.name] = ASSIST_SPRITE_SRC[a.name] ? ASSIST_SPRITE_SRC[a.name].src : null; });
      return { rows: rows, keys: Object.keys(ASSIST_SPRITE_SRC), names: ASSIST_ROSTER.map(function(a){ return a.name; }) };
    })()`);
    const missing = r.names.filter((n) => !r.rows[n]);
    expect(missing, 'assists without a render').toEqual(['Selfie Stick']);
    for (const k of r.keys) expect(r.names, `${k} is in the roster`).toContain(k);
    const gone = r.keys.filter((k) => !existsSync(`artifacts/V1/${r.rows[k]}`));
    expect(gone, 'renders pointing at files that are not there').toEqual([]);
  });

  it('credits each render with its wiki source, and says why Selfie Stick has none', () => {
    const { window: w } = loadMonolith();
    const srcs = w.eval(`Object.keys(ASSIST_SPRITE_SRC).map(function(k){ return [k, ASSIST_SPRITE_SRC[k].src]; })`);
    const credits = readFileSync(CREDITS, 'utf8');
    const section = credits.slice(credits.indexOf('## Assist trophies'));
    expect(section.length).toBeGreaterThan(100);
    for (const [name, src] of srcs) {
      const file = src.split('/').pop();
      const row = section.split('\n').find((l) => l.includes('`' + file + '`')) || '';
      expect(row, `${name}'s row`).toMatch(/https:\/\/static\.wikia\.nocookie\.net\/battlefordreamisland\/images\/\S+/);
    }
    expect(section).toContain('Selfie Stick has no render');
    expect(section).toContain('Grotatoes');
  });

  it('measures its facing: Spongy and the Shopping Cart are the ones mirrored', () => {
    const { window: w } = loadMonolith();
    const flipped = w.eval(`Object.keys(ASSIST_SPRITE_SRC).filter(function(k){ return !!ASSIST_SPRITE_SRC[k].flip; }).sort()`);
    expect(flipped).toEqual(['Shopping Cart', 'Spongy']);
  });

  it('constructs no Image while the monolith is parsed', () => {
    const spy = spyMediaConstructors();
    let made = 0;
    const Orig = globalThis.Image;
    globalThis.Image = class { constructor() { made++; } };
    try { loadMonolith(); } finally { globalThis.Image = Orig; spy.restore(); }
    expect(made).toBe(0);
  });

  it('draws the render once loaded, mirrored to face the way it goes, and the drawn body with its face until then', () => {
    const rec = [];
    const html = readFileSync('artifacts/V1/index.html', 'utf8');
    const dom = new JSDOM(html, {
      url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
      beforeParse(window) {
        window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
          get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 }) : p === 'canvas' ? { width: 1100, height: 720 }
            : p === 'getImageData' ? () => ({ data: [] }) : p === 'createLinearGradient' || p === 'createRadialGradient' ? () => ({ addColorStop() {} })
            : (...args) => { rec.push({ op: p, args }); }),
          set: () => true,
        });
        window.Math.random = mulberry32(3);
        window.requestAnimationFrame = () => 0;
        window.cancelAnimationFrame = () => {};
      },
    });
    const w = dom.window;
    const draw = (name, face, loaded, extra = '') => { rec.length = 0;
      w.eval(`ASSIST_SPRITE_IMG[${JSON.stringify(name)}] = ${loaded ? '{ complete:true, naturalWidth:270, naturalHeight:200 }' : 'null'};
              drawSummon(Object.assign({ type:'assist', name:${JSON.stringify(name)}, color:'#c85a5a', x:300, y:300, r:26, face:${face}, team:0 }, {${extra}}))`);
      return { images: rec.filter((c) => c.op === 'drawImage').length, mirrored: rec.some((c) => c.op === 'scale' && c.args[0] === -1),
        arcs: rec.filter((c) => c.op === 'arc').length, name: rec.some((c) => c.op === 'fillText' && c.args[0] === name),
        squash: rec.find((c) => c.op === 'scale' && c.args[0] !== -1), bars: rec.filter((c) => c.op === 'fillRect').length }; };
    // the cart's render faces left (flip), so going right it is mirrored and going left it is not
    const cartR = draw('Shopping Cart', 1, true), cartL = draw('Shopping Cart', -1, true);
    expect(cartR.images).toBe(1); expect(cartR.mirrored).toBe(true);
    expect(cartL.images).toBe(1); expect(cartL.mirrored).toBe(false);
    expect(cartR.name, 'a nametag').toBe(true);
    expect(cartR.arcs, 'no drawn ball under the render').toBe(0);
    // Pie's faces right: mirrored only when going left
    expect(draw('Pie', 1, true).mirrored).toBe(false);
    expect(draw('Pie', -1, true).mirrored).toBe(true);
    // not loaded yet: the drawn ball and its two eyes, no image
    const vector = draw('Pie', 1, false);
    expect(vector.images).toBe(0);
    expect(vector.arcs, 'the drawn body and face').toBeGreaterThanOrEqual(5);
    expect(vector.name).toBe(true);
    // Selfie Stick has no row: always the drawn body
    const stick = draw('Selfie Stick', 1, false);
    expect(stick.images).toBe(0); expect(stick.arcs).toBeGreaterThanOrEqual(5);
    // the Beach Ball squashes on a ricochet
    const ball = draw('Beach Ball', 1, true, '_squash:8');
    expect(ball.images).toBe(1);
    expect(ball.squash && ball.squash.args.map((v) => +v.toFixed(2))).toEqual([1.22, 0.78]);
    expect(draw('Beach Ball', 1, true).squash).toBeUndefined();
    // a hostile add: its download silhouette first (no render), then the render under its red tag and bar
    const dl = draw('Pie', 1, true, 'hostile:true, _dl:20, hp:40, maxHp:40, flash:0');
    expect(dl.images).toBe(0);
    const add = draw('Pie', 1, true, 'hostile:true, _dl:0, hp:20, maxHp:40, flash:0');
    expect(add.images).toBe(1); expect(add.bars, 'the HP bar').toBeGreaterThanOrEqual(2);
  });

  it('the squash crosses the net snapshot, so a client draws the bounce too', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 300, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 900, groundY()-24, 1);
      A.team=0; D.team=1; A.controller='still'; D.controller='still'; fighters=[A,D];
      var s = summonAssistNamed(A, ASSIST_ROSTER.find(function(x){ return x.act==='bounce'; }));
      s._squash = 5;
      var snap = serializeState(false); var m = snap.summons[0];
      summons = []; running = false;
      return { name: m.name, squash: m._squash };
    })()`);
    expect(r).toEqual({ name: 'Beach Ball', squash: 5 });
  });
});
