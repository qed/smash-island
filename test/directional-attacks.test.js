import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "down-attacks shouldnt be projectiles", "like how up attacks in smash are uppercuts, make it like that", and "the
// hitbox should appear in 1 directions (the one held down or facing.)" (2026-09-23). The direction held picks the kind
// of attack, the same for all 75: X forward, down+X a low sweep at the feet straight ahead, up+X an uppercut.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// A dummy at (dx, dy) from the attacker, who faces right. Returns the damage one move did to it.
const hit = (name, move, dx, dy = 0) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 400 + ${dx}, groundY()-24 + ${dy}, 1);
  A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; step(); [A,D].forEach(function(f){ f.invuln=0; f.hitstun=0; f.atkCd=0; f.pct=30; });
  D.y = groundY()-24 + ${dy}; A.onground = true;
  var p0 = projectiles.length;
  ${move}(A);
  return { dmg: +(D.pct-30).toFixed(2), shots: projectiles.length - p0, launchUp: D.vy < -2 };
})()`);

const ALL = () => W.eval('ROSTER.filter(function(r){ return r.play; }).map(function(r){ return r.name; })');

describe('down+X is a low sweep, not a shot', () => {
  it('throws nothing, for any of the 75', () => {
    const threw = ALL().filter((n) => hit(n, 'doGroundMove', 900).shots > 0);
    expect(threw, 'a down attack that spawns a projectile').toEqual([]);
  });

  it('hits the feet in front, and not behind: one direction', () => {
    const bad = [];
    for (const n of ALL()) {
      const front = hit(n, 'doGroundMove', 40).dmg, behind = hit(n, 'doGroundMove', -40).dmg;
      if (!(front > 0)) bad.push(`${n}: missed a foe at its feet in front`);
      if (behind > 0) bad.push(`${n}: hit behind it`);
    }
    expect(bad).toEqual([]);
  });

  it('pops them up, the way a down tilt does', () => {
    expect(hit('Coiny', 'doGroundMove', 40).launchUp).toBe(true);
  });
});

describe('up+X is an uppercut', () => {
  it('launches a foe in front straight up, hits one overhead, and never the one behind', () => {
    const bad = [];
    for (const n of ALL()) {
      const front = hit(n, 'doUpTilt', 34), over = hit(n, 'doUpTilt', 6, -58), behind = hit(n, 'doUpTilt', -60);
      if (!(front.dmg > 0 && front.launchUp)) bad.push(`${n}: did not launch the foe in front upward`);
      if (!(over.dmg > 0)) bad.push(`${n}: missed a foe directly above`);
      if (behind.dmg > 0) bad.push(`${n}: hit behind it`);
    }
    expect(bad).toEqual([]);
  });

  it('holding up with X picks it, down picks the sweep, neither picks the jab', () => {
    const kind = (held) => W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 900, groundY()-24, 1);
      A.team=0; D.team=1; A.controller='local'; A.you=true; D.controller='still'; fighters=[A,D]; step();
      A.atkCd=0; A.hitstun=0; A.onground=true;
      for (var k in KEYS) down[KEYS[k]] = false;
      ${JSON.stringify(held)}.forEach(function(k){ down[KEYS[k]] = true; });
      step();
      for (var k2 in KEYS) down[KEYS[k2]] = false;
      return A._atkKind;
    })()`);
    expect(kind(['attack'])).toBe('punch');
    expect(kind(['attack', 'down'])).toBe('kick');
    expect(kind(['attack', 'jump'])).toBe('uppercut');
  });
});
