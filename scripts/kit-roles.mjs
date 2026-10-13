// ============================================================================
//  kit-roles.mjs -- does every playable fighter have a way into combos, a recovery and a kill?
// ============================================================================
// The owner, 2026-10-13: "PB is a good kit, because you can get into combos by chipping with the attack, recover with the up special, and kill with
// the smash/finisher." On Bow's old snowballs: "they cant combo, cant kill, and cant recover. literally every single other special in the game does one
// of these." So a kit needs a COMBO starter, a RECOVERY and a KILL move, and every special should fill at least one. This MEASURES and REPORTS; it
// changes no gameplay. Every number comes from the real engine (artifacts/V1/index.html in jsdom, the same boot the tests use), never a re-derived formula.
//
//   node scripts/kit-roles.mjs --procs 4 --out kit-roles.json           every playable fighter (ROSTER play rows; bosses and the prize rows are not in it)
//   node scripts/kit-roles.mjs --only "Bow,Firey" --procs 1             a quick look
//   node scripts/kit-roles.mjs --report kit-roles.json --md out-prefix   rebuild the verdicts and the markdown table (out-prefix.table.md, out-prefix.derived.json) from a finished run
//   --skip combo,rec                                                    leave out a probe (ko, combo, rec, spec)
//
// THE PROBES (each fighter alone against a weight-90 dummy of the plain kit):
//  KO     every move (jab, up-tilt, down-tilt, finisher, special, up-special, down-special, smash straight/up/down), on the ground and in the air, put on the
//         dummy at centre stage on Goiky Field at 0,10..230% over six gaps; the lowest % at which the dummy loses a stock (KO by launch or by the damage cap).
//  COMBO  move X lands on the dummy at 0, 40 and 80%; then a follow-up Y (any of the eight moves, a smash after its real charge) is thrown d frames later,
//         with the fighter standing, walking at the foe or jumping at it. It counts as a COMBO only if Y's damage lands while the dummy cannot act
//         (hitstun, frozen or rooted at the end of the frame before, or the chain counter went up: a hit during hitstun). The engine's own rules decide:
//         hit-grace, chain limit, cooldowns, self-stun, the smash charge. X "starts a combo" if some Y connects that way.
//  REC    a floating island (a solid block 1000 wide, like the tower's floors) in the 'teams' physics (no floor under the world): the fighter starts still
//         off the island with the double jump spent / unspent and tries timed sequences of its tools (jump, up-special, special, down-special, smash,
//         finisher; steering at the island all the way). Bisection finds the furthest it can start BESIDE the ledge (level with the top) and the deepest
//         BELOW it (30 px out) and still land on top. The same two numbers for a plain fighter are the baseline. Also each tool alone in open air:
//         apex gained, height saved against falling, and sideways gain.
//  SPEC   each special's reach on the foe (damage, lock, push) at four gaps, what it changes on the fighter itself, and whether a hit on the user is
//         answered (counters). A special is given a ROLE if it: starts or joins a combo (combo), KOs at <= 150% (kill), or lifts/pushes the fighter (recover).
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as os from 'node:os';
import { readFileSync, writeFileSync } from 'node:fs';
import { bootMonolith } from '../test/helpers/smash-golden.js';

const SELF = fileURLToPath(import.meta.url);
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => { if (x.startsWith('--')) a.push([x.slice(2), (arr[i + 1] && !arr[i + 1].startsWith('--')) ? arr[i + 1] : '1']); return a; }, []));

const MOVES = ['jab', 'utilt', 'dtilt', 'finisher', 'special', 'upspecial', 'downspecial', 'smash', 'smashup', 'smashdown'];
const COMBO_X = ['jab', 'utilt', 'dtilt', 'finisher', 'special', 'upspecial', 'downspecial', 'smash'];
const COMBO_Y = ['jab', 'utilt', 'dtilt', 'finisher', 'special', 'upspecial', 'downspecial', 'smash'];
const KO_GAPS = [40, 55, 70, 90, 120, 160];
const COMBO_GAPS = [44, 60, 80, 105, 140, 190];
const COMBO_PCTS = [0, 40, 80];
const COMBO_DELAYS = [2, 5, 8, 11, 14, 17, 20, 23];
const KILL_LIMIT = 150;   // "a fighter whose best kill move needs over about 150%" (the brief)

