import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';

// "add the last set of dlc fighters." -> "New II fighters". Batch 3, group 6: Magnet, MeTag, Poppy and Silver Spoon, their kits
// from the II wiki and the owner's answers (Q1 "Cut from the frames", Q2 "Small drawn props", Q11 "personality pulls", Q15
// "heal only", and "remember to keep the attack lines out"). Nothing from the OSC (OJ, Suitcase, Cabby).

const NAMES = ['Magnet', 'MeTag', 'Poppy', 'Silver Spoon'];
const KEYS = { Magnet: 'bestie', MeTag: 'barrier', Poppy: 'vacuum', 'Silver Spoon': 'glowgold' };
const HTML = readFileSync('artifacts/V1/index.html', 'utf8');
let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// A at 400 facing right, Pen at foeX, both on the floor, nothing else on the stage.
const arena = (name, body, foeX = 460) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true; window.__lastBanner=null;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ${foeX}, groundY()-24, 1);
  A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; step();
  [A,D].forEach(function(f){ f.invuln=0; f.pct=30; f.hitstun=0; f.spCd=0; f.atkCd=0; f.armor=0; f.smCd=0; });
  A.onground = true;
  ${body}
})()`);
const run = (n) => `for (var i=0;i<${n};i++){ step(); D.dead=false; }`;
// the most a foe has taken over n frames (a launched foe can be KO'd and respawn at 0%)
const peak = (n) => `var mx = 0; for (var i=0;i<${n};i++){ step(); D.dead=false; mx = Math.max(mx, D.pct - 30); }`;

// The seven inputs, fired the way the move card's own test fires them.
const MOVES = { jab: 'A.atkCd=0; doAttack(A)', ranged: 'A.atkCd=0; doGroundMove(A)', utilt: 'A.atkCd=0; doUpTilt(A)', special: 'fireSpecial(A, {})',
  up: 'fireSpecial(A, {up:true})', down: 'fireSpecial(A, {down:true})', finisher: 'doAttackSpecial(A)' };

describe('group 6 joins the Inanimate Insanity DLC', () => {
  it('four roster rows, playable, in the DLC, open on a fresh save and not in the Vault', () => {
    const r = W.eval(`(function(){ return ${JSON.stringify(NAMES)}.map(function(n){ var x = ROSTER.find(function(r){ return r.name===n; });
      return x && [x.name, x.play, x.dlc, x.kit.special, isUnlocked(x), VAULT.fighters.some(function(v){ return v.name===n; })]; }); })()`);
    expect(r).toEqual(NAMES.map((n) => [n, true, 'Inanimate Insanity', KEYS[n], true, false]));
  });

  it("each has a real render: on disk, transparent, 200px tall, credited, and the registry's facing matches the manifest", () => {
    const manifest = JSON.parse(readFileSync('scripts/sprite-manifest-inanimateinsanity.json', 'utf8'));
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    for (const n of NAMES) {
      const m = manifest[n], sp = W.eval(`({ src: SPRITES[${JSON.stringify(n)}].src, flip: SPRITES[${JSON.stringify(n)}].flip })`);
      expect(m && m.ok, n).toBe(true);
      expect(sp.src).toBe(`assets/sprites/${m.file}`);
      expect(sp.flip, `${n} faces the way the manifest measured`).toBe(m.flip);
      const png = PNG.sync.read(readFileSync(`artifacts/V1/${sp.src}`));
      expect(png.height).toBe(200);
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      expect(clear / (png.width * png.height), `${n} is transparent`).toBeGreaterThan(0.2);
      expect(credits).toContain(m.file);
      expect(credits).toContain(m.source);
    }
  });

  it('the attack art is on disk, transparent, projectile-sized and credited; the barrier is drawn', () => {
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    for (const f of ['ghostvacuum.png', 'capturepod.png', 'immunitycookie.png']) {
      const p = `artifacts/V1/assets/sprites/attacks/${f}`;
      expect(existsSync(p), f).toBe(true);
      const png = PNG.sync.read(readFileSync(p));
      expect(Math.max(png.width, png.height)).toBeLessThanOrEqual(128);
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      expect(clear / (png.width * png.height), f).toBeGreaterThan(0.12);
      expect(credits).toContain(`(${f})`);
    }
    const r = W.eval(`['ghostvacuum','capturepod','immunitycookie','barrier','metagEdge','vacuum','glowgold'].map(function(k){ return [k, !!PROJ_SHAPE[k], !!ATTACK_SPRITES[k]]; })`);
    expect(r).toEqual([['ghostvacuum', true, true], ['capturepod', true, true], ['immunitycookie', true, true],
      ['barrier', true, false], ['metagEdge', true, false], ['vacuum', true, false], ['glowgold', true, false]]);
  });

  it('no one from the OSC in any group-6 row', () => {
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
  });
});

describe('every input runs, lands what its card says, and puts no word on the screen', () => {
  for (const n of NAMES) {
    it(`${n}: all seven inputs and the smash`, () => {
      const card = W.eval(`MOVE_TEXT[${JSON.stringify(n)}]`);
      for (const [move, call] of Object.entries(MOVES)) {
        const got = [40, 110, 220].map((d) => arena(n, `
          try { ${call}; } catch(e){ return { err: String(e && e.message || e) }; }
          var first = D.pct > 30.05 ? D.pct - 30 : 0, last = D.pct;
          for (var i=0;i<70;i++){ step(); D.x = Math.max(D.x, 60); D.dead = false; if (!first && D.pct > last + 0.3) first = D.pct - last; last = D.pct; }
          return { first: +first.toFixed(1), banner: window.__lastBanner };`, 400 + d));
        for (const g of got) { expect(g.err, `${n} ${move}`).toBeUndefined(); expect(g.banner, `${n} ${move} put words on screen`).toBeNull(); }
        const line = card[move], landed = got.map((g) => g.first).filter((x) => x > 0);
        if (/no hit:/i.test(line)) expect(landed, `${n} ${move}: "${line}"`).toEqual([]);
        else {
          const nums = [...line.split('On hit:')[1].matchAll(/(\d+(?:\.\d+)?)%/g)].map((x) => +x[1]);
          expect(landed.some((d) => nums.some((k) => Math.abs(d - k) <= Math.max(1.05, k * 0.12))), `${n} ${move}: says ${nums}, lands ${landed}`).toBe(true);
        }
      }
      const sm = arena(n, `doSmash(A); ${peak(80)} return { hit: mx, banner: window.__lastBanner };`, 470);
      expect(sm.hit, `${n}'s smash lands`).toBeGreaterThan(8);
      expect(sm.banner).toBeNull();
    });
  }
});

