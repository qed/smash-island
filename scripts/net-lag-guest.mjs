// GUEST-SIDE: which part of clientFrame spikes? applySnapshot / netInterpolate / netPredict / particles+impacts / camera, each timed. cwd = the build.
import os from 'node:os';
import { performance, PerformanceObserver } from 'node:perf_hooks';
try { os.setPriority(0, os.constants.priority.PRIORITY_BELOW_NORMAL); } catch (e) {}
const WT = new URL('../', import.meta.url).href;   // the worktree this script sits in (cwd = the same)
const { bootRealm } = await import(WT + 'scripts/helpers/net-pair.js');
const { SETUP_SRC } = await import(WT + 'scripts/helpers/match-setup.js');
const N = +(process.argv[2] || 4), FRAMES = +(process.argv[3] || 3600), STAGE = process.argv[4] || 'goiky', MAPSZ = process.argv[5] || 'normal';
const NAMES = ['Pen', 'Firey', 'Leafy', 'Bubble', 'Pencil', 'Match', 'Coiny', 'Woody'].slice(0, N);
const clock = { T: 0 };
const H = bootRealm(1280, 720, 11, clock), G = bootRealm(1280, 720, 22, clock);
await H.eval('profileReady'); await G.eval('profileReady');
H.__now = () => performance.now(); G.__now = () => performance.now();
H.eval(SETUP_SRC.replace("s.id==='goiky'", `s.id===${JSON.stringify(STAGE)}`).replace("SETTINGS.mode='ffa';", `SETTINGS.mode='ffa'; SETTINGS.mapSize=${JSON.stringify(MAPSZ)};`));
const players = NAMES.map((n, i) => ({ id: 'p' + i, name: n, isHost: i === 0 }));
H.eval(`chosen = ROSTER.find(function(r){ return r.name==='Pen'; }); NET.role='host'; NET.myIdx=0; NET.players=${JSON.stringify(players)};
  NET.ws={readyState:1, bufferedAmount:0, send:function(s){ window.__sent = s; }, close:function(){}};
  __setupCustomMatch(${JSON.stringify(NAMES)}, 99, 2, 2);
  for(var i=1;i<fighters.length;i++){ NET.inS[i] = { e:1, q:[], cur:0, lastG:-1e9, clk:0, wt:0, offs:[[0, 0]] }; }
  window.__frame = function(){ step(); for(var i=1;i<fighters.length;i++) fighters[i].controller='remote'; window.__sent = null; NET.broadcastState(); for(var i=1;i<fighters.length;i++) fighters[i].controller='ai'; return !!window.__sent; };
`);
G.eval(`chosen = ROSTER.find(function(r){ return r.name==='Firey'; }); NET.role='client'; NET.myIdx=1; NET.players=${JSON.stringify(players)};
  NET.ws={readyState:1, bufferedAmount:0, send:function(s){}, close:function(){}}; NET._inT0 = 0; NET._inChg = []; NET._inCur = 0; NET._inE = 1;
  SETTINGS.mode='ffa'; SETTINGS.count=${N}; running=true; paused=false; netViewReset(); stepClockReset();
  // clientFrame, taken apart (the same calls in the same order)
  window.__gframe = function(text){
    var T = [], t = __now(), m = text ? JSON.parse(text) : null; if(m) NET.onMessage(m); T.push(__now() - t); t = __now();
    var N = window.NET, s = N && N.snapshot, now = performance.now();
    NET_VIEW.lastFrame = now;
    if(s && s !== NET_VIEW.applied) applySnapshot(s); T.push(__now() - t); t = __now();
    netInterpolate(now); T.push(__now() - t); t = __now();
    try{ netPredict(now, 1); }catch(e){ NET_PRED.on = false; } T.push(__now() - t); t = __now();
    interpRecord(true); netStepParticles(); stepImpactFx(); T.push(__now() - t); t = __now();
    clientCamera(1); T.push(__now() - t); t = __now();
    drawView(false, true); T.push(__now() - t);
    return T;
  };
`);
const parts = ['parse+arrive', 'applySnapshot', 'netInterpolate', 'netPredict', 'particles+impacts', 'camera', 'draw'];
const gcs = []; const obs = new PerformanceObserver((l) => { for (const e of l.getEntries()) gcs.push(e.duration); }); obs.observe({ entryTypes: ['gc'] });
const rows = [];
for (let i = 0; i < FRAMES; i++) { clock.T += 1000 / 60; const sent = H.__frame(); rows.push({ i, g: G.__gframe(sent ? H.__sent : null) }); }
await new Promise((r) => setTimeout(r, 50)); obs.disconnect();
const R = rows.slice(120);
const st = (k) => { const a = R.map((r) => r.g[k]).sort((x, y) => x - y); return { mean: +(a.reduce((p, q) => p + q, 0) / a.length).toFixed(3), p99: +a[Math.floor(a.length * 0.99)].toFixed(3), max: +a[a.length - 1].toFixed(3), over2ms: a.filter((v) => v > 2).length }; };
console.log(JSON.stringify({ N, STAGE, FRAMES, gc: { n: gcs.length, maxMs: +Math.max(0, ...gcs).toFixed(2), totalMs: +gcs.reduce((a, b) => a + b, 0).toFixed(1) }, parts: Object.fromEntries(parts.map((p, k) => [p, st(k)])) }, null, 1));
