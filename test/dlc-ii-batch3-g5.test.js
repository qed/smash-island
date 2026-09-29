import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';

// "add the last set of dlc fighters." -> "New II fighters" (2026-09-27). Batch 3, group 5: Blueberry, the Cherries, Clover and
// Jack, their kits from the II wiki (inanimateinsanity.fandom.com) and the owner's answers: Q1 "Cut from the frames" (the
// rock, the olive-oil slick, the pager), Q7 "Cookie trap" (Blueberry's smash), Q8 "a peel appears under a foe" (Clover's
// smash), Q12 "keep the attack lines out" (no text on screen for any move). Nothing from the OSC (OJ, Suitcase, Cabby).

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const NAMES = ['Blueberry', 'Cherries', 'Clover', 'Jack'];
const KITS = { Blueberry: 'blueberry', Cherries: 'cherries', Clover: 'clover', Jack: 'jack' };
const HTML = readFileSync('artifacts/V1/index.html', 'utf8');
const CREDITS = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');

// A fighter at 400 facing right, Pen standing still at foeX, both on 30%.
const arena = (name, body, foeX = 440) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ${foeX}, groundY()-24, 1);
  A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; step();
  [A,D].forEach(function(f){ f.invuln=0; f.pct=30; f.hitstun=0; f.spCd=0; f.atkCd=0; f.smCd=0; f.armor=0; f.dropCd=0; });
  A.onground = true;
  ${body}
})()`);

describe('the four arrive as II DLC fighters', () => {
  it('each has a roster row, unlocked from the start and not in the Vault, with its render on disk', () => {
    const r = W.eval(`(function(){ return ${JSON.stringify(NAMES)}.map(function(n){ var x = ROSTER.find(function(q){ return q.name===n; });
      return x && { name:n, play:x.play, dlc:x.dlc, special:x.kit.special, desc:x.kit.desc, open:isUnlocked(x),
        vault:(typeof VAULT_FIGHTERS!=='undefined') && (VAULT_FIGHTERS.has ? VAULT_FIGHTERS.has(n) : VAULT_FIGHTERS.indexOf(n)>=0),
        src:SPRITES[n] && SPRITES[n].src, poly:!!HURT_POLY[n], rig:!!LIMB_RIG[n], box:!!HURTBOX[n] }; }); })()`);
    for (const x of r) {
      expect(x, 'a roster row').toBeTruthy();
      expect(x.play).toBe(true);
      expect(x.dlc).toBe('Inanimate Insanity');
      expect(x.special).toBe(KITS[x.name]);
      expect(x.desc.startsWith({ Blueberry: 'Palanquin Catch →', Cherries: 'Play Dirty →', Clover: 'Butterflies →', Jack: 'Pager Hurl →' }[x.name])).toBe(true);
      expect(x.open, `${x.name} arrives unlocked`).toBe(true);
      expect(x.vault, `${x.name} is not a Vault fighter`).toBe(false);
      expect(x.src).toBe(`assets/sprites/${x.name.toLowerCase()}.png`);
      expect(x.poly && x.rig && x.box, `${x.name}: traced hurtbox, limbs and the ellipse fallback`).toBe(true);
    }
  });

  it('each render is a transparent 200px cut-out from the II wiki, on the manifest and credited', () => {
    const ii = JSON.parse(readFileSync('scripts/sprite-manifest-inanimateinsanity.json', 'utf8'));
    const file = { Blueberry: 'Blueberry2024Pose.png', Cherries: 'Cherries2024Pose.png', Clover: 'Clover2024Pose.png', Jack: 'Jack.png' };
    for (const n of NAMES) {
      const f = `artifacts/V1/assets/sprites/${n.toLowerCase()}.png`;
      expect(existsSync(f), f).toBe(true);
      const png = PNG.sync.read(readFileSync(f));
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      expect(png.height).toBe(200);
      expect(clear / (png.width * png.height), `${n} is a cut-out`).toBeGreaterThan(0.2);
      expect(ii[n] && ii[n].ok).toBe(true);
      expect(ii[n].source).toContain(`inanimateinsanity/images/`);
      expect(ii[n].source).toContain(file[n].replace(/ /g, '_'));
      expect(typeof ii[n].facing).toBe('number');
      expect(CREDITS).toContain('`' + n.toLowerCase() + '.png`');
    }
  });
});

// The seven inputs, measured the way test/move-text does: first hit on a still Pen at 40, 110 and 220 px.
const MOVES = { jab: 'A.atkCd=0; doAttack(A)', ranged: 'A.atkCd=0; doGroundMove(A)', utilt: 'A.atkCd=0; doUpTilt(A)', special: 'fireSpecial(A, {})',
  up: 'fireSpecial(A, {up:true})', down: 'fireSpecial(A, {down:true})', finisher: 'doAttackSpecial(A)' };
const measure = (name, call, dist) => arena(name, `
  window.__lastBanner = null;
  try { ${call}; } catch(e){ return { err: String(e && e.message || e) }; }
  var first = D.pct > 30.05 ? D.pct - 30 : 0, last = D.pct, any = D.pct - 30;
  for (var i=0;i<70;i++){
    step(); D.x = Math.max(D.x, 60); D.dead = false;
    if (!first && D.pct > last + 0.3) first = D.pct - last;
    last = D.pct; any = Math.max(any, D.pct - 30);
  }
  return { first: +first.toFixed(2), any: +any.toFixed(2), banner: window.__lastBanner && window.__lastBanner.text || null };`, 400 + dist);

describe('every input works, and lands what its card says', () => {
  for (const name of NAMES) {
    it(`${name}: all seven run, and each card's number is what lands (or nothing does)`, () => {
      const text = W.eval(`MOVE_TEXT[${JSON.stringify(name)}]`);
      const bad = [];
      for (const [move, call] of Object.entries(MOVES)) {
        const line = text[move];
        if (!line || !/^[^—]+ — ./.test(line) || line.length > 210) { bad.push(`${move}: line ${JSON.stringify(line)}`); continue; }
        const m = [40, 110, 220].map((d) => measure(name, call, d));
        for (const x of m) if (x.err) bad.push(`${move}: threw ${x.err}`);
        for (const x of m) if (x.banner) bad.push(`${move}: put "${x.banner}" on screen`);
        if (/no hit:/i.test(line)) { if (Math.max(...m.map((x) => x.any || 0)) > 0.3) bad.push(`${move}: says no hit, dealt ${m.map((x) => x.any)}`); continue; }
        const nums = [...(line.match(/On hit: (.*)$/) || ['', ''])[1].matchAll(/(\d+(?:\.\d+)?)%/g)].map((x) => +x[1]);
        const landed = m.filter((x) => x.first > 0).map((x) => x.first);
        if (!landed.length) bad.push(`${move}: landed nothing at 40, 110 or 220 :: ${line}`);
        else if (!landed.some((d) => nums.some((n) => Math.abs(d - n) <= Math.max(1.05, n * 0.12)))) bad.push(`${move}: says ${nums}%, lands ${landed}`);
      }
      expect(bad).toEqual([]);
    }, 120000);
  }
});

