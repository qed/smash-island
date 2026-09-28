import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';

// Batch 3, group 2 (2026-09-27): "add the last set of dlc fighters." -> "New II fighters". Bonesaw, Spikey, Candle and
// Cammy from II4, each kit from the II wiki (abilities, transcripts, quotes) and the owner's answers: the Q2 props are
// small drawings, Spikey's spike is cut from his own art (Q3), Bonesaw's kit "as proposed" (Q12) -- "also remember to
// keep the attack lines out": no move puts a word on screen. Nothing from the OSC (OJ, Suitcase, Cabby).

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const NAMES = ['Bonesaw', 'Spikey', 'Candle', 'Cammy'];
const KITS = { Bonesaw: 'coresaw', Spikey: 'spikeburst', Candle: 'innerflame', Cammy: 'shutter' };

// A attacks D (Pen, facing her) from 400; E (Coiny) stands far off unless a test moves it.
const arena = (name, body, foeX = 460) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.itemRate=0; running=true; window.__lastBanner=null;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ${foeX}, groundY()-24, 1);
  var E = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 1000, groundY()-24, 2);
  [A,D,E].forEach(function(f,i){ f.team=i; f.controller='still'; f.stocks=9; }); A.face=1; D.face=-1;
  fighters=[A,D,E]; step(); [A,D,E].forEach(function(f){ f.invuln=0; f.hitstun=0; f.spCd=0; f.atkCd=0; f.smCd=0; f.pct=30; f.armor=0; });
  A.onground = true;
  var run = function(n, keep){ for (var i=0;i<n;i++){ step(); if (keep) keep(); } };
  ${body}
})()`);

describe('batch 3, group 2: the roster', () => {
  it('four playable II rows, unlocked on arrival (not the Vault), each with its kit and a render', () => {
    const r = W.eval(`(function(){ return ${JSON.stringify(NAMES)}.map(function(n){ var x = ROSTER.find(function(y){ return y.name===n; });
      return x && { name:n, play:x.play, dlc:x.dlc, kit:x.kit.special, desc:x.kit.desc, open:isUnlocked(x), src:SPRITES[n] && SPRITES[n].src }; }); })()`);
    for (const row of r) {
      expect(row.play && row.dlc).toBe('Inanimate Insanity');
      expect(row.open, `${row.name} arrives unlocked`).toBe(true);
      expect(row.kit).toBe(KITS[row.name]);
      expect(row.desc).toMatch(/^[^→]+ → ./);
      expect(existsSync(`artifacts/V1/${row.src}`), `${row.name}'s render`).toBe(true);
    }
  });

  it('every render, pose and prop file exists, is a PNG at most 200px tall, and is genuinely transparent', () => {
    const files = ['bonesaw', 'spikey', 'spikey-spikeless', 'candle', 'candle-inner-flame', 'candle-flame-out', 'cammy', 'cammy-flash', 'attacks/spike'];
    for (const f of files) {
      const p = `artifacts/V1/assets/sprites/${f}.png`;
      expect(existsSync(p), p).toBe(true);
      const png = PNG.sync.read(readFileSync(p));
      expect(png.height, p).toBeLessThanOrEqual(200);
      if (f.startsWith('attacks/')) expect(Math.max(png.width, png.height), p).toBeLessThanOrEqual(128);
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 10) clear++;
      expect(clear / (png.width * png.height), `${p} is transparent`).toBeGreaterThan(0.2);
    }
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    for (const f of files) expect(credits, `${f}.png is credited`).toContain(`${f.split('/').pop()}.png`);
  });

  it('none of this group\'s rows names anyone from the OSC', () => {
    // The @b3 slot markers were removed at integration, so this reads the whole file: the only OSC names in it are in
    // the one comment that says they are left out.
    const HTML_LINES = readFileSync('artifacts/V1/index.html', 'utf8').split(/\r?\n/);
    const oscLines = HTML_LINES.filter((l) => /\b(OJ|Suitcase|Cabby|Orange Juice|The Floor)\b/.test(l) && !/No one from the OSC/.test(l));
    expect(oscLines).toEqual([]);
  });
});

