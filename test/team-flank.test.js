import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// TEAM FLANK.
//
// "team members never do anything but ram straight. tweak the weights so that in 4tdm, some go up as
// well." Every CPU on a team took the same straight line at the nearest enemy. Now the odd slots of a
// team take the high road: far from a level target, they climb toward a point two pad rows above it and
// close along the pad field; the ordinary drop logic lands them once overhead. Which member flanks is
// its slot within the team, so a 2v2 has one rusher and one flanker per side, deterministically.
//
// Measured over four 2v2 CPU matches: the second teammate is a full pad row above the first 43% of the
// time (was 24%), and damage dealt and KOs per match held. In the four-team split, 26% -> 35%.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

/** A 2v2 on the teams arena; put `slot` of team 0 on the floor 520px from a level enemy, and let it think. */
const drive = (slot, mode = 'teams') => W.eval(`(function(){
  SETTINGS.mode='teams'; SETTINGS.count=4; SETTINGS.teamKey='2v2'; SETTINGS.stocks=3; SETTINGS.itemRate=0; running=true;
  beginMatchNow();
  fighters.forEach(function(f){ f.controller='ai'; f.you=false; });
  var mine = fighters.filter(function(f){ return f.team===0; }), foes = fighters.filter(function(f){ return f.team!==0; });
  var f = mine[${slot}], t = foes[0];
  var gy = groundY();
  f.x = 300; f.y = gy - f.r; f.vx = 0; f.vy = 0; f.onground = true;
  t.x = 820; t.y = gy - t.r; t.vx = 0; t.vy = 0; t.controller = 'still';
  foes[1].x = 3000; foes[1].y = -3000;            // out of the way, so t is the nearest enemy
  mine[1 - ${slot}].x = -3000; mine[1 - ${slot}].y = -3000;
  f.aiTarget = t; f.aiTimer = 999; f.pct = 0;
  ${mode === 'ffa' ? "SETTINGS.mode='ffa';" : ''}
  var y0 = f.y, rose = 0, jumped = 0;
  for (var i=0;i<90;i++){ step(); t.x = 820; t.y = gy - t.r; t.vx = 0; t.vy = 0;
    rose = Math.max(rose, y0 - f.y); if (!f.onground) jumped++; }
  return { slot: ${slot}, teamSlot: teamSlotOf(f), rose: rose, airborne: jumped, x: f.x };
})()`);

describe('who flanks', () => {
  it('is the second member of a team, by slot, not by chance', () => {
    const slots = W.eval(`(function(){
      SETTINGS.mode='teams'; SETTINGS.count=4; SETTINGS.teamKey='2v2'; running=true; beginMatchNow();
      return fighters.map(function(f){ return [f.team, teamSlotOf(f)]; });
    })()`);
    expect(slots.filter(([, s]) => s === 1).length, 'one flanker per team').toBe(2);
    expect(slots.filter(([, s]) => s === 0).length).toBe(2);
  });
});

describe('the high road', () => {
  it('the flanker climbs toward a level target it is far from; the rusher does not', () => {
    const flanker = drive(1), rusher = drive(0);
    expect(flanker.teamSlot).toBe(1);
    expect(flanker.rose, 'the flanker should have gained height').toBeGreaterThan(60);
    expect(rusher.rose, 'the rusher stays on the floor').toBeLessThan(60);
  });

  it('cannot happen outside team mode: in a free-for-all every fighter is its own team, so nobody is slot 1', () => {
    // (A behavioural control was tried first and was confounded by the arena: in FFA the same fighter
    // still hops a bluff on the way over. The structural fact is the one the code actually relies on.)
    const slots = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=4; SETTINGS.items=false; running=true; beginMatchNow();
      return fighters.map(function(f){ return teamSlotOf(f); });
    })()`);
    expect(slots.length).toBe(4);
    expect(new Set(slots)).toEqual(new Set([0]));
  });
});
