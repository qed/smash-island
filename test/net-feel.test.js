import { describe, it, expect } from 'vitest';
import { makePair, summarize } from './helpers/net-pair.js';
import { loadMonolith } from './helpers/load-monolith.js';

// "camera is weird on multiplayer, there is an input delay sometimes. I think this is what was happening on boss rush
// before." (2026-09-27)
//
// Every test here plays a real online match headlessly -- a host realm and a client realm running the game, joined by
// fake sockets that route like the relay (test/helpers/net-pair.js) -- and MEASURES what the owner described: where
// the client's camera points and how it moves, how the client's fighter moves between snapshots, how many bytes a
// snapshot costs, and how many frames pass between a client's press and the host acting on it. The numbers the
// unmodified build (1e6b785) produced on this same harness, with the same runs, are quoted beside each bound.

const T = 240000;   // two realms of a 17k-line game, stepped frame by frame; the machine may be busy
const walk = (i) => { const k = (i % 160) < 80 ? ['left'] : ['right']; if (i % 40 === 5) k.push('jump'); return k; };
const run = (p, n, keys = walk, hostPre = null) => { const out = []; for (let i = 0; i < n; i++) out.push(p.frame(keys(i), hostPre)); return out; };

describe("a client's camera is its own", () => {
  it('follows its own fighter on a scrolling FFA map, with no empty space past the edges', async () => {
    // Before: the client drew the HOST's camera. Its own fighter was on its screen 0% of the time here, and the view
    // showed 91 px of backdrop past the world's side and 70 px past its top or bottom.
    const p = await makePair({ mode: 'ffa', stageId: 'grandplains', count: 2 });
    const s = summarize(run(p, 240).slice(4));
    expect(s.onScreenPct).toBe(100);
    expect(s.voidXMax).toBeLessThan(0.5);
    expect(s.voidYMax).toBeLessThan(0.5);
    // and it pans every frame, like the host's: it used to stand still on 222 of 236 frames and then jump 27 px
    expect(s.camStillFrames).toBeLessThan(40);
  }, T);

  it('Teams: zoom-aware clamps (no backdrop under the floor or past the wall) and smooth, per-frame movement', async () => {
    // Before: 140 px of empty space below the floor at 1280x720, 210 px at 1920x1080, and 249 px past the side wall in
    // 2v2 (a zoom-1 clamp), and the camera stood still on 130 of 196 frames, then moved in steps up to 26 px.
    for (const [cliW, cliH] of [[1280, 720], [1920, 1080]]) {
      const p = await makePair({ mode: 'teams', count: 2, teamKey: '1v1', cliW, cliH });
      const s = summarize(run(p, 200).slice(4));
      expect(s.onScreenPct).toBe(100);
      expect(s.voidXMax, `${cliW}x${cliH}`).toBeLessThan(0.5);
      expect(s.voidYMax, `${cliW}x${cliH}`).toBeLessThan(0.5);
      expect(s.camStepMax, 'eased like the host, never a 20 Hz jump').toBeLessThan(10);
    }
  }, T);

  it("Boss Rush between different windows: the host's whole arena, centred, floor on screen", async () => {
    // Before, host 1920x1080 and client 1280x720: the client zoomed to 0.72 around the wrong centre, 391 px of the
    // arena were cut off on the right, the ground line was drawn at y=738 on a 720 px screen, and the client's
    // fighter was on its screen 52% of the time. A client BIGGER than the host drew the arena in its top-left corner,
    // with 640 px of nothing to its right and 360 px below.
    for (const sizes of [{ hostW: 1920, hostH: 1080, cliW: 1280, cliH: 720 }, { hostW: 1280, hostH: 720, cliW: 1920, cliH: 1080 }, { hostW: 1280, hostH: 720, cliW: 1024, cliH: 600 }]) {
      const p = await makePair({ mode: 'boss', count: 2, ...sizes });
      const frames = run(p, 90).slice(4);
      const s = summarize(frames);
      const v = frames[frames.length - 1].cli;
      const tag = JSON.stringify(sizes);
      expect(s.onScreenPct, tag).toBe(100);
      expect(v.gsy, tag + ' ground line on screen').toBeGreaterThan(0);
      expect(v.gsy, tag + ' ground line on screen').toBeLessThan(v.H);
      // all of the host's world is in view (nothing cut off), and it is centred
      expect(v.visL, tag).toBeLessThanOrEqual(0.5);
      expect(v.visR, tag).toBeGreaterThanOrEqual(v.WW - 0.5);
      expect(v.visT, tag).toBeLessThanOrEqual(0.5);
      expect(v.visB, tag).toBeGreaterThanOrEqual(v.WH - 0.5);
      expect(Math.abs((v.visL + v.visR) / 2 - v.WW / 2), tag).toBeLessThan(1);
      expect(Math.abs((v.visT + v.visB) / 2 - v.WH / 2), tag).toBeLessThan(1);
    }
  }, T);

  it("marks the client's own fighter as 'you', not the host's", async () => {
    // Before: every client's gold marker, HUD card and minimap highlight were on fighter 0, the host's.
    const p = await makePair({ mode: 'ffa', stageId: 'goiky', count: 3 });
    run(p, 12);
    const r = p.Cc.eval(`({ you: fighters.filter(function(f){ return f.you; }).map(function(f){ return f.idx; }),
      card: Array.prototype.map.call(document.querySelectorAll('.pcard.you'), function(c){ return +c.dataset.i; }) })`);
    expect(r.you).toEqual([1]);
    expect(r.card).toEqual([1]);
  }, T);

  it('pans (never cuts) to a respawn or a carry, and watches a teammate once its own fighter is out', async () => {
    // Before: a 3000 px carry moved the Teams client camera 1910 px in one frame, and after the last stock the camera
    // cut to the lowest-index fighter still standing on ANY team.
    const p = await makePair({ mode: 'teams', count: 4, teamKey: '2v2' });
    run(p, 30, () => []);
    const before = p.Cc.eval('({camX:camX, camY:camY})');
    p.Hh.eval('fighters[1].x = Math.min(WW-100, fighters[1].x + 1500);');
    const cams = run(p, 60, () => []).map((f) => f.cli);
    let maxStep = 0, prev = before;
    for (const c of cams) { maxStep = Math.max(maxStep, Math.hypot(c.camX - prev.camX, c.camY - prev.camY)); prev = c; }
    expect(maxStep, 'the biggest one-frame move is the 0.12 ease of the jump, not the jump').toBeLessThan(0.13 * 1500 + 5);
    const last = cams[cams.length - 1];
    expect(Math.abs(last.sx - last.W / 2), 'and after a second it is back on the fighter').toBeLessThan(last.W / 2);
    // out of stocks: follow a teammate, not an enemy
    p.Hh.eval('fighters[1].stocks = 0; fighters[1].dead = true;');
    run(p, 10, () => []);
    const r = p.Cc.eval(`(function(){ var me = fighters.find(function(f){ return f.idx===NET.myIdx; });
      var t = fighters.find(function(f){ return f.idx===NET_VIEW.follow; }); return { mine: me.team, theirs: t && t.team, dead: !!(t && t.dead) }; })()`);
    expect(r.theirs).toBe(r.mine);
    expect(r.dead).toBe(false);
  }, T);
});

