import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { bootMonolith } from './helpers/smash-golden.js';
import { mulberry32 } from './helpers/prng.js';

// STEVE COBS, TUNED BY THE OWNER, ROUND 2 (2026-10-06). Five picks, each cited verbatim in the tests that pin it:
//   11. MAZED AND CONFUSED!: "mazed and confused should be a hazard-passive and screen wide." (asked: "Always on" and "Rayguns on walls")
//   12. PULL THE PLUG!: "damage for pull the plug should scale based on fall distance." (asked: "Only falls hurt")
//   13. TOXIC CANNON!: "the ship should spawn near you"
//   14. THE FUTURE IS SO YESTERDAY! (his keynote): "alongside the future is so yesterday as well"
//   15. BOOMERANGS!: "boomerangs should NOT home." and, asked again, "cobs should just turn around-not towards the player. 4 times."
// Same damage per hit for everything except item 12's fall scaling; every hit keeps its attack's one bossAtk id; no text on screen but a boss's telegraph banners.
// Nothing here is a bar for difficulty ("dont tune, cuz thats an agent, not a player"): every assertion is what the pick says.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// Start his fight as the chain does and hand the body `s` (him), `you` (player 1, parked), `park()`, `floorAt(f, x)`, `shots()` and `atTier(t)`; the same dice every time.
const fight = (body, lineup = ['Knife']) => { W.Math.random = mulberry32(5); return W.eval(`(function(){
  SETTINGS.itemRate=0; SETTINGS.stocks=3; LOCAL_PLAYERS=1; window.__cobsEnd = undefined;
  var __ok = startCobsFight(${JSON.stringify(lineup)}, { story:true, onEnd:function(won){ window.__cobsEnd = won; return true; } });
  var s = summons.find(function(o){ return o._cobsFight; });
  s._hop = null;
  var you = fighters[0];
  var park = function(){ s._atkTimer = 1e9; you.controller = 'still'; };
  var floorAt = function(f, x){ f.x = x; f.y = groundY() - f.r; f.vx = 0; f.vy = 0; f.pct = 0; f.invuln = 0; step(); f.pct = 0; f.invuln = 0; };
  var shots = function(){ return projectiles.filter(function(p){ return p.owner===-2 && p.life > 0; }); };
  var atTier = function(t){ s._marks = t - 1; s._hop = null; };
  ${body}
})()`); };

