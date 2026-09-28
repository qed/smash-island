import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from './helpers/prng.js';

// WIN TOKENS -- quests earn them, the Store spends them on looks, the Wardrobe wears them.
//
// The owner: "can you add cosmetics and a monetization system? this should be a premium currency and quests to get it, but
// with packs to get currency." Then, told that selling currency in a free fan game built on other people's characters is
// what draws takedowns: "remove the flags for 1 and 2" ... "add teh support the dev link." ... "remove the things that make
// these flags." So these tests pin both halves: the system works (earn, spend, quests, all four kinds of cosmetic, online
// too), and nothing in it is sold, charged, fetched or shouted over a match.

const SRC = readFileSync('artifacts/V1/index.html', 'utf8');
// Comments may say what is NOT here ("no token packs"); code may not do it. So the code is searched with its comments cut.
const CODE = SRC
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split(/\r?\n/).map((l) => l.replace(/(^|[\s;,{}()])\/\/.*$/, '$1')).join('\n');
const DAY = Date.UTC(2026, 8, 28, 12);   // Monday 2026-09-28, noon UTC
const ONE_DAY = 86400000;

// A 2D context that draws nothing. `filter:true` gives it a canvas filter (a string, as a real browser's is), so both the
// filter path and the wash path of the recolours get drawn.
function stub2d(filter) {
  const grad = { addColorStop() {} };
  const state = { filter: 'none' };
  return new Proxy({}, {
    get: (_t, p) => (
      p === 'filter' && filter ? state.filter
        : p === 'measureText' ? () => ({ width: 0 })
        : p === 'canvas' ? { width: 1100, height: 720 }
        : p === 'getImageData' ? () => ({ data: [] })
        : (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createConicGradient' || p === 'createPattern') ? () => grad
        : () => {}),
    set: (_t, p, v) => { if (p === 'filter') state.filter = v; return true; },
  });
}
function boot({ storage = {}, transform, rng = 7, filter = false } = {}) {
  let html = SRC; if (transform) html = transform(html);
  const dom = new JSDOM(html, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      window.HTMLCanvasElement.prototype.getContext = () => stub2d(filter);
      window.Math.random = mulberry32(rng);
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
      for (const [k, v] of Object.entries(storage)) window.localStorage.setItem(k, v);
    },
  });
  return dom.window;
}
async function ready(opts) { const w = boot(opts); await w.eval('profileReady'); return w; }
const settle = (w) => w.eval('new Promise(function(r){ setTimeout(r, 0); })');
// The first day on or after `from` whose three dailies include quest `id`.
const dayWith = (w, id, from) => w.eval(`(function(){ for (var d = 0; d < 400; d++){ var t = ${from} + d*${ONE_DAY};
  if (questsFor('daily', new Date(t)).some(function(q){ return q.id === ${JSON.stringify(id)}; })) return t; } return null; })()`);
// One ordinary match's end, as checkWin reaches it: you on team 0 against one foe, `won` deciding who took it.
const matchEnd = (w, won = true, setup = '') => w.eval(`(function(){ ${setup};
  var A = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 300, 300, 0), B = makeFighter(ROSTER.find(function(r){ return r.name==='Pen'; }), 500, 300, 1);
  A.you = true; A.team = 0; B.team = 1; fighters = [A, B];
  awardMatchProgress(${won ? 0 : 1});
  CUSTOM_LEVEL = null; TESTMODE.active = false; TUT.active = false;
  return true; })()`);

describe('the wallet', () => {
  it('earns, spends on a look, refuses what it cannot afford, and never sells twice', async () => {
    const w = await ready();
    const r = w.eval(`(function(){
      var start = walletBalance(); walletEarn(120);
      var buy = buyCosmetic('hat_party'), again = buyCosmetic('hat_party'), poor = buyCosmetic('hat_crown'), junk = buyCosmetic('__proto__');
      return { start: start, bal: walletBalance(), buy: buy.ok, again: again.why, poor: poor.why, need: poor.need, junk: junk.why,
               party: ownsCos('hat_party'), crown: ownsCos('hat_crown'), wallet: PROFILE.wallet };
    })()`);
    expect(r.start, 'a fresh player starts with nothing').toBe(0);
    expect(r.buy).toBe(true);
    expect(r.bal).toBe(20);
    expect(r.again).toBe('owned');
    expect(r.poor).toBe('tokens');
    expect(r.need).toBe(230);
    expect(r.junk).toBe('unknown');
    expect(r.party).toBe(true);
    expect(r.crown).toBe(false);
    expect(r.wallet).toEqual({ earned: 120, spent: 100, owned: { hat_party: 100 } });
  });

  it('survives a reload, with what is worn', async () => {
    const w = await ready();
    await w.eval(`(async function(){ walletEarn(300); buyCosmetic('sk_gold'); equipCos('skin', 'sk_gold', 'Leafy'); equipCos('title', null); await saveProfile(); })()`);
    const stored = w.localStorage.getItem('profile:v1');
    const w2 = await ready({ storage: { 'profile:v1': stored } });
    expect(w2.eval('walletBalance()')).toBe(100);
    expect(w2.eval('ownsCos("sk_gold")')).toBe(true);
    expect(w2.eval('wornCos("skin", "Leafy")')).toBe('sk_gold');
    expect(w2.eval('wornCos("skin", "Firey")'), 'a recolour is worn per fighter').toBe(null);
  });

  it('an old save gains the wallet, the quests and the wardrobe, empty (and an open profile gets no free tokens)', async () => {
    const prior = { version: 1, matches: 12, wins: 3, kos: 9, bossesCleared: {}, bestRushLoop: 0, wcTitles: 0, unlocked: ['Firey'], viewMode: 'starters', migratedFrom: 'pre-A' };
    const w = await ready({ storage: { 'profile:v1': JSON.stringify(prior) } });
    expect(w.eval('JSON.stringify(PROFILE.wallet)')).toBe('{"earned":0,"spent":0,"owned":{}}');
    expect(w.eval('!!PROFILE.quests && !!PROFILE.cos')).toBe(true);
    expect(w.eval('JSON.stringify(openProfile("no-storage").wallet)')).toBe('{"earned":0,"spent":0,"owned":{}}');
    expect(w.eval('Object.keys(freshProfile()).filter(function(k){ return ["wallet","quests","cos"].indexOf(k)>=0; }).length')).toBe(3);
  });
});

