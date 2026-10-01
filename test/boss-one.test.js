import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';
import { mulberry32 } from './helpers/prng.js';

// ONE, rebuilt in the boss overhaul (2026-09-30): "give the attacks a twist" -- a play on words: each attack gets a change, a specialty, and "the
// twists should occur at tier 2, and get stronger at tier 3" (off at tier 1) -- INCOMING! became FOLDING ISLAND! ("it could be a floor-based
// attack as well. if your standing on the floor, its the floor, and on a platform, its the 3 closest platforms and the one your one.") and
// SEEKERS! became KNIFE FLURRY! ("2, but homing."), HANDS FROM THE GROUND! got "2, 3, and they move faster", and then "one could be harder...
// much harder. more bullets! also longer attacks. contact damage." -- "Same damage per hit", contact "Evil leafy level.", "also, no stock per
// phase." -- and "make one and cobs get the same animation treatement as the others." This file reads each of those over a whole move: the
// twist (off, on, stronger), the swaps, the hands, the bullets and the length, the damage that did not move, the contact, the heavy hits, her
// arena, her Vortex hop, her art, her ending. (test/one-boss.test.js is the fight itself, test/one-winnable.test.js that she can be beaten.)

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// Her story fight, the way the unlock chain starts it, with the opening Vortex hop already over (the fight opens with it, oneHopStep), her
// attack clock held, you a still Firey on the floor with stocks to spare. `body` runs inside, with one, you, run(n), spots() and fresh().
const STAGE = (body) => W.eval(`(function(){
  SETTINGS.itemRate = 0; SETTINGS.stocks = 99; LOCAL_PLAYERS = 1; window.__oneEnd = undefined;
  startOneFight(['Firey'], { story:true, onEnd:function(won){ window.__oneEnd = won; return true; } });
  var one = summons.find(function(s){ return s._oneFight; }), you = fighters[0];
  one._hop = null; one._hopPending = false; one.r = one._baseR; one._atkTimer = 1e9; one._introT = 0; one._q = [];
  you.controller = 'still'; you.stocks = 99; you.x = WW*0.5; you.y = groundY() - 24; you.vx = 0; you.vy = 0;
  for (var w=0; w<3; w++) step();
  var setTier = function(t){ one._marks = t - 1; ONE_SPECIALS.forEach(function(k){ one._spTier[k] = t; }); };
  // frames, with her clock held and you unhurt (a test that wants a hit reads you.pct before the frame resets it)
  var run = function(n, each){ for (var i=0;i<n;i++){ one._atkTimer = 1e9; if (each) each(i); step(); } };
  var fresh = function(){ projectiles = []; oneFx.length = 0; one._q = []; one._ash = []; you.pct = 0; you.invuln = 0; you.hitstun = 0; you.slowed = 0; you.vx = 0; you.vy = 0; you.x = WW*0.5; you.y = groundY() - you.r; one.x = you.x + 650; one.y = groundY() - 330; one.vx = 0; one.vy = 0; one._tel = 0; one._telKind = null; one._orbitA = null; one._steerUntil = 0; };
  var own = function(){ return projectiles.filter(function(p){ return p.owner === -2; }); };
  ${body}
})()`);

describe('the kit: tier tables for all thirteen, and every twist off at tier 1, on at 2, stronger at 3', () => {
  it('the eight she inherited have three-row tier tables, read by her phase; her five specials keep theirs, read by their own tier', () => {
    const r = STAGE(`
      var s = { _marks:0, _spTier:{ moonrocks:2, eyelasers:3, hands:1, orbitkick:2, ghost:1 } };
      var rows = {};
      ONE_DECK.forEach(function(k){ rows[k] = [0,1,2].map(function(m){ s._marks = m; return oneTier(s, k) === ONE_DECK_TIERS[k][m] && oneTierN(s, k) === m + 1; }); });
      s._marks = 0;
      return { deck: ONE_DECK.slice(), tables: Object.keys(ONE_DECK_TIERS).sort(), lens: ONE_DECK.map(function(k){ return ONE_DECK_TIERS[k].length; }), rows: rows,
        spec: ONE_SPECIALS.map(function(k){ return [oneTierN(s, k), oneTier(s, k) === ONE_SPECIAL_TIERS[k][s._spTier[k] - 1]]; }),
        names: [ONE_MOVE_NAME.fold, ONE_MOVE_NAME.knives, ONE_MOVE_NAME.rain, ONE_MOVE_NAME.seekers] };`);
    expect(r.deck).toEqual(['zap', 'screechy', 'mindread', 'fold', 'knives', 'ring', 'sizeshift', 'ungrounded']);
    expect(r.tables).toEqual([...r.deck].sort());
    expect(r.lens, 'three tiers each').toEqual([3, 3, 3, 3, 3, 3, 3, 3]);
    for (const k of r.deck) expect(r.rows[k], `${k}: tier = phase`).toEqual([true, true, true]);
    expect(r.spec).toEqual([[2, true], [3, true], [1, true], [2, true], [1, true]]);
    expect(r.names, 'the two swaps, and the two names that are gone').toEqual(['FOLDING ISLAND!', 'KNIFE FLURRY!', undefined, undefined]);
  });

  it('every twist is off at tier 1, on at tier 2 and stronger at tier 3', () => {
    const r = STAGE(`
      var t = ONE_DECK_TIERS, sp = ONE_SPECIAL_TIERS;
      return {
        ash: t.zap.map(function(x){ return [x.ash, x.ashR]; }),
        split: t.screechy.map(function(x){ return [x.split, x.veer]; }),
        fling: t.mindread.map(function(x){ return [x.fling, x.catchT]; }),
        spin: t.ring.map(function(x){ return [x.spin, x.spinT]; }),
        star: sp.moonrocks.map(function(x){ return [x.star, x.lead]; }),
        cross: sp.eyelasers.map(function(x){ return [x.cross, x.lead]; }),
        comp: sp.orbitkick.map(function(x){ return x.comp; }) };`);
    expect(r.ash, 'ZAP: ash piles, longer and wider').toEqual([[0, 0], [120, 50], [180, 70]]);
    expect(r.split[0], 'SCREECHY: the shatter is off').toEqual([0, 0]);
    expect(r.split[1][0], 'on from tier 2, 14 frames out').toBe(14);
    expect(r.split[2][0], 'sooner at tier 3').toBeLessThan(r.split[1][0]);
    expect(r.split[2][1], 'and the pair veer further apart').toBeGreaterThan(r.split[1][1]);
    expect(r.fling, 'MIND READ: flung back, faster, and catching in the wind-up too').toEqual([[0, 0], [1, 0], [1.2, 26]]);
    expect(r.spin[0], 'SHOCK RING: plain at tier 1').toEqual([0, 0]);
    expect(r.spin[1][1] > 0 && r.spin[2][0] > r.spin[1][0], 'twisting from tier 2, harder at tier 3').toBe(true);
    expect(r.star.map(x => x[0]), 'MOON ROCKS: star order from tier 2').toEqual([0, 1, 1]);
    expect(r.star.map(x => x[1]), '...leading your run at tier 3').toEqual([0, 0, 10]);
    expect(r.cross.map(x => x[0]), 'EYE LASERS: lead and cross from tier 2').toEqual([0, 1, 1]);
    expect(r.cross[2][1], 'leading further at tier 3').toBeGreaterThan(r.cross[1][1]);
    expect(r.comp, 'OUT OF ORBIT: compressed from tier 2, harder at tier 3').toEqual([0, 1, 1.4]);
  });
});

