import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "Tune both" (2026-09-16). Six tournament runs a side put Roboty at 62-71% and Gelatin at 2% on both builds of the
// smash change, far outside the 20pp per-fighter noise floor. Forty instrumented 5-way matches each said why:
// Roboty's Antenna Spring scored 154 of his 182 knockouts (a special scores 5% of everyone else's), and Gelatin dealt
// normal damage but scored 0.45 knockouts a match, because every one of her moves launches weakly. One change each.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const arena = (name, dx, body) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), ${400 + dx}, groundY()-24, 1);
  A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; step(); [A,D].forEach(function(f){ f.invuln=0; f.hitstun=0; f.spCd=0; f.atkCd=0; f.armor=0; });
  ${body}
})()`);

describe("Roboty's Antenna Spring launches less", () => {
  it('the launch is -16 (was -24), and a foe on him is still hit and sent up', () => {
    const r = arena('Roboty', 30, `
      D.pct = 60; fireSpecial(A, {});
      var vy = D.vy;
      return { k: ANTENNA_FOE_VY, hit: D.pct > 60, vy: vy };`);
    expect(r.k).toBe(-16);
    expect(r.hit).toBe(true);
    expect(r.vy, 'still a launch upward').toBeLessThan(-6);
  });
});

describe("Gelatin's third syringe jab is a launcher", () => {
  it('the first two jabs push lightly and the third launches, for the same damage each', () => {
    const r = arena('Gelatin', 30, `
      D.pct = 60; D.hurt = null;
      var out = []; var last = D.pct;
      doAttack(A);
      if (D.pct > last){ out.push({ dmg: +(D.pct-last).toFixed(2), speed: Math.hypot(D.vx, D.vy) }); last = D.pct; D.vx = 0; D.vy = 0; D.x = 430; D.y = groundY()-24; D.onground = true; }
      for (var i=0;i<20;i++){ step(); D.x = 430; if (D.pct > last + 0.05){ out.push({ dmg: +(D.pct-last).toFixed(2), speed: Math.hypot(D.vx, D.vy) }); last = D.pct; D.vx = 0; D.vy = 0; D.y = groundY()-24; D.onground = true; } }
      return { hits: out, finalKb: RANGE_PROFILE.freeze.multi.finalKb };`);
    expect(r.finalKb).toBe(18);
    expect(r.hits.length, 'three jabs').toBe(3);
    expect(Math.abs(r.hits[2].dmg - r.hits[0].dmg), 'the same damage each').toBeLessThan(0.2);
    expect(r.hits[2].speed, 'the third launches far harder than the second').toBeGreaterThan(r.hits[1].speed * 2.5);
  });

  it('a flurry without finalKb is untouched: Barf Bag still heaves twice at the same push', () => {
    expect(W.eval('RANGE_PROFILE.splash.multi.finalKb === undefined')).toBe(true);
  });
});

describe('the second pass (2026-09-16): Roboty waits longer, the bottom four get what they were missing', () => {
  it("Roboty's Antenna Spring waits about 1.5 s", () => {
    const r = arena('Roboty', 300, `fireSpecial(A, {}); return A.spCd;`);
    expect(r).toBeGreaterThanOrEqual(88);
  });

  it("Needle's and Woody's third jab launches; Nickel's jab reaches further; Pillow's shockwave hits for 16", () => {
    const r = W.eval(`({ needle: RANGE_PROFILE.counter.multi.finalKb, woody: RANGE_PROFILE.fraidy.multi.finalKb, nickel: RANGE_PROFILE.flip.reach })`);
    expect(r).toEqual({ needle: 16, woody: 14, nickel: 14 });
    const pillow = arena('Pillow', 40, `D.pct = 30; fireSpecial(A, {}); for (var i=0;i<20;i++){ step(); D.x = 440; } return +(D.pct - 30).toFixed(1);`);
    expect(pillow).toBeGreaterThanOrEqual(16);
  });

  it("a drop smash does not hold Blocky's drop special back", () => {
    const r = arena('Blocky', 120, `
      doSmash(A); var afterSmash = projectiles.length;
      A.spCd = 0; fireSpecial(A, {});
      return projectiles.length - afterSmash;`);
    expect(r, 'the special still drops its anvil').toBeGreaterThan(0);
  });
});
