import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';
import { SETUP_SRC } from './helpers/match-setup.js';

// "do it like in training - they can learn new strats" (the owner, 2026-10-14). The general CPU uses every move a converted fighter has,
// and the trainer has genes for how much. (Fighters with no moveset play exactly as before: the golden replays in bot-playbooks hold that.)

const FIGHTERS = ['Puffball', 'Bow', 'Pencil', 'Leafy'];
let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); W.eval(SETUP_SRC); });

// two CPUs, one of them the fighter, Hard, flat stage, 1500 frames; returns what the fighter used
const play = (name, foe, seed, frames = 1500, close = false) => {
  W.Math.random = ((a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; })(seed);
  return JSON.parse(W.eval(`(function(){
    __setupCustomMatch([${JSON.stringify(name)}, ${JSON.stringify(foe)}], 3, 2, 0);
    var F = fighters[0], errs = [];
    for (var i = 0; i < ${frames}; i++) { if (${close} && i % 50 === 0 && !F.dead && !fighters[1].dead) { var T = fighters[1]; T.x = F.x + 38; T.y = F.y; T.vx = 0; T.vy = 0; if (F.flying > 0 && F.spCd < 30) F.spCd = 30; } try { step(); } catch (e) { errs.push(String(e && e.message)); break; } }
    return JSON.stringify({ used: F._used || {}, errs: errs, dealt: Math.round(F._dmgDealt || 0), taken: Math.round(F._dmgTaken || 0) });
  })()`));
};

describe('the CPU uses the moveset', () => {
  it('each converted fighter, played by the CPU, uses a spread of tilts and aerials and never errors (Puffball, who zones from the air all match, is given a foe right beside her every second)', () => {
    const bad = [];
    for (const name of FIGHTERS) {
      const all = {};
      for (const seed of [11, 12, 13]) { const r = play(name, 'Pen', seed, 1500, name === 'Puffball'); if (r.errs.length) bad.push(`${name}: ${r.errs[0]}`); for (const k in r.used) all[k] = (all[k] || 0) + r.used[k]; }
      const kinds = ['ft', 'ut', 'dt', 'na', 'fa', 'ba', 'ua', 'da'].filter((k) => all[k]);
      const need = name === 'Puffball' ? 2 : 4;   // (she zones from the air nearly all match, and her neutral air is the spit)
      if (kinds.length < need) bad.push(`${name}: only ${kinds.length} kind(s) of tilt and aerial (${JSON.stringify(all)})`);
    }
    expect(bad, bad.join(' ; ')).toEqual([]);
  });
  it('and grabs, and throws what it grabs', () => {
    let grabs = 0, throws = 0;
    for (const name of FIGHTERS) for (const seed of [21, 22]) { const r = play(name, 'Snowball', seed, 2400); grabs += r.used.grab || 0; for (const k in r.used) if (/throw$/.test(k)) throws += r.used[k]; }
    expect(grabs).toBeGreaterThan(0); expect(throws).toBeGreaterThan(0);
  });
  it('a dasher CPU (Leafy) jumps out of its dash: hypers and supers, to close in or to get away', () => {
    let hy = 0, su = 0;
    for (const seed of [11, 12, 13]) { const r = play('Leafy', 'Snowball', seed, 3000); hy += r.used.hyper || 0; su += r.used.super || 0; }
    expect(hy + su).toBeGreaterThan(0);
  });
  it('a fighter with no moveset is not given one: it never uses a moveset slot', () => {
    const r = play('Firey', 'Pen', 31, 900);
    expect(Object.keys(r.used).filter((k) => !/^(grab|[fbud]throw)$/.test(k))).toEqual([]);
  });
});

describe('the trainer can teach it', () => {
  it('the new moves have genes (L tilts, A aerials, G grab, I side special, W movetech), and the trainer only moves them for fighters that have a moveset', () => {
    const genes = JSON.parse(W.eval('JSON.stringify(Object.keys(PB_GENES).filter(function(g){ return /^m[LAGIW][bdhop]/.test(g); }))'));
    expect(genes.length).toBe(5 * 13);
    for (const g of ['mLb', 'mAd1', 'mGh2', 'mIo0', 'mWp2']) expect(genes).toContain(g);
    expect(W.eval('PB_GENES.mAb')).toEqual([-3, 3, 0.25]);
  });
  it('a gene shifts how often a move is used: grab thinned to almost never, then boosted', () => {
    const grabs = (shift) => { let n = 0; for (const seed of [41, 42, 43]) { W.eval(`PLAYBOOKS.Bow = { gen:1, n:1, wr:0.5, v:{ mGb: ${shift} } }; BOT_PB.legacy = false;`); n += play('Bow', 'Snowball', seed, 1800).used.grab || 0; } W.eval('delete PLAYBOOKS.Bow; BOT_PB.legacy = true;'); return n; };
    const low = grabs(-3), high = grabs(3);
    expect(high).toBeGreaterThan(low);
  });
});
