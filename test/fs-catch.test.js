import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';
import { makePair } from './helpers/net-pair.js';
import { mulberry32 } from './helpers/prng.js';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

// CATCH, THEN CINEMATIC. The owner, 2026-10-20: "and final smashes are baddddd" -- "they are hard to land WELL", "Hard to land", "Look
// boring". Chosen: "Catch, then cinematic" (a fast catch in a drawn area; whoever it catches is locked -- cannot move or act, cannot be
// hit by anyone else -- and the whole Final Smash plays on them; miss it and nothing locks), "Freeze + zoom intro" (the match pauses about
// half a second, the screen darkens, the camera closes in on the user, no words) and "Slow-mo KO" (a KO by a Final Smash plays slowed
// down, with a zoom). The KO-level numbers stay (FS_DMG_MULT, FS_KB, FS_KO_FIX).

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// A realm whose canvas counts the words drawn on it (fillText, strokeText) in window.__texts; drawing is otherwise a no-op.
function bootCounting() {
  const dom = new JSDOM(readFileSync('artifacts/V1/index.html', 'utf8'), {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(win) {
      win.__texts = 0;
      const grad = { addColorStop() {} };
      win.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
        get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 }) : p === 'canvas' ? { width: 1100, height: 720 }
          : p === 'getImageData' ? () => ({ data: [] })
          : (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createConicGradient' || p === 'createPattern') ? () => grad
          : (p === 'fillText' || p === 'strokeText') ? () => { win.__texts++; } : () => {}),
        set: () => true,
      });
      win.Math.random = mulberry32(5); win.requestAnimationFrame = () => 0; win.cancelAnimationFrame = () => {};
    },
  });
  dom.window.eval('BOT_PB.legacy = true; BOT_ADAPT.lock();');
  return dom.window;
}

// The holder (`a`; 'default': the default, forced on Coiny) and Pen `dx` px in front, on Goiky Field. Pen is a CPU from the moment the
// lock lets go of them having been hit (steering back, as the KO-level measure has it). `body` runs inside with A, D in scope.
const stageIn = (win, a, dx, pct, body, extra = '') => { win.Math.random = mulberry32(5); return win.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=2; SETTINGS.smashBalls=true; running=true;
  RACE.active=false; ONEFIGHT.active=false; COBSFIGHT.active=false; TESTMODE.active=false; BOSSRUSH.active=false; TOURNEY.active=false; TUT.active=false;
  CUSTOM_LEVEL=null; stage = STAGES.find(function(s){ return s.id==='goiky'; }); setupWorld();
  summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; itemTimer=1e9;
  var def = ${JSON.stringify(a)} === 'default', ax = WW/2 - ${dx};   // (Pen in the middle of the stage, as the KO-level measure has it)
  var A = makeFighter(ROSTER.find(function(r){ return r.name===(def ? 'Coiny' : ${JSON.stringify(a)}); }), ax, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ax + ${dx}, groundY()-24, 1);
  A.team=0; D.team=1; A.face=1; D.face=-1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9;
  if (def) A._fsForce = FS_DEFAULT;
  fighters=[A,D]; ${extra}
  hazardT=5; fsReset(); SMASHBALL=null; FS.next=99999;
  step();
  fighters.forEach(function(f){ f.invuln=0; f.hitstun=0; f.spCd=0; f.atkCd=0; f.armor=0; f.fnCd=0; f.vx=0; f.vy=0; });
  A.pct=0; D.pct=${pct}; D._dmgTaken=0;
  for (var k in down) down[k]=false;
  ${body}
})()`); };
const stage = (...args) => stageIn(W, ...args);

// Fire, and play it out: whether Pen was caught, held still while locked, let go, KO'd, and what they took.
const PLAY = `
  A.fsGlow = 900; fsTryFire(A);
  var id0 = A.fsId, wind = A.fsWind, ranT = 0;
  var total = FS_INTRO + FS_CATCH + A.fsDur, caught = false, still = true, lx = null, ly = null, hs = A.stocks, hp = A.pct, rel = false;
  for (var i = 0; i < total + 360 && D.stocks === 9; i++) {
    step();
    if (A._fs) ranT = Math.max(ranT, A._fs.t);
    if (D._fsLock) { caught = true; if (lx === null) { lx = D.x; ly = D.y; } }
    if (caught && !D._fsLock) rel = true;
    if (D._dmgTaken > 0 && D.controller === 'still' && !D._fsLock) D.controller = 'ai';
    if (A._fs || i <= total) { hs = A.stocks; hp = A.pct; }
  }
  var out = { id: id0, played: ranT >= wind, caught: caught, released: rel || D.stocks < 9, stuck: !!D._fsLock, ko: D.stocks < 9, dmg: Math.round(D._dmgTaken*10)/10, holder: [hs, Math.round(hp)] };
