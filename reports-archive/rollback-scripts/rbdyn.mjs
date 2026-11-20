// ROLLBACK STUDY, dynamic measurements (jsdom, no network, no browser). The real page, CPUs on every seat.
// usage (cwd = worktree root): node rbdyn.mjs <det|perf|snap> <scenario> [frames]
//   det  : the same match run several ways (twice alike; with drawing; another window size; real clocks); per-binding state hashes compared
//   perf : step() time per frame, Math.random / clock / timer calls per frame, by phase (sim / draw) and by calling function
//   snap : the state rollback must save: size, snapshot + restore time, and whether a restore really rewinds (re-simulate and compare)
import os from 'node:os'; try { os.setPriority(0, os.constants.priority.PRIORITY_LOW); } catch (e) {}
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const { JSDOM } = createRequire(new URL('../../package.json', import.meta.url))('jsdom');
const SCR = process.env.RB_DIR || new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');   // (scan.json lives next to the scripts)
const scan = JSON.parse(readFileSync(SCR + 'scan.json', 'utf8'));
const LETS = [...scan.lets, ...scan.vars], BIND = [...LETS, ...scan.consts];
const HTML = readFileSync('artifacts/V1/index.html', 'utf8');
const [MODE = 'det', SCEN = 'goiky', FRS = '1800'] = process.argv.slice(2);
const FRAMES = +FRS;
const WEAKSHIM = !process.env.NOWEAKSHIM;   // (measurement only: the page's WeakMaps/WeakSets become Maps/Sets so a snapshot can see what they hold; nothing in the page iterates them)
const FNS = scan.fns || [];
const SCENARIOS = {
  goiky:   { stage: 'goiky', mode: 'ffa', count: 4, items: 2, tk: '' },
  sky:     { stage: 'skytower', mode: 'ffa', count: 4, items: 2, tk: '' },
  ffa8:    { stage: 'bigincin', mode: 'ffa', count: 8, items: 2, tk: '', size: 'large' },
  needle:  { stage: 'needle', mode: 'teams', count: 8, items: 2, tk: '4v4' },
  wind:    { stage: 'wind', mode: 'teams', count: 8, items: 2, tk: '4v4' },
  dream:   { stage: 'dreamisle', mode: 'teams', count: 8, items: 2, tk: '4v4' },
  shift:   { stage: 'shift', mode: 'teams', count: 8, items: 2, tk: '4v4' },
  tlc:     { stage: 'tlc', mode: 'teams', count: 8, items: 2, tk: '4v4' },
  ctf:     { stage: 'goiky', mode: 'ctf', count: 8, items: 0, tk: '' },
};
const SC = SCENARIOS[SCEN];

