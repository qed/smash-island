import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { bootMonolith } from './helpers/smash-golden.js';
import { mulberry32 } from './helpers/prng.js';
import { BOT_GOLDEN_MATCHES, bootGoldenWindow, playBotMatch } from './helpers/bot-golden.js';

// ONE LEARNING BOT PER FIGHTER ("assign 1 bot to 1 fighter, and let them learn over time how to play well", the owner, 2026-10-05).
// Each fighter may have a PLAYBOOK in index.html (between `// @playbooks:begin` and `// @playbooks:end`): genes that move what the
// AI does, at the decisions mapped above `AI_LEVEL`. This file pins the rules the playbooks play by:
//   * Easy is today's AI bit for bit, and so is any fighter with no playbook entry, at every level;
//   * Hard reads the playbook;
//   * Normal reads it slowly and makes mistakes with it;
//   * the in-browser adaptation is bounded, persists, and is off in every measurement context;
//   * the trainer (scripts/train-bots.mjs) runs end to end and resumes;
//   * the boss harnesses are pinned to the legacy AI.

const golden = JSON.parse(readFileSync('test/golden/bot-legacy.json', 'utf8'));

// A playbook with every gene set to something loud, from a fixed recipe: the point is that whoever should not read it shows no sign.
const LOUD = `(function(names){
  var v = {}, i = 0;
  for (var g in PB_GENES){ var r = PB_GENES[g]; v[g] = r[0] + ((i++ * 7919) % 13) / 12 * (r[1] - r[0]); }
  names.forEach(function(n){ PLAYBOOKS[n] = { v: v, vs: {} }; });
})`;
const CLEAR = 'for (var k in PLAYBOOKS) delete PLAYBOOKS[k]; BOT_PB.legacy = false;';
const loud = (names) => `${LOUD}(${JSON.stringify(names)});`;

async function replay(w, m, after = '') {
  const r = playBotMatch(w, m, after);
  await new Promise((res) => setTimeout(res, 0));   // recordMatch's storage writes settle between matches
  w.eval(CLEAR);
  return r;
}
const sameAs = (r, g) => r.frames === g.frames && r.final === g.final && JSON.stringify(r.checks) === JSON.stringify(g.checks);

describe("Easy is today's AI, bit for bit", () => {
  let GW;
  beforeAll(() => { GW = bootGoldenWindow(); });

  it('replays the twelve seeded matches recorded before any playbook existed, at every level, identically', async () => {
    for (let i = 0; i < BOT_GOLDEN_MATCHES.length; i++) {
      const m = BOT_GOLDEN_MATCHES[i];
      const r = await replay(GW, m);
      expect(r.final, `${m.names.join(' v ')} at level ${m.level}`).toBe(golden[i].final);
      expect(r.frames, `${m.names.join(' v ')} at level ${m.level}`).toBe(golden[i].frames);
      expect(r.checks, `${m.names.join(' v ')} at level ${m.level}`).toEqual(golden[i].checks);
    }
  }, 240000);

  // The matches below are picked for what they exercise (a flyer and a freezer, the gadget kit, a three-way FFA), and to keep the file
  // fast on a slow machine: a match is a second or two when the machine is quiet and ten when it is not.
  const seeded = (...seeds) => seeds.map((s) => BOT_GOLDEN_MATCHES.findIndex((m) => m.seed === s));

  it('does not read a playbook at all: with a loud one for every fighter, the Easy matches replay identically', async () => {
    for (const i of seeded(304, 305, 306)) {
      const m = BOT_GOLDEN_MATCHES[i];
      const r = await replay(GW, m, loud(m.names));
      expect(sameAs(r, golden[i]), `${m.names.join(' v ')} (Easy, loud playbooks)`).toBe(true);
    }
  }, 240000);

  it('the legacy pin does the same for Normal and Hard: loud playbooks, pinned, replay the old matches', async () => {
    for (const i of seeded(311, 321, 322)) {
      const m = BOT_GOLDEN_MATCHES[i];
      const r = await replay(GW, m, `${loud(m.names)} BOT_PB.legacy = true;`);
      expect(sameAs(r, golden[i]), `${m.names.join(' v ')} (level ${m.level}, pinned)`).toBe(true);
    }
  }, 240000);

  it('an empty playbook on Hard is the legacy bot too: it draws no dice and changes no number', async () => {
    for (const i of seeded(321, 322)) {
      const m = BOT_GOLDEN_MATCHES[i];
      const r = await replay(GW, m, m.names.map((n) => `PLAYBOOKS[${JSON.stringify(n)}] = { v: {} };`).join(''));
      expect(sameAs(r, golden[i]), `${m.names.join(' v ')} (Hard, empty entries)`).toBe(true);
    }
  }, 240000);
});

