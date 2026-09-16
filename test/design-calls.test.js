import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// The 22 design questions the gravity-and-wording audit raised, answered by the owner:
//   rolling smashes RIDE SURFACES like the Supervan (no explosion);
//   a ground move used in the air SLAMS, THEN HITS, and Flower's quake only reaches her own surface;
//   of the eleven text-vs-move mismatches, every MOVE changes to match its text save Puffball's Meteor
//   Puff ("that will mess up timings and give time to counter"), and Gelatin freezes at 40%;
//   Ice Cube's downward shards and Pen's low finisher cap BREAK ON SURFACES.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const arena = (name, { where = 'ground', foe = null, plat = true } = {}) => `
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var platTop = groundY()-180;
  worldPlats = ${plat ? '[{x:300, y:platTop, w:260, h:16}]' : '[]'};
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 420, groundY()-24, 0);
  A.team=0; A.face=1; A.controller='still'; A.stocks=9;
  var D = ${foe ? `(function(){ var d = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(foe.name || 'Pen')}; }), ${foe.x}, (${!!foe.plat} ? platTop : groundY())-24, 1); d.team=1; d.controller='still'; d.stocks=9; return d; })()` : 'null'};
  fighters = [A].concat(D ? [D] : []);
  ${where === 'plat' ? 'A.y = platTop - A.r;' : where === 'air' ? 'A.y = groundY()-260;' : ''}
  for (var k=0;k<3;k++) step();
  ${where === 'air' ? 'A.y = groundY()-260; A.vy=0; A.onground=false;' : ''}
  fighters.forEach(function(f){ f.invuln=0; f.pct=0; f.hitstun=0; f.spCd=0; f.atkCd=0; });`;

describe('rolling smashes ride the surface they are on', () => {
  const roll = (name, where) => W.eval(`(function(){ ${arena(name, { where })}
    doSmash(A);
    var p = projectiles.filter(function(q){ return q.owner===A.idx && q.drive==='roll'; })[0];
    if (!p) return { none: true };
    var path = [];
    for (var i=0;i<70;i++){ step(); if (p.life>0) path.push([Math.round(p.x), Math.round(p.y)]); }
    return { path: path, r: p.r, platTop: platTop, ground: groundY(), gone: p.life<=0 };
  })()`);

  it('every rolling smash declares the ride', () => {
    const rows = W.eval(`Object.keys(SMASH_SPEC).filter(function(k){ return SMASH_SPEC[k].pat==='walk' && !SMASH_SPEC[k].ride; })`);
    expect(rows, "only Pencil's Supervan Ram is a flying ram").toEqual(['van']);
  });

  it('rolls along a platform, then falls off the edge and rolls on where it lands', () => {
    const r = roll('Saw', 'plat');
    const onPlat = r.path.filter(([, y]) => Math.abs(y - (r.platTop - r.r)) < 3);
    expect(onPlat.length, 'it rode the platform').toBeGreaterThan(3);
    const onFloor = r.path.filter(([, y]) => Math.abs(y - (r.ground - r.r)) < 3);
    expect(onFloor.length, 'and carried on along the floor after the drop').toBeGreaterThan(2);
    expect(onFloor[onFloor.length - 1][0] - onFloor[0][0], 'still moving forward down there').toBeGreaterThan(20);
  });

  it('cast in the air, it drops to the surface below and rolls from there', () => {
    const r = roll('Donut', 'air');
    const drop = r.path.slice(0, 5);
    expect(Math.max(...drop.map(([x]) => x)) - Math.min(...drop.map(([x]) => x)), 'straight down first').toBeLessThanOrEqual(12);
    expect(r.path.some(([, y]) => Math.abs(y - (r.platTop - r.r)) < 3), 'then along the platform').toBe(true);
  });

  it('a roller never explodes: it just stops', () => {
    const r = W.eval(`(function(){ ${arena('Taco', { where: 'plat' })}
      var booms = 0; var _b = vanBoom; vanBoom = function(p){ booms++; return _b(p); };
      doSmash(A); for (var i=0;i<120;i++) step();
      vanBoom = _b; return booms;
    })()`);
    expect(r).toBe(0);
  });
});

describe('a ground move used in the air slams, then hits', () => {
  const slam = (name, cast) => W.eval(`(function(){ ${arena(name, { where: 'air', plat: false, foe: { x: 470 } })}
    ${cast};
    var pending = !!A._slam, hitDuringFall = false, landedAt = null;
    for (var i=0;i<80;i++){ step(); D.vx = 0; D.x = 470;
      if (A.onground && landedAt === null) landedAt = i;
      if (landedAt === null && D.pct > 0 && !hitDuringFall) hitDuringFall = true; }
    return { pending: pending, hitDuringFall: hitDuringFall, landedAt: landedAt, hit: D.pct };
  })()`);

  it("David's Aw Seriously slams down and the shockwave goes off on landing", () => {
    const r = slam('David', 'fireSpecial(A, {})');
    expect(r.pending, 'it is pending, not fired in midair').toBe(true);
    expect(r.hitDuringFall).toBe(false);
    expect(r.landedAt).not.toBeNull();
    expect(r.hit, 'and it hit when he landed').toBeGreaterThan(0);
  });

  it("Snowball's Ground Pound and Rocky's Toxic Wave do the same", () => {
    for (const name of ['Snowball', 'Rocky']) {
      const r = slam(name, 'doSmash(A)');
      expect(r.pending, `${name} slams`).toBe(true);
      expect(r.hitDuringFall, `${name} does not go off in midair`).toBe(false);
      expect(r.hit, `${name} hits on landing`).toBeGreaterThan(0);
    }
  });

  it("Flower's quake reaches her own surface only", () => {
    const below = W.eval(`(function(){ ${arena('Flower', { where: 'plat', foe: { x: 470 } })}
      fireSpecial(A, {}); for (var i=0;i<6;i++) step(); return D.pct; })()`);
    const same = W.eval(`(function(){ ${arena('Flower', { where: 'plat', foe: { x: 470, plat: true } })}
      fireSpecial(A, {}); for (var i=0;i<6;i++) step(); return D.pct; })()`);
    expect(below, 'a foe on the floor below is not shaken').toBe(0);
    expect(same, 'one on her own platform is').toBeGreaterThan(0);
  });
});

describe('the moves now do what their text says', () => {
  it("Bubble's Thermal Rise is a real float", () => {
    const r = W.eval(`(function(){ ${arena('Bubble', { where: 'air', plat: false })}
      var ys = []; fireSpecial(A, {});
      for (var i=0;i<40;i++){ step(); ys.push(A.y); }
      var floatFall = ys[20] - ys[10];
      ${arena('Bubble', { where: 'air', plat: false })}
      A._floatT = 0; var ys2 = [];
      for (var j=0;j<40;j++){ step(); ys2.push(A.y); }
      return { floatFall: floatFall, plainFall: ys2[20] - ys2[10] };
    })()`);
    expect(r.floatFall, 'she falls slower while floating').toBeLessThan(r.plainFall * 0.7);
  });

  it("Snowball's Rage Tackle is an armored charge, not a shuffle", () => {
    // the charge is twelve frames at 14 px: about 170 px of ground, so the foe stands inside that
    const r = W.eval(`(function(){ ${arena('Snowball', { plat: false, foe: { x: 560 } })}
      var x0 = A.x; fireSpecial(A, {});
      for (var i=0;i<20;i++) step();
      return { moved: A.x - x0, hit: D.pct, armored: A._dashArmored === false, invuln: A.invuln };
    })()`);
    expect(r.moved, 'he covers real ground').toBeGreaterThan(90);
    expect(r.hit, 'and runs the foe over').toBeGreaterThan(0);
  });

  it("Pin's Point Pierce pops inflatables, not merely light fighters", () => {
    const pop = (name) => W.eval(`(function(){ ${arena('Pin', { plat: false, foe: { name, x: 455 } })}
      fireSpecial(A, {}); for (var i=0;i<4;i++){ step(); D.x = 455; } return D.pct; })()`);
    const balloon = pop('Balloony'), light = pop('Ruler');
    expect(balloon, 'Balloony pops').toBeGreaterThan(light);
    expect(W.eval("Array.from(INFLATABLES).sort()")).toEqual(['Balloony', 'Basketball', 'Bubble', 'Puffball']);
  });

  it("Golf Ball's Presence lasts the five seconds it promises", () => {
    expect(W.eval(`(function(){ ${arena('Golf Ball', { plat: false })} doSmash(A); return A.curse; })()`)).toBeGreaterThanOrEqual(300);
  });

  it("Rocky's Barf settles into a puddle where it lands", () => {
    const r = W.eval(`(function(){ ${arena('Rocky', { plat: false })}
      fireSpecial(A, {}); for (var i=0;i<60;i++) step();
      var p = projectiles.filter(function(q){ return q.owner===A.idx; })[0];
      return p ? { trap: !!p.trap, onFloor: Math.abs(p.y - groundY()) < 14, moving: Math.abs(p.vx) > 0.1 } : { none: true };
    })()`);
    expect(r).toMatchObject({ trap: true, onFloor: true, moving: false });
  });

  it("Nickel's tails launches him, as 'random buff or self-launch' says", () => {
    const r = W.eval(`(function(){ ${arena('Nickel', { plat: false })}
      var _r = Math.random; Math.random = function(){ return 0.99; };
      fireSpecial(A, {}); Math.random = _r;
      return { vy: A.vy, air: !A.onground, pct: A.pct };
    })()`);
    expect(r.vy).toBeLessThan(-4);
    expect(r.air).toBe(true);
  });

  it('Gelatin freezes a foe past 40%, and everyone else still at 15%', () => {
    const at = (name, pct) => W.eval(`(function(){ ${arena(name, { plat: false, foe: { x: 470 } })}
      D.pct = ${pct}; fireSpecial(A, {});
      for (var i=0;i<30;i++){ step(); D.x = 470; D.vx = 0; }
      return D.frozen; })()`);
    expect(at('Gelatin', 25), 'a foe at 25% is not frozen by the syringe').toBe(0);
    expect(at('Gelatin', 60), 'one past 40% is').toBeGreaterThan(0);
    expect(W.eval('freezePct({ kit:{ special:"freeze" } })')).toBe(40);
    expect(W.eval('freezePct({ kit:{ special:"tackle" } })')).toBe(15);
  });

  it("Dora's Rapid Rant is a flurry, and her smash is point blank", () => {
    const r = W.eval(`(function(){ ${arena('Dora', { plat: false, foe: { x: 455 } })}
      fireSpecial(A, {});
      var hits = 0, last = D.pct;
      for (var i=0;i<40;i++){ step(); D.x = 455; D.vx = 0; D.invuln = 0; if (D.pct > last){ hits++; last = D.pct; } }
      return { hits: hits, total: D.pct, len: SMASH_SPEC.rant.len };
    })()`);
    expect(r.hits, 'several jabs, not one').toBeGreaterThanOrEqual(3);
    expect(r.len, 'Point Blank Earful reaches point blank').toBeLessThanOrEqual(160);
  });

  it("Roboty's antenna is the launch for others, a small bounce for him", () => {
    const r = W.eval(`(function(){ ${arena('Roboty', { plat: false, foe: { x: 445 } })}
      fireSpecial(A, {}); return { self: A.vy, foe: D.vy };
    })()`);
    // -24 landed about -15 here; "Tune both" (2026-09-16, test/balance-outliers) took it to -16, which lands about -10.
    expect(r.foe, 'the foe goes up hard').toBeLessThan(-9);
    expect(r.self, 'he does not').toBeGreaterThan(r.foe);
    expect(r.foe - r.self, 'and far harder than his own little bounce').toBeLessThan(-3);
  });

  it("Puffball's Meteor Puff is untouched (the owner kept its timing)", () => {
    const r = W.eval(`(function(){ ${arena('Puffball', { where: 'air', plat: false })}
      var y0 = A.y; doSmash(A); var rose = 0;
      for (var i=0;i<10;i++){ step(); rose = Math.max(rose, y0 - A.y); }
      return { rose: rose, vy: A.vy > 0 };
    })()`);
    expect(r.rose, 'still no rise: it plunges').toBeLessThan(10);
    expect(r.vy).toBe(true);
  });
});

describe('shards and caps break on surfaces', () => {
  it("Ice Cube's downward shards and Pen's low cap end on the floor", () => {
    for (const [name, cast] of [['Ice Cube', 'fireSpecial(A, {})'], ['Pen', 'doAttackSpecial(A)']]) {
      const r = W.eval(`(function(){ ${arena(name, { plat: false })}
        ${cast};
        var deepest = 0;
        for (var i=0;i<70;i++){ step(); projectiles.forEach(function(p){ if (p.owner===A.idx && p.life>0) deepest = Math.max(deepest, p.y); }); }
        return { deepest: deepest, ground: groundY() };
      })()`);
      expect(r.deepest, `${name}: nothing past the floor`).toBeLessThanOrEqual(r.ground + 6);
    }
  });
});
