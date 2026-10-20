import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// THE NORMAL FLAG CUP (the owner, 2026-10-19: "flag cup should have a 'normal' option"). Beside the watch-only cup, a cup you play: your team is marked in the
// builder (seat 1 is you), every fixture with your team in it is yours to play and never simulated, the rest are the CPUs' as before. The owner's answers:
// your side is picked in the team builder; your strategist is "On, I can override" (it plans for your CPU teammates until you set a plan in the menu, and
// clearing yours gives the plan back); no saving; your matches count as matches and a won cup as a cup, never for the secret chains. Only Normal waits for
// the Capture the Flag practice.

const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
const key = (w, code) => w.dispatchEvent(new w.KeyboardEvent('keydown', { code, key: code, bubbles: true, cancelable: true }));
const cup = (w, o) => w.eval(`CTFCUP = ctfCupClean(${JSON.stringify(o)}); ctfCupStart();`);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
// your fixture of the round and the side you are on
const myFx = (w) => J(w, `(function(){ var my = TOURNEY.myTeam, i = TOURNEY.fixtures.findIndex(function(fx){ return !fx.played && (fx.a === my || fx.b === my); }); return i < 0 ? null : { i:i, side:TOURNEY.fixtures[i].a === my ? 0 : 1 }; })()`);
// side t carries every flag of the other side home
const winFor = (w, t) => w.eval(`(function(){ var L = CTF.live; ctfEndHide(L); var c = fighters.find(function(f){ return f.team === ${t}; }); L.flags.filter(function(fl){ return fl.team !== ${t}; }).forEach(function(fl){ ctfCapture(L, fl, c); }); ctfCheckWin(); })()`);
const planOf = (w, t) => J(w, `(function(){ var pl = CTF.live.plans[${t}]; return { preset:pl.preset, votes:Object.keys(pl.votes), assign:pl.assign, mine:CTF.cupFix.mine }; })()`);