// ---- a realm: the page, a seeded Math.random whose state can be saved, a frame clock, phase-tagged counters
function stubCtx(w, h) {
  const grad = { addColorStop() {} };
  return new Proxy({}, { get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 }) : p === 'canvas' ? { width: w, height: h }
    : p === 'getTransform' ? () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }) : p === 'getImageData' ? () => ({ data: [] })
    : (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createPattern' || p === 'createConicGradient') ? () => grad : () => {}), set: () => true });
}
function mkRng(seed) { const s = { a: seed >>> 0 }; const f = () => { s.a |= 0; s.a = (s.a + 0x6d2b79f5) | 0; let t = Math.imul(s.a ^ (s.a >>> 15), 1 | s.a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; f.s = s; return f; }
async function boot({ w = 1100, h = 720, seed = 7, realClock = false, drawRng = false, attrib = false } = {}) {
  const R = { F: 0, ph: 0, rng: mkRng(seed), drng: mkRng(seed ^ 0x5bd1e995), cnt: { rnd: [0, 0, 0], perf: [0, 0, 0], date: [0, 0, 0], timer: [0, 0, 0] }, by: {}, attrib };
  const tag = (k) => { R.cnt[k][R.ph]++; if (R.attrib && R.ph !== 0) { const o = {}; R.win.Error.captureStackTrace(o); const l = String(o.stack).split('\n')[3] || ''; const m = l.match(/at (?:new )?([\w$.<>]+) \(/); const key = (R.ph === 1 ? 'S ' : 'D ') + k + ' ' + (m ? m[1] : '?'); R.by[key] = (R.by[key] || 0) + 1; } };
  const dom = new JSDOM(HTML, { url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(win) {
      R.win = win;
      win.HTMLCanvasElement.prototype.getContext = () => stubCtx(w, h);
      if (WEAKSHIM) { win.WeakMap = class WeakMap extends win.Map {}; win.WeakSet = class WeakSet extends win.Set {}; }
      win.Math.random = () => { tag('rnd'); return (drawRng && R.ph === 2) ? R.drng() : R.rng(); };
      win.DOMMatrix = class { constructor(m) { const q = Array.isArray(m) ? m : [1, 0, 0, 1, 0, 0]; [this.a, this.b, this.c, this.d, this.e, this.f] = q; } };
      win.requestAnimationFrame = () => { tag('timer'); return 0; }; win.cancelAnimationFrame = () => {};
      Object.defineProperty(win, 'innerWidth', { value: w, configurable: true });
      Object.defineProperty(win, 'innerHeight', { value: h, configurable: true });
      const rp = win.performance.now.bind(win.performance), rd = win.Date.now;
      Object.defineProperty(win.performance, 'now', { value: () => { tag('perf'); return realClock ? rp() : 1000 + R.F * 1000 / 60; }, configurable: true });
      win.Date.now = () => { tag('date'); return realClock ? rd() : 1763500000000 + Math.round(R.F * 1000 / 60); };
      const st = win.setTimeout, si = win.setInterval;
      win.setTimeout = function () { tag('timer'); return 0; };
      win.setInterval = function () { tag('timer'); return 0; };
    } });
  const win = dom.window; R.dom = dom;
  R.errs = []; win.addEventListener('error', (e) => R.errs.push(String(e.message || e)));
  await win.eval('profileReady');
  win.__ph = (p) => { R.ph = p; };
  win.eval(`(function(){ var s=step, d=drawView; step=function(){ __ph(1); try{ return s.apply(this,arguments); } finally { __ph(0); } };
    drawView=function(){ __ph(2); try{ return d.apply(this,arguments); } finally { __ph(0); } }; })()`);
  // the bindings, as one getter (TDZ / missing names read as undefined) and one setter for the let/var ones
  R.get = win.eval('(function(){ return [' + BIND.map((n) => `(function(){ try{ return ${n}; }catch(e){ return undefined; } })()`).join(',') + ']; })');
  R.getFns = win.eval('(function(){ return [' + FNS.join(',') + ']; })');
  R.set = win.eval('(function(v){ ' + LETS.map((n, i) => `try{ ${n} = v[${i}]; }catch(e){}`).join(' ') + ' })');
  R.isSkip = (o) => (o instanceof win.Node) || o === win || o === win.document || (win.CanvasRenderingContext2D && o instanceof win.CanvasRenderingContext2D) || (win.Event && o instanceof win.Event);
  return R;
}
function start(R, sc) {
  R.win.eval(`chosen = ROSTER.find(function(r){ return r.name==='Pen'; }); SETTINGS.mode=${JSON.stringify(sc.mode)}; SETTINGS.count=${sc.count}; SETTINGS.stocks=99;
    SETTINGS.itemRate=${sc.items}; SETTINGS.mapSize=${JSON.stringify(sc.size || 'normal')}; SETTINGS.teamKey=${JSON.stringify(sc.tk)};
    stage = STAGES.find(function(s){ return s.id===${JSON.stringify(sc.stage)}; }) || STAGES[0];
    beginMatchNow(); fighters.forEach(function(f){ f.controller='ai'; }); if(typeof CCARD!=='undefined') CCARD.on=false;`);
}
function frame(R, draw) { R.F++; R.win.eval('step()'); if (draw) R.win.eval('drawView(false,false); ageView(1);'); }

// ---- state hashing over the whole reachable graph of every top-level binding (functions, DOM and canvases skipped)
const dv = new DataView(new ArrayBuffer(8));
const HASH_FN_PROPS = true;
function hashAll(R, stats, vals0) {
  const vals = vals0 || R.get();
  const out = new Array(vals.length);
  for (let b = 0; b < vals.length; b++) {
    const seen = new Map(); let id = 0;
    let h = 0x811c9dc5 | 0; const mix = (x) => { h = Math.imul(h ^ (x | 0), 16777619); };
    const S = stats ? (stats[b] = { obj: 0, num: 0, str: 0, strB: 0, bool: 0 }) : null;
    const stack = [vals[b]];
    while (stack.length) {
      const v = stack.pop(); const t = typeof v;
      if (t === 'number') { dv.setFloat64(0, v); mix(dv.getInt32(0)); mix(dv.getInt32(4)); if (S) S.num++; continue; }
      if (t === 'string') { mix(v.length); const n = Math.min(v.length, 64); for (let i = 0; i < n; i++) mix(v.charCodeAt(i)); if (S) { S.str++; S.strB += v.length; } continue; }
      if (t === 'boolean') { mix(v ? 3 : 2); if (S) S.bool++; continue; }
      if (v === undefined) { mix(5); continue; } if (v === null) { mix(6); continue; }
      if (t === 'symbol' || t === 'bigint') { mix(7); continue; }
      if (t === 'function') { mix(7); if (!HASH_FN_PROPS) continue; const ks = Object.keys(v); if (!ks.length) continue; if (seen.has(v)) continue; seen.set(v, ++id); mix(ks.length); for (let i = ks.length - 1; i >= 0; i--) { stack.push(v[ks[i]]); stack.push(ks[i]); } continue; }
      if (seen.has(v)) { mix(0x5eed); mix(seen.get(v)); continue; }
      seen.set(v, ++id);
      if (R.isSkip(v)) { mix(9); continue; }
      if (S) S.obj++;
      if (Array.isArray(v)) { mix(v.length); for (let i = v.length - 1; i >= 0; i--) stack.push(v[i]); continue; }
      if (ArrayBuffer.isView(v)) { mix(v.length); for (let i = 0; i < v.length; i++) mix(v[i] * 1000); continue; }
      if (v instanceof R.win.Map) { mix(v.size); for (const [k, x] of v) { stack.push(x); stack.push(k); } continue; }
      if (v instanceof R.win.Set) { mix(v.size); for (const x of v) stack.push(x); continue; }
      const ks = Object.keys(v); mix(ks.length);
      for (let i = ks.length - 1; i >= 0; i--) { const k = ks[i]; let x; try { x = v[k]; } catch (e) { x = undefined; } stack.push(x); stack.push(k); }
    }
    out[b] = h;
  }
  return out;
}
const diffB = (a, b) => { const d = []; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d.push(BIND[i]); return d; };
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s.length ? +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(3) : null; };
const mean = (a) => a.length ? +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(3) : null;

async function runVariant(label, opts, draw, frames, every = 30) {
  const R = await boot(opts); start(R, SC);
  const tl = [];   // [frame, hashes]
  const core = () => R.win.eval(`JSON.stringify([hazardT, fighters.map(function(f){ return [f.x,f.y,f.vx,f.vy,f.pct,f.stocks,f.dead?1:0]; }), projectiles.map(function(p){ return [p.x,p.y]; })])`) + '|' + R.rng.s.a;
  const fields = () => { const fs = R.win.eval('fighters'); return fs.map((f) => { const ks = Object.keys(f); const hs = hashAll(R, null, ks.map((k) => f[k])); const o = {}; ks.forEach((k, j) => { o[k] = hs[j]; }); return o; }); };
  const sample = (i) => tl.push([i, hashAll(R), core(), fields()]);
  sample(0);
  for (let i = 1; i <= frames; i++) { frame(R, draw); if (i % every === 0) sample(i); }
  const info = { label, errs: R.errs.length, nf: R.win.eval('fighters.length'), cnt: R.cnt };
  R.win.close();
  return { tl, info };
}
function compare(A, B) {
  const r = { firstAt: null };
  for (let k = 0; k < A.tl.length; k++) { const d = diffB(A.tl[k][1], B.tl[k][1]); if (d.length) { Object.assign(r, { firstAt: A.tl[k][0], n: d.length, names: d.slice(0, 14), final: diffB(A.tl[A.tl.length - 1][1], B.tl[B.tl.length - 1][1]).length });
    const fa = A.tl[k][3], fb = B.tl[k][3], fd = new Set(); fa.forEach((o, j) => { const p = fb[j] || {}; for (const key of new Set([...Object.keys(o), ...Object.keys(p)])) if (o[key] !== p[key]) fd.add(key); }); r.fighterFields = [...fd].slice(0, 30); break; } }
  r.coreFirstAt = null; for (let k = 0; k < A.tl.length; k++) if (A.tl[k][2] !== B.tl[k][2]) { r.coreFirstAt = A.tl[k][0]; r.coreA = A.tl[k][2].slice(0, 160); r.coreB = B.tl[k][2].slice(0, 160); break; }
  return r;
}

if (MODE === 'det') {
  const t0 = Date.now();
  const A = await runVariant('A step only', { seed: 7 }, false, FRAMES);
  const A2 = await runVariant('A2 same again', { seed: 7 }, false, FRAMES);
  const B = await runVariant('B with drawing (shared RNG)', { seed: 7 }, true, FRAMES);
  const C2 = process.env.SIZE ? await runVariant('C2 1920x1080 headless', { seed: 7, w: 1920, h: 1080 }, true, FRAMES) : B;
  const D = await runVariant('D real clocks', { seed: 7, realClock: true }, false, FRAMES);
  // which bindings move during the match at all (frame 0 vs last) in A, and which the drawing alone moves (B2 vs C2 differences show view-dependence)
  const moved = diffB(A.tl[0][1], A.tl[A.tl.length - 1][1]);
  const seeds = process.env.SEED2 ? compare(A, await runVariant('E other seed', { seed: 8 }, false, FRAMES)) : null;
  console.log(JSON.stringify({ seeds, scen: SCEN, frames: FRAMES, secs: (Date.now() - t0) / 1000, info: [A, A2, B, D].map((x) => x.info),
    'A vs A2 (same machine, same seed)': compare(A, A2), 'A vs B (drawing shares Math.random)': compare(A, B), 'B vs C2 (headless window size)': compare(B, C2), 'A vs D (real clocks)': compare(A, D), movedDuringMatch: moved.length, moved }, null, 0));
}

if (MODE === 'perf') {
  const R = await boot({ seed: 7, attrib: false }); start(R, SC);
  for (let i = 0; i < 120; i++) frame(R, false);   // warm up
  const st = [], dr = [];
  const c0 = JSON.parse(JSON.stringify(R.cnt));
  for (let i = 0; i < FRAMES; i++) { R.F++; let t = process.hrtime.bigint(); R.win.eval('step()'); st.push(Number(process.hrtime.bigint() - t) / 1e6);
    t = process.hrtime.bigint(); R.win.eval('drawView(false,false); ageView(1);'); dr.push(Number(process.hrtime.bigint() - t) / 1e6); }
  const per = {}; for (const k in R.cnt) per[k] = R.cnt[k].map((v, i) => +((v - c0[k][i]) / FRAMES).toFixed(2));
  // attribution pass: 300 more frames, by calling function
  R.attrib = true; R.by = {}; for (let i = 0; i < 300; i++) frame(R, true);
  const by = Object.entries(R.by).sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, v]) => k + ' ' + (v / 300).toFixed(2));
  const nf = R.win.eval('fighters.length'), np = R.win.eval(`(function(){ try{ return JSON.stringify({proj: typeof projectiles!=='undefined'?projectiles.length:null, parts: typeof particles!=='undefined'?particles.length:null, summons: typeof summons!=='undefined'?summons.length:null, items: typeof items!=='undefined'?items.length:null}); }catch(e){ return String(e); } })()`);
  console.log(JSON.stringify({ scen: SCEN, frames: FRAMES, fighters: nf, live: np, errs: R.errs.length,
    stepMs: { mean: mean(st), p50: pct(st, 0.5), p95: pct(st, 0.95), p99: pct(st, 0.99), max: pct(st, 1) }, drawMsStub: { mean: mean(dr), p95: pct(dr, 0.95) },
    perFrame_sim_draw_other: per, topCallersPerFrame: by }));
  R.win.close();
}

