import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import { bootMonolith } from './helpers/smash-golden.js';
import { mulberry32 } from './helpers/prng.js';
import { bootValidating } from './helpers/validating-canvas.js';

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
    expect(r.star.map(x => x[1]), '...and every rock leading your run, at every tier ("rocks should anticipate your direction.", 2026-10-02): it was tier 3 alone, 10').toEqual([8, 12, 16]);
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
        // the first ring's gaps where we say, spread round the ring (their places are the dice's, and four gaps half as wide again can overlap): the four are four
        var R0 = Math.random, seq = [0.10, 0.30, 0.65, 0.85], q = 0; Math.random = function(){ return q < seq.length ? seq[q++] : R0(); };   // (none across the +-180 degrees the count below starts from)
        try { ONE_MOVES.screechy(one, you, id); } finally { Math.random = R0; }
        var first = own(), n0 = first.length, split0 = first[0].oSplit, veer0 = first[0].oVeer;
        var gapsOf = function(ps){ var a = ps.map(function(p){ return Math.round(Math.atan2(p.vy, p.vx)*180/Math.PI/2); }).sort(function(x, y){ return x - y; }), g = 0; for (var i=1;i<a.length;i++) if (a[i] - a[i-1] > 3) g++; return g; };
        var gaps0 = gapsOf(first);
        for (var i=0; i<T.rings*T.ringGap + 4; i++){ one._atkTimer = 1e9; you.invuln = 99; step(); own().forEach(function(p){ seen[p.bossAtk] = 1; }); peak = Math.max(peak, own().length); }
        out[t] = { rings: T.rings, n0: n0, split: split0, veer: veer0, ids: Object.keys(seen).length, same: Object.keys(seen)[0] === String(id), peak: peak, gaps0: gaps0, busy: oneBusy(one) };
      });
      return out;`);
    expect([r[1].rings, r[2].rings, r[3].rings], 'two rings, two, and three in phase 3: it comes in waves now').toEqual([2, 2, 3]);
    for (const t of [1, 2, 3]) {
      expect(r[t].n0, `tier ${t}: a ring of 360 pellets less its gaps (wider since "same thing for screechy": tier 1 has 196)`).toBeGreaterThan(150);
      expect(r[t].n0).toBeLessThanOrEqual(360);
      expect(r[t].ids, `tier ${t}: one attack id for every pellet of every ring`).toBe(1);
      expect(r[t].same).toBe(true);
    }
    expect(r[1].split, 'tier 1: no shatter').toBeUndefined();
    expect(r[2].split, 'tier 2: the pellets split 14 frames out').toBe(14);
    expect(r[3].split, 'and sooner at tier 3').toBeLessThan(14);
    expect(r[3].veer, 'veering further').toBeGreaterThan(r[2].veer);
    expect(r[3].peak, '"more bullets!": hundreds in the air at once in phase 3').toBeGreaterThan(r[1].peak * 1.8);
    expect(r[1].gaps0, 'tier 1: the first ring has its four gaps').toBe(4);
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
  it('the copies hang in an arc over her and follow her, then go one at a time, each at where you are at its own launch; six at every tier ("Fewer bullets": 1.2x of the five it began as)', () => {
    const r = STAGE(`
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); one.x = you.x + 400; one.y = groundY() - 420;
        var T = oneTier(one, 'knives'), id = ++BOSS_ATK_ID, t0 = one._f;
        ONE_MOVES.knives(one, you, id);
        var knives = own(), hungAt = knives.map(function(p){ return { x: p.x - one.x, y: p.y - one.y }; });
        var firstGo = null, goAt = [], dirs = [], youAt = [], prev = knives.map(function(){ return false; }), h0 = [0, 0];   // (h0: the first knife's homing, as it goes -- it is spent soon after)
        for (var i=0; i<T.hang + T.n*T.every + 4; i++){
          one._atkTimer = 1e9; you.invuln = 99; you.x += 2;   // you drift right a little all the time
          one.x += 0.5;                                        // and she drifts too: the hung knives go with her
          step();
          knives.forEach(function(p, k){ if (!prev[k] && !p.oHang){ prev[k] = true; goAt.push(one._f - t0); dirs.push(Math.atan2(p.vy, p.vx)); youAt.push([you.x, hurtCY(you), p.x, p.y]); if (k === 0) h0 = [p.oHome, p.oHomeT]; } });
        }
        out[t] = { n: knives.length, T: T, shape: knives[0].shape, dmg: knives[0].dmg, ids: Object.keys(knives.reduce(function(a, p){ a[p.bossAtk] = 1; return a; }, {})).length,
          hungAbove: hungAt.every(function(h){ return h.y < 0; }), goAt: goAt, dirs: dirs, aimErr: youAt.map(function(a, k){ return Math.abs(Math.atan2(a[1] - a[3], a[0] - a[2]) - dirs[k]); }),
          home: h0[0], homeT: h0[1] };
      });
      return out;`);
    expect([r[1].n, r[2].n, r[3].n], 'six knives at every tier: 1.2x of the five Four\'s seekers were ("nerf one." / "Fewer bullets"); it was 8, 12 and 16').toEqual([6, 6, 6]);
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
    // "KNIFE FLURRY!: Nerf: gentler homing" (the owner, 2026-10-02, attack by attack): half the turn rate, and the homing ends sooner. It was 0.026 / 0.04 / 0.055 for 60 / 70 / 80 frames.
    const was = { home: [0.026, 0.04, 0.055], homeT: [60, 70, 80] };
    [1, 2, 3].forEach((t, k) => {
      expect(r[t].home, `tier ${t}: half the turn rate it was (${was.home[k]})`).toBeCloseTo(was.home[k] / 2, 9);
      expect(r[t].homeT, `tier ${t}: homing ends sooner than ${was.homeT[k]} frames`).toBeLessThan(was.homeT[k]);
      // "shorter attacks" was not picked: with six knives they go more slowly, so the flurry lasts as long as it did (8 x 4, 12 x 3, 16 x 3 frames)
      expect(r[t].T.n*r[t].T.every, `tier ${t}: the flurry is not shorter`).toBeGreaterThanOrEqual([32, 36, 48][k]);
    });
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
  it('tier 1 is a plain ring of 16 in three bursts ("Fewer bullets": about 1.2x of the 14 it began as; and their gaps half as wide again); from tier 2 the bursts turn opposite ways, gold and purple, and cross like a pinwheel; all one id', () => {
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
    expect(r[1].n, 'tier 1: three bursts of 16 (it was one of 14, then 24 a burst)').toEqual([16, 16, 16]);
    expect(r[1].spin, 'tier 1: no twist').toEqual([undefined, undefined, undefined]);
    expect(r[1].shape).toBeUndefined();
    expect(r[2].n, 'tier 2: four bursts of 16 (it was 28)').toEqual([16, 16, 16, 16]);
    expect(r[2].spin.map(Math.sign), 'turning opposite ways, clockwise first').toEqual([1, -1, 1, -1]);
    expect(Math.abs(r[2].spin[0]), 'a few degrees a frame').toBeCloseTo(0.042, 6);
    expect(r[2].shape, 'in the Vortex stars').toBe('onering');
    expect(r[2].colors, 'gold and purple').toBe(2);
    expect(r[3].n, 'tier 3: six bursts of 16 (it was 32)').toEqual([16, 16, 16, 16, 16, 16]);
    expect(r[3].spin.map(Math.sign), 'alternating, clockwise first').toEqual([1, -1, 1, -1, 1, -1]);
    expect(Math.abs(r[3].spin[0]), 'turning harder').toBeGreaterThan(Math.abs(r[2].spin[0]));
    expect(r[2].off[1] - r[2].off[0], 'the second ring is half a step round, so the arms cross').toBeCloseTo(Math.PI/16, 3);
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

  it('tier 1: five rocks in a row; tier 2: seven in a star; tier 3: ten ("Fewer bullets": 1.2x of 4, 6 and 8); each at where you are as it goes, and leading your run (see below), thrown over as long as before', () => {
    const r = STAGE(`
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); one.x = you.x + 450; one.y = groundY() - 420;
        var T = oneTier(one, 'moonrocks'), id = ++BOSS_ATK_ID, t0 = one._f, lock = [you.x, hurtCY(you)], chips0 = oneArena(one).chips;
        ONE_MOVES.moonrocks(one, you, id);
        var rocks = own(), rel = rocks.map(function(p){ return [p.oHang.dx, p.oHang.dy]; }), goAt = [], dirs = [], youAt = [];
        var prev = rocks.map(function(){ return false; }), chips = oneArena(one).chips - chips0;
        for (var i=0; i<T.n*T.every + 12; i++){ one._atkTimer = 1e9; you.invuln = 99; you.x += 3; step();   // you drift right 3 a frame
          rocks.forEach(function(p, k){ if (!prev[k] && !p.oHang){ prev[k] = true; goAt.push(one._f - t0); dirs.push(Math.atan2(p.vy, p.vx)); youAt.push([you.x, hurtCY(you), p.x, p.y, you.vx, you.vy]); } }); }
        out[t] = { n: rocks.length, T: T, shape: rocks[0].shape, dmg: rocks[0].dmg, ids: Object.keys(rocks.reduce(function(a, p){ a[p.bossAtk] = 1; return a; }, {})).length, goAt: goAt,
          aim: rocks[0].oHang === null ? null : null, lock: lock, dirs: dirs, youAt: youAt, spread: Math.max.apply(null, rel.map(function(q){ return Math.abs(q[0]); })), up: rel.every(function(q){ return q[1] < 0; }), chips: chips,
          launch: null };
        // the launch rule each rock was given
        fresh(); ONE_MOVES.moonrocks(one, you, ++BOSS_ATK_ID); out[t].launch = own().map(function(p){ return p.oHang.launch; });
      });
      return out;`);
    // (it was 8, 10 and 15 after "much harder"; 4, 6 and 8 before it)
    expect([r[1].n, r[2].n, r[3].n], '"nerf one." / "Fewer bullets": 1.2x of the original 4, 6 and 8').toEqual([5, 7, 10]);
    for (const t of [1, 2, 3]) {
      expect(r[t].shape).toBe('moonrock');
      expect(r[t].ids, 'one id').toBe(1);
      expect(r[t].up, 'they rise over her').toBe(true);
      expect(r[t].goAt.length, 'every rock goes').toBe(r[t].n);
      for (let k = 1; k < r[t].goAt.length; k++) expect(r[t].goAt[k] - r[t].goAt[k - 1], 'one after another').toBe(r[t].T.every);
      expect(r[t].chips, 'the Moon in her sky has lost a chunk with every volley').toBe(1);
      expect(r[t].launch.every(l => l.aim === 'foe' && l.lead === r[t].T.lead), `tier ${t}: each rock at where you are as it goes, leading your run by the tier's lead`).toBe(true);
      // each goes at you as it goes: the aim is where you stand, plus what you are doing (your speed x the lead)
      r[t].youAt.forEach((a, k) => expect(Math.abs(Math.atan2(a[1] + a[5]*r[t].T.lead*0.5 - a[3], a[0] + a[4]*r[t].T.lead - a[2]) - r[t].dirs[k]), `tier ${t}: each rock goes at you as it goes`).toBeLessThan(0.1));
    }
    expect(r[2].spread, 'in a star (95 px across), where tier 1 hangs its five in a row').toBeLessThanOrEqual(96);
    expect(r[1].spread, 'tier 1 hangs its five in a row, 44 apart: 88 each way from the middle').toBeCloseTo(88, 6);
    // "attacks are not shorter" ("shorter attacks" was not picked): with fewer rocks they are thrown more slowly, so a throw lasts as long as it did (8 x 5, 10 x 6, 15 x 6 frames)
    [1, 2, 3].forEach((t, k) => expect(r[t].T.n*r[t].T.every, `tier ${t}: the throw is not shorter`).toBeGreaterThanOrEqual([40, 60, 90][k]));
  });

  it('"rocks should anticipate your direction." (the owner, 2026-10-02): every rock leads your run at EVERY tier -- it used to be tier 3 alone, 10 frames; now 8, 12 and 16', () => {
    const r = STAGE(`
      var out = { leads: [], rows: [] };
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); one.x = you.x + 450; one.y = groundY() - 420;
        var T = oneTier(one, 'moonrocks'); out.leads.push(T.lead);
        ONE_MOVES.moonrocks(one, you, ++BOSS_ATK_ID);
        you.vx = 5; you.vy = 0;   // you are running right at 5 a frame
        var rocks = own();
        rocks.forEach(function(p){ var H = p.oHang; p.oHang = null; p.delay = 0; oneLaunch(one, p, H); });
        out.rows.push(rocks.map(function(p){
          var a = Math.atan2(p.vy, p.vx), plain = Math.atan2(hurtCY(you) - p.y, you.x - p.x), led = Math.atan2(hurtCY(you) - p.y, you.x + 5*T.lead - p.x);
          return { toLed: Math.abs(a - led), toPlain: Math.abs(a - plain) }; }));
        you.vx = 0;
      });
      return out;`);
    expect(r.leads, 'a lead at every tier, longer as the rocks come faster; tier 3 is no less than the 10 it was').toEqual([8, 12, 16]);
    r.rows.forEach((rocks, i) => {
      expect(rocks.length, `tier ${i + 1}: rocks`).toBeGreaterThan(0);
      rocks.forEach((q) => {
        expect(q.toLed, `tier ${i + 1}: the rock is aimed where you are heading`).toBeLessThan(1e-6);
        expect(q.toPlain, `tier ${i + 1}: not where you stand`).toBeGreaterThan(0.005);
      });
    });
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
    // volleys x two eyes x a fan: 1.2x of the 2, 4 and 18 a burst they were before the rebuild ("nerf one." / "Fewer bullets"); they were 12, 18 and 40 after "much harder"
    expect([r[1].bursts[0].n, r[2].bursts[0].n, r[3].bursts[0].n], 'a burst: one volley of one, two of one, four of three, from each eye').toEqual([1 * 2 * 1, 2 * 2 * 1, 4 * 2 * 3]);
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
          one.x = you.x - 250; one.y = groundY() - 300; one.vx = 0; one.vy = 0;   // held up and to the side, where her old orbit kept her (she flies level with you since 2026-10-03, and along her own row a strafe barely turns the aim)
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

  it('the whole kick comes twice (three times at the top): the next lanes are lit where you stand after the last; 3, 4 and 5 lanes of 1, 2 and 4 planets', () => {
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
    // with 1, 2 and 4 planets down each lane: 1.2x of the 1, 2 and 3 they were before the rebuild ("nerf one." / "Fewer bullets"); they were 2, 3 and 4 after "much harder"
    expect([r[1].planets0, r[2].planets0, r[3].planets0], 'a kick of 3, 8 and 20 planets').toEqual([1 * 3, 2 * 4, 4 * 5]);
    expect(r[1].warns.length, 'tier 1: lit again for the second kick').toBe(1);
    expect(r[1].warns[0].ys, 'on the same number of lanes').toBe(3);
    expect(r[2].warns.length, 'tier 2: the same').toBe(1);
    expect(r[2].warns[0].ys).toBe(4);
    expect(r[3].warns.length, 'tier 3: lit twice, three kicks').toBe(2);
    expect([r[1].T.kicks, r[2].T.kicks, r[3].T.kicks]).toEqual([2, 2, 3]);
  });
});

