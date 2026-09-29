import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "and assist trophies should be stronger." Asked how: "Hit harder and stay longer." Every assist that comes out of the item
// now deals ASSIST_TROPHY_DMG (1.5) times its number -- on a fighter and on the boss's side alike, through addDmg -- and stays
// ASSIST_TROPHY_TIME (1.5) times as long; the one-shots, which cannot hit harder or stay longer, each do more of their one
// thing. Trophies only: MePhone4's hostile adds are his attack and keep their numbers. (Bot used to be the other exception, as Test
// Tube's summon; that summon is retired -- "oh, and bot should get their own kit."; asked what happens to Test Tube's summon,
// "New move for Test Tube" -- so its four lines here are gone with it, and one line below pins that nothing of it is left.)
// Old -> new, pinned here against the build before this change (a43b614).

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// act -> [the number it dealt a fighter before, the number it deals now]
const HIT = { rush: [10, 15], crush: [14, 21], bounce: [6, 9], staple: [4, 6], vortex: [3, 4.5], bolt: [8, 12], mines: [18, 27], pull: [1, 1.5] };

// A two-fighter FFA: a still Firey (team 0) at 400 and a still Pen (team 1) at 470; `actJs` (a JS expression) names the
// act of the assist summoned for Firey, bound to `a`. Settled one frame, then everything the frame touched re-zeroed.
const FFA = (actJs) => `
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var A = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 400, groundY()-24, 0);
  var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 470, groundY()-24, 1);
  A.team=0; D.team=1; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9; fighters=[A,D];
  step(); A.pct=0; D.pct=0; A.invuln=0; D.invuln=0;
  var a = summonAssistNamed(A, ASSIST_ROSTER.find(function(x){ return x.act===${actJs}; }));`;

// Boss Rush against MePhone4 with the gauntlet logic off, a still Firey `dx` from the boss, his attack timer parked; `act`'s
// assist is summoned for Firey and watched `n` frames, and every frame his HP dropped is recorded with the drop.
const RUN = (act, dx, n) => `(function(){
  SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
  BOSSRUSH = { active:false, bossIdx:6, cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), WW*0.5 + ${dx}, groundY()-24, 0);
  f.team=0; f.controller='still'; f.stocks=9; fighters=[f];
  spawnBossRushBoss();
  var b = summons.find(function(s){ return s.type==='boss'; }); b._atkTimer = 1e9;
  step(); f.pct=0; f.invuln=0; f.x = WW*0.5 + ${dx}; f.vx = 0;
  var a = summonAssistNamed(f, ASSIST_ROSTER.find(function(x){ return x.act===${JSON.stringify(act)}; }));
  var hits = [], lastHp = b.hp;
  for (var i=0;i<${n};i++){
    step(); b._atkTimer = 1e9; f.invuln = 0; f.dead = false;
    if (b.hp < lastHp){ hits.push(+(lastHp - b.hp).toFixed(3)); lastHp = b.hp; }
    if (b.hp <= 0) break;
  }
  var out = { boss: b.name, name: a.name, hits: hits };
  summons = []; projectiles = []; running = false; return out;
})()`;

describe('the knobs: x1.5 damage, x1.5 time', () => {
  it('ASSIST_TROPHY_DMG and ASSIST_TROPHY_TIME are 1.5; a trophy stays nine seconds (was six), Black Hole 4.5 (was 3)', () => {
    expect(W.eval('ASSIST_TROPHY_DMG')).toBe(1.5);
    expect(W.eval('ASSIST_TROPHY_TIME')).toBe(1.5);
    expect(W.eval('ASSIST_DUR'), 'was 360').toBe(540);
    expect(W.eval('ASSIST_ONESHOT_WINDOW'), 'a one-shot fires once and leaves: its window to find its moment is not a tenure').toBe(300);
    const r = W.eval(`(function(){ ${FFA("'rush'")}
      var p = summonAssistNamed(A, ASSIST_ROSTER.find(function(x){ return x.act==='pull'; }));
      var out = { rush: a.life, pull: p.life, row: ASSIST_ROSTER.find(function(x){ return x.act==='pull'; }).dur };
      summons = []; running = false; return out; })()`);
    expect(r.rush).toBe(540);
    expect(r.pull, 'was 180').toBe(270);
    expect(r.row).toBe(270);
  });
});

