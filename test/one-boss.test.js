import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';
import { mulberry32 } from './helpers/prng.js';
import { JSDOM } from 'jsdom';

// ONE, the secret boss: her fight. The owner, in order: "One is a secret boss ... you fight one on a teams-size map, but
// without the solid walls ... One has all of the algebralien attacks but launched faster and with more damage, has 2000 hp."
// / "also add a couple special attacks for one, with harder ones getting added every 500 hp, and the easier ones getting
// removed." / "no not only as lightning once unlocked." / "also one follows you if you try to run away. teams size map but
// keep the platforms. one can teleport if you are very far." / "number 5 should summon 1 ghost fighter with 100 hp you must
// kill before continuing damage ... all 5 attacks should cycle, with harder versions appearing for 3 random ones every
// phase. 3 tiers of attacks. things to change during the attacks: projectile speed, projectile amount, damage, effects."
// And on the arena: the solid walls AND the raised home ledges go, the floating platforms stay, and falling off either side
// is a knockout. And "Lightning's Chain Bolt can hit bosses EVERYWHERE, Boss Rush included."

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// Start her fight the way the unlock chain will: startOneFight(lineup, opts). onEnd returns true so no result screen is
// scheduled in the middle of the next test.
const fight = (lineup, opts, body) => W.eval(`(function(){
  SETTINGS.itemRate=0; SETTINGS.stocks=3; LOCAL_PLAYERS=1; window.__oneEnd = undefined;
  var __ok = startOneFight(${JSON.stringify(lineup)}, Object.assign(${JSON.stringify(opts || {})}, { onEnd:function(won){ window.__oneEnd = won; return true; } }));
  var one = summons.find(function(s){ return s._oneFight; });
  var you = fighters[0];
  ${body}
})()`);
const TIERS = `var setTier = function(one, t){ ONE_SPECIALS.forEach(function(k){ one._spTier[k] = t; }); };`;

describe('One is her own boss', () => {
  it('stays out of the Boss Rush roster, has 2000 HP, and wears a real transparent render no taller than 200px', () => {
    const r = W.eval(`({ n: BOSS_ROSTER.length, inRoster: BOSS_ROSTER.some(function(b){ return b.name==='One'; }), hp: ONE_BOSS.hp,
      src: BOSS_SPRITE_SRC.one, drawn: String(drawBossSprite).indexOf('case "one"') >= 0 })`);
    expect(r.n, 'the gauntlet keeps its nine').toBe(9);
    expect(r.inRoster).toBe(false);
    expect(r.hp).toBe(2000);
    expect(r.src).toBe('assets/sprites/one.png');
    expect(r.drawn, 'a drawn numeral 1 for the frames before the render loads').toBe(true);
    const png = PNG.sync.read(readFileSync('artifacts/V1/assets/sprites/one.png'));
    expect(png.height).toBeLessThanOrEqual(200);
    const a = (x, y) => png.data[(y * png.width + x) * 4 + 3];
    expect([a(0, 0), a(png.width - 1, 0), a(0, png.height - 1), a(png.width - 1, png.height - 1)]).toEqual([0, 0, 0, 0]);
    let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] === 0) clear++;
    expect(clear / (png.width * png.height), 'a cut-out, not a pasted rectangle').toBeGreaterThan(0.2);
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    expect(credits).toMatch(/`one\.png`/);
    expect(credits).toMatch(/One_TPOT_19\.png/);
  });

  it('starts from one entry point: the story fight is Lightning alone against a flat 2000, and Boss Rush is left alone', () => {
    const r = W.eval(`(function(){
      BOSSRUSH = { active:false, bossIdx:3, cleared:7, defeated:false, loop:1, dmgMult:2 };
      SETTINGS.mode = 'ffa'; SETTINGS.count = 3;
      return null; })()`);
    const f = fight(['Lightning', 'Firey'], { story: true }, `
      return { ok:__ok, mode:SETTINGS.mode, active:ONEFIGHT.active, story:ONEFIGHT.story, big:isBig(), names:fighters.map(function(f){ return f.name; }),
        hp:one.hp, max:one.maxHp, mult:one._dmgTakenMult, r:one.r, rush:[BOSSRUSH.active, BOSSRUSH.bossIdx, BOSSRUSH.cleared, BOSSRUSH.dmgMult],
        arena:BOSS_ARENA, running:running, you:you.controller, bosses:summons.filter(function(s){ return s.type==='boss'; }).length };`);
    expect(r).toBe(null);
    expect(f.ok).toBe(true);
    expect(f.mode).toBe('boss');
    expect(f.active && f.story && f.big && f.running).toBe(true);
    expect(f.names, 'the story fight is solo Lightning').toEqual(['Lightning']);
    expect(f.you).toBe('local');
    expect([f.hp, f.max, f.mult]).toEqual([2000, 2000, 1]);
    expect(f.bosses).toBe(1);
    expect(f.rush, 'no gauntlet state touched').toEqual([false, 3, 7, 2]);
    // Her arena's sky is the night sky with the cracked Moon in it ('onemoon'). It was keyed 'onedim', One's Dimension, and
    // the review's canon pass flagged that: canon puts her dimension outside space-time, not under the Moon she left.
    expect(f.arena).toBe('onemoon');
  });

  it('once unlocked takes any lineup ("no not only as lightning"): allies scale each hit, never the 2000 bar', () => {
    const r = fight(['Firey', 'Leafy', 'Bubble', 'Pencil'], {}, `
      one._atkTimer = 1e9; var hp0 = one.hp; var d = oneTakeDamage(one, 28);
      return { n:fighters.length, sides:fighters.map(function(f){ return f.team; }), ai:fighters.slice(1).every(function(f){ return f.controller==='ai'; }),
        max:one.maxHp, mult:one._dmgTakenMult, took:hp0 - one.hp, d:d };`);
    expect(r.n).toBe(4);
    expect(r.sides).toEqual([0, 0, 0, 0]);
    expect(r.ai).toBe(true);
    expect(r.max).toBe(2000);
    expect(r.mult).toBeCloseTo(1 / 2.8, 6);
    expect(r.took, 'four fighters face the effective HP Boss Rush would give them').toBeCloseTo(10, 6);
  });
});

