// Pure protocol logic for the Smash Island relay.
//
// Deliberately free of Durable Object / Workers APIs so it can be tested with the project's plain
// vitest suite instead of a Workers runtime (see test/relay-protocol.test.js). index.js is the thin
// wiring that calls into here.
//
// The relay invents no messages. It forwards exactly the set the monolith already speaks:
//   client -> relay : hello | input | state | start
//   relay  -> client: roster | input | state | start | status
// The only consumer is NET.onMessage in artifacts/V1/index.html, so anything changed here has to
// keep matching that function.

// A room code is the shard key. Codes come off the wire from anyone, so they are clamped to the
// alphabet the game generates (NET.makeRoomCode: no vowels, no 0/O/1/I) before being used to name a
// Durable Object — an unbounded code is an unbounded number of objects an anonymous caller can
// create.
export function normalizeRoom(raw) {
  const code = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  return code || 'LOBBY';
}

// The lobby list every client renders, and — load-bearing — the ORDER fighters are assigned in.
//
// The monolith's host hardcodes `myIdx = 0` (NET.host) while each client takes its index from its
// position in this array (NET.onMessage, case "roster"). So if the host is not first, the host and
// whoever *is* first both believe they control fighter 0: two players on one body, and the fighter
// the displaced client should have had goes unpiloted. Host first, then join order.
export function rosterOf(peers) {
  return (peers || [])
    .filter(p => p && p.id)
    .slice()
    .sort((a, b) =>
      (b.isHost ? 1 : 0) - (a.isHost ? 1 : 0) ||
      (a.seq || 0) - (b.seq || 0) ||
      (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map(p => ({
      id: p.id,
      name: p.name || 'player',
      fighter: p.fighter || null,
      ready: !!p.ready,
      isHost: !!p.isHost,
    }));
}

// First `hello` wins the host slot. Two hosts in one room would both broadcast `state`, and every
// client would be torn between two authoritative worlds arriving at ~22/sec each. A second claimant
// is quietly demoted to a player and told why, rather than being dropped.
export function applyHello(msg, sender, peers) {
  const id = String((msg && msg.id) || '').slice(0, 32);
  const hostTaken = (peers || []).some(p => p && p.id && p.isHost && p.id !== id);
  const wantsHost = !!(msg && msg.host);
  return {
    peer: {
      ...sender,
      id,
      name: String((msg && msg.name) || 'player').slice(0, 24),
      isHost: wantsHost && !hostTaken,
    },
    refusedHost: wantsHost && hostTaken,
  };
}

// Where does a message go? Returns a destination the caller resolves against its own sockets:
//   'host'   — the one peer flagged isHost
//   'others' — everyone except the sender
//   'none'   — dropped, with a reason for logging
export function routeMessage(msg, sender) {
  if (!msg || typeof msg.t !== 'string') return { to: 'none', reason: 'malformed' };
  // Nothing is routed before `hello`: until then the connection has no identity to attribute a
  // message to, and `input` in particular carries a fighter index we would be taking on trust.
  if (!sender || !sender.id) return { to: 'none', reason: 'before-hello' };

  switch (msg.t) {
    case 'input':
      // Only the host runs the simulation, so inputs go to the host and nowhere else. Broadcasting
      // them would hand every player a live feed of everyone else's controls.
      return { to: 'host', msg };
    case 'state':
    case 'start':
      // Authority messages. Accepting these from a client would let any peer in the room force a
      // match to start, or overwrite every other player's world with a state of its choosing.
      return sender.isHost ? { to: 'others', msg } : { to: 'none', reason: 'not-host' };
    default:
      return { to: 'none', reason: 'unknown-type' };
  }
}
