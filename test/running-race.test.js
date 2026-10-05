import { describe, it, expect, beforeAll, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadMonolith } from './helpers/load-monolith.js';

// A whole scripted run of the lane is thousands of frames of the real game loop; the file shares one such run between its
// tests, and the tests that step the lane a hazard at a time are each hundreds of frames.
vi.setConfig({ testTimeout: 300000 });

// RUNNING!, the Red Line Game: a one-off race, the RUNNING! step of Steve Cobs's unlock chain (startRunningRace). The owner:
// "1, and there will be a continuously moving line and obstacles you must go through." / "attacks allowed" / "Then Knife
// crosses too" (a bridge or platform appears once she lands and he must cross before the moving line catches him). And the
// standing rule on the line: never tune it for a bot -- "dont tune, cuz thats an agent, not a player". The scripted runner
// below holds right and plays each obstacle the way a player reads it; when it cannot finish, the course's fairness (spacing,
// windows, hazards) is what gets fixed, never the line.
// The wiki (MeAfterlife): "a running lane with a finish line called the Red Line Game. If someone runs on it, a red line will
// appear and chase after them ... If the red line reaches them before they make it, the line "deletes" them."
//
// THE OWNER'S DECISIONS OF 2026-09-29, which changed what this file pinned:
//   "the run should be much longer, and the wall should move faster." -- the lane is 2.5 to 3 times the first version's
//       7,700 px, and the wall is faster than its 4.2 px a frame (still slower than a sprint, or nobody could win).
//   "harder obstacles that increase in strength" and "New hazards later" -- what stands on the lane grows with how far along
//       it stands, and the back half brings hazards the first half does not have (piano, memory, voice: the episode's own).
//   "you should throw marshmallow at the end with a looong charged smash" -- asked what the throw should be: "Charged smash".
//       It replaced the modified grappling hook ("and you have to throw marshmallow with a modified grappling hook at the
//       end to sling her over"): hold smash beside Marshmallow at the edge, up to about three seconds, longer = farther; too
//       short and she lands in the gap and "You lose the run". A meter and a glow on Knife and an arc of where she will land:
//       no words.
//   The owner also said "actually, it works!!! just make it longer and harder": the race before these changes was not
//       hunted for bugs, so nothing here pins a fix; only the new behaviour is pinned.
//   2026-09-30: "also add actual platformer hazards!!!! it doesnt always have to be canon!!!" -- spikes (and spike pits), spiked
//       ceilings, springs, fire jets, conveyor belts, crumbling floors, swinging saws, cannons and moving platforms over pits,
//       from what Mario, Sonic, Super Meat Boy, Celeste, Mega Man, Donkey Kong Country, Rayman and Geometry Dash keep using. They
//       run the whole lane, growing with it, among the classics and the episode's; the canon ones stay in the back half.
//   2026-10-02: "running should be d5 bfdi:branches difficulty" (the lane was "Too easy"; what to change: "Jumps, Hazard timing and Length"), and "and also just
//       not just having to jump over easy things to jump over; i want at least one thing to be slightly kaizo." -- the lane is
//       30-40% longer, full of precision platforming (planks, pillars, leaps), hazards in combination with tighter windows (a saw across a pit, jets on the
//       island you land on, a cannon covering a jump) and, last, the hairline (a slightly kaizo sequence). The line's speed was not theirs to pick and is
//       untouched; no checkpoint; the lane has to stay winnable by a skilled player, and "the run" below is the proof (a solver plays every section on the
//       real engine and the tests play it back). The pins above that were the OLD lane's -- its length, which kinds stand in the front half, how long a
//       run-up is, where a runner can safely stand near the edge -- are updated with that, none of them loosened: what is new is pinned in its own describes.

let W;
// loadMonolith's canvas shim hands back gradient objects, so the real draw() runs to completion under jsdom and the loop's
// one-time "ERROR:" line never goes up: the banner tap below must see GO! and nothing else.
beforeAll(async () => { W = loadMonolith(11).window; await W.eval('profileReady'); W.eval(SOLVER); });

// Every banner() call is recorded from the first race on: a race may say GO!, and nothing else, until its result screen.
const TAP = `if(!window.__bannerTap){ window.__bannerTap=true; window.__banners=[]; var _b=banner; banner=function(t,m,k,l){ window.__banners.push({text:String(t), kind:k||null}); return _b(t,m,k,l); }; }`;
// Start the race the way the unlock chain will: startRunningRace({ onEnd }). onEnd returns true so no result screen is
// scheduled in the middle of the next test. `you` is the local runner (Knife unless the hidden `fighter` option says otherwise).
const race = (opts, body) => W.eval(`(function(){
  ${TAP} SETTINGS.itemRate=3; SETTINGS.items=true; SETTINGS.stocks=3; LOCAL_PLAYERS=1; window.__raceEnd = undefined; window.__raceResult = null;
  var __b0 = window.__banners.length;   // banners from this race's GO! on: window.__banners.slice(__b0)
  var __ok = startRunningRace(Object.assign(${JSON.stringify(opts || {})}, { onEnd:function(won, res){ window.__raceEnd = won; window.__raceResult = res; return true; } }));
  var you = fighters.find(function(f){ return f.you; }), marsh = fighters.find(function(f){ return f._marsh; });
  var K = KEYS, hold = function(o){ down[K.left]=!!o.left; down[K.right]=!!o.right; down[K.jump]=!!o.jump; down[K.down]=!!o.down; down[K.special]=!!o.special; down[K.attack]=!!o.attack; down[K.smash]=!!o.smash; };
  hold({});
  ${body}
})()`);

// The long loops below skip the HUD: under jsdom updateHUD (DOM work, display only) is about nine tenths of a frame's cost, and a
// whole run of the lane is thousands of frames. Every short test runs the real thing, HUD and all, and so does the first frame of
// every race here.
const quick = (opts, body) => race(opts, `var __hud = updateHUD; updateHUD = function(){}; try { ${body} } finally { updateHUD = __hud; }`);

// THE SCRIPTED RUNNER (page code) is test/helpers/running-bot.page.js: it holds right and reads the lane the way a player reads the screen,
// and never dodges an AI runner. The lane's hard sections are played by the plans of test/helpers/running-solver.page.js instead, which
// scripts/solve-running-lane.mjs found by search on the real engine (see "the run" below). Both are spliced in or eval'd here, so every
// test runs the real thing.
const BOT = readFileSync('test/helpers/running-bot.page.js', 'utf8');
const SOLVER = readFileSync('test/helpers/running-solver.page.js', 'utf8');
const PROG = JSON.parse(readFileSync('test/data/running-lane.json', 'utf8'));   // the plans, and the lane they were solved on

// ---- the numbers the engine gives (measured, never assumed), and the lane as built ----
// Run flat and full speed on an endless floor: how far one jump carries, how far the best double jump carries, how high
// each rises, and for how many frames the feet are above a given height (the windows the hazards are judged against).
let PH = null;
const physics = (heights) => PH || (PH = quick({}, `
  var fy = RACE.floorY;
  worldPlats = [{ x:-4000, y:fy, w:90000, h:60, solid:true, floor:0 }];
  fighters.forEach(function(f){ if(f!==you){ f.dead = true; } });
  var hs = ${JSON.stringify(heights)};
  function reset(){ you.controller='local'; you.x = 500; you.y = fy - you.r; you.vx = 0; you.vy = 0; you.hitstun=0; you.invuln=0; you.dead=false; you.jumps=2; you.onground=false; you.slowed=0; hold({}); for(var i=0;i<3;i++){ RACE.lineX=-1e6; step(); } }
  function jumpTest(tau2){
    reset(); hold({right:true}); for(var i=0;i<12;i++){ RACE.lineX=-1e6; step(); }
    var xj = you.x, t = 0, j2 = false, apex = 0, above = {};
    hs.forEach(function(h){ above[h] = 0; });
    hold({right:true, jump:true}); RACE.lineX=-1e6; step(); t++; hold({right:true});
    while(!you.onground && t < 200){
      var doJ = (tau2!==null && !j2 && t >= tau2);
      hold({right:true, jump:doJ}); if(doJ) j2 = true;
      RACE.lineX=-1e6; step(); t++; if(doJ) hold({right:true});
      var ht = fy - you.r - you.y; apex = Math.max(apex, ht);
      hs.forEach(function(h){ if(ht >= h) above[h]++; });
    }
    hold({});
    return { dist:you.x - xj, frames:t, apex:apex, above:above };
  }
  var best = { dist:0, apex:0 };
  for(var tau = 0; tau <= 38; tau += 4){ var j = jumpTest(tau); best.dist = Math.max(best.dist, j.dist); best.apex = Math.max(best.apex, j.apex); }
  return { single:jumpTest(null), double18:jumpTest(18), best:best, maxvx:MAXVX, r:you.r, grav:GRAV };`));
let LANE = null;
const lane = () => LANE || (LANE = race({}, `return { obs:RACE.obstacles, haz:RACE.hazards, pianos:RACE.pianos, voices:RACE.voices, memories:RACE.memories, traps:RACE.traps, cannons:RACE.cannons, pendulums:RACE.pendulums, pits:RACE.pits,
  crumbles:RACE.crumbles.map(function(c){ return { x:c.x, w:c.w, delay:c.delay, s:c.s, g:c.g }; }), fakes:RACE.fakes.map(function(c){ return { x:c.x, w:c.w, y:c.y, h:c.h, delay:c.delay, hair:!!c.hair, s:c.s, g:c.g }; }), ferries:RACE.ferries.map(function(f){ return { gx:f.gx, gw:f.gw, w:f.w, period:f.period, phase:f.phase, g:f.g, i:f.i, s:f.s }; }),
  bullet:RACE_BULLET, grav:GRAV, floor:RACE.floorY, edge:RACE.edge, farX:RACE.farX, finishX:RACE.finishX, WW:WW, W:W, backX:RACE_BACK_X, len:RACE_LEN, lineSpeed:RACE_LINE_SPEED, maxvx:MAXVX, r:you.r, plats:JSON.stringify(worldPlats),
  hash:__rs.laneHash() };`));
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;

// ONE scripted run of the whole lane, shared by the tests below (a full run is the slow part of this file).
let RUN = null;
const fullRun = () => RUN || (RUN = quick({}, `${BOT}
  fighters.forEach(function(f){ if(f !== you && !f._marsh) f.dead = true; });   // the solved world: the runners are not on the lane, Marshmallow is (see PACKRUN for the runners)
  var C = __rs.controller({ bot:__bot, programs:${JSON.stringify(PROG.programs)}, verify:true });   // the plans on file for the lane's hard sections, the scripted runner for the rest
  var out = __run(you, hold, 10000, C.ctl);
  var first = RACE.obstacles[0];
  var seen = window.__banners.slice(__b0).map(function(b){ return b.text + '|' + (b.kind||''); });
  var gone = fighters.filter(function(f){ return f._runner && !f._marsh && f.dead; });
  var past = fighters.filter(function(f){ return f._runner && !f._marsh && (f.dead || f.x > first.x1 + 40); }).length;
  return { run:out, over:RACE.over, won:RACE.won, end:window.__raceEnd, why:window.__raceResult && window.__raceResult.why, ranAs:window.__raceResult && window.__raceResult.fighter,
    secs:window.__raceResult && window.__raceResult.secs, title:document.getElementById('resultTitle').textContent, sub:document.getElementById('resultSub').textContent,
    youX:Math.round(you.x), youXf:you.x, finish:RACE.finishX, edge:RACE.edge, farX:RACE.farX, marshOver:RACE.marshOver, marshX:Math.round(marsh.x), marshAlive:!marsh.dead, floor:RACE.floorY, marshY:Math.round(marsh.y + marsh.r),
    seen:seen, err:!!window.__loopErrLogged, gone:gone.map(function(f){ return f.name; }), past:past, speed:RACE_LINE_SPEED, leash:RACE_MARSH_LEASH, full:RACE_THROW_FULL,
    lineAtEnd:Math.round(RACE.lineX), plan:{ seen:C.seen, secs:C.secs, failed:C.failed, at:C.si } };`));

// PACKRUN: the same runner with every runner of the MeAfterlife group on the lane too, as far as the first of the hard sections (the runners
// have no plan for those: they run into the pit as the slow ones run into the line, which is the owner's "the runners can be caught more
// often"). A section's plan is for the lane without the pack: a jab ("attacks allowed") at the wrong frame would spoil any plan.
let PACK = null;
const packRun = () => PACK || (PACK = quick({}, `${BOT}
  var first = RACE.obstacles[0], sec0 = RACE.obstacles.find(function(o){ return o.sec; }), stopX = sec0 ? sec0.sec.sx : RACE.edge - 80, n = 0;
  while(running && n < 10000 && you.x < stopX){ hold(__bot(you)); step(); n++; }
  hold({});
  var gone = fighters.filter(function(f){ return f._runner && !f._marsh && f.dead; });
  return { frames:n, over:RACE.over, youX:you.x, stopX:stopX, gone:gone.map(function(f){ return f.name; }),
    past:fighters.filter(function(f){ return f._runner && !f._marsh && (f.dead || f.x > first.x1 + 40); }).length };`));

const CANON = ['piano', 'memory', 'voice'];
const PLATFORMER = ['spikes', 'ceiling', 'spring', 'fire', 'belt', 'crumble', 'pendulum', 'cannon', 'ferry'];
const nondecreasing = (arr, f, why) => { for (let i = 1; i < arr.length; i++) expect(f(arr[i]), why).toBeGreaterThanOrEqual(f(arr[i - 1])); };

