#!/usr/bin/env node
// THE SIMULATED PLAYTESTER (2026-10-16).
//
// A headless PLAYER, not a CPU: it boots artifacts/V1/index.html in the jsdom harness (test/helpers/load-monolith.js) and plays it the way
// a person would, through the REAL inputs -- KeyboardEvents on the page (so the game's own keydown handlers fill `down[]`) and clicks on the
// real menu buttons -- with a reaction delay, imperfect aim, held keys, mashing, short hops and fast falls, grabs (X+C), specials with and
// without a direction, smashes and finishers, drop-throughs and recoveries. It never sets game state directly except to START a scene
// (a boss number, a race, a Capture the Flag map), the way the existing smoke scripts do.
//
// While it plays it writes down what goes wrong or feels off: exceptions and NaN, screens with no way out, matches that never end, fighters
// that cannot move, inputs that did nothing ("can't" moments), slow frames, how the match went, which moves landed, CPUs that stand still,
// words on screen in a match, and phone wording. The lead runs it whenever the owner and the helpers are idle.
//
//   node scripts/playtest.mjs                        a session of about 12 minutes (--minutes N), rotating sample, seeded
//   node scripts/playtest.mjs --seed 7               the same session again
//   node scripts/playtest.mjs --scene ffa --seed 99  ONE scene, as a finding's repro line prints it (see README-playtest.md)
//   node scripts/playtest.mjs --list                 the scenes
// Output: playtest-out/<timestamp>.json (every finding) and .md (grouped by severity). Ctrl+C writes a partial report and exits.
// One process, Idle priority (it asks for it itself; the lead may also launch it with Start-Process + PriorityClass Idle).

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { loadMonolith } from '../test/helpers/load-monolith.js';
import { mulberry32 } from '../test/helpers/prng.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT);

// ------------------------------------------------------------------------------------------------------------------------------
// arguments
// ------------------------------------------------------------------------------------------------------------------------------
const ARGV = process.argv.slice(2);
const OPT = { minutes: 12, wall: null, seed: null, scene: null, only: null, out: 'playtest-out', verbose: false, matchMin: 3, idle: true, force: false, list: false, args: {} };
for (let i = 0; i < ARGV.length; i++) {
  const a = ARGV[i], nx = () => ARGV[++i];
  if (a === '--minutes') OPT.minutes = +nx();
  else if (a === '--wall-minutes') OPT.wall = +nx();
  else if (a === '--seed') OPT.seed = +nx();
  else if (a === '--scene') OPT.scene = nx();
  else if (a === '--only') OPT.only = nx().split(',');
  else if (a === '--out') OPT.out = nx();
  else if (a === '--match-minutes') OPT.matchMin = +nx();
  else if (a === '--verbose' || a === '-v') OPT.verbose = true;
  else if (a === '--no-idle') OPT.idle = false;
  else if (a === '--force') OPT.force = true;
  else if (a === '--list') OPT.list = true;
  else if (a === '--arg') { const [k, v] = nx().split('='); OPT.args[k] = isNaN(+v) ? v : +v; }
  else if (a === '--help' || a === '-h') { console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(0, 24).join('\n')); process.exit(0); }
}
if (OPT.seed == null) OPT.seed = (Date.now() / 1000 | 0) % 1000003;

// ------------------------------------------------------------------------------------------------------------------------------
// small utilities
// ------------------------------------------------------------------------------------------------------------------------------
const out = (s) => process.stdout.write(s + '\n');
const vlog = (...a) => { if (OPT.verbose) out(a.join(' ')); };
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const now = () => performance.now();
function hashSeed(...parts) { let h = 2166136261 >>> 0; for (const p of parts) { const s = String(p); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } h ^= 0x9e37; h = Math.imul(h, 2654435761) >>> 0; } return h >>> 0; }
const R = {  // rng helpers over a mulberry32 function
  int: (r, a, b) => a + Math.floor(r() * (b - a + 1)),
  pick: (r, arr) => arr[Math.floor(r() * arr.length)],
  chance: (r, p) => r() < p,
  range: (r, a, b) => a + r() * (b - a),
  shuffle: (r, arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
};
let LAST_YIELD = now();
async function maybeYield() { if (now() - LAST_YIELD > 120) { await new Promise((r) => setImmediate(r)); LAST_YIELD = now(); } }
let STOPPING = false;
let WALL_DEADLINE = Infinity;
const cpuMs = () => { const u = process.cpuUsage(); return (u.user + u.system) / 1000; };
let CPU_DEADLINE = Infinity;
const sessionOver = () => STOPPING || now() > WALL_DEADLINE || cpuMs() > CPU_DEADLINE;

// ------------------------------------------------------------------------------------------------------------------------------
// findings
// ------------------------------------------------------------------------------------------------------------------------------
// severity: BUG (broken) > STUCK (no way out / never ends) > SLOW (frames) > FEEL (balance and design signals) > UI (text and layout)
const SEV_ORDER = ['BUG', 'STUCK', 'SLOW', 'FEEL', 'UI'];
const FINDINGS = new Map();
let CUR = { scene: '-', seed: 0, args: {}, frame: 0 };   // the scene being played, for the repro line of whatever is found
function note(sev, kind, msg, data) {
  const key = sev + '|' + kind + '|' + msg;
  let e = FINDINGS.get(key);
  if (!e) { e = { sev, kind, msg, count: 0, repros: [], data: data || null }; FINDINGS.set(key, e); }
  e.count++;
  if (data && !e.data) e.data = data;
  if (e.repros.length < 3 && !e.repros.some((r) => r.scene === CUR.scene && r.seed === CUR.seed)) {
    e.repros.push({ scene: CUR.scene, seed: CUR.seed, args: CUR.args, frame: CUR.frame, cmd: reproCmd(CUR), detail: data && data.detail || undefined });
  }
  vlog(`  [${sev}] ${kind}: ${msg}`);
}
function reproCmd(c) { return `node scripts/playtest.mjs --scene ${c.scene} --seed ${c.seed}` + Object.entries(c.args || {}).map(([k, v]) => ` --arg ${k}=${v}`).join(''); }

// aggregated session statistics for the FEEL section (the report derives its observations from these)
const STATS = {
  scenes: [],            // { scene, seed, args, ms, frames, result }
  matches: [],           // one row per match played
  moves: {},             // "Fighter|move label" -> { fired, landed, dmg }
  cats: {},              // "Fighter|category the player pressed" -> { used, landed, dmg }   (the playtester's own actions)
  fighters: {},          // name -> { matches, wins, kos, deaths }
  perf: {},              // "mode:phase" -> { n, sum, worst, over16 }
  texts: {},             // on-screen text that a match put up (banners) beyond the allowed kinds
  canvasText: {},        // words drawn on the canvas during matches
  cpuIdle: [], bunched: [],
  screens: {},           // screen id -> { buttons, visited }
};

// ------------------------------------------------------------------------------------------------------------------------------
// the world: a booted monolith with the player's hands (keys) and eyes (the banner/hit/KO taps)
// ------------------------------------------------------------------------------------------------------------------------------
// Injected before the game's own script: words drawn on the canvas are captured (the stub context swallows fillText otherwise).
function injectTransform(html) {
  if (OPT.args.html) html = readFileSync(String(OPT.args.html), 'utf8');   // --arg html=PATH: play another build of the game (to reproduce a finding on the build it was found on)
  const pre = `<script>(function(){window.__ptCanvasText=Object.create(null);window.__ptCap=false;var o=HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext=function(){var c=o.apply(this,arguments);return new Proxy(c,{get:function(t,p){
 if(p==='fillText'||p==='strokeText')return function(s){if(window.__ptCap){s=String(s);window.__ptCanvasText[s]=(window.__ptCanvasText[s]||0)+1;}};
 return t[p];},set:function(){return true;}});};})();</script>`;
  return html.replace(/<head[^>]*>/i, (m) => m + pre);
}

const IGNORED_CONSOLE = [/Not implemented/i, /HTMLMediaElement/i, /AudioContext/i, /getContext/i, /navigation/i, /scrollTo/i, /Could not load/i, /Failed to load/i, /ResizeObserver/i];
let CONSOLE_SINK = null;
{
  const real = { error: console.error, warn: console.warn, log: console.log, info: console.info, debug: console.debug };
  const take = (lvl) => (...a) => {
    const s = a.map((x) => (x && x.stack) ? String(x.stack).split('\n').slice(0, 3).join(' | ') : String(x)).join(' ').slice(0, 400);
    if (CONSOLE_SINK) CONSOLE_SINK(lvl, s); else if (OPT.verbose) real[lvl](...a);
  };
  console.error = take('error'); console.warn = take('warn'); console.log = () => {}; console.info = () => {}; console.debug = () => {};
}

const PAGE_HOOKS = `(function(){
  var P = window.__pt = { banners: [], moves: Object.create(null), kos: [], result: null, cat: null, catUntil: 0, cats: Object.create(null), dmgYou: 0, dmgTaken: 0 };
  function wrap(name, mk){ try{ var o = window[name]; if(typeof o === 'function'){ var n = mk(o); window[name] = n; } }catch(e){} }
  wrap('banner', function(o){ return function(t, ms, kind, local){ try{ P.banners.push({ t: String(t), kind: kind || null, f: hazardT }); }catch(e){} return o.apply(this, arguments); }; });
  wrap('armAtk', function(o){ return function(f, len, kind, move){
    try{ var k = f.name + '|' + (move || kind || '?'); var m = P.moves[k] || (P.moves[k] = { fired: 0, landed: 0, dmg: 0 }); m.fired++; f._ptLbl = k; f._ptLblT = hazardT; }catch(e){}
    return o.apply(this, arguments); }; });
  wrap('applyHit', function(o){ return function(t, dmg, kbx, kby, from, opts){
    var before = t ? t.pct : 0, r;
    try{ r = o.apply(this, arguments); }catch(e){ throw e; }
    try{ if(from && t && from !== t && dmg > 0 && t.pct !== before){
      var d = t.pct - before;
      if(from.you){ P.dmgYou += d; if(P.cat && P.catUntil >= hazardT){ var c = from.name + '|' + P.cat; var cc = P.cats[c] || (P.cats[c] = { used: 0, landed: 0, dmg: 0 }); cc.landed++; cc.dmg += d; P.catLanded = true; } }
      if(t.you) P.dmgTaken += d;
      if(from._ptLbl && hazardT - from._ptLblT < 170){ var m = P.moves[from._ptLbl]; if(m){ m.landed++; m.dmg += d; } }
    } }catch(e){}
    return r; }; });
  // the HUD is rebuilt through querySelector every step; in jsdom that is 40% of a frame and says nothing about the game, so it runs every 8th step (the HUD checks still see it)
  wrap('updateHUD', function(o){ var n = 0; return function(){ if((n++ & 7) === 0) return o.apply(this, arguments); }; });
  // --arg prof=1: inclusive time of the systems a slow frame could come from, per frame (the playtester reads it on a spike)
  P.fnT = Object.create(null);
  if(window.__ptProf){ ['ctfNavTick','ctfAiSee','ctfStratTick','ctfPlanWatch','ctfReveal','ctfEditStep','ctfAiHideTick','ctfAiInputRaw','ctfStepKeys','ctfStepFlags','ctfStepElevs','ctfFixStep','ctfAiBegin','ctfEditNav','ctfStepJails','ctfStepZones','ctfAiTrack','aiThink','updateSummons','updateItems','fsStep','teamAiTick','comboInput','ctfRebuildDyn','ctfNavNew','ctfEditSettle','ctfEditResolve'].forEach(function(n){ wrap(n, function(o){ return function(){ var t = performance.now(); try{ return o.apply(this, arguments); } finally{ P.fnT[n] = (P.fnT[n] || 0) + performance.now() - t; } }; }); }); }
  wrap('eliminate', function(o){ return function(f){ try{ P.kos.push({ n: f.name, you: !!f.you, t: hazardT, by: f.lastHitBy != null && fighters[f.lastHitBy] ? fighters[f.lastHitBy].name : null }); }catch(e){} return o.apply(this, arguments); }; });
  wrap('showResult', function(o){ return function(winners, winTeam){ try{ P.result = { winners: (winners || []).map(function(x){ return x && x.name; }), winTeam: winTeam, t: hazardT }; }catch(e){} return o.apply(this, arguments); }; });
})()`;

class World {
  constructor(seed, label) { this.seed = seed; this.label = label; this.held = new Set(); this.heldFor = new Map(); this.frame = 0; this.errs = []; this.msStep = []; }
  static async boot(seed, label) {
    const wo = new World(seed, label);
    const t0 = now();
    CONSOLE_SINK = (lvl, s) => wo.onConsole(lvl, s);
    const { window: w } = loadMonolith(seed, injectTransform);
    wo.w = w; wo.doc = w.document;
    w.addEventListener('error', (e) => wo.onConsole('error', 'window.onerror: ' + (e.message || e.error)));
    w.confirm = () => true; w.alert = () => {}; w.prompt = () => ''; w.open = () => null;
    w.WebSocket = class { constructor() { this.readyState = 3; setTimeout(() => { try { this.onerror && this.onerror({}); this.onclose && this.onclose({ code: 1006 }); } catch (e) { /* offline */ } }, 5); } send() {} close() {} addEventListener() {} removeEventListener() {} };
    // no network, but the game's own files are served from disk like a browser would (the CTF maps' shipped route graphs: without them the runtime graph builder runs and spikes the frame)
    w.fetch = (url) => {
      const u = String(url);
      if (u.startsWith('assets/') || u.startsWith('./assets/')) { const p = path.join(ROOT, 'artifacts', 'V1', u.replace('./', '').split('?')[0]); if (existsSync(p)) { const txt = readFileSync(p, 'utf8'); return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(JSON.parse(txt)), text: () => Promise.resolve(txt) }); } return Promise.resolve({ ok: false, status: 404, json: () => Promise.reject(new Error('404')), text: () => Promise.resolve('') }); }
      return Promise.reject(new Error('offline (playtest)'));
    };
    try { Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: () => Promise.resolve() }, configurable: true }); } catch (e) { /* ignore */ }
    try { await Promise.race([w.eval('profileReady'), sleep(3000)]); } catch (e) { /* ignore */ }
    if (OPT.args.prof) w.__ptProf = true;
    w.eval(PAGE_HOOKS);
    wo.bootMs = now() - t0;
    return wo;
  }
  onConsole(lvl, s) {
    if (IGNORED_CONSOLE.some((re) => re.test(s))) return;
    if (/offline \(playtest\)/.test(s)) return;
    if (lvl === 'error') { this.errs.push(s); note('BUG', 'console-error', clipMsg(s), { detail: s }); }
  }
  E(code) { return this.w.eval(code); }
  close() { try { this.w.close(); } catch (e) { /* ignore */ } CONSOLE_SINK = null; }

  // ---- the keyboard: a real KeyboardEvent on the page body, the way a keypress reaches the game ----
  _fire(type, code, repeat) {
    const w = this.w, ev = new w.KeyboardEvent(type, { code, key: keyName(code), bubbles: true, cancelable: true, repeat: !!repeat });
    (this.doc.activeElement && this.doc.activeElement !== this.doc.body && /^(INPUT|TEXTAREA|SELECT)$/.test(this.doc.activeElement.tagName) ? this.doc.body : this.doc.body).dispatchEvent(ev);
  }
  down(code) { if (this.held.has(code)) return; this.held.add(code); this.heldFor.set(code, 0); this._fire('keydown', code, false); }
  up(code) { if (!this.held.has(code)) return; this.held.delete(code); this.heldFor.delete(code); this._fire('keyup', code, false); }
  tap(code) { this.down(code); this.up(code); }
  releaseAll() { for (const c of [...this.held]) this.up(c); }
  // a key held long enough makes the keyboard repeat it (keydown again with repeat:true, about every other frame after half a second)
  repeatHeld() { for (const [c, n] of this.heldFor) { this.heldFor.set(c, n + 1); if (n > 30 && n % 2 === 0) this._fire('keydown', c, true); } }

  // ---- the mouse: a click on a real button ----
  buttons(scope) {
    const root = scope ? (typeof scope === 'string' ? this.doc.querySelector(scope) : scope) : this.doc;
    if (!root) return [];
    return [...root.querySelectorAll('button,[onclick],a[role=button],summary,.cell,.stagecard,.maprow,.cupchip')].filter((b) => this.visible(b));
  }
  visible(el) {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      if (n.hidden) return false;
      const st = n.style; if (st && (st.display === 'none' || st.visibility === 'hidden')) return false;
      if (n.classList && n.classList.contains('screen') && !n.classList.contains('active')) return false;
    }
    return true;
  }
  btnText(b) { return (b.textContent || '').replace(/\s+/g, ' ').trim(); }
  findBtn(text, scope) { const re = text instanceof RegExp ? text : null; return this.buttons(scope).find((b) => re ? re.test(this.btnText(b)) : this.btnText(b).includes(text)); }
  click(text, scope) { const b = typeof text === 'object' && text.nodeType ? text : this.findBtn(text, scope); if (!b) return false; this.clickEl(b); return true; }
  // a mouse click moves the focus the way a browser does (jsdom's .click() does not): off a text box, onto a button
  clickEl(b) { try { const ae = this.doc.activeElement; if (ae && ae !== b && ae !== this.doc.body && typeof ae.blur === 'function') ae.blur(); if (b.tagName === 'BUTTON' && typeof b.focus === 'function') b.focus(); } catch (e) { /* ignore */ }
    this.lastClick = (b.id ? '#' + b.id + ' ' : '') + (b.textContent || '').replace(/s+/g, ' ').trim().slice(0, 30);
    try { b.click(); } catch (e) { note('BUG', 'click-throws', `click on "${this.btnText(b).slice(0, 30)}" threw: ${clipMsg(String(e && e.message || e))}`, { detail: String(e && e.stack) }); } }
  screen() { const a = [...this.doc.querySelectorAll('.screen.active')].map((s) => s.id); return a.length ? a.join('+') : (this.E('running') ? '(match)' : '(none)'); }
  running() { return !!this.E('running'); }
  stepN(n) { for (let i = 0; i < n; i++) { try { this.w.step(); } catch (e) { note('BUG', 'step-throws', `step() threw: ${clipMsg(e && e.message || e)}`, { detail: String(e && e.stack).split('\n').slice(0, 4).join(' | ') }); return false; } this.frame++; } return true; }
  paused() { return !!this.E('paused'); }
}
// the game ends some things on its own timers (the result screen, the cup hub after a fixture): give them real time
async function settle(wo, ms = 3500) { const t0 = now(); while (now() - t0 < ms && (wo.screen() === '(none)' || wo.screen() === '(match)') && !wo.running()) await sleep(40); }
function scr(wo) { const s = wo.screen().split('+')[0]; return /^[A-Za-z][w-]*$/.test(s) ? '#' + s : '#title'; }
function keyName(code) {
  if (code.startsWith('Key')) return code.slice(3).toLowerCase();
  if (code.startsWith('Arrow')) return code;
  if (code === 'Space') return ' ';
  if (code === 'Escape') return 'Escape';
  if (code.startsWith('Digit')) return code.slice(5);
  return code;
}
function clipMsg(s) { return String(s).replace(/\s+/g, ' ').replace(/\d{3,}/g, 'N').slice(0, 160); }

