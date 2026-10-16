import { describe, it, expect, beforeAll } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// MOVE ANIMATIONS (the owner, 2026-10-14: "give animations to all the moves"): every move of a converted fighter -- jab, the three tilts, the five aerials, the grab, the pummel,
// the four throws, the four specials, the smash and the finisher -- has a sequence of its own on the rig (limbs, body strip, face), made from the move's own numbers, and no two
// moves of a fighter share one. It is render-only: the frame-layer test plays whole matches with the frames drawn and stripped and finds the same ticks.
// Exceptions that keep their old frames on purpose: Puffball's X is her spit (the body does it), and she has no neutral air.
const FAKE = `window.__fake = function(sp){ sp._req = true; sp.img = { complete:true, naturalWidth:150, naturalHeight:200 }; }; true`;
const KITS = { Puffball: 'fly', Bow: 'chair', Pencil: 'van', Leafy: 'dash', Firey: 'ember', Pen: 'cap', Blocky: 'anvil', 'Ice Cube': 'shatter', Match: 'spark', Snowball: 'tackle', Pin: 'pierce', Bomby: 'bomb',
  Needle: 'counter', Flower: 'quake', 'Tennis Ball': 'serve', Teardrop: 'kick', Bubble: 'float', Rocky: 'barf', Coiny: 'slap', 'Golf Ball': 'zapshooter',
  Tree: 'timber', Roboty: 'antenna', David: 'seriously', Sidewalky: 'slam', Bell: 'ring', TV: 'static', Toothpaste: 'paste', Lollipop: 'sucker' };
const SLOTS = ['jab', 'ft', 'ut', 'dt', 'na', 'fa', 'ba', 'ua', 'da', 'side', 'grab', 'pummel', 'fthrow', 'bthrow', 'uthrow', 'dthrow', 'special', 'up', 'down', 'smash', 'finisher'];
const OLD_FRAMES = ['fly.jab', 'fly.na'];
let W, MVA, SPIT;   // SPIT: the moves whose kind is the spit (Firey's Ember Spit, Puffball's spit): the body swells and spits, which is its own frames already

beforeAll(() => {
  ({ window: W } = loadMonolith());
  W.eval(FAKE);
  MVA = JSON.parse(W.eval(`JSON.stringify(MVA)`));
  SPIT = JSON.parse(W.eval(`JSON.stringify((function(){ var o = []; ${JSON.stringify(Object.entries(KITS))}.forEach(function(kn){ ['jab','special','up','down','smash','finisher'].forEach(function(s){ if(animKindOf({ name:kn[0], kit:{ special:kn[1] } }, s) === 'spit') o.push(kn[1] + '.' + s); }); }); return o; })())`));
});

