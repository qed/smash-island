// The wiki's HITBOX PICTURES, recorded from the RUNNING game (dev only: needs jsdom, a devDependency).
//
//   node scripts/dump-hitboxes.mjs                  -> writes artifacts/V1/fighters/hitbox/<fighter>-<move>.svg + scripts/wiki-hitboxes.json
//   node scripts/dump-hitboxes.mjs --only Firey,Bow  (a few fighters; the index keeps the others' entries)
//   node scripts/dump-hitboxes.mjs --raw out.json    (also write every recorded frame's boxes, for pictures made elsewhere)
//
// The owner (2026-11-19): "frame data is pictures of hitboxes, frame by frame". So every move on a public fighter's page gets a strip:
// one small panel per frame, from the frame the button is pressed (frame 0) to the last frame of end lag, showing the fighter's own
// hurtbox and every hit area live on that frame. NOTHING IS DRAWN FROM GUESSES: each move is run in the real game loop, the same way the
// frame-data measurement does it (a fresh match on the flat stage, the foe a still dummy far off, so this is the move on a MISS), and on each frame the script reads back what the game itself tested that frame:
//   - HIT_ART, the game's record of every hit area it tests (hitShape, hitCircle, mvStrike, gbTick, the smash patterns, the up-specials,
//     the wind-ups' hits): a live record stamped with this frame. Style 'grab' is a grab box, 'pull' a pull's reach (it drags, it does not hit).
//   - a hit made with the fighter's own BODY (a dash, a ram), which HIT_ART does not draw because the fighter is already drawn: every
//     shapeHits(bodyShape) test of theirs, drawn as the outline grown by the test's margin (see __BODY below for the dummy this needs).
//   - every shot and trap of theirs that can hit this frame (haShotState 1 or 2: the same rule as the hitbox view), a disc of pr.r.
//   - a beam put out this frame (the line to the edge of the stage, its band either side).
//   - the fighter's hurtbox (the traced outline the game hits, mirrored as it faces), and whether they are invincible (invuln), armoured
//     (armor) or countering / reflecting on that frame.
// The game file is not changed: it is booted in jsdom and read. Phases come from the boxes recorded: startup = frames before the first
// box, active = first to last box frame, end lag = after the last box to the frame before they can act again (the measurement's own
// "free" test). A long move shows every frame of startup and active and every few frames of end lag; the page says which.
//
// Public fighters only (a ROSTER row with play:true, not event, not prize), as the pages. The index names the game build it came from;
// gen-seo-pages re-runs this when the game has changed.

import os from 'node:os'; try { os.setPriority(0, os.constants.priority.PRIORITY_BELOW_NORMAL); } catch (e) {}
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderStrip, RENDER_VERSION } from './hitbox-svg.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT);
const { loadMonolith } = await import('./helpers/load-monolith.js');
const { SETUP_SRC } = await import('./helpers/match-setup.js');

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const ONLY = opt('--only') ? new Set(opt('--only').split(',')) : null;
const RAW = opt('--raw');
const OUTDIR = join(ROOT, 'artifacts', 'V1', 'fighters', 'hitbox');
const INDEX = join(ROOT, 'scripts', 'wiki-hitboxes.json');
const sha = createHash('sha256').update(readFileSync(join(ROOT, 'artifacts', 'V1', 'index.html'), 'utf8').replace(/\r\n?/g, '\n')).digest('hex');

