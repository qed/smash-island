import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// STRATEGY SETTINGS for a Flag Cup team (the owner, 2026-10-16: "add strategy settings"): the strategist (auto), the owner's own plan all match (fixed), or the owner's plan to begin with and then the strategist
// may switch (adapt). The plan is the planning menu's parts (a preset, ticks, a role for each seat) and goes to the CPUs through the menu's own vote, so only the ticked ideas run.

const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
const key = (w, code) => w.dispatchEvent(new w.KeyboardEvent('keydown', { code, bubbles: true, cancelable: true }));
const logic = (w, n) => w.eval(`(function(){ for (var i=0;i<${n};i++){ ctfStep(); ctfCheckWin(); } })()`);
const start = (w, strat) => {
  w.eval(`CTFCUP = ctfCupClean(${JSON.stringify({ teams:4, size:3, map:'castle', strat })}); ctfCupStart(); watchFixture(TOURNEY.fixtures[0]);`);
  w.eval(`var g = 0; while(CTF.nav && !CTF.nav.ready && g++ < 600) ctfNavTick(CTF.nav, 400, 40);`);
  w.eval('ctfEndHide(CTF.live)');
};
const OWN = { mode:'fixed', preset:null, ticks:{ scout:true, zone:true }, off:{}, assign:{ 0:'def', 1:'att' } };

