# Smash Island relay

The WebSocket relay that makes **Play with Friends** work.

## Why this exists

The game's netcode has always built its socket URL as `wss://<host>/api/ws?room=CODE`. That
endpoint was never deployed, and on Vercel it could not be: serverless functions terminate a
request rather than holding an upgraded WebSocket open. Every Create Room and Join Room got a
`404` where it needed a `101`, so multiplayer had never connected on any build.

This is a Cloudflare Worker plus one Durable Object per room code. The game already shards on
`?room=`, and a Durable Object is addressed by name — so the room code *is* the object id, and no
registry or lookup is needed to put friends in the same session.

The relay is a forwarder. It speaks the message set the game already speaks and adds nothing:

| From | Message | Goes to |
|---|---|---|
| any peer | `hello` | (registers, then everyone gets `roster`) |
| client | `input` | the host only |
| host | `state` | everyone else |
| host | `start` | everyone else |

`state` and `start` from a non-host are dropped — otherwise any peer in the room could force a
match to start or overwrite everyone else's world.

## Deploy

You need a free Cloudflare account. From this directory:

```bash
npx wrangler login       # opens a browser once
npx wrangler deploy
```

`deploy` prints the Worker URL, e.g. `https://smash-island-relay.<your-subdomain>.workers.dev`.

Check it is alive:

```bash
curl https://smash-island-relay.<your-subdomain>.workers.dev/health   # -> ok
```

## Point the game at it

Edit `RELAY_URL` near `window.NET` in `artifacts/V1/index.html` — note **`wss://`**, not `https://`,
and the `/ws` path:

```js
const RELAY_URL = "wss://smash-island-relay.<your-subdomain>.workers.dev/ws";
```

That one constant serves both builds: the Vercel site and the Electron desktop app. The desktop
CSP already allows `wss:` (`electron/main.cjs`), so nothing else needs changing.

To try a relay **without** editing the file — a staging Worker, or a local `wrangler dev` — set it
from the browser console on the game page:

```js
localStorage.setItem('bfsi:relay', 'ws://localhost:8787/ws')
```

That override wins over `RELAY_URL`. Remove it with `localStorage.removeItem('bfsi:relay')`.

## Run it locally

```bash
npx wrangler dev          # serves on ws://localhost:8787/ws
```

Then use the `localStorage` override above. Two browser tabs are enough to test a room: create in
one, join by code in the other.

## Tests

The routing rules are pure functions in `src/protocol.js`, covered by the project's normal suite
(no Workers runtime needed):

```bash
npm test -- relay-protocol
```

`test/netcode-relay-url.test.js` covers the game side — which URL gets dialled on the web build, on
the desktop build, and when no relay is configured.

There is also an end-to-end harness that drives two real sockets through a real Durable Object. It
needs a live Worker, so it is not part of the vitest suite — run it against `wrangler dev`:

```bash
npx wrangler dev --port 8787 --local     # in one terminal
node relay/test/e2e.mjs                  # in another
```

It checks the room forms with the host first, that inputs reach only the host, that a client cannot
push a `state` snapshot or force a `start`, that a second host claim is demoted, that two room codes
are two sessions, and that the roster shrinks when someone leaves. It caught one real bug: a closing
socket is still listed by `ctx.getWebSockets()`, so the room kept a ghost peer — which would have
shifted every remaining client's fighter index.

## Notes

- **Free plan.** The migration declares `new_sqlite_classes`, which is what the free plan allows.
  The relay keeps nothing in storage — every peer's state lives in its socket attachment.
- **Hibernation.** Sockets are accepted with `ctx.acceptWebSocket`, so an idle lobby costs nothing
  while people pick fighters. The consequence is that no per-connection state may live on `this`:
  the object can be evicted between messages, so the peer list is always re-derived from
  `ctx.getWebSockets()`.
- **Room size** is capped at 8 peers (`MAX_PEERS`) and frames at 512KB (`MAX_FRAME`).
- **Room codes** are clamped to 8 characters of `[A-Z0-9]` before naming an object, so an anonymous
  caller cannot spin up unbounded Durable Objects.
- There is an older written plan for a different relay design — Node + `ws`, in
  `docs/superpowers/plans/2026-07-18-bfsi-online-rooms.md`. It targets `src/net/netcode.js` in the
  post-modularization Lite build and is gated behind three plans that have not run. This relay
  serves the monolith that actually ships; the two are not in conflict, but if that plan is ever
  executed the two relays should be reconciled rather than both deployed.
