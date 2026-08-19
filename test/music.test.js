import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';

// Background music — the recorded loops in artifacts/V1/assets/music, wired under the existing
// Sound toggle. Several properties here are load-bearing and easy to regress silently:
//
//  1. No <audio> element may be constructed at load time. The golden recorder and every other
//     suite boot this file in jsdom, where the media stack is unimplemented; a top-level
//     `new Audio()` would make the harness noisy at best and throwing at worst. Same for IndexedDB.
//  2. No autoplay. Browsers reject play() before a user gesture. A request made too early has to
//     be parked and replayed from the existing first-gesture unlock, not fired and lost — the
//     failure mode is a permanently silent game that looks fine in dev where the tab is focused.
//  3. A missing/undecodable source must fall through the chain, and eventually to the synth bed,
//     never to silence. The unfilled assets/music/custom/ slots make that the ORDINARY path: every
//     context 404s once before it reaches its default.
//  4. The clutch trigger must not flap. Music that switches back and forth every time a percent
//     wobbles across a threshold is worse than no feature at all.
//
// jsdom has no Web Audio, no IndexedDB, and an unimplemented HTMLMediaElement, so this boots the
// monolith with fakes for exactly those three platform pieces. The game's own music code runs
// unmodified. The Audio fake models a real server: a src that is not in `existing` fires `error`,
// which is what drives the fallback chain.

const SRC = 'artifacts/V1/index.html';
const PUB = 'artifacts/V1';
const DEFAULTS = ['menu', 'battle', 'boss', 'tourney', 'intense'].map((k) => `assets/music/${k}.mp3`);

const tick = (n = 3) => new Promise((r) => setTimeout(r, n));
// IndexedDB work crosses several macrotask hops, so sleeping a fixed number of ms is a flake
// waiting to happen on a loaded machine. Wait on the OUTCOME instead.
async function until(fn, ms = 2000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    let v; try { v = fn(); } catch (e) { v = false; }
    if (v) return v;
    await tick(5);
  }
  return fn();
}
// The title screen's chain is four sources deep — custom/title.mp3, title.mp3, custom/menu.mp3,
// menu.mp3 — and every 404 is its own macrotask hop, so "sleep 3ms and assert" is a flake waiting
// to happen. Wait for the source that should win.
const lands = (plays, src, ms = 2000) => until(() => plays().at(-1) === src, ms);

function fakeNode() {
  const ramp = { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} };
  return { gain: ramp, frequency: ramp, connect() {}, type: '', start() {}, stop() {},
    buffer: null, getChannelData: () => new Float32Array(8) };
}

/** Minimal IndexedDB good enough for MStore: open/transaction/objectStore/get/put/delete. */
function fakeIndexedDB(seed = {}) {
  const data = new Map(Object.entries(seed));
  return {
    _data: data,
    open() {
      const req = { result: null };
      req.result = {
        createObjectStore: () => ({}),
        transaction() {
          const tx = {};
          const store = {
            get: (k) => ({ result: data.get(k) }),
            put: (v, k) => { data.set(k, v); return { result: undefined }; },
            delete: (k) => { data.delete(k); return { result: undefined }; },
          };
          tx.objectStore = () => store;
          setTimeout(() => { if (tx.oncomplete) tx.oncomplete(); }, 0);
          return tx;
        },
      };
      setTimeout(() => {
        if (req.onupgradeneeded) req.onupgradeneeded();
        if (req.onsuccess) req.onsuccess();
      }, 0);
      return req;
    },
  };
}

/**
 * Boot the monolith with fake audio/storage platform bits.
 * @param opts.existing extra URLs that should "load" instead of 404ing
 * @param opts.idb      seed object for the fake IndexedDB (key = context)
 * @param opts.fadeMs   crossfade length; 0 (default) makes switches instant and assertable
 * @param opts.storage  localStorage seed, applied BEFORE the page script runs (music preference)
 */
function bootWithAudio(opts = {}) {
  const html = readFileSync(SRC, 'utf8');
  const events = [];
  const state = { gestureFired: false, constructedEarly: 0, idbTouchedAtBoot: false, oscillators: 0 };
  const existing = new Set([...DEFAULTS, ...(opts.existing || [])]);
  let blobN = 0;
  const dom = new JSDOM(html, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(window) {
      // Seeded before the page script evaluates, because SND.musicOn is read out of localStorage
      // at eval time — setting it afterwards would be too late to model a reload.
      for (const [k, v] of Object.entries(opts.storage || {})) window.localStorage.setItem(k, v);
      window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
        get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 })
          : p === 'canvas' ? { width: 1100, height: 720 }
          : p === 'getImageData' ? () => ({ data: [] })
          : String(p).startsWith('create') ? () => ({ addColorStop() {} })
          : () => {}),
        set: () => true,
      });
      window.AudioContext = class FakeAudioContext {
        constructor() {
          this.state = 'running'; this.currentTime = 0; this.sampleRate = 44100;
          this.destination = fakeNode();
        }
        createGain() { return fakeNode(); }
        // Counted so a test can prove SFX still reach the synth while music is muted.
        createOscillator() { state.oscillators += 1; return fakeNode(); }
        createBufferSource() { return fakeNode(); }
        createBiquadFilter() { return fakeNode(); }
        createBuffer() { return { getChannelData: () => new Float32Array(8) }; }
        resume() {}
      };
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
      const idb = fakeIndexedDB(opts.idb || {});
      Object.defineProperty(window, 'indexedDB', {
        configurable: true,
        get() {
          // Touching IndexedDB during script evaluation is a bug we want to catch, not tolerate.
          if (!state.gestureFired) state.idbTouchedAtBoot = true;
          return idb;
        },
      });
      window.__idb = idb;
      window.URL.createObjectURL = (blob) => {
        const u = `blob:fake/${++blobN}`;
        existing.add(u);
        window.__blobs = window.__blobs || {};
        window.__blobs[u] = blob;
        return u;
      };
      window.__revoked = [];
      window.URL.revokeObjectURL = (u) => { window.__revoked.push(u); existing.delete(u); };
      window.Audio = class SpyAudio {
        constructor() {
          if (!state.gestureFired) state.constructedEarly += 1;
          events.push(['construct', '']);
          this._src = ''; this._on = {}; this.loop = false; this.preload = '';
          this.volume = 1; this.paused = true; this.ended = false; this.currentTime = 0;
        }
        set src(v) {
          this._src = v;
          events.push(['src', v]);
          if (!existing.has(v)) {
            // Model a 404: the element reports an error shortly after the src is set.
            setTimeout(() => {
              if (this._src !== v) return;
              this.paused = true;
              (this._on.error || []).forEach((f) => f());
            }, 0);
          }
        }
        get src() { return this._src; }
        addEventListener(type, fn) { (this._on[type] = this._on[type] || []).push(fn); }
        play() { this.paused = false; events.push(['play', this._src]); return Promise.resolve(); }
        pause() { this.paused = true; events.push(['pause', this._src]); }
      };
    },
  });
  const w = dom.window;
  if (opts.fadeMs !== undefined) w.eval(`SND.fadeMs=${opts.fadeMs}`);
  else w.eval('SND.fadeMs=0');
  const plays = () => events.filter((e) => e[0] === 'play').map((e) => e[1]);
  const gesture = () => { state.gestureFired = true; w.dispatchEvent(new w.Event('pointerdown')); };
  const decks = () => w.eval('JSON.stringify(SND._decks.map(d=>d?{src:d.src,paused:d.paused,vol:d.volume}:null))');
  return { w, events, plays, gesture, state, existing, decks: () => JSON.parse(decks()) };
}

