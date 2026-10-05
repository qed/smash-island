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

// ================= 3. SPIKES =================
// "a second row" -- a second row rises right behind the first. And verbatim: "they throw themselves to adjacent platforms near the end of their attack. priority to the
// ones that youre on." Near the end of the attack the spikes leap onto the platforms next to them -- the one you stand on first -- and rise there, with a tell.
describe('OWNER: SUPER DEATH TRAP! -- a second row right behind the first, and the spikes leap to the platforms next to them (the one you stand on first)', () => {
  // seven platforms in a row, 380 px apart (a 140 px gap between their edges) over the floor, the floor alone solid: PL[0..6]
  const LAYOUT = `var gy = groundY(); worldPlats = worldPlats.filter(function(p){ return p.solid; }); var PL = [];
    for (var k=0;k<7;k++){ var pp = { x: WW*0.5 + (k - 3)*380 - 120, y: gy - 260, w: 240, h: 12, solid: false }; PL.push(pp); worldPlats.push(pp); }
    var plIndex = function(q){ for (var k=0;k<PL.length;k++) if (q.warnY === PL[k].y && q.warnX >= PL[k].x && q.warnX <= PL[k].x + PL[k].w) return k; return -1; };
    var standOn = function(k){ you.x = PL[k].x + 120; you.y = PL[k].y - you.r; you.vx = 0; you.vy = 0; };`;

  const ATTACK = (t, where, extra = '') => fight(`
    park(); atTier(${t}); projectiles = []; ${LAYOUT}
    var T = cobsT(s, 'spikes'); floorAt(you, PL[3].x + 120); you.invuln = 99999; s.x = you.x + 500; s.y = you.y - 200; s.face = -1; s._rows = []; s._leaps = []; cobsFx = [];
    s._spikePlats = [PL[2], PL[3]]; s._telX = you.x; s._telY = hurtCY(you); var id = ++BOSS_ATK_ID; COBS_MOVES.spikes(s, you, id);
    var main = projectiles.filter(function(p){ return p.shape === 'spike'; }), last = Math.max.apply(null, main.map(function(p){ return p.delay; })), L = s._leaps[0], t0 = L ? L.t : -1;
    var out = { T: T, nMain: main.length, last: last, t0: t0, ids: new Set(main.map(function(p){ return p.bossAtk; })).size, mainOn: main.map(plIndex) };
    for (var i=0;i<t0 + 1;i++){ s._atkTimer = 1e9; ${where} you.invuln = 99999; step(); }
    var fresh = projectiles.filter(function(p){ return p.shape === 'spike' && main.indexOf(p) < 0; });
    out.fresh = fresh.map(function(q){ return { on: plIndex(q), delay: q.delay, warn: q.warn, id: q.bossAtk, cap: q.bossCap, dmg: q.dmg }; });
    out.leapsFx = cobsFx.filter(function(e){ return e.kind === 'leap'; }).map(function(e){ return { x0: Math.round(e.x0), x1: Math.round(e.x1), life: e.max }; });
    out.platsOn = Array.from(new Set(fresh.map(plIndex))); out.id = id; out.pending = s._leaps.length; ${extra}
    return out;`);

  it('A SECOND ROW: every spot gets a second spike right behind the first, `row2` frames later (18, 16, 14, 13, 12), on the attack\'s one id and cap -- twice the spikes, the same hit', () => {
    const rs = [1, 2, 3, 4, 5].map((t) => ATTACK(t, 'standOn(3);'));
    expect(rs.map((r) => r.T.row2), 'right behind: a beat that tightens').toEqual([18, 16, 14, 13, 12]);
    for (const r of rs) {
      expect(r.ids, 'one id for the whole attack').toBe(1);
      expect(r.nMain % 2, 'two to a spot').toBe(0);
      expect(r.last, 'the last spike rises `row2` frames after the last tile\'s first').toBe(r.T.delay + (r.T.stag > 0 ? 3*r.T.stag : 0) + r.T.row2);
    }
    // the pairs: group the attack's spikes by spot and read their two delays
    const t3 = fight(`
      park(); atTier(3); projectiles = []; ${LAYOUT} var T = cobsT(s, 'spikes'); floorAt(you, PL[3].x + 120); you.invuln = 99999; s.x = you.x + 500; s.y = you.y - 200; s._rows = []; s._leaps = [];
      s._spikePlats = [PL[3]]; s._telX = you.x; s._telY = hurtCY(you); COBS_MOVES.spikes(s, you, ++BOSS_ATK_ID);
      var sp = projectiles.filter(function(p){ return p.shape === 'spike'; }), spots = {};
      sp.forEach(function(p){ var k = Math.round(p.warnX); (spots[k] = spots[k] || []).push(p); });
      return { T: T, spots: Object.keys(spots).map(function(k){ return spots[k].map(function(p){ return [p.delay, p.warn, p.dmg, p.bossCap, p.kb]; }); }) };`);
    expect(t3.spots.length, 'a spike every 40 px').toBeGreaterThanOrEqual(5);
    for (const sp of t3.spots) {
      expect(sp.length, 'two a spot').toBe(2);
      expect(sp[1][0] - sp[0][0], 'the second right behind the first').toBe(t3.T.row2);
      expect(sp[1][1], 'its shadow stays up the whole way to the second rising').toBe(sp[1][0]);
      expect(sp[1][2], 'the same damage').toBe(sp[0][2]); expect(sp[1][3]).toBe(sp[0][3]); expect(sp[1][4]).toBe(sp[0][4]);
    }
  });

  it('a fighter on the platform takes ONE spike hit however many spikes of however many rows reach them (one id, one cap)', () => {
    const r = fight(`
      park(); atTier(1); projectiles = []; ${LAYOUT} var T = cobsT(s, 'spikes'); floorAt(you, PL[3].x + 120); you.pct = 0; s.x = you.x + 500; s.y = you.y - 200; s._rows = []; s._leaps = [];
      s._spikePlats = [PL[3]]; s._telX = you.x; s._telY = hurtCY(you); var dmg = cobsDmg()*T.dmg; COBS_MOVES.spikes(s, you, ++BOSS_ATK_ID);
      you.x = PL[3].x + 120; you.y = PL[3].y - you.r; you.vx = 0; you.vy = 0; var hits = 0;
      for (var i=0;i<140;i++){ s._atkTimer = 1e9; var p0 = you.pct; you.invuln = 0; step(); if (you.pct > p0) hits++; if (you.hitstun <= 0 && i > T.delay + 30){ you.x = PL[3].x + 120; you.y = PL[3].y - you.r; you.vx = 0; you.vy = 0; } }
      return { pct: you.pct, dmg: dmg, hits: hits };`);
    expect(r.hits, 'the spikes landed').toBeGreaterThan(0);
    expect(r.pct, 'one hit however many spikes').toBeLessThanOrEqual(r.dmg + 1e-6);
  });

  it('THE LEAP, near the end of the attack: `lead` frames before the last spike rises the spikes leap to a platform next to the ones raised -- the one you STAND ON first', () => {
    for (const [on, want] of [[4, 4], [1, 1]]) {
      const r = ATTACK(1, `standOn(${on});`);
      expect(r.t0, 'the leap is scheduled `lead` frames before the last spike rises').toBe(r.last - r.T.lead);
      expect(r.mainOn.every((k) => k === 2 || k === 3), 'the attack raised the two platforms it was given').toBe(true);
      expect(r.platsOn, `tier 1 leaps to ONE platform: the one you stand on (${want})`).toEqual([want]);
      expect(r.pending, 'and the leap is spent').toBe(0);
    }
    const t3 = ATTACK(3, 'standOn(4);');
    expect(t3.platsOn.length, 'tier 3 leaps to two (both are next to the raised pair)').toBe(2);
    expect(t3.platsOn[0], 'the one you stand on first').toBe(4);
    expect(new Set(t3.platsOn)).toEqual(new Set([1, 4]));
    const t5 = ATTACK(5, 'standOn(1);');
    expect(t5.T.leap).toBe(3);
    expect(t5.platsOn.length, 'only two platforms are next to the raised pair here: it leaps to them, no further').toBe(2);
  });

  it('with nobody on a candidate it goes to the one nearest to you, and it never leaps past `adj`, to the floor or onto a platform already spiked', () => {
    const r = ATTACK(1, 'you.x = PL[4].x + 120; you.y = groundY() - you.r; you.vx = 0; you.vy = 0;');
    expect(r.platsOn, 'on the floor under PL[4]: PL[4] is the nearest').toEqual([4]);
    const far = ATTACK(1, 'you.x = PL[6].x + 120; you.y = PL[6].y - you.r; you.vx = 0; you.vy = 0;');
    expect(far.platsOn, 'PL[6] is two platforms off the raised pair: out of reach, so the leap goes to the nearest one that is not').toEqual([4]);
    const none = fight(`
      park(); atTier(1); projectiles = []; ${LAYOUT} worldPlats = worldPlats.filter(function(p){ return p.solid || p === PL[3]; });
      var T = cobsT(s, 'spikes'); floorAt(you, PL[3].x + 120); you.invuln = 99999; s.x = you.x + 500; s._rows = []; s._leaps = []; cobsFx = [];
      s._spikePlats = [PL[3]]; s._telX = you.x; s._telY = hurtCY(you); COBS_MOVES.spikes(s, you, ++BOSS_ATK_ID);
      var main = projectiles.filter(function(p){ return p.shape === 'spike'; }); for (var i=0;i<s._leaps[0].t + 2;i++){ s._atkTimer = 1e9; you.invuln = 99999; step(); }
      var fresh = projectiles.filter(function(p){ return p.shape === 'spike' && main.indexOf(p) < 0; });
      return { fresh: fresh.length, fx: cobsFx.filter(function(e){ return e.kind === 'leap'; }).length };`);
    expect(none.fresh, 'no platform to leap to: nothing rises').toBe(0);
    expect(none.fx).toBe(0);
  });

  it('THE LEAP HAS A TELL: an arc flies over from the platform that was raised (`hop` frames), the target\'s shadows are lit from that frame on, and the spikes rise there `hop + ldelay` frames later, on the attack\'s id at the same damage', () => {
    for (const t of [1, 3]) {
      const r = ATTACK(t, 'standOn(4);');
      expect(r.leapsFx.length, `tier ${t}: an arc a platform`).toBe(r.platsOn.length);
      for (const e of r.leapsFx) { expect(e.life, 'it takes `hop` frames').toBe(r.T.hop); }
      expect(r.leapsFx.some((e) => Math.abs(e.x1 - e.x0) > 100), 'it goes across').toBe(true);
      for (const q of r.fresh) {
        expect(q.delay, 'rises after the flight and a beat (read a frame or two after it was made)').toBeGreaterThanOrEqual(r.T.hop + r.T.ldelay - 3);
        expect(q.warn, 'the shadow is up the whole time').toBeGreaterThan(0);
        expect(q.id, 'the attack\'s one id').toBe(r.id);
        expect(q.dmg, 'the same damage as the spikes it came from').toBeCloseTo(33*r.T.dmg, 5);
        expect(q.cap).toBeCloseTo(33*r.T.dmg, 5);
      }
    }
    const err = fight(`
      park(); atTier(2); floorAt(you, WW*0.5); you.invuln = 99999; projectiles = []; var e = null;
      cobsFightTelegraph(s, 'spikes', you); s._tel = 20; try { drawCobsFx(); } catch(x){ e = String(x); }
      cobsFx.push({ kind:'leap', x0:900, y0:1600, x1:1300, y1:1500, life:12, max:24 }); try { drawCobsFx(); } catch(x){ e = e || String(x); }
      return { e: e };`);
    expect(err.e, 'the second row\'s bars and the arc draw').toBe(null);
  });

  it('the floor, a pane and a wall are never leapt to, and a tier 5 leap of three stays next to what was raised', () => {
    const r = fight(`
      park(); atTier(5); projectiles = []; ${LAYOUT}
      worldPlats.push({ x:PL[4].x, y:PL[4].y - 60, w:200, h:14, solid:true, _cobsPane:true, _until:hazardT + 9999 }, { x:PL[1].x, y:gy - 260, w:20, h:260, solid:true, _cobsWall:true, _until:hazardT + 9999 });
      var T = cobsT(s, 'spikes'); floorAt(you, PL[3].x + 120); you.invuln = 99999; s.x = you.x + 500; s._rows = []; s._leaps = []; cobsFx = [];
      s._spikePlats = [PL[2], PL[3]]; s._telX = you.x; s._telY = hurtCY(you); COBS_MOVES.spikes(s, you, ++BOSS_ATK_ID);
      var main = projectiles.filter(function(p){ return p.shape === 'spike'; });
      for (var i=0;i<s._leaps[0].t + 2;i++){ s._atkTimer = 1e9; you.invuln = 99999; step(); }
      var fresh = projectiles.filter(function(p){ return p.shape === 'spike' && main.indexOf(p) < 0; });
      return { on: Array.from(new Set(fresh.map(plIndex))), ys: Array.from(new Set(fresh.map(function(q){ return Math.round(q.warnY); }))), py: Math.round(PL[0].y) };`);
    expect(r.on.every((k) => k === 1 || k === 4), 'only the platforms next to the raised pair').toBe(true);
    expect(r.ys.every((y) => y === r.py), 'never the floor, a pane or a wall').toBe(true);
  });
});