// ------------------------------------------------------------------------------------------------------------------------------
// reading the match (the player's eyes)
// ------------------------------------------------------------------------------------------------------------------------------
function readMatch(wo) {
  // plain numbers only; one eval per call
  return wo.E(`(function(){
    var me = fighters.find(function(f){ return f.you; }) || fighters.find(function(f){ return f.controller==='local'; });
    var foes = [], i, f;
    for(i=0;i<fighters.length;i++){ f = fighters[i]; if(f !== me && !f.dead && (me ? (f.team !== me.team) : true)) foes.push(f); }
    var bosses = []; for(i=0;i<summons.length;i++){ var s = summons[i]; if(s.type==='boss' && s.hp>0) bosses.push(s); }
    var pc = window.__ptPlat; if(!pc || hazardT - pc.t >= 20 || hazardT < pc.t){ pc = window.__ptPlat = { t: hazardT, plats: platRects(), floors: floors.slice() }; }
    return { me: me, foes: foes, bosses: bosses, gy: groundY(), WW: WW, WH: WH, plats: pc.plats, floors: pc.floors, mode: SETTINGS.mode, t: hazardT };
  })()`);
}

// a fighter's state in one line, for the detail of a finding
function fdiag(wo, f) {
  const ks = Object.keys(f).filter((k) => /^(_jail|_hold|_heldBy|_cf|_ck|_cam|_lag|_selfStun|_ctfJT|_ctfFree|_ghostT|_springT|_trapT|_stall|_nail|_windup|_sm|_mv|_gb|_infected|_grabbed|_plunge|hitstun|frozen|rooted|slowed|weakened|dropping|flying|invuln|atkCd|spCd|smCd|jumps|onground|vx|vy)$/.test(k) && f[k] != null && f[k] !== 0 && f[k] !== false).map((k) => k + '=' + (typeof f[k] === 'object' ? 'obj' : typeof f[k] === 'number' ? Math.round(f[k] * 10) / 10 : f[k]));
  const ph = wo.E('CTF.live ? CTF.live.phase : "-"');
  return `pos ${Math.round(f.x)},${Math.round(f.y)} ctf-phase ${ph} menu ${wo.E('typeof ctfMenuOpen === "function" && ctfMenuOpen()')} state {${ks.join(' ')}}`;
}
// the answer to "did the key I pressed do anything": signature of everything an input can change on a fighter
function sig(f) {
  return [f.atkCd, f.spCd, f.smCd, f.fnCd, f._atkSeq || 0, f._atkAnim, f._spPend, f.jumps, Math.round(f.vx * 4), Math.round(f.vy * 4), f.onground ? 1 : 0, !!f._mv, !!f._hold, !!f._windup, !!f._sm, f._grabbed != null, !!f._gb, f.flying, f.dropping].join(',');
}

// ------------------------------------------------------------------------------------------------------------------------------
// the simulated player
// ------------------------------------------------------------------------------------------------------------------------------
const PERSONAS = {
  // a NEW player: slow, mashes, walks off ledges, rarely uses the fancy moves
  new: { react: [14, 26], mash: 0.045, aggro: 0.6, aim: 0.3, recover: 0.4, walkoff: 0.2, smash: 0.06, special: 0.12, grab: 0.03, shortHop: 0.0, fastFall: 0.0, drop: 0.2, retreat: 0.0, space: false },
  // a TRYHARD: quick, spaces, combos, uses every tool, recovers properly
  tryhard: { react: [7, 13], mash: 0.0, aggro: 0.8, aim: 0.06, recover: 0.97, walkoff: 0.0, smash: 0.25, special: 0.3, grab: 0.18, shortHop: 0.7, fastFall: 0.7, drop: 0.8, retreat: 0.35, space: true },
  // an EXPLORER: walks everywhere, presses every key
  explorer: { react: [9, 20], mash: 0.09, aggro: 0.25, aim: 0.25, recover: 0.6, walkoff: 0.1, smash: 0.12, special: 0.2, grab: 0.1, shortHop: 0.2, fastFall: 0.2, drop: 0.5, retreat: 0.1, space: false, wander: true },
};
const MOVE_KEYS = { left: 'ArrowLeft', right: 'ArrowRight', up: 'ArrowUp', down: 'ArrowDown', atk: 'KeyX', sp: 'KeyC', sm: 'KeyV' };

class Player {
  constructor(wo, rng, personaName, opt) {
    this.wo = wo; this.r = rng; this.name = personaName; this.p = PERSONAS[personaName]; this.opt = opt || {};
    this.nextThink = 0; this.plan = { move: 0, hold: new Set() }; this.taps = []; this.hist = []; this.probes = [];
    this.stuckT = 0; this.lastPos = null; this.canted = {}; this.exploreKeys = ['Tab', 'Enter', 'KeyQ', 'KeyE', 'KeyP', 'KeyB', 'KeyZ', 'Digit1', 'Space', 'ShiftLeft', 'Backspace', 'KeyR_'];
    this.firstKoSeen = false; this.edgeWalk = 0; this.doneAt = 0;
    this.stats = { actions: {}, cants: 0, stuck: 0 };
  }
  // schedule a tap: keys held for `dur` frames starting `at` frames from now
  queue(keys, at, dur, cat, probe) { this.taps.push({ keys, at, dur, cat, probe, on: false }); }
  perceive(S) {
    const cp = (f) => ({ x: f.x, y: f.y, vx: f.vx, vy: f.vy, pct: f.pct, hitstun: f.hitstun, hp: f.hp, r: f.r, face: f.face, onground: f.onground });
    this.hist.push({ me: S.me && cp(S.me), foes: S.foes.map(cp), bosses: S.bosses.map(cp), t: S.t }); if (this.hist.length > 40) this.hist.shift();
    const d = clamp(this.delay, 0, this.hist.length - 1);
    return this.hist[this.hist.length - 1 - d] || S;
  }
  // called once per frame BEFORE step(): decide, then press and release keys
  tick(S) {
    const wo = this.wo, p = this.p, me = S.me;
    if (!me || me.dead) { this.releaseAll(); return; }
    if (this.delay == null) this.delay = R.int(this.r, p.react[0], p.react[1]);
    const P = this.perceive(S);
    // think on a reaction timer
    if (S.t >= this.nextThink) { this.think(S, P); this.nextThink = S.t + R.int(this.r, p.react[0], p.react[1]); this.delay = R.int(this.r, p.react[0], p.react[1]); }
    // mashing: a random key now and then, whatever is going on
    if (p.mash && this.r() < p.mash) { const k = R.pick(this.r, [MOVE_KEYS.atk, MOVE_KEYS.atk, MOVE_KEYS.sp, MOVE_KEYS.sm, MOVE_KEYS.up, MOVE_KEYS.down]); this.queue([k], 0, R.int(this.r, 1, 4), 'mash'); }
    if (p.wander && this.r() < 0.004) { const k = R.pick(this.r, this.exploreKeys); if (k !== 'KeyR_' && k !== 'Escape') this.queue([k], 0, R.int(this.r, 1, 5), 'explore'); }
    // desired key set = the held movement + the taps in flight
    const want = new Set(this.plan.hold);
    for (const t of this.taps) {
      if (t.at > 0) { t.at--; continue; }
      if (t.dur > 0) { for (const k of t.keys) want.add(k); if (!t.on) { t.on = true; if (t.probe) this.armProbe(t.probe, me); } t.dur--; }
    }
    this.taps = this.taps.filter((t) => t.dur > 0 || t.at > 0);
    for (const k of [...wo.held]) if (!want.has(k)) wo.up(k);
    for (const k of want) wo.down(k);
    wo.repeatHeld();
    this.watchProbes(S, me);
    this.watchStuck(S, me);
  }
  releaseAll() { this.plan.hold = new Set(); this.taps = []; this.wo.releaseAll(); }
  holdMove(dir) { const h = new Set(); if (dir < 0) h.add(MOVE_KEYS.left); if (dir > 0) h.add(MOVE_KEYS.right); this.plan.hold = h; this.plan.move = dir; }

  // ---------------------------------------------------------------- what a person would do next
  think(S, P) {
    const wo = this.wo, p = this.p, r = this.r, me = P.me || S.me, real = S.me;
    if (!me) return;
    const ready = real.hitstun <= 0 && !(real.frozen > 0) && !(real._lag > 0) && real._heldBy == null;
    const surfaces = this.surfaces(S);
    const off = this.offStage(real, S, surfaces);
    // 1. recovery
    if (off) { this.recover(S, real, surfaces); return; }
    // the target: the nearest foe (or boss) by what the player saw a moment ago
    const foes = (P.foes && P.foes.length ? P.foes : []).concat(P.bosses || []);
    let tgt = null, best = 1e9;
    for (const f of foes) { const d = Math.abs(f.x - me.x) + Math.abs(f.y - me.y) * 1.3; if (d < best) { best = d; tgt = f; } }
    // an explorer walks the stage instead of fighting, until someone is on top of it
    if (p.wander && (!tgt || best > 160)) { this.wander(S, real, surfaces); this.reflex(S, real, tgt); return; }
    if (!tgt) { this.holdMove(0); return; }
    const dx = tgt.x - me.x, dy = tgt.y - me.y, ax = Math.abs(dx), ay = Math.abs(dy), dirT = Math.sign(dx) || real.face || 1;
    const tooClose = p.space && ax < 55 && r() < p.retreat;
    // spacing and approach
    let want = 0;
    const rng = p.space ? 85 + r() * 25 : 40 + r() * 60;
    if (ax > rng) want = dirT; else if (tooClose) want = -dirT;
    // a new player is sloppy: sometimes walks the wrong way, or keeps walking past the foe
    if (!p.space && r() < p.aim * 0.5) want = r() < 0.5 ? -want : want;
    // do not walk off the edge on purpose unless a new player (walkoff)
    if (want !== 0 && real.onground && this.edgeAhead(real, want, S, surfaces) && !(r() < p.walkoff)) want = 0;
    this.holdMove(want);
    this.hop(S, real, tgt, dx, dy);
    if (!ready) return;
    this.fight(S, real, tgt, dx, dy, ax, ay, dirT);
  }
  // jump / short hop / fast fall / drop through
  hop(S, me, tgt, dx, dy) {
    const p = this.p, r = this.r;
    if (me.onground) {
      if (dy < -90 && Math.abs(dx) < 260) { this.queue([MOVE_KEYS.up], 0, p.shortHop && r() < p.shortHop ? 2 : R.int(r, 6, 11), 'hop'); }
      else if (dy > 110 && this.onThinPlat(me, S) && r() < p.drop) { this.queue([MOVE_KEYS.down], 0, 8, 'drop'); }
      else if (r() < (p.wander ? 0.1 : 0.05)) { this.queue([MOVE_KEYS.up], 0, p.shortHop && r() < p.shortHop ? 2 : R.int(r, 5, 10), 'hop'); }
    } else {
      // a second jump when the first has run out of steam
      if (me.jumps > 0 && me.vy > 1 && r() < 0.4) this.queue([MOVE_KEYS.up], 0, 3, 'djump');
      if (p.fastFall && me.vy > 0 && me.vy < 4 && dy > 40 && r() < p.fastFall) this.queue([MOVE_KEYS.down], 0, 10, 'fastfall');
    }
  }
  fight(S, me, tgt, dx, dy, ax, ay, dirT) {
    const p = this.p, r = this.r;
    const horizontal = dirT > 0 ? MOVE_KEYS.right : MOVE_KEYS.left;
    // aim error: a new player sometimes swings at the wrong side or too early
    const sloppy = r() < p.aim;
    const faceKey = sloppy ? (dirT > 0 ? MOVE_KEYS.left : MOVE_KEYS.right) : horizontal;
    const close = ax < 95 && ay < 80, mid = ax < 380 && ay < 200;
    const airborne = !me.onground;
    const pickCat = r();
    const cats = this.stats.actions;
    const act = (cat, keys, dur, probe) => { cats[cat] = (cats[cat] || 0) + 1; this.queue(keys, 0, dur || 2, cat, probe); this.markCat(cat); };
    if (close) {
      if (me.fnCd === 0 && p.grab > 0 && pickCat < 0.03 + (p.space ? 0.05 : 0)) return act('finisher', [MOVE_KEYS.sm, MOVE_KEYS.sp], 2, { type: 'fin' });
      if (pickCat < p.grab) return act('grab', [MOVE_KEYS.atk, MOVE_KEYS.sp], 2, { type: 'grab' });
      if (me.smCd === 0 && pickCat < p.grab + p.smash) return act('smash', [MOVE_KEYS.sm].concat(r() < 0.5 ? [faceKey] : []), R.int(r, 2, 6), { type: 'smash' });
      if (me.spCd === 0 && pickCat < p.grab + p.smash + p.special) {
        const v = r(); const dirKey = v < 0.4 ? [] : v < 0.7 ? [faceKey] : v < 0.85 ? [MOVE_KEYS.up] : [MOVE_KEYS.down];
        return act(v < 0.4 ? 'special' : v < 0.7 ? 'sideSpecial' : v < 0.85 ? 'upSpecial' : 'downSpecial', [MOVE_KEYS.sp].concat(dirKey), 2, { type: 'special' });
      }
      // normals: jab, tilts, aerials
      if (airborne) { const v = r(); const k = v < 0.25 ? [MOVE_KEYS.up] : v < 0.45 ? [MOVE_KEYS.down] : v < 0.7 ? [faceKey] : []; return act('aerial', [MOVE_KEYS.atk].concat(k), 2, { type: 'atk' }); }
      if (dy < -50) return act('upTilt', [MOVE_KEYS.atk, MOVE_KEYS.up], 2, { type: 'atk' });
      const v = r();
      if (v < 0.5) return act('jab', [MOVE_KEYS.atk], 2, { type: 'atk' });
      if (v < 0.8) return act('tilt', [MOVE_KEYS.atk, faceKey], 3, { type: 'atk' });
      return act('downTilt', [MOVE_KEYS.atk, MOVE_KEYS.down], 3, { type: 'atk' });
    }
    if (mid && me.spCd === 0 && r() < p.special * 0.6) return act('rangedSpecial', [MOVE_KEYS.sp].concat(r() < 0.6 ? [faceKey] : []), 2, { type: 'special' });
    if (mid && !close && r() < p.aggro * 0.12) return act(airborne ? 'aerial' : 'jab', [MOVE_KEYS.atk], 2, { type: 'atk' });   // swinging at air on the way in
  }
  markCat(cat) { try { const P = this.wo.w.__pt; P.cat = cat; P.catUntil = this.wo.E('hazardT') + 45; } catch (e) { /* ignore */ } }
  wander(S, me, surfaces) {
    const r = this.r;
    if (this.wanderDir == null || r() < 0.03) this.wanderDir = r() < 0.5 ? -1 : 1;
    if (me.x < 60) this.wanderDir = 1; else if (me.x > S.WW - 60) this.wanderDir = -1;
    if (me.onground && this.edgeAhead(me, this.wanderDir, S, surfaces) && r() < 0.8) this.wanderDir = -this.wanderDir;
    this.holdMove(this.wanderDir);
    if (me.onground && r() < 0.25) this.queue([MOVE_KEYS.up], 0, R.int(r, 3, 10), 'hop');
  }
  // a reflex: someone is right next to the player
  reflex(S, me, tgt) { if (!tgt) return; const ax = Math.abs(tgt.x - me.x), ay = Math.abs(tgt.y - me.y); if (ax < 90 && ay < 80 && this.r() < 0.5) this.queue([MOVE_KEYS.atk], 0, 2, 'jab'); }

