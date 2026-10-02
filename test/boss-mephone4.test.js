import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';
import { loadMonolith } from './helpers/load-monolith.js';

// "mephone should be a boss, alongside 4s, and cobs. mephone should spawn hostile assist trophies." MePhone4 is Boss 6 of the gauntlet, between Purple Face and Evil Leafy, rebuilt in the
// boss overhaul (2026-09-29): "make the bosses more like springy ... but dont make them like him! make the attacks feel more immersive." Five attacks, each from the II wiki -- FIST THINGY!
// (the signature, redone: a pole that slides in, a faster 2x glove, a finisher from the far edge), REJECTION PORTAL! (flings you to an exit), A-MAZE-ING! (hedge walls, rayguns, a cannon),
// BOOMERANGS! and MELIFE DOWNLOAD! (back in, Round 10) -- in the Great Escape's Elimination Area, through the boss engine kit (impact, the arena's ground, its ending). "Harder, same damage":
// every part of a turn shares that turn's one attack id, so a fighter takes at most one boss hit from it. Never tuned for a bot, and "Accept level" with MePhone4S: every number here is what
// the design says. Assists take their summoner's team, so his adds are summoned by a proxy owner on the boss's team, -1.

let W, WC;   // W: the harness; WC: the one with gradients, which can draw a whole frame
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); WC = loadMonolith().window; await WC.eval('profileReady'); });

const ROW = ['MePhone4', '#4fb8e8', 255, 2.5, 'mephone', 'elimarea', true, 'mephone'];
const HP = { 1: 0.95, 2: 0.5, 3: 0.2 };
// A still Firey on the floor at `x`, in Boss Rush with the gauntlet logic off (BOSSRUSH.active false), and MePhone4 spawned the way the gauntlet spawns him, in phase `ph`, on his own (the
// add his phase 3 gives away free is dropped). His attack timer is parked unless `live` is set -- at 99999, under the 1e5 that mpTick reads as "a turn's gap is being held" and lets go of.
const STAGE = (x, ph = 1, live = false) => `
  SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
  BOSSRUSH = { active:false, bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.name==='MePhone4'; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats=platRectsSmall(); summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; hazardT=0; impactFxClear();
  var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), ${x}, groundY()-24, 0);
  f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
  spawnBossRushBoss();
  var b = summons.find(function(s){ return s.type==='boss'; });
  b.hp = b.maxHp*${HP[ph]}; ${live ? '' : 'b._atkTimer = 99999;'}
  step(); step(); summons = [b]; f.pct=0; f.invuln=0; f.hitstun=0; f.x = ${x}; f.y = groundY()-24; f.vx=0; f.vy=0; f.onground=true;
`;
// A bare MePhone4 for driving his functions directly, on the right of the arena looking left.
const S = (o = '') => `{ name:'MePhone4', attack:'mephone', type:'boss', x:900, y:groundY()-85, r:85, hp:100, maxHp:100, _phase:1, _atkTimer:1, _tel:0, color:'#4fb8e8', face:-1, homeX:900,
  stationary:true, vx:0, vy:0 ${o ? ',' + o : ''} }`;
// His moves, by number (0 the glove, 1 MeLife, 2 the portal, 3 the boomerang, 4 the maze). The owner, 2026-10-01 (Round 17): "make the attacks based on fighter position." -- there is no cycle to count
// along any more (the engine's _moveN used to count 1, 2, 4, 6, 8 for them), so a test that needs one of them forces it: `FORCE(k)` is the code that makes the next turn move number k (the picker's
// `_pickForce`, and the one-attack watch cleared with it).
const KINDS = ['mephone', 'melife', 'portal', 'boomerang', 'maze'];
const FORCE = (k) => `b._pickForce = ${JSON.stringify(KINDS[k])}; b._atkLive = null;`;
// The text of one of his slot pairs (or of every one), from the file itself.
const html = () => readFileSync('artifacts/V1/index.html', 'utf8');
const slot = (slotName) => { const t = html(), a = t.indexOf(`// @boss:mephone4:begin ${slotName}`), b = t.indexOf(`// @boss:mephone4:end ${slotName}`); return t.slice(a, b); };
const SLOTS = ['roster', 'extra', 'rushonly', 'pick', 'movename', 'moves', 'helpers', 'spawn', 'move', 'tick', 'tel', 'fire', 'gap', 'tellen', 'phase', 'phasename', 'telname', 'ending', 'hazard',
  'netshot', 'net', 'shotdraw', 'fx', 'look', 'tell', 'body', 'sky', 'ground', 'decor', 'sprite', 'flip', 'shape', 'art'];

describe('MePhone4 joins the gauntlet', () => {
  it('is Boss 6 (was 7 until the Dragon moved to 9: "just move purple dragon!!!" (the owner, 2026-09-30)), before Evil Leafy and Four, in his own arena', () => {
    const r = W.eval(`(function(){
      var rows = BOSS_ROSTER.map(function(b){ return [b.name, b.color, b.hp, b.big, b.attack, b.arena, b.stationary, b.sprite]; });
      return { names: BOSS_ROSTER.map(function(b){ return b.name; }), rows: rows, extra: BOSS_EXTRA['MePhone4'] };
    })()`);
    // 255, was 240: under the Dragon's 250 when the Dragon came before him (it moved to Boss 9 on 2026-09-30; see test/boss-rush-order.test.js). The Great Escape's Elimination Area now,
    // no longer the shared 'melife' screen: "Each its own" (the owner, 2026-09-29; the plan's arena, approved in Round 8). The other bosses' rows are theirs: their own tests pin them.
    expect(r.rows.find((row) => row[0] === 'MePhone4')).toEqual(ROW);
    expect(r.names.indexOf('MePhone4'), 'after Purple Face, before Evil Leafy').toBe(5);
    expect(r.names.slice(4, 7)).toEqual(['Purple Face', 'MePhone4', 'Evil Leafy']);
    // the attack-count rule (the owner, 2026-09-29): "starting from bug swarm, they should have 5" -- his signature and four more
    expect(r.extra).toEqual(['melife', 'portal', 'boomerang', 'maze']);
  });

  it('walking the gauntlet spawns him sixth, and Four is still the last boss', () => {
    const order = W.eval(`(function(){
      var st = setTimeout; setTimeout = function(){ return 0; };   // bossRushCheck queues the next spawn; this walk spawns by hand
      try {
        SETTINGS.mode='boss'; SETTINGS.stocks=99; running=true;
        BOSSRUSH = { active:true, bossIdx:0, cleared:0, defeated:false, loop:0, dmgMult:1 };
        var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 200, groundY()-24, 0);
        f.team=0; f.controller='still'; f.stocks=3; fighters=[f]; summons=[];
        var order = [];
        for (var i=0;i<14;i++){
          spawnBossRushBoss();
          var b = summons.find(function(s){ return s.type==='boss'; });
          order.push(b.name);
          if (b.name==='Four') break;
          b.hp = 0; bossRushCheck();
        }
        return order;
      } finally { setTimeout = st; BOSSRUSH.active=false; running=false; summons=[]; }
    })()`);
    expect(order).toEqual(['Announcer', 'Puffball Speaker Box', 'Firey Speaker Box', 'The Bug Swarm', 'Purple Face',
      'MePhone4', 'Evil Leafy', 'MePhone4S', 'Purple Dragon', 'Two', 'Springy', 'Four']);   // the Dragon at 9 ("just move purple dragon!!!", the owner, 2026-09-30)
  });

  const turns = (ph) => W.eval(`(function(){
    summons = []; var s = ${S('_phase:' + ph + ', hp:' + HP[ph]*100)}, kinds = [], names = [];
    for (var i=0;i<16;i++){ s._atkTimer = 1; s._tel = 0; s._atkLive = null; updateBossAttack(s, null); kinds.push(s._telKind); names.push(bossTelName(s)); }
    return { kinds: kinds, names: names };
  })()`);

  // The owner, 2026-10-01 (Round 17): "make the attacks based on fighter position. if there is an attack that punishes being close, then they should use it more when ppl are close." -- "Position picks
  // all (Recommended)": the glove no longer comes on every odd turn. He draws his moves by where the fighters stand, none twice in a row, and every one comes up (the picker's own tests are in
  // test/boss-kit.test.js). And his difficulty picks (the question boxes, Round 17): "MePhone4: FIST THINGY! combo from P1; ... A-MAZE-ING! from P1, two cannonballs from P2" -- the maze is in his draw
  // from phase 1 (it joined in phase 2), and the glove is the combo in every phase, so its warning names the combo from phase 1 too.
  it('draws his turns from his moves -- the glove, MeLife, the portal, the boomerang and the maze, all five from phase 1 -- each with its own warning, none twice in a row, every one in sixteen turns', () => {
    const p1 = turns(1), p2 = turns(2);
    // the warning names the combo in every phase ("FIST THINGY!'s jab-and-finisher combo from phase 1"); the maze is named from the show ("It's sure to be a-maze-ing!", Mazed and Confused)
    const NAME = { mephone: 'FIST THINGY COMBO!', melife: 'MELIFE DOWNLOAD!', portal: 'REJECTION PORTAL!', boomerang: 'BOOMERANGS!', maze: 'A-MAZE-ING!' };
    expect(new Set(p1.kinds), 'phase 1: all five, the maze too ("A-MAZE-ING! from P1", the owner)').toEqual(new Set(Object.keys(NAME)));
    expect(p1.names).toEqual(p1.kinds.map((k) => NAME[k]));
    expect(new Set(p2.kinds), 'phase 2: all five').toEqual(new Set(Object.keys(NAME)));
    expect(p2.names).toEqual(p2.kinds.map((k) => NAME[k]));
    for (const [ph, p] of [[1, p1], [2, p2]]) expect(p.kinds.some((k, i) => i > 0 && k === p.kinds[i - 1]), `phase ${ph}: never the same move twice in a row: ${p.kinds}`).toBe(false);
    const r = W.eval(`({ p2: bossPhaseName({attack:'mephone'}, 2), p3: bossPhaseName({attack:'mephone'}, 3),
      moves: BOSS_EXTRA['MePhone4'].map(function(k){ return typeof BOSS_MOVES[k] + '/' + BOSS_MOVE_NAME[k] + '/' + BOSS_RUSH_ONLY.has(k); }),
      glitch: [typeof BOSS_MOVES.glitch, BOSS_MOVE_NAME.glitch], tel: [36, 44].map(function(n){ return n; }),
      tels: ['mephone', 'melife', 'portal', 'boomerang', 'maze'].map(function(k){ return bossTelLen({ attack:'mephone', _telKind:k }); }) })`);
    expect([r.p2, r.p3]).toEqual(['Back and Forth', 'Glitching']);   // Double Digit Desert (the glove kept punching Bow); Hatching the Plan (he glitches)
    expect(r.moves).toEqual(['function/MELIFE DOWNLOAD!/true', 'function/REJECTION PORTAL!/true', 'function/BOOMERANGS!/true', 'function/A-MAZE-ING!/true']);
    expect(r.glitch, 'A-MAZE-ING! "replaces the generic GLITCH! ring" (boss-plan-late.md 1.3): the ring is gone').toEqual(['undefined', undefined]);
    expect(r.tels, 'the maze has the long wind-up ("Tell (44 frames)"); the rest keep the usual 36').toEqual([36, 36, 36, 36, 44]);
  });

  it('his phases change as his HP falls, and crossing into Phase 3 downloads one free add', () => {
    const r = W.eval(`(function(){ ${STAGE(800)}
      var out = { p1: b._phase };
      b.hp = b.maxHp*0.5; updateBossAttack(b, f); out.p2 = b._phase; out.addsAtP2 = hostileCount(); out.b2 = document.getElementById('banner').textContent;
      b.hp = b.maxHp*0.2; updateBossAttack(b, f); out.p3 = b._phase; out.addsAtP3 = hostileCount(); out.b3 = document.getElementById('banner').textContent;
      summons = []; return out;
    })()`);
    expect({ p1: r.p1, p2: r.p2, addsAtP2: r.addsAtP2, p3: r.p3, addsAtP3: r.addsAtP3 }).toEqual({ p1: 1, p2: 2, addsAtP2: 0, p3: 3, addsAtP3: 1 });
    expect(r.b2).toMatch(/PHASE 2: Back and Forth/);
    expect(r.b3).toMatch(/PHASE 3: Glitching/);
  });

  it('left to fight, phases 1 and 2 each throw all five attacks, the maze too ("A-MAZE-ING! from P1", the owner, Round 17: phase 1 used to throw the first four and never the maze)', () => {
    // The turns' gaps are squeezed to a few frames (the pacing has its own tests: the maze's held gap, MEPHONE_GAPS): this watches which attacks a left-alone fight throws. His turns are drawn by position
    // now (the owner, Round 17: "make the attacks based on fighter position.") and each waits for the last of the one before (the one-attack watch), so a left-alone fight is given long enough for every move
    // to come up (the picker plays one that has sat out two passes of the deck whatever it scores).
    const seen = (ph, frames) => W.eval(`(function(){ ${STAGE(560, ph, true)}
      var kinds = {}, glove = false, add = false, portal = false, boom = false, maze = false;
      for (var i=0;i<${frames};i++){
        if (b._atkTimer > 5 && b._atkTimer < 1e5 && !(b._tel > 0)) b._atkTimer = 5;
        step(); f.invuln = 99; f.vx = 0; if (b._telKind) kinds[b._telKind] = 1;
        if (projectiles.some(function(p){ return p.mpGlove; })) glove = true;
        if (summons.some(function(s){ return s.hostile; })) add = true;
        if (b._hz.pt) portal = true;
        if (projectiles.some(function(p){ return p.mpBm; })) boom = true;
        if (worldPlats.some(function(p){ return p._mz; })) maze = true;
      }
      summons = []; projectiles = []; return { kinds: Object.keys(kinds).sort(), glove: glove, add: add, portal: portal, boom: boom, maze: maze };
    })()`);
    const ALL = { kinds: ['boomerang', 'maze', 'melife', 'mephone', 'portal'], glove: true, add: true, portal: true, boom: true, maze: true };
    expect(seen(1, 4800), 'long enough for every one of his moves to come up').toEqual(ALL);
    expect(seen(2, 4800)).toEqual(ALL);
  });
});

