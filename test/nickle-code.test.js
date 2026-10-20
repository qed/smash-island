import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from './helpers/prng.js';

// THE JOKE CODE. The owner (2026-10-20): "add a joke code: NickLe, which will give you all of the skins". Typed in the Vault, it
// hands over every skin in the catalogue for free and answers in Nickel (II)'s dry voice about the misspelling. Pinned here: it
// gives skins and nothing else, never touches the Win Token balance, never turns into tokens (a free look is owned at a price paid
// of 0, so neither a retired look's payback nor a two-tab merge can make anything of it), lasts across a reload and another tab,
// is not one of the Vault's codes to find (no cell, no clue, no say in the "You haven't found every code yet." line), and a look
// for a fighter that is still hidden stays out of the Store and the Wardrobe.

const HTML = readFileSync('artifacts/V1/index.html', 'utf8');
function boot({ seed = {} } = {}) {
  const dom = new JSDOM(HTML, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
        get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 })
          : p === 'canvas' ? { width: 1100, height: 720 }
          : p === 'getImageData' ? () => ({ data: [] }) : () => {}),
        set: () => true,
      });
      window.Math.random = mulberry32(13);
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
      for (const [k, v] of Object.entries(seed)) window.localStorage.setItem(k, v);
    },
  });
  return dom.window;
}
const ready = async (opts) => { const w = boot(opts); await w.eval('profileReady'); return w; };
const J = JSON.stringify;
const REPLY = "★ Every skin. Wow. Thrilling. (It's spelled Nickel.)";
const AGAIN = '✓ You already have every skin. Still spelled Nickel.';
const skinIds = (w) => w.eval(`cosOfKind('skin').map(function(c){ return c.id; })`);
const wallet = (w) => w.eval('JSON.parse(JSON.stringify(walletState()))');