describe('"one could be harder... much harder. more bullets! also longer attacks."  -- "Same damage per hit"', () => {
  // What every attack made before the rebuild: bullets in the whole move (zap: columns), when each was one wave, ring, burst, volley or kick (the eye lasers' two bursts: 2 each). Pinned
  // so "about 1.2x" has something to be 1.2x of -- "much harder" (2026-09-30) took every attack to at least 1.5x of this, and "nerf one." (2026-10-02) took it back down.
  const OLD = { zap: [3, 4, 5], screechy: [300, 300, 300], ring: [14, 14, 14], knives: [5, 5, 5], mindread: [1, 2, 3], moonrocks: [4, 6, 8],
    eyelasers: [4, 8, 36], hands: [3, 5, 7], orbitkick: [3, 8, 15] };

  it('"nerf one." / "Fewer bullets": a part of every attack -- a wave, ring, burst, volley or kick -- is about 1.2x what the attack made before the rebuild, at every tier; and each still runs on for a while ("shorter attacks" was not picked)', () => {
    const r = STAGE(`
      var out = {};
      var go = function(k, t){
        setTier(t); fresh(); IMPACT_DEBRIS = [];
        var T0 = oneTier(one, k), ringN = null;
        if (k === 'screechy'){ var n0 = projectiles.length; oneScreechRing(one, T0, ++BOSS_ATK_ID); ringN = projectiles.length - n0; projectiles = []; }   // a ring, before any of it splits
        one.x = you.x - 900; one.y = groundY() - 380; you.x = WW*0.5 + 600; you.y = groundY() - you.r;
        var id = ++BOSS_ATK_ID, tgt = you, seen = new Set(), cols = 0, frames = 0, T = oneTier(one, k);
        var parts = T.waves || T.rings || T.bursts || T.volleys || T.kicks || (k === 'hands' ? 3 : 1);   // what the move is made of: waves, rings, bursts, volleys, kicks
        one._eyeBurst = 0; one._telX = you.x; one._telY = hurtCY(you); one._aimX = you.x; one._aimY = hurtCY(you); one._telDir = 1; one._kickY = hurtCY(you);
        one._handSpots = [{ x:you.x, y:oneSurf(you.x, feetY(you) - 4) }]; one._zapCols = null; one._kickLanes = oneKickLanes(one, one._kickY);
        var count = function(){ projectiles.forEach(function(p){ if (p.owner === -2 && !seen.has(p)) seen.add(p); }); cols += oneFx.filter(function(e){ return e.kind === 'column' && !e._c && (e._c = 1); }).length; };
        if (k === 'eyelasers'){ one._telKind = k; one._tel = oneTelLen(one, k); }
        else { ONE_MOVES[k](one, tgt, id); count(); }
        for (var i=0; i<600 && (oneBusy(one) || one._tel > 0 || i < 2); i++){ one._atkTimer = 1e9; one.x = you.x - 900; one.y = groundY() - 380; you.invuln = 99; step(); count(); frames++; }
        var bullets = k === 'zap' ? cols : seen.size;
        return { bullets: bullets, frames: frames, parts: parts, per: ringN != null ? ringN : bullets/parts };
      };
      ['zap', 'screechy', 'ring', 'knives', 'mindread', 'moonrocks', 'eyelasers', 'hands', 'orbitkick', 'fold'].forEach(function(k){ out[k] = [1, 2, 3].map(function(t){ return go(k, t); }); });
      return out;`);
    // a part of the move (a wave, ring, burst or kick; the whole move for the rocks and the knives) against what the whole move made before the rebuild (the eyelasers' old two bursts: half each)
    const was = { ...OLD, eyelasers: OLD.eyelasers.map((x) => x / 2) };
    for (const k of ['moonrocks', 'knives', 'ring', 'eyelasers', 'orbitkick']) {
      [0, 1, 2].forEach((t) => {
        const ratio = r[k][t].per / was[k][t];
        expect(ratio, `${k} at tier ${t + 1}: ${was[k][t]} before the rebuild, ${r[k][t].per} a part now: about 1.2x, not less`).toBeGreaterThanOrEqual(1 - 1e-9);
        expect(ratio, `${k} at tier ${t + 1}: ${was[k][t]} before the rebuild, ${r[k][t].per} a part now: about 1.2x, not much more (they were at least 1.5x)`).toBeLessThanOrEqual(1.35);
      });
    }
    // (Zap to Dust's waves, Screechy's rings and the hands' waves were at the original count already, and stay there)
    for (const k of ['zap', 'screechy', 'hands']) {
      [0, 1, 2].forEach((t) => expect(r[k][t].per / was[k][t], `${k} at tier ${t + 1}: ${was[k][t]} before the rebuild, ${r[k][t].per} a wave or ring now`).toBeLessThanOrEqual(1.35));
    }
    // ...and every attack is still made of as many parts as it was ("shorter attacks" was not picked): waves, rings, bursts, volleys, kicks
    expect([1, 2, 3].map((t) => r.zap[t - 1].parts), 'zap: waves').toEqual([2, 3, 4]);
    expect([1, 2, 3].map((t) => r.screechy[t - 1].parts), 'screechy: rings').toEqual([2, 2, 3]);
    expect([1, 2, 3].map((t) => r.ring[t - 1].parts), 'ring: bursts').toEqual([3, 4, 6]);
    expect([1, 2, 3].map((t) => r.eyelasers[t - 1].parts), 'eye lasers: bursts').toEqual([2, 2, 3]);
    expect([1, 2, 3].map((t) => r.orbitkick[t - 1].parts), 'out of orbit: kicks').toEqual([2, 2, 3]);
    expect([1, 2, 3].map((t) => r.mindread[t - 1].parts), 'mind read: volleys').toEqual([2, 2, 3]);
    // "also longer attacks": none of them is over in a frame or two any more (the eye lasers' two or three bursts, a ring after ring, wave after wave)
    for (const k of ['zap', 'screechy', 'ring', 'knives', 'mindread', 'moonrocks', 'eyelasers', 'hands', 'orbitkick', 'fold']) {
      [0, 1, 2].forEach((t) => expect(r[k][t].frames, `${k} at tier ${t + 1} runs on after it fires`).toBeGreaterThanOrEqual(24));
    }
    expect(r.fold[2].frames, 'the fold chain is longer at the top').toBeGreaterThan(r.fold[0].frames);
    expect(r.ring[2].frames, 'so is the ring').toBeGreaterThan(r.ring[0].frames);
  });

  it('MIND READ! "Keep" (the owner, 2026-10-02, attack by attack): not touched by "Fewer bullets" or anything else -- its rows are exactly what they were', () => {
    const r = STAGE(`return JSON.parse(JSON.stringify(ONE_DECK_TIERS.mindread));`);
    expect(r, 'three, five and seven orbs a volley; two volleys, and three; homing from tier 2; flung back from tier 2').toEqual([
      { shots: 3, volleys: 2, vgap: 30, homing: 0, fling: 0, catchT: 0 },
      { shots: 5, volleys: 2, vgap: 26, homing: 0.06, fling: 1, catchT: 0 },
      { shots: 7, volleys: 3, vgap: 24, homing: 0.07, fling: 1.2, catchT: 26 }]);
  });

  it('and not one of them hits harder: no shot hits for more than that attack\'s own hit always did (her 33, times a special\'s own multiplier), and a move is one attack id (the eye lasers\' later bursts the one exception)', () => {
    const r = STAGE(`
      var out = {}, worst = 0;
      var go = function(k, t){
        setTier(t); fresh();
        one.x = you.x - 900; one.y = groundY() - 380; you.x = WW*0.5 + 600; you.y = groundY() - you.r;
        var id = ++BOSS_ATK_ID, ids = new Set(), maxDmg = 0, maxCap = 0, T = oneTier(one, k), unit = oneDmg()*(T.dmg || 1);   // (a special's own multiplier, as it always was: 0.8 to 1.2 of her 33)
        one._eyeBurst = 0; one._telX = you.x; one._telY = hurtCY(you); one._aimX = you.x; one._aimY = hurtCY(you); one._telDir = 1; one._kickY = hurtCY(you);
        one._handSpots = [{ x:you.x, y:oneSurf(you.x, feetY(you) - 4) }]; one._zapCols = null; one._kickLanes = oneKickLanes(one, one._kickY);
        var look = function(){ projectiles.forEach(function(p){ if (p.owner === -2){ ids.add(p.bossAtk); maxDmg = Math.max(maxDmg, p.dmg); maxCap = Math.max(maxCap, p.bossCap == null ? p.dmg : p.bossCap); } }); };
        if (k === 'eyelasers'){ one._telKind = k; one._tel = oneTelLen(one, k); } else { ONE_MOVES[k](one, you, id); look(); }
        for (var i=0; i<600 && (oneBusy(one) || one._tel > 0 || i < 2); i++){ one._atkTimer = 1e9; one.x = you.x - 900; one.y = groundY() - 380; you.invuln = 99; step(); look(); }
        return { ids: ids.size, maxDmg: maxDmg, maxCap: maxCap, unit: unit };
      };
      ['zap', 'screechy', 'ring', 'knives', 'mindread', 'moonrocks', 'eyelasers', 'hands', 'orbitkick'].forEach(function(k){ out[k] = [1, 2, 3].map(function(t){ return go(k, t); }); });
      return { out: out, dmg: oneDmg() };`);
    expect(r.dmg).toBe(33);
    for (const [k, rows] of Object.entries(r.out)) {
      rows.forEach((row, t) => {
        expect(row.maxDmg, `${k} tier ${t + 1}: a shot hits for at most what that attack's hit always was`).toBeLessThanOrEqual(row.unit + 1e-9);
        expect(row.maxCap, `${k} tier ${t + 1}: and the attack's cap is no more`).toBeLessThanOrEqual(row.unit + 1e-9);
        expect(row.unit, 'and that is at most 33 x 1.2 (the top of the specials\' own multipliers, unchanged)').toBeLessThanOrEqual(33*1.2 + 1e-9);
        // (the zap makes no shots: its columns hit through their own id, which the ZAP tests read)
        expect(row.ids, `${k} tier ${t + 1}: ${k === 'eyelasers' ? 'two ids (the second burst has its own, a third shares it)' : 'one attack id'}`).toBe(k === 'eyelasers' ? 2 : (k === 'zap' ? 0 : 1));
      });
    }
  });

  it('a fighter standing through a whole move takes one hit from it, not one per bullet: the ring and the kicks, run over you', () => {
    const r = STAGE(`
      var out = {};
      [['ring', 3], ['screechy', 3], ['hands', 3], ['zap', 3], ['knives', 3]].forEach(function(kt){
        var k = kt[0], t = kt[1];
        setTier(t); fresh(); worldPlats = worldPlats.filter(function(p){ return p.solid; });
        one.x = you.x - 120; one.y = you.y - 60;
        var id = ++BOSS_ATK_ID; one._handSpots = [{ x:you.x, y:oneSurf(you.x, feetY(you) - 4) }]; one._telX = you.x; one._telY = hurtCY(you); one._zapCols = null;
        ONE_MOVES[k](one, you, id);
        var peak = 0;
        for (var i=0; i<260; i++){ one._atkTimer = 1e9; one.x = you.x - 120; one.y = you.y - 60; one._hop = null; you.invuln = 0; you.x = WW*0.5; you.y = groundY() - you.r; you.hitstun = 0; you.vx = 0; you.vy = 0; step(); peak = Math.max(peak, you.pct); }
        out[k] = peak;
      });
      return out;`);
    for (const [k, pct] of Object.entries(r)) expect(pct, `${k}: a whole move over a fighter who does not move is one hit of at most 33`).toBeLessThanOrEqual(33.0001);
  });
});