describe('ZAP TO DUST!: waves that open where you stand, and the ash', () => {
  it('the wind-up shows the first wave; the later waves come where you stand when their light shows, each with a column either side; all one attack id', () => {
    const r = STAGE(`
      setTier(2); fresh();
      one._telX = you.x; one._telY = hurtCY(you); one._zapCols = null;
      var id = ++BOSS_ATK_ID, cols1 = [], cols = function(){ return oneFx.filter(function(e){ return e.kind === 'column'; }).map(function(e){ return Math.round(e.x); }); };
      ONE_MOVES.zap(one, you, id);
      var first = cols(), T = oneTier(one, 'zap');
      // she is far off; you walk 400 px away before the second wave's light shows, and 400 back before the third
      var warns = [], waves = [];
      for (var i=0; i<(T.waves - 1)*T.gap + 26; i++){
        one._atkTimer = 1e9; you.invuln = 99;
        if (i === T.gap - T.warn - 4) you.x += 400;
        if (i === 2*T.gap - T.warn - 4) you.x -= 400;
        var n0 = oneFx.filter(function(e){ return e.kind === 'zapwarn'; }).length, c0 = cols().length;
        step();
        var w = oneFx.filter(function(e){ return e.kind === 'zapwarn'; });
        if (w.length > n0) warns.push({ i: i, xs: w[w.length-1].cols.map(function(c){ return Math.round(c.x); }), you: Math.round(you.x), life: w[w.length-1].life });
        if (cols().length > c0) waves.push({ i: i, xs: cols().slice(c0), you: Math.round(you.x) });
      }
      return { first: first, T: T, warns: warns, waves: waves, busy: oneBusy(one), you: Math.round(you.x) };`);
    expect(r.first.length, 'the aimed column and its three copies near her (phase 2)').toBe(4);
    expect(r.T.waves, 'three waves at tier 2').toBe(3);
    expect(r.warns.length, 'a light shows before each later wave').toBe(2);
    expect(r.waves.length, 'and the wave comes').toBe(2);
    r.warns.forEach((w, k) => {
      expect(w.xs.length, 'the column where you stand and one either side').toBe(3);
      expect(w.xs[1], 'the middle one is where you stood when it showed').toBeGreaterThanOrEqual(w.you - 20);
      expect(w.xs[1]).toBeLessThanOrEqual(w.you + 20);
      expect(w.xs[2] - w.xs[1], 'a gap apart, so there is a gap to find').toBe(220);
      expect(r.waves[k].i - w.i, 'the wave lands as the light ends').toBeGreaterThanOrEqual(r.T.warn - 3);
      expect(r.waves[k].i - w.i).toBeLessThanOrEqual(r.T.warn + 3);
      expect(r.waves[k].xs, 'the columns that come down are the columns that were lit').toEqual(w.xs);
    });
    expect(r.busy, 'her next wind-up waits until the last wave is down').toBe(false);
  });

  it('the columns hurt once: a fighter in two waves takes one hit, the gap between two columns is safe, and standing in a column hits for 33', () => {
    const r = STAGE(`
      setTier(3); fresh(); worldPlats = worldPlats.filter(function(p){ return p.solid; });
      var id = ++BOSS_ATK_ID, T = oneTier(one, 'zap'), cols = oneZapWave(you.x, you.y);
      var hit = function(x){ you.x = x; you.y = groundY() - 24; you.pct = 0; you.invuln = 0; oneZapColumns(one, cols, ++BOSS_ATK_ID, T); return you.pct; };
      var out = { at: hit(cols[1].x), gap: hit(cols[1].x + ONE_ZAP_GAP/2), beside: hit(cols[1].x + 60 + hurtRX(you)) };
      you.pct = 0; you.invuln = 0; you.x = cols[1].x; oneZapColumns(one, cols, id, T); var a = you.pct; you.invuln = 0; oneZapColumns(one, cols, id, T);
      out.twice = [a, you.pct];
      return out;`);
    expect(r.at, 'standing in a column').toBe(33);
    expect(r.gap, 'between two columns').toBe(0);
    expect(r.beside, 'just outside the band').toBe(0);
    expect(r.twice, 'the same attack id again: no second hit').toEqual([33, 33]);
  });

  it('from tier 2 every column leaves ash that slows whoever stands in it -- no damage -- for its frames, and not at tier 1', () => {
    const r = STAGE(`
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); worldPlats = worldPlats.filter(function(p){ return p.solid; });
        var T = oneTier(one, 'zap'), col = [{ x:you.x + 5, bot:groundY() + 6 }];
        oneZapColumns(one, col, ++BOSS_ATK_ID, T); you.pct = 0; you.invuln = 0; you.slowed = 0;
        var n = one._ash.length, life0 = n ? one._ash[0].life : 0, r0 = n ? one._ash[0].r : 0;
        oneAshTick(one); var slowed = you.slowed;
        you.x += 400; you.slowed = 0; oneAshTick(one); var away = you.slowed;
        you.x -= 400; for (var i=0;i<life0;i++) oneAshTick(one);
        out[t] = { n: n, life: life0, r: r0, slowed: slowed, away: away, gone: one._ash.length, pct: you.pct };
      });
      return out;`);
    expect(r[1], 'tier 1: no ash').toMatchObject({ n: 0, slowed: 0 });
    expect(r[2].n).toBe(1);
    expect(r[2].slowed, 'standing in it slows you').toBeGreaterThan(0);
    expect(r[2].away, 'standing off it does not').toBe(0);
    expect(r[2].pct, 'a status, never damage').toBe(0);
    expect(r[2].gone, 'it lingers its frames and goes').toBe(0);
    expect(r[3].life, 'longer at tier 3').toBeGreaterThan(r[2].life);
    expect(r[3].r, 'and wider').toBeGreaterThan(r[2].r);
  });
});

describe('SCREECHY!: rings, and the shatter (the Fish Monster screams)', () => {
  it('two rings (three in phase 3), each with gaps of its own and one attack id; the pellets of a split ring are the same shot', () => {
    const r = STAGE(`
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); one.x = WW*0.5 - 900; one.y = groundY() - 420;
        var id = ++BOSS_ATK_ID, T = oneTier(one, 'screechy'), seen = {}, peak = 0;
        ONE_MOVES.screechy(one, you, id);
        var first = own(), n0 = first.length, split0 = first[0].oSplit, veer0 = first[0].oVeer;
        var gapsOf = function(ps){ var a = ps.map(function(p){ return Math.round(Math.atan2(p.vy, p.vx)*180/Math.PI/2); }).sort(function(x, y){ return x - y; }), g = 0; for (var i=1;i<a.length;i++) if (a[i] - a[i-1] > 3) g++; return g; };
        var gaps0 = gapsOf(first);
        for (var i=0; i<T.rings*T.ringGap + 4; i++){ one._atkTimer = 1e9; you.invuln = 99; step(); own().forEach(function(p){ seen[p.bossAtk] = 1; }); peak = Math.max(peak, own().length); }
        out[t] = { rings: T.rings, n0: n0, split: split0, veer: veer0, ids: Object.keys(seen).length, same: Object.keys(seen)[0] === String(id), peak: peak, gaps0: gaps0, busy: oneBusy(one) };
      });
      return out;`);
    expect([r[1].rings, r[2].rings, r[3].rings], 'two rings, two, and three in phase 3: it comes in waves now').toEqual([2, 2, 3]);
    for (const t of [1, 2, 3]) {
      expect(r[t].n0, `tier ${t}: a ring of 180 pellets less its gaps`).toBeGreaterThan(100);
      expect(r[t].n0).toBeLessThanOrEqual(180);
      expect(r[t].ids, `tier ${t}: one attack id for every pellet of every ring`).toBe(1);
      expect(r[t].same).toBe(true);
    }
    expect(r[1].split, 'tier 1: no shatter').toBeUndefined();
    expect(r[2].split, 'tier 2: the pellets split 14 frames out').toBe(14);
    expect(r[3].split, 'and sooner at tier 3').toBeLessThan(14);
    expect(r[3].veer, 'veering further').toBeGreaterThan(r[2].veer);
    expect(r[3].peak, '"more bullets!": hundreds in the air at once in phase 3').toBeGreaterThan(r[1].peak * 1.8);
    expect(r[1].gaps0, 'tier 1: the first ring has its four gaps').toBeGreaterThanOrEqual(3);
  });

  it('from tier 2 every pellet splits into two that veer apart (and the pair shares its id); tier 1 does not split', () => {
    const r = STAGE(`
      var out = {};
      [1, 2].forEach(function(t){
        setTier(t); fresh(); one.x = WW*0.5 - 900; one.y = groundY() - 420;
        var T = oneTier(one, 'screechy'), id = ++BOSS_ATK_ID;
        oneScreechRing(one, T, id);
        var n0 = own().length;
        one._steerUntil = 1e9;
        for (var i=0; i<(T.split || 3) + 2; i++){ one._f++; oneSteerShots(one); }
        var all = own(), same = all.every(function(p){ return p.bossAtk === id; });
        // ...and one pellet on its own, to read the pair it becomes: heading 0, veer apart
        projectiles = []; var lone = oneShot(one, { x:100, y:100, vx:10, vy:0, bossAtk:id, life:99 }); lone.oSplit = T.split || 0; lone.oVeer = T.veer; addProj(lone);
        for (var j=0; j<(T.split || 3) + 2; j++){ one._f++; oneSteerShots(one); }
        out[t] = { n0: n0, n1: all.length, same: same, pair: own().map(function(p){ return +Math.atan2(p.vy, p.vx).toFixed(5); }).sort(), speeds: own().map(function(p){ return +Math.hypot(p.vx, p.vy).toFixed(5); }), veer: T.veer };
      });
      return out;`);
    expect(r[1].n1, 'tier 1: the ring stays as it was').toBe(r[1].n0);
    expect(r[2].n1, 'tier 2: every pellet is two').toBe(r[2].n0 * 2);
    expect(r[2].same, 'one shot, one id: still one hit at most').toBe(true);
    expect(r[1].pair, 'a lone pellet at tier 1 stays one').toEqual([0]);
    expect(r[2].pair.length, 'and at tier 2 becomes two').toBe(2);
    expect(r[2].pair[1] - r[2].pair[0], 'the pair veer `veer` apart').toBeCloseTo(r[2].veer, 4);
    expect(r[2].pair[0] + r[2].pair[1], 'either side of where it was going').toBeCloseTo(0, 4);
    expect(r[2].speeds, 'at the speed it had').toEqual([10, 10]);
  });

  it('she takes the Fish Monster look while she screams (tier 2 up): its wind-up and its rings; her own render otherwise', () => {
    const r = STAGE(`
      var out = {};
      [1, 2].forEach(function(t){
        setTier(t); fresh();
        var rows = {};
        rows.idle = bossLook(one);
        one._telKind = 'screechy'; one._tel = 30; rows.winding = bossLook(one);
        one._tel = 0; one._telKind = null; ONE_MOVES.screechy(one, you, ++BOSS_ATK_ID); rows.firing = bossLook(one);
        for (var i=0; i<100; i++){ one._atkTimer = 1e9; you.invuln = 99; step(); } rows.after = bossLook(one);
        one._telKind = 'zap'; one._tel = 30; rows.other = bossLook(one); one._tel = 0; one._telKind = null;
        out[t] = rows;
      });
      return { out: out, src: BOSS_SPRITE_SRC.onefish, flip: !!BOSS_SPRITE_FLIP.onefish, drawn: String(drawBossSprite).indexOf('case "onefish"') >= 0 };`);
    expect(r.out[1], 'tier 1: never').toEqual({ idle: 'one', winding: 'one', firing: 'one', after: 'one', other: 'one' });
    expect(r.out[2], 'tier 2: while she screams, and only then').toEqual({ idle: 'one', winding: 'onefish', firing: 'onefish', after: 'one', other: 'one' });
    expect(r.src).toBe('assets/sprites/one-fish.png');
    expect(r.flip, 'its mouth is on the left').toBe(true);
    expect(r.drawn, 'and the drawn numeral is still there under it').toBe(true);
  });
});

