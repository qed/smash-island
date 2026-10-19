import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// A CPU AT A TALL WALL CLIMBS IT ONLY WHEN ITS TWO JUMPS CLEAR IT. ANY TALLER, IT FINDS ANOTHER WAY. IT NEVER STANDS PUSHING INTO IT.
//
// navAround answers {jump} (hop it), {climb} (a wall beside you that the two jumps clear), {detourX} (walk to the wall you can climb)
// or {tall} (one the two jumps do not clear). The stuck recovery and the long-range traversal in aiThink read `obst.x` instead, which
// navAround never returns: left and right were both false, and the CPU hopped on the spot at the wall (owner, 2026-10-18: "Fix it").
// Then the owner, 2026-10-18, on the climb that had been kept up in mid-air to get over walls taller than the two jumps: "No" -- bots
// only climb walls their two jumps can clear; and for the walls too tall to climb, which the CPU walked up to and pushed into:
// "Find another way". So a wall past the two jumps (235 px at jump 1) is {tall}, and the CPU goes up the steps on this side of it, or
// off its ledge, or away from it -- not into it.
//
// Each case puts one solid wall right beside a CPU standing on Grand Plains (a scrolling stage with no solids of its own), with its
// foe far off past the wall, and reads what the CPU presses.

const setup = (h, gap, recover) => `
  stage = STAGES.find(function(s){ return s.id==='grandplains'; });
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; SETTINGS.stocks=3; beginMatchNow();
  var c = fighters[0], t = fighters[1], gy = groundY();
  c.controller='ai'; c.you=false; c._lvl=2;          // Hard: no handicap tail swapping left and right
  t.controller='still'; t.invuln=999999;
  c.x = WW*0.5; c.y = gy - c.r; c.vx = 0; c.vy = 0; c.onground = true; c.pct = 0;
  t.x = c.x - W*1.2; t.y = c.y; t.vx = 0; t.vy = 0;   // far off to the left: the traversal branch (dist > W*0.75)
  var wall = { x: c.x - c.r - ${gap} - 22, y: gy - ${h}, w: 22, h: ${h}, solid: true, wall: true };
  worldPlats.push(wall);
  ${recover ? 'c._lastX = c.x; c._stuck = 0; c._recover = 20;' : ''}
  var kind = JSON.stringify(navAround(c, -1));        // what the wall is, to the code (and the direction it commits to)
`;
// Grand Plains' one-way platforms near the wall, taken away (one hangs 171 px up right over the spawn: a CPU that lands on it is a
// step nearer the top of any wall, so with it left in, a climb test does not prove the climb).
const STRIP = `for (var i = worldPlats.length - 1; i >= 0; i--){ var p = worldPlats[i];
  if (!p.solid && !p.wall && p.y < gy - 4 && p.x < c.x + 700 && p.x + p.w > c.x - 700) worldPlats.splice(i, 1); }`;

function pressOnce(seed, h, gap, recover, strip) {
  const { window: w } = loadMonolith(seed);
  return JSON.parse(w.eval(`(function(){ ${setup(h, gap, recover)} ${strip ? STRIP : ''}
    var inp = aiThink(c);
    running = false;
    return JSON.stringify({ kind: kind, x: c.x, left: !!inp.left, right: !!inp.right, jump: !!inp.jump });
  })()`));
}

// Left to play for `frames`. pushed: frames it pressed into the wall while touching it with the top out of a hop's reach (130 px over
// its feet) -- pushing into it, not hopping over it. upB: frames it pressed the up-special. away: how far it went back from the wall.
function play(h, recover, strip, frames) {
  const { window: w } = loadMonolith(5);
  return JSON.parse(w.eval(`(function(){ ${setup(h, 4, false)} ${strip ? STRIP : ''}
    var best = c.y + c.r, x0 = c.x, pushed = 0, upB = 0, away = 0, crossedAt = -1, keys = null;
    var a0 = aiThink; aiThink = function(f){ var o = a0.apply(this, arguments); if (f === c) keys = o; return o; };
    for (var k = 0; k < ${frames}; k++){ ${recover ? 'if (c._recover <= 0 && c.x >= wall.x) c._recover = 38;' : ''}
      keys = null; step(); t.x = x0 - W*1.2; t.y = gy - t.r; t.vx = 0; t.vy = 0; best = Math.min(best, c.y + c.r);
      var touching = c.x > wall.x && c.x - c.r - (wall.x + wall.w) < 3 && c.y + c.r - wall.y > 130;
      if (touching && keys && keys.left) pushed++;
      if (keys && keys.special && keys.up) upB++;
      away = Math.max(away, c.x - x0);
      if (crossedAt < 0 && c.x < wall.x) crossedAt = k;
    }
    running = false;
    return JSON.stringify({ kind: kind, rose: Math.round(gy - best), wall: ${h}, crossedAt: crossedAt, pushed: pushed, upB: upB, away: Math.round(away) });
  })()`));
}

