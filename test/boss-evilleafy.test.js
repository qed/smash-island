import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { JSDOM } from 'jsdom';
import { loadMonolith } from './helpers/load-monolith.js';
import { mulberry32 } from './helpers/prng.js';

// Boss 7, Evil Leafy, rebuilt in the boss overhaul (2026-09-29): "make the bosses more like springy ... but dont make them like him! make the attacks feel more
// immersive." The Evil Forest, FOUR attacks -- TENDRILS! (the signature, redone: "1 needs a better telegraph." -> BOTH tells: the tendrils coil above her pointing where
// they will strike AND a dark vine line creeps along the floor showing the wave's path, with the gap lit), POSSESSED!, BLACK HOLE! and BEHIND THE TREES! (her glowing eyes
// behind one tree of the backdrop, then she bursts out) -- each a scene from the show, all of them through the boss engine kit (impact, the arena's ground and hazard, its
// ending). She is exempt from the attack-count rule: "unless they have a mechanic, like contact damage and teleporting for evil leafy, that makes it so that they dont
// need extra attacks" (the owner), so her contact hit and her teleport are kept ("Evil leafy level.": One's rebuild copied her contact numbers and keeps them). ROUND 17, the
// owner (2026-10-01): "give me 5 options by boss to increase their difficulty(except evil leafy, give 5 options for nerfing)" -- and the picks: "Evil Leafy (nerfs): softer contact
// (knockback 13 -> 9, grace 75 -> 120 f; One keeps her own copy of the old numbers); fewer teleports (every 300/220/160 f, never right beside you); TENDRILS!' second wave only in
// phase 3." "Harder, same damage": every part of a move shares its one attack id, so a fighter takes at most one boss hit from it. Never tuned for a bot: every number here is
// what the design says.

let W;
beforeAll(async () => { W = loadMonolith().window; await W.eval('profileReady'); });

const ROW = { name: 'Evil Leafy', color: '#ff0100', hp: 185, big: 2.4, attack: 'evilleafy', arena: 'forest', stationary: false, sprite: 'evilleafy' };
const HP = { 1: 1, 2: 0.5, 3: 0.2 };
// A still Firey on the floor at `x` and Evil Leafy spawned the way the gauntlet spawns her (BOSSRUSH.active false: the gauntlet logic off), standing at 200 with her teleport and
// her attack timer held (a test fires the turn it wants). `ph` is her phase (her HP sets it).
const STAGE = (x, ph = 1, bx = 200) => `
  SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
  BOSSRUSH = { active:false, bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.name==='Evil Leafy'; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats=platRectsSmall(); summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; hazardT=0; impactFxClear();
  var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), ${x}, groundY()-24, 0);
  f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
  spawnBossRushBoss();
  var b = summons.find(function(s){ return s.type==='boss'; });
  b.hp = b.maxHp*${HP[ph]}; b._atkTimer = 1e9; b._teleT = 1e9;
  step(); step(); f.pct = 0; f.invuln = 0; f.hitstun = 0; f.x = ${x}; f.y = groundY()-24; f.vx = 0; f.vy = 0; f.onground = true;
  b.x = ${bx}; b.y = groundY() - b.r; b.vx = 0; b.vy = 0;
`;
// Fire move number k (0 the signature, 1 POSSESSED!) of the boss `b` now, leaving the fighter `f` where it is, and run its wind-up out: the frame the move fires is the last
// one this returns from.
const FIRE = (k) => `b._pickForce = ${JSON.stringify(['evilleafy', 'elpossess', 'elhole', 'elbehind'][k])}; b._atkLive = null; b._atkTimer = 1; step(); var telKind = b._telKind, telName = document.getElementById('banner').textContent, tel0 = b._tel;
  for (var w=0; w<90 && b._tel>0; w++){ step(); f.x = FX; f.y = groundY()-24; f.vx = 0; f.vy = 0; f.onground = true; }`;

