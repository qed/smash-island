import { describe, it, expect } from 'vitest';
import { makePair } from './helpers/net-pair.js';
import { loadMonolith } from './helpers/load-monolith.js';

// "make the ui more optimised for multiplayer" (2026-10-05), results per player: after an online match the result screen shows each
// human's place, KOs and damage side by side, the same on every screen, and the host's numbers are the truth.
//
// Before: the result screen was the scorecard for everyone (the computer too), and its KO and fall columns read killCount and
// deaths -- counters only the comeback fighters keep -- so they said "0 KO" for nearly everyone; a client's copy of them came from
// the final snapshot, which carried the same wrong two. Damage was tallied (_dmgDealt, _dmgTaken) but nothing showed it, and a
// client never received it.
//
// Real matches: a host and a client are two pages (test/helpers/net-pair.js) joined by sockets that route as the relay does; the
// damage and the KOs are made by the host's own applyHit and blast zone, so the numbers are the ones the game tallies.

const run = (P, n) => { for (let i = 0; i < n; i++) P.frame(null); };

// Three humans -- Pen hosts, Leafy holds a seat (she sends no input), Firey is the client -- and one computer fighter.
async function threeHumans(opts = {}) {
  const P = await makePair({ mode: 'ffa', stageId: 'goiky', count: 4, stocks: 1, hostFighter: 'Pen', cliFighter: 'Firey', phantoms: [{ id: 'x', name: 'Leafy' }], ...opts });
  // The ceremony waits 700 ms on both ends (the pair stubs timers out): collect them, and run them when the test says time has passed.
  const timers = [];
  P.Hh.setTimeout = P.Cc.setTimeout = (fn) => { timers.push(fn); return 0; };
  P.later = () => { while (timers.length) timers.shift()(); };
  run(P, 20);
  P.Hh.eval(`fighters.forEach(function(f){ f.invuln = 0; if (f.idx === 3) f.controller = 'still'; });`);   // nobody gets hit but by the script
  return P;
}

// What the host did, hit by hit; then the match, KO by KO, so that Firey (the client) wins.
//   Pen   hits Leafy 30 + 20 and the computer 10, then 5 + 5 with each KO below   -> Pen   deals 70
//   Firey hits Pen 40, then 5 with the KO below                                   -> Firey deals 45
//   Leafy hits Firey 15                                                           -> Leafy deals 15
const PLAY_FFA = (P) => {
  P.Hh.eval(`(function(){ var f = fighters;
    applyHit(f[1], 30, 0, 0, f[0]); applyHit(f[1], 20, 0, 0, f[0]); applyHit(f[3], 10, 0, 0, f[0]);
    applyHit(f[0], 40, 0, 0, f[2]); applyHit(f[2], 15, 0, 0, f[1]);
  })()`);
  const ko = (idx, by) => { P.Hh.eval(`(function(){ var t = fighters[${idx}]; if (${by} >= 0) applyHit(t, 5, 0, 0, fighters[${by}]); t.x = -300; })()`); run(P, 4); };
  ko(1, 0);    // Pen KOs Leafy: 4th of 4
  ko(3, 0);    // Pen KOs the computer: 3rd
  ko(0, 2);    // Firey KOs Pen: 2nd; Firey is the last one standing
  run(P, 6);
  P.later();
};

const cardsOf = (w) => JSON.parse(w.eval(`JSON.stringify((function(){
  var box = document.getElementById('netResults');
  return { shown: box.style.display, active: document.getElementById('result').classList.contains('active'),
    head: (box.querySelector('.nrhead') || {}).textContent || '',
    cards: [].map.call(box.querySelectorAll('.nrcard'), function(c){
      return { slot: +c.dataset.slot, fighter: c.dataset.fighter, place: c.dataset.place, kos: +c.dataset.kos, dmg: +c.dataset.dmg, taken: +c.dataset.taken,
               you: c.classList.contains('you'), text: c.textContent, meta: c.querySelector('.nrmeta').textContent, placeText: c.querySelector('.nrplace').textContent,
               kosText: c.querySelector('.nrkos').textContent, dmgText: c.querySelector('.nrdmg').textContent }; }) };
})())`));
const bare = (cards) => cards.map(({ you, text, ...rest }) => ({ ...rest, name: text.replace(' (you)', '') }));   // the cards without which is "you"

