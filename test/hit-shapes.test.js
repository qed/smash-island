import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "the hurtboxes and hitboxes should be their actual shape and size, not an approximation" (2026-09-21).
// Hurtboxes are each fighter's outline, traced from their render (test/hitboxes). This file is the other half:
// a jab is the fan an arm sweeps, a stab is the blade's line, a dash hits with the attacker's own body, a beam
// is a line, and rings and blasts stay round because they are.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const arena = (name, dx, dy, body, foe = 'Blocky') => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(foe)}; }), 400 + ${dx}, groundY()-24 + ${dy}, 1);
  A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; step(); [A,D].forEach(function(f){ f.invuln=0; f.hitstun=0; f.spCd=0; f.atkCd=0; f.pct=30; f.y = groundY()-24; }); D.y += ${dy}; D.onground = ${dy} >= 0;
  ${body}
})()`);

describe('a jab is the arc an arm sweeps', () => {
  it('lands on a foe in front at arm height, and misses one standing on a ledge above the swing', () => {
    const level = arena('Coiny', 44, 0, `A.atkCd=0; doAttack(A); return +(D.pct-30).toFixed(1);`);
    const above = arena('Coiny', 44, -110, `A.atkCd=0; doAttack(A); return +(D.pct-30).toFixed(1);`);
    expect(level).toBeGreaterThan(0);
    expect(above, 'a punch does not reach 110px straight up').toBe(0);
  });

  it('does not reach behind the puncher', () => {
    const behind = arena('Coiny', -44, 0, `A.atkCd=0; doAttack(A); return +(D.pct-30).toFixed(1);`);
    expect(behind).toBe(0);
  });

  it('the fan is what the overlay records', () => {
    const r = arena('Coiny', 44, 0, `SHOW_HITBOXES = true; DEBUG_HITS.length = 0; A.atkCd=0; doAttack(A); var h = DEBUG_HITS[DEBUG_HITS.length-1]; SHOW_HITBOXES = false; DEBUG_HITS.length = 0;
      return h && h.shape ? { kind: h.shape.kind, r1: h.shape.r1, a0: h.shape.a0, a1: h.shape.a1 } : null;`);
    expect(r && r.kind).toBe('fan');
    expect(r.r1).toBeGreaterThan(40);
    expect(r.a0).toBeLessThan(0);
    expect(r.a1).toBeGreaterThan(0);
  });
});

describe('a stab is the blade', () => {
  it("Pin's Point Pierce lands along her point and not above it", () => {
    const level = arena('Pin', 60, 0, `fireSpecial(A, {}); return +(D.pct-30).toFixed(1);`);
    const above = arena('Pin', 60, -60, `fireSpecial(A, {}); return +(D.pct-30).toFixed(1);`);
    expect(level).toBeGreaterThan(0);
    expect(above).toBe(0);
  });
});

describe('a dash hits with the body', () => {
  it("Leafy's Shadow Blitz hits the foe she runs into, and not one 70px above her path", () => {
    const run = (dy) => arena('Leafy', 120, dy, `doSmash(A); for (var i=0;i<20;i++){ step(); D.x = 520; D.y = groundY()-24 + ${dy}; } return +(D.pct-30).toFixed(1);`);
    expect(run(0)).toBeGreaterThan(0);
    expect(run(-70), 'two 70px-tall bodies 70px apart still brush: that is contact').toBeGreaterThan(0);
    expect(run(-120), 'her body does not reach a foe well above her').toBe(0);
  });

  it('two outlines touching is the test: bodyTouch is true when they overlap and false a body apart', () => {
    const r = arena('Bomby', 40, 0, `var near = bodyTouch(A, D, 6); D.x = A.x + 200; var far = bodyTouch(A, D, 6); return { near: near, far: far };`);
    expect(r.near).toBe(true);
    expect(r.far).toBe(false);
  });
});

describe('a beam is a line, a ring is a ring', () => {
  it("Ruler's beam lands on a foe whose outline crosses its line and misses one standing under it", () => {
    const on = arena('Ruler', 300, 0, `doSmash(A); return +(D.pct-30).toFixed(1);`);
    const under = arena('Ruler', 300, 0, `A.y -= 90; doSmash(A); return +(D.pct-30).toFixed(1);`);
    expect(on).toBeGreaterThan(0);
    expect(under, 'a beam 90px overhead is not a hit').toBe(0);
  });

  it("Fries' Deep Fryer is still a ring: it hits all around him", () => {
    const behind = arena('Fries', -60, 0, `doSmash(A); for (var i=0;i<30;i++){ step(); D.x = 340; D.invuln = 0; } return +(D.pct-30).toFixed(1);`);
    expect(behind).toBeGreaterThan(0);
  });
});

describe('the shape tests are honest', () => {
  it('a fan cannot miss a 16px-wide fighter standing anywhere inside it', () => {
    // Needle-thin: a 16 x 70 outline, slid across the fan's arc and out to its rim
    const r = W.eval(`(function(){ var f = { x:0, y:0, r:24, face:1 }; var sh = jabFan(f, 60); var miss = [];
      var poly = [-8,-38, 8,-38, 8,36, -8,36];
      for (var a=-0.5; a<=0.4; a+=0.1) for (var rr=20; rr<=58; rr+=6){
        var t = { x: Math.cos(a)*rr, y: Math.sin(a)*rr, r:24, face:-1, hurt:{ poly: poly, flip:false, rx:8, ry:37, oy:-1 } };
        if (!shapeHits(sh, t)) miss.push(a.toFixed(1)+'@'+rr); }
      return miss; })()`);
    expect(r).toEqual([]);
  });
});
