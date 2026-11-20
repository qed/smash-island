// REJOIN BENCH. jsdom fake sockets ONLY (never the live relay, never any network): a fake relay that routes the way relay/src/protocol.js
// does (its pure functions are imported and used as they are), and a fake WebSocket class in every realm (NET.wsURL is also pointed at
// a dead name). One host + 1-2 guests run the real page. Guest 0 loses its connection mid-match for a while, then gets it back.
// Built from scratchpad/guestlag/lagbench.mjs (realm boot, 60 Hz host, jittered guest frames, in-order streams with latency + jitter).
// usage (cwd = worktree root): node rejoinbench.mjs <stage> <mode> <count> <guests> <dropSec> <relayNoticeMs|never> [teamKey] [after]
//   dropSec: how long guest 0 is cut off ('inf': never comes back); relayNoticeMs: when the relay drops the old socket from its list
//   ('late' = 4 s after the guest is back: the same id listed twice for a while); after: seconds to run after the drop ends
import os from 'node:os'; try { os.setPriority(0, os.constants.priority.PRIORITY_LOW); } catch (e) {}
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const { JSDOM } = createRequire('C:/Users/carad/Aardvark/smash-island-work/package.json')('jsdom');
import { mulberry32 } from 'file:///C:/Users/carad/Aardvark/smash-island-work/scripts/helpers/prng.js';
import { pathToFileURL } from 'node:url';
const proto = await import(pathToFileURL(process.cwd() + '/relay/src/protocol.js').href);

