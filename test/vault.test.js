import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from './helpers/prng.js';

// THE VAULT. "Add a vault to unlock certain characters. if you do certain codes, you will find hints on how to fight
// One." The owner's answers: "Vault-only fighters"; the codes are "Just knowledge(like a code could be 2763, YOYLE
// CAKE, or Wal-mart)"; the hints give away "How to unlock one." Then: "Yoyle cake should be for bubble. Wal-mart is
// for marshmallow." And then: "add more dlc codes. you dont need the last 3 codes for One. for step 3, it should be
// last one standing, and for 4, it should be all for One." Nothing here may put a banner on screen: "remove all text
// for smashes and specials." and "remove item popups."

// A real origin, so localStorage exists and saves are exercised (same boot as profile-store.test.js).
function boot({ seed = {}, breakStorage = false } = {}) {
  const html = readFileSync('artifacts/V1/index.html', 'utf8');
  const dom = new JSDOM(html, {
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
      if (breakStorage) {
        Object.defineProperty(window, 'localStorage', {
          configurable: true,
          get() { throw new DOMException('denied', 'SecurityError'); },
        });
      }
    },
  });
  return dom.window;
}
const settle = (w) => w.eval('profileReady');
const J = JSON.stringify;

// The owner's codes, pinned here by hand rather than read back out of the game, each with every spelling it must take.
const FIGHTER_CODES = {
  Needle: ["DON'T CALL ME NEEDY", "Don't call me Needy!", 'DONT CALL ME NEEDY', 'DO NOT CALL ME NEEDY', 'dontcallmeneedy', 'don’t call me needy'],
  Gelatin: ['OH MY COLLAGEN', 'Oh, my collagen!', 'OHMYCOLLAGEN', 'Oh my collagen'],
  Fanny: ['I HATE YOU', 'I hate you!', 'IHATEYOU', 'I HATE U'],
  Pillow: ['2763', '2,763', '2 763', 'two thousand seven hundred sixty-three', 'two thousand, seven hundred and sixty-three'],
  Toothpaste: ["YOU'RE MY ENEMY NOW", "You're my ENEMY now!", 'YOURE MY ENEMY NOW', 'YOU ARE MY ENEMY NOW', 'UR MY ENEMY NOW'],
  Bubble: ['YOYLE CAKE', 'YOYLECAKE', 'Yoylecake!', 'Yoyle-cake', 'yoyle cake'],
  Marshmallow: ['WAL-MART', 'Wal-Mart', 'Walmart', 'WALMART', 'Wall-Mart', 'Wall Mart', 'Wallmart', 'Wal Mart'],
  Balloon: ["OH C'MON", "Oh, c'mon!", 'OH CMON', 'Oh, come on!', 'OH COME ON'],
  Lightbulb: ['OMGA', 'OMGA!', 'OMGAH', 'OMGAH!'],
  'Taco (II)': ['SOUR CREAM', 'SOUR CREAM!', 'SOURCREAM', 'Sour-cream', 'MAERC RUOS'],
  Pickle: ["OKAY, LET'S DO THIS", "Okay, let's do this!", 'OKAY LETS DO THIS', 'OK LETS DO THIS', "OK, let's do this!"],
  Bow: ['BUY A CHAIR', 'Buy a chair!', 'BUYACHAIR', 'buy-a-chair'],
  Microphone: ["I'M NOT THAT LOUD", "I'M NOT THAT LOUD!!!!!!!", 'IM NOT THAT LOUD', 'I AM NOT THAT LOUD'],
};
const VAULT_DLC = ['Marshmallow', 'Balloon', 'Lightbulb', 'Taco (II)', 'Pickle', 'Bow', 'Microphone'];
const HINT_CODES = {
  1: ['SO TO CLARIFY', 'So, to clarify...', 'SOTOCLARIFY', 'So to clarify?'],
  2: ['BRAKE AT FLAKE', "It's time for Brake at Flake!", 'BRAKEATFLAKE', 'ITS TIME FOR BRAKE AT FLAKE'],
  3: ['LAST ONE STANDING', 'Last 1 Standing', 'LASTONESTANDING', 'The Last One Standing'],
  4: ['ALL FOR ONE', 'All 4 One', 'ALLFORONE', 'All For 1'],
};
const WRONG = "Aw, seriously? That code doesn't do anything.";
const norm = (s) => s.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]/g, '');

