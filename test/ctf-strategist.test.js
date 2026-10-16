import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// THE FLAG CUP'S STRATEGISTS (the owner, 2026-10-16: "the ais discuss strats among themselves to make it AS HARD AS POSSIBLE for the enemies to win, even if that means no defense, just rush, go back, and
// wait on de until it shows where the flags are"). Each team settles the plan most likely to beat this opponent on this map, extreme plans included, and learns as the cup goes on.

const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
const cup = (w, o) => w.eval(`CTFCUP = ctfCupClean(${JSON.stringify(o)}); ctfCupStart();`);
const logic = (w, n) => w.eval(`(function(){ for (var i=0;i<${n};i++){ ctfStep(); ctfCheckWin(); } })()`);
const roles = (w, t) => J(w, `fighters.filter(function(f){ return f.team===${t}; }).map(function(f){ return f._ai.role; })`);
const watch = (w, plans, o = {}) => {
  cup(w, Object.assign({ teams:4, size:3, map:'castle' }, o));
  w.eval('watchFixture(TOURNEY.fixtures[0])');
  w.eval(`var g = 0; while(CTF.nav && !CTF.nav.ready && g++ < 600) ctfNavTick(CTF.nav, 400, 40);`);   // (the map's graph is ready before play: the plans deal their jobs from it)
  w.eval(`CTF.stratFixed = true; ctfStratApply(CTF.live, 0, '${plans[0]}'); ctfStratApply(CTF.live, 1, '${plans[1]}'); ctfEndHide(CTF.live);`);
};

describe('the strategist: the plans', () => {
  it('the extreme plans are there: an all-out rush with nobody home, a rush that falls back and waits for a flag to show, a full turtle', () => {
    const { window: w } = loadMonolith(51);
    const S = J(w, 'CTF_STRATS');
    expect(S.rush.ov).toBe('att'); expect(S.rush.off).toBe(1);
    expect(S.rushback.ov).toBe('phase');
    expect(S.turtle.ov).toBe('def'); expect(S.turtle.off).toBe(0);
    expect(Object.keys(S).length, 'and more besides: the plan menu\'s presets, and the CPUs\' own judgement').toBeGreaterThanOrEqual(8);
    for (const id of Object.keys(S)) if (S[id].preset) expect(w.eval(`!!CTF_PRESETS['${S[id].preset}']`), id + ' names a real preset').toBe(true);
  });

  it('in a match: the rush sends everyone (no defender), the turtle keeps everyone home', () => {
    const { window: w } = loadMonolith(52);
    watch(w, ['rush', 'turtle']);
    logic(w, 400);
    expect(roles(w, 0).every(r => r === 'att'), 'every CPU of the rushing side attacks').toBe(true);
    expect(roles(w, 1).every(r => r === 'def'), 'every CPU of the turtle defends').toBe(true);
    expect(J(w, 'ctfSpecPlanLines(CTF.live, 0)[0]'), 'the panel names the plan').toEqual(['Plan', 'All-out rush']);
  }, 120000);

  it('the rush that falls back: all attack, then all defend, then strike once a flag has shown (a seen flag is known to the team)', () => {
    const { window: w } = loadMonolith(53);
    watch(w, ['rushback', 'balanced']);
    logic(w, 300); expect(roles(w, 0).every(r => r === 'att') && w.eval('CTF.strat[0].phase') === 'rush').toBe(true);
    logic(w, 2300);   // 2600 steps: the rush is over
    expect(w.eval('CTF.strat[0].phase'), 'fell back').toBe('back');
    logic(w, 120); expect(roles(w, 0).every(r => r === 'def'), 'everyone home, nobody out').toBe(true);
    logic(w, 900); expect(w.eval('CTF.strat[0].phase'), 'no flag has shown: it waits').toBe('back');
    // a flag shows itself (the other side's flag seen): the strike
    w.eval(`(function(){ var L = CTF.live, fl = L.flags.find(function(f){ return f.team === 1 && f.st === 1; }); L.seen[0][fl.id] = true; })()`);
    logic(w, 130);
    expect(w.eval('CTF.strat[0].phase'), 'a flag is known: strike').toBe('strike');
    logic(w, 70); expect(roles(w, 0).every(r => r === 'att'), 'everyone goes').toBe(true);
    expect(w.eval('CTF.strat[0].last')).toContain('strikes');
  }, 120000);

  it('the radar counts as a flag shown: after three minutes without a capture the waiting side strikes', () => {
    const { window: w } = loadMonolith(54);
    watch(w, ['rushback', 'turtle']);
    logic(w, 3200); expect(w.eval('CTF.strat[0].phase'), 'fallen back, nothing known').toBe('back');
    w.eval('CTF.live.radar = 200; CTF.live.flags.forEach(function(fl){ if(fl.st === 1) fl._radarT = CTF.live.playT; })');   // (what the radar ping does)
    logic(w, 300); expect(w.eval('CTF.strat[0].phase'), 'the radar showed the flags').toBe('strike');
  }, 120000);
});

