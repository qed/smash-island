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
let CW;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); CW = W.eval('CIRCLE_WINDUP'); });

// A at 400 facing right, Pen at foeX, both on the floor, nothing else on the stage.
const arena = (name, body, foeX = 460, foe = 'Pen') => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true; window.__lastBanner=null;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(foe)}; }), ${foeX}, groundY()-24, 1);
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

describe("Magnet: Polarity (attract, repel and metal; 2026-10-07)", () => {
  // "give metag and magnet new kits." The owner's reading is now physical magnetism (it was "personality pulls, no literal magnetism", Q11): C attracts and
  // hits, down repels, and metal fighters are pulled and pushed further. The old bestie haul (a 3% tap and a 4 s slow) and the brake (no hit) were promises the
  // owner replaced; each test below is restated to its new promise.
  it("C'mon, Bestie! pulls the nearest foe in front toward her over about 16 frames and hits them as they arrive (9%, a real launch); only a foe in front, in reach", () => {
    const r = arena('Magnet', `var d0 = D.x - A.x; fireSpecial(A, {}); for (var i=0;i<8;i++){ step(); D.dead=false; } var mid = D.x - A.x, early = D.pct - 30;
      var vx = 0; for (var i=0;i<14;i++){ step(); D.dead=false; if (!vx && D.pct > 30) vx = D.vx; } return { d0: d0, mid: mid, early: early, hit: D.pct - 30, vx: vx, cd: A.spCd };`, 600);
    expect(r.mid, 'drawn in over the first half').toBeLessThan(r.d0*0.75);
    expect(r.early, 'no hit until they arrive').toBe(0);
    expect(r.hit).toBe(9);
    expect(r.vx, 'launched away from her').toBeGreaterThan(6);
    expect(r.cd, 'one pull at a time').toBeGreaterThan(60);
    expect(arena('Magnet', `A.face = -1; fireSpecial(A, {}); ${run(30)} return D.pct - 30;`, 600), 'only a foe in front').toBe(0);
    expect(arena('Magnet', `fireSpecial(A, {}); ${run(30)} return { hit: D.pct - 30, moved: D.x };`, 740), 'a plain foe 340 px away is out of reach').toEqual({ hit: 0, moved: 740 });
  });

  it('metal fighters are pulled from further (x1.4): Knife 320 px away is drawn in and hit, a Pen at the same distance is not', () => {
    const k = arena('Magnet', `fireSpecial(A, {}); ${run(30)} return { hit: D.pct - 30 };`, 720, 'Knife');
    const p = arena('Magnet', `fireSpecial(A, {}); ${run(30)} return { hit: D.pct - 30 };`, 720, 'Pen');
    expect(k.hit).toBe(9);
    expect(p.hit).toBe(0);
    const set = W.eval(`['Knife','Silver Spoon','Nickel','Nickel (II)','Coiny','Needle','Saw','Bonesaw','Bell','Trophy','Bot','Roboty','Naily'].every(function(n){ return METAL_FIGHTERS.has(n); }) && !METAL_FIGHTERS.has('Pin') && !METAL_FIGHTERS.has('Tea Kettle') && !METAL_FIGHTERS.has('Pen')`);
    expect(set, 'canon-metal objects only (Pin is a plastic pushpin, Tea Kettle a white teapot on the wiki)').toBe(true);
  });

  it('a hit on her ends the pull, and a hit on the foe does too', () => {
    const r = arena('Magnet', `fireSpecial(A, {}); for (var i=0;i<3;i++){ step(); D.dead=false; } applyHit(A, 4, 0, 0, D); var x0 = D.x; ${run(20)} return { pull: !!A._attract, dx: Math.abs(D.x - x0), hit: D.pct - 30 };`, 600);
    expect(r.pull).toBe(false);
    expect(r.hit).toBe(0);
  });

  it('By Popular Demand pulls a foe from well away, then stuns', () => {
    const r = arena('Magnet', `doSmash(A); var dmin = 1e9; for (var i=0;i<80;i++){ step(); dmin = Math.min(dmin, Math.abs(D.x - A.x)); if (D.pct > 30) break; } return { dx: dmin, hit: D.pct - 30, stun: D._stunFx > 0 };`, 550);
    expect(r.hit).toBeGreaterThan(8);
    expect(r.dx).toBeLessThan(100);
    expect(r.stun).toBe(true);
  });

  it('Like Poles Repel: after the short wind-up a blast shoves a foe beside her away hard for 7%; a hit on her first cancels it; a foe out of the ring is untouched; metal is caught from further', () => {
    const r = arena('Magnet', `fireSpecial(A, {down:true}); var early = D.pct - 30, hitAt = -1, vx = 0; for (var i=0;i<20;i++){ step(); D.dead=false; if (hitAt < 0 && D.pct > 30){ hitAt = i; vx = D.vx; } } return { early: early, hitAt: hitAt, vx: vx, hit: D.pct - 30, cd: A.spCd };`, 450);
    expect(r.early, 'a wind-up first').toBe(0);
    expect(r.hitAt).toBeGreaterThanOrEqual(CW - 2);
    expect(r.hit).toBe(7);
    expect(r.vx, 'away from her, hard').toBeGreaterThan(8);
    expect(r.cd).toBeGreaterThan(60);
    const cancelled = arena('Magnet', `fireSpecial(A, {down:true}); step(); applyHit(A, 5, 0, 0, D); ${run(20)} return D.pct - 30;`, 450);
    expect(cancelled).toBe(0);
    const far = arena('Magnet', `fireSpecial(A, {down:true}); ${run(20)} return D.pct - 30;`, 700);
    expect(far).toBe(0);
    const metal = arena('Magnet', `fireSpecial(A, {down:true}); ${run(20)} return D.pct - 30;`, 540, 'Knife');
    const plain = arena('Magnet', `fireSpecial(A, {down:true}); ${run(20)} return D.pct - 30;`, 540, 'Pen');
    expect(metal, 'Knife at 140 px is in the blast').toBe(7);
    expect(plain, 'Pen at 140 px is not').toBe(0);
  });

  it('Climbing Gear climbs and hauls up whoever is beside her', () => {
    const r = arena('Magnet', `var y0 = A.y; fireSpecial(A, {up:true}); ${run(6)} return { rose: y0 - A.y, hit: D.pct - 30 };`, 440);
    expect(r.rose).toBeGreaterThan(20);
    expect(r.hit).toBeGreaterThan(0);
  });
});