  surfaces(S) {
    const out = [];
    for (const p of S.plats || []) out.push({ x: p.x, y: p.y, w: p.w, solid: !!p.solid, thin: !p.solid });
    for (const f of S.floors || []) out.push({ x: f.x, y: f.y, w: f.w, solid: true, thin: false });
    if (!(S.floors && S.floors.length)) out.push({ x: -40, y: S.gy, w: S.WW + 80, solid: true, thin: false });
    return out;
  }
  offStage(me, S, surfaces) {
    if (me.onground) return false;
    if (me.x < -20 || me.x > S.WW + 20) return true;
    if (me.y > S.gy + 30) return true;
    return false;
  }
  edgeAhead(me, dir, S, surfaces) {
    const feet = me.y + me.r, ax = me.x + dir * 40;
    for (const s of surfaces) if (ax >= s.x - 6 && ax <= s.x + s.w + 6 && Math.abs(feet - s.y) <= 12) return false;
    return true;
  }
  onThinPlat(me, S) { const feet = me.y + me.r; for (const p of S.plats || []) if (!p.solid && !p.rot && me.x >= p.x - 2 && me.x <= p.x + p.w + 2 && Math.abs(feet - p.y) <= 5) return true; return false; }
  recover(S, me, surfaces) {
    const p = this.p, r = this.r;
    // aim for the nearest surface at or below the hands, else the middle of the world
    let tx = S.WW / 2, ty = S.gy;
    let bd = 1e9;
    for (const s of surfaces) { if (s.y < me.y - 300) continue; const cx = clamp(me.x, s.x + 20, s.x + s.w - 20), d = Math.abs(cx - me.x) + Math.abs(s.y - me.y); if (d < bd) { bd = d; tx = cx; ty = s.y; } }
    const skilled = r() < p.recover;
    const dir = Math.sign(tx - me.x);
    this.holdMove(skilled ? dir : (r() < 0.5 ? dir : 0));
    if (!skilled) { if (me.onground === false && me.jumps > 0 && r() < 0.15) this.queue([MOVE_KEYS.up], 0, 3, 'djump'); return; }
    if (me.jumps > 0 && me.vy > -2) this.queue([MOVE_KEYS.up], 0, 3, 'djump');
    else if (me.jumps <= 0 && me.spCd === 0 && me.y > ty - 40 && r() < 0.5) { this.markCat('upSpecial'); this.queue([MOVE_KEYS.up, MOVE_KEYS.sp], 0, 3, 'upSpecial', { type: 'special' }); this.stats.actions.recoverySpecial = (this.stats.actions.recoverySpecial || 0) + 1; }
  }

  // ---------------------------------------------------------------- "can't" moments: the key was pressed and nothing happened
  armProbe(pr, me) {
    if (me.hitstun > 0 || me.frozen > 0 || me._lag > 0 || me._heldBy != null || me.rooted > 0 || me._selfStun > 0 || me.dead) return;   // not a fair test
    if (!OPT.args.legacy && (me._jail != null || me._cam || me._ctfJT > 0 || this.wo.E('(typeof ctfMenuOpen === "function" && ctfMenuOpen()) || (SETTINGS.mode === "ctf" && CTF.live && CTF.live.phase !== "play")'))) return;   // a prisoner, the free camera, the planning menu, a hiding phase: the game takes the keys on purpose
    const t = pr.type;
    if (t === 'atk' && me.atkCd > 0) return;
    if (t === 'special' && (me.spCd > 0 || me.atkCd > 12)) return;
    if (t === 'smash' && (me.smCd > 0 || me.atkCd > 12)) return;
    if (t === 'grab' && me.atkCd > 12) return;
    if (t === 'fin' && me.fnCd > 0) return;
    this.probes.push({ type: t, t0: this.wo.frame, sig0: sig(me), seq0: me._atkSeq || 0, np: this.wo.E('projectiles.length + summons.length + beams.length'), ok: false, name: me.name, cat: this.wo.E('window.__pt.cat') });
  }
  watchProbes(S, me) {
    if (!this.probes.length) return;
    const f = this.wo.frame, np = this.wo.E('projectiles.length + summons.length + beams.length');
    const cur = sig(me);
    for (const pr of this.probes) {
      if (!pr.ok && (cur !== pr.sig0 || np !== pr.np)) pr.ok = true;
      if (!pr.ok && me.hitstun > 0) pr.ok = true;   // got hit meanwhile: not fair
      if (!pr.ok && (me.frozen > 0 || me._heldBy != null || me.dead)) pr.ok = true;
      if (!pr.ok && f - pr.t0 > 14) { pr.ok = true; pr.bad = true; }
    }
    for (const pr of this.probes) if (pr.bad) {
      this.stats.cants++;
      note('BUG', 'cant', `${pr.name}: "${pr.type === 'atk' ? 'attack (X)' : pr.type === 'special' ? 'special (C)' : pr.type === 'smash' ? 'smash (V)' : pr.type === 'grab' ? 'grab (X+C)' : 'finisher (V+C)'}" was pressed on a ready fighter and nothing happened for 14 frames`,
        { detail: `fighter ${pr.name}, move ${pr.type}, the player's action ${pr.cat}, frame ${pr.t0}, mode ${S.mode}; ${fdiag(this.wo, me)}` });
    }
    this.probes = this.probes.filter((pr) => !pr.ok);
  }
  // a fighter that holds a move key and goes nowhere for 10 s
  watchStuck(S, me) {
    const f = this.wo.frame;
    const moving = this.plan.hold.size > 0;
    if (!OPT.args.legacy && this.wo.E('(typeof ctfMenuOpen === "function" && ctfMenuOpen())')) { this.lastPos = null; return; }
    const busy = me.hitstun > 0 || me.frozen > 0 || me._heldBy != null || me.rooted > 0 || me.dead || me._jail != null || me._lag > 0;
    if (!this.lastPos || busy || !moving) { this.lastPos = { x: me.x, y: me.y, f, hops: 0 }; return; }
    if (this.wo.held.has(MOVE_KEYS.up) && !this._upWas) this.lastPos.hops = (this.lastPos.hops || 0) + 1;
    this._upWas = this.wo.held.has(MOVE_KEYS.up);
    if (Math.abs(me.x - this.lastPos.x) > 12 || Math.abs(me.y - this.lastPos.y) > 12) { this.lastPos = { x: me.x, y: me.y, f, hops: 0 }; return; }
    if (!OPT.args.legacy && f - this.lastPos.f >= 600 && (this.lastPos.hops || 0) < 3) { this.lastPos.f = f - 300; return; }   // a wall the player never tried to jump over is not a bug
    if (f - this.lastPos.f >= 600) {
      this.stats.stuck++;
      note('STUCK', 'fighter-stuck', `${me.name}: held a move key for 10 s and did not move (mode ${S.mode})`, { detail: `stage=${this.wo.E('stage.id')} ${fdiag(this.wo, me)}` });
      this.lastPos = { x: me.x, y: me.y, f, hops: 0 };
    }
  }
}

// ------------------------------------------------------------------------------------------------------------------------------
// the frame loop: one step of the game, the way loop() takes it, with every watcher on
// ------------------------------------------------------------------------------------------------------------------------------
const ALLOWED_BANNER = (b) => b.t === 'GO!' || /^(KO'd!|You're out!|CAKE AT STAKE:)/.test(b.t) || b.kind === 'boss' || b.kind === 'sys';

