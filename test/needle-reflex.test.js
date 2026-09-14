import { describe, it, expect } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// Needle, in two owner's calls. First: the Reflex should only MINIMISE a hit -- the free 1.4x hit
// back made holding it the answer to everything -- on double the usual cooldown. Then "buff needle",
// after six tournament runs at 0-for-8 (everything she had was a stance and none of it hurt): the
// Reflex still takes the edge off, but that edge goes INTO the attacker as a prick (REFLEX_PRICK of
// the hit, no launch); the Riposte Stance -- her SMASH, sixty committed frames priced at cd 56 -- is
// where the full amplified hit back lives now; her jab reaches like a needle; and the Reflex's
// cooldown comes down to 90 with its payoff that small. Everyone else's counter stance is unchanged.

const stance = (w, name) => w.eval(`
  (function(){
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
    worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
    var N = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
    var A = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 440, groundY()-24, 1);
    N.team=0; A.team=1; N.controller='still'; A.controller='still'; N.stocks=9; A.stocks=9;
    fighters=[N,A]; step(); N.invuln=0; A.invuln=0; N.pct=0; A.pct=0; N.spCd=0;
    doSpecial(N); var cd=N.spCd, riposte=!!N._riposte;
    applyHit(N, 20, 8, -6, A);
    return { took:+N.pct.toFixed(2), attackerTook:+A.pct.toFixed(2), vx:+N.vx.toFixed(2), avx:+A.vx.toFixed(2), cd:cd, stance:N.countering, riposte:riposte };
  })()`);

describe('The Reflex (special)', () => {
  it('Needle takes a quarter of the hit, and the attacker takes a prick', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const r = stance(w, 'Needle');
    expect(r.took).toBeCloseTo(5, 0);
    expect(r.attackerTook, 'REFLEX_PRICK of the hit came back').toBeGreaterThanOrEqual(12 * 0.9);
    expect(r.attackerTook, 'a prick, not the old riposte').toBeLessThan(20);
    expect(Math.abs(r.vx), 'the launch is minimised too').toBeLessThan(3);
    expect(r.stance, 'the stance is spent by the hit').toBe(0);
    expect(r.riposte, 'the special is not the riposte').toBe(false);
  });

  it('both of her stances still cost more than a plain special, at 90', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const base = w.eval('(function(){ var f=makeFighter(ROSTER.find(function(r){return r.name==="Coiny";}),400,groundY()-24,0); fighters=[f]; f.spCd=0; doSpecial(f); return f.spCd; })()');
    const neutral = stance(w, 'Needle').cd;
    const down = w.eval('(function(){ var f=makeFighter(ROSTER.find(function(r){return r.name==="Needle";}),400,groundY()-24,0); fighters=[f]; f.spCd=0; doDownSpecial(f); return f.spCd; })()');
    expect(neutral, 'neutral special').toBe(90);
    expect(down, 'down special').toBe(90);
    expect(neutral / base, 'still well above a plain special').toBeGreaterThanOrEqual(1.5);
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

const arena = `
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var N = makeFighter(ROSTER.find(function(r){ return r.name==='Needle'; }), 300, groundY()-24, 0);
  var E = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 340, groundY()-24, 1);
  N.team=0; E.team=1; N.face=1; E.face=-1;
  [N,E].forEach(function(f){ f.controller='still'; f.invuln=0; f.spCd=0; f.atkCd=0; f.stocks=9; });
  fighters=[N,E]; step(); N.invuln=0; E.invuln=0; N.pct=0; E.pct=0;
  var pin=function(){ N.x=300; N.vx=0; E.x=340; E.vx=0; };
  var jab=function(){ E.atkCd=0; E.hitstun=0; E.invuln=0; doAttack(E); for (var i=0;i<14;i++){ pin(); step(); } };`;

describe('the Riposte Stance (smash)', () => {
  it('returns the whole hit, amplified, and takes none of it', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const r = w.eval(`(function(){ ${arena}
      jab(); var plain = N.pct;
      N.pct = 0; E.pct = 0; N.atkCd = 0; N.hitstun = 0; doSmash(N); var armed = !!N._riposte, stance = N.countering;
      jab();
      return { plain: plain, taken: N.pct, returned: E.pct, armed: armed, stance: stance, after: !!N._riposte };
    })()`);
    expect(r.plain, 'the control jab has to land for the comparison to mean anything').toBeGreaterThan(0);
    expect(r.armed).toBe(true);
    expect(r.stance).toBeGreaterThanOrEqual(60);
    expect(r.taken, 'stopped dead').toBe(0);
    expect(r.returned, 'the hit came back with interest').toBeGreaterThanOrEqual(Math.max(12, r.plain * 1.2));
    expect(r.after, 'one riposte per stance').toBe(false);
  });

  it('a stance that expires takes its riposte with it', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const r = w.eval(`(function(){ ${arena}
      N.atkCd = 0; doSmash(N); var armed = !!N._riposte;
      for (var i=0;i<80;i++){ pin(); step(); }
      return { armed: armed, countering: N.countering, riposte: !!N._riposte };
    })()`);
    expect(r.armed).toBe(true);
    expect(r.countering).toBe(0);
    expect(r.riposte).toBe(false);
  });
});

describe("Needle's jab", () => {
  it('reaches like a needle and pricks three times for six', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const r = w.eval('({ reach: RANGE_PROFILE.counter.reach, dmg: RANGE_PROFILE.counter.dmg, hits: RANGE_PROFILE.counter.multi.hits })');
    expect(r.reach).toBeGreaterThanOrEqual(12);
    expect(r.dmg * r.hits).toBeGreaterThanOrEqual(6);
  });
});
