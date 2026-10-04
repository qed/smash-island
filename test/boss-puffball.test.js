import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { JSDOM } from 'jsdom';
import { bootMonolith } from './helpers/smash-golden.js';
import { loadMonolith } from './helpers/load-monolith.js';
import { mulberry32 } from './helpers/prng.js';

// PUFFBALL SPEAKER BOX, rebuilt (the boss overhaul, 2026-09-29: boss-overhaul-decisions.md, boss-plan-early.md section 4). Boss 2.
// The owner's decisions this file pins, each where it is tested:
//   "make the bosses more like springy ... but dont make them like him! make the attacks feel more immersive." -- telegraphed moves
//     that change the floor, phases that switch things on, a boss that moves, an arena that reacts; heavy hits (impact); canon
//     scenes, cited by line below.
//   Her FOUR attacks, approved (Round 9): SONIC BLAST! (the signature, redone: rainbow rings whose wall panels preview their heights,
//     looping from phase 1 now, 2 / 3 / 4 waves), CONSEQUENCES! (a spotlight lands on you, then she dashes and slices six times), RAINBOW BARF! (from
//     phase 2: a rainbow hose that reverses mid-sweep), PRIVATE! (she flies out of frame and shutters slam at both edges for 4 s,
//     shrinking the arena to the middle while she sings from outside) -- the plan's TRASH COMPACTOR! is cut.
//   "Harder, same damage": harder to dodge, damage per hit unchanged -- every extra shot of a turn keeps that turn's one attack id.
//   Arena (Round 11): the sinking, tilting Clubhouse of Awesomeness over the lead-paint lake, with "if it makes sense for a hazard,
//     reduce boss difficulty and add a hazard": the lake is the hazard, and her turns come slower to pay for it.
//   "3 each": three phases, each changing the fight.   "Endings: 'All of them'": a short canon exit scene, no text.
//   "no text on screen in a match except GO!, KOs, boss telegraph names and Boss Rush cards": her singing is sound and visuals.
//   "Yes, cut or draw": her shots wear the show's art where it has a clean file, and are drawn where it has none.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// The stage the real Boss Rush arena builds for one fighter: the floor at 0.82 H and one platform, 42% wide (x 353.65, y 446.4,
// 392.7 wide). A still Firey stands on the floor at `x` (or on the platform), and she is spawned the way the gauntlet spawns her, her
// attack timer parked. `phase` sets her HP before the settling steps, so the phase (its quake, its tilt) has begun by the test.
const PLAT = { x: 353.65, y: 446.4, w: 392.7 };
const STAGE = (x, o = {}) => `
  SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
  BOSSRUSH = { active:false, bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.name==='Puffball Speaker Box'; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats=[{ x:${PLAT.x}, y:${PLAT.y}, w:${PLAT.w}, h:14 }]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; impactFxClear();
  var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), ${x}, ${o.plat ? PLAT.y + '-24' : 'groundY()-24'}, 0);
  f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
  spawnBossRushBoss();
  var b = summons.find(function(s){ return s.type==='boss'; });
  ${o.phase ? `b.hp = b.maxHp*${{ 1: 1, 2: 0.5, 3: 0.2 }[o.phase]};` : ''}
  b._atkTimer = 1e9;
  for (var i0=0;i0<${o.settle == null ? 100 : o.settle};i0++) step();
  f.pct=0; f.invuln=0; f.hitstun=0; f.x=${x}; f.y=${o.plat ? PLAT.y + '-24' : 'groundY()-24'}; f.vx=0; f.vy=0; f.onground=true;
`;
// A bare boss for driving her functions directly (the pattern of test/boss-springy.test.js's S).
const S = (o = '') => `{ name:'Puffball Speaker Box', attack:'soundwave', x:550, y:300, r:85, hp:100, maxHp:100, _phase:1, _atkTimer:1, _tel:0,
  color:'#c0b0d0', face:1, homeX:550, stationary:false, vx:0, vy:0 ${o ? ',' + o : ''} }`;
// Runs one of her turns to its end (her next turn parked), holding the fighter where it stands if `hold`, and reads what it did.
const TURN = `
  function busy(b){ return b._tel>0 || b._psbRun || b._psbBarf || b._psbPriv || b._psbLoop || b._psbMv || projectiles.some(function(p){ return p.psb && p.life > 0; }); }
  function turn(kind, o){ o = o || {};
    // the owner, Round 17: "make the attacks based on fighter position." -- no fixed order any more, so a test forces the move it measures
    b._pickForce = kind; b._atkLive = null; b._atkTimer = 1; b._tel = 0;
    var rec = { kind:null, frames:0, shots:[], firstShot:null, minY:1e9, maxSh:0, telAt:-1, fireAt:-1, banner:null, pct0:f.pct }, started = false, _add = addProj;
    // every shot of hers is recorded as it is made (one that hits at once is gone by the time a frame is over): where, how fast, its damage and its id
    addProj = function(p){ if (p && p.psb){ rec.shots.push({ shape:p.shape, x:Math.round(p.x), y:Math.round(p.y), vx:+p.vx.toFixed(2), vy:+p.vy.toFixed(2), dmg:p.dmg, kb:p.kb, id:p.bossAtk, volley:!!p.volley, r:p.r,
      at:rec.frames + 1, delay:p.delay||0, bx:b.x, by:b.y, fx:f.x, fy:f.y, fvx:f.vx, fvy:f.vy, breaks:!!p.breaksOnSurface, life:p.life, warnX:p.warnX, warnY:p.warnY }); if (rec.firstShot == null) rec.firstShot = rec.frames; } return _add.apply(this, arguments); };
    try {
      for (var j=0;j<(o.max || 900);j++){
        window.__lastBanner = null; step(); rec.frames++;
        if (window.__lastBanner && !rec.banner) rec.banner = window.__lastBanner;
        if (b._tel>0 && !started){ started = true; rec.telAt = rec.frames; }
        if (started && !(b._tel>0)) b._atkTimer = 1e9;   // her next turn waits: this one is what is measured
        if (started && rec.fireAt < 0 && !(b._tel>0)) rec.fireAt = rec.frames;
        if (b._tel>0) rec.kind = b._telKind;
        if (o.hold){ f.x = o.x; f.y = o.plat ? ${PLAT.y}-24 : groundY()-24; f.vx = 0; f.vy = 0; f.onground = true; }
        if (o.each) o.each(rec, j);
        rec.minY = Math.min(rec.minY, b.y); if (b._hz && b._hz.sh > rec.maxSh) rec.maxSh = b._hz.sh;
        if (started && !busy(b)) break;
      }
    } finally { addProj = _add; }
    rec.taken = +(f.pct - rec.pct0).toFixed(3);
    return rec;
  }
`;

describe('Puffball Speaker Box is Boss 2, with four attacks of her own', () => {
  it('her row, her three second moves and their banners, her wind-ups, her pacing and her phase names', () => {
    const r = W.eval(`(function(){
      var idx = function(n){ return BOSS_ROSTER.findIndex(function(b){ return b.name===n; }); };
      var s = ${S()};
      var tel = {}; ['soundwave','consequences','rainbowbarf','private'].forEach(function(k){ s._telKind = k; tel[k] = bossTelLen(s); });
      var gaps = [1,2,3].map(function(p){ var q = ${S()}; q._phase = p; return bossAtkGap(q); });
      return { i: idx('Puffball Speaker Box'), before: idx('Announcer'), after: idx('Firey Speaker Box'), row: BOSS_ROSTER[idx('Puffball Speaker Box')],
               extra: BOSS_EXTRA['Puffball Speaker Box'], names: BOSS_EXTRA['Puffball Speaker Box'].map(function(k){ return typeof BOSS_MOVES[k] + '/' + BOSS_MOVE_NAME[k]; }),
               sig: bossTelName(${S()}), only: BOSS_EXTRA['Puffball Speaker Box'].map(function(k){ return BOSS_RUSH_ONLY.has(k); }),
               tel: tel, gaps: gaps, p2: bossPhaseName(s, 2), p3: bossPhaseName(s, 3), cut: BOSS_EXTRA['Puffball Speaker Box'].indexOf('compactor') };
    })()`);
    expect(r.row).toEqual({ name: 'Puffball Speaker Box', color: '#c0b0d0', hp: 200, big: 2.5, attack: 'soundwave', arena: 'clubhouse', stationary: false, sprite: 'speaker' });
    expect(r.i, 'Boss 2, between the Announcer and Firey Speaker Box').toBe(r.before + 1);
    expect(r.after).toBe(r.i + 1);
    // "SONIC BLAST!" (the signature, kept), then her three: CONSEQUENCES!, RAINBOW BARF! (from phase 2), PRIVATE! ("in place of the cut TRASH COMPACTOR!")
    expect(r.sig).toBe('SONIC BLAST!');
    expect(r.extra).toEqual(['consequences', 'rainbowbarf', 'private']);
    expect(r.names).toEqual(['function/CONSEQUENCES!', 'function/RAINBOW BARF!', 'function/PRIVATE!']);
    expect(r.cut, 'TRASH COMPACTOR! is cut').toBe(-1);
    expect(r.only, 'an item boss never throws them: they lean on her arena and her flight').toEqual([true, true, true]);
    expect(r.tel, 'each of her four has its own wind-up').toEqual({ soundwave: 44, consequences: 60, rainbowbarf: 40, private: 52 });
    // "if it makes sense for a hazard, reduce boss difficulty and add a hazard": longer than the shared 100 / 72 / 52
    // and paced: "bosses should attack a bit slower" (the owner, 2026-09-30) -- her 118 / 96 / 80 times BOSS_PACE (1.2)
    expect(r.gaps).toEqual([142, 115, 96]);
    expect(r.gaps[0]).toBeGreaterThan(100); expect(r.gaps[1]).toBeGreaterThan(72); expect(r.gaps[2]).toBeGreaterThan(52);
    // "When she got stabbed by Pin, her voice was stuck in a loop" (Puffball Speaker Box); the sinking Clubhouse (Catch These Hands)
    expect([r.p2, r.p3]).toEqual(['Stuck in a Loop', 'Sinking Clubhouse']);
  });

  // The owner, 2026-10-01 (Round 17): "make the attacks based on fighter position. if there is an attack that punishes being close, then they should use it more when ppl are close." -- "Position
  // picks all (Recommended)": the signature competes like every other move, so her turns are no longer SONIC BLAST!, CONSEQUENCES!, SONIC BLAST!, RAINBOW BARF!, ... She draws from the moves she has
  // unlocked: three in phase 1, the barf too from phase 2; no move twice in a row, and every one of them comes up (the picker's own tests are in test/boss-kit.test.js).
  it('draws her turns from the moves she has unlocked -- three in phase 1, RAINBOW BARF! too from phase 2 -- none twice in a row, every one in twelve turns, each named and none with a number', () => {
    const r = W.eval(`(function(){
      var out = {};
      [1, 2].forEach(function(ph){
        var s = ${S('hp:' + '100')}; s.hp = ph === 1 ? 100 : 50; s.maxHp = 100;
        var kinds = [], names = [];
        for (var i=0;i<12;i++){ s._atkTimer = 1; s._tel = 0; s._atkLive = null; window.__lastBanner = null; updateBossAttack(s, null); kinds.push(s._telKind); names.push(window.__lastBanner && window.__lastBanner.text + '|' + window.__lastBanner.kind); }
        out['p' + ph] = { kinds: kinds, names: names, phase: s._phase };
      });
      return out;
    })()`);
    expect(r.p1.phase).toBe(1);
    expect([...new Set(r.p1.kinds)].sort(), 'phase 1: her three').toEqual(['consequences', 'private', 'soundwave']);
    expect(r.p2.phase).toBe(2);
    expect([...new Set(r.p2.kinds)].sort(), 'phase 2: her four').toEqual(['consequences', 'private', 'rainbowbarf', 'soundwave']);
    for (const p of ['p1', 'p2']) expect(r[p].kinds.some((k, i) => i > 0 && k === r[p].kinds[i - 1]), `${p}: never the same move twice in a row: ${r[p].kinds}`).toBe(false);
    const say = { soundwave: 'SONIC BLAST!', consequences: 'CONSEQUENCES!', rainbowbarf: 'RAINBOW BARF!', private: 'PRIVATE!' };
    // a wind-up is announced by its name, as a 'boss' banner (the one kind of line a match may show), with no digit in it
    for (const p of ['p1', 'p2']) r[p].kinds.forEach((k, i) => {
      expect(r[p].names[i], `${p} turn ${i}`).toBe(say[k] + '|boss');
      expect(say[k]).not.toMatch(/\d/);
    });
  });

  it('walking the gauntlet spawns her second; beating her plays her ending (no text), leaves the platform level and moves on to Firey Speaker Box', () => {
    const r = W.eval(`(function(){
      var st = setTimeout; setTimeout = function(){ return 0; };   // bossRushCheck queues the next spawn and the card; this walk spawns by hand
      try {
        SETTINGS.mode='boss'; SETTINGS.stocks=99; running=true;
        BOSSRUSH = { active:true, bossIdx:0, cleared:0, defeated:false, loop:0, dmgMult:1 };
        worldPlats = [{ x:${PLAT.x}, y:${PLAT.y}, w:${PLAT.w}, h:14 }];
        var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 200, groundY()-24, 0);
        f.team=0; f.controller='still'; f.stocks=3; fighters=[f]; summons=[];
        var order = [], atHer = null, said = [], _b = banner;
        banner = function(t, m, k, l){ said.push([String(t), k || null]); return _b(t, m, k, l); };
        for (var i=0;i<3;i++){
          spawnBossRushBoss();
          var b = summons.find(function(s){ return s.type==='boss'; });
          order.push(b.name);
          if (b.name==='Puffball Speaker Box'){
            for (var k=0;k<120;k++){ step(); f.invuln = 99; }
            var hadRot = 'rot' in worldPlats[0], idx0 = BOSSRUSH.bossIdx;
            b.hp = b.maxHp*0.2; for (var k2=0;k2<160;k2++){ step(); f.invuln = 99; }   // deep in phase 3: the tower leans
            var leaned = b._hz.rot, rotDuring = 'rot' in worldPlats[0];
            projectiles.push({ owner:-2, psb:true, x:300, y:300, r:10, life:50, dmg:1, vx:0, vy:0 }, { owner:-2, x:0, y:0, r:8, life:50, dmg:1, vx:0, vy:0 });
            said.length = 0; b.hp = 0; bossRushCheck();
            atHer = { leaned: leaned, hadRot: hadRot, rotDuring: rotDuring, hasRot: 'rot' in worldPlats[0], psbShots: projectiles.filter(function(p){ return p.psb && !p.psbEnd; }).length,
                      others: projectiles.filter(function(p){ return !p.psb && !p.psbEnd; }).length, scene: projectiles.filter(function(p){ return p.psbEnd; }).length, bossLeft: summons.filter(function(s){ return s.type==='boss'; }).length,
                      advanced: BOSSRUSH.bossIdx - idx0, said: said.slice() };
            projectiles = [];
            continue;
          }
          b.hp = 0; bossRushCheck();
        }
        banner = _b;
        return { order: order, atHer: atHer };
      } finally { setTimeout = st; BOSSRUSH.active=false; running=false; paused=false; summons=[]; projectiles=[]; worldPlats=[]; }
    })()`);
    expect(r.order).toEqual(['Announcer', 'Puffball Speaker Box', 'Firey Speaker Box']);
    expect(r.atHer.leaned, 'in phase 3 the tower leans').toBeLessThan(-1);
    expect([r.atHer.hadRot, r.atHer.rotDuring, r.atHer.hasRot], 'and the platform is never tilted (a tilted platform sinks whoever stands on it): level for the next boss too').toEqual([false, false, false]);
    expect(r.atHer.psbShots, 'none of her shots is left flying').toBe(0);
    expect(r.atHer.others, 'nothing else is swept').toBe(1);
    expect(r.atHer.scene, 'her ending is one scene on the stage').toBe(1);
    expect(r.atHer.bossLeft).toBe(0);
    expect(r.atHer.advanced).toBe(1);
    expect(r.atHer.said.some(([t, k]) => k === 'boss'), 'no text: only Springy\'s ending has a line').toBe(false);
  });
});

