import { describe, it, expect, beforeAll } from 'vitest';
import { makeRoom } from './helpers/net-room.js';

// "make the ui more optimised for multiplayer" (2026-10-05), the online lobby: Create Room / Join Room shows who has joined and the
// fighter each picked BEFORE the match starts, the same list on the host and on every client, live as people join, leave and
// pick; the room code is big and copyable; the host starts and the clients see they are waiting.
//
// Before: the list was a row of text chips ("1. Pen (you)") under the Create / Join boxes, the room code was a line of ordinary
// text that only the host had, and the Create / Join boxes stayed on screen above both.
//
// "optimise the multiplayer character select UI" (2026-10-07) changed the screen again: the fighter picker is a GRID of portraits (it was
// a dropdown) and each player's pick wears their P-badge on its portrait, live; the room code is one line across the top (it was a big
// card, with a link box); and the players, the picker and the settings share one screen. The pins below say the same things through it:
// a pick is a click on a portrait, the pick shows on every screen as a badge as well as on the player's row, and the picker is never
// rebuilt under anyone.
//
// The pages are real (test/helpers/net-room.js): each is the unmodified game in its own jsdom realm, joined by a stand-in for the
// relay that routes with relay/src/protocol.js -- so a pick travels exactly as it does online: the `name` of a hello, which the
// relay turns into the roster every page receives. Nothing here talks to a network.

let room, H, A, B;
beforeAll(async () => { room = await makeRoom(['H', 'A', 'B']); ({ H, A, B } = room.pages); }, 180000);

const three = () => { room.reset(); const code = room.host('H', 'Pen'); room.join('A', code, 'Leafy'); room.join('B', code, 'Blocky'); return code; };
const bare = (list) => list.map(({ you, text, ...rest }) => ({ ...rest, name: text.replace(' (you)', '') }));   // a list without which card is "you"

