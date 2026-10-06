import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { basename } from 'node:path';
import { JSDOM } from 'jsdom';
import { PNG } from 'pngjs';
import { mulberry32 } from './helpers/prng.js';

// WIN TOKENS -- quests earn them, the Store spends them on looks, the Wardrobe wears them.
//
// The owner: "can you add cosmetics and a monetization system? this should be a premium currency and quests to get it, but
// with packs to get currency." Then, told that selling currency in a free fan game built on other people's characters is
// what draws takedowns: "remove the flags for 1 and 2" ... "add teh support the dev link." ... "remove the things that make
// these flags." So these tests pin both halves: the system works (earn, spend, quests, all four kinds of cosmetic, online
// too), and nothing in it is sold, charged, fetched or shouted over a match.
//
// And nothing in it hooks. The owner: "I dont want to hook ppl tho." Asked how: a finished quest is to "Pay the moment it's
// done" (the tokens land by themselves, at the match's end, shown on the result screen -- no claim button, nothing to come
// back for, nothing lost at midnight); the title badge that counted claimable quests: "Remove it". The tests below pin each
// of those too.
//
// THE PACE, changed on 2026-09-29. It was "Keep 2-3 days" (prices and rewards unchanged) until a first day that paid 335 Win
// Tokens, about five cheap looks, drew: "increase the WT cost in the shop... you can get 5 cosmetics in one day. ... make
// cosmetics more personalized." Then: "1, but reduce prices as well, and add more personalized cosmetics. reduce prices less
// then quest reductions". So the quests pay about 40% less (daily 9, 12, 18; weekly 36, 54, 72), every price about 25% less
// (45, 75, 115, 150, 190), and the catalogue holds 20 more canon looks and 25 skins for one fighter each (the "canon looks" and
// "skins" blocks below). "the skins should be by-fighter(like rockstar poppy, broken fries, robot pin)" and, asked what became of the
// old colour washes any fighter could wear, "Remove all seven": the "seven old recolours" block below pins that they are gone, that
// whoever bought one has its Win Tokens back, once, and that a worn one is taken off.

const SRC = readFileSync('artifacts/V1/index.html', 'utf8');
// Comments may say what is NOT here ("no token packs"); code may not do it. So the code is searched with its comments cut.
const stripComments = (src) => src
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split(/\r?\n/).map((l) => l.replace(/(^|[\s;,{}()])\/\/.*$/, '$1')).join('\n');
const CODE = stripComments(SRC);
const ONE_DAY = 86400000;
// Monday 2026-09-28, noon UTC -- or, once the real calendar has passed it, the first Monday on or after today. The game stamps
// the REAL day into the profile at boot (questState, saved at once), and when two tabs merge a later day beats an earlier one
// (mergeQuests), rightly; so a test clock standing in the real past would see its own progress thrown away as stale. Every
// test finds the days it needs from here (dayWith), so any Monday serves, and a Monday it must be: the weekly quests hold
// from Monday to Sunday.
const DAY = (() => {
  const fixed = Date.UTC(2026, 8, 28, 12), now = new Date();
  let t = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12);
  if (t <= fixed) return fixed;
  while (new Date(t).getUTCDay() !== 1) t += ONE_DAY;
  return t;
})();

// A 2D context that draws nothing. `filter:true` gives it a canvas filter (a string, as a real browser's is), so the one fighter
// who sets a filter on her own (Starfruit, greyed while she is a Has-Been) draws that way as well as without.
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
// A 2D context that writes down what is drawn: every call with its arguments, every style it is given.
function rec2d() {
  const log = [], sets = {}, grad = { addColorStop() {} };
  const ctx = new Proxy({}, {
    get: (_t, p) => (
      (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createConicGradient' || p === 'createPattern') ? () => grad
        : p === 'measureText' ? () => ({ width: 0 })
        : p === 'canvas' ? { width: 1100, height: 720 }
        : p === 'getImageData' ? () => ({ data: [] })
        : (...a) => { log.push([String(p), a]); }),
    set: (_t, p, v) => { (sets[p] = sets[p] || []).push(v); return true; },
  });
  return { ctx, log, sets };
}
function boot({ storage = {}, transform, rng = 7, filter = false, ctx2d } = {}) {
  let html = SRC; if (transform) html = transform(html);
  const dom = new JSDOM(html, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      window.HTMLCanvasElement.prototype.getContext = () => (ctx2d ? ctx2d() : stub2d(filter));
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
      var start = walletBalance(); walletEarn(120);   // 75 for the party hat, 190 for the crown
      var buy = buyCosmetic('hat_party'), again = buyCosmetic('hat_party'), poor = buyCosmetic('hat_crown'), junk = buyCosmetic('__proto__');
      return { start: start, bal: walletBalance(), buy: buy.ok, again: again.why, poor: poor.why, need: poor.need, junk: junk.why,
               party: ownsCos('hat_party'), crown: ownsCos('hat_crown'), wallet: PROFILE.wallet };
    })()`);
    expect(r.start, 'a fresh player starts with nothing').toBe(0);
    expect(r.buy).toBe(true);
    expect(r.bal).toBe(45);
    expect(r.again).toBe('owned');
    expect(r.poor).toBe('tokens');
    expect(r.need).toBe(145);
    expect(r.junk).toBe('unknown');
    expect(r.party).toBe(true);
    expect(r.crown).toBe(false);
    expect(r.wallet).toEqual({ earned: 120, spent: 75, owned: { hat_party: 75 } });
  });

  it('survives a reload, with what is worn', async () => {
    const w = await ready();
    await w.eval(`(async function(){ walletEarn(300); buyCosmetic('sk_firey_mech'); equipCos('skin', 'sk_firey_mech', 'Firey'); equipCos('title', null); await saveProfile(); })()`);
    const stored = w.localStorage.getItem('profile:v1');
    const w2 = await ready({ storage: { 'profile:v1': stored } });
    expect(w2.eval('walletBalance()')).toBe(150);
    expect(w2.eval('ownsCos("sk_firey_mech")')).toBe(true);
    expect(w2.eval('wornCos("skin", "Firey")')).toBe('sk_firey_mech');
    expect(w2.eval('wornCos("skin", "Pin")'), 'a skin is worn by its own fighter only').toBe(null);
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

// THE PACE. "increase the WT cost in the shop... you can get 5 cosmetics in one day." Then "1, but reduce prices as well, and add
// more personalized cosmetics. reduce prices less then quest reductions". Quests about -40%, prices about -25%, and a first day
// (the dailies and the weeklies) worth one or two ordinary looks, where it was worth five cheap ones.
describe('the pace', () => {
  // What the quests paid, and what the 33 looks that have stayed in the shop cost, before the owner asked for a slower shop.
  const OLD_REWARD = { daily: [15, 20, 30], weekly: [60, 90, 120] };
  const OLD_PRICE = {
    hat_party: 100, hat_top: 150, hat_leaf: 100, hat_cake: 150, hat_halo: 150, acc_shades: 150, acc_bow: 100, hat_crown: 250,
    tr_spark: 150, tr_ember: 150, tr_bubble: 150, tr_leaf: 150, tr_rainbow: 200,
    ko_confetti: 150, ko_stars: 150, ko_berry: 200, ko_token: 200, ko_zap: 200,
    po_hop: 100, po_spin: 150, po_wave: 100, po_flip: 200,
    cd_goiky: 100, cd_dream: 150, cd_yoyle: 100, cd_cake: 100, cd_canyon: 150,
    ti_contestant: 60, ti_dreamer: 60, ti_yoyle: 60, ti_survivor: 100, ti_collector: 100, ti_legend: 200,
  };
  const sum = (a) => a.reduce((x, y) => x + y, 0);

  it('pays about 40% less, prices about 25% less, and the prices fell by less than the quests', async () => {
    const w = await ready();
    const reward = w.eval('QUEST_REWARD'), price = w.eval('(function(){ var o = {}; COSMETICS.forEach(function(c){ o[c.id] = c.price; }); return o; })()');
    expect(reward.daily).toEqual([9, 12, 18]);
    expect(reward.weekly).toEqual([36, 54, 72]);
    for (const kind of ['daily', 'weekly']) for (let t = 0; t < 3; t++) {
      const r = reward[kind][t] / OLD_REWARD[kind][t];
      expect(r, `${kind} quest ${t}`).toBeGreaterThanOrEqual(0.58);
      expect(r, `${kind} quest ${t}`).toBeLessThanOrEqual(0.62);
    }
    for (const [id, old] of Object.entries(OLD_PRICE)) {
      expect(price[id], `${id} is still in the shop`).toBeGreaterThan(0);
      const r = price[id] / old;
      expect(r, `${id}: ${old} -> ${price[id]}`).toBeGreaterThanOrEqual(0.74);
      expect(r, `${id}: ${old} -> ${price[id]}`).toBeLessThanOrEqual(0.78);
    }
    const cutQuests = 1 - sum([...reward.daily, ...reward.weekly]) / sum([...OLD_REWARD.daily, ...OLD_REWARD.weekly]);
    const cutPrices = 1 - sum(Object.keys(OLD_PRICE).map((id) => price[id])) / sum(Object.values(OLD_PRICE));
    expect(cutPrices, 'prices cut by less than the quests').toBeLessThan(cutQuests);
    expect(cutQuests).toBeCloseTo(0.4, 1);
    expect(cutPrices).toBeCloseTo(0.25, 1);
  });

  it('a first day, dailies and weeklies, buys one or two ordinary looks; nobody earns a look a day', async () => {
    const w = await ready();
    const reward = w.eval('QUEST_REWARD'), prices = w.eval('COSMETICS.map(function(c){ return c.price; })').sort((a, b) => a - b);
    const median = prices[Math.floor(prices.length / 2)];
    const day = sum(reward.daily), week = sum(reward.weekly);
    expect(day).toBe(39);
    expect(week).toBe(162);
    expect(day + week, 'a first day with every quest done, the weeklies too (it was 335)').toBe(201);
    const looks = (day + week) / median;
    expect(looks, `201 tokens at the median price of ${median}`).toBeGreaterThanOrEqual(1);
    expect(looks).toBeLessThanOrEqual(2);
    // Finishing every quest, every day, for a week: about 62 a day, under the price of an ordinary look.
    expect((day * 7 + week) / 7, 'a day, weeklies spread over the week').toBeLessThan(median);
    // The typical week: five days of the two easier dailies and two weeklies, about 28 a day.
    expect((5 * (reward.daily[0] + reward.daily[1]) + reward.weekly[0] + reward.weekly[1]) / 7).toBeLessThan(median / 3);
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
    await w.eval(`(async function(){ walletEarn(305); await saveProfile(); })()`);
    const before = JSON.parse(w.localStorage.getItem('profile:v1'));
    await w.eval(`(async function(){ buyCosmetic('hat_top'); await saveProfile(); })()`);   // this tab: 115
    // The other tab hydrated BEFORE that purchase, then bought the crown (190) and saved.
    const other = JSON.parse(JSON.stringify(before));
    other.wallet.owned = { hat_crown: 190 }; other.wallet.spent = 190;
    w.localStorage.setItem('profile:v1', JSON.stringify(other));
    // ...and this tab, from its own copy, saves again.
    await w.eval(`(async function(){ equipCos('hat', 'hat_top', 'Firey'); await saveProfile(); })()`);
    const final = JSON.parse(w.localStorage.getItem('profile:v1'));
    expect(final.wallet.owned).toEqual({ hat_top: 115, hat_crown: 190 });
    expect(final.wallet.spent, 'both purchases are paid for').toBe(305);
    expect(final.wallet.earned).toBe(305);
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
    expect(pa.rd, "the owner's cut: about 40% off 15, 20, 30").toEqual([9, 12, 18]);
    expect(pa.rk, 'and off 60, 90, 120').toEqual([36, 54, 72]);
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

  it('pays the moment it is done -- by itself, once -- then starts again with the next day and the next week', async () => {
    // "I dont want to hook ppl tho": a finished quest is to "Pay the moment it's done". There is no claim step any more --
    // the tokens land inside the count that finished the quest, and a quest never looked at is paid all the same.
    const w = await ready();
    const D = dayWith(w, 'd_play3', DAY);
    w.eval(`SHOP_CLOCK = ${D}`);
    expect(w.eval('typeof claimQuest'), 'no claim step').toBe('undefined');
    const row = () => w.eval(`questRows('daily').filter(function(r){ return r.quest.id==='d_play3'; })[0]`);
    matchEnd(w); matchEnd(w);
    expect(w.eval('walletBalance()'), 'two of three: nothing yet').toBe(0);
    expect(row()).toMatchObject({ prog: 2, done: false, paid: false });
    matchEnd(w, false);
    expect(w.eval('walletBalance()'), 'the third match pays, win or lose, with no one asking').toBe(9);
    expect(row()).toMatchObject({ prog: 3, done: true, paid: true });
    expect(w.eval(`questState().claims['d' + dailySeed(shopNow()) + ':d_play3']`), 'on the ledger in the same breath').toBe(9);
    matchEnd(w);
    expect(w.eval('walletBalance()'), 'a fourth match pays nothing more').toBe(9);
    const wk = w.eval('JSON.stringify(questState().wp)');
    expect(wk, 'the week counted the same matches').not.toBe('{}');
    // The next day that has it again: fresh, and paid once more when finished.
    const D2 = dayWith(w, 'd_play3', D + ONE_DAY);
    w.eval(`SHOP_CLOCK = ${D2}`);
    expect(row()).toMatchObject({ prog: 0, done: false, paid: false });
    matchEnd(w); matchEnd(w);
    expect(w.eval('walletBalance()')).toBe(9);
    matchEnd(w);
    expect(w.eval('walletBalance()')).toBe(18);
    // The Monday after: the week's progress is gone too, and what was paid stays paid -- "nothing lost at midnight".
    const monday = (Math.floor((Math.floor(D2 / ONE_DAY) + 3) / 7) + 1) * 7 * ONE_DAY - 3 * ONE_DAY + 3600000;
    w.eval(`SHOP_CLOCK = ${monday}`);
    expect(w.eval('JSON.stringify(questState().wp)')).toBe('{}');
    expect(w.eval('walletBalance()'), 'tokens already paid are kept').toBe(18);
  });

  it('two tabs finishing the same quest pay it once, through the real save path', async () => {
    const w = await ready();
    const D = dayWith(w, 'd_play3', DAY);
    w.eval(`SHOP_CLOCK = ${D}`);
    matchEnd(w); matchEnd(w);
    await w.eval('saveProfile()');
    // The other tab, loaded from this save two matches in, plays the third itself: paid there (+9, on the ledger), saved.
    const other = JSON.parse(w.localStorage.getItem('profile:v1'));
    const key = w.eval(`'d' + dailySeed(shopNow()) + ':d_play3'`);
    expect(other.quests.dp.d_play3).toBe(2);
    other.quests.dp.d_play3 = 3; other.quests.claims[key] = 9; other.wallet.earned = 9;
    w.localStorage.setItem('profile:v1', JSON.stringify(other));
    // ...and this tab, still holding two in memory, plays its own third match.
    matchEnd(w);
    await w.eval('saveProfile()');
    const final = JSON.parse(w.localStorage.getItem('profile:v1'));
    expect(w.eval('walletBalance()'), 'paid once').toBe(9);
    expect(final.wallet.earned, 'one quest, finished in both tabs, paid once').toBe(9);
    expect(final.quests.claims[key]).toBe(9);
    expect(w.eval(`questRows('daily').filter(function(r){ return r.quest.id==='d_play3'; })[0]`)).toMatchObject({ prog: 3, done: true, paid: true });
  });

  it('a save from before -- a quest finished and left unclaimed -- is paid when the game loads, once', async () => {
    // "Pay the moment it's done" reaches back too: nothing anyone finished is lost to a button that no longer exists.
    const w = await ready();
    const today = w.eval(`(function(){ var t = new Date(), q = questsFor('daily', t)[0];
      return { day: 'd' + dailySeed(t), week: 'w' + shopWeekNo(t), id: q.id, reward: q.reward }; })()`);
    const prior = w.eval('JSON.parse(JSON.stringify(PROFILE))');
    prior.quests = { day: today.day, week: today.week, dp: { [today.id]: 999 }, wp: {}, wf: [], claims: {} };
    const w2 = await ready({ storage: { 'profile:v1': JSON.stringify(prior) } });
    await settle(w2);
    expect(w2.eval('walletBalance()')).toBe(today.reward);
    expect(w2.eval(`questState().claims[${JSON.stringify(today.day + ':' + today.id)}]`)).toBe(today.reward);
    expect(w2.eval(`questRows('daily')[0]`)).toMatchObject({ done: true, paid: true });
    await w2.eval('saveProfile()');
    const w3 = await ready({ storage: { 'profile:v1': w2.localStorage.getItem('profile:v1') } });
    await settle(w3);
    expect(w3.eval('walletBalance()'), 'loading it again pays nothing more').toBe(today.reward);
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
      var bal = walletBalance();
      showQuestNote();
      return { ended: ended, said: said, note: document.getElementById('questNote').textContent, bal: bal,
               paid: questState().claims['d' + dailySeed(shopNow()) + ':d_play3'],
               shown: document.getElementById('questNote').style.display, prog: questState().dp.d_play3 };
    })()`);
    expect(r.ended, 'the match finished').toBe(true);
    expect(r.prog).toBe(3);
    expect(r.said.filter((t) => /quest|token|claim|win token|\bW ?\d/i.test(t)), 'no quest or token text during the match').toEqual([]);
    expect(r.shown).toBe('block');
    // Paid as the match ended ("Pay the moment it's done"), and the result screen says what and how much -- no claim, and no
    // link to go and do one: "nothing to come back for".
    expect(r.paid).toBe(9);
    expect(r.bal, '1000 earned, 115 on Star Burst, 9 for the quest -- at least').toBeGreaterThanOrEqual(894);
    expect(r.note).toMatch(/\+9 Win Tokens: Play 3 matches/);
    expect(r.note).not.toMatch(/claim|Open Quests/i);
    for (const fn of ['questMatchEnd', 'questAdd', 'questPay', 'questSettle', 'buyCosmetic', 'equipCos', 'cosKoBurst', 'drawCosTrail', 'drawCosHat', 'drawKoBurst', 'showQuestNote', 'renderResultCard', 'questSmashArm', 'questSmashHit']) {
      expect(w.eval(`String(${fn})`), `${fn} puts up no banner`).not.toMatch(/banner\(/);
    }
  }, 120000);
});

