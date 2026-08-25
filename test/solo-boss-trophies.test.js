import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from './helpers/prng.js';

// Naily and Book are earned by clearing bosses SOLO.
//
// They were previously keyed to 'boss:Bomby' and 'boss:Golf Ball'. awardBossCleared only ever fires
// with a name out of BOSS_ROSTER, and neither of those is in it — Bomby is a playable fighter and
// Golf Ball is not a boss at all. So the deed could not be performed; and because TROPHY_FIGHTERS
// is subtracted from DRIP_ORDER, playing could not produce them either. Both fighters were
// unreachable, while their locked cells instructed the player to beat a boss that does not exist.

function boot() {
  const html = readFileSync('artifacts/V1/index.html', 'utf8');
  const dom = new JSDOM(html, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
        get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 })
          : p === 'canvas' ? { width: 1100, height: 720 }
          : p === 'getImageData' ? () => ({ data: [] }) : () => {}),
        set: () => true,
      });
      window.Math.random = mulberry32(3);
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
    },
  });
  return dom.window;
}
const settle = (w) => w.eval('profileReady');
const clearSolo = (w, n) => w.eval(`
  (function(){
    PROFILE.unlocked = STARTERS.slice(); PROFILE.soloBosses = {};
    var out = [];
    for (var i=0; i<${n}; i++) out = out.concat(awardBossCleared(BOSS_ROSTER[i].name, true));
    return out;
  })()`);

// THE GUARD THAT WAS MISSING. Every trophy names a deed; this checks each deed can be performed.
describe('every trophy is actually earnable', () => {
  it('no trophy is keyed to a boss that does not exist', async () => {
    const w = boot(); await settle(w);
    const orphans = w.eval(`
      (function(){
        var names = BOSS_ROSTER.map(function(b){ return b.name; });
        return Object.keys(TROPHIES)
          .filter(function(k){ return k.indexOf('boss:') === 0; })
          .filter(function(k){ return names.indexOf(k.slice(5)) < 0; });
      })()`);
    expect(orphans, 'these trophies can never be awarded').toEqual([]);
  });

  it('no trophy fighter is left with no route to it', async () => {
    const w = boot(); await settle(w);
    // A trophy fighter is pulled OUT of the drip, so if its deed is unperformable it is gone for
    // good. Every trophy key must be one the code can actually reach.
    const known = w.eval(`
      (function(){
        var ok = { wc:1, rush2:1, tutorial:1 };
        return Object.keys(TROPHIES).filter(function(k){
          return !ok[k] && k.indexOf('boss:') !== 0 && k.indexOf('solo:') !== 0;
        });
      })()`);
    expect(known, 'trophy keys nothing awards').toEqual([]);
  });
});

describe('beating bosses solo', () => {
  it('two distinct bosses earns Naily', async () => {
    const w = boot(); await settle(w);
    expect(clearSolo(w, 1)).not.toContain('Naily');
    const got = clearSolo(w, 2);
    expect(got).toContain('Naily');
    expect(w.eval(`PROFILE.unlocked.indexOf('Naily') >= 0`)).toBe(true);
  });

  it('four distinct bosses earns Book as well', async () => {
    const w = boot(); await settle(w);
    const got = clearSolo(w, 4);
    expect(got).toContain('Naily');
    expect(got).toContain('Book');
  });

  it('counts distinct bosses, not repeat kills of the easiest one', async () => {
    // The gauntlet loops back to boss 1 forever. A milestone farmable from the first fight in the
    // game is not a milestone.
    const w = boot(); await settle(w);
    const got = w.eval(`
      (function(){
        PROFILE.unlocked = STARTERS.slice(); PROFILE.soloBosses = {};
        var out = [];
        for (var i=0;i<6;i++) out = out.concat(awardBossCleared(BOSS_ROSTER[0].name, true));
        return { unlocked: out, distinct: Object.keys(PROFILE.soloBosses).length };
      })()`);
    expect(got.distinct).toBe(1);
    expect(got.unlocked).not.toContain('Naily');
  });

  it('does not count a boss cleared with a teammate on the stage', async () => {
    const w = boot(); await settle(w);
    const got = w.eval(`
      (function(){
        PROFILE.unlocked = STARTERS.slice(); PROFILE.soloBosses = {};
        var out = [];
        for (var i=0;i<4;i++) out = out.concat(awardBossCleared(BOSS_ROSTER[i].name, false));
        return { unlocked: out, distinct: Object.keys(PROFILE.soloBosses||{}).length };
      })()`);
    expect(got.distinct).toBe(0);
    expect(got.unlocked).not.toContain('Naily');
  });

  it('still records the co-op clear in bossesCleared', async () => {
    // Solo is a stricter tally kept ALONGSIDE the existing one, not a replacement for it.
    const w = boot(); await settle(w);
    w.eval(`awardBossCleared(BOSS_ROSTER[0].name, false)`);
    expect(w.eval(`!!PROFILE.bossesCleared[BOSS_ROSTER[0].name]`)).toBe(true);
  });

  it('the locked cell counts down instead of repeating itself', async () => {
    const w = boot(); await settle(w);
    expect(w.eval(`unlockHint('Naily')`)).toMatch(/0\/2/);
    clearSolo(w, 1);
    expect(w.eval(`unlockHint('Naily')`)).toMatch(/1\/2/);
  });
});

describe('a solo Boss Rush is a legal match', () => {
  it('Boss Rush offers a count of one, and no other mode does', async () => {
    const w = boot(); await settle(w);
    expect(w.eval(`SETTINGS.mode='boss'; countOptions()`)).toContain(1);
    expect(w.eval(`SETTINGS.mode='ffa';  countOptions()`)).not.toContain(1);
    expect(w.eval(`SETTINGS.mode='teams';countOptions()`)).not.toContain(1);
  });

  it('builds exactly one fighter for a solo run', async () => {
    // buildFighters used to floor N at 2 for every mode, so "alone" was unreachable even with the
    // option offered.
    const w = boot(); await settle(w);
    const n = w.eval(`
      (function(){
        SETTINGS.mode='boss'; SETTINGS.count=1; SETTINGS.stocks=3;
        beginMatchNow();
        var n = fighters.length;
        running = false;              // stop the loop; Boss Rush also arms respawn timers
        return n;
      })()`);
    expect(n).toBe(1);
  });

  it('the solo run is what soloRun() recognises', async () => {
    const w = boot(); await settle(w);
    // Poked directly rather than through more beginMatchNow calls: each one leaves a live loop and
    // Boss Rush's respawn timers behind, and standing several up in one document cost ~90s of wall
    // clock to check a two-line rule.
    expect(w.eval(`SETTINGS.mode='boss'; fighters=[{}];       soloRun()`)).toBe(true);
    expect(w.eval(`SETTINGS.mode='boss'; fighters=[{},{},{}]; soloRun()`)).toBe(false);
    expect(w.eval(`SETTINGS.mode='ffa';  fighters=[{}];       soloRun()`)).toBe(false);
  });

  it('leaving Boss Rush cannot strand another mode on one fighter', async () => {
    const w = boot(); await settle(w);
    const after = w.eval(`
      (function(){
        SETTINGS.mode='boss'; SETTINGS.count=1;
        var seg = document.getElementById('segMode');
        var btn = seg && seg.querySelector('button[data-v="ffa"]');
        if (btn) btn.onclick();
        return { mode: SETTINGS.mode, count: SETTINGS.count };
      })()`);
    expect(after.mode).toBe('ffa');
    expect(after.count, 'an FFA of one has nobody to fight').toBeGreaterThanOrEqual(2);
  });
});
