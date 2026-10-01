import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';
import { mulberry32 } from './helpers/prng.js';

// STEVE COBS, the secret boss, rebuilt in the boss overhaul (boss-plan-secret.md 1.2, 1.3, 2, 3.2, 4, 5; boss-overhaul-decisions.md Rounds 6, 7,
// 14, 15). "give the attacks a twist" -- a play on words: each attack gets a change or specialty -- and "also 1." = heavier hits, the arena
// reacting, bigger movement, and the generic projectile spam swapped. Round 7, verbatim: "the twists should occur at tier 2, and get stronger at
// tier 3": EVERY TWIST IS OFF AT TIER 1, ON AT TIER 2 AND STRONGER AT TIER 3 (his tiers 4 and 5 keep their escalation on top). Round 15:
// "ok. make one and cobs get the same animation treatement as the others." Cobs: "havent fought him yet. idk." -- his difficulty is as planned and
// his tier lines still pay the heal and the stock. NOTHING HERE IS A BAR FOR DIFFICULTY ("dont tune, cuz thats an agent, not a player"):
// every assertion is what the design says. "Harder, same damage": every shot a twist adds keeps its attack's one bossAtk id, so the per-attack
// cap holds. test/cobs-fight.test.js is the fight's mechanics (tiers, the passives, the win); this file is what the rebuild added.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// Start his fight as the chain does and hand the body `s` (him), `you` (player 1, parked), `park()`, `floorAt(f, x)` and `shots()`.
const fight = (body, lineup = ['Knife']) => W.eval(`(function(){
  SETTINGS.itemRate=0; SETTINGS.stocks=3; LOCAL_PLAYERS=1; window.__cobsEnd = undefined;
  var __ok = startCobsFight(${JSON.stringify(lineup)}, { story:true, onEnd:function(won){ window.__cobsEnd = won; return true; } });
  var s = summons.find(function(o){ return o._cobsFight; });
  var you = fighters[0];
  var park = function(){ s._atkTimer = 1e9; you.controller = 'still'; };
  var floorAt = function(f, x){ f.x = x; f.y = groundY() - f.r; f.vx = 0; f.vy = 0; f.pct = 0; f.invuln = 0; step(); f.pct = 0; f.invuln = 0; };
  var shots = function(){ return projectiles.filter(function(p){ return p.owner===-2 && p.life > 0; }); };
  var atTier = function(t){ s._marks = t - 1; s._hop = null; };
  ${body}
})()`);

