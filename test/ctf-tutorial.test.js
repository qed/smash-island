import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// THE CAPTURE THE FLAG PRACTICE (the owner, 2026-10-19: "make a ctf tutorial", play-along, and "a forced one"). A real match on the little practice
// map: each card goes on only when its real action happens in the real Capture the Flag code, it comes before a player's first match of the mode
// (and that match starts by itself after it), never again once it is done, never for a player who has played the mode, and a quit keeps the step.

const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
const step = (w, n = 1) => { for (let i = 0; i < n; i++) w.eval('step()'); };
const press = (w, code, frames = 3) => { w.eval(`down[${JSON.stringify(code)}]=true`); step(w, frames); w.eval(`down[${JSON.stringify(code)}]=false`); step(w, 2); };
const key = (w, code) => { for (const t of ['keydown', 'keyup']) w.dispatchEvent(new w.KeyboardEvent(t, { code, key: code, bubbles: true })); };
const at = (w) => w.eval('CTUT.active && CTUT_STEPS[CTUT.step] ? CTUT_STEPS[CTUT.step].id : "none"');
const until = (w, cond, max) => { for (let i = 0; i < max; i++) { if (w.eval(cond)) return i; w.eval('step()'); } return -1; };
const card = (w) => w.eval('(function(){ var st = CTUT_STEPS[CTUT.step]; return st.text(CTF.live, ctutYou(), CTUT.S); })()');
// a browser that had these keys before this build ever ran (written before the game's own script, as an older build left them)
const before = (pairs) => (raw) => raw.replace('<head>', '<head><script>' + pairs.map(([k, v]) => `localStorage.setItem(${JSON.stringify(k)}, ${JSON.stringify(v)});`).join('') + '</script>');
const put = (w, i, x, y) => w.eval(`(function(){ var f=fighters[${i}]; f.x=${x}; f.y=${y}-f.r; f.vx=0; f.vy=0; })()`);
// what the player asked for before the practice: a Capture the Flag match on the castle (no route graph, to keep it light)
const ASK = `CTF.skipNav=true; CTF.forceMap='castle'; SETTINGS.mode='ctf'; SETTINGS.count=10;`;

