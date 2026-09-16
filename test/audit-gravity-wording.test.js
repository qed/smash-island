import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "do a check on specials and smashes to see if gravity and wording are changing my intentions."
// Every fighter's special, finisher and smash was measured from the floor, a platform and the air; six
// auditors read the traces against the text and the source and six skeptics tried to refute each
// finding. 63 survived: 41 clear bugs, fixed here ("fix obvious, ask the rest"), and 22 design questions
// that went to the owner. Measured after: shots sinking through the floor went from 49 to 4.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// Caster A on the floor (or a platform x 300..560, top 180 up, or 260 up in the air); up to two dummies.
const arena = (name, { where = 'ground', foe = null, foe2 = null, plat = true } = {}) => `
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var platTop = groundY()-180;
  worldPlats = ${plat ? '[{x:300, y:platTop, w:260, h:16}]' : '[]'};
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 420, groundY()-24, 0);
  A.team=0; A.face=1; A.controller='still'; A.stocks=9;
  var mk = function(n, x, onPlat, idx){ var d = makeFighter(ROSTER.find(function(r){ return r.name===n; }), x, (onPlat ? platTop : groundY())-24, idx); d.team=idx; d.controller='still'; d.stocks=9; return d; };
  var D = ${foe ? `mk(${JSON.stringify(foe.name || 'Pen')}, ${foe.x}, ${!!foe.plat}, 1)` : 'null'};
  var E = ${foe2 ? `mk(${JSON.stringify(foe2.name || 'Pen')}, ${foe2.x}, ${!!foe2.plat}, 2)` : 'null'};
  fighters = [A].concat(D ? [D] : []).concat(E ? [E] : []);
  ${where === 'plat' ? 'A.y = platTop - A.r;' : where === 'air' ? 'A.y = groundY()-260;' : ''}
  for (var k=0;k<3;k++) step();
  ${where === 'air' ? 'A.y = groundY()-260; A.vy=0; A.onground=false;' : ''}
  fighters.forEach(function(f){ f.invuln=0; f.pct=0; f.hitstun=0; f.spCd=0; f.atkCd=0; });`;

const track = `var trackAll = function(frames, cb){ var seen = new Set(), out = [];
  for (var i=0;i<frames;i++){ projectiles.forEach(function(p){ if(p.owner===A.idx && !seen.has(p)){ seen.add(p); out.push({ p:p, maxY:p.y, endLife:null }); } });
    step(); if (cb) cb(i);
    out.forEach(function(o){ if(o.p.life>0) o.maxY = Math.max(o.maxY, o.p.y); else if(o.endLife===null) o.endLife = i; }); }
  return out; };`;

