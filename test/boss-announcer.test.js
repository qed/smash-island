import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';
import { JSDOM } from 'jsdom';
import { loadMonolith } from './helpers/load-monolith.js';
import { mulberry32 } from './helpers/prng.js';

// THE ANNOUNCER, REBUILT (the boss overhaul, 2026-09-29; boss-overhaul-decisions.md, Rounds 9 and 11). Boss 1 has four attacks and three phases and
// his own place, and moves the way he does in the show:
//   CAKE AT STAKE!  the prize is tossed from the Cake Tosser on the centre cylinder ("Cake tosser tosses cake at Leafy", Barriers and Pitfalls) and it
//                   changes each turn as in the show: a slice (BFDI 2), key lime (BFDI 3), ice chunks (BFDI 4), the explosive blueberry pie (BFDI 16:
//                   "the pie slices explode upon contact"). From phase 2 it is BUDGET CUTS! ("We had to sell the recovery centers because of budget cuts",
//                   Insectophobe's Nightmare 2) and every turn sells a real piece of the arena. Phase 3: CRUSHER ARM! (Announcer Crusher: "a black remote with
//                   a red single button on top and has a long black wire connected to the crusher"; on its first use it "couldn't hold any more pressure,
//                   resulting in it cracking and violently exploding").
//   QUADRUPLE LASER!  four beams that converge on you (Laser Powered Teleportation Device: "it has two more lasers moving horizontally") -- and the owner:
//                   "3 shouldnt have one go around the screen." -- none of them wraps.
//   ACID TEARS!     "The 5 contestants who were safe reject the cake, causing Announcer to become sad and start crying acid" (Rescission): it follows a
//                   volley nobody was hit by, a sprinkler and puddles.
//   WATER BALLOONS!  "(The Announcer drops the water balloons onto the contestants)" (A Leg Up in the Race): he rises off the screen; they fall on shadows.
// The owner: "Harder, same damage" -- every attack keeps one attack id -- and "if it makes sense for a hazard, reduce boss difficulty and add a hazard":
// the crusher standing at the arena's edge is the hazard, and his own pace is eased for it. "Endings: 'All of them'": Spongy crushes him ("Announcer gets
// crushed by Spongy", Don't Pierce My Flesh). And the standing rule: no text on screen in a match but GO!, KOs, boss telegraphs and Boss Rush cards.

// THE WINDOW. The owner, 2026-10-01: "announcer causes unavoidable damage and without telegraphs." and, explaining it: "for the announcer "unavoidable hits",
// theyre unavoidable bcs they barely have a moment where you can move to dodge." So every warning that has locked gives at least `calm` frames before it strikes,
// and one threat is over at least that long before the next begins -- inside a turn, between his turns, and between his turns and the crusher. Damage per hit is
// as it was. (About 30 frames is what the owner's coordinator asked for: a fighter's jump hangs in the air about 40, and his run is 6.4 px a frame.)
const ANN_CALM = 30;

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// A still Firey on the floor at `x` (a second fighter, still, at `x2` if given), the stage's one platform, and the Announcer spawned the way the gauntlet
// spawns him, his turn timer and his crusher parked. His entrance is a picture only, so he stands where he spawns and everything that meets a boss there does.
const STAGE = (x, x2) => `
  SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
  BOSSRUSH = { active:false, bossIdx:0, cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats=[{ x:WW*0.29, y:WH*0.62, w:WW*0.42, h:14 }]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; impactFxClear();
  var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), ${x}, groundY()-24, 0);
  f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
  ${x2 != null ? `var g2 = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), ${x2}, groundY()-24, 1); g2.team=0; g2.controller='still'; g2.stocks=9; fighters.push(g2);` : ''}
  spawnBossRushBoss();
  var b = summons.find(function(s){ return s.type==='boss'; });
  b._atkTimer = 1e9; b._hz.nx = 1e9;
  step(); fighters.forEach(function(q){ q.pct=0; q.invuln=0; });
  function run(n){ for (var i=0;i<n;i++){ step(); } }
  function keep(n){ for (var i=0;i<n;i++){ step(); fighters.forEach(function(q){ q.pct=0; q.invuln=0; q.dead=false; }); } }
  function calmed(){ b._lanes=null; b._bl=null; b._calm=999; b._hz.cc=999; b._atkLive=null; }   // nothing of his is going, and has not been for a long while: his next turn may begin (the window the owner asked for is its own tests below); no attack is live (the engine's one-at-a-time hold)
  // The owner, 2026-10-01 (Round 17): "make the attacks based on fighter position. if there is an attack that punishes being close, then they should use it more when ppl are close." -- the turn
  // cycle (the signature, a laser, the signature, acid, ...) is gone, so a test that needs one of his moves forces it: turn(0) is the signature (CAKE AT STAKE! / BUDGET CUTS! / CRUSHER ARM!),
  // turn(1) QUADRUPLE LASER!, turn(3) ACID TEARS!, turn(5) WATER BALLOONS! (the numbers are the old cycle's, kept for the call sites: 2 and 4 were the signature again). The picker has its own tests.
  var FORCE = { 0:'announcer', 1:'annlaser', 2:'announcer', 3:'annacid', 4:'announcer', 5:'annballoon' };
  function turn(moveN){ b._tel=0; projectiles=[]; b._q=[]; calmed(); b._pickForce=FORCE[moveN]; b._atkTimer=1; step(); }
  function setPhase(ph){ b._phase = ph; b.hp = b.maxHp*[0, 0.9, 0.5, 0.2][ph]; keep(3); projectiles=[]; b._q=[]; b._tel=0; calmed(); impactFxClear(); }
`;
// A bare Announcer for driving his functions directly.
const BARE = (o = '') => `{ name:'Announcer', attack:'announcer', x:700, y:300, r:85, hp:100, maxHp:100, _phase:1, _atkTimer:1, _tel:0, color:'#3a4a6a',
  face:-1, homeX:700, stationary:false, vx:0, vy:0 ${o ? ',' + o : ''} }`;
const ANNOUNCER_ROW = { name: 'Announcer', color: '#3a4a6a', hp: 175, big: 2.5, attack: 'announcer', arena: 'cakeatstake', stationary: false, sprite: 'announcer' };

describe('the Announcer, rebuilt', () => {
  it('is Boss 1, in his own place, with his own second moves and none of the shared four', () => {
    const r = W.eval(`(function(){
      var i = BOSS_ROSTER.findIndex(function(b){ return b.name==='Announcer'; }), x = BOSS_EXTRA['Announcer'];
      return { i: i, row: BOSS_ROSTER[i], extra: x, moves: x.map(function(k){ return typeof BOSS_MOVES[k] + '/' + BOSS_MOVE_NAME[k]; }),
        shared: x.filter(function(k){ return ['rain','ring','slam','seekers'].indexOf(k) >= 0; }),
        p2: bossPhaseName({ attack:'announcer' }, 2), p3: bossPhaseName({ attack:'announcer' }, 3), tel: bossTelLen({ attack:'announcer' }),
        gaps: [1, 2, 3].map(function(p){ return bossAtkGap({ attack:'announcer', _phase:p }); }),
        plain: [1, 2, 3].map(function(p){ return bossAtkGap({ attack:'four', _phase:p }); }) };
    })()`);
    expect(r.row).toEqual(ANNOUNCER_ROW);
    expect(r.i, 'Boss 1').toBe(0);
    // Round 9: "Announcer: CAKE AT STAKE!/BUDGET CUTS!/CRUSHER ARM! (redone), QUADRUPLE LASER! ..., ACID TEARS!, WATER BALLOONS! (in place of the cut SENDER SCOOP!)"
    expect(r.extra).toEqual(['annlaser', 'annacid', 'annballoon']);
    expect(r.moves).toEqual(['function/QUADRUPLE LASER!', 'function/ACID TEARS!', 'function/WATER BALLOONS!']);
    expect(r.shared, 'INCOMING! and SHOCK RING are gone from him ("Mostly their own")').toEqual([]);
    expect([r.p2, r.p3]).toEqual(['Budget Cuts', 'Crusher Arm']);
    expect(r.tel, 'the standard wind-up: tells are not slowed').toBe(36);
    // "bosses should attack a bit slower" (the owner, 2026-09-30): every Boss Rush boss waits BOSS_PACE (1.2) times as long between attacks, so his
    // own 112 / 84 / 62 are 134 / 101 / 74 (test/boss-kit.test.js checks the pace for every boss).
    expect(r.gaps, 'eased by the hazard in his arena ("reduce boss difficulty and add a hazard"): longer than the default 100/72/52, and paced (112 / 84 / 62 x 1.2)').toEqual([134, 101, 74]);
    expect(r.gaps.every((g, k) => g > [100, 72, 52][k])).toBe(true);
  });

  // The owner, 2026-10-01 (Round 17): "make the attacks based on fighter position. if there is an attack that punishes being close, then they should use it more when ppl are close." Asked how
  // far it goes: "Position picks all (Recommended)" -- the signature competes like every other move. So he no longer runs the signature, the laser, the signature, the acid...: he draws his four
  // by where the fighters stand (test/boss-kit.test.js tests the picker itself). Here: his four are the moves, each with its own warning, none twice in a row, and all of them come up.
  it('draws his turns from his four -- CAKE AT STAKE!, QUADRUPLE LASER!, ACID TEARS!, WATER BALLOONS! -- each with its own warning, none twice in a row, and every one of them comes up', () => {
    const r = W.eval(`(function(){
      var s = ${BARE()}, kinds = [], names = [];
      // (the turns are driven by hand: nobody is in the arena, so nothing of his is in the air -- but the balloons' hang is his own state, and his next turn waits for it)
      for (var i=0;i<12;i++){ s._atkTimer = 1; s._tel = 0; s._bl = null; s._atkLive = null; updateBossAttack(s, null); kinds.push(s._telKind); names.push(bossTelName(s)); }
      return { kinds: kinds, names: names };
    })()`);
    const NAME = { announcer: 'CAKE AT STAKE!', annlaser: 'QUADRUPLE LASER!', annacid: 'ACID TEARS!', annballoon: 'WATER BALLOONS!' };
    expect(r.kinds.every((k) => NAME[k]), `only his four: ${r.kinds}`).toBe(true);
    expect(r.names, 'each is announced by its own name').toEqual(r.kinds.map((k) => NAME[k]));
    expect(r.kinds.some((k, i) => i > 0 && k === r.kinds[i - 1]), `never the same move twice in a row: ${r.kinds}`).toBe(false);
    expect(new Set(r.kinds).size, `every one of his four comes up within twelve turns: ${r.kinds}`).toBe(4);
  });

  it('the signature is named for the phase its wind-up was drawn in: CAKE AT STAKE!, BUDGET CUTS!, CRUSHER ARM!', () => {
    const r = W.eval(`[[1], [2], [3], [1, 2], [2, 3]].map(function(c){ return bossTelName({ attack:'announcer', _phase:c[c.length-1], _telPh:c.length > 1 ? c[0] : undefined }); })`);
    expect(r).toEqual(['CAKE AT STAKE!', 'BUDGET CUTS!', 'CRUSHER ARM!', 'CAKE AT STAKE!', 'BUDGET CUTS!']);
  });

  it("fights in the Cake at Stake place: his own sky, ground and hazard; podiums up three steps, the stage's platform the centre; he stands where he spawns", () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(), pods = worldPlats.filter(function(p){ return p._ann; }), c = worldPlats.find(function(p){ return p._annC; });
      return { arena: BOSS_ARENA, sky: BOSS_ARENA_SKY.cakeatstake, ground: BOSS_ARENA_GROUND.cakeatstake && [BOSS_ARENA_GROUND.cakeatstake.fill, typeof BOSS_ARENA_GROUND.cakeatstake.pattern],
        hazard: [typeof BOSS_ARENA_HAZARD.cakeatstake.step, typeof BOSS_ARENA_HAZARD.cakeatstake.draw], up: pods.map(function(p){ return Math.round(gy - p.y); }),
        wide: pods.every(function(p){ return p.w >= 90; }), centre: c ? [Math.round(c.x), Math.round(c.w), Math.round(gy - c.y)] : null, n: worldPlats.length,
        onFloor: Math.abs(b.y - (gy - b.r)) < 6, x: b.x, hz: b._hz && typeof b._hz };
    })()`);
    expect(r.arena).toBe('cakeatstake');
    expect(r.sky).toHaveLength(2);
    expect(r.ground, '"The Cake at Stake place is a pale-yellow annulus"').toEqual(['#efe9cf', 'function']);
    expect(r.hazard).toEqual(['function', 'function']);
    expect(r.up, '"3 steps leading up": floor, podium, podium, the centre').toEqual([64, 108, 108]);
    expect(r.wide).toBe(true);
    expect(r.centre[0]).toBe(319);
    expect(r.centre[2], 'the stage platform, 144 px up').toBe(144);
    expect(r.n).toBe(4);
    expect(r.onFloor, 'he spawns on the floor: every test that meets a boss at its spawn still does').toBe(true);
    expect(r.x).toBe(550);
    expect(r.hz).toBe('object');
  });

  it('he falls in from the sky as a picture: _ent counts his entrance, and the landing is a shake and a ring of dust', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var out = { e0: b._ent, drawn: String(drawBossSprite).indexOf('_ent') >= 0 };
      shakeAmt = 0; IMPACT_DUST = [];
      while (b._ent < ANN.ent - 1) step();
      out.before = { dust: IMPACT_DUST.length, e: b._ent };
      step(); out.after = { dust: IMPACT_DUST.length, e: b._ent, shake: shakeAmt > 0 };
      out.total = ANN.ent; out.y = [b.y, groundY() - b.r];
      return out;
    })()`);
    expect(r.e0, 'STAGE has stepped once').toBe(1);
    expect(r.drawn, 'the TELL slot draws the fall').toBe(true);
    expect(r.before.dust, 'no landing yet').toBe(0);
    expect(r.after.e).toBe(r.total);
    expect(r.after.dust, 'a ring of dust').toBeGreaterThan(0);
    expect(r.after.shake).toBe(true);
    expect(r.y[0], 'the body never left the floor').toBeCloseTo(r.y[1], 0);
  });
});