describe('she floats: a puffball "almost always floats and flies" (Puffball (species))', () => {
  it('floats in through the ceiling, settles a jump from the platform and a hop from the floor, and never sinks into it', () => {
    const r = W.eval(`(function(){ ${STAGE(300, { settle: 0 })}
      var out = { hover: b.hover, y0: Math.round(b.y), r: b.r, gy: groundY(), samples: [], maxBottom: -1e9 };
      for (var i=0;i<PSB.enter + 50;i++){ step(); if (i === 20) out.y20 = Math.round(b.y); }
      out.yIn = Math.round(b.y);
      var lo = 1e9, hi = -1e9, xlo = 1e9, xhi = -1e9;
      for (var j=0;j<900;j++){ step(); f.invuln = 99; lo = Math.min(lo, b.y); hi = Math.max(hi, b.y); xlo = Math.min(xlo, b.x); xhi = Math.max(xhi, b.x); out.maxBottom = Math.max(out.maxBottom, b.y + b.r); if (b._tel > 0) b._tel = 0; }
      out.lo = lo; out.hi = hi; out.xlo = xlo; out.xhi = xhi; out.hoverY = psbHoverY(b); out.WW = WW;
      var jump = (JUMP*JUMP)/(2*GRAV);
      out.reach = { plat: (${PLAT.y} - 24) - psbHoverY({ r:b.r, _phase:3 }), floorJump: (groundY() - 24 - jump) - psbHoverY({ r:b.r, _phase:3 }), jab: b.r + 28 };
      return out;
    })()`);
    expect(r.hover, 'a puffball floats: updateSummons leaves her to psbMove').toBe(true);
    expect(r.y0, 'she starts above the screen').toBeLessThan(-r.r*2);
    expect(r.y20, 'and comes down').toBeGreaterThan(r.y0);
    expect(Math.abs(r.yIn - r.hoverY), 'to her float').toBeLessThan(20);
    expect(r.lo, 'she bobs, gently').toBeGreaterThan(r.hoverY - 30);
    expect(r.hi).toBeLessThan(r.hoverY + 30);
    expect(r.maxBottom, 'her body never sinks into the disco floor').toBeLessThanOrEqual(r.gy);
    expect(r.xlo, 'she drifts across the room, on screen').toBeGreaterThan(0);
    expect(r.xhi).toBeLessThan(r.WW);
    expect(r.xhi - r.xlo, 'and she does move').toBeGreaterThan(200);
    // never out of reach: a fighter on the platform hits her standing, one off the floor with a single jump
    expect(r.reach.plat).toBeLessThan(r.reach.jab);
    expect(r.reach.floorJump).toBeLessThan(r.reach.jab);
  });

  it('a hit makes her flinch: she jerks up, sparkles, and her colours jump for a moment', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var y0 = b.y, out = {};
      b.hp -= 5; step();
      out.flinch = b._psbFlinch; out.jump = b._psbJump; out.particles = particles.length;
      var minY = b.y; for (var i=0;i<14;i++){ step(); minY = Math.min(minY, b.y); }
      out.rise = y0 - minY; out.after = b._psbJump;
      for (var k=0;k<60;k++) step();
      out.settled = b._psbFlinch === 0 && b._psbJump === 0;
      return out;
    })()`);
    expect(r.flinch).toBeGreaterThan(0);
    expect(r.jump, 'the colours jump').toBeGreaterThan(r.flinch);
    expect(r.particles, 'sparkles').toBeGreaterThan(4);
    expect(r.rise, 'a jerk upward').toBeGreaterThan(3);
    expect(r.settled).toBe(true);
  });
});

// A boot whose canvas records every call with the fill, stroke and alpha in force, so a test can see what her drawing painted.
function bootRecording(seed = 3) {
  const html = readFileSync('artifacts/V1/index.html', 'utf8');
  const log = [], state = { fillStyle: '#000000', strokeStyle: '#000000', globalAlpha: 1 }, grad = { addColorStop() {} };
  const rec = new Proxy({}, {
    get: (_t, p) => {
      if (p === 'measureText') return () => ({ width: 0 });
      if (p === 'canvas') return { width: 1100, height: 720 };
      if (p === 'getImageData') return () => ({ data: [] });
      if (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createConicGradient' || p === 'createPattern') return () => grad;
      if (Object.prototype.hasOwnProperty.call(state, p)) return state[p];
      return (...args) => { log.push({ op: String(p), args, fill: state.fillStyle, stroke: state.strokeStyle, alpha: state.globalAlpha }); };
    },
    set: (_t, p, v) => { state[p] = v; return true; },
  });
  const dom = new JSDOM(html, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      window.HTMLCanvasElement.prototype.getContext = () => rec;
      window.Math.random = mulberry32(seed);
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
    },
  });
  return { w: dom.window, log };
}

describe('SONIC BLAST!: rainbow rings whose wall panels preview their heights', () => {
  it('a wave is a ring on every filled lane, both ways from her: full boss damage each, one attack id, drawn as her rings, after a 44-unit wind-up (36 frames: BOSS_TEL_PACE)', () => {
    const r = W.eval(`(function(){ ${STAGE(900)} ${TURN}
      var gy = groundY(), rec = turn('soundwave', { hold:true, x:900, each:function(rc){ if (rc.fireAt > 0 && rc.d == null){ rc.d = IMPACT_DEBRIS.length; rc.sc = IMPACT_SCARS.map(function(s){ return [Math.round(s.x), s.y, s.w]; }); } } });
      return { rec: rec, gy: gy, boss: bossDmg(), lanes: rec.shots.map(function(s){ return Math.round((gy - 38 - s.y)/42); }), telLen: rec.fireAt - rec.telAt, kind: rec.kind,
               scars: rec.sc, debris: rec.d, bx: b.x, banner: rec.banner && rec.banner.text };
    })()`);
    // (phase 1 sends two waves now -- Round 17, "SONIC BLAST! 2/3/4 waves", it was one: the first wave is what this reads; the loop is tested below)
    const all = r.rec.shots, sh = all.filter((s) => s.at === all[0].at);
    expect(r.kind).toBe('soundwave');
    expect(r.banner).toBe('SONIC BLAST!');
    // "make the opposite happen for the 1st 3 bosses" (the owner, 2026-10-03): her wind-ups run 0.8 as long (BOSS_TEL_PACE), 44 units in 36 frames
    expect(r.telLen, 'a wind-up long enough to read the panels').toBe(36);
    expect(sh.length, 'five filled lanes, both ways').toBe(10);
    expect(all.length, 'and the second wave of phase 1, the same lanes again').toBe(20);
    expect(new Set(sh.map((s) => s.shape))).toEqual(new Set(['psbring']));
    expect(all.every((s) => s.dmg === r.boss), 'full boss damage: the damage per hit is unchanged').toBe(true);
    expect(new Set(all.map((s) => s.id)).size, 'one attack id for the whole attack, both waves').toBe(1);
    expect(all.every((s) => s.volley), 'and a volley, so its total is capped even when another boss hit lands between').toBe(true);
    expect(sh.filter((s) => s.vx > 0).length).toBe(5);
    expect(sh.filter((s) => s.vx < 0).length).toBe(5);
    expect(sh.every((s) => Math.abs(s.vx) === 8.6 && s.vy === 0), 'phase 1: slow, level rings').toBe(true);
    expect([...new Set(r.lanes)].sort(), 'lanes 1 to 5: the floor lane is the gap').toEqual([1, 2, 3, 4, 5]);
    // heavy: her voice cracks the disco tiles under her
    expect(r.scars.length).toBeGreaterThanOrEqual(1);
    const xs = sh.map((s) => s.x);
    expect(Math.abs(r.scars[0][0] - (Math.min(...xs) + Math.max(...xs))/2), 'where she fired from').toBeLessThan(5);
    expect(r.scars[0][1], 'on the floor line').toBeCloseTo(r.gy, 3);
    expect(r.scars[0][2]).toBe(110);
    expect(r.debris).toBeGreaterThanOrEqual(4);
  });

  it("the gap is a fighter's height: the floor turn leaves the floor lane empty, the platform turn the platform's lanes, and they take turns", () => {
    const r = W.eval(`(function(){ ${STAGE(900)} ${TURN}
      var gy = groundY(), pats = [];
      for (var i=0;i<3;i++){ turn('soundwave', { hold:true, x:900 }); pats.push(b._psbPat.slice()); }
      var L = PSB.lane;
      // each pattern against a fighter standing on the floor (hurtbox top gy-48) and on the platform (${PLAT.y}-48 to ${PLAT.y})
      var touches = function(pat, top, bottom){ return pat.map(function(on, k){ return on && psbLaneY(k) + L.r > top && psbLaneY(k) - L.r < bottom; }).some(function(v){ return v; }); };
      return { pats: pats, floorHit: pats.map(function(p){ return touches(p, gy - 48, gy); }), platHit: pats.map(function(p){ return touches(p, ${PLAT.y} - 48, ${PLAT.y}); }),
               gaps: pats.map(function(p){ return p.filter(function(v){ return !v; }).length; }),
               p3: [psbPattern('F', PSB.lane.n[3]), psbPattern('P', PSB.lane.n[3])] };
    })()`);
    expect(r.pats[0], 'the floor first: only the floor lane is empty').toEqual([0, 1, 1, 1, 1, 1]);
    expect(r.pats[1], "then the platform: its lanes are empty, the floor's and the sky's are not").toEqual([1, 1, 0, 0, 0, 1]);
    expect(r.pats[2], 'then the floor again: in turn, so it can be learned').toEqual(r.pats[0]);
    expect(r.floorHit).toEqual([false, true, false]);
    expect(r.platHit).toEqual([true, false, true]);
    expect(r.gaps.every((g) => g >= 1)).toBe(true);
    // phase 3 has a seventh lane, filled on both turns
    expect(r.p3[0]).toEqual([0, 1, 1, 1, 1, 1, 1]);
    expect(r.p3[1]).toEqual([1, 1, 0, 0, 0, 1, 1]);
  });

  it('safe in the gap, one boss hit off it, in every phase -- and the loops (every phase has one now) never stack a second', () => {
    const run = (ph, plat) => W.eval(`(function(){ ${STAGE(plat ? 550 : 300, { phase: ph, plat })} ${TURN}
      var first = turn('soundwave', { hold:true, x:${plat ? 550 : 300}, plat:${!!plat} }).taken;
      f.pct = 0; f.invuln = 0;
      var second = turn('soundwave', { hold:true, x:${plat ? 550 : 300}, plat:${!!plat} }).taken;
      return { first: first, second: second, boss: bossDmg(), phase: b._phase };
    })()`);
    for (const ph of [1, 2, 3]) {
      const floor = run(ph, false), plat = run(ph, true);
      expect(floor.phase).toBe(ph);
      expect(floor.first, `phase ${ph}: on the floor the floor turn's gap holds`).toBe(0);
      expect(floor.second, `phase ${ph}: the platform turn is one whole boss hit, however many rings and loops`).toBeCloseTo(floor.boss, 5);
      expect(plat.first, `phase ${ph}: on the platform the floor turn is one whole boss hit`).toBeCloseTo(plat.boss, 5);
      expect(plat.second, `phase ${ph}: and the platform turn's gap holds`).toBe(0);
    }
  });

  // The owner's pick, Round 17 (the question boxes, 2026-10-01): "SONIC BLAST! 2/3/4 waves" -- it was 1 / 3 / 3. The loop is the same lanes again (a fighter in the gap is as safe as ever), a beat apart:
  // 40 frames in phase 1 (which had no loop to give a beat to), 36 in phase 2, 30 in phase 3.
  it("phase 1 throws two waves, phase 2 three and phase 3 four, each loop over the same lanes (\"her voice was stuck in a loop\"), and phase 3 alternates the rows' speeds", () => {
    const wave = (ph) => W.eval(`(function(){ ${STAGE(900, { phase: ph })} ${TURN}
      var gy = groundY(), rec = turn('soundwave', { hold:true, x:900 });
      var waves = {}; rec.shots.forEach(function(s){ (waves[s.at] = waves[s.at] || []).push(s); });
      var ats = Object.keys(waves).map(Number).sort(function(a, c){ return a - c; });
      return { ats: ats, lanes: ats.map(function(a){ return waves[a].map(function(s){ return Math.round((gy - 38 - s.y)/42) + (s.vx > 0 ? 'R' : 'L'); }).sort().join(','); }),
               speeds: ats.map(function(a){ var o = {}; waves[a].forEach(function(s){ o[Math.round((gy - 38 - s.y)/42)] = Math.abs(s.vx); }); return o; }),
               ids: rec.shots.map(function(s){ return s.id; }), n: rec.shots.length, frames: rec.frames };
    })()`);
    const p1 = wave(1), p2 = wave(2), p3 = wave(3);
    expect([p1.ats.length, p2.ats.length, p3.ats.length], 'two, three and four waves').toEqual([2, 3, 4]);
    expect(p1.ats[1] - p1.ats[0], 'a beat apart: 40 frames in phase 1').toBe(40);
    expect(p2.ats[1] - p2.ats[0], 'the same in phase 2: 36').toBe(36);
    expect(p2.ats[2] - p2.ats[1]).toBe(36);
    for (let k = 1; k < 4; k++) expect(p3.ats[k] - p3.ats[k - 1], `and quicker in phase 3: wave ${k + 1} comes 30 after the one before`).toBe(30);
    expect(p1.lanes[1], 'the same gap heights every loop: learnable, relentless').toBe(p1.lanes[0]);
    expect(p2.lanes[1]).toBe(p2.lanes[0]);
    expect(p2.lanes[2]).toBe(p2.lanes[0]);
    for (let k = 1; k < 4; k++) expect(p3.lanes[k]).toBe(p3.lanes[0]);
    expect(new Set(p1.ids).size, 'still one attack id').toBe(1);
    expect(new Set(p2.ids).size).toBe(1);
    expect(new Set(p3.ids).size).toBe(1);
    expect(p1.n, 'five filled lanes, both ways, twice').toBe(20);
    expect(p2.n).toBe(30);
    expect(p3.n, 'six filled lanes, both ways, four times').toBe(48);
    expect(Object.values(p2.speeds[0]).every((v) => v === 10.2), 'phase 2: faster than phase 1').toBe(true);
    // phase 3: even lanes fast, odd lanes slow, "so a straight run fails"
    for (const [k, v] of Object.entries(p3.speeds[0])) expect(v, `lane ${k}`).toBe(Number(k) % 2 ? 8.4 : 13);
  });

  it('the wall panels are the tell: at the wind-up their lanes are the ones the wave then fires, lit along both edges in the rings\' colours, and the gap stays dark', () => {
    const r = W.eval(`(function(){ ${STAGE(900, { settle: 60 })}
      var gy = groundY(), st = {};
      b._pickForce = 'soundwave'; b._atkLive = null; b._atkTimer = 1; b._tel = 0;
      for (var i=0;i<20 && !(b._tel > 0);i++) step();
      st.telKind = b._telKind; st.pat = b._psbPat.slice(); st.patT = b._psbPatT; st.tel = b._tel;
      for (var j=0;j<50 && b._tel > 0;j++) step();
      var wave = projectiles.filter(function(p){ return p.psb; }).map(function(p){ return Math.round((gy - 38 - p.y)/42); });
      st.fired = Array.from(new Set(wave)).sort();
      return st;
    })()`);
    expect(r.telKind).toBe('soundwave');
    expect(r.pat.length).toBe(6);
    expect(r.patT, 'the panels stay lit past the wind-up').toBeGreaterThan(r.tel);
    expect(r.fired, 'the lanes it lit are the lanes it fired').toEqual(r.pat.map((on, k) => (on ? k : -1)).filter((k) => k >= 0));
    // ...and the drawing: both edges, in the ring colours, the empty lanes dark
    const { w, log } = bootRecording();
    w.eval(`(function(){ ${STAGE(900, { settle: 60 })}
      b._pickForce = 'soundwave'; b._atkLive = null; b._atkTimer = 1; b._tel = 0; for (var i=0;i<20 && !(b._tel > 0);i++) step(); for (var j=0;j<30;j++) step();
      window.__pat = b._psbPat.slice(); psbDrawFx(); })()`);
    log.length = 0;
    w.eval('psbDrawFx()');
    const pat = w.eval('window.__pat'), gy = w.eval('groundY()'), WWv = w.eval('WW');
    const hues = ['#ff3b3b', '#ff9a2e', '#ffe23a', '#38d64a', '#3a8cff', '#a24cff'];
    const rects = log.filter((e) => e.op === 'fillRect');
    pat.forEach((on, k) => {
      const y = gy - 38 - 42 * k - 19;
      for (const x0 of [0, WWv - 46]) {
        const hit = rects.find((e) => Math.abs(e.args[0] - x0) < 0.01 && Math.abs(e.args[1] - y) < 0.01 && e.args[2] === 46 && e.args[3] === 38);
        expect(hit, `lane ${k} at x ${x0} is painted`).toBeTruthy();
        if (on) expect(hit.fill, `lane ${k} lit in its ring's colour`).toBe(hues[k % 6]);
        else expect(hit.fill, `lane ${k} is the gap: dark`).toBe('#06060c');
      }
    });
  });
});