describe('he moves: through a portal, to the side of the arena farther from you', () => {
  // "He is seen opening a portal and teleporting with it" (MePhone4); "In 'You Can't Do This Forever', MePhone uses the rejection portal to teleport" (Rejection Portal): Only if canon moves
  it('steps out of a ring at the far side from you at the start of every glove turn, and stays put if he is already there', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      b.x = 550; b.homeX = 550; b._hz.hop = null; var out = {};
      b._pickForce = 'mephone'; b._atkLive = null; b._atkTimer = 1; step(); out.start = { hop: b._hz.hop && b._hz.hop.slice(), x: b.x, fd: b._hz.fd };
      var gone = -1, back = -1;
      for (var i=0;i<30;i++){ step(); f.x = 300; if (gone < 0 && b.x !== 550) gone = i; if (back < 0 && !b._hz.hop) back = i; }
      out.end = { x: b.x, home: b.homeX, gone: gone, back: back };
      // you are on the right: he goes to the left
      f.x = 800; b._pickForce = 'mephone'; b._atkLive = null; b._atkTimer = 1; b._tel = 0; step(); for (var j=0;j<30;j++){ step(); f.x = 800; } out.left = b.x;
      // already at the far side: no hop at all
      f.x = 800; b._pickForce = 'mephone'; b._atkLive = null; b._atkTimer = 1; b._tel = 0; step(); out.stay = { hop: b._hz.hop, x: b.x };
      return out; })()`);
    expect(r.start.hop, 'the ring opens as the wind-up starts: [frames so far, from, to]').toEqual([0, 550, 946]);
    expect(r.start.fd, 'and the glove will come from the side he steps to, toward you').toBe(-1);
    expect(r.end.x).toBe(946);
    expect(r.end.home, 'he holds there').toBe(946);
    expect(r.end.gone, 'he is gone from the middle on the ninth frame (out through the ring)').toBe(8);
    expect(r.end.back, 'and has come in by the nineteenth').toBeLessThan(21);
    expect(r.left, 'you are on the right: the left side, 14% of the way in').toBeCloseTo(154, 6);
    expect(r.stay.hop, 'a hop to where he already is is no hop').toBe(null);
  });

  it('from phase 2 every turn starts with a hop (the glove, MeLife, the portal, the boomerang and the maze, which is built round you with him out of it); phase 1 the glove and the maze ("A-MAZE-ING! from P1", the owner, Round 17: the pen is built round you wherever he stands, so he steps out of its way in phase 1 too)', () => {
    const turn = (ph, k) => W.eval(`(function(){ ${STAGE(300, ph)}
      b._hz.hop = null; b.x = 550; b.homeX = 550; ${FORCE(k)} b._atkTimer = 1; step();
      return [b._telKind, !!b._hz.hop]; })()`);
    const out = { 1: {}, 2: {} };
    for (const ph of [1, 2]) for (const k of [0, 1, 2, 3, 4]) { const [kind, hop] = turn(ph, k); out[ph][kind] = hop; }
    expect(out[1], 'phase 1: the glove and the maze, and nothing else').toEqual({ mephone: true, melife: false, portal: false, boomerang: false, maze: true });
    expect(out[2]).toEqual({ mephone: true, melife: true, portal: true, boomerang: true, maze: true });
  });

  it('squeezes thin and fades going out of the ring, and the ring is drawn at each end (and the hop never takes him off the stage)', () => {
    const r = WC.eval(`(function(){ ${STAGE(300, 2)}
      var out = { fx: [], xs: [] };
      b._pickForce = 'mephone'; b._atkLive = null; b._atkTimer = 1;
      for (var i=0;i<24;i++){ step(); f.x = 300; f.invuln = 99; out.xs.push(b.x);
        ctx.save(); ctx.globalAlpha = 1; var err = null; try { drawBossSprite(b); mpDrawFx(b); } catch(e){ err = e.message; } out.fx.push(err); ctx.restore(); }
      out.min = Math.min.apply(null, out.xs); out.max = Math.max.apply(null, out.xs); out.R = b.r; out.WW = WW; return out; })()`);
    expect(r.fx.filter(Boolean)).toEqual([]);
    expect(r.min).toBeGreaterThanOrEqual(r.R*0.9);
    expect(r.max).toBeLessThanOrEqual(r.WW - r.R*0.9);
  });

  it('arrives through a ring in the middle of the Elimination Area', () => {
    const r = W.eval(`(function(){ ${STAGE(300)} b._hz.hop = null; summons = []; spawnBossRushBoss(); var n = summons.find(function(s){ return s.type==='boss'; });
      var out = { hop: n._hz.hop && n._hz.hop.slice(), x: n.x }; n._atkTimer = 99999; for (var i=0;i<4;i++) updateBossAttack(n, f);
      out.after = { hop: n._hz.hop, x: n.x }; summons = []; return out; })()`);
    expect(r.hop, 'half way in already: the next frame teleports him to the middle and he comes the rest of the way').toEqual([8, 550, 550]);
    expect(r.after.x).toBe(550);
  });
});

describe('FIST THINGY!', () => {
  // The Fist Thingy page: "a red boxing glove with the label 'Fist Thingy' on it attached to a gray or white pole" that "shoots out and punches the contestant ... at full speed in the Elimination
  // Area and sends them into Idiotic Island". Round 8/10: "FIST THINGY! (redone: pole tell, faster 2x glove, P2 finisher from the far edge)"; the glove is the 2x one ("buff fist thingy's size" -> "2x").
  const fire = (ph, tx, bx = 900, row = 'groundY()-100') => W.eval(`(function(){ projectiles = []; hazardT = 0;
    var s = ${S('_phase:' + ph + ', _telPh:' + ph + ', x:' + bx + ', _telX:' + tx + ', _telY:' + row + ', _hz:{ fd:' + (Math.sign(tx - bx) || 1) + ' }')};
    fireBossAttack(s, null);
    var out = projectiles.map(function(p){ return { owner:p.owner, atk:p.bossAtk, shape:p.shape, x:p.x, y:p.y, vx:p.vx, vy:p.vy, r:p.r, dmg:p.dmg, kb:p.kb, delay:p.delay||0, sm:p.smAngle||0, up:!!p.mpUp,
      mk:p.mpM||0, arm:[p.armX0, p.armY0], pierce:!!p.pierce, dir:p.mpDir }; });
    projectiles = []; return { gloves: out, full: bossDmg(), row: ${row}, pu: s._hz.pu }; })()`);
  const sum = (g) => g.reduce((a, p) => a + p.dmg, 0);

  // The owner, 2026-10-01 (Round 17, the difficulty picks): "MePhone4: FIST THINGY! combo from P1" -- phase 1 used to be one whole glove (kb 13, a whole boss hit); it is a jab and the finisher now, the
  // phase-2 combo, "Harder, same damage": the two still make exactly one boss hit.
  it('P1\'s first glove is the jab: out of the edge behind it on its pole, it flies the row you stood in through everyone on it, light (0.45 of a boss hit, tilted flat)', () => {
    const r = fire(1, 300);
    expect(r.gloves, 'a jab and the finisher: the combo, from phase 1').toHaveLength(2);
    const [g] = r.gloves;
    expect(g, 'at 20 px a frame ("at full speed"; it was 15), 88 px across: the 2x glove').toMatchObject({ owner: -2, shape: 'fistthingy', vx: -20, vy: 0, y: r.row, r: 44, kb: 5, sm: -1, pierce: true });
    expect(g.atk).toBeGreaterThan(0);
    expect(g.dmg, 'the jab is 0.45 of a boss hit; the finisher takes the rest').toBeCloseTo(r.full*0.45, 6);
    expect(g.arm, 'the edge it comes out of, on the boss side of the stage').toEqual([1100, r.row]);
    expect(g.x, 'out on its pole, 400 px before the spot it flies through (it starts nearer than the edge only when there is no room)').toBe(300 + 400);
    expect(fire(1, 800, 200).gloves[0], 'it comes from the left edge and punches right when he is on the left').toMatchObject({ vx: 20, arm: [0, r.row], x: 800 - 400 });
    expect(fire(1, 1000, 200).gloves[0].x, 'and with you near the far wall it still starts a reach back: 600').toBe(600);
    expect(fire(1, 800, 900).gloves[0].x, 'no room for a reach behind you: it starts at the edge it comes out of, half in').toBe(1100 - 22);
    expect(fire(1, 80, 900).gloves[0].x, 'and a long way from the edge it keeps its reach').toBe(80 + 400);
    expect(r.pu, 'the TV is told a punch is out (the vote screen flickers)').toBe(0);
  });

  it('P1 and P2 are a jab, then the finisher from the FAR edge, timed to reach you the combo gap after it; the two make one boss hit (P1 too since Round 17: "FIST THINGY! combo from P1")', () => {
    for (const ph of [1, 2]) {
      const r = fire(ph, 300);
      expect(r.gloves, `phase ${ph}`).toHaveLength(2);
      const [a, b] = r.gloves;
      expect([a.vx, b.vx], 'the second comes the other way, out of the other edge').toEqual([-20, 20]);
      expect([a.arm[0], b.arm[0]]).toEqual([1100, 0]);
      expect([a.sm, b.sm], 'the jab is tilted flat (so it keeps you in the row); the finisher is not').toEqual([-1, 0]);
      expect([a.kb, b.kb]).toEqual([5, 13]);
      expect(a.dmg, 'the jab is 0.45 of a boss hit').toBeCloseTo(r.full*0.45, 6);
      expect(b.dmg, 'the finisher the rest').toBeCloseTo(r.full*0.55, 6);
      // the second leaves so that it reaches your spot 26 frames after the first would: past the 24-frame hit grace, so the first punch's grace cannot swallow it
      const tA = Math.abs(300 - a.x)/20, tB = Math.abs(300 - b.x)/20;
      expect(b.delay).toBe(Math.round(tA + 26 - tB));
      expect(b.delay + tB - tA, 'its arrival is 26 frames behind the first, give or take a rounded frame').toBeGreaterThanOrEqual(25.5);
      expect(b.delay).toBeGreaterThan(6 + 8);
      expect(a.atk).toBe(b.atk);
      expect(sum(r.gloves)).toBeLessThanOrEqual(r.full + 1e-9);
      expect(sum(r.gloves)).toBeGreaterThan(r.full - 1e-9);
    }
  });

  it('P3 is a jab from each edge and then the uppercut, rising out of a mark on the floor; the three make one boss hit', () => {
    const r = fire(3, 300);
    expect(r.gloves).toHaveLength(3);
    const [a, b, up] = r.gloves;
    expect([a.vx, b.vx]).toEqual([-20, 20]);
    expect([a.kb, b.kb, up.kb]).toEqual([5, 5, 10]);
    expect(up.up).toBe(true);
    expect(up.y, 'it starts under the floor, so its glove breaks out of it').toBeGreaterThan(W.eval('groundY()'));
    expect(up.vy, 'rising at the glove speed').toBeLessThan(-19);
    expect(Math.hypot(up.vx, up.vy)).toBeCloseTo(20, 5);
    expect(Math.sign(up.vx), 'tilted away from the boss, like a punch: it launches you up and away').toBe(Math.sign(a.vx));
    expect(up.sm, 'its launch is tilted up (SMASH_ANGLE_TILT)').toBe(2);
    expect(up.delay - b.delay, 'it comes the combo gap after the second jab would land: past that jab\'s hit grace').toBeGreaterThan(24);
    expect(up.mk, 'and its mark is dropped on the floor when the second jab flies').toBe(up.delay - b.delay);
    expect(up.arm[1], 'its pole stands on the floor line').toBe(W.eval('groundY()'));
    expect(new Set(r.gloves.map((g) => g.atk)).size, 'one attack id for the whole combo').toBe(1);
    expect(sum(r.gloves)).toBeCloseTo(r.full, 6);
  });

  it('flies the whole row, slams the far wall (shake, dust, a scar), waves goodbye there for 24 frames and slides back out -- and hurts nobody while it waves', () => {
    const r = W.eval(`(function(){ ${STAGE(560)}
      f.invuln = 99; projectiles = []; IMPACT_SCARS = [];
      var s = b; s._telPh = 1; s._telX = 560; s._telY = groundY() - 24; s._hz.fd = -1; fireBossAttack(s, f);
      var g = projectiles[0], xs = [], waveAt = -1, scarAt = -1, goneAt = -1, dustMax = 0, scarsAtWave = -1;   // (the jab: phase 1 has the finisher behind it now, with a wall of its own to slam later)
      for (var i=0;i<120;i++){
        step(); f.invuln = 99; xs.push(g.x); dustMax = Math.max(dustMax, IMPACT_DUST.length);
        if (waveAt < 0 && g.mpWave > 0){ waveAt = i; scarsAtWave = IMPACT_SCARS.length; }
        if (scarAt < 0 && IMPACT_SCARS.length > 0) scarAt = i;
        if (goneAt < 0 && g.life <= 0) goneAt = i;
        if (waveAt >= 0 && i === waveAt + 4){ f.invuln = 0; f.x = g.x; f.y = g.y; f.pct = 0; }   // standing in a waving glove
      }
      return { xs: xs.slice(0, 5), waveAt: waveAt, scarAt: scarAt, goneAt: goneAt, wall: g.x, standing: f.pct, scars: scarsAtWave, dust: dustMax }; })()`);
    expect(r.xs.slice(1).map((x, i) => Math.round(r.xs[i] - x)), '20 px a frame').toEqual([20, 20, 20, 20]);
    expect(r.wall, 'it stops against the wall, its glove still all on the screen').toBe(58);
    expect(r.scarAt, 'the slam is heavy: it scars the floor where it lands, the frame it lands').toBe(r.waveAt);
    expect(r.scars).toBe(1);
    expect(r.dust, 'and dust rolls out along the floor').toBeGreaterThan(0);
    expect(r.standing, 'it is inert while it waves').toBe(0);
    expect(r.goneAt, 'twenty-four frames of wave and slide, then it is gone').toBeGreaterThan(r.waveAt + 20);
    expect(r.goneAt).toBeLessThan(r.waveAt + 30);
  });

  it('a landed punch is heavy too: it scars the floor where it connects', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      IMPACT_SCARS = []; b._telPh = 1; b._telX = 300; b._telY = f.y; b._hz.fd = -1; fireBossAttack(b, f);
      var hitAt = -1, scarAt = -1;
      for (var i=0;i<60;i++){ step(); if (hitAt < 0 && f.pct > 0){ hitAt = i; } if (scarAt < 0 && IMPACT_SCARS.length) scarAt = i; if (f.hitstun <= 0){ f.vx = 0; } }
      return { hitAt: hitAt, scarAt: scarAt, dmg: f.pct, full: bossDmg() }; })()`);
    expect(r.hitAt).toBeGreaterThan(0);
    expect(r.dmg).toBeCloseTo(r.full, 5);
    expect(r.scarAt, 'seen the frame after it lands').toBeLessThanOrEqual(r.hitAt + 2);
    expect(r.scarAt).toBeGreaterThanOrEqual(0);
  });

  it('against a still target the whole P3 combo lands, every punch, and still totals one boss hit', () => {
    const r = W.eval(`(function(){ ${STAGE(560)}
      b.x = 900; b.homeX = 900; var x0 = f.x, y0 = f.y;
      b._telPh = 3; b._telX = x0; b._telY = y0; b._hz.fd = -1; fireBossAttack(b, f);
      var hits = 0, last = f.pct;
      for (var i=0;i<260;i++){ step(); if (f.hitstun <= 0){ f.x = x0; f.y = y0; f.vx = 0; f.vy = 0; } if (f.pct > last + 1e-9){ hits++; last = f.pct; }
        if (!projectiles.some(function(p){ return p.mpGlove; })) break; }                       // the combo is over
      projectiles = []; return { hits: hits, total: f.pct, full: bossDmg() }; })()`);
    expect(r.hits, 'no punch is swallowed by the one before it').toBe(3);
    expect(r.total).toBeLessThanOrEqual(r.full + 1e-6);
    expect(r.total).toBeGreaterThan(r.full * 0.9);
  });

  // The review's probe, kept: at 80% the first glove of a combo launched the fighter out of its row and the rest whiffed, so his signature hit softer the further the fight went.
  it('at 80%, a free-standing fighter takes the whole combo in every phase (two punches in phases 1 and 2, three in phase 3), and every finisher launches as hard as the others\'', () => {
    const r = W.eval(`(function(){ var out = {};
      [1, 2, 3].forEach(function(ph){ [250, 500].forEach(function(d){
        ${STAGE(700)}
        b.x = 300; b.homeX = 300; f.x = 300 + d; f.pct = 80; var x0 = f.x, y0 = f.y, st = f.stocks;
        b._telPh = ph; b._telX = x0; b._telY = y0; b._hz.fd = 1; fireBossAttack(b, f);
        var hits = 0, last = f.pct, dealt = 0, launch = 0;
        for (var i=0;i<260;i++){ step(); if (f.stocks < st) break;
          if (f.pct > last + 1e-9){ hits++; dealt += f.pct - last; launch = Math.hypot(f.vx, f.vy); } last = f.pct;
          if (!projectiles.some(function(p){ return p.mpGlove; })) break; }                     // the combo is over
        out[ph + '/' + d] = { hits: hits, dealt: dealt, launch: launch };
        projectiles = [];
      }); });
      return { out: out, full: bossDmg(), kbs: [MEPHONE_GLOVE.jabKb, MEPHONE_GLOVE.kb] };
    })()`);
    for (const d of [250, 500]) {
      expect(r.out['1/' + d].hits, 'both punches of phase 1 land (the combo from phase 1: the owner, Round 17)').toBe(2);
      expect(r.out['2/' + d].hits, 'both punches of phase 2 land').toBe(2);
      expect(r.out['3/' + d].hits, 'all three of phase 3 land').toBe(3);
      for (const ph of [1, 2, 3]) expect(r.out[ph + '/' + d].dealt, `phase ${ph} at ${d} px deals the whole boss hit`).toBeCloseTo(r.full, 5);
      expect(r.out['1/' + d].launch, 'the phase-1 finisher launches as hard as phase 2\'s').toBeGreaterThanOrEqual(r.out['2/' + d].launch - 1e-6);
      expect(r.out['2/' + d].launch, 'and phase 2\'s as phase 1\'s').toBeGreaterThanOrEqual(r.out['1/' + d].launch - 1e-6);
    }
    expect(r.kbs[0], 'a jab is light').toBeLessThan(r.kbs[1] / 2);
  });

  it('a wind-up drawn in phase 1 fires phase 1\'s combo (a jab and the finisher), even if a hit crosses into phase 3 during it', () => {
    const r = W.eval(`(function(){ ${STAGE(800)}
      b._atkTimer = 1; b._pickForce = 'mephone'; b._atkLive = null; step();
      var name = document.getElementById('banner').textContent, kind = b._telKind;
      var gloves = 0, AP = addProj;
      addProj = function(p){ if (p && p.mpGlove) gloves++; return AP(p); };
      try {
        b.hp = b.maxHp*0.2;
        for (var i=0;i<40;i++){ step(); f.x = 800; f.vx = 0; }
        return { name: name, kind: kind, phase: b._phase, gloves: gloves };
      } finally { addProj = AP; summons = []; projectiles = []; }
    })()`);
    expect(r.kind).toBe('mephone');
    expect(r.name, 'a combo in every phase now: "FIST THINGY! combo from P1" (the owner, Round 17)').toBe('FIST THINGY COMBO!');
    expect(r.phase).toBe(3);
    expect(r.gloves, 'two gloves, the combo of the phase it was drawn in -- not the three of phase 3').toBe(2);
  });

  // The row follows you through the wind-up until MEPHONE_GLOVE.lock frames before the punch (a red band; a white one once it holds): the dodge is to leave the row inside the lock.
  it('the glove row follows you through the wind-up, holds for its last MEPHONE_GLOVE.lock frames, and the glove goes along it', () => {
    const r = W.eval(`(function(){ ${STAGE(800)}
      b._atkTimer = 1; b._pickForce = 'mephone'; b._atkLive = null; step();
      var lock = MEPHONE_GLOVE.lock, follow = 0, held = 0, broke = [], lockedX = null, lockedY = null, glove = null, AP = addProj;
      addProj = function(p){ if (p && p.mpGlove && !glove) glove = { y: p.y, vx: p.vx }; return AP(p); };
      try {
        for (var i=0; i<40 && !glove; i++){
          var prev = b._tel; f.x = 800 + i*3; f.vx = 0;
          if (prev === lock) { f.y = groundY() - 140; f.onground = false; f.vy = 0; }   // she jumps: the last row it takes
          step();
          if (glove) break;
          if (prev >= lock){ if (b._telX === f.x) follow++; else broke.push(i); if (prev === lock){ lockedX = b._telX; lockedY = b._telY; } }
          else { if (b._telX === lockedX && b._telY === lockedY) held++; else broke.push(i); }
          if (prev < lock) { f.y = groundY() - 24; f.vy = 0; }                          // and lands: it holds anyway
        }
        return { follow: follow, held: held, broke: broke, lock: lock, glove: glove, lockedY: lockedY, row: clamp(lockedY, 60, groundY()-16) };
      } finally { addProj = AP; summons = []; projectiles = []; }
    })()`);
    expect(r.broke, 'the row followed, then held, every frame').toEqual([]);
    expect(r.follow, 'following through the wind-up').toBe(36 - r.lock + 1);
    expect(r.held, 'held for the frames after it locked (the last of them is the punch)').toBe(r.lock - 2);
    expect(r.glove, 'the glove came').not.toBe(null);
    expect(r.glove.y, 'along the row it locked on, not where she landed').toBe(r.row);
  });

  it('a waiting glove\'s row, and where it starts, follow you until its last lock frames: the finisher answers where you are, not where you were', () => {
    const r = W.eval(`(function(){ ${STAGE(560, 2)}
      b.x = 900; b.homeX = 900; b._telPh = 2; b._telX = 560; b._telY = f.y; b._hz.fd = -1; fireBossAttack(b, f);
      var B = projectiles.filter(function(p){ return p.delay > 0; })[0], d0 = B.delay, lock = B.mpLk, rows = [], xs = [], held = [];
      for (var i=0;i<d0 - 2;i++){
        if (i === 6){ f.y = groundY() - 150; f.x = 700; f.vy = 0; f.vx = 0; f.onground = false; }
        step(); f.invuln = 99; if (i >= 6 && i < 12) f.vy = 0;
        (B.delay > lock ? rows : held).push(B.y);
        if (B.delay > lock) xs.push(B.x);
      }
      return { d0: d0, lock: lock, rowsEnd: rows[rows.length - 1], heldRows: held, held: held.length, y: f.y, xEnd: xs[xs.length - 1], gy: groundY() }; })()`);
    expect(r.lock).toBe(8);
    expect(r.heldRows.length > 0 && r.heldRows.every((y) => y === r.heldRows[0]), 'it holds for the last frames').toBe(true);
    expect(r.rowsEnd, 'the row it holds is the one you were on (up in the air), not the floor it was thrown at').toBeLessThan(r.gy - 60);
    expect(r.xEnd, 'it starts a reach before where you stood last: 700 and the glove comes from the left edge').toBe(700 - 400);
  });

  it('the uppercut launches upward, inside the boss knockback band', () => {
    const r = W.eval(`(function(){
      function launch(tilt){ ${STAGE(600)}
        b.x = 900; b.homeX = 900; b._telPh = 3; b._telX = f.x; b._telY = f.y; b._hz.fd = -1; fireBossAttack(b, f);
        var up = projectiles.filter(function(p){ return p.mpUp; })[0];
        projectiles = [up]; up.delay = 0; up.x = f.x - 20; up.y = f.y + 40; if (!tilt) up.smAngle = 0;
        for (var i=0;i<8 && f.pct===0;i++) step();
        var v = { vx: f.vx, vy: f.vy, hit: f.pct > 0 }; projectiles = []; return v;
      }
      return { up: launch(true), flat: launch(false) };
    })()`);
    expect(r.up.hit).toBe(true);
    expect(r.up.vy).toBeLessThan(0);
    expect(Math.abs(r.up.vy), 'mostly up').toBeGreaterThan(Math.abs(r.up.vx) * 2);
    expect(Math.abs(r.up.vy), 'higher than the same glove thrown flat').toBeGreaterThan(Math.abs(r.flat.vy));
  });

  it('draws in every state without throwing: waiting (the lane and pole), the uppercut\'s mark, flying, slamming and waving, and his own wind-up tell', () => {
    const err = WC.eval(`(function(){
      try {
        var gy = groundY(), base = { owner:-2, ownerObj:{team:-1, idx:-2}, mpGlove:1, mpDir:-1, shape:'fistthingy', r:44, color:'#d8302a', x:700, y:gy-24, vx:-20, vy:0, armX0:1100, armY0:gy-24, mpLk:8, delay:0 };
        var shots = [ {}, { delay:20, mpD0:30 }, { delay:6, mpD0:30 }, { mpDir:1, vx:20, armX0:0, delay:12, mpD0:26 },
          { mpUp:1, mpM:40, delay:60, y:gy+80, x:400, armX0:400, armY0:gy, vx:-4, vy:-19 }, { mpUp:1, mpM:40, delay:30, y:gy+80, x:400, armX0:400, armY0:gy }, { mpUp:1, mpM:40, delay:5, y:gy+80, x:400, armX0:400, armY0:gy },
          { mpUp:1, y:gy-60, x:400, armX0:400, armY0:gy, vx:-4, vy:-19 }, { delay:1e9, mpWave:24, x:58 }, { delay:1e9, mpWave:12, x:58 }, { delay:1e9, mpWave:4, x:58 }, { mpDir:1, delay:1e9, mpWave:10, x:1042, armX0:0 } ];
        shots.forEach(function(o){ ctx.save(); drawProjectile(Object.assign({}, base, o)); ctx.restore(); });
        [0, 10, 28, 34, 35].forEach(function(t){ var s = Object.assign(${S('_telKind:"mephone", _tel:' + 36 + ', _telX:300, _telY:gy-30, _hz:{ fd:-1 }')}, { _tel:t || 1 }); ctx.save(); drawBossSprite(s); ctx.restore(); });
        return null;
      } catch(e){ return e.message; }
    })()`);
    expect(err).toBe(null);
  });

  // The owner, 2026-10-01 (Round 17): "there is a glitch with teh fist thingy, they stay stuck to mephone... they dont fly accross the screen." Three things did it: the pole ran back to the wall
  // behind him, where he stands, so a glove in flight hung off his side on a tether; a glove aimed just past the middle of the stage was born inside his body; and a row off the stage began the
  // glove beyond the wall it slams, so it waved there in a frame, with no flight at all.
  describe('the glove flies across the stage and does not stay on him', () => {
    const wallOf = (dir) => W.eval(`mpWallX(${dir})`);
    const jabs = (ph, tx, bx) => fire(ph, tx, bx).gloves.filter((g) => !g.up);

    it('is always born inside the stage with 300 px to cross before the wall it slams, whatever row it was aimed at: off either side of the stage, or no row at all', () => {
      const bad = [];
      for (const ph of [1, 2, 3]) for (const bx of [154, 946]) for (const tx of [-1500, -300, -40, 0, 30, 560, 1070, 1100, 1140, 1400, 3000, NaN]) {
        for (const g of jabs(ph, tx, bx)) {
          const flight = Math.abs(wallOf(g.dir) - g.x);
          if (!Number.isFinite(g.x) || g.x < 0 || g.x > 1100 || flight < 300 - 1e-9) bad.push(`phase ${ph}, he is at ${bx}, row ${tx}: a glove at ${g.x} flying ${g.dir}, ${flight} px to the wall`);
        }
      }
      expect(bad).toEqual([]);
    });

    it('is born in front of him, not on him, when the row is just past the middle of the stage: he stands 154 px from the wall he hopped to, and a reach before the row began inside his body', () => {
      const bad = [], starts = {};
      for (const [bx, rows] of [[154, [470, 520, 560, 600, 640, 680, 720, 760, 900]], [946, [630, 580, 540, 500, 460, 420, 380, 340, 200]]]) for (const tx of rows) {
        const [g] = jabs(1, tx, bx), gap = Math.abs(g.x - bx) - (85 + 44);   // the bare MePhone is 85 px of radius, the glove 44
        starts[`${bx}/${tx}`] = Math.round(g.x);
        if (gap < 0) bad.push(`he is at ${bx}, row ${tx}: the glove starts at ${Math.round(g.x)}, ${Math.round(-gap)} px into him`);
      }
      expect(bad).toEqual([]);
      expect(starts['154/900'], 'a row far from him keeps its reach: 400 px before it').toBe(500);
      expect(starts['154/640'], 'a row just past the middle starts at the front of him: where he stands, his radius, the glove\'s and the gap').toBe(154 + 85 + 44 + 12);
      expect(starts['946/460'], 'and the same from the other side').toBe(946 - 85 - 44 - 12);
    });

    it('draws the tell where the glove will start, also while he is still in the ring: it reads where he is going, not where he was', () => {
      const r = W.eval(`(function(){
        var hopR = ${S('x:946, _hopTo:154, _hz:{ fd:1, hop:[3, 946, 154] }')}, thereL = ${S('x:154, _hz:{ fd:1 }')};
        var hopL = ${S('x:154, _hopTo:946, _hz:{ fd:-1, hop:[3, 154, 946] }')}, thereR = ${S('x:946, _hz:{ fd:-1 }')};
        return { a: mpGloveStartX(1, 640, hopR), b: mpGloveStartX(1, 640, thereL), c: mpGloveStartX(-1, 460, hopL), d: mpGloveStartX(-1, 460, thereR) };
      })()`);
      expect(r.a, 'on the way to the left').toBe(r.b);
      expect(r.c, 'on the way to the right').toBe(r.d);
      expect(r.b, 'and it is the front of him').toBe(154 + 85 + 44 + 12);
    });

    it('draws its pole as a rod it carries, never the whole way back to the wall behind him: in the tell, in flight and slammed, no more than MP4.fist.rod of it', () => {
      const r = WC.eval(`(function(){
        var calls = [], P = mpPole, out = [];
        mpPole = function(c, x0, y0, x1, y1, th){ calls.push(Math.hypot(x1 - x0, y1 - y0)); };
        try {
          var gy = groundY(), base = { owner:-2, ownerObj:{team:-1, idx:-2}, mpGlove:1, mpDir:-1, shape:'fistthingy', r:44, color:'#d8302a', x:700, y:gy-24, vx:-20, vy:0, armX0:1100, armY0:gy-24, mpLk:8, delay:0 };
          [ {}, { x:300 }, { x:1000 }, { mpDir:1, vx:20, armX0:0, x:600 }, { mpDir:1, vx:20, armX0:0, x:1000 }, { delay:1e9, mpWave:12, x:58 }, { mpDir:1, delay:1e9, mpWave:12, x:1042, armX0:0 }, { delay:20, mpD0:30, x:1078 } ].forEach(function(o){
            calls.length = 0; ctx.save(); drawProjectile(Object.assign({}, base, o)); ctx.restore(); out.push({ o: o, calls: calls.slice() });
          });
          [0, 0.3, 0.7, 1].forEach(function(u){ [1, -1].forEach(function(dir){
            calls.length = 0; ctx.save(); mpGloveTell(ctx, dir, gy-24, u, false, dir > 0 ? 315 : 785); ctx.restore(); out.push({ o: { tell: u, dir: dir }, calls: calls.slice() });
          }); });
          return { out: out, rod: MP4.fist.rod };
        } finally { mpPole = P; }
      })()`);
      expect(r.rod).toBe(260);
      for (const c of r.out) {
        expect(c.calls.length, `${JSON.stringify(c.o)} draws a pole`).toBeGreaterThan(0);
        for (const len of c.calls) expect(len, `${JSON.stringify(c.o)}: its pole is a rod, not a tether to the wall`).toBeLessThanOrEqual(r.rod + 1e-6);
      }
    });

    it('flies: in every phase each glove crosses at least 300 px of the stage in the air before it slams, aimed at a row in the middle, past the edge of the stage or off it', () => {
      const r = W.eval(`(function(){ var out = [];
        [1, 2, 3].forEach(function(ph){ [-900, 640, 1500].forEach(function(tx){ [154, 946].forEach(function(bx){
          ${STAGE(560)}
          f.invuln = 99; b.x = bx; b.homeX = bx; projectiles = [];
          b._telPh = ph; b._telX = tx; b._telY = groundY() - 24; b._hz.fd = bx < 550 ? 1 : -1; fireBossAttack(b, f);
          var gs = projectiles.filter(function(p){ return p.mpGlove && !p.mpUp; }).map(function(p){ return { p: p, x0: p.x, flew: 0 }; });
          for (var i=0;i<150;i++){
            step(); f.invuln = 99; f.x = 560; f.vx = 0; f.y = groundY() - 24;
            gs.forEach(function(g){ if (!(g.p.delay > 0) && !(g.p.mpWave > 0)) g.flew++; });
            if (!projectiles.some(function(p){ return p.mpGlove; })) break;
          }
          out.push({ ph: ph, tx: tx, bx: bx, flew: gs.map(function(g){ return g.flew; }), born: gs.map(function(g){ return Math.round(g.x0); }) });
          projectiles = [];
        }); }); });
        return out; })()`);
      const bad = [];
      for (const c of Array.from(r)) {
        if (c.flew.length !== 2) bad.push(`phase ${c.ph}: ${c.flew.length} gloves`);   // a jab and the finisher in every phase (the uppercut is not counted: it rises out of the floor)
        c.flew.forEach((n, i) => { if (n < 14) bad.push(`phase ${c.ph}, he is at ${c.bx}, row ${c.tx}: glove ${i + 1} born at ${c.born[i]} flew ${n} frames`); });
      }
      expect(bad).toEqual([]);
    });
  });
});

