import { describe, it, expect, beforeAll } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// RUNNING!, the Red Line Game: a one-off race, the RUNNING! step of Steve Cobs's unlock chain (startRunningRace). The owner:
// "1, and there will be a continuously moving line and obstacles you must go through." / "attacks allowed" / "and you have to
// throw marshmallow with a modified grappling hook at the end to sling her over." / "Then Knife crosses too" (a bridge or
// platform appears once she lands and he must cross before the moving line catches him). And the standing rule on the line:
// never tune it for a bot -- "dont tune, cuz thats an agent, not a player". The scripted runner below holds right, jumps at
// each gap and wall, drops under each bar and takes the pistons as they come; when it cannot finish, the course's fairness is
// what gets fixed (obstacle spacing, hazards), never the line.
// The wiki (MeAfterlife): "a running lane with a finish line called the Red Line Game. If someone runs on it, a red line will
// appear and chase after them ... If the red line reaches them before they make it, the line "deletes" them."

let W;
// loadMonolith's canvas shim hands back gradient objects, so the real draw() runs to completion under jsdom and the loop's
// one-time "ERROR:" line never goes up: the banner tap below must see GO! and nothing else.
beforeAll(async () => { W = loadMonolith(11).window; await W.eval('profileReady'); });

// Every banner() call is recorded from the first race on: a race may say GO!, and nothing else, until its result screen.
const TAP = `if(!window.__bannerTap){ window.__bannerTap=true; window.__banners=[]; var _b=banner; banner=function(t,m,k,l){ window.__banners.push({text:String(t), kind:k||null}); return _b(t,m,k,l); }; }`;
// Start the race the way the unlock chain will: startRunningRace({ onEnd }). onEnd returns true so no result screen is
// scheduled in the middle of the next test. `you` is the local runner (Knife unless the hidden `fighter` option says otherwise).
const race = (opts, body) => W.eval(`(function(){
  ${TAP} SETTINGS.itemRate=3; SETTINGS.items=true; SETTINGS.stocks=3; LOCAL_PLAYERS=1; window.__raceEnd = undefined; window.__raceResult = null;
  var __b0 = window.__banners.length;   // banners from this race's GO! on: window.__banners.slice(__b0)
  var __ok = startRunningRace(Object.assign(${JSON.stringify(opts || {})}, { onEnd:function(won, res){ window.__raceEnd = won; window.__raceResult = res; return true; } }));
  var you = fighters.find(function(f){ return f.you; }), marsh = fighters.find(function(f){ return f._marsh; });
  var K = KEYS, hold = function(o){ down[K.left]=!!o.left; down[K.right]=!!o.right; down[K.jump]=!!o.jump; down[K.down]=!!o.down; down[K.special]=!!o.special; down[K.attack]=!!o.attack; };
  ${body}
})()`);
// THE SCRIPTED RUNNER (page code): holds right; jumps at each gap and wall (a second jump when the first will not carry);
// drops under each bar by pressing DOWN on its ledge; brakes at the edge, fires the special once, waits for the bridge and
// crosses. It never dodges a piston. It reads the course (RACE.obstacles), as a player reads the screen.
const BOT = `var __bot = function(you){
  var o = { right:true, jump:false, down:false, special:false }, fy = RACE.floorY, ahead = you.x + you.r;
  if(RACE.bridge){ return o; }
  if(ahead > RACE.edge - 80){ o.right = false; if(you.onground && Math.abs(you.vx) < 0.6 && !RACE.sling && !RACE.marshOver && !you._botFired){ o.special = true; you._botFired = true; } return o; }
  var ob = RACE.obstacles.find(function(b){ return b.x1 > you.x - 20; });
  if(!ob) return o;
  var lead = 34 + Math.max(0, you.vx)*3;
  if(ob.k==='gap'){
    if(you.onground && ob.x0 - ahead < lead && ob.x0 - ahead > -60) o.jump = true;
    else if(!you.onground && you.vy > 0 && you.jumps > 0 && you.x > ob.x0 && you.x < ob.x1 && you.y + you.r > fy - 30) o.jump = true;
  } else if(ob.k==='wall'){
    if(you.onground && ob.x0 - ahead < 70 + Math.max(0, you.vx)*2 && ob.x0 - ahead > -10) o.jump = true;
    else if(!you.onground && you.jumps > 0 && you.vy > 0 && you.x < ob.x1 && you.y + you.r > ob.top - 6) o.jump = true;
  } else if(ob.k==='bar'){
    if(you.onground && Math.abs(you.y + you.r - ob.ledgeY) < 3){ if(ob.barX0 - ahead < 70) o.down = true; }
    else if(you.onground && ob.stepX - ahead < 70 + Math.max(0, you.vx)*2 && ob.stepX - ahead > -10) o.jump = true;
    else if(!you.onground && you.jumps > 0 && you.vy > 0 && you.x < ob.stepX + 40 && you.y + you.r > ob.ledgeY - 6) o.jump = true;
  }
  return o;
};
var __run = function(you, hold, maxFrames, every){
  var log = [], minLead = 1e9, n = 0;
  for(; n < maxFrames && running; n++){
    hold(__bot(you)); step();
    if(!you.dead) minLead = Math.min(minLead, you.x - RACE.lineX);
    if(every && n % every === 0) log.push({ f:n, x:Math.round(you.x), line:Math.round(RACE.lineX), marsh:(function(){ var m = fighters.find(function(q){ return q._marsh; }); return m ? { x:Math.round(m.x), dead:m.dead, y:Math.round(m.y) } : null; })(), alive:fighters.filter(function(q){ return !q.dead; }).length });
  }
  hold({});
  return { frames:n, minLead:Math.round(minLead), log:log };
};`;