describe("Magnet: personality pulls (Q11), no literal magnetism", () => {
  it("C'mon, Bestie! hauls the nearest foe in front to her side and slows them for 4 seconds", () => {
    const r = arena('Magnet', `var d0 = D.x - A.x; fireSpecial(A, {}); var d1 = D.x - A.x; return { d0: d0, d1: d1, slowed: D.slowed, hit: D.pct - 30, cd: A.spCd };`, 510);
    expect(r.hit).toBe(3);
    expect(r.d1).toBeLessThan(r.d0 * 0.7);
    expect(r.slowed).toBeGreaterThanOrEqual(230);
    expect(r.cd, 'one bestie at a time: the cooldown outlasts the slow').toBeGreaterThan(240);
    const behind = arena('Magnet', `A.face = -1; fireSpecial(A, {}); return D.pct - 30;`, 510);
    expect(behind, 'only a foe in front').toBe(0);
  });

  it('By Popular Demand pulls a foe from well away, then stuns', () => {
    const r = arena('Magnet', `doSmash(A); var dmin = 1e9; for (var i=0;i<80;i++){ step(); dmin = Math.min(dmin, Math.abs(D.x - A.x)); if (D.pct > 30) break; } return { dx: dmin, hit: D.pct - 30, stun: D._stunFx > 0 };`, 550);
    expect(r.hit).toBeGreaterThan(8);
    expect(r.dx).toBeLessThan(100);
    expect(r.stun).toBe(true);
  });

  it('Another Brake stops her dead, launch and all, and slows whoever touches her', () => {
    const r = arena('Magnet', `A.vx = 14; A.vy = -9; A.onground = false; fireSpecial(A, {down:true}); return { vx: A.vx, vy: A.vy, slowed: D.slowed, hit: D.pct - 30 };`, 425);
    expect([r.vx, r.vy]).toEqual([0, 0]);
    expect(r.slowed).toBeGreaterThan(0);
    expect(r.hit).toBe(0);
  });

  it('Climbing Gear climbs and hauls up whoever is beside her', () => {
    const r = arena('Magnet', `var y0 = A.y; fireSpecial(A, {up:true}); ${run(6)} return { rose: y0 - A.y, hit: D.pct - 30 };`, 440);
    expect(r.rose).toBeGreaterThan(20);
    expect(r.hit).toBeGreaterThan(0);
  });
});

