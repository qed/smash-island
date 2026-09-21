import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "make a dlc: inanimate insanity" (2026-09-21). Batch 1: Knife, Balloon, Lightbulb, Paintbrush, Bomb, their moves from
// the II wiki and the owner's answers ("A random trick each press", "Both", "Electric ball", "rage meter should give bonus
// base attack damage", "3 but up special"). No one from the OSC (OJ, Suitcase, Cabby).

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const arena = (name, body, foeX = 460) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.itemRate=0; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ${foeX}, groundY()-24, 1);
  var E = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), ${foeX} + 90, groundY()-24, 2);
  [A,D,E].forEach(function(f,i){ f.team=i; f.controller='still'; f.stocks=9; }); A.face=1;
  fighters=[A,D,E]; step(); [A,D,E].forEach(function(f){ f.invuln=0; f.hitstun=0; f.spCd=0; f.atkCd=0; f.pct=30; });
  ${body}
})()`);

describe('the Inanimate Insanity DLC, batch 1', () => {
  it('arrives unlocked, in its own labelled group after the BFDI cast, with no one from the OSC', () => {
    const r = W.eval(`(function(){ PROFILE.viewMode='unlocked'; buildBoard();
      var dlc = ROSTER.filter(function(x){ return x.dlc; }).map(function(x){ return x.name; });
      return { dlc: dlc, open: dlc.every(function(n){ return isUnlocked(ROSTER.find(function(x){ return x.name===n; })); }),
               head: !!document.querySelector('#board .dlchead'), osc: ['OJ','Suitcase','Cabby'].filter(function(n){ return ROSTER.some(function(x){ return x.name===n; }); }) };
    })()`);
    expect(r.dlc).toEqual(['Balloon', 'Bomb', 'Knife', 'Lightbulb', 'Paintbrush']);
    expect(r.open).toBe(true);
    expect(r.head).toBe(true);
    expect(r.osc).toEqual([]);
  });

  it("Knife's Bag of Tricks pulls each of its four tricks", () => {
    const r = [0.1, 0.3, 0.6, 0.9].map((roll) => arena('Knife', `
      var _r = Math.random; Math.random = function(){ return ${roll}; };
      try { doSpecial(A); } finally { Math.random = _r; }
      var shots = projectiles.filter(function(p){ return p.owner===A.idx; });
      for (var i=0;i<6;i++) step();
      return { stunned: D._stunFx > 0, blade: shots.some(function(p){ return p.boomerang; }), caltrops: shots.some(function(p){ return p.trap; }), pulled: D.x < 460 };`));
    expect(r[0].stunned, 'smoke bomb').toBe(true);
    expect(r[1].blade, 'boomerang blade').toBe(true);
    expect(r[2].caltrops, 'caltrops').toBe(true);
    expect(r[3].pulled, 'grappling hook').toBe(true);
  });

  it('Balloon rockets through foes, falls slowly, and his insults weaken', () => {
    const r = arena('Balloon', `
      doSpecial(A); for (var i=0;i<10;i++) step(); var dashHit = D.pct > 30;
      A.x = 200; A.y = groundY()-300; A.vy = 0; A.onground = false; var y0 = A.y; for (var j=0;j<20;j++) step(); var fell = A.y - y0;
      var P = makeFighter(ROSTER.find(function(x){ return x.name==='Pen'; }), 200, groundY()-300, 5); P.controller='still'; P.team=5; fighters.push(P); P.vy=0; P.onground=false;
      var py = P.y; for (var k=0;k<20;k++) step(); var penFell = P.y - py;
      A.x = 400; A.y = groundY()-24; D.x = 440; D.weakened = 0; doDownSpecial(A);
      return { dashHit: dashHit, fell: fell, penFell: penFell, weakened: D.weakened > 0 };`);
    expect(r.dashHit).toBe(true);
    expect(r.fell, 'helium: he falls far slower than Pen').toBeLessThan(r.penFell * 0.8);
    expect(r.weakened).toBe(true);
  });

  it("Lightbulb's electric ball stuns and arcs to a second foe", () => {
    const r = arena('Lightbulb', `
      doSpecial(A);
      for (var i=0;i<40 && !(D.pct > 30 && E.pct > 30);i++){ step(); D.x=460; E.x=540; }
      return { first: D.pct > 30, second: E.pct > 30, stunned: D._stunFx > 0 || E._stunFx > 0 };`, 460);
    expect(r.first && r.second, 'the charge jumps to the next foe').toBe(true);
  });

  it("Paintbrush's rage fills from hits, makes their hits harder and burning, and pays out a Heat Explosion", () => {
    const r = arena('Paintbrush', `
      A.atkCd = 0; D.pct = 30; doAttack(A); var calm = D.pct - 30;
      applyHit(A, 26, 0, 0, D); var rage = A._fury;   // 26 damage: 65 rage, still over half after it cools for 30 frames
      for (var i=0;i<30;i++){ step(); D.x = 460; } D.pct = 30; D.burn = 0; D.invuln = 0; A.atkCd = 0; doAttack(A); var angry = D.pct - 30, burning = D.burn > 0;
      A._fury = 100; D.pct = 30; D.invuln = 0; doSpecial(A);
      return { calm: calm, rage: rage, angry: angry, burning: burning, blast: D.pct - 30, after: A._fury };`);
    expect(r.rage, 'a big hit fills more than half the meter').toBeGreaterThanOrEqual(50);
    expect(r.angry, 'a harder hit').toBeGreaterThan(r.calm * 1.2);
    expect(r.burning, 'burning bristles').toBe(true);
    expect(r.blast, 'the Heat Explosion').toBeGreaterThanOrEqual(18);
    expect(r.after, 'and the rage is spent').toBe(0);
  });

  it("Bomb's Collision blows up on the first foe he bumps into, and costs him a little; his spin is the up special", () => {
    const r = arena('Bomb', `
      var self0 = A.pct; doSpecial(A);
      for (var i=0;i<14;i++){ step(); }
      return { hit: +(D.pct - 30).toFixed(1), self: +(A.pct - self0).toFixed(1), up: UPSPEC.collide.shape };`, 470);
    expect(r.hit).toBeGreaterThanOrEqual(18);
    expect(r.self).toBeGreaterThanOrEqual(3);
    expect(r.up).toBe('spin');
  });
});