describe('batch 3, group 2: every input does what its card says, and says nothing on screen', () => {
  const MOVES = { jab: 'A.atkCd=0; doAttack(A)', ranged: 'A.atkCd=0; doGroundMove(A)', utilt: 'A.atkCd=0; doUpTilt(A)', special: 'fireSpecial(A, {})',
    up: 'fireSpecial(A, {up:true})', down: 'fireSpecial(A, {down:true})', finisher: 'doAttackSpecial(A)', smash: 'fireSmash(A, {})' };
  for (const name of NAMES) {
    it(`${name}: all seven lines are true, the smash lands, and no banner is raised`, () => {
      const text = W.eval(`MOVE_TEXT[${JSON.stringify(name)}]`);
      for (const [move, call] of Object.entries(MOVES)) {
        const got = [40, 110, 220].map((d) => arena(name, `
          try { ${call}; } catch(e){ return { err: String(e && e.message || e) }; }
          var first = D.pct > 30.05 ? D.pct - 30 : 0, last = D.pct, any = D.pct - 30;
          for (var i=0;i<70;i++){ step(); D.x = Math.max(D.x, 60); D.dead = false; if (!first && D.pct > last + 0.3) first = D.pct - last; last = D.pct; any = Math.max(any, D.pct - 30); }
          return { first: first, any: any, banner: window.__lastBanner };`, 400 + d));
        for (const g of got) { expect(g.err, `${name} ${move}`).toBeUndefined(); expect(g.banner, `${name} ${move} put words on screen`).toBeNull(); }
        if (move === 'smash') { expect(got.some((g) => g.first > 0), `${name}'s smash lands`).toBe(true); continue; }
        const line = text[move];
        expect(line, `${name} ${move}`).toMatch(/^[^—]+ — ./);
        if (/no hit:/i.test(line)) { expect(Math.max(...got.map((g) => g.any)), `${name} ${move}: ${line}`).toBeLessThanOrEqual(0.3); continue; }
        const nums = [...line.match(/On hit: (.*)$/)[1].matchAll(/(\d+(?:\.\d+)?)%/g)].map((x) => +x[1]);
        const landed = got.filter((g) => g.first > 0).map((g) => g.first);
        expect(landed.length, `${name} ${move} lands at some range: ${line}`).toBeGreaterThan(0);
        expect(landed.some((d) => nums.some((n) => Math.abs(d - n) <= Math.max(1.05, n * 0.12))), `${name} ${move}: says ${nums}, lands ${landed}`).toBe(true);
      }
    });
  }
});

describe('Bonesaw', () => {
  it('Cuts Right to the Core: three strokes, 3 + 3 + 6, each stripping armour, a counter and a reflect; he stays planted', () => {
    const r = arena('Bonesaw', `
      D.armor = 40; D.countering = 30; D.reflecting = 30; var x0 = A.x;
      doSpecial(A); var rooted = A.rooted;
      var hits = [], last = D.pct; run(30, function(){ D.armor = D.armor ? 40 : 0; if (D.pct > last + 0.3) hits.push(+(D.pct - last).toFixed(1)); last = D.pct; });
      return { hits: hits, armor: D.armor, countering: D.countering, reflecting: D.reflecting, rooted: rooted, moved: Math.abs(A.x - x0) };`, 450);
    expect(r.hits).toEqual([3, 3, 6]);
    expect([r.armor, r.countering, r.reflecting]).toEqual([0, 0, 0]);
    expect(r.rooted).toBeGreaterThanOrEqual(30);
    expect(r.moved).toBeLessThan(2);
  });

  it('Truly Groundbreaking plants him and knocks down everyone round him; No Prob- climbs, slips and lands teeth-first', () => {
    const r = arena('Bonesaw', `
      fireSmash(A, {}); var rooted = A.rooted, pat = A._sm && A._sm.pat; run(40);
      var smash = D.pct - 30, down = D._stunFx > 0 || D.vy !== 0;
      run(30); A.x = 400; A.y = groundY()-24; A.vx = 0; A.vy = 0; A.rooted = 0; A.hitstun = 0; A._sm = null; D.x = 430; D.y = groundY()-24; D.vx = 0; D.vy = 0; D.pct = 30; D.invuln = 0; D.hitstun = 0; A.spCd = 0; A.onground = true;
      var shape = UPSPEC.coresaw.shape; fireSpecial(A, {up:true}); var rose = false; run(80, function(){ if (A.y < groundY() - 60) rose = true; });
      return { rooted: rooted, pat: pat, smash: smash, down: down, shape: shape, rose: rose, plunge: D.pct - 30 };`, 440);
    expect(r.pat).toBe('plant');
    expect(r.rooted).toBeGreaterThanOrEqual(20);
    expect(r.smash).toBeGreaterThan(10);
    expect(r.shape).toBe('plunge');
    expect(r.rose).toBe(true);
    expect(r.plunge).toBeGreaterThanOrEqual(10);
  });

  it('Heartless Monster? makes a foe who is looking at him flinch and back off -- no damage -- and ignores one facing away', () => {
    const r = arena('Bonesaw', `
      D.face = -1; E.x = 470; E.face = 1; E.y = groundY()-24;
      doDownSpecial(A); var dStun = D.hitstun, eStun = E.hitstun; run(10);
      return { d: dStun, e: eStun, dmg: D.pct - 30, back: D.x > 460 };`, 460);
    expect(r.d).toBeGreaterThanOrEqual(20);
    expect(r.e).toBe(0);
    expect(r.dmg).toBe(0);
    expect(r.back).toBe(true);
  });
});