describe('the strategist: choosing, remembering, adapting', () => {
  it('the model: a side with the better fighters wins more; mirror sides are even; every plan has an odds and none is a sure thing', () => {
    const { window: w } = loadMonolith(55);
    cup(w, { teams:4, size:5, map:'castle' });
    const r = J(w, `(function(){ var fx = TOURNEY.fixtures[0], Mp = ctfStratMap('castle', null), T = ctfStratPair(fx.a, fx.b, Mp), R = Math.random, bal = Object.assign({ id:'balanced' }, CTF_STRATS.balanced);
      var mirror = ctfFluidP([T[0], T[0]], Mp, bal, bal, null, 24, 400, R);
      var strong = JSON.parse(JSON.stringify(T[0])), weak = JSON.parse(JSON.stringify(T[0])); strong.raid *= 1.3; strong.guard *= 1.3; weak.raid *= 0.8; weak.guard *= 0.8;
      var edge = ctfFluidP([strong, weak], Mp, bal, bal, null, 24, 400, R);
      var turtle = ctfFluidP([T[0], T[0]], Mp, Object.assign({ id:'turtle' }, CTF_STRATS.turtle), bal, null, 24, 300, R);
      return { mirror:mirror, edge:edge, turtleVsBalanced:turtle }; })()`);
    expect(Math.abs(r.mirror - 0.5), 'mirror sides, mirror plans').toBeLessThan(0.1);
    expect(r.edge, 'the stronger side wins more').toBeGreaterThan(0.7);
    expect(r.turtleVsBalanced, 'a turtle that never leaves home cannot win against equals who go out').toBeLessThan(0.4);
  });

  it('what the opponent has been seen to play shapes the belief about it; what a plan did against it shapes the plan\'s value', () => {
    const { window: w } = loadMonolith(56);
    cup(w, { teams:4, size:3, map:'castle' });
    const a = w.eval('TOURNEY.fixtures[0].a.id'), b = w.eval('TOURNEY.fixtures[0].b.id');
    const before = J(w, `(function(){ var fx = TOURNEY.fixtures[0], ch = ctfStratChoose(fx, 'castle', null, 28800); return { belief:ch.res[0].belief.turtle, w:ch.W.rush.turtle, pick:ch.res[0].id }; })()`);
    // the opponent (team b) played the turtle against team a four times
    w.eval(`(function(){ var fx = TOURNEY.fixtures[0]; for(var i=0;i<4;i++){ fx.plans = [{ id:'balanced' }, { id:'turtle' }]; fx.map = 'castle'; ctfStratLearn(fx, { win:0, real:true }); } })()`);
    const after = J(w, `(function(){ var fx = TOURNEY.fixtures[0], ch = ctfStratChoose(fx, 'castle', null, 28800); return { belief:ch.res[0].belief.turtle, pick:ch.res[0].id }; })()`);
    expect(after.belief, 'turtle is now what team a expects of team b').toBeGreaterThan(before.belief + 0.1);
    // and the memory: balanced won four times against b, so for a its value against b is pulled up (and lost four times, down)
    const val = (win) => { const { window: v } = loadMonolith(57); cup(v, { teams:4, size:3, map:'castle' }); return J(v, `(function(){ var fx = TOURNEY.fixtures[0]; for(var i=0;i<4;i++){ fx.plans = [{ id:'twowaves' }, { id:'balanced' }]; fx.map = 'castle'; ctfStratLearn(fx, { win:${win}, real:true }); }
      var T = ctfStratPair(fx.a, fx.b, ctfStratMap('castle', null)); var ch = ctfStratChoose(fx, 'castle', null, 28800); return ch.res[0].all.twowaves; })()`); };
    expect(val(0), 'four wins with a plan against this opponent raise it').toBeGreaterThan(val(1));
  }, 120000);

  it('a fixture nobody watches is decided by the same strategists: plans recorded, the result learned from at a lower weight than a watched one', () => {
    const { window: w } = loadMonolith(58);
    cup(w, { teams:4, size:3, map:'castle' });
    w.eval('simRestOfRound()');
    const fx = J(w, 'TOURNEY.bracket.length ? TOURNEY.bracket[0][0] : TOURNEY.fixtures[0]');
    const first = J(w, 'TOURNEY.teams.map(function(t){ return t.P; })');
    expect(first.every(p => p === 1)).toBe(true);
    const mem = J(w, 'TOURNEY.ctf.memo');
    const seen = Object.keys(mem).map(k => Object.keys(mem[k].all).map(p => mem[k].all[p].n)).flat();
    expect(seen.length).toBeGreaterThan(0); expect(seen.every(n => Math.abs(n - 0.35) < 1e-9), 'a simulated fixture counts 0.35').toBe(true);
    w.eval('watchFixture(TOURNEY.fixtures[0])');
    expect(J(w, 'TOURNEY.fixtures[0].plans.length')).toBe(2);
    expect(w.eval('!!CTF.strat'), 'a watched fixture has its strategists').toBe(true);
  }, 120000);

  it('in a match the strategist looks again from the state of the match (from what its side has seen) and may change plan; its odds stay a chance', () => {
    const { window: w } = loadMonolith(59);
    watch(w, ['rush', 'turtle']);
    logic(w, 2400);
    w.eval('CTF.stratFixed = false; var ss = CTF.strat[0]; ss.swapT = -9999; ss.oppRaid = 0.03; ctfStratReeval(CTF.live, ss, 0, { need:3, known:0, kf:0, jailMine:0, up:3 });');
    const o = w.eval('CTF.strat[0].odds'); expect(o >= 0 && o <= 1).toBe(true);
    expect(J(w, 'CTF.strat[0].plan in CTF_STRATS')).toBe(true);
    // behind badly, with a third of the side in jail and the foe at its own flags: the look runs and the plan is still a plan
    w.eval('var s1 = CTF.strat[1]; s1.swapT = -9999; s1.oppRaid = 0.9; ctfStratReeval(CTF.live, s1, 1, { need:3, known:0, kf:0, jailMine:1, up:2 });');
    expect(J(w, 'CTF.strat[1].plan in CTF_STRATS')).toBe(true);
  }, 120000);

  it('the discussion is in the spectator panel: each member says what they would play, then the team settles; later, the last change', () => {
    const { window: w } = loadMonolith(60);
    cup(w, { teams:4, size:3, map:'castle' });
    w.eval('watchFixture(TOURNEY.fixtures[0])');
    for (let i = 0; i < 400; i++) w.eval('step()');
    const rows = J(w, 'ctfSpecPlanLines(CTF.live, 0)');
    const talk = rows.filter(r => r[0] === 'Talk').map(r => r[1]);
    expect(talk.length, 'two lines of the discussion show').toBeGreaterThan(0);
    expect(talk.join(' ')).toMatch(/Settled on|:/);
    expect(rows.find(r => r[0] === 'Odds')[1]).toMatch(/% to win/);
    w.eval('updateCamera(); draw(); CTF.spec.panel = 2; draw()');
  }, 120000);
});