// ================= 15. BOOMERANGS! =================
// "boomerangs should NOT home." -- asked again: "cobs should just turn around-not towards the player. 4 times." At each turn a boomerang turns back along its own line, with its arc, and is never
// re-aimed at where a fighter stands; four turns, and after the last it still flies back to his hand. (MePhone4's BOOMERANGS! only return to his own hand and are not changed.)
describe('OWNER (round 2): BOOMERANGS! -- "boomerangs should NOT home." / "cobs should just turn around-not towards the player. 4 times."', () => {
  // one volley thrown from a fixed spot at a fixed sight, the boss held where he is; `move` runs each frame before the step (what the fighter does while it flies); the first boomerang is followed until it is sent home
  const FLY = (tier, move = '', after = '') => fight(`
    park(); atTier(${tier}); you.invuln = 99999; summons = summons.filter(function(m){ return m === s; }); projectiles = [];
    floorAt(you, WW*0.5); s.x = you.x + 450; s.y = you.y - 200; s.face = -1; s._holdT = 99999;
    cobsFightTelegraph(s, 'boomerangs', you); s._tel = 0;
    var bs = null, CN = cobsNearest, nearestCalls = 0;   // (counted: the asks made from where a boomerang of the volley is -- what a re-aim at a turn did)
    cobsNearest = function(x, y){ if (bs && bs.some(function(p){ return Math.abs(p.x - x) < 1e-6 && Math.abs(p.y - y) < 1e-6; })) nearestCalls++; return CN.apply(this, arguments); };
    try {
      COBS_MOVES.boomerangs(s, you, ++BOSS_ATK_ID);
      bs = shots(); var b0 = bs[0], T = cobsT(s, 'boomerangs'), p0 = [b0.x, b0.y], w0 = b0._bm.w, path = [], turns = [], last = 0, homeAt = null, spd = b0._bm.spd, alive = null;
      ${after}
      for (var i=0;i<300;i++){ s._atkTimer = 1e9; s._holdT = 99999; ${move} step(); you.invuln = 99999;
        if (b0.life <= 0) break;
        alive = { x:b0.x, y:b0.y, life:b0.life };
        if (b0._bm.turned !== last){ last = b0._bm.turned; turns.push({ f:i, n:last, x:b0.x, y:b0.y, w:b0._bm.w, legT:b0._bm.legT, home:b0._bm.home }); if (b0._bm.home && homeAt === null) homeAt = i; }
        if (homeAt === null) path.push([Math.round(b0.x*1000)/1000, Math.round(b0.y*1000)/1000]); }
    } finally { cobsNearest = CN; }
    return { path: path, turns: turns, homeAt: homeAt, p0: p0, w0: w0, spd: spd, T: T, n: bs.length, nearestCalls: nearestCalls, ended: b0.life <= 0, alive: alive, boss: [s.x, s.y], r: s.r };`);

  it('THE TURNS ARE NEVER AIMED: the same volley flies the same path, frame for frame, through all four legs whether the fighter stands still or runs through every line it flies', () => {
    const still = FLY(1);
    const runs = FLY(1, 'you.x = WW*0.5 + ((i*37) % 900) - 450; you.y = groundY() - you.r - ((i*11) % 260); you.vx = 0; you.vy = 0;');
    expect(still.turns.map((q) => q.n), 'it turned four times').toEqual([1, 2, 3, 4]);
    expect(still.path.length, 'four legs is a long way (and it is the whole of both paths)').toBeGreaterThan(100);
    expect(runs.path, 'a fighter running through its lines changes none of it: it never looks at where anyone stands').toEqual(still.path);
    expect(runs.turns.map((q) => q.f), 'and the turns come on the same frames').toEqual(still.turns.map((q) => q.f));
  });

  it('NOTHING LOOKS AT A FIGHTER: through the whole flight (all four turns) the nearest-fighter lookup is never made, at any tier', () => {
    for (const t of [1, 3, 5]) {
      const r = FLY(t, 'you.x = WW*0.5 + (i % 2 ? 300 : -300);');
      expect(r.turns.length, `tier ${t}: four turns`).toBe(4);
      expect(r.nearestCalls, `tier ${t}: no turn asks who is nearest`).toBe(0);
    }
  });

  it('EACH TURN IS STRAIGHT BACK ALONG ITS OWN LINE, WITH ITS ARC: the arc mirrors, every leg is the first leg\'s length, and it is back where it was thrown after the second and the fourth', () => {
    const r = FLY(2);
    expect(r.turns.slice(0, 3).map((q) => Math.sign(q.w)), 'the arc flips at each of the first three turns').toEqual([-Math.sign(r.w0), Math.sign(r.w0), -Math.sign(r.w0)]);
    expect(r.turns.slice(0, 3).every((q) => Math.abs(Math.abs(q.w) - Math.abs(r.w0)) < 1e-9), 'and is the same arc, mirrored').toBe(true);
    const f = r.turns.map((q) => q.f), legT = r.turns[0].legT;
    expect([f[1] - f[0], f[2] - f[1], f[3] - f[2]], 'every leg takes as long as the first (legT frames)').toEqual([legT, legT, legT]);
    const away = (q) => Math.hypot(q.x - r.p0[0], q.y - r.p0[1]);
    expect(away(r.turns[1]), 'after the second turn it is back at the spot it was thrown from (within a step or two)').toBeLessThanOrEqual(2*r.spd + 0.01);
    expect(away(r.turns[3]), 'and after the fourth').toBeLessThanOrEqual(2*r.spd + 0.01);
    expect(away(r.turns[0]), 'the first turn is out where the sight sent it, not at the thrower').toBeGreaterThan(200);
  });

  it('FOUR TURNS AT EVERY TIER, then it is sent home: the number of turns is the one the owner confirmed ("4 times"), n and the one id are as they were', () => {
    expect(W.eval('COBS_TIERS.boomerangs.map(function(T){ return T.turns; })'), '"4 times"').toEqual([4, 4, 4, 4, 4]);
    for (const t of [1, 2, 3, 4, 5]) {
      const r = FLY(t);
      expect(r.turns.map((q) => q.n), `tier ${t}: four turns`).toEqual([1, 2, 3, 4]);
      expect(r.turns.map((q) => q.home), `tier ${t}: the fourth is the one that sends it home`).toEqual([false, false, false, true]);
      expect(r.n, `tier ${t}: n boomerangs, as the tier says`).toBe(r.T.n);
    }
  });

  it('AFTER ITS LAST TURN IT STILL FLIES BACK TO HIS HAND: with him moved well away while it flew, it crosses the arena to him and is caught', () => {
    const r = FLY(3, '', 's.x += 500; s.y -= 120;');
    expect(r.homeAt, 'it was sent home').not.toBe(null);
    expect(r.ended, 'and it is gone').toBe(true);
    expect(Math.hypot(r.alive.x - r.boss[0], r.alive.y - r.boss[1]), 'caught: it was in his hand the last frame it flew (not run out of life far from him)').toBeLessThan(r.r*0.8 + 1e-6);
    expect(r.alive.life, 'with life to spare').toBeGreaterThan(2);
  });
});
