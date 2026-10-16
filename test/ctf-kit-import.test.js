import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadMonolith } from './helpers/load-monolith.js';

// KITS v2 (the owner, 2026-10-16: "everything in an AI's answer", and import from text): a kit also holds jobs, areas, the side bid, the offer policy, build points per fighter, flag spots and IF-THEN rules; the Flag Cup plan editor
// has a tab for each; Load kit can read an AI's whole answer (the challenge's section-5 format) and list what it could not use; the plan reaches the match as pl.kit.

const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
const key = (w, code, target) => (target || w).dispatchEvent(new w.KeyboardEvent('keydown', { code, bubbles: true, cancelable: true, ctrlKey: false }));
const answer = (n) => readFileSync(new URL('./fixtures/ctf-ai-entries/ai' + n + '.md', import.meta.url), 'utf8');
const parse = (w, text) => { w.__t = text; return J(w, 'ctfKitParse(window.__t)'); };
const rule = (r, kind, thenKind) => r.kit.strat.kit.rules.filter(x => x.if.kind === kind && x.then.kind === thenKind);

describe('import from text: the four real answers', () => {
  it('AI 1: fighters, preset, ticks and roles exact, and the rest of its plan', () => {
    const { window: w } = loadMonolith(91);
    const r = parse(w, answer(1)), k = r.kit, st = k.strat;
    expect(k.name).toBe('Science and Speed Synergy'); expect(k.fighters).toEqual(['Tennis Ball', 'Test Tube', 'Leafy', 'Pencil']); expect(k.skill, 'the challenge said hard').toBe(2);
    expect(st.preset).toBe(null); expect(st.mode).toBe('fixed');
    expect(Object.keys(st.ticks).sort()).toEqual(['airlock', 'boostrun', 'carrierhide', 'chip', 'choke', 'layers', 'scout', 'stunland', 'thirdreturn', 'wallshort', 'zone']);
    expect(st.assign).toEqual({ 0:'def', 1:'def', 2:'runner', 3:'att' });
    const kit = st.kit;
    expect(kit.areas).toEqual({ 0:'home', 1:'approach', 2:'enemyHome', 3:'enemyApproach' });
    expect(kit.bid).toEqual({ side:'any', pts:5 });
    expect(kit.offers).toEqual({ propose:[], accept:['both+'], refuseOthers:true });
    expect(kit.budget).toEqual({ 0:{ wall:4, stun:1, deco:3 }, 1:{ stun:3, wall:1, deco:2 }, 2:{ spring:2, plat:5 }, 3:{ spring:2, plat:5 } });
    expect(kit.flags).toEqual({ 0:{ spot:'home', cover:'crate' }, 1:{ spot:'home', cover:'barrel' }, 2:{ spot:'approach', cover:'bush' }, 3:{ spot:'approach', cover:'curtain' } });
    expect(kit.jobs.scout).toEqual([2]);
    expect(rule(r, 'flagsLeftUs', 'role')[0]).toMatchObject({ if:{ n:1 }, then:{ who:3, role:'def' } });
    expect(rule(r, 'jailedUs', 'rescue')[0]).toMatchObject({ if:{ n:2 }, then:{ who:2 } });
    expect(r.unused.map(x => x.sec)).toContain('JOBS');   // (an idea with no job slots is listed, not lost)
  });

  it('AI 2: roles and ticks exact; areas, flag cluster, lean build points, offers and five rules', () => {
    const { window: w } = loadMonolith(92);
    const r = parse(w, answer(2)), k = r.kit, st = k.strat, kit = st.kit;
    expect(k.name).toBe('Slow Burn Raiders'); expect(k.fighters).toEqual(['Leafy', 'Liy', 'Bell', 'Tennis Ball']);
    expect(Object.keys(st.ticks).sort()).toEqual(['boostrun', 'carrierhide', 'chase', 'chip', 'choke', 'cutoff', 'fallback', 'feint', 'layers', 'lurk', 'rescuehit', 'rings', 'scout', 'sealedbox', 'shell', 'stunchain', 'thirdreturn', 'wallshort']);
    expect(st.assign).toEqual({ 0:'scout', 1:'att', 2:'trapper', 3:'def' });
    expect(kit.areas).toEqual({ 0:'enemyApproach', 1:'enemyHome', 2:'approach', 3:'home' });
    expect(kit.bid).toEqual({ side:'any', pts:0 });
    expect(kit.offers).toEqual({ propose:[], accept:['both-'], refuseOthers:true });
    expect(kit.budget[0]).toEqual({ spring:1, deco:1 }); expect(kit.budget[1]).toEqual({ deco:4 }); expect(kit.budget[2]).toEqual({ stun:3, deco:5 }); expect(kit.budget[3]).toEqual({ stun:1, wall:2, deco:4, plat:1 });
    expect(kit.flags[0].spot, 'the innermost ring').toBe('deepHome'); expect(kit.flags[1].spot).toBe('deepHome'); expect(kit.flags[2].spot, 'the cluster behind the choke').toBe('behindChoke'); expect(kit.flags[3].spot).toBe('behindChoke');
    expect(kit.jobs.layers).toEqual([2, 3]); expect(kit.jobs.lurk).toEqual([3]); expect(kit.jobs.scout).toEqual([0]);
    expect(kit.rules.length, 'a reasonable share of its rules').toBeGreaterThanOrEqual(5);
    expect(rule(r, 'jailedUs', 'noChase').length).toBe(1); expect(rule(r, 'ahead', 'allDefend').length).toBe(1); expect(rule(r, 'enemiesOnOurHalf', 'counterRaid').length).toBe(1); expect(rule(r, 'radar', 'role').length).toBe(2);
    expect(r.unused.some(x => /castle/.test(x.text)), 'the map notes are listed as unused').toBe(true);
  });

  it('AI 3: the Turtle preset, the third area, a defensive bid, mutual offers and its rules', () => {
    const { window: w } = loadMonolith(93);
    const r = parse(w, answer(3)), k = r.kit, st = k.strat, kit = st.kit;
    expect(k.name).toBe('Island Lockdown 4'); expect(k.fighters).toEqual(['Golf Ball', 'Yellow Face', 'Leafy', 'Fern']); expect(st.preset).toBe('turtle');
    expect(Object.keys(st.ticks).length).toBe(28); expect(st.ticks.catapult && st.ticks.ambush && st.ticks.lookout && st.ticks.above && st.ticks.mover).toBe(true);
    expect(st.assign).toEqual({ 0:'def', 1:'def', 2:'scout', 3:'runner' });
    expect(kit.areas).toEqual({ 0:'home', 1:'approach', 2:'enemyApproach', 3:'third' });
    expect(kit.bid, 'the stronger defensive half, 4 points').toEqual({ side:'fortress', pts:4 });
    expect(kit.offers).toEqual({ propose:['both+'], accept:['both+'], refuseOthers:true });
    expect(kit.flags).toEqual({ 0:{ spot:'deepHome' }, 1:{ spot:'behindChoke' }, 2:{ spot:'high' }, 3:{ spot:'thirdRoute' } });
    expect(kit.budget[0]).toEqual({ wall:2, stun:2, deco:2, plat:1 }); expect(kit.budget[3]).toEqual({ spring:1, stun:1, wall:1, plat:1, deco:5 });
    expect(kit.rules.length).toBeGreaterThanOrEqual(3);
    expect(rule(r, 'enemiesOnOurHalf', 'allDefend')[0].if.n).toBe(2); expect(rule(r, 'behind', 'role').map(x => x.then.who).sort()).toEqual([2, 3]);
  });

  it('AI 4: no TEAM NAME line (the answer\'s title gives the name), sacrifice offers, spots, and its rules', () => {
    const { window: w } = loadMonolith(94);
    const r = parse(w, answer(4)), k = r.kit, st = k.strat, kit = st.kit;
    expect(k.name).toBe('Sticky Fingers'); expect(k.fighters).toEqual(['Leafy', 'Tree', 'Lollipop', 'Gelatin']); expect(st.preset).toBe(null);
    expect(Object.keys(st.ticks).length).toBe(28); expect(st.ticks.slide && st.ticks.boostdeny && st.ticks.fakeout && st.ticks.counter && st.ticks.jailguard).toBe(true);
    expect(st.assign).toEqual({ 0:'scout', 1:'att', 2:'def', 3:'def' });
    expect(kit.areas).toEqual({ 0:'enemyHome', 1:'enemyApproach', 2:'approach', 3:'home' });
    expect(kit.bid.pts).toBe(0);
    expect(kit.offers).toEqual({ propose:['mine-'], accept:['mine+'], refuseOthers:true });
    expect(kit.flags[3].spot).toBe('deepHome'); expect(kit.flags[1].spot).toBe('deepHome'); expect(kit.flags[2].spot, 'on a mover').toBe('mover'); expect(kit.flags[0].spot, 'behind the airlock').toBe('behindChoke');
    expect(kit.budget[1]).toEqual({ wall:4, stun:2 }); expect(kit.budget[2]).toEqual({ stun:2, spikes:2 }); expect(kit.budget[3]).toEqual({ stun:1, spikes:1, wall:2, deco:4 });
    expect(kit.rules.length).toBeGreaterThanOrEqual(5);
    expect(rule(r, 'enemiesOnOurHalf', 'counterRaid')[0].if.n).toBe(3); expect(rule(r, 'jailedThem', 'role')[0]).toMatchObject({ if:{ n:2 }, then:{ who:3, role:'jailguard' } });
    expect(rule(r, 'flagsLeftUs', 'role')[0]).toMatchObject({ if:{ n:1 }, then:{ who:1, role:'def' } }); expect(rule(r, 'flagsLeftThem', 'allDefend')[0].if.n, 'they have 3 of 4').toBe(1);
  });
});

