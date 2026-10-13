import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// Unit 7 — tournament simulation hardening.
//
// Fighter RATINGS are deliberately out of scope (see the plan: no trustworthy strength data
// exists, and the obvious sources are inverted or circular). These are the three defects found
// while investigating that, each of which is real independent of any rating.

// NOTE: startTournament's first argument is TEAM SIZE (1 = solo, 2 = 2v2), not the number of
// teams — that is hardcoded at 48. Passing 48 here builds 48-member teams and makes every
// with-replacement duplicate assertion trivially true.
function startTourney(w, teamSize = 1, mode = 'spectate') {
  w.eval(`startTournament(${teamSize}, ${JSON.stringify(mode)})`);
}

describe('Unit 7 — teamStrength can never invert the simulation', () => {
  it('is strictly positive for every constructible team', () => {
    const { window: w } = loadMonolith();
    startTourney(w);
    const min = w.eval(`
      (function(){
        var worst = Infinity;
        for (var i=0;i<TOURNEY.teams.length;i++) worst = Math.min(worst, teamStrength(TOURNEY.teams[i]));
        return worst;
      })()`);
    expect(min).toBeGreaterThan(0);
  });

  it('stays positive for a team built entirely from the weakest possible members', () => {
    // The hazard: simGroupMatch rolls Math.random()*(strA+strB) and compares < strA. If a future
    // rating lets strength reach <= 0 the roll goes negative, is always < strA, and team A wins
    // 5-0 every single time — a deterministic inversion a roster-wide spread check cannot see.
    const { window: w } = loadMonolith();
    startTourney(w);
    const s = w.eval(`teamStrength({ members: ROSTER.slice(0, 8) })`);
    expect(s).toBeGreaterThan(0);
  });
});

describe('Unit 7 — standings order is stable and unbiased', () => {
  it('cmpTeam is a consistent comparator: sorting twice yields the same order', () => {
    const { window: w } = loadMonolith();
    startTourney(w);
    const [a, b] = w.eval(`
      (function(){
        var g = TOURNEY.groups[0];
        var first  = [...g].sort(cmpTeam).map(function(t){ return t.id; }).join(',');
        var second = [...g].sort(cmpTeam).map(function(t){ return t.id; }).join(',');
        return [first, second];
      })()`);
    expect(a).toBe(b);
  });

  it('re-rendering the hub does not reshuffle unchanged standings', () => {
    const { window: w } = loadMonolith();
    startTourney(w);
    const before = w.eval(`groupStandings(0).map(function(t){return t.id;}).join(',')`);
    w.eval('showTourneyHub(); showTourneyHub();');
    const after = w.eval(`groupStandings(0).map(function(t){return t.id;}).join(',')`);
    expect(after).toBe(before);
  });

  it('breaks fully-tied teams by a stable key rather than array index', () => {
    // Every team starts 0/0/0, so at kickoff the entire group is tied on points, stock
    // difference, and stocks scored — the final tiebreak decides the whole order. Falling back
    // to a.id - b.id means low-index teams systematically place higher before a ball is kicked.
    const { window: w } = loadMonolith();
    startTourney(w);
    const ids = w.eval(`groupStandings(0).map(function(t){return t.id;})`);
    const ascending = [...ids].sort((x, y) => x - y);
    expect(ids, 'tied standings are in raw id order — index bias').not.toEqual(ascending);
  });
});

