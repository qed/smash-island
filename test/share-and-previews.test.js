import { describe, it, expect, vi } from 'vitest';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
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

// Most tests here boot the whole game (a 3 MB page) in jsdom: about a second on a quiet machine, several on a busy one. The
// default 5 s per test is what a loaded CI box or a laptop mid-benchmark trips over, so this file allows itself a minute.
vi.setConfig({ testTimeout: 60000 });

const SITE = 'https://smashisland.vercel.app/';
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

  it('wraps instead of overflowing: the controls wrap (no fixed widths, rows may wrap)', () => {
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
    expect(script.match(/smashisland\.vercel\.app/g), 'one constant, no scattered copies').toHaveLength(1);
    expect(script).toMatch(/const SHARE_URL = 'https:\/\/smashisland\.vercel\.app\/';/);
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

// ---- brag cards ---------------------------------------------------------------------------------------------------------
// A Boss Rush clear and the Daily each leave a small record; the result screen's Share button turns into "Share result" and hands
// over one line about it. The line is the one place the game talks about the player's own deeds in public, so it is held to the
// secrecy rule harder than anything else in this file.
const sharedText = (rec) => rec.shared[0] && rec.shared[0].text;
const fullLine = (card) => card.text + ' ' + card.url;
const BRAG = (w) => JSON.parse(w.eval('JSON.stringify(SHARE_BRAG)'));

// Plays the real Boss Rush clear path: the last boss goes down inside bossRushCheck, exactly as in a run.
function clearBossRush(w, { you = 'Firey', stocks = 1, secs = 872 } = {}) {
  w.eval(`(function(){
    SETTINGS.mode='boss'; SETTINGS.count=1; SETTINGS.stocks=3; SETTINGS.itemRate=0; SETTINGS.items=false;
    chosen = ROSTER.find(function(r){ return r.name===${JSON.stringify(you)}; });
    beginMatchNow();
    BOSSRUSH.bossIdx = BOSS_ROSTER.length - 1; BOSSRUSH.cleared = BOSS_ROSTER.length - 1; BOSSRUSH.frames = ${secs * 60};
    summons = []; spawnBossRushBoss();
    fighters[0].stocks = ${stocks};
    var boss = summons.find(function(s){ return s.type==='boss' && s._bossRush; }); boss.hp = 0;
    bossRushCheck();
  })()`);
}
// Plays the real end of a Daily: today's matchup is replaced by the one named, everything after is the game's own checkWin.
function playDaily(w, { you = 'Firey', foe = 'Pin', outcome = 'win' } = {}) {
  w.eval(`(function(){
    DAILY_ACTIVE = true; DAILY_LOAN = { pick: chosen, mode:SETTINGS.mode, count:SETTINGS.count, stocks:SETTINGS.stocks, itemRate:SETTINGS.itemRate };
    chosen = ROSTER.find(function(r){ return r.name===${JSON.stringify(you)}; });
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.stocks=2; SETTINGS.itemRate=0; SETTINGS.items=false;
    PENDING_DAILY = ROSTER.find(function(r){ return r.name===${JSON.stringify(foe)}; });
    beginMatchNow();
    var y = fighters.find(function(f){ return f.you; }), o = fighters.find(function(f){ return !f.you; });
    if('${outcome}' !== 'loss'){ o.stocks = 0; o.dead = true; }
    if('${outcome}' !== 'win'){ y.stocks = 0; y.dead = true; }
    checkWin();
  })()`);
}
const labelOf = (doc) => doc.getElementById('resultShare').textContent;

describe('brag cards: the lines', () => {
  const { window: W } = loadMonolith();
  const line = (record) => { const c = JSON.parse(W.eval(`JSON.stringify(shareBragCard(${JSON.stringify(record)}))`)); return { ...c, full: fullLine(c) }; };

  it('says a Boss Rush clear the way the owner\'s example does', () => {
    const c = line({ kind: 'rush', you: 'Firey', bosses: 12, secs: 14 * 60 + 32, stocks: 2 });
    expect(c.full).toBe('I cleared Boss Rush in Battle for Smash Island as Firey: 12 bosses in 14:32, 2 stocks left. Free to play: https://smashisland.vercel.app/');
  });

  it('counts one stock as "1 stock", and drops the stock clause when it is unknown or none', () => {
    expect(line({ kind: 'rush', you: 'Leafy', bosses: 12, secs: 600, stocks: 1 }).text).toMatch(/, 1 stock left\. Free to play:$/);
    for (const stocks of [null, undefined, 0]) {
      const t = line({ kind: 'rush', you: 'Leafy', bosses: 12, secs: 600, stocks }).text;
      expect(t, `stocks=${stocks}`).toBe('I cleared Boss Rush in Battle for Smash Island as Leafy: 12 bosses in 10:00. Free to play:');
    }
  });

  it('writes the time as m:ss, with the seconds padded', () => {
    expect(line({ kind: 'rush', you: 'Pen', bosses: 12, secs: 61, stocks: 3 }).text).toContain('in 1:01,');
    expect(line({ kind: 'rush', you: 'Pen', bosses: 12, secs: 3725, stocks: 3 }).text).toContain('in 62:05,');
  });

  it('says a won Daily the way the owner\'s example does', () => {
    expect(line({ kind: 'daily', n: 56, won: true, you: 'Firey', foe: 'Pin' }).full)
      .toBe('Battle for Smash Island Daily #56: won as Firey vs Pin. Can you? https://smashisland.vercel.app/');
  });

  it('says a lost Daily honestly: it says lost, and it still invites you', () => {
    const l = line({ kind: 'daily', n: 56, won: false, you: 'Firey', foe: 'Pin' });
    expect(l.full).toBe('Battle for Smash Island Daily #56: lost as Firey vs Pin. Can you do better? https://smashisland.vercel.app/');
    expect(l.text).not.toMatch(/\bwon\b/);
  });

  it('says a drawn Daily as a draw', () => {
    expect(line({ kind: 'daily', n: 9, won: null, you: 'Firey', foe: 'Pin' }).text).toBe('Battle for Smash Island Daily #9: drew as Firey vs Pin. Can you win it?');
  });

  it('numbers the Daily from the day it shipped, in UTC, the way the Daily itself is dated', () => {
    const n = (y, m, d) => W.eval(`dailyNumber(new Date(Date.UTC(${y}, ${m}, ${d}, 23, 59)))`);
    expect(n(2026, 7, 11), 'the first Daily').toBe(1);
    expect(n(2026, 7, 12)).toBe(2);
    expect(n(2026, 9, 5), '2026-10-05').toBe(56);
    expect(n(2026, 7, 1), 'never below 1').toBe(1);
  });

  it('hands the share sheet the line and the link as separate fields, and the clipboard both together', () => {
    const c = line({ kind: 'rush', you: 'Firey', bosses: 12, secs: 872, stocks: 2 });
    expect(Object.keys(c).sort()).toEqual(['copy', 'full', 'text', 'title', 'url']);
    expect(c.title).toBe('Battle for Smash Island');
    expect(c.url).toBe(SITE);
    expect(c.text, 'a share sheet that joins text and url must not show the link twice').not.toContain(SITE);
    expect(c.copy, 'the clipboard gets the line and the link').toBe(`${c.text} ${SITE}`);
    expect(c.copy.split(SITE)).toHaveLength(2);
  });

  it('names a fighter who is not a secret, in either seat', () => {
    for (const name of ['Firey', 'Leafy', 'Pencil', 'Blocky', 'Ice Cube', 'Match', 'Pen', 'Test Tube', 'Lightning']) {
      expect(line({ kind: 'rush', you: name, bosses: 12, secs: 60, stocks: 1 }).text, name).toContain(`as ${name}:`);
      expect(line({ kind: 'daily', n: 3, won: true, you: 'Firey', foe: name }).text, name).toContain(`vs ${name}.`);
    }
  });
});

describe('brag cards: no secret is ever named', () => {
  const { window: W } = loadMonolith();
  const line = (record) => { const c = JSON.parse(W.eval(`JSON.stringify(shareBragCard(${JSON.stringify(record)}))`)); return fullLine(c); };

  it.each(SECRET_NAMES)('"%s": a Boss Rush clear as them says "a secret fighter", never the name', (name) => {
    const t = line({ kind: 'rush', you: name, bosses: 12, secs: 872, stocks: 2 });
    expect(t).toContain('as a secret fighter:');
    expect(leaks(t), t).toEqual([]);
  });

  it.each(SECRET_NAMES)('"%s": a Daily played as them, or against them, says "a secret fighter", never the name', (name) => {
    for (const won of [true, false, null]) {
      const as = line({ kind: 'daily', n: 12, won, you: name, foe: 'Pin' });
      const vs = line({ kind: 'daily', n: 12, won, you: 'Firey', foe: name });
      expect(as, as).toMatch(/ as a secret fighter vs Pin\./);
      expect(vs, vs).toMatch(/ as Firey vs a secret fighter\./);
      expect(leaks(as), as).toEqual([]);
      expect(leaks(vs), vs).toEqual([]);
    }
  });

  it('says "a secret fighter" for any name the game does not list, rather than echo it', () => {
    expect(line({ kind: 'rush', you: 'Zorp', bosses: 12, secs: 60, stocks: 1 })).toContain('as a secret fighter:');
    expect(line({ kind: 'rush', you: '', bosses: 12, secs: 60, stocks: 1 })).toContain('as a secret fighter:');
  });

  it('never says how anything is unlocked, however the line is built', () => {
    const records = [
      { kind: 'rush', you: 'Firey', bosses: 12, secs: 872, stocks: 2 },
      { kind: 'rush', you: 'Lightning', bosses: 24, secs: 1900, stocks: 1 },   // two laps, as the chain asks of Lightning: still no word about it
      { kind: 'rush', you: 'Needle', bosses: 12, secs: 872, stocks: 2 },
      { kind: 'daily', n: 56, won: true, you: 'Firey', foe: 'Gelatin' },
      { kind: 'daily', n: 56, won: false, you: 'Lightning', foe: 'OJ' },
    ];
    for (const r of records) {
      const t = line(r);
      expect(t, t).not.toMatch(/\b(vault|unlock(ed|s)?|secret boss|code|loop|lap|moon|chain|prize|hidden)\b/i);
      expect(t, t).not.toMatch(/\b(One|Steve Cobs|Cobs)\b/);
    }
  });

  it('keeps every secret in the player\'s own seat out of the share sheet and the clipboard too (a real tap)', async () => {
    const { w, rec, doc } = bootShare({ share: ok });   // one boot; each name is armed in turn and the same share sheet records every tap
    const names = ['Needle', 'Gelatin', 'OJ', 'Cabby', 'Steve Cobs', 'One'];
    for (const name of names) {
      w.eval(`SHARE_BRAG = { kind:'daily', n:56, won:true, you:${JSON.stringify(name)}, foe:'Pin' }`);
      w.eval("go('result')");   // (a go() to the result screen re-syncs the button; leaving it would drop the line)
      doc.getElementById('resultShare').click();
      await flush();
    }
    expect(rec.shared).toHaveLength(names.length);
    rec.shared.forEach((d, i) => {
      expect(leaks([d.title, d.text, d.url].join('\n')), `${names[i]}: ${d.text}`).toEqual([]);
      expect(d.text).toContain('as a secret fighter');
    });
  });
});

describe('brag cards: after a Boss Rush clear', () => {
  it('offers "Share result" with the clear\'s own numbers on the result screen', async () => {
    const { w, rec, doc } = bootShare({ share: ok, clipboard: ok });
    clearBossRush(w, { you: 'Firey', stocks: 1, secs: 872 });
    const b = BRAG(w);
    expect(b.kind).toBe('rush');
    const bosses = w.eval('BOSS_ROSTER.length');
    expect(b.bosses, 'every boss is counted').toBe(bosses);
    expect(b.secs).toBe(872);
    const stocksNow = w.eval('fighters[0].stocks');
    // finish from the victory card, as a player does
    w.eval('rushFinish()');
    expect(doc.getElementById('result').classList.contains('active')).toBe(true);
    expect(labelOf(doc)).toBe('📣 Share result');
    doc.getElementById('resultShare').click();
    await flush();
    expect(rec.shared).toHaveLength(1);
    expect(rec.shared[0].text).toBe(`I cleared Boss Rush in Battle for Smash Island as Firey: ${bosses} bosses in 14:32, ${stocksNow} ${stocksNow === 1 ? 'stock' : 'stocks'} left. Free to play:`);
    expect(rec.shared[0].url).toBe(SITE);
    expect(rec.shared[0].title).toBe('Battle for Smash Island');
  });

  it('copies the line and the link together where there is no share sheet, and says Copied!', async () => {
    const { w, rec, doc } = bootShare({ clipboard: ok });
    clearBossRush(w);
    w.eval('rushFinish()');
    const btn = doc.getElementById('resultShare');
    btn.click();
    await flush();
    expect(rec.copied).toHaveLength(1);
    expect(rec.copied[0]).toMatch(/^I cleared Boss Rush in Battle for Smash Island as Firey: \d+ bosses in 14:32, \d+ stocks? left\. Free to play: https:\/\/smashisland\.vercel\.app\/$/);
    expect(btn.textContent).toBe('✓ Copied!');
    rec.timers.forEach((t) => t());
    expect(btn.textContent, 'and puts "Share result" back').toBe('📣 Share result');
  });

  it('still offers the clear after Keep Going and a later defeat', async () => {
    const { w, rec, doc } = bootShare({ share: ok });
    clearBossRush(w);
    w.eval('rushKeepGoing()');
    // the next lap: everyone falls
    w.eval('fighters.forEach(function(f){ f.dead = true; f.stocks = 0; }); bossRushCheck();');
    rec.timers.forEach((t) => t());   // the defeat card goes to the result screen after 800 ms
    expect(doc.getElementById('result').classList.contains('active')).toBe(true);
    expect(doc.getElementById('resultTitle').textContent).toBe('Defeated');
    expect(labelOf(doc)).toBe('📣 Share result');
    doc.getElementById('resultShare').click();
    await flush();
    expect(sharedText(rec)).toMatch(/^I cleared Boss Rush in Battle for Smash Island as Firey: /);
  });

  it('offers only the plain Share after a defeat that never cleared the run', async () => {
    const { w, rec, doc } = bootShare({ share: ok });
    w.eval(`SETTINGS.mode='boss'; SETTINGS.count=1; SETTINGS.stocks=1; SETTINGS.itemRate=0; SETTINGS.items=false; beginMatchNow();
            fighters.forEach(function(f){ f.dead = true; f.stocks = 0; }); bossRushCheck();`);
    rec.timers.forEach((t) => t());
    expect(doc.getElementById('resultTitle').textContent).toBe('Defeated');
    expect(BRAG(w)).toBeNull();
    expect(labelOf(doc)).toBe('📣 Share');
    doc.getElementById('resultShare').click();
    await flush();
    expect(rec.shared[0].text, 'the plain pitch, not a brag').toMatch(/^Battle for Smash Island is a free, fan-made/);
  });

  it('forgets the clear when the next match starts, and when the result screen is left', () => {
    const { w, doc } = bootShare();
    clearBossRush(w);
    w.eval('rushFinish()');
    expect(BRAG(w)).toBeTruthy();
    w.eval("go('title')");
    expect(BRAG(w), 'left for the title').toBeNull();
    clearBossRush(w);
    expect(BRAG(w)).toBeTruthy();
    w.eval("SETTINGS.mode='ffa'; SETTINGS.count=2; beginMatchNow();");
    expect(BRAG(w), 'a new match').toBeNull();
    w.eval("go('result')");
    expect(labelOf(doc)).toBe('📣 Share');
  });

  it('is not armed in a match that is not a clear: nothing is left behind mid-run', () => {
    const { w } = bootShare();
    w.eval(`SETTINGS.mode='boss'; SETTINGS.count=1; SETTINGS.stocks=3; SETTINGS.itemRate=0; SETTINGS.items=false; beginMatchNow();
            for (var i = 0; i < 200; i++) step();`);
    expect(BRAG(w)).toBeNull();
  });
});

describe('brag cards: after the Daily', () => {
  it('offers "Share result" after a won Daily and tells it as a win', async () => {
    const { w, rec, doc } = bootShare({ share: ok });
    playDaily(w, { you: 'Firey', foe: 'Pin', outcome: 'win' });
    rec.timers.forEach((t) => t());   // showResult runs 700 ms after the win
    expect(doc.getElementById('result').classList.contains('active')).toBe(true);
    expect(labelOf(doc)).toBe('📣 Share result');
    doc.getElementById('resultShare').click();
    await flush();
    const n = w.eval('dailyNumber()');
    expect(sharedText(rec)).toBe(`Battle for Smash Island Daily #${n}: won as Firey vs Pin. Can you?`);
    expect(rec.shared[0].url).toBe(SITE);
  });

  it('tells a lost Daily as a loss', async () => {
    const { w, rec, doc } = bootShare({ share: ok });
    playDaily(w, { you: 'Firey', foe: 'Pin', outcome: 'loss' });
    rec.timers.forEach((t) => t());
    expect(labelOf(doc)).toBe('📣 Share result');
    doc.getElementById('resultShare').click();
    await flush();
    expect(sharedText(rec)).toMatch(/: lost as Firey vs Pin\. Can you do better\?$/);
  });

  it('tells a drawn Daily as a draw', async () => {
    const { w, rec, doc } = bootShare({ share: ok });
    playDaily(w, { you: 'Firey', foe: 'Pin', outcome: 'draw' });
    rec.timers.forEach((t) => t());
    doc.getElementById('resultShare').click();
    await flush();
    expect(sharedText(rec)).toMatch(/: drew as Firey vs Pin\./);
  });

  it('says "a secret fighter" when the Daily\'s opponent is a Vault fighter', async () => {
    const { w, rec, doc } = bootShare({ share: ok });
    playDaily(w, { you: 'Firey', foe: 'Gelatin', outcome: 'win' });
    rec.timers.forEach((t) => t());
    doc.getElementById('resultShare').click();
    await flush();
    expect(sharedText(rec)).toMatch(/: won as Firey vs a secret fighter\. Can you\?$/);
    expect(leaks(sharedText(rec))).toEqual([]);
  });

  it('works through the real startDailyMatch, whoever today\'s pair is, and never names a secret', async () => {
    const { w, rec, doc } = bootShare({ share: ok });
    w.eval(`startDailyMatch(); var y = fighters.find(function(f){ return f.you; }), o = fighters.find(function(f){ return !f.you; });
            o.stocks = 0; o.dead = true; checkWin();`);
    rec.timers.forEach((t) => t());
    expect(labelOf(doc)).toBe('📣 Share result');
    doc.getElementById('resultShare').click();
    await flush();
    expect(sharedText(rec)).toMatch(/^Battle for Smash Island Daily #\d+: won as .+ vs .+\. Can you\?$/);
    expect(leaks(sharedText(rec)), sharedText(rec)).toEqual([]);
  });

  it('forgets the Daily\'s line once the next match begins: a Rematch is an ordinary match with a plain Share', () => {
    const { w, rec, doc } = bootShare();
    playDaily(w, { you: 'Firey', foe: 'Pin', outcome: 'win' });
    rec.timers.forEach((t) => t());
    expect(BRAG(w)).toBeTruthy();
    w.eval("SETTINGS.mode='ffa'; SETTINGS.count=2; beginMatchNow();");
    expect(BRAG(w)).toBeNull();
    w.eval("go('result')");
    expect(labelOf(doc)).toBe('📣 Share');
  });

  it('keeps the plain "Share" after an ordinary match', () => {
    const { w, rec, doc } = bootShare();
    w.eval(`SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.stocks=1; SETTINGS.itemRate=0; SETTINGS.items=false; beginMatchNow();
            var o = fighters.find(function(f){ return !f.you; }); o.stocks = 0; o.dead = true; checkWin();`);
    rec.timers.forEach((t) => t());
    expect(doc.getElementById('result').classList.contains('active')).toBe(true);
    expect(BRAG(w)).toBeNull();
    expect(labelOf(doc)).toBe('📣 Share');
  });
});

// ---- search basics ------------------------------------------------------------------------------------------------------
const LD_EL = HEAD.querySelector('script[type="application/ld+json"]');
const noCR = (s) => s.replace(/\r/g, '');   // a Windows checkout may carry CRLF; the files are served as LF either way

describe('search basics: the canonical link', () => {
  it('has exactly one, absolute, https, and it is the production address', () => {
    const links = [...HEAD.querySelectorAll('link[rel="canonical"]')];
    expect(links, 'one canonical link').toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe(SITE);
    expect(links[0].getAttribute('href')).toBe(meta('property', 'og:url'));
  });
});

describe('search basics: structured data (JSON-LD)', () => {
  const ld = () => JSON.parse(LD_EL.textContent);

  it('is one JSON-LD block in the head, and it parses', () => {
    expect(HEAD.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(1);
    expect(() => ld()).not.toThrow();
  });

  it('describes a VideoGame with the fields the owner asked for', () => {
    const d = ld();
    expect(d['@context']).toBe('https://schema.org');
    expect(d['@type']).toBe('VideoGame');
    expect(d.name).toBe('Battle for Smash Island');
    expect(d.url).toBe(SITE);
    expect(d.genre, 'a genre').toBeTruthy();
    expect([].concat(d.genre).every((g) => typeof g === 'string' && g.length > 2)).toBe(true);
    expect(d.gamePlatform).toBe('Web browser');
    expect(d.applicationCategory).toBe('Game');
    expect(d.isAccessibleForFree).toBe(true);
    expect(d.offers['@type']).toBe('Offer');
    expect(Number(d.offers.price), 'free').toBe(0);
    expect(d.offers.priceCurrency).toBe('USD');
  });

  it('says it is an unofficial fan game, and matches what the link previews say', () => {
    const d = ld();
    expect(d.description).toMatch(/unofficial fan game/);
    expect(d.description).toMatch(/free/i);
    expect(d.description).toMatch(/100\+ fighters/);
    expect(d.image, 'the same picture as the link preview').toBe(meta('property', 'og:image'));
  });

  it('names no person: no author, publisher or creator, and nothing shaped like a person or an email', () => {
    const d = ld();
    const PEOPLE = ['author', 'creator', 'publisher', 'producer', 'developer', 'copyrightHolder', 'contributor', 'maintainer', 'sponsor', 'provider', 'funder', 'editor', 'translator'];
    expect(PEOPLE.filter((k) => k in d)).toEqual([]);
    const types = [];
    (function walk(o) { if (o && typeof o === 'object') { if (o['@type']) types.push(o['@type']); Object.values(o).forEach(walk); } })(d);
    expect(types.filter((t) => /^(Person|Organization)$/.test(t)), 'no person or organisation').toEqual([]);
    expect(LD_EL.textContent).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  });

  it('is data the page never runs or reads', () => {
    const script = HTML.slice(HTML.indexOf('<script>'));
    expect(script).not.toMatch(/ld\+json/);
  });
});

describe('search basics: robots.txt and sitemap.xml', () => {
  const robots = () => noCR(readFileSync(join(PUBLISH, 'robots.txt'), 'utf8'));
  const sitemap = () => noCR(readFileSync(join(PUBLISH, 'sitemap.xml'), 'utf8'));

  it('robots.txt lets every crawler in and names the sitemap at the production address', () => {
    const r = robots();
    expect(r).toMatch(/^User-agent: \*$/m);
    expect(r).toMatch(/^Allow: \/$/m);
    expect(r, 'allow all: nothing is disallowed').not.toMatch(/^Disallow:\s*\S/m);
    expect(r).toMatch(/^Sitemap: https:\/\/smashisland\.vercel\.app\/sitemap\.xml$/m);
  });

  it('sitemap.xml is a valid urlset with the one production page', () => {
    const doc = new JSDOM(sitemap(), { contentType: 'application/xml' }).window.document;
    expect(doc.documentElement.localName).toBe('urlset');
    expect(doc.documentElement.namespaceURI).toBe('http://www.sitemaps.org/schemas/sitemap/0.9');
    const locs = [...doc.getElementsByTagName('loc')].map((e) => e.textContent.trim());
    expect(locs).toEqual([SITE]);
  });

  it('the canonical link, og:url, the JSON-LD, the sitemap and robots.txt all agree on one address', () => {
    const urls = new Set([
      HEAD.querySelector('link[rel="canonical"]').getAttribute('href'),
      meta('property', 'og:url'),
      JSON.parse(LD_EL.textContent).url,
      sitemap().match(/<loc>([^<]+)<\/loc>/)[1].trim(),
      robots().match(/^Sitemap: (\S+)\/sitemap\.xml$/m)[1] + '/',
    ]);
    expect([...urls]).toEqual([SITE]);
  });

  it('names no secret and no person (they are read by every crawler)', () => {
    for (const text of [robots(), sitemap()]) {
      expect(leaks(text)).toEqual([]);
      expect(text).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    }
  });
});

describe('search basics: vercel.json serves them', () => {
  const VERCEL = JSON.parse(readFileSync('vercel.json', 'utf8'));
  const PATHS = ['/robots.txt', '/sitemap.xml', '/og-image.png', '/'];

  it('publishes artifacts/V1 as the site root, so a file beside index.html is served at its own path', () => {
    expect(VERCEL.outputDirectory).toBe(PUBLISH);
    for (const f of ['index.html', 'robots.txt', 'sitemap.xml', 'og-image.png']) expect(existsSync(join(VERCEL.outputDirectory, f)), f).toBe(true);
  });

  it('has no rewrite, redirect, route or header rule that could catch them, and no clean-URL rewriting', () => {
    for (const key of ['rewrites', 'redirects', 'routes', 'headers']) {
      for (const rule of VERCEL[key] || []) {
        const src = String(rule.source ?? rule.src ?? '');
        for (const p of PATHS) {
          const hit = (() => { try { return new RegExp('^' + src.replace(/\(\.\*\)|\*/g, '.*') + '$').test(p); } catch (e) { return true; } })();
          expect(hit, `${key} rule "${src}" would catch ${p}`).toBe(false);
        }
      }
    }
    expect(VERCEL.cleanUrls, 'cleanUrls would redirect /index.html').not.toBe(true);
  });

  it('has no serverless function in api/ that shadows a static file', () => {
    const api = readdirSync('api').map((f) => f.replace(/\.[^.]+$/, ''));
    for (const name of ['robots', 'sitemap', 'og-image', 'index']) expect(api, name).not.toContain(name);
  });
});
