import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';
import { loadMonolith } from './helpers/load-monolith.js';

// FINAL SMASH BALLS (the owner, 2026-10-14, "pipis"): a rare Smash Ball floats about a normal match; whoever breaks it glows and fires
// their Final Smash ONCE with the finisher input (V + C). Direct checks only: the ball breaks and grants the glow; V + C fires it once;
// the default Final Smash lands on a foe in its drawn circle and misses one outside it; the ball is not in Capture the Flag, RUNNING!,
// boss fights or with items off; and the online snapshot carries the ball and the glow.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// A (the default Final Smash, forced, unless a fighter is named) and D (Pen) on a flat floor, D `dx` px in front of A. `body` runs inside with A and D in scope.
const arenaIn = (win, dx, body, { pct = 0, a = null, ax = 400 } = {}) => win.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=2; SETTINGS.smashBalls=true; running=true;
  RACE.active=false; ONEFIGHT.active=false; COBSFIGHT.active=false; TESTMODE.active=false; BOSSRUSH.active=false; TOURNEY.active=false;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; itemTimer=1e9;   // (no pickup wanders in: a heal would move the dummy's %)
  var A = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(a || 'Coiny')}; }), ${ax}, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ${ax + dx}, groundY()-24, 1);
  A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
  ${a ? '' : 'A._fsForce = FS_DEFAULT;'}   // no fighter named: the DEFAULT Final Smash, whoever has a row of their own by now
  fighters=[A,D]; hazardT=5; fsReset(); SMASHBALL=null; FS.next=99999;
  [A,D].forEach(function(f){ f.invuln=0; f.hitstun=0; f.spCd=0; f.atkCd=0; f.armor=0; f.fnCd=0; });
  A.pct=0; D.pct=${pct};
  for (var k in down) down[k]=false;
  ${body}
})()`);
const arena = (...args) => arenaIn(W, ...args);

describe('the Smash Ball', () => {
  it('breaks after a few hits and the one who broke it glows', () => {
    const r = arena(300, `
      fsSpawn(); var b = SMASHBALL; b.x = A.x + 40; b.y = A.y; b.wx = b.x; b.wy = b.y; b.vx = 0; b.vy = 0;
      var hits = 0, glowAtHit = [];
      for (var i = 0; i < 400 && SMASHBALL; i++) {
        b.x = A.x + 40; b.y = A.y; b.vx = 0; b.vy = 0;
        hazardT += 14; if (fsBallHit(A, A.x + 40, A.y, 30, 7)) hits++;
      }
      return { hits: hits, ball: !!SMASHBALL, glow: A.fsGlow, dGlow: D.fsGlow || 0 };`);
    expect(r.ball).toBe(false);
    expect(r.hits).toBeGreaterThanOrEqual(3);
    expect(r.hits).toBeLessThanOrEqual(7);
    expect(r.glow).toBeGreaterThan(1000);
    expect(r.dGlow).toBe(0);
  });

  it('a real swing meets it (hitCircle), and a glowing fighter cannot break another', () => {
    const r = arena(300, `
      fsSpawn(); var b = SMASHBALL; b.x = A.x + 40; b.y = A.y; var hp0 = b.hp;
      hitCircle(A, A.x + 40, A.y, 30, 8, 8, 9, -5);
      var hurt = hp0 - b.hp;
      D.fsGlow = 600; hazardT += 30; var hp1 = b.hp; hitCircle(D, b.x, b.y, 30, 8, 8, 9, -5);
      return { hurt: hurt, held: b.hp === hp1 };`);
    expect(r.hurt).toBeGreaterThan(0);
    expect(r.held).toBe(true);
  });

  it('is never made in Capture the Flag, RUNNING!, a boss fight, with items or Smash Balls off', () => {
    const r = arena(300, `
      var out = { normal: fsAllowed() };
      SETTINGS.mode='ctf'; out.ctf = fsAllowed(); SETTINGS.mode='boss'; out.boss = fsAllowed(); SETTINGS.mode='ffa';
      RACE.active=true; out.race = fsAllowed(); RACE.active=false;
      summons.push({type:'boss', hp:10, team:-1}); out.bossSummon = fsAllowed(); summons=[];
      SETTINGS.itemRate=0; out.itemsOff = fsAllowed(); SETTINGS.itemRate=2;
      SETTINGS.smashBalls=false; out.toggleOff = fsAllowed(); SETTINGS.smashBalls=true;
      TOURNEY.active=true; out.cup = fsAllowed(); TOURNEY.active=false;
      // and it never spawns on the clock where it is not allowed
      SETTINGS.mode='ctf'; FS.next = 1; for (var i=0;i<5;i++) step(); out.ctfSpawned = !!SMASHBALL;
      return out;`);
    expect(r.normal).toBe(true);
    for (const k of ['ctf', 'boss', 'race', 'bossSummon', 'itemsOff', 'toggleOff', 'cup', 'ctfSpawned']) expect(r[k], k).toBe(false);
  });

  it('comes on the clock, one at a time', () => {
    const r = arena(300, `
      FS.next = 3; for (var i=0;i<6;i++) step();
      var first = SMASHBALL, many = 0;
      for (var j=0;j<300;j++){ FS.next = 1; step(); if (SMASHBALL !== first) many++; }
      return { made: !!first, same: many === 0 };`);
    expect(r.made).toBe(true);
    expect(r.same).toBe(true);
  });
});

describe('V + C while glowing', () => {
  it('fires the Final Smash once, through the real keys, and the glow is spent', () => {
    const r = arena(120, `
      A.controller='local'; A.you=true; A.fsGlow = 900;
      down[KEYS.smash] = true; down[KEYS.special] = true;
      step(); step(); step();
      var fired = !!A._fs, id = A.fsId, glow = A.fsGlow;
      down[KEYS.smash] = false; down[KEYS.special] = false;
      var starts = 0, prev = !!A._fs;
      for (var i=0;i<130;i++){ step(); if (A._fs && !prev) starts++; prev = !!A._fs; }
      // pressing again after it is over is the ordinary finisher: nothing glows
      down[KEYS.smash] = true; down[KEYS.special] = true; for (var k=0;k<4;k++) step();
      return { fired: fired, id: id, glow: glow, starts: starts, over: !A._fs && !A.fsId, again: !!A._fs };`);
    expect(r.fired).toBe(true);
    expect(r.id).toBe('surge');
    expect(r.glow).toBe(0);
    expect(r.starts).toBe(0);
    expect(r.over).toBe(true);
    expect(r.again).toBe(false);
  });

  it('not glowing, V + C is still the ordinary finisher', () => {
    const r = arena(120, `
      A.controller='local'; A.you=true;
      down[KEYS.smash] = true; down[KEYS.special] = true; step(); step(); step();
      return { fs: !!A._fs, cd: A.fnCd > 0 };`);
    expect(r.fs).toBe(false);
    expect(r.cd).toBe(true);
  });

  it('the default lands on a foe inside the drawn circle (a stock at moderate %) and misses one outside it', () => {
    const near = arena(110, `
      A.fsGlow = 900; fsTryFire(A);
      for (var i=0;i<160;i++) step();
      return { pct: D.pct, stocks: D.stocks };`, { pct: 60 });
    expect(near).toEqual({ pct: 0, stocks: 8 });   // 26% on top of 60 and a launch: out (the stock is gone, the % starts over)
    const far = arena(520, `
      A.fsGlow = 900; fsTryFire(A);
      for (var i=0;i<160;i++) step();
      return { pct: D.pct, stocks: D.stocks };`, { pct: 60 });
    expect(far.pct).toBe(60);
    expect(far.stocks).toBe(9);
  });

  it('the holder is untouchable through the tell, and a KO ends the glow', () => {
    const r = arena(120, `
      A.fsGlow = 900; fsTryFire(A);
      step(); var inv = A.invuln > 0 && A._lag > 0;
      var B = A; B.fsGlow = 0;
      A.fsGlow = 500; A._fs = null; A.fsId = ''; eliminate(A);
      return { inv: inv, glow: A.fsGlow, fs: !!A._fs };`);
    expect(r.inv).toBe(true);
    expect(r.glow).toBe(0);
    expect(r.fs).toBe(false);
  });
});

describe('the CPU', () => {
  it('holds its Final Smash until a foe is in reach, then fires; and a CPU chases the ball', () => {
    const r = arena(600, `
      A.controller='ai'; A.fsGlow = 900;
      var inp = fsBotInput(A, {left:false,right:false,jump:false,attack:false,special:false,smash:false,up:false,fin:true});
      var holdFar = !inp.fin;
      D.x = A.x + 100;
      inp = fsBotInput(A, {left:false,right:false,jump:false,attack:false,special:false,smash:false,up:false});
      var fireNear = !!inp.fin;
      A.fsGlow = 0; D.x = A.x + 600; fsSpawn(); SMASHBALL.seq = 1; SMASHBALL.x = A.x + 300; SMASHBALL.y = A.y;
      var seen = false;
      for (var q = 0; q < 3 && !seen; q++) { SMASHBALL.seq = q; var i2 = fsBotInput(A, {left:false,right:false,jump:false,attack:false,special:false,smash:false,up:false}); if (i2.right) seen = true; }
      return { holdFar: holdFar, fireNear: fireNear, chases: seen };`);
    expect(r).toEqual({ holdFar: true, fireNear: true, chases: true });
  });
});

describe('online', () => {
  it('the snapshot carries the ball and the glow, and a client rebuilds both', () => {
    const r = arena(300, `
      fsSpawn(); SMASHBALL.x = 321; SMASHBALL.y = 222; SMASHBALL.hp = 17; A.fsGlow = 700;
      var snap = JSON.parse(JSON.stringify(serializeState(true)));
      var carried = { fsb: snap.fsb, glow: snap.fighters[0].fsGlow };
      SMASHBALL = null; A.fsGlow = 0;
      applySnapshot(snap);
      var out = { carried: carried, ball: SMASHBALL && [SMASHBALL.x, SMASHBALL.hp], glow: fighters[0].fsGlow, none: null };
      SMASHBALL = null; delete snap.fsb; applySnapshot(snap); out.none = SMASHBALL;
      return out;`);
    expect(r.carried.fsb).toEqual([321, 222, 50, 0]);
    expect(r.carried.glow).toBe(700);
    expect(r.ball).toEqual([321, 50]);
    expect(r.glow).toBe(700);
    expect(r.none).toBeNull();
  });

  it('a Final Smash in progress is on the wire (id, frames in, tell length)', () => {
    const r = arena(300, `
      A.fsGlow = 900; fsTryFire(A); for (var i=0;i<12;i++) step();
      var o = JSON.parse(JSON.stringify(serializeState(true))).fighters[0];
      return { id: o.fsId, t: o.fsT, wind: o.fsWind, dur: o.fsDur };`);
    expect(r.id).toBe('surge');
    expect(r.t).toBeGreaterThan(8);
    expect(r.wind).toBe(40);
    expect(r.dur).toBe(92);
  });
});

describe('drawing', () => {
  it('draws the ball, the glow and a Final Smash (tell and blast) with no error', () => {
    const { window: w } = loadMonolith();
    const r = arenaIn(w, 120, `
      var texts = 0; var real = ctx.fillText; 
      fsSpawn(); SMASHBALL.x = 500; SMASHBALL.y = 300; SMASHBALL.hp = 10; A.fsGlow = 900;
      var errs = [];
      function pic(){ try{ draw(); }catch(e){ errs.push(String(e)); } }
      pic();
      A.fsGlow = 100; pic(); A.fsGlow = 900; fsTryFire(A);
      for (var i=0;i<100;i+=4){ for (var k=0;k<4;k++) step(); pic(); }
      return { errs: errs };`);
    expect(r.errs).toEqual([]);
  });
});

// BATCH A: each fighter's own Final Smash lands on a foe standing where its tell drew the hit, and misses one standing where it did not.
describe('batches A, B and C: the unique Final Smashes', () => {
  const rows = [
    // name, id, a foe in the hit, a foe out of it
    ['Firey',    'inferno',  110, 700],
    ['Leafy',    'void',     200, -420],
    ['Pencil',   'twofour',  200, 560],
    ['Puffball', 'trance',   150, -520],
    ['Bow',      'snowbow',  300, null],
    ['Flower',   'petals',   200, null],
    // batch B
    ['Bubble',   'yoylecake',     150, 500],
    ['Blocky',   'recoveryloop',  200, 450],
    ['Pen',      'erasure',       250, 520],
    ['Match',    'freesmartvan',  200, null],
    ['Ice Cube', 'vengeance',     200, 450],
    ['Teardrop', 'silenttreatment', 250, -300],
    ['Bomby',    'detonation',    120, 330],
    ['Rocky',    'matter',        200, -300],
    // batch C
    ['Lightning','chainbolt',     250, 560],
    ['Fanny',    'hurricane',     120, 520],
    ['Dora',     'rant',           80, -200],
    ['Saw',      'overdrive',      60, 200],
    ['Tennis Ball', 'ballmachine', 250, -300],
    ['Snowball', 'avalanche',     200, -300],
    ['Book',     'overdue',       250, null],
    ['Ruby',     'refraction',    250, -300],
  ];
  const play = (name, dx, pct) => arena(dx, `
    A.fsGlow = 900; fsTryFire(A); var id = A.fsId, kind0 = null, kinds = {};
    for (var i = 0; i < 200; i++) { step(); if (A._atkKind) kinds[A._atkKind] = 1; if (i > 150) { D.invuln = 0; } }
    var over = !A._fs && !A.fsId;
    return { id: id, over: over, hurt: D.pct !== ${pct} || D.stocks < 9, stocks: D.stocks, pct: D.pct, kinds: Object.keys(kinds) };`, { pct, a: name, ax: dx < 0 ? 800 : 130 });
  for (const [name, id, near, far] of rows) {
    it(name + ': ' + id + ' lands in its circle, ends cleanly, and uses the Final Smash animation', () => {
      const r = play(name, near, 60);
      expect(r.id).toBe(id);
      expect(r.over).toBe(true);
      expect(r.hurt, JSON.stringify(r)).toBe(true);
      expect(r.kinds.some(k => k === 'fsgather' || k === 'fsburst' || k === 'spit' || k === 'spin'), JSON.stringify(r.kinds)).toBe(true);
    });
    if (far !== null) it(name + ': ' + id + ' misses a foe standing outside the drawn reach', () => {
      const r = play(name, far, 60);
      expect(r.hurt, JSON.stringify(r)).toBe(false);
    });
  }
  it('Flower flings petals, and more between them 16 frames on', () => {
    const r = arena(400, `
      A.fsGlow = 900; fsTryFire(A); var n = [], q = [];
      for (var i = 0; i < 70; i++) { step(); n.push(projectiles.filter(function(p){ return p.owner === A.idx && p.color === '#ff6fae'; }).length); }
      return { first: n[36], second: Math.max.apply(null, n) };`, { a: 'Flower' });
    expect(r.first).toBeGreaterThanOrEqual(6);   // (the ones thrown down into the floor break on it at once)
    expect(r.second).toBeGreaterThan(r.first);
    expect(r.second).toBeLessThanOrEqual(24);
  });
  it('every row draws its tell and its blast with no error, and a client could (the wire fields are enough)', () => {
    const { window: w } = loadMonolith();
    const r = arenaIn(w, 150, `
      var errs = [];
      ['Firey','Leafy','Pencil','Puffball','Bow','Flower','Bubble','Blocky','Pen','Match','Ice Cube','Teardrop','Bomby','Rocky','Lightning','Fanny','Dora','Saw','Tennis Ball','Snowball','Book','Ruby'].forEach(function(nm){
        var A2 = makeFighter(ROSTER.find(function(r){ return r.name===nm; }), 400, groundY()-24, 0);
        A2.team=0; A2.controller='still'; A2.stocks=9; fighters[0] = A2; D.x = 550;
        A2.fsGlow = 900; fsTryFire(A2);
        for (var i=0;i<130;i+=5){ for (var k=0;k<5;k++) step(); try{ draw(); }catch(e){ errs.push(nm+': '+e); } }
      });
      return errs;`);
    expect(r).toEqual([]);
  });
});

// The later batches (D onward) are built on the nine shapes (circle, lane, fan, rain, lock, pull, cols, orbit, hose): one suite for each, a row per fighter
// (name, id, a foe in the hit, a foe out of it; null: no such place), and one drawing sweep over the batch.
function batchSuite(title, rows){
  describe(title, () => {
    const play = (name, dx, pct) => arena(dx, `
      A.fsGlow = 900; fsTryFire(A); var id = A.fsId, kinds = {};
      for (var i = 0; i < 220; i++) { step(); if (A._atkKind) kinds[A._atkKind] = 1; if (i > 170) { D.invuln = 0; } }
      var over = !A._fs && !A.fsId;
      return { id: id, over: over, hurt: D.pct !== ${pct} || D.stocks < 9, stocks: D.stocks, pct: D.pct, kinds: Object.keys(kinds) };`, { pct, a: name, ax: dx < 0 ? 800 : 130 });
    for (const [name, id, near, far] of rows) {
      it(name + ': ' + id + ' lands where its tell is, and ends cleanly', () => {
        const r = play(name, near, 60);
        expect(r.id).toBe(id);
        expect(r.over).toBe(true);
        expect(r.hurt, JSON.stringify(r)).toBe(true);
        expect(r.kinds.length, JSON.stringify(r)).toBeGreaterThan(0);
      });
      if (far !== null) it(name + ': ' + id + ' misses a foe outside it', () => {
        const r = play(name, far, 60);
        expect(r.hurt, JSON.stringify(r)).toBe(false);
      });
    }
    it('draws its tell and its blast with no error', () => {
      const { window: w } = loadMonolith();
      const names = JSON.stringify(rows.map(r => r[0]));
      const r = arenaIn(w, 150, `
        var errs = [];
        ${names}.forEach(function(nm){
          var A2 = makeFighter(ROSTER.find(function(r){ return r.name===nm; }), 400, groundY()-24, 0);
          A2.team=0; A2.controller='still'; A2.stocks=9; fighters[0] = A2; D.x = 550;
          A2.fsGlow = 900; fsTryFire(A2);
          for (var i=0;i<150;i+=10){ for (var k=0;k<10;k++) step(); try{ draw(); }catch(e){ errs.push(nm+': '+e); } }
        });
        return errs;`);
      expect(r).toEqual([]);
    });
  });
}
batchSuite("batch D", [
  ["Needle", "cutinhalf", 200, null],
  ["Pin", "popped", 250, 520],
  ["Coiny", "monitor", 200, -300],
  ["Golf Ball", "freezejuice", 250, 650],
  ["Fries", "fryfan", 200, -300],
  ["Gelatin", "jellyquake", 120, 500],
  ["Nickel", "sparechange", 250, null],
  ["Yellow Face", "buynow", 150, 600]
]);
batchSuite("batch E", [
  ["Barf Bag", "outbreak", 120, 520],
  ["Basketball", "nothingbutnet", 250, -300],
  ["Bell", "savedbythebell", 120, 520],
  ["Bracelety", "didicecubesee", 250, 560],
  ["Gaty", "swingopen", 120, 520],
  ["Grassy", "nobodysteps", 110, 600],
  ["Liy", "lightsout", 250, -300],
  ["Lollipop", "stickytrap", 150, 560]
]);
batchSuite("batch F", [
  ["Loser", "tlc", 100, 520],
  ["Marker", "permanentrecord", 200, -300],
  ["Money", "makeitrain", 250, null],
  ["Naily", "nailedit", 300, -300],
  ["Pillow", "fluffbounce", 100, 520],
  ["Remote", "signaljam", 120, 560],
  ["Rose", "thornlash", 250, 600],
  ["Taco", "retractablearms", 150, 560]
]);
batchSuite("batch G", [
  ["TV", "staticburst", 120, 560],
  ["Woody", "fraidystampede", 200, -300],
  ["Toothpaste", "enemynow", 220, -300],
  ["David", "awseriously", 120, 560],
  ["Firey Jr.", "sparkjr", 150, 800],
  ["Fern", "photosynthesis", 250, 600],
  ["Ruler", "exactmeasure", 250, -300],
  ["Sidewalky", "physically", 250, 560]
]);
batchSuite("batch H", [
  ["Balloony", "airleak", 300, -300],
  ["Roboty", "antennaspring", 150, 520],
  ["Profily", "cactus", 250, 560],
  ["Tree", "timber", 250, null],
  ["Cake", "cakeatstake", 300, -300],
  ["Donut", "sprinkleroll", 60, 220],
  ["Balloon", "tirade", 120, 600],
  ["Bomb", "literally", 100, 450]
]);
batchSuite("batch I", [
  ["Knife", "bagoftricks", 250, -300],
  ["Lightbulb", "brightflash", 120, 600],
  ["Paintbrush", "heatwaves", 250, 720],
  ["Taco (II)", "lemonspit", 250, -300],
  ["Marshmallow", "noway", 150, 640],
  ["Apple", "pencilthrow", 250, -300],
  ["Baseball", "groundpound", 250, 800],
  ["Pickle", "loadsofexperience", 250, 560]
]);
batchSuite("batch J", [
  ["Nickel (II)", "doublezinger", 120, 560],
  ["Paper", "pianos", 250, null],
  ["Microphone", "deafening", 300, -300],
  ["Salt", "shake", 250, -300],
  ["Test Tube", "glassup", 120, 600],
  ["Box", "everythingpacked", 250, 560],
  ["Trophy", "blackmail", 250, 560],
  ["Goo", "engulf", 70, 260]
]);
batchSuite("batch K", [
  ["Lifering", "sinker", 300, -300],
  ["Bonesaw", "cutstothecore", 250, 560],
  ["Spikey", "cantholditin", 200, null],
  ["Candle", "crystalchime", 120, 600],
  ["Cammy", "saycheese", 300, -300],
  ["Cheesy", "kicksoccerpun", 300, -300],
  ["Dough", "knockoff", 100, 560],
  ["Fan", "leaveusalone", 300, -300]
]);
batchSuite("batch L", [
  ["Soap", "scrubforhours", 60, 250],
  ["Tissues", "achoo", 250, -300],
  ["Yin-Yang", "yangthrowsyin", 250, 640],
  ["Starfruit", "onehitwonder", 120, 600],
  ["Blueberry", "palanquin", 250, 560],
  ["Cherries", "playdirty", 250, -300],
  ["Clover", "butterflies", 200, null],
  ["Jack", "knuckles", 250, 560]
]);
batchSuite("batch M", [
  ["Magnet", "likepolesrepel", 150, 600],
  ["MeTag", "barrierwalls", 160, 600],
  ["Poppy", "popcorn", 200, 800],
  ["Silver Spoon", "glowinggold", 100, 560],
  ["Tapey", "playback", 300, -300],
  ["Tea Kettle", "mamasgotcha", 200, 560],
  ["Teddy Bear", "ragesmash", 110, 560],
  ["Bot", "gotcha", 250, 560]
]);
