// THE BOSS GLITCH HUNTER. Plays every boss -- the twelve Boss Rush bosses, One and Steve Cobs -- with AI fighters, and reports what the
// tests cannot see. jsdom accepts what a real browser refuses: a negative arc radius is an IndexSizeError that kills that frame's drawing,
// a radial gradient with a NaN radius is a TypeError, a colour built from NaN is a SyntaxError, and none of them throws in the stub canvas
// the suite draws on. So the whole game is drawn through a VALIDATING canvas (test/helpers/validating-canvas.js), and the sim is watched
// for the things a player calls bugs.
//
//   node scripts/boss-glitch.mjs                            everything: 14 bosses x RUNS (6) runs, then one whole Boss Rush (about 20-40 min on 5 workers)
//   BOSSES='["Four","One"]' node scripts/boss-glitch.mjs    just these bosses (and no Boss Rush run)
//   RUNS=12 SEED0=1000 node scripts/boss-glitch.mjs         more runs a boss, on other seeds, fighters and window sizes
//   MOVES=1 node scripts/boss-glitch.mjs                    the move matrix: every move of every Boss Rush boss in each of its three phases, 720 frames each
//   RUSH=only node scripts/boss-glitch.mjs                  just the Boss Rush run;  RUSH=0  never the Boss Rush run
//   REPRO='Four|Pen,Coiny|113|forced|art|1280x720|-' node scripts/boss-glitch.mjs     one run again (the repro line a finding prints; the last field is
//                                                           items / assists / same, joined by +, or -), VERBOSE=1 for the boss's hit sources, TRACE=1 for every hit,
//                                                           WATCH='summons[0]._atkTimer' (any expression the game can evaluate, JSON-able) prints it every WATCH_EVERY (120) frames
//   SELFTEST=1 node scripts/boss-glitch.mjs                 each detector fed a fault it must find (the exit code is how many it missed)
//   JOBS=4  FRAMES=3600  DRAW_EVERY=2  NET_EVERY=10  OUT=report.json  SIZE=800x600  ALL_FIGHTERS=0  VERBOSE=1     (see below)
// Run from the repo root (it reads artifacts/V1/index.html). Every run boots its own game on its own seed, so the same build and the same
// repro line print the same findings. It is not in the vitest suite: it is minutes, not seconds.
//
// WHAT IT DOES
//  - Draws every DRAW_EVERY-th frame through the validating canvas: arc / ellipse / arcTo / roundRect / gradients with a negative
//    radius, any non-finite coordinate or size in any call, NaN in a colour or a font or a line of text, a gradient stop off [0,1],
//    drawImage with a broken, zero-size or not-yet-loaded source, a globalAlpha or a fill the browser would ignore, restore() with nothing
//    saved, a draw() that ends with saves left open. Sprites "load" with the real width and height of their PNG (the vector fallback is what
//    jsdom normally draws; `art` runs draw the show's art as a player sees it, `noart` the fallback a player sees while it loads).
//  - Every NET_EVERY frames it also takes the host's netcode snapshot (serializeState, through JSON as on the wire) and applies and draws it
//    in a SECOND game, a client's, through the same validating canvas: a field a client draws but is never sent shows up there. On runs
//    where the client's window is the host's size it also counts the canvas calls of the boss, its shots, hazard, decor and bar, host and
//    client, for the same state: a picture the client draws differently for five snapshots in a row is a `net-drawdiff`.
//  - Anything the game loop would swallow ("loop frame error") is a finding here with its stack, so is anything the page's own try/catch
//    swallows (catch blocks that do nothing are rewritten to say so; audio and storage noise is filtered out), console.error, a timer's throw.
//  - Invariants, checked every frame: NaN / Infinity in any position, velocity, size or boss state; a living boss with no new attack for
//    15 s (but One's ghost fight), or a turn held (1e6) that never lets go; a boss off screen or too high to reach for 5 s; a fighter held, frozen, stunned,
//    swallowed, rooted or slowed for 5 s, or alive outside the world; a shot alive for 30 s, or more than 300 at once; a list that only
//    grows; boss shots, hazards or adds that still hurt after the boss has fallen (the BOSS DOWN card, the next boss); a boss hit that
//    landed on a fighter in hit grace; a boss hit that struck within 12 frames of its source appearing, with no wind-up just before it and
//    no mark of its own (a possible NO-TELL hit: look at its source before believing it -- the marks and lanes a boss draws in its own
//    arrays are not seen from here); three boss hits in a row on a fighter who was already stunned or held; a burst of sparks with no colour.
//  - The Boss Rush run plays all twelve in order (and one boss of the second loop), and at every spawn checks what the last boss left
//    behind: the arena and its props against a clean spawn of the same boss, shots, adds, beams, vines, dust, scars, statuses a boss gave
//    a fighter (slip, slow, held, swallowed, anything a boss adds to the fighter), timers still pending.
//
// A RUN is {boss, lineup, seed, mode, art, window}: the mode `forced` shortens the fight (the boss's bar is cut to its phases at fixed ages
// and finished at 1900 frames, fighters have 9 stocks, so every phase and the ending are played), `skip` takes phase 1 straight to 3 and
// kills him in the middle of a wind-up, `move` kills him in the middle of a scripted move, `natural` is the bots alone with 3 stocks, and
// `moves:j:p` makes every turn move j in phase p. Some runs have the game's own items on, or call a trophy (Eraser, Black Hole...) every
// 4 s. The fighters are the whole playable roster in rotation, the windows run from 480 x 800 to 2560 x 1440, and the bots are the game's
// own AI. Nothing here tunes anything: it only looks.
//
// OUTPUT: findings grouped by boss, each with its repro (lineup, seed, mode, frame, the boss's phase and age) and a stack or the values,
// stacks as index.html:LINE. `error` findings (throws, NaN, hangs, leaks) always print; `warn` ones (ignored draws, possible no-tells, long
// statuses) print too; `info` (what a run saw) only with VERBOSE=1. The whole report is also written to OUT (default: not written).
import { readFileSync, writeFileSync } from 'node:fs';
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { availableParallelism } from 'node:os';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';
import { mulberry32 } from '../test/helpers/prng.js';
import { makeCtx, installImages } from '../test/helpers/validating-canvas.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const GAME_DIR = join(ROOT, 'artifacts/V1');
const env = process.env;
const FRAMES = Number(env.FRAMES || 3600), DRAW_EVERY = Math.max(1, Number(env.DRAW_EVERY || 2)), NET_EVERY = Number(env.NET_EVERY ?? 10);
const RUNS = Number(env.RUNS || 6), VERBOSE = !!env.VERBOSE;
const FORCED_END = 1900;   // a forced fight's boss falls at this age (frames); phases 2 and 3 are cut in at 500 and 1100
let FIGHTERS = ['Firey', 'Leafy', 'Pin', 'Needle', 'Coiny', 'Bubble', 'Pen', 'Snowball', 'Blocky', 'Ice Cube', 'Match', 'Pencil', 'Rocky', 'Tennis Ball', 'Golf Ball'];
// The window a host plays in: boss code works in WW and WH, and what is fine at 1280 x 720 can draw left of x = 0 or hang off the floor at
// 800 x 600 (the car's bubbles in the sand did). A run's plan, in order for run k of boss number bi: the fighters (one, two, one, three...
// from the roster, different for every boss), how the fight goes (forced, forced, natural), whether the sprites are loaded, the window.
const SIZES = [[1280, 720], [1920, 1080], [1024, 768], [800, 600], [1600, 900], [1366, 768], [640, 480], [480, 800], [2560, 1440]];
const PLANS = { at: (bi, k) => {
  const n = [1, 2, 1, 3, 1, 4][k % 6], names = [];
  for (let i = 0; i < n; i++) names.push(FIGHTERS[(k * 4 + bi * 5 + i * 7) % FIGHTERS.length]);
  return { names: [...new Set(names)], mode: ['forced', 'skip', 'natural', 'move', 'forced', 'natural'][k % 6], art: k % 2 === 0, size: SIZES[k % SIZES.length], items: k % 4 === 1, assists: k % 4 === 3 };   // items: the game's own item drops (assists, heals...) on high; assists: one of the thirteen trophies called every 4 s
} };

// ---------------------------------------------------------------------------------------------------------------------------------
//  THE GAME, BOOTED: a validating canvas, sprites that load, a clock that only the harness moves
// ---------------------------------------------------------------------------------------------------------------------------------
const HTML = readFileSync(join(GAME_DIR, 'index.html'), 'utf8');
// stack lines inside the page's script are relative to the script tag; index.html's own line is that plus this
const SCRIPT_LINE0 = (() => { const at = HTML.lastIndexOf('<script', HTML.indexOf('function applyHit(')); return HTML.slice(0, HTML.indexOf('>', at)).split('\n').length; })();
// every `catch(e){}` that does nothing now says so (window.__sw, per realm), the line count kept so a stack still points at the right line
const HTML_SW = HTML.replace(/catch\s*\(\s*(\w+)\s*\)\s*\{\s*\}/g, (m, v) => `catch(${v}){ window.__sw && window.__sw(${v}); }` + '\n'.repeat((m.match(/\n/g) || []).length));
export const mapStack = (s) => String(s).replace(/(?:https?:\/\/localhost\/?)+:(\d+):(\d+)/g, (_m, l) => 'index.html:' + (Number(l) + SCRIPT_LINE0 - 1));