describe('Unit 7 — team construction', () => {
  it('never puts the same fighter in a team twice', () => {
    const { window: w } = loadMonolith();
    startTourney(w, 2);   // 2v2 — the only setting where a within-team duplicate is possible
    const dupes = w.eval(`
      (function(){
        return TOURNEY.teams.filter(function(t){
          var names = t.members.map(function(m){ return m.name; });
          return new Set(names).size !== names.length;
        }).length;
      })()`);
    expect(dupes).toBe(0);
  });

  // The test above only ever ran SPECTATE mode, which is why the normal-mode duplicate below
  // survived it: the bug lived in the `myTeam.members[0] = me` seating that spectate never reaches.
  it('never fields your pick twice on your own team in normal mode', () => {
    const { window: w } = loadMonolith();
    // Shrink the pool to two fighters so every side is the SAME pair and the seating collision is
    // forced rather than waited for — with the full 59 it lands about once in 59 tournaments.
    const dupes = w.eval(`
      (function(){
        ROSTER.forEach(function(r){ r.play = false; });
        ROSTER[0].play = true; ROSTER[1].play = true;
        chosen = ROSTER[0];
        var bad = 0;
        for (var run = 0; run < 40; run++) {
          startTournament(2, 'normal');
          bad += TOURNEY.teams.filter(function(t){
            var names = t.members.map(function(m){ return m.name; });
            return new Set(names).size !== names.length;
          }).length;
        }
        return bad;
      })()`);
    expect(dupes).toBe(0);
  });

  it('gives your pick to nobody else — one fighter, one team', () => {
    const { window: w } = loadMonolith();
    // teamSize 1: 48 sides drawn from 59, so every side is distinct and a repeat can only come
    // from seating YOUR fighter on top of a side that already had it.
    const clashes = w.eval(`
      (function(){
        chosen = ROSTER[7];
        var bad = 0;
        for (var run = 0; run < 60; run++) {
          startTournament(1, 'normal');
          var names = TOURNEY.teams.map(function(t){ return t.members[0].name; });
          if (new Set(names).size !== names.length) bad++;
          if (TOURNEY.myTeam.members[0] !== chosen) bad++;
        }
        return bad;
      })()`);
    expect(clashes).toBe(0);
  });

  it('spends every fighter once before spending any of them twice', () => {
    const { window: w } = loadMonolith();
    // The old per-team bag reset the draw 48 times over, so one fighter could lead a dozen sides.
    // One bag for the whole cup bounds it: 48 slots at teamSize 1 all differ, and the 96 slots of
    // a 2v2 cup come out of 59 fighters, so nobody can appear more than twice.
    const worst = w.eval(`
      (function(){
        var peak = { solo: 0, duo: 0 };
        for (var run = 0; run < 25; run++) {
          [[1, 'solo'], [2, 'duo']].forEach(function(pair){
            startTournament(pair[0], 'spectate');
            var count = {};
            TOURNEY.teams.forEach(function(t){
              t.members.forEach(function(m){ count[m.name] = (count[m.name] || 0) + 1; });
            });
            Object.keys(count).forEach(function(n){
              if (count[n] > peak[pair[1]]) peak[pair[1]] = count[n];
            });
          });
        }
        return peak;
      })()`);
    expect(worst.solo, 'a fighter led two different sides in a solo cup').toBe(1);
    expect(worst.duo, 'a fighter turned out for three different sides in a 2v2 cup').toBeLessThanOrEqual(2);
  });

  it('still runs a full 48-team tournament without error', () => {
    const { window: w } = loadMonolith();
    startTourney(w);
    expect(() => w.eval(`
      var guard = 0;
      while (TOURNEY.stage !== 'done' && guard++ < 50) {
        for (var i=0;i<TOURNEY.fixtures.length;i++) {
          var fx = TOURNEY.fixtures[i];
          if (!fx.played) { fx.kind === 'group' ? simGroupMatch(fx) : simKnockoutMatch(fx); }
        }
        proceedAfterRound();
      }
    `)).not.toThrow();
    expect(w.eval('TOURNEY.champion && TOURNEY.champion.name')).toBeTruthy();
  });
});

