import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// O14: Ice Cube's ring was the heaviest AI projectile source in the game -- eight shards a cast, a cast
// on every cooldown: 69% of every projectile in a 4-way FFA and thirty rings a minute (probe, six
// seeded matches). AI_SPECIAL_HOLD adds frames the AI -- only the AI, through aiSpecialGap, which
// finishAI alone reads -- waits after that kit's cooldown before it spends the special again.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// A seeded 4-way FFA with Ice Cube in slot 0, everyone AI, 2400 frames; rings counted at addProj.
const match = (seed, hold) => `(function(){
  Math.random = (function(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; })(${seed});
  SETTINGS.mode='ffa'; SETTINGS.count=4; SETTINGS.stocks=3; SETTINGS.itemRate=0; running=true;
  beginMatchNow();
  var ice = ROSTER.find(function(r){ return r.name==='Ice Cube'; });
  if(!fighters.some(function(f){ return f.name==='Ice Cube'; })){ var old=fighters[0]; var f0=makeFighter(ice, old.x, old.y, old.idx); f0.team=old.team; fighters[0]=f0; }
  fighters.forEach(function(f){ f.controller='ai'; f.you=false; });
  var saved = AI_SPECIAL_HOLD.shatter; AI_SPECIAL_HOLD.shatter = ${hold};
  var shards = 0, orig = addProj;
  addProj = function(p){ if(p.freeze && p.ownerObj && p.ownerObj.name==='Ice Cube') shards++; return orig(p); };
  for (var i=0;i<2400 && running;i++) step();
  addProj = orig; AI_SPECIAL_HOLD.shatter = saved; running = false;
  return shards/8;
})()`;

describe("the AI's hold on Ice Cube's ring", () => {
  it('is declared, and only the AI pays it', () => {
    const r = W.eval(`(function(){
      var ice = makeFighter(ROSTER.find(function(r){ return r.name==='Ice Cube'; }), 100, 100, 3);
      var oth = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 100, 100, 3);
      return { hold: AI_SPECIAL_HOLD.shatter, ice: aiSpecialGap(ice), oth: aiSpecialGap(oth), keys: Object.keys(AI_SPECIAL_HOLD) };
    })()`);
    expect(r.hold).toBeGreaterThanOrEqual(90);
    expect(r.ice - r.oth, 'the gap is the hold, and nothing else moved').toBe(r.hold);
    expect(r.keys).toEqual(['shatter']);
  });

  it('cuts her rings in a real match to well under what she threw without it', () => {
    const seeds = [11, 22];
    let withHold = 0, without = 0;
    for (const s of seeds) { without += W.eval(match(s, 0)); withHold += W.eval(match(s, W.eval('AI_SPECIAL_HOLD.shatter'))); }
    expect(without, 'the control has to throw rings for the comparison to mean anything').toBeGreaterThan(10);
    expect(withHold, `${withHold} rings with the hold vs ${without} without`).toBeLessThan(without * 0.7);
  });
});