describe('who is in the room', () => {
  it('lists every player who joined and the fighter each picked, the same on the host and on every client', () => {
    three();
    const lists = { H: room.roster('H'), A: room.roster('A'), B: room.roster('B') };
    for (const n of ['H', 'A', 'B']) {
      expect(lists[n].map((p) => p.fighter), n + ' sees every fighter').toEqual(['Pen', 'Leafy', 'Blocky']);
      expect(lists[n].map((p) => p.label), n + ' sees the slots').toEqual(['P1', 'P2', 'P3']);
      expect(lists[n].map((p) => p.host), n + ' sees who the host is').toEqual([true, false, false]);
    }
    // one card is yours on each screen, and it is the right one
    expect(lists.H.map((p) => p.you)).toEqual([true, false, false]);
    expect(lists.A.map((p) => p.you)).toEqual([false, true, false]);
    expect(lists.B.map((p) => p.you)).toEqual([false, false, true]);
    expect(lists.A[1].text).toBe('Leafy (you)');
    // ...and apart from that it is one list
    expect(bare(lists.A)).toEqual(bare(lists.H));
    expect(bare(lists.B)).toEqual(bare(lists.H));
    for (const w of [H, A, B]) expect(w.document.querySelector('#lobbyRoster .lobbyhead').textContent).toMatch(/3 players/);
  });

  it("a player's pick shows on every other screen at once, and nobody's open picker is rebuilt under them", () => {
    three();
    // what each screen is holding on to: the host's stadium list, a client's own fighter picker (the grid, and every portrait in it)
    H.eval(`window.__stage = document.getElementById('lobbyStage'); 1`);
    B.eval(`window.__picker = document.getElementById('lobbyFighter'); window.__cells = [].slice.call(document.querySelectorAll('#lobbyFighter .lgcell')); 1`);
    room.pick('A', 'Pencil');
    for (const n of ['H', 'A', 'B']) expect(room.roster(n).map((p) => p.fighter), n).toEqual(['Pen', 'Pencil', 'Blocky']);
    expect(H.eval(`document.getElementById('lobbyStage') === window.__stage`), "a friend's pick did not redraw the host's controls").toBe(true);
    const same = `document.getElementById('lobbyFighter') === window.__picker && window.__cells.length > 40 && window.__cells.every(function(c, i){ return document.querySelectorAll('#lobbyFighter .lgcell')[i] === c; })`;
    expect(B.eval(same), "...or another client's picker (the grid and every portrait in it are the same elements)").toBe(true);
    room.pick('B', 'Firey');
    for (const n of ['H', 'A', 'B']) expect(room.roster(n).map((p) => p.fighter), n).toEqual(['Pen', 'Pencil', 'Firey']);
    expect(B.eval(same), '...after more picks as well').toBe(true);
  });

  it("the grid's portraits are fetched when the lobby is shown, not when the page loads", () => {
    three();
    const state = (w) => JSON.parse(w.eval(`JSON.stringify({ src: document.querySelectorAll('#lobbyFighter img[src]').length, waiting: document.querySelectorAll('#lobbyFighter img[data-src]').length })`));
    expect(state(B), 'the lobby is up: every portrait has its render').toMatchObject({ waiting: 0 });
    expect(state(B).src).toBeGreaterThan(40);
    // the grid built while another screen is showing (a roster message that lands while another screen is up) holds its renders back until the lobby comes up
    B.eval(`go('options'); document.getElementById('lobbyFighter').dataset.sig = ''; NET.renderFighterGrid();`);
    expect(state(B)).toMatchObject({ src: 0 });
    expect(state(B).waiting).toBeGreaterThan(40);
    B.eval(`go('lobby')`);
    expect(state(B)).toMatchObject({ waiting: 0 });
    expect(state(B).src).toBeGreaterThan(40);
  });

  it("each player's pick wears their P-badge on its portrait, the same on every screen, two players on one fighter stack theirs, and your own is picked out", () => {
    three();
    const badges = (w) => JSON.parse(w.eval(`JSON.stringify([].map.call(document.querySelectorAll('#lobbyFighter .lgcell'), function(c){
      return [c.dataset.fighter, [].map.call(c.querySelectorAll('.lgbadge'), function(b){ return b.textContent + (b.classList.contains('you') ? '*' : ''); }), c.classList.contains('sel')]; }).filter(function(r){ return r[1].length || r[2]; }))`));
    // Pen (host, P1), Leafy (P2), Blocky (P3): each screen shows all three, and its own slot starred; the portrait picked is the one wearing the star
    const norm = (w) => badges(w).map((r) => r[0] + ':' + r[1].join('+') + ':' + r[2]).sort();
    expect(norm(H)).toEqual(['Blocky:P3:false', 'Leafy:P2:false', 'Pen:P1*:true']);
    expect(norm(A)).toEqual(['Blocky:P3:false', 'Leafy:P2*:true', 'Pen:P1:false']);
    expect(norm(B)).toEqual(['Blocky:P3*:true', 'Leafy:P2:false', 'Pen:P1:false']);
    // a friend picks the host's fighter: the portrait wears both badges, on every screen, and it is still only the host's own that is picked out
    room.pick('A', 'Pen');
    for (const n of ['H', 'A', 'B']) {
      const pen = badges(room.pages[n]).find((r) => r[0] === 'Pen');
      expect(pen[1].map((b) => b.replace('*', '')), n + ': both badges on one portrait, in slot order').toEqual(['P1', 'P2']);
      expect(badges(room.pages[n]).find((r) => r[0] === 'Leafy'), n + ': the fighter nobody holds has no badge').toBeUndefined();
    }
    expect(badges(A).find((r) => r[0] === 'Pen')[1], 'A has picked Pen and is P2').toEqual(['P1', 'P2*']);
    // a player who leaves takes their badge with them
    room.vanish('B');
    expect(badges(H).map((r) => r[0]).sort(), 'Blocky is nobody\'s pick now').toEqual(['Pen']);
  });

  it('your own card changes the moment you pick, before the relay has said anything', () => {
    three();
    A.eval(`NET.ws.send = function(){};   // the relay hears nothing
      [].filter.call(document.querySelectorAll('#lobbyFighter .lgcell'), function(c){ return c.dataset.fighter === 'Match'; })[0].click();`);
    expect(room.roster('A').map((p) => p.fighter)).toEqual(['Pen', 'Match', 'Blocky']);
    expect(room.roster('H').map((p) => p.fighter), 'and nobody else is told something the relay did not say').toEqual(['Pen', 'Leafy', 'Blocky']);
  });

  it('...but not when the socket is closed, which tells nobody: a pick nobody heard is not on your card', () => {
    three();
    A.eval(`NET.ws.readyState = 3;
      [].filter.call(document.querySelectorAll('#lobbyFighter .lgcell'), function(c){ return c.dataset.fighter === 'Match'; })[0].click();`);
    expect(room.roster('A').map((p) => p.fighter)).toEqual(['Pen', 'Leafy', 'Blocky']);
  });

  it('a new player takes a card and the host gets their contestant count to match, live', () => {
    room.reset();
    const code = room.host('H', 'Pen');
    expect(room.roster('H').map((p) => p.fighter)).toEqual(['Pen']);
    expect(H.document.querySelector('#lobbyRoster .lobbyhead').textContent).toMatch(/1 player\b/);
    room.join('A', code, 'Leafy'); room.join('B', code, 'Blocky');
    const counts = JSON.parse(H.eval(`JSON.stringify([].map.call(document.querySelectorAll('#lobbyCount button'), function(b){ return +b.dataset.v; }))`));
    expect(Math.min(...counts), 'never fewer contestants than humans').toBeGreaterThanOrEqual(3);
    expect(H.document.querySelector('#lobbyControls button').textContent, 'the Start button counts the room').toMatch(/3 humans/);
  });

  it('a pick the room cannot play is shown as Firey, which is what the host starts the match with', () => {
    three();
    A.eval(`NET.send({ t: 'hello', id: NET.myId, host: false, name: 'NotAFighter' });`);
    room.flush();
    for (const n of ['H', 'A', 'B']) expect(room.roster(n).map((p) => p.fighter), n).toEqual(['Pen', 'Firey', 'Blocky']);
    const start = H.eval(`(function(){ var keep = NET.beginMatch; NET.beginMatch = function(){}; NET.startAsHost(); NET.beginMatch = keep;
      return NET.players.length; })()`);
    expect(start).toBe(3);
    const sent = room.relay.log.filter((m) => m.msg.t === 'start').pop().msg;
    expect(sent.roster, 'the lineup the start carries is the lobby\'s list').toEqual(room.roster('H').map((p) => p.fighter));
  });

  it('a player who leaves is gone from every screen, and their own screen is back to Create / Join', () => {
    three();
    B.eval(`NET.leaveRoom()`);
    room.flush();
    for (const n of ['H', 'A']) {
      expect(room.roster(n).map((p) => p.fighter), n).toEqual(['Pen', 'Leafy']);
      expect(room.pages[n].document.querySelector('#lobbyRoster .lobbyhead').textContent).toMatch(/2 players/);
    }
    expect(H.document.querySelector('#lobbyControls button').textContent).toMatch(/2 humans/);
    const gone = B.eval(`({ role: NET.role, chooser: document.getElementById('lobbyChooser').style.display, cards: document.querySelectorAll('#lobbyRoster .lobbyplayer').length,
      code: document.getElementById('lobbyInvite').style.display, settings: document.getElementById('lobbySettings').style.display, ctl: document.getElementById('lobbyControls').children.length })`);
    expect(gone).toEqual({ role: 'solo', chooser: '', cards: 0, code: 'none', settings: 'none', ctl: 0 });
    // a tab that simply closes, with no goodbye, is the same to everyone left
    room.vanish('A');
    expect(room.roster('H').map((p) => p.fighter)).toEqual(['Pen']);
    expect(H.document.querySelector('#lobbyRoster .lobbyhead').textContent).toMatch(/1 player\b/);
  });

  it('says who is here on the line under the title, on every screen', () => {
    three();
    expect(H.document.getElementById('lobbyStatus').textContent).toBe('Hosting — 3 players in the room');
    for (const w of [A, B]) expect(w.document.getElementById('lobbyStatus').textContent).toMatch(/^Joined room [A-Z0-9]{4} — waiting for the host$/);
    room.vanish('A'); room.vanish('B');
    expect(H.document.getElementById('lobbyStatus').textContent).toBe('Hosting — waiting for players');
  });

  it('a mistyped code lands in a room nobody hosts, and says so instead of waiting for a host who is not coming', () => {
    room.reset();
    room.join('A', 'ZZZZ', 'Leafy');
    expect(room.roster('A').map((p) => p.fighter)).toEqual(['Leafy']);
    expect(A.document.getElementById('lobbyWait').textContent).toMatch(/Nobody is hosting room ZZZZ/);
    expect(A.document.getElementById('lobbyStatus').textContent, 'and the line under the title agrees').toBe('Room ZZZZ has no host');
    // ...and when a host does arrive, it is an ordinary room again
    H.eval(`window.__code = NET.makeRoomCode; NET.makeRoomCode = function(){ return 'ZZZZ'; }`);
    room.host('H', 'Pen');
    H.eval(`NET.makeRoomCode = window.__code;`);
    expect(room.roster('A').map((p) => p.host)).toEqual([true, false]);
    expect(A.document.getElementById('lobbyWait').textContent).toMatch(/Waiting for the host to start the match/);
    expect(A.document.getElementById('lobbyStatus').textContent).toBe('Joined room ZZZZ — waiting for the host');
  });

  it("leaving a room forgets its settings: the next room shows none until its own host sends them", () => {
    three();
    expect(B.document.getElementById('lobbySummary').textContent).toMatch(/contestants/);
    B.eval(`NET.leave()`); room.flush();   // (the way Back and the title leave: no Leave room button)
    room.join('B', 'QQQQ', 'Blocky');   // a room with no host in it
    expect(B.document.getElementById('lobbySummary').textContent).toMatch(/Waiting for the host's match settings/);
  });

  it('with no relay to dial, Create Room says why, and shows neither a room code that exists nowhere nor a room of one', () => {
    room.reset();
    const r = JSON.parse(H.eval(`(function(){
      var real = NET.wsURL; NET.wsURL = function(){ return null; };   // the desktop build before a relay is set (netcode-relay-url.test.js)
      openLobby(); NET.host(); NET.wsURL = real;
      return JSON.stringify({ role: NET.role, status: document.getElementById('lobbyStatus').textContent, card: document.getElementById('lobbyInvite').style.display,
        cards: document.querySelectorAll('#lobbyRoster .lobbyplayer').length, chooser: document.getElementById('lobbyChooser').style.display });
    })()`));
    expect(r.role).toBe('solo');
    expect(r.status, 'the reason, not "Room code: ..."').toMatch(/relay/i);
    expect(r).toMatchObject({ card: 'none', cards: 0, chooser: '' });
  });

  it('the Create / Join boxes step aside once you are in a room, and come back when you leave it', () => {
    room.reset();
    const shown = (w) => w.eval(`document.getElementById('lobbyChooser').style.display`);
    expect(shown(H), 'before').toBe('');
    const code = room.host('H', 'Pen');
    expect(shown(H), 'a host in a room').toBe('none');
    room.join('A', code, 'Leafy');
    expect(shown(A), 'a client in a room').toBe('none');
    H.eval(`NET.leaveRoom()`); room.flush();
    expect(shown(H), 'after leaving').toBe('');
    expect(H.eval(`NET.role`)).toBe('solo');
  });
});

describe('the room code', () => {
  const stubClipboard = (w, mode) => w.eval(`(function(){
    window.__copied = []; window.__exec = [];
    document.execCommand = function(c){ window.__exec.push({ c: c, sel: String(getSelection()) }); return ${mode === 'noexec' ? 'false' : 'true'}; };
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: ${
      mode === 'api' ? "{ writeText: function(t){ window.__copied.push(t); return Promise.resolve(); } }"
      : mode === 'refuse' ? "{ writeText: function(){ return Promise.reject(new Error('NotAllowedError')); } }" : 'undefined' } });
    return true; })()`);
  const tick = () => new Promise((r) => setTimeout(r, 0));
  const state = (w) => w.eval(`({ code: document.getElementById('roomCode').textContent, btn: document.getElementById('copyCodeBtn').textContent,
    link: document.getElementById('copyLinkBtn').textContent, status: document.getElementById('lobbyStatus').textContent,
    copied: window.__copied.slice(), exec: window.__exec.slice() })`);

  it('is shown on one line across the top, to the host and to every player who joined', () => {
    const code = three();
    expect(code).toMatch(/^[A-Z0-9]{4}$/);
    for (const w of [H, A, B]) {
      const r = w.eval(`({ code: document.getElementById('roomCode').textContent, box: document.getElementById('lobbyInvite').style.display, cls: document.getElementById('roomCode').className })`);
      expect(r).toEqual({ code, box: 'block', cls: 'inv-code' });
    }
    // "Room QZXK [Copy code] [Copy link]": the owner shrank the big card to one line (2026-10-07), so the code is no longer 68px. It is still the
    // biggest thing on its line, as big as the title, spaced out in a monospace face and picked whole by one click: easy to read out.
    expect(H.eval(`document.getElementById('roomCode').parentNode.className`), 'the label, the code, the hint and the buttons are one row').toBe('inv-line');
    const css = H.eval(`[].map.call(document.querySelectorAll('style'), function(s){ return s.textContent; }).join('\\n')`);
    const size = /\.inv-code\{[^}]*font-size:(\d+)px/.exec(css);
    expect(size, 'the code has a size of its own').not.toBeNull();
    expect(+size[1], 'as big as the lobby title').toBeGreaterThanOrEqual(+/\.lobbytop h1\{[^}]*font-size:(\d+)px/.exec(css)[1]);
    expect(css).toMatch(/\.inv-code\{[^}]*letter-spacing/);
    expect(css).toMatch(/\.inv-code\{[^}]*user-select:all/);
    // jsdom has no layout, so the guarantee is the rules that make it: nothing in the lobby is wider than its screen
    expect(css, 'the room line gives way (the hint is cut short) before it pushes the screen wider').toMatch(/\.inv-sub\{[^}]*min-width:0[^}]*text-overflow:ellipsis/);
    expect(css, 'the players have a column of their own, and the picker is the one that flexes').toMatch(/\.lobbyroster\{[^}]*flex:0 0 288px/);
    expect(css).toMatch(/\.lobbypicker\{[^}]*min-width:0/);
    expect(css, 'a long fighter name is cut short rather than pushing the card wider').toMatch(/\.lpname\{[^}]*text-overflow:ellipsis/);
  });

  it('copies the code, and the link, with the clipboard', async () => {
    const code = three();
    for (const w of [H, B]) {
      stubClipboard(w, 'api');
      w.eval(`document.getElementById('copyCodeBtn').click()`);
      await tick();
      let s = state(w);
      expect(s.copied, 'the code, and only the code').toEqual([code]);
      expect(s.btn).toBe('✓ Copied!');
      expect(s.status).toMatch(/Room code copied/);
      w.eval(`document.getElementById('copyLinkBtn').click()`);
      await tick();
      s = state(w);
      expect(s.copied[1]).toBe('http://localhost/#room=' + code);
      expect(s.link).toBe('✓ Copied!');
    }
  });

  it('there is no link box any more, and Copy link still copies the link: by hand from a field made for the instant when the clipboard refuses', async () => {
    const code = three(), link = 'http://localhost/#room=' + code;
    expect(H.eval(`!!document.getElementById('inviteLink') || !!document.querySelector('#lobbyInvite input')`), 'the long link field is gone').toBe(false);
    const btn = (w) => w.eval(`document.getElementById('copyLinkBtn').textContent`);
    stubClipboard(H, 'refuse');
    // even the browser's own copy command fails: the status line hands over the link to copy by hand, and the button does not say it was copied
    H.eval(`document.execCommand = function(){ return false; };`);
    H.eval(`document.getElementById('copyLinkBtn').click()`);
    await tick(); await tick();
    expect(H.eval(`document.getElementById('lobbyStatus').textContent`)).toBe('Copy it by hand: ' + link);
    expect(btn(H), 'nothing was copied, so the button does not say it was').toBe('🔗 Copy link');
    // the copy command works: it is asked to copy a field holding the link, and the field is gone again
    H.eval(`window.__exec = []; document.execCommand = function(c){ var a = document.activeElement; window.__exec.push({ c: c, tag: a.tagName, val: a.value }); return true; };`);
    H.eval(`document.getElementById('copyLinkBtn').click()`);
    await tick(); await tick();
    expect(H.eval(`window.__exec`)).toEqual([{ c: 'copy', tag: 'TEXTAREA', val: link }]);
    expect(btn(H)).toBe('✓ Copied!');
    expect(H.eval(`document.querySelectorAll('textarea').length`), 'and the field is gone again').toBe(0);
  });

  it('a clipboard that refuses, or is missing, selects the code and asks the browser to copy it; and never says "copied" when nothing was', async () => {
    const code = three();
    stubClipboard(H, 'refuse');
    H.eval(`document.getElementById('copyCodeBtn').click()`);
    await tick(); await tick();
    let s = state(H);
    expect(s.exec).toEqual([{ c: 'copy', sel: code }]);   // the code was selected when the copy command ran
    expect(s.btn).toBe('✓ Copied!');

    stubClipboard(A, 'none');
    A.eval(`document.getElementById('copyCodeBtn').click()`);
    s = state(A);
    expect(s.exec).toEqual([{ c: 'copy', sel: code }]);
    expect(s.status).toMatch(/Room code copied/);

    stubClipboard(B, 'noexec');
    B.eval(`document.getElementById('copyCodeBtn').click()`);
    s = state(B);
    expect(s.btn, 'nothing was copied, so the button does not say it was').toBe('📋 Copy code');
    expect(s.status).toMatch(/copy it by hand/);
  });
});

