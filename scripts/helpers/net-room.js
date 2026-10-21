import { bootRealm } from './net-pair.js';
import { normalizeRoom, rosterOf, applyHello, routeMessage } from '../../relay/src/protocol.js';

// A room of real pages, headless: one jsdom realm per player, each running the unmodified artifacts/V1/index.html, joined by a
// stand-in for the relay that routes with relay/src/protocol.js -- the same applyHello / rosterOf / routeMessage that
// relay/src/index.js calls, so a roster is built, ordered and pushed exactly as the deployed one does, and `state` and `start`
// reach only the clients while `input` reaches only the host. Rooms are sharded by the code in the dialled address, as the deployed
// relay shards them, so two codes are two rooms. Nothing here dials a network: each page's WebSocket is replaced
// before it can use one, and NET.RELAY is pointed at an address that cannot resolve.
//
// What a test does goes through the page's own code: NET.host() and NET.join(code) build a socket, the harness opens it (so the page
// sends its real hello), and the roster, the settings preview and the start come back through the pages' own NET.onMessage.
// Messages are queued and delivered in order by flush(), which every action ends with, so a page's reply to a message never jumps
// ahead of the message that caused it.

export async function makeRoom(names, { w = 1280, h = 720 } = {}) {
  const clock = { T: 0 };
  const pages = {};
  let seed = 7001;
  for (const n of names) pages[n] = bootRealm(w, h, seed++, clock);
  await Promise.all(Object.values(pages).map((p) => p.eval('profileReady')));

  const relay = { peers: [], pending: new Map(), queue: [], seq: 0, log: [] };
  const deliver = (ws, obj) => relay.queue.push({ ws, data: JSON.stringify(obj) });
  const inRoom = (code) => relay.peers.filter((p) => p.ws.room === code);
  const pushRoster = (code) => {
    const here = inRoom(code), players = rosterOf(here.map((p) => p.at));
    for (const p of here) deliver(p.ws, { t: 'roster', players });
  };
  const fromPeer = (ws, raw) => {
    const peer = relay.peers.find((p) => p.ws === ws);
    if (!peer) return;
    const msg = JSON.parse(raw);
    relay.log.push({ from: ws.name, msg });
    const here = inRoom(ws.room);
    if (msg && msg.t === 'hello') {
      const { peer: np, refusedHost } = applyHello(msg, peer.at, here.map((p) => p.at));
      peer.at = np;
      if (refusedHost) deliver(ws, { t: 'status', msg: 'That room already has a host -- you joined as a player.' });
      pushRoster(ws.room);
      return;
    }
    const route = routeMessage(msg, peer.at);
    if (route.to === 'host') { const host = here.find((p) => p.at.isHost); if (host) deliver(host.ws, msg); }
    else if (route.to === 'others') { for (const p of here) if (p !== peer) deliver(p.ws, msg); }
  };
  const flush = () => {
    for (let guard = 0; relay.queue.length && guard < 5000; guard++) {
      const { ws, data } = relay.queue.shift();
      if (ws.readyState === 1 && ws.onmessage) ws.onmessage({ data });
    }
  };
  const drop = (ws) => {
    const i = relay.peers.findIndex((p) => p.ws === ws);
    ws.readyState = 3;
    if (i >= 0) { relay.peers.splice(i, 1); pushRoster(ws.room); }
  };

  for (const [name, win] of Object.entries(pages)) {
    win.WebSocket = class FakeSocket {
      constructor(url) {
        this.url = url; this.name = name; this.readyState = 0; this.bufferedAmount = 0;
        this.room = normalizeRoom(new URL(url).searchParams.get('room'));   // the relay shards on ?room=
        relay.pending.set(name, this);
      }
      send(text) { if (this.readyState === 1) fromPeer(this, text); }
      close() { drop(this); flush(); }
    };
    win.eval(`NET.RELAY = 'wss://relay.invalid/ws'; try { localStorage.removeItem('bfsi:relay'); } catch (e) {}`);
  }

  const room = {
    pages, relay, flush, clock,
    // One 60 fps frame in the room: time moves on, the host steps and streams, then every client draws what reached it. (The clock is
    // what the snapshot rate and the input heartbeat read, so a test that wants a match to be seen on a client has to move it.)
    frame() {
      clock.T += 1000 / 60;
      const first = (n) => (pages[n].eval('NET.role') === 'host' ? 0 : 1);
      for (const n of Object.keys(pages).sort((a, b) => first(a) - first(b))) { pages[n].eval('loop()'); flush(); }
    },
    // The page's pending socket connects: its onopen runs (the page says hello), the relay answers everyone.
    open(name) {
      const ws = relay.pending.get(name);
      if (!ws) throw new Error(name + ' has no socket waiting to open (call NET.host() or NET.join(code) first)');
      relay.pending.delete(name);
      ws.readyState = 1;
      relay.peers.push({ ws, at: { id: null, name: null, isHost: false, seq: ++relay.seq } });
      if (ws.onopen) ws.onopen();
      flush();
    },
    // A player's tab closes or their network drops: the relay loses the socket and tells everyone who is left.
    vanish(name) {
      const p = relay.peers.find((x) => x.ws.name === name);
      if (!p) return;
      const ws = p.ws;
      drop(ws);
      flush();
      if (ws.onclose) ws.onclose();
    },
    // The player picks a fighter the way a finger does: a click on its portrait in the lobby's grid.
    pick(name, fighter) {
      pages[name].eval(`(function(){ var c = [].filter.call(document.querySelectorAll('#lobbyFighter .lgcell'), function(x){ return x.dataset.fighter === ${JSON.stringify(fighter)}; })[0]; c.click(); })()`);
      flush();
    },
    // Create Room on `name`'s page, then connect it. Returns the room code.
    host(name, fighter) {
      if (fighter) pages[name].eval(`chosen = ROSTER.find(function(r){ return r.name === ${JSON.stringify(fighter)}; });`);
      pages[name].eval('openLobby(); NET.host();');
      room.open(name);
      return pages[name].eval('NET.room');
    },
    // Join Room on `name`'s page, typed into the box the way a player does, then connect.
    join(name, code, fighter) {
      if (fighter) pages[name].eval(`chosen = ROSTER.find(function(r){ return r.name === ${JSON.stringify(fighter)}; });`);
      pages[name].eval(`openLobby(); document.getElementById('joinAddr').value = ${JSON.stringify(code)}; NET.join(document.getElementById('joinAddr').value);`);
      room.open(name);
    },
    // Everyone back to an empty lobby, the relay empty, for the next test.
    reset() {
      for (const win of Object.values(pages)) win.eval(`try { NET.leave(); } catch (e) {} running = false; paused = false; openLobby();`);
      relay.peers.length = 0; relay.pending.clear(); relay.queue.length = 0; relay.log.length = 0;
    },
    // What a page's lobby shows: its player cards, as plain data.
    roster(name) {
      return JSON.parse(pages[name].eval(`JSON.stringify([].map.call(document.querySelectorAll('#lobbyRoster .lobbyplayer'), function(e){
        return { slot: +e.dataset.slot, fighter: e.dataset.fighter, host: e.classList.contains('host'), you: e.classList.contains('you'),
                 label: e.querySelector('.lpslot').textContent, text: e.querySelector('.lpname').textContent, tag: !!e.querySelector('.lptag') }; }))`));
    },
  };
  return room;
}
