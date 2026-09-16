import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "Smashes still feel overcomplicated and hard to use, especially against enemies with movetech. make
// instructions in the main menu clearer. if it says your gonna dash, the smash should make you dash, and if
// you connect, the effect and damage will apply."
//
// Measured before the change (a target 90px out walking behind you, every smash pressed through the keys):
// 18 of 59 smashes landed at all. A dash did 30% of its number on contact and the rest on a swing BEHIND
// you after the dash; a lunge was a 3px nudge; a hop was a fixed arc; four of the five falling smashes
// dropped at a fixed spot; and a lunge's sour spot cut its damage by 45%. The input had a mis-press floor
// that threw nothing and a hold that waited for the release, and the menu said "hold V".
// Each describe below is one half of the sentence.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const ROWS = () => W.eval(`ROSTER.filter(function(r){ return r.play && SMASH_SPEC[r.kit.special]; })
  .map(function(r){ var s = SMASH_SPEC[r.kit.special]; return { name:r.name, key:r.kit.special, pat:s.pat, dmg:s.dmg, effect:s.effect||null, at:s.at||34, len:s.len||900 }; })`);

// A fighter and a dummy on a flat floor. `body` runs inside with A (caster) and D (dummy) in scope.
const arena = (name, dx, body, { pct = 50 } = {}) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ${400 + dx}, groundY()-24, 1);
  A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; step();
  [A,D].forEach(function(f){ f.invuln=0; f.hitstun=0; f.spCd=0; f.atkCd=0; f.armor=0; f.smashHold=0; f._smQ=null; });
  A.pct=30; D.pct=${pct};
  for (var k in down) down[k]=false;
  ${body}
})()`);

describe('if it says you move, you move -- and if it says you stay, you stay', () => {
  it('every smash does the motion its words name, with nobody in reach', () => {
    const bad = [];
    for (const r of ROWS()) {
      const m = arena(r.name, -340, `
        var x0=A.x, y0=A.y, p0=projectiles.length;
        doSmash(A);
        var rootedAtCast = A.rooted, beamNow = beams.length > 0, maxDx=0, rise=0, above=false, mine=false, ringing=!!A._windup || !!(A._sm && A._sm.pat==='burst');
        var mine0 = projectiles.some(function(p){ return p.owner===A.idx && p._mine; });
        for (var i=0;i<60;i++){
          step(); D.x = 60; D.vx = 0;
          maxDx = Math.max(maxDx, A.x - x0); rise = Math.max(rise, y0 - A.y);
          projectiles.forEach(function(p){ if (p.owner===A.idx && p.y < y0 - 60) above = true; });
        }
        var rolled = projectiles.some(function(p){ return p.owner===A.idx && !p._mine && p.x > x0 + 60; });
        return { dx: Math.round(maxDx), rise: Math.round(rise), rooted: rootedAtCast, beam: beamNow, above: above, mine: mine0, rolled: rolled, ringing: ringing };`);
      const ok = {
        lunge:   m.dx >= 50,
        through: m.dx >= 100,
        leap:    m.rise >= 40 && m.dx > 10,
        plant:   m.rooted > 0 && m.dx <= 2,
        burst:   m.ringing && m.dx <= 2,
        beam:    m.beam && m.dx <= 2,
        walk:    m.rolled && m.dx <= 2,
        rain:    m.above && m.dx <= 2,
        mine:    m.mine && m.dx <= 2,
        reel:    m.dx <= 2,
      }[r.pat];
      if (!ok) bad.push(`${r.name} (${r.pat}): ${JSON.stringify(m)}`);
    }
    expect(bad).toEqual([]);
  });
});

describe('if you connect, the damage and the effect apply', () => {
  // Where each shape reaches a dummy that stands still. The number is the first hit alone.
  const SPOT = { lunge: 60, through: 60, leap: 60, burst: 60, plant: 40, reel: 120, walk: 120, rain: 60 };
  const FIELD = { burn:'burn', bleed:'bleed', poison:'_poisonT', freeze:'frozen', root:'rooted', slow:'slowed', ice:'iceUntil',
    scramble:'ctrlRev', weaken:'weakened', define:'defineStacks', stun:'_stunFx', knockdown:'_stunFx' };

  it('every smash that touches a still target lands its whole number and its effect', () => {
    const bad = [];
    for (const r of ROWS()) {
      const dx = r.pat === 'beam' ? Math.min(100, r.len - 20) : r.pat === 'mine' ? r.at : SPOT[r.pat];
      const m = arena(r.name, dx, `
        D.reflecting = ${r.effect === 'strip' ? 40 : 0};
        var p0 = D.pct, a0 = A.pct, first = null, fx = false, field = ${JSON.stringify(FIELD[r.effect] || null)};
        doSmash(A);
        for (var i=0;i<150;i++){
          if (first === null && D.pct > p0 + 0.5){ first = D.pct - p0;
            fx = ${JSON.stringify(r.effect)} === 'strip' ? D.reflecting === 0
               : ${JSON.stringify(r.effect)} === 'drain' ? A.pct < a0
               : field ? D[field] > 0 : true; }
          if (first !== null) break;
          step(); D.invuln = 0;
          ${r.pat === 'reel' ? '' : `D.x = ${400 + dx}; D.vx = 0;`}   // a pull has to be allowed to move them
        }
        return { first: first === null ? null : +first.toFixed(2), fx: fx };`);
      if (m.first === null || m.first < r.dmg - 0.05 || !m.fx) bad.push(`${r.name} (${r.pat} ${r.dmg}% ${r.effect}): ${JSON.stringify(m)}`);
    }
    expect(bad).toEqual([]);
  });
});