describe('contact damage: "Evil leafy level." -- and then "nerf one." / "Lighter contact"', () => {
  // The owner, 2026-10-02: "nerf one." Asked which, they picked "Lighter contact": touching her hurts half as much (ONE_CONTACT's damage halved: 0.3 of the base, 6.6%)
  // and knocks less (13 to 9); her 75 frames of grace stay. The numbers below are those; the "Evil leafy level" ones they replace are in the comments.
  // Round 17 (the owner, 2026-10-01), Evil Leafy's nerfs: "softer contact (knockback 13 -> 9, grace 75 -> 120 f; One keeps her own copy of the old numbers)". One's contact was read off
  // Evil Leafy's own code (a boss hit of 0.6, kx = sign*13, -12, invuln = max(invuln, 75)); hers is softer now, so this test no longer reads her code: One keeps the numbers hers had, in its
  // own ONE_CONTACT, and a change to hers does not touch it.
  it("touching her hurts HALF as much as it did (\"Lighter contact\": 6.6%, knocked 9 not 13, the same 75 frames of grace): One's own copy -- Evil Leafy's contact is 9 and 120 and One does not read hers", () => {
    const r = STAGE(`
      fresh(); one._hop = null; one._atkTimer = 1e9;
      var out = { c: ONE_CONTACT, base: BOSS_DMG_BASE, src: String(oneContact), el: [EL.touchKX, EL.touchGrace] };
      // change hers: One's hit does not move
      var kx0 = EL.touchKX, g0 = EL.touchGrace; EL.touchKX = 1; EL.touchGrace = 1;
      one.x = you.x; one.y = you.y; you.vx = 0; you.vy = 0; step();
      out.one = { pct: you.pct, vx: you.vx, invuln: you.invuln };
      EL.touchKX = kx0; EL.touchGrace = g0;
      // the same bump with the numbers it had before "Lighter contact" (0.6 of the base, knocked 13), the way it pushed: the knock it is lighter than
      var dir = Math.sign(out.one.vx) || 1;
      you.invuln = 0; you.hitstun = 0; you.pct = 0; you.vx = 0; you.vy = 0;
      applyHit(you, BOSS_DMG_BASE*0.6, dir*13, -12, null, { bossAtk: ++BOSS_ATK_ID });
      out.was = { pct: you.pct, vx: you.vx };
      return out;`);
    // The numbers Evil Leafy's contact check had when One copied them: applyHit(f, bossDmg()*0.6, kx, -12, ...), kx = sign*13, invuln = max(invuln, 75)
    expect(r.c, "\"Lighter contact\": half the damage (0.3 of the base, it was 0.6), knocked 9 (it was 13), the -12 lift and the 75 frames of grace as they were").toEqual({ dmg: r.base * 0.3, kx: 9, ky: -12, grace: 75 });
    expect(r.c.dmg, 'about 6.6%: half of the 13.2 it was, well under the 33 of one of her hits').toBeCloseTo(6.6, 6);
    expect(r.c.dmg, 'exactly half').toBeCloseTo(r.base * 0.6 / 2, 9);
    expect(r.el, "Evil Leafy's are softer now (Round 17): knocked 9, 120 frames of grace").toEqual([9, 120]);
    expect(r.src, "One's contact reads its own ONE_CONTACT and never hers").toMatch(/ONE_CONTACT/);
    expect(r.src).not.toMatch(/\bEL\b|touchKX|touchGrace/);
    expect(r.one.pct, 'with hers set to 1 and 1, One still hits for 6.6%').toBeCloseTo(6.6, 5);
    expect(Math.abs(r.one.vx), 'knocked by her 9 (hers would be 1): well over a 1').toBeGreaterThan(5);
    expect(Math.abs(r.one.vx), 'and less than the same bump at the old 13').toBeLessThan(Math.abs(r.was.vx) - 1);
    expect(r.was.pct, 'which hurt twice as much').toBeCloseTo(13.2, 5);
    expect(r.one.invuln, 'with her 75 frames of grace (hers would be 1)').toBeGreaterThanOrEqual(70);
    expect(r.one.invuln).toBeLessThanOrEqual(75);
  });

  it('a fighter who overlaps her takes the hit, flies off the way it pushed, and cannot be hit again until the grace is over; one beside her is untouched', () => {
    const r = STAGE(`
      fresh(); one.x = you.x; one.y = you.y; you.vx = 0; you.vy = 0; one._hop = null;
      var out = {};
      one._atkTimer = 1e9; step();
      out.first = { pct: you.pct, vx: you.vx, vy: you.vy, invuln: you.invuln };
      var p0 = you.pct;
      for (var i=0;i<60;i++){ one.x = you.x; one.y = you.y; one._atkTimer = 1e9; step(); }
      out.during = you.pct - p0;
      for (var j=0;j<40;j++){ one.x = you.x; one.y = you.y; one._atkTimer = 1e9; step(); }
      out.after = you.pct - p0 > 0;
      // a fighter beside her, outside her body
      fresh(); one.x = you.x + one.r + 200; one.y = you.y; one._atkTimer = 1e9; var q0 = you.pct; step(); out.beside = you.pct - q0;
      return out;`);
    expect(r.first.pct, '6.6% ("Lighter contact": it was 13.2)').toBeCloseTo(6.6, 5);
    expect(r.first.invuln, 'and a long grace').toBeGreaterThanOrEqual(70);
    expect(r.first.vy, 'thrown up').toBeLessThan(0);
    expect(r.during, 'no second bump while the grace lasts').toBe(0);
    expect(r.after, 'and a bump again once it is over').toBe(true);
    expect(r.beside, 'beside her: nothing').toBe(0);
  });

  it('her ghost is not hurt by her; a giant One has more body to touch; no contact in the Vortex or in her ending', () => {
    const r = STAGE(`
      var out = {};
      fresh(); ONE_MOVES.ghost(one, you, ++BOSS_ATK_ID); var g = one._ghost; g.controller = 'still'; g.invuln = 0; one.x = g.x; one.y = g.y; var g0 = g.pct; one._atkTimer = 1e9; oneContact(one); out.ghost = g.pct - g0; oneGhostDown(g, true);
      // reach: a fighter just outside her body, then she grows
      // a spot 110 px from the edge of your hurtbox: outside her body (88), inside it once she is giant (1.6 x 88)
      fresh(); one.r = one._baseR; one.y = you.y; for (var dx = 400; dx > 0; dx--){ one.x = you.x + dx; if (hurtGap(you, one.x, one.y) <= 110) break; }
      you.invuln = 0; var a0 = you.pct; oneContact(one); out.outside = you.pct - a0;
      one.r = Math.round(one._baseR*1.6); you.invuln = 0; oneContact(one); out.giant = you.pct - a0;
      // in the Vortex
      fresh(); one.r = one._baseR; one.x = you.x; one.y = you.y; one._hop = { ph:'out', t:0, r0:one.r, giant:false }; you.invuln = 0; oneContact(one); out.hop = you.pct; one._hop = { ph:'fly', t:3, r0:one.r, giant:false }; oneContact(one); out.fly = you.pct; one._hop = null;
      // dying
      fresh(); one.r = one._baseR; one.x = you.x; one.y = you.y; one._dying = 100; you.invuln = 0; oneContact(one); out.dying = you.pct; one._dying = 0;
      return out;`);
    expect(r.ghost, 'her ghost is on her side').toBe(0);
    expect(r.outside, 'just outside her body').toBe(0);
    expect(r.giant, 'grown 1.6 times, the same spot is inside her').toBeCloseTo(6.6, 5);
    expect(r.hop, 'nothing while she is in the Vortex').toBe(0);
    expect(r.fly, 'and nothing while she flies in').toBe(0);
    expect(r.dying, 'nor in her ending').toBe(0);
  });
});

describe('stocks at her phase lines: "every 2 phases" (it was "also, no stock per phase.")', () => {
  // The owner, 2026-09-30: "also, no stock per phase." Then, 2026-10-02, "nerf one.": asked about the stock at her phase lines, they picked "every 2 phases" -- a stock back at every
  // SECOND line (the 2nd, the 4th), none at the 1st and the 3rd; the heal stays at every line. She has three lines (1500, 1000, 500), so in her fight it is the one at 1000.
  it('the rule is every second line: a stock at the 2nd and the 4th, none at the 1st and the 3rd; the heal at every one', () => {
    const r = STAGE(`
      var out = { rule: [0, 1, 2, 3, 4, 5, 6].map(function(n){ return oneLineStock(n); }), every: ONE_STOCK_EVERY, rows: [] };
      you._oneStocks0 = 9; you.stocks = 1;
      for (var n = 1; n <= 4; n++){ you.pct = 100; onePhaseReward(!oneLineStock(n)); out.rows.push([Math.round(you.pct), you.stocks]); }
      return out;`);
    expect(r.every, '"every 2 phases"').toBe(2);
    expect(r.rule, 'there is no line 0; then none, a stock, none, a stock, none, a stock').toEqual([false, false, true, false, true, false, true]);
    expect(r.rows, 'four lines: healed 64 each time, and a stock only at the 2nd and the 4th').toEqual([[36, 1], [36, 2], [36, 2], [36, 3]]);
  });

  it('in her fight: the first line heals and gives no stock, the second heals and gives one, the third heals and gives none -- and she has no fourth', () => {
    const r = STAGE(`
      you._oneStocks0 = 3; you.stocks = 1;
      var rows = [], line = function(hp){ you.pct = 100; one.hp = hp; one._atkTimer = 1e9; step(); rows.push([Math.round(you.pct), you.stocks, one._marks]); };
      line(1490); line(990); line(490);
      one.hp = 5; one._atkTimer = 1e9; step();   // (nearly nothing left of her: still no fourth line)
      return { rows: rows, marks: one._marks, stocks: you.stocks };`);
    expect(r.rows, 'line 1: healed, the one stock you had; line 2: healed, a stock back; line 3: healed, no stock').toEqual([[36, 1, 1], [36, 2, 2], [36, 2, 3]]);
    expect([r.marks, r.stocks], 'three lines in all, and no stock for the end').toEqual([3, 2]);
  });

  it("Steve Cobs's reward is exactly what it was: onePhaseReward() with no argument heals and gives the stock, and each of his tier lines calls it so", () => {
    const r = STAGE(`
      var out = {};
      you.stocks = 1; you._oneStocks0 = 3; you.pct = 100; onePhaseReward(true); out.noStock = [Math.round(you.pct), you.stocks];
      you.pct = 100; onePhaseReward(); out.cobs = [Math.round(you.pct), you.stocks];
      you.pct = 100; you.stocks = 3; onePhaseReward(); out.capped = [Math.round(you.pct), you.stocks];   // up to the stocks you started with, and no more
      out.src = String(updateCobs);
      return out;`);
    expect(r.noStock, "her odd lines' call: the heal only").toEqual([36, 1]);
    expect(r.cobs, 'no argument is his call: the heal and a stock back ("leave his as is until the owner has fought him")').toEqual([36, 2]);
    expect(r.capped, 'never past the stocks you started with').toEqual([36, 3]);
    expect(r.src, 'his tier line calls it with no argument, at every line').toMatch(/cobsTierUp\(s\); onePhaseReward\(\); \}/);
    expect(r.src, "and knows nothing of her every-second-line rule").not.toMatch(/oneLineStock|ONE_STOCK_EVERY/);
  });

  it('...and his fight pays it at every one of his four tier lines: a heal and a stock back each time', () => {
    const r = W.eval(`(function(){
      SETTINGS.itemRate = 0; SETTINGS.stocks = 3; LOCAL_PLAYERS = 1;
      startCobsFight(['Knife'], { story:true, onEnd:function(){ return true; } });
      var s = summons.find(function(o){ return o._cobsFight; }), you = fighters[0];
      s._hop = null; you.controller = 'still'; you._oneStocks0 = 9; you.stocks = 1;
      var rows = [];
      for (var n = 1; n <= 4; n++){ you.pct = 100; s.hp = s.maxHp - COBS_PHASE_HP*n - 1; s._atkTimer = 1e9; step(); rows.push([Math.round(you.pct), you.stocks, s._marks]); }
      running = false; return rows; })()`);
    expect(r, 'healed 64 and a stock back at the 1st, 2nd, 3rd and 4th line').toEqual([[36, 2, 1], [36, 3, 2], [36, 4, 3], [36, 5, 4]]);
  });
});

