import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';
import { loadMonolith } from './helpers/load-monolith.js';
import { mulberry32 } from './helpers/prng.js';

// PURPLE FACE, Boss 5, REBUILT (the boss overhaul, 2026-09-29: boss-overhaul-decisions.md, Rounds 10-13). The owner's approved kit:
//   AD BREAK!      the signature, redone: "the swallow becomes a lunge you can dodge" (it grabbed the nearest fighter from anywhere); the
//                  stomach, its acid and its tongue stay as they were
//   FREESTYLE RAP! "2 should be uninterruptable." -- the beat cannot be stopped, and three pulses come every time -- and, 2026-10-01 (Round 17), "purple
//                  faces notes should be in varied areas.": each pulse from a spot of its own, on the floor or the platform, drawn fresh every use
//   TORTURE TIME!  a glass tank closes over your spot, one bug inside becomes hundreds, then the tank bursts
//   THANK YOU FOR COMING!  he pops up beside you, grows a leg and kicks, and totems roll out
//   TOTAL SLIP SHOES!      clown shoes on the marked fighter: their footing turns slippery for 3 s -- a status, no damage
// His arena is Yellow Face's Warehouse ("yellow faces warehouse.": the owner turned the TV studio down), with the owner's rule "if it
// makes sense for a hazard, reduce boss difficulty and add a hazard." (the World's Strongest Magnet drops the end shelves; his turns are
// a shade slower). "Only if canon moves": he pops up beside you and he runs. "Harder, same damage". His stomach used to draw "TONGUE
// n%" as words -- "and remember the thing abt no attack titles onscreen." -- and draws a wordless meter now.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

const ROW = { name: 'Purple Face', color: '#7a3a8a', hp: 235, big: 2.6, attack: 'swallow', arena: 'warehouse', stationary: false, sprite: 'face' };

// A still Firey on the floor at `x`, Boss Rush with the gauntlet off, and Purple Face spawned the way the gauntlet spawns him, his attack
// timer parked (unless `live`) and the warehouse's hazard parked too (unless `hz`), so a test sees only the thing it asks about.
const STAGE = (x, live, hz) => `
  SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
  BOSSRUSH = { active:false, bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.name==='Purple Face'; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats=platRectsSmall(); summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; impactFxClear();
  var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), ${x}, groundY()-24, 0);
  f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
  spawnBossRushBoss();
  var b = summons.find(function(s){ return s.type==='boss'; });
  ${live ? '' : 'b._atkTimer = 1e9;'}
  ${hz ? '' : 'b._hz = { st:0, n:1e9, k:0, c:0, sd:0 };'}
  step(); f.pct=0; f.invuln=0;
`;
// Start this boss's next wind-up as `kind` (the turns alternate: signature, extra 0, signature, extra 1, signature, extra 2, ...).
const TURN = { swallow: 0, pfaceRap: 1, pfaceTorture: 3, pfaceThanks: 5, pfaceShoes: 7 };
const BEGIN = (kind) => `b._moveN = ${TURN[kind]}; b._tel = 0; b._atkTimer = 1; step(); f.invuln = 0;`;
// A bare boss for driving his functions directly.
const S = (o = '') => `{ name:'Purple Face', attack:'swallow', x:550, y:groundY()-88.4, r:88.4, hp:100, maxHp:100, _phase:1, _atkTimer:1, _tel:0,
  color:'#7a3a8a', face:-1, homeX:550, stationary:false, vx:0, vy:0 ${o ? ',' + o : ''} }`;

describe('Purple Face is Boss 5, rebuilt', () => {
  it('is still the fifth boss and the same HP, with the warehouse as his arena, no longer stationary, and his own four second moves', () => {
    const r = W.eval(`(function(){
      var i = BOSS_ROSTER.findIndex(function(b){ return b.name==='Purple Face'; });
      return { i: i, row: BOSS_ROSTER[i], n: BOSS_ROSTER.length, prev: BOSS_ROSTER[i-1].name, next: BOSS_ROSTER[i+1].name,
               extra: BOSS_EXTRA['Purple Face'], names: BOSS_EXTRA['Purple Face'].map(function(k){ return BOSS_MOVE_NAME[k]; }),
               fns: BOSS_EXTRA['Purple Face'].map(function(k){ return typeof BOSS_MOVES[k]; }),
               rushOnly: BOSS_EXTRA['Purple Face'].every(function(k){ return BOSS_RUSH_ONLY.has(k); }),
               tel: PFACE.tel, gaps: PFACE.gaps, p2: bossPhaseName({ attack:'swallow' }, 2), p3: bossPhaseName({ attack:'swallow' }, 3) };
    })()`);
    expect(r.row).toEqual(ROW);
    expect(r.i, 'Boss 5').toBe(4);
    expect([r.prev, r.next]).toEqual(['The Bug Swarm', 'MePhone4']);   // MePhone4 follows him since the Dragon moved to Boss 9 ("just move purple dragon!!!", 2026-09-30)
    expect(r.n, 'the gauntlet is still twelve long').toBe(12);
    expect(r.extra).toEqual(['pfaceRap', 'pfaceTorture', 'pfaceThanks', 'pfaceShoes']);
    expect(r.names).toEqual(['FREESTYLE RAP!', 'TORTURE TIME!', 'THANK YOU FOR COMING!', 'TOTAL SLIP SHOES!']);
    expect(r.fns).toEqual(['function', 'function', 'function', 'function']);
    expect(r.rushOnly, 'an item boss (no wind-up fields, no arena) never throws them').toBe(true);
    expect(r.gaps.slice(1), 'eased a shade from the default 100/72/52: the magnet is the difference').toEqual([116, 86, 64]);
    expect(r.p2).toBe('Running Loops');   // "Running loops in Yellow Face's warehouse" (File:Running loops in Yellow Face's warehouse.gif)
    expect(r.p3).toBe('Broken Value');     // "Purple Face with a broken value" (BFB 28)
  });

  it('takes turns: AD BREAK!, the rap, AD BREAK!, the tank, AD BREAK!, the kick, AD BREAK!, the shoes -- each named, each with its own wind-up', () => {
    const r = W.eval(`(function(){
      fighters = []; projectiles = [];
      var s = ${S()}, kinds = [], names = [], tel = [];
      for (var i=0;i<8;i++){ s._atkTimer = 1; s._tel = 0; window.__lastBanner = null; updateBossAttack(s, null); kinds.push(s._telKind); names.push(bossTelName(s)); tel.push(s._tel); s._tel = 0; s._pf = null; }
      return { kinds: kinds, names: names, tel: tel, lens: [1,2,3].map(function(ph){ return ['swallow','pfaceRap','pfaceTorture','pfaceThanks','pfaceShoes'].map(function(k){ return bossTelLen({ attack:'swallow', _telKind:k, _phase:ph }); }); }) };
    })()`);
    expect(r.kinds).toEqual(['swallow', 'pfaceRap', 'swallow', 'pfaceTorture', 'swallow', 'pfaceThanks', 'swallow', 'pfaceShoes']);
    expect(r.names).toEqual(['AD BREAK!', 'FREESTYLE RAP!', 'AD BREAK!', 'TORTURE TIME!', 'AD BREAK!', 'THANK YOU FOR COMING!', 'AD BREAK!', 'TOTAL SLIP SHOES!']);
    expect(r.tel, 'the wind-up the engine set from the last turn is set again from this turn\'s own kind').toEqual([46, 72, 46, 66, 46, 44, 46, 42]);
    expect(r.lens).toEqual([[46, 72, 66, 44, 42], [42, 66, 60, 40, 38], [40, 60, 54, 36, 34]]);
  });
});

