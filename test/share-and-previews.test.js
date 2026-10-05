import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';
import { PNG } from 'pngjs';
import { loadMonolith } from './helpers/load-monolith.js';
import { LINEUP, OG_WIDTH, OG_HEIGHT, MAX_KB, truecolour, palettePng } from '../scripts/make-og-image.mjs';

// SHARING AND PREVIEWS. The owner cannot post on social media much and asked for publicity, so the game has to do the talking
// when someone else shares it: a pasted link unfurls into a picture and a pitch (link previews), a Share button on the title
// and the result screen hands the link to the phone's share sheet (or copies it), a Boss Rush clear and the Daily offer a short
// brag line, and search engines get the basics (canonical, structured data, robots, sitemap).
//
// The one rule that runs through all of it: a public surface never names a secret. The secrets are the Vault's fighters, Steve
// Cobs's prize (OJ, Suitcase, Cabby), and One and Steve Cobs themselves. Every group below that produces text or a picture
// checks it against the SAME list, built here from the game's own tables rather than typed out, so a new Vault fighter is
// covered the day it is added.

const SITE = 'https://smash-delta.vercel.app/';
const PUBLISH = 'artifacts/V1';
const HTML = readFileSync(join(PUBLISH, 'index.html'), 'utf8');
const DOC = new JSDOM(HTML).window.document;   // parsed, never run: the head is what a crawler reads
const HEAD = DOC.head;

const meta = (attr, key) => { const el = HEAD.querySelector(`meta[${attr}="${key}"]`); return el ? el.getAttribute('content') : null; };

// ---- the secret list, from the game's own tables ----------------------------------------------------------------------
const { window: GAME } = loadMonolith();
const SECRET_FIGHTERS = JSON.parse(GAME.eval(`JSON.stringify({
  vault: Array.from(VAULT_FIGHTERS),
  prize: PRIZE_NAMES.slice(),
})`));
// One and Steve Cobs are bosses, not roster rows, so no table holds their names; they are named here on purpose.
const SECRET_NAMES = [...new Set([...SECRET_FIGHTERS.vault, ...SECRET_FIGHTERS.prize, 'One', 'Steve Cobs'])];
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Whole word and exact case: the names are proper nouns, and "one" in lower case is just the number.
const mentions = (text, name) => new RegExp(`(^|[^A-Za-z0-9])${esc(name)}($|[^A-Za-z0-9])`).test(text);
const leaks = (text) => SECRET_NAMES.filter((n) => mentions(text, n));

describe('the secret list this file guards with', () => {
  it('is built from the game and is not empty', () => {
    // If a refactor renames VAULT_FIGHTERS or PRIZE_NAMES the eval above throws; if it empties them this catches it.
    for (const n of ['Needle', 'Gelatin', 'Fanny', 'Pillow', 'OJ', 'Suitcase', 'Cabby', 'One', 'Steve Cobs']) expect(SECRET_NAMES, n).toContain(n);
    expect(SECRET_NAMES.length).toBeGreaterThanOrEqual(16);
  });
});

