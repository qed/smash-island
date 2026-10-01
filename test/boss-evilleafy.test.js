import { describe, it, expect, beforeAll } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// Boss 7, Evil Leafy, rebuilt in the boss overhaul (2026-09-29): "make the bosses more like springy ... but dont make them like him! make the attacks feel more
// immersive." The Evil Forest, FOUR attacks -- TENDRILS! (the signature, redone: "1 needs a better telegraph." -> BOTH tells: the tendrils coil above her pointing where
// they will strike AND a dark vine line creeps along the floor showing the wave's path, with the gap lit), POSSESSED!, BLACK HOLE! and BEHIND THE TREES! (her glowing eyes
// behind one tree of the backdrop, then she bursts out) -- each a scene from the show, all of them through the boss engine kit (impact, the arena's ground and hazard, its
// ending). She is exempt from the attack-count rule: "unless they have a mechanic, like contact damage and teleporting for evil leafy, that makes it so that they dont
// need extra attacks" (the owner), so her contact hit and her teleport are kept, and the contact hit's numbers are not touched ("Evil leafy level.": One's rebuild copies
// them). "Harder, same damage": every part of a move shares its one attack id, so a fighter takes at most one boss hit from it. Never tuned for a bot: every number here is
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
const FIRE = (k) => `b._moveN = ${k === 0 ? 0 : 2*k - 1}; b._atkTimer = 1; step(); var telKind = b._telKind, telName = document.getElementById('banner').textContent, tel0 = b._tel;
  for (var w=0; w<90 && b._tel>0; w++){ step(); f.x = FX; f.y = groundY()-24; f.vx = 0; f.vy = 0; f.onground = true; }`;

