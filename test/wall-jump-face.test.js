import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "walljump can double up if you go from 1 wall section to another" (the owner, 2026-10-19). The once-per-airtime wall jump was
// counted per wall PIECE, so a wall built of stacked pieces gave one wall jump per piece. It is counted per wall FACE now: the
// same face line is one wall, a different wall (the other side of a shaft) is still its own.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// Two pieces stacked into one wall on the fighter's right (face at x=500), and a separate wall on the left (face at x=300).
const climb = (stack) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true; TESTMODE.active=false;
  summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var gy = groundY();
  worldPlats = ${stack} ? [
    { x:500, y:gy-24-600, w:60, h:300, solid:true },
    { x:500, y:gy-24-300, w:60, h:300, solid:true },
    { x:240, y:gy-24-600, w:60, h:600, solid:true }
  ] : [
    { x:500, y:gy-24-600, w:60, h:600, solid:true },
    { x:240, y:gy-24-600, w:60, h:600, solid:true }
  ];
  var A = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 470, gy-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 900, gy-24, 1);
  A.team=0; D.team=1; D.controller='still'; A.controller='remote'; fighters=[A,D];
  var saved = netRemoteInput, inp = {}; netRemoteInput = function(i){ return i === 0 ? inp : null; };
  var jumps = [];
  try {
    step();
    // in the air beside the lower piece of the right wall, falling, holding right
    A.y = gy - 24 - 200; A.x = 500 - A.r + 2; A.vx = 0; A.vy = 2; A.onground = false; A.jumps = 0;
    for (var k = 0; k < 4; k++){
      // touch the right wall at a new height each time (the lower piece first, then the upper piece)
      A.x = 500 - A.r + 2; A.y = gy - 24 - 200 - k*150; A.vy = 2; A.vx = 0;
      inp = { right:true }; step();
      inp = { right:true, jump:true }; step();
      jumps.push(A.vx < -1 ? 'R' : '-');
      inp = {}; step();
    }
    // then the left wall (another wall): still allowed once
    A.x = 300 + A.r - 2; A.y = gy - 24 - 400; A.vy = 2; A.vx = 0;
    inp = { left:true }; step(); inp = { left:true, jump:true }; step();
    jumps.push(A.vx > 1 ? 'L' : '-');
  } finally { netRemoteInput = saved; }
  return jumps.join('');
})()`);

describe('the wall jump is once per wall, and a wall is its face', () => {
  it('a wall of two stacked pieces gives one wall jump, not one per piece; the other wall still gives its own', () => {
    expect(climb(true), 'stacked pieces: one jump off the right wall, then the left wall').toBe('R---L');
  });
  it('a single-piece wall behaves the same', () => {
    expect(climb(false)).toBe('R---L');
  });
});

// "make it so that if i go into the air (not falling, a jump), my walljump resets" (the owner, 2026-10-19): a real jump -- a double
// jump in the air -- gives the wall jumps back; falling does not.
const again = (doubleJump) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true; TESTMODE.active=false;
  summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var gy = groundY();
  worldPlats = [{ x:500, y:gy-24-600, w:60, h:600, solid:true }];
  var A = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 470, gy-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 900, gy-24, 1);
  A.team=0; D.team=1; D.controller='still'; A.controller='remote'; fighters=[A,D];
  var saved = netRemoteInput, inp = {}; netRemoteInput = function(i){ return i === 0 ? inp : null; };
  var out = [];
  try {
    step();
    var touch = function(k){ A.x = 500 - A.r + 2; A.y = gy - 24 - 200 - k*150; A.vy = 2; A.vx = 0; inp = { right:true }; step(); inp = { right:true, jump:true }; step(); out.push(A.vx < -1 ? 'R' : '-'); inp = {}; step(); };
    A.onground = false; A.jumps = 1;
    touch(0);
    if (${doubleJump}) { A.jumps = 1; inp = {}; step(); inp = { jump:true }; step(); inp = {}; step(); out.push(A.vy < -3 ? 'J' : '?'); }
    else { out.push('f'); }
    touch(1);
  } finally { netRemoteInput = saved; }
  return out.join('');
})()`);

describe('a real jump gives the wall jump back', () => {
  it('wall jump, double jump, then the same wall again: a second wall jump', () => {
    expect(again(true)).toBe('RJR');
  });
  it('wall jump, then falling back to the same wall without jumping: no second wall jump', () => {
    expect(again(false)).toBe('Rf-');
  });
});

