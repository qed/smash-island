import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from './prng.js';

// A real online match, headless: one jsdom realm is the HOST and another is a CLIENT, both running
// the unmodified artifacts/V1/index.html, joined by fake sockets that route the way
// relay/src/protocol.js does (state and start go host -> clients, input goes client -> host), in
// order, with optional latency and jitter. performance.now is a virtual clock that both realms share,
// so every time gate in the netcode (the snapshot rate, the input heartbeat) behaves as it does at
// 60 fps. Each realm gets its own window size, because W and H are per device and the two ends of a
// real match rarely match.
//
// Built for "camera is weird on multiplayer, there is an input delay sometimes" (2026-09-27): the
// tests that use it measure what a player on each end actually sees and how long a press takes.

const HTML = readFileSync('artifacts/V1/index.html', 'utf8');

function stubCtx(w, h) {
  const grad = { addColorStop() {} };
  return new Proxy({}, {
    get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 })
      : p === 'canvas' ? { width: w, height: h }
      : p === 'getImageData' ? () => ({ data: [] })
      : (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createPattern' || p === 'createConicGradient') ? () => grad
      : () => {}),
    set: () => true,
  });
}

export function bootRealm(w, h, seed, clock) {
  const dom = new JSDOM(HTML, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(win) {
      win.HTMLCanvasElement.prototype.getContext = () => stubCtx(w, h);
      win.Math.random = mulberry32(seed);
      win.requestAnimationFrame = () => 0;
      win.cancelAnimationFrame = () => {};
      Object.defineProperty(win, 'innerWidth', { value: w, configurable: true });
      Object.defineProperty(win, 'innerHeight', { value: h, configurable: true });
      Object.defineProperty(win.performance, 'now', { value: () => clock.T, configurable: true });
      win.setTimeout = () => 0;   // banners and the boss respawn delay are not what these tests look at
    },
  });
  return dom.window;
}