describe('1: a falling shot stops at the surface it reaches', () => {
  it("Firey's ember, Gelatin's syringe and Match's sparks end on the floor instead of sinking off the screen", () => {
    for (const name of ['Firey', 'Gelatin', 'Match', 'Firey Jr.']) {
      const r = W.eval(`(function(){ ${arena(name, { plat: false })} ${track}
        fireSpecial(A, {}); var shots = trackAll(90);
        return { n: shots.length, deepest: Math.max.apply(null, shots.map(function(o){ return o.maxY; })), ground: groundY(), ended: shots.every(function(o){ return o.endLife !== null; }) };
      })()`);
      expect(r.n, `${name} fired`).toBeGreaterThan(0);
      expect(r.deepest, `${name}: never deeper than the floor`).toBeLessThanOrEqual(r.ground + 4);
      expect(r.ended, `${name}: every shot ended`).toBe(true);
    }
  });

  it('a drop lands on the platform its target stands on, and its shadow is drawn there', () => {
    const r = W.eval(`(function(){ ${arena('Blocky', { foe: { x: 480, plat: true } })} ${track}
      fireSpecial(A, {}); var drop = projectiles.filter(function(p){ return p.owner===A.idx; })[0];
      var warnY = drop && drop.warnY; var shots = trackAll(120);
      return { warnY: warnY, platTop: platTop, deepest: shots.length ? shots[0].maxY : null, hit: D.pct };
    })()`);
    expect(r.warnY, 'the shadow is on the platform').toBe(r.platTop);
    expect(r.deepest, 'and the anvil stops there').toBeLessThanOrEqual(r.platTop + 4);
  });

  it('a drop aimed at the floor passes through a platform above the mark', () => {
    const r = W.eval(`(function(){ ${arena('Tree', { foe: { x: 440 } })} ${track}
      fireSpecial(A, {}); var shots = trackAll(140);
      return { deepest: shots.length ? shots[0].maxY : null, ground: groundY(), platTop: platTop };
    })()`);
    expect(r.deepest, 'it did not stop on the platform above its mark').toBeGreaterThan(r.platTop + 40);
    expect(r.deepest).toBeLessThanOrEqual(r.ground + 4);
  });

  it("Woody's fear splinters settle where they land and wait as hazards", () => {
    const r = W.eval(`(function(){ ${arena('Woody', { plat: false })}
      fireSpecial(A, {}); for (var i=0;i<40;i++) step();
      var sp = projectiles.filter(function(p){ return p.owner===A.idx; });
      return { n: sp.length, traps: sp.filter(function(p){ return p.trap && !p.grav && Math.abs(p.y - groundY()) < 12; }).length };
    })()`);
    expect(r.n).toBeGreaterThan(0);
    expect(r.traps, 'settled on the floor as traps').toBe(r.n);
  });
});

describe('2: what is placed goes on the surface under you', () => {
  it("a smash mine cast on a platform sits on the platform (Pen's Power Cap)", () => {
    const r = W.eval(`(function(){ ${arena('Pen', { where: 'plat' })}
      doSmash(A); var m = projectiles.filter(function(p){ return p.owner===A.idx && p._mine; })[0];
      for (var i=0;i<20;i++) step();   // it falls from her hands (see the traps-fall block below)
      return { y: m && m.y, platTop: platTop };
    })()`);
    expect(r.y).toBe(r.platTop - 8);
  });

  it("Tennis Ball's mine and turret, used in the air, rest on the floor below", () => {
    const r = W.eval(`(function(){ ${arena('Tennis Ball', { where: 'air', plat: false })}
      A._gadget='mine'; A.spCd=0; doSpecial(A); var mine = projectiles.filter(function(p){ return p._gadgetMine; })[0];
      for (var i=0;i<30;i++){ step(); A.y = groundY()-260; A.vy = 0; }   // the mine falls to the floor
      A._gadget='turret'; A.spCd=0; doSpecial(A); var tur = projectiles.filter(function(p){ return p.turret; })[0];
      return { mine: mine && mine.y, turret: tur && tur.y, ground: groundY(), r: A.r };
    })()`);
    expect(r.mine).toBe(r.ground - 8);
    expect(r.turret, 'standing on the floor, not in midair').toBeGreaterThan(r.ground - r.r - 12);
  });
});

describe('3: a trap applies its effect when it is stepped on', () => {
  it("Lollipop's Stuck On You mine roots, and Toothpaste's paste trap roots", () => {
    for (const [name, move] of [['Lollipop', 'doSmash(A)'], ['Toothpaste', 'fireSpecial(A, {})']]) {
      const r = W.eval(`(function(){ ${arena(name, { plat: false, foe: { x: 900 } })}
        ${move}; for (var i=0;i<40;i++) step();
        var trap = projectiles.filter(function(p){ return p.owner===A.idx && p.trap; })[0];
        if (!trap) return { trap: false };
        D.x = trap.x; D.y = groundY() - D.r; D.vx = 0; D.invuln = 0; D.rooted = 0;
        for (var j=0;j<4;j++){ step(); D.x = trap.x; }
        return { trap: true, rooted: D.rooted, hit: D.pct };
      })()`);
      expect(r.trap, `${name} left a trap`).toBe(true);
      expect(r.hit, `${name}: the trap hit`).toBeGreaterThan(0);
      expect(r.rooted, `${name}: and rooted`).toBeGreaterThan(20);
    }
  });
});