// ================= 4. DELETION =================
// "Double lunge" (a second lunge right after the first, turned toward where you went); "Trail from tier 1" (the burning trail from tier 1, lasting longer -- the trail's own
// pins are in test/boss-cobs-fight.test.js); "Aims longer" (it keeps aiming at you until just before it lunges); "Taller" (the lunge twice as tall, so jumping over it is harder).
describe('OWNER: MePHONE X: DELETION! -- a double lunge, aimed longer, and taller', () => {
  // the lunge (tier t): `you` stand on the floor facing right with X on your right; `face(frame)` is the JS expression for what you face each frame, `pin(frame)` any other pin
  const LUNGE = (t, face, frames = 150, pin = '') => fight(`
    park(); atTier(${t}); worldPlats = worldPlats.filter(function(p){ return p.solid; }); floorAt(you, WW*0.5); you.face = 1; you.spCd = 0; s.x = you.x + 500; s.y = you.y - 200; projectiles = []; s._trail = [];
    cobsFightTelegraph(s, 'deletion', you); var xs = s._xs.slice(); s._tel = 0; var id = ++BOSS_ATK_ID; COBS_MOVES.deletion(s, you, id);
    var T = cobsT(s, 'deletion'), out = { T: T, n: xs.length, side0: xs.map(function(X){ return X.side; }), turns: [], lunges: 0, pct: 0, hits: [], ids: xs.map(function(X){ return X.id; }), spd: xs.map(function(X){ return X.spd; }), h: xs.map(function(X){ return X.h; }) };
    var was = xs.map(function(){ return false; }), startX = xs.map(function(X){ return X.x; });
    for (var i=0;i<${frames};i++){ s._atkTimer = 1e9; you.invuln = 0; if (s._xs.length) you.face = ${face}; ${pin} var p0 = you.pct; step();
      xs.forEach(function(X, k){ var turning = X.turnT > 0; if (turning && !was[k]) out.turns.push({ f: i, k: k, sideBefore: out.side0[k], x: X.x, you: you.x }); if (!turning && was[k] && !X.done) { out.lunges++; out.turns[out.turns.length - 1].sideAfter = X.side; out.turns[out.turns.length - 1].reLunge = i; } was[k] = turning; });
      if (you.pct > p0) out.hits.push([i, you.pct - p0]); }
    out.pct = you.pct; out.spCd = you.spCd; out.dmg = xs[0].dmg; out.left = s._xs.length; out.again = xs.map(function(X){ return X.again; }); out.id = xs[0].id; out.idWant = id; return out;`);

  it('DOUBLE LUNGE: the first lunge passes you (you turned your back to it), X turns toward where you went and lunges AGAIN from the other side, a beat later, on the same id at the same speed', () => {
    for (const t of [1, 3]) {
      const r = LUNGE(t, '-s._xs[0].side');   // always back to the X that is lunging: the counter, made twice
      expect(r.T.again, 'a second lunge').toBe(1);
      expect(r.turns.length, `tier ${t}: it turned once, after the first lunge`).toBe(1);
      expect(r.turns[0].sideAfter, 'toward where you went: it comes back from the other side').toBe(-r.turns[0].sideBefore);
      expect(r.turns[0].reLunge - r.turns[0].f, 'a beat of `turn` frames between the lunges (the turn, flickering)').toBeGreaterThanOrEqual(r.T.turn - 2);
      expect(r.turns[0].reLunge - r.turns[0].f, '...and no more than that').toBeLessThanOrEqual(r.T.turn + 2);
      expect(r.left, 'both lunges done').toBe(0);
      expect(r.hits.length, 'turned away from both lunges: neither lands -- the one hit is the trail\'s zap, once, on a fighter who stood in it').toBe(1);
      expect(r.pct, 'a part of X\'s hit, the tier\'s trailDmg, and no more').toBeCloseTo(r.dmg*r.T.trailDmg, 3);
      expect(r.ids.every((i) => i === r.idWant), 'the attack\'s one id').toBe(true);
      expect(r.spd, 'never faster: the same speed').toEqual([r.T.spd]);
    }
  });

  it('turn your back once and it is not enough: the second lunge, from the other side, finds you facing it (that is the whole point of the double lunge); one hit in all', () => {
    const r = LUNGE(2, '-1');
    expect(r.turns.length, 'it did turn').toBe(1);
    expect(r.hits.length, 'the second lunge landed').toBeGreaterThanOrEqual(1);
    expect(r.hits[r.hits.length - 1][0], 'after the turn').toBeGreaterThan(r.turns[0].f);
    expect(r.pct, '1.6 x 33: the same hit as ever, however the trail and the second lunge share it').toBeCloseTo(52.8, 3);
  });

  it('caught by the first lunge, you take that hit and the second lunge adds nothing (one id, one cap), nor does it lock your special or "delete" you a second time', () => {
    const r = LUNGE(2, 's._xs[0].side', 150, 'if (i === 40) you.spCd = 0;');
    expect(r.hits.length, 'one hit').toBe(1);
    expect(r.pct).toBeCloseTo(52.8, 3);
    expect(r.turns.length, 'it still turned and came again').toBe(1);
    expect(r.spCd, 'and the second lunge did not lock your special again (reset at frame 40, before it lands)').toBe(0);
  });

  it('tier 5\'s two X\'s each lunge twice: two turns, one each, and never more than the one hit however it goes', () => {
    const r = LUNGE(5, 's._xs[0].side', 200);
    expect(r.n).toBe(2);
    expect(r.turns.length, 'each turned once').toBe(2);
    expect(r.pct, 'never more than the one hit (one id, one cap)').toBeLessThanOrEqual(r.dmg + 1e-6);
    expect(r.left, 'and it ends').toBe(0);
  });

  it('AIMS LONGER: X keeps re-spotting itself on the side you face now, on your line, until `aim` frames before it lunges -- then it holds -- so turning your back early gets you nothing', () => {
    const r = fight(`
      park(); atTier(2); floorAt(you, WW*0.5); you.face = 1; s.x = you.x + 500; s.y = you.y - 200; projectiles = []; s._xs = [];
      cobsFightTelegraph(s, 'deletion', you); var T = cobsT(s, 'deletion'), X = s._xs[0], rec = [];
      for (var i=0;i<T.tel + 4;i++){ s._atkTimer = 1e9; you.invuln = 99999;
        if (i === 8) you.face = -1; if (i === 20) you.x += 110; if (i === 30) you.face = 1; if (i === T.tel - T.aim + 2) { you.x -= 150; you.face = -1; }
        step(); rec.push({ tel: s._tel, x: X.x, side: X.side, you: you.x, face: you.face, live: X.live }); if (X.live) break; }
      return { T: T, rec: rec };`);
    expect(r.T.aim, 'aimed until 11 frames before the lunge at tier 2').toBe(11);
    const aiming = r.rec.filter((q) => q.tel > r.T.aim && !q.live), locked = r.rec.filter((q) => q.tel <= r.T.aim && q.tel > 0);
    expect(aiming.length, 'it aimed for most of the wind-up').toBeGreaterThan(40);
    for (const q of aiming) { expect(q.side, 'on the side you face now').toBe(q.face); expect(q.x, '170 px off you').toBeCloseTo(q.you + q.face*170, 0); }
    expect(new Set(aiming.map((q) => q.side)).size, 'and it changed sides when you turned').toBe(2);
    expect(locked.length).toBeGreaterThan(5);
    expect(new Set(locked.map((q) => q.x)).size, 'locked: it did not move once the last frames began, however you moved').toBe(1);
  });

  it('TALLER: the lunge is 112 px tall (twice the 56 it was drawn), a band over the line you stood on -- in the air is not enough: your feet must clear its top (or you must face away)', () => {
    const run = (hover) => LUNGE(2, 's._xs[0].side', 60, hover == null ? '' : `you.y = groundY() - you.r - ${hover}; you.vy = 0; you.vx = 0;`);
    const r = run(null);
    expect(r.h, 'twice as tall').toEqual([112]);
    expect(W.eval('COBS_TIERS.deletion.map(function(T){ return T.h; })'), 'at every tier').toEqual([112, 112, 112, 112, 112]);
    const low = run(40), mid = run(100), top = run(118), high = run(160);
    expect(low.pct, 'a hop 40 px up is under its top: caught, airborne as you are').toBeCloseTo(52.8, 3);
    expect(mid.pct, '100 px up is still inside it').toBeCloseTo(52.8, 3);
    expect(top.pct, 'feet 118 px up clear its 112 px top').toBe(0);
    expect(high.pct, 'and so does a full jump').toBe(0);
  });

  it('the lunge runs along the line you stood on: X is as tall as its band and sits on that line, and the tell and the lunge draw without a throw', () => {
    const r = fight(`
      park(); atTier(3); floorAt(you, WW*0.5); you.face = 1; s.x = you.x + 500; s.y = you.y - 200; projectiles = []; var e = null;
      cobsFightTelegraph(s, 'deletion', you); var X = s._xs[0], T = cobsT(s, 'deletion'), base = X.base;
      s._tel = 4; try { drawCobsFx(); } catch(x){ e = String(x); } s._tel = 0; COBS_MOVES.deletion(s, you, ++BOSS_ATK_ID); for (var i=0;i<6;i++){ s._atkTimer = 1e9; step(); } try { drawCobsFx(); } catch(x){ e = e || String(x); }
      return { e: e, base: base, gy: groundY(), y: X.y, h: X.h, bottom: X.y + X.h/2 };`);
    expect(r.e).toBe(null);
    expect(r.h).toBe(112);
    expect(Math.abs(r.bottom - r.base), 'its bottom edge on the line you stood on').toBeLessThanOrEqual(0.001);
  });
});