export async function makePair(opts = {}) {
  const { hostW = 1280, hostH = 720, cliW = 1280, cliH = 720, mode = 'ffa', stageId = 'goiky', mapSize = 'normal',
    count = 2, latency = 0, jitter = 0, stocks = 3, teamKey = null, hostFighter = 'Pen', cliFighter = 'Firey' } = opts;
  const clock = { T: 0 };
  let jr = 12345; const rnd = () => { jr = (jr * 1103515245 + 12345) & 0x7fffffff; return jr / 0x7fffffff; };
  const lastAt = { C: 0, H: 0 };
  // in-order delivery, like one TCP stream per direction: jitter can delay a message, never reorder it
  const arrive = (to) => (lastAt[to] = Math.max(lastAt[to], clock.T + latency + rnd() * jitter));
  const Hh = bootRealm(hostW, hostH, 11, clock), Cc = bootRealm(cliW, cliH, 22, clock);
  await Hh.eval('profileReady'); await Cc.eval('profileReady');
  const q = [];
  const wire = { state: [], input: [], inputAt: [] };
  const players = [{ id: 'h', name: hostFighter, isHost: true }, { id: 'c', name: cliFighter, isHost: false }];
  Hh.__out = (s) => { if (s.startsWith('{"t":"state"') && s.indexOf('"lobby"') < 0) wire.state.push(s.length); q.push({ at: arrive('C'), to: 'C', data: s }); };
  Cc.__out = (s) => { if (s.startsWith('{"t":"input"')) { wire.input.push(s); wire.inputAt.push(clock.T); } q.push({ at: arrive('H'), to: 'H', data: s }); };
  for (const [w, role, idx] of [[Hh, 'host', 0], [Cc, 'client', 1]]) {
    w.eval(`chosen = ROSTER.find(function(r){ return r.name===${JSON.stringify(role === 'host' ? hostFighter : cliFighter)}; });
      NET.role=${JSON.stringify(role)}; NET.myIdx=${idx}; NET.players=${JSON.stringify(players)};
      NET.myId=${JSON.stringify(role === 'host' ? 'h' : 'c')};
      NET.ws={readyState:1, bufferedAmount:0, send:function(s){ window.__out(s); }, close:function(){}};`);
  }
  Hh.eval(`SETTINGS.mode=${JSON.stringify(mode)}; SETTINGS.count=${count}; SETTINGS.stocks=${stocks}; SETTINGS.itemRate=0;
    SETTINGS.mapSize=${JSON.stringify(mapSize)}; ${teamKey ? `SETTINGS.teamKey=${JSON.stringify(teamKey)};` : ''}
    stage = STAGES.find(function(s){ return s.id===${JSON.stringify(stageId)}; }) || STAGES[0];
    NET.startAsHost();`);
  const pump = () => {
    for (let i = 0; i < q.length;) {
      if (q[i].at <= clock.T) { const m = q.splice(i, 1)[0]; (m.to === 'C' ? Cc : Hh).NET.onMessage(JSON.parse(m.data)); }
      else i++;
    }
  };
  pump();
  // The client's human is driven through real key events, so whatever the page does on a keydown runs.
  const key = (code, isDown) => Cc.dispatchEvent(new Cc.KeyboardEvent(isDown ? 'keydown' : 'keyup', { code, bubbles: true }));
  const press = (name) => key(Cc.eval(`KEYS[${JSON.stringify(name)}]`), true);
  const release = (name) => key(Cc.eval(`KEYS[${JSON.stringify(name)}]`), false);
  const hold = (names) => { for (const n of ['left', 'right', 'jump', 'down', 'attack', 'special', 'smash']) { const want = names.includes(n); const is = Cc.eval(`!!down[KEYS[${JSON.stringify(n)}]]`); if (want !== is) (want ? press : release)(n); } };
  const view = (w, idxExpr) => w.eval(`(function(){ var me=fighters.find(function(f){ return f.idx===${idxExpr}; });
      var z = (typeof viewZoom==='function') ? viewZoom() : (scrolls()?CAM_ZOOM:1);
      var r = {camX:camX, camY:camY, W:W, H:H, WW:WW, WH:WH, z:z};
      if(me){ r.x=me.x; r.y=me.y; r.dead=!!me.dead; r.sx=W/2+z*(me.x-camX-W/2); r.sy=H/2+z*(me.y-camY-H/2); }
      r.visL = camX + W/2 - (W/2)/z; r.visR = camX + W/2 + (W/2)/z; r.visT = camY + H/2 - (H/2)/z; r.visB = camY + H/2 + (H/2)/z;
      r.gy = groundY(); r.gsy = H/2 + z*(r.gy - camY - H/2);
      return r; })()`);
  const tick = () => { clock.T += 1000 / 60; pump(); };
  // One 60 fps frame on both ends: messages that have arrived are delivered, the host steps and
  // broadcasts, the client draws, and anything either end sent is delivered when its time comes.
  function frame(heldKeys = null, hostPre = null) {
    tick();
    if (heldKeys) hold(heldKeys);
    if (hostPre) Hh.eval(hostPre);
    Hh.eval('loop()');
    Cc.eval('loop()');
    pump();
    return { T: clock.T, host: view(Hh, '0'), cli: view(Cc, 'NET.myIdx') };
  }
  return { Hh, Cc, frame, tick, pump, press, release, hold, wire, clock, view };
}

// What the client's player sees across a run of frames, in screen px.
export function summarize(frames, who = 'cli') {
  const f = frames.map((x) => x[who]).filter((r) => r.sx != null);
  const W = f[0].W, H = f[0].H;
  const on = f.filter((r) => !r.dead && r.sx >= 0 && r.sx <= W && r.sy >= 0 && r.sy <= H).length;
  const jumps = [], camJ = [];
  for (let i = 1; i < f.length; i++) {
    jumps.push(Math.hypot(f[i].sx - f[i - 1].sx, f[i].sy - f[i - 1].sy));
    camJ.push(Math.hypot(f[i].camX - f[i - 1].camX, f[i].camY - f[i - 1].camY) * f[i].z);
  }
  const voidX = f.map((r) => Math.max(0, -r.visL) + Math.max(0, r.visR - r.WW));
  const voidY = f.map((r) => Math.max(0, -r.visT) + Math.max(0, r.visB - r.WH));
  const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
  return {
    frames: f.length, onScreenPct: 100 * on / f.length,
    fighterStepP95: pct(jumps, 0.95), fighterStepMax: Math.max(...jumps),
    camStepMax: Math.max(...camJ), camStillFrames: camJ.filter((c) => c === 0).length,
    voidXMax: Math.max(...voidX), voidYMax: Math.max(...voidY),
  };
}
