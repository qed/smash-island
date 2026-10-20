import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadMonolith } from './helpers/load-monolith.js';

// THE STAT CHECK ON THE CPU ROUTES (FIGHTER STATS, the owner, 2026-10-18: "give each fighter stats"). The shipped graphs are planned on every stat at 1;
// a CPU with its own run, air, jump or fall has each move of its paths checked with its own numbers and leaves out the ones it cannot make.
// Review, 2026-10-19: the check turned down moves the live CPU made and left a carrier with no way home, and one check could hold a frame for hundreds
// of milliseconds. So: the check is never a CPU's last way (ctfAiPlan plans past it when nothing else gets there), and it is worked through a few
// flights a step from a queue (ctfNavStatTick), never all at once.

const GID = 'castle.s';
const graph = readFileSync(`artifacts/V1/assets/ctf/castle-s-graph.json`, 'utf8');
const ROBOTY = { run: 0.89, air: 1, jump: 0.92, fall: 1.11, dmg: 1 };   // (the lowest jump over the heaviest fall in FIGHTER_STATS)

// A Capture the Flag match on the small castle, the hiding over; a CPU of side 0 carrying side 1's flag on side 1's half, with Roboty's numbers.
function setup(seed) {
  const { window: w } = loadMonolith(seed);
  w.eval(`CTF_GRAPHS[${JSON.stringify(GID)}] = ${graph};`);
  const ok = w.eval(`(function(){
    SETTINGS.mode='ctf'; SETTINGS.count=4; SETTINGS.itemRate=0; SETTINGS.ctfSpectate=true; CTF.forceMap='castle'; beginMatchNow();
    for(var i = 0; i < 4000 && !(CTF.live && CTF.live.phase !== 'bid'); i++) step();
    if((CTF.map.gid || CTF.map.id) !== ${JSON.stringify(GID)}) return 'map ' + (CTF.map.gid || CTF.map.id);
    ctfEndHide(CTF.live);
    for(var i = 0; i < 400 && !(CTF.nav && CTF.nav.ready); i++) step();
    var L = CTF.live, nav = CTF.nav, mid = L.map.WW/2, f = fighters.find(function(g){ return g.team === 0; });
    var fl = L.flags.find(function(q){ return q.team !== f.team && q.st !== 2; });
    fighters.forEach(function(g){ if(g !== f){ g.controller = 'still'; g.you = false; } });
    f.st = ${JSON.stringify(ROBOTY)}; f.controller = 'ai'; f.you = false; fl.st = 2; fl.car = f.idx; f._cf = fl.id; fl.fall = false;
    // the place on side 1's half farthest from the middle with a jump or a drop out of it
    var best = null; nav.nodes.forEach(function(n){ var cx = (n.x0 + n.x1)/2; if(cx < mid + 300 || n.x1 - n.x0 < 60) return; if(!n.edges.some(ctfStatCheckable)) return; if(!best || cx > (best.x0 + best.x1)/2) best = n; });
    f.x = (best.x0 + best.x1)/2; f.y = best.y - f.r; f.vx = 0; f.vy = 0; f.onground = true; f.jumps = 2; f.invuln = 99999;
    f._ai = f._ai || {}; ctfAiResetMove(f._ai); f._ai.ban = {}; f._ai.lastNode = best.id;
    globalThis.__f = f; globalThis.__home = ctfAiHomeGoal(f, nav, L.map);
    return 'ok';
  })()`);
  expect(ok).toBe('ok');
  return w;
}