describe('Evil Leafy takes the Evil Forest', () => {
  // The owner, 2026-10-01 (Round 17): "make the attacks based on fighter position. if there is an attack that punishes being close, then they should use it more when ppl are close." -- "Position
  // picks all (Recommended)": TENDRILS! no longer runs between every other move (TENDRILS!, POSSESSED!, TENDRILS!, BLACK HOLE!, ...). She draws her four by where the fighters stand: none twice in a row.
  it('is Boss 7, red (the owner: "Evil Leafy red with black vines"), with her HP and size as they were, and her turns drawn from TENDRILS!, POSSESSED!, BLACK HOLE! and BEHIND THE TREES!', () => {
    const r = W.eval(`(function(){
      var i = BOSS_ROSTER.findIndex(function(b){ return b.name==='Evil Leafy'; });
      var s = { name:'Evil Leafy', attack:'evilleafy', type:'boss', x:300, y:500, r:81.6, hp:100, maxHp:100, _phase:1, _atkTimer:1, _tel:0, color:'#ff0100', face:1, homeX:300, stationary:false, vx:0, vy:0 };
      var kinds = [], names = [];
      for (var k=0;k<12;k++){ s._atkTimer = 1; s._tel = 0; s._atkLive = null; updateBossAttack(s, null); kinds.push(s._telKind); names.push(bossTelName(s)); }
      return { i: i, row: BOSS_ROSTER[i], mephone: BOSS_ROSTER.findIndex(function(b){ return b.name==='MePhone4'; }), s4: BOSS_ROSTER.findIndex(function(b){ return b.name==='MePhone4S'; }),
        extra: BOSS_EXTRA['Evil Leafy'], kinds: kinds, names: names,
        tel: ['evilleafy','elpossess'].map(function(k){ return bossTelLen({ attack:'evilleafy', _telKind:k }); }),
        gaps: [1,2,3].map(function(ph){ return bossAtkGap({ attack:'evilleafy', _phase:ph }); }), held: bossAtkGap({ attack:'evilleafy', _phase:1, _el:{ k:'tend' } }),
        p2: bossPhaseName({ attack:'evilleafy' }, 2), p3: bossPhaseName({ attack:'evilleafy' }, 3),
        rushOnly: ['elpossess','elhole','elbehind'].map(function(k){ return BOSS_RUSH_ONLY.has(k); }), names2: ['elpossess','elhole','elbehind'].map(function(k){ return BOSS_MOVE_NAME[k]; }) };
    })()`);
    expect(r.row).toEqual(ROW);
    expect(r.i, 'Boss 7, right after MePhone4').toBe(6);
    expect(r.mephone).toBe(5);
    expect(r.s4, 'and before MePhone4S').toBe(7);
    const NAME = { evilleafy: 'TENDRILS!', elpossess: 'POSSESSED!', elhole: 'BLACK HOLE!', elbehind: 'BEHIND THE TREES!' };
    expect(r.kinds.every((k) => NAME[k]), `only her four: ${r.kinds}`).toBe(true);
    expect(r.names, 'the wind-up names the move').toEqual(r.kinds.map((k) => NAME[k]));
    expect(r.kinds.some((k, i) => i > 0 && k === r.kinds[i - 1]), `never the same move twice in a row: ${r.kinds}`).toBe(false);
    expect(new Set(r.kinds).size, `all four come up in twelve turns: ${r.kinds}`).toBe(4);
    expect(r.names2).toEqual(['POSSESSED!', 'BLACK HOLE!', 'BEHIND THE TREES!']);
    expect(r.tel, 'TENDRILS!\'s wind-up is longer than the 45 it was ("1 needs a better telegraph.")').toEqual([56, 34]);
    expect([r.p2, r.p3]).toEqual(['No Refuge', 'Vine Coverage']);
    // "bosses should attack a bit slower" (the owner, 2026-09-30): her own 130 / 95 / 80 times BOSS_PACE (1.2), and held while a move runs on past its wind-up
    expect(r.gaps, 'her own pacing, paced, quicker each phase').toEqual([156, 114, 96]);
    expect(r.held, 'held while a move runs').toBe(1e6);
    expect(r.rushOnly, 'an item boss never throws them: they need her platform, her floor and her forest').toEqual([true, true, true]);
  });

  // The owner, 2026-10-01 (Round 17), her nerfs: "fewer teleports (every 300/220/160 f, never right beside you)" -- it was every 200 / 130 / 100 frames.
  it('she never walks: a statue that turns to face you, and only her teleport (every 300 / 220 / 160 frames) moves her', () => {
    const r = W.eval(`(function(){ var out = {};
      ${STAGE(900, 1, 300)}
      var x0 = b.x; for (var i=0;i<90;i++){ step(); f.x = 900; f.y = groundY()-24; f.vx = 0; f.onground = true; }
      out.still = Math.abs(b.x - x0) < 1; out.face = b.face;
      ${STAGE(900, 1, 100)}
      b._teleT = 1; step(); out.teleported = Math.abs(b.x - 100) > 100 && b.x <= WW*0.34 + 1;   // phase 1: only inside the dark left third
      out.armed = [b._teleT];
      ${STAGE(900, 2, 300)}
      b._teleT = 1; step(); out.p2 = b.x; out.armed.push(b._teleT);
      ${STAGE(900, 3, 300)}
      b._teleT = 1; step(); out.p3 = b.x; out.armed.push(b._teleT);
      out.gaps = [1,2,3].map(function(p){ return EL.teleGap[p]; });
      return out; })()`);
    expect(r.still, 'no walk toward you').toBe(true);
    expect(r.face, 'she turns to you').toBe(1);
    expect(r.teleported, 'phase 1 teleports stay in the left third').toBe(true);
    for (const x of [r.p2, r.p3]) {
      expect(900 - x, 'phase 2 and 3 teleports land 200 to 320 px off you').toBeGreaterThanOrEqual(200 - 1e-6);
      expect(900 - x).toBeLessThanOrEqual(320 + 1e-6);
    }
    expect(r.gaps, 'the cadence by phase').toEqual([300, 220, 160]);
    expect(r.armed, 'a teleport starts the next wait: the gap of the phase').toEqual([300, 220, 160]);
  });

  // Her teleport used to be your x plus or minus 180-320, clamped to the stage (phase 1: to the dark left third) -- and the clamp could drop her right beside you: by a wall, or at the edge of
  // the dark. "never right beside you" (the owner's pick, Round 17): elTeleX keeps her EL.teleNear (200) px off on a side that has room, and with no ground at that distance she stays.
  it('the BOOM never lands right beside you: 200 px off at the least on whichever side has room -- by a wall or at the edge of the dark too -- and with no ground at that distance she stays', () => {
    const r = W.eval(`(function(){ var out = { bad:[], far:[], n:0, nulls:{ 1:[], 2:[], 3:[] }, sides:{ left:0, right:0 }, WW:WW, near:EL.teleNear, span:EL.teleSpan.slice() };
      for (var ph=1; ph<=3; ph++){
        var lo = 80, hi = ph === 1 ? WW*0.34 : WW - 80;
        for (var tx=0; tx<=WW; tx+=10) [0.1, 0.9].forEach(function(a){ [0, 0.5, 1].forEach(function(b){
          var x = elTeleX(tx, ph, a, b); out.n++;
          if (x === null){ out.nulls[ph].push(tx); return; }
          if (x < lo - 1e-9 || x > hi + 1e-9 || Math.abs(x - tx) < EL.teleNear - 1e-9) out.bad.push([ph, tx, a, b, x]);
          if (Math.abs(x - tx) > EL.teleNear + EL.teleSpan[ph] + 1e-9 && x !== hi) out.far.push([ph, tx, a, b, x]);
          if (x < tx) out.sides.left++; else out.sides.right++;
        }); });
      }
      out.wallL = [0, 0.3, 0.7, 1].map(function(b){ return elTeleX(90, 2, 0.1, b); });   // by the left wall, the side that would be the wall is given up
      out.wallR = [0, 0.3, 0.7, 1].map(function(b){ return elTeleX(WW - 90, 2, 0.9, b); });
      return out; })()`);
    expect(r.near, '200 px: past her body and the reach of a fighter, with room to see it land').toBe(200);
    expect(r.span, 'at most 80 (phase 1) or 120 farther than that').toEqual([0, 80, 120, 120]);
    expect(r.n).toBeGreaterThan(1000);
    expect(r.bad, 'every landing is on the ground she may stand on and 200 or more off you: ' + JSON.stringify(r.bad.slice(0, 4))).toEqual([]);
    expect(r.far, 'and within 200 + the span of you, but at the edge of the dark when you are out past it: ' + JSON.stringify(r.far.slice(0, 4))).toEqual([]);
    expect(r.nulls[2], 'phase 2: there is always ground').toEqual([]);
    expect(r.nulls[3], 'phase 3: there is always ground').toEqual([]);
    // phase 1 has no spot only when you stand in the middle of the dark left third (WW*0.34 = 374 wide to its edge): nearer than 200 to both of its ends
    const hi1 = r.WW * 0.34;
    expect(r.nulls[1].length, 'the dark left third has a middle with no spot').toBeGreaterThan(5);
    for (const tx of r.nulls[1]) { expect(tx > hi1 - r.near && tx < 80 + r.near, `no spot at ${tx} only inside (${hi1 - r.near}, ${80 + r.near})`).toBe(true); }
    expect(r.sides.left, 'both sides of you come up').toBeGreaterThan(200);
    expect(r.sides.right).toBeGreaterThan(200);
    for (const x of r.wallL) expect(x, 'by the left wall she is on the open side, 200+ off').toBeGreaterThanOrEqual(90 + 200 - 1e-6);
    for (const x of r.wallR) expect(x, 'and by the right wall').toBeLessThanOrEqual(r.WW - 90 - 200 + 1e-6);
  });

  it('her move teleports her there: never within 200 of any fighter, none of it a hit with no warning, and with nowhere to stand she stays and looks again in 50 frames', () => {
    // 14 teleports with the fighter at `fx` (and `others` standing where they are), her start at `startX` each time. `direct`: elMove(b, f) hunts f (no other fighter can be the one she picks); else the
    // game's own step(). A teleport re-arms the wait (EL.teleGap), a missing spot sets the retry (EL.teleRetry), and `contact` counts landings that overlap a fighter.
    const run = (ph, fx, others, startX, direct) => W.eval(`(function(){ ${STAGE(fx, ph, startX)}
      var xs = ${JSON.stringify(others)}, gs = xs.map(function(x){ var g = makeFighter(ROSTER.find(function(r){ return r.name==='Pillow'; }), x, groundY()-24, 1); g.team=0; g.controller='still'; g.stocks=9; fighters.push(g); return g; });
      var res = { xs:[], pct:0, stay:0, go:0, retry:null, contact:0 };
      for (var k=0;k<14;k++){
        b.x = ${startX}; b.y = groundY() - b.r; b._teleT = 1; b._tel = 0; b._el = null; b.hover = false;
        f.x = ${fx}; f.y = groundY()-24; f.vx = 0; f.vy = 0; f.invuln = 0; f.pct = 0; f.hitstun = 0;
        gs.forEach(function(g, i){ g.x = xs[i]; g.y = groundY()-24; g.vx = 0; g.vy = 0; });
        ${direct ? 'elMove(b, f);' : 'step();'}
        res.pct += f.pct; res.xs.push(Math.round(b.x));
        if (b._teleT === EL.teleRetry){ res.stay++; res.retry = b._teleT; } else if (b._teleT === EL.teleGap[${ph}]) res.go++;
        if (fighters.some(function(q){ return !q.dead && hurtGap(q, b.x, b.y) < b.r; })) res.contact++;
      }
      return res; })()`);
    const alone = [[1, 100, 1000], [1, 330, 80], [1, 900, 80], [2, 60, 1000], [2, 560, 1000], [2, 1040, 100], [3, 90, 1000], [3, 1010, 100]];
    for (const [ph, x, start] of alone) {
      const o = run(ph, x, [], start, false);
      expect(o.pct, `phase ${ph}, you at ${x}: the BOOM is never a hit`).toBe(0);
      expect(o.contact, `phase ${ph}, you at ${x}: she never lands touching you`).toBe(0);
      expect(o.go, `phase ${ph}, you at ${x}: there is ground, so she goes every time`).toBe(14);
      for (const bx of o.xs) expect(Math.abs(bx - x), `phase ${ph}, you at ${x}: she landed at ${bx}`).toBeGreaterThanOrEqual(200 - 1);
    }
    const mid = run(1, 227, [], 80, false);
    expect(mid.stay, 'phase 1, you in the middle of the dark: no ground 200 from you, so she stays').toBe(14);
    expect(mid.retry, 'and looks again in 50 frames').toBe(50);
    expect([mid.pct, mid.contact, mid.xs.every((x) => x === 80)]).toEqual([0, 0, true]);
    // another fighter on the side she would take: she takes the other; one on each side: none, and she stays
    const one = run(2, 560, [300], 1000, true);
    expect(one.go, 'a fighter at 300 takes the left of you: she still goes').toBe(14);
    for (const bx of one.xs) expect(bx, 'she lands on the right of you, 200+ off the other').toBeGreaterThanOrEqual(760 - 1);
    expect(one.contact).toBe(0);
    const both = run(2, 560, [300, 820], 1000, true);
    expect(both.stay, 'a fighter on each side: she does not land beside either').toBe(14);
    expect(both.retry).toBe(50);
    expect(both.xs.every((x) => x === 1000)).toBe(true);
  });

  // The owner, 2026-10-01 (Round 17), her nerfs: "softer contact (knockback 13 -> 9, grace 75 -> 120 f; One keeps her own copy of the old numbers)". The hit itself is as it was: 0.6 of a boss
  // hit, thrown -12 up. One's contact copied her numbers for "Evil leafy level." (the owner, 2026-09-29) and keeps them: it reads its own ONE_CONTACT, not hers.
  it("her contact hit is softer: still 0.6 of a boss hit and -12 up, but knocked 9 (was 13) with 120 frames of grace (was 75); One has none at all now", () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1, 300)}
      var dmg = BOSS_DMG_BASE, kb = function(kx){ f.pct = 0; f.invuln = 0; f.hitstun = 0; f.vx = 0; f.vy = 0; applyHit(f, dmg*0.6, kx, -12, null, { bossAtk: ++BOSS_ATK_ID }); return f.vx; };
      var v13 = kb(13), v9 = kb(9);
      f.pct = 0; f.invuln = 0; f.hitstun = 0; f.vx = 0; f.vy = 0; f.x = b.x + 20; f.y = b.y; step();
      var out = { pct: f.pct, want: dmg*0.6, vx: f.vx, vy: f.vy, invuln: f.invuln, v13: v13, v9: v9, kx: EL.touchKX, grace: EL.touchGrace };
      var src = String(updateBossAttack); out.src = [src.indexOf('bossDmg()*0.6') >= 0, src.indexOf('*EL.touchKX;') >= 0, src.indexOf('kx, -12') >= 0, src.indexOf('Math.max(f.invuln, EL.touchGrace)') >= 0];
      // the grace: no second bump while it lasts (a hit at the old 75 would come again at once), a bump again when it is over
      var last = f.pct, again = null;
      for (var i=1;i<=160;i++){ b.x = f.x - 20; b.y = f.y; b._atkTimer = 1e9; step(); if (again === null && f.pct > last + 1e-9) again = i; }
      out.again = again;
      // asleep inside a tree or sunk into the platform, she touches no one
      b._el = { k:'pos', st:'in' }; f.invuln = 0; f.pct = 0; f.x = b.x; f.y = b.y; b.hover = true; var y0 = b.y; step(); out.sunk = f.pct;
      // One has no contact damage at all now ("remove the damage-box for one", the owner, 2026-10-06), so nothing of hers is read
      out.oneGone = typeof ONE_CONTACT === 'undefined' && typeof oneContact === 'undefined';
      return out; })()`);
    expect(r.pct, 'the hit itself is as it was: 0.6 of a boss hit').toBeCloseTo(r.want, 5);
    expect([r.kx, r.grace], 'her numbers: knocked 9, 120 frames of grace').toEqual([9, 120]);
    expect(r.src, 'her contact check reads them (and the -12 and the 0.6 are as they were)').toEqual([true, true, true, true]);
    expect(r.vx, 'knocked 9 (away from her): the knock a 9 gives, softer than the 13 it was').toBeCloseTo(r.v9, 3);
    expect(r.vx).toBeLessThan(r.v13 - 2);
    expect(r.vy, 'still thrown up').toBeLessThan(-8);
    expect(r.invuln, 'the grace is 120 frames (119 once the step has run)').toBeGreaterThanOrEqual(119);
    expect(r.again, 'no second bump for 120 frames, and one once it is over').toBeGreaterThanOrEqual(119);
    expect(r.again).toBeLessThanOrEqual(124);
    expect(r.sunk, 'sunk into the platform she touches no one').toBe(0);
    expect(r.oneGone, "One has no contact damage at all: \"remove the damage-box for one\" (the owner, 2026-10-06)").toBe(true);
  });
});

// ==== TENDRILS! ======================================================================================================================================
describe('TENDRILS!: a wave of black vines along the floor, one gap two vines wide, with both tells', () => {
  it('the wind-up fixes the row and the gap now (the tell is the hitbox): the gap is two vines wide, lit, away from you, and no vine of the wave stands in it', () => {
    const r = W.eval(`(function(){ var FX = 700; ${STAGE(700)}
      ${FIRE(0)}
      var w = b._hz.tw[0], vines = (b._hz.v || []).slice();
      var out = { kind: telKind, name: telName, tel0: tel0, w: w, ts: w[6], tf: w[7], hz: hazardT, vines: vines.length };
      out.row = { x0: w[0], dir: w[1], n: w[2], gi: w[3], g0: w[4], g1: w[5] };
      out.xs = []; for (var i=0;i<w[2];i++) out.xs.push(elVineX(w, i));
      out.vSpace = EL.vSpace; out.vHalf = EL.vHalf; out.off = Math.abs((w[4] + w[5])/2 - 700);
      // after the fire: the vines of the wave, none in the gap
      step(); var v = b._hz.v; out.after = v.length; out.inGap = v.filter(function(q){ return q[0] > w[4] - EL.vHalf + 1 && q[0] < w[5] + EL.vHalf - 1; }).length;
      out.ids = Object.keys(v.reduce(function(o, q){ o[q[3]] = 1; return o; }, {})).length;
      return out; })()`);
    expect(r.kind).toBe('evilleafy');
    expect(r.name).toBe('TENDRILS!');
    expect(r.tel0, 'the wind-up is 56 frames').toBe(56);
    expect(r.row.n, 'a row runs from her side to the wall: long enough to hold a gap').toBeGreaterThanOrEqual(6);
    expect(r.row.dir, 'toward you').toBe(1);
    expect(r.xs[1] - r.xs[0]).toBe(r.vSpace);
    // the gap's free ground: three vine spacings between the vines either side of it, less a half-width each, so 108 wide
    expect(r.row.g1 - r.row.g0, 'two vines wide').toBe(3*r.vSpace - 2*r.vHalf);
    expect(r.off, 'set 210 from where you stood (phase 1), so standing still is not an answer').toBeGreaterThan(150);
    expect(r.ts, 'the tell starts with the wind-up and ends with the fire').toBeLessThan(r.tf);
    expect(r.inGap, 'no vine in the gap').toBe(0);
    expect(r.ids, 'the whole wave is one attack').toBe(1);
  });

  it('the vines erupt from her side outward, one every 6 frames, tall enough to hit a jump (and the platform), hold, and fall; a stump lies where each stood', () => {
    const r = W.eval(`(function(){ var FX = 1000; ${STAGE(1000)}
      ${FIRE(0)}
      var out = { t0: hazardT }, w = b._hz.tw[0], gy = groundY(), seen = {}, order = [], hs = {};
      f.invuln = 9999;
      for (var i=0;i<200;i++){
        step(); f.x = 1000; f.y = groundY()-24; f.invuln = 9999;
        (b._hz.v || []).forEach(function(q){ var h = elVineH(q, hazardT); hs[q[0]] = Math.max(hs[q[0]] || 0, h); if (h > 0 && !seen[q[0]]){ seen[q[0]] = hazardT; order.push(q[0]); } });
      }
      out.order = order; out.times = order.map(function(x){ return seen[x] - seen[order[0]]; }); out.hs = order.map(function(x){ return hs[x]; });
      out.life = elVineLife([0, 0, 200, 0]); out.stumpLeft = (b._hz.v || []).length; out.stump = EL.vStump;
      out.dir = w[1];
      return out; })()`);
    expect(r.order.length, 'a long row of vines').toBeGreaterThan(8);
    // outward from her: x rising (she is at 200, you are to her right)
    expect(r.order.every((x, i) => i === 0 || x > r.order[i - 1]), 'in order, away from her').toBe(true);
    const gaps = r.times.slice(1).map((t, i) => t - r.times[i]);
    expect(gaps.every((g) => g === 6 || g === 18), `one every 6 frames (18 across the gap, three vines' worth): ${gaps}`).toBe(true);
    expect(Math.min(...r.hs), 'every vine grows past a single jump (126 px)').toBeGreaterThanOrEqual(184);
    expect(r.life, 'grow (20 frames at 10 a frame), hold 8, fall 10').toBe(20 + 8 + 10);
  });

  it('a vine is a full boss hit through the move\'s one id: standing in the row costs one hit however many vines come, standing in the lit gap costs nothing', () => {
    const r = W.eval(`(function(){ var out = {};
      // the fighter starts at 700 (the wind-up fixes the row from there), then stands where \`at(w)\` says -- in the row's path, or in its gap -- for the whole wave
      var run = function(at){ ${STAGE(700)}
        b._pickForce = 'evilleafy'; b._atkLive = null; b._atkTimer = 1; step(); var w = b._hz.tw[0], fx = at(w); out.w = w;
        for (var i=0;i<260;i++){ step(); f.x = fx; f.y = groundY()-24; f.vx = 0; f.vy = 0; f.onground = true; }
        return f.pct; };
      out.inRow = run(function(w){ return Math.round(elVineX(w, 8)); });
      out.inGap = run(function(w){ return Math.round((w[4] + w[5])/2); });
      out.dmg = bossDmg();
      return out; })()`);
    expect(r.inRow, 'one vine hits for a full boss hit and the rest of the wave adds nothing (one attack id)').toBeCloseTo(r.dmg, 5);
    expect(r.inGap, 'standing in the lit gap costs nothing').toBe(0);
  });

  it('both tells are drawn: the dark line creeping along the floor with the gap lit, and the coils above her; they are fixed on the wind-up, and a client draws them from b._hz', () => {
    const r = W.eval(`(function(){ var FX = 700; ${STAGE(700)} ${FIRE(0)}
      var out = { err: null };
      // mid wind-up: draw the arena hazard's 'under' layer and the boss (her tell slot draws the coils)
      ${STAGE(700)}
      b._pickForce = 'evilleafy'; b._atkLive = null; b._atkTimer = 1; step();
      for (var k=0;k<30;k++){ step(); f.x = 700; f.y = groundY()-24; f.vx = 0; f.onground = true; }
      var w = b._hz.tw[0]; out.mid = [hazardT, w[6], w[7]];
      var calls = { lines:0, rects:0, curves:0 }, rec = new Proxy({}, { get: function(_t, p){
        if (p === 'canvas') return { width:1100, height:720 };
        if (p === 'measureText') return function(){ return { width:0 }; };
        if (p === 'createLinearGradient' || p === 'createRadialGradient') return function(){ return { addColorStop:function(){} }; };
        return function(){ if (p === 'lineTo') calls.lines++; if (p === 'fillRect') calls.rects++; if (p === 'quadraticCurveTo') calls.curves++; }; }, set: function(){ return true; } });
      try {
        elTellFloor(rec, w, hazardT, groundY()); out.floor = JSON.stringify(calls);
        calls.lines = calls.rects = calls.curves = 0;
        ctx.save(); elCoils(rec, b, w, hazardT); ctx.restore(); out.coils = JSON.stringify(calls);
        drawArenaHazard('under'); drawArenaHazard('over'); summons.forEach(drawSummon); elFxDraw(b); draw();
      } catch(e){ out.err = e.message + ' ' + (e.stack||'').split('\\n')[1]; }
      // the snapshot carries it: a client draws the same from b._hz
      var snap = JSON.parse(JSON.stringify(serializeState()));
      out.snapHz = JSON.stringify(snap.summons.find(function(m){ return m.attack === 'evilleafy'; })._hz.tw);
      out.hz = JSON.stringify(b._hz.tw);
      return out; })()`);
    expect(r.err).toBe(null);
    expect(JSON.parse(r.floor).lines, 'the creeping line is drawn').toBeGreaterThan(3);
    expect(JSON.parse(r.floor).rects, 'and the gap is lit (a column of light and bright ground)').toBeGreaterThanOrEqual(2);
    expect(JSON.parse(r.coils).curves, 'five coils above her').toBeGreaterThanOrEqual(10);
    expect(r.snapHz, 'a netcode client gets the tell whole').toBe(r.hz);
  });

  // The owner, 2026-10-01 (Round 17), her nerfs: "TENDRILS!' second wave only in phase 3." -- it came from phase 2; phase 2 now has the first wave only.
  it('phase 3 only adds a second wave where you dodged to -- a short row of eleven vines that comes up toward its gap, its tell short, begun once the ground it covers is clear of the first wave; phase 2 is the first wave alone', () => {
    const r = W.eval(`(function(){ var out = {};
      [2, 3].forEach(function(ph){
        var FX = 600; ${STAGE(600, 1, 100)}
        b.hp = b.maxHp*(ph === 3 ? ${HP[3]} : ${HP[2]});
        step(); f.x = 600;
        ${FIRE(0)}
        var w1 = b._hz.tw[0].slice(), T1 = hazardT, tellAt = null, live = null;
        for (var i=0;i<260;i++){ step(); f.x = 600; f.y = groundY()-24; f.vx = 0; f.onground = true; f.invuln = 9999;
          if (b._hz.tw && b._hz.tw[1] && tellAt == null){ tellAt = hazardT; live = (b._hz.v || []).filter(function(v){ return Math.abs(v[0] - 600) < EL.win2R && elVineH(v, hazardT) >= EL.vMinH; }).length; }
          if (!b._el) break; }
        var w2 = (b._hz.tw && b._hz.tw[1]) ? b._hz.tw[1].slice() : null;
        var vines2 = (b._hz.v || []).filter(function(v){ return w2 && v[1] > w2[7]; }).sort(function(p, q){ return p[1] - q[1]; });
        out[ph] = { w1: w1, w2: w2, tell2: w2 && (w2[7] - w2[6]), after: tellAt - T1, live: live, waves: ph, ev: EL.vEvery[ph], nW: EL.waves[ph],
                    slots: vines2.map(function(v){ return Math.round((v[0] - w2[0])/(w2[1]*EL.vSpace)) + 0; }), times: vines2.map(function(v){ return v[1] - vines2[0][1]; }),
                    off: w2 && Math.abs((w2[4] + w2[5])/2 - 600), done: !b._el };
      });
      out.waves = EL.waves.slice(1);
      return out; })()`);
    expect(r[2].nW, 'phase 2: one wave a turn').toBe(1);
    expect(r[2].w2, 'and no second wave comes').toBe(null);
    expect(r[2].done, 'the turn is over with the first wave').toBe(true);
    expect(r.waves, 'EL.waves by phase: one, one, then two').toEqual([1, 1, 2]);
    {
      const o = r[3], w2 = o.w2;
      expect(o.nW, 'phase 3: two waves a turn').toBe(2);
      expect(w2, 'phase 3: the second wave came').toBeTruthy();
      expect(o.after, 'its tell begins no sooner than 40 frames after the first wave went in').toBeGreaterThanOrEqual(40);
      expect(o.live, 'and on ground the first wave has left clear: no vine of it standing within reach of where you stand').toBe(0);
      expect([w2[2], w2[3]], 'eleven vines, its gap the eighth and ninth').toEqual([11, 8]);
      expect(w2[5] - w2[4], 'two vines wide').toBe(3*54 - 2*27);
      expect(o.off, 'a few vines from where you stand: 189 px').toBe(189);
      // the vines come up from the far end and run toward the gap: slots 0..7, then the last, 10, and the gap's neighbours last
      expect(o.slots, 'every slot but the gap, in order').toEqual([0, 1, 2, 3, 4, 5, 6, 7, 10]);
      expect(o.times[o.times.length - 1], 'the last is the farthest along').toBe(10*o.ev + 0);
      expect(o.done, 'and then the move is over').toBe(true);
      expect(o.tell2, 'a short second tell: 30 frames').toBe(30);
      expect(o.ev, 'the vines come every 4 frames').toBe(4);
    }
  });

  it('the second wave never puts its gap on top of her, off the stage, or across her from you (her touch is a hit of its own), and moves it a vine or two nearer or farther if that is the only way to one you can reach', () => {
    const r = W.eval(`(function(){ var out = {}, bad = [], n = 0, shifted = 0, none = 0;
      for (var bx = 100; bx <= 1000; bx += 150) for (var tx = 100; tx <= 1000; tx += 50){
        if (Math.abs(tx - bx) < 140) continue;
        [1, -1].forEach(function(pref){
          var row = elRow2(tx, pref, bx); n++;
          if (!row){ none++; return; }
          var mid = (row.g0 + row.g1)/2, onStage = row.g0 >= EL.rowWall && row.g1 <= WW - EL.rowWall, across = Math.min(tx, mid) < bx + 118 && Math.max(tx, mid) > bx - 118, dist = Math.abs(mid - tx);
          if (Math.abs(dist - 189) > 1) shifted++;
          if (!onStage || across) bad.push([bx, tx, pref, row.g0, row.g1]);
        });
      }
      out.n = n; out.bad = bad.slice(0, 8); out.badN = bad.length; out.shifted = shifted; out.none = none; return out; })()`);
    expect(r.n).toBeGreaterThan(100);
    expect(r.badN, 'no gap off the stage or behind her: ' + JSON.stringify(r.bad)).toBe(0);
    expect(r.shifted, 'some had to be moved off 189 px, and none was not').toBeGreaterThan(0);
    expect(r.none, 'and a fighter cornered between her and the wall gets no second wave (a few places in a hundred), not an unfair one').toBeLessThan(r.n*0.1);
  });
});

