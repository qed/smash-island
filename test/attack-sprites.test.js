import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { JSDOM } from 'jsdom';
import { bootMonolith } from './helpers/smash-golden.js';
import { mulberry32 } from './helpers/prng.js';

// THE SHOW'S OWN ART FOR WHAT A FIGHTER THROWS.
//
// "add sprites from the actual show (puffballs rainbow vomit thing, moneys coins, etc.)". Seven of the
// thrown things exist as the show's art and ARE the thrown thing (a character render flying across the
// screen is the wrong result; those were rejected on sight): Ice Cube's shatter, Cake's slice, the
// Supervan, Bubble's bubble, Pen's cap, the price tag, the ruler. They draw in place of the glyph once
// loaded and never before, so a headless boot -- which never loads an image -- draws what it always did.
//
// Then "i think that all characters deserve good sprites", and the owner chose the file kit by kit (2026-09-24):
// thirty-four kits with verified show art, and a call for each of the eleven without -- Apple throws a pencil,
// Knife's hook and smoke become the Fist Thingy and the Temporary Paralyzer, Lightbulb throws the Shimmer Orb,
// Paintbrush MePhone4's paint bombs, Roboty's beep is BEEP lettering, Lightning strikes with the TPOT 7 bolt; and
// Microphone, Salt, Pepper, Knife's blade and caltrops, Paper's paper cut, Test Tube's flask and the Heat Explosion
// are drawn. Every file in assets/sprites/attacks/ is drawn by some entry here, on the shot it depicts and no other.
// Then the review of that build: Paper's smash drops the season-1 grand piano, lifted out of its only file (Ep2
// Piano.png), and Lightning's TPOT 7 strike keeps its glow and gets a halo so it reads on a light stage.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const counting = `new Proxy({}, { get:function(_t,p){
  if(p==='canvas') return {width:1100,height:720};
  if(p==='measureText') return function(){ return {width:0}; };
  return function(){ calls[p] = (calls[p]||0) + 1; if (p==='scale') scales.push([arguments[0], arguments[1]]); }; }, set:function(){ return true; } })`;

// A boot whose real canvas records every call and every style it is given, so the real draw paths can be read back.
function bootRecording(seed = 7) {
  const html = readFileSync('artifacts/V1/index.html', 'utf8');
  const rec = [];
  const grad = { addColorStop() {} };
  const dom = new JSDOM(html, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
        get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 })
          : p === 'canvas' ? { width: 1100, height: 720 }
          : p === 'getImageData' ? () => ({ data: [] })
          : (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createPattern') ? () => grad
          : (...args) => { rec.push({ op: p, args }); }),
        set: (_t, p, v) => { rec.push({ op: 'set:' + String(p), args: [v] }); return true; },
      });
      window.Math.random = mulberry32(seed);
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
    },
  });
  return { w: dom.window, rec };
}

// Every entry, by the key the draw looks it up under: the shot's own `shape`, else the owner's kit.
const KEYS = ['shatter', 'atstake', 'van', 'float', 'cap', 'pricetag', 'measure',
  'ember', 'emberjr', 'spark', 'bomb', 'quake', 'gust', 'serve', 'anvil', 'zapshooter', 'barfglob', 'fry', 'freeze',
  'flip', 'beam', 'buynow', 'splash', 'dribble', 'sign', 'grasstree', 'sucker', 'ink', 'payday', 'spike', 'battery',
  'saw', 'jawball', 'fraidy', 'paste', 'timber', 'sprinkles', 'fly', 'beep', 'zap', 'zaptrap',
  'lemon', 'chair', 'heavy', 'evilpaper', 'split', 'smokering', 'hook', 'eball', 'fury',
  // Inanimate Insanity DLC batch 3 ("add the last set of dlc fighters.")
  'lifeguard', 'spikeburst', 'soccerball', 'losercage', 'soapvacuum', 'cloth', 'condishawn', 'yinyang', 'slpineapple', 'sllemon', 'sltomato', 'slguava', 'slmangosteen', 'oatcookie', 'cherries', 'oliveoil', 'clover', 'bananapeel', 'jack', 'ghostvacuum', 'capturepod', 'immunitycookie', 'horstray', 'paintball',
  // The Announcer (the boss overhaul, Round 9): the cakes he tosses, the Cake Tosser's blade, a water balloon, the acid, a sparkle for the laser, the crusher's press (test/boss-announcer.test.js)
  'annslice', 'annlime', 'annice', 'annpie', 'anntosser', 'annballoon', 'annacid', 'annspark', 'annpress',
  // Steve Cobs's prize (OJ, Suitcase, Cabby): the shards, the bomb, the wrench, the file (test/dlc-ii-prize.test.js)
  'ojshard', 'casebomb', 'wrench', 'file',
  // Steve Cobs's fight (the boss overhaul, "Yes, cut or draw"): the MeKnife, the lollipops, the boomerang, the van that threw MePhone4 out of its back, the popcorn he was blown into, a unit's pencil (test/boss-cobs-fight.test.js)
  'meepleknife', 'cobslolli1', 'cobslolli2', 'cobsboomerang', 'meeplevan', 'popcorn', 'cobspencil',
  // Springy's MY PURPOSE! (the boss overhaul, Round 10: "give him 1 more: the bot toy"): Spring-Bot, the toy that listens and plays back (test/boss-springy.test.js)
  'springbot',
  // the boss overhaul (2026-09-29), Firey Speaker Box: his arm (YOU MUST!), the volcano's Fire Monster and the seven pieces he was broken into (test/boss-firey-sb.test.js)
  'fsbarm', 'fsbmonster', 'fsbpart1', 'fsbpart2', 'fsbpart3', 'fsbpart4', 'fsbpart5', 'fsbpart6', 'fsbpart7',
  // Purple Face, rebuilt (the boss overhaul, 2026-09-29): the show's art for his bug, totems, shoes, star and the warehouse's magnet (test/boss-purple-face.test.js)
  'pfacebug', 'pfacetotem', 'pfacetotemw', 'pfaceshoe', 'pfacestar', 'pfacemagnet',
  // The Bug Swarm's bugs (the boss overhaul, "Give the swarm a sprite."): the Bugs page's assets (test/boss-bug-swarm.test.js)
  'bugpurple', 'bugred', 'bugcool', 'bugsting', 'bugegg', 'bugeggs', 'bugsplat', 'bugbig', 'bughost', 'bugmutant', 'buglarva', 'bugqueen',
  // Puffball Speaker Box's knives (CONSEQUENCES!, and the one in her back) and PRIVATE!'s notes (test/boss-puffball.test.js)
  'psbknife', 'psbnote',
  // Evil Leafy (the boss overhaul, "and add sprites for the tendrils"): the vine mass every vine is built of, and the frozen leaf of her ending (test/boss-evilleafy.test.js)
  'elvine', 'elfrozen',
  // the boss overhaul (2026-09-29): the Purple Dragon's flame, Roboty thrown through the door, and the TPOT 7 bolt down a rope anchor (test/boss-dragon.test.js)
  'dragonflame', 'dragonroboty', 'dragonbolt',
  // One, rebuilt (the boss overhaul, 2026-09-30): the Moon piece of MOON ROCKS!, the three planets of OUT OF ORBIT! and the knife of KNIFE FLURRY! -- which is the Puffball Speaker Box's own file (test/boss-one.test.js)
  'moonrock', 'oneearth', 'oneweird', 'oneskate', 'oneknife',
  // Four's LOVE HEARTS!: the BFB Love Heart, cut from the wiki's bunch (the boss overhaul; test/boss-four.test.js)
  'fourheart',
  // Two, rebuilt (the boss overhaul): the spiked sun, the prize's orbs, the glow a copy with no art of its own falls back to, and the four team blocks (test/boss-two.test.js)
  'twosun', 'twoprize', 'twoorb', 'twoblock0', 'twoblock1', 'twoblock2', 'twoblock3',
  // MePhone4, rebuilt (the boss overhaul, 2026-09-29): the Fist Thingy's glove, the Rejection Portal's oval and a boomerang (test/boss-mephone4.test.js)
  'mp4glove', 'mp4portal', 'mp4boom',
  // MePhone4S, rebuilt (the boss overhaul, 2026-09-29): the pistol he draws (PUT THAT COOKIE DOWN!), the chainsaw and lollipop (ONE OF EACH!), the red car (I'LL BE BACK!) -- test/boss-mephone4s.test.js
  'redcar', 's4gun', 's4saw', 's4lolli'];

describe('the registry', () => {
  it('names only shapes the game draws, and every file exists', () => {
    const r = W.eval(`Object.keys(ATTACK_SPRITES).map(function(k){ return [k, !!PROJ_SHAPE[k], ATTACK_SPRITES[k].src]; })`);
    expect(r.map((x) => x[0]).sort()).toEqual(KEYS.slice().sort());
    for (const [k, hasShape, src] of r) {
      expect(hasShape, `${k} has no glyph to fall back on`).toBe(true);
      expect(existsSync(`artifacts/V1/${src}`), `${src} is missing`).toBe(true);
    }
  });

  it('every file in the attack folder is drawn by some entry -- none is dead weight', () => {
    const drawn = new Set(W.eval('Object.keys(ATTACK_SPRITES).map(function(k){ return ATTACK_SPRITES[k].src.split("/").pop(); })'));
    const onDisk = readdirSync('artifacts/V1/assets/sprites/attacks').filter((f) => f.endsWith('.png'));
    expect(onDisk.length).toBe(143);   // 47, plus batch 3's 24, plus Steve Cobs's prize's 4, plus the boss overhaul's: the Announcer's 9, Firey Speaker Box's 9, Purple Face's 6, the Bug Swarm's 12, Puffball Speaker Box's 2, the Purple Dragon's 2, Steve Cobs's fight's 6, One's 4 (her knife is Puffball Speaker Box's file), Four's 1, Two's 7, Evil Leafy's 2, MePhone4's 3, Springy's Spring-Bot 1, MePhone4S's 4 (his pistol, chainsaw, lollipop and car)
    expect(onDisk.filter((f) => !drawn.has(f))).toEqual([]);
  });

  it('every file is a real PNG at projectile size, and alpha survives the pipeline', () => {
    // Transparency is verified at fetch time on the UNCROPPED source (scripts/fetch-attack-sprites.mjs
    // rejects anything under 12% clear, which is what a screenshot looks like). After cropping to the
    // alpha box a rectangle -- the ruler, the price tag -- can legitimately have no clear pixel left, so
    // the shipped files are checked for being real PNGs at size, and alpha for surviving on the one
    // that must have it: the shatter is two thirds clear.
    const srcs = W.eval('Object.keys(ATTACK_SPRITES).map(function(k){ return ATTACK_SPRITES[k].src; })');
    const clearOf = (src) => { const png = PNG.sync.read(readFileSync(`artifacts/V1/${src}`));
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      return { png, clear: clear / (png.width * png.height) }; };
    for (const src of srcs) {
      const { png } = clearOf(src);
      expect(png.width * png.height, `${src} is empty`).toBeGreaterThan(0);
      expect(Math.max(png.width, png.height), `${src} is not projectile-sized`).toBeLessThanOrEqual(128);
    }
    expect(clearOf('assets/sprites/attacks/shatter.png').clear).toBeGreaterThan(0.3);
  });

  it('the credits name every file and its source', () => {
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const srcs = W.eval('Object.keys(ATTACK_SPRITES).map(function(k){ return ATTACK_SPRITES[k].src; })');
    for (const src of srcs) expect(credits, `${src} is not credited`).toContain(src.split('/').pop());
    expect(credits).toContain('battlefordreamisland');
    expect(credits).toContain('inanimateinsanity');
  });

  it("Tennis Ball's served ball is the show's now; her gadgets name their own shapes and stay drawn", () => {
    // It was left out on purpose until the owner chose "16body pinktennisball.png" for her (2026-09-24).
    expect(W.eval('ATTACK_SPRITES.serve.src')).toBe('assets/sprites/attacks/tennisball.png');
    expect(W.eval("['gadgetMine','gadgetTurret','gadgetBattery','gadgetShot','gadgetAcid'].filter(function(k){ return ATTACK_SPRITES[k]; })")).toEqual([]);
  });

  it('every size and motion is one the draw understands, and nothing is drawn bigger than a projectile', () => {
    const rows = W.eval('Object.keys(ATTACK_SPRITES).map(function(k){ return [k, ATTACK_SPRITES[k]]; })');
    const known = new Set(['src', 'h', 'spin', 'aim', 'rot', 'rest', 'flipX', 'cap', 'fixed', 'glow', 'glyph', 'halo']);
    for (const [k, e] of rows) {
      expect(Object.keys(e).filter((f) => !known.has(f)), `${k} has a field the draw ignores`).toEqual([]);
      expect(e.h, `${k}: h`).toBeGreaterThanOrEqual(6);
      expect(e.h, `${k}: h`).toBeLessThanOrEqual(44);
      expect(!(e.spin && e.aim), `${k} cannot both tumble and aim`).toBe(true);
    }
  });
});

// Fire a fighter's move and read back what it threw, by the key the draw would look it up under.
const MOVE = { special: 'doSpecial(A)', up: 'doUpSpecial(A)', down: 'doDownSpecial(A)', smash: 'doSmash(A)',
  jab: 'doAttack(A)', finisher: 'doAttackSpecial(A)' };
const thrown = (name, move, frames = 12) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 620, groundY()-24, 1);
  A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
  fighters=[A,D]; step(); A.spCd=0; A.atkCd=0; A.smCd=0; A.dropCd=0; A._windup=null; D.invuln=60;
  ${MOVE[move]};
  var keys = {};
  for (var i=0;i<${frames};i++){
    projectiles.forEach(function(p){ if(p.owner===A.idx) keys[p.shape || A.kit.special] = 1; });
    step(); D.invuln = 60;
  }
  projectiles.forEach(function(p){ if(p.owner===A.idx) keys[p.shape || A.kit.special] = 1; });
  return Object.keys(keys).map(function(k){ return [k, ATTACK_SPRITES[k] ? ATTACK_SPRITES[k].src.split('/').pop() : null, !!PROJ_SHAPE[k]]; });
})()`);

