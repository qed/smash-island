import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';

// "add the last set of dlc fighters." -> "New II fighters" (2026-09-27). Batch 3, group g1: Box, Trophy, Goo and
// Lifering, their kits from inanimateinsanity.fandom.com and the owner's answers (Q6: Box keeps Everything Packed; Q2:
// Trophy's camera and Lifering's whistle are drawn; "remember to keep the attack lines out"). Nothing from the OSC.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const NAMES = ['Box', 'Trophy', 'Goo', 'Lifering'];
const KITS = { Box: 'packed', Trophy: 'blackmail', Goo: 'engulf', Lifering: 'lifeguard' };

const arena = (name, body, foeX = 460) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.itemRate=0; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ${foeX}, groundY()-24, 1);
  var E = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), ${foeX} + 400, groundY()-24, 2);
  [A,D,E].forEach(function(f,i){ f.team=i; f.controller='still'; f.stocks=9; }); A.face=1; D.face=-1;
  fighters=[A,D,E]; step(); [A,D,E].forEach(function(f){ f.invuln=0; f.hitstun=0; f.spCd=0; f.atkCd=0; f.smCd=0; f.dropCd=0; f.pct=30; f.armor=0; });
  A.onground = true;
  ${body}
})()`);

describe('batch 3 (g1): the roster rows and the art', () => {
  it('four DLC rows, open on a fresh save, none of them a Vault fighter, each with its own kit', () => {
    const r = W.eval(`(function(){ return ${JSON.stringify(NAMES)}.map(function(n){
      var x = ROSTER.find(function(r){ return r.name===n; });
      return x && { n:n, dlc:x.dlc, play:x.play, kit:x.kit.special, desc:x.kit.desc, open:isUnlocked(x), vault:VAULT_FIGHTERS.has(n),
        src:SPRITES[n] && SPRITES[n].src, flip:SPRITES[n] && SPRITES[n].flip }; }); })()`);
    const ii = JSON.parse(readFileSync('scripts/sprite-manifest-inanimateinsanity.json', 'utf8'));
    for (const x of r) {
      expect(x.dlc, x.n).toBe('Inanimate Insanity');
      expect(x.play && x.open, `${x.n} arrives unlocked`).toBe(true);
      expect(x.vault, `${x.n} is not a Vault fighter`).toBe(false);
      expect(x.kit).toBe(KITS[x.n]);
      expect(x.desc.startsWith(`${x.n === 'Lifering' ? "We've Got a Sinker!" : x.desc.split(' →')[0]} →`)).toBe(true);
      expect(existsSync(`artifacts/V1/${x.src}`), x.src).toBe(true);
      expect(ii[x.n] && ii[x.n].ok, `${x.n} is in the II manifest`).toBe(true);
      expect(x.flip).toBe(!!ii[x.n].flip);
    }
  });

  it('every render and pose is a transparent PNG at most 200px tall, credited with its exact source', () => {
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const ii = JSON.parse(readFileSync('scripts/sprite-manifest-inanimateinsanity.json', 'utf8'));
    const files = ['box', 'box-open-flaps', 'box-lifeless', 'trophy', 'goo', 'goo-giant', 'goo-puddle', 'lifering', 'lifering-dive', 'lifering-first-aid'];
    for (const f of files) {
      const png = PNG.sync.read(readFileSync(`artifacts/V1/assets/sprites/${f}.png`));
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      expect(png.height, f).toBeLessThanOrEqual(200);
      expect(clear / (png.width * png.height), `${f} is transparent`).toBeGreaterThan(0.02);
      expect(png.data[3], `${f}: the corner is clear`).toBe(0);
      const row = Object.values(ii).find((e) => e.file === `${f}.png`);
      expect(row && row.source, `${f} is on the manifest`).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/inanimateinsanity\/images\//);
      expect(credits, `${f}.png is credited`).toContain(`\`${f}.png\``);
      expect(credits, `${f}.png's source is credited`).toContain(row.source.split('/revision/')[0]);
    }
    // the poses are drawn from the same folder
    const poses = W.eval(`['Box','Goo','Lifering'].flatMap(function(n){ var p = FIGHTER_ANIM[n].poses; return Object.keys(p).map(function(k){ return p[k].src; }); })`);
    for (const src of poses) expect(existsSync(`artifacts/V1/${src}`), src).toBe(true);
  });

  it("the shark is the show's, projectile-sized and credited, and the smash drops it", () => {
    const png = PNG.sync.read(readFileSync('artifacts/V1/assets/sprites/attacks/shark.png'));
    let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
    expect(Math.max(png.width, png.height)).toBeLessThanOrEqual(128);
    expect(clear / (png.width * png.height)).toBeGreaterThan(0.2);
    const m = JSON.parse(readFileSync('scripts/attack-sprite-manifest.json', 'utf8')).shark;
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    expect(credits).toContain('(shark.png)');
    expect(credits).toContain(m.source);
    const keys = arena('Lifering', `D.x = 520; doSmash(A, 1.0); var k = {};
      for (var i=0;i<40;i++){ projectiles.forEach(function(p){ if (p.owner===A.idx) k[p.shape || A.kit.special] = 1; }); step(); }
      return Object.keys(k);`);
    expect(keys).toEqual(['lifeguard']);
    expect(W.eval("ATTACK_SPRITES.lifeguard.src")).toBe('assets/sprites/attacks/shark.png');
    expect(W.eval("typeof PROJ_SHAPE.lifeguard.draw")).toBe('function');
  });

  it('nothing from the OSC in any g1 row', () => {
    const html = readFileSync('artifacts/V1/index.html', 'utf8').split(/\r?\n/);
    // The @b3 slot markers were removed at integration, so this reads the whole file: the only OSC names in it are in
    // the one comment that says they are left out.
    const HTML_LINES = html;
    // Steve Cobs's prize (2026-09-29, "3, but only after you beat cobs."): OJ, Suitcase and Cabby ARE in the file now, inside
    // blocks marked as his prize (test/dlc-ii-prize.test.js owns those and holds the OSC to them). Outside those blocks, and
    // outside the two GENERATED tables their renders are traced into, the OSC is still nowhere (as in test/dlc-ii-batch3-g7).
    let inPrize = false, inGen = false;
    const oscLines = HTML_LINES.filter((l) => {
      if (/Steve Cobs's prize \(OJ, Suitcase, Cabby\): begin/.test(l)) inPrize = true;
      const skip = inPrize || inGen;
      if (/Steve Cobs's prize: end/.test(l)) inPrize = false;
      if (/^\/\/ GENERATED by scripts\/trace-(hurtboxes|limbs)\.mjs/.test(l)) inGen = true;
      if (/^\/\/ END GENERATED/.test(l)) inGen = false;
      return !skip && /\b(OJ|Suitcase|Cabby|Orange Juice|The Floor)\b/.test(l) && !/No one from the OSC/.test(l);
    });
    expect(oscLines).toEqual([]);
    const words = W.eval(`JSON.stringify(${JSON.stringify(NAMES)}.map(function(n){ var r = ROSTER.find(function(x){ return x.name===n; }); return [r, MOVE_TEXT[n], SMASH_ID[r.kit.special]]; }))`);
    expect(words).not.toMatch(/\b(OJ|Suitcase|Cabby)\b/);
  });
});

