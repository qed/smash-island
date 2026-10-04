import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// THE PICKER AND ONE ATTACK AT A TIME: the two engine rules of the owner's Round 17 for the twelve Boss Rush bosses, tested on the whole kit (every boss, every phase). (test/boss-kit.test.js is
// the rest of the boss kit; each boss's own test file pins its own moves, tags and hooks.)

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// ---- THE PICKER AND ONE ATTACK AT A TIME (the owner, 2026-10-01, Round 17) ----------------------------------------------------------------------------------
// Verbatim: "make the attacks based on fighter position. if there is an attack that punishes being close, then they should use it more when ppl are close." -- asked how far it goes, "Position picks
// all (Recommended)" (the signature competes like every other attack; no repeats; every unlocked attack still comes up) -- then, verbatim: "actually, do the 12 only!!!!! WHOOPS!!" -- and, on the gaps,
// verbatim: "1 attack at a time... the bosses dont give any time between attacks to hit them." (asked: "Current gaps", and "Keep hazards going (Recommended)"): the next wind-up waits until the attack
// before it is fully over, and the gap counted from then is the window to hit him.
const TWELVE = ['Announcer', 'Puffball Speaker Box', 'Firey Speaker Box', 'The Bug Swarm', 'Purple Face', 'MePhone4', 'Evil Leafy', 'MePhone4S', 'Purple Dragon', 'Two', 'Springy', 'Four'];
const TAG_NAMES = ['close', 'far', 'ground', 'platform', 'air', 'wall', 'bunch', 'spread', 'any'];

// A bare boss of the roster row `name` in phase `ph` standing at `bx`, still fighters at `fxs`, and the dice made by hand from `seed` (put back by `done`): the picker's own state, nothing else running.
const RIG = (name, ph, bx, fxs, seed) => `
  var row = BOSS_ROSTER.find(function(b){ return b.name === ${JSON.stringify(name)}; });
  var s = { name: row.name, attack: row.attack, type: 'boss', x: ${bx}, y: groundY() - 85, r: 85, hp: 100, maxHp: 100, _phase: ${ph}, _telPh: ${ph}, color: row.color, face: 1, vx: 0, vy: 0, _atkTimer: 1e9, _tel: 0 };
  summons = []; projectiles = [];
  fighters = ${JSON.stringify(fxs)}.map(function(x, i){ var q = makeFighter(ROSTER.find(function(r){ return r.name === 'Firey'; }), x, groundY() - 24, i); q.team = 0; q.controller = 'still'; q.onground = true; return q; });
  var seed = ${seed}, _R = Math.random; Math.random = function(){ seed |= 0; seed = (seed + 0x6d2b79f5) | 0; var t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };   // mulberry32, the tests' own dice
  function done(){ Math.random = _R; }
`;
const PICKS = (name, ph, bx, fxs, seed, n, extra = '') => W.eval(`(function(){ ${RIG(name, ph, bx, fxs, seed)}
  try { var out = [], tags = {}; ${extra}
    for (var i=0;i<${n};i++){ out.push(bossPickTurn(s)); }
    return { picks: out, moves: bossPickMoves(s, ${ph}), tags: bossPickMoves(s, ${ph}).map(function(k){ return [k, bossMoveTags(s, k, ${ph})]; }) };
  } finally { done(); } })()`);

