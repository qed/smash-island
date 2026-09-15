import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// "order the characters by appearance in the show." SHOW_ORDER is each fighter's first animated
// appearance by air date, researched on the BFDI wiki and ordered twice independently (the two agreed
// on all 59): the original twenty in the order Take the Plunge: Part 1 introduces them, then the
// recommended characters from the episode they first appear in, then BFDIA, BFB, BFDIE and TPOT
// newcomers. It is display order only; ROSTER keeps the order seeded matches, tests and unlocks use.

describe('the fighters are shown in the order they appear in the show', () => {
  it('SHOW_ORDER names every playable fighter exactly once', () => {
    const { window: w } = loadMonolith();
    const r = w.eval('({ order: SHOW_ORDER, play: ROSTER.filter(function(x){ return x.play; }).map(function(x){ return x.name; }) })');
    expect(r.order.length).toBe(new Set(r.order).size);
    expect([...r.order].sort()).toEqual([...r.play].sort());
  });

  it('opens on the first scene of BFDI 1 and closes on the newest debuts', () => {
    const { window: w } = loadMonolith();
    const order = w.eval('SHOW_ORDER');
    expect(order.slice(0, 4)).toEqual(['Match', 'Pencil', 'Flower', 'Ice Cube']);
    expect(order.indexOf('Golf Ball'), 'the original twenty come first').toBeLessThan(order.indexOf('Yellow Face'));
    expect(order.indexOf('Puffball'), 'BFDIA before BFB').toBeLessThan(order.indexOf('Liy'));
    expect(order.slice(-2)).toEqual(['Money', 'Fern']);
  });

  it('the select board lists them in that order, in every view', async () => {
    const { window: w } = loadMonolith();
    await w.eval('profileReady');
    for (const mode of ['starters', 'unlocked', 'everything']) {
      const r = w.eval(`(function(){ PROFILE.viewMode=${JSON.stringify(mode)}; buildBoard();
        var names = Array.prototype.slice.call(document.querySelectorAll('#board .cell')).filter(function(c){ return !c.classList.contains('rostertoggle'); })
          .map(function(c){ return c.querySelector('.cellname').textContent; });
        return { names: names, order: SHOW_ORDER };
      })()`);
      const idx = r.names.map((n) => r.order.indexOf(n));
      expect(idx.every((v, i) => i === 0 || v > idx[i - 1]), `${mode}: ${r.names.join(', ')}`).toBe(true);
      expect(r.names.length).toBeGreaterThan(0);
    }
  });

  it('so does the multiplayer fighter picker, and ROSTER itself is untouched', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      NET.role='host'; NET.players=[{ id:'me', name:'Firey', isHost:true }]; NET.ws={ readyState:1, send:function(){}, close:function(){} };
      NET.renderLobby();
      var opts = Array.prototype.map.call(document.getElementById('lobbyFighter').options, function(o){ return o.value; });
      return { opts: opts, order: SHOW_ORDER, first: ROSTER[0].name };
    })()`);
    const idx = r.opts.map((n) => r.order.indexOf(n));
    expect(idx.every((v, i) => i === 0 || v > idx[i - 1])).toBe(true);
    expect(r.first, 'ROSTER order is what seeded matches and unlocks depend on').toBe('Firey');
  });
});
