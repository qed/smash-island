import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

// The installable desktop app.
//
// This was requested in the very first message of the project ("installable — kinda like how you
// play Hollow Knight") and has never worked. electron/main.cjs loaded `dist/`, whose entry point
// src/main.js is still `console.log('BFSI boot placeholder')`, so `npm run dist` produced an
// installer that opens a BLANK WINDOW. Every test passed the whole time, because nothing asserted
// that the thing being packaged was the game.
//
// That is the gap these close: they check the packaged artifact is REAL, not merely present.

const MAIN_RAW = readFileSync('electron/main.cjs', 'utf8');
// Strip comments before asserting on the source. The file EXPLAINS why the old third-party origin
// and the naive file:// concatenation are gone, and those explanations would otherwise trip the
// very checks that forbid them — the same trap the teamStrength no-randomness test hit.
// The `[^:]` matters: a naive //-stripper also eats the `//` in `app://game`, which is the very
// literal several of these tests assert on.
//
// SPLIT ON /\r?\n/, NOT ON '\n'. This function was silently inert on every Windows checkout: after
// splitting on '\n' each line still ended with '\r', and '\r' is a LineTerminator, so neither `.`
// nor a non-multiline `$` can cross it — the pattern matched nothing and MAIN came back byte-for-
// byte equal to MAIN_RAW. Two assertions in this file were therefore red locally and green in CI
// against identical, correct source. A test helper that no-ops on one platform is worse than no
// helper: it makes the suite's verdict depend on who ran it.
function codeOnly(src) {
  return src
    .split(/\r?\n/)
    .map((line) => line.replace(/(^|[^:])\/\/.*$/, '$1'))
    .join('\n');
}
const MAIN = codeOnly(MAIN_RAW);
const PKG = JSON.parse(readFileSync('package.json', 'utf8'));