describe('every move has its own animation', () => {
  it('each converted fighter has an entry for every move it has, and its limbs are real', () => {
    const missing = [];
    for (const [name, kit] of Object.entries(KITS)) for (const s of SLOTS) {
      const id = `${kit}.${s}`;
      if (OLD_FRAMES.includes(id) || SPIT.includes(id)) { expect(MVA[id], id).toBeUndefined(); continue; }
      const m = MVA[id];
      if (!m) { missing.push(`${name} ${id}`); continue; }
      if (!m.limbs.length || m.limbs.some((e) => e.length !== 4 || e.some((v) => typeof v !== 'number' || !isFinite(v)))) missing.push(`${name} ${id}: bad limbs`);
      if (!(m.ki >= 10)) missing.push(`${name} ${id}: no strip of its own`);
    }
    expect(missing, missing.join(' ; ')).toEqual([]);
  });
  it('no two moves of a fighter share a sequence: limbs, body strip and face', () => {
    const rows = JSON.parse(W.eval(`JSON.stringify((function(){ var o = {}; Object.keys(MVA).forEach(function(id){ var k = MVA[id].ki; o[id] = FR_ATK.slice(k*42, k*42 + 42).concat(MVA_FACE.slice(k*6, k*6 + 6)); }); return o; })())`));
    const dup = [];
    for (const [name, kit] of Object.entries(KITS)) {
      const seen = new Map();
      for (const s of SLOTS) {
        const id = `${kit}.${s}`; if (!MVA[id]) continue;
        const sigLimbs = JSON.stringify(MVA[id].limbs), sigRows = JSON.stringify(rows[id]);
        if (seen.has(sigLimbs)) dup.push(`${name}: ${s} has the limbs of ${seen.get(sigLimbs)}`);
        if (seen.has(sigRows)) dup.push(`${name}: ${s} has the body of ${seen.get(sigRows)}`);
        seen.set(sigLimbs, s); seen.set(sigRows, s);
      }
    }
    expect(dup, dup.join(' ; ')).toEqual([]);
  });
  it('the limbs point where the move points: a fair ahead, an up-air up, a back-air behind, a down-air down, and every limb winds up away from its strike', () => {
    const bad = [], mid = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    for (const [name, kit] of Object.entries(KITS)) {
      const strike = (s) => { const m = MVA[`${kit}.${s}`]; return m ? mid(m.limbs[0][3]) : null; };
      const f = strike('fa'), u = strike('ua'), b = strike('ba'), d = strike('da'), ut = strike('ut');
      if (f != null && Math.abs(f) > 1.0) bad.push(`${name} fair strikes at ${f.toFixed(2)}`);
      if (u != null && !(u < -0.9)) bad.push(`${name} uair strikes at ${u.toFixed(2)}`);
      if (ut != null && !(ut < -0.5)) bad.push(`${name} utilt strikes at ${ut.toFixed(2)}`);
      if (b != null && Math.abs(b) < 2.0) bad.push(`${name} bair strikes at ${b.toFixed(2)}`);
      if (d != null && !(d > 0.5)) bad.push(`${name} dair strikes at ${d.toFixed(2)}`);
      for (const s of SLOTS) { const m = MVA[`${kit}.${s}`]; if (m) for (const e of m.limbs) if (Math.abs(mid(e[2] - e[3])) < 0.5) bad.push(`${name} ${s}: a limb barely moves (${e[2]} to ${e[3]})`); }
    }
    expect(bad, bad.join(' ; ')).toEqual([]);
  });
  it('a fighter with no arms moves its legs: Ice Cube, Match and Rocky-shaped rigs use pool 1 for every limb', () => {
    for (const s of SLOTS) { const m = MVA[`shatter.${s}`]; if (m) expect(m.limbs.some((e) => e[0] === 1), `Ice Cube ${s}`).toBe(true); }
    for (const s of SLOTS) { const m = MVA[`spark.${s}`]; if (m) expect(m.limbs.some((e) => e[0] === 1), `Match ${s}`).toBe(true); }
  });
});

