import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from './helpers/prng.js';

// Assist trophies were cameos that could not reach you and did not survive you: 8 seconds of life,
// no platform collision (so anyone standing on a platform was untouchable), and a life bar that any
// stray hit chewed through — `s.life -= 30` per melee connect on a 480-frame budget meant a
// 16-hit death sentence on a summon nobody could see the health of. The design doc's Section 6
// table also specified behaviour the code never grew: Spongy is a BOUNCE PLATFORM, Blender opens
// at CENTER STAGE, Selfie Stick only stuns those FACING it, Black Hole lasts 3 s.

function boot(seed = 7) {
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

// Stage a two-fighter FFA and drop ONE named assist for fighter 0, bypassing the random roll.
const stage = (w, act) => w.eval(`
  (function(){
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false;
    running = true;                 // updateItems() -> updateSummons() is gated on it; without this
                                    // step() silently never ticks a summon and every test passes blind.
    fighters = [ makeFighter(ROSTER.find(r=>r.play), 300, groundY()-60, 0),
                 makeFighter(ROSTER.filter(r=>r.play)[1], 700, groundY()-60, 1) ];
    fighters[0].team=0; fighters[1].team=1;
    fighters.forEach(function(f){ f.controller='still'; f.stocks=9; });
    summons=[]; projectiles=[]; items=[];
    var a = ASSIST_ROSTER.find(function(x){ return x.act===${JSON.stringify(act)}; });
    summonAssistNamed(fighters[0], a);
    return summons.length;
  })()`);

describe('assist trophies — duration and durability', () => {
  it('a persistent assist lives 20 seconds, not 8', async () => {
    const w = boot(); await settle(w);
    expect(stage(w, 'rush')).toBe(1);
    expect(w.eval('summons[0].life')).toBe(60 * 20);
  });

  it('a one-shot waits for its moment, then gives up — it does not loiter for 20s', async () => {
    const w = boot(); await settle(w);
    stage(w, 'flash');
    // Its act sets life=0 the moment it fires. The budget only matters when it never finds a target.
    expect(w.eval('summons[0].life')).toBe(60 * 5);
    expect(w.eval('summons[0].oneShot')).toBe(true);
  });

  it('Black Hole is exempt — 3 seconds, per the design doc', async () => {
    const w = boot(); await settle(w);
    stage(w, 'pull');
    expect(w.eval('summons[0].life')).toBe(60 * 3);
  });

  it('a persistent assist cannot be killed by damage', async () => {
    const w = boot(); await settle(w);
    stage(w, 'rush');
    const before = w.eval('summons[0].life');
    // 40 melee connects and a projectile volley: under the old rule (life -= 30) this is a corpse.
    w.eval(`
      for (var i=0;i<40;i++) damageSummons(fighters[1], summons[0].x, summons[0].y, 60, 25);
      for (var j=0;j<40;j++) projectiles.push({owner:1, ownerObj:fighters[1], x:summons[0].x, y:summons[0].y,
        vx:0, vy:0, grav:false, dmg:20, kb:5, r:20, color:'#fff', life:5});
      for (var k=0;k<5;k++) step();`);
    const after = w.eval('summons[0].life');
    expect(after).toBeGreaterThan(before - 60);   // only the natural per-frame tick
    expect(w.eval('summons.length')).toBe(1);
  });

  it('Beach Ball is still popped by a pointed fighter — canon beats immunity', async () => {
    const w = boot(); await settle(w);
    stage(w, 'bounce');
    w.eval(`
      fighters[1] = makeFighter(ROSTER.find(function(r){return r.name==='Needle';}), 0, 0, 1);
      fighters[1].team=1; fighters[1].controller='still';
      fighters[1].x = summons[0].x; fighters[1].y = summons[0].y;
      step();`);
    expect(w.eval('summons.length')).toBe(0);
  });
});

describe('assist trophies — AI', () => {
  it('an assist can reach a target standing on a platform', async () => {
    const w = boot(); await settle(w);
    stage(w, 'rush');
    const climbed = w.eval(`
      (function(){
        worldPlats = [{x:600, y:groundY()-160, w:200, h:16}];
        fighters[1].x = 700; fighters[1].y = groundY()-160-fighters[1].r;
        summons[0].x = 300; summons[0].y = groundY()-summons[0].r;
        var best = summons[0].y;
        for (var i=0;i<600;i++){ updateSummons(); if(!summons.length) break; best = Math.min(best, summons[0].y); }
        return { rose: (groundY()-summons[0].r) - best, alive: summons.length };
      })()`);
    expect(climbed.alive, 'the assist expired before it could climb').toBe(1);
    expect(climbed.rose, 'the assist never left the floor').toBeGreaterThan(60);
  });

  it('an assist does not walk itself off the world edge', async () => {
    const w = boot(); await settle(w);
    stage(w, 'rush');
    const x = w.eval(`
      (function(){
        fighters[1].x = -4000;                       // bait it off the left blast line
        for (var i=0;i<400;i++){ updateSummons(); if(!summons.length) break; }
        return summons.length ? summons[0].x : null;
      })()`);
    expect(x).not.toBeNull();
    expect(x).toBeGreaterThan(-40);
  });
});

describe('assist trophies — the design doc Section 6 table', () => {
  it('Spongy is a bounce platform you can stand on', async () => {
    const w = boot(); await settle(w);
    stage(w, 'crush');
    const r = w.eval(`
      (function(){
        var s = summons[0];
        s._cd = 99999;                                  // hold him still: this is the platform test, not the crush test
        fighters[1].x = s.x; fighters[1].y = s.y - s.r - 30; fighters[1].vy = 6;
        var launched = false;
        for (var i=0;i<40;i++){ step(); s._cd = 99999; if(fighters[1].vy < -1) { launched = true; break; } }
        return { onTop: fighters[1].y < s.y, vy: fighters[1].vy, launched: launched };
      })()`);
    expect(r.onTop, 'a fighter fell straight through Spongy').toBe(true);
    expect(r.vy, 'Spongy did not bounce').toBeLessThan(0);
  });

  it('Blender opens at centre stage, not wherever it was summoned', async () => {
    const w = boot(); await settle(w);
    stage(w, 'vortex');
    expect(Math.abs(w.eval('summons[0].x') - w.eval('WW/2'))).toBeLessThan(40);
  });

  it('Selfie Stick only stuns fighters facing the camera', async () => {
    const w = boot(); await settle(w);
    stage(w, 'flash');
    const r = w.eval(`
      (function(){
        var s = summons[0];
        fighters[1].x = s.x + 120; fighters[1].face = 1;      // looking AWAY from the camera
        fighters[1].y = s.y; fighters[1].hitstun = 0;
        updateSummons();
        var away = fighters[1].hitstun;
        summons=[]; summonAssistNamed(fighters[0], ASSIST_ROSTER.find(function(x){return x.act==='flash';}));
        summons[0].x = s.x; summons[0].y = s.y;
        fighters[1].x = s.x + 120; fighters[1].face = -1;     // looking AT it
        fighters[1].hitstun = 0;
        updateSummons();
        return { away: away, toward: fighters[1].hitstun };
      })()`);
    expect(r.away, 'a fighter facing away was stunned anyway').toBe(0);
    expect(r.toward, 'a fighter facing the camera was not stunned').toBeGreaterThan(0);
  });
});