// ---------------------------------------------------------------------------------------------------------------------------------
// Everything below runs INSIDE the game's window. No gameplay is touched: it builds fighters, throws the same functions the input block throws, and reads.
// ---------------------------------------------------------------------------------------------------------------------------------
const INSTALL = `
var KR = {};
(function(){
  updateHUD = function(){}; updateStandings = function(){};
  KR.none = function(){ return { left:false, right:false, up:false, down:false, jump:false, attack:false, special:false, smash:false }; };
  KR.seed = function(a){ Math.random = function(){ a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  KR.DUMMY = { name:'Dummy', color:'#999999', w:90, kit:{ special:'basic' }, play:true };
  KR.row = function(n){ return n === 'Dummy' ? KR.DUMMY : ROSTER.find(function(r){ return r.name === n; }); };
  KR.clear = function(){
    worldPlats = worldPlats || []; summons = []; projectiles = []; beams = []; tendrils = []; items = []; particles = []; impactFxClear(); hazardT = 0; BOSS_ARENA = null; evil = null;
    for (var k in down) delete down[k];
    running = true; paused = false; lastKoFrame = 0;
  };
  // Goiky Field, 1v1 free-for-all, the 1100 x 720 world
  KR.arena = function(){
    SETTINGS.mode = 'ffa'; SETTINGS.count = 2; SETTINGS.items = false; SETTINGS.itemRate = 0; SETTINGS.stocks = 9;
    stage = STAGES.find(function(s){ return s.id === 'goiky'; });
    resize(); setupWorld(); KR.clear();
  };
  // A floating island: the 'teams' physics have no floor under the world (a fall is a KO) and floors are solid blocks. One block, 1000 wide, top at 700.
  KR.IS = { x0:1000, x1:2000, top:700 };
  KR.island = function(){
    SETTINGS.mode = 'teams'; SETTINGS.count = 2; SETTINGS.items = false; SETTINGS.itemRate = 0; SETTINGS.stocks = 9; SETTINGS.teamKey = '';
    stage = STAGES.find(function(s){ return s.id === 'goiky'; });
    resize(); setupWorld();
    WW = 3000; WH = 1500; camX = 0; camY = 0;
    worldPlats = [{ x:KR.IS.x0, y:KR.IS.top, w:KR.IS.x1 - KR.IS.x0, h:46, solid:true, floor:0 }]; bases = []; floors = []; worldZones = []; spawnZones = [];
    KR.clear();
  };
  KR.mk = function(name, x, y, idx, ctrl){
    var f = makeFighter(KR.row(name), x, y, idx);
    f.team = idx; f.controller = ctrl; f.you = false; f.stocks = 9; f.invuln = 0; f.face = idx === 0 ? 1 : -1; return f;
  };
  KR.zero = function(A, D){
    [A, D].forEach(function(f){ if (!f) return; f.invuln = 0; f.hitstun = 0; f.atkCd = 0; f.spCd = 0; f.smCd = 0; f.fnCd = 0; f._graceLeft = 0; f._chain = 0; f._chainBy = -1; f._chainSeq = -1; });
  };
  // one move, through the door the input block uses, with the cooldown it sets. Returns false when the fighter could not act.
  KR.fire = function(f, mv, dir){
    if (f.hitstun > 0 || f.frozen > 0 || f.dead) return false;
    var i = KR.none(); if (dir) { i.right = dir > 0; i.left = dir < 0; }
    switch (mv) {
      case 'jab':   if (f.atkCd > 0) return false; f._confirm = 0; doAttack(f);   f.atkCd = f._confirm ? 12 : 22; return true;
      case 'utilt': if (f.atkCd > 0) return false; f._confirm = 0; doUpTilt(f);   f.atkCd = f._confirm ? 12 : 24; return true;
      case 'dtilt': if (f.atkCd > 0) return false; f._confirm = 0; doGroundMove(f); f.atkCd = f._confirm ? 16 : 26; return true;
      case 'finisher': if (f.fnCd > 0) return false; doAttackSpecial(f); f.fnCd = ATKSPECIALS[f.kit && f.kit.special] ? FIN_CD : FIN_CD_SHARED; return true;
      case 'special': if (f.spCd > 0) return false; fireSpecial(f, i); return true;
      case 'upspecial': if (f.spCd > 0) return false; i.up = true; fireSpecial(f, i); return true;
      case 'downspecial': if (f.spCd > 0) return false; i.down = true; fireSpecial(f, i); return true;
      case 'smash': if (f.smCd > 0) return false; fireSmash(f, i, 0); return true;
      case 'smashup': if (f.smCd > 0) return false; i.up = true; fireSmash(f, i, 1); return true;
      case 'smashdown': if (f.smCd > 0) return false; i.down = true; fireSmash(f, i, -1); return true;
    }
    return false;
  };
  KR.lock = function(t){ return (t.hitstun > 0 || t.frozen > 0 || t.rooted > 0) ? 1 : 0; };

  // ---------------- KO ----------------
  KR.ko = function(name, mv, air, gap, pct, maxF){
    KR.seed(11); KR.arena();
    var gy = groundY(), y = air ? gy - 260 : gy - 24;
    var A = KR.mk(name, 550, y, 0, 'still'), D = KR.mk('Dummy', 550 + gap, y, 1, 'still');
    fighters = [A, D];
    if (!air) { A.onground = true; D.onground = true; step(); }
    else { A.onground = false; D.onground = false; }
    KR.zero(A, D); A.pct = 0; D.pct = pct; D.stocks = 9;
    var fired = KR.fire(A, mv, 0);
    var r = { fired:fired, hit:false, ko:false, byCap:false, dmg:0, frame:-1 }, quiet = 0;
    for (var t = 0; t < maxF; t++) {
      step();
      if (D.pct > pct + 1e-9) r.hit = true;
      if (D.stocks < 9) { r.ko = true; r.byCap = D.pct >= D.koCap - 1e-9; r.frame = t; break; }
      if (D.dead) { r.ko = true; r.frame = t; break; }
      if (t > 50 && D.onground && Math.abs(D.vx) < 0.2 && !projectiles.length && !summons.length && D.hitstun <= 0) { if (++quiet > 20) break; } else quiet = 0;
    }
    r.dmg = Math.max(0, D.pct - pct);
    return r;
  };

  // ---------------- COMBO ----------------
  // One timeline. X at frame 0; Y (or null) at frame d (a smash at d + its real charge); approach: 0 stand, 1 walk at the foe, 2 jump at the foe.
  KR.combo = function(name, X, pct, gap, Y, d, appr, post){
    KR.seed(13); KR.arena();
    var gy = groundY();
    var A = KR.mk(name, 500, gy - 24, 0, 'local'), D = KR.mk('Dummy', 500 + gap, gy - 24, 1, 'still');
    fighters = [A, D]; A.onground = true; D.onground = true; step();
    KR.zero(A, D); A.pct = 0; D.pct = pct; D.stocks = 9; for (var k in down) delete down[k];
    if (KR.PRE) { KR.fire(A, KR.PRE, 0); for (var q = 0; q < 8; q++) step(); A.hitstun = 0; D.pct = pct; KR.zero(A, D); }   // --pre: a buff thrown first (Silver Spoon's gold), then the string
    var fireT = Y ? (Y === 'smash' ? d + smashFullOf(A) : d) : -1;
    var T = (Y ? fireT : 8) + (post || 40);
    var cum = [], lock = [], chain = [], vx = [], dmgFirst = -1, lockMax = 0, firedY = false, firedX = false;
    var guard = 0;
    for (var t = 0; t < T; t++) {
      down[KEYS.right] = (appr >= 1 && t < d); down[KEYS.jump] = (appr === 2 && t === 1);
      if (t === 0) firedX = KR.fire(A, X, 0);
      if (t === fireT) firedY = KR.fire(A, Y, 0);
      step();
      var c = D.pct - pct; cum.push(+c.toFixed(4)); lock.push(KR.lock(D)); chain.push(D._chain || 0); vx.push(Math.abs(D.vx) + Math.abs(D.vy));
      if (dmgFirst < 0 && c > 0) dmgFirst = t;
      if (D.stocks < 9) break;
    }
    var out = { cum:cum, lock:lock, chain:chain, firedX:firedX, firedY:firedY, fireT:fireT, dmgFirst:dmgFirst, kbx:D.vx, kby:D.vy };
    for (var k2 in down) delete down[k2];
    return out;
  };
  // gap scan for X: which gaps does it affect the dummy at (damage or lock)?
  KR.reach = function(name, X, gaps){
    var ok = [];
    gaps.forEach(function(g){ var r = KR.combo(name, X, 40, g, null, 0, 0, 30); var lk = 0; r.lock.forEach(function(v){ lk += v; });
      var dm = r.cum.length ? r.cum[r.cum.length - 1] : 0; if (dm > 0 || lk > 0) ok.push({ gap:g, dmg:dm, lock:lk }); });
    return ok;
  };
  // The full combo grid for one X at one % and one gap/approach: base timeline once, then every Y and delay.
  KR.comboGrid = function(name, X, pct, gap, ds, ys){
    var res = { links:[], base:null }, apprs = [0, 1, 2];
    apprs.forEach(function(ap){
      var base = KR.combo(name, X, pct, gap, null, 0, ap, 40);
      if (ap === 0) { var lk = 0; base.lock.forEach(function(v){ lk += v; }); res.base = { dmg:base.cum[base.cum.length - 1] || 0, lockFrames:lk, kb:+(Math.abs(base.kbx) + Math.abs(base.kby)).toFixed(1), firedX:base.firedX }; }
      if (!base.firedX) return;
      ys.forEach(function(Y){
        ds.forEach(function(d){
          var v = KR.combo(name, X, pct, gap, Y, d, ap, 40);
          if (!v.firedY) return;
          var k = -1;
          for (var t = Math.max(0, v.fireT); t < v.cum.length; t++) { var b = t < base.cum.length ? base.cum[t] : base.cum[base.cum.length - 1]; if (v.cum[t] > b + 1e-6) { k = t; break; } }
          if (k < 0) return;
          var prevLock = k > 0 ? v.lock[k - 1] : 0, chainUp = v.chain[k] > (k > 0 ? v.chain[k - 1] : 0);
          if (prevLock || chainUp) res.links.push({ Y:Y, d:d, ap:ap, hitAt:k, via: chainUp ? 'chain' : 'lock' });
        });
      });
    });
    return res;
  };

  // ---------------- RECOVERY ----------------
  // tools: J jump, U up-special, N special, D down-special, S smash, F finisher. A sequence is [[tool, frame], ...].
  KR.tool = function(A, tool, t) {
    var dir = 1;
    if (tool === 'J') { down[KEYS.jump] = true; return; }
    if (tool === 'U') KR.fire(A, 'upspecial', dir);
    else if (tool === 'N') KR.fire(A, 'special', dir);
    else if (tool === 'D') KR.fire(A, 'downspecial', dir);
    else if (tool === 'S') KR.fire(A, 'smash', dir);
    else if (tool === 'F') KR.fire(A, 'finisher', dir);
  };
  // jumpsLeft 0 or 1; start (sx, sy); returns 1 if the fighter stands on the island at the end.
  KR.rec = function(name, jumpsLeft, sx, sy, seq, T){
    KR.seed(17); KR.island();
    var A = KR.mk(name, sx, sy, 0, 'local'), Dm = KR.mk('Dummy', 2900, 100, 1, 'still');
    fighters = [A, Dm]; A.onground = false; A.jumps = jumpsLeft; A._usedAirSpecial = false; A.vx = 0; A.vy = 0; A.face = 1; KR.zero(A, Dm);
    Dm.invuln = 9999; Dm.x = 2900; Dm.y = 100;
    var IS = KR.IS, standing = false, doneT = -1, minY = sy;
    for (var t = 0; t < T; t++) {
      for (var k in down) delete down[k];
      down[KEYS.right] = true;
      for (var q = 0; q < seq.length; q++) if (seq[q][1] === t) KR.tool(A, seq[q][0], t);
      if (A.hitstun > 0) {}
      step();
      Dm.x = 2900; Dm.y = 100; Dm.vx = 0; Dm.vy = 0;
      if (A.y < minY) minY = A.y;
      if (A.stocks < 9 || A.dead) return { ok:0, dead:1 };
      if (A.onground && A.x >= IS.x0 - 4 && A.x <= IS.x1 + 4 && A.y <= IS.top - A.r + 2) { standing = true; doneT = t; break; }
      if (A.y > IS.top + 900) return { ok:0, dead:1 };
    }
    for (var k3 in down) delete down[k3];
    return { ok: standing ? 1 : 0, t:doneT, minY:minY };
  };
  // Each tool alone, in open air with the jump spent, steering right: how far does it carry the fighter compared with doing nothing?
  KR.openAir = function(name, tool, jumpsLeft) {
    var res = {}, runs = {};
    ['null', tool].forEach(function(which){
      KR.seed(19); KR.island(); WH = 6000;
      var A = KR.mk(name, 0, 300, 0, 'local'), Dm = KR.mk('Dummy', 2900, 100, 1, 'still');
      fighters = [A, Dm]; A.onground = false; A.jumps = jumpsLeft; A._usedAirSpecial = false; A.vx = 0; A.vy = 0; A.face = 1; KR.zero(A, Dm); Dm.invuln = 9999;
      var xs = [], ys = [], used = false;
      for (var t = 0; t < 100; t++) {
        for (var k in down) delete down[k];
        down[KEYS.right] = true;
        if (which !== 'null' && t === 2) { KR.tool(A, tool, t); used = true; }
        step(); Dm.x = 2900; Dm.y = 100; Dm.vx = 0; Dm.vy = 0;
        xs.push(A.x); ys.push(A.y);
        if (A.stocks < 9) break;
      }
      runs[which] = { xs:xs, ys:ys };
    });
    var N = runs['null'], R = runs[tool], n = Math.min(N.xs.length, R.xs.length), apex = 0, saved = 0, dx = 0, savedAt = 0;
    for (var t2 = 0; t2 < n; t2++) {
      apex = Math.max(apex, 300 - R.ys[t2]);
      dx = Math.max(dx, R.xs[t2] - N.xs[t2]);
      if (N.ys[t2] - R.ys[t2] > saved) { saved = N.ys[t2] - R.ys[t2]; }
    }
    var s60 = n > 60 ? N.ys[60] - R.ys[60] : saved;
    return { apex:+apex.toFixed(0), saved60:+s60.toFixed(0), dx:+dx.toFixed(0), frames:R.xs.length };
  };

  // ---------------- SPECIAL EFFECT ----------------
  // One special (or the finisher) at one gap: what it does to the foe and to the fighter over 140 frames. mode: 'static' (a foe standing still), 'walk' (a foe that walks
  // at the fighter from 220 px out, so a trap or a mine goes off), 'react' (the foe throws a jab at frame 6: a counter stance answers it).
  KR.IGN = /^(x|y|vx|vy|flash|_atk|_hurt|_land|aiTimer|atkCd|spCd|smCd|fnCd|_sp|_aiSpGap|_lastX|_stuck|_face|face|_confirm|_pb|hitstun|_rig|onground|r$|pct|_dmg|_inLeft|_inRight|_inUp|_inDown|_jp|_drop|_usedAirSpecial|_smAngle|_comboTok|_swing|_ticks|_chain|jumps|_falls|lastHit|stocks|invuln|_lg|_graceLeft|_lvy)/;
  KR.IGND = /^(x|y|vx|vy|flash|_hurt|hitstun|pct|invuln|_graceLeft|_graceBy|_graceTok|_chain|_dmg|onground|face|jumps|aiTimer|_lg|_lvy|_atk|atkCd|spCd|smCd|fnCd|_sp|lastHit|_falls|stocks|_land|_lastX|_stuck|_jp|_drop|r$|_smAngle|_comboTok|_swing|_confirm|_pb|_rig|_inLeft|_inRight|_inUp|_inDown|_usedAirSpecial)/;
  KR.fx = function(name, mv, gap, mode){
    KR.seed(23); KR.arena();
    var gy = groundY();
    var A = KR.mk(name, 500, gy - 24, 0, 'still'), D = KR.mk('Dummy', 500 + gap, gy - 24, 1, 'still');
    fighters = [A, D]; A.onground = true; D.onground = true; step(); KR.zero(A, D); A.pct = 0; D.pct = 40; D.stocks = 9;
    var snap = {}; for (var k in A) { var v = A[k]; if (typeof v === 'number' || typeof v === 'boolean') snap[k] = v; }
    var snapD = {}; for (var kd in D) { var vd = D[kd]; if (typeof vd === 'number' || typeof vd === 'boolean') snapD[kd] = vd; }
    var seenD = {};
    var fired = KR.fire(A, mv, 0);
    var dmg = 0, lock = 0, push = 0, ko = false, dx0 = D.x, y0 = A.y, apex = 0, aPct0 = A.pct, seen = {}, projMax = 0, sumMax = 0, hit1 = -1, d1 = 0;
    for (var t = 0; t < 140; t++) {
      if (mode === 'react' && t === 6) { D.face = -1; D.atkCd = 0; doAttack(D); }
      if (mode === 'walk' && D.x - A.x > 40 && !KR.lock(D) && D.hitstun <= 0) D.x -= 2.5;
      step();
      if (D.pct - 40 > dmg) dmg = D.pct - 40;
      if (hit1 < 0 && D.pct > 40) { hit1 = t; d1 = D.pct - 40; }
      lock += KR.lock(D);
      push = Math.max(push, Math.abs(D.x - dx0));
      if (D.stocks < 9) ko = true;
      apex = Math.max(apex, y0 - A.y);
      projMax = Math.max(projMax, projectiles.length); sumMax = Math.max(sumMax, summons.length);
      for (var k2 in snap) { if (KR.IGN.test(k2) || seen[k2] !== undefined) continue; var nv = A[k2]; if (nv !== snap[k2]) seen[k2] = typeof nv === 'number' ? +nv.toFixed(2) : nv; }
      for (var k4 in snapD) { if (KR.IGND.test(k4) || seenD[k4] !== undefined) continue; var nd = D[k4]; if (nd !== snapD[k4]) seenD[k4] = typeof nd === 'number' ? +nd.toFixed(2) : nd; }
    }
    var diff = []; for (var k3 in seen) diff.push(k3 + ':' + seen[k3]);
    var foe = []; for (var k5 in seenD) foe.push(k5 + ':' + seenD[k5]);
    return { fired:fired, dmg:+dmg.toFixed(1), lock:lock, push:+push.toFixed(0), ko:ko, apex:+apex.toFixed(0), selfPct:+(A.pct - aPct0).toFixed(1), diff:diff.slice(0, 12), foe:foe.slice(0, 12), projs:projMax, summons:sumMax, hit1:hit1 };
  };
  // A stance that answers a hit (counters): the foe jabs at frame 6, the fighter's answer lands on it. KO by pct, lock, and whether a follow-up lands inside the lock.
  KR.react = function(name, mv, pct, Y, d){
    KR.seed(29); KR.arena();
    var gy = groundY();
    var A = KR.mk(name, 500, gy - 24, 0, 'local'), D = KR.mk('Dummy', 550, gy - 24, 1, 'still');
    fighters = [A, D]; A.onground = true; D.onground = true; step(); KR.zero(A, D); A.pct = 0; D.pct = pct; D.stocks = 9;
    for (var k in down) delete down[k];
    KR.fire(A, mv, 0);
    var hitT = -1, ko = false, lockN = 0, linked = false, firedY = false;
    for (var t = 0; t < 120; t++) {
      if (t === 6) { D.face = -1; D.atkCd = 0; doAttack(D); }
      if (Y && hitT >= 0 && t === hitT + d) { firedY = KR.fire(A, Y, 0); }
      var before = D.pct, lockPrev = KR.lock(D), chainPrev = D._chain || 0;
      step();
      if (hitT < 0 && D.pct > before + 1e-9 && t >= 6) { hitT = t; }
      else if (firedY && D.pct > before + 1e-9 && (lockPrev || (D._chain || 0) > chainPrev)) linked = true;
      lockN += KR.lock(D);
      if (D.stocks < 9) { ko = true; break; }
    }
    return { hit: hitT >= 0, ko: ko, lock: lockN, linked: linked };
  };
  // The same KO test as KR.ko, with a special thrown first (a buff or a stance), eight frames before the move.
  KR.koPre = function(name, pre, mv, gap, pct){
    KR.seed(11); KR.arena();
    var gy = groundY();
    var A = KR.mk(name, 550, gy - 24, 0, 'still'), D = KR.mk('Dummy', 550 + gap, gy - 24, 1, 'still');
    fighters = [A, D]; A.onground = true; D.onground = true; step(); KR.zero(A, D); A.pct = 0; D.pct = pct; D.stocks = 9;
    KR.fire(A, pre, 0);
    for (var t = 0; t < 8; t++) step();
    A.hitstun = 0; D.pct = pct; D.invuln = 0;
    var fired = KR.fire(A, mv, 0), hit = false, ko = false;
    for (var t2 = 0; t2 < 260; t2++) { step(); if (D.pct > pct + 1e-9) hit = true; if (D.stocks < 9) { ko = true; break; } }
    return { fired:fired, hit:hit, ko:ko };
  };
  KR.own = function(name){ var k = KR.row(name).kit.special; return { up: !!(UPSPEC[k] || UPSPECIALS[k]), down: !!DOWNSPECIALS[k], fin: !!ATKSPECIALS[k], smash: !!(SMASH_SPEC[k] || SMASHES[k]) }; };
})();
`;

