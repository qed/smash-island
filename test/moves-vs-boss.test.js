import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// A FIGHTER MOVE LANDS ON A BOSS ONCE (the glitch pass of 2026-10-02: scripts/moves-vs-boss.mjs). The owner: "puffball multihitbox on smash.
// instakills bosses." A fighter's hit grace stops a second hit; a boss has NO grace after a hit, so a move that reaches the same boss by two
// paths in one press -- a hitbox that follows the fighter, a loop of two hits, a swing and a shot -- takes both. Puffball's Meteor Puff was the
// first (3b681aa); these are the rest the matrix found, each at the number its own code gives a fighter:
//   Puffball's smash from beside a boss   the point-blank hit (39) and then the fall (22): 61 -> 39
//   Liy's special                         the blitz's own 6 on a boss and then the dash sweep's 12: 18 -> 6
//   Coiny's finisher                      two slaps in a loop, 8 each: 16 -> 8
//   Dough's down-special                  a circle on each side, and a boss is on both sides: 14 -> 7
//   the jab of Puffball, Ruby, Fanny and Ruler, which swings AND shoots: twice the jab -> once
// And the shots that pierce or linger (the shot loop's pr._sHit guard, a trap or puddle that is used up on contact) and the spin aura's fixed
// six-frame tick, which were already right and stay that way.
// Since 2026-10-04 a boss keeps a grace for each attacking character too ("give bosses by-character iframes", the owner; test/boss-grace.test.js),
// which stops a second hit of one character first. Everything above stays as the second guard: each is one hit per press, grace or none.

let W;
beforeAll(async () => {
  W = bootMonolith();
  await W.eval('profileReady');
  W.eval('updateHUD = function(){}; updateStandings = function(){};');   // the HUD only rewrites the page, and in jsdom that gets slower every frame
});

// `name` stands on the floor ('ground'), in the air ('air') or with her middle inside the boss ('inside'), a plain stationary boss with a million HP
// against her and put back where it stood after every frame, so a knock never carries it out of a hitbox. `body` runs once the stage is set (f, b, none()
// are in scope) and returns what to report; the stage steps `frames` frames after it. Returns { lost, hits: [frame, hp] ... }.
const RUN = (name, staging, body, frames) => `(function(){
  SETTINGS.mode = 'boss'; SETTINGS.items = false; SETTINGS.itemRate = 0; SETTINGS.stocks = 99; running = true; paused = false;
  BOSSRUSH = { active:false, bossIdx:0, cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats = []; summons = []; projectiles = []; beams = []; tendrils = []; items = []; particles = []; impactFxClear(); hazardT = 0;
  var gy = groundY(), f = makeFighter(ROSTER.find(function(r){ return r.name === ${JSON.stringify(name)}; }), 300, gy - 24, 0);
  f.team = 0; f.controller = 'still'; f.stocks = 99; f.face = 1; f.y = gy - f.r; f.onground = true; fighters = [f];
  var b = makeBossSummon({ name:'Dummy Boss', color:'#9a9aff', attack:'basic', big:2.5, stationary:true }, 1e6); b.hp = b.maxHp = 1e6; b._atkTimer = 1e9; summons.push(b);
  var bx, by, staging = ${JSON.stringify(staging)};
  if(staging === 'ground'){ bx = f.x + f.r + b.r + 6; by = gy - b.r; }
  else if(staging === 'air'){ f.y = gy - 230; f.onground = false; bx = f.x + f.r + b.r + 6; by = f.y; }
  else { bx = f.x + 30; by = gy - b.r; }
  var park = function(){ b.x = bx; b.y = by; b.vx = 0; b.vy = 0; b._atkTimer = 1e9; b._tel = 0; };
  park(); step(); park(); f.invuln = 0; f.pct = 0; f.atkCd = 0; f.spCd = 0; f.smCd = 0; f.fnCd = 0; f.hitstun = 0;
  var none = function(){ return { left:false, right:false, up:false, down:false, jump:false, attack:false, special:false, smash:false }; };
  var hp0 = b.hp, hits = [];
  ${body}
  if(hp0 - b.hp > 1e-9) hits.push([-1, hp0 - b.hp]);
  for(var i = 0; i < ${frames}; i++){ var h = b.hp; step(); park(); if(h - b.hp > 1e-9) hits.push([i, h - b.hp]); }
  var res = { lost: hp0 - b.hp, hits: hits };
  summons = []; fighters = []; projectiles = []; particles = [];
  return JSON.stringify(res);
})()`;
const run = (name, staging, body, frames = 150) => JSON.parse(W.eval(RUN(name, staging, body, frames)));

