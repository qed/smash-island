import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { JSDOM } from 'jsdom';
import { bootMonolith } from './helpers/smash-golden.js';
import { loadMonolith } from './helpers/load-monolith.js';
import { bootValidating } from './helpers/validating-canvas.js';
import { mulberry32 } from './helpers/prng.js';

// THE BUG SWARM (Boss 4), rebuilt in the boss overhaul (2026-09-29; boss-overhaul-decisions.md, Round 9). The owner, verbatim:
// "hey, I never said remove the projectiles. i only said remove the generic spam. I liked the old bug swarm. Give the swarm a
// sprite." -- and, on how many attacks a boss gets, "the bosses should have more attacks the later they get. starting from bug
// swarm, they should have 5" -- so SWARM WAVE! (the signature, redone: a tide out of the hive's wall cells along the floor that
// chews the platform), DODGING PATTERN!, DODGEBALL!, SEEKERS! (his old seekers, kept: now real bugs) and EGG SAC!. THEN, 2026-10-01 (Round
// 17), the owner, verbatim: "remove the bug tunnel attack." and "nondestructible bug balls." -- the tunnel (DODGING PATTERN!) is gone, and
// the newer request wins over the older count rule, so he has four attacks; and DODGEBALL!'s ball can no longer be destroyed by anything
// a fighter does. Three phases,
// each changing the fight; the Bug Hive for an arena ("if it makes sense for a hazard, reduce boss difficulty and add a hazard");
// "Endings: 'All of them'" -- The Announcer presses a 'Delete Bugs' Button and the bugs vanish (Insectophobe's Nightmare
// 2/Transcript); art from the Bugs page ("Yes, cut or draw"); "Harder, same damage": every move is ONE attack id and so at most
// one boss hit, however many bugs it is made of. Canon from battlefordreamisland.fandom.com: the Bugs, Bug Hive and Dodging
// pattern pages and the transcripts of Insectophobe's Nightmare 2 and 4.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// A still Firey on the floor at `x`, in Boss Rush with the gauntlet logic off, on the stage's own platform, and the Bug Swarm
// spawned the way the gauntlet spawns him, in phase `ph` (a number, or the name of a variable in the page's code: 'ph'). His
// attack timer is parked; the fighter is not invulnerable.
const STAGE = (x, ph = 1) => `
  SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
  BOSSRUSH = { active:false, bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.name==='The Bug Swarm'; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats=platRectsSmall(); summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; impactFxClear();
  var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), ${x}, groundY()-24, 0);
  f.team=0; f.controller='still'; f.stocks=99; fighters=[f];
  spawnBossRushBoss();
  var b = summons.find(function(s){ return s.type==='boss'; });
  b._atkTimer = 1e9;
  var __ph = ${ph};
  if (__ph > 1){ b.hp = b.maxHp*(__ph === 2 ? 0.5 : 0.2); updateBossAttack(b, f); b._atkTimer = 1e9; b._hz = {}; }
  step(); f.pct=0; f.invuln=0;
`;
// Begin a wind-up of `kind` (the tel slot's job), then fire it as the engine does when the wind-up ends.
const FIRE = (kind) => `b._telKind = ${JSON.stringify(kind)}; b._tel = 0; swarmBeginTelegraph(b, f);
  if (b._telKind === 'swarm') fireBossAttack(b, f); else BOSS_MOVES[b._telKind](b, f);`;
const MINE = 'projectiles.filter(function(p){ return p.swarm; })';

describe('the Bug Swarm is Boss 4, with five attacks of his own', () => {
  it('is in the Bug Hive, wears his own bugs, and has SWARM WAVE! and four second moves -- none of the shared four', () => {
    const r = W.eval(`(function(){
      var i = BOSS_ROSTER.findIndex(function(b){ return b.name==='The Bug Swarm'; });
      return { i: i, row: BOSS_ROSTER[i], prev: BOSS_ROSTER[i-1].name, next: BOSS_ROSTER[i+1].name, extra: BOSS_EXTRA['The Bug Swarm'],
        moves: BOSS_EXTRA['The Bug Swarm'].map(function(k){ return typeof BOSS_MOVES[k] + '/' + BOSS_MOVE_NAME[k]; }),
        rushOnly: BOSS_EXTRA['The Bug Swarm'].map(function(k){ return BOSS_RUSH_ONLY.has(k); }), sig: bossTelName({ attack:'swarm', _phase:1 }),
        shared: ['rain','ring','slam','seekers'].filter(function(k){ return BOSS_EXTRA['The Bug Swarm'].indexOf(k) >= 0; }),
        sky: BOSS_ARENA_SKY.hive, tel: bossTelLen({ attack:'swarm' }), hp: BOSS_ROSTER[i].hp };
    })()`);
    expect(r.i, 'Boss 4').toBe(3);
    expect(r.prev).toBe('Firey Speaker Box');
    expect(r.next).toBe('Purple Face');
    expect(r.row).toEqual({ name: 'The Bug Swarm', color: '#6a2ea0', hp: 225, big: 2.3, attack: 'swarm', arena: 'hive', stationary: false, sprite: 'bug' });
    // "starting from bug swarm, they should have 5" (2026-09-29) gave him five; "remove the bug tunnel attack." (the owner, 2026-10-01, Round 17) took the fifth away, and the owner's pick in the same round
    // ("POISON STING!", picked from BAG OF BUGS!, SWARMED!, BIG BUG GULP! and POISON STING!: "a new canon 5th attack in the tunnel's place") gave him a canon one: the signature and four more
    expect(r.extra).toEqual(['swarmseek', 'dodgeball', 'eggsac', 'swarmsting']);
    expect(r.moves).toEqual(['function/SEEKERS!', 'function/DODGEBALL!', 'function/EGG SAC!', 'function/POISON STING!']);
    expect(r.rushOnly, 'an item boss has no hive for them').toEqual([true, true, true, true]);
    expect(r.sig).toBe('SWARM WAVE!');
    expect(r.shared, 'the generic INCOMING!, SHOCK RING, GROUND POUND and SEEKERS (the shared shape) are not his').toEqual([]);
    expect(r.sky).toHaveLength(2);
    expect(r.tel, 'the default wind-up: the tells are props, not a long pause').toBe(36);
    expect(r.hp, '"Harder, same damage": his health is not the dial').toBe(225);
  });

  // The owner, 2026-10-01 (Round 17): "make the attacks based on fighter position. if there is an attack that punishes being close, then they should use it more when ppl are close." -- "Position
  // picks all (Recommended)": the tide no longer runs between every other move. He draws his four by where the fighters stand; none twice in a row, and every one of them comes up.
  it('draws his turns from his five -- the tide, the seekers, the ball, the sac, the sting -- each named, none twice in a row, every one in twelve turns -- and names his phases', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var kinds = [], names = [];
      for (var i=0;i<12;i++){ b._atkTimer = 1; b._tel = 0; b._atkLive = null; updateBossAttack(b, f); kinds.push(b._telKind); names.push(bossTelTextForTest()); }
      function bossTelTextForTest(){ return bossTelName(b); }
      return { kinds: kinds, names: names, p2: bossPhaseName(b, 2), p3: bossPhaseName(b, 3) };
    })()`);
    // "The TLC gets destroyed by the wave of bugs"; his old seekers; "Bug-Filled Dodgeball Insanity"; the egg sac Flower throws; "Poison hits the brain stem in three seconds!"
    const NAME = { swarm: 'SWARM WAVE!', swarmseek: 'SEEKERS!', dodgeball: 'DODGEBALL!', eggsac: 'EGG SAC!', swarmsting: 'POISON STING!' };
    expect(r.kinds.every((k) => NAME[k]), `only his five: ${r.kinds}`).toBe(true);
    expect(r.names).toEqual(r.kinds.map((k) => NAME[k]));
    expect(r.kinds.some((k, i) => i > 0 && k === r.kinds[i - 1]), `never the same move twice in a row: ${r.kinds}`).toBe(false);
    expect(new Set(r.kinds).size, `all five come up in twelve turns: ${r.kinds}`).toBe(5);
    expect(r.p2).toBe('Second Wave');
    expect(r.p3).toBe('Swarm Frenzy');
  });

  // The owner, 2026-10-01 (Round 17), verbatim: "1 attack at a time... the bosses dont give any time between attacks to hit them." Asked: "Current gaps". The gap is now counted from the moment a move is
  // OVER -- its last bug gone (the engine's one-attack watch, test/boss-kit.test.js) -- so a move whose bugs are still crossing needs no longer gap of its own: the `tail` is gone, and all five moves
  // wait the same 110 / 82 / 60 (x 1.2) after they are over.
  it("his gaps are a little longer than the default 100 / 72 / 52 -- the goo and the maw are the hazards (\"reduce boss difficulty and add a hazard\") -- and the same after every move: the gap starts when the move is over", () => {
    const r = W.eval(`(function(){ var out = {};
      [1,2,3].forEach(function(ph){ out[ph] = ['swarm','swarmseek','dodgeball','eggsac','swarmsting'].map(function(k){ return bossAtkGap({ attack:'swarm', _phase:ph, _telKind:k }); }); });
      out.def = [1,2,3].map(function(ph){ return bossAtkGap({ attack:'other', _phase:ph }); });
      return out; })()`);
    expect(r.def, 'the shared pacing, unchanged (an attack no boss has is not a Boss Rush boss, so it is not paced)').toEqual([100, 72, 52]);
    // "bosses should attack a bit slower" (the owner, 2026-09-30): every Boss Rush boss waits BOSS_PACE (1.2) times as long between attacks, so 110 / 82 / 60 is 132 / 98 / 72, the same after every move
    // (it was 161 / 132 / 180 / 168 in phase 1, with a tail after the moves whose bugs were still crossing: that wait is the one-attack watch's now). (The fifth, DODGING PATTERN!'s 110 + an
    // 80-frame tail, went with the tunnel itself: "remove the bug tunnel attack.", the owner, 2026-10-01.)
    expect(r[1]).toEqual([132, 132, 132, 132, 132]);
    expect(r[2]).toEqual([98, 98, 98, 98, 98]);
    expect(r[3]).toEqual([72, 72, 72, 72, 72]);
  });
});

describe('SWARM WAVE!: a tide out of the hive along the floor', () => {
  it('the wind-up sends him to the wall far from you and lights that wall; the tide comes in there, along the floor, toward you: crests with clear floor between', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(), out = {};
      b._telKind = 'swarm'; b._tel = 36; swarmBeginTelegraph(b, f);
      out.d = b._sw.d; out.bossX = b.x; out.r = b.r; out.WW = WW; out.gy = gy;
      b._tel = 0; fireBossAttack(b, f);
      var tide = ${MINE}; out.n = tide.length;
      out.kinds = tide.map(function(p){ return p.swarm; }).filter(function(k, i, a){ return a.indexOf(k) === i; });
      out.vx = tide.map(function(p){ return p.vx; }).filter(function(v, i, a){ return a.indexOf(v) === i; });
      out.ys = tide.map(function(p){ return Math.round(p.y*10)/10; }).filter(function(v, i, a){ return a.indexOf(v) === i; }).sort();
      out.ids = tide.map(function(p){ return p.bossAtk; }).filter(function(v, i, a){ return a.indexOf(v) === i; }).length;
      out.volley = tide.every(function(p){ return p.volley && p.owner === -2; });
      out.dmg = tide[0].dmg; out.full = bossDmg(); out.shape = tide.map(function(p){ return p.shape; }).filter(function(v, i, a){ return a.indexOf(v) === i; });
      var xs = tide.map(function(p){ return p.x; }).sort(function(a, c){ return a - c; });   // the wall is on the right: they start past it
      out.xMin = xs[0]; out.xMax = xs[xs.length-1];
      var cols = xs.filter(function(x, i){ return i === 0 || Math.abs(x - xs[i-1]) > 0.5; });
      var gaps = []; for (var i=1;i<cols.length;i++) gaps.push(Math.round(cols[i] - cols[i-1]));
      out.gaps = gaps;
      out.dust = IMPACT_DUST.length; out.debris = IMPACT_DEBRIS.length;
      return out; })()`);
    expect(r.d, 'you are on the left, so it comes in from the right wall, travelling left').toBe(-1);
    expect(r.bossX, 'and he gathers at that wall').toBeGreaterThan(r.WW - r.r*1.5);
    // "SWARM WAVE! one more crest a phase" (the owner, Round 17): phase 1 was three crests, now four
    expect(r.n, 'four crests of four columns of two bugs').toBe(32);
    expect(r.kinds).toEqual(['tide']);
    expect(r.vx, 'phase 1: 6 px a frame, toward you').toEqual([-6]);
    expect(r.ys, 'two rows, on the floor').toEqual([r.gy - 9.45 - 16.5, r.gy - 9.45].map((v) => Math.round(v*10)/10).sort());
    expect(r.ids, 'one attack id: the whole tide is at most one boss hit').toBe(1);
    expect(r.volley).toBe(true);
    expect(r.dmg, 'a bug is the usual boss shot').toBeCloseTo(r.full*0.8, 5);
    expect(r.shape).toEqual(['bugpurple']);
    expect(r.xMin, 'they come in from past the wall').toBeGreaterThan(r.WW);
    // crests four columns wide, 22 px apart, then the clear floor: 170 px and the column's own step
    expect(r.gaps.filter((g) => g === 22)).toHaveLength(12);
    expect(r.gaps.filter((g) => g > 100)).toEqual([192, 192, 192]);
    expect(r.dust, 'the wall cell bursts: dust').toBeGreaterThan(0);
    expect(r.debris, 'and debris').toBeGreaterThan(0);
  });

  it('a floor fighter is hit once, whatever the tide is made of, for a whole boss hit; one on the platform is not touched in phase 1', () => {
    const r = W.eval(`(function(){ var out = {};
      ${STAGE(300)} ${FIRE('swarm')}
      var pct0 = f.pct; for (var i=0;i<300;i++){ step(); f.x = 300; f.vx = 0; f.y = groundY()-24; f.vy = 0; }
      out.floor = f.pct - pct0; out.full = bossDmg(); out.left = ${MINE}.length;
      ${STAGE(300)} var pl = worldPlats[0]; f.x = pl.x + pl.w/2; f.y = pl.y - 24; ${FIRE('swarm')}
      pct0 = f.pct; for (var j=0;j<300;j++){ step(); f.x = pl.x + pl.w/2; f.vx = 0; f.y = pl.y - 24; f.vy = 0; }
      out.plat = f.pct - pct0; out.platW = pl.w; out.platW0 = pl._swx ? pl._swx.w : pl.w;
      return out; })()`);
    expect(r.floor, 'a whole boss hit: 22, not 24 bugs of it').toBeCloseTo(r.full, 5);
    expect(r.plat, 'the ledge is the way out of a phase-1 tide').toBe(0);
    expect(r.platW).toBe(r.platW0);
    expect(r.left, 'the tide is gone off the far side').toBe(0);
  });

  it('a jump timed ahead of each crest clears it -- in every phase (the tide is dodgeable, and it rewards jumping early)', () => {
    const r = W.eval(`(function(){ var out = {};
      [1,2,3].forEach(function(ph){
        ${STAGE(300, 'ph')}
        var pct0, T = SWARM.tide[ph], was = T.alpha; T.alpha = false;   // (the alpha's hop is read on its own, below)
        try {
          ${FIRE('swarm')} pct0 = f.pct;
          for (var i=0;i<700;i++){
            step(); f.x = 300; f.vx = 0;
            var lead = 45 + T.v*13;
            var ahead = projectiles.some(function(p){ return p.swarm==='tide' && p.lane==='floor' && p.front && (p.vx > 0 ? (f.x - p.x > 0 && f.x - p.x < lead) : (p.x - f.x > 0 && p.x - f.x < lead)); });
            if (ahead && f.onground){ f.vy = -12.5; f.onground = false; f.jumps = 1; }
          }
        } finally { T.alpha = was; }
        out[ph] = f.pct - pct0;
      });
      return out; })()`);
    expect(r[1]).toBe(0);
    expect(r[2]).toBe(0);
    expect(r[3]).toBe(0);
  });

  it('phase 2 quickens it, gives it an uneven rhythm, puts SWARM ALPHA at its head -- which hops out of the tide at you once -- and the tide chews the ledge\'s ends', () => {
    const r = W.eval(`(function(){ var out = {}; ${STAGE(300, 2)} var pl = worldPlats[0], w0 = pl.w, x0 = pl.x;
      ${FIRE('swarm')}
      var tide = ${MINE};
      out.vx = tide.map(function(p){ return Math.abs(p.vx); }).filter(function(v, i, a){ return a.indexOf(v) === i; });
      out.n = tide.length; out.alpha = tide.filter(function(p){ return p.swarm === 'alpha'; }).map(function(p){ return [p.r, p.shape, p.front, p.crest]; });
      out.shapes = tide.map(function(p){ return p.shape; }).filter(function(v, i, a){ return a.indexOf(v) === i; }).sort();
      var xs = tide.filter(function(p){ return p.front; }).map(function(p){ return p.x; }).sort(function(a, c){ return a - c; });
      out.crestGaps = xs.slice(1).map(function(x, i){ return Math.round(x - xs[i]); });
      var hops = 0, air = false, landedAt = null, maxUp = 0, fx = f.x;
      for (var i=0;i<400;i++){ step(); f.x = 300; f.vx = 0; f.invuln = 1e9;
        var a = projectiles.find(function(p){ return p.swarm === 'alpha'; });
        if (a && a.lane === 'air' && !air){ air = true; hops++; }
        if (a && air) maxUp = Math.max(maxUp, groundY() - a.y);
        if (a && a.lane === 'floor' && air && landedAt === null){ landedAt = a.x; air = false; } }
      out.hops = hops; out.landedAt = landedAt; out.maxUp = Math.round(maxUp);
      out.w0 = w0; out.w = pl.w; out.x0 = x0; out.x = pl.x; out.restore = pl._swx;
      return out; })()`);
    expect(r.vx, 'phase 2: 6.8').toEqual([6.8]);
    expect(r.n, 'five crests now (one more than it had: "SWARM WAVE! one more crest a phase", the owner, Round 17)').toBe(40);
    expect(r.alpha, 'one SWARM ALPHA, the big bug (r 15), at the head of the first crest').toEqual([[15, 'bugbig', true, 0]]);
    expect(r.shapes, '"Red-spotted bugs join" in phase 2').toEqual(['bugbig', 'bugpurple', 'bugred']);
    expect(r.crestGaps, 'an uneven rhythm: long, short, long, short (a crest, then 200, 160, 200, 160 px of clear floor)').toEqual([288, 248, 288, 248]);
    expect(r.hops, 'one hop').toBe(1);
    expect(r.maxUp, 'a real hop, over your head').toBeGreaterThan(90);
    expect(Math.abs(r.landedAt - 300), 'it comes down where you stood when it left the tide').toBeLessThan(30);
    expect(r.x - r.x0, 'the head of the first crest bit the near end of the ledge: 3% of its width...').toBeCloseTo(r.w0*0.03, 3);
    expect(r.w, '...and the far end: 3% again').toBeCloseTo(r.w0*0.94, 3);
    expect(r.restore.w, 'the ledge remembers what it was').toBe(r.w0);
  });

  it('phase 3 climbs the ledge and runs its top (a floor fighter is not the only one who has to jump), and chews 6% an end -- 12% a wave -- never below half; it is whole again for the next boss', () => {
    const r = W.eval(`(function(){ var out = {}; ${STAGE(700, 3)} var pl = worldPlats[0], w0 = pl.w;
      ${FIRE('swarm')}
      var lanes = {}, sawPlat = 0;
      for (var i=0;i<420;i++){ step(); f.x = 700; f.vx = 0; f.invuln = 1e9;
        ${MINE}.forEach(function(p){ if (p.lane === 'plat' && !(p.delay > 0)){ sawPlat++; if (p.y > pl.y || p.y < pl.y - 60) out.badY = true; } }); }
      out.sawPlat = sawPlat > 0; out.w1 = pl.w; out.w0 = w0; out.ratio1 = pl.w / w0;
      for (var k=0;k<8;k++){ b._sw.d = 1; b._tide = null; ${FIRE('swarm')} for (var j=0;j<420;j++){ step(); f.invuln = 1e9; f.x = 700; f.vx = 0; } }
      out.ratioMin = pl.w / w0; out.hz = ${MINE}.length;
      // a fighter on the ledge in phase 3 is a fighter in the tide's way
      ${STAGE(300, 3)} var pl2 = worldPlats[0]; f.x = pl2.x + pl2.w/2; f.y = pl2.y - 24; ${FIRE('swarm')}
      var pct0 = f.pct; for (var m=0;m<420;m++){ step(); f.x = pl2.x + pl2.w/2; f.vx = 0; f.y = pl2.y - 24; f.vy = 0; }
      out.onLedge = f.pct - pct0; out.full = bossDmg();
      // and the sweep puts it back
      var w2 = pl2.w; swarmEndSweep(b); out.swept = [w2, pl2.w, pl2.x];
      return out; })()`);
    expect(r.sawPlat, 'a crest runs along the ledge').toBe(true);
    expect(r.badY, 'and it runs on the ledge\'s top').toBeUndefined();
    expect(r.ratio1, '12% narrower after a wave').toBeCloseTo(0.88, 3);
    expect(r.ratioMin, 'never below half').toBeCloseTo(0.5, 3);
    expect(r.onLedge, 'the ledge is no refuge in phase 3').toBeCloseTo(r.full, 5);
    expect(r.swept[1], 'the sweep restores its width').toBeGreaterThan(r.swept[0]);
  });
});

