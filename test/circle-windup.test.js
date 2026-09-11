import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// THE CIRCLES WIND UP.
//
// A ring centred on you came out on the frame it was pressed and hit in every direction at around
// 100px. A jab or a lunge also resolves on its press frame but reaches about 40px, so the ring simply
// out-ranged anything that came close -- "you can just counter all of the close-range smashes and
// attacks." Eight moves did it: Bell's and TV's specials and down-specials, Pillow's shockwave, Gaty's
// reflect push, Barf Bag's outbreak, Ice Cube's shard ring, and every burst smash.
//
// Now a circle telegraphs for CIRCLE_WINDUP frames, and a hit that lands first cancels it. What the
// ring does once it comes out is unchanged; only WHEN it comes out, and whether it can be stopped.

let W, CW;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); CW = W.eval('CIRCLE_WINDUP'); });

/** Stage `who` next to a dummy, run `act`, step `frames`; report the first frame anything landed. */
function run(w, { who, act, frames, gap = 30, ally = false, midway = null }) {
  return w.eval(`
    (function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(who)}; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), ${400 + gap}, groundY()-24, 1);
      A.team=0; D.team=${ally ? 0 : 1}; A.face=1; D.face=-1;
      A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
      fighters=[A,D];
      for (var k in down) delete down[k];
      step();
      A.invuln=0; D.invuln=0; A.pct=0; D.pct=0; A.spCd=0; A.atkCd=0; A.hitstun=0; D.hitstun=0; A.armor=0;
      (function(A, D){ ${act} })(A, D);
      var landedAt=-1;
      for (var i=0;i<${frames};i++){
        ${midway ? `if (i===${midway.at}) (function(A, D){ ${midway.act} })(A, D);` : ''}
        step();
        D.x=${400 + gap}; D.vx=0; D.vy=0; D.invuln=0;
        var landed = D.pct>0 || D.hitstun>0 || D._infected>0
          || projectiles.some(function(p){ return p.owner===A.idx; });
        if (landedAt<0 && landed) landedAt=i+1;
      }
      return { landedAt: landedAt, pending: !!A._windup };
    })()`);
}

const CASES = [
  ['Bell',     'her special',       'doSpecial(A);'],
  ['TV',       'his down-special',  'doDownSpecial(A);'],
  ['Pillow',   'her shockwave',     'doSpecial(A);'],
  ['Gaty',     'her reflect push',  'doSpecial(A);'],
  ['Ice Cube', 'her shard ring',    'doSpecial(A);'],
  ['Barf Bag', 'her outbreak',      'doSpecial(A);'],
  ['Fries',    'his burst smash',   'doSmash(A, 1);'],
];

describe('a circle is a commitment, not an instant answer', () => {
  it.each(CASES)('%s: nothing from %s lands during the wind-up', (who, _what, act) => {
    const r = run(W, { who, act, frames: CW - 1 });
    expect(r.landedAt, 'landed before the wind-up ran out').toBe(-1);
    expect(r.pending, 'and it is still coming').toBe(true);
  });

  it.each(CASES)('%s: %s still lands once the wind-up runs out', (who, _what, act) => {
    const r = run(W, { who, act, frames: CW + 12 });
    expect(r.landedAt).toBeGreaterThanOrEqual(CW);
  });

  it('a hit that lands during the wind-up cancels the circle', () => {
    const r = run(W, { who: 'Bell', act: 'doSpecial(A);', frames: CW + 12,
      midway: { at: 2, act: 'applyHit(A, 5, 3, -2, D);' } });
    expect(r.landedAt, 'the ring should never have come out').toBe(-1);
    expect(r.pending).toBe(false);
  });
});

describe('what the rings do once they land is unchanged, bar one bug', () => {
  it("Bell's ring no longer stuns her own teammate", () => {
    // It skipped nobody by team. applyHit refused the damage, but the stun was set directly
    // afterwards, so her allies were frozen for 20 frames by their own side's special.
    const r = run(W, { who: 'Bell', act: 'doSpecial(A);', frames: CW + 12, ally: true });
    expect(r.landedAt).toBe(-1);
  });

  it("a wind-up does not survive its owner being KO'd", () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Bell'; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 700, groundY()-24, 1);
      A.team=0; D.team=1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
      fighters=[A,D]; step();
      doSpecial(A);
      var had = !!A._windup;
      eliminate(A);
      return { had: had, after: A._windup || null };
    })()`);
    expect(r.had, 'the ring was winding up').toBe(true);
    expect(r.after, 'and dying cleared it').toBe(null);
  });
});
