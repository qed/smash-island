import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "make a dlc: inanimate insanity" (2026-09-21). Batch 1: Knife, Balloon, Lightbulb, Paintbrush, Bomb, their moves from
// the II wiki and the owner's answers ("A random trick each press", "Both", "Electric ball", "rage meter should give bonus
// base attack damage", "3 but up special"). No one from the OSC (OJ, Suitcase, Cabby).

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const arena = (name, body, foeX = 460) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.itemRate=0; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ${foeX}, groundY()-24, 1);
  var E = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), ${foeX} + 90, groundY()-24, 2);
  [A,D,E].forEach(function(f,i){ f.team=i; f.controller='still'; f.stocks=9; }); A.face=1;
  fighters=[A,D,E]; step(); [A,D,E].forEach(function(f){ f.invuln=0; f.hitstun=0; f.spCd=0; f.atkCd=0; f.pct=30; });
  ${body}
})()`);

describe('the Inanimate Insanity DLC', () => {
  it('arrives unlocked, in its own labelled group after the BFDI cast, with no one from the OSC', () => {
    const r = W.eval(`(function(){ PROFILE.viewMode='unlocked'; buildBoard();
      var dlc = ROSTER.filter(function(x){ return x.dlc; }).map(function(x){ return x.name; });
      return { dlc: dlc, open: dlc.every(function(n){ return isUnlocked(ROSTER.find(function(x){ return x.name===n; })); }),
               head: !!document.querySelector('#board .dlchead'), osc: ['OJ','Suitcase','Cabby'].filter(function(n){ return ROSTER.some(function(x){ return x.name===n; }); }) };
    })()`);
    expect(r.dlc).toEqual(['Balloon', 'Bomb', 'Knife', 'Lightbulb', 'Paintbrush',
      'Taco (II)', 'Bow', 'Marshmallow', 'Apple', 'Baseball', 'Pickle', 'Nickel (II)', 'Paper', 'Microphone', 'Salt', 'Test Tube']);
    expect(r.open).toBe(true);
    expect(r.head).toBe(true);
    expect(r.osc).toEqual([]);
  });

  it("Knife's Bag of Tricks comes out in a fixed order, and the smoke is a ring that spreads", () => {
    // "knife should have an order to the abilities he uses from his bag of tricks" (2026-09-22). It used to roll
    // a die every press, so you could not plan with it. Smoke, blade, caltrops, hook, and back to the smoke.
    const r = arena('Knife', `
      var seen = [];
      for (var n=0; n<5; n++){
        projectiles = []; D._stunFx = 0; D.invuln = 0; A.spCd = 0; D.x = 900;   // out of reach, so nothing is eaten on contact
        doSpecial(A);
        var ring = projectiles.find(function(p){ return p.shape==='smokering'; });
        var blade = projectiles.some(function(p){ return p.boomerang; });
        var trap = projectiles.some(function(p){ return p.trap; });
        if (ring){ var r0 = ring.r; for (var i=0;i<8;i++) step(); seen.push('smoke:' + (ring.r > r0 ? 'grew' : 'flat')); }
        else { seen.push(blade ? 'blade' : (trap ? 'caltrops' : 'hook')); for (var j=0;j<8;j++) step(); }
      }
      return seen;`);
    expect(r).toEqual(['smoke:grew', 'blade', 'caltrops', 'hook', 'smoke:grew']);
  });

  it('Balloon rockets through foes, falls slowly, and his insults weaken', () => {
    const r = arena('Balloon', `
      doSpecial(A); for (var i=0;i<10;i++) step(); var dashHit = D.pct > 30;
      A.x = 200; A.y = groundY()-300; A.vy = 0; A.onground = false; var y0 = A.y; for (var j=0;j<20;j++) step(); var fell = A.y - y0;
      var P = makeFighter(ROSTER.find(function(x){ return x.name==='Pen'; }), 200, groundY()-300, 5); P.controller='still'; P.team=5; fighters.push(P); P.vy=0; P.onground=false;
      var py = P.y; for (var k=0;k<20;k++) step(); var penFell = P.y - py;
      A.x = 400; A.y = groundY()-24; D.x = 440; D.weakened = 0; doDownSpecial(A);
      return { dashHit: dashHit, fell: fell, penFell: penFell, weakened: D.weakened > 0 };`);
    expect(r.dashHit).toBe(true);
    expect(r.fell, 'helium: he falls far slower than Pen').toBeLessThan(r.penFell * 0.8);
    expect(r.weakened).toBe(true);
  });

  it("Lightbulb's electric ball stuns and arcs to a second foe", () => {
    const r = arena('Lightbulb', `
      doSpecial(A);
      for (var i=0;i<40 && !(D.pct > 30 && E.pct > 30);i++){ step(); D.x=460; E.x=540; }
      return { first: D.pct > 30, second: E.pct > 30, stunned: D._stunFx > 0 || E._stunFx > 0 };`, 460);
    expect(r.first && r.second, 'the charge jumps to the next foe').toBe(true);
  });

  it("Paintbrush's rage fills from hits, makes their hits harder and burning, and pays out a Heat Explosion", () => {
    const r = arena('Paintbrush', `
      A.atkCd = 0; D.pct = 30; doAttack(A); var calm = D.pct - 30;
      applyHit(A, 26, 0, 0, D); var rage = A._fury;   // 26 damage: 65 rage, still over half after it cools for 30 frames
      for (var i=0;i<30;i++){ step(); D.x = 460; } D.pct = 30; D.burn = 0; D.invuln = 0; A.atkCd = 0; doAttack(A); var angry = D.pct - 30, burning = D.burn > 0;
      A._fury = 100; D.pct = 30; D.invuln = 0; doSpecial(A);
      return { calm: calm, rage: rage, angry: angry, burning: burning, blast: D.pct - 30, after: A._fury };`);
    expect(r.rage, 'a big hit fills more than half the meter').toBeGreaterThanOrEqual(50);
    expect(r.angry, 'a harder hit').toBeGreaterThan(r.calm * 1.2);
    expect(r.burning, 'burning bristles').toBe(true);
    expect(r.blast, 'the Heat Explosion').toBeGreaterThanOrEqual(18);
    expect(r.after, 'and the rage is spent').toBe(0);
  });

  it("Bomb's Collision blows up on the first foe he bumps into, and costs him a little; his spin is the up special", () => {
    const r = arena('Bomb', `
      var self0 = A.pct; doSpecial(A);
      for (var i=0;i<14;i++){ step(); }
      return { hit: +(D.pct - 30).toFixed(1), self: +(A.pct - self0).toFixed(1), up: UPSPEC.collide.shape };`, 470);
    expect(r.hit).toBeGreaterThanOrEqual(18);
    expect(r.self).toBeGreaterThanOrEqual(3);
    expect(r.up).toBe('spin');
  });
});

// Batch 2 (2026-09-22): "add the next set of 12 ii characters, based on canon." Eleven playable and Pepper, who is
// Salt's partner. The owner's calls: Pickle is the glass cannon AND the injury tank; Paper's Evil meter fills when he
// HITS people, and Evil Paper drops Idiotic Island debris; Nickel is Sarcasm Is An Art; Microphone is Loud and Proud.
describe('the Inanimate Insanity DLC, batch 2', () => {
  it('Pepper follows Salt, echoes her, can be knocked out alone, and comes back with Salt\'s next stock', () => {
    const r = arena('Salt', `
      for (var i=0;i<20;i++) step();
      var p = pepperOf(A);
      var near = p ? Math.abs(p.x - A.x) : 999;
      D.x = 3000; E.x = 3200;                        // nothing for the shots to hit, so they are all still in the air
      projectiles = []; doSpecial(A);
      var mine = projectiles.filter(function(q){ return q.owner===A.idx; }).length;
      for (var j=0;j<PEPPER_LAG+3;j++) step();
      var afterEcho = projectiles.filter(function(q){ return q.owner===A.idx; }).length;
      p.hp = 0; step();
      var gone = !pepperOf(A), flagged = !!A._pepperDown;
      A.stocks = 3; eliminate(A);                      // a lost stock brings her back
      for (var k=0;k<4;k++) step();
      return { near: near, mine: mine, afterEcho: afterEcho, gone: gone, flagged: flagged, back: !!pepperOf(A) };`);
    expect(r.near, 'she walks a step behind her').toBeLessThan(60);
    expect(r.afterEcho, 'Pepper throws after Salt does').toBeGreaterThan(r.mine);
    expect(r.gone && r.flagged, 'she can go down on her own').toBe(true);
    expect(r.back, 'and she is back for the next stock').toBe(true);
  });

  it("Paper's meter fills when he LANDS hits, and a full meter brings Evil Paper out", () => {
    const r = arena('Paper', `
      var m0 = A._evilM||0;
      for (var i=0;i<6;i++){ A.atkCd=0; D.invuln=0; doAttack(A); }
      var afterHitting = A._evilM||0;
      A._evilM = 0; applyHit(A, 20, 0, 0, D);
      var afterBeingHit = A._evilM||0;
      A._evilM = 100; A.spCd = 0; doSpecial(A);
      var evil = A._evil > 0;
      D.pct = 30; D.invuln = 0; A.atkCd = 0; doAttack(A); var angry = D.pct - 30;
      return { m0: m0, afterHitting: afterHitting, afterBeingHit: afterBeingHit, evil: evil, angry: angry };`, 440);
    expect(r.m0).toBe(0);
    expect(r.afterHitting, 'landing hits is what fills it').toBeGreaterThan(20);
    expect(r.afterBeingHit, 'taking one does not').toBe(0);
    expect(r.evil, 'C at a full meter fronts Evil Paper').toBe(true);
    expect(r.angry, 'and Evil Paper hits harder').toBeGreaterThan(7);
  });

  it('Pickle hits harder the worse he is hurt, and a dive that touches nobody splats him', () => {
    const r = arena('Pickle', `
      A.pct = 0; D.pct = 30; D.invuln = 0; A.atkCd = 0; doAttack(A); var fresh = D.pct - 30;
      A.pct = 120; D.pct = 30; D.invuln = 0; A.atkCd = 0; doAttack(A); var hurt = D.pct - 30;
      A.pct = 0; A.spCd = 0; D.x = 2000; E.x = 2200; doSpecial(A);   // nobody in the way: the dive has to miss
      for (var i=0;i<40;i++) step();
      return { fresh: fresh, hurt: hurt, splat: A.hitstun > 0 || projectiles.some(function(p){ return p.owner===A.idx && p.trap; }) };`);
    expect(r.hurt, 'the most injured contestant on the wiki').toBeGreaterThan(r.fresh * 1.2);
    expect(r.splat, 'he lands in it').toBe(true);
  });

  it("Nickel's sarcasm lands harder on someone who has taken more, and the waffles snap him back", () => {
    const r = arena('Nickel (II)', `
      D.pct = 10; D.invuln = 0; A.atkCd = 0; doAttack(A); var calm = D.pct - 10;
      D.pct = 150; D.invuln = 0; A.atkCd = 0; doAttack(A); var rattled = D.pct - 150;
      var x0 = A.x; doDownSpecial(A); var split = !!A._nsplit;
      A.x = x0 + 260; A._nsplit.t = 1; step();
      return { calm: calm, rattled: rattled, split: split, home: Math.abs(A.x - x0) < 2 };`);
    expect(r.rattled, 'the more they have taken, the more it lands').toBeGreaterThan(r.calm * 1.2);
    expect(r.split).toBe(true);
    expect(r.home, 'Dark Nickel snaps back to where Light Nickel stood').toBe(true);
  });

  it("Marshmallow's time machine puts her back where she stood", () => {
    const r = arena('Marshmallow', `
      for (var i=0;i<60;i++) step();
      var x0 = A.x;
      A.x = x0 + 300; A.pct = 40; for (var j=0;j<3;j++) step();
      doDownSpecial(A);
      return { back: A.x < x0 + 300, healed: A.pct < 40 };`);
    expect(r.back).toBe(true);
    expect(r.healed).toBe(true);
  });

  it("Microphone's button switches Loud and Quiet, and Loud hits harder", () => {
    const r = arena('Microphone', `
      A._loud = false; D.pct = 30; D.invuln = 0; A.atkCd = 0; doAttack(A); var quiet = D.pct - 30;
      doDownSpecial(A); var nowLoud = !!A._loud;
      D.pct = 30; D.invuln = 0; A.atkCd = 0; doAttack(A); var loud = D.pct - 30;
      return { quiet: quiet, loud: loud, nowLoud: nowLoud };`);
    expect(r.nowLoud).toBe(true);
    expect(r.loud).toBeGreaterThan(r.quiet);
  });

  it("Bow's chair catch gives her a jump back when it connects, Taco's arms drag a foe in, Apple's doodle goes through", () => {
    const bow = arena('Bow', `A.jumps = 0; D.x = A.x + 20; D.y = feetY(A); D.invuln = 0; doDownSpecial(A);
      return { jumps: A.jumps, hit: D.pct > 30 };`);
    expect(bow.hit && bow.jumps > 0, 'catching someone with it is the recovery').toBe(true);
    const taco = arena('Taco (II)', `var x0 = D.x; doDownSpecial(A); for (var i=0;i<8;i++) step(); return { pulled: D.x < x0 };`, 540);
    expect(taco.pulled).toBe(true);
    const apple = arena('Apple', `doSpecial(A);
      for (var i=0;i<40 && !(D.pct>30 && E.pct>30);i++){ step(); D.x=460; E.x=560; D.invuln=0; E.invuln=0; }
      return { both: D.pct > 30 && E.pct > 30 };`, 460);
    expect(apple.both, 'the doodle tears through the first one and keeps going').toBe(true);
  });

  it('Test Tube shatters into poison when struck with the glass up, and Baseball plants himself', () => {
    const tt = arena('Test Tube', `doDownSpecial(A); var up = A._shatter > 0;
      D.x = 440; D._poisonT = 0; applyHit(A, 8, 0, 0, D);
      return { up: up, spent: A._shatter === 0, poisoned: (D._poisonT||0) > 0 };`, 440);
    expect(tt.up && tt.spent).toBe(true);
    expect(tt.poisoned, 'everything near her is poisoned').toBe(true);
    const bb = arena('Baseball', `var x0 = D.x; doSpecial(A); step();
      return { armor: A.armor > 0, shoved: D.x > x0, dmg: D.pct - 30 };`, 440);
    expect(bb.armor && bb.shoved).toBe(true);
    expect(bb.dmg, 'Too Heavy is a shove, not a hit').toBe(0);
  });
});