describe('the moves are armed with their own label, and it goes out on the wire', () => {
  it('jab, tilts, aerials, side special, grab, pummel, throws, specials, smash and finisher each arm their id', () => {
    const got = JSON.parse(W.eval(`JSON.stringify((function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true; TESTMODE.active=false; worldPlats=[]; summons=[]; projectiles=[]; particles=[];
      var mk=function(n,x,i){ return makeFighter(ROSTER.find(function(r){return r.name===n;}), x, groundY()-24, i); };
      var A = mk('Firey', 400, 0), D = mk('Pen', 430, 1); A.team=0; D.team=1; A.controller='still'; D.controller='still'; fighters=[A,D]; step(); step();
      var fresh = function(){ A._mv=null; A._hold=null; A._gb=null; A.atkCd=0; A.spCd=0; A._lag=0; A._atkMove=null; A.onground=true; A.y=groundY()-24; A.vy=0; D._heldBy=null; D.invuln=0; D.hitstun=0; };
      var out = {};
      var tryit = function(id, fn){ fresh(); fn(); out[id] = A._atkMove; };
      tryit('ember.jab', function(){ doAttack(A); });
      ['ft','ut','dt'].forEach(function(k){ tryit('ember.'+k, function(){ mvStart(A, MOVESETS.ember[k], k); }); });
      ['na','fa','ba','ua','da'].forEach(function(k){ tryit('ember.'+k, function(){ A.onground=false; A.y-=120; mvStart(A, MOVESETS.ember[k], k); }); });
      tryit('ember.side', function(){ A._dirT = hazardT; fireSpecial(A, { right:true, side:true }); });
      tryit('ember.special', function(){ doSpecial(A); });
      tryit('ember.up', function(){ doUpSpecial(A); });
      tryit('ember.down', function(){ doDownSpecial(A); });
      tryit('ember.smash', function(){ doSmash(A); });
      tryit('ember.finisher', function(){ doAttackSpecial(A); });
      tryit('ember.grab', function(){ mvGrabStart(A); });
      fresh(); D.x = A.x + 40; D.y = A.y; holdStart(A, D, grabOf(A)); A._atkMove = null;
      A._hold.prev = { l:false, r:false, u:false, d:false, a:false };
      var H = A._hold; H.t = 20; H.pumCd = 0; holdTick(A, { attack:true, left:false, right:false, up:false, down:false, jump:false }); out['ember.pummel'] = A._atkMove;
      ['f','b','u','d'].forEach(function(k){ fresh(); D.x = A.x + 40; D.y = A.y; holdStart(A, D, grabOf(A)); A._atkMove = null; doThrow(A, D, k); out['ember.' + k + 'throw'] = A._atkMove; });
      A._atkAnim = 9; A._atkMove = 'ember.fa'; A._atkKind = 'throw';
      var wire = netFighter(A); out.wire = wire.swingMove;
      return out; })())`));
    for (const s of SLOTS) expect(got['ember.' + s], s).toBe('ember.' + s);
    expect(got.wire).toBe('ember.fa');
  });
});

describe('every move of every converted fighter draws, at six ticks of its swing, without a stray number', () => {
  it('drawFighter on each id: finite frames, and the strips differ between moves', () => {
    const r = W.eval(`(function(){
      SETTINGS.mode = 'ffa'; SETTINGS.count = 2; SETTINGS.itemRate = 0; running = true; startMatch();
      var out = [], strips = {};
      ${JSON.stringify(Object.entries(KITS))}.forEach(function(kn){
        var n = kn[0], kit = kn[1]; __fake(SPRITES[n]); window.cosOf = function(){ return null; };
        ${JSON.stringify(SLOTS)}.forEach(function(s){
          var id = kit + '.' + s; if(!MVA[id]) return;
          [0, 3, 6, 9, 12, 15].forEach(function(e){
            var f = makeFighter(ROSTER.find(function(r){ return r.name === n; }), 300, groundY() - 24, 1); f.you = false; f.controller = 'still'; fighters = [f]; hazardT = 100;
            try { armAtk(f, ATK_ANIM, 'punch', id); f._atkAnim = ATK_ANIM - e; f._atkPhase = atkPhase(f); f._atkProg = atkPhaseK(f); drawFighter(f); } catch(x){ out.push(id + ' #' + e + ': ' + x.message); }
            for (var k in _FP) if (typeof _FP[k] === 'number' && !isFinite(_FP[k])) out.push(id + ' #' + e + ' ' + k);
            if (e === 6) (strips[kit] = strips[kit] || []).push(_FP.rot + '|' + _FP.sx + '|' + _FP.sy + '|' + _FP.dx + '|' + _FP.spin);
          });
        });
      });
      var same = []; Object.keys(strips).forEach(function(k){ var a = strips[k]; if (new Set(a).size !== a.length) same.push(k); });
      return { out: out, same: same }; })()`);
    expect(r.out, r.out.join(' ; ')).toEqual([]);
    expect(r.same, 'two moves of ' + r.same.join(', ') + ' hold the same body at the hit').toEqual([]);
  });
});
