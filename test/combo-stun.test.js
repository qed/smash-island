import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// COMBOS AND THE HIT FREEZE (the owner, 2026-10-20: "give a tiny stun during hits, to allow combos, because I cant spam at the
// speed of light..."; "like, an attack stun").
//
// Every hit stuns 6 frames longer than it did ("Flat +1/10 s"), and hit-grace grows by the same 6, so it still covers the stun as
// much as it did for shots and for anyone else. A chain has no cap and no shrinking stun any more: "if i can get them into a
// position where i can combo relentlessly, and then i dont make a mistake that lets them get away, then I should be rewarded for
// that, right?" And a landed hit holds the two fighters in it still for 2 to 6 frames ("Yes, tiny"): only those two, once a move,
// and with every timer of theirs waiting, so the timing between them is the same after it.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// Leafy's jab is 3%. A is the attacker (a person's keys: `press`), T the target, B a bystander far off. `pin` puts T back where it
// stood, so the knockback cannot carry it out of reach and a string measures the stun alone.
const SETUP = `SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.items=false; SETTINGS.itemRate=0; running=true; paused=false;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  for (var k in down) delete down[k];
  var gy = groundY();
  var mk = function(name, x, idx, team, face){ var f = makeFighter(ROSTER.find(function(r){ return r.name===name; }), x, gy-24, idx);
    f.team = team; f.controller = 'still'; f.face = face; f.stocks = 9; return f; };
  var A = mk('Leafy', 400, 0, 0, 1), T = mk('Golf Ball', 440, 1, 1, -1), B = mk('Coiny', 900, 2, 2, -1);
  fighters = [A, T, B]; step();
  [A, T, B].forEach(function(f){ f.invuln = 0; f._graceLeft = 0; f.pct = 0; f.hitstun = 0; f.atkCd = 0; f.vx = 0; });
  var x0 = T.x, y0 = T.y;
  var pin = function(){ T.x = x0; T.y = y0; T.vx = 0; T.vy = 0; T.onground = true; };
  var free = function(f){ return f.hitstun <= 0 && f._hsHeld !== hazardT; };   // a frame the fighter could act in
  var press = function(on){ down[KEYS.attack] = !!on; };
  // A quick tap of X: down for one frame, and the jab comes out as it lets go (comboInput fires a tap on its release; a plain X held
  // on the ground waits a few frames for C, the grab). tap() runs the release frame too, so the jab has come out when it returns.
  var tap = function(){ press(true); step(); pin(); press(false); step(); pin(); };
`;
const run = (body) => JSON.parse(W.eval(`JSON.stringify((function(){ ${SETUP} ${body} })())`));

// A string of `n` jabs by A, each coming out `late` frames after the frame A could first swing again (the frame a held X would have
// swung on). Each is a tap: down on the frame before it comes out, let go on the frame it does. Reports what landed and every frame
// T was free in between.
const STRING = (n, late) => `
  A.controller = 'local'; A.atkCd = 0;
  var landed = 0, chains = [], freeAt = [], f = 0, last = T.pct;
  var one = function(){ step(); pin(); f++; if (landed && free(T)) freeAt.push(f); };
  tap(); f += 2;
  if (T.pct > last) { landed++; chains.push(T._chain || 0); last = T.pct; }
  while (landed < ${n} && f < 400) {
    while (f < 400) { one(); if (A.atkCd <= 0) break; }   // the frame A was ready
    for (var i = 0; i < ${late} - 2; i++) one();
    press(true); one(); press(false); one();               // the tap: down, then up -- the jab comes out ${late} frames after the ready one
    if (T.pct > last + 1e-9) { landed++; chains.push(T._chain || 0); last = T.pct; } else break;
  }
  return { landed: landed, chains: chains, freeAt: freeAt, pct: +T.pct.toFixed(2) };
`;