// ================= 5. TICK TOCK! =================
// "More watches" (one more at every tier); "Bend from tier 1" (pinned in test/boss-cobs-fight.test.js); "More ricochets" (they bounce off the walls twice); "Shards from tier 1"
// (each spent watch shatters into shards from tier 1).
describe('OWNER: TICK, TOCK! -- one more watch at every tier, more ricochets (the walls twice), and real shards from tier 1', () => {
  const FLOOR_ONLY = 'worldPlats = worldPlats.filter(function(p){ return p.solid; });';
  const THROW = (t) => fight(`
    park(); atTier(${t}); ${FLOOR_ONLY} floorAt(you, WW*0.5 - 1400); you.invuln = 99999; s.x = WW*0.5; s.y = groundY() - 260; s.face = -1; projectiles = [];
    var T = cobsT(s, 'ticktock'); cobsFightTelegraph(s, 'ticktock', you); s._tel = 0; COBS_MOVES.ticktock(s, you, ++BOSS_ATK_ID);
    var ws = shots().filter(function(p){ return p.shape === 'meeplewatch'; }), n0 = ws.length, walls = ws.map(function(p){ return p._wallR; }), maxB = 0, shards = 0, shardIds = new Set(), shardDmg = null, shardCap = null;
    for (var i=0;i<520;i++){ s._atkTimer = 1e9; you.invuln = 99999; step(); ws.forEach(function(p){ maxB = Math.max(maxB, p.bounces || 0); });
      projectiles.filter(function(p){ return p.cobsWatchShard; }).forEach(function(p){ if (!p._seen) { p._seen = 1; shards++; shardIds.add(p.bossAtk); shardDmg = p.dmg; shardCap = p.bossCap; } }); }
    return { T: T, n0: n0, walls: walls, maxB: maxB, shards: shards, ids: shardIds.size, shardDmg: shardDmg, shardCap: shardCap, spent: ws.every(function(p){ return p.life <= 0; }), maxBounces: ws.map(function(p){ return p.maxBounces; }) };`);

  it('MORE WATCHES: one more at every tier, in the throw (4, 5, 6, 7, 8) and in the zero\'s volley (5, 6, 7, 8, 9)', () => {
    const rs = [1, 2, 3, 4, 5].map(THROW);
    expect(rs.map((r) => r.n0), 'one more than the old 3, 4, 5, 6, 7').toEqual([4, 5, 6, 7, 8]);
    expect(rs.map((r) => r.T.volley), 'one more than the old 4, 5, 6, 7, 8').toEqual([5, 6, 7, 8, 9]);
    const v = fight(`
      park(); atTier(3); floorAt(you, WW*0.5 - 1400); you.invuln = 99999; s.x = WW*0.5; s.y = groundY() - 260; projectiles = []; var T = cobsT(s, 'ticktock');
      s._tick = { t:1, T:T.timer }; step(); return { n: shots().filter(function(p){ return p.shape === 'meeplewatch'; }).length, want: T.volley };`);
    expect(v.n, 'the volley at zero throws the tier\'s count').toBe(v.want);
    expect(v.want).toBe(7);
  });

  it('MORE RICOCHETS: each watch ricochets off the floor and the platforms (2, 2, 2, 3, 3) before the landing that spends it, and carries two wall ricochets', () => {
    const rs = [1, 3, 4].map(THROW);
    expect(rs.map((r) => r.T.ric), '"they bounce twice" from tier 1, a third from tier 4 (the old 0, 1, 1, 2, 2 plus more)').toEqual([2, 2, 3]);
    expect(W.eval('COBS_TIERS.ticktock.map(function(T){ return T.ric; })')).toEqual([2, 2, 2, 3, 3]);
    for (const r of rs) {
      expect(r.maxBounces.every((b) => b === r.T.ric + 1), 'the shared loop\'s bounce budget: the ricochets and the landing that ends it').toBe(true);
      expect(r.maxB, 'they really bounced that many times').toBe(r.T.ric + 1);
      expect(r.walls.every((w) => w === 2), 'and every watch is thrown with two wall ricochets').toBe(true);
      expect(r.spent, 'and all are spent in the end').toBe(true);
    }
    expect(W.eval('COBS_TIERS.ticktock.map(function(T){ return T.wall; })'), 'twice at every tier').toEqual([2, 2, 2, 2, 2]);
  });

  it('THE WALLS TWICE: a watch that reaches a wall that stands (a MeTag\'s wall, a hedge, the arena\'s side) turns back off it twice with its speed kept, and the third contact lets it through; the floor and a pane are not walls', () => {
    const r = fight(`
      park(); ${FLOOR_ONLY} floorAt(you, 300); you.invuln = 99999; var gy = groundY(), X = WW*0.5, out = {};
      var wall = { x:X, y:gy - 260, w:20, h:260, solid:true, _cobsWall:true, _until:hazardT + 99999 }; worldPlats.push(wall);
      var mk = function(x, vx){ return { x:x, y:gy - 120, r:11, vx:vx, vy:0, _wallR:2 }; };
      var p = mk(X - 8, 10), log = [], tick = function(q){ if (q._wallR > 0) cobsWallStep(q); };   // (cobsTickShots runs it only while a watch has a wall ricochet left)
      for (var i=0;i<4;i++){ p.x = X - 8; p.vx = 10; tick(p); log.push([p.vx, p._wallR]); }   // from the left, four contacts
      out.left = log;
      var q = mk(X + 20 + 8, -9); tick(q); out.right = [q.vx, q._wallR];
      var F = cobsFloor(), a = mk(F.x + 6, -7); tick(a); var b = mk(F.x + F.w - 6, 7); tick(b); out.sides = [a.vx, b.vx];
      var high = mk(X - 8, 10); high.y = gy - 300; tick(high); out.over = high.vx;   // over the top of it: no contact
      worldPlats.push({ x:X + 400, y:gy - 80, w:200, h:14, solid:true, _cobsPane:true, _until:hazardT + 99999 }); var pn = mk(X + 400 - 8, 10); pn.y = gy - 75; tick(pn); out.pane = pn.vx;
      var fl = mk(X + 1200, -8); fl.y = gy - 10; tick(fl); out.floor = fl.vx;
      return out;`);
    expect(r.left[0], 'the first contact turns it back, speed kept').toEqual([-10, 1]);
    expect(r.left[1], 'the second turns it back again').toEqual([-10, 0]);
    expect(r.left[2], 'the third goes through').toEqual([10, 0]);
    expect(r.right, 'off the other face too').toEqual([9, 1]);
    expect(r.sides, 'the arena\'s two sides are walls').toEqual([7, -7]);
    expect(r.over, 'a watch over the top of the wall is not stopped by it').toBe(10);
    expect(r.pane, 'a pane is footing, not a wall').toBe(10);
    expect(r.floor, 'neither is the floor\'s far end').toBe(-8);
  });

  it('SHARDS FROM TIER 1: every spent watch shatters into the tier\'s shards (3, 3, 4, 4, 5) -- real ones, up and out, small, on the watch\'s own id and cap', () => {
    const rs = [1, 2, 3, 4, 5].map(THROW);
    expect(W.eval('COBS_TIERS.ticktock.map(function(T){ return T.shards; })'), 'from tier 1').toEqual([3, 3, 4, 4, 5]);
    for (const r of rs) {
      expect(r.shards, 'a watch\'s shards each, every one of them spent').toBeGreaterThanOrEqual(r.n0*r.T.shards - r.T.shards);
      expect(r.ids, 'on the throw\'s one id').toBe(1);
      expect(r.shardDmg, 'small: 0.35 of the watch\'s hit').toBeCloseTo(33*r.T.dmg*0.35, 5);
      expect(r.shardCap, 'under the watch\'s own cap').toBeCloseTo(33*r.T.dmg, 5);
    }
    const f = fight(`
      park(); atTier(5); ${FLOOR_ONLY} floorAt(you, WW*0.5); you.invuln = 0; you.pct = 0; projectiles = []; var T = cobsT(s, 'ticktock'), dmg = cobsDmg()*T.dmg, id = ++BOSS_ATK_ID;
      for (var k=0;k<T.n;k++) COBS_DIE.watch(s, { x:you.x + (k - 3)*6, y:you.y, bossAtk:id }, { shards:T.shards, dmg:dmg, cap:dmg });
      var made = projectiles.filter(function(p){ return p.cobsWatchShard; }), up = made.filter(function(p){ return p.vy < 0; }).length;
      for (var i=0;i<60;i++){ s._atkTimer = 1e9; you.invuln = 0; step(); }
      return { made: made.length, want: T.n*T.shards, up: up, pct: you.pct, dmg: dmg, r: made[0].r };`);
    expect(f.made, 'every spent watch makes its shards').toBe(f.want);
    expect(f.up, 'up and out').toBeGreaterThan(f.made*0.8);
    expect(f.r, 'small').toBeLessThanOrEqual(6);
    expect(f.pct, 'a fighter under all the shards of all the watches takes at most ONE watch hit (one id, one cap)').toBeLessThanOrEqual(f.dmg + 1e-6);
  });
});

