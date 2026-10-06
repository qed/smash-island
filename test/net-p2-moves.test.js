import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { makeRoom } from './helpers/net-room.js';

// "multiplayer is frozen for p2 when hosting" (the owner, 2026-10-06). The match ran, the host's screen was fine, and the friend who
// joined stood still: p2's keys never moved p2's fighter.
//
// A real host and a real client (test/helpers/net-room.js: two real pages behind a stand-in for the relay), through the lobby the way
// two players use it -- Create Room, Join Room, the host sets the match and presses Start -- and then p2 holds Left. Two things the
// lobby leaves behind kept p2 from moving, each with the match running and p2's fighter standing on the host's screen and on its own:
//
//  1. A FORM CONTROL STILL HAS FOCUS. The keydown handler lets a text box type (the room-code box, a Vault code), so it takes no key
//     at all while a <select>, <input> or <textarea> is the focused element. The lobby is full of them -- the "Your fighter" dropdown,
//     the invite-link box -- and a client's match starts with no gesture of its own (the host's `start` message), so a dropdown the
//     friend opened and closed without choosing was still focused when the arena came up, and every key of the match went to it.
//     (A browser that hides a focused control is supposed to clear the focus a tick later. Chromium does; jsdom, which these pages run
//     in, does not; the rest are not known here. The game no longer leans on it: beginMatchNow lets go of the control itself.)
//  2. (THE TOUCH PAD NEVER ROSE: the pad stayed hidden for every match. The owner removed the touch pad, 2026-10-06, "I SAID I
//     WANTED THIS TO BE A COMPUTER GAME!!!" -- test/computer-only.test.js -- so there is nothing left to pin.)
//
// What stays true, and is pinned here too: a text box the player really is typing into does not feed the game keys.

let room, H, A;
beforeAll(async () => {
  room = await makeRoom(['H', 'A']); ({ H, A } = room.pages);
}, 180000);
// every test starts from a page nobody is holding a key on, with no control focused
beforeEach(() => {
  for (const w of [H, A]) w.eval(`for (var k in down) down[k] = false; if (document.activeElement && document.activeElement.blur) document.activeElement.blur();`);
});

const click = (w, selector) => w.eval(`document.querySelector(${JSON.stringify(selector)}).click()`);
const key = (w, code, isDown) => w.dispatchEvent(new w.KeyboardEvent(isDown ? 'keydown' : 'keyup', { code, bubbles: true }));
const run = (n) => { for (let i = 0; i < n; i++) room.frame(); };
const hostSees = () => H.eval('fighters[1].x');   // p2's fighter on the host: where the match really has it
const p2Sees = () => A.eval(`fighters.find(function(f){ return f.idx === NET.myIdx; }).x`);   // ...and on p2's own screen
const focused = (w) => w.eval(`document.activeElement ? document.activeElement.tagName + (document.activeElement.id ? '#' + document.activeElement.id : '') : 'none'`);

// Two players, the way they do it: the host creates a room, the friend joins it, the host sets the match and presses Start.
// `inLobby` is whatever the friend did on their lobby screen while the host was getting ready.
function hostedMatch({ mode = 'ffa', count = 2, teamKey = null, inLobby = () => {} } = {}) {
  room.reset();
  const code = room.host('H', 'Pen');
  room.join('A', code, 'Firey');
  if (mode === 'teams') click(H, '#lobbyMode button[data-v="teams"]');
  click(H, `#lobbyCount button[data-v="${count}"]`);
  if (teamKey) click(H, `#lobbyTeams button[data-v="${teamKey}"]`);
  room.flush();
  inLobby();
  click(H, '#lobbyControls button');   // Start Match
  room.flush();
  expect(H.eval('running') && A.eval('running'), 'the match is running on both screens').toBe(true);
}

