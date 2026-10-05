import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// BOSSES KEEP A HIT-GRACE FOR EACH ATTACKING CHARACTER. The owner, 2026-10-04: "give bosses by-character iframes". The question
// it answered: fans and rings fire all their shots at once; against a FIGHTER, post-hit grace stops all but the first shot, but a
// boss is big and takes every one (Money's coin spray 72 on a boss against 33 on a fighter, Ice Cube's ring 40 against 5,
// Starfruit 56, Roboty 51). So after character X lands a hit on a boss, X's further hits do not land on it until X's grace runs
// out -- as long as the grace a fighter gets from the same hit (stampHit) -- and every OTHER character still lands. The exceptions
// are the fighter's own (graceBlocks: a move built to tick lands through the grace its own earlier hits opened; chainOpen: a new
// move follows up through an open chain, three links), because the boss asks the same functions about a stand-in with a
// fighter's own fields (bossGraceRec). The character is the fighter, the reflector of a turned-back shot, or an assist trophy.
// Damage numbers do not change; the `once` sets and each move's own hit sets stay, as a second guard.

let W;
beforeAll(async () => {
  W = bootMonolith();
  await W.eval('profileReady');
  W.eval('updateHUD = function(){}; updateStandings = function(){};');   // the HUD only rewrites the page, and in jsdom that gets slower every frame
});

// The stage every test uses: Boss Rush rules and a plain stationary boss with a million HP, put back where it stood after every
// frame so a knock never carries it out of a hitbox. `fighter(name, x, team, face, idx)` makes an attacker (team 0) or, with team 1,
// a dummy fighter to read what the same hit does to a fighter. `body` runs on the stage and returns what to report.
const PRE = `
  SETTINGS.mode = 'boss'; SETTINGS.count = 2; SETTINGS.items = false; SETTINGS.itemRate = 0; SETTINGS.stocks = 99; running = true; paused = false;
  BOSSRUSH = { active:false, bossIdx:0, cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats = []; summons = []; projectiles = []; beams = []; tendrils = []; items = []; particles = []; impactFxClear(); hazardT = 0;
  var gy = groundY(), HP = 1e6;
  var none = function(){ return { left:false, right:false, up:false, down:false, jump:false, attack:false, special:false, smash:false }; };
  var fighter = function(name, x, team, face, idx){ var f = makeFighter(ROSTER.find(function(r){ return r.name === name; }), x, gy - 24, idx || 0);
    f.team = team || 0; f.controller = 'still'; f.stocks = 99; f.face = face || 1; f.y = gy - f.r; f.onground = true; return f; };
  var boss = function(x){ var b = makeBossSummon({ name:'Dummy Boss', color:'#9a9aff', attack:'basic', big:2.5, stationary:true }, HP);
    b.hp = b.maxHp = HP; b._atkTimer = 1e9; summons.push(b); b.x = x; b.y = gy - b.r; return b; };
  var lost = function(b){ return +(HP - b.hp).toFixed(3); };
  var calm = function(f){ f.invuln = 0; f.pct = 0; f.atkCd = 0; f.spCd = 0; f.smCd = 0; f.fnCd = 0; f.hitstun = 0; };
  // a target for the attacker: the boss (who === 'boss') or a fighter dummy standing where a boss would, pinned after every frame
  var target = function(who, A, bossX, dummyX){
    var t; if(who === 'boss'){ fighters = [A]; t = boss(bossX); } else { t = fighter('Pen', dummyX, 1, -1, 1); fighters = [A, t]; }
    var home = who === 'boss' ? bossX : dummyX;
    t.park = function(){ t.x = home; t.y = gy - (who === 'boss' ? t.r : 24); t.vx = 0; t.vy = 0; if(who === 'boss'){ t._atkTimer = 1e9; t._tel = 0; } else { t.dead = false; t.onground = true; } };
    t.val = function(){ return who === 'boss' ? lost(t) : +t.pct.toFixed(3); };
    t.park(); step(); t.park(); calm(A); if(who !== 'boss') calm(t);
    return t;
  };
`;
const stage = (body) => JSON.parse(W.eval(`JSON.stringify((function(){ ${PRE} ${body} })())`));
const J = JSON.stringify;