// ================= 6. MeMURDER! =================
// "More strikes" (one more at every tier); "Tracking from tier 1" (pinned in test/boss-cobs-fight.test.js); "Strikes linger" (each strike leaves a hazard where it lands for
// about a second -- the row's `linger`); "Pairs" (from tier 3 the strikes come two at a time).
describe('OWNER: MeMURDER! -- one more strike at every tier, they linger about a second, and from tier 3 they come two at a time', () => {
  const FLOOR_ONLY = 'worldPlats = worldPlats.filter(function(p){ return p.solid; });';
  const STRIKE = (t, extra = '', frames = 120) => fight(`
    park(); atTier(${t}); ${FLOOR_ONLY} floorAt(you, WW*0.5 - 300); you.invuln = 99999; s.x = you.x + 300; s.y = you.y - 200; projectiles = []; cobsFx = [];
    var tx = you.x; cobsFightTelegraph(s, 'memurder', you); var spots = s._poleSpots.slice(), dir = Math.sign(tx - s.x) || 1; s._tel = 0; var id = ++BOSS_ATK_ID; COBS_MOVES.memurder(s, you, id);
    var T = cobsT(s, 'memurder'), poles = shots().filter(function(p){ return p.cobsTrap; }), lockAt = poles.map(function(){ return null; }), riseAt = poles.map(function(){ return null; }), deadAt = poles.map(function(){ return null; });
    var d0 = poles.map(function(p){ return p.delay; });
    for (var i=0;i<${frames};i++){ s._atkTimer = 1e9; you.invuln = 99999; ${extra} step();
      poles.forEach(function(p, k){ if (lockAt[k] === null && p._trk && p._trk.locked) lockAt[k] = i; if (riseAt[k] === null && p.delay <= 0 && p.life > 0) riseAt[k] = i; if (deadAt[k] === null && p.life <= 0) deadAt[k] = i; }); }
    return { T: T, n: poles.length, spots: spots.map(function(q){ return { x: q.x, k: q.k, wave: q.wave }; }), tx: tx, dir: dir, d0: d0, lockAt: lockAt, riseAt: riseAt, deadAt: deadAt, ids: new Set(poles.map(function(p){ return p.bossAtk; })).size, id: id, linger: poles.map(function(p){ return p.cobsLinger; }) };`);

  it('MORE STRIKES: one more at every tier (2, 4, 6, 8, 10 -- was 1, 3, 5, 7, 9), the pole under your mark stays, and the extra one stands beyond you, away from him', () => {
    const rs = [1, 2, 3, 4, 5].map((t) => STRIKE(t));
    expect(rs.map((r) => r.n)).toEqual([2, 4, 6, 8, 10]);
    expect(rs.map((r) => r.T.n)).toEqual([2, 4, 6, 8, 10]);
    for (const r of rs) {
      expect(r.spots.some((q) => Math.abs(q.x - r.tx) < 1), 'one pole is under your mark').toBe(true);
      const side = r.spots.filter((q) => (q.x - r.tx)*r.dir > 1).length, other = r.spots.filter((q) => (q.x - r.tx)*r.dir < -1).length;
      expect(side - other, 'the extra pole is on the side away from him').toBe(1);
      expect(r.ids, 'one id').toBe(1);
    }
  });

  it('STRIKES LINGER: every pole stays up its `linger` frames after it rises (60, 60, 60, 60, 90), a hazard where it landed, from tier 1; touching it hurts', () => {
    expect(W.eval('COBS_TIERS.memurder.map(function(T){ return T.linger; })'), 'about a second').toEqual([60, 60, 60, 60, 90]);
    const rs = [1, 3, 5].map((t) => STRIKE(t, '', 200));
    for (const r of rs) {
      expect(r.linger.every((l) => l === r.T.linger), 'every pole carries it').toBe(true);
      const lived = r.deadAt.map((d, k) => d - r.riseAt[k]);
      expect(Math.min(...lived), 'up as long as the row says after it rose (plus the seven frames of its rise)').toBeGreaterThanOrEqual(r.T.linger);
      expect(Math.max(...lived), '...and no longer').toBeLessThanOrEqual(r.T.linger + 12);
    }
    const hurt = fight(`
      park(); atTier(1); ${FLOOR_ONLY} floorAt(you, WW*0.5); you.invuln = 99999; s.x = you.x + 300; projectiles = [];
      var T = cobsT(s, 'memurder'), id = ++BOSS_ATK_ID; var P = cobsPole(s, you.x + 600, groundY(), T, id, cobsDmg()*T.dmg, null, 0);
      for (var i=0;i<T.delay + 25;i++){ s._atkTimer = 1e9; you.invuln = 99999; step(); }
      var still = P.life > 0; you.x = P.x; you.y = P.y + 6; you.vy = 0; you.invuln = 0; you.pct = 0; you.vx = 0; var p0 = you.pct; for (var j=0;j<6;j++){ s._atkTimer = 1e9; step(); }
      return { still: still, pct: you.pct - p0 };`);
    expect(hurt.still, 'a pole that has risen is still there a moment later').toBe(true);
    expect(hurt.pct, 'and stepping into it hurts').toBeGreaterThan(0);
  });

  it('PAIRS: from tier 3 the poles come two at a time -- the two nearest your mark first, then the next two, `pairGap` frames apart; before that they all come together', () => {
    expect(W.eval('COBS_TIERS.memurder.map(function(T){ return T.pairGap; })'), 'from tier 3: 14, 12, 10 frames between pairs').toEqual([0, 0, 14, 12, 10]);
    for (const t of [1, 2]) { const r = STRIKE(t); expect(new Set(r.d0).size, `tier ${t}: all at once`).toBe(1); }
    for (const t of [3, 4, 5]) {
      const r = STRIKE(t);
      const waves = {}; r.spots.forEach((q, i) => { (waves[q.wave] = waves[q.wave] || []).push(q); });
      expect(Object.keys(waves).length, `tier ${t}: n/2 pairs`).toBe(r.n/2);
      for (const w of Object.keys(waves)) expect(waves[w].length, 'two at a time').toBe(2);
      const delays = r.d0.slice().sort((a, b) => a - b);
      expect(Array.from(new Set(delays)).map((d) => d - r.T.delay), 'a pair every pairGap frames').toEqual(Array.from({ length: r.n/2 }, (_, i) => i*r.T.pairGap));
      const near = r.spots.slice().sort((a, b) => Math.abs(a.k) - Math.abs(b.k) || a.k - b.k).slice(0, 2);
      expect(near.every((q) => q.wave === 0), 'the two nearest your mark go first').toBe(true);
      expect(r.ids, 'one id for every pair').toBe(1);
    }
  });

  it('every pair\'s marks lock TOGETHER (one phone flash for the whole row), and a later pair then rises that much after the first', () => {
    const r = STRIKE(4, 'you.x += 3; you.vx = 0;', 140);
    expect(new Set(r.lockAt).size, 'one lock frame for all of them').toBe(1);
    expect(r.lockAt[0], 'locked').not.toBe(null);
    const rises = Array.from(new Set(r.riseAt)).sort((a, b) => a - b);
    expect(rises.length, 'four pairs rise at four times').toBe(4);
    for (let i = 1; i < rises.length; i++) expect(rises[i] - rises[i - 1], 'pairGap frames apart').toBeGreaterThanOrEqual(r.T.pairGap - 1);
    expect(rises[0] - r.lockAt[0], 'the first pair rises 40% of the delay after the lock').toBeLessThanOrEqual(Math.round(r.T.delay*0.4) + 2);
  });

  it('the tell draws the pairs (a dot a pair) without a throw', () => {
    const r = fight(`
      park(); atTier(4); floorAt(you, WW*0.5); you.invuln = 99999; projectiles = []; var e = null;
      cobsFightTelegraph(s, 'memurder', you); s._tel = 20; try { drawCobsFx(); } catch(x){ e = String(x); } return { e: e, waves: s._poleSpots.map(function(q){ return q.wave; }) };`);
    expect(r.e).toBe(null);
    expect(Math.max(...r.waves)).toBe(3);
  });
});

