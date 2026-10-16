import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// THE FLAG CUP (the owner, 2026-10-16: "make an ai tournament in ctf"): the World Cup's groups and knockouts with every fixture a CPU-vs-CPU Capture the Flag match, the teams
// built by the player (or drawn), the size, the maps and the CPU skill chosen, a fixture watched (a spectated match) or skipped (simulated).

const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
const key = (w, code) => w.dispatchEvent(new w.KeyboardEvent('keydown', { code, bubbles: true, cancelable: true }));
const cup = (w, o) => w.eval(`CTFCUP = ctfCupClean(${JSON.stringify(o)}); ctfCupStart();`);

describe('the Flag Cup', () => {
  it('the setup keeps what the player picked, never a fighter twice on a side, and fills the rest from the draw', () => {
    const { window: w } = loadMonolith(21);
    const c = J(w, `ctfCupClean({ teams:7, size:99, map:'nowhere', cpu:9, gCap:3, slots:[['Firey','Firey',null]], skill:[2, 7] })`);
    expect([c.teams, c.size, c.map, c.cpu, c.gCap], 'bad values fall back to the defaults').toEqual([8, 3, 'rotate', 1, 8]);
    cup(w, { teams:4, size:3, slots:[['Firey', null, 'Rose'], ['Firey', null, null]], skill:[2, -1, 0, -1] });
    const teams = J(w, 'TOURNEY.teams.map(function(t){ return t.members.map(function(m){ return m.name; }); })');
    expect(teams.every(m => m.length === 3 && new Set(m).size === 3), 'three different fighters on every side').toBe(true);
    expect(teams[0][0]).toBe('Firey'); expect(teams[0][2]).toBe('Rose');
    expect(teams[1][0], 'a seat the player chose is kept even when another side has the same fighter').toBe('Firey');
    expect(J(w, 'TOURNEY.teams.map(function(t){ return t.skill; })')).toEqual([2, -1, 0, -1]);
    expect(J(w, '[TOURNEY.game, TOURNEY.groups.length, TOURNEY.fixtures.length, TOURNEY.cupSize]')).toEqual(['ctf', 1, 2, 4]);
  });

  it('the maps: one map for the whole cup, or the rounds take turns', () => {
    const { window: w } = loadMonolith(22);
    cup(w, { teams:8, size:2, map:'rotate' });
    const ids = J(w, 'ctfMapRandomIds()');
    const r0 = J(w, 'TOURNEY.fixtures.map(ctfCupFxMap)');
    expect(new Set(r0).size, 'every match of a round on the same map').toBe(1); expect(r0[0]).toBe(ids[0]);
    w.eval('simRestOfRound()');
    expect(J(w, 'TOURNEY.fixtures.map(ctfCupFxMap)')[0], 'the next round: the next map').toBe(ids[1 % ids.length]);
    cup(w, { teams:4, size:2, map:'forest' });
    expect(J(w, 'TOURNEY.fixtures.map(ctfCupFxMap)')).toEqual(['forest', 'forest']);
  });

  it('a watched fixture is a spectated match of its two teams, each at its own CPU skill; it ends in the table and the hub', () => {
    const { window: w } = loadMonolith(23);
    cup(w, { teams:4, size:2, map:'castle', cpu:1, slots:[['Firey', 'Fries'], ['Rose', 'Bell']], skill:[2, 0, -1, -1] });
    w.eval('watchFixture(TOURNEY.fixtures[0])');
    expect(w.eval('ctfSpecOn()')).toBe(true);
    expect(J(w, 'fighters.map(function(f){ return f.name + ":" + f.team + ":" + f.controller; })')).toEqual(['Firey:0:ai', 'Fries:0:ai', 'Rose:1:ai', 'Bell:1:ai']);
    expect(w.eval('CTF.mapId')).toBe('castle');
    expect(J(w, 'CTF.skillOf')).toEqual([2, 0]);
    // the skill is each team's own inside its AI calls, and the cup's own outside them
    expect(J(w, `(function(){ var a = []; ctfSkillScope(0, function(){ a.push(AI_LEVEL); }); ctfSkillScope(1, function(){ a.push(AI_LEVEL); }); a.push(AI_LEVEL); return a; })()`)).toEqual([2, 0, w.eval('AI_LEVEL')]);
    for (let i = 0; i < 300; i++) w.eval('step()');
    w.eval('updateCamera(); draw()');
    w.eval('ctfEndHide(CTF.live)');
    // team 1 carries every flag home: the fixture is theirs
    w.eval(`(function(){ var L = CTF.live, c = fighters.find(function(f){ return f.team === 1; }); L.flags.filter(function(fl){ return fl.team === 0; }).forEach(function(fl){ ctfCapture(L, fl, c); }); ctfCheckWin(); })()`);
    const fx = J(w, '({ played:TOURNEY.fixtures[0].played, result:TOURNEY.fixtures[0].result, pts:[TOURNEY.fixtures[0].a.pts, TOURNEY.fixtures[0].b.pts], cup:CTF.cupFix, watching:TOURNEY_WATCHING })');
    expect(fx.played).toBe(true); expect(fx.result).toEqual({ sa:0, sb:2 }); expect(fx.pts).toEqual([0, 3]);
    expect(fx.cup).toBe(null); expect(fx.watching).toBe(null);
    expect(w.eval('CTF.skillOf'), 'the skills are put back').toBe(null);
  }, 120000);

  it('a match past its cap is decided on flags, then on who is free; the S key settles a fixture from where it stands; F runs it faster', () => {
    const { window: w } = loadMonolith(24);
    cup(w, { teams:4, size:2, map:'castle', gCap:5 });
    w.eval('watchFixture(TOURNEY.fixtures[0])');
    expect(w.eval('CTF.cupFix.cap')).toBe(5*3600);
    w.eval('ctfEndHide(CTF.live)');
    w.eval(`(function(){ var L = CTF.live; ctfCapture(L, L.flags.find(function(fl){ return fl.team === 1; }), fighters.find(function(f){ return f.team === 0; })); L.playT = CTF.cupFix.cap - 1; })()`);
    w.eval('step()');
    const r = J(w, 'TOURNEY.fixtures[0]');
    expect(r.played, 'the cap ended it').toBe(true); expect(r.how).toBe('time'); expect(r.result.sa, 'one flag to none: team A').toBeGreaterThan(r.result.sb);
    // the second fixture: skipped from the match with S
    w.eval('watchFixture(TOURNEY.fixtures[1])');
    key(w, 'KeyF'); expect(w.eval('CTF.spec.speed')).toBe(2); key(w, 'KeyF'); key(w, 'KeyF'); key(w, 'KeyF'); expect(w.eval('CTF.spec.speed'), 'after 8 it is 1 again').toBe(1);
    w.eval('ctfEndHide(CTF.live)');
    key(w, 'KeyS');
    const r2 = J(w, 'TOURNEY.fixtures[1]');
    expect(r2.played).toBe(true); expect(r2.how).toBe('skip'); expect(w.eval('CTF.cupFix')).toBe(null);
  }, 120000);

  it('the cup runs from the groups to a champion, simulating what is skipped; a Flag Cup win is not a World Cup win', () => {
    const { window: w } = loadMonolith(25);
    cup(w, { teams:8, size:3 });
    let n = 0; while (!w.eval('TOURNEY.champion') && n++ < 12) w.eval('simRestOfRound()');
    expect(w.eval('TOURNEY.stage')).toBe('done');
    expect(J(w, 'TOURNEY.bracket.map(function(r){ return r.length; })'), 'semi-finals and the final').toEqual([2, 1]);
    expect(w.eval('document.getElementById("tourneyHubBody").textContent')).toContain('Flag Cup');
    expect(J(w, 'TOURNEY.teams.every(function(t){ return t.P === 3; })'), 'everyone played three group matches').toBe(true);
    // the World Cup is untouched: its own teams are not a Flag Cup's
    w.eval('startTournament(1, "spectate")');
    expect(w.eval('TOURNEY.game')).toBe(undefined);
  }, 120000);
});
