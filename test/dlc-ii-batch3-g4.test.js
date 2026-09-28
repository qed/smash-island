import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';

// Batch 3 of the Inanimate Insanity DLC, group 4: "add the last set of dlc fighters" -> "New II fighters". Tissues,
// Yin-Yang and Starfruit, canon kits from the II wiki and the owner's answers (Q3 "Crop from their art" for Tissues'
// snot; Q9 "Yang throws Yin"; Q10 "One-Hit Wonder + Recycle"; "remember to keep the attack lines out"). No one from the
// OSC (OJ, Suitcase, Cabby). DLC, so unlocked from the start, and none of them is in the Vault.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const NAMES = ['Tissues', 'Yin-Yang', 'Starfruit'];
const arena = (name, body, foeX = 460) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ${foeX}, groundY()-24, 1);
  A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; step();
  [A,D].forEach(function(f){ f.invuln=0; f.hitstun=0; f.spCd=0; f.atkCd=0; f.smCd=0; f.dropCd=0; f.pct=30; f.armor=0; });
  A.onground = true; window.__lastBanner = null;
  var __rnd = Math.random;
  try { ${body} } finally { Math.random = __rnd; }
})()`);
const clearOf = (file) => { const png = PNG.sync.read(readFileSync(file)); let c = 0;
  for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) c++; return { png, clear: c / (png.width * png.height) }; };

describe('the three arrive', () => {
  it('as DLC roster rows, unlocked, outside the Vault, each with a render that is on disk and transparent', () => {
    const r = W.eval(`(function(){ return ${JSON.stringify(NAMES)}.map(function(n){
      var row = ROSTER.find(function(x){ return x.name===n; });
      return { n:n, play:row.play, dlc:row.dlc, open:isUnlocked(row), vault:VAULT_FIGHTERS.has(n),
               src:SPRITES[n] && SPRITES[n].src, flip:!!(SPRITES[n] && SPRITES[n].flip), key:row.kit.special };
    }); })()`);
    expect(r.map((x) => x.key)).toEqual(['condishawn', 'yinyang', 'onehit']);
    for (const x of r) {
      expect([x.play, x.dlc, x.open], x.n).toEqual([true, 'Inanimate Insanity', true]);
      expect(x.vault, `${x.n} is not a Vault fighter`).toBe(false);
      const { png, clear } = clearOf(`artifacts/V1/${x.src}`);
      expect(png.height, x.n).toBe(200);
      expect(clear, `${x.n}'s render is a cut-out`).toBeGreaterThan(0.2);
    }
    expect(r.map((x) => x.flip)).toEqual([true, false, false]);   // measured: Tissues' box faces left
  });

  it('with no one from the OSC in any of their rows, and no text put on the screen', () => {
    const html = readFileSync('artifacts/V1/index.html', 'utf8').split(/\r?\n/);
    const mine = [];
    html.forEach((l, i) => { if (l.trim() === '// @b3:g4 Tissues, Yin-Yang, Starfruit') for (let j = i + 1; html[j] && html[j].trim(); j++) mine.push(html[j]); });
    expect(mine.length).toBeGreaterThan(60);
    expect(mine.filter((l) => /\b(OJ|Suitcase|Cabby)\b/.test(l))).toEqual([]);
    expect(mine.filter((l) => /banner\(|fillText/.test(l))).toEqual([]);
  });
});

// Each input, from a standing start, as test/move-text measures them: the first hit is a number on its card, and a
// "no hit:" card lands nothing. And not one of them puts a word on the screen, then or in the second after.
const MOVES = { jab: 'A.atkCd=0; doAttack(A)', ranged: 'A.atkCd=0; doGroundMove(A)', utilt: 'A.atkCd=0; doUpTilt(A)',
  special: 'fireSpecial(A, {})', up: 'fireSpecial(A, {up:true})', down: 'fireSpecial(A, {down:true})', finisher: 'doAttackSpecial(A)', smash: 'doSmash(A, 1.0)' };