// ==== POSSESSED! =====================================================================================================================================
describe('POSSESSED!: she sinks into the platform, it is hers for a few seconds, and she is expelled out of its middle', () => {
  it('the wind-up puts her on the platform\'s middle and sinks her into it as it glows red; the whole possession is laid out now', () => {
    const r = W.eval(`(function(){ var FX = 700; ${STAGE(700)}
      ${FIRE(1)}
      var P = elPlat(), out = { kind: telKind, name: telName, tel0: tel0, pos: b._hz.pos.slice(), plat: [P.x, P.y, P.w], th: (b._hz.th || []).length, el: b._el && b._el.k, sunk: [b.x, b.y, b.hover] };
      out.r = b.r; out.tf = b._hz.pos[3]; out.hz = hazardT;
      out.thrashes = b._hz.th.map(function(e){ return [e[0], e[1] - b._hz.pos[3], e[2]]; });
      return out; })()`);
    expect(r.kind).toBe('elpossess');
    expect(r.name).toBe('POSSESSED!');
    expect(r.tel0, 'the 30-frame glow is the fair warning (34)').toBe(34);
    expect(r.pos[0], 'her middle is the platform\'s').toBe(Math.round(r.plat[0] + r.plat[2]/2));
    expect(r.pos[1]).toBe(Math.round(r.plat[1]));
    expect([r.pos[7], r.pos[8]], 'phase 1: the platform alone, no patch of floor').toEqual([0, 0]);
    expect(r.pos[4] - r.pos[3], 'hers for 180 frames in phase 1').toBe(180);
    expect(r.el).toBe('pos');
    expect(r.sunk[0]).toBe(r.pos[0]);
    expect(r.sunk[1], 'sunk: her middle below the platform top, her render hidden above it').toBeCloseTo(r.pos[1] + r.r*1.08, 1);
    expect(r.sunk[2], 'she is held (hover): no gravity, no floor').toBe(true);
    expect(r.th, 'a thrash every 36 frames across the possession').toBeGreaterThanOrEqual(4);
    expect(r.thrashes.every((e) => e[1] >= 24 && e[2] === r.pos[1]), 'each after its 24-frame mark, on the platform top').toBe(true);
    // not left to right: a place you have learnt is not safe
    const xs = r.thrashes.map((e) => e[0]);
    expect(xs.slice(0, 4).every((x, i) => i === 0 || x !== xs[i - 1]) && !(xs[0] < xs[1] && xs[1] < xs[2] && xs[2] < xs[3])).toBe(true);
  });

  it('a thrash is marked first, then a vine comes up out of the platform: a 0.8 boss hit, thrown off it, to a fighter on it and to none on the floor; one hit however many thrash', () => {
    const r = W.eval(`(function(){ var out = {};
      var run = function(onPlat, fx){ var FX = fx; ${STAGE(500)}
        var P = elPlat(); f.x = fx; f.y = onPlat ? P.y - 24 : groundY()-24; f.onground = true;
        b._pickForce = 'elpossess'; b._atkLive = null; b._atkTimer = 1; step(); var marks = 0, up = 0, tEnd = b._hz.pos[4], before = null;
        for (var i=0;i<330;i++){
          step(); f.x = fx; f.y = onPlat ? P.y - 24 : groundY()-24; f.vx = 0; f.vy = 0; f.onground = true;
          (b._hz.th || []).forEach(function(e){ var u = hazardT - e[1]; if (u > -EL.thMark && u < 0) marks++; if (u >= 0 && u < EL.thUp && elThrashH(u) > 30) up++; });
          if (f.pct > 0 && out['hit' + onPlat] == null){ out['hit' + onPlat] = { t: i, vx: f.vx, vy: f.vy }; }
          if (hazardT === tEnd - 1) before = f.pct;   // what the thrashes alone cost, before the expelling BOOM and her fall
        }
        return { pct: before, marks: marks, up: up }; };
      out.plat = run(true, 450); out.floor = run(false, 450); out.dmg = bossDmg();
      return out; })()`);
    expect(r.plat.marks, 'the surface is marked before a thrash').toBeGreaterThan(0);
    expect(r.plat.pct, 'on the platform: a boss hit, capped at one (0.8 each, two of them make a whole)').toBeGreaterThan(r.dmg*0.79);
    expect(r.plat.pct, 'one attack id: never more than a whole boss hit').toBeLessThanOrEqual(r.dmg + 1e-6);
    expect(r.floor.pct, 'the floor under it is safe').toBe(0);
  });

  it('she is expelled out of its middle with a BOOM that throws off whoever is on it, comes down on the floor, and the platform is clean after', () => {
    const r = W.eval(`(function(){ var FX = 450; ${STAGE(450)}
      var P = elPlat(); b._pickForce = 'elpossess'; b._atkLive = null; b._atkTimer = 1; step();
      var log = [], hits = [], scars0 = 0;
      for (var i=0;i<420;i++){
        step(); f.x = FX; f.y = groundY()-24; f.vx = 0; f.vy = 0; f.onground = true; f.invuln = 9999;
        if (b._el && b._el.st === 'pop' && !log.length) log.push({ i: i, vy: b.vy, hover: b.hover, y: b.y, impacts: IMPACT_OUT.length });
        if (!b._el && b._telKind === 'elpossess' && log.length === 1){ log.push({ i: i, y: b.y, floorY: groundY() - b.r, timer: b._atkTimer, hover: !!b.hover }); break; }
      }
      return { log: log, scars: IMPACT_SCARS.length }; })()`);
    expect(r.log[0].vy, 'thrown up out of the platform').toBeLessThan(-8);
    expect(r.log[0].hover, 'free again: gravity').toBe(false);
    expect(r.log[1].y, 'she lands on the floor').toBeCloseTo(r.log[1].floorY, 0);
    expect(r.log[1].timer, 'and her next turn is a paced gap away (156 in phase 1, one frame counted down already)').toBe(155);
  });

  it('phase 3 possesses a patch of floor with the platform, and thrashes come out of both', () => {
    const r = W.eval(`(function(){ var FX = 900; ${STAGE(900, 3)}
      var P = elPlat(); b._pickForce = 'elpossess'; b._atkLive = null; b._atkTimer = 1; step();
      var Pz = b._hz.pos.slice(), th = b._hz.th.slice();
      return { pos: Pz, gy: Math.round(groundY()), onFloor: th.filter(function(e){ return e[2] === Math.round(groundY()); }).length, onPlat: th.filter(function(e){ return e[2] === Pz[1]; }).length, dur: Pz[4] - Pz[3] }; })()`);
    expect(r.pos[8], 'a patch of floor, 230 wide').toBe(230);
    expect(r.pos[7]).toBeGreaterThan(0);
    expect(r.onFloor).toBeGreaterThan(2);
    expect(r.onPlat).toBeGreaterThan(2);
    expect(r.dur, 'hers longer in phase 3').toBe(250);
  });
});

