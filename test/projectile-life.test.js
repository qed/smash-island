import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { bootMonolith } from './helpers/smash-golden.js';

// "buff all projectile survival time"
//
// Every shot, trap and puddle lives PROJ_LIFE times longer than the number its kit declares. The
// multiplier is applied in one place -- addProj(), the single door into the projectiles array -- rather
// than across the hundred-odd `life:` literals the kits carry, so a shot written tomorrow gets it too.
// The last test here is the one that keeps that true: no raw projectiles.push survives in the game.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

describe('projectiles live longer', () => {
  it('the multiplier is a buff, and addProj applies it', () => {
    const r = W.eval(`(function(){
      var before = projectiles.length;
      var p = addProj({ owner:-1, x:0, y:0, vx:0, vy:0, dmg:1, kb:1, r:4, color:'#fff', life:100 });
      var added = projectiles.length - before;
      projectiles.length = before;
      return { mult: PROJ_LIFE, life: p.life, added: added };
    })()`);
    expect(r.mult).toBeGreaterThan(1);
    expect(r.life).toBe(Math.round(100 * r.mult));
    expect(r.added, 'it still adds exactly one projectile').toBe(1);
  });

  it('a real shot carries the buff: Money\'s coins outlive their declared 100 frames', () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Money'; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 900, groundY()-24, 1);
      A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; fighters=[A,D]; step();
      A.atkCd=0; projectiles=[];
      doSmash(A, 1);
      return { life: projectiles[0] ? projectiles[0].life : 0, mult: PROJ_LIFE };
    })()`);
    expect(r.life).toBe(Math.round(100 * r.mult));
  });

  it('traps and puddles are projectiles too, so they linger as well', () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Rocky'; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 900, groundY()-24, 1);
      A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; fighters=[A,D]; step();
      A.spCd=0; projectiles=[];
      doDownSpecial(A);
      var t = projectiles.filter(function(p){ return p.trap; })[0];
      return { life: t ? t.life : 0, mult: PROJ_LIFE };
    })()`);
    expect(r.life, 'Rocky lays a poison puddle on his down-special').toBe(Math.round(240 * r.mult));
  });

  it('nothing bypasses addProj: the game has no raw projectiles.push left', () => {
    const src = readFileSync('artifacts/V1/index.html', 'utf8');
    const raw = src.match(/projectiles\.push\(/g) || [];
    expect(raw.length, 'only addProj itself may push into the array').toBe(1);
  });
});