describe('REJECTION PORTAL!', () => {
  // The Rejection Portal page: "a vertical, circular vortex ... It has yellow and pink on the inside and will fade away if an object enters it"; "he seems to be able to instantly do so just by
  // snapping his fingers"; "MePhone4 has tossed Apple and pushed Fan (first time) into the portal". Where it leads is never named: the oval's exit is across the arena.
  // The portal's own move, fired by hand the way the engine fires it at the end of the wind-up, in phase `ph` against a still fighter at `fx`; what it opens, as plain numbers.
  const FIRE = (fx, ph) => `${STAGE(fx, ph)}
    b._telPh = ${ph}; b._telX = ${fx}; b._telY = f.y; b._hz.pw = null; BOSS_MOVES.portal(b, f);`;
  const opened = (fx, ph) => W.eval(`(function(){ ${FIRE(fx, ph)} return { pt: JSON.parse(JSON.stringify(b._hz.pt)), id: b._ptId, pw: b._hz.pw }; })()`);

  it('the exit is across the arena, whichever side the entrance is on', () => {
    const r = W.eval(`[100, 300, 550, 800, 1000].map(function(x){ return mpExitX(x); })`);
    expect(r, 'a stage away, and never nearer than 110 px to a wall').toEqual([990, 800, 210, 300, 110]);
    for (const [x, e] of [[100, 990], [300, 800], [550, 210], [800, 300], [1000, 110]]) expect(Math.abs(e - x), `at ${x} it is a stage away`).toBeGreaterThanOrEqual(340);
  });

  it('the wind-up marks where it will open AND, across the arena, where it lets out -- from its first frame; phase 3 marks three', () => {
    const plan = (ph) => W.eval(`(function(){ ${STAGE(560, ph)}
      b._hz = {}; b.x = 550; b._pickForce = 'portal'; b._atkLive = null; b._atkTimer = 1; step();
      return { kind: b._telKind, pw: b._hz.pw && JSON.parse(JSON.stringify(b._hz.pw)), tel: b._tel }; })()`);
    const p1 = plan(1), p3 = plan(3);
    expect(p1.kind).toBe('portal');
    expect(p1.pw, 'the spot you stood on when he snapped, at its height, and the exit 340 px across').toEqual([[560, 560, 220]]);
    expect(p3.kind).toBe('portal');
    expect(p3.pw.map((q) => q[0]), 'your spot, then one each side').toEqual([560, 390, 730]);
    expect(p3.pw.map((q) => q[2])).toEqual([220, 730, 370]);
  });

  it('snaps open where you stood the frame the wind-up ends (48, 42, 36 frames to live by phase), and phase 2 and 3 add entrances a beat behind', () => {
    const p1 = opened(560, 1), p2 = opened(560, 2), p3 = opened(560, 3);
    expect(W.eval('[MP4.portal.rx, MP4.portal.ry]'), 'half as wide as it is tall: the wiki\'s oval, a vertical vortex seen side on').toEqual([30, 62]);
    // [x, y, exit x, frames to wait, frames open, frames in all, frame it flung someone, follows you]
    expect(p1.pt).toEqual([[560, 560, 220, 0, 48, 48, 0, 0]]);
    expect(p2.pt.map((q) => [q[0], q[3], q[5], q[7]]), 'phase 2: a second entrance 30 frames later, which follows you').toEqual([[560, 0, 42, 0], [560, 30, 42, 1]]);
    expect(p3.pt.map((q) => [q[0], q[2], q[3], q[5]]), 'phase 3: three, 24 frames apart, your spot and then one each side').toEqual([[560, 220, 0, 36], [390, 730, 24, 36], [730, 370, 48, 36]]);
    expect(p1.pw, 'the plan is spent once it is open').toBe(null);
    expect(p1.id, 'and it has an attack id of its own').toBeGreaterThan(0);
  });

  it('touch it and you are hit once for 0.8 of a boss hit and FLUNG along a low arc to the exit -- landing there, not past it -- and it fades once it has flung someone', () => {
    const r = W.eval(`(function(){ ${STAGE(700)}
      var g = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 1000, groundY()-24, 1); g.team=0; g.controller='still'; fighters = [f, g]; g.invuln = 0;
      var x0 = f.x, y0 = f.y;
      b._telPh = 1; b._telX = x0; b._telY = y0; b._hz.pw = null; BOSS_MOVES.portal(b, f);
      var q = b._hz.pt[0], out = { ex: q[2] }, hits = 0, last = 0, landed = -1, minY = y0, vxEnd = null;
      for (var i=0;i<90;i++){
        step();
        if (f.pct > last + 1e-9){ hits++; last = f.pct; out.hitAt = i; }
        minY = Math.min(minY, f.y);
        if (out.hitAt !== undefined && !f._mpFl && landed < 0){ landed = i; out.landX = f.x; vxEnd = f.vx; }
        if (!b._hz.pt && out.gone === undefined) out.gone = i;
      }
      out.hits = hits; out.dmg = f.pct; out.cap = bossDmg()*0.8; out.landed = landed; out.arc = y0 - minY; out.spared = g.pct === 0; out.vxEnd = vxEnd; out.y0 = y0;
      return out; })()`);
    expect(r.hits, 'hit once, not every frame').toBe(1);
    expect(r.dmg).toBeCloseTo(r.cap, 5);
    expect(r.landed, 'and the fling ends').toBeGreaterThan(r.hitAt);
    expect(Math.abs(r.landX - r.ex), 'it comes down on the exit\'s ring').toBeLessThanOrEqual(12);
    expect(r.arc, 'a low arc: up a little and over').toBeGreaterThan(10);
    expect(r.arc).toBeLessThan(80);
    expect(Math.abs(r.vxEnd), 'and the speed stops with it').toBeLessThan(2);
    expect(r.spared, 'anyone clear of it is untouched').toBe(true);
    expect(r.gone, 'and it fades once it has flung someone, well before its 48 frames').toBeLessThanOrEqual(r.hitAt + 12);
  });

  it('only the first thing to land counts: walking into the other phase-3 entrances after being flung costs nothing more', () => {
    const r = W.eval(`(function(){ ${FIRE(560, 3)}
      var hits = 0, last = 0, inside = 0;
      for (var i=0;i<140;i++){
        step(); f.hitstun = Math.max(0, f.hitstun - 1);
        if (last > 0 && !f._mpFl && b._hz.pt){                                                           // flung once: now stand in whichever entrance is open
          var o = b._hz.pt.filter(function(q){ return q[3] === 0 && q[4] > 4; })[0];
          if (o){ f.x = o[0]; f.y = o[1]; f.vx = 0; f.vy = 0; f.invuln = 0; inside++; }
        }
        if (f.pct > last + 1e-9){ hits++; last = f.pct; }
      }
      return { hits: hits, dmg: f.pct, cap: bossDmg()*0.8, inside: inside }; })()`);
    expect(r.inside, 'it did stand in an open one').toBeGreaterThan(5);
    expect(r.hits).toBe(1);
    expect(r.dmg).toBeCloseTo(r.cap, 5);
  });

  it('the second entrance (phase 2) follows you until its last 14 frames, then holds, and opens 30 frames after the snap', () => {
    const r = W.eval(`(function(){ ${FIRE(300, 2)}
      var q = b._hz.pt[1], follow = [], held = [], opened = -1;
      for (var i=0;i<40;i++){
        f.x = 300 + i*8; f.invuln = 99; step();
        if (q[3] > 14) follow.push([Math.round(f.x), q[0]]); else if (q[3] > 0) held.push(q[0]);
        if (opened < 0 && q[3] === 0) opened = i;
      }
      return { follow: follow, held: held, opened: opened, lock: MP4.portal.lock, wait: MP4.portal.wait }; })()`);
    expect(r.follow.length).toBeGreaterThan(10);
    for (const [fx, qx] of r.follow) expect(Math.abs(qx - fx), 'it keeps up with you').toBeLessThan(10);
    expect(r.held, 'then it holds for its last 14').toHaveLength(r.lock);
    expect(new Set(r.held).size).toBe(1);
    expect(r.opened, 'and opens 30 frames after the snap').toBe(r.wait - 1);
  });

  it('is exactly as wide as it is drawn: a body that touches the oval is caught (a hair inside its half-width, 30 px, plus the body), one a hair outside is not', () => {
    const r = W.eval(`(function(){ var out = {};
      [-3, 3].forEach(function(d){ ${FIRE(700, 1)}
        var q = b._hz.pt[0], R = f.hurt.rx, dx = R + MP4.portal.rx + d;    // the body's half-width, the oval's, and a hair either side of touching
        f.x = q[0] + dx; f.y = q[1]; f.vx = 0; f.vy = 0; f.invuln = 0; var hit = false;
        for (var i=0;i<4;i++){ mpPortalTick(b, f); if (f.pct > 0) hit = true; f.x = q[0] + dx; f.y = q[1]; if (!b._hz.pt) break; }
        out[d] = hit; });
      return out; })()`);
    expect(r).toEqual({ '-3': true, '3': false });
  });
});