describe('the bug tunnel is gone', () => {
  // The owner, verbatim, 2026-10-01 (Round 17): "remove the bug tunnel attack." It was DODGING PATTERN! (attack key 'dodgepattern'): a wall of bugs with
  // one channel through it. It had already been called too hard the day before ("the bullet pattern thing for the bug swarm(bug tunnel) is too hard.",
  // 2026-09-30, when it was made wider, slower and longer to tell). The older attack-count rule -- "the bosses should have more attacks the later they
  // get. starting from bug swarm, they should have 5" (2026-09-29, boss-overhaul-decisions.md Round 9), which gave the swarm the tunnel as its FIFTH
  // attack -- is overruled by the newer request, so the swarm keeps four: SWARM WAVE!, SEEKERS!, DODGEBALL! and EGG SAC!. Its turn, its wind-up, its
  // telegraph name, its code and its tests are all removed; none of its art is: the bugs it was made of are the tide's, the seekers' and the cloud's.
  const GONE = ['dodgepattern', 'DODGING PATTERN!', 'swarmPattern', 'patTel', 'SWARM.pat', 'swarmTrap'];

  it('is in none of his tables: not a second move, a banner, an item-boss exclusion, a move, a tail or a wind-up', () => {
    const r = W.eval(`(function(){
      var ex = BOSS_EXTRA['The Bug Swarm'];
      return { extra: ex, names: ex.map(function(k){ return BOSS_MOVE_NAME[k]; }), all: Object.keys(BOSS_MOVE_NAME).filter(function(k){ return /DODGING/.test(BOSS_MOVE_NAME[k]); }),
        move: typeof BOSS_MOVES.dodgepattern, name: BOSS_MOVE_NAME.dodgepattern, rushOnly: BOSS_RUSH_ONLY.has('dodgepattern'),
        swarmKeys: Object.keys(SWARM).sort(), tail: typeof SWARM.tail, fn: typeof swarmPattern,
        tel: [1,2,3].map(function(ph){ return bossTelLen({ attack:'swarm', _telKind:'dodgepattern', _phase:ph }); }), gap: bossAtkGap({ attack:'swarm', _phase:1, _telKind:'dodgepattern' }) };
    })()`);
    expect(r.extra, 'the signature and four more: five attacks (the fifth is the owner\'s pick for the tunnel\'s place: POISON STING!)').toEqual(['swarmseek', 'dodgeball', 'eggsac', 'swarmsting']);
    expect(r.names).toEqual(['SEEKERS!', 'DODGEBALL!', 'EGG SAC!', 'POISON STING!']);
    expect(r.all, 'no banner anywhere says it').toEqual([]);
    expect(r.move).toBe('undefined');
    expect(r.name).toBeUndefined();
    expect(r.rushOnly).toBe(false);
    expect(r.tail, 'no tail after it, or after any move: the gap starts when a move is over (Round 17, "1 attack at a time")').toBe('undefined');
    for (const k of ['pat', 'patTel', 'rowStep', 'rows', 'row0']) expect(r.swarmKeys, `SWARM.${k} (the tunnel's table) is gone`).not.toContain(k);
    expect(r.fn, 'and the function that built the wall').toBe('undefined');
    expect(r.tel, 'a move of an unknown kind has the usual wind-up: the longer one it had is gone').toEqual([36, 36, 36]);
    expect(r.gap, 'and the usual gap, with no 80-frame tail (110 x 1.2)').toBe(132);
  });

  it('nothing in the swarm\'s slots of the source calls it any more: the words are only ever in a comment', () => {
    const html = readFileSync('artifacts/V1/index.html', 'utf8');
    const marks = [...html.matchAll(/^[ \t]*\/\/ @boss:swarm:begin (\w+)\r?\n([\s\S]*?)^[ \t]*\/\/ @boss:swarm:end \1\r?$/gm)];
    const code = marks.map((m) => m[2].split(/\r?\n/).map((l) => l.replace(/\/\/.*$/, '')).join('\n')).join('\n');
    expect(code.length).toBeGreaterThan(20000);
    for (const w of GONE) expect(code, `"${w}" outside a comment in his slots`).not.toContain(w);
    // and nowhere else in the game either (the shared tables are slots too: this reads the whole file)
    const whole = html.split(/\r?\n/).map((l) => l.replace(/\/\/.*$/, '')).join('\n');
    for (const w of ['dodgepattern', 'swarmPattern', 'patTel', 'swarmTrap']) expect(whole, `"${w}" in the code of the game`).not.toContain(w);
  });

  it('a whole fight through all three phases never throws a wall of bugs with a channel: every turn is the tide, the seekers, the ball, the sac or the sting, and no shot is the old pattern\'s', () => {
    const r = W.eval(`(function(){ var out = { kinds: [], swarms: {}, bad: 0 };
      [1,2,3].forEach(function(ph){
        ${STAGE(300, 'ph')} f.invuln = 1e9;
        var SEQ = ['swarm', 'swarmseek', 'swarm', 'dodgeball', 'swarm', 'eggsac', 'swarm', 'swarmsting', 'swarmseek'];   // (the turns are asked for: his order is the picker's now, Round 17)
        for (var t=0;t<9;t++){
          b._pickForce = SEQ[t]; b._atkLive = null; b._atkTimer = 1; b._tel = 0; updateBossAttack(b, f); out.kinds.push(ph + ':' + b._telKind);
          b._tel = 1; updateBossAttack(b, f);   // the wind-up ends: the move fires, as it does in the game
          for (var k=0;k<40;k++){
            step(); f.invuln = 1e9; f.x = 300; f.y = groundY() - 24;
            ${MINE}.forEach(function(p){ out.swarms[p.swarm] = (out.swarms[p.swarm] || 0) + 1; if (p.swarm === 'pat' || p.swarmTrap) out.bad++; });
          }
          projectiles = []; b._sw = null; b._hz = {}; b._tel = 0; b._ball = null; b._tide = null;
        }
      });
      return out; })()`);
    expect(r.kinds.filter((k) => k.startsWith('1:')), 'phase 1: the tide, the seekers, the tide, the ball, the tide, the sac, the tide, the sting, the seekers').toEqual(['1:swarm', '1:swarmseek', '1:swarm', '1:dodgeball', '1:swarm', '1:eggsac', '1:swarm', '1:swarmsting', '1:swarmseek']);
    expect(new Set(r.kinds.map((k) => k.split(':')[1])), 'five attacks in every phase').toEqual(new Set(['swarm', 'swarmseek', 'dodgeball', 'eggsac', 'swarmsting']));
    expect(r.bad, 'no shot of the old wall, and no pulsing extra bug').toBe(0);
    expect(Object.keys(r.swarms), 'what he throws: the tide, the seekers, the ball, the sac and the sting').toEqual(expect.arrayContaining(['tide', 'seek', 'ball', 'sac', 'sting']));
    expect(Object.keys(r.swarms)).not.toContain('pat');
  });
});

describe('SEEKERS!: his old seekers, kept, now real bugs', () => {
  it('stinger bugs peel off him -- three, four, five -- faster and turning harder each phase, one attack id', () => {
    const r = W.eval(`(function(){ var out = {};
      [1,2,3].forEach(function(ph){
        ${STAGE(300, 'ph')} b._phase = ph; b._telPh = ph; b.x = 700; b.y = groundY() - b.r; BOSS_MOVES.swarmseek(b, f);
        var s = ${MINE};
        out[ph] = { n: s.length, sp: s.map(function(p){ return Math.round(Math.hypot(p.vx, p.vy)*100)/100; }).filter(function(v, i, a){ return a.indexOf(v) === i; }), homing: s.map(function(p){ return p.homing; }).filter(function(v, i, a){ return a.indexOf(v) === i; }),
          shape: s.map(function(p){ return p.shape; }).filter(function(v, i, a){ return a.indexOf(v) === i; }), ids: s.map(function(p){ return p.bossAtk; }).filter(function(v, i, a){ return a.indexOf(v) === i; }).length,
          up: s.every(function(p){ return p.vy < 0; }), owner: s.every(function(p){ return p.owner === -2 && p.volley; }), dmg: s[0].dmg };
      });
      out.full = bossDmg(); return out; })()`);
    expect(r[1].n).toBe(3);
    expect(r[2].n).toBe(4);
    expect(r[3].n).toBe(5);
    expect(r[1].sp).toEqual([5]);
    expect(r[2].sp).toEqual([5.6]);
    expect(r[3].sp).toEqual([6.2]);
    expect(r[1].homing).toEqual([0.05]);
    expect(r[2].homing).toEqual([0.06]);
    expect(r[3].homing).toEqual([0.075]);
    for (const ph of [1, 2, 3]) {
      expect(r[ph].shape, 'the stinger bug: real bugs now').toEqual(['bugsting']);
      expect(r[ph].ids).toBe(1);
      expect(r[ph].up, 'they peel up off his body').toBe(true);
      expect(r[ph].owner).toBe(true);
      expect(r[ph].dmg).toBeCloseTo(r.full*0.8, 5);
    }
  });

  it('they hunt you: weaving, but turning toward where you are; one attack id is one boss hit however many reach you', () => {
    const r = W.eval(`(function(){ var out = {}; ${STAGE(200, 3)} b._phase = 3; b._telPh = 3; b.x = 800; b.y = groundY() - b.r; BOSS_MOVES.swarmseek(b, f);
      var seek = ${MINE}, d0 = seek.map(function(p){ return Math.hypot(p.x - f.x, p.y - f.y); }), turned = 0, maxWobble = 0;
      var a0 = seek.map(function(p){ return Math.atan2(p.vy, p.vx); });
      for (var i=0;i<70;i++){ step(); f.x = 200; f.vx = 0; f.y = groundY() - 24; f.vy = 0; f.invuln = 1e9; }
      seek = ${MINE}; var toward = 0;
      seek.forEach(function(p){ var d = Math.hypot(p.x - f.x, p.y - f.y); var a = Math.atan2(f.y - p.y, f.x - p.x), c = Math.atan2(p.vy, p.vx); var diff = Math.abs(((a - c + Math.PI*3) % (Math.PI*2)) - Math.PI); if (diff < 0.8) toward++; });
      out.alive = seek.length; out.toward = toward;
      // and the hit: uninvulnerable, they all come, and the total is one boss hit
      ${STAGE(200, 3)} b._phase = 3; b._telPh = 3; b.x = 800; b.y = groundY() - b.r; BOSS_MOVES.swarmseek(b, f);
      var pct0 = f.pct; for (var j=0;j<300;j++){ step(); f.x = 200; f.vx = 0; f.y = groundY() - 24; f.vy = 0; }
      out.taken = f.pct - pct0; out.full = bossDmg();
      return out; })()`);
    expect(r.alive, 'they live long enough to reach you').toBeGreaterThan(0);
    expect(r.toward, 'and by then they are pointing at you').toBeGreaterThan(0);
    expect(r.taken, 'at least one reaches you, and all of them together are at most one boss hit').toBeGreaterThanOrEqual(r.full*0.8 - 1e-6);
    expect(r.taken).toBeLessThanOrEqual(r.full + 1e-6);
  });
});