describe('the course', () => {
  it('is a long lane of gaps, walls, bars and pistons, laid from a fixed seed: the same every time', () => {
    const a = race({}, `return { ok:__ok, WW:WW, W:W, obs:JSON.stringify(RACE.obstacles), plats:JSON.stringify(worldPlats), haz:JSON.stringify(RACE.hazards),
      kinds:RACE.obstacles.map(function(o){ return o.k; }), edge:RACE.edge, far:RACE.farX, floor:RACE.floorY, gy:groundY(), big:isBig(), scrolls:scrolls(), mode:SETTINGS.mode, items:itemSpawnInterval() };`);
    const b = race({}, `return { obs:JSON.stringify(RACE.obstacles), plats:JSON.stringify(worldPlats), haz:JSON.stringify(RACE.hazards) };`);
    expect(a.ok).toBe(true);
    expect(a.obs, 'the same obstacles').toBe(b.obs);
    expect(a.plats, 'the same floor, walls, steps, ledges and beams').toBe(b.plats);
    expect(a.haz, 'the same pistons on the same cycles').toBe(b.haz);
    expect(a.WW, 'several screens wide').toBeGreaterThan(a.W * 6);
    expect(a.kinds.length).toBeGreaterThanOrEqual(12);
    for (const k of ['gap', 'wall', 'bar', 'piston']) expect(a.kinds, 'every kind of obstacle is on the course').toContain(k);
    expect(a.kinds[0], 'the first obstacle is a gap to jump').toBe('gap');
    expect(a.far - a.edge, 'the last gap is past any jump').toBeGreaterThan(560);
    expect([a.gy, a.big, a.scrolls, a.mode]).toEqual([a.floor, true, true, 'ffa']);
    expect(a.items, 'no items, whatever the setting').toBe(0);
  });

  it('every gap can be jumped, every wall hopped and every bar has room under it (the fairness the line is never tuned for)', () => {
    const r = race({}, `return { obs:RACE.obstacles, plats:worldPlats.filter(function(p){ return p.raceLedge || p.raceBar; }), floor:RACE.floorY };`);
    for (const o of r.obs) {
      if (o.k === 'gap') expect(o.x1 - o.x0, 'a running jump carries about 258 px').toBeLessThanOrEqual(250);
      if (o.k === 'wall') expect(r.floor - o.top, 'a jump rises 126 px').toBeLessThanOrEqual(100);
      if (o.k === 'bar') {
        expect(r.floor - o.ledgeY, 'the step onto the ledge is hoppable').toBeLessThanOrEqual(100);
        expect(r.floor - o.ledgeY - 12, 'a fighter (48 px) fits under the ledge').toBeGreaterThanOrEqual(48);
        const bar = r.plats.find((p) => p.raceBar && p.x === o.barX0);
        expect(bar).toBeTruthy();
        expect(o.ledgeY - (bar.y + bar.h), 'and does not fit under the beam while on the ledge').toBeLessThan(48);
      }
    }
    // the run-ups: nothing is placed within 240 px of the obstacle before it
    for (let i = 1; i < r.obs.length; i++) expect(r.obs[i].x0 - r.obs[i - 1].x1).toBeGreaterThanOrEqual(240);
  });
});