describe('background music — the file layer', () => {
  it('declares five contexts, each backed by a real default file on disk', () => {
    const { w } = bootWithAudio();
    const map = JSON.parse(w.eval('JSON.stringify(MUSIC_FILES)'));
    expect(Object.keys(map).sort()).toEqual(['battle', 'boss', 'intense', 'menu', 'tourney']);
    for (const rel of Object.values(map)) {
      expect(existsSync(`${PUB}/${rel}`), `${rel} is missing`).toBe(true);
    }
  });

  it('touches no audio and no storage at boot', () => {
    const { events, w, state } = bootWithAudio();
    expect(events).toEqual([]);
    expect(state.idbTouchedAtBoot).toBe(false);
    expect(w.eval('SND.gesture')).toBe(false);
  });

  it('never autoplays before a user gesture — it parks the request instead', () => {
    const { w, events } = bootWithAudio();
    w.eval("startMusic('menu')");
    expect(events).toEqual([]);                       // nothing constructed, nothing played
    expect(w.eval('SND._pendingKind')).toBe('menu');
  });

  it('starts the parked bed on the first gesture', async () => {
    const { w, plays, gesture, state } = bootWithAudio();
    w.eval("startMusic('menu')");
    gesture();
    await tick();
    expect(state.constructedEarly).toBe(0);
    expect(plays().at(-1)).toBe('assets/music/menu.mp3');
    const el = w.eval('JSON.stringify({loop:SND._decks[SND._deck].loop,vol:SND._decks[SND._deck].volume})');
    expect(JSON.parse(el).loop).toBe(true);
    expect(JSON.parse(el).vol).toBeGreaterThan(0);
    expect(JSON.parse(el).vol).toBeLessThan(0.6);     // sits under the SFX, not over them
  });

  it('starts the menu bed on a cold load, where nothing ever called go()', async () => {
    // The title screen carries class="active" in the HTML, so a fresh load never routes through
    // go('title') and nothing requests music. Found live: the front page sat silent until the
    // player navigated somewhere. The gesture unlock has to fall back to the active screen.
    const { w, plays, gesture } = bootWithAudio();
    expect(w.eval("document.querySelector('.screen.active').id")).toBe('title');
    gesture();                                        // first click anywhere, no navigation
    await lands(plays, 'assets/music/menu.mp3');      // via the empty title slot's fallback
    expect(plays().at(-1)).toBe('assets/music/menu.mp3');
  });

  it('does not restart the loop when moving between screens that share a bed', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture();
    await lands(plays, 'assets/music/menu.mp3');
    const n = plays().length;
    w.eval("go('select')");
    w.eval("go('controls')");
    w.eval("go('title')");
    await tick(20);
    expect(plays()).toHaveLength(n);                  // one continuous menu loop, not four restarts
  });

  it('gives each context its own track', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture();
    await tick();
    for (const kind of ['menu', 'battle', 'boss', 'tourney', 'intense']) {
      w.eval(`startMusic('${kind}')`);
      await tick();
      expect(plays().at(-1), `${kind} should end up on its default`).toBe(`assets/music/${kind}.mp3`);
    }
  });

  it('routes the tournament hub to the anthem and a real match to the battle bed', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture();
    await tick();
    w.eval("go('tourneyHub')"); await tick();
    expect(plays().at(-1)).toBe('assets/music/tourney.mp3');
    w.eval('startMatch()'); await tick();
    expect(plays().at(-1)).toBe('assets/music/battle.mp3');
    w.eval("SETTINGS.mode='boss'; beginMatchNow()"); await tick();
    expect(plays().at(-1)).toBe('assets/music/boss.mp3');
  });
});

describe('background music — the source priority chain', () => {
  it('asks for the owner custom/ slot before the shipped default, and falls through on 404', async () => {
    const { w, plays, gesture } = bootWithAudio();          // custom/ is empty, as shipped
    w.eval("go('select')");                                // the MENU bed specifically, not title
    gesture();
    await lands(plays, 'assets/music/menu.mp3');
    expect(plays()[0]).toBe('assets/music/custom/menu.mp3');  // asked first...
    expect(plays().at(-1)).toBe('assets/music/menu.mp3');     // ...and fell through to the default
    expect(w.eval("!!SND._badSrc['assets/music/custom/menu.mp3']")).toBe(true);
    expect(w.eval("!!SND._fileBad['menu']")).toBe(false);     // the CONTEXT is fine, one source wasn't
  });

  it('does not re-ask for a custom slot it already knows is empty', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await lands(plays, 'assets/music/menu.mp3');
    const asked = () => plays().filter((s) => s === 'assets/music/custom/menu.mp3').length;
    expect(asked()).toBe(1);
    w.eval("startMusic('battle')"); await lands(plays, 'assets/music/battle.mp3');
    w.eval("startMusic('menu')"); await lands(plays, 'assets/music/menu.mp3');
    expect(asked()).toBe(1);                                  // still just the one probe
  });

  it('plays the owner custom/ track when one is actually there', async () => {
    const { w, plays, gesture } = bootWithAudio({ existing: ['assets/music/custom/battle.mp3'] });
    gesture(); await tick();
    w.eval("startMusic('battle')"); await tick();
    expect(plays().at(-1)).toBe('assets/music/custom/battle.mp3');
  });

  it("puts the player's own loaded track above everything else", async () => {
    const { w, plays, gesture } = bootWithAudio({ existing: ['assets/music/custom/intense.mp3'] });
    gesture(); await tick();
    w.eval("musicSetUserTrack('intense', new Blob(['x']), 'big-shot.mp3')");
    w.eval("startMusic('intense')");
    await tick();
    expect(plays().at(-1)).toMatch(/^blob:/);                 // beats custom/ AND the default
    expect(w.eval("SND._userList['intense'][0].name")).toBe('big-shot.mp3');
    const order = JSON.parse(w.eval("JSON.stringify(musicSources('intense'))"));
    expect(order[0]).toMatch(/^blob:/);
    expect(order[1]).toBe('assets/music/custom/intense.mp3');
    expect(order[2]).toBe('assets/music/intense.mp3');
  });

  it('swaps live when a track is loaded for the context already playing', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await lands(plays, 'assets/music/menu.mp3');
    expect(plays().at(-1)).toBe('assets/music/menu.mp3');
    w.eval("musicSetUserTrack('menu', new Blob(['x']), 'mine.mp3')");
    await tick();
    expect(plays().at(-1)).toMatch(/^blob:/);
  });

  it('clearing a slot reverts to the default and revokes the blob URL', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await lands(plays, 'assets/music/menu.mp3');
    w.eval("musicSetUserTrack('menu', new Blob(['x']), 'mine.mp3')");
    await tick();
    const url = w.eval("SND._userPick['menu']");
    w.eval("musicClearUserTracks('menu')");
    await tick(120);                                          // revoke is deliberately deferred
    expect(w.eval("!!SND._userList['menu']")).toBe(false);
    expect(plays().at(-1)).toBe('assets/music/menu.mp3');
    expect(JSON.parse(w.eval('JSON.stringify(__revoked)'))).toContain(url);
  });
});