// POISON STING!, the swarm's fifth attack, in the tunnel's place. The owner, 2026-10-01 (Round 17): picked from BAG OF BUGS!, SWARMED!, BIG BUG GULP! and POISON STING! ("it had been cut in Round 9, the owner
// brought it back") -- "a stinger bug pounces along a marked line; a hit poisons -- you collapse 3 s later" (boss-plan-early.md section 6). Canon: "Poison hits the brain stem in three seconds!"
// (Insectophobe's Nightmare 4/Transcript); "some of them have a twin set of venomous stingers" (Bugs, Biology). Its art is File:Bug stinger.png, the seekers' bug. "Harder, same damage": the hit is the usual
// boss hit and the poison is a delayed stumble -- the cookie fuse's engine (MePhone4S's `_cookieT` and S4.collapse), a collapse 180 frames later, while the next move is coming -- not a point of damage.
describe('POISON STING!: a stinger on the hive wall, a marked line, a pounce, and a poison that collapses you', () => {
  const WIND = `b._pickForce = 'swarmsting'; b._atkLive = null; b._atkTimer = 1; b._tel = 0; window.__lastBanner = null; updateBossAttack(b, f);`;
  const STING = (ph) => `${STAGE(300, ph)} var gy = groundY(); worldPlats = []; b._telKind = 'swarmsting'; b._tel = 0; swarmBeginTelegraph(b, f); BOSS_MOVES.swarmsting(b, f);`;
  const LIVE = `${MINE}.some(function(p){ return p.swarm === 'sting' && p.life > 0; })`;

  it('the wind-up is longer than the rest (48 / 44 / 40 frames) and named; it marks a line from the hive wall far from you, at the cell nearest your height, through where you stand, to the first thing it meets -- and the line does not follow you', () => {
    const r = W.eval(`(function(){ var out = {};
      [1,2,3].forEach(function(ph){
        ${STAGE(300, 'ph')} var gy = groundY();
        ${WIND}
        var g = b._sw.sg, dist = Math.abs((f.x - g.x0)*g.uy - (f.y - g.y0)*g.ux);
        out[ph] = { kind: b._telKind, tel: b._tel, banner: window.__lastBanner && window.__lastBanner.text, g: g, dist: dist, WW: WW, gy: gy, ring: bossTelLen(b) };
      });
      ${STAGE(800, 1)} ${WIND} out.right = b._sw.sg;
      ${STAGE(300, 1)} var pl = worldPlats[0]; f.x = pl.x + pl.w/2; f.y = pl.y - 24; ${WIND}
      var want = 0, best = 1e9; SWARM.cells.forEach(function(h, i){ var e = Math.abs((groundY() - h) - f.y); if (e < best){ best = e; want = i; } });
      out.ledge = { lane: b._sw.sg.lane, want: want, y0: b._sw.sg.y0, gy: groundY() };
      ${STAGE(300, 1)} ${WIND} var g0 = JSON.stringify(b._sw.sg);
      for (var i=0;i<20;i++){ f.x = 300 + i*20; step(); b._atkTimer = 1e9; } out.fixed = JSON.stringify(b._sw.sg) === g0;
      return out; })()`);
    for (const ph of [1, 2, 3]) {
      const o = r[ph];
      expect(o.kind).toBe('swarmsting');
      expect(o.tel, `phase ${ph}: a long wind-up, the dodge window`).toBe([48, 44, 40][ph - 1]);
      expect(o.ring, 'and the wind-up ring reads it').toBe([48, 44, 40][ph - 1]);
      expect(o.banner).toBe('POISON STING!');
      expect(o.g.d, 'you are on the left: the stinger comes in at the right wall, travelling left').toBe(-1);
      expect(o.g.x0).toBe(o.WW);
      expect(o.g.lane, 'the floor cell, the nearest to a fighter on the floor').toBe(0);
      expect(o.g.y0).toBe(Math.round(o.gy - 52));
      expect(o.dist, 'the line goes through where you stand').toBeLessThan(1.5);
      expect(o.g.y1, 'and ends on the floor, past you').toBe(Math.round(o.gy - 20));
      expect(o.g.x1).toBeLessThan(300);
    }
    expect([r.right.d, r.right.x0], 'you are on the right: it comes in at the left wall').toEqual([1, 0]);
    expect(r.ledge.lane, 'on a ledge: the cell nearest that height').toBe(r.ledge.want);
    expect(r.ledge.lane, 'a higher one than the floor\'s').toBeGreaterThan(0);
    expect(r.fixed, 'the line is fixed as the wind-up starts: it is a mark to read and leave, not a lock that follows').toBe(true);
  });

  it('the pounce flies along that line at 20 / 22 / 24 px a frame -- one stinger, one attack id, the usual boss hit (the Bugs page\'s stinger, the seekers\' bug at twice their size) -- and ends where the line ends, on the floor in goo; nothing of it is left', () => {
    const r = W.eval(`(function(){ var out = {};
      [1,2,3].forEach(function(ph){
        ${STING('ph')} f.invuln = 1e9;
        var g = JSON.parse(JSON.stringify(b._sw.sg)), sh = ${MINE}.filter(function(p){ return p.swarm === 'sting'; }), p0 = sh[0];
        var o = { n: sh.length, sp: Math.hypot(p0.vx, p0.vy), r: p0.r, dmg: p0.dmg, kb: p0.kb, volley: !!p0.volley && p0.owner === -2, shape: p0.shape, dir: Math.sign(p0.vx), id: p0.bossAtk, g: g, x: p0.x, y: p0.y };
        var goo0 = (b._hz.g ? b._hz.g.length : 0), frames = 0, hits = 0, _im = impact;
        impact = function(){ hits++; return _im.apply(this, arguments); };   // (the dust a heavy hit throws fades by itself: count the impacts)
        try { for (var i=0;i<200 && ${LIVE};i++){ step(); b._atkTimer = 1e9; f.invuln = 1e9; f.x = 300; f.y = gy - 24; f.vy = 0; frames++; } } finally { impact = _im; }
        o.frames = frames; o.want = Math.ceil(g.len/o.sp); o.gone = !${MINE}.some(function(p){ return p.swarm === 'sting'; }); o.sg = b._sw.sg; o.goo = (b._hz.g ? b._hz.g.length : 0) - goo0; o.impacts = hits;
        out[ph] = o; });
      out.full = bossDmg(); out.art = [ATTACK_SPRITES.bugsting.src, ATTACK_SPRITES.bugsting.h];
      return out; })()`);
    for (const ph of [1, 2, 3]) {
      const o = r[ph];
      expect(o.n, 'one stinger').toBe(1);
      expect(o.sp, `phase ${ph}: its speed`).toBeCloseTo([20, 22, 24][ph - 1], 1);
      expect(o.r).toBe(20);
      expect(o.dmg, 'the usual boss shot: a hit, and no more').toBeCloseTo(r.full*0.8, 5);
      expect(o.kb).toBe(9);
      expect(o.volley, 'one attack id, a boss shot').toBe(true);
      expect(o.shape, 'the stinger bug').toBe('bugsting');
      expect(o.dir, 'it travels the way the wall faces').toBe(-1);
      expect([o.x, o.y], 'and starts on its cell').toEqual([o.g.x0, o.g.y0]);
      expect(Math.abs(o.frames - o.want), 'it flies the whole line, no more').toBeLessThanOrEqual(3);
      expect(o.gone, 'and nothing of it is left').toBe(true);
      expect(o.sg, 'the marked line goes with it').toBeNull();
      expect(o.goo, 'it ends on the floor: a pool of goo').toBeGreaterThan(0);
      expect(o.impacts, 'and the floor feels it: an impact where it ends').toBeGreaterThan(0);
    }
    expect(r.art[0], 'the seekers\' art: File:Bug stinger.png').toBe('assets/sprites/attacks/bugsting.png');
    expect(r[1].r*r.art[1]/8, 'drawn about 60 px tall').toBe(60);
  });

  it('it can be dodged: a jump timed as it comes clears it, so does being off the line when it pounces -- up on the ledge while it is still winding up -- and standing still in it is a hit', () => {
    const r = W.eval(`(function(){ var out = {};
      var run = function(how){ ${STAGE(300, 1)} var gy = groundY(), pl = worldPlats[0];
        ${WIND} var pct0 = f.pct, left = false;
        for (var i=0;i<140;i++){
          step(); b._atkTimer = 1e9; f.vx = 0;
          if (how === 'leave'){ if (i === 10){ f.x = pl.x + pl.w/2; f.y = pl.y - 24; f.vy = 0; } if (i >= 10){ f.x = pl.x + pl.w/2; f.y = pl.y - 24; f.vy = 0; } else f.x = 300; }
          else f.x = 300;
          if (how === 'jump'){ var s = ${MINE}.find(function(p){ return p.swarm === 'sting' && p.life > 0; }); if (s && s.x - f.x > 0 && s.x - f.x < 45 + 20*13 && f.onground){ f.vy = -12.5; f.onground = false; f.jumps = 1; } }
        }
        return { hit: f.pct - pct0, fuse: f._cookieT || 0, pz: JSON.stringify(b._sw.pz || {}) }; };
      out.still = run('still'); out.jump = run('jump'); out.leave = run('leave'); out.full = bossDmg();
      return out; })()`);
    expect(r.still.hit, 'standing in it: the usual boss hit').toBeCloseTo(r.full*0.8, 5);
    expect(r.still.fuse, 'and the fuse is lit').toBeGreaterThan(0);
    expect(r.jump.hit, 'a jump timed as it comes clears it').toBe(0);
    expect(r.jump.fuse, 'and nothing is lit').toBe(0);
    expect(r.leave.hit, 'off the line by the time it pounces: it passes under the ledge').toBe(0);
    expect(r.leave.fuse).toBe(0);
    expect(r.leave.pz).toBe('{}');
  });

  it('a hit poisons -- the cookie fuse: 180 frames later you collapse for the engine\'s 30 -- and the poison is not a point of damage; a second sting restarts nothing; the ring round you closes as it burns down', () => {
    const r = W.eval(`(function(){ var out = {};
      ${STING(1)}
      var hit = null, pct1 = null, ring = [], collapse = null, stun = 0, swallowed = 0, again = null;
      for (var i=0;i<400;i++){
        step(); b._atkTimer = 1e9; f.x = 300; f.vx = 0; f.y = gy - 24; f.vy = 0;
        if (hit === null && f._cookieT > 0){ hit = i; pct1 = f.pct; out.fuse0 = f._cookieT; out.pz0 = JSON.stringify(b._sw.pz); out.hp0 = f.pct; }
        if (hit !== null && i === hit + 30){ var c0 = f._cookieT; swarmPoison(b, f); again = [c0, f._cookieT]; }
        if (hit !== null && i === hit + 60) ring.push(b._sw.pz[f.idx]);
        if (hit !== null && i === hit + 120) ring.push(b._sw.pz[f.idx]);
        if (hit !== null && collapse === null && f.hitstun > 0 && i > hit + 100){ collapse = i; out.pctAtCollapse = f.pct; }
        if (collapse !== null && f.hitstun > 0) stun++;
      }
      out.hit = hit; out.collapse = collapse; out.stun = stun; out.pct1 = pct1; out.pctEnd = f.pct; out.ring = ring; out.again = again; out.fuseEnd = f._cookieT; out.pzEnd = JSON.stringify(b._sw.pz || {}); out.S4 = S4.collapse; out.fuseT = SWARM.fuse;
      out.full = bossDmg(); return out; })()`);
    expect(r.hit, 'it hit').not.toBeNull();
    expect(r.fuse0, 'the fuse is the cookie\'s: 180 frames (a frame of it has already burned)').toBeGreaterThanOrEqual(r.fuseT - 2);
    expect(r.fuseT).toBe(180);
    expect(JSON.parse(r.pz0), 'the table of who is poisoned (what a client draws the green of) has them').toEqual({ 0: expect.any(Number) });
    expect(r.collapse - r.hit, 'you collapse 180 frames after the hit').toBeGreaterThanOrEqual(178);
    expect(r.collapse - r.hit).toBeLessThanOrEqual(182);
    expect(r.stun, 'for the engine\'s collapse: 30 frames').toBeGreaterThanOrEqual(r.S4 - 2);
    expect(r.stun).toBeLessThanOrEqual(r.S4 + 2);
    expect(r.pct1, 'the hit is the usual one').toBeCloseTo(r.full*0.8, 5);
    expect(r.pctAtCollapse, 'the poison deals nothing: the collapse is a stumble, not damage').toBeCloseTo(r.pct1, 6);
    expect(r.pctEnd, 'nor after it').toBeCloseTo(r.pct1, 6);
    expect(r.again[1], 'a second sting restarts nothing: the fuse burns on').toBeLessThanOrEqual(r.again[0]);
    expect(r.ring[0] > r.ring[1], 'the ring tracks the frames left').toBe(true);
    expect(r.ring[0], 'about 120 left after 60').toBeGreaterThan(112);
    expect(r.ring[0]).toBeLessThan(124);
    expect([r.fuseEnd, r.pzEnd], 'and it goes out when it has run').toEqual([0, '{}']);
  });

  it('a KO, a respawn or his fall puts the fuse out: nobody collapses after the boss has fallen', () => {
    const r = W.eval(`(function(){ var out = {};
      ${STING(1)} f.invuln = 0; swarmPoison(b, f); out.lit = [f._cookieT, JSON.stringify(b._sw.pz)];
      f._cookieT = 0; step(); b._atkTimer = 1e9; out.respawned = JSON.stringify(b._sw.pz || {});   // the engine zeroes it at a respawn: the table follows
      swarmPoison(b, f); swarmEndSweep(b); out.swept = [f._cookieT, b._sw.pz, b._sw.sg, b._sting];
      return out; })()`);
    expect(r.lit[0]).toBe(180);
    expect(r.lit[1]).toBe('{"0":180}');
    expect(r.respawned).toBe('{}');
    expect(r.swept, 'his fall: no fuse, no table, no line').toEqual([0, null, null, null]);
  });

  it('the picker knows it: far and any, unlocked from phase 1, favoured when you keep away', () => {
    const r = W.eval(`(function(){ var out = {}; ${STAGE(900, 1)}
      out.moves = [1,2,3].map(function(ph){ return bossPickMoves(b, ph); });
      out.tags = bossMoveTags(b, 'swarmsting', 1);
      b.x = 900; f.x = 880; var near = bossPickWeight(bossMoveTags(b, 'swarmsting', 1), bossSituation(b));
      f.x = 100; var far = bossPickWeight(bossMoveTags(b, 'swarmsting', 1), bossSituation(b));
      out.near = near; out.far = far; return out; })()`);
    for (const ph of [0, 1, 2]) expect(r.moves[ph], `phase ${ph + 1}: five moves`).toEqual(['swarm', 'swarmseek', 'dodgeball', 'eggsac', 'swarmsting']);
    expect(r.tags).toEqual(['far', 'any']);
    expect(r.far, 'it punishes keeping away: it comes up more when you do').toBeGreaterThan(r.near);
  });
});

