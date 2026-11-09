// BOSS DODGE AUDIT (measurement only; never edits index.html).
// Usage (cwd = the bossaudit worktree, one node process at a time, BelowNormal):
//   node boss-dodge-audit.mjs <bossIdx> <phase> [seeds=5] [outDir]   -> writes <outDir>/cell-<idx>-<ph>.json
//   node boss-dodge-audit.mjs --merge <outDir> <reportsDir>          -> boss-dodge-audit.csv + boss-dodge-audit.tables.md
// For every (boss, phase, move) the boss has unlocked: a survival bot that NEVER attacks is run on seeded scenarios
//  - STILL: stands (measures the tell window: frames from the wind-up's first frame to the first damaging frame)
//  - HUMAN-18 / HUMAN-12: reacts to what was visible 18 (12) frames ago -- the wind-up's marked spot, every boss shot's
//    position and velocity, the boss body -- with the normal keys (left/right, jump, double jump, fast fall)
//  - ORACLE: ~80 scripted lines on the same seed (stand, run, jump at offsets, double jump, fast fall, shield, run+jump);
//    'dodged' if ANY line takes 0 damage from the attack. Arena-hazard hits (arenaHazardHit) are counted apart.
import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
try { os.setPriority(0, os.constants.priority.PRIORITY_BELOW_NORMAL); } catch (e) {}
const WT = 'file:///C:/Users/carad/Aardvark/smash-island/.worktrees/bossfix/';
const { loadMonolith } = await import(WT + 'scripts/helpers/load-monolith.js');
const { SETUP_SRC } = await import(WT + 'scripts/helpers/match-setup.js');