describe('Blueberry', () => {
  it('Palanquin Catch: whoever is right in front is lifted and slammed down, and a shot that reaches him goes back', () => {
    const r = arena('Blueberry', `
      fireSpecial(A, {});
      var slam = { dmg: D.pct - 30, down: D._stunFx > 0, up: D.vy < 0, rooted: A.rooted > 0, stance: A.reflecting > 0 };
      D.x = 700; D.pct = 30; D.invuln = 0; D._stunFx = 0;
      var shot = addProj({ owner:D.idx, ownerObj:D, x:A.x + 60, y:A.y, vx:-8, vy:0, grav:false, dmg:5, kb:3, r:8, color:'#fff', life:60 });
      var back = false; for (var i=0;i<12;i++){ step(); if (shot.owner===A.idx && shot.vx > 0) back = true; }
      return { slam: slam, back: back, aPct: A.pct };`);
    expect(r.slam.dmg).toBeCloseTo(10, 0);
    expect(r.slam.down && r.slam.up, 'lifted and slammed: knocked down').toBe(true);
    expect(r.slam.rooted && r.slam.stance).toBe(true);
    expect(r.back, 'the shot goes straight back, his now').toBe(true);
    expect(r.aPct).toBe(30);
  });

  it('Oatmeal Raisin sets the S3 cookie down; the first foe near it goes up in flames, and he pays 4% himself', () => {
    const r = arena('Blueberry', `
      doSmash(A);
      var cookie = projectiles.find(function(p){ return p.owner===A.idx && p._mine; });
      var self = A.pct - 30, hit = 0;
      for (var i=0;i<120 && !hit;i++){ step(); D.x = A.x + 40; D.invuln = 0; if (D.pct > 30) hit = D.pct - 30; }
      return { shape: cookie && cookie.shape, self: self, hit: hit, burn: D.burn > 0 };`, 700);
    expect(r.shape).toBe('oatcookie');
    expect(r.self).toBe(4);
    expect(r.hit).toBeGreaterThanOrEqual(15);
    expect(r.burn).toBe(true);
  });

  it('Overhead Press rises and knocks down whoever is above; Play Dead is untouchable, then hits land harder', () => {
    const up = arena('Blueberry', `var y0 = A.y; D.x = A.x + 10; D.y = A.y - 50; fireSpecial(A, {up:true}); step();
      return { rose: A.y < y0, hit: D.pct > 30, down: D._stunFx > 0 };`);
    expect(up.rose && up.hit && up.down).toBe(true);
    const dn = arena('Blueberry', `fireSpecial(A, {down:true});
      var s = { invuln: A.invuln, rooted: A.rooted, empower: A._empowerT };
      applyHit(A, 10, 4, -4, D); var took = A.pct - 30;
      return { s: s, took: took };`);
    expect(dn.s.invuln).toBeGreaterThanOrEqual(44);
    expect(dn.s.rooted).toBeGreaterThanOrEqual(44);
    expect(dn.s.empower).toBeGreaterThan(dn.s.invuln);
  });
});