describe('AD BREAK!: a lunge you can dodge', () => {
  it('the wind-up fixes the lane -- from the far wall, across the floor, toward the side you are on -- and he pops there; nothing is swallowed yet', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      ${BEGIN('swallow')}
      var L = b._pf.lunge, out = { kind: b._telKind, tel: b._tel, L: { st: L.st, dir: L.dir, x0: L.x0, x1: L.x1, n: L.n }, bx: b.x, banner: document.getElementById('banner').textContent, wall: 88.4*0.9 + 2, WW: WW };
      for (var i=0;i<30;i++) step();
      out.stillThere = b.x; out.swallowed = f._swallow; out.faces = b.face;
      return out;
    })()`);
    expect(r.kind).toBe('swallow');
    expect(r.tel).toBe(46);
    expect(r.banner).toBe('AD BREAK!');
    expect(r.L).toMatchObject({ st: 'tell', dir: -1, n: 1 });
    expect(r.L.x0, 'he starts by the right wall').toBeCloseTo(r.WW - r.wall, 3);
    expect(r.L.x1, 'and the lane ends at the left wall').toBeCloseTo(r.wall, 3);
    expect(r.bx, 'he pops to the start of the lane').toBeCloseTo(r.WW - r.wall, 3);
    expect(r.stillThere, 'planted for the whole wind-up').toBeCloseTo(r.WW - r.wall, 3);
    expect(r.swallowed, 'nobody is grabbed from across the floor any more').toBe(0);
    expect(r.faces).toBe(-1);
  });

  it('then he runs the floor at 17 px a frame and swallows whoever his mouth reaches, into the same stomach: 10% a second, a 50-point tongue', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      ${BEGIN('swallow')}
      for (var i=0;i<60 && b._tel>0;i++) step();
      var x0 = b.x, xs = [];
      for (var j=0;j<120 && !(f._swallow>0);j++){ step(); f.x = 300; f.vx = 0; xs.push(b.x); }
      var caughtAt = b.x, L = b._pf.lunge;
      var out = { swallowed: f._swallow > 0, at: caughtAt, x0: x0, speed: xs.length > 2 ? xs[1] - xs[0] : 0, frames: xs.length, st: L && L.st, tongue: b._tongueHp, stomach: { x: STOMACH.x, y: STOMACH.y, r: STOMACH.r }, gy: groundY(),
                  fx: f.x, fy: f.y, swallow: f._swallow, sx: b._stX, sy: b._stY, tx: b._tongueX, ty: b._tongueY };
      var p0 = f.pct; for (var k=0;k<61;k++){ step(); f.invuln = 0; } out.acid = f.pct - p0;
      return out;
    })()`);
    expect(r.swallowed).toBe(true);
    expect(r.speed, 'a steady 17 px a frame in phase 1').toBeCloseTo(-17, 5);
    expect(r.at, 'caught with his mouth (out front of him) on the fighter').toBeGreaterThan(300 + 30);
    expect(r.at).toBeLessThan(300 + 88.4*0.85 + 46 + 24 + 20);
    expect(r.st, 'he chews for a moment, and the turn is over').toBe('gulp');
    expect(r.tongue).toBe(50);
    expect(r.stomach, 'the stomach opens where he caught you').toEqual({ x: r.at, y: r.gy - 140, r: 120 });
    expect([r.sx, r.sy], 'and a client is told where').toEqual([r.at, r.gy - 140]);
    expect([r.tx, r.ty], 'the tongue above its middle').toEqual([r.at, r.gy - 170]);
    expect(r.swallow, 'up to eight seconds').toBeGreaterThan(470);
    expect(r.acid, '10% a second in the stomach, as it was').toBeCloseTo(10, 5);
  });

  it('a fighter airborne as the mouth passes is not swallowed; nor is one on the platform; he runs on into the wall', () => {
    const r = W.eval(`(function(){ var out = {};
      [['air', 300, 140], ['platform', 550, null]].forEach(function(c){
        ${STAGE(300)}
        f.x = c[1]; var plat = worldPlats[0], y = c[2] != null ? groundY() - 24 - c[2] : plat.y - 24;
        f.y = y; f.vy = 0; f.onground = true;
        ${BEGIN('swallow')}
        // the fighter's side decides the lane: put him on the left half so he runs leftward from the right wall
        for (var i=0;i<60 && b._tel>0;i++){ step(); f.y = y; f.vy = 0; f.x = c[1]; }
        var minY = 1e9;
        for (var j=0;j<140 && b._pf.lunge && b._pf.lunge.st !== 'crash';j++){ step(); f.y = y; f.vy = 0; f.x = c[1]; f.vx = 0; f.invuln = 0; }
        out[c[0]] = { swallowed: f._swallow > 0, st: b._pf.lunge && b._pf.lunge.st, x: b.x, pct: f.pct };
      });
      return out;
    })()`);
    for (const k of ['air', 'platform']) {
      expect(r[k].swallowed, `${k}: not swallowed`).toBe(false);
      expect(r[k].st, `${k}: he ran the whole floor and hit the wall`).toBe('crash');
      expect(r[k].x, `${k}: at the wall`).toBeCloseTo(k === 'air' ? 88.4*0.9 + 2 : W.eval('WW') - 88.4*0.9 - 2, 3);
      expect(r[k].pct, `${k}: the lunge itself deals nothing`).toBe(0);
    }
  });

  it('a miss ends in the wall: heavy impact (a scar), a squeak, and he is stuck for 45 frames -- a real opening -- before the next turn', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      f.y = groundY() - 24 - 200; f.vy = 0;   // out of the way
      ${BEGIN('swallow')}
      for (var i=0;i<60 && b._tel>0;i++){ step(); f.y = groundY() - 224; f.vy = 0; f.x = 300; }
      var scars0 = IMPACT_SCARS.length, sh0 = shakeAmt, crashAt = null, stuck = 0, t0 = null;
      for (var j=0;j<200;j++){ step(); f.y = groundY() - 224; f.vy = 0; f.x = 300;
        var L = b._pf.lunge;
        if (L && L.st === 'crash'){ if (crashAt === null){ crashAt = j; } stuck++; }
        if (crashAt !== null && !(L && L.st === 'crash')){ t0 = j; break; } }
      var out = { crashAt: crashAt, stuck: stuck, scars: IMPACT_SCARS.length - scars0, x: b.x, timer: b._atkTimer, lunge: b._pf.lunge, debris: IMPACT_DEBRIS.length, rk: b._hz.rk, rs: b._hz.rs };
      var walls = IMPACT_SCARS.map(function(s){ return s.x; }); out.scarX = walls[walls.length - 1];
      return out;
    })()`);
    expect(r.crashAt).not.toBe(null);
    expect(r.stuck, 'stuck for 45 frames').toBe(45);
    expect(r.scars, 'the wall takes a scar').toBeGreaterThan(0);
    expect(r.scarX, 'at the wall he ran into').toBe(0);
    expect(r.debris).toBeGreaterThan(3);
    expect(r.lunge, 'and then the turn is over').toBe(null);
    expect(W.eval('(function(){ var s = ' + '{ _atkTimer:0, _phase:1 }' + '; pfaceLungeEnd(s); return s._atkTimer; })()'), 'and the next wind-up waits PFACE.after frames from the end of it').toBe(40);
    expect([r.rk, r.rs], 'the end shelf on that side rattles').toEqual([expect.any(Number), 1]);
  });

  it('phase 2: two lunges, the second back from the wall after a re-tell; phase 3: he comes in from off the screen, and both are faster', () => {
    const r = W.eval(`(function(){ var out = {};
      [2, 3].forEach(function(ph){
        ${STAGE(300)}
        b.hp = b.maxHp*(ph===2 ? 0.5 : 0.2); updateBossAttack(b, f); b._atkTimer = 1e9; b._quakeT = 0;
        f.y = groundY() - 224; f.vy = 0;
        ${BEGIN('swallow')}
        var L = b._pf.lunge, o = { n: L.n, dir0: L.dir, x0: L.x0, tel: b._tel, bx: b.x, ph: L.ph };
        var seen = [], spd = [], last = null, dirs = [];
        for (var i=0;i<600 && b._pf.lunge;i++){
          var px = b.x; step(); f.y = groundY() - 224; f.vy = 0; f.x = 300; f.vx = 0;
          var l = b._pf.lunge; if (!l) break;
          if (l.st !== last){ seen.push(l.st); dirs.push(l.dir); last = l.st; }
          if (l.st === 'run') spd.push(Math.abs(Math.round((b.x - px)*100)/100));
        }
        o.seen = seen; o.dirs = dirs; o.spd = spd;
        out[ph] = o;
      });
      return out;
    })()`);
    expect(r[2].n).toBe(2);
    expect(r[2].tel, 'a shade quicker wind-up').toBe(42);
    expect(r[2].seen, 'run, crash, the re-tell, run, crash').toEqual(['tell', 'run', 'crash', 'retell', 'run', 'crash']);
    expect(r[2].dirs, 'the second lunge goes back the way he came').toEqual([-1, -1, -1, 1, 1, 1]);
    expect(Math.max.apply(null, r[2].spd), 'phase 2 speed').toBe(19);
    expect(r[3].n).toBe(2);
    expect(Math.max.apply(null, r[3].spd), 'phase 3 speed').toBe(21);
    expect(r[3].bx, 'phase 3: he vanishes -- he is past the screen edge for the wind-up').toBeGreaterThan(W.eval('WW'));
    expect(r[3].tel).toBe(40);
  });
});

describe('FREESTYLE RAP!: a beat nothing can interrupt, from places that change', () => {
  // The owner, verbatim, 2026-10-01 (Round 17): "purple faces notes should be in varied areas." The notes used to roll out of his feet along the floor, the same
  // three pulses from the same place every time. Each pulse has its own spot now, chosen when the beat starts (pfacePlanRap): one pulse rides the platform, the
  // other two the floor, in any order, from spots across the stage -- the notes' count (six), damage (0.35, 0.35, 1) and attack id (one) are what they were, and
  // so are the speeds and the thirty-frame beat. The tests that pinned "they roll along the floor from his feet" are rewritten for it.
  const rnd0 = `var rnd = (function(seed){ var a = seed >>> 0; return function(){ a |= 0; a = (a + 0x6d2b79f5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })`;
  // the plan, forced (a wind-up has chosen its own: a test that wants a particular one sets it before the beat drops)
  const PLAN = (arr) => `b._pf.rap.p = ${JSON.stringify(arr.map(([row, x]) => ({ row, x })))};`;
  // watch a rap from the frame it fires: every note, the frame it first MOVES (a floor note waits out its delay; a platform pulse is made when its turn comes)
  const WATCH = (frames, hold) => `(function(){ var notes = [], seen = [], gy = groundY(), L = pfaceLedge(), t = 0;
    var look = function(){ projectiles.forEach(function(p){ if (!p.pfaceNote || seen.indexOf(p) >= 0) return; if (!(p.pfaceLedge || p.delay <= 0)) return; seen.push(p);
      notes.push({ at: t, pulse: p.pfaceNote, row: p.pfaceLedge ? 'ledge' : (p.y < gy - 120 ? 'air' : 'floor'), x: p.x, y: p.y, vx: p.vx, r: p.r, shape: p.shape, id: p.bossAtk, dmg: +(p.dmg/bossDmg()).toFixed(2) }); }); };
    look();
    for (var j=0;j<${frames};j++){ step(); t++; ${hold || ''} look(); }
    return { notes: notes, gy: gy, L: L }; })()`;

  it('he plants at centre for a 72-frame intro, then the beat drops: three pulses, thirty frames apart, the third the big one, two notes each, six in all on one attack id', () => {
    const r = W.eval(`(function(){ ${STAGE(200)}
      ${BEGIN('pfaceRap')}
      ${PLAN([['floor', 700], ['ledge', 520], ['floor', 250]])}
      var out = { kind: b._telKind, tel: b._tel, bx: b.x, banner: document.getElementById('banner').textContent, shotsDuring: 0, WW: WW };
      for (var i=0;i<80 && b._tel>1;i++){ step(); f.x = 200; f.vx = 0; out.shotsDuring += projectiles.filter(function(p){ return p.owner===-2; }).length; }
      f.invuln = 1e9; step();   // the frame it fires
      out.gap = b._atkTimer; out.full = bossDmg();
      var w = ${WATCH(140, 'f.x = 200; f.vx = 0; f.y = gy - 24; f.vy = 0; f.invuln = 1e9;')}; out.w = w;
      return out;
    })()`);
    expect(r.kind).toBe('pfaceRap');
    expect(r.tel, 'the intro: 72 frames').toBe(72);
    expect(r.banner).toBe('FREESTYLE RAP!');
    expect(r.bx, 'planted at centre').toBe(550);
    expect(r.shotsDuring, 'nothing flies during the intro').toBe(0);
    const n = r.w.notes;
    expect(n, 'three pulses, two ways each: six notes').toHaveLength(6);
    expect(n.filter((q) => q.shape === 'pfacenote')).toHaveLength(4);
    expect(n.filter((q) => q.shape === 'pfacestar'), 'the big one wears the pointy star').toHaveLength(2);
    // when each pulse starts to move: 0, 30, 60 frames after the beat dropped (a platform pulse is made on its turn, so it can be a frame off)
    const starts = [1, 2, 3].map((p) => Math.min(...n.filter((q) => q.pulse === p).map((q) => q.at)));
    expect(starts[0]).toBeLessThanOrEqual(1);
    expect(starts[1], 'thirty frames apart').toBeGreaterThanOrEqual(29); expect(starts[1]).toBeLessThanOrEqual(31);
    expect(starts[2]).toBeGreaterThanOrEqual(59); expect(starts[2]).toBeLessThanOrEqual(61);
    expect(W.eval('PFACE.rap.delays[1]'), 'the table: thirty frames apart').toEqual([0, 30, 60]);
    expect(n.filter((q) => q.vx > 0)).toHaveLength(3);
    expect(n.filter((q) => q.vx < 0)).toHaveLength(3);
    expect(Math.abs(n[0].vx), 'phase 1 speed').toBe(8);
    expect(Math.max(...n.map((q) => q.r)), 'the third is the big one').toBe(26);
    expect(new Set(n.map((q) => q.id)).size, 'one attack id: the whole rap is one boss hit').toBe(1);
    expect(n.map((q) => q.dmg).sort((a, b) => a - b)).toEqual([0.35, 0.35, 0.35, 0.35, 1, 1]);
    // the planned places: pulse 1 on the floor from 700, pulse 2 on the platform from 520, pulse 3 on the floor from 250 -- each note one `off` out from its spot
    const off = W.eval('PFACE.rap.off');
    for (const q of n) {
      const plan = [['floor', 700], ['ledge', 520], ['floor', 250]][q.pulse - 1];
      expect(q.row, `pulse ${q.pulse}'s row`).toBe(plan[0]);
      expect(Math.abs(q.x - (plan[1] + Math.sign(q.vx) * off)), `pulse ${q.pulse}'s note starts ${off} px either side of its spot (it has moved a frame by the time it is seen)`).toBeLessThanOrEqual(Math.abs(q.vx) * 2);
      expect(q.y, `pulse ${q.pulse} rides its row`).toBe(plan[0] === 'floor' ? r.w.gy - q.r : r.w.L.y - q.r);
    }
    // PFACE.gaps[1] (116) times BOSS_PACE (1.2): "bosses should attack a bit slower" (the owner, 2026-09-30)
    expect(r.gap, 'the next turn is timed from the fire').toBe(139);
  });

  it('"2 should be uninterruptable.": hit him as hard as you like during the intro, and the beat still drops -- all three pulses, every time', () => {
    const r = W.eval(`(function(){ ${STAGE(200)}
      ${BEGIN('pfaceRap')}
      var hp0 = b.hp, hits = 0;
      for (var i=0;i<80 && b._tel>1;i++){ step(); f.x = 200; f.vx = 0; if (i % 6 === 0){ damageSummons(f, b.x, b.y, 200, 5); hits++; f.invuln = 0; } }
      var telAt = b._tel, kind = b._telKind, hpMid = b.hp;
      f.invuln = 1e9; step();
      var out = { hits: hits, hpLost: hp0 - b.hp, kind: kind, telAt: telAt, flung: b.x, banner: document.getElementById('banner').textContent };
      out.w = ${WATCH(130, 'f.x = 200; f.vx = 0; f.y = groundY() - 24; f.vy = 0; f.invuln = 1e9;')};
      // ...and the same when the hits land while he is winding up in phase 3, with the tongue and everything else in play
      ${STAGE(200)}
      b.hp = b.maxHp*0.32; updateBossAttack(b, f); b._atkTimer = 1e9; b._hz = { st:0, n:1e9, k:0, c:0, sd:0 };
      ${BEGIN('pfaceRap')}
      var hp3 = b.hp;
      for (var j=0;j<70 && b._tel>1;j++){ step(); f.x = 200; f.vx = 0; if (j % 5 === 0) damageSummons(f, b.x, b.y, 200, 2); f.invuln = 0; }
      out.p3hits = hp3 - b.hp; f.invuln = 1e9; step();
      out.p3 = ${WATCH(100, 'f.x = 200; f.vx = 0; f.y = groundY() - 24; f.vy = 0; f.invuln = 1e9;')}.notes.length; out.p3kind = b._telKind;
      return out;
    })()`);
    expect(r.hpLost, 'the hits landed').toBeGreaterThan(30);
    expect(r.kind, 'and he is still rapping').toBe('pfaceRap');
    expect(r.w.notes.length, 'the beat dropped: all three pulses, six notes').toBe(6);
    expect(Math.abs(r.flung - 550), 'nobody flings him off the screen mid-rap (his canon weakness is not taken): a hit shoves him a couple of px, no more').toBeLessThan(40);
    expect(r.p3hits, 'phase 3: the hits landed').toBeGreaterThan(10);
    expect(r.p3, 'phase 3 the same').toBe(6);
  });

  it('a floor note hits whoever is on the floor in its way and a jump clears it; a note on the platform hits only whoever STANDS on the platform; a fighter on the other row is untouched, and the whole rap costs at most one boss hit', () => {
    const run = (x, onPlat, plan, jump, ph) => W.eval(`(function(){ ${STAGE(x)}
      var gy = groundY(), L = pfaceLedge();
      ${ph > 1 ? `b.hp = b.maxHp*${ph === 2 ? 0.5 : 0.2}; updateBossAttack(b, f); b._atkTimer = 1e9; b._hz = { st:0, n:1e9, k:0, c:0, sd:0 };` : ''}
      ${BEGIN('pfaceRap')}
      ${PLAN(plan)}
      var y = ${onPlat ? 'L.y - 24' : 'groundY() - 24'}; f.x = ${x}; f.y = y; f.vx = 0; f.vy = 0; f.onground = true;
      var hits = 0, last = 0, lows = 0;
      for (var i=0;i<75 && b._tel>0;i++){ step(); f.x = ${x}; f.vx = 0; f.y = y; f.vy = 0; f.onground = true; f.invuln = 0; }
      b._atkTimer = 1e9;
      for (var j=0;j<260;j++){ step(); f.x = ${x}; f.vx = 0; f.y = ${jump ? 'y - 70' : 'y'}; f.vy = 0; f.onground = ${jump ? 'false' : 'true'}; if (f.pct > last + 0.001){ hits++; last = f.pct; } f.invuln = 0; }
      return { pct: f.pct, hits: hits, cap: bossDmg() }; })()`);
    const floorPlan = [['floor', 700], ['floor', 250], ['floor', 950]], ledgePlan = [['ledge', 420], ['ledge', 680], ['ledge', 560]];
    const standing = run(100, false, floorPlan, false, 1);
    expect(standing.hits, 'the floor is dangerous to someone standing on it').toBeGreaterThan(0);
    expect(standing.pct, 'a fighter who takes every pulse still takes one boss hit at most').toBeLessThanOrEqual(standing.cap + 1e-6);
    expect(run(100, false, floorPlan, true, 1).pct, 'a jump clears the floor notes').toBe(0);
    expect(run(560, true, floorPlan, false, 1).pct, 'a fighter standing on the platform is not touched by notes that ride the floor').toBe(0);
    expect(run(560, true, ledgePlan, false, 1).hits, 'a note on the platform hits whoever stands on it').toBeGreaterThan(0);
    expect(run(560, true, ledgePlan, true, 1).pct, 'and a jump clears it').toBe(0);
    expect(run(560, false, ledgePlan, false, 1).pct, 'a fighter on the floor under the platform is not touched by the notes above him, jumping or not').toBe(0);
    expect(run(560, false, ledgePlan, true, 1).pct).toBe(0);
    // phase 2 and 3: quicker notes, and the third pulse late (off the beat) in phase 2
    const p2 = W.eval(`(function(){ ${STAGE(200)} b.hp = b.maxHp*0.5; updateBossAttack(b, f); b._atkTimer = 1e9; b._hz = { st:0, n:1e9, k:0, c:0, sd:0 };
      ${BEGIN('pfaceRap')} ${PLAN([['floor', 700], ['floor', 250], ['floor', 950]])}
      for (var i=0;i<70 && b._tel>1;i++){ step(); f.x = 200; }
      f.invuln = 1e9; step(); var w = ${WATCH(130, 'f.x = 200; f.vx = 0; f.invuln = 1e9;')};
      return { starts: [1,2,3].map(function(p){ return Math.min.apply(null, w.notes.filter(function(q){ return q.pulse === p; }).map(function(q){ return q.at; })); }), spd: Math.abs(w.notes[0].vx) }; })()`);
    expect(p2.starts[2], 'the third comes late in phase 2: off the beat').toBeGreaterThanOrEqual(71);
    expect(p2.starts[2]).toBeLessThanOrEqual(73);
    expect(W.eval('PFACE.rap.delays[2]')).toEqual([0, 30, 72]);
    expect(p2.spd, 'and quicker').toBe(9.5);
  });

  it('an air note flies across the whole stage at its height and hurts only whoever is up there: a fighter on the floor or on the platform is untouched, so is one at the top of a jump from the floor, and one hovering at its height is hit', () => {
    // "for freestyle rap, they shouldnt just be on the ground." (the owner, 2026-10-01): the third row, in the air, above anyone standing and above a jump from the floor
    const run = (place) => W.eval(`(function(){ ${STAGE(560)} var gy = groundY(), L = pfaceLedge(), air = ${JSON.stringify(place)};
      ${BEGIN('pfaceRap')} b._pf.rap.p = [{ row:'air', x:300, h:260 }, { row:'air', x:800, h:260 }, { row:'air', x:550, h:260 }];
      var yAt = { floor: gy - 24, plat: L.y - 24, apex: gy - 24 - 126, hover: gy - 260 }[air], ground = air === 'floor' || air === 'plat';
      var pin = function(){ f.x = 560; f.vx = 0; f.y = yAt; f.vy = 0; f.onground = ground; };
      pin(); for (var i=0;i<75 && b._tel>1;i++){ step(); pin(); f.invuln = 0; }
      b._atkTimer = 1e9; var hits = 0, last = 0, notes = 0;
      for (var j=0;j<200;j++){ step(); pin(); notes = Math.max(notes, projectiles.filter(function(p){ return p.pfaceNote && !p.pfaceLedge && p.y < gy - 200; }).length); if (f.pct > last + 0.001){ hits++; last = f.pct; } f.invuln = 0; }
      return { pct: f.pct, hits: hits, notes: notes, cap: bossDmg(), y: gy - 260 }; })()`);
    const floor = run('floor'), plat = run('plat'), apex = run('apex'), hover = run('hover');
    expect(floor.notes, 'the air notes are there, flying high').toBeGreaterThanOrEqual(4);
    expect(floor.pct, 'a fighter standing on the floor never feels them').toBe(0);
    expect(plat.pct, 'nor one standing on the platform').toBe(0);
    expect(apex.pct, 'nor one at the very top of a jump from the floor').toBe(0);
    expect(hover.hits, 'one up in the air where they fly is hit').toBeGreaterThanOrEqual(1);
    expect(hover.pct, 'for a note\'s share of one boss hit, and the whole rap is still one boss hit at most').toBeLessThanOrEqual(hover.cap + 1e-6);
    expect(hover.pct).toBeGreaterThan(0);
  });

  it('the places vary: from one use to the next, and across a volley -- three spots a use, on the floor, the platform and in the air, in any order, apart from each other, off the walls, across the stage', () => {
    // "purple faces notes should be in varied areas." and "for freestyle rap, they shouldnt just be on the ground." (the owner, 2026-10-01)
    const r = W.eval(`(function(){ ${STAGE(300)} var gy = groundY(), L = pfaceLedge(), uses = [], at = { ledge: {}, air: {} };
      for (var i=0;i<90;i++){ var p = pfacePlanRap(b, 1); uses.push(p.map(function(q){ return [q.row, q.x, q.h || 0]; }));
        p.forEach(function(q, k){ if (q.row !== 'floor') at[q.row][k] = 1; }); }
      // the same dice give the same plan (the tests seed them; the game's bosses use Math.random)
      ${rnd0}; var a1 = JSON.stringify(pfacePlanRap(b, 1, rnd(9))), a2 = JSON.stringify(pfacePlanRap(b, 1, rnd(9))), a3 = JSON.stringify(pfacePlanRap(b, 1, rnd(10)));
      // with no platform on the stage there is no platform pulse: two on the floor and one in the air
      var keep = worldPlats; worldPlats = []; var none = []; for (var j=0;j<20;j++) none.push(pfacePlanRap(b, 1).map(function(q){ return q.row; }).sort().join('+')); worldPlats = keep;
      return { uses: uses, ledgeAt: Object.keys(at.ledge).sort(), airAt: Object.keys(at.air).sort(), L: L, same: a1 === a2, other: a1 !== a3, WW: WW, R: PFACE.rap, none: none }; })()`);
    const R = r.R, mixes = new Set(['floor+floor+ledge', 'air+floor+floor', 'air+floor+ledge']);
    const seen = new Set();
    for (const u of r.uses) {
      const mix = u.map((q) => q[0]).sort().join('+');
      expect(mixes.has(mix), `a mix a use may have: ${mix}`).toBe(true);
      seen.add(mix);
      expect(u.some((q) => q[0] === 'floor'), 'always a floor pulse').toBe(true);
      expect(u.some((q) => q[0] !== 'floor'), 'and always another height').toBe(true);
      for (const [row, x, h] of u) {
        if (row === 'floor') { expect(x).toBeGreaterThanOrEqual(R.margin); expect(x, 'off the walls').toBeLessThanOrEqual(r.WW - R.margin); }
        else if (row === 'ledge') { expect(x, 'on the platform').toBeGreaterThanOrEqual(r.L.x0 + R.ledgeMargin); expect(x).toBeLessThanOrEqual(r.L.x1 - R.ledgeMargin); }
        else { expect(x).toBeGreaterThanOrEqual(R.margin); expect(x).toBeLessThanOrEqual(r.WW - R.margin); expect(h, 'an air pulse flies at a height of its own').toBeGreaterThanOrEqual(R.air[0]); expect(h).toBeLessThanOrEqual(R.air[1]); }
      }
    }
    expect([...seen].sort(), 'all three mixes come up').toEqual([...mixes].sort());
    expect(r.uses.filter((u) => { const xs = u.map((q) => q[1]); return xs.every((x, i) => xs.every((y, j) => i === j || Math.abs(x - y) >= R.sep)); }).length, 'the spots of a volley keep their distance (all but the rare use that could not find room)').toBeGreaterThanOrEqual(86);
    const key = (u) => JSON.stringify(u);
    expect(new Set(r.uses.map(key)).size, 'a new plan almost every use').toBeGreaterThanOrEqual(85);
    expect(r.ledgeAt, 'the platform pulse can be the first, the second or the third').toEqual(['0', '1', '2']);
    expect(r.airAt, 'and so can the air one').toEqual(['0', '1', '2']);
    const floorXs = r.uses.flatMap((u) => u.filter((q) => q[0] === 'floor').map((q) => q[1]));
    expect(Math.min(...floorXs), 'the floor spots reach the left of the stage').toBeLessThan(260);
    expect(Math.max(...floorXs), 'and the right').toBeGreaterThan(r.WW - 260);
    expect(new Set(floorXs.map((x) => Math.floor(x/100))).size, 'across the whole width, not a few favourite places').toBeGreaterThanOrEqual(7);
    const heights = r.uses.flatMap((u) => u.filter((q) => q[0] === 'air').map((q) => q[2]));
    expect(new Set(heights).size, 'the air pulses fly at many different heights').toBeGreaterThanOrEqual(25);
    expect(Math.max(...heights) - Math.min(...heights), 'from low to high in the range').toBeGreaterThanOrEqual(40);
    expect(r.same, 'seeded dice give the same plan twice').toBe(true);
    expect(r.other, 'and other dice another').toBe(true);
    expect(new Set(r.none), 'no platform, no platform pulse').toEqual(new Set(['air+floor+floor']));
  });

  it('a use really draws its own plan: three beats in a row start with three different plans, fixed when the wind-up starts and the same all the way to the last note', () => {
    const r = W.eval(`(function(){ ${STAGE(300)} var plans = [], notesAt = [];
      for (var k=0;k<3;k++){
        b._pf = null; ${BEGIN('pfaceRap')}
        var plan0 = JSON.stringify(b._pf.rap.p), t0 = b._tel;
        for (var i=0;i<80 && b._tel>1;i++){ step(); f.x = 300; f.invuln = 1e9; }
        var plan1 = JSON.stringify(b._pf.rap.p); step();
        var w = ${WATCH(100, 'f.x = 300; f.invuln = 1e9;')};
        plans.push({ same: plan0 === plan1, t0: t0, notes: w.notes.map(function(q){ return [q.pulse, q.row, Math.round(q.x - Math.sign(q.vx)*PFACE.rap.off)]; }).sort(), plan: JSON.parse(plan0) });
        b._tel = 0; projectiles = []; b._atkTimer = 1e9;
      }
      return plans; })()`);
    expect(new Set(r.map((p) => JSON.stringify(p.plan))).size, 'three uses, three plans').toBe(3);
    for (const p of r) {
      expect(p.same, 'fixed at the wind-up\'s start').toBe(true);
      expect(p.t0).toBe(72);
      // every note came from a spot of the plan (the platform's notes are made a frame later than their turn and have moved a little: within two frames of travel)
      for (const [pulse, row, x] of p.notes) expect(Math.abs(x - p.plan[pulse - 1].x), `pulse ${pulse} came from its spot`).toBeLessThanOrEqual(20);
    }
  });

  it('each note shows where it will be before it can hurt: the three lanes are in the view from the first frame of the intro -- row, spot, and the beat\'s clock -- a client gets them too, and they are drawn', () => {
    const r = W.eval(`(function(){ ${STAGE(300)} ${BEGIN('pfaceRap')}
      var out = { tel: b._tel, kind: b._telKind, view: JSON.parse(JSON.stringify(pfaceView(b))), plan: JSON.parse(JSON.stringify(b._pf.rap.p)), L: pfaceLedge(), len: PFACE.tel.pfaceRap };
      var snap = JSON.parse(JSON.stringify(pfaceNet(b)));
      out.net = snap; return out; })()`);
    expect(r.kind).toBe('pfaceRap');
    expect(r.tel, 'the whole intro to read it in').toBe(72);
    expect(r.len.slice(1).every((t) => t >= 36), 'in every phase the intro is at least the usual 36 frames').toBe(true);
    expect(r.view.rap.k, 'not dropped yet').toBe(-1);
    expect(r.view.rap.p, 'the row (0 the floor, 1 the platform, 2 the air), the spot and the height of each pulse, as planned').toEqual(r.plan.map((q) => [q.row === 'ledge' ? 1 : (q.row === 'air' ? 2 : 0), q.x, q.h || 0]));
    expect(r.view.rap.l, 'and the platform they ride').toEqual([r.L.x0, r.L.x1, r.L.y]);
    expect(r.net.rap, 'a netcode client gets the same').toEqual(r.view.rap);
    // drawn: the lanes' bands on the recording canvas, over the floor and on the platform's top, with no text
    const { w, log } = bootRecording();
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow(); running=false; BOSS_ARENA = 'warehouse';`);
    const gy = w.eval('groundY()'), L = w.eval('pfaceLedge()'), WWp = w.eval('WW');
    const bands = (rap, tel) => { w.eval(`(function(){ var gy = groundY(); summons = [{ type:'boss', name:'Purple Face', attack:'swallow', sprite:'face', r:88, x:550, y:gy-88, face:1, hp:100, maxHp:235, _phase:1, flash:0, _bossRush:true, _tel:${tel}, _telKind:'pfaceRap', _pf:{ rap:${JSON.stringify(rap)} } }]; })()`);
      log.length = 0; w.eval('pfaceDrawFx(summons[0])'); w.eval('summons = []');
      return log.filter((e) => e.op === 'fillRect' && e.args[3] === 44).map((e) => [Math.round(e.args[0]), Math.round(e.args[1] + 44), Math.round(e.args[2])]); };
    const rap = { p: [[0, 300, 0], [1, 520, 0], [0, 900, 0]], k: -1, ph: 1, l: [L.x0, L.x1, L.y] };
    const b0 = bands(rap, 72);
    expect(b0, 'at the first frame of the intro: a floor lane, a platform lane and a second floor lane').toEqual([[0, Math.round(gy), WWp], [L.x0, L.y, L.x1 - L.x0], [0, Math.round(gy), WWp]]);
    expect(bands({ ...rap, k: 40 }, 0).length, 'forty frames after the beat dropped: the first lane is fading (it fades for 60 frames) and the other two are lit or about to be').toBe(3);
    expect(bands({ ...rap, k: 200 }, 0), 'long after the last pulse: the lanes are gone').toEqual([]);
    // an air lane is a band at the height its notes fly, the whole width of the stage
    expect(bands({ ...rap, p: [[0, 300, 0], [2, 520, 260], [0, 900, 0]] }, 72), 'an air pulse: a band 260 px up').toEqual([[0, Math.round(gy), WWp], [0, Math.round(gy - 260 + 22), WWp], [0, Math.round(gy), WWp]]);
    expect(log.filter((e) => ['fillText', 'strokeText'].includes(e.op)), 'no words').toEqual([]);
    w.eval('BOSS_ARENA = null');
  });

  it('there is always a gap: a fighter who reads the lanes -- stands in a pocket or well clear of where the notes appear, then jumps each note that comes -- is never hit, on the floor or on the platform, in any phase, across many plans', () => {
    const sim = (fx, onPlat, ph, seed) => W.eval(`(function(){ ${STAGE(fx)} var gy = groundY(), L = pfaceLedge(), JUMP_V = -12.5;
      ${ph > 1 ? `b.hp = b.maxHp*${ph === 2 ? 0.5 : 0.2}; updateBossAttack(b, f); b._atkTimer = 1e9; b._hz = { st:0, n:1e9, k:0, c:0, sd:0 };` : ''}
      ${rnd0}; var r0 = rnd(${seed}); var saved = Math.random; Math.random = r0;
      ${BEGIN('pfaceRap')}
      Math.random = saved;
      var onP = ${onPlat}, fx = ${fx}; f.y = onP ? L.y - 24 : gy - 24; f.onground = true;
      var spots = [], origins = [];
      b._pf.rap.p.forEach(function(q){ if ((q.row === 'ledge') === !!onP){ origins.push(q.x); spots.push(q.x - PFACE.rap.off); spots.push(q.x + PFACE.rap.off); } });
      var lo = onP ? L.x0 + 20 : 40, hi = onP ? L.x1 - 20 : WW - 40;
      var okX = function(x){ return spots.every(function(sx){ return Math.abs(x - sx) >= 140; }) || origins.some(function(o){ return Math.abs(x - o) <= 30; }); };
      var bestX = fx; if (!okX(fx)){ for (var d=4; d<900; d+=4){ if (fx + d <= hi && okX(fx + d)){ bestX = fx + d; break; } if (fx - d >= lo && okX(fx - d)){ bestX = fx - d; break; } } }
      var step0 = Math.abs(bestX - fx); fx = bestX; f.x = fx;
      var hit = null, jumps = 0;
      for (var i=0;i<330;i++){
        b._atkTimer = 1e9; var need = 0;
        if (b._tel <= 0 && !b._pf.rap && !projectiles.some(function(p){ return p.pfaceNote; })) break;   // the rap is over: its last note has left
        projectiles.forEach(function(p){
          if (!p.pfaceNote || !(p.life > 0) || (!!p.pfaceLedge) !== !!onP || (!p.pfaceLedge && (p.delay > 0 || p.y < gy - 120)) || (f.x - p.x)*p.vx <= 0) return;   // (an air note is not his business: he keeps his feet down)
          var t = (Math.abs(f.x - p.x) - (p.r + 22))/Math.abs(p.vx); if (t >= 0 && t <= 12) need = 1; });
        if (need && f.onground){ f.vy = JUMP_V; f.onground = false; jumps++; }
        var pct0 = f.pct; step(); f.x = fx; f.vx = 0; if (f.pct > pct0 + 1e-6 && hit === null) hit = i; }
      return { hit: hit, jumps: jumps, plan: b._pf.rap ? 1 : 0, step: step0 }; })()`);
    let n = 0, hits = 0, maxStep = 0, jumped = 0;
    // (twelve fights of about 300 frames: three phases, two plans each -- seeded, so the same plans every run -- a fighter on the floor and one on the platform)
    for (const ph of [1, 2, 3]) for (let seed = 1; seed <= 2; seed++) for (const [x, plat] of [[300, false], [560, true]]) {
      const o = sim(x, plat, ph, seed * 11 + ph); n++; if (o.hit !== null) hits++; maxStep = Math.max(maxStep, o.step); if (o.jumps > 0) jumped++;
    }
    expect(hits, `${n} runs, nobody who read the lanes was hit`).toBe(0);
    expect(maxStep, 'and the step out of the way was never more than the 72-frame intro allows at a run').toBeLessThanOrEqual(6 * 72);
    expect(jumped, 'and the notes did come: a third of the runs or more needed a jump').toBeGreaterThanOrEqual(n/3);
  });
});

describe('TORTURE TIME!: the tank', () => {
  it('the panes slide in round your spot and lock after 24 frames; nobody inside can leave, nobody outside can walk in; then it bursts for one boss hit', () => {
    const r = W.eval(`(function(){ ${STAGE(400)}
      ${BEGIN('pfaceTorture')}
      var TK = b._pf.tk[0], out = { kind: b._telKind, tel: b._tel, x: TK.x, n: b._pf.tk.length, close: TK.close, bx: b.x, banner: document.getElementById('banner').textContent };
      for (var i=0;i<30;i++){ step(); f.x = 400; f.vx = 0; }   // stay put through the closing
      out.age = TK.age; out.inside = f._pfIn === TK.id;
      // try to walk out: the glass holds you in
      f.vx = 12; for (var j=0;j<10;j++){ step(); f.vx = 12; } out.walkedTo = f.x; out.hw = 100;
      // a second fighter outside cannot walk in
      var g = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 400 + 320, groundY()-24, 0); g.team = 0; g.controller = 'still'; g.stocks = 9; fighters.push(g);
      for (var k=0;k<20;k++){ g.x -= 15; g.vx = -15; step(); }
      out.outsideAt = g.x; out.outsideDx = g.x - TK.x;
      // the burst
      f.x = 400; f.pct = 0; f.invuln = 0; g.pct = 0; g.invuln = 0;
      var before = projectiles.length;
      while (b._tel > 1){ step(); f.x = 400; f.vx = 0; f.invuln = 0; g.invuln = 0; if (g.x < TK.x + 100 + 24) g.x = TK.x + 100 + 24 + 5; }
      var pctBefore = f.pct; step();
      out.burst = f.pct - pctBefore; out.full = bossDmg(); out.tankGone = !b._pf.tk; out.freed = f._pfIn == null;
      out.bugs = projectiles.filter(function(p){ return p.shape === 'pfacebug'; }).length; out.scars = IMPACT_SCARS.length;
      return out;
    })()`);
    expect(r.kind).toBe('pfaceTorture');
    expect(r.tel, 'the wind-up is the tank closing: 66 frames').toBe(66);
    expect(r.banner).toBe('TORTURE TIME!');
    expect(r.x, 'over your spot').toBe(400);
    expect(r.n).toBe(1);
    expect(r.close, 'the panes take 24 frames in phase 1').toBe(24);
    expect(r.bx, 'he hosts from the far side').toBeGreaterThan(900);
    expect(r.age).toBeGreaterThanOrEqual(24);
    expect(r.inside, 'you were inside when it shut').toBe(true);
    expect(Math.abs(r.walkedTo - 400), 'the glass holds you in').toBeLessThan(r.hw);
    expect(r.outsideDx, 'and keeps everyone else out').toBeGreaterThanOrEqual(r.hw + 14);
    expect(r.burst, 'the burst is one whole boss hit').toBeCloseTo(r.full, 5);
    expect(r.tankGone).toBe(true);
    expect(r.freed).toBe(true);
    expect(r.bugs, 'and throws its bugs').toBe(18);
    expect(r.scars).toBeGreaterThan(0);
  });

  it('you can leave in the first 24 frames and then the burst misses you; phase 2 closes in 18 and phase 3 has a second tank', () => {
    const r = W.eval(`(function(){ var out = {};
      ${STAGE(400)}
      ${BEGIN('pfaceTorture')}
      var TK = b._pf.tk[0];
      for (var i=0;i<24;i++){ step(); f.x += 8; f.vx = 8; f.y = groundY() - 24; }   // straight out of it: 24 frames at 8 px
      var x = f.x;
      for (var j=0;j<70 && b._tel>0;j++){ step(); f.invuln = 0; }
      out.out = { x: x - TK.x, inside: f._pfIn === TK.id, pct: f.pct, bugsInFlight: projectiles.filter(function(p){ return p.shape === 'pfacebug'; }).length };
      [2, 3].forEach(function(ph){
        ${STAGE(400)}
        b.hp = b.maxHp*(ph===2 ? 0.5 : 0.2); updateBossAttack(b, f); b._atkTimer = 1e9; b._hz = { st:0, n:1e9, k:0, c:0, sd:0 };
        f.vx = 5; ${BEGIN('pfaceTorture')}
        out[ph] = { close: b._pf.tk[0].close, tanks: b._pf.tk.map(function(t){ return Math.round(t.x); }), tel: b._tel, hw: 100 };
      });
      return out;
    })()`);
    expect(r.out.x, 'you were clear of the glass').toBeGreaterThan(100 + 24);
    expect(r.out.inside).toBe(false);
    expect(r.out.pct, 'the burst missed you (the bugs are its spray)').toBeLessThan(22);
    expect(r[2].close).toBe(18);
    expect(r[2].tanks).toHaveLength(1);
    expect(r[3].tanks, 'a second tank where you would run').toHaveLength(2);
    expect(Math.abs(r[3].tanks[1] - r[3].tanks[0]), 'not on top of the first').toBeGreaterThanOrEqual(200);
    expect([r[2].tel, r[3].tel]).toEqual([60, 54]);
  });
});

describe('THANK YOU FOR COMING!: the kick', () => {
  it('a ring shows where he will pop up beside you; he pops in 20 frames before the kick, grows a leg, and kicks you toward the wall; two totems roll out, one boss hit in all', () => {
    const r = W.eval(`(function(){ ${STAGE(700)}
      ${BEGIN('pfaceThanks')}
      var ring = b._pf.ring, out = { kind: b._telKind, tel: b._tel, ring: ring.x, ringDir: ring.dir, bx0: b.x, banner: document.getElementById('banner').textContent };
      var popped = null, kickAt = null, hitAt = null, seenTotems = null, pct0 = f.pct;
      for (var i=0;i<60;i++){
        step();
        if (hitAt === null && f.pct > pct0){ hitAt = { pct: f.pct - pct0, vx: f.vx }; }
        f.x = 700; f.vx = 0; f.y = groundY() - 24; f.vy = 0;
        if (popped === null && Math.abs(b.x - ring.x) < 1 && b._tel < 40) popped = b._tel;
        if (kickAt === null && b._pf.kick) kickAt = { tel: b._tel, dir: b._pf.kick.dir };
        if (b._tel === 0 && seenTotems === null){ seenTotems = projectiles.filter(function(p){ return p.shape === 'pfacetotem' || p.shape === 'pfacetotemw'; }).map(function(p){ return [p.shape, p.vx, p.r, p.bossAtk]; }); }
      }
      out.popped = popped; out.kickAt = kickAt; out.hitAt = hitAt; out.totems = seenTotems; out.total = f.pct - pct0; out.full = bossDmg(); out.bx = b.x; out.kickId = null;
      return out;
    })()`);
    expect(r.kind).toBe('pfaceThanks');
    expect(r.tel).toBe(44);
    expect(r.banner).toBe('THANK YOU FOR COMING!');
    expect(r.ring, 'beside you, on the side toward the middle').toBe(700 - 170);
    expect(r.popped, 'he pops in when 20 frames of wind-up are left (seen a frame later: 19)').toBe(19);
    expect(r.bx).toBeCloseTo(r.ring, 3);
    expect(r.kickAt, 'and kicks toward you').toMatchObject({ dir: 1 });
    expect(r.hitAt, 'the kick lands').not.toBe(null);
    expect(r.hitAt.pct, '0.7 of a boss hit').toBeCloseTo(r.full*0.7, 5);
    expect(r.hitAt.vx, 'toward the wall behind you').toBeGreaterThan(5);
    expect(r.totems, 'a black one and a white one, out to both walls').toHaveLength(2);
    expect(r.totems.map((t) => t[0]).sort()).toEqual(['pfacetotem', 'pfacetotemw']);
    expect(r.totems.map((t) => t[1]).sort((a, b) => a - b)).toEqual([-7, 7]);
    expect(new Set(r.totems.map((t) => t[3])).size).toBe(1);
    expect(r.total, 'the kick and the totems together are still one boss hit at most').toBeLessThanOrEqual(r.full + 1e-6);
  });

  it('the kick is low and short: a jump clears it, and so does standing back; the totems are jumped too; phase 3 rolls out a second pair', () => {
    const r = W.eval(`(function(){ var out = {};
      [['jump', 700, 130, 700], ['far', 700, 0, 1010]].forEach(function(c){
        ${STAGE(700)}
        f.x = c[1]; ${BEGIN('pfaceThanks')}
        var ring = b._pf.ring.x, py = groundY() - 24 - c[2];
        for (var i=0;i<52;i++){ step(); f.x = c[3]; f.vx = 0; f.y = py; f.vy = 0; f.invuln = 0; }
        out[c[0]] = { pct: f.pct, ring: ring };
      });
      ${STAGE(700)}
      b.hp = b.maxHp*0.2; updateBossAttack(b, f); b._atkTimer = 1e9; b._hz = { st:0, n:1e9, k:0, c:0, sd:0 };
      f.y = groundY() - 224; ${BEGIN('pfaceThanks')}
      for (var i=0;i<60 && b._tel>0;i++){ step(); f.y = groundY() - 224; f.vy = 0; }
      out.p3 = projectiles.filter(function(p){ return p.shape === 'pfacetotem' || p.shape === 'pfacetotemw'; }).map(function(p){ return [p.delay, Math.abs(p.vx)]; }).sort(function(a, c){ return a[0] - c[0]; });
      return out;
    })()`);
    expect(r.jump.pct, 'airborne over the leg').toBe(0);
    expect(r.far.pct, 'out of its reach').toBe(0);
    expect(r.p3.map((t) => t[0]), 'two pairs, sixteen frames apart (read on the frame they fired)').toEqual([0, 0, 15, 15]);
    expect(r.p3[0][1], 'and quicker').toBe(9);
  });
});

describe('TOTAL SLIP SHOES!: a status, no damage', () => {
  it('the mark follows the marked fighter until the last 12 frames; the shoes are lobbed; where they land they go on: three seconds of slip, and not a point of damage', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      ${BEGIN('pfaceShoes')}
      var A = b._pf.aim, out = { kind: b._telKind, tel: b._tel, idx: A.idx, fidx: f.idx, bx: b.x, banner: document.getElementById('banner').textContent };
      for (var i=0;i<28;i++){ f.x = 300 + i*4; step(); f.vx = 0; }   // walk: the mark follows...
      out.followed = b._pf.aim.x; out.tel2 = b._tel;
      while (b._tel > 8){ f.x = 700; step(); f.vx = 0; }   // ...and holds once the last 12 frames are here
      out.locked = b._pf.aim.x; var lockedAt = b._pf.aim.x;
      f.x = lockedAt; while (b._tel > 1){ step(); f.x = lockedAt; f.vx = 0; }
      step();
      var sh = projectiles.filter(function(p){ return p.shape === 'pfaceshoe'; });
      out.shoes = sh.length; out.dmg = sh[0].dmg; out.kb = sh[0].kb; out.warnX = sh[0].warnX; out.inert = sh[0].delay > 0; out.warn = sh[0].warn > 0; out.T = sh[0].pfaceFly.T;
      var pct0 = f.pct, hs0 = f.hitstun, k = 0;
      while (projectiles.some(function(p){ return p.pfaceFly && p.life > 0; }) && k < 80){ step(); f.x = lockedAt; f.vx = 0; f.y = groundY() - 24; k++; }
      out.airFrames = k; out.pct = f.pct - pct0; out.ice = f.iceUntil; out.worn = Object.keys(b._pf.shoes); out.hitstun = f.hitstun; out.invuln = f.invuln;
      return out;
    })()`);
    expect(r.kind).toBe('pfaceShoes');
    expect(r.tel).toBe(42);
    expect(r.banner).toBe('TOTAL SLIP SHOES!');
    expect(r.idx, 'the marked fighter').toBe(r.fidx);
    expect(r.bx, 'he stands across the floor from you: it is a lob').toBeGreaterThan(700);
    expect(r.followed, 'the mark follows you...').toBeGreaterThan(300 + 20*4 - 10);
    expect(r.locked, '...and holds').toBe(700);
    expect(r.shoes).toBe(1);
    expect(r.dmg, 'no damage').toBe(0);
    expect(r.kb).toBe(0);
    expect(r.warnX, 'the landing shadow is on the locked spot').toBe(700);
    expect(r.inert && r.warn).toBe(true);
    expect(r.T, 'thirty-four frames in the air').toBe(34);
    expect(r.airFrames).toBeLessThanOrEqual(36);
    expect(r.pct, 'a status, no damage').toBe(0);
    expect(r.ice, 'three seconds of slip: the engine\'s own (iceUntil)').toBeGreaterThanOrEqual(178);
    expect(r.ice).toBeLessThanOrEqual(180);
    expect(r.worn).toEqual([String(W.eval('fighters[0].idx'))]);
    expect(r.hitstun, 'it does not stagger you either').toBe(0);
  });

  it('their footing really is slippery: a shod fighter slides on where a plain one stops; you can dodge the lob by moving; the shoes wear off', () => {
    const r = W.eval(`(function(){ var out = {};
      // slide: the same shove, with and without the shoes
      [false, true].forEach(function(shod){
        ${STAGE(300)}
        f.onground = true; f.y = groundY() - 24; if (shod) pfaceShoesOn(b, f);
        f.vx = 6; for (var i=0;i<30;i++){ step(); }
        out[shod ? 'shod' : 'plain'] = { vx: f.vx, dx: f.x - 300 };
      });
      // dodge: step out of the mark after it locks
      ${STAGE(300)}
      ${BEGIN('pfaceShoes')}
      while (b._tel > 1){ step(); f.x = 300; f.vx = 0; }
      step(); var landX = b._pf.aim ? b._pf.aim.x : projectiles.find(function(p){ return p.pfaceFly; }).warnX;
      for (var k=0;k<50;k++){ step(); f.x = 300 - 160; f.vx = 0; }
      out.dodged = { ice: f.iceUntil, landX: landX };
      // wear off
      ${STAGE(300)}
      pfaceShoesOn(b, f); f.iceUntil = 3; for (var j=0;j<10;j++) step();
      out.off = { worn: Object.keys(b._pf.shoes).length, ice: f.iceUntil };
      // phase 3: a second pair
      ${STAGE(300)}
      b.hp = b.maxHp*0.2; updateBossAttack(b, f); b._atkTimer = 1e9; b._hz = { st:0, n:1e9, k:0, c:0, sd:0 };
      ${BEGIN('pfaceShoes')}
      var seen = new Set(); for (var m=0;m<75;m++){ step(); f.x = 300; f.vx = 0; projectiles.forEach(function(p){ if (p.shape === 'pfaceshoe') seen.add(p); }); }
      out.p3 = seen.size;
      return out;
    })()`);
    expect(r.plain.dx, 'a plain fighter stops within a few strides').toBeLessThan(60);
    expect(r.shod.dx, 'a shod one is still sliding after half a second').toBeGreaterThan(r.plain.dx*3);
    expect(r.shod.vx).toBeGreaterThan(3);
    expect(r.dodged.ice, 'moved out of the mark: no shoes').toBe(0);
    expect(r.off, 'when the slip ends the shoes come off').toEqual({ worn: 0, ice: 0 });
    expect(r.p3, 'phase 3 lobs a second pair').toBeGreaterThanOrEqual(2);
  });
});