const [stageId = 'goiky', mode = 'ffa', countS = '4', guestsS = '1', dropS = '2', noticeS = '500', teamKey0 = '', afterS = '8', warmS = '6'] = process.argv.slice(2);
const COUNT = +countS, NG = +guestsS, DROP = dropS === 'inf' ? Infinity : +dropS * 1000, AFTER = +afterS * 1000, WARM = +warmS * 1000;
const LAT = 50, JIT = 20;
const HTML = readFileSync(process.env.SI_HTML || 'artifacts/V1/index.html', 'utf8');
const clock = { T: 0 };
const R = mulberry32(4242);
function stubCtx(w, h) {
  const grad = { addColorStop() {} };
  return new Proxy({}, { get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 }) : p === 'canvas' ? { width: w, height: h }
    : p === 'getTransform' ? () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }) : p === 'getImageData' ? () => ({ data: [] })
    : (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createPattern' || p === 'createConicGradient') ? () => grad : () => {}), set: () => true });
}
// ---- the event queue (fake network)
const ev = [];
const at = (t, fn) => ev.push({ t, fn, n: ev.length + Math.random() });
const streams = {};
function sendOn(key, fn) { const s = streams[key] || (streams[key] = { last: 0 }); s.last = Math.max(s.last, clock.T + LAT + R() * JIT); at(s.last, fn); }
const cut = new Set();   // realms cut off from the network (0 = host, 1.. = guests)
const log = [];
// ---- the fake relay (relay/src/index.js's Room, with protocol.js's own functions)
const relay = { peers: [] };
let SID = 0;
function pushRoster(leaving) {
  const live = relay.peers.filter((p) => p.sock !== leaving);
  const frame = JSON.stringify({ t: 'roster', players: proto.rosterOf(live.map((p) => p.at)) });
  for (const p of live) deliver(p.sock, frame);
}
function deliver(sock, frame) { sendOn('dn' + sock.sid, () => { if (cut.has(sock.r) || sock.readyState !== 1) return; try { sock.onmessage && sock.onmessage({ data: frame }); } catch (e) { errs.push('onmessage ' + e.message); } }); }
function relayRecv(sock, raw) {
  const self = relay.peers.find((p) => p.sock === sock); if (!self) return;
  const msg = JSON.parse(raw);
  if (msg.t === 'hello') { const { peer, refusedHost } = proto.applyHello(msg, self.at, relay.peers.map((p) => p.at)); self.at = peer; if (refusedHost) deliver(sock, JSON.stringify({ t: 'status', msg: 'refused' })); pushRoster(); return; }
  const route = proto.routeMessage(msg, self.at);
  wireCount[msg.t] = (wireCount[msg.t] || 0) + 1;
  if (msg.to !== undefined) wireCount['to:' + msg.t] = (wireCount['to:' + msg.t] || 0) + 1;
  if (route.to === 'host') { const h = relay.peers.find((p) => p.at.isHost); if (h) deliver(h.sock, JSON.stringify(msg)); }
  else if (route.to === 'others') { const f = JSON.stringify(msg); for (const p of relay.peers) if (p.sock !== sock) deliver(p.sock, f); }
}
function relayClose(sock) { const i = relay.peers.findIndex((p) => p.sock === sock); if (i < 0) return; relay.peers.splice(i, 1); pushRoster(sock); }
const wireCount = {};
function makeWS(r) {
  return class FakeWS {
    constructor(url) {
      this.url = url; this.readyState = 0; this.bufferedAmount = 0; this.r = r; this.sid = ++SID;
      log.push([Math.round(clock.T), 'ws new', r, this.sid]);
      at(clock.T + LAT, () => {
        if (this.readyState !== 0) return;
        if (cut.has(r)) { at(clock.T + 400, () => { if (this.readyState === 3) return; this.readyState = 3; log.push([Math.round(clock.T), 'ws fail', r, this.sid]); this.onerror && this.onerror({}); this.onclose && this.onclose({}); }); return; }
        this.readyState = 1; relay.peers.push({ sock: this, at: { id: null, name: null, isHost: false, seq: clock.T + Math.random() } });
        log.push([Math.round(clock.T), 'ws open', r, this.sid]);
        this.onopen && this.onopen({});
      });
    }
    send(s) { if (this.readyState !== 1 || cut.has(this.r)) return; sendOn('up' + this.sid, () => { if (this.readyState === 1 || this._half) relayRecv(this, s); }); }
    close() { if (this.readyState === 3) return; this.readyState = 3; at(clock.T + LAT, () => { relayClose(this); this.onclose && this.onclose({}); }); }
  };
}
const errs = [];
function bootRealm(w, h, seed, r) {
  const dom = new JSDOM(HTML, { url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(win) {
      win.HTMLCanvasElement.prototype.getContext = () => stubCtx(w, h);
      win.Math.random = mulberry32(seed);
      win.DOMMatrix = class { constructor(m) { const q = Array.isArray(m) ? m : [1, 0, 0, 1, 0, 0]; [this.a, this.b, this.c, this.d, this.e, this.f] = q; } };
      win.requestAnimationFrame = () => 0; win.cancelAnimationFrame = () => {};
      Object.defineProperty(win, 'innerWidth', { value: w, configurable: true });
      Object.defineProperty(win, 'innerHeight', { value: h, configurable: true });
      Object.defineProperty(win.performance, 'now', { value: () => clock.T, configurable: true });
      win.setTimeout = () => 0;
      win.WebSocket = makeWS(r);
      win.fetch = () => new Promise(() => {});   // (no network of any kind)
    } });
  const win = dom.window;
  win.addEventListener('error', (e) => errs.push('R' + r + ' ' + (e.message || e)));
  return win;
}
const Hh = bootRealm(1280, 720, 11, 0); await Hh.eval('profileReady');
const G = []; for (let i = 0; i < NG; i++) { const w = bootRealm(1280, 720, 22 + i, 1 + i); await w.eval('profileReady'); G.push(w); }
const ALL = [Hh, ...G];
ALL.forEach((w, r) => { w.eval(`NET.wsURL = function(){ return 'ws://fake.invalid/?room=' + (this.room||''); };`);
  const ce = w.console.error.bind(w.console); w.console.error = (...a) => { errs.push('R' + r + ' console.error ' + a.map(String).join(' ').slice(0, 200)); }; });
const FIGHTERS = ['Pen', 'Firey', 'Leafy', 'Bubble'];
// host the room the page's way (NET.host() minus its Capture the Flag practice gate)
Hh.eval(`chosen = ROSTER.find(function(r){ return r.name===${JSON.stringify(FIGHTERS[0])}; }); NET.stampId(); NET.role='host'; NET.myIdx=0; NET.room='TSTR';
  NET.players=[{id:NET.myId, name:chosen.name, isHost:true}]; NET.connect(null, true);`);
