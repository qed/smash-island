import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// KITS in the Flag Cup team builder (the owner, 2026-10-16: "can you give me a save kit button?"): a kit is a whole team saved under a name (fighters in seat order, strategy setting and plan, CPU skill),
// a named list kept on this computer; bad or old entries are dropped cleanly; nobody the game keeps locked or behind a prize comes through a kit.

const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
const key = (w, code, target) => (target || w).dispatchEvent(new w.KeyboardEvent('keydown', { code, bubbles: true, cancelable: true }));
const team = (w) => w.eval(`CTFCUP = ctfCupClean({ teams:4, size:4, slots:[['Firey', 'Fries', null, 'Rose'], ['Bell', null, null, null]], skill:[2, -1, -1, -1],
  strat:[{ mode:'fixed', preset:'turtle', ticks:{ scout:true, zone:true }, off:{ fallback:true }, assign:{ 0:'def', 3:'att' } }] });`);
const names = (w) => J(w, 'ctfKits().map(function(k){ return k.name; })');

describe('Flag Cup kits', () => {
  it('a kit saved from a team, read back after a reload, fills another team: fighters, strategy, plan and skill', () => {
    const { window: w } = loadMonolith(81);
    team(w);
    expect(w.eval(`ctfKitPut(0, 'Alpha')`)).toBe(true);
    w.eval('CTFKITS = null');   // (a reload: the list is read again from the browser's store)
    expect(names(w)).toEqual(['Alpha']);
    w.eval(`ctfKitApply(1, ctfKits()[0])`);
    expect(J(w, 'CTFCUP.slots[1]')).toEqual(['Firey', 'Fries', null, 'Rose']);
    expect(w.eval('CTFCUP.skill[1]')).toBe(2);
    expect(J(w, 'CTFCUP.strat[1]')).toEqual({ mode:'fixed', preset:'turtle', ticks:{ scout:true, zone:true }, off:{ fallback:true }, assign:{ 0:'def', 3:'att' } });
    // the teams are separate copies: changing one leaves the kit alone
    w.eval(`CTFCUP.strat[1].ticks.swarm = true; CTFCUP.slots[1][0] = 'Bell';`);
    expect(J(w, 'ctfKits()[0].strat.ticks')).toEqual({ scout:true, zone:true });
    // a kit of another size: seats beyond the team are let go, and the roles of seats that are not there
    w.eval(`CTFCUP = ctfCupClean({ teams:4, size:2 }); ctfKitApply(0, ctfKits()[0]);`);
    expect(J(w, 'CTFCUP.slots[0]')).toEqual(['Firey', 'Fries']); expect(J(w, 'CTFCUP.strat[0].assign')).toEqual({ 0:'def' });
  });

  it('a name is one kit (a name that exists is replaced), and a kit can be renamed and deleted', () => {
    const { window: w } = loadMonolith(82);
    team(w);
    w.eval(`ctfKitPut(0, 'Alpha'); ctfKitPut(1, 'Beta'); ctfKitPut(1, 'alpha ');`);
    expect(names(w), 'the same name in other letters replaced the first').toEqual(['alpha', 'Beta']);
    expect(J(w, 'ctfKits()[0].fighters[0]'), 'with the second team').toBe('Bell');
    expect(w.eval(`ctfKitRename('alpha', 'Beta')`), 'a name that is taken').toBe(false);
    expect(w.eval(`ctfKitRename('alpha', '  Gamma ')`)).toBe(true);
    expect(names(w)).toEqual(['Gamma', 'Beta']);
    expect(w.eval(`ctfKitPut(0, '   ')`), 'a kit needs a name').toBe(false);
    expect(w.eval(`ctfKitDelete('beta')`)).toBe(true); expect(w.eval(`ctfKitDelete('beta')`)).toBe(false);
    w.eval('CTFKITS = null');
    expect(names(w), 'kept after a reload').toEqual(['Gamma']);
  });

  it('bad and old entries are dropped cleanly: junk in the store, fighters the game does not offer, ids not in the lists', () => {
    const { window: w } = loadMonolith(83);
    const locked = w.eval(`(function(){ var r = ROSTER.find(function(x){ return x.play && !isUnlocked(x); }); return r ? r.name : 'No Such Fighter'; })()`);
    const prize = w.eval(`PRIZE_ROSTER[0].name`);
    const old = { name:'Old', fighters:['Firey', locked, prize, 'Gone Forever', 'Firey', 'Rose'], skill:9, strat:{ mode:'weird', preset:'vanished', ticks:{ scout:true, vanished:true, nope:false }, off:{ ghost:true }, assign:{ 0:'def', 1:'bogus', 2:'auto', 30:'att' } } };
    const store = [null, 5, 'x', { name:42 }, { name:'  ' }, { name:'Dup', fighters:['Firey'] }, { name:'dup', fighters:['Fries'] }, old];
    w.eval(`localStorage.setItem(CTFKITS_KEY, ${JSON.stringify(JSON.stringify(store))}); CTFKITS = null;`);
    expect(names(w), 'only real, uniquely named entries stay').toEqual(['Dup', 'Old']);
    const k = J(w, `ctfKitSanitize(ctfKits()[1])`);
    expect(k.fighters, 'a fighter that is locked, kept behind a prize, gone, or already on the side leaves its seat empty').toEqual(['Firey', null, null, null, null, 'Rose']);
    expect(k.skill, 'a bad skill is the cup default').toBe(-1);
    expect(k.strat).toEqual({ mode:'auto', preset:null, ticks:{ scout:true }, off:{}, assign:{ 0:'def' } });
    expect(k.dropped).toBeGreaterThan(5);
    w.eval(`localStorage.setItem(CTFKITS_KEY, '{ not json'); CTFKITS = null;`);
    expect(J(w, 'ctfKits()'), 'a broken store is an empty list').toEqual([]);
    // loaded into a team, a seat the game will not give is empty and the draw fills it
    w.eval(`localStorage.setItem(CTFKITS_KEY, ${JSON.stringify(JSON.stringify([old]))}); CTFKITS = null; CTFCUP = ctfCupClean({ teams:4, size:4 }); ctfKitApply(2, ctfKits()[0]);`);
    expect(J(w, 'CTFCUP.slots[2]')).toEqual(['Firey', null, null, null]);
    const drawn = J(w, `(function(){ ctfCupStart(); return TOURNEY.teams[2].members.map(function(m){ return m.name; }); })()`);
    expect(drawn.length).toBe(4); expect(drawn[0]).toBe('Firey'); expect(drawn.includes(prize), 'the draw never offers a prize fighter').toBe(false);
  });

  it('the AI 1-4 example kits come in with one button, every plan name resolves, and a kit loads as the card says', () => {
    const { window: w } = loadMonolith(84);
    expect(J(w, 'CTFKIT_EXAMPLES.map(function(x){ return ctfKitFromExample(x).missing; })'), 'every idea on the cards is in the planning menu\'s lists').toEqual([[], [], [], []]);
    w.eval('ctfKitImportExamples()');
    expect(names(w)).toEqual(['AI 1', 'AI 2', 'AI 3', 'AI 4']);
    w.eval('CTFCUP = ctfCupClean({ teams:4, size:4 }); ctfKitApply(0, ctfKits()[2]);');
    expect(J(w, 'CTFCUP.slots[0]')).toEqual(['Golf Ball', 'Yellow Face', 'Leafy', 'Fern']);
    const st = J(w, 'CTFCUP.strat[0]');
    expect(st.mode).toBe('fixed'); expect(st.preset).toBe('turtle'); expect(st.assign).toEqual({ 0:'def', 1:'def', 2:'scout', 3:'runner' });
    expect(st.ticks.scout).toBe(true); expect(st.ticks.zone, 'Zones').toBe(true); expect(st.ticks.pincer).toBe(true); expect(w.eval('CTFCUP.skill[0]')).toBe(2);
    w.eval('ctfKitImportExamples()'); expect(w.eval('ctfKits().length'), 'again: replaced, not doubled').toBe(4);
  });

  it('the box: Save asks for a name and asks before replacing; Load lists the kits and loads, renames and deletes from the keyboard', () => {
    const { window: w } = loadMonolith(85);
    team(w); w.eval(`go('ctfCupTeams'); ctfCupTeamsRender(); ctfKitOpen('save', 0);`);
    const inp = w.document.getElementById('ctfKitName'); expect(inp).toBeTruthy();
    inp.value = 'Mine'; inp.dispatchEvent(new w.Event('input'));
    key(w, 'Enter', inp); expect(names(w)).toEqual(['Mine']); expect(w.eval('CTFKIT_UI')).toBe(null);
    w.eval(`ctfKitOpen('save', 1)`); const inp2 = w.document.getElementById('ctfKitName'); inp2.value = 'mine'; inp2.dispatchEvent(new w.Event('input'));
    key(w, 'Enter', inp2); expect(w.eval('!!CTFKIT_UI'), 'a name that exists asks first').toBe(true); expect(w.eval('CTFKIT_UI.msg')).toContain('replaces');
    expect(J(w, 'ctfKits()[0].fighters[0]')).toBe('Firey');
    key(w, 'Enter', w.document.getElementById('ctfKitName')); expect(J(w, 'ctfKits()[0].fighters[0]'), 'then replaced with team 2').toBe('Bell'); expect(w.eval('CTFKIT_UI')).toBe(null);
    // load
    w.eval(`ctfKitImportExamples(); ctfKitOpen('load', 3)`);
    expect(w.eval('ctfKits().length')).toBe(5);
    key(w, 'ArrowDown'); key(w, 'Enter');   // the second kit, AI 1
    expect(J(w, 'CTFCUP.slots[3]')).toEqual(['Tennis Ball', 'Test Tube', 'Leafy', 'Pencil']); expect(w.eval('CTFKIT_UI')).toBe(null);
    // rename and delete
    w.eval(`ctfKitOpen('load', 0)`); key(w, 'ArrowDown'); key(w, 'KeyR');
    const rn = w.document.getElementById('ctfKitRename'); rn.value = 'Science'; rn.dispatchEvent(new w.Event('input')); key(w, 'Enter', rn);
    expect(names(w)).toEqual(['mine', 'Science', 'AI 2', 'AI 3', 'AI 4']);
    key(w, 'Delete'); expect(w.eval('ctfKits().length'), 'one press asks').toBe(5); key(w, 'Delete'); expect(names(w)).toEqual(['mine', 'AI 2', 'AI 3', 'AI 4']);
    key(w, 'Escape'); expect(w.eval('CTFKIT_UI')).toBe(null);
  });
});