describe('the Cherries', () => {
  it('Play Dirty: a slick ahead trips the first one onto it and is gone, and it trips the Cherries too', () => {
    const r = arena('Cherries', `
      fireSpecial(A, {});
      var oil = projectiles.find(function(p){ return p._cherryOil===A.idx; });
      var at = oil && oil.x, hit = 0, down = false;
      for (var i=0;i<60 && !hit;i++){ step(); D.x = at + 20; D.invuln = 0; if (D.pct > 30){ hit = D.pct - 30; down = D._stunFx > 0; } }
      var gone = !projectiles.some(function(p){ return p._cherryOil===A.idx; });
      // their own oil: a fresh slick, and the Cherries walk onto it
      D.x = 900; A.spCd = 0; A.x = 400; A.face = 1; fireSpecial(A, {});
      var oil2 = projectiles.find(function(p){ return p._cherryOil===A.idx; });
      for (var j=0;j<30;j++) step();
      var a0 = A.pct, self = false;
      for (var k=0;k<40 && !self;k++){ A.x = oil2.x; A.invuln = 0; step(); if (A.pct > a0) self = A._stunFx > 0; }
      // one slick at a time
      A.spCd = 0; fireSpecial(A, {}); A.spCd = 0; fireSpecial(A, {});
      var n = projectiles.filter(function(p){ return p._cherryOil===A.idx; }).length;
      return { shape: oil && oil.shape, ahead: at - 400, hit: hit, down: down, gone: gone, self: self, n: n };`, 900);
    expect(r.shape).toBe('oliveoil');
    expect(r.ahead).toBe(60);
    expect(r.hit).toBeCloseTo(4, 1);
    expect(r.down).toBe(true);
    expect(r.gone).toBe(true);
    expect(r.self, '"then they slipped in their own oil"').toBe(true);
    expect(r.n).toBe(1);
  });

  it('All the Way to Mars: the rock on the hidden rope launches almost straight up', () => {
    const r = arena('Cherries', `
      doSmash(A);
      var rock = projectiles.find(function(p){ return p.owner===A.idx && p._mine; });
      var hit = false, vx = 0, vy = 0;
      for (var i=0;i<120 && !hit;i++){ step(); D.x = A.x + 40; D.invuln = 0; if (D.pct > 30){ hit = true; vx = D.vx; vy = D.vy; } }
      return { rock: !!rock, hit: hit, vx: vx, vy: vy, down: D._stunFx > 0 };`, 700);
    expect(r.rock && r.hit && r.down).toBe(true);
    expect(r.vy).toBeLessThan(0);
    expect(Math.abs(r.vy), 'more up than across').toBeGreaterThan(Math.abs(r.vx) * 2);
  });

  it('Leg Up the Wall rises and stuns; The Bait trips the first foe to come close, and never the Cherries', () => {
    const up = arena('Cherries', `var y0 = A.y; fireSpecial(A, {up:true}); step(); return { rose: A.y < y0, hit: D.pct > 30, stun: D._stunFx > 0 };`);
    expect(up.rose && up.hit && up.stun).toBe(true);
    const bait = arena('Cherries', `
      fireSpecial(A, {down:true});
      var trap = projectiles.find(function(p){ return p._cherryBait===A.idx; });
      var a0 = A.pct, hit = 0, rooted = A.rooted;
      for (var i=0;i<40 && !hit;i++){ D.x = 900 - i*14; D.invuln = 0; step(); if (D.pct > 30) hit = D.pct - 30; }
      return { trap: !!trap, rooted: rooted, hit: hit, down: D._stunFx > 0, self: A.pct - a0 };`, 900);
    expect(bait.trap && bait.rooted > 0).toBe(true);
    expect(bait.hit).toBeCloseTo(6, 1);
    expect(bait.down).toBe(true);
    expect(bait.self).toBe(0);
  });
});

