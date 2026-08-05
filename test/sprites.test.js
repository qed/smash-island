import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';
import { spyMediaConstructors } from './helpers/harness.js';

// Sprite rendering. Three things have to stay true for real character art to be safe to ship:
//
//  1. It is RENDER-ONLY. drawFighter picks the sprite off `f.name`, which serializeState already
//     sends, so a client draws what the host draws with no state-sync change.
//  2. Nothing loads at eval time. The registry may carry PNG paths, but the Image constructor is
//     only reached on the first DRAW — a headless boot must never touch a media constructor while
//     the script parses, or the golden harness starts fetching assets it cannot fetch.
//  3. A fighter without an entry falls back to the generic blob, unchanged.

const BATCH_1 = ['Firey', 'Leafy', 'Bubble', 'Blocky', 'Pen', 'Pencil',
  'Match', 'Ice Cube', 'Puffball', 'Teardrop', 'Bomby', 'Rocky'];

describe('sprite registry', () => {
  it('covers the batch-1 twelve, each with art and a silhouette', () => {
    const { window: w } = loadMonolith();
    for (const name of BATCH_1) {
      const sp = w.eval(`SPRITES[${JSON.stringify(name)}]`);
      expect(sp, `${name} has a sprite`).toBeTruthy();
      expect(typeof sp.draw, `${name}.draw`).toBe('function');
      expect(typeof sp.path, `${name}.path — needed to clip flash/burn/yoyle/star tints`).toBe('function');
    }
  });

  it('leaves every uncovered fighter on the blob fallback', () => {
    const { window: w } = loadMonolith();
    const uncovered = w.eval(`ROSTER.filter(r=>!SPRITES[r.name]).map(r=>r.name)`);
    expect(uncovered.length, 'the rest of the roster still falls back').toBeGreaterThan(0);
    expect(uncovered).not.toContain('Firey');
  });

  it('constructs no Image while the monolith is parsed', () => {
    const spy = spyMediaConstructors();
    let made = 0;
    const Orig = globalThis.Image;
    globalThis.Image = class { constructor() { made++; } };
    try { loadMonolith(); } finally { globalThis.Image = Orig; spy.restore(); }
    expect(made, 'no top-level media constructor').toBe(0);
  });
});

describe('drawing sprite fighters headlessly', () => {
  // Runs the REAL draw() over a roster that is entirely sprite fighters, in every state that
  // changes how a sprite is tinted or deformed. Any throw from the new draw paths surfaces here.
  it('draws all twelve through flash / burn / yoyle / star / invuln / squash without throwing', () => {
    const { window: w } = loadMonolith();
    w.eval(`
      SETTINGS.count = ${BATCH_1.length};
      startMatch();
      const names = ${JSON.stringify(BATCH_1)};
      fighters.length = 0;
      names.forEach((n,i)=>{
        const r = ROSTER.find(x=>x.name===n);
        const f = makeFighter(r, 200+i*70, 300, i);
        fighters.push(f);
      });
    `);
    const states = [
      '',                                                  // resting
      'f.flash=6',                                         // hit flash
      'f.burn=40',                                         // on fire
      'f._yoyleT=200',                                     // yoyleberry metal
      'f._starT=200',                                      // invincibility strobe
      'f.invuln=30',                                       // spawn blink (translucent art)
      'f.face=-1',                                         // mirrored
      'f.vy=-9',                                           // rising stretch
      'f.vy=12',                                           // falling stretch + shear
      'f.vx=5',                                            // running lean
      'f._landSquash=5',                                   // landing squat
      'f._dashing=8; f._dashVY=3',                         // FIGHTER_ANIM pre-body (Leafy blade)
      'f.cloud=200',                                       // Teardrop cloud form
    ];
    for (const mutate of states) {
      expect(() => w.eval(`
        for(const f of fighters){ f.flash=0; f.burn=0; f._yoyleT=0; f._starT=0; f.invuln=0;
          f.face=1; f.vx=0; f.vy=0; f._landSquash=0; f._dashing=0; f.cloud=0; ${mutate}; }
        draw();
      `), `draw() with [${mutate || 'resting'}]`).not.toThrow();
    }
  });

  it('renders sprite and blob fighters side by side in one frame', () => {
    const { window: w } = loadMonolith();
    w.eval(`
      SETTINGS.count = 4; startMatch();
      fighters.length = 0;
      ['Firey','Needle','Ice Cube','Snowball'].forEach((n,i)=>{
        fighters.push(makeFighter(ROSTER.find(x=>x.name===n), 200+i*80, 300, i));
      });
    `);
    expect(w.eval('fighters.map(f=>!!SPRITES[f.name])')).toEqual([true, false, true, false]);
    expect(() => w.eval('draw()')).not.toThrow();
  });

  it('draws sprites in teams mode with the ring, you-marker and smash arc intact', () => {
    const { window: w } = loadMonolith();
    w.eval(`
      SETTINGS.mode='teams'; SETTINGS.count = 4; startMatch();
      fighters.length = 0;
      ['Bubble','Bomby','Puffball','Rocky'].forEach((n,i)=>{
        const f = makeFighter(ROSTER.find(x=>x.name===n), 200+i*80, 300, i);
        f.team = i%2; f.you = i===0; f.smashHold = 20;
        fighters.push(f);
      });
    `);
    expect(() => w.eval('draw()')).not.toThrow();
  });
});