describe('DODGEBALL!: a ball of bugs that ricochets', () => {
  it('is thrown at where you stood -- locked as the wind-up starts in phase 1, following you until it locks in phases 2 and 3 -- fast, heavy, and one attack id', () => {
    const r = W.eval(`(function(){ var out = {};
      [1,2,3].forEach(function(ph){
        ${STAGE(200, 'ph')} var gy = groundY(); worldPlats = [];
        b.x = 800; b.y = gy - b.r; b._telKind = 'dodgeball'; b._tel = 36; swarmBeginTelegraph(b, f);
        var aim0 = b._sw.b.slice(); f.invuln = 1e9;
        for (var i=0;i<40;i++){ f.x = 200 + i*3; f.y = gy - 24; step(); }
        var aim1 = b._sw.b.slice(), fx = f.x;
        var ball = projectiles.find(function(p){ return p.swarm === 'ball'; });
        out[ph] = { aim0: aim0, aim1: aim1, fx: fx, v: Math.round(Math.hypot(ball.vx, ball.vy)*10)/10, r: ball.r, dmg: ball.dmg, kb: ball.kb, volley: ball.volley, owner: ball.owner, shape: ball.shape, spin: PROJ_SHAPE.bugball.spin };
      });
      out.full = bossDmg(); return out; })()`);
    expect(r[1].aim1, 'phase 1: the aim is where you stood as the wind-up began').toEqual(r[1].aim0);
    for (const ph of [2, 3]) {
      expect(r[ph].aim1[0], `phase ${ph}: it follows you`).toBeGreaterThan(r[ph].aim0[0]);
      expect(r[ph].aim1[0], `...and locks before the throw, so he is not aiming where you are`).toBeLessThan(r[ph].fx);
    }
    expect([r[1].v, r[2].v, r[3].v], 'faster each phase').toEqual([10.5, 11.5, 12.5]);
    expect([r[1].r, r[2].r, r[3].r]).toEqual([34, 34, 36]);
    for (const ph of [1, 2, 3]) {
      expect(r[ph].dmg, 'a heavy hit: a whole boss hit, and still no more').toBeCloseTo(r.full, 5);
      expect(r[ph].kb).toBe(13);
      expect(r[ph].volley && r[ph].owner === -2).toBe(true);
      expect(r[ph].shape).toBe('bugball');
      expect(r[ph].spin, 'the ball of bugs rolls').toBe(true);
    }
  });

  // "DODGEBALL! two balls in P3" (the owner's pick, Round 17; "the balls stay indestructible"). Both are the one move's: one attack id and a volley, so the pair is at most one boss hit, and both are
  // `unbreakable` ("nondestructible bug balls.").
  it('phase 3 throws two balls at once: the second goes for the floor beside the first\'s aim, toward the middle of the room; both are unbreakable and share the move\'s one attack id -- phases 1 and 2 throw one', () => {
    const r = W.eval(`(function(){ var out = {};
      [1,2,3].forEach(function(ph){
        ${STAGE(200, 'ph')} var gy = groundY(); worldPlats = []; b.x = 800; b.y = gy - b.r; f.invuln = 1e9;
        b._telKind = 'dodgeball'; b._tel = 36; swarmBeginTelegraph(b, f);
        var o = { b: b._sw.b.slice(), b2: b._sw.b2 ? b._sw.b2.slice() : null, gy: gy };
        b._tel = 0; BOSS_MOVES.dodgeball(b, f);
        var balls = ${MINE}.filter(function(p){ return p.swarm === 'ball'; });
        o.n = balls.length; o.ids = balls.map(function(p){ return p.bossAtk; }).filter(function(v, i, a){ return a.indexOf(v) === i; }).length;
        o.unb = balls.every(function(p){ return p.unbreakable === true && p.volley === true && p.owner === -2 && p.dmg === bossDmg(); });
        o.dirs = balls.map(function(p){ return JSON.stringify([Math.round(p.vx*100)/100, Math.round(p.vy*100)/100]); });
        o.tracked = b._balls.length; o.first = b._ball === balls[0];
        out[ph] = o; });
      return out; })()`);
    expect(r[1].n).toBe(1);
    expect(r[2].n).toBe(1);
    expect(r[1].b2, 'no second aim before phase 3').toBeNull();
    expect(r[3].n, 'two balls in phase 3').toBe(2);
    expect(r[3].b, 'the first is aimed at where you stand').toEqual([200, Math.round(r[3].gy - 24)]);
    expect(r[3].b2, 'the second at the floor 300 px on, toward the middle').toEqual([500, Math.round(r[3].gy - 24)]);
    expect(r[3].dirs[0] !== r[3].dirs[1], 'they leave his head in two directions').toBe(true);
    for (const ph of [1, 2, 3]) {
      expect(r[ph].ids, 'one attack id: the move is at most one boss hit').toBe(1);
      expect(r[ph].unb, 'every ball is unbreakable, a volley, the heavy hit').toBe(true);
      expect(r[ph].tracked, 'the boss remembers each, to burst it where it was').toBe(r[ph].n);
      expect(r[ph].first).toBe(true);
    }
  });

  it('a fighter both balls reach takes one boss hit, not two (the first is spent on him, the second flies through his grace and on to its own end); the boss lets go of both', () => {
    const r = W.eval(`(function(){ var out = {}; ${STAGE(300, 3)} var gy = groundY(); worldPlats = [];
      b.x = 900; b.y = gy - b.r; b._sw = { b:[300, gy - 24], b2:[300, gy - 24] }; projectiles = []; BOSS_MOVES.dodgeball(b, f);
      var pct0 = f.pct, bounces = 0, orig = swarmBounce; swarmBounce = function(p, s, hit){ bounces++; orig(p, s, hit); };
      try { for (var i=0;i<600 && (${MINE}.some(function(p){ return p.swarm === 'ball'; }) || i < 5);i++){ step(); b._atkTimer = 1e9; f.x = 300; f.vx = 0; f.y = gy - 24; f.vy = 0; } } finally { swarmBounce = orig; }
      out.taken = f.pct - pct0; out.full = bossDmg(); out.balls = ${MINE}.filter(function(p){ return p.swarm === 'ball'; }).length; out.tracked = b._balls.length; out.bounces = bounces;
      return out; })()`);
    expect(r.taken, 'the pair is one attack id: a boss hit and no more').toBeCloseTo(r.full, 5);
    expect(r.balls, 'both come to their end').toBe(0);
    expect(r.tracked, 'and the boss has let go of both').toBe(0);
  });

  it('both first legs are marked from the start of the wind-up: a dotted march of bugs to where each will first hit, and a ring there', () => {
    const { w, log } = bootRecording();
    const rings = (ph, second) => {
      w.eval(`(function(){ var gy = groundY(); SETTINGS.mode='boss'; running=true; BOSS_ARENA = 'hive'; worldPlats = []; projectiles = []; fighters = [];
        summons = [{ type:'boss', name:'The Bug Swarm', attack:'swarm', sprite:'bug', r:78, x:800, y:gy-78, face:-1, hp:100, maxHp:225, _phase:${ph}, _tel:20, _telKind:'dodgeball', flash:0, _bossRush:true,
          _sw:{ d:-1, b:[200, gy-24]${second ? ', b2:[500, gy-24]' : ''} } }]; })()`);
      log.length = 0; w.eval('swarmDrawFx()'); w.eval('summons = []; BOSS_ARENA = null');
      return log.filter((e) => e.op === 'ellipse' && e.args[2] === 18 && e.args[3] === 18).length;
    };
    expect(rings(1, false), 'one ball: one leg marked').toBe(1);
    expect(rings(3, true), 'two balls: both legs marked').toBe(2);
  });

  it('it ricochets off the floor, the walls and the ledges -- three times, four in phase 3 -- sheds crawling bugs on a floor or ledge bounce, scars the floor, leaves goo, and comes apart', () => {
    const r = W.eval(`(function(){ var out = {};
      [1,2,3].forEach(function(ph){
        ${STAGE(60, 'ph')} var gy = groundY(), B = SWARM.ball[ph]; f.invuln = 1e9; worldPlats = [];
        var log = [], orig = swarmBounce; swarmBounce = function(p, s, hit){ var n0 = projectiles.length; var sp = Math.round(Math.hypot(p.vx, p.vy)*100)/100; orig(p, s, hit); log.push({ hit: hit, n: p.bounces, sp: sp, vy: Math.sign(p.vy), shed: projectiles.filter(function(q){ return q.swarm === 'crawl'; }).length }); };
        try {
          b.x = 700; b.y = gy - b.r; b._sw = { b:[300, gy - 24] }; projectiles = []; BOSS_MOVES.dodgeball(b, f);
          var ball = projectiles[0], id = ball.bossAtk, scars0 = IMPACT_SCARS.length, goo0 = (b._hz && b._hz.g ? b._hz.g.length : 0);
          for (var i=0;i<260;i++){ step(); f.x = 60; f.y = gy - 24; f.invuln = 1e9; }
        } finally { swarmBounce = orig; }
        out[ph] = { log: log, want: B.bounces, balls: B.n, shed: B.shed, gone: !projectiles.some(function(p){ return p.swarm === 'ball'; }), scars: IMPACT_SCARS.length - scars0, goo: (b._hz.g ? b._hz.g.length : 0) - goo0,
          ids: projectiles.map(function(p){ return p.bossAtk; }).concat([id]).filter(function(v, i, a){ return a.indexOf(v) === i; }).length };
      });
      return out; })()`);
    for (const ph of [1, 2, 3]) {
      const o = r[ph];
      // (phase 3 throws two balls at once -- "DODGEBALL! two balls in P3", the owner, Round 17 -- and each ricochets its own four times: the log has both)
      expect(o.log.map((e) => e.n).sort(), `phase ${ph}: ${o.want} bounces a ball`).toEqual(Array.from({ length: o.want*o.balls }, (_, i) => Math.floor(i/o.balls) + 1));
      expect(o.log.every((e) => e.sp === [10.5, 11.5, 12.5][ph - 1]), 'it keeps its speed round every bounce').toBe(true);
      expect(o.gone, 'and comes apart after the last').toBe(true);
      expect(o.scars, 'a scar where it hit the floor').toBeGreaterThan(0);
      expect(o.goo, 'and goo').toBeGreaterThan(0);
      const floorish = o.log.filter((e) => e.hit === 'floor' || e.hit === 'top');
      expect(floorish.length, 'it does hit the floor').toBeGreaterThan(0);
      expect(o.log.filter((e) => e.hit === 'wall' || e.hit === 'ceil').length + floorish.length + o.log.filter((e) => e.hit === 'under' || e.hit === 'side').length).toBe(o.want*o.balls);
    }
    expect(r[1].log[0].vy, 'off the floor, up').toBe(-1);
    expect(r[1].shed).toBe(3);
    expect(r[2].shed).toBe(4);
    expect(r[3].want).toBe(4);
  });

  it('the crawlers it sheds hunt the nearest of you along the floor; if it hits you it is gone in one boss hit and bursts where it was', () => {
    const r = W.eval(`(function(){ var out = {}; ${STAGE(300, 1)} var gy = groundY(); worldPlats = [];
      b.x = 100; b.y = gy - b.r; b._sw = { b:[300, gy - 24] }; projectiles = []; BOSS_MOVES.dodgeball(b, f);
      var pct0 = f.pct, d0 = IMPACT_DEBRIS.length; for (var i=0;i<60;i++){ step(); f.x = 300; f.vx = 0; f.y = gy - 24; f.vy = 0; }
      out.taken = f.pct - pct0; out.full = bossDmg(); out.ball = ${MINE}.filter(function(p){ return p.swarm === 'ball'; }).length; out.debris = IMPACT_DEBRIS.length - d0;
      // crawlers: shed one by hand and watch it go for you
      ${STAGE(700, 1)} projectiles = []; worldPlats = [];
      addProj(swarmShot(b, { swarm:'crawl', shape:'bugpurple', x:300, y:gy - 9, vx:-2.6, vy:0, bossAtk:++BOSS_ATK_ID, life:150, spd:2.6, bob:0 }));
      f.invuln = 1e9; var c = ${MINE}[0], x0 = c.x; for (var j=0;j<40;j++){ step(); f.x = 700; f.y = gy - 24; f.invuln = 1e9; }
      out.crawlDx = c.x - x0; out.crawlY = c.y; out.gy = gy;
      return out; })()`);
    expect(r.taken, 'one boss hit').toBeCloseTo(r.full, 5);
    expect(r.ball, 'a hit takes it: it is gone').toBe(0);
    expect(r.debris, 'and it bursts (impact debris)').toBeGreaterThan(0);
    expect(r.crawlDx, 'the crawler heads for you (you are to its right)').toBeGreaterThan(50);
    expect(r.crawlY, 'along the floor').toBeGreaterThan(r.gy - 12);
  });

  // "nondestructible bug balls." (the owner, 2026-10-01, Round 17). The ball is a boss shot like any other, and every way the game lets a fighter get rid of
  // an enemy shot is a place that asks the shot whether it may: a reflect (Gaty), a counter stance, a turret (Tennis Ball), Nickel's shred, Marshmallow's
  // scream, Clover's butterflies, Box's packing, and the Eraser. The ball says `unbreakable`; a plain boss shot, as the control in each case, is still
  // stopped. (A fighter's swing or shot never had a way to touch a shot: the projectile loop has no shot-on-shot test and a swing only meets bosses and
  // turrets; the third case pins that, so a later change cannot give it one.) It flies until its own end: the one hit it deals, its last bounce, its life.
  // NEW_BALL: Boss Rush against the swarm, fighter `who` (a code expression) at x = 300, and a ball thrown at him; `ctl`: the control, a ball that is breakable.
  const NEW_BALL = (who, ctl) => `
    ${STAGE(300, 1)} var gy = groundY(); worldPlats = [];
    var c = makeFighter(ROSTER.find(function(r){ return r.name===${who}; }), 300, gy-24, 0); c.team=0; c.controller='still'; c.stocks=99; c.face=1; fighters=[c]; step(); c.pct = 0; c.invuln = 0;
    b.x = 900; b.y = gy - b.r; b._sw = { b:[300, gy - 24] }; projectiles = []; BOSS_MOVES.dodgeball(b, c);
    var ball = projectiles.find(function(p){ return p.swarm === 'ball'; }); if (${ctl}) ball.unbreakable = false;`;
  // the ball, held still at (x, y)
  const BALL_AT = (x, y) => `ball.x = ${x}; ball.y = ${y}; ball.vx = 0.001; ball.vy = 0;`;
  const alive = 'projectiles.indexOf(ball) >= 0 && ball.life > 0';

  it('survives a reflect, a counter stance, a turret and the Eraser: the reflecting fighter is hit, the counter does not nullify it, the turret does not break it, nothing wipes it -- a plain boss shot is stopped by each', () => {
    const r = W.eval(`(function(){ var out = {};
      [false, true].forEach(function(ctl){ var o = out[ctl ? 'control' : 'ball'] = {};
        // a reflect: Gaty's shield is up as it arrives
        ${NEW_BALL(JSON.stringify('Gaty'), 'ctl')} for (var i=0;i<90 && ball.life > 0;i++){ c.reflecting = 30; c.x = 300; c.y = gy - 24; c.vx = 0; step(); b._atkTimer = 1e9; c.invuln = 0; }
        o.reflect = { reflected: !!ball.reflected, owner: ball.owner, hurt: c.pct > 0 };
        // a counter stance
        ${NEW_BALL(JSON.stringify('Firey'), 'ctl')} for (var i=0;i<90 && ball.life > 0;i++){ c.countering = 30; c.x = 300; c.y = gy - 24; c.vx = 0; step(); b._atkTimer = 1e9; c.invuln = 0; }
        o.counter = { hurt: c.pct > 0 };
        // a turret in its way (Tennis Ball's)
        ${NEW_BALL(JSON.stringify('Tennis Ball'), 'ctl')} c.invuln = 1e9; ${BALL_AT('c.x + 80', 'c.y')}
        var turret = { life:200, hp:50, r:30, x:ball.x, y:ball.y, turret:true, ownerObj:c, owner:c.idx, _hitCd:0 };
        o.turret = { broke: shotHitsTurret(ball, [turret]), life: ball.life };
        // the Eraser: summoned, it wipes the screen as it fires
        ${NEW_BALL(JSON.stringify('Firey'), 'ctl')} c.invuln = 1e9; ${BALL_AT('c.x + 200', 'c.y')}
        var eraser = summonAssistNamed(c, ASSIST_ROSTER.find(function(x){ return x.act === 'erase'; }));
        for (var j=0;j<90 && summons.indexOf(eraser) >= 0;j++){ step(); b._atkTimer = 1e9; c.invuln = 1e9; }
        o.eraser = { fired: summons.indexOf(eraser) < 0, left: ${alive} };
      });
      return out; })()`);
    expect(r.ball.reflect, 'Gaty\'s reflect does not turn it back: it is still the boss\'s, and it hit').toEqual({ reflected: false, owner: -2, hurt: true });
    expect(r.control.reflect, 'the control: a plain boss shot is turned back, and nobody is hurt').toMatchObject({ reflected: true, hurt: false });
    expect(r.control.reflect.owner, 'and it is the fighter\'s now').toBeGreaterThanOrEqual(0);
    expect(r.ball.counter, 'a counter stance does not nullify it').toEqual({ hurt: true });
    expect(r.control.counter, 'the control: a plain shot is nullified by it').toEqual({ hurt: false });
    expect(r.ball.turret.broke, 'a turret does not break it').toBe(false);
    expect(r.ball.turret.life).toBeGreaterThan(0);
    expect(r.control.turret.broke, 'the control: a plain shot breaks on a turret').toBe(true);
    expect(r.ball.eraser, 'the Eraser fires, and the ball is still flying').toEqual({ fired: true, left: true });
    expect(r.control.eraser, 'the control: the Eraser wipes a plain shot').toEqual({ fired: true, left: false });
  });

  it('survives Nickel\'s shred, Marshmallow\'s scream, Clover\'s butterflies and Box\'s packing -- each a special that clears the enemy shots in reach -- and a plain boss shot in the same spot does not', () => {
    const r = W.eval(`(function(){ var out = {};
      ['Nickel (II)', 'Marshmallow', 'Clover', 'Box'].forEach(function(who){
        out[who] = {};
        [false, true].forEach(function(ctl){
          ${NEW_BALL('who', 'ctl')} c.invuln = 1e9; ${BALL_AT('c.x + 60', 'c.y')}
          fireSpecial(c, {}); step(); b._atkTimer = 1e9;
          out[who][ctl ? 'control' : 'ball'] = { alive: ${alive}, packed: !!c._packed, owner: ball.owner };
        });
      });
      return out; })()`);
    for (const who of ['Nickel (II)', 'Marshmallow', 'Clover', 'Box']) {
      expect(r[who].ball, `${who}: the ball is still there, still the boss's, and not packed away`).toEqual({ alive: true, packed: false, owner: -2 });
      expect(r[who].control.alive && !r[who].control.packed, `${who}: the control, a plain boss shot, is gone (or in her box)`).toBe(false);
    }
    expect(r.Box.control.packed, 'Box\'s control was caught').toBe(true);
  });

  it('a fighter\'s own swing and shot pass through it, and it flies on to its own end -- its three bounces -- while Nickel shreds the air beside it every few frames', () => {
    const r = W.eval(`(function(){ var out = {};
      ${NEW_BALL(JSON.stringify('Nickel (II)'), 'false')} c.invuln = 1e9; ${BALL_AT('c.x + 50', 'c.y')}
      doAttack(c); spawnProj(c, { vx:12, vy:0, dmg:6, kb:4, r:10, color:'#f00', life:30 });
      for (var i=0;i<6;i++){ step(); b._atkTimer = 1e9; c.invuln = 1e9; }
      out.swing = ${alive};
      // and the whole flight: three bounces, then it comes apart -- with a shred beside it as often as Nickel can
      ${NEW_BALL(JSON.stringify('Nickel (II)'), 'false')} c.invuln = 1e9; var bounces = 0, casts = 0, orig = swarmBounce;
      swarmBounce = function(p, s, hit){ bounces++; orig(p, s, hit); };
      try {
        for (var k=0;k<520 && ball.life > 0 && !ball.popped;k++){
          if (k % 18 === 0){ c.x = ball.x - 40; c.y = ball.y; c.face = 1; c.spCd = 0; fireSpecial(c, {}); casts++; }
          step(); b._atkTimer = 1e9; c.invuln = 1e9;
        }
      } finally { swarmBounce = orig; }
      out.flight = { bounces: bounces, want: SWARM.ball[1].bounces, casts: casts, gone: !projectiles.some(function(p){ return p.swarm === 'ball'; }) };
      return out; })()`);
    expect(r.swing, 'a swing and a shot of a fighter are not in its way').toBe(true);
    expect(r.flight.casts, 'Nickel shredded the air next to it again and again').toBeGreaterThan(5);
    expect(r.flight.bounces, 'and it still ricocheted its three times').toBe(r.flight.want);
    expect(r.flight.gone, 'and came apart on its own after the last').toBe(true);
  });
});
describe('EGG SAC!: a lobbed sac, a crack, and hatchlings that swell', () => {
  it('is lobbed at where you stood -- onto the ledge if that is where you were -- harmless in flight and while it lies there, and cracks after 44 / 36 / 30 frames', () => {
    const r = W.eval(`(function(){ var out = {};
      [1,2,3].forEach(function(ph){
        ${STAGE(300, 'ph')} var gy = groundY(); b.x = 800; b.y = gy - b.r; f.invuln = 1e9;
        b._telKind = 'eggsac'; b._tel = 0; swarmBeginTelegraph(b, f); b._telX = 300; b._telY = gy - 24; BOSS_MOVES.eggsac(b, f);
        var sacs = projectiles.filter(function(p){ return p.swarm === 'sac'; });
        var info = { n: sacs.length, tx: sacs.map(function(p){ return p.tx; }), ly: sacs.map(function(p){ return p.ly; }), lt: sacs[0].lt, crack: sacs[0].tot - sacs[0].lt, dmg: sacs[0].dmg, inert: sacs[0].delay > 0, gy: gy };
        var landed = null, first = null;
        for (var j=0;j<sacs[0].tot + 5;j++){ step(); f.x = 300; f.y = gy - 24; f.invuln = 1e9;
          var hatch = projectiles.filter(function(p){ return p.swarm === 'hatch'; }).length;
          if (hatch && first === null) first = { at: j, n: hatch };
          if (landed === null && sacs[0].y >= sacs[0].ly - 0.01 && sacs[0].delay > 0) landed = j; }
        info.landed = landed; info.hatch = first;
        out[ph] = info;
      });
      // onto the ledge you stood on
      ${STAGE(300, 1)} var pl = worldPlats[0]; b.x = 800; b.y = groundY() - b.r; b._telX = pl.x + pl.w/2; b._telY = pl.y - 24; BOSS_MOVES.eggsac(b, f);
      out.ledge = { ly: projectiles.find(function(p){ return p.swarm === 'sac'; }).ly, top: pl.y };
      return out; })()`);
    // "EGG SAC! 2/2/3 sacs (was 1/1/2)" (the owner's pick, Round 17)
    expect(r[1].n, 'two sacs in phase 1 (it was one)').toBe(2);
    expect(r[2].n).toBe(2);
    expect(r[3].n, 'phase 3 lobs three (it was two)').toBe(3);
    expect(r[1].tx, 'the second toward the middle, 230 px on').toEqual([300, 530]);
    expect(r[3].tx, 'and the third 230 px farther still').toEqual([300, 530, 760]);
    for (const ph of [1, 2, 3]) {
      expect(r[ph].tx[0], 'where you stood').toBe(300);
      expect(r[ph].ly[0], 'on the floor').toBe(Math.round(r[ph].gy - 12));
      expect(r[ph].dmg, 'a sac hurts nobody').toBe(0);
      expect(r[ph].inert).toBe(true);
      expect(r[ph].crack, `phase ${ph}: it cracks this long after it lands`).toBe([44, 36, 30][ph - 1]);
      expect(r[ph].landed, 'it lands').not.toBe(null);
      expect(r[ph].hatch, 'and hatchlings come out').not.toBe(null);
    }
    expect(r[1].hatch.n, 'five a sac').toBe(10);
    expect(r[3].hatch.n, 'five a sac').toBe(15);
    expect(r.ledge.ly, 'onto the ledge').toBe(Math.round(r.ledge.top - 12));
  });

  it('the hatchlings crawl at you and swell the longer you wait -- to 27 px, no more -- and the move is one attack id, at most one boss hit', () => {
    const r = W.eval(`(function(){ var out = {};
      [1,2,3].forEach(function(ph){
        ${STAGE(300, 'ph')} var gy = groundY(); worldPlats = []; f.invuln = 1e9;
        var S = SWARM.sac[ph], sw = 0;
        b.x = 800; b.y = gy - b.r; b._telX = 300; b._telY = gy - 24; BOSS_MOVES.eggsac(b, f);
        var rs = [], x0 = null, first = null, ids = {};
        for (var j=0;j<420;j++){ step(); f.x = 900; f.vx = 0; f.y = gy - 24; f.invuln = 1e9;   // you have walked away: they come for you
          var h = projectiles.filter(function(p){ return p.swarm === 'hatch'; });
          h.forEach(function(p){ ids[p.bossAtk] = 1; });
          if (h.length && first === null){ first = j; x0 = h.map(function(p){ return p.x; }); }
          if (first !== null && (j - first) % 30 === 0 && h.length) rs.push(Math.round(h[0].r*10)/10);
          if (h.length && first !== null) out['maxR' + ph] = Math.max(out['maxR' + ph] || 0, h.reduce(function(m, p){ return Math.max(m, p.r); }, 0)); }
        out[ph] = { rs: rs, grow: S.grow, ids: Object.keys(ids).length };
        // the hit: stay put where it lands
        ${STAGE(300, 'ph')} worldPlats = []; b.x = 800; b.y = gy - b.r; b._telX = 300; b._telY = gy - 24; BOSS_MOVES.eggsac(b, f);
        var pct0 = f.pct; for (var k=0;k<420;k++){ step(); f.x = 300; f.vx = 0; f.y = gy - 24; f.vy = 0; }
        out[ph].taken = f.pct - pct0;
      });
      out.full = bossDmg(); return out; })()`);
    for (const ph of [1, 2, 3]) {
      const o = r[ph];
      expect(o.rs[1] - o.rs[0], `phase ${ph}: it grows every half second`).toBeGreaterThan(0);
      expect(o.rs[0], 'from a hatchling').toBeLessThan(9);
      expect(o.ids).toBe(1);
      expect(o.taken, 'all together: one boss hit at most').toBeLessThanOrEqual(r.full + 1e-6);
      expect(o.taken).toBeGreaterThanOrEqual(r.full*0.8 - 1e-6);
    }
    expect(r.maxR3, 'the cap').toBeLessThanOrEqual(27.5);
    expect(r.maxR3, 'phase 3 swells fast enough to reach it').toBeGreaterThan(26);
    expect(r[1].grow < r[2].grow && r[2].grow < r[3].grow, 'faster each phase').toBe(true);
  });
});