describe('4: logic', () => {
  it("Lightning's Chain Bolt with nobody in range fizzles, and no longer fires Match's fireballs", () => {
    const r = W.eval(`(function(){ ${arena('Lightning', { plat: false, foe: { x: 1400 } })}
      fireSpecial(A, {}); return { shots: projectiles.filter(function(p){ return p.owner===A.idx; }).length, cd: A.spCd };
    })()`);
    expect(r.shots).toBe(0);
    expect(r.cd).toBeGreaterThan(0);
  });

  it("Liy's grab can be finished with the hurl inside its window, despite the cooldown it set", () => {
    const r = W.eval(`(function(){ ${arena('Liy', { plat: false, foe: { x: 470 } })}
      A.face = 1; fireSpecial(A, {}); var grabbed = A._grabbed, cd = A.spCd, pct0 = D.pct;
      fireSpecial(A, { down:true });
      return { grabbed: grabbed, cd: cd, hurled: D.pct - pct0, after: A._grabbed };
    })()`);
    expect(r.grabbed).toBe(1);
    expect(r.cd, 'the grab set a cooldown').toBeGreaterThan(0);
    expect(r.hurled, 'and the hurl still landed').toBeGreaterThanOrEqual(13);
    expect(r.after).toBe(null);
  });

  it("Golf Ball's Zap Shooter reaches a foe up on a ledge", () => {
    const r = W.eval(`(function(){ ${arena('Golf Ball', { foe: { x: 520, plat: true } })}
      fireSpecial(A, {}); for (var i=0;i<30;i++){ step(); D.vx=0; D.vy=0; }
      return { hit: D.pct };
    })()`);
    expect(r.hit).toBeGreaterThan(0);
  });

  it("Flower's finisher only stomps a shockwave when she is on the ground", () => {
    const r = W.eval(`(function(){ ${arena('Flower', { where: 'air', plat: false, foe: { x: 520 } })}
      doAttackSpecial(A); return { hit: D.pct };
    })()`);
    expect(r.hit, 'a grounded foe 100 px away, Flower in the air').toBe(0);
  });

  it("Profily's price tag pays out for Profily", () => {
    const r = W.eval(`(function(){ ${arena('Profily', { plat: false, foe: { x: 480 } })}
      applyHit(D, 10, 0, 0, A); var plain = D.pct;
      D.pct = 0; D.invuln = 0; D.hitstun = 0; fireSpecial(A, {}); var tagged = D.defined > 0, afterTag = D.pct;
      D.invuln = 0; D.hitstun = 0; applyHit(D, 10, 0, 0, A);
      return { plain: plain, tagged: tagged, marked: D.pct - afterTag };
    })()`);
    expect(r.tagged).toBe(true);
    expect(r.marked, 'his hit on a tagged foe lands harder').toBeGreaterThan(r.plain * 1.1);
  });

  it("Book's mark, with nobody to blame, never lands on a teammate", () => {
    const r = W.eval(`(function(){ ${arena('Book', { plat: false, foe: { x: 600 }, foe2: { x: 700 } })}
      E.team = A.team; var onMate = 0;
      for (var i=0;i<40;i++){ E.defined = 0; E.defineStacks = 0; A.lastHitBy = null; A.spCd = 0; doSpecial(A); if (E.defined > 0) onMate++; }
      return { onMate: onMate, onFoe: D.defined > 0 };
    })()`);
    expect(r.onMate).toBe(0);
    expect(r.onFoe).toBe(true);
  });
});

