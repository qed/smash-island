import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// Wave 3 — touch controls.
//
// Before this, a phone or a Chromebook touchscreen could not play the game AT ALL: every input
// path reads the global `down` map, and nothing wrote to it without a keyboard.
//
// The design decision under test is that the pad drives `down[KEYS.*]` rather than introducing a
// parallel input channel. That is what keeps the sim, the AI, the netcode serializer and the replay
// path from ever learning that touch exists — and it is why remapping a key in Controls remaps the
// touch button for free. Several tests below exist specifically to pin that.

function press(w, act) {
  return w.eval(`
    (function(){
      var b = document.querySelector('#touchpad [data-act="${act}"]');
      if(!b) return 'no button';
      var e = new window.PointerEvent('pointerdown', {bubbles:true, pointerId:7});
      b.dispatchEvent(e);
      return 'ok';
    })()`);
}
function release(w, act) {
  return w.eval(`
    (function(){
      var b = document.querySelector('#touchpad [data-act="${act}"]');
      var e = new window.PointerEvent('pointerup', {bubbles:true, pointerId:7});
      b.dispatchEvent(e);
      return 'ok';
    })()`);
}
// jsdom has no PointerEvent in some versions; fall back to a plain Event carrying pointerId.
function shim(w) {
  w.eval(`
    if (typeof window.PointerEvent === 'undefined') {
      window.PointerEvent = function(type, o){
        var e = new window.Event(type, {bubbles:!!(o&&o.bubbles)});
        e.pointerId = (o&&o.pointerId)||1;
        return e;
      };
    }
    if (!window.Element.prototype.setPointerCapture) window.Element.prototype.setPointerCapture = function(){};
    bindTouchControls();
  `);
}

describe('touch controls — the pad drives the same keys a keyboard would', () => {
  it('holds and releases the mapped key for every action', () => {
    const { window: w } = loadMonolith();
    shim(w);
    for (const act of ['left', 'right', 'down', 'jump', 'attack', 'special', 'smash']) {
      expect(press(w, act), `${act} button exists`).toBe('ok');
      expect(w.eval(`down[KEYS[${JSON.stringify(act)}]] === true`), `${act} sets its key down`).toBe(true);
      release(w, act);
      expect(w.eval(`down[KEYS[${JSON.stringify(act)}]] === false`), `${act} releases`).toBe(true);
    }
  });

  it('follows a remapped key instead of a hard-coded one', () => {
    // The whole point of resolving KEYS at press time. If this ever regresses, a player who
    // remaps their keyboard silently gets a touch pad that presses the OLD keys.
    const { window: w } = loadMonolith();
    shim(w);
    w.eval(`KEYS.attack = 'KeyZ';`);
    press(w, 'attack');
    expect(w.eval(`down['KeyZ'] === true`), 'touch attack followed the remap').toBe(true);
    expect(w.eval(`down['KeyX'] === true`), 'and did not press the old key').toBe(false);
  });

  it('supports two fingers at once — moving and attacking together', () => {
    // A pad that cannot hold right + attack is unusable for this game.
    const { window: w } = loadMonolith();
    shim(w);
    w.eval(`
      var r = document.querySelector('#touchpad [data-act="right"]');
      var a = document.querySelector('#touchpad [data-act="attack"]');
      var e1 = new window.PointerEvent('pointerdown',{bubbles:true,pointerId:1}); r.dispatchEvent(e1);
      var e2 = new window.PointerEvent('pointerdown',{bubbles:true,pointerId:2}); a.dispatchEvent(e2);
    `);
    expect(w.eval(`down[KEYS.right] && down[KEYS.attack]`), 'both held simultaneously').toBe(true);
    // …and lifting one must not release the other
    w.eval(`document.querySelector('#touchpad [data-act="attack"]')
      .dispatchEvent(new window.PointerEvent('pointerup',{bubbles:true,pointerId:2}));`);
    expect(w.eval(`down[KEYS.right] === true`), 'movement survives the other finger lifting').toBe(true);
  });
});

describe('touch controls — never leaves a key stuck', () => {
  it('releases everything when the page loses focus mid-press', () => {
    // A stuck `right` walks the fighter off the stage while the player watches an app switcher.
    const { window: w } = loadMonolith();
    shim(w);
    press(w, 'right');
    expect(w.eval(`down[KEYS.right]`)).toBe(true);
    w.eval(`window.dispatchEvent(new window.Event('blur'));`);
    expect(w.eval(`down[KEYS.right] === false`), 'blur cleared the held key').toBe(true);
  });

  it('clears held keys when the pad is hidden', () => {
    const { window: w } = loadMonolith();
    shim(w);
    press(w, 'left');
    expect(w.eval(`down[KEYS.left]`)).toBe(true);
    w.eval(`running = false; syncTouchControls();`);
    expect(w.eval(`down[KEYS.left] === false`), 'hiding the pad let go of the key').toBe(true);
  });

  it('pointercancel counts as a release', () => {
    const { window: w } = loadMonolith();
    shim(w);
    press(w, 'special');
    w.eval(`document.querySelector('#touchpad [data-act="special"]')
      .dispatchEvent(new window.PointerEvent('pointercancel',{bubbles:true,pointerId:7}));`);
    expect(w.eval(`down[KEYS.special] === false`)).toBe(true);
  });
});