describe('CONSEQUENCES!: a spotlight lands on you, then she dashes and slices six times', () => {
  // "Book, you read 'lips'. It's time for you to suffer the CONSEQUENCES of your ACTIONS!" / "Puffball Speaker Box slices Book to pieces
  // with several knives." (Catch These Hands/Transcript)
  it('the spotlight follows you through the wind-up and locks 14 units (12 frames) before she goes; the room dims as it lands', () => {
    const r = W.eval(`(function(){ ${STAGE(300)} ${TURN}
      var log = [];
      var rec = turn('consequences', { max:200, each:function(rc, j){
        if (b._tel > 0){ f.x = 300 + (60 - b._tel)*3; f.vx = 0; log.push([b._tel, Math.round(b._psbSpX), Math.round(f.x), b._psbSpLk|0, +(b._psbSpT||0).toFixed(2)]); } } });
      return { log: log, telLen: rec.fireAt - rec.telAt, banner: rec.banner && rec.banner.text, lock: PSB.cons.lock };
    })()`);
    expect(r.banner).toBe('CONSEQUENCES!');
    expect(r.telLen, '60 units, 48 frames (BOSS_TEL_PACE)').toBe(48);
    const early = r.log.filter(([tel]) => tel > r.lock + 2), late = r.log.filter(([tel]) => tel < r.lock - 1);
    expect(early.length).toBeGreaterThan(30);
    // while it follows, the spot is where you were one frame ago (it is read before you move again)
    for (const [, spot, fx, lk] of early.slice(3)) { expect(Math.abs(spot - fx), 'follows you (a frame behind: 3 px a unit, 1.25 units a frame)').toBeLessThanOrEqual(4); expect(lk).toBe(0); }
    // once locked it holds, though you keep going, and it is white (locked)
    const held = new Set(late.map(([, spot]) => spot));
    expect(held.size, 'the spot holds still').toBe(1);
    expect(late.every(([, , , lk]) => lk === 1)).toBe(true);
    expect(Math.abs(late[late.length - 1][2] - late[late.length - 1][1]) > 8, 'and you have moved on from it').toBe(true);
    expect(r.log[r.log.length - 1][4], 'the room has dimmed').toBeGreaterThan(0.9);
    expect(r.log[3][4], 'gradually').toBeLessThan(r.log[r.log.length - 1][4]);
  });

  // The owner's pick, Round 17 (the question boxes, 2026-10-01): "CONSEQUENCES! 6 knives, the last two aimed ahead" -- it was five, every one at where you are THEN.
  it('she dashes to where the spotlight locked, lands on the floor (a cut in it), and throws six knives, one every 16 frames, each at where you are THEN (a fighter standing still: the last two lead nothing)', () => {
    const r = W.eval(`(function(){ ${STAGE(300)} ${TURN}
      var dashEnd = null, made = 0;
      var rec = turn('consequences', { max:400, each:function(rc, j){
        if (b._psbRun && b._psbRun.phase === 'cut' && b._psbRun.t === 1) dashEnd = { x: Math.round(b.x), y: Math.round(b.y), floor: groundY() - b.r*1.08, sp: Math.round(b._psbSpX) };
        if (rc.shots.length > made){ made = rc.shots.length; f.x = 300 + made*70; f.vx = 0; }   // it steps aside after each cut: the next is thrown at the new spot
      } });
      var aims = rec.shots.map(function(s){ var a = Math.atan2(s.vy, s.vx), want = Math.atan2(s.fy - s.by, s.fx - s.bx); return Math.abs(Math.atan2(Math.sin(a - want), Math.cos(a - want))); });
      var scars = IMPACT_SCARS.map(function(s){ return [Math.round(s.x), s.y]; });
      return { rec: rec, aims: aims, dashEnd: dashEnd, knives: rec.shots.filter(function(s){ return s.shape === 'psbknife'; }), boss: bossDmg(), scars: scars, gy: groundY() };
    })()`);
    const k = r.knives;
    expect(k.length, 'six knives').toBe(6);
    expect(new Set(k.map((s) => s.id)).size, 'one attack id: at most one boss hit').toBe(1);
    expect(k.every((s) => s.volley && s.dmg === r.boss && s.r === 15), 'full boss damage each, a volley').toBe(true);
    expect(k.map((s, i) => (i ? s.at - k[i - 1].at : 0)).slice(1), 'every 16 frames').toEqual([16, 16, 16, 16, 16]);
    expect(r.aims.every((a) => a < 0.12), `each is thrown at where you are: ${r.aims.map((a) => a.toFixed(3))}`).toBe(true);
    expect(k.every((s) => Math.hypot(s.vx, s.vy) > 15.9 && Math.hypot(s.vx, s.vy) < 16.1)).toBe(true);
    expect(Math.abs(r.dashEnd.x - r.dashEnd.sp), 'she landed on the spot it locked on').toBeLessThan(3);
    expect(r.dashEnd.y, 'her art rests on the floor, not sunk into it').toBeCloseTo(r.dashEnd.floor, 0);
    expect(r.scars.some(([x, y]) => Math.abs(x - r.dashEnd.x) < 2 && Math.abs(y - r.gy) < 0.01), 'and the floor is cut where she landed').toBe(true);
  });

  it("standing where it locked costs one boss hit, not six; six knives are one attack, so nothing stacks (\"Harder, same damage\")", () => {
    const r = W.eval(`(function(){ ${STAGE(300)} ${TURN}
      var rec = turn('consequences', { max:400 });
      return { taken: rec.taken, boss: bossDmg(), knives: rec.shots.filter(function(s){ return s.shape === 'psbknife'; }).length };
    })()`);
    expect(r.knives).toBe(6);
    expect(r.taken).toBeCloseTo(r.boss, 5);
  });

  // "the last two aimed ahead" (Round 17): a knife's `lead` carries your speed for as long as it is in the air, so a fighter running straight on is met; the first four are at where you are.
  it('the last two knives of a run are thrown where you are HEADING: a fighter running away is met by them (and missed by a knife thrown at where he is); a fighter standing still is not led', () => {
    const r = W.eval(`(function(){ ${STAGE(300)} ${TURN}
      var gy = groundY(), out = {};
      var cons = PSB.cons;
      // her, on the floor at x 700 with a fighter 180 px to her left, running left (away) at 6 px a frame, or standing; the knife's closest pass to where he will be
      var throwAt = function(vx, vy, lead, fy){ b.x = 700; b.y = gy - b.r*1.08; projectiles = [];
        f.x = 520; f.y = fy == null ? gy - 24 : fy; f.vx = vx; f.vy = vy;
        var R = { id:++BOSS_ATK_ID, n:0 }; psbKnife(b, R, f, lead);
        var k = projectiles.find(function(p){ return p.shape === 'psbknife'; }), best = 1e9;
        for (var n=0;n<=40;n++){ var kx = k.x + k.vx*n, ky = k.y + k.vy*n, px = f.x + vx*n, py = f.y + vy*n; best = Math.min(best, Math.hypot(kx - px, ky - py)); }
        return { a: Math.atan2(k.vy, k.vx), sp: Math.hypot(k.vx, k.vy), best: best, warnX: k.warnX, warnY: k.warnY, x: k.x, y: k.y, want: Math.atan2(f.y - b.y, f.x - b.x) }; };
      out.cuts = cons.cuts; out.leads = cons.leads;
      out.runLead = throwAt(-6, 0, true); out.runPlain = throwAt(-6, 0, false); out.stillLead = throwAt(0, 0, true); out.stillPlain = throwAt(0, 0, false);
      // which knives of a run are led: the run's own counter
      out.which = []; for (var i=0;i<cons.cuts;i++) out.which.push(i >= cons.cuts - cons.leads);
      return out; })()`);
    expect(r.cuts).toBe(6);
    expect(r.leads, 'the last two').toBe(2);
    expect(r.which, 'the first four at where you are, the last two ahead').toEqual([false, false, false, false, true, true]);
    expect(r.runPlain.a, 'a knife thrown at where he is').toBeCloseTo(r.runPlain.want, 6);
    expect(r.runLead.best, 'a led knife meets him dead on').toBeLessThan(6);
    expect(r.runPlain.best, 'a knife thrown at where he is passes behind him (he is 66 px on by the time it gets there): by more than 15 px').toBeGreaterThan(r.runLead.best + 15);
    expect(r.runLead.a, 'it is thrown further ahead of him: a flatter angle than at where he is').not.toBeCloseTo(r.runLead.want, 2);
    expect(r.stillLead.a, 'a fighter standing still is not led').toBeCloseTo(r.stillLead.want, 6);
    for (const k of [r.runLead, r.runPlain, r.stillLead, r.stillPlain]) {
      expect(k.sp, 'the same knife: 16 a frame').toBeCloseTo(16, 6);
      expect(k.warnX, 'carries its own start as warnX (no `warn`: no shadow, no drift) for the glitch hunter').toBeCloseTo(k.x, 6);
      expect(k.warnY).toBeCloseTo(k.y, 6);
    }
  });

  it('after the last cut she hangs winded for 24 frames, in reach, then floats back up; phase 3 is quicker, and its last cut is late', () => {
    const run = (ph) => W.eval(`(function(){ ${STAGE(300, { phase: ph })} ${TURN}
      var hang = 0, hangY = null, returned = null, phases = [];
      var rec = turn('consequences', { max:600, each:function(rc){
        if (b._psbRun){ if (phases[phases.length-1] !== b._psbRun.phase) phases.push(b._psbRun.phase); if (b._psbRun.phase === 'hang'){ hang++; hangY = Math.round(b.y); } } } });
      var k = rec.shots.filter(function(s){ return s.shape === 'psbknife'; });
      for (var i=0;i<60;i++) step();
      return { hang: hang, hangY: hangY, phases: phases, gaps: k.map(function(s, i){ return i ? s.at - k[i-1].at : 0; }).slice(1), yEnd: Math.round(b.y), hover: Math.round(psbHoverY(b)), run: !!b._psbRun,
               floor: Math.round(groundY() - b.r*1.08), phase: b._phase };
    })()`);
    const p1 = run(1), p2 = run(2), p3 = run(3);
    expect(p1.phases, 'dash, cuts, hang, back').toEqual(['dash', 'cut', 'hang', 'back']);
    expect(p1.hang).toBe(24);
    expect(Math.abs(p1.hangY - p1.floor), 'hanging low, where she can be hit').toBeLessThan(8);
    expect(p1.run).toBe(false);
    expect(Math.abs(p1.yEnd - p1.hover), 'and back at her float').toBeLessThan(30);
    expect(p1.gaps).toEqual([16, 16, 16, 16, 16]);
    expect(p2.gaps, 'quicker in phase 2').toEqual([12, 12, 12, 12, 12]);
    expect(p3.gaps, 'quicker again in phase 3, the last a fake-out 14 frames late').toEqual([10, 10, 10, 10, 24]);
    expect([p1.phase, p2.phase, p3.phase]).toEqual([1, 2, 3]);
  });

  // Round 17 (the owner: "make the attacks based on fighter position."): her turns are drawn from the moves she has unlocked, so there is no "RAINBOW BARF! turn" to be CONSEQUENCES! again: the barf
  // is simply not among her phase-1 moves (BOSS_PICK.soundwave.moves), and asking for it there gets one of the others.
  it('RAINBOW BARF! waits for phase 2, "once the knife is in her back": it is not among her phase-1 moves, and forcing it in phase 1 starts one of the others', () => {
    const r = W.eval(`(function(){ ${STAGE(300)} ${TURN}
      var rec = turn('rainbowbarf', { max:600 });
      return { kind: rec.kind, banner: rec.banner && rec.banner.text, p1: bossPickMoves(b, 1), p2: bossPickMoves(b, 2), p3: bossPickMoves(b, 3) };
    })()`);
    expect(r.p1, 'three moves in phase 1').toEqual(expect.arrayContaining(['soundwave', 'consequences', 'private']));
    expect(r.p1).not.toContain('rainbowbarf');
    expect(r.p2, 'the barf joins in phase 2').toContain('rainbowbarf');
    expect(r.p3).toContain('rainbowbarf');
    expect(['soundwave', 'consequences', 'private'], 'what a phase-1 turn drew instead').toContain(r.kind);
    expect(r.banner).not.toBe('RAINBOW BARF!');
  });
});

