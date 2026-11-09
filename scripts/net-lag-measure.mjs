// ONLINE LAG measurement (OFFLINE: jsdom realms, no sockets, no relay). cwd = the lag worktree.
// node measure.mjs N [frames] -> host encode cost, bytes, per-key breakdown, guest apply cost, host/guest equality.
import os from 'node:os';
import { performance, PerformanceObserver } from 'node:perf_hooks';
try { os.setPriority(0, os.constants.priority.PRIORITY_BELOW_NORMAL); } catch (e) {}
const WT = new URL('../', import.meta.url).href;   // the worktree this script sits in (cwd = the same)
const { bootRealm } = await import(WT + 'scripts/helpers/net-pair.js');
const { SETUP_SRC } = await import(WT + 'scripts/helpers/match-setup.js');

const N = +(process.argv[2] || 4), FRAMES = +(process.argv[3] || 3000), SEED = +(process.argv[4] || 11), STAGE = process.argv[5] || 'goiky', MAPSZ = process.argv[6] || 'normal';
const NAMES = ['Pen', 'Firey', 'Leafy', 'Bubble', 'Pencil', 'Match', 'Coiny', 'Woody'].slice(0, N);
const clock = { T: 0 };
const H = bootRealm(1280, 720, SEED, clock), G = bootRealm(1280, 720, SEED + 11, clock);
await H.eval('profileReady'); await G.eval('profileReady');
H.__now = () => performance.now(); G.__now = () => performance.now();
H.eval(SETUP_SRC.replace("s.id==='goiky'", `s.id===${JSON.stringify(STAGE)}`).replace('SETTINGS.mode=\'ffa\';', `SETTINGS.mode='ffa'; SETTINGS.mapSize=${JSON.stringify(MAPSZ)};`));
const players = NAMES.map((n, i) => ({ id: 'p' + i, name: n, isHost: i === 0 }));
H.eval(`chosen = ROSTER.find(function(r){ return r.name==='Pen'; }); NET.role='host'; NET.myIdx=0; NET.players=${JSON.stringify(players)};
  NET.ws={readyState:1, bufferedAmount:0, send:function(s){ window.__sent = s; }, close:function(){}};
  __setupCustomMatch(${JSON.stringify(NAMES)}, 99, 2, 2);
  fighters.forEach(function(f){ f.controller='ai'; });
  // guest seats 1.. are 'remote' on a real host; keep the AI driving them but mark the input stream so pr (prediction numbers) is built as live
  for(var i=1;i<fighters.length;i++){ NET.inS[i] = { e:1, q:[], cur:0, lastG:-1e9, clk:0, wt:0, offs:[[0, 0]] }; }
  window.__encode = function(){
    var t0 = __now();
    var s = serializeState(false), key = worldGeoKey();
    var t1 = __now();
    if(key !== NET._geoKey || performance.now() - (NET._geoAt||0) > NET_GEO_EVERY){ s.geo = worldGeo(); NET._geoKey = key; NET._geoAt = performance.now(); }
    var text = JSON.stringify({t:'state', s:s});
    var t2 = __now();
    window.__sent = text;
    return { build:t1-t0, str:t2-t1, bytes:text.length, geo:!!s.geo, ha:HIT_ART.length, pj:projectiles.length, it:items.length, pb:(s.pb||[]).length, fnx:FINX.length, sm:summons.length, imp:(s.imp||[]).length };
  };
  window.__keys = function(){
    var s = serializeState(false), o = {};
    for(var k in s){ if(s[k] === undefined) continue; o[k] = JSON.stringify(s[k]).length + k.length + 3; }
    return o;
  };
  window.__step = function(){ var t0 = __now(); step(); return __now() - t0; };
`);
G.eval(`chosen = ROSTER.find(function(r){ return r.name==='Firey'; }); NET.role='client'; NET.myIdx=1; NET.players=${JSON.stringify(players)};
  NET.ws={readyState:1, bufferedAmount:0, send:function(s){}, close:function(){}}; NET._inT0 = 0; NET._inChg = []; NET._inCur = 0; NET._inE = 1;
  SETTINGS.mode='ffa'; SETTINGS.count=${N}; running=true; paused=false; netViewReset();
  window.__apply = function(text){
    var t0 = __now(); var m = JSON.parse(text); var t1 = __now();
    NET.onMessage(m); var t2 = __now();
    clientFrame(1); var t3 = __now();
    return { parse:t1-t0, arrive:t2-t1, frame:t3-t2 };
  };
  window.__view = function(){ return JSON.stringify({ t:hazardT, f:fighters.map(function(f){ return [f.idx, f._tx, f._ty, f.pct, f.stocks, f.dead?1:0]; }),
    pj:projectiles.map(function(p){ return [p._tx, p._ty]; }).sort(), it:items.map(function(i){ return [i.x, i.y, i.kind]; }).sort(), ha:HIT_ART.length, pb:particles.length }); };
`);
H.eval(`window.__hview = function(){ return JSON.stringify({ t:hazardT, f:fighters.map(function(f){ return [f.idx, Math.round(f.x), Math.round(f.y), Math.round(f.pct*10)/10, f.stocks, f.dead?1:0]; }),
  pj:projectiles.map(function(p){ return [Math.round(p.x), Math.round(p.y)]; }).sort(), it:items.filter(function(i){ return !i.taken; }).map(function(i){ return [Math.round(i.x), Math.round(i.y), i.kind]; }).sort(), ha:HIT_ART.length }); };`);

