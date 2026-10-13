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

// FIXED STEP: "is this game's speed based on fps? if so, change it." (the owner, 2026-10-13). loop() used to run one step() per animation
// frame, so a 144 Hz screen played the match 2.4x fast, and on a hosted match the host's screen set the speed for the whole room. It runs
// on a clock now (STEP_CLOCK): 60 steps a real second whatever the screen does, a late frame owing two, a stall dropped rather than
// raced through. Here the room's fake clock stands for the screen: each "frame" moves it by 1/hz of a second, then loop() runs.
describe('the fixed step: the match runs 60 steps a second, whatever the screen does', () => {
  const frames = (hz, seconds, who = [H, A]) => {
    for (let i = 0; i < Math.round(hz * seconds); i++) {
      room.clock.T += 1000 / hz;
      for (const w of who) { w.eval('loop()'); room.flush(); }
    }
  };

  it.each([[30], [60], [120], [144], [240]])('a %i Hz screen: the host steps 60 times a second and draws once a frame', (hz) => {
    hostedMatch();
    H.eval('window.__draws = 0; window.__draw0 = draw; draw = function(){ window.__draws++; return window.__draw0.apply(this, arguments); };');
    try {
      const t0 = H.eval('hazardT');
      frames(hz, 2);
      const steps = H.eval('hazardT') - t0, draws = H.eval('window.__draws');
      expect(Math.abs(steps - 120), `${steps} steps in 2 s`).toBeLessThanOrEqual(2);
      expect(draws, 'a frame that owes no step still draws').toBe(hz * 2);
    } finally { H.eval('draw = window.__draw0'); }
  });

  it('a long stall is dropped, not raced through: no burst of steps after a gap', () => {
    hostedMatch();
    frames(60, 1);
    let t0 = H.eval('hazardT');
    room.clock.T += 100;   // a 100 ms hitch: the cap, four steps at most
    H.eval('loop()');
    expect(H.eval('hazardT') - t0, 'a 100 ms stall owes the catch-up cap and no more').toBeLessThanOrEqual(4);
    t0 = H.eval('hazardT');
    room.clock.T += 5000;   // the tab was away for 5 s
    H.eval('loop()');
    expect(H.eval('hazardT') - t0, 'a gap over 250 ms restarts the clock: nothing owed').toBe(0);
    t0 = H.eval('hazardT');
    frames(60, 1);
    expect(Math.abs(H.eval('hazardT') - t0 - 60), 'and it carries on at 60 a second').toBeLessThanOrEqual(1);
  });

  it("a client's particles run at 60 ticks a second on a 144 Hz screen (they ran once per animation frame)", () => {
    hostedMatch();
    A.eval('particles = [{ x: 0, y: 0, vx: 1, vy: 0, life: 200, color: "#fff", r: 2 }]');
    frames(144, 1, [A]);
    const p = A.eval('particles[0]');
    expect(200 - p.life, 'a second at 144 Hz is 60 ticks of life, not 144').toBeGreaterThanOrEqual(58);
    expect(200 - p.life).toBeLessThanOrEqual(62);
    expect(Math.round(p.x), 'and it moved 60 px at vx = 1').toBe(200 - p.life);
  });
});