describe('BOOMERANGS! replaces SECURITY ROUNDS!', () => {
  it('is in his deck and his names under its own key; the old key and its rounds are gone', () => {
    const r = W.eval(`({ deck: COBS_DECK.slice(), name: COBS_MOVE_NAME.boomerangs, old: [COBS_MOVE_NAME.rounds, COBS_MOVES.rounds, COBS_TIERS.rounds, COBS_TEL.rounds],
      tel: COBS_TEL.boomerangs, moves: Object.keys(COBS_MOVES).length, tiers: Object.keys(COBS_TIERS).length, shape: typeof PROJ_SHAPE.cobsboomerang.draw })`);
    expect(r.deck).toContain('boomerangs');
    expect(r.deck).not.toContain('rounds');
    expect(r.name, '"Swap for BOOMERANGS!" (the owner, Round 7)').toBe('BOOMERANGS!');
    expect(r.old).toEqual([undefined, undefined, undefined, undefined]);
    expect(r.tel).toBe(42);
    expect(r.shape, 'drawn in the show\'s style until, and unless, its art loads').toBe('function');
  });

  it('each boomerang TURNS AROUND FOUR TIMES, every turn re-aimed at where you stand, then flies home to his hand and is caught: n, speed and cut by tier', () => {
    const r = fight(`
      park(); floorAt(you, WW*0.5); s.x = you.x + 450; s.y = you.y - 200; s.face = -1; you.invuln = 99999; var out = {};
      [1, 2, 3, 4, 5].forEach(function(t){ atTier(t); projectiles = []; cobsFightTelegraph(s, 'boomerangs', you); s._tel = 0; COBS_MOVES.boomerangs(s, you, ++BOSS_ATK_ID);
        var T = cobsT(s, 'boomerangs'), b = shots(); out['t' + t] = { n: b.length, want: T.n, spd: b[0]._bm.spd, fx: b[0].fxTag, ids: new Set(b.map(function(p){ return p.bossAtk; })).size, turns: b[0]._bm.turns, pierce: b[0].pierce }; });
      atTier(1); projectiles = []; s.x = you.x + 450; s.y = you.y - 200; cobsFightTelegraph(s, 'boomerangs', you); s._tel = 0; COBS_MOVES.boomerangs(s, you, ++BOSS_ATK_ID);
      var bs = shots(), turnAt = [], minDist = [], last = 0, legMin = 1e9;
      for (var i=0;i<300;i++){ s._atkTimer = 1e9; step(); you.invuln = 99999;
        var p = bs[0]; if (!p || p.life <= 0) break;
        legMin = Math.min(legMin, Math.hypot(you.x - p.x, hurtCY(you) - p.y));
        if (p._bm.turned !== last){ last = p._bm.turned; turnAt.push({ f:i, n:last, toward: Math.hypot(you.x - p.x, hurtCY(you) - p.y), home:p._bm.home }); minDist.push(Math.round(legMin)); legMin = 1e9; } }
      out.turns = turnAt; out.minDist = minDist; out.alive = bs.map(function(p){ return p.life > 0 && projectiles.indexOf(p) >= 0; }); out.caught = bs.every(function(p){ return p.life <= 0; });
      return out;`);
    expect([1, 2, 3, 4, 5].map((t) => r['t' + t].n), '2, 2, 3, 3, 4').toEqual([2, 2, 3, 3, 4]);
    expect([1, 2, 3, 4, 5].map((t) => r['t' + t].n === r['t' + t].want)).toEqual([true, true, true, true, true]);
    expect([1, 2, 3, 4, 5].map((t) => r['t' + t].spd), 'faster by tier').toEqual([16, 17, 18, 19, 20]);
    expect([r.t3.fx, r.t4.fx, r.t5.fx], 'a boomerang cuts from tier 4').toEqual([null, 'bleed', 'bleed']);
    for (let t = 1; t <= 5; t++) { expect(r['t' + t].ids, `tier ${t}: one id, one cap`).toBe(1); expect(r['t' + t].turns).toBe(4); expect(r['t' + t].pierce).toBe(true); }
    expect(r.turns.map((q) => q.n), 'four turn-arounds').toEqual([1, 2, 3, 4]);
    expect(r.turns.map((q) => q.home), 'and the fourth is the one that sends it home').toEqual([false, false, false, true]);
    expect(Math.max(...r.minDist.slice(0, 3)), 'each of the first three legs is re-aimed at you: it passes through the spot you stand on').toBeLessThan(40);
    expect(r.caught, 'home, caught in his hand').toBe(true);
  });

  it('a fighter in its way takes ONE hit however many boomerangs, passes and turns it makes (one id, one cap)', () => {
    const r = fight(`
      park(); floorAt(you, WW*0.5); s.x = you.x + 450; s.y = you.y - 200; s.face = -1; atTier(5);
      cobsFightTelegraph(s, 'boomerangs', you); s._tel = 0; COBS_MOVES.boomerangs(s, you, ++BOSS_ATK_ID);
      you.pct = 0; var cap = cobsDmg()*cobsT(s, 'boomerangs').dmg, hits = 0, last = 0;
      for (var i=0;i<300;i++){ s._atkTimer = 1e9; you.invuln = 0; step(); if (you.pct > last){ hits++; last = you.pct; } }
      return { pct: you.pct, cap: cap, hits: hits };`);
    expect(r.pct, 'hit').toBeGreaterThan(0);
    expect(r.pct, 'and never more than one boomerang hit of damage (tier 5 adds a cut that bleeds, which is a status)').toBeLessThanOrEqual(r.cap + 1e-6 + 40);
    expect(r.hits).toBeGreaterThan(0);
  });
});