describe('BOOMERANGS!', () => {
  // The Great Escape/Transcript: "(MePhone4 is standing in the middle of a redesigned Elimination Area with a pile of boomerangs.)", "(MePhone4 throws a boomerang at Party Hat, but before it can
  // reach him, it rebounds and returns to MePhone4's hand.)" Round 8: "BOOMERANGS! (draw the boomerang in the show's style if no frame shows one)": the show has one (cut).
  const throwIt = (ph, tx, bx = 550, ty = 'groundY()-24') => W.eval(`(function(){ ${STAGE(tx, ph)}
    b.x = ${bx}; b.homeX = ${bx}; b._telPh = ${ph}; b._telX = ${tx}; b._telY = ${ty}; BOSS_MOVES.boomerang(b, f);
    var out = projectiles.filter(function(p){ return p.mpBm; }).map(function(p){ return { x:p.x, y:p.y, vx:p.vx, delay:p.delay||0, r:p.r, dmg:p.dmg, atk:p.bossAtk, reach:p.mpBm.reach, shape:p.shape, pierce:!!p.pierce, kb:p.kb }; });
    return { shots: out, gy: groundY(), full: bossDmg() }; })()`);

  it('one boomerang along your row, out as far as you are and a little more (420 to 700 px), at 0.8 of a boss hit', () => {
    const near = throwIt(1, 450), far = throwIt(1, 950, 200), mid = throwIt(1, 150, 550);
    expect(near.shots).toHaveLength(1);
    expect(near.shots[0]).toMatchObject({ vx: -13, r: 20, shape: 'mp4boom', pierce: true });
    expect(near.shots[0].dmg).toBeCloseTo(near.full*0.8, 5);
    expect(near.shots[0].reach, '100 px away and a little more: the least reach, 420').toBe(420);
    expect(far.shots[0].reach, '750 px away and a little more: 700 at most').toBe(700);
    expect(mid.shots[0].reach, '400 px away and 60 more').toBe(460);
    expect(near.shots[0].y, 'along the row you stood in').toBe(near.gy - 24);
    expect(far.shots[0].vx, 'toward your side').toBe(13);
  });

  it('goes out, turns over its apex, and comes back to his hand -- where it is caught', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      b.x = 600; b.homeX = 600; b._telPh = 1; b._telX = 300; b._telY = groundY() - 24; f.invuln = 99; BOSS_MOVES.boomerang(b, f);
      var p = projectiles[0], phs = [], xs = [], caught = -1, apex = Infinity, last = null;
      for (var i=0;i<140;i++){ step(); f.invuln = 99; phs.push(p.mpBm.ph); xs.push(p.x); apex = Math.min(apex, p.x); if (caught < 0 && p.life <= 0){ caught = i; last = p.x; } }
      return { x0: xs[0], apex: apex, reach: p.mpBm.reach, caught: caught, order: phs.filter(function(v, i){ return i === 0 || v !== phs[i-1]; }), hand: b.x + p.mpBm.dir*b.r*0.55, last: last }; })()`);
    expect(r.order, 'out, the turn, back').toEqual([0, 1, 2]);
    expect(r.x0 - r.apex, 'out to the reach and a turn\'s coast past it').toBeGreaterThanOrEqual(r.reach);
    expect(r.x0 - r.apex).toBeLessThan(r.reach + 60);
    expect(r.caught, 'back in his hand: a second and a bit in all').toBeGreaterThan(60);
    expect(r.caught).toBeLessThan(100);
    expect(Math.abs(r.last - r.hand), 'and it is his hand it comes back to').toBeLessThan(40);
  });

  it('the return is a second chance to be hit, under the same attack id: the two hits together are at most one boss hit', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      b.x = 600; b.homeX = 600; b._telPh = 1; b._telX = 300; b._telY = groundY() - 24; BOSS_MOVES.boomerang(b, f);
      var hits = [], last = 0, x0 = f.x, ph = projectiles[0].mpBm;
      for (var i=0;i<140;i++){ step(); if (f.pct > last + 1e-9){ hits.push([i, +(f.pct - last).toFixed(2), ph.ph]); last = f.pct; } f.x = x0; f.y = groundY() - 24; f.vx = 0; f.vy = 0; }
      return { hits: hits, total: f.pct, full: bossDmg() }; })()`);
    expect(r.hits, 'once on the way out, once on the way back').toHaveLength(2);
    expect(r.hits.map((h) => h[2]), 'out, then back').toEqual([0, 2]);
    expect(r.hits[1][0] - r.hits[0][0], 'past the 24-frame hit grace').toBeGreaterThan(24);
    expect(r.total, 'capped as one boss hit').toBeCloseTo(r.full, 5);
    expect(r.hits[0][1]).toBeCloseTo(r.full*0.8, 5);
  });

  it('phase 3 throws two, the second 24 frames later along the OTHER level: the way you dodge the first can be into the second', () => {
    const lo = throwIt(3, 450), hi = throwIt(3, 450, 550, 'groundY()-170');
    expect(lo.shots).toHaveLength(2);
    expect(lo.shots[0].y, 'the first along your row (the floor)').toBe(lo.gy - 24);
    expect(lo.shots[1].y, 'the second at the height of the platform').toBe(lo.gy - 150);
    expect(lo.shots[1].delay).toBe(24);
    expect(hi.shots[0].y, 'you on the platform').toBe(hi.gy - 170);
    expect(hi.shots[1].y, 'the second along the floor').toBe(hi.gy - 28);
    expect(new Set(lo.shots.map((s) => s.atk)).size, 'one attack id').toBe(1);
  });

  it('draws his wind-up (the lane, the boomerang cocked in his hand) and the boomerang without throwing', () => {
    const err = WC.eval(`(function(){
      try {
        [36, 20, 5, 1].forEach(function(t){ var s = ${S('_telKind:"boomerang", _tel:t, _telX:300, _telY:groundY()-30, _hz:{}')}; ctx.save(); drawBossSprite(s); ctx.restore(); });
        var p = { x:400, y:500, vx:-13, vy:0, r:20, color:'#f09a4a', shape:'mp4boom', owner:-2, ownerObj:{team:-1, idx:-2} }; drawProjectile(p); p.vx = 0; drawProjectile(p);
        return null;
      } catch(e){ return e.message; }
    })()`);
    expect(err).toBe(null);
  });
});

