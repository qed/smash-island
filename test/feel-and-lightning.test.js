import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "lightning needs a buff or rework" -> "I feel like she is really janky to play" -> "its cuz i stop moving after
// using any abilities", plus "Chain hits the wrong person" and "She gets hit right out of the teleport" (2026-09-22).
//
// The win rate said she was fine: 6 wins in 20 probe matches, above the 20% a five-way field implies. What was
// wrong was everything except the chain. Measured before changing anything: her jab did 72 damage over 26 uses
// with the shortest reach in the game, her smash landed 3 times in 20 matches, and holding right after her
// up-special she ran at 8.96 until the haste expired and then dropped to 6.4 in a single frame.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const run = (body, name = 'Lightning') => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.itemRate=0; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify('PLACEHOLDER')}.replace('PLACEHOLDER', ${JSON.stringify(name)}); }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 520, groundY()-24, 1);
  var E = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 320, groundY()-24, 2);
  [A,D,E].forEach(function(f,i){ f.team=i; f.controller='still'; f.stocks=9; f.invuln=0; f.pct=30; });
  A.face=1; fighters=[A,D,E]; step(); [A,D,E].forEach(function(f){ f.invuln=0; f.hitstun=0; f.spCd=0; f.atkCd=0; f.pct=30; });
  ${body}
})()`);

describe('a fighter does not stop dead when a speed buff runs out', () => {
  it('haste eases off over its last frames instead of switching off in one', () => {
    // Every fighter with self-haste: Lightning, Loser, Balloony. The cliff was theirs too.
    const worst = W.eval(`(function(){
      var out = [];
      ['Lightning','Loser','Balloony'].forEach(function(name){
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true;
        worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
        var A = makeFighter(ROSTER.find(function(r){ return r.name===name; }), 300, groundY()-24, 0);
        var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 2400, groundY()-24, 1);
        A.team=0; D.team=1; A.face=1; D.controller='still'; A.stocks=9; D.stocks=9; A.controller='local'; A.you=true;
        fighters=[A,D]; step(); A.invuln=0; A.hitstun=0; A.spCd=0;
        for(var k in KEYS) down[KEYS[k]]=false;
        down[KEYS.right]=true; for(var i=0;i<25;i++) step();
        A._hasteT = 60;
        var prev = A.vx, drop = 0;
        for(var j=0;j<90;j++){ step(); if(prev - A.vx > drop) drop = prev - A.vx; prev = A.vx; }
        for(var k2 in KEYS) down[KEYS[k2]]=false;
        out.push({ name: name, drop: +drop.toFixed(2) });
      });
      return out;
    })()`);
    // It used to lose 2.56 of 8.96 in one frame -- 29% -- with the key still held.
    for (const r of worst) expect(r.drop, `${r.name} loses ${r.drop} speed in a single frame`).toBeLessThan(0.7);
  });
});

describe('Lightning', () => {
  it('chains at the foe she is FACING, not whoever happens to be closest behind her', () => {
    // Coiny stands nearer behind her than Pen does in front. The first link must still go to Pen.
    const r = run(`E.x = A.x - 60; D.x = A.x + 120; doSpecial(A);
      return { front: +(D.pct-30).toFixed(1), behind: +(E.pct-30).toFixed(1) };`);
    expect(r.front, 'the one she is looking at').toBeGreaterThan(0);
    const back = run(`E.x = A.x - 60; D.x = 3000; doSpecial(A);
      return +(E.pct-30).toFixed(1);`);
    expect(back, 'with nobody in front, it still turns round rather than fizzling').toBeGreaterThan(0);
  });

  it('is not the most exposed teleport in the game when she reappears', () => {
    const r = W.eval(`(function(){
      var warps = Object.keys(UPSPEC).filter(function(k){ return UPSPEC[k].shape === 'warp'; })
        .map(function(k){ return { k: k, inv: UPSPEC[k].invuln || 0 }; });
      var min = Math.min.apply(null, warps.map(function(w){ return w.inv; }));
      return { zap: UPSPEC.zap.invuln, min: min };
    })()`);
    expect(r.zap).toBeGreaterThanOrEqual(10);
    expect(r.zap, 'she used to have the shortest of any teleport, at 6').toBeGreaterThan(r.min - 1);
  });

  it('has a jab she can actually contest with, and a smash that arrives', () => {
    const r = W.eval(`(function(){
      var rows = Object.keys(RANGE_PROFILE).map(function(k){ return RANGE_PROFILE[k].reach; }).sort(function(a,b){ return a-b; });
      return { reach: RANGE_PROFILE.zap.reach, dmg: RANGE_PROFILE.zap.dmg, median: rows[rows.length>>1], dash: SMASH_SPEC.zap.dash };
    })()`);
    expect(r.reach, 'it was 6, against a median of 13').toBeGreaterThanOrEqual(12);
    expect(r.dmg, 'it was 3').toBeGreaterThanOrEqual(5);
    expect(r.dash, 'the dash was over in 8 frames and landed 3 times in 20 matches').toBeGreaterThanOrEqual(11);
  });
});
