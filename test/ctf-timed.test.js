import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// TIMED PIECES AND TIDES (the owner, 2026-10-17: falling platforms that come back, cave-ins that open and close routes, a tide that rises and falls with a readable water line): a crumbling ledge gives way a moment after somebody has stood on it
// and grows back; a plug of rock opens and shuts on the clock of the match and never shuts on somebody in the way; a tide's level is a function of the same clock, with a warning before each move; and the pieces' states ride the snapshot.

const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
function start(w, map = 'mines') {
  w.eval(`CTF.skipNav=true; SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.forceMap='${map}'; beginMatchNow(); fighters.forEach(function(f){ f.controller='still'; f.you=false; }); ctfEndHide(CTF.live);`);
}

describe('timed pieces and tides', () => {
  it('a tide stands low, warns, rises, stands high, warns, falls; the water of the match follows it', () => {
    const { window: w } = loadMonolith(101);
    const td = { lo:0, hi:1, hold:900, move:300, warn:150, phase:0 };
    const at = (T) => J(w, `ctfTideLevel(${JSON.stringify(td)}, ${T})`);
    expect(at(0), 'low at the start').toEqual({ lv:0, warn:0 });
    expect(at(800).warn, 'a warning before the rise (the line flashes, an arrow up)').toBe(1);
    expect(at(1050).warn, 'rising').toBe(2); expect(at(1050).lv).toBeGreaterThan(0.3); expect(at(1050).lv).toBeLessThan(0.7);
    expect(at(1300).lv, 'high').toBe(1); expect(at(2000).warn, 'a warning before the fall').toBe(-1); expect(at(2250).warn, 'falling').toBe(-2);
    expect(at(2400), 'the cycle is 2400 steps').toEqual({ lv:0, warn:0 });
    // the match: Coral Deep's tides move the water zones the physics reads (by L.playT)
    start(w);
    expect(w.eval('CTF.live.tides.length'), 'Coral Deep has tides (each side its own)').toBeGreaterThan(0);
    const h0 = J(w, 'CTF.live.tides.map(function(z){ return Math.round(z.h); })');
    w.eval(`CTF.live.playT = 1300; ctfStepTimed(CTF.live);`);
    const h1 = J(w, 'CTF.live.tides.map(function(z){ return Math.round(z.h); })'), full = J(w, 'CTF.live.tides.map(function(z){ return Math.round(z.h0); })');
    expect(h0.some(h => h === 0), 'a tide that is low at the start is dry (the crawl, on the opposite half of the tide, starts full)').toBe(true);
    expect(h1.some((h, i) => h === full[i]), 'a tide at its highest fills the whole depth').toBe(true);
  });

  it('a crumbling ledge gives way after somebody has stood on it, is gone for its time, and comes back', () => {
    const { window: w } = loadMonolith(102);
    start(w);
    const n = J(w, 'CTF.live.timed.filter(function(q){ return q.tm.kind === "crumble"; }).length');
    expect(n, 'Coral Deep has crumbling stepping-stones').toBeGreaterThan(0);
    w.eval(`(function(){ var L = CTF.live, q = L.timed.find(function(q){ return q.tm.kind === 'crumble'; }), f = fighters[0]; window.__q = q; f.dead = false; f.onground = true; f.x = q.wp.x + q.w0/2; f.y = q.wp.y - f.r; })()`);
    const delay = w.eval('__q.tm.delay'), back = w.eval('__q.tm.back');
    w.eval(`for(var i = 0; i < ${delay - 2}; i++) ctfStepTimed(CTF.live);`);
    expect(w.eval('__q.st'), 'still there a moment before').toBe(0); expect(w.eval('__q.warn'), 'it shakes before it goes').toBe(true);
    w.eval(`for(var i = 0; i < 4; i++) ctfStepTimed(CTF.live);`);
    expect(w.eval('__q.st'), 'gone').toBe(2); expect(w.eval('__q.wp.w'), 'with no width: nothing touches it').toBe(0);
    w.eval(`fighters[0].onground = false; fighters[0].y -= 400; for(var i = 0; i < ${back - 8}; i++) ctfStepTimed(CTF.live);`);
    expect(w.eval('__q.st'), 'still gone').toBe(2);
    w.eval(`for(var i = 0; i < 10; i++) ctfStepTimed(CTF.live);`);
    expect(w.eval('__q.st'), 'back').toBe(0); expect(w.eval('__q.wp.w === __q.w0'), 'whole again').toBe(true);
  });

  it('a plug opens and shuts on the clock of the match, warns before each change, and does not shut on somebody in the way', () => {
    const { window: w } = loadMonolith(103);
    start(w);
    expect(w.eval('CTF.live.timed.some(function(q){ return q.tm.kind === "plug"; })'), 'the mines have plugs of loose rock').toBe(true);
    w.eval(`(function(){ var q = CTF.live.timed.find(function(q){ return q.tm.kind === 'plug'; }); window.__q = q; q.tm = { kind:'plug', open:600, shut:600, phase:0 }; })()`);
    const at = (T) => { w.eval(`CTF.live.playT = ${T}; ctfStepTimed(CTF.live);`); return { st:w.eval('__q.st'), warn:w.eval('__q.warn'), w:w.eval('__q.wp.w') }; };
    expect(at(10), 'open at first').toMatchObject({ st:2, w:0 });
    expect(at(560).warn, 'a warning before it shuts').toBe(true);
    // somebody stands where it would shut: it waits
    w.eval(`(function(){ var q = __q, f = fighters[0]; f.dead = false; f.x = q.wp.x + 20; f.y = q.wp.y + q.wp.h/2; })()`);
    expect(at(700).st, 'a fighter in the way: it stays open').toBe(2);
    w.eval(`fighters[0].y = -2000`);
    expect(at(701), 'clear: it shuts').toMatchObject({ st:0 }); expect(w.eval('__q.wp.w === __q.w0')).toBe(true);
    expect(at(1180).warn, 'and a warning before it opens').toBe(true);
    expect(at(1250).st, 'open again').toBe(2);
  });

  it('the pieces\' states ride the snapshot, and a guest sets its pieces from them', () => {
    const { window: w } = loadMonolith(104);
    start(w);
    w.eval(`(function(){ var L = CTF.live; L.timed[0].st = 2; L.timed[0].wp.w = 0; L.timed[1].warn = true; })()`);
    const o = J(w, 'ctfNetOut()');
    expect(o && o.tm && o.tm[0], 'gone is 2').toBe(2); expect(o.tm[1] & 4, 'a warning is bit 4').toBe(4);
    w.eval(`(function(){ var L = CTF.live; L.timed[0].st = 0; L.timed[0].wp.w = L.timed[0].w0; L.timed[1].warn = false; })()`);
    w.eval(`ctfNetIn(${JSON.stringify(o)})`);
    expect(w.eval('CTF.live.timed[0].wp.w'), 'the guest sees it gone').toBe(0); expect(w.eval('CTF.live.timed[1].warn')).toBe(true);
  });
});