describe("Yellow Face's Warehouse: the arena and its hazard", () => {
  it('is his arena, with its own sky, its own concrete ground and its own decor -- and it is a boss arena a netcode client knows', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var G = arenaGround();
      return { arena: BOSS_ARENA, sky: BOSS_ARENA_SKY.warehouse, ground: G && { fill: G.fill, line: G.line, pattern: typeof G.pattern }, hazard: Object.keys(BOSS_ARENA_HAZARD[BOSS_ARENA] || {}),
               studioGround: BOSS_ARENA_GROUND.studio, decorKeys: String(drawArenaDecor).indexOf('key==="warehouse"') >= 0, roster: b.name };
    })()`);
    expect(r.arena).toBe('warehouse');
    expect(r.sky, 'a client only takes a key it has').toEqual(['#4d4d5a', '#292934']);
    expect(r.ground).toEqual({ fill: '#6a6a7c', line: '#1c1c24', pattern: 'function' });
    expect(r.hazard.sort()).toEqual(['draw', 'step']);
    expect(r.studioGround, "the TV studio is not his any more, and nobody laid it a ground").toBe(undefined);
    expect(r.decorKeys).toBe(true);
    expect(W.eval('BOSS_ROSTER.filter(function(b){ return b.arena === "warehouse"; }).map(function(b){ return b.name; })'), 'his alone').toEqual(['Purple Face']);
  });

  it('THE MAGNET: it hums up, the shelf leans, the floor under it is striped, then it falls for one boss hit -- phase 1 one side at a time, then both', () => {
    const r = W.eval(`(function(){ var out = {};
      var mk = function(name, x){ var g = makeFighter(ROSTER.find(function(r){ return r.name===name; }), x, groundY()-24, 0); g.team = 0; g.controller = 'still'; g.stocks = 9; return g; };
      ${STAGE(200, false, true)}
      var mid = mk('Pen', 550), right = mk('Coiny', 900), plat = mk('Bow', 360); plat.y = worldPlats[0].y - 24; fighters.push(mid, right, plat);
      var G = pfaceShelves(); out.geo = { sw: G.sw, sh: G.sh, z0: G.z[0], z1: G.z[1] };
      b._hz = { st:0, n:2, k:0, c:0, sd:0 };
      var seen = [], pcts = function(){ return fighters.map(function(q){ return q.pct; }); };
      var pin = function(){ f.x = 200; mid.x = 550; right.x = 900; plat.x = 360; plat.y = worldPlats[0].y - 24; fighters.forEach(function(q){ q.vx = 0; q.vy = 0; q.invuln = 0; q.pct = q.pct; }); };
      for (var i=0;i<400;i++){ step(); pin(); var H = b._hz; if (seen[seen.length-1] !== H.st) seen.push(H.st); if (H.st === 3 && !out.landed){ out.landed = { sd: H.sd, k: H.k }; out.pcts1 = pcts(); out.scars = IMPACT_SCARS.length; } }
      out.seen = seen; out.after = { st: b._hz.st, n: b._hz.n };
      out.full = bossDmg();
      // phase 2: both shelves
      fighters.forEach(function(q){ q.pct = 0; });
      b.hp = b.maxHp*0.5; updateBossAttack(b, f); b._atkTimer = 1e9; b._hz = { st:0, n:2, k:0, c:0, sd:0 };
      for (var j=0;j<300;j++){ step(); pin(); if (b._hz.st === 3 && !out.landed2){ out.landed2 = { sd: b._hz.sd }; out.pcts2 = pcts(); } }
      out.snapHz = JSON.parse(JSON.stringify(b._hz));
      return out;
    })()`);
    expect(r.geo.z0.x1 - r.geo.z0.x0, 'a shelf lands a shelf-length (about 0.95 of its height) from its foot').toBeCloseTo(r.geo.sh*0.95 - 6, 3);
    expect(r.seen, 'idle, hum and lean, fall, lying, idle').toEqual([0, 1, 2, 3, 0]);
    expect(r.landed.sd, 'phase 1: the left shelf first').toBe(1);
    // fighters, in order: f at 200 (under the left shelf), Pen 550 (the safe middle), Coiny 900 (under the RIGHT one), Bow on the platform at 360 (its left end is under the fall)
    expect(r.pcts1[0], 'under it: one boss hit at 0.75').toBeCloseTo(r.full*0.75, 5);
    expect(r.pcts1[1], 'the middle is safe').toBe(0);
    expect(r.pcts1[2], 'the far side is safe in phase 1').toBe(0);
    expect(r.pcts1[3], 'the platform is not all safe: its left end is under the fall').toBeCloseTo(r.full*0.75, 5);
    expect(r.scars, 'a heavy landing: the floor is scarred').toBeGreaterThan(0);
    expect(r.after.st).toBe(0);
    expect(r.after.n, 'the next one comes in a cycle (14 s in phase 1)').toBeGreaterThan(300);
    expect(r.landed2.sd, 'phase 2 drops both').toBe(3);
    expect(r.pcts2[0]).toBeCloseTo(r.full*0.75, 5);
    expect(r.pcts2[2], 'and now the far side is under one too').toBeCloseTo(r.full*0.75, 5);
    expect(r.pcts2[1]).toBe(0);
    expect(Object.values(r.snapHz).every((v) => typeof v === 'number'), 'its state is a few plain numbers').toBe(true);
  });

  it('it is one boss hit however long you stand in it, it never fires without its boss, and it comes sooner each phase', () => {
    const r = W.eval(`(function(){ ${STAGE(200, false, true)}
      var H = b._hz = { st:0, n:1, k:0, c:0, sd:0 }, hits = 0, last = 0;
      for (var i=0;i<300;i++){ step(); f.x = 200; f.vx = 0; f.y = groundY() - 24; f.vy = 0; f.invuln = 0; if (f.pct > last + 0.001){ hits++; last = f.pct; } }
      var out = { pct: f.pct, cap: bossDmg(), cycles: PFACE.hz.cycle, warns: PFACE.hz.warn };
      b.hp = 0; var n0 = b._hz.k; arenaHazardStep(b, f); out.dead = b._hz.k === n0;
      return out;
    })()`);
    expect(r.pct, 'one hit however long you stand there').toBeLessThanOrEqual(r.cap*0.75 + 1e-6);
    expect(r.pct).toBeGreaterThan(0);
    expect(r.dead, 'a fallen boss\'s hazard stops').toBe(true);
    expect(r.cycles.slice(1)).toEqual([840, 660, 540]);
    expect(r.warns.slice(1), 'a shorter warning each phase').toEqual([74, 66, 56]);
  });

  it('every part of the set draws, in every phase and every state of the hazard, without throwing and without a word', () => {
    const err = W.eval(`(function(){
      try {
        var gy = groundY(), calls = 0;
        var boss = function(ph, o){ return Object.assign({ type:'boss', name:'Purple Face', color:'#7a3a8a', sprite:'face', r:88.4, x:550, y:gy-88.4, face:1, hp:100, maxHp:235, _tel:0, _telKind:null, _phase:ph, _rage:false, flash:0, homeX:550, attack:'swallow' }, o || {}); };
        [1, 2, 3].forEach(function(ph){ summons = [boss(ph)]; drawArenaDecor('warehouse'); calls++; });
        summons = [];
        [{}, { st:0 }, { st:1, k:30, sd:1 }, { st:1, k:70, sd:3 }, { st:2, k:10, sd:2 }, { st:3, k:40, sd:1 }, { st:3, k:110, sd:3 }, { st:0, rk:12, rs:1 }, { st:0, rk:12, rs:2 }].forEach(function(H){
          [1, 2, 3].forEach(function(ph){ ['under', 'over'].forEach(function(layer){ ctx.save(); pfaceHazardDraw(ph === 1 ? null : boss(ph), H, layer); ctx.restore(); calls++; }); }); });
        var states = [{}, { _tel:20, _telKind:'swallow', _pf:{ st:'tell', dir:-1, x0:1018, x1:82, t:0 } }, { _pf:{ st:'run', dir:1, x0:80, x1:1018, t:5 }, x:300 }, { _pf:{ st:'crash', dir:-1, x0:1018, x1:82, t:3 }, x:82 },
          { _pf:{ st:'retell', dir:1, x0:82, x1:1018, t:4 } }, { _tel:30, _telKind:'pfaceRap' }, { _tel:9, _telKind:'pfaceRap', _phase:3 }, { _pf:{ kick:[1, 4] } }, { _pf:{ kick:[-1, 12] } }, { _pf:{ sq:8, pop:5, gl:40 } },
          { _phase:3, hp:20, flash:6, _pf:{ gl:90 } }, { _tel:40, _telKind:'pfaceTorture' }, { _tel:40, _telKind:'pfaceShoes' }, { _tel:20, _telKind:'pfaceThanks', _pf:{ ring:400 } }, { x:1300, _phase:3, _tel:30, _telKind:'swallow', _pf:{ st:'tell', dir:-1, x0:1300, x1:82 } }];
        states.forEach(function(st){ ctx.save(); ctx.translate(550, gy-88); drawBossSprite(boss(1, st)); ctx.restore(); calls++; });
        var fighter = fighters[0] || makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 400, gy-24, 0); fighters = [fighter]; fighter._swallow = 100;
        [{ _tongueHp:50, _tongueX:400, _tongueY:gy-170, _stX:400, _stY:gy-140 }, { _tongueHp:12, _tongueX:400, _tongueY:gy-170 }, { _tongueHp:1 }].forEach(function(o){
          var bb = Object.assign(boss(1, { _pf:{ tk:[[300, 3, 24], [300, 30, 24], [300, 60, 24], [700, 64, 18]], ring:500, shoe:[fighter.idx] } }), o);
          pfaceDrawFx(bb); pfaceDrawOver(bb); calls++; });
        fighter._swallow = 0;
        // the rap's lanes (FREESTYLE RAP!, "purple faces notes should be in varied areas."): in the intro, as each pulse starts, after it, with and without a platform
        [-1, 0, 20, 45, 75, 140, 200].forEach(function(k){ [1, 2, 3].forEach(function(ph){
          pfaceDrawFx(boss(ph, { _tel: k < 0 ? 40 : 0, _telKind: k < 0 ? 'pfaceRap' : 'swallow', _pf:{ rap:{ p:[[0, 300, 0], [1, 520, 0], [2, 700, 260]], k:k, ph:ph, l:[342, 758, 446] } } })); calls++;
          pfaceDrawFx(boss(ph, { _pf:{ rap:{ p:[[0, 100, 0], [2, 550, 250], [0, 1000, 0]], k:k, ph:ph, l:null } } })); calls++; }); });
        [0, 6, 13, 14, 20, 31, 36, 58, 90, 107, 108].forEach(function(dl){ pfaceDrawEnding({ x:500, delay: 108 - dl, face:-1 }); calls++; });
        var shapes = ['pfacenote','pfacebug','pfacetotem','pfacetotemw','pfaceshoe','pfacestar','pfacemagnet'];
        shapes.forEach(function(k){ drawProjectile({ x:300, y:300, owner:-2, ownerObj:{ team:-1, idx:-2 }, shape:k, r:20, vx:-6, vy:1, color:'#ff9ad8', pfaceNote:1, delay:0 }); calls++; });
        drawProjectile({ x:300, y:300, owner:-2, ownerObj:{ team:-1, idx:-2 }, shape:'pfacenote', r:16, vx:8, vy:0, color:'#ff9ad8', pfaceNote:1, delay:20 });
        drawProjectile({ x:300, y:gy+260, owner:-2, ownerObj:{ team:-1, idx:-2 }, r:1, pfaceEnd:1, delay:80, face:1, color:'#7a3a8a' });
        shapes.forEach(function(k){ ctx.save(); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; PROJ_SHAPE[k].draw(ctx, 16, { vx:-5, vy:0, color:'#fff' }); ctx.restore(); });
        pfaceDrawShoes(ctx, Object.assign({}, fighter, { vx:5 }));
        return 'ok ' + calls;
      } catch(e){ return e.message + ' ' + (e.stack||'').split('\\n')[1]; }
    })()`);
    expect(err).toMatch(/^ok \d+/);
    // and not one word in any of it
    const src = W.eval(`[pfaceDrawTell, pfaceDrawFx, pfaceDrawRap, pfaceDrawOver, pfaceDrawStomach, pfaceDrawTank, pfaceDrawRing, pfaceDrawShoes, pfaceDrawEnding, pfaceDrawBossAt, pfaceDecor, pfaceHazardDraw,
      pfaceDrawMagnet, pfaceDrawFortress, pfaceShelfArt, pfaceDrawShelf, pfaceGroundPattern, pfaceStar, pfaceLook].map(String).join('\\n')`);
    expect(src, 'no text is drawn by any of it').not.toMatch(/fillText|strokeText|\.font\s*=/);
  });
});

describe('the ending: put back in the box', () => {
  it('when he falls the Beryllium Fortress comes down over him and the creature inside jumps twice; his shots and the slip go with him; the card waits, and there is no text', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var st = setTimeout, timers = [], said = [], _b = banner;
      setTimeout = function(fn, ms){ timers.push({ fn: fn, ms: ms }); return 0; };
      banner = function(t, m, k, l){ said.push([String(t), k || null]); return _b(t, m, k, l); };
      try {
        BOSSRUSH.active = true; var gy = groundY(), out = {};
        pfaceShoesOn(b, f);
        projectiles.push({ owner:-2, pface:true, shape:'pfacetotem', x:100, y:500, r:20, life:50, vx:5, vy:0 }, { owner:-2, x:0, y:0, r:8, life:50, vx:0, vy:0 });
        b.x = 420; b.hp = 0; bossRushCheck();
        var end = projectiles.filter(function(p){ return p.pfaceEnd; });
        out.end = end.map(function(p){ return { x: p.x, delay: p.delay, dmg: p.dmg, life: p.life, below: p.y > gy }; });
        out.others = projectiles.filter(function(p){ return !p.pfaceEnd; }).length; out.iceAfter = f.iceUntil; out.bossLeft = summons.filter(function(s){ return s.type==='boss'; }).length;
        out.saidNow = said.slice(); out.ms = timers.map(function(t){ return t.ms; });
        var card = timers.find(function(t){ return t.ms === 1000 && String(t.fn).indexOf('downCard') >= 0; }), run0 = running;
        running = true; if (card) card.fn(); running = run0;
        out.after = said.slice(out.saidNow.length);
        var slam = timers.find(function(t){ return t.ms === 240; }); var sc0 = IMPACT_SCARS.length; running = true; if (slam) slam.fn(); out.slamScar = IMPACT_SCARS.length - sc0;
        // the scene plays out from its delay, and is gone when it is over: nothing hurts anyone
        var pct0 = f.pct; f.x = 420; for (var i=0;i<PFACE.end.total + 3;i++){ step(); f.x = 420; f.invuln = 0; } out.left = projectiles.filter(function(p){ return p.pfaceEnd; }).length; out.pct = f.pct - pct0;
        return out;
      } finally { setTimeout = st; banner = _b; BOSSRUSH.active = false; summons = []; projectiles = []; }
    })()`);
    expect(r.end, 'one scene, where he fell, that hurts nobody').toEqual([{ x: 420, delay: 108, dmg: 0, life: 1, below: true }]);
    expect(r.others, 'his shots are swept and everyone else\'s stay').toBe(1);
    expect(r.iceAfter, 'the slip is gone with him').toBe(0);
    expect(r.bossLeft).toBe(0);
    expect(r.saidNow.some(([, k]) => k === 'boss'), 'no text: nothing but the card, and it waits').toBe(false);
    expect(r.saidNow.some(([t]) => /BOSS DOWN/.test(t))).toBe(false);
    expect(r.ms, 'the card after his second; the next boss after 1.5 s and that second').toEqual(expect.arrayContaining([1000, 2500]));
    expect(r.after.some(([t, k]) => /^BOSS DOWN!/.test(t) && k === 'sys')).toBe(true);
    expect(r.slamScar, 'the box lands with a heavy impact').toBeGreaterThan(0);
    expect(r.left, 'over before the next boss').toBe(0);
    expect(r.pct, 'a scene hurts nobody').toBe(0);
  });
});