// One move, by the door the game uses, against a boss and against a fighter standing where the boss stands.
const FIRE = { jab: 'doAttack(f)', special: 'fireSpecial(f, none())', smash: 'fireSmash(f, none(), 0)', finisher: 'doAttackSpecial(f)' };
const volley = (name, move, who, staging) => stage(`
  var f = fighter(${J(name)}, 300, 0, 1), bx = f.x + f.r + 85 + 6;
  var t = target(${J(who)}, f, ${J(staging)} === 'inside' ? f.x + 30 : bx, ${J(staging)} === 'inside' ? f.x + 30 : f.x + f.r + 24 + 6);
  var hits = 0, last = 0;
  ${FIRE[move]};
  if(t.val() > 0){ hits++; last = t.val(); }
  for(var i = 0; i < 150; i++){ step(); t.park(); if(t.val() > last + 1e-9){ hits++; last = t.val(); } }
  return { total: t.val(), hits: hits };
`);

describe('a volley lands on a boss about as it lands on a fighter ("give bosses by-character iframes")', () => {
  // [fighter, move, what a boss took of it before this change, in this staging (Money's and Ice Cube's ring are the owner's own numbers)]
  const OLD = [['Money', 'smash', 72], ['Ice Cube', 'special', 40], ['Ice Cube', 'smash', 30], ['Starfruit', 'smash', 28], ['Roboty', 'smash', 34],
    ['Fries', 'finisher', 30], ['Pen', 'finisher', 27], ['Spikey', 'special', 24], ['Naily', 'special', 24], ['Salt', 'special', 18]];
  it.each(OLD)('%s\'s %s: a boss takes at most twice what a fighter takes (it took %i before)', (name, move, before) => {
    const boss = volley(name, move, 'boss', 'inside'), fighter = volley(name, move, 'fighter', 'inside');
    expect(fighter.total, 'the fighter took its one shot').toBeGreaterThan(0);
    expect(boss.total, `a boss, against a fighter's ${fighter.total}`).toBeLessThanOrEqual(2 * fighter.total + 1e-6);
    expect(boss.total, `against ${before} before`).toBeLessThan(before / 1.5);
  });

  it('Money\'s coin spray on a boss is one coin of 24 (a fan of three took 72), the number a fighter takes of it', () => {
    const boss = volley('Money', 'smash', 'boss', 'inside'), fighter = volley('Money', 'smash', 'fighter', 'inside');
    expect(fighter.total).toBe(24);
    expect(boss.total).toBe(24);
  });

  it('Ice Cube\'s ring on a boss is at most two of its shards, not all eight (40 before; a fighter takes one of 5)', () => {
    const boss = volley('Ice Cube', 'special', 'boss', 'inside'), fighter = volley('Ice Cube', 'special', 'fighter', 'inside');
    expect(fighter.total).toBe(5);
    // a shard still inside the 170 px body when the grace runs out lands too: a boss is a bigger place to be in
    expect(boss.total).toBeLessThanOrEqual(10);
  });
});