describe('Spikey', () => {
  it("Can't Hold It In: a tap shoots six spikes all ways; held full, eight that hit harder; then he is bald and it is locked", () => {
    const r = arena('Spikey', `
      A._sp = false; doSpecial(A); run(6); var tap = projectiles.filter(function(p){ return p.owner===A.idx; });
      var tapN = tap.length, dirs = tap.map(function(p){ return Math.round(Math.atan2(p.vy, p.vx)*180/Math.PI); }), tapDmg = tap.length ? tap[0].dmg : 0;
      var bald = A._baldUntil > hazardT, cd = A.spCd;
      projectiles = []; A.spCd = 0; fireSpecial(A, {}); run(6); var whileBald = projectiles.filter(function(p){ return p.owner===A.idx; }).length;
      projectiles = []; A._baldUntil = 0; A.spCd = 0; A._sp = true; doSpecial(A); run(60, function(){ A._sp = true; });
      var full = projectiles.filter(function(p){ return p.owner===A.idx; });
      return { tapN: tapN, dirs: dirs, tapDmg: tapDmg, bald: bald, cd: cd, whileBald: whileBald, fullN: full.length, fullDmg: full.length ? full[0].dmg : 0,
               art: ATTACK_SPRITES.spikeburst.src, glyph: !!PROJ_SHAPE.spikeburst, pose: FIGHTER_ANIM.Spikey.pose.src };`, 900);
    expect(r.tapN).toBe(6);
    expect(new Set(r.dirs.map((d) => (d + 360) % 360)).size).toBe(6);
    expect(r.tapDmg).toBe(4);
    expect(r.bald).toBe(true);
    expect(r.cd).toBeGreaterThanOrEqual(140);
    expect(r.whileBald).toBe(0);
    expect(r.fullN).toBe(8);
    expect(r.fullDmg).toBe(6);
    expect(r.art).toBe('assets/sprites/attacks/spike.png');
    expect(r.glyph).toBe(true);
    expect(r.pose).toBe('assets/sprites/spikey-spikeless.png');
  });

  it('BE THE WHEEL! rolls him through the line; Hover rises and bumps; Spike Grab carries a foe along and flings them', () => {
    const r = arena('Spikey', `
      var x0 = A.x; fireSmash(A, {}); run(20); var rolled = A.x - x0, wheel = D.pct - 30;
      A.x = 400; A.y = groundY()-24; A.vx = 0; D.x = 440; D.y = groundY()-24; D.pct = 30; D.invuln = 0; D.hitstun = 0; A.spCd = 0; A.onground = true; A.hitstun = 0; A._sm = null;
      run(30); A.x = 400; D.x = 440; D.pct = 30; D.invuln = 0; A.spCd = 0; A.vx = 0; A.hitstun = 0;
      doDownSpecial(A); var dx0 = D.x, carried = 0, flung = 0, last = D.pct;
      run(50, function(){ if (D.pct === 30) carried = Math.max(carried, D.x - dx0); if (D.pct > last + 0.3 && !flung) flung = D.pct - last; last = D.pct; });
      return { rolled: rolled, wheel: wheel, carried: carried, flung: flung, spin: UPSPEC.spikeburst.shape, pat: SMASH_SPEC.spikeburst.pat };`, 480);
    expect(r.pat).toBe('through');
    expect(r.rolled).toBeGreaterThan(80);
    expect(r.wheel).toBeGreaterThan(10);
    expect(r.spin).toBe('spin');
    expect(r.carried).toBeGreaterThan(40);
    expect(r.flung).toBe(8);
  });

  it('Spike Grab with nobody in reach costs him endlag', () => {
    const r = arena('Spikey', `doDownSpecial(A); return { stun: A.hitstun, dmg: D.pct - 30 };`, 700);
    expect(r.stun).toBeGreaterThanOrEqual(18);
    expect(r.dmg).toBe(0);
  });
});

