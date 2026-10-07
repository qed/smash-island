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
// The owner's ten DELTARUNE tracks (the "Battle playlist", 2026-09-27) are gone from the deploy: asked "Remove them
// from the public site and installer?", the owner answered "ok :(" on 2026-09-29. The DELTARUNE FAQ says "Please
// don't re-upload the soundtracks anywhere." and Materia's licensing page does not permit its music "in conjunction
// with any AI content or AI personas/vtubers/agents" (the Teams-mode teammate is one). So a match plays battle.mp3
// again, and the fake server below serves only the five cleared .mp3 files.
const BATTLE = 'assets/music/battle.mp3';

const tick = (n = 3) => new Promise((r) => setTimeout(r, n));
// IndexedDB work crosses several macrotask hops, so sleeping a fixed number of ms is a flake
// waiting to happen on a loaded machine. Wait on the OUTCOME instead.
// The ceiling is deliberately generous. It costs nothing when the outcome lands quickly -- this
// returns the moment it does -- and 2000ms was overrun on a loaded machine: in the full parallel
// run, the crossfade case and the persist-on-reload case both timed out here while passing every
// time on their own. A ceiling that only fails under load is measuring the machine, not the music.
async function until(fn, ms = 10000) {
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
const lands = (plays, src, ms = 10000) => until(() => plays().at(-1) === src, ms);
// A match lands on battle.mp3 (after the 2026-09-27 to 2026-09-29 playlist, which is gone).
const landsBattle = (plays, ms = 10000) => lands(plays, BATTLE, ms);

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
  const state = { gestureFired: false, constructedEarly: 0, idbTouchedAtBoot: false, oscillators: 0, canPlayAsked: [] };
  const existing = new Set([...DEFAULTS, ...(opts.existing || [])]);
  let blobN = 0;
  // Flipped by a test to model the OTHER reason play() rejects: an autoplay policy refusing a
  // source that is perfectly loadable. That one really does deserve the synth cover.
  let blockPlay = !!opts.blockPlay;
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
        // A real browser reports an unusable source TWICE: the `error` event above, and a
        // REJECTED play() promise. Modelling only the event hid a doubled-bed bug for months —
        // the rejection handler treated every rejection as an autoplay block, started the synth
        // as cover, and nothing stopped it when the next source in the chain loaded. The
        // rejection is a microtask and the error event a macrotask, so this also reproduces the
        // nastier of the two orderings: synth first, file afterwards.
        play() {
          events.push(['play', this._src]);
          if (blockPlay || !existing.has(this._src)) {
            this.paused = true;
            const err = new Error(blockPlay ? 'NotAllowedError' : 'NotSupportedError');
            // Nothing promises an ordering between the `error` event and this rejection. By
            // default the rejection lands FIRST (microtask vs macrotask); opts.rejectDelay models
            // the other ordering, where a long-dead source reports its failure only after the
            // chain has stepped on and the file that wins is already playing.
            if (!opts.rejectDelay) return Promise.reject(err);
            return new Promise((_res, rej) => setTimeout(() => rej(err), opts.rejectDelay));
          }
          this.paused = false;
          this.ended = false;
          return Promise.resolve();
        }
        pause() { this.paused = true; events.push(['pause', this._src]); }
        // A real element answers "can you play this type?". The game asked once, about Ogg Vorbis, for the
        // shipped playlist (some Safari builds cannot play it). That playlist is gone, so nothing asks any more;
        // the spy stays so a test can prove it (state.canPlayAsked).
        canPlayType(type) {
          state.canPlayAsked.push(type);
          return 'maybe';
        }
      };
    },
  });
  const w = dom.window;
  if (opts.fadeMs !== undefined) w.eval(`SND.fadeMs=${opts.fadeMs}`);
  else w.eval('SND.fadeMs=0');
  const plays = () => events.filter((e) => e[0] === 'play').map((e) => e[1]);
  const gesture = () => { state.gestureFired = true; w.dispatchEvent(new w.Event('pointerdown')); };
  const decks = () => w.eval('JSON.stringify(SND._decks.map(d=>d?{src:d.src,paused:d.paused,vol:d.volume}:null))');
  return { w, events, plays, gesture, state, existing, decks: () => JSON.parse(decks()),
           blockPlay: (v) => { blockPlay = v !== false; } };
}

/** Everything that is ACTUALLY making noise this instant: the synth bed counts as one source, and
 *  so does every deck that is unpaused with its volume up. Two at once is the doubled-bed bug. */
function beds(w) {
  return JSON.parse(w.eval(`JSON.stringify({
    synth: !!SND._musicTimer,
    decks: SND._decks.filter(d => d && !d.paused && d.volume > 0).map(d => d.src),
    pending: SND._pendingKind,
    kind: SND._kind,
  })`));
}
function expectOneBed(w, src) {
  const b = beds(w);
  const audible = b.decks.concat(b.synth ? ['<synth bed>'] : []);
  expect(audible, `expected exactly one audible bed, heard ${JSON.stringify(audible)}`).toHaveLength(1);
  if (src) expect(b.decks[0]).toBe(src);
  return b;
}

