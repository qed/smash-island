import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';
import { mulberry32 } from './helpers/prng.js';

// "oh, and bot should get their own kit." (2026-09-29, Round 10) -> Bot, who was only Test Tube's summon, is a playable fighter. The owner's
// answers (Rounds 12 and 13): unlocked "With the II DLC" like the other II fighters (not a Vault fighter); pronouns they/them; the kit
// THERE'S MORE! (one press, two kicks, 4% + 4%), SPAGGERS! (a clump flicked ahead, 3%, a short tangle), CHEER FACTORY! (a confetti pulse:
// allies within about 260 px heal a little and run faster for 2 s; alone, Bot runs faster and their next hit lands 30% harder; bigger for
// Goo, Balloon, Nickel (II) and Test Tube), BRIDGE THE GAP! (legs stretched up like stilts, about 150 px, hang, then a stomp), GOTCHA! (a
// tackle that holds the nearest foe about a second; that foe cannot use specials for 2 s; Bot takes no damage while holding) and THE ONE AND
// ONLY! (a joyful leap onto the nearest foe; not copyable by Dough's Knockoff or Tapey's Playback); weight 64, Azure Mist #f0fff3,
// archetype "Hype"; the look "1, but s4 look." (File:Bot Bandaged S4.png). Asked what happens to Test Tube's summon: "New move for Test
// Tube" -> TRANQUILIZING TRACKING DART BLASTER! (a dart that gently tracks the nearest foe, 6%, and a 1.2 s knock-out).
// Standing rules: canon from the II wiki only, nobody from the OSC, no words on the screen for any move ("and remember the thing abt no
// attack titles onscreen."), no chair and no butterfly in Bot's kit, and never a line of theirs that says he or she.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// A at 400 facing right (the subject), Pen (D) and Coiny (E) as foes on their own teams unless the body says otherwise.
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