describe('MeTag: the barrier, the tracking and the arrest', () => {
  it('Barrier Generation stands a pane ahead that eats enemy shots, and bumps back a foe who walks in; one wall at a time', () => {
    const r = arena('MeTag', `
      fireSpecial(A, {});
      var wall = projectiles.filter(function(p){ return p._metagWall; }), wx = wall[0].x;
      var shot = addProj({owner:D.idx, ownerObj:D, x:wx + 120, y:A.y, vx:-10, vy:0, grav:false, dmg:9, kb:6, r:8, color:'#f00', life:60});
      ${run(20)}
      var blocked = shot.life <= 0 && A.pct === 30;
      D.x = wx + 30; D.vx = -6; var dx0 = D.x; ${run(4)}
      var bumped = D.x > wx;
      A.spCd = 0; fireSpecial(A, {});
      return { n: wall.length, turrets: wall.filter(function(p){ return p.turret; }).length, ahead: wx - A.x, blocked: blocked, bumped: bumped,
               after: projectiles.filter(function(p){ return p._metagWall; }).length, hit: D.pct - 30, life: wall[0].life };`, 700);
    expect(r.n).toBe(6);
    expect(r.turrets).toBe(3);
    expect(r.ahead).toBeGreaterThan(30);
    expect(r.blocked, 'an enemy shot stops dead at the pane').toBe(true);
    expect(r.bumped, 'a foe walking in is pushed back').toBe(true);
    expect(r.after, 'pressing again moves the wall, never two').toBe(6);
    expect(r.hit).toBe(0);
  });

  it('the wall goes after 2.5 seconds', () => {
    const r = arena('MeTag', `fireSpecial(A, {}); ${run(160)} return projectiles.filter(function(p){ return p._metagWall && p.life > 0; }).length;`, 900);
    expect(r).toBe(0);
  });

  it('Precision Finding locks the nearest foe, and the next wall goes up in front of them', () => {
    const r = arena('MeTag', `fireSpecial(A, {down:true}); var tr = A._g6track; A.spCd = 0; fireSpecial(A, {});
      var wall = projectiles.filter(function(p){ return p._metagWall; });
      return { idx: tr && tr.idx, D: D.idx, wx: wall[0].x, dx: D.x, hit: D.pct - 30 };`, 760);
    expect(r.idx).toBe(r.D);
    expect(Math.abs(r.wx - r.dx)).toBeLessThan(60);
    expect(r.wx, 'on the side facing MeTag').toBeLessThan(r.dx);
    expect(r.hit).toBe(0);
  });

  it('Under Arrest holds whoever it catches (a root, low knockback); Barrier Step rises and hits nobody', () => {
    const r = arena('MeTag', `doSmash(A); ${run(8)} return { rooted: D.rooted, hit: D.pct - 30 };`, 470);
    expect(r.hit).toBeGreaterThan(8);
    expect(r.rooted).toBeGreaterThan(40);
    const u = arena('MeTag', `var y0 = A.y; fireSpecial(A, {up:true}); ${run(6)} return { rose: y0 - A.y, hit: D.pct - 30 };`, 440);
    expect(u.rose).toBeGreaterThan(20);
    expect(u.hit).toBe(0);
  });
});