describe('background music — the file layer', () => {
  it('declares seven contexts, each backed by a real default file on disk', () => {
    // Five, until One got her own bed and Steve Cobs his. Both borrow a cleared track now (see below).
    const { w } = bootWithAudio();
    const map = JSON.parse(w.eval('JSON.stringify(MUSIC_FILES)'));
    expect(Object.keys(map).sort()).toEqual(['battle', 'boss', 'cobs', 'intense', 'menu', 'one', 'tourney']);
    for (const rel of Object.values(map)) {
      expect(existsSync(`${PUB}/${rel}`), `${rel} is missing`).toBe(true);
      expect(rel, 'a default must be one of the cleared .mp3 tracks, never a DELTARUNE .ogg').toMatch(/^assets\/music\/(menu|battle|boss|tourney|intense)\.mp3$/);
    }
  });

  it("One's fight has its own bed, the World Cup anthem, from her card through the fight and back from clutch time", () => {
    // Her bed was joker.ogg ("ones music should be titan." -> "actually, ones music should be joker."), a DELTARUNE
    // track. The owner, asked "Remove them from the public site and installer?", answered "ok :(" (2026-09-29), so
    // it falls back to a cleared track already in the folder: tourney.mp3, "Epic Orchestral Anthem Loop" (Sonican,
    // Pixabay Content License), the finale of the World Cup that leads to her.
    const { w } = bootWithAudio();
    expect(w.eval('MUSIC_FILES.one')).toBe('assets/music/tourney.mp3');
    const r = w.eval(`(function(){
      var was = ONEFIGHT.active; ONEFIGHT.active = true; BOSSRUSH.active = false;
      var base = clutchBaseKind(); ONEFIGHT.active = was;
      var boss = (function(){ var b = BOSSRUSH.active; BOSSRUSH.active = true; var k = clutchBaseKind(); BOSSRUSH.active = b; return k; })();
      return { base: base, boss: boss, card: String(finishMoonScene).indexOf("startMusic('one')") >= 0,
               start: String(beginMatchNow).indexOf("ONEFIGHT.active ? 'one'") >= 0 };
    })()`);
    expect(r.base, "her fight's bed").toBe('one');
    expect(r.boss, 'Boss Rush keeps its own').toBe('boss');
    expect(r.card, 'it starts on her card').toBe(true);
    expect(r.start, 'and the fight itself picks it').toBe(true);
  });

  it("Steve Cobs's fight has its own bed, the boss bed, from his title card through the fight and back from clutch time", () => {
    // His bed was BIG SHOT ("use big shot." -- the Spamton NEO mix), a DELTARUNE track. "ok :(" (the owner,
    // 2026-09-29): it falls back to boss.mp3, "Dark Orchestral Battle Tension" (Montogoronto, Pixabay Content License).
    const { w } = bootWithAudio();
    expect(w.eval('MUSIC_FILES.cobs')).toBe('assets/music/boss.mp3');
    const r = w.eval(`(function(){
      var was = COBSFIGHT.active; COBSFIGHT.active = true; BOSSRUSH.active = false;
      var base = clutchBaseKind(); COBSFIGHT.active = was;
      // (an open door is the door stage AND a RUNNING! win on the current lane: since the reset, an older lane's win
      // keeps his card away -- test/cobs-chain.test.js)
      var P0 = PROFILE; PROFILE = { cobs:{ stage:COBS_STAGE.DOOR, race:true, raceV:RACE_LANE_V }, one:{} };
      var due = cobsCardDue(); PROFILE.cobs.stage = COBS_STAGE.FREE; var after = cobsCardDue(); PROFILE = P0;
      return { base: base, start: String(beginMatchNow).indexOf("COBSFIGHT.active ? 'cobs'") >= 0,
               title: String(go).indexOf("(id==='title' && cobsCardDue()) ? 'cobs'") >= 0, due: due, after: after };
    })()`);
    expect(r.base, "his fight's bed").toBe('cobs');
    expect(r.start, 'the fight itself picks it').toBe(true);
    expect(r.title, 'the title plays it while his card is up').toBe(true);
    expect(r.due, 'his card is due while the door is open').toBe(true);
    expect(r.after, 'and not once he is beaten').toBe(false);
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
      await lands(plays, `assets/music/${kind}.mp3`);
      expect(plays().at(-1), `${kind} should end up on its default`).toBe(`assets/music/${kind}.mp3`);
    }
  });

  it('plays the cleared track a fight borrows, after the empty custom/ probe', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await tick();
    for (const [kind, file] of [['one', 'tourney'], ['cobs', 'boss']]) {
      w.eval(`startMusic('${kind}')`);
      await lands(plays, `assets/music/${file}.mp3`);
      expect(plays().at(-1), `${kind} plays ${file}.mp3`).toBe(`assets/music/${file}.mp3`);
      expect(plays(), 'custom/<context>.mp3 is still probed first').toContain(`assets/music/custom/${kind}.mp3`);
      expect(JSON.parse(w.eval(`JSON.stringify(musicSources('${kind}'))`)).at(-1)).toBe(`assets/music/${file}.mp3`);
    }
  });

  it('routes the tournament hub to the anthem and a real match to the battle bed', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture();
    await tick();
    w.eval("go('tourneyHub')"); await tick();
    expect(plays().at(-1)).toBe('assets/music/tourney.mp3');
    w.eval('startMatch()'); await landsBattle(plays);
    expect(plays().at(-1), 'a match plays battle.mp3').toBe(BATTLE);
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
    w.eval("startMusic('battle')"); await landsBattle(plays);
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

  // The owner, 2026-10-07: "change the music so that it finishes a track before going to the next." A new boss used to cut the theme for a fresh one;
  // now the theme playing finishes, and the gauntlet cycles at the END of each track.
  it('lets the boss theme finish when the next boss spawns, then cycles to another when it ends', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await tick();
    load(w, 'boss', ['boss-a.mp3', 'boss-b.mp3']);
    w.eval("SETTINGS.mode='boss'; beginMatchNow()");
    await tick();
    const first = plays().at(-1);
    expect(first).toMatch(/^blob:/);
    expect(w.eval('SND._decks[SND._deck].loop'), 'a playlist track plays to its end').toBe(false);
    const n = plays().length;
    w.eval('spawnBossRushBoss()');                       // next boss in the gauntlet
    await tick();
    expect(plays().length, 'the theme playing is not cut').toBe(n);
    w.eval(`var d = SND._decks[SND._deck]; d.ended = true; d.paused = true; (d._on.ended || []).forEach(function(f){ f(); });`);                // ...and when it ends
    await tick();
    expect(plays().at(-1)).toMatch(/^blob:/);
    expect(plays().at(-1)).not.toBe(first);              // a different theme comes next
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

// The owner's "Battle playlist" (ten DELTARUNE tracks, 2026-09-27) is gone: asked "Remove them from the public site and
// installer?", the owner answered "ok :(" on 2026-09-29. The DELTARUNE FAQ says "Please don't re-upload the soundtracks
// anywhere." and Materia's licensing page does not permit its music "in conjunction with any AI content or AI
// personas/vtubers/agents" (the Teams-mode teammate is one). The playlist and everything that only existed to serve it --
// the per-match shuffle, "never the track that played last", the next-track-on-end handover, skipping a dead playlist file,
// the Ogg capability check -- went with it, and so did the tests that pinned those. What is pinned here is what is left and
// must stay true: the precedence players and the owner already rely on (the player's own tracks, then custom/battle.mp3,
// then battle.mp3, then the synth bed), one audible bed at a time, and that a player's OWN multi-track battle playlist still
// shuffles per match (R restarts included).
describe('background music — the battle bed, with no shipped playlist', () => {
  /** Boot, unlock, and start a 3-stock FFA on its battle bed. */
  async function inMatch(opts = {}) {
    const h = bootWithAudio(opts);
    h.gesture(); await lands(h.plays, 'assets/music/menu.mp3');
    h.w.eval("SETTINGS.mode='ffa'; SETTINGS.stocks=3; startMatch()");
    await landsBattle(h.plays); await tick(20);
    return h;
  }
  const liveLoop = (w) => w.eval('SND._decks[SND._deck].loop');
  const pressR = (w) => w.dispatchEvent(new w.KeyboardEvent('keydown', { code: 'KeyR' }));
  /** Load n named tracks into a context's playlist. */
  const load = (w, kind, names) => w.eval(
    `musicAddUserTracks('${kind}', ${JSON.stringify(names)}.map(n=>({name:n, blob:new Blob([n])})), true)`,
  );

  it('has no shipped playlist: a normal match plays battle.mp3, looped, after the custom/ probe', async () => {
    const { w, plays, events, state } = await inMatch();
    expect(w.eval('typeof MUSIC_PLAYLISTS'), 'the shipped playlist is gone').toBe('undefined');
    for (const fn of ['musicRollShippedTrack', 'musicShippedOrder', 'musicShippedOwner', 'musicPlaylistPlayable', 'musicTrackEnded']) {
      expect(w.eval(`typeof ${fn}`), `${fn} only served the shipped playlist`).toBe('undefined');
    }
    expect(w.eval('MUSIC_FILES.battle')).toBe(BATTLE);
    expect(plays().slice(plays().indexOf('assets/music/custom/battle.mp3')),
      "the owner's custom/battle.mp3 is still asked first, then battle.mp3").toEqual(['assets/music/custom/battle.mp3', BATTLE]);
    expect(events.filter((e) => e[0] === 'src' && /\.(ogg|oga|opus)$/.test(e[1])), 'not one .ogg is ever requested').toEqual([]);
    expect(state.canPlayAsked, 'and the browser is never asked about Ogg Vorbis').toEqual([]);
    expect(liveLoop(w), 'battle.mp3 loops, as it always has').toBe(true);
    expectOneBed(w, BATTLE);
  });

  it("keeps the precedence: the player's track, then custom/battle.mp3, then battle.mp3", async () => {
    const { w, plays, gesture } = bootWithAudio({ existing: ['assets/music/custom/battle.mp3'] });
    gesture(); await lands(plays, 'assets/music/menu.mp3');
    w.eval("startMusic('battle')");
    await lands(plays, 'assets/music/custom/battle.mp3');
    expect(plays().filter((s) => s === BATTLE), "the owner's custom/battle.mp3 beats battle.mp3").toEqual([]);
    expect(liveLoop(w), 'and loops, as every slot does').toBe(true);
    expect(JSON.parse(w.eval("JSON.stringify(musicSources('battle'))"))).toEqual(['assets/music/custom/battle.mp3', BATTLE]);
    // A track the player loaded into their own battle playlist still wins over all of it.
    w.eval("musicSetUserTrack('battle', new Blob(['x']), 'mine.mp3')");
    await until(() => /^blob:/.test(plays().at(-1)));
    expect(plays().at(-1)).toMatch(/^blob:/);
    expect(liveLoop(w), "a player's own track loops, as it always has").toBe(true);
    expect(JSON.parse(w.eval("JSON.stringify(musicSources('battle'))"))[0]).toMatch(/^blob:/);
    // ...and clearing it hands the battle bed back to the owner's override.
    w.eval("musicClearUserTracks('battle')");
    await lands(plays, 'assets/music/custom/battle.mp3');
    expect(plays().at(-1)).toBe('assets/music/custom/battle.mp3');
  });

  it('comes back from clutch time to battle.mp3', async () => {
    const { w, plays } = await inMatch();
    w.eval('fighters[0].stocks = 1; clutchTick()');
    await lands(plays, 'assets/music/intense.mp3');
    expect(liveLoop(w), 'the clutch bed loops').toBe(true);
    w.eval('fighters.forEach(f=>{f.stocks=3;f.pct=0;});');
    for (let i = 0; i <= w.eval('CLUTCH_MIN_HOLD'); i += 1) w.eval('clutchTick()');
    await landsBattle(plays); await tick(20);
    expect(w.eval('CLUTCH.on')).toBe(false);
    expect(plays().at(-1)).toBe(BATTLE);
    expect(liveLoop(w)).toBe(true);
    expectOneBed(w, BATTLE);
  });

  // The owner, 2026-10-07: "change the music so that it finishes a track before going to the next." R and Rematch used to roll a fresh track from the
  // player's own battle playlist; now the song playing carries on through them, and the playlist moves on only when a track ends.
  it("keeps the song playing when R restarts the match or Rematch starts another, and moves on when it ends", async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await lands(plays, 'assets/music/menu.mp3');
    load(w, 'battle', ['a.mp3', 'b.mp3', 'c.mp3']);
    w.eval("SETTINGS.mode='ffa'; SETTINGS.stocks=3; startMatch()");
    await until(() => /^blob:/.test(plays().at(-1))); await tick(20);
    const song = plays().at(-1);
    for (let i = 0; i < 3; i += 1) {
      const n = plays().length;
      pressR(w);
      await tick(10);
      expect(w.eval('running'), 'R restarted the match').toBe(true);
      expect(plays().length, `restart ${i + 1} did not cut the song`).toBe(n);
      expect(w.eval('SND._kind')).toBe('battle');
      expectOneBed(w, song);
    }
    // Rematch from the result screen picks the same song up where the result screen paused it.
    w.eval('SND._decks[SND._deck].currentTime = 42; showResult([fighters[0]], fighters[0].team)');
    const n = plays().length;
    w.eval('startMatch()');
    await tick(10);
    expect(plays().at(-1), 'Rematch resumed the song').toBe(song);
    expect(w.eval('SND._decks[SND._deck].currentTime'), '...from where it stopped').toBe(42);
    // when the song ends, the next one from the playlist plays
    w.eval(`var d = SND._decks[SND._deck]; d.ended = true; d.paused = true; (d._on.ended || []).forEach(function(f){ f(); });`);
    await until(() => plays().length > n && /^blob:/.test(plays().at(-1)));
    expect(plays().at(-1)).not.toBe(song);
    expectOneBed(w, plays().at(-1));
  }, 20000);   // four restarts and a result screen: past the 5 s default on a loaded machine

  it('leaves the Boss Rush bed and every single-file battle bed alone on R', async () => {
    // Boss Rush: R keeps the boss bed exactly as it did.
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await lands(plays, 'assets/music/menu.mp3');
    w.eval("SETTINGS.mode='boss'; beginMatchNow()"); await lands(plays, 'assets/music/boss.mp3'); await tick(10);
    let n = plays().length;
    pressR(w); await tick(30);
    expect(plays().slice(n), 'R in Boss Rush restarted or changed the boss bed').toEqual([]);
    expectOneBed(w, 'assets/music/boss.mp3');
    // A re-roll that cannot change anything does not restart anything: custom/battle.mp3 carries on, and so does battle.mp3.
    for (const existing of [['assets/music/custom/battle.mp3'], []]) {
      const want = existing.length ? existing[0] : BATTLE;
      const c = bootWithAudio({ existing });
      c.gesture(); await lands(c.plays, 'assets/music/menu.mp3');
      c.w.eval("SETTINGS.mode='ffa'; SETTINGS.stocks=3; startMatch()");
      await lands(c.plays, want); await tick(10);
      n = c.plays().length;
      pressR(c.w); await tick(30);
      expect(c.w.eval('running')).toBe(true);
      expect(c.plays().slice(n), `R restarted ${want}`).toEqual([]);
      expectOneBed(c.w, want);
    }
  }, 30000);   // three boots inside one test: past the 5 s default on a loaded machine

  it('plays battle.mp3 for a match started before the first gesture, and again after Sound off and on', async () => {
    const { w, plays, gesture } = bootWithAudio();
    w.eval("SETTINGS.mode='ffa'; SETTINGS.stocks=3; startMatch()");
    expect(plays(), 'nothing may play before the gesture').toEqual([]);
    expect(w.eval('SND._pendingKind')).toBe('battle');
    gesture();
    await landsBattle(plays); await tick(20);
    expect(plays(), "the owner's custom/battle.mp3 probe, then battle.mp3").toEqual(['assets/music/custom/battle.mp3', BATTLE]);
    expectOneBed(w, BATTLE);
    // The master Sound toggle, off and on mid-match: the bed comes back, alone.
    w.eval('toggleSound()'); await tick(10);
    expect(beds(w).decks).toEqual([]);
    const n = plays().length;
    w.eval('toggleSound()');
    await until(() => plays().length > n && plays().at(-1) === BATTLE);
    await tick(20);
    expectOneBed(w, BATTLE);
  }, 20000);   // several steps after the boot: past the 5 s default on a loaded machine

  it('falls back to the synth bed, never silence, when battle.mp3 will not load', async () => {
    const { w, plays, gesture, existing } = bootWithAudio();
    existing.delete(BATTLE);
    gesture(); await lands(plays, 'assets/music/menu.mp3');
    w.eval("startMusic('battle')");
    await until(() => beds(w).synth);
    expect(plays(), 'battle.mp3 was tried').toContain(BATTLE);
    await tick(20);
    const b = beds(w);
    expect(b.synth, 'the synth bed took over').toBe(true);
    expect(b.decks, 'and no file plays under it').toEqual([]);
    expect(b.kind).toBe('battle');
  });

  it('leaves Boss Rush, the menus, the World Cup setup and hub, the title and clutch time as they were', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await lands(plays, 'assets/music/menu.mp3');
    for (const kind of ['title', 'menu', 'boss', 'tourney', 'intense']) {
      const chain = JSON.parse(w.eval(`JSON.stringify(musicSources('${kind}'))`));
      expect(chain.filter((s) => s.endsWith('.ogg')), `${kind} must not reach an .ogg`).toEqual([]);
    }
    expect(liveLoop(w), 'the title/menu bed still loops').toBe(true);
    w.eval("go('tourneySetup')"); await lands(plays, 'assets/music/tourney.mp3');
    expect(liveLoop(w)).toBe(true);
    w.eval("go('tourneyHub')"); await tick(20);
    expect(plays().at(-1), 'setup -> hub is one unbroken anthem').toBe('assets/music/tourney.mp3');
    w.eval("go('title')"); await lands(plays, 'assets/music/menu.mp3');
    w.eval("SETTINGS.mode='boss'; beginMatchNow()"); await lands(plays, 'assets/music/boss.mp3');
    expect(liveLoop(w)).toBe(true);
    w.eval('spawnBossRushBoss()'); await tick(20);
    expect(plays().at(-1), 'a Boss Rush spawn keeps the boss bed').toBe('assets/music/boss.mp3');
    w.eval("startMusic('intense')"); await lands(plays, 'assets/music/intense.mp3');
    expect(liveLoop(w)).toBe(true);
    expect(plays().filter((s) => s.endsWith('.ogg')), 'no .ogg played anywhere').toEqual([]);
  });

  it('says "default track" in the Controls row for an empty battle slot', () => {
    const { w } = bootWithAudio();
    w.eval("go('controls')");
    const row = w.document.querySelectorAll('#customMusic .musicrow')[2];   // title, menu, battle
    expect(row.textContent).toContain('Battles');
    expect(row.textContent).toContain('default track');
    expect(row.textContent, 'the playlist it used to name is gone').not.toMatch(/playlist|10 tracks/i);
  });

  it('plays the battle bed locally for an online client, and puts nothing about it on the wire', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await lands(plays, 'assets/music/menu.mp3');
    w.eval(`(function(){
      NET.role = 'client'; NET.myId = 'me'; NET.room = 'QXTR'; NET.sent = [];
      NET.ws = { readyState: 1, send: function(t){ NET.sent.push(t); }, close: function(){} };
      NET.players = [{ id: 'h', isHost: true }, { id: 'me' }]; NET.myIdx = 1;
      NET.beginMatch({ mode: 'ffa', count: 2, stocks: 3 }, ['Firey', 'Leafy']);
    })()`);
    await landsBattle(plays);
    expect(plays().at(-1)).toBe(BATTLE);
    expect(w.eval('SND._kind')).toBe('battle');
    expect(w.eval('JSON.stringify(NET.sent)')).not.toMatch(/\.(ogg|mp3)|music/i);
    expect(w.eval('JSON.stringify(serializeState())')).not.toMatch(/\.(ogg|mp3)|music/i);
  });
});