describe('RAINBOW BARF!: a rainbow hose that reverses mid-sweep (phase 2 on)', () => {
  // "Members of the puffball species are known to regurgitate a rainbow substance during times of distress" (Get in the Van); "The
  // rainbow substance Puffball Speaker Box emits knocks Lewis out of his car" (Taste the Sweetness); "able to vomit the rainbow
  // substance for ten months straight (in-universe) without running out" (Puffball (species): phase 3 does two sweeps).
  it('the wedge is fixed at the wind-up, leans toward you and starts on your side; it is drawn round her, as far out as the stream reaches', () => {
    const arcOf = (fx) => W.eval(`(function(){ ${STAGE(fx, { phase: 2 })} ${TURN}
      b.x = 550;
      var st = { arc: null, tgtAng: null };
      turn('rainbowbarf', { max:300, each:function(rc){ if (b._tel > 0){ b.x = 550; b.vx = 0; if (!st.arc){ st.arc = b._psbArc.slice(); st.tgtAng = Math.atan2(f.y - b.y, f.x - 550); } } } });
      return st;
    })()`);
    const right = arcOf(850), left = arcOf(250);
    expect(right.arc[0], 'a fighter on her right: it starts at the low angle, on their side').toBeLessThan(right.arc[1]);
    expect(left.arc[0], 'on her left: the high angle').toBeGreaterThan(left.arc[1]);
    for (const a of [right, left]) {
      const lo = Math.min(...a.arc), hi = Math.max(...a.arc);
      expect(a.tgtAng, 'they are inside it: it leans toward you').toBeGreaterThan(lo);
      expect(a.tgtAng).toBeLessThan(hi);
      expect(hi - lo, 'a fan of about 100 degrees, always below the horizontal').toBeGreaterThan(1.5);
      expect(lo).toBeGreaterThanOrEqual(0.14 - 1e-9);
      expect(hi).toBeLessThanOrEqual(Math.PI - 0.14 + 1e-9);
    }
    // the tell: the wedge is painted round her, out to the stream's reach (its speed x its life)
    const { w, log } = bootRecording();
    const reach = w.eval(`(function(){ ${STAGE(850, { phase: 2 })} ${TURN}
      var rec = turn('rainbowbarf', { max:300 });
      var life = rec.shots[0].life, speed = Math.hypot(rec.shots[0].vx, rec.shots[0].vy);
      var s = summons.find(function(m){ return m.type === 'boss'; });
      s._tel = 20; s._telKind = 'rainbowbarf'; s._psbArc = [0.4, 2.1];
      ctx.save(); psbDrawTell(s); ctx.restore();
      return Math.round(life * PROJ_LIFE) * speed; })()`);   // (a shot's life is scaled by PROJ_LIFE as it is added)
    const arcs = log.filter((e) => e.op === 'arc' && e.args[2] > 300);
    expect(arcs.length).toBeGreaterThanOrEqual(1);
    expect(arcs[0].args[2], 'the wedge reaches as far as a shot flies').toBeCloseTo(reach, 0);
    expect(Math.min(arcs[0].args[3], arcs[0].args[4])).toBeCloseTo(0.4, 5);
    expect(Math.max(arcs[0].args[3], arcs[0].args[4])).toBeCloseTo(2.1, 5);
  });

  // The owner's pick, Round 17 (the question boxes, 2026-10-01): "RAINBOW BARF! two streams from P2" -- the second stream was phase 3's; it is a second shot a frame, 0.05 rad behind the first.
  it('the stream sweeps there in 20 frames and whips back in 20, a shot a frame (two streams: a second beside it), all one attack id, full boss damage, drawn as the rainbow substance and ending at the floor', () => {
    const r = W.eval(`(function(){ ${STAGE(850, { phase: 2 })} ${TURN}
      var arc = null, over = 0, gy = groundY();
      var rec = turn('rainbowbarf', { max:300, each:function(rc){ if (b._tel > 0){ b.x = 550; b.vx = 0; } if (b._tel > 0 && !arc) arc = b._psbArc.slice();
        projectiles.forEach(function(p){ if (p.psb && p.y > gy + 1) over++; }); } });
      return { rec: rec, arc: arc, over: over, boss: bossDmg(), tel: rec.fireAt - rec.telAt };
    })()`);
    const every = r.rec.shots, sh = every.filter((s, i) => i % 2 === 0), second = every.filter((s, i) => i % 2 === 1);   // (a frame's two shots: the first stream's, then the second's)
    const ang = (s) => Math.atan2(s.vy, s.vx);
    expect(r.rec.kind).toBe('rainbowbarf');
    expect(r.rec.banner.text).toBe('RAINBOW BARF!');
    expect(r.tel, '40 units, 32 frames (BOSS_TEL_PACE)').toBe(32);
    expect(every.length, 'two shots a frame from phase 2, over the 40 frames of one there-and-back sweep').toBe(80);
    expect(sh.length, 'a shot a frame in the first stream').toBe(40);
    expect(new Set(sh.map((s) => s.at)).size, 'one each frame').toBe(40);
    expect(second.map((s) => s.at), 'the second stream is the same frames').toEqual(sh.map((s) => s.at));
    second.forEach((s, i) => expect(Math.abs(Math.atan2(Math.sin(ang(s) - ang(sh[i])), Math.cos(ang(s) - ang(sh[i]))) - 0.05), `frame ${i}: the second stream is 0.05 rad beside the first`).toBeLessThan(0.003));   // (the recorder keeps a shot's speed to two decimals)
    expect(second.every((s) => s.volley && s.dmg === r.boss && s.shape === 'fly' && s.r === 14), 'the same shot').toBe(true);
    expect(new Set(every.map((s) => s.id)).size, 'one attack id').toBe(1);
    expect(sh.every((s) => s.volley && s.dmg === r.boss && s.shape === 'fly' && s.r === 14), 'a volley, full damage, the rainbow substance art').toBe(true);
    expect(sh.every((s) => s.life > 1 && s.life <= 30), 'a shot lives no longer than the stream reaches').toBe(true);
    expect(sh.some((s) => s.life < 24), 'and the steep ones are cut to end at the floor').toBe(true);
    expect(ang(sh[0]), 'it starts on your side').toBeCloseTo(r.arc[0], 3);
    expect(ang(sh[20]), 'is at the far end after 20 frames').toBeCloseTo(r.arc[1], 3);
    expect(ang(sh[39]), 'and back at your side after 40 (a frame short of it)').toBeLessThan(Math.max(...r.arc));
    expect(Math.abs(ang(sh[39]) - r.arc[0]), '...within one step of where it began').toBeLessThan(Math.abs(r.arc[1] - r.arc[0])/20*1.5);
    // it reverses: the angle turns round at the middle, monotonically either side
    const a = sh.map(ang), dir = Math.sign(r.arc[1] - r.arc[0]);
    for (let i = 1; i <= 20; i++) expect(Math.sign(a[i] - a[i - 1]) * dir, `frame ${i} still going out`).toBeGreaterThanOrEqual(0);
    for (let i = 21; i < 40; i++) expect(Math.sign(a[i] - a[i - 1]) * dir, `frame ${i} coming back`).toBeLessThanOrEqual(0);
    expect(r.over, 'not a shot ever goes into the floor').toBe(0);
  });

  it('the far side of the room is safe, the swath is one whole boss hit however many shots cross you -- two shots a frame from phase 2, and in phase 3 she does two sweeps', () => {
    const hitTwo = W.eval(`(function(){ ${STAGE(850, { phase: 2 })}
      var g = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 200, groundY()-24, 1);
      g.team=0; g.controller='still'; g.stocks=9; fighters.push(g); g.pct = 0;
      ${TURN}
      b.x = 550; b.vx = 0; g.x = 200;   // she is in the middle when she picks whom to lean toward: the nearer of the two
      var rec = turn('rainbowbarf', { max:300, hold:true, x:850, each:function(rc){ b.x = 550; b.vx = 0; g.x = 200; g.vx = 0; } });
      return { near: f.pct, far: g.pct, boss: bossDmg(), nearest: rec.shots[0] && Math.round(rec.shots[0].fx) };
    })()`);
    expect(hitTwo.near, 'the fighter she leaned toward takes one whole boss hit -- with the platform between them: a ledge is not an umbrella').toBeCloseTo(hitTwo.boss, 5);
    expect(hitTwo.far, 'the one on the far side takes nothing').toBe(0);
    const under = W.eval(`(function(){ ${STAGE(550, { phase: 2 })} ${TURN}
      b.x = 550; b.vx = 0;
      var rec = turn('rainbowbarf', { max:300, hold:true, x:550, each:function(rc){ b.x = 550; b.vx = 0; } });
      return { taken: rec.taken, boss: bossDmg() };
    })()`);
    expect(under.taken, 'and standing on the floor under the platform is no shelter').toBeCloseTo(under.boss, 5);
    const p2 = W.eval(`(function(){ ${STAGE(850, { phase: 2 })} ${TURN}
      var rec = turn('rainbowbarf', { max:400, each:function(rc){ if (b._tel > 0){ b.x = 550; b.vx = 0; } } });
      var ats = {}; rec.shots.forEach(function(s){ ats[s.at] = (ats[s.at]||0) + 1; });
      return { n: rec.shots.length, frames: Object.keys(ats).length, per: Object.values(ats).every(function(v){ return v === 2; }), ids: new Set(rec.shots.map(function(s){ return s.id; })).size };
    })()`);
    expect(p2.n, 'phase 2: one sweep of 40 frames, two shots a frame (the second stream, from phase 2: Round 17)').toBe(80);
    expect(p2.frames).toBe(40);
    expect(p2.per).toBe(true);
    expect(p2.ids, 'one attack id').toBe(1);
    const p3 = W.eval(`(function(){ ${STAGE(850, { phase: 3 })} ${TURN}
      var rec = turn('rainbowbarf', { max:400, each:function(rc){ if (b._tel > 0){ b.x = 550; b.vx = 0; } } });
      var ats = {}; rec.shots.forEach(function(s){ ats[s.at] = (ats[s.at]||0) + 1; });
      return { n: rec.shots.length, frames: Object.keys(ats).length, per: Object.values(ats).every(function(v){ return v === 2; }), ids: new Set(rec.shots.map(function(s){ return s.id; })).size };
    })()`);
    expect(p3.n, 'two sweeps of 40 frames, two shots a frame').toBe(160);
    expect(p3.frames).toBe(80);
    expect(p3.per).toBe(true);
    expect(p3.ids, 'still one attack id: it does not run out, and it does not stack').toBe(1);
  });

  it('the tiles it lands on light up in the rainbow, as the shots land (a few numbers in the hazard state, so a client draws them too)', () => {
    const r = W.eval(`(function(){ ${STAGE(850, { phase: 2 })} ${TURN}
      var rec = turn('rainbowbarf', { max:300, each:function(rc){ if (b._tel > 0){ b.x = 550; b.vx = 0; } } });
      var lit = (b._hz && b._hz.lit) || [];
      return { n: lit.length, tiles: lit.map(function(e){ return e[0]; }), hues: lit.map(function(e){ return e[2]; }), T: PSB.tile, WW: WW };
    })()`);
    expect(r.n).toBeGreaterThanOrEqual(6);
    expect(r.tiles.every((t) => t >= 0 && t < Math.ceil(r.WW / r.T))).toBe(true);
    expect(new Set(r.hues).size, 'more than one colour').toBeGreaterThan(2);
  });
});