const runUntil = (t) => { ev.sort((a, b) => a.t - b.t || a.n - b.n); while (ev.length && ev[0].t <= t) { const e = ev.shift(); clock.T = Math.max(clock.T, e.t); e.fn(); ev.sort((a, b) => a.t - b.t || a.n - b.n); } clock.T = Math.max(clock.T, t); };
runUntil(300);
G.forEach((w, i) => { w.eval(`chosen = ROSTER.find(function(r){ return r.name===${JSON.stringify(FIGHTERS[1 + i])}; }); NET.join('TSTR'); NET._ctutCheck=false;`); runUntil(clock.T + 300); });
runUntil(clock.T + 500);
const ids = ALL.map((w) => w.eval('NET.myId'));
const counts = { begin: G.map(() => 0) };
G.forEach((w, i) => { w.__bm = () => { counts.begin[i]++; log.push([Math.round(clock.T), 'beginMatch', 'G' + i]); }; w.eval(`(function(){ var b = NET.beginMatch; NET.beginMatch = function(){ window.__bm(); return b.apply(this, arguments); }; })()`); });
Hh.eval(`SETTINGS.mode=${JSON.stringify(mode)}; SETTINGS.count=${COUNT}; SETTINGS.stocks=5; SETTINGS.itemRate=3; SETTINGS.mapSize='normal'; AI_LEVEL=0;
  ${teamKey0 ? `SETTINGS.teamKey=${JSON.stringify(teamKey0)};` : ''} stage = STAGES.find(function(s){ return s.id===${JSON.stringify(stageId)}; }) || STAGES[0]; NET.startAsHost();`);
