// Smash Island relay — a Cloudflare Worker plus one Durable Object per room code.
//
// WHY THIS EXISTS AT ALL: the game's netcode has always built its socket URL as
// `wss://<host>/api/ws?room=CODE`, but no such endpoint was ever deployed, and it could not have
// been — Vercel's serverless functions terminate a request rather than holding an upgraded
// WebSocket open. So every Create Room / Join Room got a 404 where it needed a 101, and multiplayer
// has never connected. A Durable Object is a natural fit for the shape the client already assumes:
// the game shards on ?room=, and a DO is addressed by name, so the room code IS the object id and
// no registry is needed to route a player to their friends.
//
// Hibernation (acceptWebSocket + the webSocket* handlers, rather than accept() and an in-memory
// session list) means an idle lobby costs nothing while people are still picking fighters. The
// price is that no per-connection state may live on `this`: the object can be evicted between
// messages and rebuilt. Everything per-peer therefore lives in the socket's own attachment, and the
// peer list is always re-derived from ctx.getWebSockets().

import { normalizeRoom, rosterOf, applyHello, routeMessage } from './protocol.js';

const MAX_PEERS = 8;             // MAX_TEAMS is 20, but a room of humans is small; caps the fan-out
const MAX_FRAME = 512 * 1024;    // a state snapshot is a few KB; this is a generous ceiling

export class Room {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
  }

  async fetch(request) {
    if (this.ctx.getWebSockets().length >= MAX_PEERS) {
      return new Response('room full', { status: 409 });
    }
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    // seq is assigned HERE, at connect, not at hello: it is what orders the roster after the host,
    // and ordering by hello time would let a slow client jump ahead of someone who connected first.
    server.serializeAttachment({ id: null, name: null, isHost: false, seq: Date.now() + Math.random() });
    return new Response(null, { status: 101, webSocket: client });
  }

  peers() {
    return this.ctx.getWebSockets().map(ws => ({ ws, at: ws.deserializeAttachment() || {} }));
  }

  send(ws, obj) {
    try { ws.send(JSON.stringify(obj)); } catch { /* peer already gone; the close handler tidies up */ }
  }

  // `leaving` is the socket that triggered this, on the close path. A closing socket is still
  // listed by getWebSockets() while it winds down, so without excluding it explicitly the room
  // keeps a ghost in its lobby — and, worse than cosmetic, that ghost still occupies a slot in the
  // roster order every client derives its fighter index from.
  pushRoster(leaving) {
    const live = this.peers().filter(p => p.ws !== leaving);
    const players = rosterOf(live.map(p => p.at));
    const frame = JSON.stringify({ t: 'roster', players });
    for (const { ws } of live) {
      try { ws.send(frame); } catch { /* ignore */ }
    }
  }

  async webSocketMessage(ws, raw) {
    if (typeof raw !== 'string' || raw.length > MAX_FRAME) return;
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    const all = this.peers();
    const self = all.find(p => p.ws === ws);
    const at = (self && self.at) || {};

    if (msg && msg.t === 'hello') {
      const { peer, refusedHost } = applyHello(msg, at, all.map(p => p.at));
      ws.serializeAttachment(peer);
      if (refusedHost) {
        this.send(ws, { t: 'status', msg: 'That room already has a host — you joined as a player.' });
      }
      this.pushRoster();
      return;
    }

    const route = routeMessage(msg, at);
    if (route.to === 'host') {
      const host = all.find(p => p.at && p.at.isHost);
      if (host) this.send(host.ws, msg);
      return;
    }
    if (route.to === 'others') {
      const frame = JSON.stringify(msg);
      for (const p of all) {
        if (p.ws === ws) continue;
        try { p.ws.send(frame); } catch { /* ignore */ }
      }
    }
    // 'none' is a deliberate drop — see routeMessage for which cases and why.
  }

  async webSocketClose(ws) {
    // The host leaving does NOT close the room: the remaining players stay connected and the roster
    // simply loses its host flag, so they can back out to the lobby instead of being cut off
    // mid-sentence. A room with no sockets left is evicted by the platform on its own.
    try { ws.close(); } catch { /* already closing */ }
    this.pushRoster(ws);
  }

  async webSocketError(ws) {
    this.pushRoster(ws);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return new Response('ok', { headers: { 'content-type': 'text/plain' } });
    }
    if (request.headers.get('Upgrade') !== 'websocket') {
      // A plain GET here is almost always someone checking the relay is alive, so say something
      // useful rather than returning a bare error.
      return new Response(
        'Smash Island relay. Connect a WebSocket to /ws?room=CODE. GET /health for a liveness check.',
        { status: 426, headers: { 'content-type': 'text/plain' } },
      );
    }

    const code = normalizeRoom(url.searchParams.get('room'));
    const id = env.ROOM.idFromName(code);
    return env.ROOM.get(id).fetch(request);
  },
};