// The owner wanted a specific track on the FRONT PAGE that is not the general menu bed. `title` is
// therefore a context in its own right — its own file slot, its own picker row, its own screen
// routing — with one deliberate asymmetry: it ships no default. An empty title slot has to leave
// the title screen playing exactly the bed it played before the slot existed, or this "feature" is
// a silent regression for every player who never sets a title track.
describe('background music — the title bed', () => {
  it('is a real context, with no shipped file of its own', () => {
    const { w } = bootWithAudio();
    expect(JSON.parse(w.eval('JSON.stringify(MUSIC_FILES)')).title).toBeUndefined();
    const probe = w.eval('MUSIC_UNSHIPPED.title');
    expect(probe).toBe('assets/music/title.mp3');
    expect(existsSync(`${PUB}/${probe}`), 'no new audio may be shipped for it').toBe(false);
    expect(w.eval("MUSIC_CONTEXTS.indexOf('title')")).toBeGreaterThanOrEqual(0);
  });

  it('routes the title screen to it, and every other menu screen to the menu bed', () => {
    const { w } = bootWithAudio();
    expect(w.eval('MUSIC_SCREENS.title')).toBe('title');
    for (const id of ['select', 'controls', 'tutorial', 'stats', 'editor', 'lobby', 'options']) {
      expect(w.eval(`MUSIC_SCREENS.${id}`), `${id} keeps the menu bed`).toBe('menu');
    }
  });

  it('falls through to the WHOLE menu chain when the slot is empty', async () => {
    const { w, plays, gesture } = bootWithAudio();
    expect(JSON.parse(w.eval("JSON.stringify(musicSources('title'))"))).toEqual([
      'assets/music/custom/title.mp3',
      'assets/music/title.mp3',
      'assets/music/custom/menu.mp3',
      'assets/music/menu.mp3',
    ]);
    gesture();
    await lands(plays, 'assets/music/menu.mp3');
    expect(w.eval('SND._kind'), 'the context is title...').toBe('title');
    expect(plays().at(-1), '...but what you hear is the menu bed').toBe('assets/music/menu.mp3');
    expect(w.eval("!!SND._fileBad['title']"), 'never written off to the synth').toBe(false);
  });

  it('plays the owner title track on the title screen and nowhere else', async () => {
    const { w, plays, gesture } = bootWithAudio({ existing: ['assets/music/title.mp3'] });
    gesture();
    await lands(plays, 'assets/music/title.mp3');
    expect(plays().at(-1)).toBe('assets/music/title.mp3');
    w.eval("go('select')");
    await lands(plays, 'assets/music/menu.mp3');
    expect(plays().at(-1), 'select is the general menu bed').toBe('assets/music/menu.mp3');
    w.eval("go('title')");
    await lands(plays, 'assets/music/title.mp3');
    expect(plays().at(-1), 'and back again').toBe('assets/music/title.mp3');
  });

  it("puts the player's own title track above the owner's, and above the menu bed", async () => {
    const { w, plays, gesture } = bootWithAudio({ existing: ['assets/music/title.mp3'] });
    gesture(); await lands(plays, 'assets/music/title.mp3');
    w.eval("musicSetUserTrack('title', new Blob(['x']), 'raining.mp3')");
    await until(() => /^blob:/.test(plays().at(-1)));
    expect(plays().at(-1)).toMatch(/^blob:/);
    const order = JSON.parse(w.eval("JSON.stringify(musicSources('title'))"));
    expect(order[0]).toMatch(/^blob:/);
    // custom/title.mp3 has already 404'd and been struck off, so the owner's file is next.
    expect(order[1]).toBe('assets/music/title.mp3');
    expect(order.at(-1), 'the menu bed is still the last resort').toBe('assets/music/menu.mp3');
  });

  it('keeps one unbroken loop across title -> select when the slot is empty', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await lands(plays, 'assets/music/menu.mp3');
    const n = plays().length;
    w.eval("go('select')"); await tick(20);
    expect(plays(), 'same file either side, so nothing restarts').toHaveLength(n);
    expect(w.eval('SND._kind')).toBe('menu');
    expect(w.eval('SND._deckKind[SND._deck]'), 'the live deck was adopted').toBe('menu');
  });

  it("swaps a player's menu track in live even while the title bed is what is playing", async () => {
    // The title slot is empty, so the menu playlist IS the title screen's music. Loading one has
    // to take effect where you can hear it, not on the next navigation.
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await lands(plays, 'assets/music/menu.mp3');
    w.eval("musicSetUserTrack('menu', new Blob(['x']), 'mine.mp3')");
    await until(() => /^blob:/.test(plays().at(-1)));
    expect(plays().at(-1)).toMatch(/^blob:/);
    expect(w.eval('SND._kind')).toBe('title');
  });

  it('is under the music toggle like every other bed', async () => {
    const { w, plays, gesture, events } = bootWithAudio({ existing: ['assets/music/title.mp3'] });
    gesture(); await lands(plays, 'assets/music/title.mp3');
    w.eval('toggleMusic()');
    expect(w.eval('SND.musicOn')).toBe(false);
    expect(events.at(-1)[0]).toBe('pause');
    const n = plays().length;
    w.eval("go('title')"); await tick(20);
    expect(plays(), 'muted means muted on the front page too').toHaveLength(n);
    w.eval('toggleMusic()');
    await lands(plays, 'assets/music/title.mp3');
    expect(plays().at(-1)).toBe('assets/music/title.mp3');
  });

  it('gets its own picker row, persisted under its own key', async () => {
    const { w, gesture } = bootWithAudio();
    gesture(); await tick();
    w.eval("go('controls')");
    const row = w.document.querySelectorAll('#customMusic .musicrow')[0];
    expect(row.textContent).toContain('Title screen');
    expect(row.textContent, 'an empty slot says what it actually plays').toContain('menu track');
    w.eval("musicPickFile('title', { files:[{name:'raining.mp3',size:10}], value:'' })");
    await tick(20);
    expect(JSON.parse(w.eval("JSON.stringify(__idb._data.get('title').map(t=>t.name))")))
      .toEqual(['raining.mp3']);
    expect(w.document.querySelectorAll('#customMusic .musicrow')[0].textContent)
      .toContain('raining.mp3');
  });
});

