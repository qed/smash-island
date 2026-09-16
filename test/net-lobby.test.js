import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// "add the options of the main game to multiplayer."
//
// Before: the lobby was a room code and a Start button. The start message copied mode, count, stocks,
// team split and map size from the select screen, and not the stadium, items or CPU skill, so host and
// client could build different stadiums. Every human played Firey (the roster read players[].fighter,
// which nothing sets). And a client's snapshot had no items and no summons: pickups, assists and a Boss
// Rush boss existed only for the host.

// A fake socket that records what NET sends.
const wire = (w, role, players) => w.eval(`(function(){
  NET.role = ${JSON.stringify(role)}; NET.myId = 'me'; NET.room = 'QXTR';
  NET.sent = []; NET.ws = { readyState: 1, send: function(t){ NET.sent.push(JSON.parse(t)); }, close: function(){} };
  NET.players = ${JSON.stringify(players)};
  NET.renderLobby();
  return true;
})()`);

describe('the lobby has the main game\'s options', () => {
  it('shows the host every option the select screen has, and a fighter picker', () => {
    const { window: w } = loadMonolith();
    wire(w, 'host', [{ id: 'me', name: 'Pencil', isHost: true }, { id: 'b', name: 'Leafy' }]);
    const r = w.eval(`(function(){
      var ids = ['lobbyFighter','lobbyStage','lobbyMode','lobbyCount','lobbyStocks','lobbyAI','lobbyItems','lobbyMapSize'];
      return { present: ids.filter(function(id){ return !!document.getElementById(id); }), panel: document.getElementById('lobbySettings').style.display,
               stages: document.getElementById('lobbyStage').options.length, total: STAGES.length,
               counts: Array.prototype.map.call(document.querySelectorAll('#lobbyCount button'), function(b){ return +b.dataset.v; }) };
    })()`);
    expect(r.panel).toBe('block');
    expect(r.present).toEqual(['lobbyFighter', 'lobbyStage', 'lobbyMode', 'lobbyCount', 'lobbyStocks', 'lobbyAI', 'lobbyItems', 'lobbyMapSize']);
    expect(r.stages).toBe(r.total);
    expect(Math.min(...r.counts), 'never fewer contestants than humans in the room').toBeGreaterThanOrEqual(2);
  });

  it('a host change writes the same globals the select screen writes, and is pushed to the room', () => {
    const { window: w } = loadMonolith();
    wire(w, 'host', [{ id: 'me', name: 'Pencil', isHost: true }]);
    const r = w.eval(`(function(){
      NET.sent = [];
      document.querySelector('#lobbyItems button[data-v="0"]').click();
      document.querySelector('#lobbyAI button[data-v="2"]').click();
      document.querySelector('#lobbyStocks button[data-v="5"]').click();
      document.querySelector('#lobbyMode button[data-v="teams"]').click();
      var sel = document.getElementById('lobbyStage'); var other = STAGES[STAGES.length-1].id; sel.value = other; sel.onchange();
      var last = NET.sent[NET.sent.length-1];
      return { itemRate: SETTINGS.itemRate, ai: AI_LEVEL, stocks: SETTINGS.stocks, mode: SETTINGS.mode, stage: stage.id, other: other,
               teamsRow: !!document.getElementById('lobbyTeams'), pushes: NET.sent.filter(function(m){ return m.t==='state' && m.lobby; }).length, last: last };
    })()`);
    expect(r).toMatchObject({ itemRate: 0, ai: 2, stocks: 5, mode: 'teams' });
    expect(r.stage).toBe(r.other);
    expect(r.teamsRow, 'teams mode shows the split').toBe(true);
    expect(r.pushes).toBe(5);
    expect(r.last.lobby).toMatchObject({ itemRate: 0, ai: 2, stocks: 5, mode: 'teams', stage: r.other });
    expect(r.last.s, 'a settings preview carries no snapshot').toBeUndefined();
  });

  it('a client sees the host\'s settings, and a preview is never taken for a snapshot', () => {
    const { window: w } = loadMonolith();
    wire(w, 'client', [{ id: 'h', name: 'Pencil', isHost: true }, { id: 'me', name: 'Leafy' }]);
    const r = w.eval(`(function(){
      var before = NET.snapshot;
      NET.onMessage({ t:'state', lobby:{ mode:'ffa', count:4, stocks:2, teamKey:'2v2', mapSize:'tall', stage: STAGES[1].id, itemRate:3, ai:0 } });
      return { text: document.getElementById('lobbySummary').textContent, snapshotUntouched: NET.snapshot === before, hostControls: !!document.getElementById('lobbyItems'), fighter: !!document.getElementById('lobbyFighter') };
    })()`);
    expect(r.text).toContain('4 contestants');
    expect(r.text).toContain('2 stocks');
    expect(r.text).toContain('lots of items');
    expect(r.text).toContain('Easy CPU');
    expect(r.snapshotUntouched).toBe(true);
    expect(r.hostControls, 'only the host sets the match').toBe(false);
    expect(r.fighter, 'but every player picks their fighter').toBe(true);
  });

  it('picking a fighter sends a fresh hello carrying it', () => {
    const { window: w } = loadMonolith();
    wire(w, 'client', [{ id: 'h', name: 'Pencil', isHost: true }, { id: 'me', name: 'Leafy' }]);
    const r = w.eval(`(function(){ NET.sent = []; NET.pickFighter('Bubble'); return { sent: NET.sent, chosen: chosen.name }; })()`);
    expect(r.chosen).toBe('Bubble');
    expect(r.sent).toEqual([{ t: 'hello', id: 'me', host: false, name: 'Bubble' }]);
  });

  it('a new player joining gets the host\'s settings at once', () => {
    const { window: w } = loadMonolith();
    wire(w, 'host', [{ id: 'me', name: 'Pencil', isHost: true }]);
    const n = w.eval(`(function(){ NET.sent = []; NET.onMessage({ t:'roster', players:[{ id:'me', name:'Pencil', isHost:true }, { id:'b', name:'Rocky' }] });
      return NET.sent.filter(function(m){ return m.t==='state' && m.lobby; }).length; })()`);
    expect(n).toBe(1);
  });
});

