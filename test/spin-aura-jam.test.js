import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// Two bugs from the hitbox visuals audit (the owner, 2026-10-19: "fix those two bugs too").
// 1. The spin aura's size and launch (_spinR, _spinKb) were set only by the rising 'spin' up-specials and never reset, so after
//    Donut's up-special her Sprinkle Roll was a 56 px upward launch for the rest of the match instead of its own 30 px outward push.
// 2. Remote's down-special found the nearest foe within reach and then ran an empty branch: it did nothing. Her card says
//    "jams the nearest foe within medium reach ... no damage, scrambles their controls for about a second".

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const setup = (a, foes) => `
  SETTINGS.mode='ffa'; SETTINGS.count=${1 + foes.length}; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(a)}; }), 400, groundY()-24, 0);
  var F = [${foes.map(([n, dx], i) => `makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(n)}; }), ${400 + dx}, groundY()-24, ${i + 1})`).join(', ')}];
  A.team=0; A.face=1; F.forEach(function(e){ e.team=1; e.face = e.x > A.x ? -1 : 1; });
  fighters=[A].concat(F); fighters.forEach(function(f){ f.controller='still'; f.stocks=9; }); step();
  fighters.forEach(function(f){ f.invuln=0; f.spCd=0; f.atkCd=0; f.pct=0; f.ctrlRev=0; f._revLock=0; f.hitstun=0; });`;

describe("Donut's Sprinkle Roll keeps its own aura after her up-special", () => {
  it('is 30 px and pushes outward, not the up-special\'s 56 px upward launch', () => {
    const r = W.eval(`(function(){ ${setup('Donut', [['Leafy', 320]])}
      var E = F[0];
      A.onground = true; fireSpecial(A, {up:true});
      var up = { r:A._spinR, kb:A._spinKb };
      for (var i = 0; i < 120; i++) step();   // the rising spin runs out and she lands
      var after = { saw:A._sawing, r:A._spinR, kb:A._spinKb };
      // now the roll, with a foe right beside her
      A.x = 400; A.y = groundY()-24; A.vx = 0; A.vy = 0; A.face = 1; A.onground = true; A.spCd = 0; A.atkCd = 0; A.hitstun = 0;
      E.x = 440; E.y = groundY()-24; E.vx = 0; E.vy = 0; E.pct = 0; E.invuln = 0; E.hitstun = 0; E.dead = false;
      fireSpecial(A, {});
      var roll = { r:A._spinR, kb:A._spinKb, saw:A._sawing };
      var hit = null;
      for (var j = 0; j < 30 && !hit; j++){ var p0 = E.pct; step(); if (E.pct > p0) hit = { vx:E.vx, vy:E.vy, dx:E.x - A.x }; }
      for (var k = 0; k < 60; k++) step();
      return { up:up, after:after, roll:roll, hit:hit, end:{ saw:A._sawing, r:A._spinR, kb:A._spinKb } };
    })()`);
    expect(r.up).toEqual({ r: 56, kb: 'up' });                        // the up-special's own rising aura
    expect(r.after.saw).toBe(0);
    expect(r.after.r == null && r.after.kb == null, `the aura ended, so its size and launch went with it: ${JSON.stringify(r.after)}`).toBe(true);
    expect(r.roll.saw).toBeGreaterThan(0);
    expect(r.roll).toMatchObject({ r: 30, kb: 'out' });               // Sprinkle Roll's own: 30 px, outward
    expect(r.hit, 'the roll lands on the foe beside her').not.toBeNull();
    expect(Math.sign(r.hit.vx), `pushed out, away from her (${JSON.stringify(r.hit)})`).toBe(Math.sign(r.hit.dx));
    expect(Math.abs(r.hit.vx)).toBeGreaterThan(1);                     // the upward launch has no sideways push at all
    expect(r.end.r == null && r.end.kb == null).toBe(true);
  });
});

describe("Remote's down-special: Remote Jam", () => {
  it('scrambles the nearest foe within reach for about a second, with no damage, and leaves the farther one alone', () => {
    const r = W.eval(`(function(){ ${setup('Remote', [['Leafy', 150], ['Pen', -185]])}
      var near = F[0], far = F[1];
      fireSpecial(A, {down:true});
      var at = { near:near.ctrlRev, far:far.ctrlRev, nearPct:near.pct, farPct:far.pct, cd:A.spCd };
      var gone = -1;
      for (var i = 1; i <= 120 && gone < 0; i++){ step(); if (!(near.ctrlRev > 0)) gone = i; }
      return { at:at, gone:gone };
    })()`);
    expect(r.at.near, 'the nearest foe is jammed').toBeGreaterThanOrEqual(45);
    expect(r.at.near).toBeLessThanOrEqual(75);                        // about a second
    expect(r.at.far, 'only the nearest one').toBe(0);
    expect(r.at.nearPct).toBe(0);                                     // no damage
    expect(r.at.farPct).toBe(0);
    expect(r.at.cd).toBeGreaterThan(0);                               // a down-special's cooldown
    expect(r.gone).toBeGreaterThanOrEqual(45);
    expect(r.gone).toBeLessThanOrEqual(75);
  });

  it('does nothing to a foe beyond its reach', () => {
    const r = W.eval(`(function(){ ${setup('Remote', [['Leafy', 260]])}
      var E = F[0];
      fireSpecial(A, {down:true});
      var at = E.ctrlRev;
      for (var i = 0; i < 10; i++) step();
      return { at:at, later:E.ctrlRev, pct:E.pct };
    })()`);
    expect(r.at).toBe(0);
    expect(r.later).toBe(0);
    expect(r.pct).toBe(0);
  });
});