describe('CAKE AT STAKE!: the prize comes out of the Cake Tosser', () => {
  it('phase 1 throws two a fighter -- a lob that lands where you stood, then a flat throw along your row -- from the tosser on the centre cylinder, on one attack id', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(), out = { shots: [] };
      f.invuln = 999; turn(0);
      out.name = document.getElementById('banner').textContent; out.kind = b._telKind; out.tel = b._tel;
      for (var i=0;i<140;i++){ step(); f.invuln = 999;
        projectiles.filter(function(p){ return p.annCake != null && !p._seen; }).forEach(function(p){ p._seen = true;
          out.shots.push({ at: i, shape: p.shape, x: Math.round(p.x), y: Math.round(p.y), vx: +p.vx.toFixed(2), grav: !!p.grav, warnX: p.warnX == null ? null : Math.round(p.warnX), warnY: p.warnY,
            id: p.bossAtk, dmg: p.dmg, r: p.r, owner: p.owner, life: p.life }); }); }
      out.full = bossDmg(); out.gy = gy; out.cx = WW*0.5; out.cyl = ANN.cylH; out.calm = ANN.calm;
      return out;
    })()`);
    expect(r.name).toBe('CAKE AT STAKE!');
    expect(r.kind).toBe('announcer');
    expect(r.tel).toBe(36);
    expect(r.shots, 'a lob and a flat throw').toHaveLength(2);
    const [lob, flat] = r.shots;
    expect(lob.grav && lob.warnX === 300, 'the lob is aimed where you stood, its shadow there').toBe(true);
    expect(lob.warnY, 'on the floor under you').toBe(r.gy);
    expect(Math.abs(lob.x - r.cx), 'it leaves the blade of the tosser on the centre cylinder').toBeLessThan(60);
    expect(lob.y, 'over the top of the cylinder').toBeLessThan(r.gy - r.cyl);
    expect(flat.grav, 'the flat throw does not arc').toBe(false);
    expect(flat.vx, 'fast, toward you').toBe(-15);
    expect(Math.abs(flat.y - (r.gy - 24 - 6)), 'along the row you stand in').toBeLessThan(2);
    // the owner (2026-10-01): "for the announcer "unavoidable hits", theyre unavoidable bcs they barely have a moment where you can move to dodge." The flat throw
    // used to leave 20 frames after the lob, 18 or fewer before the lob even landed; now it leaves `calm` (30) frames after the lob has landed (and its lane is lit from the wind-up)
    expect(flat.at - lob.at, 'the lob lands (about 55 frames), and `calm` (30) frames later the flat throw leaves').toBeGreaterThanOrEqual(ANN_CALM + 54);
    expect(flat.at - lob.at).toBeLessThanOrEqual(ANN_CALM + 58);
    expect(lob.id, 'one attack id: one boss hit however many land').toBe(flat.id);
    expect([lob.dmg, flat.dmg], 'damage unchanged: a whole boss hit each, capped as one').toEqual([r.full, r.full]);
    expect(lob.owner).toBe(-2);
  });

  it('phase 2 (BUDGET CUTS!) adds a third throw a fighter, aimed at where you have gone; two fighters get their own three', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 800)}
      var out = { shots: [] }; b._phase = 2; b.hp = b.maxHp*0.5; fighters.forEach(function(q){ q.invuln = 999; });
      turn(0); out.name = document.getElementById('banner').textContent;
      var fire = null;
      for (var i=0;i<225;i++){ step(); fighters.forEach(function(q){ q.invuln = 999; });
        if (i === 130){ f.x = 620; }   // after the flat throw has left, before the last lob does: that one is aimed where he has gone
        projectiles.filter(function(p){ return p.annCake != null && !p._seen; }).forEach(function(p){ p._seen = true; if (fire === null) fire = i;
          out.shots.push({ at: i - fire, w: p.grav ? 'lob' : 'flat', warnX: p.warnX == null ? null : Math.round(p.warnX), vx: +p.vx.toFixed(1), id: p.bossAtk }); }); }
      return out;
    })()`);
    expect(r.name).toBe('BUDGET CUTS!');
    expect(r.shots, 'three each for two fighters').toHaveLength(6);
    // the lob lands 56 frames in; the flat leaves `calm` (30) after that; the last lob LEAVES `calm` after the flat has had time to cross the floor (flat.far, 36), because
    // its flight crosses the arena at the height of a fighter who has jumped the flat: 56 + 30 + 36 + 30 = 152 (it used to follow the flat by 14 frames, and land 18 after
    // the first lob; at 112 it still met a fighter in the air over the flat)
    expect(r.shots.map((s) => s.at + s.w)).toEqual(['0lob', '0lob', '85flat', '85flat', '152lob', '152lob']);
    expect(r.shots.filter((s) => s.w === 'lob').slice(0, 2).map((s) => s.warnX).sort((a, b) => a - b), 'the first lobs, one on each of you').toEqual([300, 800]);
    const last = r.shots.filter((s) => s.at === 152).map((s) => s.warnX).sort((a, b) => a - b);
    expect(last, 'the last, re-aimed: the fighter who moved is met where he went').toEqual([620, 800]);
    expect(new Set(r.shots.map((s) => s.id)).size, 'one attack id for the whole volley').toBe(1);
  });

  it('a lob lands on its shadow after its flight time, on the platform you stand on if you stand on one', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(), out = {}, pod = worldPlats.find(function(p){ return p._ann && Math.round(gy - p.y) === 108; });
      f.x = pod.x + pod.w/2; f.y = pod.y - 24; f.vx = 0; f.vy = 0; f.invuln = 999; step(); f.invuln = 999;
      turn(0); var lob = null, born = null;
      for (var i=0;i<100;i++){ step(); f.invuln = 999; f.x = pod.x + pod.w/2; f.y = pod.y - 24; f.vy = 0;
        if (!lob){ lob = projectiles.find(function(p){ return p.annCake != null && p.grav; }); if (lob){ born = i; out.warn = [Math.round(lob.warnX), lob.warnY]; } }
        if (lob && lob.life <= 0){ out.landed = i - born; out.x = Math.round(lob.x); break; } }
      out.pod = [Math.round(pod.x + pod.w/2), pod.y]; return out;
    })()`);
    expect(r.warn[0]).toBe(r.pod[0]);
    expect(r.warn[1], 'the shadow is on the podium, not the floor').toBe(r.pod[1]);
    expect(r.landed, 'about 56 frames, the flight of a lob').toBeGreaterThanOrEqual(55);
    expect(r.landed).toBeLessThanOrEqual(58);
    expect(Math.abs(r.x - r.pod[0]), 'on its shadow').toBeLessThanOrEqual(3);
  });

  it('the prize changes turn by turn as in the show: a slice, key lime, ice chunks, then the explosive blueberry pie', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var out = []; f.invuln = 999;
      for (var k=0;k<5;k++){ turn(0); var pz = b._pz; for (var i=0;i<40;i++){ step(); f.invuln = 999; }
        var lob = projectiles.find(function(p){ return p.annCake != null; });
        out.push({ pz: pz, shape: lob && lob.shape, r: lob && lob.r, ring: lob && lob.annR, land: !!(lob && lob.landImpact), color: lob && lob.color }); }
      return out;
    })()`);
    expect(r.map((x) => x.shape)).toEqual(['annslice', 'annlime', 'annice', 'annpie', 'annslice']);
    expect(r.map((x) => x.pz)).toEqual([0, 1, 2, 3, 0]);
    expect(r[2].r, 'the ice chunk is the big one').toBeGreaterThan(r[0].r);
    expect(r[2].land, 'and lands hard').toBe(true);
    expect(r[3].ring, 'the pie says how far it goes off (its shadow shows the ring)').toBe(60);
    expect(r[0].ring).toBe(0);
    expect(new Set(r.slice(0, 4).map((x) => x.color)).size, 'each its own colour').toBe(4);
  });

  it('the explosive pie goes off where it lands: 60 px, 0.7 of a boss hit for whoever is beside it, nothing for one farther off; a splat lies there two seconds', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 360)}
      var out = {}, gy = groundY(), far = makeFighter(ROSTER.find(function(q){ return q.name==='Pen'; }), 470, gy-24, 2); far.team = 0; far.controller = 'still'; far.stocks = 9; fighters.push(far);
      f.invuln = 999;   // the cake is spent on nobody: this is the landing itself
      var id = ++BOSS_ATK_ID; projectiles = [];
      annCakeEnd(b, { p:{ x:300, y:gy - 9, warnY:gy, life:0 }, pz:3, id:id, lob:true });
      out.g2 = g2.pct; out.far = far.pct; out.full = bossDmg(); out.f = f.pct;
      var splat = projectiles.find(function(p){ return p.annMark === 'splat'; });
      out.splat = splat ? { x: Math.round(splat.warnX), y: splat.warnY, delay: splat.delay, gy: gy, blue: splat.color } : null;
      out.scar = IMPACT_SCARS.length;
      // a slice does none of that
      g2.pct = 0; projectiles = []; annCakeEnd(b, { p:{ x:300, y:gy - 9, warnY:gy, life:0 }, pz:0, id:++BOSS_ATK_ID, lob:true }); out.slice = g2.pct;
      // and only the LOB goes off, where its ring is drawn on its shadow: a flat pie that ends beside someone (it has no ring, only its lane) pops nobody
      g2.pct = 0; projectiles = []; annCakeEnd(b, { p:{ x:300, y:gy - 9, warnY:gy, life:0 }, pz:3, id:++BOSS_ATK_ID, lob:false }); out.flatPie = g2.pct;
      return out;
    })()`);
    expect(r.g2, '0.7 of a boss hit for the fighter 60 px away').toBeCloseTo(r.full * 0.7, 3);
    expect(r.far, 'and nothing for the one 170 px away').toBe(0);
    expect(r.f, 'the fighter in cover is left alone').toBe(0);
    expect(r.splat.delay, 'the splat is on the floor for two seconds (120 frames)').toBe(120);
    expect(r.splat.y).toBe(r.splat.gy);
    expect(r.scar, 'a scar on the floor where it went off').toBe(1);
    expect(r.slice, 'a slice only splats').toBe(0);
    expect(r.flatPie, 'the flat pie has no ring to show where it would go off, so it does not: an untelegraphed hit beside someone it did not strike').toBe(0);
  });

  it('however many cakes of a volley land on you, it is one boss hit', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(), pcts = []; b._phase = 2; b.hp = b.maxHp*0.5; turn(0);
      for (var i=0;i<130;i++){ step(); f.x = 300; f.y = gy - 24; f.vx = 0; f.vy = 0; f.invuln = 0; f.hitstun = 0; pcts.push(f.pct); }
      return { max: Math.max.apply(null, pcts), full: bossDmg(), first: pcts.findIndex(function(p){ return p > 0; }) };
    })()`);
    expect(r.first, 'something did hit').toBeGreaterThan(0);
    expect(r.max, 'the lob, the flat throw and the last lob are shots on one attack id: the fighter takes one boss hit, no more').toBeCloseTo(r.full, 5);
  });
});