describe('cosmetics', () => {
  // Every playable fighter wears one of each kind in a real match -- running both ways, hit, KO'ing a foe -- on a render
  // (a decoded image) and on the vector art, with and without a canvas filter. Every cosmetic is worn by several fighters, except a
  // skin, which is worn by the one fighter it belongs to (on its own decoded picture for half of them) and by nobody else.
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
          var at = function(k){ var l = K(k); return l[i % l.length].id; };   // each kind round and round, so every look is worn by several fighters
          var own = K('skin').filter(function(c){ return c.fighter === name; });
          // a fighter with skins puts each on in turn (Fries has two); one without has none to wear
          (own.length ? own : [null]).forEach(function(skin){
          var pick = { hat: at('hat'), trail: at('trail'), ko: at('ko'), pose: at('pose'), card: at('card'), title: at('title') };
          if (skin) pick.skin = skin.id;
          if (skin && equipCos('skin', skin.id, name)) used[skin.id] = 1;
          if (equipCos('hat', pick.hat, name)) used[pick.hat] = 1;
          ['trail','ko','pose','card','title'].forEach(function(k){ if (equipCos(k, pick[k])) used[pick[k]] = 1; });
          var render = ((i >> 1) % 2 === 0) && SPRITES[name], skinSp = render && skin && skin.src ? cosSkinSprite(skin, name) : null;
          if (render){ SPRITES[name]._req = true; SPRITES[name].img = { complete: true, naturalWidth: 120, naturalHeight: 160 }; }
          if (skinSp){ skinSp._req = true; skinSp.img = { complete: true, naturalWidth: 150, naturalHeight: 160 }; }
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
          if (skinSp) skinSp.img = null;
          });
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
        // Firey's render is decoded in both worlds, so the dressed one draws his skin's picture where the plain one draws his own.
        SPRITES.Firey._req = true; SPRITES.Firey.img = { complete: true, naturalWidth: 150, naturalHeight: 200 };
        if (${dressed}) {
          walletEarn(100000); COSMETICS.forEach(function(c){ buyCosmetic(c.id); });
          equipCos('skin', 'sk_firey_mech', 'Firey'); equipCos('hat', 'hat_crown', 'Firey'); equipCos('trail', 'tr_rainbow'); equipCos('ko', 'ko_confetti');
          equipCos('pose', 'po_spin'); equipCos('card', 'cd_dream'); equipCos('title', 'ti_legend');
          var skinSp = cosSkinSprite(cosItem('sk_firey_mech'), 'Firey'); skinSp._req = true; skinSp.img = { complete: true, naturalWidth: 148, naturalHeight: 200 };
          var h = drawCosHat, tr = drawCosTrail, sk = cosSkinSprite, kb = drawKoBurst;
          drawCosHat = function(){ drawn.hat++; return h.apply(this, arguments); };
          drawCosTrail = function(){ drawn.trail++; return tr.apply(this, arguments); };
          cosSkinSprite = function(){ var r = sk.apply(this, arguments); if (r && spriteImage(r)) drawn.skin++; return r; };
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
    expect(dressed.drawn.skin, 'the skin\'s picture was drawn').toBeGreaterThan(0);
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

// MORE CANON LOOKS. The owner: "make cosmetics more personalized." Asked what personalized means: "more canon items." Twenty
// looks, all drawn in code (the Store may not fetch a picture): five hats, four trails, four KO effects, two poses, three cards
// and two titles, each from the show (BFDI and Inanimate Insanity wikis), and the Yoylecake Hat redrawn in the cake's own colours.
describe('the canon looks', () => {
  // [id, kind, name, price]: the approved twenty, appended after the looks the shop already had.
  const NEW_LOOKS = [
    ['acc_headphones', 'hat', 'Revolutionary Headphones', 115], ['hat_regcake', 'hat', 'Regular Cake', 115], ['acc_wings', 'hat', 'Wings', 150],
    ['hat_shimegg', 'hat', 'Shimmer Egg', 75], ['acc_reversal', 'hat', 'Reversal Sunglasses', 115],
    ['tr_wintoken', 'trail', 'Win Token Trail', 150], ['tr_melife', 'trail', 'MeLife Download', 150], ['tr_candycorn', 'trail', 'Candy Corn Trail', 115],
    ['tr_cherryjet', 'trail', 'Cherry Filling Jets', 115],
    ['ko_cake', 'ko', 'Cake Toss', 115], ['ko_scoop', 'ko', 'Sender Scoop', 150], ['ko_fist', 'ko', 'Fist Thingy', 150], ['ko_balloons', 'ko', 'Balloon Lift-off', 115],
    ['po_yoyledance', 'pose', 'Yoyle Dance', 115], ['po_melife', 'pose', 'MeLife Recovery', 150],
    ['cd_yoyleflag', 'card', 'Flag of Yoyleland', 115], ['cd_idiotic', 'card', 'Idiotic Island', 75], ['cd_purgatory', 'card', 'Purgatory Mansion', 115],
    ['ti_grandcake', 'title', 'Grand Cake Winner', 150], ['ti_idiotic', 'title', 'Idiotic Island Alumnus', 45],
  ];
  // The order a kind had before them. Append-only: an online look travels as its position in its kind (cosNetCode).
  const OLD_ORDER = {
    hat: ['hat_party', 'hat_top', 'hat_leaf', 'hat_cake', 'hat_halo', 'acc_shades', 'acc_bow', 'hat_crown'],
    trail: ['tr_spark', 'tr_ember', 'tr_bubble', 'tr_leaf', 'tr_rainbow'],
    ko: ['ko_confetti', 'ko_stars', 'ko_berry', 'ko_token', 'ko_zap'],
    pose: ['po_hop', 'po_spin', 'po_wave', 'po_flip'],
    card: ['cd_goiky', 'cd_dream', 'cd_yoyle', 'cd_cake', 'cd_canyon'],
    title: ['ti_contestant', 'ti_dreamer', 'ti_yoyle', 'ti_survivor', 'ti_collector', 'ti_legend'],
  };

  it('are in the shop at the approved names and tiers, after everything the shop already had', async () => {
    const w = await ready();
    const rows = w.eval('COSMETICS.map(function(c){ return [c.id, c.kind, c.name, c.price]; })');
    for (const [id, kind, name, price] of NEW_LOOKS) expect(rows.find((r) => r[0] === id), id).toEqual([id, kind, name, price]);
    for (const [kind, old] of Object.entries(OLD_ORDER)) {
      const added = NEW_LOOKS.filter((l) => l[1] === kind).map((l) => l[0]);
      expect(w.eval(`cosOfKind('${kind}').map(function(c){ return c.id; })`), `${kind}: the old looks keep their places, the new ones follow`).toEqual(old.concat(added));
    }
    expect(NEW_LOOKS).toHaveLength(20);
    for (const [kind, n] of [['hat', 13], ['trail', 9], ['ko', 9]]) expect(w.eval(`cosOfKind('${kind}').length`)).toBe(n);
  });

  it('are drawn in code: no picture, no lettering, on every hat, trail and KO effect', async () => {
    const w = await ready();
    const hats = NEW_LOOKS.filter((l) => l[1] === 'hat'), trails = NEW_LOOKS.filter((l) => l[1] === 'trail'), kos = NEW_LOOKS.filter((l) => l[1] === 'ko');
    const check = (r, what) => {
      expect(r.log.length, `${what} draws something`).toBeGreaterThan(0);
      expect(r.log.filter((e) => /^(drawImage|fillText|strokeText|putImageData)$/.test(e[0])).map((e) => e[0]), `${what}: no picture and no lettering`).toEqual([]);
    };
    for (const [id] of hats) { const r = rec2d(); w.eval('drawCosHat')(r.ctx, id, 1, -24, -4); check(r, id); }
    for (const [id] of trails) { const r = rec2d(); w.eval('drawCosTrail')(r.ctx, id, { vx: 8, vy: -2, r: 24 }, 1); check(r, id); }
    for (const [id] of kos) for (const t of [2, 9, 16, 30, 47]) { const r = rec2d(); w.eval('drawKoBurst')(r.ctx, id, 100, 100, t); check(r, `${id} at frame ${t}`); }
    // The pose and card kinds are CSS. Gradients only: no picture is fetched for a card.
    for (const c of w.eval("cosOfKind('card').map(function(c){ return c.bg; })")) { expect(c).toMatch(/gradient\(/); expect(c).not.toMatch(/url\(/); }
  });

  it('the Win Token Trail is the show\'s GREEN token with no letters; the Yoylecake Hat is violet, neon green and custard yellow', async () => {
    const w = await ready();
    const trail = rec2d(); w.eval('drawCosTrail')(trail.ctx, 'tr_wintoken', { vx: 8, vy: -2, r: 24 }, 1);
    expect(trail.sets.fillStyle).toEqual(expect.arrayContaining(['#008400', '#00b002']));
    expect(trail.sets.strokeStyle).toContain('#155d09');
    expect([].concat(trail.sets.fillStyle, trail.sets.strokeStyle).filter((c) => /^#(ffd23f|ffd700|f2c84b|e8a33d)$/i.test(c)), 'not gold: it is not money').toEqual([]);
    const cake = rec2d(); w.eval('drawCosHat')(cake.ctx, 'hat_cake', 1, -24, -4);
    expect(cake.sets.fillStyle).toEqual(expect.arrayContaining(['#9900fe', '#45ef0c', '#fefe67']));
    expect(cake.sets.fillStyle, 'the old tan cake with its purple berry is gone').not.toContain('#f2d7a0');
    expect(cake.sets.fillStyle).not.toContain('#6a4ad0');
    const reg = rec2d(); w.eval('drawCosHat')(reg.ctx, 'hat_regcake', 1, -24, -4);
    expect(reg.sets.fillStyle, 'the Regular Cake is pink under red icing and white cream').toEqual(expect.arrayContaining(['#ffc2c2', '#d64343', '#fdfdfd']));
    const dl = rec2d(); w.eval('drawCosTrail')(dl.ctx, 'tr_melife', { vx: 8, vy: -2, r: 24 }, 1);
    expect(dl.sets.fillStyle, 'MeLife green').toContain('#58ff78');
  });

  it('the wings, the headphones and the glasses sit on the eye line; hats sit on the top of the head', async () => {
    const w = await ready();
    const first = (id) => { const r = rec2d(); w.eval('drawCosHat')(r.ctx, id, 1, -24, -4); return r.log.find((e) => e[0] === 'translate')[1]; };
    for (const id of ['acc_shades', 'acc_headphones', 'acc_wings', 'acc_reversal']) expect(first(id), id).toEqual([0, -4]);
    for (const id of ['hat_party', 'hat_cake', 'hat_regcake', 'hat_shimegg', 'hat_crown']) expect(first(id), id).toEqual([0, -24]);
  });

  it('the Sender Scoop and the Fist Thingy work from the side of the KO point nearer the middle of the stage', async () => {
    const w = await ready();
    const WW = w.eval('WW');
    const at = (id, x, t) => { const r = rec2d(); w.eval('drawKoBurst')(r.ctx, id, x, 100, t); return r; };
    const glove = (x) => at('ko_fist', x, 3).log.filter((e) => e[0] === 'translate')[1][1][0];   // the first translate is the KO point itself
    expect(Math.sign(glove(100)), 'a KO at the left edge: the glove comes from the right').toBe(1);
    expect(Math.sign(glove(WW - 100)), 'a KO at the right edge: from the left').toBe(-1);
    const arm = (x) => at('ko_scoop', x, 3).log.find((e) => e[0] === 'lineTo')[1][0];
    expect(Math.sign(arm(100))).toBe(1);
    expect(Math.sign(arm(WW - 100))).toBe(-1);
    // Balloons rise: later frames are higher. The cake burst is fourteen pieces, in the existing loop.
    const ys = (t) => Math.min(...at('ko_balloons', 100, t).log.filter((e) => e[0] === 'ellipse').map((e) => e[1][1]));
    expect(ys(20)).toBeLessThan(ys(4));
    expect(at('ko_cake', 100, 20).log.filter((e) => e[0] === 'rotate').length).toBe(14);
  });

  it('the two new poses are CSS, and stand still for anyone who asks for less motion', async () => {
    for (const id of ['po_yoyledance', 'po_melife']) {
      expect(SRC, id).toContain(`.pose-${id}{animation:`);
    }
    expect(SRC).toMatch(/@keyframes poseYoyleDance/);
    expect(SRC).toMatch(/@keyframes poseMeLife\{[^}]*clip-path:inset\(100% 0 0 0\)/);
    expect(SRC, 'the MeLife glow').toMatch(/poseMeLife[\s\S]{0,400}#58ff78/);
    const w = await ready();
    const poses = w.eval("cosOfKind('pose').map(function(c){ return c.id; })");
    const reduced = SRC.match(/@media \(prefers-reduced-motion: reduce\)\{([^\n]*)\}/)[1];
    for (const id of poses) {
      expect(SRC, `${id} has its class`).toContain(`.pose-${id}{`);
      expect(reduced, `${id} stops for reduced motion`).toContain(`.pose-${id}`);
    }
  });

  it('every look\'s Store preview draws without a fault', async () => {
    const w = await ready();
    // (with the Vault fighters opened, so the Store lists their skins too: every look has a cell)
    const r = w.eval(`(function(){ VAULT_FIGHTERS.forEach(function(n){ PROFILE.unlocked.push(n); }); go('store'); return { cells: document.querySelectorAll('#storeList .scell').length, total: COSMETICS.length,
      err: COS_DRAW_ERR ? String(COS_DRAW_ERR.stack || COS_DRAW_ERR) : null }; })()`);
    expect(r.err).toBe(null);
    expect(r.cells).toBe(r.total);
  });
});

// THE SKINS. "the skins should be by-fighter(like rockstar poppy, broken fries, robot pin)": a skin is a second render of ONE fighter, from
// the show's own wikis, worn only by that fighter. Twenty-five were approved first ("Rockstar Poppy; Broken Fries; Robot Pin (the wiki's Mech
// Pin)..."), sold for Win Tokens at the tier the plan gave each. Then: "If you can, give each fighter a skin. for the ii characters, it can
// just be them from the challenge where hmps loses." -- "oh yea the hmps thing is for e3." -- "in s4": Heavy Metal Pop Stars lose three
// challenges of Inanimate Insanity IV, among them Run the Risk! (episode 3, the blindfolded relay) and Fan the Flames (episode 4, their rock
// show, the Rockstar skins). And: "skins from this challenge. also if you can find more than 1 skin per character, add them." So every
// playable fighter has at least one, and a fighter with several real canon looks has them all.
describe('the skins', () => {
  // [id, fighter, name, price]: the first twenty-five, in the owner's order. They replace the seven colour washes, whose places in the online code they leave empty.
  const SKINS = [
    ['sk_poppy_rock', 'Poppy', 'Rockstar Poppy', 150], ['sk_fries_broken', 'Fries', 'Broken Fries', 115], ['sk_pin_robot', 'Pin', 'Robot Pin', 150],
    ['sk_firey_mech', 'Firey', 'Mech Firey', 150], ['sk_woody_mech', 'Woody', 'Mech Woody', 150], ['sk_coiny_robo', 'Coiny', 'Robo Coiny', 150],
    ['sk_paper_rock', 'Paper', 'Rockstar Paper', 150], ['sk_tapey_rock', 'Tapey', 'Rockstar Tapey', 150],
    ['sk_starfruit_rock', 'Starfruit', 'Rockstar Starfruit', 115], ['sk_lightbulb_rock', 'Lightbulb', 'Rockstar Lightbulb', 115],
    ['sk_tv_upgraded', 'TV', 'Upgraded TV', 150], ['sk_fries_glow', 'Fries', 'Glow Fries', 115], ['sk_snowball_zombie', 'Snowball', 'Zombieball', 115],
    ['sk_golfball_cracked', 'Golf Ball', 'Cracked Golf Ball', 75], ['sk_book_shattered', 'Book', 'Shattered Book', 75],
    ['sk_fan_battered', 'Fan', 'Battered Fan', 115], ['sk_jack_tattered', 'Jack', 'Tattered Jack', 75], ['sk_bow_tattered', 'Bow', 'Tattered Bow', 115],
    ['sk_bomby_bandaged', 'Bomby', 'Bandaged Bomby', 75], ['sk_match_knight', 'Match', 'Knight Match', 75], ['sk_grassy_chef', 'Grassy', 'Chef Grassy', 75],
    ['sk_nickel_snazzy', 'Nickel (II)', 'Snazzy Nickel', 75], ['sk_testtube_labcoat', 'Test Tube', 'Lab-Coat Test Tube', 75],
    ['sk_yinyang_detective', 'Yin-Yang', 'Detective Yin-Yang', 75], ['sk_lifering_invest', 'Lifering', 'Investigator Lifering', 75],
  ];
  const ids = SKINS.map((r) => r[0]);
  // Every skin in the order the catalogue holds them: a skin's place is its online code (cosNetCode), so the order is append-only. The first
  // twenty-five are the owner's list above; the rest were added after, one batch at a time (regenerated with each batch).
  // SKIN_ORDER begin
  const SKIN_ORDER = ids.concat([
    'sk_taco2_blind', 'sk_micro_blind', 'sk_box_blind', 'sk_trophy_blind', 'sk_goo_blind', 'sk_spikey_blind',
    'sk_candle_blind', 'sk_cheesy_blind', 'sk_soap_blind', 'sk_teakettle_blind', 'sk_cherries_blind', 'sk_magnet_blind',
    'sk_metag_blind', 'sk_bonesaw_blind', 'sk_bot_damaged', 'sk_cammy_cam1', 'sk_teddy_tired', 'sk_balloon_hardhat',
    'sk_bomb_snorkel', 'sk_knife_damaged', 'sk_paint_yellow', 'sk_marsh_burnt', 'sk_apple_snot', 'sk_baseball_choc',
    'sk_pickle_boxing', 'sk_salt_facemask', 'sk_dough_solid', 'sk_tissues_snot', 'sk_blueberry_gold', 'sk_clover_detect',
    'sk_spoon_gold', 'sk_trophy_whistle', 'sk_goo_muscle', 'sk_spikey_ropes', 'sk_soap_oil', 'sk_balloon_blue',
    'sk_taco2_soggy', 'sk_clover_deer', 'sk_spoon_icecream', 'sk_spoon_hardhat', 'sk_paint_icecream', 'sk_marsh_guac',
    'sk_leafy_witch', 'sk_leafy_metal', 'sk_leafy_sweater', 'sk_needle_alien', 'sk_bubble_metal', 'sk_bubble_balloon',
    'sk_bubble_aloe', 'sk_teardrop_sweater', 'sk_teardrop_blind', 'sk_flower_petal', 'sk_flower_metal', 'sk_flower_frozen',
    'sk_tball_chef', 'sk_tball_metal', 'sk_tball_sleepy', 'sk_blocky_shades', 'sk_blocky_glove', 'sk_pen_capless',
    'sk_pencil_gears', 'sk_pencil_shoes', 'sk_rocky_tangerine', 'sk_rocky_cracked', 'sk_rocky_frozen', 'sk_gel_phones',
    'sk_gel_sweater', 'sk_gel_dyed', 'sk_nickel_triangle', 'sk_nickel_pink', 'sk_nickel_square', 'sk_puff_frozen',
    'sk_puff_think', 'sk_ruby_metal', 'sk_ruby_snow', 'sk_ruby_bandaged', 'sk_yf_metal', 'sk_yf_frozen',
    'sk_bb_zombie', 'sk_bb_metal', 'sk_bball_metal', 'sk_bell_snow', 'sk_bell_twinkle', 'sk_fanny_jet',
    'sk_money_wet', 'sk_naily_happy', 'sk_pillow_charred', 'sk_remote_acid', 'sk_remote_siren', 'sk_rose_frozen',
    'sk_rose_flame', 'sk_saw_sizzle', 'sk_saw_nohandle', 'sk_taco_fishless', 'sk_taco_evil', 'sk_tpaste_frozen',
    'sk_dora_bob', 'sk_david_orange', 'sk_fjr_grin', 'sk_fern_frozen', 'sk_ruler_crown', 'sk_sidewalky_shades',
    'sk_sidewalky_snow', 'sk_sidewalky_crack', 'sk_profily_leaf', 'sk_profily_watch', 'sk_roboty_open', 'sk_roboty_plunger',
    'sk_icy_phones', 'sk_icy_pink', 'sk_icy_springy', 'sk_cake_caked', 'sk_donut_dough', 'sk_balloony_tang',
    'sk_balloony_eye', 'sk_brace_magenta', 'sk_brace_purple',
  ]);
  // SKIN_ORDER end
  // Playable fighters with no skin, and why (name -> reason). The prize fighters of Steve Cobs's fight are not in ROSTER until he is beaten, so
  // they are not playable here, and the owner's rule keeps them out of every table this one is in: they are not listed.
  // NO_SKIN begin
  const NO_SKIN = {
    'Gaty': 'not yet',
    'Lightning': 'not yet',
    'Liy': 'not yet',
    'Lollipop': 'not yet',
    'Loser': 'not yet',
    'Marker': 'not yet',
    'Tree': 'the owner\'s standing rule: Do not change Tree',
  };
  // NO_SKIN end

  it('are in the shop: the first twenty-five at their approved names and tiers, then the rest, each for one playable fighter, and the kind holds nothing else', async () => {
    const w = await ready();
    const rows = w.eval("cosOfKind('skin').map(function(c){ return { id: c.id, fighter: c.fighter || null, name: c.name, price: c.price, src: c.src || null, flip: !!c.flip, imgH: c.imgH, imgW: c.imgW }; })");
    for (const [id, fighter, name, price] of SKINS) expect(rows.find((r) => r.id === id), id).toMatchObject({ id, fighter, name, price });
    expect(rows, 'the kind is exactly these skins: no colour wash is left, none missing, none extra').toHaveLength(SKIN_ORDER.length);
    expect(rows.filter((r) => r.fighter), 'every row names its fighter').toHaveLength(SKIN_ORDER.length);
    expect(rows.map((r) => r.id), 'in this order: the first 25 are the owner\'s list, and a skin\'s place is its online code').toEqual(SKIN_ORDER);
    expect(SKIN_ORDER.slice(0, 25), 'the first 25 keep their places').toEqual(ids.slice(0, 25));
    const playable = w.eval("ROSTER.filter(function(r){ return r.play; }).map(function(r){ return r.name; })");
    for (const r of rows.filter((x) => x.fighter)) {
      expect(playable, `${r.id}: ${r.fighter} is a playable fighter`).toContain(r.fighter);
      expect(r.id).toMatch(/^[a-z][a-z0-9_]{0,23}$/);
      expect(r.imgH, `${r.id} is fitted into a box`).toBeGreaterThan(2);
      expect(r.imgW).toBeGreaterThan(2);
    }
    // the tiers: a mech suit, a guitar or a new base is large (150); makeup or a change of colour or form, medium (115); a hat, a coat or a scuff, small (75)
    expect(new Set(rows.filter((r) => r.fighter).map((r) => r.price))).toEqual(new Set([75, 115, 150]));
    expect(rows.filter((r) => r.fighter && r.fighter === 'Fries').map((r) => r.name), 'one fighter may have two').toEqual(['Broken Fries', 'Glow Fries']);
    for (const c of w.eval("COSMETICS.map(function(c){ return c.id; })")) expect(c).toMatch(/^[a-z][a-z0-9_]{0,23}$/);
    expect(new Set(rows.map((r) => r.id)).size, 'no id twice').toBe(rows.length);
    expect(new Set(rows.map((r) => r.src)).size, 'no picture twice').toBe(rows.length);
  });

  it('every playable fighter has at least one skin of its own (several where there are several real canon looks), and no one else has any', async () => {
    const w = await ready();
    const playable = w.eval("ROSTER.filter(function(r){ return r.play; }).map(function(r){ return r.name; })");
    const per = {};
    for (const f of w.eval("cosOfKind('skin').map(function(c){ return c.fighter; })")) per[f] = (per[f] || 0) + 1;
    expect(playable.filter((n) => (NO_SKIN[n] ? (per[n] || 0) !== 0 : (per[n] || 0) < 1)).map((n) => `${n}: ${per[n] || 0}`), 'a fighter without a skin (and not a listed skip)').toEqual([]);
    expect(Object.keys(per).filter((n) => !playable.includes(n)), 'no skin names anyone who is not a playable fighter').toEqual([]);
    for (const n of Object.keys(NO_SKIN)) expect(playable, `${n} is listed as a skip, so it must be a real fighter`).toContain(n);
    // the prize fighters of Steve Cobs's fight and The Floor have no skin of their own
    for (const n of ['OJ', 'Suitcase', 'Cabby', 'The Floor']) expect(per[n] || 0, n).toBe(0);
    expect(w.eval("cosOfKind('skin').length"), 'at least one skin per playable fighter').toBeGreaterThanOrEqual(playable.length - Object.keys(NO_SKIN).length);
    // the fighters who have more than one (a skin is one look, worn one at a time)
    expect(Object.entries(per).filter(([, n]) => n > 1).length, 'Fries has two, and so do the others the owner asked for').toBeGreaterThanOrEqual(1);
  });

  it('each has its own picture: a transparent 200 px render in assets/sprites/skins/, in the manifest, in CREDITS.md, and a thumbnail for the Store', async () => {
    const w = await ready();
    const rows = w.eval("cosOfKind('skin').filter(function(c){ return c.fighter; }).map(function(c){ return { id: c.id, fighter: c.fighter, name: c.name, src: c.src, flip: !!c.flip }; })");
    const manifest = JSON.parse(readFileSync('scripts/sprite-manifest-skins.json', 'utf8'));
    const credits = readFileSync('artifacts/V1/assets/sprites/CREDITS.md', 'utf8');
    const thumbs = w.eval('COS_SKIN_THUMBS');
    expect(Object.keys(thumbs).sort()).toEqual(rows.map((r) => r.id).sort());
    expect(Object.keys(manifest).sort(), 'the manifest holds the skins and nothing else').toEqual(rows.map((r) => r.name).sort());
    for (const r of rows) {
      const file = `artifacts/V1/${r.src}`, m = manifest[r.name];
      expect(r.src, r.id).toMatch(/^assets\/sprites\/skins\/[a-z0-9-]+\.png$/);
      expect(existsSync(file), `${r.id}: ${file} exists`).toBe(true);
      const png = PNG.sync.read(readFileSync(file));
      expect(png.height, `${r.id} is 200 px tall, like every render`).toBe(200);
      let clear = 0; for (let i = 3; i < png.data.length; i += 4) if (png.data[i] === 0) clear++;
      expect(clear / (png.width * png.height), `${r.id} is a cut-out with a transparent background`).toBeGreaterThan(0.15);
      expect(png.data[3], 'the corner is clear').toBe(0);
      expect(m, `${r.id} is in scripts/sprite-manifest-skins.json`).toBeTruthy();
      expect(m).toMatchObject({ ok: true, fighter: r.fighter, file: basename(r.src), width: png.width, height: 200 });
      expect(m.source, r.id).toMatch(/^https:\/\/static\.wikia\.nocookie\.net\/(battlefordreamisland|inanimateinsanity)\/images\//);
      expect(credits, `${r.id}'s source URL is credited in CREDITS.md`).toContain(m.source);
      expect(credits).toContain(`skins/${basename(r.src)}`);
      expect(!!m.flipEye, `${r.id}: which way it faces was read by eye, not by the script's centroid`).toBe(r.flip);
      // the thumbnail: a PNG data: URI, at most 56 px on a side and a few KB, so the Store can show the skin without fetching anything
      const t = thumbs[r.id];
      expect(t, r.id).toMatch(/^data:image\/png;base64,/);
      const tp = PNG.sync.read(Buffer.from(t.split(',')[1], 'base64'));
      expect(Math.max(tp.width, tp.height), `${r.id}'s thumbnail`).toBeLessThanOrEqual(56);
      expect(t.length, `${r.id}'s thumbnail is small`).toBeLessThan(6500);
    }
    // nothing else in the folder: every file is one of the skins
    expect(readdirSync('artifacts/V1/assets/sprites/skins').sort()).toEqual(rows.map((r) => basename(r.src)).sort());
  });

  it('are worn by their own fighter and nobody else, from the Wardrobe, a save or a join code alike', async () => {
    const w = await ready();
    const r = w.eval(`(function(){
      walletEarn(10000); COSMETICS.forEach(function(c){ buyCosmetic(c.id); });
      var out = {};
      out.onOther = equipCos('skin', 'sk_pin_robot', 'Firey');            // Pin's skin on Firey
      out.onNobody = equipCos('skin', 'sk_pin_robot');
      out.onOwn = equipCos('skin', 'sk_pin_robot', 'Pin');
      out.worn = [wornCos('skin', 'Pin'), wornCos('skin', 'Firey')];
      // a save (or another tab) that says otherwise does not dress Firey in it
      PROFILE.cos.f.Firey = { skin: 'sk_pin_robot' };
      out.saved = wornCos('skin', 'Firey');
      out.mine = myCos('Firey');
      // Fries has two, one at a time
      equipCos('skin', 'sk_fries_broken', 'Fries'); equipCos('skin', 'sk_fries_glow', 'Fries');
      out.fries = wornCos('skin', 'Fries');
      out.sprite = [cosSkinSprite(cosItem('sk_pin_robot'), 'Pin') ? 'pin' : null, cosSkinSprite(cosItem('sk_pin_robot'), 'Firey') ? 'firey' : null];
      return out; })()`);
    expect(r.onOther, 'Pin\'s skin will not go on Firey').toBe(false);
    expect(r.onNobody, 'a skin needs its fighter named').toBe(false);
    expect(r.onOwn).toBe(true);
    expect(r.worn).toEqual(['sk_pin_robot', null]);
    expect(r.saved, 'a save that says Firey wears it: he does not').toBe(null);
    expect(r.mine ? r.mine.skin : null).toBe(null);
    expect(r.fries, 'one skin at a time, the last put on').toBe('sk_fries_glow');
    expect(r.sprite).toEqual(['pin', null]);
  });

  it('swap the render: the skin\'s picture is drawn in place of the plain one, once it has decoded, and only on its fighter', async () => {
    const rec = rec2d();
    const w = await ready({ ctx2d: () => rec.ctx });
    const scene = (name, setup) => {
      rec.log.length = 0;
      w.eval(`(function(){ ${setup};
        chosen = ROSTER.find(function(x){ return x.name === ${JSON.stringify(name)}; }); SETTINGS.mode = 'ffa'; SETTINGS.count = 2; SETTINGS.stocks = 3; LINEUP_MEMO = null;
        startMatch(); for (var i = 0; i < 3; i++){ step(); draw(); } running = false; })()`);
      return rec.log.filter((e) => e[0] === 'drawImage' && e[1][0] && e[1][0].tag).map((e) => e[1][0].tag);
    };
    w.eval(`walletEarn(10000); COSMETICS.forEach(function(c){ buyCosmetic(c.id); });
      window.__img = function(tag){ return { complete: true, naturalWidth: 171, naturalHeight: 200, tag: tag }; };
      SPRITES.Pin._req = true; SPRITES.Pin.img = __img('base');
      var sk = cosSkinSprite(cosItem('sk_pin_robot'), 'Pin'); sk._req = true; sk.img = __img('skin');`);
    const wear = "equipCos('skin', 'sk_pin_robot', 'Pin')", bare = "equipCos('skin', null, 'Pin')";
    const worn = scene('Pin', wear);
    expect(worn, 'Robot Pin is drawn').toContain('skin');
    expect(worn, 'and the plain render is not').not.toContain('base');
    expect(scene('Pin', bare), 'without it, the plain render').toEqual(expect.arrayContaining(['base']));
    expect(scene('Pin', bare)).not.toContain('skin');
    // not yet decoded (or never: a 404): the plain render stays, never the blob
    const pending = scene('Pin', wear + "; COS_SKIN_SPRITES.sk_pin_robot.img = null");
    expect(pending).toContain('base');
    expect(pending).not.toContain('skin');
    w.eval("COS_SKIN_SPRITES.sk_pin_robot.img = __img('skin')");
    // another fighter handed Pin's skin -- a stale save, another player's join code -- does not wear it
    w.eval("SPRITES.Firey._req = true; SPRITES.Firey.img = __img('firey')");
    const spoofed = scene('Firey', "cosOf = function(f){ return f.you ? { skin: 'sk_pin_robot', hat: null, trail: null, ko: null } : null; }");
    expect(spoofed).toContain('firey');
    expect(spoofed).not.toContain('skin');
  }, 120000);

  it('give way while worn: no painted limb rig (it was measured on the plain picture) and none of the fighter\'s own pose swaps', async () => {
    const rec = rec2d();
    const w = await ready({ ctx2d: () => rec.ctx });
    const r = w.eval(`(function(){
      walletEarn(10000); COSMETICS.forEach(function(c){ buyCosmetic(c.id); });
      var img = function(){ return { complete: true, naturalWidth: 171, naturalHeight: 200 }; }, calls = { rig: 0, body: 0 };
      var lm = limbMoves; limbMoves = function(){ calls.rig++; return lm.apply(this, arguments); };
      var swaps = {};
      ['Lifering', 'Yin-Yang'].forEach(function(n){ var a = FIGHTER_ANIM[n], b = a.body; swaps[n] = 0; a.body = function(){ swaps[n]++; return b.apply(this, arguments); }; });
      var play = function(name, skinId){
        SPRITES[name]._req = true; SPRITES[name].img = img();
        var sk = cosSkinSprite(cosItem(skinId), name); sk._req = true; sk.img = img();
        chosen = ROSTER.find(function(x){ return x.name === name; }); SETTINGS.mode = 'ffa'; SETTINGS.count = 2; SETTINGS.stocks = 3; LINEUP_MEMO = null;
        startMatch(); for (var i = 0; i < 3; i++){ step(); draw(); } running = false;
      };
      var out = {};
      equipCos('skin', null, 'Pin'); calls.rig = 0; play('Pin', 'sk_pin_robot'); out.rigPlain = calls.rig;
      equipCos('skin', 'sk_pin_robot', 'Pin'); calls.rig = 0; play('Pin', 'sk_pin_robot'); out.rigSkin = calls.rig;
      out.body = {};
      [['Lifering', 'sk_lifering_invest'], ['Yin-Yang', 'sk_yinyang_detective']].forEach(function(p){
        equipCos('skin', null, p[0]); swaps[p[0]] = 0; play(p[0], p[1]); var plain = swaps[p[0]];
        equipCos('skin', p[1], p[0]); swaps[p[0]] = 0; play(p[0], p[1]); out.body[p[0]] = [plain, swaps[p[0]]];
      });
      return out; })()`);
    expect(r.rigPlain, 'the plain Pin asks the rig for her limbs').toBeGreaterThan(0);
    expect(r.rigSkin, 'Robot Pin does not').toBe(0);
    for (const [name, [plain, skin]] of Object.entries(r.body)) {
      expect(plain, `${name}'s pose swaps run on the plain render`).toBeGreaterThan(0);
      expect(skin, `${name}'s skin stays put while it is worn`).toBe(0);
    }
  }, 120000);

  it('ride the online join like every look: four characters while the skin\'s place fits one, five (the skin takes two) after that, and every other kind still fits one', async () => {
    const w = await ready();
    const r = w.eval(`(function(){
      var out = { rt: [], counts: {}, reserved: COS_NET_RESERVED.skin };
      COS_KINDS.slice(0, 4).forEach(function(kind){
        out.counts[kind] = cosOfKind(kind).length;
        cosOfKind(kind).forEach(function(it, i){
          var c = {}; c[kind] = it.id; var code = cosNetCode(c), back = cosNetDecode(code);
          out.rt.push([it.id, code.length, back && back[kind], kind, i]);
        });
      });
      return out; })()`);
    let longs = 0;
    for (const [id, len, back, kind, i] of r.rt) {
      const long = kind === 'skin' && i + 1 + r.reserved > 35;
      if (long) longs++;
      expect(len, `${id}: the same four characters it always was while its place fits one, five after`).toBe(long ? 5 : 4);
      expect(back, `${id} comes back as itself`).toBe(id);
    }
    // One base-36 character per kind, 0 meaning none: hats, trails and KO effects hold 35 looks at most. The skins are the only kind that outgrew it
    // (one for each fighter), and they take two characters past the 28th: the long form is in use, and it carries the other three slots too.
    for (const kind of ['hat', 'trail', 'ko']) expect(r.counts[kind], `${kind} stays within one character`).toBeLessThanOrEqual(35);
    expect(longs, 'skins past the first 28 exist, so the long form is exercised').toBeGreaterThan(0);
    expect(r.counts.skin + r.reserved, 'the skins fit the two-character code (36 x 36 places, 0 meaning none)').toBeLessThan(36 * 36);
    const mix = w.eval(`(function(){
      var sk = cosOfKind('skin'), last = sk[sk.length - 1].id, hat = cosOfKind('hat')[7].id, tr = cosOfKind('trail')[0].id, ko = cosOfKind('ko')[4].id;
      var code = cosNetCode({ skin: last, hat: hat, trail: tr, ko: ko });
      return { code: code, back: cosNetDecode(code), last: last, hat: hat, tr: tr, ko: ko, legacy: cosNetCode({ skin: sk[0].id, hat: hat, trail: tr, ko: ko }) }; })()`);
    expect(mix.code).toMatch(/^[0-9a-z]{2}815$/);
    expect(mix.back).toEqual({ skin: mix.last, hat: mix.hat, trail: mix.tr, ko: mix.ko });
    expect(mix.legacy, 'a skin among the first 28 is sent exactly as an older build sent it').toBe('8815');
    // A code for a fighter that cannot wear the skin never dresses that fighter (the drawing asks again), and a garbled one dresses no one.
    for (const bad of ['0zzz', '!!!!', 'zzzzzz', '000', '', '00000']) expect(w.eval(`cosNetDecode(${JSON.stringify(bad)})`), JSON.stringify(bad)).toBe(null);
  });

  it('are shown in the Store by their own thumbnail (no <img>, no request), name their fighter, wear on that fighter, and keep Vault fighters secret', async () => {
    const w = await ready();
    const r = w.eval(`(function(){
      var srcs = [], OI = window.Image;
      window.Image = function(){ var im = new OI(); Object.defineProperty(im, 'src', { set: function(v){ srcs.push(String(v)); }, get: function(){ return ''; } }); return im; };
      walletEarn(100000); COSMETICS.forEach(function(c){ buyCosmetic(c.id); });
      var vault = cosOfKind('skin').filter(function(c){ return VAULT_FIGHTERS.has(c.fighter); });
      go('store');
      var cell = function(id){ return document.querySelector('#storeList .scell[data-id="' + id + '"]'); };
      var out = { imgs: document.querySelectorAll('#store img').length, canvases: cell('sk_pin_robot').querySelectorAll('canvas').length,
        caption: cell('sk_pin_robot').querySelector('.sfor').textContent,
        listed: cosOfKind('skin').filter(function(c){ return c.fighter && cell(c.id); }).length,
        secret: vault.map(function(c){ return !!cell(c.id); }),
        text: (function(){ var t = document.getElementById('storeList').textContent, caps = [].slice.call(document.querySelectorAll('#storeList .sfor')).map(function(e){ return e.textContent; });
          return vault.map(function(c){ return t.indexOf(c.name) + caps.filter(function(x){ return x === 'for ' + c.fighter; }).length; }); })(),
        named: (function(){ var t = document.getElementById('storeList').textContent, seen = [], others = COSMETICS.filter(function(c){ return !(c.fighter && VAULT_FIGHTERS.has(c.fighter)); }).map(function(c){ return c.name; }).join('|');
          vault.forEach(function(c){ if(seen.indexOf(c.fighter) < 0 && others.indexOf(c.fighter) < 0 && t.indexOf(c.fighter) >= 0) seen.push(c.fighter); }); return seen; })() };
      out.srcs = srcs.filter(function(u){ return !/^data:image\\/png;base64,/.test(u); }).length;
      out.thumbs = srcs.length;
      // Wear from the Store: it goes on the skin's own fighter, not on whoever is picked
      chosen = ROSTER.find(function(x){ return x.name === 'Bubble'; });
      cell('sk_pin_robot').querySelector('button').click();
      out.worn = [wornCos('skin', 'Pin'), wornCos('skin', 'Bubble')];
      // a code opens a Vault fighter: then that fighter's skin is in the Store, and no other Vault fighter's
      out.total = cosOfKind('skin').length; out.vault = vault.map(function(c){ return c.fighter; });
      var who = []; vault.forEach(function(c){ if(who.indexOf(c.fighter) < 0) who.push(c.fighter); });
      out.who = who; out.opened = [];
      who.forEach(function(name){
        PROFILE.unlocked.push(name); go('store');
        out.opened.push(vault.map(function(d){ return !!cell(d.id); }));
      });
      window.Image = OI;
      return out; })()`);
    expect(r.imgs, 'the Store puts no picture on the page').toBe(0);
    expect(r.canvases, 'a skin\'s preview is a canvas').toBe(1);
    expect(r.vault.length, 'some Vault fighters (Marshmallow, Balloon, Lightbulb, Taco (II), Bow) have a skin').toBeGreaterThanOrEqual(3);
    expect(r.thumbs, 'one thumbnail decoded for each skin the Store listed, at least').toBeGreaterThanOrEqual(r.total - r.vault.length);
    expect(r.srcs, 'and every one is a data: URI: nothing is fetched').toBe(0);
    expect(r.caption).toBe('for Pin');
    expect(r.listed, 'every skin of a fighter anyone may know of').toBe(r.total - r.vault.length);
    expect(r.secret, 'the Vault fighters\' skins are not in the Store while those fighters are locked').toEqual(r.vault.map(() => false));
    expect(r.text.every((i) => i === -1), 'and the Store shows neither their skins\' names nor a "for" line naming them').toBe(true);
    expect(r.named, 'nor the fighter\'s name anywhere (but where another look happens to carry it, like the Big Bow and the Balloon Lift-off)').toEqual([]);
    expect(r.worn).toEqual(['sk_pin_robot', null]);
    expect(r.who.length, 'five Vault fighters have skins').toBeGreaterThanOrEqual(3);
    r.opened.forEach((row, i) => expect(row, `${r.who[i]} opened: its skins appear, and the Vault fighters still to open do not`).toEqual(r.vault.map((name) => r.who.indexOf(name) <= i)));
  }, 60000);

  it('are offered in the Wardrobe to the fighter they belong to, among their own', async () => {
    const w = await ready();
    const r = w.eval(`(function(){
      walletEarn(100000); COSMETICS.forEach(function(c){ buyCosmetic(c.id); });
      PROFILE.unlocked.push('Fries', 'Pin');
      var chips = function(name){ WARDROBE_PICK = name; go('wardrobe');
        var secs = [].slice.call(document.querySelectorAll('#wardFighterSlots .shopsec')), sk = secs.filter(function(s){ return s.textContent === 'Skins'; })[0];
        return sk ? [].slice.call(sk.nextElementSibling.querySelectorAll('.wchip')).map(function(b){ return b.textContent; }) : null; };
      var out = { fries: chips('Fries'), pin: chips('Pin'), firey: chips('Firey') };
      WARDROBE_PICK = 'Pin'; go('wardrobe');
      var chip = [].slice.call(document.querySelectorAll('#wardFighterSlots .wchip')).filter(function(b){ return b.textContent === 'Robot Pin'; })[0];
      chip.click();
      out.worn = wornCos('skin', 'Pin');
      return out; })()`);
    expect(r.fries, 'Fries wears either of his two').toEqual(['None', 'Broken Fries', 'Glow Fries']);
    expect(r.pin).toEqual(['None', 'Robot Pin']);
    expect(r.firey).toEqual(['None', 'Mech Firey']);
    expect(r.worn).toBe('sk_pin_robot');
  }, 60000);
});

// THE SEVEN OLD RECOLOURS. Colour washes any fighter could wear: Yoylestone, Yoyleberry, Frostbite, Goiky Green, Cake Frosting, Evil Twin and
// Win Token Gold. The owner, on the global washes once the skins were by-fighter: "Remove all seven". They leave the shop; whoever bought
// one gets its Win Tokens back, once, when the game loads (the price they paid, whatever the price is now); one being worn is taken off.
describe('the seven old recolours', () => {
  // id -> what a player paid for it under the first prices (100, 100, 100, 100, 100, 150, 200) and under the reduced ones (75, 75, 75, 75, 75, 115, 150)
  const SEVEN = { sk_yoyle: 100, sk_berry: 100, sk_frost: 100, sk_goiky: 100, sk_frosting: 100, sk_evil: 150, sk_gold: 200 };
  const oldSave = async (owned, extra = {}) => {
    // a save as the last build wrote it, taken through the real loader
    const w0 = await ready();
    const p = w0.eval('JSON.parse(JSON.stringify(PROFILE))');
    p.wallet = { earned: 1000, spent: Object.values(owned).reduce((a, b) => a + b, 0) + (extra.spent || 0), owned };
    if (extra.cos) p.cos = extra.cos;
    return JSON.stringify(p);
  };

  it('are not in the shop: no row, nothing to buy, nothing to wear, no cell in the Store, nothing that draws a wash', async () => {
    const w = await ready();
    const r = w.eval(`(function(){
      walletEarn(10000);
      var ids = ${JSON.stringify(Object.keys(SEVEN))}, out = { buy: [], wear: [], item: [], cells: 0 };
      ids.forEach(function(id){ out.buy.push(buyCosmetic(id).why); out.wear.push(equipCos('skin', id, 'Firey')); out.item.push(cosItem(id)); });
      go('store'); out.cells = ids.filter(function(id){ return !!document.querySelector('#storeList .scell[data-id="' + id + '"]'); }).length;
      out.names = COSMETICS.filter(function(c){ return ['Yoylestone','Yoyleberry','Frostbite','Goiky Green','Cake Frosting','Evil Twin','Win Token Gold'].indexOf(c.name) >= 0; }).length;
      out.filtered = COSMETICS.filter(function(c){ return c.filter || c.wash; }).length;
      out.owned = ids.filter(ownsCos).length;
      return out; })()`);
    expect(r.buy).toEqual(Array(7).fill('unknown'));
    expect(r.wear).toEqual(Array(7).fill(false));
    expect(r.item).toEqual(Array(7).fill(null));
    expect(r.cells).toBe(0);
    expect(r.names, 'not under their names either').toBe(0);
    expect(r.filtered, 'no look carries a filter or a wash').toBe(0);
    expect(r.owned, 'and buying them left nothing behind').toBe(0);
    expect(w.eval("COS_RETIRED && Object.keys(COS_RETIRED)")).toEqual(Object.keys(SEVEN));
    // and nothing in the game's code draws a recolour any more
    expect(CODE).not.toMatch(/cosSkinOn|cosFilterOk|\.wash\b|wash:'/);
  });

  it('a save that owned some is paid back what it paid, once, when the game loads, and stays paid across reloads', async () => {
    const save = await oldSave({ sk_gold: 200, sk_yoyle: 100, hat_party: 75 }, { cos: { f: {}, trail: null, ko: null, pose: null, card: null, title: null } });
    const w = await ready({ storage: { 'profile:v1': save } });
    await settle(w);
    // 1000 earned, 375 spent; 300 of it comes back
    expect(w.eval('walletBalance()')).toBe(1000 - 375 + 300);
    const stored = JSON.parse(w.localStorage.getItem('profile:v1'));
    expect(stored.wallet.earned, 'and it is saved at once, not at the next purchase').toBe(1300);
    expect(stored.wallet.spent, 'what was spent stays spent').toBe(375);
    expect(stored.wallet.owned, 'the marks, beside the looks').toEqual({ sk_gold: 200, sk_yoyle: 100, hat_party: 75, refunded_sk_gold: 0, refunded_sk_yoyle: 0 });
    expect(w.eval('ownsCos("hat_party")'), 'a look that stays is untouched').toBe(true);
    // reload, reload: paid once
    let again = w, raw = w.localStorage.getItem('profile:v1');
    for (let i = 0; i < 3; i++) {
      again = await ready({ storage: { 'profile:v1': raw } });
      await settle(again);
      expect(again.eval('walletBalance()'), `load ${i + 2}`).toBe(1000 - 375 + 300);
      await again.eval('saveProfile()');
      raw = again.localStorage.getItem('profile:v1');
      expect(JSON.parse(raw).wallet.earned).toBe(1300);
    }
    // one that was never bought pays nothing
    const none = await ready({ storage: { 'profile:v1': await oldSave({ hat_party: 75 }) } });
    await settle(none);
    expect(none.eval('walletBalance()')).toBe(1000 - 75);
  }, 120000);

  it('every one of the seven is paid back at what it cost, all together', async () => {
    const save = await oldSave(SEVEN);
    const w = await ready({ storage: { 'profile:v1': save } });
    await settle(w);
    const paid = Object.values(SEVEN).reduce((a, b) => a + b, 0);   // 850
    expect(paid).toBe(850);
    expect(w.eval('walletBalance()')).toBe(1000 - paid + paid);
    expect(Object.keys(JSON.parse(w.localStorage.getItem('profile:v1')).wallet.owned).filter((k) => k.startsWith('refunded_')).sort()).toEqual(Object.keys(SEVEN).map((k) => 'refunded_' + k).sort());
  }, 60000);

  it('a worn one is taken off, in memory and in the save, whichever tab wrote it last', async () => {
    const cos = { f: { Leafy: { skin: 'sk_gold', hat: 'hat_party' }, Pin: { skin: 'sk_yoyle' }, Firey: { skin: 'sk_firey_mech' } }, trail: null, ko: null, pose: null, card: null, title: null };
    const save = await oldSave({ sk_gold: 200, sk_yoyle: 100, hat_party: 75, sk_firey_mech: 150 }, { cos });
    const w = await ready({ storage: { 'profile:v1': save } });
    await settle(w);
    expect(w.eval('wornCos("skin", "Leafy")')).toBe(null);
    expect(w.eval('wornCos("hat", "Leafy")'), 'her hat stays').toBe('hat_party');
    expect(w.eval('wornCos("skin", "Pin")')).toBe(null);
    expect(w.eval('wornCos("skin", "Firey")'), 'a skin that is not retired stays on').toBe('sk_firey_mech');
    const f = JSON.parse(w.localStorage.getItem('profile:v1')).cos.f;
    expect(f.Leafy).toEqual({ hat: 'hat_party' });
    expect(f.Pin).toEqual({});
    expect(f.Firey).toEqual({ skin: 'sk_firey_mech' });
    // another tab that still has one on and saves last does not put it back
    await w.eval(`(async function(){ PROFILE.cos.f.Leafy.skin = 'sk_gold'; await saveProfile(); })()`);
    expect(JSON.parse(w.localStorage.getItem('profile:v1')).cos.f.Leafy.skin).toBeUndefined();
    expect(w.eval('mergeCos({ f: { Pin: { skin: "sk_evil" } } }, { f: { Leafy: { skin: "sk_berry" } } }).f')).toEqual({ Pin: {}, Leafy: {} });
  }, 120000);

  it('two tabs loading the same old save pay it back once, however they save, and so does a stale tab that knows nothing of it', async () => {
    const save = await oldSave({ sk_gold: 200, sk_evil: 150 });   // 350 paid
    // Two tabs, both from the raw old save, each paying it back in its own memory (loading does), each saving
    const a = await ready({ storage: { 'profile:v1': save } }), b = await ready({ storage: { 'profile:v1': save } });
    await a.eval('profileReady');
    await settle(a); await settle(b);
    expect(a.eval('walletBalance()')).toBe(1000 - 350 + 350);
    expect(b.eval('walletBalance()')).toBe(1000 - 350 + 350);
    // they share one store in a browser; here the second's save lands on the first's
    b.localStorage.setItem('profile:v1', a.localStorage.getItem('profile:v1'));
    await b.eval('saveProfile()');
    const merged = JSON.parse(b.localStorage.getItem('profile:v1')).wallet;
    expect(merged.earned, 'two tabs paid it back; the save holds it once').toBe(1350);
    expect(merged.spent).toBe(350);
    // A stale tab -- the build before this one, or this one before it loaded -- still holds the raw wallet. Merging it in neither
    // loses the refund nor pays it twice, in either order.
    const rawOld = JSON.parse(save).wallet;
    const m1 = a.eval(`mergeWallet(${JSON.stringify(rawOld)}, ${JSON.stringify(merged)}, null, null)`);
    const m2 = a.eval(`mergeWallet(${JSON.stringify(merged)}, ${JSON.stringify(rawOld)}, null, null)`);
    for (const m of [m1, m2]) { expect(m.earned).toBe(1350); expect(m.spent).toBe(350); expect(m.owned.refunded_sk_gold).toBe(0); }
    // A tab running the build before this one keeps the marks whole (it keeps every id in `owned`) and never lowers `earned`: what it
    // writes back merges to the same thing
    const fromOldBuild = { earned: 1350, spent: 350, owned: { sk_gold: 200, sk_evil: 150, refunded_sk_gold: 0, refunded_sk_evil: 0 } };
    expect(a.eval(`mergeWallet(${JSON.stringify(fromOldBuild)}, ${JSON.stringify(rawOld)}, null, null)`).earned).toBe(1350);
    // and through the real save path, from a tab holding the raw old wallet in memory
    await a.eval(`(async function(){ PROFILE.wallet = ${JSON.stringify(rawOld)}; await saveProfile(); })()`);
    expect(JSON.parse(a.localStorage.getItem('profile:v1')).wallet.earned).toBe(1350);
    expect(a.eval('walletBalance()')).toBe(1000);
  }, 120000);

  it('are explained to a player who had some -- one line in the Store, nowhere else -- and to nobody else', async () => {
    const plain = await ready();
    plain.eval("go('store')");
    expect(plain.document.getElementById('storeNote').style.display, 'a player who had none sees nothing').toBe('none');
    expect(plain.document.getElementById('storeNote').textContent).toBe('');
    const w = await ready({ storage: { 'profile:v1': await oldSave({ sk_gold: 200, sk_yoyle: 100 }) } });
    await settle(w);
    w.eval("go('store')");
    const note = w.document.getElementById('storeNote');
    expect(note.style.display).toBe('');
    expect(note.textContent).toMatch(/Yoylestone, Win Token Gold were yours, so the 300 Win Tokens you paid for them are back in your wallet/);
    for (const id of ['title', 'quests', 'wardrobe']) {
      const el = w.document.getElementById(id);
      if (el) expect(el.textContent, id).not.toMatch(/old recolours/);
    }
  }, 60000);

  it('keep their places in the online code, so every skin keeps its position; a code for one dresses no one', async () => {
    const w = await ready();
    const r = w.eval(`(function(){
      var out = { first: cosNetCode({ skin: cosOfKind('skin')[0].id }), last: cosNetCode({ skin: cosOfKind('skin')[24].id }),
        old: ['1000', '2000', '3000', '4000', '5000', '6000', '7000'].map(function(c){ return cosNetDecode(c); }),
        firstReal: cosNetDecode('8000'), reserved: COS_NET_RESERVED, skins: cosOfKind('skin').length };
      return out; })()`);
    expect(r.first, 'Rockstar Poppy is the eighth place: the seven before it are spoken for').toBe('8000');
    expect(r.last, 'and the 25th skin the 32nd').toBe('w000');
    expect(r.old, 'what an older build sent for a wash dresses no one').toEqual(Array(7).fill(null));
    expect(r.firstReal).toEqual({ skin: 'sk_poppy_rock', hat: null, trail: null, ko: null });
    expect(r.skins, 'a skin for each fighter: more than one character holds').toBeGreaterThan(28);
  });
});

describe('online', () => {
  const wire = (w, role, players) => w.eval(`(function(){
    NET.role = ${JSON.stringify(role)}; NET.myId = 'me'; NET.room = 'QXTR';
    NET.sent = []; NET.ws = { readyState: 1, send: function(t){ NET.sent.push(JSON.parse(t)); }, close: function(){} };
    NET.players = ${JSON.stringify(players)}; NET.renderLobby(); return true; })()`);

  it('a look rides the join as four small ids, once, and reaches every screen', async () => {
    const w = await ready();
    w.eval(`walletEarn(5000); ['sk_firey_mech','hat_crown','tr_spark','ko_zap'].forEach(buyCosmetic);
      equipCos('skin','sk_firey_mech','Firey'); equipCos('hat','hat_crown','Firey'); equipCos('trail','tr_spark'); equipCos('ko','ko_zap');`);
    wire(w, 'client', [{ id: 'h', name: 'Leafy', isHost: true }, { id: 'me', name: 'Firey' }]);
    const hello = w.eval(`(function(){ NET.sent = []; NET.pickFighter('Firey'); return NET.sent; })()`);
    expect(hello).toHaveLength(1);
    expect(hello[0].t).toBe('hello');
    const [fighter, code] = hello[0].name.split('~');
    expect(fighter).toBe('Firey');
    expect(code).toMatch(/^[0-9a-z]{4}$/);
    // A look is its position in its kind, one character each, and those positions are the protocol: Mech Firey is the eleventh skin
    // (the seven old recolours hold the first seven places for ever), the crown the eighth hat, the sparkles the first trail,
    // Thunderclap the fifth KO effect.
    expect(code).toBe('b815');
    expect(w.eval(`cosNetDecode(${JSON.stringify(code)})`)).toEqual({ skin: 'sk_firey_mech', hat: 'hat_crown', trail: 'tr_spark', ko: 'ko_zap' });
    // The relay keeps 24 characters of a name: the longest fighter with a full code still fits.
    expect(w.eval(`Math.max.apply(null, ROSTER.filter(function(r){ return r.play; }).map(function(r){ return r.name.length; }))`) + 5).toBeLessThanOrEqual(24);
    // The lobby shows the fighter, never the code.
    w.eval(`NET.onMessage({ t: 'roster', players: [{ id: 'h', name: 'Leafy~1100', isHost: true }, { id: 'me', name: 'Firey~' + ${JSON.stringify(code)} }] })`);
    const roster = w.document.getElementById('lobbyRoster').textContent;
    expect(roster).toContain('Leafy'); expect(roster).toContain('Firey (you)'); expect(roster).not.toContain('~');

    // The host copies each player's code into the start; the client dresses each slot from it.
    const h = await ready();
    wire(h, 'host', [{ id: 'me', name: 'Leafy', isHost: true }, { id: 'b', name: 'Firey~' + code }, { id: 'c', name: 'Rocky' }]);
    const start = h.eval(`(function(){ NET.beginMatch = function(){}; SETTINGS.mode='ffa'; SETTINGS.count=3; NET.startAsHost();
      return NET.sent.filter(function(m){ return m.t==='start'; })[0]; })()`);
    expect(start.roster).toEqual(['Leafy', 'Firey', 'Rocky']);
    expect(start.cos).toEqual(['', code, '']);
    const c = w.eval(`(function(){ var s = startMatch; startMatch = function(){};
      // beginMatch(settings, roster, ids, cos): the seats (ids) come from the bug pass's fix for players leaving mid-match; the
      // looks (cos) ride after them.
      NET.beginMatch({ mode:'ffa', count:3, stocks:3 }, ['Leafy','Firey','Rocky'], ['h','me','c'], ${JSON.stringify(['0200', code, '0zzz'])});
      startMatch = s;
      return { host: cosOf({ idx: 0, you: false }), me: cosOf({ idx: 1, you: true, name: 'Firey' }), rocky: cosOf({ idx: 2, you: false }), ai: cosOf({ idx: 3, you: false }) }; })()`);
    expect(c.host).toEqual({ skin: null, hat: 'hat_top', trail: null, ko: null });
    expect(c.me.hat).toBe('hat_crown');
    expect(c.rocky, 'a code that is not in the catalogue dresses no one').toBe(null);
    expect(c.ai).toBe(null);
    // Nothing wearing nothing: a player with no looks sends exactly the hello they always did.
    const bare = await ready();
    wire(bare, 'client', [{ id: 'h', name: 'Leafy', isHost: true }, { id: 'me', name: 'Bubble' }]);
    expect(bare.eval(`(function(){ NET.sent = []; NET.pickFighter('Firey'); return NET.sent[0].name; })()`)).toBe('Firey');
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
      walletEarn(75);
      document.querySelector('#storeList .scell[data-id="hat_party"] button').click();
      var cell = document.querySelector('#storeList .scell[data-id="hat_party"]');
      var rich = { reply: document.getElementById('storeReply').textContent, owned: ownsCos('hat_party'), mark: cell.classList.contains('owned'), btn: cell.querySelector('button').textContent, bal: walletBalance() };
      cell.querySelector('button').click();   // Wear
      var worn = wornCos('hat', chosen.name);
      return { n: cells.length, total: COSMETICS.length, vaultSkins: COSMETICS.filter(function(c){ return c.fighter && VAULT_FIGHTERS.has(c.fighter); }).length, every: every, poor: poor, rich: rich, worn: worn,
               wallet: document.querySelector('#store .walletAmt').textContent, title: (go('title'), document.querySelector('#title .walletAmt').textContent) };
    })()`);
    // Every look but the skins of the Vault fighters (Marshmallow, Balloon, Lightbulb, Taco (II), Bow), who "can ONLY be opened by a code":
    // until a code opens one, the Store does not say that fighter exists (see the skins block).
    expect(r.vaultSkins).toBeGreaterThanOrEqual(3);
    expect(r.n).toBe(r.total - r.vaultSkins);
    expect(r.every, 'every price is in Win Tokens').toBe(true);
    expect(r.poor.owned).toBe(false);
    expect(r.poor.reply).toMatch(/need 75 more Win Tokens/);
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
      go('quests'); [].slice.call(document.querySelectorAll('#quests button')).forEach(function(b){ if (!/Back|Store/.test(b.textContent)) b.click(); });
      go('store'); document.querySelector('#storeList .scell[data-id="ti_contestant"] button').click();
      go('wardrobe'); [].slice.call(document.querySelectorAll('#wardrobe .wchip')).forEach(function(b){ b.click(); });
      var imgs = document.querySelectorAll('#store img, #quests img').length;
      go('title');
      return { calls: calls, added: document.querySelectorAll('script,iframe,link,img').length - nodes0 - document.querySelectorAll('#wardrobe img').length, imgs: imgs,
               paid: walletBalance() };
    })()`);
    expect(r.calls).toEqual([]);
    expect(r.imgs, 'the Store draws its previews; it fetches no pictures').toBe(0);
    expect(r.added).toBe(0);
    expect(r.paid).toBeGreaterThan(0);
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

  it('keeps every price in Win Tokens, and Win Tokens come only from quests (and a retired look\'s price paid back, once)', async () => {
    const w = await ready();
    expect(w.eval('COSMETICS.every(function(c){ return Number.isInteger(c.price) && c.price > 0 && Object.keys(c).indexOf("usd") < 0; })')).toBe(true);
    // The only caller that adds to the wallet: a finished quest paying itself (questPay), and walletEarn itself.
    const earners = SRC.split('\n').filter((l) => /walletEarn\(/.test(l) && !/function walletEarn/.test(l) && !/^\s*\/\//.test(l));
    expect(earners.map((l) => l.trim())).toEqual(['walletEarn(quest.reward);']);
    // The one other way the total rises is the owner's "Remove all seven": the price of a look taken out of the shop goes back onto
    // `earned` (walletNorm), once, for a look that was bought. Nothing else in the file adds to `earned`.
    const adds = CODE.split('\n').filter((l) => /\bearned \+= /.test(l)).map((l) => l.trim());
    expect(adds).toHaveLength(2);
    expect(adds.filter((l) => /^function walletEarn\(n\)/.test(l)), 'the quests\' own path').toHaveLength(1);
    expect(adds.filter((l) => /earned \+= owned\[id\]; owned\[mark\] = 0;/.test(l)), 'the refund of a retired look, which marks itself paid').toHaveLength(1);
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

// "I dont want to hook ppl tho." No streak, no limited-time item, no login bonus, no expiry, no countdown: nothing in the Win
// Tokens block asks anyone to come back. Grepped with the comments cut, so a comment may name what is not here.
describe('no hooks', () => {
  const between = (from, to) => {
    const a = SRC.indexOf(from), b = SRC.indexOf(to, a + 1);
    expect(a, from).toBeGreaterThan(-1); expect(b, to).toBeGreaterThan(a);
    return stripComments(SRC.slice(a, b));
  };
  const blocks = () => ({
    script: between('//  WIN TOKENS -- quests earn them', '// ---------- boot ----------'),
    screens: between('<!-- QUESTS, THE STORE AND THE WARDROBE', '<!-- MY STATS'),
    doors: between('<div class="shopdoor"', "<!-- The Vault's door"),
  });

  it('has no streak, limited-time item, login, bonus or expiry anywhere in the Win Tokens block', () => {
    for (const [name, block] of Object.entries(blocks())) {
      const lines = block.split('\n');
      // "Rainbow Streak" is a trail -- a streak of colour behind a fast fighter -- and the one such word in the catalogue.
      expect(lines.filter((l) => /\bstreaks?\b/i.test(l) && !/'Rainbow Streak'/.test(l)), `${name}: a streak`).toEqual([]);
      expect(lines.filter((l) => /\blimited\b/i.test(l)), `${name}: limited-time`).toEqual([]);
      expect(lines.filter((l) => /\bexpires?\s+in\b|\bexpir(y|ing|ation)\b/i.test(l)), `${name}: an expiry`).toEqual([]);
      expect(lines.filter((l) => /\blog-?in\b/i.test(l)), `${name}: a login`).toEqual([]);
      expect(lines.filter((l) => /\bbonus(es)?\b/i.test(l)), `${name}: a bonus`).toEqual([]);
    }
  });

  it('counts nothing down, and asks for no claim: the Quests screen tells, the result screen tells, and that is all', async () => {
    const { script } = blocks();
    expect(script).not.toMatch(/untilText|countdown|claimQuest|questsClaimable|hurry|last chance/i);
    const w = await ready();
    const r = w.eval(`(function(){
      SHOP_CLOCK = ${DAY}; questState().dp[questsFor('daily')[0].id] = 999; go('quests');
      var q = document.getElementById('quests');
      return { text: q.textContent, buttons: [].slice.call(q.querySelectorAll('button')).map(function(b){ return b.textContent.trim(); }),
               rows: [].slice.call(q.querySelectorAll('.quest')).length, paid: [].slice.call(q.querySelectorAll('.quest.paid .qreward')).map(function(e){ return e.textContent; }),
               bal: walletBalance() }; })()`);
    expect(r.rows, "the day's three and the week's three").toBe(6);
    expect(r.buttons, 'Back and the Store, and nothing to press for tokens').toEqual(['◀ Back', '🛍 Store']);
    expect(r.text).not.toMatch(/claim/i);
    expect(r.text, 'no clock running down to the next set').not.toMatch(/\bin \d+\s?(h|m|min|hours?|minutes?|days?)\b/i);
    expect(r.paid, 'the finished quest was paid on sight, and says so').toEqual(['Paid ✓']);
    expect(r.bal).toBe(w.eval(`questsFor('daily')[0].reward`));
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
    // No badge on the Quests door. One counted quests ready to claim; the owner -- "I dont want to hook ppl tho" -- said
    // "Remove it". A finished quest changes nothing on the title but the wallet's number.
    w.eval(`SHOP_CLOCK = ${DAY}; questState().dp[questsFor('daily')[0].id] = 999; go('title');`);
    expect(w.document.getElementById('questBadge')).toBe(null);
    expect(w.document.getElementById('questsBtn').children.length, 'a plain link').toBe(0);
    expect(w.document.getElementById('questsBtn').textContent.trim()).toBe('🏅 Quests');
    expect(SRC).not.toMatch(/qbadge|questBadge|questsClaimable/);
  });
});

// THE SECOND LOOK. What an adversarial read of the first build found, each pinned so it cannot come back: an empty badge
// that showed on every title screen, KO effects no online client ever saw, a jab (or a burn tick) scored as a landed
// smash, and a tab that loaded before another tab spent spending the same Win Tokens again.
describe('the second look', () => {
  it('the Quests door carries no badge at all, and the support link stays hidden in fact as well as in name', async () => {
    // The first build's badge counted claimable quests, and once showed as an empty pill on every title screen (its own
    // `display` beat the `hidden` attribute). Then the owner, asked about it: "Remove it" -- "I dont want to hook ppl tho".
    // So there is nothing left to hide: with a quest finished or without, the door is one text link.
    const w = await ready();
    expect(w.document.getElementById('questBadge')).toBe(null);
    expect(w.document.querySelectorAll('#shopDoor .qbadge, #shopDoor [hidden]').length).toBe(0);
    w.eval(`SHOP_CLOCK = ${DAY}; questState().dp[questsFor('daily')[0].id] = 999; go('title');`);
    expect(w.document.getElementById('questsBtn').children.length).toBe(0);
    // The support link, hidden by its attribute, stays hidden in fact as well as in name.
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
    await w.eval(`(async function(){ SHOP_CLOCK = ${DAY}; walletEarn(115); await saveProfile(); })()`);
    // The other tab, loaded from the same save, spends all 115 on the top hat and saves. This tab still holds 115 in memory.
    const other = JSON.parse(w.localStorage.getItem('profile:v1'));
    other.wallet.owned = { hat_top: 115 }; other.wallet.spent = 115;
    w.localStorage.setItem('profile:v1', JSON.stringify(other));
    const r = await w.eval(`(async function(){
      var mem = PROFILE.wallet.earned - PROFILE.wallet.spent;
      var buy = buyCosmetic('hat_halo');   // 115 too
      await saveProfile();
      var st = JSON.parse(localStorage.getItem('profile:v1')).wallet;
      return { mem: mem, buy: buy.ok ? 'bought' : buy.why, top: ownsCos('hat_top'), halo: ownsCos('hat_halo'), owed: st.spent - st.earned, bal: walletBalance() }; })()`);
    expect(r.mem, 'this tab had not seen the purchase').toBe(115);
    expect(r.buy, 'the same 115 tokens are not spent twice').toBe('tokens');
    expect(r.halo).toBe(false);
    expect(r.top, 'the other tab\'s look is this tab\'s too').toBe(true);
    expect(r.owed, 'the wallet never owes').toBeLessThanOrEqual(0);
    expect(r.bal).toBe(0);
    // A quest paid in the other tab shows up here without a reload: the balance, the Store, and the quest as paid.
    w.eval(`go('store')`);
    const o2 = JSON.parse(w.localStorage.getItem('profile:v1'));
    const q = w.eval(`(function(){ var q = questsFor('daily')[0]; return { id: q.id, reward: q.reward, key: 'd' + dailySeed(shopNow()) + ':' + q.id }; })()`);
    o2.wallet.earned += q.reward;
    o2.quests = Object.assign({}, o2.quests, { claims: Object.assign({}, (o2.quests || {}).claims, { [q.key]: q.reward }) });
    w.localStorage.setItem('profile:v1', JSON.stringify(o2));
    w.dispatchEvent(new w.StorageEvent('storage', { key: 'profile:v1', newValue: JSON.stringify(o2) }));
    expect(w.document.querySelector('#store .walletAmt').textContent).toBe(String(q.reward));
    expect(w.document.querySelector('#title .walletAmt').textContent).toBe(String(q.reward));
    // This tab now finishes the same quest itself: the other tab's payout is on the ledger, so it pays nothing again.
    const same = w.eval(`(function(){ var q = questsFor('daily')[0], moved = questAdd(q.goal, q.n), row = questRows('daily')[0];
      return { moved: moved, done: row.done, paid: row.paid, bal: walletBalance() }; })()`);
    expect(same.moved, 'the progress counted').toBeGreaterThanOrEqual(1);
    expect(same).toMatchObject({ done: true, paid: true });
    expect(same.bal, 'and paid once').toBe(q.reward);
  });
});