// ONE ATTACK AT A TIME. The owner, 2026-10-02: "nerf one." Asked which, they picked "One attack at a time" -- the rule the twelve Boss Rush bosses now have (test/boss-picker.test.js),
// and "do the 12 only", so it is done in her own update (oneAttackWatch), not through the picker. Her next attack waits until the attack before it is FULLY over -- every shot,
// strike and queued part of it gone -- and then her normal gap runs: that gap is the window to hit her, with her on the screen and hittable. Her ghost and Power Ungrounded
// shields are her mechanics and stay; Power Ungrounded is a move, so it counts as an attack.
// A whole fight, frame by frame, with one still fighter who cannot be hurt (the engine's own check in test/boss-picker.test.js, for her): for each wind-up that begins, was anything of
// the attack before it still going (a shot of hers, a queued part, a hop), and how long was it since that attack was over (the frame her watch let the gap go)? And twenty frames into
// each window, is she on the screen, and does a shot of a fighter's hurt her (unless a shield of hers is up)?
const ONE_FIGHT = (marks, frames, seed) => `(function(){
  var sd = ${seed}, _R = Math.random; Math.random = function(){ sd |= 0; sd = (sd + 0x6d2b79f5) | 0; var t = Math.imul(sd ^ (sd >>> 15), 1 | sd); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  try {
    SETTINGS.itemRate = 0; SETTINGS.stocks = 99; LOCAL_PLAYERS = 1; window.__oneEnd = undefined;
    startOneFight(['Firey'], { story:true, onEnd:function(won){ window.__oneEnd = won; return true; } });
    var one = summons.find(function(s){ return s._oneFight; }), f = fighters[0];
    f.controller = 'still'; f.stocks = 99; one.hp = one.maxHp - 500*${marks} - 5;   // (the phase asked for: her lines are crossed in the first frames)
    var turns = [], bad = [], hers = [], overAt = -1, gapAtOver = 0, lastAlive = 0, lastBusy = false, lastHop = false, lastHers = 0, probe = null, probes = 0, hits = 0, off = [], missed = [], windows = 0, shielded = 0, ghostAge = 0, kinds = {};
    for (var i=0;i<${frames};i++){
      var wasLive = !!one._atkLive, pre = one._tel;
      f.invuln = 1e9; f.pct = 0; f.dead = false; f.vx = 0;
      if (one._ghost && !one._ghost.dead && ++ghostAge > 40){ oneGhostDown(one._ghost, true); ghostAge = 0; }   // (her ghost is her mechanic, and a still fighter cannot kill it: it falls after a while)
      if (!probe && !one._atkLive && !(one._tel > 0) && !one._hop && overAt >= 0 && i - overAt === 20){
        windows++;
        if (oneGhostAlive(one) || (one._ungrounded && !one._grounded)) shielded++;
        else {
          if (!(one.x > -one.r && one.x < WW + one.r && one.y + one.r > 0 && one.y - one.r < WH)) off.push([i, Math.round(one.x), Math.round(one.y)]);
          probe = { hp0: one.hp, at: i };
          addProj({ owner:f.idx, ownerObj:f, x:one.x, y:one.y, vx:0, vy:0, r:8, dmg:3, kb:0, life:4, grav:false, noAim:true });
        }
      }
      step();
      if (probe){ probes++; if (one.hp < probe.hp0) hits++; else missed.push(probe.at); one.hp = probe.hp0; probe = null; }
      if (wasLive && !one._atkLive && overAt < 0){ overAt = i; gapAtOver = oneGap(one); }
      if (!(pre > 0) && one._tel > 0){
        turns.push({ i: i, kind: one._telKind, since: overAt >= 0 ? i - overAt : null, gap: gapAtOver }); kinds[one._telKind] = 1;
        if (lastAlive || lastBusy || lastHop) bad.push({ i: i, kind: one._telKind, alive: lastAlive, busy: lastBusy, hop: lastHop });
        if (lastHers) hers.push({ i: i, kind: one._telKind, n: lastHers });
        overAt = -1;
      }
      var lo = one._atkLive ? one._atkLive.lo : null;
      lastBusy = !(one._tel > 0) && oneBusy(one);
      lastHop = !!one._hop || (!!one._hopPending && !one._ungrounded);
      lastAlive = lo == null ? 0 : projectiles.filter(function(p){ return bossShotLive(p, lo); }).length;
      lastHers = projectiles.filter(function(p){ return p.owner === -2 && p.life > 0 && !p.lingers && !p.trap; }).length;   // any shot of hers at all
      if (one._tel > 0){ lastBusy = false; lastAlive = 0; lastHop = false; lastHers = 0; }
    }
    return { turns: turns, bad: bad, hers: hers, probes: probes, hits: hits, off: off, missed: missed, windows: windows, shielded: shielded, marks: one._marks, kinds: Object.keys(kinds) };
  } finally { Math.random = _R; }
})()`;

describe('"One attack at a time": the next wind-up waits until the last of the attack before it is gone, and the gap counted from then is the window to hit her', () => {
  for (const marks of [0, 1, 2, 3]) {
    it(`through a fight in phase ${marks + 1}, no wind-up begins under a shot, a queued part or a hop of the attack before it; the window after is at least her gap; she is on the screen and a hit hurts her`, () => {
      const r = W.eval(ONE_FIGHT(marks, 2600, 40 + marks));
      const at = `phase ${marks + 1}`;
      expect(r.marks, `${at}: the fight is in the phase asked for`).toBe(marks);
      expect(r.turns.length, `${at}: she keeps attacking (nothing waits for ever): ${r.turns.map((t) => t.kind)}`).toBeGreaterThanOrEqual(4);
      expect(r.bad, `${at}: no wind-up under a live shot of the attack before it, a queued part of it, or its hop`).toEqual([]);
      expect(r.hers, `${at}: nor with any shot of hers in the air at all`).toEqual([]);
      for (const t of r.turns) if (t.since != null) expect(t.since + 1, `${at}: the turn at frame ${t.i} (${t.kind}) came ${t.since} frames after the last was over; her gap is ${t.gap}`).toBeGreaterThanOrEqual(t.gap);
      expect(r.windows, `${at}: windows were measured`).toBeGreaterThanOrEqual(3);
      expect(r.windows - r.shielded, `${at}: and most of them were not under a shield of hers`).toBeGreaterThanOrEqual(2);
      expect(r.off, `${at}: on the screen in the window`).toEqual([]);
      expect(r.missed, `${at}: a fighter's shot hurts her in the window (her ghost and Power Ungrounded are the shields that stay)`).toEqual([]);
    }, 240000);
  }

  it('over means: nothing queued, no wind-up, no hop (running, or still to come), no shot of the attack alive -- not a trap, not what only lies there (`lingers`), not an older attack\'s, not one that has left the arena for good (it is taken out); her ash, cracks and giant state are terrain, not the attack', () => {
    const r = STAGE(`
      var out = {}, A = { lo: 10 }, mk = function(o){ return Object.assign({ owner:-2, x:300, y:300, vx:0, vy:0, r:10, life:50, bossAtk:11, dmg:5 }, o); };
      fresh(); one._hop = null; one._hopPending = false; one._ungrounded = false; one._tel = 0; one._q = []; projectiles = [];
      out.none = oneAttackOver(one, A);
      one._tel = 5; out.winding = oneAttackOver(one, A); one._tel = 0;
      one._q = [{ at: one._f + 50, fn: function(){} }]; out.queued = oneAttackOver(one, A); one._q = [];
      one._hop = { ph:'out', t:0, r0:one.r, giant:false }; out.hopping = oneAttackOver(one, A); one._hop = null;
      one._hopPending = true; out.hopToCome = oneAttackOver(one, A);
      one._ungrounded = true; out.hopHeld = oneAttackOver(one, A); one._ungrounded = false; one._hopPending = false;
      projectiles = [mk({ x:-400, vx:-5 }), mk({ x:WW + 400, vx:5 })]; out.gone = [oneAttackOver(one, A), projectiles.map(function(p){ return p.life; })];
      projectiles = [mk({ x:-400, vx:5 })]; out.coming = [oneAttackOver(one, A), projectiles[0].life];
      projectiles = [mk({ x:-400, vx:-5, delay:30 })]; out.waiting = [oneAttackOver(one, A), projectiles[0].life];
      projectiles = [mk({ trap:true }), mk({ lingers:true }), mk({ bossAtk:3 }), mk({ bossAtk:null }), mk({ life:0 })]; out.terrain = oneAttackOver(one, A);
      projectiles = [mk({ })]; out.alive = oneAttackOver(one, A);
      projectiles = []; one._ash = [{ x:300, y:300, r:50, life:100, max:100 }]; oneArena(one).marks.push({ x:1, y:1, w:50, kind:'crack', born:0, seed:0 }); one._giantT = 300;
      out.stands = oneAttackOver(one, A); one._ash = []; one._giantT = 0;
      return out;`);
    expect(r.none, 'nothing going: over').toBe(true);
    expect(r.winding, 'a wind-up is the attack, not its end').toBe(false);
    expect(r.queued, 'a queued part of it still to run: not over').toBe(false);
    expect(r.hopping, 'her Vortex hop is the end of a special, and the window comes after it: not over').toBe(false);
    expect(r.hopToCome, 'and one still to come: not over').toBe(false);
    expect(r.hopHeld, 'a hop her shield holds back does not hold the attack (it is dropped: see below)').toBe(true);
    expect(r.gone[0], 'shots out past either edge and still going are gone: over').toBe(true);
    expect(r.gone[1], 'and taken out of the game, since nothing out there can hit anyone').toEqual([0, 0]);
    expect(r.coming[0], 'a shot coming in from beyond the edge is not gone').toBe(false);
    expect(r.coming[1]).toBeGreaterThan(0);
    expect(r.waiting, 'a shot waiting on its delay has not begun: not gone').toEqual([false, 50]);
    expect(r.terrain, 'a trap, a thing that lies there, an older attack\'s shot, a shot with no id, a dead one: none of them is the attack').toBe(true);
    expect(r.alive, 'a live shot with this attack\'s id: not over').toBe(false);
    expect(r.stands, 'her ash piles, her cracks and the giant state are what she leaves standing: terrain ("Keep hazards going")').toBe(true);
  });

  it('her clock: held while the attack is going, let go to her gap when it is over; one parked for good (a test\'s 1e9) is not watched and stays parked', () => {
    const r = STAGE(`
      var out = {};
      fresh(); one._hop = null; one._hopPending = false; one._tel = 0; one._q = []; projectiles = [];
      one._atkLive = { lo: 0 }; one._atkTimer = 1e9; oneAttackWatch(one); out.parked = [one._atkTimer, one._atkLive];
      one._atkTimer = 10; one._atkLive = { lo: 0 }; projectiles = [{ owner:-2, x:300, y:300, vx:0, vy:0, r:10, life:50, bossAtk:5, dmg:5 }]; oneAttackWatch(one); out.held = [one._atkTimer, !!one._atkLive];
      projectiles = []; oneAttackWatch(one); out.let = [one._atkTimer, !!one._atkLive, oneGap(one)];
      var t0 = one._atkTimer = 77; oneSeqEnd(one, 3); one._q[0].fn(); out.marker = [t0, one._atkTimer]; one._q = [];
      return out;`);
    expect(r.parked, 'parked: the watch lets go and leaves the clock where it was').toEqual([1e9, null]);
    expect(r.held, 'a shot of the attack is alive: the clock is held').toEqual([1e6, true]);
    expect(r.let[0], 'the shot is gone: her gap starts, her own gap').toBe(r.let[2]);
    expect(r.let[1]).toBe(false);
    expect(r.marker[1], 'the end of a sequence no longer starts the gap: it only holds the attack open to its tail').toBe(r.marker[0]);
  });

  it('Power Ungrounded is a move, so it counts as an attack: it winds up and fires like the rest, her gap follows its cast (not a second wind-up at once), and the shield it raises stays up and keeps its rules', () => {
    const r = STAGE(`
      setTier(1); fresh(); you.invuln = 1e9;
      one._telKind = 'ungrounded'; one._tel = 3; one._atkTimer = 50; one._atkLive = null; one._atkLo = null; one._hopPending = false;
      var out = { firedAt: -1, releaseAt: -1, windupAt: -1, gap: oneGap(one), shieldAtRelease: null, took: null, liveAtFire: null, upAtWindup: null };
      for (var i=0;i<300 && out.windupAt < 0;i++){
        you.invuln = 1e9; you.pct = 0;
        var live0 = !!one._atkLive, pre = one._tel, ung0 = one._ungrounded; step();
        if (out.firedAt < 0 && one._ungrounded && !ung0){ out.firedAt = i; out.liveAtFire = !!one._atkLive; }
        if (live0 && !one._atkLive && out.releaseAt < 0){ out.releaseAt = i; out.shieldAtRelease = one._ungrounded && !one._grounded; var hp0 = one.hp; out.took = oneTakeDamage(one, 10, you); one.hp = hp0; }
        if (out.releaseAt >= 0 && !(pre > 0) && one._tel > 0){ out.windupAt = i; out.upAtWindup = one._ungrounded; }
      }
      return out;`);
    expect(r.firedAt, 'it fired').toBeGreaterThanOrEqual(0);
    expect(r.liveAtFire, 'and it is an attack: her clock is held on it, as on any other').toBe(true);
    expect(r.releaseAt - r.firedAt, 'it has no shot, so it is over at once').toBeLessThanOrEqual(2);
    expect(r.windupAt - r.releaseAt + 1, 'and her gap runs before the next wind-up begins').toBeGreaterThanOrEqual(r.gap);
    expect(r.shieldAtRelease, 'the shield it raised is still up').toBe(true);
    expect(r.took, 'and still keeps everything off her (no damage) until it is grounded').toBe(0);
    expect(r.upAtWindup, 'it outlasts the gap: her next attack comes with it still up').toBe(true);
  });

  it('the Vortex hop a special ends with is part of the attack: her gap starts after it, with her on the screen; and a hop her shield holds back is dropped', () => {
    const r = STAGE(`
      setTier(1); fresh(); you.invuln = 1e9;
      one._telKind = 'moonrocks'; one._tel = 2; one._atkTimer = 50; one._atkLive = null; one._atkLo = null; one._hopPending = false;
      var out = { hopSeen: false, release: null };
      for (var i=0;i<700 && !out.release;i++){
        you.invuln = 1e9; you.pct = 0;
        var live0 = !!one._atkLive; step();
        if (one._hop) out.hopSeen = true;
        if (live0 && !one._atkLive) out.release = { i: i, hop: !!one._hop, pending: !!one._hopPending, hidden: oneHopHidden(one), x: Math.round(one.x), y: Math.round(one.y), r: one.r, base: one._baseR };
      }
      // a hop her shield holds back: she is ungrounded when a hop is due -- it is dropped, not kept for the middle of a window
      fresh(); one._hop = null; one._tel = 0; one._q = []; one._atkLive = null; one._atkTimer = 1e9; one._ungrounded = true; one._ungroundT = 300; one._hopPending = true; step();
      out.held = { pending: !!one._hopPending, hop: !!one._hop };
      one._ungrounded = false; one._ungroundT = 0;
      return Object.assign(out, { WW: WW, WH: WH });`);
    expect(r.hopSeen, 'a special sent her through the Vortex').toBe(true);
    expect(r.release, 'and her gap began').not.toBe(null);
    expect(r.release.hop || r.release.pending || r.release.hidden, 'after it: no hop running or to come, and she is not in the Vortex').toBe(false);
    expect(r.release.r, 'a body again, whole size').toBe(r.release.base);
    expect(r.release.x > 0 && r.release.x < r.WW && r.release.y > 0 && r.release.y < r.WH, 'on the screen (in the arena)').toBe(true);
    expect(r.held, 'a hop her shield holds back is dropped').toEqual({ pending: false, hop: false });
  });
});