describe("what each fighter throws draws as the owner's file", () => {
  // [fighter, move, the file its shot draws with]
  const THROWS = [
    ['Firey', 'special', 'fireball.png'], ['Firey', 'down', 'fireball.png'], ['Firey Jr.', 'special', 'fireball.png'],
    ['Pencil', 'up', 'fireball.png'],   // she spits Donut's fire back
    ['Match', 'special', 'flame.png'], ['Match', 'down', 'flame.png'], ['Bomby', 'down', 'landmine.png'],
    ['Flower', 'up', 'poof.png'], ['Fanny', 'jab', 'poof.png'], ['Tennis Ball', 'up', 'tennisball.png'],
    ['Tennis Ball', 'finisher', 'tennisball.png'], ['Blocky', 'special', 'anvil.png'], ['Blocky', 'down', 'anvil.png'],
    ['Golf Ball', 'special', 'zapbolt.png'], ['Rocky', 'special', 'barf.png'], ['Rocky', 'finisher', 'barf.png'],
    ['Fries', 'special', 'fry.png'], ['Fries', 'up', 'fry.png'], ['Fries', 'down', 'fry.png'],
    ['Gelatin', 'special', 'syringe.png'], ['Gelatin', 'down', 'syringe.png'], ['Gelatin', 'smash', 'syringe.png'],
    ['Nickel', 'up', 'coins.png'], ['Ruby', 'jab', 'gem.png'], ['Ruby', 'down', 'gem.png'],
    ['Yellow Face', 'up', 'star.png'], ['Barf Bag', 'up', 'vomit.png'], ['Barf Bag', 'down', 'vomit.png'],
    ['Basketball', 'special', 'basketball.png'], ['Basketball', 'down', 'basketball.png'], ['Bracelety', 'special', 'sign.png'],
    ['Grassy', 'smash', 'bush.png'], ['Lollipop', 'special', 'candy.png'], ['Lollipop', 'down', 'candy.png'],
    ['Marker', 'down', 'inkball.png'], ['Marker', 'smash', 'inkball.png'], ['Money', 'smash', 'coin.png'],
    ['Naily', 'special', 'nail.png'], ['Naily', 'down', 'nail.png'], ['Remote', 'special', 'battery.png'],
    ['Saw', 'smash', 'sawblade.png'], ['Taco', 'special', 'jawbreaker.png'], ['Woody', 'special', 'woodchip.png'],
    ['Toothpaste', 'special', 'toothpaste.png'], ['Toothpaste', 'down', 'toothpaste.png'], ['Tree', 'special', 'branch.png'],
    ['Donut', 'up', 'sprinkles.png'], ['Puffball', 'jab', 'rainbow.png'], ['Roboty', 'up', 'beep.png'],
    ['Lightning', 'up', 'tpot7bolt.png'], ['Lightning', 'down', 'tpot7bolt.png'],
    ['Taco (II)', 'special', 'lemon.png'], ['Bow', 'smash', 'chair.png'], ['Baseball', 'down', 'book.png'],
    ['Paper', 'smash', 'piano.png'],     // "There is a grand piano from the unremastered s1"
    ['Apple', 'special', 'pencil.png'], ['Knife', 'special', 'taser.png'], ['Lightbulb', 'special', 'shimmerorb.png'],
    ['Lightbulb', 'up', 'shimmerorb.png'], ['Paintbrush', 'special', 'paintbomb.png'],
  ];
  it.each(THROWS)('%s, %s: %s', (name, move, file) => {
    const got = thrown(name, move);
    expect(got.length, `${name}'s ${move} threw nothing`).toBeGreaterThan(0);
    expect(got.map((g) => g[1]), `${name}'s ${move}: ${JSON.stringify(got)}`).toContain(file);
  });

  it('Lightning has a bolt for the strike and a smaller one for the trap, from the one TPOT 7 file', () => {
    const e = W.eval('[ATTACK_SPRITES.zap, ATTACK_SPRITES.zaptrap]');
    expect(e[0].src).toBe(e[1].src);
    expect(e[1].h).toBeLessThan(e[0].h);
    expect(W.eval("ROSTER.find(function(r){ return r.name==='Lightning'; }).kit.special")).toBe('zap');
  });

  it('the bolt glows round its own outline, strike and trap alike, so it reads on a light stage', () => {
    const r = W.eval(`(function(){
      function drawn(key, pr){ var set = {}; var c = new Proxy({}, { get:function(_t,p){ return function(){}; }, set:function(_t,p,v){ set[p] = v; return true; } });
        drawAttackSprite(c, pr, key, { complete:true, naturalWidth:128, naturalHeight:88 }); return set; }
      return { strike: drawn('zap', { x:0, y:0, vx:0, vy:12, r:6 }), trap: drawn('zaptrap', { x:0, y:0, vx:0, vy:0, r:13 }),
               plain: drawn('fury', { x:0, y:0, vx:6, vy:0, r:9 }) };
    })()`);
    for (const k of ['strike', 'trap']) {
      expect(r[k].shadowColor, `${k}: a blue halo`).toMatch(/^rgba\(70,160,255/);
      expect(r[k].shadowBlur, `${k}: a halo you can see`).toBeGreaterThanOrEqual(4);
    }
    expect(r.plain.shadowBlur, 'no halo on art that did not ask for one').toBeUndefined();
  });

  it("Paper's piano and paper cut: the piano is the season-1 file, the paper cut stays drawn", () => {
    expect(W.eval('ATTACK_SPRITES.evilpaper.src')).toBe('assets/sprites/attacks/piano.png');
    expect(W.eval('!!ATTACK_SPRITES.papercut')).toBe(false);
    expect(W.eval('!!PROJ_SHAPE.evilpaper'), 'the keys glyph until the art loads').toBe(true);
  });
});

describe("one kit's two different things draw as two different things", () => {
  // [fighter, move, the key its shot must draw under -- a glyph, with no art on it]
  const APART = [
    ['Donut', 'smash', 'glaze'], ['Donut', 'down', 'glaze'],             // his donut and his glaze, not the sprinkles
    ['Rocky', 'up', 'barf'], ['Rocky', 'down', 'barf'],                 // his red balls and his puddle, not his barf
    ['Paper', 'special', 'papercut'],                                   // the paper cut, drawn
    ['Roboty', 'smash', 'antenna'],                                     // his dots and dashes, not BEEP
    ['Taco', 'down', 'jawbreaker'], ['Taco', 'smash', 'jawbreaker'],     // her salsa, not the jawbreaker
    ['Blocky', 'up', 'block'],                                          // the block he conjures, not the anvil
    ['Paintbrush', 'down', 'heatwave'],                                 // heat waves, not paint bombs
    ['Microphone', 'special', 'mic'], ['Microphone', 'up', 'soundwave'], // the dodgeball and Feedback, drawn
    ['Salt', 'special', 'saltpepper'],                                  // salt, drawn
    ['Test Tube', 'up', 'testtube'], ['Test Tube', 'smash', 'testtube'], // her flask, drawn
    ['Test Tube', 'special', 'dart'],                                    // her tranquilizer dart, drawn ("New move for Test Tube": the wiki shows the blaster, never the dart)
  ];
  it.each(APART)('%s, %s: %s', (name, move, key) => {
    const got = thrown(name, move);
    expect(got.map((g) => g[0]), `${name}'s ${move}: ${JSON.stringify(got)}`).toContain(key);
    for (const [k, file, glyph] of got) {
      if (k !== key) continue;
      expect(file, `${name}'s ${move} (${k}) should stay drawn`).toBe(null);
      expect(glyph, `${k} has a glyph`).toBe(true);
    }
  });

  it("Pepper's echo throws pepper, after Salt's salt", () => {
    const got = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Salt'; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 3000, groundY()-24, 1);
      A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; fighters=[A,D];
      for (var i=0;i<20;i++) step(); A.spCd=0; doSpecial(A);
      var first = projectiles.filter(function(p){ return p.owner===A.idx; }).map(function(p){ return p.shape||A.kit.special; });
      for (var j=0;j<PEPPER_LAG+2;j++) step();
      var later = projectiles.filter(function(p){ return p.owner===A.idx && p.shape==='pepper'; }).length;
      return { first: first, later: later };
    })()`);
    expect(got.first.length).toBeGreaterThan(0);
    expect(got.first.every((k) => k === 'saltpepper')).toBe(true);
    expect(got.later, 'Pepper throws her pepper a beat later').toBeGreaterThan(0);
  });

  it("Knife's four tricks: the Paralyzer on its shock ring, the blade, the caltrops, then the Fist Thingy", () => {
    const got = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Knife'; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 560, groundY()-24, 1);
      A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; fighters=[A,D]; step();
      var out = [];
      for (var n=0;n<4;n++){ projectiles=[]; A.spCd=0; D.x=560; D.invuln=0; A._hookFx=null; doSpecial(A);
        out.push({ keys: projectiles.filter(function(p){ return p.owner===A.idx; }).map(function(p){ return p.shape||A.kit.special; }),
                   hook: A._hookFx ? A._hookFx.to : null, at: A._hookFx ? A._hookFx.t===hazardT : null }); for (var i=0;i<4;i++) step(); }
      return { out: out, D: D.idx, taser: ATTACK_SPRITES.smokering, fist: ATTACK_SPRITES.hook.src };
    })()`);
    expect(got.out[0].keys).toEqual(['smokering']);
    expect(got.taser.src).toBe('assets/sprites/attacks/taser.png');
    expect(got.taser.glyph && got.taser.fixed, 'the device sits at a fixed size on its growing shock ring').toBe(true);
    expect(got.out[1].keys).toEqual(['tricks']);       // the boomerang blade, drawn
    expect(got.out[2].keys).toEqual(['caltrops']);     // drawn
    expect(got.out[3].keys).toEqual([]);               // the Fist Thingy is not a shot...
    expect(got.out[3].hook, '...it grabs the foe it drags in').toBe(got.D);
    expect(got.out[3].at).toBe(true);
    expect(got.fist).toBe('assets/sprites/attacks/fist.png');
    expect(W.eval("['tricks','caltrops'].filter(function(k){ return ATTACK_SPRITES[k]; })")).toEqual([]);
  });

  it("Rocky's glob becomes a puddle when it lands, and a puddle is drawn as a puddle", () => {
    const got = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Rocky'; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 3000, groundY()-24, 1);
      A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; fighters=[A,D]; step(); A.spCd=0;
      doSpecial(A); var glob = projectiles.find(function(p){ return p.owner===A.idx; }); var before = glob.shape;
      for (var i=0;i<90 && !glob.trap;i++) step();
      return { before: before, after: glob.shape, trap: !!glob.trap, art: !!ATTACK_SPRITES.puddle, glyph: !!PROJ_SHAPE.puddle };
    })()`);
    expect(got.before).toBe('barfglob');
    expect(got.trap).toBe(true);
    expect(got.after).toBe('puddle');
    expect(got.art).toBe(false);
    expect(got.glyph).toBe(true);
  });
});

describe('drawing', () => {
  it('until the art has loaded there is no image, and a shot still draws its glyph without throwing', () => {
    const r = W.eval(`(function(){
      var im = attackImage('cap');
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var A = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 400, groundY()-24, 0);
      var D = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 700, groundY()-24, 1);
      A.team=0; D.team=1; A.face=1; A.controller='still'; D.controller='still'; fighters=[A,D]; step(); A.spCd=0;
      doSpecial(A); for (var i=0;i<6;i++) step();
      var err = null; try { projectiles.forEach(function(p){ drawProjectile(p); }); } catch(e){ err = e.message; }
      return { im: im, shots: projectiles.length, err: err };
    })()`);
    expect(r.im).toBe(null);
    expect(r.shots).toBeGreaterThan(0);
    expect(r.err).toBe(null);
  });

  it('a loaded image is drawn in place of the glyph, scaled with the shot', () => {
    const r = W.eval(`(function(){
      var calls = {}, scales = [];
      var c = ${counting};
      var im = { complete:true, naturalWidth:63, naturalHeight:56 };
      drawAttackSprite(c, { x:100, y:100, vx:5, vy:0, r:8 }, 'shatter', im);
      return calls;
    })()`);
    expect(r.drawImage).toBe(1);
    expect(r.fill || 0).toBe(0);
    expect(r.stroke || 0).toBe(0);
  });

  it('the van faces the way it drives', () => {
    const r = W.eval(`(function(){
      var out = {};
      ['right','left'].forEach(function(dir){
        var calls = {}, scales = [];
        var c = ${counting};
        drawAttackSprite(c, { x:100, y:100, vx: dir==='left' ? -6 : 6, vy:0, r:8 }, 'van', { complete:true, naturalWidth:121, naturalHeight:56 });
        out[dir] = scales.some(function(s){ return s[0] === -1; });
      });
      return out;
    })()`);
    expect(r.right).toBe(false);
    expect(r.left).toBe(true);
  });

  it('a shot tumbles or aims while it flies, and lies still once it stops: a trap does not spin in place', () => {
    const r = W.eval(`(function(){
      var A = function(k, pr){ return attackSpriteAngle(ATTACK_SPRITES[k], pr); };
      var fly = { x:100, y:0, vx:6, vy:0 }, rest = { x:100, y:0, vx:0, vy:0 };
      return {
        pencil: A('split', fly), pencilDown: A('split', { x:0, y:0, vx:0, vy:8 }),   // point first, either way
        syringe: A('freeze', fly), mineUp: A('freeze', rest),                       // needle first; a mine stands point up
        fireRest: A('ember', rest), fireFly: A('ember', fly),                       // a fire patch stands upright; flames trail in flight
        nailRest: A('spike', rest), fryRest: A('fry', rest), branchRest: A('timber', rest),
        coinRest: A('payday', rest), coinFly: A('payday', fly) };
    })()`);
    const R90 = Math.PI / 2;
    expect(r.pencil).toBeCloseTo(-R90, 5);
    expect(r.pencilDown).toBeCloseTo(0, 5);
    expect(r.syringe).toBeCloseTo(R90, 5);
    expect(r.mineUp).toBeCloseTo(0, 5);
    expect(r.fireRest).toBeCloseTo(0, 5);
    expect(r.fireFly).toBeCloseTo(-R90, 5);
    expect(r.nailRest).toBeCloseTo(-R90, 5);
    expect(r.fryRest).toBeCloseTo(R90, 5);
    expect(r.branchRest).toBeCloseTo(R90, 5);
    expect(r.coinRest).toBeCloseTo(0, 5);
    expect(Math.abs(r.coinFly)).toBeGreaterThan(0);
  });

  it('a big trap is capped, a fixed one never scales, and the Shimmer Orb glows', () => {
    const r = W.eval(`(function(){
      function size(key, rr){ var h = 0; var c = new Proxy({}, { get:function(_t,p){ return p==='drawImage' ? function(im,x,y,w,hh){ h = hh; } : function(){}; }, set:function(){ return true; } });
        drawAttackSprite(c, { x:0, y:0, vx:0, vy:0, r:rr }, key, { complete:true, naturalWidth:50, naturalHeight:50 }); return +h.toFixed(2); }
      var calls = {}, scales = [], c = ${counting};
      drawAttackSprite(c, { x:0, y:0, vx:3, vy:0, r:10 }, 'eball', { complete:true, naturalWidth:58, naturalHeight:56 });
      return { mine: size('freeze', 20), shot: size('freeze', 8), taserSmall: size('smokering', 20), taserBig: size('smokering', 120), glow: calls.fill || 0, img: calls.drawImage };
    })()`);
    expect(r.shot).toBe(26);
    expect(r.mine, 'a 20px syringe mine is capped at 1.5x').toBe(39);
    expect(r.taserSmall).toBe(r.taserBig);
    expect(r.glow, 'the glow behind the orb').toBe(1);
    expect(r.img).toBe(1);
  });

  it('the Paralyzer draws on top of its shock ring, and the other art draws alone', () => {
    const { w, rec } = bootRecording();
    w.eval(`ATTACK_IMG.smokering = { complete:true, naturalWidth:44, naturalHeight:56 };
            ATTACK_IMG.fury = { complete:true, naturalWidth:80, naturalHeight:56 };
            var K = makeFighter(ROSTER.find(function(r){ return r.name==='Knife'; }), 400, 300, 0);
            var P = makeFighter(ROSTER.find(function(r){ return r.name==='Paintbrush'; }), 400, 300, 1);
            window.__K = K; window.__P = P;`);
    rec.length = 0;
    w.eval(`drawProjectile({ owner:0, ownerObj:window.__K, x:400, y:300, vx:0, vy:0, r:40, color:'#8a8f96', shape:'smokering' })`);
    const ring = { strokes: rec.filter((c) => c.op === 'stroke').length, images: rec.filter((c) => c.op === 'drawImage').length };
    rec.length = 0;
    w.eval(`drawProjectile({ owner:1, ownerObj:window.__P, x:400, y:300, vx:6, vy:-2, r:9, color:'#5aa0ff' })`);
    const bomb = { images: rec.filter((c) => c.op === 'drawImage').length };
    expect(ring.strokes, 'the shock ring').toBeGreaterThan(0);
    expect(ring.images, 'and the Paralyzer on it').toBe(1);
    expect(bomb.images).toBe(1);
  });

  it("Puffball's rainbow is stripes with no outline", () => {
    const r = W.eval(`(function(){
      var calls = {}, scales = [];
      var c = ${counting};
      PROJ_SHAPE.fly.draw(c, 8, { x:0, y:0, vx:5, vy:0, r:8, color:'#e6a6e0' });
      return calls;
    })()`);
    expect(r.fillRect || 0, 'the stripes').toBeGreaterThanOrEqual(11);
    expect(r.fill || 0, 'the arc head').toBeGreaterThanOrEqual(6);
    expect(r.stroke || 0).toBe(0);
  });
});

describe("the owner's drawn calls, in the show's style", () => {
  // The styles each glyph sets, read back from a recording canvas: the colours are the ones the owner was offered.
  let R;
  beforeAll(() => { R = bootRecording(); });
  const stylesOf = (key, pr = { x: 0, y: 0, vx: 5, vy: 0, r: 8, color: '#888888' }) => {
    R.rec.length = 0;
    R.w.eval(`ctx.save(); PROJ_SHAPE[${JSON.stringify(key)}].draw(ctx, 8, ${JSON.stringify(pr)}); ctx.restore();`);
    return { fills: R.rec.filter((c) => c.op === 'set:fillStyle').map((c) => c.args[0]),
      strokes: R.rec.filter((c) => c.op === 'set:strokeStyle').map((c) => c.args[0]),
      ops: R.rec.map((c) => c.op) };
  };

  it('Microphone: a plain red dodgeball with a white shine, and Feedback as widening arcs', () => {
    const ball = stylesOf('mic');
    expect(ball.fills).toContain('#e0453a');
    expect(ball.strokes).toContain('#ffffff');
    const wave = stylesOf('soundwave');
    expect(wave.ops.filter((o) => o === 'arc').length, 'three arcs, each edged').toBeGreaterThanOrEqual(6);
    expect(wave.strokes).toContain('#ffffff');
    expect(wave.ops).not.toContain('fill');
  });

  it("Salt's salt is small white squares, Pepper's pepper small black flecks", () => {
    const salt = stylesOf('saltpepper'), pepper = stylesOf('pepper');
    expect(salt.fills).toContain('#ffffff');
    expect(salt.ops.filter((o) => o === 'fillRect').length).toBe(5);
    expect(pepper.fills).toEqual(['#26262c']);
    expect(pepper.ops.filter((o) => o === 'fillRect').length).toBe(5);
  });

  it("Knife's boomerang blade and caltrops, Paper's paper cut, Test Tube's flask and the Heat Explosion", () => {
    expect(stylesOf('tricks').fills).toContain('#dfe6ec');
    expect(stylesOf('caltrops').fills).toContain('#9aa3ab');
    const cut = stylesOf('papercut');
    expect(cut.fills).toContain('#f4f1e4');
    expect(cut.strokes, 'a blue rule and a red margin').toEqual(expect.arrayContaining(['#7fa8d8', '#d9534f']));
    const flask = stylesOf('testtube');
    expect(flask.fills, 'neon-green compound in a glass flask with a cork').toEqual(expect.arrayContaining(['#62ff3a', '#b07a4a']));
    const boom = stylesOf('heatboom');
    expect(boom.fills).toEqual(expect.arrayContaining(['#ff6a2a', '#ffb13b', '#fff1a8']));
    expect(W.eval('PROJ_SHAPE.papercut.spin')).toBe(true);
  });

  it("Test Tube's flask stands the right way up, however it is thrown", () => {
    const rot = (vx, vy) => { R.rec.length = 0; R.w.eval(`ctx.save(); flaskShape(ctx, 8, { vx:${vx}, vy:${vy} }); ctx.restore();`);
      return R.rec.filter((c) => c.op === 'rotate').map((c) => c.args[0])[0]; };
    expect(rot(0, 0)).toBeCloseTo(0, 5);
    expect(Math.abs(rot(-6, 0) + Math.PI), 'thrown left, it is turned back upright, give or take its wobble').toBeLessThan(0.5);
  });

  it('the Fist Thingy shoots out on its arm, and the Heat Explosion blooms, then both are gone', () => {
    const { w, rec } = bootRecording();
    const r = w.eval(`(function(){
      ATTACK_IMG.hook = { complete:true, naturalWidth:121, naturalHeight:56 };
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var K = makeFighter(ROSTER.find(function(r){ return r.name==='Knife'; }), 400, groundY()-24, 0);
      var P = makeFighter(ROSTER.find(function(r){ return r.name==='Paintbrush'; }), 700, groundY()-24, 1);
      K.team=0; P.team=1; K.face=1; K.controller='still'; P.controller='still'; K.stocks=9; P.stocks=9; fighters=[K,P]; step();
      K._trickN = 3; K.spCd = 0; P.x = 560; P.invuln = 0; doSpecial(K);       // the fourth trick: the Fist Thingy
      P._fury = 100; P.spCd = 0; P.face = -1; doSpecial(P);                 // a full rage: the Heat Explosion
      return { hook: !!K._hookFx, heat: P._heatFx === hazardT };
    })()`);
    expect(r.hook && r.heat).toBe(true);
    rec.length = 0; w.eval('step(); drawKitFx()');
    const during = { images: rec.filter((c) => c.op === 'drawImage').length, fills: rec.filter((c) => c.op === 'fill').length };
    rec.length = 0; w.eval('for (var i=0;i<30;i++) step(); drawKitFx()');
    const after = rec.filter((c) => c.op === 'drawImage' || c.op === 'fill').length;
    expect(during.images, 'the glove on the end of its arm').toBe(1);
    expect(during.fills, 'the burst').toBeGreaterThanOrEqual(3);
    expect(after).toBe(0);
  });

  it("the Heat Explosion's fire puffs fire again, and both instant effects reach a net client", () => {
    // The burst's comment once swallowed the 24 puffs on the same line: locally only the drawn burst showed, and a net
    // client -- which gets particles but not the burst -- saw nothing at all. Now the puffs fire, and the two render-only
    // stamps cross the wire as heatFx and hookFx (no underscore: nothing render-only named _x leaks) and come back.
    const r = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var K = makeFighter(ROSTER.find(function(r){ return r.name==='Knife'; }), 400, groundY()-24, 0);
      var P = makeFighter(ROSTER.find(function(r){ return r.name==='Paintbrush'; }), 700, groundY()-24, 1);
      K.team=0; P.team=1; K.face=1; K.controller='still'; P.controller='still'; K.stocks=9; P.stocks=9; fighters=[K,P]; step();
      particles=[]; P._fury = 100; P.spCd = 0; P.face = -1; doSpecial(P);
      var fire = particles.filter(function(p){ return p.color==='#ff6a2a' || p.color==='#ffd24b'; }).length;
      K._trickN = 3; K.spCd = 0; P.x = 560; P.invuln = 0; doSpecial(K);
      var snap = JSON.parse(JSON.stringify(serializeState()));
      var wire = snap.fighters.map(function(f){ return { heat: f.heatFx, hook: f.hookFx }; });
      applySnapshot(snap);
      var back = fighters.map(function(f){ return { heat: f._heatFx, hook: f._hookFx ? f._hookFx.t : null }; });
      return { fire: fire, t: hazardT, wire: wire, back: back };
    })()`);
    expect(r.fire, 'the fire puffs: 24 of them, seven sparks each').toBe(24 * 7);
    expect(r.wire[1].heat).toBe(r.t);
    expect(r.wire[0].hook && r.wire[0].hook.t).toBe(r.t);
    expect(r.back[1].heat, 'the client draws the burst').toBe(r.t);
    expect(r.back[0].hook, 'and the arm').toBe(r.t);
  });

  it('the new words: a pencil, the Paralyzer and the Fist Thingy, paint bombs', () => {
    const t = W.eval('({ apple: MOVE_TEXT.Apple.special, knife: MOVE_TEXT.Knife.special, brush: MOVE_TEXT.Paintbrush.special })');
    expect(t.apple).toMatch(/pencil/);
    expect(t.knife).toMatch(/Temporary Paralyzer/);
    expect(t.knife).toMatch(/Fist Thingy/);
    expect(t.knife).not.toMatch(/smoke/);
    expect(t.brush).toMatch(/paint bomb/);
  });
});