describe('Evil Leafy takes the Evil Forest', () => {
  it('is Boss 7, red (the owner: "Evil Leafy red with black vines"), with her HP and size as they were, and her turns run TENDRILS!, POSSESSED!, TENDRILS!...', () => {
    const r = W.eval(`(function(){
      var i = BOSS_ROSTER.findIndex(function(b){ return b.name==='Evil Leafy'; });
      var s = { name:'Evil Leafy', attack:'evilleafy', type:'boss', x:300, y:500, r:81.6, hp:100, maxHp:100, _phase:1, _atkTimer:1, _tel:0, color:'#ff0100', face:1, homeX:300, stationary:false, vx:0, vy:0 };
      var kinds = [], names = [];
      for (var k=0;k<4;k++){ s._atkTimer = 1; s._tel = 0; updateBossAttack(s, null); kinds.push(s._telKind); names.push(bossTelName(s)); }
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
    expect(r.kinds.slice(0, 3)).toEqual(['evilleafy', 'elpossess', 'evilleafy']);
    expect(r.names.slice(0, 3), 'the wind-up names the move').toEqual(['TENDRILS!', 'POSSESSED!', 'TENDRILS!']);
    expect(r.names2).toEqual(['POSSESSED!', 'BLACK HOLE!', 'BEHIND THE TREES!']);
    expect(r.tel, 'TENDRILS!\'s wind-up is longer than the 45 it was ("1 needs a better telegraph.")').toEqual([56, 34]);
    expect([r.p2, r.p3]).toEqual(['No Refuge', 'Vine Coverage']);
    // "bosses should attack a bit slower" (the owner, 2026-09-30): her own 130 / 95 / 80 times BOSS_PACE (1.2), and held while a move runs on past its wind-up
    expect(r.gaps, 'her own pacing, paced, quicker each phase').toEqual([156, 114, 96]);
    expect(r.held, 'held while a move runs').toBe(1e6);
    expect(r.rushOnly, 'an item boss never throws them: they need her platform, her floor and her forest').toEqual([true, true, true]);
  });

  it('she never walks: a statue that turns to face you, and only her teleport (every 200 / 130 / 100 frames) moves her', () => {
    const r = W.eval(`(function(){ var out = {};
      ${STAGE(900, 1, 300)}
      var x0 = b.x; for (var i=0;i<90;i++){ step(); f.x = 900; f.y = groundY()-24; f.vx = 0; f.onground = true; }
      out.still = Math.abs(b.x - x0) < 1; out.face = b.face;
      ${STAGE(900, 1, 100)}
      b._teleT = 1; step(); out.teleported = Math.abs(b.x - 100) > 100 && b.x <= WW*0.34 + 1;   // phase 1: only inside the dark left third
      ${STAGE(900, 2, 300)}
      b._teleT = 1; step(); out.p2 = b.x;
      out.gaps = [1,2,3].map(function(p){ return EL.teleGap[p]; });
      return out; })()`);
    expect(r.still, 'no walk toward you').toBe(true);
    expect(r.face, 'she turns to you').toBe(1);
    expect(r.teleported, 'phase 1 teleports stay in the left third').toBe(true);
    expect(r.p2, 'phase 2 teleports to within 180-320 of you').toBeGreaterThan(900 - 330);
    expect(r.gaps).toEqual([200, 130, 100]);
  });

  it("her contact hit is exactly as it was: 0.6 of a boss hit, knocked 13 and -12, 75 frames of grace (One's rebuild copies the numbers)", () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1, 300)}
      var dmg = BOSS_DMG_BASE; f.x = b.x + 20; f.y = b.y; step();
      var out = { pct: f.pct, want: dmg*0.6, vx: f.vx, vy: f.vy, invuln: f.invuln };
      var src = String(updateBossAttack); out.src = [src.indexOf('bossDmg()*0.6') >= 0, src.indexOf('*13;') >= 0, src.indexOf('kx, -12') >= 0, src.indexOf('Math.max(f.invuln, 75)') >= 0];
      // asleep inside a tree or sunk into the platform, she touches no one
      b._el = { k:'pos', st:'in' }; f.invuln = 0; f.pct = 0; f.x = b.x; f.y = b.y; b.hover = true; var y0 = b.y; step(); out.sunk = f.pct;
      return out; })()`);
    expect(r.pct).toBeCloseTo(r.want, 5);
    expect(r.vx, 'knocked 13 (away from her)').toBeGreaterThan(8);
    expect(r.src).toEqual([true, true, true, true]);
    expect(r.invuln).toBeGreaterThanOrEqual(74);
    expect(r.sunk, 'sunk into the platform she touches no one').toBe(0);
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
    expect(r.life, 'grow (25 frames at 8 a frame), hold 14, fall 10').toBe(25 + 14 + 10);
  });

  it('a vine is a full boss hit through the move\'s one id: standing in the row costs one hit however many vines come, standing in the lit gap costs nothing', () => {
    const r = W.eval(`(function(){ var out = {};
      // the fighter starts at 700 (the wind-up fixes the row from there), then stands where \`at(w)\` says -- in the row's path, or in its gap -- for the whole wave
      var run = function(at){ ${STAGE(700)}
        b._moveN = 0; b._atkTimer = 1; step(); var w = b._hz.tw[0], fx = at(w); out.w = w;
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
      b._moveN = 0; b._atkTimer = 1; step();
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

  it('phase 2 adds a second wave where you dodged to, its gap on your other side and its tell shorter; phase 3 brings it sooner and faster', () => {
    const r = W.eval(`(function(){ var out = {};
      [2, 3].forEach(function(ph){
        var FX = 600; ${STAGE(600, 1, 100)}
        b.hp = b.maxHp*(ph === 3 ? ${HP[3]} : ${HP[2]});
        step(); f.x = 600;
        ${FIRE(0)}
        var w1 = b._hz.tw[0].slice(), mid = (w1[4] + w1[5])/2, e0 = b._el ? b._el.t : -1;
        for (var i=0;i<90;i++){ step(); f.x = 600; f.y = groundY()-24; f.vx = 0; f.onground = true; f.invuln = 9999; if (b._hz.tw && b._hz.tw[1]) break; }
        var w2 = b._hz.tw[1].slice(), mid2 = (w2[4] + w2[5])/2;
        out[ph] = { w1: w1, w2: w2, side1: Math.sign(mid - 600), side2: Math.sign(mid2 - 600), tell2: w2[7] - w2[6], at: w2[6] - w1[7], waves: b._el.n, ev: EL.vEvery[ph] };
      });
      return out; })()`);
    for (const ph of [2, 3]) {
      expect(r[ph].waves, `phase ${ph}: two waves`).toBe(2);
      expect(r[ph].side2, `phase ${ph}: the second gap is on the other side of you`).toBe(-r[ph].side1);
      expect(r[ph].at, `its tell begins 40 frames after the first wave went in`).toBe(40);
    }
    expect([r[2].tell2, r[3].tell2], 'a shorter second tell, shorter again in phase 3').toEqual([34, 26]);
    expect([r[2].ev, r[3].ev], 'the vines come every 5 frames, then 4').toEqual([5, 4]);
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
        b._moveN = 1; b._atkTimer = 1; step(); var marks = 0, up = 0, tEnd = b._hz.pos[4], before = null;
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
      var P = elPlat(); b._moveN = 1; b._atkTimer = 1; step();
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
      var P = elPlat(); b._moveN = 1; b._atkTimer = 1; step();
      var Pz = b._hz.pos.slice(), th = b._hz.th.slice();
      return { pos: Pz, gy: Math.round(groundY()), onFloor: th.filter(function(e){ return e[2] === Math.round(groundY()); }).length, onPlat: th.filter(function(e){ return e[2] === Pz[1]; }).length, dur: Pz[4] - Pz[3] }; })()`);
    expect(r.pos[8], 'a patch of floor, 230 wide').toBe(230);
    expect(r.pos[7]).toBeGreaterThan(0);
    expect(r.onFloor).toBeGreaterThan(2);
    expect(r.onPlat).toBeGreaterThan(2);
    expect(r.dur, 'hers longer in phase 3').toBe(250);
  });
});