describe('the picker: a boss draws its turn by where the fighters stand (the twelve only)', () => {
  it('every Boss Rush boss has an entry; each move it can draw, in every phase, is tagged with what it punishes (and only with the names the picker knows), can be fired, and is announced', () => {
    const r = W.eval(`(function(){ var out = { rows: [], bad: [] };
      BOSS_ROSTER.forEach(function(row){
        var s = { name: row.name, attack: row.attack, type: 'boss', x: 550, y: 400, r: 85, hp: 100, maxHp: 100, _phase: 1, color: row.color, face: 1, vx: 0, vy: 0, _tel: 0 };
        out.rows.push(row.name + ':' + !!BOSS_PICK[row.attack] + ':' + bossPicks(s));
        if (!BOSS_PICK[row.attack]) return;
        [1, 2, 3].forEach(function(ph){
          s._phase = ph; var P = BOSS_PICK[row.attack], moves = bossPickMoves(s, ph);
          if (!moves.length) out.bad.push(row.name + ' ' + ph + ': no moves');
          if (new Set(moves).size !== moves.length) out.bad.push(row.name + ' ' + ph + ': a move twice');
          moves.forEach(function(k){
            var tg = bossMoveTags(s, k, ph);
            if (!P.tags || P.tags[k] == null || !tg.length) out.bad.push(row.name + ' ' + ph + ' ' + k + ': untagged');
            tg.forEach(function(t){ if (${JSON.stringify(TAG_NAMES)}.indexOf(t) < 0) out.bad.push(row.name + ' ' + ph + ' ' + k + ': unknown tag ' + t); });
            var kind = P.kind ? P.kind(k, s) : k;
            if (kind !== row.attack && typeof BOSS_MOVES[kind] !== 'function') out.bad.push(row.name + ' ' + ph + ' ' + k + ': nothing fires it (' + kind + ')');
            s._telKind = kind; s._telPh = ph;
            var nm = bossTelName(s);
            if (!/!$/.test(nm) || /\\d/.test(nm)) out.bad.push(row.name + ' ' + ph + ' ' + k + ': banner "' + nm + '"');
          });
        });
      });
      return out; })()`);
    expect(r.rows, 'twelve bosses, in the gauntlet\'s order, each with an entry, each picked').toEqual(TWELVE.map((n) => `${n}:true:true`));
    expect(r.bad).toEqual([]);
  });

  it('a close fighter makes the close moves come up more, and a far one the far moves (for every boss that has some), by a clear margin over many turns', () => {
    const share = (name, key, bx, fx) => {
      const r = PICKS(name, 3, bx, [fx], 777, 900);
      const set = new Set(r.tags.filter(([, t]) => t.includes(key)).map(([k]) => k));
      return { n: set.size, share: r.picks.filter((k) => set.has(k)).length / r.picks.length };
    };
    const out = [];
    for (const name of TWELVE) {
      // the boss at 150 (his body 85 wide), a fighter 20 px off it (close) or 665 px off it, clear of the wall (far)
      const near = share(name, 'close', 150, 150 + 85 + 20), faraway = share(name, 'close', 150, 900);
      if (near.n) out.push({ name, tag: 'close', hot: near.share, cold: faraway.share });
      const farHot = share(name, 'far', 150, 900), farCold = share(name, 'far', 150, 150 + 85 + 20);
      if (farHot.n) out.push({ name, tag: 'far', hot: farHot.share, cold: farCold.share });
    }
    expect(out.filter((o) => o.tag === 'close').length, 'most of the twelve have a move that punishes being close').toBeGreaterThanOrEqual(8);
    expect(out.filter((o) => o.tag === 'far').length, 'and a move that punishes keeping away').toBeGreaterThanOrEqual(7);
    for (const o of out) expect(o.hot - o.cold, `${o.name}: ${o.tag} moves, with the fighters where they punish (${o.hot.toFixed(3)}) and where they do not (${o.cold.toFixed(3)})`).toBeGreaterThan(0.03);
  });

  it('a platform fighter, an airborne one and a cornered one favour the moves that punish them: the stance reaches the score', () => {
    const r = W.eval(`(function(){ var out = {};
      function sit(fx, fy, ground){ fighters = [makeFighter(ROSTER.find(function(r){ return r.name === 'Firey'; }), fx, fy, 0)]; fighters[0].onground = ground; var s = { x:550, y:400, r:85 }; return bossSituation(s); }
      var gy = groundY();
      out.floor = sit(550, gy - 24, true); out.ledge = sit(550, gy - 200, true); out.air = sit(550, gy - 200, false); out.low = sit(550, gy - 24, false);
      out.wall = sit(60, gy - 24, true); out.mid = sit(550, gy - 24, true);
      fighters = [makeFighter(ROSTER.find(function(r){ return r.name === 'Firey'; }), 300, gy - 24, 0), makeFighter(ROSTER.find(function(r){ return r.name === 'Pen'; }), 340, gy - 24, 1)];
      out.bunch = bossSituation({ x:900, y:400, r:85 });
      fighters[1].x = 1000; out.spread = bossSituation({ x:900, y:400, r:85 });
      fighters = []; out.none = bossSituation({ x:550, y:400, r:85 });
      return out; })()`);
    expect([r.floor.ground, r.floor.platform, r.floor.air], 'on the floor').toEqual([1, 0, 0]);
    expect([r.ledge.ground, r.ledge.platform, r.ledge.air], 'standing on a ledge').toEqual([0, 1, 0]);
    expect([r.air.ground, r.air.platform, r.air.air], 'in the air').toEqual([0, 0, 1]);
    expect([r.low.ground, r.low.air], 'a hop just off the floor is still the floor').toEqual([1, 0]);
    expect(r.wall.wall, 'at the wall').toBeGreaterThan(0.6);
    expect(r.mid.wall, 'in the open').toBe(0);
    expect(r.bunch.bunch, 'two fighters side by side').toBeGreaterThan(0.8);
    expect(r.bunch.spread).toBe(0);
    expect(r.spread.spread, 'two fighters across the room').toBeGreaterThan(0.2);
    expect(r.spread.bunch).toBe(0);
    expect(r.none.n, 'nobody: nothing is any stance').toBe(0);
  });

  it('never the same move twice in a row, in any phase, whatever the fighters do', () => {
    const bad = [];
    for (const name of TWELVE) for (const ph of [1, 2, 3]) for (const [bx, fxs] of [[550, [100]], [200, [1000]], [200, [305]], [550, [100, 140]]]) {
      const r = PICKS(name, ph, bx, fxs, 31*ph + 7, 150);
      if (r.picks.some((k, i) => i > 0 && k === r.picks[i - 1])) bad.push(`${name} ${ph} ${bx}/${fxs}`);
    }
    expect(bad).toEqual([]);
  });

  it('every unlocked move comes up within a bounded number of turns -- three passes of the deck -- whatever the fighters do, and the moves a phase does not have never do', () => {
    const slow = [];
    for (const name of TWELVE) for (const ph of [1, 2, 3]) for (const [bx, fxs] of [[550, [100]], [200, [1000]], [200, [305]]]) for (const seed of [1, 2, 3, 4, 5]) {
      const r = PICKS(name, ph, bx, fxs, seed*977 + ph, 90), n = r.moves.length;
      let seen = new Set(), at = -1;
      r.picks.forEach((k, i) => { seen.add(k); if (seen.size === n && at < 0) at = i + 1; });
      expect(r.picks.every((k) => r.moves.includes(k)), `${name} ${ph}: only moves it has unlocked`).toBe(true);
      if (at < 0 || at > 3*n) slow.push(`${name} ph${ph} ${bx}/${fxs} seed ${seed}: ${at} turns for ${n} moves`);
    }
    expect(slow).toEqual([]);
  });

  it('seeded, it is repeatable: the same dice give the same turns, other dice other turns', () => {
    const a = PICKS('Four', 3, 550, [300], 2024, 40).picks, b = PICKS('Four', 3, 550, [300], 2024, 40).picks, c = PICKS('Four', 3, 550, [300], 2025, 40).picks;
    expect(b, 'the same seed').toEqual(a);
    expect(c, 'another seed').not.toEqual(a);
    // and it draws exactly one die a turn (so a fight stays in step with the tests' and the harness's seeds)
    const n = W.eval(`(function(){ ${RIG('Four', 3, 550, [300], 5)} try { var k = 0, R = Math.random; Math.random = function(){ k++; return R(); }; for (var i=0;i<20;i++) bossPickTurn(s); return k; } finally { done(); } })()`);
    expect(n, 'one die a turn (a forced turn draws none)').toBeLessThanOrEqual(20);
    expect(n).toBeGreaterThan(10);
  });

  it('a move can be forced (a test, a rule): it wins if it is unlocked and is ignored if it is not; the boss\'s own `force` and `first` hooks do the same', () => {
    const r = W.eval(`(function(){ var out = {}; ${RIG('MePhone4S', 1, 550, [300], 3)}
      try {
        s._pickForce = 's4popup'; out.forced = bossPickTurn(s); out.cleared = s._pickForce;
        // (the car was a phase-2 move until Round 17's "I'LL BE BACK! from phase 1": a move locked out of the draw is MePhone4's MeLife at his add cap, below)
        s._phase = 2; s._carDue = true; out.first = bossPickTurn(s); s._carDue = false;                 // the first move once phase 2 starts (the wind-up, s4BeginTelegraph, puts the flag down)
        out.after = []; for (var i=0;i<30;i++) out.after.push(bossPickTurn(s));
        s._carDue = true; s._pk.last = 's4car'; out.skipped = bossPickTurn(s); out.carDue = s._carDue; out.next = bossPickTurn(s);   // the car was the move he just played: the opening car waits a turn, and is the one after
        var a = { name:'Announcer', attack:'announcer', type:'boss', x:550, y:400, r:85, hp:100, maxHp:100, _phase:1, _tel:0, color:'#3a4a6a', face:1, vx:0, vy:0 };
        a._lastCake = { id: 1, hit: false, shots: [] }; out.acid = bossPickTurn(a); a._lastCake = null; out.noAcid = []; for (var j=0;j<14;j++) out.noAcid.push(bossPickTurn(a));
        var mp = { name:'MePhone4', attack:'mephone', type:'boss', x:550, y:400, r:85, hp:100, maxHp:100, _phase:1, _tel:0, color:'#4fb8e8', face:1, vx:0, vy:0 };
        out.melifeOpen = bossPickMoves(mp, 1).indexOf('melife') >= 0; meLifeDownload(mp, 1); out.melifeOne = bossPickMoves(mp, 1).indexOf('melife') >= 0;
        meLifeDownload(mp, -1); out.melifeCapped = bossPickMoves(mp, 1).indexOf('melife') >= 0;   // the cap is 2 in phase 1 now ("cap 2/2/3", the owner's pick, Round 17; it was 1)
        mp._pickForce = 'melife'; out.locked = bossPickTurn(mp); out.lockedWas = out.locked === 'melife'; summons = [];   // forcing a move that is out of the draw (MeLife at his cap) gets another move
        return out;
      } finally { done(); } })()`);
    expect(r.forced).toBe('s4popup');
    expect(r.cleared, 'a forced move is used once').toBe(null);
    expect(r.lockedWas, 'forcing a move that is out of the draw (MePhone4\'s MeLife at his cap) gets another one').toBe(false);
    expect(r.first, 'the car opens phase 2').toBe('s4car');
    expect(r.after.some((k, i) => (i ? r.after[i - 1] : r.first) === k), 'and the turn after it is not the car again').toBe(false);
    expect(r.after, 'then the car competes like the rest').toContain('s4car');
    expect(r.skipped, 'a car he has just played is not played twice in a row, even to open phase 2').not.toBe('s4car');
    expect(r.carDue, 'it stays owed: the phase beat\'s flag stands until a car turn starts').toBe(true);
    expect(r.next, 'and it is the next turn').toBe('s4car');
    expect(r.acid, 'a cake volley nobody was hit by: ACID TEARS! next').toBe('annacid');
    expect(r.noAcid, 'with no volley behind it nothing is forced').toContain('announcer');
    expect([r.melifeOpen, r.melifeOne, r.melifeCapped], 'MeLife is in the draw with room for an add (one standing, a second fits), and out of it at the cap of two').toEqual([true, true, false]);
  });

  it('the signature competes like every other move (it is not first, and it is not every other turn), and the item boss and the secret bosses keep what they had', () => {
    const r = W.eval(`(function(){ var out = { firsts: {}, sig: {} };
      ['Announcer', 'Purple Dragon', 'MePhone4', 'Two'].forEach(function(name){
        var row = BOSS_ROSTER.find(function(b){ return b.name === name; }), firsts = {}, alt = 0, n = 0;
        for (var seed=1; seed<=40; seed++){
          var s = { name: row.name, attack: row.attack, type: 'boss', x: 550, y: 400, r: 85, hp: 100, maxHp: 100, _phase: 1, _tel: 0, color: row.color, face: 1, vx: 0, vy: 0 };
          var sd = seed, R = Math.random; Math.random = function(){ sd |= 0; sd = (sd + 0x6d2b79f5) | 0; var t = Math.imul(sd ^ (sd >>> 15), 1 | sd); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
          try { fighters = []; var k1 = bossPickTurn(s); firsts[k1] = (firsts[k1] || 0) + 1; var seq = [k1]; for (var i=0;i<9;i++) seq.push(bossPickTurn(s));
            for (var j=0;j<seq.length;j++){ n++; if (seq[j] === row.attack && j % 2 === 0) alt++; } } finally { Math.random = R; }
        }
        out.firsts[name] = Object.keys(firsts).length; out.sig[name] = [alt, n];
      });
      out.one = [bossPicks({ attack:'one', name:'One' }), bossPicks({ attack:'cobsfight', name:'Steve Cobs' }), bossPicks({ attack:'cobs', name:'Steve Cobs' }), bossPicks({ name:'Springy', type:'boss' }), bossPicks({ attack:'springy', name:'Springy' })];
      out.paced = [bossPaced({ attack:'one' }), bossPaced({ attack:'cobsfight' }), bossPaced({ attack:'cobs' })];
      return out; })()`);
    for (const name of Object.keys(r.firsts)) {
      expect(r.firsts[name], `${name}: more than one move opens a fight`).toBeGreaterThan(1);
      expect(r.sig[name][0]/r.sig[name][1], `${name}: the signature is not every other turn (it was 0.5 of all turns, on every even one)`).toBeLessThan(0.35);
    }
    expect(r.one, 'One, Steve Cobs and an item boss are not picked: only the twelve are').toEqual([false, false, false, false, true]);
    expect(r.paced, 'and they are not paced either').toEqual([false, false, false]);
  });
});