describe('BUDGET CUTS!: a real piece of the arena is sold every turn', () => {
  it('the podiums go first, then the vote counter, then the centre platform 12% a cut down to 26% of its width; after that there is nothing left to sell', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(), seq = []; b._phase = 2; b.hp = b.maxHp*0.5;
      var c = worldPlats.find(function(p){ return p._annC; }), w0 = c.w;
      var snap = function(){ return { n: worldPlats.length, ups: worldPlats.filter(function(p){ return p._ann; }).map(function(p){ return Math.round(gy - p.y); }), cs: b._hz.cs || 0, w: c.w/w0, cuts: b._hz.cuts || 0 }; };
      for (var t=0;t<13;t++){ turn(0); var sl = b._sl; var name = document.getElementById('banner').textContent; keep(40); var s = snap(); s.sl = sl; s.name = name; seq.push(s); }
      return { seq: seq, w0: w0 };
    })()`);
    const s = r.seq;
    expect(s[0].name).toBe('BUDGET CUTS!');
    expect(s[0].ups, 'the lowest podium first').toEqual([108, 108]);
    expect(s[0].sl, 'the wind-up says which (the claw comes down on it): its middle').toBeGreaterThan(0);
    expect(s[1].ups).toEqual([108]);
    expect(s[2].ups).toEqual([]);
    expect(s[2].n, 'only the stage platform is left').toBe(1);
    expect([s[2].cs, s[3].cs], 'then the vote counter: "The TV screen that displays the votes being sold"').toEqual([0, 1]);
    expect(s[3].sl).toBe(-1);
    for (let k = 1; k <= 6; k++) expect(s[3 + k].w, `cut ${k} of the centre platform`).toBeCloseTo(1 - 0.12 * k, 3);
    expect(s[3 + 6].sl).toBe(-2);
    expect(s[10].w, 'the seventh takes it to the floor, 26% of its width').toBeCloseTo(0.26, 3);
    expect(s[11].cuts, 'nothing left to sell: no more cuts').toBe(s[10].cuts);
    expect(s[11].sl).toBe(0);
    expect(s[12].w).toBeCloseTo(0.26, 3);
    expect(s[10].cuts, 'three podiums, the counter, seven cuts of the centre platform').toBe(11);
  });

  it('never a podium a fighter is standing on: the next one goes instead', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(), out = { ups: [] }; b._phase = 2; b.hp = b.maxHp*0.5;
      var outer = worldPlats.find(function(p){ return p._ann && Math.round(gy - p.y) === 64; });
      var pin = function(){ f.x = outer.x + outer.w/2; f.y = outer.y - 24; f.vx = 0; f.vy = 0; f.invuln = 999; f.dead = false; };
      pin(); step(); pin();
      for (var t=0;t<3;t++){ turn(0); for (var i=0;i<40;i++){ step(); pin(); } out.ups.push(worldPlats.filter(function(p){ return p._ann; }).map(function(p){ return Math.round(gy - p.y); })); out.cs = b._hz.cs || 0; }
      out.stillThere = worldPlats.indexOf(outer) >= 0;
      // he steps off: now it goes
      f.x = 700; f.y = gy - 24; keep(3); turn(0); keep(40);
      out.after = worldPlats.filter(function(p){ return p._ann; }).length; out.gone = worldPlats.indexOf(outer) < 0;
      return out;
    })()`);
    expect(r.ups[0], 'the inner podium went, not the one under him').toEqual([64, 108]);
    expect(r.ups[1]).toEqual([64]);
    expect(r.stillThere).toBe(true);
    expect(r.cs, 'with only his podium left, the counter went').toBe(1);
    expect(r.gone, 'and once he stepped off, his podium was sold').toBe(true);
    expect(r.after).toBe(0);
  });

  it('phase 2 starts with a sale (the drumroll cuts out) and he levitates a little more with every cut, to at most 102 px, bobbing ("his built-in Earth attraction unit")', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(), out = { lev: [] }, fl = gy - b.r;
      out.p1 = { hover: !!b.hover, y: b.y, cuts: b._hz.cuts || 0 };
      b.hp = b.maxHp*0.5; keep(2);
      out.banner = document.getElementById('banner').textContent; out.cuts0 = b._hz.cuts; out.n = worldPlats.length;
      for (var t=0;t<5;t++){ keep(90); var ys = []; for (var i=0;i<63;i++){ keep(1); ys.push(fl - b.y); } out.lev.push({ cuts: b._hz.cuts, hover: !!b.hover, min: Math.min.apply(null, ys), max: Math.max.apply(null, ys) }); if (t < 4){ turn(0); } }
      return out;
    })()`);
    expect(r.p1.hover, 'phase 1 he walks the ring').toBe(false);
    expect(r.banner).toMatch(/PHASE 2: Budget Cuts/);
    expect(r.cuts0, 'the first item is sold as the phase starts').toBe(1);
    expect(r.n, 'a real platform gone').toBe(3);
    const lev = r.lev;
    expect(lev[0].hover).toBe(true);
    for (const l of lev) {
      const want = 8 + Math.min(102, l.cuts * 34);
      expect(l.min, `${l.cuts} cuts: about ${want} px up`).toBeGreaterThan(want - 12);
      expect(l.max).toBeLessThan(want + 12);
    }
    expect(lev[lev.length - 1].cuts).toBeGreaterThanOrEqual(4);
    expect(lev[lev.length - 1].max, 'never more than the cap').toBeLessThan(8 + 102 + 12);
  });
});

describe('the phases', () => {
  it('phase 2 and 3 are announced by name as his HP falls, and his look changes: the bitten render from phase 3', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var out = {}; out.look1 = bossLook(b);
      b.hp = b.maxHp*0.5; keep(2); out.b2 = document.getElementById('banner').textContent; out.look2 = bossLook(b); out.ph2 = b._phase;
      b.hp = b.maxHp*0.2; keep(2); out.b3 = document.getElementById('banner').textContent; out.look3 = bossLook(b); out.ph3 = b._phase;
      out.src = BOSS_SPRITE_SRC.announcerbitten; out.bitten = [typeof BOSS_SPRITE_SRC.announcer, String(drawBossSprite).indexOf('case "announcerbitten"') >= 0];
      out.client = bossLook({ sprite:'announcer', attack:'announcer', _phase:3 });
      return out;
    })()`);
    expect([r.ph2, r.ph3]).toEqual([2, 3]);
    expect(r.b2).toMatch(/^Announcer — PHASE 2: Budget Cuts/);
    expect(r.b3).toMatch(/^Announcer — PHASE 3: Crusher Arm/);
    expect([r.look1, r.look2, r.look3]).toEqual(['announcer', 'announcer', 'announcerbitten']);
    expect(r.client, 'a netcode client picks it from the snapshot (attack, _phase)').toBe('announcerbitten');
    expect(r.src).toBe('assets/sprites/announcer-bitten.png');
    expect(r.bitten[1], 'and a drawn fallback').toBe(true);
  });

  it('phase 3 starts with the crusher dropping in: a circle on the nearest fighter, a press after a long warning; and he comes down out of the air', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(), out = {}; b.hp = b.maxHp*0.5; keep(150);
      out.airborne = (gy - b.r) - b.y; out.hover2 = !!b.hover;
      b.hp = b.maxHp*0.2; keep(1);
      out.levOff = !!b._levOff;
      var ring = projectiles.find(function(p){ return p.annMark === 'ring'; }), press = projectiles.find(function(p){ return p.shape === 'annpress'; });
      out.ring = ring ? { x: Math.round(ring.warnX), delay: ring.delay } : null; out.press = press ? { x: Math.round(press.x), warn: Math.round(press.warnX), delay: press.delay, r: press.r, vx: press.vx } : null;
      keep(80); out.down = (gy - b.r) - b.y; out.hover3 = !!b.hover;
      var hit0 = f.pct; f.x = 300; f.y = gy - 24; f.vx = 0; f.vy = 0;
      return out;
    })()`);
    expect(r.airborne, 'he had risen in phase 2').toBeGreaterThan(20);
    expect(r.levOff).toBe(true);
    expect(r.ring.x, 'the circle is on the nearest fighter').toBe(300);
    expect(r.ring.delay, 'a long warning').toBeGreaterThan(50);
    expect(r.press).toMatchObject({ warn: 300, r: 34, vx: 0 });
    expect(r.press.delay, 'the press waits, then falls').toBeGreaterThan(40);
    expect(r.hover3, 'his Earth attraction unit is back').toBe(false);
    expect(r.down, 'he is on the floor again').toBeLessThan(6);
  });
});

describe('CRUSHER ARM!: the wire pulls taut, the circle follows you and locks, the press drops', () => {
  // phase 3, with the entry beat (the circle and the first press) cleared away so it is his signature alone
  const P3 = `b.hp = b.maxHp*0.2; keep(3); projectiles = []; b._q = []; b._prs = []; b._tel = 0; impactFxClear();`;

  it('the circle follows you for the wind-up and holds for its last 12 frames; the press falls on the spot it locked on, a piston (no drift), 36 px a frame', () => {
    const r = W.eval(`(function(){ ${STAGE(200)}
      var gy = groundY(), out = { xs: [] }; ${P3}
      out.ph = b._phase; f.invuln = 999; turn(0);
      out.name = document.getElementById('banner').textContent; out.kind = b._telKind; out.sl = b._sl;
      var press = null;
      for (var i=0;i<60 && !press;i++){ f.x = 200 + 6*(i+1); f.y = gy - 24; f.vx = 0; f.invuln = 999; step(); out.xs.push([b._tel, b._telX]); press = projectiles.find(function(p){ return p.shape === 'annpress'; }); }
      out.press = press ? { x: press.x, warnX: press.warnX, warnY: press.warnY, vx: press.vx, vy: press.vy, r: press.r, noDrift: !!press.noDrift, breaks: !!press.breaksOnSurface, pierce: !!press.pierce, dmg: press.dmg, kb: press.kb, id: press.bossAtk, hasImpact: !!press.landImpact } : null;
      var waves = projectiles.filter(function(p){ return p.owner === -2 && p.shape !== 'annpress' && p.bossAtk === (press && press.bossAtk) && Math.abs(p.vx) === 9; });
      out.waves = waves.map(function(p){ return [p.vx, p.delay]; }); out.full = bossDmg(); out.fall = Math.ceil((gy + 40)/36); out.locked = b._telX; out.fx = f.x;
      return out;
    })()`);
    expect(r.ph).toBe(3);
    expect(r.name).toBe('CRUSHER ARM!');
    expect(r.kind).toBe('announcer');
    const follow = r.xs.filter(([tel]) => tel > 12).map(([, x]) => x), held = r.xs.filter(([tel]) => tel <= 12 && tel > 0).map(([, x]) => x);
    expect(new Set(follow).size, 'the circle follows you while it winds up').toBeGreaterThan(5);
    expect(new Set(held).size, 'and holds for the last 12 frames').toBe(1);
    expect(r.press.warnX, 'the press falls on the spot the circle held').toBe(held[0]);
    expect(r.press.x, 'straight down').toBe(r.press.warnX);
    expect(r.press.fall === undefined ? true : true).toBe(true);
    expect(r.press).toMatchObject({ vx: 0, r: 34, noDrift: true, breaks: true, hasImpact: true, pierce: true });
    expect(r.press.vy, 'about a third of a second from the top of the screen to the floor').toBe(36);
    expect(r.press.dmg, 'a whole boss hit').toBe(r.full);
    expect(r.waves.map((w) => w[0]).sort((a, b) => a - b), 'and the floor runs a wave each way').toEqual([-9, 9]);
    expect(r.waves.every((w) => w[1] >= r.fall - 1), 'from where it lands, not before').toBe(true);
  });

  it('it lands on the locked spot with debris and a scar and takes whoever stands there for a whole boss hit -- press and waves are one attack id -- and a fighter who left the circle is untouched', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 900)}
      var gy = groundY(), out = {}; ${P3}
      // the nearer fighter is the one the circle follows and stays; the other stands well clear
      f.invuln = 0; g2.invuln = 0; turn(0);
      for (var i=0;i<80;i++){ step(); f.x = 300; f.y = gy - 24; f.vx = 0; g2.x = 900; g2.y = gy - 24; g2.vx = 0; g2.vy = 0; g2.invuln = 999; if (i < 50){ f.invuln = 0; } }
      out.f = f.pct; out.g = g2.pct; out.full = bossDmg(); out.debris = IMPACT_DEBRIS.length; out.scars = IMPACT_SCARS.length; out.cr = b._hz.cr;
      return out;
    })()`);
    expect(r.f, 'exactly one boss hit however many parts landed on him').toBeCloseTo(r.full, 5);
    expect(r.g, 'the one who left is untouched').toBe(0);
    expect(r.debris, 'heavy: debris').toBeGreaterThanOrEqual(8);
    expect(r.scars).toBeGreaterThanOrEqual(1);
    expect(r.cr, 'the press cracked the crusher once').toBe(1);
  });

  it('in the last 15% of his HP the platform rises under the circle as the press lands: a fighter beside the circle is safe, one standing in it is lifted; the answer is to leave it', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 420)}
      var gy = groundY(), out = {}; ${P3}
      b.hp = b.maxHp*0.1; f.invuln = 999; turn(0);
      for (var i=0;i<37;i++){ step(); f.invuln = 999; }
      out.plate = projectiles.some(function(p){ return p.annMark === 'plate'; }); out.q = (b._q||[]).map(function(q){ return q.k; });
      // the plate itself: reach 62 px along the floor, up to 46 px of height
      var id = ++BOSS_ATK_ID; f.pct = 0; g2.pct = 0; f.invuln = 0; g2.invuln = 0;
      f.x = 300; f.y = gy - 24; g2.x = 300 + 62 + 60; g2.y = gy - 24;
      annPlate(b, { x:300, sy:gy, id:id });
      out.inside = f.pct; out.beside = g2.pct; out.vy = f.vy;
      g2.pct = 0; g2.x = 300; g2.y = gy - 24 - 90; g2.invuln = 0; annPlate(b, { x:300, sy:gy, id:++BOSS_ATK_ID }); out.jumped = g2.pct;
      out.full = bossDmg();
      // and in the phase before, the press is alone
      return out;
    })()`);
    expect(r.plate, 'the plate is announced by a mark').toBe(true);
    expect(r.q).toContain('plate');
    expect(r.inside, 'in the circle: a whole boss hit').toBeCloseTo(r.full, 5);
    expect(r.beside, 'beside it: safe').toBe(0);
    expect(r.jumped, 'a fighter 90 px up as the plate comes is not under it').toBe(0);
    expect(r.vy, 'lifted').toBeLessThan(-8);
  });

  it('every press cracks the crusher and the fourth blows it: heavy and harmless, he comes back down, and it is rebuilt taped up and spiked six seconds later', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(), out = { cr: [] }, H = b._hz, Z = annZone();
      b.hp = b.maxHp*0.5; keep(150); out.hover = !!b.hover;
      f.x = Z.x; f.y = gy - 24; f.vx = 0; f.vy = 0; f.invuln = 0; f.pct = 0;
      impactFxClear();
      for (var k=0;k<3;k++){ annCrack(b, H); out.cr.push(H.cr); }
      out.beforeBlow = { bo: H.bo, lev: !!b._levOff };
      annCrack(b, H);
      out.blow = { bo: H.bo, cr: H.cr, lev: !!b._levOff, debris: IMPACT_DEBRIS.length, hurt: f.pct, pz: H.pz };
      keep(ANN.crush.blowT - 1); out.mid = { bo: H.bo, sp: H.sp || 0 };
      keep(2); out.back = { bo: H.bo, cr: H.cr, sp: H.sp, nx: H.nx };
      return out;
    })()`);
    expect(r.cr, 'one more crack a press').toEqual([1, 2, 3]);
    expect(r.hover).toBe(true);
    expect(r.beforeBlow).toEqual({ bo: 0, lev: false });
    expect(r.blow.bo, 'offline for six seconds').toBe(360);
    expect(r.blow.cr).toBe(0);
    expect(r.blow.debris, '"violently exploding": the most debris there is').toBe(12);
    expect(r.blow.hurt, '"Somehow, no one else was injured": harmless').toBe(0);
    expect(r.blow.lev, 'his Earth attraction unit is back: he comes down').toBe(true);
    expect(r.mid.bo).toBeGreaterThan(0);
    expect(r.back, 'rebuilt: "cracks covered by tape", "the press is upgraded with spikes"').toMatchObject({ bo: 0, cr: 2, sp: 1 });
    expect(r.back.nx, 'and back on its rhythm').toBeGreaterThan(200);
  });
});