// The owner, 2026-10-02, after "nerf one.": "also, shock ring spacing should be bigger. same thing for screechy. increase delay for both out of orbit and zap to dust." -- and, asked what
// spacing was meant: "no, like delay between the 2 bursts(tho keep that too)". So SHOCK RING! and SCREECHY! wait longer between their bursts and rings (twice as long), AND leave wider
// gaps: the ring's pellets half as far again apart or more, the screech's gaps half as wide again or more -- with the shatter cut around them, so it cannot close them.
describe('"shock ring spacing should be bigger. same thing for screechy." / "no, like delay between the 2 bursts(tho keep that too)"', () => {
  it('SHOCK RING!: the delay between its bursts is at least half as long again (it is twice), and the pellets of a burst -- in both twisting bursts -- are at least half as far apart again', () => {
    const r = STAGE(`
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); one.x = WW*0.5 - 900; one.y = groundY() - 420;
        var T = oneTier(one, 'ring'), f0 = one._f;
        ONE_MOVES.ring(one, you, ++BOSS_ATK_ID);
        var at = one._q.map(function(e){ return e.at - f0; });   // when each later burst (and the end of the sequence) is due
        projectiles = []; one._q = [];
        var gapsOf = function(b){   // the least angle between neighbouring pellets of burst b
          var n0 = projectiles.length; oneRingBurst(one, T, ++BOSS_ATK_ID, b);
          var as = projectiles.slice(n0).map(function(p){ return Math.atan2(p.vy, p.vx); }).sort(function(x, y){ return x - y; });
          var steps = as.map(function(a, i){ return i ? a - as[i - 1] : (as[0] + 2*Math.PI) - as[as.length - 1]; });
          return { n: as.length, min: Math.min.apply(null, steps), spin: projectiles[n0].oSpin }; };
        out[t] = { T: T, at: at, even: gapsOf(0), odd: gapsOf(1) };
      });
      return out;`);
    const was = { gap: [16, 14, 12], n: [24, 28, 32], bursts: [3, 4, 6] };
    for (const t of [1, 2, 3]) {
      const k = t - 1, T = r[t].T;
      r[t].at.slice(0, T.bursts - 1).forEach((a, i) => expect(a, `tier ${t}: burst ${i + 2} is due ${T.gap} frames after the one before`).toBe((i + 1) * T.gap));
      expect(T.gap / was.gap[k], `tier ${t}: the delay between the bursts is at least half as long again (it was ${was.gap[k]} frames, it is ${T.gap})`).toBeGreaterThanOrEqual(1.5);
      expect(T.bursts, `tier ${t}: and there are as many bursts as there were`).toBe(was.bursts[k]);
      for (const [which, g] of [['even (clockwise)', r[t].even], ['odd (counter-clockwise)', r[t].odd]]) {
        expect(g.n, `tier ${t}, the ${which} burst: ${g.n} pellets`).toBe(T.n);
        expect(g.min / (2*Math.PI/was.n[k]), `tier ${t}, the ${which} burst: the pellets are at least half as far apart again (it was ${was.n[k]} round, it is ${g.n})`).toBeGreaterThanOrEqual(1.5 - 1e-9);
      }
    }
    expect(r[2].even.spin * r[2].odd.spin, 'the two bursts still turn opposite ways').toBeLessThan(0);
  });

  it('SCREECHY!: the delay between its rings is at least half as long again (it is twice), and its gaps are at least half as wide again -- and the shatter does not close them', () => {
    const r = STAGE(`
      var out = {}, R0 = Math.random;
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); you.invuln = 1e9; you.x = WW*0.5 - 1500;   // (far away)
        var T = oneTier(one, 'screechy'), cx = WW*0.5, cy = groundY() - 900;
        one.x = cx; one.y = cy;
        var f0 = one._f; ONE_MOVES.screechy(one, you, ++BOSS_ATK_ID); var at = one._q.map(function(e){ return e.at - f0; }); projectiles = []; one._q = [];
        // a ring with its gaps where we say, run on until every pellet has split and flown out; where is the nearest pellet to each gap's middle?
        var seq = [0.05, 0.30, 0.55, 0.80], k = 0; Math.random = function(){ return k < seq.length ? seq[k++] : R0(); };
        try { oneScreechRing(one, T, ++BOSS_ATK_ID); } finally { Math.random = R0; }
        var centers = seq.slice(0, T.gaps).map(function(u){ return u*2*Math.PI; });
        var wrap = function(a){ return Math.abs(((a + Math.PI*3) % (Math.PI*2)) - Math.PI); };
        var look = function(){
          var ps = own().filter(function(p){ return p.life > 0 && p.ring; });
          return { n: ps.length, nearest: centers.map(function(c){ var m = 9; ps.forEach(function(p){ m = Math.min(m, wrap(Math.atan2(p.y - cy, p.x - cx) - c)); }); return m; }),
            rmin: Math.min.apply(null, ps.map(function(p){ return Math.hypot(p.x - cx, p.y - cy); })) }; };
        var early = null, late = null, split = T.split || 0;
        for (var i=0;i<80;i++){ one._atkTimer = 1e9; one.x = cx; one.y = cy; one.vx = 0; one.vy = 0; one._hop = null; you.invuln = 1e9; step(); if (i === split + 15) early = look(); }
        late = look();
        out[t] = { T: T, at: at, early: early, late: late, centers: centers.length };
      });
      return out;`);
    const was = { ringGap: [34, 30, 26], half: [0.24, 0.21, 0.18], rings: [2, 2, 3] };
    for (const t of [1, 2, 3]) {
      const k = t - 1, T = r[t].T;
      r[t].at.slice(0, T.rings - 1).forEach((a, i) => expect(a, `tier ${t}: ring ${i + 2} is due ${T.ringGap} frames after the one before`).toBe((i + 1) * T.ringGap));
      expect(T.ringGap / was.ringGap[k], `tier ${t}: the delay between the rings is at least half as long again (it was ${was.ringGap[k]} frames, it is ${T.ringGap})`).toBeGreaterThanOrEqual(1.5);
      expect(T.rings, `tier ${t}: and there are as many rings as there were`).toBe(was.rings[k]);
      expect(T.half / was.half[k], `tier ${t}: each gap, once the ring has shattered, is at least half as wide again (${was.half[k]} each side it was, ${T.half} it is)`).toBeGreaterThanOrEqual(1.5 - 1e-9);
      for (const [when, g] of [['soon after the split', r[t].early], ['out where it has flown on', r[t].late]]) {
        expect(g.n, `tier ${t}, ${when}: the ring is there`).toBeGreaterThan(100);
        g.nearest.forEach((m, c) => expect(m, `tier ${t}, ${when}: the nearest pellet to the middle of gap ${c + 1} is ${m.toFixed(3)} rad away; the gap is ${T.half} each side, and the shatter must not close it`).toBeGreaterThanOrEqual(T.half - 0.02));
      }
    }
    // (what it was: the shatter's pair veer half of `veer` each way into the gap, and left 0.13 each side at tier 2 and 0.06 at tier 3 -- no room for a fighter at all)
    expect(r[3].late.nearest.every((m) => m > 0.2), 'tier 3 leaves room: more than three times the 0.06 the old gaps were left with').toBe(true);
  });
});

// The owner, 2026-10-02, in the same breath: "increase delay for both out of orbit and zap to dust." The coordinator's reading, which these tests hold: a longer warning before each pillar
// of ZAP TO DUST! strikes and more time between its waves; a longer tell before OUT OF ORBIT!'s planets launch and more time between its kicks. Half as long again (1.5x) in each.
describe('"increase delay for both out of orbit and zap to dust."', () => {
  const MARK = `var mark = function(kind){ var fresh1 = oneFx.filter(function(e){ return e.kind === kind && !e._m; }); fresh1.forEach(function(e){ e._m = 1; }); return fresh1; };`;

  it('ZAP TO DUST!: the first wave comes 75 frames after the wind-up begins (it was 50), each light before a later wave shows half as long again, and the waves come half as far apart again', () => {
    const r = STAGE(`
      ${MARK}
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); you.invuln = 1e9; one.x = you.x + 900; one.y = groundY() - 420;
        var T = oneTier(one, 'zap');
        one._telKind = 'zap'; one._tel = oneTelLen(one, 'zap'); one._telX = you.x; one._telY = hurtCY(you); one._zapCols = null; one._atkLive = null; one._atkTimer = 1e9;
        var tel0 = one._tel, warns = [], lands = [];
        for (var i=0; i<tel0 + T.waves*T.gap + 60; i++){
          one._atkTimer = 1e9; you.invuln = 1e9; one._hop = null;
          step();
          var w = mark('zapwarn'); if (w.length) warns.push({ i: i, life: w[0].life, max: w[0].max });
          var c = mark('column'); if (c.length) lands.push(i);
        }
        out[t] = { T: T, tel0: tel0, warns: warns, lands: lands };
      });
      return out;`);
    const was = { tel: 50, warn: [22, 20, 18], gap: [36, 32, 28], waves: [2, 3, 4] };
    for (const t of [1, 2, 3]) {
      const k = t - 1, T = r[t].T;
      expect(r[t].tel0 / was.tel, `tier ${t}: the tell before the first pillars is at least half as long again (it was ${was.tel} frames, it is ${r[t].tel0})`).toBeGreaterThanOrEqual(1.5);
      expect(r[t].lands[0] + 1, `tier ${t}: the first wave comes down as that tell ends`).toBe(r[t].tel0);
      expect(r[t].lands.length, `tier ${t}: and there are as many waves as there were`).toBe(was.waves[k]);
      expect(T.warn / was.warn[k], `tier ${t}: the light before a later wave shows at least half as long again (it was ${was.warn[k]} frames, it is ${T.warn})`).toBeGreaterThanOrEqual(1.5);
      expect(T.gap / was.gap[k], `tier ${t}: the waves are at least half as far apart again (it was ${was.gap[k]} frames, it is ${T.gap})`).toBeGreaterThanOrEqual(1.5);
      expect(T.warn, `tier ${t}: a tell you can read: lit for at least half a second (30 frames) at tiers 1 and 2, nearly that at tier 3`).toBeGreaterThanOrEqual(27);
      r[t].lands.slice(1).forEach((l, j) => expect(l - r[t].lands[j], `tier ${t}: wave ${j + 2} comes ${T.gap} frames after wave ${j + 1}`).toBe(T.gap));
      expect(r[t].warns.length, `tier ${t}: a light before each later wave`).toBe(was.waves[k] - 1);
      r[t].warns.forEach((w, j) => {
        expect(w.life, 'it is lit for the whole warning').toBe(T.warn);
        expect(r[t].lands[j + 1] - w.i, `tier ${t}: and the wave lands as the light ends`).toBe(T.warn);
      });
    }
  });

  it('OUT OF ORBIT!: the kick comes 72 frames after the wind-up begins (it was 48), and the next lanes are lit 66 frames after a kick for 45 before the next one (it was 44 and 30)', () => {
    const r = STAGE(`
      ${MARK}
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); you.invuln = 1e9; one.x = you.x - 300; one.y = groundY() - 330;
        var T = oneTier(one, 'orbitkick');
        one._telKind = 'orbitkick'; one._tel = oneTelLen(one, 'orbitkick'); one._telDir = 1; one._kickY = hurtCY(you); one._kickLanes = oneKickLanes(one, one._kickY); one._atkLive = null; one._atkTimer = 1e9;
        var tel0 = one._tel, foots = [], warns = [];
        for (var i=0; i<tel0 + T.kicks*(ONE_KICK_REST + ONE_KICK_WARN) + 60; i++){
          one._atkTimer = 1e9; you.invuln = 1e9; one.x = you.x - 300; one.y = groundY() - 330; one._hop = null;
          step();
          var f = mark('foot'); if (f.length) foots.push(i); var w = mark('lanewarn'); if (w.length) warns.push({ i: i, life: w[0].life, max: w[0].max });
        }
        out[t] = { T: T, tel0: tel0, foots: foots, warns: warns, rest: ONE_KICK_REST, warn: ONE_KICK_WARN };
      });
      return out;`);
    const was = { tel: 48, rest: 44, warn: 30, kicks: [2, 2, 3] };
    for (const t of [1, 2, 3]) {
      const k = t - 1, g = r[t];
      expect(g.tel0 / was.tel, `tier ${t}: the tell before the planets launch is at least half as long again (it was ${was.tel} frames, it is ${g.tel0})`).toBeGreaterThanOrEqual(1.5);
      expect(g.foots[0] + 1, `tier ${t}: the first kick comes as that tell ends`).toBe(g.tel0);
      expect(g.foots.length, `tier ${t}: and there are as many kicks as there were`).toBe(was.kicks[k]);
      expect(g.rest / was.rest, 'the wait after a kick before the next lanes are lit is at least half as long again').toBeGreaterThanOrEqual(1.5);
      expect(g.warn / was.warn, 'and the lanes are lit at least half as long again before the next kick').toBeGreaterThanOrEqual(1.5);
      expect(g.warns.length, `tier ${t}: the next lanes are lit before each later kick`).toBe(was.kicks[k] - 1);
      g.warns.forEach((w, j) => {
        expect(w.i - g.foots[j], `tier ${t}: lit ${g.rest} frames after kick ${j + 1}`).toBe(g.rest);
        expect(w.life, 'for the whole warning').toBe(g.warn);
        expect(g.foots[j + 1] - w.i, `tier ${t}: and the kick comes as the light ends`).toBe(g.warn);
      });
    }
  });
});

