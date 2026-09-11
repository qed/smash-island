import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// HIT-GRACE.
//
// Grace is the few frames after a hit when nothing else can land. A light poke used to give six, which
// is how a projectile wall or a fast multi-hit chained someone with no gap to answer in. It is roughly
// doubled now and still scales with the hit. Longer grace must not break a single move built to hit
// more than once, so an attacker may land THAT move's later hits through the grace its earlier ones
// opened -- and nothing else may: not another attacker, not the same attacker's next move, and never
// through respawn protection.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const three = `SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 400, groundY()-24, 0);
  var T = makeFighter(ROSTER.find(function(r){ return r.name==='Golf Ball'; }), 460, groundY()-24, 1);
  var B = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 300, groundY()-24, 2);
  A.team=0; T.team=1; B.team=2; [A,T,B].forEach(function(f){ f.controller='still'; });
  fighters=[A,T,B]; step(); A.invuln=0; T.invuln=0; B.invuln=0;`;

describe('how much', () => {
  it('scales with the hit, about double the old light end, capped at 24', () => {
    const g = W.eval(`(function(){ ${three}
      var out = {};
      [5, 18, 60].forEach(function(d){ T.invuln=0; T.pct=0; applyHit(T, d, 1, -1, null); out[d] = T.invuln; });
      return out; })()`);
    expect(g[5], 'a light poke (was 6)').toBeGreaterThanOrEqual(10);
    expect(g[18]).toBeGreaterThan(g[5]);
    expect(g[60]).toBe(24);
  });
});

describe('what it blocks', () => {
  it("blocks another attacker, and the same attacker's NEXT move", () => {
    const r = W.eval(`(function(){ ${three}
      applyHit(T, 5, 1, -1, A);          // A's jab
      var other = graceBlocks(T, B);
      beginCombo(A);                     // A starts a multi-hit move after it
      return { invuln: T.invuln, other: other, next: graceBlocks(T, A) }; })()`);
    expect(r.invuln).toBeGreaterThan(0);
    expect(r.other, 'a second attacker').toBe(true);
    expect(r.next, "the jab's grace, against A's next move").toBe(true);
  });

  it('lets one move land its own later hits, and never through respawn protection', () => {
    const r = W.eval(`(function(){ ${three}
      beginCombo(A); applyHit(T, 4, 1, -1, A);    // the first tick of A's move
      var own = graceBlocks(T, A), other = graceBlocks(T, B);
      T.invuln = 90;                               // respawn protection outlasts any grace window
      return { own: own, other: other, respawn: graceBlocks(T, A) }; })()`);
    expect(r.own, "the move's own next tick").toBe(false);
    expect(r.other, 'anyone else, meanwhile').toBe(true);
    expect(r.respawn).toBe(true);
  });
});

describe('the launchers that ignore grace', () => {
  it("a heavy hit's grace (up to 24 now) still does not stop them; real invulnerability still does", () => {
    const r = W.eval(`(function(){ ${three}
      applyHit(T, 60, 1, -1, null); var heavy = T.invuln, graceOnly = hardInvuln(T);
      T.invuln = 20; T._graceLeft = 0; var dodge = hardInvuln(T);
      T.invuln = 14; var small = hardInvuln(T);
      return { heavy: heavy, graceOnly: graceOnly, dodge: dodge, small: small }; })()`);
    expect(r.heavy, 'past the old 16 the launchers measured against').toBeGreaterThan(16);
    expect(r.graceOnly, 'grace alone').toBe(false);
    expect(r.dodge, 'a 20-frame dodge').toBe(true);
    expect(r.small, 'the old rule, unchanged below 16').toBe(false);
  });

  it('the grace share runs down in step with invulnerability', () => {
    const r = W.eval(`(function(){ ${three}
      applyHit(T, 5, 0, 0, null); var before = T.invuln;
      step(); step(); step();
      return { before: before, invuln: T.invuln, left: T._graceLeft }; })()`);
    expect(r.invuln).toBeLessThan(r.before);
    expect(r.left).toBe(r.invuln);
  });
});

describe('the moves it has to leave alone', () => {
  it("a tapped dash-past smash still lands its swing back through the pass's grace", () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      // any 'through' smash whose effect does no damage over time, so every rise in pct is a hit
      var who = ROSTER.find(function(r){ var s = r.play && SMASH_SPEC[r.kit.special];
        return s && s.pat==='through' && s.effect!=='bleed'; });
      var A = makeFighter(who, 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Golf Ball'; }), 440, groundY()-24, 1);
      A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; fighters=[A,D]; step();
      A.invuln=0; D.invuln=0; A.atkCd=0; D.pct=0; D.hurt=null; D.vx=0; D.vy=0;
      doSmash(A, 0);
      var hits = 0, last = 0;
      for (var i=0; i<30 && (A._sm || i<2); i++){ step(); if (D.pct > last + 0.01){ hits++; last = D.pct; } }
      return { name: who.name, hits: hits }; })()`);
    expect(r.hits, `${r.name}: the pass, then the swing back`).toBe(2);
  });
});