describe('the arena: the teams map without its walls', () => {
  it('is teams-size, keeps its floating platforms, and has no walls, no home ledges, no bases', () => {
    const r = fight(['Lightning'], { story: true }, `
      var solids = worldPlats.filter(function(p){ return p.solid; }), floor = solids[0];
      return { WW:WW, WH:WH, expW:Math.round(W*Math.min(3.6, 2.9 + 4*0.11)*1.5), expH:Math.round(H*2.5*1.5),
        walls:worldPlats.filter(function(p){ return p.wall; }).length, solids:solids.length, floorY:floor.y, floorH:floor.h, gy:groundY(),
        pitL:floor.x, pitR:WW - (floor.x + floor.w), plats:worldPlats.filter(function(p){ return !p.solid; }).length,
        high:worldPlats.filter(function(p){ return !p.solid && p.y < WH*0.4; }).length, bases:bases.length, zones:worldZones.length,
        pads:worldPlats.filter(function(p){ return p.pad; }).length };`);
    expect([r.WW, r.WH]).toEqual([r.expW, r.expH]);
    expect(r.walls, 'the solid walls are gone').toBe(0);
    expect(r.solids, 'the floor is the only solid: the raised home ledges are gone too').toBe(1);
    expect(r.gy, 'she and her attacks stand on the real floor line').toBeCloseTo(r.floorY, 6);
    expect(r.pitL).toBeGreaterThan(0);
    expect(r.pitR).toBeGreaterThan(0);
    expect(r.plats, 'the floating platforms are kept').toBeGreaterThan(30);
    expect(r.high, 'all the way up the map').toBeGreaterThan(5);
    expect([r.bases, r.zones, r.pads]).toEqual([0, 0, 0]);
  });

  it('the teams map it is built from really does have walls and ledges, so the difference is the one asked for', () => {
    const r = W.eval(`(function(){
      go('title'); SETTINGS.mode='teams'; SETTINGS.count=4; SETTINGS.teamKey='2v2'; setupWorld();
      var out = { walls: worldPlats.filter(function(p){ return p.wall; }).length,
        ledges: worldPlats.filter(function(p){ return p.solid && !p.wall; }).length - 1, WW: WW };
      SETTINGS.mode='ffa'; return out; })()`);
    expect(r.walls).toBeGreaterThan(0);
    expect(r.ledges, 'two home ledges').toBe(2);
  });

  it('falling off either side is a knockout, and the floor holds you everywhere in between', () => {
    const r = fight(['Lightning'], { story: true }, `
      one._atkTimer = 1e9;
      var floor = worldPlats.filter(function(p){ return p.solid; })[0], lost = [];
      you.controller = 'still';
      [floor.x - 40, floor.x + floor.w + 40].forEach(function(x){
        var s0 = you.stocks; you.dead = false; you.x = x; you.y = floor.y - 60; you.vx = 0; you.vy = 0; you.invuln = 0;
        for (var i=0; i<200 && you.stocks===s0; i++){ one.x = WW*0.5; step(); }
        lost.push(s0 - you.stocks);
      });
      you.x = WW*0.5 - 300; you.y = floor.y - 60; you.vx = 0; you.vy = 0; var s1 = you.stocks;
      for (var j=0; j<120; j++){ one.x = WW*0.5 + 600; step(); }
      return { lost: lost, stood: you.onground, feet: you.y + you.r, floorY: floor.y, kept: you.stocks === s1 };`);
    expect(r.lost, 'off the left, off the right').toEqual([1, 1]);
    expect(r.stood).toBe(true);
    expect(r.feet).toBeCloseTo(r.floorY, 0);
    expect(r.kept).toBe(true);
  });

  it('puts the player\'s own mode, count, stage and pick back when the fight is left', () => {
    const r = W.eval(`(function(){
      go('title'); SETTINGS.mode='ffa'; SETTINGS.count=3; chosen = ROSTER.find(function(x){ return x.name==='Pen'; });
      var st = stage;
      startOneFight(['Lightning'], { story:true, onEnd:function(){ return true; } });
      var during = { mode:SETTINGS.mode, big:isBig(), chosen:chosen.name };
      go('title');
      return { during: during, mode:SETTINGS.mode, count:SETTINGS.count, big:isBig(), active:ONEFIGHT.active, chosen:chosen.name, stage: stage===st };
    })()`);
    expect(r.during).toEqual({ mode: 'boss', big: true, chosen: 'Lightning' });
    expect([r.mode, r.count, r.big, r.active, r.chosen, r.stage]).toEqual(['ffa', 3, false, false, 'Pen', true]);
  });
});

describe("all of Four's and Two's attacks, launched faster and hitting harder", () => {
  it('hits for 33, capped at 33 an attack, with no Boss Rush loop leaking in; Four still caps at 22', () => {
    const r = W.eval(`(function(){
      var prev = BOSSRUSH; BOSSRUSH = { active:false, bossIdx:0, cleared:0, defeated:false, loop:2, dmgMult:4 };
      var d = oneDmg();
      var f = makeFighter(ROSTER.find(function(x){ return x.name==='Firey'; }), 400, 300, 0); f.team = 0;
      var id = ++BOSS_ATK_ID;
      applyHit(f, 33, 1, -1, null, { bossAtk:id, bossCap:33 }); f.invuln = 0;
      applyHit(f, 33, 1, -1, null, { bossAtk:id, bossCap:33 });
      BOSSRUSH = { active:false, bossIdx:0, cleared:0, defeated:false, loop:0, dmgMult:1 };
      var g = makeFighter(ROSTER.find(function(x){ return x.name==='Firey'; }), 400, 300, 1); g.team = 0;
      var id2 = ++BOSS_ATK_ID;
      applyHit(g, 30, 1, -1, null, { bossAtk:id2 }); g.invuln = 0;
      applyHit(g, 30, 1, -1, null, { bossAtk:id2 });
      BOSSRUSH = prev;
      return { d:d, capped:f.pct, four:g.pct, shot:oneShot({}, {}).dmg };
    })()`);
    expect(r.d).toBe(33);
    expect(r.capped, 'two of her shots from one attack land 33, not 66').toBe(33);
    expect(r.four, 'every other boss is capped exactly as before').toBe(22);
    expect(r.shot, "the shared shapes hit at 0.8 of hers, as bossShot does of Four's").toBeCloseTo(26.4, 6);
  });

  it('flies 1.35x as fast, and winds up and comes round again at Four\'s and Two\'s own pace', () => {
    const r = W.eval(`(function(){
      projectiles = [];
      var s = { x:500, y:300, r:88, face:1, _marks:0, maxHp:2000, hp:2000, _spTier:{ moonrocks:1, eyelasers:1, hands:1, orbitkick:1, ghost:1 } };
      var own = function(){ return projectiles.filter(function(p){ return p.owner===-2; }); };
      var spd = function(p){ return Math.hypot(p.vx, p.vy); };
      ONE_MOVES.screechy(s, null, 1); var scr1 = Math.max.apply(null, own().map(spd)); var scrDmg = own()[0].dmg; projectiles = [];
      s._marks = 3; ONE_MOVES.screechy(s, null, 2); var scr4 = Math.max.apply(null, own().map(spd)); projectiles = [];
      s._marks = 0; ONE_MOVES.ring(s, null, 3); var ring = own().map(spd); projectiles = [];
      ONE_MOVES.seekers(s, null, 4); var seek = own().map(function(p){ return [spd(p), p.homing]; }); projectiles = [];
      var tgt = { x:900, y:300, vx:0, vy:0 };
      fighters = [];
      ONE_MOVES.mindread(s, tgt, 5); var mr1 = own().map(function(p){ return [spd(p), p.homing, p.dmg]; }); projectiles = [];
      s._marks = 1; ONE_MOVES.mindread(s, tgt, 6); var mr2 = own().map(function(p){ return [spd(p), p.homing]; }); projectiles = [];
      s._marks = 0; s._telX = 500; s._telY = 300; ONE_MOVES.rain(s, tgt, 7); var rain = own().map(function(p){ return p.vy; }); projectiles = [];
      return { scr1:scr1, scr4:scr4, scrDmg:scrDmg, ring:ring, seek:seek, mr1:mr1, mr2:mr2, rain:rain,
        tel:[ONE_TEL.zap, ONE_TEL.screechy, ONE_TEL.rain, ONE_TEL.mindread, ONE_TEL.seekers, ONE_TEL.ring, ONE_TEL.sizeshift, ONE_TEL.ungrounded],
        gaps:[0,1,2,3].map(function(m){ return oneGap({ _marks:m }); }) };
    })()`);
    expect(r.scr1, "Four's 6").toBeCloseTo(8.1, 6);
    expect(r.scr4, "Four's 7.5").toBeCloseTo(10.125, 6);
    expect(r.scrDmg).toBe(33);
    expect(r.ring.length).toBe(12);
    r.ring.forEach(v => expect(v, "Two's ring at 6.5").toBeCloseTo(8.775, 6));
    expect(r.seek.length).toBe(3);
    r.seek.forEach(([v, h]) => { expect(v).toBeCloseTo(6.75, 6); expect(h, 'the same turning circle').toBeCloseTo(0.0675, 6); });
    expect(r.mr1.length).toBe(1);
    expect(r.mr1[0][0], "Two's 13").toBeCloseTo(17.55, 6);
    expect(r.mr1[0][1]).toBe(0);
    expect(r.mr1[0][2]).toBe(33);
    expect(r.mr2.length).toBe(2);
    expect(r.mr2[0][1]).toBeCloseTo(0.081, 6);
    expect(r.rain.length).toBe(5);
    r.rain.forEach(v => expect(v).toBeCloseTo(6.75, 6));
    // "Launched faster" is the shots above, 1.35x. The wind-ups and the gaps between attacks were 0.7x of Four's and Two's
    // too, which was the design's reading and not the owner's words, and with it nobody could beat her: the bans lift only
    // when she is beaten and there is "No way out" (the review's permanent-lock finding). The scripted player in
    // test/one-winnable.test.js won 0 of its 8 story fights at 0.7x and wins some at Four's and Two's own pace.
    expect(r.tel, "Four's 50 and Two's 36").toEqual([50, 50, 50, 36, 36, 36, 36, 36]);
    expect(r.gaps, "bossAtkGap's own 100/72/52").toEqual([100, 72, 52, 52]);
  });

  it('carries every Algebralien attack, and each one does what it did for Four or Two', () => {
    const r = fight(['Firey'], { story: true }, `
      one._atkTimer = 1e9; for (var w=0; w<30; w++) step();
      var out = {};
      ONE_DECK.forEach(function(k){
        projectiles = []; oneFx = []; you.pct = 0; you.invuln = 0; one.r = one._baseR; one._giantT = 0; one._ungrounded = false;
        one.x = you.x + 150; one.y = you.y - 40; one._telX = you.x; one._telY = hurtCY(you);
        var hp0 = one.hp = 1900;
        ONE_MOVES[k](one, you, ++BOSS_ATK_ID);
        out[k] = { shots: projectiles.filter(function(p){ return p.owner===-2; }).length, pct: you.pct, r: one.r, ung: one._ungrounded,
          healed: one.hp - hp0, fx: oneFx.map(function(e){ return e.kind; }) };
      });
      return { deck: ONE_DECK.slice(), out: out, base: one._baseR };`);
    expect(r.deck).toEqual(['zap', 'screechy', 'mindread', 'rain', 'seekers', 'ring', 'sizeshift', 'ungrounded']);
    expect(r.out.zap.pct, 'the zap column reaches a fighter standing on the floor').toBe(33);
    expect(r.out.zap.fx).toContain('column');
    expect(r.out.screechy.shots).toBeGreaterThan(200);
    expect(r.out.mindread.shots).toBe(1);
    expect(r.out.mindread.pct, "Power Drain's 6, x1.5").toBe(9);
    expect(r.out.mindread.healed, 'and it heals her').toBe(25);
    expect(r.out.rain.shots).toBe(5);
    expect(r.out.seekers.shots).toBe(3);
    expect(r.out.ring.shots).toBe(12);
    expect(r.out.sizeshift.r, 'canon One grows GIANT (TPOT 23, 25)').toBe(Math.round(r.base * 1.4));
    expect(r.out.ungrounded.ung).toBe(true);
  });

  it("her zap misses a fighter who moved off the spot, and Power Drain never heals her back over a phase line", () => {
    const r = fight(['Firey'], { story: true }, `
      one._atkTimer = 1e9; for (var w=0; w<30; w++) step();
      one._telX = you.x + 120; one._telY = hurtCY(you); you.pct = 0; you.invuln = 0;
      ONE_MOVES.zap(one, you, ++BOSS_ATK_ID); var aside = you.pct;
      one.hp = 1495; updateOne(one, you);            // into phase 2
      one.x = you.x + 60; one.y = you.y; you.invuln = 0;
      ONE_MOVES.mindread(one, null, ++BOSS_ATK_ID);
      return { aside: aside, hp: one.hp, marks: one._marks };`);
    expect(r.aside).toBe(0);
    expect(r.marks).toBe(1);
    expect(r.hp, 'capped at the 1500 line she already crossed').toBe(1500);
  });
});