// "some attacks need nerfs, some need buffs. give me these in question boxes." (the owner, 2026-10-02) -- the picks, attack by attack, from this file's point of view. "Harder, same
// damage" holds for the buffs: no hit is for more than it was (the "same damage per hit" tests above still hold).
describe('attack by attack: HANDS FROM THE GROUND! "Nerf: slower cracks" and FOLDING ISLAND! "Buff: faster folds"', () => {
  const MARK = `var mark = function(kind){ var fresh1 = oneFx.filter(function(e){ return e.kind === kind && !e._m; }); fresh1.forEach(function(e){ e._m = 1; }); return fresh1; };`;

  it('HANDS: the crack before every later wave shows 24 frames ahead at every tier (it was 14, 12 and 10), and the wave comes up as it ends', () => {
    const r = STAGE(`
      ${MARK}
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); you.invuln = 1e9; one.x = you.x - 700; one.y = groundY() - 330;
        var T = oneTier(one, 'hands'), warns = [], waves = [];
        one._handSpots = [{ x:you.x, y:oneSurf(you.x, feetY(you) - 4) }];
        ONE_MOVES.hands(one, you, ++BOSS_ATK_ID);
        var up = function(){ var fresh1 = own().filter(function(p){ return p.shape === 'onehand' && !p._m; }); fresh1.forEach(function(p){ p._m = 1; }); return fresh1; };
        up();   // (the first wave came up with the call)
        for (var i=1; i<300 && (oneBusy(one) || i < 5); i++){
          one._atkTimer = 1e9; you.invuln = 1e9; one.x = you.x - 700; one.y = groundY() - 330; one._hop = null;
          step();
          var w = mark('crackwarn'); if (w.length) warns.push({ i: i, max: w[0].max, life: w[0].life });
          if (up().length) waves.push(i);
        }
        out[t] = { T: T, warns: warns, waves: waves };
      });
      return out;`);
    const was = [14, 12, 10];
    for (const t of [1, 2, 3]) {
      const k = t - 1, g = r[t];
      expect(g.T.crack, `tier ${t}: a crack that shows 24 frames ahead (it was ${was[k]})`).toBe(24);
      expect(g.warns.length, `tier ${t}: a crack before each of the last two waves`).toBe(2);
      g.warns.forEach((w, j) => {
        expect(w.max, 'it is lit for the whole 24').toBe(24);
        expect(g.waves[j] - w.i, `tier ${t}: and the wave comes up as it ends`).toBe(24);
      });
    }
  });

  it('HANDS: the root a hand leaves you with is shorter (26 and 40 frames at tiers 2 and 3, it was 40 and 62); tier 1 slows, as it did', () => {
    const r = STAGE(`
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); one.x = you.x - 900; one.y = groundY() - 330;
        var T = oneTier(one, 'hands'), peak = 0, slow = 0;
        one._handSpots = [{ x:you.x, y:oneSurf(you.x, feetY(you) - 4) }];
        ONE_MOVES.hands(one, you, ++BOSS_ATK_ID);
        for (var i=0; i<14; i++){ one._atkTimer = 1e9; one.x = you.x - 900; one.y = groundY() - 330; one._hop = null; step(); peak = Math.max(peak, you.rooted || 0); slow = Math.max(slow, you.slowed || 0); }
        out[t] = { fx: T.fx, fxN: T.fxN, rooted: peak, slowed: slow, pct: you.pct };
      });
      return out;`);
    const was = { 2: 40, 3: 62 };
    expect([r[1].fx, r[2].fx, r[3].fx], 'slow, then root, then root').toEqual(['slow', 'root', 'root']);
    expect(r[1].slowed, 'tier 1 slows you, as it did').toBeGreaterThan(0);
    for (const t of [2, 3]) {
      expect(r[t].fxN, `tier ${t}: a shorter root (it was ${was[t]} frames)`).toBeLessThan(was[t]);
      expect([r[t].fxN], 'the numbers it is now').toEqual([{ 2: 26, 3: 40 }[t]]);
      expect(r[t].pct, `tier ${t}: the hand hit you`).toBeGreaterThan(0);
      expect(r[t].rooted, `tier ${t}: and rooted you, for no more than ${r[t].fxN} frames`).toBeGreaterThan(0);
      expect(r[t].rooted).toBeLessThanOrEqual(r[t].fxN);
      expect(r[t].rooted, 'and well under what it was').toBeLessThan(was[t]);
    }
  });

  it('FOLDING ISLAND!: the later folds come a quarter quicker -- lit for 33, 30 and 27 frames where it was 44, 40 and 36 -- and the first fold, the reach and the jaws are as they were', () => {
    const r = STAGE(`
      ${MARK}
      var out = {};
      [1, 2, 3].forEach(function(t){
        setTier(t); fresh(); worldPlats = worldPlats.filter(function(p){ return p.solid; }); you.invuln = 1e9;
        var T = oneTier(one, 'fold'), warns = [], shuts = [];
        one._telKind = 'fold'; one._foldZones = oneFoldZones(one, you, T, true); one._tel = 0;
        ONE_MOVES.fold(one, you, ++BOSS_ATK_ID);
        mark('jaws'); shuts.push(0);
        for (var i=1; i<900 && (oneBusy(one) || i < 5); i++){
          one._atkTimer = 1e9; one.x = you.x + 900; one.y = groundY() - 400; you.invuln = 1e9; one._hop = null;
          step();
          var w = mark('foldwarn'); if (w.length) warns.push({ i: i, life: w[0].life, max: w[0].max });
          if (mark('jaws').length) shuts.push(i);
        }
        out[t] = { T: T, warns: warns, shuts: shuts };
      });
      return out;`);
    const was = { tel2: [44, 40, 36], tel: [58, 54, 50], folds: [2, 3, 4], half: [180, 195, 210], H: [150, 165, 180] };
    for (const t of [1, 2, 3]) {
      const k = t - 1, g = r[t], T = g.T;
      expect(T.tel2, `tier ${t}: a quarter quicker (it was ${was.tel2[k]})`).toBe(Math.round(was.tel2[k]*0.75));
      expect(T.tel2 / was.tel2[k], 'no more than three quarters of what it was').toBeLessThanOrEqual(0.76);
      expect(T.tel2, `tier ${t}: and still a tell you can read: lit for at least 27 frames, nearly half a second`).toBeGreaterThanOrEqual(27);
      expect([T.tel, T.folds, T.half, T.H], 'the first fold, the chain, the reach and the jaws are as they were').toEqual([was.tel[k], was.folds[k], was.half[k], was.H[k]]);
      expect(g.warns.length, `tier ${t}: a lit zone before each fold after the first`).toBe(T.folds - 1);
      g.warns.forEach((w, j) => {
        expect(w.life, 'lit for the whole tell').toBe(T.tel2);
        expect(g.shuts[j + 1] - w.i, `tier ${t}: and the next fold shuts as it ends`).toBe(T.tel2);
      });
    }
  });
});

describe('heavy hits go through impact() (shake, dust, debris, scars)', () => {
  it('each attack shakes the screen where it lands: zap 20, fold 30, hands 12, the kick 24, and the lighter ones; all of them dust and debris', () => {
    const r = STAGE(`
      var out = {}, imps = [], shk = [], imp = impact, sh = shake;
      impact = function(x, y, o){ imps.push({ shake: o && o.shake, dust: o && o.dust, debris: o && o.debris, scar: !!(o && o.scar), mark: o && o.mark }); return imp.apply(this, arguments); };
      shake = function(n){ shk.push(n); return sh.apply(this, arguments); };
      try {
        var run = function(name, fn){ imps.length = 0; shk.length = 0; setTier(2); fresh(); worldPlats = worldPlats.filter(function(p){ return p.solid || p.y < groundY() - 200; });
          one.x = you.x - 900; one.y = groundY() - 380; you.x = WW*0.5 + 600; you.y = groundY() - you.r; fn(); for (var i=0;i<4;i++){ one._atkTimer = 1e9; one.x = you.x - 900; you.invuln = 99; step(); }
          out[name] = { imps: imps.slice(), shk: shk.slice() }; };
        run('zap', function(){ one._telX = you.x; one._telY = hurtCY(you); one._zapCols = null; ONE_MOVES.zap(one, you, ++BOSS_ATK_ID); });
        run('fold', function(){ one._foldZones = null; ONE_MOVES.fold(one, you, ++BOSS_ATK_ID); for (var i=0;i<ONE_FOLD_CLOSE + 2;i++){ one._atkTimer = 1e9; you.invuln = 99; step(); } });
        run('hands', function(){ one._handSpots = [{ x:you.x, y:oneSurf(you.x, feetY(you) - 4) }]; ONE_MOVES.hands(one, you, ++BOSS_ATK_ID); });
        run('kick', function(){ one._telDir = 1; one._kickY = hurtCY(you); one._kickLanes = null; ONE_MOVES.orbitkick(one, you, ++BOSS_ATK_ID); });
        run('ring', function(){ ONE_MOVES.ring(one, you, ++BOSS_ATK_ID); });
        run('screech', function(){ ONE_MOVES.screechy(one, you, ++BOSS_ATK_ID); });
        run('giant', function(){ ONE_MOVES.sizeshift(one); one.r = one._baseR; one._giantT = 0; });
        run('ghost', function(){ ONE_MOVES.ghost(one, you, ++BOSS_ATK_ID); if (one._ghost) oneGhostDown(one._ghost, true); });
        run('phase', function(){ one._marks = 0; one.hp = 1490; one._telKind = null; });
      } finally { impact = imp; shake = sh; }
      return out;`);
    // impact()'s own shake where the move uses it, shake() where it does not (a hit that lands shakes the screen too: that is not what is read here)
    const impShake = (name) => Math.max(0, ...r[name].imps.map((i) => i.shake || 0));
    const plainShake = (name) => Math.max(0, ...r[name].shk);
    expect(impShake('zap'), 'a column coming down').toBe(20);
    expect(impShake('fold'), 'the clap of the jaws: the cap of shake()').toBe(30);
    expect(impShake('hands'), 'a burst of hands').toBe(12);
    expect(impShake('kick'), 'the kick').toBe(24);
    expect(plainShake('ring'), 'a ring').toBeGreaterThanOrEqual(6);
    expect(plainShake('screech'), 'the scream').toBeGreaterThanOrEqual(8);
    expect(plainShake('giant'), 'the swell').toBeGreaterThanOrEqual(14);
    expect(plainShake('ghost'), 'the ghost landing').toBeGreaterThanOrEqual(8);
    expect(plainShake('phase'), 'a phase line').toBeGreaterThanOrEqual(16);
    for (const k of ['zap', 'fold', 'hands', 'kick']) {
      const big = r[k].imps.filter((i) => (i.shake || 0) >= 12);
      expect(big.length, `${k}: a heavy impact()`).toBeGreaterThan(0);
      expect(big[0].dust, `${k}: with dust`).toBeGreaterThanOrEqual(1);
      expect(big[0].debris, `${k}: and debris`).toBeGreaterThanOrEqual(4);
    }
    expect(r.zap.imps.every((i) => i.scar), 'zap chips and scars the surface').toBe(true);
    expect(r.fold.imps.some((i) => i.mark === 'crater'), 'the fold leaves a crater').toBe(true);
    expect(r.zap.imps.some((i) => i.mark === 'scorch'), 'the zap, a scorch').toBe(true);
    expect(r.hands.imps.some((i) => i.mark === 'crack'), 'the hands, a crack').toBe(true);
  });
});

