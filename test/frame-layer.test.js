import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// THE FRAME LAYER (index.html, "THE FRAME LAYER") is render-only: a match plays out tick for tick the same with its frames drawn or stripped.
// The same scripted match is played twice, both times drawn every tick -- with the frames on, and with them stripped (FRAME_ON false) -- and every number the
// sim can see has to come out the same, with the same dice left over. A launch every 90 ticks brings up the tumble, the hit and the rest. (Not drawing at all is a
// different thing: draw() itself touches a little of what the sim reads, and always has. This holds the FRAMES to it.)
const OFF = (src) => { expect(src, 'the switch is where the test expects it').toContain('const FRAME_ON = true;'); return src.replace('const FRAME_ON = true;', 'const FRAME_ON = false;'); };

const play = (name, { draw, frames }) => {
  const { window: w } = loadMonolith(0xC0FFEE, frames ? undefined : OFF);
  return w.eval(`(function(){
    SETTINGS.mode = 'ffa'; SETTINGS.count = 2; SETTINGS.itemRate = 0; SETTINGS.items = false; running = true; startMatch();
    var A = makeFighter(ROSTER.find(function(r){ return r.name === ${JSON.stringify(name)}; }), 300, groundY() - 24, 0), B = makeFighter(ROSTER.find(function(r){ return r.name === 'Coiny'; }), 520, groundY() - 24, 1);
    A.team = 0; B.team = 1; A.controller = 'ai'; B.controller = 'ai'; A.you = false; B.you = false; A.stocks = 9; B.stocks = 9; fighters = [A, B];
    var rec = [], moments = {};
    for (var t = 0; t < 360; t++){
      if (t % 90 === 45){ A.hitstun = 16; A.vx = 15; A.vy = -9; A.onground = false; A.pct += 30; }   // launched
      step();
      ${draw ? "draw(); frPose(A, FRAME_DATA[A.name], SPRITES[A.name]); moments[_FP.mom] = 1;" : ''}
      rec.push([A.x, A.y, A.vx, A.vy, A.pct, A.hitstun, A.atkCd, A.spCd, A._atkAnim, A.flash, A.onground, A.face, B.x, B.y, B.vx, B.pct, B.hitstun, projectiles.length, particles.length]
        .map(function(v){ return typeof v === 'number' ? Math.round(v*1000) : v; }).join('|'));
    }
    return { rec: rec, rng: Math.random(), moments: Object.keys(moments).sort().join('') };
  })()`);
};

describe('the frame layer is render-only: the same match, tick for tick, drawn or stripped', () => {
  for (const name of ['Firey', 'Knife', 'Puffball']) {
    it(`${name}: frames on, frames stripped -- the same ticks, the same dice`, () => {
      const on = play(name, { draw: true, frames: true }), off = play(name, { draw: true, frames: false });
      expect(on.moments, 'the frames really came up: moving, and the tumble of a launch').toMatch(/3.*5|5.*3/);
      expect(off.moments, 'and stripped there are none').toBe('0');
      expect(off.rec).toEqual(on.rec);
      expect(off.rng).toBe(on.rng);
    });
  }
});