describe('PRIVATE!: she flies out of frame and shutters slam at both edges, shrinking the arena while she sings from outside', () => {
  // "I'll let you sort those out in PRIVATE!" / "Puffball Speaker Box flies outside and locks the Clubhouse of Awesomeness, trapping
  // Yellow Face and Purple Face inside." (Catch These Hands/Transcript)
  const privCache = new Map();
  const priv = (ph, x, o = {}) => { const key = JSON.stringify([ph, x, o]); if (!privCache.has(key)) privCache.set(key, privRun(ph, x, o)); return privCache.get(key); };
  const privRun = (ph, x, o = {}) => W.eval(`(function(){ ${STAGE(x, { phase: ph })} ${TURN}
    var gy = groundY(), shw = Math.round(WW*PSB.priv.shutW), slam = null, downFrames = 0, cues = [], clampS = { s:0 }, hp0 = b.hp;
    var rec = turn('private', { max:800, hold:${!!o.hold}, x:${x}, each:function(rc, j){
      if (b._psbPriv && b._psbPriv.t === 0 && !slam) slam = { x: f.x, pct: f.pct, vx: f.vx, frame: rc.frames, y: b.y, fr: f.r };
      var H = b._hz || {};
      if ((H.sh||0) >= 1) downFrames++;
      if (${!!o.hurt} && b._psbPriv && b._psbPriv.t > 5) b.hp -= 3;   // anything that could reach her
      // a fighter sent at each shutter in turn, once they are down: where does it end up?
      if (${!!o.clamp}){
        if ((H.sh||0) >= 1 && clampS.s === 0 && slam && rc.frames > slam.frame + 40){ f.x = 100; f.vx = -5; clampS.s = 1; }
        else if (clampS.s === 1){ clampS.left = f.x; f.x = WW - 100; f.vx = 5; clampS.s = 2; }
        else if (clampS.s === 2){ clampS.right = f.x; clampS.s = 3; }
      }
      (b._psbPv || []).forEach(function(e){ if (e[2] === PSB.priv.lead - 1) cues.push({ frame: rc.frames, side: e[0], y: e[1] }); });
    } });
    var notes = rec.shots.filter(function(s){ return s.shape === 'psbnote'; });
    return { rec: rec, slam: slam, downFrames: downFrames, cues: cues, clamp: clampS, notes: notes, hp0: hp0, hpEnd: b.hp, shw: shw, gy: gy, WW: WW, boss: bossDmg(), ph: b._phase,
             yEnd: Math.round(b.y), hover: Math.round(psbHoverY(b)), shEnd: (b._hz||{}).sh, priv: !!b._psbPriv, minY: rec.minY, r: b.r, fL: psbLaneY(0), fP: psbLevelY('P'), banner: rec.banner && rec.banner.text, tel: rec.fireAt - rec.telAt };
  })()`);

  it('the wind-up is 52 units (42 frames: BOSS_TEL_PACE) and she is out of the frame for the slam: her bottom edge is above the top of the screen, beyond any reach', () => {
    const r = priv(1, 550, { hold: true });
    expect(r.banner).toBe('PRIVATE!');
    expect(r.tel).toBe(42);
    expect(r.minY + r.r + 60, 'nothing a fighter swings on the screen can reach her').toBeLessThan(0);
    expect(r.slam.y + r.r, 'she is already out when the shutters go down').toBeLessThan(0);
    const h = priv(1, 550, { hold: true, hurt: true });
    expect(h.hpEnd, 'and she cannot be hurt while she is gone, whatever reaches for her').toBe(h.hp0);
  });

  // (Round 17, "PRIVATE! one more note per phase": the song keeps its length -- 252, 252 and 250 frames of it -- so the notes come quicker instead (beats of 48, 40 and 34 frames): one beat longer
  // would be 312 frames of her out of frame and out of reach, past the glitch hunter's five-second limit for a boss that is off the screen)
  it('the shutters take a fifth of the width each side for about four seconds, in every phase, and lift; she comes back from above', () => {
    for (const ph of [1, 2, 3]) {
      const r = priv(ph, 550, { hold: true });
      expect(r.ph).toBe(ph);
      expect(r.rec.maxSh, 'they come all the way down').toBe(1);
      expect(r.downFrames, `phase ${ph}: down for about four seconds`).toBeGreaterThan(232);
      expect(r.downFrames).toBeLessThan(262);
      expect(r.shw).toBe(220);
      expect(r.shEnd, 'and are up again').toBe(0);
      expect(r.priv).toBe(false);
      expect(Math.abs(r.yEnd - r.hover), 'she is back at her float').toBeLessThan(40);
    }
  });

  it('anyone in their way when they slam is hit once (0.6 of a boss hit) and shoved to the inside; while they are down nobody can walk into them', () => {
    const left = priv(1, 120), right = priv(1, 1000);
    for (const [r, side] of [[left, 'left'], [right, 'right']]) {
      expect(r.slam.pct, `${side}: hit at the slam`).toBeCloseTo(r.boss*0.6, 5);
    }
    // (read a frame after: the shove's own speed has moved them a few px on)
    expect(Math.abs(left.slam.x - (220 + left.slam.fr + 4)), 'the left one is put just inside the shutter').toBeLessThanOrEqual(5);
    expect(Math.abs(right.slam.x - (1100 - 220 - right.slam.fr - 4))).toBeLessThanOrEqual(5);
    expect(left.slam.vx).toBeGreaterThan(0);
    expect(right.slam.vx).toBeLessThan(0);
    // ...and a fighter who tries to go back out is held at the shutter's face
    const c = priv(1, 550, { clamp: true });
    expect(c.clamp.left, 'sent at the left shutter').toBeGreaterThanOrEqual(220 + c.slam.fr - 0.001);
    expect(c.clamp.right, 'sent at the right one').toBeLessThanOrEqual(1100 - 220 - c.slam.fr + 0.001);
  });

  // The owner's pick, Round 17 (the question boxes, 2026-10-01): "PRIVATE! one more note per phase, in pairs from P2" -- it was 4, 5 and 6 beats, the notes in pairs in phase 3 only.
  it('a note leaves a shutter every beat -- 5, 6 and 7 beats of 48, 40 and 34 frames, in pairs from phase 2 -- its grille lit 20 frames before, alternating sides and the floor and platform heights', () => {
    for (const [ph, beats, len] of [[1, 5, 48], [2, 6, 40], [3, 7, 34]]) {
      const r = priv(ph, 550, { hold: true });
      const notes = r.notes.filter((n) => n.shape === 'psbnote');
      expect(new Set(r.rec.shots.map((s) => s.id)).size, `phase ${ph}: the slam and the song are one attack id`).toBe(1);
      expect(r.rec.shots.every((s) => s.volley && s.dmg === r.boss), `phase ${ph}: volleys at the shared damage`).toBe(true);
      const per = ph >= 2 ? 2 : 1;
      expect(notes.length, `phase ${ph}: ${beats} beats`).toBe(beats*per);
      const byBeat = [];
      for (let b = 0; b < beats; b++) byBeat.push(notes.slice(b*per, (b + 1)*per));
      byBeat.forEach((group, b) => {
        const side = b % 2 ? 1 : -1, first = group[0];
        expect(first.x, `beat ${b}: from the ${side < 0 ? 'left' : 'right'} shutter`).toBe(side < 0 ? 220 + 12 : 1100 - 220 - 12);
        expect(Math.sign(first.vx), 'crossing the room').toBe(-side);
        if (b) expect(first.at - byBeat[b - 1][0].at, 'a beat apart').toBe(len);
        if (per === 2) { expect(group[1].x, 'the pair: the second from the other shutter').toBe(side < 0 ? 1100 - 220 - 12 : 220 + 12); expect(group[1].at).toBe(first.at); expect(Math.round(group[1].y)).not.toBe(Math.round(first.y)); }
      });
      // levels in turn: the floor's height and the platform's
      const levels = byBeat.map((g) => g.map((n) => (Math.abs(n.y - r.fL) < 1 ? 'F' : Math.abs(n.y - r.fP) < 1 ? 'P' : '?')).join(''));
      const want = { 1: ['F', 'P', 'F', 'P', 'F'], 2: ['FP', 'PF', 'FP', 'PF', 'FP', 'PF'], 3: ['FP', 'PF', 'FP', 'PF', 'FP', 'PF', 'FP'] }[ph];
      expect(levels).toEqual(want);
      // the grille is lit before the note: each cue is `lead` frames before its note, on its side, at its height
      for (const n of notes) {
        const cue = r.cues.find((c) => c.frame === n.at - 20 && Math.abs(c.y - n.y) < 2 && c.side === (n.vx > 0 ? -1 : 1));
        expect(cue, `a lit grille 20 frames before the note at frame ${n.at}`).toBeTruthy();
      }
      expect(notes.every((n) => Math.abs(n.vx) === [0, 5.4, 6.2, 7.2][ph] && n.vy === 0), 'faster each phase').toBe(true);
      expect(notes.every((n) => Math.round(n.warnX) === n.x && Math.round(n.warnY) === n.y), 'a note carries its own start (the grille it came out of was lit): the glitch hunter\'s "told"').toBe(true);
    }
  });

  it('the slam and every note are one attack: standing in the worst place through the whole song costs one boss hit, and a fighter who took the slam takes no more than the rest of one', () => {
    const still = priv(1, 550, { hold: true });   // on the floor at the middle: the floor notes come through
    expect(still.rec.taken).toBeCloseTo(still.boss, 5);
    expect(new Set(still.rec.shots.map((s) => s.id)).size).toBe(1);
    expect(still.rec.shots.every((s) => s.volley && s.dmg === still.boss), 'full boss damage each note, a volley').toBe(true);
    const shoved = priv(3, 215, { hold: false });   // (inside the shutter's strip, outside the phase-3 lake)
    expect(shoved.rec.taken, 'the slam and the notes together').toBeLessThanOrEqual(shoved.boss + 1e-6);
    expect(shoved.rec.taken).toBeGreaterThan(shoved.boss*0.6 - 1e-6);
  });

  it('drawn: the shutters are slats with a hazard-striped foot, the two grilles lit where the next note comes from; the wind-up flashes the two strips they will fill', () => {
    const { w, log } = bootRecording();
    w.eval(`(function(){ ${STAGE(550, { phase: 1 })}
      var s = summons.find(function(m){ return m.type === 'boss'; });
      var H = psbHz(s); H.sh = 1; H.shw = 220; s._psbPv = [[-1, Math.round(psbLevelY('F')), 10], [1, Math.round(psbLevelY('P')), 10]];
      window.__args = { gy: groundY(), fF: psbLevelY('F'), fP: psbLevelY('P'), WW: WW };
      ctx.save(); psbHazard.draw(s, H, 'under'); ctx.restore(); })()`);
    const a = w.eval('window.__args');
    const rects = log.filter((e) => e.op === 'fillRect');
    expect(rects.some((e) => e.args[0] === -20 && e.args[2] === 240 && e.fill === '#585c6b'), 'the left shutter').toBe(true);
    expect(rects.some((e) => e.args[0] === a.WW - 220 && e.args[2] === 240 && e.fill === '#585c6b'), 'the right shutter').toBe(true);
    expect(rects.filter((e) => e.fill === '#ffd23f').length, 'a hazard-striped foot on each').toBeGreaterThanOrEqual(2);
    const lit = rects.filter((e) => e.fill === '#fff2a8');
    expect(lit.length, 'two grilles lit').toBe(2);
    expect(lit.some((e) => Math.abs(e.args[1] - (a.fF - 19)) < 1.01), 'the floor-height grille').toBe(true);
    expect(lit.some((e) => Math.abs(e.args[1] - (a.fP - 19)) < 1.01), 'the platform-height grille').toBe(true);
    // the wind-up: both strips of the width flash their stripes
    const rec2 = bootRecording();
    rec2.w.eval(`(function(){ ${STAGE(550, { phase: 1 })}
      var s = summons.find(function(m){ return m.type === 'boss'; }); s._tel = 30; s._telKind = 'private'; psbDrawFx(); })()`);
    const strips = rec2.log.filter((e) => e.op === 'fillRect' && e.fill === '#ffd23f' && e.args[2] === 220);
    expect(strips.map((e) => e.args[0]).sort((x, y) => x - y)).toEqual([0, 880]);
  });
});

