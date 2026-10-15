import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// Batch 1 of the moveset expansion (the owner, 2026-10-14): Puffball, Bow, Pencil and Leafy each have a side-, up- and down-tilt,
// five aerials, a grab with a pummel and four throws, and a side special, all their own; the words on the move card are written from
// the same numbers; tilts leave a stun that outlasts their recovery so they can lead into aerials; the movetech is as the owner
// asked ("less movetech for dashers and flyers": no cling for them, a plain wall jump, at most one small cancel).

const KITS = { Puffball: 'fly', Bow: 'chair', Pencil: 'van', Leafy: 'dash' };
const SLOTS = ['ft', 'ut', 'dt', 'na', 'fa', 'ba', 'ua', 'da', 'side'];
// Puffball has no neutral air: "Keep the spit" (the owner, 2026-10-14) -- X in the air with no direction is her spit, as before
const slotsOf = (name) => name === 'Puffball' ? SLOTS.filter((s) => s !== 'na') : SLOTS;
const TEXT_KEY = { ft: 'ftilt', ut: 'utilt', dt: 'ranged', na: 'nair', fa: 'fair', ba: 'bair', ua: 'uair', da: 'dair', side: 'side' };
let W, MS, TEXT;
beforeAll(async () => {
  W = bootMonolith(); await W.eval('profileReady');
  MS = JSON.parse(W.eval(`JSON.stringify((function(){ var o = {}; ${JSON.stringify(Object.values(KITS))}.forEach(function(k){ var m = MOVESETS[k], r = {}; ${JSON.stringify(SLOTS)}.forEach(function(s){ var S = m[s]; r[s] = S ? { n:S.n, st:S.st, act:S.act, end:S.end, jc:S.jc || null, sc:!!S.sc, boxes:(S.boxes||[]).map(function(b){ return { dmg:b.dmg, stun:b.stun||0 }; }) } : null; }); r.tech = m.tech; r.grab = m.grab; o[k] = r; }); return o; })())`));
  TEXT = JSON.parse(W.eval(`JSON.stringify(MOVE_TEXT)`));
});