describe('the course', () => {
  it('is a much longer lane of the classics, the platformer hazards and the episode\'s, laid from a fixed seed: the same every time', () => {
    const SNAP = `{ obs:JSON.stringify(RACE.obstacles), plats:JSON.stringify(worldPlats), haz:JSON.stringify(RACE.hazards), pianos:JSON.stringify(RACE.pianos), voices:JSON.stringify(RACE.voices), memories:JSON.stringify(RACE.memories),
      traps:JSON.stringify(RACE.traps), cannons:JSON.stringify(RACE.cannons), pendulums:JSON.stringify(RACE.pendulums), crumbles:JSON.stringify(RACE.crumbles.map(function(c){ return [c.x, c.w, c.delay]; })),
      fakes:JSON.stringify(RACE.fakes.map(function(c){ return [c.x, c.w, c.delay]; })), ferries:JSON.stringify(RACE.ferries.map(function(f){ return [f.gx, f.gw, f.period, f.phase]; })), pits:JSON.stringify(RACE.pits) }`;
    const a = race({}, `var snap = ${SNAP}; snap.ok = __ok; snap.WW = WW; snap.W = W; snap.len = RACE_LEN; snap.kinds = RACE.obstacles.map(function(o){ return o.k; }); snap.edge = RACE.edge; snap.far = RACE.farX; snap.floor = RACE.floorY;
      snap.gy = groundY(); snap.big = isBig(); snap.scrolls = scrolls(); snap.mode = SETTINGS.mode; snap.items = itemSpawnInterval(); return snap;`);
    const b = race({}, `return ${SNAP};`);
    expect(a.ok).toBe(true);
    for (const k of ['obs', 'plats', 'haz', 'pianos', 'voices', 'memories', 'traps', 'cannons', 'pendulums', 'crumbles', 'fakes', 'ferries', 'pits']) expect(a[k], 'the same ' + k).toBe(b[k]);
    // "the run should be much longer" (2026-09-29): the first version's lane was 7,700 px, the next 22,800 (2.96 times that). Then the owner (2026-10-02): "running
    // should be d5 bfdi:branches difficulty", asked what to change: "Jumps, Hazard timing and Length": the lane is 30-40% longer than those 22,800 px, and
    // what the length is for is harder sections, not filler
    expect(a.len / 22800, 'the d5 lane is 30-40% longer than the one before it').toBeGreaterThanOrEqual(1.3);
    expect(a.len / 22800).toBeLessThanOrEqual(1.4);
    expect(a.WW).toBe(a.len + 620 + 520);
    expect(a.kinds.length, 'a long lane has a lot on it').toBeGreaterThanOrEqual(30);
    for (const k of ['gap', 'wall', 'bar', 'piston'].concat(CANON, PLATFORMER)) expect(a.kinds, 'every kind of obstacle is on the course: ' + k).toContain(k);
    expect(a.kinds[0], 'the first obstacle is a gap to jump').toBe('gap');
    expect(a.far - a.edge, 'the last gap is past any jump').toBeGreaterThan(560);
    expect([a.gy, a.big, a.scrolls, a.mode]).toEqual([a.floor, true, true, 'ffa']);
    expect(a.items, 'no items, whatever the setting').toBe(0);
  });

  it('gets harder along the lane: what stands later is wider, taller, quicker or meaner than what stood early (owner: "harder obstacles that increase in strength")', () => {
    const L = lane(), by = (k) => L.obs.filter((o) => o.k === k), tr = (k) => L.traps.filter((t) => t.k === k);
    const width = (o) => o.x1 - o.x0, height = (o) => L.floor - o.top;
    // the classics: the later half of the ones on the lane (by where they stand) against the earlier half
    const rises = (a, f, by, label) => { const v = a.slice().sort((p, q) => p.x0 - q.x0).map(f), h = Math.floor(v.length / 2); expect(h, label + ': enough of them to compare').toBeGreaterThanOrEqual(1); expect(mean(v.slice(v.length - h)), label).toBeGreaterThan(mean(v.slice(0, h)) + by); };
    rises(by('gap'), width, 25, 'gaps widen'); rises(by('wall'), height, 15, 'walls rise'); rises(by('bar'), width, 0, 'the ledges lengthen');
    const hf = L.haz.filter((h) => h.s < 0.5), hl = L.haz.filter((h) => h.s >= 0.5);
    expect(hf.length).toBeGreaterThan(0); expect(hl.length).toBeGreaterThan(0);
    expect(mean(hl.map((h) => h.period)), 'pistons pound faster').toBeLessThan(mean(hf.map((h) => h.period)) - 10);
    expect(mean(hl.map((h) => h.w)), 'and are wider').toBeGreaterThan(mean(hf.map((h) => h.w)));
    expect(mean(hl.map((h) => h.stun)), 'and stun longer').toBeGreaterThan(mean(hf.map((h) => h.stun)));
    expect(mean(hl.map((h) => -h.kx)), 'and shove harder').toBeGreaterThan(mean(hf.map((h) => -h.kx)));
    const runs = {}; for (const h of L.haz) runs[h.g] = (runs[h.g] || 0) + 1;
    expect(Math.max(...Object.values(runs)), 'from part way in they come in runs of two and three').toBeGreaterThanOrEqual(3);
    expect(Math.min(...L.haz.filter((h) => runs[h.g] > 1).map((h) => h.s)), 'but not in the first third').toBeGreaterThan(0.3);
    // the platformer hazards: each is sized by how far along it stands, so later is never weaker
    nondecreasing(by('spikes'), width, 'spike strips lengthen');
    nondecreasing(by('belt'), width, 'belts lengthen'); nondecreasing(by('belt'), (o) => o.bs, 'and run faster');
    nondecreasing(by('crumble'), (o) => o.tiles, 'crumbling floors lengthen'); nondecreasing(by('crumble'), (o) => -o.delay, 'and drop sooner');
    nondecreasing(by('cannon'), (o) => o.n, 'cannons fire more shots'); nondecreasing(L.cannons, (c) => c.bs, 'faster'); nondecreasing(L.cannons, (c) => -c.gap, 'and closer together');
    nondecreasing(by('ceiling'), (o) => -o.tip, 'the ceilings come lower');
    nondecreasing(tr('fire').filter((t, i, a) => i === 0 || t.g !== a[i - 1].g), (t) => -t.period, 'vents cycle faster'); nondecreasing(tr('fire'), (t) => t.burn, 'and burn longer'); nondecreasing(tr('fire'), (t) => t.hf, 'and higher');
    nondecreasing(L.pendulums, (p) => p.R, 'saws grow'); nondecreasing(L.pendulums, (p) => -p.period, 'and swing faster');
    nondecreasing(L.ferries.filter((f) => f.i === 0), (f) => f.gw, 'ferry pits widen'); nondecreasing(L.ferries.filter((f) => f.i === 0), (f) => -f.period, 'and the ferries run faster');
    expect(tr('spikes').length, 'and there are spikes').toBeGreaterThan(3);
  });

  it('the episode\'s hazards are all in the back half, never the front; the platformer hazards run the whole lane, the hardest of them only in its back half (owner: "New hazards later", "also add actual platformer hazards")', () => {
    const L = lane(), inFront = (o) => o.x0 < L.backX;
    expect(L.backX / L.len, 'the back half').toBeCloseTo(0.5, 1);
    for (const k of CANON) {
      const os = L.obs.filter((o) => o.k === k);
      expect(os.length, k + ' is on the lane').toBeGreaterThanOrEqual(1);
      for (const o of os) expect(o.x0, k + ' is in the back half').toBeGreaterThanOrEqual(L.backX);
    }
    const front = L.obs.filter(inFront).map((o) => o.k), back = L.obs.filter((o) => !inFront(o)).map((o) => o.k);
    // owner, 2026-10-02: "running should be d5 bfdi:branches difficulty" (asked what to change: "Jumps, Hazard timing and Length"): the front half has the
    // lane's precision jumps too, the stairs of small platforms (planks, pillars), and the first hazards in combination built of the gentler ones (jets on a platform you
    // land on, a cannon covering a jump) -- they are what the harder lane is for, and none is an episode hazard (the saw across a pit is a pendulum's: back half only)
    for (const k of front) expect(['gap', 'wall', 'bar', 'piston', 'spikes', 'fire', 'belt', 'spring', 'cannon', 'planks', 'pillars', 'leap', 'jetpad', 'coverfire'], 'the front half has the classics, the gentler platformer hazards, the first precision jumps and combinations: ' + k).toContain(k);
    expect(new Set(front.filter((k) => PLATFORMER.includes(k))).size, 'the platformer hazards start early').toBeGreaterThanOrEqual(4);
    for (const k of PLATFORMER.filter((k) => k !== 'belt')) expect(back, 'and every one of them but the gentlest, the belt, is in the back half too: ' + k).toContain(k);
    for (const k of ['ceiling', 'crumble', 'pendulum', 'ferry']) expect(front, 'the hardest wait for the back half: ' + k).not.toContain(k);
    // later is never weaker for the episode's either
    nondecreasing(L.pianos, (p) => p.w, 'pianos widen'); nondecreasing(L.pianos, (p) => p.stun, 'and crush harder'); nondecreasing(L.pianos, (p) => -p.T, 'and land sooner');
    nondecreasing(L.memories, (m) => m.w, 'memories widen'); nondecreasing(L.memories, (m) => m.h, 'and grow'); nondecreasing(L.memories, (m) => m.slow, 'and slow longer');
    nondecreasing(L.voices, (v) => v.sp, 'voices quicken'); nondecreasing(L.voices, (v) => v.h, 'and rise'); nondecreasing(L.voices, (v) => v.stun, 'and stop you for longer');
  });

  it('every obstacle can be beaten with room to spare, judged against what the engine measures (the fairness the line is never tuned for)', () => {
    const L0 = lane(), heights = [...new Set([14, 26, 33].concat(L0.voices.map((v) => v.h), L0.memories.map((m) => m.h)))];   // the pad (14), the spikes (26), the low shot (33), each wave and memory
    const P = physics(heights), L = L0, r = P.r, v = P.maxvx;
    expect(P.single.dist, 'a running jump carries about 256 px').toBeGreaterThan(240);
    expect(P.best.dist, 'and a double jump about twice that').toBeGreaterThan(480);
    expect(P.single.apex).toBeGreaterThan(110); expect(P.best.apex).toBeGreaterThan(230);
    for (const o of L.obs) {
      if (o.k === 'gap') {
        const g = o.x1 - o.x0;
        expect(g, 'a late second jump leaves a window of 10 frames or more at the take-off').toBeLessThanOrEqual(P.best.dist - 10 * v + 8);
        if (o.s < 1 / 3) expect(g, 'the first third can be jumped once').toBeLessThanOrEqual(P.single.dist);
      }
      if (o.k === 'wall') {
        const h = L.floor - o.top;
        expect(h, 'a double jump tops it with room').toBeLessThanOrEqual(P.best.apex - 45);
        if (o.s < 0.2) expect(h, 'the first fifth can be topped by one jump').toBeLessThanOrEqual(P.single.apex - 10);
      }
      if (o.k === 'bar') {
        const bar = JSON.parse(L.plats).find((p) => p.raceBar && p.x === o.barX0);
        expect(bar).toBeTruthy();
        expect(L.floor - o.ledgeY, 'the step onto the ledge is hoppable').toBeLessThanOrEqual(100);
        expect(L.floor - o.ledgeY - 12, 'a fighter (48 px) fits under the ledge').toBeGreaterThanOrEqual(48);
        expect(o.ledgeY - (bar.y + bar.h), 'and does not fit under the beam while on the ledge').toBeLessThan(48);
        expect(o.barX0 - (o.stepX + 40), 'and there is ledge before the beam to see it coming').toBeGreaterThanOrEqual(80);
      }
    }
    // a piston is clear of a fighter's head for most of its cycle: the entry window (frames) is the clear part less the crossing
    for (const h of L.haz) {
      const q = (L.floor - 2 * r - h.h - h.upY) / (h.downY - h.upY);   // how far down its travel the block reaches a fighter's head
      const safe = Math.acos(1 - 2 * q) / Math.PI;                       // the part of its cycle (a cosine) that it is clear of him
      expect(safe, 'clear of him for more than half of every cycle').toBeGreaterThan(0.55);
      expect(h.period * safe - (h.w + 2 * r) / v, 'a runner can enter a piston with 10 frames of window').toBeGreaterThanOrEqual(10);
      expect(h.downY, 'down, it is on the floor').toBe(L.floor - h.h);
      expect(h.upY + h.h, 'up, its underside is a fighter and more above the floor').toBeLessThanOrEqual(L.floor - 2 * r - 60);
    }
    // ...and the blocks of one run leave a pocket to stand in between them
    const byGroup = {}; for (const h of L.haz) (byGroup[h.g] = byGroup[h.g] || []).push(h);
    for (const g of Object.values(byGroup)) for (let i = 1; i < g.length; i++) expect(g[i].x - (g[i - 1].x + g[i - 1].w) - 2 * r, 'a pocket of 60 px or more').toBeGreaterThanOrEqual(60);
    // a piano lands where a runner at full speed has left its box, with frames to spare: keep running and you are through
    for (const p of L.pianos) {
      const lead = p.x + p.w / 2 - p.trig, leaves = (lead + p.w / 2 + r) / v;
      expect(p.T - 2 - leaves, 'keep running: through before it lands, by 3 frames or more').toBeGreaterThanOrEqual(3);
      expect(p.h, 'jump and you are over: it is shorter than a jump').toBeLessThan(P.single.apex);
    }
    // a voice's wave is jumpable once, from a wide window; the wave is where a runner meets it, inside the obstacle's own space
    for (const w of L.voices) {
      expect((w.th + 2 * r) / (v + w.sp) + 6, 'one jump takes you over it with a window of 6 frames or more').toBeLessThanOrEqual(P.single.above[w.h]);
      expect(w.sp, 'and it is slower than the fastest runner is fast').toBeLessThan(v * 1.4);
      const ob = L.obs.find((o) => o.k === 'voice' && o.x0 === w.trig);
      expect(w.trig + Math.ceil((w.x0 - w.trig) * v / (v + w.sp)), 'met inside its own space').toBeLessThan(ob.x1);
    }
    // a memory can be jumped with two jumps, from a window of 6 frames or more
    for (const m of L.memories) expect((m.w + 2 * r) / v + 6, 'a double jump takes you over it').toBeLessThanOrEqual(P.double18.above[m.h]);
    // ---- the platformer hazards ----
    // spikes: one jump takes you over a strip with a window of 6 frames or more; a field of them before a spring's pad is for the pad, or for two jumps
    for (const t of L.traps.filter((t) => t.k === 'spikes' && !t.field)) expect((t.w + 2 * r) / v + 6, 'spikes: one jump carries you over').toBeLessThanOrEqual(P.single.above[t.h]);
    for (const t of L.traps.filter((t) => t.k === 'spikes' && t.field)) expect((t.w + 2 * r) / v + 6, 'a field of spikes: two jumps carry you over it').toBeLessThanOrEqual(P.double18.above[t.h]);
    // a pair of strips: a jump over the first, landing in the pocket and a jump over the second, with a window of 6 frames or more at the first take-off
    // (the clear part of the take-off, and what is left of it when the landing must still leave room to take off again before the second strip)
    const pairs = {}; for (const t of L.traps.filter((t) => t.k === 'spikes' && !t.field)) (pairs[t.g] = pairs[t.g] || []).push(t);
    const pairList = Object.values(pairs).filter((p) => p.length > 1);
    expect(pairList.length, 'and the lane has pairs').toBeGreaterThanOrEqual(1);
    for (const p of pairList) {
      expect(p.length, 'a pair, not a row').toBe(2);
      const w = p[0].w, pocket = p[1].x - (p[0].x + p[0].w), A = P.single.above[26], clear = A * v - (w + 2 * r), landing = pocket - 2 * r - P.single.dist + A * v;
      expect(Math.min(clear, landing) / v, 'jump, land in the pocket, jump again: a window of 6 frames at the first take-off').toBeGreaterThanOrEqual(6);
      expect(p[1].w, 'the same strip twice').toBe(w);
    }
    // ceilings of spikes: a single jump's head goes under the tips with 20 px to spare; a double jump's does not; a pit under them can be jumped once
    for (const o of L.obs.filter((o) => o.k === 'ceiling' || (o.k === 'spring' && o.mode === 'trap'))) {
      expect(o.tip - (P.single.apex + 2 * r), 'one jump goes under the tips').toBeGreaterThanOrEqual(20);
      expect(P.best.apex + 2 * r, 'a second jump does not').toBeGreaterThan(o.tip);
      if (o.pit) expect(o.strip.x1 - o.strip.x0, 'the pit under the tips can be jumped once, with a window of 6 frames or more').toBeLessThanOrEqual(P.single.dist + 8 - 6 * v);
    }
    // springs: the pad throws a runner over the whole field of spikes before it; under the tips it throws him into them, and a hop over the pad does not
    for (const o of L.obs.filter((o) => o.k === 'spring')) {
      const t = L.traps.find((z) => z.k === 'spring' && z.x === o.pad.x0), air = 2 * Math.abs(t.vy) / P.grav, apex = t.vy * t.vy / (2 * P.grav);
      if (o.mode === 'helper') expect(air * v - 6 - (o.field.x1 - o.pad.x0) - r, 'the pad carries you over the field with 30 px to spare').toBeGreaterThanOrEqual(30);
      else { expect(apex + 2 * r, 'the pad throws you into the tips').toBeGreaterThan(o.tip); expect(o.pad.x1 - o.pad.x0 + 2 * r + 6 * v, 'and a hop over it is easy').toBeLessThanOrEqual(P.single.above[14] * v); }
    }
    // fire: a runner crosses a vent with 12 frames of window; the vents of a run are lit in a wave that travels with him
    const fires = L.traps.filter((t) => t.k === 'fire'), fg = {}; for (const t of fires) (fg[t.g] = fg[t.g] || []).push(t);
    for (const t of fires) expect(t.period - t.burn - (t.w + 2 * r) / v, 'a runner can cross a vent with 12 frames of window').toBeGreaterThanOrEqual(12);
    for (const g of Object.values(fg)) for (let i = 1; i < g.length; i++) {
      const travel = (g[i].x - g[i - 1].x) / (v * g[i].period), d = (((g[i - 1].phase - g[i].phase - travel) % 1) + 1) % 1;
      expect(Math.min(d, 1 - d), 'lit in a wave that travels with the runner').toBeLessThan(0.02);
    }
    // belts: still forward on them, and a double jump clears the longest
    for (const t of L.traps.filter((t) => t.k === 'belt')) { expect(v - t.bs, 'still forward').toBeGreaterThanOrEqual(3.2); expect(t.w, 'and a double jump clears it').toBeLessThanOrEqual(P.best.dist - 40); }
    // crumbling floors: the time on a tile at full speed leaves 10 frames before it drops; and the span can be jumped with two jumps
    for (const c of L.crumbles) expect(c.delay - (c.w + 2 * r) / v, 'a runner at speed is off a tile (all of him) 10 frames before it drops').toBeGreaterThanOrEqual(10);
    for (const o of L.obs.filter((o) => o.k === 'crumble')) expect(o.x1 - o.x0, 'and two jumps clear the span').toBeLessThanOrEqual(P.best.dist - 40);
    // cannons: a low shot is jumped once with a window of 6 frames or more; a high one passes over a runner with 20 px to spare
    for (const c of L.cannons) {
      expect((L.bullet.w + 2 * r) / (v + c.bs) + 6, 'a low shot: one jump').toBeLessThanOrEqual(P.single.above[L.bullet.low + L.bullet.h / 2]);
      expect(L.bullet.high - L.bullet.h / 2 - 2 * r, 'a high shot goes over a runner on the floor with 20 px to spare').toBeGreaterThanOrEqual(20);
      expect(c.cx - c.trig, 'and the cannon is on screen when it is triggered').toBeLessThanOrEqual(700);
    }
    // the ferries: the pit is wider than a double jump, and a platform is docked within a third of a period, all the time
    for (const o of L.obs.filter((o) => o.k === 'ferry')) {
      expect(o.gw, 'too wide to jump').toBeGreaterThanOrEqual(P.best.dist + 10);
      const fl = L.ferries.filter((f) => f.g === o.g);
      expect(fl.length).toBe(3);
      let worst = 0, run = 0;
      for (let t = 0; t < 2 * o.period; t++) {
        const docked = fl.some((f) => f.gx + (f.gw - f.w) * (0.5 - 0.5 * Math.cos(2 * Math.PI * (t / f.period + f.phase))) <= f.gx + 10);
        run = docked ? 0 : run + 1; worst = Math.max(worst, run);
      }
      expect(worst, 'never longer to wait than a third of a cycle').toBeLessThanOrEqual(o.period / 3 + 6);
    }
    // the space between: a run-up of 240 px at least before everything (more after a gap, where a jump lands past the edge), and a clear last stretch
    const gs = []; for (const o of L.obs) { const g = gs[gs.length - 1]; if (g && g.g === o.g) g.x1 = Math.max(g.x1, o.x1); else gs.push({ g: o.g, k: o.k, x0: o.x0, x1: o.x1 }); }
    for (let i = 1; i < gs.length; i++) expect(gs[i].x0 - gs[i - 1].x1, 'the run-up').toBeGreaterThanOrEqual(gs[i - 1].k === 'gap' ? 360 : 240);
    expect(L.edge - gs[gs.length - 1].x1, 'the last stretch is clear').toBeGreaterThanOrEqual(460);
  });

  it('the length is for harder sections, not filler (owner 2026-10-02: "Length"): the lane is at full strength from 90% of the way, a quarter of it is sections, and the last third is mostly the sections that get harder', () => {
    const L = lane(), secs = L.obs.filter((o) => o.sec);
    const r = race({}, `var f = RACE_FIRST_X, l = RACE_LAST_X; return { s0:raceStrength(f), s50:raceStrength(f + (l - f)*0.5), s90:raceStrength(f + (l - f)*0.9), s100:raceStrength(l), first:f, last:l, ramp:RACE_RAMP };`);
    expect([r.s0, r.s90, r.s100], 'nothing at the first obstacle; full strength from 90% of the way to the last').toEqual([0, 1, 1]);
    expect(r.s50, 'and a ramp between: more than half at the middle of the way').toBeGreaterThan(0.5);
    const px = secs.reduce((a, o) => a + (o.x1 - o.x0), 0);
    expect(px / (L.edge - r.first), 'a quarter of the lane or more is sections: the d5 lane\'s own').toBeGreaterThanOrEqual(0.25);
    const late = L.obs.filter((o) => o.x0 > L.len * 0.66);
    expect(late.filter((o) => o.sec).length, 'the last third has at least three sections in it').toBeGreaterThanOrEqual(3);
    const lateSecs = late.filter((o) => o.sec).map((o) => o.k);
    for (const k of ['sawgap', 'pillars', 'planks']) expect(lateSecs, 'the gauntlet, the last third\'s own, has the ' + k).toContain(k);
    expect(late.filter((o) => o.sec).every((o) => o.s >= 0.75), 'and every one of them is at three quarters of the strength or more').toBe(true);
  });
});