const REALM_SRC = String.raw`
window.__HITS = []; window.__inHaz = false;
(function(){
  const ah0 = applyHit;
  applyHit = function(t, dmg, kbx, kby, from, opts){
    const before = t && t.pct;
    const r = ah0.apply(this, arguments);
    if(t && t.idx === 0 && t.pct > before) __HITS.push({ f: hazardT, d: +(t.pct - before).toFixed(2), id: opts && opts.bossAtk, haz: __inHaz });
    return r;
  };
  const hz0 = arenaHazardHit;
  arenaHazardHit = function(){ __inHaz = true; try { return hz0.apply(this, arguments); } finally { __inHaz = false; } };
})();
window.__mulberry = function(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
window.__boss = function(){ return summons.find(s => s.type === 'boss') || null; };
window.__bossScene = function(bossIdx){
  __setupCustomMatch(['Pen', 'Pen'], 99, 2, 0);
  SETTINGS.mode = 'boss';
  BOSSRUSH = { active:true, bossIdx:bossIdx, cleared:0, defeated:false, loop:0, dmgMult:1 };
  particles=[]; projectiles=[]; beams=[]; HIT_ART.length=0; items=[]; summons=[]; FINX=[]; FX_PLATS=[]; itemTimer=1e9; tendrils=[];
  if(typeof SMASHBALL !== 'undefined') SMASHBALL = null;
  spawnBossRushBoss();
  const f = fighters[0], d = fighters[1];
  f.controller = 'local'; f.pct = 0; f.invuln = 0;
  d.controller = 'still'; d.team = -1; d.x = WW*0.5; d.y = -4000; d.vy = 0; d._floatT = 1e9;   // the dummy: on the boss's side (ignored by it and its shots), far above
  for(const k in down) down[k] = false;
  __HITS.length = 0;
  const s = __boss(); s._atkTimer = 1e9; s._atkLive = null;
  return s;
};
window.__setPhase = function(ph){ const s = __boss(); if(!s) return;
  if(s.attack === 'one'){ s.hp = s.maxHp - ONE_PHASE_HP*(ph - 1) - 1; return; }          // One: a mark every 500 HP (tiers 1..4)
  if(s.attack === 'cobsfight'){ s.hp = s.maxHp - COBS_PHASE_HP*(ph - 1) - 1; return; }   // Steve Cobs: a tier line every 500 HP (tiers 1..5)
  s.hp = ph >= 3 ? Math.floor(s.maxHp*0.2) : ph === 2 ? Math.floor(s.maxHp*0.5) : s.maxHp; };
// The two secret bosses (hidden; their own engines): their fights started the game's way, their pickers forced to __forceKind.
window.__forceKind = null;
(function(){ const o0 = oneNextMove, c0 = cobsNextMove; oneNextMove = function(s){ return __forceKind || o0(s); }; cobsNextMove = function(s){ return __forceKind || c0(s); }; })();
window.__secretScene = function(which){
  __setupCustomMatch(['Pen', 'Pen'], 99, 2, 0);
  if(which === 'one') startOneFight(['Pen']); else startCobsFight(['Pen']);
  const f = fighters[0]; f.controller = 'local'; f.pct = 0; f.invuln = 0;
  for(const k in down) down[k] = false;
  __HITS.length = 0; __forceKind = null;
  for(let i = 0; i < 30; i++) step();
  const s = __boss(); s._atkTimer = 1e9; return s;
};
window.__place = function(fx, plat, ax){
  const f = fighters[0], gy = groundY(); let x = ax != null ? ax : WW*fx, y = gy - f.r, onPlat = false;
  if(plat){ const P = platRects().filter(p => p.y < gy - 20 && p.y > gy - 200 && p.w >= 60 && Math.abs(p.x + p.w/2 - x) < 700); if(P.length){ let b = P[0]; for(const p of P) if(Math.abs((p.x + p.w/2) - x) < Math.abs((b.x + b.w/2) - x)) b = p; x = b.x + b.w/2; y = b.y - f.r; onPlat = true; } }
  f.x = x; f.y = y; f.vx = 0; f.vy = 0; f.onground = true; f.hitstun = 0; f.invuln = 0; f.pct = 0; f.dead = false; f._swallow = 0; f.jumps = 0;
  return onPlat;
};
window.__keys = function(o){ const K = KEYS; down[K.left] = !!(o && o.left); down[K.right] = !!(o && o.right); down[K.jump] = !!(o && o.jump); down[K.down] = !!(o && o.down); down[K.shield] = !!(o && o.shield); };
window.__obs = function(){
  const s = __boss(), f = fighters[0];
  return { f:{ x:f.x, y:f.y, vx:f.vx, vy:f.vy, r:f.r, og:!!f.onground },
    b: s ? { x:s.x, y:s.y, vx:s.vx, vy:s.vy, r:s.r, tel:s._tel, telX:s._telX, telY:s._telY } : null,
    p: projectiles.filter(p => p.life > 0 && p.dmg > 0 && (p.owner === -2 || (p.ownerObj && p.ownerObj.team === -1))).map(p => ({ x:p.x, y:p.y, vx:p.vx||0, vy:p.vy||0, r:p.r||8, g:!!p.grav, hom:!!p.homing, dl:p.delay > 0 ? p.delay : 0 })) };
};
// ---- the human-like survival bot: decides from the observation D frames old ----
window.__platNear = function(me, maxDx){
  const gy = groundY(); let best = null;
  for(const p of platRects()){ if(p.y >= gy - 20 || p.w < 60) continue; const cx = p.x + p.w/2, up = (me.y + me.r) - p.y; if(up < 60 || up > 175) continue; const dx = Math.abs(cx - me.x); if(dx <= maxDx && (!best || dx < best.dx)) best = { cx, top:p.y, dx, x0:p.x, x1:p.x + p.w }; }
  return best;
};
window.__humanBot = function(st, obs, D){
  const f = fighters[0], W = WW;
  const me = { x:f.x, y:f.y, r:f.r, og:!!f.onground };
  let act = { left:false, right:false, jump:false, down:false };
  if(!obs) return act;
  const room = (dir) => dir < 0 ? me.x - W*0.1 : W*0.9 - me.x;
  const awayFrom = (x) => { const d = Math.sign(me.x - x); if(d !== 0 && room(d) > 60) return d; return room(1) >= room(-1) ? 1 : -1; };
  let best = null, train = 0, trainVx = 0;
  for(const p of obs.p){
    // where it is t frames after the observation: a shot still on its delay (a lit mark, a note at its grille, a drop with its shadow) stands until the delay is out, then flies
    const at = (t) => { const mv = Math.max(0, t - p.dl); return { x: p.x + p.vx*mv, y: p.y + p.vy*mv + (p.g ? 0.2*mv*mv : 0) }; };
    const now = at(D);
    const toward = Math.sign(p.vx) === Math.sign(me.x - now.x) && Math.abs(p.vx) > 1.5;
    if(toward && Math.abs(now.y - me.y) < 60 && Math.abs(now.x - me.x) < 520 && Math.abs(p.vy) < 2){ train++; trainVx += p.vx; }
    for(let k = 0; k <= 60; k++){
      const q = at(D + k), d = Math.hypot(q.x - me.x, q.y - me.y);
      if(d < p.r + me.r + 10){ if(!best || k < best.k) best = { k, p, hx:q.x, hy:q.y, x0:now.x, y0:now.y }; break; }
    }
  }
  const b = obs.b;
  let bodyThreat = false, bodyK = 99;
  if(b && (Math.abs(b.vx) > 2.5 || Math.abs(b.vy) > 2.5)){ let bx = b.x + b.vx*D, by = b.y + b.vy*D; for(let k = 0; k <= 40; k++){ if(Math.hypot(bx - me.x, by - me.y) < b.r*0.9 + me.r + 12){ bodyThreat = true; bodyK = k; break; } bx += b.vx; by += b.vy; } }
  const tellNear = b && b.tel > 0 && b.telX != null && Math.abs(b.telX - me.x) < 130 && Math.abs((b.telY == null ? me.y : b.telY) - me.y) < 110;   // leave the marked spot, and keep going a moment
  const setDir = (d, hold) => { st.dir = d; st.hold = hold; };
  if(best){
    const p = best.p, lowShot = best.hy + p.r > me.y - me.r*0.25, fromAbove = p.vy > 1.2 && best.y0 < me.y - me.r, overhead = best.hy + p.r < me.y - me.r*0.9 && Math.abs(p.vy) < 1.5;
    if(overhead){ act.down = !me.og; st.hold = 0; }
    else if(fromAbove){ setDir(awayFrom(best.hx), 10); }
    else if(lowShot && Math.abs(p.vy) < 3 && !p.hom){
      const flee = Math.sign(trainVx || p.vx) || 1, pl = me.og ? __platNear(me, 260) : null;
      if(train >= 3 && pl){ st.plat = pl; setDir(Math.sign(pl.cx - me.x) || 0, 4); if(pl.dx < 120 || best.k <= 8) act.jump = true; }   // a long crest: get up onto the ledge (or over its front)
      else if(train >= 3 && room(flee) > 120 && best.k > 6){ setDir(flee, 6); }   // outrun it while there is room
      else { if(me.og){ if(best.k <= 9) act.jump = true; } else if(f.jumps < 2 && best.k <= 5 && !st.jHeld) act.jump = true; st.hold = 0; }
    }
    else { setDir(awayFrom(best.hx), 8); if(best.k <= 10 && me.og && !p.hom) act.jump = true; }
  } else if(bodyThreat){ const pl = me.og ? __platNear(me, 200) : null; if(pl && Math.abs(b.vy) < 2 && b.y - b.r*0.9 > pl.top - 60){ st.plat = pl; setDir(Math.sign(pl.cx - me.x) || 0, 4); if(pl.dx < 120) act.jump = true; } else { setDir(awayFrom(b.x), 10); if(bodyK <= 12 && (me.og || (f.jumps < 2 && bodyK <= 6))) act.jump = true; } }
  else if(tellNear){ setDir(awayFrom(b.telX), 10); }
  else if(train >= 3){ const flee = Math.sign(trainVx) || 1, pl = me.og ? __platNear(me, 260) : null; if(pl){ st.plat = pl; setDir(Math.sign(pl.cx - me.x) || 0, 4); if(pl.dx < 120) act.jump = true; } else if(room(flee) > 120) setDir(flee, 6); }
  if(!me.og && st.plat){ const dx = st.plat.cx - me.x; st.hold = 0; if(Math.abs(dx) > 16){ act.left = dx < 0; act.right = dx > 0; } }   // in the air, steer onto the ledge
  if(me.og) st.plat = null;
  if(st.hold > 0){ st.hold--; if(st.dir < 0) act.left = true; else if(st.dir > 0) act.right = true; }
  // a jump is a held press (8 frames: a full jump), and the next press needs a release between
  if(act.jump && me.og && !st.jHeld && !(st.jHold > 0)) st.jHold = 8;
  if(act.jump && !me.og && f.jumps < 2 && !st.jHeld && !(st.jHold > 0)) st.jHold = 6;
  act.jump = st.jHold > 0; if(st.jHold > 0) st.jHold--;
  st.jHeld = act.jump;
  return act;
};
// scripted line: {name, fn(i) -> keys} built from a spec (i = frames since the wind-up began)
window.__scriptAct = function(sp, i, st){
  const a = { left:false, right:false, jump:false, down:false, shield:false };
  if(sp.dir){ let d = sp.dir; if(d === 'away'){ if(st.away == null){ const s = __boss(), f = fighters[0]; const tx = (s && s._telX != null) ? s._telX : (s ? s.x : WW/2); st.away = Math.sign(f.x - tx) || (f.x < WW/2 ? 1 : -1); } d = st.away; } const fx = fighters[0].x; if(d < 0 && fx > WW*0.1) a.left = true; else if(d > 0 && fx < WW*0.9) a.right = true; }   // (a line never runs off the edge: nobody dodges by falling)
  if(sp.toPlat){ const f = fighters[0], pl = __platNear({ x:f.x, y:f.y, r:f.r }, 600); if(pl && f.onground && !(f.x > pl.x0 && f.x < pl.x1 && f.y + f.r <= pl.top + 4)){ if(pl.cx < f.x - 6) a.left = true; else if(pl.cx > f.x + 6) a.right = true; if(pl.dx < 120) a.jump = (i % 10 < 8); } else if(pl && !f.onground){ const dx = pl.cx - f.x; a.left = dx < -16; a.right = dx > 16; } }
  if(sp.jumpAt != null && i >= sp.jumpAt && i < sp.jumpAt + 8) a.jump = true;
  if(sp.hopAt != null && i === sp.hopAt) a.jump = true;   // a short hop: one frame
  if(sp.hopEvery != null && i >= (sp.hopFrom || 0) && ((i - (sp.hopFrom || 0)) % sp.hopEvery) === 0) a.jump = true;   // hops on a rhythm (a crest train)
  if(sp.jumpEvery != null && i >= (sp.hopFrom || 0)){ const q = (i - (sp.hopFrom || 0)) % sp.jumpEvery; if(q < 8) a.jump = true; }
  if(sp.djAt != null && i >= sp.djAt && i < sp.djAt + 6) a.jump = true;
  if(sp.ffAt != null && i >= sp.ffAt && i < sp.ffAt + 20) a.down = true;
  if(sp.shieldAt != null && i >= sp.shieldAt) a.shield = true;
  return a;
};
// One trial. policy: {kind:'still'|'human'|'script', D, spec}. Returns the damage from the attack, the hazard damage, timing.
window.__trial = function(o){
  Math.random = __mulberry(o.seed);
  const s = o.secret ? __secretScene(o.secret) : __bossScene(o.bossIdx);
  for(let i = 0; i < 300; i++) step();
  __setPhase(o.ph); for(let i = 0; i < 60; i++) step();
  Math.random = __mulberry(o.seed*7919 + 13);
  const onPlat = __place(o.fx, o.plat, o.ax);
  __keys(null); __HITS.length = 0;
  if(o.secret){ __forceKind = o.kind; s._tel = 0; s._turnLive = null; s._atkLive = null; s._hopPending = false; s._atkTimer = 1; }
  else { s._pickForce = o.kind; s._atkLive = null; s._tel = 0; s._atkTimer = 1; }
  const ring = [], st = {}, D = o.policy.D || 0;
  let telStart = null, telT = 0, fired = null, lo = null, got = null, name = null, telLen = null, ko = false, i = 0, over = false;
  const MAX = 1100;
  for(; i < MAX; i++){
    if(telStart != null){
      let act = null;
      if(o.policy.kind === 'human'){ const ob = ring.length > D ? ring[ring.length - 1 - D] : null; act = __humanBot(st, ob, D); }
      else if(o.policy.kind === 'script'){ const sp = o.policy.spec; if(sp.react != null){ const ob = ring.length > sp.react ? ring[ring.length - 1 - sp.react] : null; act = __humanBot(st, ob, sp.react); if(sp.dir || sp.hopEvery != null){ const a2 = __scriptAct(sp, i - telStart, st); act.left = act.left || a2.left; act.right = act.right || a2.right; act.jump = act.jump || a2.jump; } } else act = __scriptAct(sp, i - telStart, st); }
      __keys(act);
    }
    ring.push(__obs()); if(ring.length > 40) ring.shift();
    step();
    if(fighters[0].dead) ko = true;
    if(telStart == null){ if(s._tel > 0){ telStart = i; telT = hazardT; lo = s._atkLo; got = o.secret ? s._telKind : (s._pickKey || s._telKind); telLen = s._tel; try{ name = o.secret === 'one' ? ONE_MOVE_NAME[s._telKind] : o.secret === 'cobs' ? COBS_MOVE_NAME[s._telKind] : bossTelName(s); }catch(e){ name = '?'; } } else if(i > (o.secret ? 700 : 420)) break; }
    else if(s._tel <= 0){ if(fired == null) fired = i; if(s._atkTimer < 1e6) s._atkTimer = 1e9; if(i > fired + 20 && bossAttackOver(s, { lo }) && !(s.attack === 'one' && (oneBusy(s) || s._hop)) && !(s.attack === 'cobsfight' && s._turnLive)){ over = true; i++; break; } }
    if(o.stopOnHit && __HITS.some(h => !h.haz)) break;
  }
  __keys(null);
  const atk = __HITS.filter(h => !h.haz && h.f >= telT), haz = __HITS.filter(h => h.haz && h.f >= telT);   // (what struck before the wind-up began is the arena's, not the attack's)
  const dmg = atk.reduce((a, h) => a + h.d, 0), hazDmg = haz.reduce((a, h) => a + h.d, 0);
  return { got, name, telLen, telStart, fired, frames: i, over, onPlat, dmg:+dmg.toFixed(1), hazDmg:+hazDmg.toFixed(1), firstHit: atk.length ? atk[0].f - telT : null, hits: atk.length, ko, bx: Math.round(s.x), by: Math.round(s.y) };
};
`;