describe('the host\'s counters reach every screen', () => {
  it('the final snapshot carries each fighter\'s place, KOs, falls and damage; a snapshot mid-match carries none of it', async () => {
    const P = await threeHumans();
    const mid = JSON.parse(P.Cc.eval(`JSON.stringify(NET.snapshot.fighters.map(function(f){ return [f.place, f.kos, f.falls, f.dmg, f.taken]; }))`));
    expect(mid, 'nothing new streams during a match').toEqual([[null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null], [null, null, null, null, null]]);
    PLAY_FFA(P);   // (the match is over by now)
    const host = JSON.parse(P.Hh.eval(`JSON.stringify(fighters.map(function(f){ return [f.placement, f._kos, f._falls, Math.round(f._dmgDealt), Math.round(f._dmgTaken)]; }))`));
    const sent = JSON.parse(P.Cc.eval(`JSON.stringify(NET.snapshot.fighters.map(function(f){ return [f.place, f.kos, f.falls, f.dmg, f.taken]; }))`));
    expect(sent, 'what the client was sent is what the host tallied').toEqual(host);
    expect(host.map((h) => h[0]), 'Pen 2nd, Leafy 4th, Firey 1st, the computer 3rd').toEqual([2, 4, 1, 3]);
    expect(host.map((h) => h[1]), 'KOs: Pen two, Firey one').toEqual([2, 0, 1, 0]);
    expect(host.slice(0, 3).every((h) => h[3] > 0), 'every human dealt damage').toBe(true);
    expect(host[3][3], 'the computer, held still, dealt none').toBe(0);
    expect(host[0][3], 'Pen dealt the most').toBeGreaterThan(host[2][3]);
  }, 120000);
});