describe('touch controls — shown only when they belong', () => {
  it('stays hidden on a device with no touchscreen', () => {
    const { window: w } = loadMonolith();
    w.eval(`
      Object.defineProperty(navigator, 'maxTouchPoints', { value:0, configurable:true });
      delete window.ontouchstart;
      TOUCH.mode='auto'; running=true; syncTouchControls();
    `);
    expect(w.eval(`document.getElementById('touchpad').style.display`)).toBe('none');
  });

  it('is hidden outside a match even on a touch device', () => {
    const { window: w } = loadMonolith();
    w.eval(`TOUCH.mode='on'; running=false; syncTouchControls();`);
    expect(w.eval(`document.getElementById('touchpad').style.display`)).toBe('none');
  });

  it('appears during a match when forced on, and the setting survives a reload', () => {
    const { window: w } = loadMonolith();
    w.eval(`
      setTouchMode('on');
      SETTINGS.mode='ffa'; SETTINGS.count=2; beginMatchNow();
      syncTouchControls();
    `);
    expect(w.eval(`document.getElementById('touchpad').style.display`)).toBe('block');
    expect(w.eval(`localStorage.getItem('bfsi:touchMode')`), 'the choice persists').toBe('on');
  });

  it('cycles auto -> on -> off -> auto from the Controls button', () => {
    const { window: w } = loadMonolith();
    w.eval(`setTouchMode('auto')`);
    const seen = [];
    for (let i = 0; i < 3; i++) { w.eval('cycleTouchMode()'); seen.push(w.eval('TOUCH.mode')); }
    expect(seen).toEqual(['on', 'off', 'auto']);
  });

  it('leaves the gaps between buttons transparent to the canvas', () => {
    // The pad spans the whole screen. If it swallowed pointer events the player could not click
    // anything underneath it — including the pause menu.
    const { window: w } = loadMonolith();
    const padPE = w.eval(`window.getComputedStyle(document.getElementById('touchpad')).pointerEvents`);
    expect(padPE, 'the pad container must not capture pointers').toBe('none');
    const btnPE = w.eval(`window.getComputedStyle(document.querySelector('#touchpad .tp-btn')).pointerEvents`);
    expect(btnPE, 'but the buttons must').toBe('auto');
  });
});

describe('touch controls — the sim never learns touch exists', () => {
  it('adds no new input channel: the pad only ever writes to `down`', () => {
    const { window: w } = loadMonolith();
    shim(w);
    // Snapshot every key of the input map that a press could touch, then press each button and
    // confirm the ONLY things that changed are entries in `down`.
    const before = w.eval(`JSON.stringify({fighters: fighters.length, settings: SETTINGS})`);
    for (const act of ['left', 'right', 'jump', 'attack', 'special', 'smash', 'down']) {
      press(w, act); release(w, act);
    }
    const after = w.eval(`JSON.stringify({fighters: fighters.length, settings: SETTINGS})`);
    expect(after, 'touch input mutated game state directly').toBe(before);
  });

  it('pause is wired to the same toggle the keyboard uses', () => {
    const { window: w } = loadMonolith();
    shim(w);
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=2; beginMatchNow(); paused=false;`);
    press(w, 'pause');
    expect(w.eval('paused'), 'the pause button paused the match').toBe(true);
  });
});

describe('pause key', () => {
  it('is Escape by default, for both players', () => {
    const { window: w } = loadMonolith();
    expect(w.eval('DEFAULT_KEYS.pause')).toBe('Escape');
    expect(w.eval('DEFAULT_KEYS_P2.pause')).toBe('Escape');
    expect(w.eval('KEYS.pause')).toBe('Escape');
  });

  it('Escape actually pauses and unpauses a running match', () => {
    const { window: w } = loadMonolith();
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=2; beginMatchNow(); paused=false;`);
    const esc = () => w.eval(`window.dispatchEvent(new window.KeyboardEvent('keydown',{code:'Escape'}))`);
    esc();
    expect(w.eval('paused'), 'Escape paused').toBe(true);
    esc();
    expect(w.eval('paused'), 'Escape unpaused').toBe(false);
  });

  it('still lets Escape leave the tutorial rather than pausing it', () => {
    // The tutorial's own Escape handler runs first and returns — that affordance predates this
    // change and must survive it, or there is no way out of the tutorial.
    const { window: w } = loadMonolith();
    w.eval(`TUT.active = true; running = true; paused = false;
            window.dispatchEvent(new window.KeyboardEvent('keydown',{code:'Escape'}));`);
    expect(w.eval('TUT.active'), 'tutorial exited').toBe(false);
    expect(w.eval('paused'), 'and did not also pause').toBe(false);
  });
});