// RENDER INTERPOLATION (the owner: "smoother on higher fps, but not faster"). On a screen faster than the steps, loop() draws each
// moving thing a fraction of the way from where it was before the latest step to where it is now, around draw() only, and puts the
// true numbers back. The same room, the same fake clock.
describe('render interpolation: smoother on a fast screen, never faster', () => {
  // `hz` frames a second for `seconds` on the host alone, with draw() watched: [hazardT, drawn x, true x after the frame]
  const watch = (hz, seconds, extra = '') => {
    H.eval(`window.__seen = []; window.__draw0 = draw; draw = function(){ var f = fighters[0]; window.__seen.push([hazardT, f.x, f.y, camX]); return window.__draw0.apply(this, arguments); }; ${extra}`);
    const out = [];
    try {
      for (let i = 0; i < Math.round(hz * seconds); i++) {
        room.clock.T += 1000 / hz;
        H.eval('loop()');
        const seen = H.eval('window.__seen[window.__seen.length - 1]');
        out.push({ step: seen[0], drawnX: seen[1], drawnY: seen[2], drawnCam: seen[3], trueX: H.eval('fighters[0].x'), trueStep: H.eval('hazardT') });
      }
    } finally { H.eval('draw = window.__draw0'); }
    return out;
  };
  const runRight = (on) => key(H, H.eval('KEYS.right'), on);

  it('at 144 Hz the picture moves on frames that ran no step, in order, and the true positions only move with a step', () => {
    hostedMatch();
    runRight(true);
    const f = watch(144, 1).slice(12);   // (the screen's pace is learned over the first few frames)
    runRight(false);
    const still = f.filter((x, i) => i > 0 && x.trueStep === f[i - 1].trueStep);
    expect(still.length, 'a 144 Hz screen has frames with no step').toBeGreaterThan(40);
    const moved = still.filter((x) => { const i = f.indexOf(x); return x.drawnX !== f[i - 1].drawnX; });
    expect(moved.length / still.length, 'and the picture still moves on nearly all of them').toBeGreaterThan(0.9);
    for (let i = 1; i < f.length; i++) {
      expect(f[i].drawnX, 'running right: never drawn going back').toBeGreaterThanOrEqual(f[i - 1].drawnX - 1e-9);
      if (f[i].trueStep === f[i - 1].trueStep) expect(f[i].trueX, 'the true x moves only when a step ran').toBe(f[i - 1].trueX);
    }
  });

  it('is never faster: the true step rate stays 60 a second, and the picture covers the same ground', () => {
    hostedMatch();
    runRight(true);
    const t0 = H.eval('hazardT'), x0 = H.eval('fighters[0].x');
    const f = watch(144, 0.5);
    runRight(false);
    expect(Math.abs(H.eval('hazardT') - t0 - 30), 'half a second is 30 steps').toBeLessThanOrEqual(1);
    const last = f[f.length - 1];
    expect(last.drawnX - x0, 'the picture is at most one step behind the true position').toBeLessThanOrEqual(last.trueX - x0 + 1e-9);
    expect(last.trueX - last.drawnX, 'and no more than a step (6.4 px) behind').toBeLessThanOrEqual(7);
  });

  it('a jump of more than 120 px in a step is drawn where it is: a respawn does not smear across the screen', () => {
    const run = (jump) => {
      hostedMatch();
      H.eval(`INTERP_ST.jump = ${jump}; fighters[0].controller = 'still'; fighters[0].x = 300; window.__hop = hazardT + 12;
        window.__step0 = step; step = function(){ window.__step0(); if(hazardT === window.__hop){ window.__from = fighters[0].x; fighters[0].x += 500; } };`);
      try {
        const f = watch(144, 0.4);
        const from = H.eval('window.__from');
        return f.filter((x) => x.drawnX > from + 60 && x.drawnX < from + 500 - 60).length;
      } finally { H.eval('step = window.__step0; INTERP_ST.jump = 120;'); }
    };
    expect(run(120), 'no frame is drawn between where it was and where it landed').toBe(0);
    expect(run(1e9), 'with the guard lifted the same teleport is swept across the screen').toBeGreaterThan(0);
  });

  it('a 60 Hz screen draws the newest step (no blend, no added delay), and a draw() called any other way draws the true positions', () => {
    hostedMatch();
    runRight(true);
    const f = watch(60, 0.5);
    runRight(false);
    for (const x of f) expect(x.drawnX, 'drawn where the sim has it').toBe(x.trueX);
    H.eval('window.__seen = []; window.__draw0 = draw; draw = function(){ window.__seen.push(fighters[0].x); return window.__draw0.apply(this, arguments); };');
    room.clock.T += 1000 / 144;
    const x = H.eval('fighters[0].x');
    H.eval('draw()');
    expect(H.eval('window.__seen[0]'), 'a direct draw() is untouched').toBe(x);
    H.eval('draw = window.__draw0');
  });
});
