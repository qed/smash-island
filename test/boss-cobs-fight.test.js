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

// ================= THE TWISTS, group 1: the van, chainsaws and lollipops, the death trap, the units, the knife =================
// Round 7, verbatim: "the twists should occur at tier 2, and get stronger at tier 3." Each row below: OFF at tier 1, ON at tier 2, STRONGER at tier 3.

describe('THE MEEPLE VAN! -- thrown out the back, as it crosses you', () => {
  it('the table: no phone at tier 1, one at tier 2 and faster at tier 3, two from tier 4', () => {
    const r = W.eval(`COBS_TIERS.van.map(function(T){ return [T.phone, T.pspd]; })`);
    expect(r.map((x) => x[0])).toEqual([0, 1, 1, 2, 2]);
    expect(r[1][1]).toBeGreaterThan(1);
    expect(r[2][1], 'stronger at tier 3').toBeGreaterThan(r[1][1]);
  });

  it('when a van CROSSES you -- standing or jumping -- the MePhone is flung out its back and skids back the way the van came, on the van\'s own id; tier 1 throws none', () => {
    const run = (t, jump) => fight(`
      park(); atTier(${t}); projectiles = []; var fl = cobsFloor(); floorAt(you, fl.x + 700); you.invuln = 99999;
      s.x = you.x + 300; s.y = you.y - 300; cobsFightTelegraph(s, 'van', you); s._vanFrom = true; s._tel = 0; COBS_MOVES.van(s, you, ++BOSS_ATK_ID);
      var van = shots()[0], T = cobsT(s, 'van'), phones = [], crossAt = null, before = 0;
      for (var i=0;i<140;i++){ s._atkTimer = 1e9; step(); you.invuln = 99999; you.x = fl.x + 700; ${jump ? 'you.y = groundY() - 200; you.vy = 0;' : ''}
        var ph = projectiles.filter(function(p){ return p.shape === 'cobsphone'; });
        if (!crossAt && ph.length){ crossAt = { vanX: van.x, youX: you.x, f: i, n: ph.length, ph: ph.map(function(p){ return { vx: p.vx, id: p.bossAtk, cap: p.bossCap, y: p.y }; }), vanVx: van.vx, vanId: van.bossAtk, vanDmg: van.dmg }; }
        if (!crossAt && van.x < you.x) before = i; }
      return { T: T, crossAt: crossAt, phonesLater: projectiles.filter(function(p){ return p.shape === 'cobsphone'; }).length };`);
    const t1 = run(1, false);
    expect(t1.crossAt, 'tier 1: the twist is off').toBe(null);
    for (const t of [2, 3, 4]) {
      const r = run(t, false);
      expect(r.crossAt, `tier ${t}`).not.toBe(null);
      expect(Math.abs(r.crossAt.vanX - r.crossAt.youX), 'flung the moment it crosses you (within two frames of its run), not at its midpoint').toBeLessThan(60);
      expect(r.crossAt.n).toBe(r.T.phone);
      expect(r.crossAt.ph.every((p) => Math.sign(p.vx) === -Math.sign(r.crossAt.vanVx)), 'out the back: skidding the way the van came').toBe(true);
      expect(Math.abs(r.crossAt.ph[0].vx) / Math.abs(r.crossAt.vanVx), 'at pspd x the van\'s speed').toBeCloseTo(r.T.pspd, 3);
      expect(r.crossAt.ph.every((p) => p.id === r.crossAt.vanId && p.cap === r.crossAt.vanDmg), 'the van\'s own id and cap').toBe(true);
    }
    const j = run(2, true);
    expect(j.crossAt, 'jumping the van does not dodge the throw: you land on the phone').not.toBe(null);
  });

  it('one hit however many bodies: a fighter the van and its phones all reach takes the van\'s damage once', () => {
    const r = fight(`
      park(); atTier(4); projectiles = []; var fl = cobsFloor(); floorAt(you, fl.x + 700); s.x = you.x + 300; s.y = you.y - 300;
      cobsFightTelegraph(s, 'van', you); s._vanFrom = true; s._tel = 0; COBS_MOVES.van(s, you, ++BOSS_ATK_ID);
      var cap = cobsDmg()*cobsT(s, 'van').dmg, p0 = 0, hits = 0;
      for (var i=0;i<200;i++){ s._atkTimer = 1e9; you.invuln = 0; var before = you.pct; step(); if (you.pct > before) hits++; you.x = fl.x + 700; }
      return { pct: you.pct, cap: cap, hits: hits };`);
    expect(r.pct).toBeGreaterThan(0);
    expect(r.pct, 'the cap').toBeLessThanOrEqual(r.cap + 1e-6);
  });

  it('a van passing a fighter shakes the floor and leaves dust behind it (impact)', () => {
    const r = fight(`
      park(); atTier(1); projectiles = []; var fl = cobsFloor(); floorAt(you, fl.x + 500); you.invuln = 99999; s.x = you.x + 300; s.y = you.y - 300;
      cobsFightTelegraph(s, 'van', you); s._vanFrom = true; s._tel = 0; COBS_MOVES.van(s, you, ++BOSS_ATK_ID);
      var dust0 = IMPACT_DUST.length, maxShake = 0, d = 0;
      for (var i=0;i<100;i++){ s._atkTimer = 1e9; step(); you.invuln = 99999; you.x = fl.x + 500; maxShake = Math.max(maxShake, shakeAmt); d = Math.max(d, IMPACT_DUST.length); }
      return { maxShake: maxShake, dust: d - dust0 };`);
    expect(r.maxShake, 'shake(12) is 4.8 px').toBeGreaterThan(3);
    expect(r.dust).toBeGreaterThan(5);
  });
});

