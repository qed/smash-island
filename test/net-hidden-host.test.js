import { describe, it, expect, beforeAll } from 'vitest';
import { makeRoom } from './helpers/net-room.js';

// "if the host's tab is in the background or covered, the browser pauses the game, so everyone freezes" -- "yes, fix the hidden tab
// freeze too" (the owner, 2026-10-06).
//
// A browser stops requestAnimationFrame for a tab nobody can see, and the host is the only device that simulates an online match, so
// a host who switched tabs froze the room. Here (test/helpers/net-room.js: a real host and a real client, two jsdom pages behind a
// stand-in for the relay) the host's loop() is simply never called while its tab is hidden -- what a browser does -- and the match
// has to go on anyway, on the worker clock the page starts for itself (HIDDEN HOST). jsdom has no Worker, so each test hands the
// page a stand-in whose ticks the test fires; the worker's own little program is run separately, at the end.

let room, H, A;
beforeAll(async () => { room = await makeRoom(['H', 'A']); ({ H, A } = room.pages); }, 180000);

const click = (w, selector) => w.eval(`document.querySelector(${JSON.stringify(selector)}).click()`);
const key = (w, code, isDown) => w.dispatchEvent(new w.KeyboardEvent(isDown ? 'keydown' : 'keyup', { code, bubbles: true }));
// what a browser does when the tab goes behind another one, or comes back
const setHidden = (w, hidden) => w.eval(`
  Object.defineProperty(document, 'hidden', { value: ${hidden}, configurable: true });
  Object.defineProperty(document, 'visibilityState', { value: '${hidden ? 'hidden' : 'visible'}', configurable: true });
  document.dispatchEvent(new Event('visibilitychange', { bubbles: true }));`);
// a Worker the test drives: it records what the page tells it, and the test fires its ticks
const fakeWorker = (w) => w.eval(`
  HIDDEN_HOST.worker = null;
  window.Worker = function(url){ this.url = url; this.told = []; };
  window.Worker.prototype.postMessage = function(m){ this.told.push(m); };
  URL.createObjectURL = function(){ return 'blob:hidden-host'; };`);
// One 60th of a second while the host is hidden: the worker ticks on the host (its loop() never runs), then the client, which can
// see, draws what reached it.
const hiddenFrames = (n) => {
  for (let i = 0; i < n; i++) {
    room.clock.T += 1000 / 60;
    H.eval('if (HIDDEN_HOST.worker && HIDDEN_HOST.worker.onmessage) HIDDEN_HOST.worker.onmessage({ data: 0 })');
    room.flush();
    A.eval('loop()');
    room.flush();
  }
};
const run = (n) => { for (let i = 0; i < n; i++) room.frame(); };

function hostedMatch() {
  room.reset();
  for (const w of [H, A]) setHidden(w, false);
  const code = room.host('H', 'Pen');
  room.join('A', code, 'Firey');
  click(H, '#lobbyCount button[data-v="2"]');
  room.flush();
  click(H, '#lobbyControls button');   // Start Match
  room.flush();
  expect(H.eval('running') && A.eval('running'), 'the match is running on both screens').toBe(true);
  run(20);   // under way: the client has seen it
}

