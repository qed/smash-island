import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// NET.wsURL — the function that decided multiplayer never connected.
//
// It used to return `wss://<host>/api/ws?room=CODE` on any https page. No such endpoint has ever
// existed in this repo (api/ holds only strategy.js) and none could: Vercel's serverless functions
// terminate a request rather than holding an upgraded WebSocket open, so the handshake got a 404
// where it needed a 101 and both Create Room and Join Room failed identically.

const url = (w, { room = 'QXTR', addr = null, relay = null, loc = null } = {}) => w.eval(`
  (function(){
    NET.room = ${JSON.stringify(room)};
    ${relay === null ? `try{ localStorage.removeItem('bfsi:relay'); }catch(e){}`
                     : `try{ localStorage.setItem('bfsi:relay', ${JSON.stringify(relay)}); }catch(e){}`}
    return NET.wsURL(${JSON.stringify(addr)}, ${loc ? JSON.stringify(loc) : 'null'});
  })()`);

describe('a configured relay is what the game dials', () => {
  it('builds relay + room code', () => {
    const { window: w } = loadMonolith();
    expect(url(w, { relay: 'wss://relay.example.workers.dev/ws' }))
      .toBe('wss://relay.example.workers.dev/ws?room=QXTR');
  });

  it('does not double the slash on a trailing-slash relay', () => {
    const { window: w } = loadMonolith();
    expect(url(w, { relay: 'wss://relay.example.workers.dev/ws/' }))
      .toBe('wss://relay.example.workers.dev/ws?room=QXTR');
  });

  it('reaches the relay from the DESKTOP build too', () => {
    // The Electron app is served from app://game. Both of the old branches were wrong there:
    // `secure` was false and location.host is the literal string "game", so it dialled ws://game —
    // an unroutable hostname — and reported a generic connection error.
    const { window: w } = loadMonolith();
    expect(url(w, { relay: 'wss://relay.example.workers.dev/ws', loc: { protocol: 'app:', host: 'game' } }))
      .toBe('wss://relay.example.workers.dev/ws?room=QXTR');
  });

  it('carries the room code, because the relay shards on it', () => {
    const { window: w } = loadMonolith();
    const a = url(w, { relay: 'wss://r/ws', room: 'AAAA' });
    const b = url(w, { relay: 'wss://r/ws', room: 'BBBB' });
    expect(a).not.toBe(b);
    expect(a).toContain('room=AAAA');
  });
});

describe('a typed ws:// address still wins — LAN play needs no relay', () => {
  it('is used verbatim even when a relay is configured', () => {
    const { window: w } = loadMonolith();
    expect(url(w, { addr: 'ws://192.168.1.20:8080', relay: 'wss://relay.example.workers.dev/ws' }))
      .toBe('ws://192.168.1.20:8080');
  });
});

describe('with no relay configured', () => {
  it('falls back to same-origin on the web, as before', () => {
    const { window: w } = loadMonolith();
    expect(url(w, { loc: { protocol: 'https:', host: 'smashisland.vercel.app' } }))
      .toBe('wss://smashisland.vercel.app/api/ws?room=QXTR');
  });

  it('returns null on app:// instead of dialling the unroutable ws://game', () => {
    // Returning null is what lets connect() say "no relay is set up" rather than "connection
    // error", which sent an owner hunting for a server that was never misconfigured — just absent.
    const { window: w } = loadMonolith();
    expect(url(w, { loc: { protocol: 'app:', host: 'game' } })).toBe(null);
  });

  it('and connect() reports that plainly without opening a socket', () => {
    const { window: w } = loadMonolith();
    const said = w.eval(`
      (function(){
        try{ localStorage.removeItem('bfsi:relay'); }catch(e){}
        NET.room = 'QXTR';
        var realURL = NET.wsURL;
        NET.wsURL = function(){ return null; };          // stand in for the app:// case
        var opened = false;
        var RealWS = window.WebSocket;
        window.WebSocket = function(){ opened = true; };
        NET.connect(null, true);
        window.WebSocket = RealWS; NET.wsURL = realURL;
        var el = document.getElementById('lobbyStatus');
        return { text: el ? el.textContent : '', opened: opened, role: NET.role };
      })()`);
    expect(said.opened, 'no socket is opened when there is nowhere to dial').toBe(false);
    expect(said.text).toMatch(/relay/i);
    expect(said.role, 'and the session does not sit in a half-joined state').toBe('solo');
  });
});