describe('who a boss keeps a grace for ("give bosses by-character iframes")', () => {
  it('two different fighters hitting the same boss in the same frame both land', () => {
    const r = stage(`
      var A = fighter('Pen', 300, 0, 1, 0), B = fighter('Coiny', 330, 0, 1, 1); fighters = [A, B]; var b = boss(420);
      step(); calm(A); calm(B);
      hitCircle(A, b.x - 60, b.y, 100, 7, 7, 3, -3);
      var afterA = lost(b);
      hitCircle(B, b.x - 60, b.y, 100, 7, 7, 3, -3);
      var afterB = lost(b);
      hitCircle(A, b.x - 60, b.y, 100, 7, 7, 3, -3);       // A again, the same frame: inside A's own grace
      return { afterA: afterA, afterB: afterB, afterA2: lost(b) };
    `);
    expect(r.afterA, 'the first fighter').toBe(7);
    expect(r.afterB, 'the second, in the same frame').toBe(14);
    expect(r.afterA2, 'the first again, in the same frame').toBe(14);
  });

  it('the same fighter\'s second hit inside its grace does not land, and after the grace it does', () => {
    const r = stage(`
      var A = fighter('Pen', 300, 0, 1, 0); fighters = [A]; var b = boss(420);
      step(); calm(A); A._atkSeq = 5;                        // one move throughout: only the grace decides
      var hit = function(){ var h = lost(b); hitCircle(A, b.x - 60, b.y, 100, 5, 5, 3, -3); return +(lost(b) - h).toFixed(3); };
      var grace = hitGraceFrames(5, A), out = [hit()];       // frame 0: lands
      for(var k = 1; k <= grace + 1; k++){ step(); out.push(hit()); }
      return { grace: grace, out: out };
    `);
    expect(r.grace, 'a 5-damage hit gives 12 frames of grace').toBe(12);
    expect(r.out[0], 'the first hit').toBe(5);
    for (let k = 1; k < r.grace; k++) expect(r.out[k], `frame ${k}, inside the grace`).toBe(0);
    expect(r.out[r.grace], `frame ${r.grace}, the grace is over`).toBe(5);
    expect(r.out[r.grace + 1], 'and that hit opened the next grace').toBe(0);
  });

  it('the grace is as long as the grace a fighter gets from the same hit, light or heavy, and so is the stun a chain is measured by', () => {
    const r = stage(`
      var A = fighter('Pen', 300, 0, 1, 0), T = fighter('Coiny', 900, 1, -1, 1); fighters = [A, T]; var b = boss(420), out = {};
      [5, 18, 60].forEach(function(d){
        T.invuln = 0; T._graceLeft = 0; T.hitstun = 0; applyHit(T, d, 0, 0, A, {shot:1});
        var R = bossGraceRec(b, A, true); R.invuln = 0; R._graceLeft = 0; R.hitstun = 0; bossGraceNote(b, A, d);
        out[d] = { fighter: T.invuln, boss: R.invuln, fighterStun: T.hitstun, bossStun: R.hitstun };
      });
      return out;
    `);
    for (const d of [5, 18, 60]) {
      expect(r[d].boss, `grace of a ${d}-damage hit`).toBe(r[d].fighter);
      expect(r[d].bossStun, `hitstun of a ${d}-damage hit`).toBe(r[d].fighterStun);
    }
    expect(r[60].boss, 'capped at 24, as a fighter\'s is').toBe(24);
  });

  it('an assist trophy\'s hit does not use up its owner\'s grace, nor the owner\'s the trophy\'s', () => {
    const r = stage(`
      var f = fighter('Firey', 300, 0, 1, 0); fighters = [f]; var b = boss(420);
      step(); calm(f);
      var a = summonAssistNamed(f, ASSIST_ROSTER.find(function(x){ return x.act === 'rush'; }));
      var a2 = summonAssistNamed(f, ASSIST_ROSTER.find(function(x){ return x.act === 'crush'; }));
      var d = function(fn){ var h = lost(b); fn(); return +(lost(b) - h).toFixed(3); };
      var out = [];
      out.push(d(function(){ assistHitSummon(a, b, 15, false); }));                      // the trophy's hit lands
      out.push(d(function(){ damageSummon(f, b, b.x - 60, b.y, 6); }));                  // the owner's, the same frame: lands
      out.push(d(function(){ assistHitSummon(a, b, 15, false); }));                      // the same trophy again: inside its own grace
      out.push(d(function(){ assistHitSummon(a2, b, 21, false); }));                     // another trophy: its own character
      out.push(d(function(){ damageSummon(f, b, b.x - 60, b.y, 6); }));                  // the owner again: inside the owner's grace
      return { out: out, keys: Object.keys(b._grace).length };
    `);
    expect(r.out[0], 'the trophy lands').toBe(15);
    expect(r.out[1], 'the owner lands, whatever the trophy just did').toBe(6);
    expect(r.out[2], 'the same trophy, inside its own grace').toBe(0);
    expect(r.out[3], 'a second trophy is another character').toBe(21);
    expect(r.out[4], 'the owner, inside its own grace').toBe(0);
    expect(r.keys, 'the owner and two trophies').toBe(3);
  });

  it('a shot that finds its owner\'s grace running goes on through the boss unspent; another fighter\'s shot lands at once', () => {
    const r = stage(`
      var A = fighter('Pen', 300, 0, 1, 0), B = fighter('Coiny', 330, 0, 1, 1); fighters = [A, B]; var b = boss(420);
      step(); calm(A); calm(B);
      var shot = function(who){ addProj({ owner:who.idx, ownerObj:who, x:b.x, y:b.y - 10, vx:0, vy:0, kb:2, dmg:6, r:8, life:200, color:'#fff' }); };
      shot(A); shot(A); shot(B);                             // two of A's and one of B's, all inside the boss at once
      step();
      return { lost: lost(b), live: projectiles.filter(function(p){ return p.life > 0; }).length };
    `);
    // A's first shot lands and is spent; A's second goes through unspent (A's grace); B's lands (its own grace) and is spent
    expect(r.lost, 'one of A\'s and one of B\'s').toBe(12);
    expect(r.live, 'A\'s second shot is still in the air').toBe(1);
  });

  it('a shot Gaty turns back at a boss is Gaty\'s: it opens her grace on the boss, and no one else\'s', () => {
    const r = stage(`
      var G = fighter('Gaty', 300, 0, 1, 0), A = fighter('Pen', 200, 0, 1, 1); fighters = [G, A]; var b = boss(520);
      step(); calm(G); calm(A); G.reflecting = 60;
      // a boss's shot (its owner is the boss's {team:-1, idx:-2}) comes at Gaty: she turns it, and it is hers from then on
      addProj({ owner:-2, ownerObj:{ team:-1, idx:-2 }, x:G.x + 6, y:G.y, vx:-6, vy:0, kb:2, dmg:6, r:8, life:200, color:'#fff' });
      var p = projectiles[projectiles.length - 1];
      step(); b.x = 520; b.vx = 0; b._atkTimer = 1e9;
      var turned = { owner: p.owner, hers: p.ownerObj === G, reflected: !!p.reflected };
      for(var i = 0; i < 60 && lost(b) === 0; i++){ step(); b.x = 520; b.vx = 0; b._atkTimer = 1e9; }
      var first = lost(b), gHit, aHit;
      var d = function(fn){ var h = lost(b); fn(); return +(lost(b) - h).toFixed(3); };
      gHit = d(function(){ hitCircle(G, b.x - 60, b.y, 140, 6, 6, 3, -3, null, null, null); });   // Gaty's own: inside her grace
      aHit = d(function(){ hitCircle(A, b.x - 60, b.y, 140, 6, 6, 3, -3, null, null, null); });   // Pen's: his own grace, lands
      return { turned: turned, first: first, gHit: gHit, aHit: aHit, keys: Object.keys(b._grace) };
    `);
    expect(r.turned).toEqual({ owner: 0, hers: true, reflected: true });
    expect(r.first, 'the turned shot reached the boss').toBe(6);
    expect(r.keys.slice().sort(), 'the grace it opened is Gaty\'s (idx 0), not the boss\'s own (-2)').toEqual(['0', '1']);
    expect(r.gHit, 'Gaty\'s own hit, the same move, inside the grace her turned shot opened').toBe(0);
    expect(r.aHit, 'another character lands').toBe(6);
  });
});