// GC pauses during the run
const gcs = []; const obs = new PerformanceObserver((l) => { for (const e of l.getEntries()) gcs.push(e.duration); }); obs.observe({ entryTypes: ['gc'] });

const enc = [], stepMs = [], bytes = [], apply = [], spikes = [], keyTot = {}; let keyN = 0, mism = 0, mismEx = null, geoN = 0, sentFrames = 0;
let lastB = 0, lastBytes = 0;
for (let i = 0; i < FRAMES; i++) {
  clock.T += 1000 / 60;
  stepMs.push(H.__step());
  // the real send gate (broadcastState): every frame while small, slower when big
  const gate = Math.min(66, Math.max(15, lastBytes / 200));
  if (clock.T - lastB < gate) continue;
  lastB = clock.T;
  const r = H.__encode(); sentFrames++;
  enc.push(r.build + r.str); bytes.push(r.bytes); if (r.geo) geoN++; if (!r.geo) lastBytes = r.bytes;
  if (r.build + r.str > 2.5 || r.bytes > 9000) spikes.push({ i, ms: +(r.build + r.str).toFixed(2), ...r });
  if (i % 20 === 0) { const k = H.__keys(); keyN++; for (const kk in k) keyTot[kk] = (keyTot[kk] || 0) + k[kk]; }
  const a = G.__apply(H.__sent); apply.push(a.parse + a.arrive + a.frame);
  if (i % 7 === 0 && i > 60) { const hv = H.__hview(), gv = G.__view(); const h = JSON.parse(hv), g = JSON.parse(gv);
    let bad = h.t !== g.t || h.f.length !== g.f.length || h.pj.length !== g.pj.length || h.it.length !== g.it.length || h.ha !== g.ha;
    if (!bad) for (let j = 0; j < h.f.length; j++) { const a = h.f[j], b = g.f[j]; if (a[0] !== b[0] || Math.abs(a[1] - b[1]) > 1 || Math.abs(a[2] - b[2]) > 1 || Math.abs(a[3] - b[3]) > 0.11 || a[4] !== b[4] || a[5] !== b[5]) bad = true; }
    if (!bad) for (let j = 0; j < h.pj.length; j++) { if (Math.abs(h.pj[j][0] - g.pj[j][0]) > 1 || Math.abs(h.pj[j][1] - g.pj[j][1]) > 1) bad = true; }
    if (!bad) for (let j = 0; j < h.it.length; j++) { if (h.it[j][0] !== g.it[j][0] || h.it[j][1] !== g.it[j][1] || h.it[j][2] !== g.it[j][2]) bad = true; }
    if (bad) { mism++; if (!mismEx) mismEx = { i, h: hv.slice(0, 300), g: gv.slice(0, 300) }; }
  }
}
obs.disconnect();
const st = (a) => { const s = [...a].sort((x, y) => x - y), m = a.reduce((p, q) => p + q, 0) / a.length; return { mean: +m.toFixed(3), p95: +s[Math.floor(0.95 * s.length)].toFixed(3), max: +s[s.length - 1].toFixed(3) }; };
const secs = FRAMES / 60, totalBytes = bytes.reduce((p, q) => p + q, 0);
const out = {
  N, frames: FRAMES, snapshots: sentFrames, snapsPerSec: +(sentFrames / secs).toFixed(1), geoSnaps: geoN,
  bytesPerSnap: st(bytes), bytesPerSec: Math.round(totalBytes / secs),
  encodeMs: st(enc), stepMs: st(stepMs), guestApplyMs: st(apply),
  gc: { n: gcs.length, totalMs: +gcs.reduce((p, q) => p + q, 0).toFixed(1), maxMs: +Math.max(0, ...gcs).toFixed(2) },
  keyBytesAvg: Object.fromEntries(Object.entries(keyTot).map(([k, v]) => [k, Math.round(v / keyN)]).sort((a, b) => b[1] - a[1])),
  spikes: spikes.sort((a, b) => b.ms - a.ms).slice(0, 8),
  guestMismatch: mism, mismEx,
  errs: H.eval('window.__loopErrLogged ? 1 : 0'),
};
console.log(JSON.stringify(out, null, 1));
