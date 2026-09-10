import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from './prng.js';

// One measurement procedure, shared by the fixture GENERATOR (scripts/smash-golden.mjs) and the
// test that checks the live build against it (test/smash-charge.test.js). If they measured
// differently the fixture would prove nothing.
//
// Stages the named fighter against an anchored, input-less dummy at `dist` px, fires doSmash at
// `charge`, and steps the real engine until the dummy is hit or the frame budget runs out.

export const GOLDEN_DISTS = [60, 140];   // point-blank, and out where reach retunes would show
export const GOLDEN_FRAMES = 120;        // sky-drops warn for 26 frames and then have to fall

export function bootMonolith(seed = 5) {
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

export function measureSmash(w, name, charge, dist, seed = 5) {
  w.Math.random = mulberry32(seed);   // every measurement starts from the same dice
  return w.eval(`
    (function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 400+${dist}, groundY()-24, 1);
      A.team=0; D.team=1; A.face=1; D.face=-1;
      [A,D].forEach(function(f){ f.controller='still'; f.stocks=9; f.invuln=0; });
      fighters=[A,D];
      // One settling frame BEFORE the swing: onground is only ever set by the physics step, and
      // several bodies (tackle, van, crush) refuse to connect with a target the engine has not yet
      // marked grounded. Then re-zero anything that frame touched.
      step(); A.invuln=0; D.invuln=0; A.pct=0; D.pct=0; A.atkCd=0; A.spCd=0;
      var selfBefore = A.pct, p0 = D.pct;      // baseline BEFORE the swing — AoE bodies land inside doSmash itself
      doSmash(A, ${charge});
      var atkCd = A.atkCd;
      var hitFrame=-1, kvx=0, kvy=0, dmg1=0, total=0;
      if (D.pct>p0){ hitFrame=0; kvx=D.vx; kvy=D.vy; dmg1=D.pct-p0; total=dmg1; }
      var dx0=D.x, dy0=D.y;
      for (var i=0; i<${GOLDEN_FRAMES}; i++){
        step();
        if (hitFrame<0 && D.pct>p0){ hitFrame=i+1; kvx=D.vx; kvy=D.vy; dmg1=D.pct-p0; }
        total = Math.max(total, D.pct-p0);
        // Pin the dummy back where it stood. The knockback was already read on the hit frame; left
        // to fly it reaches the blast line inside the budget, respawns at 0% and erases the total.
        D.x=dx0; D.y=dy0; D.vx=0; D.vy=0; D.dead=false;
      }
      return { dmg1:+dmg1.toFixed(2), dmg:+total.toFixed(2), kvx:+kvx.toFixed(2), kvy:+kvy.toFixed(2),
               hitFrame:hitFrame, atkCd:atkCd, self:+(A.pct-selfBefore).toFixed(2) };
    })()`);
}
