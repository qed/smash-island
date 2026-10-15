import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// ASYMMETRIC MAPS AND THE SIDE BID (the owner, 2026-10-15). A map with two different halves (side A the fortress, side B the meadow on the Old Oak map): the halves are built apart and joined,
// and a secret bid before the hiding decides the sides. Different halves wanted: each gets its own, nothing is paid. The same half: the higher bid takes it and pays that many points a fighter
// to the other side, which gets the other half, an EXTRA KEY each and ONE EXTRA FLAG to hide (so the winner has one more to capture).

const J = (w, code) => JSON.parse(w.eval(`JSON.stringify(${code})`));
const step = (w, n = 1) => { for (let i = 0; i < n; i++) w.eval('step()'); };
const press = (w, k, n = 2) => { w.eval(`down[KEYS.${k}]=true`); step(w, n); w.eval(`down[KEYS.${k}]=false`); step(w, 2); };
const start = (w) => w.eval(`CTF.skipNav=true; SETTINGS.mode='ctf'; SETTINGS.count=10; SETTINGS.itemRate=0; CTF.forceMap='oak'; beginMatchNow();`);

describe('asymmetric maps and the side bid', () => {
  it('two different halves, joined; swapped by the bid: side A on the other side with its own geometry', () => {
    const { window: w } = loadMonolith(61);
    const r = J(w, `(function(){ var a = ctfMapGet('oak', false), b = ctfMapGet('oak', true);
      return { wa:a.WW, wb:b.WW, ga:a.gid, gb:b.gid, aSw:!!a.swap, bSw:!!b.swap, h0a:a.homes[0].spawns[0].x, h0b:b.homes[0].spawns[0].x, h1a:a.homes[1].spawns[0].x, h1b:b.homes[1].spawns[0].x,
        mirrored:a.plats.every(function(p){ return a.plats.some(function(q){ return Math.round(q.x) === Math.round(a.WW - p.x - p.w) && Math.round(q.y) === Math.round(p.y) && Math.round(q.w) === Math.round(p.w) && Math.round(q.h) === Math.round(p.h); }); }) }; })()`);
    expect(r.wa).toBe(r.wb); expect(r.ga).toBe('oak'); expect(r.gb).toBe('oak~'); expect(r.aSw).toBe(false); expect(r.bSw).toBe(true);
    expect(r.mirrored, 'the halves are not each other\'s mirror').toBe(false);
    expect(Math.abs(r.h0a - r.h0b), 'the home of team 0 is in a different place on the other half').toBeGreaterThan(1000);
    expect(r.h0a + r.h1a, 'a home is the mirror of the home across the line').not.toBe(r.wa);
  });

  it('a match of CPUs only settles the bid by itself and goes on to the hiding', () => {
    const { window: w } = loadMonolith(62);
    start(w);
    expect(w.eval('CTF.live.phase'), 'one human: waiting for the bid').toBe('bid');
    w.eval(`fighters.forEach(function(f){ f.controller = 'ai'; f.you = false; })`);
    step(w, 5);
    expect(w.eval('CTF.live.phase')).toBe('hide');
    expect(w.eval('!!CTF.bidRes')).toBe(true);
  });

  it('different halves wanted: each gets its own, nothing paid; the same half: the higher bid wins, pays, and the loser gets a key each and one more flag to hide', () => {
    const { window: w } = loadMonolith(63);
    start(w);
    // the human picks half B (right): the CPU side wants A (the better one): two different halves
    press(w, 'right'); press(w, 'flag');
    expect(w.eval('CTF.live.phase')).toBe('hide');
    expect(J(w, 'CTF.bidRes.lo'), 'nobody lost the bid').toBe(-1);
    expect(w.eval('!!CTF.map.swap'), 'team 0 plays half B: the halves are swapped').toBe(true);
    expect(w.eval('CTF.live.flags.length')).toBe(10);
    expect(J(w, 'fighters.map(function(f){ return CTF.live.pts[f.idx]; })').every(v => v === 20)).toBe(true);
    // again: the human wants A as well and bids the most
    const { window: v } = loadMonolith(64);
    start(v);
    press(v, 'left'); for (let i = 0; i < 9; i++) press(v, 'jump'); press(v, 'flag');
    expect(v.eval('CTF.live.phase')).toBe('hide');
    const res = J(v, 'CTF.bidRes');
    expect(res.win, 'the human side won the half').toBe(0); expect(res.lo).toBe(1); expect(res.pay).toBe(10);
    expect(v.eval('!!CTF.map.swap'), 'team 0 keeps half A').toBe(false);
    expect(J(v, 'fighters.filter(function(f){ return f.team === 0; }).map(function(f){ return CTF.live.pts[f.idx]; })').every(x => x === 10), 'the winner paid 10 each').toBe(true);
    expect(J(v, 'fighters.filter(function(f){ return f.team === 1; }).map(function(f){ return CTF.live.pts[f.idx]; })').every(x => x === 30), 'the loser got 10 each').toBe(true);
    expect(v.eval('CTF.live.flags.length'), 'an extra flag').toBe(11);
    expect(J(v, '[ctfNeed(CTF.live, 0), ctfNeed(CTF.live, 1)]'), 'the winner has one more to capture').toEqual([6, 5]);
    expect(v.eval('CTF.live.xFlag.team'), 'the loser hides it').toBe(1);
    // play: the loser's fighters have two keys, and the extra flag is put down by the hiders
    v.eval(`fighters.forEach(function(f){ f.controller = 'ai'; f.you = false; })`);
    step(v, 700);
    expect(v.eval('CTF.live.xFlag.st'), 'the extra flag was hidden').toBe(1);
    v.eval('ctfEndHide(CTF.live)');
    expect(J(v, 'fighters.filter(function(f){ return f.team === 1; }).map(function(f){ return f._pk; })').every(k => k === 2), 'two personal keys for the side that lost').toBe(true);
    expect(J(v, 'fighters.filter(function(f){ return f.team === 0; }).map(function(f){ return f._pk; })').every(k => k === true), 'one for the winner').toBe(true);
  });
});