const MOVE_ORDER = MOVES;

// ---------------------------------------------------------------------------------------------------------------------------------
// The node side: drives the probes for one fighter at a time.
// ---------------------------------------------------------------------------------------------------------------------------------
const ev = (w, code) => JSON.parse(w.eval('JSON.stringify(' + code + ')'));

function koProbe(w, name) {
  const out = {};
  for (const air of [false, true]) {
    for (const mv of MOVES) {
      const key = (air ? 'a:' : '') + mv;
      let any = false, best = null, fired = false, lastDmg = 0;
      // scan: 0..230 step 10, over every gap; then refine the first KO bracket by 2
      let firstKo = null;
      for (let p = 0; p <= 230 && firstKo === null; p += 10) {
        for (const g of KO_GAPS) {
          const r = ev(w, `KR.ko(${JSON.stringify(name)}, ${JSON.stringify(mv)}, ${air}, ${g}, ${p}, 260)`);
          fired = fired || r.fired; if (r.hit) { any = true; lastDmg = Math.max(lastDmg, r.dmg); }
          if (r.ko) { firstKo = { p, gap: g, byCap: r.byCap }; break; }
        }
        if (!fired) break;
      }
      if (firstKo !== null) {
        let lo = Math.max(0, firstKo.p - 9);
        for (let p = lo; p < firstKo.p; p += 2) {
          let hit = false;
          for (const g of KO_GAPS) { const r = ev(w, `KR.ko(${JSON.stringify(name)}, ${JSON.stringify(mv)}, ${air}, ${g}, ${p}, 260)`); if (r.ko) { firstKo = { p, gap: g, byCap: r.byCap }; hit = true; break; } }
          if (hit) break;
        }
        best = firstKo;
      }
      out[key] = { hits: any, dmg: +lastDmg.toFixed(1), ko: best ? best.p : null, gap: best ? best.gap : null, byCap: best ? best.byCap : false };
    }
  }
  return out;
}