const { window: w } = loadMonolith(0xC0FFEE);
w.__errs = []; w.addEventListener('error', (e) => w.__errs.push(String(e.message || e)));
w.eval(SETUP_SRC);
// The trial: measure2's (scratch fd2) reset and fire, verbatim in what they do to the match; the recording is new.
w.eval(`
window.__start = function(name){ __setupCustomMatch([name, 'Pen'], 99, 2, 0); fighters.forEach(function(f){ f.controller = 'still'; f.invuln = 0; }); for(let i = 0; i < 30; i++) step(); };
window.__busy = function(f){ return endLagBusy(f); };
window.__free = function(f){ return !__busy(f) && !(f._lag > 0) && !(f.atkCd > 0) && !f._mv && !(f.hitstun > 0) && !(f.rooted > 0) && !f._gb && !(f._eLag && !f._eLag.on); };
window.__reset = function(air, vuln){
  FS.freeze = 0; FS.slow = 0; FS.fz = -1; FS.by = null; particles = []; projectiles = []; beams = []; HIT_ART.length = 0; items = []; summons = []; FINX.length = 0; itemTimer = 1e9; if(typeof SMASHBALL !== 'undefined') SMASHBALL = null;
  const f = fighters[0], d = fighters[1], gy = groundY();
  for(const q of [f, d]){ q.vx = 0; q.vy = 0; q.hitstun = 0; q._stunFx = 0; q.invuln = 0; q.pct = 0; q.frozen = 0; q.rooted = 0; q._windup = null; q._mv = null; q._gb = null; q._hold = null; q._heldBy = null;
    q.atkCd = 0; q.spCd = 0; q.smCd = 0; q.fnCd = 0; q._sp = false; q._usedAirSpecial = false; q.smashHold = 0; q._smQ = null; q._smBuf = false; q._fxLock = 0; q._fxBy = null; q._stall = null; q._dashing = 0;
    q._fs = null; q.ctrlRev = 0; q._infected = 0; q.fsGlow = 0; q.fsC = 0; q.fsId = ''; q.countering = 0; q.reflecting = 0; q.armor = 0; q._lag = 0; q._eLag = null; q.burn = 0; q.bleed = 0; q.slowed = 0; q.dead = false; q.stocks = 99; q._gotcha = null; q._tp = null; q.flying = 0; q._sawing = 0; q.jumps = 2; q._roll = null; q._plunge = null; q._nail = null; q._zsOn = 0; q._confirm = 0; q._empower = 0; }
  f.x = WW*0.4; f.y = gy - f.r; f.onground = true; f.face = 1;
  if(air){ f.y -= 330; f.onground = false; f.vy = JUMP; f.jumps = 1; }
  d.x = WW*0.92; d.y = gy - d.r; d.onground = true; d.face = -1; d.invuln = vuln ? 0 : 99999;   // (the miss: the foe far off, and untouchable unless vuln)
  window.__dumHit = false;
};
// A hit made by touching with the BODY (a dash, a nail run, a grown body) is tested by shapeHits(bodyShape) inside the loop over foes,
// after the loop has skipped an untouchable foe -- so on a miss against an untouchable dummy it is never tested and never seen. The
// recording is therefore made against a dummy that is far off but NOT untouchable, and every body test fighter 0 makes is noted here
// (the shape the game tests, with its margin). If that dummy is reached at all (hit, rooted, frozen, held...), the move is recorded
// again against the untouchable dummy instead, and the move notes it.
window.__BODY = [];
(function(){ const _sh = shapeHits; shapeHits = function(sh, t){ if(sh && sh.kind === 'body' && sh.f === fighters[0]) __BODY.push(['h', 'p', bodyPts(sh.f).map(Math.round), sh.margin || 0]); return _sh.apply(this, arguments); };
  const _ah = applyHit; applyHit = function(t, dmg, kbx, kby, from){ if(t === fighters[1] && from && from.idx === 0) window.__dumHit = true; return _ah.apply(this, arguments); }; })();
window.__reached = function(){ const d = fighters[1]; return __dumHit || d.rooted > 0 || d.frozen > 0 || d.ctrlRev > 0 || d._infected > 0 || d._heldBy === 0 || d.pct > 0 || d.hitstun > 0; };
window.__AER = { nair:'na', fair:'fa', bair:'ba', uair:'ua', dair:'da' };
window.__fire = function(slot){ const f = fighters[0], ms = msOf(f);
  if(slot === 'jab' || (slot === 'nair' && !(ms && ms.na))){ f._confirm = 0; doAttack(f); f.atkCd = f._confirm ? JAB_HIT_CD : 22; }
  else if(slot === 'utilt'){ if(ms && ms.ut) mvStart(f, ms.ut, 'ut'); else { f._confirm = 0; doUpTilt(f); f.atkCd = f._confirm ? JAB_HIT_CD : 24; } }
  else if(slot === 'dtilt'){ if(ms && ms.dt) mvStart(f, ms.dt, 'dt'); else { f._confirm = 0; doGroundMove(f); f.atkCd = f._confirm ? GROUND_HIT_CD : 26; } }
  else if(__AER[slot]){ const k = __AER[slot]; if(!ms || !ms[k]) return false; mvStart(f, ms[k], k); }
  else if(slot === 'grab'){ if(!mvGrabStart(f)) return false; }
  else if(slot === 'neutral') fireSpecial(f, {});
  else if(slot === 'up') fireSpecial(f, { up: true });
  else if(slot === 'down') fireSpecial(f, { down: true });
  else if(slot === 'smash') fireSmash(f, {}, 0, false);
  else if(slot === 'usmash') fireSmash(f, {}, 1, true);
  else if(slot === 'dsmash') fireSmash(f, {}, -1, true);
  else if(slot === 'finisher') doAttackSpecial(f);
  else return false;
  return true;
};
const R = Math.round;
// one hit shape (world coordinates, as the game tested it) -> a drawing primitive
//   ['c', x, y, r]  a disc     ['l', x1, y1, x2, y2, halfWidth, cap]  a band (cap 1 = round: a capsule; 0 = a beam's square ends)
//   ['p', [x, y, ...], pad]  a polygon grown by pad px (a fan's limb thickness, a body hit's margin)     ['r', x, y, w, h]  a box
window.__prim = function(sh){
  if(!sh) return null;
  if(sh.kind === 'circle') return ['c', R(sh.x), R(sh.y), R(sh.r)];
  if(sh.kind === 'capsule') return ['l', R(sh.x1), R(sh.y1), R(sh.x2), R(sh.y2), R(sh.r), 1];
  if(sh.kind === 'box') return ['r', R(sh.x), R(sh.y), R(sh.w), R(sh.h)];
  if(sh.kind === 'poly') return ['p', sh.pts.map(R), 0];
  if(sh.kind === 'fan'){ const m = sh.face || 1, pts = [], N = 12;
    for(let j = 0; j <= N; j++){ const a = sh.a0 + (sh.a1 - sh.a0)*j/N; pts.push(R(sh.cx + Math.cos(a)*sh.r1*m), R(sh.cy + Math.sin(a)*sh.r1)); }
    if(sh.r0 > 0.5) for(let j = N; j >= 0; j--){ const a = sh.a0 + (sh.a1 - sh.a0)*j/N; pts.push(R(sh.cx + Math.cos(a)*sh.r0*m), R(sh.cy + Math.sin(a)*sh.r0)); }
    else pts.push(R(sh.cx), R(sh.cy));
    return ['p', pts, HIT_FAN_PAD]; }
  if(sh.kind === 'cut'){   // a disc cut by straight limits: a 48-gon clipped to the box x0..x1, y0..y1 (Sutherland-Hodgman)
    let P = []; for(let j = 0; j < 48; j++){ const a = j/48*Math.PI*2; P.push([sh.x + Math.cos(a)*sh.r, sh.y + Math.sin(a)*sh.r]); }
    const clip = function(P, inside, cross){ const out = []; for(let i = 0; i < P.length; i++){ const a = P[i], b = P[(i + 1) % P.length], ia = inside(a), ib = inside(b);
      if(ia) out.push(a); if(ia !== ib) out.push(cross(a, b)); } return out; };
    const lim = [['x', sh.x0, 1], ['x', sh.x1, -1], ['y', sh.y0, 1], ['y', sh.y1, -1]];
    for(const [ax, v, s] of lim){ if(v == null || !isFinite(v)) continue; const k = ax === 'x' ? 0 : 1;
      P = clip(P, function(p){ return (p[k] - v)*s >= 0; }, function(a, b){ const t = (v - a[k])/(b[k] - a[k]); return [a[0] + (b[0] - a[0])*t, a[1] + (b[1] - a[1])*t]; }); if(!P.length) break; }
    return P.length ? ['p', [].concat.apply([], P).map(R), 0] : null; }
  return null;
};
window.__hurt = function(f){   // the hurtbox: ['p', pts] the traced outline in world space, or ['e', cx, cy, rx, ry]
  if(f.hurt && f.hurt.poly){ const p = f.hurt.poly, m = hurtMirror(f), out = []; for(let i = 0; i < p.length; i += 2) out.push(R(f.x + p[i]*m), R(f.y + p[i+1])); return ['p', out]; }
  return ['e', R(f.x), R(hurtCY(f)), R(hurtRX(f)), R(hurtRY(f))];
};
window.__record = function(slot, air, vuln){
  __reset(air, vuln); const f = fighters[0]; __BODY.length = 0;
  SHOW_HITBOXES = true; DEBUG_HITS.length = 0;
  let seenT = new Map(), seenB = new Set(beams);
  const frames = [];
  const grab = function(){
    const boxes = [];
    for(const e of HIT_ART){ if(e.o !== 0 || e.m !== 'l') continue; if(seenT.get(e) === e.t) continue;
      const pr = __prim(e.sh); if(!pr) continue; pr.unshift(e.s === 'grab' ? 'g' : e.s === 'pull' ? 'u' : 'h'); boxes.push(pr); }
    const bk = new Set();
    for(const b of __BODY){ const key = JSON.stringify(b); if(bk.has(key)) continue; bk.add(key); boxes.push(b); }
    __BODY.length = 0;
    /* (the Cherries' oil carries its pourer in _cherryOil, not owner) */
    for(const pr of projectiles){ if(pr.owner !== 0 && pr._cherryOil !== 0) continue; const st = haShotState(pr); if(st === 1 || st === 2) boxes.push([st === 2 ? 't' : 's', 'c', R(pr.x), R(pr.y), R(pr.r)]); }
    for(const b of beams){ if(seenB.has(b) || b.owner !== 0) continue; boxes.push(['h', 'l', R(b.x0), R(b.y), R(b.x1), R(b.y), R(b.w || 18), 0]); }
    seenT = new Map(HIT_ART.map(function(e){ return [e, e.t]; })); seenB = new Set(beams); DEBUG_HITS.length = 0;
    const st = (f.invuln > 0 ? 'i' : '') + (f.armor > 0 ? 'a' : '') + ((f.countering > 0 || f.reflecting > 0) ? 'c' : '');
    frames.push({ x:R(f.x), y:R(f.y), hb:__hurt(f), st:st, bx:boxes });
  };
  if(__fire(slot) === false) return { na:true };
  grab();
  if(vuln && __reached()) return { reached:true };
  let freeAt = null, firstBox = frames[0].bx.length ? 0 : null, lastBox = firstBox, fell = false;
  for(let fr = 1; fr <= 400; fr++){
    step(); grab();
    const has = frames[fr].bx.length > 0;
    if(has){ if(firstBox === null) firstBox = fr; lastBox = fr; }
    if(freeAt === null && __free(f)) freeAt = fr;
    if(vuln && __reached()) return { reached:true };
    if(f.dead){ fell = true; break; }
    if(freeAt !== null && firstBox !== null && firstBox < freeAt && fr >= freeAt) break;   // the usual case: done once they can act
    if(freeAt !== null && firstBox !== null && firstBox >= freeAt && (!has || fr - firstBox >= 40)) break;   // a hit that comes after they are free (a trap, a timed shot): shown until it stops
    if(freeAt !== null && firstBox === null && fr >= 360) break;
  }
  SHOW_HITBOXES = false;
  return { frames:frames, freeAt:freeAt, firstBox:firstBox, lastBox:lastBox, fell:fell, gy:R(groundY()), air:!!air };
};
`);
const J = (js) => JSON.parse(w.eval(`JSON.stringify((function(){ ${js} })())`));