// The glitch pass (scripts/boss-glitch.mjs, 2026-10-01): "an EGG SAC hatchling (bughatch) is born ON a fighter and hits at age 0: hatchlings must not hurt until they have hatched visibly (the swell), or never
// spawn on a fighter." A hatchling is held for SWARM.hatchWait frames as it is born (a held shot neither moves, swells nor hurts), squirming out of the cracked sac.
describe('EGG SAC!: a hatchling is born harmless', () => {
  it('one born ON a fighter hurts nobody while it squirms out of the sac -- 18 frames, held where it was born -- and then hatches, swells and hurts, all together one boss hit', () => {
    const r = W.eval(`(function(){ var out = {}; ${STAGE(300, 1)} var gy = groundY(); worldPlats = [];
      b.x = 800; b.y = gy - b.r; b._telX = 300; b._telY = gy - 24; BOSS_MOVES.eggsac(b, f);
      var born = null, hurtAt = null, pct0 = f.pct, hits = 0, last = f.pct;
      for (var j=0;j<300;j++){ step(); b._atkTimer = 1e9; f.x = 300; f.vx = 0; f.y = gy - 24; f.vy = 0;
        var h = ${MINE}.filter(function(p){ return p.swarm === 'hatch'; });
        if (h.length && born === null){ born = j; out.n = h.length; out.delay0 = h.map(function(p){ return p.delay; }); out.hw = h.map(function(p){ return p.hw; }); out.xs0 = h.map(function(p){ return Math.round(p.x); });
          out.onFighter = h.filter(function(p){ return hurtGap(f, p.x, p.y) < p.r; }).length; out.invuln0 = f.invuln; }
        if (born !== null && j - born === 10) out.xs10 = h.map(function(p){ return Math.round(p.x); });
        if (born !== null && f.pct > last + 0.001){ if (hurtAt === null) hurtAt = j - born; hits++; last = f.pct; } }
      out.born = born; out.hurtAt = hurtAt; out.hits = hits; out.taken = f.pct - pct0; out.full = bossDmg(); out.wait = SWARM.hatchWait;
      return out; })()`);
    expect(r.born, 'they hatch').not.toBeNull();
    expect(r.n).toBe(10);
    expect(r.onFighter, 'born on the fighter: that is the glitch').toBeGreaterThan(0);
    expect(r.invuln0, 'who has no grace to protect them').toBe(0);
    expect(r.hw.every((v) => v === r.wait) && r.wait, 'each is held for the wait').toBe(18);
    expect(r.delay0.every((d) => d >= r.wait - 1 && d <= r.wait), `and is held as it is born: ${r.delay0}`).toBe(true);
    expect(r.xs10, 'held where it was born: it does not move').toEqual(r.xs0);
    expect(r.hurtAt, 'not one hurts before it has hatched').toBeGreaterThanOrEqual(r.wait - 1);
    expect(r.hits, 'and once they have, they are a boss hit').toBeGreaterThan(0);
    expect(r.taken, 'one boss hit at most, as the move always was').toBeLessThanOrEqual(r.full + 1e-6);
  });

  it('a hatchling in the sac is drawn small and squirming and grows into its size as it is let go; it is held for the wait in the snapshot too, so a client sees it the same', () => {
    const { w, log } = bootRecording();
    const hs = (delay) => {
      w.eval(`(function(){ BOSS_ARENA = 'hive'; var gy = groundY(); drawProjectile({ x:400, y:gy - 20, vx:0, vy:0, r:6, owner:-2, ownerObj:{ team:-1, idx:-2 }, color:'#a05ae0', life:50, shape:'bughatch', swarm:'hatch', ph:1, hw:18, delay:${delay}, hd:1, bob:3 }); })()`);
    };
    const widths = [];
    for (const d of [18, 9, 0]) { log.length = 0; hs(d); const m = log.filter((e) => e.op === 'ellipse' || e.op === 'arc'); widths.push(m.length ? Math.max(...m.map((e) => Math.max(e.args[2] || 0, e.args[3] || 0))) : 0); }
    expect(widths.every((x) => Number.isFinite(x)), 'it draws').toBe(true);
    expect(widths[0] <= widths[1] && widths[1] <= widths[2], `smaller while it is held, full size once it is let go: ${widths}`).toBe(true);
    w.eval('BOSS_ARENA = null');
  });
});