// ==== BLACK HOLE! ====================================================================================================================================
describe('BLACK HOLE!: she flies up, a void opens on the floor under the middle of the stage, and it pulls', () => {
  it('the wind-up flies her up over the middle and lays the void out on the floor under the platform: core and reach by phase, and no pull yet', () => {
    const r = W.eval(`(function(){ var out = {}, FX = 300;
      [1, 2, 3].forEach(function(ph){
        ${STAGE(300, 1, 200)}
        b.hp = b.maxHp*(ph === 3 ? ${HP[3]} : (ph === 2 ? ${HP[2]} : 1)); step(); f.x = 300; f.y = groundY()-24; f.vx = 0; f.onground = true;
        ${FIRE(2)}
        var P = elPlat(), B = b._hz.bh.slice();
        out[ph] = { kind: telKind, name: telName, tel0: tel0, bh: B, mid: Math.round(P.x + P.w/2), gy: Math.round(groundY()), b: [Math.round(b.x), Math.round(b.y), b.hover], fvx: f.vx };
      });
      return out; })()`);
    expect(r[1].kind).toBe('elhole');
    expect(r[1].name).toBe('BLACK HOLE!');
    expect(r[1].tel0).toBe(54);
    for (const ph of [1, 2, 3]) {
      const B = r[ph].bh;
      expect([B[0], B[1]], 'on the floor under the middle of the platform').toEqual([r[ph].mid, r[ph].gy - 46]);
      expect(B[4] - B[3], 'open for 130 / 160 / 190 frames').toBe([0, 130, 160, 190][ph]);
      expect([B[5], B[6]], 'core and reach by phase').toEqual([[34, 270], [42, 340], [50, 410]][ph - 1]);
      expect(Math.abs(r[ph].b[0] - r[ph].mid), 'she has flown over the middle').toBeLessThan(40);
      expect(r[ph].b[1], 'and up, over the platform').toBeLessThan(r[ph].gy - 200);
      expect(r[ph].b[2], 'held in the air (hover)').toBe(true);
      expect(Math.abs(r[ph].fvx), 'no pull in the wind-up').toBeLessThan(0.5);
    }
  });

  it('it pulls fighters in -- gently, a runner out-accelerates it -- and the core is a 0.8 boss hit that throws them out of it, once however long they stay; the platform above is safe', () => {
    const r = W.eval(`(function(){ var out = {};
      var go = function(fx, onPlat, frames){ var FX = fx; ${STAGE(300, 1, 200)}
        var P = elPlat(); f.x = fx; f.y = onPlat ? P.y - 24 : groundY() - 24; f.onground = true;
        b._pickForce = 'elhole'; b._atkLive = null; b._atkTimer = 1; step(); var B = b._hz.bh, x0 = f.x, xAt = null, vxs = [];
        for (var i=0;i<frames;i++){
          step(); if (!onPlat){ f.y = groundY() - 24; f.onground = true; } else { f.y = P.y - 24; f.vy = 0; f.onground = true; }
          if (hazardT === B[3] + 50) xAt = f.x;   // fifty frames after it opened, before a fighter left alone has reached the core
          vxs.push(Math.abs(f.vx));
        }
        return { x: Math.round(xAt != null ? xAt : f.x), pct: f.pct, mid: B[0], rc: B[5], vmax: Math.max.apply(null, vxs.slice(0, 120)) }; };
      out.near = go(400, false, 150);        // 150 from the middle, inside the reach (270): drifts in
      out.far = go(100, false, 150);         // 450 away: outside it
      out.plat = go(600, true, 190);         // standing on the platform the whole time
      out.runPull = EL.holePull; out.move = MOVE;
      out.dmg = bossDmg();
      return out; })()`);
    expect(r.near.x, 'a fighter inside the reach is drawn toward the middle').toBeGreaterThan(430);
    expect(r.far.x, 'a fighter outside it is not').toBe(100);
    expect(r.runPull.slice(1).every((g) => g < r.move), 'the pull at its hardest is under a fighter\'s own run acceleration (0.9): it can always be run out of').toBe(true);
    expect(r.near.vmax, 'gentle: nowhere near a launch').toBeLessThan(8);
    expect(r.plat.pct, 'on the platform, above the void: safe, and she is hanging over the middle').toBe(0);
  });

  it('the core is a boss hit of 0.8, thrown out of it; once however long you stay (one attack id); and the fighters\' shots curve in and are eaten at the core, hers are not', () => {
    const r = W.eval(`(function(){ var out = {};
      ${STAGE(550, 1, 200)}
      b._pickForce = 'elhole'; b._atkLive = null; b._atkTimer = 1; step();
      for (var w=0; w<90 && b._tel>0; w++){ step(); f.x = 550; f.y = groundY()-24; f.vx = 0; f.onground = true; }
      var B = b._hz.bh, first = null, last = 0;
      f.pct = 0; f.invuln = 0;
      for (var i=0;i<150;i++){ step(); f.x = B[0]; f.y = B[1]; f.vx = 0; f.vy = 0; f.invuln = Math.min(f.invuln, 0); if (f.pct > last + 0.01){ if (first == null) first = f.pct - last; last = f.pct; } }
      out.pct = f.pct; out.first = first; out.dmg = bossDmg();   // (held in the core with no grace at all: every frame could hit)
      // a fighter's shot aimed past the void bends toward it; one that reaches the core is eaten; a boss shot does not
      ${STAGE(250, 1, 200)}
      b._pickForce = 'elhole'; b._atkLive = null; b._atkTimer = 1; step(); for (var w=0; w<90 && b._tel>0; w++){ step(); f.x = 250; f.y = groundY()-24; f.vx = 0; f.onground = true; }
      var B2 = b._hz.bh, gy = groundY();
      for (var w=0; w<30; w++) step();   // let it open
      var mine = { x:B2[0] - 200, y:B2[1] - 90, vx:8, vy:0, r:8, owner:0, ownerObj:f, dmg:1, kb:1, life:200, color:'#fff', noAim:true }, boss = { x:B2[0] - 200, y:B2[1] - 90, vx:8, vy:0, r:8, owner:-2, ownerObj:{ team:-1, idx:-2 }, dmg:1, kb:1, life:200, color:'#f00', noAim:true };
      projectiles = [mine, boss];
      for (var j=0;j<20;j++) step();
      out.mineVy = mine.vy; out.bossVy = boss.vy;
      mine.x = B2[0] - 20; mine.y = B2[1]; mine.life = 100; step(); out.eaten = mine.life <= 0;
      return out; })()`);
    expect(r.first, 'the core is a 0.8 hit').toBeCloseTo(r.dmg*0.8, 5);
    expect(r.pct, 'and a fighter held in it with no grace at all still takes no more than one boss hit from the whole move (one attack id)').toBeLessThanOrEqual(r.dmg + 1e-6);
    expect(r.mineVy, 'the fighter\'s shot is bent toward the void (down: the void is lower)').toBeGreaterThan(0.2);
    expect(r.bossVy, 'a boss shot is not pulled').toBe(0);
    expect(r.eaten, 'what reaches the core is gone').toBe(true);
  });

  it('the void closes, she drops back where it was and lands, and her next turn is a paced gap away; the void and its pull rode the snapshot and are drawn from it', () => {
    const r = W.eval(`(function(){ var FX = 700; ${STAGE(700, 1, 200)}
      b._pickForce = 'elhole'; b._atkLive = null; b._atkTimer = 1; step();
      var out = { err: null }, B, seen = false;
      for (var i=0;i<400;i++){
        step(); f.x = 700; f.y = groundY()-24; f.vx = 0; f.onground = true; f.invuln = 9999;
        if (i === 80){ B = b._hz.bh.slice(); out.hz = JSON.stringify(b._hz.bh);
          var snap = JSON.parse(JSON.stringify(serializeState())); out.snapHz = JSON.stringify(snap.summons.find(function(m){ return m.attack === 'evilleafy'; })._hz.bh);
          try { drawArenaHazard('under'); drawArenaHazard('over'); summons.forEach(drawSummon); draw(); } catch(e){ out.err = e.message + ' ' + (e.stack||'').split('\\n')[1]; } }
        if (B && !b._el && hazardT > B[4]){ out.landed = Math.abs(b.y - (groundY() - b.r)) < 1; out.timer = b._atkTimer; out.scale = elHoleScale(B, hazardT); break; }
      }
      out.scaleAtEnd = elHoleScale(B, B[4]); out.scaleOpen = elHoleScale(B, B[3] + EL.holeOpen); out.scaleBefore = elHoleScale(B, B[3]);
      return out; })()`);
    expect(r.err).toBe(null);
    expect(r.hz, 'the void crosses the snapshot as it is').toBe(r.snapHz);
    expect([r.scaleBefore, r.scaleOpen, r.scaleAtEnd], 'closed, open, closed').toEqual([0, 1, 0]);
    expect(r.landed).toBe(true);
    expect(r.timer, 'a paced gap away, one frame counted').toBeGreaterThanOrEqual(155);
  });
});