describe('a CPU at a tall wall', () => {
  // A wall 200 px tall, touching: navAround says {climb}. Both branches, several seeds.
  it.each([[1, false], [2, false], [3, true], [4, true]])('climbs one its two jumps clear (seed %s, stuck recovery %s)', (seed, recover) => {
    const r = pressOnce(seed, 200, 4, recover);
    expect(r.kind, 'the wall is a climb').toBe('{"climb":true}');
    expect(r.left, 'presses into the wall').toBe(true);
    expect(r.right).toBe(false);
    expect(r.jump, 'and jumps').toBe(true);
  });

  // The same wall 40 px off: navAround says {detourX}, and the CPU walks to it.
  it.each([[2, false], [4, true]])('walks to one it can climb that is a step off (seed %s, stuck recovery %s)', (seed, recover) => {
    const r = pressOnce(seed, 200, 40, recover);
    const k = JSON.parse(r.kind);
    expect(k.detourX, 'navAround routes to it').toBeTypeOf('number');
    expect(r.left || r.right, 'presses one way, not neither').toBe(true);
    expect(r.left, 'the way the wall is').toBe(k.detourX < r.x);
  });

  // 200 and 230 px: the two jumps clear them, the second at the top of the first's rise, and that is all it uses (no up-special).
  // Once the feet came within 130 px of the top, navAround used to answer {jump}, and the second jump went off then and there: a jump
  // rises 120, so Firey came up 5-8 px short of every wall from 150 to 260 px. (On e028e28 a 60-frame latch kept the climb going
  // in the air and fired the up-special at the top of the second jump; the owner said "No" to that.)
  it.each([[200, false], [230, true]])('gets up and over a %s px one with its two jumps alone (stuck recovery %s)', (h, recover) => {
    const out = play(h, recover, true, 150);
    expect(out.kind).toBe('{"climb":true}');
    expect(out.rose, 'its feet got up to the top of the wall').toBeGreaterThanOrEqual(out.wall);
    expect(out.crossedAt, 'and it went on over to the far side').toBeGreaterThanOrEqual(0);
    expect(out.upB, 'on its jumps, without the up-special').toBe(0);
  });

  // 280, 310 and 600 px, with nothing near to climb: past the two jumps, so not a climb -- and not a push into it either. It used to
  // climb the first two (the latch, and the up-special) and press into the 600 px one for every frame it was watched (299 of 300).
  // Now it backs off the way it came (there is no other way here).
  it.each([[280, false], [310, true], [600, false], [600, true]])('does not climb or push into a %s px one past its two jumps (stuck recovery %s)', (h, recover) => {
    const r = pressOnce(5, h, 4, recover, true);
    expect(JSON.parse(r.kind).tall, 'navAround: too tall to climb').toBe(true);
    expect(r.left, 'not pressed into').toBe(false);
    const out = play(h, recover, true, 120);
    expect(out.crossedAt, 'not climbed').toBe(-1);
    expect(out.pushed, 'frames pushing into it').toBeLessThanOrEqual(5);
    expect(out.away, 'it went back from it').toBeGreaterThanOrEqual(150);
  });

  // 600 px with Grand Plains' platforms left in: "Find another way" -- it climbs the platforms on its side of the wall to the top, and
  // hops over from there, in under 5 s, never pushing into it. On e028e28 it pressed into the wall for all 300 frames and never rose
  // past one hop (120 px).
  it.each([false, true])('finds another way past a 600 px one: up the platforms beside it (stuck recovery %s)', (recover) => {
    const out = play(600, recover, false, 300);
    expect(JSON.parse(out.kind).tall).toBe(true);
    expect(out.pushed, 'frames pushing into it').toBeLessThanOrEqual(5);
    expect(out.rose, 'up the platforms to the top').toBeGreaterThanOrEqual(600);
    expect(out.crossedAt, 'and over to the far side').toBeGreaterThanOrEqual(0);
  });
});
