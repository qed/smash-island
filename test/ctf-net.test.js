import { describe, it, expect, beforeAll } from 'vitest';
import { makeRoom } from './helpers/net-room.js';

// CAPTURE THE FLAG ONLINE. A real host and a real guest (two jsdom pages behind a stand-in for the relay, test/helpers/net-room.js): the host picks the mode in
// the lobby, the guest sees it and builds the same map from its id, the host simulates, and the guest's keys reach the host as inputs. What a guest sees of the
// match is the host's snapshot: the flags its own side may see, the pieces built, the jail. The relay is never touched and nothing here dials a network.

let room, H, A;
beforeAll(async () => { room = await makeRoom(['H', 'A']); ({ H, A } = room.pages); }, 180000);

const click = (w, selector) => w.eval(`document.querySelector(${JSON.stringify(selector)}).click()`);
const key = (w, code, isDown) => w.dispatchEvent(new w.KeyboardEvent(isDown ? 'keydown' : 'keyup', { code, bubbles: true }));
const run = (n) => { for (let i = 0; i < n; i++) room.frame(); };
const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
// a key as a finger does it: down for a few frames, then up
const tap = (w, action, frames = 3) => { const code = w.eval(`KEYS.${action}`); key(w, code, true); run(frames); key(w, code, false); run(3); };
const hold = (w, action, frames) => { const code = w.eval(`KEYS.${action}`); key(w, code, true); run(frames); key(w, code, false); run(2); };

function ctfRoom() {
  room.reset();
  for (const w of [H, A]) w.eval(`CTF.skipNav = true; CTF.forceMap = 'castle';`);
  const code = room.host('H', 'Pen');
  room.join('A', code, 'Firey');
  click(H, '#lobbyMode button[data-v="ctf"]');
  room.flush();
  click(H, '#lobbyCount button[data-v="4"]');
  room.flush();
}
const start = () => { click(H, '#lobbyControls button'); room.flush(); run(30); };
// a standing place on a team's side, well away from the pad and the line: where a flag or a piece may go
const spot = (w, team) => J(w, `(function(){ var s = CTF.map.spots.filter(function(s){ return s.team===${team} && s.y>1500 && (${team}===0 ? s.x<8000 : s.x>13600); })[3]; return { x:s.x, y:s.y }; })()`);
const putFighter = (idx, x, y) => H.eval(`(function(){ var f = fighters[${idx}]; f.x = ${x}; f.y = ${y} - f.r; f.vx = 0; f.vy = 0; f.onground = true; })()`);

