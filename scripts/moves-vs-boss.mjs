// MOVES VS BOSS: does any fighter move land on a BOSS more times than it should? A fighter has hit grace (a second hit
// waits it out); a boss has none, so a hitbox that is live for several frames and does not remember the boss it hit lands
// on it every frame ("puffball multihitbox on smash. instakills bosses.", the owner, 2026-10-02: Meteor Puff took 264 HP
// off a boss in one dive). This fires every move of every playable fighter once at a big-HP boss parked in front of it,
// steps FRAMES frames, and prints the HP the boss lost. Run from the repo root.
//
//   node scripts/moves-vs-boss.mjs                              every fighter in ROSTER, every move, three stagings (about 3 min on 7 workers)
//   FIGHTERS='["Puffball","Saw"]' node scripts/moves-vs-boss.mjs     just these
//   MOVES='["smash","special"]' node scripts/moves-vs-boss.mjs        just these moves (jab uptilt downtilt finisher special upspecial downspecial
//                                                               smash smashup smashdown smash-tap smash-hold)
//   STAGINGS='["above"]' node scripts/moves-vs-boss.mjs          just this staging (ground, air, above; see STAGINGS)
//   SHOW=all node scripts/moves-vs-boss.mjs                     print every row, not only the flagged ones;  SHOW=ticks also prints the designed ticks
//   VERBOSE=1 node scripts/moves-vs-boss.mjs                    each flagged row with the frames it hit on and who called damageSummon
//   BOSS='Four' node scripts/moves-vs-boss.mjs                  a real Boss Rush boss (spawned and dressed as the gauntlet does) instead of the plain dummy
//   FRAMES=150  JOBS=4  OUT=moves-vs-boss.json  SEED=5          (OUT writes every row; the exit code is the number of flagged moves)
//
// THE BOSS: a plain stationary one (attack 'basic', radius 85 like a roster boss) with 1,000,000 HP, its attack timer parked, put back where
// it stood after every frame so a knock never carries it out of a hitbox (the worst case for a move that repeats). Nothing here tunes anything.
//   ground:  the fighter stands on the floor with the boss against her, in front.
//   air:     both are in the air at the same height, the boss against her (her fall starts as the move does).
//   above:   she is 150 px over the boss's head and falling onto him: the plunges, the stomps, the drops.
// THE MOVES, each through the door the game uses: the jab (doAttack, which is the shot for the ranged attackers and the flurry for the multi-hit
// ones), up-tilt (doUpTilt), down-tilt (doGroundMove), the finisher (X+C: doAttackSpecial), the special in its three directions (fireSpecial,
// as the input block calls it), the smash straight (fireSmash) and angled up and down, and the smash through the real keyboard: a tap, and V
// held for a second and let go (smash-tap, smash-hold: on the ground only). A smash is the full charge always (E18 and O18 took the charge
// out as a dial), so a tap and a hold fire the same doSmash; the two keyboard runs are there to prove it is still one hit.
// WHAT IS FLAGGED: a move whose boss damage is over 1.5 x the biggest damage number it carries (read off every hitCircle, hitShape,
// damageSummons and shot the fighter makes, and the largest single hit the boss took), or over 40 HP for anything. DESIGNED lists the moves that
// are meant to tick (a spin aura on a fixed tick, a flurry with a set hit count) and how many hits they may land: inside that they print as
// TICK, past it as FLAG. A new fighter whose move repeats on a boss shows up here the day it is added.
import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { availableParallelism } from 'node:os';
import { writeFileSync } from 'node:fs';
import { bootMonolith } from '../test/helpers/smash-golden.js';
import { mulberry32 } from '../test/helpers/prng.js';

const FRAMES = Number(process.env.FRAMES || 150);
const SEED = Number(process.env.SEED || 5);
const MOVES = ['jab', 'empjab', 'uptilt', 'downtilt', 'finisher', 'special', 'upspecial', 'downspecial', 'smash', 'smashup', 'smashdown', 'smash-tap', 'smash-hold'];
const STAGINGS = ['ground', 'air', 'above', 'inside'];
const KEYBOARD = new Set(['smash-tap', 'smash-hold']);   // the real input path: the key is read off `down`, so the fighter is a local one

// Moves that are MEANT to land more than once on a boss, as `Fighter|move` -> { hits: the most frames the boss may be hit on, why }. `hits` counts
// the frames the boss lost HP on. Past it, the row is flagged again.
const DESIGNED = {};

