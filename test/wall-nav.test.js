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
// Review of that (2026-10-19): the climb toward a foe above still aimed at a step past such a wall and pushed into it (Capture the
// Flag); a one-way platform the CPU had only risen through was taken for the floor its jumps went up from, so the spare up-special
// took it over a wall its two jumps did not clear; a block floating over the floor was taken for a wall; and with no other way, the
// CPU paced to and fro 300 px from the wall (as far as navAround looks), or backed off the world's edge. Those cases are at the end.
//
// Each case puts one solid wall right beside a CPU standing on Grand Plains (a scrolling stage with no solids of its own), with its
// foe far off past the wall, and reads what the CPU presses.

const setup = (h, gap, recover) => `
  stage = STAGES.find(function(s){ return s.id==='grandplains'; });
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; SETTINGS.stocks=3; beginMatchNow();
  var c = fighters[0], t = fighters[1], gy = groundY();
  c.controller='ai'; c.you=false; c._lvl=2;          // Hard: no handicap tail swapping left and right
  c.st = Object.assign({}, STAT_ONE);                // the walls here are counted at jump 1 (235 px for the two jumps): the seed's fighter (Firey) has his own
                                                     // jump now (the owner, 2026-10-18: "give each fighter stats"; his 1.09 clears 280), so he gets the baseline's numbers
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
// turnsNear: how often it turned round 150-450 px from the wall, about where navAround stops looking (300 px).
function play(h, recover, strip, frames) {
  const { window: w } = loadMonolith(5);
  return JSON.parse(w.eval(`(function(){ ${setup(h, 4, false)} ${strip ? STRIP : ''}
    var best = c.y + c.r, x0 = c.x, pushed = 0, upB = 0, away = 0, crossedAt = -1, keys = null, lastD = 0, turnsNear = 0;
    var a0 = aiThink; aiThink = function(f){ var o = a0.apply(this, arguments); if (f === c) keys = o; return o; };
    for (var k = 0; k < ${frames}; k++){ ${recover ? 'if (c._recover <= 0 && c.x >= wall.x) c._recover = 38;' : ''}
      keys = null; step(); t.x = x0 - W*1.2; t.y = gy - t.r; t.vx = 0; t.vy = 0; best = Math.min(best, c.y + c.r);
      var touching = c.x > wall.x && c.x - c.r - (wall.x + wall.w) < 3 && c.y + c.r - wall.y > 130;
      if (touching && keys && keys.left) pushed++;
      if (keys && keys.special && keys.up) upB++;
      away = Math.max(away, c.x - x0);
      if (crossedAt < 0 && c.x < wall.x) crossedAt = k;
      var d = keys ? (keys.left ? -1 : keys.right ? 1 : 0) : 0, off = c.x - (wall.x + wall.w);
      if (d && lastD && d !== lastD && off >= 150 && off <= 450) turnsNear++;
      if (d) lastD = d;
    }
    running = false;
    return JSON.stringify({ kind: kind, rose: Math.round(gy - best), wall: ${h}, crossedAt: crossedAt, pushed: pushed, upB: upB, away: Math.round(away), turnsNear: turnsNear });
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
  // past one hop (120 px). And it gets there on its jumps, step by step: on 38e44dc the spare up-special took it the last 300 px from
  // a platform it had only risen through (review), and its two jumps do not clear 300.
  it.each([false, true])('finds another way past a 600 px one: up the platforms beside it (stuck recovery %s)', (recover) => {
    const out = play(600, recover, false, 300);
    expect(JSON.parse(out.kind).tall).toBe(true);
    expect(out.pushed, 'frames pushing into it').toBeLessThanOrEqual(5);
    expect(out.rose, 'up the platforms to the top').toBeGreaterThanOrEqual(600);
    expect(out.crossedAt, 'and over to the far side').toBeGreaterThanOrEqual(0);
    expect(out.upB, 'on its jumps, without the up-special').toBe(0);
  });

  // THE CLIMB TOWARD A FOE ABOVE (aiThink's climb branch: steerClimb) never asked navAround: it aimed at the best step anywhere, and
  // here the only one near is past the wall, with the foe standing on it. On 38e44dc the CPU walked to the wall and pressed into it,
  // under the step (review: in Capture the Flag, forest seed 2, Bonesaw pressed into a solid 600 px over his feet for 26 frames on
  // end, aiming at a step past it). A step past a wall the two jumps do not clear is no step: with none on this side, another way.
  it.each([1, 2])('does not climb toward a foe above by a step past a 600 px one (seed %s)', (seed) => {
    const { window: w } = loadMonolith(seed);
    const r = JSON.parse(w.eval(`(function(){ ${setup(600, 4, false)} ${STRIP}
      var ledge = { x: wall.x - 300, y: gy - 150, w: 240, h: 16 };      // a one-way step past the wall, 150 px up
      worldPlats.push(ledge);
      var tx = ledge.x + 120; t.x = tx; t.y = ledge.y - t.r;           // the foe on it: above and near, so the climb branch
      var first = aiThink(c), x0 = c.x, pushed = 0, away = 0, keys = null;
      var a0 = aiThink; aiThink = function(f){ var o = a0.apply(this, arguments); if (f === c) keys = o; return o; };
      for (var k = 0; k < 240; k++){ keys = null; step(); t.x = tx; t.y = ledge.y - t.r; t.vx = 0; t.vy = 0;
        var touching = c.x > wall.x && c.x - c.r - (wall.x + wall.w) < 3 && c.y + c.r - wall.y > 130;
        if (touching && keys && keys.left) pushed++;
        away = Math.max(away, c.x - x0); }
      running = false;
      return JSON.stringify({ firstLeft: !!first.left, pushed: pushed, away: Math.round(away), crossed: c.x < wall.x });
    })()`));
    expect(r.firstLeft, 'not pressed into the wall').toBe(false);
    expect(r.pushed, 'frames pushing into it').toBeLessThanOrEqual(5);
    expect(r.crossed, 'not over it').toBe(false);
  });

  // BETWEEN TWO SUCH WALLS. aiWallWay climbs toward the top of the wall in its way by the steps on its side of it, and the step it
  // picked was past a second wall behind it: Cherries pressed into that one for 68 frames on end (Capture the Flag, forest seed 2,
  // while this was being fixed). A step past either is no step; here there is none between them, so it stays between them.
  it('does not climb for one wall by a step past another behind it', () => {
    const { window: w } = loadMonolith(5);
    const r = JSON.parse(w.eval(`(function(){ ${setup(600, 4, false)} ${STRIP}
      var wall2 = { x: c.x + 160, y: gy - 600, w: 22, h: 600, solid: true, wall: true }; worldPlats.push(wall2);
      worldPlats.push({ x: wall2.x + 60, y: gy - 150, w: 240, h: 16 });   // the only step near: past the second wall
      var pushed = 0, keys = null, x0 = c.x;
      var a0 = aiThink; aiThink = function(f){ var o = a0.apply(this, arguments); if (f === c) keys = o; return o; };
      for (var k = 0; k < 240; k++){ keys = null; step(); t.x = x0 - W*1.2; t.y = gy - t.r; t.vx = 0; t.vy = 0;
        if (c.x < wall2.x && wall2.x - (c.x + c.r) < 3 && keys && keys.right) pushed++; }
      running = false;
      return JSON.stringify({ pushed: pushed, between: c.x > wall.x + wall.w && c.x < wall2.x });
    })()`));
    expect(r.pushed, 'frames pushing into the second wall').toBeLessThanOrEqual(5);
    expect(r.between, 'still between them, over neither').toBe(true);
  });

  // FROM THE FLOOR IT JUMPED FROM. In the air, a wall's height was counted from whatever the CPU would land on, and that took a one-way
  // platform it had only risen through for its floor: on 38e44dc a CPU that jumped from the floor beside a 300 px wall, up through a
  // platform 150 px up, was told it was a climb, and the spare up-special took it over (Grand Plains, seeds 5 and 6, the review).
  // Standing on that platform, the wall is a climb (150 px over it).
  it('counts a wall from the floor it jumped from, not a one-way platform it only rose through', () => {
    const { window: w } = loadMonolith(5);
    const r = JSON.parse(w.eval(`(function(){ ${setup(300, 4, false)} ${STRIP}
      worldPlats.push({ x: c.x - 30, y: gy - 150, w: 160, h: 16 });   // a one-way platform overhead, this side of the wall
      c.controller = 'still'; step();                                 // a frame stood on the floor
      c.x = WW*0.5; c.y = gy - 170 - c.r; c.vx = 0; c.vy = -3; c.onground = false; c.jumps = 0;   // up through the platform, jumps spent
      var inAir = JSON.stringify(navAround(c, -1));
      c.y = gy - 150 - c.r; c.vy = 0; c.onground = true; c.jumps = 2;                            // standing on the platform
      var onPlat = JSON.stringify(navAround(c, -1));
      running = false;
      return JSON.stringify({ inAir: inAir, onPlat: onPlat });
    })()`));
    expect(JSON.parse(r.inAir).tall, 'risen through the platform: 300 px over the floor it jumped from').toBe(true);
    expect(r.onPlat, 'stood on the platform: 150 px over it').toBe('{"climb":true}');
  });

  // A BLOCK FLOATING OVER THE FLOOR IS NOT A WALL. Pillars' 46 px block hangs 246 px up; counted from the floor far below it, a CPU in
  // the air beside it with its jumps spent was told it was too tall to climb, and backed away in mid-air (38e44dc: 6 of 11 FFA runs
  // no longer the same as main's, the review). It is answered as it always was: up near its top, a hop.
  it('does not take a block floating over the floor for a wall', () => {
    const { window: w } = loadMonolith(3);
    const kind = w.eval(`(function(){
      stage = STAGES.find(function(s){ return s.id==='grandplains'; });
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; SETTINGS.stocks=3; beginMatchNow();
      var c = fighters[0], gy = groundY();
      c.controller='ai'; c.you=false; c.x = WW*0.5; c.y = gy - 220 - c.r; c.vx = 0; c.vy = 0; c.onground = false; c.jumps = 0;
      ${STRIP}
      worldPlats.push({ x: c.x - c.r - 4 - 60, y: gy - 246, w: 60, h: 46, solid: true });
      var k = JSON.stringify(navAround(c, -1)); running = false; return k;
    })()`);
    expect(kind).toBe('{"jump":true}');
  });

  // WITH NO WAY PAST FROM HERE (nothing to climb near it, no ledge to drop from), it keeps to the way it took -- off to the steps far
  // along its side -- and does not turn back at it: on 38e44dc it turned round the moment it was 300 px off the wall (navAround looks
  // no farther), walked back, and backed off again, 57 turns in 15 s, 284 px from the wall (review).
  it('keeps to its other way past a 600 px one, not to and fro 300 px from it', () => {
    const out = play(600, false, true, 600);
    expect(out.turnsNear, 'turns 150-450 px from the wall').toBeLessThanOrEqual(4);
    expect(out.pushed, 'frames pushing into it').toBeLessThanOrEqual(5);
    expect(out.crossedAt, 'not climbed').toBe(-1);
  });

  // ...and not off the world. Its back to the world's edge, the wall in front and its foe just past it (the spacing approach, which
  // clamps nothing at the world's edge): on 38e44dc it backed off to x = 25, and the off-stage recovery set in (review).
  it.each([-1, 1])('backs off a wall only as far as the world lets it (world edge %s)', (side) => {
    const { window: w } = loadMonolith(7);
    const r = JSON.parse(w.eval(`(function(){
      stage = STAGES.find(function(s){ return s.id==='grandplains'; });
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; SETTINGS.stocks=3; beginMatchNow();
      var c = fighters[0], t = fighters[1], gy = groundY(), side = ${side};
      c.controller='ai'; c.you=false; c._lvl=2; t.controller='still'; t.invuln=999999;
      c.x = side > 0 ? WW - 110 : 110; c.y = gy - c.r; c.vx = 0; c.vy = 0; c.onground = true;
      var wall = { x: side > 0 ? c.x - c.r - 4 - 22 : c.x + c.r + 4, y: gy - 600, w: 22, h: 600, solid: true, wall: true };
      worldPlats.push(wall);
      ${STRIP}
      var tx = side > 0 ? wall.x - 220 : wall.x + wall.w + 220, stocks0 = c.stocks, edge = 1e9;
      for (var k = 0; k < 400; k++){ step(); t.x = tx; t.y = gy - t.r; t.vx = 0; t.vy = 0;
        if (!c.dead) edge = Math.min(edge, side > 0 ? WW - c.x : c.x); }
      running = false;
      return JSON.stringify({ edge: Math.round(edge), stocks0: stocks0, stocks: c.stocks });
    })()`));
    expect(r.edge, 'px from the world edge, at the closest').toBeGreaterThanOrEqual(90);
    expect(r.stocks, 'no stock lost').toBe(r.stocks0);
  });
});
