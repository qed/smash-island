import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadMonolith } from './helpers/load-monolith.js';

// Wave 2 — the World Cup reads real fighter strength.
//
// teamStrength() counted TEAM SIZE and nothing else (`s += 0.5 + Math.random()*0.5`), so every
// unwatched fixture was a coin flip and choosing a great fighter changed nothing about a run.
// It now sums measured per-fighter ratings.
//
// THE TEST THAT MATTERS MOST IS THE SIGN CHECK. The obvious rating input is RANGE_PROFILE, and it
// is inverted: it is a COMPENSATION table whose values were tuned to flatten win rates, so its
// strong-looking numbers mark historically WEAK fighters. A rating built from it would rank the
// roster backwards and hand the World Cup to the worst fighters — while every spread/upset-band
// check still passed, because the spread would look perfectly healthy in either direction. So the
// correlation's SIGN is asserted, not just its magnitude.

function ratedRoster(w) {
  return JSON.parse(w.eval(`
    JSON.stringify(ROSTER.filter(function(r){return r.play;}).map(function(r){
      return { name:r.name, rating:fighterRating(r), winRate:fighterWinRate(r.name) };
    }))`));
}
// Pearson correlation — the sign is the whole point.
function correlate(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx += (xs[i] - mx) ** 2;
    dy += (ys[i] - my) ** 2;
  }
  return num / Math.sqrt(dx * dy);
}

describe('fighter ratings — the sign, not just the spread', () => {
  it('rates better-performing fighters HIGHER, not lower', () => {
    const { window: w } = loadMonolith();
    const rows = ratedRoster(w);
    const r = correlate(rows.map(x => x.winRate), rows.map(x => x.rating));
    expect(r, 'rating is anti-correlated with measured win rate — the RANGE_PROFILE inversion').toBeGreaterThan(0.9);
  });

  it('is NOT derived from RANGE_PROFILE, whose stats mean the opposite of strength', () => {
    // Belt and braces against the trap being re-entered by a future edit: a rating built from
    // RANGE_PROFILE damage would track it POSITIVELY, and would therefore rank the roster
    // backwards. That is the only direction this test needs to forbid.
    //
    // A strong NEGATIVE correlation is expected and healthy — it is the compensation table doing
    // exactly its job. Every balance pass lowers damage for fighters who win too much and raises it
    // for those who lose too much, so the better the roster is balanced, the more anti-correlated
    // damage becomes with real strength. Measured -0.67 after the automated passes, while
    // rating-vs-measured-win-rate stayed at 1.000. An earlier version of this test asserted
    // |corr| < 0.5 and so failed on a *well* balanced roster, which is precisely backwards.
    const { window: w } = loadMonolith();
    const rows = JSON.parse(w.eval(`
      JSON.stringify(ROSTER.filter(function(r){return r.play && r.kit && RANGE_PROFILE[r.kit.special];}).map(function(r){
        return { rating:fighterRating(r), dmg:RANGE_PROFILE[r.kit.special].dmg };
      }))`));
    const r = correlate(rows.map(x => x.dmg), rows.map(x => x.rating));
    expect(r, 'rating tracks RANGE_PROFILE damage upward — it is reading the compensation table').toBeLessThan(0.5);
  });

  it('ranks the measured best above the measured worst', () => {
    const { window: w } = loadMonolith();
    const rows = ratedRoster(w).sort((a, b) => b.winRate - a.winRate);
    expect(rows[0].rating).toBeGreaterThan(rows[rows.length - 1].rating);
  });
});

describe('teamStrength — deterministic, positive, size-aware', () => {
  it('contains no randomness at all', () => {
    const { window: w } = loadMonolith();
    const a = w.eval(`teamStrength({members:[ROSTER[0], ROSTER[1]]})`);
    for (let i = 0; i < 50; i++) {
      expect(w.eval(`teamStrength({members:[ROSTER[0], ROSTER[1]]})`)).toBe(a);
    }
    // …and the source says so, so a re-introduced Math.random() fails here rather than showing up
    // as mysteriously noisy standings. Comments are stripped first: the function's own commentary
    // explains at length why Math.random() must stay OUT, and matching that would be absurd.
    const src = readFileSync('artifacts/V1/index.html', 'utf8');
    const fn = src.slice(src.indexOf('function teamStrength('));
    const body = fn.slice(0, fn.indexOf('\n}')).replace(/\/\/[^\n]*/g, '');
    expect(body, 'Math.random() is back in teamStrength').not.toMatch(/Math\.random/);
  });

  it('is strictly positive for every constructible team, including the worst possible one', () => {
    const { window: w } = loadMonolith();
    const worst = w.eval(`
      (function(){
        var byRate = ROSTER.filter(function(r){return r.play;}).sort(function(a,b){
          return fighterWinRate(a.name)-fighterWinRate(b.name); });
        return teamStrength({ members: byRate.slice(0,8) });
      })()`);
    expect(worst, 'an all-weakest team must still have positive strength').toBeGreaterThan(0);
  });

  it('keeps the s=1 baseline, so team size still dominates and upsets stay routine', () => {
    const { window: w } = loadMonolith();
    const solo = w.eval(`teamStrength({members:[ROSTER[0]]})`);
    expect(solo, 'baseline plus one member').toBeGreaterThan(1);
    const empty = w.eval(`teamStrength({members:[]})`);
    expect(empty, 'the s=1 baseline was dropped — spread would silently double').toBe(1);
  });
});

