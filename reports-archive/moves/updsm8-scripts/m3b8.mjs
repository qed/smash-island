// FRAME DATA FILL (headless). Usage (cwd = the tree): node measure.mjs <out.json> [fighterFilter] [all]
// The frame-budget audit's method (scratchpad/fbudget/budget.mjs), extended to jabs, tilts, aerials and the grab:
//  startup = frames from the move's start (frame 0 = the frame it is started) to the first frame a dummy takes damage (applyHit from the
//            fighter), the EARLIEST over a set of dummy positions around the fighter (front near/mid/far, behind, above, below, diagonals);
//            the dummy is held at its offset from the fighter until it is first hit (it only stands in the box's way; the move is untouched);
//  active  = frames from the first hit to the end of the move's busy part (anchor), in the earliest-hitting position, min 1;
//  end lag = frames from the anchor to the first frame the fighter is free again on a WHIFF (dummy far off and untouchable), and on a HIT.
//  smashes: + the full charge, as the audit did. grab: the first frame the dummy is held. A move that never hits from any position: startup -1.
import os from 'node:os'; try { os.setPriority(0, os.constants.priority.PRIORITY_LOW); } catch (e) {}
import fs from 'node:fs';
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/movebugs/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/movebugs/scripts/helpers/match-setup.js';
const OUT = process.argv[2] || 'fd.json', FILTER = process.argv[3] && process.argv[3] !== '-' ? process.argv[3] : null, ALL = process.argv[4] === 'all';
const MAXF = 100, RECF = 700, FSF = 500, LONGF = 360;
const { window: w } = loadMonolith(0xC0FFEE);
w.__errs = []; w.addEventListener('error', (e) => w.__errs.push(String(e.message || e)));
w.eval(SETUP_SRC);
w.eval(`
window.__REC = [];
(function(){ const _hd = holdDamage; holdDamage = function(f, t, dmg){ if(window.__REC && f && f.idx === 0 && t && t.idx === 1 && f._mv && f._mv.lasso != null) __REC.push({ dmg: dmg, st: 'lasso catch (holdDamage)' }); return _hd.apply(this, arguments); }; })();
(function(){ const _ah = applyHit; applyHit = function(t, dmg, kbx, kby, from, opts){ if(window.__REC && from && from.idx === 0 && t && t.idx === 1) __REC.push({ dmg: dmg, st: (new Error().stack||'').split(String.fromCharCode(10)).slice(2,6).map(function(s){return s.trim().slice(0,60);}).join(' < ') }); return _ah.apply(this, arguments); }; })();
window.__start = function(name){ __setupCustomMatch([name, 'Pen'], 99, 2, 0); fighters.forEach(function(f){ f.controller = 'still'; f.invuln = 0; }); for(let i = 0; i < 30; i++) step(); };
window.__busy = function(f){ return endLagBusy(f); };
window.__free = function(f){ return !__busy(f) && !(f._lag > 0) && !(f.atkCd > 0) && !f._mv && !(f.hitstun > 0) && !(f.rooted > 0) && !f._gb && !(f._eLag && !f._eLag.on); };
window.__pin = null;
window.__reset = function(air, far){
  FS.freeze = 0; FS.slow = 0; FS.fz = -1; FS.by = null; particles = []; projectiles = []; beams = []; HIT_ART.length = 0; items = []; summons = []; FINX.length = 0; itemTimer = 1e9; if(typeof SMASHBALL !== 'undefined') SMASHBALL = null;
  const f = fighters[0], d = fighters[1], gy = groundY();
  for(const q of [f, d]){ q.vx = 0; q.vy = 0; q.hitstun = 0; q._stunFx = 0; q.invuln = 0; q.pct = 0; q.frozen = 0; q.rooted = 0; q._windup = null; q._mv = null; q._gb = null; q._hold = null; q._heldBy = null;
    q.atkCd = 0; q.spCd = 0; q.smCd = 0; q.fnCd = 0; q._sp = false; q._usedAirSpecial = false; q.smashHold = 0; q._smQ = null; q._smBuf = false; q._fxLock = 0; q._fxBy = null; q._stall = null; q._dashing = 0;
    q._fs = null; q.ctrlRev = 0; q._infected = 0; q.fsGlow = 0; q.fsC = 0; q.fsId = ''; q.countering = 0; q.reflecting = 0; q.armor = 0; q._lag = 0; q._eLag = null; q.burn = 0; q.bleed = 0; q.slowed = 0; q.dead = false; q.stocks = 99; q._gotcha = null; q._tp = null; q.flying = 0; q._sawing = 0; q.jumps = 2; q._roll = null; q._plunge = null; q._nail = null; q._zsOn = 0; q._confirm = 0; q._empower = 0; }
  f.x = WW*0.4; f.y = gy - f.r; f.onground = true; f.face = 1;
  if(air){ f.y -= 330; f.onground = false; f.vy = JUMP; f.jumps = 1; }   // (mid-jump, as a player starts an aerial)
  d.x = far ? WW*0.92 : f.x + 300; d.y = gy - d.r; d.onground = true; d.face = -1;
  if(far) d.invuln = 99999;
  __REC.length = 0;
};
window.__place = function(){ const P = __pin; if(!P) return; const f = fighters[0], d = fighters[1], gy = groundY();
  d.x = f.x + P.ox; d.y = Math.min(f.y + P.oy, gy - d.r); d.vx = 0; d.vy = 0; d.onground = d.y >= gy - d.r - 0.5; d.face = P.ox >= 0 ? -1 : 1; };
window.__AER = { nair:'na', fair:'fa', bair:'ba', uair:'ua', dair:'da' };
window.__fire = function(slot){ const f = fighters[0], d = fighters[1], ms = msOf(f);
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
  else if(slot === 'fs'){ f.fsGlow = 9999; if(!fsTryFire(f)) return false; }
  else if(slot.endsWith('throw')){ d.x = f.x + f.r + d.r + 4; holdStart(f, d, grabOf(f)); if(d._heldBy !== f.idx) return false; doThrow(f, d, slot[0]); }
  return true;
};
window.__hitNow = function(slot){ const d = fighters[1]; if(slot === 'grab') return d._heldBy === 0 || !!fighters[0]._hold;
  return __REC.length > 0 || d.rooted > 0 || d.frozen > 0 || d.ctrlRev > 0 || d._infected > 0 || d._heldBy === 0; };   // (it CONNECTS: damage, or a no-damage hit -- root, freeze, scramble, infect, a hold; NOT hitstun alone: the Final Smash intro and other non-hits set it on a dummy anywhere)
window.__trial = function(slot, air, pin, far, cap){
  if(window.__NAME) __start(window.__NAME);   // m3: a FRESH match for every trial (measure2 reused one per move: a pin's leftover ring, tick timer or finisher hit the next pin's dummy)
  __reset(air, far); __pin = pin; const f = fighters[0];
  if(pin) __place();
  const ok = __fire(slot); if(ok === false) return { na: true };
  let hit = null, frame = 0, lastBusy = -1, freeAt = null, landed = false;
  if(__hitNow(slot)) hit = frame;
  const thr = slot.endsWith('throw');
  while(frame < ${RECF}){
    if(__busy(f)) lastBusy = frame;
    if(frame > 0 && __free(f) && (far || hit !== null || thr)){ freeAt = frame; break; }
    if(!far && !thr && hit === null && frame >= (cap == null ? ${MAXF} : cap)) break;
    if(hit === null && !thr) __place(); else __pin = null;
    step(); frame++;
    if(air && f.onground) landed = true;
    if(hit === null && __hitNow(slot)) hit = frame;
    if(f.dead || fighters[1].dead) break;
  }
  if(thr && hit === null) hit = 0;
  return { rec: __REC.slice(0,2), hit: hit, anchor: lastBusy + 2, freeAt: freeAt, full: smashFullOf(f), dead: f.dead, landed: landed };
};
window.__pins = function(air){ const f = fighters[0], d = fighters[1], R = f.r + d.r + 4, out = [];
  const xs = [R, R + 40, R + 90, R + 160, -R, -(R + 40)], ys = air ? [0, -R, R, -(R + 40), R + 40] : [0, -R, -(R + 40)];
  for(const oy of ys) for(const ox of xs) out.push({ ox: ox, oy: oy });
  if(!air) for(const ox of [0, f.r * 0.5, -f.r * 0.5]) out.push({ ox: ox, oy: 0 });
  for(const oy of (air ? [-R, -(R + 40), R, R + 40, R + 90] : [-R, -(R + 40), -(R + 90)])) out.push({ ox: 0, oy: oy });
  return out; };
`);
const J = (js) => JSON.parse(w.eval(`JSON.stringify((function(){ ${js} })())`));
const names = J(`return ROSTER.filter(function(r){ return r.play && r.kit; }).map(function(r){ return [r.name, r.kit.special, moveRowsFor(r).map(function(x){ return x[0]; }), !!MOVESETS[r.kit.special]]; })`).filter(([n]) => !FILTER || FILTER.split(',').includes(n));
const KEYSLOT = { 'X':'jab', '↑ + X':'utilt', '↓ + X':'dtilt', 'X in the air':'nair', '→ + X in the air':'fair', 'turn round + X in the air':'bair', '↑ + X in the air':'uair', '↓ + X in the air':'dair', 'X + C':'grab',
  'C':'neutral', '↑ + C':'up', '↓ + C':'down', 'V':'smash', '↑ + V':'usmash', '↓ + V':'dsmash', 'V + C':'finisher', '→, holding':'fthrow', '←, holding':'bthrow', '↑, holding':'uthrow', '↓, holding':'dthrow' };