describe('against someone who moves', () => {
  // Pressed through the real keys, so the charge, the aim and the pattern are all in it.
  const press = (name, start, vx) => arena(name, start, `
    A.controller='local'; A.you=true;
    var p0 = D.pct, moving = true, first = null;
    for (var fr=1; fr<=150; fr++){
      down[KEYS.smash] = fr === 1;
      if (moving){ D.vx = ${vx}; D.face = ${Math.sign(vx) || -1}; }
      step(); D.dead = false; D.invuln = Math.min(D.invuln, 0);
      if (D.pct > p0 + 0.5){ first = D.pct - p0; break; }
    }
    down[KEYS.smash] = false;
    return { first: first === null ? null : +first.toFixed(2) };`);

  it('every lunge, dash and hop catches someone walking straight at you', () => {
    const miss = ROWS().filter((r) => ['lunge', 'through', 'leap'].includes(r.pat))
      .map((r) => ({ r, m: press(r.name, 300, -6.4) }))
      .filter(({ r, m }) => m.first === null || m.first < r.dmg - 0.05).map(({ r, m }) => `${r.name}: ${m.first}`);
    expect(miss).toEqual([]);
  });

  it('every lunge, dash and hop turns and catches someone who walked past you while it charged', () => {
    const miss = ROWS().filter((r) => ['lunge', 'through', 'leap'].includes(r.pat))
      .map((r) => ({ r, m: press(r.name, 90, -6.4) }))
      .filter(({ r, m }) => m.first === null || m.first < r.dmg - 0.05).map(({ r, m }) => `${r.name}: ${m.first}`);
    expect(miss).toEqual([]);
  });

  it('every falling smash lands on someone standing where a fixed drop would have missed', () => {
    const miss = ROWS().filter((r) => r.pat === 'rain')
      .map((r) => ({ r, m: press(r.name, 150, 0) }))
      .filter(({ r, m }) => m.first === null).map(({ r }) => r.name);
    expect(miss).toEqual([]);
  });
});

describe('aim', () => {
  const faceAtFire = (name, foeDx, hold) => arena(name, foeDx, `
    A.controller='local'; A.you=true; A.face=1;
    var face = null, _ds = doSmash; doSmash = function(f){ if (f===A && face===null) face = A.face; return _ds.apply(this, arguments); };
    try {
      for (var fr=1; fr<=40 && face===null; fr++){ down[KEYS.smash] = fr === 1; ${hold ? `down[KEYS.${hold}] = true;` : ''} step(); D.x = ${400 + foeDx}; D.vx = 0; }
    } finally { doSmash = _ds; for (var k in down) down[k] = false; }
    return face;`);

  it('with no direction held, it goes off facing the nearest foe, even one behind you', () => {
    expect(faceAtFire('Coiny', -120)).toBe(-1);
    expect(faceAtFire('Coiny', 120)).toBe(1);
  });

  it('a held direction wins over the nearest foe', () => {
    expect(faceAtFire('Coiny', 120, 'left')).toBe(-1);
  });

  it("Puffball's Meteor Puff is not turned (the owner's call on her timing)", () => {
    expect(faceAtFire('Puffball', -120)).toBe(1);
  });
});

describe('a smash that moves you is lost to a hit', () => {
  it('a hit mid-lunge ends the lunge, so the knockback is not overwritten by it', () => {
    const r = arena('Coiny', -300, `
      doSmash(A); step();
      var lunging = !!(A._sm && A._sm.pat === 'lunge');
      applyHit(A, 6, -9, -5, D);
      var ended = A._sm === null;
      step();
      return { lunging: lunging, ended: ended, vx: A.vx };`);
    expect(r.lunging, 'nobody in reach, so it is still lunging').toBe(true);
    expect(r.ended).toBe(true);
    expect(r.vx, 'sent backwards, not still lunging forwards').toBeLessThan(0);
  });
});