describe('fighter ratings — local play refines, but cannot hijack', () => {
  it('uses the baked table when this install has never played', () => {
    const { window: w } = loadMonolith();
    const baked = w.eval(`FIGHTER_WINRATE['Puffball']`);
    expect(w.eval(`fighterWinRate('Puffball')`)).toBe(baked);
  });

  it('barely moves on a handful of lucky local matches', () => {
    const { window: w } = loadMonolith();
    const baked = w.eval(`FIGHTER_WINRATE['Firey Jr.']`);
    // 3 games, all won — the classic "three lucky matches reshape the bracket" hazard.
    const blended = w.eval(`
      (function(){ RATING_TALLIES = { 'Firey Jr.': { games:3, wins:3 } };
        return fighterWinRate('Firey Jr.'); })()`);
    expect(blended, 'a 3-game sample moved the rating more than a quarter of the way to 100%')
      .toBeLessThan(baked + 0.30);
  });

  it('does trust a large local sample', () => {
    const { window: w } = loadMonolith();
    const blended = w.eval(`
      (function(){ RATING_TALLIES = { 'Firey Jr.': { games:200, wins:180 } };
        return fighterWinRate('Firey Jr.'); })()`);
    expect(blended, 'a 200-game local sample should dominate the baked default').toBeGreaterThan(0.8);
  });

  it('survives absent, empty or corrupt storage', () => {
    const { window: w } = loadMonolith();
    for (const t of ['null', '{}', `{'Nobody':{games:0,wins:0}}`, `{'Puffball':{}}`]) {
      const v = w.eval(`(function(){ RATING_TALLIES = ${t}; return fighterRating(ROSTER.find(function(r){return r.name==='Puffball';})); })()`);
      expect(Number.isFinite(v), `rating went non-finite with tallies ${t}`).toBe(true);
      expect(v).toBeGreaterThan(0);
    }
  });
});

describe('tournament feel — a better fighter wins more, and upsets stay routine', () => {
  // The spread is what decides whether the World Cup feels earned or predetermined, so it is
  // validated statistically over the REAL roll, not by eyeballing one bracket.
  function upsetRate(w, loFrac, hiFrac, loFrac2, hiFrac2, n) {
    return w.eval(`
      (function(){
        var R = ROSTER.filter(function(r){return r.play;})
                      .sort(function(a,b){ return fighterWinRate(b.name)-fighterWinRate(a.name); });
        function band(lo,hi){ return R.slice(Math.floor(R.length*lo), Math.floor(R.length*hi)); }
        var A = band(${loFrac},${hiFrac}), B = band(${loFrac2},${hiFrac2});
        var ups=0, decided=0;
        for(var i=0;i<${n};i++){
          var a=A[i%A.length], b=B[(i*7+3)%B.length];
          if(a===b) continue;
          var ra=fighterWinRate(a.name), rb=fighterWinRate(b.name);
          if(ra===rb) continue;
          var sa=teamStrength({members:[a]}), sb=teamStrength({members:[b]});
          var x=0,y=0;
          for(var k=0;k<5;k++){ if(Math.random()*(sa+sb) < sa) x++; else y++; }
          if(x===y) continue;
          decided++;
          if((ra>rb) !== (x>y)) ups++;
        }
        return ups/decided;
      })()`);
  }

  it('upsets a mid-range pairing 30-45% of the time, over 12,000 fixtures', () => {
    const { window: w } = loadMonolith();
    const rate = upsetRate(w, 0.15, 0.40, 0.60, 0.85, 12000);
    expect(rate, `mid-range upset rate ${(rate * 100).toFixed(1)}%`).toBeGreaterThan(0.30);
    expect(rate, `mid-range upset rate ${(rate * 100).toFixed(1)}%`).toBeLessThan(0.45);
  });

  it('lets the roster best beat the roster worst clearly — but never near-always', () => {
    const { window: w } = loadMonolith();
    const rate = upsetRate(w, 0, 0.15, 0.85, 1, 12000);
    expect(rate, `strong-vs-weak upset ${(rate * 100).toFixed(1)}% — the favourite barely wins more`).toBeLessThan(0.36);
    expect(rate, `strong-vs-weak upset ${(rate * 100).toFixed(1)}% — the tournament is predetermined`).toBeGreaterThan(0.10);
  });

  it('runs a full 48-team World Cup to a champion without error', () => {
    const { window: w } = loadMonolith();
    w.eval(`startTournament(1, 'spectate')`);
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

  it('produces champions that favour strong fighters without being the same one every time', () => {
    // Both halves matter. A uniform champion distribution means the rating did nothing; a single
    // repeated champion means it did too much.
    const { window: w } = loadMonolith();
    const champs = JSON.parse(w.eval(`
      (function(){
        var out=[];
        for(var t=0;t<40;t++){
          startTournament(1, 'spectate');
          var guard=0;
          while (TOURNEY.stage !== 'done' && guard++ < 50) {
            for (var i=0;i<TOURNEY.fixtures.length;i++) {
              var fx = TOURNEY.fixtures[i];
              if(!fx.played){ fx.kind==='group' ? simGroupMatch(fx) : simKnockoutMatch(fx); }
            }
            proceedAfterRound();
          }
          out.push(TOURNEY.champion.members[0].name);
        }
        return JSON.stringify(out);
      })()`));
    expect(champs.length).toBe(40);
    const distinct = new Set(champs).size;
    expect(distinct, 'the same fighter won every time — the sim is predetermined').toBeGreaterThan(4);

    // …and the winners skew toward the better-rated half of the roster.
    const order = JSON.parse(w.eval(`
      JSON.stringify(ROSTER.filter(function(r){return r.play;})
        .sort(function(a,b){ return fighterWinRate(b.name)-fighterWinRate(a.name); })
        .map(function(r){ return r.name; }))`));
    const topHalf = new Set(order.slice(0, Math.floor(order.length / 2)));
    const fromTop = champs.filter(c => topHalf.has(c)).length;
    expect(fromTop, `only ${fromTop}/40 champions came from the stronger half`).toBeGreaterThan(24);
  });
});