describe('SWARM WAVE!: the crests climb the ledge from phase 2', () => {
  // "SWARM WAVE! one more crest a phase and platform climbing from P2" (the owner's pick, Round 17): it was phase 3.
  it('phase 1 leaves the ledge alone; from phase 2 a crest runs along the ledge\'s top and a fighter standing on it is in the tide\'s way, for a whole boss hit', () => {
    const r = W.eval(`(function(){ var out = {};
      [1,2].forEach(function(ph){
        ${STAGE(700, 'ph')} var pl = worldPlats[0]; f.x = pl.x + pl.w/2; f.y = pl.y - 24; ${FIRE('swarm')}
        var sawPlat = 0, bad = false, pct0 = f.pct;
        for (var i=0;i<420;i++){ step(); b._atkTimer = 1e9; f.x = pl.x + pl.w/2; f.vx = 0; f.y = pl.y - 24; f.vy = 0;
          ${MINE}.forEach(function(p){ if (p.lane === 'plat' && !(p.delay > 0)){ sawPlat++; if (p.y > pl.y || p.y < pl.y - 60) bad = true; } }); }
        out[ph] = { sawPlat: sawPlat, bad: bad, taken: f.pct - pct0 }; });
      out.full = bossDmg(); out.climb = SWARM.tide.map(function(T){ return T && T.climb; }); out.n = SWARM.tide.map(function(T){ return T && T.n; });
      // the marks say so too: the lane along the ledge's top is lit while the tide winds up, and the ledge's door on the wall
      return out; })()`);
    expect(r.climb, 'the table: it climbs from phase 2').toEqual([null, false, true, true]);
    expect(r.n, 'and the crests: 4, 5, 5 (one more than 3, 4, 4)').toEqual([null, 4, 5, 5]);
    expect(r[1].sawPlat, 'phase 1: nothing runs along the ledge').toBe(0);
    expect(r[1].taken, 'so the ledge is the way out of a phase-1 tide').toBe(0);
    expect(r[2].sawPlat, 'phase 2: a crest runs along the ledge').toBeGreaterThan(0);
    expect(r[2].bad, 'on its top').toBe(false);
    expect(r[2].taken, 'and the ledge is no refuge now').toBeCloseTo(r.full, 5);
  });

  it('the wind-up shows the way up from phase 2: the ledge\'s lane is lit along its top, a goo strand hangs at each end of it, and the wall\'s ledge-height cell lights too -- none of it in phase 1', () => {
    const { w, log } = bootRecording();
    const marks = (ph) => {
      w.eval(`(function(){ var gy = groundY(); SETTINGS.mode='boss'; running=true; BOSS_ARENA = 'hive'; worldPlats = platRectsSmall(); projectiles = []; fighters = [];
        summons = [{ type:'boss', name:'The Bug Swarm', attack:'swarm', sprite:'bug', r:78, x:800, y:gy-78, face:-1, hp:100, maxHp:225, _phase:${ph}, _tel:20, _telKind:'swarm', flash:0, _bossRush:true, _sw:{ d:1 } }]; })()`);
      log.length = 0; w.eval('swarmDrawFx()'); const fx = log.filter((e) => e.op === 'bezierCurveTo').length;
      log.length = 0; w.eval('drawArenaDecor("hive")'); const cells = log.filter((e) => e.op === 'fill' && /^rgba\(255,90,210/.test(e.fill)).length;
      w.eval('summons = []; BOSS_ARENA = null');
      return { goo: fx, cells };
    };
    expect(marks(1), 'phase 1: no strands, only the floor\'s door').toEqual({ goo: 0, cells: 1 });
    const p2 = marks(2), p3 = marks(3);
    expect(p2.goo, 'phase 2: two strands for each ledge').toBeGreaterThan(0);
    expect(p2.cells, 'and the ledge-height door lights as well as the floor\'s').toBe(2);
    expect(p3).toEqual(p2);
  });
});

// A boot whose canvas records every call with the fill and stroke in force, so a test can see what was painted.
function bootRecording() {
  const html = readFileSync('artifacts/V1/index.html', 'utf8');
  const log = [], state = { fillStyle: '#000000', strokeStyle: '#000000' }, grad = { addColorStop() {} };
  const rec = new Proxy({}, {
    get: (_t, p) => {
      if (p === 'measureText') return () => ({ width: 0 });
      if (p === 'canvas') return { width: 1100, height: 720 };
      if (p === 'getImageData') return () => ({ data: [] });
      if (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createConicGradient' || p === 'createPattern') return () => grad;
      if (Object.prototype.hasOwnProperty.call(state, p)) return state[p];
      return (...args) => { log.push({ op: String(p), args, fill: state.fillStyle, stroke: state.strokeStyle }); };
    },
    set: (_t, p, v) => { state[p] = v; return true; },
  });
  const dom = new JSDOM(html, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      window.HTMLCanvasElement.prototype.getContext = () => rec;
      window.Math.random = mulberry32(3);
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
    },
  });
  return { w: dom.window, log };
}
const TEXT_OPS = new Set(['fillText', 'strokeText']);
// Everything of the swarm's that draws, called on a recording canvas with `stub` deciding which art has "loaded"
const DRAW_ALL = (stub) => `(function(){
  var gy = groundY(), used = [], _ai = attackImage;
  attackImage = function(k){ if(!ATTACK_SPRITES[k]) return null; used.push(k); return ${stub} ? { complete:true, naturalWidth:80, naturalHeight:60 } : null; };
  try {
    SETTINGS.mode='boss'; running=true; BOSS_ARENA = 'hive'; worldPlats = platRectsSmall(); projectiles = [];
    fighters = [{ idx:0, x:400, y:gy - 30, r:26, dead:false }];   // one for the poison to ring (swarmDrawFx, and the hazard's 'over' wash)
    [1,2,3].forEach(function(ph){
      var s = { type:'boss', name:'The Bug Swarm', color:'#6a2ea0', sprite:'bug', attack:'swarm', r:78, x:500, y:gy-78, face:1, hp:100, maxHp:225, _phase:ph, _tel:0, _telKind:null, flash:0, _bossRush:true, homeX:500,
        _sw:{ d:1, f:hazardT - 5, ox:200, oy:gy-78, s:hazardT - 4, h:hazardT - 40, q:hazardT - 70, b:[300, gy-24] }, _hz:{ g:[[300, 60, 200, 0], [700, 40, 1e9, 1.4]], ps:1, pt:30 } };
      s._sw.b2 = [600, gy-24]; s._sw.sg = swarmStingLine(s, 300, gy - 24); s._sw.pz = { 0: 140 }; s._sw.st = hazardT - 10; s._sw.sc = [WW, gy - 52];   // phase 3's second ball, the sting's line, a fuse burning, the steam
      summons = [s];
      [0, 18, 30].forEach(function(tel){ ['swarm','swarmseek','dodgeball','eggsac','swarmsting'].forEach(function(k){ s._tel = tel; s._telKind = k;
        ctx.save(); drawBossSprite(s); ctx.restore(); drawArenaDecor('hive'); swarmDrawFx(); }); });
      s._tel = 0; s.flash = 6; ctx.save(); drawBossSprite(s); ctx.restore(); s.flash = 0;
      drawArenaHazard('under'); drawArenaHazard('over');
      var shots = [{ shape:'bugpurple', swarm:'tide' }, { shape:'bugred', swarm:'tide' }, { shape:'bugbig', swarm:'alpha', r:15 }, { shape:'bugsting', swarm:'seek', r:10 }, { shape:'bugsting', swarm:'sting', r:20, vx:-20, vy:0.7 },
        { shape:'bugball', swarm:'ball', r:34 }, { shape:'bughatch', swarm:'hatch', r:6, ph:ph }, { shape:'bughatch', swarm:'hatch', r:20, ph:ph },
        { shape:'bughatch', swarm:'hatch', r:6, ph:ph, vx:0, hw:18, delay:12, hd:-1 }, { shape:'bughatch', swarm:'hatch', r:6, ph:ph, vx:0, hw:18, delay:1, hd:1 },
        { shape:'bugsac', swarm:'sac', tot:97, delay:90, lt:53, tx:300, ly:578 }, { shape:'bugsac', swarm:'sac', tot:97, delay:20, lt:53, tx:300, ly:578 }, { shape:'bugsac', swarm:'sac', tot:97, delay:2, lt:53, tx:300, ly:578 }];
      [0, 3, 5, 12, 25, 40, 60, 69].forEach(function(t){ shots.push({ shape:'bugend', swarm:'end', tot:70, delay:70 - t, ex:500, ey:gy-78, er:78 }); });
      ['bugpurple','bugred','bugcool','bugsting','bugegg','bugeggs','bugsplat','bugbig','bughost','bugmutant','buglarva','bugqueen'].forEach(function(k){ shots.push({ shape:k }); });
      shots.forEach(function(sh){ drawProjectile(Object.assign({ x:400, y:gy-30, vx:-6, vy:0, r:9, owner:-2, ownerObj:{ team:-1, idx:-2 }, color:'#a05ae0', life:50 }, sh)); });
    });
    swarmGroundPattern(ctx, gy, -20, WW+20, WH + 720, BOSS_ARENA_GROUND.hive);
    summons = [];
    return used.filter(function(k, i, a){ return a.indexOf(k) === i; });
  } finally { attackImage = _ai; }
})()`;

describe('three phases, each changing the fight', () => {
  it('phase 2, Second Wave: every egg pile on the floor cracks and hatches at once (goo where they were), the pitcher plant wakes, and the card names it', () => {
    const r = W.eval(`(function(){ var out = {}; ${STAGE(300, 1)} var gy = groundY();
      for (var i=0;i<3;i++){ step(); f.invuln = 1e9; }
      out.p1 = { h: b._sw.h, ps: b._hz.ps, pt: b._hz.pt, goo: b._hz.g ? b._hz.g.length : 0 };
      b.hp = b.maxHp*0.5; var d0 = IMPACT_DEBRIS.length, t0 = hazardT; updateBossAttack(b, f);
      out.phase = b._phase; out.card = document.getElementById('banner').textContent; out.kind = window.__lastBanner && window.__lastBanner.kind;
      out.h = b._sw.h - t0; out.goo = b._hz.g.map(function(q){ return [q[0], q[1], q[2] > 415]; }); out.debris = IMPACT_DEBRIS.length - d0; out.WW = WW;
      step(); out.pt = b._hz.pt; out.ps = b._hz.ps;
      return out; })()`);
    expect(r.p1.h, 'phase 1: the piles are whole').toBeUndefined();
    expect(r.p1.goo).toBe(0);
    expect(r.p1.pt, 'the plant sleeps in phase 1').toBeUndefined();
    expect(r.phase).toBe(2);
    expect(r.card).toBe('The Bug Swarm — PHASE 2: Second Wave');
    expect(r.kind, 'a Boss Rush card, not a telegraph').toBe('sys');
    expect(r.h, 'the beat is stamped at the phase change').toBe(0);
    expect(r.goo, 'four piles, four pools of goo where they cracked (each lasts seven seconds)').toEqual([0.10, 0.30, 0.55, 0.72].map((fx) => [Math.round(r.WW*fx), 46, true]));
    expect(r.debris, 'and they burst').toBeGreaterThan(0);
    expect(r.ps).toBe(0);
    expect(r.pt, 'the plant is awake: its shut phase (150 frames) runs').toBeGreaterThan(140);
    expect(r.pt).toBeLessThan(150);
  });

  it('phase 3, Swarm Frenzy: a wall bursts far from you, goo pours out of it and spreads to 150 px either side, the Queen\'s shadow fills the back, and the card names it', () => {
    const r = W.eval(`(function(){ var out = {}; ${STAGE(300, 2)} var gy = groundY();
      out.g0 = b._hz.g.length; b.hp = b.maxHp*0.2; var d0 = IMPACT_DEBRIS.length, t0 = hazardT; updateBossAttack(b, f);
      out.phase = b._phase; out.card = document.getElementById('banner').textContent; out.q = b._sw.q - t0; out.debris = IMPACT_DEBRIS.length - d0; out.WW = WW;
      var flood = b._hz.g.filter(function(q){ return q[3] > 0; }); out.flood = flood.map(function(q){ return [q[0], q[1] >= 40 && q[1] < 43, q[2] > 1e8, q[3]]; });
      for (var i=0;i<120;i++){ step(); f.invuln = 1e9; f.x = 300; }
      out.hw = b._hz.g.filter(function(q){ return q[3] > 0; }).map(function(q){ return Math.round(q[1]); });
      return out; })()`);
    expect(r.phase).toBe(3);
    expect(r.card).toBe('The Bug Swarm — PHASE 3: Swarm Frenzy');
    expect(r.q).toBe(0);
    expect(r.debris).toBeGreaterThan(0);
    expect(r.flood, 'the far wall (you are on the left): a small pool at its foot that never dries and keeps growing').toEqual([[r.WW - 40, true, true, 1.4]]);
    expect(r.hw, 'and spreads, then stops at SWARM.goo.flood').toEqual([150]);
  });

  it('what he wears changes with the phase: the Host Bug and purple bugs; red-spotted bugs join in phase 2; the mutated bug and the Queen\'s pink-spotted ones in phase 3', () => {
    const { w } = bootRecording();
    const keysFor = (ph) => w.eval(`(function(){ var gy = groundY(), used = [], _ai = attackImage;
      attackImage = function(k){ used.push(k); return { complete:true, naturalWidth:80, naturalHeight:60 }; };
      try { swarmDrawBody(ctx, 78, { _phase:${ph}, _tel:0, face:1, _sw:{ f:-999 } }, false); } finally { attackImage = _ai; }
      return used.filter(function(k, i, a){ return a.indexOf(k) === i; }).sort(); })()`);
    const p1 = keysFor(1), p2 = keysFor(2), p3 = keysFor(3);
    expect(p1).toEqual(['bugcool', 'bughost', 'bugpurple']);
    expect(p2).toEqual(['bugcool', 'bughost', 'bugpurple', 'bugred']);
    expect(p3).toEqual(['bugcool', 'bugmutant', 'bugpurple', 'bugqueen', 'bugred']);
  });
});

