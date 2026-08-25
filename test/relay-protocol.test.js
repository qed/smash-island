import { describe, it, expect } from 'vitest';
import { normalizeRoom, rosterOf, applyHello, routeMessage } from '../relay/src/protocol.js';

// The relay's routing rules, tested away from the Workers runtime. relay/src/index.js is the thin
// Durable Object wiring around exactly these four functions.

describe('room codes are clamped before they name a Durable Object', () => {
  it('keeps a normal game code', () => {
    expect(normalizeRoom('QXTR')).toBe('QXTR');
  });

  it('uppercases and strips punctuation, so one room is not two', () => {
    expect(normalizeRoom('qx-tr')).toBe('QXTR');
    expect(normalizeRoom(' qxtr ')).toBe('QXTR');
  });

  it('bounds an arbitrary code from the wire', () => {
    // The code names the object. Unbounded input is an unbounded number of Durable Objects an
    // anonymous caller can bring into existence.
    expect(normalizeRoom('A'.repeat(500)).length).toBe(8);
    // Stripped to ETCPASSWD, then capped at 8 — the point being that it names one bounded object
    // rather than carrying path syntax through to idFromName.
    expect(normalizeRoom('../../etc/passwd')).toBe('ETCPASSW');
  });

  it('falls back rather than naming an object the empty string', () => {
    expect(normalizeRoom('')).toBe('LOBBY');
    expect(normalizeRoom(null)).toBe('LOBBY');
    expect(normalizeRoom('!!!')).toBe('LOBBY');
  });
});

describe('the roster puts the host first', () => {
  // Load-bearing: the monolith's host hardcodes myIdx = 0 while clients read their index out of
  // this array. A host anywhere but position 0 means two players piloting one fighter.
  it('hoists the host above earlier joiners', () => {
    const players = rosterOf([
      { id: 'aaa', name: 'Leafy', seq: 1, isHost: false },
      { id: 'bbb', name: 'Firey', seq: 2, isHost: true },
      { id: 'ccc', name: 'Pen', seq: 3, isHost: false },
    ]);
    expect(players.map(p => p.id)).toEqual(['bbb', 'aaa', 'ccc']);
    expect(players[0].isHost).toBe(true);
  });

  it('orders everyone else by when they connected', () => {
    const players = rosterOf([
      { id: 'ccc', seq: 30, isHost: false },
      { id: 'aaa', seq: 10, isHost: false },
      { id: 'bbb', seq: 20, isHost: false },
    ]);
    expect(players.map(p => p.id)).toEqual(['aaa', 'bbb', 'ccc']);
  });

  it('drops connections that have not said hello yet', () => {
    // A socket exists from the moment it is accepted, but it has no identity until `hello`. Listing
    // it would put a nameless slot in the lobby and shift everyone's fighter index.
    const players = rosterOf([{ id: null, seq: 1 }, { id: 'aaa', seq: 2 }]);
    expect(players.map(p => p.id)).toEqual(['aaa']);
  });

  it('is deterministic when two peers tie on seq', () => {
    const a = rosterOf([{ id: 'zzz', seq: 5 }, { id: 'aaa', seq: 5 }]);
    const b = rosterOf([{ id: 'aaa', seq: 5 }, { id: 'zzz', seq: 5 }]);
    expect(a.map(p => p.id)).toEqual(b.map(p => p.id));
  });
});

describe('only one host per room', () => {
  it('grants the host slot to the first claimant', () => {
    const { peer, refusedHost } = applyHello({ id: 'aaa', host: true, name: 'Firey' }, { seq: 1 }, []);
    expect(peer.isHost).toBe(true);
    expect(refusedHost).toBe(false);
  });

  it('demotes a second claimant to a player instead of dropping them', () => {
    // Two hosts would both broadcast `state` at ~22/sec and every client would be torn between two
    // authoritative worlds.
    const peers = [{ id: 'aaa', isHost: true, seq: 1 }];
    const { peer, refusedHost } = applyHello({ id: 'bbb', host: true }, { seq: 2 }, peers);
    expect(peer.isHost).toBe(false);
    expect(refusedHost, 'the client is told why').toBe(true);
  });

  it('lets the same id re-announce itself as host', () => {
    // A reconnecting host must not be locked out of its own room by its previous connection.
    const peers = [{ id: 'aaa', isHost: true, seq: 1 }];
    const { peer } = applyHello({ id: 'aaa', host: true }, { seq: 2 }, peers);
    expect(peer.isHost).toBe(true);
  });

  it('bounds the name and id it will store', () => {
    const { peer } = applyHello({ id: 'x'.repeat(200), name: 'y'.repeat(200) }, { seq: 1 }, []);
    expect(peer.id.length).toBe(32);
    expect(peer.name.length).toBe(24);
  });
});

describe('routing', () => {
  const host = { id: 'aaa', isHost: true };
  const client = { id: 'bbb', isHost: false };

  it('sends inputs to the host and nobody else', () => {
    // Broadcasting them would hand every player a live feed of everyone else's controls.
    expect(routeMessage({ t: 'input', idx: 1, input: {} }, client).to).toBe('host');
  });

  it('broadcasts the host snapshot to everyone else', () => {
    expect(routeMessage({ t: 'state', s: {} }, host).to).toBe('others');
  });

  it('refuses a state snapshot from a client', () => {
    // Otherwise any peer could overwrite every other player's world with a state of its choosing.
    const r = routeMessage({ t: 'state', s: {} }, client);
    expect(r.to).toBe('none');
    expect(r.reason).toBe('not-host');
  });

  it('refuses a match start from a client', () => {
    expect(routeMessage({ t: 'start', settings: {}, roster: [] }, client).to).toBe('none');
    expect(routeMessage({ t: 'start', settings: {}, roster: [] }, host).to).toBe('others');
  });

  it('routes nothing before hello', () => {
    // `input` carries a fighter index we would otherwise be taking entirely on trust.
    const r = routeMessage({ t: 'input', idx: 0 }, { id: null });
    expect(r.to).toBe('none');
    expect(r.reason).toBe('before-hello');
  });

  it('drops malformed and unknown frames rather than forwarding them', () => {
    expect(routeMessage(null, host).to).toBe('none');
    expect(routeMessage({}, host).to).toBe('none');
    expect(routeMessage({ t: 'eval', code: '1' }, host).to).toBe('none');
  });
});
