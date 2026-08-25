// End-to-end against a running `wrangler dev`: two real sockets through the real Durable Object,
// speaking the monolith's actual message set. Node 22+ has a global WebSocket.
const BASE = 'ws://127.0.0.1:8787/ws';
const wait = ms => new Promise(r => setTimeout(r, ms));
let failures = 0;
const check = (ok, label, detail) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok || detail === undefined ? '' : `  -> ${JSON.stringify(detail)}`}`);
  if (!ok) failures++;
};

function open(room) {
  const ws = new WebSocket(`${BASE}?room=${room}`);
  ws.inbox = [];
  ws.addEventListener('message', e => ws.inbox.push(JSON.parse(e.data)));
  return new Promise((res, rej) => {
    ws.addEventListener('open', () => res(ws));
    ws.addEventListener('error', rej);
    setTimeout(() => rej(new Error('open timed out')), 8000);
  });
}
const say = (ws, o) => ws.send(JSON.stringify(o));
const took = (ws, t) => ws.inbox.filter(m => m.t === t);

// --- health ---
const health = await fetch('http://127.0.0.1:8787/health').then(r => r.text());
check(health === 'ok', 'GET /health returns ok', health);
const plain = await fetch('http://127.0.0.1:8787/ws?room=QXTR');
check(plain.status === 426, 'a plain GET on /ws is refused with 426, not a 404', plain.status);

// --- a room forms ---
const host = await open('QXTR');
const client = await open('QXTR');
say(host, { t: 'hello', id: 'hostid', host: true, name: 'Firey' });
await wait(250);
say(client, { t: 'hello', id: 'clientid', host: false, name: 'Leafy' });
await wait(400);

const roster = took(client, 'roster').pop();
check(!!roster, 'the joiner receives a roster');
check(roster && roster.players.length === 2, 'both peers are in it', roster && roster.players.length);
check(roster && roster.players[0].isHost && roster.players[0].id === 'hostid',
  'the host is first — clients take their fighter index from this order', roster && roster.players);
check(roster && roster.players[1].id === 'clientid', 'the joiner is second', roster && roster.players[1]);

// --- input goes to the host only ---
host.inbox.length = 0; client.inbox.length = 0;
say(client, { t: 'input', idx: 1, input: { left: true } });
await wait(300);
check(took(host, 'input').length === 1, 'a client input reaches the host', took(host, 'input'));
check(took(client, 'input').length === 0, 'and is not echoed to other clients');

// --- host state broadcasts ---
host.inbox.length = 0; client.inbox.length = 0;
say(host, { t: 'state', s: { tick: 7 } });
await wait(300);
check(took(client, 'state').length === 1, 'the host snapshot reaches the client', took(client, 'state'));
check(took(host, 'state').length === 0, 'and is not reflected back to the host');

// --- a client cannot forge authority ---
host.inbox.length = 0; client.inbox.length = 0;
say(client, { t: 'state', s: { tick: 999 } });
say(client, { t: 'start', settings: {}, roster: [] });
await wait(350);
check(took(host, 'state').length === 0, 'a client CANNOT push a state snapshot', took(host, 'state'));
check(took(host, 'start').length === 0, 'a client CANNOT force a match start', took(host, 'start'));

// --- host start does broadcast ---
client.inbox.length = 0;
say(host, { t: 'start', settings: { mode: 'teams' }, roster: ['Firey'] });
await wait(300);
check(took(client, 'start').length === 1, 'the host CAN start the match', took(client, 'start'));

// --- second host claim is demoted ---
const usurper = await open('QXTR');
say(usurper, { t: 'hello', id: 'usurper', host: true, name: 'Pen' });
await wait(400);
const st = took(usurper, 'status').pop();
const r2 = took(usurper, 'roster').pop();
check(!!st && /already has a host/i.test(st.msg), 'a second host claim is refused with a reason', st);
check(r2 && r2.players.filter(p => p.isHost).length === 1, 'exactly one host in the room', r2 && r2.players);

// --- rooms are isolated ---
const other = await open('ZZZZ');
say(other, { t: 'hello', id: 'otherid', host: true, name: 'Pencil' });
await wait(300);
client.inbox.length = 0;
say(other, { t: 'state', s: { tick: 1 } });
await wait(300);
check(took(client, 'state').length === 0, 'a different room code is a different session');

// --- leaving updates the roster ---
client.inbox.length = 0;
usurper.close();
await wait(500);
const r3 = took(client, 'roster').pop();
check(r3 && r3.players.length === 2, 'the roster shrinks when someone leaves', r3 && r3.players.length);

for (const s of [host, client, other]) { try { s.close(); } catch {} }
console.log(failures ? `\n${failures} FAILED` : '\nall relay e2e checks passed');
process.exit(failures ? 1 : 0);