describe('MeTag: the cuff, the mark and the crushing wall (Enforcer, 2026-10-07)', () => {
  // "give metag and magnet new kits." The wall special, the wall-only tracking and the wall-smash's root were 0%-damage promises the owner replaced:
  // C is a cuffing dash, down marks a foe for +30%, and the wall moved to the smash and crushes. Each old test below is restated to its new promise.
  it('Cuffing Dash: about 120 px, cuffs the first foe it touches (6%, rooted about 36 frames, stunned); a foe out of reach is missed', () => {
    const r = arena('MeTag', `fireSpecial(A, {}); ${run(12)} return { hit: D.pct - 30, rooted: D.rooted, cuff: !!D._mtCuff, dashing: A._dashing, cd: A.spCd, dx: D.x - A.x };`, 520);
    expect(r.hit).toBe(6);
    expect(r.cuff).toBe(true);
    expect(r.rooted).toBeGreaterThan(20);
    expect(r.dashing, 'the dash ends on the foe').toBe(0);
    expect(r.cd, 'a decision: about 60-80 frames').toBeGreaterThan(40);
    const held = arena('MeTag', `fireSpecial(A, {}); var n = 0; for (var i=0;i<80;i++){ step(); if (D.rooted > 0) n++; } return n;`, 520);
    expect(held).toBeGreaterThanOrEqual(30); expect(held).toBeLessThanOrEqual(40);
    const far = arena('MeTag', `fireSpecial(A, {}); ${run(20)} return { hit: D.pct - 30, cuff: !!D._mtCuff };`, 760);
    expect(far).toEqual({ hit: 0, cuff: false });
  });

  it('the cuff can be mashed off a little sooner (a new press takes 4 frames, after the first 12 which always hold); a counter stance answers it', () => {
    const r = arena('MeTag', `fireSpecial(A, {}); ${run(8)} var r0 = D.rooted; D._lastInput = {attack:false}; metagCuffStep(D); var held = D.rooted;
      D._mtCuff.t0 -= 30; D._lastInput = {attack:true}; metagCuffStep(D); var after = D.rooted; D._lastInput = {attack:true}; metagCuffStep(D);   // the same press held: no more
      return { r0: r0, held: held, after: after, still: D.rooted };`, 500);
    expect(r.held).toBe(r.r0);
    expect(r.after).toBe(r.r0 - 4);
    expect(r.still, 'a held button is one press').toBe(r.after);
    const early = arena('MeTag', `fireSpecial(A, {}); ${run(8)} var r0 = D.rooted; D._lastInput = {attack:false}; metagCuffStep(D); D._lastInput = {attack:true}; metagCuffStep(D); return D.rooted - r0;`, 500);
    expect(early, 'mashing in the first beat frees nobody').toBe(0);
    const ans = arena('MeTag', `D.countering = 40; fireSpecial(A, {}); ${run(12)} return { cuff: !!D._mtCuff, rooted: D.rooted, took: A.pct - 30 };`, 520);
    expect(ans.cuff).toBe(false);
    expect(ans.took, 'the counter hits back').toBeGreaterThan(0);
  });

  it('Precision Finding locks the nearest foe for 5 seconds and every MeTag hit on them lands 30% harder; tracking another foe moves the mark', () => {
    const r = arena('MeTag', `var p0 = D.pct; doAttack(A); var plain = D.pct - p0;
      ${run(40)} D.pct = 30; D.invuln = 0; D.hitstun = 0; A.atkCd = 0; fireSpecial(A, {down:true}); var tr = A._g6track; A.atkCd = 0; var p1 = D.pct; D.x = A.x + 40; doAttack(A);
      return { idx: tr && tr.idx, D: D.idx, plain: plain, marked: D.pct - p1, hit: 0, left: tr && (tr.until - hazardT) };`, 440);
    expect(r.idx).toBe(r.D);
    expect(r.left).toBeGreaterThan(280);
    expect(r.marked / r.plain, 'the jab on the marked foe').toBeGreaterThan(1.25);
    expect(r.marked / r.plain).toBeLessThan(1.35);
    const lapse = arena('MeTag', `fireSpecial(A, {down:true}); ${run(310)} D.pct = 30; D.invuln = 0; D.hitstun = 0; D.x = A.x + 40; A.atkCd = 0; doAttack(A); return { tracked: metagTracked(A) && metagTracked(A).idx, jab: D.pct - 30 };`, 480);
    expect(lapse.tracked, 'the lock runs out').toBeFalsy();
    expect(lapse.jab).toBeLessThan(8);
    const mark = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.items=false; running=true; worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='MeTag'; }), 400, groundY()-24, 0), B = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 500, groundY()-24, 1), C = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 160, groundY()-24, 2);
      A.team=0; B.team=1; C.team=2; [A,B,C].forEach(function(f){ f.controller='still'; f.stocks=9; }); A.face=1; fighters=[A,B,C]; step(); A.spCd = 0;
      fireSpecial(A, {down:true}); var first = A._g6track.idx; A.x = 220; A.spCd = 0; fireSpecial(A, {down:true});
      return { first: first, second: A._g6track.idx, B: B.idx, C: C.idx }; })()`);
    expect(mark.first).toBe(mark.B);
    expect(mark.second, 'a new foe moves the mark').toBe(mark.C);
  });

  it('Under Arrest (the smash) hits and puts the wall up BEHIND the foe: six pieces, three turret bodies and three bumpers, one wall at a time, gone after 2.5 seconds', () => {
    const r = arena('MeTag', `doSmash(A); var hit = D.pct - 30, wall = projectiles.filter(function(p){ return p._metagWall; });
      var out = { hit: hit, n: wall.length, turrets: wall.filter(function(p){ return p.turret; }).length, behind: wall[0] && (wall[0].x - D.x), life: wall[0] && wall[0].life };
      metagWall(A, 600, groundY()); metagWall(A, 640, groundY()); out.again = projectiles.filter(function(p){ return p._metagWall; }).length; return out;`, 450);
    expect(r.hit, 'the swing lands: 10 x 1.5').toBeGreaterThan(12);
    expect(r.n).toBe(6);
    expect(r.turrets).toBe(3);
    expect(r.behind, 'on the far side of the foe, away from MeTag').toBeGreaterThan(40);
    expect(r.again, 'a new wall replaces the old, never two').toBe(6);
    const gone = arena('MeTag', `metagWall(A, 600, groundY()); ${run(160)} return projectiles.filter(function(p){ return p._metagWall && p.life > 0; }).length;`, 900);
    expect(gone).toBe(0);
  });

  it('the wall eats enemy shots and bumps a foe who walks in for nothing, but CRUSHES one launched into it (8%) and bounces them off', () => {
    const r = arena('MeTag', `
      metagWall(A, 520, groundY());
      var shot = addProj({owner:D.idx, ownerObj:D, x:700, y:A.y, vx:-10, vy:0, grav:false, dmg:9, kb:6, r:8, color:'#f00', life:60});
      ${run(25)}
      var blocked = shot.life <= 0 && A.pct === 30;
      D.x = 560; D.vx = -4; D.invuln = 0; D.hitstun = 0; D.pct = 30; ${run(6)}
      var bumped = D.x > 520, walkDmg = D.pct - 30;
      D.x = 470; D.vx = 11; D.vy = -2; D.hitstun = 12; D.invuln = 15; D.pct = 30; D._mtCrushT = null; var vx0 = D.vx; ${run(6)}
      return { blocked: blocked, bumped: bumped, walkDmg: walkDmg, crush: D.pct - 30, bounced: D.vx < 0 || D.x < 500 };`, 700);
    expect(r.blocked, 'an enemy shot stops dead at the pane').toBe(true);
    expect(r.bumped, 'a foe walking in is pushed back').toBe(true);
    expect(r.walkDmg, 'and takes nothing for it').toBe(0);
    expect(r.crush, 'launched into it, through the grace of the hit that launched them').toBeGreaterThanOrEqual(8);
    expect(r.crush).toBeLessThan(9);
    expect(r.bounced).toBe(true);
  });

  it('Under Arrest launches (no root any more) and drives the foe into its own wall for the crush; Barrier Step rises and hits nobody', () => {
    const r = arena('MeTag', `doSmash(A); ${run(30)} return { rooted: D.rooted, hit: D.pct - 30 };`, 470);
    expect(r.hit, 'the swing and the crush').toBeGreaterThan(20);
    expect(r.rooted).toBe(0);
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
    expect(r.gold, 'a 7.5% jab lands 10.5% in gold (ii-buffs: his jab 5 -> 7.5; gold is still x1.4)').toBeCloseTo(10.5, 0);
    expect(r.left).toBeGreaterThan(250);
    expect(r.cd, '8 s after it ends').toBeGreaterThan(600);
    const plain = arena('Silver Spoon', `doAttack(A); return D.pct - 30;`, 440);
    expect(plain).toBe(7.5);   // ii-buffs: the jab row 5 -> 7.5
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