describe('the players\' cards', () => {
  it('show every human\'s place, KOs and damage, side by side, the same on the host and on the client', async () => {
    const P = await threeHumans();
    PLAY_FFA(P);
    const h = cardsOf(P.Hh), c = cardsOf(P.Cc);
    for (const [n, s] of [['host', h], ['client', c]]) {
      expect(s.active, n + ' is on the result screen').toBe(true);
      expect(s.shown, n + ' shows the cards').toBe('block');
      expect(s.cards.map((x) => x.fighter), n + ': the three humans, not the computer, best place first').toEqual(['Firey', 'Pen', 'Leafy']);
      expect(s.cards.map((x) => x.placeText), n).toEqual(['1st 🥇', '2nd 🥈', '4th']);
      expect(s.cards.map((x) => x.kos), n).toEqual([1, 2, 0]);
    }
    // the same numbers and the same order on both screens; the only difference is which card is yours
    expect(bare(c.cards)).toEqual(bare(h.cards));
    expect(h.cards.map((x) => x.you), 'the host is Pen').toEqual([false, true, false]);
    expect(c.cards.map((x) => x.you), 'the client is Firey').toEqual([true, false, false]);
    // ...and they are the host's numbers
    const truth = JSON.parse(P.Hh.eval(`JSON.stringify(fighters.slice(0, 3).map(function(f){ return { fighter: f.name, kos: f._kos, dmg: Math.round(f._dmgDealt), taken: Math.round(f._dmgTaken) }; }))`));
    for (const t of truth) {
      const card = c.cards.find((x) => x.fighter === t.fighter);
      expect(card.kos, t.fighter + ' KOs').toBe(t.kos);
      expect(card.dmg, t.fighter + ' damage').toBe(t.dmg);
      expect(card.taken, t.fighter + ' damage taken').toBe(t.taken);
      expect(card.dmgText).toBe(t.dmg + '%');
      expect(card.text).toContain('took ' + t.taken + '%');
    }
    expect(c.cards.every((x) => x.dmg > 0)).toBe(true);
    expect(c.head).toBe('The players');
    expect(c.cards.map((x) => x.meta), 'slot, and who hosts').toEqual(['P3', 'P1 · HOST', 'P2']);
    expect(c.cards[0].text).toContain('KOs');
    expect(c.cards[0].text).toContain('Damage');
  }, 120000);

  it('are above the scorecard, which lists everyone (the computer too) and now counts KOs for every fighter', async () => {
    const P = await threeHumans();
    PLAY_FFA(P);
    const read = (w) => JSON.parse(w.eval(`JSON.stringify({ rows: [].map.call(document.querySelectorAll('#scorecard .scrow'), function(r){
        return { name: r.querySelector('.scname').textContent.replace(' YOU', ''), stats: r.querySelector('.scstats').textContent }; }),
      order: [].map.call(document.getElementById('result').children, function(e){ return e.id; }).filter(function(id){ return id === 'netResults' || id === 'scorecard'; }) })`));
    for (const [n, w] of [['host', P.Hh], ['client', P.Cc]]) {
      const s = read(w);
      expect(s.order, n + ': the players, then the scorecard').toEqual(['netResults', 'scorecard']);
      expect(s.rows.map((r) => r.name), n + ': four rows, the computer included').toHaveLength(4);
      const by = Object.fromEntries(s.rows.map((r) => [r.name, r.stats]));
      expect(by.Pen, n).toMatch(/^2 KO · \d+ falls?$/);
      expect(by.Firey, n).toMatch(/^1 KO · /);
      expect(by.Leafy, n).toMatch(/^0 KO · 1 fall$/);   // she fell once, and that was the stock she had
    }
    expect(read(P.Cc).rows, 'and the client\'s scorecard is the host\'s').toEqual(read(P.Hh).rows);
  }, 120000);

  it('show a team\'s place to each member, with the team on the card', async () => {
    // 2v1: Pen and Leafy (a seat) against Firey. Firey is knocked out, so Pen and Leafy's team wins.
    const P = await makePair({ mode: 'teams', teamKey: '2v1', stageId: 'goiky', count: 3, stocks: 1, hostFighter: 'Pen', cliFighter: 'Firey', phantoms: [{ id: 'x', name: 'Leafy' }] });
    const timers = [];
    P.Hh.setTimeout = P.Cc.setTimeout = (fn) => { timers.push(fn); return 0; };
    run(P, 20);
    // Both stand out in the open for the hit: in a two-team match each team's spawn is its own safe band down its side wall,
    // and nobody can attack out of their own zone (so a swing from where Leafy was formed up would score nothing).
    P.Hh.eval(`fighters.forEach(function(f){ f.invuln = 0; });  fighters[1].x = WW*0.5; fighters[1].y = WH*0.3; fighters[2].x = WW*0.5 + 60; fighters[2].y = WH*0.3;  applyHit(fighters[2], 25, 0, 0, fighters[1]); fighters[2].x = -300;`);
    run(P, 10);
    while (timers.length) timers.shift()();
    const h = cardsOf(P.Hh), c = cardsOf(P.Cc);
    for (const [n, s] of [['host', h], ['client', c]]) {
      expect(s.cards.map((x) => [x.fighter, x.place]), n + ': the winning team shares 1st (Leafy, who scored the KO, first of the two)').toEqual([['Leafy', '1'], ['Pen', '1'], ['Firey', '2']]);
      expect(s.cards.map((x) => x.meta), n).toEqual(['P2 · T1', 'P1 · HOST · T1', 'P3 · T2']);
      expect(s.cards[0].kos, n + ': Leafy got the KO').toBe(1);
    }
    expect(bare(c.cards)).toEqual(bare(h.cards));
  }, 120000);
});

describe('a player who left', () => {
  it('keeps their card, marked LEFT, on every screen: the computer played the rest of their seat', async () => {
    const P = await threeHumans();
    // Leafy's seat leaves: the relay's roster loses her (the same two messages bug-pass sends), and the host gives her seat to the computer
    const roster = JSON.stringify({ t: 'roster', players: [{ id: 'h', name: 'Pen', isHost: true }, { id: 'c', name: 'Firey', isHost: false }] });
    P.Hh.eval(`NET.onMessage(${roster})`); P.Cc.eval(`NET.onMessage(${roster})`);
    expect(P.Hh.eval(`fighters[1].controller`)).toBe('ai');
    P.Hh.eval(`fighters[1].controller = 'still';`);   // (so the seat the computer took does not swing at anyone)
    PLAY_FFA(P);
    for (const [n, w] of [['host', P.Hh], ['client', P.Cc]]) {
      const s = cardsOf(w);
      expect(s.cards.map((x) => x.fighter), n + ': she is still listed, at her place').toEqual(['Firey', 'Pen', 'Leafy']);
      expect(s.cards.map((x) => x.meta), n + ': and marked').toEqual(['P3', 'P1 · HOST', 'P2 · LEFT']);
    }
    expect(bare(cardsOf(P.Cc).cards)).toEqual(bare(cardsOf(P.Hh).cards));
  }, 120000);
});