// ==== BEHIND THE TREES! ==============================================================================================================================
describe('BEHIND THE TREES!: her eyes light behind one tree of the backdrop, then she bursts out and runs the lane', () => {
  it('the wind-up picks a tree that puts the lane through you, lights her eyes behind it and takes her off the stage: nothing touches her and she touches no one', () => {
    const r = W.eval(`(function(){ var FX = 700; ${STAGE(700)}
      f.x = 700;
      b._pickForce = 'elbehind'; b._atkLive = null; b._atkTimer = 1; step();
      var out = { kind: b._telKind, name: document.getElementById('banner').textContent, tel0: b._tel, bt: b._hz.bt.slice(), hid: [] };
      var tree = elTreeX(out.bt[0]);
      // she is below the floor and at the tree's x for the whole wind-up; a fighter on that spot is touched by nothing
      f.x = tree; f.pct = 0; f.invuln = 0;
      for (var w=0; w<90 && b._tel>0; w++){ step(); f.x = tree; f.y = groundY()-24; f.vx = 0; f.onground = true; if (w === 10) out.hid = [Math.round(b.x), Math.round(b.y), groundY()]; }
      out.pctWindup = f.pct; out.L = EL.rushLen[1]; out.tree = tree; out.trees = EL.trees.map(function(q, k){ return elTreeX(k); });
      return out; })()`);
    expect(r.kind).toBe('elbehind');
    expect(r.name).toBe('BEHIND THE TREES!');
    expect(r.tel0).toBe(50);
    const [k, x, ts, tf, dir, x1] = r.bt;
    expect(x, 'the tree is one of the backdrop\'s').toBe(r.trees[k]);
    expect(tf - ts).toBe(50);
    expect(Math.abs(700 - x), 'the lane runs through you, and the burst is not on top of you').toBeGreaterThanOrEqual(200);
    expect(Math.abs(700 - x), '...and reaches you').toBeLessThanOrEqual(r.L - 70);
    expect(dir, 'toward you').toBe(Math.sign(700 - x));
    expect(Math.abs(x1 - x), 'its length by phase (430 in phase 1), or to the wall').toBeLessThanOrEqual(r.L);
    expect(r.hid[1], 'below the floor').toBeGreaterThan(r.hid[2]);
    expect(r.hid[0], 'at the tree').toBe(x);
    expect(r.pctWindup, 'touching nobody').toBe(0);
  });

  it('she bursts out on the frame the wind-up ends, runs the lane at 20 a frame, and is a 0.8 boss hit to a fighter in it, thrown the way she runs; not to one out of it, and not twice', () => {
    const r = W.eval(`(function(){ var out = {};
      var go = function(where){ var FX = 700; ${STAGE(700)}
        b._pickForce = 'elbehind'; b._atkLive = null; b._atkTimer = 1; step(); var B = b._hz.bt.slice(), x = elTreeX(B[0]), dir = B[4], x1 = B[5];
        var fx = where === 'lane' ? Math.round(x + dir*(x1 - x)*dir*0.6) : (where === 'behind' ? x - dir*300 : x + dir*(Math.abs(x1 - x) + 200));
        fx = clamp(fx, 40, WW - 40); f.x = fx; var first = null, last = 0, hits = 0, vx = 0;
        for (var i=0;i<130;i++){
          step(); f.y = groundY()-24; f.onground = true;
          if (b._el && b._el.st === 'rush' && first == null) first = { x: Math.round(b.x), y: Math.round(b.y), at: i };
          if (f.pct > last + 0.01){ hits++; last = f.pct; vx = f.vx; }
          f.x = fx; f.vx = 0;   // (held where it stood: a fighter thrown ahead of her lands wherever it lands, and her contact hit is her own business)
        }
        return { pct: f.pct, hits: hits, first: first, x: x, x1: x1, dir: dir, end: Math.round(b.x), vx: vx }; };
      out.lane = go('lane'); out.behind = go('behind'); out.past = go('past'); out.dmg = bossDmg();
      return out; })()`);
    expect(r.lane.first.x, 'out of the tree').toBe(r.lane.x);
    expect(r.lane.first.y, 'on the floor').toBe(Math.round(r.lane.first.y));
    expect(r.lane.pct, 'a 0.8 boss hit, and only that: her contact hit does not land on top of it').toBeCloseTo(r.dmg*0.8, 5);
    expect(r.lane.hits).toBe(1);
    expect(Math.sign(r.lane.vx), 'thrown the way she runs').toBe(r.lane.dir);
    expect(r.behind.pct, 'a fighter behind the tree is not in the lane').toBe(0);
    expect(r.past.pct, 'nor one beyond where it ends').toBe(0);
    expect(r.lane.end, 'she stops where the lane ends').toBe(r.lane.x1);
  });

  it('from phase 2 a second tree follows at once, the other way if there is one, its eyes lit for a shorter tell; the trees come in turn, not the same one twice', () => {
    const r = W.eval(`(function(){ var out = {};
      [2, 3].forEach(function(ph){
        var FX = 700; ${STAGE(700, 1, 200)}
        b.hp = b.maxHp*(ph === 3 ? ${HP[3]} : ${HP[2]}); step(); f.x = 700;
        b._pickForce = 'elbehind'; b._atkLive = null; b._atkTimer = 1; step();
        var bt1 = b._hz.bt.slice(), seen = [];
        for (var i=0;i<200;i++){ step(); f.x = 700; f.y = groundY()-24; f.vx = 0; f.onground = true; f.invuln = 9999; if (b._el && b._el.st === 'tell' && !seen.length) seen.push(b._hz.bt.slice()); if (!b._el && seen.length) break; }
        out[ph] = { bt1: bt1, bt2: seen[0], done: !b._el, nb: 0 };
      });
      // the trees come in turn
      out.turn = []; for (var n=1;n<=4;n++) out.turn.push(elPickTree(700, 1, n, -1, 0).k);
      return out; })()`);
    for (const ph of [2, 3]) {
      const a = r[ph].bt1, b = r[ph].bt2;
      expect(b, `phase ${ph}: a second tree`).toBeTruthy();
      expect(b[0], 'not the same tree').not.toBe(a[0]);
      expect(b[4], 'the other way').toBe(-a[4]);
      expect(b[3] - b[2], 'a shorter tell').toBe(ph === 3 ? 20 : 28);
      expect(r[ph].done, 'and then she is done').toBe(true);
    }
    expect(new Set(r.turn).size, 'the trees come in turn').toBeGreaterThan(1);
  });

  it('the eyes, the lane and the trees are drawn and ride the snapshot: a client draws the same from b._hz', () => {
    const r = W.eval(`(function(){ var FX = 700; ${STAGE(700)}
      b._pickForce = 'elbehind'; b._atkLive = null; b._atkTimer = 1; step(); for (var k=0;k<30;k++){ step(); f.x = 700; f.y = groundY()-24; f.vx = 0; f.onground = true; }
      var out = { err: null }, snap = JSON.parse(JSON.stringify(serializeState()));
      out.hz = JSON.stringify(b._hz.bt); out.snapHz = JSON.stringify(snap.summons.find(function(m){ return m.attack === 'evilleafy'; })._hz.bt);
      try { drawArenaDecor('forest'); drawArenaHazard('under'); drawArenaHazard('over'); summons.forEach(drawSummon); draw(); } catch(e){ out.err = e.message + ' ' + (e.stack||'').split('\\n')[1]; }
      return out; })()`);
    expect(r.err).toBe(null);
    expect(r.hz).toBe(r.snapHz);
  });
});