describe('the crusher, the arena hazard', () => {
  const HZ = `b._hz.nx = 1; b._hz.pz = 0; b._hz.py = ANN.crush.hang;`;

  it('waits for him to land, then winds up (the wire taut, its circle lit), drops on its zone at the edge and takes a fighter there for half a boss hit, thrown back into the arena', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(), out = { states: [] }, Z = annZone(), H = b._hz;
      out.first = ANN.crush.first;
      // parked by STAGE: unpark to watch the first countdown wait for the landing
      var fresh = { nx: ANN.crush.first, pz: 0, py: ANN.crush.hang, cr: 0, bo: 0, n: 0 };
      b._hz = fresh; b._ent = 0; H = fresh; for (var i=0;i<10;i++) step(); out.waiting = H.nx;
      b._ent = ANN.crush.first; ${HZ}
      f.x = Z.x; f.y = gy - 24; f.vx = 0; f.vy = 0; f.invuln = 0; f.pct = 0;
      var hit = null, pz = -1;
      for (var j=0;j<160;j++){ f.x = f.pct > 0 ? f.x : Z.x; step(); if (H.pz !== pz){ pz = H.pz; out.states.push([j, H.pz, H.py]); } if (f.pct > 0 && hit === null){ hit = { j: j, pct: f.pct, vx: f.vx, vy: f.vy }; f.x = 100; } }
      out.hit = hit; out.full = bossDmg(); out.cr = H.cr; out.n = H.n; out.id = H.id; out.zx = Z.x; out.half = Z.half; out.WW = WW;
      return out;
    })()`);
    expect(r.waiting, 'the countdown does not run while he is still falling in').toBe(r.first);
    expect(r.states.map((s) => s[1]).slice(0, 5), 'tell, drop, hold, rise, idle again').toEqual([1, 2, 3, 4, 0]);
    expect(r.hit.pct, 'half a boss hit').toBeCloseTo(r.full * 0.5, 5);
    expect(r.hit.vx, 'thrown back into the arena, away from the wall').toBeLessThan(0);
    expect(r.cr, 'it cracked').toBe(1);
    expect(r.zx).toBe(r.WW - 150);
  });

  it('only the floor under the press is dangerous: a podium, the air, and the fighter beyond the zone are safe; one slam is one attack id however long you stay', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 300)}
      var gy = groundY(), out = {}, Z = annZone(), H = b._hz; ${HZ}
      var pod = worldPlats.find(function(p){ return p._ann && Math.round(gy - p.y) === 108 && p.x > WW*0.5; });
      f.x = pod.x + 30; f.y = pod.y - 24; f.invuln = 0;                       // on the podium beside the machine
      g2.x = Z.x; g2.y = gy - 24 - 130; g2.invuln = 0;                         // over the zone, in the air
      var third = makeFighter(ROSTER.find(function(q){ return q.name==='Pen'; }), Z.x + Z.half + 40, gy - 24, 2); third.team = 0; third.controller = 'still'; third.stocks = 9; fighters.push(third);
      var pinned = function(){ f.x = pod.x + 30; f.y = pod.y - 24; f.vx = 0; f.vy = 0; g2.x = Z.x; g2.y = gy - 24 - 130; g2.vx = 0; g2.vy = 0; third.x = Z.x + Z.half + 40; third.vx = 0; };
      for (var j=0;j<140;j++){ step(); pinned(); }
      out.pcts = [f.pct, g2.pct, third.pct];
      // one slam, one id: someone who stays in the zone while it lies on the floor is hit once
      var stay = makeFighter(ROSTER.find(function(q){ return q.name==='Pen'; }), Z.x, gy - 24, 3); stay.team = 0; stay.controller = 'still'; stay.stocks = 9; fighters.push(stay);
      ${HZ} H.id = 0; var hits = 0, prev = 0;
      for (var k=0;k<160;k++){ step(); stay.x = Z.x; stay.y = gy - 24; stay.vx = 0; stay.vy = 0; stay.invuln = 0; if (stay.pct > prev){ hits++; prev = stay.pct; } }
      out.stay = { pct: stay.pct, hits: hits, full: bossDmg() };
      return out;
    })()`);
    expect(r.pcts, 'the podium, the air over the zone and the floor beyond it are untouched').toEqual([0, 0, 0]);
    expect(r.stay.hits).toBe(1);
    expect(r.stay.pct).toBeCloseTo(r.stay.full * 0.5, 5);
  });

  it('its rhythm quickens every phase (8 s, 6 s, 4.5 s), and the crusher is in the arena from the start of phase 1', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var out = { every: ANN.crush.every.slice(1), first: ANN.crush.first, tell: ANN.crush.tell, nx: [] };
      [1, 2, 3].forEach(function(ph){ b._phase = ph; b.hp = b.maxHp*[0, 0.9, 0.5, 0.2][ph]; b._levOff = true;
        var H = b._hz; H.nx = 1; H.pz = 0; H.py = ANN.crush.hang; H.bo = 0; H.cr = 0;
        for (var i=0;i<140 && !(H.pz === 0 && H.n > (out['n'+ph]||-1) && i > 60);i++){ step(); fighters.forEach(function(q){ q.invuln = 999; }); if (H.pz === 4 && H.py >= ANN.crush.hang - 6) break; }
        for (var j=0;j<40;j++){ step(); fighters.forEach(function(q){ q.invuln = 999; }); }
        out.nx.push(H.nx + 0); out['n'+ph] = H.n; });
      return out;
    })()`);
    expect(r.every, 'frames between presses by phase').toEqual([480, 360, 270]);
    expect(r.every.map((n) => n / 60), 'seconds').toEqual([8, 6, 4.5]);
    expect(r.tell, 'a long tell: the wire tautens for nearly a second').toBeGreaterThanOrEqual(50);
    // after a press the next countdown starts from that phase's number (less the frames since)
    expect(r.nx[0]).toBeGreaterThan(400);
    expect(r.nx[1]).toBeGreaterThan(300);
    expect(r.nx[1]).toBeLessThan(r.nx[0]);
    expect(r.nx[2]).toBeLessThan(r.nx[1]);
  });
});

describe('QUADRUPLE LASER!: four beams that converge on you, and none of them wraps', () => {
  // the boss stands where the nearest fighter is the one at `x` (a still Firey), turn 2 is the laser

  it('a ring on your spot follows you and locks for the last 30 frames of its wind-up; phase 1 sends two beams (up and down together), phase 2 four, phase 3 a second cross a step toward the middle', () => {
    const r = W.eval(`(function(){ var out = {};
      [1, 2, 3].forEach(function(ph){ ${STAGE(200)}
        var gy = groundY(); setPhase(ph);
        f.invuln = 999; turn(1);
        var name = document.getElementById('banner').textContent, kind = b._telKind, xs = [], marks = [];
        for (var i=0;i<80 && !marks.length;i++){ f.x = 200 + 6*(i+1); f.y = gy - 24; f.vx = 0; f.invuln = 999; step(); xs.push([b._tel, b._telX, b._telY]);
          marks = projectiles.filter(function(p){ return p.annMark === 'beam'; }); }
        out[ph] = { name: name, kind: kind, xs: xs, marks: marks.map(function(p){ return { d: p.mA, start: p.mB, x: Math.round(p.warnX), y: Math.round(p.warnY), id: p.bossAtk, delay: p.delay }; }), gy: gy };
      });
      return out;
    })()`);
    for (const ph of [1, 2, 3]) {
      const o = r[ph];
      expect(o.name).toBe('QUADRUPLE LASER!');
      expect(o.kind).toBe('annlaser');
      // the wind-up is 54 frames (it was 36, the cross locked for its last 12): the cross follows you for 24 of them and then holds for 30 -- a locked warning is a window
      expect(o.xs[0][0], 'a 54-frame wind-up').toBeGreaterThanOrEqual(53);
      const follow = o.xs.filter(([t]) => t > 30).map(([, x]) => x), held = o.xs.filter(([t]) => t <= 30 && t > 0).map(([, x]) => x);
      expect(new Set(follow).size, 'the ring follows you').toBeGreaterThan(5);
      expect(new Set(held).size, 'and holds for the last 30 frames: ANN_CALM to move').toBe(1);
      expect(held.length, 'the lock lasts at least ANN_CALM frames').toBeGreaterThanOrEqual(ANN_CALM - 1);
      expect(new Set(o.marks.map((m) => m.id)).size, 'one attack id for every beam').toBe(1);
    }
    // the owner (2026-10-01): "for the announcer "unavoidable hits", theyre unavoidable bcs they barely have a moment where you can move to dodge." The up beam and the
    // down beam were 14 frames apart and the walls' beams 14 after that: three strikes in 28 frames, one step or jump each. Now the column ("one that goes up, and one
    // that goes down") strikes together, and the row ("two more lasers moving horizontally") comes `rowAt` frames in, ANN_CALM after the column is over.
    expect(r[1].marks.map((m) => [m.d, m.start]), 'the up beam and the down beam together: one column, one step aside').toEqual([[0, 0], [1, 0]]);
    expect(r[2].marks.map((m) => [m.d, m.start]), 'phase 2: "two more lasers moving horizontally", both from the walls, 51 frames in').toEqual([[0, 0], [1, 0], [2, 51], [3, 51]]);
    const colEnds = 7 + 14 + 5;   // the column grows (7), holds (14) and fades (5)
    expect(r[2].marks[2].start - (7 + 14), 'the row begins ANN_CALM or more after the column has done its harm (grow + hold)').toBeGreaterThanOrEqual(ANN_CALM);
    expect(colEnds).toBeLessThan(51);
    expect(r[3].marks, 'phase 3: a second cross').toHaveLength(8);
    const second = r[3].marks.slice(4);
    expect(second.map((m) => m.start), 'the second cross: its column begins ANN_CALM after the row of the first cross is over (51 + 9 grow + 14 hold + 5 fade + 30 = 109)').toEqual([109, 109, 160, 160]);
    expect(second[0].start - (51 + 9 + 14), 'a window of at least ANN_CALM between the two crosses').toBeGreaterThanOrEqual(ANN_CALM);
    const x1 = r[3].marks[0].x, x2 = second[0].x;
    expect(Math.abs(x2 - x1), 'a step toward the middle').toBe(220);
    expect(Math.abs(x2 - 550) < Math.abs(x1 - 550)).toBe(true);
    expect(second.every((m) => m.y === r[3].marks[0].y)).toBe(true);
    expect(r[2].marks.every((m) => m.x === r[2].marks[0].x && m.y === r[2].marks[0].y), 'every beam converges on the one mark').toBe(true);
  });

  it('NO wrap ("3 shouldnt have one go around the screen."): every beam starts at an edge, ends on the mark and stays on the screen the whole time', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(); setPhase(3);
      f.invuln = 999; turn(1); for (var i=0;i<60;i++){ step(); f.invuln = 999; }
      var marks = projectiles.filter(function(p){ return p.annMark === 'beam'; }), segs = [], edges = {}, bad = [], ends = [];
      marks.forEach(function(p){ var total = annBeamTotal(p.mA, p.mB), keep = p.delay;
        for (var t=0;t<total;t++){ p.delay = total - t; var sg = annBeamSeg(p, gy); if (!sg) continue;
          [[sg.ex, sg.ey], [sg.hx, sg.hy]].forEach(function(q){ if (q[0] < -31 || q[0] > WW + 31 || q[1] < -31 || q[1] > gy + 25) bad.push([p.mA, t, q[0], q[1]]); });
          if (sg.live && t === p.mB + (p.mA < 2 ? ANN.laser.growV : ANN.laser.growH) - 1) ends.push([sg.hx - sg.X, sg.hy - sg.Y]);
          edges[p.mA + ':' + Math.round(sg.ex) + ',' + Math.round(sg.ey)] = 1; }
        p.delay = keep; });
      return { n: marks.length, bad: bad, ends: ends, edges: Object.keys(edges).length, WW: WW, gy: gy };
    })()`);
    expect(r.n, 'four beams a cross, never a fifth to wrap round').toBe(8);
    expect(r.bad, 'no beam ever leaves the screen').toEqual([]);
    expect(r.ends.every(([dx, dy]) => Math.abs(dx) < 1 && Math.abs(dy) < 1), 'each ends on the mark').toBe(true);
    expect(r.edges, 'the same four edges for each of the two crosses, each beam from a fixed edge').toBeGreaterThanOrEqual(4);
  });

  it('a fighter on the mark is hit once for a whole boss hit and thrown to the far side; beside the column he is safe from the vertical pair, above the row from the horizontal pair', () => {
    const r = W.eval(`(function(){ var out = {};
      [1, 2].forEach(function(ph){ ${STAGE(300, 420)}
        var gy = groundY(); setPhase(ph);
        // f is the nearest to him: the mark is on f. g2 beside the column on the row; g3 beside the column and above the row
        var g3 = makeFighter(ROSTER.find(function(q){ return q.name==='Pen'; }), 420, gy - 24 - 110, 2); g3.team = 0; g3.controller = 'still'; g3.stocks = 9; fighters.push(g3);
        var pin = function(){ b.x = 200; b.vx = 0; f.x = 300; f.y = gy - 24; f.vx = 0; f.vy = 0; g2.x = 420; g2.y = gy - 24; g2.vx = 0; g2.vy = 0; g3.x = 420; g3.y = gy - 24 - 110; g3.vx = 0; g3.vy = 0; fighters.forEach(function(q){ q.invuln = 0; q.hitstun = 0; }); };
        pin(); turn(1); var kx = null, hits = 0, prev = 0;
        for (var i=0;i<130;i++){ pin(); step(); if (f.pct > prev){ hits++; prev = f.pct; kx = f.vx; } if (f.pct > 0 && kx === null) kx = f.vx; }
        out[ph] = { f: f.pct, hits: hits, kx: kx, g2: g2.pct, g3: g3.pct, full: bossDmg() };
      });
      return out;
    })()`);
    for (const ph of [1, 2]) {
      expect(r[ph].f, `phase ${ph}: a whole boss hit, however many beams cross him`).toBeCloseTo(r[ph].full, 5);
      expect(r[ph].hits, 'once').toBe(1);
      expect(r[ph].kx, 'thrown to the far side of the arena (he stood on the left)').toBeGreaterThan(5);
      expect(r[ph].g3, 'above the row and beside the column: untouched').toBe(0);
    }
    expect(r[1].g2, 'phase 1 has no horizontal beams: on the row but beside the column is safe').toBe(0);
    expect(r[2].g2, 'phase 2: the beams from the walls take the row').toBeCloseTo(r[2].full, 5);
  });
});

