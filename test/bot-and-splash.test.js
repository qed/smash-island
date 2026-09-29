import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { bootMonolith } from './helpers/smash-golden.js';
import { mulberry32 } from './helpers/prng.js';

// TWO OF THE OWNER'S CALLS THAT CHANGE A MOVE, NOT ONLY ITS ART (2026-09-24) -- and one of them since overtaken.
//
// Test Tube: "change the ability" -> "Summon Bot" (2026-09-24) made her special build Bot, the robot she made as a replica of Bow,
// who fought beside her for four seconds. That summon is RETIRED (2026-09-29, Round 13): "oh, and bot should get their own kit." --
// Bot is a playable fighter now (test/dlc-ii-bot.test.js) -- and asked what happens to Test Tube's summon, "New move for Test Tube":
// her special is the Tranquilizing Tracking Dart Blaster (also test/dlc-ii-bot.test.js). What this file pinned about the summon --
// his body, his four seconds, his punch, the boss punch, "Bot goes when Test Tube does", the card, the no-words line -- is rewritten
// below to pin that it is gone, and that Bot's body is a fighter's now.
// Pickle: "Just a splash". His missed dive leaves no puddle any more -- nothing that slows -- only a small splash of brown droplets on
// impact.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const arena = (name, body, foeX = 560) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ${foeX}, groundY()-24, 1);
  A.team=0; D.team=1; A.face=1; D.face=-1; [A,D].forEach(function(f){ f.controller='still'; f.stocks=9; });
  fighters=[A,D]; step(); [A,D].forEach(function(f){ f.invuln=0; f.hitstun=0; f.spCd=0; f.atkCd=0; f.pct=30; });
  ${body}
})()`);
const bots = 'summons.filter(function(s){ return s.name==="Bot"; })';

describe("Test Tube's special no longer summons Bot (\"New move for Test Tube\")", () => {
  it('pressing it builds no Bot, and no summon of any kind: it throws a dart', () => {
    const r = arena('Test Tube', `
      fireSpecial(A, {});
      for (var i=0;i<200;i++){ step(); D.x = 900; D.vx = 0; D.invuln = 0; D.hitstun = 0; }
      return { summons: summons.length, bots: ${bots}.length };`);
    expect(r).toEqual({ summons: 0, bots: 0 });
    const t = arena('Test Tube', `fireSpecial(A, {}); return { darts: projectiles.filter(function(p){ return p.shape==='dart'; }).length, summons: summons.length };`);
    expect(t).toEqual({ darts: 1, summons: 0 });
  });

  it('nothing of the summon is left in the engine: no BOT_ constant, no `bot` act, no Bot in the assist roster, no drawBotSummon', () => {
    const r = W.eval(`({
      consts: [typeof BOT_ASSIST, typeof BOT_DMG, typeof BOT_KB, typeof BOT_REACH, typeof BOT_CD, typeof BOT_SPECIAL_CD, typeof drawBotSummon],
      roster: ASSIST_ROSTER.some(function(a){ return a.name==='Bot' || a.act==='bot'; }),
      updateSummons: /act\\s*===\\s*["']bot["']/.test(String(updateSummons)), isTrophy: /["']bot["']/.test(String(isTrophy)),
      drawSummon: /Bot/.test(String(drawSummon)), special: /BOT_|summonAssistNamed/.test(String(doSpecial)) })`);
    expect(r.consts, 'BOT_ASSIST, BOT_DMG, BOT_KB, BOT_REACH, BOT_CD, BOT_SPECIAL_CD and drawBotSummon').toEqual(Array(7).fill('undefined'));
    expect(r.roster).toBe(false);
    expect(r.updateSummons, 'the act "bot" branch of updateSummons').toBe(false);
    expect(r.isTrophy).toBe(false);
    expect(r.drawSummon, 'the hook that drew the summon').toBe(false);
    expect(r.special, "her special's case builds no assist").toBe(false);
  });

  it("her move card and kit line say the dart, not the summon; her smash and up-special still leave flasks", () => {
    const r = W.eval(`({ text: MOVE_TEXT['Test Tube'].special, desc: ROSTER.find(function(x){ return x.name==='Test Tube'; }).kit.desc,
      smash: SMASH_SPEC.testtube.pat, up: !!UPSPEC.testtube.shot })`);
    expect(r.text).toMatch(/^Tranquilizing Tracking Dart Blaster — /);
    expect(r.desc).toMatch(/^Tranquilizing Tracking Dart Blaster → /);
    expect(r.text + r.desc, 'no Bot, no Bow, nothing that is summoned').not.toMatch(/Bot|Bow|summon|fights beside/i);
    expect(r.smash).toBe('mine');
    expect(r.up).toBe(true);
  });
});

describe("Bot's body is a fighter's now", () => {
  it('is a fighter in the level editor\'s crowd like every other: only Pepper, Salt\'s partner, is still left out', () => {
    const r = W.eval(`(function(){
      var names = edSpriteNames(), picks = {};
      for (var i=0;i<600;i++) picks[edMakeDeco('cameo', 0.5, 0.8).n] = 1;
      var fighters = ROSTER.filter(function(x){ return SPRITES[x.name]; }).map(function(x){ return x.name; });
      return { names: names, picks: Object.keys(picks), first: names[0], missing: fighters.filter(function(n){ return names.indexOf(n) < 0; }),
               inSprites: !!SPRITES.Bot && !!SPRITES.Pepper, botIsFighter: ROSTER.some(function(x){ return x.name==='Bot' && x.play; }), botIndex: Object.keys(SPRITES).indexOf('Bot'), taco: Object.keys(SPRITES).indexOf('Taco (II)') };
    })()`);
    expect(r.inSprites, 'their renders load through the registry').toBe(true);
    expect(r.botIsFighter).toBe(true);
    expect(r.names).toContain('Bot');
    expect(r.names).not.toContain('Pepper');
    expect(r.picks).not.toContain('Pepper');
    expect(r.missing, 'every fighter is in the pool, Bot too').toEqual([]);
    expect(r.botIndex, 'their row sits with the other batch-3-and-after fighters, so no spawn marker\'s render shifted').toBeGreaterThan(r.taco);
    expect(r.names[0], 'spawn marker 0 is still the fighter it was, not Bot').not.toBe('Bot');
    expect(W.eval('ROSTER.some(function(x){ return x.name===' + JSON.stringify(r.first) + '; })'), 'spawn marker 0 is a fighter').toBe(true);
  });

  it('is their season-4 render ("1, but s4 look."), loaded through the sprite registry, facing the way it was measured', () => {
    const r = W.eval('({ src: SPRITES.Bot.src, flip: SPRITES.Bot.flip, imgW: SPRITES.Bot.imgW, path: typeof SPRITES.Bot.path, draw: typeof SPRITES.Bot.draw, poly: !!HURT_POLY.Bot, rig: !!LIMB_RIG.Bot })');
    expect(r.src).toBe('assets/sprites/bot.png');
    expect(existsSync(`artifacts/V1/${r.src}`)).toBe(true);
    const ii = JSON.parse(readFileSync('scripts/sprite-manifest-inanimateinsanity.json', 'utf8'));
    expect(ii.Bot.source).toMatch(/Bot_Bandaged_S4\.png/);
    expect(r.flip).toBe(!!ii.Bot.flip);
    expect(r.imgW, 'a wide cap for the wings that are their body, as Cheesy has').toBeGreaterThan(2.3);
    expect(r.path).toBe('function');
    expect(r.draw).toBe('function');
    expect([r.poly, r.rig]).toEqual([true, true]);
  });

  it('draws that render mirrored toward the way they face, and the shared vector shape until it loads', () => {
    const rec = [];
    const dom = new JSDOM(readFileSync('artifacts/V1/index.html', 'utf8'), {
      url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
      beforeParse(window) {
        window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
          get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 }) : p === 'canvas' ? { width: 1100, height: 720 }
            : p === 'getImageData' ? () => ({ data: [] }) : p === 'createLinearGradient' || p === 'createRadialGradient' ? () => ({ addColorStop() {} })
            : (...args) => { rec.push({ op: p, args }); }),
          set: () => true,
        });
        window.Math.random = mulberry32(3);
        window.requestAnimationFrame = () => 0;
        window.cancelAnimationFrame = () => {};
      },
    });
    const w = dom.window;
    const draw = (face, loaded) => { rec.length = 0;
      w.eval(`SPRITES.Bot._req = true; SPRITES.Bot.img = ${loaded ? '{ complete:true, naturalWidth:296, naturalHeight:200 }' : 'null'};
              var f = makeFighter(ROSTER.find(function(r){ return r.name==='Bot'; }), 300, 300, 0); f.face = ${face}; f.onground = true; drawFighter(f);`);
      return { images: rec.filter((c) => c.op === 'drawImage').length, mirrored: rec.some((c) => c.op === 'scale' && c.args[0] === -1),
        fills: rec.filter((c) => c.op === 'fill').length }; };
    const right = draw(1, true), left = draw(-1, true), vector = draw(1, false);
    expect(right.images).toBe(1);
    expect(right.mirrored, 'facing right, as the art faces').toBe(false);
    expect(left.mirrored, 'facing left, they are mirrored').toBe(true);
    expect(vector.images).toBe(0);
    expect(vector.fills, 'the shared blob until the render loads').toBeGreaterThan(0);
  });
});

// The owner, since this build started: "remove all text for smashes and specials." -- so the moves this build touched put
// no words up: Test Tube's dart (the summon's line is gone with the summon), Pickle's splash, Knife's four tricks, the Heat
// Explosion. Played as YOU, where a banner showed.
describe('no words on screen for the moves this build changed', () => {
  const quiet = (name, body) => arena(name, `
    A.you = true; window.__lastBanner = null;
    ${body}
    for (var i=0;i<40;i++) step();
    return window.__lastBanner ? window.__lastBanner.text : null;`);
  it("Test Tube's dart", () => { expect(quiet('Test Tube', 'fireSpecial(A, {});')).toBe(null); });
  it("Pickle's missed dive", () => { expect(quiet('Pickle', 'D.x = 2000; doSpecial(A);')).toBe(null); });
  it("Knife's Bag of Tricks, all four", () => {
    expect(quiet('Knife', 'for (var k=0;k<4;k++){ A._trickN = k; A.spCd = 0; doSpecial(A); }')).toBe(null);
  });
  it("Paintbrush's Heat Explosion", () => { expect(quiet('Paintbrush', 'A._fury = 100; doSpecial(A);')).toBe(null); });
});

describe("Pickle's missed dive is just a splash", () => {
  const missed = () => arena('Pickle', `
    D.x = 2000; A.pct = 0; doSpecial(A);   // nobody in the way: the dive has to miss
    var landedAt = -1, drops = [];
    for (var i=0;i<30;i++){ var n0 = particles.length; step();
      if (landedAt < 0 && A.hitstun > 0){ landedAt = i;
        drops = particles.filter(function(p){ return p.color==='#7a5a2a'; }).map(function(p){ return { vx:p.vx, vy:p.vy }; }); } }
    var left = projectiles.filter(function(p){ return p.owner===A.idx; }).length;
    // walk a foe straight over the spot he landed on
    D.x = A.x - 60; D.slowed = 0; D.vx = 0; var slowedOn = false;
    for (var j=0;j<40;j++){ D.x += 3; step(); if ((D.slowed||0) > 0) slowedOn = true; }
    return { landedAt: landedAt, drops: drops, left: left, slowed: slowedOn, splat: A.hitstun > 0 || landedAt >= 0 };`);

  it('he still lands face first and has to get up', () => {
    const r = missed();
    expect(r.landedAt).toBeGreaterThanOrEqual(0);
    expect(r.splat).toBe(true);
  });

  it('he leaves nothing behind: no puddle, nothing that slows', () => {
    const r = missed();
    expect(r.left, 'no projectile, trap or puddle of his').toBe(0);
    expect(r.slowed, 'a foe walks straight over the spot').toBe(false);
  });

  it('only a small splash of brown droplets, thrown up and out to both sides', () => {
    const r = missed();
    expect(r.drops.length).toBeGreaterThanOrEqual(10);
    expect(r.drops.length).toBeLessThanOrEqual(20);
    expect(r.drops.every((d) => d.vy < 0), 'thrown up').toBe(true);
    expect(r.drops.some((d) => d.vx < 0) && r.drops.some((d) => d.vx > 0), 'to both sides').toBe(true);
    const text = W.eval("MOVE_TEXT.Pickle.special");
    expect(text).toMatch(/splash/);
    expect(text).not.toMatch(/face down in it/);
  });
});