describe('a smash never carries you off the stage by itself', () => {
  it('a lunge at the edge of the stage stops at the edge', () => {
    const r = arena('Coiny', -400, `
      A.x = WW - 90; A.face = 1; D.x = 100;
      doSmash(A);
      var maxX = A.x;
      for (var i=0;i<20;i++){ step(); maxX = Math.max(maxX, A.x); }
      return { maxX: maxX, edge: WW - 30, onground: A.onground };`);
    expect(r.maxX, 'it teeters instead of running off').toBeLessThan(r.edge);
    expect(r.onground).toBe(true);
  });

  it('a hop does not steer at a foe who is past the edge of the stage', () => {
    const r = arena('Flower', 0, `
      A.x = WW - 200; A.face = 1; D.x = WW + 20; D.y = A.y;
      doSmash(A);
      return { tgt: A._sm ? A._sm.tgt : 'none', vx: A.vx, fwd: SMASH_SPEC.quake.fwd };`);
    expect(r.tgt, 'nobody to steer at').toBe(null);
    expect(r.vx, 'the plain forward hop').toBeCloseTo(r.fwd, 5);
  });
});

describe('the words', () => {
  const VERB = { lunge: 'lunges forward', through: 'dashes forward', leap: 'hops at the nearest foe', burst: 'ring bursts out',
    walk: 'along the ground', beam: 'instant beam', rain: 'drops it from the sky onto the nearest foe', mine: 'sets a trap',
    plant: 'roots you in place', reel: 'pulls nearby foes in' };

  it('every smash row names its motion, its whole damage and its effect', () => {
    const blurbs = W.eval(`ROSTER.filter(function(r){ return r.play && SMASH_SPEC[r.kit.special]; }).map(function(r){
      var s = SMASH_SPEC[r.kit.special], A = makeFighter(r, 0, 0, 0);
      return { name:r.name, pat:s.pat, dmg:s.dmg, eff: s.effect ? SMASH_EFFECT_TEXT[s.effect] : null, id: SMASH_ID[r.kit.special] ? SMASH_ID[r.kit.special].name : null, text: smashBlurb(A) }; })`);
    const bad = blurbs.filter((b) => !b.text.includes(VERB[b.pat]) || !b.text.includes(`On hit: ${b.dmg}%`)
      || (b.eff && !b.text.includes(b.eff)) || (b.id && !b.text.startsWith(b.id))
      || /from behind|steps in|hold/i.test(b.text)).map((b) => `${b.name}: ${b.text}`);
    expect(bad).toEqual([]);
  });

  it('the move card says press V once, what kind of smash it is, and how long the charge is', () => {
    const t = W.eval(`(function(){ chosen = ROSTER.find(function(r){ return r.name==='Lightning'; }); refreshSel();
      return document.getElementById('moveCard').textContent; })()`);
    expect(t).toMatch(/Press V once/);
    expect(t).toMatch(/Dash · /);
    expect(t).toMatch(/charges for 0\.\d s/);
    expect(t).not.toMatch(/hold V/i);
    const how = W.eval(`(function(){ var out = {}; ['Needle','Teardrop','Golf Ball','Puffball','Coiny'].forEach(function(n){
      out[n] = smashHowText(ROSTER.find(function(r){ return r.name===n; })); }); return out; })()`);
    for (const n of ['Needle', 'Teardrop', 'Golf Ball']) expect(how[n], `${n} lands nothing, so there is nothing to aim`).not.toMatch(/nearest foe|aim/);
    expect(how.Puffball, "Meteor Puff is not turned").not.toMatch(/nearest foe/);
    expect(how.Coiny).toMatch(/turned toward the nearest foe/);
  });

  it('How to Play explains the press, the charge, the aim, the whole hit, and all ten kinds', () => {
    const r = W.eval(`({ text: document.getElementById('tutorial').textContent, kinds: Object.values(SMASH_KIND),
      hint: document.getElementById('hint').textContent, steps: TUT_STEPS.map(function(s){ return s.text; }).join(' | ') })`);
    expect(r.text).toMatch(/press V once/i);
    expect(r.text).toMatch(/charging/);
    expect(r.text).toMatch(/goes off by itself/);
    expect(r.text).toMatch(/nearest foe/);
    expect(r.text).toMatch(/all of its damage and its effect/);
    for (const k of r.kinds) expect(r.text, k).toContain(k);
    for (const s of [r.text, r.hint, r.steps]) expect(s).not.toMatch(/hold V/i);
    for (const key of ['↑ + C', '↓ + C', 'X + C']) expect(r.text, key).toContain(key);
  });
});

describe('Tree is left alone', () => {
  it('TIMBER is the row it was', () => {
    expect(W.eval('SMASH_SPEC.timber')).toEqual({ pat:'plant', wind:24, rad:52, dmg:18, kb:12, effect:'root', n:70, cost:{ root:28 }, color:'#5a3a1a' });
  });
});