// ---- the snapshot (identity kept): for each object reachable from a binding that changes during play, and not constant, a shallow copy of its own fields
function makeSnapper(R) {
  let rootsIdx = [], frozen = new Set(), changed = new Set();
  function calibrate(framesBefore, framesSpan) {
    for (let i = 0; i < framesBefore; i++) frame(R, false);
    const h0 = hashAll(R);
    for (let i = 0; i < framesSpan; i++) frame(R, false);
    changed = new Set(diffB(h0, hashAll(R)));
    const EX = new Set((process.env.EXCL || '').split(',').filter(Boolean));   // roots left out of the snapshot (lazily filled caches): only fair if the rewind test still passes without them
    rootsIdx = BIND.map((n, i) => i).filter((i) => changed.has(BIND[i]) && !EX.has(BIND[i]));
    const vals = R.get(); frozen = new Set();
    const markFrom = (v0) => { const st = [v0]; while (st.length) { const v = st.pop(); if (!v || (typeof v !== 'object')) continue; if (frozen.has(v) || R.isSkip(v)) continue; frozen.add(v);
      if (Array.isArray(v)) { for (const x of v) st.push(x); continue; } if (v instanceof R.win.Map) { for (const [k, x] of v) { st.push(k); st.push(x); } continue; } if (v instanceof R.win.Set) { for (const x of v) st.push(x); continue; }
      if (ArrayBuffer.isView(v)) continue; for (const k of Object.keys(v)) { try { st.push(v[k]); } catch (e) {} } } };
    BIND.forEach((n, i) => { if (!changed.has(n) || EX.has(n)) markFrom(vals[i]); });
  }
  function snapshot(sizes) {
    const v = R.get(), recs = []; const seen = new Set(); let bytes = 0, nobj = 0, nprim = 0;
    const per = sizes ? {} : null;
    const fnv = R.getFns();
    for (const ri of [...rootsIdx, -1]) {
      const b0 = bytes, o0 = nobj; const st = ri < 0 ? fnv.filter((f) => Object.keys(f).length) : [v[ri]];
      while (st.length) {
        const o = st.pop(); if (!o || (typeof o !== 'object' && typeof o !== 'function')) continue; if (typeof o === 'function' && !Object.keys(o).length) continue; if (seen.has(o) || frozen.has(o) || R.isSkip(o)) continue; seen.add(o); nobj++;
        if (Array.isArray(o)) { const c = o.slice(); recs.push([o, 1, c]); for (const x of c) { if (x && (typeof x === 'object' || typeof x === 'function')) st.push(x); else { nprim++; bytes += typeof x === 'string' ? x.length + 4 : 8; } } bytes += 8; continue; }
        if (ArrayBuffer.isView(o)) { recs.push([o, 2, o.slice()]); bytes += o.byteLength; continue; }
        if (o instanceof R.win.Map) { const c = [...o]; recs.push([o, 3, c]); for (const [k, x] of c) { st.push(k); st.push(x); } bytes += 16 * c.length; continue; }
        if (o instanceof R.win.Set) { const c = [...o]; recs.push([o, 4, c]); for (const x of c) st.push(x); bytes += 8 * c.length; continue; }
        const ks = Object.keys(o), vs = new Array(ks.length);
        for (let j = 0; j < ks.length; j++) { let x; try { x = o[ks[j]]; } catch (e) {} vs[j] = x; if (x && (typeof x === 'object' || typeof x === 'function')) st.push(x); else { nprim++; bytes += typeof x === 'string' ? x.length + 4 : (typeof x === 'boolean' ? 1 : 8); } }
        recs.push([o, 0, ks, vs]); bytes += 8 + 2 * ks.length;
      }
      if (per) per[ri < 0 ? '(fields on functions)' : BIND[ri]] = [nobj - o0, bytes - b0];
    }
    return { recs, lets: v.slice(0, LETS.length), rng: R.rng.s.a, F: R.F, nobj, nprim, bytes, per };
  }
  function restore(s) {
    for (const r of s.recs) {
      const o = r[0];
      if (r[1] === 1) { const c = r[2]; o.length = c.length; for (let j = 0; j < c.length; j++) o[j] = c[j]; }
      else if (r[1] === 2) o.set(r[2]);
      else if (r[1] === 3) { o.clear(); for (const [k, x] of r[2]) o.set(k, x); }
      else if (r[1] === 4) { o.clear(); for (const x of r[2]) o.add(x); }
      else { const ks = r[2], vs = r[3]; const cur = Object.keys(o); let same = cur.length === ks.length; if (same) for (let j = 0; j < ks.length; j++) if (cur[j] !== ks[j]) { same = false; break; }
        if (!same) for (const k of cur) { try { delete o[k]; } catch (e) {} }   // (keys added, removed or reordered: rebuilt in the saved order, as for-in order is part of the state)
        for (let j = 0; j < ks.length; j++) { try { o[ks[j]] = vs[j]; } catch (e) {} } }
    }
    R.set(s.lets); R.rng.s.a = s.rng; R.F = s.F;
  }
  return { calibrate, snapshot, restore, get changed() { return changed; }, get frozen() { return frozen; } };
}
const fieldsOf = (R) => R.win.eval('fighters').map((f) => { const ks = Object.keys(f); const hs = hashAll(R, null, ks.map((k) => f[k])); const o = {}; ks.forEach((k, j) => { o[k] = hs[j]; }); return o; });
const fieldDiff = (A, B) => { const d = new Set(); A.forEach((o, j) => { const p = B[j] || {}; for (const k of new Set([...Object.keys(o), ...Object.keys(p)])) if (o[k] !== p[k]) d.add(k); }); return [...d]; };
const coreOf = (R) => R.win.eval(`JSON.stringify([hazardT, fighters.map(function(f){ return [f.x,f.y,f.vx,f.vy,f.pct,f.stocks,f.dead?1:0]; }), projectiles.map(function(p){ return [p.x,p.y]; })])`) + '|' + R.rng.s.a;