describe('MIND READ!: flung back', () => {
  it('tier 1 catches nothing; tier 2 up catches every shot of yours in the air and flings them back as ONE bigger orb that wears what you threw, with the volleys', () => {
    const r = STAGE(`
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); one.x = you.x + 500; one.y = groundY() - 300;
        for (var i=0;i<3;i++) projectiles.push({ owner:you.idx, ownerObj:you, x:you.x + 200 + i*40, y:one.y + 20*i, vx:6, vy:0, dmg:5, kb:2, r:8, life:60, shape:'ember', color:'#e8502a' });
        var mine = projectiles.slice(), id = ++BOSS_ATK_ID, T = oneTier(one, 'mindread');
        ONE_MOVES.mindread(one, you, id);
        var orbs = own(), big = orbs.filter(function(p){ return p.r > 12; });
        out[t] = { caught: mine.filter(function(p){ return p.life <= 0; }).length, orbs: orbs.length, big: big.map(function(p){ return { r: p.r, shape: p.shape, spd: Math.hypot(p.vx, p.vy), id: p.bossAtk, dmg: p.dmg }; }),
          stars: oneFx.filter(function(e){ return e.kind === 'star'; }).length, shots: T.shots, ids: Object.keys(orbs.reduce(function(a, p){ a[p.bossAtk] = 1; return a; }, {})).length };
      });
      return out;`);
    expect(r[1].caught, "tier 1: nothing to catch (today's orbs)").toBe(0);
    expect(r[1].big.length).toBe(0);
    expect(r[1].orbs, 'three orbs in the first volley').toBe(3);
    for (const t of [2, 3]) {
      expect(r[t].caught, `tier ${t}: all three of your shots, caught in the air`).toBe(3);
      expect(r[t].stars, 'a star-shaped flash for each').toBe(3);
      expect(r[t].big.length, 'fused into ONE orb').toBe(1);
      expect(r[t].big[0].shape, 'wearing what you threw').toBe('ember');
      expect(r[t].big[0].r, 'radius x1.25 a shot, up to x1.75 (three shots: capped)').toBeCloseTo(12 * 1.75, 6);
      expect(r[t].ids, 'one attack id with the volleys: it is still one hit at most').toBe(1);
      expect(r[t].big[0].dmg, 'a hit of her 33').toBe(33);
    }
    expect(r[2].orbs, 'five orbs in the volley, and the flung one').toBe(5 + 1);
    expect(r[3].big[0].spd, 'faster at tier 3').toBeGreaterThan(r[2].big[0].spd);
  });

  it("a shot of the ghost's and a trap are not caught; tier 3 starts catching in the last frames of the wind-up", () => {
    const r = STAGE(`
      setTier(3); fresh(); one.x = you.x + 500; one.y = groundY() - 300;
      var ghostShot = { owner:5, ownerObj:{ _oneGhost:true, team:-1 }, x:one.x - 100, y:one.y, vx:4, vy:0, dmg:5, kb:2, r:8, life:60, color:'#fff' };
      var trap = { owner:you.idx, ownerObj:you, x:one.x - 100, y:one.y, vx:0, vy:0, dmg:5, kb:2, r:8, life:60, trap:true, color:'#fff' };
      projectiles.push(ghostShot, trap);
      var got = oneCatchShots(one), left = { ghost: ghostShot.life, trap: trap.life };
      // the wind-up: a shot thrown at frame 3 of 36 is still in the air at 8 and caught by 20 (the last 26 frames)
      fresh(); one._telKind = 'mindread'; one._tel = 36; one._eyeBurst = 0;
      var thrown = { owner:you.idx, ownerObj:you, x:you.x + 150, y:one.y, vx:0.5, vy:0, dmg:5, kb:2, r:8, life:200, shape:'ember', color:'#e8502a' };
      var early = null, late = null;
      for (var i=0;i<30;i++){ one._atkTimer = 1e9; you.invuln = 99; if (i === 3) projectiles.push(thrown); step(); if (i === 8) early = thrown.life > 0; if (i === 20) late = thrown.life > 0; }
      return { got: got.length, left: left, early: early, late: late };`);
    expect(r.got, "neither the ghost's shot nor a trap").toBe(0);
    expect(r.left.ghost > 0 && r.left.trap > 0).toBe(true);
    expect(r.early, 'still in the air early in the wind-up').toBe(true);
    expect(r.late, 'caught once the last 26 frames begin (tier 3)').toBe(false);
  });

  it('the drain is unchanged and the move still heals her; with nobody to read it drains and fires nothing', () => {
    const r = STAGE(`
      setTier(1); fresh(); one.hp = 1900; one.x = you.x + 60; one.y = you.y; var h0 = one.hp;
      ONE_MOVES.mindread(one, null, ++BOSS_ATK_ID);
      return { shots: own().length, pct: you.pct, healed: one.hp - h0 };`);
    expect(r.shots).toBe(0);
    expect(r.pct, "Power Drain's 6, x1.5").toBe(9);
    expect(r.healed).toBe(25);
  });
});

