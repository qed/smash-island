import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { bootMonolith } from './helpers/smash-golden.js';
import { mulberry32 } from './helpers/prng.js';

// ONE CAN BE BEATEN. The owner's rules make that the one thing her fight must never get wrong: the bans lift and One unlocks
// "ONLY AFTER YOU BEAT HER", a loss is retried directly, and there is "No way out". So a fight nobody can win would leave a
// player who spent ~38 wins erasing their roster and then won the World Cup locked to Lightning for good. The adversarial
// review ran it and never saw a win (Lightning did 161 damage in 72 s; two fighters 500 in 97 s), and nothing in the suite
// said she could be beaten at all.
//
// So a scripted Lightning (test/helpers/one-bot.page.js) -- one that reads her wind-ups late, the way a person reacts to a
// tell, and is weaker than the player she is for: it falls to the Boss Rush gauntlet by its fourth boss -- fights the story
// fight on fixed dice. It has to win some of them, and lose some: she is the secret boss, not a formality. And the two
// numbers the review asked to be tracked: how much of the fight she cannot be hurt (her ghost, Power Ungrounded), and the
// damage a minute a player gets through.

const BOT = readFileSync('test/helpers/one-bot.page.js', 'utf8');
const SEEDS = [3, 5, 7, 9, 11, 13, 15, 17];
const MAX_SECS = 420;

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); W.eval(BOT); });

function fightOne(seed) {
  W.Math.random = mulberry32(seed);
  return W.eval(`(function(){
    SETTINGS.itemRate = 0; LOCAL_PLAYERS = 1;
    startOneFight(['Lightning'], { story:true, onEnd:function(){ return true; } });
    var one = summons.find(function(s){ return s._oneFight; }), L = fighters[0];
    L.controller = 'remote'; NET.inputs = NET.inputs || {};
    var ghostT = 0, ungT = 0, lost = 0, st = L.stocks;
    for (var i = 0; i < 60*${MAX_SECS} && running; i++){
      NET.inputs[0] = window.__oneBot(L, one);
      step();
      if (L.stocks < st) lost += st - L.stocks;
      st = L.stocks;
      if (one._ghost && !one._ghost.dead) ghostT++;
      else if (one._ungrounded && !one._grounded) ungT++;
    }
    var dealt = one.maxHp - Math.max(0, one.hp);
    return { won: ONEFIGHT.won, secs: i/60, dealt: dealt, lost: lost, ghost: ghostT/i, ung: ungT/i, perMin: dealt/(i/3600) };
  })()`);
}

describe('One can be beaten', () => {
  it('a scripted Lightning beats her in some story fights and loses others, and she is hurtable most of the time', () => {
    const runs = SEEDS.map(fightOne);
    const wins = runs.filter(r => r.won);
    const mean = k => runs.reduce((a, r) => a + r[k], 0) / runs.length;
    console.log('One story fight, scripted Lightning:', JSON.stringify(runs.map(r => ({
      won: r.won, secs: Math.round(r.secs), dealt: Math.round(r.dealt), lost: r.lost,
      ghost: +r.ghost.toFixed(2), ung: +r.ung.toFixed(2), perMin: Math.round(r.perMin) }))));
    expect(wins.length, 'she can be beaten').toBeGreaterThanOrEqual(1);
    expect(wins.length, 'and she is not a formality').toBeLessThan(runs.length);
    expect(mean('dealt'), 'the runs she wins still get most of the way').toBeGreaterThanOrEqual(1400);
    wins.forEach(r => expect(r.secs, 'a win takes minutes: 2000 HP is the whole gauntlet\'s worth').toBeGreaterThanOrEqual(120));
    expect(mean('ghost'), 'her ghost shields her for well under half the fight').toBeLessThanOrEqual(0.45);
    expect(mean('ung'), 'Power Ungrounded for a small part of it').toBeLessThanOrEqual(0.15);
    expect(mean('perMin'), 'damage a minute').toBeGreaterThanOrEqual(400);
  }, 900000);   // about 75 s alone; under a loaded full-suite run it has taken nearly 10 minutes
});
