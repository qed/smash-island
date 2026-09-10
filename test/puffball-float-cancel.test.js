import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// DOWN drops the float.
//
// Puffball's hover ran for its full duration once started — she could climb with up, but there was
// no way out of it early. Holding down now ends it outright, so committing to a float is not
// committing to all 70-90 frames of it.
//
// Only a human can cancel: the AI sets inp.down to route its own down-special, and cancelling her
// float on that would be a side effect of an unrelated decision.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

function float(w, { human, holdDown, frames = 3 }) {
  return w.eval(`
    (function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Puffball'; }), 400, groundY()-200, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 700, groundY()-24, 1);
      A.team=0; D.team=1; D.controller='still'; A.stocks=9; D.stocks=9;
      A.controller=${human ? "'local'" : "'ai'"}; A.you=${!!human};
      fighters=[A,D];
      for (var k in down) delete down[k];
      A.flying=70; A.onground=false;
      down[KEYS.down] = ${!!holdDown};
      for (var i=0; i<${frames}; i++) step();
      return { flying: A.flying };
    })()`);
}

describe('Puffball can cancel her float', () => {
  it('ends the float when the player holds down', () => {
    expect(float(W, { human: true, holdDown: true }).flying).toBe(0);
  });

  it('keeps floating when down is not held', () => {
    expect(float(W, { human: true, holdDown: false }).flying).toBeGreaterThan(0);
  });

  it('does not cancel an AI float, whose down means a down-special', () => {
    expect(float(W, { human: false, holdDown: true }).flying).toBeGreaterThan(0);
  });
});