// The seven inputs, measured the way test/move-text measures every fighter: each card line's number is what lands.
const MOVES = { jab: 'A.atkCd=0; doAttack(A)', ranged: 'A.atkCd=0; doGroundMove(A)', utilt: 'A.atkCd=0; doUpTilt(A)', special: 'fireSpecial(A, {})',
  up: 'fireSpecial(A, {up:true})', down: 'fireSpecial(A, {down:true})', finisher: 'doAttackSpecial(A)' };
const measure = (name, call, dist) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ${400 + dist}, groundY()-24, 1);
  A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; step();
  [A,D].forEach(function(f){ f.invuln=0; f.pct=30; f.hitstun=0; f.spCd=0; f.atkCd=0; f.armor=0; });
  A.onground = true; window.__lastBanner = null;
  try { ${call}; } catch(e){ return { err: String(e && e.message || e) }; }
  var first = D.pct > 30.05 ? D.pct - 30 : 0, last = D.pct, any = D.pct - 30;
  for (var i=0;i<70;i++){
    step(); D.x = Math.max(D.x, 60); D.dead = false;
    if (!first && D.pct > last + 0.3) first = D.pct - last;
    last = D.pct; any = Math.max(any, D.pct - 30);
  }
  return { first: +first.toFixed(2), any: +any.toFixed(2), banner: window.__lastBanner && window.__lastBanner.text || null };
})()`);

describe('batch 3 (g1): every input does what its card says, and says nothing on screen', () => {
  for (const name of NAMES) {
    it(`${name}: all seven inputs run, land their card's number (or nothing), and put no text up`, () => {
      const text = W.eval(`MOVE_TEXT[${JSON.stringify(name)}]`);
      const bad = [];
      for (const [move, call] of Object.entries(MOVES)) {
        const line = text[move];
        expect(line, `${name} ${move}`).toMatch(/^[^—]+ — ./);
        expect(line.length, `${name} ${move}`).toBeLessThanOrEqual(210);
        const got = [40, 110, 220].map((d) => measure(name, call, d));
        for (const g of got) {
          if (g.err) bad.push(`${move} threw ${g.err}`);
          if (g.banner) bad.push(`${move} put "${g.banner}" on screen`);
        }
        if (/no hit:/i.test(line)) {
          const any = Math.max(...got.map((g) => g.any || 0));
          if (any > 0.3) bad.push(`${move} says no hit, dealt ${any}`);
          continue;
        }
        const nums = [...line.match(/On hit: (.*)$/)[1].matchAll(/(\d+(?:\.\d+)?)%/g)].map((x) => +x[1]);
        const landed = got.filter((g) => g.first > 0).map((g) => g.first);
        expect(landed.length, `${name} ${move} lands at some range`).toBeGreaterThan(0);
        if (!landed.some((d) => nums.some((n) => Math.abs(d - n) <= Math.max(1.05, n * 0.12)))) bad.push(`${move}: says ${nums.join('/')}%, lands ${landed.join(' / ')}`);
      }
      expect(bad).toEqual([]);
    });
  }

  it('no smash, special or finisher of theirs leaves a word on the screen in the second after', () => {
    const shown = [];
    for (const name of NAMES) {
      for (const call of ['fireSpecial(A, {})', 'fireSpecial(A, {})', 'fireSpecial(A, {up:true})', 'fireSpecial(A, {down:true})', 'doSmash(A, 1.0)', 'doAttackSpecial(A)']) {
        const b = arena(name, `A.you = true; window.__lastBanner = null; ${call};
          for (var i=0;i<60;i++){ step(); if (i===10) applyHit(A, 5, 0, 0, D); A.spCd = 0; }
          fireSpecial(A, {}); for (var j=0;j<30;j++) step();
          return window.__lastBanner && window.__lastBanner.text || null;`);
        if (b) shown.push(`${name} ${call}: "${b}"`);
      }
    }
    expect(shown).toEqual([]);
  });
});