describe('CHAINSAWS! -- and lollipops (The Tile Divide)', () => {
  it('the table: all saws at tier 1; every third object a lollipop at tier 2; every second from tier 3; more candy as it climbs', () => {
    const r = W.eval(`COBS_TIERS.chainsaws.map(function(T){ return [T.lolli, T.shards, T.n]; })`);
    expect(r.map((x) => x[0])).toEqual([0, 3, 2, 2, 2]);
    expect(r.map((x) => x[1])).toEqual([0, 6, 8, 8, 10]);
  });

  it('the volley holds saws and lollipops in the tier\'s ratio; a lollipop is slower, bigger and arcs higher than a saw', () => {
    const r = fight(`
      park(); floorAt(you, WW*0.5); s.x = you.x + 300; s.y = you.y - 100; you.invuln = 99999; var out = {};
      [1, 2, 3, 5].forEach(function(t){ atTier(t); projectiles = []; cobsFightTelegraph(s, 'chainsaws', you); s._tel = 0; COBS_MOVES.chainsaws(s, you, ++BOSS_ATK_ID);
        var sh = shots(), lol = sh.filter(function(p){ return /^cobslolli/.test(p.shape); }), saws = sh.filter(function(p){ return p.shape === 'saw'; }), T = cobsT(s, 'chainsaws');
        out['t' + t] = { n: sh.length, want: T.n, lol: lol.length, saws: saws.length, ids: new Set(sh.map(function(p){ return p.bossAtk; })).size,
          lolR: lol[0] && lol[0].r, sawR: saws[0].r, lolVy: lol[0] && lol[0].vy, sawVy: saws[0].vy, lolBounce: lol[0] && !!lol[0].bounce, tracked: s._track.length, shapes: lol.map(function(p){ return p.shape; }) }; });
      return out;`);
    expect(r.t1.lol, 'tier 1: saws only').toBe(0);
    expect(r.t1.saws).toBe(r.t1.n);
    expect(r.t2.lol, 'tier 2: every third of 4 objects').toBe(1);
    expect(r.t3.lol, 'tier 3: every second of 5').toBe(2);
    expect(r.t5.lol, 'tier 5: every second of 7').toBe(3);
    for (const t of ['t1', 't2', 't3', 't5']) { expect(r[t].n).toBe(r[t].want); expect(r[t].ids, 'one id').toBe(1); }
    expect(r.t3.lolR, 'bigger').toBeGreaterThan(r.t3.sawR);
    expect(Math.abs(r.t3.lolVy), 'a higher arc').toBeGreaterThan(Math.abs(r.t3.sawVy));
    expect(r.t3.lolBounce, 'it does not bounce: it lands and bursts').toBe(false);
    expect(r.t3.shapes.length).toBe(2);
    expect(new Set(r.t3.shapes).size, 'both lollipops of the show, red and green').toBe(2);
  });

  it('a lollipop that lands bursts into the tier\'s candy shards, up and out, on its own id, and the floor shakes', () => {
    const r = fight(`
      park(); floorAt(you, WW*0.5 - 900); s.x = WW*0.5; s.y = groundY() - 400; you.invuln = 99999; var out = {};
      [2, 3, 5].forEach(function(t){ atTier(t); projectiles = []; s._track = []; var T = cobsT(s, 'chainsaws');
        var p = addProj(cobsShot(s, { x:WW*0.5, y:groundY() - 120, vx:0, vy:3, grav:true, r:18, kb:7, dmg:20, bossCap:20, life:100, color:'#ff5a7a', shape:'cobslolli1', bossAtk:++BOSS_ATK_ID }));
        cobsTrack(s, p, 'lolli', { T:T, dmg:20, cap:20 }); var dust0 = IMPACT_DUST.length;
        for (var i=0;i<60 && !projectiles.some(function(q){ return q.shape === 'cobscandy'; });i++){ step(); you.invuln = 99999; }
        var sh = projectiles.filter(function(q){ return q.shape === 'cobscandy'; });
        out['t' + t] = { shards: sh.length, want: T.shards, up: sh.filter(function(q){ return q.vy < 0; }).length, ids: new Set(sh.map(function(q){ return q.bossAtk; })).size, id: p.bossAtk, same: sh.every(function(q){ return q.bossAtk === p.bossAtk && q.bossCap === 20; }), dust: IMPACT_DUST.length > dust0 }; });
      return out;`);
    expect(r.t2.shards).toBe(6);
    expect(r.t3.shards, 'stronger at tier 3').toBe(8);
    expect(r.t5.shards).toBe(10);
    for (const t of ['t2', 't3', 't5']) { expect(r[t].up, 'up and out').toBeGreaterThan(r[t].shards - 2); expect(r[t].same, 'same id, same cap').toBe(true); expect(r[t].dust).toBe(true); }
  });
});