describe('background music — playlists', () => {
  /** Load n named tracks into a context's playlist. */
  const load = (w, kind, names) => w.eval(
    `musicAddUserTracks('${kind}', ${JSON.stringify(names)}.map(n=>({name:n, blob:new Blob([n])})), true)`,
  );

  it('appends rather than replacing, and persists the whole array', async () => {
    const { w, gesture } = bootWithAudio();
    gesture(); await tick();
    load(w, 'boss', ['phase1.mp3', 'phase2.mp3']);
    await tick(20);
    load(w, 'boss', ['miniboss.mp3']);
    await tick(20);
    const names = JSON.parse(w.eval("JSON.stringify(SND._userList['boss'].map(t=>t.name))"));
    expect(names).toEqual(['phase1.mp3', 'phase2.mp3', 'miniboss.mp3']);
    const stored = JSON.parse(w.eval("JSON.stringify(__idb._data.get('boss').map(t=>t.name))"));
    expect(stored).toEqual(names);                       // the array shape, not one file
  });

  it('plays one of the playlist entries, never the folder default', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await tick();
    load(w, 'boss', ['a.mp3', 'b.mp3', 'c.mp3']);
    w.eval("startMusic('boss')");
    await tick();
    const urls = JSON.parse(w.eval("JSON.stringify(SND._userList['boss'].map(t=>t.url))"));
    expect(urls).toContain(plays().at(-1));
  });

  it('never picks the same track twice in a row', async () => {
    const { w, gesture } = bootWithAudio();
    gesture(); await tick();
    load(w, 'boss', ['a.mp3', 'b.mp3', 'c.mp3']);
    const seen = [];
    for (let i = 0; i < 40; i += 1) {
      w.eval("musicRollUserTrack('boss')");
      seen.push(w.eval("SND._userLast['boss']"));
    }
    for (let i = 1; i < seen.length; i += 1) {
      expect(seen[i], `pick ${i} repeated index ${seen[i]}`).not.toBe(seen[i - 1]);
    }
    expect(new Set(seen).size).toBeGreaterThan(1);       // and it does actually vary
  });

  it('survives a Math.random that never changes', async () => {
    // The golden harness stubs Math.random. An unbounded "roll until different" loop would hang
    // the whole suite; this proves the bounded retry + deterministic step covers it.
    const { w, gesture } = bootWithAudio();
    gesture(); await tick();
    load(w, 'boss', ['a.mp3', 'b.mp3']);
    w.eval('Math.random = () => 0.5;');
    const seen = [];
    for (let i = 0; i < 6; i += 1) { w.eval("musicRollUserTrack('boss')"); seen.push(w.eval("SND._userLast['boss']")); }
    for (let i = 1; i < seen.length; i += 1) expect(seen[i]).not.toBe(seen[i - 1]);
  });

  it('re-rolls the boss slot on every boss spawn, so a gauntlet cycles', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await tick();
    load(w, 'boss', ['boss-a.mp3', 'boss-b.mp3']);
    w.eval("SETTINGS.mode='boss'; beginMatchNow()");
    await tick();
    const first = plays().at(-1);
    expect(first).toMatch(/^blob:/);
    w.eval('spawnBossRushBoss()');                       // next boss in the gauntlet
    await tick();
    expect(plays().at(-1)).toMatch(/^blob:/);
    expect(plays().at(-1)).not.toBe(first);              // a different theme for the new boss
  });

  it('does not churn the track when the boss slot holds only one file', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await tick();
    load(w, 'boss', ['only.mp3']);
    w.eval("SETTINGS.mode='boss'; beginMatchNow()");
    await tick();
    const n = plays().length;
    w.eval('spawnBossRushBoss()');
    await tick();
    expect(plays()).toHaveLength(n);                     // nothing to re-roll to; leave it alone
  });

  it('re-rolls the intense slot on each clutch trigger', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await tick();
    load(w, 'intense', ['x.mp3', 'y.mp3']);
    w.eval("SETTINGS.mode='ffa'; SETTINGS.stocks=3; startMatch()");
    await tick();
    const picks = [];
    for (let i = 0; i < 4; i += 1) {
      w.eval('fighters[0].stocks = 1; clutchTick()');
      await tick();
      picks.push(plays().at(-1));
      // clear the condition and wait out the hold so the next trigger is a fresh entry
      w.eval('fighters.forEach(f=>{f.stocks=3;f.pct=0;});');
      for (let j = 0; j <= w.eval('CLUTCH_MIN_HOLD'); j += 1) w.eval('clutchTick()');
      await tick();
    }
    for (const p of picks) expect(p).toMatch(/^blob:/);
    for (let i = 1; i < picks.length; i += 1) expect(picks[i]).not.toBe(picks[i - 1]);
  });

  it('removes one entry without disturbing the rest', async () => {
    const { w, gesture } = bootWithAudio();
    gesture(); await tick();
    load(w, 'boss', ['a.mp3', 'b.mp3', 'c.mp3']);
    await tick(20);
    w.eval("musicRemoveUserTrack('boss', 1)");
    await tick(20);
    expect(JSON.parse(w.eval("JSON.stringify(SND._userList['boss'].map(t=>t.name))")))
      .toEqual(['a.mp3', 'c.mp3']);
    expect(JSON.parse(w.eval("JSON.stringify(__idb._data.get('boss').map(t=>t.name))")))
      .toEqual(['a.mp3', 'c.mp3']);
  });

  it('falls back to the shipped default once the last entry is removed', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await tick();
    load(w, 'boss', ['only.mp3']);
    w.eval("startMusic('boss')");
    await tick();
    expect(plays().at(-1)).toMatch(/^blob:/);
    w.eval("musicRemoveUserTrack('boss', 0)");
    await tick(20);
    expect(plays().at(-1)).toBe('assets/music/boss.mp3');
    expect(w.eval("!!__idb._data.get('boss')")).toBe(false);
  });
});

