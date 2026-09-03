import { describe, it, expect } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// Thirty-nine of the fifty-nine smashes were one of three generic shapes — 21 "a ring of damage
// around me", 11 "spawn one shot", 7 "spawn N shots in a fan". They differed in name, colour and
// integers and in nothing a player could do differently. SMASH_SPEC gives each one a row saying
// four things a player can feel: a movement PATTERN, an EFFECT that outlives the hit, a dmg/kb
// RATIO that is the move's job, and a COST paid whether it connects or not.
//
// The first test is the point of the exercise. The rest prove each pattern does what it says.

const rowKey = (r) => [r.pat, r.effect || '-', r.band == null ? 'nb' : Math.sign(r.band),
  r.dmg[1] > r.kb[1] ? 'racks' : r.dmg[1] < r.kb[1] ? 'kills' : 'even',
  Object.keys(r.cost || {}).sort().join('+') || 'free'].join('|');

const stage = (w, name, dummyAt, frames = 90, charge = 1) => w.eval(`
  (function(){
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
    worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
    var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
    var D = makeFighter(ROSTER.find(function(r){ return r.name==='Golf Ball'; }), ${dummyAt}, groundY()-24, 1);
    A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
    fighters=[A,D]; step(); A.invuln=0; D.invuln=0; A.pct=0; D.pct=0; A.hitstun=0; A.rooted=0;
    var x0=A.x, ownPct0=A.pct;
    doSmash(A, ${charge});
    var stunned = A.hitstun, rooted = A.rooted, selfCost = A.pct - ownPct0;
    for (var i=0;i<${frames};i++){ step(); D.invuln=0; }
    return { pct:+D.pct.toFixed(2), dx:A.x-x0, stunned:stunned, rooted:rooted, selfCost:+selfCost.toFixed(2),
             burn:D.burn|0, bleed:D.bleed|0, rootedFoe:D.rooted|0, slowed:D.slowed|0, frozen:D.frozen|0,
             weakened:D.weakened|0, ctrlRev:D.ctrlRev|0, defined:D.defineStacks|0, projs:projectiles.length };
  })()`);

describe('no two of the 39 are the same move', () => {
  it('every row differs in pattern, effect, band, ratio or cost', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const rows = w.eval('Object.entries(SMASH_SPEC)');
    expect(rows.length).toBe(39);
    const seen = new Map(), dupes = [];
    for (const [k, r] of rows) {
      const id = rowKey(r);
      if (seen.has(id)) dupes.push(`${k} = ${seen.get(id)} (${id})`); else seen.set(id, k);
    }
    expect(dupes, 'rows that are indistinguishable in play').toEqual([]);
  });

  it('every row costs something, and a tap pays the same price as a full charge', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const free = w.eval('Object.entries(SMASH_SPEC).filter(function(e){ var c=e[1].cost; return !c || !Object.keys(c).length; }).map(function(e){ return e[0]; })');
    expect(free, 'a smash with no cost is not a choice').toEqual([]);
    const shrinks = w.eval('Object.entries(SMASH_SPEC).filter(function(e){ return e[1].costTap; }).map(function(e){ return e[0]; })');
    expect(shrinks, 'the cost must not scale with the charge').toEqual([]);
  });

  it('every row has a real two-tier charge — the full version is stronger', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const bad = w.eval('Object.entries(SMASH_SPEC).filter(function(e){ var r=e[1]; return !(r.dmg[1] > r.dmg[0]) || !(r.kb[1] >= r.kb[0]); }).map(function(e){ return e[0]; })');
    expect(bad).toEqual([]);
  });

  it('the roster is fully covered — nothing falls through to the generic smash', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const orphans = w.eval('ROSTER.filter(function(r){return r.play;}).filter(function(r){ var k=r.kit.special; return !SMASH_SPEC[k] && !SMASHES[k]; }).map(function(r){ return r.name; })');
    expect(orphans).toEqual([]);
  });
});

