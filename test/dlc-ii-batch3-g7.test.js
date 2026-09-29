import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';

// "add the last set of dlc fighters." -> "New II fighters" (2026-09-27). Batch 3, group 7: Tapey, Tea Kettle and Teddy Bear,
// with the owner's answers: Q13 "Record button" (Tapey's down records, her special plays it back), Q14 "hors d'oeuvres
// special, Oversteam smash" (Tea Kettle), Q1 "Cut from the frames" (Teddy's paintball), Q2 "Small drawn props" (Tapey's
// playback rings, Tea Kettle's steam), Q4 TB.png (Teddy's render). Standing rules: canon from the II wiki only, nobody from
// the OSC, no words on the screen for any move ("remember to keep the attack lines out"), and they arrive unlocked.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const NAMES = ['Tapey', 'Tea Kettle', 'Teddy Bear'];
const KITS = { Tapey: 'tape', 'Tea Kettle': 'hors', 'Teddy Bear': 'paintball' };

// A at 400 facing right, Pen (D) and Coiny (E) as foes on their own teams unless the body says otherwise.
const arena = (name, body, foeX = 460, thirdX = 550) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.itemRate=0; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ${foeX}, groundY()-24, 1);
  var E = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), ${thirdX}, groundY()-24, 2);
  [A,D,E].forEach(function(f,i){ f.team=i; f.controller='still'; f.stocks=9; }); A.face=1; D.face=-1;
  fighters=[A,D,E]; step(); [A,D,E].forEach(function(f){ f.invuln=0; f.hitstun=0; f.spCd=0; f.atkCd=0; f.smCd=0; f.pct=30; f.armor=0; });
  A.onground = true;
  ${body}
})()`);

describe('the roster rows and renders', () => {
  it('all three are playable II DLC fighters with their canon kits, open from the start (not Vault fighters)', () => {
    const r = W.eval(`(function(){ return ${JSON.stringify(NAMES)}.map(function(n){ var x = ROSTER.find(function(r){ return r.name===n; });
      return x && { name:x.name, dlc:x.dlc, play:x.play, kit:x.kit.special, desc:x.kit.desc, open:isUnlocked(x),
        vault: VAULT.fighters.some(function(v){ return v.name===n; }), src:(SPRITES[n]||{}).src }; }); })()`);
    for (const x of r) {
      expect(x, 'row').toBeTruthy();
      expect(x.dlc).toBe('Inanimate Insanity');
      expect(x.play).toBe(true);
      expect(x.kit).toBe(KITS[x.name]);
      expect(x.desc).toMatch(/^[^→]+ → ./);
      expect(x.open, `${x.name} arrives unlocked`).toBe(true);
      expect(x.vault).toBe(false);
      expect(existsSync(`artifacts/V1/${x.src}`), x.src).toBe(true);
    }
  });

  it('each render is a real transparent cut-out at most 200px tall, facing measured, and credited', () => {
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    for (const [file, flip] of [['tapey.png', true], ['tea-kettle.png', false], ['teddy-bear.png', false]]) {
      const png = PNG.sync.read(readFileSync(`artifacts/V1/assets/sprites/${file}`));
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      expect(png.height).toBeLessThanOrEqual(200);
      expect(clear / (png.width * png.height), `${file} is not a cut-out`).toBeGreaterThan(0.1);
      expect(credits).toContain(file);
      const name = NAMES[['tapey.png', 'tea-kettle.png', 'teddy-bear.png'].indexOf(file)];
      expect(W.eval(`SPRITES[${JSON.stringify(name)}].flip`)).toBe(flip);
    }
    // Teddy's render is her official sticker art now: TB.png (the Q4 pick) had no source, and the owner said "change 4".
    // The official art faces right, so it is not flipped.
    expect(credits).toContain('TeddyII4StickerSheeeeeeeeet.png');
  });

  it('each has a traced hurtbox and limb rig, like every other render', () => {
    const r = W.eval(`${JSON.stringify(NAMES)}.map(function(n){ return [!!HURTBOX[n], !!HURT_POLY[n], !!LIMB_RIG[n]]; })`);
    for (const x of r) expect(x).toEqual([true, true, true]);
  });
});

// The seven inputs, measured the way test/move-text does (Pen at 40, 110 and 220).
const MOVES = { jab: 'A.atkCd=0; doAttack(A)', ranged: 'A.atkCd=0; doGroundMove(A)', utilt: 'A.atkCd=0; doUpTilt(A)', special: 'fireSpecial(A, {})',
  up: 'fireSpecial(A, {up:true})', down: 'fireSpecial(A, {down:true})', finisher: 'doAttackSpecial(A)' };
const measure = (name, call) => [40, 110, 220].map((dist) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ${400 + dist}, groundY()-24, 1);
  A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; step();
  [A,D].forEach(function(f){ f.invuln=0; f.pct=30; f.hitstun=0; f.spCd=0; f.atkCd=0; f.armor=0; });
  A.onground = true;
  try { ${call}; } catch(e){ return { err: String(e && e.message || e) }; }
  var first = D.pct > 30.05 ? D.pct - 30 : 0, last = D.pct, any = D.pct - 30;
  for (var i=0;i<70;i++){ step(); D.x = Math.max(D.x, 60); D.dead = false;
    if (!first && D.pct > last + 0.3) first = D.pct - last; last = D.pct; any = Math.max(any, D.pct - 30); }
  return { first: +first.toFixed(2), any: +any.toFixed(2) };
})()`));