describe('a host whose tab is hidden', () => {
  it('keeps the match going for everyone: the host steps it at 60 a second and the client keeps getting it', () => {
    fakeWorker(H);
    hostedMatch();
    const t0 = H.eval('hazardT'), seen0 = A.eval('NET.snapshot.t');
    H.eval('window.__draws = 0; window.__draw = draw; draw = function(){ window.__draws++; return window.__draw.apply(this, arguments); };');
    try {
      setHidden(H, true);
      expect(H.eval('HIDDEN_HOST.on'), 'the hidden host started its own clock').toBe(true);
      expect(H.eval('HIDDEN_HOST.worker.told[HIDDEN_HOST.worker.told.length - 1]'), 'a tick every 60th of a second').toBeCloseTo(1000 / 60, 5);
      hiddenFrames(60);
      expect(H.eval('hazardT') - t0, 'one second hidden is 60 frames of match').toBe(60);
      const seen = A.eval('NET.snapshot.t');
      expect(seen - seen0, 'the client kept getting the match').toBeGreaterThan(50);
      expect(H.eval('hazardT') - seen, 'and it is current: at most a few frames behind the host').toBeLessThanOrEqual(4);
      expect(H.eval('window.__draws'), 'nothing is drawn for a tab nobody sees').toBe(0);
    } finally {
      H.eval('draw = window.__draw;');
    }
  });

  it('does not step at all without the clock, as before -- the browser\'s frames are what stop', () => {
    fakeWorker(H);
    hostedMatch();
    setHidden(H, true);
    const t0 = H.eval('hazardT');
    H.eval('loop()');   // a frame that sneaks in while hidden hands over and steps nothing
    expect(H.eval('hazardT'), 'loop() leaves a hidden host\'s match to the worker').toBe(t0);
    hiddenFrames(1);
    expect(H.eval('hazardT'), 'and the worker steps it').toBe(t0 + 1);
  });

  it('catches up a late tick by a few frames, and lets a long stall go rather than racing through it', () => {
    fakeWorker(H);
    hostedMatch();
    setHidden(H, true);
    const t0 = H.eval('hazardT');
    room.clock.T += 3 * 1000 / 60;   // three frames late
    H.eval('HIDDEN_HOST.worker.onmessage({ data: 0 })');
    expect(H.eval('hazardT') - t0, 'a tick three frames late steps three').toBe(3);
    room.clock.T += 5000;   // five seconds without a tick
    H.eval('HIDDEN_HOST.worker.onmessage({ data: 0 })');
    expect(H.eval('hazardT') - t0, 'a five-second stall steps at most four, not three hundred').toBe(3 + 4);
  });

  it('lets go of the host\'s keys and pad, so the host\'s fighter stands still while they are away', () => {
    fakeWorker(H);
    hostedMatch();
    const right = H.eval('KEYS.right');
    key(H, right, true);
    expect(H.eval(`down[${JSON.stringify(right)}]`), 'Right is held').toBe(true);
    setHidden(H, true);
    expect(H.eval(`down[${JSON.stringify(right)}]`), 'the key the host was holding is let go').toBe(false);
    // a pad held right the whole time reads as nothing while hidden
    H.eval(`Object.defineProperty(navigator, 'getGamepads', { value: function(){ return [{ axes: [1, 0], buttons: [] }]; }, configurable: true });`);
    try {
      expect(H.eval('pollPad()'), 'a hidden tab reads no pad').toBe(null);
      const x0 = H.eval('fighters[0].x');
      hiddenFrames(60);
      expect(Math.abs(H.eval('fighters[0].x') - x0), 'the host\'s fighter did not walk off while they were away').toBeLessThan(40);
      setHidden(H, false);
      expect(H.eval('pollPad() && pollPad().right'), 'back on the tab, the pad reads again').toBe(true);
    } finally {
      H.eval(`delete navigator.getGamepads;`);
      key(H, right, false);
    }
  });

  it('hands the match back to the browser\'s frames when the tab is seen again: one step a frame, never two', () => {
    fakeWorker(H);
    hostedMatch();
    setHidden(H, true);
    hiddenFrames(30);
    setHidden(H, false);
    expect(H.eval('HIDDEN_HOST.on'), 'the clock is off').toBe(false);
    expect(H.eval('HIDDEN_HOST.worker.told[HIDDEN_HOST.worker.told.length - 1]'), 'and the worker was told to stop').toBe(0);
    const t0 = H.eval('hazardT');
    run(10);
    expect(H.eval('hazardT') - t0, 'ten frames are ten steps').toBe(10);
    H.eval('HIDDEN_HOST.worker.onmessage({ data: 0 })');   // a tick already on its way when the worker was stopped
    expect(H.eval('hazardT') - t0, 'a late tick after the hand-back steps nothing').toBe(10);
  });

  it('stops for a pause and picks up again when the pause ends while the tab is still hidden', () => {
    fakeWorker(H);
    hostedMatch();
    setHidden(H, true);
    hiddenFrames(5);
    H.eval('setPaused(true)');
    const t0 = H.eval('hazardT');
    hiddenFrames(10);
    expect(H.eval('hazardT'), 'paused is paused').toBe(t0);
    expect(H.eval('HIDDEN_HOST.on'), 'the clock let go').toBe(false);
    H.eval('setPaused(false)');   // loop() runs, sees the tab is hidden, and gives the match back to the clock
    expect(H.eval('HIDDEN_HOST.on'), 'the clock has the match again').toBe(true);
    hiddenFrames(10);
    expect(H.eval('hazardT') - t0, 'and steps it').toBe(10);
  });

  it('sends the last frame when the match ends while hidden, then stops its clock', () => {
    fakeWorker(H);
    hostedMatch();
    const timers = [];
    const keep = { H: H.setTimeout, A: A.setTimeout };
    H.setTimeout = A.setTimeout = (fn) => { timers.push(fn); return 0; };   // the result screen's timers wait for the test
    try {
      setHidden(H, true);
      H.eval('fighters[1].stocks = 1; fighters[1].x = -300;');   // p2 over the blast line on their last stock
      let n = 0;
      while (H.eval('running') && n++ < 600) hiddenFrames(1);
      expect(H.eval('running'), 'the match ended on the hidden host').toBe(false);
      expect(A.eval('NET.snapshot.t'), 'the client got the very last frame').toBe(H.eval('hazardT'));
      hiddenFrames(1);
      expect(H.eval('HIDDEN_HOST.on'), 'the clock stops with the match').toBe(false);
    } finally {
      H.setTimeout = keep.H; A.setTimeout = keep.A;
    }
  });

  it('falls back to the page\'s own timer where no worker can be made', () => {
    H.eval('HIDDEN_HOST.worker = null; window.Worker = undefined;');
    hostedMatch();
    setHidden(H, true);
    expect(H.eval('HIDDEN_HOST.on && HIDDEN_HOST.timer !== 0'), 'a timer runs the clock instead').toBe(true);
    setHidden(H, false);
    expect(H.eval('HIDDEN_HOST.timer'), 'and is cleared when the tab is seen again').toBe(0);
  });
});

