import { describe, it, expect } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// Needle's counter, per the owner: it should only MINIMISE damage — no 1.4x hit back — and her
// special's cooldown is nerfed (48 -> 96 frames). Everyone else's counter stance is unchanged.

const stance = (w, name) => w.eval(`
  (function(){
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
    worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
    var N = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
    var A = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 440, groundY()-24, 1);
    N.team=0; A.team=1; N.controller='still'; A.controller='still'; N.stocks=9; A.stocks=9;
    fighters=[N,A]; step(); N.invuln=0; A.invuln=0; N.pct=0; A.pct=0; N.spCd=0;
    doSpecial(N); var cd=N.spCd;
    applyHit(N, 20, 8, -6, A);
    return { took:+N.pct.toFixed(2), attackerTook:+A.pct.toFixed(2), vx:+N.vx.toFixed(2), cd:cd, stance:N.countering };
  })()`);

describe('The Reflex', () => {
  it('Needle takes a quarter of the hit and the attacker takes nothing', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const r = stance(w, 'Needle');
    expect(r.took).toBeCloseTo(5, 0);
    expect(r.attackerTook).toBe(0);
    expect(Math.abs(r.vx), 'the launch is minimised too').toBeLessThan(3);
    expect(r.stance, 'the stance is spent by the hit').toBe(0);
  });
  it('both of her stances cost her double the roster-standard special cooldown', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    // Her stances were pinned at 96 when only she was nerfed. The roster-wide cd.special pass
    // (x1.15, the measured arm) then carried every cooldown in the game up with it, hers included,
    // so the literal moved to 110. Asserting the RATIO instead of the number keeps this test
    // meaningful the next time a roster-wide cooldown pass lands.
    const base = w.eval('(function(){ var f=makeFighter(ROSTER.find(function(r){return r.name==="Coiny";}),400,groundY()-24,0); fighters=[f]; f.spCd=0; doSpecial(f); return f.spCd; })()');
    const neutral = stance(w, 'Needle').cd;
    const down = w.eval('(function(){ var f=makeFighter(ROSTER.find(function(r){return r.name==="Needle";}),400,groundY()-24,0); fighters=[f]; f.spCd=0; doDownSpecial(f); return f.spCd; })()');
    expect(neutral, 'neutral special').toBe(110);
    expect(down, 'down special').toBe(110);
    expect(neutral / base, 'still double a plain special').toBeGreaterThanOrEqual(1.9);
  });
  it('Teardrop still counters the old way — nullify and hit back', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const r = w.eval(`
      (function(){
        var T = makeFighter(ROSTER.find(function(r){ return r.name==='Teardrop'; }), 400, groundY()-24, 0);
        var A = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 440, groundY()-24, 1);
        T.team=0; A.team=1; fighters=[T,A]; T.invuln=0; A.invuln=0; T.pct=0; A.pct=0;
        T.countering=24; applyHit(T, 20, 8, -6, A);
        return { took:T.pct, attackerTook:A.pct };
      })()`);
    expect(r.took).toBe(0);
    expect(r.attackerTook).toBeGreaterThanOrEqual(12);
  });
});
