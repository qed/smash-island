import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from './helpers/prng.js';

// STEVE COBS, the second secret boss: THE UNLOCK CHAIN (his fight itself is test/cobs-fight.test.js). The owner
// (cobs-decisions.md): "Cobs should also be a secret boss ... The way you unlock him should involve vault codes directly,
// beating certain bosses on certain characters, and RUNNING! also winning the world cup as all 2nd place characters in
// ii(taco, knife, and balloon) ... you can only fight him as knife." Their answers: the chain starts "alongside One's, from a
// fresh profile"; the codes are "Both" -- every existing Vault code found first, THEN four new codes that ARE the steps
// ("Typing a code is itself the step"): C0B5 opens the chain, MISTAH PHONE ("accept MISTAHPHONE / MISTER PHONE / MISTA PHONE")
// the boss step, PH3N0M53 VK0CH unlocks RUNNING!, THE FUTURE IS SO YESTERDAY is the door; "Three pairs" -- Knife beats
// MePhone4, Balloon beats Springy, Fan beats MePhone4; the cups are "knife, balloon, taco. no losing, or you have to do it all
// again"; a loss is retried directly; after the win "Anyone", like One; and the prize (the season winners, "3, but only after
// you beat cobs") is another lane's, reading cobsBeaten(). The Vault keeps One's discretion: none of its own words name him.
// NOTHING HERE IS A BAR FOR HIS DIFFICULTY ("dont tune, cuz thats an agent, not a player"): the fight's end is driven by hand.

const HTML = readFileSync('artifacts/V1/index.html', 'utf8');
function boot(seed = {}) {
  const dom = new JSDOM(HTML, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      const grad = { addColorStop() {} };
      window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
        get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 })
          : p === 'canvas' ? { width: 1100, height: 720 }
          : p === 'getImageData' ? () => ({ data: [] })
          : (p === 'createLinearGradient' || p === 'createRadialGradient') ? () => grad : () => {}),
        set: () => true,
      });
      window.Math.random = mulberry32(11);
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
      for (const [k, v] of Object.entries(seed)) window.localStorage.setItem(k, v);
    },
  });
  return dom.window;
}
const sleep = (w, ms) => new Promise((r) => w.setTimeout(r, ms));
const stored = (w) => JSON.parse(w.localStorage.getItem('profile:v1'));
const J = JSON.stringify;

// A clean profile in the same window (one-unlock-chain's helper, with his fight's state reset too).
async function fresh(w, js = '') {
  await sleep(w, 0);
  w.localStorage.clear();
  w.eval(`PROFILE = freshProfile(); PROFILE.fighterStatsSeeded = true; PROFILE_STORAGE_OK = true;
    PENDING_ERASED.length = 0; PENDING_ALONE = false; PENDING_UNLOCKS.length = 0; clearTimeout(ONE_MOON_TIMER);
    running = false; paused = false; BOSSRUSH.active = false; TOURNEY = { active:false }; PENDING_TOURNEY = null;
    CUSTOM_LEVEL = null; TESTMODE.active = false; TUT.active = false; DAILY_ACTIVE = false; PENDING_DAILY = null;
    ONEFIGHT.retry = null; if(ONEFIGHT.active) oneFightRestore(); COBSFIGHT.retry = null; if(COBSFIGHT.active) cobsFightRestore();
    LOCAL_PLAYERS = 1; delete window.startRunningRace; window.__raceOpts = null;
    SETTINGS.mode = 'ffa'; SETTINGS.count = 2; SETTINGS.stocks = 3; SETTINGS.itemRate = 0; SETTINGS.bossPick = 'rush';
    chosen = ROSTER.find(function(r){ return r.name==='Firey'; });
    ${js}`);
}
// The owner's codes, pinned by hand, each with every spelling it must take (the wire's lookalikes: "PHENOM53 VKOCH-style").
const CODES = {
  1: ['C0B5', 'C085', 'c0b5', 'C-0B5', 'c 0 b 5', 'C-085'],
  2: ['MISTAH PHONE', 'MISTAHPHONE', 'MISTER PHONE', 'MISTA PHONE', 'Mistah Phone!', 'mistah phone', 'mister-phone'],
  3: ['PH3N0M53 VK0CH', 'PH3N0M53VK0CH', 'PH3N0M53 VK0cH', 'PHENOM53 VKOCH', 'PH3NOM53 VK0CH', 'PHEN0M53 VK0CH', 'PH3N0MS3 VK0CH', 'PHENOMSE VKOCH', 'Model PH3N0M53 VK0cH'],
  4: ['THE FUTURE IS SO YESTERDAY', 'The future is so yesterday!', 'THEFUTUREISSOYESTERDAY', 'where the future is so yesterday', 'future is so yesterday'],
};
const WRONG = "Aw, seriously? That code doesn't do anything.";
const TICK = 'Tick, tock.';
const LINE = "You haven't found every code yet.";
// Every existing Vault code in: the gate ("Both").
const ALL_EXISTING = `for(const v of VAULT.fighters.concat(VAULT.hints)) vaultSubmit(v.code);`;
const sub = (w, s) => w.eval(`vaultSubmit(${J(s)})`);
// One boss felled, the way bossRushCheck reports it: `fighters` on the stage, awardBossCleared(name).
const kill = (w, you, boss, extra = '') => w.eval(`fighters = [${J(you)}, { name:'Leafy', team:0 }]; awardBossCleared(${J(boss)}); ${extra} (PROFILE.bossKills[${J(boss)}] || []).slice()`);
// One World Cup won in Normal mode, the way advanceKnockout awards it: your side is the champion.
const cup = (w, lead, mode = 'normal') => w.eval(`TOURNEY = { active:true, mode:${J(mode)}, myTeam:{ name:'Mine', members:[ROSTER.find(function(r){ return r.name===${J(lead)}; })] }, eliminated:false, awarded:false };
  awardWorldCup(TOURNEY.myTeam); cobsQ().cups.slice()`);
