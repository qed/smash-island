import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { bootMonolith } from './helpers/smash-golden.js';
import { BOSS_TUNING_EXPR, harnessCode } from '../scripts/boss-tuning.mjs';

// "Boss Rush order is intended difficulty order" (the roster's own comment, from the design doc). The review of the II
// bosses found the curve going up and down around them, and every balance number on the branch coming from a scratch
// script nobody could run again ("The agents' balance numbers disagree and can't be reproduced"). scripts/boss-solo.mjs
// is the harness now, committed, and scripts/boss-rush-balance.json is what it printed. This checks three things:
//   1. the stored numbers still describe this build: every tuning number they depend on is read out of the running game
//      and compared, so a retune fails here until the harness is run again (WRITE=1 node scripts/boss-solo.mjs);
//   2. they were printed by this harness: its measured code is fingerprinted (harnessCode). The first stored numbers came
//      from an older copy that paid a solo fight the stock every third boss pays, so the Dragon, MePhone4S and Four each
//      read about 0.8 of a life easier than they were, and (1) could not see it -- no tuning number had changed;
//   3. the ordering claims index.html makes about the II bosses, on those stored numbers.
// A change elsewhere (a fighter's kit, the AI) is not caught by (1) or (2): they read the bosses' numbers and the harness.

const B = JSON.parse(readFileSync('scripts/boss-rush-balance.json', 'utf8'));
const at = (name) => B.bosses.find((b) => b.boss === name);
// Harder: more lives lost a run (what the gauntlet charges you); between two that cost the same, beaten less often.
const harder = (a, b) => a.livesLost > b.livesLost || (a.livesLost === b.livesLost && a.beaten < b.beaten);
const RUNS = 240;
const tell = (b) => `${b.boss} (${b.livesLost} lives, +/-${b.livesLostSE}, beaten ${b.beaten}/${b.of})`;

let W;
beforeAll(async () => { W = bootMonolith(7); await W.eval('profileReady'); });

describe('Boss Rush difficulty, as measured', () => {
  it('the stored measurement was taken on this build: the same roster, boss hits, stock rate and II boss tuning', () => {
    const live = JSON.parse(W.eval(BOSS_TUNING_EXPR));
    expect(B.harness).toBe('scripts/boss-solo.mjs');
    expect(B.tuning, 'retuned since the harness last ran: run WRITE=1 node scripts/boss-solo.mjs').toEqual(live);
  });

  it('...by the harness as it is now', () => {
    expect(B.harnessCode, 'the harness changed since it last wrote: run WRITE=1 node scripts/boss-solo.mjs')
      .toBe(harnessCode(readFileSync('scripts/boss-solo.mjs', 'utf8')));
  });

  it(`every boss from the Dragon to Four was measured, ${RUNS} solo runs each, and a run from MePhone4S to the end, 30`, () => {
    const names = JSON.parse(W.eval('JSON.stringify(BOSS_ROSTER.map(function(b){ return b.name; }))'));
    expect(B.bosses.map((b) => b.boss)).toEqual(names.slice(names.indexOf('Purple Dragon')));
    expect(B.seeds * B.fighters.length).toBe(RUNS);
    for (const b of B.bosses) {
      expect(b.of, b.boss).toBe(RUNS);
      expect(b.livesLostSE, `${b.boss}: its standard error is stored beside it`).toBeGreaterThan(0);
    }
    expect(B.run).toMatchObject({ from: 'MePhone4S', of: 30 });
  });

  // The review: "MePhone4 (Boss 7) has 240 HP, below the Dragon's 250 before him, and the agents measured him at 0.40
  // lives lost against the Dragon's 0.87 ... MePhone4S (Boss 9) 15/15 ... Steve Cobs presses harder than the final boss."
  it('the II bosses climb with the gauntlet: the Dragon, then MePhone4, MePhone4S, Steve Cobs, and Four hardest of them', () => {
    const line = ['Purple Dragon', 'MePhone4', 'MePhone4S', 'Steve Cobs', 'Four'].map(at);
    for (let i = 1; i < line.length; i++) {
      expect(harder(line[i], line[i - 1]), `${tell(line[i])} is harder than ${tell(line[i - 1])}`).toBe(true);
    }
    const hp = JSON.parse(W.eval('JSON.stringify(BOSS_ROSTER.map(function(b){ return [b.name, b.hp]; }))'));
    const H = Object.fromEntries(hp);
    expect(H['MePhone4'], 'more HP than the Dragon before him').toBeGreaterThan(H['Purple Dragon']);
    expect(H['MePhone4S']).toBeGreaterThan(H['MePhone4']);
    expect(H['Steve Cobs']).toBeGreaterThan(H['MePhone4S']);
    expect(H['Four'], 'and the final boss has the most').toBeGreaterThan(H['Steve Cobs']);
  });

  // Evil Leafy (Boss 8) and Two (Boss 10) are not this branch's, and the solo AI does far worse against them than against
  // Four: it cannot read Evil Leafy's teleports or ground Two's power. That is the roster's shape from before the II
  // bosses, left for the owner; this only pins that they were measured, so the numbers are there to look at.
  it('Evil Leafy and Two are measured too, and are left as they were', () => {
    for (const n of ['Evil Leafy', 'Two']) expect(at(n).of).toBe(RUNS);
    const rows = JSON.parse(W.eval(`JSON.stringify(BOSS_ROSTER.filter(function(b){ return b.name==='Evil Leafy' || b.name==='Two'; })
      .map(function(b){ return [b.name, b.hp, b.big, b.attack]; }))`));
    expect(rows).toEqual([['Evil Leafy', 185, 2.4, 'evilleafy'], ['Two', 285, 2.6, 'two']]);
  });

  // The review: "MePhone4S deals 32% of his damage over time (poison plus bleed), outside the 22 per-hit cap. That is his
  // largest single source, bigger than the gun (23%) or the car (21%)."
  it("MePhone4S's damage over time is a small share of what he deals, well under his gun's", () => {
    const s = at('MePhone4S').share;
    expect(s.dot || 0, 'poison and bleed').toBeLessThan(15);
    expect(s.dot || 0).toBeLessThan(s.gun);
  });

  // The review: "TICK TOCK carries about 70-72% of his damage" at knockback 14, with gaps faster than Four's. The move is
  // the Contraption now (the chant it was named for is out: see test/boss-steve-cobs.test.js), his gaps 90/66/48, and in
  // phase 3 he keeps a boxer's range (COBS.approach): walking onto you, he measured level with MePhone4S.
  it('Steve Cobs is short of Four, and the rest of his kit still lands', () => {
    const c = at('Steve Cobs'), f = at('Four');
    expect(harder(f, c), `${tell(f)} is harder than ${tell(c)}`).toBe(true);
    expect((c.share.meepleknife || 0) + (c.share.kernel || 0) + (c.share.cobsfist || 0), 'the knife, kernels and punches').toBeGreaterThan(20);
  });

  // "4S 260 HP, Two 285, Cobs 330, Four 340, with no extra life between Boss 9 and Boss 12 ... nothing measures a run
  // through that stretch" (the review). It is measured: the stored run starts at MePhone4S with 3 stocks and plays on
  // through the gauntlet's own heal and stock rules. This pins that the numbers are there and whole, not what they are.
  it('a run through the last four bosses is measured, and every run is accounted for', () => {
    const r = B.run, ended = Object.values(r.endedAt).reduce((a, n) => a + n, 0);
    expect(r.won + ended).toBe(r.of);
    for (const k of Object.keys(r.endedAt)) expect(['MePhone4S', 'Two', 'Steve Cobs', 'Four']).toContain(k);
  });
});