describe('the Bug Hive: the arena and its hazards', () => {
  it('has its own purple sky and ground, a honeycomb wall whose cells light up on the wall a move comes in at, egg piles that crack in phase 2 -- and paints no text', () => {
    const { w, log } = bootRecording();
    expect(w.eval('BOSS_ARENA_SKY.hive')).toEqual(['#2b1546', '#150a26']);
    expect(w.eval('({ fill: BOSS_ARENA_GROUND.hive.fill, line: BOSS_ARENA_GROUND.hive.line, pattern: typeof BOSS_ARENA_GROUND.hive.pattern })')).toEqual({ fill: '#4a2864', line: '#1c0e2a', pattern: 'function' });
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow(); running=false; BOSS_ARENA = 'hive';`);
    const gy = w.eval('groundY()');
    log.length = 0; w.eval('draw()');
    const fills = log.filter((e) => e.op === 'fillRect' && e.args[0] === -20 && e.args[1] === gy).map((e) => e.fill);
    expect(fills[0], 'the hive lays its own ground, and its goo lip along the floor line').toBe('#4a2864');
    expect(fills.slice(1).every((f) => /^rgba\(140,210,70/.test(f))).toBe(true);
    expect(log.filter((e) => e.op === 'stroke').map((e) => e.stroke)).toContain('#1c0e2a');
    // the cells: dark when nothing is coming, pink on the wall a move comes in at while it winds up
    const lit = (setup) => { w.eval(`(function(){ var gy = groundY(); summons = [{ type:'boss', name:'The Bug Swarm', attack:'swarm', sprite:'bug', r:78, x:500, y:gy-78, face:1, hp:100, maxHp:225, _phase:1, flash:0, _bossRush:true, ${setup} }]; })()`);
      log.length = 0; w.eval('drawArenaDecor("hive")'); w.eval('summons = []');
      return log.filter((e) => e.op === 'fill' && /^rgba\(255,90,210/.test(e.fill)).length; };
    expect(lit('_tel:0, _telKind:"swarm", _sw:{ d:1 }'), 'not winding up: none lit').toBe(0);
    expect(lit('_tel:20, _telKind:"swarm", _sw:{ d:1 }'), 'a tide about to come in at the left wall: its floor cell').toBe(1);
    expect(lit('_tel:20, _telKind:"dodgepattern", _sw:{ d:-1 }'), 'the bug tunnel is gone ("remove the bug tunnel attack.", 2026-10-01): nothing lights for it, let alone all three cells').toBe(0);
    expect(lit('_tel:20, _telKind:"swarmseek", _sw:{ d:1 }'), 'a move that comes from his body lights none').toBe(0);
    // POISON STING!: the cell the stinger perches on lights, whichever of the three heights its line starts at -- and only that cell
    const SG = (d, lane) => `{ d:${d}, lane:${lane}, x0:0, y0:0, x1:100, y1:0, ux:1, uy:0, len:100 }`;
    for (const lane of [0, 1, 2]) expect(lit(`_tel:20, _telKind:"swarmsting", _sw:{ d:1, sg:${SG(1, lane)} }`), `the stinger on cell ${lane}: that one cell lit`).toBe(1);
    expect(lit(`_tel:20, _telKind:"swarmsting", _sw:{ d:1 }`), 'no line fixed yet: none').toBe(0);
    expect(lit(`_tel:0, _telKind:"swarmsting", _sw:{ d:1, sg:${SG(1, 0)} }`), 'not winding up: none').toBe(0);
    w.eval('BOSS_ARENA = null');
  });

  it('draws everything of the swarm -- body, tells, decor, marks, shots, the sac, the button, the plant, the goo, the ground -- with no text and without the art loaded or with it', () => {
    const { w, log } = bootRecording();
    log.length = 0;
    const withArt = w.eval(DRAW_ALL(true));
    const nWith = log.length, imgs = log.filter((e) => e.op === 'drawImage').length;
    expect(imgs, 'the show\'s own art is what is drawn').toBeGreaterThan(300);
    expect(log.filter((e) => TEXT_OPS.has(e.op)), 'no words').toEqual([]);
    expect(withArt).toEqual(expect.arrayContaining(['bugpurple', 'bugred', 'bugcool', 'bugsting', 'bugeggs', 'bugbig', 'bughost', 'bugmutant', 'buglarva', 'bugqueen']));
    log.length = 0;
    w.eval(DRAW_ALL(false));
    expect(log.filter((e) => e.op === 'drawImage').length, 'until it has loaded, drawn stand-ins: no image').toBe(0);
    expect(log.length, 'and the stand-ins paint plenty').toBeGreaterThan(nWith*0.3);
    expect(log.filter((e) => TEXT_OPS.has(e.op)), 'no words').toEqual([]);
  });

  it('STICKY GOO slows whoever stands in it on the floor (not one in the air), pools age out, and there are at most seven', () => {
    const r = W.eval(`(function(){ var out = {}; ${STAGE(300, 1)} var gy = groundY();
      b._hz = { g:[[300, 60, 100, 0]] }; step(); out.floor = f.slowed;
      f.slowed = 0; f.x = 500; step(); out.beside = f.slowed;
      f.x = 300; f.y = gy - 24 - 120; f.vy = 0; f.slowed = 0; step(); out.air = f.slowed;
      b._hz = { g:[[300, 60, 3, 0]] }; step(); step(); step(); step(); out.gone = b._hz.g.length;
      b._hz = {}; for (var i=0;i<10;i++) swarmGoo(b, 100 + i*50, 30); out.n = b._hz.g.length; out.first = b._hz.g[0][0];
      return out; })()`);
    expect(r.floor, 'slowed while it stands in goo (the sticky puddle\'s own effect)').toBeGreaterThan(0);
    expect(r.beside).toBe(0);
    expect(r.air).toBe(0);
    expect(r.gone).toBe(0);
    expect(r.n).toBe(7);
    expect(r.first, 'the oldest goes').toBe(250);
  });

  it('the PITCHER PLANT sleeps in phase 1; awake from phase 2 its maw gapes for a moment, then snaps shut on whoever stands in it -- 0.6 of a boss hit a snap, up and away -- every 210 frames, 160 in phase 3', () => {
    const r = W.eval(`(function(){ var out = {}, m;
      var run = function(ph, n){ ${STAGE(300, 'ph')} m = swarmMaw(); var cx = (m.x0 + m.x1)/2, gy = groundY(); var hits = [], last = 0, opened = null, snaps = [];
        for (var i=0;i<n;i++){ f.x = cx; f.vx = 0; f.y = gy - 24; f.vy = 0; step();
          if (b._hz.ps && opened === null) opened = i;
          if (f.pct > last + 0.01){ hits.push({ i: i, d: Math.round((f.pct - last)*100)/100, vx: Math.sign(f.vx), vy: Math.sign(f.vy) }); last = f.pct; } }
        return { hits: hits, opened: opened }; };
      out.p1 = run(1, 500); out.p2 = run(2, 460); out.p3 = run(3, 340); out.full = bossDmg(); out.o = SWARM.plant;
      return out; })()`);
    expect(r.p1.hits, 'asleep').toEqual([]);
    expect(r.p1.opened).toBe(null);
    expect(r.p2.hits.map((h) => h.d), 'a snap of 0.6 of a boss hit, every time it shuts on him').toEqual([r.full*0.6, r.full*0.6].map((v) => Math.round(v*100)/100));
    expect(r.p2.hits[0].vx, 'thrown out, to the left...').toBe(-1);
    expect(r.p2.hits[0].vy, '...and up').toBe(-1);
    expect(r.p2.hits[1].i - r.p2.hits[0].i, 'phase 2: one snap every 150 + 60 frames').toBe(r.o.shut[2] + r.o.open[2]);
    expect(r.p3.hits[1].i - r.p3.hits[0].i, 'phase 3: every 110 + 50').toBe(r.o.shut[3] + r.o.open[3]);
    expect(r.p2.opened, 'it gapes for a beat before it snaps').toBeGreaterThan(100);
  });

  it('the plant eats the bugs that come toward its maw -- a crest coming in from the left, a crawler -- from phase 2, but not the ones that come in at the right wall, and not while it sleeps', () => {
    const r = W.eval(`(function(){ var out = {};
      var test = function(ph, o){ ${STAGE(300, 'ph')} var m = swarmMaw(), gy = groundY(); f.invuln = 1e9;
        var p = addProj(swarmShot(b, Object.assign({ x:(m.x0 + m.x1)/2, y:gy - 10, vx:0, vy:0, bossAtk:++BOSS_ATK_ID, life:200, lane:'floor', dy:0, bob:0, front:false, ph:1 }, o)));
        step(); return p.life > 0; };
      out.p1 = test(1, { swarm:'tide', dir:1 });
      out.crest = test(2, { swarm:'tide', dir:1 });
      out.fromRight = test(2, { swarm:'tide', dir:-1 });
      out.crawler = test(2, { swarm:'crawl', spd:0 });
      out.hatch = test(2, { swarm:'hatch', spd:0, r:9 });
      return out; })()`);
    expect(r.p1, 'asleep: nothing eaten').toBe(true);
    expect(r.crest, 'a crest coming toward it').toBe(false);
    expect(r.fromRight, 'the tide that comes in at the right wall starts beside the maw').toBe(true);
    expect(r.crawler).toBe(false);
    expect(r.hatch).toBe(false);
  });
});

describe('the ending: The Announcer presses a Delete Bugs Button and the bugs vanish', () => {
  it('when he falls a button comes down where he was and his bugs vanish: no text, an inert scene that touches nobody, his shots swept, the chewed ledge whole again, the card held back 1.1 s', () => {
    const r = W.eval(`(function(){ ${STAGE(500, 1)}
      var st = setTimeout, timers = [], said = [], _b = banner, gy = groundY();
      setTimeout = function(fn, ms){ timers.push({ fn: fn, ms: ms }); return 0; };
      banner = function(t, m, k, l){ said.push([String(t), k || null]); return _b(t, m, k, l); };
      try {
        BOSSRUSH.active = true; var pl = worldPlats[0], w0 = pl.w; pl._swx = { x:pl.x, w:w0 }; pl.w = w0 - 60; pl.x += 30;
        b.x = 500; b.y = gy - b.r; b._sw = { d:-1 }; swarmWave(b, f, ++BOSS_ATK_ID); addProj(swarmShot(b, { swarm:'hatch', shape:'bughatch', x:100, y:gy - 9, vx:1, vy:0, r:9, bossAtk:1, life:200 }));
        var before = ${MINE}.length; b.hp = 0; var e0 = IMPACT_DUST.length; bossRushCheck();
        var scene = ${MINE}.filter(function(p){ return p.swarm === 'end'; });
        var out = { before: before, scene: scene.length, others: ${MINE}.filter(function(p){ return p.swarm !== 'end'; }).length, ex: scene[0].ex, er: scene[0].er, tot: scene[0].tot, delay: scene[0].delay, dmg: scene[0].dmg,
          plat: [Math.round(pl.w), Math.round(pl.x), Math.round(w0)], ms: timers.map(function(t){ return t.ms; }), saidNow: said.slice(), dust: IMPACT_DUST.length - e0, holdMs: BOSS_ENDINGS.swarm.holdMs, line: BOSS_ENDINGS.swarm.line, full: bossDmg() };
        var card = timers.find(function(t){ return t.ms === 1100 && String(t.fn).indexOf('downCard') >= 0; }), run0 = running; running = true; if (card) card.fn(); running = run0;
        out.after = said.slice(out.saidNow.length);
        // the scene plays out over a fighter standing in it, and hurts him not at all
        f.x = 500; f.y = gy - 24; var pct0 = f.pct, n = 0; while (${MINE}.some(function(p){ return p.swarm === 'end'; }) && n < 200){ step(); f.x = 500; f.vx = 0; f.y = gy - 24; f.vy = 0; n++; }
        out.frames = n; out.taken = f.pct - pct0; out.left = ${MINE}.length;
        return out;
      } finally { setTimeout = st; banner = _b; BOSSRUSH.active = false; summons = []; projectiles = []; }
    })()`);
    expect(r.scene, 'one scene').toBe(1);
    expect(r.others, 'his bugs are swept').toBe(0);
    expect(r.before, 'a tide of them (three crests of eight, and one hatchling)').toBeGreaterThan(20);
    expect([r.ex, r.er], 'where he fell, and how big he was').toEqual([500, 78]);
    expect(r.tot).toBe(70);
    expect(r.dmg, 'it hurts nobody').toBe(0);
    expect(r.plat[0], 'the ledge he chewed is whole again').toBe(r.plat[2]);
    expect(r.holdMs).toBe(1100);
    expect(r.line, 'no words: only Springy\'s ending has a line').toBeUndefined();
    expect(r.ms, 'the card after 1.1 s, the next boss after 1.5 + 1.1').toEqual(expect.arrayContaining([1100, 2600]));
    expect(r.saidNow.some(([, k]) => k === 'boss'), 'nothing said as he goes').toBe(false);
    expect(r.saidNow.some(([t]) => /BOSS DOWN/.test(t)), 'the card waits').toBe(false);
    expect(r.after.some(([t, k]) => /^BOSS DOWN!/.test(t) && k === 'sys')).toBe(true);
    expect(r.dust, 'the press shakes the floor: dust').toBeGreaterThan(0);
    expect(r.frames, 'the scene is over before the next boss comes').toBeLessThanOrEqual(72);
    expect(r.taken).toBe(0);
    expect(r.left).toBe(0);
  });
});

describe("the Bug Swarm's art is the show's, wired, credited and picked", () => {
  const KEYS = ['bugpurple', 'bugred', 'bugcool', 'bugsting', 'bugegg', 'bugeggs', 'bugsplat', 'bugbig', 'bughost', 'bugmutant', 'buglarva', 'bugqueen'];
  const FILES = { bugpurple: 'Purple bug.png', bugred: 'Red bug.png', bugcool: 'Cool bug.png', bugsting: 'Bug stinger.png', bugegg: 'Bug egg.png', bugeggs: 'Bug eggs.png', bugsplat: 'Bug Crushed.png',
    bugbig: 'Big buggy.png', bughost: 'Bug.png', bugmutant: 'GiantInsectMonsterBug.png', buglarva: 'Freakywormcritter.png', bugqueen: 'Screenshot 2024-05-16 6.37.23 PM-removebg-preview.png' };
  const slot = (file, slotName, open, close) => { const t = readFileSync(file, 'utf8'); const a = t.indexOf(open(slotName)), b = t.indexOf(close(slotName)); return t.slice(a, b); };

  it('twelve Bugs-page assets: clean transparent PNGs, projectile-sized, in the manifest with their wiki source, and credited', () => {
    const man = JSON.parse(readFileSync('scripts/attack-sprite-manifest.json', 'utf8'));
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const mine = slot('artifacts/V1/assets/sprites/CREDITS.md', 'credits', (s) => `<!-- @boss:swarm:begin ${s} -->`, (s) => `<!-- @boss:swarm:end ${s} -->`);
    for (const k of KEYS) {
      const e = man[k];
      expect(e, k + ' is in the manifest').toBeDefined();
      expect(e.who).toBe('The Bug Swarm');
      expect(e.file).toBe(k + '.png');
      expect(e.wiki).toBe('bfdi');
      expect(e.source, k).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/battlefordreamisland\/images\//);
      expect(e.srcTitle).toBe(FILES[k]);
      expect(e.key, k + ' needs no key: it is a clean file of the thing itself').toBeUndefined();
      const file = `artifacts/V1/assets/sprites/attacks/${k}.png`;
      expect(existsSync(file), file).toBe(true);
      const png = PNG.sync.read(readFileSync(file));
      expect([png.width, png.height]).toEqual([e.width, e.height]);
      expect(Math.max(png.width, png.height)).toBeLessThanOrEqual(128);
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      expect(clear / (png.width * png.height), k + ' is transparent round the bug').toBeGreaterThan(0.15);
      const alpha = (x, y) => png.data[(y * png.width + x) * 4 + 3];
      const corners = [alpha(0, 0), alpha(png.width - 1, 0), alpha(0, png.height - 1), alpha(png.width - 1, png.height - 1)];
      expect(corners.filter((a) => a < 16).length, k + ': not a sticker (a leg may touch one corner)').toBeGreaterThanOrEqual(3);
      expect(mine, k + ' is credited in the swarm\'s slot with its wiki file and source').toContain(`(${k}.png)`);
      expect(mine).toContain('File:' + FILES[k]);
      expect(mine).toContain(e.source);
      expect(credits).toContain(e.source);
    }
  });

  it('the picks are in the swarm\'s slot of the fetch script, each a file of the Bugs page; the game registers each art key with a drawn stand-in', () => {
    const mine = slot('scripts/fetch-attack-sprites.mjs', 'picks', (s) => `// @boss:swarm:begin ${s}`, (s) => `// @boss:swarm:end ${s}`);
    for (const k of KEYS) expect(mine, k).toMatch(new RegExp(`\\b${k}:\\s*\\{[^}]*file: '${FILES[k].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`));
    const r = W.eval(`(function(){ var out = {}; ${JSON.stringify(KEYS)}.forEach(function(k){ out[k] = [ATTACK_SPRITES[k] && ATTACK_SPRITES[k].src, !!PROJ_SHAPE[k], ATTACK_SPRITES[k] && ATTACK_SPRITES[k].h]; }); return out; })()`);
    for (const k of KEYS) {
      expect(r[k][0]).toBe(`assets/sprites/attacks/${k}.png`);
      expect(r[k][1], k + ' has a drawn stand-in').toBe(true);
      expect(r[k][2]).toBeGreaterThanOrEqual(6);
      expect(r[k][2]).toBeLessThanOrEqual(44);
    }
    // and the show's art is what each bug wears: the tide and the seekers draw with their art
    const shapes = W.eval(`({ tide: (function(){ ${STAGE(300, 1)} ${FIRE('swarm')} return ${MINE}[0].shape; })(), seek: (function(){ ${STAGE(300, 1)} BOSS_MOVES.swarmseek(b, f); return ${MINE}[0].shape; })() })`);
    expect(shapes).toEqual({ tide: 'bugpurple', seek: 'bugsting' });
  });
});