describe('the strategy setting of a Flag Cup team', () => {
  it('is kept clean (bad entries dropped) and survives a reload of the setup', () => {
    const { window: w } = loadMonolith(71);
    w.eval(`CTFCUP = ctfCupClean({ teams:4, size:3, strat:[{ mode:'fixed', preset:'turtle', ticks:{ scout:true, nope:false }, off:{ zone:true }, assign:{ 0:'def', 1:'bogus', 9:'att' } }, { mode:'weird' }] });`);
    const s = J(w, 'CTFCUP.strat');
    expect(s[0]).toEqual({ mode:'fixed', preset:'turtle', ticks:{ scout:true }, off:{ zone:true }, assign:{ 0:'def' } });
    expect(s[1].mode, 'an unknown mode is auto').toBe('auto'); expect(s.length).toBe(4);
    w.eval('ctfCupSave(); CTFCUP = ctfCupClean(null); CTFCUP_LOADED = false; ctfCupEnsure();');
    expect(J(w, 'CTFCUP.strat[0]')).toEqual(s[0]);
  });

  it('the editor is the planning menu\'s lists from the keyboard: Space picks a preset and ticks, the arrows move, the roles step, C clears, Esc closes', () => {
    const { window: w } = loadMonolith(72);
    w.eval(`CTFCUP = ctfCupClean({ teams:4, size:3 }); go('ctfCupTeams'); CTFCUP.strat[0].mode = 'fixed'; ctfCupTeamsRender(); ctfCupPlanOpen(0);`);
    expect(w.eval('!!CTFCUP_PLAN')).toBe(true);
    expect(J(w, 'ctfCupPlanRows(0, 0).map(function(r){ return r.id; })'), 'the presets of the menu').toEqual(J(w, 'Object.keys(CTF_PRESETS)'));
    expect(J(w, 'ctfCupPlanRows(0, 2).map(function(r){ return r.id; })'), 'the menu\'s offence list').toEqual(J(w, 'CTF_OFFENCE'));
    expect(w.eval('ctfCupPlanRows(0, 0)[0].desc.length'), 'with the menu\'s words').toBeGreaterThan(10);
    key(w, 'Space'); expect(w.eval('CTFCUP.strat[0].preset'), 'the first preset').toBe(J(w, 'Object.keys(CTF_PRESETS)')[0]);
    key(w, 'ArrowRight'); key(w, 'ArrowRight'); key(w, 'Space');   // the offence tab, its first idea
    expect(J(w, 'CTFCUP.strat[0].ticks')).toEqual({ [J(w, 'CTF_OFFENCE')[0]]: true });
    key(w, 'ArrowRight'); key(w, 'ArrowRight'); key(w, 'Space');   // the roles tab, the first seat steps from auto
    expect(J(w, 'CTFCUP.strat[0].assign')).toEqual({ 0:'waller' });
    key(w, 'KeyC'); expect(J(w, 'CTFCUP.strat[0]')).toEqual({ mode:'fixed', preset:null, ticks:{}, off:{}, assign:{} });
    key(w, 'Escape'); expect(w.eval('CTFCUP_PLAN')).toBe(null);
    expect(w.eval('ctfCupPlanText(0)')).toContain('no preset');
  });

  it('a fixed plan: the CPUs run only the ticked ideas, with the roles given, and the strategist leaves it alone; the other team still has its strategist', () => {
    const { window: w } = loadMonolith(73);
    start(w, [OWN]);
    const ss = J(w, 'CTF.strat[0]');
    expect(ss.plan).toBe('custom'); expect(ss.locked).toBe(true);
    const plan = () => J(w, '({ allow:CTF.live.plans[0].allow, ticks:CTF.live.plans[0].ticks, assign:CTF.live.plans[0].assign, preset:CTF.live.plans[0].preset })');
    const before = plan();
    expect(Object.keys(before.allow).sort(), 'only what was ticked').toEqual(['scout', 'zone']);
    expect(w.eval(`ctfPlanOk(CTF.live.plans[0], 'scout')`)).toBe(true);
    expect(w.eval(`ctfPlanOk(CTF.live.plans[0], 'swarm')`), 'an idea nobody ticked does not run').toBe(false);
    expect(before.assign, 'a role for the fighter in each seat').toEqual({ 0:'def', 1:'att' });
    logic(w, 3600);
    expect(plan(), 'ten seconds, thirty seconds, a minute: the plan is the same').toEqual(before);
    expect(w.eval('CTF.strat[0].plan')).toBe('custom');
    expect(J(w, 'fighters.slice(0, 2).map(function(f){ return f._ai.role; })')).toEqual(['def', 'att']);
    expect(w.eval('CTF.live.plans[0].tags && Object.keys(CTF.live.plans[0].run || {}).filter(function(k){ return CTF.live.plans[0].run[k]; }).every(function(k){ return k === "scout" || k === "zone"; })'), 'no other offence play runs').toBe(true);
    expect(J(w, 'CTF.strat[1].plan in CTF_STRATS'), 'the other team has a strategist').toBe(true);
    expect(w.eval('CTF.live.plans[1].allow')).toBe(null);
    const rows = J(w, 'ctfSpecPlanLines(CTF.live, 0)');
    expect(rows[0][1]).toContain('Own plan'); expect(rows.find(r => r[0] === 'Mode')[1]).toContain('strategist off');
    w.eval('updateCamera(); draw(); CTF.spec.panel = 2; draw()');
  }, 120000);

  it('fixed, then adapt: the owner\'s plan to begin with; the strategist is on and, when it switches, the owner\'s plan is let go of', () => {
    const { window: w } = loadMonolith(74);
    start(w, [Object.assign({}, OWN, { mode:'adapt' })]);
    expect(w.eval('CTF.strat[0].plan')).toBe('custom'); expect(w.eval('CTF.strat[0].locked')).toBe(false);
    expect(Object.keys(J(w, 'CTF.live.plans[0].allow')).sort()).toEqual(['scout', 'zone']);
    expect(J(w, 'ctfSpecPlanLines(CTF.live, 0).find(function(r){ return r[0] === "Mode"; })[1]')).toContain('may switch');
    logic(w, 1900);
    w.eval('var ss = CTF.strat[0]; ss.swapT = -9999; ss.oppRaid = 0.05; ctfStratReeval(CTF.live, ss, 0, { need:3, known:0, kf:0, jailMine:0, up:3 });');   // (a look from the state of the match: it runs with the owner\'s plan as the one to beat)
    const o = w.eval('CTF.strat[0].odds'); expect(o >= 0 && o <= 1).toBe(true);
    w.eval(`ctfStratApply(CTF.live, 0, 'turtle')`);   // the switch itself
    expect(w.eval('CTF.live.plans[0].allow'), 'the owner\'s permission list is gone').toBe(null);
    expect(J(w, 'CTF.live.plans[0].assign')).toEqual({});
    expect(w.eval('CTF.strat[0].plan')).toBe('turtle'); expect(w.eval('CTF.strat[0].model')).toBe(null);
  }, 120000);

  it('a skipped fixture uses the fixed plans too', () => {
    const { window: w } = loadMonolith(75);
    const turtle = { mode:'fixed', preset:'turtle', ticks:{}, off:{}, assign:{ 0:'def', 1:'def', 2:'def' } };
    w.eval(`CTFCUP = ctfCupClean(${JSON.stringify({ teams:4, size:3, map:'castle', strat:[turtle, Object.assign({}, turtle, { mode:'adapt' }), null, null] })}); ctfCupStart(); simRestOfRound();`);
    const done = J(w, 'TOURNEY.teams.map(function(t){ return t.P; })'); expect(done.every(p => p === 1)).toBe(true);
    const rec = J(w, 'ctfStratMemo(TOURNEY.teams[0])');
    expect(Object.keys(rec.all), 'the fixed turtle is learned as a turtle').toEqual(['turtle']);
    expect(Object.keys(J(w, 'ctfStratMemo(TOURNEY.teams[1])').all)[0]).toBe('turtle');
  }, 120000);

  it('the plan was written down on the fixture: a fixed plan is named as the owner\'s, an adapting one says what it can become', () => {
    const { window: w } = loadMonolith(76);
    const turtle = { mode:'fixed', preset:'turtle', ticks:{ scout:true }, off:{}, assign:{} };
    w.eval(`CTFCUP = ctfCupClean(${JSON.stringify({ teams:4, size:3, map:'castle', strat:[turtle, Object.assign({}, turtle, { mode:'adapt' })] })}); ctfCupStart(); var f0 = TOURNEY.fixtures[0]; ctfCupSimFixture(f0);`);
    const p = J(w, 'TOURNEY.fixtures[0].plans');
    expect(p[0].fixed).toBe(true); expect(p[0].name).toContain('Own plan: Turtle');
    expect(p[1].fixed).toBe(true); expect(p[1].name, 'it can become the strategist\'s').toContain(' > ');
  }, 120000);
});