describe('every input runs and lands what its card says', () => {
  it.each(NAMES)('%s: seven lines, no errors, and every stated number is what lands (or nothing lands)', (name) => {
    const text = W.eval(`MOVE_TEXT[${JSON.stringify(name)}]`);
    for (const [move, call] of Object.entries(MOVES)) {
      const line = text[move], got = measure(name, call);
      expect(line, `${name} ${move}`).toMatch(/^[^—]+ — ./);
      expect(line.length, `${name} ${move}: too long`).toBeLessThanOrEqual(210);
      for (const m of got) expect(m.err, `${name} ${move} threw`).toBeUndefined();
      if (/no hit:/i.test(line)) { expect(Math.max(...got.map((x) => x.any)), `${name} ${move} says no hit`).toBeLessThan(0.3); continue; }
      const nums = [...line.match(/On hit: (.*)$/)[1].matchAll(/(\d+(?:\.\d+)?)%/g)].map((x) => +x[1]);
      const landed = got.filter((x) => x.first > 0).map((x) => x.first);
      expect(landed.length, `${name} ${move} never lands`).toBeGreaterThan(0);
      expect(landed.some((d) => nums.some((n) => Math.abs(d - n) <= Math.max(1.05, n * 0.12))), `${name} ${move}: says ${nums}, lands ${landed}`).toBe(true);
    }
  }, 120000);
});