describe('her five specials: all cycling, three tiers each, three stepping up every 500 HP', () => {
  it('cycles all five in order between two of the inherited attacks, the inherited ones out of a bag of eight', () => {
    const r = W.eval(`(function(){
      var s = { _moveN:0, _spN:0, _bag:[], _lastCard:null, _giantT:0, _ungrounded:false, _ghost:null };
      var seq = []; for (var i=0;i<45;i++) seq.push(oneNextMove(s));
      var spec = seq.filter(function(k,i){ return (i+1)%3===0; }), deck = seq.filter(function(k,i){ return (i+1)%3!==0; });
      var bags = []; for (var b=0; b+8<=deck.length; b+=8) bags.push(new Set(deck.slice(b, b+8)).size);
      var repeats = deck.filter(function(k,i){ return i>0 && k===deck[i-1]; }).length;
      var g = { _moveN:0, _spN:0, _bag:[], _lastCard:null, _giantT:0, _ungrounded:false, _ghost:{ dead:false } };
      var gs = []; for (var j=0;j<30;j++) gs.push(oneNextMove(g));
      var h = { _moveN:0, _spN:0, _bag:[], _lastCard:null, _giantT:200, _ungrounded:true, _ghost:null };
      var hs = []; for (var m=0;m<60;m++) hs.push(oneNextMove(h));
      return { spec:spec, bags:bags, repeats:repeats, ghostSpecials:gs.filter(function(k,i){ return (i+1)%3===0; }),
        blocked: hs.filter(function(k){ return k==='sizeshift' || k==='ungrounded'; }).length };
    })()`);
    const five = ['moonrocks', 'eyelasers', 'hands', 'orbitkick', 'ghost'];
    expect(r.spec, 'every third move, the next special, round and round').toEqual([...five, ...five, ...five]);
    r.bags.forEach(n => expect(n, 'all eight in every run of eight').toBe(8));
    expect(r.repeats, 'never the same inherited attack twice running').toBe(0);
    expect(r.ghostSpecials.includes('ghost'), 'never a second ghost while one stands').toBe(false);
    expect(r.ghostSpecials.slice(0, 5)).toEqual(['moonrocks', 'eyelasers', 'hands', 'orbitkick', 'moonrocks']);
    expect(r.blocked, 'no second giant while giant, no second ungrounding while ungrounded').toBe(0);
  });

  it('at 1500, 1000 and 500 HP three random specials step up a tier, capped at three', () => {
    const r = fight(['Firey'], { story: true }, `
      one._atkTimer = 1e9;
      var tiers = function(){ return ONE_SPECIALS.map(function(k){ return one._spTier[k]; }); };
      var sum = function(a){ return a.reduce(function(x,y){ return x+y; }, 0); };
      var out = { t0: tiers() };
      one.hp = 1501; updateOne(one, you); out.t1 = tiers(); out.m1 = one._marks;
      one.hp = 1500; updateOne(one, you); out.t2 = tiers(); out.m2 = one._marks; out.up2 = one._lastUp.slice();
      one.hp = 1000; updateOne(one, you); out.t3 = tiers();
      one.hp = 500;  updateOne(one, you); out.t4 = tiers(); out.m4 = one._marks;
      one.hp = 50;   updateOne(one, you); out.m5 = one._marks;
      out.sums = [sum(out.t0), sum(out.t2), sum(out.t3), sum(out.t4)];
      return out;`);
    expect(r.t0).toEqual([1, 1, 1, 1, 1]);
    expect(r.t1, '1501 is still phase one').toEqual([1, 1, 1, 1, 1]);
    expect(r.m1).toBe(0);
    expect(r.m2).toBe(1);
    expect(r.t2.filter(t => t === 2).length, 'exactly three went up').toBe(3);
    expect(r.up2.length).toBe(3);
    expect(r.sums[2] - r.sums[1]).toBe(3);
    expect(r.sums[3] - r.sums[2], 'three more, or every one that could still climb').toBeGreaterThanOrEqual(2);
    expect(Math.max(...r.t4), 'three tiers, no more').toBeLessThanOrEqual(3);
    expect([r.m4, r.m5], 'three phase changes in all').toEqual([3, 3]);
  });

  it('picks the three at random, and one big hit across two lines steps up twice', () => {
    const r = W.eval(`(function(){
      var picks = {};
      for (var seed=1; seed<=8; seed++){
        Math.random = (function(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; })(seed*7919);
        var s = { maxHp:2000, hp:1400, _marks:0, x:0, y:0, _spTier:{ moonrocks:1, eyelasers:1, hands:1, orbitkick:1, ghost:1 } };
        onePhaseUp(s); picks[s._lastUp.slice().sort().join(',')] = 1;
      }
      var b = { maxHp:2000, hp:900, _marks:0, x:0, y:0, r:88, _baseR:88, _spTier:{ moonrocks:1, eyelasers:1, hands:1, orbitkick:1, ghost:1 },
        _tel:0, _atkTimer:1e9, _dying:0, _introT:0, _giantT:0, _ungrounded:false, _ghost:null, vx:0, vy:0, face:1, _teleCd:0, _farT:0 };
      updateOne(b, null);
      return { distinct: Object.keys(picks).length, marks: b._marks,
        sum: Object.keys(b._spTier).reduce(function(a,k){ return a + b._spTier[k]; }, 0) };
    })()`);
    expect(r.distinct, 'not the same three every time').toBeGreaterThan(2);
    expect(r.marks).toBe(2);
    expect(r.sum).toBe(11);
  });

  it('each tier changes projectile speed, projectile amount, damage and effects', () => {
    const r = fight(['Firey', 'Leafy'], {}, `
      ${TIERS}
      one._atkTimer = 1e9; for (var w=0; w<20; w++) step();
      var out = {};
      [1,2,3].forEach(function(t){
        setTier(one, t);
        var take = function(fn, shape){ projectiles = []; fn(); var ps = projectiles.filter(function(p){ return p.owner===-2 && (!shape || p.shape===shape); });
          return { n: ps.length, spd: ps.length ? +Math.hypot(ps[0].vx, ps[0].vy).toFixed(3) : 0, dmg: ps.length ? +ps[0].dmg.toFixed(3) : 0, fx: ps.length ? ps[0].fxTag : null }; };
        one._aimX = you.x; one._aimY = hurtCY(you); one._telDir = 1; one._kickY = hurtCY(you);
        one._handSpots = [{ x: you.x, y: oneSurf(you.x, feetY(you) - 4) }];
        var row = {};
        row.moonrocks = take(function(){ ONE_MOVES.moonrocks(one, you, ++BOSS_ATK_ID); });
        row.eyelasers = take(function(){ ONE_MOVES.eyelasers(one, you, ++BOSS_ATK_ID); });
        row.hands = take(function(){ ONE_MOVES.hands(one, you, ++BOSS_ATK_ID); });
        row.orbitkick = take(function(){ ONE_MOVES.orbitkick(one, you, ++BOSS_ATK_ID); }, 'oneplanet');
        row.ghost = take(function(){ ONE_MOVES.ghost(one, you, ++BOSS_ATK_ID); });
        var g = one._ghost; row.ghost.hit = g ? g._ghostHit : 0; row.ghost.gfx = g ? g._ghostFx : null; row.ghost.hp = g ? g._ghostHp : 0;
        row.ghost.haste = g ? g._hasteT > 0 : false; row.ghost.drift = g ? !!g._ghostDrift && g.slowed > 0 : false;
        if(g) oneGhostDown(g, true);
        out[t] = row;
      });
      return out;`);
    for (const k of ['moonrocks', 'eyelasers', 'hands', 'orbitkick']) {
      const [a, b, c] = [r[1][k], r[2][k], r[3][k]];
      expect(b.n, `${k}: more shots at tier 2`).toBeGreaterThan(a.n);
      expect(c.n, `${k}: more again at tier 3`).toBeGreaterThan(b.n);
      expect(b.spd, `${k}: faster at tier 2`).toBeGreaterThan(a.spd);
      expect(c.spd, `${k}: faster again at tier 3`).toBeGreaterThan(b.spd);
      expect(c.dmg, `${k}: harder at tier 3`).toBeGreaterThan(a.dmg);
      expect(c.fx, `${k}: a different effect at the top`).not.toBe(a.fx);
    }
    expect([r[1].moonrocks.n, r[2].moonrocks.n, r[3].moonrocks.n]).toEqual([3, 5, 7]);
    expect([r[1].eyelasers.n, r[2].eyelasers.n, r[3].eyelasers.n], 'a pair, two pairs, then a flurry').toEqual([2, 4, 18]);
    expect([r[1].hands.n, r[2].hands.n, r[3].hands.n], 'hands under the fighter').toEqual([1, 3, 5]);
    expect([r[1].orbitkick.n, r[2].orbitkick.n, r[3].orbitkick.n], 'planets kicked out of orbit').toEqual([1, 2, 3]);
    expect([r[1].ghost.n, r[2].ghost.n, r[3].ghost.n], 'ghost-fire with it').toEqual([0, 4, 8]);
    expect([r[1].ghost.hp, r[2].ghost.hp, r[3].ghost.hp], 'always one ghost with 100 HP').toEqual([100, 100, 100]);
    expect(r[3].ghost.hit).toBeGreaterThan(r[1].ghost.hit);
    expect(r[1].ghost.gfx).toBe(null);
    expect(r[3].ghost.gfx).not.toBe(null);
    expect([r[1].ghost.drift, r[2].ghost.drift, r[3].ghost.drift], 'it drifts at tier 1').toEqual([true, false, false]);
    expect([r[1].ghost.haste, r[2].ghost.haste, r[3].ghost.haste], 'and is hasted at tier 3').toEqual([false, false, true]);
  });

  it('eye lasers track you, then lock: the bolts go where you were at the lock', () => {
    const r = fight(['Firey'], { story: true }, `
      one._atkTimer = 1e9; one._spTier.eyelasers = 1; for (var w=0; w<20; w++) step();
      you.controller = 'still'; one.x = you.x + 400; one.y = you.y - 40;
      one._telKind = 'eyelasers'; one._tel = ONE_TEL.eyelasers; projectiles = [];
      var lockAt = null;
      while (one._tel > 0){
        you.x += 4;
        var before = one._tel; updateOne(one, you);
        if (lockAt===null && one._tel <= ONE_SPECIAL_TIERS.eyelasers[0].lock) lockAt = { x: you.x, aim: one._aimX };
        if (one._tel <= 3) you.x += 30;
      }
      var bolts = projectiles.filter(function(p){ return p.shape==='onelaser'; });
      var aimErr = bolts.map(function(p){ var t = (lockAt.aim - p.x)/p.vx; return Math.abs(p.y + p.vy*t - one._aimY); });
      return { lock: lockAt, aimNow: one._aimX, youNow: you.x, bolts: bolts.length, err: Math.max.apply(null, aimErr) };`);
    expect(r.bolts).toBe(2);
    expect(r.aimNow, 'the aim stopped following once it locked').toBe(r.lock.aim);
    expect(r.youNow - r.aimNow, 'so stepping off the line after the lock is the dodge').toBeGreaterThan(60);
    expect(r.err).toBeLessThan(1);
  });

  it('hands come up through the surface you stand on, not the floor, and drag you under', () => {
    const r = fight(['Firey'], { story: true }, `
      one._atkTimer = 1e9; one._spTier.hands = 2; for (var w=0; w<10; w++) step();
      var floor = worldPlats.filter(function(p){ return p.solid; })[0];
      var p = worldPlats.filter(function(q){ return !q.solid && q.y < floor.y - 200 && q.w > 150; })[0];
      you.controller = 'still'; you.x = p.x + p.w/2; you.y = p.y - you.r - 1; you.vx = 0; you.vy = 0;
      for (var i=0;i<5;i++){ one.x = you.x + 500; step(); }
      one._handSpots = [{ x: you.x, y: oneSurf(you.x, feetY(you) - 4) }];
      projectiles = []; you.pct = 0; you.invuln = 0;
      ONE_MOVES.hands(one, you, ++BOSS_ATK_ID);
      var hands = projectiles.filter(function(q){ return q.shape==='onehand'; });
      var baseY = hands[0].y;
      for (var j=0;j<3;j++){ one.x = you.x + 500; step(); }
      return { baseY: baseY, platY: p.y, floorY: floor.y, n: hands.length, pct: you.pct, rooted: you.rooted };`);
    expect(r.n).toBe(3);
    expect(r.baseY, 'out of the platform you are on').toBeCloseTo(r.platY + 8, 0);
    expect(r.baseY).toBeLessThan(r.floorY - 100);
    expect(r.pct).toBeGreaterThan(0);
    expect(r.rooted, 'dragged under: rooted').toBeGreaterThan(0);
  });

  it('Out of Orbit kicks down the marked lane only, then the planets fly on', () => {
    const r = fight(['Firey', 'Leafy'], {}, `
      one._atkTimer = 1e9; one._spTier.orbitkick = 1; for (var w=0; w<10; w++) step();
      var B = fighters[1];
      one.x = WW*0.5; one.y = groundY() - 150;
      you.x = one.x + 150; B.x = one.x - 220;
      [you, B].forEach(function(f){ f.pct = 0; f.invuln = 0; f.vx = 0; f.y = one.y + 20; });
      one._telDir = 1; one._kickY = hurtCY(you); projectiles = [];
      ONE_MOVES.orbitkick(one, you, ++BOSS_ATK_ID);
      return { you: you.pct, youVx: you.vx, behind: B.pct, planets: projectiles.filter(function(p){ return p.shape==='oneplanet'; }).map(function(p){ return p.vx; }) };`);
    expect(r.you).toBe(33);
    expect(r.youVx, 'sent the way she kicked').toBeGreaterThan(0);
    expect(r.behind, 'nobody behind her').toBe(0);
    expect(r.planets.length).toBe(1);
    expect(r.planets[0]).toBeGreaterThan(0);
  });
});