const lost = (w) => w.eval(`TOURNEY = { active:true, mode:'normal', myTeam:{ name:'Mine', members:[] }, eliminated:true }; cobsCupLost(); cobsQ().cups.slice()`);
// Everything but the door: the gate, his first three codes, the pairs, the race and the cups.
const PAIRS = `PROFILE.bossKills = { MePhone4:['Knife','Fan'], Springy:['Balloon'] };`;
async function arm(w) {
  await fresh(w, ALL_EXISTING);
  sub(w, 'C0B5'); sub(w, 'MISTAH PHONE'); sub(w, 'PH3N0M53 VK0CH');
  w.eval(`${PAIRS} cobsRaceWon(); PROFILE.cobs.cups = ['Knife', 'Balloon', 'Taco (II)'];`);
}

let W;
beforeAll(async () => { W = boot(); await W.eval('profileReady'); });

describe('the codes ("directly", "Both")', () => {
  it('his four codes, in every spelling, are steps of his own -- in their own map, colliding with none of the Vault\'s, and never his name', () => {
    const r = W.eval(`(function(){
      var out = { steps:{}, inVault:[], size:VAULT_CODES.size, look:cobsWireLookalikes("PH3N0M53 VK0CH").length, plain:[] };
      ${J(Object.values(CODES).flat())}.forEach(function(s){ var k = vaultNorm(s), c = COBS_CODES.get(k); out.steps[s] = c ? c.step : null; if(VAULT_CODES.has(k)) out.inVault.push(s); });
      ['COBS','STEVE COBS','MEEPLE','TICK TOCK',"I DON'T REMEMBER IT BLINKING",'C0B','C0B55','MISTAH','PHONE','THE FUTURE'].forEach(function(s){ if(COBS_CODES.get(vaultNorm(s)) || VAULT_CODES.get(vaultNorm(s))) out.plain.push(s); });
      var collide = []; COBS_CODES.forEach(function(v, k){ if(VAULT_CODES.has(k)) collide.push(k); });
      out.collide = collide; out.codes = COBS_VAULT.steps.map(function(s){ return s.code; }); out.nums = COBS_VAULT.steps.map(function(s){ return s.step; });
      return out; })()`);
    for (const [step, spellings] of Object.entries(CODES)) for (const s of spellings) expect(r.steps[s], s).toBe(+step);
    expect(r.inVault, 'none is one of the Vault\'s own codes').toEqual([]);
    expect(r.collide).toEqual([]);
    expect(r.plain, 'his name, TICK TOCK and the dropped fourth code open nothing').toEqual([]);
    expect(r.look, 'every reading of the wire\'s digits as letters (3/E, 0/O, 5/S)').toBe(31);
    expect(r.codes).toEqual(['C0B5', 'MISTAH PHONE', 'PH3N0M53 VK0CH', 'THE FUTURE IS SO YESTERDAY']);
    expect(r.nums).toEqual([1, 2, 3, 4]);
    // The Vault's own map holds exactly what it did (test/vault.test.js pins its size): his codes are not in it.
    expect(r.size).toBe(W.eval(`(function(){ var n = 0, seen = {}; VAULT.fighters.concat(VAULT.hints).forEach(function(v){ [v.code].concat(v.accepts||[]).forEach(function(s){ var k = vaultNorm(s); if(!seen[k]){ seen[k] = 1; n++; } }); }); return n; })()`));
  });

  it('"all existing codes first": every one of his codes is just wrong until the eleven fighters\' and One\'s four are all in; then C0B5 opens the chain', async () => {
    await fresh(W);
    for (const s of Object.values(CODES).flat()) { const r = sub(W, s); expect(r.kind, s).toBe('wrong'); expect(r.reply, s).toBe(WRONG); }
    expect(W.eval('({ stage:cobsQ().stage, gate:cobsGateOpen(), live:cobsChainLive() })')).toEqual({ stage: 0, gate: false, live: false });
    // Every code but one in: still shut, whichever is missing.
    W.eval(`for(const v of VAULT.fighters.concat(VAULT.hints)) if(v.code!=='OMGA') vaultSubmit(v.code);`);
    expect(sub(W, 'C0B5')).toEqual({ kind: 'wrong', reply: WRONG });
    expect(W.eval('cobsGateOpen()')).toBe(false);
    W.eval(`vaultSubmit('OMGA')`);
    expect(W.eval('cobsGateOpen()')).toBe(true);
    // The second code before the first: nothing (the chain is not open, so nothing gives it away).
    expect(sub(W, 'MISTAH PHONE')).toEqual({ kind: 'wrong', reply: WRONG });
    const r = sub(W, 'C085');
    expect(r.kind).toBe('hint'); expect(r.step).toBe(1); expect(r.reply).toBe('★ Static on the line: step 1.');
    expect(r.text).toContain('the name his toilet called him by');
    expect(W.eval('({ stage:cobsQ().stage, live:cobsChainLive(), found:vaultFound("C0B5") })')).toEqual({ stage: 1, live: true, found: true });
    await sleep(W, 0);
    expect(stored(W).cobs.stage, 'saved at the deed').toBe(1);
    expect(stored(W).vault.found).toContain('C0B5');
  });

  it('a wrong code while his chain is live answers "Tick, tock."; before it, and once he is beaten, a wrong code is as wrong as ever', async () => {
    await fresh(W, ALL_EXISTING);
    expect(sub(W, 'hey guys')).toEqual({ kind: 'wrong', reply: WRONG });
    sub(W, 'C0B5');
    for (const s of ['hey guys', 'ONE', 'nope', 'STEVE COBS', 'TICK TOCK', "I don't remember it blinking"]) expect(sub(W, s), s).toEqual({ kind: 'wrong', reply: TICK });
    expect(sub(W, '!!!'), 'a guess with no letter in it').toEqual({ kind: 'wrong', reply: TICK });
    expect(sub(W, '').kind, 'a blank box is still blank').toBe('empty');
    expect(sub(W, 'yoyle cake').kind, 'a found fighter code is still "again"').toBe('again');
    expect(sub(W, 'all for one').kind, 'so is a found whisper').toBe('again');
    expect(W.eval(`PROFILE.cobs.stage = COBS_STAGE.FREE; PROFILE.cobs.beaten = true; vaultSubmit('nope')`)).toEqual({ kind: 'wrong', reply: WRONG });
  });

  it('MISTAH PHONE and PH3N0M53 VK0CH, each spelling once the chain is open; typed again, "already heard"; the door is "Tick, tock." until the deeds are done', async () => {
    await fresh(W, ALL_EXISTING);
    sub(W, 'C0B5');
    const r2 = sub(W, 'MISTER PHONE');
    expect(r2).toMatchObject({ kind: 'hint', step: 2, reply: '★ Static on the line: step 2.' });
    expect(r2.text).toContain('the blade fells the phone that made him');
    expect(r2.text).toContain('the balloon fells the spring that sits in my old seat');
    expect(r2.text).toContain('the fan fells the phone with his egg inside');
    expect(r2.text).toContain('the model number off my wire');
    for (const s of CODES[2]) expect(sub(W, s), s).toMatchObject({ kind: 'again', step: 2, reply: 'You already heard that: step 2.' });
    const r3 = sub(W, 'PHENOM53 VKOCH');
    expect(r3).toMatchObject({ kind: 'hint', step: 3, reply: '★ Static on the line: step 3.' });
    expect(r3.text).toContain('run its lane as the blade');
    expect(r3.text).toContain('the line behind you never stops');
    expect(r3.text).toContain('the marshmallow goes over the last gap on the hook before you cross');
    expect(r3.text).toContain('the cup the whole world fights for, three times, as the three who came second: the blade, then the balloon, then the taco, with no loss between');
    expect(r3.text).toContain("It's written over my door");
    for (const s of CODES[3]) expect(sub(W, s), s).toMatchObject({ kind: 'again', step: 3 });
    for (const s of CODES[4]) expect(sub(W, s), `${s}: the door before its time`).toEqual({ kind: 'wrong', reply: TICK });
    expect(W.eval('({ stage:cobsQ().stage, s2:cobsStep(2), s3:cobsStep(3), s4:cobsStep(4), pairs:cobsPairsStepDone(), race:cobsRaceOpen() })'))
      .toEqual({ stage: 1, s2: true, s3: true, s4: false, pairs: false, race: true });
    // The screen: his heading and his rows, in step order, in a section of their own; One's rows untouched.
    W.eval('openVault()');
    expect(W.document.getElementById('vaultWireHead').textContent).toBe('Static on the line');
    expect([...W.document.querySelectorAll('#vaultWire .vstep')].map((s) => s.textContent)).toEqual(['1', '2', '3']);
    expect([...W.document.querySelectorAll('#vaultHints .vstep')].map((s) => s.textContent), 'One\'s four, as before').toEqual(['1', '2', '3', '4']);
    expect(W.document.getElementById('vaultCluesHead').textContent).toBe('Whispers through the crack');
    expect(W.document.getElementById('vaultMissing').textContent, 'his codes count as codes: the line stays while one is out').toBe(LINE);
    W.eval(`go('title')`);
  });

  it('the second code and the third can come in either order, and the third before the second still opens the race', async () => {
    await fresh(W, ALL_EXISTING);
    sub(W, 'C0B5');
    expect(sub(W, 'PH3N0M53 VK0CH')).toMatchObject({ kind: 'hint', step: 3 });
    expect(W.eval('cobsRaceOpen()')).toBe(true);
    expect(sub(W, 'MISTA PHONE')).toMatchObject({ kind: 'hint', step: 2 });
    expect(W.eval('openVault(); [].slice.call(document.querySelectorAll("#vaultWire .vstep")).map(function(s){ return s.textContent; })'), 'shown in step order').toEqual(['1', '2', '3']);
    W.eval(`go('title')`);
  });
});