describe('no words on the screen, and nothing that is not his', () => {
  it('a Boss Rush fight against him says only his five telegraph names and the phase cards', () => {
    const { window: w } = loadMonolith();   // (a harness with gradients: beginMatchNow draws)
    const r = w.eval(`(function(){ var out = { banners: [] }; var _b = banner; banner = function(t, m, k, l){ out.banners.push({ text:String(t), kind:k || null }); return _b(t, m, k, l); };
      try {
        SETTINGS.mode='boss'; SETTINGS.count=2; SETTINGS.stocks=99; SETTINGS.itemRate=0; SETTINGS.items=false; chosen = ROSTER.find(function(r){ return r.name==='Firey'; }); beginMatchNow();
        fighters.forEach(function(f){ f.controller='ai'; });
        BOSSRUSH.bossIdx = 3; summons = []; projectiles = []; spawnBossRushBoss(); var b = summons.find(function(s){ return s.type==='boss'; });
        // his turns are drawn by position now (the owner, Round 17: "make the attacks based on fighter position."), and a fight with AI fighters that beats him in about 1300 frames has only a handful of turns:
        // so the five moves are asked for in turn (a forced move is used once), and the fight is what it was -- the banners it says, the cards, and nothing else
        var order = ['swarm', 'swarmseek', 'dodgeball', 'eggsac', 'swarmsting'], k = 0;
        var n = 0; while (running && n < 2400){ if (!(b._tel > 0) && !b._atkLive && b._atkTimer <= 2 && !b._pickForce) b._pickForce = order[k++ % 5]; step(); n++; if (b._phase === 1 && n === 900) b.hp = b.maxHp*0.5; if (b._phase === 2 && n === 1500) b.hp = b.maxHp*0.2; }
      } finally { banner = _b; }
      return out; })()`);
    const boss = r.banners.filter((b) => b.kind === 'boss').map((b) => b.text);
    expect(new Set(boss), 'five names: the tunnel\'s is gone ("remove the bug tunnel attack.", 2026-10-01), the sting\'s is the owner\'s pick').toEqual(new Set(['SWARM WAVE!', 'SEEKERS!', 'DODGEBALL!', 'EGG SAC!', 'POISON STING!']));
    const other = r.banners.filter((b) => b.kind !== 'boss' && !(b.text === 'GO!' || /^(KO'd!|You're out!|CAKE AT STAKE:)/.test(b.text) || b.kind === 'sys'));
    expect(other, 'no move popups, no status lines').toEqual([]);
    const sys = r.banners.filter((b) => b.kind === 'sys').map((b) => b.text);
    expect(sys).toEqual(expect.arrayContaining(['The Bug Swarm — PHASE 2: Second Wave', 'The Bug Swarm — PHASE 3: Swarm Frenzy']));
    expect(sys.filter((t) => /^ERROR/.test(t)), 'and the loop never threw').toEqual([]);
  });

  it('nothing of his is the Cobs prize or The Floor: no OJ, Suitcase, Cabby -- and it has no lifted text', () => {
    const html = readFileSync('artifacts/V1/index.html', 'utf8');
    const marks = [...html.matchAll(/^[ \t]*\/\/ @boss:swarm:begin (\w+)\r?\n([\s\S]*?)^[ \t]*\/\/ @boss:swarm:end \1\r?$/gm)];
    expect(marks.length, 'every slot of his').toBeGreaterThan(20);
    const text = marks.map((m) => m[2]).join('\n');
    expect(text.length).toBeGreaterThan(20000);
    // (case-sensitive and whole-word: "addProj" and "dropProj" contain "oj", and plenty of these comments say "the floor")
    expect(text, 'OJ, Suitcase and Cabby are only ever Cobs\'s prize; The Floor never').not.toMatch(/\bOJ\b|Suitcase|Cabby|\bThe Floor\b/);
    expect(text, 'no text is ever drawn by him').not.toMatch(/fillText|strokeText/);
  });
});

describe('a netcode client sees him', () => {
  it('his wall and aim, his gathering, his goo and plant, his sac and the ending scene cross the snapshot, and the client draws them', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow();
      BOSS_ARENA = 'hive'; var gy = groundY();
      summons = [{ type:'boss', name:'The Bug Swarm', color:'#6a2ea0', r:78, sprite:'bug', x:900, y:gy-78, hp:80, maxHp:225, face:-1, flash:0, homeX:900, _rage:false, _tel:20, _telKind:'dodgeball', _bossRush:true, attack:'swarm', _phase:3,
        _sw:{ d:-1, b:[300, gy-24], b2:[600, gy-24], f:hazardT - 4, ox:200, oy:gy-78, s:hazardT - 2, h:hazardT - 200, q:hazardT - 100, st:hazardT - 20, sc:[W, gy-52], pz:{ 0:120 },
          sg:{ x0:W, y0:Math.round(gy-52), x1:186, y1:Math.round(gy-20), ux:-1, uy:0.035, len:914, lane:0, d:-1 } }, _hz:{ g:[[300, 60, 200, 0], [700, 90, 1e9, 1.4]], ps:1, pt:30, sn:hazardT - 40 } }];
      var O = { owner:-2, ownerObj:{ team:-1, idx:-2 } };
      projectiles = [Object.assign({ x:390, y:gy-80, vx:0, vy:0, r:14, color:'#7fd63a', shape:'bugsac', swarm:'sac', tot:97, delay:40, lt:53, tx:300, ly:578, ph:2, bossAtk:6, life:1, dmg:0 }, O),
        Object.assign({ x:100, y:gy-9, vx:2, vy:0, r:14, color:'#a05ae0', shape:'bughatch', swarm:'hatch', ph:3, bossAtk:7, life:80 }, O),
        Object.assign({ x:200, y:gy-9, vx:0, vy:0, r:6, color:'#a05ae0', shape:'bughatch', swarm:'hatch', ph:3, bossAtk:7, life:80, delay:7, hw:18 }, O),
        Object.assign({ x:700, y:gy-40, vx:-20, vy:0.7, r:20, color:'#a05ae0', shape:'bugsting', swarm:'sting', ph:2, bossAtk:8, life:30 }, O),
        Object.assign({ x:500, y:gy+500, vx:0, vy:0, r:1, color:'#c02020', shape:'bugend', swarm:'end', tot:70, delay:35, ex:500, ey:gy-78, er:78, life:1, dmg:0 }, O)];
      var snap = JSON.parse(JSON.stringify(serializeState()));
      summons = []; projectiles = []; BOSS_ARENA = null;
      applySnapshot(snap);
      var err = null; try { summons.forEach(drawSummon); projectiles.forEach(drawProjectile); drawArenaDecor(BOSS_ARENA); drawArenaHazard('under'); drawArenaHazard('over'); swarmDrawFx(); } catch(e){ err = e.message; }
      return { sting: (function(){ var p = projectiles.find(function(q){ return q.swarm === 'sting'; }); return p && { shape: p.shape, vx: p.vx, vy: p.vy, r: p.r }; })(), held: (function(){ var p = projectiles.find(function(q){ return q.swarm === 'hatch' && q.hw; }); return p && { delay: p.delay, hw: p.hw }; })(),
        boss: snap.summons[0], pj: snap.pj.a.map(function(r){ return r[8]; }), arena: BOSS_ARENA, err: err, n: projectiles.length, sac: projectiles.find(function(p){ return p.swarm === 'sac'; }), end: projectiles.find(function(p){ return p.swarm === 'end'; }),
        hz: summons[0]._hz };
    })()`);
    expect(r.err).toBe(null);
    expect(r.arena, 'a client draws the hive').toBe('hive');
    expect(r.boss._sw, 'which wall, the ball\'s aim, when he gathered and was hit, the egg piles and the Queen').toMatchObject({ d: -1, b: [300, expect.any(Number)], ox: 200 });
    expect(r.boss._hz, 'the goo and the plant').toMatchObject({ g: [[300, 60, 200, 0], [700, 90, expect.any(Number), 1.4]], ps: 1, pt: 30 });
    expect(r.hz.g).toHaveLength(2);
    expect(r.sac, 'the sac, from its own timers').toMatchObject({ swarm: 'sac', tot: 97, delay: 40, lt: 53, tx: 300, ly: 578, shape: 'bugsac' });
    expect(r.end, 'and the Delete Bugs scene').toMatchObject({ swarm: 'end', tot: 70, delay: 35, ex: 500, er: 78, shape: 'bugend' });
    expect(r.n).toBe(5);
    // Round 17: phase 3's second ball's aim, POISON STING!'s line and the cell it left, the table of who is poisoned and for how long -- all in `_sw`, so a client draws the line, the ring and the green wash
    expect(r.boss._sw, 'the second ball\'s aim, the sting\'s line and perch, the steam, the poisoned fighters').toMatchObject({ b2: [600, expect.any(Number)], sg: { d: -1, lane: 0, x1: 186, len: 914 }, sc: [expect.any(Number), expect.any(Number)], st: expect.any(Number), pz: { 0: 120 } });
    expect(r.sting, 'the pounce: the stinger bug, with the heading a client turns its trail by').toMatchObject({ shape: 'bugsting', vx: -20, vy: 0.7, r: 20 });
    expect(r.held, 'a hatchling still squirming out of the sac: held, for as long as is left').toEqual({ delay: 7, hw: 18 });
  });
});

describe('the glitch pass (2026-10-01): what the swarm drew that a real canvas ignores', () => {
  // scripts/boss-glitch.mjs draws every frame -- and every netcode snapshot, as a client -- through a canvas that refuses what a real browser refuses (test/helpers/validating-canvas.js).
  // "a client draws swarmDrawDecor with globalAlpha -0.015 after he falls": the Queen's shadow fades in over 60 frames from `_sw.q`, the host's clock when phase 3 began, and a client whose
  // clock is a little behind the host's reads t - q below zero: 0.30 x -0.05 is an alpha the browser ignores. It is clamped now, and so is every other fade of the swarm's that reads a stamp.
  it('the Queen\'s shadow, the plant\'s snap, the steam of a cell, the goo and the sting\'s marks and shots all draw at alphas, radii and colours the canvas keeps -- with every clock a client might have, ahead or behind', async () => {
    const { w, errors } = await bootValidating();
    for (const skew of [-70, -6, -1, 0, 1, 6, 70]) {
      w.eval(`(function(){ var gy = groundY(), t = hazardT + ${skew}; BOSS_ARENA = 'hive'; SETTINGS.mode = 'boss'; worldPlats = platRectsSmall(); projectiles = [];
        fighters = [{ idx:0, x:400, y:gy - 30, r:26, dead:false }];
        var s = { type:'boss', name:'The Bug Swarm', color:'#6a2ea0', sprite:'bug', attack:'swarm', r:78, x:500, y:gy-78, face:1, hp:100, maxHp:225, _phase:3, _tel:20, _telKind:'swarmsting', flash:0, _bossRush:true, homeX:500,
          _sw:{ d:-1, q:t, h:t, f:t, s:t, st:t, sc:[W, gy-52], b:[300, gy-24], b2:[600, gy-24], pz:{ 0:90 }, sg:swarmStingLine({ _phase:3, _telPh:3 }, 300, gy - 24) }, _hz:{ g:[[300, 60, 200, 0]], ps:1, pt:30, sn:t } };
        summons = [s]; swarmDrawDecor(); drawArenaDecor('hive'); swarmDrawFx(); drawArenaHazard('under'); drawArenaHazard('over');
        [{ shape:'bugsting', swarm:'sting', r:20, vx:-20, vy:0.7 }, { shape:'bughatch', swarm:'hatch', r:6, ph:3, hw:18, delay:9, hd:1, vx:0, vy:0 }, { shape:'bugball', swarm:'ball', r:36 }].forEach(function(sh){
          drawProjectile(Object.assign({ x:400, y:gy-30, vx:-6, vy:0, r:9, owner:-2, ownerObj:{ team:-1, idx:-2 }, color:'#a05ae0', life:50 }, sh)); });
        summons = []; BOSS_ARENA = null; })()`);
    }
    expect(errors.filter((e) => e.kind.startsWith('ctx-')), 'nothing the canvas throws on or ignores').toEqual([]);
  });
});