// A whole fight, frame by frame, with one still fighter who cannot be hurt: for each wind-up that begins, was anything of the attack before it still alive (a shot with its id, or what the boss's own `busy`
// says), and how long was it since that attack was over (the frame the engine's watch let the gap go) -- and twenty frames into each window, is the boss on the screen and does a shot of a fighter's hurt him.
const FIGHT = (name, ph, frames) => `(function(){
  var seed = ${40 + ph}, _R = Math.random; Math.random = function(){ seed |= 0; seed = (seed + 0x6d2b79f5) | 0; var t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };   // the tests' own dice: a fight does not depend on the tests before it
  try {
  SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
  BOSSRUSH = { active:false, bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.name===${JSON.stringify(name)}; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats=platRectsSmall(); summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; impactFxClear();
  var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 300, groundY()-24, 0);
  f.team=0; f.controller='still'; f.stocks=99; fighters=[f];
  spawnBossRushBoss();
  var b = summons.find(function(s){ return s.type==='boss'; }), P = BOSS_PICK[b.attack];
  b.hp = b.maxHp*[0, 1, 0.5, 0.2][${ph}];
  var turns = [], bad = [], overAt = -1, gapAtOver = 0, lastBusy = false, lastAlive = 0, probe = null, probes = 0, hits = 0, off = [], missed = [], windows = 0;
  for (var i=0;i<${frames};i++){
    var wasLive = !!b._atkLive, pre = b._tel;
    f.invuln = 1e9; f.pct = 0; f.dead = false; f.vx = 0;
    if (!probe && !b._atkLive && !(b._tel > 0) && overAt >= 0 && i - overAt === 20){
      windows++;
      if (!(b.x > -b.r && b.x < WW + b.r && b.y + b.r > 0 && b.y - b.r < WH)) off.push([i, Math.round(b.x), Math.round(b.y)]);
      probe = { hp0: b.hp, at: i };
      addProj({ owner:0, ownerObj:f, x:b.x, y:b.y, vx:0, vy:0, r:8, dmg:3, kb:0, life:4, grav:false, noAim:true });
    }
    step();
    if (probe){ probes++; if (b.hp < probe.hp0) hits++; else missed.push(probe.at); b.hp = probe.hp0; probe = null; }
    if (wasLive && !b._atkLive && overAt < 0){ overAt = i; gapAtOver = bossAtkGap(b); }
    if (!(pre > 0) && b._tel > 0){
      var kind = b._pickKey || b._telKind;
      turns.push({ i: i, kind: kind, since: overAt >= 0 ? i - overAt : null, gap: gapAtOver });
      if (lastAlive || lastBusy) bad.push({ i: i, kind: kind, alive: lastAlive, busy: lastBusy });
      overAt = -1;
    }
    var lo = b._atkLive ? b._atkLive.lo : null;
    lastBusy = (!(b._tel > 0) && P.busy) ? !!P.busy(b) : false;
    lastAlive = lo == null ? 0 : projectiles.filter(function(p){ return bossShotLive(p, lo); }).length;
    if (b._tel > 0){ lastBusy = false; lastAlive = 0; }
  }
  return { turns: turns, bad: bad, probes: probes, hits: hits, off: off, missed: missed, windows: windows, phase: b._phase };
  } finally { Math.random = _R; }
})()`;