describe('Clover', () => {
  it('Butterflies: four drift ahead, one swarm at a time; touching one weakens; a shot in front is caught at the cast', () => {
    const r = arena('Clover', `
      var shot = addProj({ owner:D.idx, ownerObj:D, x:A.x + 70, y:A.y, vx:-1, vy:0, grav:false, dmg:5, kb:3, r:8, color:'#fff', life:60 });
      fireSpecial(A, {});
      var flies = projectiles.filter(function(p){ return p._cloverFly; });
      var caught = projectiles.indexOf(shot) < 0;
      A.spCd = 0; fireSpecial(A, {});
      var n = projectiles.filter(function(p){ return p._cloverFly; }).length;
      var slow = flies.every(function(p){ return Math.abs(p.vx) < 4 && !p.grav; });
      var hit = false; for (var i=0;i<40 && !hit;i++){ step(); D.invuln = 0; if (D.pct > 30) hit = true; }
      return { n1: flies.length, n: n, caught: caught, slow: slow, hit: hit, weak: D.weakened > 0, aPct: A.pct };`, 470);
    expect(r.n1).toBe(4);
    expect(r.n).toBe(4);
    expect(r.caught).toBe(true);
    expect(r.slow).toBe(true);
    expect(r.hit && r.weak).toBe(true);
    expect(r.aPct).toBe(30);
  });

  it('Lucky Break drops a banana peel on the nearest foe, and they slip', () => {
    const r = arena('Clover', `
      doSmash(A);
      var peel = projectiles.find(function(p){ return p.owner===A.idx && p.shape==='bananapeel'; });
      var at = peel && peel.warnX, hit = false;
      for (var i=0;i<150 && !hit;i++){ step(); D.x = 580; D.vx = 0; D.invuln = 0; if (D.pct > 30) hit = true; }
      return { at: at, hit: hit, down: D._stunFx > 0 };`, 580);
    expect(r.at).toBe(580);
    expect(r.hit && r.down).toBe(true);
  });

  it('Lucky Wind lifts her with a jump back; Meant for Me turns the next hit onto whoever threw it', () => {
    const up = arena('Clover', `var y0 = A.y; A.jumps = 0; fireSpecial(A, {up:true}); var j = A.jumps; for (var i=0;i<8;i++) step(); return { rose: y0 - A.y, jumps: j, hit: D.pct - 30 };`);
    expect(up.rose).toBeGreaterThan(40);
    expect(up.jumps).toBeGreaterThanOrEqual(1);
    expect(up.hit).toBe(0);
    const dn = arena('Clover', `fireSpecial(A, {down:true}); var c = A.countering;
      applyHit(A, 8, -5, -4, D); return { c: c, me: A.pct - 30, them: D.pct - 30 };`);
    expect(dn.c).toBeGreaterThan(0);
    expect(dn.me, 'it misses her').toBe(0);
    expect(dn.them, 'and lands on the one who threw it').toBeGreaterThan(0);
  });
});