// Wraps the calls a move reaches a boss through, to say who called them and which damage numbers the move carries. Installed once a boot.
// updateHUD and updateStandings are stubbed: they only rewrite the page's HUD, and in jsdom that rewrite (an innerHTML a frame) gets slower with every
// frame -- a run went from 70 ms to 2 s after about 2,500 frames. Nothing in the sim reads what they write.
const INSTALL = `
  updateHUD = function(){}; updateStandings = function(){};
  var MVB = { on:false, F:null, fr:-1, log:[], num:0, shots:[] };
  MVB.note = function(n){ if(MVB.on && typeof n === 'number' && n > MVB.num) MVB.num = n; };
  MVB.via = function(){ var out = [], L = (new Error().stack || '').split('\\n'), last = '';
    for(var i = 3; i < L.length && out.length < 5; i++){ var m = /at (?:new )?([^\\s(]+)/.exec(L[i]); if(m && m[1] !== last) out.push(last = m[1]); }
    return out.join('<'); };
  Error.stackTraceLimit = 40;
  (function(){
    var DS = damageSummon, DSs = damageSummons, HC = hitCircle, HS = hitShape, AP = addProj;
    damageSummon = function(f, s, cx, cy, dmg){ if(MVB.on && s && s.type === 'boss'){ MVB.log.push([MVB.fr, dmg, MVB.via()]); MVB.note(dmg); } return DS.apply(this, arguments); };
    damageSummons = function(f, cx, cy, rad, dmg){ if(MVB.on && f === MVB.F) MVB.note(dmg); return DSs.apply(this, arguments); };
    hitCircle = function(f, cx, cy, rad, lo, hi){ if(MVB.on && f === MVB.F){ MVB.note(lo); MVB.note(hi); } return HC.apply(this, arguments); };
    hitShape = function(f, sh, lo, hi){ if(MVB.on && f === MVB.F){ MVB.note(lo); MVB.note(hi); } return HS.apply(this, arguments); };
    addProj = function(p){ if(MVB.on && p && p.ownerObj === MVB.F){ MVB.note(p.dmg); MVB.shots.push(p.dmg + (p.pierce ? 'P' : '') + (p.van ? 'V' : '') + (p.trap || p.landsTrap ? 'T' : '') + (p.landsPuddle ? 'U' : '') + (p.bounce ? 'B' : '')); } return AP.apply(this, arguments); };
  })();
`;