function boot(seed = 1) {
  const { window: w } = loadMonolith(seed);
  w.__errs = [];
  w.addEventListener('error', (e) => w.__errs.push(String(e.message || e)));
  w.eval(SETUP_SRC);
  w.eval(REALM_SRC);
  return w;
}
const J = (w, js) => JSON.parse(w.eval(`JSON.stringify((function(){ ${js} })())`));

const POS = [ { n:'floorL', fx:0.15, plat:false }, { n:'floorM', fx:0.5, plat:false }, { n:'floorR', fx:0.85, plat:false }, { n:'plat', fx:0.5, plat:true } ];
function oracleSpecs() {
  const L = [{ n:'still' }, { n:'runL', dir:-1 }, { n:'runR', dir:1 }, { n:'away', dir:'away' }, { n:'react0', react:0 }, { n:'react4', react:4 }, { n:'react8', react:8 }, { n:'shield', shieldAt:0 }, { n:'shield@30', shieldAt:30 }, { n:'shield@60', shieldAt:60 }, { n:'toPlat', toPlat:true }, { n:'toPlat+shield', toPlat:true, shieldAt:40 }];
  for (let o = 0; o <= 108; o += 9) { L.push({ n:`jump@${o}`, jumpAt:o }); L.push({ n:`jump@${o}+dj`, jumpAt:o, djAt:o + 22 }); L.push({ n:`hop@${o}`, hopAt:o }); }
  for (let o = 0; o <= 108; o += 18) { L.push({ n:`runL+jump@${o}`, dir:-1, jumpAt:o }); L.push({ n:`runR+jump@${o}`, dir:1, jumpAt:o }); L.push({ n:`away+jump@${o}`, dir:'away', jumpAt:o }); L.push({ n:`jump@${o}+ff`, jumpAt:o, ffAt:o + 14 }); }
  for (let o = 0; o <= 108; o += 36) { L.push({ n:`away+jump@${o}+dj`, dir:'away', jumpAt:o, djAt:o + 22 }); L.push({ n:`runL+jump@${o}+dj`, dir:-1, jumpAt:o, djAt:o + 22 }); L.push({ n:`runR+jump@${o}+dj`, dir:1, jumpAt:o, djAt:o + 22 }); }
  for (const e of [24, 30, 36, 42, 48]) for (const o of [0, 8, 16]) { L.push({ n:`hops/${e}@${o}`, hopEvery:e, hopFrom:o }); L.push({ n:`jumps/${e}@${o}`, jumpEvery:e, hopFrom:o }); }
  for (const e of [30, 42]) { L.push({ n:`runL+hops/${e}`, dir:-1, hopEvery:e }); L.push({ n:`runR+hops/${e}`, dir:1, hopEvery:e }); L.push({ n:`react0+hops/${e}`, react:0, hopEvery:e }); }
  return L;
}