if (MODE === 'snap') {
  const R = await boot({ seed: 7 }); start(R, SC);
  const S = makeSnapper(R); S.calibrate(60, 900);
  const s0 = S.snapshot(true);
  const tS = [], tR = [];
  for (let k = 0; k < 40; k++) { let t = process.hrtime.bigint(); const s = S.snapshot(); tS.push(Number(process.hrtime.bigint() - t) / 1e6); t = process.hrtime.bigint(); S.restore(s); tR.push(Number(process.hrtime.bigint() - t) / 1e6); frame(R, false); }
  // does a restore really rewind? save, run K frames (H1), restore, run the same K frames again (H2); full-state hash and the positions
  const K = 15, rewinds = [];
  for (let rep = 0; rep < 6; rep++) {
    for (let i = 0; i < 97; i++) frame(R, false);
    const s = S.snapshot();
    for (let i = 0; i < K; i++) frame(R, false); const H1 = hashAll(R), C1 = coreOf(R), F1 = fieldsOf(R);
    S.restore(s);
    for (let i = 0; i < K; i++) frame(R, false); const H2 = hashAll(R), C2 = coreOf(R), F2 = fieldsOf(R);
    const d = diffB(H1, H2); rewinds.push({ at: R.F, diff: d.length, coreSame: C1 === C2, names: d.slice(0, 12), fighterFields: fieldDiff(F1, F2).slice(0, 20) });
  }
  const per = Object.entries(s0.per).sort((a, b) => b[1][1] - a[1][1]).slice(0, 15).map(([k, v]) => `${k} ${v[0]} obj ${(v[1] / 1024).toFixed(1)} KB`);
  console.log(JSON.stringify({ scen: SCEN, changedBindings: S.changed.size, frozenObjects: S.frozen.size,
    snapshot: { objects: s0.nobj, primitives: s0.nprim, approxKB: +(s0.bytes / 1024).toFixed(1), recs: s0.recs.length, biggest: per }, snapMs: { mean: mean(tS), p95: pct(tS, 0.95) }, restoreMs: { mean: mean(tR), p95: pct(tR, 0.95) },
    rewindTest: rewinds, errs: R.errs.length }));
  R.win.close();
}

