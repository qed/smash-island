import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// Wave 3.5 — the remaining four presentation features.

describe('Cake at Stake', () => {
  it('fires only on the LAST stock, not on every KO', () => {
    const { window: w } = loadMonolith();
    const out = w.eval(`
      (function(){
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.stocks=3; beginMatchNow();
        var f = fighters[0];
        CAKE_FX = null;
        f.stocks = 3; eliminate(f);
        var afterFirst = CAKE_FX;
        f.stocks = 1; f.dead = false; f.alive = true; eliminate(f);
        return [!!afterFirst, !!CAKE_FX, CAKE_FX && CAKE_FX.name];
      })()`);
    expect(out[0], 'a mid-match KO is not a ceremony').toBe(false);
    expect(out[1], 'losing the last stock is').toBe(true);
    expect(out[2]).toBeTruthy();
  });

  it('decays on its own and never draws forever', () => {
    const { window: w } = loadMonolith();
    const gone = w.eval(`
      (function(){
        CAKE_FX = { name:'X', color:'#fff', t:78 };
        for (var i=0;i<200;i++) drawCakeAtStake();
        return CAKE_FX;
      })()`);
    expect(gone, 'the stinger cleans itself up').toBe(null);
  });

  it('is safe to draw when nothing is happening', () => {
    const { window: w } = loadMonolith();
    expect(() => w.eval(`CAKE_FX = null; for (var i=0;i<10;i++) drawCakeAtStake();`)).not.toThrow();
  });
});

describe('KO instant replay', () => {
  it('declines to play when there is no footage', () => {
    const { window: w } = loadMonolith();
    const ok = w.eval(`
      (function(){
        clipReset();
        var host = document.createElement('div');
        return startReplay(host);
      })()`);
    expect(ok, 'no frames means no replay, not a broken canvas').toBe(false);
  });

  it('stops cleanly, and leaving the result screen stops it', () => {
    const { window: w } = loadMonolith();
    expect(() => w.eval(`stopReplay(); stopReplay();`)).not.toThrow();
    const src = w.eval(`String(go)`);
    expect(src, 'a looping replay must not survive a screen change').toContain('stopReplay');
  });
});

describe('Daily Match', () => {
  it('gives everyone the same pairing on the same day', () => {
    const { window: w } = loadMonolith();
    const a = w.eval(`JSON.stringify(dailyMatchup(dailySeed(new Date(Date.UTC(2026,7,11)))))`);
    const b = w.eval(`JSON.stringify(dailyMatchup(dailySeed(new Date(Date.UTC(2026,7,11)))))`);
    expect(a).toBe(b);
  });

  it('changes from day to day', () => {
    const { window: w } = loadMonolith();
    const pairs = new Set();
    for (const d of [11, 12, 13, 14, 15]) {
      pairs.add(w.eval(`
        (function(){
          var m = dailyMatchup(dailySeed(new Date(Date.UTC(2026,7,${d}))));
          return m.you.name + '|' + m.foe.name;
        })()`));
    }
    expect(pairs.size, 'five days should not all be the same matchup').toBeGreaterThan(2);
  });

  it('never pits a fighter against themselves', () => {
    const { window: w } = loadMonolith();
    const same = w.eval(`
      (function(){
        var bad = 0;
        for (var i=0;i<400;i++){
          var m = dailyMatchup(i*7919);
          if (m.you === m.foe) bad++;
        }
        return bad;
      })()`);
    expect(same).toBe(0);
  });

  it('only counts an attempt from the same day', () => {
    // Yesterday's attempt must not lock today out.
    const { window: w } = loadMonolith();
    const stale = w.eval(`
      (function(){
        return dailySeed(new Date(Date.UTC(2026,7,11))) !== dailySeed(new Date(Date.UTC(2026,7,12)));
      })()`);
    expect(stale, 'the seed rolls over daily').toBe(true);
  });

  it('renders the card as text, never as markup', () => {
    const { window: w } = loadMonolith();
    const src = w.eval(`String(refreshDailyCard)`);
    expect(src, 'roster names go in via textContent').toContain('textContent');
    expect(src, 'and never via innerHTML assignment of names').not.toMatch(/innerHTML\s*=\s*[^'"]*\+/);
  });
});

describe('crowd cameos', () => {
  it('draws without touching the simulation', () => {
    const { window: w } = loadMonolith();
    const out = w.eval(`
      (function(){
        SETTINGS.mode='ffa'; SETTINGS.count=3; beginMatchNow();
        var before = [fighters.length, particles.length, projectiles.length];
        for (var i=0;i<30;i++) drawCrowd();
        return [before, [fighters.length, particles.length, projectiles.length]];
      })()`);
    expect(out[1], 'the crowd is decoration and must not spawn anything').toEqual(out[0]);
  });

  it('is safe before a match has ever started', () => {
    const { window: w } = loadMonolith();
    expect(() => w.eval(`drawCrowd()`)).not.toThrow();
  });

  it('reacts to a KO rather than idling identically forever', () => {
    // The crowd hops for a moment after any elimination; that reaction is keyed off lastKoFrame.
    const { window: w } = loadMonolith();
    const src = w.eval(`String(drawCrowd)`);
    expect(src, 'the reaction is driven by the last KO').toContain('lastKoFrame');
  });
});