function bootRealm({ seed, art, w = 1280, h = 720, sink, label }) {
  const clock = { now: 0 }, timers = new Map(); let tid = 0;
  const realmRef = { info: () => ({}), mute: false };
  const rec = (sev, kind, key, detail, stack) => { if (!realmRef.mute) sink.add(label, sev, kind, key, detail, stack, realmRef.info()); };
  const dom = new JSDOM(HTML_SW, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(win) {
      win.HTMLCanvasElement.prototype.getContext = function (type) { if (type && type !== '2d') return null; return this.__vctx || (this.__vctx = makeCtx(this, rec)); };
      win.Math.random = mulberry32(seed);
      win.requestAnimationFrame = () => 0; win.cancelAnimationFrame = () => {};
      Object.defineProperty(win, 'innerWidth', { value: w, configurable: true }); Object.defineProperty(win, 'innerHeight', { value: h, configurable: true });
      Object.defineProperty(win.performance, 'now', { value: () => clock.now, configurable: true });
      win.Date.now = () => 1.8e12 + clock.now;
      win.setTimeout = (fn, ms = 0, ...a) => { const id = ++tid; timers.set(id, { at: clock.now + Math.max(0, +ms || 0), fn, a, id, every: 0 }); return id; };
      win.setInterval = (fn, ms = 0, ...a) => { const id = ++tid; timers.set(id, { at: clock.now + Math.max(1, +ms || 1), fn, a, id, every: Math.max(1, +ms || 1) }); return id; };
      win.clearTimeout = win.clearInterval = (id) => { timers.delete(id); };
      if (art) installImages(win, rec, GAME_DIR);
      win.console.error = (...a) => { const m = a.map((x) => (x && x.stack) || String(x)).join(' '); rec('warn', 'console-error', m.replace(/\d+/g, '#').slice(0, 70), 'console.error: ' + m.slice(0, 600), (a.find((x) => x && x.stack) || {}).stack || ''); };
      win.addEventListener('error', (e) => rec('error', 'page-error', String(e.message).slice(0, 80), `uncaught: ${e.message}`, e.error && e.error.stack));
      win.addEventListener('unhandledrejection', (e) => rec('error', 'page-rejection', String(e.reason && e.reason.message || e.reason).slice(0, 80), `unhandled rejection: ${e.reason && e.reason.stack || e.reason}`, ''));
      // `catch(e){}` blocks, rewritten above: the page's own swallowed errors, minus the noise a headless boot always has
      win.__sw = (e) => {
        const m = String(e && e.message || e), st = String(e && e.stack || '');
        if (/AudioContext|webkitAudio|localStorage|SecurityError|Not implemented|createMediaElementSource|navigator\.|getUserMedia|clipboard|vibrate|indexedDB|Audio is not|play\(\)|decodeAudioData|MediaRecorder|captureStream|requestFullscreen|Cannot read properties of (null|undefined) \(reading '(createGain|connect|currentTime|gain|destination|resume|state|createOscillator|createBufferSource|start|stop)'\)|(snd|SFX|Music|music|Audio|audio|startMusic|stopMusic|sndInit)\w*/.test(m + ' ' + st.split('\n').slice(0, 4).join(' '))) return;
        rec('warn', 'swallowed', m.slice(0, 90) + ' @' + (st.split('\n')[1] || '').trim().slice(0, 60), `the page's own catch swallowed: ${st.split('\n').slice(0, 6).join(' < ')}`, '');
      };
      win.__adv = (ms) => {
        clock.now += ms;
        for (let guard = 0; guard < 200; guard++) {
          let next = null;
          for (const t of timers.values()) if (t.at <= clock.now && (!next || t.at < next.at || (t.at === next.at && t.id < next.id))) next = t;
          if (!next) break;
          if (next.every) next.at += next.every; else timers.delete(next.id);
          try { next.fn(...next.a); } catch (e) { rec('error', 'timer-exception', String(e && e.message).slice(0, 80), `a timer callback threw: ${e && e.stack}`, ''); }
        }
      };
      win.__pending = () => [...timers.values()].map((t) => ({ in: Math.round(t.at - clock.now), every: t.every, src: String(t.fn).replace(/\s+/g, ' ').slice(0, 110) }));
    },
  });
  const win = dom.window;
  return { win, clock, dom, setInfo: (f) => { realmRef.info = f; }, setMute: (m) => { realmRef.mute = m; } };
}

