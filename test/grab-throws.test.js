import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "Grab on X + C" (the owner, 2026-10-14). Every fighter has a grab with a pummel and four throws; a converted fighter's own
// throws override the shared ones, but the shape of the thing is the same for all of them.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const stage = (name, dx, dy = 0, foeName = 'Pen', foeTeam = 1) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true; TESTMODE.active=false;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var mk=function(n,x,i){ return makeFighter(ROSTER.find(function(r){return r.name===n;}), x, groundY()-24, i); };
  var A = mk(${JSON.stringify(name)}, 400, 0), D = mk(${JSON.stringify(foeName)}, 400 + ${dx}, 1);
  A.team=0; D.team=${foeTeam}; A.face=1; D.face=-1; A.controller='local'; A.you=true; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; for (var k in down) delete down[k];
  step(); step();
  fighters.forEach(function(f){ f.invuln=0; f.hitstun=0; f.atkCd=0; f.spCd=0; f.pct=0; f.vx=0; f.vy=0; });
})()`);
const hold = (keys, n = 1) => W.eval(`(function(){ ${JSON.stringify(keys)}.forEach(function(k){ down[KEYS[k]]=true; }); for(var i=0;i<${n};i++) step(); ${JSON.stringify(keys)}.forEach(function(k){ down[KEYS[k]]=false; }); })()`);
const steps = (n) => W.eval(`for(var i=0;i<${n};i++) step();`);
const J = (code) => W.eval(`(function(){ return ${code}; })()`);
const grab = (name, dx, foe, team) => { stage(name, dx, 0, foe, team); hold(['attack', 'special'], 1); steps(10); };
const SAMPLE = ['Coiny', 'Puffball', 'Bow', 'Pencil', 'Leafy', 'Snowball'];

describe('X+C grabs', () => {
  it('holds a foe standing in front, for any fighter', () => {
    const bad = SAMPLE.filter((n) => { grab(n, 40); return !J('fighters[0]._hold && fighters[1]._heldBy === 0'); });
    expect(bad).toEqual([]);
  });
  it('finds nobody out of reach, behind, or on the same team, and leaves the grabber open a moment', () => {
    grab('Coiny', 200); expect(J('!!fighters[0]._hold')).toBe(false);
    grab('Coiny', -40); expect(J('!!fighters[0]._hold')).toBe(false);
    grab('Coiny', 40, 'Pen', 0); expect(J('!!fighters[0]._hold')).toBe(false);
    stage('Coiny', 200); hold(['attack', 'special'], 1);
    expect(J('fighters[0].atkCd')).toBeGreaterThan(10);
  });
  it('does not fire the jab or the finisher on the way', () => {
    stage('Coiny', 200); hold(['attack', 'special'], 1);
    expect(J('fighters[0].fnCd')).toBe(0);
    expect(J('fighters[0]._atkKind')).toBe('grab');
  });
});

describe('holding', () => {
  it('X and C a few frames apart, in either order, still grab ("grab is hard to use", 2026-10-15)', () => {
    const late = (first, gap) => { stage('Coiny', 40); W.eval(`down[KEYS.${first}]=true;`); steps(gap);
      W.eval(`down[KEYS.attack]=true; down[KEYS.special]=true;`); steps(1); W.eval('down[KEYS.attack]=false; down[KEYS.special]=false;'); steps(10); };
    late('attack', 4); expect(J('!!fighters[0]._hold')).toBe(true);
    late('special', 3); expect(J('!!fighters[0]._hold')).toBe(true);
    expect(J('fighters[0].spCd')).toBe(0);   // the pending neutral special was dropped, not fired
  });
  it('a press of X pummels for a little damage, not a launch', () => {
    grab('Coiny', 40); steps(6);
    hold(['attack'], 4); steps(6);
    const pct = J('fighters[1].pct');
    expect(pct).toBeGreaterThan(0); expect(pct).toBeLessThan(3);
    expect(J('fighters[1].hitstun')).toBe(0);
    expect(J('!!fighters[0]._hold')).toBe(true);
  });
  it('each direction throws its own way, and lets go', () => {
    const out = {};
    for (const dir of ['right', 'left', 'jump', 'down']) {
      grab('Coiny', 40); steps(6); hold([dir], 2); steps(2);
      out[dir] = J('({ pct: fighters[1].pct, vx: fighters[1].vx, vy: fighters[1].vy, stun: fighters[1].hitstun, held: fighters[1]._heldBy, hold: !!fighters[0]._hold })');
    }
    for (const d of Object.values(out)) { expect(d.pct).toBeGreaterThan(0); expect(d.held).toBe(null); expect(d.hold).toBe(false); expect(d.stun).toBeGreaterThan(0); }
    expect(out.right.vx).toBeGreaterThan(1);    // forward: the way she faces
    expect(out.left.vx).toBeLessThan(-1);       // back: behind her
    expect(out.jump.vy).toBeLessThan(-1);       // up
    expect(out.down.stun).toBeGreaterThan(out.right.stun);   // down: little launch, long stun, so a follow-up can reach
  });
  it('a hit on either of them lets go', () => {
    grab('Coiny', 40); W.eval('applyHit(fighters[1], 3, 2, -2, fighters[0]);'); steps(2);
    expect(J('fighters[1]._heldBy')).toBe(null); expect(J('!!fighters[0]._hold')).toBe(false);
    // (restated for the HIT FREEZE, the owner 2026-10-20: "Yes, tiny" -- the holder hit is held still for the hit's freeze, and lets go on
    // the first frame of their own after it)
    grab('Coiny', 40); W.eval('applyHit(fighters[0], 3, 2, -2, fighters[1]);'); steps(2 + J('hitStopFrames(3)'));
    expect(J('fighters[1]._heldBy')).toBe(null); expect(J('!!fighters[0]._hold')).toBe(false);
  });
  it('the held fighter struggles free sooner by pressing, and later with more damage on them', () => {
    const lasted = (mash, pct) => { grab('Coiny', 40); W.eval(`fighters[1].pct=${pct}; fighters[0]._hold.max = Math.max(40, Math.min(150, 56 + ${pct}*0.5));`); let n = 0;
      while (J('!!fighters[0]._hold') && n < 400) { if (mash && n % 6 === 0) W.eval('fighters[1].controller="local"; down[KEYS.attack] = true;'); else W.eval('down[KEYS.attack] = false;'); steps(1); n++; }
      W.eval('down[KEYS.attack] = false; fighters[1].controller="still";'); return n; };
    const still = lasted(false, 0), mashed = lasted(true, 0), hurt = lasted(false, 100);
    expect(mashed).toBeLessThan(still);
    expect(hurt).toBeGreaterThan(still);
  });
});