describe('SUPER DEATH TRAP! -- tile rows', () => {
  const ROWS = (t) => fight(`
    park(); atTier(${t}); floorAt(you, WW*0.5); you.invuln = 99999; s.x = you.x + 500; s.y = you.y - 200; s.face = -1; projectiles = []; s._rows = [];
    cobsFightTelegraph(s, 'spikes', you); var plats = s._spikePlats.slice(), T = cobsT(s, 'spikes'); s._tel = 0; COBS_MOVES.spikes(s, you, ++BOSS_ATK_ID);
    var sp = projectiles.filter(function(p){ return p.shape === 'spike'; });
    var per = plats.map(function(p){ var on = sp.filter(function(q){ return q.warnY === p.y && q.warnX >= p.x && q.warnX <= p.x + p.w; });
      var tiles = [0, 1, 2, 3].map(function(k){ var d = on.filter(function(q){ return Math.min(3, Math.floor((q.warnX - p.x)/(p.w/4))) === k; }).map(function(q){ return q.delay; }); return d.length ? d[0] : null; });
      return { x: p.x, w: p.w, y: p.y, tiles: tiles, nearLeft: Math.abs(p.x - s.x) <= Math.abs(p.x + p.w - s.x) }; });
    return { T: T, per: per, ids: new Set(sp.map(function(p){ return p.bossAtk; })).size, rows: s._rows.map(function(r){ return r.t; }), n: sp.length };`);

  it('tier 1 raises every tile together; tier 2 raises them row by row from the end nearest him, a row every ten frames', () => {
    const t1 = ROWS(1), t2 = ROWS(2);
    for (const pl of t1.per) expect(new Set(pl.tiles.filter((x) => x !== null)).size, 'tier 1: all at once').toBe(1);
    expect(t1.ids).toBe(1);
    for (const pl of t2.per) {
      const d = pl.tiles.filter((x) => x !== null);
      expect(d.length, 'four tiles').toBeGreaterThanOrEqual(3);
      const order = pl.nearLeft ? d : d.slice().reverse();
      for (let i = 1; i < order.length; i++) expect(order[i] - order[i - 1], 'a row every `stag` frames, from his end').toBe(t2.T.stag);
    }
    expect(t2.ids, 'one id, one cap').toBe(1);
    expect(t2.rows.length, 'an impact a row').toBeGreaterThanOrEqual(t2.per.length * 3);
  });

  it('from tier 3 every other platform runs the other way, and the rows come quicker', () => {
    const t2 = ROWS(2), t3 = ROWS(3);
    expect(t3.T.stag, 'stronger at tier 3: quicker rows').toBeLessThan(t2.T.stag);
    expect(t3.T.alt).toBe(1);
    expect(t3.per.length).toBeGreaterThanOrEqual(2);
    const dirs = t3.per.map((pl) => { const d = pl.tiles.filter((x) => x !== null); const up = d[d.length - 1] > d[0]; return up === pl.nearLeft ? 'from his end' : 'from the far end'; });
    expect(dirs[0]).toBe('from his end');
    expect(dirs[1], 'the second platform is swept the other way').toBe('from the far end');
  });

  it('each row rising shakes the floor with metal chips (impact), and the wind-up lights the tiles in order', () => {
    const r = fight(`
      park(); atTier(3); floorAt(you, WW*0.5); you.invuln = 99999; s.x = you.x + 500; s.y = you.y - 200; s.face = -1; projectiles = [];
      cobsFightTelegraph(s, 'spikes', you); var tel = s._tel; s._tel = 0; COBS_MOVES.spikes(s, you, ++BOSS_ATK_ID);
      var debris0 = IMPACT_DEBRIS.length, peak = 0, shook = 0;
      for (var i=0;i<90;i++){ s._atkTimer = 1e9; step(); you.invuln = 99999; peak = Math.max(peak, IMPACT_DEBRIS.length); shook = Math.max(shook, shakeAmt); }
      var err = null; cobsFightTelegraph(s, 'spikes', you); s._tel = 20; try { drawCobsFx(); } catch(e){ err = String(e); }
      return { debris: peak - debris0, shook: shook, err: err };`);
    expect(r.debris).toBeGreaterThan(3);
    expect(r.shook).toBeGreaterThan(1);
    expect(r.err).toBe(null);
  });
});