// ---------------------------------------------------------------------------------------------------------------------------------
//  THE PAGE'S SIDE: evaluated inside each game. Plain JS, no imports; it reads the game's own globals.
// ---------------------------------------------------------------------------------------------------------------------------------
function pageHarness() {
  const G = (window.__G = { frame: 0, bn: '', F: Object.create(null), S: { draws: 0, clientDraws: 0, falls: 0, spawns: [], phases: {}, hits: {}, maxShots: 0, turns: 0, dyn: {}, max: {} }, cfg: {}, tel: { on: false, start: -1, end: -1, kind: null, len: 0 }, bt: null, fallFrame: null, spawnSigs: [], leaks: [], st: Object.create(null) });
  const born = new WeakMap();
  G.pHs = Object.create(null);
  const stk = (e, n) => { try { return String((e && e.stack) || e).split('\n').slice(0, (n || 6) + 1).map((l) => l.trim()).join(' < '); } catch (_) { return String(e); } };
  // the nth function name above the harness in an error's stack, for keying a finding by where it came from
  const fn1 = (e, k) => { const out = []; for (const l of String((e && e.stack) || '').split('\n').slice(1)) { const m = l.match(/at (?:async )?([\w$.<>]+) \(/); if (m && !/^(G\.|pageHarness|eval|Object\.|puff$)/.test(m[1])) out.push(m[1]); if (out.length > k) break; } return out[k] || '?'; };
  const short = (v, n) => { let s; try { s = typeof v === 'string' ? v : JSON.stringify(v); } catch (_) { s = String(v); } return s === undefined ? 'undefined' : s.length > (n || 160) ? s.slice(0, n || 160) + '…' : s; };
  G.boss = () => summons.find((s) => s && s.type === 'boss') || null;
  G.note = function (kind, key, detail, sev) {
    const k = kind + '|' + key;
    let f = G.F[k];
    if (!f) {
      const b = G.boss();
      f = G.F[k] = { kind, key, sev: sev || 'error', n: 0, frame: G.frame, boss: b ? b.name : G.lastBoss || '', phase: b ? b._phase : 0, age: G.bt ? G.frame - G.bt.spawn : -1, detail: String(detail).slice(0, 2400) };
    }
    f.n++;
    return f;
  };
  // ------- instrumented entry points
  const projLabel = (p) => {
    if (p.shape) return 'shot:' + p.shape;
    for (const k in p) if (p[k] && /^(ann|psb|fsb?|swarm|pface|pf|dragon|mp|el|s4|two|four|cobs|spring|one|ghost|bug|tlc)[A-Z_a-z]/.test(k) && k !== 'owner' && k !== 'ownerObj') return 'shot:' + k;
    return 'shot';
  };
  // who called applyHit, for a hit that came from no shot: the two or three functions above the wrapper, and what the boss was doing
  const callers = (stack) => {
    const names = []; let cat = 'boss';
    for (const l of String(stack).split('\n').slice(1)) {
      const m = l.match(/at (?:async )?([\w$.<>]+) \(/); if (!m) continue;
      const n = m[1];
      if (n === 'applyHit' || n === 'G.onHit' || n === 'eval' || n === 'pageHarness' || n.startsWith('Object.')) continue;
      names.push(n);
      if (names.length >= 3 || n === 'step') break;
    }
    const s = names.join('<'), b = G.boss();
    if (/arenaHazardHit|haz/i.test(String(stack))) cat = 'hazard'; else if (/contact|touch|bump|elMove/i.test(s)) cat = 'contact';
    return { label: (cat === 'hazard' ? 'hazard:' : cat === 'contact' ? 'contact:' : 'move:') + (s || 'step') + (b ? ' [' + b.name + (G.tel.on ? ' winding ' : ' idle ') + (G.tel.kind || '') + ']' : ''), cat };
  };
  const AH = applyHit;
  applyHit = function (t, dmg, kx, ky, from, opts) {
    const bossSide = !!((opts && opts.bossAtk != null) || (from && (from.hostile || from.type === 'boss' || from.team === -1)));
    if (!bossSide || !t || t.dead || t.type) return AH.apply(this, arguments);
    const p0 = t.pct, hs0 = t.hitstun, fr0 = t.frozen, sw0 = t._swallow, inv0 = t.invuln;
    const r = AH.apply(this, arguments);
    if (t.pct > p0 + 1e-9) { try { G.onHit(t, t.pct - p0, from, opts, hs0, fr0, sw0, inv0); } catch (e) { G.note('harness', 'onHit', stk(e)); } }
    return r;
  };
  G.onHit = function (t, dmg, from, opts, hs0, fr0, sw0, inv0) {
    const f = G.frame; let src = null;
    if (opts && opts.shot) {
      let bd = 1e9;
      for (const p of projectiles) { if (p.life <= 0 || (opts.bossAtk != null && p.bossAtk !== opts.bossAtk)) continue; const d = hurtGap(t, p.x, p.y) - (p.r || 0); if (d < bd) { bd = d; src = p; } }
    }
    let label, age, marked = false, telGap = G.tel.on ? 0 : (G.tel.end >= 0 ? f - G.tel.end : 9999), cat = 'boss';
    let near = '', onVictim = false;
    if (src) { const bi = born.get(src); label = bi ? bi.label : projLabel(src); age = bi ? f - bi.f : 0; marked = bi ? bi.marked : !!(src.warn > 0 || src.delay > 0); if (bi) telGap = bi.telGap; cat = 'shot';
      onVictim = !bi || Math.hypot(bi.x0 - t.x, bi.y0 - t.y) < 150;
      near = bi ? `; it first appeared ${Math.round(Math.hypot(bi.x0 - t.x, bi.y0 - t.y))} px from the victim, at speed ${bi.spd.toFixed(1)}, r ${src.r}` : '; it appeared this frame'; }
    else { const c = callers(new Error().stack); label = c.label; cat = c.cat; age = telGap; }
    if (G.cfg.trace && (G.S.log || (G.S.log = [])).length < 4000) G.S.log.push([f, t.idx, label, +dmg.toFixed(1), age, telGap, hs0, fr0, sw0, inv0, Math.round(t.x), Math.round(t.y), src ? src.bossAtk : opts && opts.bossAtk]);   // TRACE=1: every boss hit, in order
    const H = G.S.hits[label] || (G.S.hits[label] = { n: 0, dmg: 0, minAge: 1e9, noTell: 0, cat });
    H.n++; H.dmg += dmg; H.minAge = Math.min(H.minAge, age);
    const info = `${t.name}#${t.idx} took ${dmg.toFixed(1)}% on frame ${f} (boss age ${G.bt ? f - G.bt.spawn : '-'}, phase ${G.boss() ? G.boss()._phase : '-'}) from ${label}; source age ${age}, wind-up ended ${telGap >= 9999 ? 'never' : telGap + ' frames before'}, marked ${marked}${near}; victim hitstun ${hs0} frozen ${fr0} swallow ${sw0} invuln ${inv0} at (${Math.round(t.x)}, ${Math.round(t.y)})`;
    if (G.fallFrame != null) G.note('post-fall-hit', label, `${info}; the boss fell on frame ${G.fallFrame} (${f - G.fallFrame} frames ago)`);
    else if (cat !== 'contact' && age <= 12 && !marked && telGap > 20) { H.noTell++; G.note('notell', label + (onVictim ? ' [appeared on the victim]' : ''), info, 'warn'); }
    else if (cat === 'contact' && telGap > 20) { H.noTell++; G.note('contact', label, info, 'info'); }
    // a boss hit skips a fighter in their grace (invuln), as the projectile loops and arenaHazardHit do: one that lands on one anyway is a hit the engine's own rule says should not be
    if (inv0 > 0 && !(opts && (opts.tick || opts.volley))) G.note('grace-hit', label, `${info}; the victim was in hit grace (invuln ${inv0}) and the boss hit landed`, 'warn');
    // a chain: hits one after another on a fighter who was ALREADY stunned, held or swallowed when the frame began (a stun the hit itself dealt does not count)
    const was = G.pHs[t.idx], ch = G.st['chain' + t.idx] || (G.st['chain' + t.idx] = { n: 0, last: -999 });
    if (was && f - ch.last < 120) { if (++ch.n >= 3) G.note('stunlock', label, `${info}; ${ch.n} boss hits in a row on a fighter who could not act`, 'warn'); } else ch.n = was ? 1 : 0;
    ch.last = f;
  };
  // the boss's own fall, and the next one's arrival
  const BE = bossEndingBegin;
  bossEndingBegin = function (b) { G.fallFrame = G.frame; G.fallBoss = b && b.name; G.S.falls++; G.lastBoss = b && b.name; return BE.apply(this, arguments); };
  const NSP = (name) => (typeof globalThis[name] === 'function');
  const wrapSpawn = (name) => {
    if (!NSP(name)) return;
    const SP = globalThis[name];
    globalThis[name] = function () {
      G.beforeSpawn(name);
      const r = SP.apply(this, arguments);
      G.afterSpawn(name);
      return r;
    };
  };
  const cleanKeys = ['burn', 'bleed', 'frozen', 'slowed', 'rooted', 'ctrlRev', 'weakened', 'curse', 'curseStacks', 'defineStacks', 'cloud', '_infected', 'hitstun', '_stunFx', '_swallow', '_cookieT', 'iceUntil', '_poisonT', '_grabTimer', '_taunted', '_noBattery', '_floatT', 'flying', '_freezeLock', '_revLock'];
  G.tpl = null;
  G.dynKeys = (f) => { if (!G.tpl) G.tpl = makeFighter(ROSTER.find((r) => r.play) || ROSTER[0], 0, 0, 0); const out = []; for (const k in f) if (!(k in G.tpl)) { const v = f[k]; if (v === true || (typeof v === 'number' && v !== 0) || (v && typeof v === 'object')) out.push(k); } return out; };
  const platSig = () => worldPlats.map((p) => [Math.round(p.x), Math.round(p.y), Math.round(p.w), Math.round(p.h), p.solid ? 1 : 0, p.wall ? 1 : 0, p.ladder ? 1 : 0, p.floor ? 1 : 0, p.hop ? 1 : 0, Math.round((p.rot || 0) * 100), p.field ? 1 : 0].join(',')).sort();
  G.sig = () => ({ arena: BOSS_ARENA, stage: stage && stage.id, WW, WH, plats: platSig(), floors: floors.length, projectiles: 0, hostile: projectiles.filter((p) => (p.ownerObj ? p.ownerObj.team === -1 : p.owner === -2)).length, assists: summons.filter((s) => s.type !== 'boss' && s.life > 3).length, bosses: summons.filter((s) => s.type === 'boss').length, beams: beams.length, tendrils: tendrils.length, items: items.length, evil: !!evil, dust: IMPACT_DUST.length, debris: IMPACT_DEBRIS.length, scars: IMPACT_SCARS.length, oneFx: oneFx.length, cobsFx: cobsFx.length });
  G.beforeSpawn = function (name) {
    G.leaks = [];
    if (name !== 'spawnBossRushBoss' || !G.cfg.rush) return;
    const L = G.leaks, nb = BOSS_ROSTER[BOSSRUSH.bossIdx], tag = (G.lastBoss || 'start') + ' -> ' + (nb && nb.name);
    for (const f of fighters) {
      if (f.dead) continue;
      for (const k of cleanKeys) { const v = f[k]; if (v > 0 || v === true || (v && typeof v === 'object')) L.push(`fighter ${f.name}#${f.idx}: ${k} = ${short(v, 40)} when the next boss spawns`); }
      // a field a boss gives a fighter and nothing takes off again (kits keep many fields of their own for good: only these prefixes are a boss's)
      for (const k of G.dynKeys(f)) if (/^_(mp|pf|s4|psb|ann|sw|fs|el|dr|two|four|spr|cobs|one|bye|carr|swallow|cookie|corked|ido|assistHit|cuff|pin|cage|tang|squig|poss|slip)/.test(k) && k !== '_oneStocks0') L.push(`fighter ${f.name}#${f.idx}: extra field ${k} = ${short(f[k], 60)} when the next boss spawns`);
    }
    const bs = projectiles.filter((p) => (p.ownerObj ? p.ownerObj.team === -1 : p.owner === -2) || p.bossAtk != null);   // (a trophy's mines are owner -2 too, on the fighters' team)
    if (bs.length) L.push(`${bs.length} boss shots still out when the next boss spawns: ${[...new Set(bs.map(projLabel))].slice(0, 8).join(', ')}`);
    const adds = summons.filter((s) => s.type !== 'boss' && s.life > 3);
    if (adds.length) L.push(`${adds.length} adds still standing: ${[...new Set(adds.map((s) => s.type + ':' + s.name))].slice(0, 6).join(', ')}`);
    if (beams.length) L.push(`${beams.length} beams left`); if (tendrils.length) L.push(`${tendrils.length} vines left`); if (evil) L.push('the Evil Forest corner Evil Leafy is still standing');
    if (summons.some((s) => s.type === 'boss')) L.push(`the old boss is still in summons: ${summons.filter((s) => s.type === 'boss').map((s) => s.name + ' hp ' + s.hp).join(', ')}`);
    if (IMPACT_DUST.length || IMPACT_DEBRIS.length || IMPACT_SCARS.length) L.push(`impact leftovers: dust ${IMPACT_DUST.length}, debris ${IMPACT_DEBRIS.length}, scars ${IMPACT_SCARS.length}`);
    const extra = worldPlats.length - (G.bare ? G.bare.length : 0);
    if (G.bare && (extra !== 0 || platSig().join('|') !== G.bare.join('|'))) L.push(`worldPlats differ from the bare stage when the next boss spawns: ${worldPlats.length} now, ${G.bare.length} bare`);
    if (window.__pending) { const pend = window.__pending().filter((t) => !/classList\.remove\('show'\)/.test(t.src) && !/spawnBossRushBoss/.test(t.src)); for (const t of pend) L.push(`timer pending when the next boss spawns (in ${t.in} ms${t.every ? ', every ' + t.every : ''}): ${t.src}`); }
    G.S.lastLeakTag = tag;
    for (const l of L) G.note('leak', tag + ': ' + l.replace(/\d+/g, '#').slice(0, 80), `${tag}: ${l}`, /^impact leftovers/.test(l) ? 'warn' : 'error');
  };
  G.afterSpawn = function (name) {
    const b = summons.filter((s) => s.type === 'boss').pop();
    if (!b) return;
    G.fallFrame = null; G.fallBoss = null;
    G.bt = { name: b.name, spawn: G.frame, boss: b, telOn: false, lastTurn: G.frame, turns: 0, held: 0, off: 0, high: 0, alive: true };
    G.tel = { on: false, start: -1, end: -1, kind: null, len: 0 };
    G.S.spawns.push({ boss: b.name, frame: G.frame, hp: b.hp });
    G.lastBoss = b.name;
    const sg = G.sig(); sg.boss = b.name; sg.bossXY = [Math.round(b.x), Math.round(b.y)]; sg.hz = Object.keys(b._hz || {}).length;
    G.spawnSigs.push(sg);
  };
  wrapSpawn('spawnBossRushBoss'); wrapSpawn('spawnOneBoss'); wrapSpawn('spawnCobsBoss');
  // the barest stage, for the leak check: taken just before the gauntlet begins
  const SB = startBossRush;
  startBossRush = function () { G.bare = platSig(); return SB.apply(this, arguments); };

  // ------- what each boss-related draw cost the canvas in operations, in the last picture drawn: a host and a client of the same size, shown the same state, make the same
  G.ops = {}; G.opsLast = {};
  for (const name of ['drawSummon', 'drawArenaHazard', 'drawArenaDecor', 'drawProjectile', 'drawBossBar']) {
    const F = globalThis[name]; if (typeof F !== 'function') continue;
    globalThis[name] = function () { const o0 = ctx.__ops; try { return F.apply(this, arguments); } finally { G.ops[name] = (G.ops[name] || 0) + (ctx.__ops - o0); } };
  }
  // ------- starting a fight
  G.start = function (cfg) {
    G.cfg = cfg; G.chosen = cfg.names[0];
    SETTINGS.mode = 'boss'; SETTINGS.count = cfg.names.length; SETTINGS.stocks = cfg.stocks; SETTINGS.items = !!cfg.items; SETTINGS.itemRate = cfg.items ? 3 : 0;
    chosen = ROSTER.find((r) => r.name === cfg.names[0] && r.play) || ROSTER.find((r) => r.play);
    if (cfg.kind === 'one' || cfg.kind === 'cobs') {
      const ok = (cfg.kind === 'one' ? startOneFight : startCobsFight)(cfg.names, { story: !!cfg.story, onEnd: function () { return true; } });
      if (!ok) throw new Error('could not start the ' + cfg.kind + ' fight');
    } else {
      LINEUP_MEMO = { key: lineupKey(Math.max(minCount(), cfg.names.length)), names: cfg.names.slice(1), teamOf: null };
      if (cfg.kind === 'boss') {
        const k = BOSS_ROSTER.findIndex((b) => b.name === cfg.boss); if (k < 0) throw new Error('no such boss ' + cfg.boss);
        const wrapped = spawnBossRushBoss;
        spawnBossRushBoss = function () { spawnBossRushBoss = wrapped; BOSSRUSH.bossIdx = k; return wrapped.apply(this, arguments); };
      }
      beginMatchNow();
    }
    for (const f of fighters) { f.controller = 'ai'; f.you = false; }
    NET.role = 'host'; NET.myIdx = 0; NET.ws = { readyState: 1, bufferedAmount: 0, send() {}, close() {} };
    G.names = fighters.map((f) => f.name);
    return fighters.length;
  };
  // ------- one frame's checks
  const NF = (o, keys, what) => { for (const k of keys) { const v = o[k]; if (typeof v === 'number' && !Number.isFinite(v)) G.note('nonfinite', what + '.' + k, `${what}.${k} = ${v} on frame ${G.frame}: ${short({ name: o.name, x: o.x, y: o.y, vx: o.vx, vy: o.vy, r: o.r, shape: o.shape })}`); } };
  const deep = (o, path, depth, acc) => {
    if (acc.n > 4000 || depth > 4 || !o || typeof o !== 'object') return;
    for (const k in o) {
      if (k === 'ownerObj' || k === 'hurt' || k === 'boss' || k === 'kit' || k === 'aiTarget' || k === 'lastHitBy' || k === '_ghost' || k === 'prev') continue;
      let v; try { v = o[k]; } catch (_) { continue; }
      acc.n++;
      if (typeof v === 'number') { if (!Number.isFinite(v) && !(k === 'life' || k === 'stocks')) { acc.bad.push(path + '.' + k + '=' + v); if (acc.bad.length > 4) return; } }
      else if (v && typeof v === 'object' && !(v instanceof Node) && depth < 4) deep(v, path + '.' + k, depth + 1, acc);
    }
  };
  const STREAK = ['hitstun', '_stunFx', 'frozen', 'rooted', 'slowed', 'ctrlRev', '_swallow', '_cookieT', 'iceUntil', '_grabTimer'];   // (burn, bleed, weakness, a cloud do not take a fighter's control)
  G.post = function () {
    const f = G.frame, b = G.boss(), bt = G.bt;
    if (b) G.bn = b.name;
    if (b && G.fallFrame == null && (b._oneFight || b._cobsFight) && (b.hp <= 0 || b._dying > 0)) { G.fallFrame = f; G.fallBoss = b.name; G.S.falls++; }   // One and Steve Cobs have no BOSS_ENDINGS: they fall by their own code
    // the boss's turns
    if (b && bt && bt.boss === b) {
      if (b._tel > 0) { if (!G.tel.on) { G.tel.on = true; G.tel.start = f; G.tel.kind = b._telKind; G.tel.len = 0; bt.lastTurn = f; bt.turns++; G.S.turns++; } G.tel.len++; }
      else if (G.tel.on) { G.tel.on = false; G.tel.end = f; }
      const ph = b._phase || 1; G.S.phases[b.name + ':' + ph] = (G.S.phases[b.name + ':' + ph] || 0) + 1;
      const alive = fighters.some((q) => !q.dead);
      const hp = b.hp > 0 && G.fallFrame == null;
      if (hp && alive) {
        if (b._atkTimer > 5e5) { if (++bt.held === 600) G.note('turn-held', b.name + ' ' + (b._telKind || ''), `${b.name}'s attack timer has been held at ${b._atkTimer} for 600 frames (move ${b._telKind}, tel ${b._tel}, phase ${b._phase}); open state: ${short(Object.keys(b).filter((k) => b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && !/^(_hz|_rigState)$/.test(k)).map((k) => k + '=' + short(b[k], 90)), 400)}`); } else bt.held = 0;
        if (b._ghost && !b._ghost.dead) bt.lastTurn = f;   // One lets her ghost fight and is shielded while it stands: no new turn of her own by design
        if (f - bt.lastTurn === 901 && f - bt.spawn > 300) G.note('no-attack', b.name, `${b.name} (phase ${b._phase}) has not begun a turn for 900 frames (a long move and a phase change fit in 600): _atkTimer ${b._atkTimer}, _tel ${b._tel}, _telKind ${b._telKind}, x ${Math.round(b.x)} y ${Math.round(b.y)}; open state: ${short(Object.keys(b).filter((k) => b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && k !== '_hz').map((k) => k + '=' + short(b[k], 90)), 400)}`);
        // off the screen, or too high to reach
        const gy = groundY(), vis = b.x > -b.r * 0.5 && b.x < WW + b.r * 0.5 && b.y > -b.r * 1.5 && b.y < WH + b.r;
        const away = !!(b._s4 && b._s4.k === 'car' && b._s4.st === 'away');   // MePhone4S's I'LL BE BACK! runs him off the screen on purpose while the cars cross (it is as long as the stage is wide)
        if (!vis && !away) { if (++bt.off === 300) G.note('boss-offscreen', b.name, `${b.name} has been off the screen for 300 frames at (${Math.round(b.x)}, ${Math.round(b.y)}), r ${Math.round(b.r)}, world ${WW} x ${WH}, phase ${b._phase}, move ${b._telKind}`); } else bt.off = 0;
        if (vis && !b._oneFight && !b._cobsFight && gy - (b.y + b.r) > 640) { if (++bt.high === 300) G.note('boss-unreachable', b.name, `${b.name} has hung ${Math.round(gy - (b.y + b.r))} px above the floor for 300 frames (a double jump from the top platform reaches about 500), phase ${b._phase}, move ${b._telKind}`, 'warn'); } else bt.high = 0;
      }
      if (f % 20 === 0) { const acc = { n: 0, bad: [] }; deep(b, 'boss', 0, acc); if (acc.bad.length) G.note('nonfinite', 'boss state ' + acc.bad[0].replace(/\[\d+\]/g, ''), `${b.name} state has ${acc.bad.join(', ')} on frame ${f}`); }
    }
    // shots: births, age, count
    let n = 0;
    for (let i = 0; i < projectiles.length; i++) {
      const p = projectiles[i]; n++;
      let bi = born.get(p);
      if (!bi) born.set(p, bi = { f, x0: p.x, y0: p.y, spd: Math.hypot(p.vx || 0, p.vy || 0), marked: !!(p.warn > 0 || p.delay > 0 || p.warnX != null || p.warnY != null), telGap: G.tel.on ? 0 : (G.tel.end >= 0 ? f - G.tel.end : 9999), label: projLabel(p) });
      else if (f - bi.f > 1800 && !bi.flag && p.life > 0 && !(p.delay > 1e5 && G.fallFrame == null)) { bi.flag = 1; G.note('shot-lives-30s', bi.label, `a ${bi.label} has been alive ${f - bi.f} frames: life ${p.life}, delay ${p.delay}, at (${Math.round(p.x)}, ${Math.round(p.y)}), v (${p.vx}, ${p.vy}), dmg ${p.dmg}`, 'warn'); }
      NF(p, ['x', 'y', 'vx', 'vy', 'r', 'dmg'], 'shot ' + bi.label);
      if (G.fallFrame != null && f - G.fallFrame === 90 && p.dmg > 0 && !(p.delay > 0) && p.life > 0 && (p.ownerObj ? p.ownerObj.team === -1 : p.owner === -2) && !p.assist && !p.annGhost) G.note('post-fall-shot', bi.label, `${bi.label} is still out and live (dmg ${p.dmg}, life ${p.life}) ${f - G.fallFrame} frames after ${G.fallBoss} fell`, 'warn');
    }
    if (n > G.S.maxShots) G.S.maxShots = n;
    if (f % 30 === 0) {
      const L = { particles: particles.length, summons: summons.length, worldPlats: worldPlats.length, oneFx: oneFx.length, cobsFx: cobsFx.length, items: items.length, beams: beams.length, tendrils: tendrils.length, dust: IMPACT_DUST.length, debris: IMPACT_DEBRIS.length, scars: IMPACT_SCARS.length };
      if (G.plat0 == null) G.plat0 = L.worldPlats;   // a wide window builds its platforms from frame 0 (279 at 2560 x 1440): only growth past that is a leak
      const CAP = { particles: 3000, summons: 80, worldPlats: Math.max(220, G.plat0 + 120), oneFx: 600, cobsFx: 600, items: 60, beams: 200, tendrils: 400, dust: 400, debris: 400, scars: 200 };
      for (const k in L) { G.S.max[k] = Math.max(G.S.max[k] || 0, L[k]); if (L[k] > CAP[k]) G.note('list-grows', k, `${k} holds ${L[k]} entries on frame ${f} (more than ${CAP[k]}): something is adding to it faster than it is taken away`, 'warn'); }
    }
    if (n > 300) { const c = {}; for (const p of projectiles) { const l = (born.get(p) || {}).label || 'shot'; c[l] = (c[l] || 0) + 1; } G.note('too-many-shots', Object.keys(c).sort((a, b2) => c[b2] - c[a])[0], `${n} shots at once on frame ${f}: ${short(c, 300)}`, 'warn'); }
    // fighters
    for (const q of fighters) {
      NF(q, ['x', 'y', 'vx', 'vy', 'pct', 'r'], 'fighter ' + q.name);
      if (q.dead) { for (const k of STREAK) delete G.st[q.idx + '|' + k]; continue; }
      for (const k of STREAK) {
        if (k === 'slowed' && q._ghostDrift) continue;   // One's drift ghost is held slowed for as long as it stands (spawnOneGhost)
        const v = q[k], on = v > 0 || v === true, key = q.idx + '|' + k;
        if (on) { const s0 = G.st[key]; if (s0 === undefined) G.st[key] = f; else if (f - s0 === 300) G.note('fighter-stuck', k, `${q.name}#${q.idx} has had ${k} = ${short(v, 30)} for 300 frames in a row (frame ${f}, boss ${b ? b.name + ' phase ' + b._phase + ' move ' + b._telKind : 'none'}); at (${Math.round(q.x)}, ${Math.round(q.y)})`); }
        else delete G.st[key];
      }
      { const ko = 'oob' + q.idx;
        if (q.x < -300 || q.x > WW + 300 || q.y > WH + 600 || q.y < -1200) { G.st[ko] = (G.st[ko] || 0) + 1; if (G.st[ko] === 300) G.note('fighter-offworld', q.name, `${q.name}#${q.idx} has been alive outside the world for 300 frames at (${Math.round(q.x)}, ${Math.round(q.y)}), world ${WW} x ${WH}, boss ${b ? b.name + ' ' + b._telKind : 'none'}`); } else G.st[ko] = 0; }
      if (f % 30 === 0) for (const k of G.dynKeys(q)) G.S.dyn[k] = (G.S.dyn[k] || 0) + 1;   // the fields a fighter picks up in play (VERBOSE lists them: kits keep many for good, a boss's status would show here too)
    }
    for (const q of fighters) G.pHs[q.idx] = !q.dead && (q.hitstun > 0 || q.frozen > 0 || q._swallow > 0 || q.rooted > 0);
    // adds and others
    for (const s of summons) if (s !== b) NF(s, ['x', 'y', 'vx', 'vy', 'r', 'hp'], 'summon ' + (s.name || s.type));
    if (b) NF(b, ['x', 'y', 'vx', 'vy', 'r', 'hp', 'maxHp', '_tel', '_atkTimer'], 'boss ' + b.name);
  };
  // ------- the cuts of a forced fight. They are made at the END of the step (a wrapper of checkWin, which runs last): a boss whose bar is
  // emptied before updateSummons runs is removed by it before bossRushCheck can see it fall, and the gauntlet would never go on.
  const FORCED_END_FRAMES = 1900;
  G.cut = function () {
    const b = G.boss(), bt = G.bt;
    if (!b || !bt || bt.boss !== b || G.cfg.mode === 'natural' || G.fallFrame != null || !(b.hp > 0)) return;
    const age = G.frame - bt.spawn;
    if (typeof G.cfg.mode === 'string' && G.cfg.mode.startsWith('moves:')) {   // moves:j:p -- every turn is move j, held in phase p (the bar is kept inside its band)
      const ph = +G.cfg.mode.split(':')[2], lo = [0.7, 0.4, 0.06][ph - 1], hi = [1, 0.6, 0.3][ph - 1];
      b.hp = Math.min(b.maxHp * hi, Math.max(b.maxHp * lo, b.hp));
      return;
    }
    if (G.cfg.kind === 'one' || G.cfg.kind === 'cobs') {
      if (age % 90 === 60) { const dealer = fighters.find((q) => !q.dead); try { (b._oneFight ? oneTakeDamage : cobsTakeDamage)(b, b.maxHp * 0.045, dealer); } catch (e) { G.note('exception', 'forced damage', stk(e)); } }
      return;
    }
    if (G.cfg.mode === 'skip') {   // phase 1 straight to phase 3 in one blow, and a death in the middle of a wind-up
      if (age === 400 && b.hp > b.maxHp * 0.25) b.hp = b.maxHp * 0.25;
      else if (age >= 900 && (b._tel > 0 || age >= 1700)) b.hp = 0;
      return;
    }
    if (G.cfg.mode === 'move') {   // the usual cuts, and a death in the middle of a scripted move (its turn held at 1e6)
      if (age === 500 && b.hp > b.maxHp * 0.64) b.hp = b.maxHp * 0.64;
      else if (age === 1000 && b.hp > b.maxHp * 0.31) b.hp = b.maxHp * 0.31;
      else if (age >= 1300 && (b._atkTimer > 5e5 || age >= 2300)) b.hp = 0;
      return;
    }
    if (age === 500 && b.hp > b.maxHp * 0.64) b.hp = b.maxHp * 0.64;
    else if (age === 1100 && b.hp > b.maxHp * 0.31) b.hp = b.maxHp * 0.31;
    else if (age >= FORCED_END_FRAMES && b.hp > 0) b.hp = 0;
  };
  // moves:j:p, every turn: the next one is move j of [the signature, ...BOSS_EXTRA] (updateBossAttack picks by _moveN's parity and count), and the gap is cut to 24 frames
  const UB = updateBossAttack;
  updateBossAttack = function (s, tgt) {
    const m = G.cfg.mode;
    if (typeof m === 'string' && m.startsWith('moves:') && s.type === 'boss' && s._bossRush && !(s._tel > 0) && s._atkTimer < 5e5 && s.hp > 0) {
      const j = +m.split(':')[1];
      s._moveN = j === 0 ? 0 : 2 * j - 1;
      if (s._atkTimer > 24) s._atkTimer = 24;
    }
    return UB.apply(this, arguments);
  };
  const CW = checkWin;
  checkWin = function () { G.cut(); return CW.apply(this, arguments); };
  const PUF = puff;
  puff = function (x, y, color, n) {   // a burst with no colour is black or invisible, and one with no end never ends
    if (typeof color !== 'string' || !color || !Number.isFinite(n) || !Number.isFinite(x) || !Number.isFinite(y)) G.note('puff', (typeof color !== 'string' || !color ? 'no colour' : 'not finite') + ' from ' + fn1(new Error(), 0), `puff(${short(x, 20)}, ${short(y, 20)}, ${short(color, 30)}, ${short(n, 20)}) on frame ${G.frame}: ${stk(new Error(), 5)}`, 'warn');
    return PUF.apply(this, arguments);
  };
  G.run = function (n, drawEvery) {
    for (let i = 0; i < n; i++) {
      if (!running) return 'stopped';
      if (paused) { if (BOSSRUSH.card) { try { rushKeepGoing(); } catch (e) { G.note('exception', 'rushKeepGoing', stk(e)); } } else return 'paused'; }
      try { step(); } catch (e) { G.note('exception', 'step: ' + String(e && e.message).slice(0, 60) + ' @ ' + fn1(e, 0), `step() threw on frame ${G.frame}: ${stk(e, 8)}`); }
      G.post();
      G.frame++;
      if (G.cfg.watch && G.frame % G.cfg.watchEvery === 0) { try { console.log('[watch ' + G.cfg.boss + ' f' + G.frame + '] ' + JSON.stringify(window.eval(G.cfg.watch))); } catch (e) { console.log('[watch error] ' + e.message); } }   // WATCH='expr': a REPRO's own probe
      if (G.cfg.assists && G.frame % 240 === 100) { try { const q = fighters.find((o) => !o.dead && !o._oneGhost); if (q) summonAssistNamed(q, ASSIST_ROSTER[(G.assistN = (G.assistN || 0) + 1) % ASSIST_ROSTER.length]); } catch (e) { G.note('exception', 'assist: ' + String(e && e.message).slice(0, 60), stk(e, 8)); } }
      window.__adv(1000 / 60);
      if (G.frame % drawEvery === 0) {
        G.ops = {};
        try { draw(); G.S.draws++; G.opsLast = G.ops; } catch (e) { G.note('exception', 'draw: ' + String(e && e.message).slice(0, 60) + ' @ ' + fn1(e, 0), `draw() threw on frame ${G.frame}: ${stk(e, 8)}`); }
        const d = ctx.__reset ? ctx.__reset() : 0;
        if (d) G.note('ctx-unbalanced', 'draw', `draw() ended with ${d} save() left open (frame ${G.frame}); the transform and alpha leak into the next frame`, 'warn');
      }
      if (G.frame % 600 === 0) for (const k in G.st) if (typeof G.st[k] === 'number' && G.st[k] > 1e6) delete G.st[k];
    }
    return 'ok';
  };
  // ------- a netcode client: applies the host's snapshot and draws it
  G.client = function (snap) {
    G.frame = snap.t; const sb = snap.summons && snap.summons.find((m) => m.type === 'boss'); if (sb) G.bn = sb.name;
    try { NET.onMessage({ t: 'state', s: snap }); } catch (e) { G.note('exception', 'client onMessage: ' + String(e && e.message).slice(0, 60) + ' @ ' + fn1(e, 0), stk(e, 8)); }
    try { clientFrame(); window.__adv(40); clientFrame(); } catch (e) { G.note('exception', 'clientFrame: ' + String(e && e.message).slice(0, 60) + ' @ ' + fn1(e, 0), `clientFrame() threw: ${stk(e, 8)}`); }
    G.ops = {};
    try { draw(); G.S.clientDraws++; G.opsLast = G.ops; } catch (e) { G.note('exception', 'client draw: ' + String(e && e.message).slice(0, 60) + ' @ ' + fn1(e, 0), `a client's draw() threw on the host's frame ${snap.t}: ${stk(e, 8)}`); }
    const d = ctx.__reset ? ctx.__reset() : 0;
    if (d) G.note('ctx-unbalanced', 'client draw', `a client's draw() ended with ${d} save() left open`, 'warn');
    return summons.length + ':' + projectiles.length;
  };
  G.startClient = function (cfg) {
    SETTINGS.mode = 'boss'; SETTINGS.count = cfg.n; SETTINGS.stocks = cfg.stocks; SETTINGS.itemRate = 0;
    chosen = ROSTER.find((r) => r.name === cfg.names[0] && r.play) || ROSTER.find((r) => r.play);
    NET.role = 'client'; NET.myIdx = 0; NET.ws = { readyState: 1, bufferedAmount: 0, send() {}, close() {} };
    beginMatchNow();
  };
  G.cleanSig = function (boss, names) {
    G.cfg = { kind: 'boss', boss, names, stocks: 3, mode: 'natural' };
    G.start(G.cfg);
    return G.spawnSigs[G.spawnSigs.length - 1];
  };
  G.result = function () {
    G.S.frames = G.frame; G.S.names = G.names; G.S.bossLeft = (() => { const b = G.boss(); return b ? Math.round(b.hp) + '/' + Math.round(b.maxHp) : null; })();
    return JSON.stringify({ F: G.F, S: G.S, sigs: G.spawnSigs });
  };
  return 'harness ready';
}

// ---------------------------------------------------------------------------------------------------------------------------------
//  ONE RUN, in this process: a host game (and a client's), played frame by frame
// ---------------------------------------------------------------------------------------------------------------------------------
class Sink {
  constructor() { this.F = new Map(); this.last = new Map(); }
  // a finding is one kind and key from one function: its first stack and values are kept, the rest counted
  add(realm, sev, kind, key, detail, stack, info) {
    const base = realm + '|' + kind + '|' + key;
    let st = '', caller = this.last.get(base) || '';
    if (stack) {
      st = mapStack(String(stack)).split('\n').slice(1).filter((l) => /index\.html/.test(l)).slice(0, 6).map((l) => l.trim().replace(/^at /, '')).join(' < ');
      caller = (st.split(' < ')[0] || '').replace(/ \(.*/, ''); this.last.set(base, caller);
    }
    const id = base + '|' + caller;
    let f = this.F.get(id);
    if (!f) {
      info = info || {};
      f = { realm, sev, kind, key: caller ? key + ' (in ' + caller + ')' : key, n: 0, frame: info.frame ?? -1, boss: info.boss || '', phase: info.phase || 0, age: info.age ?? -1, detail: String(detail).slice(0, 1200), stack: st };
      this.F.set(id, f);
    }
    f.n++;
    return f;
  }
}

async function runTask(task, progress) {
  const sink = new Sink();
  const nNames = task.names.length, stocks = task.mode !== 'natural' || task.kind === 'rush' ? 9 : 3;
  const [hw, hh] = task.size || SIZES[0];
  const host = bootRealm({ seed: task.seed, art: task.art, w: hw, h: hh, sink, label: 'host' });
  const H = host.win;
  const hostInfo = () => { const g = H.__G; return g ? { frame: g.frame, boss: g.bn, phase: (g.boss() || {})._phase, age: g.bt ? g.frame - g.bt.spawn : -1 } : {}; };
  host.setInfo(hostInfo);
  const streak = {};   // per draw, how many snapshots in a row the host and a same-size client have drawn it differently
  await H.eval('profileReady');
  H.eval('(' + pageHarness.toString() + ')()');
  let client = null, C = null;
  if (NET_EVERY > 0 && (task.kind === 'boss' || task.kind === 'rush')) {   // One's and Steve Cobs's fights cannot be played online (inNetSession refuses them): no client
    // a client's window is never the host's: a wide host seen from a 4:3 window, a small host from a big one
    const [cw, ch] = task.cliSame ? [hw, hh] : hw >= 1600 ? [1024, 768] : hw <= 1024 ? [1600, 900] : [1024, 768];
    client = bootRealm({ seed: task.seed + 7, art: task.art, w: cw, h: ch, sink, label: 'client' }); C = client.win;
    client.setInfo(() => { const g = C.__G; return g ? { frame: g.frame, boss: g.bn } : {}; });
    client.setMute(true);   // the client's own opening frame, before any snapshot, is not the host's picture
    await C.eval('profileReady');
    C.eval('(' + pageHarness.toString() + ')()');
  }
  const out = { task, notes: [], sigs: [] };
  try {
    const cfg = { kind: task.kind, boss: task.boss, names: task.names, stocks, mode: task.mode, rush: task.kind === 'rush', story: !!task.story, trace: !!env.TRACE, items: !!task.items, assists: !!task.assists, watch: env.WATCH || '', watchEvery: Number(env.WATCH_EVERY || 120) };
    H.eval(`__G.start(${JSON.stringify(cfg)})`);
    if (task.dropNet) H.eval(`(function(){ var ss = serializeState; serializeState = function(){ var s = ss.apply(this, arguments); s.summons.forEach(function(m){ delete m[${JSON.stringify(task.dropNet)}]; }); return s; }; })()`);   // (the self-test: a field left out of the snapshot)
    if (C) { C.eval(`__G.startClient(${JSON.stringify({ n: nNames, stocks, names: task.names })})`); client.setMute(false); }
    let stop = null;
    const maxFrames = task.kind === 'rush' ? 13 * (FORCED_END + 900) : String(task.mode).startsWith('moves:') ? 720 : task.mode !== 'natural' ? FORCED_END + 1700 : FRAMES;
    const chunk = C ? NET_EVERY : 30;
    // the ending's own hold on the card and the next boss (BOSS_ENDINGS' holdMs), so a run lasts until the next boss is in and a moment of it has been played
    const endHold = task.kind === 'boss' ? H.eval(`(function(){ var r = BOSS_ROSTER.find(function(b){ return b.name === ${JSON.stringify(task.boss)}; }); var e = r && BOSS_ENDINGS[r.attack]; return e ? (e.holdMs || 0) : 0; })()`) : 0;
    let fellAt = null;
    for (let done = 0; done < maxFrames && !stop; done += chunk) {
      const st = H.eval(`__G.run(${chunk}, ${DRAW_EVERY})`);
      if (C) {
        const snap = H.eval('JSON.stringify(serializeState())');
        C.__snap = snap; client.clock.now = host.clock.now;
        C.eval('__G.client(JSON.parse(window.__snap))');
        if (task.cliSame && st === 'ok') {
          const ho = JSON.parse(H.eval('JSON.stringify(__G.opsLast)')), co = JSON.parse(C.eval('JSON.stringify(__G.opsLast)'));
          for (const name of new Set([...Object.keys(ho), ...Object.keys(co)])) {
            const h = ho[name] || 0, c = co[name] || 0, big = Math.max(h, c), bad = big >= 8 && Math.abs(h - c) > 0.3 * big + 6;
            streak[name] = bad ? (streak[name] || 0) + 1 : 0;
            if (streak[name] === 5) sink.add('client', 'warn', 'net-drawdiff', name, `${name}: the host made ${h} canvas calls for this picture and a client of the same size made ${c}, five snapshots in a row (frame ${H.eval('__G.frame')}, the boss's move ${H.eval('(__G.boss() || {})._telKind')}): a field its drawing needs may not be in the snapshot`, null, hostInfo());
          }
        }
      }
      if (st === 'stopped' || st === 'paused') stop = st;
      const frame = H.eval('__G.frame');
      if (task.kind === 'rush') {
        const sp = JSON.parse(H.eval('JSON.stringify(__G.S.spawns.map(function(s){ return s.frame; }))'));
        if (sp.length >= 13 && frame - sp[12] > 420) stop = 'done';   // the second loop's first boss has been played for 7 s
      } else if (H.eval('__G.fallFrame') != null && fellAt == null) fellAt = frame;
      if (task.kind !== 'rush' && fellAt != null && frame - fellAt > Math.round((1500 + endHold) / 16.7) + 240) stop = 'done';
      if (progress && frame % 150 < chunk) progress({ frame, boss: H.eval('__G.bn') });
    }
    out.stop = stop || 'frames';
  } catch (e) {
    sink.add('harness', 'error', 'harness-error', String(e && e.message).slice(0, 80), `the harness itself threw: ${e && e.stack}`, String(e && e.stack), {});
    out.harnessError = String(e && e.stack);
  }
  const res = JSON.parse(H.eval('__G.result()'));
  const cres = C ? JSON.parse(C.eval('__G.result()')) : { F: {}, S: {} };
  const list = [];
  for (const [realm, r] of [['host', res], ['client', cres]]) for (const k in r.F) { const f = r.F[k]; list.push({ realm, sev: f.sev, kind: f.kind, key: f.key, n: f.n, frame: f.frame, boss: f.boss, phase: f.phase, age: f.age, detail: mapStack(f.detail), stack: '' }); }
  for (const f of sink.F.values()) list.push(f);
  out.findings = list; out.S = res.S; out.cS = cres.S; out.sigs = res.sigs;
  if (env.TRACE && res.S.log) out.log = res.S.log;
  out.pending = H.eval('window.__pending().length');
  try { host.dom.window.close(); if (client) client.dom.window.close(); } catch (e) { /* ignore */ }
  return out;
}

// the clean spawn of every boss, for the Boss Rush run's leak check
async function cleanSigs(bosses) {
  const sink = new Sink(), out = {};
  for (const b of bosses) {   // a game of its own for each: nothing a boss before it left behind
    const r = bootRealm({ seed: 99, art: false, sink, label: 'clean' });
    await r.win.eval('profileReady');
    r.win.eval('(' + pageHarness.toString() + ')()');
    out[b] = JSON.parse(r.win.eval(`JSON.stringify(__G.cleanSig(${JSON.stringify(b)}, ['Firey', 'Rocky']))`));
    r.win.close();
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------------------
//  THE SWEEP: tasks over worker processes, findings merged and printed per boss
// ---------------------------------------------------------------------------------------------------------------------------------
const ROSTER_BOSSES = ['Announcer', 'Puffball Speaker Box', 'Firey Speaker Box', 'The Bug Swarm', 'Purple Face', 'MePhone4', 'Evil Leafy', 'MePhone4S', 'Purple Dragon', 'Two', 'Springy', 'Four'];
const ALL_BOSSES = [...ROSTER_BOSSES, 'One', 'Steve Cobs'];
const movePlan = (boss, j, ph) => {   // MOVES=1: one run for every move of every boss in every phase
  const bi = ALL_BOSSES.indexOf(boss), n = ph === 2 ? 2 : 1, names = [];
  for (let i = 0; i < n; i++) names.push(FIGHTERS[(bi * 3 + j * 2 + ph * 5 + i * 4) % FIGHTERS.length]);
  return { kind: 'boss', boss, names: [...new Set(names)], mode: `moves:${j}:${ph}`, art: (j + ph) % 2 === 0, cliSame: (j + ph) % 3 === 0, size: env.SIZE ? env.SIZE.split('x').map(Number) : SIZES[(bi + j + ph) % SIZES.length], seed: 500 + bi * 31 + j * 7 + ph + Number(env.SEED0 || 0), story: false, k: 0 };
};
const planFor = (boss, k) => {
  const bi = Math.max(0, ALL_BOSSES.indexOf(boss)), p = PLANS.at(bi, k);
  const kind = boss === 'One' ? 'one' : boss === 'Steve Cobs' ? 'cobs' : 'boss';
  const size = env.SIZE ? env.SIZE.split('x').map(Number) : p.size;
  return { kind, boss, names: p.names, mode: p.mode, art: p.art, size, cliSame: k % 2 === 0, items: p.items, assists: p.assists, seed: 100 + k + 17 * bi + Number(env.SEED0 || 0), story: (kind !== 'boss') && p.names.length === 1 && k % 3 === 0, k };
};
const reproLine = (t) => [t.boss || 'Boss Rush', t.names.join(','), t.seed, t.mode, t.art ? 'art' : 'noart', (t.size || SIZES[0]).join('x'), [t.items ? 'items' : '', t.assists ? 'assists' : '', t.cliSame ? 'same' : ''].filter(Boolean).join('+') || '-'].join('|');
const parseRepro = (s) => { const [boss, names, seed, mode, art, size, flags = '-'] = s.split('|'); const kind = boss === 'One' ? 'one' : boss === 'Steve Cobs' ? 'cobs' : boss === 'Boss Rush' ? 'rush' : 'boss'; return { kind, boss: kind === 'rush' ? undefined : boss, names: names.split(','), seed: Number(seed), mode, art: art === 'art', size: size ? size.split('x').map(Number) : SIZES[0], items: /items/.test(flags), assists: /assists/.test(flags), cliSame: /same/.test(flags), story: false }; };

// SELFTEST=1: the hunter's own detectors, each fed a fault it must find (a hunter that finds nothing is only believed if it can find
// something). Prints one line a detector; the exit code is the number that missed.
async function selftest() {
  const sink = new Sink();
  const r = bootRealm({ seed: 5, art: true, sink, label: 'self' });
  const H = r.win;
  r.setInfo(() => ({ frame: H.__G ? H.__G.frame : -1 }));
  await H.eval('profileReady');
  H.eval('(' + pageHarness.toString() + ')()');
  H.eval(`__G.start(${JSON.stringify({ kind: 'boss', boss: 'Two', names: ['Firey', 'Pin'], stocks: 9, mode: 'natural' })})`);
  const run = (n) => H.eval(`__G.run(${n}, 1)`);
  run(120);
  const have = () => ({ page: JSON.parse(H.eval('JSON.stringify(__G.F)')), ctx: [...sink.F.values()] });
  const out = [];
  const expect = (name, test) => { const { page, ctx } = have(); let ok = false; try { ok = !!test(page, ctx); } catch (e) { ok = false; } out.push([name, ok]); };
  const pageHas = (kind, key) => (page) => Object.keys(page).some((k) => k.startsWith(kind + '|') && (!key || k.includes(key)));
  const ctxHas = (kind, key) => (page, ctx) => ctx.some((f) => f.kind === kind && (!key || f.key.includes(key)));
  // the canvas
  H.eval(`(function(){ var c = document.createElement('canvas').getContext('2d');
    c.arc(1, 1, -3, 0, 7); c.arc(NaN, 1, 3, 0, 7); c.ellipse(1, 1, -2, 3, 0, 0, 7); c.arcTo(0, 0, 5, 5, -1); c.createRadialGradient(0, 0, -1, 0, 0, 5); c.createLinearGradient(0, 0, NaN, 1);
    var g = c.createLinearGradient(0, 0, 1, 1); g.addColorStop(2, '#fff'); g.addColorStop(0, 'rgba(NaN,0,0,1)');
    c.fillStyle = 'NaN'; c.globalAlpha = 2; c.fillRect(0, 0, 5, undefined); c.drawImage(undefined, 0, 0); c.fillText('NaN%', 1, 1); c.restore();
    var im = new Image(); im.src = 'assets/sprites/does-not-exist.png'; c.drawImage(im, 0, 0, 5, 5);
    var z = document.createElement('canvas'); z.width = 0; z.height = 0; c.drawImage(z, 0, 0); })()`);
  expect('canvas: negative arc radius', ctxHas('ctx-throws', 'arc negative'));
  expect('canvas: non-finite arc coordinate', ctxHas('ctx-nonfinite', 'arc arg0'));
  expect('canvas: negative ellipse / arcTo radius', (p, c) => ctxHas('ctx-throws', 'ellipse negative')(p, c) && ctxHas('ctx-throws', 'arcTo negative')(p, c));
  expect('canvas: radial gradient with a negative radius', ctxHas('ctx-throws', 'radialGradient negative'));
  expect('canvas: gradient with a NaN coordinate', ctxHas('ctx-throws', 'createLinearGradient arg2'));
  expect('canvas: colour stop off 0..1, and a colour built from NaN', (p, c) => ctxHas('ctx-throws', 'addColorStop offset')(p, c) && ctxHas('ctx-throws', 'addColorStop colour')(p, c));
  expect('canvas: a colour, an alpha and an undefined size the browser ignores', (p, c) => ctxHas('ctx-ignored', 'fillStyle')(p, c) && ctxHas('ctx-ignored', 'globalAlpha')(p, c) && ctxHas('ctx-nonfinite', 'fillRect arg3')(p, c));
  expect('canvas: drawImage of nothing, a missing file, a zero-size canvas', (p, c) => ctxHas('ctx-throws', 'drawImage source')(p, c) && ctxHas('ctx-throws', 'broken image')(p, c) && ctxHas('ctx-throws', 'zero-size')(p, c) && ctxHas('asset-missing')(p, c));
  expect('canvas: text that reads NaN, restore with nothing saved', (p, c) => ctxHas('ctx-text')(p, c) && ctxHas('ctx-restore')(p, c));
  // exceptions and the page's own swallowed errors
  H.eval(`var _db = drawBossBar; drawBossBar = function(){ throw new Error('selftest draw'); }; __G.run(2, 1); drawBossBar = _db;`);
  H.eval(`var _ub = updateBossAttack; updateBossAttack = function(){ throw new Error('selftest step'); }; __G.run(2, 1); updateBossAttack = _ub;`);
  expect('a draw() that throws', pageHas('exception', 'draw: selftest draw'));
  expect('a step() that throws', pageHas('exception', 'step: selftest step'));
  H.eval(`var _ct = clutchTick; clutchTick = function(){ throw new Error('selftest swallowed'); }; __G.run(70, 99); clutchTick = _ct;`);
  expect('a catch(e){} that swallowed a real error', ctxHas('swallowed', 'selftest swallowed'));
  // numbers
  H.eval(`var b = __G.boss(); b.x = NaN; fighters[0].vy = Infinity; projectiles.push({ x: NaN, y: 3, vx: 0, vy: 0, r: 4, dmg: 1, life: 99, owner: -2, ownerObj: { team: -1, idx: -2 } }); __G.post(); b.x = 500; fighters[0].vy = 0; projectiles = [];`);
  expect('NaN in the boss, Infinity in a fighter, NaN in a shot', (p) => pageHas('nonfinite', 'boss Two.x')(p) && pageHas('nonfinite', 'fighter Firey.vy')(p) && pageHas('nonfinite', 'shot')(p));
  // the boss's turn
  H.eval(`__G.boss()._atkTimer = 1e6; __G.run(640, 3);`);
  expect('a turn held at 1e6 for 10 s', pageHas('turn-held'));
  H.eval(`var b2 = __G.boss(); b2._atkTimer = 99999; __G.bt.lastTurn = __G.frame - 400; b2._tel = 0; __G.run(520, 3);`);
  expect('no new attack for 15 s', pageHas('no-attack'));
  H.eval(`var b3 = __G.boss(); __G.bt.off = 0; for (var i = 0; i < 320; i++){ b3.x = -5000; b3.y = 300; __G.post(); __G.frame++; } b3.x = 500;`);
  expect('a boss off the screen for 5 s', pageHas('boss-offscreen'));
  // a fighter held
  H.eval(`var q = fighters[0]; for (var i = 0; i < 320; i++){ q.frozen = 500; q._swallow = 500; __G.post(); __G.frame++; } q.frozen = 0; q._swallow = 0;`);
  expect('a fighter frozen for 5 s', pageHas('fighter-stuck', 'frozen'));
  expect('a fighter swallowed for 5 s', pageHas('fighter-stuck', '_swallow'));
  // shots
  H.eval(`projectiles.push({ x: 5, y: -4000, vx: 0, vy: 0, r: 4, dmg: 1, life: 99999, owner: -2, ownerObj: { team: -1, idx: -2 }, shape: 'selftestshot' }); for (var i = 0; i < 1820; i++){ __G.post(); __G.frame++; } projectiles = [];`);
  expect('a shot alive for 30 s', pageHas('shot-lives-30s', 'selftestshot'));
  H.eval(`for (var i = 0; i < 320; i++) projectiles.push({ x: 5, y: -4000, vx: 0, vy: 0, r: 4, dmg: 1, life: 50, owner: -2, ownerObj: { team: -1, idx: -2 }, shape: 'selftestmany' }); __G.post(); projectiles = [];`);
  expect('more than 300 shots at once', pageHas('too-many-shots', 'selftestmany'));
  // a hit with no tell, a stunlock, a hit after the fall
  H.eval(`var f0 = fighters[0]; f0.invuln = 0; f0.hitstun = 0; f0.x = 300; f0.y = groundY() - 24; __G.tel.on = false; __G.tel.end = __G.frame - 200;
    var id = ++BOSS_ATK_ID; addProj({ owner: -2, ownerObj: { team: -1, idx: -2 }, x: f0.x, y: f0.y, vx: 0, vy: 0, r: 40, dmg: 9, kb: 3, life: 30, bossAtk: id, shape: 'selftestnotell', color: '#f00' }); __G.run(1, 99);`);
  expect('a boss hit with no wind-up and no mark, 12 frames after its source appeared', pageHas('notell', 'selftestnotell'));
  H.eval(`var f1 = fighters[0]; for (var i = 0; i < 4; i++){ f1.invuln = 0; f1.hitstun = 20; __G.post(); __G.frame++; f1.invuln = 3; applyHit(f1, 5, 1, -1, null, { bossAtk: ++BOSS_ATK_ID }); }`);
  expect('three boss hits in a row on a fighter who could not act', pageHas('stunlock'));
  expect('a boss hit that lands on a fighter in hit grace', pageHas('grace-hit'));
  H.eval(`__G.fallFrame = __G.frame; fighters[0].invuln = 0; fighters[0].hitstun = 0; applyHit(fighters[0], 5, 1, -1, null, { bossAtk: ++BOSS_ATK_ID }); __G.fallFrame = null;`);
  expect('a boss hit after the boss has fallen', pageHas('post-fall-hit'));
  H.eval(`puff(1, 1, undefined, 3); puff(NaN, 1, '#fff', 3);`);
  expect('a burst with no colour or no position', pageHas('puff'));
  if (env.SELFTEST_DEBUG) { const h = have(); console.log(Object.keys(h.page).join('\n')); console.log(h.ctx.map((f) => f.kind + '|' + f.key).join('\n')); }
  // a field a client draws but is never sent: Four's arena state (_hz) taken out of the snapshot; a same-size client must draw him differently
  { const res = await runTask({ kind: 'boss', boss: 'Four', names: ['Firey'], seed: 100, mode: 'moves:2:3', art: false, size: [1280, 720], cliSame: true, dropNet: '_hz' }, null);
    out.push(["a field a client draws but is never sent (Four without his _hz): the picture differs from the host's", res.findings.some((f) => f.kind === 'net-drawdiff')]); }
  const missed = out.filter((o) => !o[1]).length;
  for (const [name, ok] of out) console.log(`  ${ok ? 'found ' : 'MISSED'}  ${name}`);
  console.log(`boss-glitch selftest: ${out.length - missed} of ${out.length} detectors found their fault`);
  r.win.close();
  process.exit(missed ? 1 : 0);
}

if (env.GLITCH_WORKER) {
  process.on('message', async (msg) => {
    if (msg === 'done') process.exit(0);
    try {
      const r = await runTask(msg.task, (p) => process.send({ progress: p }));
      process.send({ result: r });
    } catch (e) { process.send({ result: { task: msg.task, findings: [{ realm: 'worker', sev: 'error', kind: 'harness', key: 'task crashed', n: 1, frame: -1, boss: msg.task.boss || '', phase: 0, age: -1, detail: String(e && e.stack), stack: '' }], S: {}, cS: {}, sigs: [] } }); }
  });
} else if (env.SELFTEST) {
  await selftest();
} else {
  const t0 = Date.now();
  if (env.ALL_FIGHTERS !== '0' && !env.REPRO) {
    const probe = bootRealm({ seed: 1, art: false, sink: new Sink(), label: 'probe' });
    await probe.win.eval('profileReady');
    const names = JSON.parse(probe.win.eval('JSON.stringify(ROSTER.filter(function(r){ return r.play; }).map(function(r){ return r.name; }))'));
    probe.win.close();
    if (names.length > 15) FIGHTERS = names;
  }
  const bossList = env.BOSSES ? JSON.parse(env.BOSSES) : ALL_BOSSES;
  const rush = env.RUSH === 'only' ? 'only' : (env.RUSH === '0' ? 'no' : (env.BOSSES ? 'no' : 'yes'));
  let tasks = [];
  if (env.REPRO) { const t = parseRepro(env.REPRO); tasks = [t]; if (t.kind === 'rush') { t.k = 0; } }
  else {
    if (env.MOVES) {   // every move of every Boss Rush boss, in each of its three phases
      const probe = bootRealm({ seed: 1, art: false, sink: new Sink(), label: 'probe' });
      await probe.win.eval('profileReady');
      const counts = JSON.parse(probe.win.eval('JSON.stringify(BOSS_ROSTER.map(function(b){ return [b.name, 1 + (BOSS_EXTRA[b.name] || []).length]; }))'));
      probe.win.close();
      for (const [b, n] of counts) if (bossList.includes(b)) for (let j = 0; j < n; j++) for (let ph = 1; ph <= 3; ph++) tasks.push(movePlan(b, j, ph));
    } else if (rush !== 'only') for (const b of bossList) for (let k = 0; k < RUNS; k++) tasks.push(planFor(b, k));
    if (rush !== 'no' && !env.MOVES) tasks.unshift({ kind: 'rush', names: ['Firey', 'Rocky'], mode: 'forced', art: true, seed: 7, k: 0, cliSame: true });
  }
  const jobs = Math.max(1, Math.min(tasks.length, Number(env.JOBS || Math.max(2, Math.min(5, availableParallelism() - 4)))));
  console.log(`boss-glitch: ${tasks.length} runs on ${jobs} workers (FRAMES ${FRAMES}, draw every ${DRAW_EVERY}, client every ${NET_EVERY || 'never'}; script line offset ${SCRIPT_LINE0})`);
  const results = new Array(tasks.length);
  let next = 0, finished = 0;
  const work = (i) => new Promise((resolve) => {
    const child = fork(fileURLToPath(import.meta.url), [], { env: Object.assign({}, env, { GLITCH_WORKER: '1' }), execArgv: ['--max-old-space-size=3072'] });
    let mine = -1, last = Date.now(), watchdog = null, restarts = 0;
    const feed = () => { if (next < tasks.length) { mine = next++; last = Date.now(); child.send({ task: tasks[mine] }); } else { clearInterval(watchdog); child.send('done'); resolve(); } };
    child.on('message', (m) => {
      if (m.progress) { last = Date.now(); tasks[mine].lastProgress = m.progress; return; }
      results[mine] = m.result; finished++;
      const f = m.result.findings || [], bad = f.filter((x) => x.sev === 'error').length;
      console.log(`  [${finished}/${tasks.length}] ${reproLine(tasks[mine])}: ${m.result.S && m.result.S.frames} frames, ${f.length} findings (${bad} errors), boss falls ${m.result.S && m.result.S.falls}, ${m.result.stop}  (${Math.round((Date.now() - t0) / 1000)} s)`);
      feed();
    });
    child.on('exit', (code) => { if (code !== 0 && code !== null && mine >= 0 && !results[mine]) { results[mine] = { task: tasks[mine], findings: [{ realm: 'worker', sev: 'error', kind: 'crash', key: 'worker died', n: 1, frame: (tasks[mine].lastProgress || {}).frame ?? -1, boss: tasks[mine].boss || '', phase: 0, age: -1, detail: 'the worker process exited with code ' + code + ' (out of memory, or a hang killed it)', stack: '' }], S: {}, cS: {}, sigs: [] }; finished++; resolve(); } });
    watchdog = setInterval(() => { if (Date.now() - last > 240000 && mine >= 0 && !results[mine]) { results[mine] = { task: tasks[mine], findings: [{ realm: 'worker', sev: 'error', kind: 'hang', key: 'no progress for 240 s', n: 1, frame: (tasks[mine].lastProgress || {}).frame ?? -1, boss: tasks[mine].boss || '', phase: 0, age: -1, detail: `a run made no progress for 240 s (last: ${JSON.stringify(tasks[mine].lastProgress)}): the game is in a loop it cannot leave`, stack: '' }], S: {}, cS: {}, sigs: [] }; finished++; child.kill('SIGKILL'); clearInterval(watchdog); resolve(); } }, 10000);
    feed();
  });
  // worker slots refill themselves if one is killed by the watchdog
  const slots = Array.from({ length: jobs }, async () => { while (next < tasks.length) await work(); });
  await Promise.all(slots);

  // the Boss Rush run's leak check against a clean spawn of each boss
  const rushRes = results.find((r) => r && r.task && r.task.kind === 'rush');
  if (rushRes && rushRes.sigs && rushRes.sigs.length) {
    const clean = await cleanSigs(ROSTER_BOSSES);
    for (const sg of rushRes.sigs) {
      const c = clean[sg.boss]; if (!c) continue;
      for (const k of ['arena', 'stage', 'WW', 'WH', 'floors', 'projectiles', 'hostile', 'assists', 'bosses', 'beams', 'tendrils', 'items', 'evil', 'dust', 'debris', 'scars', 'oneFx', 'cobsFx', 'hz']) {
        if (JSON.stringify(sg[k]) !== JSON.stringify(c[k])) rushRes.findings.push({ realm: 'host', sev: ['dust', 'debris', 'scars'].includes(k) ? 'warn' : 'error', kind: 'leak', key: `${sg.boss} spawns differently in the run: ${k}`, n: 1, frame: -1, boss: sg.boss, phase: 1, age: 0, detail: `${sg.boss}: ${k} is ${JSON.stringify(sg[k])} when it spawns in the Boss Rush, ${JSON.stringify(c[k])} on a clean start`, stack: '' });
      }
      if (sg.plats.join('|') !== c.plats.join('|')) {
        const extra = sg.plats.filter((p) => !c.plats.includes(p)), missing = c.plats.filter((p) => !sg.plats.includes(p));
        rushRes.findings.push({ realm: 'host', sev: 'error', kind: 'leak', key: `${sg.boss} spawns with other platforms in the run`, n: 1, frame: -1, boss: sg.boss, phase: 1, age: 0, detail: `${sg.boss}'s arena has platforms the clean start does not (${extra.length}: ${extra.slice(0, 4).join(' | ')}) or lacks some (${missing.length}: ${missing.slice(0, 4).join(' | ')})`, stack: '' });
      }
    }
  }

  // ---- the report
  const byBoss = new Map();
  for (const r of results) {
    if (!r) continue;
    const label = r.task.kind === 'rush' ? 'BOSS RUSH (all twelve)' : r.task.boss;
    const B = byBoss.get(label) || { runs: [], F: new Map(), stats: { frames: 0, falls: 0, runs: 0, maxShots: 0, hits: {}, turns: 0, phases: {}, dyn: {} } };
    byBoss.set(label, B); B.runs.push(r);
    B.stats.runs++; B.stats.frames += (r.S && r.S.frames) || 0; B.stats.falls += (r.S && r.S.falls) || 0; B.stats.maxShots = Math.max(B.stats.maxShots, (r.S && r.S.maxShots) || 0); B.stats.turns += (r.S && r.S.turns) || 0;
    for (const [k, v] of Object.entries((r.S && r.S.phases) || {})) B.stats.phases[k] = (B.stats.phases[k] || 0) + v;
    for (const [k, v] of Object.entries((r.S && r.S.dyn) || {})) B.stats.dyn[k] = (B.stats.dyn[k] || 0) + v;
    for (const [k, v] of Object.entries((r.S && r.S.hits) || {})) { const h = B.stats.hits[k] || (B.stats.hits[k] = { n: 0, dmg: 0, minAge: 1e9, noTell: 0, cat: v.cat }); h.n += v.n; h.dmg += v.dmg; h.minAge = Math.min(h.minAge, v.minAge); h.noTell += v.noTell; }
    for (const f of r.findings || []) {
      const id = f.realm + '|' + f.kind + '|' + f.key;
      let g = B.F.get(id);
      if (!g) { g = Object.assign({}, f, { n: 0, runs: 0, repro: reproLine(r.task), at: `frame ${f.frame}, ${f.boss || '-'} phase ${f.phase}, age ${f.age}` }); B.F.set(id, g); }
      g.n += f.n; g.runs++;
    }
  }
  const order = { error: 0, warn: 1, info: 2 };
  const lines = [];
  for (const [label, B] of byBoss) {
    const fs = [...B.F.values()].filter((f) => VERBOSE || f.sev !== 'info').sort((a, b) => (order[a.sev] - order[b.sev]) || (b.n - a.n));
    lines.push(`\n=== ${label}: ${B.stats.runs} runs, ${B.stats.frames} frames, ${B.stats.falls} falls, ${B.stats.turns} turns, most shots at once ${B.stats.maxShots}; ${fs.filter((f) => f.sev === 'error').length} errors, ${fs.filter((f) => f.sev === 'warn').length} warnings ===`);
    for (const f of fs) {
      lines.push(`  [${f.sev}] ${f.realm === 'client' ? '(client) ' : ''}${f.kind}: ${f.key}   x${f.n} in ${f.runs} run${f.runs > 1 ? 's' : ''}`);
      lines.push(`      repro: ${f.repro}  | first at ${f.at}`);
      lines.push(`      ${f.detail.replace(/\s+/g, ' ').slice(0, 700)}`);
      if (f.stack) lines.push(`      stack: ${f.stack}`);
    }
    if (VERBOSE) {
      const hs = Object.entries(B.stats.hits).sort((a, b) => b[1].dmg - a[1].dmg).slice(0, 14);
      lines.push('  boss hit sources (hits, damage, youngest source, no-tell candidates): ' + hs.map(([k, h]) => `${k} ${h.n}/${Math.round(h.dmg)}%/age ${h.minAge}/nt ${h.noTell}`).join('; '));
      lines.push('  extra fighter fields seen: ' + Object.keys(B.stats.dyn).join(', '));
    }
  }
  console.log(lines.join('\n'));
  if (env.TRACE) for (const r of results) if (r && r.log) console.log('hit log (frame, victim, source, damage, source age, since wind-up, victim hitstun/frozen/swallow/invuln, x, y, attack id):\n' + r.log.map((l) => l.join(' ')).join('\n'));
  if (env.OUT) writeFileSync(env.OUT, JSON.stringify({ when: new Date().toISOString(), tasks: tasks.map(reproLine), results: results.map((r) => r && { task: r.task, stop: r.stop, S: r.S, cS: r.cS, findings: r.findings }) }, null, 1));
  console.log(`\nboss-glitch: done in ${Math.round((Date.now() - t0) / 1000)} s`);
}