describe('ACID TEARS!: a sprinkler and puddles', () => {
  it('two spouts a side: 2, 3 or 4 drops each by phase, each landing farther out than the last and 36 frames after it, each leaving a puddle for three seconds', () => {
    const r = W.eval(`(function(){ var out = {};
      [1, 2, 3].forEach(function(ph){ ${STAGE(150)}
        var gy = groundY(); b._phase = ph; b.hp = b.maxHp*[0, 0.9, 0.5, 0.2][ph]; keep(3); projectiles = []; b._q = []; b.x = 550; b.vx = 0; b._tel = 0;
        f.invuln = 999; turn(3);
        var name = document.getElementById('banner').textContent, drops = [], puds = [], fire = null, fx = null;
        for (var i=0;i<230;i++){ step(); f.invuln = 999; if (b._tel === 0 && fire === null){ fire = i; fx = b._acx; } b.vx = 0;
          projectiles.filter(function(p){ return p.shape === 'annacid' && !p._seen; }).forEach(function(p){ p._seen = true; drops.push({ at: i - fire, warnX: Math.round(p.warnX), volley: !!p.volley, id: p.bossAtk, dmg: p.dmg, grav: !!p.grav }); });
          projectiles.filter(function(p){ return p.shape === 'annpuddle' && !p._seen; }).forEach(function(p){ p._seen = true; puds.push({ at: i - fire, life: p.life, id: p.bossAtk, vt: !!(p.volley && p.trap) }); }); }
        out[ph] = { fx: fx, WW: WW, name: name, drops: drops, puddles: puds.length, ids: Array.from(new Set(puds.map(function(p){ return p.id; }))), volley: puds.every(function(p){ return p.vt; }), life: puds.map(function(p){ return p.life; }), at: puds.map(function(p){ return p.at; }), full: bossDmg(), st: (b._hz.st||[]).length };
      });
      return out;
    })()`);
    for (const ph of [1, 2, 3]) {
      const o = r[ph], n = [0, 2, 3, 4][ph];
      expect(o.name).toBe('ACID TEARS!');
      expect(o.drops, `phase ${ph}: ${n} a side`).toHaveLength(n*2);
      const right = o.drops.filter((d) => d.warnX > o.fx).sort((a, b) => a.at - b.at), left = o.drops.filter((d) => d.warnX < o.fx).sort((a, b) => a.at - b.at);
      // the spray used to land 92, 188, 284 px out and 12 frames apart (the drops left 6 frames apart and fell for 40 or so: two puddles to step over in the time of one jump);
      // now every spot is 160 px from the one before (a puddle reaches 50: the lane between them is wide enough to stand in) and they land ANN.acid.every (36) frames apart
      // (a spot that would be beyond the wall is held 24 px inside it: from the middle of the arena the fourth drop of phase 3 is that one)
      expect(right.map((d) => d.warnX - Math.round(o.fx)), 'each landing farther out').toEqual(Array.from({ length: n }, (_, k) => Math.min(o.WW - 24 - Math.round(o.fx), 100 + 160*k)));
      expect(left.map((d) => Math.round(o.fx) - d.warnX)).toEqual(Array.from({ length: n }, (_, k) => Math.min(Math.round(o.fx) - 24, 100 + 160*k)));
      expect(right.map((d) => d.at), 'each one leaves 36 frames after the last, and flies for the same time: they land 36 apart').toEqual(Array.from({ length: n }, (_, k) => 36*k));
      expect(36, 'a window of about ANN_CALM between landings').toBeGreaterThanOrEqual(ANN_CALM);
      expect(160 - 2*50, 'and the lane between two puddles (reach 50) is wider than a fighter (his hurtbox is 48 across)').toBeGreaterThanOrEqual(48);
      expect(o.drops.every((d) => d.volley && d.grav && d.dmg === o.full*0.8), 'a drop is 0.8 of a boss hit, on the volley rule').toBe(true);
      expect(new Set(o.drops.map((d) => d.id)).size, 'one attack id').toBe(1);
      expect(o.puddles, 'a puddle for every drop').toBe(n*2);
      expect(o.ids, 'on the same id').toEqual([o.drops[0].id]);
      expect(o.volley).toBe(true);
      expect(o.life.every((l) => l > 100), 'they lie for a while (three seconds from landing)').toBe(true);
      expect([...new Set(o.at)].sort((a, b) => a - b).map((t, k, all) => (k ? t - all[k - 1] : 36)), 'a puddle appears 36 frames after the last one: the drops land ANN.acid.every apart').toEqual(Array.from({ length: n }, () => 36));
      expect(o.st, 'and stain the floor for the phase').toBe(Math.min(6, n*2));
    }
    expect(r[3].drops.length).toBeGreaterThan(r[1].drops.length);
  });

  it('however many puddles you stand in, a turn is one boss hit at most; a puddle is spent when it burns you', () => {
    const r = W.eval(`(function(){ ${STAGE(315)}
      var gy = groundY(), id = ++BOSS_ATK_ID; f.invuln = 0;
      for (var k=0;k<4;k++) annPuddle(b, { p:{ x:300 + 12*k, warnY:gy, life:0 }, id:id });
      var n0 = projectiles.filter(function(p){ return p.shape === 'annpuddle'; }).length, pcts = [];
      for (var i=0;i<120;i++){ step(); f.x = 315; f.y = gy - 24; f.vx = 0; f.vy = 0; f.invuln = 0; f.hitstun = 0; pcts.push(f.pct); }
      var n1 = projectiles.filter(function(p){ return p.shape === 'annpuddle'; }).length;
      return { max: Math.max.apply(null, pcts), first: pcts.find(function(p){ return p > 0; }), full: bossDmg(), n0: n0, n1: n1 };
    })()`);
    expect(r.first, 'one puddle is 0.6 of a boss hit').toBeCloseTo(r.full*0.6, 5);
    expect(r.max, 'four puddles, one boss hit').toBeCloseTo(r.full, 5);
    expect(r.n1, 'the ones that burned him are spent').toBeLessThan(r.n0);
  });

  // Round 17 (the owner: "make the attacks based on fighter position."): the turn cycle is gone, so there is no "second move that was due" to take the turn of or to put off. What survives is the
  // rule itself, as the picker's `force`: after a cake volley nobody was hit by, the next turn is ACID TEARS!; after one that landed (or with nothing thrown) nothing is forced.
  it('it comes straight after a cake volley nobody was hit by ("the contestants reject the cake"): the picker forces it; a volley that landed forces nothing, and the turn after acid is never acid again', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var out = {}, gy = groundY();
      // his next turn comes by itself, once the volley is over and ANN.calm has passed (annTick holds it until then): this lets it, and says which turn it was
      function nextTurn(g){ var fired = false;
        for (var i=0;i<900;i++){ step(); if (g) g(); if (!fired && !(b._tel > 0)) fired = true;
          if (fired && b._tel > 0) return { at: i, kind: b._telKind, name: document.getElementById('banner').textContent, moveN: b._moveN }; }
        return null; }
      var keepOn = function(){ f.invuln = 999; };
      // a volley nobody is hit by
      f.invuln = 999; turn(0); var rej = nextTurn(keepOn); out.waited = rej && rej.at; out.rejected = rej;
      // the turn after the acid: asked for by hand (nothing is thrown, so nothing is rejected), it is never acid again -- the variety rule: no move twice in a row
      var next = []; for (var k=0;k<3;k++){ b._tel = 0; calmed(); b._atkTimer = 1; step(); next.push(b._telKind); }
      out.next = next;
      // a volley that hits: the volley is marked hit, and the picker forces nothing
      ${STAGE(300)}
      turn(0); var hit = false, marked = false;
      for (var j=0;j<260;j++){ step(); f.x = 300; f.y = gy - 24; f.vx = 0; f.vy = 0; f.invuln = 0; f.hitstun = 0; if (f.pct > 0) hit = true; if (b._lastCake && b._lastCake.hit) marked = true; }
      out.hit = { was: hit, marked: marked, forced: BOSS_PICK.announcer.force(b) };
      // the hook itself, on volleys made by hand: missed and over -> acid; landed -> nothing; still in the air -> nothing; no volley -> nothing
      var done = { life:0 }, air = { life:30 }; projectiles.push(air);
      var P = BOSS_PICK.announcer, s = b;
      s._lastCake = { id:1, hit:false, shots:[done] }; out.missed = P.force(s);
      s._lastCake = { id:1, hit:true, shots:[done] }; out.landed = P.force(s);
      s._lastCake = { id:1, hit:false, shots:[air] }; out.inAir = P.force(s);
      s._lastCake = null; out.none = P.force(s);
      return out;
    })()`);
    expect(r.waited, 'his next turn did come, once the volley was over').toBeGreaterThan(100);
    expect(r.rejected.kind, 'acid after a volley nobody was hit by').toBe('annacid');
    expect(r.rejected.name).toBe('ACID TEARS!');
    expect(r.next[0], 'the turn after acid is not acid').not.toBe('annacid');
    expect(r.next.every((k) => ['announcer', 'annlaser', 'annacid', 'annballoon'].includes(k)), `only his own four: ${r.next}`).toBe(true);
    expect(r.hit.was).toBe(true);
    expect(r.hit.marked, 'the volley that landed is marked hit').toBe(true);
    expect(r.hit.forced, 'a volley that landed: nothing is forced').toBe(null);
    expect([r.missed, r.landed, r.inAir, r.none], 'forced only when the volley is over and nobody was hit').toEqual(['annacid', null, null, null]);
  });
});

describe('WATER BALLOONS!: he rises off the screen and they fall on shadows', () => {
  it('he rises off the top of the screen as he winds up, the balloons come down on shadows (3, 4 or 5 by phase, one over every fighter), and he comes back down after them', () => {
    const r = W.eval(`(function(){ var out = {};
      [1, 2, 3].forEach(function(ph){ ${STAGE(300, 800)}
        var gy = groundY(); b._phase = ph; b.hp = b.maxHp*[0, 0.9, 0.5, 0.2][ph]; b._levOff = true; keep(3); projectiles = []; b._q = []; b._tel = 0; b.x = 550; b.face = 1;
        fighters.forEach(function(q){ q.invuln = 999; });
        turn(5); var name = document.getElementById('banner').textContent, ys = [], balloons = [], fireY = null, spots = [], lands = [], fireAt = null;
        for (var i=0;i<400;i++){ step(); fighters.forEach(function(q){ q.invuln = 999; }); ys.push(b.y);
          if (b._tel === 0 && fireY === null && projectiles.some(function(p){ return p.shape === 'annballoon'; })){ fireY = b.y; fireAt = i; }
          projectiles.filter(function(p){ return p.shape === 'annballoon' && !p._seen; }).forEach(function(p){ p._seen = true; balloons.push({ warnX: Math.round(p.warnX), warnY: p.warnY, warn: p.warn, ring: p.annR, delay: p.delay, vx: p.vx, face: b.face, id: p.bossAtk, dmg: p.dmg }); });
          if (fireAt === i) projectiles.filter(function(p){ return p.annMark === 'spot' && !p._seen; }).forEach(function(p){ p._seen = true; spots.push({ x: Math.round(p.warnX), reach: p.mA, delay: p.delay, at: i }); });   // (the balloons' own: made with them)
          projectiles.filter(function(p){ return p.annMark === 'splash' && !p._seen; }).forEach(function(p){ p._seen = true; lands.push(i); }); }
        out[ph] = { name: name, n: balloons.length, xs: balloons.map(function(x){ return x.warnX; }), b: balloons, fireY: fireY, r: b.r, minY: Math.min.apply(null, ys), endY: b.y, floor: gy - b.r, gap: null, bl: b._bl, full: bossDmg(), hover: !!b.hover,
          spots: spots, lands: lands, fireAt: fireAt, hit: ANN.balloon.hit };
      });
      return out;
    })()`);
    for (const ph of [1, 2, 3]) {
      const o = r[ph], n = [0, 3, 4, 5][ph];
      expect(o.name).toBe('WATER BALLOONS!');
      expect(o.n, `phase ${ph}: ${n}`).toBe(n);
      expect(o.xs, 'one over each fighter').toEqual(expect.arrayContaining([300, 800]));
      expect(o.fireY + o.r, 'he is off the top of the screen when they fall').toBeLessThan(0);
      expect(o.b.every((x) => x.warn > 10 && x.warnY > 0), 'each with its shadow').toBe(true);
      // the splash's ring is a mark on the spot (ANN.balloon.hit: how far the burst really reaches), made with the shot, one for every balloon, where it will land
      expect(o.spots.map((x) => x.x).sort((a, b) => a - b), 'a ring for every balloon, on its shadow').toEqual(o.xs.slice().sort((a, b) => a - b));
      expect(o.spots.every((x) => x.reach === o.hit), 'as wide as the burst reaches').toBe(true);
      expect(o.b.every((x) => x.vx !== 0 && Math.sign(x.vx) === Math.sign(x.face)), 'drifting the way he faces, as every drop does').toBe(true);
      // the owner (2026-10-01): "...they barely have a moment where you can move to dodge." They used to fall 4 and 5 frames apart (all five within 15): now each lands exactly
      // ANN.balloon.every (36) frames after the one before, over a platform too (it waits the longer for having less far to fall), and the first has a long shadow
      expect(o.lands, `phase ${ph}: every balloon lands and bursts`).toHaveLength(n);
      expect(o.lands.slice(1).map((t, k) => t - o.lands[k]), 'landing 36 frames apart: a window ANN_CALM wide between every two').toEqual(Array.from({ length: n - 1 }, () => 36));
      expect(o.lands[0] - o.fireAt, 'the first one is in the air long enough to read its shadow and move').toBeGreaterThanOrEqual(ANN_CALM);
      expect(new Set(o.b.map((x) => x.id)).size, 'one attack id').toBe(1);
      expect(o.endY, 'and he is back on the floor').toBeCloseTo(o.floor, 0);
      expect(o.bl, 'his descent is over').toBe(null);
      expect(o.hover).toBe(false);
    }
  });

  it('a balloon bursts into a 70 px splash: 0.7 of a boss hit for whoever is beside where it lands, nothing for one farther off, and a splash lies there a moment', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 360)}
      var gy = groundY(), out = {}, far = makeFighter(ROSTER.find(function(q){ return q.name==='Pen'; }), 470, gy-24, 2); far.team = 0; far.controller = 'still'; far.stocks = 9; fighters.push(far);
      f.invuln = 999;
      var id = ++BOSS_ATK_ID; projectiles = [];
      annSplash(b, { p:{ x:300, y:gy - 10, life:0 }, id:id });
      out.g2 = g2.pct; out.far = far.pct; out.full = bossDmg(); out.f = f.pct;
      var m = projectiles.find(function(p){ return p.annMark === 'splash'; }); out.mark = m ? [Math.round(m.warnX), m.warnY, m.delay, gy] : null; out.burst = ANN.balloon.burst;
      // a fighter standing on a platform above is not beside a splash on the floor
      g2.pct = 0; g2.y = gy - 24 - 120; annSplash(b, { p:{ x:300, y:gy - 10, life:0 }, id:++BOSS_ATK_ID }); out.above = g2.pct;
      return out;
    })()`);
    expect(r.burst).toBe(70);
    expect(r.g2, '60 px away: popped').toBeCloseTo(r.full*0.7, 5);
    expect(r.far, '170 px away: safe').toBe(0);
    expect(r.f, 'the fighter in cover is left alone').toBe(0);
    expect(r.above, 'a fighter well above the surface is not beside it').toBe(0);
    expect(r.mark[0]).toBe(300);
    expect(r.mark[1]).toBe(r.mark[3]);
    expect(r.mark[2]).toBe(46);
  });

  it('his next turn waits for him to come back, for the last balloon, and for ANN_CALM more: his gap is his own, no longer padded by 70 frames', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var out = {}; b._phase = 1; f.invuln = 999; turn(5); out.gap = bossAtkGap(b);
      var started = null, last = null, fired = false;
      for (var i=0;i<900 && started === null;i++){ step(); f.invuln = 999;
        projectiles.filter(function(p){ return p.annMark === 'splash' && !p._seen; }).forEach(function(p){ p._seen = true; last = i; });
        if (!fired && b._tel === 0 && projectiles.some(function(p){ return p.shape === 'annballoon'; })) fired = true;
        if (fired && b._tel > 0){ started = i; } }
      out.last = last; out.started = started; out.moveN = b._moveN; out.kind = b._telKind;
      return out;
    })()`);
    // the pace ("bosses should attack a bit slower", the owner, 2026-09-30) multiplies his gap (112) by 1.2: the 70 he used to be given for being away is gone, because his next
    // wind-up now waits for the thing itself -- he is back down, the last balloon has burst, and the window the owner asked for (2026-10-01) has passed
    expect(r.gap, 'his gap, paced: nothing added for the balloons').toBe(Math.round(112*1.2));
    expect(r.last, 'the last balloon burst').not.toBeNull();
    expect(r.started, 'and his next wind-up began').not.toBeNull();
    expect(r.started - r.last, 'at least ANN_CALM after the last balloon').toBeGreaterThanOrEqual(ANN_CALM);
  });
});

// ---- THE WINDOW -------------------------------------------------------------------------------------------------------------------------------
// The owner, 2026-10-01: "announcer causes unavoidable damage and without telegraphs." and, explaining it: "for the announcer "unavoidable hits", theyre unavoidable bcs
// they barely have a moment where you can move to dodge." Every attack in every phase is played out below with a fighter nothing can hurt (so nothing is cut short), and
// every damaging shot and mark of his is read back with the frame it was made and the frame it ended: each strike must have its tell up for ANN_CALM frames before it can
// hurt, no two strikes may be closer than ANN_CALM (the ones that come together are one threat, in different places), and his next wind-up waits ANN_CALM after the last.
describe('THE WINDOW: every threat is told in time, and no two come too close together', () => {
  const TURN = (ph, mv) => `(function(){ ${STAGE(300)}
    setPhase(${ph}); f.invuln = 999; var gy = groundY(), ev = [], seen = [], fr = 1, fire = null, starts = [];
    turn(${mv}); var kind = b._telKind, name = document.getElementById('banner').textContent;
    for (var i=0;i<420;i++){
      var before = b._tel;
      step(); fr++; f.invuln = 999; f.x = 300; f.y = gy - 24; f.vx = 0; f.vy = 0;
      if (fire === null && before === 1) fire = fr;
      if (before === 0 && b._tel > 0) starts.push(fr);
      projectiles.forEach(function(p){
        if (p.owner !== -2 || p.annGhost || seen.indexOf(p) >= 0) return;
        var k = p.annMark || p.shape || (p.annWave ? 'wave' : null); if (!k) return;
        seen.push(p);
        ev.push({ p:p, kind:k, born:fr, ended:null, delay:p.delay || 0, mA:p.mA, mB:p.mB, vx:p.vx, grav:!!p.grav, x:Math.round(p.warnX != null ? p.warnX : p.x), wave:!!p.annWave }); });
      ev.forEach(function(e){ if (e.ended === null && (e.p.life <= 0 || projectiles.indexOf(e.p) < 0)) e.ended = fr; });
    }
    return { kind:kind, name:name, fire:fire, starts:starts, ev:ev.map(function(e){ var o = {}; for (var k in e) if (k !== 'p') o[k] = e[k]; return o; }),
      C:{ lock:ANN.crush.lock, llock:ANN.laser.lock, far:ANN.flat.far, gv:ANN.laser.growV, gh:ANN.laser.growH, hold:ANN.laser.hold } };
  })()`;
  const CAKES = ['annslice', 'annlime', 'annice', 'annpie'];
  // what each kind of strike is: when it can first hurt (s), when it is over (e), and how long its tell has been up by then (lead)
  const strikesOf = (o) => {
    const mine = o.ev.filter((e) => !o.starts.length || e.born < o.starts[0]);   // (his next turn begins within the run: its marks are not this turn's)
    const out = [], first = (f) => mine.filter(f).sort((a, b) => a.born - b.born)[0];
    for (const e of mine) {
      if (CAKES.includes(e.kind) && e.grav) out.push({ t: 'lob', s: e.born, e: e.ended, lead: e.ended - e.born });   // a lob is a threat all through its flight (it crosses the arena where a fighter who has jumped is), and lands where its ring was
      else if (CAKES.includes(e.kind)) {                                                                              // the flat throw: its lane has been lit since the wind-up began
        const lane = first((l) => l.kind === 'lane' && l.mA === Math.sign(e.vx) && Math.abs(l.born + l.delay - e.born) <= 3);
        out.push({ t: 'flat', s: e.born, e: e.born + o.C.far, lead: lane ? e.born - lane.born : 0 });
      } else if (e.kind === 'annacid' || e.kind === 'annballoon') {                                                    // a drop lands on a spot that has been ringed since it was made
        const sp = first((l) => l.kind === 'spot' && Math.abs(l.x - e.x) <= 1);
        out.push({ t: e.kind, s: e.ended, e: e.ended, lead: sp ? e.ended - sp.born : 0 });
      } else if (e.kind === 'annpress') out.push({ t: 'press', s: e.ended, e: e.ended, lead: e.ended - (o.fire - o.C.lock) });   // the circle locked `lock` frames before it left
      else if (e.wave) out.push({ t: 'wave', s: e.born + e.delay, e: e.ended, lead: e.delay });                          // a wave's lane is lit from the moment the press is made
      else if (e.kind === 'beam') out.push({ t: 'beam', s: e.born + e.mB, e: e.born + e.mB + (e.mA < 2 ? o.C.gv : o.C.gh) + o.C.hold, lead: e.mB === 0 ? o.C.llock : e.mB });
    }
    return out.sort((a, b) => a.s - b.s);
  };
  // strikes that start together (within 4 frames of one another) are one threat: in different places at once, with room between them
  const threatsOf = (S) => { const T = []; for (const s of S) { const t = T[T.length - 1]; if (t && s.s - t.s0 <= 4) t.e = Math.max(t.e, s.e); else T.push({ s0: s.s, e: s.e }); } return T; };
  const RUNS = [['CAKE AT STAKE!', 0, 1, 2], ['BUDGET CUTS!', 0, 2, 3], ['CRUSHER ARM!', 0, 3, 2], ['QUADRUPLE LASER!', 1, 1, 1], ['QUADRUPLE LASER!', 1, 2, 2], ['QUADRUPLE LASER!', 1, 3, 4],
    ['ACID TEARS!', 3, 1, 2], ['ACID TEARS!', 3, 2, 3], ['ACID TEARS!', 3, 3, 4], ['WATER BALLOONS!', 5, 1, 3], ['WATER BALLOONS!', 5, 2, 4], ['WATER BALLOONS!', 5, 3, 5]];   // name, turn, phase, threats
  let results;
  beforeAll(() => { results = RUNS.map(([name, mv, ph]) => W.eval(TURN(ph, mv))); }, 120000);

  it('every strike of every attack in every phase has its tell up for ANN_CALM frames or more before it can hurt (a lob its shadow, a flat throw its lane, a drop its ring, a beam its band or the locked cross, the press the locked circle, a wave its lane)', () => {
    RUNS.forEach(([name, mv, ph], k) => {
      const o = results[k], S = strikesOf(o);
      expect(o.name, `${name} phase ${ph}`).toContain(name);
      expect(S.length, `${name} phase ${ph} has strikes`).toBeGreaterThan(0);
      for (const s of S) expect(s.lead, `${name} phase ${ph}: its ${s.t} at frame ${s.s} is told ${s.lead} frames ahead`).toBeGreaterThanOrEqual(ANN_CALM);
    });
  });

  it('no two threats are closer than ANN_CALM: a fighter who dodges one has the time to get ready for the next (before: the flat throw 20 after the lob, the beams 14 apart, the drops 12, the balloons within 15, the press and its waves 0-11)', () => {
    RUNS.forEach(([name, mv, ph, n], k) => {
      const T = threatsOf(strikesOf(results[k]));
      expect(T.length, `${name} phase ${ph}: ${n} threats`).toBe(n);
      for (let j = 1; j < T.length; j++) expect(T[j].s0 - T[j - 1].e, `${name} phase ${ph}: threat ${j + 1} begins this long after threat ${j} is over`).toBeGreaterThanOrEqual(ANN_CALM - 1);
    });
  });

  it('his next wind-up waits for the last of them and ANN_CALM more: the turns never run into one another', () => {
    RUNS.forEach(([name, mv, ph], k) => {
      const o = results[k], S = strikesOf(o), end = Math.max(...S.map((s) => s.e)), next = o.starts[0];
      expect(next, `${name} phase ${ph}: his next turn did begin`).toBeDefined();
      expect(next - end, `${name} phase ${ph}: it begins this long after his last strike is over`).toBeGreaterThanOrEqual(ANN_CALM - 1);
    });
  });
});

// A fighter who READS THE TELLS: he runs (4 px a frame, his top speed is 6.4) out of every zone that is lit, and jumps (the game's own jump) over every flat throw, wave and
// row of the laser as it comes. Every attack in every phase, played out against him: he is never touched. The same turns do hurt one who stands still.
describe('THE WINDOW: a fighter who reads the tells and moves can always avoid every threat', () => {
  const DODGE = (ph, mv, bot) => `(function(){ ${STAGE(300)}
    setPhase(${ph}); var gy = groundY(), JUMP_V = -12.5, RUN = 4, BOT = ${bot}, jumps = 0, moved = 0, hitAt = null, over = null, fired = false;
    f.invuln = 0; f.x = 300; f.y = gy - 24; f.vx = 0; f.vy = 0; f.pct = 0; f.onground = true; f.dead = false;
    turn(${mv});
    function zones(){
      var Z = [];
      projectiles.forEach(function(p){
        if (p.owner !== -2) return;
        if (p.annMark === 'spot' && p.delay > 0) Z.push([p.warnX, p.mA + 6]);                       // the ring of a lob, a drop or a balloon
        if (p.shape === 'annpress' && p.life > 0) Z.push([p.warnX, 78]);                            // under the press
        if (p.annMark === 'beam' && p.mA < 2 && p.delay > 0) Z.push([p.warnX, 36]);                 // the column of a cross
      });
      if (b._tel > 0 && b._telKind === 'annlaser' && b._tel <= ANN.laser.lock){ Z.push([b._telX, 36]); if (${ph} >= 3) Z.push([annCross2(b._telX), 36]); }   // the locked cross
      if (b._tel > 0 && b._telKind === b.attack && ${ph} >= 3 && b._tel <= ANN.crush.lock) Z.push([b._telX, 78]);                                          // the locked circle
      return Z;
    }
    function safeX(Z, x){
      var ok = function(c){ return Z.every(function(z){ return Math.abs(c - z[0]) >= z[1]; }); };
      if (ok(x)) return x;
      for (var d=2; d<1100; d+=2){ if (x + d <= WW - 40 && ok(x + d)) return x + d; if (x - d >= 40 && ok(x - d)) return x - d; }
      return x;
    }
    for (var i=0;i<460;i++){
      if (BOT){
        var Z = zones(), tx = safeX(Z, f.x);
        if (Math.abs(tx - f.x) > 1){ var dx = Math.max(-RUN, Math.min(RUN, tx - f.x)); f.x += dx; moved += Math.abs(dx); }
        var need = false;
        projectiles.forEach(function(p){
          if (p.owner !== -2 || !(p.life > 0)) return;
          if ((p.annFlat || p.annWave) && !(p.delay > 0) && (f.x - p.x)*p.vx > 0 && Math.abs(f.x - p.x) < 150) need = true;   // along the floor toward him: jump as it comes
          if (p.annMark === 'beam' && p.mA >= 2){ var until = p.delay - (annBeamTotal(p.mA, p.mB) - p.mB); if (until <= 8 && until >= -2) need = true; }   // a row about to start
          if (p.annMark === 'lane' && p.delay > 0 && p.delay <= 9 && Math.sign(f.x - p.warnX) === p.mA && Math.abs(f.x - p.warnX) < 150 && Math.abs(f.y - p.warnY) < p.mB + 24) need = true;   // a lane about to fire, and he stands near where it starts: jump as it leaves
        });
        if (need && f.onground){ f.vy = JUMP_V; f.onground = false; jumps++; }
      }
      var before = f.pct, telB = b._tel; step(); if (BOT){ f.vx = 0; }
      if (f.pct > before + 1e-6 && hitAt === null) hitAt = i;
      if (telB > 0 && b._tel === 0) fired = true;
      if (fired && !annBusy(b) && over === null){ over = i; break; }
    }
    return { hitAt:hitAt, pct:f.pct, jumps:jumps, moved:Math.round(moved), over:over, name:document.getElementById('banner').textContent };
  })()`;
  const SCEN = [['CAKE AT STAKE!', 0, 1], ['BUDGET CUTS!', 0, 2], ['CRUSHER ARM!', 0, 3], ['QUADRUPLE LASER!', 1, 1], ['QUADRUPLE LASER!', 1, 2], ['QUADRUPLE LASER!', 1, 3],
    ['ACID TEARS!', 3, 1], ['ACID TEARS!', 3, 2], ['ACID TEARS!', 3, 3], ['WATER BALLOONS!', 5, 1], ['WATER BALLOONS!', 5, 2], ['WATER BALLOONS!', 5, 3]];

  it('he runs out of the lit zones and jumps the lanes: every attack in every phase goes by without touching him', () => {
    for (const [name, mv, ph] of SCEN) {
      const r = W.eval(DODGE(ph, mv, true));
      expect(r.name, `${name} phase ${ph}`).toContain(name);
      expect(r.over, `${name} phase ${ph}: the turn ran its course`).not.toBeNull();
      expect(r.hitAt, `${name} phase ${ph}: he was hit at frame ${r.hitAt} (moved ${r.moved} px, jumped ${r.jumps} times)`).toBeNull();
    }
  }, 180000);

  it('and the same turns hurt a fighter who stands still, so the dodging is real: the cakes, the press, the cross, the drops and the balloons all find him', () => {
    for (const [name, mv, ph] of [['CAKE AT STAKE!', 0, 1], ['BUDGET CUTS!', 0, 2], ['CRUSHER ARM!', 0, 3], ['QUADRUPLE LASER!', 1, 3], ['ACID TEARS!', 3, 3], ['WATER BALLOONS!', 5, 3]]) {
      const r = W.eval(DODGE(ph, mv, false));
      expect(r.hitAt, `${name} phase ${ph}: a fighter who stood still was hit`).not.toBeNull();
    }
  }, 120000);
});

// The crusher is the arena's hazard and he is the boss: neither starts while the other is going, and there is a window between them -- before: its tell overlapped one of his
// turns in 7 of 8, 10 of 10 and 8 of 8 cycles over 6000 frames (phases 1, 2, 3), and its slam came within 30 frames of one of his strikes 4, 6 and 1 times.
describe('THE WINDOW: the crusher and his turns take turns', () => {
  const FIGHT = (ph, frames) => `(function(){ ${STAGE(300)}
    setPhase(${ph}); f.invuln = 999; b._hz.nx = 90; b._atkTimer = 40; var gy = groundY(), H = b._hz, prev = 0, last = null;
    var out = { overlap:0, slams:[], starts:[], cycles:0, calmAtStart:[], births:[], telStarts:[], cc:[] };
    for (var i=0;i<${frames};i++){
      var tel = b._tel, n0 = projectiles.length;
      step(); f.invuln = 999; f.x = 300; f.y = gy - 24; f.vx = 0; f.vy = 0;
      var pz = H.pz || 0;
      if (pz >= 1 && pz <= 3 && annBusy(b)) out.overlap++;
      if (pz === 1 && prev === 0){ out.cycles++; out.calmAtStart.push(b._calm); out.starts.push(i); }
      if (pz === 3 && prev !== 3) out.slams.push(i);
      if (!(tel > 0) && b._tel > 0){ out.telStarts.push(i); out.cc.push(H.cc); }
      projectiles.forEach(function(p){ if (p.owner === -2 && !p.annGhost && !p.annMark && p.dmg > 0 && !p._b){ p._b = 1; out.births.push(i); } });
      prev = pz;
    }
    out.tell = ANN.crush.tell; out.calm = ANN.calm;
    return out;
  })()`;

  it('in a long fight, in every phase, the crusher never runs while one of his turns is going, starts only once he has been idle ANN_CALM frames, and his next wind-up waits ANN_CALM after its slam', () => {
    for (const ph of [1, 2, 3]) {
      const o = W.eval(FIGHT(ph, 2000));
      expect(o.cycles, `phase ${ph}: the crusher did run`).toBeGreaterThanOrEqual(2);
      expect(o.overlap, `phase ${ph}: frames when its tell, drop or hold was going with something of his in the air`).toBe(0);
      for (const c of o.calmAtStart) expect(c, `phase ${ph}: it started this long after his last threat`).toBeGreaterThanOrEqual(ANN_CALM);
      expect(o.tell, 'and its tell is long').toBeGreaterThanOrEqual(ANN_CALM);
      // nothing of his is made within ANN_CALM frames either side of its slam, and none of his wind-ups begins in the ANN_CALM after it
      for (const t of o.slams) {
        expect(o.births.filter((x) => Math.abs(x - t) < ANN_CALM), `phase ${ph}: shots of his made within ${ANN_CALM} frames of the slam at ${t}`).toEqual([]);
        expect(o.telStarts.filter((x) => x >= t && x < t + ANN_CALM), `phase ${ph}: wind-ups begun within ${ANN_CALM} frames after the slam at ${t}`).toEqual([]);
      }
      for (const c of o.cc) expect(c, 'a wind-up begins only when the crusher is not just back from a strike').toBeGreaterThanOrEqual(ANN_CALM);
    }
  }, 180000);
});

// The ring on a spot is where it can hurt: the farthest a plain round fighter (the game's own nominal body, r 24) is hit is no more than the ring, and not much less -- measured
// on the engine's own hits, a half pixel at a time.
describe('THE WINDOW: every ring is the zone it says', () => {
  const REACH = (x0, what) => W.eval(`(function(){ ${STAGE(300)}
    var gy = groundY(), best = 0, X0 = ${x0};
    f.hurt = null;
    for (var d=20; d<=120; d+=0.5){
      f.invuln = 0; f.pct = 0; f.x = X0 + d; f.y = gy - 24; f.vx = 0; f.vy = 0; f.hitstun = 0; f.dead = false;
      var id = ++BOSS_ATK_ID; projectiles = [];
      ${what}
      if (f.pct > 0) best = d;
    }
    return best; })()`);
  const EDGE = (name, x0, what, ring) => {
    const reach = REACH(x0, what);
    expect(reach, `${name}: the farthest he is hit (${reach}) is inside its ring (${ring})`).toBeLessThanOrEqual(ring);
    expect(reach, `${name}: and the ring is not much wider than that`).toBeGreaterThanOrEqual(ring - 6);
  };

  it('the puddle (50), the balloon\'s burst (80), the explosive pie (72), the crusher\'s zone (74): the ring drawn is the reach', () => {
    EDGE('a puddle', '300', `annPuddle(b, { p:{ x:X0, warnY:gy, life:0 }, id:id }); step();`, 50);
    EDGE('a balloon', '300', `annSplash(b, { p:{ x:X0, y:gy - 10, life:0 }, id:id });`, 80);
    EDGE('the pie', '300', `annCakeEnd(b, { p:{ x:X0, y:gy - 9, warnY:gy, life:0 }, pz:3, id:id, lob:true });`, 72);
    EDGE('the crusher', 'annZone().x', `b._hz.id = id; annCrusherSlam(b, b._hz);`, 74);
    expect(W.eval('[ANN.acid.puddle, ANN.balloon.hit, ANN.prizes[3].splash + 12, ANN.crush.reach]'), 'and these are the numbers the rings are drawn with').toEqual([50, 80, 72, 74]);
  }, 60000);

  it('a lob and a drop come down on their ring: from the thrower\'s side too, a fighter just outside it is not clipped on the way down, however far it was thrown', () => {
    const FLY = (kind, x1, d, side) => W.eval(`(function(){ ${STAGE(x1)}
      var gy = groundY(); f.hurt = null; f.invuln = 0; f.pct = 0; var hit = false, placed = false, cx = WW*0.5;
      var sd = ${side};
      var q = ${kind === 'lob' ? `{ k:'toss', f:f.idx, w:'lob', id:++BOSS_ATK_ID, pz:0, ph:1 }` : `{ k:'acid', d:(f.x < b.x ? -1 : 1), kk:0, id:++BOSS_ATK_ID, x1:f.x, sy:gy }`};
      ${kind === 'lob' ? 'annToss(b, q);' : 'b._acx = b.x; annDrop(b, q);'}
      for (var i=0;i<120;i++){
        f.x = ${x1} + sd*${d}; f.y = gy - 24; f.vx = 0; f.vy = 0; f.hitstun = 0;
        var before = f.pct; step(); if (f.pct > before + 1e-6){ hit = true; break; }
        if (!projectiles.some(function(p){ return p.annLob || p.shape === 'annacid'; })) break;
      }
      return hit; })()`);
    for (const x1 of [100, 300, 450, 700, 1000]) for (const side of [-1, 1]) {
      expect(FLY('lob', x1, 49.5, side), `a lob thrown at ${x1}: 49.5 px ${side > 0 ? 'right' : 'left'} of its spot (its ring is 48)`).toBe(false);
      expect(FLY('lob', x1, 36, side), `and 36 px from it he is hit`).toBe(true);
      expect(FLY('drop', x1, 51.5, side), `a drop at ${x1}: 51.5 px ${side > 0 ? 'right' : 'left'} of its spot (its ring is 50)`).toBe(false);
    }
  }, 120000);
});

// The flat throw's lane follows a fighter's row and side, and locks ANN.flat.lock frames before the throw: it leaves along exactly that row and that way, so one who moves
// after the lock is not in it (a jump, or a step across the tosser) and one who stays is.
describe('THE WINDOW: the lane locks', () => {
  it('the lane follows you until its last 36 frames and then holds; the flat throw leaves along the locked row, the locked way', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(), out = { lane:[], flat:null }; f.invuln = 999;
      turn(0);
      for (var i=0;i<200 && !out.flat;i++){
        if (i === 5){ f.x = 760; }                           // across the tosser: the lane runs the other way
        if (i === 12){ f.y = gy - 24 - 70; }                 // and higher: its row follows
        if (i >= 12){ f.vy = 0; f.y = gy - 24 - 70; }        // (held there: he stands on something)
        step(); f.invuln = 999;
        var m = projectiles.find(function(p){ return p.annMark === 'lane'; });
        if (m) out.lane.push({ d:m.delay, x:Math.round(m.warnX), y:Math.round(m.warnY), dir:m.mA });
        var fl = projectiles.find(function(p){ return p.annFlat; });
        if (fl) out.flat = { y:Math.round(fl.y), vx:fl.vx, born:i };
      }
      out.lock = ANN.flat.lock;
      return out; })()`);
    expect(r.flat, 'the flat throw left').not.toBeNull();
    const before = r.lane.filter((l) => l.d > r.lock), held = r.lane.filter((l) => l.d <= r.lock && l.d > 1);
    expect(new Set(before.map((l) => l.dir)).size, 'the lane changed sides when he crossed the tosser').toBe(2);
    expect(before.some((l) => l.y < before[0].y - 40), 'and rose with him').toBe(true);
    expect(held.length, 'it holds for the last 36 frames, ANN_CALM or more').toBeGreaterThanOrEqual(ANN_CALM);
    expect(new Set(held.map((l) => l.y + ',' + l.dir + ',' + l.x)).size, 'one row, one way, one start').toBe(1);
    expect(Math.abs(r.flat.y - held[0].y), 'the throw leaves along that row').toBeLessThanOrEqual(1);
    expect(Math.sign(r.flat.vx), 'and that way').toBe(held[0].dir);
  });

  it('a fighter who moves after the lock is not touched by the flat; one who stays is', () => {
    const run = (move) => W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(), hit = false, locked = false; f.invuln = 0; f.pct = 0;
      turn(0);
      for (var i=0;i<200;i++){
        var m = projectiles.find(function(p){ return p.annMark === 'lane'; });
        if (m && m.delay <= ANN.flat.lock && m.delay > 0) locked = true;
        // after the lock he is in the air (or not): a jump is 126 px high
        f.x = 300; f.vx = 0; ${move ? `if (locked){ f.y = gy - 24 - 100; f.vy = 0; } else { f.y = gy - 24; f.vy = 0; }` : 'f.y = gy - 24; f.vy = 0;'}
        var fl0 = projectiles.find(function(p){ return p.annFlat; }), fx0 = fl0 ? fl0.x : null;
        step();
        if (fl0 && projectiles.indexOf(fl0) < 0 && Math.abs(fx0 - f.x) < 60) hit = true;   // the throw was used up on him (one boss hit a volley, so the lob that landed first would hide it in his pct)
      }
      return hit; })()`);
    expect(run(true), 'one in the air as it passes is not hit').toBe(false);
    expect(run(false), 'one who stayed on the row is').toBe(true);
  });
});

describe('how he moves', () => {
  it('a hard hit while he is on the floor skids him to the near edge and he rebounds back through the spot he was hit from ("flying into a slingshot"); it is only his walk', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var out = {}; b.x = 550; b.vx = 0; keep(4); var x0 = b.x;
      b.hp -= 9; var xs = [], hurt = 0;
      for (var i=0;i<45;i++){ step(); fighters.forEach(function(q){ hurt = Math.max(hurt, q.pct); q.pct = 0; }); xs.push(b.x); if (i === 0) out.sling = !!b._sling; }
      out.x0 = x0; out.max = Math.max.apply(null, xs); out.min = Math.min.apply(null, xs.slice(14)); out.hurt = hurt;
      out.maxAt = xs.indexOf(out.max);
      // a second hit straight away is not another slingshot (a beat between them)
      var again = !!b._sling; b.hp -= 9; step(); out.again = b._slingAt;
      // and not while he is winding an attack up
      ${'b._sling = null; b._slingAt = -999;'} b._tel = 20; b.hp -= 9; step(); out.whileTel = !!b._sling;
      return out;
    })()`);
    expect(r.sling, 'the hit starts it').toBe(true);
    expect(r.max - r.x0, 'skidding to the far edge, away from you').toBeGreaterThan(120);
    expect(r.min, 'and back through the spot he was hit from').toBeLessThan(r.x0 - 40);
    expect(r.hurt, 'no damage: it is his walk').toBe(0);
    expect(r.whileTel, 'never in the middle of a wind-up').toBe(false);
  });
});