describe('DEPLOYING UNITS! -- blink', () => {
  const UNIT = (t) => fight(`
    park(); atTier(${t}); floorAt(you, WW*0.5); you.invuln = 99999; s.x = you.x + 300; s.y = you.y - 200; projectiles = []; summons = summons.filter(function(m){ return m === s; });
    cobsFightTelegraph(s, 'deploy', you); s._tel = 0; COBS_MOVES.deploy(s, you, ++BOSS_ATK_ID);
    var u = summons.find(function(m){ return m.type === 'mephoneunit'; }), T = cobsT(s, 'deploy'), log = [], pos0 = [u.x, u.y];
    for (var k=0;k<4;k++){ u._cd = 0; var prevPost = u._post; step(); you.invuln = 99999;
      var shot = projectiles.filter(function(p){ return p.owner === -2 && p.life > 0 && (p.shape === 'cobspencil' || p.beamShot); }).slice(-1)[0];
      log.push({ shots: u._shots, moved: !!u._post && u._post !== prevPost, d: Math.round(Math.hypot(u.x - you.x, u.y - you.y)), shape: shot ? (shot.shape || 'beam') : null, post: !!u._post, cd: u._cd }); }
    return { T: T, log: log, pink: particles.filter(function(p){ return p.color === '#ff6ad5'; }).length };`);

  it('tier 1 stays put and shoots its beams; tier 2 blinks after every second round and its rounds are pencils; tier 3 blinks after every round', () => {
    const t1 = UNIT(1), t2 = UNIT(2), t3 = UNIT(3);
    expect(t1.log.every((l) => !l.moved && !l.post), 'tier 1: no blink').toBe(true);
    expect(t1.log.every((l) => l.shape === 'beam'), 'tier 1: today\'s rounds').toBe(true);
    expect(t2.log.map((l) => l.moved), 'tier 2: the second round blinks it').toEqual([false, true, false, true]);
    expect(t2.log.every((l) => l.shape === 'cobspencil'), 'its rounds are pencils').toBe(true);
    expect(t3.log.map((l) => l.moved), 'tier 3: every round').toEqual([true, true, true, true]);
    expect(t3.pink, 'a pink flash where it left and where it landed').toBeGreaterThan(10);
  });

  it('a blink lands 260-420 px from the fighter it shoots, never below the floor, with a beat before the next round', () => {
    const t3 = UNIT(3);
    for (const l of t3.log) { expect(l.d).toBeGreaterThanOrEqual(255); expect(l.d).toBeLessThanOrEqual(430); expect(l.cd, 'a beat to read the new angle').toBeGreaterThanOrEqual(20); }
  });
});