describe('a fighter move that reaches a boss by two paths lands on it once', () => {
  it('Puffball\'s smash from the air beside a boss is the point-blank hit, not that and then the fall too (it took 61, not 39)', () => {
    const r = run('Puffball', 'air', 'doSmash(f);');
    const hit = W.eval('Math.round(26*SMASH_DMG_MULT)');
    expect(r.lost, 'the point-blank hit landed').toBe(hit);
    expect(r.hits.length, 'once, not the fall after it').toBe(1);
  });

  it('Puffball\'s smash from above a boss is still the fall, once (the plunge ends on the boss, as before)', () => {
    const r = run('Puffball', 'inside', 'f.y = by - b.r - 150; f.onground = false; doSmash(f);');
    expect(r.lost).toBe(22);
  });

  it('Liy\'s special beside a boss is the blitz\'s 6, not that and the dash sweep\'s 12 (it took 18)', () => {
    const r = run('Liy', 'ground', 'fireSpecial(f, none());');
    expect(r.lost).toBe(6);
  });

  it('Liy\'s blitz still lands the dash on a boss it was not close enough to grab (12, once)', () => {
    // 150 px of floor between them: past the blitz's 95 px reach, so only the dash sweep hits him, and only once.
    const r = run('Liy', 'ground', 'bx += 70; park(); fireSpecial(f, none());');
    expect(r.lost).toBe(12);
    expect(r.hits.length).toBe(1);
  });

  it('Coiny\'s finisher is one slap of 8 on a boss, not two (it took 16)', () => {
    const r = run('Coiny', 'ground', 'doAttackSpecial(f);');
    expect(r.lost).toBe(8);
  });

  it('Dough\'s down-special is one bounce of 7 on a boss that stands on both sides of him, not one a side (it took 14)', () => {
    const r = run('Dough', 'inside', 'var i = none(); i.down = true; fireSpecial(f, i);');
    expect(r.lost).toBe(7);
  });

  it.each(['Puffball', 'Ruby', 'Fanny', 'Ruler'])('%s\'s jab swings and shoots but a boss takes one of the two (it took both)', (name) => {
    const r = run(name, 'ground', 'doAttack(f);');
    const dmg = W.eval(`rangeProfile(makeFighter(ROSTER.find(function(r){ return r.name === ${JSON.stringify(name)}; }), 0, 0, 0)).dmg`);
    expect(r.lost, 'the jab\'s damage, once').toBeCloseTo(dmg, 5);
  });

  it('the jab\'s shot still reaches a boss the swing could not (far off: the shot, once)', () => {
    const r = run('Fanny', 'ground', 'bx += 150; park(); doAttack(f);');
    expect(r.hits.length).toBe(1);
    expect(r.lost).toBeCloseTo(W.eval('rangeProfile(makeFighter(ROSTER.find(function(r){ return r.name === "Fanny"; }), 0, 0, 0)).dmg'), 5);
  });
});

describe('what already landed once on a boss still does', () => {
  const KINDS = {
    shot:            '{ dmg:10, r:8, life:90 }',
    pierce:          '{ dmg:10, r:8, vx:3, life:90, pierce:true }',
    'pierce-bounce': '{ dmg:10, r:8, vx:3, vy:-5, grav:true, bounce:true, maxBounces:2, life:120, pierce:true }',
    trap:            '{ dmg:10, r:13, life:220, trap:true, arm:14 }',
    mine:            '{ dmg:10, r:13, life:220, trap:true, arm:6, _mine:true }',
    puddle:          '{ dmg:10, r:9, life:200, grav:true, landsPuddle:true }',
    'slow-puddle':   '{ dmg:10, r:18, life:200, trap:true, slow:true }',
    boomerang:       '{ dmg:10, r:8, vx:6, life:120, boomerang:true, ownerFace:1 }',
  };
  it.each(Object.keys(KINDS))('a %s shot inside a boss takes off one hit in 90 frames, not one a frame', (kind) => {
    const r = run('Firey', 'ground', `addProj(Object.assign({ owner:f.idx, ownerObj:f, x:bx, y:by - 20, vx:0, vy:0, kb:2, color:'#fff' }, ${KINDS[kind]}));`, 90);
    expect(r.lost).toBe(10);
  });

  it('Saw\'s Spin Cycle ticks on a boss every six frames for its forty, 4 a tick (28 in all), never twice in a row', () => {
    const r = run('Saw', 'ground', 'fireSpecial(f, none());');
    expect(r.lost).toBe(28);
    const frames = r.hits.map(([f]) => f);
    for (let i = 1; i < frames.length; i++) expect(frames[i] - frames[i - 1], 'ticks six frames apart').toBe(6);
  });
});
