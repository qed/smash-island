import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// Batch 6 of the moveset expansion (the owner, 2026-10-14; every move hand-made, no archetype templates): Bracelety, Fanny, Gaty, Grassy, Lightning, Liy, Loser and Marker each have a side-, up- and down-tilt,
// five aerials, a grab with a pummel and four throws, all their own (no side special: the owner turned them off, 2026-10-16); the words on the move card are written from
// the same numbers; tilts leave a stun that outlasts their recovery so they can lead into aerials; the movetech is as the owner
// asked (the slow, heavy ones get the generous share: a cling and several cancels; the quick ones a plain wall jump and at most one small cancel).

const KITS = { Bracelety: 'sign', Fanny: 'gust', Gaty: 'reflect', Grassy: 'grasstree', Lightning: 'zap', Liy: 'switch', Loser: 'cool', Marker: 'ink' };
const QUICK = ['Bracelety', 'Fanny', 'Gaty', 'Grassy', 'Lightning', 'Liy', 'Loser', 'Marker'], SLOW = [];   // the plain share of movetech and the generous one
const SLOTS = ['ft', 'ut', 'dt', 'na', 'fa', 'ba', 'ua', 'da'];
// Fanny has no neutral air: X in the air with no direction is her Air Blast, as before (the Puffball precedent: "Keep the spit", the owner, 2026-10-14)
const slotsOf = (name) => name === 'Fanny' ? SLOTS.filter((s) => s !== 'na') : SLOTS;
const TEXT_KEY = { ft: 'ftilt', ut: 'utilt', dt: 'ranged', na: 'nair', fa: 'fair', ba: 'bair', ua: 'uair', da: 'dair' };
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
  mvStart(A, S, ${JSON.stringify(key)});
  var first = 0, stun = 0, kx = 0, ky = 0;
  for (var i=0;i<40;i++){ if (${air}) { D.vy = Math.min(D.vy, 0); D.y = A.y + ${dy}; } var p = D.pct; step(); if (!first && D.pct > p + 0.05){ first = D.pct - p; stun = D.hitstun; kx = D.vx; ky = D.vy; } }
  return { dmg: +first.toFixed(2), stun: stun, kx: kx, ky: ky };
})()`);

describe('every batch-6 fighter has the whole set', () => {
  it('eight moves of its own, a grab with four throws, and a list of movetech', () => {
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
  it('each tilt and aerial hits a foe in its reach for the damage its line names', () => {
    const bad = [];
    for (const [name, k] of Object.entries(KITS)) for (const s of slotsOf(name)) {
      const air = ['na', 'fa', 'ba', 'ua', 'da'].includes(s);
      const spots = air ? [[40, 0], [75, 0], [-40, 0], [8, -50], [8, 50]] : [[40, 0], [70, 0], [8, -50]];   // Liy's angled Flip Switch rises forward
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
  it('a down-tilt into a short hop and a neutral air (Fanny: a forward air, her X in the air is the Air Blast) lands both, at 0% and 30%, for all eight', () => {
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
    for (const name of Object.keys(KITS)) for (const pct of [0, 30]) if (![0, 1, 2, 3, 4, 5].some((w) => link(name, pct, w, name === 'Fanny' ? ['attack', 'right'] : ['attack']) >= 2)) bad.push(`${name} at ${pct}%`);
    expect(bad, bad.join(' ; ')).toEqual([]);
  });
});

describe('movetech, as the owner asked', () => {
  it('the slow, heavy fighters cling; the quick ones do not', () => {
    const c = JSON.parse(W.eval('JSON.stringify(CLINGERS)'));
    for (const n of SLOW) expect(c[KITS[n]], n).toBeGreaterThan(30);
    for (const n of QUICK) expect(c[KITS[n]], n).toBeUndefined();
  });
  it('the quick ones have at most one small move-cancel; the heavy ones have several', () => {
    const cancels = (name) => slotsOf(name).filter((s) => MS[KITS[name]][s].jc || MS[KITS[name]][s].sc).length;
    for (const n of QUICK) expect(cancels(n), n).toBeLessThanOrEqual(1);
    for (const n of SLOW) expect(cancels(n), n).toBeGreaterThanOrEqual(2);
  });
  it('every fighter with a moveset, batch 1 and 2 together, has moves of its own: no two share a timing and a number or a name', () => {
    const dup = JSON.parse(W.eval(`JSON.stringify((function(){ var seen = {}, dup = [], SL = ${JSON.stringify(SLOTS)};
      Object.keys(MOVESETS).forEach(function(k){ SL.forEach(function(s){ var S = MOVESETS[k][s]; if(!S) return;
        var sig = JSON.stringify([s, S.st, S.act, S.end, (S.boxes||[]).map(function(b){ return [b.dmg, b.stun||0]; })]);
        if(seen[sig]) dup.push(k + ' ' + s + ' = ' + seen[sig]); else seen[sig] = k + ' ' + s;
        var ns = s + ':' + S.n; if(seen[ns]) dup.push(k + ' ' + s + ' name ' + S.n); else seen[ns] = k; }); });
      return dup; })())`));
    expect(dup, dup.join(' ; ')).toEqual([]);
  });
});

describe('side effects are on the card', () => {
  it('a move that slows, stuns or burns says so on its line', () => {
    const bad = [];
    const fxMoves = JSON.parse(W.eval(`JSON.stringify((function(){ var o = {}; ${JSON.stringify(Object.values(KITS))}.forEach(function(k){ o[k] = []; ${JSON.stringify(SLOTS)}.forEach(function(s){ var S = MOVESETS[k][s]; if(S && S.fxt) o[k].push([s, S.fxt]); }); }); return o; })())`));
    for (const [name, k] of Object.entries(KITS)) for (const [s, fxt] of fxMoves[k]) if (!TEXT[name][TEXT_KEY[s]].includes(fxt)) bad.push(`${name} ${s}: the line does not say '${fxt}'`);
    expect(bad, bad.join(' ; ')).toEqual([]);
    expect(fxMoves.ink.length, 'Marker slows with more than one move (three before the side specials went, 2026-10-16)').toBeGreaterThanOrEqual(2);
  });
});
