// Boss Rush, one boss at a time: did a lone AI fighter beat it, how fast, how many lives it cost, and where the damage came
// from -- and a run through the end of the gauntlet. The review of the II bosses found every balance claim on the branch
// had come from a scratch script kept out of the repo ("The agents' balance numbers disagree and can't be reproduced"), so
// this is the one harness, committed, and scripts/boss-rush-balance.json holds what it printed. Run from the repo root.
//
//   node scripts/boss-solo.mjs                           every boss from the Dragon (Boss 6) to Four, and the run below
//   BOSSES='["Springy"]' node scripts/boss-solo.mjs      just these bosses (and no run)
//   FROM='Two' node scripts/boss-solo.mjs                just a run, starting at that boss
//   WRITE=1 node scripts/boss-solo.mjs                   also rewrite scripts/boss-rush-balance.json (the full default only)
//   TWEAK='S4.backoff=100' node scripts/boss-solo.mjs    try a retune without editing the game: run in every copy after it
//                                                        boots (objects and array cells only -- a const cannot be reassigned)
//
// A BOSS: one fighter from FIGHTERS, 3 stocks, AI-controlled, items off, on the Boss Rush stage, started AT the boss (a
// fresh bar, 0%). SEEDS runs per fighter (16: 240 runs a boss. The steps between the Dragon, the II bosses and Four are
// about a tenth of a life each, and at 60 runs a boss's lives lost moved by that much between retunes that changed almost
// nothing; livesLostSE is the standard error, about 0.06 at 240). A run that has not beaten the boss inside FRAMES (60 s)
// counts as not beaten. SEEDS=4 in the environment makes a quick look (it cannot be written).
// A solo fight is scored the frame the boss falls, so it must not be paid the stock that clearing every third boss pays:
// the first stored numbers were, for the Dragon, MePhone4S and Four (Bosses 6, 9 and 12), and each read about 0.8 of a
// life easier than it was.
// A RUN (FROM, default MePhone4S -- "4S 260 HP, Two 285, Cobs 330, Four 340, with no extra life between Boss 9 and Boss
// 12", as the review put it of the roster then; Springy holds Boss 11 at 330 now, "replace him with springy"): start at
// that boss with 3 stocks and play on through the gauntlet's own clear logic (the
// heal every boss, the stock every third) until Four falls or the fighter is out. RUN_SEEDS runs per fighter (2: 30 runs).
//
// Every run boots its own copy of the game and seeds its own dice (mulberry32 of the run's seed), so a run does not depend
// on what ran before it or on which worker ran it: the same build prints the same numbers, however many workers (JOBS).
import { writeFileSync, readFileSync } from 'node:fs';
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { availableParallelism } from 'node:os';
import { bootMonolith } from '../test/helpers/smash-golden.js';
import { mulberry32 } from '../test/helpers/prng.js';
import { BOSS_TUNING_EXPR, harnessCode } from './boss-tuning.mjs';

const FIGHTERS = ["Firey","Leafy","Pin","Needle","Coiny","Bubble","Pen","Snowball","Blocky","Ice Cube","Match","Pencil","Rocky","Tennis Ball","Golf Ball"];
const SEEDS_STORED = 16, SEEDS = Number(process.env.SEEDS || SEEDS_STORED), RUN_SEEDS = 2;
const FRAMES = 3600;
const RUN_FROM = 'MePhone4S';

