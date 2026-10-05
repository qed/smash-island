import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';
import { mulberry32 } from './helpers/prng.js';

// STEVE COBS, TUNED BY THE OWNER (2026-10-05). The owner, verbatim: "some of cob's attacks are too easy, some too hard." Asked which, he picked four buffs and
// a nerf: too easy ("I hardly notice these 3"): FREE SAMPLES!, PORTAL, SPIKES -- and "hardly notice the attacks i didnt click": DELETION, TICK TOCK!, MeMURDER, which
// got buffs too; too hard: LOCKDOWN (the MeTags). Every buff is "harder, same damage": harder to dodge, never more damage per hit and never faster unless it is
// written below; every hit keeps its attack's one bossAtk id; the tells stay readable; and a twist the owner moved to tier 1 overrides "twists from tier 2".
// And one new thing: "and a-maze-ing should be called "mazed and confused", and be a hazard in the cobs fight."
// This file is what the tuning added; the pins it moved are updated in test/boss-cobs-fight.test.js, test/boss-steve-cobs.test.js and test/boss-mephone4.test.js
// (each names the owner's pick). Nothing here is a bar for difficulty ("dont tune, cuz thats an agent, not a player"): every assertion is what the pick says.

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

// ================= 1. FREE SAMPLES! =================
// "remove the crumbs chasing thing, they should just have the thing like the van where they ride off platforms."
describe('OWNER: FREE SAMPLES! -- no chasing, and the crumbs ride the way the van does', () => {
  // a box bursts on the floor at `x` (the burst is the same one a landed box makes) and the crumbs are watched for `frames` frames while `move` runs each frame
  const BURST = (tier, x, frames, move) => fight(`
    park(); you.invuln = 99999; atTier(${tier}); projectiles = []; floorAt(you, WW*0.5 + 900);
    var gy = groundY(), T = cobsT(s, 'samples'), box = { x:${x}, y:gy - 6, r:12, life:1, bossAtk:++BOSS_ATK_ID, warnX:${x}, warnY:gy };
    COBS_DIE.sample(s, box, { T:T, dmg:13.2, cap:13.2 });
    var cs = projectiles.filter(function(p){ return p._crumb; }), side0 = cs.map(function(p){ return Math.sign(p.vx); }), flipped = 0, homing = 0, aimed = 0, minX = 1e9, maxX = -1e9;
    for (var i=0;i<${frames};i++){ s._atkTimer = 1e9; ${move} step(); you.invuln = 99999;
      cs.forEach(function(p, k){ if (p.life <= 0) return; if (p.vx !== 0 && Math.sign(p.vx) !== side0[k]) flipped++; if (p.homing || p.aimWindow || p._aim || p._home) homing++; if (p.noAim !== true) aimed++; }); }
    return { n: cs.length, per: T.crumbs, flipped: flipped, homing: homing, aimed: aimed, drive: cs.map(function(p){ return p.drive; }), phase0: cs.map(function(p){ return p.phase; }), vanDrive: typeof vanDrive, oldStep: typeof cobsCrumbStep, T: T };`);

  it('NOTHING CHASES: a crumb leaves toward the side it burst to and keeps it -- never turned toward a fighter, however one runs past it, stands behind it or jumps over it; no crumb homes or is aimed', () => {
    // the fighter runs through the crumbs' lane every frame, from one side to the other, in the air and on the floor
    const r = BURST(5, 'WW*0.5', 60, `you.x = WW*0.5 + (i % 40 < 20 ? -1 : 1)*(40 + (i*13) % 160); you.y = groundY() - you.r - (i % 30 < 12 ? 90 : 0); you.vx = 0; you.vy = 0;`);
    expect(r.n, 'tier 5: four crumbs a side').toBe(2 * r.per);
    expect(r.flipped, 'no crumb ever changes the way it runs').toBe(0);
    expect(r.homing, 'no homing, no aim window, no steering field on a crumb').toBe(0);
    expect(r.aimed, 'every crumb is a noAim shot').toBe(0);
  });

  it('they ride the VAN\'S way: the shared drive:\'roll\' of vanDrive does it, with no riding code of his own left to drift from it', () => {
    const r = BURST(1, 'WW*0.5', 12, '');
    expect(r.vanDrive).toBe('function');
    expect(r.oldStep, 'cobsCrumbStep (the old hand-made ride) is gone').toBe('undefined');
    expect(r.drive.every((d) => d === 'roll'), 'the van\'s roller').toBe(true);
    expect(r.n, 'tier 1: two a side').toBe(4);
  });

  it('a crumb stops dead at a wall in its lane, as the van\'s roller does (a pane, a MeTag\'s wall, a hedge): the crumbs on that side are gone, the other side runs on', () => {
    const r = fight(`
      park(); you.invuln = 99999; atTier(2); projectiles = []; floorAt(you, WW*0.5 + 1200);
      var gy = groundY(), T = cobsT(s, 'samples'), X = WW*0.5, wallX = X + 150;
      worldPlats.push({ x:wallX, y:gy - 260, w:20, h:260, solid:true, _cobsWall:true, _until:hazardT + 99999 });
      COBS_DIE.sample(s, { x:X, y:gy - 6, r:12, life:1, bossAtk:++BOSS_ATK_ID, warnX:X, warnY:gy }, { T:T, dmg:13.2, cap:13.2 });
      var cs = projectiles.filter(function(p){ return p._crumb; }), right = cs.filter(function(p){ return p.vx > 0; }), left = cs.filter(function(p){ return p.vx < 0; }), pastWall = 0;
      for (var i=0;i<80;i++){ s._atkTimer = 1e9; step(); you.invuln = 99999; right.forEach(function(p){ if (p.life > 0 && p.x > wallX + 12) pastWall++; }); }
      return { nr: right.length, nl: left.length, rightAlive: right.filter(function(p){ return p.life > 0; }).length, leftAlive: left.filter(function(p){ return p.life > 0; }).length, pastWall: pastWall };`);
    expect(r.nr).toBe(r.nl);
    expect(r.rightAlive, 'the wall stopped them').toBe(0);
    expect(r.pastWall, 'and none got through it').toBe(0);
    expect(r.leftAlive, 'the other side is untouched').toBeGreaterThan(0);
  });

  it('keep the crumbs as they are: the tier\'s count a side, the tier\'s run, the poison, and one id for the box and every crumb (same damage)', () => {
    const r = fight(`
      park(); you.invuln = 99999; projectiles = []; floorAt(you, WW*0.5 + 1200); var out = {};
      [1, 2, 3, 4, 5].forEach(function(t){ atTier(t); projectiles = []; var gy = groundY(), T = cobsT(s, 'samples'), id = ++BOSS_ATK_ID;
        COBS_DIE.sample(s, { x:WW*0.5, y:gy - 6, r:12, life:1, bossAtk:id, warnX:WW*0.5, warnY:gy }, { T:T, dmg:13.2, cap:13.2 });
        var cs = projectiles.filter(function(p){ return p._crumb; });
        out['t' + t] = { n: cs.length, want: 2*T.crumbs, spd: cs.every(function(p){ return Math.abs(Math.abs(p.vx) - T.cspd) < 1e-9; }), ids: new Set(cs.map(function(p){ return p.bossAtk; })).size, id: cs[0].bossAtk === id,
          poison: cs.every(function(p){ return p.fxTag === 'poison' && p.fxN === T.fxN; }), dmg: cs[0].dmg, cap: cs[0].bossCap, life: cs[0].life }; });
      return out;`);
    for (let t = 1; t <= 5; t++) {
      const q = r['t' + t];
      expect(q.n, `tier ${t}`).toBe(q.want); expect(q.spd).toBe(true); expect(q.ids).toBe(1); expect(q.id).toBe(true); expect(q.poison).toBe(true);
      expect(q.dmg, 'half a hit, as before').toBeCloseTo(6.6, 5); expect(q.cap, 'the box\'s own cap').toBeCloseTo(13.2, 5);
    }
    expect([1, 2, 3, 4, 5].map((t) => r['t' + t].n), '4, 4, 6, 6, 8: unchanged').toEqual([4, 4, 6, 6, 8]);
  });
});