describe('one attack at a time: the next wind-up waits until the last of the attack before it is gone, and the gap counted from then is the window to hit him', () => {
  for (const name of TWELVE) {
    it(`${name}: through three phases of a fight, no wind-up begins under a shot or a scripted part of the attack before it; the window after is at least the paced gap; he is on the screen and a hit hurts him`, () => {
      for (const ph of [1, 2, 3]) {
        const r = W.eval(FIGHT(name, ph, name === 'Puffball Speaker Box' ? 1600 : name === 'Springy' ? 1300 : 1000));   // (her turns are the longest: a song of four seconds, a dash and five cuts; Springy's slams take a quarter longer to wind up since 2026-10-03, BOSS_TEL_PACE)
        const at = `${name} phase ${ph}`;
        expect(r.phase, `${at}: the fight is in the phase asked for`).toBe(ph);
        expect(r.turns.length, `${at}: he keeps attacking (nothing waits for ever): ${r.turns.map((t) => t.kind)}`).toBeGreaterThanOrEqual(3);
        expect(r.bad, `${at}: no wind-up under a live shot or a busy move of the turn before`).toEqual([]);
        for (const t of r.turns) if (t.since != null) expect(t.since + 1, `${at}: the turn at frame ${t.i} (${t.kind}) came ${t.since} frames after the last was over; the gap is ${t.gap}`).toBeGreaterThanOrEqual(t.gap);
        expect(r.windows, `${at}: windows were measured`).toBeGreaterThanOrEqual(2);
        expect(r.off, `${at}: on the screen in the window`).toEqual([]);
        // (Two's phase 3 is the one boss who cannot be hurt at will: "defeat is only possible while their power is grounded" -- his mechanic, and it stays)
        if (!(name === 'Two' && ph === 3)) expect(r.missed, `${at}: a fighter's shot hurts him in the window`).toEqual([]);
      }
    }, 120000);
  }

  it('over means: no shot of the attack alive -- not a trap, not what only lies there (`lingers`) -- none that has left the arena for good (it is taken out), and nothing the boss\'s own busy says', () => {
    const r = W.eval(`(function(){ var out = {};
      var s = { name:'Two', attack:'two', type:'boss', x:550, y:400, r:85, hp:100, maxHp:100, _phase:1, _tel:0 }, A = { lo: 10 }, mk = function(o){ return Object.assign({ owner:-2, x:300, y:300, vx:0, vy:0, r:10, life:50, bossAtk:11, dmg:5 }, o); };
      projectiles = []; out.none = bossAttackOver(s, A);
      projectiles = [mk({ x:-400, vx:-5 }), mk({ x:1500, vx:5 })]; out.gone = [bossAttackOver(s, A), projectiles.map(function(p){ return p.life; })];
      projectiles = [mk({ x:-400, vx:5 })]; out.coming = [bossAttackOver(s, A), projectiles[0].life];
      projectiles = [mk({ x:-400, vx:-5, mpBm:{} })]; out.boomerang = [bossAttackOver(s, A), projectiles[0].life];
      projectiles = [mk({ x:-400, vx:-5, delay:30 })]; out.waiting = [bossAttackOver(s, A), projectiles[0].life];
      projectiles = [mk({ trap:true }), mk({ lingers:true }), mk({ bossAtk:3 }), mk({ bossAtk:null }), mk({ life:0 })]; out.terrain = bossAttackOver(s, A);
      projectiles = [mk({ })]; out.alive = bossAttackOver(s, A);
      projectiles = []; s._tw = { k:'sun' }; out.busy = bossAttackOver(s, A); s._tw = null; out.free = bossAttackOver(s, A);
      var a = { name:'Announcer', attack:'announcer', type:'boss', x:550, y:400, r:85, hp:100, maxHp:100, _phase:1, _tel:0, _q:[] }; projectiles = [mk({ })];
      out.ownAnswer = bossAttackOver(a, A);   // the Announcer's busy is the whole answer (scan: false): his shot is not a puddle, and annBusy knows it
      projectiles = []; return out; })()`);
    expect(r.none, 'nothing alive: over').toBe(true);
    expect(r.gone[0], 'shots out past either edge and still going are gone: over').toBe(true);
    expect(r.gone[1], 'and taken out of the game, since nothing out there can hit anyone').toEqual([0, 0]);
    expect(r.coming[0], 'a shot coming in from beyond the edge is not gone').toBe(false);
    expect(r.coming[1]).toBeGreaterThan(0);
    expect(r.boomerang, 'a boomerang out past the edge is coming back: not gone').toEqual([false, 50]);
    expect(r.waiting, 'a shot waiting on its delay has not begun: not gone').toEqual([false, 50]);
    expect(r.terrain, 'a trap, a thing that lies there, an older attack\'s shot, a shot with no id, a dead one: none of them is the attack').toBe(true);
    expect(r.alive, 'a live shot with this attack\'s id: not over').toBe(false);
    expect(r.busy, 'the boss\'s own busy says it is not over').toBe(false);
    expect(r.free, 'and when it stops saying so it is').toBe(true);
    expect(r.ownAnswer, 'the Announcer\'s own list of what is still to strike is the whole answer (his shot here is a damaging one: not over)').toBe(false);
  });

  it('what a boss keeps standing does not hold the next attack: MePhone4\'s MeLife adds, and a floor patch or a hole that lies there; the arena\'s hazard goes on all through the hold', () => {
    const r = W.eval(`(function(){ var out = {};
      var mp = { name:'MePhone4', attack:'mephone', type:'boss', x:550, y:400, r:85, hp:100, maxHp:100, _phase:2, _tel:0, _hz:{} };
      summons = []; projectiles = []; meLifeDownload(mp, 1); out.adds = hostileCount(); out.addOver = bossAttackOver(mp, { lo: 0 });
      summons = [];
      var fs = { name:'Firey Speaker Box', attack:'firewall', type:'boss', x:550, y:400, r:85, hp:100, maxHp:100, _phase:1, _tel:0 };
      projectiles = [{ owner:-2, x:300, y:500, vx:0, vy:0, r:14, life:100, bossAtk:5, volley:true, fsb:true, lingers:true }]; out.patch = bossAttackOver(fs, { lo: 0 });
      var sp = { name:'Springy', attack:'springy', type:'boss', x:550, y:400, r:85, hp:100, maxHp:100, _phase:1, _tel:0 };
      projectiles = [springyHole(300, 1, 7)]; out.hole = bossAttackOver(sp, { lo: 0 }); out.holeLingers = !!projectiles[0].lingers;
      projectiles = []; summons = [];
      // the hazard: Four's room, a held attack (a shot that never ends), 120 frames of his update
      var row = BOSS_ROSTER.find(function(b){ return b.name === 'Four'; });
      SETTINGS.mode='boss'; BOSSRUSH = { active:false, bossIdx:BOSS_ROSTER.indexOf(row), cleared:0, defeated:false, loop:0, dmgMult:1 };
      var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 300, groundY()-24, 0); f.team = 0; f.controller = 'still'; f.stocks = 9; fighters = [f];
      spawnBossRushBoss(); var b = summons.find(function(q){ return q.type === 'boss'; });
      var calls = 0, _h = arenaHazardStep; arenaHazardStep = function(){ calls++; return _h.apply(this, arguments); };
      try {
        b._atkLive = { lo: 0 }; b._atkTimer = 5; var held = [];
        addProj({ owner:-2, ownerObj:{ team:-1, idx:-2 }, x:600, y:300, vx:0, vy:0, r:10, life:9999, delay:1e6, bossAtk:1e9, dmg:0, kb:0, noAim:true });
        for (var i=0;i<120;i++){ f.invuln = 1e9; updateBossAttack(b, f); held.push(b._atkTimer); }
      } finally { arenaHazardStep = _h; }
      out.hazardCalls = calls; out.held = [Math.min.apply(null, held.slice(1)), Math.max.apply(null, held)]; out.tel = b._tel;
      projectiles = []; summons = []; return out; })()`);
    expect(r.adds).toBe(1);
    expect(r.addOver, 'an add he has downloaded is not part of the attack: it never held a turn back').toBe(true);
    expect(r.patch, 'a patch of fire that lies there does not hold the next wind-up').toBe(true);
    expect([r.hole, r.holeLingers], 'nor does a hole in the floor').toEqual([true, true]);
    expect(r.hazardCalls, 'the arena\'s hazard ran every frame of the hold').toBe(120);
    expect(r.held[0], 'and the boss waited the whole time: his timer was held at the hold (one frame of countdown under it), no wind-up began').toBeGreaterThanOrEqual(999999);
    expect(r.held[1]).toBeLessThanOrEqual(1e6);
    expect(r.tel).toBe(0);
  });

  it('a boss parked for good (a timer past the hold: 1e9, a test\'s or a scripted beat\'s) is not watched, and stays parked; one that is not parked is held, and then let go', () => {
    const r = W.eval(`(function(){ var out = {};
      var s = { name:'Two', attack:'two', type:'boss', x:550, y:400, r:85, hp:100, maxHp:100, _phase:1, _tel:0, _atkTimer:1e9, _atkLive:{ lo: 0 } };
      fighters = []; projectiles = []; bossAttackWatch(s); out.parked = [s._atkTimer, s._atkLive];
      s._atkTimer = 10; s._atkLive = { lo: 0 }; projectiles = [{ owner:-2, x:300, y:300, vx:0, vy:0, r:10, life:50, bossAtk:5, dmg:5 }]; bossAttackWatch(s); out.held = [s._atkTimer, !!s._atkLive];
      projectiles = []; bossAttackWatch(s); out.let = [s._atkTimer, !!s._atkLive, bossAtkGap(s)];
      return out; })()`);
    expect(r.parked, 'parked: the watch lets go and leaves the timer where it was').toEqual([1e9, null]);
    expect(r.held, 'a shot of the attack is alive: the timer is held').toEqual([1e6, true]);
    expect(r.let[0], 'the shot is gone: the gap starts, the paced gap').toBe(r.let[2]);
    expect(r.let[1]).toBe(false);
  });
});

