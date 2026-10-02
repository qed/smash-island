// Solves RUNNING!'s hard sections and writes the programs the test plays back.
//
//   node scripts/solve-running-lane.mjs            writes test/data/running-lane.json
//   node scripts/solve-running-lane.mjs --check    solves again and says whether the file on disk is what it would write (writes nothing)
//
// The owner (2026-10-02): "running should be d5 bfdi:branches difficulty". The lane has to stay winnable as Knife by a skilled player,
// with no checkpoint, and this is the proof of it (test/helpers/running-solver.page.js has the method): the runner plays the lane as the
// test plays it, the scripted runner for the old kinds, and at every section with a `sec` he comes to, every plan of a few presses is
// tried on the game's own step() and the one with the most room is kept. The numbers come out as programs (a few frames each) with the
// room of every press, and where and when each section began and ended, so that the test can see the run it plays back is the one that
// was solved. Run this again whenever the lane changes: test/running-race.test.js says so when it has to.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadMonolith } from '../test/helpers/load-monolith.js';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const BOT = readFileSync(here('../test/helpers/running-bot.page.js'), 'utf8');
const SOLVER = readFileSync(here('../test/helpers/running-solver.page.js'), 'utf8');
const OUT = here('../test/data/running-lane.json');

const t0 = Date.now();
const W = loadMonolith(11).window;   // the test's seed
await W.eval('profileReady');
W.eval(SOLVER);
const res = W.eval(`(function(){
  SETTINGS.itemRate=3; SETTINGS.items=true; SETTINGS.stocks=3; LOCAL_PLAYERS=1;
  startRunningRace({ onEnd:function(){ return true; } });
  var you = fighters.find(function(f){ return f.you; });
  var K = KEYS, hold = function(o){ down[K.left]=!!o.left; down[K.right]=!!o.right; down[K.jump]=!!o.jump; down[K.down]=!!o.down; down[K.special]=!!o.special; down[K.attack]=!!o.attack; down[K.smash]=!!o.smash; };
  hold({});
  var __hud = updateHUD; updateHUD = function(){};
  fighters.forEach(function(f){ if(f !== you) f.dead = true; });   // the solo world: nobody else is on the lane while it is solved
  ${BOT}
  var hash = __rs.laneHash(), C = __rs.controller({ bot:__bot, programs:null }), n = 0, minLead = 1e9;   // the lane's fingerprint is taken before anything has moved on it
  for(; n < 14000 && running && !(you.x + you.r > RACE.edge - 80) && C.failed < 0; n++){ hold(C.ctl(you)); step(); if(!you.dead) minLead = Math.min(minLead, you.x - RACE.lineX); }
  hold({});
  return { hash:hash, frames:n, x:you.x, edge:RACE.edge, over:RACE.over, failed:C.failed, secs:C.secs, minLead:minLead, lead:you.x - RACE.lineX,
    programs:C.recs.map(function(r, i){ return Object.assign({}, r, C.seen[i]); }) };
})()`);

const secs = res.programs;
console.log('lane ' + res.hash + ': ' + res.secs + ' sections, run to x=' + Math.round(res.x) + ' of ' + res.edge + ' in ' + res.frames + ' frames, lead ' + Math.round(res.lead) + ' px (least ' + Math.round(res.minLead) + '), ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');
for (const [i, p] of secs.entries()) console.log('  #' + i + ' ' + p.k + ' at ' + Math.round(p.x) + ': ' + (p.steps ? p.steps.map((s) => '[w' + s.w + ' t' + s.t1 + ' d' + s.d2 + ']').join('') + ' room ' + p.room + ' frames' : 'NO PLAN'));
if (res.failed >= 0 || res.over || res.x + 24 <= res.edge - 80) { console.error('the run did not reach the edge: section ' + res.failed + ' has no plan with room to spare'); process.exit(1); }

const text = JSON.stringify({ lane: res.hash, programs: secs }, null, 1).split('\n').join('\r\n') + '\r\n';
if (process.argv.includes('--check')) {
  let disk = ''; try { disk = readFileSync(OUT, 'utf8'); } catch (e) {}
  console.log(disk === text ? 'running-lane.json is current' : 'running-lane.json is STALE: run node scripts/solve-running-lane.mjs');
  process.exit(disk === text ? 0 : 1);
}
writeFileSync(OUT, text);
console.log('wrote ' + OUT);
process.exit(0);