describe('Jack', () => {
  it('Pager Hurl: straight and fast at leg height, knocks down, one pager at a time', () => {
    const r = arena('Jack', `
      fireSpecial(A, {});
      var p = projectiles.find(function(q){ return q._jackPager; });
      var info = p && { vx: p.vx, grav: !!p.grav, low: p.y > A.y + 10 };
      A.spCd = 0; fireSpecial(A, {});
      var n = projectiles.filter(function(q){ return q._jackPager; }).length;
      var hit = false; for (var i=0;i<40 && !hit;i++){ step(); D.invuln = 0; if (D.pct > 30) hit = true; }
      return { info: info, n: n, hit: hit, down: D._stunFx > 0, dmg: D.pct - 30 };`, 640);
    expect(r.info).toEqual({ vx: 11, grav: false, low: true });
    expect(r.n).toBe(1);
    expect(r.hit && r.down).toBe(true);
    expect(r.dmg).toBeCloseTo(6, 0);
  });

  it('Agree to Disagree: he throws himself high, crashes on the foe ahead, and the landing hurts him too', () => {
    const r = arena('Jack', `var y0 = A.y; doSmash(A); var self = A.pct - 30, rise = 0, hit = false;
      for (var i=0;i<120 && !hit;i++){ step(); rise = Math.max(rise, y0 - A.y); D.x = 520; D.vx = 0; D.invuln = 0; if (D.pct > 30) hit = true; }
      return { self: self, rise: rise, hit: hit, down: D._stunFx > 0 };`, 520);
    expect(r.self).toBe(7);
    expect(r.rise).toBeGreaterThan(40);
    expect(r.hit && r.down).toBe(true);
  });

  it('I Prefer to Wrestle throws them behind him; Knuckles weakens the foe in front and nobody behind', () => {
    const up = arena('Jack', `D.x = A.x + 20; fireSpecial(A, {up:true}); return { hit: D.pct > 30, back: D.vx < 0, down: D._stunFx > 0 };`);
    expect(up.hit && up.back && up.down).toBe(true);
    const dn = arena('Jack', `
      var B = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 340, groundY()-24, 2); B.team=2; B.controller='still'; fighters.push(B);
      fireSpecial(A, {down:true}); return { front: D.weakened > 0, behind: B.weakened > 0, dmg: D.pct - 30, rooted: A.rooted > 0 };`, 500);
    expect(dn).toEqual({ front: true, behind: false, dmg: 0, rooted: true });
  });
});