// ==== THE EVIL FOREST ================================================================================================================================
// A recording canvas context: every call it is asked for, with the arguments, and every colour stop a gradient is given.
const REC = `var rec = function(){ var calls = [], stops = []; var c = new Proxy({}, { get: function(_t, p){
    if (p === 'canvas') return { width:1100, height:720 };
    if (p === 'measureText') return function(){ return { width:0 }; };
    if (p === 'createRadialGradient' || p === 'createLinearGradient') return function(){ calls.push([p].concat([].slice.call(arguments))); return { addColorStop: function(pos, col){ stops.push(col); } }; };
    return function(){ calls.push([p].concat([].slice.call(arguments))); }; }, set: function(){ return true; } }); return { c: c, calls: calls, stops: stops }; };`;
describe('the Evil Forest: its sky and ground, the dark that follows her and widens by phase, the vine curtains of phase 3', () => {
  it('has its sky, its dark-grass ground, its hazard, its decor and its ending, and the arena key a netcode client would take', () => {
    const r = W.eval(`({ sky: BOSS_ARENA_SKY.forest, ground: BOSS_ARENA_GROUND.forest && [BOSS_ARENA_GROUND.forest.fill, BOSS_ARENA_GROUND.forest.line, typeof BOSS_ARENA_GROUND.forest.pattern],
      hz: [typeof arenaHazardOf('forest').step, typeof arenaHazardOf('forest').draw], end: [typeof BOSS_ENDINGS.evilleafy.sweep, typeof BOSS_ENDINGS.evilleafy.begin, BOSS_ENDINGS.evilleafy.holdMs, BOSS_ENDINGS.evilleafy.line],
      decor: String(drawArenaDecor).indexOf('elDecor()') >= 0, others: ['studio', 'cave', 'void', 'cerealbox', 'hotelroof', 'elimarea'].every(function(k){ return !!BOSS_ARENA_SKY[k]; }) })`);
    expect(r.sky, 'a teal-green night, not the black it was').toEqual(['#1e4033', '#0e2218']);
    expect(r.ground).toEqual(['#1f2f1a', '#3f5d33', 'function']);
    expect(r.hz).toEqual(['function', 'function']);
    expect(r.end, 'a short canon exit, no line of text').toEqual(['function', 'function', 1600, undefined]);
    expect(r.decor).toBe(true);
    expect(r.others, 'the other arenas are not touched').toBe(true);
  });

  it('the dark is a layer round HER, over the backdrop and the floor and under the shots and the fighters: a pool of 330 in phase 1, the arena in phase 2, a void in phase 3; and the floor line and the platform edge are redrawn over it', () => {
    const r = W.eval(`(function(){ ${REC}
      ${STAGE(700, 1, 300)}
      var out = {}, gy = groundY();
      [1, 2, 3].forEach(function(ph){
        b._phase = ph; b._hz.p2 = hazardT - 500; b._hz.p3 = hazardT - 500; b._hz.born = hazardT - 500; b.x = 300; b.y = gy - b.r;
        var R = rec(); elDarkDraw(R.c, b, b._hz);
        var g = R.calls.filter(function(c){ return c[0] === 'createRadialGradient'; })[0];
        var strokes = R.calls.filter(function(c){ return c[0] === 'moveTo'; }).map(function(c){ return [Math.round(c[1]), Math.round(c[2])]; });
        out[ph] = { grad: g.slice(1).map(function(v){ return Math.round(v); }), alpha: +(/,([0-9.]+)\\)$/.exec(R.stops[0])[1]), strokes: strokes, rects: R.calls.filter(function(c){ return c[0] === 'fillRect'; }).length };
      });
      // arriving: the dark gathers over her first second; it follows her as she moves; and with nothing standing there is none
      b._phase = 1; b._hz.born = hazardT - 30; var R1 = rec(); elDarkDraw(R1.c, b, b._hz); out.arrive = +(/,([0-9.]+)\\)$/.exec(R1.stops[0])[1]);
      b._hz.born = hazardT - 500; b.x = 900; var R2 = rec(); elDarkDraw(R2.c, b, b._hz); out.follows = R2.calls.filter(function(c){ return c[0] === 'createRadialGradient'; })[0].slice(1, 3).map(Math.round);
      b.hp = 0; var R3 = rec(); elDarkDraw(R3.c, b, b._hz); out.dead = R3.calls.length;
      out.gy = Math.round(gy); out.cy = Math.round(gy - b.r); out.plat = elPlat().y; out.platX = elPlat().x;
      return out; })()`);
    expect(r[1].grad.slice(0, 2), 'centred on her').toEqual([300, r.cy]);
    expect([r[1].grad[5], r[2].grad[5], r[3].grad[5]], 'a pool, the arena, the void: widening by phase').toEqual([330, 1000, 1400]);
    expect(r[1].alpha, 'phase 1: strong at her middle').toBeCloseTo(0.76, 2);
    expect(r[2].alpha).toBeCloseTo(0.62, 2);
    expect(r[3].alpha).toBeCloseTo(0.64, 2);
    expect(r.arrive, 'she arrives and it gathers: half strength after half a second').toBeCloseTo(0.64*0.5 + 0.12, 2);
    expect(r.follows, 'it follows her').toEqual([900, r.cy]);
    expect(r.dead, 'and is gone with her').toBe(0);
    expect(r[1].strokes.some((s) => s[1] === r.gy), 'the floor line is drawn over it').toBe(true);
    expect(r[1].strokes.some((s) => s[1] === Math.round(r.plat)), 'and the platform\'s edge').toBe(true);
  });

  it('phase 2 and 3 begin with their beat: the dark widens (2) and the curtains start to close in (3); one burst of damage that skips phase 2 gets both', () => {
    const r = W.eval(`(function(){ ${STAGE(700, 1, 300)}
      var out = { p1: b._phase, hz1: JSON.stringify(b._hz) };
      b.hp = b.maxHp*${HP[2]}; step(); out.p2 = b._phase; out.b2 = document.getElementById('banner').textContent; out.p2t = b._hz.p2; out.cur2 = b._hz.cur;
      b.hp = b.maxHp*${HP[3]}; step(); out.p3 = b._phase; out.b3 = document.getElementById('banner').textContent; out.p3t = b._hz.p3; out.cur3 = b._hz.cur; out.cw0 = b._hz.cw;
      ${STAGE(700, 1, 300)}
      b.hp = b.maxHp*0.1; step(); out.skip = { phase: b._phase, p2: b._hz.p2 != null, p3: b._hz.p3 != null, cur: b._hz.cur != null };
      return out; })()`);
    expect([r.p1, r.p2, r.p3]).toEqual([1, 2, 3]);
    expect(r.b2).toMatch(/PHASE 2: No Refuge/);
    expect(r.b3).toMatch(/PHASE 3: Vine Coverage/);
    expect(r.p2t, 'phase 2: the dark begins to widen').toBeGreaterThan(0);
    expect(r.cur2, 'and the curtains are not there yet').toBeUndefined();
    expect(r.cur3, 'phase 3: the curtains begin').toBeGreaterThan(0);
    expect(r.skip).toEqual({ phase: 3, p2: true, p3: true, cur: true });
  });

  it('the curtains creep in from both edges at 0.22 a frame, three times faster while a void is open, up to 11% of the arena a side; standing in one is a 0.4 boss hit thrown toward the middle, once every 60 frames; the middle is safe', () => {
    const r = W.eval(`(function(){ var out = {};
      // the width, growing: 0.22 a frame from the phase change
      ${STAGE(550, 3, 300)}
      var cw = []; for (var i=0;i<130;i++){ step(); f.x = 550; f.y = groundY()-24; f.vx = 0; f.onground = true; f.invuln = 9999; if (i === 59 || i === 129) cw.push(b._hz.cw); }
      out.cw = cw; out.rate = EL.curRate;
      // a fighter pinned inside the left curtain: a hit, then another a second on, each thrown toward the middle
      ${STAGE(550, 3, 300)}
      for (var i=0;i<40;i++){ step(); f.x = 550; f.y = groundY()-24; f.onground = true; f.invuln = 9999; }
      f.invuln = 0; f.pct = 0; var ev = [], last = 0;
      for (var i=0;i<190;i++){ f.x = 3; f.y = groundY()-24; f.onground = true; step(); if (f.pct > last + 1e-9){ ev.push([i, f.pct - last, f.vx]); last = f.pct; } }
      out.ev = ev; out.dmg = bossDmg();
      // in the middle: nothing. And the width stops at 11% of the arena
      ${STAGE(550, 3, 300)}
      step(); b._cwf = 119; for (var i=0;i<60;i++){ step(); f.x = 550; f.y = groundY()-24; f.vx = 0; f.onground = true; f.invuln = 0; }
      out.mid = f.pct; out.capped = b._hz.cw; out.max = Math.round(WW*EL.curMax*10)/10;
      // while a void is open they close three times as fast
      var FX = 550; ${STAGE(550, 3, 300)}
      ${FIRE(2)}
      for (var i=0;i<30;i++){ step(); f.x = 550; f.y = groundY()-24; f.vx = 0; f.onground = true; f.invuln = 9999; }
      var w0 = b._hz.cw, st0 = b._el && b._el.st; for (var i=0;i<20;i++){ step(); f.x = 550; f.y = groundY()-24; f.vx = 0; f.onground = true; f.invuln = 9999; }
      out.holeGain = +(b._hz.cw - w0).toFixed(2); out.holeOpen = st0; out.holeRate = EL.curRate*EL.curHole*20;
      return out; })()`);
    expect(r.cw[0], 'it has begun').toBeGreaterThan(5);
    expect(r.cw[1] - r.cw[0], 'steadily').toBeCloseTo(r.rate*70, 0);
    expect(r.ev.length, 'ticks come a second apart, not every frame').toBeGreaterThan(1);
    expect(r.ev[0][1], 'a 0.4 boss hit').toBeCloseTo(r.dmg*0.4, 4);
    expect(r.ev[1][0] - r.ev[0][0], 'one every 60 frames').toBeGreaterThanOrEqual(60);
    expect(r.ev[0][2], 'thrown toward the middle').toBeGreaterThan(3);
    expect(r.mid, 'the middle of the stage is safe from it').toBe(0);
    expect(r.capped, 'it stops at 11% of the arena a side').toBe(r.max);
    expect(r.holeOpen).toBe('open');
    expect(r.holeGain, 'three times faster while a void is open').toBeCloseTo(r.holeRate, 0);
  });

  it('she arrives in it: the dark gathers over her first second and her first teleport waits', () => {
    const r = W.eval(`(function(){ ${STAGE(700, 1, 300)}
      summons = []; hazardT = 123; spawnBossRushBoss(); var b2 = summons.find(function(s){ return s.type === 'boss'; });
      return { born: b2._hz.born, t: hazardT, tele: b2._teleT, arena: BOSS_ARENA, atk: b2._atkTimer }; })()`);
    expect(r.born).toBe(r.t);
    expect(r.tele, 'her first teleport waits 90 frames').toBe(90);
    expect(r.arena).toBe('forest');
  });
});