// THE JUMPS. The owner (2026-10-02): "running should be d5 bfdi:branches difficulty"; asked what should change: "Jumps, Hazard timing and Length"; and "just not
// just having to jump over easy things to jump over". So the lane has precision platforming: stairs of small platforms over a pit (planks: thin wooden
// platforms that get narrower along the lane; pillars: stone pillars one fighter wide) and leaps (pits that only the double jump crosses, with a small plank
// between). Each is a section the solver plays (`sec`): where it is run up to, waited at and left. How much room each press has is measured by the solver on
// the real engine, never assumed, and played back in "the run" below.
describe('the jumps: precision platforming', () => {
  const secs = () => lane().obs.filter((o) => o.sec);
  it('the lane has stairs of planks, stairs of pillars and leaps; each is a section run up to from further back than an obstacle usually is', () => {
    const L = lane(), kinds = secs().map((o) => o.k);
    for (const k of ['planks', 'pillars', 'leap']) expect(kinds, 'on the lane: ' + k).toContain(k);
    for (const o of secs()) {
      expect([o.sec.sx < o.x0, o.x0 < o.x1, o.x1 <= o.sec.ex, o.sec.ex < L.edge], o.k + ' at ' + Math.round(o.x0) + ': the section spans its obstacle').toEqual([true, true, true, true]);
      expect(o.x0 - o.sec.sx, 'run up to from 150 px back').toBe(150);
    }
    // the run-up: 220 px more than the 240 before anything that is a section (after a section he has come down already: the 240 is enough there)
    const gs = []; for (const o of L.obs) { const g = gs[gs.length - 1]; if (g && g.g === o.g) g.x1 = Math.max(g.x1, o.x1); else gs.push({ g: o.g, k: o.k, sec: o.sec, x0: o.x0, x1: o.x1 }); }
    for (let i = 1; i < gs.length; i++) if (gs[i].sec) expect(gs[i].x0 - gs[i - 1].x1, 'the run-up to ' + gs[i].k).toBeGreaterThanOrEqual(gs[i - 1].sec ? 240 : 460);
  });

  it('the planks narrow as the lane goes on and the stairs grow; the pillars are one fighter wide; planks are one-way, pillars are stone', () => {
    const L = lane(), planks = L.obs.filter((o) => o.k === 'planks'), pillars = L.obs.filter((o) => o.k === 'pillars'), plats = JSON.parse(L.plats);
    expect(planks.length).toBeGreaterThanOrEqual(2); expect(pillars.length).toBeGreaterThanOrEqual(2);
    nondecreasing(planks, (o) => -o.pw, 'planks narrow'); nondecreasing(planks, (o) => o.n, 'and the stairs grow');
    expect(planks[planks.length - 1].pw, 'a plank is narrower at the end than a first one by a quarter or more').toBeLessThan(planks[0].pw * 0.75);
    for (const o of pillars) expect(o.pw, 'a pillar is one fighter wide (48 px)').toBe(2 * L.r);
    const stones = plats.filter((p) => p.raceStone), pil = plats.filter((p) => p.racePillar);
    expect(stones.length, 'every plank of the stairs is in the world, and the one between the two pits of each leap').toBe(planks.reduce((a, o) => a + o.n, 0) + L.obs.filter((o) => o.k === 'leap').length);
    expect(pil.length, 'and every pillar').toBe(pillars.reduce((a, o) => a + o.n, 0));
    for (const p of stones) expect([!!p.solid, p.h], 'a plank is a thin one-way platform').toEqual([false, 14]);
    for (const p of pil) expect(!!p.solid, 'a pillar is stone').toBe(true);
  });

  it('each stands where a running jump from the one before comes down on it: the engine\'s own jump, a few px off the rhythm, and never a rise the jump cannot make', () => {
    const J = race({}, `return { f:[0, 40, -40, 80].map(function(d){ return raceJumpFrames(d); }), v:MAXVX };`), P = physics([26]), L = lane();
    expect(J.f[0] * J.v, 'a flat jump at full speed is the distance the engine measures').toBeGreaterThan(P.single.dist - 8);
    expect(J.f[0] * J.v).toBeLessThan(P.single.dist + 8);
    expect(J.f[1], 'a surface 40 px higher is reached sooner').toBeLessThan(J.f[0]); expect(J.f[2], 'one 40 px lower later').toBeGreaterThan(J.f[0]);
    for (const o of L.obs.filter((o) => o.k === 'planks' || o.k === 'pillars')) {
      for (let i = 1; i < o.cs.length; i++) {
        const want = J.v * race({}, `return raceJumpFrames(${o.hs[i] - o.hs[i - 1]});`), got = o.cs[i] - o.cs[i - 1];
        expect(Math.abs(got - want), o.k + ' ' + i + ': a few px off the rhythm of the jump from the one before').toBeLessThanOrEqual(15);
        expect(o.hs[i] - o.hs[i - 1], o.k + ' ' + i + ': a rise a single jump makes, with room').toBeLessThanOrEqual(P.single.apex - 25);
      }
    }
  });

  it('the room of every press, measured again on the real engine as the run goes by, is a skilled player\'s ("+-2 frames") and no more than that at the hardest: demanding, not easy', () => {
    const r = fullRun(), rooms = r.plan.seen.map((s) => s.room);
    expect(rooms.length, 'every section was measured').toBe(secs().length);
    expect(Math.min(...rooms), 'the tightest press of the lane can be early or late by 2 frames and still work (a window of 5)').toBeGreaterThanOrEqual(5);
    expect(Math.min(...rooms), 'and it is a precision jump: no more than 9 frames of window ("not just having to jump over easy things")').toBeLessThanOrEqual(9);
    r.plan.seen.forEach((s, i) => expect(s.room, 'section ' + i + ' measures what the solver wrote down').toBe(PROG.programs[i].room));
  }, 300000);

  it('Marshmallow cannot follow a jump from plank to plank, so on a section she is kept beside him (110 px behind at the most, then put at his side), never lost', () => {
    const r = fullRun();
    expect(r.run.worstSec, 'she was at his side on every section').toBeLessThanOrEqual(110 + 60);
    expect(r.run.worstSec).toBeGreaterThan(-1e8);
    expect(r.run.lost, 'and never lost').toBe(0);
  }, 300000);
});

// HAZARD TIMING. The owner (2026-10-02): "running should be d5 bfdi:branches difficulty"; asked what should change: "Jumps, Hazard timing and Length". Hazards come
// in combination now, with windows that are tighter and still readable -- every one has its tell on the screen (a saw swinging on a pole, vents that glow before they
// burn, a cannon that flashes where its shot will leave) and none is invisible: a saw swinging across a pit under a ceiling of spikes, fire jets on the platform you land
// on, a cannon covering the arc of a jump. The ceiling of spikes is the recurring answer to "just double jump over it": the tips are over a single jump's head and under
// a double's. The room of every press and every wait is measured by the solver on the real engine ("the run").
describe('the hazard combinations: tighter windows, every one with its tell', () => {
  const ofKind = (k) => lane().obs.filter((o) => o.k === k);
  it('the lane has a saw across a pit, jets on a platform you land on and a cannon covering a jump: each a section the solver plays', () => {
    for (const k of ['sawgap', 'jetpad', 'coverfire']) { expect(ofKind(k).length, k + ' is on the lane').toBeGreaterThanOrEqual(1); for (const o of ofKind(k)) expect(o.sec, k + ' is a section').toBeTruthy(); }
  });

  it('a saw across a pit: one saw on a pole over the middle of the pit, as big and as quick as the pendulum for how far along the lane it stands, under a ceiling of spikes a single jump goes under and a double jump bangs on', () => {
    const L = lane(), P = physics([26]);
    for (const o of ofKind('sawgap')) {
      const p = L.pendulums.find((q) => q.g === o.g), c = L.traps.find((t) => t.k === 'ceiling' && t.g === o.g);
      expect(p && c, 'a saw and a ceiling').toBeTruthy();
      expect(p.px, 'over the middle of the pit').toBe(o.x0 + Math.round(o.G / 2));
      expect(p.py + p.L + p.R, 'the blade is 6 px off the floor at the bottom of its swing').toBe(L.floor - 6);
      expect([p.R, p.period, p.L], 'the pendulum\'s own sizes for how far along the lane it stands').toEqual([Math.round(28 + 6 * o.s), Math.round(124 - 26 * o.s), Math.round(170 + 20 * o.s)]);
      expect(c.x <= o.x0 - 60 && c.x + c.w >= o.x0 + o.G + 60, 'the ceiling is over the whole pit and the take-off').toBe(true);
      expect(c.tip - (P.single.apex + 2 * L.r), 'one jump goes under the tips').toBeGreaterThanOrEqual(20);
      expect(P.best.apex + 2 * L.r, 'a double jump bangs on them').toBeGreaterThan(c.tip);
      expect(o.G, 'a pit one jump crosses').toBeLessThanOrEqual(330);
    }
  });

  it('jets on the island you land on: two or three close together (no pocket to stand in), a ceiling of spikes over them, burning most of the time, resting in a wave that runs with a runner at full speed, with a window to cross', () => {
    const L = lane(), P = physics([26]), v = P.maxvx;
    for (const o of ofKind('jetpad')) {
      const js = L.traps.filter((t) => t.k === 'jet' && t.g === o.g), c = L.traps.find((t) => t.k === 'ceiling' && t.g === o.g);
      expect(js.length, 'two or three jets').toBe(o.n); expect(o.n).toBeGreaterThanOrEqual(2); expect(o.n).toBeLessThanOrEqual(3);
      for (let i = 1; i < js.length; i++) {
        expect(js[i].x - (js[i - 1].x + js[i - 1].w) - 2 * L.r, 'no pocket a fighter fits in between two jets').toBeLessThan(0);
        const travel = (js[i].x - js[i - 1].x) / (v * js[i].period), d = (((js[i - 1].phase - js[i].phase - travel) % 1) + 1) % 1;
        expect(Math.min(d, 1 - d), 'lit in a wave that runs with the runner').toBeLessThan(0.02);
      }
      for (const j of js) {
        expect(Math.min(j.burn, j.period - j.warn) / j.period, 'burning most of the time').toBeGreaterThanOrEqual(0.5);
        expect(j.warn + j.burn, 'a cycle is the glow and the burn and a rest').toBeLessThanOrEqual(j.period);
        expect(j.period - j.burn - (j.w + 2 * L.r) / v, 'a window to cross one: what is left of the glow and the rest once he has crossed it, 5 frames or more').toBeGreaterThanOrEqual(5);
      }
      expect(c.tip - (P.single.apex + 2 * L.r), 'one jump goes under the tips').toBeGreaterThanOrEqual(20);
      expect(c.x <= js[0].x && c.x + c.w >= js[js.length - 1].x + js[js.length - 1].w, 'the ceiling is over the jets').toBe(true);
    }
    const all = L.traps.filter((t) => t.k === 'jet');
    nondecreasing(all.filter((t, i, a) => i === 0 || t.g !== a[i - 1].g), (t) => -t.period, 'jets cycle faster'); nondecreasing(all, (t) => t.hf, 'and burn higher');
  });

  it('a cannon covering a jump: it fires when he crosses its trigger at the lip (too late to wait out), the first shot is high and meets a jumper at the top of his jump, and a ceiling over the pit leaves him a single jump', () => {
    const L = lane(), P = physics([26]), v = P.maxvx;
    for (const o of ofKind('coverfire')) {
      const c = L.cannons.find((q) => q.trig === o.x0 + 12), cei = L.traps.find((t) => t.k === 'ceiling' && t.g === o.g);
      expect(c && cei, 'its cannon and its ceiling').toBeTruthy();
      expect(c.n, 'two or three shots').toBeGreaterThanOrEqual(2); expect(c.hi[0], 'the first shot is high').toBe(true);
      const tm = (c.cx - L.bullet.w - c.trig - L.r + 20 * c.bs) / (v + c.bs);   // frames after he crosses the trigger that the first shot meets the front of him
      expect(Math.abs(tm - 20), 'it meets him at the top of a jump taken at the lip (the top of a jump is 20 frames up)').toBeLessThanOrEqual(3);
      expect(c.cx - c.trig, 'and the cannon is on screen when it is triggered').toBeLessThanOrEqual(700);
      expect(cei.tip - (P.single.apex + 2 * L.r), 'one jump goes under the tips').toBeGreaterThanOrEqual(20);
      expect(P.best.apex + 2 * L.r, 'a double jump bangs on them').toBeGreaterThan(cei.tip);
      expect(cei.x <= o.x0 && cei.x + cei.w >= o.x0 + o.G, 'the ceiling is over the whole pit').toBe(true);
    }
  });

  it('each combination is a window, not a pass: its timing is measured on the real engine as the run goes by, 5 frames or more on every press and every wait; the saw and the jets are waits (the hazard is the clock)', () => {
    const r = fullRun();
    r.plan.seen.forEach((s, i) => {
      const k = PROG.programs[i].k;
      if (!['sawgap', 'jetpad', 'coverfire'].includes(k)) return;
      for (const w of s.win) for (const key of ['t1', 'd2', 'w']) if (w[key] !== null) expect(w[key], k + ' #' + i + ' ' + key + ' window').toBeGreaterThanOrEqual(5);
      if (k !== 'coverfire') expect(s.win.some((w) => w.w !== null), k + ' #' + i + ' has a wait to time').toBe(true);
    });
  }, 300000);
});