describe('the Vault: codes', () => {
  it('ignores case, spaces and punctuation, a phone\'s curly apostrophe included', async () => {
    const w = boot(); await settle(w);
    expect(w.eval(`vaultNorm("Don't call me Needy!")`)).toBe('dontcallmeneedy');
    expect(w.eval(`vaultNorm("  wal-MART ")`)).toBe('walmart');
    expect(w.eval(`vaultNorm("DON’T CALL ME NEEDY")`)).toBe('dontcallmeneedy');
    expect(w.eval(`vaultNorm("2,763")`)).toBe('2763');
    expect(w.eval(`vaultNorm(null)`)).toBe('');
  });

  it('every spelling of every code finds its fighter or clue, by exact match and never inside a longer guess', async () => {
    const w = boot(); await settle(w);
    const find = (s) => w.eval(`(function(){ var v = VAULT_CODES.get(vaultNorm(${J(s)})); return v ? (v.step != null ? 'step' + v.step : v.name) : null; })()`);
    for (const [name, spellings] of Object.entries(FIGHTER_CODES)) for (const s of spellings) expect(find(s), s).toBe(name);
    for (const [step, spellings] of Object.entries(HINT_CODES)) for (const s of spellings) expect(find(s), s).toBe('step' + step);
    for (const s of ['yoyle', 'omgaomga', 'x yoyle cake', 'walmarts', 'sour', 'all for', 'ONE']) expect(find(s), s).toBe(null);
  });

  it('every normalised code is distinct, none is a fighter\'s name, and nobody from the OSC is in any of it', async () => {
    const w = boot(); await settle(w);
    const keys = new Map();
    const all = [...Object.entries(FIGHTER_CODES), ...Object.entries(HINT_CODES).map(([k, v]) => ['step' + k, v])];
    for (const [who, spellings] of all) {
      for (const k of new Set(spellings.map(norm))) {
        expect(keys.has(k), `${k} belongs to ${keys.get(k)} and ${who}`).toBe(false);
        keys.set(k, who);
      }
    }
    expect(w.eval('VAULT_CODES.size'), 'the game holds exactly these spellings, no more').toBe(keys.size);
    const names = w.eval('ROSTER.map(function(r){ return vaultNorm(r.name); })');
    expect([...keys.keys()].filter((k) => names.includes(k))).toEqual([]);
    expect(w.eval('JSON.stringify(VAULT)')).not.toMatch(/\bOJ\b|Suitcase|Cabby/);
  });

  it('every fighter code opens its fighter for good, and a second time says it was already found', async () => {
    const w = boot(); await settle(w);
    for (const [name, spellings] of Object.entries(FIGHTER_CODES)) {
      const typed = spellings[spellings.length - 1];   // not the headline spelling, so the alternates do the work
      const r = w.eval(`(function(){
        var R = ROSTER.find(function(x){ return x.name===${J(name)}; });
        var before = isUnlocked(R), res = vaultSubmit(${J(typed)}), again = vaultSubmit(${J(spellings[0])});
        return { before: before, res: res, after: isUnlocked(R), inProfile: PROFILE.unlocked.indexOf(${J(name)})>=0, again: again };
      })()`);
      expect(r.before, `${name} is shut on a fresh save`).toBe(false);
      expect(r.res.kind).toBe('fighter');
      expect(r.res.name).toBe(name);
      expect(r.res.fresh).toBe(true);
      expect(r.res.reply).toContain(name);
      expect(r.after && r.inProfile, `${name} opened into PROFILE.unlocked`).toBe(true);
      expect(r.again.kind).toBe('again');
      expect(r.again.reply).toMatch(/already found/);
    }
  });

  it('the four clues are steps 1 to 4 of how One is unlocked, and there is no code for 5, 6 or 7', async () => {
    const w = boot(); await settle(w);
    expect(w.eval('VAULT.hints.map(function(h){ return h.step; })')).toEqual([1, 2, 3, 4]);
    const got = {};
    for (const step of [1, 2, 3, 4]) {
      const r = w.eval(`vaultSubmit(${J(HINT_CODES[step][1])})`);
      expect(r.kind).toBe('hint');
      expect(r.step).toBe(step);
      got[step] = r.text;
    }
    // What the chain actually asks for, in plain words.
    expect(got[1]).toMatch(/^ONE - STEP 1 OF 7: LIGHTNING'S RECORD\./);
    expect(got[1]).toContain('at least 20 matches as Lightning');
    expect(got[1]).toContain('MORE than 70%');
    expect(got[1]).toContain('15 wins out of 20 opens it; 14 out of 20 does not');
    expect(got[1]).toContain('FFA, Teams, the Daily and net-host matches all count');
    expect(got[2]).toMatch(/^ONE - STEP 2 OF 7: BOSS RUSH\./);
    expect(got[2]).toContain('loop 2');
    expect(got[2]).toContain('Four has to fall while your Lightning is still standing');
    expect(got[3]).toMatch(/^ONE - STEP 3 OF 7: THE ERASURES\./);
    expect(got[3]).toContain('every WIN erases ONE fighter');
    expect(got[3]).toContain('Gaty, then Barf Bag, then Basketball, then your most-played fighters');
    expect(got[3]).toContain('until only Lightning is left');
    expect(got[3]).toContain('the Daily Match puts you on Lightning');
    expect(got[4]).toMatch(/^ONE - STEP 4 OF 7: THE WORLD CUP\./);
    expect(got[4]).toContain('Win the World Cup as Lightning');
    expect(got[4]).toContain('there is no code for them');
    // "you dont need the last 3 codes for One": the dropped codes do nothing.
    for (const s of ['HEY GUYS', 'Hey guys!', 'DOWN TO MAKE A DEAL', 'THE MOON', 'ONE', 'Needle', 'yoyle', '1234', 'walmartt']) {
      const r = w.eval(`vaultSubmit(${J(s)})`);
      expect(r.kind, s).toBe('wrong');
      expect(r.reply).toBe(WRONG);
    }
    expect(w.eval('vaultSubmit("   ").kind')).toBe('empty');
    expect(w.eval('PROFILE.vault.found.slice().sort()')).toEqual(['ALL FOR ONE', 'BRAKE AT FLAKE', 'LAST ONE STANDING', 'SO TO CLARIFY']);
  });
});

describe('the Vault: the unlock model', () => {
  it('Bubble has left the starters, and a fresh save still boots on a starter with 7 open cells', async () => {
    const w = boot(); await settle(w);
    expect(w.eval('STARTERS')).toEqual(['Firey', 'Leafy', 'Pencil', 'Blocky', 'Ice Cube', 'Match', 'Pen']);
    expect(w.eval('isUnlocked(ROSTER.find(function(r){ return r.name==="Bubble"; }))')).toBe(false);
    w.eval('buildBoard()');
    const cells = [...w.document.querySelectorAll('#board .cell')].filter((c) => !c.classList.contains('rostertoggle'));
    expect(cells.map((c) => c.textContent).sort()).toEqual(['Blocky', 'Firey', 'Ice Cube', 'Leafy', 'Match', 'Pen', 'Pencil']);
    expect(cells.filter((c) => c.classList.contains('locked')).length).toBe(0);
    // The default pick and How to Play's pick are both Firey, a starter.
    expect(w.eval('chosen.name')).toBe('Firey');
    expect(w.eval('isUnlocked(chosen)')).toBe(true);
  });

  it('Vault fighters are off the drip: no amount of playing, and no trophy, grants one; Cake is back on it', async () => {
    const w = boot(); await settle(w);
    const r = w.eval(`(function(){
      var vaultOnDrip = DRIP_ORDER.filter(function(n){ return VAULT_FIGHTERS.has(n); });
      PROFILE.matches = 999; syncUnlocks();
      Object.keys(TROPHIES).forEach(function(k){ awardTrophy(k); });
      return { vaultOnDrip: vaultOnDrip, cake: DRIP_ORDER.indexOf('Cake'), bubbleInOrder: UNLOCK_ORDER.indexOf('Bubble'),
               allDrip: DRIP_ORDER.every(function(n){ return PROFILE.unlocked.indexOf(n)>=0; }),
               granted: Array.from(VAULT_FIGHTERS).filter(function(n){ return PROFILE.unlocked.indexOf(n)>=0; }) };
    })()`);
    expect(r.vaultOnDrip).toEqual([]);
    expect(r.cake, 'Cake lost YOYLE CAKE and is on the normal drip').toBeGreaterThanOrEqual(0);
    expect(r.bubbleInOrder, 'Bubble is a non-starter now').toBeGreaterThanOrEqual(0);
    expect(r.allDrip).toBe(true);
    expect(r.granted).toEqual([]);
  });

  it('a locked Vault fighter\'s cell says it is in the Vault, and never gives the code away', async () => {
    const w = boot(); await settle(w);
    for (const [name, spellings] of Object.entries(FIGHTER_CODES)) {
      const hint = w.eval(`unlockHint(${J(name)})`);
      expect(hint, name).toMatch(/Vault/);
      for (const s of spellings) expect(norm(hint)).not.toContain(norm(s));
    }
    w.eval('PROFILE.viewMode="unlocked"; buildBoard();');
    const bubble = [...w.document.querySelectorAll('#board .cell')].find((c) => c.textContent === 'Bubble');
    expect(bubble.classList.contains('locked')).toBe(true);
    expect(bubble.title).toMatch(/Vault/);
    bubble.onclick();
    expect(w.document.getElementById('lockNote').textContent).toMatch(/Bubble — Found in the Vault/);
  });

  it('the "everything" view shows every fighter but opens no Vault fighter; its escape hatch still works for the rest', async () => {
    const w = boot(); await settle(w);
    w.eval('setViewMode("everything")');
    const cells = [...w.document.querySelectorAll('#board .cell')].filter((c) => !c.classList.contains('rostertoggle'));
    expect(cells.length).toBe(w.eval('ROSTER.length'));
    for (const name of Object.keys(FIGHTER_CODES)) {
      const c = cells.find((x) => x.textContent === name);
      expect(c.classList.contains('locked'), name).toBe(true);
    }
    expect(w.eval('isUnlocked(ROSTER.find(function(r){ return r.name===DRIP_ORDER[30]; }))')).toBe(true);
  });

  it('a save that already has Bubble or a Vault DLC fighter keeps them', async () => {
    const prior = { version: 1, matches: 3, wins: 1, kos: 2, bossesCleared: {}, bestRushLoop: 0, wcTitles: 0,
      unlocked: ['Firey', 'Leafy', 'Bubble', 'Pencil', 'Blocky', 'Ice Cube', 'Match', 'Pen', 'Marshmallow'], viewMode: 'starters', migratedFrom: null };
    const w = boot({ seed: { 'profile:v1': J(prior) } }); await settle(w);
    expect(w.eval('isUnlocked(ROSTER.find(function(r){ return r.name==="Bubble"; }))')).toBe(true);
    expect(w.eval('isUnlocked(ROSTER.find(function(r){ return r.name==="Marshmallow"; }))')).toBe(true);
    expect(w.eval('PROFILE.vault.found')).toEqual([]);   // an old save gains the field, empty
    w.eval('openVault()');
    const open = [...w.document.querySelectorAll('#vaultFighters .vcell.open')].map((c) => c.textContent);
    expect(open.sort()).toEqual(['Bubble', 'Marshmallow']);
    // Typing her code now is still right, and says she was already there.
    const r = w.eval('vaultSubmit("yoyle cake")');
    expect(r.kind).toBe('fighter');
    expect(r.fresh).toBe(false);
    expect(r.reply).toMatch(/already yours/);
  });

  it('with no storage everything is still open, Vault fighters too, and the Vault still takes codes', async () => {
    const w = boot({ breakStorage: true }); await settle(w);
    expect(w.eval('PROFILE_STORAGE_OK')).toBe(false);
    expect(w.eval('Array.from(VAULT_FIGHTERS).every(function(n){ return isUnlocked(ROSTER.find(function(r){ return r.name===n; })); })')).toBe(true);
    expect(w.eval('vaultSubmit("so to clarify").kind')).toBe('hint');
    expect(w.eval('vaultFound("SO TO CLARIFY")')).toBe(true);
  });

  it('the Daily still starts on a fresh save when its fighter is in the Vault, and grants nothing', async () => {
    // The pairing is the same for everyone, so it is left alone: it lends the day's fighter for one match, as it
    // already did with a fighter still on the drip.
    const w = boot(); await settle(w);
    const r = w.eval(`(function(){
      var s = 20260101, m = null;
      for (var i = 0; i < 4000; i++){ m = dailyMatchup(s + i); if (VAULT_FIGHTERS.has(m.you.name)) { s = s + i; break; } }
      dailySeed = function(){ return s; };
      loop = function(){};   // the match is built, not played: this canvas stub cannot draw a frame
      startDailyMatch();
      var you = fighters.find(function(f){ return f.you; });
      running = false;
      return { day: m.you.name, you: you && you.name, n: fighters.length, open: PROFILE.unlocked.indexOf(m.you.name)>=0 };
    })()`);
    expect(r.you).toBe(r.day);
    expect(r.n).toBe(2);
    expect(r.open).toBe(false);
  });
});

describe('the Vault: saving', () => {
  it('found codes and Vault unlocks survive a reload', async () => {
    const w = boot(); await settle(w);
    await w.eval('(async()=>{ vaultSubmit("YOYLE CAKE"); vaultSubmit("all for one"); await saveProfile(); })()');
    const stored = JSON.parse(w.localStorage.getItem('profile:v1'));
    expect(stored.unlocked).toContain('Bubble');
    expect(stored.vault.found.sort()).toEqual(['ALL FOR ONE', 'YOYLE CAKE']);

    const w2 = boot({ seed: { 'profile:v1': J(stored) } }); await settle(w2);
    expect(w2.eval('isUnlocked(ROSTER.find(function(r){ return r.name==="Bubble"; }))')).toBe(true);
    expect(w2.eval('vaultFound("YOYLE CAKE") && vaultFound("ALL FOR ONE")')).toBe(true);
    w2.eval('openVault()');
    expect([...w2.document.querySelectorAll('#vaultFighters .vcell.open')].map((c) => c.textContent)).toEqual(['Bubble']);
    expect(w2.document.querySelectorAll('#vaultHints .vhint')[3].textContent).toContain('THE WORLD CUP');
    expect(w2.eval('vaultSubmit("yoylecake").kind')).toBe('again');
  });

  it('a code found in another tab survives this tab\'s save: found codes merge by union, like unlocks', async () => {
    const w = boot(); await settle(w);
    await w.eval('(async()=>{ vaultSubmit("SO TO CLARIFY"); await saveProfile(); })()');
    // A second tab, hydrated earlier, has just found two codes of its own.
    const other = JSON.parse(w.localStorage.getItem('profile:v1'));
    other.vault = { found: [...other.vault.found, 'WAL-MART', 'LAST ONE STANDING'] };
    other.unlocked = [...other.unlocked, 'Marshmallow'];
    w.localStorage.setItem('profile:v1', J(other));
    // This tab saves again from its own stale copy.
    await w.eval('(async()=>{ vaultSubmit("OMGA"); await saveProfile(); })()');
    const final = JSON.parse(w.localStorage.getItem('profile:v1'));
    expect(final.vault.found.sort()).toEqual(['LAST ONE STANDING', 'OMGA', 'SO TO CLARIFY', 'WAL-MART']);
    expect(final.unlocked).toContain('Marshmallow');
    expect(final.unlocked).toContain('Lightbulb');
    // And the merge copes with a save that has no Vault record, or a broken one.
    expect(w.eval('mergeProfiles({ unlocked:[] }, { unlocked:[], vault:{ found:["OMGA"] } }).vault.found')).toEqual(['OMGA']);
    expect(w.eval('mergeProfiles({ unlocked:[], vault:"junk" }, { unlocked:[], vault:{ found:["2763"] } }).vault.found')).toEqual(['2763']);
  });

  it('a broken Vault record in a save is repaired, not a crash', async () => {
    const prior = { version: 1, matches: 0, wins: 0, kos: 0, bossesCleared: {}, bestRushLoop: 0, wcTitles: 0,
      unlocked: ['Firey'], viewMode: 'starters', migratedFrom: null, vault: { found: 'nope' } };
    const w = boot({ seed: { 'profile:v1': J(prior) } }); await settle(w);
    expect(w.eval('vaultSubmit("2763").kind')).toBe('fighter');
    expect(w.eval('PROFILE.vault.found')).toEqual(['2763']);
  });
});

describe('the Vault: the screen', () => {
  it('is on the main menu from the start, and shows every Vault fighter and clue as ??? on a fresh save', async () => {
    const w = boot(); await settle(w);
    const btn = w.document.querySelector('#title #vaultBtn');
    expect(btn).toBeTruthy();
    // A text link, not a seventh button: the title keeps the six test/ui-simplify.test.js allows.
    // (The Daily card adds its own play button once the profile is up; that one is not the menu's.)
    expect([...w.document.querySelectorAll('#title button')].filter((b) => !b.closest('#dailyCard')).length).toBeLessThanOrEqual(6);
    btn.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true }));
    expect(w.document.getElementById('vault').classList.contains('active'), 'Enter on the link opens it').toBe(true);
    w.eval("go('title')");
    btn.click();
    expect(w.document.getElementById('vault').classList.contains('active')).toBe(true);
    const cells = [...w.document.querySelectorAll('#vaultFighters .vcell')];
    expect(cells.length).toBe(13);
    expect(cells.every((c) => c.classList.contains('shut') && c.textContent === '???')).toBe(true);
    const hints = [...w.document.querySelectorAll('#vaultHints .vhint')];
    expect(hints.map((h) => h.querySelector('.vstep').textContent)).toEqual(['1', '2', '3', '4']);
    expect(hints.every((h) => h.classList.contains('shut') && /\?\?\?/.test(h.textContent))).toBe(true);
    expect(w.document.getElementById('vaultCount').textContent).toBe('0 of 17 codes found');
    expect(w.document.getElementById('vaultCode')).toBeTruthy();
    expect(w.document.getElementById('vaultEnterBtn')).toBeTruthy();
  });

  it('Enter in the box submits, the Enter button does too, and the reply is one line on this screen', async () => {
    const w = boot(); await settle(w);
    w.eval('openVault()');
    const box = w.document.getElementById('vaultCode');
    const reply = w.document.getElementById('vaultReply');
    const enter = () => box.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true }));

    box.focus(); box.value = 'Walmart'; enter();
    expect(reply.textContent).toContain('Marshmallow');
    expect(box.value, 'a right code clears the box').toBe('');
    const marsh = [...w.document.querySelectorAll('#vaultFighters .vcell')].find((c) => c.textContent === 'Marshmallow');
    expect(marsh && marsh.classList.contains('open')).toBe(true);
    expect(w.eval('isUnlocked(ROSTER.find(function(r){ return r.name==="Marshmallow"; }))')).toBe(true);

    box.value = 'brake at flake'; w.document.getElementById('vaultEnterBtn').click();
    expect(reply.textContent).toMatch(/step 2 of 7/);
    const row2 = w.document.querySelectorAll('#vaultHints .vhint')[1];
    expect(row2.classList.contains('open')).toBe(true);
    expect(row2.textContent).toContain('Four has to fall while your Lightning is still standing');

    box.value = 'hey guys'; enter();
    expect(reply.textContent).toBe(WRONG);
    expect(reply.classList.contains('wrong')).toBe(true);
    expect(box.value, 'a wrong guess stays so a typo can be fixed').toBe('hey guys');

    box.value = 'WAL MART'; enter();
    expect(reply.textContent).toMatch(/already found/);
    expect(w.document.getElementById('vaultCount').textContent).toBe('2 of 17 codes found');
  });

  it('typing in the box sets off no game hotkey', async () => {
    const w = boot(); await settle(w);
    w.eval('openVault(); window.__heard = 0; addEventListener("keydown", function(){ window.__heard++; });');
    const box = w.document.getElementById('vaultCode');
    box.focus();
    const before = w.eval('SHOW_HITBOXES');
    for (const [key, code] of [['b', 'KeyB'], ['r', 'KeyR'], ['p', 'KeyP'], ['Escape', 'Escape'], [' ', 'Space'], ['ArrowLeft', 'ArrowLeft']]) {
      box.dispatchEvent(new w.KeyboardEvent('keydown', { key, code, bubbles: true, cancelable: true }));
      box.dispatchEvent(new w.KeyboardEvent('keyup', { key, code, bubbles: true, cancelable: true }));
    }
    expect(w.eval('window.__heard'), 'no window listener hears a key typed in the box').toBe(0);
    expect(w.eval('SHOW_HITBOXES')).toBe(before);
    expect(w.eval('!!down.KeyB || !!down.Space')).toBe(false);
    expect(w.eval('window.__lastBanner')).toBeUndefined();
    expect(w.document.getElementById('vault').classList.contains('active')).toBe(true);
    // And B typed in any other text box (a room code) no longer flips the hitbox overlay either.
    const join = w.document.getElementById('joinAddr');
    join.focus();
    join.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'b', code: 'KeyB', bubbles: true, cancelable: true }));
    expect(w.eval('SHOW_HITBOXES')).toBe(before);
  });

  it('never puts up a banner, whatever is typed', async () => {
    const w = boot(); await settle(w);
    w.eval('window.__banners = 0; banner = function(){ window.__banners++; };');
    w.eval('openVault()');
    const box = w.document.getElementById('vaultCode');
    const codes = [...Object.values(FIGHTER_CODES).map((s) => s[0]), ...Object.values(HINT_CODES).map((s) => s[0])];
    for (const c of [...codes, ...codes, 'HEY GUYS', '', 'nothing at all']) {
      box.value = c;
      w.document.getElementById('vaultEnterBtn').click();
    }
    expect(w.eval('window.__banners')).toBe(0);
    expect(w.eval('window.__lastBanner')).toBeUndefined();
    expect(w.document.getElementById('banner').classList.contains('show')).toBe(false);
    expect(w.document.getElementById('vaultCount').textContent).toBe('17 of 17 codes found');
    expect(w.eval(`${J(VAULT_DLC)}.every(function(n){ return isUnlocked(ROSTER.find(function(r){ return r.name===n; })); })`),
      'every Vault DLC fighter is open once its code is in').toBe(true);
  });

  it('is built to fit a phone: the box shrinks, the fighters wrap, the clues are one column', async () => {
    const css = readFileSync('artifacts/V1/index.html', 'utf8');
    expect(css).toMatch(/\.vaultentry\{[^}]*width:min\(460px,100%\)/);
    expect(css).toMatch(/\.vaultentry \.netinput\{[^}]*min-width:0/);
    expect(css).toMatch(/\.vaultgrid\{[^}]*flex-wrap:wrap/);
    expect(css).toMatch(/\.vaulthints\{[^}]*flex-direction:column[^}]*width:min\(560px,100%\)/);
    expect(css).toMatch(/\.vtext\{[^}]*overflow-wrap:anywhere/);
  });
});
