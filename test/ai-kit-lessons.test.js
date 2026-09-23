import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { bootMonolith } from './helpers/smash-golden.js';

// "teach the bot to play stance and air kits" / "teach them how to play trap kits". Three reads in
// aiKitLessons, class-independent because the kit decides them: a counter stance goes up while the
// foe's swing is still coming; a down-special trap goes at the feet when a foe is approaching or
// stunned, never on top of one already laid; Puffball climbs to a foe above her, takes to the air
// when a chase is being lost, and dives when she is over them. The function is called with the same
// arguments aiThink computes, so it is exercised here directly and deterministically (rn = 0).

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const pair = (a, b, dist, dy = 0) => `
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var F = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(a)}; }), 300, groundY()-24, 0);
  var T = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(b)}; }), 300+${dist}, groundY()-24-${dy}, 1);
  F.team=0; T.team=1; F.face=1; T.face=-1; fighters=[F,T]; step();
  F.spCd=0; F.atkCd=0; F.onground=true;
  var dx=T.x-F.x, dy=T.y-F.y, adx=Math.abs(dx), dist=Math.hypot(dx,dy);
  var inp=function(){ return {left:false,right:false,jump:false,down:false,attack:false,special:false,smash:false,up:false}; };
  var read=function(rn){ return aiKitLessons(F, T, inp(), dx, dy, dist, adx, rn===undefined?0:rn); };`;

describe('the counter read', () => {
  it('raises the stance while a foe in reach is charging a smash, and not while they stand idle', () => {
    const r = W.eval(`(function(){ ${pair('Golf Ball', 'Firey', 60)}
      var idle = read();
      T.smashHold = 8; var charging = read();
      T.smashHold = 0; T._atkAnim = 6; T.atkCd = 16; var swinging = read();
      T._atkAnim = 0; T.atkCd = 0; T._windup = { t: 4 }; var winding = read();
      return { idle: idle.special && idle.down, charging: charging.special && charging.down, swinging: swinging.special && swinging.down, winding: winding.special && winding.down, kits: Array.from(AI_COUNTER_KITS) };
    })()`);
    expect(r.idle).toBe(false);
    expect(r.charging).toBe(true);
    expect(r.swinging).toBe(true);
    expect(r.winding).toBe(true);
    expect(r.kits).toContain('counter');
    expect(r.kits).toContain('zapshooter');
  });

  it('does not reach across the arena', () => {
    const r = W.eval(`(function(){ ${pair('Needle', 'Firey', 400)}
      T.smashHold = 8; var far = read();
      return far.special && far.down;
    })()`);
    expect(r).toBe(false);
  });
});

describe('the trap read', () => {
  it('lays the trap at the feet when a foe approaches, not when they walk away, and never twice', () => {
    const r = W.eval(`(function(){ ${pair('Fries', 'Firey', 160)}
      T.vx = -3; var coming = read();
      T.vx = 3;  var leaving = read();
      T.vx = 0; T.hitstun = 20; var stunned = read(); T.hitstun = 0;
      T.vx = -3; projectiles.push({ trap:true, owner:F.idx, x:F.x+20, y:F.y, life:200 }); var laid = read();
      return { coming: coming.special && coming.down, leaving: leaving.special && leaving.down, stunned: stunned.special && stunned.down, laid: laid.special && laid.down, kits: AI_TRAP_DOWN.size };
    })()`);
    expect(r.coming).toBe(true);
    expect(r.leaving).toBe(false);
    expect(r.stunned).toBe(true);
    expect(r.laid, 'no second trap on top of the first').toBe(false);
    expect(r.kits).toBeGreaterThanOrEqual(19);
  });

  it('is a read, not a coin flip: the roll only thins it', () => {
    const r = W.eval(`(function(){ ${pair('Fries', 'Firey', 160)}
      T.vx = -3; var low = read(0.1), high = read(0.9);
      return { low: low.special && low.down, high: high.special && high.down };
    })()`);
    expect(r.low).toBe(true);
    expect(r.high).toBe(false);
  });
});