function runCell(w, bossIdx, ph, seeds, onlyMove) {
  const secret = (bossIdx === 'one' || bossIdx === 'cobs') ? bossIdx : null;
  const info = secret
    ? J(w, `Math.random = __mulberry(1); const s = __secretScene('${secret}'); for(let i=0;i<300;i++) step(); __setPhase(${ph}); for(let i=0;i<60;i++) step(); return { name:s.name, attack:s.attack, moves: ${secret === 'one' ? 'ONE_DECK.concat(ONE_SPECIALS)' : 'COBS_DECK.concat(COBS_SPECIALS)'}, phase: s._phase, fx: fighters[0].x }`)
    : J(w, `Math.random = __mulberry(1); const s = __bossScene(${bossIdx}); for(let i=0;i<300;i++) step(); __setPhase(${ph}); for(let i=0;i<60;i++) step(); return { name:s.name, attack:s.attack, moves: bossPickMoves(s, ${ph}), phase: s._phase }`);
  const POSL = secret ? [ { n:'floorL', ax: info.fx - 260, plat:false }, { n:'floorM', ax: info.fx, plat:false }, { n:'floorR', ax: info.fx + 260, plat:false }, { n:'plat', ax: info.fx, plat:true } ] : POS;
  const out = { bossIdx, ph, boss: info.name, attack: info.attack, hidden: !!secret, moves: {} };
  for (const kind of info.moves) {
    if (onlyMove && kind !== onlyMove) continue;
    const M = { name: null, telLen: null, still: [], h18: [], h12: [], oracle: [] , got: null };
    const trial = (pos, seed, policy, stopOnHit, jit) => J(w, `return __trial(${JSON.stringify({ bossIdx, ph, kind, seed, secret, fx: pos.plat || pos.fx == null ? pos.fx : Math.min(0.92, Math.max(0.08, pos.fx + (jit || 0))), ax: pos.ax != null ? (pos.plat ? pos.ax : pos.ax + (jit || 0)*1024) : undefined, plat: pos.plat, policy, stopOnHit: !!stopOnHit })})`);
    for (let sd = 0; sd < seeds; sd++) for (const pos of POSL) {
      const seed = 1000 + sd * 17 + POSL.indexOf(pos);
      const jit = (sd - Math.floor(seeds/2))*0.03;   // the start spot moves a little with the seed (the fight itself is deterministic)
      const a = trial(pos, seed, { kind:'still' }, false, jit);
      if (a.got !== kind) { M.got = a.got; }
      if (!M.name) { M.name = a.name; M.telLen = a.telLen; }
      M.still.push({ pos: pos.n, seed, dmg: a.dmg, first: a.firstHit, haz: a.hazDmg, ko: a.ko, over: a.over, fr: a.frames });
      const b = trial(pos, seed, { kind:'human', D:18 }, false, jit), c = trial(pos, seed, { kind:'human', D:12 }, false, jit);
      M.h18.push({ pos: pos.n, seed, dmg: b.dmg, haz: b.hazDmg, ko: b.ko }); M.h12.push({ pos: pos.n, seed, dmg: c.dmg, haz: c.hazDmg, ko: c.ko });   // (a KO -- knocked or fallen off -- is never a dodge; a hazard hit taken while dodging counts too)
    }
    // oracle: seed 0 of every position, early exit on the first 0-damage line
    for (const pos of POSL) {
      const seed = 1000 + POSL.indexOf(pos);
      let found = null, tried = 0, minDmg = 1e9;
      for (const sp of oracleSpecs()) { tried++; const r = trial(pos, seed, { kind:'script', spec: sp }, true); if (!r.ko && r.dmg + r.hazDmg < minDmg) minDmg = r.dmg + r.hazDmg; if (r.dmg === 0 && r.hazDmg === 0 && !r.ko) { found = sp.n; break; } }
      M.oracle.push({ pos: pos.n, seed, found, tried, minDmg });
    }
    out.moves[kind] = M;
    const z = (L) => L.filter((t) => t.dmg === 0 && !(t.haz > 0) && !t.ko).length;
    console.log(`${info.name} ph${ph} ${kind} "${M.name}" tel=${M.telLen} still0=${z(M.still)}/${M.still.length} h18=${z(M.h18)}/${M.h18.length} h12=${z(M.h12)}/${M.h12.length} oracle=${M.oracle.filter((o) => o.found).length}/${POSL.length} ${M.got ? 'GOT ' + M.got : ''}`);
  }
  return out;
}

