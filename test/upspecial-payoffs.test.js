import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "Change the up-specials to custom ones (movement is only good for pb, and leafy has a great combo).
// They should actually DO stuff. I like teardrop tho."
//
// Every UPSPEC row now declares a payoff beyond the rise. This test does not trust the declaration: it
// casts every row next to a dummy and checks that each payoff the row names actually HAPPENS in the
// engine -- the status its swing puts on the dummy, the buffs it gives the caster, the projectile it
// fires, the ones it drops, the stun or lifesteal it leaves, and for a plunge the landing hit, its crater
// rider and its ram. A row that names a payoff the engine does not deliver fails here by name.
// Leafy's sprint and Puffball's hand-written flight are the owner's two exceptions; Teardrop's taunt has
// its own test (upspecial-effects).

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const KEPT = ['dash', 'kick'];

describe('every up-special DOES something', () => {
  it('each payoff a row declares happens, for every row', () => {
    const r = W.eval(`(function(){
      var KEPT = ${JSON.stringify(KEPT)};
      // what each status leaves on a fighter, so "the swing put eff on the dummy" is observable
      var EFF = { bleed:'bleed', burn:'burn', poison:'_poisonT', root:'rooted', slow:'slowed', ice:'iceUntil', curse:'curseStacks',
                  define:'defineStacks', weaken:'weakened', scramble:'ctrlRev', stun:'_stunFx', knockdown:'_stunFx', freeze:'frozen' };
      var SELF = { armor:'armor', invuln:'invuln', healing:'healing', haste:'_hasteT', empower:'_empower', cloud:'cloud', jumps:'jumps' };
      var owner = {}; ROSTER.forEach(function(x){ if(x.play) owner[x.kit.special] = x; });
      var fails = [], checked = 0, payoffs = 0;
      var arena = function(){
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
        worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      };
      var mk = function(ros, x, y, idx){ var f = makeFighter(ros, x, y, idx); f.controller='still'; f.stocks=9; f.invuln=0; return f; };
      Object.keys(UPSPEC).forEach(function(key){
        if (KEPT.indexOf(key) >= 0) return;
        var row = UPSPEC[key], ros = owner[key];
        if (!ros){ fails.push(key + ': no playable fighter owns this row'); return; }
        checked++;
        var bad = function(msg){ fails.push(ros.name + ' (' + key + '): ' + msg); };
        arena();
        var A = mk(ros, 400, groundY()-24, 0), D = mk(ROSTER.find(function(x){ return x.name==='Pen'; }), 900, groundY()-24, 1);
        A.team=0; D.team=1; A.face=1; D.face=-1; fighters=[A,D]; step();
        A.invuln=0; D.invuln=0; A.spCd=0; A.atkCd=0; A.onground=true; A.jumps=0;
        A.pct = 20; D.pct = 30; D.reflecting = 30;       // room to heal the caster; freeze gates on 15%; strip must have a stance to remove
        // (the reflect stance, not armor: a hit spends armor on its own, so armor gone would prove nothing about strip)
        A.armor=0; A.healing=0; A._hasteT=0; A._empower=0; A.cloud=0;
        var y0 = A.y;
        if (row.shape !== 'plunge' && (row.hit || row.leave === 'stun')){
          // stand the dummy where the swing (or the stun) lands: at the cast point, after a warp's move
          var lift = row.shape === 'warp' ? (row.dist || 140) : 0, h = row.hit || {};
          D.x = A.x + A.face*(h.fx||0); D.y = A.y - lift + (h.off == null ? -14 : h.off); D.vx = 0; D.vy = 0;
        }
        if (row.shape === 'plunge'){ D.x = A.x; D.y = A.y; }
        var p0 = projectiles.length, dPct0 = D.pct;
        doUpSpecial(A);
        var afterCast = { aPct: A.pct, dPct: D.pct, proj: projectiles.slice(p0) };
        // ---- self: every buff it names is on the caster at the cast
        if (row.self) Object.keys(row.self).forEach(function(k){
          payoffs++;
          if (k === 'heal'){ if (!(A.pct < 20)) bad('self.heal did not heal'); return; }
          var fld = SELF[k]; if (!fld){ bad('self.' + k + ' is not a known buff'); return; }
          if (!(A[fld] > 0)) bad('self.' + k + ' did not set ' + fld);
        });
        // ---- hit (hop, warp, spin): the swing lands, and its status is on the dummy
        if (row.hit && row.shape !== 'plunge'){
          payoffs++;
          if (!(D.pct > dPct0)) bad('the swing did not hit a dummy standing in it');
          if (row.hit.eff){
            if (row.hit.eff === 'strip'){ if (D.reflecting !== 0) bad('hit.eff strip left the reflect stance up (' + D.reflecting + ')'); }
            else if (row.hit.eff === 'drain'){ if (!(afterCast.aPct < 20)) bad('hit.eff drain did not heal the caster'); }
            else { var f2 = EFF[row.hit.eff]; if (!f2) bad('hit.eff ' + row.hit.eff + ' has no observable field'); else if (!(D[f2] > 0)) bad('hit.eff ' + row.hit.eff + ' did not set ' + f2); }
          }
        }
        // ---- shot: one projectile, the way the caster faces, carrying its status
        if (row.shot){
          payoffs++;
          var shots = afterCast.proj.filter(function(p){ return p.owner === A.idx && !p.trap; });
          if (shots.length < 1) bad('shot{} fired nothing');
          else {
            if (Math.sign(shots[0].vx) !== A.face) bad('the shot went backwards');
            if ((row.shot.fxTag || null) !== (shots[0].fxTag || null)) bad('the shot carries fxTag ' + shots[0].fxTag + ', not ' + row.shot.fxTag);
          }
        }
        // ---- drop: that many projectiles fall
        if (row.drop){
          payoffs++;
          var n = row.drop.count || 1;
          if (afterCast.proj.length < n) bad('drop{} released ' + afterCast.proj.length + ' of ' + n);
        }
        // ---- leave on a hop, warp or spin
        if (row.leave === 'stun' && row.shape !== 'plunge'){ payoffs++; if (!(D._stunFx > 0)) bad('leave stun did not stun a dummy beside the cast'); }
        if (row.leave === 'lifesteal'){ payoffs++; if (!(afterCast.aPct < 20)) bad('leave lifesteal did not heal on a connecting swing'); }
        // ---- the rise, and for a plunge the landing: its hit, its crater rider, its ram
        var minY = A.y, landed = false, landHit = false, ramVx = 0, riders = 0, stunned = false;
        for (var i=0; i<140; i++){
          var pBefore = projectiles.length;
          step();
          if (row.shape === 'plunge'){ D.x = A.x; D.vx = 0; }
          minY = Math.min(minY, A.y);
          if (row.shape === 'plunge' && !landed && A._stall == null && i > 3){
            landed = true; landHit = D.pct > dPct0; ramVx = A.vx; stunned = D._stunFx > 0;
            riders = projectiles.slice(pBefore).length + projectiles.filter(function(p){ return p.owner === A.idx; }).length;
          }
        }
        if (!(y0 - minY > 20)) bad('it did not rise (' + (y0 - minY).toFixed(0) + ' px)');
        if (row.shape === 'plunge'){
          payoffs++;
          if (!landed) bad('the plunge never landed');
          else {
            if (!landHit) bad('the landing did not hit the dummy under it');
            if (row.leave === 'stun' && !stunned) bad('the landing did not leave its stun');
            else if (row.leave && row.leave !== 'stun' && riders < 1) bad('the landing left no ' + row.leave);
            if (row.ram && Math.sign(ramVx) !== A.face) bad('the landing did not ram forward (vx ' + ramVx.toFixed(1) + ')');
          }
        }
      });
      return { checked: checked, payoffs: payoffs, fails: fails, rows: Object.keys(UPSPEC).length };
    })()`);
    expect(r.fails).toEqual([]);
    expect(r.checked, 'every row but the two kept ones was cast').toBe(r.rows - 2);
    expect(r.payoffs, 'and every one of them declared at least one payoff').toBeGreaterThanOrEqual(r.checked);
  });

  it('no row is movement alone: each names a payoff', () => {
    const bare = W.eval(`Object.keys(UPSPEC).filter(function(k){
      if (${JSON.stringify(KEPT)}.indexOf(k) >= 0) return false;
      var r = UPSPEC[k];
      return !(r.self || r.shot || r.drop || r.leave || r.ram || (r.hit && r.hit.eff) || r.shape === 'plunge');   // a bare swing is not enough
    })`);
    expect(bare).toEqual([]);
  });
});