describe('Candle', () => {
  it('Inner-Flame lifts the nearest foe ahead, holds them, and flings them the way she faces (9%)', () => {
    const r = arena('Candle', `
      doSpecial(A); var lifted = false; var weakDuring = A.weakened > 0, gripPose = A._windup && A._windup.b3;
      run(8, function(){ if (D.y < groundY() - 40) lifted = true; });
      var dmgHeld = D.pct - 30; run(40);
      return { lifted: lifted, dmgHeld: dmgHeld, dmg: D.pct - 30, flungRight: D.x > 480, weakAfter: A.weakened, weakDuring: weakDuring, grip: gripPose };`, 540);
    expect(r.lifted).toBe(true);
    expect(r.dmgHeld).toBe(0);
    expect(r.dmg).toBe(9);
    expect(r.flungRight).toBe(true);
    expect(r.weakDuring).toBe(true);
    expect(r.weakAfter).toBe(0);
    expect(r.grip).toBe('grip');
  });

  it('two foes close together are slammed into each other instead: 6% each', () => {
    const r = arena('Candle', `
      E.x = 560; E.y = groundY()-24; doSpecial(A); run(8, function(){ E.x = D.x + 30; E.y = D.y; }); run(40);
      return { d: D.pct - 30, e: E.pct - 30 };`, 520);
    expect(r.d).toBe(6);
    expect(r.e).toBe(6);
  });

  it('hit mid-hold, the grip breaks and her flame goes out: no fling, and she is weakened', () => {
    const r = arena('Candle', `
      doSpecial(A); run(6); applyHit(A, 8, 0, 0, E); run(40);
      return { dmg: D.pct - 30, weak: A.weakened, out: A._flameOutUntil > hazardT, poses: [FIGHTER_ANIM.Candle.flame.src, FIGHTER_ANIM.Candle.weak.src] };`, 520);
    expect(r.dmg).toBe(0);
    expect(r.weak).toBeGreaterThan(60);
    expect(r.out).toBe(true);
    expect(r.poses).toEqual(['assets/sprites/candle-inner-flame.png', 'assets/sprites/candle-flame-out.png']);
  });

  it('There Is No Magic reels foes in; Levitate lifts her with a jump to spare; Crystal Chime trips the grounded, not the airborne', () => {
    const r = arena('Candle', `
      fireSmash(A, {}); var pat = A._sm && A._sm.pat; var d0 = Math.abs(D.x - A.x), nearest = d0; run(30, function(){ nearest = Math.min(nearest, Math.abs(D.x - A.x)); });
      var reel = { pat: pat, pulled: nearest < d0 - 20, dmg: D.pct - 30 };
      A.x = 400; A.y = groundY()-24; A.vy = 0; A.onground = true; A.spCd = 0; A.jumps = 0; A.hitstun = 0; A._sm = null;
      fireSpecial(A, {up:true}); var vy = A.vy, jumps = A.jumps;
      run(60); A.x = 400; A.y = groundY()-24; A.vy = 0; A.onground = true; A.spCd = 0; A.hitstun = 0;
      D.x = 470; D.y = groundY()-24; D.vy = 0; D.onground = true; D.hitstun = 0; D._stunFx = 0; D.pct = 30;
      E.x = 350; E.y = groundY()-160; E.vy = 0; E.onground = false; E.hitstun = 0; E._stunFx = 0;
      fireSpecial(A, {down:true});
      return { reel: reel, vy: vy, jumps: jumps, dTrip: D._stunFx, eTrip: E._stunFx, chimeDmg: D.pct - 30, prop: typeof PROJ_SHAPE.crystalchime.draw };`, 560);
    expect(r.reel.pat).toBe('reel');
    expect(r.reel.pulled).toBe(true);
    expect(r.reel.dmg).toBeGreaterThan(10);
    expect(r.vy).toBeLessThan(-10);
    expect(r.jumps).toBeGreaterThanOrEqual(1);
    expect(r.dTrip).toBeGreaterThanOrEqual(20);
    expect(r.eTrip).toBe(0);
    expect(r.chimeDmg).toBe(0);
    expect(r.prop).toBe('function');
  });
});

