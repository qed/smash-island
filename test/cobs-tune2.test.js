import { describe, it, expect, beforeAll, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { bootMonolith } from './helpers/smash-golden.js';
import { mulberry32 } from './helpers/prng.js';
import { bootValidating } from './helpers/validating-canvas.js';

// STEVE COBS, TUNED BY THE OWNER, ROUND 2 (2026-10-06). Five picks, each cited verbatim in the tests that pin it:
//   11. MAZED AND CONFUSED!: "mazed and confused should be a hazard-passive and screen wide." (asked: "Always on" and "Rayguns on walls")
//   12. PULL THE PLUG!: "damage for pull the plug should scale based on fall distance." (asked: "Only falls hurt")
//   13. TOXIC CANNON!: "the ship should spawn near you"
//   14. THE FUTURE IS SO YESTERDAY! (his keynote): "alongside the future is so yesterday as well"
//   15. BOOMERANGS!: "boomerangs should NOT home." and, asked again, "cobs should just turn around-not towards the player. 4 times."
// Same damage per hit for everything except item 12's fall scaling; every hit keeps its attack's one bossAtk id; no text on screen but a boss's telegraph banners.
// Nothing here is a bar for difficulty ("dont tune, cuz thats an agent, not a player"): every assertion is what the pick says.

vi.setConfig({ testTimeout: 60000 });   // (the longer ones play a few hundred to a few thousand frames of his fight: seconds on a slow machine)

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

// ================= 12. PULL THE PLUG! =================
// "damage for pull the plug should scale based on fall distance." -- asked: "Only falls hurt": standing on the floor when it goes live is SAFE; only FALLING onto the live floor hurts, scaled by the height fallen:
// damage = the row's shock (0.3 where the row has none: tier 1) x a hit (33) x clamp(fall / 200 px, 0.5, 3). The bounce and the grace stay; the flat shock is gone (the floor's, and the platform that goes).
describe('OWNER (round 2): PULL THE PLUG! -- "damage for pull the plug should scale based on fall distance." ("Only falls hurt")', () => {
  // The plug at tier `t`, as an instant [POOF] (no wave) that stays out: `body` runs once the floor is live with `s`, `you`, `P`, `rec` and `drop(H, o)` -- put `you` H px over the floor, free, and let it fall
  // until the floor has dealt with it; it returns { hits, landed }, every boss-tagged hit on you as { d: its damage, ky: its bounce, fell: the fall the game measured, live, ground }. o.invuln, o.keep (keep the grace
  // the last hit set), o.x, o.each(i) (before each frame).
  const PLUG = (t, body) => fight(`
    park(); atTier(${t}); s._introT = 0; floorAt(you, WW*0.5); you.invuln = 0; s.x = you.x + 600; s.y = you.y - 300; projectiles = [];
    cobsFightTelegraph(s, 'plug', you); s._tel = 0; s._paneX = [WW*0.5 + 1500]; COBS_MOVES.plug(s, you, ++BOSS_ATK_ID);
    var P = s._plug, T = cobsT(s, 'plug'), rec = { hits: [], f: 0, T: T, dmg: cobsDmg(), kb: COBS_KB, fshock: P.fshock }, AH = applyHit;
    P.wave = 0;   // the instant [POOF], whatever the tier: held out below (a test of the fall, not of the wave)
    applyHit = function(tg, d, kx, ky, from, o){ if (tg === you && o && o.bossAtk != null) rec.hits.push({ d: d, ky: ky, fell: tg._fell, f: rec.f, live: !!(s._plug === P && P.live), ground: tg.onground }); return AH.apply(this, arguments); };
    try {
      var wait0 = P.t; for (var i=0;i<wait0 + 6 && !P.live;i++){ s._atkTimer = 1e9; you.invuln = 0; rec.f++; step(); }   // up to [POOF] (you stand on the floor all that time)
      rec.liveAfterWait = !!P.live; P.t = 1e9;   // and out for good (longer than a real plug is: so the panes stand as long, or one would be laid under whoever falls)
      worldPlats.forEach(function(p){ if (p._cobsPane) p._until = 1e9; });
      var drop = function(H, o){
        o = o || {}; var n0 = rec.hits.length;
        you.hitstun = 0; you.invuln = o.invuln || 0; if (!o.keep) you._floorShockT = 0; you.pct = 0;
        you.x = o.x != null ? o.x : WW*0.5; you.y = groundY() - you.r - H; you.vx = 0; you.vy = 0; you.onground = false;
        var landed = null;
        for (var i=0;i<400;i++){ s._atkTimer = 1e9; rec.f++; if (o.each) o.each(i); step(); if (you.onground && landed === null && i > 1) landed = i; if (landed !== null && i >= landed + 2) break; }
        return { hits: rec.hits.slice(n0), landed: landed };
      };
      ${body}
    } finally { applyHit = AH; }`);

  it('STANDING ON THE FLOOR WHEN IT GOES LIVE IS SAFE: through the whole plug -- the wave out, the poof, the wave back -- nothing of the plug touches a fighter who stays on the floor, at every tier', () => {
    for (const t of [1, 2, 3, 4, 5]) {
      const r = fight(`
        park(); atTier(${t}); s._introT = 0; floorAt(you, WW*0.5); you.invuln = 0; s.x = you.x + 600; s.y = you.y - 300; projectiles = [];
        cobsFightTelegraph(s, 'plug', you); s._tel = 0; s._paneX = [WW*0.5 + 1500]; COBS_MOVES.plug(s, you, ++BOSS_ATK_ID);
        var P = s._plug, hits = [], liveFrames = 0, AH = applyHit;
        applyHit = function(tg, d, kx, ky, from, o){ if (tg === you && o && o.bossAtk != null) hits.push({ d: d, live: !!(s._plug === P && P.live) }); return AH.apply(this, arguments); };
        try { for (var i=0;i<900 && s._plug;i++){ s._atkTimer = 1e9; you.invuln = 0; step(); if (s._plug === P && P.live) liveFrames++; } } finally { applyHit = AH; }
        return { hits: hits, liveFrames: liveFrames, pct: you.pct, T: cobsT(s, 'plug'), ended: !s._plug };`);
      expect(r.ended, `tier ${t}: the plug ran its course`).toBe(true);
      expect(r.liveFrames, `tier ${t}: the floor was live for its poof and its waves`).toBe(r.T.poof + 2*(r.T.wave || 0));
      expect(r.hits, `tier ${t}: and nothing of it hurt a fighter standing on the floor`).toEqual([]);
      expect(r.pct, `tier ${t}: no damage`).toBe(0);
    }
  });

  it('A FALL ONTO THE LIVE FLOOR HURTS BY THE HEIGHT FALLEN: the row\'s shock x a hit x clamp(fall / 200 px, 0.5, 3) -- half from a 100 px fall down, 1x at 200, 2x at 400, 3x from 600 up -- at every tier, one hit a fall, bounced up', () => {
    for (const t of [1, 2, 3, 4, 5]) {
      const r = PLUG(t, `
        var out = {}; [80, 200, 400, 1000].forEach(function(H){ var d = drop(H); out[H] = d.hits; });
        return { out: out, fshock: rec.fshock, dmg: rec.dmg, T: rec.T, kb: rec.kb, live: rec.liveAfterWait };`);
      expect(r.live, `tier ${t}: the floor is live`).toBe(true);
      expect(r.fshock, `tier ${t}: the row's shock (0.3 where the row has none) x 33`).toBeCloseTo(Math.max(r.T.shock, 0.3) * r.dmg, 9);
      for (const [H, k] of [[80, 0.5], [200, 1], [400, 2], [1000, 3]]) {
        const hits = r.out[H];
        expect(hits.length, `tier ${t}, a ${H} px fall: one hit`).toBe(1);
        expect(hits[0].fell, `tier ${t}: the fall the game measured is the one dropped`).toBeCloseTo(H, 3);
        expect(hits[0].d, `tier ${t}, ${H} px: ${k}x the row's shock`).toBeCloseTo(r.fshock * k, 6);
        expect(hits[0].ky, 'bounced up (6, at his launch scale)').toBeCloseTo(-6 * r.kb, 9);
        expect(hits[0].live && hits[0].ground, 'live, and on the floor').toBe(true);
      }
    }
  });

  it('IT IS SCALED, NEVER FLAT: tier 1 (0.3 of 33 = 9.9) takes 4.95 from a short fall, 9.9 from 200 px, 19.8 from 400 and 29.7 from anything over 600 -- and the most a fall can cost is 3 x the row\'s shock x 33', () => {
    const r = PLUG(1, `
      var out = []; [60, 120, 200, 300, 400, 599, 600, 900, 1500].forEach(function(H){ var d = drop(H); out.push([H, d.hits.length ? d.hits[0].d : 0]); });
      return { out: out, dmg: rec.dmg };`);
    const want = (H) => 0.3 * r.dmg * Math.min(3, Math.max(0.5, H / 200));
    for (const [H, d] of r.out) expect(d, `${H} px`).toBeCloseTo(want(H), 6);
    expect(r.out.map((q) => q[1]).every((d, i, a) => i === 0 || d >= a[i - 1] - 1e-9), 'a longer fall never costs less').toBe(true);
    expect(Math.max(...r.out.map((q) => q[1])), 'capped at 3x: 29.7').toBeCloseTo(29.7, 6);
    expect(r.out[0][1], 'floored at half: 4.95').toBeCloseTo(4.95, 6);
  });

  it('A STEP, A BOUNCE AND A HOP IN PLACE ARE NOT FALLS: under 40 px nothing lands (the floor stays safe to move on), and from 40 px it does -- at the half scale', () => {
    const r = PLUG(1, `
      var out = {}; [0, 14, 30, 39, 45, 60].forEach(function(H){ var d = drop(H); out[H] = d.hits.map(function(h){ return h.d; }); });
      return { out: out, fshock: rec.fshock, min: COBS_FALL.min };`);
    expect(r.min).toBe(40);
    for (const H of [0, 14, 30, 39]) expect(r.out[H], `a ${H} px drop is not a fall`).toEqual([]);
    for (const H of [45, 60]) { expect(r.out[H].length, `a ${H} px fall counts`).toBe(1); expect(r.out[H][0], 'at the half scale').toBeCloseTo(r.fshock * 0.5, 6); }
  });

  it('THE FALL IS TRACKED FROM WHERE YOU LEFT THE GROUND: a platform that goes from under you drops you its height -- nothing lands the moment it goes, and the fall onto the live floor costs by that height', () => {
    const r = fight(`
      park(); atTier(1); s._introT = 0; you.invuln = 0; s.x = WW*0.5 + 600; s.y = groundY() - 300; projectiles = [];
      var pls = worldPlats.filter(function(p){ return !p.solid && p.w > 200 && p.y < groundY() - 150; }).sort(function(a, b){ return Math.abs((groundY() - a.y) - 400) - Math.abs((groundY() - b.y) - 400); });
      var pl = pls[0], h = groundY() - pl.y;
      you.x = pl.x + pl.w/2; you.y = pl.y - you.r; you.vx = 0; you.vy = 0; you.pct = 0; you.controller = 'still'; step(); you.pct = 0; you.invuln = 0;
      cobsFightTelegraph(s, 'plug', you); s._tel = 0; s._paneX = [you.x < WW*0.5 ? you.x + 1500 : you.x - 1500]; COBS_MOVES.plug(s, you, ++BOSS_ATK_ID);
      var P = s._plug, hits = [], goneAt = null, f = 0, AH = applyHit;
      applyHit = function(tg, d, kx, ky, from, o){ if (tg === you && o && o.bossAtk != null) hits.push({ f: f, d: d, fell: tg._fell, ground: tg.onground }); return AH.apply(this, arguments); };
      try { for (var i=0;i<P.t + 200;i++){ s._atkTimer = 1e9; you.invuln = 0; f++;
          if (worldPlats.indexOf(pl) >= 0){ you.x = pl.x + pl.w/2; you.y = pl.y - you.r; you.vx = 0; you.vy = 0; }
          step(); if (goneAt === null && worldPlats.indexOf(pl) < 0) goneAt = f; } } finally { applyHit = AH; }
      return { hits: hits, goneAt: goneAt, h: h, fshock: P.fshock, plat: pl.y };`);
    expect(r.goneAt, 'the platform went at [POOF]').not.toBe(null);
    expect(r.hits.length, 'one hit, from the fall').toBe(1);
    expect(r.hits[0].f, 'not the moment the platform goes: when you land').toBeGreaterThan(r.goneAt + 5);
    expect(r.hits[0].ground).toBe(true);
    expect(r.h, 'a real height to fall').toBeGreaterThan(150);
    expect(r.hits[0].fell, 'the fall is from the platform you stood on, to within a frame\'s gravity').toBeGreaterThan(r.h - 4);
    expect(r.hits[0].fell).toBeLessThanOrEqual(r.h + 1e-6);
    expect(r.hits[0].d, 'scaled by the height of that platform').toBeCloseTo(r.fshock * Math.min(3, Math.max(0.5, r.hits[0].fell / 200)), 6);
  });

  it('THE BOUNCE AND THE GRACE STAY: a hit bounces you up; a second fall inside COBS_FLOOR_GRACE (50) frames deals nothing; one after it hurts again', () => {
    const r = PLUG(2, `
      var first = drop(400), f1 = first.hits[0] && first.hits[0].f;
      var inside = drop(400, { keep:true });                                    // lands about 40 frames on: inside the grace
      var gap = rec.f - f1;
      for (var i=0;i<60;i++){ s._atkTimer = 1e9; rec.f++; you.invuln = 0; you.hitstun = 0; step(); }   // the grace runs out
      var after = drop(400, { keep:true });
      return { first: first.hits, inside: inside.hits, after: after.hits, gap: gap, grace: COBS_FLOOR_GRACE, kb: rec.kb, fshock: rec.fshock };`);
    expect(r.grace).toBe(50);
    expect(r.first.length, 'the first fall hurts').toBe(1);
    expect(r.first[0].ky, 'and bounces you up').toBeCloseTo(-6 * r.kb, 9);
    expect(r.gap, 'the second fall landed inside the grace').toBeLessThan(r.grace);
    expect(r.inside, 'and dealt nothing').toEqual([]);
    expect(r.after.length, 'a fall after the grace hurts again').toBe(1);
    expect(r.after[0].d).toBeCloseTo(r.fshock * 2, 6);
  });

  it('NO PILE-ON: a fall that lands in the grace of another hit, or under a MeTag\'s cuff, deals nothing -- and the same fall once that is over does', () => {
    const r = PLUG(2, `
      var grace = drop(400, { invuln:60 });                                                     // landing about 36 frames on, with 24 frames of the hit's grace left
      var cuff = drop(400, { each:function(i){ if (i === 0){ you._cuffUntil = hazardT + 70; you._cuffId = -1; } } });
      you._cuffUntil = 0;
      var free = drop(400);
      return { grace: grace.hits, cuff: cuff.hits, free: free.hits, fshock: rec.fshock };`);
    expect(r.grace, 'in a hit\'s grace').toEqual([]);
    expect(r.cuff, 'under a cuff').toEqual([]);
    expect(r.free.length, 'the same fall with nothing holding it off').toBe(1);
    expect(r.free[0].d).toBeCloseTo(r.fshock * 2, 6);
  });

  it('THE PANES ARE STILL THE SAFE FOOTING: a fall onto a pane he dropped deals nothing, however far -- it is not the floor', () => {
    const r = PLUG(3, `
      var pn = worldPlats.find(function(p){ return p._cobsPane; });
      var d = drop(900, { x: pn.x + pn.w/2 });
      return { hits: d.hits, pane: !!pn };`);
    expect(r.pane, 'a pane stands').toBe(true);
    expect(r.hits, 'a fall onto it costs nothing').toEqual([]);
  });

  it('IT REPLACES THE FLAT SHOCK: no flat hit is left anywhere in the plug -- not on the floor when it goes live, not for a platform that goes, not while the wave takes the platforms -- only falls cost', () => {
    const src = readFileSync('artifacts/V1/index.html', 'utf8');
    const poof = src.slice(src.indexOf('function cobsPoof('), src.indexOf('function cobsFloorLive('));
    expect(poof.includes('cobsHit('), 'cobsPoof and the wave deal no hit of their own').toBe(false);
    const keys = fight(`park(); floorAt(you, WW*0.5); cobsFightTelegraph(s, 'plug', you); s._tel = 0; COBS_MOVES.plug(s, you, ++BOSS_ATK_ID); return Object.keys(s._plug);`);
    expect(keys.includes('shock'), 'and the plug carries no flat `shock` any more (only `fshock`, the base a fall scales)').toBe(false);
    expect(keys.includes('fshock')).toBe(true);
  });
});

// ================= 13. TOXIC CANNON! =================
// "the ship should spawn near you" -- the ship appears close to the fighter it targets (a short way to one side, above them) instead of off the edge of the floor, with a clear tell before its beam starts.
describe('OWNER (round 2): TOXIC CANNON! -- "the ship should spawn near you"', () => {
  // the move at tier `t` with the fighter at `x` (and `lift` px up on a made platform, or on the floor): the telegraph, then the ship the move makes. `body` may use `S` (the ship), `you`, `s`, `fl`.
  const CANNON = (t, x, body = 'return {};', lift = 0) => fight(`
    park(); atTier(${t}); s._introT = 0; summons = summons.filter(function(m){ return m === s; }); projectiles = []; var fl = cobsFloor();
    ${lift ? `worldPlats.push({ x:${x} - 160, y:groundY() - ${lift}, w:320, h:14 }); you.x = ${x}; you.y = groundY() - ${lift} - you.r; you.vx = 0; you.vy = 0; you.controller = 'still'; step();` : `floorAt(you, ${x});`}
    you.invuln = 99999; s.x = you.x + 300; s.y = you.y - 200; s.face = -1;
    cobsFightTelegraph(s, 'cannon', you); var at0 = s._shipAt && { x:s._shipAt.x, y:s._shipAt.y, dir:s._shipAt.dir };
    s._tel = 0; COBS_MOVES.cannon(s, you, ++BOSS_ATK_ID);
    var S = s._ship, T = cobsT(s, 'cannon');
    ${body}`);

  it('THE SHIP APPEARS NEAR THE FIGHTER IT TARGETS: COBS_SHIP_NEAR (420) px to one side of them and up in the sky, sailing toward and across them -- never off the edge of the floor -- at every tier, wherever they stand', () => {
    for (const t of [1, 3, 5]) {
      for (const where of ['WW*0.5', 'cobsFloor().x + 200', 'cobsFloor().x + cobsFloor().w - 200']) {
        const r = fight(`
          park(); atTier(${t}); s._introT = 0; projectiles = []; var fl = cobsFloor(); floorAt(you, ${where}); you.invuln = 99999; s.x = you.x + 300; s.y = you.y - 200;
          cobsFightTelegraph(s, 'cannon', you); s._tel = 0; COBS_MOVES.cannon(s, you, ++BOSS_ATK_ID);
          var S = s._ship;
          return { dx: S.x - you.x, dir: S.dir, towards: Math.sign(you.x - S.x), y: S.y, gy: groundY(), insideFloor: S.x > fl.x && S.x < fl.x + fl.w, near: COBS_SHIP_NEAR, left: S.left, want: cobsT(s, 'cannon').n };`);
        expect(r.near).toBe(420);
        expect(Math.abs(r.dx), `tier ${t} at ${where}: 420 px to one side of them`).toBeCloseTo(420, 3);
        expect(r.dir, `tier ${t}: it sails toward them`).toBe(r.towards);
        expect(r.insideFloor, `tier ${t}: not off the edge of the floor, where it used to come from`).toBe(true);
        expect(r.y, `tier ${t}: up in the sky, above where they stand`).toBeLessThanOrEqual(r.gy - 380);
        expect(r.left, `tier ${t}: the tier's number of passes`).toBe(r.want);
      }
    }
  });

  it('IT IS ABOVE THEM WHEREVER THEY STAND: a fighter up on a platform has the ship over their head (260 px over the platform), not below them', () => {
    const r = CANNON(1, 'WW*0.5', `return { y: S.y, feet: feetY(you), plat: groundY() - 600 };`, 600);
    expect(r.feet, 'they are up on a platform').toBeLessThan(r.plat + 20);
    expect(r.y, 'the ship is over them').toBeLessThanOrEqual(r.feet - 259);
  });

  it('THE TELL BEFORE THE BEAM: the wind-up shows the ship where it will appear (and follows the fighter until the last 12 frames, then holds), and it appears exactly there', () => {
    const r = fight(`
      park(); atTier(2); s._introT = 0; projectiles = []; floorAt(you, WW*0.5); you.invuln = 99999; s.x = you.x + 300; s.y = you.y - 200; s._holdT = 99999;
      cobsFightTelegraph(s, 'cannon', you);
      var len = s._tel, first = Object.assign({}, s._shipAt), seen = [], lockAt = COBS_SHIP_LOCK;
      for (var i=0;i<len - 1;i++){ s._atkTimer = 1e9; you.x = WW*0.5 + Math.min(i, 30)*8; you.vx = 0; step(); you.invuln = 99999; seen.push({ left: s._tel, x: s._shipAt && s._shipAt.x, dir: s._shipAt && s._shipAt.dir }); }
      var held = seen.filter(function(q){ return q.left <= lockAt; }).map(function(q){ return q.x; }), moving = seen.filter(function(q){ return q.left > lockAt; }).map(function(q){ return q.x; });
      var spot = Object.assign({}, s._shipAt); s._atkTimer = 1e9; step();   // the last frame of the wind-up: it appears
      var S = s._ship;
      return { len: len, first: first, spot: spot, held: held, moving: moving, S: S && { x: S.x, y: S.y, dir: S.dir }, sides: seen.map(function(q){ return q.dir; }), lock: lockAt };`);
    expect(r.lock).toBe(12);
    expect(r.first, 'the wind-up shows a spot from its first frame').toBeTruthy();
    expect(new Set(r.moving).size, 'it follows the fighter through the wind-up...').toBeGreaterThan(5);
    expect(new Set(r.held).size, '...and holds for the last 12 frames').toBe(1);
    expect(new Set(r.sides).size, 'on the side it was first shown: it does not flip').toBe(1);
    expect(r.S, 'the ship appears').toBeTruthy();
    expect([r.S.x, r.S.y, r.S.dir], 'exactly where the tell showed it').toEqual([r.spot.x, r.spot.y, r.spot.dir]);
  });

  it('AND IT CHARGES BEFORE ITS BEAM STARTS: for COBS_SHIP_ARM (24) frames it hangs where it appeared -- no sailing, no beam hit, no puddle -- then it sails at its tier\'s speed, the beam leading it by 200 px', () => {
    const r = CANNON(2, 'WW*0.5', `
      you.invuln = 0; you.pct = 0; var x0 = S.x, xs = [], hits = 0, p0 = you.pct, arms = [], puds = [];
      // the fighter stands right under the spot the beam will touch down first, so the very first beam frame would hit them
      you.x = S.x + S.dir*COBS_SHIP_LEAD; you.y = groundY() - you.r; you.vx = 0; you.vy = 0;
      for (var i=0;i<60;i++){ s._atkTimer = 1e9; you.x = S.x + S.dir*COBS_SHIP_LEAD; you.y = groundY() - you.r; you.vx = 0; you.vy = 0; var pb = you.pct; step();
        arms.push(S.arm); xs.push(S.x); puds.push(projectiles.filter(function(p){ return p.cobsPuddle; }).length); if (you.pct > pb && !hits) hits = i + 1; }
      return { x0: x0, xs: xs, arms: arms, hits: hits, puds: puds, spd: T.spd, dir: S.dir, arm0: COBS_SHIP_ARM };`);
    expect(r.arm0).toBe(24);
    expect(r.xs.slice(0, 22).every((x) => x === r.x0), 'it hangs still for the arm').toBe(true);
    expect(r.puds.slice(0, 22).every((n) => n === 0), 'and lays no puddle').toBe(true);
    expect(r.hits, 'no beam hit while it charges (the fighter stood in its first touch-down all that time), and the beam hurts the moment it starts').toBeGreaterThanOrEqual(24);
    expect(r.hits).toBeLessThanOrEqual(27);
    expect(r.arms[0], 'the arm counts down').toBe(23);
    expect(r.xs[r.xs.length - 1] - r.x0, 'then it sails: speed x frames since the arm ended, toward them').toBeCloseTo(r.dir * r.spd * (60 - 24), 3);
  });

  it('THE BEAM COMES TO THEM: with them standing still where it was aimed, it has crossed the 220 px between its first touch-down and them some frames after the arm -- a hit on the floor, passed by a jump', () => {
    const run = (jump) => CANNON(1, 'WW*0.5', `
      you.invuln = 0; you.pct = 0; var hitAt = null;
      for (var i=0;i<160;i++){ s._atkTimer = 1e9; you.invuln = 0; ${jump ? 'you.y = groundY() - you.r - 150; you.vy = 0;' : ''} var pb = you.pct; step(); if (you.pct > pb && hitAt === null) hitAt = i + 1; }
      return { hitAt: hitAt, spd: T.spd, lead: COBS_SHIP_LEAD, near: COBS_SHIP_NEAR, arm: COBS_SHIP_ARM };`);
    const floor = run(false), air = run(true);
    expect(floor.hitAt, 'standing in its path: hit').not.toBe(null);
    const frames = floor.arm + Math.ceil((floor.near - floor.lead - 44) / floor.spd);   // the arm, then the sail from the ship until the beam is within its 44 px of them
    expect(Math.abs(floor.hitAt - frames), 'when the beam arrives: after the arm and the 220 px of floor (less its own width)').toBeLessThanOrEqual(2);
    expect(air.hitAt, 'a jump clears the beam, as ever').toBe(null);
  });

  it('THE REST OF THE CANNON IS AS IT WAS: the tier\'s passes (1, 2, 2, 3, 3), speed, damage, puddles and rocking boat, a new id a pass -- and it turns at the ends of the floor', () => {
    expect(W.eval('COBS_TIERS.cannon.map(function(T){ return [T.n, T.spd, T.dmg, T.puddle, T.rock]; })')).toEqual([[1, 7, 1.1, 120, 0], [2, 8, 1.2, 180, 100], [2, 9, 1.3, 240, 140], [3, 10, 1.4, 300, 160], [3, 11, 1.5, 360, 180]]);
    const r = CANNON(3, 'WW*0.5', `
      S.arm = 0; var id0 = S.id, ids = [S.id], dirs = [S.dir], f = 0, left0 = S.left;
      for (var i=0;i<4000 && s._ship;i++){ s._atkTimer = 1e9; you.invuln = 99999; step(); var Sh = s._ship; if (Sh && Sh.dir !== dirs[dirs.length - 1]){ dirs.push(Sh.dir); ids.push(Sh.id); } f++; }
      return { dirs: dirs, ids: ids, ended: !s._ship, left0: left0, f: f };`);
    expect(r.ended, 'it sails its passes and goes').toBe(true);
    expect(r.dirs.length, 'turning round at the ends of the floor: n passes, n - 1 turns').toBe(r.left0);
    expect(new Set(r.ids).size, 'a new id each pass (one hit a pass)').toBe(r.left0);
  });

  it('THE TELL AND THE ARM DRAW WITHOUT A THROW, with valid canvas calls: the ghost and the lane of the wind-up, the charging ship with its aim line, then the beam -- and the picture changes between them', async () => {
    const { w, errors } = await bootValidating();
    w.eval(`(function(){
      SETTINGS.itemRate = 0; SETTINGS.stocks = 3; LOCAL_PLAYERS = 1;
      startCobsFight(['Knife'], { story:true, onEnd:function(){ return true; } });
      var s = summons.find(function(o){ return o._cobsFight; }), you = fighters[0];
      s._hop = null; s._atkTimer = 1e9; you.controller = 'still'; you.invuln = 99999; s.x = you.x + 300; s.y = you.y - 200; projectiles = [];
    })()`);
    errors.length = 0;
    const r = w.eval(`(function(){
      var s = summons.find(function(o){ return o._cobsFight; }), you = fighters[0], ops = function(){ cobsFx = []; var a = ctx.__ops; drawCobsFx(); return ctx.__ops - a; };
      var out = { idle: ops() };
      cobsFightTelegraph(s, 'cannon', you); out.tell = ops(); s._tel = 3; out.locked = ops();
      s._tel = 0; COBS_MOVES.cannon(s, you, ++BOSS_ATK_ID); s._telKind = null; out.armed = ops(); out.armedEnd = (function(){ s._ship.arm = 1; return ops(); })();
      s._ship.arm = 0; out.beam = ops(); s._ship.rock = 100; out.rocking = ops();
      return out;
    })()`);
    expect(r.tell, 'the wind-up draws the ghost and the lane').toBeGreaterThan(r.idle + 10);
    expect(r.locked, 'locked, in white').toBeGreaterThan(r.idle + 10);
    expect(r.armed, 'the charging ship and its aim line').toBeGreaterThan(r.idle + 10);
    expect(r.beam, 'the beam').toBeGreaterThan(r.idle + 10);
    expect(errors, 'every call valid').toEqual([]);
  });
});

// ================= 14. THE FUTURE IS SO YESTERDAY! =================
// "alongside the future is so yesterday as well" -- he takes his podium NEAR the fighter (flies to a spot beside them first), so the rings start close; keep the rings, their timing and the CARE! finale.
describe('OWNER (round 2): THE FUTURE IS SO YESTERDAY! -- "alongside the future is so yesterday as well"', () => {
  // his keynote at tier `t`, the fighter on the floor in the middle and him `far` px off to the right (up in the air), before the wind-up; `body` may use s, you, T
  const KEY = (t, body, far = 1200) => fight(`
    park(); atTier(${t}); s._introT = 0; summons = summons.filter(function(m){ return m === s; }); projectiles = [];
    floorAt(you, WW*0.5); you.invuln = 99999; s.x = you.x + ${far}; s.y = you.y - 600; s.face = -1;
    var T = cobsT(s, 'keynote');
    ${body}`);

  it('HE FLIES TO A SPOT BESIDE THE FIGHTER FIRST: from a long way off he closes on it through the wind-up -- never moving away from it -- and is there when the rings start, 240 px beside them at the height of their head', () => {
    for (const t of [1, 3, 5]) {
      const r = KEY(t, `
        cobsFightTelegraph(s, 'keynote', you);
        var len = s._tel, spot = Object.assign({}, s._podium), d0 = Math.hypot(s.x - spot.x, s.y - spot.y), ds = [];
        for (var i=0;i<len;i++){ s._atkTimer = 1e9; step(); you.invuln = 99999; ds.push(Math.hypot(s.x - spot.x, s.y - spot.y)); }
        return { spot: spot, d0: d0, ds: ds, rings: s._rings.map(function(R){ return R.x0; }), n: s._rings.filter(function(R){ return !R.stress; }).length, want: T.n, youX: you.x, gy: groundY(), r: s.r, len: len, podium: s._podium, sx: s.x, sy: s.y };`);
      expect(r.d0, `tier ${t}: he starts far from it`).toBeGreaterThan(800);
      expect(r.ds.every((d, i) => i === 0 || d <= r.ds[i - 1] + 1e-6), `tier ${t}: and only ever closes on it`).toBe(true);
      expect(r.ds[r.ds.length - 1], `tier ${t}: there when the wind-up ends`).toBeLessThan(3);
      expect(r.spot.x - r.youX, `tier ${t}: 240 px beside them, on his side`).toBeCloseTo(240, 3);
      expect(r.spot.y, `tier ${t}: at the height of their head: over their feet, less his body and 120`).toBeCloseTo(r.gy - r.r - 120, 3);
      expect(r.n, `tier ${t}: the rings the tier says`).toBe(r.want);
      expect(r.rings.every((x) => Math.abs(x - r.spot.x) < 3), `tier ${t}: every ring starts from under him, at the podium`).toBe(true);
      expect(r.podium, 'and the spot is spent').toBe(null);
    }
  });

  it('THE RINGS START CLOSE: a fighter standing on the floor is reached by the first low ring within about 30 frames, however far off he was when the keynote began (it was well over 100 frames away before)', () => {
    for (const [t, max] of [[1, 32], [5, 26]]) {
      const r = KEY(t, `
        cobsFightTelegraph(s, 'keynote', you); var len = s._tel;
        for (var i=0;i<len + 2;i++){ s._atkTimer = 1e9; step(); you.invuln = 99999; if (s._rings.length) break; }
        var hit = null, f = 0, x0 = s._rings.length ? s._rings[0].x0 : null, youX = you.x;   // (where they stood as the rings began: a hit will throw them)
        for (var j=0;j<200;j++){ s._atkTimer = 1e9; you.invuln = 0; var p0 = you.pct; step(); f++; if (you.pct > p0 && hit === null) hit = f; }
        return { hit: hit, spd: T.spd, x0: x0, youX: youX, rings: s._rings.length };`);
      expect(r.x0, `tier ${t}: the rings began`).not.toBe(null);
      expect(Math.abs(r.x0 - r.youX), `tier ${t}: close to them`).toBeLessThanOrEqual(245);
      expect(r.hit, `tier ${t}: the first ring reaches a fighter on the floor`).not.toBe(null);
      expect(r.hit, `tier ${t}: soon (spd ${r.spd})`).toBeLessThanOrEqual(max);
    }
  });

  it('THE RINGS, THEIR TIMING AND THE CARE! FINALE ARE AS THEY WERE: the five rows (n, spd, dmg, gap, burst, cresc, fin3) and the 50-frame wind-up are unchanged', () => {
    expect(W.eval('COBS_TIERS.keynote')).toEqual([
      { n: 2, spd: 8, dmg: 0.6, gap: 40, burst: 0, cresc: 0, fin3: 0 }, { n: 3, spd: 9, dmg: 0.65, gap: 36, burst: 0.9, cresc: 2, fin3: 0 }, { n: 3, spd: 10, dmg: 0.7, gap: 32, burst: 1.0, cresc: 3, fin3: 1 },
      { n: 4, spd: 11, dmg: 0.75, gap: 28, burst: 1.1, cresc: 3, fin3: 1 }, { n: 5, spd: 12, dmg: 0.8, gap: 24, burst: 1.25, cresc: 4, fin3: 1 }]);
    expect(W.eval('COBS_TEL.keynote')).toBe(50);
    const r = KEY(3, `
      cobsFightTelegraph(s, 'keynote', you); s._tel = 0; COBS_MOVES.keynote(s, you, ++BOSS_ATK_ID);
      return { delays: s._rings.map(function(R){ return R.delay; }), stress: s._rings.map(function(R){ return !!R.stress; }), burst: s._burst && s._burst.t, hold: s._holdT };`);
    expect(r.delays, 'tier 3: a ring every 32 frames, each 3 sooner than the last (0, 32, 61), then the stressed beats 14 apart').toEqual([0, 32, 61, 87, 101]);
    expect(r.burst, 'and the CARE! burst the third beat').toBe(r.delays[4] + 14);
  });

  it('HIS SIDE, AND THE EDGES: the podium is on the side he is on; off the floor that way, on the other -- and inside the floor either way, at the head\'s height over a platform too', () => {
    const r = fight(`
      park(); atTier(1); s._introT = 0; var fl = cobsFloor(), out = {};
      var spot = function(x, bossDx){ floorAt(you, x); s.x = you.x + bossDx; s.y = you.y - 200; var P = cobsPodiumSpot(s, you, 0); return { dx: P.x - you.x, side: P.side, inside: P.x >= fl.x + 80 && P.x <= fl.x + fl.w - 80 }; };
      out.mid = spot(WW*0.5, 300); out.midLeft = spot(WW*0.5, -300);
      out.leftEdge = spot(fl.x + 100, -300);               // him on the outside of the left edge: he cannot stand there
      out.rightEdge = spot(fl.x + fl.w - 100, 300);
      camX = 0; camY = 0;   // (the camera as it was at the start: its top edge is far over the platform, so the clamp to the top of the screen is not what this reads)
      worldPlats.push({ x:WW*0.5 - 160, y:groundY() - 700, w:320, h:14 }); you.x = WW*0.5; you.y = groundY() - 700 - you.r; you.vx = 0; you.vy = 0; step(); camX = 0; camY = 0; s.x = you.x + 300;
      var P2 = cobsPodiumSpot(s, you, 0); out.high = { y: P2.y, feet: feetY(you), r: s.r, top: cobsTopY() };
      return out;`);
    expect(r.mid, 'him on the right: the podium on the right of them').toMatchObject({ side: 1, inside: true });
    expect(r.mid.dx).toBeCloseTo(240, 3);
    expect(r.midLeft, 'him on the left: on the left').toMatchObject({ side: -1, inside: true });
    expect(r.midLeft.dx).toBeCloseTo(-240, 3);
    expect(r.leftEdge, 'the left edge: flipped to the inside').toMatchObject({ side: 1, inside: true });
    expect(r.rightEdge, 'the right edge: flipped to the inside').toMatchObject({ side: -1, inside: true });
    expect(r.high.y, 'over a platform he hangs at the head\'s height over it...').toBeCloseTo(r.high.feet - r.high.r - 120, 3);
    expect(r.high.y, '...and never off the top of the screen').toBeGreaterThanOrEqual(r.high.top + r.high.r - 1e-6);
  });

  it('THE SPOT FOLLOWS THEM THROUGH THE WIND-UP -- on the side first chosen -- and holds for its last 14 frames, so the podium is where it was marked', () => {
    const r = fight(`
      park(); atTier(2); s._introT = 0; summons = summons.filter(function(m){ return m === s; }); projectiles = []; floorAt(you, WW*0.5); you.invuln = 99999; s.x = you.x + 500; s.y = you.y - 300;
      cobsFightTelegraph(s, 'keynote', you); var len = s._tel, seen = [];
      for (var i=0;i<len - 1;i++){ s._atkTimer = 1e9; you.x = WW*0.5 + Math.min(i, 30)*8; you.vx = 0; step(); you.invuln = 99999; seen.push({ left: s._tel, x: s._podium && s._podium.x, side: s._podium && s._podium.side }); }
      return { held: seen.filter(function(q){ return q.left <= COBS_PODIUM.lock; }).map(function(q){ return q.x; }), moving: seen.filter(function(q){ return q.left > COBS_PODIUM.lock; }).map(function(q){ return q.x; }), sides: seen.map(function(q){ return q.side; }), lock: COBS_PODIUM.lock };`);
    expect(r.lock).toBe(14);
    expect(new Set(r.moving).size, 'it follows them...').toBeGreaterThan(5);
    expect(new Set(r.held).size, '...and holds for the last 14 frames').toBe(1);
    expect(new Set(r.sides).size, 'on one side').toBe(1);
  });

  it('A KEYNOTE THAT IS DROPPED DOES NOT LEAVE HIM FLYING TO ITS PODIUM: a tier line in the wind-up takes it (his hop is the movement), and his speech or a stuck blade holds him where he is', () => {
    const r = KEY(2, `
      cobsFightTelegraph(s, 'keynote', you); for (var i=0;i<5;i++){ s._atkTimer = 1e9; step(); you.invuln = 99999; }
      cobsTierUp(s); var after = { tel: s._tel, kind: s._telKind, hop: !!s._hop };
      var x0 = s.x, y0 = s.y; s._hop = null; s._holdT = 0; s._speechT = 60; s._podium = { x: s.x + 900, y: s.y, side: 1 }; s._telKind = 'keynote'; s._tel = 30;
      for (var j=0;j<10;j++){ s._atkTimer = 1e9; step(); you.invuln = 99999; s._tel = 30; }
      return { after: after, drift: Math.hypot(s.x - x0, s.y - y0) };`);
    expect(r.after, 'a tier line drops the wind-up and he hops').toEqual({ tel: 0, kind: null, hop: true });
    expect(r.drift, 'in his speech he does not fly to a stale podium').toBeLessThan(40);
  });

  it('THE TELL DRAWS WITHOUT A THROW, with valid calls: the podium where he is flying to, the dashed ring over it and the screens either side of it', async () => {
    const { w, errors } = await bootValidating();
    w.eval(`(function(){
      SETTINGS.itemRate = 0; SETTINGS.stocks = 3; LOCAL_PLAYERS = 1;
      startCobsFight(['Knife'], { story:true, onEnd:function(){ return true; } });
      var s = summons.find(function(o){ return o._cobsFight; }), you = fighters[0];
      s._hop = null; s._atkTimer = 1e9; you.controller = 'still'; you.invuln = 99999; s.x = you.x + 900; s.y = you.y - 300; projectiles = [];
    })()`);
    errors.length = 0;
    const r = w.eval(`(function(){
      var s = summons.find(function(o){ return o._cobsFight; }), you = fighters[0], ops = function(){ cobsFx = []; var a = ctx.__ops; drawCobsFx(); return ctx.__ops - a; };
      var out = { idle: ops() };
      cobsFightTelegraph(s, 'keynote', you); out.tell = ops(); s._tel = 3; out.late = ops();
      s._podium = null; out.noSpot = ops();
      return out;
    })()`);
    expect(r.tell, 'the podium, its ring and the screens').toBeGreaterThan(r.idle + 4);
    expect(r.late).toBeGreaterThan(r.idle + 4);
    expect(r.tell, 'the ring over the podium is drawn too').toBeGreaterThan(r.noSpot);
    expect(errors, 'every call valid').toEqual([]);
  });
});

// ================= 11. MAZED AND CONFUSED! =================
// "mazed and confused should be a hazard-passive and screen wide." Asked how: "Always on" (the maze covers the whole arena for the entire fight, and its walls shift every ~10 s) and the walls do: "Rayguns on walls"
// (turrets on the walls fire slow shots, like MePhone4's maze). NOT picked: walls that block you, walls that block his shots, walls that hurt on touch. It replaces the between-turns hazard.
describe('OWNER (round 2): MAZED AND CONFUSED! -- "mazed and confused should be a hazard-passive and screen wide."', () => {
  // his fight with the boss not parked for the maze (his turns held far off: _atkTimer 99999) and the fighter on the floor in the middle, still and untouchable; `s`, `you`, `M` (his maze, laid), `fl`, `gy`, `C` = COBS_MAZE.
  // `SYN(guns)` puts five rayguns of a made layout round the fighter, every one facing them and in reach, at 400, 400, 450, 591 and 638 px (the picks of a volley are then known).
  const MAZE = (body, tier = 1) => fight(`
    atTier(${tier}); s._introT = 0; s._atkTimer = 99999; summons = summons.filter(function(m){ return m === s; }); projectiles = [];
    floorAt(you, WW*0.5); you.controller = 'still'; you.invuln = 99999; s.x = you.x + 900; s.y = you.y - 500; s._holdT = 99999;
    var fl = cobsFloor(), gy = groundY(), C = COBS_MAZE; s._maze = null; cobsMazeStep(s, you); var M = s._maze;
    var SYN = function(){ var yy = you.y - 10; M.cur.guns = [ { x:you.x + 400, y:yy, fx:-1, fy:0, type:0, k:0 }, { x:you.x - 400, y:yy, fx:1, fy:0, type:1, k:1 }, { x:you.x, y:yy - 450, fx:0, fy:1, type:2, k:2 },
      { x:you.x + 560, y:yy - 200, fx:-1, fy:0, type:0, k:3 }, { x:you.x - 620, y:yy - 150, fx:1, fy:0, type:1, k:4 } ]; M.cur.walls = []; M.volT = 1; M.vol = null; return M.cur.guns; };
    ${body}`);
  const bolts = `projectiles.filter(function(p){ return p.cobsMaze && p.life > 0; })`;

  it('ALWAYS ON, AND SCREEN WIDE: from the first frame of the fight a maze of hedges lies over the whole arena -- the floor\'s full width, from the floor up most of the way to the top -- walls on every shut edge and a border round it', () => {
    const r = MAZE(`
      var L = M.cur, xs = L.walls.map(function(w){ return w.x; }), xe = L.walls.map(function(w){ return w.x + w.w; }), ys = L.walls.map(function(w){ return w.y; });
      return { cols: L.cols, rows: L.rows, cw: L.cw, ch: L.ch, flx: fl.x, flw: fl.w, gy: gy, WH: WH, minX: Math.min.apply(null, xs), maxX: Math.max.apply(null, xe), minY: Math.min.apply(null, ys), walls: L.walls.length,
        border: L.walls.filter(function(w){ return w.border; }).length, n: M.n, t: M.t, said: M.said };`);
    expect(r.cols * r.cw, 'across the whole floor').toBeCloseTo(r.flw, 6);
    expect(r.rows * r.ch, 'and up most of the arena (the floor to the top, in rows)').toBeGreaterThan(r.gy * 0.7);
    expect(r.rows * r.ch).toBeLessThanOrEqual(r.gy);
    expect(r.minX, 'its border runs round the floor\'s left edge').toBeLessThanOrEqual(r.flx);
    expect(r.maxX, '...and its right').toBeGreaterThanOrEqual(r.flx + r.flw);
    expect(r.minY, '...and over the top').toBeLessThanOrEqual(r.gy - r.rows * r.ch);
    expect(r.border, 'the border: both sides and the top').toBe(3);
    expect(r.walls, 'a maze of walls, not a few').toBeGreaterThan(40);
    expect(r.n, 'the first lay').toBe(0);
  });

  it('IT IS A MAZE: the passages are a spanning tree of the cells (every cell can be reached from every other, by one way only), and a wall stands on every edge the tree leaves shut', () => {
    for (const seed of [1, 77, 123456]) {
      const r = MAZE(`
        var L = cobsMazeGen(${seed}, fl, gy), cells = L.cols*L.rows, open = 0, seen = {}, q = [[0, 0]]; seen['0,0'] = 1;
        for (var r2=0;r2<L.rows;r2++) for (var c2=0;c2<L.cols;c2++){ if (L.pv[r2][c2] && c2 > 0) open++; if (L.ph[r2][c2] && r2 > 0) open++; }
        while (q.length){ var cur = q.shift(), c = cur[0], r = cur[1], n = [];
          if (c > 0 && L.pv[r][c]) n.push([c - 1, r]); if (c < L.cols - 1 && L.pv[r][c + 1]) n.push([c + 1, r]); if (r > 0 && L.ph[r][c]) n.push([c, r - 1]); if (r < L.rows - 1 && L.ph[r + 1][c]) n.push([c, r + 1]);
          n.forEach(function(p){ var k = p[0] + ',' + p[1]; if (!seen[k]){ seen[k] = 1; q.push(p); } }); }
        var inner = (L.cols - 1)*L.rows + L.cols*(L.rows - 1);
        return { cells: cells, open: open, reached: Object.keys(seen).length, inner: inner, walls: L.walls.filter(function(w){ return !w.border; }).length, cols: L.cols, rows: L.rows };`);
      expect(r.reached, `seed ${seed}: every cell is reachable`).toBe(r.cells);
      expect(r.open, `seed ${seed}: by exactly one way (a tree: cells - 1 passages)`).toBe(r.cells - 1);
      expect(r.walls, `seed ${seed}: a wall on every other inner edge`).toBe(r.inner - r.open);
    }
  });

  it('IT IS LAID FROM ITS OWN DICE: the same seed is the same maze, other seeds are other mazes, and laying one -- or running it for a whole minute with nothing to fire at -- never draws on the game\'s random stream', () => {
    const r = MAZE(`
      var R = Math.random, calls = 0; Math.random = function(){ calls++; return R.apply(this, arguments); };
      try {
        var a = cobsMazeGen(5, fl, gy), b = cobsMazeGen(5, fl, gy), c = cobsMazeGen(6, fl, gy);
        var sig = function(L){ return JSON.stringify(L.walls.map(function(w){ return [w.x, w.y, w.w, h(w)]; })) + JSON.stringify(L.guns.map(function(g){ return [g.x, g.y, g.type]; })); }; var h = function(w){ return w.h; };
        s._atkTimer = 1e9; s._maze = null; for (var i=0;i<3600;i++) cobsMazeStep(s, you);   // parked: it lays and shifts, and fires nothing
      } finally { Math.random = R; }
      return { same: sig(a) === sig(b), other: sig(a) !== sig(c), calls: calls, n: s._maze.n, shots: ${bolts}.length };`);
    expect(r.same, 'the same seed, the same maze').toBe(true);
    expect(r.other, 'another seed, another maze').toBe(true);
    expect(r.calls, 'no draw on the game\'s dice').toBe(0);
    expect(r.n, 'and it shifted six times in the minute').toBe(6);
    expect(r.shots, 'with nothing fired').toBe(0);
  });

  it('IT IS SCENERY: nothing of it is a platform -- worldPlats is exactly what it was through three lays -- so it blocks no fighter and no shot of his, and a fighter walks through a wall and stands in one for good with nothing happening', () => {
    const r = MAZE(`
      s._atkTimer = 1e9;   // (parked: no gun fires in this one)
      var before = worldPlats.slice(), L = M.cur, w = L.walls.filter(function(q){ return q.vert && !q.border && q.y + q.h >= gy - 1; })[0];
      for (var k=0;k<3;k++){ M.t = C.period - 2; for (var i=0;i<4;i++) cobsMazeStep(s, you); }
      var same = worldPlats.length === before.length && worldPlats.every(function(p, i){ return p === before[i]; }), L2 = M.cur; w = L2.walls.filter(function(q){ return q.vert && !q.border && q.y + q.h >= gy - 1; })[0];
      // walking through it along the floor
      you.invuln = 0; you.pct = 0; you.x = w.x - 90; you.y = gy - you.r; you.vx = 0; you.vy = 0; step(); var x0 = you.x;
      for (var j=0;j<40;j++){ you.vx = 8; step(); you.invuln = 0; }
      var through = { from: x0, to: you.x, wall: [w.x, w.x + w.w] };
      // standing in the middle of it
      you.x = w.x + w.w/2; you.y = gy - you.r; you.vx = 0; you.vy = 0; var p0 = you.pct, stood = 0;
      for (var j2=0;j2<300;j2++){ you.vx = 0; step(); you.invuln = 0; if (Math.abs(you.x - (w.x + w.w/2)) < w.w) stood++; }
      // a shot of his along the row, through the wall
      var sh = addProj(cobsShot(s, { x:w.x - 200, y:gy - 100, vx:6, vy:0, dmg:1, bossCap:1, r:6, life:200, bossAtk:++BOSS_ATK_ID })), xs = [];
      you.x = 100; you.y = gy - you.r; for (var j3=0;j3<60;j3++){ step(); you.invuln = 99999; xs.push(sh.x); }
      return { same: same, n: M.n, through: through, hurt: you.pct - p0, stood: stood, shot: { x0: w.x - 200, x: sh.x, alive: sh.life > 0, wall: [w.x, w.x + w.w] } };`);
    expect(r.n, 'three lays').toBe(3);
    expect(r.same, 'worldPlats is exactly what it was: the maze is no platform').toBe(true);
    expect(r.through.to, 'a fighter walked clean through the wall (it did not stop him)').toBeGreaterThan(r.through.wall[1] + 20);
    expect(r.stood, 'and could stand in it all that time').toBeGreaterThan(280);
    expect(r.hurt, 'it hurt nothing').toBe(0);
    expect(r.shot.alive && r.shot.x > r.shot.wall[1] + 40, 'a shot of his went through the wall too').toBe(true);
  });

  it('IT IS LAID AGAIN EVERY TEN SECONDS (600 frames), with a TELL before it shifts: the next lay is shown for the last 60 frames, the walls pulse, and nothing is shown before; then the old walls sink and the new ones rise over 30', () => {
    const r = MAZE(`
      s._maze = null; var log = [], seenNext = null, prevT = null, walls0 = null, growth = [];
      for (var i=0;i<1300;i++){ cobsMazeStep(s, you); var m = s._maze;
        if (walls0 === null) walls0 = JSON.stringify(m.cur.walls.map(function(w){ return [w.x, w.y, w.w, w.h]; }));
        if (!m.next) seenNext = seenNext; else if (log.length === 0 && seenNext === null) seenNext = { t: m.t, n: m.n };
        if (m.n !== (log.length ? log[log.length - 1].n : 0)){ log.push({ f: i, n: m.n, same: JSON.stringify(m.cur.walls.map(function(w){ return [w.x, w.y, w.w, w.h]; })) === walls0 }); growth.push({ shift: m.shift, prev: !!m.prev }); }
        else if (log.length === 1 && growth.length < 40) growth.push({ shift: m.shift, prev: !!m.prev });
      }
      return { log: log, seenNext: seenNext, period: C.period, tell: C.tell, grow: C.grow, growth: growth };`);
    expect(r.period, 'ten seconds of frames').toBe(600);
    expect(r.tell).toBe(60);
    expect(r.log.length, 'two lays in 1300 frames').toBe(2);
    expect(r.log[1].f - r.log[0].f, 'every 600 frames').toBe(600);
    expect(r.log[0].same, 'a new maze, not the old one again').toBe(false);
    expect(r.seenNext, 'the next lay is shown ahead of the shift').toEqual({ t: 540, n: 0 });
    expect(r.growth[0], 'the new walls start at nothing and the old ones are still there').toEqual({ shift: 0, prev: true });
    const first = r.growth.slice(0, r.growth.length - 1), withOld = first.filter((g) => g.prev), last = withOld[withOld.length - 1];   // (the last entry is the second lay's own first frame)
    expect(withOld.map((g) => g.shift).slice(0, 4), 'they rise a frame at a time').toEqual([0, 1, 2, 3]);
    expect(last.shift, 'fully risen after `grow` (30) frames, the old ones gone the frame after').toBe(r.grow);
    expect(first.some((g) => !g.prev), 'and the old lay is dropped').toBe(true);
  });

  it('RAYGUNS SIT ON THE WALLS: about half the inner walls carry one -- on a face of it, facing out along the wall\'s normal, in one of the three colours of MePhone4\'s guns -- and the border carries none', () => {
    const r = MAZE(`
      var L = cobsMazeGen(31, fl, gy), W2 = L.walls, off = [];
      L.guns.forEach(function(g){ var w = W2[g.k]; off.push({ border: w.border, vert: w.vert, face: w.vert ? g.fx : g.fy, ortho: w.vert ? g.fy === 0 && Math.abs(g.fx) === 1 : g.fx === 0 && Math.abs(g.fy) === 1,
        d: w.vert ? Math.abs(g.x - (w.x + w.w/2)) : Math.abs(g.y - (w.y + w.h/2)), inside: w.vert ? g.y >= w.y && g.y <= w.y + w.h : g.x >= w.x && g.x <= w.x + w.w, type: g.type }); });
      return { guns: L.guns.length, inner: W2.filter(function(w){ return !w.border; }).length, off: off, wt: L.wall, colors: C.colors, share: C.gunShare };`);
    expect(r.share).toBe(0.5);
    expect(r.guns / r.inner, 'about half of them').toBeGreaterThan(0.3);
    expect(r.guns / r.inner).toBeLessThan(0.7);
    for (const o of r.off) {
      expect(o.border, 'never on the border').toBe(false);
      expect(o.ortho, 'facing straight out of the wall').toBe(true);
      expect(o.d, 'on its face').toBeCloseTo(r.wt / 2 + 3, 6);
      expect(o.inside, 'along the wall').toBe(true);
      expect([0, 1, 2]).toContain(o.type);
    }
    expect(r.colors, 'MePhone4\'s freeze, burn and zap colours').toEqual(['#7ff0ff', '#ff8a2a', '#ffe94a']);
    expect(r.off.some((o) => o.vert) && r.off.some((o) => !o.vert), 'on upright walls and on level ones').toBe(true);
  });

  it('THEY FIRE SLOW, MARKED SHOTS: a volley charges 36 frames and then each gun fires ONE bolt, slow (3.2 px a frame at tier 1), all on one attack id, each the damage of his smallest hits (13.2), marked `lingers`', () => {
    const r = MAZE(`
      var guns = SYN(); var id0 = BOSS_ATK_ID, started = null, fired = null, vol0 = null, sh = [];
      for (var i=0;i<80;i++){ s._atkTimer = 99999; you.invuln = 99999; step();
        if (M.vol && started === null){ started = i; vol0 = { id: M.vol.id, n: M.vol.guns.length, t: M.vol.t, spd: M.vol.spd }; }
        var b = ${bolts}; if (b.length && fired === null){ fired = i; sh = b.map(function(p){ return { x: p.x, y: p.y, vx: p.vx, vy: p.vy, id: p.bossAtk, dmg: p.dmg, cap: p.bossCap, lingers: !!p.lingers, noStun: !!p.noStunHit, beam: !!p.beamShot, owner: p.owner, kb: p.kb, r: p.r, color: p.color }; }); } }
      return { started: started, fired: fired, vol0: vol0, sh: sh, id0: id0, dmg: cobsDmg(), charge: C.charge, spd: C.spd, gunsXY: guns.map(function(g){ return [g.x, g.y]; }), youX: you.x, youY: hurtCY(you) };`);
    expect(r.started, 'a volley began').not.toBe(null);
    expect(r.vol0.n, 'tier 1: two guns').toBe(2);
    expect(r.fired - r.started, 'it charged 36 frames, then fired').toBe(r.charge);
    expect(r.sh.length, 'one bolt a gun').toBe(2);
    expect(new Set(r.sh.map((p) => p.id)).size, 'one attack id for the volley').toBe(1);
    expect(r.sh[0].id).toBe(r.vol0.id);
    expect(r.sh[0].id, 'a fresh id').toBeGreaterThan(r.id0);
    for (const p of r.sh) {
      expect(Math.hypot(p.vx, p.vy), 'slow: tier 1\'s speed').toBeCloseTo(r.spd[0], 6);
      expect(p.dmg, 'the damage of his smallest hits: 0.4 of 33').toBeCloseTo(0.4 * r.dmg, 9);
      expect(p.cap, 'and capped there').toBeCloseTo(p.dmg, 9);
      expect(p.lingers, 'marked `lingers`: terrain to the attack watch, never holding a turn').toBe(true);
      expect(p.noStun, 'never on a fighter still reeling').toBe(true);
      expect([p.beam, p.owner], 'a ray bolt, his').toEqual([true, -2]);
      expect(r.gunsXY.some((g) => Math.hypot(p.x - g[0], p.y - g[1]) < 40), 'leaving a gun').toBe(true);
    }
  });

  it('A BOLT HITS ONCE: two bolts of a volley that both reach a fighter cost him ONE small hit (13.2) -- the one id and its cap -- and a bolt bounces him a little; a fighter who is stunned is not hit by it', () => {
    const r = MAZE(`
      var guns = SYN(); you.invuln = 0; you.pct = 0; var hits = [], AH = applyHit;
      applyHit = function(tg, d, kx, ky, from, o){ if (tg === you && o && o.bossAtk != null) hits.push({ d: d, id: o.bossAtk }); return AH.apply(this, arguments); };
      try { for (var i=0;i<400;i++){ s._atkTimer = 99999; you.invuln = 0; if (i === 1) M.volT = 1e9; step(); if (M.vol === null && i > 40 && !${bolts}.length) break; } } finally { applyHit = AH; }   // (one volley: no second after it)
      return { hits: hits, pct: you.pct, dmg: cobsDmg() };`);
    expect(r.hits.length, 'both bolts reached him').toBeGreaterThanOrEqual(1);
    expect(r.pct, 'and he took one small hit in all').toBeCloseTo(0.4 * r.dmg, 6);
    const stun = MAZE(`
      var guns = SYN(); you.invuln = 0; you.pct = 0; M.volT = 1; var pc = null;
      for (var i=0;i<400;i++){ s._atkTimer = 99999; you.hitstun = 400; you.invuln = 0; step(); }
      return { pct: you.pct };`);
    expect(stun.pct, 'a fighter in hitstun is passed by it (noStunHit)').toBe(0);
  });

  it('THE AIM FOLLOWS THEM THROUGH THE CHARGE AND HOLDS FOR THE LAST 10 FRAMES: the bolt leaves along the held aim, not where they have run to since -- and each gun shows a lit muzzle and an aim line while it charges (drawn below)', () => {
    const r = MAZE(`
      var guns = SYN(), aims = [], bolt = null, held = null;
      for (var i=0;i<60;i++){ s._atkTimer = 99999; you.invuln = 99999; you.x = WW*0.5 + Math.round(Math.sin(i*0.4)*120); you.vx = 0; step();
        if (M.vol){ aims.push({ t: M.vol.t, x: M.vol.ax, y: M.vol.ay }); if (M.vol.t === C.lock) held = { x: M.vol.ax, y: M.vol.ay }; }
        var b = ${bolts}; if (b.length && !bolt){ var p = b[0]; bolt = { ang: Math.atan2(p.vy, p.vx), x: p.x, y: p.y }; } }
      var g = guns[0];
      return { aims: aims, held: held, bolt: bolt, want: held ? Math.atan2(held.y - g.y, held.x - g.x) : null, lock: C.lock, g0: [g.x, g.y] };`);
    const moving = r.aims.filter((a) => a.t > r.lock).map((a) => a.x), held = r.aims.filter((a) => a.t <= r.lock).map((a) => a.x);
    expect(new Set(moving).size, 'it follows them while the charge is young').toBeGreaterThan(3);
    expect(new Set(held).size, 'and holds for the last frames').toBe(1);
    expect(r.bolt, 'a bolt left').toBeTruthy();
    expect(Math.abs(r.bolt.ang - r.want), 'along the held aim').toBeLessThan(0.02);
  });

  it('THE BOLTS NEVER HOLD A TURN OF HIS ("One attack at a time" does not apply to the hazard\'s shots): every one is `lingers`, so the attack watch counts none as live; and his turn timer runs down a frame at a time through a sky full of them', () => {
    const r = MAZE(`
      SYN(); you.invuln = 99999; M.volT = 1; s._atkTimer = 5000; var timers = [], live = 0, maxBolts = 0, watchLive = 0;
      for (var i=0;i<300;i++){ step(); you.invuln = 99999; timers.push(s._atkTimer); var b = ${bolts}; maxBolts = Math.max(maxBolts, b.length); if (b.length) b.forEach(function(p){ if (bossShotLive(p, 0)) watchLive++; }); if (M.vol === null && M.volT <= 0) M.volT = 1; }
      var steps = timers.map(function(t, i){ return i ? timers[i - 1] - t : 1; });
      return { steps: steps, maxBolts: maxBolts, watchLive: watchLive };`);
    expect(r.maxBolts, 'there were bolts in the air').toBeGreaterThan(1);
    expect(r.watchLive, 'the watch counts none of them as a live shot of an attack').toBe(0);
    expect(r.steps.every((d) => d === 1), 'his turn timer ran down one a frame, held by nothing').toBe(true);
  });

  it('SAME DAMAGE, HARDER BY GUNS: 2, 2, 3, 3, 4 guns a volley, every 150, 130, 112, 96, 84 frames, bolts of 3.2, 3.5, 3.8, 4.1, 4.4 px a frame -- and every bolt at every tier is 0.4 x 33, the least any row of his hits for', () => {
    expect(W.eval('[COBS_MAZE.n, COBS_MAZE.every, COBS_MAZE.spd, COBS_MAZE.dmg, COBS_MAZE.first, COBS_MAZE.charge, COBS_MAZE.lock]')).toEqual([[2, 2, 3, 3, 4], [150, 130, 112, 96, 84], [3.2, 3.5, 3.8, 4.1, 4.4], 0.4, 150, 36, 10]);
    const least = W.eval('Math.min.apply(null, Object.keys(COBS_TIERS).map(function(k){ return Math.min.apply(null, COBS_TIERS[k].map(function(T){ return T.dmg; })); }))');
    expect(least, 'the smallest hit in his table').toBe(0.4);
    for (const t of [1, 2, 3, 4, 5]) {
      const r = MAZE(`
        SYN(); you.invuln = 99999; var sh = [], vols = [];
        for (var i=0;i<60;i++){ s._atkTimer = 99999; step(); you.invuln = 99999; if (M.vol && !vols.length) vols.push(M.vol.guns.length); var b = ${bolts}; if (b.length && !sh.length) sh = b.map(function(p){ return [Math.hypot(p.vx, p.vy), p.dmg]; }); }
        return { n: vols[0], sh: sh, dmg: cobsDmg() };`, t);
      expect(r.n, `tier ${t}: the guns of a volley`).toBe([2, 2, 3, 3, 4][t - 1]);
      expect(r.sh.length).toBe(r.n);
      for (const [spd, dmg] of r.sh) { expect(spd).toBeCloseTo([3.2, 3.5, 3.8, 4.1, 4.4][t - 1], 6); expect(dmg, `tier ${t}: the same hit`).toBeCloseTo(0.4 * r.dmg, 9); }
    }
  });

  it('A GUN ONLY FIRES AT A FIGHTER IT FACES AND CAN REACH: not one too close (220 px), too far (900), or turned away -- and a volley with nobody to fire at looks again 30 frames on', () => {
    const r = MAZE(`
      var yy = you.y - 10;
      M.cur.guns = [ { x:you.x + 100, y:yy, fx:-1, fy:0, type:0, k:0 }, { x:you.x + 1200, y:yy, fx:-1, fy:0, type:0, k:1 }, { x:you.x + 400, y:yy, fx:1, fy:0, type:0, k:2 }, { x:you.x - 400, y:yy, fx:1, fy:0, type:1, k:3 } ];
      M.cur.walls = []; var picked = cobsMazePick(M.cur.guns, you, 4).map(function(g){ return g.k; });
      M.cur.guns = [ M.cur.guns[0], M.cur.guns[1], M.cur.guns[2] ]; M.volT = 1; M.vol = null; cobsMazeStep(s, you);
      return { picked: picked, vol: M.vol, volT: M.volT };`);
    expect(r.picked, 'only the one 400 px off that faces them').toEqual([3]);
    expect(r.vol, 'nothing to fire').toBe(null);
    expect(r.volT, 'looks again soon').toBe(30);
  });

  it('A SHIFT TAKES THE GUNS ON THE OLD WALLS AND THE VOLLEY THEY WERE CHARGING WITH IT; bolts already in the air fly on', () => {
    const r = MAZE(`
      SYN(); you.invuln = 99999; for (var i=0;i<60;i++){ s._atkTimer = 99999; step(); you.invuln = 99999; if (M.vol && M.vol.t < 20) break; }
      var charging = !!M.vol, n0 = M.n; var b0 = ${bolts}.length;
      M.t = C.period - 1; M.next = null; s._atkTimer = 99999; cobsMazeStep(s, you);
      return { charging: charging, n: M.n - n0, vol: M.vol, guns: M.cur.guns.length, bolts: ${bolts}.length, b0: b0 };`);
    expect(r.charging, 'a volley was charging').toBe(true);
    expect(r.n, 'the shift happened').toBe(1);
    expect(r.vol, 'its volley is gone').toBe(null);
  });

  it('IT REPLACES THE BETWEEN-TURNS HAZARD: no card, no wind-up, no turn-line wait -- his turns are his own and run as ever with the maze standing; MePhone4\'s maze is not his to build, but is untouched', () => {
    const r = MAZE(`
      var deck = COBS_DECK.concat(COBS_SPECIALS), bag = []; var q = { _moveN:0, _spN:0, _bag:[], _lastCard:null, _marks:2 }; for (var i=0;i<80;i++) bag.push(cobsNextMove(q));
      return { move: typeof COBS_MOVES.maze, tel: COBS_TEL.maze, turn: typeof cobsMazeTurn, quiet: typeof cobsMazeQuiet, ph: typeof cobsMazePh, inDeck: deck.indexOf('maze'), inBag: bag.indexOf('maze'), swoop: COBS_NO_SWOOP.indexOf('maze'),
        mazeT: s._mazeT, mz: s._mz, mpMaze: typeof mpMazeFire, name: COBS_MOVE_NAME.maze, plats: worldPlats.filter(function(p){ return p._mz; }).length };`);
    expect(r.move, 'not a move').toBe('undefined');
    expect(r.tel, 'no wind-up').toBe(undefined);
    expect([r.turn, r.quiet, r.ph], 'the turn-line machinery is gone').toEqual(['undefined', 'undefined', 'undefined']);
    expect([r.inDeck, r.inBag, r.swoop], 'not a card of his, not in his rotation').toEqual([-1, -1, -1]);
    expect([r.mazeT, r.mz], 'no countdown, no standing hedge').toEqual([undefined, undefined]);
    expect(r.plats, 'no hedge platforms').toBe(0);
    expect(r.name, 'named the same').toBe('MAZED AND CONFUSED!');
    expect(r.mpMaze, 'MePhone4\'s own maze is still his').toBe('function');
    const turns = fight(`
      s._introT = 0; summons = summons.filter(function(m){ return m === s; }); floorAt(you, WW*0.5); you.controller = 'still'; you.invuln = 99999; s._atkTimer = 30; s._holdT = 0; var starts = [], was = 0;
      for (var i=0;i<900;i++){ step(); you.invuln = 99999; if (s._tel > 0 && !was) starts.push(i); was = s._tel > 0 ? 1 : 0; }
      return { starts: starts, said: window.__lastBanner && window.__lastBanner.text };`);
    expect(turns.starts.length, 'his turns came, on his own timer, with the maze up the whole time').toBeGreaterThanOrEqual(4);
    expect(turns.starts[0], 'the first on his first timer (30 frames)').toBeLessThan(40);
  });

  it('IT IS NAMED ONCE, WHEN THE GREETING IS OVER, and never over a line already up: MAZED AND CONFUSED! as a boss banner 150 frames in, once for the fight', () => {
    const r = MAZE(`
      var said = [], B = banner; banner = function(t, ms, kind){ said.push([t, kind]); return B.apply(this, arguments); };
      var el = document.getElementById('banner'); if (el) el.classList.remove('show'); s._maze = null;
      try { for (var i=0;i<400;i++) cobsMazeStep(s, you); } finally { banner = B; }
      return { said: said.filter(function(q){ return q[0] === COBS_MOVE_NAME.maze; }) };`);
    expect(r.said, 'once, a boss line').toEqual([['MAZED AND CONFUSED!', 'boss']]);
    const up = MAZE(`
      var said = [], B = banner; banner = function(t, ms, kind){ said.push(t); return B.apply(this, arguments); };
      var el = document.getElementById('banner'); if (el){ el.classList.add('show'); el.classList.add('banner-boss'); } s._maze = null;
      try { for (var i=0;i<400;i++) cobsMazeStep(s, you); } finally { banner = B; if (el){ el.classList.remove('show'); el.classList.remove('banner-boss'); } }
      return { said: said };`);
    expect(up.said, 'another line is up: it waits and does not say it over it (and does not say it later)').toEqual([]);
  });

  it('HIS END CLEARS IT: when he falls the maze, its guns and every bolt of it are gone, nothing is drawn of it, and nothing fires in his ending', () => {
    const r = MAZE(`
      SYN(); you.invuln = 99999; for (var i=0;i<100;i++){ s._atkTimer = 99999; step(); you.invuln = 99999; } var before = { maze: !!s._maze, bolts: ${bolts}.length };
      s.hp = 0; for (var j=0;j<10;j++){ step(); you.invuln = 99999; }
      var left = { maze: s._maze, bolts: ${bolts}.length, dying: s._dying > 0 }; for (var k=0;k<400;k++){ step(); you.invuln = 99999; }
      return { before: before, left: left, later: ${bolts}.length, maze: s._maze };`);
    expect(r.before.maze).toBe(true);
    expect(r.left.maze, 'the maze is gone').toBe(null);
    expect(r.left.dying).toBe(true);
    expect(r.left.bolts, 'and every bolt').toBe(0);
    expect(r.later, 'nothing fires in his ending').toBe(0);
  });

  it('A BOSS PARKED FOR GOOD (an _atkTimer past 1e6, a test\'s) FIRES NOTHING, and the maze still stands and shifts; no gun fires before the greeting is over either', () => {
    const r = MAZE(`
      SYN(); s._atkTimer = 1e9; M.volT = 1; var n = 0; for (var i=0;i<400;i++){ step(); you.invuln = 99999; n = Math.max(n, ${bolts}.length); }
      var parked = { bolts: n, n: M.n, t: M.t };
      s._atkTimer = 99999; s._introT = 30; M.volT = 1; M.vol = null; var m2 = 0; for (var j=0;j<20;j++){ step(); you.invuln = 99999; m2 = Math.max(m2, ${bolts}.length + (M.vol ? 1 : 0)); }
      return { parked: parked, greeting: m2 };`);
    expect(r.parked.bolts, 'parked: nothing fired').toBe(0);
    expect(r.parked.n + r.parked.t, 'but the maze went on').toBeGreaterThan(300);
    expect(r.greeting, 'and none before the greeting is over').toBe(0);
  });

  it('IT NEVER FLOODS THE SCREEN: a whole fight\'s worth of tier-5 volleys at a fighter who never moves keeps the bolts in the air to a few dozen at most, and every one is gone within its life', () => {
    const r = MAZE(`
      SYN(); you.invuln = 99999; var mx = 0, tot = 0, ids = {}; M.volT = 1;
      for (var i=0;i<1500;i++){ s._atkTimer = 99999; M.t = Math.min(M.t, 500); step(); you.invuln = 99999; var b = ${bolts}; mx = Math.max(mx, b.length); b.forEach(function(p){ ids[p.bossAtk] = 1; }); }   // (no shift: the five guns stay)
      return { mx: mx, volleys: Object.keys(ids).length, life: C.life };`, 5);
    expect(r.mx, 'a few dozen at most').toBeLessThan(40);
    expect(r.volleys, 'a volley every 84 frames or so').toBeGreaterThan(10);
  });

  it('THE MAZE DRAWS WITHOUT A THROW, with valid canvas calls, under the shots and the fighters: the walls, the pulse and the next lay\'s outline before a shift, the walls rising and sinking, the guns, and a charging gun\'s lit muzzle and aim line (white once held)', async () => {
    const { w, errors } = await bootValidating();
    w.eval(`(function(){
      SETTINGS.itemRate = 0; SETTINGS.stocks = 3; LOCAL_PLAYERS = 1;
      startCobsFight(['Knife'], { story:true, onEnd:function(){ return true; } });
      var s = summons.find(function(o){ return o._cobsFight; }), you = fighters[0];
      s._hop = null; s._atkTimer = 99999; s._introT = 0; you.controller = 'still'; you.invuln = 99999; projectiles = [];
    })()`);
    errors.length = 0;
    const r = w.eval(`(function(){
      var s = summons.find(function(o){ return o._cobsFight; }), you = fighters[0], fl = cobsFloor(), gy = groundY(), C = COBS_MAZE;
      var ops = function(layer){ var a = ctx.__ops; drawArenaHazard(layer || 'under'); return ctx.__ops - a; };
      s._maze = null; cobsMazeStep(s, you); var M = s._maze, out = { arena: BOSS_ARENA, hook: typeof BOSS_ARENA_HAZARD.meeplehq.draw, step: typeof BOSS_ARENA_HAZARD.meeplehq.step };
      camX = you.x - W/2; camY = you.y - H/2;
      M.shift = C.grow; M.prev = null; out.plain = ops(); out.over = ops('over');
      M.shift = 10; M.prev = cobsMazeGen(9, fl, gy); out.shifting = ops(); M.shift = C.grow; M.prev = null;
      M.t = C.period - 30; M.next = cobsMazeGen(8, fl, gy); out.tell = ops(); M.next = null; M.t = 100;
      var yy = you.y - 10; M.cur.guns = [ { x:you.x + 300, y:yy, fx:-1, fy:0, type:0, k:0 }, { x:you.x - 300, y:yy, fx:1, fy:0, type:1, k:1 } ];
      out.guns = ops(); M.vol = { id:99999, t:20, guns:M.cur.guns.slice(), spd:3.2, dmg:13, ax:you.x, ay:you.y }; out.charging = ops(); M.vol.t = 5; out.locked = ops(); M.vol = null;
      s._maze = null; out.none = ops();
      return out;
    })()`);
    expect(r.arena).toBe('meeplehq');
    expect([r.hook, r.step], 'a draw and no step, like One\'s').toEqual(['function', 'undefined']);
    expect(r.plain, 'the hedges').toBeGreaterThan(40);
    expect(r.over, 'nothing in the layer over the fighters (only the save and restore round the hook)').toBeLessThanOrEqual(4);
    expect(r.tell, 'the tell: pulsing walls and the next lay\'s outline').toBeGreaterThan(r.plain);
    expect(r.charging, 'a charging gun adds its lit muzzle and aim line').toBeGreaterThan(r.guns);
    expect(r.locked, 'held: drawn too').toBeGreaterThan(r.guns);
    expect(r.none, 'no maze, no drawing (only the save and restore round the hook)').toBeLessThanOrEqual(4);
    expect(r.shifting, 'the walls rising and sinking draw').toBeGreaterThan(20);
    expect(errors, 'every call valid').toEqual([]);
  });
});