function comboProbe(w, name) {
  const out = {};
  for (const X of COMBO_X) {
    const reach = ev(w, `KR.reach(${JSON.stringify(name)}, ${JSON.stringify(X)}, ${JSON.stringify(COMBO_GAPS)})`);
    const row = { reaches: reach.length, byPct: {} };
    if (reach.length) {
      // up to three gaps: nearest, middle, farthest of the ones it affects
      const pick = [...new Set([0, Math.floor((reach.length - 1) / 2), reach.length - 1])].map((i) => reach[i].gap);
      for (const pct of COMBO_PCTS) {
        const links = [], bases = [];
        for (const g of pick) {
          const r = ev(w, `KR.comboGrid(${JSON.stringify(name)}, ${JSON.stringify(X)}, ${pct}, ${g}, ${JSON.stringify(COMBO_DELAYS)}, ${JSON.stringify(COMBO_Y)})`);
          bases.push(r.base); for (const l of r.links) links.push({ ...l, gap: g });
        }
        const ys = {};
        for (const l of links) { const k = l.Y; (ys[k] = ys[k] || { n: 0, d: [] }).n++; if (!ys[k].d.includes(l.d)) ys[k].d.push(l.d); }
        row.byPct[pct] = { starts: links.length > 0, ys, base: bases[0] };
      }
    }
    out[X] = row;
  }
  return out;
}