describe('Cammy', () => {
  it('Snapshot goes off at a point well ahead: in frame, 4%, dazzled and exposed; right beside them, nothing', () => {
    const far = arena('Cammy', `doSpecial(A); run(30); return { dmg: D.pct - 30, defined: D.defineStacks||0, stunned: D._stunFx >= 0 };`, 570);
    const near = arena('Cammy', `doSpecial(A); run(30); return { dmg: D.pct - 30 };`, 440);
    expect(far.dmg).toBe(4);
    expect(far.defined).toBeGreaterThanOrEqual(2);
    expect(near.dmg).toBe(0);
    const stun = arena('Cammy', `doSpecial(A); var s = 0; run(20, function(){ s = Math.max(s, D._stunFx||0); }); return s;`, 570);
    expect(stun).toBeGreaterThanOrEqual(10);
  });

  it('The Power of MePhone Compels You! throws them mostly upward; Compels ME! kicks, then rises unshakeable', () => {
    const r = arena('Cammy', `
      fireSmash(A, {}); var vx = D.vx, vy = D.vy; run(30); var smash = D.pct - 30;
      A.x = 400; A.y = groundY()-24; A.vy = 0; A.onground = true; A.spCd = 0; A.hitstun = 0; A.armor = 0;
      fireSpecial(A, {up:true}); return { vx: vx, vy: vy, smash: smash, armor: A.armor, rise: A.vy, pat: SMASH_SPEC.shutter.pat };`, 520);
    expect(r.pat).toBe('beam');
    expect(r.smash).toBeGreaterThan(10);
    expect(-r.vy).toBeGreaterThan(Math.abs(r.vx));
    expect(r.armor).toBeGreaterThanOrEqual(10);
    expect(r.rise).toBeLessThan(-12);
  });

  it('Do Not Disturb Mode: 5%, down, and no special or smash for three seconds; a miss costs endlag', () => {
    const r = arena('Cammy', `
      fireSpecial(A, {down:true}); var sp = D.spCd, sm = D.smCd, st = D._stunFx; run(5);
      return { dmg: D.pct - 30, sp: sp, sm: sm, st: st, usb: typeof PROJ_SHAPE.usbstick.draw };`, 440);
    expect(r.dmg).toBe(5);
    expect(r.sp).toBeGreaterThanOrEqual(170);
    expect(r.sm).toBeGreaterThanOrEqual(170);
    expect(r.st).toBeGreaterThanOrEqual(15);
    expect(r.usb).toBe('function');
    const miss = arena('Cammy', `fireSpecial(A, {down:true}); return A.hitstun;`, 700);
    expect(miss).toBeGreaterThanOrEqual(20);
  });
});

describe('batch 3, group 2: the drawn poses and props render without error', () => {
  it('every body, deform and over hook draws on a recording context, in and out of its state', () => {
    const r = W.eval(`(function(){
      var errs = [], calls = 0;
      var c = new Proxy({}, { get:function(_t,p){ if(p==='canvas') return {width:1100,height:720}; if(p==='measureText') return function(){ return {width:0}; };
        return function(){ calls++; }; }, set:function(){ return true; } });
      ${JSON.stringify(NAMES)}.forEach(function(n){
        var f = makeFighter(ROSTER.find(function(r){ return r.name===n; }), 400, groundY()-24, 0), a = FIGHTER_ANIM[n];
        [false, true].forEach(function(on){
          f._baldUntil = on ? hazardT + 99 : 0; f._chimeT = on ? hazardT + 9 : 0; f._usbT = on ? hazardT + 9 : 0; f._flameOutUntil = on ? hazardT + 99 : 0; f.weakened = on ? 99 : 0;
          f._sm = on ? { pat: n==='Bonesaw' ? 'plant' : n==='Candle' ? 'reel' : 'through', t: 9 } : null; f.smashHold = on ? 5 : 0;
          try { if(a.body) a.body(f, c); if(a.deform) a.deform(f, c, f.r); if(a.over) a.over(f, c); } catch(e){ errs.push(n + ': ' + e.message); }
        });
      });
      return { errs: errs, calls: calls };
    })()`);
    expect(r.errs).toEqual([]);
    expect(r.calls).toBeGreaterThan(0);
  });
});
