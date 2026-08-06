import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadMonolith } from './helpers/load-monolith.js';

// Workstream 0 (Unit 2) — the deploy blocker.
//
// The monolith shipped a title-screen `sk-ant-...` password field feeding planLLM(), a call that
// omits x-api-key, anthropic-version, and the browser-access header and therefore could never
// succeed. On a public, child-facing URL that reads as phishing.
//
// The FIRST version of this gate checked only four tokens (sk-ant, api.anthropic.com, PLAN_KEY,
// fonts.googleapis.com) and passed while a `🔑 API key` button, a "Team chat needs a Claude API
// key to start" warning, and two key-note strings were still rendered — none of them contain any
// of those four tokens. That near-miss is why this gate is token-broad AND checks handler
// integrity: deleting planSetKey() without deleting the button that calls it leaves a live
// control that throws on click, which no text search would catch.

// Scope the gate to the DEPLOY UNIT, never to one filename. Vercel serves every file under
// outputDirectory, so a stray sibling is publicly reachable at its own URL. An earlier version of
// this gate pinned 'artifacts/V1/index.html' and passed green while artifacts/V1 also contained
// battle-for-smash-island.html — a second, un-stripped copy of the whole game carrying the live
// sk-ant field. Same class of miss as the four-token version, one level up: the check was
// narrower than the thing it guards.
const PUBLISH_ROOT = JSON.parse(readFileSync('vercel.json', 'utf8')).outputDirectory;
// Walk the WHOLE publish tree, not just its top level, and normalise to forward slashes so the
// pins below read the same on Windows and CI. The root gained an assets/ directory when background
// music landed and a second subtree when sprite art landed; a top-level-only listing would have
// pinned "assets" as one opaque name and stopped noticing anything dropped inside it — which is the
// exact blind spot this gate exists to close, since Vercel serves every one of those files at its
// own public URL. `assets/` has to live here — music and sprite art are fetched relative to
// index.html — so the pins below name what may appear inside it rather than banning it outright.
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p.replace(/\\/g, '/')];
  });
}
const PUBLISHED_FILES = walk(PUBLISH_ROOT);
const PUBLISHED_HTML = PUBLISHED_FILES.filter((f) => f.endsWith('.html'));
const SOURCE = join(PUBLISH_ROOT, 'index.html');
const MUSIC_DIR = `${PUBLISH_ROOT}/assets/music`;
const SPRITE_DIR = `${PUBLISH_ROOT}/assets/sprites`;

/** Tokens that must not survive anywhere in the shipped file. */
const FORBIDDEN = [
  { name: 'Anthropic key prefix', re: /sk-ant/i },
  { name: 'Anthropic vendor reference', re: /anthropic/i },
  { name: 'API-key phrasing', re: /api[ _-]?key/i },
  { name: 'PLAN_KEY state', re: /PLAN_KEY/ },
  { name: 'planSetKey handler', re: /planSetKey/ },
  { name: 'planKey DOM ids', re: /planKey(Btn|Note)/ },
  { name: 'homeKeyNote DOM id', re: /homeKeyNote/ },
  { name: 'key-surface CSS classes', re: /apikeybox|teamkeyrow|apikey-/ },
  { name: 'remote font import', re: /fonts\.googleapis\.com/i },
];

