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
