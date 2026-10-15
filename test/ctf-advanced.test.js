import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// CAPTURE THE FLAG, ADVANCED RULES: bargaining (budget offers) and points for speed appear only when the player turns them on (the CTF settings, or the host in the online lobby). Off by default.
// Off, everyone builds with the base points, moves at one speed, and the tool bar has no offer tool.

function start(w) {
  w.eval(`CTF.skipNav=true; SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.forceMap='castle'; beginMatchNow();
          fighters.forEach(function(f){ f.controller='still'; f.you=false; }); ctfEndHide(CTF.live);`);
}
const mate = (w, t, k = 0) => w.eval(`fighters.filter(function(f){ return f.team===${t}; })[${k}].idx`);

describe('capture the flag: advanced rules', () => {
  it('are off by default: no offer tool, no offers, no sacrifice, no speed difference', () => {
    const { window: w } = loadMonolith(61);
    expect(w.eval('ctfAdvOn()')).toBe(false);
    expect(w.eval('ctfToolN()'), 'six tools: the offer tool is not there').toBe(6);
    expect(w.eval('CTF_TOOLS[ctfToolN() - 1]')).toBe('remove');
    start(w);
    const a = mate(w, 0), b = mate(w, 1), k = (i) => w.eval(`ctfSpeedK(fighters[${i}])`);
    const a0 = k(a), b0 = k(b);
    w.eval('CTF.live.bonus = [30, 0]');
    expect(k(a), 'a bonus does nothing to speed').toBeCloseTo(a0, 6); expect(k(b)).toBeCloseTo(b0, 6);
    w.eval(`CTF.live.offerCool = 0; fighters[${a}]._piece = 0; CTF.live.pts[${a}] = 20`);
    expect(w.eval(`ctfEditOffer(fighters[${a}])`), 'no offer').toBe(false);
    expect(w.eval('CTF.live.offer')).toBe(null);
    w.eval(`ctfSacrifice(CTF.live, 0)`);
    expect(w.eval(`CTF.live.pts[${a}]`), 'no sacrifice').toBe(20);
    w.eval(`fighters[${a}]._tool = 5; ctfEditStep(CTF.live)`);   // the last tool cycles back to the first, never to the offer tool
    w.eval(`(function(){ var f = fighters[${a}]; f._tool = ((f._tool || 0) + 1) % ctfToolN(); })()`);
    expect(w.eval(`fighters[${a}]._tool`)).toBe(0);
  });

  it('turned on, the offer tool, the bargain and the speed come back', () => {
    const { window: w } = loadMonolith(62);
    w.eval('ctfAdvSet(true)');
    expect(w.eval('ctfAdvOn()')).toBe(true);
    expect(w.eval('ctfToolN()')).toBe(7);
    start(w);
    const a = mate(w, 0), k = (i) => w.eval(`ctfSpeedK(fighters[${i}])`);
    const a0 = k(a);
    w.eval('CTF.live.bonus = [10, 0]');
    expect(k(a) / a0, 'us +10: 8% slower').toBeCloseTo(0.92, 3);
  });

  it('is remembered, and the settings screen shows the toggle (off) beside the map choice', () => {
    const { window: w } = loadMonolith(63);
    w.eval(`SETTINGS.mode = 'ctf'; ctfBuildMapButtons();`);
    const r = JSON.parse(w.eval(`JSON.stringify(Array.prototype.map.call(document.querySelectorAll('#segCtfMap button'), function(b){ return [b.dataset.v, b.classList.contains('on')]; }))`));
    const adv = r.find(([v]) => v === 'adv');
    expect(adv, 'a toggle named adv').toBeTruthy();
    expect(adv[1], 'off').toBe(false);
    w.eval(`document.querySelector('#segCtfMap button[data-v=adv]').click()`);
    expect(w.eval('ctfAdvOn()')).toBe(true);
    expect(w.eval(`localStorage.getItem('bfsi:ctfadv')`)).toBe('1');
  });

  it('the online lobby carries the host\'s choice, and a guest plays the match by it', () => {
    const { window: w } = loadMonolith(64);
    w.eval(`SETTINGS.mode = 'ctf'; ctfAdvSet(true);`);
    expect(w.eval('NET.lobbySettings().ctfAdv'), 'the host\'s lobby message').toBe(true);
    w.eval(`ctfAdvSet(false)`);
    expect(w.eval('NET.lobbySettings().ctfAdv')).toBe(false);
    expect(w.eval(`lobbySummaryText({ mode:'ctf', count:10, stocks:3, ctfAdv:true, ai:1, itemRate:2, mapSize:'normal', stage:'goiky' })`)).toMatch(/advanced rules/);
    expect(w.eval(`lobbySummaryText({ mode:'ctf', count:10, stocks:3, ctfAdv:false, ai:1, itemRate:2, mapSize:'normal', stage:'goiky' })`)).not.toMatch(/advanced rules/);
  });
});