// "make 'one' and 'cobs' PLAYER-LOADABLE contexts in the player's own music settings ... labelled like "One's fight" and
// "Steve Cobs's fight", so a player (the owner included) can load their own copy of any track locally" -- the owner's answer
// ("ok :(", 2026-09-29) to the DELTARUNE tracks leaving the deploy. The two fights borrow a cleared track (tourney.mp3, boss.mp3)
// by default; a player's own file for either goes through the very same IndexedDB path as every other slot, never leaves the
// browser, and outranks both custom/<context>.mp3 and the cleared default. The rows themselves wait until the boss has been met:
// the game never names either secret boss before their card, and a settings row labelled with the name would.
describe('background music — the two secret-fight beds are player-loadable', () => {
  const FIGHTS = [['one', "One's fight", 'tourney'], ['cobs', "Steve Cobs's fight", 'boss']];

  it('are contexts of their own, labelled by name, next to the other six', () => {
    const { w } = bootWithAudio();
    expect(JSON.parse(w.eval('JSON.stringify(MUSIC_CONTEXTS)')))
      .toEqual(['title', 'menu', 'battle', 'boss', 'tourney', 'intense', 'one', 'cobs']);
    for (const [kind, label] of FIGHTS) expect(w.eval(`MUSIC_CONTEXT_LABEL.${kind}`)).toBe(label);
  });

  it("plays the player's own track above custom/<context>.mp3 and the cleared default, and falls back when it is cleared", async () => {
    const { w, plays, gesture } = bootWithAudio({ existing: ['assets/music/custom/one.mp3'] });
    gesture(); await tick();
    for (const [kind, , file] of FIGHTS) {
      w.eval(`musicSetUserTrack('${kind}', new Blob(['x']), 'my-${kind}.mp3')`);
      w.eval(`startMusic('${kind}')`);
      await until(() => /^blob:/.test(plays().at(-1)));
      expect(plays().at(-1), `${kind}: the player's own track plays`).toMatch(/^blob:/);
      const order = JSON.parse(w.eval(`JSON.stringify(musicSources('${kind}'))`));
      expect(order[0]).toMatch(/^blob:/);
      expect(order[1], 'the owner slot is next').toBe(`assets/music/custom/${kind}.mp3`);
      expect(order.at(-1), 'and the cleared default last').toBe(`assets/music/${file}.mp3`);
      w.eval(`musicClearUserTracks('${kind}')`);
      // `one` has an owner file in this boot (custom/one.mp3); `cobs` steps past its empty slot to the cleared default
      await lands(plays, kind === 'one' ? 'assets/music/custom/one.mp3' : `assets/music/${file}.mp3`);
      expect(w.eval(`!!SND._userList['${kind}']`)).toBe(false);
    }
  });

  it('persist under their own keys in IndexedDB, and come back on the first gesture', async () => {
    const { w, gesture } = bootWithAudio();
    gesture(); await tick();
    w.eval("musicPickFile('one', { files:[{name:'hers.mp3',size:10}], value:'' })");
    w.eval("musicPickFile('cobs', { files:[{name:'his.mp3',size:10}], value:'' })");
    await tick(20);
    expect(JSON.parse(w.eval("JSON.stringify(__idb._data.get('one').map(t=>t.name))"))).toEqual(['hers.mp3']);
    expect(JSON.parse(w.eval("JSON.stringify(__idb._data.get('cobs').map(t=>t.name))"))).toEqual(['his.mp3']);
    // ...and a save written earlier is restored, like every other context's.
    const two = bootWithAudio({ idb: { one: [{ blob: { fake: 1 }, name: 'saved-one.mp3' }], cobs: [{ blob: { fake: 2 }, name: 'saved-cobs.mp3' }] } });
    two.gesture();
    await until(() => two.w.eval("!!SND._userList['one'] && !!SND._userList['cobs']"));
    expect(JSON.parse(two.w.eval("JSON.stringify(SND._userList['one'].map(t=>t.name))"))).toEqual(['saved-one.mp3']);
    expect(JSON.parse(two.w.eval("JSON.stringify(SND._userList['cobs'].map(t=>t.name))"))).toEqual(['saved-cobs.mp3']);
  }, 20000);   // a second boot inside one test

  it("draws each fight's row only once that boss has been met -- or a track is loaded into it", async () => {
    const { w, gesture } = bootWithAudio();
    await w.eval('profileReady');     // the saved profile hydrates asynchronously; let it land before the test sets its own
    const rowsText = () => [...w.document.querySelectorAll('#customMusic .musicrow')].map((r) => r.textContent);
    w.eval("go('controls')");
    expect(rowsText(), 'a fresh player sees the six ordinary rows').toHaveLength(6);
    expect(rowsText().join('|'), 'and neither secret boss is named').not.toMatch(/One's fight|Cobs/);
    // The moon has broken but her card is not up yet, and the Vault has not opened his door: still hidden.
    w.eval("PROFILE = { one:{ stage: ONE_STAGE.MOON }, cobs:{ stage: COBS_STAGE.LIVE } }; buildCustomMusic();");
    expect(rowsText()).toHaveLength(6);
    // Her card is due on the title: hers appears, with what an empty slot plays.
    w.eval("PROFILE.one.stage = ONE_STAGE.CHALLENGE; buildCustomMusic();");
    expect(rowsText()).toHaveLength(7);
    expect(rowsText()[6]).toContain("One's fight");
    expect(rowsText()[6]).toContain('default track');
    // His door is open: his joins, last.
    w.eval("PROFILE.cobs.stage = COBS_STAGE.DOOR; buildCustomMusic();");
    expect(rowsText()).toHaveLength(8);
    expect(rowsText()[7]).toContain("Steve Cobs's fight");
    for (const kind of ['one', 'cobs']) {
      const input = w.document.getElementById(`mfile_${kind}`);
      expect(input.accept).toBe('audio/*');
      expect(input.multiple, 'a playlist, like every other slot').toBe(true);
    }
    // A saved track keeps its row on screen even on a profile that has not met the boss (a reset save, another browser).
    w.eval("PROFILE = { one:{ stage:0 }, cobs:{ stage:0 } }; buildCustomMusic();");
    expect(rowsText()).toHaveLength(6);
    gesture(); await tick();
    w.eval("musicSetUserTrack('cobs', new Blob(['x']), 'his-own.mp3'); buildCustomMusic();");
    expect(rowsText()).toHaveLength(7);
    expect(rowsText()[6]).toContain("Steve Cobs's fight");
    expect(rowsText()[6]).toContain('his-own.mp3');
  });

  it('puts nothing about a loaded fight track on the wire', async () => {
    const { w, gesture } = bootWithAudio();
    gesture(); await tick();
    w.eval("musicSetUserTrack('one', new Blob(['x']), 'private-one.mp3'); musicSetUserTrack('cobs', new Blob(['y']), 'private-cobs.mp3')");
    w.eval('startMatch()');
    await tick();
    const wire = w.eval('JSON.stringify(serializeState())');
    expect(wire).not.toMatch(/blob:/);
    expect(wire).not.toMatch(/private-/);
    expect(wire).not.toMatch(/music/i);
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
    // Six for a fresh player. One's and Steve Cobs's rows join them once that boss has been met (see "the two
    // secret-fight beds are player-loadable" above): the game never names either before their card.
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
    expect(plays().at(-1), 'the match starts on battle.mp3').toBe(BATTLE);
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
    expect(plays().at(-1), 'back to battle.mp3').toBe(BATTLE);
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
    expect(plays().at(-1), 'still battle.mp3, not the clutch bed').toBe(BATTLE);
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
    expect(plays().at(-1), 'the new fight starts on battle.mp3').toBe(BATTLE);
  });
});

describe('background music — crossfade', () => {
  // This raced the wall clock and lost under load. musicFadeTick computes progress as
  // (performance.now() - t0) / SND.fadeMs on a 40ms interval, so a test that sleeps 60ms and then
  // asserts "mid-crossfade" is really asserting that the machine got back within 400ms. In the full
  // suite it often did not, the fade had already finished, and the outgoing deck was parked — one
  // deck live where the test wanted two. It passed alone and failed in company, which is the
  // signature.
  //
  // The fade is now DRIVEN rather than waited on: fadeMs is set far longer than any plausible
  // overshoot so the background interval cannot finish it behind our back, and the test moves t0
  // to land exactly on the progress it wants to inspect. Same real crossfade code, no clock race.
  const FADE = 20000;
  // Poll for a condition instead of sleeping and hoping. Returns false on timeout so the caller
  // fails with its own message rather than on a confusing downstream assertion.
  const until = async (fn, ms = 5000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { if (fn()) return true; await tick(10); }
    return false;
  };
  const advance = (w, frac) => w.eval(`
    (function(){
      for (var i=0;i<SND._fade.length;i++){ if(SND._fade[i]) SND._fade[i].t0 -= SND.fadeMs*${frac}; }
      musicFadeTick();
    })()`);

  it('overlaps the two decks and parks the outgoing one', async () => {
    const { w, gesture, decks } = bootWithAudio({ fadeMs: FADE });
    // Steady state: the empty custom/ slots have already been probed once, so each switch is a
    // single clean hop. (With the probe still pending the outgoing deck is a 404'd element, which
    // is genuinely paused and would make "two decks live" the wrong thing to assert.)
    w.eval("SND._badSrc['assets/music/custom/menu.mp3']=true;SND._badSrc['assets/music/custom/intense.mp3']=true");

    // Both waits are POLLS, not sleeps. Driving the fade clock fixed the fade race but left a
    // second one at the start: a deck begins playing on a resolved play() promise, so under load
    // `await tick(30)` could return before the menu deck was live. Switching then left exactly one
    // deck in the whole test and the crossfade assertion had nothing to see — the same symptom as
    // the fade race, a different cause.
    gesture();
    expect(await until(() => decks().some((d) => d && !d.paused)), 'menu deck never started').toBe(true);

    w.eval("startMusic('intense')");
    expect(await until(() => decks().filter((d) => d && !d.paused).length === 2),
      'the incoming deck never started, so there was nothing to cross-fade').toBe(true);

    advance(w, 0.5);         // exactly half way through the crossfade
    const mid = decks();
    // both decks live, one on the way up and one on the way down
    expect(mid.filter((d) => d && !d.paused)).toHaveLength(2);
    expect(mid.find((d) => d && d.src.includes('intense')).vol).toBeGreaterThan(0);

    advance(w, 1);           // and past the end of it
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
    expect(plays().at(-1), 'battle.mp3 is the match bed').toBe(BATTLE);
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
    expect(plays().at(-1), 'the match bed is battle.mp3').toBe(BATTLE);
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
  }, 20000);   // a second boot inside one test: it timed out at the 5 s default on every loaded run of 2026-09-14

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

// The synth bed is the FALLBACK, never a layer. It shipped as both: a source that 404s rejects
// play(), the rejection handler read that as an autoplay block, started the synth as cover and
// parked a retry — and nothing turned either off when the next source in the chain loaded. Since
// assets/music/custom/ is empty as shipped, every context 404s on the way to the file it plays,
// so essentially every player heard the synth looping underneath the recorded track.
describe('background music — exactly one bed is ever audible', () => {
  it('stops the synth bed when a 404 chain finally lands on a real file', async () => {
    const { w, plays, gesture } = bootWithAudio();     // custom/ empty, title.mp3 unshipped
    gesture();                                          // cold load: the title bed, 3 x 404 deep
    await lands(plays, 'assets/music/menu.mp3');
    await tick(20);                                     // let every late promise settle
    expect(plays()[0]).toBe('assets/music/custom/title.mp3');   // it really did walk the chain
    const b = expectOneBed(w, 'assets/music/menu.mp3');
    expect(b.synth, 'the synth bed is still looping under the file').toBe(false);
    expect(b.pending, 'a stale retry is armed and will restart this bed on the next click').toBe(null);
  });

  it('ignores a dead source rejecting play() long after the chain moved on', async () => {
    const { w, plays, gesture } = bootWithAudio({ rejectDelay: 40 });
    gesture();
    await lands(plays, 'assets/music/menu.mp3');       // the good file wins the chain first...
    await tick(140);                                    // ...then the three 404s report in, late
    const b = expectOneBed(w, 'assets/music/menu.mp3');
    expect(b.synth, 'a stale rejection resurrected the synth under the file').toBe(false);
    expect(b.pending, 'a stale rejection re-armed a retry for a bed already playing').toBe(null);
  });

  it('leaves one bed after every title -> select -> battle -> boss step', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await lands(plays, 'assets/music/menu.mp3'); await tick(20);
    expectOneBed(w, 'assets/music/menu.mp3');
    w.eval("go('select')"); await tick(20);
    expectOneBed(w, 'assets/music/menu.mp3');
    w.eval("SETTINGS.mode='ffa'; SETTINGS.stocks=3; startMatch()");
    await landsBattle(plays); await tick(20);
    expectOneBed(w, BATTLE);                            // battle.mp3, alone
    w.eval("SETTINGS.mode='boss'; beginMatchNow()");
    await lands(plays, 'assets/music/boss.mp3'); await tick(20);
    expectOneBed(w, 'assets/music/boss.mp3');
  });

  it('stops a synth bed underneath the deck it adopts', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await lands(plays, 'assets/music/menu.mp3'); await tick(20);
    // startMusicFile() gets re-entered straight from a deck `error` (musicSourceFailed does
    // exactly that), so it cannot lean on startMusic() having cleared the synth for it. Put a bed
    // underneath the live deck and ask for the file that deck is already playing.
    w.eval('SND._musicTimer = setTimeout(()=>{}, 9999)');
    expect(w.eval("startMusicFile('menu')")).toBe(true);
    expectOneBed(w, 'assets/music/menu.mp3');
  });

  it('silences a still-playing deck when a context gives up and takes the synth', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await lands(plays, 'assets/music/menu.mp3'); await tick(20);
    // musicSourceFailed() hands a used-up context to the synth directly, without passing through
    // startMusic()'s fall-through — so the synth's way in silences the decks itself rather than
    // trust that a crossfade already did. Here the live deck is playing and nothing faded it out.
    w.eval("SND._badSrc['assets/music/boss.mp3']=true; SND._badSrc['assets/music/custom/boss.mp3']=true");
    w.eval("SND._kind='boss'; SND._deckKind[SND._deck]='boss'; musicSourceFailed(SND._deck)");
    await tick(20);
    const b = expectOneBed(w);
    expect(b.synth, 'the context is out of files — the synth bed is the one that should be left').toBe(true);
  });

  it('crossfades into the clutch bed and back without stacking a third source', async () => {
    const { w, plays, gesture } = bootWithAudio({ fadeMs: 0 });
    gesture(); await tick();
    w.eval("SETTINGS.mode='ffa'; SETTINGS.stocks=3; startMatch()");
    await landsBattle(plays); await tick(20);
    w.eval('fighters[0].stocks = 1; clutchTick()');
    await lands(plays, 'assets/music/intense.mp3'); await tick(20);
    expect(w.eval('CLUTCH.on')).toBe(true);
    expectOneBed(w, 'assets/music/intense.mp3');
    w.eval('fighters.forEach(f=>{f.stocks=3;f.pct=0;});');
    for (let i = 0; i <= w.eval('CLUTCH_MIN_HOLD'); i += 1) w.eval('clutchTick()');
    await landsBattle(plays); await tick(20);
    expect(w.eval('CLUTCH.on')).toBe(false);
    expectOneBed(w, BATTLE);                            // back on battle.mp3, alone
  });

  it('re-rolls a playlist onto one bed, not two', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await tick();
    w.eval("musicAddUserTracks('boss', [{name:'a.mp3',blob:new Blob(['a'])},{name:'b.mp3',blob:new Blob(['b'])}], true)");
    w.eval("SETTINGS.mode='boss'; beginMatchNow()");
    await until(() => plays().at(-1).startsWith('blob:')); await tick(20);
    expectOneBed(w);
    const first = w.eval("SND._userPick['boss']");
    w.eval('spawnBossRushBoss()');                    // a new boss no longer cuts the track (the owner, 2026-10-07: "finishes a track before going to the next")...
    w.eval(`var d = SND._decks[SND._deck]; d.ended = true; d.paused = true; (d._on.ended || []).forEach(function(f){ f(); });`);   // ...the track ending rolls the next
    await until(() => w.eval("SND._userPick['boss']") !== first); await tick(20);
    const b = expectOneBed(w);
    expect(b.decks[0]).toBe(w.eval("SND._userPick['boss']"));
  });

  it('lands on one bed after the music toggle goes off and back on', async () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture(); await lands(plays, 'assets/music/menu.mp3'); await tick(20);
    w.eval('toggleMusic()'); await tick(20);
    const off = beds(w);
    expect(off.decks.concat(off.synth ? ['<synth bed>'] : [])).toEqual([]);
    w.eval('toggleMusic()'); await lands(plays, 'assets/music/menu.mp3'); await tick(20);
    expectOneBed(w, 'assets/music/menu.mp3');
  });

  // The other half of the fix: the rejection handler still has a real job. A source the browser
  // CAN load but refuses to autoplay has no `error` event and no next source coming, so it must
  // keep the synth cover and park the retry — otherwise this context is simply silent.
  it('still covers a genuinely blocked play() with the synth, and retries on the next gesture', async () => {
    const { w, plays, gesture, blockPlay } = bootWithAudio({ blockPlay: true });
    gesture(); await tick(30);
    const b = expectOneBed(w);
    expect(b.synth, 'a refused autoplay must not leave the context silent').toBe(true);
    expect(b.pending, 'and it must arm a retry for the next gesture').toBe('title');
    blockPlay(false);
    gesture(); await lands(plays, 'assets/music/menu.mp3'); await tick(20);
    expectOneBed(w, 'assets/music/menu.mp3');         // and the retry hands the bed back over
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

  it('no longer credits the ten DELTARUNE battle-playlist tracks: they are not shipped', () => {
    // These two tests used to demand that CREDITS.md name each of the ten files and that the title screen credit Toby Fox
    // and Materia Music Publishing, because every visitor heard them. The owner, asked "Remove them from the public site
    // and installer?", answered "ok :(" on 2026-09-29 (the DELTARUNE FAQ: "Please don't re-upload the soundtracks
    // anywhere."; Materia's licensing page: no use "in conjunction with any AI content or AI personas/vtubers/agents"), so
    // the credit went with the music. What CREDITS.md keeps is the record that they are NOT shipped, and why.
    const TEN = ['Flowerman_Arrangement', 'ch4_extra_boss', 'joker', 'knight', 'pink', 'pumpkin_boss',
      'queen_boss', 'spamton_neo_mix_ex_wip', 'tenna_battle', 'titan_battle'].map((n) => `${n}.ogg`);
    for (const f of TEN) expect(credits, `CREDITS.md still lists ${f}`).not.toContain(f);
    expect(credits).not.toMatch(/Owner-supplied Deltarune tracks/);
    expect(credits).toMatch(/Music that is not shipped/);
    expect(credits).toMatch(/No \*Deltarune\* or \*Undertale\* music ships/);
    const html = readFileSync(SRC, 'utf8');
    const line = html.split('\n').find((l) => l.includes('id="musicCredits"')) || '';
    expect(line, 'the title-screen credit line still credits music that does not ship').not.toMatch(/Deltarune|Toby Fox|Camellia|Materia/i);
    expect(line, 'and it still points at the full credits').toContain('assets/music/CREDITS.md');
  });

  it('no longer invites anyone to publish Undertale/Deltarune music in custom/', () => {
    // It used to carry a ready-to-use credit template for owner-supplied Toby Fox music (composer plus Materia as the
    // rights administrator) and a README section on how to publish it under a fan-use policy. custom/ is served to every
    // visitor, so that is a re-upload of the soundtrack, and Materia does not permit its music beside AI features (this
    // game has an AI teammate). "ok :(" (the owner, 2026-09-29): the template is gone and the README says do not.
    expect(credits, 'no credit template for Toby Fox tracks').not.toMatch(/Rights administrator/);
    expect(credits).not.toMatch(/TEMPLATE \(Undertale/);
    const readme = readFileSync(`${PUB}/assets/music/custom/README.md`, 'utf8');
    expect(readme).toMatch(/do not put it here/i);
    expect(readme).toMatch(/re-upload the\s+soundtracks/);
    expect(readme).toMatch(/AI/);
    expect(readme, 'and it says where a player CAN load their own copy').toMatch(/Custom Music/);
    expect(readme).not.toMatch(/Buy the soundtrack/);
    for (const kind of ['menu', 'battle', 'boss', 'tourney', 'intense']) {
      expect(readme).toContain(`${kind}.mp3`);
    }
    expect(readme, 'there is no shipped playlist between custom/ and the default any more').not.toMatch(/shipped playlist/);
  });
});