describe('capture the flag online', () => {
  it('the host picks the mode and the team size in the lobby, the guest sees it, and both build the same map', () => {
    ctfRoom();
    expect(A.eval(`document.getElementById('lobbySummary').textContent`), 'the guest reads the host\'s settings').toContain('Capture the Flag 2v2');
    start();
    expect(H.eval('running') && A.eval('running'), 'running on both').toBe(true);
    expect(A.eval('SETTINGS.mode')).toBe('ctf');
    expect(A.eval('CTF.mapId'), 'the guest built the host\'s map').toBe(H.eval('CTF.mapId'));
    expect(A.eval('worldPlats.length')).toBe(H.eval('worldPlats.length'));
    expect(A.eval('NET.snapshot.geo === undefined'), 'no geometry crossed the wire: the map goes by its id').toBe(true);
    expect(A.eval('CTF.live.phase'), 'hiding first').toBe('hide');
    expect(A.eval('CTF.live.t'), 'and its clock runs on the guest').toBeGreaterThan(10);
    expect(J(A, 'fighters.map(function(f){ return f.team; })'), 'the two humans on opposite sides').toEqual(J(H, 'fighters.map(function(f){ return f.team; })'));
    const g = A.eval('NET.myIdx');
    expect(H.eval(`fighters[${g}].team`) !== H.eval('fighters[0].team'), 'host and guest are on different teams').toBe(true);
  });

  it('a guest puts a flag down and builds a piece with its own keys, and the host sees both; the guest does not get the other side\'s flag', () => {
    ctfRoom(); start();
    const g = A.eval('NET.myIdx'), gt = H.eval(`fighters[${g}].team`), ht = H.eval('fighters[0].team');
    const sp = spot(H, gt), hs = spot(H, ht);
    // the guest's flag: standing on a good place, Space
    putFighter(g, sp.x - 300, sp.y); run(4);
    tap(A, 'flag');
    expect(H.eval(`CTF.live.flags[${g}].st`), 'the host put the guest\'s flag down').toBe(1);
    run(6);
    expect(A.eval(`CTF.live.flags[${g}].st`), 'and the guest sees it').toBe(1);
    expect(A.eval(`CTF.live.flags[${g}].x`)).toBe(H.eval(`Math.round(CTF.live.flags[${g}].x)`));
    // the host's own flag: the guest's side must not learn where it is
    putFighter(0, hs.x, hs.y); run(2);
    H.eval('ctfHidePlace(fighters[0])'); run(8);
    expect(H.eval('CTF.live.flags[0].st'), 'the host\'s flag is down').toBe(1);
    expect(A.eval('CTF.live.flags[0].st'), 'and the guest\'s copy of it is hidden').toBe(4);
    expect(A.eval(`NET.snapshot.ctf.fv[${gt}][0]`), 'it is not in the list for the guest\'s side').toBe(0);
    expect(Array.isArray(A.eval(`NET.snapshot.ctf.fv[${ht}][0]`)), 'it is in the host side\'s own list').toBe(true);
    // the guest builds: the free camera (V), the decoration tool (attack), the cursor right, Space
    tap(A, 'smash');
    expect(H.eval(`!!fighters[${g}]._cam`), 'the guest\'s free camera is on at the host').toBe(true);
    tap(A, 'attack');
    expect(H.eval(`fighters[${g}]._tool`), 'the tool moved on to decorations').toBe(1);
    hold(A, 'right', 12);
    tap(A, 'flag');
    run(8);
    expect(H.eval('CTF.live.edits.length'), 'a piece was built at the host').toBe(1);
    expect(H.eval('CTF.live.edits[0].owner')).toBe(g);
    expect(A.eval('CTF.live.edits.length'), 'and the guest has it too').toBe(1);
    expect(A.eval('CTF.live.pts[' + g + ']'), 'with its points spent').toBe(H.eval(`CTF.live.pts[${g}]`));
    // the guest's camera is its cursor
    const cam = J(A, `(function(){ var me = fighters.find(function(f){ return f.you; }), c = ctfCamFighter(me); return { x:c.x, y:c.y, fx:me.x }; })()`);
    expect(cam.x, 'the free camera follows the cursor on the guest').toBeGreaterThan(cam.fx + 100);
  });

  it('a jailed guest spectates a teammate, and the jail\'s state reaches it', () => {
    ctfRoom(); start();
    const g = A.eval('NET.myIdx'), gt = H.eval(`fighters[${g}].team`);
    H.eval('ctfEndHide(CTF.live)'); run(5);
    const foe = J(H, `CTF.map.homes[${1 - gt}].spawns[0]`);
    putFighter(g, foe.x, foe.y); run(2);
    H.eval(`eliminate(fighters[${g}])`); run(10);
    expect(H.eval(`fighters[${g}]._jail`), 'jailed by the host').toBe(1 - gt);
    expect(A.eval(`fighters.find(function(f){ return f.you; })._jail`), 'and the guest knows').toBe(1 - gt);
    expect(J(A, `CTF.live.jails[${1 - gt}].pris`), 'the jail holds the guest').toContain(g);
    tap(A, 'attack');
    const watched = A.eval(`ctfCamFighter(fighters.find(function(f){ return f.you; })).idx`);
    expect(watched, 'it watches somebody else').not.toBe(g);
    expect(H.eval(`fighters[${watched}].team`), 'a teammate').toBe(gt);
    // a teammate at the door, holding it: the guest is out
    const j = J(H, `CTF.map.jails[${1 - gt}]`), mate = H.eval(`fighters.filter(function(f){ return f.team===${gt} && f.idx!==${g}; })[0].idx`);
    H.eval(`fighters[${mate}].controller = 'still'`);
    putFighter(mate, j.door.x + (j.face === 1 ? j.door.w + 40 : -40), j.door.y + j.door.h);
    run(130);
    expect(H.eval(`fighters[${g}]._jail`), 'freed by a 2 s hold').toBe(null);
    expect(A.eval(`fighters.find(function(f){ return f.you; })._jail`), 'and the guest sees it').toBe(null);
  });
});