describe('special 5: one ghost fighter with 100 HP, and One takes nothing until it dies', () => {
  it('summons exactly one real fighter on her side, and shields her on every damage path', () => {
    const r = fight(['Firey', 'Leafy'], {}, `
      one._atkTimer = 1e9; for (var w=0; w<10; w++) step();
      var n0 = fighters.length;
      ONE_MOVES.ghost(one, you, ++BOSS_ATK_ID);
      var g = fighters[fighters.length - 1];
      var out = { added: fighters.length - n0, ghost: !!g._oneGhost, team: g.team, hp: g._ghostHp, ai: g.controller, idx: g.idx === fighters.length - 1,
        erased: ONE_GHOST_POOL.indexOf(g.name) >= 0 };
      ONE_MOVES.ghost(one, you, ++BOSS_ATK_ID); out.second = fighters.length - n0;
      var hp0 = one.hp;
      damageSummons(you, one.x, one.y, 10, 20); out.melee = hp0 - one.hp;
      projectiles = [{ owner:0, ownerObj:you, x:one.x, y:one.y, vx:0, vy:0, dmg:20, kb:5, r:10, life:10 }]; step(); out.shot = hp0 - one.hp;
      you._dashing = 5; you._dashDmg = 20; you.x = one.x - 10; you.y = one.y; step(); out.dash = hp0 - one.hp;
      you._dashing = 0; you.x = one.x - 600; you.y = groundY() - 60; you.vx = 0; you.vy = 0;
      out.chain = chainBoltBoss(one, 8);
      // the ghost is on her side: her shots pass through it, it cannot hurt her, and its hits land on you
      g.invuln = 0; projectiles = []; addProj(oneShot(one, { x:g.x, y:g.y, vx:0, vy:0, life:5, bossAtk:++BOSS_ATK_ID })); step();
      out.ghostSafe = g._ghostHp;
      var hp1 = one.hp; damageSummons(g, one.x, one.y, 10, 20); out.ghostOnOne = hp1 - one.hp;
      you.pct = 0; you.invuln = 0; applyHit(you, 10, 1, -1, g); out.onYou = you.pct;
      // an ally goes for the ghost first
      var ally = fighters[1]; ally.aiTarget = null; ally.aiTimer = 0; aiThink(ally); out.allyTarget = ally.aiTarget === g;
      // 100 HP and it is gone; then she can be hurt again. With an ally beside you each hit on it counts for 1/1.6, as
      // every hit on her does (the review: its 100 did not scale with allies, so it was no shield for a full side), so
      // two 60s leave it standing on 25 and a third finishes it.
      g.invuln = 0; applyHit(g, 60, 1, -1, you); g.invuln = 0; applyHit(g, 60, 1, -1, you);
      out.twoHits = { dead: g.dead, hp: g._ghostHp };
      g.invuln = 0; applyHit(g, 60, 1, -1, you);
      out.dead = g.dead; out.cleared = one._ghost === null;
      var hp2 = one.hp; damageSummons(you, one.x, one.y, 10, 20); out.after = hp2 - one.hp;
      return out;`);
    expect(r.added).toBe(1);
    expect(r.ghost && r.ai === 'ai' && r.idx).toBe(true);
    expect(r.team, "One's side").toBe(-1);
    expect(r.hp).toBe(100);
    expect(r.erased, 'a ghost of someone she erased from the timeline').toBe(true);
    expect(r.second, 'one ghost fighter, never two').toBe(1);
    expect([r.melee, r.shot, r.dash, r.chain], 'melee, shots, dashes and the Chain Bolt all do nothing').toEqual([0, 0, 0, 0]);
    expect(r.ghostSafe).toBe(100);
    expect(r.ghostOnOne).toBe(0);
    expect(r.onYou).toBeGreaterThan(0);
    expect(r.allyTarget).toBe(true);
    expect(r.twoHits.dead).toBe(false);
    expect(r.twoHits.hp).toBeCloseTo(100 - 120 / 1.6, 6);
    expect(r.dead && r.cleared).toBe(true);
    expect(r.after, 'damage lands again once it is dead').toBeCloseTo(20 / 1.6, 6);
  });

  it('a knockout kills it too, and costs nobody a stock', () => {
    const r = fight(['Firey'], { story: true }, `
      one._atkTimer = 1e9;
      ONE_MOVES.ghost(one, you, ++BOSS_ATK_ID);
      var g = one._ghost, stocks = you.stocks;
      g.x = -500; step();
      return { dead: g.dead, cleared: one._ghost === null, stocks: you.stocks === stocks, active: ONEFIGHT.active, running: running };`);
    expect(r).toEqual({ dead: true, cleared: true, stocks: true, active: true, running: true });
  });
});