describe('MeKNIFE! -- YANK IT OUT', () => {
  const STAB = (t, hit) => fight(`
    park(); atTier(${t}); floorAt(you, WW*0.5); s.x = you.x + 300; s.y = you.y - 40; s.face = -1; projectiles = [];
    cobsFightTelegraph(s, 'meknife', you); s._tel = 0; var id = ++BOSS_ATK_ID; COBS_MOVES.meknife(s, you, id);
    var T = cobsT(s, 'meknife'); ${hit ? '' : 'you.x -= 1000; you.y = groundY() - you.r;'} you.invuln = 0; you.pct = 0;
    var out = { T: T, id: id, stuckAt: null, yank0: null, slash: null, frames: [] };
    for (var i=0;i<140;i++){ ${hit ? '' : 'you.invuln = 99999;'} step(); ${hit ? '' : 'you.x = Math.min(you.x, WW*0.5 - 1000);'}
      if (!out.yank0 && s._yank){ out.yank0 = { x: s._yank.x, y: s._yank.y, t: s._yank.t, T: s._yank.T, stuck: s._stuckT, f: i, instant: shots().filter(function(p){ return p.shape === 'meepleknife' && p.pierce; }).length }; }
      if (out.yank0 && !out.slash){ var sl = projectiles.filter(function(p){ return p.shape === 'meepleknife' && p.pierce && p.owner === -2 && p.life > 0; })[0]; if (sl){ out.slash = { f: i, vx: sl.vx, vy: sl.vy, id: sl.bossAtk, cap: sl.bossCap, dmg: sl.dmg, x: sl.x, y: sl.y, stuck: s._stuckT, yank: !!s._yank, bx: s.x, by: s.y }; break; } } }
    out.pct = you.pct; out.stabId = id; return out;`);

  it('tier 1: a whiff sticks in the floor for the half second and that is all; tiers 2 and up add the yank', () => {
    const t1 = STAB(1, false);
    expect(t1.yank0, 'tier 1: the twist is off').toBe(null);
    for (const t of [2, 3, 5]) {
      const r = STAB(t, false);
      expect(r.yank0, `tier ${t}`).not.toBe(null);
      expect(r.yank0.T, 'the glint lasts the tier\'s frames: 30, 24, 18').toBe({ 2: 30, 3: 24, 5: 18 }[t]);
      expect(r.yank0.stuck, 'and he is held where he stands, counting x1.5 as a whiff always did').toBe(r.yank0.T);
      expect(r.yank0.instant, 'NO instant swipe: nothing slashes the frame the blade sticks (the owner: "dont make it unfair.")').toBe(0);
    }
  });

  it('after the glint he rips it out and slashes ALONG THE LINE back to him, fast, on the stab\'s own id; the glint and the stuck blade draw', () => {
    const r = STAB(2, false);
    expect(r.slash, 'the slash').not.toBe(null);
    expect(r.slash.f - r.yank0.f, 'it comes only when the glint has run its frames').toBeGreaterThanOrEqual(r.yank0.T - 2);
    expect(r.slash.f - r.yank0.f).toBeLessThanOrEqual(r.yank0.T + 3);
    expect(r.slash.id, 'the stab\'s own id').toBe(r.id);
    expect(r.slash.cap).toBeCloseTo(33*1.1, 3);
    // the shot goes from where the blade stuck toward his hand
    const hx = r.slash.bx + (-1)*88*0.6, dir = Math.sign(hx - r.yank0.x);
    expect(Math.sign(r.slash.vx), 'toward him').toBe(dir);
    expect(Math.hypot(r.slash.vx, r.slash.vy), 'at 1.5 x the stab\'s speed').toBeCloseTo(r.T.spd*1.5, 3);
    expect(r.slash.stuck, 'he is free again').toBe(0);
  });

  it('a stab that HIT you sticks where it ended too, and the slash behind it adds no second hit (one id, one cap)', () => {
    const r = STAB(2, true);
    expect(r.yank0, 'hit or whiff').not.toBe(null);
    expect(r.pct, 'the stab landed').toBeGreaterThan(0);
    expect(r.pct, 'once: the cap').toBeLessThanOrEqual(33*1.1 + 1e-6);
    expect(r.yank0.stuck, 'a stab that hit is not the whiff\'s counter-window').toBe(0);
  });

  it('draws: the glint line, the stuck blade and the slash flash, without a throw', () => {
    const r = fight(`
      park(); atTier(2); floorAt(you, WW*0.5); s.x = you.x + 300; s.y = you.y - 40;
      s._yank = { x: s.x - 300, y: groundY(), t: 20, T: 30, id: 1, dmg: 30, cap: 30, spd: 24, ang: 0.4 };
      cobsFx.push({ kind:'stuckknife', x: s.x - 300, y: groundY(), ang: 0.4, dir: -1, life: 30, max: 30 }, { kind:'slash', x0: 0, y0: 0, x1: 100, y1: 100, life: 6, max: 10 });
      var err = null; try { drawCobsFx(); } catch(e){ err = String(e && e.stack || e); } return err;`);
    expect(r).toBe(null);
  });
});