describe.each(NAMES)('%s: every input', (name) => {
  it('runs, lands what its card says, and shows no text', () => {
    const card = W.eval(`MOVE_TEXT[${JSON.stringify(name)}]`);
    for (const [move, call] of Object.entries(MOVES)) {
      const hits = [40, 110, 220].map((d) => arena(name, `
        try { ${call}; } catch(e){ return { err: String(e && e.message || e) }; }
        var first = D.pct > 30.05 ? D.pct - 30 : 0, last = D.pct, any = D.pct - 30;
        for (var i=0;i<70;i++){ step(); D.x = Math.max(D.x, 60); D.dead = false;
          if (!first && D.pct > last + 0.3) first = D.pct - last; last = D.pct; any = Math.max(any, D.pct - 30); }
        return { first: +first.toFixed(2), any: +any.toFixed(2), banner: window.__lastBanner && window.__lastBanner.text || null };`, 400 + d));
      for (const h of hits) { expect(h.err, `${name} ${move}`).toBeUndefined(); expect(h.banner, `${name} ${move} put text up`).toBeNull(); }
      if (move === 'smash') { expect(hits.some((h) => h.first > 0), `${name}'s smash lands at some range`).toBe(true); continue; }
      const line = card[move];
      expect(line, `${name} ${move} has a line`).toBeTruthy();
      if (/no hit:/i.test(line)) { expect(Math.max(...hits.map((h) => h.any)), `${name} ${move}`).toBeLessThanOrEqual(0.3); continue; }
      const nums = [...line.split('On hit:')[1].matchAll(/(\d+(?:\.\d+)?)%/g)].map((x) => +x[1]);
      const landed = hits.filter((h) => h.first > 0).map((h) => h.first);
      expect(landed.length, `${name} ${move} lands at some range`).toBeGreaterThan(0);
      expect(landed.some((d) => nums.some((n) => Math.abs(d - n) <= Math.max(1.05, n * 0.12))), `${name} ${move}: says ${nums}, lands ${landed}`).toBe(true);
    }
  }, 60000);
});

describe('Tissues', () => {
  it('CondiShAWn: the jet reaches about 150px; one foe in two catches the condishawn and sneezes, for 0%', () => {
    const r = arena('Tissues', `
      Math.random = function(){ return 0.1; };          // caught, one sneeze, the soonest
      fireSpecial(A, {}); var hit = D.pct - 30, ticks = D._ticks && { dmg:D._ticks.dmg, n:D._ticks.n };
      var p0 = D.pct, jolted = false; D.x = 700;
      for (var i=0;i<200;i++){ D.invuln = 0; var h0 = D.hitstun; step(); if (D.hitstun > h0 && D.hitstun > 0) jolted = true; }
      var sneezeDmg = D.pct - p0, fxSeen = !!A._sneezeFx;
      // a second foe out of reach is untouched, and a caught foe is not caught twice
      projectiles=[]; A.spCd=0; D.x = 600; D.pct = 30; fireSpecial(A, {});
      return { hit:hit, ticks:ticks, jolted:jolted, sneezeDmg:sneezeDmg, fxSeen:fxSeen, far: D.pct - 30 };`);
    expect(r.hit).toBeCloseTo(6, 5);
    expect(r.ticks).toEqual({ dmg: 0, n: 1 });
    expect(r.jolted, 'the sneeze stops them').toBe(true);
    expect(r.sneezeDmg).toBeCloseTo(0, 5);
    expect(r.fxSeen).toBe(true);
    expect(r.far).toBe(0);
    const miss = arena('Tissues', `Math.random = function(){ return 0.9; }; fireSpecial(A, {}); return { hit: D.pct - 30, caught: !!D._ticks };`);
    expect(miss).toEqual({ hit: 6, caught: false });
  });

  it('Nap: he sleeps and cannot act, then wakes with a sneeze all round him -- unless a hit wakes him first', () => {
    const r = arena('Tissues', `
      Math.random = function(){ return 0.9; };
      fireSpecial(A, {down:true}); var asleep = A.hitstun >= 49 && !!(A._windup && A._windup.nap);
      D.x = 360;   // behind him: it goes all round
      for (var i=0;i<52;i++) step();
      return { asleep:asleep, woke: D.pct - 30, awake: !A._windup };`);
    expect(r).toEqual({ asleep: true, woke: 8, awake: true });
    const hitFirst = arena('Tissues', `
      fireSpecial(A, {down:true}); for (var i=0;i<10;i++) step(); applyHit(A, 5, 0, 0, D);
      for (var j=0;j<60;j++) step(); return { gone: !A._windup, dealt: D.pct - 30 };`);
    expect(hitFirst).toEqual({ gone: true, dealt: 0 });
  });

  it('Pollen Path: a sneeze to the stage edge that knocks down, and throws him backwards', () => {
    const r = arena('Tissues', `doSmash(A, 1.0); return { dealt: D.pct - 30, row: smashRowAsFired(SMASH_SPEC.condishawn).dmg, down: D._stunFx > 0, back: A.vx < 0 };`, 760);
    expect(r.dealt).toBe(r.row);
    expect([r.down, r.back]).toEqual([true, true]);
  });
});

