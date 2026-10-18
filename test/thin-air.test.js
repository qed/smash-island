import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';
import { loadMonolith } from './helpers/load-monolith.js';

// THIN AIR ("Fix it", the owner, 2026-10-18). Bubble's Thermal Rise sets a float timer (_floatT = 60) and Capture the Flag's float
// areas hold it while you are in one; gravFor turns it into gravity at 0.35. gravFor was never called, so neither ever lightened
// anything, and the timer, never read down, stayed set for good (which also kept the fast fall off for the rest of the match). These
// pin the float as designed: light while the timer runs (the fall stat on top, on the way down), the timer running out, and a float
// area lightening gravity inside it and not outside.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// Bubble high in the air on an empty field, standing still. Returns her vy, float timer and height frame by frame after `act`.
const fly = (act, frames, stats = {}) => JSON.parse(W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true; TESTMODE.active=false;
  stage = Object.assign({}, STAGES[0], { plats:[], hazard:null }); worldPlats=[]; worldZones=[];
  summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var mk=function(n,x,i){ return makeFighter(ROSTER.find(function(r){return r.name===n;}), x, groundY()-24, i); };
  var A = mk('Bubble', 300, 0), D = mk('Pencil', 1400, 1);
  A.team=0; D.team=1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; for (var k in down) delete down[k]; step(); step();
  Object.assign(A.st, ${JSON.stringify(stats)});
  A.y = groundY()-700; A.vx=0; A.vy=0; A.onground=false; A.invuln=0; A.hitstun=0; A.spCd=0; A._floatT=0;
  ${act}
  var out = { vy0:A.vy, t0:A._floatT, vy:[], t:[], y:[], G:GRAV };
  for (var i=0;i<${frames};i++){ step(); out.vy.push(A.vy); out.t.push(A._floatT); out.y.push(A.y); }
  out.air = !A.onground;
  return JSON.stringify(out);
})()`));
const deltas = (r) => r.vy.map((v, i) => v - (i ? r.vy[i - 1] : r.vy0));

describe('thin air: Thermal Rise', () => {
  it('lightens gravity to 0.35 for its second, then the timer runs out and gravity is whole again', () => {
    const r = fly('fireSpecial(A, {});', 70);
    expect(r.t0, 'Thermal Rise sets the float timer').toBe(60);
    expect(r.vy0).toBe(-7);
    expect(r.air, 'still in the air after 70 frames').toBe(true);
    const dv = deltas(r);
    for (let i = 0; i < 60; i++) expect(dv[i], `float frame ${i + 1}`).toBeCloseTo(r.G * 0.35, 9);
    expect(r.t[59], 'the timer has run out after 60 frames').toBe(0);
    for (let i = 60; i < 70; i++) expect(dv[i], `frame ${i + 1}: whole gravity`).toBeCloseTo(r.G, 9);
  });

  it('falls slower than a normal fall, and the fall stat pulls on the way down', () => {
    // from rest at the same height: the float timer set by hand versus none
    const fl = fly('A._floatT = 60;', 20), plain = fly('', 20);
    const drop = (q) => q.y[19] - q.y[0];
    expect(drop(fl), 'floating she falls about a third as far').toBeLessThan(drop(plain) * 0.4);
    expect(drop(fl)).toBeGreaterThan(0);
    // fall 1.1: the way down is 1.1x the light gravity, the way up is not touched
    const f11 = fly('fireSpecial(A, {});', 60, { fall: 1.1 });
    const dv = deltas(f11);
    let up = 0, downN = 0;
    for (let i = 0; i < 60; i++) {
      const prev = i ? f11.vy[i - 1] : f11.vy0;
      if (prev > 0) { expect(dv[i], `falling frame ${i + 1}`).toBeCloseTo(f11.G * 0.35 * 1.1, 9); downN++; }
      else if (f11.vy[i] <= 0) { expect(dv[i], `rising frame ${i + 1}`).toBeCloseTo(f11.G * 0.35, 9); up++; }
    }
    expect(up, 'frames rising').toBeGreaterThan(20);
    expect(downN, 'frames falling').toBeGreaterThan(20);
  });

  it("Bubble's move card says what it does", () => {
    const line = W.eval("MOVE_TEXT['Bubble'].special");
    expect(line).toMatch(/^Thermal Rise — no hit:/);
    expect(line).toMatch(/float/);
    expect(line).toMatch(/both of your jumps back/);
  });
});

describe('thin air: Capture the Flag float areas', () => {
  it('lighten gravity inside and not outside, and let go a few frames after you leave', () => {
    const { window: w } = loadMonolith(13);
    w.eval(`CTF.skipNav=true; SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.forceMap='castle'; beginMatchNow();
            fighters.forEach(function(f){ f.controller='still'; f.you=false; }); ctfEndHide(CTF.live);`);
    const r = JSON.parse(w.eval(`(function(){
      var z = worldZones.filter(function(q){ return q.type==='float'; })[0]; if (!z) return JSON.stringify({ none:true });
      var A = fighters[0], plats = platRects();
      var solidNear = function(x, y){ return plats.some(function(p){ return x+120 > p.x && x-120 < p.x+p.w && y+120 > p.y && y-120 < p.y+(p.h||16); }); };
      var zoneNear = function(x, y){ return worldZones.some(function(q){ return x+60 > q.x && x-60 < q.x+q.w && y+60 > q.y && y-60 < q.y+q.h; }); };
      var ys = [0.3, 0.4, 0.5, 0.6].map(function(k){ return z.y + z.h*k; });
      var inside = null, outside = null;
      ys.forEach(function(y){ var x = z.x + z.w/2; if (!inside && !solidNear(x, y)) inside = [x, y]; });
      [z.x - 300, z.x - 500, z.x + z.w + 300, z.x + z.w + 500].forEach(function(x){ ys.forEach(function(y){ if (!outside && !solidNear(x, y) && !zoneNear(x, y)) outside = [x, y]; }); });
      // a free fall from rest at a place, held to its x (nothing else moves the fighter): vy frame by frame
      var fall = function(at, n){ A.x = at[0]; A.y = at[1]; A.vx = 0; A.vy = 0; A.onground = false; A._floatT = 0; A.hitstun = 0; A.invuln = 0;
        var vy = [0]; for (var i=0;i<n;i++){ step(); vy.push(A.vy); A.x = at[0]; } return vy; };
      var vin = inside && fall(inside, 8), vout = outside && fall(outside, 8), vleave = null;
      // leaving: a while in the float area, then out into the clear (a few frames of its timer are left)
      if (inside && outside){ fall(inside, 6); A.x = outside[0]; A.y = outside[1]; A.vy = 0; vleave = [0]; for (var i=0;i<8;i++){ step(); vleave.push(A.vy); A.x = outside[0]; } }
      return JSON.stringify({ inside:inside, outside:outside, vin:vin, vout:vout, vleave:vleave, t:A._floatT });
    })()`));
    expect(r.none, 'the castle has a float area').toBeUndefined();
    expect(r.inside, 'a clear place inside it').not.toBe(null);
    expect(r.outside, 'a clear place beside it').not.toBe(null);
    const d = (v) => v.slice(1).map((x, i) => x - v[i]);
    const din = d(r.vin), dout = d(r.vout), dleave = d(r.vleave);
    const G = dout[0];
    expect(G, 'outside: whole gravity').toBeGreaterThan(0.5);
    for (let i = 1; i < 8; i++) expect(dout[i], `outside frame ${i + 1}`).toBeCloseTo(G, 9);
    // inside: the first frame is still whole (the area is felt after that frame's move), then 0.35 of it every frame
    expect(din[0]).toBeCloseTo(G, 9);
    for (let i = 1; i < 8; i++) expect(din[i], `inside frame ${i + 1}`).toBeCloseTo(G * 0.35, 9);
    // out of it: the timer it left behind runs out within a few frames, and gravity is whole again
    expect(dleave[0]).toBeCloseTo(G * 0.35, 9);
    for (let i = 4; i < 8; i++) expect(dleave[i], `after leaving, frame ${i + 1}`).toBeCloseTo(G, 9);
    expect(r.t, 'the timer has run out').toBe(0);
  });
});