describe('MELIFE DOWNLOAD!: hostile assist trophies', () => {
  // The MeLife page: "When a character's icon is selected, a silhouette of their main color appears, and then downloads the contestant from bottom to top"; "The MeLife App was an app on MePhone4
  // that created people, objects, and structures". The owner: "mephone should spawn hostile assist trophies." Round 10: MELIFE DOWNLOAD! (back in): a pincer, past you.
  const PICK = { '8-Ball': 0, 'Pie': 0.3, 'Beach Ball': 0.55, 'Spongy': 0.8 };
  const download = (name, side, x = '') => `(function(){ var R = Math.random; Math.random = function(){ return ${PICK[name]}; };
    try { return meLifeDownload(b, ${side}${x ? ', ' + x : ''}); } finally { Math.random = R; } })()`;

  it('marks its spot on the floor from the first frame of the wind-up: 200 px PAST you, on the side away from him -- and the add lands exactly there', () => {
    const r = W.eval(`(function(){ ${STAGE(300)}
      b.x = 550; b.homeX = 550; b._pickForce = 'melife'; b._atkLive = null; b._atkTimer = 1;
      var R = Math.random; Math.random = function(){ return 0; };               // the 8-Ball: the Beach Ball is a ricochet and leaves its mark the frame it is made (stepAssistBody)
      try {
        step();
        var out = { kind: b._telKind, ml: b._hz.ml && b._hz.ml.slice(), tel: b._tel };
        for (var w=0; w<60 && b._tel>0; w++){ step(); f.x = 300; f.invuln = 99; }
      } finally { Math.random = R; }
      var a = summons.filter(function(s){ return s.hostile; });
      out.adds = a.map(function(m){ return [m.name, Math.round(m.x), m._dl]; }); out.mlAfter = b._hz.ml; return out; })()`);
    expect(r.kind).toBe('melife');
    expect(r.ml, 'marked at once (a scan-line circle on the floor): he is on the right of you, so past you is on the left').toEqual([100]);
    expect(r.adds).toHaveLength(1);
    expect(r.adds[0][0]).toBe('8-Ball');
    expect(r.adds[0][1], 'it lands on the marked spot').toBe(100);
    expect(r.adds[0][2], 'and is inert while it downloads').toBeGreaterThan(30);
    expect(r.mlAfter, 'the mark is spent').toBe(null);
  });

  it('with no room past you it lands on the near side instead; phase 3 closes the pincer with a second jaw on the other side of you', () => {
    const r = W.eval(`(function(){ var out = {};
      [[1, 850], [1, 300], [3, 560]].forEach(function(c){ ${STAGE(560, 1)} b._phase = c[0]; b._hz = {}; b.x = 550; f.x = c[1]; b._telPh = c[0]; b._telX = c[1]; out[c[0] + '/' + c[1]] = mpMeLifeSpots(b, f, c[0]); });
      return out; })()`);
    expect(r['1/850'], 'he is on the left of you: past you would be off the edge').toEqual([650]);
    expect(r['1/300']).toEqual([100]);
    expect(r['3/560'], 'both sides of you').toEqual([760, 360]);
  });

  it('downloads one add in P1, on his team, from the MePhone pool, inert while it downloads', () => {
    const r = W.eval(`(function(){ ${STAGE(900)}
      b._phase = 1; BOSS_MOVES.melife(b, f);
      var adds = summons.filter(function(s){ return s.hostile; });
      var a = adds[0];
      return { n: adds.length, type: a.type, team: a.team, owner: a.owner, inPool: MEPHONE_POOL.indexOf(a.name) >= 0,
        dl: a._dl, DL: MELIFE_DL, life: a.life, LIFE: MELIFE_LIFE + MELIFE_DL, hp: a.hp, HP: MELIFE_HP }; })()`);
    expect(r.n).toBe(1);
    expect(r).toMatchObject({ type: 'assist', team: -1, owner: -1, inPool: true });
    expect(r.dl).toBe(r.DL);
    expect(r.life).toBe(r.LIFE);
    expect(r.hp).toBe(r.HP);
  });

  // He used to throw the generic ring at his cap, from inside the MeLife turn: its warning said MELIFE DOWNLOAD! and the ring was named only as it went off (the review). The rebuild decided at the
  // start of the wind-up and gave the turn to a move that was announced: the maze from phase 2 ("replaces the generic GLITCH! ring"), the boomerang in phase 1 (which had no maze). Since Round 17 (the owner:
  // "make the attacks based on fighter position.") the turn is drawn by the picker, and the cap is the move he skips: MeLife is simply not among the moves it draws from while his adds stand at their cap.
  // The cap is 2, 2 and 3 ("MELIFE DOWNLOAD! helpers 6 s, cap 2/2/3", the owner's pick, Round 17: it was 1, 1 and 2), and the maze is in every phase's draw ("A-MAZE-ING! from P1").
  it('at his cap MELIFE DOWNLOAD! is out of the draw -- no turn is MeLife, whatever is asked for -- and with room it is back in', () => {
    // `adds` already standing when a turn begins, in phase `ph`; MeLife is asked for by hand, to see it refused at the cap
    const turn = (ph, adds) => W.eval(`(function(){ ${STAGE(900, ph)}
      for (var i=0;i<${adds};i++) meLifeDownload(b, 1);
      b._pickForce = 'melife'; b._atkLive = null; b._atkTimer = 1; step();
      return { moves: bossPickMoves(b, ${ph}), kind: b._telKind, warn: document.getElementById('banner').textContent, adds: hostileCount() }; })()`);
    for (const [ph, adds] of [[1, 2], [2, 2], [3, 3]]) {
      const r = turn(ph, adds);
      expect(r.moves, `phase ${ph} at ${adds} add(s): MeLife is not among the moves`).not.toContain('melife');
      expect(r.moves, `phase ${ph}: and the rest are, the maze too`).toEqual(expect.arrayContaining(['mephone', 'portal', 'boomerang', 'maze']));
      expect(r.kind, `phase ${ph}: asked for MeLife at the cap, the turn is another move`).not.toBe('melife');
      expect(r.moves).toContain(r.kind);
      expect(r.warn).not.toBe('MELIFE DOWNLOAD!');
      expect(r.adds).toBe(adds);
    }
    expect(turn(1, 0)).toEqual(expect.objectContaining({ kind: 'melife', warn: 'MELIFE DOWNLOAD!', adds: 0 }));
    expect(turn(1, 1), 'one standing in phase 1, room for the second').toEqual(expect.objectContaining({ kind: 'melife', warn: 'MELIFE DOWNLOAD!', adds: 1 }));
    expect(turn(3, 2), 'two standing in phase 3, room for the third').toEqual(expect.objectContaining({ kind: 'melife', warn: 'MELIFE DOWNLOAD!', adds: 2 }));
  });

  it('MeLife itself, with no room left (an add arrived during its wind-up), fizzles and throws nothing unannounced; phase 3 downloads two a turn, and the cap of three holds', () => {
    const r = W.eval(`(function(){ ${STAGE(900, 1)}
      b._telPh = 1; meLifeDownload(b, 1); meLifeDownload(b, -1); b._hz.ml = [200];   // the cap (two in phase 1) is full when the wind-up ends
      var n0 = summons.length; projectiles = []; BOSS_MOVES.melife(b, f);
      var fizzle = { thrown: projectiles.length, adds: summons.length - n0, mark: b._hz.ml };
      ${STAGE(900, 3)}
      b._telPh = 3; b._hz.ml = null; BOSS_MOVES.melife(b, f); var first = hostileCount(); BOSS_MOVES.melife(b, f); var second = hostileCount(); BOSS_MOVES.melife(b, f);
      return { fizzle: fizzle, first: first, second: second, again: hostileCount(), caps: MELIFE_CAP.slice(1) }; })()`);
    expect(r.fizzle).toEqual({ thrown: 0, adds: 0, mark: null });
    expect(r.first, 'two at once in phase 3, one on each side of you').toBe(2);
    expect(r.second, 'the second turn fills the cap with the third').toBe(3);
    expect(r.again, 'and no fourth').toBe(3);
    expect(r.caps, 'the owner, Round 17: cap 2/2/3 (it was 1/1/2)').toEqual([2, 2, 3]);
  });

  // The owner's pick (Round 17): "MELIFE DOWNLOAD! helpers 6 s" -- an add fought 3.6 s (216 frames) before; it fights six seconds now (360), after its 40 frames of download, and goes.
  it('an add fights for six seconds after it has downloaded, then goes: 40 frames to download and 360 to fight (it was 216)', () => {
    const r = W.eval(`(function(){ ${STAGE(900)}
      var a = meLifeDownload(b, 1), left = -1;
      for (var i=1;i<=420;i++){ step(); f.invuln = 99999; f.pct = 0; if (left < 0 && summons.indexOf(a) < 0) left = i; }
      summons = []; return { fight: MELIFE_LIFE, dl: MELIFE_DL, left: left }; })()`);
    expect(r.fight, 'six seconds').toBe(360);
    expect(r.left, 'it is gone once the download and the six seconds are done').toBe(r.dl + r.fight);
  });

  it('adds are sturdier with more players, as his own HP is', () => {
    const hp = W.eval(`(function(){ ${STAGE(900)}
      var g = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 300, groundY()-24, 1); g.team=0; g.controller='still';
      fighters = [f, g]; var a = meLifeDownload(b, 1); summons = []; return a.hp; })()`);
    expect(hp).toBe(64);
  });

  it('his pool is four existing assist trophies and nothing leaks into the item pool', () => {
    const r = W.eval(`(function(){ ${STAGE(900)}
      summons = []; var hostile = 0, wrongTeam = 0;
      for (var i=0;i<200;i++){ summonAssist(f); }
      summons.forEach(function(s){ if (s.hostile) hostile++; if (s.team !== f.team) wrongTeam++; });
      summons = [];
      return { pool: MEPHONE_POOL.slice(), known: MEPHONE_POOL.every(function(n){ return ASSIST_ROSTER.some(function(a){ return a.name===n; }); }),
               roster: ASSIST_ROSTER.length, hostile: hostile, wrongTeam: wrongTeam }; })()`);
    expect(r.known).toBe(true);
    expect(r.roster, 'no new assist rows').toBe(13);
    for (const n of ['Eraser', 'Clock', 'Cloudy', 'Stapy', 'Selfie Stick', 'Blender', 'Grotato', 'Shopping Cart', 'Black Hole']) expect(r.pool, n).not.toContain(n);
    expect(r.hostile, 'a normal assist is never hostile').toBe(0);
    expect(r.wrongTeam, 'and still takes its summoner\'s team').toBe(0);
  });

  // At three quarters of a cameo hit, was half: the review found him easier than the Dragon before him (HOSTILE_ADD_DMG; test/boss-rush-order.test.js).
  it('a hostile 8-Ball waits out its download, then hits the player -- at three quarters of a cameo hit -- and never the boss', () => {
    const r = W.eval(`(function(){
      function run(hostile){ ${STAGE('WW*0.5+300')}
        f.x = b.x + 300; var bossHp = b.hp, a;
        if (hostile) a = ${download('8-Ball', 1)};
        else { var o = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 60, groundY()-24, 1);
               o.team = 1; o.controller = 'still'; fighters = [f, o];
               a = summonAssistNamed(o, ASSIST_ROSTER.find(function(x){ return x.name==='8-Ball'; })); }
        a.x = f.x - 60;
        var early = 0, first = 0, firstAt = -1, last = f.pct, bossHit = false;
        for (var i=1;i<=150;i++){
          step(); f.x = b.x + 300; f.vx = 0;
          if (f.pct > last + 1e-9){ if (firstAt < 0){ firstAt = i; first = f.pct - last; } last = f.pct; }
          if (i < MELIFE_DL && f.pct > 0) early = f.pct;
          if (b.hp !== bossHp) bossHit = true;
        }
        summons = []; return { name: a.name, early: early, first: first, firstAt: firstAt, total: f.pct, bossHit: bossHit };
      }
      return { hostile: run(true), normal: run(false) };
    })()`);
    expect(r.hostile.name).toBe('8-Ball');
    expect(r.hostile.early, 'inert for its download').toBe(0);
    expect(r.hostile.firstAt).toBeGreaterThanOrEqual(40);
    expect(r.hostile.total, 'it attacks the player').toBeGreaterThan(0);
    expect(r.hostile.bossHit, 'and never the boss').toBe(false);
    // A player's 8-Ball rolls for 15 now -- its 10 at the trophies' x1.5 ("assist trophies should be stronger" -- "Hit harder"). The add is not a trophy, it is his attack, so it keeps three
    // quarters of the cameo's own 10: 7.5, not 11.25.
    expect(r.normal.first, 'a player\'s 8-Ball hits at the trophy number').toBeCloseTo(10 * W.eval('ASSIST_TROPHY_DMG'), 5);
    expect(W.eval('HOSTILE_ADD_DMG')).toBe(0.75);
    expect(r.hostile.first, 'the add is untouched by the trophies\' buff').toBeCloseTo(0.75 * 10, 5);
    expect(r.hostile.first, 'still under half a boss hit').toBeLessThan(W.eval('bossDmg()') / 2);
  });

  it('a hostile Pie\'s lobs hit the player and pass the boss by', () => {
    const r = W.eval(`(function(){ ${STAGE('WW*0.5+300')}
      var a = ${download('Pie', 1)};
      var fx = a.x + 130; f.x = fx; var bossHp = b.hp, lobs = 0;
      for (var i=0;i<250 && f.pct===0;i++){ step(); f.x = fx; f.vx = 0;
        projectiles.forEach(function(p){ if (p.ownerObj && p.ownerObj.team===-1 && !p.bossAtk) lobs++; }); }
      var out = { name: a.name, hit: f.pct > 0, lobs: lobs > 0, bossHp: b.hp === bossHp };
      summons = []; projectiles = []; return out; })()`);
    expect(r).toEqual({ name: 'Pie', hit: true, lobs: true, bossHp: true });
  });

  // GLITCH (the owner's glitch pass, Round 17; the glitch hunter's `grace-hit`): a MeLife add hit a fighter through the grace a hit had just given them. The shared assist acts never looked at a
  // fighter's invulnerability (a Beach Ball did; a Pie's lob goes through the projectile loop, which does), so an 8-Ball's roll and a Spongy's slam landed on whoever stood in them, again and again. A hostile
  // add's hit waits until the grace is over, like any boss hit; a trophy of a player is as it was (the shared code asks `hostile`).
  it('a hostile add\'s hit respects a fighter\'s hit grace like any boss hit: an 8-Ball\'s roll and a Spongy\'s slam land on nobody in grace, and land once it is over', () => {
    const grace = (name, dx) => W.eval(`(function(){
      function run(hold){ ${STAGE('WW*0.5+300')}
        f.x = b.x + 300; var a = ${download(name, 1)}; a.x = f.x + ${dx};
        var first = 0, hits = 0, last = f.pct;
        if (hold) f.invuln = 99;
        for (var i=1;i<=220;i++){
          step(); f.x = b.x + 300; f.vx = 0; f.vy = 0; f.y = groundY() - 24; f.onground = true;
          if (hold) f.invuln = i < 160 ? 99 : 0;                               // in hit grace for 160 frames, then free
          if (f.pct > last + 1e-9){ hits++; if (!first) first = i; last = f.pct; }
        }
        summons = [b]; projectiles = []; return { first: first, hits: hits };
      }
      return { held: run(true), free: run(false) };
    })()`);
    for (const [name, dx] of [['8-Ball', -50], ['Spongy', 0]]) {
      const r = grace(name, dx);
      expect(r.free.first, `${name}: with nothing protecting them it lands, on the download's heels`).toBeGreaterThan(0);
      expect(r.held.first, `${name}: and in grace it does not land (the first hit comes only once the grace is over)`).toBeGreaterThanOrEqual(160);
    }
  });

  it('only a hostile add can be killed: by a hit, a shot, a dash, and Beach Ball still pops on a point', () => {
    const r = W.eval(`(function(){ ${STAGE('WW*0.5+300')}
      var out = {};
      var a = ${download('Spongy', 1)}; f.x = a.x;
      damageSummons(f, a.x, a.y, 40, 45); out.hitKills = a.life <= 0;
      // a normal assist shrugs off the same forty times over
      var o = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 60, groundY()-24, 1); o.team=1; o.controller='still';
      fighters = [f, o];
      var n = summonAssistNamed(o, ASSIST_ROSTER.find(function(x){ return x.name==='Spongy'; })); n.x = f.x;
      for (var i=0;i<40;i++) damageSummons(f, n.x, n.y, 40, 45);
      out.normalLives = n.life > 0; summons = summons.filter(function(s){ return s !== n; }); fighters = [f];
      // a shot
      var c = ${download('Spongy', 1)}; var hp0 = c.hp;   // still downloading: inert, so it holds still for the shot
      addProj({ owner:f.idx, ownerObj:f, x:c.x - 4, y:c.y, vx:1, vy:0, grav:false, dmg:9, kb:4, r:10, color:'#fff', life:30 });
      step(); out.shotHurts = c.hp < hp0 || c.life <= 0;
      summons = summons.filter(function(s){ return s.type==='boss'; }); projectiles = [];
      // a dash (Leafy's BFDIA Sprint)
      var L = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 0, groundY()-24, 0); L.team=0; L.controller='still'; L.face=1;
      fighters = [L]; var d = ${download('Spongy', 1)}; L.x = d.x - 90; L.y = d.y; step(); L.spCd = 0; var hp1 = d.hp;
      doSpecial(L); for (var j=0;j<14;j++){ step(); d.vx = 0; }
      out.dashHurts = d.hp < hp1 || d.life <= 0;
      summons = summons.filter(function(s){ return s.type==='boss'; });
      // Needle pops a hostile Beach Ball on the lightest touch
      var N = makeFighter(ROSTER.find(function(r){ return r.name==='Needle'; }), 0, groundY()-24, 0); N.team=0; fighters = [N];
      var e = ${download('Beach Ball', 1)}; N.x = e.x;
      damageSummons(N, e.x, e.y, 30, 1); out.popped = e.life <= 0 && e.hp > 0;
      summons = []; projectiles = []; return out; })()`);
    expect(r).toEqual({ hitKills: true, normalLives: true, shotHurts: true, dashHurts: true, popped: true });
  });

  it('his adds leave when he falls, and a normal assist stays', () => {
    const r = W.eval(`(function(){
      var st = setTimeout; setTimeout = function(){ return 0; };
      try {
        SETTINGS.mode='boss'; SETTINGS.stocks=99; running=true;
        BOSSRUSH = { active:true, bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.name==='MePhone4'; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
        var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 200, groundY()-24, 0);
        f.team=0; f.controller='still'; f.stocks=3; fighters=[f]; summons=[]; projectiles=[];
        spawnBossRushBoss(); var b = summons.find(function(s){ return s.type==='boss'; });
        ${download('8-Ball', 1)}; ${download('Pie', -1)};
        var normal = summonAssistNamed(f, ASSIST_ROSTER.find(function(x){ return x.name==='Spongy'; }));
        var before = summons.filter(function(s){ return s.hostile; }).length;
        b.hp = 0; bossRushCheck();
        var out = { name: b.name, before: before, hostile: summons.filter(function(s){ return s.hostile; }).length,
                    normalKept: summons.indexOf(normal) >= 0, boss: summons.some(function(s){ return s.type==='boss'; }), next: BOSSRUSH.bossIdx };
        // and on any other path: an add left with no boss standing leaves on the next tick
        summons = []; var lone = summonAssistNamed({ x:300, face:1, team:-1, idx:-1 }, ASSIST_ROSTER[2]); lone.hostile = true; lone.hp = lone.maxHp = 40;
        BOSSRUSH.active = false; updateSummons(); out.orphanGone = summons.indexOf(lone) < 0;
        return out;
      } finally { setTimeout = st; BOSSRUSH.active=false; running=false; summons=[]; }
    })()`);
    expect(r).toEqual({ name: 'MePhone4', before: 2, hostile: 0, normalKept: true, boss: false, next: 6, orphanGone: true });   // next: Evil Leafy, now index 6 (the Dragon moved to Boss 9, 2026-09-30)
  });
});