// ---- Watched group-fixture length -------------------------------------------------------------
// The owner playtested the World Cup and reported "the group stage matches are too short": a
// watched group fixture gives everyone infinite stocks and is scored on KOs when the clock runs
// out, so TOURNEY_TIME_LIMIT IS the length of the fight. It was ~20s, which a 2-a-side game barely
// got past the first exchange of. These pin the new length and — more importantly — pin down that
// the clock governs ONLY watched group fixtures.
// (2026-10-13: group fixtures are stock fights now; the clock is the default cap on one that will not end by itself.)
describe('World Cup — watched group fixtures run long enough to be a match', () => {
  it('each fighter in a fixture is hit by its OWN hurtbox and has its own KO cap (a real bug: the slots were renamed, not rebuilt)', () => {
    // the owner, 2026-10-13: "hurtboxes are different in world cup" -- every slot kept the hurtbox of whoever buildFighters had put there
    const { window: w } = loadMonolith();
    startTourney(w);
    const rows = w.eval(`
      (function(){
        var g = TOURNEY.fixtures.find(function(f){ return f.kind === 'group'; });
        watchFixture(g, false);
        var out = fighters.map(function(f){ var r = ROSTER.find(function(x){ return x.name === f.name; }) || {};
          return { name:f.name, hurt:JSON.stringify(f.hurt), own:JSON.stringify(hurtboxFor(f.name)), cap:f.koCap, ownCap:Math.round(150 + (r.w || 90)), arch:f.arch, ownArch:r.arch || 'Contestant' }; });
        TOURNEY_WATCHING = null; TOURNEY_MATCH_ACTIVE = false; running = false;
        return out;
      })()`);
    expect(rows.length).toBeGreaterThan(1);
    for (const r of rows) {
      expect(r.hurt, r.name + "'s hurtbox").toBe(r.own);
      expect(r.cap, r.name + "'s KO cap").toBe(r.ownCap);
      expect(r.arch, r.name + "'s arch").toBe(r.ownArch);
    }
  });

  // Restated 2026-10-13. This pin used to say a watched group fixture runs about forty seconds (38-75 s) on endless stocks, scored on KOs
  // when the clock ran out. The owner asked for "group matches fought on stocks" (2 by default, knockouts keeping their rules): the fight now
  // ends when a side is out, and the clock (90 s by default, set on the setup screen) is only a cap on a fight that will not end by itself.
  it('fights a watched group fixture on stocks (2 each by default), with a clock that is only a cap', () => {
    const { window: w } = loadMonolith();
    const frames = w.eval('TOURNEY_TIME_LIMIT');
    expect(frames / 60, 'seconds of cap on a group match').toBeGreaterThanOrEqual(60);
    expect(frames / 60, '…still a fixture, not a full match').toBeLessThanOrEqual(150);
    startTourney(w);
    const r = w.eval(`
      (function(){
        var g = TOURNEY.fixtures.find(function(f){ return f.kind === 'group'; });
        watchFixture(g, false);
        var out = { stocks: fighters.map(function(f){ return f.stocks; }), total: g._stk0.slice() };
        TOURNEY_WATCHING = null; TOURNEY_MATCH_ACTIVE = false; running = false;
        return out;
      })()`);
    expect(r.stocks, "every fighter has the cup's 2 group stocks, none infinite").toEqual([2, 2]);
    expect(r.total, 'and each side started with the sum').toEqual([2, 2]);
  });

  it('scores a group fixture by the stocks each side took, whoever wipes the other out or leads on the clock', () => {
    const { window: w } = loadMonolith();
    startTourney(w);
    const r = w.eval(`
      (function(){
        var g = TOURNEY.fixtures.find(function(f){ return f.kind === 'group'; });
        watchFixture(g, false);
        fighters[1].stocks = 0; fighters[1].dead = true;       // side B is wiped out; side A lost one of its two
        fighters[0].stocks = 1;
        finishWatchedGroup(g);
        return { sa: g.result.sa, sb: g.result.sb, a: g.a.pts, b: g.b.pts };
      })()`);
    expect(r).toEqual({ sa: 2, sb: 1, a: 3, b: 0 });
    // the same fight on the clock: equal stocks lost is a draw
    const d = w.eval(`
      (function(){
        var g = TOURNEY.fixtures.find(function(f){ return f.kind === 'group' && !f.played; });   // the group's other game: two teams that have not played
        watchFixture(g, false);
        finishWatchedGroup(g);
        return { sa: g.result.sa, sb: g.result.sb, a: g.a.pts, b: g.b.pts };
      })()`);
    expect(d).toEqual({ sa: 0, sb: 0, a: 1, b: 1 });
  });

  it('a knockout that runs out of clock still has a winner: the side with more stocks left', () => {
    const { window: w } = loadMonolith();
    startTourney(w);
    const win = w.eval(`
      (function(){
        TOURNEY_CFG.kTime = 120;
        var g = TOURNEY.fixtures[0]; g.kind = 'ko';
        watchFixture(g, false);
        fighters[0].stocks = 1; fighters[1].stocks = 3;
        return cupTimedWinner(g);
      })()`);
    expect(win).toBe(1);
  });

  it('arms the clock for a GROUP fixture and leaves knockout on elimination', () => {
    const { window: w } = loadMonolith();
    startTourney(w);
    const armed = w.eval(`
      (function(){
        var g = TOURNEY.fixtures.find(function(f){ return f.kind === 'group'; });
        watchFixture(g, false);
        var groupTimer = TOURNEY.liveTimer;
        TOURNEY_WATCHING = null; TOURNEY_MATCH_ACTIVE = false; running = false;
        return groupTimer;
      })()`);
    // (watchFixture kicks the loop, which burns the first frame off the clock)
    expect(armed, 'a group fixture is timed').toBeGreaterThan(w.eval('TOURNEY_TIME_LIMIT') - 3);
    // …and the tick only counts down for group fixtures.
    const koCounts = w.eval(`
      (function(){
        TOURNEY_WATCHING = { kind:'ko' };
        TOURNEY.liveTimer = 999;
        tourneyLiveTick(); tourneyLiveTick();
        var after = TOURNEY.liveTimer;
        TOURNEY_WATCHING = null;
        return after;
      })()`);
    expect(koCounts, 'a knockout fixture ignores the clock entirely').toBe(999);
  });

  it('leaves the instant-sim path completely untouched by the clock', () => {
    // Every fixture the player does not watch is resolved by simGroupMatch, a statistical roll
    // with no clock at all. Lengthening the watched match must not change a single auto result.
    const { window: w } = loadMonolith();
    // The seed is installed BEFORE startTournament, so both runs draw the same 48 teams.
    // This used to reseed afterwards, which worked only because teamStrength was blind to fighter
    // identity — every lineup produced identical rolls. Now that the sim rates real fighters, two
    // runs with different teams legitimately differ, and seeding late would be comparing rosters
    // rather than clock lengths.
    const roll = (limit) => {
      w.eval(`Math.random = (function(){ var s = 12345; return function(){
        s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; })();`);
      startTourney(w);
      return w.eval(`
        (function(){
          TOURNEY_TIME_LIMIT = ${limit};
          var g = TOURNEY.fixtures.filter(function(f){ return f.kind === 'group'; }).slice(0, 12);
          return g.map(function(fx){ var r = simGroupMatch(fx); return r.sa + ':' + r.sb; }).join(',');
        })()`);
    };
    expect(roll(60 * 40), 'same results at any clock length').toBe(roll(60 * 5));
  });

  it('scores a timed-out group fixture and hands control back to the hub', () => {
    const { window: w } = loadMonolith();
    startTourney(w);
    const out = w.eval(`
      (function(){
        var g = TOURNEY.fixtures.find(function(f){ return f.kind === 'group'; });
        watchFixture(g, false);
        var guard = 0;
        while (TOURNEY_WATCHING && guard++ < TOURNEY_TIME_LIMIT + 10) tourneyLiveTick();
        return JSON.stringify({
          ticks: guard, played: g.played, result: g.result,
          watching: TOURNEY_WATCHING, running: running, matchActive: TOURNEY_MATCH_ACTIVE,
          points: g.a.P + g.b.P
        });
      })()`);
    const r = JSON.parse(out);
    // (watchFixture's own loop() burns the first frame, so the clock is 1 tick shorter here)
    expect(r.ticks, 'it ran the whole clock out').toBeGreaterThan(w.eval('TOURNEY_TIME_LIMIT') - 3);
    expect(r.ticks, 'and no longer').toBeLessThanOrEqual(w.eval('TOURNEY_TIME_LIMIT'));
    expect(r.played, 'the fixture is marked played').toBe(true);
    expect(r.result, 'and carries a score').toBeTruthy();
    expect(typeof r.result.sa, 'scored on KOs').toBe('number');
    expect(r.watching, 'control left the match').toBe(null);
    expect(r.running, 'the match loop stopped').toBe(false);
    expect(r.matchActive, 'and the tournament-match flag cleared').toBe(false);
    expect(r.points, 'both teams were credited a played fixture').toBe(2);
  });
});