describe('she follows you, and teleports when you are very far', () => {
  it('outruns a fighter running away, stops pushing once close, and teleports beside you from far off', () => {
    const r = fight(['Firey'], { story: true }, `
      one._atkTimer = 1e9; you.controller = 'still';
      one.x = WW*0.5; one.y = groundY() - 150; one.vx = 0;
      you.x = one.x - 700; you.y = groundY() - 24;
      var x0 = one.x; for (var i=0;i<30;i++) updateOne(one, you);
      var chase = { moved: x0 - one.x, vx: one.vx };
      one.x = you.x + 60; one.vx = -2; for (var j=0;j<20;j++) updateOne(one, you);
      var close = Math.abs(one.vx);
      one._telKind = 'ring'; one._tel = 100; one._teleCd = 0; one._farT = 0; one.x = WW*0.5; you.x = one.x - 1500;
      for (var k=0;k<40;k++) updateOne(one, you);
      var busy = Math.abs(one.x - you.x);
      one._tel = 0; one._telKind = null; one._farT = 0; one.x = WW*0.5; you.x = one.x - 1500; one.vx = 0;
      var frames = 0; while (Math.abs(one.x - you.x) > 400 && frames < 60){ updateOne(one, you); frames++; }
      return { chase: chase, maxvx: MAXVX, close: close, busy: busy, frames: frames, gap: Math.abs(one.x - you.x), cd: one._teleCd };`);
    expect(r.chase.moved, 'she closed in').toBeGreaterThan(150);
    expect(Math.abs(r.chase.vx), 'faster than a fighter can run').toBeGreaterThan(r.maxvx);
    expect(r.close, 'no kiting: you can walk into her').toBeLessThan(1);
    expect(r.busy, 'never mid wind-up').toBeGreaterThan(1000);
    expect(r.frames, 'half a second of being very far').toBe(30);
    expect(r.gap).toBeCloseTo(300, 0);
    expect(r.cd).toBeGreaterThan(0);
  });
});