describe('and only where they mean something', () => {
  it('a match still being played shows no cards, and no text of the results', async () => {
    const P = await threeHumans();
    for (const [n, w] of [['host', P.Hh], ['client', P.Cc]]) {
      const s = cardsOf(w);
      expect(s.cards, n).toEqual([]);
      expect(s.shown, n).toBe('none');
      expect(s.active, n + ': the result screen is not up').toBe(false);
    }
  }, 120000);

  it('Boss Rush has no places and credits no damage to a player, so it keeps its own Defeated card', async () => {
    const P = await makePair({ mode: 'boss', count: 2 });
    const timers = [];
    P.Hh.setTimeout = P.Cc.setTimeout = (fn) => { timers.push(fn); return 0; };
    run(P, 30);
    P.Hh.eval('fighters.forEach(function(f){ f.stocks = 1; f.x = -300; });');
    run(P, 30);
    while (timers.length) timers.shift()();
    for (const [n, w] of [['host', P.Hh], ['client', P.Cc]]) {
      const s = cardsOf(w);
      expect(s.cards, n).toEqual([]);
      expect(s.shown, n).toBe('none');
      expect(w.eval(`document.getElementById('resultTitle').textContent`), n).toBe('Defeated');
    }
  }, 120000);

  it('a solo match has none, and its scorecard counts every fighter\'s KOs and falls too', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      SETTINGS.mode = 'ffa'; SETTINGS.count = 3; SETTINGS.stocks = 3; startMatch();
      var a = fighters[0], b = fighters[1];
      a._kos = 3; a._falls = 1; b._kos = 0; b._falls = 3; a.placement = 1; b.placement = 2; fighters[2].placement = 3;
      showResult([a], a.team);
      return { cards: document.getElementById('netResults').style.display,
        rows: [].map.call(document.querySelectorAll('#scorecard .scrow'), function(r){ return r.querySelector('.scstats').textContent; }) };
    })()`);
    expect(r.cards).toBe('none');
    expect(r.rows[0], 'the winner').toBe('3 KO · 1 fall');
    expect(r.rows[1]).toBe('0 KO · 3 falls');
  });

  it('draw a name, a colour and numbers off the wire as text: nothing a peer sends becomes markup', () => {
    const { window: w } = loadMonolith();
    const r = w.eval(`(function(){
      SETTINGS.mode = 'ffa'; SETTINGS.count = 2; startMatch();
      NET.role = 'client'; NET.myIdx = 1; window.__netRoster = ['x', 'y'];
      fighters[0].name = '<img src=x onerror=window.__pwned=1>'; fighters[0].color = 'red;background:url(x)'; fighters[0]._kos = '<b>9</b>'; fighters[0]._dmgDealt = 'NaN'; fighters[0].placement = 1;
      fighters[1].name = 'constructor'; fighters[1].placement = 2;
      renderNetResults();
      var box = document.getElementById('netResults'), names = [].map.call(box.querySelectorAll('.nrname'), function(e){ return e.textContent; });
      return { shown: box.style.display, imgs: box.querySelectorAll('img[src="x"]').length, bold: box.querySelectorAll('b b, .nrcard b > *').length,
        names: names, pwned: window.__pwned === 1, kos: [].map.call(box.querySelectorAll('.nrkos'), function(e){ return e.textContent; }),
        dmg: [].map.call(box.querySelectorAll('.nrdmg'), function(e){ return e.textContent; }) };
    })()`);
    expect(r.shown).toBe('block');
    expect(r.imgs, 'a name is not markup').toBe(0);
    expect(r.bold).toBe(0);
    expect(r.pwned).toBe(false);
    expect(r.names.map((n) => n.replace(' (you)', ''))).toEqual(['<img src=x onerror=window.__pwned=1>', 'constructor']);
    expect(r.kos[0], 'a count that is not a number is 0, not text').toBe('0');
    expect(r.dmg[0]).toBe('0%');
  });

  it('leaving the result screen takes the cards away, so a later result never inherits them', async () => {
    const P = await threeHumans();
    PLAY_FFA(P);
    expect(cardsOf(P.Cc).cards).toHaveLength(3);
    P.Cc.eval(`go('select')`);
    expect(cardsOf(P.Cc).cards).toEqual([]);
    expect(cardsOf(P.Cc).shown).toBe('none');
  }, 120000);
});