describe('hit harder: on a fighter', () => {
  it('each act lands its old number x1.5: 8-Ball 15, Spongy 21, the ball 9, the staple 6, the blades 4.5, a lob 12, a mine 27', () => {
    const acts = Object.keys(HIT).filter(a => a !== 'pull');
    const r = W.eval(`(function(){
      var out = {};
      ${JSON.stringify(acts)}.forEach(function(act){
        ${FFA('act')}
        // Blender opens at centre stage, so Pen stands in it; the ball comes down about 400px out, so Pen stands there
        var px = act==='vortex' ? a.x + 40 : act==='bounce' ? 400 + 400*A.face : 470; D.x = px;
        var first = 0;
        for (var i=0;i<360 && !first;i++){ step(); D.invuln = 0; D.dead = false; if (D.pct > 0) first = +D.pct.toFixed(3); D.x = px; D.vx = 0; D.y = groundY()-24; D.vy = 0; }
        out[act] = first;
      });
      summons = []; projectiles = []; running = false; return out;
    })()`);
    for (const act of acts) expect(r[act], `${act}: was ${HIT[act][0]}`).toBe(HIT[act][1]);
  });

  it("the cart's plow: (8 + 0.9 x its speed) x1.5, so 12 at a standstill (was 8)", () => {
    const r = W.eval(`(function(){ ${FFA("'cart'")}
      // Pen stands in the cart, which has not started rolling. updateSummons alone moves no fighter, so nobody mounts it.
      D.x = a.x; D.y = a.y; D.invuln = 0; a._cd = 0; a.vx = 0;
      updateSummons();
      var out = { first: +D.pct.toFixed(6), spd: Math.abs(a.vx) };
      summons = []; running = false; return out; })()`);
    expect(r.first).toBeGreaterThan(0);
    expect(r.first).toBeCloseTo(1.5 * (8 + 0.9 * r.spd), 6);
    expect(r.first).toBeGreaterThanOrEqual(12);
  });

  it("Black Hole's chip on a fighter: 1.5 a second (was 1)", () => {
    const r = W.eval(`(function(){ ${FFA("'pull'")}
      a.x = WW*0.5; a.y = groundY()-60; a.vx = 0; a.vy = 0; D.x = a.x + 100; D.y = a.y; D.pct = 0;
      hazardT = 120; a._cd = 0; updateSummons();          // the doc's tick is hazardT%60, on a frame the act runs
      var tick = +D.pct.toFixed(6);
      hazardT = 121; a._cd = 0; updateSummons();          // and nothing between ticks
      var out = { tick: tick, between: +(D.pct - tick).toFixed(6) };
      summons = []; running = false; return out; })()`);
    expect(r.tick).toBe(1.5);
    expect(r.between).toBe(0);
  });
});

describe('hit harder: on a boss, through his own damage path', () => {
  it('every hit on MePhone4 is the x1.5 number: 15, 21, 6, 12, 4.5, 9, 1.5; a mine frame a multiple of 27; the cart 12 or more', () => {
    const DX = { rush: 60, crush: 60, staple: 120, bolt: 150, vortex: 0, bounce: 60, pull: 60, mines: 40, cart: 0 };
    const out = {};
    for (const act of Object.keys(DX)) out[act] = W.eval(RUN(act, DX[act], 420));
    for (const act of Object.keys(DX)) {
      expect(out[act].boss).toBe('MePhone4');
      expect(out[act].hits.length, `${out[act].name} (${act}) never landed`).toBeGreaterThanOrEqual(1);
    }
    for (const act of ['rush', 'crush', 'staple', 'bolt', 'vortex', 'bounce', 'pull']) {
      for (const h of out[act].hits) expect(h, `${out[act].name}: was ${HIT[act][0]}`).toBe(HIT[act][1]);
    }
    for (const h of out.mines.hits) expect(h % 27, 'two mines can go off on one frame').toBe(0);
    for (const h of out.cart.hits) expect(h, 'the cart: 8 x1.5 at a standstill, more the faster it plows').toBeGreaterThanOrEqual(12);
  });
});