const setup = { roster: Hh.eval('JSON.stringify(NET.players.map(function(p){return p.id;}))'), seats: Hh.eval('JSON.stringify(NET._seats)'), running: G.map((w) => w.eval('running')), myIdx: G.map((w) => w.eval('NET.myIdx')) };
// ---- drivers
function makeDriver(w, i) {
  const r = mulberry32(900 + i); const st = { dir: 0, dirT: 0, held: new Set(), taps: [] };
  const codes = {}; for (const n of ['left', 'right', 'jump', 'attack', 'special']) codes[n] = w.eval(`KEYS[${JSON.stringify(n)}]`);
  const key = (n, d) => w.dispatchEvent(new w.KeyboardEvent(d ? 'keydown' : 'keyup', { code: codes[n], bubbles: true }));
  const set = (want) => { for (const n of Object.keys(codes)) { const on = want.has(n), was = st.held.has(n); if (on !== was) { key(n, on); if (on) st.held.add(n); else st.held.delete(n); } } };
  return { wander(gf) {
      const me = JSON.parse(w.eval(`(function(){ var f=fighters.find(function(g){return g.idx===NET.myIdx;}); return JSON.stringify(f?{x:f.x}:null); })()`)); const WW = w.eval('WW');
      if (--st.dirT <= 0) { st.dir = r() < 0.5 ? -1 : 1; st.dirT = 20 + Math.floor(r() * 40); if (me && WW) { if (me.x < WW * 0.3) st.dir = 1; else if (me.x > WW * 0.7) st.dir = -1; } }
      if (r() < 0.03) st.taps.push(['jump', gf, 4]); if (r() < 0.02) st.taps.push(['attack', gf, 3]);
      st.taps = st.taps.filter((t) => gf < t[1] + t[2]);
      const want = new Set(); want.add(st.dir < 0 ? 'left' : 'right'); for (const t of st.taps) want.add(t[0]); set(want);
    }, pattern(k) { set(new Set(k < 40 ? ['right'] : k < 70 ? [] : k < 110 ? ['left'] : [])); }, mask: () => [...st.held].sort().join('+') };
}
const drivers = G.map((w, i) => makeDriver(w, i));
// ---- host history (by its frame, hazardT): what each snapshot says
const hist = new Map();
function hostRec() {
  const s = JSON.parse(Hh.eval(`(function(){ var o={t:hazardT, f:fighters.map(function(f){ return [f.idx, f.stocks===Infinity?-1:f.stocks, f.pct, Math.round(f.x), Math.round(f.y), f.name, f.controller, !!f.dead]; }),
      it:items.filter(function(i){return !i.taken;}).map(function(i){ return [Math.round(i.x), Math.round(i.y), i.kind]; }), wp:worldPlats.map(function(p){ return [Math.round(p.x), Math.round(p.y), Math.round(p.w)]; }), fl:floors.length};
      if(SETTINGS.mode==='ctf' && CTF.live){ var L=CTF.live; o.ctf={sc:L.score.slice(), ph:L.phase, ed:L.edits.length, gone:Object.keys(L.gone).length, fl:L.flags.map(function(q){ return [Math.round(q.x), Math.round(q.y), q.st]; })}; }
      return JSON.stringify(o); })()`));
  hist.set(s.t, s); if (hist.size > 900) hist.delete(hist.keys().next().value);
}
function guestView(w) {
  return JSON.parse(w.eval(`(function(){ var o={t:NET_VIEW.tt, applied:!!NET_VIEW.applied, myIdx:NET.myIdx, running:running, role:NET.role, rj:!!NET._rj, f:fighters.map(function(f){ return [f.idx, f.stocks===Infinity?-1:f.stocks, f.pct, Math.round(f._tx), Math.round(f._ty), f.name, !!f.you, !!f.dead]; }),
      it:items.map(function(i){ return [Math.round(i.x), Math.round(i.y), i.kind]; }), wp:worldPlats.map(function(p){ return [Math.round(p.x), Math.round(p.y), Math.round(p.w)]; }), fl:floors.length};
      if(SETTINGS.mode==='ctf' && CTF.live){ var L=CTF.live, vt=(fighters[NET.myIdx]||{}).team|0; o.ctf={sc:L.score.slice(), ph:L.phase, ed:L.edits.length, gone:Object.keys(L.gone||{}).length, fl:L.flags.map(function(q){ return [Math.round(q.x), Math.round(q.y), q.st]; })}; }
      return JSON.stringify(o); })()`));
}
function compare(w) {
  const g = guestView(w), h = hist.get(g.t);
  if (!h) return { ok: false, why: 'no host frame ' + g.t };
  const bad = [];
  if (g.f.length !== h.f.length) bad.push('fighter count ' + g.f.length + '/' + h.f.length);
  for (const hf of h.f) { const gf = g.f.find((q) => q[0] === hf[0]); if (!gf) { bad.push('missing ' + hf[0]); continue; }
    if (gf[1] !== hf[1]) bad.push('stocks ' + hf[0] + ' ' + gf[1] + '/' + hf[1]);
    if (Math.abs(gf[2] - hf[2]) > 0.01) bad.push('pct ' + hf[0] + ' ' + gf[2] + '/' + hf[2]);
    if (gf[5] !== hf[5]) bad.push('name ' + hf[0] + ' ' + gf[5] + '/' + hf[5]);
    if (!hf[7] && !gf[7] && (Math.abs(gf[3] - hf[3]) > 1 || Math.abs(gf[4] - hf[4]) > 1)) bad.push('pos ' + hf[0] + ' ' + gf[3] + ',' + gf[4] + '/' + hf[3] + ',' + hf[4]); }
  if (JSON.stringify(g.it) !== JSON.stringify(h.it)) bad.push('items ' + JSON.stringify(g.it).slice(0, 80) + ' / ' + JSON.stringify(h.it).slice(0, 80));
  if (g.wp.length !== h.wp.length) bad.push('plats ' + g.wp.length + '/' + h.wp.length);
  else { let m = 0; for (let k = 0; k < g.wp.length; k++) if (Math.abs(g.wp[k][0] - h.wp[k][0]) > 1 || Math.abs(g.wp[k][1] - h.wp[k][1]) > 1 || g.wp[k][2] !== h.wp[k][2]) m++; if (m) bad.push('plats off ' + m + '/' + g.wp.length); }
  if (g.fl !== h.fl) bad.push('floors ' + g.fl + '/' + h.fl);
  if (h.ctf) { const a = g.ctf, b = h.ctf; if (!a) bad.push('no ctf'); else { if (JSON.stringify(a.sc) !== JSON.stringify(b.sc)) bad.push('ctf score'); if (a.ph !== b.ph) bad.push('ctf phase ' + a.ph + '/' + b.ph); if (a.ed !== b.ed) bad.push('ctf edits ' + a.ed + '/' + b.ed); if (a.gone !== b.gone) bad.push('ctf gone'); } }
  return { ok: bad.length === 0, t: g.t, lagFrames: Math.round(Hh.eval('hazardT') - g.t), bad: bad.slice(0, 6), you: (g.f.find((q) => q[6]) || [])[0], myIdx: g.myIdx };
}
// ---- run
const HOST_MS = 1000 / 60; let hostNext = clock.T + HOST_MS; const gNext = G.map(() => clock.T + HOST_MS * R());
const T0 = clock.T, tDrop = T0 + WARM, tBack = tDrop + DROP, tEnd = (DROP === Infinity ? tDrop + 95000 : tBack + AFTER);
const relayNotice = noticeS === 'late' ? (DROP === Infinity ? 1e12 : DROP + 4000) : +noticeS;
const out = { stage: stageId, mode, count: COUNT, guests: NG, dropS: DROP / 1000, relayNoticeMs: noticeS, setup };
let dropped = false, oldSock = null, gfN = 0, pat = null; const samples = { during: [], dupMax: 0 }; const hostMasks = [];
const gid = ids[1], gIdx = setup.myIdx[0];
while (clock.T < tEnd) {
  const tn = Math.min(hostNext, ...gNext);
  runUntil(tn);
  if (!dropped && clock.T >= tDrop) {
    dropped = true; cut.add(1); oldSock = G[0].eval('NET.ws'); const o = oldSock;
    out.before = compare(G[0]);
    out.beforeHost = JSON.parse(Hh.eval(`JSON.stringify((function(){ var f=fighters[${gIdx}]; return {ctl:f.controller, stocks:f.stocks, pct:f.pct}; })())`));
    at(clock.T + 300, () => { if (o.readyState === 3) return; o.readyState = 3; log.push([Math.round(clock.T), 'guest sees close']); o.onclose && o.onclose({}); });
    at(clock.T + relayNotice, () => { log.push([Math.round(clock.T), 'relay drops old socket']); relayClose(o); });
    if (DROP !== Infinity) at(tBack, () => { cut.delete(1); log.push([Math.round(clock.T), 'network back']); });
  }
  if (tn === hostNext) {
    Hh.eval('loop()'); hostRec(); hostNext += HOST_MS;
    const n = relay.peers.filter((p) => p.at.id === gid).length; samples.dupMax = Math.max(samples.dupMax, n);
    if (dropped) { const c = Hh.eval(`(function(){ var f=fighters[${gIdx}], m=NET.inputs&&NET.inputs[${gIdx}]; return f.controller + '|' + (m ? Object.keys(m).filter(function(k){return m[k];}).sort().join('+') : '-') + '|' + NET._seats[${gIdx}]; })()`); samples.during.push([Math.round(clock.T - tDrop), c]); hostMasks.push([clock.T, c]); }
    continue;
  }
  const i = gNext.indexOf(tn), w = G[i], gf = Math.floor(clock.T / HOST_MS);
  if (pat != null && i === 0) { drivers[0].pattern(pat++); } else if (clock.T > T0 + 1500) drivers[i].wander(gf);
  try { w.eval('loop()'); } catch (e) { errs.push('G' + i + ' loop ' + e.message); }
  gNext[i] = tn + HOST_MS + (R() - 0.5) * 2;
  // after the rejoin has settled: the checks
  if (i === 0 && DROP !== Infinity && clock.T > tBack && !out.back && counts.begin[0] >= 2 && !G[0].eval('NET._rj')) { out.back = { atMsAfterNetwork: Math.round(clock.T - tBack) }; out.backT = clock.T; }
  if (i === 0 && out.backT && !out.after && clock.T > out.backT + 2000) { out.after = compare(G[0]); pat = 0; out.patT = clock.T; }
}
// ---- summarise
const ctlAt = (ms) => { const s = samples.during.filter((x) => x[0] <= ms).pop(); return s ? s[1] : null; };
out.duringHost = { at1s: ctlAt(1000), at2_5s: ctlAt(2500), at4s: ctlAt(4000), lastBeforeBack: DROP === Infinity ? ctlAt(94000) : ctlAt(DROP - 100) };
out.dupIdsMax = samples.dupMax;
if (out.patT) { // the guest's keys on the host after the rejoin: right 40 frames, nothing, left 40
  const hm = hostMasks.filter((x) => x[0] > out.patT && x[0] < out.patT + 2600).map((x) => x[1].split('|'));
  out.control = { steps: hm.length, ctlRemote: hm.filter((x) => x[0] === 'remote').length, right: hm.filter((x) => x[1] === 'right').length, left: hm.filter((x) => x[1] === 'left').length,
    seat: Hh.eval(`NET._seats[${gIdx}]`) === gid };
}
out.endHost = Hh.eval(`(function(){ var f=fighters[${gIdx}]; return f.controller + '|' + NET._seats[${gIdx}] + '|running ' + running; })()`);
out.endGuest = G.map((w) => w.eval(`NET.role + '|running ' + running + '|myIdx ' + NET.myIdx + '|rj ' + !!NET._rj`));
if (NG > 1) out.otherGuest = { beginMatchCalls: counts.begin[1], myIdx: G[1].eval('NET.myIdx'), view: compare(G[1]) };
out.beginCalls = counts.begin; out.wire = wireCount; out.errors = errs.length; out.errs = errs.slice(0, 6);
out.log = log.filter((l) => l[1] !== 'ws new' || true).slice(-14);
console.log(JSON.stringify(out, null, 1));
process.exit(0);