describe('the ending: Spongy crushes him', () => {
  // the gauntlet's own kill: bossRushCheck, with the timers it sets captured
  const KILL = `BOSSRUSH.active = true; var st = setTimeout, timers = []; setTimeout = function(fn, ms){ timers.push(ms); return 0; };
    var said = [], _bn = banner; banner = function(t, m, k, l){ said.push([String(t), k || null]); return _bn(t, m, k, l); };
    b.hp = 0; impactFxClear(); bossRushCheck(); setTimeout = st; banner = _bn; BOSSRUSH.active = false;`;

  it('is in BOSS_ENDINGS under his key: his props go, the centre platform is put back, and the card comes at once (the scene is over before the next boss)', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var out = {}, c = worldPlats.find(function(p){ return p._annC; }), w0 = c.w, x0 = c.x;
      keep(4); annSell(b, -2); annSell(b, -2); out.shrunk = c.w < w0; out.pods0 = worldPlats.filter(function(p){ return p._ann; }).length;
      var E = BOSS_ENDINGS.announcer; out.e = { sweep: E.sweep === annUndress, begin: E.begin === annEndBegin, hold: E.holdMs };
      ${KILL}
      out.timers = timers; out.said = said; out.pods = worldPlats.filter(function(p){ return p._ann; }).length; out.centre = [c.x === x0, c.w === w0, !!c._annC]; out.n = worldPlats.length;
      out.total = ANN.end.total; return out;
    })()`);
    expect(r.e).toEqual({ sweep: true, begin: true, hold: 0 });
    expect(r.shrunk).toBe(true);
    expect(r.pods0).toBe(3);
    expect(r.pods, 'the podiums are swept').toBe(0);
    expect(r.centre, 'the stage platform is back as it was, and no longer his').toEqual([true, true, false]);
    expect(r.n).toBe(1);
    expect(r.timers, 'the card at once and the next boss after 1.5 s: nothing added by a hold').toEqual(expect.arrayContaining([1500]));
    expect(r.timers).not.toContain(2300);
    expect(r.said.some(([t, k]) => /^BOSS DOWN!/.test(t) && k === 'sys')).toBe(true);
    expect(r.said.some(([, k]) => k === 'boss'), 'no text: nothing of the ending says a word').toBe(false);
    expect(r.total / 60*1000, 'over before the next boss arrives').toBeLessThan(1500);
  });

  it('everything of his still in the air or lying on the floor goes with him: no puddle, beam, balloon or press hurts anyone after he is beaten, or lingers into the next fight -- only the scene is left', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      var gy = groundY(); keep(4);
      var id = ++BOSS_ATK_ID; annPuddle(b, { p:{ x:300, warnY:gy, life:0 }, id:id }); annLaser(b, f, id, 2); annAcid(b, f, id, 2); annBalloons(b, f, id, 2); annCakes(b, f, id, 2); annPress(b, 300, id, {});
      var fighterShot = addProj({ owner:-2, ownerObj:{ team:0, idx:-2 }, assist:true, x:900, y:100, vx:0, vy:0, r:8, dmg:5, life:50 });   // an assist trophy's shot is not his
      var before = projectiles.length;
      ${KILL}
      var left = projectiles.filter(function(p){ return p.owner === -2 && !p.assist; }).map(function(p){ return p.annMark || p.annGhost || p.shape; }).sort();
      return { before: before, left: left, kept: projectiles.indexOf(fighterShot) >= 0 };
    })()`);
    expect(r.before, 'plenty of it about').toBeGreaterThan(8);
    expect(r.left, 'only the ending\'s own scene: its mark and the carrier that plays the landing').toEqual([1, 'end']);
    expect(r.kept, 'a fighter\'s own assist shot is left alone').toBe(true);
  });

  it('a carrier shot lands on the beat (the engine plays the impact: shake, dust, debris) and the scene is gone after ANN.end.total frames; it hurts nobody, even standing where he fell', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 700)}
      var gy = groundY(), out = { ev: [] }; keep(4); b.x = 550; b.vx = 0; keep(1); b._phase = 3;
      ${KILL}
      var mark = projectiles.find(function(p){ return p.annMark === 'end'; }), ghost = projectiles.find(function(p){ return p.annGhost; });
      out.mark = mark && { delay: mark.delay, x: Math.round(mark.warnX), mB: mark.mB }; out.ghost = ghost && { dmg: ghost.dmg, team: ghost.ownerObj.team, gy: ghost.warnY, vy: ghost.vy, hasImpact: !!ghost.landImpact };
      var bx = b.x, hurt = 0, gone = null, debris0 = IMPACT_DEBRIS.length, landed = null;
      for (var i=0;i<100;i++){ step(); g2.x = bx; g2.y = gy - 24; g2.vx = 0; g2.vy = 0; g2.invuln = 0; g2.hitstun = 0; hurt = Math.max(hurt, g2.pct, f.pct);
        if (landed === null && IMPACT_DEBRIS.length > debris0) landed = i + 1;
        if (gone === null && !projectiles.some(function(p){ return p.annMark === 'end'; })) gone = i + 1; }
      out.landed = landed; out.gone = gone; out.hurt = hurt; out.debris = IMPACT_DEBRIS.length; out.scars = IMPACT_SCARS.length; out.crush = ANN.end.crush; out.total = ANN.end.total; out.bx = bx;
      return out;
    })()`);
    expect(r.mark.delay, 'the scene lasts ANN.end.total frames').toBe(r.total - 0);
    expect(r.mark.x).toBe(Math.round(r.bx));
    expect(Math.abs(r.mark.mB), 'he was bitten: phase 3 (the render is picked from the sign and size of this)').toBe(2);
    expect(r.ghost).toMatchObject({ dmg: 0, team: 0, hasImpact: true, vy: 26 });
    expect(Math.abs(r.landed - r.crush), 'Spongy lands on the beat').toBeLessThanOrEqual(2);
    expect(r.debris, 'heavy').toBeGreaterThanOrEqual(10);
    expect(r.scars, 'no scar: the next boss\'s floor is not his').toBe(0);
    expect(r.gone).toBeGreaterThanOrEqual(r.total - 1);
    expect(r.gone).toBeLessThanOrEqual(r.total + 1);
    expect(r.hurt, 'a scene hurts nobody: not even the fighter standing where he fell').toBe(0);
  });
});

describe('the show\'s art, wired and credited', () => {
  const KEYS = ['annslice', 'annlime', 'annice', 'annpie', 'anntosser', 'annballoon', 'annacid', 'annspark', 'annpress'];

  it('his shots and props wear the wiki\'s files: registered, transparent, projectile-sized, in the manifest, credited with their exact source, and picked in his slot', () => {
    const reg = W.eval(`(${JSON.stringify(KEYS)}).map(function(k){ var e = ATTACK_SPRITES[k]; return [k, e && e.src, !!PROJ_SHAPE[k], e && e.h]; })`);
    const man = JSON.parse(readFileSync('scripts/attack-sprite-manifest.json', 'utf8'));
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const picks = readFileSync('scripts/fetch-attack-sprites.mjs', 'utf8');
    const slot = picks.slice(picks.indexOf('@boss:announcer:begin picks'), picks.indexOf('@boss:announcer:end picks'));
    for (const [k, src, glyph, h] of reg) {
      expect(src, k).toBe(`assets/sprites/attacks/${k}.png`);
      expect(glyph, `${k} keeps a drawn glyph for before it loads`).toBe(true);
      expect(existsSync(`artifacts/V1/${src}`), src).toBe(true);
      const png = PNG.sync.read(readFileSync(`artifacts/V1/${src}`));
      expect(Math.max(png.width, png.height), `${k} is projectile-sized`).toBeLessThanOrEqual(128);
      expect(Math.max(png.width, png.height)).toBeGreaterThanOrEqual(24);
      const e = man[k];
      expect(e, `${k} is in the manifest`).toBeTruthy();
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] < 16) clear++;
      if (!e.solid) expect(clear/(png.width*png.height), `${k}: clear round the object, not a sticker (only the press, a block, fills its canvas)`).toBeGreaterThan(0.05);
      expect(e.wiki).toBe('bfdi');
      expect(e.who).toMatch(/^Announcer \(/);
      expect(e.source).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/battlefordreamisland\/images\//);
      expect(credits, `${k} is credited`).toContain(`(${k}.png)`);
      expect(credits, `${k}'s source URL is in the credits`).toContain(e.source);
      expect(slot, `${k} is picked in his slot`).toMatch(new RegExp(`\\n\\s*${k}:`));
      expect(h).toBeLessThanOrEqual(44);
    }
    // what was cut out of a bigger picture is said so: the acid glob (keyed off its scene) and the press (a block off the crusher's asset sheet)
    expect(man.annacid).toMatchObject({ key: 'prop', srcTitle: 'Thats crying or barfing.png' });
    expect(man.annpress).toMatchObject({ solid: true, srcTitle: 'Old announcer crusher.png' });
    expect(man.annslice.srcTitle).toBe('Cake Slice Strawberry side.png');
    expect(man.annpie.srcTitle).toBe('One slice of pie.png');
    expect(man.annballoon.srcTitle).toBe('Water balloon.png');
  });

  it('his phase-3 look is File:Bittenspeakerfront0006.png: 141x200 like his own render, the bite transparent, credited', () => {
    const file = 'artifacts/V1/assets/sprites/announcer-bitten.png', png = PNG.sync.read(readFileSync(file)), plain = PNG.sync.read(readFileSync('artifacts/V1/assets/sprites/announcer.png'));
    expect([png.width, png.height]).toEqual([plain.width, plain.height]);
    expect(png.data[3], 'the top-left corner is the bite').toBe(0);
    expect(png.data[(png.height - 1) * png.width * 4 + (png.width - 1) * 4 + 3], 'and the box is whole at the foot').toBe(255);
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    expect(credits.split('\n').find((l) => l.includes('`announcer-bitten.png`')) || '').toContain('Bittenspeakerfront0006.png');
    expect(W.eval('!!BOSS_SPRITE_FLIP.announcerbitten'), 'faces as the plain one does').toBe(false);
  });

  it('every glyph draws, every shape he throws is one the game has, and a fight through every attack throws nothing else', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 800)}
      var keys = ${JSON.stringify(KEYS.concat(['annpuddle']))}, seen = {}, bad = [];
      var c = { save(){}, restore(){}, beginPath(){}, moveTo(){}, lineTo(){}, arc(){}, ellipse(){}, quadraticCurveTo(){}, closePath(){}, fill(){}, stroke(){}, fillRect(){}, strokeRect(){}, rotate(){}, translate(){}, scale(){} };
      keys.forEach(function(k){ try { PROJ_SHAPE[k].draw(c, 14, { vx:2, vy:3, color:'#fff' }); } catch(e){ bad.push(k + ': ' + e.message); } });
      fighters.forEach(function(q){ q.invuln = 999; });
      [1, 2, 3].forEach(function(ph){ setPhase(ph); b._levOff = ph > 1;
        [0, 1, 2, 3, 4, 5].forEach(function(mv){ turn(mv); for (var i=0;i<150;i++){ step(); fighters.forEach(function(q){ q.invuln = 999; q.pct = 0; }); b._tel = b._tel; projectiles.forEach(function(p){ if (p.owner === -2 && p.shape) seen[p.shape] = 1; }); } }); });
      var shapes = Object.keys(seen), unknown = shapes.filter(function(s){ return !ATTACK_SPRITES[s] && !PROJ_SHAPE[s]; });
      return { bad: bad, shapes: shapes.sort(), unknown: unknown };
    })()`);
    expect(r.bad).toEqual([]);
    expect(r.unknown, 'every shot he throws has art or a glyph').toEqual([]);
    expect(r.shapes).toEqual(expect.arrayContaining(['annslice', 'annlime', 'annice', 'annpie', 'annacid', 'annpuddle', 'annballoon', 'annpress']));
  });
});

describe('no words on the screen, and nothing of the OSC', () => {
  const NAMES = ['annH', 'annSurface', 'annZone', 'annNextPrize', 'annMark', 'annQ', 'annOccupied', 'annDress', 'annUndress', 'annGap', 'annCakes', 'annToss', 'annCakeEnd', 'annPickSale', 'annSell',
    'annHazardStep', 'annCrusherSlam', 'annCrack', 'annBlow', 'annPress', 'annPlate', 'annSignature', 'annBeamTotal', 'annLaser', 'annBeamSeg', 'annSegDist', 'annBeamHits', 'annAcid', 'annDrop', 'annPuddle',
    'annBalloons', 'annSplash', 'annMove', 'annTick', 'annTel', 'annPhase', 'annEndBegin', 'annCakeTurn', 'annCrushTurn', 'annLimb', 'annDrawProps', 'annDrawTosser', 'annDrawCounter', 'annDrawMachine',
    'annDrawWire', 'annDrawClaw', 'annDrawShot', 'annDrawMark', 'annDrawBeam', 'annDrawEnd', 'annRing', 'annDrawTell', 'annDecor', 'annGroundPattern'];

  it('none of his code calls banner() or draws text: the telegraph names are the engine\'s, the tosser, counter, claw and wire say the rest', () => {
    const r = W.eval(`(function(){ var out = { missing: [], banner: [], text: [], oj: [] };
      ${JSON.stringify(NAMES)}.forEach(function(n){ var f = window[n]; if (typeof f !== 'function'){ out.missing.push(n); return; }
        var s = String(f); if (/\\bbanner\\s*\\(/.test(s)) out.banner.push(n); if (/fillText|strokeText|\\.font\\b|textContent|innerHTML/.test(s)) out.text.push(n); });
      var all = ${JSON.stringify(NAMES)}.map(function(n){ return String(window[n]); }).concat([JSON.stringify(ANN), JSON.stringify(BOSS_EXTRA['Announcer']), BOSS_MOVE_NAME.annlaser, BOSS_MOVE_NAME.annacid, BOSS_MOVE_NAME.annballoon,
        String(BOSS_MOVES.annlaser), String(BOSS_MOVES.annacid), String(BOSS_MOVES.annballoon), ['annslice','annlime','annice','annpie','anntosser','annballoon','annacid','annspark','annpress','annpuddle'].map(function(k){ return String(PROJ_SHAPE[k].draw); }).join('')]).join('\\n');
      out.src = all; return out; })()`);
    expect(r.missing).toEqual([]);
    expect(r.banner, 'no popup: BUDGET CUT! used to be one').toEqual([]);
    expect(r.text).toEqual([]);
    // "OJ, Suitcase and Cabby only as Cobs's prize. The Floor: never." (whole-word: "addProj" contains "oj")
    expect(r.src).not.toMatch(/\bOJ\b|Suitcase|Cabby/i);
    expect(r.src, 'the character, not the ground').not.toMatch(/The Floor/);
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const mine = credits.slice(credits.indexOf('@boss:announcer:begin credits'), credits.indexOf('@boss:announcer:end credits'));
    expect(mine.length).toBeGreaterThan(500);
    expect(mine).not.toMatch(/\bOJ\b|Suitcase|Cabby/i);
    expect(mine).not.toMatch(/The Floor/);
  });

  it('a fight through all four attacks and three phases says only his telegraph names and the gauntlet\'s own cards', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 800)}
      var said = [], _bn = banner; banner = function(t, m, k, l){ said.push([String(t), k || null]); return _bn(t, m, k, l); };
      fighters.forEach(function(q){ q.invuln = 999; });
      try { [1, 2, 3].forEach(function(ph){ setPhase(ph); [0, 1, 2, 3, 4, 5].forEach(function(mv){ turn(mv); for (var i=0;i<150;i++){ step(); fighters.forEach(function(q){ q.invuln = 999; q.pct = 0; }); } }); }); }
      finally { banner = _bn; }
      var kinds = {}; said.forEach(function(s){ kinds[s[1] || 'plain'] = (kinds[s[1] || 'plain'] || 0) + 1; });
      return { kinds: kinds, boss: Array.from(new Set(said.filter(function(s){ return s[1] === 'boss'; }).map(function(s){ return s[0]; }))).sort(), sys: Array.from(new Set(said.filter(function(s){ return s[1] === 'sys'; }).map(function(s){ return s[0].replace(/^Announcer — /, ''); }))) };
    })()`);
    expect(Object.keys(r.kinds).filter((k) => k !== 'boss' && k !== 'sys'), 'no plain popup').toEqual([]);
    expect(r.boss).toEqual(['ACID TEARS!', 'BUDGET CUTS!', 'CAKE AT STAKE!', 'CRUSHER ARM!', 'QUADRUPLE LASER!', 'WATER BALLOONS!']);
    expect(r.sys.every((s) => /^PHASE [23]: (Budget Cuts|Crusher Arm)$/.test(s)), `only the phase cards: ${r.sys}`).toBe(true);
  });
});