describe('her arena reacts by phase: the Moon, the Vortex, the rift and the dark, the floor, her statues, the leaves', () => {
  it('the Moon loses a chunk with every Moon Rocks (up to eight) and splits in two at 1000 HP, the halves drifting apart', () => {
    const r = STAGE(`
      fresh(); var A = oneArena(one), out = {};
      for (var i=0;i<10;i++){ setTier(1); ONE_MOVES.moonrocks(one, you, ++BOSS_ATK_ID); one._q = []; projectiles = []; }
      out.chips = A.chips;
      one._marks = 1; A.splitT = 0; for (var j=0;j<100;j++){ one._f++; oneArenaTick(one); } out.splitBefore = A.splitT || 0;
      one._marks = 2; for (var k=0;k<100;k++){ one._f++; oneArenaTick(one); } out.splitAfter = A.splitT;
      return out;`);
    expect(r.chips, 'a bite out of it for every volley, to a ceiling of eight').toBe(8);
    expect(r.splitBefore, 'whole until the second line').toBe(0);
    expect(r.splitAfter, 'then the halves drift apart').toBeGreaterThanOrEqual(100);
  });

  it('the sky darkens phase by phase toward near pitch black, and a vein of light crawls across it at each phase line', () => {
    const r = STAGE(`
      fresh(); var A = oneArena(one), out = { dark: [], veins: [], t: [] };
      for (var m = 0; m <= 3; m++){ one._marks = m; for (var i=0;i<700;i++){ one._f++; oneArenaTick(one); } out.dark.push(+A.dark.toFixed(3)); }
      // the phase lines through her own update: one vein each
      var b = oneBoss(); one._marks = 0; A.veins.length = 0; A.dark = 0;
      [1400, 900, 400].forEach(function(hp){ one.hp = hp; one._atkTimer = 1e9; step(); out.veins.push(A.veins.length); });
      for (var j=0;j<130;j++){ one._atkTimer = 1e9; step(); } out.t = A.veins.map(function(v){ return v.t; });
      return out;`);
    expect(r.dark[0], 'a night sky').toBe(0);
    expect(r.dark[1] < r.dark[2] && r.dark[2] < r.dark[3], 'darker each phase').toBe(true);
    expect(r.dark[3], 'near pitch black by phase 3').toBeGreaterThan(0.75);
    expect(r.veins, 'one vein of light a phase line').toEqual([1, 2, 3]);
    expect(r.t, 'and each has crawled all the way across').toEqual([1, 1, 1]);
  });

  it('from phase 2 she stands statues of herself on the platforms (3, then 2 and 2 more); a heavy impact within 300 px shatters the ones near it, a light or a far one does not', () => {
    const r = STAGE(`
      fresh(); var A = oneArena(one), out = {}, counts = [];
      [1400, 900, 400].forEach(function(hp){ one.hp = hp; one._atkTimer = 1e9; step(); counts.push(A.statues.length); });
      out.counts = counts;
      out.onPlats = A.statues.every(function(st){ return worldPlats.some(function(p){ return !p.solid && p.y === st.y && st.x >= p.x && st.x <= p.x + p.w; }); });
      var apart = true; for (var i=0;i<A.statues.length;i++) for (var j=i+1;j<A.statues.length;j++) if (Math.abs(A.statues[i].x - A.statues[j].x) < 140 && Math.abs(A.statues[i].y - A.statues[j].y) < 40) apart = false;
      out.apart = apart;
      var st = A.statues[0], n0 = A.statues.length, sh0 = A.shattered || 0;
      oneImpact(st.x + 100, st.y, { shake:8, dust:1, debris:2 }); out.light = A.statues.length;               // too light
      oneImpact(st.x + 900, st.y, { shake:30, dust:1, debris:2 }); out.far = A.statues.filter(function(q){ return q === st; }).length;   // too far from this one
      var n1 = A.statues.length, sh1 = A.shattered || 0, ix = st.x + 100, iy = st.y;
      var near = A.statues.filter(function(q){ return Math.hypot(q.x - ix, q.y - iy) < 300; }).length;
      var d0 = IMPACT_DEBRIS.length; oneImpact(ix, iy, { shake:20, dust:1, debris:2 });
      out.after = { left: A.statues.length, gone: n1 - A.statues.length, near: near, shattered: (A.shattered || 0) - sh1, debris: IMPACT_DEBRIS.length > d0 };
      out.n0 = n0;
      return out;`);
    expect(r.counts, 'nothing in phase 1, three at the first line, then two more each').toEqual([3, 5, 7]);
    expect(r.onPlats, 'each stands on a platform').toBe(true);
    expect(r.apart, 'not two on one spot').toBe(true);
    expect(r.light, 'a light impact leaves them').toBe(r.n0);
    expect(r.far, 'and so does one far away').toBe(1);
    expect(r.after.gone, 'a heavy one within 300 px shatters every one near it').toBe(r.after.near);
    expect(r.after.shattered).toBe(r.after.gone);
    expect(r.after.debris, 'into debris').toBe(true);
  });

  it('the floor takes the marks of what she does (a scorch, a crater, a glowing crack), kept up to forty; the leaves of the wasteland fall from phase 2 and more of them in phase 3', () => {
    const r = STAGE(`
      fresh(); var A = oneArena(one), out = {};
      ['scorch', 'crater', 'crack'].forEach(function(k){ oneImpact(you.x, groundY(), { shake:0, dust:0, debris:0, mark:k, r:80 }); });
      out.kinds = A.marks.map(function(m){ return m.kind; });
      for (var i=0;i<60;i++) oneImpact(you.x + i*10, groundY(), { shake:0, dust:0, debris:0, mark:'crack' });
      out.cap = A.marks.length;
      var leaves = {};
      [0, 1, 3].forEach(function(m){ one._marks = m; A.leaves = []; var peak = 0; for (var j=0;j<600;j++){ one._f++; oneArenaTick(one); peak = Math.max(peak, A.leaves.length); } leaves[m] = peak; });
      out.leaves = leaves;
      // they fall, and are gone once past the floor
      one._marks = 3; A.leaves = [{ x: you.x, y: groundY() - 5, vx:0, vy:2, rot:0, vr:0, ph:0 }]; for (var q=0;q<20;q++){ one._f++; oneArenaTick(one); } out.gone = A.leaves.filter(function(l){ return l.y >= groundY() + 10; }).length;
      return out;`);
    expect(r.kinds).toEqual(['scorch', 'crater', 'crack']);
    expect(r.cap, 'forty marks at most').toBe(40);
    expect(r.leaves[0], 'none while the ground is whole').toBe(0);
    expect(r.leaves[1], 'a few once it starts to go').toBeGreaterThan(3);
    expect(r.leaves[3], 'a flurry by phase 3').toBeGreaterThan(r.leaves[1]);
    expect(r.gone, 'the ones that fell past the floor are gone').toBe(0);
  });

  it("the arena's world-space layers are BOSS_ARENA_HAZARD.onemoon (a draw and no step: nothing in it hurts), and the backdrop draws in every phase", () => {
    const r = STAGE(`
      var H = arenaHazardOf('onemoon'), out = { step: typeof H.step, draw: typeof H.draw, errs: [] };
      [0, 1, 2, 3].forEach(function(m){ one._marks = m; oneArena(one).chips = m*2; oneArena(one).splitT = m*50; oneArena(one).veins = []; for (var v=0;v<m;v++) oneArena(one).veins.push({ seed:v*0.3 + 0.1, t:1 }); oneAddStatues(one, 2);
        try { drawArenaDecor('onemoon'); H.draw(null, {}, 'under'); H.draw(null, {}, 'over'); drawArenaHazard('under'); drawArenaHazard('over'); } catch (e){ out.errs.push(String(e)); } });
      // between fights (no boss at all): the decor is the Moon as it was
      summons = []; try { drawArenaDecor('onemoon'); H.draw(null, {}, 'under'); } catch (e){ out.errs.push('none: ' + e); }
      out.sky = BOSS_ARENA_SKY.onemoon.length; out.ground = !!BOSS_ARENA_GROUND.onemoon; out.arena = ONE_BOSS.arena;
      return out;`);
    expect(r.step, 'it never steps').toBe('undefined');
    expect(r.draw).toBe('function');
    expect(r.errs).toEqual([]);
    expect([r.sky, r.ground, r.arena], 'her sky was always its own; her ground is the platform slab, which her layer turns to ash').toEqual([2, false, 'onemoon']);
  });
});

describe('the Vortex hop: "bigger movement"', () => {
  // the fight as it opens, with her hop still on
  const OPEN = (body) => W.eval(`(function(){
    SETTINGS.itemRate = 0; SETTINGS.stocks = 99; LOCAL_PLAYERS = 1;
    startOneFight(['Firey'], { story:true, onEnd:function(){ return true; } });
    var one = summons.find(function(s){ return s._oneFight; }), you = fighters[0];
    you.controller = 'still'; you.stocks = 99; one._atkTimer = 1e9;
    ${body}
  })()`);

  it('the fight opens with her coming in through the Vortex: out of reach in it, then flying across the whole screen in 17 frames from the far edge to her orbit, her aura behind her', () => {
    const r = OPEN(`
      var rows = [], hit = [], v0 = oneView(), r0 = one._baseR, travel = 0, px = null, startX = null, trails = 0, portals = 0;
      for (var i=0; i<50; i++){
        one._atkTimer = 1e9; you.invuln = 99;
        var ph = one._hop ? one._hop.ph : null, hp0 = one.hp;
        if (ph === 'gone' || ph === 'out') hit.push(oneTakeDamage(one, 10, you)); else if (ph === 'fly') hit.push(-1);
        step();
        rows.push(ph);
        if (one._hop && one._hop.ph === 'fly'){ if (px !== null) travel += Math.abs(one.x - px); else startX = one.x; px = one.x; }
        trails += oneFx.filter(function(e){ return e.kind === 'trail'; }).length ? 1 : 0; portals += oneFx.filter(function(e){ return e.kind === 'portal'; }).length ? 1 : 0;
      }
      var view = oneView();
      return { rows: rows, hit: hit, travel: travel, startX: startX, view: [view.x0, view.x1], hop: one._hop, r: one.r, base: r0, orbitA: one._orbitA, trails: trails, portals: portals, you: you.x, dist: Math.hypot(one.x - you.x, one.y - you.y) };`);
    const first = (ph) => r.rows.indexOf(ph);
    expect(r.rows[0], 'she is not here yet').toBe('gone');
    expect(first('fly'), 'she comes in after a few frames').toBeGreaterThan(5);
    const flyFrames = r.rows.filter((p) => p === 'fly').length;
    expect(flyFrames, 'the flight is about 17 frames ("a run of 17 frames")').toBeGreaterThanOrEqual(15);
    expect(flyFrames).toBeLessThanOrEqual(18);
    expect(r.hit.filter((h) => h !== -1).every((h) => h === 0), 'nothing reaches her while she is in the Vortex').toBe(true);
    expect(r.hop, 'and the hop ends').toBe(null);
    expect(r.r, 'at her own size again').toBe(r.base);
    expect(Math.abs(r.startX - (r.startX < r.you ? r.view[0] : r.view[1])), 'from the edge of the screen (a frame or two in)').toBeLessThan(600);
    expect(r.travel, 'across it').toBeGreaterThan(600);
    expect(r.trails, 'her aura streams behind her').toBeGreaterThan(5);
    expect(r.portals, 'the spiral shows').toBeGreaterThan(0);
    expect(r.orbitA, 'and she picks the orbit up where she landed').not.toBe(null);
    expect(r.dist, 'in orbit round you, not on top of you').toBeGreaterThan(200);
  });

  it('she is hittable again as she flies in, and nothing about the hop leaves a cost: no stuck shrink, no lost attack clock', () => {
    const r = OPEN(`
      var fly = null, gone = null;
      for (var i=0; i<40; i++){ one._atkTimer = 1e9; you.invuln = 99; step();
        if (one._hop && one._hop.ph === 'fly' && fly === null) fly = oneTakeDamage(one, 10, you);
        if (one._hop && one._hop.ph === 'gone' && gone === null) gone = [oneTakeDamage(one, 10, you), one.r]; }
      return { fly: fly, gone: gone, atk: one._atkTimer };`);
    expect(r.gone[0], 'in the spiral: nothing').toBe(0);
    expect(r.gone[1], 'a speck in it').toBeLessThan(10);
    expect(r.fly, 'flying in: a body again').toBeGreaterThan(0);
    expect(r.atk, 'her attack clock waited for it (held here: only the frame\'s own tick has come off it)').toBeGreaterThan(9e8);
  });

  it('every phase line sends her through it, and so does every special -- not the eight she inherited, and not the ghost', () => {
    const r = OPEN(`
      var out = {};
      one._hop = null; one._hopPending = false; one.r = one._baseR; one._q = [];
      // a phase line
      one.hp = 1490; one._atkTimer = 1e9; step(); out.lineHop = one._hopPending || !!one._hop;
      for (var i=0;i<60;i++){ one._atkTimer = 1e9; you.invuln = 99; step(); } out.afterLine = [one._hop, one._hopPending];
      // a special, forced to fire: moonrocks queues, so the hop waits until it is over
      one._telKind = 'moonrocks'; one._tel = 1; one._atkTimer = 1e9; step(); out.special = [one._hopPending, !!one._hop];
      var started = -1; for (var j=0; j<200 && started < 0; j++){ one._atkTimer = 1e9; you.invuln = 99; step(); if (one._hop) started = j; } out.specialHopAt = started; out.busyThen = oneBusy(one);
      for (var k=0;k<60;k++){ one._atkTimer = 1e9; you.invuln = 99; step(); } out.specialDone = [one._hop, one._hopPending];
      // the inherited moves and the ghost: no hop
      ['zap', 'ring', 'mindread'].forEach(function(kd){ one._q = []; one._telKind = kd; one._tel = 1; one._atkTimer = 1e9; one._eyeBurst = 0; step(); out[kd] = [one._hopPending, !!one._hop]; for (var z=0;z<200;z++){ one._atkTimer = 1e9; you.invuln = 99; step(); } });
      one._q = []; one._telKind = 'ghost'; one._tel = 1; step(); out.ghost = [one._hopPending, !!one._hop];
      return out;`);
    expect(r.lineHop, 'a phase line: she goes').toBe(true);
    expect(r.afterLine, 'and comes back').toEqual([null, false]);
    expect(r.special[0], 'a special: the hop is pending').toBe(true);
    expect(r.specialHopAt, 'and starts once the special has run out').toBeGreaterThan(5);
    expect(r.specialDone).toEqual([null, false]);
    for (const k of ['zap', 'ring', 'mindread']) expect(r[k], `${k}: no hop`).toEqual([false, false]);
    expect(r.ghost, 'the ghost: no hop').toEqual([false, false]);
  });
});