describe('A-MAZE-ING!', () => {
  // The Maze page: "MePhone4 promptly creates the maze in a large green flash from an unknown activated application"; "hidden within the maze walls are various traps and weapons, such as freeze rays,
  // flamethrowers, zap guns and cannons". Mazed and Confused/Transcript: "Several rayguns emerge from the walls and zap [three contestants]; freezing, burning, and electrocuting them respectively. A
  // cannon emerges from the wall and fires a cannonball at the zapped contestants, sending them crashing into the wall." Round 8: A-MAZE-ING! (phase 2 on; replaces the generic GLITCH! ring) -- and
  // since Round 17 from phase 1 ("A-MAZE-ING! from P1, two cannonballs from P2": the owner's pick), most of these look at it in phase 2, where it has all it had before phase 3.
  // The maze built round a still Firey at `fx` in phase `ph`, by the move itself, with him at `bx` (the pen's "far" side is away from him: 946 puts it on the left of you, 154 on the right). Every look
  // is the maze's own tick at a frame of my choosing, `t` frames after the walls rose.
  const MAZE = (fx, ph = 2, bx = 946) => `${STAGE(fx, ph)}
    b.x = ${bx}; b.homeX = ${bx}; b._telPh = ${ph}; b._hz.mz = null; BOSS_MOVES.maze(b, f); var z = b._hz.mz, F = z[2], T = mpMazeTimes(${ph}), G = mpMazeGeo(z[0], z[1]);
    function at(t){ hazardT = F + t; }
    function place(x, y){ f.x = x; f.y = y; f.vx = 0; f.vy = 0; f.invuln = 0; f.pct = 0; f.hitstun = 0; f.burn = 0; f._volleyDmg = {}; f._bossHitId = null; }
    function tickAt(t){ at(t); mpMazeTick(b, f); }`;

  it('the pen is two hedge walls, 96 x 72, solid, 155 px either side of you -- and nobody is left inside one', () => {
    const r = W.eval(`(function(){ ${STAGE(500)}
      b.x = 946; b.homeX = 946; b._telPh = 2; b._hz.mz = null; f.x = 560; f.y = groundY() - 24;   // the pen's centre
      var g = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 0, groundY()-24, 1); g.team=0; g.controller='still'; g.x = 650; g.y = groundY() - 24; fighters = [f, g];   // g stands where a wall will grow
      BOSS_MOVES.maze(b, f); var z = b._hz.mz, M = MP4.maze, G = mpMazeGeo(z[0], z[1]);
      var plats0 = worldPlats.filter(function(p){ return p._mz; }).map(function(p){ return [p.x, p.w, p.h, p.solid]; });
      hazardT = z[2] + 30; mpMazeTick(b, f);
      var walls = worldPlats.filter(function(p){ return p._mz; }).map(function(p){ return { x:p.x, w:p.w, h:p.h, y:p.y, solid:p.solid }; });
      return { z: z.slice(), walls: walls, plats0: plats0, gy: groundY(), fx: f.x, gx: g.x, nearC: G.nearC, farC: G.farC, id: !!b._mz }; })()`);
    expect(r.id).toBe(true);
    expect(r.walls).toHaveLength(2);
    for (const w of r.walls) expect({ w: w.w, h: w.h, solid: w.solid, y: w.y }).toEqual({ w: 96, h: 72, solid: true, y: r.gy - 72 });
    expect(r.walls.map((w) => w.x + 48).sort((a, b) => a - b), 'one each side of the pen\'s centre').toEqual([r.z[0] - 155, r.z[0] + 155].sort((a, b) => a - b));
    expect(r.plats0.every((p) => p[2] === 1), 'they begin as a sliver on the floor and grow').toBe(true);
    for (const x of [r.fx, r.gx]) for (const c of [r.nearC, r.farC]) expect(Math.abs(x - c), 'put beside a wall, never inside one').toBeGreaterThanOrEqual(48 + 24);
  });

  it('the wind-up marks the two walls\' footprints, following you until its last 10 frames, then holds (white) -- and the pen is built exactly where the mark held', () => {
    const r = W.eval(`(function(){ ${STAGE(400, 2)}
      b._pickForce = 'maze'; b._atkLive = null; b._atkTimer = 1; step();
      var out = { kind: b._telKind, tel: b._tel }, follow = [], held = [], lock = MP4.maze.lock, walls = null;
      for (var i=0;i<60;i++){
        f.x = 400 + i*6; f.invuln = 99; step();
        var z = b._hz.mz; if (!z) break;
        if (hazardT < z[2] - lock) follow.push([Math.round(f.x), z[0]]); else held.push(z[0]);
        if (!walls && worldPlats.some(function(p){ return p._mz; })) walls = worldPlats.filter(function(p){ return p._mz; }).map(function(p){ return p.x + p.w/2; }).sort(function(a, c){ return a - c; });
      }
      out.follow = follow; out.held = held; out.walls = walls; out.bx = b.x; out.lock = lock; return out; })()`);
    expect(r.kind).toBe('maze');
    expect(r.tel, 'the long wind-up').toBe(44);
    expect(r.follow.length).toBeGreaterThan(25);
    for (const [fx, c] of r.follow) expect(Math.abs(c - fx), 'the marks keep up with you').toBeLessThanOrEqual(1);
    expect(r.held.length).toBeGreaterThanOrEqual(r.lock);
    expect(new Set(r.held).size, 'then they hold, to the last frame -- the walls rise where the white marks stood').toBe(1);
    expect(r.walls).toEqual([r.held[0] - 155, r.held[0] + 155]);
    expect(r.bx, 'he stepped out of the pen\'s way (to the far side from you)').toBeGreaterThan(900);
  });

  it('the beams come in the show\'s order, each at its own height: freeze along the floor, burn at body height, zap above a standing head -- a different answer each beat, whichever side he is', () => {
    for (const bx of [946, 154]) {
      const r = W.eval(`(function(){ ${MAZE(560, 2, bx)}
        var gy = groundY(), fl = gy - 24, top = gy - 72 - 24, hi = gy - 24 - 70;   // standing on the floor, on a hedge top, jumping high
        var hit = function(t, x, y){ place(x, y); tickAt(t); return f.pct > 0; };
        var mid = function(k){ return Math.round((T.rays[k][1] + T.rays[k][2])/2); };
        var out = { windows: T.rays.map(function(r){ return r.slice(); }) };
        out.freeze = { floor: hit(mid(0), G.c, fl), hedge: hit(mid(0), G.nearC, top), high: hit(mid(0), G.c, hi) };
        out.burn = { floor: hit(mid(1), G.c, fl), hedge: hit(mid(1), G.nearC, top), high: hit(mid(1), G.c, hi) };
        out.zap = { floor: hit(mid(2), G.c, fl), hedge: hit(mid(2), G.nearC, top), high: hit(mid(2), G.c, hi), farHedge: hit(mid(2), G.farC, top) };
        out.outside = [hit(mid(0), G.nearOut - 200*G.dir, fl), hit(mid(1), G.nearOut - 200*G.dir, fl), hit(mid(2), G.nearOut - 200*G.dir, fl)];
        out.warning = hit(T.rays[0][0] + 5, G.c, fl);                       // while a beam is only a warning line it does nothing
        out.between = hit(T.rays[0][2] + 5, G.c, fl);                       // no beam in the gap between beats
        return out; })()`);
      expect(r.windows, 'a warning of 20 frames, the beam 8; 36 frames between beats').toEqual([[24, 44, 52], [60, 80, 88], [96, 116, 124]]);
      expect(r.freeze, `FREEZE: along the floor -- jump it, or be on a hedge (he is at ${bx})`).toEqual({ floor: true, hedge: false, high: false });
      expect(r.burn, 'BURN: at the height of your body -- be up on a hedge, or jump high').toEqual({ floor: true, hedge: false, high: false });
      expect(r.zap, 'ZAP: above a standing head, across the tops of both walls -- the one beam a hedge top is not safe from').toEqual({ floor: false, hedge: true, high: true, farHedge: true });
      expect(r.outside, 'no beam leaves the pen').toEqual([false, false, false]);
      expect(r.warning).toBe(false);
      expect(r.between).toBe(false);
    }
  });

  it('the orange beam sets you alight, the fire bosses\' standard burn (110 frames) and no more; the others only hurt, and each is 0.8 of a boss hit', () => {
    const r = W.eval(`(function(){ ${MAZE(560)}
      var out = [];
      [0, 1, 2].forEach(function(k){ place(G.c, k === 2 ? groundY() - 24 - 70 : groundY() - 24); tickAt(Math.round((T.rays[k][1] + T.rays[k][2])/2)); out.push([+f.pct.toFixed(3), f.burn]); });
      return { out: out, hit: bossDmg()*0.8 }; })()`);
    expect(r.out[0]).toEqual([+r.hit.toFixed(3), 0]);
    expect(r.out[1]).toEqual([+r.hit.toFixed(3), 110]);
    expect(r.out[2]).toEqual([+r.hit.toFixed(3), 0]);
  });

  // GLITCH (the owner's glitch pass, Round 17; the glitch hunter's Boss Rush `burn`): the orange beam's fire outlasted him and burned on into the next boss, half a second into Evil Leafy's fight. A boss's
  // burn ends when that boss falls: what he lit goes out in his ending's sweep, and a poison on the same timer keeps running, as it does for a Taco whose fire never ticks.
  it('the orange beam\'s fire goes out when he falls -- the gauntlet\'s own check takes him -- and a burn he did not light, or a poison on the same timer, is left alone', () => {
    const r = W.eval(`(function(){ ${MAZE(560)}
      var st = setTimeout; setTimeout = function(){ return 0; };
      try {
        place(G.c, groundY() - 24); tickAt(Math.round((T.rays[1][1] + T.rays[1][2])/2));   // the orange beam sets you alight
        var lit = { burn: f.burn, tag: f._mpBurn > hazardT };
        var g = makeFighter(ROSTER.find(function(r){ return r.name==='Leafy'; }), 100, groundY()-24, 1); g.team = 0; g.controller = 'still'; g.stocks = 9;
        g.burn = 80; g._poisonT = 80; fighters = [f, g];                                   // a poison of someone else's: not his fire
        f._poisonT = 40;                                                                  // and the lit one is poisoned too: only the fire goes
        BOSSRUSH.active = true; b.hp = 0; bossRushCheck();
        return { lit: lit, burn: f.burn, poison: f._poisonT, other: [g.burn, g._poisonT], tag: f._mpBurn };
      } finally { setTimeout = st; BOSSRUSH.active = false; running = false; summons = []; }
    })()`);
    expect(r.lit).toEqual({ burn: 110, tag: true });
    expect(r.burn, 'the fire goes with him: what is left is the poison\'s 40').toBe(40);
    expect(r.poison).toBe(40);
    expect(r.other, 'a burn he did not light is not his to put out').toEqual([80, 80]);
    expect(r.tag, 'and the mark of it is cleared').toBe(0);
  });

  it('a fire he lit that has already burnt out is no mark on a later one: the sweep only puts out a fire still burning from his beam', () => {
    const r = W.eval(`(function(){ ${MAZE(560)}
      var st = setTimeout; setTimeout = function(){ return 0; };
      try {
        place(G.c, groundY() - 24); tickAt(Math.round((T.rays[1][1] + T.rays[1][2])/2));
        hazardT += 200; f.burn = 0;                                                       // it ran its 110 frames out
        f.burn = 70;                                                                      // and something else has set them alight since
        BOSSRUSH.active = true; b.hp = 0; bossRushCheck();
        return { burn: f.burn };
      } finally { setTimeout = st; BOSSRUSH.active = false; running = false; summons = []; }
    })()`);
    expect(r.burn, 'not his fire: it burns on').toBe(70);
  });

  it('a cannon pushes out of the far wall\'s face and rolls a ball along the pen\'s floor that crashes into the near wall: jump it, or be up on a hedge -- whichever side he is', () => {
    for (const bx of [946, 154]) {
      // The maze's whole state is a function of the clock, so jump it to just before the cannon's turn and let the engine run: where a fighter stands (on the floor, on a hedge top,
      // jumping high), whether the ball finds him, and what the ball does at the wall.
      const run = (spot) => W.eval(`(function(){ ${MAZE(560, 2, bx)}
        var gy = groundY(), c = ${spot === 'floor' ? '[G.c, gy - 24]' : spot === 'hedge' ? '[G.nearC, gy - 72 - 24]' : '[G.c, gy - 24 - 70]'}, first = null, crash = -1, hit = false, scars0 = IMPACT_SCARS.length;
        at(T.balls[0] - 3);
        for (var i=0;i<30;i++){
          place(c[0], c[1]); if (!first) f.invuln = 99;                       // untouchable until the ball is out
          step(); f.burn = 0;
          if (f.pct > 0) hit = true;
          var bl = projectiles.filter(function(p){ return p.mpBall; })[0];
          if (bl && !first) first = { i: i, x: bl.x, y: bl.y, vx: bl.vx, r: bl.r, dmg: bl.dmg, t: hazardT - F };
          if (first && !bl && crash < 0) crash = i;
        }
        return { first: first, crash: crash, hit: hit, scars: IMPACT_SCARS.length - scars0, farIn: G.farIn, nearIn: G.nearIn, dir: G.dir, T0: T.balls[0], gy: gy }; })()`);
      const fl = run('floor'), hedge = run('hedge'), high = run('high'), s = fl.first;
      expect(s.t, 'the cannon fires when its warning is done').toBe(fl.T0);
      expect(s.x - s.vx, `out of the far wall's face (he is at ${bx}): 22 px inside the pen from it`).toBeCloseTo(fl.farIn - fl.dir*22, 6);
      expect(s.y, 'on the floor').toBeCloseTo(fl.gy - 20, 6);
      expect(Math.abs(s.vx), '11 px a frame').toBe(11);
      expect(Math.sign(s.vx), 'toward the near wall').toBe(-fl.dir);
      expect(s.r).toBe(20);
      expect(s.dmg).toBeCloseTo(W.eval('bossDmg()')*0.8, 6);
      expect(fl.crash - s.i, 'it rolls the pen\'s floor and crashes into the near wall (about 16 frames), and is gone').toBeGreaterThan(12);
      expect(fl.crash - s.i).toBeLessThan(20);
      expect(hedge.crash, 'the same ball, the same crash').toBe(fl.crash);
      expect(fl.scars, 'heavily: one scar on the floor at the wall').toBe(1);
      expect([fl.hit, hedge.hit, high.hit], 'floor: hit; a hedge top and a high jump pass it').toEqual([true, false, false]);
    }
  });

  it('one attack id for all of it: a fighter who stands through the whole maze takes at most one boss hit (the orange beam\'s burn aside)', () => {
    const r = W.eval(`(function(){ ${STAGE(560, 2)}
      b._pickForce = 'maze'; b._atkLive = null; b._atkTimer = 1; step(); b.x = 946;
      var gy = groundY(), hits = 0, last = 0, burned = 0, c = null;
      for (var i=0;i<330 && !(i > 60 && !b._hz.mz);i++){
        step(); if (f.burn > 0) burned += 0.04; f.burn = 0;                 // the burn is its own, standard damage: counted out
        if (b._hz.mz && c === null && worldPlats.some(function(p){ return p._mz; })) c = b._hz.mz[0];
        if (f.pct > last + 1e-9){ hits++; last = f.pct; }
        if (c !== null){ f.x = c; f.y = gy - 24; f.vx = 0; f.vy = 0; f.hitstun = 0; }   // stands his ground in the middle of the pen
      }
      return { hits: hits, total: f.pct - burned, full: bossDmg(), uncapped: bossDmg()*0.8*4 }; })()`);
    expect(r.hits, 'more than one beat reached it').toBeGreaterThanOrEqual(2);
    expect(r.total, 'and together they are one boss hit').toBeLessThanOrEqual(r.full + 1e-6);
    expect(r.total).toBeGreaterThan(r.full - 1e-6);
    expect(r.uncapped, 'which is more than the four it was thrown as would have been without the one id').toBeGreaterThan(r.full * 2);
  });

  it('a hedge top is standable, the walls wilt to roots and go, and the turn\'s gap is held until they have (then it is the paced gap)', () => {
    const r = W.eval(`(function(){ ${STAGE(209, 2)}
      b._pickForce = 'maze'; b._atkLive = null; b._atkTimer = 1; step();
      var out = { held: 0, standing: null }, wall = null, ended = -1, gap = -1, gy = groundY();
      for (var i=0;i<330;i++){
        step(); f.invuln = 99; f.hitstun = 0;
        if (!wall && worldPlats.some(function(p){ return p._mz; })) wall = worldPlats.filter(function(p){ return p._mz; }).sort(function(a, c){ return a.x - c.x; })[0];   // the left wall: clear of the stage's own platform
        if (wall && i === 70){ f.x = wall.x + wall.w/2; f.y = wall.y - 24 - 50; f.vy = 0; f.vx = 0; }
        if (wall && i === 90){ out.standing = { y: f.y, top: wall.y, onground: f.onground, h: wall.h }; }
        if (b._atkTimer > 1e5) out.held++;
        if (ended < 0 && wall && !b._hz.mz){ ended = i; gap = b._atkTimer; out.platsAfter = worldPlats.filter(function(p){ return p._mz; }).length; break; }
      }
      out.ended = ended; out.gap = gap; out.paced = bossAtkGap(b); out.gy = gy; return out; })()`);
    expect(r.standing.onground, 'you stand on a hedge top').toBe(true);
    expect(r.standing.h, 'the full 72 px').toBe(72);
    expect(r.standing.y).toBeCloseTo(r.standing.top - 24, 6);
    expect(r.held, 'the next wind-up never starts under the maze').toBeGreaterThan(150);
    expect(r.ended).toBeGreaterThan(0);
    expect(r.platsAfter, 'the roots are gone').toBe(0);
    expect(r.gap, 'and the gap runs from the end of it: the paced one').toBeGreaterThanOrEqual(r.paced - 3);
    expect(r.gap).toBeLessThanOrEqual(r.paced);
  });

  // The owner, 2026-10-01 (Round 17, the difficulty picks): "MePhone4: ... A-MAZE-ING! from P1, two cannonballs from P2" -- the maze is in phase 1, with the one ball it had, and the second ball (24 frames behind
  // the first) is phase 2's now (it was phase 3's); phase 3 still brings the beats closer (24 frames, was 36).
  it('one cannonball in phase 1; from phase 2 a second rolls 24 frames behind the first; phase 3 brings the beats closer (24 frames, was 36)', () => {
    const r = W.eval(`({ p1: mpMazeTimes(1), p2: mpMazeTimes(2), p3: mpMazeTimes(3) })`);
    expect(r.p1.rays.map((x) => x[0]), 'a maze in phase 1 has phase 2\'s beats').toEqual([24, 60, 96]);
    expect(r.p2.rays.map((x) => x[0])).toEqual([24, 60, 96]);
    expect(r.p3.rays.map((x) => x[0])).toEqual([24, 48, 72]);
    expect(r.p1.balls, 'phase 1: the one ball').toHaveLength(1);
    expect(r.p2.balls, 'phase 2: two balls ("two cannonballs from P2")').toHaveLength(2);
    expect(r.p3.balls).toHaveLength(2);
    expect(r.p2.balls[1] - r.p2.balls[0]).toBe(24);
    expect(r.p3.balls[1] - r.p3.balls[0]).toBe(24);
    expect(r.p1.balls[0], 'the first ball goes the same frame in phases 1 and 2').toBe(r.p2.balls[0]);
    expect(r.p2.total - r.p1.total, 'and the second ball makes phase 2\'s maze its lag longer').toBe(24);
    expect(r.p3.total, 'it is a long attack, and shorter in phase 3 than the beats alone would make it').toBeLessThan(r.p2.total);
  });

  it('draws without throwing: the footprints, the pulse, the walls rising, the guns, every warning and beam, the cannon, the wilt', () => {
    const err = WC.eval(`(function(){ ${MAZE(560)}
      try {
        // the wind-up: a plan with its frame still ahead
        var plan = [560, -1, hazardT + 30, 2]; var s0 = Object.assign({}, b, { _hz: { mz: plan }, _tel: 20, _telKind: 'maze' });
        ctx.save(); mpDrawMaze(s0, 'under'); mpDrawMaze(s0, 'over'); ctx.restore();
        plan[2] = hazardT + 5; ctx.save(); mpDrawMaze(s0, 'under'); ctx.restore();
        for (var t = 0; t <= T.total + 4; t += 3){ at(t); ctx.save(); mpDrawMaze(b, 'under'); mpDrawMaze(b, 'over'); mpDrawFx(b); ctx.restore(); }
        [1, 3].forEach(function(ph){ var T2 = mpMazeTimes(ph); b._hz.mz = [560, 1, F, ph]; for (var t = 0; t <= T2.total; t += 7){ at(t); ctx.save(); mpDrawMaze(b, 'under'); mpDrawMaze(b, 'over'); ctx.restore(); } });
        drawBossSprite(Object.assign({}, b, { _tel: 20, _telKind: 'maze' }));
        return null;
      } catch(e){ return e.message + ' ' + String(e.stack).slice(0, 200); }
    })()`);
    expect(err).toBe(null);
  });
});