describe('what a boss lets through a grace, as a fighter does ("give bosses by-character iframes")', () => {
  // The same series of swings on a boss and on a fighter standing where it stands; the frames each one landed on must be the same.
  const series = (who, swings) => stage(`
    var A = fighter('Coiny', 300, 0, 1, 0);
    var t = target(${J(who)}, A, 300 + A.r + 85 + 6, 300 + A.r + 24 + 6);
    var at = ${J(swings)}, landed = [], last = 0;
    for(var i = 0; i < 60; i++){
      if(at.indexOf(i) >= 0){ A.atkCd = 0; A.hitstun = 0; doAttack(A); }
      if(t.val() > last + 1e-9){ landed.push(i); last = t.val(); }
      step(); t.park();
      if(t.val() > last + 1e-9){ landed.push(i + 0.5); last = t.val(); }
    }
    return { landed: landed, total: t.val() };
  `);

  it('a jab chain follows up on a boss as on a fighter: the same swings land, the rest wait out the grace', () => {
    const swings = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30];
    const boss = series('boss', swings), fighter = series('fighter', swings);
    expect(fighter.landed.length, 'a fighter takes the first jab and the links that follow it').toBeGreaterThanOrEqual(3);
    expect(fighter.landed.length, 'and not every one of eleven').toBeLessThan(swings.length);
    expect(boss.landed, 'the same frames on a boss').toEqual(fighter.landed);
    expect(boss.total, 'the same number').toBeCloseTo(fighter.total, 5);
  });

  it('a hitbox that lands again with nothing new in it does not follow up through the grace; a new move does', () => {
    const r = stage(`
      var A = fighter('Pen', 300, 0, 1, 0); fighters = [A]; var b = boss(420);
      step(); calm(A); A._atkSeq = 5;
      var hit = function(){ var h = lost(b); hitCircle(A, b.x - 60, b.y, 100, 5, 5, 3, -3); return +(lost(b) - h).toFixed(3); };
      var first = hit(); step(); var again = hit();          // the same _atkSeq: the one hitbox re-landing
      A._atkSeq = 6; step(); var next = hit();               // a new move, inside the stun the first hit gave
      return [first, again, next];
    `);
    expect(r).toEqual([5, 0, 5]);
  });

  it('a chain is the first hit and three links on a boss as on a fighter: the next new move inside the grace is turned away', () => {
    const chain = (who) => stage(`
      var A = fighter('Pen', 300, 0, 1, 0), t = target(${J(who)}, A, 420, 354), out = [];
      for(var k = 0; k < 6; k++){ A._atkSeq = (A._atkSeq || 0) + 1; var h = t.val(); hitCircle(A, t.x - 20, t.y, 100, 3, 3, 3, -3); out.push(+(t.val() - h).toFixed(3)); step(); t.park(); }
      return out;
    `);
    const fighter = chain('fighter'), boss = chain('boss');
    expect(fighter.slice(0, 5), 'a fighter: the first hit, three links, then the grace').toEqual([3, 3, 3, 3, 0]);
    expect(boss, 'a boss: the same').toEqual(fighter);
  });

  it('Saw\'s aura ticks on a boss as on a fighter: the same frames, six apart, each through its own grace', () => {
    const run = (who) => stage(`
      var A = fighter('Saw', 300, 0, 1, 0), t = target(${J(who)}, A, 300 + A.r + 85 + 6, 330);
      fireSpecial(A, none());
      var frames = [], last = t.val(); if(last > 0) frames.push(-1);
      for(var i = 0; i < 80; i++){ step(); t.park(); A.x = 300; A.vx = 0; if(t.val() > last + 1e-9){ frames.push(i); last = t.val(); } }
      return { frames: frames, total: t.val() };
    `);
    const boss = run('boss'), fighter = run('fighter');
    expect(fighter.frames.length, 'the aura ticks on a fighter').toBeGreaterThanOrEqual(5);
    expect(boss.frames, 'on a boss: the same frames').toEqual(fighter.frames);
    for (let i = 1; i < boss.frames.length; i++) expect(boss.frames[i] - boss.frames[i - 1], 'six frames apart').toBe(6);
    expect(boss.total, 'the same number, 4 a tick').toBeCloseTo(fighter.total, 5);
  });

  it('Naily\'s dash and her jab back both land on a boss, as on a fighter (the jab back through the dash\'s grace)', () => {
    const run = (who) => stage(`
      var A = fighter('Naily', 300, 0, 1, 0), t = target(${J(who)}, A, 440, 400);
      fireSmash(A, none(), 0);
      var landed = [], prev = t.val();
      for(var i = 0; i < 60; i++){ step(); t.park(); var v = t.val(); if(v - prev > 1) landed.push(Math.round(v - prev)); prev = v; }   // (bleed on the fighter is a fraction a frame: only a hit is a whole one)
      return landed;
    `);
    const fighter = run('fighter'), boss = run('boss');
    expect(fighter.length, 'the fighter takes the dash and the jab back').toBe(2);
    expect(boss, 'the boss takes both, the same numbers').toEqual(fighter);
  });
});