// p2 holds Left for a second on the keyboard, and this is how far p2's fighter went, as the host has it and as p2 sees it.
function p2WalksLeft() {
  run(20);
  const h0 = hostSees(), c0 = p2Sees();
  const left = A.eval('KEYS.left');
  key(A, left, true);
  run(60);
  key(A, left, false);
  return { host: hostSees() - h0, client: p2Sees() - c0 };
}
const walked = (r, label) => {
  expect(r.host, label + ': p2 moved on the host\'s screen').toBeLessThan(-150);
  expect(r.client, label + ': ...and on its own').toBeLessThan(-150);
};

const MATCHES = [['FFA', { mode: 'ffa', count: 2 }], ['Teams 1v1', { mode: 'teams', count: 2, teamKey: '1v1' }]];

describe.each(MATCHES)('%s: p2 holds Left in a hosted match', (_name, setup) => {
  it('walks, with nothing touched in the lobby', () => {
    hostedMatch(setup);
    walked(p2WalksLeft(), 'untouched lobby');
  }, 120000);

  it('walks after picking a fighter from the dropdown', () => {
    hostedMatch({ ...setup, inLobby: () => { A.eval(`(function(){ var s = document.getElementById('lobbyFighter'); s.focus(); s.value = 'Leafy'; s.dispatchEvent(new Event('change')); })()`); room.flush(); } });
    walked(p2WalksLeft(), 'after a pick');
  }, 120000);

  it('walks although the fighter dropdown was opened and closed without choosing, and still has the focus', () => {
    hostedMatch({ ...setup, inLobby: () => { A.eval(`document.getElementById('lobbyFighter').focus()`); expect(focused(A), 'the dropdown holds the focus in the lobby').toBe('SELECT#lobbyFighter'); } });
    walked(p2WalksLeft(), 'a focused dropdown');
    expect(focused(A), 'the match took the focus off it').toBe('BODY');
  }, 120000);

  it('walks although the invite-link box was clicked into (to copy it by hand)', () => {
    hostedMatch({ ...setup, inLobby: () => { A.eval(`document.getElementById('inviteLink').focus()`); expect(focused(A), 'the box holds the focus in the lobby').toBe('INPUT#inviteLink'); } });
    walked(p2WalksLeft(), 'a focused invite-link box');
    expect(focused(A), 'the match took the focus off it').toBe('BODY');
  }, 120000);
});

describe('a text box still takes the typing', () => {
  it('the room-code box does not turn typed letters into game keys', () => {
    room.reset();
    A.eval(`document.getElementById('joinAddr').focus()`);   // the friend is typing the code
    key(A, 'KeyX', true); key(A, 'ArrowLeft', true);
    expect(A.eval(`!!down.KeyX || !!down.ArrowLeft`), 'a key typed into a text box is not a game key').toBe(false);
    key(A, 'KeyX', false); key(A, 'ArrowLeft', false);
  }, 120000);

  it('...and a friend who joined with that box still focused plays the match with the keyboard', () => {
    room.reset();
    A.eval(`document.getElementById('joinAddr').focus()`);
    const code = room.host('H', 'Pen');
    room.join('A', code, 'Firey');
    click(H, '#lobbyControls button'); room.flush();
    key(A, 'ArrowLeft', true);
    expect(A.eval(`!!down.ArrowLeft`), 'a key in a match is a game key').toBe(true);
    key(A, 'ArrowLeft', false);
    expect(focused(A), 'the match took the focus off the box').toBe('BODY');
  }, 120000);

  it('a lobby pick lets go of the control that had the focus', () => {
    room.reset();
    const code = room.host('H', 'Pen');
    room.join('A', code, 'Firey');
    A.eval(`document.getElementById('joinAddr').focus()`);   // a control the pick itself does not redraw
    expect(focused(A)).toBe('INPUT#joinAddr');
    room.pick('A', 'Pencil');
    expect(focused(A), 'the pick took the focus off it').toBe('BODY');
  }, 120000);
});