describe('the line', () => {
  it('starts behind everyone and advances every frame, whether or not anyone moves; it never stops, never slows', () => {
    const r = race({}, `you.controller = 'still';
      var xs = [RACE.lineX], you0 = you.x; for (var i=0; i<90; i++){ step(); xs.push(RACE.lineX); }
      var d = []; for (var j=1; j<xs.length; j++) d.push(+(xs[j]-xs[j-1]).toFixed(6));
      return { start:xs[0], behind:fighters.every(function(f){ return f.x > xs[0]; }), you0:you0, moved:you.x !== you0, steps:d, speed:RACE_LINE_SPEED, drawn:String(drawRaceFx).indexOf('RACE.lineX') >= 0 && String(draw).indexOf('drawRaceFx()') >= 0 };`);
    expect(r.behind).toBe(true);
    expect(r.moved, 'a still runner').toBe(false);
    expect(new Set(r.steps).size, 'the same step every frame').toBe(1);
    expect(r.steps[0]).toBe(r.speed);
    expect(r.speed).toBeGreaterThan(0);
    expect(r.drawn, 'the line is drawn').toBe(true);
  });

  it('catches a still runner: the race is lost, "The line caught you", and Retry runs it again', () => {
    const r = race({}, `you.controller = 'still';
      var n = 0; while (running && n < 2000){ step(); n++; }
      var out = { frames:n, over:RACE.over, won:RACE.won, end:window.__raceEnd, why:window.__raceResult && window.__raceResult.why, title:document.getElementById('resultTitle').textContent,
        retry:!!RACE.retry, button:document.getElementById('resultRematch').textContent, caughtAt:Math.round(you.x - RACE.lineX) };
      // Retry: the result screen's button calls rematch() -> startMatch(), which runs the race again from the top
      startMatch();
      out.again = { active:RACE.active, running:running, over:RACE.over, frames:RACE.frames, line:RACE.lineX, youX:fighters.find(function(f){ return f.you; }).x, alive:fighters.filter(function(f){ return !f.dead; }).length };
      return out;`);
    expect(r.frames).toBeLessThan(2000);
    expect([r.over, r.won, r.end]).toEqual([true, false, false]);
    expect(r.why).toBe('caught');
    expect(r.title).toBe('The line caught you');
    expect(r.retry).toBe(true);
    expect(r.button).toMatch(/^Retry/);
    expect(r.again.active && r.again.running && !r.again.over).toBe(true);
    expect(r.again.frames, 'from the top (beginMatchNow steps the first frame itself)').toBeLessThanOrEqual(1);
    expect(r.again.line, 'the line is back behind the start').toBeCloseTo(r.again.youX - 520 + r.again.frames * 4.2, 6);
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
    expect(m.you, 'not as Marshmallow herself: she is the one who is slung').toBe('Knife');
  });

  it('AI runners run right and clear the first gap; the slow ones fall behind, are caught, and are gone', () => {
    const r = race({}, `${BOT}
      var first = RACE.obstacles[0];
      var out = __run(you, hold, 4000, 60);
      var past = fighters.filter(function(f){ return f._runner && !f._marsh && (f.dead || f.x > first.x1 + 40); }).length;
      var gone = fighters.filter(function(f){ return f._runner && !f._marsh && f.dead; });
      return { frames:out.frames, won:RACE.won, past:past, gone:gone.map(function(f){ return f.name; }), goneX:gone.map(function(f){ return Math.round(f.x); }), line:Math.round(RACE.lineX) };`);
    expect(r.won).toBe(true);
    expect(r.past, 'the runners jump the gap (or were lost later, past it)').toBe(6);
    expect(r.gone.length, 'some fall behind and are caught').toBeGreaterThan(0);
    expect(r.gone.length).toBeLessThan(6);
  });
});