const run = (name, key, dx, dy = 0, air = false) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true; TESTMODE.active=false;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var mk=function(n,x,i){ return makeFighter(ROSTER.find(function(r){return r.name===n;}), x, groundY()-24, i); };
  var A = mk(${JSON.stringify(name)}, 400, 0), D = mk('Pen', 400 + ${dx}, 1);
  A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; step(); step();
  fighters.forEach(function(f){ f.invuln=0; f.hitstun=0; f.atkCd=0; f.spCd=0; f.vx=0; f.vy=0; f.pct=20; });
  ${air ? 'A.y = groundY()-24-300; A.onground=false; D.y = A.y + ' + dy + '; D.onground=false; D.vy=-0.62;' : 'D.y = groundY()-24 + ' + dy + ';'}
  var p0 = D.pct, S = MOVESETS[A.kit.special][${JSON.stringify(key)}];
  if (${JSON.stringify(key)} === 'side') { A._dirT = hazardT; fireSpecial(A, { right:true, side:true }); } else mvStart(A, S, ${JSON.stringify(key)});
  var first = 0, stun = 0, kx = 0, ky = 0;
  for (var i=0;i<40;i++){ if (${air}) { D.vy = Math.min(D.vy, 0); D.y = A.y + ${dy}; } var p = D.pct; step(); if (!first && D.pct > p + 0.05){ first = D.pct - p; stun = D.hitstun; kx = D.vx; ky = D.vy; } }
  return { dmg: +first.toFixed(2), stun: stun, kx: kx, ky: ky };
})()`);

describe('every batch-1 fighter has the whole set', () => {
  it('nine moves of its own, a grab with four throws, and a list of movetech', () => {
    const bad = [];
    for (const [name, k] of Object.entries(KITS)) {
      for (const s of slotsOf(name)) if (!MS[k][s]) bad.push(`${name}: no ${s}`);
      for (const t of ['f', 'b', 'u', 'd']) if (!MS[k].grab || !MS[k].grab[t] || !MS[k].grab[t].n) bad.push(`${name}: no ${t} throw`);
      if (!MS[k].tech || MS[k].tech.length < 2) bad.push(`${name}: no movetech list`);
    }
    expect(bad, bad.join(' ; ')).toEqual([]);
  });
  it('no two fighters share a tilt or an aerial: names, shapes and numbers are each their own', () => {
    const seen = new Map(), dup = [];
    for (const [name, k] of Object.entries(KITS)) for (const s of slotsOf(name)) {
      const sig = JSON.stringify([MS[k][s].st, MS[k][s].act, MS[k][s].end, MS[k][s].boxes]);
      if (seen.has(sig)) dup.push(`${name} ${s} = ${seen.get(sig)}`); else seen.set(sig, `${name} ${s}`);
      const names = Object.entries(KITS).filter(([n2, k2]) => n2 !== name && MS[k2][s] && MS[k2][s].n === MS[k][s].n);
      if (names.length) dup.push(`${name} ${s} shares the name ${MS[k][s].n}`);
    }
    expect(dup, dup.join(' ; ')).toEqual([]);
  });
});

describe('the moves do what the card says', () => {
  it('each tilt, aerial and the side special hits a foe in its reach for the damage its line names', () => {
    const bad = [];
    for (const [name, k] of Object.entries(KITS)) for (const s of slotsOf(name)) {
      const air = ['na', 'fa', 'ba', 'ua', 'da'].includes(s);
      const spots = air ? [[40, 0], [75, 0], [-40, 0], [8, -50], [8, 50]] : [[40, 0], [70, 0], [8, -50]];
      let best = null;
      for (const [dx, dy] of spots) { const r = run(name, s, dx, dy, air); if (r.dmg > 0 && (!best || r.dmg > best.dmg)) best = r; }
      const line = TEXT[name][TEXT_KEY[s]];
      if (!best) { bad.push(`${name} ${s}: hits nothing at 40/70 px, above or below`); continue; }
      const nums = [...line.matchAll(/(\d+(?:\.\d+)?)%/g)].map((x) => +x[1]);
      if (!nums.some((n) => Math.abs(n - best.dmg) <= Math.max(1.05, n * 0.12))) bad.push(`${name} ${s}: says ${nums.join('/')}%, lands ${best.dmg} :: ${line}`);
      if (!/^[^—]+ — ./.test(line) || line.length > 230 || !/On hit:/.test(line)) bad.push(`${name} ${s}: line not in the house style (${line.length})`);
    }
    expect(bad, bad.join(' ; ')).toEqual([]);
  });
  it('the pummel and the four throws have lines, and each throw lands what its line says', () => {
    const bad = [];
    for (const [name, k] of Object.entries(KITS)) for (const key of ['grab', 'pummel', 'fthrow', 'bthrow', 'uthrow', 'dthrow']) if (!TEXT[name][key]) bad.push(`${name} ${key}: no line`);
    expect(bad, bad.join(' ; ')).toEqual([]);
    for (const [name, k] of Object.entries(KITS)) for (const [t, key] of [['f', 'fthrow'], ['b', 'bthrow'], ['u', 'uthrow'], ['d', 'dthrow']]) {
      const T = MS[k].grab[t], line = TEXT[name][key];
      expect(line, `${name} ${key}`).toContain(T.n);
      expect(+line.match(/On hit: ([\d.]+)%/)[1], `${name} ${key}`).toBeCloseTo(T.dmg, 1);
    }
  });
});

describe('combos', () => {
  it('every tilt leaves its foe in a stun that outlasts the tilt itself by 12 frames or more', () => {
    const bad = [];
    for (const [name, k] of Object.entries(KITS)) for (const s of ['ft', 'ut', 'dt']) {
      const S = MS[k][s], stun = Math.max(...S.boxes.map((b) => b.stun)), after = S.act + S.end;
      if (stun < after + 12) bad.push(`${name} ${s}: stun ${stun}, recovers in ${after}`);
    }
    expect(bad, bad.join(' ; ')).toEqual([]);
  });
  it('a down-tilt into a short hop and a neutral air (Puffball: a forward air) lands both, at 0% and 30%, for all four', () => {
    const link = (name, pct, wait, aer) => W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true; TESTMODE.active=false;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var mk=function(n,x,i){ return makeFighter(ROSTER.find(function(r){return r.name===n;}), x, groundY()-24, i); };
      var A = mk(${JSON.stringify(name)}, 400, 0), D = mk('Pen', 444, 1);
      A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='local'; A.you=true; D.controller='still'; A.stocks=9; D.stocks=9;
      fighters=[A,D]; for (var k in down) delete down[k]; step(); step();
      fighters.forEach(function(f){ f.invuln=0; f.hitstun=0; f.atkCd=0; f.spCd=0; f.vx=0; f.vy=0; f.pct=${pct}; });
      var keys = {}, hits = [];
      var hold = function(ks, n){ for (var i=0;i<n;i++){ for (var k in down) down[k]=false; ks.forEach(function(x){ down[KEYS[x]]=true; }); var p=D.pct; step(); if (D.pct>p+0.05) hits.push(A._lastKey); } };
      hold(['attack','down'], 3);
      var g = 0; while (!(hits.length >= 1 && !A._mv && A.atkCd <= 0 && !(A._lag>0)) && g++ < 60) hold([], 1);
      hold(['jump'], 1);
      g = 0; while (A.onground && g++ < 4) hold([], 1);
      hold(['right'], ${wait}); hold(${JSON.stringify(aer)}, 3); hold([], 14);   // (a player drifts toward the foe while the hop starts)
      for (var k2 in down) down[k2]=false;
      return hits.filter(function(h, i){ return hits.indexOf(h) === i; }).length;
    })()`);
    const bad = [];
    for (const name of Object.keys(KITS)) for (const pct of [0, 30]) if (![0, 1, 2, 3, 4, 5].some((w) => link(name, pct, w, name === 'Puffball' ? ['attack', 'right'] : ['attack']) >= 2)) bad.push(`${name} at ${pct}%`);
    expect(bad, bad.join(' ; ')).toEqual([]);
  });
});

