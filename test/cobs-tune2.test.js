import { describe, it, expect, beforeAll } from 'vitest';
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