describe('the start carries all of it', () => {
  it('each human plays the fighter they picked, not Firey', () => {
    const { window: w } = loadMonolith();
    wire(w, 'host', [{ id: 'me', name: 'Pencil', isHost: true }, { id: 'b', name: 'Rocky' }, { id: 'c', name: 'NotAFighter' }]);
    const r = w.eval(`(function(){
      var sent = null; NET.beginMatch = function(settings, roster){ sent = { settings: settings, roster: roster }; };
      SETTINGS.itemRate = 1; AI_LEVEL = 2; stage = STAGES[2]; SETTINGS.mode = 'ffa'; SETTINGS.count = 2;
      NET.startAsHost();
      var msg = NET.sent.filter(function(m){ return m.t==='start'; })[0];
      return { roster: msg.roster, settings: msg.settings, stage: STAGES[2].id };
    })()`);
    expect(r.roster).toEqual(['Pencil', 'Rocky', 'Firey']);
    expect(r.settings).toMatchObject({ itemRate: 1, ai: 2, stage: r.stage, mode: 'ffa' });
    expect(r.settings.count, 'at least the humans in the room').toBe(3);
  });

  it('a client validates every field it is sent', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      var started = 0; var _sm = startMatch; startMatch = function(){ started++; };
      var keep = stage.id;
      NET.players = [{ id:'h' }, { id:'me' }];
      NET.beginMatch({ mode:'hack', count:'999', stocks:-4, teamKey:'<img>', mapSize:'enormous', stage:'nowhere', itemRate:77, ai:'x' }, ['Leafy', 42, 'Nobody']);
      var bad = { mode: SETTINGS.mode, count: SETTINGS.count, stocks: SETTINGS.stocks, teamKey: SETTINGS.teamKey, mapSize: SETTINGS.mapSize, stage: stage.id, keep: keep, itemRate: SETTINGS.itemRate, ai: AI_LEVEL, roster: window.__netRoster };
      NET.beginMatch({ mode:'boss', count:3, stocks:4, teamKey:'2v1', mapSize:'huge', stage: STAGES[1].id, itemRate:0, ai:2 }, ['Pencil','Rocky']);
      var good = { mode: SETTINGS.mode, count: SETTINGS.count, stocks: SETTINGS.stocks, teamKey: SETTINGS.teamKey, mapSize: SETTINGS.mapSize, stage: stage.id, want: STAGES[1].id, itemRate: SETTINGS.itemRate, ai: AI_LEVEL, roster: window.__netRoster };
      startMatch = _sm;
      return { bad: bad, good: good, started: started };
    })()`);
    expect(r.bad).toMatchObject({ mode: 'ffa', count: 20, stocks: 1, mapSize: 'normal', itemRate: 3, ai: 1, roster: ['Leafy', 'Firey', 'Firey'] });
    expect(r.bad.teamKey).not.toBe('<img>');
    expect(r.bad.stage, 'an unknown stadium keeps the current one').toBe(r.bad.keep);
    expect(r.good).toMatchObject({ mode: 'boss', count: 3, stocks: 4, teamKey: '2v1', mapSize: 'huge', itemRate: 0, ai: 2, roster: ['Pencil', 'Rocky'] });
    expect(r.good.stage).toBe(r.good.want);
    expect(r.started).toBe(2);
  });
});

describe('what a client can see', () => {
  it('the snapshot carries items, summons and the Boss Rush count, and the client applies them', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; beginMatchNow();
      items = [{ x:300, y:400, r:12, kind:'heal', taken:false }, { x:500, y:400, r:12, kind:'throw', taken:true }];
      summons = [{ type:'boss', name:'Four', color:'#3a6ea5', r:50, sprite:'four', x:600, y:300, hp:80, maxHp:120, face:-1, flash:0, homeX:600, _rage:0, _tel:0, _bossRush:true, act: function(){} }];
      BOSSRUSH.cleared = 3;
      var snap = JSON.parse(JSON.stringify(serializeState()));
      items = []; summons = []; BOSSRUSH.cleared = 0;
      applySnapshot(snap);
      var err = null; try { drawItem(items[0]); drawSummon(summons[0]); drawBossBar(); } catch(e){ err = e.message; }
      return { items: items.map(function(i){ return i.kind; }), summon: summons[0] && { name: summons[0].name, hp: summons[0].hp, boss: summons[0]._bossRush }, cleared: BOSSRUSH.cleared, err: err };
    })()`);
    expect(r.items, 'a taken item is not sent').toEqual(['heal']);
    expect(r.summon).toEqual({ name: 'Four', hp: 80, boss: true });
    expect(r.cleared).toBe(3);
    expect(r.err).toBe(null);
  });
});