describe("Lightning's Chain Bolt hits bosses everywhere", () => {
  it('links into a Boss Rush boss in front of her, turns round for one behind, and respects the shields', () => {
    const r = W.eval(`(function(){
      go('title'); SETTINGS.mode='boss'; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var L = makeFighter(ROSTER.find(function(x){ return x.name==='Lightning'; }), 400, groundY()-24, 0);
      L.team=0; L.face=1; L.controller='still'; fighters=[L];
      var four = { type:'boss', name:'Four', attack:'four', team:-1, x:600, y:groundY()-95, r:95, hp:340, maxHp:340 };
      summons=[four]; L.spCd=0; doSpecial(L); var front = 340 - four.hp;
      four.hp=340; four.x=150; L.spCd=0; doSpecial(L); var behind = 340 - four.hp;
      four.hp=340; four.x=1400; L.spCd=0; doSpecial(L); var far = 340 - four.hp;
      var two = { type:'boss', name:'Two', attack:'two', team:-1, x:600, y:groundY()-70, r:70, hp:285, maxHp:285, _ungrounded:true, _grounded:false };
      summons=[two]; L.spCd=0; doSpecial(L); var ungrounded = 285 - two.hp;
      running=false; summons=[]; SETTINGS.mode='ffa';
      return { front:front, behind:behind, far:far, ungrounded:ungrounded };
    })()`);
    expect(r.front, 'it used to fizzle on every boss').toBe(8);
    expect(r.behind).toBe(8);
    expect(r.far, 'still a reach, not a screen').toBe(0);
    expect(r.ungrounded, "Two's Power Ungrounded blocks it as it blocks a punch").toBe(0);
  });

  it('links into One', () => {
    const r = fight(['Lightning'], { story: true }, `
      one._atkTimer = 1e9; for (var w=0; w<10; w++) step();
      one.x = you.x + 200; one.y = you.y; you.face = 1; you.spCd = 0; var hp0 = one.hp;
      doSpecial(you);
      return hp0 - one.hp;`);
    expect(r).toBe(8);
  });
});

describe('winning and losing', () => {
  it('shatters over sixty frames, then wins: never a Boss Rush clear, and the chain is told', () => {
    const r = fight(['Firey'], { story: true }, `
      var rush = JSON.stringify(BOSSRUSH);
      one._atkTimer = 1e9; one.hp = 0;
      var frames = 0; while (running && frames < 200){ step(); frames++; }
      return { won: ONEFIGHT.won, over: ONEFIGHT.over, frames: frames, told: window.__oneEnd, rush: JSON.stringify(BOSSRUSH) === rush,
        cleared: !!(PROFILE && PROFILE.bossesCleared && PROFILE.bossesCleared.One), result: ONEFIGHT.result, gone: !summons.some(function(s){ return s._oneFight; }) };`);
    expect(r.won && r.over).toBe(true);
    expect(r.frames, 'her value flickers and crumbles first (TPOT 25)').toBeGreaterThanOrEqual(60);
    expect(r.told).toBe(true);
    expect(r.rush).toBe(true);
    expect(r.cleared, 'not a Boss Rush boss').toBe(false);
    expect(r.result.won).toBe(true);
    expect(r.result.lineup).toEqual(['Firey']);
    expect(r.gone).toBe(true);
  });

  it('a loss can be retried directly: Rematch fights her again with the same lineup', () => {
    const r = fight(['Lightning'], { story: true }, `
      one._atkTimer = 1e9; you.stocks = 1; eliminate(you); step();
      var lost = { over: ONEFIGHT.over, won: ONEFIGHT.won, told: window.__oneEnd, running: running, hpLeft: ONEFIGHT.result.hpLeft };
      startMatch();
      var again = summons.find(function(s){ return s._oneFight; });
      return { lost: lost, active: ONEFIGHT.active, story: ONEFIGHT.story, names: fighters.map(function(f){ return f.name; }), hp: again && again.hp, alive: !fighters[0].dead };`);
    expect(r.lost).toEqual({ over: true, won: false, told: false, running: false, hpLeft: 2000 });
    expect(r.active && r.story && r.alive).toBe(true);
    expect(r.names).toEqual(['Lightning']);
    expect(r.hp).toBe(2000);
  });
});

describe('the whole fight, headless', () => {
  it('runs a long AI-driven fight through every kind of move without a single error, and draws every tell', () => {
    const r = fight(['Lightning', 'Firey'], {}, `
      fighters.forEach(function(f){ f.controller = 'ai'; });
      var kinds = {}, err = null, drawErr = null, maxShots = 0;
      for (var i=0; i<5400 && running; i++){
        try { step(); } catch(e){ err = String(e && e.stack || e); break; }
        if (one._telKind) kinds[one._telKind] = 1;
        if (one._tel > 0 && i % 7 === 0){ try { drawOneFx(); drawOneBar(); ctx.save(); ctx.translate(one.x, one.y); drawBossSprite(one); ctx.restore(); } catch(e){ drawErr = String(e && e.stack || e); } }
        maxShots = Math.max(maxShots, projectiles.filter(function(p){ return p.owner===-2; }).length);
        if (one._ghost && !one._ghost.dead && i % 11 === 0){ try { drawOneGhostAura(one._ghost); drawFighter(one._ghost); } catch(e){ drawErr = String(e && e.stack || e); } }
      }
      try { drawArenaDecor('onemoon'); } catch(e){ drawErr = String(e && e.stack || e); }
      return { err: err, drawErr: drawErr, kinds: Object.keys(kinds), loopErr: !!window.__loopErrLogged, maxShots: maxShots,
        hp: Math.round(one.hp), frames: ONEFIGHT.frames };`);
    expect(r.err).toBe(null);
    expect(r.drawErr).toBe(null);
    expect(r.kinds.length, 'most of her moves came out').toBeGreaterThan(8);
    expect(r.maxShots).toBeGreaterThan(0);
  }, 120000);
});