const TOOLS_ALL = ['J', 'U', 'N', 'D', 'S', 'F'];
function sequencesFor(tools) {
  const firsts = [0, 20, 45], gaps = [1, 20];
  const seqs = [];
  const perm = (cur, left, depth) => {
    if (cur.length) seqs.push(cur.slice());
    if (cur.length >= depth) return;
    for (const t of left) perm([...cur, t], left.filter((x) => x !== t), depth);
  };
  perm([], tools, tools.length <= 4 ? 3 : 2);
  if (tools.includes('N')) seqs.push(['N', 'N']);
  const out = [];
  for (const s of seqs) {
    const timeSets = [[]];
    for (let i = 0; i < s.length; i++) {
      const choices = i === 0 ? firsts : gaps;
      const next = [];
      for (const ts of timeSets) for (const c of choices) next.push([...ts, i === 0 ? c : ts[ts.length - 1] + c]);
      timeSets.length = 0; timeSets.push(...next);
    }
    for (const ts of timeSets) out.push(s.map((tool, i) => [tool, ts[i]]));
  }
  return out;
}

function recProbe(w, name, onlyTools) {
  const IS = { x0: 1000, top: 700 };
  const out = { open: {}, base: null };
  const openAirs = {};
  for (const tool of TOOLS_ALL) { openAirs[tool] = ev(w, `KR.openAir(${JSON.stringify(name)}, ${JSON.stringify(tool)}, ${tool === 'J' ? 1 : 0})`); }
  out.open = openAirs;
  const nullOpen = null;
  const active = TOOLS_ALL.filter((t) => (!onlyTools || onlyTools.includes(t)) && (t === 'J' || openAirs[t].apex >= 12 || openAirs[t].saved60 >= 25 || openAirs[t].dx >= 25));
  out.active = active;
  const measure = (jl, tools) => {
    const seqs = sequencesFor(jl ? tools : tools.filter((t) => t !== 'J'));
    let lastGood = 0;
    const tryPoint = (sx, sy) => {
      const order = lastGood < seqs.length ? [seqs[lastGood], ...seqs.filter((_, i) => i !== lastGood)] : seqs;
      for (let i = 0; i < order.length; i++) {
        const r = ev(w, `KR.rec(${JSON.stringify(name)}, ${jl}, ${sx}, ${sy}, ${JSON.stringify(order[i])}, 240)`);
        if (r.ok) { lastGood = seqs.indexOf(order[i]); return order[i]; }
      }
      return null;
    };
    const bis = (lo, hi, mk) => {   // largest v in [lo, hi] that works (assume monotone); lo must work (or returns -1)
      let bestSeq = null;
      const s0 = tryPoint(...mk(lo)); if (!s0) return { v: -1, seq: null };
      bestSeq = s0;
      if (tryPoint(...mk(hi))) return { v: hi, seq: bestSeq };
      for (let i = 0; i < 7; i++) { const mid = Math.round((lo + hi) / 2); const s = tryPoint(...mk(mid)); if (s) { lo = mid; bestSeq = s; } else hi = mid; }
      return { v: lo, seq: bestSeq };
    };
    // beside: level with the top (feet on the top line), v px left of the ledge. Below: 30 px left of the ledge, v px under the top line.
    const beside = bis(0, 1000, (v) => [IS.x0 - v - 24, IS.top - 24]);
    const below = bis(0, 900, (v) => [IS.x0 - 30, IS.top - 24 + v]);
    const above = bis(0, 1000, (v) => [IS.x0 - v - 24, IS.top - 24 - 200]);   // 200 above the top line: lets a fighter be launched high and far
    return { beside: beside.v, besideSeq: beside.seq, below: below.v, belowSeq: below.seq, high: above.v };
  };
  out.jumpSpent = measure(0, active);
  out.jumpLeft = measure(1, active);
  return out;
}

