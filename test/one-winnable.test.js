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
// fight on fixed dice. It had to win some of them, and lose some: she is the secret boss, not a formality. And the two
// numbers the review asked to be tracked: how much of the fight she cannot be hurt (her ghost, Power Ungrounded), and the
// damage a minute a player gets through.
//
// THE BOT IS NOT THE BAR FOR HER DIFFICULTY. The owner then made her harder on purpose -- she circles and swoops, Zap to Dust
// and Out of Orbit come with copies, Eye Lasers fire twice, every attack but the ghost fighter is harder "(not more damage
// tho)" -- and on tuning her to what a bot can beat: "dont tune, cuz thats an agent, not a player." With
// all of that in, the bot still won some. Then, 2026-09-30: "one could be harder... much harder. more bullets! also longer attacks.
// contact damage." -- and the bot stopped winning, so it was the bot's assertion that gave way, as this comment always said it
// would: the first test below pins what the bot's runs still show (the principle: she is hurtable most of the time, and a player's
// hits land and take a real bite), and the second pins that she stays beatable in principle -- never her difficulty.

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
  // THE OWNER MADE HER MUCH HARDER, on purpose, and this test is no longer the proof she can be won (2026-09-30): "one could be harder...
  // much harder. more bullets! also longer attacks. contact damage." -- far more bullets, every attack longer and in waves, touching her
  // hurts as touching Evil Leafy does -- and before that "dont tune, cuz thats an agent, not a player." The scripted Lightning, which reads her
  // wind-ups late, won 2 of its 8 story fights before; it now falls in about a minute and a half, having taken a third of her bar. It is
  // NOT tuned back up for her, and she is NOT eased for it (the owner: never tune difficulty so a bot wins). What the runs still pin is the
  // PRINCIPLE: she is hurtable most of the time (the ghost and Power Ungrounded are small parts of the fight), the hits a player makes land
  // and take a real bite out of her, and she is the secret boss, not a formality. That she can be WON is the next test's: every hit
  // reaches her, the ghost dies, her phases run to 0 and she shatters.
  it("a scripted Lightning's hits land on her and she is hurtable most of the time -- however hard she is made", () => {
    const runs = SEEDS.map(fightOne);
    const wins = runs.filter(r => r.won);
    const mean = k => runs.reduce((a, r) => a + r[k], 0) / runs.length;
    console.log('One story fight, scripted Lightning:', JSON.stringify(runs.map(r => ({
      won: r.won, secs: Math.round(r.secs), dealt: Math.round(r.dealt), lost: r.lost,
      ghost: +r.ghost.toFixed(2), ung: +r.ung.toFixed(2), perMin: Math.round(r.perMin) }))));
    expect(wins.length, 'and she is not a formality').toBeLessThan(runs.length);
    expect(Math.min(...runs.map(r => r.dealt)), 'every run takes a real bite out of her (a tenth of her bar at least)').toBeGreaterThanOrEqual(200);
    // "2000 hp is good. I want this to be like a casual nkg (so abt 4-8 mins)" (the owner, 2026-10-06; NKG is Hollow Knight's Nightmare King Grimm): a win takes 4 minutes at the least
    // (this floor reads only a run that wins)
    wins.forEach(r => expect(r.secs, 'a win takes minutes, 4 at the least: "2000 hp is good. I want this to be like a casual nkg (so abt 4-8 mins)" (the owner, 2026-10-06)').toBeGreaterThanOrEqual(240));
    expect(mean('ghost'), 'her ghost shields her for well under half the fight').toBeLessThanOrEqual(0.45);
    // 2026-10-03, "one should be right beside you, so that you can hit them with a projectile": level with you she takes damage faster (the bot's
    // 415-590 a minute became 577-870) and so reaches Power Ungrounded sooner in a shorter fight -- its share went from 0.11-0.17 to 0.12-0.23 a run
    expect(mean('ung'), 'Power Ungrounded for a small part of it').toBeLessThanOrEqual(0.2);
    expect(runs.map(r => r.ghost + r.ung).every(f => f < 0.5), 'in every run she is hurtable for more than half of it').toBe(true);
    // "2000 hp is good. I want this to be like a casual nkg (so abt 4-8 mins)" (the owner, 2026-10-06): her 2000 HP at the scripted Lightning's damage a minute is 4 to 8 minutes of
    // fighting, so 250 to 500 a minute (2000 / 8 to 2000 / 4)
    expect(mean('perMin'), 'damage a minute: no more than 500, or 2000 HP is under 4 minutes ("2000 hp is good. I want this to be like a casual nkg (so abt 4-8 mins)", the owner, 2026-10-06)').toBeLessThanOrEqual(500);
    expect(mean('perMin'), 'damage a minute: no less than 250, or 2000 HP is over 8 minutes ("so abt 4-8 mins")').toBeGreaterThanOrEqual(250);
  }, 900000);   // about 35 s alone; under a loaded full-suite run it has taken nearly 10 minutes

  // BEATABLE IN PRINCIPLE, whatever a bot manages: with no ghost up every damage path reaches her, the ghost can be killed,
  // her phases run all the way down to 0 HP and she shatters, and a player's hits -- a jab when she swoops in, a Chain Bolt
  // out on her orbit -- land on her in the real fight.
  it('stays beatable in principle: every hit reaches her with no ghost up, the ghost dies, her phases run to 0, and hits land', () => {
    W.Math.random = mulberry32(21);
    const r = W.eval(`(function(){
      SETTINGS.itemRate = 0; LOCAL_PLAYERS = 1;
      startOneFight(['Lightning'], { story:true, onEnd:function(){ return true; } });
      var one = summons.find(function(s){ return s._oneFight; }), L = fighters[0], out = {};
      one._hop = null; one._hopPending = false; one.r = one._baseR;   // (the fight opens with her Vortex hop; this test puts her where it wants her)
      one._atkTimer = 1e9; L.controller = 'still';
      for (var w=0; w<10; w++) step();
      // (each path is tried on its own: a hit opens this fighter's grace on her, one for each attacker -- "give bosses by-character iframes",
      // the owner, 2026-10-04 -- so the clock moves 30 frames on before each, past any grace)
      var took = function(fn){ hazardT += 30; var h = one.hp; fn(); return h - one.hp; };
      one.x = L.x + 200; one.y = L.y;
      out.melee = took(function(){ damageSummons(L, one.x, one.y, 10, 10); });
      out.shot = took(function(){ projectiles = [{ owner:L.idx, ownerObj:L, x:one.x, y:one.y, vx:0, vy:0, dmg:5, kb:5, r:10, life:10 }]; step(); });
      projectiles = [];
      out.dash = took(function(){ L._dashing = 5; L._dashDmg = 6; L._dashSummonHits = null; var x = L.x, y = L.y; L.x = one.x - 10; L.y = one.y; step(); L._dashing = 0; L.x = x; L.y = y; });
      L.face = Math.sign(one.x - L.x) || 1; L.spCd = 0;
      out.chain = took(function(){ doSpecial(L); });
      // the ghost: its 70 HP can be spent (it was 100: "Nerf: 70 HP ghost", the owner, 2026-10-02), and then she can be hurt again
      ONE_MOVES.ghost(one, L, ++BOSS_ATK_ID); projectiles = [];
      var g = one._ghost, shielded = took(function(){ damageSummons(L, one.x, one.y, 10, 10); }), hits = 0;
      while (!g.dead && hits < 20){ g.invuln = 0; applyHit(g, 10, 1, -1, L); hits++; }
      out.ghost = { shielded: shielded, dead: g.dead, hits: hits, after: took(function(){ damageSummons(L, one.x, one.y, 10, 10); }) };
      // the phases: hit her all the way down
      var marks = [];
      for (var i=0; i<400 && one.hp > 0; i++){ oneTakeDamage(one, 10, L); updateOne(one, L); if (marks[marks.length-1] !== one._marks) marks.push(one._marks); }
      var frames = 0; while (running && frames < 400){ step(); frames++; }   // (her ending scene runs about 150 frames)
      out.phases = { marks: marks, won: ONEFIGHT.won };
      return out; })()`);
    expect(r.melee, 'a jab').toBeGreaterThan(0);
    expect(r.shot, 'a shot').toBeGreaterThan(0);
    expect(r.dash, 'a dash').toBeGreaterThan(0);
    expect(r.chain, 'the Chain Bolt').toBeGreaterThan(0);
    expect(r.ghost.shielded, 'nothing while the ghost stands').toBe(0);
    expect(r.ghost.dead, 'the ghost can be killed').toBe(true);
    expect(r.ghost.after, 'and then she can be hurt again').toBeGreaterThan(0);
    expect(r.phases.marks, 'every phase, down to 0 HP').toEqual([0, 1, 2, 3]);
    expect(r.phases.won, 'and she shatters').toBe(true);

    // ...and in the real fight, circling and swooping, a player's hits land: the scripted Lightning's jabs and smashes (when
    // she swoops in) and its Chain Bolts (from her orbit) over the first minute and a half -- of three fights, not one: she attacks in
    // longer sequences now and goes through the Vortex after every special, so the close-in windows are fewer, and the scripted
    // player (which never jumps at her) lands a jab in some fights and not in others
    const live = { melee: 0, bolt: 0 };
    for (const seed of [3, 5, 7]) {
      W.Math.random = mulberry32(seed);
      const got = W.eval(`(function(){
        SETTINGS.itemRate = 0; LOCAL_PLAYERS = 1;
        startOneFight(['Lightning'], { story:true, onEnd:function(){ return true; } });
        var one = summons.find(function(s){ return s._oneFight; }), L = fighters[0];
        L.controller = 'remote'; NET.inputs = NET.inputs || {};
        var got = { melee:0, bolt:0 }, ds = damageSummons, cb = chainBoltBoss;
        damageSummons = function(f){ var h = one.hp, r = ds.apply(this, arguments); if (f === L && one.hp < h) got.melee += h - one.hp; return r; };
        chainBoltBoss = function(s){ var h = one.hp, r = cb.apply(this, arguments); if (s === one && one.hp < h) got.bolt += h - one.hp; return r; };
        try { for (var i = 0; i < 60*90 && running; i++){ NET.inputs[0] = window.__oneBot(L, one); step(); } }
        finally { damageSummons = ds; chainBoltBoss = cb; running = false; }
        return got; })()`);
      live.melee += got.melee; live.bolt += got.bolt;
    }
    expect(live.melee, 'close-in hits land when she swoops').toBeGreaterThan(0);
    expect(live.bolt, 'and Chain Bolts reach her on her orbit').toBeGreaterThan(0);
  }, 300000);
});
