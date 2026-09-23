import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "these should have animations with the arms, not spawning arms randomly ... the animations include specials
// (puffball spitting the projectile, etc.)", and "if bow encounters someone on the way down, she brings them down with
// her. this applies to all things that drop a fighter." (2026-09-23)

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

describe('LIMB_RIG: the painted limbs, found in the renders', () => {
  it('finds arms for most of the cast, none for the armless, and never a fuse or a flame', () => {
    const r = W.eval(`(function(){
      var names = ROSTER.filter(function(x){ return x.play; }).map(function(x){ return x.name; });
      var withArms = names.filter(function(n){ return LIMB_RIG[n] && LIMB_RIG[n].arms.length; });
      var armless = names.filter(function(n){ return SPRITES[n] && SPRITES[n].arms === false && LIMB_RIG[n] && LIMB_RIG[n].arms.length; });
      var high = ['Bomby','Bomb','Firey','Roboty'].filter(function(n){ var L = LIMB_RIG[n]; if(!L) return false;
        return L.arms.some(function(a){ return a.pivot[1] < L.H * 0.3; }); });
      var perSide = names.filter(function(n){ var L = LIMB_RIG[n]; if(!L) return false;
        return L.arms.filter(function(a){ return a.side==='L'; }).length > 1 || L.arms.filter(function(a){ return a.side==='R'; }).length > 1; });
      return { withArms: withArms.length, armless: armless, high: high, perSide: perSide };
    })()`);
    expect(r.withArms).toBeGreaterThanOrEqual(45);
    expect(r.armless, 'a sprite marked armless has no arm').toEqual([]);
    expect(r.high, 'nothing growing out of the top of a body is an arm (fuses, flames, antennae)').toEqual([]);
    expect(r.perSide, 'at most one arm a side').toEqual([]);
  });
});

describe('what each move does with the body', () => {
  const kind = (name, move) => W.eval(`animKindOf({ name:${JSON.stringify(name)}, kit:ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }).kit }, ${JSON.stringify(move)})`);

  it('reads the kind off the move itself: Puffball spits, a sky drop casts, a trap stomps', () => {
    expect(kind('Puffball', 'jab'), "the owner's own example").toBe('spit');
    expect(kind('Microphone', 'special')).toBe('spit');
    expect(kind('Firey', 'special')).toBe('spit');
    expect(kind('Blocky', 'special')).toBe('cast');
    expect(kind('Toothpaste', 'special'), 'flings a glob AND sets a trap: the throw is what you see').toBe('throw');
    expect(kind('Firey', 'down')).toBe('stomp');
    expect(kind('Bow', 'special')).toBe('cast');
    expect(kind('Coiny', 'jab')).toBe('punch');
    expect(kind('Coiny', 'ranged')).toBe('kick');
    expect(kind('Coiny', 'utilt')).toBe('uppercut');
  });

  it('swings the FRONT arm on a punch, both on a cast, and none on a spit', () => {
    const r = W.eval(`(function(){
      var rig = LIMB_RIG.Coiny, sp = SPRITES.Coiny;
      var f = { name:'Coiny', _atkAnim:5, _atkLen:18, _atkPhase:'release' };
      var _k = atkPhaseK; atkPhaseK = function(){ return 1; };
      try {
        f._atkKind = 'punch'; var punch = limbMoves(f, rig, sp);
        f._atkKind = 'cast';  var cast = limbMoves(f, rig, sp);
        f._atkKind = 'spit';  var spit = limbMoves(f, rig, sp);
        f._atkAnim = 0; f._atkKind = 'punch'; var idle = limbMoves(f, rig, sp);
      } finally { atkPhaseK = _k; }
      var front = sp.flip ? 'L' : 'R';
      return { punch: punch && punch.map(function(m){ return [m.limb.side, +m.a.toFixed(2)]; }), front: front,
               cast: cast && cast.length, spit: spit, idle: idle };
    })()`);
    expect(r.punch.length).toBe(1);
    expect(r.punch[0][0], 'the arm on the side it faces').toBe(r.front);
    expect(Math.abs(r.punch[0][1]), 'and it actually moves').toBeGreaterThan(0.2);
    expect(r.cast, 'a cast raises both arms').toBe(2);
    expect(r.spit, 'a spit is the body alone').toBe(null);
    expect(r.idle, 'nothing moves when nothing is happening').toBe(null);
  });

  it('draws the body with the limb cut out, then the limb rotated about its pivot', () => {
    const calls = W.eval(`(function(){
      var log = [];
      var counting = new Proxy({}, { get:function(_t,p){ return function(){ log.push(p + (p==='clip' && arguments[0] ? ':' + arguments[0] : '')); }; }, set:function(){ return true; } });
      drawRigged({ naturalWidth:209, naturalHeight:200 }, 60, 57, LIMB_RIG.Coiny, [{ limb: LIMB_RIG.Coiny.arms[0], a: 0.8 }], counting);
      return log;
    })()`);
    expect(calls.filter((c) => c === 'clip:evenodd').length, 'the body, with the limb as a hole').toBe(1);
    expect(calls.filter((c) => c === 'rotate').length, 'the limb, swung').toBe(1);
    expect(calls.filter((c) => c === 'drawImage').length, 'the render drawn twice: body, then limb').toBe(2);
  });
});

describe('a drop takes whoever it falls into down with it', () => {
  const drop = (name, useMove, foeDx, foeDy) => W.eval(`(function(){
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true;
    worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
    var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24-260, 0);
    var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 400 + ${foeDx}, groundY()-24-260+${foeDy}, 1);
    A.team=0; D.team=1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9; fighters=[A,D];
    A.onground=false; D.onground=false; A.invuln=0; D.invuln=0; A.spCd=0; A.vy=0; D.vy=0; D.pct=30;
    ${useMove};
    var caught = false, together = false;
    for (var i=0;i<120;i++){
      step(); D.invuln = 0;
      if (D._carriedBy === A.idx) caught = true;
      if (A.onground){ together = caught && Math.abs(D.y - A.y) < 90;
        for (var j=0;j<4;j++){ step(); D.invuln = 0; }   // the landing hit resolves on the frame after touchdown
        break; }
    }
    return { caught: caught, together: together, hurt: +(D.pct-30).toFixed(1), released: D._carriedBy == null };
  })()`);

  it("Bow's chair slam catches a foe below her and takes them to the floor, where the landing hits them", () => {
    const r = drop('Bow', 'doUpSpecial(A)', 4, 70);
    expect(r.caught, 'caught on the way down').toBe(true);
    expect(r.together, 'and brought down with her').toBe(true);
    expect(r.hurt, 'the landing hits them').toBeGreaterThan(0);
    expect(r.released, 'and lets go once she lands').toBe(true);
  });

  it("every drop does it: Naily's plunge and a ground pound too", () => {
    expect(drop('Naily', 'doUpSpecial(A)', 4, 70).caught).toBe(true);
    expect(drop('Snowball', 'slamThen(A, function(){})', 4, 70).caught).toBe(true);
  });

  it('a foe it never touches is left alone', () => {
    expect(drop('Bow', 'doUpSpecial(A)', 300, 70).caught).toBe(false);
  });
});