describe('Tapey: Record, then Playback (the owner\'s Q13)', () => {
  it('the biggest hit taken near her after Record goes out on Playback; playing empties the tape; nothing taped is a 3% push', () => {
    const r = arena('Tapey', `
      fireSpecial(A, {down:true}); var recording = !!A._rec;
      var p0 = D.pct; applyHit(D, 9, 0, 0, E); var taken = D.pct - p0;       // Coiny hits Pen beside her
      A.spCd = 0; fireSpecial(A, {}); var w1 = projectiles.find(function(p){ return p.owner===A.idx && p.shape==='tapewave'; });
      var emptied = A._rec === null;
      projectiles = []; A.spCd = 0; fireSpecial(A, {}); var w2 = projectiles.find(function(p){ return p.shape==='tapewave'; });
      return { recording: recording, taken: taken, d1: w1 && w1.dmg, emptied: emptied, d2: w2 && w2.dmg };`);
    expect(r.recording).toBe(true);
    expect(r.d1).toBe(Math.round(r.taken));
    expect(r.emptied).toBe(true);
    expect(r.d2).toBe(3);
  });

  it('the tape is capped at 14%, a taped burn burns, and her own hits never go on it', () => {
    const r = arena('Tapey', `
      fireSpecial(A, {down:true}); applyHit(D, 30, 0, 0, E); A.spCd = 0; fireSpecial(A, {});
      var cap = projectiles.find(function(p){ return p.shape==='tapewave'; }).dmg;
      projectiles = []; D.burn = 0; A.spCd = 0; fireSpecial(A, {down:true}); applyHit(D, 6, 0, 0, E); D.burn = 100; A.spCd = 0; fireSpecial(A, {});
      var burn = projectiles.find(function(p){ return p.shape==='tapewave'; }).burn;
      projectiles = []; D.burn = 0; A.spCd = 0; fireSpecial(A, {down:true}); applyHit(D, 9, 0, 0, A); A.spCd = 0; fireSpecial(A, {});
      var own = projectiles.find(function(p){ return p.shape==='tapewave'; }).dmg;
      return { cap: cap, burn: burn, own: own };`);
    expect(r.cap).toBe(14);
    expect(r.burn).toBe(true);
    expect(r.own).toBe(3);
  });

  it('Solo Track stuns everyone down its line; Leap of Faith lifts her and bowls over whoever is beside her', () => {
    const smash = arena('Tapey', `doSmash(A); return { pct: D.pct - 30, stun: D.hitstun > 0 || D._stunFx > 0 };`, 700);
    expect(smash.pct).toBeGreaterThan(10);
    expect(smash.stun).toBe(true);
    const up = arena('Tapey', `fireSpecial(A, {up:true}); var rising = A.vy < 0; return { rising: rising, pct: D.pct - 30, down: D._stunFx > 0 };`, 440);
    expect(up.rising).toBe(true);
    expect(up.pct).toBeGreaterThan(0);
    expect(up.down).toBe(true);
  });
});

describe("Tea Kettle: Hors d'Oeuvres, Blow Her Lid, Get Lost, Mama's Gotcha! (the owner's Q14)", () => {
  it('the tray gives a foe a mouthful: 6% and no special or smash for about 1.5 seconds', () => {
    const r = arena('Tea Kettle', `
      fireSpecial(A, {}); var tray = projectiles.find(function(p){ return p.shape==='horstray'; });
      for (var i=0;i<25 && D.pct<=30;i++) step();
      var n = projectiles.length, sp0 = D.spCd; fireSpecial(D, {});
      return { tray: !!tray, pct: D.pct - 30, spCd: D.spCd, smCd: D.smCd, blocked: projectiles.length === n && D.spCd === sp0 };`);
    expect(r.tray).toBe(true);
    expect(r.pct).toBeCloseTo(6, 0);
    expect(r.spCd).toBeGreaterThan(60);
    expect(r.smCd).toBeGreaterThan(60);
    expect(r.blocked).toBe(true);
  });

  it('a teammate in its path is fed 6%; a foe who turns it down makes her boil over, and the steam scalds', () => {
    const fed = arena('Tea Kettle', `E.team = 0; E.x = 500; fireSpecial(A, {}); return E.pct;`);
    expect(fed).toBe(24);
    const boil = arena('Tea Kettle', `D.invuln = 40; fireSpecial(A, {});
      return { boiling: A._boil > hazardT, tray: projectiles.some(function(p){ return p.shape==='horstray'; }), burn: E.burn > 0, pct: E.pct - 30 };`, 460, 360);
    expect(boil.boiling).toBe(true);
    expect(boil.tray).toBe(false);
    expect(boil.burn).toBe(true);
    expect(boil.pct).toBeGreaterThan(0);
  });

  it('Blow Her Lid burns everyone round her; Get Lost stomps and stuns; the hug holds and squeezes 8%', () => {
    const smash = arena('Tea Kettle', `doSmash(A); for (var i=0;i<40;i++) step(); return { pct: D.pct - 30, burn: D.burn > 0 };`);
    expect(smash.pct).toBeGreaterThan(10);
    expect(smash.burn).toBe(true);
    const up = arena('Tea Kettle', `fireSpecial(A, {up:true}); var stun = 0;
      for (var i=0;i<70;i++){ step(); stun = Math.max(stun, D._stunFx||0); } return { pct: D.pct - 30, stun: stun };`, 440);
    expect(up.pct).toBeCloseTo(12, 0);
    expect(up.stun).toBeGreaterThan(0);
    const hug = arena('Tea Kettle', `fireSpecial(A, {down:true});
      return { pct: D.pct - 30, rooted: D.rooted > 20, held: D.hitstun > 20, close: Math.abs(D.x - A.x) < 50 };`, 440);
    expect(hug).toEqual({ pct: 8, rooted: true, held: true, close: true });
    const miss = arena('Tea Kettle', `fireSpecial(A, {down:true}); return { pct: D.pct - 30, endlag: A.rooted > 0 };`, 700);
    expect(miss).toEqual({ pct: 0, endlag: true });
  });
});

