import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { bootMonolith } from './helpers/smash-golden.js';
import { mulberry32 } from './helpers/prng.js';
import { BOT_GOLDEN_MATCHES, bootGoldenWindow, playBotMatch } from './helpers/bot-golden.js';
import { loadMonolith } from './helpers/load-monolith.js';
import { mutate, lookDecision, TEST, embedPlaybooks, readGame, playMatch, closeWindow, generation, loadState, freshFighter, deriveSeed } from '../scripts/train-bots.mjs';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

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

// ---- the trainer: scripts/train-bots.mjs ----------------------------------------------------------------------------------
describe('the trainer keeps a change only when it wins clearly more', () => {
  it('is a paired sign test on the pairs where the two disagree, with three looks', () => {
    const at = (b, c, look, k = 1) => lookDecision(b, c, look, 3, TEST, k).verdict;
    expect(at(30, 10, 3)).toBe('accept');           // 30 pairs the candidate won and the champion lost, 10 the other way
    expect(at(20, 14, 3)).toBe('reject');           // ahead, but that is noise
    expect(at(9, 3, 3)).toBe('reject');             // z of 1.7: not enough
    expect(at(6, 0, 3)).toBe('accept');             // the smallest clear win: six more, z of 2.4
    expect(at(5, 0, 3)).toBe('reject');             // under the net of six, however one-sided
    expect(at(26, 6, 1)).toBe('accept');            // a runaway is kept at the first look
    expect(at(10, 14, 1)).toBe('reject');           // behind at the first look: dropped
    expect(at(13, 10, 1)).toBe('continue');         // level, so look again
    expect(at(13, 3, 3, 1)).toBe('accept');         // z of 2.5 ...
    expect(at(13, 3, 3, 8)).toBe('reject');         // ... is not enough against eight candidates at once (the bar rises with ln K)
  });

  it('keeps a neutral change fewer than one time in twenty, and a clear improvement nearly always', () => {
    const rng = mulberry32(99);
    const trial = (pWin) => {                       // discordant pairs: half of the pairs, each won by the candidate with probability pWin
      let b = 0, c = 0, n = 0;
      for (let li = 0; li < TEST.looks.length; li++) {
        const to = Math.round(TEST.looks[li] / 2);
        for (; n < to; n++) { if (rng() < pWin) b++; else c++; }
        const d = lookDecision(b, c, li + 1, TEST.looks.length, TEST, 1).verdict;
        if (d !== 'continue') return d === 'accept';
      }
      return false;
    };
    const rate = (p) => { let k = 0; for (let i = 0; i < 4000; i++) if (trial(p)) k++; return k / 4000; };
    expect(rate(0.5)).toBeLessThan(0.05);
    expect(rate(0.75)).toBeGreaterThan(0.9);
  });
});

describe('the trainer mutates a playbook on the gene grid', () => {
  let info;
  beforeAll(async () => { info = await readGame(false); });

  it('moves one to three genes of the champion, each inside its range and on its step, and only the g* genes the kit reads', () => {
    const rocky = info.roster.find((r) => r.name === 'Rocky');                 // a floor-trap kit: g0-g3
    const plain = info.roster.find((r) => r.kg.length === 0);                  // a kit with no knobs
    expect(rocky.kg).toEqual(['g0', 'g1', 'g2', 'g3']);
    expect(plain).toBeTruthy();
    const champ = { v: { mJb: -0.5, sRng: 20 }, vs: {} };
    const kinds = { move: 0, other: 0 }, seen = new Set();
    for (let i = 0; i < 600; i++) {
      for (const f of [rocky, plain]) {
        const m = mutate(mulberry32(i), champ, { info, fighter: f, sigma: 1, counters: false, foes: [] });
        const changed = new Set([...Object.keys(m.v), ...Object.keys(champ.v)].filter((k) => (m.v[k] || 0) !== (champ.v[k] || 0)));
        expect(changed.size).toBeGreaterThanOrEqual(1);
        expect(changed.size).toBeLessThanOrEqual(3);
        for (const [g, x] of Object.entries(m.v)) {
          const [lo, hi, step] = info.genes[g];
          expect(x, g).toBeGreaterThanOrEqual(lo); expect(x, g).toBeLessThanOrEqual(hi);
          expect(Math.abs(x / step - Math.round(x / step)), `${g} on its grid`).toBeLessThan(1e-6);
          if (g[0] === 'g') expect(f.kg, `${f.name} reads ${g}`).toContain(g);
          seen.add(g[0]);
        }
        for (const g of changed) kinds[g[0] === 'm' ? 'move' : 'other']++;
      }
    }
    expect(kinds.move).toBeGreaterThan(kinds.other * 0.7);                     // the move genes are the bulk of the search
    expect([...seen].sort()).toEqual(['g', 'm', 's', 'x']);                    // and every kind of gene is tried
  });

  it('a counter is one delta for one named foe, and nothing else changes', () => {
    const champ = { v: { mJb: -0.5 }, vs: {} };
    let counters = 0;
    for (let i = 0; i < 400; i++) {
      const m = mutate(mulberry32(i), champ, { info, fighter: info.roster[0], sigma: 1, counters: true, foes: ['Pen', 'Coiny'] });
      if (!m.focus) continue;
      counters++;
      expect(['Pen', 'Coiny']).toContain(m.focus);
      expect(m.v).toEqual(champ.v);
      expect(Object.keys(m.vs)).toEqual([m.focus]);
      const [p, x] = Object.entries(m.vs[m.focus])[0] || [];
      if (p) { const [lo, hi, step] = info.vsGenes[p]; expect(x).toBeGreaterThanOrEqual(lo); expect(x).toBeLessThanOrEqual(hi); expect(Math.abs(x / step - Math.round(x / step))).toBeLessThan(1e-6); }
    }
    expect(counters).toBeGreaterThan(5);
    expect(counters).toBeLessThan(80);                                         // "only where training finds a real counter": rare
  });
});