describe('the one-shots do more of their one thing', () => {
  it('Grotato plants six mines 60 px apart, a 300 px patch (was four, 50 apart, 150 px), each a 27 to step on (was 18), all of it on the stage', () => {
    const r = W.eval(`(function(){
      function plant(x){ ${FFA("'mines'")}
        a.x = x; a._cd = 0; updateSummons();
        var xs = projectiles.filter(function(p){ return p.trap && p.assist; }).map(function(p){ return p.x; }).sort(function(u,v){ return u-v; });
        var gaps = []; for (var i=1;i<xs.length;i++) gaps.push(+(xs[i]-xs[i-1]).toFixed(6));
        var out = { n: xs.length, spread: +(xs[xs.length-1]-xs[0]).toFixed(6), gaps: gaps, min: xs[0], max: xs[xs.length-1],
                    dmg: projectiles.filter(function(p){ return p.trap && p.assist; }).map(function(p){ return p.dmg; }), fired: summons.indexOf(a) < 0 };
        // Pen steps on the middle-left one once it has armed
        D.x = xs[2]; D.y = groundY()-24; var first = 0;
        for (var i=0;i<60 && !first;i++){ step(); D.invuln = 0; D.dead = false; if (D.pct > 0) first = +D.pct.toFixed(3); D.x = xs[2]; D.vx = 0; D.y = groundY()-24; D.vy = 0; }
        out.first = first; summons = []; projectiles = []; return out; }
      var out = { mid: plant(WW*0.5), edge: plant(30) }; out.WW = WW; running = false; return out; })()`);
    expect(r.mid.fired).toBe(true);
    expect(r.mid.n, 'was 4').toBe(6);
    expect(r.mid.gaps).toEqual([60, 60, 60, 60, 60]);
    expect(r.mid.spread, 'was 150').toBe(300);
    expect(r.mid.dmg).toEqual([18, 18, 18, 18, 18, 18]);   // 12 x1.5 in the shot; a trap lands TRAP_DMG_MULT of that
    expect(r.mid.first, 'a mine to step on: was 18').toBe(27);
    // summoned at the wall the patch is slid onto the stage, not planted half off it
    expect(r.edge.n).toBe(6);
    expect(r.edge.spread).toBe(300);
    expect(r.edge.min).toBeGreaterThanOrEqual(30);
    expect(r.edge.max).toBeLessThanOrEqual(r.WW - 30);
    expect(r.edge.first).toBe(27);
  });

  it('the flash stuns a fighter facing it for 75 frames and freezes for 45 (were 50 and 30), and holds an add facing it for 75 (was 50)', () => {
    const r = W.eval(`(function(){ ${FFA("'flash'")}
      // a hostile 8-Ball of MePhone4's on the camera's other side, looking at it (summoned first, so its turn in the loop
      // comes before the flash and its hold is read whole). An add leaves the moment no boss stands, so a parked MePhone4
      // stands well out of the shot, as test/beach-ball.test.js stands him.
      var boss = { type:'boss', name:'MePhone4', color:'#4fb8e8', team:-1, owner:-1, x:WW-140, y:groundY()-90, vx:0, vy:0, r:85, hp:255, maxHp:255,
                   life:1e9, face:-1, _cd:0, attack:'basic', sprite:'mephone', stationary:true, homeX:WW-140, _tel:0, _phase:1, _atkTimer:1e9 };
      var add = summonAssistNamed({ x: a.x - 120, face: 1, team: -1, idx: -1 }, ASSIST_ROSTER.find(function(x){ return x.name==='8-Ball'; }));
      add.hostile = true; add._dl = 0; add.hp = add.maxHp = 40; add._cd = 0; add.y = a.y;
      summons = [boss, add, a];
      D.x = a.x + 120; D.face = -1; D.y = a.y; D.hitstun = 0; D.frozen = 0;    // looking AT the camera
      updateSummons();
      var out = { hitstun: D.hitstun, frozen: D.frozen, held: add._cd, fired: summons.indexOf(a) < 0 };
      summons = []; running = false; return out; })()`);
    expect(r).toEqual({ hitstun: 75, frozen: 45, held: 75, fired: true });
    expect(W.eval('FLASH_STUN')).toBe(75);
    expect(W.eval('FLASH_FREEZE')).toBe(45);
  });

  it("Clock rewinds 30 of the summoner's damage (was 20), and never more than all of it", () => {
    const r = W.eval(`(function(){
      function rewind(pct){ ${FFA("'rewind'")} A.pct = pct; a._cd = 0; updateSummons(); var p = A.pct; summons = []; return p; }
      var out = { from50: rewind(50), from10: rewind(10) }; running = false; return out; })()`);
    expect(r.from50, 'was 30').toBe(20);
    expect(r.from10, 'capped at all of it').toBe(0);
    expect(W.eval('CLOCK_REWIND')).toBe(30);
  });

  it("the Eraser still wipes every shot and trap and drops three yoyle -- and now erases the throwable in a foe's hand, not the summoner's", () => {
    const r = W.eval(`(function(){ ${FFA("'erase'")}
      A._holding = { r:12, dmg:16, kb:12 }; D._holding = { r:12, dmg:16, kb:12 };
      addProj({ owner:D.idx, ownerObj:D, x:D.x, y:D.y, vx:-3, vy:0, grav:false, dmg:5, kb:3, r:8, color:'#fff', life:200 });
      addProj({ owner:A.idx, ownerObj:A, x:A.x, y:A.y-8, vx:0, vy:0, grav:false, dmg:9, kb:5, r:10, color:'#fff', life:200, trap:true, arm:30 });
      var before = projectiles.length;
      a._cd = 0; updateSummons();
      var out = { before: before, fired: summons.indexOf(a) < 0, shots: projectiles.length, yoyle: items.filter(function(i){ return i.kind==='yoyle'; }).length,
                  foeHand: !!D._holding, ownHand: !!A._holding };
      summons = []; projectiles = []; items = []; running = false; return out; })()`);
    expect(r.before).toBe(2);
    expect(r).toMatchObject({ fired: true, shots: 0, yoyle: 3, foeHand: false, ownHand: true });
  });
});