if (MODE === 'loop') {
  // A rollback loop: R saves each frame, plays it, then goes back DEPTH frames and plays them again; T just plays.
  // Same seed, CPUs on every seat. At the end the two must be the same match. Also the cost of one real frame done this way.
  const D = +(process.env.DEPTH || 8);
  const T = await boot({ seed: 7 }); start(T, SC);
  const R = await boot({ seed: 7 }); start(R, SC);
  const S = makeSnapper(R); S.calibrate(60, 900);
  for (let i = 0; i < 960; i++) frame(T, false);
  let ring = []; const cost = [], snapT = [], resT = [], cmpAt = []; let firstBad = null;
  for (let i = 0; i < FRAMES; i++) {
    const t0 = process.hrtime.bigint();
    let t = process.hrtime.bigint(); ring.push(S.snapshot()); snapT.push(Number(process.hrtime.bigint() - t) / 1e6); if (ring.length > D) ring.shift();
    frame(R, false);
    if (ring.length === D) {
      t = process.hrtime.bigint(); const back = ring[0]; S.restore(back); resT.push(Number(process.hrtime.bigint() - t) / 1e6);
      ring = [back];
      for (let j = 0; j < D; j++) { frame(R, false); if (j < D - 1) ring.push(S.snapshot()); }   // (the next real frame pushes the newest)
    }
    cost.push(Number(process.hrtime.bigint() - t0) / 1e6);
    frame(T, false);
    if (i % 60 === 59) { const a = coreOf(T), b = coreOf(R); cmpAt.push(a === b ? 1 : 0); if (a !== b && !firstBad) firstBad = { i, T: a.slice(0, 200), R: b.slice(0, 200) }; }
  }
  const hd = diffB(hashAll(T), hashAll(R));
  console.log(JSON.stringify({ scen: SCEN, depth: D, frames: FRAMES, F: [T.F, R.F], coreChecks: cmpAt.length, coreSame: cmpAt.filter((x) => x).length, firstBad,
    fullStateDiffAtEnd: hd.length, diffNames: hd.slice(0, 20), realFrameMs: { mean: mean(cost), p50: pct(cost, 0.5), p95: pct(cost, 0.95), max: pct(cost, 1) }, snapMs: mean(snapT), restoreMs: mean(resT), errs: [T.errs.length, R.errs.length, R.errs.slice(0, 3)] }));
  T.win.close(); R.win.close();
}