// ---- the decision-level rig -----------------------------------------------------------------------------------------------
// One CPU fighter F (Hard unless said) and a foe T that stands still, `dist` px apart on the floor; think() asks aiThink for one
// frame's keys and rate(n, pick) says how often `pick` held over n of them. Between frames nothing moves, so the stuck detector
// is reset each time: it would otherwise decide after 26 frames that F is wedged and run its un-wedge burst.
let W;
const SETUP = (a, b, dist, level = 2) => `
  SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true; BOT_PB.legacy=false;
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  for (var k in PLAYBOOKS) delete PLAYBOOKS[k];
  var F = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(a)}; }), 300, groundY()-24, 0);
  var T = makeFighter(ROSTER.find(function(r){ return r.name===${JSON.stringify(b)}; }), 300+${dist}, groundY()-24, 1);
  F.team=0; T.team=1; F.face=1; T.face=-1; F.controller='still'; T.controller='still'; fighters=[F,T]; step();
  F.controller='ai'; F.invuln=0; T.invuln=0; F.atkCd=0; F.spCd=0; F.smCd=0; F.pct=0; T.pct=0; F.stocks=3; T.stocks=3; F._lvl=${level};
  var think = function(){ F._stuck=0; F._recover=0; F._lastX=F.x; F._aiCharging=0; F.smashHold=0; F._smQ=null; F._aiSpGap=0; F.aiTimer=20; F.hitstun=0; return aiThink(F); };
  var rate = function(n, pick){ var c=0; for(var i=0;i<n;i++){ if(pick(think())) c++; } return c/n; };`;
const run = (setup, body) => { W.Math.random = mulberry32(7); return W.eval(`(function(){ ${setup} ${body} })()`); };