describe('FOLDING ISLAND! (it was INCOMING!): the surface folds shut like a clam', () => {
  it('on the floor it is the floor round you; on a platform it is your platform and the 3 nearest ("the owner\'s version")', () => {
    const r = STAGE(`
      setTier(1); fresh();
      var T = oneTier(one, 'fold'), floor = worldPlats.filter(function(p){ return p.solid; })[0], out = {};
      var onFloor = oneFoldZones(one, you, T, true);
      out.floor = { n: onFloor.length, x0: Math.round(onFloor[0].x0), x1: Math.round(onFloor[0].x1), y: onFloor[0].y, H: onFloor[0].H, you: Math.round(you.x), floorY: floor.y, half: T.half };
      // a platform with room to stand on
      var p = worldPlats.filter(function(q){ return !q.solid && q.y < floor.y - 250 && q.w > 150 && q.x > floor.x + 600 && q.x + q.w < floor.x + floor.w - 600; })[0];
      you.x = p.x + p.w/2; you.y = p.y - you.r - 1; you.vx = 0; you.vy = 0;
      var z = oneFoldZones(one, you, T, true);
      var plats = worldPlats.filter(function(q){ return !q.solid && !q.rot && q.w > 40; });
      var dist = function(q){ return Math.hypot(Math.max(q.x - you.x, 0, you.x - (q.x + q.w)), q.y - feetY(you)); };
      var chosen = z.map(function(zz){ return plats.find(function(q){ return q.x === zz.x0 && q.y === zz.y; }); });
      var others = plats.filter(function(q){ return chosen.indexOf(q) < 0; });
      out.plat = { n: z.length, first: z[0].x0 === p.x && z[0].x1 === p.x + p.w && z[0].y === p.y, real: chosen.every(function(q){ return !!q; }), distinct: new Set(chosen).size,
        nearest: Math.max.apply(null, chosen.slice(1).map(dist)) <= Math.min.apply(null, others.map(dist)) + 1e-6, H: z[0].H };
      // in the air over the pit, with nothing under you, it is still the floor's problem only if the floor is what is below -- here, nothing
      you.x = floor.x - 300; you.y = floor.y - 300; out.pit = oneFoldZones(one, you, T, true).length;
      return out;`);
    expect(r.floor.n, 'one zone, on the floor').toBe(1);
    expect(r.floor.y, 'at the floor line').toBe(r.floor.floorY);
    expect(r.floor.x0, 'a stretch either side of you').toBe(r.floor.you - r.floor.half);
    expect(r.floor.x1).toBe(r.floor.you + r.floor.half);
    expect(r.plat.n, 'your platform and the three nearest: four').toBe(4);
    expect(r.plat.first, 'the first is the one you stand on').toBe(true);
    expect(r.plat.real && r.plat.distinct === 4, 'four different platforms').toBe(true);
    expect(r.plat.nearest, 'and the other three are the nearest to you').toBe(true);
  });

  it('the jaw is lit for tel frames, shuts over ONE_FOLD_CLOSE and hits what is inside for 33 -- once; standing off it, or above its reach, is safe; a platform is never taken away', () => {
    const r = STAGE(`
      var out = {}, plats0 = worldPlats.length, tops0 = worldPlats.map(function(p){ return p.y; }).join();
      var run1 = function(placeFn){
        setTier(1); fresh(); worldPlats = worldPlats.filter(function(p){ return p.solid || true; });
        var T = oneTier(one, 'fold'); one._telKind = 'fold'; one._tel = oneTelLen(one, 'fold'); one._foldZones = oneFoldZones(one, you, T, true);
        var zones = one._foldZones.slice(); placeFn(zones[0]);
        one._tel = 1; one._atkTimer = 1e9; you.pct = 0; you.invuln = 0;
        var id = ++BOSS_ATK_ID; one._tel = 0; ONE_MOVES.fold(one, you, id);
        var jaws = oneFx.filter(function(e){ return e.kind === 'jaws'; }).length, hit0 = you.pct;
        var pct = [];
        for (var i=0; i<ONE_FOLD_CLOSE + 3; i++){ one._atkTimer = 1e9; one.x = you.x + 900; one.y = groundY() - 400; placeFn(zones[0], true); step(); pct.push(you.pct); }
        return { tel: oneTelLen(one, 'fold'), zones: zones.length, jaws: jaws, hit0: hit0, pct: pct, last: pct[pct.length - 1] };
      };
      out.inside = run1(function(z, keep){ you.x = (z.x0 + z.x1)/2 + 30; you.y = z.y - you.r; you.vx = 0; you.vy = 0; if (keep) you.invuln = 0; });
      out.off = run1(function(z, keep){ you.x = z.x1 + 160; you.y = z.y - you.r; you.vx = 0; you.vy = 0; });
      out.above = run1(function(z, keep){ you.x = (z.x0 + z.x1)/2; you.y = z.y - z.H - 120; you.vx = 0; you.vy = 0; });
      out.plats = { same: worldPlats.length === plats0 && worldPlats.map(function(p){ return p.y; }).join() === tops0 };
      return out;`);
    expect(r.inside.tel, 'tier 1: the jaw is lit for 58 frames').toBe(58);
    expect(r.inside.jaws, 'and shuts').toBe(1);
    expect(r.inside.hit0, 'nothing lands until it has shut').toBe(0);
    expect(r.inside.last, 'inside it when it shuts: one hit of 33').toBe(33);
    expect(r.off.last, 'standing off it: safe').toBe(0);
    expect(r.above.last, 'above its reach when it shuts: safe').toBe(0);
    expect(r.plats.same, 'it crushes, it does not take a platform away').toBe(true);
  });

  it('a chain of folds (2, 3, 4 by tier): each next one is lit where you stand when the last has shut, and the whole chain is one attack id -- one hit', () => {
    const r = STAGE(`
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); worldPlats = worldPlats.filter(function(p){ return p.solid; });
        var T = oneTier(one, 'fold'), id = ++BOSS_ATK_ID, jawsAt = [], warns = [], claps = 0;
        one._telKind = 'fold'; one._foldZones = oneFoldZones(one, you, T, true);
        one._tel = 0; ONE_MOVES.fold(one, you, id);
        var x0 = you.x;
        for (var i=0; i<900 && (oneBusy(one) || i < 5); i++){
          one._atkTimer = 1e9; one.x = you.x + 900; one.y = groundY() - 400; you.invuln = 0;
          var j0 = oneFx.filter(function(e){ return e.kind === 'jaws'; }).length, w0 = oneFx.filter(function(e){ return e.kind === 'foldwarn'; }).length;
          // you walk 330 px right between the folds (once the first has shut)
          if (i === 40) you.x += 330;
          step();
          var js = oneFx.filter(function(e){ return e.kind === 'jaws'; }), ws = oneFx.filter(function(e){ return e.kind === 'foldwarn'; });
          if (ws.length > w0) warns.push({ i: i, mid: Math.round((ws[ws.length-1].zones[0].x0 + ws[ws.length-1].zones[0].x1)/2), you: Math.round(you.x), half: Math.round((ws[ws.length-1].zones[0].x1 - ws[ws.length-1].zones[0].x0)/2) });
        }
        out[t] = { folds: T.folds, tel2: T.tel2, half2: T.half2, jaws: oneFx.length, warns: warns, pct: you.pct, busy: oneBusy(one), frames: i };
      });
      return out;`);
    expect([r[1].folds, r[2].folds, r[3].folds], 'two folds, then three, then four: it runs on').toEqual([2, 3, 4]);
    for (const t of [1, 2, 3]) {
      expect(r[t].warns.length, `tier ${t}: a lit zone before each fold after the first`).toBe(r[t].folds - 1);
      r[t].warns.forEach(w => {
        expect(Math.abs(w.mid - w.you), 'lit where you stand now (the first clap knocked you a few pixels)').toBeLessThanOrEqual(30);
        expect(w.half, 'a narrower stretch than the first').toBe(r[t].half2);
      });
      expect(r[t].busy, 'it ends').toBe(false);
      expect(r[t].pct, 'one id, so at most one hit however many folds shut on you').toBeLessThanOrEqual(33);
    }
    expect(r[3].frames, 'longer at tier 3').toBeGreaterThan(r[1].frames);
  });
});

