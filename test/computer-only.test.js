import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { parse } from 'acorn';
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
// focus and at a new screen or match, and the rules that wrap or shrink a card inside an ordinary laptop window are untouched.

const HTML = readFileSync('artifacts/V1/index.html', 'utf8');
const DOC = new JSDOM(HTML).window.document;   // parsed, never run: the markup and the styles exactly as shipped
const CSS = [...DOC.querySelectorAll('style')].map((s) => s.textContent).join('\n');

// The page, booted in jsdom, with whatever a player's browser had already saved.
function boot(seed = {}, url = 'http://localhost/') {
  const dom = new JSDOM(HTML, {
    url, runScripts: 'dangerously', pretendToBeVisual: true,
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

describe('no phone-only layout', () => {
  const MEDIA = [...CSS.matchAll(/@media\s*([^{]+)\{/g)].map((m) => m[1].trim());

  it('has no @media rule written to fit a phone: no max-width, max-height, pointer, hover or orientation query', () => {
    expect(MEDIA.length, 'the page does carry its one @media rule').toBeGreaterThan(0);
    for (const q of MEDIA) expect(q, '@media ' + q).not.toMatch(/max-width|max-height|pointer|hover|orientation|device-(width|height)|\bwidth\s*[<>]|\bheight\s*[<>]/);
  });

  it('keeps the @media that is for everybody: the reduced-motion preference', () => {
    expect(MEDIA).toContain('(prefers-reduced-motion: reduce)');
  });

  it('asks the browser nothing about a phone: no matchMedia, no touch points, no pointer type', () => {
    expect(HTML).not.toMatch(/matchMedia\s*\(/);
    expect(HTML).not.toMatch(/maxTouchPoints|pointer:\s*coarse|hover:\s*none|pointerType\s*[=!]==?\s*['"]touch/);
  });

  it('reacts to no touch: no touch event, no touch-action, no tap highlight', () => {
    expect(HTML).not.toMatch(/touchstart|touchmove|touchend|touchcancel|ontouch|\.touches\b|TouchEvent|touch-action|tap-highlight/);
  });

  it('has no size that only a phone-width screen made fluid (the room code was clamp(40px,15vw,68px), How to Play\'s cards min(150px,40vw))', () => {
    expect(CSS).not.toMatch(/\b(15|40)vw\b/);
    expect(CSS).toMatch(/\.inv-code\{[^}]*font-size:68px/);
    expect(CSS).toMatch(/\.tut-grid\{[^}]*minmax\(150px,1fr\)/);
  });

  it('still wraps and shrinks inside an ordinary laptop window: the rules that are not phone-only stay', () => {
    expect(CSS).toMatch(/\.movecard\{[^}]*width:100%/);
    expect(CSS).toMatch(/\.lobbyinvite\{[^}]*width:min\(460px,100%\)/);
    expect(CSS).toMatch(/\.vaultgrid\{[^}]*flex-wrap:wrap/);
    expect(CSS).toMatch(/\.edcanvas\{[^}]*max-width:96vw/);
    expect(CSS).toMatch(/\.row\{[^}]*flex-wrap:wrap/);
  });
});

describe('no phone-only page tags', () => {
  it('has no apple-mobile-web-app-*, mobile-web-app-capable, apple-touch-icon, format-detection, HandheldFriendly or MobileOptimized', () => {
    expect(DOC.querySelector('meta[name^="apple-mobile-web-app"], meta[name="mobile-web-app-capable"], meta[name="format-detection"], meta[name="HandheldFriendly"], meta[name="MobileOptimized"], link[rel^="apple-touch-icon"]')).toBeNull();
    expect(HTML).not.toMatch(/apple-mobile-web-app|mobile-web-app-capable|apple-touch-icon|format-detection|HandheldFriendly|MobileOptimized/i);
  });

  it('leaves the plain viewport tag alone', () => {
    expect([...DOC.querySelectorAll('meta[name="viewport"]')].map((m) => m.getAttribute('content'))).toEqual(['width=device-width, initial-scale=1.0']);
  });

  it('has no attribute only a phone\'s on-screen keyboard or iPhone reads: autocapitalize, autocorrect, enterkeyhint, inputmode, playsinline', () => {
    expect(DOC.querySelector('[autocapitalize], [autocorrect], [enterkeyhint], [inputmode], [playsinline]')).toBeNull();
    expect(HTML, 'the replay video is built in script, so the source is checked too').not.toMatch(/autocapitalize|autocorrect|enterkeyhint|inputmode|playsinline/);
  });
});

// WHAT A PLAYER READS: the markup (text, tooltips, labels, placeholders), the head (title, descriptions, link previews, structured data)
// and every string the script can put on screen. The script is PARSED, so a comment, which nobody reads, is not taken for text.
// "Tap" is "click" (the tap of a key is the keyboard's own word, the smash's, and lives only in comments), and no phone or tablet is
// named as something the player holds. The game's own cast is not a phone: the MePhones and the keynote shelf are characters and props,
// so what is checked is a device phrase ("your phone", "touch screen", "phones and tablets"), not the word.
const TAP = /\btap(s|ped|ping)?\b/i;
const PHONE_WORDING = new RegExp([
  String.raw`\b(smartphones?|iphone|ipad|android)\b`,
  String.raw`touch ?screens?|touch ?pads?|touch controls?`,
  String.raw`on-screen (buttons?|pads?|controls?|keyboards?)`,
  String.raw`mobile (device|browser|phone|app|friendly)`,
  String.raw`\b(on|from|with|for) (a|your|their) (phone|tablet)\b`,
  String.raw`\b(your|their) (phone|tablet)\b`,
  String.raw`phone'?s? (share sheet|keyboard|screen|browser)`,
  String.raw`\bphones? (and|or) tablets?\b|\btablets? (and|or) phones?\b`,
  String.raw`\bswipe (to|left|right)\b`,
].join('|'), 'i');

function markupTexts() {
  const body = DOC.body.cloneNode(true);
  body.querySelectorAll('script, style').forEach((e) => e.remove());
  const out = [body.textContent, DOC.title];
  for (const el of body.querySelectorAll('[title], [aria-label], [placeholder], [alt], [value]')) {
    for (const a of ['title', 'aria-label', 'placeholder', 'alt', 'value']) if (el.hasAttribute(a)) out.push(el.getAttribute(a));
  }
  for (const m of DOC.head.querySelectorAll('meta[content]')) out.push(m.getAttribute('content'));
  const ld = DOC.querySelector('script[type="application/ld+json"]');
  if (ld) out.push(ld.textContent);
  return out;
}

// Every string literal and template piece in the game's script, from the syntax tree (an explicit stack: some of the concatenations are deep).
function scriptStrings() {
  const src = [...DOC.querySelectorAll('script:not([src]):not([type])')].map((e) => e.textContent).join('\n');
  const ast = parse(src, { ecmaVersion: 'latest', sourceType: 'script' });
  const out = [], stack = [ast];
  while (stack.length) {
    const n = stack.pop();
    if (Array.isArray(n)) { for (const x of n) if (x && typeof x === 'object') stack.push(x); continue; }
    if (n.type === 'Literal' && typeof n.value === 'string') out.push(n.value);
    else if (n.type === 'TemplateElement') out.push(n.value.cooked != null ? n.value.cooked : n.value.raw);
    for (const k in n) { const v = n[k]; if (v && typeof v === 'object') stack.push(v); }
  }
  // not words: the page's own pictures, inlined as data
  return out.filter((t) => !/^data:/.test(t) && !(t.length > 60 && !/\s/.test(t)));
}

describe('no tap and no phone wording in anything a player reads', () => {
  let markup, strings;
  beforeAll(() => { markup = markupTexts(); strings = scriptStrings(); }, 60000);

  it('finds the text it checks: the markup, the head and thousands of script strings', () => {
    expect(markup.join(' ')).toMatch(/How to Play/);
    expect(markup.join(' ')).toMatch(/Battle for Smash Island/);
    expect(strings.length).toBeGreaterThan(5000);
    expect(strings.join('\n')).toMatch(/Boss Rush/);
  });

  it('the markup and the head say click, never tap', () => {
    expect(markup.filter((t) => TAP.test(t))).toEqual([]);
  });

  it('...and name no phone, tablet or touch screen as something the player holds', () => {
    expect(markup.filter((t) => PHONE_WORDING.test(t))).toEqual([]);
    expect(DOC.head.innerHTML, 'nothing in the head says phone, tablet or mobile (the link previews and the page description)').not.toMatch(/\b(phones?|tablets?|mobile)\b/i);
  });

  it('every string the script can show says click, never tap', () => {
    expect(strings.filter((t) => TAP.test(t))).toEqual([]);
  });

  it('...and names no phone, tablet or touch screen as something the player holds', () => {
    expect(strings.filter((t) => PHONE_WORDING.test(t))).toEqual([]);
  });

  it('How to Play, Controls and Settings give no touch instructions', () => {
    for (const id of ['tutorial', 'controls', 'options']) {
      const t = DOC.getElementById(id).textContent;
      expect(t, id).not.toMatch(TAP);
      expect(t, id).not.toMatch(PHONE_WORDING);
    }
    expect(DOC.getElementById('tutorial').textContent, 'it still teaches the keys').toMatch(/Smash: press V once/);
  });

  it('the huddle, the World Cup hub and the invite link say click', () => {
    expect(DOC.getElementById('planChatNote').textContent).toMatch(/^Click a phrase/);
    expect(strings.some((t) => t.includes('Click \u25b6 to watch a match live:')), 'World Cup hub').toBe(true);
    expect(strings.some((t) => t.includes('Click \u25b6 to watch a knockout match live:')), 'the knockout fixtures').toBe(true);
    expect(strings.some((t) => t.includes('Click a phrase below if you want it another way.')), "the teammate's opening line").toBe(true);
    const w = boot({}, 'http://localhost/#room=ABCD');
    const status = w.document.getElementById('lobbyStatus').textContent;
    expect(status, 'the invite link prefilled the room').toMatch(/ABCD/);
    expect(status).toMatch(/click Join Room/);
    expect(status).not.toMatch(TAP);
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

// syncTouchControls did one more thing, for every player and not only a touch screen's: at each new screen and at the start of a match it
// let go of every mapped key still down. That is a keyboard's business too (a smash held as the player pressed R would otherwise act on
// the first frame of the next match; test/running-race.test.js leaves one held between races), so it stayed, as releaseMappedKeys.
describe('a new screen and a new match start with no mapped key held', () => {
  it('a key still down from the last screen is let go when the next one comes up', () => {
    const { window: w } = loadMonolith();
    w.eval(`down[KEYS.smash] = true; down[KEYS.right] = true; go('title');`);
    expect(w.eval(`down[KEYS.smash] === false && down[KEYS.right] === false`), 'go() let go of the mapped keys').toBe(true);
  });

  it('...and when a match begins', () => {
    const { window: w } = loadMonolith();
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=2; down[KEYS.smash] = true; down[KEYS.attack] = true; beginMatchNow();`);
    expect(w.eval('running')).toBe(true);
    expect(w.eval(`down[KEYS.smash] === false && down[KEYS.attack] === false`), 'the new match began with nothing held').toBe(true);
    expect(w.eval(`!fighters.find(function(f){ return f.you; })._smQ`), 'so no smash was started on its first frame').toBe(true);
  });

  it('a key pressed after the match began is a key: the keyboard still plays', () => {
    const { window: w } = loadMonolith();
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=2; beginMatchNow();`);
    w.dispatchEvent(new w.KeyboardEvent('keydown', { code: w.eval('KEYS.right') }));
    expect(w.eval(`down[KEYS.right]`)).toBe(true);
    w.dispatchEvent(new w.KeyboardEvent('keyup', { code: w.eval('KEYS.right') }));
    expect(w.eval(`down[KEYS.right]`)).toBe(false);
  });
});