describe('between snapshots', () => {
  it('the client draws its fighter moving every frame, not in 2-3 frame steps', async () => {
    // Before: each snapshot was held for 3 frames, so the walking fighter moved on 33% of frames, 20 px at a time.
    const p = await makePair({ mode: 'ffa', stageId: 'goiky', count: 2 });
    const xs = run(p, 90, () => ['left']).slice(10).map((f) => f.cli.x);
    const steps = xs.slice(1).map((x, i) => Math.abs(x - xs[i]));
    const moving = steps.filter((d) => d > 0.01).length;
    expect(moving / steps.length, 'frames on which the walking fighter moved').toBeGreaterThan(0.95);
    expect(Math.max(...steps), 'no step bigger than a fast walk frame').toBeLessThan(9);
  }, T);

  it('under network jitter, the picture never stands still for long and never jumps', async () => {
    // Before, on this run (40 ms latency, 30 ms jitter): still for up to 4 frames in a row, then a 20 px jump.
    const p = await makePair({ mode: 'ffa', stageId: 'goiky', count: 2, latency: 40, jitter: 30 });
    const xs = run(p, 130, () => ['left']).slice(20).map((f) => f.cli.x);
    let still = 0, longest = 0;
    for (let i = 1; i < xs.length; i++) { if (Math.abs(xs[i] - xs[i - 1]) < 0.01) { still++; longest = Math.max(longest, still); } else still = 0; }
    const steps = xs.slice(1).map((x, i) => Math.abs(x - xs[i]));
    expect(longest, 'consecutive frames without movement').toBeLessThanOrEqual(3);
    expect(Math.max(...steps)).toBeLessThan(20);
  }, T);

  it("shows the client's own press on its own fighter: speed, footing, the swing", async () => {
    // Before: no vx, no onground, no _atkAnim reached a client -- its fighter stood in the idle pose while it ran,
    // and pressing attack showed nothing on it.
    const p = await makePair({ mode: 'ffa', stageId: 'goiky', count: 2 });
    run(p, 40, () => ['left']);
    const moving = p.Cc.eval('(function(){ var f=fighters.find(function(f){ return f.idx===1; }); return { vx:f.vx, onground:f.onground }; })()');
    expect(moving.vx).toBeLessThan(-2);
    expect(moving.onground).toBe(true);
    let swung = false;
    for (let i = 0; i < 20 && !swung; i++) { p.frame(i < 3 ? ['attack'] : []); swung = p.Cc.eval('(fighters.find(function(f){ return f.idx===1; })._atkAnim||0) > 0'); }
    expect(swung).toBe(true);
    // and the swing plays out frame by frame, through the beats the striking limb is drawn from (_atkPhase was never
    // set on a client, so the limb never appeared, and the timer moved only when a snapshot landed)
    const beats = [], timers = [];
    for (let i = 0; i < 30; i++) {
      p.frame([]);
      const r = p.Cc.eval('(function(){ var f=fighters.find(function(f){ return f.idx===1; }); return [f._atkPhase||null, f._atkAnim||0]; })()');
      if (r[1] > 0) { beats.push(r[0]); timers.push(r[1]); }
    }
    expect(beats).toContain('release');
    const stuck = timers.slice(1).filter((t, i) => t === timers[i]).length;
    expect(stuck, 'frames the swing timer did not move').toBeLessThanOrEqual(1);
  }, T);
});