describe('KNIFE FLURRY! (it was SEEKERS!): "2, but homing."', () => {
  it('the copies hang in an arc over her and follow her, then go one at a time, each at where you are at its own launch; 8, 12 and 16 by tier', () => {
    const r = STAGE(`
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); one.x = you.x + 400; one.y = groundY() - 420;
        var T = oneTier(one, 'knives'), id = ++BOSS_ATK_ID, t0 = one._f;
        ONE_MOVES.knives(one, you, id);
        var knives = own(), hungAt = knives.map(function(p){ return { x: p.x - one.x, y: p.y - one.y }; });
        var firstGo = null, goAt = [], dirs = [], youAt = [], prev = knives.map(function(){ return false; });
        for (var i=0; i<T.hang + T.n*T.every + 4; i++){
          one._atkTimer = 1e9; you.invuln = 99; you.x += 2;   // you drift right a little all the time
          one.x += 0.5;                                        // and she drifts too: the hung knives go with her
          step();
          knives.forEach(function(p, k){ if (!prev[k] && !p.oHang){ prev[k] = true; goAt.push(one._f - t0); dirs.push(Math.atan2(p.vy, p.vx)); youAt.push([you.x, hurtCY(you), p.x, p.y]); } });
        }
        out[t] = { n: knives.length, T: T, shape: knives[0].shape, dmg: knives[0].dmg, ids: Object.keys(knives.reduce(function(a, p){ a[p.bossAtk] = 1; return a; }, {})).length,
          hungAbove: hungAt.every(function(h){ return h.y < 0; }), goAt: goAt, dirs: dirs, aimErr: youAt.map(function(a, k){ return Math.abs(Math.atan2(a[1] - a[3], a[0] - a[2]) - dirs[k]); }),
          home: knives[0].oHome, homeT: knives[0].oHomeT };
      });
      return out;`);
    expect([r[1].n, r[2].n, r[3].n], '8, 12 and 16 knives').toEqual([8, 12, 16]);
    for (const t of [1, 2, 3]) {
      expect(r[t].shape).toBe('oneknife');
      expect(r[t].dmg, 'a hit of her 33').toBe(33);
      expect(r[t].ids, 'one id for the whole flurry').toBe(1);
      expect(r[t].hungAbove, 'in an arc over her').toBe(true);
      expect(r[t].goAt.length, 'every one goes').toBe(r[t].n);
      expect(r[t].goAt[0], 'after the hang').toBeGreaterThanOrEqual(r[t].T.hang);
      for (let k = 1; k < r[t].goAt.length; k++) expect(r[t].goAt[k] - r[t].goAt[k - 1], 'one every few frames').toBe(r[t].T.every);
      r[t].aimErr.forEach(e => expect(e, 'each at where you were at its own launch').toBeLessThan(0.16));
      expect(r[t].home, 'and it homes ("2, but homing.")').toBeGreaterThan(0);
    }
    expect(r[3].home, 'harder at tier 3').toBeGreaterThan(r[1].home);
    expect(r[3].homeT).toBeGreaterThan(r[1].homeT);
  });

  it('a knife in the air turns toward you: step aside after it is thrown and its heading follows, for homeT frames, then flies straight', () => {
    const r = STAGE(`
      setTier(2); fresh(); one.x = you.x + 500; one.y = groundY() - 420;
      var T = oneTier(one, 'knives'), k = oneShot(one, { x:one.x, y:one.y, vx:T.spd*ONE_SPD, vy:0, life:400, bossAtk:++BOSS_ATK_ID, shape:'oneknife' });
      k.vx = -T.spd*ONE_SPD; k.vy = 0; k.oHome = T.home; k.oHomeT = T.homeT; addProj(k); oneSteer(one, 400);
      var h0 = Math.atan2(k.vy, k.vx), seen = [];
      for (var i=0; i<T.homeT + 40; i++){ you.y = groundY() - 24 - (i < 40 ? 0 : 150); one._f++; oneSteerShots(one); k.x += k.vx; k.y += k.vy; if (i === 20 || i === T.homeT - 1 || i === T.homeT + 30) seen.push(Math.atan2(k.vy, k.vx)); }
      return { h0: h0, seen: seen, speed: Math.hypot(k.vx, k.vy), want: T.spd*ONE_SPD, left: k.oHomeT };`);
    expect(r.speed, 'its speed is its own: it only turns').toBeCloseTo(r.want, 5);
    expect(r.seen[0], 'turning').not.toBeCloseTo(r.h0, 2);
    expect(r.seen[2], 'and straight once its homing is spent').toBeCloseTo(r.seen[1], 6);
    expect(r.left).toBe(0);
  });
});

describe('SHOCK RING!: the owner\'s own twist, two opposite twisting bursts', () => {
  it('tier 1 is a plain ring of 24 in two bursts; from tier 2 the bursts turn opposite ways, gold and purple, and cross like a pinwheel; all one id', () => {
    const r = STAGE(`
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); one.x = WW*0.5 - 900; one.y = groundY() - 420;
        var T = oneTier(one, 'ring'), id = ++BOSS_ATK_ID, bursts = [], seen = {};
        ONE_MOVES.ring(one, you, id);
        var b = function(){ var ps = own().filter(function(p){ return !p._seenBurst; }); ps.forEach(function(p){ p._seenBurst = 1; p._h0 = Math.atan2(p.vy, p.vx); }); return ps; };
        bursts.push(b());
        for (var i=0; i<T.bursts*T.gap + 2; i++){ one._atkTimer = 1e9; you.invuln = 99; step(); var n = b(); if (n.length) bursts.push(n); own().forEach(function(p){ seen[p.bossAtk] = 1; }); }
        out[t] = { T: T, n: bursts.map(function(x){ return x.length; }), spin: bursts.map(function(x){ return x[0].oSpin; }), shape: bursts[0][0].shape, colors: Object.keys(bursts[0].reduce(function(a, p){ a[p.color] = 1; return a; }, {})).length,
          ids: Object.keys(seen).length, off: bursts.map(function(x){ return +x[0]._h0.toFixed(4); }) };
      });
      return out;`);
    expect(r[1].n, 'tier 1: two bursts of 24').toEqual([24, 24]);
    expect(r[1].spin, 'tier 1: no twist').toEqual([undefined, undefined]);
    expect(r[1].shape).toBeUndefined();
    expect(r[2].n, 'tier 2: two bursts of 28').toEqual([28, 28]);
    expect(Math.sign(r[2].spin[0]) * Math.sign(r[2].spin[1]), 'turning opposite ways').toBe(-1);
    expect(Math.abs(r[2].spin[0]), 'a few degrees a frame').toBeCloseTo(0.042, 6);
    expect(r[2].shape, 'in the Vortex stars').toBe('onering');
    expect(r[2].colors, 'gold and purple').toBe(2);
    expect(r[3].n, 'tier 3: four bursts').toEqual([32, 32, 32, 32]);
    expect(r[3].spin.map(Math.sign), 'alternating, clockwise first').toEqual([1, -1, 1, -1]);
    expect(Math.abs(r[3].spin[0]), 'turning harder').toBeGreaterThan(Math.abs(r[2].spin[0]));
    expect(r[2].off[1] - r[2].off[0], 'the second ring is half a step round, so the arms cross').toBeCloseTo(Math.PI/28, 3);
    for (const t of [1, 2, 3]) expect(r[t].ids, `tier ${t}: one attack id`).toBe(1);
  });

  it('a twisting shot turns spin radians a frame for spinT frames and then flies straight on', () => {
    const r = STAGE(`
      setTier(2); fresh(); one._steerUntil = 1e9;
      var T = oneTier(one, 'ring'), p = oneShot(one, { x:0, y:0, vx:10, vy:0, bossAtk:++BOSS_ATK_ID, oSpin:T.spin, oSpinT:T.spinT }); addProj(p);
      var h = []; for (var i=0;i<T.spinT + 10;i++){ one._f++; oneSteerShots(one); if (i === 9 || i === T.spinT - 1 || i === T.spinT + 8) h.push(Math.atan2(p.vy, p.vx)); }
      return { h: h, T: T, speed: Math.hypot(p.vx, p.vy) };`);
    expect(r.h[0], 'ten frames in').toBeCloseTo(0.042 * 10, 5);
    expect(r.h[1], 'all the turn').toBeCloseTo(r.T.spin * r.T.spinT, 5);
    expect(r.h[2], 'then straight').toBeCloseTo(r.h[1], 6);
    expect(r.speed).toBeCloseTo(10, 6);
  });
});