class Sim {
  constructor(wo, opt) {
    this.wo = wo; this.opt = opt || {}; this.player = null; this.f = 0; this.bannerSeen = 0; this.slow = [];
    this.idleCpu = new Map(); this.bunchT = 0; this.perfAcc = { n: 0, sum: 0, worst: 0, over16: 0, worstAt: '' };
    this.drawEvery = this.opt.drawEvery || 4; this.matchStart = wo.E('hazardT'); this.cpu = new Map(); this.textPhases = new Set();
    this.hudBad = false; this.state0 = null;
  }
  // one frame; false when the match is not running (ended, left, paused)
  frame() {
    const wo = this.wo, w = wo.w;
    if (!wo.running() || wo.paused()) return false;
    const S = readMatch(wo);
    if (this.player) this.player.tick(S);
    if (OPT.args.prof) w.__pt.fnT = Object.create(null);
    const t0 = now();
    try { w.step(); } catch (e) { note('BUG', 'step-throws', `step() threw: ${clipMsg(e && e.message || e)}`, { detail: String(e && e.stack).split('\n').slice(0, 4).join(' | ') }); this.thrown = (this.thrown || 0) + 1; if (this.thrown > 5) return false; }
    const t1 = now();
    if (this.f % this.drawEvery === 0) { try { w.draw(); } catch (e) { note('BUG', 'draw-throws', `draw() threw: ${clipMsg(e && e.message || e)}`, { detail: String(e && e.stack).split('\n').slice(0, 4).join(' | ') }); this.thrownD = (this.thrownD || 0) + 1; if (this.thrownD > 5) return false; } }
    const dt = t1 - t0;
    if (OPT.args.prof && dt > 40 && this.f > 90) { const top = Object.entries(w.__pt.fnT).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k} ${v.toFixed(0)}ms`); (STATS.spikes = STATS.spikes || []).push({ scene: CUR.scene, seed: CUR.seed, frame: this.f, ms: +dt.toFixed(0), phase: S.mode + ':' + (S.mode === 'ctf' ? this.wo.E('CTF.live ? CTF.live.phase : "-"') : 'play'), top }); }
    this.f++; wo.frame++; CUR.frame = wo.frame;
    this.perf(dt, S);
    if (this.f % 10 === 0) this.watch(S);
    return true;
  }
  perf(dt, S) {
    if (this.f < 90) return;   // warm-up: the first frames compile things
    const phase = S.mode + ':' + (S.mode === 'ctf' ? (this.wo.E('CTF.live ? CTF.live.phase : "-"')) : 'play');
    const a = STATS.perf[phase] || (STATS.perf[phase] = { n: 0, sum: 0, worst: 0, over16: 0, over50: 0, worstScene: '' });
    a.n++; a.sum += dt; if (dt > 16) a.over16++; if (dt > 50) a.over50++;
    (a.s || (a.s = [])); if (a.s.length < 6000) a.s.push(dt); else a.s[(Math.random() * 6000) | 0] = dt;
    if (dt > a.worst) { a.worst = dt; a.worstScene = `${CUR.scene}#${CUR.seed}@${wo2(this)}`; }
    const pa = this.perfAcc; pa.n++; pa.sum += dt; if (dt > 16) pa.over16++; if (dt > pa.worst) { pa.worst = dt; pa.worstAt = phase; }
  }
  watch(S) {
    const wo = this.wo, w = wo.w;
    if (w.__loopErrLogged) { note('BUG', 'loop-error', 'the game loop error flag (__loopErrLogged) is set', { detail: 'the red ERROR banner would show in a real run' }); w.__loopErrLogged = false; }
    const fs = wo.E('fighters');
    for (const f of fs) {
      if (!Number.isFinite(f.x) || !Number.isFinite(f.y) || !Number.isFinite(f.vx) || !Number.isFinite(f.vy) || !Number.isFinite(f.pct)) {
        note('BUG', 'nan', `${f.name}: x/y/vx/vy/pct is NaN or Infinity (x=${f.x} y=${f.y} vx=${f.vx} vy=${f.vy} pct=${f.pct})`); }
      else if (!f.dead && (f.x < -3000 || f.x > S.WW + 3000 || f.y < -3500 || f.y > S.WH + 3500)) note('BUG', 'out-of-bounds', `${f.name}: alive and far outside the world (x=${Math.round(f.x)} y=${Math.round(f.y)})`);
    }
    // text bugs on the HUD
    if (!this.hudBad) { const txt = (wo.doc.getElementById('hud') || {}).textContent || ''; if (/undefined|NaN|\[object|null%/.test(txt)) { this.hudBad = true; note('BUG', 'hud-text', `the HUD shows "${(txt.match(/.{0,20}(undefined|NaN|\[object|null%).{0,10}/) || [''])[0].trim()}"`); } }
    // words put up by banner() that a match may not show
    const B = wo.w.__pt.banners;
    while (this.bannerSeen < B.length) { const b = B[this.bannerSeen++]; if (!ALLOWED_BANNER(b) && !(this.opt.bannerOK && this.opt.bannerOK(b)) && !wo.E('TUT.active || TOURNEY.active')) { const key = b.t.replace(/\d+/g, 'N').slice(0, 60); STATS.texts[key] = (STATS.texts[key] || 0) + 1; note('UI', 'stray-banner', `a match shows "${key}" (banner kind ${b.kind || 'none'}; only GO!, KO lines, boss and system lines are allowed)`, { detail: `${CUR.scene} ${wo.E('SETTINGS.mode')} frame ${this.f}` }); } }
    // CPU behaviour
    if (S.mode !== 'ctf' || this.opt.cpuWatchCtf) this.watchCpu(S, fs);
  }
  watchCpu(S, fs) {
    const live = fs.filter((f) => !f.dead && f.controller !== 'local' && !f.you && f.controller !== 'still' && f.controller !== 'trainer' && f.controller !== 'remote');
    const foesAlive = fs.filter((f) => !f.dead).length > 1 && (S.mode !== 'boss' || (S.bosses && S.bosses.length > 0));   // Boss Rush: the gap between two bosses is not idling
    for (const f of live) {
      let c = this.cpu.get(f.idx);
      const s = [Math.round(f.x / 3), Math.round(f.y / 3), f.atkCd, f.spCd, f.jumps, f._atkSeq || 0].join(',');
      if (!c) { c = { s, t: this.f, reported: false }; this.cpu.set(f.idx, c); continue; }
      if (!foesAlive) { c.t = this.f; c.s = s; continue; }
      if (c.s !== s || f.hitstun > 0 || f.frozen > 0 || f._heldBy != null || f.invuln > 100 || f.rooted > 0 || f._jail != null) { c.s = s; c.t = this.f; c.reported = false; }
      else if (this.f - c.t >= 600 && !c.reported && foesAlive && S.t > 240) {
        c.reported = true;
        STATS.cpuIdle.push({ fighter: f.name, mode: S.mode, stage: this.wo.E('stage.id'), scene: CUR.scene, seed: CUR.seed });
        note('FEEL', 'cpu-idle', `a CPU (${f.name}) did not move or act for 10 s in a ${S.mode} match while foes were alive`, { detail: `${f.name} on ${this.wo.E('stage.id')}; aiMode ${f.aiMode} aiTarget ${f.aiTarget ? (f.aiTarget.name || f.aiTarget.type) : 'none'} aiTimer ${Math.round(f.aiTimer)}; boss ${this.wo.E('(function(){ var b = summons.find(function(s){return s.type==="boss"}); return b ? b.name + " tel " + b._telKind + " phase " + b._phase + " x" + Math.round(b.x) + " y" + Math.round(b.y) : "none"; })()')}; ${fdiag(this.wo, f)}` });
      }
    }
    // bunched in a corner
    if (this.f % 60 === 0 && live.length >= 3 && S.mode !== 'boss') {
      const calm = (f) => !live.some((g) => g.team !== f.team && Math.hypot(g.x - f.x, g.y - f.y) < 450);   // a brawl at the spawn is a fight, not bunching
      const nearL = live.filter((f) => f.x < S.WW * 0.18 && calm(f)).length, nearR = live.filter((f) => f.x > S.WW * 0.82 && calm(f)).length;
      if (nearL >= 3 || nearR >= 3) this.bunchT += 60; else this.bunchT = Math.max(0, this.bunchT - 120);
      if (this.bunchT >= 600) { this.bunchT = -3000; STATS.bunched.push({ scene: CUR.scene, seed: CUR.seed, mode: S.mode }); note('FEEL', 'cpu-bunched', `3 or more CPUs stood bunched in one corner of the ${S.mode} arena for 10 s`, { detail: `stage ${this.wo.E('stage.id')}, WW ${S.WW}; ${live.map((f) => f.name + ' team' + f.team + ' x' + Math.round(f.x) + ' y' + Math.round(f.y) + ' mode' + f.aiMode + ' tgt ' + (f.aiTarget ? f.aiTarget.name : '-')).join(', ')}` }); }
    }
  }
}
function wo2(sim) { return sim.f; }

// ------------------------------------------------------------------------------------------------------------------------------
// the front door: menus, the way a person gets into a match (clicks on the real buttons)
// ------------------------------------------------------------------------------------------------------------------------------
async function toSelect(wo) {
  // title -> (first run: the tutorial card, Skip) -> the fighter select
  if (wo.screen() !== 'title') { wo.E("go('title')"); }
  if (!wo.click(/Take the Plunge/)) { note('BUG', 'menu', 'the title has no "Take the Plunge" button'); return false; }
  if (wo.screen() === 'tutorial') { if (!wo.click(/^Skip$/)) { note('STUCK', 'menu', 'the tutorial card has no Skip button'); return false; } }
  if (wo.screen() !== 'select') { note('BUG', 'menu', `Take the Plunge landed on "${wo.screen()}", not the fighter select`); return false; }
  return true;
}
// fighters that exist on the board for a fresh profile; "Unlock every fighter" is the real toggle for the rest
function boardNames(wo) { return wo.E(`ROSTER.filter(function(r){ return r.play && !r.prize; }).map(function(r){ return r.name; })`); }
function pickFighter(wo, name) {
  if (wo.findBtn(/Unlock every fighter/)) wo.click(/Unlock every fighter/);
  const cell = wo.buttons('#board').find((c) => c.title === name || (c.querySelector('.cellname') && c.querySelector('.cellname').textContent === name));
  if (!cell) { note('BUG', 'menu', `the select board has no cell for ${name}`); return false; }
  wo.clickEl(cell);
  const got = wo.E('chosen && chosen.name');
  if (got !== name) { note('BUG', 'menu', `clicked ${name} on the board but the pick is ${got}`); return false; }
  return true;
}
function pickStage(wo, id) {
  const name = wo.E(`(STAGES.find(function(s){ return s.id===${JSON.stringify(id)}; })||{}).name`);
  if (!name) return false;
  wo.click('#stageBtn' && wo.doc.getElementById('stageBtn'));
  const card = wo.buttons('#stagepick').find((c) => c.querySelector('b') && c.querySelector('b').textContent.startsWith(name));
  if (!card) { note('BUG', 'menu', `the stadium list has no card for ${name}`); return false; }
  wo.clickEl(card);
  return wo.E('stage.id') === id;
}
function seg(wo, id, v) {
  const b = [...wo.doc.querySelectorAll('#' + id + ' button')].find((x) => x.dataset.v === String(v) || wo.btnText(x) === String(v));
  if (!b) return false; wo.clickEl(b); return true;
}
function startFromSelect(wo) {
  const before = wo.screen();
  wo.clickEl(wo.doc.getElementById('startBtn'));
  return wo.running();
}

// ------------------------------------------------------------------------------------------------------------------------------
// scenes
// ------------------------------------------------------------------------------------------------------------------------------
const SCENES = {};
const MATCH_CAP_FRAMES = () => Math.round(OPT.matchMin * 3600);

// bookkeeping every match scene shares
function closeMatch(wo, sim, tag, extra) {
  const P = wo.w.__pt;
  const res = P.result, kos = P.kos.slice();
  const youKos = kos.filter((k) => k.you);
  const row = { scene: CUR.scene, seed: CUR.seed, tag, frames: sim.f, secs: Math.round(sim.f / 60), mode: wo.E('SETTINGS.mode'), stage: wo.E('stage.id'),
    result: res, kos: kos.length, youKoAt: youKos.length ? Math.round(youKos[0].t / 60) : null, dmgYou: Math.round(P.dmgYou), dmgTaken: Math.round(P.dmgTaken), persona: extra && extra.persona, you: extra && extra.you, ended: !wo.running() || wo.screen() === 'result' };
  STATS.matches.push(row);
  for (const [k, v] of Object.entries(P.moves)) { const a = STATS.moves[k] || (STATS.moves[k] = { fired: 0, landed: 0, dmg: 0 }); a.fired += v.fired; a.landed += v.landed; a.dmg += v.dmg; }
  for (const [k, v] of Object.entries(P.cats)) { const a = STATS.cats[k] || (STATS.cats[k] = { used: 0, landed: 0, dmg: 0 }); a.landed += v.landed; a.dmg += v.dmg; }
  const acts = sim.player && ((sim.player.stats && sim.player.stats.actions) || (sim.player.brain && sim.player.brain.stats.actions)); if (acts) for (const [cat, n] of Object.entries(acts)) { const k = (extra && extra.you || '?') + '|' + cat; const a = STATS.cats[k] || (STATS.cats[k] = { used: 0, landed: 0, dmg: 0 }); a.used += n; }
  for (const f of wo.E('fighters')) { const a = STATS.fighters[f.name] || (STATS.fighters[f.name] = { matches: 0, wins: 0, kos: 0, deaths: 0, asYou: 0 }); a.matches++; a.kos += f.killCount || 0; a.deaths += f.deaths || 0; if (f.you) a.asYou++; }
  if (res && res.winners) for (const n of res.winners) { const a = STATS.fighters[n]; if (a) a.wins++; }
  return row;
}
// run a match to its end (or the cap); returns why it stopped
async function playOut(wo, sim, capFrames, until, stuckOnCap) {
  const cap = capFrames || MATCH_CAP_FRAMES();
  let calmT = 0;
  while (sim.f < cap) {
    if (sessionOver()) return 'interrupted';
    if (!sim.frame()) break;
    if (until && until(sim)) return 'until';
    if (sim.f % 120 === 0) await maybeYield();
  }
  if (sim.f >= cap && wo.running()) {
    // a stalemate is a match where nobody has lost a stock for the last minute; a match that is merely long is a design signal (an explorer never fights, so it says nothing)
    const lastKo = wo.w.__pt.kos.reduce((m, k) => Math.max(m, k.t), 0), now0 = wo.E('hazardT'), stale = now0 - lastKo > 3600, explorer = sim.player && sim.player.name === 'explorer';
    if (explorer && !wo.E('TOURNEY.active')) return 'cap';
    const stuck = stuckOnCap && stale;
    note(stuck ? 'STUCK' : 'FEEL', stuck ? 'match-never-ends' : 'long-match', `${wo.E('SETTINGS.mode')} match on ${wo.E('stage.id')} ${stuck ? 'is a stalemate: no stock lost for a minute and it did not end in' : 'was still going after'} ${Math.round(cap / 3600)} min of game time`, { detail: `${wo.E('fighters.map(function(f){return f.name+":"+f.stocks+"/"+Math.round(f.pct)}).join(" ")')}` });
    return 'cap';
  }
  return wo.screen() === 'result' ? 'result' : (wo.running() ? 'running' : 'ended');
}

// pick a fighter by coverage: the ones played least so far come first
function chooseFighter(wo, rng, args) {
  if (wo.findBtn(/Unlock every fighter/)) wo.click(/Unlock every fighter/);
  const names = wo.buttons('#board').filter((c) => c.classList.contains('play')).map((c) => c.querySelector('.cellname').textContent);
  if (args.fighter && names.includes(args.fighter)) return args.fighter;
  const seen = COVERAGE.fighters;
  const sorted = names.slice().sort((a, b) => (seen[a] || 0) - (seen[b] || 0) || (rng() - 0.5));
  const pool = sorted.slice(0, 12);
  return R.pick(rng, pool);
}
const COVERAGE = { fighters: {}, maps: {}, bosses: {}, stages: {} };

// a normal match: ffa / 1v1 / teams
async function matchScene(wo, rng, args, kind) {
  const persona = args.persona || R.pick(rng, ['new', 'tryhard', 'explorer']);
  if (!await toSelect(wo)) return { fail: 'menu' };
  const you = chooseFighter(wo, rng, args);
  if (!pickFighter(wo, you)) return { fail: 'pick' };
  const stageIds = wo.E('STAGES.map(function(s){return s.id})');
  const stageId = args.stage || R.pick(rng, kind === 'teams' ? stageIds : stageIds);
  pickStage(wo, stageId);
  const mode = kind === 'teams' ? 'teams' : 'ffa';
  seg(wo, 'segMode', mode);
  const count = kind === '1v1' ? 2 : kind === 'teams' ? R.pick(rng, [4, 6]) : R.pick(rng, [3, 4, 5]);
  seg(wo, 'segCount', count);
  seg(wo, 'segStocks', R.pick(rng, [2, 3]));
  if (R.chance(rng, 0.3)) { wo.click(wo.doc.getElementById('advToggle')); seg(wo, 'segItems', R.pick(rng, [0, 1, 3])); seg(wo, 'segAI', R.pick(rng, [0, 2])); }
  CUR.args = { persona, fighter: you, stage: stageId, kind }; Object.assign(args, CUR.args);
  if (!startFromSelect(wo)) { note('BUG', 'menu', 'Start Match did not start a match'); return { fail: 'start' }; }
  COVERAGE.fighters[you] = (COVERAGE.fighters[you] || 0) + 1;
  wo.w.__ptCap = true;
  const sim = new Sim(wo);
  sim.player = new Player(wo, mulberry32(hashSeed(CUR.seed, 'player')), persona);
  // the first 3 seconds are the countdown/intro: play through it, then see what the match does
  const why = await playOut(wo, sim, null, null, true);
  sim.player.releaseAll();
  wo.w.__ptCap = false;
  await settle(wo);
  sampleCanvasText(wo);
  const row = closeMatch(wo, sim, kind, { persona, you });
  if (wo.screen() === 'result' && rng() < 0.5) await resultScreen(wo, rng);
  return { why, row };
}
function sampleCanvasText(wo) { const t = wo.w.__ptCanvasText; for (const k of Object.keys(t)) { STATS.canvasText[k] = (STATS.canvasText[k] || 0) + t[k]; } }

SCENES.ffa = { weight: 4, run: (wo, rng, args) => matchScene(wo, rng, args, 'ffa') };
SCENES['1v1'] = { weight: 3, run: (wo, rng, args) => matchScene(wo, rng, args, '1v1') };
SCENES.teams = { weight: 3, run: (wo, rng, args) => matchScene(wo, rng, args, 'teams') };


// ------------------------------------------------------------------------------------------------------------------------------
// the menus: the EXPLORER clicks every button it can find and presses Esc at every screen
// ------------------------------------------------------------------------------------------------------------------------------
const BACKLIKE = /back|done|close|title|◀|cancel|quit|✕|exit|resume|skip|leave|no thanks|change fighter/i;
const PHONE_WORDS = /\b(taps?|tapped|tapping|swipes?|swiping|finger|fingers|phones?|mobile|touch ?screen|touch pad|on-screen pad|thumbs?)\b/i;
const BAD_TEXT = /undefined|\bNaN\b|\[object |\bnull\b%|Infinity/;
const TEXT_EXEMPT = '.movecard,#moveCard,#pauseMoves,#selMoves,.cellname,.selkit,.kv,#board,#changelogBody,#clog';

// the text of a screen, minus the places where move names live (a move may be called "Tap")
function screenTexts(wo, id) {
  const root = id === '*' ? wo.doc.body : wo.doc.getElementById(id); if (!root) return [];
  const out = [];
  const walk = (el) => {
    if (!wo.visible(el)) return;
    if (el.matches && el.matches(TEXT_EXEMPT)) return;
    const kids = [...el.children];
    if (!kids.length) { const t = (el.textContent || '').replace(/\s+/g, ' ').trim(); if (t) out.push({ el, t }); return; }
    for (const n of el.childNodes) if (n.nodeType === 3) { const t = n.textContent.replace(/\s+/g, ' ').trim(); if (t) out.push({ el, t }); }
    for (const k of kids) walk(k);
  };
  walk(root);
  return out;
}
function scanText(wo, id) {
  { const r0 = id === '(match)' ? wo.doc.getElementById('hud') : wo.doc.getElementById(id); if (!r0 || !wo.visible(r0)) return; }
  const where = id === '(match)' ? 'hud' : id;
  const target = id === '(match)' ? 'hud' : id;
  const items = screenTexts(wo, target);
  const rec = STATS.screens[where] || (STATS.screens[where] = { visits: 0, buttons: 0, leaves: 0 });
  rec.texts = items.length;
  if (id !== '(match)' && id !== '(none)' && items.length === 0) note('UI', 'empty-screen', `screen "${id}" shows no text at all`);
  for (const { el, t } of items) {
    if (BAD_TEXT.test(t)) note('BUG', 'bad-text', `screen "${where}" shows "${t.slice(0, 50)}" (undefined/NaN/[object])`, { detail: elDesc(el) });
    if (PHONE_WORDS.test(t)) note('UI', 'phone-wording', `screen "${where}" says "${(t.match(PHONE_WORDS) || [''])[0]}" in: "${t.slice(0, 70)}" (a computer game: no phone or touch wording)`, { detail: elDesc(el) });
  }
}
function elDesc(el) { return (el.id ? '#' + el.id : el.className ? '.' + String(el.className).split(' ')[0] : el.tagName); }

// get back to the title the way a person does: Esc, then a back-like button, then anything that moves
async function toTitle(wo, why) {
  for (let i = 0; i < 8; i++) {
    const s = wo.screen();
    if (s === 'title') return true;
    if (s === '(match)') {
      if (!wo.paused()) wo.tap('Escape');
      if (wo.paused()) { if (!wo.click(/Quit to title/)) { wo.tap('Escape'); note('STUCK', 'no-exit', 'the pause card has no "Quit to title" button'); } }
      else wo.E("go('title')");
      continue;
    }
    if (s === '(none)') { wo.E("go('title')"); continue; }
    wo.tap('Escape');
    if (wo.screen() !== s) continue;
    const back = wo.buttons('#' + s.split('+')[0]).find((b) => BACKLIKE.test(wo.btnText(b)));
    if (back) { wo.clickEl(back); if (wo.screen() !== s) continue; }
    // nothing obvious: try every button once
    let moved = false;
    for (const b of wo.buttons('#' + s.split('+')[0]).slice(0, 25)) { wo.clickEl(b); if (wo.screen() !== s) { moved = true; break; } }
    if (!moved) { note('STUCK', 'no-exit', `screen "${s}" has no way out: Esc and every button leave it where it is`, { detail: why || '' }); wo.E("go('title')"); return false; }
  }
  return wo.screen() === 'title';
}
async function quickPlay(wo, rng, frames, persona) {
  const sim = new Sim(wo); sim.player = new Player(wo, mulberry32(hashSeed(CUR.seed, 'qp', frames)), persona || 'explorer');
  wo.w.__ptCap = true;
  for (let i = 0; i < frames && wo.running() && !wo.paused(); i++) { if (!sim.frame()) break; if (i % 120 === 0) await maybeYield(); }
  sim.player.releaseAll(); wo.w.__ptCap = false;
  return sim;
}
// in a match: Esc pauses, the card has Resume / Move list / Quit; Esc again carries on
async function pauseCheck(wo) {
  if (!wo.running()) return;
  wo.tap('Escape');
  if (!wo.paused()) { note('BUG', 'pause', 'Esc in a running match did not pause it', { detail: `KEYS.pause=${wo.E('KEYS.pause')} listening=${wo.E('listening')} focus=${wo.doc.activeElement && (wo.doc.activeElement.tagName + '#' + wo.doc.activeElement.id)} lastClick="${wo.lastClick}" test=${wo.E('TESTMODE.active')} tut=${wo.E('TUT.active')} mode=${wo.E('SETTINGS.mode')} screen=${wo.screen()}` }); return; }
  const card = wo.doc.getElementById('pauseCard');
  if (!card || card.style.display === 'none') note('BUG', 'pause', 'paused, but the pause card is not showing');
  scanText(wo, 'pauseCard');
  if (wo.click(/Move list/)) { const t = (wo.doc.getElementById('pauseMoves') || {}).textContent || ''; if (t.trim().length < 20) note('BUG', 'move-list', 'the pause card\'s Move list opened with nothing in it'); scanText(wo, 'pauseCard'); wo.click(/Move list/); }
  wo.tap('Escape');
  if (wo.paused()) note('BUG', 'pause', 'Esc did not carry on from the pause card');
}

async function exploreScreen(wo, rng, id, open, opt) {
  opt = opt || {};
  const rec = STATS.screens[id] || (STATS.screens[id] = { visits: 0, buttons: 0, leaves: 0, texts: 0 });
  if (!(await open())) { note('BUG', 'menu', `could not open screen "${id}" through its door`); return; }
  rec.visits++;
  scanText(wo, id);
  const list = wo.buttons('#' + id);
  rec.buttons = Math.max(rec.buttons, list.length);
  const order = R.shuffle(rng, [...Array(list.length).keys()]).slice(0, opt.max || 30);
  for (const i of order) {
    if (sessionOver()) return;
    if (!(await open())) break;
    const b = wo.buttons('#' + id)[i]; if (!b) continue;
    const label = wo.btnText(b).slice(0, 28);
    if (opt.skip && opt.skip.test(label)) continue;
    const before = wo.screen();
    wo.clickEl(b);
    if (opt.afterClick) await opt.afterClick(b, label);
    const s = wo.screen();
    if (s === '(match)') { await quickPlay(wo, rng, 150); await pauseCheck(wo); rec.leaves++; }
    else if (s !== before) { rec.leaves++; scanText(wo, s.split('+')[0]); }
    else scanText(wo, id);
    // a typed key at every state: Esc must never break the screen
    if (rng() < 0.3) { wo.tap('Escape'); }
  }
  if (!(await open())) return;
  // the way out: Esc or a button must lead somewhere
  if (id !== 'title') { wo.tap('Escape'); const escWorks = wo.screen() !== id; if (!escWorks) { const ok = await toTitle(wo, 'after exploring ' + id); if (!ok) return; } }
}

// the doors of the title, each a real click (opened from a clean title)
async function titleDoor(wo, text) {
  if (!(await toTitle(wo, 'to reach ' + text))) return false;
  const a = wo.doc.querySelectorAll('#title button, #title a');
  const b = [...a].find((x) => (typeof text === 'string' ? wo.btnText(x).includes(text) : text.test(wo.btnText(x))));
  if (!b) { note('BUG', 'menu', `the title has no "${text}" door`); return false; }
  wo.clickEl(b); return true;
}

async function menuScene(wo, rng, args) {
  const door = (text, then) => async () => { if (!(await titleDoor(wo, text))) return false; if (then) then(); return true; };
  // the title itself, then Settings and what hangs off it
  await exploreScreen(wo, rng, 'title', async () => toTitle(wo), { max: 14, skip: /World Cup|Friends|Level Creator|Plunge|today/ });
  scanText(wo, 'title');
  // What's new card
  const wn = wo.doc.getElementById('whatsNew'); if (wn) { scanText(wo, 'whatsNew'); const wb = [...wn.querySelectorAll('button,a')]; for (const b of wb.slice(0, 4)) wo.clickEl(b); }
  await exploreScreen(wo, rng, 'options', door('Settings'), { max: 12 });
  // every toggle twice (on and off)
  if (await door('Settings')()) {
    for (const id of ['soundToggle', 'musicToggle', 'shakeToggle']) { const b = wo.doc.getElementById(id); if (b) { const t0 = wo.btnText(b); wo.clickEl(b); wo.clickEl(b); const t2 = wo.btnText(b); if (t0 !== t2) note('BUG', 'toggle', `Settings toggle "${t0}" did not come back to itself after two clicks (${t2})`); } }
    for (const b of wo.buttons('#options')) { if (/Keys/.test(wo.btnText(b))) { wo.clickEl(b); break; } }
    if (wo.screen() === 'controls') {
      // remap a key through the real row + keypress, play with it, reset
      const rows = wo.buttons('#maps'); const jumpRow = rows.find((r) => /Jump/.test(r.textContent));
      if (jumpRow) { wo.clickEl(jumpRow); wo.tap('KeyW'); if (wo.E('KEYS.jump') !== 'KeyW') note('BUG', 'remap', 'remapping Jump: the row was clicked and KeyW pressed, but KEYS.jump is ' + wo.E('KEYS.jump')); }
      for (const r of rows.slice(0, 12)) { wo.clickEl(r); wo.tap(R.pick(rng, ['KeyA', 'KeyD', 'KeyS', 'KeyJ', 'KeyK', 'KeyL', 'Escape'])); }
      scanText(wo, 'controls');
      wo.click(/Reset defaults/); if (wo.E('KEYS.jump') !== 'ArrowUp') note('BUG', 'remap', 'Reset defaults did not put Jump back on the up arrow');
    }
  }
  wo.click(/Reset defaults/, '#controls'); wo.E('listening = null');
  await exploreScreen(wo, rng, 'controls', async () => { if (!(await door('Settings')())) return false; const b = wo.findBtn(/Keys/, '#options'); if (!b) return false; wo.clickEl(b); return wo.screen() === 'controls'; }, { max: 8 });
  if (wo.screen() === 'controls' || true) { await toTitle(wo); await door('Settings')(); const kb = wo.findBtn(/Keys/, '#options'); if (kb) { wo.clickEl(kb); wo.click(/Reset defaults/, '#controls'); wo.E('listening = null'); } }
  await exploreScreen(wo, rng, 'stats', async () => { if (!(await door('Settings')())) return false; const b = wo.findBtn(/My Stats/, '#options'); if (!b) return false; wo.clickEl(b); return wo.screen() === 'stats'; }, { max: 6 });
  // Learn: How to Play and Training
  await exploreScreen(wo, rng, 'learn', door('Learn'), { max: 4, skip: /Training|How to Play/ });
  await exploreScreen(wo, rng, 'tutorial', async () => { if (!(await door('Learn')())) return false; const b = wo.findBtn(/How to Play/, '#learn'); if (!b) return false; wo.clickEl(b); return wo.screen() === 'tutorial'; }, { max: 3, skip: /Try it/ });
  await exploreScreen(wo, rng, 'test', async () => { if (!(await door('Learn')())) return false; const b = wo.findBtn(/Training/, '#learn'); if (!b) return false; wo.clickEl(b); return wo.screen() === 'test'; }, { max: 20, skip: /Start Testing|Pick a different/ });
  // changelog, vault, the Locker, share
  await exploreScreen(wo, rng, 'changelog', door('Changelog'), { max: 4 });
  await exploreScreen(wo, rng, 'vault', door('Vault'), { max: 4, afterClick: async () => { const inp = wo.doc.getElementById('vaultCode'); if (inp) { inp.value = R.pick(rng, ['abc', '', '   ', 'a'.repeat(300), '<b>x</b>', '0']); } } });
  for (const id of ['quests', 'store', 'wardrobe']) await exploreScreen(wo, rng, id, async () => { if (!(await door('Locker')())) return false; if (id !== wo.screen()) { const tab = wo.findBtn(new RegExp(id === 'quests' ? 'Quests' : id === 'store' ? 'Store' : 'Wardrobe'), '#' + wo.screen()); if (tab) wo.clickEl(tab); } return wo.screen() === id; }, { max: 24 });
  { await toTitle(wo); const sb = wo.doc.getElementById('shareBtn'); if (sb) { wo.clickEl(sb); scanText(wo, 'title'); } }
  // the World Cup setup: every row, every button
  await exploreScreen(wo, rng, 'tourneySetup', door('World Cup'), { max: 44, skip: /Kick Off|Flag Cup/ });
  await exploreScreen(wo, rng, 'ctfCupSetup', async () => { if (!(await door('World Cup')())) return false; const b = wo.findBtn(/Flag Cup/, '#tourneySetup'); if (!b) return false; wo.clickEl(b); return wo.screen() === 'ctfCupSetup'; }, { max: 30, skip: /Kick Off/ });
  await exploreScreen(wo, rng, 'ctfCupTeams', async () => { if (!(await door('World Cup')())) return false; const b = wo.findBtn(/Flag Cup/, '#tourneySetup'); if (!b) return false; wo.clickEl(b); const t = wo.findBtn(/Build the teams/, '#ctfCupSetup'); if (!t) return false; wo.clickEl(t); return wo.screen() === 'ctfCupTeams'; }, { max: 30, skip: /Kick Off/ });
  // Play with Friends, offline
  await exploreScreen(wo, rng, 'lobby', door('Friends'), { max: 8 });
  // Level Creator
  await exploreScreen(wo, rng, 'editor', door('Level Creator'), { max: 40, skip: /Save|Title/ });
  // the fighter select: every cell and every row
  await exploreScreen(wo, rng, 'select', async () => toSelect(wo), { max: 55, skip: /Start Match/ });
  await selectCards(wo, rng);
  await toTitle(wo);
  return { why: 'menus' };
}
// every fighter's card on the select: click the cell, read the name and the moves
async function selectCards(wo, rng) {
  if (!(await toSelect(wo))) return;
  if (wo.findBtn(/Unlock every fighter/)) wo.click(/Unlock every fighter/);
  const cells = wo.buttons('#board').filter((c) => c.classList.contains('play'));
  let n = 0;
  for (const c of cells) {
    wo.clickEl(c); n++;
    const nm = (wo.doc.getElementById('selName') || {}).textContent, mv = (wo.doc.getElementById('selMoves') || {}).textContent || '', card = (wo.doc.getElementById('moveCard') || {}).textContent || '';
    const want = c.querySelector('.cellname').textContent;
    if (nm !== want) note('BUG', 'select-card', `clicking ${want} on the board shows "${nm}" on the card`);
    if (BAD_TEXT.test(mv + card)) note('BUG', 'select-card', `${want}'s move card shows undefined/NaN: "${(mv + card).slice(0, 80)}"`);
    if ((mv + card).replace(/\s+/g, '').length < 10) note('BUG', 'select-card', `${want}'s move card is empty`);
    if (n % 20 === 0) await maybeYield();
  }
  for (const tab of ['All moves', 'Kit']) { wo.click(tab, '#select'); scanText(wo, 'select'); }
}
SCENES.menus = { weight: 0, first: true, run: menuScene };


// ------------------------------------------------------------------------------------------------------------------------------
// the result screen, after a match that ended
// ------------------------------------------------------------------------------------------------------------------------------
async function resultScreen(wo, rng) {
  if (wo.screen() !== 'result') return;
  scanText(wo, 'result');
  const bs = wo.buttons('#result');
  if (!bs.length) note('STUCK', 'no-exit', 'the result screen shows no buttons');
  const share = bs.find((b) => /Share/.test(wo.btnText(b))); if (share) wo.clickEl(share);
  scanText(wo, 'result');
  wo.tap('Escape');   // Esc on a result screen: whatever it does, it must not break
  if (wo.screen() === 'result' && rng() < 0.5) { const rem = wo.findBtn(/Rematch|Retry/, '#result'); if (rem) { wo.clickEl(rem); if (wo.running()) { await quickPlay(wo, rng, 120); } } }
}

// ------------------------------------------------------------------------------------------------------------------------------
// Boss Rush
// ------------------------------------------------------------------------------------------------------------------------------
async function bossScene(wo, rng, args) {
  const persona = args.persona || R.pick(rng, ['new', 'tryhard']);
  if (!await toSelect(wo)) return { fail: 'menu' };
  const you = chooseFighter(wo, rng, args);
  pickFighter(wo, you);
  seg(wo, 'segMode', 'boss');
  const bossN = wo.E('BOSS_ROSTER.length');
  const order = wo.E('BOSS_ROSTER.map(function(b){return b.name})').map((n, i) => i).sort((a, b) => (COVERAGE.bosses[a] || 0) - (COVERAGE.bosses[b] || 0) || rng() - 0.5);
  const bossIdx = args.boss != null ? +args.boss : order[0];
  const cnt = R.pick(rng, [1, 2, 3]);
  seg(wo, 'segCount', cnt);
  seg(wo, 'segStocks', 3);
  CUR.args = { persona, fighter: you, boss: bossIdx }; Object.assign(args, CUR.args);
  // scene start: the gauntlet begins at the boss this scene is about (the game's own spawn routine, called by its own start)
  wo.E(`(function(){ var o = spawnBossRushBoss; var first = true; window.__ptBossIdx = ${bossIdx}; spawnBossRushBoss = function(){ if(first){ first = false; BOSSRUSH.bossIdx = window.__ptBossIdx; } return o.apply(this, arguments); }; })()`);
  if (!startFromSelect(wo)) { note('BUG', 'menu', 'Start Match did not start Boss Rush'); return { fail: 'start' }; }
  COVERAGE.bosses[bossIdx] = (COVERAGE.bosses[bossIdx] || 0) + 1; COVERAGE.fighters[you] = (COVERAGE.fighters[you] || 0) + 1;
  const bossName = wo.E('(BOSS_ROSTER[BOSSRUSH.bossIdx]||{}).name');
  wo.w.__ptCap = true;
  const sim = new Sim(wo, { cpuWatchCtf: false });
  sim.player = new Player(wo, mulberry32(hashSeed(CUR.seed, 'player')), persona);
  let sawBoss = false, bossHp0 = null, lastHp = null, noDamageSince = 0;
  const cap = Math.round(Math.min(OPT.matchMin, 4) * 3600);
  const why = await playOut(wo, sim, cap, (s) => {
    const bs = wo.E('summons.filter(function(m){return m.type==="boss"})');
    if (bs.length) { sawBoss = true; const hp = bs[0].hp; if (bossHp0 == null) bossHp0 = hp; if (lastHp == null || hp < lastHp - 0.01) { noDamageSince = s.f; } lastHp = hp; }
    // the boss was beaten and the next one is up: one boss is enough for a scene (two when the first fell quickly)
    if (wo.E('BOSSRUSH.cleared') >= 2) return true;
    if (sawBoss && s.f - noDamageSince > 2400 && s.f > 3000 && wo.E('summons.filter(function(m){return m.type==="boss"}).length')) { note('FEEL', 'boss-untouched', `${wo.E('(summons.find(function(m){return m.type==="boss"})||{}).name') || bossName}: nobody damaged the boss for 40 s (player ${you}, persona ${persona}, scene started at ${bossName})`, { detail: `boss hp ${Math.round(lastHp)}/${Math.round(bossHp0)}; ${wo.E('(function(){ var b = summons.find(function(s){return s.type==="boss"}); return b ? "tel " + b._telKind + " phase " + b._phase + " atk " + b.attack + " x" + Math.round(b.x) + " y" + Math.round(b.y) + " r" + Math.round(b.r) + " stationary " + b.stationary + " | " + fighters.map(function(f){ return f.name + (f.dead ? " dead" : " x" + Math.round(f.x) + " y" + Math.round(f.y) + " cd" + f.atkCd); }).join(" ; ") : "none"; })()')}` }); noDamageSince = s.f + 99999; }
    return false;
  });
  sim.player.releaseAll(); wo.w.__ptCap = false; sampleCanvasText(wo);
  if (!sawBoss) note('BUG', 'boss', `Boss Rush ${bossName}: no boss was ever on the field`);
  const row = closeMatch(wo, sim, 'boss:' + bossName, { persona, you });
  row.boss = bossName; row.bossHp = lastHp == null ? null : Math.round(lastHp); row.cleared = wo.E('BOSSRUSH.cleared');
  await settle(wo);
  await resultScreen(wo, rng);
  return { why, row };
}
SCENES.boss = { weight: 3, run: bossScene };

// ------------------------------------------------------------------------------------------------------------------------------
// Training and How to Play
// ------------------------------------------------------------------------------------------------------------------------------
async function trainingScene(wo, rng, args) {
  const persona = args.persona || R.pick(rng, ['tryhard', 'new']);
  if (!await toSelect(wo)) return { fail: 'menu' };
  const you = chooseFighter(wo, rng, args); pickFighter(wo, you);
  CUR.args = { persona, fighter: you }; Object.assign(args, CUR.args);
  await toTitle(wo);
  if (!(await titleDoor(wo, 'Learn'))) return { fail: 'learn' };
  if (!wo.click(/Training/, '#learn')) { note('BUG', 'menu', 'Learn has no Training button'); return { fail: 'training' }; }
  // every option row, once
  for (const sid of ['testDummies', 'testBehavior', 'testPct', 'testHold', 'testBox']) { const bs = [...wo.doc.querySelectorAll('#' + sid + ' button')]; if (bs.length) wo.clickEl(R.pick(rng, bs)); }
  scanText(wo, 'test');
  if (!wo.click(/Start Testing/, '#test')) { note('BUG', 'menu', 'Training has no Start Testing button'); return { fail: 'start' }; }
  if (!wo.running()) { note('BUG', 'training', 'Start Testing did not start Training'); return { fail: 'start' }; }
  wo.w.__ptCap = true;
  const sim = new Sim(wo);
  sim.player = new Player(wo, mulberry32(hashSeed(CUR.seed, 'player')), persona);
  const why = await playOut(wo, sim, 3600 * 1.5, null);
  sim.player.releaseAll();
  const dmg = Math.round(wo.w.__pt.dmgYou);
  if (dmg === 0) note('FEEL', 'training-no-damage', `Training: the ${persona} player (${you}) dealt no damage to the dummy in ${Math.round(sim.f / 60)} s`, { detail: `dummies ${wo.E('TESTMODE.dummies')}, behaviour ${wo.E('TESTMODE.dummyMode')}` });
  // R resets, Esc comes back
  wo.tap('KeyR'); for (let i = 0; i < 30; i++) sim.frame();
  wo.tap('Escape');
  if (wo.screen() === '(match)' || wo.running()) note('BUG', 'training', 'Esc in Training did not come back to the Training screen ("Esc to come back")');
  sampleCanvasText(wo); wo.w.__ptCap = false;
  closeMatch(wo, sim, 'training', { persona, you });
  return { why };
}
SCENES.training = { weight: 1, run: trainingScene };

// How to Play: follow the card's nine steps with the keys it names
async function tutorialScene(wo, rng, args) {
  await toTitle(wo);
  if (!(await titleDoor(wo, 'Learn'))) return { fail: 'learn' };
  if (!wo.click(/How to Play/, '#learn')) { note('BUG', 'menu', 'Learn has no How to Play button'); return { fail: 'howto' }; }
  scanText(wo, 'tutorial');
  if (!wo.click(/Try it/, '#tutorial')) { note('STUCK', 'tutorial', 'the How to Play card has no Try it button'); return { fail: 'try' }; }
  if (!wo.running()) { note('BUG', 'tutorial', 'Try it did not start the tutorial'); return { fail: 'start' }; }
  const sim = new Sim(wo, { bannerOK: () => true });
  const steps = wo.E('TUT_STEPS.map(function(s){return s.text})');
  const framesFor = (n) => { for (let i = 0; i < n; i++) if (!sim.frame()) return false; return true; };
  const tapF = (code, n = 3) => { wo.down(code); const ok = framesFor(n); wo.up(code); return ok; };
  const hold = async (codes, n) => { for (const c of codes) wo.down(c); const ok = framesFor(n); for (const c of codes) wo.up(c); return ok; };
  const me = () => wo.E('fighters[0]'), dum = () => wo.E('fighters[1]');
  const toward = async () => {   // walk to the dummy's side and face it
    for (let i = 0; i < 240 && wo.running(); i++) {
      const dx = dum().x - me().x; if (Math.abs(dx) < 55) break;
      wo.down(dx > 0 ? 'ArrowRight' : 'ArrowLeft'); wo.up(dx > 0 ? 'ArrowLeft' : 'ArrowRight'); framesFor(1);
    }
    wo.releaseAll();
    const dx = dum().x - me().x; wo.down(dx > 0 ? 'ArrowRight' : 'ArrowLeft'); framesFor(2); wo.releaseAll();
  };
  const bits = [];
  let last = -1, tries = 0;
  for (let guard = 0; guard < 4000 && wo.running() && wo.E('TUT.active') && !sessionOver(); guard++) {
    const st = wo.E('TUT.step');
    if (st !== last) { last = st; tries = 0; bits.push(`${st}@${sim.f}`); }
    tries++;
    if (tries > 14) { note('BUG', 'cant', `How to Play, step ${st + 1} ("${steps[st]}"): a player following the card's instruction could not finish it in ${Math.round(sim.f / 60)} s`, { detail: `tried 14 times` }); break; }
    if (st === 0) await hold(['ArrowRight'], 40);
    else if (st === 1) { tapF('ArrowUp'); framesFor(14); tapF('ArrowUp'); framesFor(30); }
    else if (st === 2) { await toward(); tapF('KeyX'); framesFor(20); }
    else if (st === 3) { tapF('KeyC'); framesFor(50); }
    else if (st === 4) { await toward(); for (const c of ['ArrowDown', 'KeyX']) wo.down(c); framesFor(4); wo.up('KeyX'); wo.up('ArrowDown'); framesFor(25); }
    else if (st === 5) { await toward(); wo.down('ArrowUp'); framesFor(6); wo.up('ArrowUp'); framesFor(8); tapF('KeyX'); framesFor(30); }
    else if (st === 6) { await toward(); wo.down('KeyX'); wo.down('KeyC'); framesFor(3); wo.up('KeyX'); wo.up('KeyC'); framesFor(10); tapF(R.pick(rng, ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'])); framesFor(40); }
    else if (st === 7) { await toward(); tapF('KeyV'); framesFor(60); }
    else { await toward(); tapF('KeyV'); framesFor(40); tapF('KeyX'); framesFor(10); }
    await maybeYield();
  }
  wo.releaseAll();
  const done = !wo.E('TUT.active');
  vlog('tutorial steps', bits.join(' '));
  if (wo.E('TUT.active')) { wo.tap('Escape'); if (wo.screen() === '(match)' || wo.running()) note('BUG', 'tutorial', 'Esc in the tutorial ("Esc to skip") did not leave it'); }
  return { why: done ? 'complete' : 'left', steps: bits.join(' ') };
}
SCENES.tutorial = { weight: 1, run: tutorialScene };

// ------------------------------------------------------------------------------------------------------------------------------
// RUNNING!
// ------------------------------------------------------------------------------------------------------------------------------
async function runningScene(wo, rng, args) {
  const persona = args.persona || R.pick(rng, ['new', 'tryhard']);
  CUR.args = { persona }; Object.assign(args, CUR.args);
  // scene start: the race has no door of its own (the unlock chain opens it); the game's own entry point is called, with a hand-off of its own
  const okStart = wo.E('startRunningRace({ onEnd: function(){ return false; } })');
  if (!okStart || !wo.running()) { note('BUG', 'running', 'startRunningRace did not start a race'); return { fail: 'start' }; }
  const sim = new Sim(wo, { cpuWatchCtf: false });
  const r = mulberry32(hashSeed(CUR.seed, 'race'));
  let nextJump = 30, frames = 0, ms = 0;
  const cap = 3600 * 2;
  wo.w.__ptCap = true;
  while (frames < cap && wo.running() && !wo.paused() && !sessionOver()) {
    const me = wo.E('fighters.find(function(f){return f.you})');
    if (!me) break;
    wo.down('ArrowRight');
    // the course: jump when something is just ahead, or now and then; a tryhard holds the jump for height
    const ahead = wo.E(`(function(){ var f = fighters.find(function(q){return q.you}); var best = 1e9, a, i; for(i=0;i<RACE.obstacles.length;i++){ a = RACE.obstacles[i]; if(a.x !== undefined && a.x > f.x && a.x - f.x < best) best = a.x - f.x; } return best; })()`);
    if (frames >= nextJump && me.onground) { const hold = persona === 'tryhard' ? R.int(r, 10, 18) : R.int(r, 3, 12); wo.down('ArrowUp'); sim.frame(); frames++; for (let i = 0; i < hold && wo.running(); i++) { sim.frame(); frames++; } wo.up('ArrowUp'); nextJump = frames + (ahead < 260 ? R.int(r, 6, 20) : R.int(r, 30, persona === 'new' ? 160 : 90)); }
    else if (me.jumps > 0 && !me.onground && me.vy > 2 && r() < 0.1) { wo.tap('ArrowUp'); }
    if (!sim.frame()) break; frames++;
    if (frames % 120 === 0) await maybeYield();
  }
  wo.releaseAll(); wo.w.__ptCap = false;
  const res = wo.E('RACE.result') || {}, over = wo.E('RACE.over');
  const x = wo.E('(fighters.find(function(f){return f.you})||{x:0}).x');
  closeMatch(wo, sim, 'running', { persona, you: wo.E('RACE.fighter') });
  STATS.matches[STATS.matches.length - 1].raceX = Math.round(x);
  if (!over && frames >= cap) note('STUCK', 'running-never-ends', 'RUNNING! did not end in 2 minutes of game time (the line never caught the player and the player did not finish)');
  await resultScreen(wo, rng);
  return { why: over ? (wo.E('RACE.won') ? 'won' : 'lost:' + wo.E('RACE.lossWhy')) : 'cap', x: Math.round(x) };
}
SCENES.running = { weight: 1, run: runningScene };

// ------------------------------------------------------------------------------------------------------------------------------
// the World Cup: a fixture you play (normal mode), and a watched one
// ------------------------------------------------------------------------------------------------------------------------------
async function worldCupScene(wo, rng, args) {
  const persona = args.persona || R.pick(rng, ['new', 'tryhard']);
  const size = args.size || R.pick(rng, [1, 1, 2]);
  CUR.args = { persona, size }; Object.assign(args, CUR.args);
  if (!(await titleDoor(wo, 'World Cup'))) return { fail: 'door' };
  scanText(wo, 'tourneySetup');
  wo.click(/Normal \(you play\)/, '#tourneySetup');
  seg(wo, 'segTourneySize', size === 1 ? 'Solo' : size + 'v' + size);
  { const b = [...wo.doc.querySelectorAll('#segTourneySize button')].find((x) => x.dataset.v === String(size)); if (b) wo.clickEl(b); }
  { const b = [...wo.doc.querySelectorAll('#segCupSize button')].find((x) => x.dataset.v === '16'); if (b) wo.clickEl(b); }
  { const b = [...wo.doc.querySelectorAll('#segCupGTime button')].find((x) => x.dataset.v === '60'); if (b) wo.clickEl(b); }
  { const b = [...wo.doc.querySelectorAll('#segCupGStocks button')].find((x) => x.dataset.v === '1'); if (b) wo.clickEl(b); }
  if (!wo.click(/Kick Off/, '#tourneySetup')) { note('BUG', 'menu', 'World Cup setup has no Kick Off button'); return { fail: 'kickoff' }; }
  // normal mode: pick your fighter (and teammates) on the select, one Start at a time
  let guard = 0;
  while (wo.screen() === 'select' && guard++ < 6) {
    const you = chooseFighter(wo, rng, {}); pickFighter(wo, you); CUR.args.fighter = you;
    if (!startFromSelect(wo) && wo.screen() !== 'select' && wo.screen() !== 'tourneyHub') break;
  }
  if (wo.screen() !== 'tourneyHub') { note('BUG', 'worldcup', `Kick Off ended on "${wo.screen()}", not the cup's hub`); return { fail: 'hub:' + wo.screen() }; }
  scanText(wo, 'tourneyHub');
  const hubBtns = wo.buttons('#tourneyHub');
  const play = hubBtns.find((b) => /Play My Match/.test(wo.btnText(b)));
  if (!play) { note('BUG', 'worldcup', 'the cup hub has no "Play My Match" button in normal mode'); }
  else {
    wo.clickEl(play);
    if (!wo.running()) { note('BUG', 'worldcup', 'Play My Match did not start the fixture'); return { fail: 'fixture' }; }
    wo.w.__ptCap = true;
    const sim = new Sim(wo, { bannerOK: () => true });
    sim.player = new Player(wo, mulberry32(hashSeed(CUR.seed, 'player')), persona);
    const why = await playOut(wo, sim, Math.round(Math.min(OPT.matchMin, 2.5) * 3600), null);
    sim.player.releaseAll(); wo.w.__ptCap = false; sampleCanvasText(wo);
    closeMatch(wo, sim, 'worldcup', { persona, you: CUR.args.fighter });
    await settle(wo, 4500);
    // the way back: the hub (or the result screen), then Sim rest, then Quit
    if (wo.screen() === 'result') await resultScreen(wo, rng);
    for (let i = 0; i < 10 && wo.screen() !== 'tourneyHub' && wo.screen() !== 'title'; i++) { const b = wo.findBtn(/Continue|Hub|Next|Title/, scr(wo)); if (b) wo.clickEl(b); else break; }
    CUR.why = why;
  }
  if (wo.screen() === 'tourneyHub') {
    scanText(wo, 'tourneyHub');
    const proceed = wo.doc.getElementById('tourneyProceedBtn'); if (proceed) { wo.clickEl(proceed); scanText(wo, wo.screen().split('+')[0]); }
    // watch a fixture of someone else for a few seconds
    if (wo.screen() === 'tourneyHub') {
      const wb = wo.buttons('#tourneyHub').find((b) => /Watch/.test(wo.btnText(b)));
      if (wb) { wo.clickEl(wb); if (wo.running()) { const sim = await quickPlay(wo, rng, 240, 'explorer'); wo.tap('Escape'); } }
    }
  }
  await toTitle(wo);
  return { why: 'cup' };
}
SCENES.worldcup = { weight: 2, run: worldCupScene };

// ------------------------------------------------------------------------------------------------------------------------------
// Capture the Flag
// ------------------------------------------------------------------------------------------------------------------------------
const CTF_MAP_IDS = ['castle', 'mines', 'factory', 'forest', 'sky', 'oak'];
function ctfPickMapId(rng, args) { if (args.map) return args.map; const s = CTF_MAP_IDS.slice().sort((a, b) => (COVERAGE.maps[a] || 0) - (COVERAGE.maps[b] || 0) || rng() - 0.5); return s[0]; }
function clickCtfMap(wo, id) { const b = [...wo.doc.querySelectorAll('#segCtfMap button')].find((x) => x.dataset.v === id); if (!b) return false; wo.clickEl(b); return true; }
function clickCtfCount(wo, n) { const b = [...wo.doc.querySelectorAll('#segCount button')].find((x) => wo.btnText(x) === `${n}v${n}`); if (!b) return false; wo.clickEl(b); return true; }

// steering by eye: walk toward a spot, hop when blocked or when it is above
class Walker {
  constructor(wo, rng) { this.wo = wo; this.r = rng; this.blocked = 0; this.px = null; }
  // returns the set of keys for this frame
  keys(me, tx, ty) {
    const k = new Set(); const dx = tx - me.x, dy = ty - me.y;
    if (Math.abs(dx) > 18) k.add(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
    if (this.px != null && Math.abs(me.x - this.px) < 0.3 && Math.abs(dx) > 25) this.blocked++; else this.blocked = Math.max(0, this.blocked - 1);
    this.px = me.x;
    if ((dy < -70 && me.onground && this.r() < 0.2) || (this.blocked > 12 && me.onground && this.r() < 0.5)) k.add('ArrowUp');
    if (!me.onground && me.jumps > 0 && me.vy > 2 && dy < -40 && this.r() < 0.3) k.add('ArrowUp');
    return k;
  }
}
class CtfPlayer {
  constructor(wo, rng, persona, opt) {
    this.wo = wo; this.r = rng; this.opt = opt || {}; this.brain = new Player(wo, mulberry32(hashSeed(CUR.seed, 'brain')), persona); this.walker = new Walker(wo, rng);
    this.q = [];   // a script of key presses held for frames: { k:[codes], d:frames } | { w:frames } | { fn }
    this.st = { stage: 'walk', placeTries: 0, lastPhase: null, phaseT: 0, doneAt: 0 };
    this.stats = { placed: false, builds: 0, menuOk: null };
  }
  get stats2() { return this.brain.stats; }
  releaseAll() { this.brain.releaseAll(); this.wo.releaseAll(); }
  setKeys(set) { const wo = this.wo; for (const k of [...wo.held]) if (!set.has(k)) wo.up(k); for (const k of set) wo.down(k); wo.repeatHeld(); }
  tap(code, d = 3, w = 2) { this.q.push({ k: [code], d }, { w }); }
  hit(codes, d = 3, w = 2) { this.q.push({ k: codes, d }, { w }); }
  fn(f) { this.q.push({ fn: f }); }
  // run the script; true while it is busy
  exec() {
    for (let guard = 0; guard < 50; guard++) {
      const h = this.q[0]; if (!h) return false;
      if (h.fn) { this.q.shift(); h.fn(); continue; }
      if (h.w !== undefined) { this.setKeys(new Set()); if (--h.w <= 0) this.q.shift(); return true; }
      this.setKeys(new Set(h.k)); if (--h.d <= 0) this.q.shift(); return true;
    }
    return true;
  }
  tick(S) {
    const wo = this.wo, L = wo.E('CTF.live'), me = S.me;
    if (!L || !me) return;
    if (L.phase !== this.st.lastPhase) { this.st.lastPhase = L.phase; this.st.phaseT = 0; if (L.phase !== 'hide') { this.q = []; } }
    this.st.phaseT++;
    if (this.exec()) return;
    if (L.phase === 'bid') return this.bid(L, me);
    if (L.phase === 'fix') { this.setKeys(new Set()); return; }
    if (L.phase === 'hide') return this.hide(L, me, S);
    this.brain.tick(S);
  }
  bid(L, me) {
    // the secret bid: the arrows choose, the flag key locks
    const t = this.st.phaseT;
    if (t === 10) this.tap('ArrowRight'); else if (t === 30) this.tap('ArrowUp'); else if (t === 50) this.tap('ArrowUp'); else if (t === 70) this.tap('ArrowDown'); else if (t === 90) this.tap('ArrowLeft'); else if (t === 120) this.tap('Space'); else if (t === 600) this.tap('Space');
  }
  hide(L, me, S) {
    const wo = this.wo, st = this.st, t = st.phaseT, fl = L.flags[me.idx];
    const id = wo.E('CTF.mapId');
    if (st.stage === 'walk') {
      if (fl && fl.st === 1) { this.stats.placed = true; st.stage = 'menu'; return; }
      const spots = wo.E('CTF.map.spots.filter(function(s){return s.team===' + me.team + '})');
      let best = null, bd = 1e9; for (const s of spots) { const d = Math.abs(s.x - me.x) + Math.abs(s.y - me.y); if (d < bd) { bd = d; best = s; } }
      if (!best) { st.stage = 'menu'; return; }
      const near = Math.abs(best.x - me.x) < 40 && Math.abs(best.y - me.y) < 120;
      this.setKeys(near ? new Set() : this.walker.keys(me, best.x, best.y));
      if (near && t % 30 === 0) { st.placeTries++; this.tap('Space'); }
      if (t > 2400 && st.placeTries === 0) { note('FEEL', 'ctf-hide-unreachable', `CTF ${id}: a player could not walk to a hiding spot in 40 s`, { detail: `stopped at x=${Math.round(me.x)} y=${Math.round(me.y)}, spot at ${Math.round(best.x)},${Math.round(best.y)}` }); this.stats.placed = 'gave-up'; st.stage = 'menu'; }
      if (st.placeTries >= 6) { note('BUG', 'cant', `CTF ${id}: Space at a hiding spot six times and the flag did not go down`, { detail: `spot ${Math.round(best.x)},${Math.round(best.y)} fighter ${me.name}` }); this.stats.placed = 'gave-up'; st.stage = 'menu'; }
      return;
    }
    if (st.stage === 'menu') { st.stage = 'build'; this.menuTour(); return; }
    if (st.stage === 'build') { st.stage = 'done'; this.buildTour(); return; }
    this.setKeys(new Set());
    if (!st.doneAt) { st.doneAt = t; this.tap('KeyC'); return; }
    if (t - st.doneAt > 900 && t % 300 === 0) this.tap('KeyC');
    if (t > 7200 && !st.warned) { st.warned = true; note('STUCK', 'ctf-hide-never-ends', `CTF ${id}: the hiding phase did not end 2 minutes after the player pressed done`, { detail: `done flags ${JSON.stringify(wo.E('CTF.live.done'))}` }); }
  }
  menuTour() {
    const wo = this.wo, open = () => wo.E('ctfMenuOpen()'), id = wo.E('CTF.mapId');
    this.tap('KeyP', 3, 4);
    this.fn(() => { if (!open()) { note('BUG', 'cant', `CTF ${id}: P did not open the team planning menu`); this.stats.menuOk = false; this.q = []; } });
    for (let tab = 0; tab < 6; tab++) {
      for (const k of ['ArrowDown', 'ArrowDown', 'Space', 'ArrowUp', 'Space', 'KeyX', 'ArrowDown', 'Enter', 'KeyQ', 'KeyE', 'Tab', 'KeyV', 'KeyB']) this.tap(k, 2, 1);
      this.fn(() => { if (!open()) { note('STUCK', 'ctf-menu-trap', `CTF planning menu: it closed by itself while a player pressed its keys (tab ${wo.E('CTF.menu.tab')})`); this.q = []; } });
      this.tap('ArrowRight', 2, 1);
    }
    this.tap('KeyC', 2, 2);
    // Esc must close it from every tab
    for (let tab = 0; tab < 6; tab++) {
      this.fn(() => { if (!open()) { wo.tap('KeyP'); } });
      for (let i = 0; i < tab; i++) this.tap('ArrowRight', 2, 1);
      this.fn(() => { this._tab = wo.E('CTF.menu.tab'); });
      this.tap('Escape', 2, 2);
      this.fn(() => {
        if (open()) { note('STUCK', 'ctf-menu-trap', `CTF planning menu: Esc does not close it on tab ${this._tab}`, { detail: 'a Roles-tab style trap' }); wo.tap('KeyP'); if (open()) { note('STUCK', 'ctf-menu-trap', `CTF planning menu: neither Esc nor P closes it on tab ${this._tab}`); wo.E('ctfMenuToggle(false)'); } }
      });
    }
    this.fn(() => { this.stats.menuOk = !open(); });
  }
  buildTour() {
    const wo = this.wo, id = wo.E('CTF.mapId');
    let n0 = 0;
    this.fn(() => { n0 = wo.E('CTF.live.edits.length'); });
    this.tap('KeyV', 3, 4);   // the free camera
    this.fn(() => { if (!wo.E('!!fighters.find(function(f){return f.you})._cam')) { note('BUG', 'cant', `CTF ${id}: V (smash) in the hiding phase did not open the free camera`); this.q = []; } });
    for (let round = 0; round < 8; round++) {
      const ks = this.r() < 0.5 ? ['ArrowLeft', 'ArrowUp'] : ['ArrowRight', 'ArrowDown'];
      this.q.push({ k: [ks[0]], d: 14 }, { k: [ks[1]], d: 8 }, { w: 1 });
      this.tap('KeyX', 2, 2); this.tap('KeyB', 2, 2); this.tap('Space', 3, 6);
    }
    this.tap('KeyV', 3, 4);
    this.fn(() => {
      this.stats.builds = wo.E('CTF.live.edits.length') - n0;
      if (wo.E('!!fighters.find(function(f){return f.you})._cam')) note('BUG', 'cant', `CTF ${id}: V did not close the free camera`);
    });
  }
}
async function ctfScene(wo, rng, args, mode) {
  const persona = args.persona || R.pick(rng, ['tryhard', 'new', 'explorer']);
  if (!await toSelect(wo)) return { fail: 'menu' };
  const you = chooseFighter(wo, rng, args); pickFighter(wo, you);
  seg(wo, 'segMode', 'ctf');
  const mapId = ctfPickMapId(rng, args);
  const n = args.n || R.pick(rng, [2, 3, 4]);
  if (!clickCtfMap(wo, mapId)) { note('BUG', 'menu', `the Capture the Flag map list has no "${mapId}"`); return { fail: 'map' }; }
  clickCtfCount(wo, n);
  if (mode === 'spectate') { const sb = [...wo.doc.querySelectorAll('#segCtfMap button')].find((x) => x.dataset.v === 'spectate'); if (sb) wo.clickEl(sb); }
  CUR.args = { persona, fighter: you, map: mapId, n }; Object.assign(args, CUR.args);
  if (!startFromSelect(wo)) { note('BUG', 'menu', 'Start Match did not start Capture the Flag'); return { fail: 'start' }; }
  COVERAGE.maps[mapId] = (COVERAGE.maps[mapId] || 0) + 1; COVERAGE.fighters[you] = (COVERAGE.fighters[you] || 0) + 1;
  wo.w.__ptCap = true;
  const sim = new Sim(wo, { drawEvery: 6 });
  let why;
  if (mode === 'spectate') {
    const keys = ['Digit1', 'Digit2', 'ArrowRight', 'ArrowLeft', 'KeyZ', 'KeyO', 'KeyL', 'KeyF', 'Digit0'];
    why = await playOut(wo, sim, 3600 * 2, (s) => { if (s.f % 150 === 0) wo.tap(R.pick(rng, keys)); if (s.f === 3000 && !wo.E('CTF.spec')) { note('BUG', 'ctf-spectate', 'Spectate was switched on but the match has no spectator state (CTF.spec)'); } return false; });
    if (!wo.E('CTF.spec') && wo.running()) note('BUG', 'ctf-spectate', 'Spectate was switched on but a human fighter is still in the match');
  } else {
    sim.player = new CtfPlayer(wo, mulberry32(hashSeed(CUR.seed, 'player')), persona);
    const phases = {};
    why = await playOut(wo, sim, 3600 * 5, (s) => {
      const ph = wo.E('CTF.live ? CTF.live.phase : null'); if (ph) phases[ph] = (phases[ph] || 0) + 1;
      if (ph === 'play' && phases.play > 3600 * 2.5) return true;   // a capture attempt takes a couple of minutes at most
      return false;
    });
    const L = wo.E('CTF.live');
    CUR.phases = phases;
    if (phases.fix > 900) note('SLOW', 'ctf-fix-long', `CTF ${mapId}: the "check the way is open" phase took ${(phases.fix / 60).toFixed(1)} s of game time`, { detail: JSON.stringify(phases) });
    if (phases.hide > 3600 * 4.9) note('STUCK', 'ctf-hide-long', `CTF ${mapId}: the hiding phase ran its whole 5-minute limit even though the player pressed done`, { detail: JSON.stringify(phases) });
    if (L && L.phase === 'play' && L.playT > 3600 * 2 && L.score[0] + L.score[1] === 0 && !L.over) { STATS.ctfNoCap = (STATS.ctfNoCap || 0) + 1; }
    sim.player.releaseAll();
    if (sim.player.stats && sim.player.stats.placed === false) note('FEEL', 'ctf-flag-not-placed', `CTF ${mapId}: the player never put a flag down (the game placed it at the end of the phase)`);
  }
  wo.w.__ptCap = false; sampleCanvasText(wo);
  const L = wo.E('CTF.live');
  const row = closeMatch(wo, sim, mode === 'spectate' ? 'ctf-spectate' : 'ctf', { persona, you });
  row.map = mapId; row.score = L ? L.score.slice() : null; row.phases = CUR.phases;
  if (L && L.over) row.winner = L.winner;
  await resultScreen(wo, rng);
  return { why, score: row.score };
}
SCENES.ctf = { weight: 5, run: (wo, rng, args) => ctfScene(wo, rng, args, 'play') };
SCENES['ctf-spectate'] = { weight: 1, run: (wo, rng, args) => ctfScene(wo, rng, args, 'spectate') };

// A short Flag Cup: watch a fixture or two, skip one with S, sim the round
async function flagCupScene(wo, rng, args) {
  if (!(await titleDoor(wo, 'World Cup'))) return { fail: 'door' };
  if (!wo.click(/Flag Cup/, '#tourneySetup')) { note('BUG', 'menu', 'World Cup setup has no Flag Cup button'); return { fail: 'flagcup' }; }
  scanText(wo, 'ctfCupSetup');
  for (const sid of ['segCtfCupSize', 'segCtfCupTeam', 'segCtfCupMap', 'segCtfCupCap']) { const bs = [...wo.doc.querySelectorAll('#' + sid + ' button')]; if (bs.length) wo.clickEl(R.pick(rng, bs)); }
  if (!wo.click(/Kick Off/, '#ctfCupSetup')) { note('BUG', 'menu', 'the Flag Cup setup has no Kick Off button'); return { fail: 'kickoff' }; }
  if (wo.screen() !== 'tourneyHub') { note('BUG', 'flagcup', `Flag Cup Kick Off ended on "${wo.screen()}", not the hub`); return { fail: 'hub' }; }
  scanText(wo, 'tourneyHub');
  let watched = 0, skipped = 0;
  for (let k = 0; k < 2 && wo.screen() === 'tourneyHub' && !sessionOver(); k++) {
    const wb = wo.buttons('#tourneyHub').find((b) => /Watch/.test(wo.btnText(b)));
    if (!wb) { note('BUG', 'flagcup', 'the Flag Cup hub has no Watch button for a fixture'); break; }
    wo.clickEl(wb);
    if (!wo.running()) { note('BUG', 'flagcup', 'Watch did not start the fixture'); break; }
    watched++;
    wo.w.__ptCap = true;
    const sim = new Sim(wo, { drawEvery: 6, bannerOK: () => true });
    const hide = 60 * 12;
    // let the CPUs hide and build, then watch a little of the play, then S skips the fixture
    await playOut(wo, sim, hide + 60 * 20, (s) => { if (s.f % 200 === 0) wo.tap(R.pick(rng, ['Digit1', 'Digit2', 'ArrowRight', 'KeyF'])); return false; });
    if (k === 0 && wo.running()) { wo.tap('KeyS'); skipped++; for (let i = 0; i < 400 && wo.screen() !== 'tourneyHub'; i++) { sim.frame(); if (i % 60 === 0) await maybeYield(); } if (wo.screen() !== 'tourneyHub') { for (let i = 0; i < 400 && wo.screen() !== 'tourneyHub'; i++) { await new Promise((r) => setTimeout(r, 10)); } } if (wo.screen() !== 'tourneyHub') note('STUCK', 'flagcup', 'S (skip) in a Flag Cup fixture did not return to the hub'); }
    else { wo.tap('Escape'); }
    wo.w.__ptCap = false;
    // the hub comes back after a short timer
    if (wo.screen() !== 'tourneyHub') { for (let i = 0; i < 300 && wo.screen() !== 'tourneyHub'; i++) { await new Promise((r) => setTimeout(r, 10)); } }
    if (wo.screen() !== 'tourneyHub') { const q = wo.E("TOURNEY.active"); if (!q) break; wo.E('showTourneyHub()'); }
  }
  if (wo.screen() === 'tourneyHub') { scanText(wo, 'tourneyHub'); const pb = wo.doc.getElementById('tourneyProceedBtn'); if (pb) { wo.clickEl(pb); scanText(wo, wo.screen().split('+')[0]); } }
  await toTitle(wo);
  return { why: `watched ${watched}, skipped ${skipped}` };
}
SCENES.flagcup = { weight: 1, run: flagCupScene };

// ------------------------------------------------------------------------------------------------------------------------------
// session driver
// ------------------------------------------------------------------------------------------------------------------------------
async function runScene(name, seed, args) {
  const sc = SCENES[name];
  CUR = { scene: name, seed, args: { ...args }, frame: 0 };
  const t0 = now();
  let wo = null, res = null;
  try {
    wo = await World.boot(seed, name);
    const rng = mulberry32(hashSeed(seed, name));
    res = await sc.run(wo, rng, args);
  } catch (e) {
    note('BUG', 'scene-crash', `scene ${name} crashed: ${clipMsg(e && e.message || e)}`, { detail: String(e && e.stack).split('\n').slice(0, 5).join(' | ') });
    res = { crash: String(e && e.message) };
  } finally { if (wo) wo.close(); }
  const ms = Math.round(now() - t0);
  STATS.scenes.push({ scene: name, seed, args: CUR.args, ms, result: res && (res.why || res.fail || res.crash || 'ok') });
  out(`  ${name.padEnd(10)} seed ${String(seed).padEnd(10)} ${String(ms).padStart(6)} ms  ${res && (res.why || res.fail || res.crash || 'ok')}  ${JSON.stringify(CUR.args)}`);
  return res;
}

async function main() {
  if (OPT.list) { out(Object.keys(SCENES).join('\n')); return; }
  if (OPT.idle) { try { os.setPriority(0, os.constants.priority.PRIORITY_LOW); } catch (e) { /* ignore */ } }
  if (!OPT.scene && !OPT.force && process.platform === 'win32') {
    try {
      const [st, pct] = execSync('powershell -NoProfile -Command "$b = Get-CimInstance Win32_Battery; Write-Output ($b.BatteryStatus.ToString() + [char]32 + $b.EstimatedChargeRemaining.ToString())"', { encoding: 'utf8', timeout: 8000 }).trim().split(/s+/).map(Number);
      if (st === 1 && pct < 40 && OPT.minutes > 1) { out(`on battery at ${pct}%: capping the session to 1 minute (use --force to override)`); OPT.minutes = 1; }
      else if (st === 1 && OPT.minutes > 3 && pct < 60) { out(`on battery at ${pct}%: capping the session to 3 minutes (use --force to override)`); OPT.minutes = 3; }
    } catch (e) { /* no battery info: a desktop */ }
  }
  process.on('SIGINT', () => { if (STOPPING) process.exit(1); STOPPING = true; out('\nCtrl+C: finishing this frame and writing the partial report...'); });
  const started = new Date();
  const stamp = started.toISOString().replace(/[:.]/g, '-').slice(0, 19) + '-s' + OPT.seed;
  mkdirSync(OPT.out, { recursive: true });
  loadCoverage();
  out(`playtest: seed ${OPT.seed}, ${OPT.scene ? 'scene ' + OPT.scene : OPT.minutes + ' min'}`);
  if (OPT.scene) {
    if (!SCENES[OPT.scene]) { out('unknown scene: ' + OPT.scene + ' (see --list)'); process.exit(2); }
    await runScene(OPT.scene, OPT.seed, { ...OPT.args });
  } else {
    CPU_DEADLINE = cpuMs() + OPT.minutes * 60000; WALL_DEADLINE = now() + (OPT.wall || OPT.minutes * 4) * 60000;
    const rot = hashSeed(OPT.seed, 'rotation');
    const order = sessionPlan(mulberry32(rot));
    let i = 0;
    while (!sessionOver()) {
      const name = order[i % order.length]; i++;
      if (OPT.only && !OPT.only.includes(name)) { if (i > order.length * 3) break; continue; }
      await runScene(name, hashSeed(OPT.seed, name, i) % 1000000007, {});
      writeReport(stamp, started, true);
      if (i > 400) break;
    }
  }
  saveCoverage();
  const files = writeReport(stamp, started, false);
  out(`report: ${files.md}\n        ${files.json}`);
}
function sessionPlan(rng) {
  const names = Object.keys(SCENES);
  const bag = [];
  for (const n of names) for (let k = 0; k < (SCENES[n].weight || 1); k++) bag.push(n);
  const first = names.filter((n) => SCENES[n].first);
  return first.concat(R.shuffle(rng, bag));
}
const COVERAGE_FILE = () => path.join(OPT.out, 'coverage.json');
function loadCoverage() { try { Object.assign(COVERAGE, JSON.parse(readFileSync(COVERAGE_FILE(), 'utf8'))); } catch (e) { /* first run */ } }
function saveCoverage() { try { writeFileSync(COVERAGE_FILE(), JSON.stringify(COVERAGE, null, 1)); } catch (e) { /* ignore */ } }

// ------------------------------------------------------------------------------------------------------------------------------
// the report
// ------------------------------------------------------------------------------------------------------------------------------
function observations() {
  const obs = [];
  // fighters whose moves never landed
  const byF = {};
  for (const [k, v] of Object.entries(STATS.moves)) { const [n, m] = k.split('|'); (byF[n] = byF[n] || []).push({ m, ...v }); }
  const dead = [];
  for (const [n, list] of Object.entries(byF)) for (const m of list) if (m.fired >= 6 && m.landed === 0 && !/^(fs|jab|atk|walk)/.test(m.m)) dead.push(`${n} "${m.m}" fired ${m.fired}x, landed 0`);
  if (dead.length) obs.push({ kind: 'moves-never-landed', text: 'Moves that fired often and never connected with anyone (CPU and player alike): ' + dead.slice(0, 30).join('; ') });
  // player categories
  const cat = {};
  for (const [k, v] of Object.entries(STATS.cats)) { const c = k.split('|')[1]; const a = cat[c] || (cat[c] = { used: 0, landed: 0, dmg: 0 }); a.used += v.used; a.landed += v.landed; a.dmg += v.dmg; }
  if (Object.keys(cat).length) obs.push({ kind: 'player-move-types', text: 'The simulated player, by move type (used / landed / damage): ' + Object.entries(cat).sort((a, b) => b[1].used - a[1].used).map(([c, v]) => `${c} ${v.used}/${v.landed}/${Math.round(v.dmg)}`).join('; ') });
  // match lengths and early KOs
  const done = STATS.matches.filter((m) => m.ended);
  if (done.length) {
    const secs = done.map((m) => m.secs).sort((a, b) => a - b), med = secs[secs.length >> 1];
    obs.push({ kind: 'match-length', text: `Matches played: ${STATS.matches.length}, ended ${done.length}; length median ${med}s, shortest ${secs[0]}s, longest ${secs[secs.length - 1]}s.` });
    const early = STATS.matches.filter((m) => m.youKoAt != null && m.youKoAt <= 30 && m.persona !== 'explorer');
    const tr = STATS.matches.filter((m) => m.persona === 'tryhard'), tre = tr.filter((m) => m.youKoAt != null && m.youKoAt <= 30);
    obs.push({ kind: 'early-ko', text: `The human-like player was KO'd within the first 30 s in ${early.length}/${STATS.matches.filter((m) => m.persona !== 'explorer').length} non-explorer matches (tryhard: ${tre.length}/${tr.length}).` });
  }
  if (STATS.cpuIdle.length) obs.push({ kind: 'cpu-idle', text: 'CPU idle for 10 s: ' + STATS.cpuIdle.map((c) => `${c.fighter} (${c.mode}/${c.stage})`).join(', ') });
  return obs;
}
function writeReport(stamp, started, partial) {
  const all = [...FINDINGS.values()];
  const bySev = Object.fromEntries(SEV_ORDER.map((s) => [s, all.filter((f) => f.sev === s).sort((a, b) => b.count - a.count)]));
  const pct = (v, q) => { if (!v.s || !v.s.length) return 0; const a = v.s.slice().sort((x, y) => x - y); return +a[Math.min(a.length - 1, Math.floor(a.length * q))].toFixed(2); };
  const perf = Object.entries(STATS.perf).map(([k, v]) => ({ phase: k, frames: v.n, avgMs: +(v.sum / Math.max(1, v.n)).toFixed(2), p50: pct(v, 0.5), p99: pct(v, 0.99), worstMs: +v.worst.toFixed(1), over16: v.over16, over50: v.over50, worstAt: v.worstScene }));
  const obs = observations();
  const json = { tool: 'playtest.mjs', seed: OPT.seed, started: started.toISOString(), partial, minutes: OPT.minutes, scenes: STATS.scenes, findings: all, observations: obs, perf, matches: STATS.matches, moves: STATS.moves, cats: STATS.cats, fighters: STATS.fighters, screens: STATS.screens, cpuIdle: STATS.cpuIdle, strayText: STATS.texts, canvasText: STATS.canvasText, coverage: COVERAGE };
  const base = path.join(OPT.out, stamp);
  writeFileSync(base + '.json', JSON.stringify(json, null, 1));
  const md = [];
  md.push(`# Playtest ${started.toISOString()} (seed ${OPT.seed})${partial ? ' - PARTIAL' : ''}`);
  md.push('');
  md.push(`${STATS.scenes.length} scenes, ${STATS.matches.length} matches. ` + SEV_ORDER.map((s) => `${s} ${bySev[s].length}`).join(' | '));
  md.push('');
  for (const s of SEV_ORDER) {
    md.push(`## ${s} (${bySev[s].length})`);
    if (!bySev[s].length) { md.push('none'); md.push(''); continue; }
    for (const f of bySev[s]) {
      md.push(`- **${f.kind}** x${f.count}: ${f.msg}`);
      for (const r of f.repros) md.push(`  - \`${r.cmd}\`${r.frame ? ' (frame ' + r.frame + ')' : ''}${r.detail ? ' - ' + r.detail : ''}`);
    }
    md.push('');
  }
  md.push('## Performance (step ms, headless; compare phases, not absolutes)');
  for (const p of perf.sort((a, b) => b.worstMs - a.worstMs)) md.push(`- ${p.phase}: ${p.frames} frames, avg ${p.avgMs} ms, p50 ${p.p50}, p99 ${p.p99}, worst ${p.worstMs} ms (${p.worstAt}), over 16 ms: ${p.over16}, over 50 ms: ${p.over50}`);
  md.push('');
  if (STATS.spikes && STATS.spikes.length) { md.push('## Slow frames over 40 ms and what was in them (--arg prof=1)'); for (const sp of STATS.spikes.slice(0, 60)) md.push(`- ${sp.scene}#${sp.seed} frame ${sp.frame} (${sp.phase}) ${sp.ms} ms: ${sp.top.join(', ')}`); md.push(''); }
  md.push('## Feel and balance signals');
  for (const o of obs) md.push(`- ${o.text}`);
  md.push('');
  md.push('## Words drawn on the canvas during matches (look for anything that is not a name, a number or an allowed line)');
  { const words = Object.entries(STATS.canvasText).filter(([k]) => !/^[\d.,%\s+x/:-]+$/.test(k)).sort((a, b) => b[1] - a[1]).slice(0, 70); md.push(words.map(([k, n]) => `"${k}" ${n}`).join('; ') || 'none'); }
  md.push('');
  md.push('## Screens visited');
  for (const [id, v] of Object.entries(STATS.screens)) md.push(`- ${id}: ${v.visits || 0} visits, ${v.buttons || 0} controls, ${v.leaves || 0} that left the screen`);
  md.push('');
  md.push('## Scenes');
  for (const s of STATS.scenes) md.push(`- ${s.scene} seed ${s.seed} ${s.ms} ms ${s.result} ${JSON.stringify(s.args)}`);
  writeFileSync(base + '.md', md.join('\n') + '\n');
  return { md: base + '.md', json: base + '.json' };
}

main().then(() => process.exit(0), (e) => { process.stderr.write('playtest failed: ' + (e && e.stack || e) + '\n'); process.exit(1); });
