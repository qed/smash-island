import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "stocks only render on the hosts side for multiplayer, for others they get stuck at 3 visually" (2026-09-23).
// The snapshot always carried stocks. What never happened on a client was the HUD refresh: updateHUD only ran
// inside step(), and a client never runs step() -- it draws the host's snapshot. So every card on a client kept
// the numbers it was built with. Found alongside it: Infinity stocks arrived as null over JSON and drew nothing,
// and a client's cards could name the wrong CPU fighters, because it fills those slots at random.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// Host a match, take the host's snapshot, then play the client: apply it and run one client frame of loop().
const asClient = (hostBody) => W.eval(`(function(){
  SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.itemRate=0; SETTINGS.stocks=3;
  chosen = ROSTER.find(function(r){ return r.name==='Pen'; });
  window.NET = null; startMatch();
  ${hostBody}
  var snap = JSON.parse(JSON.stringify(serializeState()));        // exactly what crosses the wire
  var sentNames = snap.fighters.map(function(f){ return f.name; });
  // the client's own lineup: same slots, different CPU picks, as buildFighters would roll them
  fighters.forEach(function(f, i){ if(i>0) f.name = 'Wrong' + i; });
  buildHUD();
  var prevNet = window.NET, prevRaf = window.requestAnimationFrame;
  window.NET = { role:'client', myIdx:0, snapshot:snap, sendInput:function(){}, broadcastState:function(){}, inputs:{} };
  running = true; paused = false;
  window.requestAnimationFrame = function(){ return 0; };
  try { loop(); } finally { window.NET = prevNet; window.requestAnimationFrame = prevRaf; running = false; }
  var cards = Array.prototype.map.call(document.querySelectorAll('#hudbar .pcard'), function(c){
    return { i: +c.dataset.i, name: c.querySelector('.nm').textContent, stk: c.querySelector('.stk').textContent, pct: c.querySelector('.pct').textContent }; });
  return { cards: cards, sentNames: sentNames };
})()`);

describe("a client's HUD follows the host", () => {
  it('shows the stocks and damage the host has, not the ones the match started with', () => {
    const r = asClient(`fighters[1].stocks = 1; fighters[1].pct = 87.4; fighters[2].stocks = 2;`);
    const c1 = r.cards.find((c) => c.i === 1), c2 = r.cards.find((c) => c.i === 2);
    expect(c1.stk, 'down to one stock on the host').toBe('●');
    expect(c2.stk).toBe('●●');
    expect(c1.pct).toBe('87.4%');
  });

  it("names the host's fighters even when the client rolled different CPUs", () => {
    const r = asClient(``);
    expect(r.cards.map((c) => c.name)).toEqual(r.sentNames);
  });

  it('shows infinite stocks as infinite, not as nothing', () => {
    const r = asClient(`fighters.forEach(function(f){ f.stocks = Infinity; });`);
    expect(r.cards.every((c) => c.stk === '∞')).toBe(true);
  });
});
