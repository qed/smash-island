import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// TENNIS BALL'S GADGET RACK.
//
// His special was one bouncing ball and his down-special a brace. Now he carries four gadgets -- ball,
// mine, turret, battery. The down-special steps which one is loaded, the special uses it, and the smash
// fires a much stronger version of the same gadget.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const arena = (act) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name==='Tennis Ball'; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 700, groundY()-24, 1);
  A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; step(); A.invuln=0; D.invuln=0; A.spCd=0; A.atkCd=0;
  var his = function(){ return projectiles.filter(function(p){ return p.owner===A.idx; }); };
  ${act}
})()`);

describe('the rack', () => {
  it('the down-special steps it: ball, mine, turret, battery, and round again', () => {
    const seq = arena(`var s=[gadgetOf(A)]; for (var i=0;i<4;i++){ doDownSpecial(A); s.push(gadgetOf(A)); } return s;`);
    expect(seq).toEqual(['ball', 'mine', 'turret', 'battery', 'ball']);
  });

  it('a swap costs a short cooldown, not a whole special', () => {
    expect(arena(`fireSpecial(A, {down:true}); return A.spCd;`)).toBeLessThanOrEqual(20);
  });
});

describe('the special uses what is loaded', () => {
  it('each gadget comes out as itself', () => {
    const r = arena(`var out={};
      ['ball','mine','turret','battery'].forEach(function(g){
        projectiles=[]; A._gadget=g; A.spCd=0; doSpecial(A);
        var p = his()[0] || {};
        out[g] = { n: his().length, mine: !!p._gadgetMine, turret: !!p.turret, shape: p.shape||null, fx: p.fxTag||null };
      });
      return out;`);
    expect(r.ball.n).toBe(1);
    expect(r.ball.shape, 'his own ball draws as the tennis ball').toBe(null);
    expect(r.mine.mine).toBe(true);
    expect(r.turret.turret).toBe(true);
    expect(r.battery.shape).toBe('gadgetBattery');
    expect(r.battery.fx, 'the battery shocks').toBe('stun');
  });

  it('keeps one mine and one turret out at a time', () => {
    const r = arena(`A._gadget='mine'; doSpecial(A); A.spCd=0; doSpecial(A);
      var mines = his().filter(function(p){ return p._gadgetMine; }).length;
      A._gadget='turret'; A.spCd=0; doSpecial(A); A.spCd=0; doSpecial(A);
      return { mines: mines, turrets: his().filter(function(p){ return p.turret; }).length };`);
    expect(r).toEqual({ mines: 1, turrets: 1 });
  });

  it('the turret keeps shooting after he walks away', () => {
    const shot = arena(`A._gadget='turret'; doSpecial(A); A.x = 120;
      for (var i=0;i<100;i++) step();
      return D.pct;`);
    expect(shot, 'the turret hit someone 280px away').toBeGreaterThan(0);
  });

  it('the turret itself is never a hit', () => {
    // its three shots are spent by about frame 80 and it clears itself away, so hold this one's fire
    const r = arena(`A._gadget='turret'; doSpecial(A);
      var T = his().filter(function(p){ return p.turret; })[0];
      T.turret.cd = 999; D.x = T.x; D.y = groundY()-24; D.invuln = 0; D.pct = 0;
      for (var j=0;j<10;j++) step();
      return { alive: projectiles.indexOf(T) >= 0, invuln: D.invuln, pct: D.pct };`);
    expect(r.alive, 'the turret should still be standing').toBe(true);
    expect(r.invuln, 'standing on it gave hit-grace, so it counted as a hit').toBe(0);
    expect(r.pct).toBe(0);
  });
});

describe('the smash', () => {
  it('fires a much stronger version of the same gadget', () => {
    const r = arena(`var out={};
      ['ball','mine','battery'].forEach(function(g){
        projectiles=[]; A._gadget=g; A.spCd=0; doSpecial(A); var weak = his()[0].dmg;
        projectiles=[]; A.atkCd=0; doSmash(A, 1); var strong = his()[0];
        out[g] = { weak: weak, strong: strong ? strong.dmg : 0 };
      });
      projectiles=[]; A._gadget='turret'; A.spCd=0; doSpecial(A); var wt = his()[0].turret;
      projectiles=[]; A.atkCd=0; doSmash(A, 1); var st = (his()[0] || {}).turret || {shots:0, dmg:0};
      out.turret = { weak: wt.shots*wt.dmg, strong: st.shots*st.dmg };
      return out;`);
    for (const g of ['ball', 'mine', 'battery', 'turret'])
      expect(r[g].strong, `${g}: smash against special`).toBeGreaterThanOrEqual(r[g].weak * 2);
  });

  it('the menu says what the rack and the smash do', () => {
    const r = arena(`return { blurb: smashBlurb(A), desc: A.kit.desc };`);
    expect(r.blurb).toMatch(/gadget/i);
    expect(r.desc).toMatch(/Gadget Rack/);
  });

  it('draws what he has loaded', () => {
    const bad = arena(`var bad=[];
      ['ball','mine','turret','battery'].forEach(function(g){ A._gadget=g;
        try { drawGadgetBadge(A); } catch(e){ bad.push(g+': '+e.message); } });
      return bad;`);
    expect(bad).toEqual([]);
  });
});

describe('the CPU', () => {
  it('knows which gadget suits which range', () => {
    expect(W.eval(`[gadgetFor(400), gadgetFor(200), gadgetFor(100), gadgetFor(40)]`))
      .toEqual(['turret', 'ball', 'battery', 'mine']);
  });

  it('actually works the rack in a fight', () => {
    const loaded = arena(`A.controller='ai'; A.you=false; var seen={};
      for (var i=0;i<240;i++){ step(); seen[gadgetOf(A)] = true; }
      return Object.keys(seen);`);
    expect(loaded.length, 'it never changed gadget').toBeGreaterThan(1);
  });
});
