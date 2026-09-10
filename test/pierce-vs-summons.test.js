import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from './helpers/prng.js';

// A piercing projectile is deliberately not consumed when it hits something — that is the whole
// point of pierce. On the FIGHTER path that is paired with a per-target guard (`pr._hit[f.idx]`),
// so a nail passes through you once. On the SUMMON path the guard was simply missing, so a pierce
// or van shot overlapping a boss re-applied its full damage on EVERY FRAME it was inside the body.
// Bosses are ~85px in radius, so a slow shot spends ~20 frames in there: one 9-damage nail measured
// 180 damage. Measured over the whole roster in solo Boss Rush, the piercing characters ran away
// with it — Naily cleared 41.5 bosses against a roster mean of 4.5, Pencil 28 — while the character
// the bug was reported against (Money, whose coins bounce and do not pierce) sat 29th of 59.

function boot(seed = 9) {
  const html = readFileSync('artifacts/V1/index.html', 'utf8');
  const dom = new JSDOM(html, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
        get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 })
          : p === 'canvas' ? { width: 1100, height: 720 }
          : p === 'getImageData' ? () => ({ data: [] }) : () => {}),
        set: () => true,
      });
      window.Math.random = mulberry32(seed);
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
    },
  });
  return dom.window;
}
const settle = (w) => w.eval('profileReady');

// Fire ONE shot with the given flags straight through a Boss Rush boss and report what it did.
const fire = (w, flags) => w.eval(`
  (function(){
    SETTINGS.mode='boss'; SETTINGS.count=1; SETTINGS.items=false; running=true;
    fighters=[ makeFighter(ROSTER.find(function(r){return r.name==='Naily';}), WW*0.25, groundY()-60, 0) ];
    fighters[0].team=0; fighters[0].controller='still';
    summons=[]; projectiles=[]; items=[]; tendrils=[];
    startBossRush();
    var b = summons.find(function(s){ return s.type==='boss'; });
    var p = {owner:0, ownerObj:fighters[0], x:b.x-200, y:b.y, vx:3, vy:0, grav:false,
             dmg:9, kb:5, r:8, color:'#fff', life:400};
    ${flags}
    projectiles.push(p);
    var hp0=b.hp, hits=0, prev=b.hp;
    for(var i=0;i<200;i++){ step(); if(b.hp<prev){ hits++; prev=b.hp; } }
    return { bossR: Math.round(b.r), damage: Math.round(hp0-b.hp), hits: hits,
             survived: projectiles.indexOf(p) >= 0 };
  })()`);

describe('a projectile damages a boss once per pass, not once per frame', () => {
  it('a PIERCING shot lands exactly one hit for its damage value', async () => {
    const w = boot(); await settle(w);
    const r = fire(w, 'p.pierce = true;');
    expect(r.bossR, 'the boss should be big enough for this to matter').toBeGreaterThan(60);
    expect(r.hits, 'the shot damaged the boss on more than one frame').toBe(1);
    expect(r.damage, 'the shot dealt more than its damage value').toBe(9);
  });

  it('a piercing shot still PASSES THROUGH — the guard must not consume it', async () => {
    const w = boot(); await settle(w);
    const r = fire(w, 'p.pierce = true;');
    expect(r.survived, 'pierce stopped piercing').toBe(true);
  });

  it('a VAN shot lands exactly one hit too', async () => {
    const w = boot(); await settle(w);
    const r = fire(w, 'p.van = true;');
    expect(r.hits).toBe(1);
    expect(r.damage).toBe(9);
  });

  it('an ordinary shot is still consumed on contact', async () => {
    const w = boot(); await settle(w);
    const r = fire(w, '');
    expect(r.hits).toBe(1);
    expect(r.damage).toBe(9);
    expect(r.survived, 'a non-piercing shot should die on the boss').toBe(false);
  });
});