describe('three phases, each changing the fight', () => {
  it('phase 2 (Running Loops) and 3 (Broken Value) are announced, pop him to the middle, and answer with the warehouse; phase 3 tears his render', () => {
    const r = W.eval(`(function(){ ${STAGE(300, false, true)}
      var out = { p1: b._phase, st: b.stationary };
      b.x = 900; b.homeX = 900; b._hz = { st:0, n:1000, k:0, c:0, sd:0 };
      b.hp = b.maxHp*0.5; updateBossAttack(b, f);
      out.p2 = { phase: b._phase, banner: document.getElementById('banner').textContent, x: b.x, n: b._hz.n, gl: b._pf.gl };
      b.x = 900; b._hz.n = 1000;
      b.hp = b.maxHp*0.2; updateBossAttack(b, f);
      out.p3 = { phase: b._phase, banner: document.getElementById('banner').textContent, x: b.x, n: b._hz.n, gl: b._pf.gl, shake: shakeAmt };
      return out;
    })()`);
    expect(r.p1).toBe(1);
    expect(r.st, 'he moves').toBe(false);
    expect(r.p2.phase).toBe(2);
    expect(r.p2.banner).toBe('Purple Face — PHASE 2: Running Loops');
    expect(r.p2.x, 'he pops to the middle of the floor').toBe(550);
    expect(r.p2.n, 'and the next shelf is soon').toBeLessThanOrEqual(300);
    expect(r.p2.gl).toBe(0);
    expect(r.p3.phase).toBe(3);
    expect(r.p3.banner).toBe('Purple Face — PHASE 3: Broken Value');
    expect(r.p3.x).toBe(550);
    expect(r.p3.gl, 'the render tears for two seconds').toBeGreaterThan(100);
  });

  it('each phase is harder without a point more damage: shorter wind-ups and gaps, faster pulses and lunges, more lunges, tanks and totems -- and every hit is still one boss hit', () => {
    const r = W.eval(`(function(){
      var P = PFACE;
      return { tel: [1,2,3].map(function(p){ return Object.keys(P.tel).map(function(k){ return P.tel[k][p]; }); }), gaps: P.gaps, run: P.run, lunges: P.lunges, rap: P.rap.spd, tank: P.tank.close, bugs: P.tank.bugs,
               waves: P.thanks.waves, fly: P.shoes.fly, lock: P.shoes.lock, warn: P.hz.warn, cyc: P.hz.cycle, hit: P.hz.hit };
    })()`);
    for (let k = 0; k < 5; k++) { expect(r.tel[0][k]).toBeGreaterThan(r.tel[1][k]); expect(r.tel[1][k]).toBeGreaterThan(r.tel[2][k]); }
    expect(r.gaps.slice(1)).toEqual([116, 86, 64]);
    expect(r.run.slice(1)).toEqual([17, 19, 21]);
    expect(r.lunges.slice(1)).toEqual([1, 2, 2]);
    expect(r.rap.slice(1)).toEqual([8, 9.5, 11]);
    expect(r.tank.slice(1), 'the panes close quicker').toEqual([24, 18, 18]);
    expect(r.waves.slice(1)).toEqual([1, 1, 2]);
    expect(r.fly.slice(1), 'the shoes fly faster').toEqual([34, 28, 24]);
    expect(r.lock.slice(1), 'and the mark stops following you sooner').toEqual([12, 16, 20]);
    expect(r.cyc.slice(1)).toEqual([840, 660, 540]);
    expect(r.hit, 'a shelf is 0.75 of a boss hit, as a hazard is: capped by its one id').toBe(0.75);
  });

  it('a whole fight: every one of his five moves is named once, in turn, and nothing is said but the telegraphs and the phase cards', () => {
    const r = W.eval(`(function(){ ${STAGE(300, true, true)}
      var seen = [], tap = [], _b = banner; banner = function(t, m, k, l){ tap.push([String(t), k || null]); return _b(t, m, k, l); };
      try {
        for (var i=0;i<3000;i++){
          if (i === 1000) b.hp = b.maxHp*0.5; if (i === 2000) b.hp = b.maxHp*0.2;
          step(); f.invuln = 0; f.pct = Math.min(f.pct, 40); f.dead = false;
          if (b._tel > 0 && b._tel === PFACE.tel[b._telKind][b._phase] - 0) seen.push(b._telKind);
        }
      } finally { banner = _b; }
      return { tap: tap, hp: b.hp, alive: summons.indexOf(b) >= 0 };
    })()`);
    const names = new Set(['AD BREAK!', 'FREESTYLE RAP!', 'TORTURE TIME!', 'THANK YOU FOR COMING!', 'TOTAL SLIP SHOES!']);
    const boss = r.tap.filter(([, k]) => k === 'boss'), sys = r.tap.filter(([, k]) => k === 'sys');
    expect(r.alive).toBe(true);
    expect(boss.every(([t]) => names.has(t)), `only his five telegraph names: ${[...new Set(boss.map(([t]) => t))]}`).toBe(true);
    expect(new Set(boss.map(([t]) => t)), 'and all five came up').toEqual(names);
    expect(sys.map(([t]) => t), 'and the two phase cards').toEqual(['Purple Face — PHASE 2: Running Loops', 'Purple Face — PHASE 3: Broken Value']);
    expect(r.tap.filter(([, k]) => k !== 'boss' && k !== 'sys'), 'nothing else is said: no move, status or hit puts a word on the screen').toEqual([]);
  });
});