describe('the run', () => {
  it('a scripted runner who holds right and jumps at each gap reaches the end: the course is completable in principle', () => {
    const r = race({}, `${BOT}
      var out = __run(you, hold, 4000, 120);
      return { frames:out.frames, minLead:out.minLead, log:out.log, won:RACE.won, over:RACE.over, end:window.__raceEnd, why:window.__raceResult && window.__raceResult.why,
        title:document.getElementById('resultTitle').textContent, secs:window.__raceResult && window.__raceResult.secs, youX:Math.round(you.x), finish:RACE.finishX };`);
    expect(r.over, 'the race was decided within the frame budget').toBe(true);
    expect([r.won, r.end, r.why], JSON.stringify(r.log)).toEqual([true, true, 'crossed']);
    expect(r.title).toBe('RUNNING! cleared');
    expect(r.youX).toBeGreaterThan(r.finish);
    expect(r.minLead, 'never touched by the line').toBeGreaterThan(0);
    expect(r.secs).toBeGreaterThan(10);
  });

  it('Marshmallow keeps pace: never far behind you, never behind the line, never lost -- and she is over the gap at the end', () => {
    const r = race({}, `${BOT}
      var worst = -1e9, behindLine = 0, lost = 0, n = 0;
      for (; n < 4000 && running; n++){
        hold(__bot(you)); step();
        if (marsh.dead) lost++;
        if (!RACE.marshOver && !RACE.sling){ worst = Math.max(worst, you.x - marsh.x); if (marsh.x - marsh.r*0.5 <= RACE.lineX) behindLine++; }
      }
      hold({});
      return { won:RACE.won, worst:Math.round(worst), behindLine:behindLine, lost:lost, over:RACE.marshOver, marshX:Math.round(marsh.x), far:RACE.farX, leash:RACE_MARSH_LEASH, alive:!marsh.dead };`);
    expect(r.won).toBe(true);
    expect(r.lost, 'never lost').toBe(0);
    expect(r.behindLine, 'never caught').toBe(0);
    expect(r.worst, 'at your side').toBeLessThanOrEqual(r.leash + 40);
    expect(r.over && r.alive).toBe(true);
    expect(r.marshX).toBeGreaterThan(r.far);
  });
});

