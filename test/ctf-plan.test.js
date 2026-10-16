import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';
import { readFileSync } from 'node:fs';

// THE TEAM PLAN (the owner, 2026-10-15): a CPU side builds and plays as a team with ROLES (waller, corridor builders, trappers, a runner; in play defence tactics and offence plays picked by the situation), and a planning menu
// where the humans of a side tick ideas, give roles and pick presets (the most-ticked become the plan). One invariant that a chosen plan's roles are what the CPUs do, one that votes resolve, one that the roles scale.

const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
const step = (w, n = 1) => { for (let i = 0; i < n; i++) w.eval('step()'); };

describe('the team plan', () => {
  it('roles scale with the size of the side: about one waller, two corridor builders, four trappers and a runner in eight', () => {
    const { window: w } = loadMonolith(71);
    w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=16; SETTINGS.itemRate=0; CTF.skipNav=true; CTF.forceMap='castle'; beginMatchNow();`);
    const counts = (n) => J(w, `(function(){ var pl = { t:0, cpus:fighters.filter(function(f){ return f.team === 0; }).slice(0, ${n}).map(function(f){ return f.idx; }), roles:{}, assign:{} }; ctfPlanAssignBuildRoles(CTF.live, pl);
      var c = { waller:0, corridor:0, trapper:0, runner:0 }; pl.cpus.forEach(function(i){ c[pl.roles[i]]++; }); return c; })()`);
    const c8 = counts(8), c4 = counts(4), c2 = counts(2);
    expect(c8, 'eight a side').toEqual({ waller:1, corridor:2, trapper:4, runner:1 });
    expect(c4.waller + c4.corridor + c4.trapper + c4.runner, 'four a side: everyone has a job').toBe(4);
    expect(c4.trapper, 'trappers are the most').toBeGreaterThanOrEqual(1);
    expect(c2.waller + c2.corridor + c2.trapper + c2.runner, 'two a side').toBe(2);
    expect(c2.runner, 'a pair does not send its builder off to run').toBe(0);
    // the heaviest takes the waller's job (a number from the kit, not a name)
    const heavy = J(w, `(function(){ var pl = { t:0, cpus:fighters.filter(function(f){ return f.team === 0; }).slice(0, 8).map(function(f){ return f.idx; }), roles:{}, assign:{} }; ctfPlanAssignBuildRoles(CTF.live, pl);
      var wl = pl.cpus.find(function(i){ return pl.roles[i] === 'waller'; }), mx = Math.max.apply(null, pl.cpus.map(function(i){ return fighters[i].w || 90; })); return { w:fighters[wl].w || 90, mx:mx }; })()`);
    expect(heavy.w, 'the waller is the heaviest').toBe(heavy.mx);
  });

  it('votes resolve: a tick from at least half of the humans of a side makes the plan, and the latest word on a teammate\'s role stands', () => {
    const { window: w } = loadMonolith(72);
    w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.skipNav=true; CTF.forceMap='castle'; beginMatchNow();
      fighters[0].controller='local'; fighters[2].controller='remote'; fighters[4].controller='remote';`);
    const L = 'CTF.live', cpu = w.eval('fighters[6].idx');
    w.eval(`ctfPlanVoteIn(${L}, 0, 0, { preset:'fortress', ticks:{ zigzag:true, jailbreak:true }, assign:{ ${cpu}:'scout' } });`);
    let pl = J(w, `{ ticks:CTF.live.plans[0].ticks, preset:CTF.live.plans[0].preset, assign:CTF.live.plans[0].assign }`);
    expect(pl.ticks.jailbreak, 'three humans: one tick is not the plan').toBeUndefined();
    w.eval(`ctfPlanVoteIn(${L}, 0, 2, { preset:'fortress', ticks:{ zigzag:true, mark:true }, assign:{ ${cpu}:'def' } });`);
    pl = J(w, `{ ticks:CTF.live.plans[0].ticks, preset:CTF.live.plans[0].preset, assign:CTF.live.plans[0].assign }`);
    expect(pl.ticks.zigzag, 'two of three ticked it').toBe(true);
    expect(pl.ticks.mark || pl.ticks.jailbreak, 'one of three did not').toBeUndefined();
    expect(pl.preset, 'two of three chose the preset').toBe('fortress');
    expect(pl.assign[cpu], 'the latest word on the role').toBe('def');
    // a guest's vote is checked: an unknown idea, a role that does not exist, a teammate that is a human: all dropped
    w.eval(`ctfPlanVoteMsg({ idx:4, vote:{ preset:'nonsense', ticks:{ zigzag:true, hack:true, '__proto__':true }, assign:{ 2:'scout', ${cpu}:'hacker' } } });`);
    const v = J(w, `CTF.live.plans[0].votes[4]`);
    expect(v.ticks.hack, 'an idea that is not one').toBeUndefined(); expect(v.preset).toBeNull(); expect(v.assign[2], 'a human is nobody\'s CPU').toBeUndefined(); expect(v.assign[cpu]).toBeUndefined();
  });

  it('the planning menu opens on P over a match that goes on, the fighter stands while it is open, and what is ticked in it is the plan', () => {
    const { window: w } = loadMonolith(73);
    w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.skipNav=true; CTF.forceMap='castle'; beginMatchNow(); fighters.forEach(function(f){ if(!f.you) f.controller='ai'; }); window.__me = fighters.find(function(f){ return f.you; });`);
    step(w, 5);
    const key = (code) => w.dispatchEvent(new w.KeyboardEvent('keydown', { code, bubbles: true, cancelable: true }));
    expect(w.eval('ctfMenuOpen()'), 'closed at first').toBe(false);
    key('KeyP'); expect(w.eval('ctfMenuOpen()'), 'P opens it').toBe(true);
    expect(w.eval(`CTF_NOINP === ctfFilterInput(__me, { left:true, right:false, jump:false, down:false, up:false, attack:true, special:false, smash:false, flag:false, edit:false })`), 'the fighter stands').toBe(true);
    const t0 = w.eval('CTF.live.t'); step(w, 10); expect(w.eval('CTF.live.t') > t0, 'the match goes on behind it').toBe(true);
    key('Space');   // the first preset row: chosen
    expect(w.eval('CTF.live.plans[__me.team].preset'), 'the preset is the plan').toBe(w.eval('Object.keys(CTF_PRESETS)[0]'));
    expect(w.eval('Object.keys(CTF.live.plans[__me.team].ticks).length'), 'choosing a preset ticks nothing for the human (the owner, 2026-10-16: the boxes show only what he ticked)').toBe(0);
    const pid = w.eval('CTF.menu.vote.preset'), pbuild = w.eval(`CTF_PRESETS['${pid}'].builds[0]`), pplay = w.eval(`CTF_PRESETS['${pid}'].plays[0]`);
    expect(w.eval(`!!CTF.live.plans[__me.team].allow['${pbuild}'] && !!CTF.live.plans[__me.team].allow['${pplay}']`), 'its ideas are in the plan').toBe(true);
    // every row of every tab has a one-line description
    for (let tab = 0; tab < 5; tab++) { w.eval(`CTF.menu.tab = ${tab}; CTF.menu.cur = 0;`); const rows = J(w, 'ctfMenuRows()'); expect(rows.length > 0 || tab === 4, 'tab ' + tab).toBe(true); for (const r of rows) expect(r.desc && r.desc.length > 12, 'tab ' + tab + ' row ' + r.id + ' has a description').toBe(true); }
    w.eval('CTF.menu.tab = 0; CTF.menu.cur = 0;');
    key('ArrowRight'); key('ArrowDown'); key('Space');   // the Build tab, its second row
    const second = w.eval('Object.keys(CTF_BUILDS).filter(function(id){ return id !== "twin"; })[1]');
    expect(w.eval(`!!CTF.live.plans[__me.team].ticks['${second}']`), 'a ticked setup is in the plan').toBe(true);
    // on the Build tab the preset's first setup shows as included (not ticked); a press switches it off, which takes it out of the plan
    w.eval(`CTF.menu.tab = 1; CTF.menu.cur = Object.keys(CTF_BUILDS).filter(function(id){ return id !== "twin"; }).indexOf('${pbuild}');`);
    let prow = J(w, `ctfMenuRows()[CTF.menu.cur]`); expect(prow.pre && !prow.on, 'included by the preset, not the human\'s own tick').toBe(true);
    key('Space'); expect(w.eval(`!!CTF.live.plans[__me.team].allow['${pbuild}']`), 'unticked: out of the plan').toBe(false);
    key('KeyC'); expect(w.eval('Object.keys(CTF.live.plans[__me.team].ticks).length'), 'clear: back to the CPUs\' own judgement').toBe(0);
    expect(w.eval('CTF.live.plans[__me.team].allow'), 'no plan: the CPUs judge for themselves').toBeNull();
    key('Escape'); expect(w.eval('ctfMenuOpen()'), 'Escape closes it').toBe(false);
  });

  it('a CPU side builds as a team and the plan\'s roles are what its CPUs do: assigned jobs are kept, tactics are picked from the plan, and every flag stays reachable', { timeout:150000 }, () => {
    const { window: w } = loadMonolith(74);
    const errs = []; w.console.error = (...a) => { errs.push(a.map(String).join(' ').slice(0, 300)); };
    w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.forceMap='castle'; beginMatchNow(); fighters.forEach(function(f){ f.controller='ai'; f.you=false; });`);
    for (let i = 0; i < 400 && w.eval('!CTF.nav || CTF.live.phase === "bid"'); i++) step(w, 1);
    // the menu's say, given before the hiding ends: team 1's CPU 5 is to defend (jail guard) and CPU 3 to attack as a scout, and the 'jailguard' tactic is ticked
    w.eval(`ctfPlanVoteIn(CTF.live, 1, 1, { preset:null, ticks:{ jailguard:true, zigzag:true }, assign:{ 5:'jailguard', 3:'scout' } });`);
    for (let i = 0; i < 4200 && w.eval('CTF.live.phase !== "play"'); i++) step(w, 1);
    expect(w.eval('CTF.live.phase'), 'the hiding ended').toBe('play');
    const pl = J(w, `CTF.live.plans.map(function(p){ return { built:p.built, log:p.log, roles:p.roles, n:p.cpus.length }; })`);
    for (const p of pl) { expect(p.built, 'each side built').toBe(true); expect(p.log.length, 'with named setups').toBeGreaterThan(0); expect(Object.keys(p.roles).length, 'every CPU has a build role').toBe(p.n); }
    expect(pl[1].log.some(x => x.id === 'zigzag'), 'a ticked setup is run').toBe(true);
    expect(w.eval('CTF.live.edits.length > 3'), 'and they put things down').toBe(true);
    // every flag is still reachable (the end-of-hiding check passed)
    expect(J(w, `ctfEditProblems(CTF.live, CTF.nav).filter(function(b){ return b.indexOf('flag') === 0; })`), 'no flag cut off').toEqual([]);
    // in play: the assigned jobs are kept
    step(w, 400);
    expect(w.eval('fighters[5]._ai.role'), 'CPU 5 defends as told').toBe('def');
    expect(w.eval('fighters[3]._ai.role'), 'CPU 3 attacks as told').toBe('att');
    expect(w.eval('CTF.live.plans[1].defTags[5]'), 'and its tactic is the one it was given').toBe('jailguard');
    expect(w.eval('CTF.live.plans[1].tags[3]'), 'its job is the scout\'s').toBe('scout');
    expect(errs.filter(e => /ctf plan|ctfPlan/.test(e)), 'no errors from the plan').toEqual([]);
  });

  it('a CPU knows its own shots: read out of the game code (the probe table), a straight shot passes platforms and walls, an arcing one stops where it falls, and it throws only at what the shot will reach', () => {
    const { window: w } = loadMonolith(75);
    const table = JSON.parse(readFileSync('artifacts/V1/assets/ctf/proj-info.json', 'utf8'));
    w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.skipNav=true; CTF.forceMap='castle'; beginMatchNow(); CTF_PROJ.table = ${JSON.stringify(table)}; CTF_PROJ.cache = {};`);
    w.eval(`(function(){ var q = ROSTER.find(function(r){ return r.kit && r.kit.special === 'fly'; }), e = ROSTER.find(function(r){ return r.kit && r.kit.special === 'ember'; }); fighters[2].kit = q.kit; fighters[4].kit = e.kit; })()`);
    const straight = J(w, `aiProjInfo(fighters[2])`), arc = J(w, `aiProjInfo(fighters[4])`);
    expect(straight.attack && straight.through, 'Puffball puff goes straight and passes everything').toBe(true);
    expect(arc.arcs && !arc.through, 'Firey ember arcs and stops where it comes down').toBe(true);
    expect(arc.range, 'its reach is worked out from its speed and its arc').toBeGreaterThan(100);
    // the shot works out only for a target it reaches: a straight shot level with the foe, not one a floor above; an arc, not one far past its range
    expect(w.eval(`ctfProjWorks(aiProjInfo(fighters[2]), 1000, 1000, 1, 1000 + 300, 1000)`), 'level and in reach').toBe(true);
    expect(w.eval(`ctfProjWorks(aiProjInfo(fighters[2]), 1000, 1000, 1, 1000 + 300, 1000 - 500)`), 'five hundred up: a straight shot misses').toBe(false);
    expect(w.eval(`ctfProjWorks(aiProjInfo(fighters[4]), 1000, 1000, 1, 1000 + 4000, 1000)`), 'far past the range of an arc').toBe(false);
    // a CPU that can throw, with a foe in its line, throws (turning first); with nothing in reach it does not
    w.eval(`(function(){ var f = fighters[2], g = fighters[3]; f.controller = 'ai'; f.you = false; f._ai = f._ai || { goal:null, ban:{} }; f.face = 1; f.x = 3000; f.y = 1000; f.atkCd = 0; f.spCd = 0; g.team = 1; g.dead = false; g._jail = null; g._room = null; g._hid = false; g._ghostT = 0; g.x = 3300; g.y = 1000; f._ai.volleyT = 0; })()`);
    const inp = J(w, `ctfAiVolley(fighters[2], fighters[2]._ai, CTF.live)`);
    expect(inp && inp.attack, 'throws at the foe in its line').toBe(true);
    w.eval(`fighters[3].x = 9000; fighters[2]._ai.volleyT = 0;`);
    expect(w.eval(`ctfAiVolley(fighters[2], fighters[2]._ai, CTF.live)`), 'nothing in reach: no throw').toBeNull();
  });

  it('with a human plan the CPUs use ONLY the allowed ideas (the ticked ones and the chosen preset\'s), nothing unticked; a kind with nothing in it gets plain basics; no plan means their own judgement', { timeout:120000 }, () => {
    const { window: w } = loadMonolith(76);
    w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=16; SETTINGS.itemRate=0; CTF.skipNav=true; CTF.forceMap='castle'; beginMatchNow(); fighters.forEach(function(f){ f.controller='ai'; f.you=false; });`);
    step(w, 60);
    const L = 'CTF.live', deal = () => { w.eval(`(function(){ var pl = CTF.live.plans[1]; pl.dealt = false; pl.pg = {}; CTF.live.playT = 3000; ctfPlanDeal(CTF.live, pl, CTF.nav || {}); })()`); };
    const used = () => J(w, `(function(){ var pl = CTF.live.plans[1]; return { run:Object.keys(pl.run || {}).filter(function(k){ return pl.run[k]; }), def:Object.keys(pl.defTags || {}).map(function(k){ return pl.defTags[k]; }), off:CTF_OFFENCE.length, allow:pl.allow }; })()`);
    // a plan with one offence idea and one defence idea
    w.eval(`ctfPlanVoteIn(${L}, 1, 1, { preset:null, ticks:{ swarm:true, mark:true }, off:{}, assign:{} });`);
    for (let k = 0; k < 6; k++) { deal(); const u = used(); for (const id of u.run) expect(id, 'offence run: only the ticked').toBe('swarm'); for (const d of u.def) expect(d, 'defence: only the ticked').toBe('mark'); }
    // a plan with offence only: the defenders are plain zone guards, no named tactics
    w.eval(`ctfPlanVoteIn(${L}, 1, 1, { preset:null, ticks:{ scout:true }, off:{}, assign:{} });`);
    for (let k = 0; k < 4; k++) { deal(); const u = used(); for (const d of u.def) expect(d, 'no defence ticked: plain zones').toBe('zone'); for (const id of u.run) expect(id).toBe('scout'); }
    // a preset: its ideas count, one switched off does not; and the jail-line swap and the late turtle (not in it) do not run
    w.eval(`ctfPlanVoteIn(${L}, 1, 1, { preset:'jailbreak', ticks:{}, off:{ twowave:true }, assign:{} });`);
    for (let k = 0; k < 4; k++) { deal(); const u = used(); for (const id of u.run) expect(['jailbreak', 'scout'].indexOf(id) >= 0, 'run ' + id + ' is in the preset').toBe(true); expect(u.allow.twowave, 'switched off').toBeUndefined(); }
    expect(w.eval(`ctfPlanOk(CTF.live.plans[1], 'lateturtle')`), 'a late turtle that was not ticked or in the preset does not run').toBe(false);
    // cleared: the CPUs judge again, anything may run
    w.eval(`ctfPlanVoteIn(${L}, 1, 1, { preset:null, ticks:{}, off:{}, assign:{} });`);
    expect(w.eval('CTF.live.plans[1].allow'), 'no plan').toBeNull(); expect(w.eval(`ctfPlanOk(CTF.live.plans[1], 'lateturtle')`)).toBe(true);
  });
});