// A stand-in for the game: who wins is a coin weighted by a hidden objective over fifteen genes (the best mJb is -1.5, the best sRng 40, and
// so on). The coin is thrown from the match's seed AND the two playbooks, the worst case: a pair's two arms share nothing but the opponent,
// as two real matches do once a changed gene has made them diverge. It lets the whole loop (mutation, pairs, the sign test, the benchmark,
// saving) run in a second instead of an hour.
const FAKE = { mJb: -1.5, mRb: 1, mSb: -1, mUb: 0.5, mDb: 1.5, mTb: -0.5, mFb: 1, sRng: 40, sApp: 20, sRet: -10, sAgr: 0.2, sJmp: 0.1, sDng: -10, sFin: 10, sEdg: 50 };
const FAKE_UNIT = { sRng: 20, sApp: 10, sRet: 10, sAgr: 0.2, sJmp: 0.1, sDng: 10, sFin: 10, sEdg: 50 };
const fakeScore = (e) => -Object.entries(FAKE).reduce((a, [g, t]) => a + Math.abs(((e && e.v[g]) || 0) - t) / (FAKE_UNIT[g] || 1), 0);
const fakePool = (objective = true) => ({
  async run(job) {
    const p = objective ? 1 / (1 + Math.exp(-1.2 * (fakeScore(job.pb[0]) - fakeScore(job.pb[1])))) : 0.5;
    const u = mulberry32(deriveSeed(job.seed, JSON.stringify(job.pb)))();
    return { winner: u < p ? 0 : 1, frames: 1000, timedOut: false, stocks: [1, 0], pct: [0, 0] };
  },
});