describe('the desktop app packages the actual game', () => {
  it('points at artifacts/V1, not at the placeholder build', () => {
    expect(MAIN, 'the game lives in artifacts/V1').toMatch(/artifacts['"\s,)]+.*V1|['"]artifacts['"],\s*['"]V1['"]/);
    const loadsDist = /['"]dist['"]/.test(MAIN);
    expect(loadsDist, 'main.cjs still resolves into dist/, which is the placeholder').toBe(false);
  });

  it('ships the game directory in the installer', () => {
    const files = PKG.build.files.join(' ');
    expect(files, 'artifacts/V1 must be packaged').toContain('artifacts/V1');
    expect(files, 'electron main must be packaged').toContain('electron');
  });

  it('the file it packages is the REAL game, not a stub', () => {
    // The check that would have caught this from day one.
    const entry = 'artifacts/V1/index.html';
    expect(existsSync(entry), `${entry} exists`).toBe(true);
    const html = readFileSync(entry, 'utf8');
    expect(html.length, 'a real build is hundreds of KB, a stub is a few hundred bytes')
      .toBeGreaterThan(200000);
    expect(html, 'contains the roster').toMatch(/const ROSTER\s*=/);
    expect(html, 'contains the game loop').toMatch(/function step\(/);
    expect(html, 'is not the boot placeholder').not.toContain('BFSI boot placeholder');
  });

  it('does not build the placeholder as part of producing the installer', () => {
    expect(PKG.scripts.dist, 'dist should not run the placeholder vite build')
      .not.toMatch(/vite build/);
  });
});

describe('the custom origin resolves assets correctly', () => {
  // app://index.html parses index.html as the HOSTNAME with a path of "/", so a relative asset
  // resolves to app://index.html/assets/... and is looked up at artifacts/V1/index.html/assets/...
  // Every sprite, track and font would 404. The host must be fixed and the file must be in the PATH.
  it('uses a fixed host with the file in the path', () => {
    expect(MAIN, 'loads a host-qualified URL').toMatch(/app:\/\/game\/index\.html|\$\{ORIGIN\}\/index\.html/);
    expect(MAIN, 'the origin is host-based').toMatch(/app:\/\/game/);
  });

  it('resolves a relative asset to a real file on disk', () => {
    // Replay the handler's mapping for an asset the game actually requests.
    const GAME_ROOT = path.join(process.cwd(), 'artifacts', 'V1');
    const url = new URL('app://game/assets/sprites/firey.png');
    expect(url.hostname).toBe('game');
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const file = path.normalize(path.join(GAME_ROOT, rel));
    expect(existsSync(file), `${rel} must resolve to a real file`).toBe(true);
  });

  it('cannot be walked out of the game directory', () => {
    const GAME_ROOT = path.join(process.cwd(), 'artifacts', 'V1');
    // URL parsing collapses '..' before the handler ever sees it, so the traversal never forms.
    const url = new URL('app://game/../../package.json');
    expect(url.pathname, 'URL normalisation already flattens the traversal').toBe('/package.json');
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const file = path.normalize(path.join(GAME_ROOT, rel));
    expect(file.startsWith(GAME_ROOT), 'and it still lands inside the game root').toBe(true);
    // …and main.cjs carries an explicit guard anyway, as defence in depth.
    expect(MAIN, 'explicit containment check present').toContain('startsWith(GAME_ROOT');
  });

  it('builds a valid file URL on Windows', () => {
    // 'file://' + 'C:\Users\...' is not a valid URL; pathToFileURL is required.
    expect(MAIN, 'uses pathToFileURL rather than string concatenation').toContain('pathToFileURL');
    // Strip comments before matching. This assertion was RED on main against correct code: the file
    // documents the bug it fixed ("pathToFileURL, not 'file://' + file"), and the prose describing
    // the anti-pattern matched the regex looking for the anti-pattern. A source scan that reads
    // comments as code fails on exactly the files that explain themselves best.
    expect(codeOnly(MAIN), "no naive 'file://' + path concatenation").not.toMatch(/['"]file:\/\/['"]\s*\+/);
  });
});

describe('the desktop CSP matches what the game actually needs', () => {
  it('allows blob: for the share-clip GIF and the match recording', () => {
    expect(MAIN, 'img-src blob: for the generated GIF').toMatch(/img-src[^;]*blob:/);
    expect(MAIN, 'media-src blob: for the .webm replay').toMatch(/media-src[^;]*blob:/);
  });

  // RETARGETED when the thinking teammate landed. The old assertion was "no third-party origin at
  // all", written when the game had no remote call to make. It now has one — the desktop build has
  // no /api/strategy behind it, so an owner-supplied token talking straight to the model is the only
  // path available here. The guarantee that actually matters is unchanged and is asserted below:
  // ONE origin, named, and no second one may be added without this test failing.
  it('allows exactly one third-party origin, and only in connect-src', () => {
    const connect = codeOnly(MAIN).match(/"connect-src[^"]*"/);
    expect(connect, 'a connect-src directive is present').toBeTruthy();
    const hosts = [...codeOnly(MAIN).matchAll(/https?:\/\/([^/"'\s;]+)/g)].map((m) => m[1]);
    expect([...new Set(hosts)]).toEqual(['api.anthropic.com']);
    // and it is confined to connect-src — never script-src, never default-src.
    expect(connect[0]).toContain('https://api.anthropic.com');
    expect(codeOnly(MAIN)).toMatch(/default-src 'self'/);
    expect(codeOnly(MAIN)).not.toMatch(/(script|default|style|img|media|font)-src[^;"]*api\.anthropic\.com/);
  });

  it('never hardcodes a credential of its own', () => {
    // The desktop app supplies no key. Whatever reaches the model comes from the player's own
    // Advanced box at runtime; nothing key-shaped may be baked into the shipped binary.
    expect(MAIN).not.toMatch(/sk-ant-[A-Za-z0-9_-]{6,}/);
  });
});