// THE ADVERSARIAL REVIEW'S FINDINGS ON HER FIGHT, each pinned where it was found.
describe("the review's fixes to her fight", () => {
  it('the Chain Bolt goes the way Lightning faces: a boss in front takes the first link over a foe behind', () => {
    // G28 is "the first link goes the way she is facing". The fighters' any-direction fallback used to run before the boss
    // pass, so Firey 60px behind took the link while Four stood 220px in front (the review's probe).
    const r = W.eval(`(function(){
      go('title'); SETTINGS.mode='ffa'; running=true;
      worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
      var L = makeFighter(ROSTER.find(function(x){ return x.name==='Lightning'; }), 400, groundY()-24, 0);
      var F = makeFighter(ROSTER.find(function(x){ return x.name==='Firey'; }), 340, groundY()-24, 1);
      L.team=0; F.team=1; L.face=1; [L,F].forEach(function(f){ f.controller='still'; f.invuln=0; f.pct=0; }); fighters=[L,F];
      var four = { type:'boss', name:'Four', attack:'four', team:-1, x:620, y:groundY()-95, r:95, hp:340, maxHp:340 };
      summons=[four]; L.spCd=0; doSpecial(L);
      var out = { four: 340 - four.hp, firey: F.pct };
      summons=[]; F.pct=0; F.invuln=0; L.spCd=0; doSpecial(L); out.turned = F.pct;
      running=false; summons=[]; fighters=[]; SETTINGS.mode='ffa';
      return out; })()`);
    expect(r.four, 'Four, in front, took the first link').toBe(8);
    expect(r.firey, 'Firey, behind her, was never the first link').toBe(0);
    expect(r.turned, 'with nothing in front it still turns round for the foe behind').toBeGreaterThan(0);
  });

  it('...and One in front takes the first link over her own ghost behind', () => {
    const r = fight(['Lightning'], { story: true }, `
      one._atkTimer = 1e9; for (var w=0; w<10; w++) step();
      ONE_MOVES.ghost(one, you, ++BOSS_ATK_ID);
      var g = one._ghost; g.invuln = 0; g.controller = 'still';
      you.face = 1; one.x = you.x + 200; one.y = you.y; g.x = you.x - 40; g.y = you.y; g.vx = 0; g.vy = 0;
      var order = [], ah = applyHit, cb = chainBoltBoss;
      applyHit = function(t){ order.push(t._oneGhost ? 'ghost' : t.name); return ah.apply(this, arguments); };
      chainBoltBoss = function(s){ order.push(s.name); return cb.apply(this, arguments); };
      try { you.spCd = 0; doSpecial(you); } finally { applyHit = ah; chainBoltBoss = cb; }
      return order;`);
    expect(r[0], 'the first link goes the way she faces').toBe('One');
  });

  it('R mid-fight starts her from the top: her 2000, the clock, and the time on the result', () => {
    // The keydown handler calls startMatch while running; it used to respawn her at 2000 with the clock still counting,
    // so the abandoned attempt went into "She shattered in m:ss" and the best time.
    const r = fight(['Lightning'], { story: true }, `
      one._atkTimer = 1e9; for (var i=0; i<601; i++) step();
      one.hp = 1500; var before = ONEFIGHT.frames;
      window.dispatchEvent(new KeyboardEvent('keydown', { code:'KeyR' }));
      var again = summons.find(function(s){ return s._oneFight; }); again._atkTimer = 1e9;
      for (var j=0; j<120; j++) step();
      var mid = { frames: ONEFIGHT.frames, hp: again.hp, fresh: again !== one, story: ONEFIGHT.story, active: ONEFIGHT.active,
        names: fighters.map(function(f){ return f.name; }), stocks: fighters[0].stocks };
      again.hp = 0; var k = 0; while (running && k < 200){ step(); k++; }
      return { before: before, mid: mid, k: k, won: ONEFIGHT.won, secs: ONEFIGHT.result && ONEFIGHT.result.secs };`);
    // (the fight's first frame is counted as it starts, so 601 steps read 602: the same one frame after R)
    const lead = r.before - 601;
    expect(lead).toBeLessThanOrEqual(1);
    expect(r.mid).toEqual({ frames: 120 + lead, hp: 2000, fresh: true, story: true, active: true, names: ['Lightning'], stocks: 3 });
    expect(r.won).toBe(true);
    expect(r.secs, 'the result times the fight that was won, not the one before R').toBe(Math.round((120 + lead + r.k) / 60));
  });

  it('chases and teleports toward YOU, not the ally standing beside her; with no human left, the nearest', () => {
    // "one follows you if you try to run away" / "one can teleport if you are very far". updateSummons hands a boss the
    // NEAREST fighter, so with an ally 200px from her and you 1400px away she sat by the ally (the review's probe).
    const r = fight(['Firey', 'Leafy'], {}, `
      one._atkTimer = 1e9; var ally = fighters[1];
      [you, ally].forEach(function(f){ f.controller = 'still'; });
      var x0 = WW*0.5; one.x = x0; one.y = groundY() - 150; one.vx = 0; one._teleCd = 0; one._farT = 0;
      var tele = false;
      for (var i=0; i<120; i++){ ally.x = x0 + 200; you.x = x0 - 1400; ally.vx = 0; you.vx = 0; step(); if (one._teleCd > 0) tele = true; }
      var toYou = Math.abs(one.x - you.x), toAlly = Math.abs(one.x - ally.x);
      you.dead = true; var nearest = oneChaseTarget(one, ally) === ally; you.dead = false;
      return { tele: tele, toYou: toYou, toAlly: toAlly, nearest: nearest };`);
    expect(r.tele, 'she teleported').toBe(true);
    expect(r.toYou, 'to you').toBeLessThan(500);
    expect(r.toAlly, 'and left the ally behind').toBeGreaterThan(900);
    expect(r.nearest).toBe(true);
  });

  it('the story fight is the same for everyone: three stocks and no items, whatever the match settings', () => {
    // It inherited SETTINGS.stocks and itemRate: one stock, or heals and invincibility stars, by the player's own settings.
    const r = W.eval(`(function(){
      SETTINGS.stocks = 1; SETTINGS.itemRate = 3; LOCAL_PLAYERS = 1;
      startOneFight(['Lightning'], { story:true, onEnd:function(){ return true; } });
      var one = summons.find(function(s){ return s._oneFight; }); one._atkTimer = 1e9;
      var story = { stocks: fighters[0].stocks, every: itemSpawnInterval() };
      for (var i=0; i<900; i++) step();
      story.items = items.length;
      running = false;
      startOneFight(['Lightning', 'Firey'], { onEnd:function(){ return true; } });
      var free = { stocks: fighters[0].stocks, every: itemSpawnInterval() };
      running = false; SETTINGS.stocks = 3; SETTINGS.itemRate = 0;
      return { story: story, free: free }; })()`);
    expect(r.story).toEqual({ stocks: 3, every: 0, items: 0 });
    expect(r.free.stocks, 'once she is unlocked, your own settings').toBe(1);
    expect(r.free.every).toBeGreaterThan(0);
  });

  it('burn and bleed wear down the ghost\'s 100 HP too', () => {
    // Damage over time adds to pct without passing through applyHit, so 600 frames of burn and bleed on it came to +63%
    // and 0 HP (the review's probe), and Firey, Match, Pencil and Gelatin could not break the shield with it.
    const r = fight(['Firey'], { story: true }, `
      one._atkTimer = 1e9;
      ONE_MOVES.ghost(one, you, ++BOSS_ATK_ID);
      var g = one._ghost; g.controller = 'still'; you.controller = 'still'; you.x = g.x - 600;
      var p0 = g.pct; g.burn = 600; g.bleed = 600;
      for (var i=0; i<300 && !g.dead; i++) step();
      return { gained: g.pct - p0, hp: g._ghostHp, dead: g.dead };`);
    expect(r.gained).toBeGreaterThan(5);
    expect(r.hp, 'every point of it').toBeCloseTo(100 - r.gained, 6);
  });

  it('nothing turns her ghost: a possession or an outbreak changes neither its side nor its shield', () => {
    // Bow's special and Barf Bag's Outbreak switch a fighter's team for a while. On the ghost that made your side's hits on
    // it friendly fire (so she stayed shielded) and let her own shots hurt it.
    const r = fight(['Bow'], {}, `
      one._atkTimer = 1e9;
      ONE_MOVES.ghost(one, you, ++BOSS_ATK_ID);
      var g = one._ghost; g.controller = 'still'; g.invuln = 0;
      you.controller = 'still'; you.x = g.x - 60; you.y = g.y; you.face = 1; you.spCd = 0;
      doSpecial(you);
      var after = { team: g.team, infected: g._infected };
      g.team = 0; g._infected = 99; g._origTeam = 0;
      var set = { team: g.team, infected: g._infected };
      var hp0 = g._ghostHp; g.invuln = 0; applyHit(g, 20, 1, -1, you); var hurt = hp0 - g._ghostHp;
      var hp1 = g._ghostHp; g.invuln = 0; projectiles = [];
      addProj(oneShot(one, { x:g.x, y:g.y, vx:0, vy:0, life:5, bossAtk:++BOSS_ATK_ID })); step();
      return { after: after, set: set, hurt: hurt, ownShot: hp1 - g._ghostHp };`);
    expect(r.after, 'after her special').toEqual({ team: -1, infected: 0 });
    expect(r.set, 'set directly').toEqual({ team: -1, infected: 0 });
    expect(r.hurt, 'your hits still break it').toBeGreaterThan(0);
    expect(r.ownShot, 'her shots still pass through it').toBe(0);
  });

  it('Power Drain heals her scaled like every hit on her, so allies never make it out-heal the fight', () => {
    // It healed the raw 2.8x of what it drained while every hit on her was divided by the allies (_dmgTakenMult): with
    // five fighters one drain restored up to 350 effective HP.
    const drain = (lineup) => fight(lineup, {}, `
      one._atkTimer = 1e9; for (var w=0; w<5; w++) step();
      one.hp = 1700; one.x = WW*0.5; one.y = groundY() - 150;
      fighters.forEach(function(f, i){ f.x = one.x - 60 + i*30; f.y = groundY() - 24; f.vx = 0; f.vy = 0; f.invuln = 0; });
      var h0 = one.hp; ONE_MOVES.mindread(one, null, ++BOSS_ATK_ID);
      return { healed: one.hp - h0, mult: one._dmgTakenMult };`);
    const solo = drain(['Firey']);
    const four = drain(['Firey', 'Leafy', 'Bubble', 'Pencil']);
    expect(solo.healed, "Two's share of the drain on a 2000 bar: 2.8x the 9 it took").toBe(Math.round(9 * 2.8));
    expect(four.mult).toBeCloseTo(1 / 2.8, 6);
    expect(four.healed, 'four drained, scaled like the hits').toBe(Math.round(36 * 2.8 * four.mult));
  });

  it('each phase line she crosses heals your side and hands back a lost stock, never past the stocks you started with', () => {
    const r = fight(['Lightning'], { story: true }, `
      one._atkTimer = 1e9;
      you.pct = 100; you.stocks = 2; one.hp = 1490; step();
      var first = { pct: you.pct, stocks: you.stocks, marks: one._marks };
      you.pct = 30; one.hp = 990; step();
      return { first: first, second: { pct: you.pct, stocks: you.stocks, marks: one._marks } };`);
    expect(r.first.pct).toBeCloseTo(100 - 64, 0);
    expect([r.first.stocks, r.first.marks]).toEqual([3, 1]);
    expect(r.second, 'three was the start: no fourth').toEqual({ pct: 0, stocks: 3, marks: 2 });
  });

  it('keeps the teams map\'s own floating platforms, every one where the teams builder laid it', () => {
    // "keep the platforms": it used to throw the teams map away and scatter a new field, dropping its spawn pads, doorway
    // steps and shaft rungs. Now the real teams builder runs and only its walls and home ledges are taken away.
    const r = fight(['Lightning'], { story: true }, `
      var tm = oneTeamsMap, laid = null;
      oneTeamsMap = function(){ tm(); laid = worldPlats.filter(function(p){ return !p.solid; }).map(function(p){ return [p.x, p.y, p.w]; }); };
      try { buildOneArena(); } finally { oneTeamsMap = tm; }
      var have = worldPlats.filter(function(p){ return !p.solid; });
      var missing = laid.filter(function(q){ return !have.some(function(p){ return p.x===q[0] && p.y===q[1] && p.w===q[2]; }); }).length;
      return { laid: laid.length, missing: missing, solids: worldPlats.filter(function(p){ return p.solid; }).length };`);
    expect(r.laid).toBeGreaterThan(10);
    expect(r.missing).toBe(0);
    expect(r.solids, 'the floor alone').toBe(1);
  });

  it("her result screen never shows a fighter's victory line left from an earlier win", async () => {
    const r = W.eval(`(function(){
      go('title'); SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.itemRate=0; chosen = ROSTER.find(function(x){ return x.name==='Firey'; });
      startMatch(); running = false;
      var you = fighters.find(function(f){ return f.you; });
      showResult([you], you.team);
      var q = document.getElementById('resultQuip'), won = q.style.display;
      startOneFight(['Lightning'], { story:true, onEnd:function(){ return true; } });
      var one = summons.find(function(s){ return s._oneFight; }); one._atkTimer = 1e9;
      fighters[0].stocks = 1; eliminate(fighters[0]); step();
      return { won: won, after: q.style.display, text: q.textContent, title: document.getElementById('resultTitle').textContent }; })()`);
    expect(r.won, 'the win showed its quip').toBe('block');
    expect(r).toMatchObject({ after: 'none', text: '', title: 'One wins' });
    W.eval(`go('title')`);
  });
});