function specProbe(w, name) {
  const out = { own: ev(w, `KR.own(${JSON.stringify(name)})`) };
  const J = (x) => JSON.stringify(x);
  for (const mv of ['special', 'upspecial', 'downspecial', 'finisher']) {
    const gaps = [50, 100, 170, 280];
    const runs = gaps.map((g) => ev(w, `KR.fx(${J(name)}, ${J(mv)}, ${g}, 'static')`));
    const pushStatic = Math.max(...runs.map((r) => r.push));
    runs.push(ev(w, `KR.fx(${J(name)}, ${J(mv)}, 220, 'walk')`), ev(w, `KR.fx(${J(name)}, ${J(mv)}, 80, 'walk')`));
    const react = ev(w, `KR.fx(${J(name)}, ${J(mv)}, 50, 'react')`);
    const row = {
      fired: runs.some((r) => r.fired), dmg: Math.max(...runs.map((r) => r.dmg)), lock: Math.max(...runs.map((r) => r.lock)), push: pushStatic,
      ko: runs.some((r) => r.ko), apex: Math.max(...runs.map((r) => r.apex)), self: Math.max(...runs.map((r) => r.selfPct)), diff: [...new Set(runs.flatMap((r) => r.diff).concat(react.diff))].slice(0, 12),
      foe: [...new Set(runs.flatMap((r) => r.foe))].slice(0, 12), projs: Math.max(...runs.map((r) => r.projs)), summons: Math.max(...runs.map((r) => r.summons)),
      reactDmg: react.dmg, reactHit1: react.hit1,
    };
    // a stance that answers a hit: how hard, can it kill, can it be followed up
    if (react.dmg > row.dmg + 0.5) {
      let koPct = null;
      for (let p = 0; p <= 230 && koPct === null; p += 10) if (ev(w, `KR.react(${J(name)}, ${J(mv)}, ${p}, null, 0)`).ko) koPct = p;
      const links = [];
      for (const Y of ['jab', 'utilt', 'dtilt', 'special', 'finisher', 'smash']) for (const d of [2, 5, 8]) if (ev(w, `KR.react(${J(name)}, ${J(mv)}, 40, ${J(Y)}, ${d})`).linked) { links.push(Y); break; }
      row.counter = { dmg: react.dmg, ko: koPct, links };
    }
    // a buff or a stance on the fighter itself: does the next move kill sooner
    if ((row.diff.some((d) => /empower|haste|star|bullet|buff|fury|rage|charge|speed/i.test(d)) || (row.dmg === 0 && row.foe.length)) && !row.ko) {
      const bestKo = {};
      for (const m2 of ['jab', 'utilt', 'smash', 'finisher']) {
        let first = null;
        for (let p = 0; p <= 230 && first === null; p += 10) for (const g of [40, 70, 120]) if (ev(w, `KR.koPre(${J(name)}, ${J(mv)}, ${J(m2)}, ${g}, ${p})`).ko) { first = p; break; }
        bestKo[m2] = first;
      }
      row.buffedKo = bestKo;
    }
    out[mv] = row;
  }
  return out;
}