describe('the NickLe joke code', () => {
  it('gives every skin, free, and nothing else: the balance and the looks already bought are untouched', async () => {
    const w = await ready();
    // A player with tokens, a bought hat and a bought skin.
    w.eval(`walletEarn(400); buyCosmetic('hat_party'); buyCosmetic('sk_poppy_rock');`);
    const before = wallet(w), bal = w.eval('walletBalance()');
    expect(before.owned).toEqual({ hat_party: 75, sk_poppy_rock: 150 });
    const res = w.eval(`vaultSubmit('NickLe')`);
    expect(res).toEqual({ kind: 'skins', skins: skinIds(w).length - 1, reply: REPLY });
    const after = wallet(w);
    const skins = skinIds(w);
    expect(skins.length, 'the catalogue has its skins').toBeGreaterThan(100);
    // Every skin owned; the one bought keeps its price, every other is owned at 0 (a price paid of nothing).
    for (const id of skins) expect(after.owned[id], id).toBe(id === 'sk_poppy_rock' ? 150 : 0);
    // Nothing that is not a skin: the owned set is exactly the skins plus the hat that was bought.
    expect(Object.keys(after.owned).sort()).toEqual([...skins, 'hat_party'].sort());
    expect(w.eval(`COSMETICS.filter(function(c){ return c.kind !== 'skin' && ownsCos(c.id); }).map(function(c){ return c.id; })`)).toEqual(['hat_party']);
    // Tokens untouched.
    expect(after.earned).toBe(before.earned);
    expect(after.spent).toBe(before.spent);
    expect(w.eval('walletBalance()')).toBe(bal);
    // Saved, so it lasts.
    await w.eval('saveProfile()');
    const stored = JSON.parse(w.localStorage.getItem('profile:v1'));
    for (const id of skins) expect(stored.wallet.owned[id], id).toBe(id === 'sk_poppy_rock' ? 150 : 0);
    expect(stored.wallet.earned).toBe(before.earned);
    expect(stored.wallet.spent).toBe(before.spent);
    // And a skin is wearable now, by the Wardrobe's own rule.
    expect(w.eval(`equipCos('skin', 'sk_pin_robot', 'Pin')`)).toBe(true);
  });

  it('takes any case and spacing, and a second time says so while quietly handing over a skin added since', async () => {
    const w = await ready();
    expect(w.eval(`vaultSubmit('nickle')`).kind).toBe('skins');
    for (const s of ['NickLe', 'NICKLE', 'NICK LE', 'Nick-Le', '  nick le! ', 'n i c k l e']) {
      expect(w.eval(`vaultSubmit(${J(s)})`), s).toEqual({ kind: 'again', skins: 0, reply: AGAIN });
    }
    // A skin added to the catalogue after the code was used: the next entry still says "already", and the new one is owned too.
    const bal = w.eval('walletBalance()');
    w.eval(`COSMETICS.push({ id:'sk_zz_added', kind:'skin', fighter:'Pin', name:'Added Later Pin', price:99 }); COS_BY_ID.sk_zz_added = COSMETICS[COSMETICS.length-1];`);
    expect(w.eval(`ownsCos('sk_zz_added')`)).toBe(false);
    expect(w.eval(`vaultSubmit('Nick Le')`)).toEqual({ kind: 'again', skins: 1, reply: AGAIN });
    expect(w.eval(`PROFILE.wallet.owned.sk_zz_added`)).toBe(0);
    expect(w.eval('walletBalance()')).toBe(bal);
    // Through the box and the Enter button: the reply line says it and the box is cleared.
    const w2 = await ready();
    w2.eval('openVault()');
    const box = w2.document.getElementById('vaultCode');
    box.value = 'NickLe';
    w2.document.getElementById('vaultEnterBtn').click();
    expect(w2.document.getElementById('vaultReply').textContent).toBe(REPLY);
    expect(box.value).toBe('');
    box.value = 'nickle';
    w2.document.getElementById('vaultEnterBtn').click();
    expect(w2.document.getElementById('vaultReply').textContent).toBe(AGAIN);
    // Each reply is one line and names nobody hidden.
    const hidden = w2.eval('PRIZE_NAMES');
    for (const t of [REPLY, AGAIN]) {
      expect(t).not.toMatch(/\n/);
      for (const n of hidden) expect(t.includes(n), n).toBe(false);
    }
  });

  it('is no other code: none of the Vault\'s spellings, none of the second secret\'s, not his skip', async () => {
    const w = await ready();
    const r = w.eval(`(function(){ var k = vaultNorm('NickLe');
      var hit = function(list){ return list.some(function(v){ return [v.code].concat(v.accepts||[]).some(function(s){ return vaultNorm(s) === k; }); }); };
      return { k: k, vault: VAULT_CODES.has(k), cobs: COBS_CODES.has(k), skip: k === COBS_SKIP,
               anyVault: hit(VAULT.fighters.concat(VAULT.hints)), anyCobs: hit(COBS_VAULT.steps) }; })()`);
    expect(r).toEqual({ k: 'nickle', vault: false, cobs: false, skip: false, anyVault: false, anyCobs: false });
    // While the second secret's chain is live a wrong guess is "Tick, tock.", but the joke code still answers as itself.
    w.eval(`PROFILE.cobs.stage = COBS_STAGE.LIVE`);
    expect(w.eval('cobsChainLive()')).toBe(true);
    expect(w.eval(`vaultSubmit('nope').reply`)).not.toBe(REPLY);
    expect(w.eval(`vaultSubmit('NickLe').reply`)).toBe(REPLY);
  });

  it('lasts through a reload and another tab, and is never paid back as tokens', async () => {
    const w = await ready();
    w.eval(`walletEarn(200); buyCosmetic('hat_party');`);
    await w.eval('saveProfile()');
    const stale = JSON.parse(w.localStorage.getItem('profile:v1'));   // a second tab, loaded before the code was typed
    w.eval(`vaultSubmit('NickLe')`);
    await w.eval('saveProfile()');
    const before = wallet(w), skins = skinIds(w);
    const saved = w.localStorage.getItem('profile:v1');
    // Reload: every skin still owned, the balance what it was (no retired-look payback, no merge, nothing).
    const w2 = await ready({ seed: { 'profile:v1': saved } });
    const re = wallet(w2);
    for (const id of skins) expect(re.owned[id], id).toBe(0);
    expect(re.earned).toBe(before.earned);
    expect(re.spent).toBe(before.spent);
    expect(w2.eval('walletBalance()')).toBe(125);
    expect(w2.eval(`vaultSubmit('nickle').kind`), 'the save remembers it was entered').toBe('again');
    // The stale tab's save merged with this one, both ways round: the skins stay owned, and spent and earned do not move.
    for (const [a, b] of [[stale, JSON.parse(saved)], [JSON.parse(saved), stale]]) {
      const m = w2.eval(`mergeProfiles(${J(a)}, ${J(b)})`);
      for (const id of skins) expect(m.wallet.owned[id], id).toBe(0);
      expect(m.wallet.owned.hat_party).toBe(75);
      expect(m.wallet.earned).toBe(before.earned);
      expect(m.wallet.spent).toBe(before.spent);
      expect(m.vault.nickle).toBe(true);
      expect(m.vault.found).toEqual([]);
    }
    // The stale tab hears the other save (the 'storage' event): it owns every skin now, its balance unchanged.
    const w3 = await ready({ seed: { 'profile:v1': J(stale) } });
    w3.dispatchEvent(new w3.StorageEvent('storage', { key: 'profile:v1', newValue: saved }));
    expect(w3.eval(`cosOfKind('skin').every(function(c){ return ownsCos(c.id); })`)).toBe(true);
    expect(w3.eval('walletBalance()')).toBe(125);
    // A free skin later retired is paid back what was paid for it: nothing.
    const sweep = w2.eval(`(function(){ var id = 'sk_pin_robot'; COS_RETIRED[id] = 'Robot Pin';
      var n = walletNorm(PROFILE.wallet); delete COS_RETIRED[id]; return { earned: n.earned, mark: n.owned['refunded_' + id] }; })()`);
    expect(sweep).toEqual({ earned: before.earned, mark: 0 });
  });

  it('leaves the Vault as it was: no code found, no cell, no clue, and the "not every code" line unchanged', async () => {
    const w = await ready();
    w.eval('openVault()');
    const look = () => w.eval(`(function(){ buildVault(); var m = document.getElementById('vaultMissing');
      return { miss: m.hidden ? null : m.textContent, found: vaultState().found.slice(),
               cells: document.getElementById('vaultFighters').innerHTML, open: document.querySelectorAll('#vaultFighters .vcell.open').length,
               hints: document.querySelectorAll('#vaultHints .vhint').length, wire: document.querySelectorAll('#vaultWire .vhint').length,
               cluesHead: document.getElementById('vaultCluesHead').hidden }; })()`);
    const start = look();
    expect(start.miss).toBe("You haven't found every code yet.");
    w.eval(`vaultSubmit('NickLe')`);
    expect(look()).toEqual(start);
    // Every real code in (the Vault's fifteen, then the second secret's four by hand): the line goes, and the joke code neither
    // brings it back nor adds to what was found.
    w.eval(`for (const v of VAULT.fighters.concat(VAULT.hints)) vaultSubmit(v.code);
      vaultState().found.push.apply(vaultState().found, COBS_VAULT.steps.map(function(s){ return s.code; }));`);
    const all = look();
    expect(all.miss).toBe(null);
    w.eval(`vaultSubmit('nick le')`);
    expect(look()).toEqual(all);
    expect(all.found.some((c) => /nick/i.test(c))).toBe(false);
  });

  it('a skin for a fighter still hidden stays out of the Store and the Wardrobe until that fighter is out', async () => {
    const w = await ready();
    w.eval(`vaultSubmit('NickLe')`);
    const storeIds = () => w.eval(`(function(){ buildStore(); return Array.prototype.map.call(document.querySelectorAll('#storeList .scell'), function(c){ return c.dataset.id; }); })()`);
    const wardNames = () => w.eval(`(function(){ buildWardrobe(); return Array.prototype.map.call(document.querySelectorAll('#wardFighter option'), function(o){ return o.value; }); })()`);
    // A Vault fighter's skin (Needle's): owned now, but neither listed nor wearable while Needle is shut.
    expect(w.eval(`ownsCos('sk_needle_alien')`)).toBe(true);
    expect(storeIds()).not.toContain('sk_needle_alien');
    expect(wardNames()).not.toContain('Needle');
    w.eval(`vaultSubmit("Don't call me Needy!")`);
    expect(storeIds()).toContain('sk_needle_alien');
    expect(wardNames()).toContain('Needle');
    // Steve Cobs's prize fighters, before he is beaten: no skin of theirs is listed, and neither screen shows their names.
    expect(w.eval('cobsBeaten()')).toBe(false);
    const prize = w.eval('PRIZE_NAMES');
    const ids = storeIds(), names = wardNames();
    const prizeSkins = w.eval(`cosOfKind('skin').filter(function(c){ return PRIZE_NAMES.indexOf(c.fighter) >= 0; }).map(function(c){ return c.id; })`);
    for (const id of prizeSkins) expect(ids, id).not.toContain(id);
    const text = w.document.getElementById('store').textContent + ' ' + w.document.getElementById('wardrobe').textContent;
    for (const n of prize) {
      expect(names, n).not.toContain(n);
      expect(new RegExp('\\b' + n + '\\b').test(text), n).toBe(false);
    }
  });
});
