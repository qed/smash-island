import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { SETUP_SRC } from './helpers/match-setup.js';
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

  it('with no playbook, replays the twelve seeded matches recorded before any playbook existed, at every level, identically', async () => {
    // (The game ships trained playbooks now -- Leafy, Coiny and Candle among the golden matches' fighters -- and Normal and Hard read them by
    // design, so this replays the no-playbook game: what "a fighter with no entry plays the legacy rules" promises, at every level.)
    GW.eval('for (var k in PLAYBOOKS) delete PLAYBOOKS[k];');
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

// ---- the in-browser adaptation (BOT_ADAPT) ----------------------------------------------------------------------------------
// A window that looks like a real browser to the game: the user agent is Chrome's, not jsdom's (the game's own test for "not a measurement").
const STUB_CTX = () => new Proxy({}, { get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 }) : p === 'canvas' ? { width: 1100, height: 720 }
  : p === 'getImageData' ? () => ({ data: [] }) : (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createConicGradient' || p === 'createPattern') ? () => ({ addColorStop() {} }) : () => {}), set: () => true });
function bootBrowser(opts = {}) {
  const dom = new JSDOM(readFileSync('artifacts/V1/index.html', 'utf8'), {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      window.HTMLCanvasElement.prototype.getContext = () => STUB_CTX();
      window.Math.random = mulberry32(opts.seed || 5);
      window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {};
      Object.defineProperty(window.navigator, 'userAgent', { value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36', configurable: true });
      if (opts.webdriver) Object.defineProperty(window.navigator, 'webdriver', { value: true, configurable: true });
      if (opts.harness) window.__botsHarness = true;
      if (opts.noStorage) Object.defineProperty(window, 'localStorage', { get() { throw new Error('SecurityError: storage is blocked'); }, configurable: true });
    },
  });
  return dom.window;
}
// Two fighters in a plain FFA, an idle person (Pen, local) and a CPU Firey with an empty playbook; the code in `extra` runs once they are set
// up and then the adaptation is begun the way beginMatchNow does. `keep` leaves localStorage as it is (else it is cleared first).
const MATCH = (level = 2, extra = '', keep = false) => `(function(){
  TESTMODE.active=false; TOURNEY_WATCHING=null; SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true; AI_LEVEL=${level};
  worldPlats=[]; summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[];
  for (var k in PLAYBOOKS) delete PLAYBOOKS[k]; PLAYBOOKS.Firey = { v: {} };
  ${keep ? '' : 'try { localStorage.removeItem("bots:adapt:v1"); } catch (e) {}'}
  var H = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 700, groundY()-24, 0);
  var A = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 300, groundY()-24, 1);
  H.team=0; A.team=1; H.controller='local'; H.you=true; A.controller='ai'; H.stocks=1; A.stocks=3;
  fighters=[H,A]; step(); H.invuln=0; A.invuln=0; hazardT=1000; BOT_ADAPT.data = Object.create(null); BOT_ADAPT.locked = false;
  ${extra} })()`;
const K0 = '{ d: 0, h: 1, o: 0, p: 0, locked: false }';   // melee, level, the foe idle, fresh
// what a fired move looks like to the bandit: the cooldown jumps, the damage counters move, the window runs out
const FIRE_JAB = 'A.atkCd = 0; botAdaptNote(A, k); A.atkCd = 22; botAdaptNote(A, k); A._dmgDealt += 30; hazardT += 80; botAdaptNote(A, k);';

describe('the in-browser adaptation is bounded, persists, and is off in every measurement context', () => {
  let B;
  beforeAll(async () => { B = bootBrowser(); await B.eval('profileReady'); });

  it('is on in a browser and off in a jsdom window, under a webdriver, in the harness boots, and once a match setup has locked it', () => {
    expect(B.eval('BOT_ADAPT.enabled && !BOT_ADAPT.locked')).toBe(true);
    expect(bootBrowser({ webdriver: true }).eval('BOT_ADAPT.enabled')).toBe(false);
    expect(bootBrowser({ harness: true }).eval('BOT_ADAPT.enabled')).toBe(false);
    expect(bootMonolith().eval('BOT_ADAPT.enabled'), 'the boot every test and boss script uses').toBe(false);
    expect(loadMonolith(1).window.eval('BOT_ADAPT.enabled'), "the balance tournament's, the trainer's and the golden's boot").toBe(false);
    B.eval(SETUP_SRC); B.eval('__setupCustomMatch(["Firey","Pen"], 1, 2, 0)');   // the match setup they all run
    expect(B.eval('BOT_ADAPT.locked')).toBe(true);
    B.eval('BOT_ADAPT.locked = false');                                          // (the rest of this file wants it on)
  });

  it('adapts only a CPU with a shipped playbook, in a match a person plays, on the host, outside the boss modes', () => {
    const begin = (extra = '') => JSON.parse(B.eval(`${MATCH(2, extra)}; botAdaptBegin(); JSON.stringify({ on: BOT_ADAPT.on, who: Object.keys(BOT_ADAPT.fx) })`));
    expect(begin()).toEqual({ on: true, who: ['Firey'] });
    expect(begin('delete PLAYBOOKS.Firey;').on, "no entry: today's bot, no adaptation").toBe(false);
    expect(begin('H.controller="ai"; H.you=false;').on, 'no person in the match').toBe(false);
    expect(begin('SETTINGS.mode="boss";').on, 'boss modes').toBe(false);
    expect(begin('TESTMODE.active=true;').on, 'the practice sandbox').toBe(false);
    expect(begin('A._pbOverride = null;').on, "the trainer's fighters").toBe(false);
    const was = B.NET;
    B.NET = { role: 'client' };
    expect(begin().on, 'a client never runs AI, so it never adapts').toBe(false);
    B.NET = { role: 'host', inputs: {} };
    expect(begin('H.controller="remote";').on, "the host's CPUs adapt to a friend on the other end").toBe(true);
    B.NET = was;
    expect(B.eval(`${MATCH(2, 'BOT_ADAPT.locked = true;')}; botAdaptBegin(); BOT_ADAPT.on`), 'a locked game').toBe(false);
    B.eval('BOT_ADAPT.locked = false');
  });

  it('is wired into the match: beginMatchNow begins it and checkWin commits it', () => {
    expect(B.eval('String(beginMatchNow)')).toMatch(/botAdaptBegin\(\)/);
    expect(B.eval('String(checkWin)')).toMatch(/botAdaptCommit\(\)/);
  });

  it("learns what pays: a move that earns above its context's average is nudged up, one that costs is nudged down, inside the cap", () => {
    const r = JSON.parse(B.eval(`${MATCH(2, `
      botAdaptBegin(); var k = ${K0};
      // 30 jabs in melee that each land for 30 damage, and 30 specials in melee that each cost 40 damage taken
      for (var i = 0; i < 30; i++){
        ${FIRE_JAB}
        A.spCd = 60; botAdaptNote(A, k); A._dmgTaken += 40; hazardT += 80; botAdaptNote(A, k);
        A.spCd = 0; A.atkCd = 0; botAdaptNote(A, k);
      }
      botAdaptCommit();
      var d = BOT_ADAPT.data.Firey;
      botAdaptBegin();
      var fx = BOT_ADAPT.fx.Firey, l1 = 0; fx.forEach(function(v){ l1 += Math.abs(v); });
      return JSON.stringify({ jabN: d.c[0], jabM: d.m[0], spN: d.c[2], spM: d.m[2], n: d.n, jab: fx[0], sp: fx[2], l1: l1, max: Math.max.apply(null, fx.map(Math.abs)), cap: ADAPT_CAP, cap1: ADAPT_L1 });`)}`));
    expect(r.n).toBe(1);
    expect(r.jabN).toBeGreaterThanOrEqual(29); expect(r.spN).toBeGreaterThanOrEqual(29);
    expect(r.jabM).toBeCloseTo(1.2, 1);               // 30 damage / 25
    expect(r.spM).toBeCloseTo(-1.6, 1);
    expect(r.jab).toBeGreaterThan(0.2);               // the jab beat the context's average ...
    expect(r.sp).toBeLessThan(-0.2);                  // ... the special lost to it
    expect(r.max).toBeLessThanOrEqual(r.cap);
    expect(r.l1).toBeLessThanOrEqual(r.cap1 + 1e-9);
  });

  it('the nudge reaches the fighter: it is added to the move\'s shift, and only while the match adapts', () => {
    const r = JSON.parse(B.eval(`${MATCH(2, `
      PLAYBOOKS.Firey = { v: { mJb: -1 } };
      botAdaptBegin(); BOT_ADAPT.fx.Firey = new Array(63).fill(0); BOT_ADAPT.fx.Firey[0] = ADAPT_CAP;
      var k = ${K0}, eff = pbEff(PLAYBOOKS.Firey, 'Pen', 'zone');
      var adapted = pbShifts(A, eff, k).slice();
      BOT_ADAPT.on = false; var plain = pbShifts(A, eff, k).slice();
      return JSON.stringify({ adapted: adapted[0], plain: plain[0], cap: ADAPT_CAP });`)}`));
    expect(r.plain).toBe(-1);
    expect(r.adapted).toBeCloseTo(-1 + r.cap, 6);
  });

  it('persists: it is written to localStorage and a reloaded page reads it back', () => {
    B.eval(`${MATCH(2, `botAdaptBegin(); var k = ${K0}; ${FIRE_JAB} botAdaptCommit();`)}`);
    const raw = B.localStorage.getItem('bots:adapt:v1');
    expect(raw, 'the match left its lessons in localStorage').toBeTruthy();
    const saved = JSON.parse(raw);
    expect(saved.Firey.c).toHaveLength(63); expect(saved.Firey.c[0]).toBeGreaterThan(0); expect(saved.Firey.n).toBe(1);
    const C = bootBrowser({ seed: 9 });                              // a new page load with the same storage
    C.localStorage.setItem('bots:adapt:v1', raw);
    const r = JSON.parse(C.eval(`${MATCH(2, `botAdaptBegin(); return JSON.stringify({ n: BOT_ADAPT.data.Firey.n, c0: BOT_ADAPT.data.Firey.c[0], m0: BOT_ADAPT.data.Firey.m[0], on: BOT_ADAPT.on });`, true)}`));
    expect(r.on).toBe(true);
    expect(r.n).toBe(1);
    expect(r.c0).toBe(saved.Firey.c[0]);
    expect(r.m0).toBeCloseTo(saved.Firey.m[0], 3);
  });

  it('works when storage is missing: no error, and it still learns for the session', () => {
    const N = bootBrowser({ noStorage: true });
    expect(() => N.localStorage).toThrow();
    const r = JSON.parse(N.eval(`${MATCH(2, `
      botAdaptBegin(); var k = ${K0}, first = BOT_ADAPT.on;
      ${FIRE_JAB}
      botAdaptCommit();
      var kept = BOT_ADAPT.data.Firey && BOT_ADAPT.data.Firey.n;
      botAdaptBegin();
      return JSON.stringify({ first: first, kept: kept, again: BOT_ADAPT.on, c0: BOT_ADAPT.data.Firey.c[0] });`, true)}`));
    expect(r).toMatchObject({ first: true, kept: 1, again: true });
    expect(r.c0).toBeGreaterThan(0);
  });

  it('is bounded: nothing read from storage can push past the caps, and what it stores stays small', () => {
    const r = JSON.parse(B.eval(`(function(){
      var big = {}, junk = {};
      // ninety fighters with out-of-range counts and rewards, one cell a fighter paying hugely and the rest costing hugely
      for (var i = 0; i < 90; i++) big['F' + i] = { c: new Array(63).fill(1e9), m: Array.from({ length: 63 }, function(_, j){ return j % 7 === 0 ? 1e9 : -1e9; }), n: 5, t: i };
      junk.Bad1 = { c: [1, 2, 3], m: [1] }; junk.Bad2 = 5; junk.Bad3 = { c: 'x', m: 'y' };
      var clean = botAdaptClean(Object.assign({}, big, junk));
      var names = Object.keys(clean), cmax = 0, mmin = 0, mmax = 0;
      names.forEach(function(n){ clean[n].c.forEach(function(x){ cmax = Math.max(cmax, x); }); clean[n].m.forEach(function(x){ mmin = Math.min(mmin, x); mmax = Math.max(mmax, x); }); });
      var fx = botAdaptFx(clean[names[0]]), worst = 0, l1 = 0; fx.forEach(function(v){ worst = Math.max(worst, Math.abs(v)); l1 += Math.abs(v); });
      BOT_ADAPT.data = clean; localStorage.removeItem(ADAPT_KEY); botAdaptSave();
      return JSON.stringify({ fighters: names.length, newest: names[0], hasBad: names.some(function(n){ return /^Bad/.test(n); }), cmax: cmax, mmin: mmin, mmax: mmax, worst: worst, l1: l1,
        bytes: localStorage.getItem(ADAPT_KEY).length, caps: [ADAPT_MAX_FIGHTERS, ADAPT_CMAX, ADAPT_CAP, ADAPT_L1] });
    })()`));
    expect(r.fighters).toBe(r.caps[0]);                              // 40 of the 90
    expect(r.newest).toBe('F89');                                    // the most recently updated are the ones kept
    expect(r.hasBad).toBe(false);
    expect(r.cmax).toBeLessThanOrEqual(r.caps[1]);
    expect(r.mmin).toBeGreaterThanOrEqual(-3); expect(r.mmax).toBeLessThanOrEqual(3);
    expect(r.worst).toBeLessThanOrEqual(r.caps[2] + 1e-9);
    expect(r.l1).toBeCloseTo(r.caps[3], 6);                          // the nudges were scaled down to the L1 cap, not past it
    expect(r.bytes).toBeLessThan(80000);                             // forty fighters of 63 cells: nothing next to a browser's storage
  });

  it("drift from the shipped playbook is capped: after 300 matches of the most one-sided rewards, no move's shift has moved more than the cap", () => {
    const r = JSON.parse(B.eval(`${MATCH(2, `
      var k = ${K0};
      for (var m = 0; m < 300; m++){
        botAdaptBegin();
        for (var i = 0; i < 6; i++){                                  // jabs pay hugely, specials and smashes cost hugely
          A.atkCd = 0; A.spCd = 0; A.smCd = 0; botAdaptNote(A, k);
          A.atkCd = 22; botAdaptNote(A, k); A._dmgDealt += 500; hazardT += 80; botAdaptNote(A, k);
          A.spCd = 60; A.smCd = 90; botAdaptNote(A, k); A._dmgTaken += 500; hazardT += 80; botAdaptNote(A, k);
        }
        botAdaptCommit();
      }
      botAdaptBegin();
      var eff = pbEff(PLAYBOOKS.Firey, 'Pen', 'zone');
      var adapted = pbShifts(A, eff, k).slice();
      BOT_ADAPT.on = false; var plain = pbShifts(A, eff, k).slice();
      var drift = 0, moved = 0; for (var s = 0; s < 7; s++){ drift = Math.max(drift, Math.abs(adapted[s] - plain[s])); moved = Math.max(moved, adapted[s] - plain[s]); }
      var d = BOT_ADAPT.data.Firey, cmax = Math.max.apply(null, d.c), mabs = Math.max.apply(null, d.m.map(Math.abs));
      return JSON.stringify({ drift: drift, moved: moved, cap: ADAPT_CAP, cmax: cmax, cmaxCap: ADAPT_CMAX, mabs: mabs, n: d.n });`)}`));
    expect(r.n).toBe(300);
    expect(r.drift).toBeLessThanOrEqual(r.cap + 1e-9);
    expect(r.moved).toBeGreaterThan(0.2);                            // and it did learn: a nudge, not nothing
    expect(r.cmax).toBeLessThanOrEqual(r.cmaxCap);
    expect(r.mabs).toBeLessThanOrEqual(3);
  });

  it('Easy never adapts, even in a browser with a playbook: nothing is watched and nothing is written', () => {
    const r = JSON.parse(B.eval(`${MATCH(0, `
      botAdaptBegin(); A._lvl = 0; H.stocks = 3;
      for (var i = 0; i < 400; i++){ A.atkCd = 0; step(); }
      botAdaptCommit();
      return JSON.stringify({ watched: !!A._pbA, stored: localStorage.getItem('bots:adapt:v1') });`)}`));
    expect(r.watched).toBe(false);
    expect(r.stored).toBeNull();
  });

  it('end to end: a CPU with a playbook beats an idle person through the real step() and checkWin, and the match lands in localStorage', () => {
    B.Math.random = mulberry32(77);
    const r = JSON.parse(B.eval(`${MATCH(2, `
      botAdaptBegin();
      var on = BOT_ADAPT.on, f = 0;
      for (; running && f < 3000; f++) step();
      var d = BOT_ADAPT.data.Firey, stored = JSON.parse(localStorage.getItem('bots:adapt:v1') || 'null');
      return JSON.stringify({ on: on, over: !running, frames: f, after: BOT_ADAPT.on, n: d && d.n, uses: d && d.c.reduce(function(a, b){ return a + b; }, 0), stored: !!(stored && stored.Firey && stored.Firey.n === 1) });`)}`));
    expect(r.on).toBe(true);
    expect(r.over).toBe(true);
    expect(r.after, 'committed once, at the end').toBe(false);
    expect(r.n).toBe(1);
    expect(r.uses).toBeGreaterThan(3);                               // it fired moves, and they were seen
    expect(r.stored).toBe(true);
  }, 120000);
});

// ---- the trainer: scripts/train-bots.mjs ----------------------------------------------------------------------------------
describe('the trainer keeps a change once it is net 7 wins ahead', () => {
  // The owner, 2026-10-06, on 17-7, 16-9 and 13-6: "that is a clear margin. in theory, when 2 bots go against each other, they will do the
  // same inputs, right? so a difference of 10(for cabby), and 7(coiny and candle), is enough". (It was a z-test that kept none of them.)
  it('keeps a candidate net 7 ahead on the pairs where the two disagree, at any of three looks; drops one that is behind', () => {
    const at = (b, c, look, k = 1) => lookDecision(b, c, look, 3, TEST, k).verdict;
    expect(TEST.minNet).toBe(7);
    expect(at(17, 7, 3)).toBe('accept');            // Cabby's 17-7: net 10
    expect(at(16, 9, 3)).toBe('accept');            // Candle's 16-9: net 7
    expect(at(13, 6, 3)).toBe('accept');            // Coiny's 13-6: net 7
    expect(at(7, 0, 3)).toBe('accept');             // the smallest kept: net 7
    expect(at(6, 0, 3)).toBe('reject');             // net 6, however one-sided
    expect(at(20, 14, 3)).toBe('reject');           // net 6 at the last look
    expect(at(26, 6, 1)).toBe('accept');            // net 7 or more at the first look: kept then
    expect(at(10, 14, 1)).toBe('reject');           // behind at the first look: dropped
    expect(at(13, 10, 1)).toBe('continue');         // ahead by 3: look again
    expect(at(13, 3, 3, 8)).toBe('accept');         // net 10 against eight candidates at once: the margin is the rule, not the count
  });

  it('keeps a neutral change about one time in seven (the 15-point rule finds those out), and a clear improvement nearly always', () => {
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
    expect(rate(0.5)).toBeLessThan(0.16);            // 13.5% measured: the owner's trade for keeping 60%-win changes about half the time
    expect(rate(0.6)).toBeGreaterThan(0.45);          // (under the old z-test, rarely)
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

  it('follows noise only so far: when the games do not depend on the playbook, about one generation in three keeps a change', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'bot-noise-'));
    try {
      const st = fresh();
      await gens(st, 60, dir, fakePool(false));
      // "a difference of ... 7 ... is enough" (the owner, 2026-10-06): a neutral candidate is kept about one time in seven, so with three a
      // generation about one generation in three keeps a change on noise (19 of 60 measured), where a rule that followed the coin would keep
      // one nearly every generation. (Under the old z-test: 5 or fewer.)
      expect(st.fighters.Firey.accepted).toBeLessThanOrEqual(24);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }, 240000);

  it('plays 1v1 only, and in pairs, as the balance pass will ("when running balance, do a 1v1", the owner): the same opponent, seed and side for the champion and every candidate, over a spread of the seven AI classes', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'bot-1v1-'));
    try {
      const jobs = [], inner = fakePool();
      const pool = { async run(job) { jobs.push(job); return inner.run(job); } };
      const st = fresh();
      await generation({ pool, st, cfg: { ...cfg(), looks: [32], cands: 2, bench: 8, counters: false }, info, dir, log: () => {}, embed: false }, 'Firey');
      expect(jobs.length).toBe(3 * 32);                                       // the champion's 32 and two candidates' 32: one look, no benchmark yet (Firey has no playbook)
      expect(jobs.every((j) => j.names.length === 2 && j.pb.length === 2)).toBe(true);
      const bySeed = new Map();
      for (const j of jobs) bySeed.set(j.seed, (bySeed.get(j.seed) || []).concat(j));
      expect(bySeed.size).toBe(32);
      for (const g of bySeed.values()) {
        expect(g).toHaveLength(3);                                            // the champion's arm and each candidate's, on the one seed
        expect(new Set(g.map((j) => j.names.join('|'))).size, 'one opponent, one side').toBe(1);
      }
      expect(new Set(jobs.map((j) => j.names.indexOf('Firey'))), 'Firey takes both spawn sides').toEqual(new Set([0, 1]));
      const classes = new Set(jobs.map((j) => info.roster.find((r) => r.name === j.names.find((n) => n !== 'Firey')).cls));
      expect(classes.size, 'opponents from all seven AI classes').toBe(7);
      // and the benchmark against today's bot is a 1v1 too: the fighter against its own legacy self
      st.fighters.Firey.v = { mJb: -0.5 };
      jobs.length = 0;
      await generation({ pool, st, cfg: { ...cfg(), looks: [4], cands: 1, bench: 8, benchEvery: 1, counters: false }, info, dir, log: () => {}, embed: false }, 'Firey');
      const bench = jobs.filter((j) => j.names[0] === 'Firey' && j.names[1] === 'Firey');
      expect(bench).toHaveLength(8);
      expect(bench.every((j, i) => (i % 2 ? j.pb[0] === null && j.pb[1] !== null : j.pb[0] !== null && j.pb[1] === null))).toBe(true);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }, 120000);

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
    expect(embedPlaybooks(out, {})).toBe(embedPlaybooks(html, {}));            // replacing is idempotent: an empty set gives the same file from either (the game ships trained playbooks now)
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

  it('plays the three prize fighters too, match after match (the game takes their rows out of ROSTER whenever a match ends with Steve Cobs unbeaten)', async () => {
    for (const [names, seed] of [[['OJ', 'Cabby'], 3], [['Suitcase', 'OJ'], 4], [['Cabby', 'Suitcase'], 5]]) {
      const r = await playMatch({ names, pb: [null, null], seed, stocks: 1, maxFrames: 900 }, true);
      expect([0, 1], names.join(' v ')).toContain(r.winner);
      expect(r.frames).toBeGreaterThan(0);
    }
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

// "ok. when running balance, do a 1v1." (the owner, 2026-10-05) The balance tournament has always taken --heat; at 2 it used to crash on an odd
// field (a round of 51 winners left a one-fighter heat to run). The odd fighter gets a bye now, so the whole roster can be played in 1v1s.
describe('the balance tournament plays the 1v1 pass', () => {
  it('--heat 2 makes every match two fighters and finishes any field, an odd one included (a bye)', () => {
    const script = `import { runTournament } from './scripts/balance-tournament.mjs';
      const out = [];
      for (const field of [['Firey', 'Pen', 'Rocky'], ['Firey', 'Pen', 'Rocky', 'Needle', 'Leafy']]) {
        const r = await runTournament(field, { heatSize: 2, baseSeed: 5, maxFrames: 1200 });
        out.push({ n: field.length, matches: r.matches.length, two: r.matches.every((m) => m.placements.length === 2), champion: field.includes(r.champion) });
      }
      console.log(JSON.stringify(out)); process.exit(0);`;
    const out = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf8', timeout: 240000 }).trim().split('\n').pop());
    expect(out).toEqual([{ n: 3, matches: 2, two: true, champion: true }, { n: 5, matches: 4, two: true, champion: true }]);   // a knockout of n fighters is n - 1 matches
  }, 300000);
});

// ---- the boss harnesses keep today's bot ---------------------------------------------------------------------------------
// "BOSS MEASUREMENTS keep today's bot. The boss harness, boss tests and the stored Boss Rush numbers must not change, so pin them to the
// Easy/legacy AI explicitly." The pin is BOT_PB.legacy: every CPU plays the legacy rules whatever its level, with its level's own handicap
// as before (the harness plays at the default level, Normal, so "legacy" and not "Easy": Easy would drop half its attacks and move the
// stored numbers). The boot the tests and the harnesses share (bootMonolith) sets it, and so do the standalone boss scripts.
describe('the boss harnesses are pinned to the legacy AI', () => {
  const golden311 = () => golden.find((x) => x.seed === 311);              // Firey v Pen at Normal
  const m311 = () => BOT_GOLDEN_MATCHES.find((x) => x.seed === 311);

  it('bootMonolith, which every boss test and harness script boots through, pins the legacy AI and locks the adaptation', () => {
    const w = bootMonolith();
    expect(w.eval('BOT_PB.legacy')).toBe(true);
    expect(w.eval('BOT_ADAPT.locked')).toBe(true);
    expect(loadMonolith(1).window.eval('BOT_PB.legacy'), "the tournament's and the trainer's boot is NOT pinned: they measure the playbooks").toBe(false);
  });

  it('a pinned game plays today\'s match whatever the playbooks say: loud playbooks for everyone, Normal, the golden match to the frame', () => {
    const w = bootMonolith();
    const names = m311().names;
    const r = playBotMatch(w, m311(), loud(names));
    expect(sameAs(r, golden311())).toBe(true);
    w.eval('BOT_PB.legacy = false');                                         // the control: the same match unpinned is another match, so the pin is what held it
    const free = playBotMatch(w, m311(), loud(names));
    expect(sameAs(free, golden311())).toBe(false);
  }, 120000);

  it('boss modes never read a playbook, pinned or not: the bot a boss fight measures is the legacy bot', () => {
    const w = bootMonolith();
    const r = JSON.parse(w.eval(`(function(){
      BOT_PB.legacy = false;
      ${loud(['Firey'])}
      var F = makeFighter(ROSTER.find(function(x){ return x.name === 'Firey'; }), 300, groundY() - 24, 0), T = makeFighter(ROSTER.find(function(x){ return x.name === 'Pen'; }), 500, groundY() - 24, 1);
      var out = {};
      SETTINGS.mode = 'ffa';  out.ffa = !!pbFor(F, T, 2); out.ffaEasy = !!pbFor(F, T, 0);
      SETTINGS.mode = 'boss'; out.boss = !!pbFor(F, T, 2);
      SETTINGS.mode = 'ffa'; F._oneGhost = true; out.ghost = !!pbFor(F, T, 2); F._oneGhost = false;
      BOT_PB.legacy = true; out.pinned = !!pbFor(F, T, 2);
      return JSON.stringify(out);
    })()`));
    expect(r).toEqual({ ffa: true, ffaEasy: false, boss: false, ghost: false, pinned: false });
  });

  it('the harness scripts say so and check it: boss-solo boots through bootMonolith and refuses an unpinned game; the standalone ones pin their own', () => {
    const solo = readFileSync('scripts/boss-solo.mjs', 'utf8');
    expect(solo).toMatch(/import \{ bootMonolith \} from '\.\.\/test\/helpers\/smash-golden\.js'/);
    expect(solo).toMatch(/BOT_PB\.legacy === true && BOT_ADAPT\.locked === true/);
    for (const f of ['scripts/boss-glitch.mjs', 'scripts/solo-rush.mjs']) expect(readFileSync(f, 'utf8'), f).toMatch(/BOT_PB\.legacy = true; BOT_ADAPT\.lock\(\);/);
    for (const f of ['scripts/moves-vs-boss.mjs', 'scripts/boss-multihit.mjs']) expect(readFileSync(f, 'utf8'), `${f} boots through the pinned bootMonolith`).toMatch(/import \{ bootMonolith \} from '\.\.\/test\/helpers\/smash-golden\.js'/);
  });
});