describe('the host starts, the clients wait', () => {
  it('the host has Start, a client is told the host decides, and both have the way out', () => {
    three();
    const host = H.eval(`({ start: document.querySelector('#lobbyControls button').textContent, wait: !!document.getElementById('lobbyWait'), leave: !!document.getElementById('leaveRoomBtn') })`);
    expect(host).toEqual({ start: 'Start Match ▶ (3 humans)', wait: false, leave: true });
    for (const w of [A, B]) {
      const c = w.eval(`({ buttons: [].map.call(document.querySelectorAll('#lobbyControls button'), function(b){ return b.textContent; }), wait: (document.getElementById('lobbyWait')||{}).textContent })`);
      expect(c.wait).toMatch(/Waiting for the host to start the match/);
      expect(c.buttons, 'a client cannot start the match').toEqual(['Leave room']);
    }
  });

  it('starting plays the lineup the lobby showed, and puts nothing of the lobby on screen during the match', () => {
    three();
    const lobby = room.roster('A').map((p) => p.fighter);
    const held = (w) => w.eval(`document.getElementById('lobbyRoster').innerHTML`);
    H.eval(`document.querySelector('#lobbyControls button').click()`);
    room.flush();
    for (const [n, w] of Object.entries(room.pages)) {
      const m = w.eval(`({ running: running, names: fighters.slice(0, 3).map(function(f){ return f.name; }), screens: [].map.call(document.querySelectorAll('.screen.active'), function(s){ return s.id; }) })`);
      expect(m.running, n).toBe(true);
      expect(m.names, n + ': the match is the lobby\'s list').toEqual(lobby);
      expect(m.screens, n + ': no menu screen is up during a match').toEqual([]);
    }
    // a few frames, so the host streams and the clients draw
    for (let i = 0; i < 4; i++) { H.eval('loop()'); room.flush(); A.eval('loop()'); B.eval('loop()'); room.flush(); }
    // The only text on screen is the match's own (the HUD cards, the banner): nothing the lobby or the results added.
    const visibleText = (w) => JSON.parse(w.eval(`JSON.stringify((function(){ var out = [];
      (function walk(n){
        if(n.nodeType === 3){ var t = n.nodeValue.trim(); if(t) out.push(t); return; }
        if(n.nodeType !== 1) return;
        if(n.tagName === 'SCRIPT' || n.tagName === 'STYLE' || n.tagName === 'HEAD') return;
        if(n.classList.contains('screen') && !n.classList.contains('active')) return;
        if(n.style && n.style.display === 'none') return;
        for(var c = n.firstChild; c; c = c.nextSibling) walk(c);
      })(document.body); return out; })())`));
    const NEW = /Room code|In the room|Leave room|Waiting for the host|Copy code|Copy link|Start Match|Joining the room|\bHOST\b|\(you\)|Players|Damage|KOs/;
    for (const [n, w] of Object.entries(room.pages)) {
      const text = visibleText(w);
      expect(text.filter((t) => NEW.test(t)), n + ' shows nothing of the lobby or results mid-match').toEqual([]);
    }
    // and a player dropping mid-match leaves the lobby's page alone (the roster is only "who is still here")
    const before = held(H), banner = H.eval(`document.getElementById('banner').textContent`);
    room.vanish('B');
    expect(held(H), 'the lobby is not redrawn in a match').toBe(before);
    expect(H.eval(`document.getElementById('banner').textContent`), 'and says nothing on screen').toBe(banner);
  });
});
