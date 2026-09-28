import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { loadMonolith } from './helpers/load-monolith.js';
import { spyMediaConstructors } from './helpers/harness.js';

// Boss renders. Same contract the fighter registry follows, and the same rule about art:
// no art beats WRONG art. "also, give a sprite to purple dragon and announcer." -- the Announcer is the BFDI Speaker
// Box's front view and the Purple Dragon is TPOT's Dragon; the Bug Swarm, not a wiki character, keeps its drawn body.

describe('boss sprites', () => {
  it('points every entry at a file that exists', () => {
    const { window: w } = loadMonolith();
    const srcs = w.eval(`Object.keys(BOSS_SPRITE_SRC).map(function(k){ return [k, BOSS_SPRITE_SRC[k]]; })`);
    expect(srcs.length, 'some bosses have real art').toBeGreaterThan(3);
    const missing = srcs.filter(([, src]) => !existsSync(`artifacts/V1/${src}`));
    expect(missing, 'boss art pointing at files that are not there').toEqual([]);
  });

  it('dresses the Announcer and the Purple Dragon in their wiki renders, credited', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`({ a: BOSS_SPRITE_SRC.announcer, d: BOSS_SPRITE_SRC.dragon, flip: !!BOSS_SPRITE_FLIP.dragon })`);
    expect(r.a).toBe('assets/sprites/announcer.png');
    expect(r.d).toBe('assets/sprites/purple-dragon.png');
    expect(r.flip, 'the Dragon faces left in the render').toBe(true);
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const row = (file) => credits.split('\n').find((l) => l.includes('`' + file + '`')) || '';
    expect(row('announcer.png')).toContain('Announcer_Front_Vibrating0001.png');
    expect(row('purple-dragon.png')).toContain('Polished_Dragon');
  });

  it('gives every boss in the roster a usable sprite key', () => {
    // A key with neither a render nor a procedural case would draw nothing at all.
    const { window: w } = loadMonolith();
    const orphans = w.eval(`
      (function(){
        var drawn = String(drawBossSprite), out = [];
        for (var i=0;i<BOSS_ROSTER.length;i++){
          var k = BOSS_ROSTER[i].sprite;
          var hasArt = !!BOSS_SPRITE_SRC[k];
          var hasCase = drawn.indexOf('case "' + k + '"') >= 0;
          if (!hasArt && !hasCase) out.push(BOSS_ROSTER[i].name + ' (' + k + ')');
        }
        return out;
      })()`);
    expect(orphans, 'bosses that would render as nothing').toEqual([]);
  });

  it('never gives two bosses the same sprite key', () => {
    // Boss 2 and Boss 3 both used "speaker", so wiring art would have dressed them identically.
    const { window: w } = loadMonolith();
    const keys = w.eval(`BOSS_ROSTER.map(function(b){ return b.sprite; })`);
    expect(new Set(keys).size, 'each boss has its own look').toBe(keys.length);
  });

  it('keeps a drawn fallback for every boss that has a render', () => {
    // The render is constructed on first draw and may 404 or still be decoding; without a
    // procedural case underneath, that frame would be an empty boss.
    const { window: w } = loadMonolith();
    const noFallback = w.eval(`
      (function(){
        var drawn = String(drawBossSprite), out = [];
        for (var k in BOSS_SPRITE_SRC) if (drawn.indexOf('case "' + k + '"') < 0) out.push(k);
        return out;
      })()`);
    expect(noFallback, 'render-only bosses would vanish if the image failed').toEqual([]);
  });

  it('constructs no Image while the monolith is parsed', () => {
    // Same eval-time media rule as the fighter registry.
    const spy = spyMediaConstructors();
    let made = 0;
    const Orig = globalThis.Image;
    globalThis.Image = class { constructor() { made++; } };
    try { loadMonolith(); } finally { globalThis.Image = Orig; spy.restore(); }
    expect(made, 'no boss image constructed at eval time').toBe(0);
  });

  it('draws every boss through its telegraph, rage and hit states without throwing', () => {
    const { window: w } = loadMonolith();
    for (const state of ['', 's._tel=20;', 's._rage=true;', 's.flash=8;', 's.face=-1; s._tel=10; s.flash=6;']) {
      expect(() => w.eval(`
        for (var i=0;i<BOSS_ROSTER.length;i++){
          var b = BOSS_ROSTER[i];
          var s = { type:'boss', name:b.name, color:b.color, sprite:b.sprite, r:60, x:100, y:100,
                    face:1, hp:100, maxHp:100, _tel:0, _telKind:null, _phase:1, _rage:false, flash:0,
                    homeX:100, attack:b.attack };
          ${state}
          ctx.save(); drawBossSprite(s); ctx.restore();
        }
      `), `drawBossSprite with [${state || 'resting'}]`).not.toThrow();
    }
  });
});