// Any line-up: `names[i]` at `xs[i]`, all on their own teams and facing each other, still, at 30%. A..D name the first four.
const custom = (names, xs, body) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=${names.length}; SETTINGS.itemRate=0; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var names=${JSON.stringify(names)}, xs=${JSON.stringify(xs)};
  fighters = names.map(function(n,i){ var f = makeFighter(ROSTER.find(function(r){ return r.name===n; }), xs[i], groundY()-24, i); f.team=i; f.controller='still'; f.stocks=9; f.face = i===0 ? 1 : -1; return f; });
  step(); fighters.forEach(function(f){ f.invuln=0; f.hitstun=0; f.spCd=0; f.atkCd=0; f.smCd=0; f.pct=30; f.armor=0; f.onground=true; });
  var A=fighters[0], B=fighters[1], C=fighters[2], D=fighters[3];
  ${body}
})()`);

// Boss Rush against the Announcer with the gauntlet logic off: A (`who`) at 300, the boss `dx` ahead of them, parked (no attacks), hp read back.
const bossRun = (who, dx, cast) => W.eval(`(function(){
  var prevMode = SETTINGS.mode, prevStocks = SETTINGS.stocks;
  SETTINGS.mode='boss'; SETTINGS.stocks=9; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  BOSSRUSH.active=true; BOSSRUSH.cleared=0; BOSSRUSH.bossIdx=0; BOSSRUSH.loop=0; BOSSRUSH.dmgMult=1;
  var A = makeFighter(ROSTER.find(function(x){ return x.name===${JSON.stringify(who)}; }), 300, groundY()-24, 0);
  A.team=0; A.face=1; A.controller='still'; A.stocks=9; fighters=[A]; step();
  spawnBossRushBoss(); var B = summons.find(function(s){ return s.type==='boss'; });
  B.stationary = true; B._atkTimer = 1e9; B.x = A.x + ${dx}; B.homeX = B.x; var hp0 = B.hp;
  A.spCd=0; A.atkCd=0; A.invuln=0;
  ${cast};
  for (var i=0;i<60;i++){ A.invuln = 60; B._atkTimer = 1e9; B._tel = 0; step(); }
  var out = { lost: hp0 - B.hp, gotcha: A._gotcha || null, holdT: A._holdT|0 };
  BOSSRUSH.active=false; running=false; SETTINGS.mode=prevMode; SETTINGS.stocks=prevStocks; summons=[]; BOSS_ARENA=null;
  return out; })()`);

// What a fighter's own render pass (FIGHTER_ANIM.over) draws, on a context that only records: [[op, args], ...]
const overOps = (setup) => W.eval(`(function(){
  var rec = [], c = new Proxy({}, { get:function(t, p){ return function(){ rec.push([p, Array.prototype.slice.call(arguments)]); }; }, set:function(){ return true; } });
  SETTINGS.mode='ffa'; SETTINGS.count=2; running=true; worldPlats=[]; summons=[]; projectiles=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name==='Bot'; }), 400, groundY()-24, 0); A.team=0; A.face=1; A.controller='still'; fighters=[A];
  ${setup};
  FIGHTER_ANIM.Bot.over(A, c);
  return rec; })()`);
const count = (ops, name) => ops.filter((o) => o[0] === name).length;

describe('the roster row and the render', () => {
  it('Bot is a playable II DLC fighter: weight 64, Azure Mist, Hype, open from the start, and not a Vault fighter', () => {
    const r = W.eval(`(function(){ var x = ROSTER.find(function(r){ return r.name==='Bot'; });
      return x && { name:x.name, w:x.w, color:x.color, dlc:x.dlc, play:x.play, arch:x.arch, kit:x.kit.special, desc:x.kit.desc, open:isUnlocked(x),
        vault: VAULT.fighters.some(function(v){ return v.name==='Bot'; }), code: VAULT_CODES.has(vaultNorm('Bot')), prize: !!x.prize,
        lastNonPrize: ROSTER.filter(function(r){ return !r.prize; }).slice(-1)[0].name,
        sharedKit: ROSTER.filter(function(r){ return r.kit.special==='cheer'; }).map(function(r){ return r.name; }), src:(SPRITES.Bot||{}).src }; })()`);
    expect(r, 'a ROSTER row').toBeTruthy();
    expect([r.w, r.color, r.dlc, r.play, r.arch, r.kit]).toEqual([64, '#f0fff3', 'Inanimate Insanity', true, 'Hype', 'cheer']);
    expect(r.desc).toMatch(/^[^→]+ → ./);
    expect(r.desc).toMatch(/^Cheer Factory → /);
    expect(r.open, 'arrives unlocked with the II DLC').toBe(true);
    expect(r.vault, 'not a Vault fighter').toBe(false);
    expect(r.code, 'and their name is not a code').toBe(false);
    expect(r.prize).toBe(false);
    expect(r.lastNonPrize, 'the newest DLC fighter, after batch 3').toBe('Bot');
    expect(r.sharedKit, 'the kit key is theirs alone').toEqual(['Bot']);
    expect(existsSync(`artifacts/V1/${r.src}`), r.src).toBe(true);
  });

  it('the render is File:Bot Bandaged S4.png ("1, but s4 look."): a transparent cut-out at most 200 px tall, facing measured, and credited', () => {
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const png = PNG.sync.read(readFileSync('artifacts/V1/assets/sprites/bot.png'));
    let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
    expect(png.height).toBeLessThanOrEqual(200);
    expect(clear / (png.width * png.height), 'bot.png is not a cut-out').toBeGreaterThan(0.1);
    const ii = JSON.parse(readFileSync('scripts/sprite-manifest-inanimateinsanity.json', 'utf8'));
    expect(ii.Bot.ok).toBe(true);
    expect(ii.Bot.file).toBe('bot.png');
    expect(ii.Bot.source).toMatch(/inanimateinsanity\/images\/.*Bot_Bandaged_S4\.png/);
    expect(W.eval('SPRITES.Bot.flip'), 'faces the way the fetch measured').toBe(!!ii.Bot.flip);
    expect(credits).toContain('`bot.png`');
    expect(credits).toContain('Bot_Bandaged_S4.png');
    expect(credits).toContain('the season-4 look');
  });

  it('has a hurtbox fallback, a traced hurtbox outline as wide as the wings, and a limb rig of two legs and no arms, like every render', () => {
    const r = W.eval(`({ box: HURTBOX.Bot, poly: HURT_POLY.Bot, rig: LIMB_RIG.Bot && { arms: LIMB_RIG.Bot.arms.length, legs: LIMB_RIG.Bot.legs.length } })`);
    expect(r.box.rx).toBeGreaterThan(20);
    expect(r.poly.length, 'a traced polygon').toBeGreaterThan(20);
    const xs = r.poly.filter((_, i) => i % 2 === 0);
    expect(Math.max(...xs) - Math.min(...xs), 'about the drawn width of 72 px: the wings are their body').toBeGreaterThan(60);
    expect(r.rig, 'they kick with their legs and have no arm to swing').toEqual({ arms: 0, legs: 2 });
  });

  it('the move card shows all eight lines for Bot', () => {
    const t = W.eval(`(function(){ chosen = ROSTER.find(function(r){ return r.name==='Bot'; }); refreshSel();
      return Array.prototype.map.call(document.querySelectorAll('#moveCard .mc-row'), function(e){ return e.textContent; }); })()`);
    expect(t.length).toBe(8);
    expect(t[0]).toMatch(/^X.*There's More!.*2 hits of 4%/);
    expect(t[1]).toMatch(/^↓\+X.*Spaggers!/);
    expect(t[2]).toMatch(/^↑\+X.*Uppercut/);
    expect(t[3]).toMatch(/^C.*Cheer Factory!/);
    expect(t[4]).toMatch(/^↑\+C.*Bridge the Gap!/);
    expect(t[5]).toMatch(/^↓\+C.*Gotcha!/);
    expect(t[6]).toMatch(/^V.*Hop · The One and Only!/);
    expect(t[7]).toMatch(/^X\+C.*Finisher/);
  });
});

describe('every table has its row', () => {
  it('MOVE_TEXT, SMASH_ID, SMASH_SPEC, UPSPEC, DOWNSPECIALS, RANGE_PROFILE, JAB_ANIM, VICTORY_QUIPS, AI_CLASS, SHOW_ORDER, FIGHTER_ANIM, SPRITES and the traced tables', () => {
    const r = W.eval(`(function(){ var k = 'cheer', row = ROSTER.find(function(r){ return r.name==='Bot'; });
      return { lines: Object.keys(MOVE_TEXT.Bot).sort(), sid: SMASH_ID[k] && [SMASH_ID[k].name, SMASH_ID[k].color],
        spec: SMASH_SPEC[k] && { pat: SMASH_SPEC[k].pat, uncopyable: SMASH_SPEC[k].uncopyable, cost: Object.keys(SMASH_SPEC[k].cost) },
        specOthers: Object.keys(SMASH_SPEC).filter(function(n){ return SMASH_SPEC[n].uncopyable; }),
        up: UPSPEC[k] && UPSPEC[k].shape, down: typeof DOWNSPECIALS[k], quip: victoryQuipFor('Bot'), cls: AI_CLASS[row.arch], aiClass: aiClass({ kit:{special:k}, arch:row.arch, name:'Bot' }),
        range: RANGE_PROFILE[k], jab: JAB_ANIM[k], anim: typeof (FIGHTER_ANIM.Bot||{}).over, show: SHOW_ORDER.indexOf('Bot'), prize: SHOW_ORDER.indexOf('OJ'), sprite: !!SPRITES.Bot,
        traced: [!!HURTBOX.Bot, !!HURT_POLY.Bot, !!LIMB_RIG.Bot] }; })()`);
    expect(r.lines).toEqual(['down', 'finisher', 'jab', 'ranged', 'special', 'up', 'utilt']);
    expect(r.sid).toEqual(['The One and Only!', '#f0fff3']);
    expect(r.spec).toEqual({ pat: 'leap', uncopyable: true, cost: ['stun'] });
    expect(r.specOthers, 'no other smash claims it cannot be copied').toEqual(['cheer']);
    expect(r.up).toBe('plunge');
    expect(r.down).toBe('function');
    expect(r.quip).toMatch(/The one and only/);
    expect([r.cls, r.aiClass]).toEqual(['brawl', 'brawl']);
    expect(r.range).toMatchObject({ dmg: 4, multi: { hits: 2, every: 6 } });
    expect(r.jab).toBe('kick');
    expect(r.anim).toBe('function');
    expect(r.show, 'shown after batch 3 and before the prize three').toBeGreaterThan(0);
    expect(r.show).toBeLessThan(r.prize);
    expect(r.sprite).toBe(true);
    expect(r.traced).toEqual([true, true, true]);
  });

  it('Test Tube keeps her kit key and her smash, up-special and down-special rows: only her special changed', () => {
    const r = W.eval(`({ key: ROSTER.find(function(r){ return r.name==='Test Tube'; }).kit.special, smash: SMASH_SPEC.testtube.pat, up: UPSPEC.testtube.shape, down: typeof DOWNSPECIALS.testtube,
      sid: SMASH_ID.testtube.name, ai: ROSTER.find(function(r){ return r.name==='Test Tube'; }).arch })`);
    expect(r).toEqual({ key: 'testtube', smash: 'mine', up: 'warp', down: 'function', sid: r.sid, ai: 'Inventor' });
  });
});

// The seven inputs, measured the way test/move-text does (the foe at 40, 110 and 220).
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
  // Every one of Bot's seven lines is held to the game; of Test Tube's, the one that changed (her special): the rest are hers as they were,
  // and test/move-text.test.js still holds them (her Relocate leaves a flask that lands where nobody stands, so it may land nothing here).
  it.each(['Bot', 'Test Tube'])('%s: seven lines, no errors, and every stated number is what lands (or nothing lands)', (name) => {
    const text = W.eval(`MOVE_TEXT[${JSON.stringify(name)}]`);
    for (const [move, call] of Object.entries(MOVES)) {
      const line = text[move], got = measure(name, call);
      expect(line, `${name} ${move}`).toMatch(/^[^—]+ — ./);
      expect(line.length, `${name} ${move}: too long`).toBeLessThanOrEqual(210);
      for (const m of got) expect(m.err, `${name} ${move} threw`).toBeUndefined();
      if (/no hit:/i.test(line)) { expect(Math.max(...got.map((x) => x.any)), `${name} ${move} says no hit`).toBeLessThan(0.3); continue; }
      const nums = [...line.match(/On hit: (.*)$/)[1].matchAll(/(\d+(?:\.\d+)?)%/g)].map((x) => +x[1]);
      const landed = got.filter((x) => x.first > 0).map((x) => x.first);
      if (name === 'Bot' || move === 'special') expect(landed.length, `${name} ${move} never lands`).toBeGreaterThan(0);
      if (landed.length) expect(landed.some((d) => nums.some((n) => Math.abs(d - n) <= Math.max(1.05, n * 0.12))), `${name} ${move}: says ${nums}, lands ${landed}`).toBe(true);
    }
  }, 120000);
});

describe("THERE'S MORE!: two kicks from one press", () => {
  it('one press throws two kicks, 4% and then 4%, and they are kicks', () => {
    const r = arena('Bot', `
      A.atkCd = 0; var hits = [], last = D.pct; doAttack(A);
      var kind = A._atkKind, pending = !!A._multi;
      if (D.pct > last + 0.05){ hits.push(+(D.pct - last).toFixed(2)); last = D.pct; }
      for (var i=0;i<30;i++){ step(); D.x = 440; D.dead = false; if (D.pct > last + 0.05){ hits.push(+(D.pct - last).toFixed(2)); last = D.pct; } }
      return { hits: hits, kind: kind, pending: pending, left: A._multi };`, 440, 3000);
    expect(r.hits, '4% + 4%').toEqual([4, 4]);
    expect(r.kind).toBe('kick');
    expect(r.pending, 'the second kick is on its way after the first').toBe(true);
    expect(r.left, 'and there is nothing left after it').toBeNull();
  });

  it('a hit on Bot between the kicks ends the flurry: only the first lands', () => {
    const r = arena('Bot', `
      A.atkCd = 0; doAttack(A); var first = +(D.pct - 30).toFixed(2);
      applyHit(A, 3, 0, 0, E);
      for (var i=0;i<30;i++){ step(); D.x = 440; D.dead = false; }
      return { first: first, total: +(D.pct - 30).toFixed(2), left: A._multi };`, 440, 3000);
    expect(r).toEqual({ first: 4, total: 4, left: null });
  });
});

describe('SPAGGERS!: a clump flicked along the floor, 3%, a short tangle', () => {
  const at = (name, dx) => arena(name, `A.atkCd = 0; D.x = 400 + ${dx}; var n0 = projectiles.length, p0 = particles.length; doGroundMove(A);
    return { dmg: +(D.pct - 30).toFixed(2), vy: +D.vy.toFixed(2), rooted: D.rooted|0, stunFx: D._stunFx|0, shots: projectiles.length - n0, bits: particles.length - p0, flick: A._spagT === hazardT };`, 460, 3000);

  it('lands 3% and tangles them for about half a second (36 frames rooted, not stunned), without popping them up', () => {
    const spag = at('Bot', 60), sweep = at('Tea Kettle', 60);
    expect(spag.dmg).toBe(3);
    expect(spag.rooted, 'a short tangle').toBe(36);
    expect(spag.stunFx, 'rooted, not stunned').toBe(0);
    expect(sweep.vy, 'the ordinary sweep pops them up').toBeLessThan(-4);
    expect(spag.vy, 'the flick does not').toBeGreaterThan(sweep.vy + 3);
  });

  it('is a flick, never a shot: down+X throws nothing (the owner: "down-attacks shouldnt be projectiles")', () => {
    const r = at('Bot', 60);
    expect(r.shots).toBe(0);
    expect(r.bits, 'a streak of noodle-coloured particles, a client sees them too').toBeGreaterThan(8);
    expect(r.flick, 'and the render pass is told').toBe(true);
  });

  it('reaches farther than any other fighter\'s sweep, one way only: ahead', () => {
    expect(at('Bot', 95).dmg, 'out where a sweep does not reach').toBe(3);
    expect(at('Tea Kettle', 95).dmg).toBe(0);
    expect(at('Bot', 135).dmg, 'but it is short').toBe(0);
    expect(at('Bot', -40).dmg, 'never behind').toBe(0);
  });

  it('the render pass draws the noodle clump for 22 frames after the flick, and nothing before or after', () => {
    const quiet = overOps('A._stall = null');
    expect(count(quiet, 'bezierCurveTo')).toBe(0);
    const during = overOps('A._spagT = hazardT - 6; A._spagLen = 96');
    expect(count(during, 'bezierCurveTo'), 'three noodles').toBe(3);
    expect(count(overOps('A._spagT = hazardT - 40; A._spagLen = 96'), 'bezierCurveTo')).toBe(0);
  });
});

describe('CHEER FACTORY!: a confetti pulse for the allies, or for Bot alone', () => {
  const pulse = (ally, dist, extra = '') => custom(['Bot', ally, 'Pen'], [400, 400 + dist, 470], `
    B.team = 0; B.pct = 30; ${extra}
    var p0 = particles.length; fireSpecial(A, {});
    return { ally: { pct: B.pct, haste: B._hasteT|0 }, self: { haste: A._hasteT|0, next: A._cheer1|0 }, foe: { pct: C.pct, haste: C._hasteT|0, hitstun: C.hitstun },
             cd: A.spCd, bits: particles.length - p0, ring: A._cheerFx === hazardT, big: !!A._cheerBig };`);

  it('every ally within 260 px is healed 3% and hurried for 2 seconds; Bot gets nothing while there is someone to cheer', () => {
    const r = pulse('Coiny', 200);
    expect(r.ally).toEqual({ pct: 27, haste: 120 });
    expect(r.self, 'the cheer went to the ally').toEqual({ haste: 0, next: 0 });
    expect(r.foe, 'a foe nearby is not cheered, and not hit').toEqual({ pct: 30, haste: 0, hitstun: 0 });
    expect(r.cd, '260 frames, scaled by the special cooldown scale').toBe(208);
    expect(r.bits, 'confetti is thrown').toBeGreaterThan(20);
    expect(r.ring).toBe(true);
    expect(r.big, 'a plain ally is the plain pulse').toBe(false);
  });

  it('the pulse reaches 260 px and not a step farther: an ally just past it is left, and Bot cheers themself instead', () => {
    const near = pulse('Coiny', 258), far = pulse('Coiny', 265);
    expect(near.ally.pct).toBe(27);
    expect(far.ally, 'out of reach').toEqual({ pct: 30, haste: 0 });
    expect(far.self, 'nobody in reach: Bot cheers themself').toEqual({ haste: 120, next: 1 });
  });

  it.each(['Goo', 'Balloon', 'Nickel (II)', 'Test Tube'])('%s, the Cheer Factory\'s own friend, gets the bigger pulse: 6% and 3 seconds', (pal) => {
    const r = pulse(pal, 200);
    expect(r.ally).toEqual({ pct: 24, haste: 180 });
    expect(r.big).toBe(true);
    expect(r.self).toEqual({ haste: 0, next: 0 });
  });

  it('a dead ally is not cheered, and two allies both are', () => {
    expect(pulse('Coiny', 200, 'B.dead = true;').self, 'no one alive to cheer: Bot cheers themself').toEqual({ haste: 120, next: 1 });
    const r = custom(['Bot', 'Coiny', 'Goo', 'Pen'], [400, 500, 560, 3000], `B.team = 0; C.team = 0; fireSpecial(A, {}); return [B.pct, C.pct, B._hasteT|0, C._hasteT|0, A._hasteT|0];`);
    expect(r).toEqual([27, 24, 120, 180, 0]);
  });

  it('alone, Bot runs faster for 2 seconds and their next hit lands 30% harder -- once, whatever the hit is', () => {
    const r = arena('Bot', `
      D.x = 3000; E.x = 3100; fireSpecial(A, {}); var out = { haste: A._hasteT, next: A._cheer1 };
      D.x = 440; D.invuln = 0; A.atkCd = 0; D.pct = 30; doAttack(A); out.first = +(D.pct - 30).toFixed(2);
      var c = D.pct; for (var i=0;i<12;i++){ step(); D.x = 440; D.invuln = 0; } out.second = +(D.pct - c).toFixed(2); out.spent = A._cheer1;
      return out;`);
    expect(r.haste).toBe(120);
    expect(r.next).toBe(1);
    expect(r.first, 'the first kick: 4% x 1.3').toBe(5.2);
    expect(r.second, 'the second kick is the plain 4%').toBe(4);
    expect(r.spent, 'once').toBe(0);
    const spag = arena('Bot', `D.x = 3000; E.x = 3100; fireSpecial(A, {}); D.x = 460; D.invuln = 0; A.atkCd = 0; D.pct = 30; doGroundMove(A); return +(D.pct - 30).toFixed(2);`);
    expect(spag, 'the flick is the next hit too: 3% x 1.3').toBe(3.9);
  });

  it('a KO takes the cheer Bot gave themself with it, and the pulse itself hits nobody', () => {
    const r = arena('Bot', `D.x = 460; fireSpecial(A, {}); var held = A._cheer1; dropInFlightMoves(A); return { held: held, after: A._cheer1|0, foe: D.pct - 30, hitstun: D.hitstun };`);
    expect(r).toEqual({ held: 1, after: 0, foe: 0, hitstun: 0 });
  });

  it('the render pass draws the ring out to 260 px with confetti riding it, for 22 frames', () => {
    expect(count(overOps('A._cheerFx = null'), 'arc')).toBe(0);
    const late = overOps('A._cheerFx = hazardT - 21');
    const radii = late.filter((o) => o[0] === 'arc').map((o) => o[1][2]);
    expect(radii.length).toBeGreaterThan(0);
    expect(Math.max(...radii), 'the ring has grown to the reach of the pulse').toBeGreaterThan(230);
    expect(count(late, 'fillRect'), 'eighteen scraps of confetti').toBe(18);
    expect(count(overOps('A._cheerFx = hazardT - 40'), 'arc')).toBe(0);
  });
});

describe('BRIDGE THE GAP!: their legs stretch up like stilts, they hang, and the legs snap back as a stomp', () => {
  it('lifts them about 150 px, hangs a beat, then stomps 9% and stuns whoever is under them', () => {
    const r = arena('Bot', `
      var y0 = A.y, minY = A.y, hang = 0, phases = [], landed = -1, stunAtLanding = 0; A.onground = true; fireSpecial(A, {up:true}); D.x = A.x;
      for (var i=0;i<100;i++){ step(); D.x = A.x; D.invuln = 0; minY = Math.min(minY, A.y);
        if (A._stall){ if (A._stall.phase === 'hang') hang++; if (phases[phases.length-1] !== A._stall.phase) phases.push(A._stall.phase); }
        if (landed < 0 && A._stall == null && i > 3){ landed = i; stunAtLanding = D._stunFx|0; } }
      return { rose: +(y0 - minY).toFixed(1), hang: hang, phases: phases, landed: landed, dmg: +(D.pct - 30).toFixed(2), stun: stunAtLanding };`, 400, 3000);
    expect(r.rose, 'about 150 px').toBeGreaterThan(145);
    expect(r.rose).toBeLessThan(160);
    expect(r.phases, 'rise, hang, then the stomp').toEqual(['rise', 'hang', 'fall']);
    expect(r.hang, 'a beat at the top').toBeGreaterThanOrEqual(8);
    expect(r.dmg).toBe(9);
    expect(r.stun, 'the landing stuns').toBeGreaterThan(0);
  });

  it('the stilts are drawn from the body down to where they were planted, two legs with a foot each, while they rise, hang and fall', () => {
    const none = overOps('A._stall = null');
    expect(count(none, 'lineTo'), 'no stilts on the ground').toBe(0);
    for (const phase of ['rise', 'hang', 'fall']) {
      const ops = overOps(`A._stall = { phase: '${phase}' }; A._castX = A.x; A._castY = A.y + 150`);
      expect(count(ops, 'lineTo'), `${phase}: two legs`).toBe(2);
      expect(count(ops, 'ellipse'), `${phase}: a foot on each`).toBe(2);
      const bottoms = ops.filter((o) => o[0] === 'lineTo').map((o) => o[1][1]);
      expect(Math.min(...bottoms), `${phase}: planted where they left the floor, 150 px below`).toBeGreaterThan(150);
    }
    // ...and they are the legs of a Bot only: another fighter's plunge draws none
    const ttOps = W.eval(`(function(){ var rec = [], c = new Proxy({}, { get:function(t, p){ return function(){ rec.push(p); }; }, set:function(){ return true; } });
      var T = makeFighter(ROSTER.find(function(r){ return r.name==='Tea Kettle'; }), 400, groundY()-24, 0); T._stall = { phase:'hang' }; T._castX = T.x; T._castY = T.y + 150;
      var a = FIGHTER_ANIM['Tea Kettle']; if (a && a.over) a.over(T, c); return rec.filter(function(o){ return o === 'lineTo'; }).length; })()`);
    expect(ttOps).toBe(0);
  });
});

describe('GOTCHA!: a tackle that holds the nearest foe, and shuts their specials', () => {
  const gotcha = (body, foeX = 500, thirdX = 3000) => arena('Bot', `fireSpecial(A, {down:true}); ${body}`, foeX, thirdX);

  it('lunges at the nearest foe ahead, tackles them for 4%, and holds them about a second, rooted and stunned, in front of Bot', () => {
    const r = gotcha(`var out = { grabbedIn: -1 };
      for (var i=0;i<30;i++){ step(); if (A._gotcha && A._gotcha.phase === 'hold'){ out.grabbedIn = i; break; } }
      out.tackle = +(D.pct - 30).toFixed(2); out.rooted = D.rooted; out.stun = D.hitstun; out.stunFx = D._stunFx; out.spCd = D.spCd;
      out.close = Math.abs(D.x - A.x) < 50; out.holdT = A._holdT - hazardT; out.moved = A.x - 400;
      out.busy = { atk: A.atkCd, sm: A.smCd, sp: A.spCd, rooted: A.rooted };
      return out;`);
    expect(r.grabbedIn, 'the lunge is about 150 px, so a foe 100 px off is caught in a few frames').toBeGreaterThanOrEqual(3);
    expect(r.grabbedIn).toBeLessThanOrEqual(14);
    expect(r.tackle).toBe(4);
    expect(r.rooted).toBeGreaterThanOrEqual(55);
    expect(r.stun).toBeGreaterThanOrEqual(55);
    expect(r.stunFx, 'the dizzy icon shows').toBeGreaterThanOrEqual(55);
    expect(r.close, 'set down right in front of Bot').toBe(true);
    expect(r.holdT).toBeGreaterThanOrEqual(55);
    expect(r.moved).toBeGreaterThan(20);
    expect(r.busy.atk).toBeGreaterThanOrEqual(55);
    expect(r.busy.sm).toBeGreaterThanOrEqual(55);
    expect(r.busy.sp).toBeGreaterThanOrEqual(55);
    expect(r.busy.rooted, 'Bot is busy holding: no jab, special, smash or step').toBeGreaterThanOrEqual(55);
  });

  it('lets go after 60 frames', () => {
    const r = gotcha(`var g = -1, freed = -1;
      for (var i=0;i<140;i++){ step(); if (g < 0 && A._gotcha && A._gotcha.phase === 'hold') g = i; if (g >= 0 && freed < 0 && !A._gotcha){ freed = i; break; } }
      return { held: freed - g, foeStun: D.hitstun, holdT: A._holdT|0 };`);
    expect(r.held, 'about a second').toBeGreaterThanOrEqual(59);
    expect(r.held).toBeLessThanOrEqual(61);
    expect(r.foeStun, 'and their stun ends with the hold').toBeLessThanOrEqual(2);
    expect(r.holdT).toBe(0);
  });

  it('the held foe cannot use specials for 2 seconds from the grab -- a second in the hold and a second after -- and then can', () => {
    const r = gotcha(`var out = {}, g = -1, n0 = projectiles.length;
      for (var i=0;i<30;i++){ step(); if (A._gotcha && A._gotcha.phase === 'hold'){ g = i; break; } }
      projectiles = []; fireSpecial(D, {}); out.heldTry = projectiles.length;
      for (var j=0;j<100;j++) step();                       // 100 frames on: the hold is over, the lock is not
      D.hitstun = 0; out.free = !A._gotcha && D.hitstun === 0; projectiles = []; fireSpecial(D, {}); out.afterHoldTry = projectiles.length; out.lockLeft = D.spCd;
      for (var k=0;k<25;k++) step();                        // and past the 120
      D.invuln = 0; projectiles = []; fireSpecial(D, {}); out.lateTry = projectiles.length;
      return out;`);
    expect(r.heldTry, 'no special while held').toBe(0);
    expect(r.free).toBe(true);
    expect(r.afterHoldTry, 'still none a second after they are let go').toBe(0);
    expect(r.lockLeft).toBeGreaterThan(0);
    expect(r.lateTry, 'and their special is theirs again after 2 seconds').toBeGreaterThan(0);
  });

  it('Bot takes no damage while holding: no damage, no launch, nothing; and the same hit lands once the hold is over', () => {
    const r = gotcha(`var out = {}; for (var i=0;i<30;i++){ step(); if (A._gotcha && A._gotcha.phase === 'hold') break; }
      for (var j=0;j<10;j++) step();
      var p0 = A.pct; applyHit(A, 12, 5, -5, E); out.heldTook = +(A.pct - p0).toFixed(2); out.heldStun = A.hitstun; out.heldVx = A.vx; out.stillHolding = !!A._gotcha;
      for (var k=0;k<80;k++){ step(); A.invuln = 0; } A.invuln = 0;
      var p1 = A.pct; applyHit(A, 12, 5, -5, E); out.afterTook = +(A.pct - p1).toFixed(2);
      return out;`);
    expect(r.heldTook).toBe(0);
    expect(r.heldStun).toBe(0);
    expect(r.stillHolding, 'the hold cannot be broken by hitting the holder').toBe(true);
    expect(r.afterTook, 'and it is the ordinary hit after').toBeGreaterThan(10);
  });

  it('the nearest foe is the one caught: of two in a line, the nearer; a foe already invulnerable is run through, not held', () => {
    const line = gotcha(`for (var i=0;i<40;i++){ step(); E.invuln = 0; } return { near: +(D.pct - 30).toFixed(2), far: +(E.pct - 30).toFixed(2), held: A._gotcha ? A._gotcha.tgt === D.idx : null };`, 470, 540);
    expect(line.near).toBeGreaterThanOrEqual(4);
    expect(line.far, 'the one behind is untouched').toBe(0);
    expect(line.held).toBe(true);
    const ghost = gotcha(`D.invuln = 100; for (var i=0;i<40;i++){ step(); D.invuln = 100; } return { pct: D.pct - 30, held: !!A._gotcha, hold: A._holdT|0 };`, 470);
    expect(ghost).toEqual({ pct: 0, held: false, hold: 0 });
  });

  it('goes for the nearest foe: with no direction held the rush turns to the nearest one in reach, even one behind Bot; a held direction sends it that way instead', () => {
    // (arena's foe is at 300, 100 px behind Bot, who faces right)
    const behind = arena('Bot', `fireSpecial(A, {down:true}); var out = { face: A.face }; for (var i=0;i<30;i++){ step(); if (A._gotcha && A._gotcha.phase === 'hold') break; }
      out.held = !!(A._gotcha && A._gotcha.phase === 'hold'); out.tackle = +(D.pct - 30).toFixed(2); return out;`, 300, 3000);
    expect(behind).toEqual({ face: -1, held: true, tackle: 4 });
    const forced = arena('Bot', `fireSpecial(A, {down:true, right:true}); var face = A.face; for (var i=0;i<40;i++) step(); return { face: face, hurt: D.pct - 30 };`, 300, 3000);
    expect(forced, 'holding → sends the rush the way it is held: nothing there, nothing hurt').toEqual({ face: 1, hurt: 0 });
    const far = arena('Bot', `fireSpecial(A, {down:true}); return A.face;`, 900, 3000);
    expect(far, 'nobody in reach (260 px): Bot keeps the way they face').toBe(1);
  });

  it('no foe in reach: the lunge just ends, about 150 px on, and Bot is stuck a beat -- no hold, nobody hurt', () => {
    const r = gotcha(`var stuck = 0; for (var i=0;i<40;i++){ step(); stuck = Math.max(stuck, A.rooted); }
      return { moved: +(A.x - 400).toFixed(0), gone: !A._gotcha, hold: A._holdT|0, pct: D.pct - 30, stuck: stuck };`, 1000);
    expect(r.moved).toBeGreaterThan(120);
    expect(r.moved).toBeLessThan(175);
    expect(r).toMatchObject({ gone: true, hold: 0, pct: 0 });
    expect(r.stuck, 'a whiff leaves them stuck').toBeGreaterThan(0);
  });

  it('stops at the edge rather than run off it', () => {
    const r = gotcha(`A.x = WW - 60; A.face = 1; for (var i=0;i<30;i++) step(); return { x: A.x, gone: !A._gotcha, wall: WW };`, 3000);
    expect(r.gone).toBe(true);
    expect(r.x).toBeLessThan(r.wall - 25);
  });

  it('a foe in a counter stance answers the tackle: no hold, and Bot pays for it', () => {
    const r = gotcha(`D.countering = 60; for (var i=0;i<40;i++) step(); return { held: !!A._gotcha, bot: +(A.pct - 30).toFixed(2), rooted: D.rooted|0, hold: A._holdT|0 };`, 470);
    expect(r.held).toBe(false);
    expect(r.bot, 'the counter hits Bot back').toBeGreaterThanOrEqual(12);
    expect(r.rooted).toBe(0);
    expect(r.hold).toBe(0);
  });

  it('in Boss Rush the boss takes the 4% and is too big to hold', () => {
    const r = bossRun('Bot', 260, 'fireSpecial(A, {down:true})');
    expect(r.lost).toBe(4);
    expect(r.gotcha).toBeNull();
    expect(r.holdT).toBe(0);
  });

  it('a KO ends the hold: whoever was held is let go, and Bot is not left holding', () => {
    const r = gotcha(`for (var i=0;i<30;i++){ step(); if (A._gotcha && A._gotcha.phase === 'hold') break; }
      var was = !!A._gotcha; dropInFlightMoves(A); return { was: was, gone: A._gotcha === null, hold: A._holdT|0 };`);
    expect(r).toEqual({ was: true, gone: true, hold: 0 });
  });
});

describe('THE ONE AND ONLY!: a joyful leap onto the nearest foe, and it cannot be copied', () => {
  it('leaps at the nearest foe and comes down on them for 21%, stunned; the foe further off is untouched', () => {
    const r = arena('Bot', `doSmash(A); var out = { rising: A.vy < 0, selfStun: A.hitstun, noCopy: A._noCopyT > hazardT }; var x0 = A.x;
      for (var i=0;i<100;i++){ step(); D.invuln = 0; E.invuln = 0; if (D.pct > 30){ out.stun = D._stunFx|0; break; } }
      out.dmg = +(D.pct - 30).toFixed(2); out.dx = +(A.x - x0).toFixed(0); out.far = +(E.pct - 30).toFixed(2); out.cd = A.smCd;
      return out;`, 480, 760);
    expect(r.rising, 'a leap').toBe(true);
    expect(r.dmg, 'round(14 x 1.5)').toBe(21);
    expect(r.stun, 'seeing stars').toBeGreaterThan(0);
    expect(r.dx).toBeGreaterThan(40);
    expect(r.far).toBe(0);
    expect(r.selfStun, 'a landing costs Bot a moment').toBeGreaterThan(0);
    expect(r.noCopy).toBe(true);
  });

  it("Tapey's Playback takes nothing of it: the tape stays empty of the smash, while an ordinary hit beside her is taped", () => {
    const r = custom(['Tapey', 'Bot', 'Pen', 'Coiny'], [250, 370, 450, 3000], `
      fireSpecial(A, {down:true}); B.face = 1; doSmash(B);
      for (var i=0;i<100;i++){ step(); C.invuln = 0; if (C.pct > 30) break; }
      var hit = +(C.pct - 30).toFixed(2), s = A._rec.snap.find(function(x){ return x[0]===C.idx; }), taped = s && s[3];
      for (var k=0;k<40;k++){ step(); C.invuln = 0; }
      applyHit(C, 9, 0, 0, D); var control = A._rec.snap.find(function(x){ return x[0]===C.idx; })[3];
      A.spCd = 0; projectiles = []; fireSpecial(A, {}); var wave = projectiles.find(function(p){ return p.shape==='tapewave'; });
      return { hit: hit, taped: taped === undefined ? null : taped, control: control, wave: wave && wave.dmg };`);
    expect(r.hit, 'the smash landed beside her').toBe(21);
    expect(r.taped, 'and went on no tape').toBeNull();
    expect(r.control, 'a 9% hit from anyone else does').toBe(9);
    expect(r.wave, 'her Playback plays that 9%').toBe(9);
    const alone = custom(['Tapey', 'Bot', 'Pen'], [250, 370, 450], `
      fireSpecial(A, {down:true}); B.face = 1; doSmash(B); for (var i=0;i<100;i++){ step(); C.invuln = 0; if (C.pct > 30) break; }
      A.spCd = 0; projectiles = []; fireSpecial(A, {}); var wave = projectiles.find(function(p){ return p.shape==='tapewave'; }); return wave && wave.dmg;`);
    expect(alone, 'Playback with only the smash near her is the empty tape: a 3% push').toBe(3);
  });

  it("Dough's Knockoff copies the last special a foe used, never a smash: after Bot's smash it finds nothing to copy, and after their special it copies that", () => {
    const smash = custom(['Dough', 'Bot'], [400, 470], `
      B.face = -1; doSmash(B); var out = { botKind: B._lastSpecialKind === undefined ? 'none' : B._lastSpecialKind };
      A.face = 1; A.spCd = 0; var hp = B.pct; fireSpecial(A, {}); out.windup = !!A._windup; out.knockoff = !!A._knockoff;
      for (var i=0;i<20;i++) step(); out.shove = +(B.pct - hp).toFixed(2);
      return out;`);
    expect(smash.botKind, 'a smash writes no `_lastSpecialKind`').toBe('none');
    expect(smash.windup, 'nothing to copy: no wind-up').toBe(false);
    expect(smash.knockoff).toBe(false);
    expect(smash.shove, 'just the hollow imitation, a 4% shove').toBe(4);
    const special = custom(['Dough', 'Bot'], [400, 470], `B.face = -1; doSpecial(B); A.face = 1; A.spCd = 0; fireSpecial(A, {}); return { botKind: B._lastSpecialKind, windup: !!A._windup };`);
    expect(special, 'CHEER FACTORY! is a special, and can be copied').toEqual({ botKind: 'cheer', windup: true });
  });
});

describe("Test Tube's TRANQUILIZING TRACKING DART BLASTER! (\"New move for Test Tube\")", () => {
  it('fires one dart along the line to the nearest foe ahead: 6%, and a 1.2 second knock-out, the dizzy icon and nothing said', () => {
    const r = arena('Test Tube', `
      fireSpecial(A, {}); var pr = projectiles.find(function(p){ return p.shape === 'dart'; });
      var out = { shape: pr && pr.shape, homing: pr && pr.homing, fx: pr && pr.fxTag, fxN: pr && pr.fxN, dmg: pr && pr.dmg, shots: projectiles.length, cd: A.spCd, toward: pr && Math.sign(pr.vx) };
      for (var i=0;i<40 && D.pct <= 30;i++) step();
      out.hit = +(D.pct - 30).toFixed(2); out.ko = D._stunFx; out.hitstun = D.hitstun; out.lock = D._koLock - hazardT; out.icon = STATUS_ICONS.find(function(s){ return s.key === 'stunned'; }).on(D);
      return out;`, 460, 3000);
    expect(r).toMatchObject({ shape: 'dart', homing: 0.03, fx: 'ko', fxN: 72, dmg: 6, shots: 1, toward: 1 });
    expect(r.cd, '110 frames, scaled: longer than the knock-out, so one Test Tube cannot lock a foe down').toBe(88);
    expect(r.hit).toBe(6);
    expect(r.ko, '72 frames: 1.2 seconds').toBe(72);
    expect(r.hitstun).toBe(72);
    expect(r.icon, 'the stun icon shows: no word is needed').toBe(true);
  });

  it('they are out for 72 frames and no longer, and cannot act while they are', () => {
    const r = arena('Test Tube', `
      fireSpecial(A, {}); var hitAt = -1, out = { canAct: [] };
      for (var i=0;i<200;i++){ step(); D.invuln = 0; if (hitAt < 0 && D.pct > 30) hitAt = i; if (hitAt >= 0){ var k = i - hitAt; if (k === 10 || k === 60 || k === 71 || k === 74) out.canAct.push([k, D.hitstun > 0]); } }
      return out;`, 460, 3000);
    expect(r.canAct).toEqual([[10, true], [60, true], [71, true], [74, false]]);
  });

  it('a foe just woken is groggy: a second dart hurts but does not put them under again until a second after they are up', () => {
    const r = custom(['Test Tube', 'Pen'], [400, 470], `
      var out = {}; fireSpecial(A, {}); for (var i=0;i<12;i++){ step(); B.invuln = 0; }
      out.ko1 = B._stunFx|0; for (var j=0;j<80;j++){ step(); B.invuln = 0; }      // asleep 72 frames; now awake and groggy
      out.awake = B.hitstun === 0; B.x = 470; B.vx = 0;                             // (the knock-back slid them off: stand them back in range)
      var p1 = B.pct; A.spCd = 0; B.invuln = 0; fireSpecial(A, {});
      for (var k=0;k<12;k++){ step(); B.invuln = 0; }
      out.dmg2 = +(B.pct - p1).toFixed(2); out.ko2 = B._stunFx|0; out.hitstun2 = B.hitstun;
      for (var m=0;m<150;m++){ step(); B.invuln = 0; }                            // the grogginess wears off
      B.x = 470; B.vx = 0; var p2 = B.pct; A.spCd = 0; B.invuln = 0; fireSpecial(A, {});
      for (var n=0;n<12;n++){ step(); B.invuln = 0; }
      out.dmg3 = +(B.pct - p2).toFixed(2); out.ko3 = B._stunFx|0;
      return out;`);
    expect(r.ko1).toBeGreaterThan(50);
    expect(r.awake).toBe(true);
    expect(r.dmg2, 'the second dart still hurts').toBe(6);
    expect(r.ko2, 'but they do not go under').toBe(0);
    expect(r.hitstun2).toBeLessThanOrEqual(12);
    expect(r.dmg3).toBe(6);
    expect(r.ko3, 'and once the grogginess is gone they do').toBeGreaterThan(50);
  });

  it('it tracks gently: a foe who moves mid-flight bends its path toward them without changing its speed', () => {
    const r = custom(['Test Tube', 'Pen'], [400, 800], `
      fireSpecial(A, {}); var pr = projectiles.find(function(p){ return p.shape === 'dart'; }), minVy = 0, speeds = [];
      for (var i=0;i<24;i++){ step(); if (i === 6){ B.y -= 90; B.vy = 0; B.onground = false; } minVy = Math.min(minVy, pr.vy); speeds.push(Math.hypot(pr.vx, pr.vy)); }
      return { minVy: minVy, min: Math.min.apply(null, speeds), max: Math.max.apply(null, speeds), homing: pr.homing };`);
    expect(r.minVy, 'it turned up after them').toBeLessThan(-1);
    expect(r.max - r.min, 'the speed is the dart\'s own').toBeLessThan(0.5);
    expect(r.homing, 'a gentle turn: 0.03 radians a frame').toBe(0.03);
  });

  it('a different foe can catch it, as in the show; a teammate never does', () => {
    const other = custom(['Test Tube', 'Pen', 'Coiny'], [400, 900, 3000], `
      fireSpecial(A, {}); C.x = 560; C.y = B.y; for (var i=0;i<40;i++){ step(); B.invuln = 0; C.invuln = 0; }
      return { pen: B.pct - 30, coiny: +(C.pct - 30).toFixed(2), ko: C._stunFx|0 };`);
    expect(other.coiny, 'the one in the way').toBe(6);
    expect(other.ko).toBeGreaterThan(0);
    expect(other.pen, 'not the one it was aimed at').toBe(0);
    const mate = custom(['Test Tube', 'Pen', 'Coiny'], [400, 900, 3000], `
      C.team = 0; C.x = 540; C.y = B.y; fireSpecial(A, {}); for (var i=0;i<60;i++){ step(); B.invuln = 0; C.invuln = 0; }
      return { pen: +(B.pct - 30).toFixed(2), mate: C.pct - 30, koMate: C._stunFx|0, koPen: B._stunFx|0 };`);
    expect(mate.mate, 'a teammate is neither hurt nor put to sleep').toBe(0);
    expect(mate.koMate).toBe(0);
    expect(mate.pen, 'the dart passes through them to the foe').toBe(6);
    expect(mate.koPen).toBeGreaterThan(0);
  });

  it('with nobody ahead it flies straight; in Boss Rush it is aimed at the boss and lands 6', () => {
    const none = arena('Test Tube', `E.x = 3000; D.x = 100; fireSpecial(A, {}); var pr = projectiles.find(function(p){ return p.shape === 'dart'; }); return { vx: pr.vx, vy: pr.vy };`, 100, 3000);
    expect(none.vx, 'straight ahead of her').toBe(11);
    expect(none.vy).toBe(0);
    const boss = bossRun('Test Tube', 300, 'fireSpecial(A, {})');
    expect(boss.lost).toBe(6);
  });

  it('her Bot summon is gone: a press builds no summon, and her card and kit line say the dart', () => {
    const r = arena('Test Tube', `fireSpecial(A, {}); return { summons: summons.length, text: MOVE_TEXT['Test Tube'].special, desc: A.kit.desc };`, 460, 3000);
    expect(r.summons).toBe(0);
    expect(r.text).toMatch(/^Tranquilizing Tracking Dart Blaster — .*On hit: 6%, and they are knocked out for 1\.2 seconds\.$/);
    expect(r.desc).toMatch(/^Tranquilizing Tracking Dart Blaster → /);
  });
});

describe('Boss Rush: every hitting move of Bot\'s lands on a boss too, the number its card says', () => {
  // A boss is a summon, not a fighter (see test/bug-pass.test.js, "Boss Rush, round 2"): a move that only looks at `fighters` lands nothing
  // on him. The boss stands 100 px from Bot (GOTCHA!, which has to run at him, 260) and is parked; the hp he loses is read back.
  it.each([
    ['jab', 'A.atkCd = 0; doAttack(A)', 100, 8],                  // both kicks: 4 + 4
    ['ranged', 'A.atkCd = 0; doGroundMove(A)', 100, 3],           // the flick of spaghetti
    ['utilt', 'A.atkCd = 0; doUpTilt(A)', 100, 5],
    ['up', 'fireSpecial(A, {up:true})', 100, 9],                  // the stomp
    ['down', 'fireSpecial(A, {down:true})', 260, 4],              // the tackle: a boss is too big to hold
    ['smash', 'doSmash(A)', 200, 21],                             // the joyful leap: with no fighter to steer at it hops about 270 px forward, so he stands 200 off
    ['finisher', 'doAttackSpecial(A)', 100, 14],
  ])('%s: %s', (move, cast, dx, lost) => {
    expect(bossRun('Bot', dx, cast).lost, `Bot ${move} on the boss`).toBe(lost);
  });

  it('CHEER FACTORY! lands nothing on a boss (there is no hit), and is spent as a self-cheer with nobody to cheer', () => {
    expect(bossRun('Bot', 100, 'fireSpecial(A, {})').lost).toBe(0);
  });
});

describe('the standing rules', () => {
  // Every move Bot and Test Tube have, plus the ones that put something on the field to be watched afterwards.
  const CALLS = ['doAttack(A)', 'doGroundMove(A)', 'doUpTilt(A)', 'fireSpecial(A, {})', 'fireSpecial(A, {up:true})', 'fireSpecial(A, {down:true})',
    'doSmash(A, 1.0)', 'doAttackSpecial(A)',
    'E.team = 0; E.x = 480; fireSpecial(A, {}); A.spCd = 0; fireSpecial(A, {})',                       // a pulse for an ally, then for themself
    'fireSpecial(A, {}); doAttack(A); A.spCd = 0; fireSpecial(A, {down:true}); applyHit(A, 5, 0, 0, E)',   // cheered, kicked, then a hold that shrugs a hit off
    'fireSpecial(A, {}); A.spCd = 0; fireSpecial(A, {}); doGroundMove(A)',                               // two darts and a flick
    'D.invuln = 0; fireSpecial(A, {}); for (var q=0;q<30;q++) step(); A.spCd = 0; fireSpecial(A, {})'];   // a dart that lands, and a second into the grogginess

  it('none of it calls banner() or puts a word on the screen: no title, no popup, no status label', () => {
    const shown = W.eval(`(function(){
      window.__banners = []; if(!window.__bannerTap){ window.__bannerTap = true; var _b = banner; banner = function(t,m,k,l){ window.__banners.push({ text:String(t), kind:k||null }); return _b(t,m,k,l); }; }
      var calls = ${JSON.stringify(CALLS)}, out = [];
      ['Bot', 'Test Tube'].forEach(function(name){ calls.forEach(function(call){
        SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.items=false; running=true;
        worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
        var A = makeFighter(ROSTER.find(function(r){ return r.name===name; }), 400, groundY()-24, 0);
        var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 460, groundY()-24, 1);
        var E = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 520, groundY()-24, 2);
        [A,D,E].forEach(function(f,i){ f.team=i; f.controller='still'; f.stocks=9; }); A.face=1; D.face=-1;
        fighters=[A,D,E]; step(); [A,D,E].forEach(function(f){ f.invuln=0; f.pct=30; f.hitstun=0; f.spCd=0; f.atkCd=0; f.smCd=0; f.armor=0; });
        A.you = true; A.onground = true; window.__lastBanner = null; window.__banners.length = 0;
        try { eval(call); } catch(e){ out.push(name + ' ' + call + ': threw ' + e.message); return; }
        for (var i=0;i<70;i++){ step(); D.dead = false; A.dead = false; E.dead = false; }
        if (window.__banners.length) out.push(name + ' ' + call + ': ' + JSON.stringify(window.__banners));
        if (window.__lastBanner && window.__lastBanner.text) out.push(name + ' ' + call + ': "' + window.__lastBanner.text + '"');
      }); });
      return out;
    })()`);
    expect(shown).toEqual([]);
  }, 120000);

  it('nothing is drawn as text on the canvas either, for any of it: the only words are the fighters\' own name tags', () => {
    const rec = [];
    const dom = new JSDOM(readFileSync('artifacts/V1/index.html', 'utf8'), {
      url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
      beforeParse(window) {
        window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
          get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 }) : p === 'canvas' ? { width: 1100, height: 720 }
            : p === 'getImageData' ? () => ({ data: [] }) : (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createConicGradient' || p === 'createPattern') ? () => ({ addColorStop() {} })
            : (...args) => { rec.push({ op: p, args }); }),
          set: () => true,
        });
        window.Math.random = mulberry32(3);
        window.requestAnimationFrame = () => 0;
        window.cancelAnimationFrame = () => {};
      },
    });
    const w = dom.window;
    const words = [];
    const run = (name, call) => {
      w.eval(`(function(){
        SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.itemRate=0; SETTINGS.items=false; running=true;
        worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
        var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
        var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 460, groundY()-24, 1);
        var E = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), 520, groundY()-24, 2);
        [A,D,E].forEach(function(f,i){ f.team=i; f.controller='still'; f.stocks=9; }); A.face=1; D.face=-1; A.you=true;
        fighters=[A,D,E]; step(); [A,D,E].forEach(function(f){ f.invuln=0; f.pct=30; f.hitstun=0; f.spCd=0; f.atkCd=0; f.smCd=0; f.armor=0; });
        A.onground = true; ${call};
      })()`);
      rec.length = 0;
      for (let i = 0; i < 48; i++) {
        w.eval('step(); fighters.forEach(function(f){ f.dead = false; });');
        if (i % 6 === 0) w.eval('draw()');
      }
      for (const c of rec) if (c.op === 'fillText' || c.op === 'strokeText') words.push(String(c.args[0]));
    };
    for (const name of ['Bot', 'Test Tube']) for (const call of CALLS) run(name, call);
    const names = new Set(['Bot', 'Test Tube', 'Pen', 'Coiny']);
    expect(words.length, 'the name tags are drawn: the recorder is live').toBeGreaterThan(20);
    expect([...new Set(words)].filter((t) => !names.has(t)), 'a word on the canvas that is not a name tag').toEqual([]);
  }, 120000);

  it('the names live only on the cards and in the code: MOVE_TEXT and SMASH_ID carry them, and no match text does', () => {
    const r = W.eval(`({ bot: JSON.stringify(MOVE_TEXT.Bot) + SMASH_ID.cheer.name, tt: MOVE_TEXT['Test Tube'].special })`);
    for (const n of ["There's More!", 'Spaggers!', 'Cheer Factory!', 'Bridge the Gap!', 'Gotcha!', 'The One and Only!']) expect(r.bot, n).toContain(n);
    expect(r.tt).toContain('Tranquilizing Tracking Dart Blaster');
    expect(W.eval('/banner\\(/.test(String(fireSpecial)) || /banner\\(/.test(String(doSmash)) || /banner\\(/.test(String(doGroundMove))')).toBe(false);
  });

  it('every line of the kit in the source is free of banner(), and of he, she, him and his (Bot is they/them)', () => {
    const HTML = readFileSync('artifacts/V1/index.html', 'utf8').replace(/\r\n/g, '\n');
    const between = (a, b) => {
      const i = HTML.indexOf(a); expect(i, `marker not found: ${a}`).toBeGreaterThanOrEqual(0);
      const j = HTML.indexOf(b, i + a.length); expect(j, `end marker not found: ${b}`).toBeGreaterThan(i);
      return HTML.slice(i, j + b.length);
    };
    // Bot's own blocks: what says they/them. (Test Tube's dart block quotes the wiki about a Microphone and is she/her, so it is only scanned for banner().)
    const botBlocks = [
      between('// Bot (they/them; Inanimate Insanity II onward', 'and their next hit lands harder"}},'),
      between("// Bot (they/them): the whole kit in the owner's words", 'On hit: 14%."},\n};'),
      between("// Bot -- THERE'S MORE!", 'multi:{hits:2, every:6}},'),
      between("JAB_ANIM.cheer = 'kick';", "(Bot, Powers And Abilities)"),
      between('cheer:     {name:"The One and Only!"', 'sparkle as they land'),
      between('// Bot: THE ONE AND ONLY!', 'uncopyable:true},'),
      between('// Bot -- BRIDGE THE GAP!', "kb:[4,9], leave:'stun'},"),
      between('cheer(f){ // Bot -- GOTCHA!', "puff(f.x - f.face*8, feetY(f) - 4, '#f0fff3', 3); },"),
      between('case "cheer": { // Bot: CHEER FACTORY!', 'f._cheerFx = hazardT; f.flash=10; f.spCd=260; break; }'),
      between("// BOT'S GOTCHA! (DOWNSPECIALS.cheer): the lunge, then the hold.", '// ---- move ----'),
      between("// BOT'S GOTCHA! (DOWNSPECIALS.cheer): \"Bot takes no damage while holding.\"", "return; }"),
      between('// BOT, cheering themselves on', "'#7cf0a8' : '#fff27a', 4); }"),
      between("// BOT'S SPAGGERS!", "// ...and the tangle where it lands\n}"),
      between('// BOT (they/them). CHEER FACTORY!', 'const GOTCHA_LUNGE = 14, GOTCHA_SPEED = 11, GOTCHA_HOLD = 60, GOTCHA_LOCK = 120;'),
      // (to the end of Bot's own FIGHTER_ANIM entry -- the first close at its indent. It ran to the end of the table while Bot was the last
      // entry; Batch 7 put thirty-two after it, each rightly he or she.)
      between('// ---- Bot (they/them) -- the passes their kit needs', '\n  },\n'),
      between('// Bot (they/them): a playable fighter now', 'Bot: renderSprite("bot.png", { imgW:3.0 }),'),
      between('Bot:          "I am Bot.', 'shout as they jump and catch N/A'),
    ];
    for (const b of botBlocks) {
      expect(b, 'banner() in Bot\'s kit').not.toMatch(/banner\(/);
      expect(b.replace(/"[^"\n]*"/g, ' '), `he, she, him or his in Bot's kit: ${b.slice(0, 60)}`).not.toMatch(/\b(he|she|him|his|hers|himself|herself)\b/i);
    }
    const dart = between('case "testtube": { // Test Tube: TRANQUILIZING TRACKING DART BLASTER!', 'f.flash=8; f.spCd=110; break; }');
    expect(dart, 'banner() in the dart').not.toMatch(/banner\(/);
    // ...and the moves' own text, the quip and the kit line
    const text = W.eval(`JSON.stringify([MOVE_TEXT.Bot, ROSTER.find(function(r){ return r.name==='Bot'; }).kit.desc, SMASH_ID.cheer.name, victoryQuipFor('Bot')])`);
    expect(text).not.toMatch(/\b(he|she|him|his|hers|himself|herself)\b/i);
    expect(text, 'they/them are said').toMatch(/\btheir\b|\bthem\b/);
  });

  it('no chair and no butterfly in Bot\'s kit: they throw nothing at all, and their card has neither word', () => {
    const shots = W.eval(`(function(){ var out = [];
      ${JSON.stringify(CALLS.slice(0, 8))}.forEach(function(call){
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true; worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
        var A = makeFighter(ROSTER.find(function(r){ return r.name==='Bot'; }), 400, groundY()-24, 0);
        var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 470, groundY()-24, 1);
        A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9; fighters=[A,D]; step();
        [A,D].forEach(function(f){ f.invuln=0; f.pct=30; f.hitstun=0; f.spCd=0; f.atkCd=0; f.smCd=0; });
        A.onground = true; eval(call);
        for (var i=0;i<40;i++){ step(); if (projectiles.length) out.push(call + ': ' + projectiles.map(function(p){ return p.shape || 'plain'; }).join()); D.dead = false; }
      }); return out; })()`);
    expect(shots, 'Bot\'s moves are body moves: no shot, no chair, no butterfly').toEqual([]);
    const text = W.eval(`JSON.stringify([MOVE_TEXT.Bot, ROSTER.find(function(r){ return r.name==='Bot'; }).kit.desc, SMASH_ID.cheer.name, victoryQuipFor('Bot')])`);
    expect(text).not.toMatch(/chair|butterfl/i);
  });

  it('nothing in this group\'s rows names the OSC (OJ, Suitcase, Cabby) or The Floor outside Steve Cobs\'s prize blocks', () => {
    const HTML_LINES = readFileSync('artifacts/V1/index.html', 'utf8').split(/\r?\n/);
    let inPrize = false, inGen = false;
    const visible = HTML_LINES.filter((l) => {
      if (/Steve Cobs's prize \(OJ, Suitcase, Cabby\): begin/.test(l)) inPrize = true;
      const skip = inPrize || inGen;
      if (/Steve Cobs's prize: end/.test(l)) inPrize = false;
      if (/^\/\/ GENERATED by scripts\/trace-(hurtboxes|limbs)\.mjs/.test(l)) inGen = true;
      if (/^\/\/ END GENERATED/.test(l)) inGen = false;
      return !skip;
    });
    expect(visible.filter((l) => /\b(OJ|Suitcase|Cabby|Orange Juice|The Floor)\b/.test(l) && !/No one from the OSC/.test(l))).toEqual([]);
    // ...and the scan did read this group's rows: the lines that carry Bot's and the dart's code run to a good few thousand characters
    const mine = visible.filter((l) => /\bBot\b|_gotcha|_holdT|_cheer|CHEER_|GOTCHA_|DART_|spaggers|SPAGGERS|'dart'/.test(l)).join('\n');
    expect(mine.length).toBeGreaterThan(5000);
  });
});