// A boot whose canvas records every call, so a test can see what draw() painted (as test/boss-kit.test.js does).
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

describe('no words on screen: the stomach\'s meter is wordless', () => {
  it('a swallowed fighter\'s stomach draws the tongue and a ring round it that empties as it is beaten -- and not one "TONGUE n%"', () => {
    const { w, log } = bootRecording();
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow(); running=false;`);
    const at = (hp) => {
      w.eval(`${STAGE(300)} fireSwallow(b, f, 1); b._tongueHp = ${hp}; running = false;`);
      log.length = 0; w.eval('draw()');
      return log.slice();
    };
    for (const hp of [50, 13]) {
      const ops = at(hp);
      const texts = ops.filter((e) => e.op === 'fillText' || e.op === 'strokeText').map((e) => String(e.args[0]));
      expect(texts.filter((t) => /TONGUE|%|\d/.test(t)), `no words for the tongue at ${hp}: ${texts}`).toEqual([]);
      const rings = ops.filter((e) => e.op === 'arc' && e.args[2] === 44);
      expect(rings, 'the meter: a track and its fill').toHaveLength(2);
      expect(rings[1].args[4], `a ring swept ${hp}/50 of the way round`).toBeCloseTo(-Math.PI/2 + (hp/50)*Math.PI*2, 5);
    }
    expect(w.eval('String(pfaceDrawStomach)')).not.toMatch(/fillText|strokeText/);
  });

  it('every hit on the tongue shakes him, and with a quarter of it left he hiccups; beaten, it lets the fighter go, as it always did', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      fireSwallow(b, f, 1); b._tongueHp = 50; var out = {};
      step(); shakeAmt = 0;
      damageSummons(f, b.x, b.y, 10, 10); step();
      out.after1 = { tongue: b._tongueHp, sq: b._pf.sq, shake: shakeAmt, pop: b._pf.pop };
      damageSummons(f, b.x, b.y, 10, 28); step();
      out.after2 = { tongue: b._tongueHp, pop: b._pf.pop };
      damageSummons(f, b.x, b.y, 10, 20); step();
      out.freed = !(f._swallow > 0); out.tongueGone = b._tongueHp <= 0;
      return out;
    })()`);
    expect(r.after1.tongue).toBe(40);
    expect(r.after1.sq, 'he is shaken by it').toBeGreaterThan(0);
    expect(r.after1.shake).toBeGreaterThan(0);
    expect(r.after1.pop, 'no hiccup yet').toBe(0);
    expect(r.after2.tongue).toBe(12);
    expect(r.after2.pop, 'at a quarter left: the hiccup').toBeGreaterThan(0);
    expect(r.freed).toBe(true);
  });

  it('the warehouse lays its own concrete, with a yellow safety line, and the dust of a heavy hit takes the color of the concrete', () => {
    const { w, log } = bootRecording();
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow(); running=false; BOSS_ARENA = 'warehouse';`);
    const gy = w.eval('groundY()');
    log.length = 0; w.eval('draw()');
    const fills = log.filter((e) => e.op === 'fillRect' && e.args[0] === -20 && e.args[1] === gy).map((e) => e.fill);
    expect(fills, 'the floor is the warehouse concrete, not Goiky green').toEqual(['#6a6a7c']);
    const line = log.filter((e) => e.op === 'fillRect' && e.fill === '#d8b410' && e.args[3] === 5);
    expect(line.length, 'the yellow safety line of the walkway').toBe(1);
    expect(line[0].args[1], 'just under the floor line').toBe(gy + 10);
    expect(log.some((e) => e.op === 'stroke' && e.stroke === '#1c1c24'), 'and its own floor line').toBe(true);
    expect(w.eval('impactGroundColor() !== impactTint(stage.ground, 0.35)'), 'the dust of impact() takes the ground of the arena').toBe(true);
  });

  it('nothing of his in the source puts a word on the screen, calls banner(), or names the owner\'s forbidden four', () => {
    const html = readFileSync('artifacts/V1/index.html', 'utf8').split(/\r?\n/);
    const mine = []; let inside = false;
    for (const l of html) { if (/@boss:purpleface:begin /.test(l)) { inside = true; continue; } if (/@boss:purpleface:end /.test(l)) { inside = false; continue; } if (inside) mine.push(l); }
    const text = mine.join('\n');
    expect(mine.length, 'his slots are the bulk of it').toBeGreaterThan(500);
    expect(text).not.toMatch(/fillText|strokeText|\.font\s*=/);
    expect(text, 'no banner: only the engine names his wind-ups, and only the phase cards say the rest').not.toMatch(/\bbanner\(/);
    expect(text).not.toMatch(/\bOJ\b|Suitcase|Cabby|The Floor/);
    const extra = ['scripts/fetch-attack-sprites.mjs', 'artifacts/V1/assets/sprites/CREDITS.md', 'test/boss-purple-face.test.js'].map((f) => {
      const src = readFileSync(f, 'utf8').split(/\r?\n/); let on = false, out = [];
      for (const l of src) { if (/@boss:purpleface:begin /.test(l)) { on = true; continue; } if (/@boss:purpleface:end /.test(l)) { on = false; continue; } if (on) out.push(l); }
      return f.endsWith('.test.js') ? '' : out.join('\n');
    }).join('\n');
    expect(extra).not.toMatch(/\bOJ\b|Suitcase|Cabby|The Floor/);
  });
});

describe('the show\'s art, wired and credited', () => {
  const ART = ['pfacebug', 'pfacetotem', 'pfacetotemw', 'pfaceshoe', 'pfacestar', 'pfacemagnet'];
  const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
  const manifest = JSON.parse(readFileSync('scripts/attack-sprite-manifest.json', 'utf8'));
  const picks = readFileSync('scripts/fetch-attack-sprites.mjs', 'utf8');

  it('his shots and props each wear a wiki file: registered, a glyph under it, a transparent PNG of projectile size, in the manifest, in the picks and in the credits with its source', () => {
    for (const k of ART) {
      const e = W.eval(`ATTACK_SPRITES.${k}`);
      expect(e, k).toBeTruthy();
      expect(e.src).toBe(`assets/sprites/attacks/${k}.png`);
      expect(e.h, `${k}: drawn between 6 and 44`).toBeGreaterThanOrEqual(6);
      expect(e.h).toBeLessThanOrEqual(44);
      expect(W.eval(`typeof PROJ_SHAPE.${k}.draw`), `${k} has a glyph until its art loads`).toBe('function');
      const file = `artifacts/V1/${e.src}`;
      expect(existsSync(file), file).toBe(true);
      const png = PNG.sync.read(readFileSync(file));
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      expect(clear/(png.width*png.height), `${k} is transparent`).toBeGreaterThan(0.12);
      expect(Math.max(png.width, png.height), `${k} is projectile-sized`).toBeLessThanOrEqual(128);
      expect(Math.max(png.width, png.height)).toBeGreaterThanOrEqual(24);
      const m = manifest[k];
      expect(m, `${k} is in scripts/attack-sprite-manifest.json`).toMatchObject({ who: 'Purple Face', kits: [k], file: `${k}.png`, wiki: 'bfdi' });
      expect(m.source).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/battlefordreamisland\/images\//);
      expect([m.width, m.height]).toEqual([png.width, png.height]);
      expect(credits, `${k} is credited`).toContain(`(${k}.png)`);
      expect(credits, `${k}'s source URL is in CREDITS.md`).toContain(m.source);
      expect(picks, `${k} has its pick`).toMatch(new RegExp(`^\\s+${k}:\\s+\\{ who: 'Purple Face'`, 'm'));
    }
    const src = (k) => manifest[k].srcTitle;
    expect(src('pfacebug')).toBe('Purple bug.png');
    expect(src('pfaceshoe'), 'his Total Slip Shoes So Wah').toBe('Total Slip Shoe So Wah.png');
    expect(src('pfacetotem')).toMatch(/^Black totem/);
    expect(src('pfacetotemw')).toBe('White totem -lollipop-.png');
    expect(src('pfacemagnet')).toBe("World's Strongest Magnet (TPOT 5).png");
  });

  it('his open-mouth render is a wiki pose, transparent, at most 200 px tall, credited, flipped like his other render, with a drawn face under it; the look follows what he is doing', () => {
    expect(W.eval('BOSS_SPRITE_SRC.facegape')).toBe('assets/sprites/purple-face-gape.png');
    const file = 'artifacts/V1/assets/sprites/purple-face-gape.png';
    expect(existsSync(file)).toBe(true);
    const png = PNG.sync.read(readFileSync(file));
    expect(png.height).toBeLessThanOrEqual(200);
    const alpha = (x, y) => png.data[(y*png.width + x)*4 + 3];
    expect([alpha(0, 0), alpha(png.width - 1, 0), alpha(0, png.height - 1), alpha(png.width - 1, png.height - 1)], 'transparent, not a sticker').toEqual([0, 0, 0, 0]);
    expect(credits).toContain('`purple-face-gape.png`');
    expect(credits).toContain('Purple_Face_-_blowing_bugs.png');
    expect(W.eval('!!BOSS_SPRITE_FLIP.facegape && !!BOSS_SPRITE_FLIP.face')).toBe(true);
    expect(W.eval(`String(drawBossSprite).indexOf('case "facegape"') >= 0`), 'a drawn fallback').toBe(true);
    const looks = W.eval(`(function(){
      var s = function(o){ return Object.assign({ attack:'swallow', sprite:'face', _tel:0, _telKind:null, _phase:1 }, o); };
      return [s({}), s({ _tel:20, _telKind:'swallow' }), s({ _tel:20, _telKind:'pfaceTorture' }), s({ _tel:20, _telKind:'pfaceThanks' }), s({ _tel:40, _telKind:'pfaceRap' }), s({ _tel:30, _telKind:'pfaceRap' }),
              s({ _pf:{ st:'run', dir:1 } }), s({ _pf:{ st:'crash', dir:1 } }), s({ _pf:{ st:'tell', dir:1 } })].map(function(x){ return bossLook(x); });
    })()`);
    expect(looks, 'mouth open for AD BREAK!, the tank and the rap\'s off-beats; shut at rest, when he is stuck in the wall and for the kick').toEqual(['face', 'facegape', 'facegape', 'face', 'facegape', 'face', 'facegape', 'face', 'facegape']);
  });
});

