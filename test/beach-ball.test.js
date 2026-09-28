import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from './helpers/prng.js';

// "beach ball is broken." Summoned in a jsdom match and watched for 600 frames, the Beach Ball crossed the stage once,
// reached the left wall, and stopped dead: stepAssistBody's world-edge clamp zeroed its speed, and the act's own wall
// check -- which only ran every sixth frame, and after the clamp -- reversed a zero. It bobbed in the corner at x=20 for
// the rest of its tenure. Its launch also sat behind `if(tgt)`, so with no enemy fighter (Boss Rush) it never moved at all.
// The ricochet lives in its body step now, every frame: launch, walls, floor and platform tops reflect it; the act only hits.

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

// A still Firey (team 0) at 300 and a still enemy (team 1) wherever `enemy` puts it; the Beach Ball is Firey's.
const stage = (w, enemy) => w.eval(`
  (function(){
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running = true;
    worldPlats=[]; summons=[]; projectiles=[]; items=[]; particles=[];
    fighters = [ makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 300, groundY()-24, 0),
                 makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 700, groundY()-24, 1) ];
    fighters[0].team=0; fighters[1].team=1;
    fighters.forEach(function(f){ f.controller='still'; f.stocks=9; });
    ${enemy}
    var s = summonAssistNamed(fighters[0], ASSIST_ROSTER.find(function(x){ return x.act==='bounce'; }));
    return { x: s.x, life: s.life };
  })()`);

// Watch it for `n` frames, pinning the enemy where it stands. Everything a ricochet has to do, counted.
const watch = (w, n, pin) => w.eval(`
  (function(){
    var s = summons[0], e = fighters[1], ex = e.x, ey = e.y, gy = groundY();
    var out = { minX:1e9, maxX:-1e9, minY:1e9, maxY:-1e9, zero:0, offSpeed:0, flips:0, floor:0, hits:[], gone:-1 };
    var lastVx = 0, last = e.pct;
    for (var i=0;i<${n};i++){
      step();
      if (summons.indexOf(s) < 0){ out.gone = i; break; }
      if (e.pct > last){ out.hits.push(+(e.pct - last).toFixed(3)); last = e.pct; }
      ${pin ? 'e.x = ex; e.y = ey; e.vx = 0; e.vy = 0; e.dead = false; e.hitstun = 0;' : ''}
      if (s.vx === 0) out.zero++;
      if (Math.abs(Math.abs(s.vx) - BEACH_BALL_SPEED) > 1e-9) out.offSpeed++;
      if (lastVx !== 0 && Math.sign(s.vx) !== Math.sign(lastVx)) out.flips++;
      lastVx = s.vx;
      if (s.onground) out.floor++;
      out.minX = Math.min(out.minX, s.x); out.maxX = Math.max(out.maxX, s.x);
      out.minY = Math.min(out.minY, s.y); out.maxY = Math.max(out.maxY, s.y);
    }
    out.WW = WW; out.floorY = gy - s.r; out.r = s.r;
    return out;
  })()`);