describe('no text, no OSC, and the show\'s art on everything thrown', () => {
  it('no move puts a word on the screen: the smash included', () => {
    const shown = [];
    for (const name of NAMES) for (const call of ['doSmash(A, 1.0)', 'fireSpecial(A, {})', 'fireSpecial(A, {up:true})', 'fireSpecial(A, {down:true})', 'doAttackSpecial(A)']) {
      const t = arena(name, `A.you = true; window.__lastBanner = null; ${call};
        for (var i=0;i<60;i++){ step(); D.invuln = 0; D.dead = false; A.dead = false; if (i===10) applyHit(A, 5, 0, 0, D); }
        return window.__lastBanner && window.__lastBanner.text || null;`);
      if (t) shown.push(`${name} ${call}: "${t}"`);
    }
    expect(shown).toEqual([]);
  }, 60000);

  it('nothing in their rows names OJ, Suitcase or Cabby', () => {
    // The @b3 slot markers were removed at integration, so this reads the whole file: the only OSC names in it are in
    // the one comment that says they are left out.
    const HTML_LINES = HTML.split(/\r?\n/);
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
    const osc = /\b(OJ|Suitcase|Cabby)\b/;
    expect(CREDITS.split(/\r?\n/).filter((l) => osc.test(l) && /Blueberry|Cherries|Clover|Jack/.test(l))).toEqual([]);
  });

  it('every thing they throw or set down draws as the show\'s art, has a glyph behind it, and the files are clean cut-outs', () => {
    const want = { oatcookie: 'oatcookie.png', cherries: 'marsrock.png', oliveoil: 'oliveoil.png', clover: 'butterfly.png', bananapeel: 'bananapeel.png', jack: 'pager.png' };
    const r = W.eval(`(function(){ var o = {}; ${JSON.stringify(Object.keys(want))}.forEach(function(k){ o[k] = { src: ATTACK_SPRITES[k] && ATTACK_SPRITES[k].src, glyph: !!PROJ_SHAPE[k] }; });
      o.kits = ['blueberry','cherries','clover','jack','cherrybait'].filter(function(k){ return !PROJ_SHAPE[k]; }); return o; })()`);
    expect(r.kits, 'every kit and shape has a glyph').toEqual([]);
    const manifest = JSON.parse(readFileSync('scripts/attack-sprite-manifest.json', 'utf8'));
    for (const [k, file] of Object.entries(want)) {
      expect(r[k].src).toBe(`assets/sprites/attacks/${file}`);
      expect(r[k].glyph).toBe(true);
      const png = PNG.sync.read(readFileSync(`artifacts/V1/assets/sprites/attacks/${file}`));
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      expect(Math.max(png.width, png.height)).toBeLessThanOrEqual(128);
      expect(clear / (png.width * png.height), `${file} is transparent`).toBeGreaterThan(0.1);
      const e = manifest[file.replace('.png', '')];
      expect(e && e.file).toBe(file);
      expect([png.width, png.height]).toEqual([e.width, e.height]);
      expect(e.source).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/inanimateinsanity\/images\//);
      expect(CREDITS).toContain(`(${file})`);
      expect(CREDITS).toContain(e.source);
    }
    // Q1: the three cut out of episode frames carry nothing of the frame -- no grass, sky or backdrop
    expect(['marsrock', 'oliveoil', 'pager'].map((k) => manifest[k].key)).toEqual(['rock', 'slick', 'pager']);
    const solid = (f, test) => { const p = PNG.sync.read(readFileSync(`artifacts/V1/assets/sprites/attacks/${f}`)); let n = 0;
      for (let i = 0; i < p.data.length; i += 4) if (p.data[i + 3] >= 128 && test(p.data[i], p.data[i + 1], p.data[i + 2])) n++; return n; };
    expect(solid('marsrock.png', (r0, g, b) => g > r0 + 30 && g > b + 20), 'grass').toBe(0);
    expect(solid('pager.png', (r0, g, b) => Math.abs(r0 - 68) < 10 && Math.abs(g - 87) < 10 && Math.abs(b - 78) < 10), 'the backdrop').toBe(0);
    expect(solid('oliveoil.png', (r0, g, b) => r0 - g > 60), 'a cherry').toBe(0);
  });
});