describe('the flying read (Puffball)', () => {
  it('climbs to a foe above her once her jumps are spent', () => {
    const r = W.eval(`(function(){ ${pair('Puffball', 'Firey', 40, 140)}
      F.onground = false; F.jumps = 0; var up = read();
      F.jumps = 2; var withJumps = read();
      return { up: up.special && up.up, withJumps: withJumps.special && withJumps.up };
    })()`);
    expect(r.up).toBe(true);
    expect(r.withJumps, 'jumps first, the special after').toBe(false);
  });

  it('takes to the air when a chase is being lost, and dives when she is over them', () => {
    const r = W.eval(`(function(){ ${pair('Puffball', 'Firey', 260)}
      T.vx = 4; var chase = read(0.1);
      T.vx = 0; var still = read(0.1);
      var G = makeFighter(ROSTER.find(function(r){ return r.name==='Puffball'; }), 300, groundY()-24-120, 0); G.team=0; G.flying=30; G.onground=false; G.spCd=0; G.atkCd=0;
      var H = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 320, groundY()-24, 1); H.team=1;
      var ddx=H.x-G.x, ddy=H.y-G.y; var dive = aiKitLessons(G, H, inp(), ddx, ddy, Math.hypot(ddx,ddy), Math.abs(ddx), 0);
      return { chase: chase.jump && chase.special && chase.up, still: still.special && still.up, dive: dive.attack && dive.special };
    })()`);
    expect(r.chase).toBe(true);
    expect(r.still).toBe(false);
    expect(r.dive).toBe(true);
  });
});

describe('review findings on the reads', () => {
  it("Leafy's counter read raises her parry (the down-special), not her dash", () => {
    const r = W.eval(`(function(){ ${pair('Leafy', 'Firey', 60)}
      T.smashHold = 8; var i = read();
      return { special: i.special, down: i.down };
    })()`);
    expect(r).toEqual({ special: true, down: true });
  });

  it('a kit read drops the jab queued on the same frame, so attack+special does not fire the combo-ender', () => {
    const r = W.eval(`(function(){ ${pair('Golf Ball', 'Firey', 60)}
      T.smashHold = 8; var i = read(); i.attack = true;       // the pre-block jab
      F._aiSpGap = 0; F._lvlCache = 2;
      var out = finishAI(F, i, F.kit.special);
      var plain = { attack:true, special:false }; var out2 = finishAI(F, plain, F.kit.special);
      return { attack: out.attack, special: out.special, down: out.down, marker: ('_kitRead' in out), plainAttack: out2.attack };
    })()`);
    expect(r.special).toBe(true);
    expect(r.down).toBe(true);
    expect(r.attack).toBe(false);
    expect(r.marker, 'the marker never leaves finishAI').toBe(false);
    expect(r.plainAttack, 'an ordinary jab is untouched').toBe(true);
  });

  it("Ice Cube's hold is for her ring only: her stance and her hop keep the plain gap", () => {
    const r = W.eval(`(function(){
      var f = makeFighter(ROSTER.find(function(x){ return x.kit && x.kit.special==='shatter'; }), 0, 0, 0);
      return { ring: aiSpecialGap(f), neutral: aiSpecialGap(f, true), stance: aiSpecialGap(f, false), hold: AI_SPECIAL_HOLD.shatter };
    })()`);
    expect(r.ring - r.stance).toBe(r.hold);
    expect(r.neutral).toBe(r.ring);
  });

  it("Roboty's spring is not in the AI's zoner list", () => {
    const src = readFileSync('artifacts/V1/index.html', 'utf8');
    const zoners = src.match(/const ZONERS=\[[^\]]*\]/)[0];
    expect(zoners).not.toContain('"antenna"');
    expect(zoners).toContain('"zapshooter"');
  });
});

describe('the shatter read', () => {
  it("Gelatin closes on a frozen foe and breaks the ice, and leaves an unfrozen one to her usual game", () => {
    // Balance round 3: her hits shatter a frozen foe, and her bot was not using it (16 follow-ups on 91 freezes).
    const r = W.eval(`(function(){ ${pair('Gelatin', 'Firey', 150)}
      var loose = read();
      T.frozen = 60; var far = read();
      T.x = F.x + 40; dx=T.x-F.x; adx=Math.abs(dx); dist=Math.hypot(dx,dy);
      var near = aiKitLessons(F, T, inp(), dx, dy, dist, adx, 0);
      return { looseWalk: !!(loose.left || loose.right), farRight: far.right, farLeft: far.left, nearAttack: near.attack };
    })()`);
    expect(r.looseWalk, 'an unfrozen foe does not pull her in (her trap read may still fire; it does not move her)').toBe(false);
    expect(r.farRight && !r.farLeft, 'she walks in on a frozen one').toBe(true);
    expect(r.nearAttack, 'and swings when she gets there').toBe(true);
  });
});