// ==== HER ENDING =====================================================================================================================================
describe('her ending: she freezes where she fell, a monitor comes in from the right, and she shatters', () => {
  it('runs through BOSS_ENDINGS: a scene shot and a carrier, the card held 1600 ms, no line of text; it hurts nobody, the carrier lands on the beat of the hit and makes the engine\'s impact, and it is over in 100 frames', () => {
    const r = W.eval(`(function(){ ${STAGE(500, 1, 500)}
      projectiles = [{ el:true, life:5, x:0, y:0, r:1, vx:0, vy:0 }, { life:5, x:0, y:0, r:1, vx:0, vy:0 }];
      var info = bossEndingBegin(b); summons = []; f.pct = 0; f.invuln = 0;
      var shots = projectiles.filter(function(p){ return p.el; }), scene = shots.find(function(p){ return p.elEnd; }), carrier = shots.find(function(p){ return p.elGhost; });
      var out = { info: info, n: shots.length, other: projectiles.filter(function(p){ return !p.el; }).length, gy: groundY(), t0: hazardT,
        scene: scene && { et0: scene.et0, ex: scene.ex, ey: scene.ey, er: scene.er, r: scene.r, dmg: scene.dmg, y: scene.y },
        carrier: carrier && { team: carrier.ownerObj.team, dmg: carrier.dmg, r: carrier.r } };
      var debris0 = IMPACT_DEBRIS.length, hitAt = null, goneAt = null;
      for (var i=0;i<130;i++){ step(); f.x = 500; f.y = groundY()-24; f.onground = true; f.vx = 0;
        if (hitAt == null && IMPACT_DEBRIS.length >= debris0 + 8) hitAt = hazardT - out.t0;
        if (goneAt == null && !projectiles.some(function(p){ return p.el; })) goneAt = hazardT - out.t0; }
      out.hitAt = hitAt; out.goneAt = goneAt; out.pct = f.pct; out.endT = EL.endT;
      projectiles = [{ el:true, life:5, x:0, y:0, r:1, vx:0, vy:0 }, { life:5, x:0, y:0, r:1, vx:0, vy:0 }]; elEndSweep(); out.swept = projectiles.length;
      return out; })()`);
    expect(r.info, 'the card waits 1.6 s for it, and there is no line').toEqual({ hold: 1600, line: null });
    expect(r.n, 'the scene and its carrier, and the sweep took the one that was there').toBe(2);
    expect(r.other, 'another boss\'s shot is not hers to take').toBe(1);
    expect(r.swept, 'the sweep takes her shots and no others').toBe(1);
    expect(r.scene, 'where she fell, when, and how big; inert and far off the screen').toMatchObject({ et0: r.t0, ex: 500, ey: Math.round(r.gy - 81.6), er: 82, r: 0, dmg: 0, y: -5000 });
    expect(r.carrier, 'the carrier is on the fighters\' side, so it touches nobody').toEqual({ team: 0, dmg: 0, r: 2 });
    expect(r.hitAt, 'the monitor hits on frame 64 and the shatter\'s impact (shake, dust, debris) comes with it').toBeGreaterThanOrEqual(60);
    expect(r.hitAt).toBeLessThanOrEqual(68);
    expect(r.goneAt, 'over in 100 frames, before the next boss').toBeLessThanOrEqual(r.endT + 2);
    expect(r.pct, 'it hurt no one').toBe(0);
  });

  it('is drawn from the clock: she freezes (ice in from the left, then the frozen render), a monitor flies in, she shatters into shards that fall and fade -- with the art loaded or not -- and a client draws it from the snapshot', () => {
    const r = W.eval(`(function(){ ${STAGE(500, 1, 500)}
      var out = { err: null, calls: {} }, n = 0;
      var run = function(tag){
        try {
          for (var u of [0, 5, 10, 17, 30, 46, 55, 63, 64, 66, 72, 85, 99, 100, 101]){
            var pr = { x:500, y:-5000, vx:0, vy:0, r:0, color:'#ff0100', owner:-2, ownerObj:{ team:-1, idx:-2 }, life:1, delay:100, el:true, elEnd:true, et0:hazardT - u, ex:500, ey:Math.round(groundY() - 82), er:82, ef:1 };
            drawProjectile(pr); n++;
          }
          drawProjectile({ x:500, y:300, vx:0, vy:25, r:2, color:'#bff3fb', owner:-2, ownerObj:{ team:0, idx:-2 }, el:true, elGhost:1 });   // the carrier draws nothing
        } catch(e){ out.err = tag + ': ' + e.message + ' ' + (e.stack||'').split('\\n')[1]; }
      };
      run('no art');
      ATTACK_IMG.elfrozen = { complete:true, naturalWidth:71, naturalHeight:128 }; BOSS_SPRITE_IMG.evilleafy = { complete:true, naturalWidth:110, naturalHeight:200 };
      run('art');
      out.n = n; out.glyphs = ['elvine', 'elfrozen'].map(function(k){ return !!PROJ_SHAPE[k] && typeof PROJ_SHAPE[k].draw === 'function'; });
      return out; })()`);
    expect(r.err).toBe(null);
    expect(r.n).toBe(30);
    expect(r.glyphs, 'a drawn glyph for each of her art keys, for until the art loads').toEqual([true, true]);
  });
});