describe('ONE GROWS GIANT! and POWER UNGROUNDED!: no twist, tiers all the same', () => {
  it('she grows bigger and for longer by tier, and has more body to touch; Power Ungrounded is the same at every tier; neither takes a platform or lunges', () => {
    const r = STAGE(`
      var out = { r: [], t: [], g: [], keys: {} }, plats0 = worldPlats.length;
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); one.r = one._baseR; one._giantT = 0;
        ONE_MOVES.sizeshift(one); out.r.push(one.r / one._baseR); out.t.push(one._giantT);
        one.r = one._baseR; one._giantT = 0; one._ungrounded = false;
        ONE_MOVES.ungrounded(one); out.g.push([one._ungroundT, one._groundNeed]); one._ungrounded = false;
      });
      out.plats = worldPlats.length === plats0; out.lunge = typeof oneLunge; out.crush = typeof oneCrush;
      return out;`);
    expect(r.r.map(x => +x.toFixed(2)), 'bigger each tier').toEqual([1.4, 1.5, 1.6]);
    expect(r.t, 'for longer').toEqual([480, 600, 720]);
    expect(r.g, 'Power Ungrounded: a state, not a bullet -- the same at every tier').toEqual([[480, 75], [480, 75], [480, 75]]);
    expect(r.plats, 'the platform crush was cut ("remove 1 and 2")').toBe(true);
    expect([r.lunge, r.crush], 'and so was the lunge').toEqual(['undefined', 'undefined']);
  });
});

describe('MOON ROCKS!: star order', () => {
  it('the star: n points along a five-point star, in stroke order (the pentagram 0-2-4-1-3)', () => {
    const r = STAGE(`
      var V = [], rd = function(a){ return a.map(function(x){ return Math.round(x*10000)/10000 + 0; }); };
      for (var i=0;i<5;i++){ var a = -Math.PI/2 + i*2*Math.PI/5; V.push([Math.cos(a), Math.sin(a)]); }
      var s10 = oneStarSpots(10), s15 = oneStarSpots(15), order = [0, 2, 4, 1, 3];
      return { n10: s10.length, n15: s15.length, starts: [0,1,2,3,4].map(function(k){ return rd(s10[k*2]); }), verts: order.map(function(i){ return rd(V[i]); }),
        mids: [0,1,2,3,4].map(function(k){ var A = V[order[k]], B = V[order[(k+1)%5]]; return rd([(A[0]+B[0])/2, (A[1]+B[1])/2]); }), seconds: [0,1,2,3,4].map(function(k){ return rd(s10[k*2 + 1]); }),
        r: ONE_STAR_R };`);
    expect([r.n10, r.n15], 'two a stroke, three a stroke').toEqual([10, 15]);
    expect(r.starts, 'each stroke starts at the next point of the star in stroke order').toEqual(r.verts);
    expect(r.seconds, 'and the next rock is half way along it').toEqual(r.mids);
  });

  it('tier 1: eight rocks, all at the spot you stood on; tier 2: ten in a star, each at where you stand as it goes; tier 3: fifteen, leading your run', () => {
    const r = STAGE(`
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); one.x = you.x + 450; one.y = groundY() - 420;
        var T = oneTier(one, 'moonrocks'), id = ++BOSS_ATK_ID, t0 = one._f, lock = [you.x, hurtCY(you)], chips0 = oneArena(one).chips;
        ONE_MOVES.moonrocks(one, you, id);
        var rocks = own(), rel = rocks.map(function(p){ return [p.oHang.dx, p.oHang.dy]; }), goAt = [], dirs = [], youAt = [];
        var prev = rocks.map(function(){ return false; }), chips = oneArena(one).chips - chips0;
        for (var i=0; i<T.n*T.every + 12; i++){ one._atkTimer = 1e9; you.invuln = 99; you.x += 3; step();   // you drift right 3 a frame
          rocks.forEach(function(p, k){ if (!prev[k] && !p.oHang){ prev[k] = true; goAt.push(one._f - t0); dirs.push(Math.atan2(p.vy, p.vx)); youAt.push([you.x, hurtCY(you), p.x, p.y]); } }); }
        out[t] = { n: rocks.length, T: T, shape: rocks[0].shape, dmg: rocks[0].dmg, ids: Object.keys(rocks.reduce(function(a, p){ a[p.bossAtk] = 1; return a; }, {})).length, goAt: goAt,
          aim: rocks[0].oHang === null ? null : null, lock: lock, dirs: dirs, youAt: youAt, spread: Math.max.apply(null, rel.map(function(q){ return Math.abs(q[0]); })), up: rel.every(function(q){ return q[1] < 0; }), chips: chips,
          launch: null };
        // the launch rule each rock was given
        fresh(); ONE_MOVES.moonrocks(one, you, ++BOSS_ATK_ID); out[t].launch = own().map(function(p){ return p.oHang.launch; });
      });
      return out;`);
    expect([r[1].n, r[2].n, r[3].n], '"much harder": twice the rocks, and then more').toEqual([8, 10, 15]);
    for (const t of [1, 2, 3]) {
      expect(r[t].shape).toBe('moonrock');
      expect(r[t].ids, 'one id').toBe(1);
      expect(r[t].up, 'they rise over her').toBe(true);
      expect(r[t].goAt.length, 'every rock goes').toBe(r[t].n);
      for (let k = 1; k < r[t].goAt.length; k++) expect(r[t].goAt[k] - r[t].goAt[k - 1], 'one after another').toBe(r[t].T.every);
      expect(r[t].chips, 'the Moon in her sky has lost a chunk with every volley').toBe(1);
    }
    expect(r[1].launch.every(l => l.aim === 'point' && l.px === r[1].lock[0]), 'tier 1: every rock at the spot you stood on').toBe(true);
    expect(r[2].launch.every(l => l.aim === 'foe' && l.lead === 0), 'tier 2: each at where you are as it goes').toBe(true);
    expect(r[3].launch.every(l => l.aim === 'foe' && l.lead === 10), 'tier 3: leading your run').toBe(true);
    r[2].youAt.forEach((a, k) => expect(Math.abs(Math.atan2(a[1] - a[3], a[0] - a[2]) - r[2].dirs[k]), 'each rock goes at you as it goes').toBeLessThan(0.1));
    // the rocks that went at the spot you stood on all aim there, though you have moved since
    r[1].youAt.forEach((a, k) => expect(Math.abs(Math.atan2(r[1].lock[1] - a[3], r[1].lock[0] - a[2]) - r[1].dirs[k])).toBeLessThan(0.1));
    expect(r[2].spread, 'in a star (95 px across), where tier 1 hangs its eight in a row 308 wide').toBeLessThanOrEqual(96);
    expect(r[1].spread).toBeGreaterThan(150);
  });

  it('a rock that misses breaks on the surface under where it was thrown, with a shake, dust and three grey shards -- a platform between her and you is not a roof', () => {
    const r = STAGE(`
      setTier(2); fresh();
      var floor = worldPlats.filter(function(p){ return p.solid; })[0], calls = [], imp = impact;
      impact = function(x, y, o){ calls.push([Math.round(x), Math.round(y), o && o.shake, o && o.debris]); return imp.apply(this, arguments); };
      try {
        one.x = you.x - 400; one.y = groundY() - 360;
        var px = you.x + 300, py = groundY() - 40;   // a point just over the floor, well clear of you
        var rock = addProj(oneShot(one, { x:one.x, y:one.y, vx:0, vy:0, life:110, delay:2, r:18, shape:'moonrock', bossAtk:++BOSS_ATK_ID, dmg:26, bossCap:26 }));
        rock.oHang = { dx:0, dy:0, a:0, at:one._f + 1, rock:true, launch:{ spd:14.5, aim:'point', px:px, py:py } }; oneSteer(one, 300);
        you.x = WW*0.5 - 1200;   // out of the way
        for (var i=0; i<80 && rock.life > 0; i++){ one._atkTimer = 1e9; one.x = WW*0.5 - 400; one.y = groundY() - 360; step(); }
        var launched = { breaks: rock.breaksOnSurface, warnY: rock.warnY, land: rock.landImpact };
      } finally { impact = imp; }
      return { calls: calls.filter(function(c){ return c[2] === 6; }), floor: floor.y, launched: launched, dead: rock.life <= 0 };`);
    expect(r.launched.breaks).toBe(true);
    expect(r.launched.warnY, 'its landing is the surface under the spot it was aimed at').toBe(r.floor);
    expect(r.dead, 'it broke').toBe(true);
    expect(r.calls.length, 'with one heavy landing').toBe(1);
    expect(r.calls[0][3], 'three shards').toBe(3);
    expect(Math.abs(r.calls[0][1] - r.floor), 'on the floor').toBeLessThanOrEqual(2);
  });
});