`;

describe('catch, then cinematic', () => {
  // one row of each kind: name, id, kind, a spot inside its catch area (Pen's distance in front), one outside it
  const sample = [
    ['David',     'awseriously', 'circle', 200, 420],
    ['Sidewalky', 'physically',  'lock',   300, 460],
    ['Tree',      'timber',      'rain',   300, 440],
    ['Needle',    'cutinhalf',   'lane',   400, -200],
    ['Fries',     'fryfan',      'fan',    300, -200],
    ['default',   'surge',       'default', 180, 330],
  ];
  for (const [name, id, kind, near, far] of sample) {
    it(`${name} (${kind}): the catch locks Pen, the whole Final Smash lands on them where they stand, KOs at 60%, and lets go`, () => {
      const r = stage(name, near, 60, PLAY + `
        // while locked: their own frame does not run (they stay put, they do not act), and nobody but the holder can hurt them
        return out;`);
      expect(r.id).toBe(id);
      expect(r.caught, JSON.stringify(r)).toBe(true);
      expect(r.ko, JSON.stringify(r)).toBe(true);
      expect(r.stuck).toBe(false);
      expect(r.holder).toEqual([9, 0]);
    });
    it(`${name} (${kind}): a missed catch locks nobody, and the Final Smash still plays (Pen ${Math.abs(far)} px ${far < 0 ? 'behind' : 'away'})`, () => {
      const r = stage(name, Math.abs(far), 60, (far < 0 ? 'D.x = A.x - ' + Math.abs(far) + '; D.face = 1;' : '') + PLAY + `
        out.fsRan = true; return out;`);
      expect(r.caught).toBe(false);
      expect(r.id).toBe(id);
      expect(r.played).toBe(true);   // (its tell and its hits, as today)
      expect(r.stuck).toBe(false);
    });
  }

  it('a locked foe stays put and cannot act, and nobody but the holder hurts them: a third fighter\'s swing and shot do nothing', () => {
    const r = stage('Golf Ball', 260, 30, `
      A.fsGlow = 900; fsTryFire(A);
      for (var i = 0; i < FS_INTRO + FS_CATCH + 4; i++) step();
      var locked = !!D._fsLock, x0 = D.x, y0 = D.y, p0 = D.pct;
      // the CPU would act if it could: its own frame does not run
      D.controller = 'ai'; D.vx = 9; D.vy = -9;
      var C = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), D.x + 60, groundY()-24, 2); C.team = 2; C.controller = 'still'; C.stocks = 9;
      fighters.push(C);
      hitCircle(C, D.x, D.y, 40, 20, 20, -14, -10);
      applyHit(D, 25, -10, -10, C);
      addProj({ owner:C.idx, ownerObj:C, x:D.x + 30, y:D.y, vx:-8, vy:0, grav:false, dmg:15, kb:12, r:14, color:'#fff', life:20 });
      var moved = 0, others = D.pct - p0;
      for (var k = 0; k < 8; k++){ step(); moved = Math.max(moved, Math.abs(D.x - x0) + Math.abs(D.y - y0)); }
      var hitByHolder = D.pct > p0;
      for (var j = 0; j < 200 && D._fsLock; j++) step();
      return { locked: locked, others: others, moved: moved, holderHits: hitByHolder, stuck: !!D._fsLock };`);
    expect(r.locked).toBe(true);
    expect(r.others).toBe(0);
    expect(r.moved).toBe(0);   // (Golf Ball's pin holds them on the mark where they were caught)
    expect(r.stuck).toBe(false);
  });

  it('defences: a dodge\'s invulnerability on the catch frame beats it; a counter stance does not (it is spent, as a Final Smash hit spends it)', () => {
    const dodge = stage('David', 200, 30, `
      A.fsGlow = 900; fsTryFire(A);
      for (var i = 0; i < FS_INTRO + FS_CATCH - 1; i++) step();
      D.invuln = 22;   // a dash's i-frames (case "dash")
      step();
      return { caught: !!D._fsLock };`);
    expect(dodge.caught).toBe(false);
    const counter = stage('David', 200, 30, `
      A.fsGlow = 900; fsTryFire(A);
      for (var i = 0; i < FS_INTRO + FS_CATCH - 1; i++) step();
      D.countering = 20;
      step();
      return { caught: !!D._fsLock, countering: D.countering };`);
    expect(counter).toEqual({ caught: true, countering: 0 });
    const grace = stage('David', 200, 30, `
      A.fsGlow = 900; fsTryFire(A);
      for (var i = 0; i < FS_INTRO + FS_CATCH - 1; i++) step();
      D.invuln = 12; D._graceLeft = 12;   // a hit's grace is not a dodge
      step();
      return { caught: !!D._fsLock };`);
    expect(grace.caught).toBe(true);
  });

  it('the lock always lets go: when the holder is KO\'d mid-Final-Smash, and when the Final Smash ends', () => {
    const r = stage('Teardrop', 250, 30, `
      A.fsGlow = 900; fsTryFire(A);
      for (var i = 0; i < FS_INTRO + FS_CATCH + 20; i++) step();
      var locked = !!D._fsLock;
      eliminate(A);
      var after = !!D._fsLock;
      step();
      return { locked: locked, after: after, after1: !!D._fsLock, holderFs: !!A._fs };`);
    expect(r).toEqual({ locked: true, after: false, after1: false, holderFs: false });
  });
});

describe('the intro: freeze + zoom', () => {
  it('stops the match for FS_INTRO frames (half a second): nothing moves or counts down but the camera and the darkening, then it resumes intact', () => {
    const r = stage('David', 200, 30, `
      var C = makeFighter(ROSTER.find(function(r){ return r.name==='Coiny'; }), A.x - 200, groundY()-140, 2); C.team = 2; C.controller = 'ai'; C.stocks = 9; C.vx = 5; C.vy = -4;
      fighters.push(C);
      addProj({ owner:C.idx, ownerObj:C, x:C.x, y:C.y, vx:6, vy:0, grav:false, dmg:5, kb:5, r:10, color:'#fff', life:200 });
      A.fsGlow = 900; fsTryFire(A);
      var snap = function(){ return JSON.stringify([hazardT, fighters.map(function(f){ return [f.x, f.y, f.vx, f.vy, f.pct, f.invuln, f.hitstun]; }), projectiles.map(function(p){ return [p.x, p.y, p.life]; })]); };
      var s0 = snap(), still = 0, zoomMid = null, freezeAt = [];
      for (var i = 0; i < FS_INTRO; i++){ freezeAt.push(FS.freeze); step(); if (snap() === s0) still++; if (i === 15){ var z = fsCamFocus(); zoomMid = z && { k: Math.round(z.k*100)/100, x: z.x === A.x, z: z.z }; } }
      var frozenThrough = still, fz = FS.freeze;
      step();
      var moved = snap() !== s0;
      return { intro: FS_INTRO, frozenThrough: frozenThrough, fz: fz, moved: moved, zoomMid: zoomMid, first: freezeAt[0], after: fsCamFocus() };`);
    expect(r.intro).toBe(30);   // ~0.5 s at 60 frames a second
    expect(r.frozenThrough).toBe(30);
    expect(r.fz).toBe(0);
    expect(r.moved).toBe(true);
    expect(r.zoomMid).toEqual({ k: 1, x: true, z: 1.55 });
    expect(r.first).toBe(30);
    expect(r.after).toBeNull();
  });

  it('draws with no error and no words: the darkening and their colour round the holder, the close-up, the catch area, the bind and the slow-mo', () => {
    const w = bootCounting();
    const r = stageIn(w, 'David', 200, 90, `
      var errs = [];
      function pic(){ window.__texts = 0; try { draw(); } catch(e) { errs.push(String(e)); } return window.__texts; }
      var base = pic(), most = 0, phases = {};
      A.fsGlow = 900; fsTryFire(A);
      for (var i = 0; i < 500 && D.stocks === 9; i++){
        step(); var n = pic(); most = Math.max(most, n);
        if (FS.freeze > 0) phases.intro = 1; if (A.fsC > 0 && !(FS.freeze > 0)) phases.catch = 1; if (D.fsLk) phases.lock = 1; if (FS.slow > 0) phases.slow = 1;
      }
      return { errs: errs, base: base, most: most, phases: Object.keys(phases).sort(), ko: D.stocks < 9 };`);
    expect(r.errs).toEqual([]);
    expect(r.phases).toEqual(['catch', 'intro', 'lock', 'slow']);
    expect(r.most).toBe(r.base);   // no words: the Final Smash, its intro, catch, bind and slow-mo add no text to the picture
    expect(r.ko).toBe(true);
  });
});

describe('the slow-mo KO', () => {
  it('a launch by a Final Smash that will carry the foe out plays at FS_SLOW.k speed for FS_SLOW.frames frames, then at normal speed', () => {
    const r = stage('David', 200, 90, `
      A.fsGlow = 900; fsTryFire(A);
      for (var i = 0; i < 400 && !(FS.slow > 0); i++) step();
      var startedAt = i, sf = FS.sf, len = FS.slow, ran = 0, h0 = hazardT, sx0 = FS.sx, sy0 = FS.sy, held = true, x0 = D.x, y0 = D.y, skipsOk = true, blendOk = true;
      // (the picture blends the slowed steps: fsSlowSkips says which step will not run, fsSlowBlend how far it is to the next)
      for (var j = 0; j < len; j++){ var h = hazardT, sk = fsSlowSkips(); step(); if (hazardT !== h) ran++; if (sk !== (hazardT === h)) skipsOk = false; var b = fsSlowBlend(); if (FS.slow > 0 && !(b >= 0 && b < 1)) blendOk = false; if (FS.sx !== sx0 || FS.sy !== sy0) held = false; }
      var flew = Math.round(Math.hypot(D.x - x0, D.y - y0));
      var slowOver = FS.slow, h1 = hazardT, normal = 0;
      for (var k = 0; k < 30; k++){ var h2 = hazardT; step(); if (hazardT === h2 + 1) normal++; }
      for (var q = 0; q < 400 && D.stocks === 9; q++) step();
      return { started: startedAt < 400, sf: sf, held: held, flew: flew > 100, len: len, ran: ran, skipsOk: skipsOk, blendOk: blendOk, after: fsSlowBlend(), slowOver: slowOver, normal: normal, ko: D.stocks < 9 };`);
    expect(r.started).toBe(true);
    expect(r.sf).toBe(1);   // the camera's close-up is on the launched foe...
    expect([r.held, r.flew]).toEqual([true, true]);   // ...held on the spot the blow landed while they fly on out of it
    expect(r.len).toBe(60);
    expect(r.ran).toBe(15);   // 60 frames at 0.25: 15 steps of the match
    expect(r.skipsOk).toBe(true);
    expect(r.blendOk).toBe(true);
    expect(r.after).toBeNull();
    expect(r.slowOver).toBe(0);
    expect(r.normal).toBe(30);
    expect(r.ko).toBe(true);
  });

  it('a hit that does not carry the foe out plays at normal speed', () => {
    const r = stage('David', 200, 0, PLAY + `out.slowSeen = false; return out;`);
    expect(r.ko).toBe(false);
    const s = stage('David', 200, 0, `
      A.fsGlow = 900; fsTryFire(A); var seen = false;
      for (var i = 0; i < 300; i++){ step(); if (FS.slow > 0) seen = true; }
      return { seen: seen };`);
    expect(s.seen).toBe(false);
  });
});

describe('the CPU fires when the catch will land', () => {
  it('holds while no foe is in the catch area, fires once one is well inside it', () => {
    const r = stage('Needle', 300, 30, `
      A.controller = 'ai'; A.fsGlow = 900;
      var blank = function(){ return {left:false,right:false,jump:false,attack:false,special:false,smash:false,up:false}; };
      var out = {};
      D.x = A.x - 200; out.behind = !!fsBotInput(A, blank()).fin;   // Needle's lane runs ahead of her
      D.x = A.x + 400; out.ahead = !!fsBotInput(A, blank()).fin;
      D.x = A.x + 400; D.y = A.y - 200; out.above = !!fsBotInput(A, blank()).fin;   // over the lane
      return out;`);
    expect(r).toEqual({ behind: false, ahead: true, above: false });
  });
});

describe('online (the test stubs: a host realm and a client realm joined by fake sockets; never the live relay)', () => {
  it('the host decides; the snapshot carries the intro, the catch area, the lock and the slow-mo, and a client draws them', async () => {
    const p = await makePair({ mode: 'ffa', stageId: 'goiky', count: 2 });   // the host plays Pen (0), the client Firey (1)
    for (let i = 0; i < 8; i++) p.frame();
    p.Hh.eval(`(function(){ var A = fighters[0], D = fighters[1]; A.x = WW/2 - 150; D.x = WW/2 + 100; A.y = groundY() - A.r; D.y = groundY() - D.r;
      A.vx = A.vy = D.vx = D.vy = 0; A.face = 1; D.pct = 90; D.invuln = 0; A.fsGlow = 900; fsTryFire(A); })()`);
    const seen = { freeze: 0, maxFreeze: 0, art: 0, artLive: 0, fsC: 0, lock: 0, slow: 0, zoom: 0, errs: [] };
    let wire = null;
    for (let i = 0; i < 420; i++) {
      p.frame();
      if (!wire) { const s = p.Hh.eval('JSON.parse(JSON.stringify(serializeState(false)))'); if (s.fsx) wire = { fsx: s.fsx, fsC: s.fighters[0].fsC }; }
      const c = p.Cc.eval(`(function(){ var A = fighters[0], D = fighters[1], e = [];
        try { draw(); } catch(err) { e.push(String(err)); }
        return { fz: FS.freeze, fzWho: FS.fz, art: HIT_ART.filter(function(h){ return h.o === 0 && h.sh.kind === 'box' && Math.abs(h.sh.w - 840) < 1; }).map(function(h){ return h.m; }),
          fsC: A ? A.fsC || 0 : 0, lk: D ? D.fsLk || 0 : 0, slow: FS.slow, zoom: !!FS_VIEW.on, errs: e }; })()`);
      if (c.fz > 0) { seen.freeze++; seen.maxFreeze = Math.max(seen.maxFreeze, c.fz); if (c.fzWho !== 0) seen.errs.push('who ' + c.fzWho); }
      if (c.art.includes('t')) seen.art++;
      if (c.art.includes('l')) seen.artLive++;
      if (c.fsC > 0) seen.fsC++;
      if (c.lk === 1) seen.lock++;
      if (c.slow > 0) seen.slow++;
      if (c.zoom) seen.zoom++;
      seen.errs.push(...c.errs);
    }
    expect(wire.fsx[0]).toBeGreaterThan(0);   // [frames of the intro left, whose, slow-mo left, its foe, x, y]
    expect(wire.fsx[1]).toBe(0);
    expect(wire.fsC).toBe(10);
    expect(seen.errs).toEqual([]);
    expect(seen.freeze).toBeGreaterThanOrEqual(25);   // the client sees the stop (and closes in) for about the host's 30 frames
    expect(seen.maxFreeze).toBeLessThanOrEqual(30);
    expect(seen.art).toBeGreaterThan(20);              // the catch area, dashed, filling in...
    expect(seen.artLive).toBeGreaterThan(0);           // ...and on the frame it lands
    expect(seen.fsC).toBeGreaterThan(0);
    expect(seen.lock).toBeGreaterThan(10);             // Firey, locked (fsLk: the host's idx 0, +1)
    expect(seen.slow).toBeGreaterThan(40);             // and the slow-mo KO, closing in on them
    expect(seen.zoom).toBeGreaterThan(40);
    expect(p.Hh.eval('fighters[1].stocks')).toBe(2);
  }, 240000);
});

// THE ALL-ROW MEASURE. Every Final Smash (the 102 rows, and the default, which only the hidden prize fighters play: here forced on
// Coiny), on Pen in the middle of Goiky Field, the holder behind them at the KO-level measure's distance (its report,
// reports/moves/final-smash-ko.md; moved into the catch area where that spot is outside it): caught at 60%, the whole Final Smash lands
// and carries them out; caught at 0%, it deals its KO-level damage (pinned, the whole row, times the holder's dmg stat) and they stay
// in; the lock always lets go; the holder is never hurt by it (Bomby and Bomb pay their own price, as before).
const ALL_ROWS = [
  ["Firey", 110, 30],
  ["Leafy", 200, 48],
  ["Pencil", 200, 40],
  ["Puffball", 150, 44],
  ["Bow", 300, 72],
  ["Flower", 200, 58.2],
  ["Bubble", 150, 44],
  ["Blocky", 200, 80],
  ["Pen", 250, 60],
  ["Match", 200, 48],
  ["Ice Cube", 200, 52],
  ["Teardrop", 250, 100],
  ["Bomby", 120, 70.7],
  ["Rocky", 150, 96],
  ["Lightning", 250, 28],
  ["Fanny", 120, 32],
  ["Dora", 80, 95.6],
  ["Saw", 60, 105],
  ["Tennis Ball", 380, 60],
  ["Snowball", 200, 71.4],
  ["Book", 250, 52],
  ["Ruby", 380, 56],
  ["Needle", 200, 44],
  ["Pin", 250, 58.2],
  ["Coiny", 200, 72],
  ["Golf Ball", 250, 76],
  ["Fries", 200, 36],
  ["Gelatin", 120, 36],
  ["Nickel", 250, 48],
  ["Yellow Face", 150, 32],
  ["Barf Bag", 120, 32],
  ["Basketball", 250, 48],
  ["Bell", 120, 24],
  ["Bracelety", 250, 72],
  ["Gaty", 120, 36],
  ["Grassy", 110, 28],
  ["Liy", 250, 52],
  ["Lollipop", 150, 44],
  ["Loser", 100, 40],
  ["Marker", 200, 40],
  ["Money", 250, 26],
  ["Naily", 300, 72],
  ["Pillow", 100, 32],
  ["Remote", 120, 28],
  ["Rose", 250, 72],
  ["Taco", 150, 44],
  ["TV", 120, 26],
  ["Woody", 200, 30],
  ["Toothpaste", 220, 56],
  ["David", 120, 44],
  ["Firey Jr.", 150, 36],
  ["Fern", 250, 68],
  ["Ruler", 250, 28],
  ["Sidewalky", 250, 58.8],
  ["Balloony", 300, 32],
  ["Roboty", 150, 20.8],
  ["Profily", 250, 48],
  ["Tree", 250, 37.4],
  ["Cake", 300, 96],
  ["Donut", 60, 68],
  ["Balloon", 120, 28],
  ["Bomb", 100, 49.9],
  ["Knife", 250, 78],
  ["Lightbulb", 120, 28],
  ["Paintbrush", 250, 24],
  ["Taco (II)", 250, 36],
  ["Marshmallow", 150, 30],
  ["Apple", 250, 72],
  ["Baseball", 250, 36],
  ["Pickle", 250, 48],
  ["Nickel (II)", 120, 28],
  ["Paper", 250, 48],
  ["Microphone", 300, 32],
  ["Salt", 250, 32],
  ["Test Tube", 120, 28],
  ["Box", 250, 64],
  ["Trophy", 250, 44],
  ["Goo", 70, 72],
  ["Lifering", 300, 34],
  ["Bonesaw", 250, 79],
  ["Spikey", 60, 25.2],
  ["Candle", 120, 26],
  ["Cammy", 300, 44],
  ["Cheesy", 300, 72],
  ["Dough", 100, 36],
  ["Fan", 300, 40],
  ["Soap", 60, 80],
  ["Tissues", 60, 66],
  ["Yin-Yang", 250, 30],
  ["Starfruit", 120, 48],
  ["Blueberry", 250, 45.8],
  ["Cherries", 250, 28],
  ["Clover", 200, 48],
  ["Jack", 250, 76],
  ["Magnet", 150, 40],
  ["MeTag", 160, 24],
  ["Poppy", 200, 36],
  ["Silver Spoon", 100, 40],
  ["Tapey", 300, 40],
  ["Tea Kettle", 200, 70],
  ["Teddy Bear", 110, 52],
  ["Bot", 250, 64],
  ["default", 60, 56],
];
describe('every Final Smash, caught (the all-row measure)', () => {
  for (const [name, dx, dmg] of ALL_ROWS) it(`${name}: caught at 60% it KOs; caught at 0% it deals ${dmg}% and does not`, () => {
    const hi = stage(name, dx, 60, PLAY + 'return out;'), lo = stage(name, dx, 0, PLAY + 'return out;');
    expect([hi.caught, lo.caught], JSON.stringify([hi, lo])).toEqual([true, true]);
    expect(hi.ko, JSON.stringify(hi)).toBe(true);
    expect(lo.ko, JSON.stringify(lo)).toBe(false);
    expect(lo.dmg).toBe(dmg);
    expect([hi.stuck, lo.stuck, lo.released]).toEqual([false, false, true]);
    expect([hi.holder[0], lo.holder[0]]).toEqual([9, 9]);
    if (name !== 'Bomby' && name !== 'Bomb') expect([hi.holder[1], lo.holder[1]]).toEqual([0, 0]);
  });
});
