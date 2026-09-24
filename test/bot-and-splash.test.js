import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { bootMonolith } from './helpers/smash-golden.js';
import { mulberry32 } from './helpers/prng.js';

// TWO OF THE OWNER'S CALLS THAT CHANGE A MOVE, NOT ONLY ITS ART (2026-09-24).
//
// Test Tube: "change the ability" -> "Summon Bot". Her special no longer throws a flask: it builds Bot, the robot she
// made as a replica of Bow, who fights beside her for a few seconds on the assist machinery. Her smash and up-special
// still leave flasks (test/attack-sprites.test.js draws those).
// Pickle: "Just a splash". His missed dive leaves no puddle any more -- nothing that slows -- only a small splash of
// brown droplets on impact.

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

describe("Test Tube's special summons Bot", () => {
  it('builds Bot beside her -- on her side, for four seconds -- and throws nothing', () => {
    const r = arena('Test Tube', `
      fireSpecial(A, {});
      var b = ${bots};
      return { n: b.length, type: b[0] && b[0].type, act: b[0] && b[0].act, owner: b[0] && b[0].owner, team: b[0] && b[0].team,
               life: b[0] && b[0].life, dx: b[0] && (b[0].x - A.x), shots: projectiles.filter(function(p){ return p.owner===A.idx; }).length,
               cd: A.spCd, dur: BOT_ASSIST.dur };`);
    expect(r.n).toBe(1);
    expect(r.type, 'the assist machinery').toBe('assist');
    expect(r.act).toBe('bot');
    expect(r.owner).toBe(0);
    expect(r.team).toBe(0);
    expect(r.dur).toBe(240);
    expect(r.life).toBe(240);
    expect(r.dx, 'in front of her').toBeGreaterThan(0);
    expect(r.shots, 'no flask any more').toBe(0);
    expect(r.cd, 'a new Bot takes a while').toBeGreaterThan(r.dur);
  });

  it('Bot walks to the nearest foe and punches, again and again, and never his own side', () => {
    const r = arena('Test Tube', `
      var T = makeFighter(ROSTER.find(function(x){ return x.name==='Coiny'; }), 420, groundY()-24, 2);
      T.team = 0; T.controller='still'; T.stocks=9; T.invuln=0; T.pct=30; fighters.push(T);   // a teammate beside him
      fireSpecial(A, {});
      var hits = [], last = D.pct;
      for (var i=0;i<200;i++){ step(); D.x = 560; D.vx = 0; D.invuln = 0; D.hitstun = 0;
        if (D.pct > last + 0.3){ hits.push(+(D.pct - last).toFixed(2)); } last = D.pct; }
      return { hits: hits, mate: T.pct - 30 };`);
    expect(r.hits.length, 'he keeps punching').toBeGreaterThanOrEqual(3);
    expect(r.hits[0]).toBe(6);
    expect(r.mate, 'Bot never hits her team').toBe(0);
  });

  it('he is gone after his four seconds, and a second press builds a fresh one rather than two', () => {
    const r = arena('Test Tube', `
      fireSpecial(A, {}); for (var i=0;i<120;i++) step();
      A.spCd = 0; fireSpecial(A, {});
      var after2 = ${bots}.length, life2 = ${bots}[0].life;
      for (var j=0;j<BOT_ASSIST.dur+2;j++) step();
      return { after2: after2, life2: life2, end: ${bots}.length };`);
    expect(r.after2, 'one Bot at a time').toBe(1);
    expect(r.life2, 'built afresh').toBe(240);
    expect(r.end).toBe(0);
  });

  it('when Test Tube is out of the match, so is Bot; and no item ever rolls him', () => {
    const r = arena('Test Tube', `
      fireSpecial(A, {}); step(); var before = ${bots}.length;
      A.dead = true; step();
      return { before: before, after: ${bots}.length, trophy: ASSIST_ROSTER.some(function(a){ return a.name==='Bot' || a.act==='bot'; }) };`);
    expect(r.before).toBe(1);
    expect(r.after).toBe(0);
    expect(r.trophy, 'he is her special, not an assist trophy').toBe(false);
  });

  it('in Boss Rush he punches the boss -- a boss is a summon, not a fighter, and the flask could hit one', () => {
    const r = W.eval(`(function(){
      var prevMode = SETTINGS.mode, prevStocks = SETTINGS.stocks;
      SETTINGS.mode='boss'; SETTINGS.stocks=9; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      BOSSRUSH.active=true; BOSSRUSH.cleared=0; BOSSRUSH.bossIdx=0; BOSSRUSH.loop=0; BOSSRUSH.dmgMult=1;
      var A = makeFighter(ROSTER.find(function(x){ return x.name==='Test Tube'; }), 300, groundY()-24, 0);
      A.team=0; A.face=1; A.controller='still'; A.stocks=9; fighters=[A]; step();
      spawnBossRushBoss(); var B = summons.find(function(s){ return s.type==='boss'; });
      B.x = A.x + 170; B.homeX = B.x; B.stationary = true; B._atkTimer = 1e9; var hp0 = B.hp;
      A.spCd = 0; fireSpecial(A, {});
      for (var i=0;i<200;i++){ A.invuln = 60; A.x = 300; B._atkTimer = 1e9; B._tel = 0; step(); }
      var lost = hp0 - B.hp;
      BOSSRUSH.active=false; running=false; SETTINGS.mode=prevMode; SETTINGS.stocks=prevStocks; summons=[]; BOSS_ARENA=null;
      return { lost: lost };
    })()`);
    expect(r.lost, 'Bot lands punches on the boss').toBeGreaterThanOrEqual(12);
    expect(r.lost % 6, 'six a punch').toBe(0);
  });

  it('her move card says so, and her smash and up-special still leave flasks', () => {
    const r = W.eval(`({ text: MOVE_TEXT['Test Tube'].special, desc: ROSTER.find(function(x){ return x.name==='Test Tube'; }).kit.desc,
      smash: SMASH_SPEC.testtube.pat, up: !!UPSPEC.testtube.shot })`);
    expect(r.text).toMatch(/^Summon Bot — /);
    expect(r.text).toMatch(/Bow/);
    expect(r.desc).toMatch(/Bot/);
    expect(r.desc, 'Bot is her robot copy of Bow -- Bow is not her robot').not.toMatch(/her robot Bow/);
    expect(r.smash).toBe('mine');
    expect(r.up).toBe(true);
  });
});