describe('EYE LASERS!: lead and cross, and a third burst at the top', () => {
  it('2, 2 and 3 bursts by tier; the second burst has its own id (it can land after the first) and a third shares the second\'s', () => {
    const r = STAGE(`
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); one.x = you.x + 400; one.y = groundY() - 330;
        var T = oneTier(one, 'eyelasers'), bursts = [], seenAt = {};
        one._telKind = 'eyelasers'; one._tel = oneTelLen(one, 'eyelasers'); one._eyeBurst = 0; one._atkTimer = 1e9; one._aimX = you.x; one._aimY = hurtCY(you);
        for (var i=0; i<320 && (one._tel > 0 || i < 3); i++){
          one._atkTimer = 1e9; you.invuln = 99; step();
          var fresh1 = projectiles.filter(function(p){ return p.shape === 'onelaser' && !p._b; });
          if (fresh1.length){ fresh1.forEach(function(p){ p._b = 1; }); bursts.push({ i: i, n: fresh1.length, id: fresh1[0].bossAtk, ids: Object.keys(fresh1.reduce(function(a, p){ a[p.bossAtk] = 1; return a; }, {})).length }); }
        }
        out[t] = { T: T, bursts: bursts, gap: one._atkTimer };
      });
      return out;`);
    expect([r[1].bursts.length, r[2].bursts.length, r[3].bursts.length]).toEqual([2, 2, 3]);
    for (const t of [1, 2, 3]) {
      r[t].bursts.forEach(b => expect(b.ids, 'one id inside a burst').toBe(1));
      expect(r[t].bursts[0].id, 'the second burst has its own id').not.toBe(r[t].bursts[1].id);
    }
    expect(r[3].bursts[2].id, 'a third burst shares the second\'s: one more hit at most, not two').toBe(r[3].bursts[1].id);
    expect([r[1].bursts[0].n, r[2].bursts[0].n, r[3].bursts[0].n], 'volleys x two eyes x a fan').toEqual([2 * 2 * 3, 3 * 2 * 3, 4 * 2 * 5]);
  });

  it('from tier 2 the second burst leads your run (you + velocity x lead frames), so the strafe that beat the first walks into the second; tier 1 aims both at the lock', () => {
    const r = STAGE(`
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); one.x = you.x - 500; one.y = groundY() - 330;
        var T = oneTier(one, 'eyelasers'), bursts = [];
        one._telKind = 'eyelasers'; one._tel = oneTelLen(one, 'eyelasers'); one._eyeBurst = 0; one._atkTimer = 1e9; one._aimX = you.x; one._aimY = hurtCY(you);
        for (var i=0; i<320 && (one._tel > 0 || i < 3); i++){
          one._atkTimer = 1e9; you.invuln = 99; you.vx = i > 30 ? 5 : 0;   // you stand still, then run right
          step();
          var bolts = projectiles.filter(function(p){ return p.shape === 'onelaser' && !p._b; });
          if (bolts.length){
            bolts.forEach(function(p){ p._b = 1; });
            // the centre bolt of each eye's fan goes dead at the aim: the lock, or from the second burst on (tier 2 up) the lock plus the velocity she saw x lead
            var k = bursts.length, lead = (T.cross && k >= 1), ax = one._aimX + (lead ? one._aimVX*T.lead : 0), ay = one._aimY + (lead ? one._aimVY*T.lead*0.5 : 0);
            var err = Math.min.apply(null, bolts.map(function(p){ var a = Math.atan2(ay - p.y, ax - p.x), b = Math.atan2(p.vy, p.vx); return Math.abs(a - b); }));
            var errLock = Math.min.apply(null, bolts.map(function(p){ var a = Math.atan2(one._aimY - p.y, one._aimX - p.x), b = Math.atan2(p.vy, p.vx); return Math.abs(a - b); }));
            bursts.push({ err: err, errLock: errLock, lead: lead, vx: one._aimVX });
          }
        }
        out[t] = { bursts: bursts, T: T };
      });
      return out;`);
    for (const t of [1, 2, 3]) r[t].bursts.forEach((b) => expect(b.err, 'a centre bolt goes dead at the aim').toBeLessThan(1e-6));
    expect(r[1].bursts.every((b) => !b.lead && b.errLock < 1e-6), 'tier 1: both bursts at the lock').toBe(true);
    for (const t of [2, 3]) {
      expect(r[t].bursts[0].lead, 'the first burst is at the lock').toBe(false);
      expect(r[t].bursts[1].lead, 'the second leads your run').toBe(true);
      expect(r[t].bursts[1].vx, 'she saw you running').toBeGreaterThan(0);
      expect(r[t].bursts[1].errLock, 'so it is NOT aimed at the lock').toBeGreaterThan(0.01);
    }
    expect(r[3].T.lead, 'leading further at tier 3').toBeGreaterThan(r[2].T.lead);
  });
});

describe('HANDS FROM THE GROUND!: "2, 3, and they move faster"', () => {
  it('twice as big, three waves each opening where you stand when it starts, a faster wind-up and rise, one id', () => {
    const r = STAGE(`
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); one.x = you.x - 700; one.y = groundY() - 330;
        var T = oneTier(one, 'hands'), id = ++BOSS_ATK_ID, rise = Math.ceil(ONE_HAND_REACH / T.spd), floorY = groundY();
        one._handSpots = [{ x:you.x, y:oneSurf(you.x, feetY(you) - 4) }];
        ONE_MOVES.hands(one, you, id);
        var waves = [], seen = {}, warns = [], x0 = you.x;
        var grab = function(i){ var hs = projectiles.filter(function(p){ return p.shape === 'onehand' && !p._w; }); if (hs.length){ hs.forEach(function(p){ p._w = 1; seen[p.bossAtk] = 1; }); waves.push({ i: i, n: hs.length, r: hs[0].r, spd: hs[0].vy, xs: hs.map(function(p){ return Math.round(p.x); }).sort(function(a, b){ return a - b; }) }); } };
        grab(0);
        for (var i=1; i<4*(rise + T.crack) + 20; i++){
          one._atkTimer = 1e9; one.x = you.x - 700; one.y = groundY() - 330; you.invuln = 99;
          if (i === 2) you.x = x0 + 400; if (i === rise + T.crack + 6) you.x = x0 - 400;
          var w0 = oneFx.filter(function(e){ return e.kind === 'crackwarn'; }).length;
          step(); you.x = you.x; grab(i);
          var ws = oneFx.filter(function(e){ return e.kind === 'crackwarn'; }); if (ws.length > w0) warns.push({ i: i, mid: Math.round(ws[ws.length - 1].spots[0].x), you: Math.round(you.x), crack: ws[ws.length - 1].max });
        }
        out[t] = { T: T, rise: rise, waves: waves, ids: Object.keys(seen).length, warns: warns, tel: oneTelLen(one, 'hands'), x0: Math.round(x0), busy: oneBusy(one) };
      });
      return out;`);
    expect([r[1].tel, r[2].tel, r[3].tel], 'a faster wind-up each tier (it was 36)').toEqual([24, 22, 20]);
    for (const t of [1, 2, 3]) {
      expect(r[t].waves.length, `tier ${t}: three waves`).toBe(3);
      r[t].waves.forEach(w => { expect(w.r, 'twice as big (it was 22)').toBe(44); expect(w.spd, 'rising at the tier speed (it was 12, 15, 18)').toBe(-r[t].T.spd); });
      expect(r[t].ids, 'one id: still one hit').toBe(1);
      expect(r[t].warns.length, 'a crack opens before each of the last two').toBe(2);
      r[t].warns.forEach(wn => { expect(Math.abs(wn.mid - wn.you), 'where you stand when it opens').toBeLessThanOrEqual(2); expect(wn.crack, 'a short crack').toBe(r[t].T.crack); });
      expect(Math.abs(r[t].waves[1].xs[Math.floor(r[t].waves[1].xs.length/2)] - (r[t].x0 + 400)), 'wave 2 where you had gone').toBeLessThanOrEqual(2);
      expect(Math.abs(r[t].waves[2].xs[Math.floor(r[t].waves[2].xs.length/2)] - (r[t].x0 - 400)), 'wave 3 where you had gone next').toBeLessThanOrEqual(2);
      expect(r[t].busy, 'then it is over').toBe(false);
    }
    expect([r[1].waves[0].n, r[2].waves[0].n, r[3].waves[0].n], 'hands a wave, spread twice as wide').toEqual([3, 5, 7]);
    expect(r[3].T.spd > r[2].T.spd && r[2].T.spd > r[1].T.spd, 'faster each tier').toBe(true);
    expect(r[1].T.spd, 'faster than the 12 it was').toBeGreaterThan(12);
  });

  it('a heavy rumble through the wind-up and the cracks, a shake at each burst, and glowing cracks that stay', () => {
    const r = STAGE(`
      setTier(2); fresh(); one.x = you.x - 700; one.y = groundY() - 330;
      var T = oneTier(one, 'hands'), calls = [], imp = impact, shakes = [];
      impact = function(x, y, o){ calls.push([o && o.shake, o && o.debris, !!(o && o.mark)]); return imp.apply(this, arguments); };
      try {
        one._telKind = 'hands'; one._tel = oneTelLen(one, 'hands'); one._handSpots = [{ x:you.x, y:oneSurf(you.x, feetY(you) - 4) }]; one._rumble = one._f + one._tel + 2;
        var peak = 0; shakeAmt = 0;
        for (var i=0; i<150; i++){ one._atkTimer = 1e9; one.x = you.x - 700; one.y = groundY() - 330; you.invuln = 99; step(); peak = Math.max(peak, shakeAmt); }
      } finally { impact = imp; }
      var A = oneArena(one);
      return { rumble: peak, calls: calls.filter(function(c){ return c[2]; }), cracks: A.marks.filter(function(m){ return m.kind === 'crack'; }).length, SHAKE: SHAKE_ON };`);
    expect(r.rumble, 'the screen shakes through the wind-up').toBeGreaterThan(1);
    expect(r.calls.length, 'a burst of dirt and a crack at each wave').toBeGreaterThanOrEqual(3);
    expect(r.calls.some(c => c[0] === 12), 'shake 12 at a burst').toBe(true);
    expect(r.calls.every(c => c[1] === 10), 'ten dirt clods a hand').toBe(true);
    expect(r.cracks, 'and the cracks stay: glowing, then dark').toBeGreaterThanOrEqual(3);
  });
});