describe('import from text: tolerance, and what it cannot use', () => {
  it('headings in any case, bullets or commas, menu names or ids, a fighter spelt a letter out; a fighter you cannot use leaves its seat to the draw without being named', () => {
    const { window: w } = loadMonolith(95);
    const prize = w.eval('PRIZE_ROSTER[0].name');
    const text = `team name: Loose Words\n* fighters: Tenis Ball, test tube, ${prize}, Gandalf\n- preset: Turtle\nBuild Setups:\n - Stun the landing\n - airlock\n - One choke point\nOffence plays: scout; Boost for the run home\ndefence tactics: Zones, hold the choke\nRoles:\n* Tenis Ball = Defender\n* test tube = att\nAREAS: Tennis Ball = enemy approach then enemy home; Test Tube = the third area`;
    const r = parse(w, text), st = r.kit.strat;
    expect(r.kit.name).toBe('Loose Words'); expect(r.kit.fighters).toEqual(['Tennis Ball', 'Test Tube', null, null]);
    expect(st.preset).toBe('turtle');
    expect(Object.keys(st.ticks).sort()).toEqual(['airlock', 'boostrun', 'choke', 'scout', 'stunland', 'zone']);
    expect(st.assign).toEqual({ 0:'def', 1:'att' }); expect(st.kit.areas).toEqual({ 0:'enemyApproach', 1:'third' });
    const seen = JSON.stringify(r.unused) + JSON.stringify(r.read) + JSON.stringify(r.notes);
    expect(seen.includes(prize), 'the fighter kept behind a prize is never named').toBe(false);
    expect(r.unused.some(x => /cannot use yet/.test(x.text)), 'but it is listed').toBe(true); expect(r.unused.some(x => /Gandalf/.test(x.text)), 'a name that is no fighter is shown as written').toBe(true);
    expect(parse(w, 'Hello, I think you should pick Firey.').ok, 'nothing of the format in it').toBe(false);
  });

  it('free text: build points as sentences, flag hiding phrases, and adaptation sentences become rules where they match', () => {
    const { window: w } = loadMonolith(96);
    const text = `TEAM NAME: Sentences
FIGHTERS: Lollipop, Pencil, Leafy, Tree
PRESET: none
BUILD SETUPS: choke
ROLES: Lollipop = def, Pencil = att, Leafy = scout, Tree = def
BUILD POINTS:
Lollipop (20): 2 stun pads + 2 spikes (20 points), nothing else.
- Pencil: 3 walls (9), 5 props (5), 3 platforms (6)
FLAG HIDING:
- Lollipop: in the deepest home room, behind a barrel
- Pencil: on a mover
- Leafy and Tree: behind the choke, under a bush
OFFERS: Propose both +10. Accept us +10. Refuse the rest.
ADAPTATION:
- If we have 3 captures and 1 left: Pencil switches to def.
- If 2 or more teammates are in jail: Leafy should rescue them.
- If they get 3 flags: everyone defends.
- When the radar pings, Tree and Lollipop go on the attack.
- After 4 minutes: all attack.
- Whenever the moon is full, dance.`;
    const r = parse(w, text), kit = r.kit.strat.kit;
    expect(kit.budget[0]).toEqual({ stun:2, spikes:2 }); expect(kit.budget[1]).toEqual({ wall:3, deco:5, plat:3 });
    expect(kit.flags[0]).toEqual({ spot:'deepHome', cover:'barrel' }); expect(kit.flags[1].spot).toBe('mover'); expect(kit.flags[2]).toEqual({ spot:'behindChoke', cover:'bush' }); expect(kit.flags[3]).toEqual({ spot:'behindChoke', cover:'bush' });
    expect(kit.offers).toEqual({ propose:['both+'], accept:['mine+'], refuseOthers:true });
    expect(kit.rules).toEqual([
      { if:{ kind:'flagsLeftUs', n:1 }, then:{ kind:'role', who:1, role:'def' }, once:true },
      { if:{ kind:'jailedUs', n:2 }, then:{ kind:'rescue', who:2 }, once:false },
      { if:{ kind:'flagsLeftThem', n:1 }, then:{ kind:'allDefend' }, once:true },
      { if:{ kind:'radar' }, then:{ kind:'role', who:3, role:'att' }, once:true }, { if:{ kind:'radar' }, then:{ kind:'role', who:0, role:'att' }, once:true },
      { if:{ kind:'minutes', n:4 }, then:{ kind:'allAttack' }, once:true } ]);
    expect(r.unused.some(x => /moon/.test(x.text)), 'a sentence it cannot read is listed').toBe(true);
  });
});

