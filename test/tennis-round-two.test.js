import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// TENNIS BALL, ROUND TWO.
//
// "buff TB's turret- it should have a health bar. buff the battery, it should be a trap/projectile hybrid,
// which can turn into an acid puddle if not hitting. reduce delay between smashes. buff all of tbs kit- area
// as well." The turret can be broken now, and shows how close it is. A battery that hits shocks and is spent;
// one that misses splits where it lands and leaves acid. His smash and his gadgets come back sooner, and every
// gadget covers more ground. Round one's rack is tested in tennis-gadgets.test.js.

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
  var turret = function(){ return projectiles.filter(function(p){ return p.turret; })[0]; };
  ${act}
})()`);

describe('the turret can be broken, and shows it', () => {
  it('comes out at full health, and a real turret draws a bar that the badge does not', () => {
    const r = arena(`A._gadget='turret'; doSpecial(A); var T = turret();
      var rects = function(pr){ var n=0, c=new Proxy({}, { get:function(_t,p){
          if(p==='canvas') return {width:1100,height:720};
          if(p==='measureText') return function(){ return {width:0}; };
          return function(){ if(p==='fillRect') n++; }; }, set:function(){ return true; } });
        turretShape(c, 12, pr); return n; };
      return { hp: T.hp, hpMax: T.hpMax, withBar: rects(T), badge: rects({ turret:{ aim:0 } }) };`);
    expect(r.hp).toBeGreaterThan(0);
    expect(r.hp).toBe(r.hpMax);
    expect(r.withBar, 'the bar and its backing are drawn on a real turret').toBeGreaterThan(r.badge);
  });

  it("an enemy's swing chips it, one hitbox cannot melt it in a frame, and enough hits break it", () => {
    const r = arena(`A._gadget='turret'; doSpecial(A); var T = turret(), hp0 = T.hp;
      T.turret.cd = 999;
      hitCircle(D, T.x, T.y, 20, 10, 10, 1, -1); var once = T.hp;
      hitCircle(D, T.x, T.y, 20, 10, 10, 1, -1); var again = T.hp;       // inside the turret's hit cooldown
      for (var i=0; i<20 && projectiles.indexOf(T)>=0; i++){
        for (var j=0;j<TURRET_HIT_CD;j++) step();
        hitCircle(D, T.x, T.y, 20, 10, 10, 1, -1); step();
      }
      return { hp0: hp0, once: once, again: again, gone: projectiles.indexOf(T) < 0 };`);
    expect(r.once).toBe(r.hp0 - 10);
    expect(r.again, 'a second hit inside the cooldown does nothing').toBe(r.once);
    expect(r.gone, 'enough hits break it').toBe(true);
  });

  it('an enemy shot breaks on it instead of flying on into Tennis Ball', () => {
    const r = arena(`A._gadget='turret'; doSpecial(A); var T = turret(), hp0 = T.hp;
      T.turret.cd = 999;   // hold its fire so only the incoming shot is in play
      var shot = {owner:D.idx, ownerObj:D, x:T.x+60, y:T.y, vx:-8, vy:0, grav:false, dmg:9, kb:3, r:6, color:'#ff0000', life:40};
      projectiles.push(shot);
      for (var i=0;i<14;i++) step();
      return { hp0: hp0, hp: T.hp, spent: shot.life <= 0, tb: A.pct };`);
    expect(r.hp).toBe(r.hp0 - 9);
    expect(r.spent).toBe(true);
    expect(r.tb).toBe(0);
  });

  it("its own side's shots pass it by", () => {
    const r = arena(`A._gadget='turret'; doSpecial(A); var T = turret(), hp0 = T.hp;
      T.turret.cd = 999;
      projectiles.push({owner:A.idx, ownerObj:A, x:T.x-30, y:T.y, vx:8, vy:0, grav:false, dmg:9, kb:3, r:6, color:'#c9f24b', life:40});
      for (var i=0;i<10;i++) step();
      return { hp0: hp0, hp: T.hp };`);
    expect(r.hp).toBe(r.hp0);
  });
});

describe('the battery: a shot if it hits, acid if it misses', () => {
  it('a battery that misses splits where it lands and leaves acid that hurts and slows', () => {
    const r = arena(`D.x = 150; A._gadget='battery'; doSpecial(A);
      var acid = null;
      for (var i=0; i<120 && !acid; i++){ step(); acid = projectiles.filter(function(p){ return p.shape==='gadgetAcid'; })[0] || null; }
      if (!acid) return { acid: false };
      D.x = acid.x; D.y = groundY()-24; D.vx = 0; D.vy = 0; D.invuln = 0; D.pct = 0; D.slowed = 0;
      var hurt = 0, slowed = 0;
      for (var j=0; j<30; j++){ step(); hurt = Math.max(hurt, D.pct); slowed = Math.max(slowed, D.slowed||0); }
      return { acid: true, trap: acid.trap, hurt: hurt, slowed: slowed };`);
    expect(r.acid, 'no acid puddle appeared').toBe(true);
    expect(r.trap).toBe(true);
    expect(r.hurt, 'standing in it hurts').toBeGreaterThan(0);
    expect(r.slowed, 'and slows').toBeGreaterThan(0);
  });

  it('a battery that hits shocks its target and is spent -- no puddle', () => {
    const r = arena(`D.x = 445; A._gadget='battery'; doSpecial(A);
      for (var i=0; i<90; i++) step();
      return { pct: D.pct, acid: projectiles.some(function(p){ return p.shape==='gadgetAcid'; }) };`);
    expect(r.pct).toBeGreaterThan(0);
    expect(r.acid).toBe(false);
  });

  it('its acid never touches his own side', () => {
    const r = arena(`D.x = 150; A._gadget='battery'; doSpecial(A);
      var acid = null;
      for (var i=0; i<120 && !acid; i++){ step(); acid = projectiles.filter(function(p){ return p.shape==='gadgetAcid'; })[0] || null; }
      A.x = acid.x; A.y = groundY()-24; A.vx = 0; A.vy = 0; A.invuln = 0; A.pct = 0;
      for (var j=0; j<30; j++) step();
      return A.pct;`);
    expect(r).toBe(0);
  });
});

describe('the waits', () => {
  it('his smash comes back sooner than the 66 frames it used to cost', () => {
    expect(W.eval('LEGACY_SMASH_COST.serve.cd')).toBeLessThanOrEqual(40);
  });

  it('every gadget special is quicker than round one', () => {
    const cd = W.eval('GADGET_SPECIAL_CD');
    expect(cd.ball).toBeLessThan(51);
    expect(cd.mine).toBeLessThan(70);
    expect(cd.turret).toBeLessThan(110);
    expect(cd.battery).toBeLessThan(60);
  });

  it("and the 55-frame floor on neutral specials no longer overrides the ball's shorter one", () => {
    // the ball's own 40, through the door every special leaves by (SPECIAL_CD_SCALE, "reduce the time between specials")
    expect(arena(`A._gadget='ball'; fireSpecial(A, {}); return A.spCd;`)).toBe(W.eval('Math.round(GADGET_SPECIAL_CD.ball * SPECIAL_CD_SCALE)'));
  });
});

describe('more area', () => {
  it('every gadget covers more ground than round one did', () => {
    const r = arena(`var out = {};
      ['ball','mine','battery'].forEach(function(g){ projectiles=[]; A._gadget=g; A.spCd=0; doSpecial(A); out[g] = his()[0].r; });
      projectiles=[]; A._gadget='turret'; A.spCd=0; doSpecial(A); out.range = turret().turret.range;
      return out;`);
    expect(r.ball).toBeGreaterThan(8);
    expect(r.mine).toBeGreaterThan(12);
    expect(r.battery).toBeGreaterThan(8);
    expect(r.range).toBeGreaterThan(520);
  });
});