describe('everyone else', () => {
  it('a solo player\'s hidden tab still pauses: no clock starts', () => {
    fakeWorker(H);
    room.reset();
    setHidden(H, false);
    H.eval(`SETTINGS.mode = 'ffa'; SETTINGS.count = 2; startMatch();`);
    expect(H.eval('running && NET.role'), 'a solo match').toBe('solo');
    setHidden(H, true);
    expect(H.eval('HIDDEN_HOST.on'), 'nothing runs a solo match behind the player\'s back').toBe(false);
    setHidden(H, false);
    H.eval('running = false;');
  });

  it('a client\'s hidden tab starts no clock (the host runs the match) and holds nothing', () => {
    fakeWorker(A);
    hostedMatch();
    const right = A.eval('KEYS.right');
    key(A, right, true);
    setHidden(A, true);
    expect(A.eval('HIDDEN_HOST.on'), 'a client never simulates').toBe(false);
    expect(A.eval(`down[${JSON.stringify(right)}]`), 'the client let go').toBe(false);
    setHidden(A, false);
  });

  it('a window that loses focus lets go of every key (the release happens in another window, so no keyup ever came)', () => {
    room.reset();
    const right = H.eval('KEYS.right');
    key(H, right, true);
    H.eval(`window.dispatchEvent(new Event('blur'))`);
    expect(H.eval(`down[${JSON.stringify(right)}]`)).toBe(false);
  });
});

describe('the worker\'s program', () => {
  it('ticks at the period it is told and stops when told 0', () => {
    const src = H.eval('HIDDEN_HOST.src');
    const posts = [], intervals = [], cleared = [];
    const onmessage = new Function('postMessage', 'setInterval', 'clearInterval', `var onmessage; ${src}; return onmessage;`)(
      (m) => posts.push(m),
      (fn, ms) => { intervals.push({ fn, ms }); return intervals.length; },
      (id) => cleared.push(id));
    onmessage({ data: 1000 / 60 });
    expect(intervals.map((i) => i.ms), 'one interval at the period').toEqual([1000 / 60]);
    intervals[0].fn(); intervals[0].fn();
    expect(posts, 'each tick is a message to the page').toEqual([0, 0]);
    onmessage({ data: 0 });
    expect(cleared, 'told 0, it clears its interval').toContain(1);
    expect(intervals.length, 'and starts no other').toBe(1);
    onmessage({ data: 1000 / 60 });
    expect(intervals.length, 'told again, it ticks again').toBe(2);
  });
});