describe('background music — the player\'s own files stay on their machine', () => {
  it('hydrates saved playlists from IndexedDB on the first gesture, not before', async () => {
    const { w, plays, gesture, state } = bootWithAudio({
      idb: { intense: [{ blob: { fake: 1 }, name: 'saved-a.mp3' }, { blob: { fake: 2 }, name: 'saved-b.mp3' }] },
    });
    expect(state.idbTouchedAtBoot).toBe(false);
    expect(w.eval('MUSIC_HYDRATED')).toBe(false);
    gesture();
    await until(() => w.eval("!!SND._userList['intense']"));
    expect(w.eval('MUSIC_HYDRATED')).toBe(true);
    expect(JSON.parse(w.eval("JSON.stringify(SND._userList['intense'].map(t=>t.name))")))
      .toEqual(['saved-a.mp3', 'saved-b.mp3']);
    w.eval("startMusic('intense')");
    await tick();
    expect(plays().at(-1)).toMatch(/^blob:/);
  });

  it('still restores a single-track save written by the older shape', async () => {
    const { w, gesture } = bootWithAudio({ idb: { boss: { blob: { fake: 1 }, name: 'legacy.mp3' } } });
    gesture();
    await until(() => w.eval("!!SND._userList['boss']"));
    expect(JSON.parse(w.eval("JSON.stringify(SND._userList['boss'].map(t=>t.name))")))
      .toEqual(['legacy.mp3']);
  });

  it('persists picked files into IndexedDB under their context key', async () => {
    const { w, gesture } = bootWithAudio();
    gesture(); await tick();
    // A File-like object: musicPickFile only ever reads .name and .size off it.
    w.eval("musicPickFile('battle', { files:[{name:'x.mp3',size:10},{name:'y.mp3',size:12}], value:'' })");
    await tick(20);
    expect(JSON.parse(w.eval("JSON.stringify(__idb._data.get('battle').map(t=>t.name))")))
      .toEqual(['x.mp3', 'y.mp3']);
    w.eval("musicClearSlot('battle')");
    await tick(20);
    expect(w.eval("!!__idb._data.get('battle')")).toBe(false);
  });

  it('refuses an absurdly large file rather than trying to store it', async () => {
    const { w, gesture } = bootWithAudio();
    gesture(); await tick();
    w.eval('window.alert = ()=>{};');
    w.eval("musicPickFile('battle', { files:[{name:'huge.mp3',size:99*1024*1024}], value:'' })");
    await tick(20);
    expect(w.eval("!!SND._userList['battle']")).toBe(false);
    expect(w.eval("!!__idb._data.get('battle')")).toBe(false);
  });

  it('never leaks a local track into anything the netcode sends', async () => {
    const { w, gesture } = bootWithAudio();
    gesture(); await tick();
    w.eval("musicSetUserTrack('battle', new Blob(['x']), 'private.mp3')");
    w.eval('startMatch()');
    await tick();
    const wire = w.eval('JSON.stringify(serializeState())');
    expect(wire).not.toMatch(/blob:/);
    expect(wire).not.toMatch(/private\.mp3/);
    expect(wire).not.toMatch(/music/i);
  });

  it('shows a slot per context in the settings UI, with the on-device warning', () => {
    const { w } = bootWithAudio();
    w.eval("go('controls')");
    const rows = w.document.querySelectorAll('#customMusic .musicrow');
    expect(rows).toHaveLength(6);
    for (const kind of ['title', 'menu', 'battle', 'boss', 'tourney', 'intense']) {
      const input = w.document.getElementById(`mfile_${kind}`);
      expect(input.accept).toBe('audio/*');
      expect(input.multiple).toBe(true);              // playlists, not one file per slot
    }
    expect(w.document.getElementById('controls').textContent)
      .toContain('Plays only on this device');
  });

  it('lists every loaded track with its own remove control', async () => {
    const { w, gesture } = bootWithAudio();
    gesture(); await tick();
    w.eval("musicAddUserTracks('boss', [{name:'a.mp3',blob:new Blob(['a'])},{name:'b.mp3',blob:new Blob(['b'])}], true)");
    w.eval("go('controls')");
    const row = w.document.querySelectorAll('#customMusic .musicrow')[3];   // boss
    expect(row.querySelectorAll('.mtrack')).toHaveLength(2);
    expect(row.querySelectorAll('.mtrack .mx')).toHaveLength(2);
    expect(row.textContent).toContain('a.mp3');
    expect(row.textContent).toContain('b.mp3');
    expect(row.textContent).toContain('Clear all');
  });

  it('escapes the filename it echoes back into the UI', async () => {
    const { w, gesture } = bootWithAudio();
    gesture(); await tick();
    w.eval("musicSetUserTrack('menu', new Blob(['x']), '<img src=x onerror=alert(1)>.mp3')");
    w.eval("go('controls')");
    expect(w.document.querySelectorAll('#customMusic img')).toHaveLength(0);
  });
});