describe('the boss pairs ("Three pairs")', () => {
  it('awardBossCleared records WHICH fighter in your hands felled each boss -- standing, solo or not -- and never an AI or a fallen one', async () => {
    await fresh(W);
    expect(kill(W, { name: 'Knife', you: true, team: 0 }, 'MePhone4')).toEqual(['Knife']);
    expect(kill(W, { name: 'Knife', you: true, team: 0 }, 'MePhone4'), 'once per fighter').toEqual(['Knife']);
    expect(kill(W, { name: 'Fan', you: true, team: 0 }, 'MePhone4')).toEqual(['Knife', 'Fan']);
    expect(kill(W, { name: 'Balloon', you: false, team: 0 }, 'Springy'), 'an AI Balloon is not your Balloon').toEqual([]);
    expect(kill(W, { name: 'Balloon', you: true, team: 0, dead: true }, 'Springy'), 'a Balloon out of stocks did not beat him').toEqual([]);
    expect(kill(W, { name: 'Balloon', you: true, team: 0 }, 'Springy')).toEqual(['Balloon']);
    expect(W.eval('({ cleared:Object.keys(PROFILE.bossesCleared).sort(), one:PROFILE.one.stage })'), 'the old record and One\'s chain are as they were').toEqual({ cleared: ['MePhone4', 'Springy'], one: 0 });
    await sleep(W, 0);
    expect(stored(W).bossKills, 'saved at the deed').toEqual({ MePhone4: ['Knife', 'Fan'], Springy: ['Balloon'] });
  });

  it('the step is done when Knife has beaten MePhone4, Balloon has beaten Springy and Fan has beaten MePhone4 -- any order, any time, records from before the code count', async () => {
    await fresh(W, ALL_EXISTING);
    const done = () => W.eval('({ pairs:cobsPairsDone(), step:cobsPairsStepDone() })');
    expect(done()).toEqual({ pairs: false, step: false });
    kill(W, { name: 'Fan', you: true, team: 0 }, 'MePhone4');
    kill(W, { name: 'Balloon', you: true, team: 0 }, 'Springy');
    expect(done(), 'two of three').toEqual({ pairs: false, step: false });
    kill(W, { name: 'Knife', you: true, team: 0 }, 'Springy');
    kill(W, { name: 'Balloon', you: true, team: 0 }, 'MePhone4');
    expect(done(), 'the wrong pairings do not count').toEqual({ pairs: false, step: false });
    kill(W, { name: 'Knife', you: true, team: 0 }, 'MePhone4');
    expect(done(), 'the three pairs are in, made before the code was typed').toEqual({ pairs: true, step: false });
    sub(W, 'C0B5'); sub(W, 'MISTAH PHONE');
    expect(done(), '...and the code completes the step').toEqual({ pairs: true, step: true });
    expect(W.eval('COBS_PAIRS')).toEqual([['Knife', 'MePhone4'], ['Balloon', 'Springy'], ['Fan', 'MePhone4']]);
    expect(W.eval(`BOSS_ROSTER.filter(function(b){ return b.name==='MePhone4' || b.name==='Springy'; }).length`), 'both bosses are in the gauntlet to be felled').toBe(2);
  });
});