// One move of one fighter, in one staging. Returns JSON.
const RUN = (o) => `(function(){
  var NAME = ${JSON.stringify(o.name)}, MOVE = ${JSON.stringify(o.move)}, STAGING = ${JSON.stringify(o.staging)}, FRAMES = ${o.frames}, BOSS = ${JSON.stringify(o.boss || '')};
  SETTINGS.mode = 'boss'; SETTINGS.count = 1; SETTINGS.items = false; SETTINGS.itemRate = 0; SETTINGS.stocks = 99; running = true; paused = false;
  BOSSRUSH = { active:false, bossIdx:0, cleared:0, defeated:false, loop:0, dmgMult:1 };
  worldPlats = []; summons = []; projectiles = []; beams = []; tendrils = []; items = []; particles = []; impactFxClear(); hazardT = 0; BOSS_ARENA = null;
  for(var k in down) delete down[k];
  var gy = groundY(), keyed = MOVE === 'smash-tap' || MOVE === 'smash-hold';
  var f = makeFighter(ROSTER.find(function(r){ return r.name === NAME; }), 300, gy - 24, 0);
  f.team = 0; f.controller = keyed ? 'local' : 'still'; f.stocks = 99; f.face = 1; f.y = gy - f.r; f.onground = true; fighters = [f];
  var b;
  if(BOSS){ BOSSRUSH.bossIdx = BOSS_ROSTER.findIndex(function(r){ return r.name === BOSS; }); spawnBossRushBoss(); b = summons.find(function(s){ return s.type === 'boss'; }); }
  else { b = makeBossSummon({ name:'Dummy Boss', color:'#9a9aff', attack:'basic', big:2.5, stationary:true }, 1e6); summons.push(b); }
  b.hp = b.maxHp = 1e6; b._atkTimer = 1e9;
  var bx, by;
  if(STAGING === 'ground'){ bx = f.x + f.r + b.r + 6; by = gy - b.r; }
  else if(STAGING === 'air'){ f.y = gy - 230; f.onground = false; bx = f.x + f.r + b.r + 6; by = f.y; }
  else if(STAGING === 'above'){ bx = f.x; by = gy - b.r; f.y = by - b.r - 150; f.onground = false; }
  else { bx = f.x + 30; by = gy - b.r; }   // inside: her middle is inside his body, as it is when a fighter walks into a boss
  var park = function(){ b.x = bx; b.y = by; b.vx = 0; b.vy = 0; b._atkTimer = 1e9; b._tel = 0; };
  park(); step(); park();   // one settling frame before the move, as the golden smash fixture takes (a body is only on the ground once the physics has said so)
  f.invuln = 0; f.pct = 0; f.atkCd = 0; f.spCd = 0; f.smCd = 0; f.fnCd = 0; f.hitstun = 0;
  var none = function(){ return { left:false, right:false, up:false, down:false, jump:false, attack:false, special:false, smash:false }; };
  var FIRE = {
    jab: function(){ doAttack(f); }, empjab: function(){ f._empower = 1; doAttack(f); }, uptilt: function(){ doUpTilt(f); }, downtilt: function(){ doGroundMove(f); }, finisher: function(){ doAttackSpecial(f); },
    special: function(){ fireSpecial(f, none()); },
    upspecial: function(){ var i = none(); i.up = true; fireSpecial(f, i); },
    downspecial: function(){ var i = none(); i.down = true; fireSpecial(f, i); },
    smash: function(){ fireSmash(f, none(), 0); },
    smashup: function(){ var i = none(); i.up = true; fireSmash(f, i, 1); },
    smashdown: function(){ var i = none(); i.down = true; fireSmash(f, i, -1); }
  };
  MVB.F = f; MVB.on = true; MVB.log = []; MVB.num = 0; MVB.fr = -1; MVB.shots = [];
  var hp0 = b.hp, frames = [], max1 = 0, bigDirect = 0, died = false, steps = FRAMES + (MOVE === 'smash-hold' ? 70 : MOVE === 'smash-tap' ? 40 : 0);
  if(FIRE[MOVE]) FIRE[MOVE]();
  var queued = f._rant ? f._rant.n : (f._multi ? 1 + f._multi.n : 1), ticks = f._sawing > 0 ? Math.floor((f._sawing - 1) / 6) + 1 : 0;   // a flurry's hits and an aura's ticks, as the move set them
  if(hp0 - b.hp > 1e-9){ frames.push([-1, +(hp0 - b.hp).toFixed(3)]); max1 = hp0 - b.hp; var seen0 = 0; MVB.log.forEach(function(e){ seen0 += e[1]; }); bigDirect = Math.max(0, max1 - seen0); }
  for(var i = 0; i < steps; i++){
    MVB.fr = i;
    if(MOVE === 'smash-tap') down[KEYS.smash] = (i === 0);
    else if(MOVE === 'smash-hold') down[KEYS.smash] = (i < 70);
    var h = b.hp, n0 = MVB.log.length; step();
    var d = h - b.hp;
    if(d > 1e-9){ frames.push([i, +d.toFixed(3)]); if(d > max1) max1 = d;
      var seen = 0; for(var j = n0; j < MVB.log.length; j++) seen += MVB.log[j][1]; if(d - seen > bigDirect) bigDirect = d - seen; }
    if(f._dashDmg) MVB.note(f._dashDmg);
    if(f._sawing > 0) MVB.note(4);
    park(); if(f.dead) died = true;
  }
  MVB.on = false; MVB.F = null;
  var ev = {}, logged = 0, big = 0;
  MVB.log.forEach(function(e){ var s = ev[e[2]] || (ev[e[2]] = [0, 0]); s[0]++; s[1] += e[1]; logged += e[1]; if(e[1] > big) big = e[1]; });
  var lost = hp0 - b.hp;
  var res = { lost: +lost.toFixed(2), hitFrames: frames.length, burst: +max1.toFixed(2), num: +Math.max(MVB.num, big, MVB.num > 0 || big > 0 ? 0 : bigDirect).toFixed(2),
    direct: +(lost - logged).toFixed(2), hitsAllowed: queued, ticks: ticks, shots: MVB.shots.slice(0, 24), frames: frames.slice(0, 60), ev: ev, died: died };
  summons = []; fighters = []; projectiles = []; beams = []; tendrils = []; particles = []; for(var k2 in down) delete down[k2];
  return JSON.stringify(res);
})()`;

const key = (r) => `${r.name}|${r.move}`;
// FLAG: well past the number the move carries, or past 40 HP. TICK: flagged by that rule but listed in DESIGNED and inside its hit count.
function classify(r) {
  if (r.error) return 'ERROR';
  const ref = Math.max(r.num, 0.01);
  if (!(r.lost > 1.5 * ref + 1e-6 || r.lost > 40)) return 'ok';
  // a flurry (_multi, Dora's _rant) lands its set count of the biggest number, an aura (_sawing) lands 4 every 6 frames: that is the move ticking as written
  if (r.lost <= (ref * r.hitsAllowed + 4 * r.ticks) * 1.05 + 0.01) return 'TICK';
  const d = DESIGNED[key(r)];
  return d && r.hitFrames <= d.hits ? 'TICK' : 'FLAG';
}