describe('background music — clutch time', () => {
  /** Boot, unlock, and start a 3-stock match so the clutch trigger has something to watch. */
  async function inMatch(opts = {}) {
    const h = bootWithAudio(opts);
    h.gesture();
    await tick();
    h.w.eval("SETTINGS.mode='ffa'; SETTINGS.stocks=3; startMatch()");
    await tick();
    return h;
  }

  it('switches to the intense bed when a fighter reaches their last stock', async () => {
    const { w, plays } = await inMatch();
    expect(plays().at(-1)).toBe('assets/music/battle.mp3');
    w.eval('fighters[0].stocks = 1; clutchTick()');
    await tick();
    expect(w.eval('CLUTCH.on')).toBe(true);
    expect(plays().at(-1)).toBe('assets/music/intense.mp3');
  });

  it('switches when the player is one hit from flying off', async () => {
    const { w, plays } = await inMatch();
    w.eval('fighters.forEach(f=>f.stocks=3); const y=fighters.find(f=>f.you); y.pct=95; clutchTick()');
    await tick();
    expect(w.eval('CLUTCH.on')).toBe(true);
    expect(plays().at(-1)).toBe('assets/music/intense.mp3');
  });

  it('switches when a Boss Rush boss is on the ropes', async () => {
    const { w, plays } = await inMatch();
    w.eval("fighters.forEach(f=>{f.stocks=3;f.pct=0;}); summons.push({type:'boss',_bossRush:true,hp:10,maxHp:100}); clutchTick()");
    await tick();
    expect(w.eval('CLUTCH.on')).toBe(true);
    expect(plays().at(-1)).toBe('assets/music/intense.mp3');
  });

  it('holds the intense bed for a minimum time even if the condition vanishes instantly', async () => {
    const { w, plays } = await inMatch();
    w.eval('fighters[0].stocks = 1; clutchTick()');
    await tick();
    const n = plays().length;
    // Condition gone on the very next tick. It must NOT revert yet.
    w.eval('fighters.forEach(f=>{f.stocks=3;f.pct=0;});');
    for (let i = 0; i < w.eval('CLUTCH_MIN_HOLD') - 1; i += 1) w.eval('clutchTick()');
    await tick();
    expect(w.eval('CLUTCH.on')).toBe(true);
    expect(plays()).toHaveLength(n);                     // no switch at all during the hold
    w.eval('clutchTick()');                              // hold satisfied, condition clear
    await tick();
    expect(w.eval('CLUTCH.on')).toBe(false);
    expect(plays().at(-1)).toBe('assets/music/battle.mp3');
  });

  it('uses a looser threshold to leave than to enter, so it cannot flap', async () => {
    const { w, plays } = await inMatch();
    w.eval('const y=fighters.find(f=>f.you); y.pct=95; clutchTick()');
    await tick();
    expect(w.eval('CLUTCH.on')).toBe(true);
    const n = plays().length;
    // Drop to 85: below the entry threshold (90) but still above the exit threshold (80).
    w.eval('const y=fighters.find(f=>f.you); y.pct=85;');
    for (let i = 0; i < w.eval('CLUTCH_MIN_HOLD') + 5; i += 1) w.eval('clutchTick()');
    await tick();
    expect(w.eval('CLUTCH.on')).toBe(true);
    expect(plays()).toHaveLength(n);
    // Now clearly out of it.
    w.eval('const y=fighters.find(f=>f.you); y.pct=40; clutchTick()');
    await tick();
    expect(w.eval('CLUTCH.on')).toBe(false);
  });

  it('does not treat a 1-stock match as permanent clutch time', async () => {
    const { w, plays } = await inMatch();
    w.eval("SETTINGS.stocks=1; fighters.forEach(f=>{f.stocks=1;f.pct=0;}); clutchTick()");
    await tick();
    expect(w.eval('CLUTCH.on')).toBe(false);
    expect(plays().at(-1)).toBe('assets/music/battle.mp3');
  });

  it('is driven from the game loop, not from a timer', async () => {
    const { w, plays } = await inMatch();
    w.eval('fighters[0].stocks = 1');
    const n = plays().length;
    w.eval(`hazardT=0; for(let i=0;i<${w.eval('CLUTCH_CHECK_FRAMES')}-1;i++) step();`);
    expect(plays()).toHaveLength(n);                     // not checked every frame
    w.eval('step()');
    await tick();
    expect(w.eval('CLUTCH.on')).toBe(true);
    expect(plays().at(-1)).toBe('assets/music/intense.mp3');
  });

  it('stands down while the menus own the music', async () => {
    const { w } = await inMatch();
    w.eval("stopMusic(); startMusic('menu'); fighters[0].stocks=1; clutchTick()");
    await tick();
    expect(w.eval('CLUTCH.on')).toBe(false);
    expect(w.eval('SND._kind')).toBe('menu');
  });

  it('resets between matches so a new fight starts on the battle bed', async () => {
    const { w, plays } = await inMatch();
    w.eval('fighters[0].stocks = 1; clutchTick()');
    await tick();
    expect(w.eval('CLUTCH.on')).toBe(true);
    w.eval('startMatch()');
    await tick();
    expect(w.eval('CLUTCH.on')).toBe(false);
    expect(plays().at(-1)).toBe('assets/music/battle.mp3');
  });
});

describe('background music — crossfade', () => {
  it('overlaps the two decks and parks the outgoing one', async () => {
    const { w, gesture, decks } = bootWithAudio({ fadeMs: 400 });
    // Steady state: the empty custom/ slots have already been probed once, so each switch is a
    // single clean hop. (With the probe still pending the outgoing deck is a 404'd element, which
    // is genuinely paused and would make "two decks live" the wrong thing to assert.)
    w.eval("SND._badSrc['assets/music/custom/menu.mp3']=true;SND._badSrc['assets/music/custom/intense.mp3']=true");
    gesture();
    await tick(30);
    w.eval("startMusic('intense')");
    await tick(60);
    const mid = decks();
    // both decks live, one on the way up and one on the way down
    expect(mid.filter((d) => d && !d.paused)).toHaveLength(2);
    expect(mid.find((d) => d && d.src.includes('intense')).vol).toBeGreaterThan(0);
    await tick(600);
    const end = decks();
    expect(end.filter((d) => d && !d.paused)).toHaveLength(1);
    const live = end.find((d) => d && !d.paused);
    expect(live.src).toBe('assets/music/intense.mp3');
    expect(live.vol).toBeCloseTo(0.32, 2);
  });
});

describe('background music — the sound toggle still owns everything', () => {
  it('silences the file layer when sound is turned off, and restores it', async () => {
    const { w, events, plays, gesture } = bootWithAudio();
    gesture(); await tick();
    w.eval("go('tourneyHub')"); await tick();
    w.eval('toggleSound()');
    expect(w.eval('SND.on')).toBe(false);
    expect(events.at(-1)[0]).toBe('pause');
    expect(w.eval('SND._kind')).toBe(null);           // nothing left armed while muted
    const n = plays().length;
    w.eval("startMusic('battle')"); await tick();
    expect(plays()).toHaveLength(n);                  // muted means muted, whoever asks
    w.eval('toggleSound()'); await tick();
    expect(w.eval('SND.on')).toBe(true);
    expect(plays().at(-1)).toBe('assets/music/tourney.mp3');
  });
});