describe('the snapshot', () => {
  it('costs a fraction of what it did: the world geometry is not resent 20 times a second', async () => {
    // Before (average bytes): FFA Grand Plains 3410, Teams 1v1 8712, Teams 2v2 10668. After: about 810, 760, 1230.
    const budgets = [
      [{ mode: 'ffa', stageId: 'grandplains', count: 2 }, 1600],
      [{ mode: 'teams', count: 2, teamKey: '1v1' }, 1600],
      [{ mode: 'teams', count: 4, teamKey: '2v2' }, 2600],
    ];
    for (const [o, budget] of budgets) {
      const p = await makePair(o);
      const full = p.Hh.eval('JSON.stringify({t:"state", s:serializeState()}).length');
      run(p, 240);   // 4 seconds
      const b = p.wire.state, avg = b.reduce((a, c) => a + c, 0) / b.length;
      expect(avg, JSON.stringify(o)).toBeLessThan(budget);
      expect(avg, 'well under a whole world every time').toBeLessThan(full * 0.5);
      // the geometry went out with the first snapshot and at most once more in 4 s (the repeat is every 3 s)
      expect(b.filter((n) => n > full * 0.6).length).toBeLessThanOrEqual(2);
      // and the client drew the host's platforms the whole time
      expect(p.Cc.eval('JSON.stringify(worldPlats.map(function(q){ return [q.x,q.y,q.w]; }))'))
        .toBe(p.Hh.eval('JSON.stringify(worldPlats.map(function(q){ return [Math.round(q.x),Math.round(q.y),Math.round(q.w)]; }))'));
    }
  }, T);

  it('goes out 30 times a second, and a backed-up socket drops a snapshot instead of queueing it', async () => {
    const p = await makePair({ mode: 'ffa', stageId: 'goiky', count: 2 });
    run(p, 60, () => []);
    const n0 = p.wire.state.length;
    run(p, 60, () => []);
    expect(p.wire.state.length - n0, 'snapshots in one second').toBe(30);   // was 20
    // Before, 200 KB could queue (~9 snapshots: half a second of stale picture, 1.6 s on a 1 Mbit/s uplink).
    p.Hh.eval('NET.ws.bufferedAmount = 30000;');
    const n1 = p.wire.state.length;
    run(p, 12, () => []);
    expect(p.wire.state.length - n1, 'nothing piled onto a 30 KB queue').toBe(0);
    p.Hh.eval('NET.ws.bufferedAmount = 0;');
    run(p, 4, () => []);
    expect(p.wire.state.length).toBeGreaterThan(n1);
  }, T);

  it("Four's Screechy ring: smaller snapshots, sent no faster than the old rate, so the upload goes down", async () => {
    // The history pass found the one real link between Boss Rush and online delay: Four's 300-shot ring tripled the
    // snapshot. Before, on this run: 13.6 KB a snapshot, 20 a second -- 272 KB/s of host upload. After: ~9.5 KB, 20 a second.
    const p = await makePair({ mode: 'boss', count: 2 });
    run(p, 30, () => []);
    p.Hh.eval(`for (var i=0;i<300;i++){ var a=i/300*Math.PI*2; addProj({owner:-2, ownerObj:{team:-1,idx:-2}, x:640, y:300, bossAtk:99,
      vx:Math.cos(a)*6, vy:Math.sin(a)*6, grav:false, dmg:5, kb:9, r:7, color:'#7ad0ff', life:95, noAim:true, ring:true}); }`);
    run(p, 10, () => []);
    const n0 = p.wire.state.length;
    run(p, 60, () => []);
    expect(p.Hh.eval('projectiles.length'), 'the ring is still out').toBe(300);
    const b = p.wire.state.slice(n0), perSec = b.reduce((a, c) => a + c, 0);
    expect(Math.max(...b), 'bytes per ring snapshot').toBeLessThan(10500);
    expect(b.length, 'ring snapshots in one second').toBeLessThanOrEqual(20);
    expect(perSec, 'bytes of host upload in one second').toBeLessThan(0.75 * 272000);
    // and the client glides every shot: each has an id, a speed and a place
    const shots = p.Cc.eval('projectiles.filter(function(q){ return q.i != null && Math.hypot(q.vx, q.vy) > 5; }).length');
    expect(shots).toBe(300);
  }, T);

  it('sends each particle once, when it is born, and the client moves it itself', async () => {
    // Before: the oldest 60 particles went out in every snapshot (~5 KB), frozen in place on the client, and in a busy
    // fight the newest -- the sparks of the hit that just landed -- were the ones cut.
    const p = await makePair({ mode: 'ffa', stageId: 'goiky', count: 2 });
    run(p, 20, () => []);
    p.Hh.eval('for (var i=0;i<10;i++) particles.push({ x:400+i, y:300, vx:1, vy:-2, life:60, color:"#ff00ff", r:3 });');
    const mine = () => p.Cc.eval('particles.filter(function(q){ return q.color==="#ff00ff"; }).map(function(q){ return q.y; })');
    run(p, 4, () => []);
    const got = mine();
    expect(got.length).toBe(10);
    run(p, 10, () => []);
    const later = mine();
    expect(later.length, 'not sent again').toBe(10);
    expect(later.every((y, i) => Math.abs(y - got[i]) > 1), 'and they move on the client').toBe(true);
  }, T);

  it('carries the big-FFA spawn pads and the Boss Rush backdrop from the host', async () => {
    // Before: a client drew the pads its own setupWorld built for its window size, never saw one change hands, and kept
    // boss 1's sky for the whole of Boss Rush.
    const p = await makePair({ mode: 'ffa', stageId: 'grandplains', count: 2, cliW: 1024, cliH: 600 });
    run(p, 6, () => []);
    p.Hh.eval('spawnZones.find(function(z){ return z.kind==="claim"; }).owner = 0;');
    run(p, 4, () => []);
    const zones = (w) => w.eval('JSON.stringify(spawnZones.map(function(z){ return [z.kind, Math.round(z.x), Math.round(z.y), z.owner]; }))');
    expect(zones(p.Cc)).toBe(zones(p.Hh));
    const b = await makePair({ mode: 'boss', count: 2 });
    run(b, 6, () => []);
    b.Hh.eval('BOSS_ARENA = "cave";');
    run(b, 4, () => []);
    expect(b.Cc.eval('BOSS_ARENA')).toBe('cave');
  }, T);
});