describe('RUNNING!', () => {
  it('the step opens with the third code, calls startRunningRace({ onEnd }) from the Vault\'s Run button, and completes on a win as Knife', async () => {
    await fresh(W, ALL_EXISTING);
    sub(W, 'C0B5'); sub(W, 'MISTAH PHONE');
    expect(W.eval('({ open:cobsRaceOpen(), avail:cobsRaceAvailable(), start:cobsStartRace() })'), 'no code, no race').toEqual({ open: false, avail: false, start: false });
    sub(W, 'PH3N0M53 VK0CH');
    // The race lane's mode is not in this build yet: the step is open but has no door, and the Vault shows no button.
    expect(W.eval('({ open:cobsRaceOpen(), avail:cobsRaceAvailable(), start:cobsStartRace() })')).toEqual({ open: true, avail: false, start: false });
    W.eval('openVault()');
    expect(W.document.getElementById('cobsRunBtn')).toBe(null);
    // The lane merged (stubbed): the button appears, and pressing it starts the race with the chain's onEnd.
    W.eval(`window.startRunningRace = function(o){ window.__raceOpts = o; return true; }; buildVault();`);
    const btn = W.document.getElementById('cobsRunBtn');
    expect(btn && btn.textContent).toBe('Run ▶');
    btn.onclick();
    expect(W.eval('!!window.__raceOpts && typeof window.__raceOpts.onEnd')).toBe('function');
    expect(W.eval(`window.__raceOpts.onEnd(false); cobsQ().race`), 'a lost race is just a race').toBe(false);
    expect(W.eval(`fighters = [{ name:'Firey', you:true, team:0 }]; window.__raceOpts.onEnd(true); cobsQ().race`), 'won as anyone but Knife: no step').toBe(false);
    expect(W.eval(`fighters = [{ name:'Knife', you:true, team:0 }]; window.__raceOpts.onEnd(true); cobsQ().race`)).toBe(true);
    expect(W.eval(`window.__raceOpts.onEnd(true); cobsRaceWon()`), 'once').toBe(false);
    W.eval('buildVault()');
    expect(W.document.getElementById('cobsRunBtn'), 'the button goes with the step').toBe(null);
    expect(W.eval('cobsRaceOpen()')).toBe(false);
    await sleep(W, 0);
    expect(stored(W).cobs.race, 'saved at the deed').toBe(true);
    W.eval(`delete window.startRunningRace; go('title')`);
  });
});