describe('his arena: the Great Escape\'s Elimination Area', () => {
  // The Elimination Area page: "MePhone changes the elimination area once again, now back on the ground, with one main platform where he stands, and several other platforms sticking out of the
  // main one ... As always, a TV is attached to show the number of votes, and the Fist Thingy is used." (File:S1RE14 Elimination area.png; File:S1RE8EliminationArea.png.)
  it('has its own sky, lawn and backdrop, and a netcode client takes its key', () => {
    const r = W.eval(`({ sky: BOSS_ARENA_SKY.elimarea, ground: BOSS_ARENA_GROUND.elimarea && [BOSS_ARENA_GROUND.elimarea.fill, BOSS_ARENA_GROUND.elimarea.line, typeof BOSS_ARENA_GROUND.elimarea.pattern],
      melife: [BOSS_ARENA_SKY.melife, BOSS_ARENA_GROUND.melife, String(drawArenaDecor).indexOf('"melife"')], row: BOSS_ROSTER[5].arena })`);
    expect(r.sky).toHaveLength(2);
    expect(r.ground).toEqual(['#3f8f48', '#1f4a28', 'function']);
    expect(r.melife, 'the old screen is gone from him').toEqual([undefined, undefined, -1]);
    expect(r.row).toBe('elimarea');
  });

  it('has NO hazard -- nothing in the Great Escape\'s area hurts but the Fist Thingy -- and the entry it has dresses the platforms under the shots and stands the maze\'s hedges', () => {
    const r = W.eval(`(function(){ var H = arenaHazardOf('elimarea');
      return { entry: [typeof H.step, typeof H.draw], stepBody: String(H.step).replace(/\\s+/g, ''), src: String(mpArenaDress).indexOf('applyHit') + String(mpArenaDress).indexOf('arenaHazardHit') }; })()`);
    expect(r.entry).toEqual(['function', 'function']);
    expect(r.stepBody, 'its step does nothing').toMatch(/^(step)?\(\)\{\}$/);
    expect(r.src, 'and nothing it draws hurts anyone').toBe(-2);
    // 600 frames of the whole fight with a still fighter and the arena's step running: the only hits are his
  });

  it('its satellites are folded until phase 2, when they swing out (24 frames) and become real ledges; one burst that skips phase 2 still gets them; and the platform chips', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      var out = { p1: worldPlats.filter(function(p){ return p._sat; }).length, out1: mpSatOut(b) };
      IMPACT_SCARS = []; b.hp = b.maxHp*0.5; updateBossAttack(b, f); out.p2 = b._phase; out.stamp = b._hz.p2; out.scars2 = IMPACT_SCARS.length;
      var mid = []; for (var i=0;i<26;i++){ mid.push([+mpSatOut(b).toFixed(2), worldPlats.filter(function(p){ return p._sat; }).length]); step(); f.invuln = 99; }
      out.mid = [mid[0], mid[12], mid[24]]; out.sats = worldPlats.filter(function(p){ return p._sat; }).map(function(p){ return [p.x, p.y, p.w, p.h]; }); out.rects = mpSatRects().map(function(r){ return [r.x, r.y, r.w, r.h]; });
      ${STAGE(300, 1)} b.hp = b.maxHp*0.1; updateBossAttack(b, f); out.skip = { phase: b._phase, p2: b._hz.p2 >= 0, p3: b._hz.p3 >= 0, sh: b._hz.sh >= 0 };
      return out; })()`);
    expect(r.p1).toBe(0);
    expect(r.out1).toBe(0);
    expect(r.p2).toBe(2);
    expect(r.stamp).toBeGreaterThanOrEqual(0);
    expect(r.scars2, 'the platform\'s edge chips as the satellites lock').toBeGreaterThanOrEqual(1);
    expect(r.mid[0][0]).toBeLessThan(0.1);
    expect(r.mid[0][1], 'not a ledge while it is still swinging').toBe(0);
    expect(r.mid[2][1], 'two ledges once they are out').toBe(2);
    expect(r.sats).toEqual(r.rects);
    expect(r.skip).toEqual({ phase: 3, p2: true, p3: true, sh: true });
  });

  it('phase 3 is "Glitching": the glitched body, a shield that glitches for 20 frames, static on the TV', () => {
    const r = W.eval(`(function(){ ${STAGE(300, 1)}
      var out = { look1: bossLook(b) }; b.hp = b.maxHp*0.2; updateBossAttack(b, f); out.look3 = bossLook(b); out.p3 = b._hz.p3; out.sh = b._hz.sh;
      out.src = BOSS_SPRITE_SRC.mephoneglitch; out.flip = !!BOSS_SPRITE_FLIP.mephoneglitch; out.fallback = String(drawBossSprite).indexOf('case "mephoneglitch"');
      return out; })()`);
    expect(r.look1).toBe('mephone');
    expect(r.look3).toBe('mephoneglitch');
    expect(r.src).toBe('assets/sprites/mephone4-glitched.png');
    expect(existsSync('artifacts/V1/' + r.src)).toBe(true);
    expect(r.flip).toBe(false);
    expect(r.fallback).toBeGreaterThan(0);
    expect(r.sh).toBe(r.p3);
  });

  it('draws the whole backdrop in every phase and every mood of the TV (vote bars, the MeLife grid, a swirl, green, a boomerang, static, a punch\'s flicker) without throwing', () => {
    const err = WC.eval(`(function(){ ${STAGE(300, 1)}
      try {
        BOSS_ARENA = 'elimarea';
        [1, 2, 3].forEach(function(ph){
          b._phase = ph; b._hz = ph >= 2 ? { p2: 0, p3: ph >= 3 ? 0 : undefined } : {};
          [null, 'melife', 'portal', 'maze', 'boomerang', 'mephone'].forEach(function(k){
            b._tel = k ? 20 : 0; b._telKind = k; b._hz.pu = hazardT - 3;
            summons = [b]; summons.push({ type:'assist', hostile:true, name:'Pie', x:400, y:500, hp:30, maxHp:40, _dl:20, color:'#e8c060', r:26 });
            hazardT += 7; draw();
          });
        });
        return null;
      } catch(e){ return e.message + ' ' + String(e.stack).slice(0, 240); } finally { BOSS_ARENA = null; summons = []; }
    })()`);
    expect(err).toBe(null);
  });

  it('draws the lawn\'s pattern, a platform disc and the tower, with and without its glow', () => {
    const err = WC.eval(`(function(){ try { ctx.save(); mpGroundPattern(ctx, groundY(), -20, WW + 20, WH + H); mpDrawDisc(ctx, 342, 446, 416, 18); mpDrawTower(ctx, 1000, groundY(), false); mpDrawTower(ctx, 1000, groundY(), true); mpDrawProps(ctx, groundY()); hazardT = 500; mpDrawProps(ctx, groundY()); hazardT = 515; mpDrawProps(ctx, groundY()); ctx.restore(); return null; } catch(e){ return e.message; } })()`);
    expect(err).toBe(null);
  });
});

describe('his ending', () => {
  // The MePhone4 page, Deaths: "Short-Circuited"; the Fist Thingy page: "it's seen waving goodbye with a tissue in hand" (Out of Body Experience). Round 11: Endings, "All of them": a short canon
  // exit scene when beaten, no text.
  it('is a scene of its own, held 300 ms (over before the next boss, 1.5 s later), with no line of text', () => {
    const r = W.eval(`({ end: [typeof BOSS_ENDINGS.mephone.sweep, typeof BOSS_ENDINGS.mephone.begin, BOSS_ENDINGS.mephone.holdMs, BOSS_ENDINGS.mephone.line], total: MP4.end.total, hold: MP4.end.hold })`);
    expect(r.end).toEqual(['function', 'function', 300, undefined]);
    expect(r.total*1000/60, 'the scene is over before the next boss arrives').toBeLessThanOrEqual(1500 + r.hold);
  });

  it('sweeps his shots, walls and flung fighters, plays where he fell, and holds the BOSS DOWN card back by its length -- the whole of it a pure function of the clock', () => {
    const r = W.eval(`(function(){
      var st = setTimeout, timers = []; setTimeout = function(fn, ms){ timers.push({ fn: fn, ms: ms }); return 0; };
      try {
        SETTINGS.mode='boss'; SETTINGS.stocks=99; running=true;
        BOSSRUSH = { active:true, bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.name==='MePhone4'; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
        worldPlats = platRectsSmall(); summons=[]; projectiles=[]; particles=[]; hazardT=0;
        var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 200, groundY()-24, 0);
        f.team=0; f.controller='still'; f.stocks=3; fighters=[f];
        spawnBossRushBoss(); var b = summons.find(function(s){ return s.type==='boss'; });
        b.hp = b.maxHp*0.5; for (var i=0;i<30;i++){ step(); f.invuln = 99; }
        b._telPh = 2; b._hz.mz = null; BOSS_MOVES.maze(b, f); BOSS_MOVES.boomerang(b, f); b._telPh = 1; b._telX = 200; b._telY = f.y; b._hz.fd = 1; fireBossAttack(b, f);
        f._mpFl = { y0: 1, y1: 2, T: 5, t: 0, A: 1, vx: 1 };
        var before = { shots: projectiles.length, mp: worldPlats.filter(function(p){ return p._mp; }).length };
        var x = b.x, y = b.y; b.hp = 0; bossRushCheck();
        var out = { before: before, summons: summons.length, shots: projectiles.map(function(p){ return !!p.mpEnd; }), mp: worldPlats.filter(function(p){ return p._mp; }).length, fl: !!f._mpFl,
                    ms: timers.map(function(t){ return t.ms; }), at: projectiles[0] && [Math.round(projectiles[0].ex), Math.round(projectiles[0].ey)], bx: Math.round(x), by: Math.round(y) };
        var frames = [];
        for (var k=0;k<MP4.end.total + 4;k++){ step(); f.invuln = 99; var g = projectiles.filter(function(p){ return p.mpEnd; })[0]; frames.push(!!g); }
        out.alive = [frames[0], frames[50], frames[MP4.end.total - 2]]; out.gone = !frames[frames.length - 1]; out.left = projectiles.length;
        return out;
      } finally { setTimeout = st; BOSSRUSH.active = false; running = false; }
    })()`);
    expect(r.before.shots).toBeGreaterThan(1);
    expect(r.before.mp).toBeGreaterThanOrEqual(2);
    expect(r.summons, 'he and his adds are gone').toBe(0);
    expect(r.shots, 'his shots go; only the scene is left').toEqual([true]);
    expect(r.mp, 'his walls too').toBe(0);
    expect(r.fl, 'and nobody is left mid-fling').toBe(false);
    expect(r.ms, 'the BOSS DOWN card waits for the scene (300 ms) and the next boss after it').toContain(1800);
    expect(r.at, 'where he fell').toEqual([r.bx, r.by]);
    expect(r.alive).toEqual([true, true, true]);
    expect(r.gone).toBe(true);
    expect(r.left).toBe(0);
  });

  it('the white platform disc stays under his ending and the gap after it (the arena hook is drawn with no boss), the swung-out discs go with him', () => {
    const r = WC.eval(`(function(){ ${STAGE(300, 2)}
      for (var i=0;i<30;i++){ step(); f.invuln = 99; }                           // phase 2: the two discs on stalks are out
      var n = 0, D = mpDrawDisc; mpDrawDisc = function(){ n++; return D.apply(null, arguments); };
      try {
        mpArenaDress(b, 'under'); var alive = n; n = 0;
        mpArenaDress(null, 'under'); var fallen = n; n = 0;
        mpArenaDress(null, 'over'); var over = n;
        return { alive: alive, fallen: fallen, over: over, out: mpSatOut(b) };
      } finally { mpDrawDisc = D; } })()`);
    expect(r.out, 'the satellites are out in phase 2').toBe(1);
    expect(r.alive, 'the platform and both satellites while he stands').toBe(3);
    expect(r.fallen, 'the platform alone once he has fallen: its ledges left with him (mpEndSweep)').toBe(1);
    expect(r.over, 'and only under the shots').toBe(0);
  });

  it('draws every frame of it without throwing, hurts nobody, and shows no word', () => {
    const r = WC.eval(`(function(){ ${STAGE(300, 3)}
      try {
        var b0 = b; mpEndBegin(b); var g = projectiles.filter(function(p){ return p.mpEnd; })[0], errs = [], dmg = 0;
        for (var u = 0; u <= MP4.end.total + 2; u += 2){ g.delay = MP4.end.total + 1 - u; hazardT = g.et0 + u; ctx.save(); try { drawProjectile(g); } catch(e){ errs.push(e.message); } ctx.restore(); }
        [g.dmg, g.r, g.kb].forEach(function(v){ dmg += v; });
        return { errs: errs, dmg: dmg, y: g.y };
      } catch(e){ return { errs: [e.message] }; }
    })()`);
    expect(r.errs).toEqual([]);
    expect(r.dmg, 'a ghost: no damage, no radius, no knockback').toBe(0);
    expect(r.y, 'parked off the screen').toBeLessThan(-1000);
  });
});

describe('his art', () => {
  const read = (f) => PNG.sync.read(readFileSync(`artifacts/V1/assets/sprites/attacks/${f}`));
  it('wears the II wiki\'s own art, credited and on the record: the glove, the portal, the boomerang -- and the glitched render', () => {
    const r = W.eval(`({ art: ['mp4glove', 'mp4portal', 'mp4boom'].map(function(k){ return [k, ATTACK_SPRITES[k] && ATTACK_SPRITES[k].src, !!PROJ_SHAPE[k]]; }),
      ball: [typeof PROJ_SHAPE.mp4ball.draw, !!ATTACK_SPRITES.mp4ball], glitch: BOSS_SPRITE_SRC.mephoneglitch })`);
    expect(r.art).toEqual([['mp4glove', 'assets/sprites/attacks/mp4glove.png', true], ['mp4portal', 'assets/sprites/attacks/mp4portal.png', true], ['mp4boom', 'assets/sprites/attacks/mp4boom.png', true]]);
    expect(r.ball, 'the cannonball is drawn: the wiki has no clean file of it').toEqual(['function', false]);
    const manifest = JSON.parse(readFileSync('scripts/attack-sprite-manifest.json', 'utf8')), credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    for (const [k, title] of [['mp4glove', 'Late II Fist Thingy.png'], ['mp4portal', 'Rejection Portal (Bigger Version).png'], ['mp4boom', "S1RE14 MePhone's boomerangs.png"]]) {
      const e = manifest[k];
      expect(e, `${k} is in the manifest`).toBeTruthy();
      expect(e.wiki).toBe('ii');
      expect(e.srcTitle).toBe(title);
      expect(e.source).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/inanimateinsanity\/images\//);
      expect(credits, `${k} is credited with its source`).toContain(`(${e.file})`);
      expect(credits).toContain(e.source);
    }
    expect(credits).toContain('mephone4-glitched.png');
    expect(credits).toContain('Glitched_Mephone4.png');
    const sm = JSON.parse(readFileSync('scripts/sprite-manifest-inanimateinsanity.json', 'utf8'))['MePhone4 Glitched'];
    expect([sm.ok, sm.file, sm.flip]).toEqual([true, 'mephone4-glitched.png', false]);
    expect(sm.source).toMatch(/Glitched_Mephone4\.png/);
  });

  it('the glove is cut before its labelled cuff band: nothing white and nothing written on it -- the cuff and the band are drawn blank', () => {
    const png = read('mp4glove.png'); let white = 0, solid = 0;
    for (let i = 0; i < png.data.length; i += 4) if (png.data[i + 3] >= 128) { solid++; if (png.data[i] > 235 && png.data[i + 1] > 235 && png.data[i + 2] > 235) white++; }
    expect(solid).toBeGreaterThan(png.width * png.height * 0.5);
    expect(white, 'the band that carries the label is not in it').toBe(0);
    const src = html();
    expect(src.slice(src.indexOf('function mpGloveArt('), src.indexOf('function mpGloveTell(')), 'its band is drawn with nothing on it').not.toMatch(/fillText|strokeText/);
  });

  it('draws no word anywhere -- not a label, not a banner of its own -- and names none of the OSC, and never the portal\'s destination', () => {
    for (const s of SLOTS) {
      const t = slot(s), code = t.split(/\r?\n/).map((l) => l.replace(/(^|\s)\/\/.*$/, '$1')).join('\n');   // the code, not what the comments say about it (the file is CRLF)
      expect(t.length, `${s} slot found`).toBeGreaterThan(0);
      expect(code, `${s}: no text drawn`).not.toMatch(/fillText|strokeText/);
      expect(code, `${s}: no banner of its own`).not.toMatch(/banner\(/);
    }
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8'), c0 = credits.indexOf('@boss:mephone4:begin credits'), c1 = credits.indexOf('@boss:mephone4:end credits');
    const mine = SLOTS.map(slot).join('\n') + credits.slice(c0, c1);
    expect(mine.split('\n').filter((l) => /\bOJ\b|Suitcase|Cabby|Hotel|A-OJ|The Floor/.test(l))).toEqual([]);
    // and the source of every function of his that could say it
    const src = W.eval(`[String(mpPortalFire), String(mpPortalTick), String(mpExitX), String(BOSS_MOVES.melife), String(mpBoomFire), String(mpMazeFire), String(mpMazeTick), String(mpEndBegin),
      String(mpDrawDecor), MEPHONE_POOL.join(' '), BOSS_MOVE_NAME.melife, BOSS_MOVE_NAME.portal, BOSS_MOVE_NAME.boomerang, BOSS_MOVE_NAME.maze, bossPhaseName({attack:'mephone'}, 2), bossPhaseName({attack:'mephone'}, 3)].join('\\n')`);
    expect(src).not.toMatch(/\bOJ\b|Suitcase|Cabby|Hotel|A-OJ/i);
  });

  it('a hostile 8-Ball keeps quiet, so it cannot wipe his telegraph off the banner', () => {
    const r = W.eval(`(function(){ ${STAGE('WW*0.5+300')}
      f.x = b.x + 300; var R = Math.random; Math.random = function(){ return 0; }; var a; try { a = meLifeDownload(b, 1); } finally { Math.random = R; }
      a._dl = 0; a.x = f.x - 200;
      banner('FIST THINGY!', 700, 'boss');
      for (var i=0;i<5;i++){ step(); f.x = b.x + 300; }
      var text = document.getElementById('banner').textContent; summons = []; return text; })()`);
    expect(r).toBe('FIST THINGY!');
  });
});

describe('the item version', () => {
  // summonBoss is not in spawnItem's pool today, so this code does not run in a match. If it comes back, an add downloaded by an item boss (team -1) would attack its own summoner, and so would the
  // portal -- so his second moves are Boss Rush only.
  it('an item MePhone4 never downloads an add, opens a portal, builds a maze or throws a boomerang', () => {
    const r = W.eval(`(function(){ summons = []; projectiles = []; worldPlats = platRectsSmall();
      var s = { type:'boss', name:'MePhone4', color:'#4fb8e8', x:550, y:300, r:70, hp:200, vx:0, vy:0, face:1, _atkTimer:1, _tel:0 };
      var out = []; for (var i=0;i<8;i++){ s._atkTimer = 1; s._tel = 0; updateBossAttack(s, null); out.push(String(s._telKind)); s._tel = 1; updateBossAttack(s, null); }
      var r = { kinds: out, adds: summons.filter(function(m){ return m.hostile; }).length, portal: !!(s._hz && s._hz.pt), boom: projectiles.some(function(p){ return p.mpBm; }), maze: worldPlats.some(function(p){ return p._mz; }),
        only: BOSS_EXTRA['MePhone4'].map(function(k){ return BOSS_RUSH_ONLY.has(k); }) };
      summons = []; projectiles = []; return r;
    })()`);
    expect(r.kinds).toEqual(Array(8).fill('undefined'));
    expect(r.adds).toBe(0);
    expect(r.portal).toBe(false);
    expect(r.boom).toBe(false);
    expect(r.maze).toBe(false);
    expect(r.only).toEqual([true, true, true, true]);
  });
});

describe('a netcode client sees him', () => {
  it('his portals, hop, maze, glove tell, TV and ending all cross the snapshot and draw on the client', () => {
    const { window: w } = loadMonolith();   // the harness with gradients, as test/net-lobby.test.js uses: drawBossBar needs one
    const r = w.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow();
      var gy = groundY(), z = [560, -1, hazardT - 60, 2];
      summons = [{ type:'boss', name:'MePhone4', color:'#4fb8e8', r:85, sprite:'mephone', x:900, y:500, hp:80, maxHp:120, face:-1, flash:0, homeX:900, _rage:false, _tel:12, _telKind:'melife', _bossRush:true, attack:'mephone',
                   _telX:700.6, _telY:410.2, _phase:3,
                   _hz:{ fd:-1, pu:hazardT - 2, p2:5, p3:60, sh:hazardT - 4, hop:[4, 550, 900], ml:[760, 360], pw:[[560, 560, 220]], pt:[[560, 560, 220, 0, 20, 48, hazardT - 3, 0], [300, 560, 800, 12, 48, 48, 0, 1]], mz:z },
                   _boss: true },
                 { type:'assist', name:'Pie', color:'#e8c060', r:26, x:300, y:400, hp:30, maxHp:40, face:1, flash:0, hostile:true, _dl:12, team:-1, owner:-1 }];
      BOSS_ARENA = 'elimarea';
      worldPlats = platRectsSmall(); var pl = { x:405, y:gy - 72, w:96, h:72, solid:true, _mp:true, _mz:true }; worldPlats.push(pl);
      projectiles = [
        { x:200, y:300, vx:-20, vy:0, r:44, color:'#d8302a', shape:'fistthingy', owner:-2, ownerObj:{team:-1, idx:-2}, bossAtk:9, life:80, mpGlove:1, mpDir:-1, armX0:1100, armY0:300, delay:0, mpD0:0, mpLk:8, _hit:{ 0:1 } },
        { x:60, y:300, vx:0, vy:0, r:44, color:'#d8302a', shape:'fistthingy', owner:-2, ownerObj:{team:-1, idx:-2}, bossAtk:9, life:80, mpGlove:1, mpDir:-1, armX0:1100, armY0:300, delay:1e9 - 5, mpD0:0, mpLk:8, mpWave:10 },
        { x:60, y:300, vx:0, vy:0, r:44, color:'#d8302a', shape:'fistthingy', owner:-2, ownerObj:{team:-1, idx:-2}, bossAtk:9, life:80, mpGlove:1, mpDir:1, armX0:0, armY0:300, delay:12, mpD0:26, mpLk:8 },
        { x:300, y:gy + 80, vx:-4, vy:-19, r:44, color:'#d8302a', shape:'fistthingy', owner:-2, ownerObj:{team:-1, idx:-2}, bossAtk:9, life:80, mpGlove:1, mpDir:-1, armX0:300, armY0:gy, delay:20, mpD0:60, mpLk:8, mpUp:1, mpM:40 },
        { x:400, y:300, vx:13, vy:0, r:20, color:'#f09a4a', shape:'mp4boom', owner:-2, ownerObj:{team:-1, idx:-2}, bossAtk:9, life:80 },
        { x:500, y:gy - 20, vx:-11, vy:0, r:20, color:'#2a2a30', shape:'mp4ball', owner:-2, ownerObj:{team:-1, idx:-2}, bossAtk:9, life:80 },
        { x:700, y:-5000, vx:0, vy:0, r:0, dmg:0, color:'#4fb8e8', shape:'mp4glove', owner:-2, ownerObj:{team:-1, idx:-2}, life:1, delay:60, mpEnd:1, et0:hazardT - 30, ex:900, ey:500, ef:-1, er:85 }
      ];
      var snap = JSON.parse(JSON.stringify(serializeState()));
      summons = []; projectiles = []; worldPlats = []; BOSS_ARENA = null;
      applySnapshot(snap);
      var err = null; try { draw(); } catch(e){ err = e.message + ' ' + String(e.stack).slice(0, 200); }
      var shots = projectiles.map(function(p){ return { glove: !!p.mpGlove, dir: p.mpDir, wave: p.mpWave, up: !!p.mpUp, m: p.mpM, d0: p.mpD0, lk: p.mpLk, delay: p.delay, arm: [p.armX0, p.armY0], shape: p.shape, end: !!p.mpEnd, et0: p.et0, er: p.er }; });
      var boss = snap.summons[0];
      return { boss: boss, add: snap.summons[1], shots: shots, err: err, arena: BOSS_ARENA, walls: worldPlats.filter(function(p){ return p.solid && p.h === 72; }).length, hz: summons[0]._hz }; })()`);
    expect(r.err).toBe(null);
    expect(r.arena, 'the client takes his arena\'s key').toBe('elimarea');
    expect(r.boss._hz, 'his hop, marks, portals, maze and the TV\'s beats all ride _hz as they are').toMatchObject({ fd: -1, hop: [4, 550, 900], ml: [760, 360], pw: [[560, 560, 220]], p2: 5, p3: 60 });
    expect(r.boss._hz.pt).toHaveLength(2);
    expect(r.boss._hz.mz).toHaveLength(4);
    expect(r.boss, 'where the wind-up is aimed and his phase').toMatchObject({ _telX: 701, _telY: 410, _phase: 3, _telKind: 'melife' });
    expect(r.add).toMatchObject({ hostile: true, _dl: 12, hp: 30, maxHp: 40 });
    expect(r.shots[0]).toMatchObject({ glove: true, dir: -1, shape: 'fistthingy', arm: [1100, 300], delay: 0 });
    expect(r.shots[1]).toMatchObject({ glove: true, wave: 10 });
    expect(r.shots[2]).toMatchObject({ glove: true, dir: 1, delay: 12, d0: 26, lk: 8, arm: [0, 300] });
    expect(r.shots[3]).toMatchObject({ glove: true, up: true, m: 40, d0: 60, delay: 20 });
    expect(r.shots[4].shape).toBe('mp4boom');
    expect(r.shots[5].shape).toBe('mp4ball');
    expect(r.shots[6]).toMatchObject({ end: true, et0: expect.any(Number), er: 85 });
    expect(r.walls, 'the maze\'s wall is a platform the client has').toBe(1);
  });
});