describe('the kit in the editor, the store and the match', () => {
  it('the editor has a tab for jobs, areas, bid and offers, budget, flag spots and rules, driven from the keyboard', () => {
    const { window: w } = loadMonolith(97);
    w.eval(`CTFCUP = ctfCupClean({ teams:4, size:3, slots:[['Firey', 'Fries', 'Rose']], strat:[{ mode:'fixed', ticks:{ scout:true, lurk:true } }] }); go('ctfCupTeams'); ctfCupPlanOpen(0);`);
    const tab = (t) => { w.eval(`CTFCUP_PLAN.tab = ${t}; CTFCUP_PLAN.cur = 0; ctfCupPlanDraw();`); };
    expect(J(w, 'CTFCUP_TABS')).toEqual(['Preset', 'Build', 'Offence', 'Defence', 'Roles', 'Jobs', 'Areas', 'Bid', 'Budget', 'Flags', 'Rules']);
    tab(5); expect(J(w, 'ctfCupPlanRows(0, 5).map(function(r){ return r.text; })').join('|')).toContain('Scout first'); key(w, 'Space');   // the scout job: the first seat
    expect(J(w, 'CTFCUP.strat[0].kit.jobs')).toEqual({ scout:[0] });
    tab(6); key(w, 'ArrowDown'); key(w, 'Space'); key(w, 'Space'); expect(J(w, 'CTFCUP.strat[0].kit.areas')).toEqual({ 1:'approach' });
    tab(7); key(w, 'Space'); expect(J(w, 'CTFCUP.strat[0].kit.bid')).toEqual({ side:'fortress', pts:0 }); key(w, 'ArrowDown'); key(w, 'Space'); key(w, 'Space'); expect(w.eval('CTFCUP.strat[0].kit.bid.pts')).toBe(2);
    key(w, 'ArrowDown'); key(w, 'Space');   // propose both +10
    expect(J(w, 'CTFCUP.strat[0].kit.offers.propose')).toEqual(['both+']);
    tab(8); key(w, 'ArrowDown'); key(w, 'Space'); key(w, 'Space'); key(w, 'ArrowDown'); key(w, 'Space');   // seat 1: two walls (6), one platform (2)
    expect(J(w, 'CTFCUP.strat[0].kit.budget')).toEqual({ 0:{ wall:2, plat:1 } });
    expect(J(w, 'ctfCupPlanRows(0, 8)[0].text')).toContain('8 of 20 points');
    key(w, 'Backspace'); expect(J(w, 'CTFCUP.strat[0].kit.budget')).toEqual({ 0:{ wall:2 } });
    tab(9); key(w, 'Space'); key(w, 'ArrowDown'); key(w, 'Space'); expect(J(w, 'CTFCUP.strat[0].kit.flags')).toEqual({ 0:{ spot:'deepHome', cover:'crate' } });
    // rules: write one, add it, write another, move it up, delete the first
    w.eval('CTFCUP_PLAN.tab = 10; CTFCUP_PLAN.cur = 0; CTFCUP_PLAN.draft = null; ctfCupPlanDraw();');
    const rows = () => J(w, 'ctfCupPlanRows(0, 10).map(function(r){ return r.kind + ":" + r.text; })');
    expect(rows().some(r => r.startsWith('add:'))).toBe(true);
    w.eval(`CTFCUP_PLAN.cur = ctfCupPlanRows(0, 10).findIndex(function(r){ return r.kind === 'add'; })`); key(w, 'Space');
    expect(J(w, 'CTFCUP.strat[0].kit.rules')).toEqual([{ if:{ kind:'ahead', n:1 }, then:{ kind:'allDefend' }, once:false }]);
    w.eval(`CTFCUP_PLAN.draft.trig = 'radar'; CTFCUP_PLAN.draft.act = 'allAttack'; CTFCUP_PLAN.cur = ctfCupPlanRows(0, 10).findIndex(function(r){ return r.kind === 'add'; })`); key(w, 'Space');
    expect(J(w, 'CTFCUP.strat[0].kit.rules.map(function(r){ return r.if.kind; })')).toEqual(['ahead', 'radar']);
    w.eval('CTFCUP_PLAN.cur = 1'); key(w, 'BracketLeft'); expect(J(w, 'CTFCUP.strat[0].kit.rules.map(function(r){ return r.if.kind; })'), 'moved up').toEqual(['radar', 'ahead']);
    w.eval('CTFCUP_PLAN.cur = 0'); key(w, 'Delete'); expect(J(w, 'CTFCUP.strat[0].kit.rules.map(function(r){ return r.if.kind; })')).toEqual(['ahead']);
    expect(w.eval('ctfCupPlanText(0)')).toContain('1 rule');
    key(w, 'KeyC'); expect(w.eval('CTFCUP.strat[0].kit'), 'C clears the kit too').toBe(undefined);
  });

  it('a kit with all of it is saved and loaded whole; old kits still load; ids that are not in the lists are dropped', () => {
    const { window: w } = loadMonolith(98);
    const full = { mode:'fixed', preset:null, ticks:{ scout:true }, off:{}, assign:{ 0:'def' }, kit:{ jobs:{ scout:[1], vanished:[0] }, areas:{ 0:'home' }, bid:{ side:'open', pts:3 }, offers:{ propose:['both+'], accept:[], refuseOthers:true }, budget:{ 0:{ wall:2 } }, flags:{ 1:{ spot:'mover', cover:'any' } }, rules:[{ if:{ kind:'radar' }, then:{ kind:'allAttack' }, once:true }, { if:{ kind:'ahead', n:1 }, then:{ kind:'preset', preset:'nonesuch' }, once:false }] } };
    w.eval(`CTFCUP = ctfCupClean({ teams:4, size:3, slots:[['Firey', 'Fries', 'Rose']], strat:[${JSON.stringify(full)}] }); ctfKitPut(0, 'Whole');`);
    w.eval('CTFKITS = null');
    const k = J(w, 'ctfKitSanitize(ctfKits()[0])');
    expect(k.strat.kit.jobs, 'a job on an idea that is not in the menu is dropped').toEqual({ scout:[1] });
    expect(k.strat.kit.rules, 'a rule that switches to a preset that is gone is dropped').toEqual([{ if:{ kind:'radar' }, then:{ kind:'allAttack' }, once:true }]);
    w.eval('ctfKitApply(2, ctfKits()[0])');
    expect(J(w, 'CTFCUP.strat[2].kit.bid')).toEqual({ side:'open', pts:3 }); expect(J(w, 'CTFCUP.strat[2].kit.flags')).toEqual({ 1:{ spot:'mover', cover:'any' } }); expect(J(w, 'CTFCUP.strat[2].kit.budget')).toEqual({ 0:{ wall:2 } });
    // an old kit (nothing of this in it) loads as it always did
    w.eval(`localStorage.setItem(CTFKITS_KEY, ${JSON.stringify(JSON.stringify([{ name:'Old', fighters:['Firey'], skill:1, strat:{ mode:'fixed', preset:'turtle', ticks:{}, off:{}, assign:{} } }]))}); CTFKITS = null; ctfKitApply(3, ctfKits()[0]);`);
    expect(J(w, 'CTFCUP.strat[3]')).toEqual({ mode:'fixed', preset:'turtle', ticks:{}, off:{}, assign:{} });
  });

  it('pl.kit reaches the match with the fixed plan (by seat), is left out for the strategist, and goes when the strategist takes over', () => {
    const { window: w } = loadMonolith(99);
    const own = { mode:'fixed', preset:null, ticks:{ scout:true }, off:{}, assign:{ 0:'def' }, kit:{ areas:{ 0:'home' }, bid:{ side:'any', pts:1 }, rules:[{ if:{ kind:'radar' }, then:{ kind:'allAttack' }, once:true }] } };
    w.eval(`CTFCUP = ctfCupClean({ teams:4, size:3, map:'castle', strat:[${JSON.stringify(own)}, ${JSON.stringify(Object.assign({}, own, { mode:'adapt' }))}] }); ctfCupStart(); watchFixture(TOURNEY.fixtures[0]);`);
    expect(J(w, 'CTF.live.plans[0].kit')).toEqual(J(w, 'CTFCUP.strat[0].kit'));
    expect(w.eval('CTF.live.plans[0].kit === CTFCUP.strat[0].kit'), 'a copy').toBe(false);
    expect(J(w, 'CTF.live.plans[1].kit.areas')).toEqual({ 0:'home' });
    w.eval(`ctfStratApply(CTF.live, 1, 'turtle')`); expect(w.eval('CTF.live.plans[1].kit'), 'the strategist took over: the owner\'s kit is let go').toBe(null);
    const { window: v } = loadMonolith(100);
    v.eval(`CTFCUP = ctfCupClean({ teams:4, size:3, map:'castle' }); ctfCupStart(); watchFixture(TOURNEY.fixtures[0]);`);
    expect(v.eval('CTF.live.plans[0].kit == null'), 'a team on the strategist has no kit').toBe(true);
  }, 120000);

  it('the import box: paste, read, review (what it read and what it could not use), save under the team name, or save and load into the team', () => {
    const { window: w } = loadMonolith(101);
    w.eval(`CTFCUP = ctfCupClean({ teams:4, size:4 }); go('ctfCupTeams'); ctfKitOpen('load', 2); `);
    key(w, 'KeyT'); expect(w.eval('CTFKIT_UI.mode')).toBe('import');
    const ta = w.document.getElementById('ctfKitText'); expect(ta).toBeTruthy();
    ta.value = answer(3); ta.dispatchEvent(new w.Event('input'));
    ta.dispatchEvent(new w.KeyboardEvent('keydown', { code:'Enter', bubbles:true, cancelable:true, ctrlKey:true }));
    expect(w.eval('CTFKIT_UI.stage')).toBe('review');
    const text = w.document.getElementById('ctfCupKitBox').textContent;
    expect(text).toContain('What it read'); expect(text).toContain('Could not use'); expect(text).toContain('Island Lockdown 4'); expect(text).toContain('intercept carriers');
    const nm = w.document.getElementById('ctfKitName'); expect(nm.value).toBe('Island Lockdown 4');
    nm.value = 'Lockdown'; nm.dispatchEvent(new w.Event('input'));
    nm.dispatchEvent(new w.KeyboardEvent('keydown', { code:'Enter', bubbles:true, cancelable:true }));
    expect(J(w, 'ctfKits().map(function(k){ return k.name; })')).toEqual(['Lockdown']); expect(w.eval('CTFKIT_UI')).toBe(null);
    expect(J(w, 'CTFCUP.slots[2]'), 'saved, not loaded').toEqual([null, null, null, null]);
    // again, with Save and load
    w.eval(`ctfKitOpen('load', 2)`); key(w, 'KeyT'); const t2 = w.document.getElementById('ctfKitText'); t2.value = answer(1); t2.dispatchEvent(new w.Event('input'));
    t2.dispatchEvent(new w.KeyboardEvent('keydown', { code:'Enter', bubbles:true, cancelable:true, ctrlKey:true }));
    w.eval('ctfKitImportSave(true)');
    expect(J(w, 'CTFCUP.slots[2]')).toEqual(['Tennis Ball', 'Test Tube', 'Leafy', 'Pencil']); expect(J(w, 'CTFCUP.strat[2].kit.areas')).toEqual({ 0:'home', 1:'approach', 2:'enemyHome', 3:'enemyApproach' });
    expect(J(w, 'ctfKits().map(function(k){ return k.name; })')).toEqual(['Lockdown', 'Science and Speed Synergy']);
  });
});
