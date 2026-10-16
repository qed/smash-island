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
    w.eval(`CTF.menu.tab = 1; CTF.menu.cur = ctfMenuRows().findIndex(function(r){ return r.id === '${pbuild}'; });`);   // (a row that is in the plan is followed by its job slots, so the rows are looked up by name)
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

  // THE "MUST BE POSSIBLE" CHECK (the owner, 2026-10-16: "the flagger is flagging 1-area gap setups which are possible by all fighters"; "i had made a setup with 2 entrances from the top that would drop people into stunpads, that got removed
  // and made open-air"). The graph has to agree with the physics: a one-row climb or a one-piece gap is made from a narrow window of takeoff spots, and a room with holes in its roof is entered by dropping through them.
  const arena = (w, extra) => w.eval(`(function(){ var M = CTF.map, fl = { x:0, y:2160, w:4800, h:240, solid:true }, Yf = 2160;
    var B = function(x, y){ return { x:x, y:y, w:120, h:120, solid:true, hop:false }; }, W = function(x, y){ return { x:x, y:y, w:60, h:240, solid:true, hop:false }; }, P = function(x, y){ return { x:x, y:y, w:180, h:16, solid:false, hop:true }; };
    var pieces = (${extra})(B, W, P, Yf);
    var nav = ctfNavNew(Object.assign({}, M, { plats:[fl].concat(pieces) }), null, []);   /* (a patched graph: the fine probe) */ while(!nav.ready) ctfNavTick(nav, 80);
    var left = ctfNavNodeAt(nav, 1000, Yf, 6), at = function(x, y){ var n = ctfNavNodeAt(nav, x, y, 6); return n && ctfNavPath(nav, left.id, n.id, { doorOK:function(){ return true; }, now:0 }) ? true : false; };
    return { nav:nav, at:at }; })()`);
  it('the graph agrees with the physics on one-piece gaps and one-row climbs: setups that were missed because the takeoff spots were sampled too coarsely are reachable', { timeout:150000 }, () => {
    const { window: w } = loadMonolith(77);
    w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.skipNav=true; CTF.forceMap='castle'; beginMatchNow();`);
    // three random setups the old probe missed: a block top reached from the floor by a run and a double jump from a 30-pixel window; a plat one row up and 38 px off the end of a block; a wall top reached from a plat
    const cases = [
      ['(B, W, P, Y)=>[B(2280, Y-120), B(2400, Y-360), P(2460, Y-420), P(2430, Y-120), P(2490, Y-180), W(2880, Y-240), B(2640, Y-360), W(2940, Y-600), W(2160, Y-360)]', 2340, 2040],
      ['(B, W, P, Y)=>[P(2550, Y-480), B(2400, Y-360), B(2520, Y-120), P(2490, Y-180), B(3000, Y-120), P(2100, Y-240), P(2280, Y-120)]', 2640, 1680],
      ['(B, W, P, Y)=>[W(2220, Y-480), W(2820, Y-480), W(2460, Y-600), P(2490, Y-300), P(2310, Y-180), P(2160, Y-60), P(2520, Y-120)]', 2250, 1680]];
    for (const [pc, x, y] of cases) { const a = arena(w, pc); expect(a.at(x, y), 'reachable: ' + pc.slice(0, 40)).toBe(true); }
  });

  it('a room with two holes in its roof is a way in (you drop through onto the stun pads), a roof with no hole is not, and stun pads are never walls', { timeout:150000 }, () => {
    const { window: w } = loadMonolith(78);
    w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.skipNav=true; CTF.forceMap='castle'; beginMatchNow();`);
    // floor at 2160; stairs up to the roof (two plats, a row each); walls 2400 and 2940; a roof of blocks at 1800 with holes of one piece (120) or none
    const room = (holes) => `(B, W, P, Y)=>[P(1980, Y-120), P(2160, Y-240), W(2400, Y-240), W(2940, Y-240), ${holes ? 'B(2400, Y-360), B(2640, Y-360), B(2880, Y-360)' : 'B(2400, Y-360), B(2520, Y-360), B(2640, Y-360), B(2760, Y-360), B(2880, Y-360)'}]`;
    expect(arena(w, room(true)).at(2700, 2160), 'the room with two roof holes can be entered').toBe(true);
    expect(arena(w, room(false)).at(2700, 2160), 'the room with a solid roof cannot').toBe(false);
    // the check's own list of pieces never holds a trap: only walls, platforms and trapdoors count
    expect(w.eval(`['spikes', 'stun', 'spring'].some(function(k){ return ctfEditStructural({ tool:'trap', kind:k }); })`), 'a trap is not a wall').toBe(false);
  });

  it.each([['factory', 5580, 3240], ['oak', 7080, 7560]])('(%s: the floor, and the mill under the map) when the check must take something away it takes only the piece that seals, not everything placed after it', { timeout:300000 }, (map, X0, Y0) => {
    const { window: w } = loadMonolith(79);
    w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.forceMap='${map}'; beginMatchNow(); fighters.forEach(function(f){ f.controller='ai'; f.you=false; });`);
    for (let i = 0; i < 4000 && w.eval('!(CTF.nav && CTF.nav.ready && CTF.live.phase === "hide")'); i++) { w.eval('step()'); if (i % 50 === 0) w.eval('CTF.nav && !CTF.nav.ready && ctfNavTick(CTF.nav, 200)'); }
    // a sealed room built on the factory's floor (the stairs and walls, then a roof of six blocks with no hole, the pads inside) in the clear space above it
    const r = JSON.parse(w.eval(`JSON.stringify((function(){ var L = CTF.live, M = CTF.map, f = fighters.find(function(q){ return q.team === 0; }); L.pts[f.idx] = 9999; var X = ${X0}, Y = ${Y0};
      M.plats = M.plats.filter(function(q){ return !(q.y < Y - 5 && q.y + q.h > Y - 800 && q.x < X + 900 && q.x + q.w > X - 520); }); ctfRebuildDyn(L);
      var put = function(t, k, x, y){ return ctfEditPlaceAt(f, t, k, x, y); }, n = 0;
      put('plat', 'plat', X - 300, Y - 120); put('plat', 'plat', X - 90, Y - 240); put('wall', 'wall', X + 30, Y + 120 - 240); put('wall', 'wall', X + 540 + 30, Y + 120 - 240);
      for (var k = 0; k < 6; k++) if (put('wall', 'block', X + k*120 + 60, Y - 360 + 60)) n++;
      put('trap', 'stun', X + 180, Y - 10); put('trap', 'stun', X + 420, Y - 10);
      var fl = L.flags.find(function(q){ return q.team === 0; }); ctfPlaceFlag(fl, X + 300, Y);
      var before = L.edits.filter(function(e){ return ctfEditStructural(e); }).length;
      ctfFixBegin(L); var g = 0; while (L.fix && g++ < 60000) ctfFixStep(L);
      return { roof:n, before:before, removed:L.removedByFix || 0, left:L.edits.filter(function(e){ return ctfEditStructural(e); }).length }; })())`));
    expect(r.roof, 'the six roof blocks went down').toBe(6);
    expect(r.removed, 'the sealed room lost the piece that sealed it').toBeGreaterThanOrEqual(1);
    expect(r.removed, 'and only that piece (a stripped room, "open-air", was the bug)').toBeLessThanOrEqual(2);
    expect(r.left, 'the rest of the room is still there').toBe(r.before - r.removed);
  });

  // JOBS AND AREAS (the owner, 2026-10-16: "select someone for that job"; "assign ppl areas"): a human picks which CPU fills a ticked idea's job slot and sends a CPU to an area (guard it on its own side, search and raid it on the other).
  it('a picked teammate fills its job and goes to its area; picks that name a human, a stranger or an area that does not exist are dropped; a plan made in the bid is kept', () => {
    const { window: w } = loadMonolith(80);
    w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=16; SETTINGS.itemRate=0; CTF.skipNav=true; CTF.forceMap='castle'; beginMatchNow(); fighters[0].controller='local'; fighters[2].controller='remote';`);
    w.eval(`ctfPlanBegin(CTF.live)`);
    const cpus = J(w, `fighters.filter(function(f){ return f.team === 0 && !ctfIsHuman(f); }).map(function(f){ return f.idx; })`);
    const [a, b, c, d] = cpus;
    const areas = J(w, `ctfPlanAreas(CTF.live.map).map(function(q){ return { id:q.id, side:q.side, name:q.name, x0:q.x0, x1:q.x1, y0:q.y0, y1:q.y1, room:q.room }; })`);
    const own = areas.find(q => q.side === 0 && !q.room), foe = areas.find(q => q.side === 1 && !q.room);
    expect(areas.length, 'the map is split in areas').toBeGreaterThan(6); expect(areas.every(q => q.name && q.name.length < 24), 'each has a short name').toBe(true);
    expect(new Set(areas.map(q => q.name)).size, 'names are all different').toBe(areas.length);
    w.eval(`ctfPlanVoteIn(CTF.live, 0, 0, { preset:null, ticks:{ scout:true, jailguard:true }, off:{}, assign:{}, jobs:{ 'scout.scout':${a}, 'jailguard.d':${b} }, areas:{ ${c}:'${own.id}', ${d}:'${foe.id}' } });`);
    expect(w.eval(`ctfPlanForcedRole(CTF.live.plans[0], ${a})`), 'a scout job is an attacker').toBe('att');
    expect(w.eval(`ctfPlanForcedRole(CTF.live.plans[0], ${b})`), 'a jail guard job is a defender').toBe('def');
    expect(w.eval(`ctfPlanForcedRole(CTF.live.plans[0], ${c})`), 'an area on its own side: defend').toBe('def');
    expect(w.eval(`ctfPlanForcedRole(CTF.live.plans[0], ${d})`), 'an area on the other side: attack').toBe('att');
    expect(w.eval(`ctfPlanJobDef(CTF.live.plans[0], ${b})`)).toBe('jailguard');
    // the offence job overrules the dealt tags
    w.eval(`fighters[${a}]._ai = fighters[${a}]._ai || {}; fighters[${a}]._ai.role = 'att'; window.__tags = {}; window.__run = {}; ctfPlanApplyJobs(CTF.live, CTF.live.plans[0], { tags:window.__tags, run:window.__run, take:function(){} });`);
    expect(w.eval(`window.__tags[${a}]`), 'the picked teammate is the scout').toBe('scout');
    // the area goal: a point inside the area (its own side: guard; the other side: guard it too until a flag is seen there)
    for (const [idx, ar] of [[c, own], [d, foe]]) {
      const g = J(w, `(function(){ var f = fighters[${idx}], got = null; f._cf = -1; f.dead = false; ctfPlanAreaGoal(f, f._ai || {}, CTF.live, null, 1000, function(x){ got = x; }); return got; })()`);
      expect(g && g.area, 'a goal in area ' + ar.id).toBe(ar.id);
      expect(g.x >= ar.x0 && g.x <= ar.x1 && g.y >= ar.y0 && g.y <= ar.y1, 'inside the area').toBe(true);
    }
    // a guest's vote is checked: a human as the job holder, a teammate of the other side, an area that is not there
    w.eval(`ctfPlanVoteMsg({ idx:2, vote:{ preset:null, ticks:{ scout:true }, off:{}, assign:{}, jobs:{ 'scout.scout':0, 'scout.nothing':${a}, 'nonsense.x':${a} }, areas:{ ${c}:'zzz', 1:'${own.id}' } } });`);
    const v = J(w, `CTF.live.plans[0].votes[2]`);
    expect(Object.keys(v.jobs), 'no job held by a human or in a slot that is not one').toEqual([]); expect(Object.keys(v.areas), 'no area that does not exist, none for the other side').toEqual([]);
    // a plan made in the bid holds only the humans' word (no CPUs yet): when the match begins, the real plan is made and takes that word in
    w.eval(`CTF.live.plans = [0, 1].map(function(t){ return { t:t, cpus:[], votes:{}, ticks:{ zone:true }, allow:{ zone:true }, jobs:{}, areas:{}, assign:{}, preset:null }; }); ctfPlanBegin(CTF.live);`);
    expect(w.eval('CTF.live.plans[0].allow.zone === true && CTF.live.plans[0].cpus.length > 0 && CTF.live.plans[0].begun === true'), 'the word is kept and the plan has its CPUs').toBe(true);
  });

  it('the menu: a ticked idea shows its job slots and Space picks a teammate for one; the Areas tab moves over the map\'s areas and Space sends the chosen teammate there; Left/Right still change the tab', () => {
    const { window: w } = loadMonolith(81);
    w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=16; SETTINGS.itemRate=0; CTF.skipNav=true; CTF.forceMap='castle'; beginMatchNow(); fighters.forEach(function(f){ if(!f.you) f.controller='ai'; }); window.__me = fighters.find(function(f){ return f.you; });`);
    step(w, 5);
    const key = (code) => w.dispatchEvent(new w.KeyboardEvent('keydown', { code, bubbles: true, cancelable: true }));
    key('KeyP'); key('ArrowRight'); key('ArrowRight');   // Preset > Build > Offence
    expect(w.eval('CTF.menu.tab'), 'Left/Right change the tab').toBe(2);
    const before = J(w, 'ctfMenuRows().length');
    key('Space');   // tick the first idea (Scout first)
    const rows = J(w, 'ctfMenuRows()');
    expect(rows.length, 'its job slot appears under it').toBeGreaterThan(before);
    expect(rows[1].kind, 'a job row').toBe('job'); expect(rows[1].whoName, 'empty slots fill by themselves').toBe('auto');
    key('ArrowDown'); key('Space');   // the slot: the first CPU teammate
    const jobs = J(w, 'CTF.live.plans[__me.team].jobs');
    expect(Object.keys(jobs), 'the pick is in the plan').toEqual(['scout.scout']);
    expect(w.eval(`fighters[${jobs['scout.scout']}].team === __me.team && !ctfIsHuman(fighters[${jobs['scout.scout']}])`), 'a CPU teammate').toBe(true);
    for (let k = 0; k < 3; k++) key('ArrowRight');   // Offence > Defence > Roles > Areas
    expect(w.eval('CTF.menu.tab'), 'the Areas tab').toBe(5);
    key('ArrowDown'); key('ArrowDown'); key('Space');
    const areas = J(w, 'CTF.live.plans[__me.team].areas'), ids = Object.keys(areas);
    expect(ids.length, 'a teammate is sent to an area').toBe(1);
    expect(w.eval(`ctfPlanAreas(CTF.live.map)[2].id`), 'the one under the cursor').toBe(areas[ids[0]]);
    key('Space'); expect(Object.keys(J(w, 'CTF.live.plans[__me.team].areas')).length, 'again takes them back').toBe(0);
    key('Escape'); expect(w.eval('ctfMenuOpen()')).toBe(false);
  });

  it('the Flag Cup has its own advanced-rules switch (off by default): a fixture of a cup with it on bargains, one with it off does not', () => {
    const { window: w } = loadMonolith(82);
    expect(w.eval('ctfCupClean(null).adv'), 'off by default').toBe(0);
    expect(w.eval('ctfCupClean({ adv:1 }).adv'), 'remembered when on').toBe(1);
    expect(w.eval(`CTFCUP_ROWS.some(function(r){ return r[0] === 'adv'; })`), 'a row on the setup screen').toBe(true);
    expect(w.eval('ctfAdvOn()'), 'the player\'s own setting is off').toBe(false);
    for (const adv of [1, 0]) {
      w.eval(`CTF.cupFix = { fx:{}, a:0, b:1 }; TOURNEY = { active:true, game:'ctf', ctf:{ cfg:{ adv:${adv} } } };`);
      expect(w.eval('ctfAdvOn()'), 'a cup with advanced rules ' + adv).toBe(adv === 1);
    }
  });
});