describe('moves built to tick land on a boss as they land on a fighter ("give bosses by-character iframes")', () => {
  // A flurry with a set count lands every hit through the grace its own earlier hits opened (graceBlocks); the boss asks the same question.
  const tick = (name, move, who) => stage(`
    var f = fighter(${J(name)}, 300, 0, 1, 0), t = target(${J(who)}, f, 330, 336), frames = [], prev = t.val();
    ${FIRE[move]};
    if(t.val() > prev + 1e-9){ frames.push(-1); prev = t.val(); }
    for(var i = 0; i < 90; i++){ step(); t.park(); var v = t.val(); if(v > prev + 1e-9) frames.push(i); prev = v; }
    return { frames: frames, total: t.val() };
  `);
  it.each([['Needle', 'jab'], ['Dora', 'special']])('%s\'s %s, a flurry with a set count, lands the same hits on the same frames on a boss as on a fighter', (name, move) => {
    const boss = tick(name, move, 'boss'), fighter = tick(name, move, 'fighter');
    expect(fighter.frames.length, 'a fighter takes the whole count').toBeGreaterThanOrEqual(3);
    expect(boss.frames, 'the same frames').toEqual(fighter.frames);
    expect(boss.total, 'the same number').toBeCloseTo(fighter.total, 5);
  });
});