describe('two tabs', () => {
  it('a stale tab never undoes a purchase, never loses a claim, and counts nothing twice', async () => {
    const w = await ready();
    w.eval(`SHOP_CLOCK = ${DAY}`);
    const r = w.eval(`(function(){
      var day = 'd' + dailySeed(shopNow()), week = 'w' + shopWeekNo(shopNow());
      var q = function(claims){ return { day: day, week: week, dp: {}, wp: {}, wf: [], claims: claims }; };
      // Both tabs loaded a profile with 200 earned. Tab A then claimed q1 (+20) and got the party hat (100); tab B,
      // stale, claimed q2 (+30) and got the bow (100).
      var A = { wallet: { earned: 220, spent: 100, owned: { hat_party: 100 } }, quests: q({}) };
      A.quests.claims[day + ':d_play3'] = 20;
      var B = { wallet: { earned: 230, spent: 100, owned: { acc_bow: 100 } }, quests: q({}) };
      B.quests.claims[day + ':d_win2'] = 30;
      var both = mergeProfiles(A, B);
      // A tab that knew nothing of either, saving over A: nothing A did is undone.
      var stale = mergeProfiles(A, { wallet: { earned: 200, spent: 0, owned: {} }, quests: q({}) });
      // Both tabs claimed the SAME quest: it pays once.
      var B2 = JSON.parse(JSON.stringify(A)); B2.wallet.owned = {};  B2.wallet.spent = 0;
      var same = mergeProfiles(A, B2);
      return { both: both.wallet, bothClaims: Object.keys(both.quests.claims).length, stale: stale.wallet, same: same.wallet };
    })()`);
    expect(r.both).toEqual({ earned: 250, spent: 200, owned: { hat_party: 100, acc_bow: 100 } });
    expect(r.bothClaims).toBe(2);
    expect(r.stale).toEqual({ earned: 220, spent: 100, owned: { hat_party: 100 } });
    expect(r.same.earned, 'one quest, claimed in both tabs, paid once').toBe(220);
    expect(r.same.spent).toBe(100);
  });

  it('through the real save path: the other tab\'s purchase and this tab\'s both stand', async () => {
    const w = await ready();
    await w.eval(`(async function(){ walletEarn(400); await saveProfile(); })()`);
    const before = JSON.parse(w.localStorage.getItem('profile:v1'));
    await w.eval(`(async function(){ buyCosmetic('hat_top'); await saveProfile(); })()`);   // this tab: 150
    // The other tab hydrated BEFORE that purchase, then bought the crown (250) and saved.
    const other = JSON.parse(JSON.stringify(before));
    other.wallet.owned = { hat_crown: 250 }; other.wallet.spent = 250;
    w.localStorage.setItem('profile:v1', JSON.stringify(other));
    // ...and this tab, from its own copy, saves again.
    await w.eval(`(async function(){ equipCos('hat', 'hat_top', 'Firey'); await saveProfile(); })()`);
    const final = JSON.parse(w.localStorage.getItem('profile:v1'));
    expect(final.wallet.owned).toEqual({ hat_top: 150, hat_crown: 250 });
    expect(final.wallet.spent, 'both purchases are paid for').toBe(400);
    expect(final.wallet.earned).toBe(400);
    expect(w.eval('walletBalance()')).toBe(0);
  });
});