// SLIGHTLY KAIZO. The owner (2026-10-02): "and also just not just having to jump over easy things to jump over; i want at least one thing to be slightly kaizo." So the last thing
// on the lane is THE HAIRLINE: a precise sequence with one small surprise that is fair on the next try, and nothing in it hidden. A spring pad on the runway that throws him into
// the spikes of the ceiling (hop it), a pit, a platform in the middle of the next one that looks like the floor and crumbles four frames after he lands (a hairline crack you can
// see if you look, spikes showing under it), and a pit wider than a jump under the ceiling, crossed by a jump and a second jump timed late. "Slightly": hard and a little sneaky,
// never a blind or unwinnable trap: the solver plays all of it, and every press of it has room (the behaviour of the tile is pinned with "the platformer hazards").
describe('the kaizo section: the hairline', () => {
  const kz = () => lane().obs.filter((o) => o.k === 'kaizo');
  it('there is one, it is the last thing on the lane, run up to from a long way back, and a section the solver plays', () => {
    const L = lane(), o = kz()[0];
    expect(kz().length, 'one').toBe(1);
    expect(L.obs[L.obs.length - 1], 'the last thing on the lane').toBe(o);
    expect(o.x0 / L.len, 'late: in its last tenth').toBeGreaterThan(0.9);
    expect(o.sec, 'a section').toBeTruthy();
    expect(o.x0 - L.obs[L.obs.length - 2].x1, 'a long run-up').toBeGreaterThanOrEqual(460);
    expect(L.edge - o.x1, 'and the last stretch to the edge is clear').toBeGreaterThanOrEqual(460);
  });

  it('it is built of a ceiling of spikes, a spring that throws him into it, a tile with a hairline crack over spikes, and a pit only a late second jump crosses: every piece readable, none hidden', () => {
    const L = lane(), P = physics([14, 26]), v = P.maxvx, o = kz()[0], g = o.g;
    const cei = L.traps.find((t) => t.k === 'ceiling' && t.g === g), pad = L.traps.find((t) => t.k === 'spring' && t.g === g), bed = L.traps.find((t) => t.k === 'bed' && t.g === g), tile = L.fakes.find((c) => c.g === g);
    expect(cei && pad && bed && tile, 'all four are there').toBeTruthy();
    expect(cei.x <= o.x0 - 40 && cei.x + cei.w >= o.tile + o.TW + o.GB, 'the ceiling is over all of it, the runway and both pits').toBe(true);
    expect(cei.tip - (P.single.apex + 2 * L.r), 'one jump goes under the tips').toBeGreaterThanOrEqual(20);
    expect(P.best.apex + 2 * L.r, 'a second jump at the top bangs on them').toBeGreaterThan(cei.tip);
    expect(pad.mode, 'the pad is the trap kind').toBe('trap');
    expect(Math.abs(pad.vy) * Math.abs(pad.vy) / (2 * P.grav) + 2 * L.r, 'it throws him into the tips').toBeGreaterThan(cei.tip);
    expect(pad.w + 2 * L.r + 6 * v, 'and a hop over it is easy').toBeLessThanOrEqual(P.single.above[14] * v);
    expect([tile.hair, tile.delay <= 6, tile.w >= 100], 'the tile is a hairline tile: wide as a floor, gone four frames after he lands').toEqual([true, true, true]);
    expect(tile.x, 'in the middle of the pit: a pit before it and a pit after').toBe(o.lipA + o.GA);
    expect([bed.x <= tile.x, bed.x + bed.w >= tile.x + tile.w], 'the spikes are under the whole tile').toEqual([true, true]);
    expect(bed.dy - bed.h, 'their tips show under the tile (it is 26 thick) and are a short fall from its top').toBeGreaterThan(tile.h - 26);
    expect(bed.dy - bed.h, 'a short fall').toBeLessThan(30);
    expect(o.GA, 'the first pit is a jump').toBeLessThanOrEqual(P.single.dist + 40);
    expect(o.GB, 'the second needs a second jump').toBeGreaterThanOrEqual(P.single.dist + 100);
    expect(o.GB, 'and a second jump can do it, with room').toBeLessThanOrEqual(P.best.dist - 40);
  });

  it('it is the tightest section of the lane and still fair: measured on the real engine as the run goes by, the least room of any press is 3 to 6 frames, the second jump is the late one, and every other section leaves more', () => {
    const r = fullRun(), i = PROG.programs.findIndex((p) => p.k === 'kaizo'), s = r.plan.seen[i], steps = PROG.programs[i].steps;
    expect(i, 'it was played').toBeGreaterThanOrEqual(0);
    expect(s.room, 'slightly kaizo: a few frames, never a pixel').toBeGreaterThanOrEqual(3);
    expect(s.room).toBeLessThanOrEqual(6);
    r.plan.seen.forEach((q, j) => { if (j !== i) expect(q.room, 'section ' + j + ' (' + PROG.programs[j].k + ') leaves more room than the kaizo').toBeGreaterThan(s.room); });
    const last = steps.filter((st) => st.d2 !== null).pop();
    expect(last && last.d2, 'a second jump timed late (the top of a jump is 20 frames up; 39 frames on is as he comes back down past the tips)').toBeGreaterThanOrEqual(30);
    expect(steps.some((st) => st.t1 !== null && st.t1 <= 8), 'and a jump off the tile within a few frames of landing on it').toBe(true);
  }, 300000);
});

describe('the line', () => {
  it('is faster than it was and still slower than a sprint; it starts behind everyone and advances every frame, whether or not anyone moves; it never stops, never slows', () => {
    const r = race({}, `you.controller = 'still';
      var xs = [RACE.lineX], you0 = you.x; for (var i=0; i<90; i++){ step(); xs.push(RACE.lineX); }
      var d = []; for (var j=1; j<xs.length; j++) d.push(+(xs[j]-xs[j-1]).toFixed(6));
      return { start:xs[0], behind:fighters.every(function(f){ return f.x > xs[0]; }), you0:you0, moved:you.x !== you0, steps:d, speed:RACE_LINE_SPEED, maxvx:MAXVX, drawn:String(drawRaceFx).indexOf('RACE.lineX') >= 0 && String(draw).indexOf('drawRaceFx()') >= 0 };`);
    expect(r.behind).toBe(true);
    expect(r.moved, 'a still runner').toBe(false);
    expect(new Set(r.steps).size, 'the same step every frame').toBe(1);
    expect(r.steps[0]).toBe(r.speed);
    expect(r.speed, '"the wall should move faster": it was 4.2 px a frame').toBeGreaterThan(4.2);
    expect(r.speed, 'but a runner who never stops must outrun it').toBeLessThan(r.maxvx * 0.9);
    expect(r.drawn, 'the line is drawn').toBe(true);
  });

  it('catches a still runner: the race is lost, "The line caught you", and Retry runs it again', () => {
    const r = race({}, `you.controller = 'still';
      var n = 0; while (running && n < 2000){ step(); n++; }
      var out = { frames:n, over:RACE.over, won:RACE.won, end:window.__raceEnd, why:window.__raceResult && window.__raceResult.why, title:document.getElementById('resultTitle').textContent,
        retry:!!RACE.retry, button:document.getElementById('resultRematch').textContent, caughtAt:Math.round(you.x - RACE.lineX) };
      // Retry: the result screen's button calls rematch() -> startMatch(), which runs the race again from the top
      startMatch();
      out.again = { active:RACE.active, running:running, over:RACE.over, frames:RACE.frames, line:RACE.lineX, youX:fighters.find(function(f){ return f.you; }).x, alive:fighters.filter(function(f){ return !f.dead; }).length, speed:RACE_LINE_SPEED };
      return out;`);
    expect(r.frames).toBeLessThan(2000);
    expect([r.over, r.won, r.end]).toEqual([true, false, false]);
    expect(r.why).toBe('caught');
    expect(r.title).toBe('The line caught you');
    expect(r.retry).toBe(true);
    expect(r.button).toMatch(/^Retry/);
    expect(r.again.active && r.again.running && !r.again.over).toBe(true);
    expect(r.again.frames, 'from the top (beginMatchNow steps the first frame itself)').toBeLessThanOrEqual(1);
    expect(r.again.line, 'the line is back behind the start').toBeCloseTo(r.again.youX - 520 + r.again.frames * r.again.speed, 6);
    expect(r.again.alive).toBe(8);
  });
});

describe('the runners', () => {
  it('you run as Knife (the chain forces it); Marshmallow is always at your side; the MeAfterlife group runs too, each on its own side', () => {
    const r = race({}, `return { names:fighters.map(function(f){ return f.name; }), you:you.name, ctrl:you.controller, marshTeam:marsh.team, youTeam:you.team,
      teams:fighters.slice(2).map(function(f){ return f.team; }), ai:fighters.slice(1).every(function(f){ return f.controller==='ai' && f._runner; }), stocks:fighters.map(function(f){ return f.stocks; }) };`);
    expect(r.you).toBe('Knife');
    expect(r.ctrl).toBe('local');
    expect(r.names.slice(0, 2)).toEqual(['Knife', 'Marshmallow']);
    expect(r.names.slice(2).sort()).toEqual(['Fan', 'Microphone', 'Soap', 'Taco', 'Test Tube', 'Tissues']);
    expect(r.names).not.toContain('OJ'); expect(r.names).not.toContain('Suitcase'); expect(r.names).not.toContain('Cabby');
    expect(r.marshTeam, 'at your side: nothing of yours hits her').toBe(r.youTeam);
    expect(new Set(r.teams).size, 'the rest can be hit').toBe(6);
    expect(r.ai).toBe(true);
    expect(r.stocks.every((s) => s === 1)).toBe(true);
  });

  it('the hidden entry lets the tests run as someone else', () => {
    const r = race({ fighter: 'Firey' }, `return { you:you.name, n:fighters.length, marsh:!!marsh };`);
    expect(r.you).toBe('Firey');
    expect(r.n).toBe(8);
    expect(r.marsh).toBe(true);
    const m = race({ fighter: 'Marshmallow' }, `return { you:you.name };`);
    expect(m.you, 'not as Marshmallow herself: she is the one who is thrown').toBe('Knife');
  });

  it('AI runners run right and clear the first gap; the slow ones fall behind, are caught, and are gone', () => {
    const r = packRun();
    expect(r.over, 'the scripted runner is not caught on the way to the first hard section').toBe(false);
    expect(r.youX, 'and gets there').toBeGreaterThanOrEqual(r.stopX);
    expect(r.past, 'the runners jump the gap (or were lost later, past it)').toBe(6);
    expect(r.gone.length, 'some fall behind and are caught').toBeGreaterThan(0);
    expect(r.gone.length).toBeLessThan(6);
  }, 300000);

  it('the runners crowding the edge leave you to your throw, but jab you anywhere else ("attacks allowed")', () => {
    const r = race({}, `you.controller = 'still'; var fan = fighters.find(function(f){ return f.name==='Fan'; });
      RACE.frames = 300; fan.x = you.x + 30; fan.y = you.y; fan.vx = 0; fan.onground = true; hazardT = 500 - fan.idx*11;
      var mid = raceRunnerAi(fan).attack;                                    // mid-lane, right beside you: a jab
      you.x = RACE.edge - 100; you.y = RACE.floorY - you.r; fan.x = you.x - 40; fan.y = you.y; hazardT = 500 - fan.idx*11;
      var atEdge = raceRunnerAi(fan).attack;                                 // at the edge: none
      you.x = RACE.edge - RACE_THROW_ZONE - 100; fan.x = you.x - 40; hazardT = 500 - fan.idx*11;
      var nearZone = raceRunnerAi(fan).attack;                               // just short of the throw's zone: none either
      you.x = RACE_FIRST_X + 100; fan.x = you.x - 40; hazardT = 500 - fan.idx*11;
      var farBack = raceRunnerAi(fan).attack;                                // well before it (and before everything: the first obstacle is a plain gap): a jab again
      var sec = RACE.obstacles.find(function(o){ return o.sec; });
      you.x = (sec.x0 + sec.x1)/2; fan.x = you.x - 40; hazardT = 500 - fan.idx*11;
      var onSection = raceRunnerAi(fan).attack;                              // on a precision section (owner 2026-10-02, the d5 lane): none, a jab there is luck
      you.x = sec.sec.sx - 10; fan.x = you.x - 40; hazardT = 500 - fan.idx*11;
      var beforeSection = raceRunnerAi(fan).attack;                          // just before it: a jab
      return { mid:mid, atEdge:atEdge, nearZone:nearZone, farBack:farBack, onSection:onSection, beforeSection:beforeSection };`);
    expect(r.mid).toBe(true);
    expect(r.atEdge).toBe(false);
    expect(r.nearZone).toBe(false);
    expect(r.farBack).toBe(true);
    expect(r.onSection, 'the runners leave you alone on a plank, a saw\'s pit, the hairline: a jab there would be luck, and the section is meant to be fair on the next try').toBe(false);
    expect(r.beforeSection, 'but not a step before it').toBe(true);
  });
});

// THE PROOF THAT IT CAN BE WON. The owner (2026-10-02): "running should be d5 bfdi:branches difficulty" -- harder, and still winnable as Knife by a
// skilled player with no checkpoint. The lane's hard sections are solved by search on the real engine (scripts/solve-running-lane.mjs, method in
// test/helpers/running-solver.page.js): the plan for each is a few frames of exact presses, kept on file in test/data/running-lane.json. The tests
// below play the whole lane back with them (and the scripted runner for the rest) in the real game with every runner on the lane, and the throw.
describe('the run', () => {
  it('the plans on file were solved on this very lane: when the lane changes they are solved again (node scripts/solve-running-lane.mjs)', () => {
    expect(PROG.lane, 'the lane is not the one the plans were solved on: run node scripts/solve-running-lane.mjs and commit test/data/running-lane.json').toBe(lane().hash);
    expect(PROG.programs.length, 'one plan for every section of the lane that has one').toBe(lane().obs.filter((o) => o.sec).length);
    for (const p of PROG.programs) expect(p.steps, p.k + ' at ' + Math.round(p.x) + ' has a plan').toBeTruthy();
  });

  it('played back, the plans are the run that was solved: every section begins and ends on the frame and the spot it did when it was solved, with the runners and Marshmallow on the lane too', () => {
    const r = fullRun();
    expect(r.plan.failed, 'no section without a plan').toBe(-1);
    expect(r.plan.seen.length, 'every section was reached').toBe(PROG.programs.length);
    r.plan.seen.forEach((s, i) => {
      const p = PROG.programs[i];
      expect([s.frame, +s.x.toFixed(6), s.endFrame, +s.endX.toFixed(6)], p.k + ' #' + i + ': begins and ends where it did when it was solved').toEqual([p.frame, +p.x.toFixed(6), p.endFrame, +p.endX.toFixed(6)]);
    });
  }, 300000);

  it('a scripted runner who plays the whole lane reaches the end, throws Marshmallow over and crosses: the lane is completable, with room to spare', () => {
    const r = fullRun();
    expect(r.over, 'the race was decided within the frame budget').toBe(true);
    expect([r.won, r.end, r.why], JSON.stringify(r.run)).toEqual([true, true, 'crossed']);
    expect(r.ranAs, 'the chain\'s onEnd reads who ran').toBe('Knife');
    expect(r.title).toBe('RUNNING! cleared');
    expect(r.youXf, 'he is over the finish line').toBeGreaterThanOrEqual(r.finish);
    expect(r.run.minLead, 'never touched by the line').toBeGreaterThan(0);
    expect(r.run.bumps, 'and never bumped by a hazard either: there is a way through every one of them for someone who reads its tell').toBe(0);
    expect(r.secs, 'a long run: the lane is 2.7 times the first version\'s').toBeGreaterThan(50);
    // "a runner who keeps up": when the charge starts there is time for a FULL three seconds of it, and the flight and the
    // bridge, and a second of grace -- the throw is never rushed for someone who ran the lane well
    expect(r.run.leadAtThrow, 'a lead at the edge').not.toBeNull();
    expect(r.run.leadAtThrow, 'enough for a full charge and then some').toBeGreaterThan(r.speed * (r.full + 84) + 6.4 * 60);
  }, 300000);

  it('Marshmallow keeps pace: never far behind you, never behind the line, never lost -- and she is thrown across the gap at the end', () => {
    const r = fullRun();
    expect(r.won).toBe(true);
    expect(r.run.lost, 'never lost').toBe(0);
    expect(r.run.behindLine, 'never caught').toBe(0);
    expect(r.run.worst, 'at your side').toBeLessThanOrEqual(r.leash + 40);
    expect(r.marshOver && r.marshAlive).toBe(true);
    expect(r.marshX, 'over the gap').toBeGreaterThan(r.farX);
    expect(r.marshX, 'and onto the landing').toBeLessThan(r.farX + 520);
    expect(Math.abs(r.marshY - r.floor), 'standing on it').toBeLessThan(2);
  }, 300000);

  it('no text during the run but GO!: a whole scripted run and a caught run say nothing else', () => {
    const a = fullRun();
    const b = race({}, `you.controller = 'still'; var b0 = window.__banners.length;
      var n = 0; while (running && n < 2000){ step(); n++; }
      return { seenB:window.__banners.slice(__b0).map(function(b){ return b.text + '|' + (b.kind||''); }), err:!!window.__loopErrLogged, why:window.__raceResult && window.__raceResult.why };`);
    expect(a.won).toBe(true);
    expect(a.seen, 'the winning run').toEqual(['GO!|']);
    expect(b.seenB, 'the caught run').toEqual(['GO!|']);
    expect(a.err || b.err, 'the loop never threw').toBe(false);
  }, 300000);
});

