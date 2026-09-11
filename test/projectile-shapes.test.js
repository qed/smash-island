import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// EVERY SHOT HAS A SHAPE.
//
// Twenty-four kits fired something and drew it as the bare fallback circle, so Money's coins, Pencil's
// van and Tree's log were visually the same event. This checks it the way a player would find out:
// fire every fighter's whole kit and look at what actually comes out, rather than trusting a list.
// It fires all SIX move types on purpose. A source scan found seventeen; firing the special, smash and
// the two directional specials found an eighteenth (Bubble's up-special); only firing the finisher and
// the ground move as well found five more, whose ground move throws a poke in their kit's shape.
// Snowball's was the twenty-fourth, and this test is what caught it.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

describe('every projectile in the game is drawn as something', () => {
  it('no fighter throws a shot that falls back to the plain circle', () => {
    const bare = W.eval(`(function(){
      var out=[];
      ROSTER.filter(function(r){ return r.play; }).forEach(function(r){
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
        worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
        var A=makeFighter(r,400,groundY()-24,0), D=makeFighter(ROSTER.find(function(x){return x.name==='Leafy';}),700,groundY()-24,1);
        A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
        fighters=[A,D]; step();
        var moves=[function(){doSpecial(A);},function(){doSmash(A,1);},function(){doDownSpecial(A);},function(){doUpSpecial(A);},
                   function(){doAttackSpecial(A);},function(){doGroundMove(A);}];
        var seen=false;
        moves.forEach(function(m){ A.spCd=0; A.atkCd=0; A._windup=null; try{ m(); }catch(e){}
          for(var i=0;i<30;i++){ step(); if(projectiles.some(function(p){return p.owner===A.idx;})) seen=true; } });
        if(seen && !PROJ_SHAPE[r.kit.special]) out.push(r.name+' ('+r.kit.special+')');
      });
      return out;
    })()`);
    expect(bare, 'fighters whose shots still draw as the fallback circle').toEqual([]);
  });

  it('every shape draws without throwing, and actually draws something', () => {
    const broken = W.eval(`(function(){
      var bad=[];
      Object.keys(PROJ_SHAPE).forEach(function(k){
        var n=0, c=new Proxy({}, { get:function(_t,p){
          if(p==='canvas') return {width:1100,height:720};
          if(p==='measureText') return function(){ return {width:0}; };
          return function(){ if(p==='fill'||p==='stroke'||p==='fillRect'||p==='fillText') n++; };
        }, set:function(){ return true; } });
        try { PROJ_SHAPE[k].draw(c, 8, {x:120, y:80, vx:-4, vy:1, color:'#ffd23f', r:8}); }
        catch(e){ bad.push(k+': '+e.message); return; }
        if(n===0) bad.push(k+': drew nothing');
      });
      return bad;
    })()`);
    expect(broken).toEqual([]);
  });
});
