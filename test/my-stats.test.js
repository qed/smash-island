import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// "add my winrates." The AI brackets are the bot piloting a kit; the player's own record is a
// different number (the owner: 81% on Puffball over a hundred-odd matches, against the bot's 11%).
// MY STATS shows every fighter the player has held, their rate beside the bot's baked bracket rate
// for the same fighter, and a Copy button that puts the table on the clipboard as text.

const LOG = [
  ...Array.from({ length: 10 }, (_, i) => ({ fighters: [{ name: 'Puffball', you: true, won: i < 8, kos: 2 }, { name: 'Firey', won: i >= 8 }] })),
  ...Array.from({ length: 4 }, (_, i) => ({ fighters: [{ name: 'Leafy', controller: 'local', won: i < 2, kos: 1 }, { name: 'Pen', won: i >= 2 }] })),
  { fighters: [{ name: 'Needle', you: true, won: false, kos: 0 }, { name: 'Coiny', won: true }] },
  { fighters: [{ name: 'Pen', won: true }, { name: 'Coiny', won: false }] },   // nobody local: not the player's
];

describe('MY STATS — the player beside the bot', () => {
  it('lists every fighter the player has held when asked for all, most-played first', () => {
    const { window: w } = loadMonolith();
    const all = w.eval(`myMains(${JSON.stringify(LOG)}, 0).map(function(m){ return m.name + ':' + m.wins + '/' + m.games; })`);
    expect(all).toEqual(['Puffball:8/10', 'Leafy:2/4', 'Needle:0/1']);
    const two = w.eval(`myMains(${JSON.stringify(LOG)}, 2).length`);
    expect(two).toBe(2);
  });

  it("renders the bot's bracket rate for the same fighter beside the player's, with its rank", () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      renderMyStats(myMains(${JSON.stringify(LOG)}, 0));
      var rows = Array.prototype.slice.call(document.querySelectorAll('#statsTable .statrow'));
      var head = rows.shift().textContent;
      return { head: head, rows: rows.map(function(d){ return Array.prototype.map.call(d.querySelectorAll('.statnum'), function(x){ return x.textContent; }); }),
               aiTitle: rows[0].querySelector('.statnum.ai').title, puff: Math.round(bakedWinRate('Puffball')*100) + '%', n: BAKED_RANK._n };
    })()`);
    expect(r.head).toContain('AI');
    expect(r.rows[0], "Puffball: games, the player's rate, the bot's rate").toEqual(['10', '80%', r.puff]);
    expect(r.aiTitle).toMatch(new RegExp('rank #\\d+ of ' + r.n));
    expect(r.n).toBeGreaterThanOrEqual(59);
  });

  it('copies the table as text with both numbers on every line, and a json line to paste', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      var mains = myMains(${JSON.stringify(LOG)}, 0);
      var text = myStatsText(mains);
      return { text: text, puff: Math.round(bakedWinRate('Puffball')*100) };
    })()`);
    const lines = r.text.split('\n');
    expect(lines[0]).toMatch(/^Battle for Smash Island — my stats \(\d{4}-\d{2}-\d{2}\)$/);
    expect(lines[2]).toMatch(new RegExp('^Puffball \\| 10 \\| 80% \\| ' + r.puff + '% \\(#\\d+ of \\d+\\)$'));
    const json = JSON.parse(lines[lines.length - 1].replace(/^json: /, ''));
    expect(json.Puffball).toEqual({ games: 10, wins: 8, kos: 20 });
    expect(json.Needle).toEqual({ games: 1, wins: 0, kos: 0 });
  });

  it('has the Copy button on the screen, and falls back to a selectable field without a clipboard', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      var btn = document.querySelector('#stats button[onclick*="copyMyStats"]');
      renderMyStats(myMains(${JSON.stringify(LOG)}, 0));
      try { Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }); } catch(e) {}
      copyMyStats(btn);
      var ta = document.querySelector('#statsCopy textarea');
      return { button: !!btn, field: !!ta, holds: ta ? ta.value.indexOf('Puffball | 10 | 80%') >= 0 : false };
    })()`);
    expect(r.button).toBe(true);
    expect(r.field).toBe(true);
    expect(r.holds).toBe(true);
  });
});

describe('MY STATS — review findings', () => {
  it('a clipboard that refuses falls back to the selectable field instead of saying Copied', async () => {
    const { window: w } = loadMonolith();
    w.eval(`renderMyStats(myMains(${JSON.stringify(LOG)}, 0));
      Object.defineProperty(navigator, 'clipboard', { value: { writeText: function(){ return Promise.reject(new Error('NotAllowedError')); } }, configurable: true });`);
    const btn = w.eval(`(function(){ var b = document.querySelector('#stats button[onclick*="copyMyStats"]'); copyMyStats(b); return b.textContent; })()`);
    await new Promise((res) => setTimeout(res, 20));
    const r = w.eval(`({ field: !!document.querySelector('#statsCopy textarea'), btn: document.querySelector('#stats button[onclick*="copyMyStats"]').textContent })`);
    expect(r.field).toBe(true);
    expect(r.btn, 'no false Copied').not.toMatch(/Copied/);
  });

  it('opening the screen again clears the last visit: no stale field, no stale copy', async () => {
    const { window: w } = loadMonolith();
    await w.eval('profileReady');
    w.eval(`renderMyStats(myMains(${JSON.stringify(LOG)}, 0));
      Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
      copyMyStats(null);`);
    expect(w.eval("!!document.querySelector('#statsCopy textarea')")).toBe(true);
    await w.eval('openStats()');
    expect(w.eval("!!document.querySelector('#statsCopy textarea')")).toBe(false);
    expect(w.eval('MY_STATS_CACHE.length')).toBe(0);
  });
});