if (MODE === 'blocks') {
  // step cost by 300-frame block (CTF: with its phase and whether the map's CPU navigation graph is built yet)
  const R = await boot({ seed: 7 }); start(R, SC);
  const out = [];
  for (let b = 0; b < FRAMES / 300; b++) {
    const st = []; const r0 = R.cnt.rnd[1];
    for (let i = 0; i < 300; i++) { R.F++; const t = process.hrtime.bigint(); R.win.eval('step()'); st.push(Number(process.hrtime.bigint() - t) / 1e6); }
    const ex = R.win.eval(`(function(){ try{ var n = CTF.navs && CTF.navs[ctfNavId()]; return JSON.stringify({ phase: CTF.live && CTF.live.phase, navReady: !!(n && n.ready), navPending: !!(n && n.pending), live: fighters.filter(function(f){ return !f.dead; }).length, running: running }); }catch(e){ return JSON.stringify({ err: String(e.message).slice(0,80), running: running }); } })()`);
    out.push({ block: b, meanMs: mean(st), p95: pct(st, 0.95), max: pct(st, 1), rndPerFrame: +((R.cnt.rnd[1] - r0) / 300).toFixed(2), ...JSON.parse(ex) });
  }
  console.log(JSON.stringify({ scen: SCEN, blocks: out, errs: R.errs.slice(0, 3) }));
  R.win.close();
}
process.exit(0);