describe('Hard reads the playbook', () => {
  beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

  it('a negative move shift thins the press the legacy rules make: Firey in melee jabs every frame, and almost never with mJb and mJd0 at -3', () => {
    const legacy = run(SETUP('Firey', 'Pen', 70), 'return rate(300, function(i){ return i.attack; })');
    const book = run(SETUP('Firey', 'Pen', 70), 'PLAYBOOKS.Firey = { v: { mJb: -3, mJd0: -3 } }; return rate(300, function(i){ return i.attack; })');
    expect(legacy).toBeGreaterThan(0.95);
    expect(book).toBeLessThan(0.05);
  });

  it('a positive shift adds a press the legacy rules never make: Rocky at range, with mRb and mRd2 at +3, fires about one frame in eight', () => {
    const legacy = run(SETUP('Rocky', 'Pen', 300), 'return rate(300, function(i){ return i.attack || i.special; })');
    const book = run(SETUP('Rocky', 'Pen', 300), 'PLAYBOOKS.Rocky = { v: { mRb: 3, mRd2: 3 } }; return rate(300, function(i){ return i.attack || i.special; })');
    expect(legacy).toBe(0);
    expect(book).toBeGreaterThan(0.06);
    expect(book).toBeLessThan(0.2);
  });

  it('...turned to face the foe it is pressed at, and never when the move is not legal (a special on cooldown is not added)', () => {
    const r = run(SETUP('Rocky', 'Pen', 300), `PLAYBOOKS.Rocky = { v: { mSb: 3, mSd2: 3, mRb: 3, mRd2: 3, mUb: 3, mDb: 3 } };
      F.spCd = 40; F.atkCd = 40; var cd = rate(200, function(i){ return i.attack || i.special; });
      F.spCd = 0; F.x = 700; T.x = 300; var faced = 0, n = 0;
      for (var i = 0; i < 300; i++){ var k = think(); if(k.special){ n++; if(k.left && !k.right) faced++; } }
      return { cd: cd, n: n, faced: faced };`);
    expect(r.cd).toBe(0);
    expect(r.n).toBeGreaterThan(10);
    expect(r.faced).toBe(r.n);
  });

  it('a smash the legacy rules commit to on a stunned foe is vetoed by mFb and mFo2 at -3; one is added on a read with mTb and mTd0 at +3', () => {
    const legacy = run(SETUP('Firey', 'Pen', 70), 'T.hitstun = 30; return rate(300, function(){ return F._aiCharging > 0; })');
    const vetoed = run(SETUP('Firey', 'Pen', 70), 'T.hitstun = 30; PLAYBOOKS.Firey = { v: { mFb: -3, mFo2: -3 } }; return rate(300, function(){ return F._aiCharging > 0; })');
    expect(legacy).toBeGreaterThan(0.1);
    expect(vetoed).toBe(0);
    const idle = run(SETUP('Rocky', 'Pen', 70), 'F.atkCd = 30; return rate(300, function(){ return F._aiCharging > 0; })');
    const read = run(SETUP('Rocky', 'Pen', 70), 'F.atkCd = 30; PLAYBOOKS.Rocky = { v: { mTb: 3, mTd0: 3 } }; return rate(300, function(){ return F._aiCharging > 0; })');
    expect(idle).toBe(0);
    expect(read).toBeGreaterThan(0.06);
  });

  it('the situation picks the gene: the same -3 on mJo2 (the foe stunned) thins the jab on a stunned foe and leaves it on an idle one', () => {
    const body = (stun) => `T.hitstun = ${stun}; PLAYBOOKS.Rocky = { v: { mJo2: -3 } }; return rate(300, function(i){ return i.attack; })`;
    const stunned = run(SETUP('Rocky', 'Pen', 70), body(30));
    const idle = run(SETUP('Rocky', 'Pen', 70), body(0));
    expect(idle).toBeGreaterThan(0.95);
    expect(stunned).toBeLessThan(0.1);
  });

  it('spacing: sRng +120 holds Firey back where the legacy rules close in (rush range 52 -> 172)', () => {
    const legacy = run(SETUP('Firey', 'Pen', 200), 'return rate(300, function(i){ return i.right; })');
    const book = run(SETUP('Firey', 'Pen', 200), 'PLAYBOOKS.Firey = { v: { sRng: 120 } }; return rate(300, function(i){ return i.right; })');
    expect(legacy).toBeGreaterThan(0.95);
    expect(book).toBeLessThan(0.45);
  });

  it('recovery: sRcY +30 starts the up-special 30 px sooner on the way down, where the legacy rules wait', () => {
    const setup = SETUP('Firey', 'Pen', 400) + 'F.y = WH - 100; F.vy = 2; F.onground = false; F.x = WW / 2;';
    const legacy = run(setup, 'return rate(200, function(i){ return i.special && i.up; })');
    const book = run(setup, 'PLAYBOOKS.Firey = { v: { sRcY: 30 } }; return rate(200, function(i){ return i.special && i.up; })');
    expect(legacy).toBe(0);
    expect(book).toBeGreaterThan(0.95);
  });

  it('danger: sDng -40 makes a fighter at 60% back off from a foe that the legacy rules still fight', () => {
    const setup = SETUP('Firey', 'Pen', 70) + 'F.pct = 60;';
    const legacy = run(setup, 'return rate(300, function(i){ return i.attack; })');
    const book = run(setup, 'PLAYBOOKS.Firey = { v: { sDng: -40 } }; return rate(300, function(i){ return i.attack; })');
    expect(legacy).toBeGreaterThan(0.9);
    expect(book).toBeLessThan(legacy - 0.2);
  });

  it('matchups: a delta keyed to the foe\'s AI class applies to that class only, and a named foe\'s to that foe alone', () => {
    // Pen is a zoner ("Zoner"), Coiny a rushdown ("Rushdown"), Rocky a heavy
    const jab = (foe, book) => run(SETUP('Firey', foe, 70), `PLAYBOOKS.Firey = ${JSON.stringify(book)}; return rate(300, function(i){ return i.attack; })`);
    // a shift of -3 keeps the press about one frame in ten, -1.5 about one in three
    const byClass = { v: { xzJ: -1.5, mJb: -1.5 } };       // -3 against zoners (xzJ + mJb), -1.5 against everyone else
    expect(jab('Pen', byClass)).toBeLessThan(0.2);
    expect(jab('Coiny', byClass)).toBeGreaterThan(0.25);
    const byName = { v: { mJb: -1.5 }, vs: { Pen: { J: -1.5 } } };    // the same -1.5, for Pen alone
    expect(jab('Pen', byName)).toBeLessThan(0.2);
    expect(jab('Coiny', byName)).toBeGreaterThan(0.25);
  });

  it('gimmicks: Golf Ball\'s counter stance reaches g0*30 px further (110 -> 170) for a foe charging a smash', () => {
    const at = (g0, dist) => run(SETUP('Golf Ball', 'Firey', dist), `T.smashHold = 8; ${g0 ? `PLAYBOOKS['Golf Ball'] = { v: { g0: ${g0} } };` : ''} return rate(60, function(i){ return i.special && i.down; })`);
    expect(at(0, 200)).toBe(0);            // 200 - 48 = 152 past the bodies: outside the legacy 110
    expect(at(2, 200)).toBeGreaterThan(0.9);
    expect(at(2, 260)).toBe(0);            // and 212 is outside even 110 + 60
  });

  it('gimmicks: g5 casts the self-buff smash (Golf Ball\'s Presence), which the legacy rules never do', () => {
    const casts = (book) => run(SETUP('Golf Ball', 'Pen', 200), `${book ? `PLAYBOOKS['Golf Ball'] = { v: { g5: 3 } };` : ''} return rate(300, function(){ return F._aiCharging > 0; })`);
    expect(casts(false)).toBe(0);
    expect(casts(true)).toBeGreaterThan(0.06);
  });

  it('the playbook changes a seeded Hard match and leaves the Easy one alone', async () => {
    const GW = bootGoldenWindow();
    const book = `PLAYBOOKS['Golf Ball'] = { v: { mJb: -2, mFb: 3, sRng: 40, sJmp: 0.1, g0: 2, g5: 3 } }; PLAYBOOKS.Leafy = { v: { mTb: 2, mDb: 2, g0: 2, g2: 2, sAgr: 0.3 } };`;
    const m = { names: ['Golf Ball', 'Leafy'], seed: 303, level: 2 };
    const legacy = await replay(GW, m);
    const hard = await replay(GW, m, book);
    const easy = await replay(GW, { ...m, level: 0 }, book);
    const easyLegacy = await replay(GW, { ...m, level: 0 });
    expect(JSON.stringify(hard.checks)).not.toBe(JSON.stringify(legacy.checks));
    expect(JSON.stringify(easy.checks)).toBe(JSON.stringify(easyLegacy.checks));
  }, 120000);

  it('a bad entry can do no more than the ranges allow: unknown genes, NaN and huge values are ignored or clamped', () => {
    const r = run(SETUP('Firey', 'Pen', 70), `PLAYBOOKS.Firey = { v: { nonsense: 5, mJb: NaN, mFb: 1e9, sRng: -1e9, __proto__x: 1, constructor: 7 }, vs: { Pen: { J: 1e9, Rng: 'x' } } };
      var eff = pbFor(F, T, 2);
      return { mJb: eff.mJb, mFb: eff.mFb, sRng: eff.sRng, nonsense: eff.nonsense, ctor: Object.prototype.hasOwnProperty.call(eff, 'constructor'), mJbVs: eff.mJb };`);
    expect(r.mJb).toBe(1.5);               // NaN dropped; the foe's J delta is clamped to its +1.5
    expect(r.mFb).toBe(3);
    expect(r.sRng).toBe(-60);
    expect(r.nonsense).toBeUndefined();
    expect(r.ctor).toBe(false);
  });
});