describe('Teddy Bear: Paint Gun, Rage Room, Respect THIS!, Front of the Crowd', () => {
  it('a paintball is 5% and pops them up', () => {
    const r = arena('Teddy Bear', `fireSpecial(A, {}); var ball = projectiles.find(function(p){ return p.shape==='paintball'; }), vy = 0;
      for (var i=0;i<30 && D.pct<=30;i++) step(); vy = D.vy; return { ball: !!ball, pct: D.pct - 30, vy: vy };`, 600, 3000);
    expect(r.ball).toBe(true);
    expect(r.pct).toBeCloseTo(5, 0);
    expect(r.vy).toBeLessThan(0);
  });

  it('six in a string are fine; a seventh without a rest leaves her tired on her knees; a rest starts a new string', () => {
    const r = arena('Teddy Bear', `
      var shots = 0;
      for (var n=0;n<7;n++){ var before = projectiles.filter(function(p){ return p.shape==='paintball'; }).length;
        A.spCd = 0; A.hitstun = 0; fireSpecial(A, {});
        if (projectiles.filter(function(p){ return p.shape==='paintball'; }).length > before) shots++;
        if (n < 6) for (var i=0;i<10;i++) step(); }
      var tired = { hitstun: A.hitstun, knees: A._tired > hazardT };
      for (var j=0;j<100;j++) step();
      projectiles = []; A.spCd = 0; A.hitstun = 0; fireSpecial(A, {});
      return { shots: shots, tired: tired, again: projectiles.some(function(p){ return p.shape==='paintball'; }), fresh: !(A._tired > hazardT) };`, 3000, 3200);
    expect(r.shots).toBe(6);
    expect(r.tired.hitstun).toBeGreaterThan(40);
    expect(r.tired.knees).toBe(true);
    expect(r.again).toBe(true);
    expect(r.fresh).toBe(true);
  });

  it('Rage Room launches everyone round her; Respect THIS! rises and drags them up; the barge knocks over a whole line', () => {
    const smash = arena('Teddy Bear', `doSmash(A); for (var i=0;i<30;i++) step(); return D.pct - 30;`);
    expect(smash).toBeGreaterThan(15);
    const up = arena('Teddy Bear', `fireSpecial(A, {up:true}); var rising = A.vy < 0, minVy = 0;
      for (var i=0;i<30;i++){ step(); minVy = Math.min(minVy, D.vy); } return { rising: rising, pct: D.pct - 30, dragged: minVy < -2 };`, 440);
    expect(up.rising).toBe(true);
    expect(up.pct).toBeGreaterThanOrEqual(5);
    expect(up.dragged).toBe(true);
    const barge = arena('Teddy Bear', `var x0 = A.x; fireSpecial(A, {down:true}); for (var i=0;i<14;i++) step();
      return { moved: A.x - x0, d: D.pct - 30, e: E.pct - 30, proj: projectiles.length };`, 470, 520);
    expect(barge.moved).toBeGreaterThan(100);
    expect(barge.d).toBe(6);
    expect(barge.e).toBe(6);
    expect(barge.proj, 'down+C is a barge, never a projectile').toBe(0);
  });
});

