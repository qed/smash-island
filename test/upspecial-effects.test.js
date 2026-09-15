import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// Three owner's calls in one message. "nerf smash charge time (make it longer for all 'short' charge
// time characters)": nobody charges faster than SMASH_FULL now. "reduce the time between specials":
// every special's cooldown, floors included, leaves fireSpecial scaled by SPECIAL_CD_SCALE. And the
// vocabulary the up-special redesign is written in -- self{} buffs at cast, hit.eff on the swing, a
// shot{} -- plus Teardrop's taunt: Evaporate marks everyone near where she stood, and her next hit
// on a marked foe lands TAUNT_BONUS harder ("like with Eraser in canon").

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const pair = (a, b, dist = 40) => `
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(a)}; }), 400, groundY()-24, 0);
  var E = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(b)}; }), 400+${dist}, groundY()-24, 1);
  A.team=0; E.team=1; A.face=1; E.face=-1;
  [A,E].forEach(function(f){ f.controller='still'; f.invuln=0; f.spCd=0; f.atkCd=0; f.stocks=9; });
  fighters=[A,E]; step(); A.invuln=0; E.invuln=0; A.pct=0; E.pct=0; A.spCd=0;`;

describe('smash charge time', () => {
  it('is never shorter than the baseline: the lightest fighter charges in 24, the heaviest still in 32', () => {
    const r = W.eval(`(function(){
      var byW = ROSTER.filter(function(r){ return r.play; }).sort(function(a,b){ return a.w-b.w; });
      var light = makeFighter(byW[0], 0, 0, 0), heavy = makeFighter(byW[byW.length-1], 0, 0, 1), mid = makeFighter(ROSTER.find(function(r){ return r.name==='Match'; }), 0, 0, 2);
      return { light: [byW[0].name, smashFullOf(light)], heavy: [byW[byW.length-1].name, smashFullOf(heavy)], mid: smashFullOf(mid), base: SMASH_FULL,
               floor: Math.min.apply(null, byW.map(function(r){ return smashFullOf(makeFighter(r, 0, 0, 0)); })) };
    })()`);
    expect(r.light[1], `${r.light[0]} charges no faster than the baseline`).toBe(r.base);
    expect(r.mid).toBe(24);
    expect(r.heavy[1], `${r.heavy[0]} still takes the long charge`).toBe(32);
    expect(r.floor).toBe(r.base);
  });
});

describe('the time between specials', () => {
  it('is scaled on the way out of fireSpecial, floors included, and not when a special is called directly', () => {
    const r = W.eval(`(function(){ ${pair('Firey', 'Leafy', 200)}
      doSpecial(A); var direct = A.spCd;                    // Firey's ember writes 48; the door is not involved
      A.spCd = 0; fireSpecial(A, {}); var neutral = A.spCd;  // the 55 floor, scaled
      A.spCd = 0; fireSpecial(A, {down:true}); var down = A.spCd;
      A.spCd = 0; A.onground = true; fireSpecial(A, {up:true}); var up = A.spCd;
      return { direct: direct, neutral: neutral, down: down, up: up, k: SPECIAL_CD_SCALE };
    })()`);
    expect(r.k).toBeLessThan(1);
    expect(r.direct).toBe(48);
    expect(r.neutral).toBe(Math.round(55 * r.k));
    expect(r.down).toBe(Math.round(64 * r.k));
    expect(r.up).toBe(Math.round(60 * r.k));
  });
});