describe('the finish: the charged smash', () => {
  // Put you and Marshmallow on the floor at the lane's edge, the line far behind, the others parked, and settle a frame.
  // adv(n) steps n frames with the line kept far behind (so nothing but the throw is being tested).
  const AT_EDGE = `fighters.forEach(function(f){ if(f!==you && f!==marsh){ f.dead = true; } }); marsh.controller = 'still'; marsh.invuln = 0;
    you.x = RACE.edge - 60; you.y = RACE.floorY - you.r; you.vx = 0; you.vy = 0; you.face = 1; marsh.x = you.x - 50; marsh.y = you.y; marsh.vx = 0; marsh.vy = 0;
    var adv = function(n){ for(var i=0;i<n;i++){ RACE.lineX = you.x - 3000; step(); } };
    adv(3); you.spCd = 0;`;
  // press smash, hold it n frames in all (the press frame is the first), let go, and read what happened
  const CHARGE = (n) => `hold({smash:true}); adv(${n}); var __t = RACE.charge ? RACE.charge.t : -1; hold({}); adv(1);`;

  it('the hook is gone: at the edge the special is the bag of tricks as anywhere else, and never slings her', () => {
    const r = race({}, `${AT_EDGE} var tricks0 = you._trickN||0, shots0 = projectiles.length;
      hold({special:true}); adv(8); hold({});
      return { fn:typeof raceSling, konst:typeof RACE_SLING_REACH, tricks:(you._trickN||0) - tricks0, shots:projectiles.length - shots0, charge:RACE.charge, thrown:RACE.thrown, held:!!marsh._raceHeld };`);
    expect(r.fn).toBe('undefined');
    expect(r.konst).toBe('undefined');
    expect(r.tricks, 'the bag of tricks fired').toBe(1);
    expect(r.shots).toBeGreaterThan(0);
    expect([r.charge, r.thrown, r.held]).toEqual([null, false, false]);
  });

  it('holding smash at the edge, beside Marshmallow, picks her up and charges -- it is not a smash, and he does not walk', () => {
    const r = race({}, `${AT_EDGE} var x0 = you.x;
      hold({smash:true, right:true}); adv(1); var t1 = RACE.charge && RACE.charge.t, held = !!marsh._raceHeld;
      adv(59); var t60 = RACE.charge.t, hs = { x:marsh.x - you.x, y:you.y - marsh.y };
      return { t1:t1, held:held, t60:t60, moved:Math.abs(you.x - x0), q:!!you._smQ, sh:you.smashHold, face:you.face, on:you.onground, hs:hs, full:RACE_THROW_FULL };`);
    expect(r.t1).toBe(1);
    expect(r.held).toBe(true);
    expect(r.t60).toBe(60);
    expect(r.moved, 'planted: a key held down does not walk him off the edge').toBeLessThan(0.5);
    expect(r.q, 'no smash is charging').toBe(false);
    expect(r.sh, 'the smash\'s own wind-back and ring show the charge').toBeGreaterThan(0);
    expect(r.on).toBe(true);
    expect(r.face, 'facing the far side').toBe(1);
    expect(r.hs.y, 'she is on his shoulders').toBeGreaterThan(20);
    expect(Math.abs(r.hs.x)).toBeLessThan(30);
    expect(r.full, 'about three seconds').toBe(180);
  });

  it('anywhere else, or with her out of reach, the smash is Knife\'s smash: nothing is picked up', () => {
    const r = quick({}, `${AT_EDGE}
      you.x = RACE.edge - 440; you.y = RACE.floorY - you.r; marsh.x = you.x - 50; marsh.y = you.y; adv(2);   // well short of the zone, on the flat run to the edge (the last 460 px are clear: the kaizo section of the d5 lane ends where they begin, so 600 back is a pit now)
      hold({smash:true}); adv(2); var mid = { charge:RACE.charge, held:!!marsh._raceHeld, q:!!you._smQ }; hold({}); adv(60);
      you.x = RACE.edge - 60; marsh.x = you.x - 50; marsh.y = you.y - 500; adv(1); marsh.y = you.y - 500; adv(1);   // at the edge but she is out of his reach (the leash keeps her within 260 px of him along the floor, never above him)
      hold({smash:true}); adv(2); var far = { charge:RACE.charge, held:!!marsh._raceHeld, q:!!you._smQ }; hold({}); adv(60);
      you.x = RACE.edge - RACE_THROW_ZONE - 60; marsh.x = you.x - 50; adv(2);   // in reach but short of the zone
      hold({smash:true}); adv(2); var short = { charge:RACE.charge, q:!!you._smQ }; hold({});
      return { mid:mid, far:far, short:short };`);
    for (const k of ['mid', 'far', 'short']) { expect(r[k].charge, k + ': no charge').toBeNull(); expect(r[k].q, k + ': the smash charges').toBe(true); }
    expect(r.mid.held).toBe(false); expect(r.far.held).toBe(false);
  });

  it('a slip of the finger (a short hold) throws nothing and loses nothing: she is put down and the race goes on', () => {
    const r = quick({}, `${AT_EDGE} ${CHARGE(6)} adv(20);
      return { charge:RACE.charge, flight:!!RACE.flight, thrown:RACE.thrown, held:!!marsh._raceHeld, running:running, over:RACE.over, min:RACE_THROW_MIN, t:__t, q:!!you._smQ, sh:you.smashHold };`);
    expect(r.t).toBeLessThan(r.min);
    expect([r.charge, r.flight, r.thrown, r.held, r.q]).toEqual([null, false, false, false, false]);
    expect(r.sh).toBe(0);
    expect(r.running && !r.over).toBe(true);
  });

  it('longer = farther: the landing grows with the charge, from in the gap to across; a full charge lands well onto the far side and never past it', () => {
    const frames = [30, 90, 120, 150, 180, 240];
    const xs = frames.map((n) => quick({}, `${AT_EDGE} ${CHARGE(n)} return { x1:RACE.flight.x1, clears:RACE.flight.clears, c:RACE.flight.c, far:RACE.farX, edge:RACE.edge, farW:RACE_FAR_W, t:__t };`));
    for (let i = 1; i < xs.length - 1; i++) expect(xs[i].x1, 'each hold lands farther than the last').toBeGreaterThan(xs[i - 1].x1);
    expect(xs[xs.length - 1].x1, 'past a full charge it goes no farther').toBe(xs[xs.length - 2].x1);
    expect(xs[0].t).toBe(30);
    expect(xs[xs.length - 1].t, 'the charge stops building at three seconds').toBe(180);
    expect(xs[0].clears, 'half a second: in the gap').toBe(false);
    expect(xs[1].clears, 'a second and a half: still in the gap').toBe(false);
    expect(xs[2].clears, 'two seconds: across').toBe(true);
    expect(xs[4].clears).toBe(true);
    expect(xs[4].x1, 'a full charge lands on the landing, not past its end').toBeLessThan(xs[4].far + xs[4].farW - 30);
    expect(xs[4].x1).toBeGreaterThan(xs[4].far + 200);
    expect(xs[0].x1, 'a short throw lands in the gap, clear of the far edge').toBeLessThan(xs[0].far - 30 + 1);
    expect(xs[0].x1).toBeGreaterThan(xs[0].edge);
  });

  it('"looong": the least charge that clears the gap is between a second and a half and two and a half; a full charge is three', () => {
    const r = race({}, `${AT_EDGE} return { clearC:raceThrowClearC(), full:RACE_THROW_FULL, min:RACE_THROW_MIN };`);
    const frames = r.clearC * r.full;
    expect(r.full / 60, 'up to about three seconds').toBe(3);
    expect(frames / 60).toBeGreaterThanOrEqual(1.5);
    expect(frames / 60).toBeLessThanOrEqual(2.5);
    expect(r.min, 'a tap is not a throw').toBeGreaterThan(10);
  });

  it('too short and she lands IN the gap, and the run is lost with its own why ("You lose the run")', () => {
    const r = quick({}, `${AT_EDGE} var need = Math.ceil(raceThrowClearC()*RACE_THROW_FULL);
      ${CHARGE('need - 8')}
      var fl = { clears:RACE.flight.clears, x1:RACE.flight.x1 }, thrown = RACE.thrown;
      var n = 0; while (running && n < 400){ adv(1); n++; }
      return { fl:fl, thrown:thrown, need:need, t:__t, over:RACE.over, won:RACE.won, end:window.__raceEnd, why:window.__raceResult && window.__raceResult.why, ranAs:window.__raceResult && window.__raceResult.fighter,
        title:document.getElementById('resultTitle').textContent, sub:document.getElementById('resultSub').textContent, marshOver:RACE.marshOver, bridge:!!RACE.bridge, retry:!!RACE.retry, x:Math.round(marsh.x), far:RACE.farX, edge:RACE.edge, youDead:you.dead, frames:n };`);
    expect(r.t).toBe(r.need - 8);
    expect(r.fl.clears).toBe(false);
    expect(r.thrown).toBe(true);
    expect(r.marshOver, 'she never got across').toBe(false);
    expect(r.bridge, 'so there is no bridge').toBe(false);
    expect(r.x, 'she is in the gap').toBeGreaterThan(r.edge);
    expect(r.x).toBeLessThan(r.far);
    expect([r.over, r.won, r.end]).toEqual([true, false, false]);
    expect(r.why, 'its own why').toBe('short');
    expect(r.ranAs, 'the chain\'s onEnd still reads who ran').toBe('Knife');
    expect(r.title).toBe('Marshmallow fell short');
    expect(r.sub).toMatch(/gap/);
    expect(r.retry).toBe(true);
    expect(r.youDead, 'Knife is fine: it is the run that is lost').toBe(false);
    expect(r.frames, 'a moment after she lands, not long after').toBeLessThan(200);
  });

  it('the arc she flies is the arc the preview showed: the plan at a charge is the flight at that charge', () => {
    const r = quick({}, `${AT_EDGE} hold({smash:true}); adv(120);
      var plan = raceThrowPlan(you, marsh, RACE.charge.t/RACE_THROW_FULL), t = RACE.charge.t, pts = [];
      hold({}); adv(1); var fl = RACE.flight; var same = { x0:fl.x0, y0:fl.y0, x1:fl.x1, y1:fl.y1, n:fl.n, peak:fl.peak, clears:fl.clears };
      var seen = []; var k = 0; while (RACE.flight && k < 300){ adv(1); k++; if (RACE.flight){ var q = raceThrowPoint(fl, Math.min(1, fl.t/fl.n)); seen.push(Math.abs(marsh.x - q.x) + Math.abs(marsh.y - q.y)); } }
      return { plan:{ x0:plan.x0, y0:plan.y0, x1:plan.x1, y1:plan.y1, n:plan.n, peak:plan.peak, clears:plan.clears }, same:same, t:t, off:Math.max.apply(null, seen), landed:{ x:marsh.x, y:marsh.y, over:RACE.marshOver }, peakY:Math.min(fl.y0, fl.y1) - fl.peak, floor:RACE.floorY };`);
    expect(r.same, 'the same').toEqual(r.plan);
    expect(r.off, 'she is where the arc says, every frame').toBeLessThan(1);
    expect(r.landed.over).toBe(true);
    expect(Math.abs(r.landed.x - r.plan.x1)).toBeLessThan(1);
    expect(r.peakY, 'up and over').toBeLessThan(r.floor - 150);
  });

  it('enough charge carries her across in an arc; once she lands the bridge appears; crossing it wins', () => {
    const r = quick({}, `${AT_EDGE} var need = Math.ceil(raceThrowClearC()*RACE_THROW_FULL) + 12;
      ${CHARGE('need')}
      var out = { t:__t, need:need, fired:!!RACE.flight, thrown:RACE.thrown, held:!!marsh._raceHeld, in:marsh._raceThrown, bridgeDuringFlight:false, flew:[], peakY:marsh.y, clears:RACE.flight.clears };
      var n = 0; while (RACE.flight && n < 300){ adv(1); out.peakY = Math.min(out.peakY, marsh.y); if (RACE.bridge) out.bridgeDuringFlight = true; if (n%10===0) out.flew.push(Math.round(marsh.x)); n++; }
      out.flight = n; out.landed = { x:Math.round(marsh.x), y:Math.round(marsh.y + marsh.r), over:RACE.marshOver, far:RACE.farX, floor:RACE.floorY, bridge:!!RACE.bridge, land:RACE.landX };
      var m = 0; while (!RACE.bridge && m < 100){ adv(1); m++; }
      out.bridgeAfter = m; out.bridge = RACE.bridge ? { x:RACE.bridge.x, w:RACE.bridge.w, y:RACE.bridge.y, inWorld:worldPlats.indexOf(RACE.bridge) >= 0 } : null;
      // cross it
      hold({ right:true }); var k = 0; while (running && k < 400){ adv(1); k++; } hold({});
      out.cross = { frames:k, won:RACE.won, end:window.__raceEnd, why:window.__raceResult && window.__raceResult.why, x:Math.round(you.x), finish:RACE.finishX, title:document.getElementById('resultTitle').textContent, ranAs:window.__raceResult && window.__raceResult.fighter };
      return out;`);
    expect([r.fired, r.thrown, r.clears]).toEqual([true, true, true]);
    expect(r.held, 'she is let go of').toBe(false);
    expect(r.flight, 'an arc, over some frames').toBeGreaterThan(40);
    expect(r.peakY, 'up and over').toBeLessThan(r.landed.floor - 150);
    expect(r.bridgeDuringFlight, 'no bridge before she lands').toBe(false);
    expect(r.landed.over).toBe(true);
    expect(r.landed.x, 'on the far side').toBeGreaterThan(r.landed.far + 30);
    expect(r.landed.y).toBeCloseTo(r.landed.floor, 0);
    expect(r.landed.bridge, 'the bridge follows her landing').toBe(false);
    expect(r.bridgeAfter).toBeGreaterThan(0);
    expect(r.bridge).toBeTruthy();
    expect([r.bridge.x, r.bridge.x + r.bridge.w, r.bridge.inWorld]).toEqual([r.landed.far - 620, r.landed.far, true]);
    expect([r.cross.won, r.cross.end, r.cross.why]).toEqual([true, true, 'crossed']);
    expect(r.cross.ranAs).toBe('Knife');
    expect(r.cross.x).toBeGreaterThan(r.cross.finish);
    expect(r.cross.title).toBe('RUNNING! cleared');
  });

  it('a hit, a jump, or her wandering off drops the charge: she is put down, nothing is thrown, and he can start again', () => {
    const r = quick({}, `${AT_EDGE}
      hold({smash:true}); adv(40); var a0 = RACE.charge.t; you.hitstun = 6; adv(1);
      var hit = { charge:RACE.charge, held:!!marsh._raceHeld, thrown:RACE.thrown };
      hold({}); adv(4); you.hitstun = 0; you.invuln = 0; adv(30); you.x = RACE.edge - 60; you.y = RACE.floorY - you.r; you.vx = 0; adv(3);
      hold({smash:true}); adv(30); var b0 = RACE.charge.t; hold({smash:true, jump:true}); adv(2);
      var jump = { charge:RACE.charge, held:!!marsh._raceHeld, thrown:RACE.thrown, on:you.onground };
      hold({}); adv(80); you.x = RACE.edge - 60; you.y = RACE.floorY - you.r; you.vx = 0; you.vy = 0; marsh.x = you.x - 50; marsh.y = you.y; marsh.vx = 0; marsh.vy = 0; adv(3);
      hold({smash:true}); adv(50); var again = RACE.charge && RACE.charge.t;
      return { a0:a0, hit:hit, b0:b0, jump:jump, again:again, running:running && !RACE.over };`);
    expect(r.a0).toBe(40);
    expect([r.hit.charge, r.hit.held, r.hit.thrown]).toEqual([null, false, false]);
    expect(r.b0).toBe(30);
    expect([r.jump.charge, r.jump.held, r.jump.thrown]).toEqual([null, false, false]);
    expect(r.again, 'and start again').toBe(50);
    expect(r.running).toBe(true);
  });

  it('the line reaching you while you charge is still a loss', () => {
    const r = race({}, `${AT_EDGE} hold({smash:true}); adv(30); RACE.lineX = you.x - 60;
      var n = 0; while (running && n < 200){ step(); n++; }
      return { end:window.__raceEnd, why:window.__raceResult && window.__raceResult.why, frames:n, held:!!marsh._raceHeld };`);
    expect(r.end).toBe(false);
    expect(r.why).toBe('caught');
    expect(r.held, 'and she is put down with the race over').toBe(false);
  });

  it('shows the charge and the landing with no words: a ring while it is on offer, then a meter, a glow and the arc; drawing never throws', () => {
    const r = race({}, `${AT_EDGE} var out = { ready:!!raceThrowReady(you), errs:[] };
      var d = function(tag){ try{ drawRaceFx(); drawRaceBar(); }catch(e){ out.errs.push(tag + ': ' + e); } };
      d('ready'); hold({smash:true}); adv(50); out.c50 = RACE.charge.t; d('short'); adv(80); d('long');
      hold({}); adv(1); d('flight'); adv(30); d('flight2'); var n = 0; while (RACE.flight && n < 200){ adv(1); n++; } d('landed');
      out.src = String(drawRaceFx) + String(raceDrawThrow); out.bar = String(drawRaceBar);
      return out;`);
    expect(r.ready, 'the throw is on offer at the edge').toBe(true);
    expect(r.errs).toEqual([]);
    expect(r.c50).toBe(50);
    expect(r.src, 'the throw is drawn in the world').toMatch(/raceDrawThrow\(\)/);
    for (const needle of ['raceThrowPlan', 'raceThrowClearC', 'RACE.charge']) expect(r.src, 'draws from the plan and the charge: ' + needle).toContain(needle);
    expect(r.src, 'no words on the meter').not.toMatch(/fillText|strokeText/);
    expect(r.bar, 'the progress bar tints the back half, where the episode\'s hazards begin').toContain('RACE_BACK_X');
    expect(r.bar, 'and has no words either').not.toMatch(/fillText|strokeText/);
  });

  it('the camera reaches for the far side as he nears the edge, so the gap and the landing are in view', () => {
    const r = race({}, `you.controller = 'still'; var lead = function(x){ you.x = x; return raceCamLead(); };
      return { early:lead(RACE.edge - 3000), near:lead(RACE.edge - 1000 + 350), edge:lead(RACE.edge - 60), base:RACE_CAM_LEAD };`);
    expect(r.early).toBe(r.base);
    expect(r.near).toBeGreaterThan(r.base);
    expect(r.edge).toBeGreaterThan(r.near);
    expect(r.edge - r.base).toBeGreaterThanOrEqual(240);
  });
});