describe('5: the words say what the moves do', () => {
  it('text rows that described something the move did not do', () => {
    const r = W.eval(`(function(){
      var desc = function(n){ return ROSTER.find(function(x){ return x.name===n; }).kit.desc; };
      return { weaken: SMASH_EFFECT_TEXT.weaken, kick: SMASH_BLURB_BESPOKE.kick, spike: SMASH_BLURB_BESPOKE.spike,
               sign: SMASH_ID.sign.name, reflect: SMASH_ID.reflect.name,
               marker: smashBlurb(makeFighter(ROSTER.find(function(x){ return x.name==='Marker'; }), 0, 0, 0)),
               fanny: desc('Fanny'), ruby: desc('Ruby'), bell: desc('Bell'), book: desc('Book') };
    })()`);
    expect(r.weaken).toBe('weakens their hits');
    expect(r.kick).toMatch(/becomes a cloud/);
    expect(r.spike).toMatch(/jabs back/);
    expect([r.sign, r.reflect], "author-written names stand (smash-identity); the moves are the owner's call").toEqual(['Cheer Boomerang', 'Mirror Field']);
    expect(r.marker, 'a roll that stops at the first foe does not claim to go through').toMatch(/until it hits someone/);
    expect(r.fanny).toMatch(/charges your next/);
    expect(r.ruby).toMatch(/charges your next/);
    expect(r.bell).not.toMatch(/chargeable/);
    expect(r.book).toMatch(/last hit you/);
  });
});

describe('traps FALL, and land on platforms ("traps should FALL, not appear"; "traps cant fall on platforms")', () => {
  const lay = (name, where, how) => W.eval(`(function(){ ${arena(name, { where })}
    ${how};
    var t = projectiles.filter(function(p){ return p.owner===A.idx && p.trap; })[0];
    if (!t) return { none: true };
    var startY = t.y, fellFrames = 0, triggeredWhileFalling = false;
    var D2 = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), t.x, t.y, 5); D2.team = 5; D2.controller = 'still'; D2.stocks = 9; fighters.push(D2);
    for (var i=0;i<60;i++){
      if (t.falling){ fellFrames++; D2.x = t.x; D2.y = t.y; D2.vy = 0; D2.invuln = 0; if (D2.pct > 0) triggeredWhileFalling = true; }
      else { D2.x = 2000; }
      step();
    }
    return { startY: startY, endY: t.y, rest: t._rest, fellFrames: fellFrames, triggeredWhileFalling: triggeredWhileFalling, platTop: platTop, ground: groundY() };
  })()`);

  it('a trap laid on the floor drops from the fighter to the floor, visibly', () => {
    const r = lay('Firey', 'ground', 'fireSpecial(A, {down:true})');
    expect(r.fellFrames, 'it fell for some frames').toBeGreaterThan(1);
    expect(r.startY, 'from above its resting place').toBeLessThan(r.endY - 8);
    expect(r.endY + r.rest).toBeCloseTo(r.ground, 0);
  });

  it('laid on a platform, it lands on the platform', () => {
    for (const name of ['Firey', 'Taco', 'Gelatin']) {
      const r = lay(name, 'plat', 'fireSpecial(A, {down:true})');
      expect(r.none, name).toBeUndefined();
      expect(r.endY + r.rest, `${name}: on the platform top, not the floor`).toBeCloseTo(r.platTop, 0);
    }
  });

  it('laid in the air above a platform, it falls onto the platform', () => {
    const r = lay('Firey', 'air', 'fireSpecial(A, {down:true})');
    expect(r.fellFrames).toBeGreaterThan(5);
    expect(r.endY + r.rest).toBeCloseTo(r.platTop, 0);
  });

  it('a falling trap does not go off on the way down', () => {
    const r = lay('Bomby', 'air', 'fireSpecial(A, {down:true})');
    expect(r.triggeredWhileFalling).toBe(false);
  });

  it('smash mines fall too', () => {
    const r = lay('Pen', 'air', 'doSmash(A)');
    expect(r.fellFrames).toBeGreaterThan(5);
    expect(r.endY + r.rest).toBeCloseTo(r.platTop, 0);
  });
});