describe('the up-special vocabulary', () => {
  it('self{} buffs the caster at cast', () => {
    const r = W.eval(`(function(){ ${pair('Coiny', 'Leafy', 300)}
      A.pct = 20; A.jumps = 0;
      riseShape(A, { shape:'hop', power:-12, self:{ armor:30, invuln:6, heal:3, healing:60, haste:30, empower:1, cloud:90, jumps:1 } });
      return { armor:A.armor, invuln:A.invuln, pct:A.pct, healing:A.healing, haste:A._hasteT, empower:A._empower, cloud:A.cloud, jumps:A.jumps, vy:A.vy };
    })()`);
    expect(r.armor).toBeGreaterThanOrEqual(30);
    expect(r.invuln).toBeGreaterThanOrEqual(6);
    expect(r.pct).toBe(17);
    expect(r.healing).toBeGreaterThanOrEqual(60);
    expect(r.haste).toBeGreaterThanOrEqual(30);
    expect(r.empower).toBe(1);
    expect(r.cloud).toBeGreaterThanOrEqual(90);
    expect(r.jumps).toBe(1);
    expect(r.vy).toBe(-12);
  });

  it('hit.eff puts a status on everyone the swing hits, and on nobody it misses', () => {
    const r = W.eval(`(function(){ ${pair('Coiny', 'Leafy', 30)}
      var far = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 700, groundY()-24, 2); far.team=2; far.controller='still'; far.invuln=0; far.stocks=9; fighters.push(far);
      riseShape(A, { shape:'hop', power:-12, hit:{ off:-10, fx:0, reach:20, dmg:[3,6], band:null, kb:[3,-8], eff:'root', n:40 } });
      return { hit: E.pct, rooted: E.rooted, farRooted: far.rooted || 0, farHit: far.pct };
    })()`);
    expect(r.hit).toBeGreaterThan(0);
    expect(r.rooted).toBeGreaterThanOrEqual(38);
    expect(r.farRooted).toBe(0);
    expect(r.farHit).toBe(0);
  });

  it('shot{} fires one projectile the way the caster faces, carrying its status', () => {
    const r = W.eval(`(function(){ ${pair('Coiny', 'Leafy', 300)}
      A.face = -1;
      riseShape(A, { shape:'hop', power:-12, shot:{ vx:9, vy:-2, grav:true, dmg:6, kb:5, r:8, life:50, fxTag:'slow', fxN:60 } });
      var p = projectiles[projectiles.length-1];
      return { n: projectiles.length, vx: p.vx, vy: p.vy, grav: p.grav, dmg: p.dmg, fx: p.fxTag, life: p.life, owner: p.owner };
    })()`);
    expect(r.n).toBe(1);
    expect(r.vx).toBe(-9);
    expect(r.vy).toBe(-2);
    expect(r.grav).toBe(true);
    expect(r.dmg).toBe(6);
    expect(r.fx).toBe('slow');
    expect(r.owner).toBe(0);
  });
});

describe("Teardrop's taunt", () => {
  it('Evaporate still goes 140 up with 18 invuln and a jump back, and marks everyone near where she stood', () => {
    const r = W.eval(`(function(){ ${pair('Teardrop', 'Leafy', 40)}
      var far = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 700, groundY()-24, 2); far.team=2; far.controller='still'; far.stocks=9; fighters.push(far);
      A.jumps = 0; var y0 = A.y;
      doUpSpecial(A);
      return { rose: y0 - A.y, inv: A.invuln, jumps: A.jumps, near: E._taunted, by: E._tauntedBy, far: far._taunted || 0, frames: TAUNT_FRAMES, icon: STATUS_ICONS.some(function(s){ return s.key==='taunted' && s.on(E); }) };
    })()`);
    expect(r.rose).toBeGreaterThanOrEqual(140);
    expect(r.inv).toBeGreaterThanOrEqual(18);
    expect(r.jumps).toBe(1);
    expect(r.near).toBe(r.frames);
    expect(r.by).toBe(0);
    expect(r.far, 'out of reach, not marked').toBe(0);
    expect(r.icon).toBe(true);
  });

  it('her next hit on a marked foe lands TAUNT_BONUS harder, once; nobody else cashes the mark', () => {
    const r = W.eval(`(function(){ ${pair('Teardrop', 'Leafy', 40)}
      var O = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 460, groundY()-24, 2); O.team=2; O.controller='still'; O.stocks=9; fighters.push(O);
      E.pct = 0; applyHit(E, 10, 2, -2, A); var plain = E.pct;
      E.pct = 0; E._taunted = TAUNT_FRAMES; E._tauntedBy = A.idx; E.hitstun = 0; E.invuln = 0;
      applyHit(E, 10, 2, -2, O); var other = E.pct;            // someone else's hit does not spend it
      var still = E._taunted;
      E.pct = 0; E.hitstun = 0; E.invuln = 0; applyHit(E, 10, 2, -2, A); var marked = E.pct, spent = E._taunted;
      E.pct = 0; E.hitstun = 0; E.invuln = 0; applyHit(E, 10, 2, -2, A); var again = E.pct;
      return { plain: plain, other: other, still: still, marked: marked, spent: spent, again: again, bonus: TAUNT_BONUS };
    })()`);
    expect(r.bonus).toBe(0.5);
    expect(r.other).toBeCloseTo(r.plain, 5);
    expect(r.still).toBeGreaterThan(0);
    expect(r.marked).toBeCloseTo(r.plain + r.bonus, 5);
    expect(r.spent).toBe(0);
    expect(r.again).toBeCloseTo(r.plain, 5);
  });

  it('the mark wears off on its own', () => {
    const r = W.eval(`(function(){ ${pair('Teardrop', 'Leafy', 40)}
      E._taunted = 5; E._tauntedBy = A.idx;
      for (var i=0;i<8;i++) step();
      return { t: E._taunted, by: E._tauntedBy };
    })()`);
    expect(r.t).toBe(0);
    expect(r.by).toBe(null);
  });
});