describe('the stat check on the CPU routes', () => {
  it('is never a CPU\'s last way: with every move it could take turned down, the carrier still plans its way home, past the check', () => {
    const w = setup(31);
    const r = JSON.parse(w.eval(`(function(){
      var f = __f, nav = CTF.nav, sig = ctfStatSig(f), ai = f._ai, now = CTF.live.t;
      var p1 = ctfAiPlan(f, ai, __home.x, __home.y, now), off1 = !!ai.csOff, checked1 = (ai.path || []).filter(ctfStatCheckable).length;
      nav.nodes.forEach(function(n){ n.edges.forEach(function(e){ if(ctfStatCheckable(e)){ e.cs = e.cs || {}; e.cs[sig] = 0; } }); });   // as if the check had turned every jump and drop down
      ctfAiResetMove(ai);
      var p2 = ctfAiPlan(f, ai, __home.x, __home.y, now), path = ai.path || [], off2 = !!ai.csOff;
      // and it is not checked again on the way: the first jump or drop of that path is taken, not skipped
      CTF.stat = {}; var k = path.findIndex(ctfStatCheckable), skipped = 0;
      if(k >= 0){ ai.pi = k; ai.edge = null; var e = path[k], n = nav.nodes[e.from]; f.x = Math.min(Math.max(e.xa, n.x0 + 6), n.x1 - 6); f.y = n.y - f.r; f.onground = true; f.vx = 0; f.vy = 0;
        ctfAiFollow(f, ai, nav, ctfAiInpNew(), now); skipped = CTF.stat.statSkip || 0; }
      return JSON.stringify({ sig:sig, p1:p1, off1:off1, checked1:checked1, p2:p2, off2:off2, len2:path.length, checked2:path.filter(ctfStatCheckable).length, skipped:skipped, edge:!!ai.edge });
    })()`));
    expect(r.sig, 'a fighter with its own stats has a stat set').not.toBe('');
    expect(r.p1, 'a way home').toBe(true);
    expect(r.off1, 'planned with the check').toBe(false);
    expect(r.checked1, 'the way home has jumps or drops (or the test proves nothing)').toBeGreaterThan(0);
    expect(r.p2, 'still a way home with all of them turned down').toBe(true);
    expect(r.off2, 'planned past the check').toBe(true);
    expect(r.checked2).toBeGreaterThan(0);
    expect(r.skipped, 'a move on that path is not turned down again').toBe(0);
    expect(r.edge, 'it takes the move').toBe(true);
  });

  it('leaves no carrier without a way home: from every place on the far half with a way home, there is still one with every jump and drop turned down', () => {
    const w = setup(33);
    const r = JSON.parse(w.eval(`(function(){
      var f = __f, nav = CTF.nav, ai = f._ai, now = CTF.live.t, mid = CTF.live.map.WW/2, mine = f.st, one = { run:1, air:1, jump:1, fall:1, dmg:1 }, sig = ctfStatSig(f);
      nav.nodes.forEach(function(n){ n.edges.forEach(function(e){ if(ctfStatCheckable(e)){ e.cs = e.cs || {}; e.cs[sig] = 0; } }); });
      var places = 0, home = 0, lost = [];
      nav.nodes.forEach(function(n){
        if((n.x0 + n.x1)/2 < mid + 100 || n.x1 - n.x0 < 30) return;
        places++;
        var at = function(st){ f.st = st; f.x = (n.x0 + n.x1)/2; f.y = n.y - f.r; f.vx = 0; f.vy = 0; f.onground = true; ctfAiResetMove(ai); ai.ban = {}; ai.lastNode = n.id; return ctfAiPlan(f, ai, __home.x, __home.y, now) === true; };
        var a = at(one), b = at(mine);
        if(a) home++; if(a && !b) lost.push(n.id);
      });
      f.st = mine;
      return JSON.stringify({ places:places, home:home, lost:lost });
    })()`));
    expect(r.places, 'places on the far half').toBeGreaterThan(20);
    expect(r.home, 'most of them have a way home (or the test proves nothing)').toBeGreaterThan(r.places/2);
    expect(r.lost, 'places that lost their way home to the check').toEqual([]);
  });

  it('never holds a frame: the path\'s moves are queued, a step works through a few flights of them, and every one gets its verdict', () => {
    const w = setup(32);
    const r = JSON.parse(w.eval(`(function(){
      var f = __f, nav = CTF.nav, sig = ctfStatSig(f), ai = f._ai, now = CTF.live.t;
      nav.nodes.forEach(function(n){ n.edges.forEach(function(e){ delete e.cs; delete e.csq; }); }); nav.statQ = [];
      ctfAiPlan(f, ai, __home.x, __home.y, now);
      var asked = (ai.path || []).filter(ctfStatCheckable), queued = nav.statQ.length;
      var pf = ctfAiPlanFly, flights = 0; ctfAiPlanFly = function(){ flights++; return pf.apply(this, arguments); };
      var most = 0, ticks = 0;
      while(nav.statQ.length && ticks < 20000){ flights = 0; ctfNavStatTick(nav); ticks++; if(flights > most) most = flights; }
      ctfAiPlanFly = pf;
      var settled = asked.filter(function(e){ return e.cs && (e.cs[sig] === 0 || e.cs[sig] === 1); }).length;
      // a move with no verdict yet: true at once (the CPU tries it), and its check goes to the head of the queue
      var e2 = null; nav.nodes.some(function(n){ return n.edges.some(function(e){ if(ctfStatCheckable(e) && !(e.cs && e.cs[sig] !== undefined)){ e2 = e; return true; } return false; }); });
      nav.statQ.push({ e:{ cs:{} }, sig:'x', Q:nav.statQ });
      var t0 = flights = 0; ctfAiPlanFly = function(){ flights++; return pf.apply(this, arguments); };
      var v = ctfNavStatOK(nav, e2, f, sig); ctfAiPlanFly = pf;
      return JSON.stringify({ asked:asked.length, queued:queued, most:most, slices:CTF_STAT_SLICES, ticks:ticks, settled:settled, left:nav.statQ.length, unknownOK:v, flightsNow:flights, head:nav.statQ[0].e === e2 });
    })()`));
    expect(r.asked, 'the way home has jumps or drops').toBeGreaterThan(0);
    expect(r.queued, 'each asked for as the path is planned').toBe(r.asked);
    expect(r.most, 'flights in one step').toBeLessThanOrEqual(r.slices);
    expect(r.settled, 'every move of the path has its verdict').toBe(r.asked);
    expect(r.unknownOK, 'not looked at yet: the CPU tries it').toBe(true);
    expect(r.flightsNow, 'and nothing is flown then and there').toBe(0);
    expect(r.head, 'its check is next').toBe(true);
  });
});