describe('three phases, each changing the fight ("3 each": Round 5)', () => {
  it('phase 2 at 66% and phase 3 at 33%, each announced by its card; the knife lands in phase 2, the tower lurches in phase 3, and a burst that skips phase 2 still gets the knife', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var out = { p1: b._phase, knifed1: !!b._psbKnifed, cards: [] };
      var say = function(){ return window.__lastBanner ? [window.__lastBanner.text, window.__lastBanner.kind] : null; };
      window.__lastBanner = null; b.hp = b.maxHp*0.67; step(); out.at67 = b._phase;
      b.hp = b.maxHp*0.65; window.__lastBanner = null; step(); out.p2 = b._phase; out.card2 = say(); out.knifed2 = !!b._psbKnifed; out.knifeT = b._psbKnifeT; out.quake2 = b._psbQuake;
      for (var i=0;i<PSB.knifeT + 2;i++){ step(); f.invuln = 99; }
      out.knifeDone = b._psbKnifeT;
      b.hp = b.maxHp*0.34; step(); out.at34 = b._phase;
      IMPACT_DEBRIS.length = 0;
      b.hp = b.maxHp*0.32; window.__lastBanner = null; step(); out.p3 = b._phase; out.card3 = say(); out.quake3 = b._psbQuake; out.lurch = IMPACT_DEBRIS.length;
      return out;
    })()`);
    const skip = W.eval(`(function(){ ${STAGE(300)}
      b.hp = b.maxHp*0.1; step(); return { phase: b._phase, knifed: !!b._psbKnifed, knifeT: b._psbKnifeT }; })()`);
    expect(r.p1).toBe(1);
    expect(r.knifed1).toBe(false);
    expect(r.at67, 'just over two thirds is still phase 1').toBe(1);
    expect(r.p2).toBe(2);
    expect(r.card2).toEqual(['Puffball Speaker Box — PHASE 2: Stuck in a Loop', 'sys']);
    expect(r.knifed2).toBe(true);
    expect(r.knifeT, 'the knife drops in over PSB.knifeT frames').toBeGreaterThan(15);
    expect(r.knifeDone).toBe(0);
    expect(r.quake2, 'the tower shakes a second (60 frames)').toBeGreaterThanOrEqual(58);
    expect(r.at34).toBe(2);
    expect(r.p3).toBe(3);
    expect(r.card3).toEqual(['Puffball Speaker Box — PHASE 3: Sinking Clubhouse', 'sys']);
    expect(r.quake3, 'a 120-frame lurch').toBeGreaterThanOrEqual(118);
    expect(r.lurch, 'the tower lurches: dust and chunks off the floor').toBeGreaterThanOrEqual(6);
    expect(skip.phase).toBe(3);
    expect(skip.knifed, 'skipping phase 2 does not skip the knife').toBe(true);
  });

  it('phase 1 is a level Clubhouse; the tilt and the lead-paint lake come with phase 2 and grow in phase 3, easing in rather than jumping', () => {
    const hz = (ph, frames) => W.eval(`(function(){ ${STAGE(550, { phase: ph, settle: frames })}
      var H = b._hz || {}; return { rot: H.rot, lakeL: H.lakeL, lakeR: H.lakeR, plat: 'rot' in worldPlats[0], phase: b._phase }; })()`);
    const one = hz(1, 200), p2early = hz(2, 3), p2 = hz(2, 240), p3 = hz(3, 240);
    expect(one.phase).toBe(1);
    expect([one.rot, one.lakeL, one.lakeR], 'phase 1: level, no lake').toEqual([0, 0, 0]);
    expect(Math.abs(p2early.rot), 'phase 2 begins to lean...').toBeLessThan(1);
    expect(p2.rot, '...to five degrees, the low side the left').toBe(-5);
    expect(p2.lakeL, 'the lake creeps in from the edges, more of it on the low side').toBeCloseTo(110, 0);
    expect(p2.lakeR).toBeCloseTo(30, 0);
    expect([one.plat, p2.plat, p3.plat], 'the platform itself stays level: the lean is a push').toEqual([false, false, false]);
    expect(p3.rot).toBe(-9);
    expect(p3.lakeL, 'phase 3: +50 on the low side').toBeCloseTo(160, 0);
    expect(p3.lakeR).toBeCloseTo(50, 0);
  });

  it('the room pushes whoever stands on the floor or the platform toward the low side, and phase 3 pushes nearly twice as hard', () => {
    const drift = (ph, plat) => W.eval(`(function(){ ${STAGE(plat ? 550 : 600, { phase: ph, plat, settle: 240 })}
      var x0 = f.x; for (var i=0;i<90;i++){ step(); f.invuln = 99; } return { dx: f.x - x0, vx: f.vx }; })()`);
    const p1 = drift(1, false), p2 = drift(2, false), p3 = drift(3, false), plat2 = drift(2, true);
    expect(Math.abs(p1.dx), 'a level tower does not push').toBeLessThan(0.5);
    expect(p2.dx, 'toward the left, the low side').toBeLessThan(-15);
    expect(p3.dx).toBeLessThan(p2.dx*1.5);
    expect(p3.dx/p2.dx, 'about 1.8 times as hard').toBeGreaterThan(1.5);
    expect(p3.dx/p2.dx).toBeLessThan(2.1);
    expect(plat2.dx, 'on the platform too').toBeLessThan(-10);
  });

  it('standing in the lake is ONE hit (0.45 of a boss hit) and a bounce out, no more often than every 45 frames; over it in the air, or in phase 1, it does nothing', () => {
    const wade = (ph, x, o = {}) => W.eval(`(function(){ ${STAGE(x, { phase: ph, settle: 240 })}
      var hits = [], last = f.pct, bounced = null;
      for (var i=0;i<${o.frames || 200};i++){
        ${o.air ? 'f.x = ' + x + '; f.y = groundY() - 140; f.vx = 0; f.vy = 0; f.onground = false;' : 'if (f.x > 200) { f.x = ' + x + '; f.y = groundY() - 24; f.vx = 0; f.vy = 0; }'}
        step();
        if (f.pct > last + 1e-9){ hits.push({ i: i, d: +(f.pct - last).toFixed(3), vx: f.vx, vy: f.vy }); last = f.pct; }
        f.pct = f.pct;
      }
      return { hits: hits, boss: bossDmg(), lakeL: b._hz.lakeL };
    })()`);
    const p2 = wade(2, 50);
    expect(p2.lakeL).toBe(110);
    expect(p2.hits.length, 'hit again only after the cooldown').toBeGreaterThanOrEqual(2);
    for (const h of p2.hits) expect(h.d, 'each touch is 0.45 of a boss hit').toBeCloseTo(p2.boss*0.45, 4);
    for (let i = 1; i < p2.hits.length; i++) expect(p2.hits[i].i - p2.hits[i - 1].i, 'never more often than every 45 frames').toBeGreaterThanOrEqual(45);
    expect(p2.hits[0].vy, 'and it throws you up').toBeLessThan(-5);
    expect(p2.hits[0].vx, 'and back toward the middle').toBeGreaterThan(0);
    expect(wade(2, 20, { air: true }).hits, 'in the air above it, nothing').toEqual([]);
    expect(wade(1, 20).hits, 'phase 1 has no lake').toEqual([]);
    expect(wade(2, 600).hits, 'the middle of the floor is dry').toEqual([]);
  });

  it('the lake is drawn where it hurts: from the edge in to its shore, and only when there is any', () => {
    const { w, log } = bootRecording();
    w.eval(`(function(){ ${STAGE(550, { phase: 2 })}
      var s = summons.find(function(m){ return m.type === 'boss'; }); window.__s = s; })()`);
    const path = (H) => { log.length = 0; w.eval(`ctx.save(); psbHazard.draw(window.__s, ${JSON.stringify(H)}, 'under'); ctx.restore();`);
      const xs = log.filter((e) => e.op === 'lineTo' || e.op === 'moveTo').map((e) => e.args[0]); return { xs, fills: log.filter((e) => e.op === 'fill').map((e) => e.fill) }; };
    const none = path({ lakeL: 0, lakeR: 0 });
    expect(none.fills, 'no lake, nothing pink').not.toContain('#ff7fbf');
    const left = path({ lakeL: 110, lakeR: 0 });
    expect(left.fills).toContain('#ff7fbf');
    expect(Math.max(...left.xs), 'it ends at the shore, 110 in').toBeLessThanOrEqual(110.001);
    expect(Math.min(...left.xs)).toBeLessThanOrEqual(-19.9);
    const right = path({ lakeL: 0, lakeR: 30 });
    expect(Math.min(...right.xs), 'the right one starts 30 in from the right edge').toBeGreaterThanOrEqual(1100 - 30 - 0.001);
  });
});

describe('her arena: the Clubhouse of Awesomeness, with a disco floor and a lake, reacting to her', () => {
  it('has its sky, its ground, its hazard and its backdrop, and the gauntlet dresses it when she arrives', () => {
    const r = W.eval(`(function(){ ${STAGE(300, { settle: 1 })}
      return { arena: BOSS_ARENA, sky: BOSS_ARENA_SKY.clubhouse, ground: Object.keys(BOSS_ARENA_GROUND.clubhouse), pattern: typeof BOSS_ARENA_GROUND.clubhouse.pattern, fill: BOSS_ARENA_GROUND.clubhouse.fill,
               hazard: arenaHazardOf('clubhouse') === psbHazard, hzKeys: Object.keys(psbHazard), studioSame: BOSS_ARENA_SKY.studio, hover: b.hover, rows: BOSS_ROSTER.filter(function(x){ return x.arena === 'clubhouse'; }).map(function(x){ return x.name; }) };
    })()`);
    expect(r.arena).toBe('clubhouse');
    expect(r.sky.length, 'a netcode client only takes an arena key that has a sky').toBe(2);
    expect(r.ground.sort()).toEqual(['fill', 'line', 'pattern']);
    expect(r.pattern).toBe('function');
    expect(r.hazard).toBe(true);
    expect(r.hzKeys.sort()).toEqual(['draw', 'step']);
    expect(r.rows, 'hers alone').toEqual(['Puffball Speaker Box']);
  });

  it('the disco floor: three rows of black, white and grey tiles under the floor line, and the tiles her voice lit shine in their colours, then fade', () => {
    const { w, log } = bootRecording();
    w.eval(`(function(){ ${STAGE(900, { settle: 1 })} window.__s = summons.find(function(m){ return m.type === 'boss'; }); })()`);
    const gy = w.eval('groundY()');
    const paint = (lit) => { log.length = 0; w.eval(`(function(){ window.__s._hz = ${JSON.stringify({ lit })}; ctx.save(); BOSS_ARENA_GROUND.clubhouse.pattern(ctx, groundY(), -20, WW + 20, WH + H, BOSS_ARENA_GROUND.clubhouse); ctx.restore(); })()`); return log.filter((e) => e.op === 'fillRect'); };
    const plain = paint([]);
    const tiles = plain.filter((e) => Math.abs(e.args[1] - gy) < 0.01 && e.args[2] === 44 && e.args[3] === 30);
    expect(tiles.length, 'a row of 44-px tiles along the floor line').toBeGreaterThan(24);
    expect(new Set(tiles.map((e) => e.fill)), 'black, white and grey').toEqual(new Set(['#17171f', '#e9e9ef', '#8b8b98']));
    expect(plain.some((e) => Math.abs(e.args[1] - (gy + 30)) < 0.01 && e.args[3] === 42), 'a second row, deeper and taller').toBe(true);
    // a tile lit now, in colour 2 (yellow) -- and one due in the future is not lit yet
    const now = w.eval('hazardT');
    const lit = paint([[5, now - 3, 2], [7, now + 50, 4]]);
    expect(lit.some((e) => e.fill === '#ffe23a' && e.args[0] === 5*44 && e.args[1] === gy), 'tile 5 lights in yellow').toBe(true);
    expect(lit.some((e) => e.args[0] === 7*44 && e.fill === '#3a8cff'), 'tile 7 waits for its frame').toBe(false);
    const faded = paint([[5, now - 400, 2]]);
    expect(faded.some((e) => e.fill === '#ffe23a'), 'and it has faded out by then').toBe(false);
  });

  it('the backdrop draws the wall panels level with the ring lanes along both edges, and leans with the tower', () => {
    const { w, log } = bootRecording();
    w.eval(`(function(){ ${STAGE(900, { settle: 1 })} window.__s = b; })()`);
    log.length = 0;
    w.eval('ctx.save(); psbDrawDecor(); ctx.restore();');
    const gy = w.eval('groundY()');
    const rects = log.filter((e) => e.op === 'fillRect' && e.args[2] === 46 && e.args[3] === 38);
    for (let k = 0; k < 7; k++) for (const x0 of [0, 1100 - 46]) {
      expect(rects.some((e) => e.args[0] === x0 && Math.abs(e.args[1] - (gy - 38 - 42*k - 19)) < 0.01), `panel ${k} at ${x0}`).toBe(true);
    }
    // no strobe: the panel colours are drawn as hsla drifting with the frame (slowly), never switched
    const hsl = log.filter((e) => e.op === 'fillRect' && typeof e.fill === 'string' && e.fill.startsWith('hsla('));
    expect(hsl.length).toBeGreaterThan(100);
    // it leans with the tower: the transform is rotated by 0.6 of the tower's degrees
    const lean = (deg) => { log.length = 0; w.eval(`window.__s._hz = { rot: ${deg} }; ctx.save(); psbDrawDecor(); ctx.restore();`); return log.find((e) => e.op === 'rotate').args[0]; };
    expect(lean(0)).toBe(0);
    expect(lean(-9)).toBeCloseTo(-9*0.6*Math.PI/180, 6);
  });
});

describe('her ending: Spongy falls on her ("Endings: \'All of them\'"), no text', () => {
  // "She was later killed after being crushed by Spongy in 'Lots of Mud'" (Puffball Speaker Box); "Shortly after, she is crushed by a
  // falling Spongy." (Lots of Mud/Transcript)
  it('is her own entry in BOSS_ENDINGS: a sweep and a scene, a short hold for the BOSS DOWN card, no line of text, and over before the next boss arrives', () => {
    const r = W.eval(`(function(){ var E = BOSS_ENDINGS.soundwave; return { keys: Object.keys(E).sort(), hold: E.holdMs, line: E.line, sweep: E.sweep === psbEndingSweep, begin: E.begin === psbEnding, total: PSB_END.total, tag: Object.keys(BOSS_ENDINGS) }; })()`);
    expect(r.keys).toEqual(['begin', 'holdMs', 'sweep']);
    expect(r.line, 'only Springy\'s ending has a line').toBeUndefined();
    expect(r.sweep && r.begin).toBe(true);
    expect(r.tag).toContain('springy');
    expect(r.total*1000/60, 'the scene is over before the next boss arrives (1.5 s + the hold)').toBeLessThan(1500 + r.hold);
    expect(r.hold).toBeGreaterThan(0);
  });

  it('beating her leaves one inert scene shot where she fell (its delay is its clock), a crash timed for the moment Spongy lands, and holds the card back', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var st = setTimeout, timers = [], said = [], _b = banner;
      setTimeout = function(fn, ms){ timers.push({ fn: fn, ms: ms }); return 0; };
      banner = function(t, m, k, l){ said.push([String(t), k || null]); return _b(t, m, k, l); };
      try {
        BOSSRUSH.active = true; b.x = 610; b.y = 380; b.face = -1; b.hp = 0;
        IMPACT_DEBRIS.length = 0; IMPACT_SCARS.length = 0;
        bossRushCheck();
        var sc = projectiles.filter(function(p){ return p.psbEnd; });
        var out = { n: sc.length, scene: sc[0] && { x: sc[0].x, y: sc[0].y, delay: sc[0].delay, life: sc[0].life, dmg: sc[0].dmg, hy: sc[0].hy, face: sc[0].face, r: sc[0].r },
                    gy: groundY(), ms: timers.map(function(t){ return t.ms; }), said: said.slice(), scars: IMPACT_SCARS.length, debris: IMPACT_DEBRIS.length, total: PSB_END.total, crush: PSB_END.crush };
        var crashTimer = timers.find(function(t){ return t.ms === Math.round(PSB_END.crush*1000/60); });
        IMPACT_DEBRIS.length = 0; running = true; shakeAmt = 0;
        if (crashTimer) crashTimer.fn();
        out.crashDebris = IMPACT_DEBRIS.length; out.crashShake = shakeAmt;
        // the scene is harmless: it hits nobody, however long it stands where a fighter is
        f.x = sc[0].x; f.y = sc[0].y; f.invuln = 0; f.pct = 0; for (var i=0;i<PSB_END.total + 5;i++) step();
        out.taken = f.pct; out.left = projectiles.filter(function(p){ return p.psbEnd; }).length;
        return out;
      } finally { setTimeout = st; banner = _b; BOSSRUSH.active = false; running = false; summons = []; projectiles = []; }
    })()`);
    expect(r.n, 'one scene').toBe(1);
    expect(r.scene.x).toBe(610);
    expect(r.scene.y, 'inert, under the floor line where nothing meets it').toBeGreaterThan(r.gy);
    expect(r.scene.hy, 'she fell from where she hung').toBe(380);
    expect(r.scene.face).toBe(-1);
    expect(r.scene.delay, 'its clock').toBe(r.total);
    expect(r.scene.dmg).toBe(0);
    expect(r.scene.life).toBe(1);
    expect(r.ms, 'the card after the hold, the next boss after 1.5 s and the hold, and the crash when he lands').toEqual(expect.arrayContaining([500, 2000, Math.round(r.crush*1000/60)]));
    expect(r.said.some(([t, k]) => k === 'boss'), 'no text').toBe(false);
    expect(r.said.some(([t]) => /^BOSS DOWN/.test(t)), 'the card waits').toBe(false);
    expect(r.scars, 'she drops and cuts the floor').toBeGreaterThanOrEqual(1);
    expect(r.debris).toBeGreaterThanOrEqual(5);
    expect(r.crashDebris, 'and Spongy landing is a heavy hit too').toBeGreaterThanOrEqual(8);
    expect(r.crashShake).toBeGreaterThan(3);
    expect(r.taken, 'it is a scene, not a shot').toBe(0);
    expect(r.left, 'and it is gone when it ends').toBe(0);
  });

  it('the scene draws: she drops, he falls on her, she goes flat with the colours bursting out, he springs off, the pancake fades -- and not a word', () => {
    const { w, log } = bootRecording();
    w.eval(`(function(){ ${STAGE(500, { settle: 1 })} })()`);
    const at = (t) => { log.length = 0; w.eval(`ctx.save(); psbDrawEnd({ x:500, y:1000, delay:${112 - t}, hy:300, face:1 }); ctx.restore();`); return log.slice(); };
    const gy = w.eval('groundY()');
    const words = [];
    for (const t of [0, 8, 14, 25, 36, 40, 50, 66, 85, 100, 111]) { const l = at(t); words.push(...l.filter((e) => e.op === 'fillText' || e.op === 'strokeText')); }
    expect(words, 'no text').toEqual([]);
    const flat = at(50).find((e) => e.op === 'scale' && Math.abs(e.args[1] - 0.16) < 0.001);
    expect(flat, 'flat under him once he has landed (36 + 6 frames)').toBeTruthy();
    expect(flat.args[0], 'and wider for it').toBeCloseTo(1.4, 5);
    expect(at(0).some((e) => e.op === 'scale' && e.args[1] < 0.9), 'not flat before').toBe(false);
    const burst = at(50).filter((e) => e.op === 'fill' && ['#ff3b3b', '#ff9a2e', '#ffe23a', '#38d64a', '#3a8cff', '#a24cff'].includes(e.fill));
    expect(burst.length, 'the colours burst out of her').toBeGreaterThanOrEqual(6);
    expect(at(0).filter((e) => e.op === 'fill' && ['#ff3b3b', '#38d64a', '#a24cff'].includes(e.fill)).length, 'not before he lands').toBe(0);
    // Spongy is on screen while he falls, and gone off the top by the end
    const yOf = (l) => l.filter((e) => e.op === 'translate').map((e) => e.args[1]);
    expect(Math.min(...yOf(at(20)).filter((y) => y < 0)), 'above the screen, then coming down').toBeLessThan(0);
    void gy;
  });

  it('a netcode client gets her ending from one delayed shot in the snapshot: its clock, the height she fell from and which way she faced', () => {
    const host = loadMonolith().window, client = loadMonolith().window;
    const snap = host.eval(`(function(){
      SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
      BOSSRUSH = { active:true, bossIdx:1, cleared:0, defeated:false, loop:0, dmgMult:1 };
      worldPlats=[{ x:${PLAT.x}, y:${PLAT.y}, w:${PLAT.w}, h:14 }]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 300, groundY()-24, 0); f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
      spawnBossRushBoss(); var b = summons.find(function(s){ return s.type==='boss'; }); b.hp = b.maxHp*0.2;
      for (var i=0;i<200;i++){ step(); f.invuln = 99; }
      NET.role = 'host'; b.face = 1;
      psbEnding(b);
      var out = JSON.parse(JSON.stringify(serializeState()));
      NET.role = 'solo';
      return out; })()`);
    const row = snap.pj.a.find((r) => r[8] && r[8].psbEnd);
    expect(row, 'the scene is in the snapshot').toBeTruthy();
    expect(row[8].delay).toBe(112);
    expect(typeof row[8].hy).toBe('number');
    expect(row[8].face).toBe(1);
    const r = client.eval(`(function(){ applySnapshot(${JSON.stringify(snap)});
      var p = projectiles.find(function(q){ return q.psbEnd; }); return { psbEnd: !!p, delay: p && p.delay, hy: p && p.hy, arena: BOSS_ARENA }; })()`);
    expect(r).toEqual({ psbEnd: true, delay: 112, hy: expect.any(Number), arena: 'clubhouse' });
  });
});