describe('the hazards', () => {
  // The lane's own hazards, one at a time: a flat endless floor, nothing else on the lane, everyone else out of the way.
  // only(kind, i) leaves just that piston, piano, voice or memory (armed again); put(x) stands you there; adv(n) steps n frames.
  const ISOLATE = `fighters.forEach(function(f){ if(f!==you){ f.dead = true; } });
    worldPlats = [{ x:-4000, y:RACE.floorY, w:90000, h:60, solid:true, floor:0 }];
    var HZ = RACE.hazards.slice(), PI = RACE.pianos.slice(), VO = RACE.voices.slice(), ME = RACE.memories.slice(), fy = RACE.floorY;
    var only = function(kind, i){ RACE.traps = []; RACE.crumbles = []; RACE.cannons = []; RACE.pendulums = []; RACE.ferries = []; RACE.bullets = []; RACE.hazards = kind==='piston' ? [HZ[i]] : []; RACE.pianos = kind==='piano' ? [PI[i]] : []; RACE.voices = kind==='voice' ? [VO[i]] : []; RACE.memories = kind==='memory' ? [ME[i]] : [];
      RACE.waves = []; RACE.pianos.forEach(function(p){ p.state = 'idle'; p.t = 0; }); RACE.voices.forEach(function(v){ v.fired = false; }); };
    var put = function(x){ you.controller = 'local'; you.x = x; you.y = fy - you.r; you.vx = 0; you.vy = 0; you.hitstun = 0; you.invuln = 0; you._raceBumpT = 0; you.slowed = 0; you.dead = false; you.jumps = 2; you.onground = false; you.pct = 0; hold({});
      for(var i=0;i<2;i++){ RACE.lineX = you.x - 5000; step(); }
      you.hitstun = 0; you.invuln = 0; you._raceBumpT = 0; you.vx = 0; you.vy = 0; you.x = x; you.y = fy - you.r; you.onground = true; };   // put down clean: whatever the two settling frames met (a piston that happened to be down) is not part of the test
    var adv = function(n){ for(var i=0;i<n;i++){ RACE.lineX = you.x - 5000; step(); } };
    only('none', 0);`;

  it('a piston bumps whoever it comes down on -- a shove back and a stun, no damage: the lane never kills by itself -- and harder the further along it stands', () => {
    const r = quick({}, `${ISOLATE}
      var out = [];
      [0, HZ.length - 1].forEach(function(i){
        var h = HZ[i]; only('piston', i);
        put(h.x + h.w/2); you.controller = 'still'; hold({});
        hazardT = Math.round(((0.5 - h.phase) % 1 + 1) % 1 * h.period);   // the bottom of its cycle
        adv(1);
        var a = { bump:you._raceBumpT, stun:you.hitstun, vx:you.vx, pct:you.pct, dead:you.dead, want:h.stun, kx:h.kx, s:h.s };
        adv(60); a.after = { pct:you.pct, dead:you.dead, over:RACE.over }; out.push(a);
      });
      // and the same piston, raised: a runner under it is not touched
      var h0 = HZ[0]; only('piston', 0); put(h0.x + h0.w/2); you.controller = 'still'; hazardT = Math.round(((0.0 - h0.phase) % 1 + 1) % 1 * h0.period);
      adv(1); var raised = { bump:you._raceBumpT, stun:you.hitstun, y:racePistonY(h0), floor:fy };
      return { out:out, raised:raised };`);
    for (const a of r.out) {
      expect(a.bump, 'bumped').toBeGreaterThan(0);
      expect(a.stun, 'stunned for its stun').toBe(a.want);
      expect(a.bump, 'and a moment of grace after it: the stun and 16 frames (this one already counted)').toBe(a.want + 16 - 1);
      expect(a.vx, 'shoved back').toBe(a.kx);
      expect(a.pct, 'no damage').toBe(0);
      expect([a.after.pct, a.after.dead, a.after.over]).toEqual([0, false, false]);
    }
    expect(r.out[1].want, 'the last stuns longer than the first').toBeGreaterThan(r.out[0].want);
    expect(r.out[1].kx, 'and shoves harder').toBeLessThan(r.out[0].kx);
    expect(r.raised.bump, 'raised, it clears him').toBe(0);
    expect(r.raised.y + 120, 'its underside is well over his head').toBeLessThan(r.raised.floor - 100);
  });

  it('a piano spawns when you cross its trigger and lands a fixed time later on whoever is under it -- crushed, not before; jump and you are over it; run and you are through', () => {
    const r = quick({}, `${ISOLATE}
      var out = { through:[], crushed:null, over:null, spawn:null };
      PI.forEach(function(p, i){
        only('piano', i); put(p.trig - 150); you.vx = 6.4; hold({right:true});
        var bumped = false, n = 0; while(n < 90){ adv(1); n++; if(you._raceBumpT > 0) bumped = true; }
        out.through.push({ bumped:bumped, past:you.x > p.x + p.w + you.r });
      });
      var p0 = PI[0];
      only('piano', 0); put(p0.trig - 40); var before = p0.state; adv(1); hold({}); you.controller = 'still';   // he stands short of the trigger, then on it
      var still = p0.state; put(p0.x + p0.w/2); you.controller = 'still'; adv(1); out.spawn = { before:before, still:still, after:p0.state, T:p0.T };
      var early = null; for(var k = 0; k < p0.T - 3; k++){ adv(1); if(you._raceBumpT > 0){ early = k; break; } }
      var landed = null; for(var m = 0; m < 12; m++){ adv(1); if(p0.state === 'crash'){ landed = you._raceBumpT > 0; break; } }
      out.crushed = { early:early, landed:landed, state:p0.state, bump:you._raceBumpT, stun:you.hitstun, vx:you.vx, pct:you.pct, want:p0.stun };
      only('piano', 0); put(p0.x + p0.w/2); adv(1); p0.t = p0.T - 1; you.y = fy - you.r - 220; you.vy = 0; adv(1);
      out.over = { state:p0.state, bump:you._raceBumpT };
      return out;`);
    expect(r.through.length).toBeGreaterThanOrEqual(1);
    for (const t of r.through) expect([t.bumped, t.past], 'keep running: through it').toEqual([false, true]);
    expect(r.spawn.before).toBe('idle');
    expect(r.spawn.still, 'not before the trigger').toBe('idle');
    expect(r.spawn.after, 'on it').toBe('fall');
    expect(r.crushed.early, 'not before it lands').toBeNull();
    expect(r.crushed.landed, 'crushed as it lands').toBe(true);
    expect(r.crushed.stun).toBeGreaterThan(r.crushed.want - 4);
    expect(r.crushed.vx, 'and shoved back').toBeLessThan(0);
    expect(r.crushed.pct, 'no damage').toBe(0);
    expect([r.over.state, r.over.bump], 'over it, in the air').toEqual(['crash', 0]);
  });

  it('the voice\'s wave rolls at you along the floor from its trigger and stops dead whoever it catches on the ground; one jump takes you over it', () => {
    const r = quick({}, `${ISOLATE}
      var out = [], speeds = [];
      VO.forEach(function(v, i){
        only('voice', i); put(v.trig - 5); hold({right:true});
        var stopped = false, stun = 0, vxAtStop = null, n = 0, xs = [];
        while(n < 120){ adv(1); n++; if(RACE.waves.length && n < 8) xs.push(RACE.waves[0].x); if(you._raceBumpT > 0 && !stopped){ stopped = true; vxAtStop = you.vx; } if(you._raceBumpT > 0) stun = Math.max(stun, you.hitstun); }
        only('voice', i); put(v.trig - 5); hold({right:true});
        var hit = false, hopped = false; n = 0;
        while(n < 120){
          var w = RACE.waves.find(function(q){ return q.x + q.th > you.x + you.r - you.r*2 && q.x - (you.x + you.r) < (MAXVX + q.sp)*18; });
          hold({right:true, jump:!!(w && you.onground)}); adv(1); n++; if(!you.onground) hopped = true; if(you._raceBumpT > 0) hit = true;
        }
        out.push({ stopped:stopped, vxAtStop:vxAtStop, stun:stun, want:v.stun, hit:hit, hopped:hopped, sp:v.sp, step:xs.length > 2 ? +(xs[1] - xs[2]).toFixed(3) : null });
      });
      return out;`);
    expect(r.length, 'the lane has one').toBeGreaterThanOrEqual(1);
    for (const v of r) {
      expect(v.stopped, 'stopped').toBe(true);
      expect(v.vxAtStop, 'dead').toBe(0);
      expect(v.stun).toBeGreaterThanOrEqual(v.want - 2);
      expect(v.hopped && !v.hit, 'jumped, and it rolled under him').toBe(true);
      expect(v.step, 'it moves at its own speed, toward him').toBeCloseTo(v.sp, 2);
    }
  });

  it('a memory slows whoever runs through it, and for a while after; a double jump takes you over it untouched', () => {
    const r = quick({}, `${ISOLATE}
      var out = [];
      ME.forEach(function(m, i){
        only('memory', i); put(m.x - 200); you.vx = 6.4; hold({right:true});
        var inside = 9, seen = 0, n = 0;
        while(n < 130){ adv(1); n++; if(you.x + you.r > m.x && you.x - you.r < m.x + m.w){ inside = Math.min(inside, you.vx); seen++; } }
        var xThrough = you.x, slowLeft = you.slowed;
        only('memory', i); put(m.x - 200); you.vx = 6.4; hold({right:true}); n = 0; var slowedOver = 0;
        while(n < 130){
          var j = (you.onground && m.x - (you.x + you.r) < 90 && m.x - (you.x + you.r) > -10) || (!you.onground && you.jumps > 0 && you.vy > 0 && you.x < m.x + m.w - 20);
          hold({right:true, jump:!!j}); adv(1); n++; if(you.slowed > 0) slowedOver++;
        }
        out.push({ inside:inside, seen:seen, slowedOver:slowedOver, xThrough:xThrough, xOver:you.x, cap:MAXVX*0.55, slow:m.slow });
      });
      return out;`);
    expect(r.length, 'the lane has one').toBeGreaterThanOrEqual(1);
    for (const m of r) {
      expect(m.seen).toBeGreaterThan(10);
      expect(m.inside, 'slowed inside').toBeLessThanOrEqual(m.cap + 0.01);
      expect(m.slowedOver, 'over it, untouched').toBe(0);
      expect(m.xOver, 'and further on for it').toBeGreaterThan(m.xThrough + 40);
    }
  });

  it('a restart (R, or Retry) arms every hazard afresh: no piano is left fallen, no wave rolling, no charge held', () => {
    const r = quick({}, `${ISOLATE}
      PI.forEach(function(p){ p.state = 'crash'; p.t = 9; }); VO.forEach(function(v){ v.fired = true; }); RACE.waves = [{ x:5000, sp:6, h:80, th:46, stun:30 }];
      RACE.charge = { t:50, who:marsh ? marsh.idx : 1, x:0 }; RACE.thrown = true; RACE.short = true; RACE.marshOver = true; RACE.landX = 22000;
      startMatch();
      var after = { pianos:RACE.pianos.map(function(p){ return p.state + ':' + p.t; }), voices:RACE.voices.map(function(v){ return v.fired; }), waves:RACE.waves.length, charge:RACE.charge, thrown:RACE.thrown, short:RACE.short, over:RACE.marshOver, land:RACE.landX, running:running, frames:RACE.frames };
      return after;`);
    expect(r.pianos.every((p) => p.startsWith('idle:'))).toBe(true);
    expect(r.voices.every((f) => f === false)).toBe(true);
    expect([r.waves, r.charge, r.thrown, r.short, r.over, r.land]).toEqual([0, null, false, false, false, 0]);
    expect(r.running).toBe(true);
  });

  it('the runners jump the voice\'s wave when it is a jump away, and not before', () => {
    const r = race({}, `${ISOLATE}
      var fan = fighters.find(function(f){ return f.name==='Fan'; }); fan.dead = false; fan.controller = 'ai'; fan.x = 4000; fan.y = fy - fan.r; fan.vx = 6; fan.vy = 0; fan.onground = true;
      RACE.obstacles = []; RACE.frames = 10;
      var far = (RACE.waves = [{ x:fan.x + 900, sp:6, h:80, th:46, stun:30 }], raceRunnerAi(fan).jump);
      fan.onground = true; fan._raceJumpHeld = false;
      var near = (RACE.waves = [{ x:fan.x + 150, sp:6, h:80, th:46, stun:30 }], raceRunnerAi(fan).jump);
      fan.onground = false; fan._raceJumpHeld = false;
      var air = (RACE.waves = [{ x:fan.x + 150, sp:6, h:80, th:46, stun:30 }], raceRunnerAi(fan).jump);
      return { far:far, near:near, air:air };`);
    expect(r.far, 'not yet').toBe(false);
    expect(r.near, 'now').toBe(true);
    expect(r.air, 'once, on the ground').toBe(false);
  });

  it('drawing every hazard live, in view, never throws', () => {
    const r = race({}, `${ISOLATE} var out = { errs:[] };
      var d = function(tag){ try{ drawRaceFx(); drawRaceBar(); }catch(e){ out.errs.push(tag + ': ' + e); } };
      HZ.forEach(function(h){ RACE.hazards.push(h); }); PI.forEach(function(p){ RACE.pianos.push(p); }); VO.forEach(function(v){ RACE.voices.push(v); }); ME.forEach(function(m){ RACE.memories.push(m); });
      RACE.pianos = PI; RACE.hazards = HZ; RACE.memories = ME;
      PI.forEach(function(p, i){ p.state = ['fall', 'crash', 'idle', 'done'][i % 4]; p.t = 12; });
      RACE.waves = VO.map(function(v){ return { x:v.x0, sp:v.sp, h:v.h, th:v.th, stun:v.stun }; });
      var all = HZ.map(function(h){ return h.x; }).concat(PI.map(function(p){ return p.x; }), RACE.waves.map(function(w){ return w.x; }), ME.map(function(m){ return m.x; }));
      all.forEach(function(x, i){ camX = x - W/2; camY = 0; you.x = x; d('at ' + Math.round(x)); });
      out.n = all.length; out.src = String(drawRaceFx);
      return out;`);
    expect(r.errs).toEqual([]);
    expect(r.n).toBeGreaterThanOrEqual(6);
    expect(r.src, 'no words on the hazards').not.toMatch(/fillText|strokeText/);
  });
});