describe('the finish: the modified hook', () => {
  // Put you and Marshmallow on the floor at the lane's edge, the line far behind, and settle a frame.
  const AT_EDGE = `you.controller = 'still'; you.x = RACE.edge - 40; you.y = RACE.floorY - you.r; you.vx = 0; you.vy = 0; marsh.x = you.x - 70; marsh.y = you.y; marsh.vx = 0; marsh.vy = 0;
    RACE.lineX = you.x - 3000; step(); RACE.lineX = you.x - 3000; you.spCd = 0; you._sp = false;`;

  it('the sling only works at the edge: mid-lane the special is the bag of tricks as usual', () => {
    const r = race({}, `you.controller = 'still'; you.x = RACE.edge - 1200; you.y = RACE.floorY - you.r; marsh.x = you.x - 60; marsh.y = you.y; step(); you.spCd = 0;
      var tricks0 = you._trickN||0, shots0 = projectiles.length;
      fireSpecial(you, {});
      return { sling:RACE.sling, slung:!!marsh._slung, tricks:(you._trickN||0) - tricks0, shots:projectiles.length - shots0 };`);
    expect(r.sling).toBeNull();
    expect(r.slung).toBe(false);
    expect(r.tricks, 'the bag of tricks fired instead').toBe(1);
    expect(r.shots).toBeGreaterThan(0);
  });

  it('and only on Marshmallow: with her out of reach and a runner at your side, nobody is slung', () => {
    const r = race({}, `${AT_EDGE}
      var fan = fighters.find(function(f){ return f.name==='Fan'; }); fan.x = you.x - 60; fan.y = you.y; fan.vx = 0; fan.vy = 0;
      marsh.x = you.x - 900; marsh.y = you.y;   // beyond the hook's reach
      fireSpecial(you, {});
      return { sling:RACE.sling, fan:!!fan._slung, marsh:!!marsh._slung, reach:RACE_SLING_REACH };`);
    expect(r.sling).toBeNull();
    expect([r.fan, r.marsh]).toEqual([false, false]);
  });

  it('at the edge it hooks Marshmallow and slings her over in an arc; once she lands the bridge appears; crossing it wins', () => {
    const r = race({}, `${AT_EDGE}
      fireSpecial(you, {});
      var out = { fired:!!RACE.sling, slung:!!marsh._slung, hook:you._hookFx && you._hookFx.to===marsh.idx, peakY:marsh.y, bridgeDuringFlight:false, landed:null, flew:[] };
      var n = 0; while (RACE.sling && n < 200){ step(); out.peakY = Math.min(out.peakY, marsh.y); if (RACE.bridge) out.bridgeDuringFlight = true; if (n%10===0) out.flew.push(Math.round(marsh.x)); n++; }
      out.flight = n; out.landed = { x:Math.round(marsh.x), y:Math.round(marsh.y + marsh.r), over:RACE.marshOver, far:RACE.farX, floor:RACE.floorY, bridge:!!RACE.bridge };
      var m = 0; while (!RACE.bridge && m < 100){ step(); m++; }
      out.bridgeAfter = m; out.bridge = RACE.bridge ? { x:RACE.bridge.x, w:RACE.bridge.w, y:RACE.bridge.y, inWorld:worldPlats.indexOf(RACE.bridge) >= 0 } : null;
      // cross it
      you.controller = 'local'; hold({ right:true }); var k = 0; while (running && k < 400){ RACE.lineX = Math.min(RACE.lineX, you.x - 1500); step(); k++; } hold({});
      out.cross = { frames:k, won:RACE.won, end:window.__raceEnd, why:window.__raceResult && window.__raceResult.why, x:Math.round(you.x), finish:RACE.finishX, title:document.getElementById('resultTitle').textContent };
      return out;`);
    expect([r.fired, r.slung, r.hook]).toEqual([true, true, true]);
    expect(r.flight, 'an arc, over some frames').toBeGreaterThan(20);
    expect(r.peakY, 'up and over').toBeLessThan(r.landed.floor - 150);
    expect(r.bridgeDuringFlight, 'no bridge before she lands').toBe(false);
    expect(r.landed.over).toBe(true);
    expect(r.landed.x, 'on the far side').toBeGreaterThan(r.landed.far);
    expect(r.landed.y).toBeCloseTo(r.landed.floor, 0);
    expect(r.landed.bridge, 'the bridge follows her landing').toBe(false);
    expect(r.bridgeAfter).toBeGreaterThan(0);
    expect(r.bridge).toBeTruthy();
    expect([r.bridge.x, r.bridge.x + r.bridge.w, r.bridge.inWorld]).toEqual([r.landed.far - 620, r.landed.far, true]);
    expect([r.cross.won, r.cross.end, r.cross.why]).toEqual([true, true, 'crossed']);
    expect(r.cross.x).toBeGreaterThan(r.cross.finish);
    expect(r.cross.title).toBe('RUNNING! cleared');
  });

  it('the line reaching you while you wait at the edge is still a loss', () => {
    const r = race({}, `${AT_EDGE} fireSpecial(you, {}); RACE.lineX = you.x - 60;
      var n = 0; while (running && n < 200){ step(); n++; }
      return { end:window.__raceEnd, why:window.__raceResult && window.__raceResult.why, frames:n };`);
    expect(r.end).toBe(false);
    expect(r.why).toBe('caught');
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

  it('no text during the run but GO!: a whole scripted run and a caught run say nothing else', () => {
    const r = race({}, `${BOT}
      var a = __run(you, hold, 4000, 0); var wonA = RACE.won;
      var seenA = window.__banners.slice(__b0), b0 = window.__banners.length;
      startRunningRace({ onEnd:function(){ return true; } }); you = fighters.find(function(f){ return f.you; }); you.controller = 'still';
      var n = 0; while (running && n < 2000){ step(); n++; }
      return { wonA:wonA, framesA:a.frames, seenA:seenA.map(function(b){ return b.text + '|' + (b.kind||''); }), seenB:window.__banners.slice(b0).map(function(b){ return b.text + '|' + (b.kind||''); }), err:!!window.__loopErrLogged };`);
    expect(r.wonA).toBe(true);
    expect(r.seenA, 'the winning run').toEqual(['GO!|']);
    expect(r.seenB, 'the caught run').toEqual(['GO!|']);
    expect(r.err, 'the loop never threw').toBe(false);
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