// ================= 7. LOCKDOWN (the nerf) =================
// "no pile-on" -- while a MeTag cuffs you, his other attacks cannot hit you, and the cuff lasts a third less. Plus: "Mash free" (pressing buttons breaks the cuff sooner); "No barrier link"
// (no barrier between his tags -- pinned in test/boss-cobs-fight.test.js); "One tag at a time" (he places one MeTag at a time instead of two).
describe('OWNER: LOCKDOWN! (too hard) -- no pile-on, a third shorter, mash free, one tag at a time', () => {
  const FLOOR_ONLY = 'worldPlats = worldPlats.filter(function(p){ return p.solid; });';
  // a tag on you at tier t; `body` runs once it has cuffed you (you are cuffed from frame 0 of the loop), `frame` each frame before the step
  const CUFF = (t, frame = '', after = '', frames = 60) => fight(`
    park(); atTier(${t}); ${FLOOR_ONLY} floorAt(you, WW*0.5); you.invuln = 0; you.pct = 0; s.x = you.x + 400; s.y = you.y - 250; projectiles = []; summons = summons.filter(function(m){ return m === s; });
    cobsFightTelegraph(s, 'metags', you); s._tel = 0; COBS_MOVES.metags(s, you, ++BOSS_ATK_ID);
    var tag = summons.filter(function(m){ return m.type === 'metag'; })[0], T = cobsT(s, 'metags'); tag.x = you.x; tag.y = hurtCY(you); tag.vx = tag.vy = 0; tag._cd = 0;
    var out = { T: T, cuffedAt: null, freeAt: null, frames: [], pct0: 0, id: 0 };
    for (var i=0;i<${frames};i++){ s._atkTimer = 1e9; ${frame} var p0 = you.pct; step(); if (out.cuffedAt === null && you.rooted > 0){ out.cuffedAt = i; out.pct0 = you.pct; out.id = you._cuffId; ${after} }
      if (out.cuffedAt !== null && out.freeAt === null && !(you.rooted > 0)) out.freeAt = i; tag._cd = 9999; tag.x = you.x + 900; }
    out.n = summons.filter(function(m){ return m.type === 'metag'; }).length; out.pct = you.pct; return out;`);

  it('ONE TAG AT A TIME: he places one MeTag (75 hp) at every tier and never a second while it stands; with no tag standing he may place another', () => {
    expect(W.eval('COBS_TIERS.metags.map(function(T){ return [T.n, T.hp]; })')).toEqual([[1, 75], [1, 75], [1, 75], [1, 75], [1, 75]]);
    const r = fight(`
      park(); floorAt(you, WW*0.5); s.x = you.x + 300; s.y = you.y - 100; summons = summons.filter(function(m){ return m === s; }); var out = {};
      [1, 2, 3, 4, 5].forEach(function(t){ atTier(t); summons = summons.filter(function(m){ return m === s; }); cobsFightTelegraph(s, 'metags', you); s._tel = 0;
        out['n' + t] = COBS_MOVES.metags(s, you, ++BOSS_ATK_ID); out['tags' + t] = summons.filter(function(m){ return m.type === 'metag'; }).length; });
      out.again = COBS_MOVES.metags(s, you, ++BOSS_ATK_ID); out.stillOne = summons.filter(function(m){ return m.type === 'metag'; }).length;
      summons.filter(function(m){ return m.type === 'metag'; }).forEach(function(m){ m.life = 0; }); summons = summons.filter(function(m){ return m.life > 0; });
      out.after = COBS_MOVES.metags(s, you, ++BOSS_ATK_ID); return out;`);
    for (let t = 1; t <= 5; t++) { expect(r['n' + t], `tier ${t}`).toBe(1); expect(r['tags' + t]).toBe(1); }
    expect(r.again, 'never a second while one stands').toBe(0);
    expect(r.stillOne).toBe(1);
    expect(r.after, 'once it is gone he may place another').toBe(1);
  });

  it('THE CUFF LASTS A THIRD LESS: 20, 24, 28, 32, 36 frames (the old 30, 36, 42, 48, 54 x 2/3), and a tier-5 tag no longer calls a pole down on whoever it cuffed', () => {
    const T = W.eval('COBS_TIERS.metags');
    expect(T.map((x) => x.cuff)).toEqual([20, 24, 28, 32, 36]);
    expect(T.map((x) => x.cuff), 'two thirds of the old ones').toEqual([30, 36, 42, 48, 54].map((c) => c * 2 / 3));
    expect(T.some((x) => x.poles), 'the pile-on pole is gone').toBe(false);
    for (const t of [1, 3, 5]) {
      const r = CUFF(t, '', '', 80);
      expect(r.cuffedAt, `tier ${t}: the tag cuffed on contact`).not.toBe(null);
      expect(r.freeAt - r.cuffedAt, 'rooted for the cuff\'s frames').toBeGreaterThanOrEqual(r.T.cuff - 2);
      expect(r.freeAt - r.cuffedAt).toBeLessThanOrEqual(r.T.cuff + 1);
      expect(r.pct0, 'and the tag\'s own small hit lands: the cuff is still a hit').toBeCloseTo(33*r.T.dmg, 3);
    }
    const pole = fight(`
      park(); atTier(5); ${FLOOR_ONLY} floorAt(you, WW*0.5); you.invuln = 0; s.x = you.x + 400; s.y = you.y - 250; projectiles = []; summons = summons.filter(function(m){ return m === s; });
      cobsFightTelegraph(s, 'metags', you); s._tel = 0; COBS_MOVES.metags(s, you, ++BOSS_ATK_ID); var tag = summons.filter(function(m){ return m.type === 'metag'; })[0]; tag.x = you.x; tag.y = hurtCY(you); tag._cd = 0;
      for (var i=0;i<5;i++){ s._atkTimer = 1e9; step(); } return { poles: projectiles.filter(function(p){ return p.cobsTrap; }).length, cuffed: you.rooted > 0 };`);
    expect(pole.cuffed).toBe(true);
    expect(pole.poles, 'no MeMURDER pole on the cuffed').toBe(0);
  });

  it('NO PILE-ON: while a MeTag cuffs you nothing else of his lands -- not a hit of his own, not a shot of his through you, not MePhone X (no lock) -- and the moment the cuff is over they do', () => {
    const r = CUFF(3, '', `
      var id2 = ++BOSS_ATK_ID, c0 = you.pct; out.direct = cobsHit(you, 20, 0, 0, id2, 20); out.directPct = you.pct - c0;
      addProj(cobsShot(s, { x:you.x, y:hurtCY(you), vx:0.1, vy:0, dmg:20, bossCap:20, r:24, life:30, bossAtk:++BOSS_ATK_ID, shape:'cobscandy' }));
      var X = { x:you.x + 5, y:you.y, base:groundY(), h:112, side:1, fi:you.idx, live:true, t:0, id:++BOSS_ATK_ID, dmg:60, lock:150, spd:14, trail:0, trailDmg:0, trailHit:{}, again:0, turn:0, turnT:0, delay:0 };
      s._xs = [X]; you.spCd = 0; you.face = 1; out.lockBefore = you.spCd;`, 14);
    expect(r.cuffedAt).not.toBe(null);
    expect(r.direct, 'a hit of his own is turned away').toBe(false);
    expect(r.directPct, 'and costs nothing').toBe(0);
    expect(r.pct, 'in all: only the cuff\'s own hit (a shot through you and X\'s lunge landed nothing)').toBeCloseTo(r.pct0, 3);
    // the cuff ends: the same things land
    const late = CUFF(1, '', '', 80);
    const after = fight(`
      park(); atTier(1); ${FLOOR_ONLY} floorAt(you, WW*0.5); you.invuln = 0; you.pct = 0; var out = {};
      you._cuffUntil = hazardT - 1; you._cuffId = 9999; out.free = cobsHit(you, 20, 0, 0, ++BOSS_ATK_ID, 20); out.pct = you.pct;
      you.pct = 0; you.invuln = 0; you._cuffUntil = hazardT + 30; you._cuffId = 9999; out.held = cobsHit(you, 20, 0, 0, ++BOSS_ATK_ID, 20); out.own = cobsHit(you, 20, 0, 0, 9999, 20);
      return out;`);
    expect(after.free, 'a cuff that has run out protects nobody').toBe(true);
    expect(after.pct).toBeGreaterThan(0);
    expect(after.held, 'a cuff still on turns every other id away').toBe(false);
    expect(after.own, 'but its own id gets through').toBe(true);
    expect(late.freeAt, 'and the cuff did end').not.toBe(null);
  });

  it('NO PILE-ON holds against his shots too: a shot of his that overlaps a cuffed fighter passes through (the fighter\'s grace is held while the cuff lasts), then lands the frame after the cuff is over', () => {
    const r = fight(`
      park(); atTier(1); ${FLOOR_ONLY} floorAt(you, WW*0.5); you.invuln = 0; you.pct = 0; projectiles = []; var out = { during: 0, after: 0 };
      you._cuffUntil = hazardT + 12; you._cuffId = 4242; you._cuffMash = 0;
      var shot = addProj(cobsShot(s, { x:you.x, y:hurtCY(you), vx:0, vy:0, dmg:20, bossCap:20, r:30, life:200, bossAtk:++BOSS_ATK_ID, shape:'cobscandy' }));
      for (var i=0;i<30;i++){ s._atkTimer = 1e9; step(); if (i === 8) out.during = you.pct; }
      out.after = you.pct; out.alive = shot.life > 0; return out;`);
    expect(r.during, 'nothing landed through the cuff').toBe(0);
    expect(r.after, 'it landed once the cuff was over').toBeGreaterThan(0);
  });

  it('MASH FREE: every new press of a button takes `mash` (5) frames off the cuff -- the root and the stun together -- so mashing frees you sooner; holding a button down does not', () => {
    const KEY = 'down[KEYS.attack] = ';
    const base = CUFF(3, 'you.controller = "local"; ' + KEY + 'false;', '', 70);
    const mash = CUFF(3, 'you.controller = "local"; ' + KEY + '(i % 2 === 0);', '', 70);
    const held = CUFF(3, 'you.controller = "local"; ' + KEY + 'true;', '', 70);
    expect(base.freeAt - base.cuffedAt, 'no presses: the whole cuff').toBeGreaterThanOrEqual(base.T.cuff - 2);
    expect(mash.freeAt - mash.cuffedAt, 'mashing: freed sooner (28 frames, 5 a press, a press every other frame)').toBeLessThan(base.freeAt - base.cuffedAt - 8);
    expect(mash.T.mash).toBe(5);
    expect(Math.abs((held.freeAt - held.cuffedAt) - (base.freeAt - base.cuffedAt)), 'a held button is one press at most, never a mash').toBeLessThanOrEqual(base.T.mash + 1);
    const dead = fight(`
      park(); atTier(3); floorAt(you, WW*0.5); you.controller = 'local'; down[KEYS.attack] = false; down[KEYS.jump] = false; down[KEYS.special] = false; down[KEYS.smash] = false;
      you.rooted = 40; you.hitstun = 30; you._cuffUntil = hazardT + 40; you._cuffId = 5151; you._cuffMash = 5; you._cuffPrev = null;
      var out = [];
      [['attack', 0], ['special', 1], ['smash', 2], ['jump', 3]].forEach(function(b, k){ var r0 = you.rooted; down[KEYS[b[0]]] = true; s._atkTimer = 1e9; step(); down[KEYS[b[0]]] = false; s._atkTimer = 1e9; step(); out.push(r0 - you.rooted); });
      return { cuts: out };`);
    for (const c of dead.cuts) expect(c, 'each kind of press takes 5 frames and the frame that passed: 7 in all').toBeGreaterThanOrEqual(5);
  });

  it('a cuff that is mashed off ends with its protection at once; his death ends every cuff', () => {
    const r = fight(`
      park(); atTier(3); ${FLOOR_ONLY} floorAt(you, WW*0.5); you.controller = 'local'; down[KEYS.attack] = false;
      you.rooted = 4; you.hitstun = 3; you._cuffUntil = hazardT + 4; you._cuffId = 777; you._cuffMash = 5; you._cuffPrev = null; you.invuln = 0;
      down[KEYS.attack] = true; s._atkTimer = 1e9; step(); down[KEYS.attack] = false; s._atkTimer = 1e9; step(); step();
      var freed = { until: you._cuffUntil, rooted: you.rooted }; you.invuln = 0;
      you._cuffUntil = hazardT + 500; you._cuffId = 778; cobsBeginDeath(s);
      return { freed: freed, dead: you._cuffUntil };`);
    expect(r.freed.rooted).toBe(0);
    expect(r.freed.until, 'the cuff is over, and so is the protection').toBe(0);
    expect(r.dead, 'he falls and every cuff ends').toBe(0);
  });
});