describe('what a boss turns away opens no grace, and the record does not pile up ("give bosses by-character iframes")', () => {
  it('Two ungrounded turns a hit away, and the first hit after he is grounded lands at once: nothing was opened', () => {
    const r = stage(`
      BOSSRUSH.bossIdx = BOSS_ROSTER.findIndex(function(x){ return x.name === 'Two'; });
      var f = fighter('Firey', 300, 0, 1, 0); fighters = [f]; spawnBossRushBoss();
      var b = summons.find(function(s){ return s.type === 'boss'; }); b.hp = b.maxHp * 0.2; b._atkTimer = 1e9;
      step(); step(); step(); b._groundT = 0; b._grounded = false;
      var out = { ungrounded: !!b._ungrounded };
      var d = function(){ var h = b.hp; damageSummon(f, b, b.x, b.y, 9); return h - b.hp; };
      out.turned = d();
      out.records = b._grace ? Object.keys(b._grace).length : 0;
      b._groundT = 120; step(); out.grounded = !!b._grounded;
      out.lands = d();
      return out;
    `);
    expect(r.ungrounded, 'phase 3: his power is ungrounded').toBe(true);
    expect(r.turned, 'a hit does nothing').toBe(0);
    expect(r.records, 'and opens no grace').toBe(0);
    expect(r.grounded).toBe(true);
    expect(r.lands, 'grounded, the next hit lands: a frame on, not a grace on').toBe(9);
  });

  it('thirty trophies one after another leave a handful of records, not thirty', () => {
    const r = stage(`
      var f = fighter('Firey', 300, 0, 1, 0); fighters = [f]; var b = boss(420);
      for(var i = 0; i < 30; i++){ var a = summonAssistNamed(f, ASSIST_ROSTER[0]); assistHitSummon(a, b, 5, false); hazardT += 50; }
      return { keys: Object.keys(b._grace).length, lost: lost(b) };
    `);
    expect(r.lost, 'every trophy\'s hit landed: each is its own character').toBe(150);
    expect(r.keys, 'a record untouched for 40 frames has run out and is dropped').toBeLessThanOrEqual(2);
  });
});