describe('boss HP: +50% for every Boss Rush boss (the owner, 2026-10-01, Round 17: "+50% (Recommended)")', () => {
  it('one constant, 1.5, applied where the HP is set: every row spawns with half again its HP (times the fighters\' 1 + 0.6 each more), the rows keep their numbers, and One and Steve Cobs keep theirs', () => {
    const r = W.eval(`(function(){ var out = { mult: BOSS_HP_MULT, rows: [] };
      BOSS_ROSTER.forEach(function(row, i){
        SETTINGS.mode='boss'; BOSSRUSH = { active:false, bossIdx:i, cleared:0, defeated:false, loop:0, dmgMult:1 };
        var res = [];
        [1, 2, 3].forEach(function(n){
          summons = []; projectiles = []; worldPlats = [];
          fighters = []; for (var k=0;k<n;k++){ var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 300 + k*60, groundY()-24, k); f.team = 0; f.controller = 'still'; fighters.push(f); }
          spawnBossRushBoss(); var b = summons.find(function(q){ return q.type === 'boss'; });
          res.push([b.maxHp, b.hp]);
        });
        out.rows.push({ name: row.name, hp: row.hp, res: res });
      });
      summons = []; out.cobs = makeBossSummon(COBS_ROW, COBS_ROW.hp).maxHp; out.cobsRow = COBS_ROW.hp; return out; })()`);
    expect(r.mult, 'BOSS_HP_MULT').toBe(1.5);
    expect(r.rows).toHaveLength(12);
    for (const row of r.rows) {
      const hp = (n) => Math.round(row.hp * 1.5 * (1 + (n - 1)*0.6)), one = hp(1), two = hp(2), three = hp(3);
      expect(row.res.map((x) => x[0]), `${row.name}: ${row.hp} x 1.5 for one fighter, the fighters' own scaling on top`).toEqual([one, two, three]);
      expect(row.res.every((x) => x[0] === x[1]), `${row.name}: spawns at full health`).toBe(true);
    }
    expect(r.rows[0], 'Boss 1: 175 -> about 260').toMatchObject({ name: 'Announcer', hp: 175 });
    expect(r.rows[0].res[0][0]).toBe(263);
    expect(r.rows[11], 'Four: 340 -> 510').toMatchObject({ name: 'Four', hp: 340 });
    expect(r.rows[11].res[0][0]).toBe(510);
    expect(r.cobs, 'Steve Cobs is not a Boss Rush boss: his HP is his row\'s').toBe(r.cobsRow);
  });
});