describe('batch 3 (g1): the kits', () => {
  it('Box packs a shot thrown at her, holds it, and sends it back out as hers, harder', () => {
    const r = arena('Box', `
      var p = spawnProj(D, {vx:-10, vy:0, grav:false, dmg:6, kb:5, r:8, color:'#fff', life:60}); p.x = A.x + 60; p.y = A.y;
      doSpecial(A);
      var packed = !!A._packed && projectiles.indexOf(p) < 0;
      for (var i=0;i<20;i++) step();
      var unhurt = A.pct === 30;
      A.spCd = 0; D.x = 560; D.invuln = 0; A.face = 1;
      doSpecial(A);
      var back = projectiles.find(function(q){ return q === p; });
      var info = back && { owner: back.owner === A.idx, vx: back.vx, dmg: back.dmg };
      for (var j=0;j<30;j++){ step(); D.invuln = Math.min(D.invuln, 0); }
      return { packed: packed, unhurt: unhurt, info: info, held: !!A._packed, hurtD: D.pct > 30 };`);
    expect(r.packed, 'the shot goes inside her').toBe(true);
    expect(r.unhurt, 'no damage, no knockback').toBe(true);
    expect(r.info.owner, 'it comes back out hers').toBe(true);
    expect(r.info.vx).toBeGreaterThan(10);
    expect(r.info.dmg).toBeCloseTo(7.2, 5);
    expect(r.held).toBe(false);
    expect(r.hurtD, 'and it lands on whoever is in front').toBe(true);
  });

  it("Box: Lifeless Body blunts the next hits, the warp moves her up untouchable, and Sinker roots whoever it lands on", () => {
    const r = arena('Box', `
      fireSpecial(A, {down:true}); var limp = A.armor > 0 && A.rooted > 0;
      var p0 = A.pct; applyHit(A, 10, 8, -6, D); var took = A.pct - p0;
      A.armor = 0; A.rooted = 0; A.hitstun = 0; A.invuln = 0; A.x = 400; A.y = groundY()-24; A.spCd = 0; A.onground = true; step();
      var y0 = A.y; fireSpecial(A, {up:true}); var rose = y0 - A.y, inv = A.invuln;
      A.x = 400; A.y = groundY()-24; A.vy = 0; A.vx = 0; A.onground = true; A.invuln = 0; A.hitstun = 0; D.x = 470; D.invuln = 0; D.pct = 30; A.smCd = 0; step();
      doSmash(A, 1.0); var rooted = 0; for (var i=0;i<80;i++){ step(); rooted = Math.max(rooted, D.rooted||0); }
      return { limp: limp, took: took, rose: rose, inv: inv, dmg: D.pct - 30, rooted: rooted };`);
    expect(r.limp).toBe(true);
    expect(r.took).toBeCloseTo(6, 5);
    expect(r.rose).toBeGreaterThan(100);
    expect(r.inv).toBeGreaterThan(0);
    expect(r.dmg).toBeGreaterThan(10);
    expect(r.rooted).toBeGreaterThan(0);
  });

  it('Trophy: the flash marks one foe without a scratch, their hits go soft, and the next special shows the picture', () => {
    const r = arena('Trophy', `
      doSpecial(A); var marked = D._blackmailBy === A.idx && D.weakened > 0, scratch = D.pct - 30;
      var e0 = E._blackmailBy;
      for (var i=0;i<20;i++) step();
      var p0 = A.pct; applyHit(A, 10, 0, 0, D); var soft = A.pct - p0;
      A.spCd = 0; D.x = 700; D.invuln = 0; D.hitstun = 0; var d0 = D.pct;
      doSpecial(A);
      return { marked: marked, scratch: scratch, other: e0, soft: soft, shown: D.pct - d0, stunned: D._stunFx > 0, over: D._blackmailBy == null && !(D.weakened > 0) };`);
    expect(r.marked).toBe(true);
    expect(r.scratch).toBe(0);
    expect(r.other == null, 'one at a time').toBe(true);
    expect(r.soft).toBeCloseTo(7, 5);
    expect(r.shown, 'wherever they are').toBeCloseTo(10, 5);
    expect(r.stunned).toBe(true);
    expect(r.over, 'the deal is over').toBe(true);
    const miss = arena('Trophy', `A.face = -1; doSpecial(A); return D._blackmailBy == null;`);
    expect(miss, 'the lens only looks one way').toBe(true);
  });

  it('Trophy: Sore Loser hops and stomps whoever is in front flat; Off the Iceberg punts them', () => {
    const r = arena('Trophy', `
      fireSpecial(A, {down:true}); var hopped = A.vy < 0, stomp = 0, down = false;
      for (var i=0;i<40;i++){ step(); if (D.pct > 30 && !stomp){ stomp = D.pct - 30; down = D._stunFx > 0; } }
      A.x = 400; A.y = groundY()-24; A.onground = true; A.hitstun = 0; A.smCd = 0; D.x = 450; D.invuln = 0; D.pct = 30; D.hitstun = 0; step();
      doSmash(A, 1.0); for (var j=0;j<20;j++) step();
      return { hopped: hopped, stomp: stomp, down: down, kick: D.pct - 30 };`);
    expect(r.hopped).toBe(true);
    expect(r.stomp).toBeCloseTo(9, 5);
    expect(r.down).toBe(true);
    expect(r.kick).toBeGreaterThan(12);
  });

  it('Goo swallows whoever he reaches, holds them inside, and spits them out; a hit on him lets them loose', () => {
    const r = arena('Goo', `
      D.x = 470; doSpecial(A);
      var inside = Math.abs(D.x - A.x) < 20 && D.rooted > 0, swallow = D.pct - 30;
      for (var i=0;i<30;i++) step();
      var held = Math.abs(D.x - A.x) < 20;
      for (var j=0;j<30;j++) step();
      return { inside: inside, swallow: swallow, held: held, total: D.pct - 30, out: D.x - A.x };`);
    expect(r.inside).toBe(true);
    expect(r.swallow).toBeCloseTo(2, 5);
    expect(r.held).toBe(true);
    expect(r.total).toBeCloseTo(8, 5);
    expect(r.out, 'spat out forward').toBeGreaterThan(20);
    const freed = arena('Goo', `D.x = 470; doSpecial(A); for (var i=0;i<10;i++) step(); A.invuln = 0; applyHit(A, 5, 0, 0, E);
      for (var j=0;j<60;j++) step(); return D.pct - 30;`);
    expect(freed, 'no spit once Goo is struck').toBeCloseTo(2, 5);
    const whiff = arena('Goo', `D.x = 700; doSpecial(A); for (var i=0;i<50;i++) step(); return D.pct - 30;`);
    expect(whiff).toBe(0);
  });

  it('Goo: Meltdown leaves a slick that trips whoever walks in, and Puffed Up bounces everyone touching him off', () => {
    const r = arena('Goo', `
      fireSpecial(A, {down:true}); var melted = A.invuln > 0;
      var slick = projectiles.find(function(p){ return p.owner===A.idx && p.shape==='goopuddle' && p.trap; });
      for (var i=0;i<10;i++) step();
      D.x = A.x + 20; D.invuln = 0; var tripped = 0;
      for (var j=0;j<10;j++){ step(); if (D.pct > 30 && !tripped) tripped = D.pct - 30; }
      A.x = 400; A.invuln = 0; A.smCd = 0; A.hitstun = 0; D.x = 470; D.pct = 30; D.invuln = 0; D.hitstun = 0; projectiles = []; step();
      doSmash(A, 1.0); var giant = false; for (var k=0;k<30;k++){ step(); if (A._sm && A._sm.pat === 'burst') giant = true; }
      return { melted: melted, slick: !!slick, tripped: tripped, puffed: D.pct - 30, giant: giant };`);
    expect(r.melted).toBe(true);
    expect(r.slick).toBe(true);
    expect(r.tripped).toBeCloseTo(4, 5);
    expect(r.puffed).toBeGreaterThan(10);
    expect(r.giant, 'the burst the giant render is drawn for').toBe(true);
  });

  it('Lifering: a whistle, then a flat-out sprint into the first fighter he reaches; First Aid heals him and his team', () => {
    const r = arena('Lifering', `
      D.x = 600; doSpecial(A); var whistle = !!(A._windup && A._windup.g1Whistle), x0 = A.x;
      var dashed = false; for (var i=0;i<30;i++){ step(); if (A._dashing > 0) dashed = true; }
      return { whistle: whistle, dashed: dashed, ran: A.x - x0, hit: D.pct - 30 };`, 600);
    expect(r.whistle).toBe(true);
    expect(r.dashed).toBe(true);
    expect(r.ran).toBeGreaterThan(150);
    expect(r.hit).toBeCloseTo(8, 5);
    // a teammate in FFA terms: the same team number (the teams stage has its own floor, which the arena clears)
    const aid = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=4; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Lifering'; }), 400, groundY()-24, 0);
      var M = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 450, groundY()-24, 1);
      var N = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 150, groundY()-24, 3);
      var F = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 650, groundY()-24, 2);
      A.team=0; M.team=0; N.team=0; F.team=1; [A,M,N,F].forEach(function(f){ f.controller='still'; f.stocks=9; });
      fighters=[A,M,N,F]; step(); [A,M,N,F].forEach(function(f){ f.pct=40; f.invuln=0; f.hitstun=0; f._hurt=0; f.spCd=0; });
      fireSpecial(A, {down:true}); for (var i=0;i<50;i++) step();
      return { zoned: false, dead: [A,M,N,F].some(function(f){ return f.dead; }), me: 40 - A.pct, mate: 40 - M.pct, far: 40 - N.pct, foe: 40 - F.pct }; })()`);
    expect(aid.dead).toBe(false);
    expect(aid.zoned).toBe(false);
    expect(aid.me).toBeGreaterThan(5);
    expect(aid.me).toBeLessThan(7.5);
    expect(aid.mate, 'a teammate beside him is patched up too').toBeGreaterThan(5);
    expect(aid.far, 'only beside him').toBe(0);
    expect(aid.foe).toBe(0);
  });

  it('the poses and the drawn props are render-only: a body draws in place only while its move lasts', () => {
    const r = W.eval(`(function(){
      var mk = function(n){ var f = makeFighter(ROSTER.find(function(r){ return r.name===n; }), 400, groundY()-24, 0); f.idx = 0; return f; };
      var calls = 0, c = new Proxy({}, { get:function(){ return function(){ calls++; }; }, set:function(){ return true; } });
      var B = mk('Box'), T = mk('Trophy'), L = mk('Lifering');
      var idle = FIGHTER_ANIM.Box.body(B, c) || FIGHTER_ANIM.Lifering.body(L, c);
      T._g1Pose = 'camera'; T._g1PoseUntil = hazardT + 10; var n0 = calls; FIGHTER_ANIM.Trophy.over(T, c); var cam = calls - n0;
      T._g1PoseUntil = hazardT; n0 = calls; FIGHTER_ANIM.Trophy.over(T, c); var gone = calls - n0;
      L._windup = { t:5, t0:10, fire:function(){}, g1Whistle:true }; n0 = calls; FIGHTER_ANIM.Lifering.over(L, c); var whistle = calls - n0;
      return { idle: idle, cam: cam, gone: gone, whistle: whistle };
    })()`);
    expect(r.idle, 'no pose, the ordinary render').toBe(false);
    expect(r.cam, 'the camera and its flash').toBeGreaterThan(5);
    expect(r.gone).toBe(0);
    expect(r.whistle, 'the whistle').toBeGreaterThan(5);
  });
});