describe('the Capture the Flag practice', () => {
  it('walks through every step, each going on only when its real action happens, and then starts the match that was asked for', async () => {
    const { window: w } = loadMonolith(41);
    await w.eval('profileReady');
    w.eval(`${ASK} startMatch();`);
    expect(w.eval('CTUT.active'), 'the first Capture the Flag match waits for the practice').toBe(true);
    expect(w.eval('CTF.mapId')).toBe('practice');
    expect(J(w, 'fighters.map(function(f){ return f.team + (f.you ? "Y" : f.controller); })')).toEqual(['0Y', '1ctut', '0ctut', '1ctut']);

    // 1. the goal: Enter
    expect(at(w)).toBe('goal');
    step(w, 30); expect(at(w)).toBe('goal');
    key(w, 'Enter'); step(w, 2); expect(at(w)).toBe('hide');

    // 2. hide: C is not "done" yet; a place by the home pad is refused; a good spot takes the flag
    press(w, 'KeyC'); expect(w.eval('CTF.live.phase'), 'done hiding waits for its own step').toBe('hide');
    w.eval(`(function(){ var f=fighters[0], p=CTF.map.homes[0].pad; f.x=p.x+p.w/2; f.y=p.y-f.r; f.vx=0; f.vy=0; })()`);
    press(w, 'Space');
    expect(w.eval('CTF.live.flags[0].st'), 'by the pad: refused').toBe(0);
    expect(at(w)).toBe('hide');
    put(w, 0, 2460, 1200); press(w, 'Space');
    expect(w.eval('CTF.live.flags[0].st')).toBe(1);
    expect(at(w)).toBe('build');

    // 3. build a crate (it costs a point), take it away (the point comes back), and be refused in the closed cave
    const pts0 = w.eval('CTF.live.pts[0]');
    press(w, 'KeyV'); expect(w.eval('!!fighters[0]._cam'), 'V: the build view').toBe(true);
    w.eval('fighters[0]._cam.x = 2000; fighters[0]._cam.y = 1150;');
    press(w, 'KeyX'); expect(w.eval('CTF_TOOLS[fighters[0]._tool]')).toBe('deco');
    step(w, 20); expect(at(w)).toBe('build');
    press(w, 'Space');
    expect(w.eval('CTF.live.edits.length')).toBe(1);
    expect(w.eval('CTF.live.pts[0]')).toBe(pts0 - 1);
    expect(at(w)).toBe('remove');
    for (let k = 0; k < 4; k++) press(w, 'KeyX');
    expect(w.eval('CTF_TOOLS[fighters[0]._tool]')).toBe('remove');
    step(w, 20); expect(at(w)).toBe('remove');
    press(w, 'Space');
    expect(w.eval('CTF.live.edits.length')).toBe(0);
    expect(w.eval('CTF.live.pts[0]'), 'the point back').toBe(pts0);
    expect(at(w)).toBe('reach');
    expect(card(w), 'in the build view on another tool: X to the flag').toMatch(/X until the flag/);
    expect(until(w, 'CTF.nav && CTF.nav.ready', 4000), 'the little map\'s route graph is made').toBeGreaterThanOrEqual(0);
    press(w, 'KeyX'); expect(w.eval('CTF_TOOLS[fighters[0]._tool]')).toBe('flag');
    expect(card(w)).toMatch(/Aim the flag tool/);
    const flag0 = J(w, '[CTF.live.flags[0].x, CTF.live.flags[0].y]');
    w.eval('fighters[0]._cam.x = 2220; fighters[0]._cam.y = 1440;');   // into the closed cave under the floor
    expect(w.eval('ctfCamSnap(fighters[0]).ok'), 'nobody could reach it: flagged').toBe(false);
    step(w, 20); expect(at(w)).toBe('reach');
    press(w, 'Space');
    expect(J(w, '[CTF.live.flags[0].x, CTF.live.flags[0].y]'), 'the flag did not go').toEqual(flag0);
    expect(at(w)).toBe('plan');

    // 4. the plan menu: P opens it, Space picks the first plan, Esc closes it (and does not pause); then C ends the hiding
    step(w, 10); expect(at(w)).toBe('plan');
    key(w, 'KeyP'); step(w, 2); expect(w.eval('ctfMenuOpen()')).toBe(true); expect(at(w)).toBe('pick');
    step(w, 10); expect(at(w)).toBe('pick');
    key(w, 'Space'); step(w, 2); expect(w.eval('!!CTF.menu.vote.preset')).toBe(true); expect(at(w)).toBe('close');
    key(w, 'Escape'); step(w, 2); expect(w.eval('ctfMenuOpen()')).toBe(false); expect(w.eval('paused')).toBe(false);
    expect(at(w)).toBe('done');
    expect(w.eval('CTF.live.phase')).toBe('hide');
    press(w, 'KeyC');
    expect(until(w, "CTF.live.phase === 'play'", 600)).toBeGreaterThanOrEqual(0);
    step(w, 2); expect(at(w)).toBe('find');

    // 5. steal: a flag hidden in a prop on their side, picked up (a carrier is slower), carried over the middle line
    step(w, 30); expect(at(w)).toBe('find');
    const fl = J(w, '(function(){ var q = CTF.live.flags.filter(function(f){ return f.team===1; }).sort(function(a,b){ return a.x-b.x; })[0]; return { id:q.id, x:q.x, y:q.y, cover:q.cover }; })()');
    expect(fl.cover, 'hidden in a prop').toBe(true);
    put(w, 0, fl.x, fl.y); step(w, 3);
    expect(w.eval('fighters[0]._cf')).toBe(fl.id);
    expect(w.eval('ctfSpeedK(fighters[0])')).toBeLessThan(w.eval('CTF_SPEED'));
    expect(at(w)).toBe('carry');
    step(w, 10); expect(at(w)).toBe('carry');
    put(w, 0, 3300, 1200); step(w, 3);
    expect(w.eval('CTF.live.score[0]')).toBe(1);
    expect(w.eval('CTF.live.over'), 'the practice never ends by itself').toBe(false);
    expect(at(w)).toBe('jail');

    // 6. the jail: safe on your own side; on theirs the foe comes and one hit jails you; your teammate holds the door 2 s and you are out
    expect(w.eval('fighters[0].pct')).toBeGreaterThanOrEqual(w.eval('ctfJailThreshold(CTF.live.n)') - 5);
    step(w, 60); expect(w.eval('fighters[0]._jail')).toBe(null); expect(at(w)).toBe('jail');
    put(w, 0, 4300, 1200);
    expect(until(w, 'fighters[0]._jail != null', 1500), 'a foe came and hit').toBeGreaterThanOrEqual(0);
    step(w, 1); expect(at(w)).toBe('freed');
    step(w, 30); expect(at(w)).toBe('freed');
    expect(until(w, 'fighters[0]._jail == null', 2400), 'freed').toBeGreaterThanOrEqual(0);
    expect(w.eval('fighters[2]._freed'), 'by the teammate at the door').toBe(1);
    expect(w.eval('CTF.live.jails[1].lock'), 'a jailbreak: the door is locked for a while').toBeGreaterThan(0);
    step(w, 1); expect(at(w)).toBe('key');
    // the practice's CPUs walk past flags (the teammate's way to the jail went through their props)
    expect(w.eval('fighters.every(function(f){ return f.you || !(f._cf >= 0); })'), 'no CPU carries a flag').toBe(true);
    const foeFlag = J(w, '(function(){ var q = CTF.live.flags.filter(function(f){ return f.team===1 && f.st===1; })[0]; return { x:q.x, y:q.y }; })()');
    put(w, 2, foeFlag.x, foeFlag.y); step(w, 3);
    expect(w.eval('fighters[2]._cf >= 0'), 'standing on a foe flag: not picked up').toBe(false);

    // 7. the personal key opens a locked door, for the team, and is used up
    expect(J(w, 'CTF.live.doors.map(function(d){ return d.op[0]; })')).toEqual([false, false]);
    expect(!!w.eval('fighters[0]._pk')).toBe(true);
    step(w, 30); expect(at(w)).toBe('key');
    const door = J(w, '(function(){ var d = CTF.live.doors.filter(function(d){ return d.team===1; })[0]; return { x:d.x, y:d.y, w:d.w, h:d.h }; })()');
    put(w, 0, door.x + door.w + 40, door.y + door.h); step(w, 3);
    expect(w.eval('fighters[0]._pk'), 'used').toBe(false);
    expect(w.eval('CTF.live.doors.filter(function(d){ return d.team===1; })[0].op[0]')).toBe(true);
    expect(at(w)).toBe('boost');

    // 8. a boost, the map (Enter), the radar (it rings for 5 s)
    step(w, 30); expect(at(w)).toBe('boost');
    const b = J(w, '(function(){ var b = CTF.live.boosts.filter(function(b){ return b.x > CTF.map.WW/2; })[0]; return { x:b.x, y:b.y }; })()');
    put(w, 0, b.x, b.y); step(w, 3);
    expect(w.eval('CTF.live.boosts.some(function(q){ return q.cd > 0 && q.by === 0; })')).toBe(true);
    expect(at(w)).toBe('map');
    step(w, 30); expect(at(w)).toBe('map');
    key(w, 'Enter'); step(w, 2); expect(at(w)).toBe('radar');
    expect(w.eval('CTF.live.radar')).toBeGreaterThan(0);
    expect(until(w, "CTUT.active && CTUT_STEPS[CTUT.step].id === 'ready'", 400)).toBeGreaterThanOrEqual(0);

    // 9. done: Enter, and the Capture the Flag match that was asked for starts, a real one, with the player's own settings back
    key(w, 'Enter'); step(w, 1);
    expect(w.eval('CTUT.active')).toBe(false);
    expect(w.eval('ctfTutDone()')).toBe(true);
    expect(w.eval('PROFILE.ctfTutorialDone')).toBe(true);
    expect(w.eval("localStorage.getItem('bfsi:ctfTutStep')")).toBe(null);
    expect(w.eval('running')).toBe(true);
    expect(w.eval('CTF.mapId')).toBe('castle');
    expect(w.eval('fighters.length')).toBe(10);
    expect(w.eval("fighters.some(function(f){ return f.controller==='ctut'; })")).toBe(false);
    expect(w.eval("document.getElementById('ctfIntro')"), 'no first-match card: the practice was it').toBe(null);
  }, 240000);

  it('is not forced once done, nor for a player who has played the mode, and Learn still plays it', async () => {
    const { window: w } = loadMonolith(42);
    w.eval(`ctfTutMarkDone(); ${ASK} startMatch();`);
    expect(w.eval('CTUT.active')).toBe(false);
    expect(w.eval('CTF.mapId')).toBe('castle');
    w.eval("go('title'); document.getElementById('learnBtn').click(); document.getElementById('ctfTutBtn').click();");
    expect(w.eval('CTUT.active'), 'Learn plays it again').toBe(true);
    expect(at(w)).toBe('goal');
    w.eval('quitMatch()');
    expect(w.eval('CTUT.active')).toBe(false);

    // a player who used the mode before this build: the keys its setup writes (here: the old first-match card, a map picked) count, once
    for (const [k, val] of [['bfsi:ctfintro', '1'], ['bfsi:ctfmap', 'castle']]) {
      const { window: v } = loadMonolith(43, before([[k, val]]));
      await v.eval('profileReady');
      expect(v.eval('ctfTutDone()'), k + ' before this build: done').toBe(true);
      expect(v.eval('PROFILE.ctfTutorialDone')).toBe(true);
      v.eval(`${ASK} startMatch();`);
      expect(v.eval('CTUT.active')).toBe(false);
      expect(v.eval('CTF.mapId')).toBe('castle');
    }

    // a new player who picks a map (the same key, written now) is still sent to the practice
    const { window: u } = loadMonolith(44);
    await u.eval('profileReady');
    u.eval("ctfMapPickSet('castle')");   // (what the setup's map button runs)
    expect(u.eval("localStorage.getItem('bfsi:ctfmap')")).toBe('castle');
    expect(u.eval('ctfTutDone()'), 'a map picked after the one check: not done').toBe(false);
    u.eval(`${ASK} startMatch();`);
    expect(u.eval('CTUT.active')).toBe(true);
  }, 120000);

  it('a quit part-way puts the player\'s settings back and keeps the step; the next start resumes there', () => {
    const { window: w } = loadMonolith(45);
    w.eval(`${ASK} startMatch();`);
    key(w, 'Enter'); step(w, 2);
    put(w, 0, 2460, 1200); press(w, 'Space');
    expect(at(w)).toBe('build');
    w.eval('quitMatch()');
    expect(w.eval('CTUT.active')).toBe(false);
    expect(J(w, '[SETTINGS.mode, SETTINGS.count, CTF.forceMap, CTF.skipNav]')).toEqual(['ctf', 10, 'castle', true]);
    expect(w.eval("localStorage.getItem('bfsi:ctfTutStep')")).toBe('build');
    expect(w.eval('ctfTutDone()')).toBe(false);
    w.eval('startMatch()');
    expect(w.eval('CTUT.active'), 'forced again').toBe(true);
    expect(at(w)).toBe('build');
    expect(w.eval('CTF.live.phase')).toBe('hide');
    expect(w.eval('CTF.live.flags[0].st'), 'its flag already hidden').toBe(1);
    w.eval("quitMatch(); localStorage.setItem('bfsi:ctfTutStep', 'reach'); startMatch();"); step(w, 2);
    expect(at(w)).toBe('reach');
    expect(w.eval('!!fighters[0]._cam')).toBe(false);
    expect(card(w), 'resumed outside the build view: V first').toMatch(/Press V for the build view/);
    press(w, 'KeyV'); expect(card(w), 'V picks the flag tool first').toMatch(/Aim the flag tool/);
    w.eval("quitMatch(); localStorage.setItem('bfsi:ctfTutStep', 'freed'); startMatch();");
    expect(at(w), 'a step that needs the jail starts at the jail').toBe('jail');
    expect(w.eval('CTF.live.phase')).toBe('play');
    // a step whose check would pass on the first frame of a fresh match is not judged before it is set up (the doors are open while hiding)
    w.eval("quitMatch(); localStorage.setItem('bfsi:ctfTutStep', 'key'); startMatch();"); step(w, 5);
    expect(at(w)).toBe('key');
    expect(J(w, 'CTF.live.doors.map(function(d){ return d.op[0]; })')).toEqual([false, false]);
    w.eval("quitMatch(); localStorage.setItem('bfsi:ctfTutStep', 'radar'); startMatch();"); step(w, 5);
    expect(at(w)).toBe('radar');
    expect(w.eval('CTF.live.radar')).toBeGreaterThan(200);
  }, 120000);

  // RESTATED (the owner, 2026-10-19): the Flag Cup is watched, not played, so it no longer waits for the practice; matches you play still do.
  it('the watch-only Flag Cup starts at once; Create Room, picking it in your own room and a room you join go through the practice first', () => {
    { const { window: wc } = loadMonolith(46);   // (its own window: the cup really starts now, so it gets a fresh one)
      wc.eval('ctfCupKickOff()');
      expect(wc.eval('CTUT.active'), 'the watch-only cup does not wait for the practice').toBe(false); }
    const { window: w } = loadMonolith(46);

    w.eval("SETTINGS.mode='ctf'; openLobby(); NET.host();");
    expect(w.eval('CTUT.active'), 'Create Room with the mode on').toBe(true);
    expect(w.eval('NET.role'), 'no room yet').toBe('solo');
    w.eval('quitMatch()');

    // the mode picked in your own room: with a friend in it the mode stays; alone, the room closes and the practice runs
    w.eval("SETTINGS.mode='ffa'; NET.role='host'; NET.players=[{ id:NET.myId, isHost:true }, { id:'friend' }];");
    expect(w.eval('ctfTutHostPick()')).toBe(true);
    expect(w.eval('CTUT.active')).toBe(false); expect(w.eval('SETTINGS.mode')).toBe('ffa');
    expect(w.eval("document.getElementById('lobbyStatus').textContent")).toMatch(/practice/);
    w.eval('NET.players=[{ id:NET.myId, isHost:true }];');
    expect(w.eval('ctfTutHostPick()')).toBe(true);
    expect(w.eval('CTUT.active')).toBe(true); expect(w.eval('NET.role')).toBe('solo');
    w.eval('quitMatch()');

    // a room you join plays it: out of the room before anything else, the practice, then the same room again (the real join; no socket)
    w.eval("NET.connect = function(){}; openLobby(); NET.join('BCDF');");
    expect(w.eval('NET.role')).toBe('client');
    w.eval("NET.onMessage({ t:'state', lobby:{ mode:'ctf', count:4 } })");
    expect(w.eval('CTUT.active')).toBe(true); expect(w.eval('CTUT.reason')).toBe('join');
    expect(w.eval('NET.role'), 'left the room: the practice never runs in a lobby').toBe('solo');
    w.eval('CTUT.step = CTUT_STEPS.length - 1; ctutEnter(CTUT.step);');
    key(w, 'Enter'); step(w, 1);
    expect(w.eval('CTUT.active')).toBe(false);
    expect(J(w, '[NET.role, NET.room]'), 'joins the same room again').toEqual(['client', 'BCDF']);
    expect(w.eval("document.getElementById('lobby').classList.contains('active')")).toBe(true);

    // done: a room that plays it is just joined
    w.eval("NET.onMessage({ t:'state', lobby:{ mode:'ctf', count:4 } })");
    expect(w.eval('CTUT.active')).toBe(false); expect(w.eval('NET.role')).toBe('client');
  }, 120000);

  it('a host who switches a room you are already in to Capture the Flag keeps you in the room', () => {
    const { window: w } = loadMonolith(47);
    w.eval("NET.connect = function(){}; openLobby(); NET.join('WXYZ');");
    w.eval("NET.onMessage({ t:'state', lobby:{ mode:'ffa', count:3 } })");
    expect(w.eval('NET.role')).toBe('client');
    w.eval("NET.onMessage({ t:'state', lobby:{ mode:'ctf', count:3 } })");
    expect(w.eval('CTUT.active'), 'never pulled out mid-lobby').toBe(false);
    expect(J(w, '[NET.role, NET.room, NET.lobby.mode]')).toEqual(['client', 'WXYZ', 'ctf']);
    expect(w.eval("document.getElementById('lobbyStatus').textContent")).toMatch(/practice is under Learn/);
    expect(w.eval('ctfTutDone()'), 'still not done').toBe(false);
    w.eval("NET.onMessage({ t:'state', lobby:{ mode:'ctf', count:4 } })");
    expect(w.eval('CTUT.active')).toBe(false); expect(w.eval('NET.role')).toBe('client');
    // their own first Capture the Flag match later still goes through it
    w.eval(`NET.leave(); go('title'); ${ASK} startMatch();`);
    expect(w.eval('CTUT.active')).toBe(true);
  }, 120000);
});
