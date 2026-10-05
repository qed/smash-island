import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';
import { mulberry32 } from './helpers/prng.js';
import { bootValidating } from './helpers/validating-canvas.js';

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
// Every fight starts from the same dice (the window's one random stream would otherwise be wherever the tests before it left it, and an
// orbit that flips a few frames earlier is a different average): a test's result never depends on which tests ran before it.
const fight = (body, lineup = ['Knife']) => { W.Math.random = mulberry32(5); return W.eval(`(function(){
  SETTINGS.itemRate=0; SETTINGS.stocks=3; LOCAL_PLAYERS=1; window.__cobsEnd = undefined;
  var __ok = startCobsFight(${JSON.stringify(lineup)}, { story:true, onEnd:function(won){ window.__cobsEnd = won; return true; } });
  var s = summons.find(function(o){ return o._cobsFight; });
  s._hop = null;   // (the opening hop off the top is tested on its own: a test that places him itself starts with him home)
  var you = fighters[0];
  var park = function(){ s._atkTimer = 1e9; you.controller = 'still'; };
  var floorAt = function(f, x){ f.x = x; f.y = groundY() - f.r; f.vx = 0; f.vy = 0; f.pct = 0; f.invuln = 0; step(); f.pct = 0; f.invuln = 0; };
  var shots = function(){ return projectiles.filter(function(p){ return p.owner===-2 && p.life > 0; }); };
  var atTier = function(t){ s._marks = t - 1; s._hop = null; };
  ${body}
})()`); };