const AIRS = new Set(['nair', 'fair', 'bair', 'uair', 'dair']);
const SLOTS = new Set(['jab', 'utilt', 'dtilt', 'nair', 'fair', 'bair', 'uair', 'dair', 'grab', 'neutral', 'up', 'down', 'smash', 'usmash', 'dsmash', 'finisher']);
const roster = J(`return ROSTER.filter(function(r){ return r.play && !r.event && !r.prize && MOVE_TEXT[r.name] && r.kit; }).map(function(r){
  return { name:r.name, kit:r.kit.special, rows:moveRowsFor(r).map(function(x){ return [x[0], MV_SLOT[x[0]] || null, x[1]]; }) }; })`);
const slug = (s) => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

let index = { moves: {} };
if (ONLY && existsSync(INDEX)) { try { index = JSON.parse(readFileSync(INDEX, 'utf8')); } catch (e) {} }
mkdirSync(OUTDIR, { recursive: true });
const raw = {};
const t0 = Date.now();
let nMoves = 0, bytes = 0;
for (const r of roster) {
  if (ONLY && !ONLY.has(r.name)) continue;
  for (const [key, slot, text] of r.rows) {
    if (!slot || !SLOTS.has(slot)) continue;
    if (/^The neutral (attack|special), aimed that way/.test(text)) continue;
    const id = r.name + '|' + key, file = slug(r.name) + '-' + slot + '.svg';
    let rec;
    try {
      w.eval(`__start(${JSON.stringify(r.name)})`);
      rec = J(`return __record(${JSON.stringify(slot)}, ${AIRS.has(slot)}, true)`);
      if (rec.reached) { w.eval(`__start(${JSON.stringify(r.name)})`); rec = J(`return __record(${JSON.stringify(slot)}, ${AIRS.has(slot)}, false)`); rec.untouchable = true; }
    } catch (e) { index.moves[id] = { err: String(e.message).slice(0, 120) }; continue; }
    if (rec.na) { index.moves[id] = { na: true }; continue; }
    const svg = renderStrip(rec, { title: `${r.name}: ${key}` });
    if (RAW) raw[id] = Object.assign(rec, { shownFrames: svg.frameList, phases: svg.phases, half: svg.half, file });
    writeFileSync(join(OUTDIR, file), svg.svg, 'utf8');
    bytes += Buffer.byteLength(svg.svg);
    index.moves[id] = { file, slot, n: rec.frames.length, freeAt: rec.freeAt, firstBox: rec.firstBox, lastBox: rec.lastBox, every: svg.every, shown: svg.shown,
      kinds: svg.kinds, inset: svg.inset || undefined, fell: rec.fell || undefined, untouchable: rec.untouchable || undefined, w: svg.w, h: svg.h };
    nMoves++;
  }
}
index.note = 'written by scripts/dump-hitboxes.mjs from the running game; do not edit by hand';
index.gameSha256 = sha; index.render = RENDER_VERSION;
// a picture no index entry names is stale (a move renamed or gone): removed, so the folder holds only what the pages use
const keep = new Set(Object.values(index.moves).map((m) => m.file).filter(Boolean));
for (const f of readdirSync(OUTDIR)) if (f.endsWith('.svg') && !keep.has(f)) rmSync(join(OUTDIR, f));
writeFileSync(INDEX, JSON.stringify(index, null, 0) + '\n', 'utf8');
if (RAW) writeFileSync(RAW, JSON.stringify(raw), 'utf8');
console.log(`dump-hitboxes: ${nMoves} moves, ${(bytes / 1024).toFixed(0)} KB of SVG in ${((Date.now() - t0) / 1000).toFixed(0)} s (game ${sha.slice(0, 12)})`);
console.log('errors', w.__errs.length ? [...new Set(w.__errs)].slice(0, 5) : 'none');
process.exit(0);