describe('the Normal Flag Cup', () => {
  it('the setup has a Mode row; the builder marks Your team, seat 1 is You, and another card can be made yours', () => {
    const { window: w } = loadMonolith(61);
    expect(J(w, `(function(){ var c = ctfCupClean({ play:1, mine:9, teams:4 }); return [c.play, c.mine]; })()`), 'your team is one of the teams').toEqual([1, 3]);
    expect(J(w, `ctfCupClean(null).play`), 'the watch-only cup is the default').toBe(0);
    w.eval(`CTFCUP = ctfCupClean({ play:1, mine:2, teams:4, size:2, slots:[[], [], ['Firey', 'Rose']] }); go('ctfCupSetup'); ctfCupSyncUI(); go('ctfCupTeams'); ctfCupTeamsRender();`);
    expect(w.eval(`document.querySelector('#ctfCupRows .seglabel').textContent`)).toBe('Mode');
    expect(w.eval(`document.getElementById('ctfCupSummary').textContent`)).toContain('you play your team');
    const cards = J(w, `Array.prototype.map.call(document.querySelectorAll('#ctfCupTeamGrid .ctfcup-team'), function(c){ return { mine:c.classList.contains('mine'), text:c.textContent }; })`);
    expect(cards.map(c => c.mine)).toEqual([false, false, true, false]);
    expect(cards[2].text).toContain('Your team'); expect(cards[2].text).toContain('You: Firey'); expect(cards[2].text).toContain('Your plan: strategist');
    expect(cards[0].text).toContain('Make this my team'); expect(cards[0].text).not.toContain('You:');
    w.eval(`Array.prototype.find.call(document.querySelectorAll('#ctfCupTeamGrid .ctfcup-team')[0].querySelectorAll('button'), function(b){ return b.textContent === 'Make this my team'; }).click()`);
    expect(w.eval('CTFCUP.mine')).toBe(0);
  });

  it('seats you on your side as the keyboard\'s fighter, never sims or spectates your fixture (Spectate and Explore on), and R does not replay it', () => {
    const { window: w } = loadMonolith(62);
    w.eval('SETTINGS.ctfSpectate = true; SETTINGS.ctfExplore = true;');
    cup(w, { play:1, mine:1, teams:4, size:2, map:'castle', slots:[['Fries', 'Bell'], ['Firey', 'Rose']] });
    expect(J(w, '[TOURNEY.mode, TOURNEY.myTeam === TOURNEY.teams[1]]')).toEqual(['normal', true]);
    expect(w.eval(`document.getElementById('tourneyProceedBtn').textContent`)).toContain('Play My Match');
    expect(w.eval(`document.getElementById('tourneyHubBrand').textContent`)).toContain('Your Team');
    const m = myFx(w);
    w.eval('simRestOfRound()');   // the big button with your match unplayed: it never sims yours, it starts it
    expect(w.eval(`TOURNEY.fixtures[${m.i}].played`)).toBe(false);
    expect(w.eval('CTF.cupFix.you')).toBe(m.side);
    expect(w.eval('ctfSpecOn()'), 'not a spectated match').toBe(false);
    expect(w.eval('CTF.live.explore'), 'Explore is off in a cup fixture').toBe(false);
    const seats = J(w, 'fighters.map(function(f){ return { n:f.name, t:f.team, c:f.controller, y:f.you }; })');
    const me = seats.filter(f => f.y);
    expect(me.length).toBe(1);
    expect(me[0]).toEqual({ n:'Firey', t:m.side, c:'local', y:true });
    expect(seats.findIndex(f => f.y), 'seat 1 of your side').toBe(m.side * 2);
    expect(seats.filter(f => !f.y).every(f => f.c === 'ai')).toBe(true);
    expect(seats.find(f => f.n === 'Rose').t, 'your teammate is on your side').toBe(m.side);
    // R mid-fixture does not start it again; S (and a skip) never settle it for you
    w.eval('CTF.live._mark = 7');
    key(w, 'KeyR'); key(w, 'KeyS'); w.eval('ctfCupSkip()');
    expect(w.eval('CTF.live && CTF.live._mark'), 'the same match goes on').toBe(7);
    expect(w.eval(`TOURNEY.fixtures[${m.i}].played`)).toBe(false);
    // a Watch button on your own fixture still makes it yours
    w.eval('quitMatch()');
  }, 120000);

  it('your strategist plans for your teammates until you vote; then your vote wins, the strategist keeps out, and clearing it gives the plan back', () => {
    const { window: w } = loadMonolith(63);
    cup(w, { play:1, mine:0, teams:4, size:3, map:'castle' });
    const m = myFx(w), t = m.side, o = 1 - t;
    w.eval(`watchFixture(TOURNEY.fixtures[${m.i}], true)`);
    expect(w.eval('CTF.cupFix.you')).toBe(t);
    expect(planOf(w, t).mine, 'no plan of yours: the strategist has your side').toBe(false);
    // the strategist's plan is on your side, as a plan and never as a vote merged with yours
    w.eval(`ctfStratApply(CTF.live, ${t}, 'rush'); ctfStratTeam(CTF.live, CTF.strat[${t}], ${t});`);
    let p = planOf(w, t);
    expect(p.preset).toBe('allout'); expect(p.votes).toEqual([]);
    expect(Object.values(p.assign).length, 'your two CPU teammates hold to its roles').toBe(2);
    expect(Object.values(p.assign).every(r => r === 'att')).toBe(true);
    // you pick a preset in the plan menu: your vote is your side's plan
    key(w, 'KeyP'); expect(w.eval('ctfMenuOpen()')).toBe(true);
    key(w, 'Space');
    const pick = w.eval('Object.keys(CTF_PRESETS)[0]'), meIdx = w.eval('fighters.find(function(f){ return f.you; }).idx');
    p = planOf(w, t);
    expect(p.mine).toBe(true); expect(p.preset).toBe(pick); expect(p.votes).toEqual([String(meIdx)]);
    expect(p.assign, 'its roles are gone with it').toEqual({});
    // the strategist keeps out while your plan holds: no roles, and no look again (which would put its own plan back)
    w.eval(`var __re = []; ctfStratReeval = function(L, ss, tt){ __re.push(tt); }; CTF.stratFixed = false; CTF.live.playT = 1806; CTF.strat[${t}].swapT = -9999; CTF.strat[${o}].swapT = -9999;
      ctfStratTeam(CTF.live, CTF.strat[${t}], ${t}); ctfStratTeam(CTF.live, CTF.strat[${o}], ${o});`);
    expect(planOf(w, t).assign).toEqual({}); expect(planOf(w, t).preset).toBe(pick);
    expect(J(w, '__re'), 'only the other side\'s strategist looks again').toEqual([o]);
    // untick it (Space again): the plan goes back to the strategist at once
    key(w, 'Space');
    p = planOf(w, t);
    expect(p.mine).toBe(false); expect(p.votes).toEqual([]); expect(p.preset).toBe('allout');
    // and C clears a plan the same way
    key(w, 'ArrowDown'); key(w, 'Space'); expect(planOf(w, t).mine).toBe(true);
    key(w, 'KeyC'); p = planOf(w, t);
    expect(p.mine).toBe(false); expect(p.preset).toBe('allout');
    expect(J(w, `TOURNEY.fixtures[${m.i}].plans[${t}].name`)).toBe(w.eval(`CTF_STRATS[CTF.strat[${t}].plan].name`));
    w.eval('quitMatch()');
  }, 120000);

  it('a saved plan on your card is your starting plan: your own vote (never the strategist\'s pseudo-vote), which you can clear', () => {
    const { window: w } = loadMonolith(64);
    const strat = [{ mode:'fixed', preset:'fortress', ticks:{ jailbreak:true }, off:{}, assign:{ 1:'def' } }, {}, {}, {}];
    cup(w, { play:1, mine:0, teams:4, size:3, map:'castle', strat });
    const m = myFx(w), t = m.side;
    w.eval(`watchFixture(TOURNEY.fixtures[${m.i}], true)`);
    const meIdx = w.eval('fighters.find(function(f){ return f.you; }).idx');
    let p = planOf(w, t);
    expect(p.mine).toBe(true); expect(p.preset).toBe('fortress');
    expect(p.votes, 'only your vote: no strategist vote you could never untick').toEqual([String(meIdx)]);
    expect(p.assign[String(t * 3 + 1)], 'seat 2 on your card defends').toBe('def');
    expect(J(w, 'CTF.menu.vote.preset'), 'the plan menu opens on it').toBe('fortress');
    expect(J(w, `TOURNEY.fixtures[${m.i}].plans[${t}].name`)).toBe('Your plan');
    key(w, 'KeyP'); key(w, 'KeyC');
    p = planOf(w, t);
    expect(p.mine).toBe(false); expect(p.votes).toEqual([]);
    expect(p.preset).toBe(w.eval(`CTF_STRATS[CTF.strat[${t}].plan].preset || null`));
    w.eval('quitMatch()');
  }, 120000);

  it('only Normal waits for the practice, and the cup starts by itself after it; Watch never waits', () => {
    const { window: w } = loadMonolith(65);
    w.eval(`CTFCUP = ctfCupClean({ play:1, teams:4, size:2 }); ctfCupKickOff();`);
    expect(w.eval('CTUT.active'), 'a Normal cup waits for the practice').toBe(true);
    expect(w.eval('CTUT.reason')).toBe('cup');
    expect(w.eval('ctutWhy()')).toContain('Flag Cup');
    expect(w.eval('!!(TOURNEY && TOURNEY.active)'), 'nothing started yet').toBe(false);
    w.eval('ctutComplete()');
    expect(J(w, '[TOURNEY.active, TOURNEY.game, TOURNEY.mode]'), 'the cup starts by itself').toEqual([true, 'ctf', 'normal']);
    const { window: w2 } = loadMonolith(66);
    w2.eval(`CTFCUP = ctfCupClean({ play:0, teams:4, size:2 }); ctfCupKickOff();`);
    expect(w2.eval('CTUT.active'), 'the watch-only cup never waits').toBe(false);
    expect(J(w2, '[TOURNEY.active, TOURNEY.mode]')).toEqual([true, 'spectate']);
    // both Kick Off buttons (the setup screen and the builder) go through it
    expect(J(w2, `Array.prototype.filter.call(document.querySelectorAll('#ctfCupSetup button, #ctfCupTeams button'), function(b){ return /Kick Off/.test(b.textContent); }).map(function(b){ return b.getAttribute('onclick'); })`)).toEqual(['ctfCupKickOff()', 'ctfCupKickOff()']);
  });

  it('a fixture you play counts as a match; one you watch does not', async () => {
    const { window: w } = loadMonolith(67);
    await w.eval('profileReady');
    cup(w, { play:1, mine:0, teams:4, size:2, map:'castle' });
    const m = myFx(w), other = m.i === 0 ? 1 : 0;
    const before = J(w, '[PROFILE.matches, PROFILE.wins]');
    w.eval(`watchFixture(TOURNEY.fixtures[${other}])`);
    expect(w.eval('ctfSpecOn()'), 'a CPU fixture is watched').toBe(true);
    winFor(w, 0);
    expect(w.eval(`TOURNEY.fixtures[${other}].played`)).toBe(true);
    expect(J(w, '[PROFILE.matches, PROFILE.wins]'), 'a watched fixture earns nothing').toEqual(before);
    await sleep(2500);   // (the hub comes back after the result's banner)
    w.eval(`watchFixture(TOURNEY.fixtures[${m.i}], true)`);
    winFor(w, m.side);
    expect(w.eval(`TOURNEY.fixtures[${m.i}].played`)).toBe(true);
    expect(J(w, '[PROFILE.matches, PROFILE.wins]'), 'your fixture is a match, and a win').toEqual([before[0] + 1, before[1] + 1]);
  }, 120000);

  it('your final crowns you at once: "You win the Flag Cup!", a cup title, and never One\'s Moon or Steve Cobs\'s cups', async () => {
    const { window: w } = loadMonolith(68);
    await w.eval('profileReady');
    cup(w, { play:1, mine:0, teams:4, size:2, map:'castle' });
    // straight to the final, your team against team 1
    w.eval(`(function(){ var T = TOURNEY, fin = { kind:'ko', a:T.teams[1], b:T.myTeam, played:false, result:null };
      T.stage = 'knockout'; T.knockoutRound = 1; T.bracket = [[], [fin]]; T.fixtures = [fin]; T.eliminated = false; showTourneyHub(); })()`);
    expect(w.eval(`document.getElementById('tourneyProceedBtn').textContent`)).toContain('Play My Match');
    expect(w.eval(`document.querySelector('#tourneyHubBody .th-mine .th-watch').textContent`), 'your knockout match reads Play').toContain('Play');
    w.eval(`var __hits = []; oneWorldCupHook = function(){ __hits.push('one'); return false; }; cobsCupWon = function(){ __hits.push('cobs'); return false; };
      oneQ().stage = ONE_STAGE.MOON;`);
    const titles = w.eval('PROFILE.wcTitles');
    w.eval(`document.getElementById('tourneyProceedBtn').click()`);
    expect(w.eval('CTF.cupFix.you')).toBe(1);
    winFor(w, 1);
    await sleep(2600);   // (the result's banner, then the champions)
    expect(w.eval('TOURNEY.champion === TOURNEY.myTeam')).toBe(true);
    expect(w.eval(`document.getElementById('tourneyHubBody').textContent`)).toContain('You win the Flag Cup!');
    expect(w.eval('PROFILE.wcTitles'), 'a won cup is a cup title').toBe(titles + 1);
    expect(J(w, '__hits'), 'the secret chains never hear of it').toEqual([]);
    expect(w.eval(`document.getElementById('tourneyProceedBtn').textContent`), 'no Moon').toBe('Back to Title');
    expect(w.eval(`document.getElementById('tourneyHubBody').textContent`)).not.toContain('cracked');
  }, 120000);
});