describe('the panel does not wait for the relay', () => {
  // "player 1 cant choose characters, or other settings" (player 1 being the host): the panel used to appear
  // only when the relay's first roster message arrived, so a host whose relay was slow or unreachable saw a
  // room code and nothing to set.
  it('Create Room shows the host every option and the picker before any message arrives', () => {
    const { window: w } = loadMonolith();
    w.eval(`NET.RELAY = ''; localStorage.removeItem('bfsi:relay');   // no relay reachable at all
      NET.myId = 'me'; NET.host();`);
    const r = w.eval(`({ role: NET.role, panel: document.getElementById('lobbySettings').style.display,
      picker: !!document.getElementById('lobbyFighter'), options: !!document.getElementById('lobbyStocks'), start: !!document.querySelector('#lobbyControls button') })`);
    expect(r.role).toBe('host');
    expect(r.panel).toBe('block');
    expect(r.picker).toBe(true);
    expect(r.options).toBe(true);
    expect(r.start, 'and can start').toBe(true);
  });

  it("Join Room shows the picker at once, and the host's settings when they come", () => {
    const { window: w } = loadMonolith();
    w.eval(`NET.RELAY = ''; NET.myId = 'me'; NET.join('QXTR');`);
    const r = w.eval(`({ role: NET.role, picker: !!document.getElementById('lobbyFighter'), options: !!document.getElementById('lobbyStocks'), summary: document.getElementById('lobbySummary').textContent })`);
    expect(r.role).toBe('client');
    expect(r.picker).toBe(true);
    expect(r.options, 'a client does not set the match').toBe(false);
    expect(r.summary).toMatch(/Waiting for the host/);
  });
});