describe('each pattern does what its name says', () => {
  it('lunge — Gaty is sweet at the latch and sour at the hinge', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const tip = stage(w, 'Gaty', 514, 6).pct;    // ~70px out: past the band, so the latch
    const hilt = stage(w, 'Gaty', 454, 6).pct;   // ~10px out: inside it, so the hinge
    expect(tip, 'the latch should hit harder than the hinge').toBeGreaterThan(hilt);
  });

  it('through — Lightning ends up past the target', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const r = stage(w, 'Lightning', 450, 40);
    expect(r.dx, 'the dash should carry him past').toBeGreaterThan(60);
    expect(r.pct).toBeGreaterThan(0);
  });

  it('leap — Flower leaves the ground and buries on landing', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const r = stage(w, 'Flower', 520, 90);   // she comes down ~130px forward; the hit is the landing
    expect(r.pct).toBeGreaterThan(0);
    expect(r.rootedFoe, 'buried').toBeGreaterThan(0);
  });

  it('plant — Bomby roots himself, hurts himself, and burns what is near', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const r = stage(w, 'Bomby', 430, 60);
    expect(r.rooted, 'he cannot move while the fuse burns').toBeGreaterThan(0);
    expect(r.selfCost, 'Light My Fuse costs him percent').toBeGreaterThan(0);
    expect(r.burn).toBeGreaterThan(0);
  });

  it('walk — Pencil sends the van away along the ground', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    expect(stage(w, 'Pencil', 800, 60).pct, 'the van should reach a distant target').toBeGreaterThan(0);
  });

  it('rain — Yellow Face drops a crate on a spot he is not standing on', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    expect(stage(w, 'Yellow Face', 500, 150).pct).toBeGreaterThan(0);
  });

  it('mine — Gelatin plants one that waits, and only one at a time', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const r = w.eval(`
      (function(){
        var A = makeFighter(ROSTER.find(function(r){ return r.name==='Gelatin'; }), 400, groundY()-24, 0);
        A.team=0; A.face=1; fighters=[A]; projectiles=[];
        doSmash(A,1); var one = projectiles.filter(function(p){ return p._mine; }).length;
        doSmash(A,1); var two = projectiles.filter(function(p){ return p._mine; }).length;
        return { one:one, two:two };
      })()`);
    expect(r.one).toBe(1);
    expect(r.two, 'a second plant replaces the first').toBe(1);
  });

  it('reel — Rose pulls the target toward her before she swings', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const r = w.eval(`
      (function(){
        var A = makeFighter(ROSTER.find(function(r){ return r.name==='Rose'; }), 400, groundY()-24, 0);
        var D = makeFighter(ROSTER.find(function(r){ return r.name==='Golf Ball'; }), 540, groundY()-24, 1);
        A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still';
        fighters=[A,D]; D.invuln=0; D.pct=0; D.vx=0;
        doSmash(A,1);
        var pulled=0;
        for (var i=0;i<20;i++){ step(); D.invuln=0; if(D.vx<pulled) pulled=D.vx; }
        return { vx:pulled, bleed:D.bleed|0, pct:D.pct };
      })()`);
    expect(r.vx, 'pulled toward her, so leftward').toBeLessThan(0);
    expect(r.bleed, 'thorns bleed').toBeGreaterThan(0);
  });

  it('beam — Dora reaches across the stage on the activation frame', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const r = stage(w, 'Dora', 1000, 2);
    expect(r.pct, 'a beam has no travel time').toBeGreaterThan(0);
    expect(r.weakened).toBeGreaterThan(0);
  });

  it('burst — Money’s ring expands, so a distant target is caught later', async () => {
    const w = bootMonolith(); await w.eval('profileReady');
    const nearEarly = stage(w, 'Money', 420, 2).pct;
    const farEarly = stage(w, 'Money', 520, 2).pct;
    expect(nearEarly, 'the ring starts small').toBeGreaterThan(farEarly);
    expect(stage(w, 'Money', 520, 20).pct, 'and reaches them a few frames later').toBeGreaterThan(0);
  });
});