// The platformer hazards (owner, 2026-09-30: "also add actual platformer hazards!!!! it doesnt always have to be canon!!!"): the
// genre's own, researched from what Super Mario, Sonic, Super Meat Boy, Celeste, Mega Man, Donkey Kong Country, Rayman and
// Geometry Dash keep putting in front of a runner. Each has a tell you can read, a way through for a player who reacts, and a
// size that grows with how far along the lane it stands; none wounds: a shove and a stun, like the rest of the lane.
describe('the platformer hazards', () => {
  // One obstacle of the lane at a time, on the lane's own floor around it (its pits included) and nothing else: solo(kind, pick) leaves
  // just that obstacle's records, put(x) stands you there, adv(n) steps n frames with the line kept far behind.
  const SOLO = `fighters.forEach(function(f){ if(f!==you){ f.dead = true; } });
    var KEEP = { tr:RACE.traps.slice(), cr:RACE.crumbles.slice(), fk:RACE.fakes.slice(), ca:RACE.cannons.slice(), pe:RACE.pendulums.slice(), fe:RACE.ferries.slice(), haz:RACE.hazards.slice() }, fy = RACE.floorY, PITS = RACE.pits.slice();
    var adv = function(n){ for(var i=0;i<n;i++){ RACE.lineX = you.x - 5000; step(); } };
    var solo = function(kind, pick){
      var list = RACE.obstacles.filter(function(q){ return q.k === kind; }), o = typeof pick === 'function' ? list.filter(pick)[0] : list[pick || 0], g = o.g;
      RACE.traps = KEEP.tr.filter(function(t){ return t.g === g; }); RACE.crumbles = KEEP.cr.filter(function(c){ return c.g === g; }); RACE.fakes = KEEP.fk.filter(function(c){ return c.g === g; });
      RACE.cannons = KEEP.ca.filter(function(c){ return c.trig === o.x0; }); RACE.pendulums = KEEP.pe.filter(function(p){ return p.g === g; }); RACE.ferries = KEEP.fe.filter(function(z){ return z.g === g; });
      RACE.hazards = KEEP.haz.filter(function(h){ return h.g === g; }); RACE.pianos = []; RACE.voices = []; RACE.memories = []; RACE.waves = []; RACE.bullets = [];
      RACE.cannons.forEach(function(c){ c.fired = false; c.at = 0; }); RACE.crumbles.concat(RACE.fakes).forEach(function(c){ c.t = -1; c.gone = 0; });
      var pits = PITS.filter(function(p){ return p.x0 >= o.x0 - 2 && p.x1 <= o.x1 + 2 && p.x1 < RACE.edge; }).sort(function(a, b){ return a.x0 - b.x0; }), at = -4000, plats = [];
      pits.forEach(function(p){ plats.push({ x:at, y:fy, w:p.x0 - at, h:60, solid:true, floor:0 }); at = p.x1; });
      plats.push({ x:at, y:fy, w:90000, h:60, solid:true, floor:0 });
      RACE.crumbles.concat(RACE.fakes).forEach(function(c){ plats.push(c.plat); }); RACE.ferries.forEach(function(z){ plats.push(z.plat); });
      worldPlats = plats; return o;
    };
    var put = function(x){ you.controller = 'local'; you.x = x; you.y = fy - you.r; you.vx = 0; you.vy = 0; you.hitstun = 0; you.invuln = 0; you._raceBumpT = 0; you.slowed = 0; you.dead = false; you.jumps = 2; you.onground = true; you.pct = 0; hold({}); RACE.lineX = you.x - 5000; };`;

  it('spikes: feet in a strip are bumped -- a shove and a stun, no damage; one jump takes you over it', () => {
    const r = quick({}, `${SOLO}
      var o = solo('spikes', 0), t = RACE.traps[0], out = {};
      put(o.x0 - 220); hold({right:true}); var hit = false, n = 0;
      while(n < 80){ adv(1); n++; if(you._raceBumpT > 0){ hit = true; break; } }
      out.run = { hit:hit, stun:you.hitstun, vx:you.vx, pct:you.pct, want:t.stun, kx:t.kx };
      put(o.x0 - 220); hold({right:true}); var bumped = false; n = 0;
      while(n < 100){ var d = o.x0 - (you.x + you.r); hold({right:true, jump:you.onground && d < 34 && d > -10}); adv(1); n++; if(you._raceBumpT > 0) bumped = true; }
      out.jump = { bumped:bumped, past:you.x > t.x + t.w + you.r, dead:you.dead };
      return out;`);
    expect(r.run.hit).toBe(true);
    expect([r.run.stun, r.run.vx, r.run.pct]).toEqual([r.run.want, r.run.kx, 0]);
    expect([r.jump.bumped, r.jump.past, r.jump.dead]).toEqual([false, true, false]);
  });

  it('a ceiling of spikes: one jump goes under the tips; a second bangs your head on them -- a shove and a stun, no damage', () => {
    const r = quick({}, `${SOLO}
      var n0 = RACE.obstacles.filter(function(q){ return q.k === 'ceiling'; }).length, res = [];
      for(var i = 0; i < n0; i++){
        var o = solo('ceiling', i), z = o.strip, run = {};
        // one jump at the edge of what is under the tips (the strip, or the pit)
        put(z.x0 - 200); hold({right:true}); var bumped = false, n = 0;
        while(n < 110){ var d = z.x0 - (you.x + you.r); hold({right:true, jump:you.onground && d < 34 && d > -10}); adv(1); n++; if(you._raceBumpT > 0) bumped = true; }
        run.one = { bumped:bumped, past:you.x > z.x1 + you.r, dead:you.dead, over:RACE.over };
        // and a second jump at the top of it
        put(z.x0 - 200); hold({right:true}); var bang = false, pct = 0; n = 0;
        while(n < 110 && !bang){ var d2 = z.x0 - (you.x + you.r); hold({right:true, jump:(you.onground && d2 < 34 && d2 > -10) || (!you.onground && you.jumps > 0 && you.vy > -1 && you.vy < 1)}); adv(1); n++; if(you._raceBumpT > 0){ bang = true; pct = you.pct; } }
        run.two = { bang:bang, pct:pct }; run.pit = !!o.pit; res.push(run);
      }
      return res;`);
    expect(r.length).toBeGreaterThanOrEqual(1);
    for (const c of r) {
      expect([c.one.bumped, c.one.past, c.one.dead, c.one.over], 'one jump: through' + (c.pit ? ' (over the pit)' : '')).toEqual([false, true, false, false]);
      expect([c.two.bang, c.two.pct], 'two jumps: the head hits').toEqual([true, 0]);
    }
  });

  it('a spring: a runner who steps on the pad is thrown up -- over the field of spikes before it, or into the tips above it; a hop over the pad under the tips is safe', () => {
    const r = quick({}, `${SOLO}
      var out = { helper:null, trap:null, hop:null };
      var oh = solo('spring', function(q){ return q.mode === 'helper'; }), field = oh.field;
      put(oh.x0 - 200); hold({right:true}); var bumped = false, launched = false, vyMin = 0, n = 0;
      while(n < 130){ adv(1); n++; if(you._raceBumpT > 0) bumped = true; vyMin = Math.min(vyMin, you.vy); if(you.vy < -10) launched = true; }
      out.helper = { bumped:bumped, launched:launched, past:you.x > field.x1 + you.r, vyMin:vyMin };
      var ot = solo('spring', function(q){ return q.mode === 'trap'; });
      put(ot.x0 - 100); hold({right:true}); var bang = false; n = 0;
      while(n < 90 && !bang){ adv(1); n++; if(you._raceBumpT > 0) bang = true; }
      out.trap = { bang:bang, pct:you.pct };
      put(ot.x0 - 100); hold({right:true}); bumped = false; n = 0;
      while(n < 110){ var d = ot.pad.x0 - (you.x + you.r); hold({right:true, jump:you.onground && d < 60 && d > -10}); adv(1); n++; if(you._raceBumpT > 0) bumped = true; }
      out.hop = { bumped:bumped, past:you.x > ot.pad.x1 + you.r };
      return out;`);
    expect([r.helper.bumped, r.helper.launched, r.helper.past], 'the pad throws you over the spikes').toEqual([false, true, true]);
    expect(r.helper.vyMin).toBeLessThan(-10);
    expect([r.trap.bang, r.trap.pct], 'and under the tips into them').toEqual([true, 0]);
    expect([r.hop.bumped, r.hop.past], 'a hop over it is safe').toEqual([false, true]);
  });

  it('fire jets: a vent burns you only while it burns, never while it glows or rests; a run of them is lit in a wave you can run through at full speed', () => {
    const r = quick({}, `${SOLO}
      var o = solo('fire', 0), t = RACE.traps[0], out = { states:{}, waves:[] };
      var at = function(frac){ hazardT = Math.round((((frac - t.phase) % 1) + 1) % 1 * t.period); };
      // burning, resting, glowing: a runner standing on the vent
      [['burn', (t.warn + t.burn/2)/t.period], ['rest', (t.warn + t.burn + 4)/t.period], ['glow', (t.warn/2)/t.period]].forEach(function(st){
        put(t.x + t.w/2); you.controller = 'still'; at(st[1]); adv(1); out.states[st[0]] = { bump:you._raceBumpT, stun:you.hitstun, vx:you.vx, pct:you.pct, want:t.stun, kx:t.kx };
      });
      // a runner at full speed into every group of vents: how many start times pass them all
      var fireGroups = {}; KEEP.tr.forEach(function(z){ if(z.k === 'fire'){ (fireGroups[z.g] = fireGroups[z.g] || []).push(z); } });
      Object.keys(fireGroups).forEach(function(g){
        var vs = fireGroups[g], o2 = solo('fire', function(q){ return q.g === +g; }), pass = 0, tried = 0;
        for(var off = 0; off < vs[0].period; off += 3){
          put(o2.x0 - 200); you.vx = 6.4; hold({right:true}); hazardT = off; var bumped = false;
          for(var k = 0; k < 75 + vs.length*26 && !bumped; k++){ adv(1); if(you._raceBumpT > 0) bumped = true; }
          tried++; if(!bumped && you.x > vs[vs.length - 1].x + vs[vs.length - 1].w + you.r) pass++;
        }
        out.waves.push({ n:vs.length, pass:pass, tried:tried });
      });
      return out;`);
    expect([r.states.burn.bump > 0, r.states.burn.stun, r.states.burn.vx, r.states.burn.pct], 'it burns').toEqual([true, r.states.burn.want, r.states.burn.kx, 0]);
    expect(r.states.rest.bump, 'it rests').toBe(0);
    expect(r.states.glow.bump, 'it glows first, and does not hurt').toBe(0);
    expect(r.waves.length).toBeGreaterThanOrEqual(2);
    for (const w of r.waves) expect(w.pass / w.tried, 'a wave of ' + w.n + ' can be run through from a fifth of the start times or more').toBeGreaterThanOrEqual(0.2);
  });

  it('a jet on the platform you land on (owner 2026-10-02: "Hazard timing") burns like a vent: only while it burns, never while it glows or rests', () => {
    const r = quick({}, `${SOLO}
      var o = solo('jetpad', 0), t = RACE.traps.find(function(z){ return z.k === 'jet'; }), out = { states:{} }, rest = t.period - t.warn - t.burn;
      var at = function(frac){ hazardT = Math.round((((frac - t.phase) % 1) + 1) % 1 * t.period); };
      [['burn', (t.warn + t.burn/2)/t.period], ['rest', (t.warn + t.burn + rest/2)/t.period], ['glow', (t.warn/2)/t.period]].forEach(function(st){
        put(t.x + t.w/2); you.controller = 'still'; at(st[1]); adv(1); out.states[st[0]] = { bump:you._raceBumpT, stun:you.hitstun, vx:you.vx, pct:you.pct, want:t.stun, kx:t.kx };
      });
      out.rest = rest; return out;`);
    expect([r.states.burn.bump > 0, r.states.burn.stun, r.states.burn.vx, r.states.burn.pct], 'it burns').toEqual([true, r.states.burn.want, r.states.burn.kx, 0]);
    expect(r.rest, 'the first jet of the lane rests a little between burning and glowing').toBeGreaterThan(2);
    expect(r.states.rest.bump, 'it rests').toBe(0);
    expect(r.states.glow.bump, 'it glows first, and does not hurt').toBe(0);
  });

  it('a conveyor belt runs backward under whoever stands on it, and never touches someone in the air', () => {
    const r = quick({}, `${SOLO}
      var o = solo('belt', 0), t = RACE.traps[0];
      put(t.x + t.w/2); you.controller = 'still'; adv(2); var x0 = you.x; adv(20); var slid = you.x - x0;
      put(t.x + t.w/2); you.controller = 'still'; adv(1); you.y = fy - you.r - 150; you.vy = 0; you.onground = false; var xa = you.x; adv(1);
      var air = you.x - xa;
      put(t.x - 100); you.vx = 6.4; hold({right:true}); adv(2); var xs = you.x; for(var i = 0; i < 40; i++) adv(1); var run = you.x - xs;
      return { slid:slid, air:air, bs:t.bs, run:run, w:t.w };`);
    expect(r.slid, 'a still runner slides back at the belt\'s own speed').toBeCloseTo(-20 * r.bs, 0);
    expect(Math.abs(r.air), 'in the air, nothing touches him').toBeLessThan(0.01);
    expect(r.run, 'a runner on it (or on his way to it) is slower than 6.4 a frame').toBeLessThan(40 * 6.4 - 10);
  });

  it('a crumbling floor: a tile shakes once stood on and drops later, coming back after a while; keep running and you cross it, stand still and you fall', () => {
    const r = quick({}, `${SOLO}
      var o = solo('crumble', 0), out = {};
      // a tile nobody stands on, about to go: gone for a while, then back
      var c1 = RACE.crumbles[1]; put(o.x0 - 400); c1.t = 1; adv(2);
      var gone = worldPlats.indexOf(c1.plat) < 0, left = c1.gone; adv(left + 2); out.back = { gone:gone, left:left, back:worldPlats.indexOf(c1.plat) >= 0, t:c1.t };
      // a still runner on a tile in the middle of the span (at its edge part of him would be over firm floor, and he would not fall): the
      // tiles under any part of him all go, and he falls with them (last: a fall ends the race)
      solo('crumble', 0); var c0 = RACE.crumbles[Math.floor(RACE.crumbles.length/2)];
      put(c0.x + c0.w/2); you.controller = 'still'; adv(1);
      var t0 = c0.t, dropAt = -1, had = worldPlats.indexOf(c0.plat) >= 0;
      for(var n = 0; n < 400 && running; n++){ adv(1); if(dropAt < 0 && c0.gone > 0){ dropAt = n; out.plat = worldPlats.indexOf(c0.plat) >= 0; } }
      out.still = { t0:t0, delay:c0.delay, dropAt:dropAt, had:had, fell:RACE.over, why:window.__raceResult && window.__raceResult.why };
      return out;`);
    expect(r.still.had).toBe(true);
    expect(r.still.t0, 'it starts to go the frame he stands on it').toBeGreaterThan(0);
    expect(Math.abs(r.still.dropAt - r.still.delay), 'and drops its delay later').toBeLessThanOrEqual(3);
    expect(r.plat, 'the tile is gone from the floor').toBe(false);
    expect(r.still.fell, 'he falls with it').toBe(true);
    expect(r.still.why).toBe('fell');
    expect([r.back.gone, r.back.left > 100, r.back.back, r.back.t], 'a tile nobody is on goes, stays away a while, and comes back').toEqual([true, true, true, -1]);
    const c = quick({}, `${SOLO}
      var o = solo('crumble', 0), out = { tiles:RACE.crumbles.length };
      put(o.x0 - 200); you.vx = 6.4; hold({right:true}); var n = 0, worstY = 0;
      while(n < 160){ adv(1); n++; worstY = Math.max(worstY, you.y - (fy - you.r)); }
      var gone = RACE.crumbles.filter(function(z){ return z.gone > 0 || z.t > 0; }).length;
      out.run = { past:you.x > o.x1 + you.r, worstY:worstY, over:RACE.over, stirred:gone };
      return out;`);
    expect([c.run.past, c.run.over], 'keep running and you cross it').toEqual([true, false]);
    expect(c.run.worstY, 'without sinking').toBeLessThan(6);
    expect(c.run.stirred, 'it was crumbling behind him').toBeGreaterThan(1);
  });

  it('the hairline (owner 2026-10-02: "slightly kaizo"): a tile that crumbles four frames after he lands on it, with spikes showing under it -- stand on it and he falls onto them; jump off at once and a second jump late and he is across; a second jump at the top and the ceiling gets him', () => {
    const r = quick({}, `${SOLO}
      var o = solo('kaizo', 0), c = RACE.fakes[0], out = {}, far = o.tile + o.TW + o.GB;
      put(c.x + 70); you.controller = 'still'; var dropAt = -1, bumpAt = -1;   // he stands where he landed, and the tile goes, and then the spikes
      for(var n = 0; n < 40; n++){ adv(1); if(dropAt < 0 && c.gone > 0) dropAt = n; if(bumpAt < 0 && you._raceBumpT > 0) bumpAt = n; }
      out.stand = { dropAt:dropAt, bumpAt:bumpAt, delay:c.delay, pct:you.pct, hair:!!c.hair };
      // from a spot on the tile: a jump two frames on, and a second jump d frames after it
      var run = function(off, d){ solo('kaizo', 0); put(c.x + off); var bumped = false, fell = false;
        for(var f = 0; f < 150 && !fell; f++){ hold({ right:true, jump:(f === 2 || (d !== null && f === 2 + d)) }); adv(1); if(you._raceBumpT > 0) bumped = true; if(you.y > fy + 200) fell = true; }
        hold({}); return { cross:!fell && !bumped && you.x > far + 10 && you.onground, bumped:bumped, fell:fell }; };
      var late = 0, top = 0, topBang = 0, tried = 0;
      for(var off = 40; off <= 130; off += 10){
        for(var d = 30; d <= 44; d += 2){ tried++; if(run(off, d).cross) late++; }
        for(var e = 12; e <= 28; e += 4){ var q = run(off, e); if(q.cross) top++; if(q.bumped) topBang++; }
      }
      out.jumps = { late:late, top:top, topBang:topBang, tried:tried };
      return out;`);
    expect(r.stand.hair, 'it is the hairline tile').toBe(true);
    expect(Math.abs(r.stand.dropAt - r.stand.delay), 'it goes four frames after he is on it').toBeLessThanOrEqual(3);
    expect(r.stand.bumpAt, 'and the spikes under it get him after it has gone').toBeGreaterThan(r.stand.dropAt);
    expect(r.stand.bumpAt - r.stand.dropAt, 'in a few frames: he can jump out of the fall, or not stand there at all').toBeLessThanOrEqual(14);
    expect(r.stand.pct, 'no damage').toBe(0);
    expect(r.jumps.late, 'a jump at once and a second jump late crosses it, from more than one spot of the tile').toBeGreaterThanOrEqual(4);
    expect(r.jumps.top, 'a second jump at the top of the first never does').toBe(0);
    expect(r.jumps.topBang, 'it bangs his head on the tips').toBeGreaterThan(0);
  });

  it('a cannon: cross its trigger and it fires its shots, a low one bumps whoever stays in its way and passes under a jumper, a high one passes over a runner and bumps a jumper', () => {
    const r = quick({}, `${SOLO}
      var o = solo('cannon', 0), c = RACE.cannons[0], out = { fire:null };
      put(c.trig + 5); you.controller = 'still'; adv(1);            // he crosses the trigger...
      you.x = c.trig - 1500; you.y = fy - you.r;                       // ...and is gone, so nothing is in the way of the shots
      var spawn = [], last = 0;
      for(var n = 0; n < 30 + c.n*c.gap; n++){ adv(1); if(RACE.bullets.length > last) spawn.push(RACE.frames - c.at); last = RACE.bullets.length; }
      out.fire = { n:c.n, gap:c.gap, fired:c.fired, spawn:spawn };
      // a low shot, a high shot, made by hand at the same spot
      var shot = function(high, sp){ RACE.bullets = [{ x:you.x + 420, y:fy - (high ? RACE_BULLET.high : RACE_BULLET.low), w:RACE_BULLET.w, h:RACE_BULLET.h, sp:sp, stun:14 }]; };
      var trial = function(high, jump, framesAhead){   // standing in its way; jumping framesAhead frames before it arrives, or never
        put(c.cx - 900); you.controller = 'local'; hold({}); shot(high, c.bs); var bumped = false, n = 0;
        while(n < 90){
          var b = RACE.bullets[0], lead = b ? b.x - (you.x + you.r) : 999;
          hold({ jump:jump && you.onground && lead < c.bs*framesAhead && lead > 0 }); adv(1); n++; if(you._raceBumpT > 0) bumped = true;
        }
        return bumped;
      };
      out.lowStay = trial(false, false); out.lowJump = trial(false, true, 18); out.highStay = trial(true, false); out.highJump = trial(true, true, 5);
      return out;`);
    expect(r.fire.fired).toBe(true);
    expect(r.fire.spawn, 'every shot leaves, the first 20 frames on and the rest a gap apart').toEqual(Array.from({ length: r.fire.n }, (_, i) => 20 + i * r.fire.gap));
    expect(r.lowStay, 'a low shot bumps a runner who stays in its way').toBe(true);
    expect(r.lowJump, 'and passes under a jumper').toBe(false);
    expect(r.highStay, 'a high shot passes over a runner on the floor').toBe(false);
    expect(r.highJump, 'and bumps one who jumps into it').toBe(true);
  });

  it('a swinging saw: it bumps a runner it sweeps, shoved away from it, and there is a way through at every moment -- run on, or hop it', () => {
    const r = quick({}, `${SOLO}
      var o = solo('pendulum', 0), p = RACE.pendulums[0], out = {};
      var at = function(frac){ hazardT = Math.round((((frac - p.phase) % 1) + 1) % 1 * p.period); };
      put(p.px); you.controller = 'still'; at(0); adv(1);   // the blade at the bottom of its swing, on him
      out.low = { bump:you._raceBumpT, stun:you.hitstun, pct:you.pct, want:p.stun, vx:you.vx };
      put(p.px); you.controller = 'still'; at(0.25); adv(1);   // out at the side, up in the air
      out.side = { bump:you._raceBumpT };
      // every moment the crossing can start: is there a way through (running on, or one jump at some moment)? the same planner the scripted runner uses
      var Z = p.L*Math.sin(p.A) + p.R + you.r + 10, ways = 0, total = 0;
      var hits = function(T0, jumpAt){ for(var k = 0; k*6.4 < 2*Z + 120; k++){ var xr = p.px - Z + k*6.4, tj = (jumpAt !== null && k >= jumpAt && k < jumpAt + 40) ? k - jumpAt : -1, hf = tj >= 0 ? Math.max(0, 12.5*tj - 0.31*tj*tj) : 0;
        var b = racePendulumPos(p, T0 + k); if(Math.hypot(xr - b.x, (fy - you.r - hf) - b.y) < p.R + you.r*0.85) return true; } return false; };
      for(var T0 = 0; T0 < p.period; T0++){ var ok = !hits(T0, null); for(var j = 0; j < 80 && !ok; j += 2) ok = !hits(T0, j); total++; if(ok) ways++; }
      out.ways = ways/total;
      return out;`);
    expect(r.low.bump, 'the blade at the bottom of its swing bumps him').toBeGreaterThan(0);
    expect([r.low.stun, r.low.pct]).toEqual([r.low.want, 0]);
    expect(r.side.bump, 'out at the side it does not').toBe(0);
    expect(r.ways, 'from nearly every start time there is a way through').toBeGreaterThanOrEqual(0.75);
  });

  it('the ferries: a runner who waits for one to dock, walks to its front, rides it across and steps off crosses a pit no jump can, from any moment', () => {
    const r = quick({}, `${SOLO}
      ${BOT}
      var o = solo('ferry', 0), fl = RACE.ferries, P = fl[0].period, res = [], n;
      for(var off = 0; off < P; off += Math.round(P/9)){
        put(o.x0 - 180); hazardT = off; var t = 0; you.controller = 'local';
        for(t = 0; t < 420 && running && you.x < o.x1 + 140; t++){ hold(__bot(you)); RACE.lineX = you.x - 5000; step(); }
        res.push({ off:off, across:you.x >= o.x1 + 140 || (you.x > o.x1 && you.onground), t:t, over:RACE.over });
        if(RACE.over) break;
      }
      hold({});
      var out = { res:res, P:P, gw:o.gw };
      return out;`);
    expect(r.res.length).toBeGreaterThanOrEqual(9);
    for (const c of r.res) { expect([c.across, c.over], 'from the start phase ' + c.off).toEqual([true, false]); expect(c.t, 'and in good time').toBeLessThan(r.P * 1.6 + 130); }
  });

  it('every pit is a pit with spikes at the bottom, and every platformer hazard draws with a tell and no words, in every state, without throwing', () => {
    const r = quick({}, `${SOLO} var out = { errs:[], n:0 };
      var d = function(tag){ try{ drawRaceFx(); drawRaceBar(); }catch(e){ out.errs.push(tag + ': ' + e); } out.n++; };
      RACE.traps = KEEP.tr; RACE.crumbles = KEEP.cr; RACE.fakes = KEEP.fk; RACE.cannons = KEEP.ca; RACE.pendulums = KEEP.pe; RACE.ferries = KEEP.fe; RACE.hazards = KEEP.haz;
      RACE.crumbles.forEach(function(c, i){ c.t = [-1, 14, 6, -1][i % 4]; c.gone = [0, 0, 0, 50][i % 4]; });
      RACE.fakes.forEach(function(c, i){ c.t = [-1, 3][i % 2]; c.gone = [0, 0][i % 2]; });   // the hairline's tile: whole, and shaking
      RACE.cannons.forEach(function(c, i){ c.fired = i % 2 === 0; c.at = RACE.frames - 5; });
      RACE.bullets = RACE.cannons.map(function(c){ return { x:c.cx - 200, y:fy - RACE_BULLET.low, w:RACE_BULLET.w, h:RACE_BULLET.h, sp:c.bs, stun:14 }; });
      var xs = RACE.traps.map(function(t){ return t.x; }).concat(RACE.crumbles.map(function(c){ return c.x; }), RACE.fakes.map(function(c){ return c.x; }), RACE.cannons.map(function(c){ return c.cx; }), RACE.pendulums.map(function(p){ return p.px; }), RACE.ferries.map(function(f){ return f.plat.x; }), RACE.pits.map(function(p){ return p.x0; }));
      xs.forEach(function(x, i){ hazardT = i*37; camX = x - W/2; camY = 0; you.x = x; d('at ' + Math.round(x)); });
      out.src = String(drawRaceFx) + String(raceDrawFloorSpikes) + String(raceDrawCeiling) + String(raceDrawSpring) + String(raceDrawFire) + String(raceDrawBelt) + String(raceDrawCrumble) + String(raceDrawHairline) + String(raceDrawCannon) + String(raceDrawBullet) + String(raceDrawPendulum) + String(raceDrawFerry) + String(raceDrawPit);
      out.pits = RACE.pits.length; out.gaps = RACE.obstacles.filter(function(o){ return o.k === 'gap'; }).length;
      return out;`);
    expect(r.errs).toEqual([]);
    expect(r.n).toBeGreaterThan(25);
    expect(r.pits, 'a pit for every gap, every crumbling floor, every ferry and every ceiling over a pit, and the last').toBeGreaterThan(r.gaps);
    expect(r.src, 'no words on any of them').not.toMatch(/fillText|strokeText/);
    for (const needle of ['raceDrawPit(p.x0, p.x1, fy)', 'raceDrawFloorSpikes', 'raceDrawCeiling', 'raceDrawSpring', 'raceDrawFire', 'raceDrawBelt', 'raceDrawCrumble', 'raceDrawHairline', 'raceDrawCannon', 'raceDrawBullet', 'raceDrawPendulum', 'raceDrawFerry']) expect(r.src, needle).toContain(needle);
  });
});