// The whole draw() of her fight. bootMonolith's canvas returns nothing from createLinearGradient, so draw() threw at the
// sky before it ever reached her tells or her bar, and the suite only ever called those sub-draws by hand.
describe('the whole fight, drawn', () => {
  it('draw() runs through a long AI fight, her tells, her bar and her ghost included, without an error', async () => {
    const dom = new JSDOM(readFileSync('artifacts/V1/index.html', 'utf8'), {
      url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
      beforeParse(window) {
        const grad = { addColorStop() {} };
        window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
          get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 })
            : p === 'canvas' ? { width: 1100, height: 720 }
            : p === 'getImageData' ? () => ({ data: [] })
            : (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createPattern') ? () => grad : () => {}),
          set: () => true,
        });
        window.Math.random = mulberry32(11);
        window.requestAnimationFrame = () => 0;
        window.cancelAnimationFrame = () => {};
      },
    });
    const w = dom.window;
    await w.eval('profileReady');
    const r = w.eval(`(function(){
      SETTINGS.itemRate = 0; SETTINGS.stocks = 3; LOCAL_PLAYERS = 1;
      startOneFight(['Lightning', 'Firey'], { onEnd:function(){ return true; } });
      var one = summons.find(function(s){ return s._oneFight; });
      fighters.forEach(function(f){ f.controller = 'ai'; });
      var n = { fx:0, bar:0 }, fx = drawOneFx, bar = drawOneBar;
      drawOneFx = function(){ n.fx++; return fx.apply(this, arguments); };
      drawOneBar = function(){ n.bar++; return bar.apply(this, arguments); };
      var err = null, draws = 0, ghost = 0, tells = 0;
      for (var i = 0; i < 3000 && running; i++){
        try {
          step();
          if (i % 3 === 0){ draw(); draws++; if (one._ghost && !one._ghost.dead) ghost++; if (one._tel > 0) tells++; }
        } catch(e){ err = String(e && e.stack || e); break; }
      }
      drawOneFx = fx; drawOneBar = bar; running = false;
      return { err: err, draws: draws, n: n, ghost: ghost, tells: tells, loopErr: !!window.__loopErrLogged };
    })()`);
    expect(r.err).toBe(null);
    expect(r.loopErr).toBe(false);
    expect(r.draws).toBeGreaterThan(500);
    expect(r.n.fx, 'every draw reached her tells').toBe(r.draws);
    expect(r.n.bar, '...and her bar').toBe(r.draws);
    expect(r.tells, 'with wind-ups on screen').toBeGreaterThan(20);
    expect(r.ghost, 'and her ghost').toBeGreaterThan(0);
  }, 120000);
});