describe('OUT OF ORBIT!: compressed planets', () => {
  it('from tier 2 each planet leaves big and slow, is squeezed small and sped up 40% of the way down its lane, and cracks into five pieces at the end; tier 1 is plain', () => {
    const r = STAGE(`
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); IMPACT_DEBRIS = []; one.x = you.x - 1000; one.y = groundY() - 330; you.x = WW*0.5 + 1500;
        var T = oneTier(one, 'orbitkick'), id = ++BOSS_ATK_ID;
        oneKickPass(one, T, id, 1, one.y, []);   // the marked lane alone
        var ps = own().filter(function(p){ return ONE_PLANETS.indexOf(p.shape) >= 0; }), p = ps[0], rows = [], fx0 = oneFx.length;
        rows.push([p.r, +Math.hypot(p.vx, p.vy).toFixed(3)]);
        var life0 = p.life, t1 = p.oComp ? p.oComp.t1 : null, debris0 = IMPACT_DEBRIS.length, sq = 0, crackAt = null;
        for (var i=0; i<life0 + 3 && p.life > 0; i++){
          one._atkTimer = 1e9; you.invuln = 99; you.x = WW*0.5 + 1500; one.x = WW*0.5 - 1500; one.y = groundY() - 330;
          var l0 = p.life; step();
          if (oneFx.some(function(e){ return e.kind === 'squash'; })) sq++;
          if (i === (t1 || 1e9) + 1) rows.push([p.r, +Math.hypot(p.vx, p.vy).toFixed(3)]);
          if (p.life <= 1 && crackAt === null) crackAt = i;
        }
        out[t] = { n: ps.length, shapes: ps.map(function(q){ return q.shape; }), rows: rows, t1: t1, life0: life0, squash: sq > 0, v2: p.oComp ? p.oComp.v2 : null, spd: T.spd, comp: T.comp, debrisAdded: IMPACT_DEBRIS.length - debris0, hasComp: !!p.oComp };
      });
      return out;`);
    expect(r[1].hasComp, 'tier 1: plain planets').toBe(false);
    expect(r[1].rows[0][0], 'r 24, as ever').toBe(24);
    for (const t of [2, 3]) {
      expect(r[t].hasComp).toBe(true);
      expect(r[t].rows[0][0], 'leaves big').toBe(34);
      expect(r[t].rows[0][1], 'and slow: 60% of its speed').toBeCloseTo(r[t].spd * 0.6, 2);
      expect(r[t].t1, '40% of the way down its lane').toBe(Math.round(r[t].life0 * 0.4));
      expect(r[t].rows[1][0], 'squeezed small').toBe(20);
      expect(r[t].rows[1][1], 'and snapped faster than it began').toBeCloseTo(r[t].v2, 2);
      expect(r[t].v2, 'faster than its ordinary speed').toBeGreaterThan(r[t].spd);
      expect(r[t].squash, 'with a squash flash').toBe(true);
    }
    expect(r[3].v2 / r[3].spd, 'squeezed harder at tier 3').toBeGreaterThan(r[2].v2 / r[2].spd);
    expect(r[2].shapes.every(s => ['oneearth', 'oneweird', 'oneskate'].includes(s)), 'Earth, the Really Weird Planet and the Skateboard Planet').toBe(true);
    expect(new Set(r[3].shapes).size, 'a different planet down the same lane').toBeGreaterThan(1);
    expect(r[2].debrisAdded, 'at the end of its lane it cracks into five pieces').toBeGreaterThanOrEqual(5);
  });

  it('from tier 2 the whole kick comes twice: the second lanes are lit where you stand after the first; 3, 4 and 5 lanes of 2, 3 and 4 planets', () => {
    const r = STAGE(`
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); one.x = you.x - 300; one.y = groundY() - 330;
        var T = oneTier(one, 'orbitkick'), id = ++BOSS_ATK_ID;
        one._telDir = 1; one._kickY = hurtCY(you); one._kickLanes = oneKickLanes(one, one._kickY);
        ONE_MOVES.orbitkick(one, you, id);
        var feet0 = oneFx.filter(function(e){ return e.kind === 'foot'; }).length, planets0 = own().filter(function(p){ return ONE_PLANETS.indexOf(p.shape) >= 0; }).length;
        var warns = [], feet = feet0, i;
        for (i=0; i<200 && (oneBusy(one) || i < 5); i++){
          one._atkTimer = 1e9; you.invuln = 99; one.x = you.x - 300 - 700*0; one.y = groundY() - 330;
          if (i === 20) you.y = groundY() - you.r;
          var w0 = oneFx.filter(function(e){ return e.kind === 'lanewarn'; }).length; step();
          var ws = oneFx.filter(function(e){ return e.kind === 'lanewarn'; }); if (ws.length > w0) warns.push({ i: i, ys: ws[ws.length-1].ys.length });
        }
        var planets1 = own().filter(function(p){ return ONE_PLANETS.indexOf(p.shape) >= 0; }).length;
        out[t] = { T: T, feet0: feet0, planets0: planets0, warns: warns, frames: i, id: Object.keys(own().reduce(function(a, p){ a[p.bossAtk] = 1; return a; }, {})).length };
      });
      return out;`);
    expect([r[1].feet0, r[2].feet0, r[3].feet0], 'the kick down 3, 4 and 5 lanes').toEqual([3, 4, 5]);
    expect([r[1].planets0, r[2].planets0, r[3].planets0], 'with 2, 3 and 4 planets down each ("more bullets!")').toEqual([2 * 3, 3 * 4, 4 * 5]);
    expect(r[1].warns.length, 'tier 1: the kick comes once').toBe(0);
    expect(r[2].warns.length, 'tier 2: lit again for the second').toBe(1);
    expect(r[2].warns[0].ys, 'on the same number of lanes').toBe(4);
    expect(r[1].T.kicks).toBe(1);
    expect([r[2].T.kicks, r[3].T.kicks]).toEqual([2, 2]);
  });
});
