import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// "A calmer main menu, a What's new card, and a changelog" (the owner, 2026-10-14). The card shows once per version to a player who has
// been here before, never to a first-ever visit, and only over the title; the changelog is one CHANGELOG array, newest first.

const KEY = 'bfsi:whatsNewSeen';
const card = (w) => w.document.getElementById('whatsNew');
const shown = (w) => card(w).style.display === 'block';
const fresh = () => {
  const { window: w } = loadMonolith();
  w.localStorage.setItem('bfsi:tutorialDone', '1');   // a returning player
  w.localStorage.removeItem(KEY);
  w.eval('WN_SHOWN = null');
  return w;
};

describe("the What's new card", () => {
  it('shows once per version, lists the newest entry, and remembers it', () => {
    const w = fresh();
    w.eval("go('title')");
    expect(shown(w), 'a returning player sees it').toBe(true);
    const items = [...w.document.querySelectorAll('#wnList li')].map((l) => l.textContent);
    expect(items).toEqual(w.eval('CHANGELOG[0].items'));
    expect(w.localStorage.getItem(KEY)).toBe(w.eval('CHANGELOG[0].version'));
    w.document.getElementById('wnGot').click();
    expect(shown(w), 'Got it closes it').toBe(false);
    w.eval("go('select'); go('title')");
    expect(shown(w), 'and it does not come back this session').toBe(false);
    w.eval('WN_SHOWN = null');   // a reload
    w.eval("go('title')");
    expect(shown(w), 'nor on the next visit of the same version').toBe(false);
    w.localStorage.setItem(KEY, 'v0'); w.eval('WN_SHOWN = null');   // an older version was the last one seen
    w.eval("go('title')");
    expect(shown(w), 'a new version shows it again').toBe(true);
  });

  it('does not greet a first-ever visit, never stays up off the title, and survives storage that throws', () => {
    const { window: w } = loadMonolith();
    w.eval("go('title')");
    expect(shown(w), 'nothing is new to someone who has never been here').toBe(false);
    const r = fresh();
    r.eval("go('title')");
    expect(shown(r)).toBe(true);
    r.eval("go('select')");
    expect(shown(r), 'a card is the title\'s, never another screen\'s').toBe(false);
    const t = fresh();
    t.Storage.prototype.getItem = () => { throw new Error('blocked'); };
    t.Storage.prototype.setItem = () => { throw new Error('blocked'); };
    expect(() => t.eval("go('title')")).not.toThrow();
  });
});

describe('the changelog', () => {
  it('opens from the title and from the card, newest first, one block per CHANGELOG entry', () => {
    const w = fresh();
    w.eval("go('title')");
    w.document.getElementById('changelogBtn').click();
    expect(w.document.getElementById('changelog').classList.contains('active')).toBe(true);
    expect(w.eval('MUSIC_SCREENS.changelog')).toBe('menu');
    const n = w.eval('CHANGELOG.length');
    expect(w.document.querySelectorAll('#changeList .clentry').length).toBe(n);
    expect(w.document.querySelector('#changeList .cldate').textContent).toContain('14 October 2026');
    const dates = w.eval('CHANGELOG.map(function(e){ return e.date; })');
    expect([...dates].sort().reverse(), 'newest first').toEqual(dates);
    expect(w.document.getElementById('changelog').innerHTML).toContain("go('title')");
    w.eval("go('title'); WN_SHOWN = null"); w.localStorage.removeItem(KEY);
    w.eval("go('title')");
    w.document.getElementById('wnMore').click();
    expect(w.document.getElementById('changelog').classList.contains('active'), 'the card links to it').toBe(true);
  });

  it('is plain words: no code talk, no touch wording, and none of the secrets', () => {
    const w = fresh();
    const text = w.eval('JSON.stringify(CHANGELOG)');
    expect(text).not.toMatch(/\b(tap|phone|mobile|touch)\w*/i);
    expect(text).not.toMatch(/\b(OJ|Suitcase|Cabby)\b/);
    expect(text).not.toMatch(/\b(function|const|px|innerHTML|localStorage|commit|merge)\b/i);
  });
});

describe('the regrouped menu', () => {
  it('keeps every old entry point: the old functions, the Locker tabs, and Learn with How to Play and Training', () => {
    const w = fresh();
    for (const [fn, screen] of [['openQuests', 'quests'], ['openStore', 'store'], ['openWardrobe', 'wardrobe'], ['openTutorial', 'tutorial']]) {
      w.eval(`go('title'); ${fn}();`);
      expect(w.document.getElementById(screen).classList.contains('active'), fn).toBe(true);
    }
    w.eval("go('title')");
    w.document.getElementById('learnBtn').click();
    expect(w.document.getElementById('learn').classList.contains('active')).toBe(true);
    w.document.getElementById('howBtn').click();
    expect(w.document.getElementById('tutorial').classList.contains('active')).toBe(true);
    w.eval("go('learn')");
    w.document.getElementById('trainBtn').click();
    expect(w.eval('TESTMODE.training')).toBe(true);
  });
});
