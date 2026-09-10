import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// THE DIRECTION WINDOW.
//
// The special used to read inp.up / inp.down on the exact frame the special key went down. That
// works only if the direction is ALREADY held, so the natural motion — press special, then tilt —
// resolved as a neutral special every single time. Forty-eight authored up-specials sat behind an
// input almost nobody performs, which is why "up-specials don't do anything".
//
// Now a press with a direction held fires instantly, exactly as before, and a press with nothing
// held arms the special for SPECIAL_DIR_WINDOW frames and takes the first direction that lands.
// These tests are the difference: each one presses special FIRST and tilts afterwards.

// One window for the whole file, so every drive() must leave nothing behind: `down` is shared
// global state and a key still held from the previous case will fire a special during the next
// one's settling frame, before its first scripted input runs.
let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

/**
 * Stage one human-controlled fighter, then run `frames`, calling back into the key map each frame
 * so a test can press special on one frame and a direction on a later one. Returns which of the
 * three special routes actually ran.
 */
function drive(w, script, frames = 24) {
  return w.eval(`
    (function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 700, groundY()-24, 1);
      A.team=0; D.team=1; A.face=1; D.face=-1;
      A.controller='local'; A.you=true; D.controller='still';
      [A,D].forEach(function(f){ f.stocks=9; f.invuln=0; });
      fighters=[A,D];
      for (var k in down) delete down[k];   // BEFORE the settling frame: see note above
      step(); A.invuln=0; A.spCd=0; A.atkCd=0; A._sp=false; A._spPend=0; A._usedAirSpecial=false;

      // Record which route fires. These are top-level function declarations, so they are properties
      // of the global object and the call sites resolve through it — reassigning here really does
      // intercept them.
      var fired=[];
      var _u=doUpSpecial, _d=doDownSpecial, _n=doSpecial;
      doUpSpecial=function(f){ fired.push('up'); return _u(f); };
      doDownSpecial=function(f){ fired.push('down'); return _d(f); };
      doSpecial=function(f){ fired.push('neutral'); return _n(f); };

      var press = function(name, on){ down[KEYS[name]] = !!on; };
      try {
        for (var i=0; i<${frames}; i++){ (${script})(i, press, A); step(); }
      } finally {
        doUpSpecial=_u; doDownSpecial=_d; doSpecial=_n;
      }
      return { fired: fired, spCd: A.spCd, pend: A._spPend };
    })()`);
}

describe('a special pressed before the direction still routes by direction', () => {
  it('takes the up-special when up arrives inside the window', () => {
    const r = drive(W, `function(i, press){
      if (i === 0) press('special', true);
      if (i === 3) press('jump', true);      // "up" is the jump key — tilt AFTER the press
    }`);
    expect(r.fired).toEqual(['up']);
  });

  it('still fires instantly when the direction is already held', () => {
    const r = drive(W, `function(i, press){
      if (i === 0) { press('jump', true); press('special', true); }
    }`);
    expect(r.fired).toEqual(['up']);
  });

  it('falls back to the neutral special when no direction ever arrives', () => {
    const r = drive(W, `function(i, press){ if (i === 0) press('special', true); }`);
    expect(r.fired).toEqual(['neutral']);
  });

  it('waits for the direction rather than firing neutral on the press frame', () => {
    // The regression this guards: anything that fires on frame 0 has skipped the window, and a
    // late tilt can no longer reach it.
    const r = drive(W, `function(i, press){ if (i === 0) press('special', true); }`, 1);
    expect(r.fired).toEqual([]);
    expect(r.pend).toBeGreaterThan(0);
  });

  it('drops a pending special when the fighter is hit before it resolves', () => {
    const r = drive(W, `function(i, press, A){
      if (i === 0) press('special', true);
      if (i === 1) { A.hitstun = 12; press('special', false); }   // clipped mid-window, and let go
      if (i === 3) press('jump', true);
    }`);
    expect(r.fired).toEqual([]);
  });
});