describe("a client's input", () => {
  it('reaches the host on the next frame, and a tap shorter than a frame still happens', async () => {
    // Before: a key was only read at the client's next frame, which sent it -- up to a frame late, plus 1 in 7 sends
    // skipped by a 16 ms cap -- and the host kept only the latest message, so a tap released before the next frame
    // (or two inside one host frame) never happened. On this run: 0 messages at the press, 2 host frames to the jump,
    // and the one-frame tap never jumped.
    const p = await makePair({ mode: 'ffa', stageId: 'goiky', count: 2 });
    run(p, 60, () => []);   // settle on the ground
    const sent = p.wire.input.length;
    p.press('jump');
    expect(p.wire.input.length, 'the press left at once, not at the next frame').toBe(sent + 1);
    let frames = 0;
    for (; frames < 10; frames++) { p.frame(); if (p.Hh.eval('fighters[1].vy < 0')) break; }
    expect(frames + 1, 'host frames from the press to the jump').toBe(1);
    p.release('jump');
    run(p, 60, () => []);   // land again
    p.press('jump'); p.release('jump');   // both inside one frame
    let jumped = false;
    for (let i = 0; i < 3 && !jumped; i++) { p.frame(); jumped = p.Hh.eval('fighters[1].vy < 0'); }
    expect(jumped, 'the tap jumped').toBe(true);
  }, T);

  it('an idle client sends a heartbeat, not 60 messages a second; paused or hidden, it holds nothing', async () => {
    const p = await makePair({ mode: 'ffa', stageId: 'goiky', count: 2 });
    run(p, 10, () => []);
    const n0 = p.wire.input.length;
    run(p, 120, () => []);
    expect(p.wire.input.length - n0, 'messages in 2 idle seconds').toBeLessThanOrEqual(5);   // was 120 (60 a second)
    p.hold(['right']); p.frame();
    expect(p.Hh.eval('!!NET.inputs[1].right')).toBe(true);
    // pausing used to stop the client's loop with the host still holding its last input: running right forever
    p.press('pause'); p.pump();
    expect(p.Hh.eval('(function(){ var i=NET.inputs[1]; return !!(i.right||i.left||i.jump||i.attack); })()'), 'let go while paused').toBe(false);
  }, T);

  it("a press the host never read -- the fighter was KO'd -- does not fire on the respawn", () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      NET.role='host'; NET.inputs={}; NET.latch={}; hazardT=100;
      NET.onMessage({ t:'input', idx:1, input:{ attack:true } }); NET.onMessage({ t:'input', idx:1, input:{} });
      hazardT=101; var fresh = netRemoteInput(1);                         // the next frame: the tap happens
      NET.onMessage({ t:'input', idx:1, input:{ attack:true } }); NET.onMessage({ t:'input', idx:1, input:{} });
      hazardT=160; var stale = netRemoteInput(1);                         // read a second later (respawned)
      NET.onMessage({ t:'input', idx:1, input:{ right:true } });
      NET.onMessage({ t:'input', idx:1, input:{ right:true } });          // a heartbeat of a held key
      hazardT=161; netRemoteInput(1); hazardT=162; var held = NET.latch[1];
      NET.role='solo';
      return { fresh: !!fresh.attack, stale: !!stale.attack, heldLatch: held };
    })()`);
    expect(r.fresh).toBe(true);
    expect(r.stale).toBe(false);
    expect(r.heldLatch, 'a held key is not a new press every heartbeat').toBeFalsy();
  });

  it('the host takes a fighter slot, and nothing else, from an input message', () => {
    const { window: w } = loadMonolith();
    w.eval(`NET.role='host'; NET.onMessage({ t:'input', idx:'__proto__', input:{ jump:true } }); NET.onMessage({ t:'input', idx:1.5, input:{ jump:true } });`);
    expect(w.eval('({}).jump')).toBeUndefined();
    expect(w.eval('Object.keys(NET.inputs).length')).toBe(0);
  });
});

describe('the per-match capture stays off the frame', () => {
  it('reads no pixels inside the game loop where createImageBitmap exists; the GIF gets them later', async () => {
    // getImageData is a synchronous GPU readback: 26-65 ms (median) every 5th frame on the owner's laptop, on host and
    // client and in solo Boss Rush.
    const { window: w } = loadMonolith();
    const r = await w.eval(`(async function(){
      var reads = 0;
      CLIP.cv = { width:CLIP.W, height:CLIP.H };
      CLIP.ctx = { drawImage:function(){}, clearRect:function(){}, getImageData:function(){ reads++; return { data:new Uint8ClampedArray(CLIP.W*CLIP.H*4), width:CLIP.W, height:CLIP.H }; } };
      window.createImageBitmap = function(){ return Promise.resolve({ width:CLIP.W, height:CLIP.H, close:function(){} }); };
      clipReset();
      for (var i=0;i<100;i++){ clipCapture(); await new Promise(function(res){ setTimeout(res, 0); }); }
      var inLoop = reads, n = CLIP.frames.length, frames = clipFrames();
      return { inLoop: inLoop, n: n, pixels: frames.length, readsAfter: reads, isPixels: frames.every(function(f){ return !!f.data; }) };
    })()`);
    expect(r.inLoop).toBe(0);
    expect(r.n).toBe(20);
    expect(r.pixels).toBe(20);
    expect(r.isPixels).toBe(true);
  });

  it('one recorder at a time, and none in an online match', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      var made = [];
      function FakeRec(){ this.state='inactive'; made.push(this); }
      FakeRec.prototype.start = function(){ this.state='recording'; };
      FakeRec.prototype.stop = function(){ this.state='inactive'; };
      FakeRec.isTypeSupported = function(){ return true; };
      window.MediaRecorder = FakeRec;
      cv.captureStream = function(){ return { getTracks:function(){ return [{ stop:function(){} }]; } }; };
      SETTINGS.mode='ffa'; SETTINGS.count=2; chosen = ROSTER.find(function(q){ return q.name==='Pen'; });
      startMatch(); startMatch(); startMatch(); startMatch();   // what three presses of R did
      var live = made.filter(function(m){ return m.state==='recording'; }).length, solo = made.length;
      NET.role = 'host'; startMatch();
      var online = made.length - solo, skipped = RUN_REC.skipped;
      NET.role = 'solo'; running = false;
      return { live: live, online: online, skipped: skipped, stillLive: made.filter(function(m){ return m.state==='recording'; }).length };
    })()`);
    expect(r.live, 'four starts leave one recorder running').toBe(1);
    expect(r.online).toBe(0);
    expect(r.skipped).toBe(true);
    expect(r.stillLive, 'and the online match stopped the solo one').toBe(0);
  });
});