// Sets the run up and wraps addProj/applyHit so each point of damage is filed under the move that dealt it.
const SETUP = (name, boss, run) => `
  SETTINGS.mode='boss'; SETTINGS.count=1; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=3;
  var R = ROSTER.find(function(r){ return r.name===${JSON.stringify(name)}; });
  fighters=[ makeFighter(R, WW*0.25, groundY()-60, 0) ];
  var f = fighters[0]; f.team=0; f._origTeam=0; f.controller='ai'; f.stocks=3;
  summons=[]; projectiles=[]; items=[]; tendrils=[]; beams=[]; particles=[]; running=true; paused=false; hazardT=0;
  startBossRush(); summons=[];
  BOSSRUSH.bossIdx = BOSS_ROSTER.findIndex(function(b){ return b.name===${JSON.stringify(boss)}; });
  // A run counts as if every boss before it had been beaten, so the stock every third boss falls where a whole run's would
  // (a run from MePhone4S earns one for clearing him, Boss 9, and none after until the loop -- not one for clearing Boss
  // 11, Springy). A solo fight does not: it is scored the frame the boss falls, and that stock would come off its lives lost.
  ${run ? 'BOSSRUSH.cleared = BOSSRUSH.bossIdx;' : ''}
  spawnBossRushBoss();
  var AP = addProj, AH = applyHit, depth = 0, kinds = {}, src = {};
  // Springy's slam has no shot of its own: its mark and its hole carry the slam's id, so its damage files under 'slam'.
  addProj = function(p){ if(p && p.owner===-2 && p.bossAtk!=null) kinds[p.bossAtk] = p.cobsTrap ? 'contraption' : (p.springMark || p.springHole) ? 'slam' : p.beamShot ? 'gun' : (p.shape || 'shot'); return AP(p); };
  applyHit = function(t, dmg, kx, ky, from, opts){ var p0 = t.pct; depth++; try { return AH(t, dmg, kx, ky, from, opts); } finally { depth--;
    if(depth===0 && t.pct > p0){ var k = opts && opts.bossAtk!=null ? (kinds[opts.bossAtk] || 'boss-other') : (from && (from.hostile || from.idx===-2) ? 'add' : 'other');
      src[k] = (src[k]||0) + (t.pct - p0); t._bsAcc = (t._bsAcc||0) + (t.pct - p0); } } };
`;
// One step, with anything the fighter took that applyHit did not deal (poison, bleed, burn) filed as damage over time.
const STEP = `
  var p0 = f.pct, s0 = f.stocks; f._bsAcc = 0; step();
  if(f.stocks === s0 && f.pct > p0 + f._bsAcc + 1e-9) src.dot = (src.dot||0) + (f.pct - p0 - f._bsAcc);
`;
const SOLO = (name, boss) => `(function(){ ${SETUP(name, boss)}
  var b = summons.find(function(s){ return s.type==='boss'; }), fr = 0, cleared = false;
  for(; fr<${FRAMES}; fr++){ ${STEP}
    if(b.hp <= 0 || summons.indexOf(b) < 0){ cleared = true; break; }
    if(fighters.every(function(q){ return q.dead; })) break; }
  var left = f.dead ? 0 : f.stocks;
  BOSSRUSH.active = false; running = false;
  return JSON.stringify({ cleared: cleared, frames: fr, src: src, lost: 3 - left });
})()`;
// The 1.5 s gap before the next boss is played out as 90 empty frames: the game's own setTimeout never fires inside one
// synchronous eval.
const RUN = (name, from) => `(function(){ ${SETUP(name, from, true)}
  var fr = 0, gap = 0, reached = [], won = false;
  for(; fr<${FRAMES}*8; fr++){
    var b = summons.find(function(s){ return s.type==='boss' && s._bossRush; });
    if(!b){ if(++gap < 90){ ${STEP} continue; } gap = 0; if(BOSSRUSH.loop > 0){ won = true; break; } spawnBossRushBoss(); b = summons[summons.length-1]; }
    if(reached[reached.length-1] !== b.name) reached.push(b.name);
    ${STEP}
    if(fighters.every(function(q){ return q.dead; }) || !BOSSRUSH.active) break;
  }
  won = won || BOSSRUSH.loop > 0;
  var res = { won: won, endedAt: won ? null : reached[reached.length-1], stocksLeft: f.dead ? 0 : f.stocks, s: +(fr/60).toFixed(1) };
  BOSSRUSH.active = false; running = false; paused = false;
  return JSON.stringify(res);
})()`;

async function oneRun(task){
  const W = bootMonolith(7);
  try {
    await W.eval('profileReady');
    if (process.env.TWEAK) W.eval(process.env.TWEAK);
    W.Math.random = mulberry32(task.seed);
    const r = JSON.parse(W.eval(task.from ? RUN(task.fighter, task.from) : SOLO(task.fighter, task.boss)));
    return Object.assign({ task }, r);
  } finally { W.close(); }
}