describe('quests', () => {
  it('three a day and three a week, one of each tier, the same for everyone and chosen from the date alone', async () => {
    const a = await ready({ rng: 1 }), b = await ready({ rng: 99 });
    const pick = (w, t) => w.eval(`(function(){ var n = 0, _r = Math.random; Math.random = function(){ n++; return _r(); };
      var d = questsFor('daily', new Date(${t})), k = questsFor('weekly', new Date(${t})); Math.random = _r;
      return { d: d.map(function(q){ return q.id; }), k: k.map(function(q){ return q.id; }), tiers: d.map(function(q){ return q.tier; }),
               rd: d.map(function(q){ return q.reward; }), rk: k.map(function(q){ return q.reward; }), dice: n }; })()`);
    const pa = pick(a, DAY), pb = pick(b, DAY);
    expect(pa.d).toEqual(pb.d);
    expect(pa.k).toEqual(pb.k);
    expect(pa.tiers).toEqual([0, 1, 2]);
    expect(pa.rd).toEqual([15, 20, 30]);
    expect(pa.rk).toEqual([60, 90, 120]);
    expect(pa.dice, 'no dice: the date decides').toBe(0);
    expect(pick(a, DAY + 3 * 3600000).d, 'the same all day long').toEqual(pa.d);
    const sets = new Set(); for (let i = 0; i < 14; i++) sets.add(pick(a, DAY + i * ONE_DAY).d.join());
    expect(sets.size, 'and a different mix on other days').toBeGreaterThan(3);
    const weekOf = (t) => pick(a, t).k.join();
    expect(weekOf(DAY + 6 * ONE_DAY), 'the weeklies hold from Monday to Sunday').toBe(weekOf(DAY));
  });

  it('count normal play only: not the level editor, Test mode or the tutorial', async () => {
    const w = await ready();
    const D = dayWith(w, 'd_play3', DAY);
    w.eval(`SHOP_CLOCK = ${D}`);
    const prog = () => w.eval('questState().dp.d_play3 | 0');
    matchEnd(w, true, 'CUSTOM_LEVEL = { name: "my level" }'); expect(prog(), 'a level-editor playtest').toBe(0);
    matchEnd(w, true, 'TESTMODE.active = true'); expect(prog(), 'Test mode').toBe(0);
    matchEnd(w, true, 'TUT.active = true'); expect(prog(), 'the tutorial').toBe(0);
    matchEnd(w, false); expect(prog(), 'a real match, even a lost one').toBe(1);
    const B = dayWith(w, 'd_boss1', DAY);
    w.eval(`SHOP_CLOCK = ${B}; TESTMODE.active = true; awardBossCleared('Announcer', false); TESTMODE.active = false;`);
    expect(w.eval('questState().dp.d_boss1 | 0'), 'no boss from a sandbox').toBe(0);
    w.eval(`awardBossCleared('Announcer', false)`);
    expect(w.eval('questState().dp.d_boss1 | 0'), 'a Boss Rush kill counts').toBe(1);
  });

  it('claim once, for the tokens, then start again with the next day and the next week', async () => {
    const w = await ready();
    const D = dayWith(w, 'd_play3', DAY);
    w.eval(`SHOP_CLOCK = ${D}`);
    expect(w.eval(`claimQuest('d_play3').why`)).toBe('unfinished');
    matchEnd(w); matchEnd(w); matchEnd(w, false);
    const c1 = w.eval(`claimQuest('d_play3')`);
    expect(c1.ok).toBe(true);
    expect(c1.reward).toBe(15);
    expect(w.eval(`claimQuest('d_play3').why`)).toBe('claimed');
    expect(w.eval(`claimQuest('d_nosuch').why`)).toBe('not-now');
    expect(w.eval('walletBalance()')).toBe(15);
    const wk = w.eval('JSON.stringify(questState().wp)');
    expect(wk, 'the week counted the same matches').not.toBe('{}');
    // The next day that has it again: fresh, and claimable once more.
    const D2 = dayWith(w, 'd_play3', D + ONE_DAY);
    w.eval(`SHOP_CLOCK = ${D2}`);
    const row = w.eval(`questRows('daily').filter(function(r){ return r.quest.id==='d_play3'; })[0]`);
    expect(row.prog).toBe(0);
    expect(row.claimed).toBe(false);
    matchEnd(w); matchEnd(w); matchEnd(w);
    expect(w.eval(`claimQuest('d_play3').ok`)).toBe(true);
    expect(w.eval('walletBalance()')).toBe(30);
    // The Monday after: the week's progress is gone too.
    const monday = (Math.floor((Math.floor(D2 / ONE_DAY) + 3) / 7) + 1) * 7 * ONE_DAY - 3 * ONE_DAY + 3600000;
    w.eval(`SHOP_CLOCK = ${monday}`);
    expect(w.eval('JSON.stringify(questState().wp)')).toBe('{}');
    expect(w.eval('walletBalance()'), 'tokens already claimed are kept').toBe(30);
  });

  it('show on the result screen, and never as words over the match', async () => {
    const w = await ready({ rng: 3 });
    const D = dayWith(w, 'd_play3', DAY);
    const r = w.eval(`(function(){
      SHOP_CLOCK = ${D};
      var said = []; var _b = banner; banner = function(t){ said.push(String(t)); return _b.apply(this, arguments); };
      questState().dp.d_play3 = 2;
      SETTINGS.mode = 'ffa'; SETTINGS.count = 3; SETTINGS.stocks = 1; chosen = ROSTER.find(function(x){ return x.name==='Firey'; }); LINEUP_MEMO = null;
      walletEarn(1000); buyCosmetic('ko_stars'); equipCos('ko', 'ko_stars');
      startMatch(); fighters.find(function(f){ return f.you; }).controller = 'ai';
      for (var i = 0; i < 9000 && running; i++){ step(); draw(); }
      banner = _b;
      var ended = !running;
      showQuestNote();
      return { ended: ended, said: said, note: document.getElementById('questNote').textContent,
               shown: document.getElementById('questNote').style.display, prog: questState().dp.d_play3 };
    })()`);
    expect(r.ended, 'the match finished').toBe(true);
    expect(r.prog).toBe(3);
    expect(r.said.filter((t) => /quest|token|claim|win token|\bW ?\d/i.test(t)), 'no quest or token text during the match').toEqual([]);
    expect(r.shown).toBe('block');
    expect(r.note).toMatch(/Play 3 matches/);
    expect(r.note).toMatch(/to claim/);
    for (const fn of ['questMatchEnd', 'questAdd', 'claimQuest', 'buyCosmetic', 'equipCos', 'cosKoBurst', 'drawCosTrail', 'drawCosHat', 'drawKoBurst', 'showQuestNote', 'renderResultCard', 'questSmashArm', 'questSmashHit']) {
      expect(w.eval(`String(${fn})`), `${fn} puts up no banner`).not.toMatch(/banner\(/);
    }
  }, 120000);
});

describe('cosmetics', () => {
  // Every playable fighter wears one of each kind in a real match -- running both ways, hit, KO'ing a foe -- on a render
  // (a decoded image) and on the vector art, with and without a canvas filter. Every cosmetic is worn by several fighters.
  it('every cosmetic draws on every fighter, render and vector alike, through a match', async () => {
    const run = async (filter, parity) => {
      const w = await ready({ filter });
      return w.eval(`(function(){
        walletEarn(100000); COSMETICS.forEach(function(c){ buyCosmetic(c.id); });
        var K = function(k){ return COSMETICS.filter(function(c){ return c.kind===k; }); };
        var names = ROSTER.filter(function(r){ return r.play; }).map(function(r){ return r.name; }), used = {}, errs = [], bursts = 0, n = 0;
        names.forEach(function(name, i){
          if (i % 2 !== ${parity}) return;
          var r = ROSTER.find(function(x){ return x.name===name; });
          var pick = { skin: K('skin')[i % 7].id, hat: K('hat')[i % 8].id, trail: K('trail')[i % 5].id, ko: K('ko')[i % 5].id,
                       pose: K('pose')[i % 4].id, card: K('card')[i % 5].id, title: K('title')[i % 6].id };
          equipCos('skin', pick.skin, name); equipCos('hat', pick.hat, name);
          ['trail','ko','pose','card','title'].forEach(function(k){ equipCos(k, pick[k]); });
          Object.keys(pick).forEach(function(k){ used[pick[k]] = 1; });
          var render = ((i >> 1) % 2 === 0) && SPRITES[name];
          if (render){ SPRITES[name]._req = true; SPRITES[name].img = { complete: true, naturalWidth: 120, naturalHeight: 160 }; }
          try {
            chosen = r; SETTINGS.mode = 'ffa'; SETTINGS.count = 2; SETTINGS.stocks = 3; LINEUP_MEMO = null;
            startMatch();
            var you = fighters.find(function(f){ return f.you; }), foe = fighters.find(function(f){ return !f.you; });
            for (var t = 0; t < 30; t++){ you.vx = (t % 10 < 5) ? 7 : -7; you.vy = t % 7 === 0 ? -9 : you.vy; if (t === 12) you.flash = 6; if (t === 18) you.burn = 30; step(); draw(); }
            foe.lastHitBy = you; eliminate(foe); bursts += COS_KO_FX.length;
            for (var t2 = 0; t2 < 8; t2++){ step(); draw(); }
            renderResultCard(true); renderPlayerCard(document.getElementById('wardCard'), name, { pose: true });
            n++;
          } catch (e) { errs.push(name + ': ' + (e && e.message)); }
          if (render) SPRITES[name].img = null;
        });
        running = false;
        return { n: n, errs: errs, used: Object.keys(used), bursts: bursts, drawErr: COS_DRAW_ERR ? String(COS_DRAW_ERR.stack || COS_DRAW_ERR) : null,
                 card: document.getElementById('resultCard').style.display };
      })()`);
    };
    const a = await run(true, 0), b = await run(false, 1);
    const all = a.used.concat(b.used);
    expect(a.errs.concat(b.errs)).toEqual([]);
    expect(a.drawErr).toBe(null);
    expect(b.drawErr).toBe(null);
    expect(a.n + b.n, 'every playable fighter').toBeGreaterThanOrEqual(59);
    expect(a.bursts > 0 && b.bursts > 0, 'the KO effects fired').toBe(true);
    expect(a.card).toBe('block');
    const w = await ready();
    const ids = w.eval('COSMETICS.map(function(c){ return c.id; })');
    expect([...new Set(all)].sort()).toEqual(ids.slice().sort());
    expect(new Set(w.eval('COSMETICS.map(function(c){ return c.kind; })'))).toEqual(new Set(['skin', 'hat', 'trail', 'ko', 'pose', 'card', 'title']));
  }, 240000);

  it('change nothing in a fight: a seeded match ends the same with every look on as with none', async () => {
    const play = async (dressed) => {
      const w = await ready({ rng: 11, filter: dressed });
      return w.eval(`(function(){
        SETTINGS.mode = 'ffa'; SETTINGS.count = 4; SETTINGS.stocks = 2; SETTINGS.itemRate = 2; LINEUP_MEMO = null;
        chosen = ROSTER.find(function(x){ return x.name==='Firey'; });
        var drawn = { hat: 0, trail: 0, skin: 0, ko: 0 };
        if (${dressed}) {
          walletEarn(100000); COSMETICS.forEach(function(c){ buyCosmetic(c.id); });
          equipCos('skin', 'sk_gold', 'Firey'); equipCos('hat', 'hat_crown', 'Firey'); equipCos('trail', 'tr_rainbow'); equipCos('ko', 'ko_confetti');
          equipCos('pose', 'po_spin'); equipCos('card', 'cd_dream'); equipCos('title', 'ti_legend');
          var h = drawCosHat, tr = drawCosTrail, sk = cosSkinOn, kb = drawKoBurst;
          drawCosHat = function(){ drawn.hat++; return h.apply(this, arguments); };
          drawCosTrail = function(){ drawn.trail++; return tr.apply(this, arguments); };
          cosSkinOn = function(s){ if (s) drawn.skin++; return sk.apply(this, arguments); };
          drawKoBurst = function(){ drawn.ko++; return kb.apply(this, arguments); };
        }
        Math.random = (${mulberry32.toString()})(4242);   // the same dice from here, in both worlds
        startMatch();
        var you = fighters.find(function(f){ return f.you; }); you.controller = 'ai';
        var frames = 0;
        for (; frames < 12000 && running; frames++){ step(); draw(); }
        return { drawn: drawn, frames: frames, t: hazardT, running: running,
                 end: fighters.map(function(f){ return [f.name, f.stocks, +f.pct.toFixed(3), +f.x.toFixed(2), +f.y.toFixed(2), !!f.dead, f.placement, f._kos|0]; }),
                 dice: Math.random() };
      })()`);
    };
    const plain = await play(false), dressed = await play(true);
    expect(dressed.drawn.hat, 'the crown was drawn').toBeGreaterThan(0);
    expect(dressed.drawn.skin, 'the recolour was drawn').toBeGreaterThan(0);
    expect(dressed.drawn.trail, 'the trail was drawn').toBeGreaterThan(0);
    expect(dressed.end).toEqual(plain.end);
    expect(dressed.frames).toBe(plain.frames);
    expect(dressed.t).toBe(plain.t);
    expect(dressed.dice, 'not one roll more or less').toBe(plain.dice);
  }, 240000);

  it('the fighter you control wears your looks for everyone on the screen; the AI wears none', async () => {
    const w = await ready();
    const r = w.eval(`(function(){
      walletEarn(1000); buyCosmetic('hat_top'); buyCosmetic('tr_leaf'); equipCos('hat', 'hat_top', 'Firey'); equipCos('trail', 'tr_leaf');
      var you = makeFighter(Object.assign({}, ROSTER.find(function(x){ return x.name==='Firey'; }), { you: true }), 300, 300, 0);
      var ai = makeFighter(ROSTER.find(function(x){ return x.name==='Firey'; }), 400, 300, 1);
      return { you: cosOf(you), ai: cosOf(ai), unowned: equipCos('hat', 'hat_crown', 'Firey') };
    })()`);
    expect(r.you).toEqual({ skin: null, hat: 'hat_top', trail: 'tr_leaf', ko: null });
    expect(r.ai).toBe(null);
    expect(r.unowned, 'nothing can be worn that was not got with tokens').toBe(false);
  });
});

describe('online', () => {
  const wire = (w, role, players) => w.eval(`(function(){
    NET.role = ${JSON.stringify(role)}; NET.myId = 'me'; NET.room = 'QXTR';
    NET.sent = []; NET.ws = { readyState: 1, send: function(t){ NET.sent.push(JSON.parse(t)); }, close: function(){} };
    NET.players = ${JSON.stringify(players)}; NET.renderLobby(); return true; })()`);

  it('a look rides the join as four small ids, once, and reaches every screen', async () => {
    const w = await ready();
    w.eval(`walletEarn(5000); ['sk_gold','hat_crown','tr_spark','ko_zap'].forEach(buyCosmetic);
      equipCos('skin','sk_gold','Pencil'); equipCos('hat','hat_crown','Pencil'); equipCos('trail','tr_spark'); equipCos('ko','ko_zap');`);
    wire(w, 'client', [{ id: 'h', name: 'Leafy', isHost: true }, { id: 'me', name: 'Pencil' }]);
    const hello = w.eval(`(function(){ NET.sent = []; NET.pickFighter('Pencil'); return NET.sent; })()`);
    expect(hello).toHaveLength(1);
    expect(hello[0].t).toBe('hello');
    const [fighter, code] = hello[0].name.split('~');
    expect(fighter).toBe('Pencil');
    expect(code).toMatch(/^[0-9a-z]{4}$/);
    expect(w.eval(`cosNetDecode(${JSON.stringify(code)})`)).toEqual({ skin: 'sk_gold', hat: 'hat_crown', trail: 'tr_spark', ko: 'ko_zap' });
    // The relay keeps 24 characters of a name: the longest fighter with a full code still fits.
    expect(w.eval(`Math.max.apply(null, ROSTER.filter(function(r){ return r.play; }).map(function(r){ return r.name.length; }))`) + 5).toBeLessThanOrEqual(24);
    // The lobby shows the fighter, never the code.
    w.eval(`NET.onMessage({ t: 'roster', players: [{ id: 'h', name: 'Leafy~1100', isHost: true }, { id: 'me', name: 'Pencil~' + ${JSON.stringify(code)} }] })`);
    const roster = w.document.getElementById('lobbyRoster').textContent;
    expect(roster).toContain('Leafy'); expect(roster).toContain('Pencil (you)'); expect(roster).not.toContain('~');

    // The host copies each player's code into the start; the client dresses each slot from it.
    const h = await ready();
    wire(h, 'host', [{ id: 'me', name: 'Leafy', isHost: true }, { id: 'b', name: 'Pencil~' + code }, { id: 'c', name: 'Rocky' }]);
    const start = h.eval(`(function(){ NET.beginMatch = function(){}; SETTINGS.mode='ffa'; SETTINGS.count=3; NET.startAsHost();
      return NET.sent.filter(function(m){ return m.t==='start'; })[0]; })()`);
    expect(start.roster).toEqual(['Leafy', 'Pencil', 'Rocky']);
    expect(start.cos).toEqual(['', code, '']);
    const c = w.eval(`(function(){ var s = startMatch; startMatch = function(){};
      // beginMatch(settings, roster, ids, cos): the seats (ids) come from the bug pass's fix for players leaving mid-match; the
      // looks (cos) ride after them.
      NET.beginMatch({ mode:'ffa', count:3, stocks:3 }, ['Leafy','Pencil','Rocky'], ['h','me','c'], ${JSON.stringify(['0200', code, 'zzzz'])});
      startMatch = s;
      return { host: cosOf({ idx: 0, you: false }), me: cosOf({ idx: 1, you: true, name: 'Pencil' }), rocky: cosOf({ idx: 2, you: false }), ai: cosOf({ idx: 3, you: false }) }; })()`);
    expect(c.host).toEqual({ skin: null, hat: 'hat_top', trail: null, ko: null });
    expect(c.me.hat).toBe('hat_crown');
    expect(c.rocky, 'a code that is not in the catalogue dresses no one').toBe(null);
    expect(c.ai).toBe(null);
    // Nothing wearing nothing: a player with no looks sends exactly the hello they always did.
    const bare = await ready();
    wire(bare, 'client', [{ id: 'h', name: 'Leafy', isHost: true }, { id: 'me', name: 'Bubble' }]);
    expect(bare.eval(`(function(){ NET.sent = []; NET.pickFighter('Pencil'); return NET.sent[0].name; })()`)).toBe('Pencil');
  });

  it('adds nothing to the snapshots but a KO burst, once, on the snapshot after the KO', async () => {
    const w = await ready();
    const r = w.eval(`(function(){
      walletEarn(1000); buyCosmetic('ko_zap'); buyCosmetic('hat_crown'); equipCos('ko', 'ko_zap'); equipCos('hat', 'hat_crown', 'Firey');
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.stocks=3; chosen = ROSTER.find(function(x){ return x.name==='Firey'; }); LINEUP_MEMO=null;
      startMatch(); step();
      NET.role = 'host';
      var quiet = JSON.stringify(serializeState(false));
      var you = fighters.find(function(f){ return f.you; }), foe = fighters.find(function(f){ return !f.you; });
      foe.lastHitBy = you; eliminate(foe);
      var s1 = serializeState(false), s2 = serializeState(false);
      NET.role = 'solo'; running = false;
      return { quiet: quiet, ko: s1.ko, again: s2.ko === undefined, leaked: COSMETICS.filter(function(c){ return quiet.indexOf(c.id) >= 0; }).length };
    })()`);
    expect(r.quiet).not.toMatch(/"ko":|"cos"/);
    expect(r.leaked, 'no cosmetic id in a snapshot').toBe(0);
    expect(r.ko).toHaveLength(1);
    expect(r.ko[0][2]).toBe(5);   // Thunderclap, the fifth KO effect
    expect(r.again).toBe(true);
    const c = await ready();
    expect(c.eval(`(function(){ cosKoFromNet(${JSON.stringify(r.ko)}, 40); cosKoFromNet([[1,2,99],'x',null], 40); return COS_KO_FX.map(function(e){ return e.id; }); })()`)).toEqual(['ko_zap']);
  });
});

describe('the Store', () => {
  it('lists every look for Win Tokens, marks what you own, buys with tokens and refuses without', async () => {
    const w = await ready();
    const r = w.eval(`(function(){
      go('store');
      var cells = [].slice.call(document.querySelectorAll('#storeList .scell'));
      var every = cells.every(function(c){ var b = c.querySelector('button'); return !!b && !!b.querySelector('.wtok'); });
      cells.filter(function(c){ return c.dataset.id==='hat_party'; })[0].querySelector('button').click();
      var poor = { reply: document.getElementById('storeReply').textContent, owned: ownsCos('hat_party') };
      walletEarn(100);
      document.querySelector('#storeList .scell[data-id="hat_party"] button').click();
      var cell = document.querySelector('#storeList .scell[data-id="hat_party"]');
      var rich = { reply: document.getElementById('storeReply').textContent, owned: ownsCos('hat_party'), mark: cell.classList.contains('owned'), btn: cell.querySelector('button').textContent, bal: walletBalance() };
      cell.querySelector('button').click();   // Wear
      var worn = wornCos('hat', chosen.name);
      return { n: cells.length, total: COSMETICS.length, every: every, poor: poor, rich: rich, worn: worn,
               wallet: document.querySelector('#store .walletAmt').textContent, title: (go('title'), document.querySelector('#title .walletAmt').textContent) };
    })()`);
    expect(r.n).toBe(r.total);
    expect(r.every, 'every price is in Win Tokens').toBe(true);
    expect(r.poor.owned).toBe(false);
    expect(r.poor.reply).toMatch(/need 100 more Win Tokens/);
    expect(r.rich.owned).toBe(true);
    expect(r.rich.mark).toBe(true);
    expect(r.rich.btn).toBe('Wear');
    expect(r.rich.bal).toBe(0);
    expect(r.worn).toBe('hat_party');
    expect(r.wallet).toBe('0');
    expect(r.title).toBe('0');
  });

  it('the Store, Quests and the Wardrobe make no network request of any kind', async () => {
    const w = await ready();
    const r = w.eval(`(function(){
      var calls = [];
      window.fetch = function(u){ calls.push('fetch ' + u); return Promise.reject(new Error('no')); };
      var xo = XMLHttpRequest.prototype.open; XMLHttpRequest.prototype.open = function(m, u){ calls.push('xhr ' + u); return xo.apply(this, arguments); };
      window.WebSocket = function(u){ calls.push('ws ' + u); };
      navigator.sendBeacon = function(u){ calls.push('beacon ' + u); return true; };
      window.open = function(u){ calls.push('open ' + u); return null; };
      var nodes0 = document.querySelectorAll('script,iframe,link,img').length;
      SHOP_CLOCK = ${DAY};
      questState().dp = { d_play3: 3, d_ko5: 5, d_dmg300: 300, d_daily: 1 };
      walletEarn(500);
      go('quests'); [].slice.call(document.querySelectorAll('#quests button')).forEach(function(b){ if (/Claim/.test(b.textContent)) b.click(); });
      go('store'); document.querySelector('#storeList .scell[data-id="ti_contestant"] button').click();
      go('wardrobe'); [].slice.call(document.querySelectorAll('#wardrobe .wchip')).forEach(function(b){ b.click(); });
      var imgs = document.querySelectorAll('#store img, #quests img').length;
      go('title');
      return { calls: calls, added: document.querySelectorAll('script,iframe,link,img').length - nodes0 - document.querySelectorAll('#wardrobe img').length, imgs: imgs,
               claimed: walletBalance() };
    })()`);
    expect(r.calls).toEqual([]);
    expect(r.imgs, 'the Store draws its previews; it fetches no pictures').toBe(0);
    expect(r.added).toBe(0);
    expect(r.claimed).toBeGreaterThan(0);
  });
});

describe('nothing is sold', () => {
  const code = CODE;

  it('has no money price, token pack or purchase path anywhere in the file', () => {
    const lines = code.split('\n');
    // Yellow Face's victory quip is his infomercial catchphrase ("BUY MY VICTORY! Only $19.99!") -- a canon joke in a
    // character's mouth, the one price-shaped string in the game, and not a price for anything.
    const money = lines.filter((l) => /[$€£¥]\s?\d|\d\s?(?:USD|EUR|GBP)\b|\b(?:USD|EUR|GBP)\s?\d/.test(l) && !/BUY MY VICTORY/.test(l));
    expect(money, 'a price in money').toEqual([]);
    expect(lines.filter((l) => /(?:token|coin|gem|currency|win ?token)s?\s*(?:packs?|bundles?)/i.test(l)), 'a currency pack').toEqual([]);
    // "One Purchase Later" is the name of Marshmallow's smash (her Wal-mart, from Inanimate Insanity): a move's name, not a sale.
    expect(lines.filter((l) => /\b(?:purchase|checkout|payment|paywall|billing|in-?app|stripe|paypal|braintree|gumroad|patreon|buymeacoffee|ko-?fi\.com)\w*/i.test(l) && !/One Purchase Later/.test(l)), 'a purchase path or a payment provider').toEqual([]);
    expect(code).not.toMatch(/PaymentRequest|navigator\.pay|google\.payments|ApplePaySession/);
  });

  it('keeps every price in Win Tokens, and Win Tokens come only from quests', async () => {
    const w = await ready();
    expect(w.eval('COSMETICS.every(function(c){ return Number.isInteger(c.price) && c.price > 0 && Object.keys(c).indexOf("usd") < 0; })')).toBe(true);
    // The only callers that add to the wallet: a claimed quest (and walletEarn itself).
    const earners = SRC.split('\n').filter((l) => /walletEarn\(/.test(l) && !/function walletEarn/.test(l) && !/^\s*\/\//.test(l));
    expect(earners.map((l) => l.trim())).toEqual(['walletEarn(row.quest.reward);']);
    expect(w.eval('Object.keys(window).filter(function(k){ return /^(buy|purchase|checkout)(tokens|pack|currency)/i.test(k); })')).toEqual([]);
  });

  it('the Support the dev link is hidden while SUPPORT_URL is empty', async () => {
    const w = await ready();
    const row = w.document.getElementById('supportRow'), a = w.document.getElementById('supportLink');
    expect(row.hidden).toBe(true);
    expect(a.hasAttribute('href')).toBe(false);
    expect(w.eval('SUPPORT_URL')).toBe('');
    // It is read in two places only: its own definition and applySupportLink. It unlocks and gives nothing.
    expect(CODE.match(/\bSUPPORT_URL\b/g)).toHaveLength(2);
  });

  it('when set, it opens safely in a new tab from the title footer, and gives nothing', async () => {
    const url = 'https://example.org/support-the-dev';
    const set = (u) => (src) => src.replace('const SUPPORT_URL = "";', `const SUPPORT_URL = ${JSON.stringify(u)};`);
    const w = await ready({ transform: set(url) });
    const row = w.document.getElementById('supportRow'), a = w.document.getElementById('supportLink');
    expect(row.hidden).toBe(false);
    expect(a.getAttribute('href')).toBe(url);
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel').split(/\s+/).sort()).toEqual(['noopener', 'noreferrer']);
    expect(a.closest('#title'), 'on the title screen').not.toBe(null);
    expect(a.closest('.foot'), 'in its footer').not.toBe(null);
    expect(w.document.querySelectorAll('#supportLink').length).toBe(1);
    const before = w.eval('JSON.stringify([PROFILE.wallet, PROFILE.unlocked])');
    w.eval('applySupportLink(); applySupportLink();');
    expect(w.eval('JSON.stringify([PROFILE.wallet, PROFILE.unlocked])')).toBe(before);
    // Anything but an https address stays hidden.
    for (const bad of ['javascript:alert(1)', 'http://example.org/x', 'https://exa mple.org', ' ']) {
      const b = await ready({ transform: set(bad) });
      expect(b.document.getElementById('supportRow').hidden, bad).toBe(true);
      expect(b.document.getElementById('supportLink').hasAttribute('href'), bad).toBe(false);
    }
  });
});

describe('the title', () => {
  it('shows the wallet and its doors as links, keeping its six buttons', async () => {
    const w = await ready();
    const t = w.document.getElementById('title');
    expect([...t.querySelectorAll('button')].filter((b) => !b.closest('#dailyCard')).length).toBeLessThanOrEqual(6);
    expect(t.querySelector('.walletAmt').textContent).toBe('0');
    for (const [id, screen] of [['questsBtn', 'quests'], ['storeBtn', 'store'], ['wardrobeBtn', 'wardrobe']]) {
      w.eval("go('title')");
      w.document.getElementById(id).click();
      expect(w.document.getElementById(screen).classList.contains('active'), id).toBe(true);
      expect(w.eval(`MUSIC_SCREENS.${screen}`)).toBe('menu');
      expect(w.document.getElementById(screen).innerHTML, `${screen} leads back`).toContain("go('title')");
    }
    // A finished quest shows as a count on the Quests door.
    w.eval(`SHOP_CLOCK = ${DAY}; questState().dp[questsFor('daily')[0].id] = 999; go('title');`);
    const badge = w.document.getElementById('questBadge');
    expect(badge.hidden).toBe(false);
    expect(badge.textContent).toBe('1');
  });
});

// THE SECOND LOOK. What an adversarial read of the first build found, each pinned so it cannot come back: an empty badge
// that showed on every title screen, KO effects no online client ever saw, a jab (or a burn tick) scored as a landed
// smash, and a tab that loaded before another tab spent spending the same Win Tokens again.
describe('the second look', () => {
  it('the Quests badge is really hidden while nothing is ready to claim, and shows when something is', async () => {
    const w = await ready();
    const badge = w.document.getElementById('questBadge');
    // The badge's own `display` used to beat the `hidden` attribute (an author rule outranks the browser's
    // [hidden]{display:none}), so the empty pill was always on screen.
    expect(badge.hidden).toBe(true);
    expect(w.getComputedStyle(badge).display, 'hidden means not drawn').toBe('none');
    w.eval(`SHOP_CLOCK = ${DAY}; questState().dp[questsFor('daily')[0].id] = 999; go('title');`);
    expect(badge.hidden).toBe(false);
    expect(w.getComputedStyle(badge).display).not.toBe('none');
    // The support link, hidden the same way, stays hidden in fact as well as in name.
    expect(w.getComputedStyle(w.document.getElementById('supportRow')).display).toBe('none');
  });

  it('an online client draws the KO burst the host sent, though its clock runs just behind that snapshot', async () => {
    // The host: a KO scored in a KO effect, and the two snapshots either side of it, through JSON as the relay carries them.
    const h = await ready();
    const snaps = JSON.parse(h.eval(`(function(){
      walletEarn(1000); buyCosmetic('ko_stars'); equipCos('ko', 'ko_stars');
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.stocks=3; chosen = ROSTER.find(function(x){ return x.name==='Firey'; }); LINEUP_MEMO=null;
      startMatch(); step();
      NET.role = 'host';
      var s0 = serializeState(true);
      for (var i = 0; i < 4; i++) step();
      var you = fighters.find(function(f){ return f.you; }), foe = fighters.find(function(f){ return !f.you; });
      foe.lastHitBy = you; eliminate(foe); step();
      var s1 = serializeState(false);
      NET.role = 'solo'; running = false;
      return JSON.stringify([s0, s1]); })()`));
    expect(snaps[1].ko).toHaveLength(1);
    // The client: applies both and draws its frames. Its clock glides from the first snapshot's time to the second's, so the
    // first frame after the burst arrives stands BEFORE the burst's stamp -- the frame the old filter threw it away on.
    const c = await ready();
    const r = c.eval(`(function(){
      var S = ${JSON.stringify(snaps)};
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.stocks=3; chosen = ROSTER.find(function(x){ return x.name==='Pen'; }); LINEUP_MEMO=null;
      startMatch(); running = false;
      NET.role = 'client'; NET.myIdx = 1;
      var drawn = 0, kb = drawKoBurst; drawKoBurst = function(){ drawn++; return kb.apply(this, arguments); };
      applySnapshot(S[0]); NET_VIEW.gap = 33;
      applySnapshot(S[1]);
      var clock = [];
      for (var i = 0; i < 8; i++){ netInterpolate(NET_VIEW.at + i*16); clock.push(hazardT); draw(); }
      NET.role = 'solo';
      return { t0: S[1].t, clock: clock, drawn: drawn, err: COS_DRAW_ERR ? String(COS_DRAW_ERR) : null }; })()`);
    expect(r.clock[0], 'the first frame stands before the burst').toBeLessThan(r.t0);
    expect(r.drawn, 'the burst was drawn on the client').toBeGreaterThan(0);
    expect(r.err).toBe(null);
    // A burst stamped far ahead of the clock (a clock that started again) is dropped, not kept for ever.
    expect(c.eval(`(function(){ COS_KO_FX = []; hazardT = 10; cosKoPush(50, 50, 'ko_zap', 5000); drawCosKoFx(); return COS_KO_FX.length; })()`)).toBe(0);
  });

  it('a KO effect plays only for a KO its wearer is credited with', async () => {
    const w = await ready();
    const r = w.eval(`(function(){
      walletEarn(1000); buyCosmetic('ko_confetti'); equipCos('ko', 'ko_confetti');
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.stocks=3; chosen = ROSTER.find(function(x){ return x.name==='Firey'; }); LINEUP_MEMO=null;
      startMatch(); step();
      var you = fighters.find(function(f){ return f.you; }), foe = fighters.find(function(f){ return !f.you; });
      you.dead = true; foe.lastHitBy = you; var kos0 = you._kos | 0; eliminate(foe);
      var down = { bursts: COS_KO_FX.length, kos: (you._kos | 0) - kos0 };
      you.dead = false; foe.lastHitBy = you; eliminate(foe);
      var up = { bursts: COS_KO_FX.length, kos: (you._kos | 0) - kos0 };
      running = false;
      return { down: down, up: up }; })()`);
    expect(r.down, 'a killer already down scores no KO, and gets no burst').toEqual({ bursts: 0, kos: 0 });
    expect(r.up).toEqual({ bursts: 1, kos: 1 });
  });

  it('a landed smash is that smash\'s own hit: not the jab after a miss, not a burn tick', async () => {
    const w = await ready();
    const r = w.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.stocks=3; chosen = ROSTER.find(function(x){ return x.name==='Firey'; }); LINEUP_MEMO=null;
      startMatch(); step();
      var you = fighters.find(function(f){ return f.you; }), foe = fighters.find(function(f){ return !f.you; });
      var out = {};
      doSmash(you); doAttack(you); applyHit(foe, 5, 1, -1, you); out.jabAfterMiss = QSTAT.smashes;
      doSmash(you); applyHit(foe, 3, 0, 0, you, { tick: true }); out.tick = QSTAT.smashes;
      applyHit(foe, 9, 2, -3, you); out.landed = QSTAT.smashes;
      applyHit(foe, 9, 2, -3, you); out.twice = QSTAT.smashes;
      doSmash(you); hazardT += 91; applyHit(foe, 9, 2, -3, you); out.late = QSTAT.smashes;
      running = false;
      return out; })()`);
    expect(r.jabAfterMiss, 'a jab thrown after a smash that missed').toBe(0);
    expect(r.tick, 'a burn tick is not a hit').toBe(0);
    expect(r.landed, 'the smash itself landing').toBe(1);
    expect(r.twice, 'one smash lands once').toBe(1);
    expect(r.late, 'past the second and a half').toBe(1);
  });

  it('a stale tab cannot spend Win Tokens another tab already spent, and takes in the other tab\'s saves at once', async () => {
    const w = await ready();
    await w.eval(`(async function(){ SHOP_CLOCK = ${DAY}; walletEarn(150); await saveProfile(); })()`);
    // The other tab, loaded from the same save, spends all 150 on the top hat and saves. This tab still holds 150 in memory.
    const other = JSON.parse(w.localStorage.getItem('profile:v1'));
    other.wallet.owned = { hat_top: 150 }; other.wallet.spent = 150;
    w.localStorage.setItem('profile:v1', JSON.stringify(other));
    const r = await w.eval(`(async function(){
      var mem = PROFILE.wallet.earned - PROFILE.wallet.spent;
      var buy = buyCosmetic('sk_evil');   // 150 too
      await saveProfile();
      var st = JSON.parse(localStorage.getItem('profile:v1')).wallet;
      return { mem: mem, buy: buy.ok ? 'bought' : buy.why, top: ownsCos('hat_top'), evil: ownsCos('sk_evil'), owed: st.spent - st.earned, bal: walletBalance() }; })()`);
    expect(r.mem, 'this tab had not seen the purchase').toBe(150);
    expect(r.buy, 'the same 150 tokens are not spent twice').toBe('tokens');
    expect(r.evil).toBe(false);
    expect(r.top, 'the other tab\'s look is this tab\'s too').toBe(true);
    expect(r.owed, 'the wallet never owes').toBeLessThanOrEqual(0);
    expect(r.bal).toBe(0);
    // A quest claimed in the other tab shows up here without a reload: the balance, the Store, and the quest as claimed.
    w.eval(`go('store')`);
    const o2 = JSON.parse(w.localStorage.getItem('profile:v1'));
    const q = w.eval(`(function(){ var q = questsFor('daily')[0]; return { id: q.id, reward: q.reward, key: 'd' + dailySeed(shopNow()) + ':' + q.id }; })()`);
    o2.wallet.earned += q.reward;
    o2.quests = Object.assign({}, o2.quests, { claims: Object.assign({}, (o2.quests || {}).claims, { [q.key]: q.reward }) });
    w.localStorage.setItem('profile:v1', JSON.stringify(o2));
    w.dispatchEvent(new w.StorageEvent('storage', { key: 'profile:v1', newValue: JSON.stringify(o2) }));
    expect(w.document.querySelector('#store .walletAmt').textContent).toBe(String(q.reward));
    expect(w.document.querySelector('#title .walletAmt').textContent).toBe(String(q.reward));
    w.eval(`questState().dp[${JSON.stringify(q.id)}] = 999`);
    expect(w.eval(`claimQuest(${JSON.stringify(q.id)}).why`), 'claimed in the other tab').toBe('claimed');
    expect(w.eval('walletBalance()'), 'and paid once').toBe(q.reward);
  });
});