describe('not a trophy, not touched', () => {
  it("MePhone4's adds keep three quarters of the cameo's own number and their 216-frame tenure", () => {
    const r = W.eval(`(function(){
      BOSSRUSH = { active:false, bossIdx:6, cleared:0, defeated:false, loop:0, dmgMult:1 };
      var add = { type:'assist', hostile:true, act:'rush' }, trophy = { type:'assist', act:'rush' };
      return { add: [addDmg(add, 10), addDmg(add, 14), addDmg(add, 8), addDmg(add, 6)],
               trophy: [addDmg(trophy, 10), addDmg(trophy, 14), addDmg(trophy, 8), addDmg(trophy, 6)],
               isTrophy: [isTrophy(trophy), isTrophy(add)],
               addLife: MELIFE_LIFE, addDl: MELIFE_DL, hostileMult: HOSTILE_ADD_DMG };
    })()`);
    expect(r.add, '0.75 x 10, 14, 8, 6: as before').toEqual([7.5, 10.5, 6, 4.5]);
    expect(r.trophy).toEqual([15, 21, 12, 9]);
    expect(r.isTrophy).toEqual([true, false]);
    expect(r.addLife, 'three fifths of the six seconds it was tuned at').toBe(216);
    expect(r.hostileMult).toBe(0.75);
  });

  it('a downloaded add still stands its 216 + 40 frames, and Test Tube\'s Bot summon is gone: nothing of it is left to pin', () => {
    const r = W.eval(`(function(){
      var out = { gone: [typeof BOT_ASSIST, typeof BOT_DMG, typeof BOT_KB, typeof BOT_REACH, typeof BOT_CD, typeof BOT_SPECIAL_CD, typeof drawBotSummon] };
      SETTINGS.mode='boss'; SETTINGS.stocks=99; SETTINGS.items=false; running=true; BOSSRUSH = { active:false, bossIdx:6, cleared:0, defeated:false, loop:0, dmgMult:1 };
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), WW*0.5+300, groundY()-24, 0); f.team=0; f.controller='still'; fighters=[f];
      spawnBossRushBoss(); var b = summons.find(function(s){ return s.type==='boss'; }); b._atkTimer = 1e9;
      var add = meLifeDownload(b, 1); out.addLife = add.life; out.addHostile = !!add.hostile;
      summons = []; running = false; return out; })()`);
    expect(r.gone, "BOT_ASSIST, BOT_DMG, BOT_KB, BOT_REACH, BOT_CD, BOT_SPECIAL_CD and drawBotSummon went with the summon (\"New move for Test Tube\")").toEqual(Array(7).fill('undefined'));
    expect(r.addHostile).toBe(true);
    expect(r.addLife, 'MELIFE_LIFE + MELIFE_DL, as before').toBe(216 + 40);
  });
});

describe('no text on screen', () => {
  it('no assist puts a word up, from its summon to past its expiry -- every act, its hits, the mines going off, the wipe, the heal', () => {
    const shown = W.eval(`(function(){
      var out = [];
      ASSIST_ROSTER.forEach(function(row){
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
        worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
        var A = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 400, groundY()-24, 0);
        var D = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 470, groundY()-24, 1);
        A.team=0; D.team=1; A.you=true; A.controller='still'; D.controller='still'; A.stocks=9; D.stocks=9; fighters=[A,D];
        D._holding = { r:12, dmg:16, kb:12 };
        step(); A.pct=30; D.pct=30; A.invuln=0; D.invuln=0;
        window.__lastBanner = null;
        var a = summonAssistNamed(A, row);
        var px = row.act==='vortex' ? a.x + 40 : row.act==='bounce' ? 400 + 400*A.face : 470;
        for (var i=0;i<ASSIST_DUR+60;i++){ step(); D.invuln = 0; D.dead = false; A.dead = false; D.pct = 30; D.x = px; D.vx = 0; D.y = groundY()-24; D.vy = 0; }
        if (window.__lastBanner && window.__lastBanner.text) out.push(row.name+': "'+window.__lastBanner.text+'"');
      });
      summons = []; projectiles = []; items = []; running = false; return out;
    })()`);
    expect(shown).toEqual([]);
  }, 120000);
});
