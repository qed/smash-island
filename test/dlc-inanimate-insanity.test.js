import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';
import { loadMonolith } from './helpers/load-monolith.js';

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
  it('arrives unlocked bar its Vault fighters, in its own labelled group after the BFDI cast, with no one from the OSC', () => {
    // The pack used to arrive whole. Then the owner put some of it in the Vault (2026-09-24): "Wal-mart is for
    // marshmallow", then "add more dlc codes". Then "there are more dlc fighters in the vault then normal fighters." --
    // "no, just remove dlc codes." -- "remove pickle and paintbrush." (Microphone in Paintbrush's place: Paintbrush never
    // was in the Vault). So five open only with their code (test/vault.test.js opens each one); the other eleven,
    // Pickle and Microphone among them again, are open on a fresh save.
    const r = W.eval(`(function(){ PROFILE.viewMode='unlocked'; buildBoard();
      var dlc = ROSTER.filter(function(x){ return x.dlc; }).map(function(x){ return x.name; });
      var isOpen = function(n){ return isUnlocked(ROSTER.find(function(x){ return x.name===n; })); };
      return { dlc: dlc, open: dlc.filter(isOpen), shut: dlc.filter(function(n){ return !isOpen(n); }),
               head: !!document.querySelector('#board .dlchead'), osc: ['OJ','Suitcase','Cabby','The Floor','Floor'].filter(function(n){ return ROSTER.some(function(x){ return x.name===n; }); }),
               heads: document.querySelectorAll('#board .dlchead').length,
               afterHead: (function(){ var out = [], on = false; Array.prototype.forEach.call(document.getElementById('board').children, function(c){
                 if (c.classList.contains('dlchead')) on = true; else if (on) out.push(c.querySelector('.cellname').textContent); }); return out; })() };
    })()`);
    // "add the last set of dlc fighters." (2026-09-27): batch 3 adds these 26 after the first sixteen (this list pinned the
    // older sixteen-fighter decision). All 26 arrive unlocked; none is a Vault fighter.
    const BATCH3 = ['Box', 'Trophy', 'Goo', 'Lifering', 'Bonesaw', 'Spikey', 'Candle', 'Cammy', 'Cheesy', 'Dough', 'Fan', 'Soap',
      'Tissues', 'Yin-Yang', 'Starfruit', 'Blueberry', 'Cherries', 'Clover', 'Jack', 'Magnet', 'MeTag', 'Poppy', 'Silver Spoon',
      'Tapey', 'Tea Kettle', 'Teddy Bear'];
    // "oh, and bot should get their own kit." (2026-09-29): Bot, who was only Test Tube's summon, is a playable II fighter after batch 3,
    // "With the II DLC": open from the start like the rest of the pack, and not a Vault fighter.
    const BOT = ['Bot'];
    expect(r.dlc).toEqual(['Balloon', 'Bomb', 'Knife', 'Lightbulb', 'Paintbrush',
      'Taco (II)', 'Bow', 'Marshmallow', 'Apple', 'Baseball', 'Pickle', 'Nickel (II)', 'Paper', 'Microphone', 'Salt', 'Test Tube', ...BATCH3, ...BOT]);
    expect(r.open).toEqual(['Bomb', 'Knife', 'Paintbrush', 'Apple', 'Baseball', 'Pickle', 'Nickel (II)', 'Paper', 'Microphone', 'Salt', 'Test Tube', ...BATCH3, ...BOT]);
    expect(r.shut).toEqual(['Balloon', 'Lightbulb', 'Taco (II)', 'Bow', 'Marshmallow']);
    expect(r.head).toBe(true);
    expect(r.heads, 'one DLC group on the board').toBe(1);
    expect(r.afterHead.filter((n) => !r.dlc.includes(n)), 'only DLC fighters after the DLC label').toEqual([]);
    expect([...BATCH3, ...BOT].filter((n) => !r.afterHead.includes(n)), 'batch 3 and Bot sit in the DLC group with the rest').toEqual([]);
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

  it("Paper's meter fills mostly from LANDING hits, a little from taking them, and a full one brings Evil Paper out", () => {
    // "except its when he hits ppl" -- and then, after a balance pass found Evil Paper came out 15 times in 16 games,
    // "1 and 3": it fills faster from his hits, and a little when he is hit.
    const r = arena('Paper', `
      var m0 = A._evilM||0;
      for (var i=0;i<6;i++){ A.atkCd=0; D.invuln=0; doAttack(A); }
      var afterHitting = A._evilM||0;
      A._evilM = 0; applyHit(A, 10, 0, 0, D);
      var afterBeingHit = A._evilM||0;
      A._evilM = 0; D.invuln = 0; D.pct = 30; applyHit(D, 10, 0, 0, A);
      var afterLanding = A._evilM||0;
      A._evilM = 100; A.spCd = 0; doSpecial(A);
      var evil = A._evil > 0;
      D.pct = 30; D.invuln = 0; A.atkCd = 0; doAttack(A); var angry = D.pct - 30;
      return { m0: m0, afterHitting: afterHitting, afterBeingHit: afterBeingHit, afterLanding: afterLanding, evil: evil, angry: angry };`, 440);
    expect(r.m0).toBe(0);
    expect(r.afterHitting, 'landing hits is what fills it').toBeGreaterThan(20);
    expect(r.afterBeingHit, 'taking a hit fills it a little').toBeGreaterThan(0);
    expect(r.afterLanding, 'but landing the same hit fills it much more').toBeGreaterThan(r.afterBeingHit * 2);
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
    // The bonus was +45%, then +25%, then +10% over three balance rounds (he won 63%, 58%, 67% of his games).
    // Badly hurt, he swings exactly 10% harder: still the most injured contestant on the wiki, no longer the scariest.
    expect(r.hurt, 'the most injured contestant on the wiki').toBeGreaterThan(r.fresh * 1.05);
    expect(r.hurt / r.fresh, 'and the bonus stops at +10%').toBeCloseTo(1.10, 2);
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

  it("Marshmallow's scream shatters glass, fire heals her, and she cannot use gravity", () => {
    // The Wall-Mart shopping list was mostly other people's purchases, and the time machine is the one thing canon
    // says she CANNOT use. What the wiki gives her is a body and a voice: Apple told her that her voice "didn't
    // shatter any glass", so she shattered Test Tube to pieces -- the only contestant to kill another with her voice.
    const glass = arena('Marshmallow', `
      var T = makeFighter(ROSTER.find(function(x){ return x.name==='Test Tube'; }), A.x + 60, groundY()-24, 5);
      T.team=5; T.controller='still'; T.invuln=0; T.pct=30; fighters.push(T);
      D.x = A.x + 60; D.invuln = 0; D.pct = 30;
      doSpecial(A); var soft = D.pct - 30; A.spCd = 0;
      D.x = 3000; T.invuln = 0; doSpecial(A);
      return { soft: +soft.toFixed(1), glass: +(T.pct-30).toFixed(1) };`);
    expect(glass.soft, 'anyone else just gets shouted at').toBeGreaterThan(0);
    expect(glass.glass, 'Test Tube goes to pieces').toBeGreaterThan(glass.soft * 1.5);

    const fire = arena('Marshmallow', `
      A.pct = 40; D.pct = 40; A.burn = 60; D.burn = 60;
      var p0 = A.pct, q0 = D.pct;
      for (var i=0;i<40;i++){ step(); A.invuln = 9; D.invuln = 9; }   // burn ticks through invuln; nothing else lands
      return { marsh: +(A.pct - p0).toFixed(2), pen: +(D.pct - q0).toFixed(2) };`);
    expect(fire.marsh, "Knife roasted her into a s'more and she healed it off herself").toBeLessThan(0);
    expect(fire.pen, 'everyone else just burns').toBeGreaterThan(0);

    const drift = arena('Marshmallow', `
      A.onground = false; A.y = groundY() - 300; A.vx = 5; A.vy = 0;
      for (var i=0;i<20;i++){ step(); A.y = groundY() - 300; A.vy = 0; }
      return +A.vx.toFixed(2);`);
    expect(drift, 'she steps off a cliff and goes sideways').toBeGreaterThanOrEqual(5);
  });

  // Bow's special was Possession (2026-09-22, "a bit more to do with her abilities as a ghost. this is for the special only"), then
  // Telekinesis -- three held snowballs ("In "Snow Bow", Bow was able to levitate snowballs without touching them", the II wiki), then
  // (2026-10-13) Levitate: the owner said "the snowballs arent good. they cant combo, cant kill, and cant recover", picked "Recover:
  // Levitate", and gave "special permission to make a new, non-canon special".
  // RESTATED (2026-10-18): the owner changed the design again -- "the move should be teleport-not levitate. it should go 340 px." --
  // and picked "Aim with arrows", "Pop on arrival" and "Once per airtime". Each pin below is the old promise in Teleport's terms.
  // The pins that stay: nobody changes sides, Possession's machinery is gone, nothing is thrown, a boss is hit only when she is in it.
  it("Bow's special is Teleport: she fades out, appears 340 px up with nothing held, and pops the foe where she appears -- no snowballs, no Possession", () => {
    const r = arena('Bow', `
      E.x = A.x + 400; var y0 = A.y, climb = null; D.x = A.x; D.y = y0 - 340; D.vy = 0; D.onground = false; doSpecial(A);
      var fading = !!A._tp, frames = 0, hits = [], last = D.pct;
      for (var i=0;i<60;i++){ var was = !!A._tp; step(); if (was) frames++; if (A._tp){ D.x = A.x; D.y = y0 - 340; D.vy = 0; }
        if (was && !A._tp) climb = Math.round(y0 - A.y);
        if (D.pct > last + 0.01){ hits.push(+(D.pct - last).toFixed(2)); last = D.pct; } D.invuln = 0; }
      return { fading: fading, frames: frames, climb: climb, hits: hits, shots: projectiles.filter(function(p){ return p.shape==='snowball' || p.tkHold !== undefined; }).length,
               sides: [D.team, E.team], possession: typeof endPossession !== 'undefined', card: MOVE_TEXT['Bow'].special, desc: A.kit.desc };`);
    expect(r.fading).toBe(true);
    expect(r.frames, 'a short fade (8 frames), then she is there').toBe(8);
    expect(r.climb, '"it should go 340 px": straight up with nothing held').toBe(340);
    expect(r.hits, 'the foe where she appears takes 6%, once').toEqual([6]);
    expect(r.shots, 'the snowballs are gone').toBe(0);
    expect(r.sides, 'nobody changes sides any more').toEqual([1, 2]);
    expect(r.possession, 'Possession and its machinery are gone').toBe(false);
    expect(r.card).toMatch(/^Teleport — /);
    expect(r.desc).toMatch(/^Teleport/);
    expect(r.card + r.desc).not.toMatch(/possess|snowball|telekinesis → |levitat/i);
  });

  it("Bow aims where she holds while she fades (the last arrows count; the jump key is her up and spends no jump), and a KO ends it", () => {
    const r = arena('Bow', `
      D.x = A.x + 900; E.x = A.x + 900; A.x = 500; A.y = groundY() - 220; A.onground = false; A.vy = 0; A.jumps = 1;
      var inputs = {}; var saved = netRemoteInput; netRemoteInput = function(i){ return inputs[i] || null; }; A.controller = 'remote';
      var out = {}, x0 = A.x, y0 = A.y;
      doSpecial(A); inputs[0] = { left: true }; for (var i=0;i<4;i++) step(); inputs[0] = { right: true }; for (var j=0;j<4;j++) step();
      out.turned = [Math.round(A.x - x0), Math.round(A.y - y0)];
      A.x = 500; A.y = groundY() - 220; A.vy = 0; A._tpUsed = false; A.spCd = 0; x0 = A.x; y0 = A.y;
      doSpecial(A); inputs[0] = { right: true, jump: true }; for (var k=0;k<8;k++) step();   // jump + right: up and right, so the jump key must be read as up
      out.up = [Math.round(A.x - x0), Math.round(A.y - y0)];
      inputs[0] = { jump: true }; for (var m=0;m<8;m++) step(); out.jumps = A.jumps;   // still held after she appears: not a fresh jump
      A._tpUsed = false; A.spCd = 0; doSpecial(A); inputs[0] = {}; step();
      netRemoteInput = saved; A.controller = 'still';
      eliminate(A); step(); out.afterKO = { tp: !!A._tp, used: !!A._tpUsed, fade: A._tpT || 0 }; return out;`);
    expect(r.turned, 'left at first, then right: the arrows held as the fade ends are the way she goes').toEqual([340, 0]);
    expect(r.up, 'the jump key is her up while she fades (with right: the up-right diagonal)').toEqual([240, -240]);
    expect(r.jumps, 'and does not spend a jump, even held on after she appears').toBe(1);
    expect(r.afterKO).toEqual({ tp: false, used: false, fade: 0 });
  });

  it("in Boss Rush Bow's Teleport pops the boss where she appears, once, since there is no one else to hit", () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
      BOSSRUSH = { active:false, bossIdx:6, cleared:0, defeated:false, loop:0, dmgMult:1 };
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Bow'; }), 300, groundY()-24, 0);
      A.team=0; A.controller='remote'; A.stocks=9; fighters=[A];
      var inputs = {}; var saved = netRemoteInput; netRemoteInput = function(i){ return inputs[i] || null; };
      spawnBossRushBoss();
      var b = summons.find(function(s){ return s.type==='boss'; }); b._atkTimer = 1e9;
      step(); A.invuln=300; A.spCd=0; var bx = b.x, by = b.y; A.x = bx - 340; A.y = by; A.vy = 0; A.onground = false; A.face = 1;
      var hp0 = b.hp; doSpecial(A);
      for (var i=0;i<12;i++){ inputs[0] = { right: true }; step(); if (A._tp){ b.x = bx; b.y = by; } b._atkTimer = 1e9; A.invuln = 300; A.hitstun = 0; }   // (his body hurts her too: this pins what SHE does to him)
      var first = hp0 - b.hp;
      for (var j=0;j<60;j++){ inputs[0] = {}; step(); b._atkTimer = 1e9; A.invuln = 300; A.hitstun = 0; }
      netRemoteInput = saved;
      return { first: first, total: hp0 - b.hp };
    })()`);
    expect(r.first, 'MePhone4 takes the pop').toBeGreaterThan(0);
    expect(r.total, 'and only once, however long she stays inside him').toBe(r.first);
  });

  // The review's probe (for the snowballs): standing under MePhone4, held snowballs hit him for 15 on the first frame. Teleport has
  // nothing to hold: the same ground is covered by "once": a boss and an add where she appears each take the pop one time.
  it("Bow's Teleport pops an add where she appears once, as it does a boss: one of MePhone4's adds", () => {
    const r = W.eval(`(function(){
      SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
      BOSSRUSH = { active:false, bossIdx:6, cleared:0, defeated:false, loop:0, dmgMult:1 };
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Bow'; }), 300, groundY()-24, 0);
      A.team=0; A.controller='still'; A.stocks=9; fighters=[A];
      spawnBossRushBoss();
      var b = summons.find(function(s){ return s.type==='boss'; }); b._atkTimer = 1e9; b.x = 900;
      step(); A.invuln=300; A.spCd=0; A.x = 300; A.face = 1;
      var y0 = A.y, a = meLifeDownload(b, 1); a._dl = 0; a.x = A.x; a.y = y0 - 340; a.vx = 0; a.vy = 0;
      var ahp0 = a.hp; doSpecial(A);
      for (var i=0;i<40;i++){ step(); b._atkTimer = 1e9; A.invuln = 300; a.x = 300; a.y = y0 - 340; a.vx = 0; a.vy = 0; }
      var out = { add: ahp0 - a.hp }; summons = []; projectiles = []; return out;
    })()`);
    expect(r.add, 'the add takes it').toBeGreaterThan(0);
    expect(r.add, 'once').toBeLessThanOrEqual(7);
  });

  // The owner's rule for a good kit: "PB is a good kit, because you can get into combos by chipping with the attack, recover with the up
  // special, and kill with the smash/finisher." Bow's three, after 2026-10-18: Teleport recovers, its pop leaves a foe open to a follow-up,
  // and the finisher and the smash kill. This pins the first two and the once-per-airtime rule (the kill is measured in the commit).
  it("Bow's Teleport recovers from under the ledge after her double jump, pops a foe into a follow-up, and is once per airtime", () => {
    const r = arena('Bow', `
      var savedBig = isBig, savedBases = bases, savedWW = WW, savedWH = WH, saved = netRemoteInput, inputs = {};
      isBig = function(){ return true; }; WW = 1100; WH = 720; bases = [{x:350,y:500,w:400,h:20}]; fighters = [A];
      netRemoteInput = function(i){ return inputs[i] || null; }; A.controller = 'remote';
      A.x = 330; A.y = 680; A.vx = 0; A.vy = 6; A.onground = false; A.jumps = 1; A.spCd = 0;      // 180 px under the ledge, one jump left
      var jumped = false, cast = false, back = -1, spent = null;
      for (var i=0;i<260 && back < 0;i++){
        var inp = {};
        if (A._tp || A._spPend > 0) cast = true;                                                         // nothing held while she fades: straight up
        else if (A.jumps > 0 && !jumped && A.vy > 0){ inp.jump = true; jumped = true; }
        else if (jumped && !cast && A.vy > 0 && A.spCd <= 0 && !A.onground) inp.special = true;
        else inp.right = A.x < 540;
        inputs[0] = inp; step();
        if (cast && spent === null && !A._tp && !(A._spPend > 0)){ A.spCd = 0; fireSpecial(A, {}); spent = !!A._tp; }   // she is there: a second one in the same airtime
        if (A.onground && A.x > 350 && A.x < 750 && A.y + A.r <= 501) back = i;
      }
      var out = { back: back, cast: cast, secondTeleport: spent };
      isBig = savedBig; bases = savedBases; WW = savedWW; WH = savedWH; netRemoteInput = saved; return out;`);
    expect(r.cast, 'she used it').toBe(true);
    expect(r.back, 'and got back onto the stage').toBeGreaterThan(0);
    expect(r.secondTeleport, 'once per airtime: a second press in the same fall goes nowhere').toBe(false);

    const link = arena('Bow', `
      var y0 = A.y; D.x = A.x; D.y = y0 - 340; D.vy = 0; D.onground = false; D.pct = 40; doSpecial(A);
      var p0 = D.pct, hit = -1;
      for (var i=0;i<30 && hit < 0;i++){ step(); if (D.pct > p0 + 0.01) hit = i; else { D.x = A.x; D.y = y0 - 340; D.vy = 0; } }
      for (var k=0;k<6;k++) step();                                   // inside the stun the pop left: the follow-up is a second link
      var before = D.pct; A.atkCd = 0; doUpTilt(A);
      for (var q=0;q<10;q++) step();   // Bow's up-tilt is her own move now (Chair Lift, 5 frames of startup): restated 2026-10-14, it used to land on the press
      return { first: +(before - 40).toFixed(1), second: D.pct > before + 0.01 };`);
    expect(link.first, 'the pop where she appears').toBe(6);
    expect(link.second, 'the pop leaves the foe open to an uppercut a few frames later').toBe(true);

    const drop = arena('Bow', `
      A.x = 400; A.y = groundY() - 24 - 260; A.vy = 0; A.onground = false; D.x = 404; D.y = A.y + 70; D.vy = 0; D.onground = false;
      var p0 = D.pct, seq = [], last = p0; fireSpecial(A, { up: true });
      for (var i=0;i<60;i++){ step(); if (D.pct > last + 0.01){ seq.push(+(D.pct - last).toFixed(1)); last = D.pct; } }
      return seq;`);
    expect(drop, 'Chair Slam in the air: 5.5% on the way down, then the 13% slam').toEqual([5.5, 13]);
  });

  // TELEPORT, directly (the owner, 2026-10-18: "the move should be teleport-not levitate. it should go 340 px." -- "Aim with arrows",
  // "Pop on arrival", "Once per airtime"). Every promise of the move in one place: the trip, the aim, the pop, the once, where she may end,
  // and Capture the Flag's walls, which she does not pass (the locks there mean what they say).
  it("Teleport: 340 px up with nothing held, 340 px the way the arrows aim (a diagonal too), a 6% pop once, once per airtime, never in a solid, and stopped by a wall in Capture the Flag", () => {
    const r = arena('Bow', `
      var saved = netRemoteInput, inputs = {}; netRemoteInput = function(i){ return inputs[i] || null; }; A.controller = 'remote';
      D.x = 2000; E.x = 2000;
      var air = function(x, h){ A.x = x; A.y = groundY() - 24 - h; A.vx = 0; A.vy = 0; A.onground = false; A._tpUsed = false; A.spCd = 0; };
      var tp = function(hold, each){ var x0 = A.x, y0 = A.y; A.spCd = 0; fireSpecial(A, {}); var n = 0;
        while ((A._tp || n === 0) && n < 30){ inputs[0] = hold || {}; step(); n++; if (each) each(); }
        return { d: [Math.round(A.x - x0), Math.round(A.y - y0)], len: Math.round(Math.hypot(A.x - x0, A.y - y0)), still: [A.vx, A.vy] }; };
      var out = {};
      air(400, 100); out.up = tp({});
      air(200, 100); out.right = tp({ right: true });
      air(700, 60); var dg = tp({ left: true, jump: true }); out.diag = dg.d; out.diagLen = dg.len;   // (a player's up is the jump key)
      air(400, 60); var y0 = A.y; D.x = A.x; D.y = y0 - 340; D.vy = 0; D.onground = false; D.invuln = 0; D.pct = 30;
      var hits = [], last = 30, seen = function(){ if (D.pct > last + 0.01){ hits.push(+(D.pct - last).toFixed(2)); last = D.pct; } D.invuln = 0; };
      tp({}, function(){ if (A._tp){ D.x = A.x; D.y = y0 - 340; D.vy = 0; } seen(); });
      for (var i=0;i<20;i++){ step(); seen(); }
      out.pop = hits; D.x = 2000;
      air(400, 60); tp({}); A.spCd = 0; fireSpecial(A, {}); out.spent = !!A._tp;
      for (var j=0;j<240 && !A.onground;j++){ inputs[0] = {}; step(); }
      out.landedBack = A.onground && !A._tpUsed; out.again = tp({}).d;
      var gy = groundY(); for (var k=0;k<240 && !A.onground;k++) step(); A.x = 400; step();
      worldPlats = [{ x:300, y:gy - 24 - 340 - 40, w:200, h:80, solid:true }]; var p = worldPlats[0], s1 = tp({});
      out.blocked = { dy: s1.d[1], inside: A.x + A.r > p.x && A.x - A.r < p.x + p.w && A.y + A.r > p.y && A.y - A.r < p.y + p.h };
      worldPlats = []; for (var q=0;q<240 && !A.onground;q++) step(); A.x = 400; step();
      worldPlats = [{ x:300, y:gy - 24 - 200, w:200, h:40, solid:true }]; out.through = tp({}).d;
      worldPlats = []; air(400, 100); tp({ down: true }); out.floorFeet = Math.round(A.y + A.r - gy);
      air(1000, 100); tp({ right: true }); out.inWorld = A.x + A.r <= WW && A.x - A.r >= 0;
      air(WW + 40, 100); var off = tp({}); out.offSide = { dy: off.d[1], len: off.len, inWorld: A.x + A.r <= WW && A.x - A.r >= 0 };   // knocked past the side of the screen
      A.x = 500; A.y = -259; A.vx = 0; A.vy = 0; A.onground = false; A._tpUsed = false; var top = tp({ left: true });   // over the top of the screen, aimed left (the review's 443 px trip)
      out.overTop = { dx: top.d[0], len: top.len, inWorld: A.y - A.r >= 0 && A.x - A.r >= 0 && A.x + A.r <= WW };
      var savedBig = isBig, savedFloors = floors, savedBases = bases; isBig = function(){ return true; }; bases = [];   // a big arena: the main floor is a slab over the pit
      floors = [{ level:0, y:gy, x:100, w:WW - 200 }]; worldPlats = [{ x:100, y:gy, w:WW - 200, h:46, solid:true }];
      A.x = 500; A.y = gy - A.r; A.vx = 0; A.vy = 0; A.onground = true; A._tpUsed = false; step(); var slab = tp({ down: true });
      out.slab = { dy: slab.d[1], above: A.y + A.r <= gy + 0.5 };
      isBig = savedBig; floors = savedFloors; bases = savedBases; worldPlats = [];
      air(400, 100); D.x = A.x + 50; D.y = A.y; D.vy = 0; D.invuln = 0; var pc0 = D.pct;
      A._smQ = { angle:0, wait:0, held:false }; A.smashHold = smashFullOf(A) - 3; tp({ left: true });
      out.smash = { dropped: !A._smQ && !A.smashHold, foeHit: D.pct > pc0 + 0.01 }; D.x = 2000;
      air(400, 100); A.spCd = 0; fireSpecial(A, {}); inputs[0] = {}; step(); step(); A.hitstun = 5; step();
      out.jolted = { tp: !!A._tp, spCd: A.spCd, used: !!A._tpUsed };   // a tick ignores the fade's grace: the trip never happened
      netRemoteInput = saved; return out;`);
    expect(r.up.d, 'nothing held: straight up, 340 px').toEqual([0, -340]);
    expect(r.up.still, 'she appears still').toEqual([0, 0]);
    expect(r.right.d, 'aimed right: 340 px right').toEqual([340, 0]);
    expect(r.diag[0], 'up and left').toBeLessThan(-200);
    expect(r.diag[1]).toBeLessThan(-200);
    expect(r.diagLen, 'a diagonal is the same 340 px trip').toBe(340);
    expect(r.pop, 'the foe where she appears takes 6%, once').toEqual([6]);
    expect(r.spent, 'once per airtime: the second press in the same airtime goes nowhere').toBe(false);
    expect(r.landedBack, 'landing gives it back').toBe(true);
    expect(r.again).toEqual([0, -340]);
    expect(r.blocked.inside, 'a solid where she would end: she stops short of it, never in it').toBe(false);
    expect(r.blocked.dy).toBeGreaterThan(-340);
    expect(r.blocked.dy).toBeLessThan(-200);
    expect(r.through, 'outside Capture the Flag a solid in the way is passed through').toEqual([0, -340]);
    expect(r.floorFeet, 'down into the floor: she ends standing on it, not in it').toBeLessThanOrEqual(0);
    expect(r.inWorld, 'never out of the world').toBe(true);
    // RESTATED (review, 2026-10-18): brought back inside the world, the trip is capped at 340 px end to end, so from past the side straight up
    // is a little less than 340 px up (the rest is the step back inside).
    expect(r.offSide.inWorld, 'past the side of the screen, nothing held: back inside the world').toBe(true);
    expect(r.offSide.len, 'and never further than 340 px').toBeLessThanOrEqual(340);
    expect(r.offSide.dy, 'still nearly all the way up').toBeLessThan(-320);
    expect(r.overTop.inWorld, 'over the top of the screen: back inside the world').toBe(true);
    expect(r.overTop.len, 'never further than 340 px (it was 443)').toBeLessThanOrEqual(340);
    expect(r.overTop.dx, 'and still the way she aimed').toBeLessThan(-150);
    expect(r.slab, 'a big arena: down from the main floor never puts her under it (a certain KO)').toEqual({ dy: 0, above: true });
    expect(r.smash, 'a smash charging when she pressed is dropped: nothing swings from where she fades').toEqual({ dropped: true, foeHit: false });
    expect(r.jolted, 'a tick during the fade ends it, and the move is hers again').toEqual({ tp: false, spCd: 0, used: false });

    // Capture the Flag (a fresh game on the castle map): a closed door and jail bars stop her at their face; the door open for her side does not.
    const { window: w } = loadMonolith(3);
    w.eval(`CTF.skipNav=true; SETTINGS.mode='ctf'; SETTINGS.count=4; SETTINGS.itemRate=0; CTF.forceMap='castle'; beginMatchNow();
            fighters.forEach(function(f){ f.controller='still'; f.you=false; }); ctfEndHide(CTF.live);`);
    const c = JSON.parse(w.eval(`JSON.stringify((function(){
      var f = fighters[0]; f.kit = ROSTER.find(function(r){ return r.name==='Bow'; }).kit; f.controller = 'remote';
      var inputs = {}, saved = netRemoteInput; netRemoteInput = function(i){ return inputs[i] || null; };
      var d = CTF.live.doors[0], j = CTF.map.jails[0], out = { door: [d.x, d.w], bars: [j.door.x, j.door.w], r: f.r };
      var tp = function(x, floor, hold){ f.x = x; f.y = floor - f.r; f.vx = 0; f.vy = 0; f.invuln = 0; f.hitstun = 0; f._tpUsed = false; f.onground = true; step();
        var x0 = f.x; f.spCd = 0; fireSpecial(f, {}); for (var i=0;i<20 && !(i > 0 && !f._tp);i++){ inputs[0] = hold; step(); } return { x: f.x, dx: Math.round(f.x - x0) }; };
      out.shut = tp(d.x + d.w + 120, d.y + d.h, { left: true });
      out.bar = tp(j.door.x + j.door.w + 120, j.door.y + j.door.h, { left: true });
      d.op[f.team] = true; ctfRebuildDyn(CTF.live); out.open = tp(d.x + d.w + 120, d.y + d.h, { left: true });
      d.op[f.team] = false; ctfRebuildDyn(CTF.live);
      f._cf = 0; out.carrier = tp(d.x + d.w + 400, d.y + d.h, { right: true }); f._cf = -1;
      // A slope (the review, 2026-10-18: uphill she went 4 px, and pressed while walking up one, nothing at all): three ramp pieces rising to the right.
      var ramps = worldPlats.filter(function(p){ return p.ramp === true; });
      var above = function(x, y){ return ramps.find(function(q){ return q.x === x && q.y < y && q.y >= y - 24; }); };
      var p1 = ramps.find(function(p){ var a = above(p.x + p.w, p.y), b = a && above(a.x + a.w, a.y); return !!(b && above(b.x + b.w, b.y)); });
      var inSolid = function(){ return tpSolids(f).some(function(p){ var ph = p.h || 16; return f.x + f.r - 1 > p.x && f.x - f.r + 1 < p.x + p.w && f.y + f.r - 1 > p.y && f.y - f.r + 1 < p.y + ph; }); };
      var slope = function(walk, hold){ f.x = p1.x + p1.w/2; f.y = p1.y - f.r; f.vx = 0; f.vy = 0; f.invuln = 0; f.hitstun = 0; f._tpUsed = false; f.onground = true; f._tpHang = 0;
        inputs[0] = {}; step(); for (var t=0;t<walk;t++){ inputs[0] = { right: true }; step(); }
        var x0 = f.x, y0 = f.y; f.spCd = 0; fireSpecial(f, {}); for (var i=0;i<20 && !(i > 0 && !f._tp);i++){ inputs[0] = hold; step(); }
        return { len: Math.round(Math.hypot(f.x - x0, f.y - y0)), dx: Math.round(f.x - x0), inSolid: inSolid() }; };
      out.ramp = !!p1; out.uphill = p1 && slope(0, { right: true });
      out.walking = p1 ? [1,2,3,4,5,6,8,10,12].map(function(T){ var s = slope(T, { jump: true }); return s.len >= 330 && !s.inSolid; }) : [];
      netRemoteInput = saved; return out;
    })())`));
    expect(c.shut.dx, 'a closed door: she stops at it').toBeGreaterThan(-120);
    expect(c.shut.x - c.r, 'on her side of it, not in it').toBeGreaterThanOrEqual(c.door[0] + c.door[1] - 1);
    expect(c.bar.x - c.r, 'jail bars stop her too').toBeGreaterThanOrEqual(c.bars[0] + c.bars[1] - 1);
    expect(c.open.dx, 'a door open for her side is not there for her').toBe(-340);
    expect(c.carrier.dx, 'a flag carrier goes half as far').toBe(170);
    expect(c.ramp, 'the castle has a slope').toBe(true);
    expect(c.uphill.dx, 'a slope is ground, not a wall: uphill she rises with it').toBeGreaterThan(250);
    expect(c.uphill.len).toBeLessThanOrEqual(340);
    expect(c.uphill.inSolid).toBe(false);
    expect(c.walking, 'pressed while walking up it, straight up goes the whole way every time').toEqual(c.walking.map(function(){ return true; }));
  });

  it("Bow's chair slam gains no height, and Pepper echoes Salt's jab as well as her special", () => {
    expect(W.eval('UPSPEC.chair.power'), '"bow shouldnt go higher in her up-special"').toBe(0);
    const rise = arena('Bow', `var y0 = A.y, minY = A.y; doUpSpecial(A);
      for (var i=0;i<40;i++){ step(); minY = Math.min(minY, A.y); } return +(y0 - minY).toFixed(0);`);
    expect(rise, 'no lift at all').toBeLessThan(10);

    const echo = arena('Salt', `
      for (var i=0;i<20;i++) step();
      D.x = A.x + 26; D.invuln = 0; D.pct = 30;
      var p = pepperOf(A); p.x = A.x - 20;
      A.atkCd = 0; doAttack(A);
      var queued = p.q.length;
      for (var j=0;j<PEPPER_LAG+3;j++){ step(); D.invuln = 0; }
      return { queued: queued, hit: D.pct > 30 };`);
    expect(echo.queued, 'the jab is echoed too, not just the special').toBeGreaterThan(0);
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