describe('her ending: she crumbles, shatters, and a black hole takes the pieces -- no text', () => {
  it('a flicker and crumble (pieces come off, cracks spread), a shatter at frame 60 (shake 30, a burst of shards), then a black hole that takes them; won only at the end; her shots go; nobody is hurt', () => {
    const r = STAGE(`
      fresh(); one.x = you.x + 20; one.y = you.y - 10; one.r = one._baseR;
      var banners = [], bn = banner, imps = [], imp = impact, rows = {};
      banner = function(t, ms, k){ banners.push([String(t), k]); return bn.apply(this, arguments); };
      impact = function(x, y, o){ imps.push({ shake: o && o.shake, debris: o && o.debris, dust: o && o.dust }); return imp.apply(this, arguments); };
      try {
        ONE_MOVES.screechy(one, you, ++BOSS_ATK_ID); ONE_MOVES.knives(one, you, ++BOSS_ATK_ID);
        var shots0 = own().length;
        one.hp = 0; one._atkTimer = 1e9; var pct0 = you.pct, E, frames = 0, wonAt = null, minPct = 0;
        you.x = one.x; you.y = one.y;   // right on top of her
        for (var i=0; i<200 && one.life > 0; i++){ you.invuln = 0; you.hitstun = 0; step(); frames++; E = one._end;
          if (i === 1) rows.start = { dying: one._dying, shots: own().length, shards: E ? E.shards.length : -1 };
          if (i === 40) rows.crumble = { shards: E.shards.length, gone: !!one._gone, cracks: Math.min(6, Math.floor((ONE_END_T - one._dying)/8)) };
          if (i === 62) rows.shatter = { gone: !!one._gone, r: one.r, bh: !!E.bh, shards: E.shards.length, imp: imps.filter(function(m){ return m.shake === 30; }).length };
          if (i === 100) rows.hole = { shards: E.shards.length, bhT: E.bh && E.bh.t };
          if (i === 140) rows.late = { shards: E.shards.length };
          if (ONEFIGHT.won && wonAt === null) wonAt = i; minPct = Math.max(minPct, you.pct - pct0); }
      } finally { banner = bn; impact = imp; }
      return { rows: rows, frames: frames, wonAt: wonAt, banners: banners, hurt: minPct, life: one.life, endings: Object.keys(BOSS_ENDINGS).indexOf('one'), won: ONEFIGHT.won, shots0: shots0 };`);
    expect(r.rows.start.dying, 'the scene starts').toBeGreaterThan(140);
    expect(r.rows.start.shots, 'her shots are gone the moment she starts to go').toBe(0);
    expect(r.rows.crumble.shards, 'pieces crumble off her').toBeGreaterThan(5);
    expect(r.rows.crumble.cracks, 'and more cracks spread').toBeGreaterThanOrEqual(4);
    expect(r.rows.crumble.gone, 'she is still there').toBe(false);
    expect(r.rows.shatter.gone, 'at frame 60 she shatters').toBe(true);
    expect(r.rows.shatter.imp, 'with the heaviest shake').toBeGreaterThan(0);
    expect(r.rows.shatter.shards, 'into shards').toBeGreaterThan(20);
    expect(r.rows.shatter.bh, 'and a black hole where she stood').toBe(true);
    expect(r.rows.late.shards, 'it takes the pieces').toBeLessThan(r.rows.shatter.shards / 2);
    expect(r.wonAt, 'the fight is won when the scene is over').toBeGreaterThanOrEqual(140);
    expect(r.life, 'and she is gone').toBe(0);
    expect(r.banners, 'no text, not even the old ONE SHATTERS!').toEqual([]);
    expect(r.hurt, 'it hurts nobody, right on top of her').toBe(0);
    expect(r.endings, 'it plays in her own fight flow, not as a Boss Rush ending').toBe(-1);
  });
});

describe('her art, credited', () => {
  it('Moon rocks, three planets and the knife wear the show\'s art; the hands, lasers, Vortex, statues and fold are drawn in her colours; every file is credited and on the record', () => {
    const r = STAGE(`
      var shapes = ['moonrock', 'oneearth', 'oneweird', 'oneskate', 'oneknife'], out = { shapes: {} };
      shapes.forEach(function(k){ out.shapes[k] = { art: ATTACK_SPRITES[k] && ATTACK_SPRITES[k].src, glyph: !!(PROJ_SHAPE[k] && PROJ_SHAPE[k].draw) }; });
      out.glyphs = ['onering', 'onelaser', 'onehand', 'onewisp'].map(function(k){ return !!(PROJ_SHAPE[k] && PROJ_SHAPE[k].draw); });
      out.star = String(PROJ_SHAPE.onelaser.draw).indexOf('oneStarPath') >= 0;
      out.planets = ONE_PLANETS.slice();
      return out;`);
    const man = JSON.parse(readFileSync('scripts/attack-sprite-manifest.json', 'utf8'));
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const picks = readFileSync('scripts/fetch-attack-sprites.mjs', 'utf8');
    const files = { moonrock: 'onemoonrock.png', oneearth: 'oneearth.png', oneweird: 'oneweird.png', oneskate: 'oneskate.png', oneknife: 'psbknife.png' };
    for (const [k, f] of Object.entries(files)) {
      expect(r.shapes[k].art, `${k} wears ${f}`).toBe(`assets/sprites/attacks/${f}`);
      expect(r.shapes[k].glyph, `${k} keeps a drawn glyph until it loads`).toBe(true);
      expect(existsSync(`artifacts/V1/assets/sprites/attacks/${f}`), f).toBe(true);
      expect(credits, `${f} is credited`).toContain(`(${f})`);
    }
    for (const k of ['onemoonrock', 'oneearth', 'oneweird', 'oneskate']) {
      expect(man[k], `${k} is on the record`).toMatchObject({ file: `${k}.png`, wiki: 'bfdi' });
      expect(man[k].source, `${k}'s source`).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/battlefordreamisland\/images\//);
      expect(picks, `${k} is a pick in the fetch script`).toMatch(new RegExp(`\\n  ${k}:\\s+\\{ who: 'One \\(`));
      expect(credits, `${k}'s source is in CREDITS.md`).toContain(man[k].source);
    }
    expect(man.psbknife.srcTitle, 'the knife is the Cake at Stake knife the Puffball Speaker Box already credits').toBe('One knife.png');
    expect(r.glyphs, 'the Vortex star, the laser, the hand and the wisp are drawn').toEqual([true, true, true, true]);
    expect(r.star, 'her lasers are tipped with a star').toBe(true);
    expect(r.planets).toEqual(['oneearth', 'oneweird', 'oneskate']);
  });

  it("the Fish Monster look is a real render (200 px tall at most, clear corners), credited, and the ones she already wore are untouched", () => {
    const png = PNG.sync.read(readFileSync('artifacts/V1/assets/sprites/one-fish.png'));
    const a = (x, y) => png.data[(y * png.width + x) * 4 + 3];
    expect(png.height).toBeLessThanOrEqual(200);
    expect([a(0, 0), a(png.width - 1, 0), a(0, png.height - 1), a(png.width - 1, png.height - 1)]).toEqual([0, 0, 0, 0]);
    let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] === 0) clear++;
    expect(clear / (png.width * png.height), 'a cut-out, not a rectangle').toBeGreaterThan(0.2);
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    expect(credits).toMatch(/`one-fish\.png`/);
    expect(credits).toMatch(/One_as_fish_monster\.png/);
    expect(credits).toMatch(/`one\.png`/);
    expect(W.eval('BOSS_SPRITE_SRC.one')).toBe('assets/sprites/one.png');
  });
});

describe('no words, and nothing for a netcode client', () => {
  it('a long fight puts up only her telegraph names and the lines she already had: nothing new, and no sentence from any of the new attacks', () => {
    const r = STAGE(`
      fresh(); one._atkTimer = 100; one._spN = 2;
      var texts = {}, bn = banner;
      banner = function(t, ms, k){ texts[String(t) + '|' + (k || '')] = 1; return bn.apply(this, arguments); };
      try { you.controller = 'ai'; for (var i=0; i<2400 && running; i++) step(); } finally { banner = bn; }
      return { texts: Object.keys(texts), frames: i };`);
    const names = ['ZAP TO DUST', 'SCREECHY', 'MIND READ', 'FOLDING ISLAND', 'KNIFE FLURRY', 'SHOCK RING', 'ONE GROWS GIANT', 'POWER UNGROUNDED', 'MOON ROCKS', 'EYE LASERS', 'HANDS FROM THE GROUND', 'OUT OF ORBIT', 'GHOST FIGHTER'];
    const allowed = [new RegExp(`^(${names.join('|')})( I{1,3})?!\\|boss$`), /^\d+ HP — harder: .*\|boss$/, /^Hey guys!\|boss$/, /^(KILL THE GHOST FIRST|MIND READ: |POWER DRAIN!|POWER UNGROUNDED|GROUNDED|A GHOST FIGHTER|GHOST DOWN)[^|]*\|boss$/,
      /^GO!/, /KO'd|You're out/];
    const stray = r.texts.filter((t) => !allowed.some((re) => re.test(t)));
    expect(stray, 'every line is a telegraph name, a line she already had, GO! or a KO').toEqual([]);
    expect(r.texts.every((t) => !/INCOMING!|SEEKERS!|ONE SHATTERS/.test(t)), 'and the old ones are gone').toBe(true);
  });

  it('her fight is local-only (startOneFight refuses a netcode session), so none of her new state needs the snapshot; her fields stay off it', () => {
    const r = W.eval(`(function(){
      var n0 = window.NET; window.NET = Object.assign({}, n0 || {}, { role:'host' });
      var ok; try { ok = startOneFight(['Lightning'], { story:true, onEnd:function(){ return true; } }); } finally { window.NET = n0; }
      var snap = JSON.stringify(serializeState());
      return { ok: ok, leak: ['_arena', '_hop', '_end', '_q', '_ash', 'oHang', '_foldZones', '_steerUntil'].filter(function(k){ return snap.indexOf(k) >= 0; }) };
    })()`);
    expect(r.ok, 'a netcode session cannot start her').toBe(false);
    expect(r.leak, 'none of her new state is on the snapshot').toEqual([]);
  });
});

// ==== THE GLITCH PASS (2026-10-01): what scripts/boss-glitch.mjs found drawing her fight on a canvas that refuses what a browser refuses ====
describe('the glitch pass: her fight drawn on a canvas that keeps the old fill and the old alpha', () => {
  it('the turn arrows of her ring draw at an alpha the canvas keeps (0.5 + pulse peaks at 1.05), and her ghost\'s arrow at the edge of the screen has a colour (it fights on team -1: the team palette has no entry)', async () => {
    const { w, errors } = await bootValidating();
    w.eval(`(function(){
      SETTINGS.itemRate = 0; SETTINGS.stocks = 99; LOCAL_PLAYERS = 1;
      startOneFight(['Firey'], { story:true, onEnd:function(){ return true; } });
      var one = summons.find(function(s){ return s._oneFight; }), you = fighters[0];
      one._hop = null; one._hopPending = false; one.r = one._baseR; one._atkTimer = 1e9; one._introT = 0; one._q = [];
      you.controller = 'still'; one._marks = 1;            // tier 2: the ring turns both ways, and its tell shows the two arrows
      one._tel = 30; one._telKind = 'ring';
      var g = spawnOneGhost(one, { hit: 1 }); g.x = camX + W*3; g.y = groundY() - 100;   // her ghost, far off the side of the view
      hazardT = 3;                                          // sin(hazardT * 0.5) at its top: the pulse at 0.55
    })()`);
    errors.length = 0;
    w.eval('draw()');
    expect(errors.filter((e) => e.kind === 'ctx-ignored' && e.key === 'globalAlpha'), 'no alpha the canvas ignores').toEqual([]);
    expect(errors.filter((e) => e.kind === 'ctx-ignored' && /fillStyle/.test(e.key)), 'no fill it ignores: the ghost\'s arrow wore the last fill').toEqual([]);
  });
});