describe('Round 7: EVERY TWIST IS OFF AT TIER 1, ON AT TIER 2 AND STRONGER AT TIER 3', () => {
  // [attack, field, which way is stronger]: 'up' = a bigger number is stronger; 'down' = a smaller one is (a quicker beat, a shorter wait)
  const TWISTS = [
    ['van', 'phone', 'up'], ['van', 'pspd', 'up'], ['chainsaws', 'lolli', 'down'], ['chainsaws', 'shards', 'up'], ['spikes', 'stag', 'down'], ['spikes', 'alt', 'up'],
    ['deploy', 'blink', 'down'], ['deploy', 'pencil', 'up'], ['meknife', 'yank', 'up'], ['meknife', 'glint', 'down'], ['hands', 'rows2', 'up'], ['hands', 'rowDy', 'up'],
    ['deletion', 'trail', 'up'], ['deletion', 'trailDmg', 'up'], ['device', 'pincer', 'up'], ['device', 'pgap', 'down'],
    ['springs', 'retract', 'up'], ['springs', 'reach', 'up'], ['memurder', 'track', 'up'], ['kernelpop', 'chain', 'down'], ['ticktock', 'bend', 'up'], ['plug', 'wave', 'down'],
    ['keynote', 'cresc', 'up'], ['keynote', 'fin3', 'up'], ['metags', 'link', 'up'], ['metags', 'linkW', 'up'], ['cannon', 'rock', 'up'],
  ];
  // THE OWNER'S TUNING, 2026-10-05 ("some of cob's attacks are too easy, some too hard"): twists the owner moved to TIER 1 override the usual "twists from tier 2".
  // PORTAL: "two from the start" -- the pull is on from tier 1 (and twice as strong, reaching farther).
  const OWNER_TIER1 = [['portal', 'pull', 'up'], ['portal', 'pullR', 'up']];
  it('OWNER: the twists he moved to tier 1 are ON at tier 1, never weaker as the tiers climb, and stronger by tier 3 (PORTAL\'s pull: "two from the start")', () => {
    const rows = W.eval('COBS_TIERS');
    for (const [k, f, dir] of OWNER_TIER1) {
      const v = rows[k].map((T) => T[f]);
      expect(v[0], `${k}.${f} is ON at tier 1 (the owner moved it there)`).toBeGreaterThan(0);
      const better = (x, y) => (dir === 'up' ? x >= y : x <= y);
      for (let i = 1; i < 5; i++) expect(better(v[i], v[i - 1]), `${k}.${f} never weakens (${v})`).toBe(true);
      expect(v[2], `${k}.${f} is stronger by tier 3 (${v})`).toBeGreaterThan(v[1]);
    }
  });
  it('every twist is 0 at tier 1, set at tier 2 and stronger at tier 3, and never weakens at tiers 4 and 5; sixteen attacks carry one in their table (the other two are his passives; the owner moved PORTAL\'s to tier 1)', () => {
    const rows = W.eval('COBS_TIERS');
    const byAttack = {}; for (const [k, f, dir] of TWISTS) (byAttack[k] = byAttack[k] || []).push([f, dir]);
    for (const [k, f, dir] of TWISTS) {
      const v = rows[k].map((T) => T[f]);
      expect(v[0], `${k}.${f} is OFF at tier 1`).toBe(0);
      const better = (x, y) => (dir === 'up' ? x >= y : x <= y);   // x is at least as strong as y
      expect(better(v[2], v[1]), `${k}.${f} is no weaker at tier 3 (${v})`).toBe(true);
      expect(better(v[3], v[2]) && better(v[4], v[3]), `${k}.${f} never weakens again (${v})`).toBe(true);
    }
    for (const k of Object.keys(byAttack)) {
      // ON at tier 2 (a field that only helps you read it, pgap, does not count), and stronger at tier 3 in something
      expect(byAttack[k].some(([f]) => f !== 'pgap' && rows[k][1][f] > 0), `${k}: the twist is ON at tier 2`).toBe(true);
      expect(byAttack[k].some(([f, dir]) => (dir === 'up' ? rows[k][2][f] > rows[k][1][f] : rows[k][2][f] < rows[k][1][f])), `${k}: tier 3 is stronger than tier 2 in something`).toBe(true);
    }
    expect(Object.keys(byAttack).concat([...new Set(OWNER_TIER1.map((x) => x[0]))]), 'seventeen attacks carry a table twist (sixteen here, PORTAL\'s in the owner\'s tier-1 list); the other two are his passives (rage on foot, Popping Point)').toHaveLength(17);
  });

  it('the two passive twists wait for their own lines: the rage on foot fights low only while he rages, and the ring only below 20% (tier 5)', () => {
    const r = W.eval(`({ ring: COBS_POP_RING, hp: COBS_POP_HP, tierAtHp: Math.min(COBS_TIER_MAX, 1 + Math.floor((2500 - 2500*COBS_POP_HP)/COBS_PHASE_HP)), speech: COBS_SPEECH_HP, foot: COBS_FOOT })`);
    expect(r.hp).toBe(0.2);
    expect(r.tierAtHp, 'under 20% he is at tier 5: the ring is a tier-5 thing').toBe(5);
    expect(r.speech, 'the rage is at 60%, a tier-3 line').toBe(0.6);
    expect(r.ring).toBeGreaterThanOrEqual(6);
  });
});

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
      var onFloor = crumbs.filter(function(p){ return p.phase === 'drive'; }).every(function(p){ return Math.abs(p.y + p.r - p.rideTop) < 1.5; });   // (the van's riding: its centre one radius over the surface it rides)
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

  // THE OWNER, 2026-10-05 ("i hardly notice these 3"): "remove the crumbs chasing thing, they should just have the thing like the van where they ride off platforms."
  // The crumbs used to drop off an edge on an arc, keeping their run in the air; now they ride the way the van does (vanDrive, `drive:'roll'`): along the surface,
  // STRAIGHT down off its edge, onto what is below, and on the same way. test/cobs-tune.test.js has the rest of it (no chasing, the wall, the van's own code).
  it('crumbs RIDE like the van: along a platform to its edge, STRAIGHT off it onto what is below, and on the same way (the owner: "like the van where they ride off platforms")', () => {
    const r = fight(`
      park(); you.invuln = 99999; atTier(1);
      var pl = worldPlats.filter(function(p){ return !p.solid && p.w > 200 && p.w < 330 && p.y > groundY() - 700 && p.y < groundY() - 200; })[0];
      var top = pl.y, mid = pl.x + pl.w/2, T = cobsT(s, 'samples');
      var box = { x:mid, y:top - 6, r:12, life:1, bossAtk:++BOSS_ATK_ID, warnX:mid, warnY:top };
      COBS_DIE.sample(s, box, { T:T, dmg:13.2, cap:13.2 });
      var cs = projectiles.filter(function(p){ return p._crumb; }), out = { n: cs.length, plat: [pl.x, pl.w, top], vx0: cs.map(function(p){ return p.vx; }) };
      var wasRun = false, fell = false, straight = true, landedBelow = false, sameWay = true;
      for (var i=0;i<140;i++){ step(); you.invuln = 99999;
        cs.forEach(function(p, k){ if (p.life <= 0) return;
          if (p.phase === 'drive' && p.rideTop === top) wasRun = true;
          if (p.phase === 'fall'){ fell = true; if (p.vx !== 0) straight = false; }
          if (p.phase === 'drive' && p.rideTop > top + 20){ landedBelow = true; if (p.vx !== out.vx0[k]) sameWay = false; } }); }
      out.wasRun = wasRun; out.fell = fell; out.straight = straight; out.landedBelow = landedBelow; out.sameWay = sameWay;
      return out;`);
    expect(r.n).toBe(4);
    expect(r.wasRun, 'on the platform they ran along it').toBe(true);
    expect(r.fell, 'off its edge they fell').toBe(true);
    expect(r.straight, 'straight down, as the van\'s roller falls: no sideways run in the air').toBe(true);
    expect(r.landedBelow, 'and below, they landed and rode on').toBe(true);
    expect(r.sameWay, 'the way they were going: the van\'s driveVx comes back on landing').toBe(true);
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

// ================= THE TWISTS, group 2: my own hands, the electric trail, the pincer, the vortex pull, the retract =================

describe('MY OWN HANDS! -- two rows, marked', () => {
  const HANDS = (t, up) => fight(`
    park(); atTier(${t}); floorAt(you, WW*0.5); you.invuln = 99999; ${up ? 'you.y = groundY() - 400; you.vy = 0; you.onground = false;' : ''} s.x = you.x + 260; s.y = you.y - 20; s.face = -1; projectiles = [];
    var gy = groundY(); cobsFightTelegraph(s, 'hands', you); var rows = s._handRows ? s._handRows.slice() : null, T = cobsT(s, 'hands'), tel = s._tel, scars0 = IMPACT_SCARS.length;
    s._tel = 0; COBS_MOVES.hands(s, you, ++BOSS_ATK_ID);
    var f = shots(), ys = f.map(function(p){ return Math.round(p.y); }), delays = f.map(function(p){ return p.delay; }), ids = new Set(f.map(function(p){ return p.bossAtk; })).size;
    var shook = 0; for (var i=0;i<delays[delays.length-1] + 6;i++){ s._atkTimer = 1e9; step(); you.invuln = 99999; shook = Math.max(shook, shakeAmt); }
    var err = null; cobsFightTelegraph(s, 'hands', you); s._tel = 14; try { drawCobsFx(); } catch(e){ err = String(e); }
    return { rows: rows, T: T, ys: ys, delays: delays, ids: ids, gy: gy, shook: shook, scars: IMPACT_SCARS.length - scars0, err: err, n: f.length };`);

  it('tier 1: every punch along your one row; tier 2: they alternate between your row and a second one, the gap between them longer', () => {
    const t1 = HANDS(1), t2 = HANDS(2);
    expect(t1.rows, 'tier 1: no second row to mark').toBe(null);
    expect(new Set(t1.ys).size, 'all on one row').toBe(1);
    expect(t2.rows, 'marked at the wind-up').toHaveLength(2);
    expect(Math.abs(t2.rows[0] - t2.rows[1]), 'two rows, apart').toBeGreaterThanOrEqual(80);
    expect(t2.ys.map((y, i) => y === Math.round(t2.rows[i % 2])), 'punch i goes down row i mod 2: the order that was marked').toEqual([true, true, true]);
    expect(t2.delays, 'a longer gap, so the swap between rows can be made').toEqual([0, 21 + 8, 2*(21 + 8)]);
    expect(t2.ids, 'one id').toBe(1);
    expect(t2.err).toBe(null);
  });

  it('the second row is above you if you stand on the floor, the floor if you are up; it is farther off at tier 3 and the gap tighter', () => {
    const t2 = HANDS(2), t3 = HANDS(3), up = HANDS(2, true);
    expect(t2.rows[1], 'above the floor-standing row').toBeLessThan(t2.rows[0]);
    expect(up.rows[1], 'the floor row when you are up in the air').toBeCloseTo(up.gy - 24, 0);
    expect(Math.abs(t3.rows[0] - t3.rows[1]), 'stronger at tier 3: farther apart').toBeGreaterThan(Math.abs(t2.rows[0] - t2.rows[1]));
    expect(t3.T.gap2, 'and tighter').toBeLessThan(t2.T.gap2);
  });

  it('each punch lands heavily: the ground shakes and a crack stays in the floor (impact)', () => {
    const r = HANDS(2);
    expect(r.shook, 'shake(10) is 4 px').toBeGreaterThan(2.5);
    expect(r.scars, 'a crack under each punch').toBeGreaterThanOrEqual(r.n);
  });
});

describe('MePHONE X: DELETION! -- an electric trail', () => {
  const TRAIL = (t, turn) => fight(`
    park(); atTier(${t}); floorAt(you, WW*0.5); you.face = 1; you.spCd = 0; s.x = you.x + 500; s.y = you.y - 200; projectiles = [];
    cobsFightTelegraph(s, 'deletion', you); var X = s._xs[0]; s._tel = 0; COBS_MOVES.deletion(s, you, ++BOSS_ATK_ID); ${turn ? 'you.face = -1;' : ''}
    var T = cobsT(s, 'deletion'), out = { T: T, trail0: s._trail.length, nodes: 0, pctAtPass: null, zapped: null, ids: null, frames: [] };
    for (var i=0;i<130;i++){ s._atkTimer = 1e9; you.invuln = 0; var p0 = you.pct; step(); out.nodes = Math.max(out.nodes, s._trail.length);
      if (out.pctAtPass === null && !s._xs.length) out.pctAtPass = you.pct;
      if (you.pct > p0) out.frames.push([i, Math.round((you.pct - p0)*10)/10]);
      if (i === 24) out.ids = new Set(s._trail.map(function(n){ return n.id; })).size; }
    out.pct = you.pct; out.id = X.id; out.dmg = X.dmg; out.left = s._trail.length; return out;`);

  it('tier 1: nothing is left behind; tier 2: red electricity along the lunge, X running on through you if you turned away, armed after a beat, about a second long', () => {
    const t1 = TRAIL(1, true), t2 = TRAIL(2, true);
    expect(t1.nodes, 'tier 1: off').toBe(0);
    expect(t1.pct, 'and a fighter who turned away is untouched').toBe(0);
    expect(t2.nodes, 'a trail of nodes').toBeGreaterThan(10);
    expect(t2.ids, 'on X\'s own id').toBe(1);
    expect(t2.T.trail, 'about a second').toBe(60);
    expect(t2.left, 'and it is gone again by the end').toBe(0);
  });

  it('the counter is not zapped the frame it is made: the electricity arms for COBS_TRAIL_ARM frames, then bites once for a part of X\'s hit (never both)', () => {
    const t2 = TRAIL(2, true), t3 = TRAIL(3, true);
    expect(t2.pctAtPass, 'X passes through a fighter who turned away: no hit').toBe(0);
    expect(t2.frames.length, 'then one zap, once').toBe(1);
    expect(t2.frames[0][1]).toBeCloseTo(33*1.6*0.3, 0);
    expect(t3.frames[0][1], 'stronger at tier 3').toBeGreaterThan(t2.frames[0][1]);
    expect(t2.pct, 'never more than X\'s own hit').toBeLessThanOrEqual(t2.dmg + 1e-6);
    const hit = TRAIL(2, false);
    expect(hit.pct, 'a fighter X caught takes its hit and the trail adds nothing (one id, one cap)').toBeLessThanOrEqual(hit.dmg + 1e-6);
  });

  it('draws the dim and the bright electricity without a throw', () => {
    const r = fight(`
      park(); atTier(2); floorAt(you, WW*0.5); s.x = you.x + 500; s._trail = [];
      for (var i=0;i<12;i++) s._trail.push({ x: you.x + i*14, y: you.y, t: 50, T: 60, arm: i < 6 ? 10 : 0, id: 3, dmg: 10, cap: 50, hit: {} });
      var err = null; try { drawCobsFx(); } catch(e){ err = String(e && e.stack || e); } return err;`);
    expect(r).toBe(null);
  });
});

describe('THE FIST THINGY! -- the pincer', () => {
  const PINCER = (t) => fight(`
    park(); atTier(${t}); floorAt(you, WW*0.5); you.invuln = 99999; s.x = you.x + 500; s.y = you.y - 40; s.face = -1; projectiles = [];
    cobsFightTelegraph(s, 'device', you); var tx = s._telX, T = cobsT(s, 'device'); s._tel = 0; COBS_MOVES.device(s, you, ++BOSS_ATK_ID);
    var g = shots(), ox = s.x + (s._telDir||-1)*s.r*0.25;
    var err = null; cobsFightTelegraph(s, 'device', you); s._tel = 18; try { drawCobsFx(); } catch(e){ err = String(e); }
    return { T: T, n: g.length, x: g.map(function(p){ return Math.round(p.x); }), vx: g.map(function(p){ return p.vx; }), delay: g.map(function(p){ return p.delay; }), r: g.map(function(p){ return p.r; }), shape: g.map(function(p){ return p.shape; }),
      ids: new Set(g.map(function(p){ return p.bossAtk; })).size, tx: tx, ox: Math.round(ox), kb: g.map(function(p){ return p.kb; }), err: err };`);

  it('tier 1: every glove from his side; tier 2: the second glove from the far edge, flying back at him, a few frames later; tier 3: on the same beat', () => {
    const t1 = PINCER(1), t2 = PINCER(2), t3 = PINCER(3);
    expect(new Set(t1.vx.map(Math.sign)).size, 'tier 1: one direction').toBe(1);
    expect(t2.n).toBe(2);
    expect(Math.sign(t2.vx[0]), 'glove one toward you from his side').toBe(Math.sign(t2.tx - t2.ox));
    expect(Math.sign(t2.vx[1]), 'glove two the other way').toBe(-Math.sign(t2.tx - t2.ox));
    expect(Math.sign(t2.x[1] - t2.tx), 'from the far side of you').toBe(Math.sign(t2.tx - t2.ox));
    expect(Math.abs(Math.abs(t2.x[1] - t2.tx) - Math.abs(t2.tx - t2.ox)), 'as far past you as he is before you').toBeLessThanOrEqual(2);
    expect(t2.delay[1] - t2.delay[0], 'tier 2: a beat more to read it').toBe(t2.T.gap + t2.T.pgap);
    expect(t3.delay[1] - t3.delay[0], 'stronger at tier 3: no extra beat').toBe(t3.T.gap);
    expect(t2.ids, 'one id, the row keeps one cap').toBe(1);
    expect(t2.shape.every((x) => x === 'cobsglove')).toBe(true);
    expect(t2.r.every((x) => x === 22), 'his glove stays 1x (only MePhone4\'s is 2x)').toBe(true);
    expect(t2.err).toBe(null);
  });

  it('the last glove launches you the way it flies: from the far edge that is back toward him', () => {
    const t2 = PINCER(2);
    expect(t2.kb[1], 'the last launches').toBeGreaterThan(t2.kb[0]);
    expect(Math.sign(t2.vx[1])).toBe(-Math.sign(t2.vx[0]));
  });
});

describe('MEEPLE PORTAL! -- the vortex pull', () => {
  const PULL = (t, frames) => fight(`
    park(); atTier(${t}); floorAt(you, WW*0.5); you.invuln = 99999; projectiles = [];
    s._portals = [{ x: you.x + 130, y: you.y, t: 60, T: 60, id: ++BOSS_ATK_ID, dmg: 20, kb: 8, hit: {}, pull: cobsT(s, 'portal').pull, pullR: cobsT(s, 'portal').pullR }];
    var x0 = you.x, maxV = 0, v0 = you.vx;
    for (var i=0;i<${frames};i++){ s._atkTimer = 1e9; you.invuln = 99999; step(); maxV = Math.max(maxV, Math.abs(you.vx)); }
    return { dx: you.x - x0, maxV: maxV, T: cobsT(s, 'portal'), left: s._portals.length };`);

  // THE OWNER, 2026-10-05 ("i hardly notice these 3"): PORTAL -- "two from the start" (the pull from tier 1) and "Stronger pull": twice as strong, reaching farther.
  it('OWNER: the pull is on from tier 1 and TWICE as strong as it was (0.4, 0.5, 0.55, 0.6 -> 0.8, 1.0, 1.1, 1.2), reaching farther (170 and 200 px -> 240 and 280) -- and a standing fighter\'s drift still stays below a fighter\'s own run', () => {
    const T = W.eval('COBS_TIERS.portal');
    expect(T.map((x) => x.pull), 'double the old pulls; tier 1 takes the old tier 2\'s, doubled').toEqual([0.8, 0.8, 1.0, 1.1, 1.2]);
    expect(T.map((x) => x.pullR), 'farther than the old 170 / 200').toEqual([240, 240, 280, 280, 280]);
    const rs = [1, 2, 3, 4, 5].map((t) => PULL(t, 12));
    for (const r of rs) { expect(r.dx, 'toward the portal, which is on the right').toBeGreaterThan(3); expect(r.maxV, 'below a fighter\'s run (6.4)').toBeLessThan(6.4); }
    expect(rs[2].dx, 'stronger at tier 3').toBeGreaterThan(rs[1].dx);
  });

  it('a fighter out of range is left alone; the portal closes early once it has flung someone', () => {
    const r = fight(`
      park(); atTier(3); floorAt(you, WW*0.5); you.invuln = 99999; projectiles = []; var T = cobsT(s, 'portal');
      s._portals = [{ x: you.x + T.pullR + 120, y: you.y, t: 60, T: 60, id: ++BOSS_ATK_ID, dmg: 20, kb: 8, hit: {}, pull: T.pull, pullR: T.pullR }];
      var x0 = you.x; for (var i=0;i<20;i++){ s._atkTimer = 1e9; you.invuln = 99999; step(); } var far = you.x - x0;
      you.invuln = 0; you.pct = 0; floorAt(you, WW*0.5); s._portals = [{ x: you.x + 5, y: you.y, t: 60, T: 60, id: ++BOSS_ATK_ID, dmg: 20, kb: 8, hit: {}, pull: T.pull, pullR: T.pullR }];
      var P = s._portals[0]; for (var i=0;i<4;i++){ s._atkTimer = 1e9; you.invuln = 0; step(); }
      return { far: far, hit: you.pct, t: P.t };`);
    expect(Math.abs(r.far)).toBeLessThan(0.5);
    expect(r.hit, 'flung').toBeGreaterThan(0);
    expect(r.t, 'and it closes early').toBeLessThanOrEqual(10);
  });
});

describe('SPRINGTASTIC! -- extend and retract', () => {
  const SPRING = (t) => fight(`
    park(); atTier(${t}); floorAt(you, WW*0.5 - 1500); you.invuln = 99999; s.x = WW*0.5; s.y = groundY() - 200; s.face = -1; projectiles = [];
    cobsFightTelegraph(s, 'springs', you); s._tel = 0; var id = ++BOSS_ATK_ID; COBS_MOVES.springs(s, you, id);
    var T = cobsT(s, 'springs'), ms = projectiles.filter(function(p){ return p.shape === 'mitten'; }), m = ms[0], vx0 = m.vx, x0 = m.x, armX0 = m.armX0, life0 = m.life;
    var rev = null, gone = null, maxOut = 0;
    for (var i=0;i<260;i++){ s._atkTimer = 1e9; you.invuln = 99999; var before = m.vx; step(); maxOut = Math.max(maxOut, Math.abs(m.x - x0));
      if (rev === null && Math.sign(m.vx) !== Math.sign(before) && m.vx !== 0){ rev = { f: i, vx: m.vx, hitReset: !m._hit || Object.keys(m._hit).length === 0 }; }
      if (gone === null && m.life <= 0){ gone = i; break; } }
    return { T: T, n: ms.length, vx0: vx0, rev: rev, gone: gone, maxOut: maxOut, ids: new Set(ms.map(function(p){ return p.bossAtk; })).size, life0: life0, spr: !!m._spr };`);

  it('tier 1 stretches the whole way and is gone; tier 2 stops at its reach, snaps back along the same row at its speed, and is gone at his hand', () => {
    const t1 = SPRING(1), t2 = SPRING(2);
    expect(t1.spr, 'tier 1: off').toBe(false);
    expect(t1.rev, 'tier 1: it never comes back').toBe(null);
    expect(t2.spr).toBe(true);
    expect(t2.rev, 'the snap-back').not.toBe(null);
    expect(Math.sign(t2.rev.vx), 'the other way').toBe(-Math.sign(t2.vx0));
    expect(Math.abs(t2.rev.vx) / Math.abs(t2.vx0), 'at the tier\'s retract speed (1.0x at tier 2)').toBeCloseTo(1.0, 3);
    expect(t2.maxOut, 'at full stretch').toBeGreaterThanOrEqual(900);
    expect(t2.maxOut).toBeLessThan(900 + 40);
    expect(t2.rev.hitReset, 'a second pass that can land').toBe(true);
    expect(t2.gone, 'gone when it is back at his hand').not.toBe(null);
    expect(t2.n).toBe(2);
    expect(t2.ids, 'one id').toBe(1);
  });

  it('tier 3 snaps back faster (1.25x), and a mitten is never left flying after it should be home', () => {
    const t2 = SPRING(2), t3 = SPRING(3);
    expect(Math.abs(t3.rev.vx) / Math.abs(t3.vx0)).toBeCloseTo(1.25, 3);
    expect(t3.rev.f - 0, 'out then back: the return begins after the reach is covered').toBeGreaterThan(20);
    expect(t3.gone).not.toBe(null);
    expect(t3.T.reach, 'stronger: a longer arm').toBeGreaterThan(t2.T.reach);
  });
});

// ================= THE TWISTS, group 3: tracking, the chain, the bending watches, the unplugging wave, the crescendo =================

describe('MeMURDER! -- the tracking app', () => {
  const TRACK = (t) => fight(`
    park(); atTier(${t}); floorAt(you, WW*0.5 - 600); s.x = you.x + 300; s.y = you.y - 200; projectiles = []; var x00 = you.x;
    cobsFightTelegraph(s, 'memurder', you); s._tel = 0; COBS_MOVES.memurder(s, you, ++BOSS_ATK_ID);
    var T = cobsT(s, 'memurder'), poles = shots().filter(function(p){ return p.cobsTrap; }), mid = poles[Math.floor(poles.length/2)], out = { T: T, n: poles.length, x0: mid.warnX, steps: [], locked: null, rose: null, flash: 0, id: new Set(poles.map(function(p){ return p.bossAtk; })).size };
    var lastX = mid.warnX, lockFrame = null, dEnd = 0, scars0 = IMPACT_SCARS.length;
    for (var i=0;i<T.delay + 12;i++){ s._atkTimer = 1e9; you.invuln = 99999; you.x += 4; you.vx = 0; var d0 = mid.delay; step(); you.invuln = 99999;
      out.steps.push(Math.round((mid.warnX - lastX)*100)/100); lastX = mid.warnX;
      if (mid.delay > 0 && mid._trk && mid._trk.locked && lockFrame === null){ lockFrame = i; out.locked = { frame: i, delayLeft: mid.delay, x: mid.warnX }; }
      if (out.flash === 0 && cobsFx.some(function(e){ return e.kind === 'flash'; })) out.flash = 1; }
    out.you = you.x - x00; out.finalX = mid.warnX; out.up = mid.life > 0 ? (mid.vy < 0) : null; out.scars = IMPACT_SCARS.length - scars0; out.popped = poles.every(function(p){ return p._popped; });
    return out;`);

  it('tier 1: the marks stay where you stood; tier 2: they slide after your feet, 2 px a frame, for the first 60% of the delay -- tier 3 faster', () => {
    const t1 = TRACK(1), t2 = TRACK(2), t3 = TRACK(3);
    expect(Math.max(...t1.steps.map(Math.abs)), 'tier 1: off').toBe(0);
    expect(t2.n).toBeGreaterThanOrEqual(3);
    expect(Math.max(...t2.steps), 'at the tier\'s tracking speed').toBeCloseTo(2.0, 5);
    expect(Math.max(...t3.steps), 'stronger at tier 3').toBeCloseTo(2.5, 5);
    expect(t2.id, 'one id').toBe(1);
    expect(t2.finalX - t2.x0, 'it followed you, and lagged behind (never a lock-on that cannot be outrun)').toBeGreaterThan(20);
    expect(t2.finalX - t2.x0).toBeLessThan(t2.you);
  });

  it('it LOCKS with a phone flash when 40% of the delay is left, and the poles rise from where they locked; every pole pops with a shake and a crack at its base', () => {
    const t2 = TRACK(2);
    expect(t2.locked, 'it locked').not.toBe(null);
    expect(t2.locked.delayLeft, 'with 40% of the delay left').toBeLessThanOrEqual(Math.round(t2.T.delay*0.4) + 1);
    expect(t2.locked.delayLeft).toBeGreaterThanOrEqual(Math.round(t2.T.delay*0.4) - 2);
    expect(t2.steps.slice(t2.locked.frame + 1, t2.T.delay).every((d) => d === 0), 'and does not move again').toBe(true);
    expect(t2.flash).toBe(1);
    expect(t2.popped, 'every pole popped').toBe(true);
    expect(t2.scars, 'a crack at each pole base').toBeGreaterThanOrEqual(t2.n);
  });
});

describe('KERNEL POP! -- the dive and the chain', () => {
  const POP = (t) => fight(`
    park(); atTier(${t}); floorAt(you, WW*0.5); you.invuln = 99999; s.x = you.x + 260; s.y = you.y - 60; s.face = -1; projectiles = [];
    var hp0 = s.hp; cobsFightTelegraph(s, 'kernelpop', you); s._tel = 0; COBS_MOVES.kernelpop(s, you, ++BOSS_ATK_ID);
    var T = cobsT(s, 'kernelpop'), out = { T: T, cost: hp0 - s.hp, phases: [], minY: 1e9, topY: null, landed: null, bursts: [], popcorn: 0, dive0: null, hold: 0, maxShake: 0, scars: 0 };
    var scars0 = IMPACT_SCARS.length, prev = '', puds = null, burstAt = {}, dust0 = IMPACT_DUST.length;
    for (var i=0;i<260;i++){ s._atkTimer = 1e9; you.invuln = 99999; step();
      var ph = s._dive ? s._dive.ph : '-'; if (ph !== prev){ out.phases.push(ph); prev = ph; }
      if (s._dive){ out.minY = Math.min(out.minY, s.y); out.topY = cobsTopY(); }
      if (s._chain && !puds){ puds = s._chain.list.slice(); out.landed = { x: s.x, y: s.y, surf: s._dive ? null : null, puds: puds.map(function(p){ return Math.round(p.x); }), land: Math.round(s._chain.list[0].x) }; out.hold = s._holdT; out.maxShake = shakeAmt; }
      if (puds) puds.forEach(function(p, k){ if (burstAt[k] === undefined && !(p.delay > 0)) burstAt[k] = i; });
      out.popcorn = Math.max(out.popcorn, projectiles.filter(function(p){ return p.shape === 'popcorn' && p.life > 0; }).length); }
    out.burstAt = Object.keys(burstAt).sort().map(function(k){ return burstAt[k]; }); out.scars = IMPACT_SCARS.length - scars0; out.dust = IMPACT_DUST.length - dust0; return out;`);

  it('tier 1 keeps the old stomp (every puddle at once); from tier 2 he dives: off the top of the screen, down onto the puddle nearest you', () => {
    const t1 = POP(1), t2 = POP(2);
    expect(t1.phases, 'tier 1: no dive').toEqual(['-']);
    expect(t2.phases, 'up, off the screen, down').toEqual(['-', 'up', 'gone', 'down', '-']);
    expect(t2.minY, 'he left the frame: above the top edge of the screen').toBeLessThan(t2.topY);
    expect(t2.cost, 'it still costs him 1%').toBe(25);
    expect(t2.landed, 'and he landed').not.toBe(null);
    expect(t2.maxShake, 'the heaviest hit of the fight: shake(30) is the 12 px cap').toBeGreaterThanOrEqual(11.9);
    expect(t2.scars, 'a crater in the floor').toBeGreaterThan(0);
  });

  it('then the puddles burst in a CHAIN, the tier\'s frames apart, out from where he landed, the nearest first; he stays where he landed meanwhile; tier 3 is quicker', () => {
    const t2 = POP(2), t3 = POP(3);
    expect(t2.burstAt.length, 'every puddle burst').toBe(t2.landed.puds.length);
    const gaps = t2.burstAt.slice(1).map((v, i) => v - t2.burstAt[i]);
    expect(gaps.every((g) => g === t2.T.chain || g === t2.T.chain + 1 || g === t2.T.chain - 1), `a burst every ${t2.T.chain} frames: ${gaps}`).toBe(true);
    const xs = t2.landed.puds;
    expect(xs[0], 'the first is the one he landed on').toBe(t2.landed.land);
    expect(xs.map((x) => Math.abs(x - t2.landed.land)), 'out from there: sorted by distance from where he landed').toEqual(xs.map((x) => Math.abs(x - t2.landed.land)).slice().sort((a, b) => a - b));
    expect(t2.hold, 'he holds still while they pop').toBeGreaterThanOrEqual(t2.landed.puds.length*t2.T.chain);
    expect(t2.popcorn, 'popcorn arcs from each burst').toBeGreaterThan(0);
    expect(t3.T.chain, 'stronger at tier 3: a quicker chain').toBeLessThan(t2.T.chain);
  });

  it('the popcorn of a burst arcs over to the NEXT puddle and bounces once (it is spent on its first bounce)', () => {
    const r = fight(`
      park(); atTier(2); floorAt(you, WW*0.5 - 900); you.invuln = 99999; s.x = WW*0.5; s.y = groundY() - 300; projectiles = []; var gy = groundY();
      var a = cobsPuddle(WW*0.5, gy, 600, 1, true, cobsT(s, 'kernelpop'), 20), b = cobsPuddle(WW*0.5 + 90, gy, 600, 1, true, cobsT(s, 'kernelpop'), 20);
      var C = { T: cobsT(s, 'kernelpop'), id: ++BOSS_ATK_ID }; cobsPuddleBurst(s, a, C, b);
      var pc = projectiles.filter(function(p){ return p.shape === 'popcorn'; });
      return { n: pc.length, want: cobsT(s, 'kernelpop').pop, toward: pc.every(function(p){ return p.vx > 0 && p.bounce === true && p.maxBounces === 1; }), id: pc.every(function(p){ return p.bossAtk === C.id; }), aGone: a.life <= 0 };`);
    expect(r.n).toBe(r.want);
    expect(r.toward, 'toward the next puddle, with a single bounce').toBe(true);
    expect(r.id).toBe(true);
    expect(r.aGone).toBe(true);
  });
});

describe('TICK, TOCK! -- the watches bend', () => {
  const BEND = (t) => fight(`
    park(); atTier(${t}); floorAt(you, WW*0.5); you.invuln = 99999; s.x = you.x + 500; s.y = you.y - 200; projectiles = [];
    var T = cobsT(s, 'ticktock'); cobsThrowWatches(s, you, ++BOSS_ATK_ID, T.n, T, 10, 0.18);
    var ws = shots().filter(function(p){ return p.shape === 'meeplewatch'; }), res = [], prev = ws.map(function(p){ return [p.vx, p.vy]; });
    for (var i=0;i<60;i++){ s._atkTimer = 1e9; you.invuln = 99999; var was = ws.map(function(p){ return p._bend ? p._bend.done : null; }); step();
      ws.forEach(function(p, k){ if (p._bend && p._bend.done && !was[k] && p.life > 0){ var a0 = Math.atan2(prev[k][1], prev[k][0]), a1 = Math.atan2(p.vy, p.vx); var d = ((a1 - a0 + Math.PI*3) % (Math.PI*2)) - Math.PI;
          res.push({ k: k, deg: Math.round(d*180/Math.PI*10)/10, sp0: Math.hypot(prev[k][0], prev[k][1]), sp1: Math.hypot(p.vx, p.vy) }); } });
      prev = ws.map(function(p){ return [p.vx, p.vy]; }); }
    return { T: T, n: ws.length, bends: res, flagged: ws.filter(function(p){ return !!p._bend; }).length };`);

  it('tier 1 throws plain arcs; tier 2 bends each watch 35 degrees toward you at the top of its arc; tier 3 40', () => {
    const t1 = BEND(1), t2 = BEND(2), t3 = BEND(3);
    expect(t1.flagged, 'tier 1: off').toBe(0);
    expect(t2.flagged).toBe(t2.n);
    expect(t2.bends.length, 'every watch bent, once').toBe(t2.n);
    for (const b of t2.bends) { expect(Math.abs(b.deg), 'bent 35 degrees (a frame of gravity on top)').toBeGreaterThan(30); expect(Math.abs(b.deg)).toBeLessThan(40); }
    for (const b of t3.bends) { expect(Math.abs(b.deg), 'stronger at tier 3: 40').toBeGreaterThan(35); expect(Math.abs(b.deg)).toBeLessThan(46); }
    expect(t3.T.bend).toBe(40);
  });

  it('the zero\'s volley bends too, and a spent watch shatters into shards (impact)', () => {
    const r = fight(`
      park(); atTier(2); floorAt(you, WW*0.5); you.invuln = 99999; s.x = you.x + 500; s.y = you.y - 200; projectiles = []; var T = cobsT(s, 'ticktock');
      s._tick = { t:1, T:T.timer }; step(); var vol = shots().filter(function(p){ return p.shape === 'meeplewatch'; });
      var bendable = vol.filter(function(p){ return !!p._bend; }).length, n = vol.length, want = T.volley;
      var debris0 = IMPACT_DEBRIS.length, peak = 0, shook = 0;
      for (var i=0;i<140;i++){ s._atkTimer = 1e9; you.invuln = 99999; step(); peak = Math.max(peak, IMPACT_DEBRIS.length); shook = Math.max(shook, shakeAmt); }
      return { n: n, want: want, bendable: bendable, debris: peak - debris0, shook: shook, left: projectiles.filter(function(p){ return p.shape === 'meeplewatch' && p.life > 0; }).length };`);
    expect(r.n).toBe(r.want);
    expect(r.bendable).toBe(r.n);
    expect(r.debris, 'shards').toBeGreaterThan(3);
    expect(r.shook, 'shake(6) is 2.4 px').toBeGreaterThan(2);
  });
});

describe('PULL THE PLUG! -- the unplugging wave', () => {
  const WAVE = (t) => fight(`
    park(); atTier(${t}); floorAt(you, WW*0.5); you.invuln = 99999; s.x = you.x + 600; s.y = you.y - 300; projectiles = [];
    cobsFightTelegraph(s, 'plug', you); s._tel = 0; COBS_MOVES.plug(s, you, ++BOSS_ATK_ID);
    var P = s._plug, T = cobsT(s, 'plug'), out = { T: T, wave: P.wave, gone: [], back: [], shots: null, glass: 0, order: [] };
    var wait0 = P.t; for (var i=0;i<wait0 + 2 && P.phase === 'wait';i++){ s._atkTimer = 1e9; you.invuln = 99999; step(); }
    var list = P.list ? P.list.map(function(e){ return { p: e.p, k: e.k }; }) : [];
    // a shot of yours on each side, to see them go as the wave passes
    var shotFar = addProj({ owner: you.idx, ownerObj: you, x: you.x - P.dir*(-700), y: you.y - 400, vx: 0, vy: 0, r: 8, dmg: 1, kb: 1, life: 9000, color: '#fff' });
    out.phase = P.phase; out.dir = P.dir; out.x0 = P.x0; out.list = list.length;
    var f0 = 0, goneAt = new Map(), backAt = new Map();
    for (var i=0;i<P.wave + 6;i++){ s._atkTimer = 1e9; you.invuln = 99999; step(); f0++; list.forEach(function(e){ if (!goneAt.has(e.p) && worldPlats.indexOf(e.p) < 0) goneAt.set(e.p, f0); });
      out.glass = Math.max(out.glass, cobsFx.filter(function(e){ return e.kind === 'glass'; }).length); }
    out.allGone = list.every(function(e){ return worldPlats.indexOf(e.p) < 0; }); out.phaseAfter = s._plug ? s._plug.phase : null; out.floor = worldPlats.some(function(p){ return p.solid && p.floor === 0; });
    var pairs = list.map(function(e){ return [e.k, goneAt.get(e.p)]; }).filter(function(q){ return q[1] !== undefined; }).sort(function(a, b){ return a[0] - b[0]; });
    out.gonePairs = pairs.length; out.goneMono = pairs.every(function(q, i){ return i === 0 || q[1] >= pairs[i-1][1]; }); out.goneSpan = pairs.length ? pairs[pairs.length-1][1] - pairs[0][1] : 0; out.firstGone = pairs.length ? pairs[0][1] : null;
    // out for the poof's frames, then it comes back in the reverse order
    var f1 = 0; while (s._plug && s._plug.phase !== 'returning' && f1 < 400){ s._atkTimer = 1e9; you.invuln = 99999; step(); f1++; }
    var f2 = 0; while (s._plug && f2 < 200){ s._atkTimer = 1e9; you.invuln = 99999; step(); f2++; list.forEach(function(e){ if (!backAt.has(e.p) && worldPlats.indexOf(e.p) >= 0) backAt.set(e.p, f2); }); }
    var bp = list.map(function(e){ return [e.k, backAt.get(e.p)]; }).filter(function(q){ return q[1] !== undefined; }).sort(function(a, b){ return b[0] - a[0]; });
    out.backMono = bp.every(function(q, i){ return i === 0 || q[1] >= bp[i-1][1]; }); out.backPairs = bp.length; out.restored = list.every(function(e){ return worldPlats.indexOf(e.p) >= 0; }); out.plugNull = s._plug === null;
    return out;`);

  it('tier 1 is the old instant [POOF]; from tier 2 the platforms go in a WAVE, the order of their distance along it, over the tier\'s frames; the floor stays', () => {
    const t2 = WAVE(2), t3 = WAVE(3);
    expect(t2.wave).toBe(36);
    expect(t2.phase, 'going').toBe('going');
    expect(t2.allGone && t2.floor, 'every floating platform goes, the floor stays').toBe(true);
    expect(t2.goneMono, 'footing goes in an order you can read: along the wave').toBe(true);
    expect(t2.goneSpan, 'end to end in about the wave\'s frames').toBeGreaterThan(18);
    expect(t2.goneSpan).toBeLessThanOrEqual(t2.wave + 1);
    expect(t3.wave, 'stronger at tier 3: a quicker wave').toBe(28);
    expect(t3.goneSpan).toBeLessThan(t2.goneSpan);
    expect(t2.glass, 'and glass falls where the wave is').toBeGreaterThan(5);
  });

  it('everything comes back in the REVERSE order -- the last to go the first to return -- and it ends plugged in', () => {
    const t2 = WAVE(2);
    expect(t2.backPairs).toBeGreaterThan(20);
    expect(t2.backMono, 'the last platform to go returns first').toBe(true);
    expect(t2.restored).toBe(true);
    expect(t2.plugNull).toBe(true);
  });

  it('a fighter standing on a platform is shocked only when the wave reaches it; one standing on a pane never is; tier 1 shocks nobody', () => {
    const r = fight(`
      park(); atTier(3); you.invuln = 0; s.x = WW*0.5 + 600; s.y = groundY() - 300; projectiles = [];
      var pl = worldPlats.filter(function(p){ return !p.solid && p.w > 200 && p.y > groundY() - 700 && p.y < groundY() - 300; })[0];
      you.x = pl.x + pl.w/2; you.y = pl.y - you.r; you.vx = 0; you.vy = 0; you.pct = 0; you.controller = 'still'; step(); you.pct = 0; you.invuln = 0;
      cobsFightTelegraph(s, 'plug', you); s._tel = 0; COBS_MOVES.plug(s, you, ++BOSS_ATK_ID); var P = s._plug, hitAt = null, goneAt = null;
      var wait1 = P.t, wave1 = P.wave; for (var i=0;i<wait1 + wave1 + 8;i++){ s._atkTimer = 1e9; var p0 = you.pct; you.invuln = 0; if (worldPlats.indexOf(pl) >= 0){ you.x = pl.x + pl.w/2; you.y = pl.y - you.r; you.vx = 0; you.vy = 0; } step();
        if (hitAt === null && you.pct > p0) hitAt = i; if (goneAt === null && worldPlats.indexOf(pl) < 0) goneAt = i; }
      return { hitAt: hitAt, goneAt: goneAt, shock: P.shock, pct: you.pct };`);
    expect(r.hitAt, 'shocked').not.toBe(null);
    expect(r.hitAt, 'the moment the platform under him goes').toBe(r.goneAt);
    expect(r.pct).toBeCloseTo(r.shock, 3);
  });

  it('a box the wave erases leaves nothing behind: no crumbs from what the slate took', () => {
    const r = fight(`
      park(); atTier(2); floorAt(you, WW*0.5); you.invuln = 99999; s.x = you.x + 600; s.y = you.y - 300; projectiles = []; s._track = []; var T = cobsT(s, 'samples');
      var p = addProj(cobsShot(s, { x: you.x - 600, y: groundY() - 300, vx:0, vy:0.1, grav:false, r:12, life:900, bossAtk:1, shape:'meeplesample', cobsSample:true })); cobsTrack(s, p, 'sample', { T:T, dmg:10, cap:10 });
      cobsFightTelegraph(s, 'plug', you); s._tel = 0; COBS_MOVES.plug(s, you, ++BOSS_ATK_ID); var P = s._plug, n = P.t + P.wave + 30;
      for (var i=0;i<n;i++){ s._atkTimer = 1e9; you.invuln = 99999; step(); }
      return { crumbs: projectiles.filter(function(q){ return q._crumb; }).length, track: s._track.length, boxAlive: projectiles.indexOf(p) >= 0 };`);
    expect(r.boxAlive, 'the wave took the box').toBe(false);
    expect(r.crumbs).toBe(0);
    expect(r.track).toBe(0);
  });
});

describe('THE FUTURE IS SO YESTERDAY! -- the crescendo', () => {
  const KEY = (t) => fight(`
    park(); atTier(${t}); floorAt(you, WW*0.5); you.invuln = 99999; s.x = you.x - 300; s.y = you.y - 120; s._rings = []; s._burst = null;
    cobsFightTelegraph(s, 'keynote', you); s._tel = 0; COBS_MOVES.keynote(s, you, ++BOSS_ATK_ID);
    var T = cobsT(s, 'keynote'), rs = s._rings.map(function(R){ return { d: R.delay, high: R.high, stress: !!R.stress, id: R.id, spd: R.spd }; });
    var out = { T: T, rings: rs, burst: s._burst ? s._burst.t : null, hold: s._holdT, glass: 0, shake: 0 };
    for (var i=0;i<(out.burst || 120) + 4;i++){ s._atkTimer = 1e9; you.invuln = 99999; step(); out.shake = Math.max(out.shake, shakeAmt); out.glass = Math.max(out.glass, cobsFx.filter(function(e){ return e.kind === 'glass'; }).length); }
    return out;`);

  it('tier 1 rings come at a steady beat; tier 2 each ring comes 2 frames sooner than the last, tier 3 three (never under 14)', () => {
    const t1 = KEY(1), t2 = KEY(2), t3 = KEY(3), t5 = KEY(5);
    const gaps = (r) => r.rings.filter((x) => !x.stress).map((x, i, a) => i ? x.d - a[i - 1].d : null).slice(1);
    expect(gaps(t1), 'a steady beat').toEqual([40]);
    expect(gaps(t2), '36, then 2 sooner').toEqual([36, 34]);
    expect(gaps(t3), '32, then 3 sooner').toEqual([32, 29]);
    expect(Math.min(...gaps(t5)), 'never under 14').toBeGreaterThanOrEqual(14);
  });

  it('from tier 3 the finish is three stressed beats 14 frames apart: a low ring, a high ring (one id between them), then the CARE! burst -- which shakes the stage and drops glass', () => {
    const t2 = KEY(2), t3 = KEY(3);
    expect(t2.rings.some((x) => x.stress), 'tier 2: no stressed finish').toBe(false);
    const st = t3.rings.filter((x) => x.stress);
    expect(st).toHaveLength(2);
    expect(st.map((x) => x.high), 'low, then high').toEqual([false, true]);
    expect(st[1].d - st[0].d, '14 frames apart').toBe(14);
    expect(st[0].id, 'one id: one hit at most').toBe(st[1].id);
    expect(t3.rings.filter((x) => !x.stress).every((x) => x.id !== st[0].id)).toBe(true);
    expect(t3.burst - st[1].d, 'and the burst is the third beat, 14 frames after the high ring').toBe(14);
    expect(st[0].spd, 'stressed: harder').toBeGreaterThan(t3.T.spd);
    expect(t3.shake, 'CARE!: shake(30) hits the 12 px cap').toBeGreaterThanOrEqual(11.9);
    expect(t3.glass, 'glass falls from the backdrop').toBeGreaterThan(10);
  });
});

// ================= THE TWISTS, group 4: the barrier link, the rocking boat, the rage on foot, the burst ring =================

describe('LOCKDOWN! -- the barrier link', () => {
  const LINK = (t, touch, kill) => fight(`
    park(); atTier(${t}); floorAt(you, WW*0.5); you.invuln = 0; s.x = you.x + 400; s.y = you.y - 250; projectiles = []; summons = summons.filter(function(m){ return m === s; });
    cobsFightTelegraph(s, 'metags', you); s._tel = 0; COBS_MOVES.metags(s, you, ++BOSS_ATK_ID);
    var tags = summons.filter(function(m){ return m.type === 'metag'; }), a = tags[0], b = tags[1], T = cobsT(s, 'metags');
    var place = function(){ a.x = you.x - 150; a.y = hurtCY(you) ${touch ? '' : '- 240'}; b.x = you.x + 150; b.y = a.y; a.vx = a.vy = b.vx = b.vy = 0; a._cd = b._cd = 9999; };
    ${kill ? 'a.hp = 0;' : ''}
    var out = { T: T, rooted: 0, hits: 0, link: null, frames: [], width: a._linkW }, p0 = 0;
    for (var i=0;i<130;i++){ s._atkTimer = 1e9; place(); you.pct = Math.max(0, you.pct); var before = you.pct, wasRooted = you.rooted || 0; step(); place();
      if (i === 3) out.link = s._link ? { w: s._link.w, len: Math.round(Math.hypot(s._link.bx - s._link.ax, s._link.by - s._link.ay)) } : null;
      if (you.pct > before) out.frames.push(i); out.rooted = Math.max(out.rooted, you.rooted || 0); }
    out.pct = you.pct; out.dmg = a._dmg; out.cuff = a._cuff; return out;`);

  it('tier 1: no barrier; from tier 2 a see-through barrier links the two tags, thicker at tier 3; touching it cuffs you as a tag would, and it never cuffs twice in a second and a half', () => {
    const t1 = LINK(1, true, false), t2 = LINK(2, true, false), t3 = LINK(3, true, false);
    expect(t1.link, 'tier 1: off').toBe(null);
    expect(t1.frames, 'and no cuff from a barrier that is not there').toEqual([]);
    expect(t2.link, 'linked').not.toBe(null);
    expect(t2.link.w).toBe(8);
    expect(t3.link.w, 'stronger at tier 3: thicker').toBe(12);
    expect(t2.link.len, 'a line between the two tags').toBeGreaterThan(250);
    expect(t2.frames.length, 'a fighter on the line is cuffed...').toBeGreaterThanOrEqual(1);
    expect(t2.frames.every((f, i, a) => i === 0 || f - a[i - 1] >= 90), '...once every 90 frames at most').toBe(true);
    expect(t2.rooted, 'rooted for the cuff\'s frames, like a tag\'s cuff').toBeGreaterThan(20);
    expect(t2.pct, 'the tag\'s own small hit').toBeGreaterThan(0);
  });

  it('a fighter off the line is not cuffed; killing either tag drops the barrier', () => {
    const off = LINK(2, false, false), dead = LINK(2, true, true);
    expect(off.frames, 'not on the line: left alone').toEqual([]);
    expect(dead.link, 'one tag dead: no barrier').toBe(null);
    expect(dead.frames).toEqual([]);
  });

  it('draws the barrier without a throw', () => {
    const r = fight(`
      park(); atTier(2); floorAt(you, WW*0.5); s._link = { ax: you.x - 100, ay: you.y, bx: you.x + 100, by: you.y - 50, w: 8 };
      var err = null; try { drawCobsFx(); } catch(e){ err = String(e && e.stack || e); } return err;`);
    expect(r).toBe(null);
  });
});

describe('TOXIC CANNON! -- the sailboat rocks', () => {
  const ROCK = (t) => fight(`
    park(); atTier(${t}); floorAt(you, WW*0.5 - 1300); you.invuln = 99999; projectiles = [];
    cobsFightTelegraph(s, 'cannon', you); s._tel = 0; COBS_MOVES.cannon(s, you, ++BOSS_ATK_ID);
    var S = s._ship, T = cobsT(s, 'cannon'), offs = [], puds = [], tilt = [];
    for (var i=0;i<90;i++){ s._atkTimer = 1e9; you.invuln = 99999; step(); if (!s._ship) break; offs.push(Math.round((S.beamX - (S.x + S.dir*COBS_SHIP_LEAD))*10)/10); }
    var pd = projectiles.filter(function(p){ return p.cobsPuddle && p.delay > 0; }).map(function(p){ return Math.round(p.x); });
    return { T: T, offs: offs, rock: S.rock, pud: pd };`);

  it('tier 1: the beam rides straight ahead of the boat; tier 2: its floor point swings 100 px either side of its lead on a 40-frame sine; tier 3 140', () => {
    const t1 = ROCK(1), t2 = ROCK(2), t3 = ROCK(3);
    expect(Math.max(...t1.offs.map(Math.abs)), 'tier 1: off').toBe(0);
    expect(Math.max(...t2.offs), 'swings out...').toBeGreaterThan(95);
    expect(Math.min(...t2.offs), '...and back').toBeLessThan(-95);
    expect(Math.max(...t2.offs)).toBeLessThanOrEqual(100.01);
    expect(Math.max(...t3.offs), 'stronger at tier 3').toBeGreaterThan(135);
    const o = t2.offs, down = o.findIndex((v, i) => i && o[i - 1] > 0 && v <= 0), up = o.findIndex((v, i) => i > down && o[i - 1] < 0 && v >= 0);
    expect(up - down, 'a 40-frame sine: the swing is back through its lead every 20 frames').toBeGreaterThanOrEqual(19);
    expect(up - down).toBeLessThanOrEqual(21);
  });

  it('puddles are left where the beam touched (not where the boat was), and the boat is drawn pitching', () => {
    const t2 = ROCK(2);
    expect(t2.pud.length, 'it leaves puddles').toBeGreaterThan(0);
    const r = fight(`
      park(); atTier(2); floorAt(you, WW*0.5); s._ship = { x: you.x, y: groundY() - COBS_SHIP_Y, dir: 1, spd: 8, left: 1, dmg: 30, id: 1, puddle: 100, hit: {}, x0: 0, x1: WW, lastPud: -1e9, t: 7, rock: 100, beamX: you.x + 200 };
      var err = null; try { drawCobsFx(); } catch(e){ err = String(e && e.stack || e); } return err;`);
    expect(r).toBe(null);
  });
});

describe('KEYNOTE RAGE -- on foot (the low-hover version)', () => {
  const FOOT = (rage) => fight(`
    park(); floorAt(you, WW*0.5); you.invuln = 99999; s.x = you.x + 300; s.y = you.y - 250; s._spoke = true; s._speechT = 0; s._rageT = ${rage ? 900 : 0}; atTier(3); s._atkTimer = 1e9;
    var fl = cobsFloor(), ys = [], ds = [], dust0 = IMPACT_DUST.length, peak = 0;
    for (var i=0;i<240;i++){ s._atkTimer = 1e9; you.invuln = 99999; step(); if (i > 60){ ys.push(fl.y - s.r - s.y); ds.push(Math.abs(s.x - you.x)); } peak = Math.max(peak, shakeAmt); }
    var avg = function(a){ return a.reduce(function(x, y){ return x + y; }, 0)/a.length; };
    return { gap: avg(ys), maxGap: Math.max.apply(null, ys), dist: avg(ds), dust: IMPACT_DUST.length - dust0, shake: peak, foot: COBS_FOOT, r: s.r };`);

  it('in the rage he comes down off his cloud: a low hover 70 px over the floor, circling at 200 px, and each stride a footfall puts dust and shake 3 into the floor', () => {
    const calm = FOOT(false), rage = FOOT(true);
    expect(rage.foot).toMatchObject({ gap: 70, orbitR: 200 });
    // (calm, his orbit sits 150 to 190 px over the floor on average, and which end depends on when the orbit happens to flip: the bar is the
    // rage's own highest moment, not a number the orbit's dice can cross)
    expect(calm.gap, 'not in rage: high on his cloud, clear above where the rage hovers').toBeGreaterThan(rage.maxGap);
    expect(rage.gap, 'in rage: about 70 px over the floor').toBeLessThan(110);
    expect(rage.gap).toBeGreaterThan(20);
    expect(rage.dist, 'and in close').toBeLessThan(calm.dist);
    expect(rage.dist).toBeLessThan(300);
    expect(rage.dust, 'footfall dust').toBeGreaterThan(calm.dust);
    expect(rage.shake, 'shake 3 a stride').toBeGreaterThan(1);
  });
});

describe('POPPING POINT -- the burst ring', () => {
  it('every hit under 20% pops an EVEN RING of kernels, not aimed at you, 2% each, one id and the old cap for the whole ring', () => {
    const r = fight(`
      park(); floorAt(you, WW*0.5); s.x = you.x + 300; s.y = you.y - 200; s._spoke = true; s.hp = 450; atTier(5); projectiles = []; s._popCd = 0;
      cobsTakeDamage(s, 1); var ks = shots(), cx = s.x, cy = s.y - s.r*0.3;
      var angs = ks.map(function(p){ return Math.atan2(p.y - cy, p.x - cx); }).sort(function(a, b){ return a - b; });
      var gaps = angs.map(function(a, i){ return i ? a - angs[i-1] : (angs[0] + 2*Math.PI) - angs[angs.length-1]; });
      var mean = ks.reduce(function(a, p){ return a + p.vx; }, 0)/ks.length;
      return { n: ks.length, ring: COBS_POP_RING, gaps: gaps, ids: new Set(ks.map(function(p){ return p.bossAtk; })).size, dmg: ks[0].dmg, cap: ks[0].bossCap, shape: ks[0].shape, mean: mean, speed: Math.hypot(ks[0].vx, ks[0].vy + 2) };`);
    expect(r.n).toBe(r.ring);
    for (const g of r.gaps) expect(g, 'evenly spaced round him').toBeCloseTo(2*Math.PI/r.ring, 1);
    expect(r.ids, 'one id').toBe(1);
    expect(r.dmg, '2% each').toBe(2);
    expect(r.cap, 'the old cap: 3 kernels\' worth').toBe(6);
    expect(Math.abs(r.mean), 'a ring, not a line at you').toBeLessThan(0.5);
    expect(r.shape).toBe('kernel');
  });
});

// ================= THE ANIMATION TREATMENT (Round 15): heavy hits, the backdrop by tier, bigger movement, the art, the ending =================
// "ok. make one and cobs get the same animation treatement as the others."

const RAW = (body, lineup = ['Knife']) => W.eval(`(function(){
  SETTINGS.itemRate=0; SETTINGS.stocks=3; LOCAL_PLAYERS=1; window.__cobsEnd = undefined;
  var __ok = startCobsFight(${JSON.stringify(lineup)}, { story:true, onEnd:function(won){ window.__cobsEnd = won; return true; } });
  var s = summons.find(function(o){ return o._cobsFight; });
  var you = fighters[0];
  var floorAt = function(f, x){ f.x = x; f.y = groundY() - f.r; f.vx = 0; f.vy = 0; f.pct = 0; f.invuln = 0; };
  ${body}
})()`);

describe('heavy hits go through impact()', () => {
  it('no bare shake of 8 or more is left in his code: every heavy hit is an impact (shake, dust, debris, a floor scar), and the backdrop hears the big ones', () => {
    const html = readFileSync('artifacts/V1/index.html', 'utf8').replace(/\r\n/g, '\n');
    const a = html.indexOf('//  STEVE COBS -- the second secret boss'), b = html.indexOf('let BOSS_ATK_ID = 0;');
    expect(a).toBeGreaterThan(0); expect(b).toBeGreaterThan(a);
    const bare = [...html.slice(a, b).matchAll(/[^a-zA-Z.]shake\((\d+)\)/g)].map((m) => +m[1]).filter((n) => n >= 8);
    expect(bare, 'bare shake() calls of 8 or more').toEqual([]);
    const r = RAW(`
      cobsDecorReset(); var before = Object.keys(COBS_DECOR.fallen).length; cobsImpact(500, 500, { shake:4, dust:0, debris:0 }); var small = Object.keys(COBS_DECOR.fallen).length;
      cobsImpact(500, 500, { shake:14, dust:1, debris:3 }); return { before: before, small: small, big: Object.keys(COBS_DECOR.fallen).length, pulse: COBS_DECOR.pulse === hazardT };`);
    expect(r.small, 'a small impact does not touch the shelves').toBe(0);
    expect(r.big, 'a big one knocks a product off its shelf').toBe(1);
    expect(r.pulse, 'and puffs the cloud').toBe(true);
  });

  it('the rage\'s start, the dive\'s landing, the keynote\'s CARE! and a tier line are the big ones: shake of 12 and more (the 12 px cap), and a crater where there is a floor', () => {
    const r = RAW(`
      s._hop = null; floorAt(you, WW*0.5); s._atkTimer = 1e9; you.controller = 'still'; var out = {}, big = [];
      var ci = cobsImpact; cobsImpact = function(x, y, o){ big.push({ shake: o.shake, scar: !!o.scar }); return ci(x, y, o); };
      s._spoke = true; s._speechT = 1; s._speechHit = 0; step(); out.rage = big.filter(function(b){ return b.shake >= 14 && b.scar; }).length;
      big = []; s.hp = 2000; step(); out.tier = big.filter(function(b){ return b.shake >= 20; }).length;
      big = []; s._burst = { t:1, dmg:20, id:1, hp0:s.hp }; step(); out.care = big.filter(function(b){ return b.shake >= 30; }).length;
      cobsImpact = ci; return out;`);
    expect(r.rage, 'the rage begins with a crater').toBeGreaterThanOrEqual(1);
    expect(r.tier, 'a tier line shudders the building').toBeGreaterThanOrEqual(1);
    expect(r.care, 'CARE!: shake(30)').toBeGreaterThanOrEqual(1);
  });
});

describe('the backdrop: Meeple Headquarters reacts by tier', () => {
  const DECOR = (t, extra = '') => RAW(`
    s._hop = null; s._marks = ${t - 1}; s._tierT = -999; ${extra}
    cobsDecorReset(); var err = null; try { drawArenaDecor('meeplehq'); } catch(e){ err = String(e && e.stack || e); } return { last: COBS_DECOR.last, err: err };`);

  it('the glass cracks tier by tier: whole at 1, hairline cracks at 2, crazed at 3, some panes shattered at 4, only cloud and sky at 5', () => {
    const d = [1, 2, 3, 4, 5].map((t) => DECOR(t));
    for (const x of d) expect(x.err).toBe(null);
    expect(d[0].last.cracks, 'tier 1: whole glass').toBe(0);
    expect(d[1].last.cracks, 'tier 2: hairlines').toBeGreaterThan(0);
    expect(d[2].last.cracks, 'tier 3: crazed: more').toBeGreaterThan(d[1].last.cracks*2);
    expect(d[2].last.broken).toBe(0);
    expect(d[3].last.broken, 'tier 4: some panes shattered').toBeGreaterThan(0);
    expect(d[3].last.gone).toBe(0);
    expect(d[4].last.gone, 'tier 5: the glass is gone: only the frames, cloud and sky').toBeGreaterThanOrEqual(7);
    expect(d[4].last.cracks).toBe(0);
  });

  it('the ad screens are cyan, tint red under DELETION\'s siren, and go dark at tier 5; the elevator rises for the keynote and lowers after', () => {
    expect(DECOR(2).last.screens).toBe('cyan');
    expect(DECOR(2, 's._redT = 30;').last.screens, 'red under the siren').toBe('red');
    expect(DECOR(5).last.screens, 'dark at tier 5').toBe('dark');
    const e = RAW(`
      s._hop = null; floorAt(you, WW*0.5); you.controller = 'still'; s._atkTimer = 1e9; s._marks = 2; s.x = you.x - 300; s.y = you.y - 120; var out = { rest: s._elev };
      cobsFightTelegraph(s, 'keynote', you); for (var i=0;i<60;i++){ s._atkTimer = 1e9; you.invuln = 99999; step(); } out.up = s._elev;
      s._tel = 0; s._rings = []; s._burst = null; s._holdT = 0; s._telKind = null; for (var i=0;i<120;i++){ s._atkTimer = 1e9; you.invuln = 99999; step(); } out.down = s._elev; return out;`);
    expect(e.rest).toBe(0);
    expect(e.up, 'up at the podium\'s height for the keynote').toBeGreaterThan(0.9);
    expect(e.down, 'and lowered after').toBeLessThan(0.1);
  });

  it('a tier line sheds pieces off the walls (glass, and the cloud\'s edge from tier 4); the shelves empty as big impacts land; the cloud puffs', () => {
    const r = RAW(`
      s._hop = null; cobsDecorReset(); var out = { shed: [] }; [2, 3, 4, 5].forEach(function(t){ cobsDecorReset(); cobsDecorShed(t); out.shed.push([COBS_DECOR.shed.filter(function(p){ return p.k === 'glass'; }).length, COBS_DECOR.shed.filter(function(p){ return p.k === 'cloud'; }).length]); });
      cobsDecorReset(); for (var i=0;i<40;i++) cobsDecorHit(); out.emptied = Object.keys(COBS_DECOR.fallen).length; out.shelves = COBS_SHELF.length;
      var err = null; try { drawCobsDecor(); } catch(e){ err = String(e); } out.err = err; return out;`);
    expect(r.shed.map((x) => x[0]), 'more glass each tier').toEqual([6, 10, 16, 26]);
    expect(r.shed.map((x) => x[1]), 'the cloud sheds from tier 4').toEqual([0, 0, 5, 5]);
    expect(r.emptied, 'a product off its shelf for every big impact, until the shelves are empty').toBe(r.shelves);
    expect(r.err).toBe(null);
  });
});

describe('BIGGER MOVEMENT -- off the top of the screen and back at every tier line, and the fight opens the same way', () => {
  it('at a tier line he drops what he was winding up, flies off the top of the screen, and comes back in from the far edge of it; no turn starts until he is back', () => {
    const r = RAW(`
      s._hop = null; floorAt(you, WW*0.5); you.controller = 'still'; you.invuln = 99999; s.x = you.x + 200; s.y = you.y - 200; s._atkTimer = 1; projectiles = [];
      cobsFightTelegraph(s, 'hands', you); var tel0 = s._tel; s.hp = 2000; step(); var hop0 = s._hop && s._hop.ph, tel1 = s._tel, atk = s._atkTimer;
      var minY = 1e9, top = null, inX = null, phases = [hop0], turns = 0, back = null, prevPh = hop0;
      for (var i=0;i<120;i++){ you.invuln = 99999; step(); var ph = s._hop ? s._hop.ph : '-'; if (ph !== prevPh){ phases.push(ph); prevPh = ph; }
        if (s._hop){ minY = Math.min(minY, s.y); top = cobsTopY(); if (s._hop.ph === 'in' && inX === null) inX = s.x; } if (s._tel > 0 && s._hop) turns++; if (!s._hop && back === null) back = i; }
      var z = viewZoom(), vl = camX + W/2 - (W/2)/z, vr = camX + W/2 + (W/2)/z;
      return { tel0: tel0, tel1: tel1, hop0: hop0, atk: atk, minY: minY, top: top, inX: inX, vl: vl, vr: vr, you: you.x, phases: phases, turns: turns, back: back, dist: Math.hypot(s.x - you.x, s.y - you.y), tier: cobsTier(s) };`);
    expect(r.tel0).toBeGreaterThan(0);
    expect(r.tel1, 'the wind-up is dropped').toBe(0);
    expect(r.tier).toBe(2);
    expect(r.hop0).toBe('up');
    expect(r.phases, 'up, out of sight, in, home').toEqual(['up', 'gone', 'in', '-']);
    expect(r.minY, 'off the top of the screen').toBeLessThan(r.top);
    const farFromYou = Math.abs(r.inX - r.you) > Math.abs((r.you - r.vl > r.vr - r.you ? r.vr : r.vl) - r.you) - 500;
    expect(farFromYou, 'he comes back in at the screen\'s far edge from you').toBe(true);
    expect(r.atk, 'no turn is due until he is back').toBeGreaterThan(60);
    expect(r.turns, 'and none starts while he is away').toBe(0);
    expect(r.back).toBeGreaterThan(40);
    expect(r.back).toBeLessThan(75);
    expect(r.dist, 'back on his orbit round you').toBeLessThan(900);
  });

  it('the fight opens from above: he comes in off the top as every tier line does, and says his GREETINGS once he is in view; the speech waits for the 1500 line\'s hop', () => {
    const r = RAW(`
      var out = { hop: s._hop && { ph: s._hop.ph, intro: !!s._hop.intro } }, minY = 1e9, top = null, phases = [], prev = '';
      you.controller = 'still'; for (var i=0;i<100;i++){ you.invuln = 99999; step(); var ph = s._hop ? s._hop.ph : '-'; if (ph !== prev){ phases.push(ph); prev = ph; } if (s._hop){ minY = Math.min(minY, s.y); top = cobsTopY(); } }
      out.phases = phases; out.minY = minY; out.top = top; out.banner = window.__lastBanner && window.__lastBanner.text;
      s._atkTimer = 1e9; s.hp = 1500; step(); var spoke0 = s._spoke, hopped = !!s._hop; for (var i=0;i<100 && s._hop;i++){ step(); if (s._spoke) out.spokeDuringHop = true; } step(); out.spoke0 = spoke0; out.hopped = hopped; out.spokeAfter = s._spoke;
      return out;`);
    expect(r.hop).toEqual({ ph: 'gone', intro: true });
    expect(r.phases, 'out of sight, then in, then home').toEqual(['gone', 'in', '-']);
    expect(r.minY, 'from above the screen').toBeLessThan(r.top);
    expect(r.hopped).toBe(true);
    expect(r.spoke0, 'the speech is not said over the hop').toBe(false);
    expect(r.spokeDuringHop).toBeUndefined();
    expect(r.spokeAfter, 'it begins when he is back').toBe(true);
  });

  it('the hop is cancelled cleanly by his death, and his dive is not (the dive is its own move)', () => {
    const r = RAW(`
      s._hop = null; s.hp = 2000; step(); var hopping = !!s._hop; s.hp = 0; step(); return { hopping: hopping, hop: s._hop, dying: s._dying };`);
    expect(r.hopping).toBe(true);
    expect(r.hop, 'dead men do not hop').toBe(null);
    expect(r.dying).toBe(150);
  });
});

describe('HIS ENDING -- "[A big explosion starts, turning Steve Cobs into popcorn, killing him.]"', () => {
  const END = (frames) => RAW(`
    s._hop = null; floorAt(you, WW*0.5 - 400); you.controller = 'still'; s.x = WW*0.5; s.y = groundY() - 200; s._atkTimer = 1e9;
    var said = []; if (!window.__endTap){ window.__endTap = true; var _b = banner; banner = function(t, m, k, l){ said.push(String(t)); return _b(t, m, k, l); }; }
    s.hp = 0; var out = { swell: [], gone: null, corn: 0, husk: 0, boomAt: null, rest: 0 }; var f = 0;
    for (var i=0;i<${frames} && running;i++){ you.invuln = 99999; step(); f++; if (s._swell) out.swell.push(Math.round(s._swell*100)/100);
      if (s._gone && out.gone === null){ out.gone = f; out.boomAt = f; } }
    out.corn = cobsFx.filter(function(e){ return e.kind === 'corn'; }).length; out.husk = cobsFx.filter(function(e){ return e.kind === 'husk'; }).length;
    out.rest = cobsFx.filter(function(e){ return e.kind === 'corn' && e.rest; }).length; out.restHusk = cobsFx.filter(function(e){ return e.kind === 'husk' && e.rest; }).length;
    out.won = COBSFIGHT.won; out.running = running; out.said = said; out.dying = s._dying; out.total = COBS_END.total; out.life = s.life;
    var err = null; try { drawCobsFx(); drawBossSprite(s); drawArenaDecor('meeplehq'); } catch(e){ err = String(e && e.stack || e); } out.err = err;
    return out;`);

  it('he stops and swells, popping kernels, for the build-up; then the boom: he is gone, popcorn bursts out, and his burnt husk falls where he hung', () => {
    const r = END(80);
    expect(r.swell.length, 'swelling before the boom').toBeGreaterThan(25);
    expect(Math.max(...r.swell), 'to a third again his size').toBeGreaterThan(1.2);
    expect(r.gone, 'the boom after the build-up (the frame that notices he fell, then 34 of swelling)').toBe(34 + 2);
    expect(r.corn, 'popped kernels burst out').toBeGreaterThanOrEqual(40);
    expect(r.husk, 'and the husk falls').toBe(1);
    expect(r.err).toBe(null);
    expect(r.won, 'the fight is not over yet: the scene is still playing').toBe(false);
  });

  it('the popcorn and the husk fall, bounce twice at most, and lie on the surfaces under them; the scene is COBS_END.total frames, silent, and then the fight ends as it always did', () => {
    const r = END(150 + 4);
    expect(r.rest, 'the popcorn comes to rest').toBeGreaterThan(r.corn*0.6);
    expect(r.restHusk, 'the husk lies where it fell').toBe(1);
    expect(r.won, 'then the fight ends').toBe(true);
    expect(r.said, 'NO TEXT: not a banner, not his last words').toEqual([]);
    expect(r.running, 'the match is over').toBe(false);
  });

  it('his prize reveal still follows it, unchanged: the fight\'s onEnd gets (true, result) once, then the result screen reads "Steve Cobs is beaten!"', () => {
    const r = RAW(`
      s._hop = null; var calls = []; COBSFIGHT.onEnd = function(won, result){ calls.push([won, !!result, result && result.story]); return true; };
      s.hp = 0; for (var i=0;i<160 && running;i++){ you.invuln = 99999; step(); }
      return { calls: calls, title: document.getElementById('resultTitle').textContent, over: COBSFIGHT.over };`);
    expect(r.calls).toEqual([[true, true, true]]);
    expect(r.title).toBe('Steve Cobs is beaten!');
    expect(r.over).toBe(true);
  });

  it('is not in BOSS_ENDINGS (he is not a Boss Rush boss): the ending plays in his own fight flow', () => {
    const r = W.eval(`({ has: Object.prototype.hasOwnProperty.call(BOSS_ENDINGS, 'cobsfight'), keys: Object.keys(BOSS_ENDINGS), total: COBS_END.total })`);
    expect(r.has).toBe(false);
    expect(r.total, 'a short scene: two and a half seconds').toBeLessThanOrEqual(180);
  });
});

describe('his shots wear the show\'s art, credited; nothing of his fight is online', () => {
  const FILES = ['cobsknife', 'cobslolli1', 'cobslolli2', 'cobsboomerang', 'cobsvan', 'cobspopcorn'];
  it('the six new files exist, are real PNGs at projectile size with air round them, and are in the manifest and the credits with their exact sources', () => {
    const manifest = JSON.parse(readFileSync('scripts/attack-sprite-manifest.json', 'utf8')), credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    for (const k of FILES) {
      const path = `artifacts/V1/assets/sprites/attacks/${k}.png`;
      expect(existsSync(path), k).toBe(true);
      const png = PNG.sync.read(readFileSync(path));
      expect(Math.max(png.width, png.height), `${k} projectile-sized`).toBeLessThanOrEqual(128);
      expect(Math.max(png.width, png.height)).toBeGreaterThanOrEqual(24);
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      expect(clear / (png.width * png.height), `${k} is an object, not a rectangle`).toBeGreaterThan(0.1);
      expect(manifest[k].source, k).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/inanimateinsanity\/images\//);
      expect(credits).toContain(`(${k}.png)`); expect(credits).toContain(manifest[k].source);
    }
    expect(PNG.sync.read(readFileSync('artifacts/V1/assets/sprites/attacks/cobsknife.png')).height, 'the knife stands upright: tip up').toBeGreaterThan(PNG.sync.read(readFileSync('artifacts/V1/assets/sprites/attacks/cobsknife.png')).width*3);
    const picks = readFileSync('scripts/fetch-attack-sprites.mjs', 'utf8');
    for (const k of FILES) expect(picks, `${k} has a pick`).toMatch(new RegExp(`\\n  ${k}:\\s+\\{`));
  });

  it('each is wired to the shot that throws it (ATTACK_SPRITES, by shape), with a drawn glyph to fall back on; the glove draws the Fist Thingy\'s art; his chainsaws keep Saw\'s blade', () => {
    const r = W.eval(`(function(){ var k = { meepleknife:1, cobslolli1:1, cobslolli2:1, cobsboomerang:1, meeplevan:1, popcorn:1, cobspencil:1 }, out = {};
      Object.keys(k).forEach(function(n){ out[n] = [!!ATTACK_SPRITES[n], !!PROJ_SHAPE[n], ATTACK_SPRITES[n] && ATTACK_SPRITES[n].src]; });
      return { out: out, glove: typeof PROJ_SHAPE.cobsglove.draw, sawArt: ATTACK_SPRITES.saw.src, shapes: { boomerangs: 'cobsboomerang', glove: 'cobsglove' }, mp4: !!PROJ_SHAPE.fistthingy }; })()`);
    for (const n of Object.keys(r.out)) { expect(r.out[n][0], `${n} art`).toBe(true); expect(r.out[n][1], `${n} glyph`).toBe(true); expect(existsSync(`artifacts/V1/${r.out[n][2]}`), `${n} file`).toBe(true); }
    expect(r.glove).toBe('function');
    expect(r.sawArt).toMatch(/sawblade\.png$/);
    expect(r.mp4, 'MePhone4\'s glove keeps its own glyph').toBe(true);
    const shots = W.eval(`(function(){ var T = cobsT({ _marks:2 }, 'boomerangs'); return { b: String(COBS_MOVES.boomerangs).indexOf("shape:'cobsboomerang'") >= 0, g: String(COBS_MOVES.device).indexOf("shape:'cobsglove'") >= 0, k: String(COBS_MOVES.meknife).indexOf("shape:'meepleknife'") >= 0, v: String(COBS_MOVES.van).indexOf("shape:'meeplevan'") >= 0 }; })()`);
    expect(shots).toEqual({ b: true, g: true, k: true, v: true });
  });

  it('his fight is local only: a netcode session cannot start it, so nothing of it needs to ride the snapshot', () => {
    const r = W.eval(`(function(){ var was = inNetSession; inNetSession = function(){ return true; }; var ok = startCobsFight(['Knife'], { story:true }); inNetSession = was; return ok; })()`);
    expect(r).toBe(false);
  });
});

// ==== THE GLITCH PASS (2026-10-01): what scripts/boss-glitch.mjs found in his fight ====
describe('the glitch pass: his fight on a canvas that keeps the old alpha, and a cuff that kept to the engine\'s grace', () => {
  it('the van\'s lane marker draws at an alpha the canvas keeps (0.5 + pulse peaks at 1.05)', async () => {
    const { w, errors } = await bootValidating();
    w.eval(`(function(){
      SETTINGS.itemRate = 0; SETTINGS.stocks = 3; LOCAL_PLAYERS = 1;
      startCobsFight(['Knife'], { story:true, onEnd:function(){ return true; } });
      var s = summons.find(function(o){ return o._cobsFight; });
      s._hop = null; s._atkTimer = 1e9; fighters[0].controller = 'still';
      s._tel = 30; s._telKind = 'van'; s._vanFrom = true;
      hazardT = 3;                                          // sin(hazardT * 0.5) at its top: the pulse at 0.55
    })()`);
    errors.length = 0;
    w.eval('draw()');
    expect(errors.filter((e) => e.kind === 'ctx-ignored' && e.key === 'globalAlpha'), 'no alpha the canvas ignores').toEqual([]);
  });

  it('two MeTags on you in the same frame cuff you once: the second waits out the grace of the first, as the barrier link and every shot do (it cuffed twice in a frame, 33% with no grace between)', () => {
    const r = fight(`
      park(); atTier(2); floorAt(you, WW*0.5); you.invuln = 0; s.x = you.x + 400; s.y = you.y - 250; projectiles = []; summons = summons.filter(function(m){ return m === s; });
      cobsFightTelegraph(s, 'metags', you); s._tel = 0; COBS_MOVES.metags(s, you, ++BOSS_ATK_ID);
      var tags = summons.filter(function(m){ return m.type === 'metag'; }), a = tags[0], b = tags[1], hits = [], i = 0, AH = applyHit;
      applyHit = function(t, d, kx, ky, from, o){ if (o && o.bossAtk != null && t === you) hits.push({ f: i, inv: you.invuln }); return AH.apply(this, arguments); };
      try {
        for (i = 0; i < 60; i++){
          s._atkTimer = 1e9;
          // both tags are on you at the start; after that only the second is (the first has its own wait after a cuff)
          [a, b].forEach(function(m, k){ if (i === 0 || k === 1){ m.x = you.x; m.y = hurtCY(you); m.vx = m.vy = 0; m._cd = 0; } });
          step();
        }
      } finally { applyHit = AH; }
      return { hits: hits, grace: you.invuln };`);
    expect(r.hits.length, 'both tags cuffed in the end').toBeGreaterThanOrEqual(2);
    expect(r.hits[0].f, 'the first cuff, on the first frame').toBe(0);
    expect(r.hits[1].f - r.hits[0].f, 'the second not until the first\'s grace (9 + 0.6 of the hit, at most 24 frames) was over').toBeGreaterThanOrEqual(12);
  });
});