describe('the stun ("Flat +1/10 s")', () => {
  it('a 3% jab, then the next jab two frames after it is ready, links: the foe never gets a frame free', () => {
    const r = run(STRING(2, 2));
    expect(r.landed, 'both jabs landed').toBe(2);
    expect(r.chains, 'the second was a link of the first').toEqual([0, 1]);
    expect(r.freeAt, 'no free frame between them').toEqual([]);
  });

  it('every hit stuns 6 frames longer than it did, a moveset move\'s own stun included; the cap moved with it; a tick did not', () => {
    const r = run(`
      var stun = function(dmg, opts){ T.hitstun = 0; T._chainBy = -1; T.invuln = 0; T._graceLeft = 0; T._hitStop = 0; applyHit(T, dmg, 0, 0, A, opts); return T.hitstun; };
      return { s3: stun(3), s10: stun(10), s18: stun(18), s40: stun(40), mv: stun(4, { stun: 22, mvKey: 'ft' }), tick: stun(4, { tick: true }),
               g5: hitGraceFrames(5, null), g60: hitGraceFrames(60, null), gTick: hitGraceFrames(5, null, true) };
    `);
    expect(r.s3, 'a 3% jab (was 9)').toBe(15);
    expect(r.s10, 'a 10% hit (was 16)').toBe(22);
    expect(r.s18, 'an 18% hit (was 24, the old cap)').toBe(30);
    expect(r.s40, 'the cap (was 24)').toBe(30);
    expect(r.mv, 'a moveset move\'s own 22').toBe(28);
    expect(r.tick, 'a tick keeps its stun').toBe(10);
    expect(r.g5, 'grace for a 5% hit (was 12)').toBe(18);
    expect(r.g60, 'grace\'s cap (was 24)').toBe(30);
    expect(r.gTick, 'a tick keeps its grace').toBe(12);
  });
});

describe('no cap on a chain', () => {
  it('a 6-hit string by one attacker keeps linking when each press is timed (no cap, and no stun shrinking link by link)', () => {
    const r = run(STRING(6, 2));
    expect(r.landed).toBe(6);
    expect(r.chains, 'every hit after the first a link').toEqual([0, 1, 2, 3, 4, 5]);
    expect(r.freeAt, 'never a free frame').toEqual([]);
    const s = run(`
      T.hitstun = 0; T._chainBy = -1; applyHit(T, 3, 0, 0, A); var first = T.hitstun;
      for (var i = 0; i < 7; i++) { A._atkSeq = (A._atkSeq || 0) + 1; T.hitstun = 1; applyHit(T, 3, 0, 0, A); }
      return { first: first, eighth: T.hitstun, chain: T._chain };
    `);
    expect(s.chain, 'the eighth hit of a string is its seventh link').toBe(7);
    expect(s.eighth, 'and stuns as long as the first').toBe(s.first);
  });

  it('a follow-up still has to be a NEW move: the same hitbox landing again does not link', () => {
    const r = run(`
      applyHit(T, 3, 0, 0, A); var seq = A._atkSeq;
      var same = chainOpen(T, A); A._atkSeq = (seq || 0) + 1; var fresh = chainOpen(T, A);
      return { same: same, fresh: fresh, other: chainOpen(T, B) };
    `);
    expect(r.same, 'the same move').toBe(false);
    expect(r.fresh, 'a new move').toBe(true);
    expect(r.other, 'another attacker never chains through A\'s grace').toBe(false);
  });
});

describe('a projectile wall still cannot chain-stun', () => {
  it('a 5% shot every frame from B: the foe is free again and again, B and the shots are never held', () => {
    const r = run(`
      var free_ = 0, runs = [], cur = 0, bHeld = 0, shotMoves = 0, shotChecks = 0;
      for (var i = 0; i < 150; i++) {
        addProj({ owner: B.idx, ownerObj: B, x: T.x + 34, y: T.y - 4, vx: -8, vy: 0, dmg: 5, kb: 0.5, r: 6, life: 30, color: '#fff' });
        var shot = projectiles[projectiles.length - 1], sx = shot.x;
        step(); pin();
        if (T._hsHeld === hazardT && shot.life > 0) { shotChecks++; if (shot.x !== sx) shotMoves++; }
        if (B._hsHeld === hazardT || B._hitStop > 0) bHeld++;
        if (free(T)) { free_++; if (cur) runs.push(cur); cur = 0; } else cur++;
      }
      return { free: free_, longest: Math.max.apply(null, runs.concat([cur])), bHeld: bHeld, shotMoves: shotMoves, shotChecks: shotChecks, pct: T.pct };
    `);
    expect(r.pct, 'the shots land').toBeGreaterThan(0);
    expect(r.free, 'free frames, again and again').toBeGreaterThanOrEqual(5);
    expect(r.longest, 'never stunned (or held) longer than one shot\'s stun (17) and freeze (3): each shot waits out the last one\'s grace').toBeLessThanOrEqual(17 + 3);
    expect(r.bHeld, 'the shooter is never held').toBe(0);
    expect(r.shotChecks, 'a shot flying while the foe is held').toBeGreaterThan(0);
    expect(r.shotMoves, 'and it flies on').toBe(r.shotChecks);
  });
});