describe('a downloading add stays where it lands', () => {
  it('a Beach Ball add starts its ricochet only once its download is done, not the frame it appears', () => {
    // MELIFE DOWNLOAD!'s adds are inert while they download (MELIFE_DL frames, the arrival tell); the Beach Ball's ricochet launched at once
    // and bounced away from its scan circle (found by MePhone4's builder, 2026-10-01).
    const r = W.eval(`(function(){ var gy = groundY(), saved = worldPlats; worldPlats = [];
      var a = { type:'assist', act:'bounce', hostile:true, _dl:MELIFE_DL, x:500, y:gy-20, vx:0, vy:0, r:20, face:1, life:999 };
      for (var i=0;i<MELIFE_DL-1;i++){ stepAssistBody(a, gy); a._dl--; }
      var during = { x:a.x, vx:a.vx, launched: !!a._launched };
      a._dl = 0; stepAssistBody(a, gy);
      var out = { during: during, after: { vx: a.vx, launched: !!a._launched }, speed: BEACH_BALL_SPEED };
      worldPlats = saved; return out;
    })()`);
    expect(r.during, 'inert while it downloads').toEqual({ x: 500, vx: 0, launched: false });
    expect(r.after.launched, 'then it goes').toBe(true);
    expect(Math.abs(r.after.vx)).toBe(r.speed);
  });
});