async function oneFighter(name) {
  const W = bootMonolith(SEED);
  const rows = [];
  try {
    await W.eval('profileReady');
    W.eval(INSTALL);
    const moves = process.env.MOVES ? JSON.parse(process.env.MOVES) : MOVES;
    const stagings = process.env.STAGINGS ? JSON.parse(process.env.STAGINGS) : STAGINGS;
    for (const move of moves) for (const staging of stagings) {
      if (KEYBOARD.has(move) && staging !== 'ground') continue;
      W.Math.random = mulberry32(SEED);   // every run on the same dice, whatever ran before it
      const row = { name, move, staging }, t0 = Date.now();
      try { Object.assign(row, JSON.parse(W.eval(RUN({ name, move, staging, frames: FRAMES, boss: process.env.BOSS })))); }
      catch (e) { row.error = String(e && e.message || e).split('\n')[0]; }
      row.ms = Date.now() - t0; row.verdict = classify(row);
      rows.push(row);
    }
  } finally { W.close(); }
  return rows;
}

const fmt = (r) => {
  const ref = Math.max(r.num, 0.01), top = Object.entries(r.ev || {}).sort((a, b) => b[1][1] - a[1][1]).slice(0, 2).map(([k, v]) => `${k} x${v[0]}`).join(' | ');
  return `${r.verdict.padEnd(5)} ${r.name.padEnd(13)} ${r.move.padEnd(11)} ${r.staging.padEnd(6)} lost ${String(r.lost).padStart(7)} in ${String(r.hitFrames).padStart(3)} frames` +
    `  biggest ${r.num}  (x${(r.lost / ref).toFixed(1)})${r.direct > 0.5 ? `  direct ${r.direct}` : ''}${r.died ? '  (KO)' : ''}${top ? '   ' + top : ''}`;
};

if (process.env.MVB_WORKER) {
  process.on('message', async (name) => {
    if (name === 'done') process.exit(0);
    process.send(await oneFighter(name));
  });
} else {
  const W = bootMonolith(SEED);
  await W.eval('profileReady');
  const ALL = JSON.parse(W.eval('JSON.stringify(ROSTER.map(function(r){ return r.name; }))'));
  W.close();
  const names = process.env.FIGHTERS ? JSON.parse(process.env.FIGHTERS) : ALL;
  const jobs = Math.max(1, Math.min(names.length, Number(process.env.JOBS || availableParallelism() - 1)));
  const results = new Array(names.length);
  let next = 0;
  await Promise.all(Array.from({ length: jobs }, () => new Promise((resolve, reject) => {
    const child = fork(fileURLToPath(import.meta.url), [], { env: Object.assign({}, process.env, { MVB_WORKER: '1' }) });
    let mine = -1;
    const feed = () => { if (next < names.length) { mine = next++; child.send(names[mine]); } else child.send('done'); };
    child.on('message', (rs) => { results[mine] = rs; feed(); });
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error('worker exited ' + code)));
    feed();
  })));
  const rows = results.flat();
  const show = process.env.SHOW || '';
  const out = rows.filter((r) => show === 'all' || r.verdict === 'FLAG' || r.verdict === 'ERROR' || (show === 'ticks' && r.verdict === 'TICK'));
  for (const r of out) {
    console.log(fmt(r));
    if (process.env.VERBOSE && r.verdict !== 'ok') {
      console.log('      frames ' + (r.frames || []).map(([f, d]) => `${f}:${d}`).join(' ') + (r.shots && r.shots.length ? `   shots ${r.shots.join(' ')}   (P pierce, V van, T trap, U puddle, B bounce)` : ''));
      for (const [k, v] of Object.entries(r.ev || {})) console.log(`      ${k}  x${v[0]}  ${v[1].toFixed(1)}`);
    }
  }
  const count = (v) => rows.filter((r) => r.verdict === v).length;
  const flaggedMoves = new Set(rows.filter((r) => r.verdict === 'FLAG').map(key));
  console.log(`\n${names.length} fighters, ${rows.length} runs (${FRAMES} frames each): ${count('FLAG')} FLAG (${flaggedMoves.size} moves), ${count('TICK')} TICK (designed), ${count('ERROR')} ERROR, ${count('ok')} ok`);
  if (process.env.OUT) writeFileSync(process.env.OUT, JSON.stringify(rows, null, 1) + '\n');
  process.exitCode = flaggedMoves.size;
}