const AIRS = new Set(['nair', 'fair', 'bair', 'uair', 'dair']);
const have = J('return FB_FRAME_DATA');
const res = {}, notes = {};
const t0 = Date.now();
const SPEC = new Set(['neutral', 'up', 'down', 'finisher']), seen = {}, conflicts = [];
for (const [name, kit, keys0, conv] of names) {
  console.log('fighter', name, ((Date.now() - t0) / 1000).toFixed(0) + ' s');
  try { w.eval(`__start(${JSON.stringify(name)})`); } catch (e) { notes[kit] = 'ERR start ' + String(e.message).slice(0, 80); continue; }
  const pinsG = J('return __pins(false)'), pinsA = J('return __pins(true)');
  const keys = keys0.concat(keys0.includes('Final Smash') ? [] : []);
  for (const key of keys) {
    const slot = key === 'Final Smash' ? 'fs' : KEYSLOT[key]; if (!slot) continue;
    if (process.env.SLOTS && !process.env.SLOTS.split(',').includes(slot)) continue;   // m3: only these slots
    const id = kit + '.' + slot, old = have[id];
    try { w.eval(`__start(${JSON.stringify(name)}); window.__NAME = ${JSON.stringify(name)};`); } catch (e) { notes[id] = 'ERR restart'; continue; }   // (a fresh match for every move: one move's leftovers -- an infected dummy on her side -- never reach the next)
    const want = ALL || !old || (old[0] === 0 && !slot.endsWith('throw'));
    if (!want) continue;
    if (!conv && AIRS.has(slot) && slot !== 'nair') continue;
    try {
      const thr = slot.endsWith('throw');
      let best = null, air = AIRS.has(slot), note = [];
      const search = (isAir, cap0) => { let b = null;
        for (const p of (isAir ? pinsA : pinsG)) {
          const q = J(`return __trial(${JSON.stringify(slot)}, ${isAir}, ${JSON.stringify(p)}, false, ${b ? b.hit : cap0})`);
          if (q.na) return 'na';
          if (q.hit !== null && (!b || q.hit < b.hit)) { b = q; b.pin = p; if (q.hit === 0) break; }
        } return b; };
      if (thr) { const q = J(`return __trial(${JSON.stringify(slot)}, false, null, false)`); if (q.na) { notes[id] = 'cannot start'; continue; } best = q; }
      else {
        best = search(air, slot === 'fs' ? FSF : MAXF);
        if (best === null && (SPEC.has(slot) || slot === 'fs')) { const b3 = search(air, LONGF); if (b3 && b3 !== 'na') { best = b3; note.push('long: first hit after ' + MAXF); } }   // (a trap or a timed bomb: looked at for 6 s)
        if (best === null && SPEC.has(slot)) { const b2 = search(true, MAXF); if (b2 && b2 !== 'na') { best = b2; air = true; note.push('measured in the air'); } }
        if (best === 'na') { notes[id] = 'cannot start'; continue; }
      }
      const isSm = slot.endsWith('smash');
      let startup = -1, active = 1, recHit = -1, recWhiff = -1;
      if (best) {
        startup = best.hit + (isSm ? best.full : 0);
        active = Math.max(1, best.anchor - best.hit);
        if (best.freeAt != null) recHit = Math.max(0, best.freeAt - Math.max(best.anchor, best.hit + 1)); else note.push('hit: not free');
        if (best.landed) note.push('hit trial landed');
      } else note.push('no hit from any position');
      if (slot === 'fs') { res[id] = [startup, 1, 0, 0]; if (note.length) notes[id] = note.join('; '); continue; }   // (Final Smash: startup only)
      if (!thr) {
        const q = J(`return __trial(${JSON.stringify(slot)}, ${air}, null, true)`);
        if (!q.na && best && best !== 'na' && slot !== 'grab') active = Math.max(1, q.anchor - best.hit);   // (ACTIVE from the whiff: a hit's freeze would stretch it)
        if (!q.na && q.freeAt != null) recWhiff = Math.max(0, q.freeAt - (slot === 'grab' ? startup + 1 : q.anchor)); else note.push(q.dead ? 'whiff: fell' : 'whiff: not free');
        if (q.landed) note.push('whiff trial landed');
      }
      if (slot === 'grab') { active = 1; recHit = -1; }   // (the grab's box is checked on one frame; a caught foe is held: the hold is not its recovery)
      const row = [startup, active, recWhiff, recHit]; if(process.env.TRACE) console.log(id, JSON.stringify(row), JSON.stringify(best && best.pin), JSON.stringify(best && best.rec));
      if (seen[id] && JSON.stringify(seen[id][1]) !== JSON.stringify(row)) conflicts.push([id, seen[id][0], seen[id][1], name, row]);
      if (!seen[id]) { seen[id] = [name, row]; res[id] = row; if (note.length) notes[id] = note.join('; '); }
    } catch (e) { notes[id] = 'ERR ' + String(e.message).slice(0, 100); }
  }
}
fs.writeFileSync(OUT, JSON.stringify({ res, notes, conflicts }, null, 0));
console.log('fighters', names.length, 'rows', Object.keys(res).length, 'notes', Object.keys(notes).length, 'in', ((Date.now() - t0) / 1000).toFixed(1), 's');
console.log('errors', w.__errs.length ? [...new Set(w.__errs)].slice(0, 5) : 'none');
process.exit(0);