// The music-only toggle. The property under test is a SEPARATION: music stops, SFX do not — and
// the master Sound toggle still outranks it in both directions. Every assertion below is written
// against observable behaviour (what got played/paused, what reached the synth) rather than the
// flag, because the flag being right while a start path skips the gate is the exact bug shipped
// toggles have. The gate itself is one function, musicAllowed(); if any caller stops going
// through it, the "suppresses every music start" test below fails on that caller specifically.
describe('background music — the music-only toggle', () => {
  const MUSIC_KEY = 'bfsi:musicOn';
  /** Boot, unlock, and start a 3-stock FFA so there is a real match bed playing. */
  async function inMatch(opts = {}) {
    const h = bootWithAudio(opts);
    h.gesture();
    await tick();
    h.w.eval("SETTINGS.mode='ffa'; SETTINGS.stocks=3; startMatch()");
    await tick();
    return h;
  }

  it('defaults to on, with both buttons labelled to match', () => {
    const { w } = bootWithAudio();
    expect(w.eval('SND.musicOn')).toBe(true);
    expect(w.localStorage.getItem(MUSIC_KEY)).toBe(null);   // default is implicit, not written
    expect(w.document.getElementById('musicToggle').textContent).toBe('🎵 Music: On');
    expect(w.document.getElementById('musicToggleCtl').textContent).toBe('🎵 Music: On');
    expect(typeof w.toggleMusic).toBe('function');          // the inline on*= handler is bridged
  });

  // Both toggles moved off the title screen into the Settings panel when the UI was simplified —
  // the property under test is unchanged: music sits beside the master Sound switch, in the same
  // visual treatment, and appears a second time in Controls.
  it('sits in Settings beside the master Sound toggle, and again in Controls', () => {
    const { w } = bootWithAudio();
    const options = w.document.getElementById('options');
    expect(options.contains(w.document.getElementById('soundToggle'))).toBe(true);
    expect(options.contains(w.document.getElementById('musicToggle'))).toBe(true);
    // ...and one click from the title screen, never buried.
    expect(w.document.getElementById('title').innerHTML).toContain("go('options')");
    // Same visual treatment as the control it sits next to, so it does not read as a new species.
    expect(w.document.getElementById('musicToggle').className)
      .toBe(w.document.getElementById('soundToggle').className);
    expect(w.document.getElementById('controls').contains(w.document.getElementById('musicToggleCtl')))
      .toBe(true);
  });

  it('stops the bed the moment it is switched off, mid-match, without touching SFX', async () => {
    const { w, plays, state } = await inMatch();
    expect(plays().at(-1)).toBe('assets/music/battle.mp3');
    w.eval('toggleMusic()');
    expect(w.eval('SND.musicOn')).toBe(false);
    expect(w.eval('SND._decks.every(d=>!d || d.paused)')).toBe(true);   // BOTH crossfade decks
    expect(w.eval('!!SND._musicTimer')).toBe(false);                    // and the synth bed
    expect(w.eval('SND._kind')).toBe(null);
    expect(w.eval('SND.on')).toBe(true);                                // master untouched
    const before = state.oscillators;
    expect(() => w.eval('SFX.jump(); SFX.hit(20); SFX.ko()')).not.toThrow();
    expect(state.oscillators, 'SFX still reach the synth while music is muted')
      .toBeGreaterThan(before);
  });

  it('suppresses every music start while off — screens, matches, clutch, bosses, playlists', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await tick();
    w.eval('toggleMusic()');
    const n = plays().length;
    // screen beds
    w.eval("go('tourneyHub'); go('select'); go('title')"); await tick();
    // match beds
    w.eval("SETTINGS.mode='ffa'; SETTINGS.stocks=3; startMatch()"); await tick();
    // the intense trigger
    w.eval('fighters[0].stocks = 1; clutchTick()'); await tick();
    expect(w.eval('CLUTCH.on'), 'clutch stands down when music owns no bed').toBe(false);
    // a boss run plus its per-spawn re-roll
    w.eval("musicAddUserTracks('boss', [{name:'a.mp3',blob:new Blob(['a'])},{name:'b.mp3',blob:new Blob(['b'])}], true)");
    w.eval("SETTINGS.mode='boss'; beginMatchNow()"); await tick();
    w.eval('spawnBossRushBoss()'); await tick();
    // a freshly loaded custom playlist for the context that would otherwise be live
    w.eval("musicSetUserTrack('menu', new Blob(['x']), 'mine.mp3')"); await tick();
    expect(plays(), 'nothing started audio while music was off').toHaveLength(n);
    expect(w.eval('!!SND._musicTimer')).toBe(false);
    expect(w.eval('SND._kind')).toBe(null);
  });

  it('keeps the synth fallback silent too, not just the file layer', async () => {
    const { w, gesture } = bootWithAudio({ existing: [] });
    gesture(); await tick();
    w.eval('toggleMusic()');
    // Every source for this context is unusable, so the old code would hand it to the synth bed.
    w.eval("SND._badSrc['assets/music/boss.mp3']=true; startMusic('boss')");
    await tick(20);
    expect(w.eval('!!SND._musicTimer')).toBe(false);
  });

  it('resumes the bed the current state wants when switched back on mid-match', async () => {
    const { w, plays } = await inMatch();
    w.eval('toggleMusic()');
    const n = plays().length;
    w.eval('toggleMusic()'); await tick();
    expect(w.eval('SND.musicOn')).toBe(true);
    expect(plays().length).toBeGreaterThan(n);
    expect(plays().at(-1)).toBe('assets/music/battle.mp3');
    // ...and the menu bed, not the battle one, when the player is back on a screen.
    w.eval('toggleMusic()');
    w.eval("go('title')");
    w.eval('toggleMusic()'); await tick();
    expect(plays().at(-1)).toBe('assets/music/menu.mp3');
  });

  it('relabels BOTH buttons on every toggle', async () => {
    const { w, gesture } = bootWithAudio();
    gesture(); await tick();
    w.eval('toggleMusic()');
    expect(w.document.getElementById('musicToggle').textContent).toBe('🎵 Music: Off');
    expect(w.document.getElementById('musicToggleCtl').textContent).toBe('🎵 Music: Off');
    w.eval('toggleMusic()');
    expect(w.document.getElementById('musicToggle').textContent).toBe('🎵 Music: On');
    expect(w.document.getElementById('musicToggleCtl').textContent).toBe('🎵 Music: On');
  });

  it('persists the choice and honours it on the next load', async () => {
    const { w, gesture } = bootWithAudio();
    gesture(); await tick();
    w.eval('toggleMusic()');
    expect(w.localStorage.getItem(MUSIC_KEY)).toBe('0');

    // Reload with that preference already on disk.
    const two = bootWithAudio({ storage: { [MUSIC_KEY]: '0' } });
    expect(two.w.eval('SND.musicOn')).toBe(false);
    expect(two.w.document.getElementById('musicToggle').textContent).toBe('🎵 Music: Off');
    expect(two.w.document.getElementById('musicToggleCtl').textContent).toBe('🎵 Music: Off');
    two.gesture();                                   // the cold-load unlock must stay silent
    await tick();
    expect(two.plays()).toHaveLength(0);
    expect(two.w.eval('SND._decks[0]'), 'no <audio> built for music nobody asked for').toBe(null);
    expect(two.w.eval('SND._decks[1]')).toBe(null);

    // And turning it back on writes the preference the other way, so the next load plays.
    two.w.eval('toggleMusic()');
    expect(two.w.localStorage.getItem(MUSIC_KEY)).toBe('1');
    const three = bootWithAudio({ storage: { [MUSIC_KEY]: '1' } });
    expect(three.w.eval('SND.musicOn')).toBe(true);
    three.gesture(); await lands(three.plays, 'assets/music/menu.mp3');
    expect(three.plays().at(-1)).toBe('assets/music/menu.mp3');
  });

  it('survives a realm where localStorage itself throws', () => {
    // Chrome with site data blocked throws from the localStorage GETTER, not from getItem.
    const { w } = bootWithAudio();
    w.eval(`Object.defineProperty(window, 'localStorage', {
      configurable: true, get(){ throw new Error('SecurityError'); } });`);
    expect(() => w.eval('toggleMusic()')).not.toThrow();
    expect(w.eval('SND.musicOn')).toBe(false);        // the toggle still works, just unremembered
  });
});