async function oneFighter(name, skip) {
  const w = bootMonolith(5);
  const t0 = Date.now();
  try {
    await w.eval('profileReady');
    Object.defineProperty(w, 'innerWidth', { value: 1100, configurable: true }); Object.defineProperty(w, 'innerHeight', { value: 720, configurable: true });
    w.eval(INSTALL);
    const row = ev(w, `(function(){ var r = ROSTER.find(function(x){ return x.name === ${JSON.stringify(name)}; }); return { name:r.name, w:r.w, special:r.kit.special, desc:r.kit.desc||'', arch:r.arch||'' }; })()`);
    const res = { name, w: row.w, kit: row.special, desc: row.desc, arch: row.arch };
    const safe = (key, fn) => { if (skip.has(key)) return; try { res[key] = fn(); } catch (e) { res[key + 'Error'] = String(e && e.message || e).split('\n')[0]; } };
    safe('ko', () => koProbe(w, name));
    safe('combo', () => comboProbe(w, name));
    safe('rec', () => recProbe(w, name));
    safe('spec', () => specProbe(w, name));
    res.ms = Date.now() - t0;
    return res;
  } finally { try { w.close(); } catch {} }
}

async function rosterNames() {
  const w = bootMonolith(5);
  await w.eval('profileReady');
  const n = JSON.parse(w.eval('JSON.stringify(ROSTER.filter(function(r){ return r.play && !r.prize && !r.boss; }).map(function(r){ return r.name; }))'));
  w.close();
  return n;
}

