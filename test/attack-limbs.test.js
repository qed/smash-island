import { describe, it, expect, beforeAll } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// PUNCHES AND KICKS.
//
// Every attack was the whole sprite lunging forward -- no limb ever moved. Now the jab throws a punch
// and the low ground move throws a kick, extending on the release beat and retracting on the recover.
// The ground move also had no swing animation at all before this; it now arms the same timeline.
// It is all render: nothing here is read by the simulation, the AI or the netcode.

let w;
beforeAll(() => { ({ window: w } = loadMonolith()); });

const stage = (name, act) => w.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0;
  beginMatchNow();
  var f = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  f.controller='still'; f.you=false; f.atkCd=0; f.face=1;
  fighters[0] = f;
  ${act}
  return f;
})()`);

describe('the swing knows what it is', () => {
  it('the jab is a punch', () => {
    const f = stage('Money', 'doAttack(f);');
    expect(f._atkKind).toBe('punch');
    expect(f._atkAnim).toBeGreaterThan(0);
  });

  it('the ground move is a kick, and now animates at all', () => {
    const f = stage('Money', 'doGroundMove(f);');
    expect(f._atkKind, 'it had no swing timeline before').toBe('kick');
    expect(f._atkAnim).toBeGreaterThan(0);
  });

  it('specials and smashes do not grow a limb', () => {
    expect(stage('Money', 'doSpecial(f);')._atkKind).toBe(null);
    expect(stage('Bell', 'doSmash(f, 1);')._atkKind).toBe(null);
  });
});

describe('the limb draws through the whole swing', () => {
  // One fighter with a render (Money) and one drawn as vector art (Pencil): the limb has to place
  // itself on both, and the vector one also hides its own stub arm or leg while the real one is out.
  for (const name of ['Money', 'Pencil']) {
    for (const act of ['doAttack(f);', 'doGroundMove(f);']) {
      it(`${name}: every frame of ${act.replace('(f);', '')} draws without throwing`, () => {
        const thrown = w.eval(`(function(){
          SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; beginMatchNow();
          var f = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
          f.controller='still'; f.you=false; f.atkCd=0; fighters[0]=f;
          ${act}
          var errs=[];
          for (var i=0; i<ATK_ANIM+2; i++){
            try { f._atkPhase = atkPhase(f); drawFighter(f); } catch(e){ errs.push(i+': '+e.message); }
            if (f._atkAnim > 0) f._atkAnim--;
          }
          return errs;
        })()`);
        expect(thrown).toEqual([]);
      });
    }
  }
});