// ---- Big stages in the cup -----------------------------------------------------------------------
// The setup's Stages row (all / small / big / pick) chooses what a fixture is fought on. A solo fixture on a big stage is the same scrolling
// arena a normal free-for-all uses; with nobody of yours in it the camera follows the fight instead of the first fighter in the list.
describe('World Cup — big stages', () => {
  it('draws the stage of a fixture from the pool, and falls back to the small ones when the list is empty', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`
      (function(){
        var kinds = function(p){ var pool = cupStagePool({ pool:p, picks:[] }); return { n:pool.length, big:pool.filter(function(s){ return s.big; }).length }; };
        var pick = cupStagePool({ pool:'pick', picks:['canyon','goiky'] }).map(function(s){ return s.id; });
        return { all:kinds('all'), small:kinds('small'), big:kinds('big'), pick:pick, empty:kinds('pick') };
      })()`);
    expect(r.small.big, 'small only').toBe(0);
    expect(r.big.big, 'big only').toBe(r.big.n);
    expect(r.all.n).toBe(r.small.n + r.big.n);
    expect(r.pick.sort()).toEqual(['canyon', 'goiky']);
    expect(r.empty.n, 'nothing ticked: the small stages').toBe(r.small.n);
    expect(r.empty.big).toBe(0);
  });

  it('plays a solo fixture on a big stage: a scrolling arena, the pair together in the middle, the camera on them', () => {
    const { window: w } = loadMonolith();
    startTourney(w);
    const r = w.eval(`
      (function(){
        TOURNEY.cfg = cupClean({ ...TOURNEY.cfg, pool:'pick', picks:['grandplains'] });
        var g = TOURNEY.fixtures.find(function(f){ return f.kind === 'group'; });
        watchFixture(g, false); paused = true;
        var out = { big:stage.big, scrolls:scrolls(), wide:WW > W*2, apart:Math.abs(fighters[0].x - fighters[1].x), mid:(fighters[0].x + fighters[1].x)/2 / WW,
                    focus:cupCamFocus(), camX:camX, camY:camY };
        for (var i = 0; i < 120; i++) step();                     // two seconds on: the camera has stayed with them
        var f = cupCamFocus(); out.onScreen = f.x - camX > 0 && f.x - camX < W && f.y - camY > 0 && f.y - camY < H;
        TOURNEY_WATCHING = null; TOURNEY_MATCH_ACTIVE = false; running = false;
        return out;
      })()`);
    expect(r.big).toBe(true);
    expect(r.scrolls).toBe(true);
    expect(r.wide, 'the world is wider than two screens').toBe(true);
    expect(Math.abs(r.apart - 600), 'they start about 600 px apart').toBeLessThan(10);
    expect(r.mid, 'in the middle of the world').toBeCloseTo(0.5, 2);
    expect(r.camX, 'the camera started on the fight, not at the corner of the world').toBeGreaterThan(500);
    expect(r.onScreen, 'and the fight is on screen').toBe(true);
  });
});