// Precedence. Two independent switches over one output need an unambiguous rule, and this is it:
// master Sound OFF silences everything regardless of the music flag, and the music flag can only
// ever subtract. Getting this backwards produces the worst possible bug — a muted game that makes
// noise — so each direction is pinned separately.
describe('background music — Sound and Music toggle precedence', () => {
  it('master Sound off silences music even with the music toggle on', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await tick();
    expect(w.eval('SND.musicOn')).toBe(true);
    w.eval('toggleSound()');
    expect(w.eval('SND.on')).toBe(false);
    const n = plays().length;
    w.eval("startMusic('battle'); startMusic('menu')"); await tick();
    expect(plays()).toHaveLength(n);
    expect(w.eval('musicAllowed()')).toBe(false);
  });

  it('the music toggle cannot un-mute a master-muted game', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await tick();
    w.eval('toggleMusic()');                    // music off
    w.eval('toggleSound()');                    // master off too
    const n = plays().length;
    w.eval('toggleMusic()'); await tick();      // music back ON, master still OFF
    expect(w.eval('SND.musicOn')).toBe(true);
    expect(w.eval('SND.on')).toBe(false);
    expect(plays(), 'master mute outranks the music toggle').toHaveLength(n);
    expect(w.eval('SND._kind')).toBe(null);
  });

  it('turning Sound back on does not resurrect music the player switched off', async () => {
    const { w, plays, gesture, state } = bootWithAudio();
    gesture(); await tick();
    w.eval("go('tourneyHub')"); await tick();
    w.eval('toggleMusic()');                    // music off, master still on
    w.eval('toggleSound()');                    // master off
    const n = plays().length;
    const osc = state.oscillators;
    w.eval('toggleSound()'); await tick();      // master back on
    expect(w.eval('SND.on')).toBe(true);
    expect(plays(), 'music stays off across a master mute cycle').toHaveLength(n);
    expect(state.oscillators, 'but SFX are audible again').toBeGreaterThan(osc);
  });

  it('musicAllowed() is the AND of both switches, and SFX never consult it', async () => {
    const { w, gesture, state } = bootWithAudio();
    gesture(); await tick();
    const allowed = () => w.eval('musicAllowed()');
    expect(allowed()).toBe(true);
    w.eval('toggleMusic()'); expect(allowed()).toBe(false);
    w.eval('toggleSound()'); expect(allowed()).toBe(false);
    w.eval('toggleMusic()'); expect(allowed()).toBe(false);   // music on, sound off
    w.eval('toggleSound()'); expect(allowed()).toBe(true);
    // SFX track SND.on alone: audible with music muted, silent when the master is off.
    w.eval('toggleMusic()');
    let n = state.oscillators; w.eval('SFX.ko()');
    expect(state.oscillators).toBeGreaterThan(n);
    w.eval('toggleSound()');
    n = state.oscillators; w.eval('SFX.ko()');
    expect(state.oscillators).toBe(n);
  });
});

describe('background music — a broken source degrades, it does not break', () => {
  it('falls back to the synth loop when every source for a context fails', async () => {
    const { w, gesture } = bootWithAudio({ existing: [] });
    gesture(); await tick();
    // Nothing left: neither the custom slot nor the default resolves.
    w.eval("SND._badSrc['assets/music/boss.mp3']=true; stopMusic(); startMusic('boss')");
    await tick(20);
    expect(w.eval('!!SND._musicTimer')).toBe(true);   // the original synth bed took over
    expect(w.eval('SND._kind')).toBe('boss');
    w.eval('stopMusic()');
    expect(w.eval('!!SND._musicTimer')).toBe(false);
  });

  it('boots and plays nothing at all on a platform with no media support', () => {
    // The real jsdom harness: no AudioContext, no IndexedDB, no usable Audio. Nothing may throw.
    const html = readFileSync(SRC, 'utf8');
    const dom = new JSDOM(html, {
      url: 'http://localhost/',
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      beforeParse(window) {
        window.HTMLCanvasElement.prototype.getContext = () => new Proxy({}, {
          get: (_t, p) => (p === 'measureText' ? () => ({ width: 0 })
            : p === 'canvas' ? { width: 1100, height: 720 }
            : p === 'getImageData' ? () => ({ data: [] })
            : String(p).startsWith('create') ? () => ({ addColorStop() {} })
            : () => {}),
          set: () => true,
        });
        window.requestAnimationFrame = () => 0;
        window.cancelAnimationFrame = () => {};
      },
    });
    const w = dom.window;
    expect(w.eval("typeof indexedDB==='undefined' || !indexedDB")).toBe(true);
    expect(() => w.dispatchEvent(new w.Event('pointerdown'))).not.toThrow();
    expect(() => w.eval("go('controls'); go('title'); startMusic('menu'); startMusic('intense'); clutchTick(); stopMusic()")).not.toThrow();
    expect(w.eval('SND._decks[0]')).toBe(null);        // no element was ever built
    expect(w.eval('SND._decks[1]')).toBe(null);
    expect(w.eval('MStore.available()')).toBe(false);
  });
});

describe('background music — credits', () => {
  let credits;
  beforeAll(() => { credits = readFileSync(`${PUB}/assets/music/CREDITS.md`, 'utf8'); });

  it('names an author, a source and a licence for every shipped track', () => {
    // Count only the SHIPPED entries — the owner-supplied template further down deliberately
    // repeats these field names, and counting those too would make the gate meaningless.
    const shipped = credits.split('## Owner-supplied tracks')[0];
    for (const f of ['menu.mp3', 'battle.mp3', 'boss.mp3', 'tourney.mp3', 'intense.mp3']) {
      expect(shipped).toContain(f);
    }
    expect(shipped.match(/\*\*Author\*\*/g) || []).toHaveLength(5);
    expect(shipped.match(/\*\*Source\*\*/g) || []).toHaveLength(5);
    expect(shipped.match(/\*\*Licence\*\*/g) || []).toHaveLength(5);
  });

  it('surfaces the music credit on the title screen', () => {
    const html = readFileSync(SRC, 'utf8');
    const line = html.split('\n').find((l) => l.includes('id="musicCredits"')) || '';
    expect(line).toMatch(/Pixabay Content License/);
    // Every author named in CREDITS.md is visible in-game, not only in the repo.
    for (const author of ['Reganati', 'HauntSync', 'Montogoronto', 'Sonican']) {
      expect(line).toContain(author);
    }
  });

  it('carries a ready-to-use credit template for owner-supplied Undertale/Deltarune music', () => {
    // Materia Music Publishing's non-commercial policy requires BOTH the composer and the
    // rights administrator. A template that named only Toby Fox would quietly under-credit.
    expect(credits).toMatch(/Toby Fox/);
    expect(credits).toMatch(/Materia Music Publishing/);
    const readme = readFileSync(`${PUB}/assets/music/custom/README.md`, 'utf8');
    expect(readme).toMatch(/Toby Fox/);
    expect(readme).toMatch(/Materia Music Publishing/);
    for (const kind of ['menu', 'battle', 'boss', 'tourney', 'intense']) {
      expect(readme).toContain(`${kind}.mp3`);
    }
  });
});