describe('Yin-Yang', () => {
  it('Yang throws Yin: Yin rolls out and back, knocking down, and Yang hits harder until he is back', () => {
    const r = arena('Yin-Yang', `
      fireSpecial(A, {}); var yin = projectiles.find(function(p){ return p._yin; });
      var art = yin && (yin.shape || A.kit.special), alone = A._empowerT > 0 && A._yangT > hazardT;
      A.spCd = 0; fireSpecial(A, {}); var second = projectiles.filter(function(p){ return p._yin; }).length;
      var turned = false, knocked = false; for (var i=0;i<130;i++){ step(); D.invuln = 0; if (yin.vx < 0) turned = true; if (D._stunFx > 0) knocked = true; }
      return { art: art, src: ATTACK_SPRITES[art].src, alone: alone, second: second, turned: turned, dealt: +(D.pct - 30).toFixed(1),
               knocked: knocked, back: !projectiles.some(function(p){ return p._yin; }) };`, 600);
    expect(r).toEqual({ art: 'yinyang', src: 'assets/sprites/attacks/yin.png', alone: true, second: 1, turned: true, dealt: 9.8, knocked: true, back: true });
  });

  it('Mindful Positioning: what is on him falls away, and no scramble or freeze takes hold for four seconds', () => {
    const r = arena('Yin-Yang', `
      A.slowed = 90; A.rooted = 60; A.ctrlRev = 40;
      fireSpecial(A, {down:true});
      var clean = !A.slowed && !A.rooted && !A.ctrlRev;
      for (var i=0;i<100;i++) step();
      var scr = applyCtrlRev(A, 50); A.pct = 200; applyFreeze(A, 60);
      return { clean: clean, scrambled: scr, frozen: A.frozen > 0, dealt: D.pct - 30 };`);
    expect(r).toEqual({ clean: true, scrambled: false, frozen: false, dealt: 0 });
  });

  it('The Right Goal kicks them almost straight up; Through the Roof drives up and knocks down', () => {
    const k = arena('Yin-Yang', `doSmash(A, 1.0); return { dealt: D.pct - 30, row: smashRowAsFired(SMASH_SPEC.yinyang).dmg, vx: D.vx, vy: D.vy };`, 440);
    expect(k.dealt).toBe(k.row);
    expect(-k.vy).toBeGreaterThan(Math.abs(k.vx) * 2);
    const u = arena('Yin-Yang', `D.x = A.x + 4; D.y = A.y - 12; fireSpecial(A, {up:true}); return { dealt: D.pct - 30, down: D._stunFx > 0, rose: A.vy < 0 };`);
    expect(u.dealt).toBeGreaterThan(4);
    expect([u.down, u.rose]).toEqual([true, true]);
  });
});

