import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// SPECTATING a CPU-only Capture the Flag match (the owner, 2026-10-16: "to see what you would do in a match"): the setup's Spectate toggle starts a match with NO human,
// the camera follows the action by itself (auto), keys lock onto a team or a fighter or zoom out to the whole map, a spectator sees both sides, and the role icons and
// the side panel are drawn. The match is a plain CTF match underneath.

const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
const key = (w, code) => w.dispatchEvent(new w.KeyboardEvent('keydown', { code, bubbles: true, cancelable: true }));
const start = (w, map = 'castle', count = 4) => w.eval(`SETTINGS.mode='ctf'; SETTINGS.count=${count}; SETTINGS.itemRate=0; SETTINGS.ctfSpectate=true; CTF.forceMap='${map}'; beginMatchNow();`);
// the camera is on the map: the view sits inside the world (a world smaller than the view is centred)
const camOk = (w) => {
  const c = J(w, '{x:camX,y:camY,z:viewZoom(),W:W,H:H,WW:WW,WH:(CTF.map.pocketY!=null?CTF.map.pocketY:WH)}');
  const fit = (cam, view, world) => { const half = view / c.z / 2, mid = cam + view / 2; return world <= 2 * half ? Math.abs(mid - world / 2) < 2 : (mid - half >= -2 && mid + half <= world + 2); };
  return fit(c.x, c.W, c.WW) && fit(c.y, c.H, c.WH);
};

describe('spectating a CPU-only capture the flag match', () => {
  it('has no human: every fighter is a CPU, and the match runs from the hiding to an end with the camera on the map', () => {
    const { window: w } = loadMonolith(7);
    start(w);
    expect(w.eval('ctfSpecOn()')).toBe(true);
    expect(J(w, 'fighters.map(function(f){ return f.controller + ":" + f.you; })').every(s => s === 'ai:false')).toBe(true);
    expect(w.eval('fighters.some(ctfIsHuman)')).toBe(false);
    let bad = 0;
    for (let i = 0; i < 700; i++) { w.eval('step()'); if (i % 25 === 0) { w.eval('updateCamera(); draw()'); if (!camOk(w)) bad++; } }
    expect(w.eval('CTF.live.phase'), 'the CPUs bid and hid by themselves (the hiding is still on or play began)').toMatch(/hide|play/);
    w.eval('ctfEndHide(CTF.live)');
    for (let i = 0; i < 900; i++) { w.eval('step()'); if (i % 25 === 0) { w.eval('updateCamera(); draw()'); if (!camOk(w)) bad++; } }
    expect(w.eval('CTF.live.phase')).toBe('play');
    // team 0 carries every flag of team 1 home: the match is over, with nobody to play it
    w.eval(`(function(){ var L = CTF.live, c = fighters.find(function(f){ return f.team === 0; }); L.flags.filter(function(fl){ return fl.team === 1; }).forEach(function(fl){ ctfCapture(L, fl, c); }); ctfCheckWin(); })()`);
    expect(w.eval('CTF.live.over')).toBe(true);
    expect(w.eval('CTF.live.winner')).toBe(0);
    w.eval('updateCamera(); draw()');
    expect(camOk(w)).toBe(true);
    expect(bad, 'the camera never left the map').toBe(0);
  }, 120000);

  it('the keys: 1 and 2 lock a team, the arrows a fighter, Z the whole map, 0 back to auto; O and L toggle the icons and the panel', () => {
    const { window: w } = loadMonolith(8);
    start(w, 'castle', 6);
    w.eval('ctfEndHide(CTF.live)');
    for (let i = 0; i < 120; i++) w.eval('step()');
    expect(w.eval('CTF.spec.mode')).toBe('auto');
    key(w, 'Digit2'); expect([w.eval('CTF.spec.mode'), w.eval('CTF.spec.team')]).toEqual(['team', 1]);
    w.eval('updateCamera()'); expect(w.eval('ctfViewTeam()'), 'the screen is on the locked side').toBe(1);
    key(w, 'Digit1'); expect(w.eval('CTF.spec.team')).toBe(0);
    key(w, 'ArrowRight'); expect(w.eval('CTF.spec.mode')).toBe('fighter');
    const a = w.eval('CTF.spec.lock'); key(w, 'ArrowRight'); expect(w.eval('CTF.spec.lock'), 'the next fighter').not.toBe(a);
    key(w, 'ArrowLeft'); expect(w.eval('CTF.spec.lock')).toBe(a);
    w.eval('updateCamera()');
    const f = J(w, '{ x:fighters[CTF.spec.lock].x, y:fighters[CTF.spec.lock].y }');
    expect(Math.abs(w.eval('CTF.spec.fx') - f.x) < 1 && w.eval('CTF.spec.mode') === 'fighter', 'the camera is on the locked fighter').toBe(true);
    key(w, 'KeyZ'); expect(w.eval('CTF.spec.zoom')).toBe(true);
    for (let i = 0; i < 90; i++) w.eval('updateCamera()');
    expect(w.eval('CAM_ZOOM'), 'the whole map in view').toBeLessThan(0.15);
    w.eval('draw()'); expect(camOk(w)).toBe(true);
    key(w, 'Digit0'); expect([w.eval('CTF.spec.mode'), w.eval('CTF.spec.zoom')]).toEqual(['auto', false]);
    expect(w.eval('CTF.spec.icons')).toBe(false); key(w, 'KeyO'); expect(w.eval('CTF.spec.icons')).toBe(true);
    const p = w.eval('CTF.spec.panel'); key(w, 'KeyL'); expect(w.eval('CTF.spec.panel')).toBe((p + 1) % 3);
    for (let i = 0; i < 3; i++) { w.eval('updateCamera(); draw()'); key(w, 'KeyL'); }   // the icons and every panel level draw
  }, 120000);

  it('a spectator sees both sides, and an ordinary match is not a spectated one', () => {
    const { window: w } = loadMonolith(9);
    start(w);
    // in the hiding, with nothing placed yet, every flag still counts as seen
    w.eval('ctfEndHide(CTF.live)');
    expect(J(w, 'CTF.live.flags.map(function(fl){ return ctfFlagVisible(CTF.live, fl, 0); })').every(Boolean)).toBe(true);
    w.eval('fighters[2]._ghostT = 200');
    expect(w.eval('ctfHiddenFrom(fighters[2])'), 'a ghost boost hides nobody from a spectator').toBe(false);
    const { window: v } = loadMonolith(10);
    v.eval(`SETTINGS.mode='ctf'; SETTINGS.count=4; SETTINGS.ctfSpectate=false; CTF.forceMap='castle'; beginMatchNow();`);
    expect(v.eval('ctfSpecOn()')).toBe(false);
    expect(v.eval('fighters[0].controller')).toBe('local');
    expect(v.eval('CTF.spec')).toBe(null);
  }, 120000);
});
