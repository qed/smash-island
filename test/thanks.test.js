import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from './helpers/prng.js';

// The "Thanks roll" (was test/sponsors.test.js). The owner picked it on 2026-09-29, asked how supporters should be thanked:
// "Replace per-fighter sponsor names with one opt-in, adults-only 'Thanks' list in Credits." It replaced "Sponsor a fighter",
// which showed a donor's name next to a fighter (the character select move card) or a boss (a Boss Rush result) they had
// chipped in for. What is pinned now: ONE list of display names, drawn in ONE place -- the "Thanks" section of Settings --
// that ships empty and draws nothing while it is empty; a name can never inject a tag or become a link; nothing here makes a
// network request; no name is ever tied to a character (no fighter line, no boss line, anywhere); and the rules for who may
// be on it are written above the list, where whoever edits it will read them. No money is handled here, and nothing is
// gameplay or a cosmetic: the list is never read by step(), the AI or a hit.

function boot() {
  const html = readFileSync('artifacts/V1/index.html', 'utf8');
  const dom = new JSDOM(html, {
    url: 'http://localhost/', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window) {
      window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
        get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 })
          : p === 'canvas' ? { width: 1100, height: 720 }
          : p === 'getImageData' ? () => ({ data: [] }) : () => {}),
        set: () => true,
      });
      window.Math.random = mulberry32(7);
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
    },
  });
  return dom.window;
}
const settle = (w) => w.eval('profileReady');

describe('THANKS ships empty and shows nothing', () => {
  it('the list itself is an empty array', async () => {
    const w = boot(); await settle(w);
    expect(w.eval('Array.isArray(THANKS)')).toBe(true);
    expect(w.eval('THANKS.length')).toBe(0);
  });

  it('the Settings screen has no Thanks section at all -- not even an empty heading', async () => {
    const w = boot(); await settle(w);
    w.eval('buildThanksUI();');
    const grp = w.document.getElementById('thanksGrp');
    expect(grp.style.display).toBe('none');
    expect(w.document.getElementById('thanksList').innerHTML).toBe('');
  });

  it('go("options") calls the builder itself, and it still shows nothing', async () => {
    const w = boot(); await settle(w);
    w.eval('go("options");');
    expect(w.document.getElementById('thanksGrp').style.display).toBe('none');
  });
});

describe('the per-fighter and per-boss sponsor lines are gone ("Thanks roll")', () => {
  it('the SPONSORS table and everything that drew it no longer exist', async () => {
    const w = boot(); await settle(w);
    for (const name of ['SPONSORS', 'sponsorNames', 'sponsorLineHtml', 'buildSponsorsUI']) {
      expect(w.eval(`typeof ${name}`), `${name} is still defined`).toBe('undefined');
    }
    const src = readFileSync('artifacts/V1/index.html', 'utf8');
    expect(src).not.toMatch(/Sponsored by/);
    expect(src).not.toMatch(/mc-sponsor|sponsorsGrp|sponsorsList/);
    expect(w.document.getElementById('sponsorsGrp'), 'the old Settings section is gone').toBeNull();
  });

  it('even with names on the list, the character select move card names nobody', async () => {
    const w = boot(); await settle(w);
    w.eval('THANKS.push("Jane D.", "The Smith Family");');
    for (const fighter of ['Firey', 'Leafy']) {
      w.eval(`chosen = ROSTER.find(function(r){ return r.name===${JSON.stringify(fighter)}; }); refreshSel();`);
      const mc = w.document.getElementById('moveCard').innerHTML;
      expect(mc, `${fighter}'s move card carries a name`).not.toMatch(/Jane D\.|Smith Family/);
      expect(mc).not.toMatch(/Sponsored by|mc-sponsor|Thanks/);
    }
  });

  it('even with names on the list, a Boss Rush result names nobody -- victory or defeat', async () => {
    const w = boot(); await settle(w);
    w.eval('THANKS.push("Jane D.");');
    // Victory path: rushFinish() is only reached after the match is already over (running=false).
    w.eval('BOSSRUSH = { active:true, cleared:12, loop:0 }; rushFinish();');
    expect(w.eval('running')).toBe(false);
    expect(w.document.getElementById('resultSub').textContent).toBe('Boss Rush beaten · bosses cleared: 12');
    // Defeat path: the boss that beat you gets no line either.
    const w2 = boot(); await settle(w2);
    w2.eval('THANKS.push("Jane D.");');
    w2.eval(`
      SETTINGS.mode='boss'; SETTINGS.count=1; fighters=[]; summons=[];
      BOSSRUSH = { active:true, bossIdx:2, cleared:0, loop:0 };
      summons.push({ type:'boss', name:'Firey Speaker Box', hp:50, _bossRush:true });
      bossRushCheck();
    `);
    expect(w2.eval('running')).toBe(false);
    expect(w2.document.getElementById('resultSub').textContent).toBe('The boss won. Bosses cleared: 0');
  });
});