describe('movetech, as the owner asked', () => {
  it('of batch 1 only Pencil clings; the flyers and the dasher do not', () => {   // (restated for batch 2: Snowball, Pin, Bomby and Blocky cling too, so the list is no longer just Pencil; see moveset-batch2)
    const c = JSON.parse(W.eval('JSON.stringify(CLINGERS)'));
    expect(Object.keys(c)).toContain('van');
    for (const k of ['fly', 'chair', 'dash']) expect(c[k]).toBeUndefined();
  });
  it('flyers and dashers have at most one small move-cancel; Pencil has several', () => {
    const cancels = (name) => slotsOf(name).filter((s) => MS[KITS[name]][s].jc || MS[KITS[name]][s].sc).length;
    for (const n of ['Puffball', 'Bow', 'Leafy']) expect(cancels(n), n).toBeLessThanOrEqual(1);
    expect(cancels('Pencil')).toBeGreaterThanOrEqual(3);
  });
  it('a cling holds a falling fighter to the wall for about a second, then lets it slide', () => {
    const slow = (name) => W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true; TESTMODE.active=false; summons=[]; projectiles=[]; particles=[];
      var mk=function(n,x,i){ return makeFighter(ROSTER.find(function(r){return r.name===n;}), x, groundY()-24, i); };
      var A = mk(${JSON.stringify(name)}, 452, 0), D = mk('Pen', 100, 1);
      A.team=0; D.team=1; A.controller='local'; A.you=true; D.controller='still'; A.stocks=9; D.stocks=9; fighters=[A,D];
      for (var k in down) delete down[k];
      worldPlats=[{x:480,y:groundY()-700,w:60,h:700,solid:true}];
      step(); A.y = groundY()-24-500; A.onground=false; A.vy=0; A.jumps=0;
      down[KEYS.right]=true; var y0 = A.y, n = 0;
      for (var i=0;i<50;i++){ step(); } var y50 = A.y;
      for (var i=0;i<60;i++){ step(); } var y110 = A.y;
      down[KEYS.right]=false; return { first50: y50 - y0, next60: y110 - y50 };
    })()`);
    const p = slow('Pencil'), b = slow('Bow');
    expect(p.first50, 'Pencil slides slowly while she clings').toBeLessThan(b.first50 * 0.35);
    expect(p.next60, 'then she lets go and falls').toBeGreaterThan(p.first50 * 3);
  });
});

describe('Puffball keeps the spit ("Keep the spit", the owner, 2026-10-14)', () => {
  it('X in the air with no direction is her spit, exactly as before; her aerials are X with a direction', () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; running=true; TESTMODE.active=false; worldPlats=[]; summons=[]; projectiles=[]; particles=[];
      var mk=function(n,x,i){ return makeFighter(ROSTER.find(function(r){return r.name===n;}), x, groundY()-24, i); };
      var A = mk('Puffball', 300, 0), D = mk('Pen', 900, 1); A.team=0; D.team=1; A.face=1; A.controller='local'; A.you=true; D.controller='still'; fighters=[A,D];
      for (var k in down) delete down[k]; step(); step(); A.y = groundY()-24-120; A.onground = false; A.vy = 0; A.atkCd = 0;
      var p0 = projectiles.length; down[KEYS.attack]=true; for (var i=0;i<4;i++) step(); down[KEYS.attack]=false;
      var plain = { shots: projectiles.length - p0, mv: !!A._mv, key: A._lastKey || null };
      for (var j=0;j<40;j++) step(); A.y = groundY()-24-120; A.onground = false; A.vy = 0; A.atkCd = 0; A.flying = 0; A._mv = null;
      down[KEYS.attack]=true; down[KEYS.right]=true; for (var i2=0;i2<4;i2++) step(); down[KEYS.attack]=false; down[KEYS.right]=false;
      return { plain: plain, fwd: { mv: !!A._mv || A._lastKey === 'fa', key: A._lastKey } };
    })()`);
    expect(r.plain.shots, 'the spit leaves her').toBeGreaterThan(0);
    expect(r.plain.mv).toBe(false);
    expect(r.fwd.key).toBe('fa');
  });
});