describe('link previews: the tags a pasted link is built from', () => {
  it('has a meta description that is a real sentence, not a stub', () => {
    const d = meta('name', 'description');
    expect(d, 'meta description').toBeTruthy();
    expect(d.length).toBeGreaterThan(80);
    expect(d.length, 'long descriptions are cut off by every platform').toBeLessThanOrEqual(300);
  });

  it('carries the open-graph set, pointing at the production site', () => {
    expect(meta('property', 'og:type')).toBe('website');
    expect(meta('property', 'og:site_name')).toBe('Battle for Smash Island');
    expect(meta('property', 'og:title')).toMatch(/Battle for Smash Island/);
    expect(meta('property', 'og:description')).toBeTruthy();
    expect(meta('property', 'og:url')).toBe(SITE);
  });

  it('gives og:image as an absolute https URL with its size and a description', () => {
    const img = meta('property', 'og:image');
    expect(img).toMatch(/^https:\/\//);
    expect(new URL(img).origin + '/').toBe(SITE);
    expect(meta('property', 'og:image:width')).toBe(String(OG_WIDTH));
    expect(meta('property', 'og:image:height')).toBe(String(OG_HEIGHT));
    expect(meta('property', 'og:image:alt')).toBeTruthy();
    expect(meta('property', 'og:image:type')).toBe('image/png');
  });

  it('asks X for the large card and repeats title, description and image', () => {
    expect(meta('name', 'twitter:card')).toBe('summary_large_image');
    expect(meta('name', 'twitter:title')).toBeTruthy();
    expect(meta('name', 'twitter:description')).toBeTruthy();
    expect(meta('name', 'twitter:image')).toMatch(/^https:\/\//);
    expect(meta('name', 'twitter:image')).toBe(meta('property', 'og:image'));
    expect(meta('name', 'twitter:image:alt')).toBeTruthy();
  });

  it('uses no relative or insecure URL in any of those tags', () => {
    const urls = ['og:url', 'og:image'].map((k) => meta('property', k)).concat(['twitter:image'].map((k) => meta('name', k)));
    for (const u of urls) { expect(u).toMatch(/^https:\/\//); expect(() => new URL(u)).not.toThrow(); }
    for (const el of HEAD.querySelectorAll('meta[content]')) expect(el.getAttribute('content'), el.outerHTML.slice(0, 60)).not.toMatch(/^(http:|\/\/)/);
  });

  it('serves the og:image from the published folder, so the URL it names is a real file', () => {
    const path = new URL(meta('property', 'og:image')).pathname;   // /og-image.png
    expect(existsSync(join(PUBLISH, path)), `${path} is published`).toBe(true);
  });

  it('pitches the game accurately: free, fan-made, BFDI and Inanimate Insanity, in the browser', () => {
    const d = meta('property', 'og:description');
    expect(d).toMatch(/free/i);
    expect(d).toMatch(/fan-made/i);
    expect(d).toMatch(/BFDI/);
    expect(d).toMatch(/Inanimate Insanity/);
    expect(d).toMatch(/browser/i);
    // the same pitch everywhere a platform might read it
    expect(meta('property', 'og:description')).toBe(meta('name', 'description'));
    expect(meta('name', 'twitter:description')).toBe(meta('name', 'description'));
  });

  it('only claims modes and numbers the game has', () => {
    const d = meta('name', 'description');
    // "100+ fighters": the roster really is past 100 (the title screen prints the live count)
    expect(d).toMatch(/100\+ fighters/);
    expect(JSON.parse(GAME.eval('JSON.stringify(ROSTER.filter(function(r){ return r.play; }).length)'))).toBeGreaterThanOrEqual(100);
    // Boss Rush, the Daily, the World Cup and online play are all in the game, by those names
    for (const [claim, proof] of [
      [/Boss Rush/, 'typeof startBossRush === "function"'],
      [/Daily/, 'typeof dailyMatchup === "function"'],
      [/World Cup/, 'typeof openTournamentSetup === "function"'],
      [/online play with friends/, 'typeof openLobby === "function"'],
    ]) {
      expect(d, String(claim)).toMatch(claim);
      expect(GAME.eval(proof), `the game has what the pitch says: ${claim}`).toBe(true);
    }
    expect(GAME.document.getElementById('title').textContent).toMatch(/World Cup/);
    expect(GAME.document.getElementById('title').textContent).toMatch(/Play with Friends/);
  });

  it('names no secret anywhere a crawler or a person reads in the head', () => {
    // The title, every meta tag, every link target (bar the inline favicon) and the structured data. NOT the stylesheet: its
    // comments talk about the Vault, and nobody reading a link preview ever sees them.
    const everything = [
      HEAD.querySelector('title').textContent,
      ...[...HEAD.querySelectorAll('meta')].map((e) => e.getAttribute('content') || ''),
      ...[...HEAD.querySelectorAll('link')].map((e) => { const h = e.getAttribute('href') || ''; return h.startsWith('data:') ? '' : h; }),
      ...[...HEAD.querySelectorAll('script[type="application/ld+json"]')].map((e) => e.textContent),
    ].join('\n');
    expect(leaks(everything), 'a secret is named in the page head').toEqual([]);
    // ...nor does it hint at how anything is unlocked
    expect(everything).not.toMatch(/\b(vault|unlock(ed|s)?|secret|code)\b/i);
  });
});

describe('link previews: og-image.png', () => {
  const file = join(PUBLISH, 'og-image.png');

  it('exists, is a PNG, and is exactly 1200x630', () => {
    expect(existsSync(file)).toBe(true);
    const bytes = readFileSync(file);
    expect(bytes.subarray(0, 8).toString('hex'), 'PNG signature').toBe('89504e470d0a1a0a');
    const png = PNG.sync.read(bytes);
    expect(png.width).toBe(1200);
    expect(png.height).toBe(630);
  });

  it('is light enough for the strictest preview (about 300 KB)', () => {
    expect(statSync(file).size).toBeLessThanOrEqual(MAX_KB * 1024);
  });

  it('is a finished picture: bright, opaque, and not a blank capture', () => {
    const { data, width, height } = PNG.sync.read(readFileSync(file));
    const px = (x, y) => { const i = (y * width + x) * 4; return [data[i], data[i + 1], data[i + 2], data[i + 3]]; };
    const distinct = new Set();
    let lum = 0, n = 0;
    for (let y = 0; y < height; y += 7) for (let x = 0; x < width; x += 7) { const p = px(x, y); expect(p[3], 'fully opaque').toBe(255); distinct.add(p.slice(0, 3).join(',')); lum += 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]; n++; }
    expect(distinct.size, 'a blank or failed capture has a handful of colours').toBeGreaterThan(60);
    expect(lum / n, 'a bright background, not a black screen').toBeGreaterThan(120);
    // the top-left corner is the sky of the title screen, the bottom-left the grass
    const [r, g, b] = px(4, 4); expect(b, 'sky is blue').toBeGreaterThan(r);
    const [gr, gg, gb] = px(4, height - 4); expect(gg, 'grass is green').toBeGreaterThan(gr); expect(gg).toBeGreaterThan(gb);
  });
});

describe('link previews: the generator (scripts/make-og-image.mjs)', () => {
  it('lines up only ordinary fighters: nobody from the Vault, the prize, or the secret bosses', () => {
    expect(LINEUP.length).toBeGreaterThanOrEqual(7);
    for (const s of LINEUP) {
      const row = JSON.parse(GAME.eval(`JSON.stringify((function(){ var r = ROSTER.find(function(x){ return x.name === ${JSON.stringify(s.name)}; });
        return r ? { play: !!r.play, vault: VAULT_FIGHTERS.has(r.name), prize: !!r.prize, src: SPRITES[r.name] && SPRITES[r.name].src } : null; })())`));
      expect(row, `${s.name} is a fighter in ROSTER`).toBeTruthy();
      expect(row.play, `${s.name} is playable`).toBe(true);
      expect(row.vault, `${s.name} is behind a Vault code`).toBe(false);
      expect(row.prize, `${s.name} is Steve Cobs's prize`).toBe(false);
      expect(SECRET_NAMES, `${s.name} is a secret`).not.toContain(s.name);
      // the picture uses the game's own render for that fighter, not a look-alike file
      expect(row.src, `${s.name}'s sprite`).toBe(`assets/sprites/${s.file}`);
      expect(existsSync(join(PUBLISH, 'assets', 'sprites', s.file)), `${s.file} exists`).toBe(true);
    }
    expect(new Set(LINEUP.map((s) => s.name)).size, 'no fighter twice').toBe(LINEUP.length);
  });

  it('writes a valid PNG both ways (truecolour is lossless, the palette decodes)', () => {
    const w = 40, h = 30, d = Buffer.alloc(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; d[i] = (x * 6 + y) & 255; d[i + 1] = (y * 8) & 255; d[i + 2] = (x * y) & 255; d[i + 3] = 255; }
    const back = PNG.sync.read(truecolour(d, w, h));
    expect(Buffer.compare(back.data, d), 'truecolour round-trips exactly').toBe(0);
    const pal = PNG.sync.read(palettePng(d, w, h));
    expect([pal.width, pal.height]).toEqual([w, h]);
  });
});

// ---- the Share buttons --------------------------------------------------------------------------------------------------
// Boots the game, then stands in for the browser: a share sheet and/or a clipboard, each recording what it is handed. Timers are
// captured so the 1.6 s "Copied!" can be run on demand instead of waited for.
const flush = () => new Promise((r) => setTimeout(r, 0));
function bootShare({ share, clipboard } = {}) {
  const { window: w } = loadMonolith();
  const rec = { shared: [], copied: [], timers: [] };
  w.setTimeout = (fn) => { rec.timers.push(fn); return rec.timers.length; };
  w.clearTimeout = () => {};
  if (share) w.navigator.share = (d) => { rec.shared.push(d); return share(d); };
  if (clipboard) w.navigator.clipboard = { writeText: (t) => { rec.copied.push(t); return clipboard(t); } };
  return { w, rec, doc: w.document };
}
const ok = () => Promise.resolve();
const fail = (name) => () => Promise.reject({ name });

describe('the Share buttons: where they are', () => {
  it('puts Share on the title as a text link beside the Vault, and keeps the title to six buttons', () => {
    const { doc } = bootShare();
    const link = doc.querySelector('#title #shareBtn');
    expect(link, 'a Share control on the title').toBeTruthy();
    expect(link.tagName, 'a link in the Vault\'s style, not a seventh button').toBe('A');
    expect(link.getAttribute('role')).toBe('button');
    expect(link.getAttribute('tabindex')).toBe('0');
    expect(link.classList.contains('link')).toBe(true);
    expect(link.parentElement, 'on the Vault\'s line').toBe(doc.querySelector('#title #vaultBtn').parentElement);
    expect([...doc.querySelectorAll('#title button')].filter((b) => !b.closest('#dailyCard')).length).toBeLessThanOrEqual(6);
  });

  it('puts Share on the result screen, in the row with Rematch and Title, in the same ghost style as Title', () => {
    const { doc } = bootShare();
    const btn = doc.querySelector('#result #resultShare');
    expect(btn, 'a Share button on the result screen').toBeTruthy();
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.className, 'the menu\'s own small ghost button').toBe('btn ghost sm');
    expect(btn.parentElement, 'in the row with Rematch').toBe(doc.getElementById('resultRematch').parentElement);
    expect(btn.textContent).toMatch(/Share/);
  });

  it('fits at phone width: the controls wrap instead of overflowing (no fixed widths, rows may wrap)', () => {
    // jsdom does no layout, so this pins the CSS that makes it true rather than measuring pixels: the result row and the
    // title's Vault line must be allowed to wrap, and neither Share control may carry a width of its own.
    const { doc } = bootShare();
    expect(HTML).toMatch(/\.row\{[^}]*flex-wrap:wrap/);
    for (const el of [doc.getElementById('shareBtn'), doc.getElementById('resultShare')]) {
      expect(el.getAttribute('style') || '', 'no inline width on a Share control').not.toMatch(/width/);
    }
    expect(HTML).not.toMatch(/#shareBtn\s*\{[^}]*(width|min-width)/);
    expect(HTML).not.toMatch(/#resultShare\s*\{[^}]*(width|min-width)/);
  });
});

describe('the Share buttons: what a tap does', () => {
  it('opens the share sheet where the browser has one, with a title, a line and the production link', async () => {
    const { rec, doc } = bootShare({ share: ok, clipboard: ok });
    doc.getElementById('shareBtn').click();
    await flush();
    expect(rec.shared).toHaveLength(1);
    const d = rec.shared[0];
    expect(d.title).toBe('Battle for Smash Island');
    expect(d.url).toBe(SITE);
    expect(d.text).toMatch(/free, fan-made BFDI & Inanimate Insanity/);
    expect(Object.keys(d).sort(), 'exactly {title, text, url}').toEqual(['text', 'title', 'url']);
    expect(rec.copied, 'a share that worked copies nothing').toEqual([]);
  });

  it('does the same from the result screen', async () => {
    const { w, rec, doc } = bootShare({ share: ok, clipboard: ok });
    w.eval("go('result')");
    doc.getElementById('resultShare').click();
    await flush();
    expect(rec.shared).toHaveLength(1);
    expect(rec.shared[0].url).toBe(SITE);
  });

  it('copies the link and says "Copied!" where there is no share sheet, then puts the label back', async () => {
    const { rec, doc } = bootShare({ clipboard: ok });
    const btn = doc.getElementById('shareBtn');
    const label = btn.textContent;
    btn.click();
    await flush();
    expect(rec.copied, 'the link, and only the link').toEqual([SITE]);
    expect(btn.textContent).toBe('✓ Copied!');
    rec.timers.forEach((t) => t());
    expect(btn.textContent, 'the label comes back').toBe(label);
  });

  it('gives the production link whatever address this copy of the game was opened from', async () => {
    const { w, rec, doc } = bootShare({ clipboard: ok });
    expect(w.location.origin, 'the test page is not the production site').not.toBe(SITE.slice(0, -1));
    doc.getElementById('shareBtn').click();
    await flush();
    expect(rec.copied).toEqual([SITE]);
  });

  it('a second tap inside the feedback does not leave "Copied!" as the label', async () => {
    const { rec, doc } = bootShare({ clipboard: ok });
    const btn = doc.getElementById('resultShare');
    const label = btn.textContent;
    btn.click(); await flush();
    btn.click(); await flush();
    rec.timers.forEach((t) => t());
    expect(btn.textContent).toBe(label);
  });

  it('copies when the player backs out of nothing: a refused share falls through to the clipboard', async () => {
    const { rec, doc } = bootShare({ share: fail('NotAllowedError'), clipboard: ok });
    doc.getElementById('shareBtn').click();
    await flush(); await flush();
    expect(rec.shared).toHaveLength(1);
    expect(rec.copied).toEqual([SITE]);
  });

  it('copies nothing when the player cancels the share sheet', async () => {
    const { rec, doc } = bootShare({ share: fail('AbortError'), clipboard: ok });
    doc.getElementById('shareBtn').click();
    await flush(); await flush();
    expect(rec.shared).toHaveLength(1);
    expect(rec.copied, 'a cancelled share is not an error').toEqual([]);
  });

  it('falls back to a selectable field, never to a false "Copied!", when there is no clipboard either', async () => {
    const { rec, doc } = bootShare();
    const btn = doc.getElementById('shareBtn');
    const label = btn.textContent;
    btn.click();
    await flush();
    const field = doc.getElementById('shareField');
    expect(field, 'a field to copy from').toBeTruthy();
    expect(field.value).toBe(SITE);
    expect(field.readOnly).toBe(true);
    expect(btn.textContent, 'it did not claim to copy').toBe(label);
    expect(rec.copied).toEqual([]);
  });

  it('shows the field instead of "Copied!" when the clipboard refuses the write', async () => {
    const { doc } = bootShare({ clipboard: () => Promise.reject(new Error('denied')) });
    const btn = doc.getElementById('resultShare');
    const label = btn.textContent;
    btn.click();
    await flush(); await flush();
    expect(btn.textContent).toBe(label);
    expect(doc.getElementById('rrShare') ? doc.querySelector('#rrShare input') : doc.getElementById('shareField')).toBeTruthy();
  });

  it('presses from the keyboard like the Vault\'s link: Enter or Space on the title link shares', async () => {
    const { w, rec, doc } = bootShare({ share: ok });
    const link = doc.getElementById('shareBtn');
    for (const [key, code] of [['Enter', 'Enter'], [' ', 'Space']]) {
      link.dispatchEvent(new w.KeyboardEvent('keydown', { key, code, bubbles: true, cancelable: true }));
    }
    await flush();
    expect(rec.shared).toHaveLength(2);
  });

  it('leaves Copy Link on the replay panel as it was: no text means this page\'s own address', async () => {
    const { w, rec } = bootShare({ clipboard: ok });
    w.eval('shareCopyLink(null)');
    await flush();
    expect(rec.copied).toEqual(['http://localhost/']);
  });

  it('names the production address exactly once in the script, as the one constant it hands over', () => {
    const script = HTML.slice(HTML.indexOf('<script>'));
    expect(script.match(/smash-delta\.vercel\.app/g), 'one constant, no scattered copies').toHaveLength(1);
    expect(script).toMatch(/const SHARE_URL = 'https:\/\/smash-delta\.vercel\.app\/';/);
  });
});

describe('no share control in a match', () => {
  // The owner's rule: no text on screen in matches except GO!, KOs, boss telegraphs and Boss Rush cards. A share control
  // belongs to the title and the result screen, never to the HUD, the pause card, the boss cards, or a banner.
  const shareish = (el) => /share/i.test(el.getAttribute('onclick') || '') || /share/i.test(el.id || '');
  const notCode = (el) => el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE';

  it('puts every share control inside a menu screen (the lobby\'s "share the room code" line is one), and nowhere a match is drawn', () => {
    const { doc } = bootShare();
    const found = [...doc.body.querySelectorAll('*')].filter(notCode)
      .filter((el) => shareish(el) || (el.children.length === 0 && /\bshare\b/i.test(el.textContent)));
    expect(found.length, 'there are share controls to check').toBeGreaterThan(1);
    for (const el of found) expect(el.closest('.screen'), `${el.tagName}#${el.id} is outside every menu screen`).toBeTruthy();
    // ...and the two this feature adds are on the two screens it names
    expect(doc.getElementById('shareBtn').closest('#title')).toBeTruthy();
    expect(doc.getElementById('resultShare').closest('#result')).toBeTruthy();
  });

  it('shows no screen at all while a match runs, and nothing share-like in the HUD, the pause card or the boss card', () => {
    const { w, doc } = bootShare();
    w.eval("SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.items=false; beginMatchNow();");
    for (let i = 0; i < 90; i++) w.eval('step()');
    expect(w.eval('running'), 'the match is running').toBe(true);
    expect([...doc.querySelectorAll('.screen.active')].map((s) => s.id), 'no menu screen is up during a match').toEqual([]);
    expect(doc.getElementById('hud').classList.contains('active')).toBe(true);
    for (const id of ['hud', 'pauseCard', 'rushVictory']) {
      const inside = [...doc.getElementById(id).querySelectorAll('*')].filter((el) => shareish(el) || /\bshare|copied\b/i.test(el.textContent));
      expect(inside.map((el) => el.outerHTML.slice(0, 60)), `share UI inside #${id}`).toEqual([]);
    }
  });

  it('the Boss Rush victory card (a card that is allowed in a match) has no share control, and no match banner says share or copied', () => {
    const { w, doc } = bootShare();
    const said = JSON.parse(w.eval(`(function(){ var out = [], _b = banner; banner = function(t, m, k, l){ out.push(String(t)); return _b(t, m, k, l); };
      try {
        SETTINGS.mode='boss'; SETTINGS.count=2; SETTINGS.stocks=3; SETTINGS.itemRate=0; SETTINGS.items=false; beginMatchNow();
        for (var i = 0; i < 300; i++) step();
        showRushVictory(0);
      } finally { banner = _b; }
      return JSON.stringify(out); })()`));
    expect(doc.getElementById('rushVictory').style.display, 'the card is up').toBe('flex');
    expect(doc.getElementById('rushVictory').querySelectorAll('[onclick*="hare"]'), 'only Keep Going and Finish').toHaveLength(0);
    expect([...doc.getElementById('rushVictory').querySelectorAll('button')].map((b) => b.textContent.trim())).toEqual(['Keep Going ▶', 'Finish']);
    expect(said.filter((t) => /share|copied/i.test(t))).toEqual([]);
  });
});