describe('the trainer learns when there is something to learn, and picks up where it stopped', () => {
  let info;
  const cfg = () => ({ cands: 3, stocks: 2, maxFrames: 100, looks: TEST.looks, bench: 8, benchEvery: 5, counters: true, test: { ...TEST } });
  const fresh = () => ({ version: 1, schema: info.schema, seed: 424242, totals: { matches: 0, wallMs: 0 }, fighters: Object.fromEntries(info.roster.map((r) => [r.name, freshFighter()])) });
  const gens = async (st, n, dir, pool = fakePool()) => { for (let i = 0; i < n; i++) await generation({ pool, st, cfg: cfg(), info, dir, log: () => {}, embed: false }, 'Firey'); };
  beforeAll(async () => { info = await readGame(false); });

  it("climbs a hidden objective: kept changes accumulate, the playbook gets closer to the optimum, and the benchmark against today's bot says so", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'bot-learn-'));
    try {
      const st = fresh();
      await gens(st, 150, dir);
      const F = st.fighters.Firey;
      expect(F.gen).toBe(150);
      expect(F.accepted).toBeGreaterThanOrEqual(4);
      expect(fakeScore(F), 'closer to the optimum than the empty playbook').toBeGreaterThan(fakeScore(null) + 2);
      expect(F.wr, "its playbook beats the legacy bot in the benchmark (the champion's own figure)").toBeGreaterThan(0.6);
      expect(F.wrN).toBeGreaterThanOrEqual(8);
      expect(F.matches).toBe(st.totals.matches);
      expect(F.history.length).toBeLessThanOrEqual(30);
      expect(Object.keys(F.v).every((g) => info.genes[g])).toBe(true);        // only genes the game has
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }, 240000);

  it('learns nothing from noise: when the games do not depend on the playbook, almost no change is kept', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'bot-noise-'));
    try {
      const st = fresh();
      await gens(st, 60, dir, fakePool(false));
      expect(st.fighters.Firey.accepted).toBeLessThanOrEqual(5);              // about one candidate in eighty, against one in two for a rule that follows the coin
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }, 240000);

  it('picks up where it stopped: ten generations in one go equal five, a restart from the saved file, and five more', async () => {
    const a = mkdtempSync(path.join(tmpdir(), 'bot-run-a-')), b = mkdtempSync(path.join(tmpdir(), 'bot-run-b-'));
    try {
      const whole = fresh();
      await gens(whole, 10, a);
      const half = fresh();
      await gens(half, 5, b);
      const reloaded = loadState(b);                                          // what a restart reads: the state saved after the fifth generation
      expect(reloaded.fighters.Firey.gen).toBe(5);
      await gens(reloaded, 5, b);
      const pick = (st) => { const F = st.fighters.Firey; return { gen: F.gen, accepted: F.accepted, v: F.v, vs: F.vs, sigma: F.sigma, matches: F.matches, wr: F.wr, wrN: F.wrN, history: F.history.map((h) => [h.g, h.ok, h.z, h.mut]) }; };
      expect(pick(reloaded)).toEqual(pick(whole));
      expect(loadState(b).fighters.Firey.gen).toBe(10);                       // and the file on disk is the latest
    } finally { rmSync(a, { recursive: true, force: true }); rmSync(b, { recursive: true, force: true }); }
  }, 120000);
});

describe("the trainer writes only index.html's @playbooks block", () => {
  const html = readFileSync('artifacts/V1/index.html', 'utf8');
  const entries = { Firey: { gen: 3, n: 480, wr: 0.625, v: { mJb: -0.5, sRng: 20 }, vs: { Pen: { J: -0.75 } } }, Pen: { v: { g0: 1 } } };
  const block = /\/\/ @playbooks:begin[\s\S]*?\/\/ @playbooks:end/;

  it('rewrites the PLAYBOOKS statement and keeps every other byte, CRLF line endings included', () => {
    const out = embedPlaybooks(html, entries);
    expect(out).not.toBe(html);
    expect(out.replace(block, '')).toBe(html.replace(block, ''));
    expect(out.split('\r\n').length - 1).toBe(out.split('\n').length - 1);     // not one bare LF in a CRLF file
    expect(out).toContain('"Firey": {"gen":3,"n":480,"wr":0.625,"v":{"mJb":-0.5,"sRng":20},"vs":{"Pen":{"J":-0.75}}},');
    expect(out).toContain('Written by scripts/train-bots.mjs');                // the comment above the statement survives
    expect(embedPlaybooks(out, {})).toBe(html);                                // replacing is idempotent, and an empty set is the file as shipped
    expect(embedPlaybooks(embedPlaybooks(html, { Pen: { v: { g1: 2 } } }), entries)).toBe(out);
  });

  it('what it writes is what the game reads', () => {
    const out = embedPlaybooks(html, entries);
    const w = loadMonolith(1, () => out).window;
    const r = JSON.parse(w.eval('JSON.stringify({ firey: PLAYBOOKS.Firey, pen: PLAYBOOKS.Pen, eff: pbEff(PLAYBOOKS.Firey, "Pen", "zone") })'));
    expect(r.firey).toEqual({ gen: 3, n: 480, wr: 0.625, v: { mJb: -0.5, sRng: 20 }, vs: { Pen: { J: -0.75 } } });
    expect(r.pen.v.g0).toBe(1);
    expect(r.eff.mJb).toBe(-1.25);                                             // mJb -0.5 and the named foe's J -0.75
  });

  it('refuses a file without the markers rather than guess', () => {
    expect(() => embedPlaybooks('const PLAYBOOKS = {};', {})).toThrow(/@playbooks/);
    expect(() => embedPlaybooks(html.replace('// @playbooks:end', '// elsewhere'), {})).toThrow(/@playbooks/);
  });
});

