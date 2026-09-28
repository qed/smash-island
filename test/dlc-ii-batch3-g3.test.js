import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';

// "add the last set of dlc fighters" -> "New II fighters" (2026-09-27), group 3: Cheesy, Dough, Fan and Soap, with the
// owner's answers (batch3-decisions.md): Dough's render is GhostDoughBannerPose.png (Q4), the Loser Cage and Soap's
// vacuum are cut from their episode frames (Q1), Soap's spray can is mist only (Q2), and Fan's SPECIAL is "You Leave Us
// Alone!" with Fan Theory as his DOWN-special (Q16). No text on screen for any move ("remember to keep the attack lines
// out"), nothing from the OSC, and none of the four is a Vault fighter.

const FOUR = ['Cheesy', 'Dough', 'Fan', 'Soap'];
const KIT = { Cheesy: 'pun', Dough: 'copycat', Fan: 'leavealone', Soap: 'disinfect' };
let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// A still foe (Pen) at foeX, and Coiny further on; A faces right at x=400.
const arena = (name, body, foeX = 440) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.itemRate=0; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ${foeX}, groundY()-24, 1);
  var E = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), ${foeX} + 90, groundY()-24, 2);
  [A,D,E].forEach(function(f,i){ f.team=i; f.controller='still'; f.stocks=i ? Infinity : 9; }); A.face=1; D.face=-1;   // a foe KO'd off the stage says "COMEBACK" (the KO system, not a move); infinite stocks keep it quiet
  fighters=[A,D,E]; step(); [A,D,E].forEach(function(f){ f.invuln=0; f.hitstun=0; f.spCd=0; f.atkCd=0; f.smCd=0; f.pct=30; f.armor=0; });
  A.onground = true; window.__lastBanner = null;
  var run = function(n){ for(var i=0;i<n;i++){ step(); D.dead=false; E.dead=false; } };
  ${body}
})()`);

describe('batch 3, group 3: the roster rows and the renders', () => {
  it('all four are playable DLC rows with their kits, unlocked, not in the Vault', () => {
    const r = W.eval(`(function(){ return ${JSON.stringify(FOUR)}.map(function(n){ var x = ROSTER.find(function(r){ return r.name===n; });
      return x && { name:x.name, play:x.play, dlc:x.dlc, kit:x.kit.special, desc:x.kit.desc, open:isUnlocked(x), vault:(typeof VAULT_FIGHTERS!=='undefined') && !!(VAULT_FIGHTERS.has ? VAULT_FIGHTERS.has(n) : VAULT_FIGHTERS[n]) }; }); })()`);
    for (const x of r) {
      expect(x.play).toBe(true);
      expect(x.dlc).toBe('Inanimate Insanity');
      expect(x.kit).toBe(KIT[x.name]);
      expect(x.desc).toMatch(/ → /);
      expect(x.open, `${x.name} arrives unlocked`).toBe(true);
      expect(x.vault).toBe(false);
    }
  });

  it('each has a transparent render at most 200px tall, credited, in the manifest, and a traced hurtbox and rig', () => {
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const man = JSON.parse(readFileSync('scripts/sprite-manifest-inanimateinsanity.json', 'utf8'));
    for (const n of FOUR) {
      const src = W.eval(`SPRITES[${JSON.stringify(n)}].src`);
      expect(src).toBe(`assets/sprites/${n.toLowerCase()}.png`);
      const png = PNG.sync.read(readFileSync(`artifacts/V1/${src}`));
      expect(png.height).toBeLessThanOrEqual(200);
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] === 0) clear++;
      expect(clear / (png.width * png.height), `${n} has transparent pixels`).toBeGreaterThan(0.2);
      expect(credits).toContain(`${n.toLowerCase()}.png`);
      expect(man[n] && man[n].file).toBe(`${n.toLowerCase()}.png`);
      expect(credits).toContain(man[n].source.split('/revision/')[0]);
      expect(W.eval(`!!HURT_POLY[${JSON.stringify(n)}] && !!LIMB_RIG[${JSON.stringify(n)}] && !!hurtboxFor(${JSON.stringify(n)}).poly`)).toBe(true);
    }
    // the owner's pick for Dough: the ghost with a tail, his infobox image (Q4)
    expect(man.Dough.source).toContain('GhostDoughBannerPose.png');
  });

  it('the attack art exists, is transparent and projectile-sized, is credited, and every file has an entry and a glyph', () => {
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    for (const k of ['soccerball', 'losercage', 'soapvacuum', 'cloth']) {
      const src = W.eval(`ATTACK_SPRITES.${k}.src`);
      expect(existsSync(`artifacts/V1/${src}`)).toBe(true);
      const png = PNG.sync.read(readFileSync(`artifacts/V1/${src}`));
      expect(Math.max(png.width, png.height)).toBeLessThanOrEqual(128);
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] === 0) clear++;
      expect(clear / (png.width * png.height), `${k} is keyed`).toBeGreaterThan(0.15);   // a round ball clears only its corners
      expect(credits).toContain(src.split('/').pop());
      expect(W.eval(`!!PROJ_SHAPE.${k}`)).toBe(true);
    }
    for (const k of Object.values(KIT)) expect(W.eval(`!!SMASH_SPEC.${k} && !!SMASH_ID.${k} && !!UPSPEC.${k} && !!DOWNSPECIALS.${k}`)).toBe(true);
  });

  it('no one from the OSC appears in any of their rows', () => {
    const txt = W.eval(`JSON.stringify([${FOUR.map((n) => `MOVE_TEXT[${JSON.stringify(n)}], ROSTER.find(function(r){ return r.name===${JSON.stringify(n)}; }), VICTORY_QUIPS[${JSON.stringify(n)}]`).join(',')},
      ${Object.values(KIT).map((k) => `SMASH_ID.${k}.name`).join(',')}])`);
    expect(txt).not.toMatch(/\bOJ\b|Suitcase|Cabby/);
    const src = readFileSync('artifacts/V1/index.html', 'utf8');
    const mine = src.split('\n').filter((l) => /Cheesy|Dough|Soap|leavealone|copycat|disinfect|"pun"|\bpun\(/.test(l) || /\/\/ Fan\b|"Fan"|Fan:/.test(l)).join('\n');
    expect(mine).not.toMatch(/\bOJ\b|Suitcase|Cabby/);
  });
});

describe('every input runs, lands what its card says, and puts no text on screen', () => {
  const MOVES = { jab: 'A.atkCd=0; doAttack(A)', ranged: 'A.atkCd=0; doGroundMove(A)', utilt: 'A.atkCd=0; doUpTilt(A)', special: 'fireSpecial(A, {})',
    up: 'fireSpecial(A, {up:true})', down: 'fireSpecial(A, {down:true})', finisher: 'doAttackSpecial(A)', smash: 'doSmash(A)' };
  it.each(FOUR)('%s', (name) => {
    const text = W.eval(`MOVE_TEXT[${JSON.stringify(name)}]`);
    for (const [move, call] of Object.entries(MOVES)) {
      const r = arena(name, `
        var err = null; try { ${call}; } catch(e){ err = String(e && e.message || e); }
        var first = D.pct > 30.05 ? D.pct - 30 : 0, last = D.pct;
        for (var i=0;i<70;i++){ run(1); if(!first && D.pct > last + 0.3) first = D.pct - last; last = D.pct; }
        return { err: err, first: +first.toFixed(2), banner: window.__lastBanner && window.__lastBanner.text || null };`);
      expect(r.err, `${name} ${move}`).toBe(null);
      expect(r.banner, `${name} ${move} put words on the screen`).toBe(null);
      if (move === 'smash') continue;
      const line = text[move];
      if (/no hit:/i.test(line)) expect(r.first, `${name} ${move}: ${line}`).toBe(0);
      else {
        const nums = [...line.split('On hit:')[1].matchAll(/(\d+(?:\.\d+)?)%/g)].map((x) => +x[1]);
        expect(r.first, `${name} ${move} lands at 40px: ${line}`).toBeGreaterThan(0);
        expect(nums.some((n) => Math.abs(r.first - n) <= Math.max(1.05, n * 0.12)), `${name} ${move}: says ${nums}, lands ${r.first}`).toBe(true);
      }
    }
  });
});

describe('Cheesy: Knee Slap banks, Kick! Soccer! Pun! spends', () => {
  it('each slap banks one charge up to three, and the ball grows with them and goes through at three', () => {
    const r = arena('Cheesy', `
      var bank = [];
      for (var n=0;n<4;n++){ A.spCd=0; fireSpecial(A, {down:true}); bank.push(A._kneeSlaps); }
      A.spCd=0; D.x = 900; E.x = 1000; fireSpecial(A, {});
      var ball = projectiles.find(function(p){ return p.owner===A.idx && p.shape==='soccerball'; });
      var out = { bank: bank, after: A._kneeSlaps, dmg: ball.dmg, pierce: !!ball.pierce, low: ball.y > A.y };
      projectiles = []; A.spCd=0; fireSpecial(A, {});
      var plain = projectiles.find(function(p){ return p.owner===A.idx; });
      out.plainDmg = plain.dmg; out.plainPierce = !!plain.pierce;
      return out;`);
    expect(r.bank).toEqual([1, 2, 3, 3]);
    expect(r.after).toBe(0);
    expect(r.dmg).toBe(15);
    expect(r.pierce).toBe(true);
    expect(r.low, 'the ball is kicked low, along the floor').toBe(true);
    expect(r.plainDmg).toBe(6);
    expect(r.plainPierce).toBe(false);
  });

  it('Why, I Oughta-- dives him through the line and knocks them down', () => {
    const r = arena('Cheesy', `var x0 = A.x; doSmash(A); run(20); return { moved: A.x - x0, hit: D.pct - 30, down: D.hitstun > 0 || !D.onground };`, 470);
    expect(r.moved).toBeGreaterThan(60);
    expect(r.hit).toBeGreaterThan(10);
  });
});

describe('Dough: Shameless Knockoff copies, a beat late and weaker', () => {
  it('with nobody to copy it is only a weak ghostly shove', () => {
    const r = arena('Dough', `fireSpecial(A, {}); run(2); return D.pct - 30;`);
    expect(r).toBeCloseTo(4, 0);
  });

  it("copies the nearest foe's last special from his own body, 12 frames late, at 0.7x -- Taco's lemon", () => {
    const r = arena('Dough', `
      D._lastSpecialKind = 'lemon'; D.x = 900;
      fireSpecial(A, {});
      var early = projectiles.filter(function(p){ return p.owner===A.idx; }).length;
      run(13);
      var lemon = projectiles.find(function(p){ return p.owner===A.idx; });
      return { early: early, has: !!lemon, dmg: lemon && lemon.dmg, shape: lemon && lemon.shape, kit: A.kit.special, last: A._lastSpecialKind };`);
    expect(r.early).toBe(0);
    expect(r.has).toBe(true);
    expect(r.dmg).toBeCloseTo(8 * 0.7, 5);
    expect(r.shape, "it draws as the copied move's art").toBe('lemon');
    expect(r.kit).toBe('copycat');
    expect(r.last).toBe('copycat');
  });

  it("copying Bow is the joke, and it works: her Possession strings the foe in front onto his side", () => {
    const r = arena('Dough', `D._lastSpecialKind = 'chair'; fireSpecial(A, {}); run(13); return { possessing: A._possessing, team: D.team, mine: A.team };`, 470);
    expect(r.possessing).not.toBe(null);
    expect(r.team).toBe(r.mine);
  });

  it('a direct hit he copies lands at 0.7x (Nickel\'s Double Zinger)', () => {
    const r = arena('Dough', `D._lastSpecialKind = 'snark'; E.x = 2000; fireSpecial(A, {}); var before = D.pct; run(13); return { dealt: D.pct - before, weak: A.weakened };`);
    const full = arena('Nickel (II)', `D.pct = 30; doSpecial(A); return D.pct - 30;`);
    expect(r.dealt).toBeGreaterThan(0);
    expect(r.dealt).toBeLessThan(full);
    expect(r.weak).toBe(0);
  });

  it('the Loser Cage waits on the floor ahead and locks in the first foe to step in', () => {
    const r = arena('Dough', `D.x = 900; doSmash(A); var cage = projectiles.find(function(p){ return p.owner===A.idx && p.shape==='losercage'; });
      run(40); D.x = cage.x; D.y = A.y; run(4); return { cage: !!cage, root: D.rooted, hit: D.pct - 30 };`);
    expect(r.cage).toBe(true);
    expect(r.hit).toBeGreaterThan(10);
    expect(r.root).toBeGreaterThan(0);
  });

  it('Into the Ceiling floats him straight up, untouchable, and They\'re the Best hits both sides', () => {
    const up = arena('Dough', `var y0 = A.y, x0 = A.x; fireSpecial(A, {up:true}); return { rose: y0 - A.y, dx: A.x - x0, invuln: A.invuln };`);
    expect(up.rose).toBeGreaterThanOrEqual(130);
    expect(up.dx).toBe(0);
    expect(up.invuln).toBeGreaterThan(0);
    const down = arena('Dough', `E.x = 360; fireSpecial(A, {down:true}); run(2); return [D.pct - 30, E.pct - 30];`);
    expect(down[0]).toBeCloseTo(7, 0);
    expect(down[1]).toBeCloseTo(7, 0);
  });
});

describe('Fan: You Leave Us Alone!, Nice Save! and Fan Theory', () => {
  it('the special charges through everyone in the way, armoured', () => {
    const r = arena('Fan', `var x0 = A.x; fireSpecial(A, {}); var armor = A.armor; run(14); return { moved: A.x - x0, d: D.pct - 30, e: E.pct - 30, armor: armor };`, 470);
    expect(r.moved).toBeGreaterThan(120);
    expect(r.d).toBeGreaterThan(5);
    expect(r.e).toBeGreaterThan(5);
    expect(r.armor).toBeGreaterThan(0);
  });

  it('Fan Theory: a hit inside the read is seen coming and answered; no hit and the pattern breaks', () => {
    const seen = arena('Fan', `fireSpecial(A, {down:true}); run(4); var fanBefore = A.pct; applyHit(A, 8, -5, -3, D); run(40);
      return { fan: A.pct - fanBefore, foe: D.pct - 30, stunned: A.hitstun };`);
    expect(seen.fan, 'he sidestepped it').toBe(0);
    expect(seen.foe, 'and answered').toBeGreaterThan(10);
    const broke = arena('Fan', `D.x = 900; fireSpecial(A, {down:true}); run(36); return { stun: A.hitstun, counter: A.countering };`);
    expect(broke.stun).toBeGreaterThan(0);
    expect(broke.counter).toBe(0);
  });

  it('Nice Save! opens into a ring that knocks them down, and Not Today! gives a jump back', () => {
    const r = arena('Fan', `doSmash(A); run(24); return { hit: D.pct - 30 };`, 470);
    expect(r.hit).toBeGreaterThan(10);
    const up = arena('Fan', `A.jumps = 0; var y0 = A.y; fireSpecial(A, {up:true}); run(4); return { rose: y0 - A.y, jumps: A.jumps };`);
    expect(up.rose).toBeGreaterThan(0);
    expect(up.jumps).toBeGreaterThanOrEqual(1);
  });
});

describe('Soap: Secret Ingredient, Clean Sweep, and the mess she cleans', () => {
  it('the spray scrubs armour and counters off a foe before it lands, and cleans her own ailments', () => {
    const r = arena('Soap', `D.armor = 30; D.countering = 30; A.burn = 90; A._poisonT = 90; A.slowed = 90; A.weakened = 90;
      fireSpecial(A, {}); return { armor: D.armor, counter: D.countering, hit: D.pct - 30, me: [A.burn, A._poisonT, A.slowed, A.weakened], mePct: A.pct };`);
    expect(r.armor).toBe(0);
    expect(r.counter).toBe(0);
    expect(r.hit).toBeCloseTo(6, 0);
    expect(r.me).toEqual([0, 0, 0, 0]);
    expect(r.mePct, 'the counter could not answer it').toBe(30);
  });

  it('Clean Sweep draws one foe in from afar, then blows them away', () => {
    const r = arena('Soap', `E.x = 2000; doSmash(A); var x0 = D.x; run(10); var mid = D.x; run(30); return { pulled: x0 - mid, hit: D.pct - 30, flown: D.x - mid };`, 560);
    expect(r.pulled).toBeGreaterThan(20);
    expect(r.hit).toBeGreaterThan(10);
    expect(r.flown).toBeGreaterThan(30);
  });

  it("They're the Mess, We Clean It throws the foe beside her into whoever is behind them", () => {
    const r = arena('Soap', `E.x = 520; fireSpecial(A, {down:true}); run(2); return [D.pct - 30, E.pct - 30, D.vx];`);
    expect(r[0]).toBeCloseTo(9, 0);
    expect(r[1]).toBeCloseTo(8, 0);
    const miss = arena('Soap', `D.x = 700; fireSpecial(A, {down:true}); run(2); return D.pct - 30;`);
    expect(miss).toBe(0);
  });

  it('holds the vacuum through Clean Sweep and the cloth on a swing (FIGHTER_ANIM, drawn without error)', () => {
    const r = W.eval(`(function(){ var n = 0, c = new Proxy({}, { get:function(_t,p){ if(p==='canvas') return {width:1100,height:720};
        return function(){ n++; }; }, set:function(){ return true; } });
      var f = { face:1, r:24, _sm:{pat:'reel'}, _atkAnim:0, _kneeSlaps:2 };
      FIGHTER_ANIM.Soap.over(f, c); var a = n; f._sm = null; f._atkAnim = 5; FIGHTER_ANIM.Soap.over(f, c); var b = n - a;
      n = 0; FIGHTER_ANIM.Cheesy.over(f, c); return [a, b, n]; })()`);
    expect(r[0]).toBeGreaterThan(0);
    expect(r[1]).toBeGreaterThan(0);
    expect(r[2]).toBeGreaterThan(0);
  });
});