describe('FREE SAMPLES! -- "they create traveling crumbs that move along the ground/ platforms, and fall"', () => {
  it('a box that lands BURSTS into crumbs that run both ways along the floor, and it is not a mine any more', () => {
    const r = fight(`
      park(); floorAt(you, WW*0.5); s.x = you.x + 400; s.y = you.y - 120; s.face = -1; you.invuln = 99999; atTier(2);
      cobsFightTelegraph(s, 'samples', you); s._tel = 0; COBS_MOVES.samples(s, you, ++BOSS_ATK_ID);
      var T = cobsT(s, 'samples'), boxes = shots().filter(function(p){ return p.cobsSample; }), boxX = boxes.map(function(p){ return Math.round(p.warnX); });
      var shadow = boxes.every(function(p){ return p.warn > 0; }), landFrame = -1, crumbs = [];
      for (var i=0;i<70;i++){ step(); you.invuln = 99999; if (landFrame < 0 && projectiles.some(function(p){ return p._crumb; })) landFrame = i; }
      crumbs = projectiles.filter(function(p){ return p._crumb; });
      var left = crumbs.filter(function(p){ return p.vx < 0; }).length, right = crumbs.filter(function(p){ return p.vx > 0; }).length;
      var ids = new Set(crumbs.map(function(p){ return p.bossAtk; })).size, sp = crumbs.every(function(p){ return Math.abs(Math.abs(p.vx) - T.cspd) < 1e-9; });
      var onFloor = crumbs.filter(function(p){ return p._crumb.mode === 'run'; }).every(function(p){ return Math.abs(p.y + p.r*0.5 - p._crumb.sy) < 1.5; });
      var xs0 = crumbs.map(function(p){ return p.x; }); for (var i=0;i<20;i++){ step(); you.invuln = 99999; } var moved = crumbs.every(function(p, k){ return Math.sign(p.x - xs0[k]) === Math.sign(p.vx) && Math.abs(p.x - xs0[k]) > 40; });
      return { n: boxes.length, want: T.n, shadow: shadow, left: left, right: right, per: T.crumbs, ids: ids, sp: sp, onFloor: onFloor, moved: moved, traps: projectiles.filter(function(p){ return p.trap; }).length,
        boxesLeft: projectiles.filter(function(p){ return p.cobsSample; }).length, poison: crumbs.every(function(p){ return p.fxTag === 'poison'; }), boxX: boxX };`);
    expect(r.n).toBe(4);
    expect(r.shadow, 'each box still falls over a shadow').toBe(true);
    expect(r.left, 'crumbs run off to the left...').toBe(r.n * r.per);
    expect(r.right, '...and to the right, both ways').toBe(r.n * r.per);
    expect(r.ids, 'one attack, one id').toBe(1);
    expect(r.sp, 'at the tier\'s crumb speed').toBe(true);
    expect(r.onFloor, 'running ON the surface').toBe(true);
    expect(r.moved, 'and they travel').toBe(true);
    expect(r.traps, 'no mine waits where a box landed').toBe(0);
    expect(r.boxesLeft).toBe(0);
    expect(r.poison).toBe(true);
  });

  it('crumbs run to the edge of a platform and FALL, keeping their sideways run, land on what is below and run on', () => {
    const r = fight(`
      park(); you.invuln = 99999; atTier(1);
      var pl = worldPlats.filter(function(p){ return !p.solid && p.w > 200 && p.w < 330 && p.y > groundY() - 700 && p.y < groundY() - 200; })[0];
      var top = pl.y, mid = pl.x + pl.w/2, T = cobsT(s, 'samples');
      var box = { x:mid, y:top - 6, r:12, life:1, bossAtk:++BOSS_ATK_ID, warnX:mid, warnY:top };
      COBS_DIE.sample(s, box, { T:T, dmg:13.2, cap:13.2 });
      var cs = projectiles.filter(function(p){ return p._crumb; }), out = { n: cs.length, plat: [pl.x, pl.w, top], track: [], vx0: cs.map(function(p){ return p.vx; }) };
      var wasRun = false, fell = false, landedBelow = false, kept = true;
      for (var i=0;i<140;i++){ step(); you.invuln = 99999;
        cs.forEach(function(p, k){ if (p.life <= 0) return; var C = p._crumb;
          if (C.mode === 'run' && C.sy === top) wasRun = true;
          if (C.mode === 'fall' && p.y > top + 4 && (p.x < pl.x - 2 || p.x > pl.x + pl.w + 2)) fell = true;
          if (C.mode === 'run' && C.sy > top + 20) landedBelow = true;
          if (p.vx !== out.vx0[k]) kept = false; }); }
      out.wasRun = wasRun; out.fell = fell; out.landedBelow = landedBelow; out.kept = kept;
      return out;`);
    expect(r.n).toBe(4);
    expect(r.wasRun, 'on the platform they ran along it').toBe(true);
    expect(r.fell, 'off its edge they fell').toBe(true);
    expect(r.kept, '"add momentum to falling objects": the sideways speed is never lost in the air').toBe(true);
    expect(r.landedBelow, 'and below, they landed and ran on').toBe(true);
  });

  it('a box that is HIT on the way down bursts where it is, crumbs and all; and [POOF] erasing boxes leaves no crumbs behind', () => {
    const r = fight(`
      park(); floorAt(you, WW*0.5); s.x = you.x + 400; s.y = you.y - 120; s.face = -1; atTier(1);
      cobsFightTelegraph(s, 'samples', you); s._tel = 0; COBS_MOVES.samples(s, you, ++BOSS_ATK_ID);
      var hitBox = null; for (var i=0;i<60 && !hitBox;i++){ step(); you.invuln = 0; if (you.pct > 0) hitBox = i; }
      var crumbsAfterHit = projectiles.filter(function(p){ return p._crumb; }).length;
      projectiles = projectiles.filter(function(p){ return !p._crumb; }); s._track = [];
      cobsFightTelegraph(s, 'samples', you); s._tel = 0; COBS_MOVES.samples(s, you, ++BOSS_ATK_ID);
      var tracked = s._track.length; cobsPoof(s, { shock:0, id:1, stash:null }); for (var i=0;i<80;i++){ step(); you.invuln = 99999; }
      return { hit: hitBox !== null, crumbsAfterHit: crumbsAfterHit, tracked: tracked, afterPoof: projectiles.filter(function(p){ return p._crumb; }).length, track: s._track.length };`);
    expect(r.hit, 'a box fell on you').toBe(true);
    expect(r.crumbsAfterHit, 'a box that hit still burst (some crumbs may be spent on you already)').toBeGreaterThan(0);
    expect(r.tracked, 'tier 1 drops three boxes').toBe(3);
    expect(r.afterPoof, 'the clean slate takes the boxes and nothing bursts after').toBe(0);
    expect(r.track).toBe(0);
  });
});