// ================= 2. PORTAL =================
// "two from the start" -- a second portal from tier 1 (was tier 3), and the pull from tier 1. Plus "Stronger pull", "Three portals", "Portals drift to you", "Burst into shots".
describe('OWNER: MEEPLE PORTAL! -- two from the start, three from tier 3, a stronger pull, they drift to you, and they burst into shots', () => {
  const OPEN = (t, extra = '') => fight(`
    park(); atTier(${t}); floorAt(you, WW*0.5); you.invuln = 99999; projectiles = []; s._portals = [];
    cobsFightTelegraph(s, 'portal', you); var tel = { x:s._telX, y:s._telY }; var spots = cobsPortalSpots(s, you, cobsT(s, 'portal')); s._tel = 0; var id = ++BOSS_ATK_ID; COBS_MOVES.portal(s, you, id);
    var T = cobsT(s, 'portal'), P = s._portals.slice(); ${extra}
    return { T: T, n: P.length, xs: P.map(function(p){ return Math.round(p.x); }), ys: P.map(function(p){ return Math.round(p.y); }), ids: new Set(P.map(function(p){ return p.id; })).size, id: P[0] && P[0].id === id,
      spots: spots.map(function(q){ return [Math.round(q.x), Math.round(q.y)]; }), tel: tel, you: Math.round(you.x), dmg: P[0].dmg, drift: P.map(function(p){ return p.drift; }), ring: P.map(function(p){ return p.ring; }), T0: P.map(function(p){ return p.T; }) };`);

  it('TWO FROM THE START, THREE FROM TIER 3: n is 2, 2, 3, 3, 3, the first where you stood and the rest 150 px apart round it, on the attack\'s one id', () => {
    const rs = [1, 2, 3, 4, 5].map((t) => OPEN(t));
    expect(rs.map((r) => r.n), '"two from the start" (a second portal from tier 1, was tier 3) and "Three portals" (a third from tier 3)').toEqual([2, 2, 3, 3, 3]);
    expect(rs.map((r) => r.T.n)).toEqual([2, 2, 3, 3, 3]);
    for (const r of rs) {
      expect(r.xs[0], 'the first opens where you stood').toBeCloseTo(r.tel.x, 0);
      expect(Math.abs(r.xs[1] - r.xs[0]), 'the second 150 px off').toBe(150);
      if (r.n === 3) expect(Math.abs(r.xs[2] - r.xs[0]), 'the third 150 px off the other way').toBe(150);
      if (r.n === 3) expect(r.xs[1] + r.xs[2], 'one each side').toBe(2 * r.xs[0]);
      expect(r.ids, 'one attack, one id').toBe(1); expect(r.id).toBe(true);
      expect(r.spots.map((q) => q[0]), 'the tell marks exactly where they open').toEqual(r.xs);
    }
  });

  it('the damage is the same: each tier\'s hit is its row\'s dmg x 33 (0.8, 0.85, 0.9, 0.95, 1.0), so a second and a third portal are more places to be hit, never a harder hit', () => {
    const rs = [1, 2, 3, 4, 5].map((t) => OPEN(t));
    expect(rs.map((r) => r.T.dmg)).toEqual([0.8, 0.85, 0.9, 0.95, 1.0]);
    expect(rs.map((r) => Math.round(r.dmg * 100) / 100)).toEqual([26.4, 28.05, 29.7, 31.35, 33]);
    expect(rs.map((r) => r.T.kb), 'and the launch is untouched').toEqual([8, 9, 9, 10, 11]);
  });

  it('PORTALS DRIFT TO YOU: each creeps toward the nearest of you at the tier\'s px a frame while it stays open (0.5 to 0.9), never faster', () => {
    const run = (t) => fight(`
      park(); atTier(${t}); floorAt(you, WW*0.5 + 700); you.invuln = 99999; projectiles = []; s._portals = [];
      var T = cobsT(s, 'portal'), gy = groundY();
      s._portals.push({ x:WW*0.5, y:gy - 60, t:60, T:60, id:++BOSS_ATK_ID, dmg:20, kb:8, hit:{}, pull:0, pullR:0, drift:T.drift, ring:0, ringSpd:0 });
      var P = s._portals[0], x0 = P.x, y0 = P.y, maxStep = 0, px = P.x, py = P.y;
      for (var i=0;i<30;i++){ s._atkTimer = 1e9; you.invuln = 99999; step(); maxStep = Math.max(maxStep, Math.hypot(P.x - px, P.y - py)); px = P.x; py = P.y; }
      return { T: T, dx: P.x - x0, dy: P.y - y0, maxStep: maxStep, you: you.x, x0: x0 };`);
    const rs = [1, 2, 3, 4, 5].map(run);
    expect(rs.map((r) => r.T.drift), 'slow at the start, steadier as it climbs').toEqual([0.5, 0.6, 0.7, 0.8, 0.9]);
    for (const r of rs) {
      expect(r.dx, 'toward you (you are to the right)').toBeGreaterThan(0.9 * 30 * r.T.drift * 0.9);
      expect(r.maxStep, 'never faster than its px a frame').toBeLessThanOrEqual(r.T.drift + 1e-9);
    }
  });

  it('a portal never drifts through the floor or off the world, and one with no drift (a hand-placed portal) stays where it was put', () => {
    const r = fight(`
      park(); atTier(5); floorAt(you, 400); you.invuln = 99999; projectiles = []; var gy = groundY(), T = cobsT(s, 'portal');
      s._portals = [{ x:WW - 70, y:gy - 35, t:200, T:200, id:++BOSS_ATK_ID, dmg:20, kb:8, hit:{}, pull:0, pullR:0, drift:T.drift, ring:0 }, { x:900, y:gy - 60, t:200, T:200, id:++BOSS_ATK_ID, dmg:20, kb:8, hit:{}, pull:0, pullR:0 }];
      var still = s._portals[1], x1 = still.x, y1 = still.y, lowest = 0, widest = 0;
      for (var i=0;i<120;i++){ s._atkTimer = 1e9; you.invuln = 99999; step(); s._portals.forEach(function(p){ lowest = Math.max(lowest, p.y); widest = Math.max(widest, p.x); }); }
      return { lowest: lowest, gy: gy, widest: widest, WW: WW, still: [still.x - x1, still.y - y1] };`);
    expect(r.lowest, 'never below gy - 30').toBeLessThanOrEqual(r.gy - 30 + 1e-9);
    expect(r.widest, 'never off the world').toBeLessThanOrEqual(r.WW - 60 + 1e-9);
    expect(r.still, 'no drift field, no drift').toEqual([0, 0]);
  });

  it('BURST INTO SHOTS: when a portal\'s time is up it throws an even ring of small shots (6, 6, 8, 8, 10) at the tier\'s speed, on the portal\'s id, at 0.4 of its hit -- and the whole attack stays one portal hit', () => {
    const run = (t) => fight(`
      park(); atTier(${t}); floorAt(you, 300); you.invuln = 99999; projectiles = []; s._portals = []; var T = cobsT(s, 'portal'), gy = groundY(), id = ++BOSS_ATK_ID, dmg = cobsDmg()*T.dmg;
      var X = WW*0.5, P = { x:X, y:gy - 60, t:2, T:T.T, id:id, dmg:dmg, kb:T.kb, hit:{}, pull:0, pullR:0, drift:0, ring:T.ring, ringSpd:T.ringSpd, turn:Math.PI/T.ring }; s._portals = [P];
      var before = shots().length; s._atkTimer = 1e9; step(); var mid = shots().length; s._atkTimer = 1e9; step();
      var ring = shots().filter(function(p){ return p.cobsPortalShot; });
      var ang = ring.map(function(p){ return Math.atan2(p.vy, p.vx); }).sort(function(a, b){ return a - b; });
      var gaps = ang.map(function(a, i){ var b = ang[(i + 1) % ang.length]; var d = b - a; if (d <= 0) d += Math.PI*2; return Math.round(d*1000)/1000; });
      return { T: T, n: ring.length, spd: ring.map(function(p){ return Math.round(Math.hypot(p.vx, p.vy)*1000)/1000; }), ids: new Set(ring.map(function(p){ return p.bossAtk; })).size, id: ring.every(function(p){ return p.bossAtk === id; }),
        dmg: ring[0].dmg, want: dmg*0.4, cap: ring[0].bossCap, capWant: dmg, r: ring[0].r, gaps: gaps, left: s._portals.length, mid: mid, before: before };`);
    const rs = [1, 2, 3, 4, 5].map(run);
    expect(rs.map((r) => r.n), 'a ring of 6, 6, 8, 8, 10').toEqual([6, 6, 8, 8, 10]);
    expect(rs.map((r) => r.T.ringSpd)).toEqual([6, 6.5, 7, 7.5, 8]);
    for (const r of rs) {
      expect(r.mid, 'nothing flies until it bursts').toBe(r.before);
      expect(r.left, 'and the portal is gone').toBe(0);
      expect(r.spd.every((v) => Math.abs(v - r.T.ringSpd) < 0.01), 'at the tier\'s speed').toBe(true);
      expect(r.gaps.every((g) => Math.abs(g - (Math.PI * 2) / r.n) < 0.01), 'evenly round').toBe(true);
      expect(r.id, 'the portal\'s one id').toBe(true); expect(r.ids).toBe(1);
      expect(r.dmg, 'small: 0.4 of the portal\'s hit').toBeCloseTo(r.want, 5);
      expect(r.cap, 'under the portal\'s own cap').toBeCloseTo(r.capWant, 5);
      expect(r.r, 'small shots').toBeLessThanOrEqual(8);
    }
  });

  it('a fighter the portal flung AND the ring reaches takes ONE portal hit in all (one id, one cap); a portal that closed after flinging someone bursts too', () => {
    const r = fight(`
      park(); atTier(3); floorAt(you, WW*0.5); you.invuln = 0; you.pct = 0; projectiles = []; var T = cobsT(s, 'portal'), gy = groundY(), id = ++BOSS_ATK_ID, dmg = cobsDmg()*T.dmg;
      s._portals = [{ x:you.x + 5, y:hurtCY(you), t:60, T:60, id:id, dmg:dmg, kb:T.kb, hit:{}, pull:T.pull, pullR:T.pullR, drift:0, ring:T.ring, ringSpd:T.ringSpd, turn:Math.PI/T.ring }];
      var P = s._portals[0], flung = null, burst = null;
      for (var i=0;i<40;i++){ s._atkTimer = 1e9; step(); if (flung === null && you.pct > 0){ flung = { f:i, pct:you.pct, t:P.t }; } if (burst === null && shots().some(function(p){ return p.cobsPortalShot; })){ burst = i; }
        if (flung !== null && burst !== null && i > burst + 20) break; if (i === 3) you.invuln = 0; }
      return { flung: flung, burst: burst, pct: you.pct, dmg: dmg };`);
    expect(r.flung, 'it flung you').not.toBe(null);
    expect(r.burst, 'and burst once it had shut').not.toBe(null);
    expect(r.flung.t, 'it closed early (10 frames)').toBeLessThanOrEqual(10);
    expect(r.pct, 'the fling and the ring together never exceed one portal hit').toBeLessThanOrEqual(r.dmg + 1e-6);
  });

  it('three portals pull no harder than the strongest one: the vortex is not tripled by the second and third, so a fighter in reach of all of them is never lock-pulled', () => {
    const run = (n) => fight(`
      park(); atTier(5); floorAt(you, WW*0.5); you.invuln = 99999; projectiles = []; var T = cobsT(s, 'portal'), gy = groundY(); s._portals = [];
      for (var i=0;i<${n};i++) s._portals.push({ x:you.x + 120 + i*8, y:you.y, t:60, T:60, id:++BOSS_ATK_ID, dmg:20, kb:8, hit:{}, pull:T.pull, pullR:T.pullR, drift:0, ring:0 });
      var v0 = you.vx; s._atkTimer = 1e9; step(); return { v1: you.vx - v0, pull: T.pull };`);
    const one = run(1), three = run(3);
    expect(one.v1, 'one portal pulls').toBeGreaterThan(0);
    expect(three.v1, 'three on the same side pull as one does (the same strength, a hair different in direction), not three times as hard').toBeLessThan(one.v1 * 1.05);
    expect(three.v1, 'and never more than the strongest one\'s pull').toBeLessThanOrEqual(three.pull + 1e-9);
  });

  it('the tell draws every portal\'s spot and the pull\'s reach (and the ring\'s angles in the last frames of an open portal) without a throw', () => {
    const r = fight(`
      park(); atTier(3); floorAt(you, WW*0.5); you.invuln = 99999; projectiles = []; s._portals = [];
      var err = null; cobsFightTelegraph(s, 'portal', you); s._tel = 20; try { drawCobsFx(); } catch(e){ err = String(e); }
      s._tel = 0; s._telKind = null; COBS_MOVES.portal(s, you, ++BOSS_ATK_ID); s._portals.forEach(function(p){ p.t = 8; }); try { drawCobsFx(); } catch(e){ err = err || String(e); }
      return { err: err, n: s._portals.length };`);
    expect(r.err).toBe(null);
    expect(r.n).toBe(3);
  });
});
