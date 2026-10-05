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
// MePhone4, Balloon beats Springy, Fan beats MePhone4; the cups are "knife, balloon, taco"; a loss is retried directly; after
// the win "Anyone", like One; and the prize (the season winners, "3, but only after you beat cobs") is another lane's, reading
// cobsBeaten(). The Vault keeps One's discretion: none of its own words name him.
// EASIER (2026-09-30), the owner: "cobs could be easier to access." Asked which parts, they chose "Easier boss pairs" and "Fewer
// World Cups": a pair counts THE MOMENT you beat that boss as that fighter ("No dying needed", the way it worked before
// 2026-09-29), and the three cups -- still Knife, Balloon and Taco (II) -- come in ANY order, a loss (or a cup won as anyone
// else) taking nothing already won away ("No reset on a loss"), the cups of two tabs merging as a union.
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
    LOCAL_PLAYERS = 1; if(window.__origRace) window.startRunningRace = window.__origRace; else delete window.startRunningRace; window.__raceOpts = null;
    SETTINGS.mode = 'ffa'; SETTINGS.count = 2; SETTINGS.stocks = 3; SETTINGS.itemRate = 0; SETTINGS.bossPick = 'rush';
    chosen = ROSTER.find(function(r){ return r.name==='Firey'; });
    ${js}`);
}
// The owner's codes, pinned by hand, each with every spelling it must take (the wire's lookalikes: "PHENOM53 VKOCH-style").
const CODES = {
  1: ['C0B5', 'C085', 'c0b5', 'C-0B5', 'c 0 b 5', 'C-085', 'COBS', 'C0BS', 'COB5', 'cobs'],   // the plate reads either way ("Accept lookalikes")
  2: ['MISTAH PHONE', 'MISTAHPHONE', 'MISTER PHONE', 'MISTA PHONE', 'Mistah Phone!', 'mistah phone', 'mister-phone'],
  3: ['PH3N0M53 VK0CH', 'PH3N0M53VK0CH', 'PH3N0M53 VK0cH', 'PHENOM53 VKOCH', 'PH3NOM53 VK0CH', 'PHEN0M53 VK0CH', 'PH3N0MS3 VK0CH', 'PHENOMSE VKOCH', 'Model PH3N0M53 VK0cH'],
  4: ['THE FUTURE IS SO YESTERDAY', 'The future is so yesterday!', 'THEFUTUREISSOYESTERDAY', 'where the future is so yesterday', 'future is so yesterday'],
};
const WRONG = "Aw, seriously? That code doesn't do anything.";
const NOT_YET = "Static... not yet. Every other code in here comes first.";   // "Say 'not yet'" (the owner, 2026-09-29)
const TICK = 'Tick, tock.';
const LINE = "You haven't found every code yet.";
// Every existing Vault code in: the gate ("Both").
const ALL_EXISTING = `for(const v of VAULT.fighters.concat(VAULT.hints)) vaultSubmit(v.code);`;
const sub = (w, s) => w.eval(`vaultSubmit(${J(s)})`);
// One boss felled, the way bossRushCheck reports it (`fighters` on the stage, awardBossCleared(name)). "No dying needed" (the
// owner, 2026-09-30): the pair counts at the fall, so nothing follows it here -- no next boss, no knockout.
const kill = (w, you, boss) => w.eval(`fighters = [${J(you)}, { name:'Leafy', team:0 }]; awardBossCleared(${J(boss)});
  (PROFILE.bossKills[${J(boss)}] || []).slice()`);
// One World Cup won in Normal mode, the way advanceKnockout awards it: your side is the champion.
const cup = (w, lead, mode = 'normal') => w.eval(`TOURNEY = { active:true, mode:${J(mode)}, myTeam:{ name:'Mine', members:[ROSTER.find(function(r){ return r.name===${J(lead)}; })] }, eliminated:false, awarded:false };
  awardWorldCup(TOURNEY.myTeam); cobsQ().cups.slice()`);
// Your World Cup final through the real knockout flow, the way the game plays it: one fixture left in the knockout, you in it as
// `lead`, finishWatchedKnockout crowning it on the spot (the flow One's Moon relies on), with no "Sim & Continue" in between.
// winTeam 0 is your side, 1 is theirs; what comes back is the run afterwards, the champion and whether the cup counted as yours.
const playFinal = (w, lead, winTeam) => w.eval(`(function(){
  var mine = { name:'Mine', members:[ROSTER.find(function(r){ return r.name===${J(lead)}; })] }, them = { name:'Them', members:[ROSTER.find(function(r){ return r.name==='Firey'; })] };
  var fx = { kind:'ko', a:mine, b:them, played:false, result:null };
  TOURNEY = { active:true, mode:'normal', myTeam:mine, eliminated:false, awarded:false, stage:'knockout', bracket:[[fx]], knockoutRound:0, fixtures:[fx], fxIndex:0, round:0 };
  fighters = [{ name:${J(lead)}, you:true, team:0 }, { name:'Firey', you:false, team:1 }];
  var wc = PROFILE.wcTitles;
  finishWatchedKnockout(fx, ${winTeam});
  return { cups:cobsQ().cups.slice(), champ:TOURNEY.champion && TOURNEY.champion.name, stage:TOURNEY.stage, won:PROFILE.wcTitles - wc };
})()`);
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
      // (COBS itself opens step 1 now: the plate reads either way, "Accept lookalikes", the owner, 2026-09-29; CODES[1] checks it)
      ['STEVE COBS','MEEPLE','TICK TOCK',"I DON'T REMEMBER IT BLINKING",'C0B','C0B55','MISTAH','PHONE','THE FUTURE'].forEach(function(s){ if(COBS_CODES.get(vaultNorm(s)) || VAULT_CODES.get(vaultNorm(s))) out.plain.push(s); });
      var collide = []; COBS_CODES.forEach(function(v, k){ if(VAULT_CODES.has(k)) collide.push(k); });
      out.collide = collide; out.codes = COBS_VAULT.steps.map(function(s){ return s.code; }); out.nums = COBS_VAULT.steps.map(function(s){ return s.step; });
      return out; })()`);
    for (const [step, spellings] of Object.entries(CODES)) for (const s of spellings) expect(r.steps[s], s).toBe(+step);
    expect(r.inVault, 'none is one of the Vault\'s own codes').toEqual([]);
    expect(r.collide).toEqual([]);
    expect(r.plain, 'his full name, TICK TOCK and the dropped fourth code open nothing').toEqual([]);
    expect(r.look, 'every reading of the wire\'s digits as letters (3/E, 0/O, 5/S)').toBe(31);
    expect(r.codes).toEqual(['C0B5', 'MISTAH PHONE', 'PH3N0M53 VK0CH', 'THE FUTURE IS SO YESTERDAY']);
    expect(r.nums).toEqual([1, 2, 3, 4]);
    // The Vault's own map holds exactly what it did (test/vault.test.js pins its size): his codes are not in it.
    expect(r.size).toBe(W.eval(`(function(){ var n = 0, seen = {}; VAULT.fighters.concat(VAULT.hints).forEach(function(v){ [v.code].concat(v.accepts||[]).forEach(function(s){ var k = vaultNorm(s); if(!seen[k]){ seen[k] = 1; n++; } }); }); return n; })()`));
  });

  it('"all existing codes first": his first code says "not yet" and the rest are just wrong until the eleven fighters\' and One\'s four are all in; then C0B5 opens the chain', async () => {
    await fresh(W);
    for (const [step, list] of Object.entries(CODES)) for (const s of list) { const r = sub(W, s); expect(r.kind, s).toBe('wrong'); expect(r.reply, s).toBe(step === '1' ? NOT_YET : WRONG); }
    expect(W.eval('({ stage:cobsQ().stage, gate:cobsGateOpen(), live:cobsChainLive() })')).toEqual({ stage: 0, gate: false, live: false });
    // Every code but one in: still shut, whichever is missing.
    W.eval(`for(const v of VAULT.fighters.concat(VAULT.hints)) if(v.code!=='OMGA') vaultSubmit(v.code);`);
    expect(sub(W, 'C0B5')).toEqual({ kind: 'wrong', reply: NOT_YET });
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

  it('the gate reads the Vault as it shows: a fighter already open in the save counts as heard, code typed or not ("steve cobs codes dont work")', async () => {
    await fresh(W);
    // A long-played save: Needle, Bubble and Balloon opened before they were Vault fighters (the old unlock drip, the starters,
    // the DLC pack arriving whole), their codes never typed; every other code typed.
    W.eval(`PROFILE.unlocked.push('Needle', 'Bubble', 'Balloon');
      for(const v of VAULT.fighters.concat(VAULT.hints)) if(['Needle','Bubble','Balloon'].indexOf(v.name) < 0) vaultSubmit(v.code);`);
    expect(W.eval(`VAULT.fighters.filter(function(v){ return ['Needle','Bubble','Balloon'].indexOf(v.name) >= 0; }).map(function(v){ return vaultFound(v.code); })`), 'three codes never typed').toEqual([false, false, false]);
    expect(W.eval('cobsGateOpen()'), 'the Vault shows all fifteen, so the gate is open').toBe(true);
    const r = sub(W, 'COBS');
    expect([r.kind, r.step]).toEqual(['hint', 1]);
    // A whisper still has to be typed: One's four show only once their codes are in.
    await fresh(W);
    W.eval(`for(const v of VAULT.fighters.concat(VAULT.hints)) if(v.code!=='ALL FOR ONE') vaultSubmit(v.code);`);
    expect(W.eval('cobsGateOpen()')).toBe(false);
    expect(sub(W, 'C0B5')).toEqual({ kind: 'wrong', reply: NOT_YET });
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
    expect(r3.text).toContain('the marshmallow goes over the last gap on a long, charged throw before you cross');   // the throw is a charged smash now ("Charged smash", 2026-09-30)
    // The cups are "Fewer World Cups" now (the owner, 2026-09-30): the cup once as each of the three who came second, nothing
    // said of an order or of a loss.
    expect(r3.text).toContain('the cup the whole world fights for: take it home three times over, once as each of the three who came second, the blade, the balloon and the taco');
    expect(r3.text).toContain("It's written over my door");
    // "cobs could be easier to access." -- neither whisper asks for a death, an order or a clean run any more: the pairs are
    // "No dying needed", the cups "No reset on a loss" and in any order.
    for (const t of [r2.text, r3.text]) {
      expect(t, t).not.toMatch(/\b(die|dies|died|dying|dead|death|lose|loses|lost|loss|order)\b/i);
      expect(t, t).not.toMatch(/then the (balloon|taco)|in turn|no loss|all again|in a row/i);
    }
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
  it('awardBossCleared records WHICH fighter in your hands felled each boss -- standing as it fell, solo or not -- and never an AI or a fallen one', async () => {
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

  it('a kill counts at the fall: no dying needed -- beat the boss as that fighter and the pair is in, whatever happens to him after', async () => {
    await fresh(W);
    // "cobs could be easier to access." -> "Easier boss pairs" -> "No dying needed" (the owner, 2026-09-30): a pair counts THE
    // MOMENT you beat that boss as that fighter, the way it worked before 2026-09-29, when "you must kill the boss, but then die
    // to the next one" was tried. Driven through bossRushCheck, as a run plays it.
    const r = W.eval(`(function(){
      var out = {}, st = setTimeout; setTimeout = function(){ return 0; };
      var ally = { name:'Leafy', team:0 };
      var boss = function(n, hp){ return { type:'boss', _bossRush:true, name:n, hp:hp, maxHp:100, x:400, y:300, r:60, color:'#888', face:1 }; };
      var run = function(you){ BOSSRUSH = { active:true, bossIdx:0, cleared:0, defeated:false, loop:0, dmgMult:1 }; running = true; fighters = [you, ally]; };
      var kills = function(n){ return (PROFILE.bossKills[n] || []).slice(); };
      try {
        // Knife fells MePhone4 with an AI ally beside him and is still standing: it counts on the spot -- no next boss has come.
        run({ name:'Knife', you:true, team:0, stocks:1 }); summons = [boss('MePhone4', 0)]; bossRushCheck();
        out.atFall = kills('MePhone4');
        // Then Evil Leafy, the very next boss, knocks him out: nothing is taken away, and nothing more is needed.
        summons = [boss('Evil Leafy', 100)]; fighters[0].dead = true; bossRushCheck();
        out.afterKo = kills('MePhone4');
        // Fan fells MePhone4 and beats Evil Leafy too: both count -- beating the next boss takes nothing from the first.
        run({ name:'Fan', you:true, team:0, stocks:1 }); summons = [boss('MePhone4', 0)]; bossRushCheck();
        summons = [boss('Evil Leafy', 0)]; bossRushCheck();
        out.two = { m4:kills('MePhone4'), leafy:kills('Evil Leafy') };
        // Balloon fells Springy and is out in the gap before Four arrives: already counted at the fall.
        run({ name:'Balloon', you:true, team:0, stocks:1 }); summons = [boss('Springy', 0)]; bossRushCheck();
        summons = []; fighters[0].dead = true; bossRushCheck();
        out.gap = kills('Springy');
        // A Knife already out of stocks when the ally finishes Springy did not beat him (the bolt must still be standing).
        run({ name:'Knife', you:true, team:0, stocks:0, dead:true }); summons = [boss('Springy', 0)]; bossRushCheck();
        out.outFirst = kills('Springy');
        return out;
      } finally { setTimeout = st; BOSSRUSH = { active:false, bossIdx:0, cleared:0, defeated:false }; summons = []; projectiles = []; running = false; }
    })()`);
    expect(r.atFall, 'counted the moment it fell').toEqual(['Knife']);
    expect(r.afterKo, 'and dying to the next boss changes nothing').toEqual(['Knife']);
    expect(r.two, 'beating two counts both').toEqual({ m4: ['Knife', 'Fan'], leafy: ['Fan'] });
    expect(r.gap, 'out in the gap after the fall is already counted').toEqual(['Balloon']);
    expect(r.outFirst, 'out of the run before it fell is not a kill').toEqual(['Balloon']);
    await sleep(W, 0);
    expect(stored(W).bossKills, 'saved at the fall').toEqual({ MePhone4: ['Knife', 'Fan'], 'Evil Leafy': ['Fan'], Springy: ['Balloon'] });
    // The kill in waiting is gone: no state on the run, no rule in the loop, nothing for a new run to reset.
    expect(W.eval('typeof cobsPendKill + typeof cobsPendTick')).toBe('undefinedundefined');
    expect(W.eval('String(bossRushCheck)')).not.toMatch(/cobsPend/);
    expect(W.eval('String(startBossRush)')).not.toMatch(/cobsPend/);
  });
});

describe('RUNNING!', () => {
  it('the step opens with the third code, calls startRunningRace({ onEnd }) from the Vault\'s Run button, and completes on a win as Knife', async () => {
    await fresh(W, ALL_EXISTING);
    sub(W, 'C0B5'); sub(W, 'MISTAH PHONE');
    expect(W.eval('({ open:cobsRaceOpen(), avail:cobsRaceAvailable(), start:cobsStartRace() })'), 'no code, no race').toEqual({ open: false, avail: false, start: false });
    sub(W, 'PH3N0M53 VK0CH');
    // Without the race lane's mode in the build (this worktree; the lanes merge later) the step is open but has no door, and
    // the Vault shows no button; with it merged, the door is there at once. The step's own state is the same either way.
    const HAS_RACE = W.eval(`typeof startRunningRace === 'function'`);
    expect(W.eval('({ open:cobsRaceOpen(), avail:cobsRaceAvailable() })')).toEqual({ open: true, avail: HAS_RACE });
    if (!HAS_RACE) {
      expect(W.eval('cobsStartRace()'), 'no mode, no race').toBe(false);
      W.eval('openVault()');
      expect(W.document.getElementById('cobsRunBtn')).toBe(null);
    }
    // The lane's entry, stubbed so no race runs here: the button appears, and pressing it starts the race with the chain's onEnd.
    W.eval(`window.__origRace = window.startRunningRace; window.startRunningRace = function(o){ window.__raceOpts = o; return true; }; openVault();`);
    const btn = W.document.getElementById('cobsRunBtn');
    expect(btn && btn.textContent).toBe('Run ▶');
    btn.onclick();
    expect(W.eval('!!window.__raceOpts && typeof window.__raceOpts.onEnd')).toBe('function');
    expect(W.eval(`window.__raceOpts.onEnd(false); cobsQ().race`), 'a lost race is just a race').toBe(false);
    expect(W.eval(`fighters = [{ name:'Firey', you:true, team:0 }]; window.__raceOpts.onEnd(true); cobsQ().race`), 'won as anyone but Knife: no step').toBe(false);
    // The race lane's endRace hands onEnd(won, result) with result.fighter, the runner's name: that word wins over the stage.
    expect(W.eval(`fighters = [{ name:'Knife', you:true, team:0 }]; window.__raceOpts.onEnd(true, { won:true, why:'crossed', secs:40, fighter:'Firey' }); cobsQ().race`), 'the result says another runner: no step').toBe(false);
    expect(W.eval(`fighters = []; window.__raceOpts.onEnd(true, { won:true, why:'crossed', secs:40, fighter:'Knife' }); cobsQ().race`), 'the result says Knife: the step, with no fighter left on the stage').toBe(true);
    expect(W.eval(`window.__raceOpts.onEnd(true); cobsRaceWon()`), 'once').toBe(false);
    W.eval(`PROFILE.cobs.race = false;`);
    expect(W.eval(`fighters = [{ name:'Knife', you:true, team:0 }]; window.__raceOpts.onEnd(true); cobsQ().race`), 'no result given: the fighter in your hands').toBe(true);
    W.eval('buildVault()');
    expect(W.document.getElementById('cobsRunBtn'), 'the button goes with the step').toBe(null);
    expect(W.eval('cobsRaceOpen()')).toBe(false);
    await sleep(W, 0);
    expect(stored(W).cobs.race, 'saved at the deed').toBe(true);
    W.eval(`if(window.__origRace) window.startRunningRace = window.__origRace; else delete window.startRunningRace; go('title')`);
  });
});

describe('the three World Cups ("knife, balloon, taco": "Fewer World Cups", "No reset on a loss")', () => {
  it('any order: each of Knife, Balloon and Taco (II) counts once; a cup as anyone else or a repeat changes nothing; a cup lost takes nothing away; a spectated cup is nobody\'s win', async () => {
    await fresh(W);
    // "cobs could be easier to access." -> "Fewer World Cups" -> "No reset on a loss" (the owner, 2026-09-30): still Knife,
    // Balloon and Taco (II), but in ANY order, and losing a cup (or winning one as anyone else) no longer wipes what is won.
    expect(W.eval('COBS_CUP_ORDER')).toEqual(['Knife', 'Balloon', 'Taco (II)']);
    expect(cup(W, 'Taco (II)'), 'Taco first: no Knife needed to start').toEqual(['Taco (II)']);
    expect(cup(W, 'Firey'), 'a cup as anyone else takes nothing away').toEqual(['Taco (II)']);
    expect(cup(W, 'Taco (II)'), 'the same cup twice is one cup').toEqual(['Taco (II)']);
    expect(cup(W, 'Knife', 'spectate'), 'a spectated cup is nobody\'s win').toEqual(['Taco (II)']);
    expect(playFinal(W, 'Balloon', 1), 'a cup lost as Balloon: what is won stays and nothing is added').toEqual({ cups: ['Taco (II)'], champ: 'Them', stage: 'done', won: 0 });
    expect(cup(W, 'Knife'), 'kept in the list\'s order, whichever came first').toEqual(['Knife', 'Taco (II)']);
    expect(W.eval('({ done:cobsCupsDone(), wc:PROFILE.wcTitles, one:PROFILE.one.stage })'), 'two of three; the cup count and One\'s chain are as they were').toEqual({ done: false, wc: 4, one: 0 });
    expect(playFinal(W, 'Balloon', 0), 'the cup lost as Balloon is won next time: the third, and the run is done').toEqual({ cups: ['Knife', 'Balloon', 'Taco (II)'], champ: 'Mine', stage: 'done', won: 1 });
    expect(W.eval('cobsCupsDone()')).toBe(true);
    await sleep(W, 0);
    expect(stored(W).cobs.cups, 'saved at the deed').toEqual(['Knife', 'Balloon', 'Taco (II)']);
    expect(cup(W, 'Firey'), 'a finished run stays').toEqual(['Knife', 'Balloon', 'Taco (II)']);
    // Every order of the three gets there, and only the third cup does.
    for (const order of [['Knife', 'Balloon', 'Taco (II)'], ['Knife', 'Taco (II)', 'Balloon'], ['Balloon', 'Knife', 'Taco (II)'], ['Balloon', 'Taco (II)', 'Knife'], ['Taco (II)', 'Knife', 'Balloon'], ['Taco (II)', 'Balloon', 'Knife']]) {
      await fresh(W);
      expect(order.map((n) => { cup(W, n); return W.eval('cobsCupsDone()'); }), order.join(', ')).toEqual([false, false, true]);
    }
    W.eval(`TOURNEY = { active:false }; go('title')`);
  });

  it('a save holds a unique subset of the three: repeats, strangers and non-lists are cleaned, the real cups kept whatever order they came in', async () => {
    await fresh(W);
    expect(W.eval(`JSON.stringify([['Taco (II)', 'Knife'], ['Balloon', 'Balloon', 'Knife'], ['Knife', 'Firey', 3, null, 'Taco (II)'], 'Knife', {}, null, undefined, []].map(function(l){ return cobsCupSubset(l); }))`))
      .toBe(J([['Knife', 'Taco (II)'], ['Knife', 'Balloon'], ['Knife', 'Taco (II)'], [], [], [], [], []]));
    // The same through the profile: cobsQ() cleans a hand-edited or stale save in place, and "done" means all three, not three entries.
    expect(W.eval(`PROFILE.cobs = { cups:['Taco (II)', 'Taco (II)', 'Zed', 'Balloon'] }; cobsQ().cups`)).toEqual(['Balloon', 'Taco (II)']);
    expect(W.eval(`PROFILE.cobs = { cups:'Knife' }; cobsQ().cups`), 'a string is no list').toEqual([]);
    expect(W.eval(`PROFILE.cobs = { cups:['Knife', 'Knife', 'Balloon'] }; cobsCupsDone()`), 'three entries are not three cups').toBe(false);
    expect(W.eval(`PROFILE.cobs = { cups:['Taco (II)', 'Balloon', 'Knife', 'Knife'] }; ({ cups:cobsQ().cups, done:cobsCupsDone() })`)).toEqual({ cups: ['Knife', 'Balloon', 'Taco (II)'], done: true });
  });

  it('the door follows the third cup whatever order the three came in', async () => {
    await arm(W);
    W.eval(`PROFILE.cobs.cups = [];`);
    expect(W.eval('cobsDoorReady()'), 'everything but the cups').toBe(false);
    cup(W, 'Taco (II)'); cup(W, 'Knife');
    expect(W.eval('({ cups:cobsCupsDone(), door:cobsDoorReady() })'), 'the taco and the blade').toEqual({ cups: false, door: false });
    cup(W, 'Balloon');
    expect(W.eval('({ cups:cobsCupsDone(), door:cobsDoorReady() })'), 'and the balloon last').toEqual({ cups: true, door: true });
    expect(sub(W, 'The future is so yesterday!')).toMatchObject({ kind: 'hint', step: 4 });
    W.eval(`go('title')`);
  });

  it('is hooked where a cup is won and nowhere a cup is lost -- out in the group stage, beaten in the knockout and a final lost on the spot leave the chain alone', () => {
    const src = W.eval('({ won:String(awardWorldCup), sim:String(simRestOfRound), group:String(proceedAfterRound), adv:String(advanceKnockout) })');
    expect(src.won).toMatch(/cobsCupWon\(\)/);
    // "No reset on a loss" (the owner, 2026-09-30): the three places that decide a Normal-mode cup against your side used to
    // empty the run. None of them asks the chain anything now, and the function they called is gone.
    expect(src.sim, 'beaten in a simmed knockout round').not.toMatch(/cobs/i);
    expect(src.group, 'out in the group stage').not.toMatch(/cobs/i);
    expect(src.adv, 'the final you played goes finishWatchedKnockout -> advanceKnockout, never through simRestOfRound').not.toMatch(/cobs/i);
    expect(W.eval('typeof cobsCupLost')).toBe('undefined');
  });

  it('the final, through the real knockout flow: lost as Taco (II) with two cups in hand, the two stay; won, the run is finished', async () => {
    await fresh(W);
    W.eval(`PROFILE.cobs.cups = ['Knife', 'Balloon'];`);
    expect(playFinal(W, 'Taco (II)', 1), 'the final lost: decided here, not at an eliminated site, and the two cups in hand stay').toEqual({ cups: ['Knife', 'Balloon'], champ: 'Them', stage: 'done', won: 0 });
    expect(playFinal(W, 'Taco (II)', 0), 'the final won as Taco (II): the third cup').toEqual({ cups: ['Knife', 'Balloon', 'Taco (II)'], champ: 'Mine', stage: 'done', won: 1 });
    expect(playFinal(W, 'Taco (II)', 1), 'a lost final after the third changes nothing').toMatchObject({ cups: ['Knife', 'Balloon', 'Taco (II)'], champ: 'Them' });
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
    // ...and where to find him: under Boss Rush, beside One; then the season winners he unlocks, announced once by the prize
    // lane's syncPrizeRoster(true) ("3, but only after you beat cobs.")
    expect(r.note, 'and where to find him: under Boss Rush, beside One').toMatch(/Boss Rush ▸ 🌽 Steve Cobs\. New fighters: OJ, Suitcase, Cabby!$/);
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

  it('the hidden fighters open where the roster decides what is unlocked: shut until he is beaten, on the roster the moment he is', () => {
    const src = W.eval('String(isUnlocked)');
    expect(src).toMatch(/r\.prize && !cobsBeaten\(\)/);
    expect(W.eval(`typeof cobsBeaten`)).toBe('function');
    // The test above left the chain at the door (stage 2, not beaten): the gate is shut, none of the three is on the roster, and
    // a prize row held anywhere else is locked.
    expect(W.eval(`cobsBeaten()`)).toBe(false);
    expect(W.eval(`ROSTER.filter(function(r){ return /^(OJ|Suitcase|Cabby)$/.test(r.name); }).length`), 'hidden while the gate is shut').toBe(0);
    expect(W.eval(`isUnlocked(PRIZE_ROSTER[0])`)).toBe(false);
    // Beaten: the three join the roster, unlocked; shut again (the chain back at the door) and they leave.
    const open = W.eval(`PROFILE.cobs.beaten = true; syncPrizeRoster(); var o = ROSTER.filter(function(r){ return r.prize && isUnlocked(r); }).map(function(r){ return r.name; });
      PROFILE.cobs.beaten = false; syncPrizeRoster(); ({ open:o, after:ROSTER.filter(function(r){ return r.prize; }).length })`);
    expect(open).toEqual({ open: ['OJ', 'Suitcase', 'Cabby'], after: 0 });
    // ...and the moment the gate opens, that lane's installer is asked for by name, guarded, so a build without it is unmoved.
    expect(W.eval('String(awardCobsDefeated)')).toMatch(/typeof syncPrizeRoster === 'function'\) syncPrizeRoster\(true\)/);
    expect(W.eval('String(cobsFightEnded)')).toMatch(/PENDING_UNLOCKS/);
  });

  it('the prize lane\'s hook: the win asks syncPrizeRoster(true) when the build has it, and what it queues rides his result note, once', async () => {
    await arm(W);
    sub(W, 'THE FUTURE IS SO YESTERDAY');
    // That lane's installer, stubbed (this worktree has none; a merged build has the real one, overridden here the same way):
    // it records every call and, asked to announce once the gate is open, queues its rows in PENDING_UNLOCKS as the real one does.
    W.eval(`window.__origPrize = window.syncPrizeRoster; window.__prizeCalls = []; window.__prizeDone = false;
      window.syncPrizeRoster = function(announce){ window.__prizeCalls.push(announce);
        if(announce && cobsBeaten() && !window.__prizeDone){ window.__prizeDone = true; PENDING_UNLOCKS.push('Prize A', 'Prize B', 'Prize A'); } };
      go('title'); document.getElementById('cobsEntry').click();`);
    expect(W.eval(`window.__prizeCalls.filter(function(a){ return a===true; }).length`), 'nothing before the win').toBe(0);
    const r = W.eval(`COBSFIGHT.won = true; COBSFIGHT.frames = 60*70; running = true; cobsFightCheck();
      ({ calls:window.__prizeCalls.filter(function(a){ return a===true; }).length, note:document.getElementById('unlockNote').textContent, pending:PENDING_UNLOCKS.length, beaten:cobsBeaten() })`);
    expect(r.calls, 'asked to announce, at the win, with the gate already open').toBe(1);
    expect(r.beaten).toBe(true);
    expect(r.note).toMatch(/^★ STEVE COBS UNLOCKED! .*Boss Rush ▸ 🌽 Steve Cobs\. New fighters: Prize A, Prize B!$/);
    expect(r.pending, 'drained: a Rematch cannot announce them twice').toBe(0);
    await sleep(W, 950);
    // Beaten again from his result screen's Rematch: the installer is asked again (its own call is idempotent), nothing is
    // queued, and the note is his alone.
    const again = W.eval(`go('result'); startMatch(); COBSFIGHT.won = true; COBSFIGHT.frames = 60*80; running = true; cobsFightCheck();
      ({ calls:window.__prizeCalls.filter(function(a){ return a===true; }).length, note:document.getElementById('unlockNote').textContent, pending:PENDING_UNLOCKS.length })`);
    expect(again.calls).toBe(2);
    expect(again.note).toBe('★ Steve Cobs beaten 2 times · best 1:10');
    expect(again.pending).toBe(0);
    await sleep(W, 950);
    W.eval(`if(window.__origPrize) window.syncPrizeRoster = window.__origPrize; else delete window.syncPrizeRoster; go('title')`);
  });
});

describe('the profile: reload and two tabs', () => {
  it('merges upward -- stage, wins and the flags by max/OR, the cups and the kills by union -- and copes with saves that have none of it', () => {
    const m = W.eval(`JSON.stringify(mergeProfiles(
      { cobs:{ stage:2, cups:['Knife'], race:false, beaten:false, wins:0, bestSecs:0 }, bossKills:{ MePhone4:['Knife'] }, one:{ stage:1, erased:['Gaty'] } },
      { cobs:{ stage:1, cups:['Knife','Balloon'], race:true, raceV:RACE_LANE_V, beaten:false, wins:1, bestSecs:120 }, bossKills:{ MePhone4:['Fan'], Springy:['Balloon'] }, one:{ stage:0, erased:[] } }))`);
    const p = JSON.parse(m);
    expect(p.cobs).toEqual({ stage: 2, cups: ['Knife', 'Balloon'], race: true, raceV: W.eval('RACE_LANE_V'), beaten: false, wins: 1, bestSecs: 120 });
    // "Reset everyone's progress" (the owner, 2026-10-05): a tab's win on an older lane merges up to nothing
    expect(W.eval(`mergeCobs({ race:true }, { race:false }).race`), 'an older lane\'s win is no win').toBe(false);
    expect(p.bossKills).toEqual({ MePhone4: ['Knife', 'Fan'], Springy: ['Balloon'] });
    expect(p.one, 'One\'s merge is untouched').toEqual({ stage: 1, erased: ['Gaty'], rushLightning: false, wins: 0, bestSecs: 0 });
    expect(W.eval(`mergeCobs({ stage:3 }, { beaten:false }).beaten`), 'stage FREE is the flag too').toBe(true);
    // "No reset on a loss" (the owner, 2026-09-30): the cups of two tabs are a union, in any order -- not the longer run.
    expect(W.eval(`mergeCobs({ cups:['Taco (II)'] }, { cups:['Knife','Balloon'] }).cups`), 'the union, not the longer list').toEqual(['Knife', 'Balloon', 'Taco (II)']);
    expect(W.eval(`mergeCobs({ cups:['Knife','Balloon'] }, { cups:['Taco (II)'] }).cups`), 'whichever tab is which').toEqual(['Knife', 'Balloon', 'Taco (II)']);
    expect(W.eval(`mergeCobs({ cups:['Taco (II)','Knife'] }, { cups:'junk' }).cups`), 'any order is a set of cups, and junk is none').toEqual(['Knife', 'Taco (II)']);
    expect(W.eval(`mergeCobs({ cups:['Balloon','Balloon','Zed'] }, { cups:['Balloon'] }).cups`), 'a repeat or a stranger is cleaned').toEqual(['Balloon']);
    expect(W.eval(`mergeCobs({ bestSecs:200 }, { bestSecs:95 }).bestSecs`)).toBe(95);
    const bare = W.eval(`JSON.stringify(mergeProfiles({ unlocked:[] }, { unlocked:[] }))`);
    expect(JSON.parse(bare).cobs).toEqual({ stage: 0, cups: [], race: false, raceV: 0, beaten: false, wins: 0, bestSecs: 0 });   // (raceV: the lane a race was won on, RACE_LANE_V)
    expect(JSON.parse(bare).bossKills).toEqual({});
    expect(W.eval(`mergeBossKills({ A:['x', 3, 'y'] }, null)`)).toEqual({ A: ['x', 'y'] });
  });

  it('a save made mid-chain loads back as it was, and an old save without his fields gets them', async () => {
    await fresh(W, ALL_EXISTING);
    sub(W, 'C0B5'); sub(W, 'MISTAH PHONE');
    kill(W, { name: 'Knife', you: true, team: 0 }, 'MePhone4');
    cup(W, 'Taco (II)'); W.eval('cobsRaceWon()');   // the first cup is Taco (II): any order is kept across a reload
    await sleep(W, 0);
    const w2 = boot({ 'profile:v1': W.localStorage.getItem('profile:v1') });
    await w2.eval('profileReady');
    expect(w2.eval(`({ stage:PROFILE.cobs.stage, cups:PROFILE.cobs.cups, race:PROFILE.cobs.race, kills:PROFILE.bossKills, live:cobsChainLive(), s2:cobsStep(2), s3:cobsStep(3), gate:cobsGateOpen() })`))
      .toEqual({ stage: 1, cups: ['Taco (II)'], race: true, kills: { MePhone4: ['Knife'] }, live: true, s2: true, s3: false, gate: true });
    expect(w2.eval(`vaultSubmit('nope').reply`), 'live after the reload: "Tick, tock."').toBe(TICK);
    expect(w2.eval(`vaultSubmit('mistah phone').kind`)).toBe('again');
    w2.eval('openVault()');
    expect([...w2.document.querySelectorAll('#vaultWire .vstep')].map((s) => s.textContent)).toEqual(['1', '2']);
    const old = { version: 1, matches: 3, wins: 1, kos: 0, bossesCleared: { MePhone4: true }, soloBosses: {}, bestRushLoop: 0, wcTitles: 0,
      unlocked: ['Firey'], viewMode: 'starters', migratedFrom: null };
    const w3 = boot({ 'profile:v1': J(old) });
    await w3.eval('profileReady');
    expect(w3.eval(`({ q:cobsQ(), kills:PROFILE.bossKills, beaten:cobsBeaten(), live:cobsChainLive() })`))
      .toEqual({ q: { stage: 0, cups: [], race: false, raceV: 0, beaten: false, wins: 0, bestSecs: 0 }, kills: {}, beaten: false, live: false });
    expect(w3.eval(`vaultSubmit('C0B5')`), 'and a chain that has not opened says not yet').toEqual({ kind: 'wrong', reply: NOT_YET });
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
    // This tab saves again from its own stale copy, after a kill and a cup of its own (Taco (II): any order).
    kill(W, { name: 'Fan', you: true, team: 0 }, 'MePhone4');
    cup(W, 'Taco (II)');
    await W.eval('saveProfile()');
    const final = stored(W);
    expect(final.bossKills).toEqual({ MePhone4: ['Knife', 'Fan'], Springy: ['Balloon'] });
    expect(final.cobs.cups, 'the cups of both tabs, a union').toEqual(['Knife', 'Taco (II)']);
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
    expect(W.eval('JSON.stringify(COBS_VAULT)')).not.toMatch(/\bOJ\b|Suitcase|Cabby|The Floor/);
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
    // "3 fighters should be erased every time, not just 1." (the owner, 2026-09-29): a win erases three (ONE_ERASE_PER_WIN).
    expect(W.eval('({ one:PROFILE.one.stage, erased:PROFILE.one.erased, cobs:PROFILE.cobs.stage })')).toEqual({ one: 1, erased: ['Gaty', 'Barf Bag', 'Basketball'], cobs: 2 });
    W.eval(`PROFILE.one = { stage:0, erased:[], rushLightning:false, wins:0, bestSecs:0 }; go('title')`);
  });
});

describe('RUNNING! is reset for everyone: a win on the old lane does not count (the owner, 2026-10-05)', () => {
  // "running should be reset." -- asked, "Reset everyone's progress": ship the D5 lane, and whoever beat the old one beats it again.
  it('an old win reads as not won, the race opens again, and a new win is kept with the lane it was won on', async () => {
    await fresh(W, ALL_EXISTING);
    sub(W, 'C0B5'); sub(W, 'MISTAH PHONE'); sub(W, 'PH3N0M53 VK0CH');
    W.eval(`PROFILE.cobs.race = true; delete PROFILE.cobs.raceV;`);   // a save from before the rebuild
    expect(W.eval('cobsQ().race'), 'the old win does not count').toBe(false);
    expect(W.eval('cobsRaceOpen()'), 'RUNNING! is open again').toBe(true);
    expect(W.eval('cobsRaceWon()'), 'winning it now counts').toBe(true);
    expect(W.eval('({ race: cobsQ().race, v: cobsQ().raceV, lane: RACE_LANE_V })')).toEqual({ race: true, v: 2, lane: 2 });
    await sleep(W, 0);
    expect(stored(W).cobs.raceV, 'saved with its lane').toBe(2);
    expect(W.eval('cobsRaceOpen()'), 'and closed once won').toBe(false);
  });

  it('at his door with an old win: his card and his fight wait for the new lane; the codes, pairs and cups are kept', async () => {
    await fresh(W, ALL_EXISTING);
    sub(W, 'C0B5'); sub(W, 'MISTAH PHONE'); sub(W, 'PH3N0M53 VK0CH');
    W.eval(`${PAIRS} PROFILE.cobs.cups = ['Knife', 'Balloon', 'Taco (II)']; PROFILE.cobs.race = true; PROFILE.cobs.raceV = RACE_LANE_V; PROFILE.cobs.stage = COBS_STAGE.DOOR;`);
    expect(W.eval('cobsCardDue()'), 'a new-lane win: his card is due').toBe(true);
    W.eval(`PROFILE.cobs.raceV = 1;`);   // the same door, won on the old lane
    const r = W.eval(`({ due: cobsCardDue(), fight: cobsStoryFight(), stage: cobsQ().stage, cups: cobsQ().cups.slice(), pairs: cobsPairsDone(), open: cobsRaceOpen() })`);
    expect(r.due, 'his card waits').toBe(false);
    expect(r.fight, 'and so does his fight').toBe(false);
    expect(r.stage, 'the door code is not asked again').toBe(W.eval('COBS_STAGE.DOOR'));
    expect(r.cups).toEqual(['Knife', 'Balloon', 'Taco (II)']);
    expect(r.pairs).toBe(true);
    expect(r.open, 'RUNNING! is open for them').toBe(true);
    W.eval('cobsRaceWon()');
    expect(W.eval('cobsCardDue()'), 'won on the new lane: the door is open again').toBe(true);
  });

  it('one who has beaten him keeps the prize, whatever lane they ran', async () => {
    await fresh(W, ALL_EXISTING);
    W.eval(`PROFILE.cobs = { stage: COBS_STAGE.FREE, beaten: true, race: true, cups: ['Knife', 'Balloon', 'Taco (II)'], wins: 1 };`);
    expect(W.eval('({ beaten: cobsBeaten(), stage: cobsQ().stage })')).toEqual({ beaten: true, stage: W.eval('COBS_STAGE.FREE') });
  });
});

describe('the skip: the first fifteen primes open his door at once (the owner, 2026-10-05)', () => {
  // "give the vault a code that will skip the steps for the bosses. make it completely random.(its just the first 15 prime numbers)"
  // -> asked what it skips: "Cobs only".
  const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
  it('is the first fifteen primes run together, and appears nowhere else in the game', () => {
    expect(W.eval('COBS_SKIP')).toBe(PRIMES.join(''));
    expect(HTML.split(PRIMES.join('')).length - 1, 'written once, in its own line: nothing hints at it').toBe(1);
  });

  it('typed on a fresh save, with nothing else done: his door opens, his card waits, and nothing counts as beaten', async () => {
    await fresh(W);
    const r = sub(W, PRIMES.join(''));
    expect(r.kind).toBe('hint');
    expect(r.reply, 'never his name').not.toMatch(/cobs|steve|meeple/i);
    const q = W.eval(`({ stage: cobsQ().stage, race: cobsQ().race, v: cobsQ().raceV, due: cobsCardDue(), beaten: cobsBeaten(), one: oneQ().stage,
      found: vaultState().found.length, prize: ROSTER.filter(function(x){ return x.prize; }).some(function(x){ return isUnlocked(x); }) })`);
    expect(q.stage, 'his door').toBe(W.eval('COBS_STAGE.DOOR'));
    expect(q.race, 'the race stands done, on this lane').toBe(true);
    expect(q.v).toBe(W.eval('RACE_LANE_V'));
    expect(q.due, 'his card waits on the title').toBe(true);
    expect(q.beaten, 'nothing counts as beaten').toBe(false);
    expect(q.prize, 'his prize still waits on beating him').toBe(false);
    expect(q.one, "One's chain is untouched").toBe(0);
    expect(q.found, 'it is not kept among the found codes').toBe(0);
    await sleep(W, 0);
    expect(stored(W).cobs.stage, 'saved').toBe(W.eval('COBS_STAGE.DOOR'));
  });

  it('spaces and commas between the primes are fine; typed again it changes nothing; once he is beaten it takes nothing away', async () => {
    await fresh(W);
    expect(sub(W, PRIMES.join(' ')).kind, 'with spaces').toBe('hint');
    expect(sub(W, PRIMES.join(', ')).kind, 'again, with commas: already open').toBe('again');
    W.eval(`PROFILE.cobs.stage = COBS_STAGE.FREE; PROFILE.cobs.beaten = true;`);
    sub(W, PRIMES.join(''));
    expect(W.eval('({ stage: cobsQ().stage, beaten: cobsBeaten() })')).toEqual({ stage: W.eval('COBS_STAGE.FREE'), beaten: true });
  });
});