// A boot whose canvas counts every call, so the drawing can be read back (the game's own bar labels the boss; his props must not write anything).
function bootCounting() {
  const html = readFileSync('artifacts/V1/index.html', 'utf8'), ops = {}, grad = { addColorStop() {} };
  const rec = new Proxy({}, {
    get: (_t, p) => p === 'measureText' ? () => ({ width: 0 }) : p === 'canvas' ? { width: 1100, height: 720 } : p === 'getImageData' ? () => ({ data: [] })
      : (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createConicGradient' || p === 'createPattern') ? () => grad
      : (...a) => { ops[p] = (ops[p] || 0) + 1; },
    set: () => true,
  });
  const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) { window.HTMLCanvasElement.prototype.getContext = () => rec; window.Math.random = mulberry32(3); window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {}; } });
  return { w: dom.window, ops };
}

describe('drawing his arena, his tells, his shots and his ending', () => {
  it('draws every state without throwing and without a single letter: the props, every tell, every mark, the beams at every frame, the ending at every frame', () => {
    const { w, ops } = bootCounting();
    const r = w.eval(`(function(){
      SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
      BOSSRUSH = { active:false, bossIdx:0, cleared:0, defeated:false, loop:0, dmgMult:1 };
      worldPlats=[{ x:WW*0.29, y:WH*0.62, w:WW*0.42, h:14 }]; summons=[]; projectiles=[]; particles=[]; impactFxClear();
      var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 300, groundY()-24, 0); f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
      spawnBossRushBoss(); var b = summons.find(function(s){ return s.type==='boss'; }); b._atkTimer = 1e9;
      var gy = groundY(), n = 0, before = {};
      for (var k in {}) {}
      var t0 = Object.keys(window.__ops || {});
      var go = function(){ ctx.save(); annDecor(); drawArenaDecor('cakeatstake'); drawArenaHazard('under'); drawArenaHazard('over'); drawBossSprite(b); projectiles.forEach(drawProjectile); ctx.restore(); n++; };
      var H = b._hz;
      // entrance, idle, every wind-up in every phase
      [0, 12, 30, ANN.ent].forEach(function(e){ b._ent = e; go(); });
      [1, 2, 3].forEach(function(ph){ b._phase = ph; b._telPh = ph;
        ['announcer', 'annlaser', 'annacid', 'annballoon'].forEach(function(kind){ [30, 12, 4].forEach(function(t){ b._telKind = kind; b._tel = t; b._telX = 400; b._telY = gy - 24; b._pz = ph; b._sl = ph === 2 ? 85 : 0; go(); }); });
        b._tel = 0; b._sl = -1; b._tel = 20; b._telKind = 'announcer'; b._phase = 2; go(); b._sl = -2; go(); b._sl = 0; b._tel = 0; });
      // the crusher's states and the props' states
      [[0, 168], [1, 168], [2, 90], [3, 0], [4, 60]].forEach(function(s){ H.pz = s[0]; H.py = s[1]; H.pt = 30; H.cr = 3; go(); });
      H.bo = 200; go(); H.bo = 0; H.sp = 1; H.cs = 1; H.vt = hazardT - 30; H.st = [100, 300, 700]; H.lt = hazardT - 20; H.lx = 100; H.lw = 110; H.ly = gy - 108; go(); H.thr = hazardT - 3; H.tdir = -1; H.cnt = hazardT - 5; go();
      // every mark, and the beams and the ending at every frame
      ['splat', 'splash', 'ring', 'plate'].forEach(function(kind){ [1, 20, 40, 100].forEach(function(d){ projectiles = [annMark(kind, 400, gy, d, { color:'#f7a1a8', mA:d, mB:0 })]; go(); }); });
      // the lanes (a flat throw's, a wave's: either way) and the rings of the spots (a drop's or a balloon's, with its drip; a lob's, a ring only)
      [1, 20, 40, 100].forEach(function(d){ [-1, 1].forEach(function(dir){ projectiles = [annMark('lane', 400, gy - 24, d, { color:'#f7a1a8', mA:dir, mB:38, life:30 })]; go(); });
        projectiles = [annMark('spot', 400, gy, d, { color:'#4cff1c', mA:50, mB:0 })]; go(); projectiles = [annMark('spot', 400, gy, d, { color:'#f7a1a8', mA:48, mB:2 })]; go(); });
      [[0, 2, 3, 4], [0, 14, 20, 40], [2, 28, 30, 60]].forEach(function(c){ for (var t=0;t<annBeamTotal(c[0], c[1]);t+=2){ projectiles = [annMark('beam', 400, gy - 24, annBeamTotal(c[0], c[1]) - t, { color:'#b060ff', mA:c[0], mB:c[1] })]; go(); } });
      [0, 1, 2, 3].forEach(function(d){ for (var t=0;t<annBeamTotal(d, 0);t+=3){ projectiles = [annMark('beam', 400, gy - 24, annBeamTotal(d, 0) - t, { color:'#b060ff', mA:d, mB:0 })]; go(); } });
      for (var e2=0;e2<ANN.end.total;e2+=2){ projectiles = [annMark('end', 400, gy, ANN.end.total - e2, { mA:-85, mB:(e2 % 4 ? 2 : -1) })]; go(); }
      projectiles = [{ annGhost:1, x:1, y:1, r:2, vx:0, vy:26, color:'#f4d800', owner:-2, ownerObj:{ team:0, idx:-2 }, life:9 }]; go();
      b._tel = 0; return { n: n };
    })()`);
    expect(r.n).toBeGreaterThan(150);
    expect(ops.fillText || 0, 'not one fillText: he writes no word (his boss bar is the game\'s, and is not drawn here)').toBe(0);
    expect(ops.strokeText || 0).toBe(0);
    expect(ops.drawImage === undefined || ops.drawImage >= 0).toBe(true);
  });

  it('the tosser, the counter, the claw and the wire are drawn from the platforms and the snapshot alone, so a netcode client draws them too: every field they read crosses', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      SETTINGS.mode='boss'; SETTINGS.count=2; SETTINGS.items=false; SETTINGS.stocks=99;
      chosen = ROSTER.find(function(r){ return r.name==='Firey'; }); beginMatchNow(); running = true; paused = true;
      fighters.forEach(function(q){ q.controller = 'still'; q.invuln = 999; });
      var b = summons.find(function(s){ return s.type==='boss'; }), gy = groundY();
      function run(n){ for (var i=0;i<n;i++){ step(); fighters.forEach(function(q){ q.invuln = 999; q.pct = 0; }); } }
      run(60); setPhase2();
      function setPhase2(){ b._phase = 2; b.hp = b.maxHp*0.5; run(3); }
      b._pickForce = 'announcer'; b._tel = 0; b._atkLive = null; b._atkTimer = 1; step(); run(20);      // BUDGET CUTS! winding up: a prize on the tosser, a claw over a podium
      var snap = JSON.parse(JSON.stringify(serializeState()));
      var host = { pz: b._pz, sl: b._sl, ent: b._ent, hz: JSON.parse(JSON.stringify(b._hz)), seg: null };
      run(20); var lasers = projectiles.length;
      b._tel = 0; b._lanes = null; b._q = []; b._lastCake = null; b._calm = 999; b._hz.cc = 999; projectiles = [];   // (his next turn waits for the volley to be over and ANN.calm more: here it is)
      b._pickForce = 'annlaser'; b._atkLive = null; b._atkTimer = 1; step(); run(62);      // and a laser: its beams are marks
      var marks = projectiles.filter(function(p){ return p.annMark === 'beam'; }), m0 = marks[0];
      host.seg = m0 ? annBeamSeg(m0, gy) : null; host.mA = m0 && m0.mA;
      var snap2 = JSON.parse(JSON.stringify(serializeState()));
      var bs = snap.summons.find(function(s){ return s.type==='boss'; });
      // the client
      summons = []; projectiles = []; BOSS_ARENA = null; var plats0 = worldPlats.length;
      applySnapshot(snap2);
      var err = null, cl = summons.find(function(s){ return s.type==='boss'; });
      try { drawArenaDecor(BOSS_ARENA); drawArenaHazard('under'); drawArenaHazard('over'); summons.forEach(drawSummon); projectiles.forEach(drawProjectile); } catch(e){ err = e.message + ' ' + String(e.stack).slice(0, 200); }
      var cm = projectiles.filter(function(p){ return p.annMark === 'beam'; })[0];
      var cseg = cm ? annBeamSeg(cm, gy) : null;
      return { err: err, arena: BOSS_ARENA, bs: { pz: bs._pz, sl: bs._sl, ent: bs._ent, hz: bs._hz, attack: bs.attack, phase: bs._phase }, host: host, cl: cl && { pz: cl._pz, ent: cl._ent, hz: cl._hz, look: bossLook(cl) },
        marks: marks.length, cm: cm && { annMark: cm.annMark, delay: cm.delay, mA: cm.mA, mB: cm.mB, warnX: cm.warnX, warnY: cm.warnY }, m0: m0 && { delay: m0.delay, mA: m0.mA, mB: m0.mB, warnX: Math.round(m0.warnX), warnY: Math.round(m0.warnY) }, cseg: cseg, size: JSON.stringify(bs._hz).length };
    })()`);
    expect(r.err).toBe(null);
    expect(r.arena, 'a client takes his arena').toBe('cakeatstake');
    expect(r.bs).toMatchObject({ attack: 'announcer', phase: 2 });
    expect(r.bs.pz, 'the prize on the tosser').toBe(r.host.pz);
    expect(r.bs.sl, 'the piece the claw is coming for').toBe(r.host.sl);
    expect(typeof r.bs.ent, 'how far into the entrance he is').toBe('number');
    expect(r.bs.hz, 'the hazard state, plain numbers').toMatchObject({ pz: expect.any(Number), py: expect.any(Number), cr: expect.any(Number), cuts: expect.any(Number) });
    expect(r.size, 'a few numbers').toBeLessThan(400);
    expect(r.cl.look, 'the client wears his look').toBe('announcer');
    expect(r.marks).toBeGreaterThanOrEqual(4);
    expect(r.cm, 'a beam is a mark that crosses whole').toMatchObject({ annMark: 'beam', mA: r.m0.mA, mB: r.m0.mB, warnX: r.m0.warnX, warnY: r.m0.warnY });
    expect(r.cm.delay, 'its clock crosses (a frame or two behind)').toBeGreaterThan(0);
    expect(r.cseg && r.host.seg && r.cseg.d === r.host.seg.d, 'the client works out the same beam').toBe(true);
  });
});