function verdict(M) {
  const z = (L) => L.filter((t) => t.dmg === 0 && !(t.haz > 0) && !t.ko).length / L.length;
  const h18 = z(M.h18), orc = M.oracle.filter((o) => o.found).length / M.oracle.length;
  return h18 >= 0.7 && orc >= 1 ? 'FAIR' : (h18 >= 0.4 && orc >= 1) ? 'HARD' : 'UNFAIR';
}
function merge(outDir, repDir) {
  const parts = fs.readdirSync(outDir).filter((f) => /^cell-\w+-\d(-\w+)?\.json$/.test(f)).map((f) => JSON.parse(fs.readFileSync(path.join(outDir, f), 'utf8')));
  const byKey = {};   // a cell split into one file per move (the secret bosses' long runs) is joined back here
  for (const c of parts) { const k = c.bossIdx + '-' + c.ph; if (!byKey[k]) byKey[k] = c; else Object.assign(byKey[k].moves, c.moves); }
  const cells = Object.values(byKey);
  const ord = (c) => c.bossIdx === 'one' ? 100 : c.bossIdx === 'cobs' ? 101 : +c.bossIdx;
  cells.sort((a, b) => ord(a) - ord(b) || a.ph - b.ph);
  const rows = [['boss', 'bossIdx', 'phase', 'moveKey', 'attack', 'hidden', 'trials', 'h18_dodge', 'h12_dodge', 'oracle_dodge', 'still_dodge', 'avg_dmg_h18', 'avg_dmg_still', 'tel_len_frames', 'first_hit_frame_min', 'oracle_lines', 'oracle_min_dmg', 'verdict']];
  const per = {};
  for (const c of cells) for (const [k, M] of Object.entries(c.moves)) {
    const avg = (L) => (L.reduce((a, t) => a + t.dmg, 0) / L.length).toFixed(1), z = (L) => (L.filter((t) => t.dmg === 0 && !(t.haz > 0) && !t.ko).length / L.length).toFixed(2);
    const firsts = M.still.map((t) => t.first).filter((x) => x != null);
    const v = verdict(M);
    per[c.boss] = per[c.boss] || { FAIR: 0, HARD: 0, UNFAIR: 0 };
    per[c.boss][v]++;
    if (!M.name || (M.got && M.got !== k && M.got !== c.attack)) continue;   // the picker refused the move in this phase: not a row (Four's two signature forms fire as his `attack` key, and are kept)
    rows.push([c.boss, c.bossIdx, c.ph, k, M.name, c.hidden ? 'yes' : 'no', M.h18.length, z(M.h18), z(M.h12), (M.oracle.filter((o) => o.found).length / M.oracle.length).toFixed(2), z(M.still), avg(M.h18), avg(M.still), M.telLen, firsts.length ? Math.min(...firsts) : '', M.oracle.map((o) => `${o.pos}:${o.found || '-'}`).join(' '), Math.min(...M.oracle.map((o) => o.minDmg)), v]);
  }
  fs.writeFileSync(path.join(repDir, 'boss-dodge-audit.csv'), rows.map((r) => r.map((x) => (/[",\s]/.test(String(x)) ? `"${String(x).replace(/"/g, '""')}"` : x)).join(',')).join('\n') + '\n');
  let md = '| boss | FAIR | HARD | UNFAIR |\n|---|---|---|---|\n';
  for (const [b, t] of Object.entries(per)) md += `| ${b} | ${t.FAIR} | ${t.HARD} | ${t.UNFAIR} |\n`;
  md += '\n| boss | ph | attack | h18 | h12 | oracle | still | avg dmg h18 | tel | first hit | verdict |\n|---|---|---|---|---|---|---|---|---|---|---|\n';
  for (const r of rows.slice(1)) md += `| ${r[0]} | ${r[2]} | ${r[4]} | ${r[7]} | ${r[8]} | ${r[9]} | ${r[10]} | ${r[11]} | ${r[13]} | ${r[14]} | ${r[17]} |\n`;
  fs.writeFileSync(path.join(repDir, 'boss-dodge-audit.tables.md'), md);
  console.log('rows', rows.length - 1, 'cells', cells.length);
}

if (process.argv[2] === '--merge') { merge(process.argv[3], process.argv[4]); process.exit(0); }
const bossIdx = /^\d+$/.test(process.argv[2]) ? +process.argv[2] : process.argv[2], ph = +process.argv[3], seeds = +(process.argv[4] || 5), outDir = process.argv[5] || '.', onlyMove = process.argv[6] || null;
const t0 = Date.now();
const w = boot(1);
const cell = runCell(w, bossIdx, ph, seeds, onlyMove);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, `cell-${bossIdx}-${ph}${onlyMove ? '-' + onlyMove : ''}.json`), JSON.stringify(cell));
console.log('done', ((Date.now() - t0) / 1000).toFixed(1), 's; errs', w.__errs.slice(0, 3));
process.exit(0);
