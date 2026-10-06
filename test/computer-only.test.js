import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from './helpers/prng.js';
import { loadMonolith } from './helpers/load-monolith.js';

// A COMPUTER GAME. The owner, 2026-10-06: "also, remove mobile compatibility.... I SAID I WANTED THIS TO BE A COMPUTER GAME!!!"
//
// Battle for Smash Island is played on a computer: the keyboard, and the mouse in the menus and the Level Creator. Phone and touch
// features went in anyway, and the worst was the on-screen touch pad, which rose on any device with a touch screen, a touch-screen
// laptop too. They are gone, and this file keeps them gone. It pins, one group at a time:
//   - no touch pad: no #touchpad element, none of its styles, none of the code that served it, and the saved setting for it is let go;
//   - no Touch control in Settings or on the Controls screen;
//   - no phone-only layout: no @media rule that exists to fit a phone, and nothing that reacts to a touch;
//   - no phone-only page tags (the plain viewport tag stays);
//   - no "tap" and no phone or tablet wording in anything a player reads.
// What a computer window needs stays, and is not pinned away here: Esc still pauses, keys are still let go when the window loses
// focus, and the rules that wrap or shrink a card inside an ordinary laptop window are untouched.

const HTML = readFileSync('artifacts/V1/index.html', 'utf8');
const DOC = new JSDOM(HTML).window.document;   // parsed, never run: the markup and the styles exactly as shipped
const CSS = [...DOC.querySelectorAll('style')].map((s) => s.textContent).join('\n');

// The page, booted in jsdom, with whatever a player's browser had already saved.
function boot(seed = {}) {
  const dom = new JSDOM(HTML, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      const grad = { addColorStop() {} };
      window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
        get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 })
          : p === 'canvas' ? { width: 1100, height: 720 }
          : p === 'getImageData' ? () => ({ data: [] })
          : (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createConicGradient' || p === 'createPattern') ? () => grad : () => {}),
        set: () => true,
      });
      window.Math.random = mulberry32(11);
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
      for (const [k, v] of Object.entries(seed)) window.localStorage.setItem(k, v);
    },
  });
  return dom.window;
}

// Everything the touch pad was made of. A word-boundary match, so UNTOUCHED and "touchdown" are not caught.
const TOUCH_CODE = ['TOUCH', 'TOUCH_MODE_KEY', 'touchCapable', 'touchShouldShow', 'touchSet', 'bindTouchControls', 'syncTouchControls',
  'setTouchMode', 'cycleTouchMode', 'syncTouchButton', 'touchToggleCtl', 'touchpad', 'tp-btn'];

describe('no touch pad', () => {
  it('has no #touchpad element, no pad button and no pause button of its own', () => {
    expect(DOC.getElementById('touchpad'), '#touchpad').toBeNull();
    expect(DOC.querySelector('.touchpad, .tp-side, .tp-btn, .tp-pause, [data-act]'), 'any pad button').toBeNull();
    expect(DOC.querySelectorAll('#hud button').length, 'the match HUD holds nothing to press').toBe(0);
  });

  it('has none of the pad\'s styles', () => {
    expect(CSS).not.toMatch(/\.touchpad|\.tp-(btn|dir|act|jump|attack|special|smash|pause|left|right|side)\b/);
  });

  it('has none of the code that served it (TOUCH, bindTouchControls, ...)', () => {
    for (const name of TOUCH_CODE) expect(HTML, name).not.toMatch(new RegExp(`(^|[^A-Za-z0-9_])${name}($|[^A-Za-z0-9_])`));
  });

  it('boots without any of it: none of those names exists in the running page', () => {
    const { window: w } = loadMonolith();
    for (const name of TOUCH_CODE.filter((n) => /^[A-Za-z_]+$/.test(n))) expect(w.eval(`typeof ${name}`), name).toBe('undefined');
  });

  it('lets go of the setting an earlier build saved for it, so it never comes back', () => {
    for (const saved of ['on', 'auto', 'off']) {
      const w = boot({ 'bfsi:touchMode': saved });
      expect(w.localStorage.getItem('bfsi:touchMode'), `a saved '${saved}' is removed on load`).toBeNull();
    }
    // and that one removal is the only place the old key is named: nothing writes or reads it any more
    expect(HTML.match(/bfsi:touchMode/g)).toHaveLength(1);
    expect(HTML).toMatch(/localStorage\.removeItem\('bfsi:touchMode'\)/);
  });

  it('shows no pad in a match', () => {
    const { window: w } = loadMonolith();
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=2; beginMatchNow();`);
    expect(w.eval('running')).toBe(true);
    expect(w.document.querySelectorAll('#hud button, .touchpad').length).toBe(0);
  });
});

describe('no Touch control in Settings', () => {
  let w;
  beforeAll(() => { ({ window: w } = loadMonolith()); });

  it('Settings offers Keys and Custom Music, and says nothing of touch or on-screen buttons', () => {
    const t = w.document.getElementById('options').textContent;
    expect(t).toMatch(/Keys & Custom Music/);
    expect(t).not.toMatch(/touch|on-screen|onscreen/i);
  });

  it('the Controls screen has the key map and the music switch, and no Touch switch', () => {
    const c = w.document.getElementById('controls');
    expect(c.textContent).not.toMatch(/touch|on-screen|onscreen/i);
    expect(c.querySelector('#musicToggleCtl'), 'the Music switch is still there').not.toBeNull();
    expect([...w.document.querySelectorAll('button')].filter((b) => /touch/i.test(b.textContent + ' ' + (b.getAttribute('onclick') || ''))), 'no button anywhere is a touch button').toEqual([]);
  });
});

// Kept from the file that tested the touch pad (test/touch-controls.test.js, removed with it): these three are about the KEYBOARD's
// pause, not the pad, and a computer game keeps them.
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
    // The tutorial's own Escape handler runs first and returns -- that affordance predates this change and must survive it, or there is
    // no way out of the tutorial.
    const { window: w } = loadMonolith();
    w.eval(`TUT.active = true; running = true; paused = false;
            window.dispatchEvent(new window.KeyboardEvent('keydown',{code:'Escape'}));`);
    expect(w.eval('TUT.active'), 'tutorial exited').toBe(false);
    expect(w.eval('paused'), 'and did not also pause').toBe(false);
  });
});

// The global release stays: it is for keyboards. A key held as the window loses focus never sends its keyup (it is let go in
// another window), and a host who tabbed away holding Right would walk their fighter off the stage with nobody playing.
describe('keys are let go when the window loses focus', () => {
  it('on blur', () => {
    const { window: w } = loadMonolith();
    w.eval(`down[KEYS.right] = true; down[KEYS.attack] = true;`);
    w.eval(`window.dispatchEvent(new window.Event('blur'));`);
    expect(w.eval(`down[KEYS.right] === false && down[KEYS.attack] === false`), 'blur let go of every held key').toBe(true);
  });

  it('when the tab is hidden', () => {
    const { window: w } = loadMonolith();
    w.eval(`down[KEYS.left] = true; Object.defineProperty(document, 'hidden', { value: true, configurable: true });
            window.dispatchEvent(new window.Event('visibilitychange'));`);
    expect(w.eval(`down[KEYS.left] === false`), 'a hidden tab holds nothing').toBe(true);
  });
});