describe('Poppy: the ghost vacuum, the soldering iron, the pop and the fix', () => {
  it('Ghost Vacuum roots Poppy, sucks a foe in from well away, and pops them out in a pod: 8% and rooted', () => {
    const r = arena('Poppy', `fireSpecial(A, {}); var rootedSelf = A.rooted;
      var art = projectiles.filter(function(p){ return p.owner===A.idx; }).map(function(p){ return p.shape; }).sort();
      var hits = projectiles.filter(function(p){ return p.owner===A.idx && !(p.arm > 1e6); }).length;
      ${run(40)} return { rootedSelf: rootedSelf, art: art, hits: hits, hit: D.pct - 30, rooted: D.rooted, dx: Math.abs(D.x - A.x) };`, 530);
    expect(r.rootedSelf).toBeGreaterThan(30);
    expect(r.art).toEqual(['capturepod', 'ghostvacuum']);
    expect(r.hits, 'the vacuum and the pod are pictures, never hits').toBe(0);
    expect(r.hit).toBe(8);
    expect(r.rooted).toBeGreaterThan(0);
    expect(r.dx).toBeLessThan(80);
  });

  it('Soldering Iron burns; Pop-Up bursts straight up and knocks down', () => {
    const s = arena('Poppy', `doSmash(A); ${run(10)} return { burn: D.burn, hit: D.pct - 30 };`, 460);
    expect(s.hit).toBeGreaterThan(8);
    expect(s.burn).toBeGreaterThan(0);
    const u = arena('Poppy', `var y0 = A.y; fireSpecial(A, {up:true}); ${run(6)} return { rose: y0 - A.y, hit: D.pct - 30 };`, 430);
    expect(u.rose).toBeGreaterThan(20);
    expect(u.hit).toBeGreaterThan(0);
  });

  it('Quick Fix mends about 10% over a second, and a hit pauses it', () => {
    const r = arena('Poppy', `A.pct = 50; fireSpecial(A, {down:true}); ${run(70)} return A.pct;`, 900);
    expect(r).toBeLessThan(42);
    expect(r).toBeGreaterThan(38);
    const hurt = arena('Poppy', `A.pct = 50; fireSpecial(A, {down:true}); applyHit(A, 5, 0, 0, D); ${run(70)} return A.pct;`, 900);
    expect(hurt).toBeGreaterThan(54);
  });
});

describe('Silver Spoon: glowing gold, the punch, the rise and the cookie', () => {
  it('Glowing Gold: he blacks out first, then hits harder and runs faster for 6 seconds; hits do not end it', () => {
    const r = arena('Silver Spoon', `fireSpecial(A, {}); var out = A.hitstun, t0 = { e: A._empowerT, h: A._hasteT, s: A._starT };
      ${run(45)} applyHit(A, 3, 0, 0, D); ${run(20)} A.hitstun = 0; A.atkCd = 0; D.x = A.x + 40; D.invuln = 0; D.pct = 30; doAttack(A); var gold = D.pct - 30;
      return { out: out, t0: t0, gold: gold, left: A._empowerT, cd: A.spCd };`, 900);
    expect(r.out).toBeGreaterThanOrEqual(40);
    expect(r.t0.e).toBeGreaterThanOrEqual(400);
    expect(r.t0.h).toBeGreaterThanOrEqual(400);
    expect(r.t0.s).toBeGreaterThanOrEqual(400);
    expect(r.gold, 'a 6.5% jab lands 9.1% in gold (ii-buffs: his jab 5 -> 6.5; gold is still x1.4)').toBeCloseTo(9.1, 0);
    expect(r.left).toBeGreaterThan(250);
    expect(r.cd, '8 s after it ends').toBeGreaterThan(600);
    const plain = arena('Silver Spoon', `doAttack(A); return D.pct - 30;`, 440);
    expect(plain).toBe(6.5);   // ii-buffs: the jab row 5 -> 6.5
  });

  it('Immunity Cookie: gold, heals 5% at once, shows the cookie and hits nobody (Q15 "heal only")', () => {
    const r = arena('Silver Spoon', `A.pct = 40; fireSpecial(A, {down:true});
      return { pct: A.pct, gold: A._starT > 0, cookie: projectiles.filter(function(p){ return p.shape==='immunitycookie'; }).length, invuln: A.invuln, hit: D.pct - 30 };`, 440);
    expect(r.pct).toBe(35);
    expect(r.gold).toBe(true);
    expect(r.cookie).toBe(1);
    expect(r.invuln, 'heal only: not untouchable').toBe(0);
    expect(r.hit).toBe(0);
  });

  it('Punched Into the Sky launches up and forward; Up, Up and Away rises armoured and hits nobody', () => {
    const s = arena('Silver Spoon', `doSmash(A); ${run(3)} return { hit: D.pct - 30, vx: D.vx, vy: D.vy };`, 470);
    expect(s.hit).toBeGreaterThan(12);
    expect(s.vx).toBeGreaterThan(0);
    expect(s.vy).toBeLessThan(0);
    const u = arena('Silver Spoon', `var y0 = A.y; fireSpecial(A, {up:true}); var armor = A.armor; ${run(6)} return { rose: y0 - A.y, armor: armor, hit: D.pct - 30 };`, 440);
    expect(u.rose).toBeGreaterThan(20);
    expect(u.armor).toBeGreaterThan(0);
    expect(u.hit).toBe(0);
  });
});