describe("the trainer's matches are the game's", () => {
  it("plays the golden Hard match to the frame when both bots are today's (no playbook), and a playbook override changes it", async () => {
    const g = golden.find((x) => x.seed === 321);                              // Rocky v Needle, Hard
    const r = await playMatch({ names: ['Rocky', 'Needle'], pb: [null, null], seed: 321, stocks: 2, maxFrames: 3000 }, false);
    expect(r.frames).toBe(g.frames);
    const final = g.final.split(',').map((s) => s.split(':'));
    expect(r.stocks).toEqual(final.map((f) => +f[1]));
    expect(r.pct).toEqual(final.map((f) => +f[2]));
    expect(r.winner).toBe(final.findIndex((f) => f[3] === 'a'));
    const book = await playMatch({ names: ['Rocky', 'Needle'], pb: [{ v: { mJb: -3, mJd0: -3, mFb: 2, sRng: 60 }, vs: {} }, null], seed: 321, stocks: 2, maxFrames: 3000 }, false);
    expect(`${book.frames}/${book.stocks}/${book.pct}`).not.toBe(`${r.frames}/${r.stocks}/${r.pct}`);
    const mirror = await playMatch({ names: ['Firey', 'Firey'], pb: [null, { v: { mJb: -3 }, vs: {} }], seed: 5, stocks: 1, maxFrames: 1500 }, false);   // two of one fighter, one with a playbook
    expect([0, 1]).toContain(mirror.winner);
    await closeWindow();
  }, 300000);
});

describe("the trainer's smoke run", () => {
  it('runs a generation end to end, saves it, resumes where it stopped, and embeds into a copy of the game', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'bot-train-'));
    const copy = path.join(dir, 'index.html');
    const node = (args, ms = 540000) => execFileSync(process.execPath, ['scripts/train-bots.mjs', ...args], { encoding: 'utf8', timeout: ms });
    try {
      const out = node(['smoke', '--dir', dir, '--fighters', 'Firey,Pen', '--pairs', '2', '--cands', '1', '--bench', '2', '--frames', '900', '--workers', '2']);
      expect(out).toMatch(/matches a minute/);
      let st = JSON.parse(readFileSync(path.join(dir, 'state.json'), 'utf8'));
      expect(st.fighters.Firey.gen).toBe(1);
      expect(st.fighters.Pen.gen).toBe(1);
      expect(st.fighters.Rocky.gen).toBe(0);                                    // not in this run
      expect(st.fighters.Pen.wr, "Pen had a playbook, so it was benchmarked against today's bot").not.toBeNull();
      expect(st.fighters.Pen.wrN).toBe(2);
      expect(st.fighters.Firey.matches).toBeGreaterThanOrEqual(4);              // the champion's two pairs and the candidate's
      expect(st.totals.matches).toBe(st.fighters.Firey.matches + st.fighters.Pen.matches);
      const before = st.totals.matches;
      // pick up where it stopped: the same state, one more generation for Firey alone
      const again = node(['run', '--dir', dir, '--fighters', 'Firey', '--gens', '1', '--pairs-max', '2', '--pairs-step', '2', '--cands', '1', '--bench', '2', '--frames', '900', '--workers', '2', '--no-prizes', '--priority', 'normal']);
      expect(again).toMatch(/resuming/);
      st = JSON.parse(readFileSync(path.join(dir, 'state.json'), 'utf8'));
      expect(st.fighters.Firey.gen).toBe(2);
      expect(st.fighters.Pen.gen).toBe(1);
      expect(st.totals.matches).toBeGreaterThan(before);
      expect(node(['status', '--dir', dir], 60000)).toMatch(/Firey\s+gen\s+2/);
      // the playbooks go into a copy of the game and nowhere else
      copyFileSync('artifacts/V1/index.html', copy);
      expect(node(['embed', '--dir', dir, '--target', copy], 60000)).toMatch(/rewritten/);
      const html = readFileSync(copy, 'utf8');
      expect(html).toContain('"Pen": {"gen":1,');
      expect(html).toContain('"mJb":0.25');
      const block = /\/\/ @playbooks:begin[\s\S]*?\/\/ @playbooks:end/;
      expect(html.replace(block, '')).toBe(readFileSync('artifacts/V1/index.html', 'utf8').replace(block, ''));
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }, 900000);
});
