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
// Level: the two measure the same within the harness's noise (two standard errors of the difference).
const level = (a, b) => Math.abs(a.livesLost - b.livesLost) <= 2 * Math.hypot(a.livesLostSE, b.livesLostSE);

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

  it(`every boss from MePhone4 to Four was measured, ${RUNS} solo runs each, and a run from MePhone4S to the end, 30`, () => {
    // From MePhone4: the same seven as before the Purple Dragon moved from Boss 6 to Boss 9 ("just move purple dragon!!!", 2026-09-30).
    const names = JSON.parse(W.eval('JSON.stringify(BOSS_ROSTER.map(function(b){ return b.name; }))'));
    expect(B.bosses.map((b) => b.boss)).toEqual(names.slice(names.indexOf('MePhone4')));
    expect(B.seeds * B.fighters.length).toBe(RUNS);
    for (const b of B.bosses) {
      expect(b.of, b.boss).toBe(RUNS);
      expect(b.livesLostSE, `${b.boss}: its standard error is stored beside it`).toBeGreaterThan(0);
    }
    expect(B.run).toMatchObject({ from: 'MePhone4S', of: 30 });
  });

  // The review: "MePhone4 (Boss 7) has 240 HP, below the Dragon's 250 before him, and the agents measured him at 0.40
  // lives lost against the Dragon's 0.87 ... MePhone4S (Boss 9) 15/15 ... Steve Cobs presses harder than the final boss."
  // Boss 11 is Springy now ("replace him with springy", 2026-09-28; Cobs is the second secret boss), in the same slot and HP
  // class. The climb through the MePhones to Four is as it was, and Springy is measured harder than MePhone4S before him.
  // Whether he sits UNDER Four is left to the owner, the way Evil Leafy and Two are (below): the solo bot falls into his
  // holes and stands against the ELECTRIC FENCE (a quarter of his damage, 'boss-other'), and measured 1.69 lives to Four's
  // 1.37, and "dont tune, cuz thats an agent, not a player" -- nothing of his was tuned to that number. (Was: Steve Cobs
  // between MePhone4S and Four, the claim the review made of HIS kit.)
  it('the gauntlet climbs through MePhone4, MePhone4S (level with him since the 2x glove), the Purple Dragon (moved after them) and Four, hardest of them; Springy level with or over MePhone4S', () => {
    // "just move purple dragon!!!" (the owner, 2026-09-30): rebuilt in the boss overhaul, the Dragon measured harder than
    // MePhone4 and MePhone4S, so it moved from Boss 6 to Boss 9 -- after them, before Two -- instead of being eased for the bot.
    const line = ['MePhone4', 'MePhone4S', 'Purple Dragon', 'Four'].map(at);
    for (let i = 1; i < line.length; i++) {
      // MePhone4 -> MePhone4S: the owner doubled the Fist Thingy ("buff fist thingy's size" -> "2x", 2026-09-29), which left the
      // two level for the solo bot; asked, the owner chose "Accept level" over shrinking the glove for the bot ("dont tune, cuz
      // thats an agent, not a player"), until the boss overhaul re-measures every boss. Level or harder passes; easier beyond the
      // noise still fails.
      const ok = harder(line[i], line[i - 1]) || (line[i].boss === 'MePhone4S' && level(line[i], line[i - 1]));
      expect(ok, `${tell(line[i])} is harder than ${tell(line[i - 1])}`).toBe(true);
    }
    // Springy over MePhone4S -- or level within the noise, the same "Accept level" ruling: since the boss kit's fall drift his
    // payloads land where they drift and MePhone4S's cookies too, and the two measure within two standard errors.
    const sp = at('Springy'), s4 = at('MePhone4S');
    expect(harder(sp, s4) || level(sp, s4), `${tell(sp)} is harder than or level with ${tell(s4)}`).toBe(true);
    const hp = JSON.parse(W.eval('JSON.stringify(BOSS_ROSTER.map(function(b){ return [b.name, b.hp]; }))'));
    const H = Object.fromEntries(hp);
    expect(H['MePhone4S']).toBeGreaterThan(H['MePhone4']);
    expect(H['Springy']).toBeGreaterThan(H['MePhone4S']);
    expect(H['Four'], 'and the final boss has the most').toBeGreaterThan(H['Springy']);
    const names = hp.map((r) => r[0]);
    expect(names.indexOf('Purple Dragon'), 'the Dragon after MePhone4S').toBe(names.indexOf('MePhone4S') + 1);
  });

  // Evil Leafy (Boss 7) is not this branch's, and the solo AI does far worse against her than against Four: it cannot read her
  // teleports. That is the roster's shape from before the II bosses, left for the owner; this only pins that she was measured.
  // Two (Boss 10) was the same until the owner, 2026-10-03: "nerf two", landing "~2.2, between Dragon and Four", by "more delay between
  // when an attack is called and when it happens" (BOSS_TEL_PACE) and "Longer gaps between turns" (TWO.gaps), the Power of Two orbs
  // ("the attack that feels unfair") eased, and the phase-3 mace sinking while you ground him. His row is as it was.
  it('Evil Leafy and Two are measured too, with their rows as they were', () => {
    for (const n of ['Evil Leafy', 'Two']) expect(at(n).of).toBe(RUNS);
    const rows = JSON.parse(W.eval(`JSON.stringify(BOSS_ROSTER.filter(function(b){ return b.name==='Evil Leafy' || b.name==='Two'; })
      .map(function(b){ return [b.name, b.hp, b.big, b.attack]; }))`));
    expect(rows).toEqual([['Evil Leafy', 185, 2.4, 'evilleafy'], ['Two', 285, 2.6, 'two']]);
  });

  it('Two sits between the Purple Dragon and Four: harder than or level with the Dragon, and Four harder than him ("nerf two", 2026-10-03)', () => {
    const two = at('Two'), dr = at('Purple Dragon'), four = at('Four');
    expect(harder(two, dr) || level(two, dr), `${tell(two)} is harder than or level with ${tell(dr)}`).toBe(true);
    expect(harder(four, two), `${tell(four)} is harder than ${tell(two)}`).toBe(true);
  });

  // The review: "MePhone4S deals 32% of his damage over time (poison plus bleed), outside the 22 per-hit cap. That is his
  // largest single source, bigger than the gun (23%) or the car (21%)."
  it("MePhone4S's damage over time is a small share of what he deals, well under his gun's", () => {
    const s = at('MePhone4S').share;
    expect(s.dot || 0, 'poison and bleed').toBeLessThan(15);
    expect(s.dot || 0).toBeLessThan(s.gun);
  });

  // Was 'Steve Cobs is short of Four, and the rest of his kit still lands' (the review: "TICK TOCK carries about 70-72% of
  // his damage"). Boss 11 is Springy ("replace him with springy"): the same question of his kit -- the slam is not the
  // whole fight -- and that the fight is beatable in principle: a majority of the 240 solo bots beat him, with no bot in
  // mind when he was built. His relation to Four is the owner's call (above).
  it("Springy is beaten more often than not, the slam is under half of what he deals, and the rest of his kit lands", () => {
    const s = at('Springy');
    expect(s.beaten/s.of, `${tell(s)}: beatable`).toBeGreaterThan(0.5);
    expect(s.share.slam || 0, 'the slam and its holes').toBeGreaterThan(15);
    expect(s.share.slam || 0).toBeLessThan(50);
    expect((s.share.mitten || 0) + (s.share.springclone || 0) + (s.share.springtoy || 0) + (s.share.cerealbox || 0) + (s.share.springwave || 0),
      'the punch, the drops and the phase-3 waves').toBeGreaterThan(20);
  });

  // "4S 260 HP, Two 285, Cobs 330, Four 340, with no extra life between Boss 9 and Boss 12 ... nothing measures a run
  // through that stretch" (the review). It is measured: the stored run starts at MePhone4S with 3 stocks and plays on
  // through the gauntlet's own heal and stock rules. This pins that the numbers are there and whole, not what they are.
  it('a run through the last five bosses is measured (the Dragon now among them), and every run is accounted for', () => {
    const r = B.run, ended = Object.values(r.endedAt).reduce((a, n) => a + n, 0);
    expect(r.won + ended).toBe(r.of);
    for (const k of Object.keys(r.endedAt)) expect(['MePhone4S', 'Purple Dragon', 'Two', 'Springy', 'Four']).toContain(k);
  });
});