async function baseline(skip) {
  // the plain fighter: kit 'basic', weight 90, no special at all. Registered as a roster row for the run so every probe can build it.
  const w = bootMonolith(5);
  try {
    await w.eval('profileReady');
    Object.defineProperty(w, 'innerWidth', { value: 1100, configurable: true }); Object.defineProperty(w, 'innerHeight', { value: 720, configurable: true });
    w.eval(INSTALL);
    const res = { name: 'Dummy', w: 90, kit: 'basic' };
    if (!skip.has('rec')) { res.rec = recProbe(w, 'Dummy'); res.recJumpOnly = recProbe(w, 'Dummy', ['J']); }   // the plain fighter (the engine's default hop up-special), and one with the jump alone
    if (!skip.has('ko')) res.ko = koProbe(w, 'Dummy');
    return res;
  } finally { try { w.close(); } catch {} }
}

if (args.pre) {   // --pre "Silver Spoon:special": the combo probe with that special thrown first (a buff); prints which openers start a string
  const [pn, pm] = args.pre.split(':');
  const w = bootMonolith(5);
  await w.eval('profileReady');
  Object.defineProperty(w, 'innerWidth', { value: 1100, configurable: true }); Object.defineProperty(w, 'innerHeight', { value: 720, configurable: true });
  w.eval(INSTALL); w.eval(`KR.PRE = ${JSON.stringify(pm)}`);
  const c = comboProbe(w, pn);
  for (const X of Object.keys(c)) console.log(X.padEnd(12), Object.entries(c[X].byPct || {}).map(([p, b]) => `${p}%:${b.starts ? Object.entries(b.ys).map(([y, v]) => y + '(d<=' + Math.max(...v.d) + ')').join(',') : '-'}`).join('  '));
  w.close();
} else if (process.env.KR_WORKER) {
  const skip = new Set((process.env.KR_SKIP || '').split(',').filter(Boolean));
  process.on('message', async (name) => {
    if (name === 'done') process.exit(0);
    try { process.send(name === '__baseline' ? await baseline(skip) : await oneFighter(name, skip)); }
    catch (e) { process.send({ name, error: String(e && e.stack || e).split('\n').slice(0, 4).join(' | ') }); }
  });
} else if (args.report) {
  const { buildReport } = await import('./kit-roles-report.mjs');
  const data = JSON.parse(readFileSync(args.report, 'utf8'));
  buildReport(data, args.md || 'kit-roles');
} else {
  let names = await rosterNames();
  if (args.only) { const o = args.only.split(',').map((s) => s.trim()); names = names.filter((n) => o.includes(n)); }
  const skip = (args.skip || '').split(',').filter(Boolean);
  const jobs = Math.max(1, Math.min(names.length + 1, Number(args.procs || 4)));
  const queue = args.nobase ? names : ['__baseline', ...names];
  const results = {};
  let next = 0, done = 0;
  const t0 = Date.now();
  await Promise.all(Array.from({ length: jobs }, () => new Promise((resolve, reject) => {
    const child = fork(SELF, [], { env: Object.assign({}, process.env, { KR_WORKER: '1', KR_SKIP: skip.join(',') }) });
    try { os.setPriority(child.pid, os.constants.priority.PRIORITY_LOW); } catch {}   // Idle, as the owner's PC wants
    const feed = () => { if (next < queue.length) { child.send(queue[next++]); } else child.send('done'); };
    child.on('message', (r) => { results[r.name] = r; done++; console.log(`${done}/${queue.length} ${r.name}${r.error ? ' ERROR ' + r.error : ' ' + r.ms + 'ms'}  (${((Date.now() - t0) / 1000).toFixed(0)}s)`); feed(); });
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error('worker exited ' + code)));
    feed();
  })));
  if (args.out) writeFileSync(args.out, JSON.stringify({ made: new Date().toISOString().slice(0, 10), results }, null, 1) + '\n');
  console.log('done in ' + ((Date.now() - t0) / 1000).toFixed(0) + 's, ' + Object.keys(results).length + ' rows');
}