describe('the three World Cups ("knife, balloon, taco. no losing, or you have to do it all again")', () => {
  it('the sequence: a cup as Knife starts it, Balloon then Taco (II) follow; a loss, or a cup as anyone else in between, empties it; a finished run stays', async () => {
    await fresh(W);
    expect(W.eval('COBS_CUP_ORDER')).toEqual(['Knife', 'Balloon', 'Taco (II)']);
    expect(cup(W, 'Balloon'), 'not Knife first: nothing').toEqual([]);
    expect(cup(W, 'Knife')).toEqual(['Knife']);
    expect(cup(W, 'Taco (II)'), 'Taco before Balloon: all again').toEqual([]);
    expect(cup(W, 'Knife')).toEqual(['Knife']);
    expect(cup(W, 'Balloon')).toEqual(['Knife', 'Balloon']);
    expect(cup(W, 'Firey'), 'anyone else in between: all again').toEqual([]);
    expect(cup(W, 'Knife')).toEqual(['Knife']);
    expect(cup(W, 'Knife'), 'Knife again is a fresh start, not a loss').toEqual(['Knife']);
    expect(cup(W, 'Balloon')).toEqual(['Knife', 'Balloon']);
    expect(lost(W), 'a lost cup: all again').toEqual([]);
    expect(W.eval('({ done:cobsCupsDone(), wc:PROFILE.wcTitles, one:PROFILE.one.stage })'), 'the cup count and One\'s chain are as they were').toEqual({ done: false, wc: 9, one: 0 });
    expect(cup(W, 'Knife', 'spectate'), 'a spectated cup is nobody\'s win').toEqual([]);
    expect(cup(W, 'Knife')).toEqual(['Knife']);
    expect(cup(W, 'Balloon')).toEqual(['Knife', 'Balloon']);
    expect(cup(W, 'Taco (II)')).toEqual(['Knife', 'Balloon', 'Taco (II)']);
    expect(W.eval('cobsCupsDone()')).toBe(true);
    await sleep(W, 0);
    expect(stored(W).cobs.cups, 'saved at the deed').toEqual(['Knife', 'Balloon', 'Taco (II)']);
    expect(lost(W), 'a finished run is never emptied').toEqual(['Knife', 'Balloon', 'Taco (II)']);
    expect(cup(W, 'Firey')).toEqual(['Knife', 'Balloon', 'Taco (II)']);
  });

  it('is hooked where a cup is won and where a Normal-mode cup is lost -- out in the group stage, beaten in the knockout, and a final lost on the spot', () => {
    const src = W.eval('({ won:String(awardWorldCup), sim:String(simRestOfRound), group:String(proceedAfterRound), adv:String(advanceKnockout) })');
    expect(src.won).toMatch(/cobsCupWon\(\)/);
    expect(src.sim).toMatch(/TOURNEY\.eliminated=true;\s*try\{ cobsCupLost\(\); \}/);
    expect(src.group).toMatch(/eliminated in the group stage\.", 2000\);\s*try\{ cobsCupLost\(\); \}/);
    expect(src.adv, 'the final you played goes finishWatchedKnockout -> advanceKnockout, never through simRestOfRound').toMatch(/TOURNEY\.champion!==TOURNEY\.myTeam\)\{ try\{ cobsCupLost\(\); \}/);
    // ...and cobsCupLost only ever empties YOUR unfinished run in Normal mode.
    expect(W.eval(`PROFILE.cobs.cups = ['Knife']; TOURNEY = { active:true, mode:'spectate', myTeam:null }; cobsCupLost(); cobsQ().cups`)).toEqual(['Knife']);
    expect(W.eval(`TOURNEY = { active:true, mode:'normal', myTeam:{ members:[] } }; cobsCupLost(); cobsQ().cups`)).toEqual([]);
  });

  it('the final, through the real knockout flow: lost as Taco (II) with two cups in hand, all again; won, the run is finished', async () => {
    await fresh(W);
    // Your final, the way the game plays it: one fixture left in the knockout, you in it, finishWatchedKnockout crowning it on the
    // spot (the flow One's Moon relies on), with no "Sim & Continue" in between.
    const FINAL = (winTeam) => W.eval(`(function(){
      var mine = { name:'Mine', members:[ROSTER.find(function(r){ return r.name==='Taco (II)'; })] }, them = { name:'Them', members:[ROSTER.find(function(r){ return r.name==='Firey'; })] };
      var fx = { kind:'ko', a:mine, b:them, played:false, result:null };
      TOURNEY = { active:true, mode:'normal', myTeam:mine, eliminated:false, awarded:false, stage:'knockout', bracket:[[fx]], knockoutRound:0, fixtures:[fx], fxIndex:0, round:0 };
      fighters = [{ name:'Taco (II)', you:true, team:0 }, { name:'Firey', you:false, team:1 }];
      var wc = PROFILE.wcTitles;
      finishWatchedKnockout(fx, ${winTeam});
      return { cups:cobsQ().cups.slice(), champ:TOURNEY.champion && TOURNEY.champion.name, stage:TOURNEY.stage, won:PROFILE.wcTitles - wc };
    })()`);
    W.eval(`PROFILE.cobs.cups = ['Knife', 'Balloon'];`);
    expect(FINAL(1), 'the final lost: decided here, not at an eliminated site, and the run empties').toEqual({ cups: [], champ: 'Them', stage: 'done', won: 0 });
    W.eval(`PROFILE.cobs.cups = ['Knife', 'Balloon'];`);
    expect(FINAL(0), 'the final won as Taco (II): the third cup').toEqual({ cups: ['Knife', 'Balloon', 'Taco (II)'], champ: 'Mine', stage: 'done', won: 1 });
    expect(FINAL(1), 'a finished run is never emptied, even by a lost final').toMatchObject({ cups: ['Knife', 'Balloon', 'Taco (II)'], champ: 'Them' });
    await sleep(W, 0);
    expect(stored(W).cobs.cups).toEqual(['Knife', 'Balloon', 'Taco (II)']);
    W.eval(`TOURNEY = { active:false }; go('title')`);
  });
});

describe('the door (THE FUTURE IS SO YESTERDAY)', () => {
  it('opens only when the codes, the pairs, the race and the three cups are ALL done; then his card takes the Daily card\'s place, and the title keeps its six buttons', async () => {
    // Everything done but one thing at a time: the door stays shut with "Tick, tock." each time.
    const missing = {
      'the boss code': `vaultState().found = vaultState().found.filter(function(c){ return c!=='MISTAH PHONE'; });`,
      'the race code': `vaultState().found = vaultState().found.filter(function(c){ return c!=='PH3N0M53 VK0CH'; });`,
      'a pair': `PROFILE.bossKills = { MePhone4:['Knife'], Springy:['Balloon'] };`,
      'the race': `PROFILE.cobs.race = false;`,
      'a cup': `PROFILE.cobs.cups = ['Knife', 'Balloon'];`,
    };
    for (const [what, js] of Object.entries(missing)) {
      await arm(W);
      W.eval(js);
      expect(W.eval('cobsDoorReady()'), what).toBe(false);
      for (const s of CODES[4]) expect(sub(W, s), `${s} with ${what} missing`).toEqual({ kind: 'wrong', reply: TICK });
      expect(W.eval('cobsQ().stage'), what).toBe(1);
      W.eval(`go('title')`);
      expect(W.document.getElementById('cobsEntry'), `no card while ${what} is missing`).toBe(null);
    }
    await arm(W);
    expect(W.eval('cobsDoorReady()')).toBe(true);
    W.eval(`go('title')`);
    expect(W.document.getElementById('cobsEntry'), 'not before the door').toBe(null);
    expect(/DAILY/.test(W.document.getElementById('dailyCard').textContent), 'the Daily has its place until then').toBe(true);
    const r = sub(W, 'The future is so yesterday!');
    expect(r).toMatchObject({ kind: 'hint', step: 4, reply: '★ Static on the line: step 4.' });
    expect(r.text).toBe("Welcome. The door is open, and I've kept a seat for the blade. Look to the title.");
    expect(W.eval('({ stage:cobsQ().stage, live:cobsChainLive(), beaten:cobsBeaten() })')).toEqual({ stage: 2, live: true, beaten: false });
    await sleep(W, 0);
    expect(stored(W).cobs.stage).toBe(2);
    W.eval(`go('title')`);
    const card = W.document.getElementById('dailyCard');
    const b = W.document.getElementById('cobsEntry');
    expect(b && b.closest('#dailyCard') === card, 'his card, in the Daily card\'s place').toBe(true);
    expect(card.textContent).toMatch(/STEVE COBS IS WAITING/);
    expect(card.textContent).toMatch(/Knife  vs  Steve Cobs · 2500 HP/);
    expect(card.textContent).not.toMatch(/DAILY/);
    expect(b.textContent).toBe('Face Cobs ▶');
    expect([...W.document.querySelectorAll('#title button')].filter((x) => !x.closest('#dailyCard')).length, 'six buttons, plus the one on the card').toBeLessThanOrEqual(6);
    expect(W.document.querySelectorAll('#dailyCard button').length).toBe(1);
    // The Vault: every code in at last, so the "not every code" line has gone; One's rows are still hers.
    W.eval('openVault()');
    expect(W.document.getElementById('vaultMissing').hidden).toBe(true);
    expect([...W.document.querySelectorAll('#vaultWire .vstep')].map((s) => s.textContent)).toEqual(['1', '2', '3', '4']);
    expect([...W.document.querySelectorAll('#vaultHints .vstep')].map((s) => s.textContent)).toEqual(['1', '2', '3', '4']);
    W.eval(`go('title')`);
  });

  it('One\'s card comes first when both are pending ("alongside One\'s": her chain came first), and his once she is beaten', async () => {
    await arm(W);
    sub(W, 'THE FUTURE IS SO YESTERDAY');
    W.eval(`PROFILE.one.stage = ONE_STAGE.CHALLENGE; go('title')`);
    expect(W.eval(`({ one:!!document.getElementById('oneEntry'), cobs:!!document.getElementById('cobsEntry'), n:document.querySelectorAll('#dailyCard button').length })`)).toEqual({ one: true, cobs: false, n: 1 });
    W.eval(`PROFILE.one.stage = ONE_STAGE.FREE; go('title')`);
    expect(W.eval(`({ one:!!document.getElementById('oneEntry'), cobs:!!document.getElementById('cobsEntry'), n:document.querySelectorAll('#dailyCard button').length })`)).toEqual({ one: false, cobs: true, n: 1 });
    W.eval(`PROFILE.one.stage = 0; go('title')`);
  });
});

describe('the fight, and Steve Cobs for good', () => {
  it('the card starts his fight as Knife alone whoever is picked; a loss keeps his card and a Rematch that fights him again ("retry directly")', async () => {
    await arm(W);
    sub(W, 'THE FUTURE IS SO YESTERDAY');
    W.eval(`chosen = ROSTER.find(function(r){ return r.name==='Firey'; }); go('title'); document.getElementById('cobsEntry').click();`);
    const f = W.eval(`({ active:COBSFIGHT.active, story:COBSFIGHT.story, names:fighters.map(function(x){ return x.name; }), you:fighters[0].controller,
      hp:summons.find(function(o){ return o._cobsFight; }).hp, mult:summons.find(function(o){ return o._cobsFight; })._dmgTakenMult, stocks:fighters[0].stocks, rush:BOSSRUSH.active, one:ONEFIGHT.active, mode:SETTINGS.mode })`);
    expect(f).toEqual({ active: true, story: true, names: ['Knife'], you: 'local', hp: 2500, mult: 1, stocks: 3, rush: false, one: false, mode: 'boss' });
    // The loss: his result screen, whose Rematch is Knife against him from the top; the chain stands where it was.
    const l = W.eval(`(function(){ endCobsFight(false); var out = { retry:COBSFIGHT.retry && COBSFIGHT.retry.lineup.slice(), stage:cobsQ().stage, beaten:cobsBeaten(), title:document.getElementById('resultTitle').textContent };
      go('result'); startMatch(); out.rematch = { active:COBSFIGHT.active, story:COBSFIGHT.story, names:fighters.map(function(x){ return x.name; }), hp:summons.find(function(o){ return o._cobsFight; }).hp }; return out; })()`);
    expect(l.retry).toEqual(['Knife']);
    expect([l.stage, l.beaten]).toEqual([2, false]);
    expect(l.title).toBe('Steve Cobs wins');
    expect(l.rematch).toEqual({ active: true, story: true, names: ['Knife'], hp: 2500 });
    await sleep(W, 950);
    W.eval(`go('title')`);
    expect(W.document.getElementById('cobsEntry'), 'his card is still there').not.toBe(null);
    expect(W.eval('chosen.name'), 'the player\'s own pick is back').toBe('Firey');
  });

  it('the win: stage FREE, the prize flag cobsBeaten(), the note says where he lives now, the Daily is back, and Boss Rush ▸ Steve Cobs takes any fighter with allies', async () => {
    await arm(W);
    sub(W, 'THE FUTURE IS SO YESTERDAY');
    W.eval(`go('title'); document.getElementById('cobsEntry').click();`);
    const r = W.eval(`COBSFIGHT.won = true; COBSFIGHT.frames = 60*95; running = true; cobsFightCheck();
      ({ stage:PROFILE.cobs.stage, beaten:PROFILE.cobs.beaten, fn:cobsBeaten(), wins:PROFILE.cobs.wins, best:PROFILE.cobs.bestSecs, live:cobsChainLive(),
         note:document.getElementById('unlockNote').textContent, title:document.getElementById('resultTitle').textContent, one:PROFILE.one.stage })`);
    expect(r).toMatchObject({ stage: 3, beaten: true, fn: true, wins: 1, best: 95, live: false, one: 0 });
    expect(r.title).toBe('Steve Cobs is beaten!');
    expect(r.note).toMatch(/^★ STEVE COBS UNLOCKED!/);
    expect(r.note, 'and where to find him: under Boss Rush, beside One').toMatch(/Boss Rush ▸ 🌽 Steve Cobs\.$/);
    await sleep(W, 950);
    expect(stored(W).cobs).toMatchObject({ stage: 3, beaten: true, wins: 1, bestSecs: 95 });
    W.eval(`go('title')`);
    await sleep(W, 0);   // the Daily card renders after its result has been read back
    expect(W.eval(`({ entry:!!document.getElementById('cobsEntry'), daily:/DAILY/.test(document.getElementById('dailyCard').textContent) })`), 'the title is everyone\'s title again').toEqual({ entry: false, daily: true });
    // "Anyone": the select screen, on Boss Rush with him picked -- his button shows, One's does not (she is not beaten here).
    const s = W.eval(`(function(){
      go('select'); document.querySelector('#segMode button[data-v="boss"]').click();
      var row = document.getElementById('bossPickRow').style.display;
      var oneBtn = document.querySelector('#segBossPick button[data-v="one"]').style.display, cobsBtn = document.querySelector('#segBossPick button[data-v="cobs"]').style.display;
      document.querySelector('#segBossPick button[data-v="cobs"]').click();
      var on = document.querySelector('#segBossPick button.on');
      var out = { row:row, oneBtn:oneBtn, cobsBtn:cobsBtn, pick:SETTINGS.bossPick, on:on && on.dataset.v, summary:document.getElementById('matchSummary').textContent, wanted:cobsWanted() };
      chosen = ROSTER.find(function(r){ return r.name==='Pen'; }); SETTINGS.count = 3; startMatch();
      var c = summons.find(function(o){ return o._cobsFight; });
      out.fight = { active:COBSFIGHT.active, story:COBSFIGHT.story, lineup:COBSFIGHT.lineup.slice(), n:fighters.length, rush:BOSSRUSH.active, one:ONEFIGHT.active, mult:c._dmgTakenMult, max:c.maxHp };
      return out; })()`);
    expect([s.row, s.oneBtn, s.cobsBtn]).toEqual(['flex', 'none', '']);
    expect([s.pick, s.on, s.wanted]).toEqual(['cobs', 'cobs', true]);
    expect(s.summary).toMatch(/vs Steve Cobs \(2500 HP\)/);
    expect(s.fight).toMatchObject({ active: true, story: false, n: 3, rush: false, one: false, max: 2500 });
    expect(s.fight.lineup[0], '"Anyone": the fighter you picked').toBe('Pen');
    expect(s.fight.mult).toBeCloseTo(1 / 2.2, 6);
    const again = W.eval(`COBSFIGHT.won = true; COBSFIGHT.frames = 60*80; running = true; cobsFightCheck(); ({ wins:PROFILE.cobs.wins, best:PROFILE.cobs.bestSecs, note:document.getElementById('unlockNote').textContent })`);
    expect(again).toMatchObject({ wins: 2, best: 80 });
    expect(again.note).toMatch(/Steve Cobs beaten 2 times · best 1:20/);
    await sleep(W, 950);
    // Local play only, and before he is beaten the pick does not exist.
    expect(W.eval(`SETTINGS.mode = 'boss'; SETTINGS.bossPick = 'cobs'; NET.role = 'host'; var w1 = cobsWanted(); NET.role = 'solo'; w1`)).toBe(false);
    expect(W.eval(`PROFILE.cobs.stage = 2; PROFILE.cobs.beaten = false; go('select'); ({ wanted:cobsWanted(), row:document.getElementById('bossPickRow').style.display, key:bossPickKey() })`)).toEqual({ wanted: false, row: 'none', key: 'rush' });
    W.eval(`SETTINGS.bossPick = 'rush'; go('title')`);
  });

  it('the hook for the hidden fighters is where the roster decides what is unlocked, and nothing of them is built here', () => {
    const src = W.eval('String(isUnlocked)');
    expect(src).toMatch(/cobsBeaten\(\)/);
    expect(src).toMatch(/OJ, Suitcase and Cabby/);
    expect(W.eval(`ROSTER.filter(function(r){ return /^(OJ|Suitcase|Cabby)$/.test(r.name); }).length`), 'no such fighter in this lane').toBe(0);
    expect(W.eval(`typeof cobsBeaten`)).toBe('function');
  });
});

describe('the profile: reload and two tabs', () => {
  it('merges upward -- stage, wins and the flags by max/OR, the cups by the longer run, the kills by union -- and copes with saves that have none of it', () => {
    const m = W.eval(`JSON.stringify(mergeProfiles(
      { cobs:{ stage:2, cups:['Knife'], race:false, beaten:false, wins:0, bestSecs:0 }, bossKills:{ MePhone4:['Knife'] }, one:{ stage:1, erased:['Gaty'] } },
      { cobs:{ stage:1, cups:['Knife','Balloon'], race:true, beaten:false, wins:1, bestSecs:120 }, bossKills:{ MePhone4:['Fan'], Springy:['Balloon'] }, one:{ stage:0, erased:[] } }))`);
    const p = JSON.parse(m);
    expect(p.cobs).toEqual({ stage: 2, cups: ['Knife', 'Balloon'], race: true, beaten: false, wins: 1, bestSecs: 120 });
    expect(p.bossKills).toEqual({ MePhone4: ['Knife', 'Fan'], Springy: ['Balloon'] });
    expect(p.one, 'One\'s merge is untouched').toEqual({ stage: 1, erased: ['Gaty'], rushLightning: false, wins: 0, bestSecs: 0 });
    expect(W.eval(`mergeCobs({ stage:3 }, { beaten:false }).beaten`), 'stage FREE is the flag too').toBe(true);
    expect(W.eval(`mergeCobs({ cups:['Taco (II)','Knife'] }, { cups:'junk' }).cups`), 'a run that does not follow the order is no run').toEqual([]);
    expect(W.eval(`mergeCobs({ bestSecs:200 }, { bestSecs:95 }).bestSecs`)).toBe(95);
    const bare = W.eval(`JSON.stringify(mergeProfiles({ unlocked:[] }, { unlocked:[] }))`);
    expect(JSON.parse(bare).cobs).toEqual({ stage: 0, cups: [], race: false, beaten: false, wins: 0, bestSecs: 0 });
    expect(JSON.parse(bare).bossKills).toEqual({});
    expect(W.eval(`mergeBossKills({ A:['x', 3, 'y'] }, null)`)).toEqual({ A: ['x', 'y'] });
  });

  it('a save made mid-chain loads back as it was, and an old save without his fields gets them', async () => {
    await fresh(W, ALL_EXISTING);
    sub(W, 'C0B5'); sub(W, 'MISTAH PHONE');
    kill(W, { name: 'Knife', you: true, team: 0 }, 'MePhone4');
    cup(W, 'Knife'); W.eval('cobsRaceWon()');
    await sleep(W, 0);
    const w2 = boot({ 'profile:v1': W.localStorage.getItem('profile:v1') });
    await w2.eval('profileReady');
    expect(w2.eval(`({ stage:PROFILE.cobs.stage, cups:PROFILE.cobs.cups, race:PROFILE.cobs.race, kills:PROFILE.bossKills, live:cobsChainLive(), s2:cobsStep(2), s3:cobsStep(3), gate:cobsGateOpen() })`))
      .toEqual({ stage: 1, cups: ['Knife'], race: true, kills: { MePhone4: ['Knife'] }, live: true, s2: true, s3: false, gate: true });
    expect(w2.eval(`vaultSubmit('nope').reply`), 'live after the reload: "Tick, tock."').toBe(TICK);
    expect(w2.eval(`vaultSubmit('mistah phone').kind`)).toBe('again');
    w2.eval('openVault()');
    expect([...w2.document.querySelectorAll('#vaultWire .vstep')].map((s) => s.textContent)).toEqual(['1', '2']);
    const old = { version: 1, matches: 3, wins: 1, kos: 0, bossesCleared: { MePhone4: true }, soloBosses: {}, bestRushLoop: 0, wcTitles: 0,
      unlocked: ['Firey'], viewMode: 'starters', migratedFrom: null };
    const w3 = boot({ 'profile:v1': J(old) });
    await w3.eval('profileReady');
    expect(w3.eval(`({ q:cobsQ(), kills:PROFILE.bossKills, beaten:cobsBeaten(), live:cobsChainLive() })`))
      .toEqual({ q: { stage: 0, cups: [], race: false, beaten: false, wins: 0, bestSecs: 0 }, kills: {}, beaten: false, live: false });
    expect(w3.eval(`vaultSubmit('C0B5')`), 'and a chain that has not opened answers as it always did').toEqual({ kind: 'wrong', reply: WRONG });
  });

  it('a kill, a cup and a code found in another tab survive this tab\'s save', async () => {
    await fresh(W, ALL_EXISTING);
    W.eval(`vaultSubmit('C0B5')`);
    kill(W, { name: 'Knife', you: true, team: 0 }, 'MePhone4');
    await sleep(W, 0);
    // A second tab, hydrated earlier, has felled Springy as Balloon, won a cup as Knife and typed the second code.
    const other = stored(W);
    other.bossKills = Object.assign({}, other.bossKills, { Springy: ['Balloon'] });
    other.cobs = Object.assign({}, other.cobs, { cups: ['Knife'] });
    other.vault = { found: [...other.vault.found, 'MISTAH PHONE'] };
    W.localStorage.setItem('profile:v1', J(other));
    // This tab saves again from its own stale copy, after a kill of its own.
    kill(W, { name: 'Fan', you: true, team: 0 }, 'MePhone4');
    await W.eval('saveProfile()');
    const final = stored(W);
    expect(final.bossKills).toEqual({ MePhone4: ['Knife', 'Fan'], Springy: ['Balloon'] });
    expect(final.cobs.cups).toEqual(['Knife']);
    expect(final.vault.found).toContain('MISTAH PHONE');
    expect(W.eval('cobsStep(2) && cobsKilled("Balloon","Springy")'), 'and the tab in memory has them too').toBe(true);
  });
});

describe('the Vault never names him, and One\'s chain is untouched', () => {
  it('none of the Vault\'s own words -- his heading, his whispers, his replies, the screen with every step shown -- names him, his company, a fighter or a mode, or holds a digit', async () => {
    await arm(W);
    W.eval('window.__vb = 0; window.__origBanner = banner; banner = function(){ window.__vb++; };');   // count anything the Vault puts over the screen
    const texts = W.eval(`[COBS_VAULT.heading, COBS_VAULT.again, COBS_VAULT.found, COBS_VAULT.wrong].concat(COBS_VAULT.steps.map(function(s){ return s.text; }))`);
    const replies = [];
    for (const s of Object.values(CODES).flat()) replies.push(sub(W, s).reply);   // found or again, and the door
    replies.push(sub(W, 'nope').reply, sub(W, 'COBS').reply);
    W.eval('openVault()');
    const screen = W.document.getElementById('vault').textContent;
    const section = W.document.getElementById('vaultWireHead').textContent + ' ' + W.document.getElementById('vaultWire').textContent;
    const titles = [...W.document.querySelectorAll('#vault [title]')].map((e) => e.title);
    for (const t of [...texts, ...replies, screen, section, ...titles]) {
      expect(t, t).not.toMatch(/cobs|steve|meeple/i);
      expect(t, t).not.toMatch(/\bone\b/i);
    }
    // His own words (the screen as a whole names the Vault's fighters, Balloon and Taco (II) among them, as it always has).
    const hisTitles = [...W.document.querySelectorAll('#vaultWireHead[title], #vaultWire [title]')].map((e) => e.title);
    for (const t of [...texts, ...replies, section, ...hisTitles]) {
      expect(t, t).not.toMatch(/Knife|Balloon|Taco|\bFan\b|MePhone|Springy|Marshmallow|World Cup|Boss Rush|RUNNING|Red Line|Toilet/);
    }
    for (const t of texts) {
      expect(t, t).not.toMatch(/\d|%/);
      // Cryptic: no code is spelled inside a whisper.
      for (const s of Object.values(CODES).flat()) expect(W.eval(`vaultNorm(${J(t)})`), `${s} in ${t}`).not.toContain(W.eval(`vaultNorm(${J(s)})`));
    }
    expect(screen).toContain('Static on the line');
    expect(W.eval('JSON.stringify(COBS_VAULT)')).not.toMatch(/\bOJ\b|Suitcase|Cabby/);
    // A game-wide rule kept: nothing here ever puts a banner over a match.
    expect(W.eval('window.__vb'), 'no banner from any code, right or wrong').toBe(0);
    W.eval(`banner = window.__origBanner; go('title')`);
  });

  it('One\'s chain is as it was: her tables, her codes, her stage, her card and her bans through all of the above', async () => {
    await arm(W);
    sub(W, 'THE FUTURE IS SO YESTERDAY');
    const r = W.eval(`({ stage:PROFILE.one.stage, erased:PROFILE.one.erased, hints:VAULT.hints.map(function(h){ return h.step; }), heading:VAULT.cluesHeading, wrong:VAULT.wrong,
      banned:ROSTER.filter(oneBanned).length, live:oneQuestLive(), unlocked:oneUnlocked(), rate:ONE_RATE_GAMES, canon:ONE_CANON_ERASED, stages:ONE_STAGE,
      one:vaultSubmit('all for one').kind, moon:typeof playMoonScene })`);
    expect(r).toEqual({ stage: 0, erased: [], hints: [1, 2, 3, 4], heading: 'Whispers through the crack', wrong: WRONG, banned: 0, live: false, unlocked: false, rate: 20,
      canon: ['Gaty', 'Barf Bag', 'Basketball'], stages: { LOCKED: 0, ERASING: 1, ALONE: 2, MOON: 3, CHALLENGE: 4, FREE: 5 }, one: 'again', moon: 'function' });
    // Her trigger still fires on a counted match, and his chain does not move for it.
    W.eval(`PROFILE.fighterStats = { Lightning:{ g:20, w:15 } }; PROFILE.one.rushLightning = true;
      fighters = [{ name:'Lightning', you:true, team:0, killCount:0 }, { name:'Firey', team:1, killCount:0 }]; awardMatchProgress(0);`);
    expect(W.eval('({ one:PROFILE.one.stage, erased:PROFILE.one.erased, cobs:PROFILE.cobs.stage })')).toEqual({ one: 1, erased: ['Gaty'], cobs: 2 });
    W.eval(`PROFILE.one = { stage:0, erased:[], rushLightning:false, wins:0, bestSecs:0 }; go('title')`);
  });
});