describe("Bot's body", () => {
  it('is a partner, not a crowd cameo or a spawn marker: the level editor never shows him, or Pepper', () => {
    const r = W.eval(`(function(){
      var names = edSpriteNames(), picks = {};
      for (var i=0;i<400;i++) picks[edMakeDeco('cameo', 0.5, 0.8).n] = 1;
      var fighters = ROSTER.filter(function(x){ return SPRITES[x.name]; }).map(function(x){ return x.name; });
      return { names: names, picks: Object.keys(picks), first: names[0], missing: fighters.filter(function(n){ return names.indexOf(n) < 0; }),
               inSprites: !!SPRITES.Bot && !!SPRITES.Pepper };
    })()`);
    expect(r.inSprites, 'their renders still load through the registry').toBe(true);
    expect(r.names).not.toContain('Bot');
    expect(r.names).not.toContain('Pepper');
    expect(r.picks).not.toContain('Bot');
    expect(r.picks).not.toContain('Pepper');
    expect(r.missing, 'every fighter is still in the pool').toEqual([]);
    expect(W.eval('ROSTER.some(function(x){ return x.name===' + JSON.stringify(r.first) + '; })'), 'spawn marker 0 is a fighter').toBe(true);
  });

  it('is his II render, loaded through the sprite registry like Pepper, facing the way it was measured', () => {
    const r = W.eval('({ src: SPRITES.Bot.src, flip: SPRITES.Bot.flip, path: typeof SPRITES.Bot.path, draw: typeof SPRITES.Bot.draw })');
    expect(r.src).toBe('assets/sprites/bot.png');
    expect(existsSync(`artifacts/V1/${r.src}`)).toBe(true);
    const ii = JSON.parse(readFileSync('scripts/sprite-manifest-inanimateinsanity.json', 'utf8'));
    expect(r.flip).toBe(!!ii.Bot.flip);
    expect(r.path).toBe('function');
    expect(r.draw).toBe('function');
  });

  it('draws his render mirrored toward his target, and his vector shape until it loads', () => {
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
      w.eval(`SPRITES.Bot._req = true; SPRITES.Bot.img = ${loaded ? '{ complete:true, naturalWidth:303, naturalHeight:200 }' : 'null'};
              drawSummon({ type:'assist', name:'Bot', act:'bot', color:'#cfe8d8', x:300, y:300, r:26, face:${face}, team:0 })`);
      return { images: rec.filter((c) => c.op === 'drawImage').length, mirrored: rec.some((c) => c.op === 'scale' && c.args[0] === -1),
        fills: rec.filter((c) => c.op === 'fill').length, name: rec.some((c) => c.op === 'fillText' && c.args[0] === 'Bot') }; };
    const right = draw(1, true), left = draw(-1, true), vector = draw(1, false);
    expect(right.images).toBe(1);
    expect(right.mirrored).toBe(false);
    expect(left.mirrored, 'facing left, he is mirrored').toBe(true);
    expect(right.name, 'a nametag').toBe(true);
    expect(vector.images).toBe(0);
    expect(vector.fills, 'the bow-shaped vector').toBeGreaterThan(0);
  });
});

// The owner, since this build started: "remove all text for smashes and specials." -- so the moves this build touched put
// no words up: Bot's summon, Pickle's splash, Knife's four tricks, the Heat Explosion. Played as YOU, where a banner showed.
describe('no words on screen for the moves this build changed', () => {
  const quiet = (name, body) => arena(name, `
    A.you = true; window.__lastBanner = null;
    ${body}
    for (var i=0;i<40;i++) step();
    return window.__lastBanner ? window.__lastBanner.text : null;`);
  it("Test Tube's Summon Bot", () => { expect(quiet('Test Tube', 'fireSpecial(A, {});')).toBe(null); });
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