if (process.env.BOSS_SOLO_WORKER) {
  process.on('message', async (task) => {
    if (task === 'done') process.exit(0);
    process.send(await oneRun(task));
  });
} else {
  const W = bootMonolith(7);
  await W.eval('profileReady');
  const ALL = JSON.parse(W.eval('JSON.stringify(BOSS_ROSTER.map(function(b){ return b.name; }))'));
  const tuning = JSON.parse(W.eval(BOSS_TUNING_EXPR));
  W.close();
  const full = !process.env.BOSSES && !process.env.FROM;
  // The bosses measured: from MePhone4 to the end -- the same seven as before the Purple Dragon moved from Boss 6 to Boss 9
  // ("just move purple dragon!!!", the owner, 2026-09-30), when the list started at the Dragon.
  const BOSSES = process.env.BOSSES ? JSON.parse(process.env.BOSSES) : process.env.FROM ? [] : ALL.slice(ALL.indexOf('MePhone4'));
  const FROM = process.env.FROM || (full ? RUN_FROM : '');
  // Run k of a boss is fighter k % 15 on seed 100 + k, so adding seeds adds runs without changing the old ones.
  const tasks = [];
  for (const boss of BOSSES) for (let k = 0; k < FIGHTERS.length*SEEDS; k++) tasks.push({ boss, fighter: FIGHTERS[k % FIGHTERS.length], seed: 100 + k });
  if (FROM) for (let k = 0; k < FIGHTERS.length*RUN_SEEDS; k++) tasks.push({ from: FROM, fighter: FIGHTERS[k % FIGHTERS.length], seed: 100 + k });

  const jobs = Math.max(1, Math.min(tasks.length, Number(process.env.JOBS || availableParallelism() - 1)));
  const results = new Array(tasks.length);
  let next = 0;
  await Promise.all(Array.from({ length: jobs }, () => new Promise((resolve, reject) => {
    const child = fork(fileURLToPath(import.meta.url), [], { env: Object.assign({}, process.env, { BOSS_SOLO_WORKER: '1' }) });
    let mine = -1;
    const feed = () => { if (next < tasks.length){ mine = next++; child.send(tasks[mine]); } else { child.send('done'); } };
    child.on('message', (r) => { results[mine] = r; feed(); });
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error('worker exited ' + code)));
    feed();
  })));

  const bosses = BOSSES.map((boss) => {
    const rs = results.filter((r) => r.task.boss === boss);
    const src = {};
    let clears = 0, secs = 0, lives = 0;
    for (const r of rs){ if (r.cleared){ clears++; secs += r.frames/60; } lives += r.lost; for (const k in r.src) src[k] = (src[k]||0) + r.src[k]; }
    const mean = lives/rs.length, sd = Math.sqrt(rs.reduce((a, r) => a + (r.lost - mean)**2, 0)/Math.max(1, rs.length - 1));
    const tot = Object.values(src).reduce((a, v) => a + v, 0) || 1;
    const share = Object.fromEntries(Object.entries(src).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, Math.round(v/tot*100)]));
    return { boss, beaten: clears, of: rs.length, clearS: clears ? +(secs/clears).toFixed(1) : null, livesLost: +mean.toFixed(2), livesLostSE: +(sd/Math.sqrt(rs.length)).toFixed(3), share };
  });
  for (const b of bosses) console.log(JSON.stringify(b));
  let run = null;
  if (FROM){
    const rs = results.filter((r) => r.task.from);
    const endedAt = {};
    for (const r of rs) if (!r.won) endedAt[r.endedAt] = (endedAt[r.endedAt]||0) + 1;
    const winners = rs.filter((r) => r.won);
    run = { from: FROM, won: winners.length, of: rs.length, endedAt,
            stocksLeftWhenWon: winners.length ? +(winners.reduce((a, r) => a + r.stocksLeft, 0)/winners.length).toFixed(2) : null };
    console.log(JSON.stringify(run));
  }
  if (process.env.WRITE){
    if (!full || process.env.TWEAK || SEEDS !== SEEDS_STORED) throw new Error('WRITE=1 needs the full default run (no BOSSES, FROM, TWEAK or SEEDS)');
    writeFileSync('scripts/boss-rush-balance.json', JSON.stringify({ harness: 'scripts/boss-solo.mjs',
      harnessCode: harnessCode(readFileSync(fileURLToPath(import.meta.url), 'utf8')), fighters: FIGHTERS, seeds: SEEDS, runSeeds: RUN_SEEDS,
      frames: FRAMES, tuning, bosses, run }, null, 1) + '\n');
  }
}