describe('a filled THANKS list shows escaped names, in one place', () => {
  const XSS_NAME = '<img src=x onerror=alert(1)> & "Big Fan" <b>Two</b>';

  it('lists every name in the Settings "Thanks" section, escaped, and shows nothing else there', async () => {
    const w = boot(); await settle(w);
    w.eval(`THANKS.push("Jane D.", ${JSON.stringify(XSS_NAME)}, "The Smith Family");`);
    w.eval('buildThanksUI();');
    const grp = w.document.getElementById('thanksGrp');
    const list = w.document.getElementById('thanksList');
    expect(grp.style.display).not.toBe('none');
    expect(grp.querySelector('.optlabel').textContent).toBe('Thanks');
    expect(list.innerHTML).toContain('Jane D.');
    expect(list.innerHTML).toContain('The Smith Family');
    // the raw markup must never appear -- only its escaped form
    expect(list.innerHTML).not.toContain('<img src=x onerror=alert(1)>');
    expect(list.innerHTML).not.toContain('<b>Two</b>');
    expect(list.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(list.innerHTML).toContain('&amp;');
    expect(list.innerHTML).toContain('&lt;b&gt;Two&lt;/b&gt;');
    // no element was actually created from a name -- the DOM agrees with the string
    expect(list.querySelector('img')).toBeNull();
    expect(list.querySelectorAll('b').length).toBe(0);
    // names only: no character, boss or amount is printed beside them
    expect(list.textContent).toBe(`Jane D., ${XSS_NAME}, The Smith Family`);
  });

  it('escapes <, > and & specifically', async () => {
    const w = boot(); await settle(w);
    w.eval('THANKS.push("A & B <C> D");');
    w.eval('buildThanksUI();');
    expect(w.document.getElementById('thanksList').innerHTML).toContain('A &amp; B &lt;C&gt; D');
  });

  it('skips blank and non-text entries, and trims the rest', async () => {
    const w = boot(); await settle(w);
    w.eval('THANKS.push("", "   ", 42, null, undefined, {}, "  Real Name  ");');
    w.eval('buildThanksUI();');
    expect(w.document.getElementById('thanksList').textContent).toBe('Real Name');
    // ...and a list of nothing but blanks is not drawn at all, as if it were empty
    const w2 = boot(); await settle(w2);
    w2.eval('THANKS.push("", "   ", 7); buildThanksUI();');
    expect(w2.document.getElementById('thanksGrp').style.display).toBe('none');
    expect(w2.document.getElementById('thanksList').innerHTML).toBe('');
  });

  it('draws once, in Settings, and on no other screen (the one place)', async () => {
    const w = boot(); await settle(w);
    w.eval('THANKS.push("Jane D.");');
    w.eval('go("options");');
    expect(w.document.getElementById('thanksGrp').style.display).not.toBe('none');
    const holders = [...w.document.querySelectorAll('.screen')].filter((s) => s.textContent.includes('Jane D.')).map((s) => s.id);
    expect(holders, 'the name appears on exactly one screen').toEqual(['options']);
    // leaving the list empty again hides the section on the next visit
    w.eval('THANKS.length = 0; go("title"); go("options");');
    expect(w.document.getElementById('thanksGrp').style.display).toBe('none');
  });

  it('nothing here creates a network request or a link', async () => {
    const w = boot(); await settle(w);
    let calls = 0;
    w.fetch = () => { calls++; throw new Error('no network calls expected'); };
    const OrigXHR = w.XMLHttpRequest;
    w.XMLHttpRequest = function () { calls++; throw new Error('no XHR expected'); };
    w.eval(`THANKS.push("Jane D.", "https://example.com/buy-now", ${JSON.stringify(XSS_NAME)});`);
    w.eval('buildThanksUI(); go("options");');
    w.eval('BOSSRUSH = { active:true, cleared:12, loop:0 }; rushFinish();');
    expect(calls).toBe(0);
    // no <a>, no href, nothing clickable was ever produced from the list -- an address typed as a name is just text
    const list = w.document.getElementById('thanksList');
    expect(list.querySelector('a, [href], [onclick], button, input')).toBeNull();
    expect(list.textContent).toContain('https://example.com/buy-now');
    expect(w.document.getElementById('resultSub').querySelector('a')).toBeNull();
    w.XMLHttpRequest = OrigXHR;
  });
});

describe('the rules for who is on the list are written where the list is', () => {
  it('states consent, adults only, removal on request, and never tied to a character, citing the owner', () => {
    const src = readFileSync('artifacts/V1/index.html', 'utf8').replace(/\r\n/g, '\n');
    const at = src.indexOf('const THANKS = ');
    const start = src.lastIndexOf('// THANKS. The owner', at);
    expect(start, 'the comment block sits right above the list').toBeGreaterThan(0);
    const comment = src.slice(start, at);
    expect(at - start, 'and it is one comment block, not a distant note').toBeLessThan(3000);
    expect(comment).toMatch(/Thanks roll/);
    expect(comment).toContain("one opt-in, adults-only\n// 'Thanks' list in Credits");
    expect(comment).toMatch(/ONLY with that person's consent/);
    expect(comment).toMatch(/ADULTS ONLY/);
    expect(comment).toMatch(/REMOVED ON REQUEST/);
    expect(comment).toMatch(/NEVER tied to a character/);
    expect(comment).toMatch(/ships EMPTY/);
  });
});
