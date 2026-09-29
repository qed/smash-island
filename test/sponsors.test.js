import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from './helpers/prng.js';

// "Sponsor a fighter" -- a donor's name in the credits next to a fighter or boss they chipped in for. No gameplay,
// no cosmetics, no money handled here (SPONSORS ships empty; the owner fills it by hand). These tests only cover
// the display: nothing shows while the table is empty, a filled table shows escaped names in the two required
// spots (the character select move card and the Settings "Sponsors" list) and on a Boss Rush result, HTML in a
// name can never inject a tag, and none of it ever creates a network request or a link.

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

describe('SPONSORS ships empty and shows nothing', () => {
  it('the table itself is an empty object', async () => {
    const w = boot(); await settle(w);
    expect(w.eval('SPONSORS')).toEqual({});
  });

  it('the character select move card has no sponsor line for anyone', async () => {
    const w = boot(); await settle(w);
    w.eval('chosen = ROSTER.find(function(r){ return r.name==="Firey"; }); refreshSel();');
    const mc = w.document.getElementById('moveCard').innerHTML;
    expect(mc).not.toMatch(/Sponsored by/);
    expect(mc).not.toMatch(/mc-sponsor/);
  });

  it('the Settings screen has no Sponsors section at all -- not even an empty heading', async () => {
    const w = boot(); await settle(w);
    w.eval('buildSponsorsUI();');
    const grp = w.document.getElementById('sponsorsGrp');
    expect(grp.style.display).toBe('none');
    expect(w.document.getElementById('sponsorsList').innerHTML).toBe('');
  });

  it('go("options") calls the builder itself, and it still shows nothing', async () => {
    const w = boot(); await settle(w);
    w.eval('go("options");');
    expect(w.document.getElementById('sponsorsGrp').style.display).toBe('none');
  });
});

describe('a filled SPONSORS table shows escaped names', () => {
  const XSS_NAME = '<img src=x onerror=alert(1)> & "Big Fan" <b>Two</b>';

  it('shows escaped names on the character select move card, one quiet line', async () => {
    const w = boot(); await settle(w);
    w.eval(`SPONSORS["Firey"] = ["Jane D.", ${JSON.stringify(XSS_NAME)}];`);
    w.eval('chosen = ROSTER.find(function(r){ return r.name==="Firey"; }); refreshSel();');
    const mc = w.document.getElementById('moveCard');
    expect(mc.innerHTML).toContain('Sponsored by Jane D.,');
    // the raw markup must never appear -- only its escaped form
    expect(mc.innerHTML).not.toContain('<img src=x onerror=alert(1)>');
    expect(mc.innerHTML).not.toContain('<b>Two</b>');
    expect(mc.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(mc.innerHTML).toContain('&amp;');
    expect(mc.innerHTML).toContain('&lt;b&gt;Two&lt;/b&gt;');
    // no element was actually created from the name -- the DOM agrees with the string
    expect(mc.querySelector('img')).toBeNull();
    expect(mc.querySelectorAll('b').length).toBe(0);
    // a different, unsponsored fighter shows nothing
    w.eval('chosen = ROSTER.find(function(r){ return r.name==="Leafy"; }); refreshSel();');
    expect(w.document.getElementById('moveCard').innerHTML).not.toMatch(/Sponsored by/);
  });

  it('lists every entry, escaped, in the Settings "Sponsors" section', async () => {
    const w = boot(); await settle(w);
    w.eval(`SPONSORS["Firey"] = ["Jane D."]; SPONSORS["Boss:Four"] = [${JSON.stringify(XSS_NAME)}];`);
    w.eval('buildSponsorsUI();');
    const grp = w.document.getElementById('sponsorsGrp');
    const list = w.document.getElementById('sponsorsList');
    expect(grp.style.display).not.toBe('none');
    expect(list.innerHTML).toContain('Firey');
    expect(list.innerHTML).toContain('Jane D.');
    expect(list.innerHTML).toContain('Four');
    expect(list.innerHTML).not.toContain('<img src=x onerror=alert(1)>');
    expect(list.innerHTML).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(list.querySelector('img')).toBeNull();
  });

  it('escapes <, > and & specifically, in both spots', async () => {
    const w = boot(); await settle(w);
    w.eval('SPONSORS["Firey"] = ["A & B <C> D"];');
    w.eval('chosen = ROSTER.find(function(r){ return r.name==="Firey"; }); refreshSel(); buildSponsorsUI();');
    // buildSponsorsUI alone won't show Firey (only bosses/fighters that are ALSO listed); check via sponsorLineHtml directly
    const line = w.eval('sponsorLineHtml("Firey")');
    expect(line).toBe('Sponsored by A &amp; B &lt;C&gt; D');
    expect(w.document.getElementById('moveCard').innerHTML).toContain('A &amp; B &lt;C&gt; D');
  });

  it('shows a sponsor line on the Boss Rush result screen once the run ends -- never mid-fight', async () => {
    const w = boot(); await settle(w);
    w.eval('SPONSORS["Boss:Four"] = ["Jane D."];');
    // Victory path: rushFinish() is only reached after the match is already over (running=false).
    w.eval('BOSSRUSH = { active:true, cleared:12, loop:0 }; rushFinish();');
    expect(w.eval('running')).toBe(false);
    expect(w.document.getElementById('resultSub').innerHTML).toContain('Sponsored by Jane D.');
    // Defeat path: the boss that beat you is credited the same way.
    const w2 = boot(); await settle(w2);
    w2.eval('SPONSORS["Boss:Firey Speaker Box"] = ["<A & B>"];');
    w2.eval(`
      SETTINGS.mode='boss'; SETTINGS.count=1; fighters=[]; summons=[];
      BOSSRUSH = { active:true, bossIdx:2, cleared:0, loop:0 };
      summons.push({ type:'boss', name:'Firey Speaker Box', hp:50, _bossRush:true });
      bossRushCheck();
    `);
    expect(w2.eval('running')).toBe(false);
    const sub = w2.document.getElementById('resultSub').innerHTML;
    expect(sub).toContain('&lt;A &amp; B&gt;');
    expect(sub).not.toContain('<A & B>');
  });

  it('nothing here creates a network request or a link', async () => {
    const w = boot(); await settle(w);
    let calls = 0;
    w.fetch = () => { calls++; throw new Error('no network calls expected'); };
    const OrigXHR = w.XMLHttpRequest;
    w.XMLHttpRequest = function () { calls++; throw new Error('no XHR expected'); };
    w.eval(`SPONSORS["Firey"] = ["Jane D."]; SPONSORS["Boss:Four"] = ["Jane D."];`);
    w.eval('chosen = ROSTER.find(function(r){ return r.name==="Firey"; }); refreshSel(); buildSponsorsUI(); go("options");');
    w.eval('BOSSRUSH = { active:true, cleared:12, loop:0 }; rushFinish();');
    expect(calls).toBe(0);
    // and no <a> element or href was ever produced from sponsor data
    expect(w.document.getElementById('moveCard').querySelector('a')).toBeNull();
    expect(w.document.getElementById('sponsorsList').querySelector('a')).toBeNull();
    expect(w.document.getElementById('resultSub').querySelector('a')).toBeNull();
    w.XMLHttpRequest = OrigXHR;
  });
});