describe('a fall, and what is said', () => {
  it('falling into a gap ends the race: onEnd(false), "You fell"', () => {
    const r = race({}, `you.controller = 'still'; var gap = RACE.obstacles.find(function(o){ return o.k==='gap'; });
      you.x = (gap.x0 + gap.x1)/2; you.y = RACE.floorY - 200; you.vx = 0; you.vy = 0; RACE.lineX = -5000;
      var n = 0; while (running && n < 300){ step(); RACE.lineX = -5000; n++; }
      return { end:window.__raceEnd, why:window.__raceResult && window.__raceResult.why, title:document.getElementById('resultTitle').textContent, frames:n };`);
    expect(r.end).toBe(false);
    expect(r.why).toBe('fell');
    expect(r.title).toBe('You fell');
  });

  it('a runner Knife knocks out is deleted, with no KO line, and Marshmallow cannot be hit by him', () => {
    const r = race({}, `you.controller = 'still'; var fan = fighters.find(function(f){ return f.name==='Fan'; });
      fan.x = you.x + 40; fan.y = you.y; fan.controller = 'still'; marsh.x = you.x - 40; marsh.y = you.y; marsh.controller = 'still'; step();
      window.__banners = []; window.__lastBanner = null;
      fan.pct = fan.koCap - 1; fan.invuln = 0; marsh.invuln = 0; marsh.pct = 0; you.face = 1; you.atkCd = 0;
      doAttack(you); for (var i=0; i<20; i++) step();
      you.face = -1; you.atkCd = 0; doAttack(you); for (var j=0; j<20; j++) step();
      return { fanDead:fan.dead, marshPct:marsh.pct, banners:window.__banners.map(function(b){ return b.text; }), last:window.__lastBanner };`);
    expect(r.fanDead).toBe(true);
    expect(r.marshPct).toBe(0);
    expect(r.banners).toEqual([]);
    expect(r.last).toBeNull();
  });

  it('leaving the race puts the player\'s own mode, count, stage and pick back; only its result screen keeps the Retry', () => {
    const r = W.eval(`(function(){
      go('title'); SETTINGS.mode='teams'; SETTINGS.count=4; chosen=ROSTER.find(function(r){ return r.name==='Pencil'; }); stage=STAGES[0];
      startRunningRace({ onEnd:function(){ return true; } });
      var during = { mode:SETTINGS.mode, stage:stage.id, you:chosen.name };
      var you = fighters.find(function(f){ return f.you; }); you.controller='still'; var n=0; while(running && n<2000){ step(); n++; }
      go('result');
      var after = { mode:SETTINGS.mode, count:SETTINGS.count, stage:stage.id, chosen:chosen.name, active:RACE.active, retry:!!RACE.retry, button:document.getElementById('resultRematch').textContent };
      go('title');
      var title = { retry:!!RACE.retry, button:document.getElementById('resultRematch').textContent };
      SETTINGS.mode='ffa'; SETTINGS.count=2;
      return { during:during, after:after, title:title };
    })()`);
    expect(r.during).toEqual({ mode: 'ffa', stage: 'meafterlife', you: 'Knife' });
    expect(r.after.mode).toBe('teams'); expect(r.after.count).toBe(4); expect(r.after.chosen).toBe('Pencil');
    expect(r.after.active).toBe(false);
    expect(r.after.retry).toBe(true);
    expect(r.after.button).toMatch(/^Retry/);
    expect(r.title.retry).toBe(false);
    expect(r.title.button).toMatch(/^Rematch/);
  });
});
