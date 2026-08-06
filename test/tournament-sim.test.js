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
describe('World Cup — watched group fixtures run long enough to be a match', () => {
  it('runs a watched group fixture for about forty seconds', () => {
    const { window: w } = loadMonolith();
    const frames = w.eval('TOURNEY_TIME_LIMIT');
    expect(frames / 60, 'seconds of group match').toBeGreaterThanOrEqual(38);
    expect(frames / 60, '…but still a fixture, not a full match').toBeLessThanOrEqual(75);
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
    const roll = (limit) => {
      startTourney(w);
      return w.eval(`
        (function(){
          TOURNEY_TIME_LIMIT = ${limit};
          Math.random = (function(){ var s = 12345; return function(){
            s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; })();
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
