import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "remove all text for smashes and specials." -- "remove item popups." (2026-09-24)
// Every banner a move or an item put up is gone. What stays is the rest of the game talking to you: GO!, a KO, a boss's
// telegraph, the tutorial, the World Cup and the passives. FROZEN!, STUCK! and SCRAMBLED! went too: specials and smashes
// are what freeze, root and scramble, and those went up for every fighter on the stage, AI included.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const MOVES = { special: 'fireSpecial(A, {})', up: 'fireSpecial(A, {up:true})', down: 'fireSpecial(A, {down:true})',
  smash: 'doSmash(A, 1.0)', finisher: 'doAttackSpecial(A)' };

describe('no text for smashes and specials', () => {
  it('no fighter puts a word on the screen with any special, smash or X+C, nor in the second after', () => {
    const shown = W.eval(`(function(){
      var names = ROSTER.filter(function(r){ return r.play; }).map(function(r){ return r.name; });
      var moves = ${JSON.stringify(MOVES)}, out = [];
      names.forEach(function(name){
        Object.keys(moves).forEach(function(move){
          SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
          worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
          var A = makeFighter(ROSTER.find(function(r){ return r.name===name; }), 400, groundY()-24, 0);
          var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 460, groundY()-24, 1);
          A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
          fighters=[A,D]; step();
          [A,D].forEach(function(f){ f.invuln=0; f.pct=30; f.hitstun=0; f.spCd=0; f.atkCd=0; f.armor=0; });
          A.you = true; A._fury = 99; A._evilM = 99;            // one hit from the "press C" prompts that used to show
          window.__lastBanner = null;
          try { eval(moves[move]); } catch(e){ out.push(name+' '+move+': threw '+e.message); return; }
          for (var i=0;i<60;i++){ step(); D.invuln = 0; D.dead = false; A.dead = false; if (i===10) applyHit(A, 5, 0, 0, D); }
          if (window.__lastBanner && window.__lastBanner.text) out.push(name+' '+move+': "'+window.__lastBanner.text+'"');
        });
      });
      return out;
    })()`);
    expect(shown).toEqual([]);
  }, 240000);

  it('picking up an item says nothing either', () => {
    const shown = W.eval(`(function(){
      var out = [];
      ['heal','marmalade','throw','power','power','power','yoyle','assist'].forEach(function(kind){
        SETTINGS.mode='ffa'; SETTINGS.count=2; running=true;
        worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
        var A = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 400, groundY()-24, 0);
        var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 700, groundY()-24, 1);
        A.team=0; D.team=1; A.you=true; A.controller='still'; D.controller='still'; fighters=[A,D]; step();
        window.__lastBanner = null;
        pickUpItem(A, { kind: kind, x: A.x, y: A.y });
        for (var i=0;i<60;i++) step();
        if (window.__lastBanner && window.__lastBanner.text) out.push(kind+': "'+window.__lastBanner.text+'"');
      });
      return out;
    })()`);
    expect(shown).toEqual([]);
  });

  it('the rest of the game still talks: GO!, a KO, a boss telegraph', () => {
    expect(W.eval(`String(beginMatchNow)`)).toMatch(/banner\("GO!"/);
    expect(W.eval(`String(eliminate)`)).toMatch(/You're out!/);
    expect(W.eval(`String(updateBossAttack)`)).toMatch(/banner\(/);
  });
});