describe('the hit freeze ("Yes, tiny")', () => {
  it('a swing holds the attacker and the target, 2 frames for a 3% jab and 6 for an 18% hit, scaled between', () => {
    const r = run(`
      var held = function(dmg){
        [A, T].forEach(function(f){ f._hitStop = 0; f._hsOwn = null; f._hsKey = null; f.invuln = 0; f._graceLeft = 0; f.hitstun = 0; });
        A._atkSeq = (A._atkSeq || 0) + 1; STEP_F = A; applyHit(T, dmg, 0, 0, A); STEP_F = null;
        var a = 0, t = 0; for (var i = 0; i < 10; i++) { step(); pin(); if (A._hsHeld === hazardT) a++; if (T._hsHeld === hazardT) t++; }
        return [a, t];
      };
      return { j3: held(3), m10: held(10), h18: held(18), big: held(40), fn: [hitStopFrames(3), hitStopFrames(10), hitStopFrames(18)] };
    `);
    expect(r.j3, 'a 3% jab: both, 2 frames').toEqual([2, 2]);
    expect(r.m10, 'a 10% hit: 4').toEqual([4, 4]);
    expect(r.h18, 'an 18% heavy: 6').toEqual([6, 6]);
    expect(r.big, 'and never more than 6').toEqual([6, 6]);
    expect(r.fn).toEqual([2, 4, 6]);
  });

  it('a real jab, through the step: both are held; the bystander, a shot in flight and the clock are not', () => {
    const r = run(`
      A.controller = 'local'; B.vx = -3; B.onground = true;
      addProj({ owner: B.idx, ownerObj: B, x: 1100, y: gy - 300, vx: 4, vy: 0, dmg: 5, kb: 1, r: 6, life: 200, color: '#fff' });
      var shot = projectiles[projectiles.length - 1];
      tap();
      var ax = A.x, tx = T.x, ty = T.y, t0 = hazardT, bx = B.x, px = shot.x, out = { aHeld: 0, tHeld: 0, bHeld: 0, still: true };
      for (var i = 0; i < 2; i++) { step();
        if (A._hsHeld === hazardT) out.aHeld++; if (T._hsHeld === hazardT) out.tHeld++; if (B._hsHeld === hazardT) out.bHeld++;
        if (A.x !== ax || T.x !== tx || T.y !== ty) out.still = false; }
      out.clock = hazardT - t0; out.bMoved = B.x !== bx; out.shotMoved = shot.x !== px;
      return out;
    `);
    expect(r.aHeld, 'the attacker').toBe(2);
    expect(r.tHeld, 'the target').toBe(2);
    expect(r.still, 'neither moves while held').toBe(true);
    expect(r.bHeld, 'the bystander is not held').toBe(0);
    expect(r.bMoved, 'and goes on moving').toBe(true);
    expect(r.shotMoved, 'a shot in flight flies on').toBe(true);
    expect(r.clock, 'the clock runs').toBe(2);
  });

  it('every timer of theirs waits while held, so the timing between them is the same after it', () => {
    const r = run(`
      A._atkSeq = (A._atkSeq || 0) + 1; STEP_F = A; applyHit(T, 10, 4, -3, A); STEP_F = null; A.atkCd = 12; A.spCd = 30;
      var before = { stun: T.hitstun, inv: T.invuln, grace: T._graceLeft, cd: A.atkCd, sp: A.spCd, vx: T.vx, vy: T.vy };
      for (var i = 0; i < 4; i++) step();
      var held = { stun: T.hitstun, inv: T.invuln, grace: T._graceLeft, cd: A.atkCd, sp: A.spCd, vx: T.vx, vy: T.vy };
      step();
      return { before: before, held: held, after: { stun: T.hitstun, inv: T.invuln, cd: A.atkCd, sp: A.spCd } };
    `);
    expect(r.held, 'after the 4 frames a 10% hit holds, nothing has counted down and the launch is kept').toEqual(r.before);
    expect(r.after.stun).toBe(r.before.stun - 1);
    expect(r.after.inv).toBe(r.before.inv - 1);
    expect(r.after.cd).toBe(r.before.cd - 1);
    expect(r.after.sp).toBe(r.before.sp - 1);
  });

  it('a move that hits many times holds once, on its first hit, so a spin does not crawl', () => {
    const r = run(`
      var S = mk('Saw', 400, 0, 0, 1); fighters = [S, T, B]; S.invuln = 0; T.invuln = 0; T._graceLeft = 0;
      armAtk(S, 60, 'spin'); S._sawing = 60;
      var held = 0, ticks = 0, last = T.pct;
      for (var i = 0; i < 70; i++) { step(); pin(); if (S._hsHeld === hazardT) held++; if (T.pct > last + 1e-9) { ticks++; last = T.pct; } }
      return { held: held, ticks: ticks };
    `);
    expect(r.ticks, 'the spin ticks many times').toBeGreaterThan(3);
    expect(r.held, 'and holds its spinner for one hit\'s freeze').toBeLessThanOrEqual(2);
  });

  it('a move that strikes in a string of wind-ups (Bonesaw\'s three strokes, each a new move so it links) holds once too', () => {
    const r = run(`
      var S = mk('Bonesaw', 400, 0, 0, 1); fighters = [S, T, B]; S.invuln = 0; S.spCd = 0; T.invuln = 0; T._graceLeft = 0; S.controller = 'still';
      doSpecial(S);
      var held = 0, tHeld = 0, hits = 0, last = T.pct;
      for (var i = 0; i < 60; i++) { step(); pin(); if (S._hsHeld === hazardT) held++; if (T._hsHeld === hazardT) tHeld++; if (T.pct > last + 1e-9) { hits++; last = T.pct; } }
      return { held: held, tHeld: tHeld, hits: hits, k: hitStopFrames(3) };
    `);
    expect(r.hits, 'all three strokes land').toBe(3);
    expect(r.held, 'Bonesaw is held once, for the first stroke (it was 2 + 2 + 3)').toBe(r.k);
    expect(r.tHeld, 'and so is the foe').toBe(r.k);
  });

  it('a boss hit holds the hitter, never the boss, and the hitter\'s grace on the boss waits with them', () => {
    const r = run(`
      SETTINGS.mode = 'boss'; fighters = [A]; summons = [];
      var b = makeBossSummon({ name:'Dummy Boss', color:'#9a9aff', attack:'basic', big:2.5, stationary:true }, 1e6);
      var bx = A.x + A.r + b.r - 6; b.hp = b.maxHp = 1e6; b._atkTimer = 1e9; summons.push(b); b.x = bx; b.y = gy - b.r;
      A.controller = 'local'; A.atkCd = 0; A.invuln = 0;
      press(true); step(); b.x = bx; press(false); step(); b.x = bx;
      var hp1 = b.hp, R = bossGraceRec(b, A, false), inv0 = R ? R.invuln : -1, aHeld = 0, bHeldAny = false, invs = [];
      for (var i = 0; i < 8; i++) { step(); b.x = bx; if (A._hsHeld === hazardT) aHeld++; if (b._hitStop > 0 || b._hsHeld != null) bHeldAny = true;
        var R2 = bossGraceRec(b, A, false); invs.push(R2 ? R2.invuln : -1); }
      return { hit: 1e6 - hp1, aHeld: aHeld, bHeldAny: bHeldAny, inv0: inv0, invs: invs, k: hitStopFrames(1e6 - hp1) };
    `);
    expect(r.hit, 'the jab reached the boss').toBeGreaterThan(0);
    expect(r.aHeld, 'the hitter is held').toBe(r.k);
    expect(r.bHeldAny, 'the boss never').toBe(false);
    for (let i = 0; i < r.k; i++) expect(r.invs[i], `held frame ${i + 1}: the grace record waits`).toBe(r.inv0);
    expect(r.invs[r.k], 'then runs down a frame at a time').toBe(r.inv0 - 1);
  });

  it('no freeze while a Final Smash plays, and none for a tick', () => {
    const r = run(`
      A._fs = { t: 1 }; STEP_F = A; applyHit(T, 18, 0, 0, A); STEP_F = null; var fs = [A._hitStop || 0, T._hitStop || 0]; A._fs = null;
      T._hitStop = 0; T.hitstun = 0; T.invuln = 0; applyHit(T, 6, 0, 0, A, { tick: true });
      return { fs: fs, tick: T._hitStop || 0 };
    `);
    expect(r.fs).toEqual([0, 0]);
    expect(r.tick).toBe(0);
  });
});