describe('Workstream 0 — credential surface is fully stripped', () => {
  it('publishes only the files we intend to serve', () => {
    // Anything dropped into the publish root becomes a public URL. Pin the contents so a stray
    // build artifact fails the suite instead of silently shipping.
    expect(PUBLISHED_FILES.slice().sort()).toEqual([
      `${MUSIC_DIR}/CREDITS.md`,
      `${MUSIC_DIR}/battle.mp3`,
      `${MUSIC_DIR}/boss.mp3`,
      `${MUSIC_DIR}/custom/README.md`,
      `${MUSIC_DIR}/intense.mp3`,
      `${MUSIC_DIR}/menu.mp3`,
      `${MUSIC_DIR}/tourney.mp3`,
      `${SPRITE_DIR}/CREDITS.md`,
      `${SPRITE_DIR}/blocky.png`,
      `${SPRITE_DIR}/bomby.png`,
      `${SPRITE_DIR}/bubble.png`,
      `${SPRITE_DIR}/firey.png`,
      `${SPRITE_DIR}/ice-cube.png`,
      `${SPRITE_DIR}/leafy.png`,
      `${SPRITE_DIR}/match.png`,
      `${SPRITE_DIR}/pen.png`,
      `${SPRITE_DIR}/pencil-angry.png`,
      `${SPRITE_DIR}/puffball.png`,
      `${SPRITE_DIR}/rocky.png`,
      `${SPRITE_DIR}/teardrop.png`,
      `${PUBLISH_ROOT}/index.html`,
    ].sort());
    // …and nothing new at the top level either, so a stray sibling directory is caught even if the
    // recursive pin above is ever relaxed to a rule.
    expect(readdirSync(PUBLISH_ROOT).sort()).toEqual(['assets', 'index.html']);
  });

  it('serves exactly one HTML entry point', () => {
    // The pin above once read `[index.html]` and caught a second, un-stripped copy of the whole
    // game sitting beside it. Widening the pin for `assets/` must not give that copy a way back
    // in, so the "one HTML file" half of the guard is asserted separately and recursively.
    expect(PUBLISHED_FILES.filter((f) => /\.html?$/i.test(f))).toEqual([`${PUBLISH_ROOT}/index.html`]);
  });

  it('confines assets/ to the music and sprite subtrees', () => {
    // Two media subtrees are sanctioned; each has its own content rule below. Anything landing
    // directly in assets/, or in a third subdirectory, belongs to neither rule and is an accident.
    const stray = walk(join(PUBLISH_ROOT, 'assets'))
      .filter((f) => !f.startsWith(`${MUSIC_DIR}/`) && !f.startsWith(`${SPRITE_DIR}/`));
    expect(stray, `unexpected files under the published assets/ tree: ${stray.join(', ')}`).toEqual([]);
  });

  it('lets nothing but sprite art and its credits into assets/sprites/', () => {
    // Sprite images are the only visual binaries the game is allowed to serve, and CREDITS.md is
    // the required record of where each one came from. Anything else here is an accident.
    const stray = walk(SPRITE_DIR)
      .filter((f) => !/\.(png|webp|svg)$/i.test(f) && !/\/CREDITS\.md$/.test(f));
    expect(stray, `unexpected files under the published sprites/ tree: ${stray.join(', ')}`).toEqual([]);
  });

  it('lets nothing but audio, its credits and the override README into assets/music/', () => {
    // Mirror of the sprite rule: audio binaries only, plus the credits record and the owner-slot
    // README. An HTML/JS file smuggled in here would be publicly reachable at its own URL.
    const stray = walk(MUSIC_DIR)
      .filter((f) => !/\.(mp3|ogg)$/i.test(f)
        && f !== `${MUSIC_DIR}/CREDITS.md`
        && f !== `${MUSIC_DIR}/custom/README.md`);
    expect(stray, `unexpected files under the published music/ tree: ${stray.join(', ')}`).toEqual([]);
  });

  it('ships no audio in the owner override folder', () => {
    // assets/music/custom/ is an empty slot the owner fills locally. A track appearing there is a
    // deliberate publishing decision — it must be credited and consciously added to the pin above,
    // never carried along by an `git add -A`.
    const stray = PUBLISHED_FILES
      .filter((f) => f.includes('/assets/music/custom/') && !f.endsWith('README.md'));
    expect(stray).toEqual([]);
  });

  it('ships a real audio file for every music context the game references', () => {
    // The game maps contexts to filenames in MUSIC_FILES. A typo'd or deleted path degrades
    // silently to the synth fallback at runtime, so the mismatch has to fail here instead.
    const src = readFileSync(SOURCE, 'utf8');
    const block = src.slice(src.indexOf('const MUSIC_FILES'));
    const paths = [...block.slice(0, block.indexOf('};')).matchAll(/'([^']*\.(?:mp3|ogg))'/g)]
      .map((m) => m[1]);
    expect(paths.length).toBe(5);
    for (const rel of paths) {
      const abs = join(PUBLISH_ROOT, rel);
      expect(PUBLISHED_FILES).toContain(abs.replace(/\\/g, '/'));
      // A 0-byte or HTML-error-page "download" is worse than a missing file: it plays as silence.
      const bytes = readFileSync(abs);
      expect(bytes.length).toBeGreaterThan(100_000);
      // MP3 frame sync or an ID3 tag — proof this is audio, not a saved error page.
      const isMp3 = bytes[0] === 0xff || bytes.slice(0, 3).toString('latin1') === 'ID3';
      expect(isMp3, `${rel} does not start with MP3 data`).toBe(true);
    }
  });

  it('credits every shipped track with a licence', () => {
    const credits = readFileSync(join(PUBLISH_ROOT, 'assets/music/CREDITS.md'), 'utf8');
    // Only the shipped section — the owner-supplied template below it repeats these field names.
    const shipped = credits.split('## Owner-supplied tracks')[0];
    for (const f of ['menu.mp3', 'battle.mp3', 'boss.mp3', 'tourney.mp3', 'intense.mp3']) {
      expect(shipped).toContain(f);
    }
    // Every entry names a licence and a source, so the deploy is defensible without this repo.
    expect(shipped.match(/Licence\*\* \|/g) || []).toHaveLength(5);
    expect(shipped.match(/\*\*Source\*\* \|/g) || []).toHaveLength(5);
  });

  it.each(PUBLISHED_HTML)('%s contains none of the forbidden credential tokens', (file) => {
    const src = readFileSync(file, 'utf8');
    const found = FORBIDDEN
      .filter(({ re }) => re.test(src))
      .map(({ name, re }) => {
        // Report the first offending line so a failure is actionable, not just "something matched".
        const line = src.split('\n').findIndex((l) => re.test(l)) + 1;
        return `${name} (${re}) at line ${line}`;
      });
    expect(found, `forbidden credential tokens still present:\n  ${found.join('\n  ')}`).toEqual([]);
  });

  it.each(PUBLISHED_HTML)('%s makes no network reference to a third-party host', (file) => {
    const src = readFileSync(file, 'utf8');
    const externals = [...src.matchAll(/https?:\/\/([^/"'\s)]+)/g)]
      .map((m) => m[1])
      .filter((host) => !/^(localhost|127\.0\.0\.1)/.test(host));
    expect([...new Set(externals)]).toEqual([]);
  });
});

// Reserved words and literals that the leading-identifier regex can still pick up.
const KEYWORDS = new Set(['if', 'else', 'return', 'var', 'let', 'const', 'new', 'typeof', 'this',
  'true', 'false', 'null', 'undefined', 'function', 'void', 'delete', 'in', 'of', 'do', 'while']);

const ON_ATTRS = ['onclick', 'onchange', 'oninput', 'onkeydown', 'onkeyup', 'onmousedown',
  'onmouseup', 'onsubmit'];

// Leading identifiers only — the head of a member expression, never a property after a dot.
// src/core/handler-coverage.js's collector deliberately matches `X(` and `X.` including members,
// so it reports NET.host() as "host"; that is too broad to assert reachability against.
function leadingIdentifiers(doc) {
  const ids = new Set();
  for (const el of doc.querySelectorAll(ON_ATTRS.map((a) => `[${a}]`).join(','))) {
    for (const a of ON_ATTRS) {
      const src = el.getAttribute(a);
      if (!src) continue;
      for (const m of src.matchAll(/(?<![.\w$])([A-Za-z_$][A-Za-z0-9_$]*)\s*[(.]/g)) {
        if (!KEYWORDS.has(m[1])) ids.add(m[1]);
      }
    }
  }
  return [...ids];
}

describe('Workstream 0 — no handler is orphaned by the strip', () => {
  it('every inline on*= identifier resolves in the page realm', () => {
    const { window: w } = loadMonolith();
    const ids = leadingIdentifiers(w.document);
    // Sanity floor, not an exact count: guards against the collector silently matching nothing
    // (a regex break would otherwise make this suite vacuously green). The strip removed four
    // inline handlers — saveHomeKey, clearHomeKey, syncTeamKey, planSetKey — so the real figure
    // sits just under 30 and will drift again as Units 10-11 add controls.
    expect(ids.length).toBeGreaterThan(20);
    // Resolve in the monolith's OWN realm, not via window[id]: top-level `let`/`const` (TESTMODE,
    // SETTINGS, …) live in the global lexical environment and are reachable by an inline handler
    // in a real browser while never appearing as window properties.
    const missing = ids.filter((id) => w.eval(`typeof ${id}`) === 'undefined');
    expect(missing, `inline handlers reference unreachable identifiers: ${missing.join(', ')}`).toEqual([]);
  });

  it('retains the scripted teammate planner that replaces the removed LLM path', () => {
    const { window: w } = loadMonolith();
    expect(typeof w.planScriptedReply).toBe('function');
    expect(typeof w.captureTeamPlan).toBe('function');
    // planLLM was the dead credential consumer; it must be gone.
    expect(typeof w.planLLM).toBe('undefined');
  });
});