describe('a netcode client sees him', () => {
  it('his lunge, tanks, kick, ring, shoes, tongue meter, stomach, hazard, rap pulses and ending cross the snapshot and draw on the client', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow();
      BOSS_ARENA = 'warehouse'; var gy = groundY(), me = fighters[0];
      var pf = { lunge:{ st:'run', dir:-1, x0:1018, x1:82, t:7, ph:2, n:2, id:1 }, tk:[{ id:1, x:300, age:40, close:24 }], ring:{ x:500, dir:1 }, kick:{ dir:1, t:5, id:2, hit:{} },
                 shoes:{}, later:[], tid:1, sq:6, gl:30, pop:0, aim:null, hp:100,
                 rap:{ p:[{ row:'floor', x:300 }, { row:'ledge', x:520 }, { row:'air', x:700, h:260 }], k:20, ph:2, l:[342, 758, 446], id:9, q:[] } };
      pf.shoes[me.idx] = 1e9;
      summons = [{ type:'boss', name:'Purple Face', color:'#7a3a8a', r:88.4, sprite:'face', x:500, y:gy-88, hp:80, maxHp:235, face:-1, flash:0, homeX:500, _rage:false, _tel:10, _telKind:'pfaceThanks', _bossRush:true,
                   attack:'swallow', _phase:2, _pf:pf, _tongueHp:30, _tongueX:400, _tongueY:gy-170, _stX:400, _stY:gy-140, _hz:{ st:1, k:20, sd:3, n:0, c:1 } }];
      projectiles = [{ x:300, y:gy-16, vx:8, vy:0, r:16, color:'#ff9ad8', owner:-2, ownerObj:{ team:-1, idx:-2 }, bossAtk:5, life:50, delay:20, shape:'pfacenote', pfaceNote:1 },
                     { x:420, y:gy+260, vx:0, vy:0, r:1, color:'#7a3a8a', owner:-2, ownerObj:{ team:-1, idx:-2 }, bossAtk:6, life:1, delay:60, pfaceEnd:1, face:-1 },
                     { x:600, y:300, vx:1, vy:0, r:26, color:'#a86bff', owner:-2, ownerObj:{ team:-1, idx:-2 }, bossAtk:7, life:9999, delay:1e6, warn:99, warnX:640, warnY:gy, shape:'pfaceshoe' },
                     { x:600, y:430, vx:8, vy:0, r:16, color:'#ff9ad8', owner:-2, ownerObj:{ team:-1, idx:-2 }, bossAtk:8, life:9999, delay:1e6, shape:'pfacenote', pfaceNote:2, pfaceLedge:{ x0:342, x1:758, y:446 } }];
      me._swallow = 100; me.iceUntil = 120;
      var snap = JSON.parse(JSON.stringify(serializeState()));
      summons = []; projectiles = []; BOSS_ARENA = null;
      applySnapshot(snap);
      var err = null;
      try { summons.forEach(drawSummon); projectiles.forEach(drawProjectile); drawBossBar(); drawArenaDecor(BOSS_ARENA); drawArenaHazard('under'); drawArenaHazard('over'); pfaceDrawFx(summons[0]); }
      catch(e){ err = e.message; }
      return { boss: snap.summons[0], pj: snap.pj.a.map(function(row){ return row[8]; }), arena: BOSS_ARENA, err: err, look: pfaceLook(summons[0]), swallowed: fighters[0]._swallow, ice: fighters[0].iceUntil,
               got: { pf: summons[0]._pf, hz: summons[0]._hz, tongue: [summons[0]._tongueHp, summons[0]._stX], notes: projectiles.filter(function(p){ return p.pfaceNote && !p.pfaceLedge; }).map(function(p){ return p.delay; }), end: projectiles.filter(function(p){ return p.pfaceEnd; }).length,
                      ledge: projectiles.filter(function(p){ return p.pfaceLedge; }).map(function(p){ return [Math.round(p.x), Math.round(p.y), p.vx, p.pfaceNote]; }) } };
    })()`);
    expect(r.err).toBe(null);
    expect(r.boss._pf).toMatchObject({ st: 'run', dir: -1, x1: 82, tk: [[300, 40, 24]], ring: 500, kick: [1, 5], shoe: [expect.any(Number)], sq: 6, gl: 30 });
    expect(r.boss).toMatchObject({ _tongueHp: 30, _tongueX: 400, _stX: 400, _hz: { st: 1, k: 20, sd: 3 }, attack: 'swallow', _phase: 2, _telKind: 'pfaceThanks' });
    expect(r.got.pf, 'the client\'s boss carries the compact view itself').toMatchObject({ st: 'run', tk: [[300, 40, 24]], ring: 500 });
    expect(r.got.tongue).toEqual([30, 400]);
    expect(r.got.notes, 'a pulse waiting its turn is still waiting on the client').toEqual([20]);
    expect(r.boss._pf.rap, 'the rap\'s three lanes -- row (0 the floor, 1 the platform, 2 the air), spot and height, the beat\'s clock, the phase and the platform -- cross as the compact view').toEqual({ p: [[0, 300, 0], [1, 520, 0], [2, 700, 260]], k: 20, ph: 2, l: [342, 758, 446] });
    expect(r.got.pf.rap, 'and the client\'s boss carries them').toMatchObject({ p: [[0, 300, 0], [1, 520, 0], [2, 700, 260]], k: 20, ph: 2 });
    expect(r.got.ledge, 'a platform pulse\'s note (an inert shot the host moves, always drawn) arrives where the host has it, moving the way it moves').toEqual([[600, 430, 8, 2]]);
    expect(r.got.end).toBe(1);
    expect(r.arena, 'a client draws the boss arena').toBe('warehouse');
    expect(r.look, 'and picks the open-mouth render from the lunge').toBe('facegape');
    expect(r.swallowed, 'the stomach flag rides the fighter').toBeGreaterThan(0);
    expect(r.ice, 'and so does the slip').toBe(120);
  });
});