describe('a netcode client sees the forest, her moves and her ending', () => {
  it('everything she draws from rides the snapshot whole -- b._hz, and the ending\'s shots -- and it all draws on the client', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow();
      BOSS_ARENA = 'forest'; var gy = groundY(), t = hazardT;
      var hz = { born:t - 500, p2:t - 300, p3:t - 100, cur:t - 90, cw:40.6, tw:[[261, 1, 15, 4, 450, 558, t - 20, t + 20], [900, -1, 11, 8, 200, 308, t - 5, t + 25]],
                 v:[[300, t - 5, 200, 7], [354, t + 3, 210, 7]], pos:[550, 446, t - 40, t - 6, t + 150, 342, 416, 700, 230], th:[[400, t + 10, 446], [800, t + 30, 590]],
                 bh:[550, 544, t - 60, t - 6, t + 120, 42, 340], bt:[3, 473, t - 20, t + 30, 1, 903] };
      summons = [{ type:'boss', name:'Evil Leafy', color:'#ff0100', r:82, sprite:'evilleafy', x:500, y:300, hp:90, maxHp:185, face:1, flash:0, homeX:500, _rage:false, _tel:10, _telKind:'elpossess',
                   _bossRush:true, attack:'evilleafy', _phase:3, _hz:hz }];
      projectiles = [{ x:420, y:-5000, vx:0, vy:0, r:0, color:'#ff0100', owner:-2, ownerObj:{ team:-1, idx:-2 }, bossAtk:0, life:1, delay:90, noAim:true, el:true, elEnd:true, et0:t - 10, ex:420, ey:508, er:82, ef:1 },
                     { x:420, y:gy - 150, vx:0, vy:25, r:2, color:'#bff3fb', owner:-2, ownerObj:{ team:0, idx:-2 }, bossAtk:0, life:90, delay:30, noAim:true, el:true, elGhost:1 }];
      var snap = JSON.parse(JSON.stringify(serializeState()));
      summons = []; projectiles = []; BOSS_ARENA = null;
      applySnapshot(snap);
      var err = null, drawn = null;
      try { drawArenaDecor(BOSS_ARENA); drawArenaHazard('under'); drawArenaHazard('over'); summons.forEach(drawSummon); elFxDraw(summons[0]); projectiles.forEach(drawProjectile); drawBossBar(); draw(); drawn = true; }
      catch(e){ err = e.message + ' ' + (e.stack||'').split('\\n')[1]; }
      var end = projectiles.find(function(p){ return p.elEnd; }), ghost = projectiles.find(function(p){ return p.elGhost; });
      return { err: err, drawn: drawn, arena: BOSS_ARENA, hz: JSON.stringify(summons[0]._hz), want: JSON.stringify(hz),
               end: end && { et0: end.et0, ex: end.ex, ey: end.ey, er: end.er, ef: end.ef }, ghost: !!ghost, t: t, boss: { attack: summons[0].attack, tel: summons[0]._tel, kind: summons[0]._telKind, phase: summons[0]._phase } };
    })()`);
    expect(r.err).toBe(null);
    expect(r.arena, 'the client draws the Evil Forest').toBe('forest');
    expect(r.hz, 'every field of the scene arrives as it was sent').toBe(r.want);
    expect(r.boss).toEqual({ attack: 'evilleafy', tel: 10, kind: 'elpossess', phase: 3 });
    expect(r.end, 'and so does the ending: where, when, how big, which way').toEqual({ et0: r.t - 10, ex: 420, ey: 508, er: 82, ef: 1 });
    expect(r.ghost, 'with its carrier, which draws nothing').toBe(true);
  });
});

describe('no words, no other show, and the art is wired and credited', () => {
  // Every draw of the forest, her, and everything she throws, on a canvas that records what it is asked to do: not one word.
  function bootRecording(seed = 7) {
    const html = readFileSync('artifacts/V1/index.html', 'utf8'), rec = [], grad = { addColorStop() {} };
    const dom = new JSDOM(html, {
      url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
      beforeParse(window) {
        window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
          get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 }) : p === 'canvas' ? { width: 1100, height: 720 } : p === 'getImageData' ? () => ({ data: [] })
            : (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createPattern') ? () => grad : (...args) => { rec.push({ op: p, args }); }),
          set: (_t, p, v) => { rec.push({ op: 'set:' + String(p), args: [v] }); return true; },
        });
        window.Math.random = mulberry32(seed); window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {};
      },
    });
    return { w: dom.window, rec };
  }

  it('draws the whole forest, her in every state and everything she throws, with the art loaded or not, without a word of text', () => {
    const { w, rec } = bootRecording();
    w.eval("SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow(); running = false;");   // (the match's own HUD writes the fighters' names: not the forest's business)
    const n0 = rec.length;
    const err = w.eval(`(function(){
      try {
        BOSS_ARENA = 'forest';
        var gy = groundY(), t = hazardT + 200; hazardT = t;
        var hz = { born:t - 500, p2:t - 300, p3:t - 100, cur:t - 90, cw:40.6, tw:[[261, 1, 15, 4, 450, 558, t - 20, t + 20], [900, -1, 11, 8, 200, 308, t - 5, t + 25]],
                   v:[[300, t - 5, 200, 7], [354, t + 3, 210, 7], [408, t - 40, 190, 7], [462, t - 60, 190, 7]], pos:[550, 446, t - 40, t - 6, t + 150, 342, 416, 700, 230], th:[[400, t + 10, 446], [800, t - 6, 590], [460, t - 2, 446]],
                   bh:[550, 544, t - 60, t - 6, t + 120, 42, 340], bt:[3, 473, t - 20, t + 30, 1, 903] };
        var base = { type:'boss', name:'Evil Leafy', color:'#ff0100', sprite:'evilleafy', r:82, x:500, y:gy-82, face:1, hp:100, maxHp:185, _tel:0, _telKind:null, _phase:3, _rage:false, flash:0, homeX:500, attack:'evilleafy', _bossRush:true, _hz:hz };
        var states = [{}, { _tel:20, _telKind:'evilleafy' }, { _tel:20, _telKind:'elpossess', y:gy-0 }, { _tel:20, _telKind:'elhole', y:300 }, { _tel:20, _telKind:'elbehind', y:gy+600 }, { face:-1, _phase:1 }, { _phase:2 }, { flash:6 }, { _hz:{} }];
        var go = function(tag){ states.forEach(function(st){ summons = [Object.assign({}, base, st)]; ctx.save(); drawSummon(summons[0]); ctx.restore(); elFxDraw(summons[0]);
            drawArenaDecor('forest'); drawArenaHazard('under'); drawArenaHazard('over'); }); };
        go('no art');
        ATTACK_IMG.elvine = { complete:true, naturalWidth:128, naturalHeight:117 }; ATTACK_IMG.elfrozen = { complete:true, naturalWidth:71, naturalHeight:128 }; BOSS_SPRITE_IMG.evilleafy = { complete:true, naturalWidth:110, naturalHeight:200 };
        go('art');
        summons = []; drawArenaDecor('forest'); drawArenaHazard('under'); drawArenaHazard('over');   // between bosses
        arenaGround().pattern(ctx, gy, -20, WW + 20, WH + H, arenaGround());
        ['elvine', 'elfrozen'].forEach(function(sh){ drawProjectile({ x:300, y:300, vx:8, vy:2, r:20, owner:-2, ownerObj:{ team:-1, idx:-2 }, shape:sh, color:'#ff0100' }); drawProjectile({ x:300, y:300, vx:0, vy:0, r:22, owner:-2, ownerObj:{ team:-1, idx:-2 }, shape:sh, color:'#ff0100', trap:true }); });
        [0, 10, 17, 40, 50, 63, 64, 70, 90, 99].forEach(function(u){ drawProjectile({ x:9, y:-5000, vx:0, vy:0, r:0, owner:-2, ownerObj:{ team:-1, idx:-2 }, el:true, elEnd:true, et0:t - u, ex:420, ey:508, er:82, ef:1, color:'#ff0100' }); });
        draw();
        return null;
      } catch(e){ return e.message + ' ' + (e.stack||'').split('\\n')[1]; }
    })()`);
    expect(err).toBe(null);
    const drawn = rec.slice(n0), names = w.eval('fighters.map(function(f){ return f.name; })');   // (the two fighters' own name tags are the match's, not the forest's)
    expect(drawn.length, 'the recording is live').toBeGreaterThan(1000);
    expect(drawn.filter((r) => (r.op === 'fillText' || r.op === 'strokeText') && !names.includes(r.args[0])).length, 'not a word on the canvas').toBe(0);
  });

  it("nothing of it says a word or names anyone from the OSC: its code has no banner of its own, no text drawing, no OJ, Suitcase, Cabby or The Floor", () => {
    const fns = ['elHz', 'elPh', 'elBoss', 'elPlat', 'elRow', 'elRow2', 'elVineX', 'elVineMax', 'elVineLife', 'elVineH', 'elTell', 'elSpawnRow', 'elVineBirth', 'elVinesStep', 'elDone', 'elHidden', 'elIntangible',
      'elTendrilsFire', 'elBeginPossess', 'elThrashPlan', 'elThrashH', 'elPossessFire', 'elBeginHole', 'elHoleScale', 'elHoleFire', 'elTreeX', 'elPickTree', 'elBeginBehind', 'elBurst', 'elBehindFire', 'elStep', 'elHold',
      'elMove', 'elTick', 'elBeginTelegraph', 'elVineDraw', 'elCrackDraw', 'elStumpDraw', 'elTellFloor', 'elCoils', 'elBackVines', 'elTellDraw', 'elPosDraw', 'elEyes', 'elHoleDraw', 'elLaneDraw', 'elHazardDraw', 'elTreeH',
      'elConifer', 'elDecor', 'elGroundPattern', 'elDarkDraw', 'elHazardStep', 'elCurtainDraw', 'elGlowDraw', 'elSpawn', 'elPhaseBeat', 'elEndSweep', 'elEndBegin', 'elMonitor', 'elEndDraw', 'elFxDraw'];
    const src = W.eval(`[${fns.join(',')}].map(String).concat([JSON.stringify(EL), JSON.stringify(BOSS_EXTRA['Evil Leafy']), BOSS_MOVE_NAME.elpossess, BOSS_MOVE_NAME.elhole, BOSS_MOVE_NAME.elbehind, String(BOSS_MOVES.elpossess), String(BOSS_MOVES.elhole), String(BOSS_MOVES.elbehind)]).join('\\n')`);
    expect(src).not.toMatch(/\bOJ\b|Suitcase|Cabby|The Floor/i);
    expect(src, 'no banner of its own: the wind-up is named by the engine\'s telegraph and a phase by its card').not.toMatch(/banner\(/);
    expect(src, 'no text on the canvas').not.toMatch(/fillText|strokeText/);
  });

  it("her vines and her ending wear the show's art -- the vine mass cut from File:Evil Leafy's Vines.png, the frozen leaf of File:Frozen Evil Leafy.png -- every file a real PNG at projectile size, on the record and credited; her own render is unchanged", () => {
    const reg = W.eval(`(function(){ var o = {}; ['elvine', 'elfrozen'].forEach(function(k){ o[k] = { e: ATTACK_SPRITES[k], glyph: !!PROJ_SHAPE[k] }; }); return o; })()`);
    const manifest = JSON.parse(readFileSync('scripts/attack-sprite-manifest.json', 'utf8'));
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const picks = readFileSync('scripts/fetch-attack-sprites.mjs', 'utf8');
    for (const [name, wikiFile] of [['elvine', "Evil Leafy's Vines.png"], ['elfrozen', 'Frozen Evil Leafy.png']]) {
      const e = reg[name].e, file = 'artifacts/V1/' + e.src;
      expect(existsSync(file), file).toBe(true);
      const png = PNG.sync.read(readFileSync(file));
      expect(Math.max(png.width, png.height), name + ' at projectile size').toBeLessThanOrEqual(128);
      const clear = (() => { let c = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) c++; return c / (png.width * png.height); })();
      expect(clear, name + ' is cut out, not a screenshot').toBeGreaterThan(0.12);
      expect(reg[name].glyph, name + ' has a drawn glyph to show until it loads').toBe(true);
      const m = manifest[name];
      expect(m, name + ' is on the record').toMatchObject({ file: name + '.png', kits: [name], srcTitle: wikiFile, wiki: 'bfdi', width: png.width, height: png.height });
      expect(m.source).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/battlefordreamisland\/images\//);
      expect(credits, name + ' is credited with its exact source').toContain('(' + name + '.png)');
      expect(credits).toContain(m.source);
      expect(picks, name + ' has its pick in the evilleafy slot').toMatch(new RegExp(name + ':\\s*\\{ who: \\x27Evil Leafy\\x27'));
    }
    expect(W.eval("BOSS_SPRITE_SRC.evilleafy + ' ' + !!BOSS_SPRITE_FLIP.evilleafy"), 'her own render is unchanged').toBe('assets/sprites/evil-leafy.png false');
    expect(W.eval('BOSS_ROSTER.find(function(b){ return b.attack === "evilleafy"; }).color'), 'red, the wiki\'s leaf').toBe('#ff0100');
  });
});
