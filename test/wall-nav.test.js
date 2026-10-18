import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// A CPU AT A TALL WALL WALKS ROUND IT OR CLIMBS IT. IT DOES NOT STAND THERE.
//
// navAround answers {jump} (hop it), {climb} (a wall beside you, low enough to climb) or {detourX} (walk to there). The stuck
// recovery and the long-range traversal in aiThink read `obst.x` instead, which navAround never returns: left and right were both
// false, and the CPU hopped on the spot at the wall (owner, 2026-10-18: "Fix it"). On the teams arena a CPU sent from mid-map at
// foes up on the left stood at the shaft's wall and climbed 320 px on half the seeds; with the fix it climbs 799 on all of them.
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

function pressOnce(seed, h, gap, recover) {
  const { window: w } = loadMonolith(seed);
  return JSON.parse(w.eval(`(function(){ ${setup(h, gap, recover)}
    var inp = aiThink(c);
    running = false;
    return JSON.stringify({ kind: kind, x: c.x, left: !!inp.left, right: !!inp.right, jump: !!inp.jump });
  })()`));
}

describe('a CPU at a tall wall', () => {
  // A wall 200 px tall, touching: navAround says {climb}. Both branches, several seeds.
  it.each([[1, false], [2, false], [3, true], [4, true]])('climbs one it can climb (seed %s, stuck recovery %s)', (seed, recover) => {
    const r = pressOnce(seed, 200, 4, recover);
    expect(r.kind, 'the wall is a climb').toBe('{"climb":true}');
    expect(r.left, 'presses into the wall').toBe(true);
    expect(r.right).toBe(false);
    expect(r.jump, 'and jumps').toBe(true);
  });

  // A wall far too tall to climb, touching, and a climbable one 40 px off: navAround says {detourX}.
  it.each([[1, 600, false], [2, 200, false], [3, 600, true], [4, 200, true]])('walks toward the detour (seed %s, wall %s px, stuck recovery %s)', (seed, h, recover) => {
    const gap = h === 600 ? 4 : 40;
    const r = pressOnce(seed, h, gap, recover);
    const k = JSON.parse(r.kind);
    expect(k.detourX, 'navAround routes round it').toBeTypeOf('number');
    expect(r.left || r.right, 'presses one way, not neither').toBe(true);
    expect(r.left, 'the way the detour is').toBe(k.detourX < r.x);
  });

  // 280 and 310 px: past what the two jumps clear, so it takes the up-special too, at the top of the double jump's rise. Grand Plains'
  // one-way platforms near the wall are taken away first (one hangs 171 px up right over the spawn: a CPU that landed on it got over
  // a 280 px wall from there without ever climbing it), so this is the climb itself. Before: Firey's best was 261 px against both,
  // never over (the up-special fired the frame after the double jump and threw its rise away, and once the top was within 130 px
  // the {jump} answer held the key and never fired it at all). After: over both in about 50 frames, in either branch.
  it.each([[280, false], [310, true]])('gets up and over a %s px one when left to play (stuck recovery %s)', (h, recover) => {
    const { window: w } = loadMonolith(5);
    const out = JSON.parse(w.eval(`(function(){ ${setup(h, 4, false)}
      for (var i = worldPlats.length - 1; i >= 0; i--){ var p = worldPlats[i];
        if (!p.solid && !p.wall && p.y < gy - 4 && p.x < c.x + 700 && p.x + p.w > c.x - 700) worldPlats.splice(i, 1); }
      var best = c.y + c.r, x0 = c.x;
      for (var k = 0; k < 150; k++){ ${recover ? 'if (c._recover <= 0 && c.x >= wall.x) c._recover = 38;' : ''}
        step(); t.x = x0 - W*1.2; t.y = gy - t.r; t.vx = 0; t.vy = 0; best = Math.min(best, c.y + c.r); }
      running = false;
      return JSON.stringify({ kind: kind, rose: Math.round(gy - best), wall: ${h}, crossed: c.x < wall.x });
    })()`));
    expect(out.kind).toBe('{"climb":true}');
    expect(out.rose, 'its feet got up to the top of the wall').toBeGreaterThanOrEqual(out.wall);
    expect(out.crossed, 'and it went on over to the far side').toBe(true);
  });
});

