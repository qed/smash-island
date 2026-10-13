import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// DROP-THROUGH (a real bug, 2026-10-13). The owner: "i cant fall through platforms". Down + Jump dropped you through a one-way
// platform only in the big arenas (isBig), and Down and Up at once is awkward on the arrow keys. A player now drops after holding
// Down a moment (DROP_HOLD steps, nothing else held), or on Down + Jump, on ANY stage -- but only through a thin one-way platform,
// never a solid block or the ground.
const stand = (w, plat) => w.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; running=true; summons=[]; projectiles=[]; items=[]; particles=[]; beams=[]; tendrils=[];
  var P = ${JSON.stringify(plat)};
  worldPlats = [P];
  var A = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), P.x + P.w/2, P.y - 24, 0);
  A.controller='local'; A.you=true; A.onground=true; A.vy=0;
  var B = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 60, groundY()-24, 1); B.controller='still';
  fighters=[A, B];
  for (var i = 0; i < 5; i++) step();
  var y0 = A.y; down[KEYS.down] = true;
  for (var j = 0; j < 30; j++) step();
  down[KEYS.down] = false;
  return { y0: y0, y1: A.y, plat: P.y };
})()`);

describe('a player drops through a thin platform by holding Down', () => {
  it('on a normal stage, holding Down on a one-way platform drops you through it', () => {
    const { window: w } = loadMonolith();
    const r = stand(w, { x: 500, y: 400, w: 240, h: 14 });
    expect(r.y1, 'below the platform after holding Down').toBeGreaterThan(r.plat + 20);
  });
  it('a solid block never lets you through', () => {
    const { window: w } = loadMonolith();
    const r = stand(w, { x: 500, y: 400, w: 240, h: 46, solid: true });
    expect(Math.abs(r.y1 - r.y0), 'still standing on it').toBeLessThan(4);
  });
});