describe('the standing rules', () => {
  it('no word reaches the screen through any move, the tape, the tray refused, or the tired string', () => {
    const shown = W.eval(`(function(){
      var calls = ['doAttack(A)', 'doGroundMove(A)', 'doUpTilt(A)', 'fireSpecial(A, {})', 'fireSpecial(A, {up:true})', 'fireSpecial(A, {down:true})',
        'doSmash(A, 1.0)', 'doAttackSpecial(A)',
        'fireSpecial(A, {down:true}); applyHit(D, 8, 0, 0, D); A.spCd=0; fireSpecial(A, {})',
        'D.invuln = 40; fireSpecial(A, {})',
        'for (var n=0;n<7;n++){ A.spCd=0; A.hitstun=0; fireSpecial(A, {}); }'];
      var out = [];
      ${JSON.stringify(NAMES)}.forEach(function(name){ calls.forEach(function(call){
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
        worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
        var A = makeFighter(ROSTER.find(function(r){ return r.name===name; }), 400, groundY()-24, 0);
        var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 460, groundY()-24, 1);
        A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
        fighters=[A,D]; step(); [A,D].forEach(function(f){ f.invuln=0; f.pct=30; f.hitstun=0; f.spCd=0; f.atkCd=0; f.armor=0; });
        A.you = true; window.__lastBanner = null;
        try { eval(call); } catch(e){ out.push(name+' '+call+': threw '+e.message); return; }
        for (var i=0;i<60;i++){ step(); D.dead = false; A.dead = false; }
        if (window.__lastBanner && window.__lastBanner.text) out.push(name+' '+call+': "'+window.__lastBanner.text+'"');
      }); });
      return out;
    })()`);
    expect(shown).toEqual([]);
  }, 120000);

  it('nothing in this group\'s rows names the OSC (OJ, Suitcase, Cabby) or The Floor, and none of it calls banner()', () => {
    // The @b3 slot markers were removed at integration, so this reads the whole file: the only OSC names in it are in
    // the one comment that says they are left out.
    const HTML_LINES = readFileSync('artifacts/V1/index.html', 'utf8').split(/\r?\n/);
    // Steve Cobs's prize (2026-09-29, "3, but only after you beat cobs."): OJ, Suitcase and Cabby ARE in the file now, inside
    // blocks marked as his prize (test/dlc-ii-prize.test.js owns those and holds the OSC to them). Outside those blocks, and
    // outside the two GENERATED tables their renders are traced into, the OSC is still nowhere: nothing of this group's cites them.
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
    const mine = HTML_LINES.filter((l) => /Tapey|Tea Kettle|Teddy Bear|\btape\b|\bhors\b|\bpaintball\b/.test(l)).join('\n');
    expect(mine.length).toBeGreaterThan(5000);
    expect(mine).not.toMatch(/banner\(/);
    const quips = W.eval(`${JSON.stringify(NAMES)}.map(function(n){ return JSON.stringify(ROSTER.find(function(r){ return r.name===n; })) + JSON.stringify(MOVE_TEXT[n]); }).join(' ')`);
    expect(quips).not.toMatch(/\bOJ\b|Suitcase|Cabby/);
  });

  it("the thrown things wear the show's art (tray, paintball) or a drawn prop (the playback rings), and the art is credited", () => {
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const r = W.eval(`['horstray','paintball','tapewave'].map(function(k){ return [k, ATTACK_SPRITES[k] ? ATTACK_SPRITES[k].src : null, !!PROJ_SHAPE[k]]; })`);
    expect(r).toEqual([['horstray', 'assets/sprites/attacks/horstray.png', true], ['paintball', 'assets/sprites/attacks/paintball.png', true], ['tapewave', null, true]]);
    for (const file of ['horstray.png', 'paintball.png']) {
      const png = PNG.sync.read(readFileSync(`artifacts/V1/assets/sprites/attacks/${file}`));
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      expect(Math.max(png.width, png.height)).toBeLessThanOrEqual(128);
      expect(clear / (png.width * png.height), `${file} is transparent`).toBeGreaterThan(0.12);
      expect(credits).toContain(file);
    }
  });
});