describe('the Beach Ball ricochets', () => {
  // Nine seconds now, not six: "assist trophies should be stronger" -- "stay longer" (ASSIST_TROPHY_TIME; test/assists-stronger.test.js).
  it('crosses the whole stage, wall to wall, at full speed for its nine seconds -- it no longer stops at the first wall', async () => {
    const w = boot(); await settle(w);
    // the enemy up on a high ledge, out of the ball's path, so nothing but the walls turns it round
    stage(w, `worldPlats=[{x:640, y:groundY()-320, w:120, h:16}]; fighters[1].x = 700; fighters[1].y = groundY()-320-fighters[1].r;`);
    const r = watch(w, 600, true);
    expect(r.minX, 'it reached the left wall').toBeLessThanOrEqual(20);
    expect(r.maxX, 'it reached the right wall').toBeGreaterThanOrEqual(r.WW - 20);
    expect(r.flips, 'it turned round at wall after wall (five crossings in nine seconds)').toBeGreaterThanOrEqual(3);
    // Before the fix: 240 frames at vx 0, parked at x=20. A ricochet never has a zero speed.
    expect(r.zero, 'frames with no horizontal speed').toBe(0);
    expect(r.offSpeed, 'frames off BEACH_BALL_SPEED (it keeps its speed: no friction, no steering)').toBe(0);
    expect(r.floor, 'frames sat on the floor').toBe(0);
    expect(r.minY, 'it bounces well clear of the floor').toBeLessThan(r.floorY - 60);
    expect(r.maxY, 'and never sinks into it').toBeLessThanOrEqual(r.floorY + 1e-6);
    expect(r.gone, 'it expires on its nine-second tenure, no sooner').toBeGreaterThanOrEqual(w.eval('ASSIST_DUR') - 2);
    expect(r.gone).toBeLessThanOrEqual(w.eval('ASSIST_DUR'));
  });

  it('hits a fighter in its path for 9 a touch (its 6, x1.5: "assist trophies should be stronger"), and goes on ricocheting after', async () => {
    const w = boot(); await settle(w);
    stage(w, '');
    const r = watch(w, 600, true);
    expect(r.hits.length, 'touches on the enemy').toBeGreaterThanOrEqual(2);
    for (const h of r.hits) expect(h).toBe(9);
    expect(r.zero).toBe(0);
    expect(r.flips, 'the enemy and the wall both turn it round').toBeGreaterThanOrEqual(4);
  });

  it('moves with nobody in `fighters` to aim at -- Boss Rush has no enemy fighter, and it used to sit there', async () => {
    const w = boot(); await settle(w);
    // A teammate is nobody to aim at. The summon step is driven directly: a two-fighter FFA with both on one team is a
    // match checkWin has already called, and step() would stop ticking after its first frame.
    const x0 = stage(w, 'fighters[1].team = 0;').x;
    const r = w.eval(`(function(){ var s = summons[0]; for (var i=0;i<30;i++) updateSummons(); return { x: s.x, vx: s.vx, launched: !!s._launched }; })()`);
    expect(r.launched).toBe(true);
    expect(Math.abs(r.x - x0), 'thirty frames on it is well away from where it was summoned').toBeGreaterThan(200);
    expect(Math.abs(r.vx)).toBe(w.eval('BEACH_BALL_SPEED'));
  });

  it('still pops on the pointed fighter it flies into', async () => {
    const w = boot(); await settle(w);
    // Needle a step to the ball's right: it is launched at her and dies to the point at once
    stage(w, `fighters[1] = makeFighter(ROSTER.find(function(r){ return r.name==='Needle'; }), 300 + 22*fighters[0].face, groundY()-24, 1);
              fighters[1].team=1; fighters[1].controller='still';`);
    const r = watch(w, 120, true);
    expect(r.gone, 'popped on the touch').toBeGreaterThanOrEqual(0);
    expect(r.gone).toBeLessThan(10);
    expect(r.hits, 'a pop is not a hit').toEqual([]);
  });

  it('a hostile Beach Ball (MePhone4\'s) ricochets the same way and still hits only the players', async () => {
    const w = boot(); await settle(w);
    stage(w, '');
    const r = w.eval(`(function(){
      summons = [];
      var boss = { type:'boss', name:'MePhone4', color:'#4fb8e8', team:-1, owner:-1, x:WW*0.5, y:groundY()-90, vx:0, vy:0, r:85, hp:255, maxHp:255,
                   life:1e9, face:1, _cd:0, attack:'basic', sprite:'mephone', stationary:true, homeX:WW*0.5, _tel:0, _phase:1, _atkTimer:1e9 };
      summons.push(boss);
      var a = summonAssistNamed({ x:WW*0.5+220, face:1, team:-1, idx:-1 }, ASSIST_ROSTER.find(function(x){ return x.act==='bounce'; }));
      a.hostile = true; a._dl = 0; a.hp = a.maxHp = 40;
      var hp0 = boss.hp, zero = 0, flips = 0, lastVx = 0, hit = false;
      for (var i=0;i<300;i++){ step(); boss._atkTimer = 1e9; if (summons.indexOf(a) < 0) break;
        if (a.vx === 0) zero++; if (lastVx !== 0 && Math.sign(a.vx) !== Math.sign(lastVx)) flips++; lastVx = a.vx;
        fighters.forEach(function(f){ if (f.pct > 0) hit = true; f.pct = 0; f.x = f.team===0 ? 300 : 700; f.vx = 0; f.dead = false; }); }
      return { zero: zero, flips: flips, bossHp: boss.hp === hp0, hit: hit };
    })()`);
    expect(r.zero).toBe(0);
    expect(r.flips).toBeGreaterThanOrEqual(3);
    expect(r.bossHp, 'never its own boss').toBe(true);
    expect(r.hit, 'a player in its path').toBe(true);
  });
});