describe('her art: the show\'s files where there are clean ones, drawn where there are none ("Yes, cut or draw")', () => {
  const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
  const manifest = JSON.parse(readFileSync('scripts/attack-sprite-manifest.json', 'utf8'));
  const script = readFileSync('scripts/fetch-attack-sprites.mjs', 'utf8');
  const slot = script.slice(script.indexOf('@boss:puffball:begin picks'), script.indexOf('@boss:puffball:end picks'));

  it('the knife of CONSEQUENCES! (and the one in her back) is File:One knife.png and the note of PRIVATE! the BFDIA 14 note body: fetched by her picks, in the manifest, on disk, transparent, credited with their sources', () => {
    expect(slot).toMatch(/psbknife:\s*\{[^}]*file: 'One knife\.png'/);
    expect(slot).toMatch(/psbnote:\s*\{[^}]*file: 'Bfdia 14body musicnote\.png'/);
    for (const [key, title, w, h] of [['psbknife', 'One knife.png', 14, 100], ['psbnote', 'Bfdia 14body musicnote.png', 51, 56]]) {
      const e = manifest[key];
      expect(e, key).toBeTruthy();
      expect(e.who).toBe('Puffball Speaker Box');
      expect(e.srcTitle).toBe(title);
      expect(e.source).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/battlefordreamisland\/images\//);
      expect(e.file).toBe(`${key}.png`);
      const png = PNG.sync.read(readFileSync(`artifacts/V1/assets/sprites/attacks/${e.file}`));
      expect([png.width, png.height], 'the manifest\'s size is the file\'s').toEqual([e.width, e.height]);
      expect([png.width, png.height]).toEqual([w, h]);
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      expect(clear/(png.width*png.height), `${key} is an object, not a rectangle`).toBeGreaterThan(0.2);
      expect(credits, `${e.file} is credited`).toContain(`(${e.file})`);
      expect(credits).toContain(e.source);
    }
    // the credits slot says what is drawn, and why the Sound Wave file was not used
    expect(credits).toContain('File:Sound Wave.png is the Sound Wave character');
    expect(credits).toContain('rainbow.png');
  });

  it('they are wired: the knife draws point first with a glow, the note upright with its own; the rings and the lake are drawn (no file), and the barf is the rainbow file she already had', () => {
    const r = W.eval(`({ knife: ATTACK_SPRITES.psbknife, note: ATTACK_SPRITES.psbnote, ring: ATTACK_SPRITES.psbring, glyphs: ['psbring', 'psbknife', 'psbnote'].map(function(k){ return !!PROJ_SHAPE[k]; }),
      fly: ATTACK_SPRITES.fly && ATTACK_SPRITES.fly.src, mic: !!PROJ_SHAPE.soundwave, R90: R90 })`);
    expect(r.knife).toMatchObject({ src: 'assets/sprites/attacks/psbknife.png', aim: true, rot: r.R90 });
    expect(r.knife.h).toBeLessThanOrEqual(44);
    expect(r.knife.halo).toMatch(/^rgba\(255,255,255/);
    expect(r.note).toMatchObject({ src: 'assets/sprites/attacks/psbnote.png' });
    expect(r.note.halo).toBeTruthy();
    expect(r.note.aim, 'a note stays upright').toBeUndefined();
    expect(r.ring, 'a ring of sound has no file: it is drawn').toBeUndefined();
    expect(r.glyphs).toEqual([true, true, true]);
    expect(r.fly, 'the rainbow stream is the rainbow.png she already threw').toBe('assets/sprites/attacks/rainbow.png');
    expect(r.mic, 'Microphone\'s Feedback keeps its own `soundwave` shape').toBe(true);
    for (const f of ['psbknife.png', 'psbnote.png']) expect(existsSync(`artifacts/V1/assets/sprites/attacks/${f}`)).toBe(true);
  });

  it('every glyph of hers draws something without throwing, and the rings wear the colour of their lane', () => {
    const r = W.eval(`(function(){ var out = {};
      ['psbring', 'psbknife', 'psbnote'].forEach(function(k){
        var n = 0, fills = [], strokes = [], set = {}, c = new Proxy({}, { get:function(_t,p){ if (p==='canvas') return {width:1100,height:720}; if (p==='measureText') return function(){ return {width:0}; };
          return function(){ if (p==='fill'||p==='stroke') n++; }; }, set:function(_t,p,v){ set[p] = v; if (p==='strokeStyle') strokes.push(v); return true; } });
        try { PROJ_SHAPE[k].draw(c, 13, { x:120, y:80, vx:-4, vy:0, color:'#38d64a', r:13 }); out[k] = { n: n, strokes: strokes }; } catch(e){ out[k] = { err: e.message }; } });
      return out; })()`);
    for (const k of ['psbring', 'psbknife', 'psbnote']) { expect(r[k].err, k).toBeUndefined(); expect(r[k].n, `${k} draws`).toBeGreaterThan(0); }
    expect(r.psbring.strokes, 'the ring is drawn in its lane\'s colour').toContain('#38d64a');
  });

  it('the knife in her back is drawn under her art from phase 2 on (not in phase 1), falling in when the phase begins', () => {
    const { w, log } = bootRecording();
    w.eval(`(function(){ ${STAGE(500, { settle: 1 })} window.__s = b; ATTACK_IMG.psbknife = { complete:true, naturalWidth:14, naturalHeight:100 }; })()`);
    const tell = (ph, knifeT) => { log.length = 0; w.eval(`window.__s._phase = ${ph}; window.__s._psbKnifeT = ${knifeT}; window.__s._tel = 0; ctx.save(); psbDrawTell(window.__s); ctx.restore();`);
      return { draws: log.filter((e) => e.op === 'drawImage'), moves: log.filter((e) => e.op === 'translate').map((e) => e.args) }; };
    expect(tell(1, 0).draws, 'no knife in phase 1').toEqual([]);
    const still = tell(2, 0), falling = tell(2, 22);
    expect(still.draws.length, 'in her back in phase 2').toBe(1);
    expect(still.draws[0].args[0]).toMatchObject({ naturalWidth: 14 });
    expect(falling.draws.length).toBe(1);
    expect(falling.moves[0][1], 'it drops in from above').toBeLessThan(still.moves[0][1] - 100);
  });
});

describe('a netcode client draws her from the snapshot', () => {
  it('carries her tells, the hazard state and the arena; a client applies them and draws the panels, the spotlight, the lake and the shutters as the host would', () => {
    const host = loadMonolith().window, client = loadMonolith().window;
    const snap = host.eval(`(function(){ ${STAGE(300, { phase: 2, settle: 200 })}
      b._pickForce = 'soundwave'; b._atkLive = null; b._atkTimer = 1; b._tel = 0; step(); for (var i=0;i<10;i++) step();
      var out = { kind: b._telKind };
      psbHz(b).sh = 0.6; psbHz(b).shw = 220; b._psbPv = [[1, 418, 12]]; b._psbSpX = 321.4; b._psbSpY = 590.4; b._psbSpT = 0.8; b._psbSpLk = 1; b._psbArc = [0.3, 2.0]; b._psbKnifeT = 5;
      out.snap = JSON.parse(JSON.stringify(serializeState()));
      return out; })()`);
    const boss = snap.snap.summons.find((m) => m.type === 'boss');
    expect(snap.kind).toBe('soundwave');
    expect(snap.snap.arena, 'the arena key rides along').toBe('clubhouse');
    expect(boss._psbPat, 'the wall panels\' lanes').toHaveLength(6);
    expect(boss._psbPatT).toBeGreaterThan(0);
    expect(boss._psbPv).toEqual([[1, 418, 12]]);
    expect(boss._psbSpX).toBe(321);
    expect([boss._psbSpT, boss._psbSpLk, boss._psbKnifeT]).toEqual([0.8, 1, 5]);
    expect(boss._psbArc).toEqual([0.3, 2.0]);
    expect(boss._hz.rot).toBeLessThan(-1);
    expect(boss._hz.sh).toBe(0.6);
    const r = client.eval(`(function(){ applySnapshot(${JSON.stringify(snap.snap)});
      var s = summons.find(function(m){ return m.type === 'boss'; }), errs = [];
      var tryIt = function(name, fn){ try { ctx.save(); fn(); ctx.restore(); } catch(e){ errs.push(name + ': ' + e.message); } };
      tryIt('fx', function(){ psbDrawFx(); }); tryIt('decor', function(){ psbDrawDecor(); }); tryIt('tell', function(){ psbDrawTell(s); });
      tryIt('under', function(){ psbHazard.draw(s, s._hz, 'under'); }); tryIt('ground', function(){ BOSS_ARENA_GROUND.clubhouse.pattern(ctx, groundY(), -20, WW + 20, WH + H, BOSS_ARENA_GROUND.clubhouse); });
      return { arena: BOSS_ARENA, pat: s._psbPat, hz: s._hz && s._hz.sh, errs: errs, found: !!psbBoss(), attack: s.attack }; })()`);
    expect(r.errs).toEqual([]);
    expect(r.arena).toBe('clubhouse');
    expect(r.found).toBe(true);
    expect(r.pat).toEqual(boss._psbPat);
    expect(r.hz).toBe(0.6);
  });
});

describe('no words on screen: her singing is sound and visuals', () => {
  it('a whole fight of hers says only her four telegraph names and the phase cards -- nothing else, in any phase', () => {
    const r = W.eval(`(function(){ ${STAGE(550, { settle: 60 })} ${TURN}
      var said = [], _b = banner;
      banner = function(t, m, k, l){ said.push({ text: String(t), kind: k || null }); return _b(t, m, k, l); };
      try {
        f.invuln = 1e9;
        turn('soundwave'); turn('consequences'); turn('private');
        b.hp = b.maxHp*0.5; f.invuln = 1e9;
        turn('rainbowbarf');
        b.hp = b.maxHp*0.2; f.invuln = 1e9;
        turn('soundwave');
      } finally { banner = _b; }
      return said;
    })()`);
    const names = new Set(['SONIC BLAST!', 'CONSEQUENCES!', 'RAINBOW BARF!', 'PRIVATE!']);
    expect(r.length, 'five turns and two phase cards').toBe(7);
    for (const b of r) {
      expect(['boss', 'sys'], `"${b.text}" is a telegraph or a card`).toContain(b.kind);
      if (b.kind === 'boss') expect(names.has(b.text), `"${b.text}" is one of her four`).toBe(true);
      else expect(b.text, 'a card').toMatch(/^Puffball Speaker Box — PHASE [23]: /);
    }
    expect(r.filter((b) => b.kind === 'boss').map((b) => b.text)).toEqual(expect.arrayContaining([...names]));
  }, 240000);

  it('her drawing puts no word on the canvas in any state: the backdrop, the floor, the lake, the shutters, the panels, the spotlight, her tells, her shots and her ending', () => {
    const { w, log } = bootRecording();
    w.eval(`(function(){ ${STAGE(500, { phase: 3, settle: 5 })} window.__s = b; })()`);
    const texts = () => log.filter((e) => e.op === 'fillText' || e.op === 'strokeText');
    log.length = 0;
    w.eval(`(function(){ var s = window.__s, H = psbHz(s);
      H.rot = -9; H.lakeL = 160; H.lakeR = 50; H.sh = 1; H.shw = 220; H.lit = [[3, hazardT - 2, 1], [9, hazardT - 20, 4]];
      s._psbPat = [0,1,1,1,1,1,1]; s._psbPatT = 30; s._psbPv = [[-1, 552, 12], [1, 418, 12]]; s._psbSpX = 400; s._psbSpY = 590; s._psbSpT = 1; s._psbSpLk = 1; s._psbArc = [0.4, 2.0]; s._psbKnifeT = 9; s._psbJump = 10;
      ['soundwave', 'consequences', 'rainbowbarf', 'private'].forEach(function(k){ s._telKind = k; s._tel = 20;
        ctx.save(); psbDrawDecor(); ctx.restore(); ctx.save(); BOSS_ARENA_GROUND.clubhouse.pattern(ctx, groundY(), -20, WW + 20, WH + H, BOSS_ARENA_GROUND.clubhouse); ctx.restore();
        ctx.save(); psbHazard.draw(s, H, 'under'); ctx.restore(); ctx.save(); psbHazard.draw(s, H, 'over'); ctx.restore();
        psbDrawFx(); ctx.save(); psbDrawTell(s); ctx.restore(); });
      [['psbring', '#ff3b3b'], ['psbknife', '#dfe4ea'], ['psbnote', '#3a8cff'], ['fly', '#ffe23a']].forEach(function(sh){ [1, -1].forEach(function(d){ ctx.save(); drawProjectile({ x:300, y:300, vx:d*8, vy:2, r:13, color:sh[1], shape:sh[0], life:50 }); ctx.restore(); }); });
      [0, 20, 44, 80, 111].forEach(function(t){ ctx.save(); psbDrawEnd({ x:500, y:1000, delay:112 - t, hy:300, face:1 }); ctx.restore(); });
    })()`);
    expect(log.length, 'and it drew a great deal').toBeGreaterThan(1500);
    expect(texts(), 'not one fillText or strokeText').toEqual([]);
  });
});

describe('"Harder, same damage": every extra shot keeps the turn\'s one attack id, and nothing she throws hits harder than the shared boss hit', () => {
  it('a later loop of the gauntlet doubles the boss\'s damage and hers with it: every shot, the slam and the lake read bossDmg()', () => {
    const r = W.eval(`(function(){ ${STAGE(900)} ${TURN}
      BOSSRUSH.dmgMult = 2;
      var rec = turn('soundwave', { hold:true, x:900 });
      var kn = turn('consequences', { max:400 }).shots;
      var full = bossDmg();
      var lakeD = null; b.hp = b.maxHp*0.5; for (var i=0;i<240;i++){ step(); f.invuln = 99; }
      f.invuln = 0; f.pct = 0; f.x = 30; f.y = groundY() - 24; f.vx = 0; f.vy = 0; b._atkTimer = 1e9; var p0 = f.pct; for (var k=0;k<3;k++) step(); lakeD = f.pct - p0;
      return { full: full, ring: rec.shots.map(function(s){ return s.dmg; }), knife: kn.map(function(s){ return s.dmg; }), lake: lakeD };
    })()`);
    expect(r.full).toBe(44);
    expect(r.ring.every((d) => d === 44)).toBe(true);
    expect(r.knife.every((d) => d === 44)).toBe(true);
    expect(r.lake, '0.45 of the boss hit').toBeCloseTo(44*0.45, 4);
  });

  it('every turn of hers in every phase throws its shots under ONE attack id, as volleys, at the shared damage', () => {
    const combos = [[1, 'soundwave'], [2, 'soundwave'], [3, 'soundwave'], [1, 'consequences'], [3, 'consequences'], [2, 'rainbowbarf'], [3, 'rainbowbarf']];   // (PRIVATE!'s three phases are pinned with its notes above)
    const run = (ph, kind) => W.eval(`(function(){ ${STAGE(550, { phase: ph, settle: 20 })} ${TURN}
      f.invuln = 1e9; var rec = turn('${kind}', { max:700 });
      return { n: rec.shots.length, ids: Array.from(new Set(rec.shots.map(function(s){ return s.id; }))).length, volley: rec.shots.every(function(s){ return s.volley; }), dmg: Array.from(new Set(rec.shots.map(function(s){ return s.dmg; }))), boss: bossDmg(), kind: rec.kind, phase: b._phase,
        marked: rec.shots.every(function(s){ return s.warnX != null && Math.round(s.warnX) === s.x && Math.round(s.warnY) === s.y; }) }; })()`);
    for (const [ph, kind] of combos) {
      const x = run(ph, kind);
      expect(x.phase).toBe(ph);
      expect(x.kind).toBe(kind);
      expect(x.n, `${kind} in phase ${ph} throws`).toBeGreaterThan(0);
      expect(x.ids, `${kind} in phase ${ph}: one attack id`).toBe(1);
      expect(x.volley).toBe(true);
      expect(x.dmg, `${kind} in phase ${ph}: the shared boss hit, no more`).toEqual([x.boss]);
      expect(x.marked, `${kind} in phase ${ph}: every shot carries its own start as warnX/warnY (the spot her wind-up marked: the glitch hunter's "told")`).toBe(true);
    }
  }, 300000);
});

// The glitch pass, Round 17 (scripts/boss-glitch.mjs, the hunter's assists runs against this boss): Book's DEFINE marks "whoever last hit her", and after a boss's shot that is the shot's plain owner
// ({team:-1, idx:-2}, no position), so the marker puffed at an undefined spot (twelve non-finite puffs a run, and arcs drawn at NaN for their whole life). Only a fighter of the match can be marked.
describe('Book\'s DEFINE after a boss shot (glitch follow-up)', () => {
  it('a boss shot as the last hit marks nobody and puffs nowhere odd; a fighter who hit her is still marked', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var book = makeFighter(ROSTER.find(function(q){ return q.name === 'Book'; }), 700, groundY()-24, 1); book.team = 0; book.controller = 'still'; book.stocks = 9; fighters.push(book);
      var bad = [], _puff = puff; puff = function(x, y){ if (!isFinite(x) || !isFinite(y)) bad.push([x, y]); return _puff.apply(this, arguments); };
      var out = {};
      try {
        f.defined = 0; f.defineStacks = 0; book.spCd = 0; book.lastHitBy = { team:-1, idx:-2 }; doSpecial(book);
        out.afterBoss = { defined: f.defined, stacks: f.defineStacks, bad: bad.length };
        book.spCd = 0; book.lastHitBy = f; doSpecial(book);
        out.afterFighter = { defined: f.defined, stacks: f.defineStacks, bad: bad.length };
        book.spCd = 0; book.lastHitBy = summons.find(function(s){ return s.type === 'boss'; }); f.defineStacks = 0; f.defined = 0; doSpecial(book);   // (the boss itself is no fighter either)
        out.afterBossBody = { defined: f.defined, stacks: f.defineStacks, bad: bad.length };
      } finally { puff = _puff; }
      return out; })()`);
    expect(r.afterBoss, 'the plain owner of a boss shot is nobody: no mark, no puff at an undefined spot').toEqual({ defined: 0, stacks: 0, bad: 0 });
    expect(r.afterFighter.defined, 'a fighter who hit her is marked').toBe(600);
    expect(r.afterFighter.stacks).toBe(1);
    expect(r.afterFighter.bad, 'and the marker puffs on him').toBe(0);
    expect(r.afterBossBody, 'the boss\'s own body is not a fighter of the match either').toEqual({ defined: 0, stacks: 0, bad: 0 });
  });
});