describe('Normal makes mistakes', () => {
  beforeAll(async () => { if (!W) { W = bootMonolith(); await W.eval('profileReady'); } });

  it('reads the foe slowly: a foe that is stunned this frame reads as stunned only after PB_NORMAL.react frames, and at once on Hard', () => {
    const r = run(SETUP('Firey', 'Pen', 70, 1), `
      var lag = function(level){ delete F._pbSn; hazardT = 1000; T.hitstun = 0; pbSense(F, T, false, level); T.hitstun = 30; var n = 0;
        while (n < 60){ hazardT++; n++; if (pbSense(F, T, false, level).o === 2) break; } return n; };
      return { normal: lag(1), hard: lag(2), react: PB_NORMAL.react };`);
    expect(r.hard).toBe(1);
    expect(r.normal).toBeGreaterThanOrEqual(r.react - 1);
    expect(r.normal).toBeLessThanOrEqual(r.react);
  });

  it('plays off the playbook some of the time: against a playbook that all but forbids the jab, Normal still jabs where Hard does not', () => {
    const book = 'PLAYBOOKS.Firey = { v: { mJb: -3, mJd0: -3 } };';
    const hard = run(SETUP('Firey', 'Pen', 70, 2), `${book} return rate(600, function(i){ return i.attack; })`);
    const normal = run(SETUP('Firey', 'Pen', 70, 1), `${book} return rate(600, function(i){ return i.attack; })`);
    const normalNoBook = run(SETUP('Firey', 'Pen', 70, 1), 'return rate(600, function(i){ return i.attack; })');
    expect(hard).toBeLessThan(0.05);
    expect(normal).toBeGreaterThan(0.1);                  // PB_NORMAL.skip of the frames play the legacy rules (and 22% of those drop the jab)
    expect(normal).toBeLessThan(normalNoBook - 0.3);      // ...but it is still mostly the playbook's bot
  });

  it('presses a move at random now and then: with blunder at 1 and every shift against it, Normal still presses things Hard never does', () => {
    const r = run(SETUP('Rocky', 'Pen', 300, 1), `
      PLAYBOOKS.Rocky = { v: { mRb: -3, mRd2: -3, mSb: -3, mUb: -3, mDb: -3, mJb: -3 } };
      var old = [PB_NORMAL.skip, PB_NORMAL.blunder]; PB_NORMAL.skip = 0; PB_NORMAL.blunder = 1;
      var normal = rate(300, function(i){ return i.attack || i.special; });
      F._lvl = 2; var hard = rate(300, function(i){ return i.attack || i.special; });
      PB_NORMAL.skip = old[0]; PB_NORMAL.blunder = old[1];
      return { normal: normal, hard: hard };`);
    expect(r.hard).toBe(0);
    expect(r.normal).toBeGreaterThan(0.2);                // not every blunder is legal and visible this frame, most are
  });

  it('keeps today\'s own handicap on top: Normal still drops 22% of the legacy bot\'s attacks, with or without an entry', () => {
    const none = run(SETUP('Firey', 'Pen', 70, 1), 'return rate(600, function(i){ return i.attack; })');
    const empty = run(SETUP('Firey', 'Pen', 70, 1), 'PLAYBOOKS.Firey = { v: {} }; return rate(600, function(i){ return i.attack; })');
    expect(none).toBeGreaterThan(0.7);
    expect(none).toBeLessThan(0.85);
    expect(empty).toBeGreaterThan(0.7);
    expect(empty).toBeLessThan(0.85);
  });
});