describe('Starfruit', () => {
  it('One-Hit Wonder: 14% once, then a Has-Been shove of 3%, until Recycle gives it back -- and a new stock does too', () => {
    const r = arena('Starfruit', `
      var out = [];
      var shot = function(){ A.spCd = 0; D.invuln = 0; D.x = 460; D.y = A.y; D.vx = 0; var p = D.pct; fireSpecial(A, {}); out.push(+(D.pct - p).toFixed(1)); };
      shot(); var hb = A._hasBeen; shot();
      A.burn = 120; A.spCd = 0; var pct0 = A.pct; fireSpecial(A, {down:true}); var cost = A.pct - pct0, cured = A.burn === 0, back = !A._hasBeen;
      shot(); A.spCd = 0; var p1 = A.pct; fireSpecial(A, {down:true}); var again = A.pct - p1;   // Recycle's own 8 s clock
      A._falls = (A._falls||0) + 1; shot();   // a new stock
      return { out: out, hb: hb, cost: cost, cured: cured, back: back, again: again };`);
    expect(r).toEqual({ out: [14, 3, 14, 14], hb: true, cost: 3, cured: true, back: true, again: 0 });
  });

  it('Spoiled Lemon, Reunited: five bandmates come down round the nearest foe, each a different member', () => {
    const r = arena('Starfruit', `
      doSmash(A, 1.0); var drops = projectiles.filter(function(p){ return p.owner===A.idx; });
      var band = ['slpineapple','sllemon','sltomato','slguava','slmangosteen'];
      var who = drops.map(function(p){ return band[((Math.round(p.warnX/60) % 5) + 5) % 5]; });
      var dealt = 0; for (var i=0;i<90;i++){ step(); D.invuln = 0; } dealt = D.pct - 30;
      return { n: drops.length, distinct: who.filter(function(k,i){ return who.indexOf(k)===i; }).length, dealt: dealt,
               srcs: band.map(function(k){ return ATTACK_SPRITES[k].src; }), glyph: !!PROJ_SHAPE.onehit };`, 560);
    expect(r.n).toBe(5);
    expect(r.distinct).toBe(5);
    expect(r.dealt).toBeGreaterThanOrEqual(9);
    expect(r.glyph).toBe(true);
    for (const s of r.srcs) expect(existsSync(`artifacts/V1/${s}`), s).toBe(true);
  });

  it('Flee! Flee!: gone higher, untouchable a moment, and running faster', () => {
    const r = arena('Starfruit', `var y0 = A.y; fireSpecial(A, {up:true}); return { up: y0 - A.y, inv: A.invuln > 0, haste: A._hasteT > 0, dealt: D.pct - 30 };`);
    expect(r).toEqual({ up: 130, inv: true, haste: true, dealt: 0 });
  });
});

describe('the art', () => {
  const ATTACK = ['snot', 'yin', 'slpineapple', 'sllemon', 'sltomato', 'slguava', 'slmangosteen'];
  const POSES = ['tissues-nap', 'yin-yang-yang', 'yin-yang-mindful'];
  const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
  const manifest = JSON.parse(readFileSync('scripts/attack-sprite-manifest.json', 'utf8'));
  it('every thrown or laid thing is a projectile-sized, transparent file from the II wiki, on the record and credited', () => {
    for (const k of ATTACK) {
      const e = manifest[k], file = `artifacts/V1/assets/sprites/attacks/${k}.png`;
      expect(e && e.file, k).toBe(`${k}.png`);
      const { png, clear } = clearOf(file);
      expect([png.width, png.height], k).toEqual([e.width, e.height]);
      expect(Math.max(png.width, png.height), k).toBeLessThanOrEqual(128);
      expect(clear, `${k} is a cut-out`).toBeGreaterThan(0.2);
      expect(e.source, k).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/inanimateinsanity\/images\//);
      expect(credits, k).toContain(`(${k}.png)`);
      expect(credits, k).toContain(e.source);
    }
  });
  it('the pose renders (asleep, Yang alone, Yang in control) are on disk, transparent and credited', () => {
    for (const p of POSES) {
      const { png, clear } = clearOf(`artifacts/V1/assets/sprites/${p}.png`);
      expect(png.height, p).toBe(200);
      expect(clear, p).toBeGreaterThan(0.2);
      expect(credits, p).toContain(`\`${p}.png\``);
    }
  });
  it('the pose passes draw without throwing, and only in their own state', () => {
    const r = W.eval(`(function(){
      var fake = { complete:true, naturalWidth:200, naturalHeight:200 };
      var out = {};
      ['Tissues','Yin-Yang','Starfruit'].forEach(function(n){
        var A = makeFighter(ROSTER.find(function(r){ return r.name===n; }), 400, groundY()-24, 0); fighters=[A];
        var a = FIGHTER_ANIM[n];
        for (var k in (a.poses||{})) a.poses[k].img = fake, a.poses[k]._req = true;
        var idle = a.body ? a.body(A, ctx) : false;
        A._windup = { nap:true, t:10, t0:50 }; A._yangT = hazardT + 50; A._hasBeen = true; beams = [{x0:410,x1:800,y:A.y,face:1,life:10,owner:A.idx}]; A._sneezeFx = { t:hazardT, face:1, len:150 };
        var on = a.body ? a.body(A, ctx) : null;
        if (a.over) a.over(A, ctx); if (a.deform) a.deform(A, ctx, A.r);
        drawFighter(A); beams = [];
        out[n] = [idle, on];
      });
      return out;
    })()`);
    expect(r).toEqual({ Tissues: [false, true], 'Yin-Yang': [false, true], Starfruit: [false, null] });
  });
});
