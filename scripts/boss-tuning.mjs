import { createHash } from 'node:crypto';
// The Boss Rush numbers a balance measurement depends on, read out of the running game the same way by the harness that
// measures (scripts/boss-solo.mjs, which stores them beside its results in scripts/boss-rush-balance.json) and by the test
// that checks the stored results still describe this build (test/boss-rush-order.test.js). Retune any of these and that
// test fails until the harness is run again with WRITE=1 -- so an ordering claim is never left standing on old numbers.
export const BOSS_TUNING_EXPR = `JSON.stringify({
  roster: BOSS_ROSTER.map(function(b){ return [b.name, b.hp, b.big, !!b.stationary]; }),
  dmgBase: BOSS_DMG_BASE, stockEvery: BOSS_STOCK_EVERY,
  // Round 17's "+50%" is applied at spawn (the rows keep their own hp) and the paced gap in bossAtkGap, so neither shows in the
  // roster above: the numbers stored before them read as current until these two were read here too.
  hpMult: BOSS_HP_MULT, pace: BOSS_PACE,
  mephone: { cap: MELIFE_CAP, hp: MELIFE_HP, life: MELIFE_LIFE, addDmg: HOSTILE_ADD_DMG, glove: MEPHONE_GLOVE, gaps: MEPHONE_GAPS },
  s4: S4, springy: SPRINGY   // Springy took Boss 11 ("replace him with springy"); Steve Cobs is the secret boss now and his numbers no longer bear on the gauntlet
})`;
// ...and the harness's own code, the same way: the part of scripts/boss-solo.mjs that sets a fight up, plays it and scores
// it (from FIGHTERS to the worker's entry point), comment lines and blank lines left out. The first stored numbers were
// written by an older copy of the harness -- one that paid a solo fight the stock every third boss pays -- and nothing
// noticed, because the tuning above had not changed. Stored beside the results as harnessCode.
export function harnessCode(text){
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const from = lines.findIndex((l) => l.startsWith('const FIGHTERS')), to = lines.findIndex((l) => l.startsWith('if (process.env.BOSS_SOLO_WORKER)'));
  if (from < 0 || to < from) throw new Error('boss-solo.mjs: cannot find the measured code');
  const code = lines.slice(from, to).map((l) => l.trimEnd()).filter((l) => l.trim() && !l.trim().startsWith('//'));
  return createHash('sha1').update(code.join('\n')).digest('hex').slice(0, 16);
}
