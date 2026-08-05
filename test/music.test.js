import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { JSDOM } from 'jsdom';

// Background music — the recorded loops in artifacts/V1/assets/music, wired under the existing
// Sound toggle. Three properties are load-bearing and easy to regress silently:
//
//  1. No <audio> element may be constructed at load time. The golden recorder and every other
//     suite boot this file in jsdom, where the media stack is unimplemented; a top-level
//     `new Audio()` would make the harness noisy at best and throwing at worst.
//  2. No autoplay. Browsers reject play() before a user gesture. A request made too early has to
//     be parked and replayed from the existing first-gesture unlock, not fired and lost — the
//     failure mode is a permanently silent game that looks fine in dev where the tab is focused.
//  3. A missing/undecodable file must degrade to the original synth bed, never to silence.
//
// jsdom has no Web Audio and an unimplemented HTMLMediaElement, so this boots the monolith with a
// minimal fake AudioContext and a SPYING Audio class. The game's own music code runs unmodified;
// only the two platform constructors are stood in for.

const SRC = 'artifacts/V1/index.html';
const PUB = 'artifacts/V1';

function fakeNode() {
  const ramp = { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} };
  return { gain: ramp, frequency: ramp, connect() {}, type: '', start() {}, stop() {},
    buffer: null, getChannelData: () => new Float32Array(8) };
}

/** Boot the monolith with fake audio platform bits. Returns the window plus the event log. */
function bootWithAudio() {
  const html = readFileSync(SRC, 'utf8');
  const events = [];
  const state = { gestureFired: false, constructedEarly: 0 };
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
      window.AudioContext = class FakeAudioContext {
        constructor() {
          this.state = 'running'; this.currentTime = 0; this.sampleRate = 44100;
          this.destination = fakeNode();
        }
        createGain() { return fakeNode(); }
        createOscillator() { return fakeNode(); }
        createBufferSource() { return fakeNode(); }
        createBiquadFilter() { return fakeNode(); }
        createBuffer() { return { getChannelData: () => new Float32Array(8) }; }
        resume() {}
      };
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
      window.Audio = class SpyAudio {
        constructor() {
          if (!state.gestureFired) state.constructedEarly += 1;
          events.push(['construct', '']);
          this._src = ''; this.loop = false; this.preload = ''; this.volume = 1;
          this.paused = true; this.ended = false; this.currentTime = 0;
        }
        set src(v) { this._src = v; events.push(['src', v]); }
        get src() { return this._src; }
        addEventListener() {}
        play() { this.paused = false; events.push(['play', this._src]); return Promise.resolve(); }
        pause() { this.paused = true; events.push(['pause', this._src]); }
      };
    },
  });
  const w = dom.window;
  const plays = () => events.filter((e) => e[0] === 'play').map((e) => e[1]);
  const gesture = () => { state.gestureFired = true; w.dispatchEvent(new w.Event('pointerdown')); };
  return { w, events, plays, gesture, state };
}

describe('background music — the file layer', () => {
  it('declares exactly the four contexts, each backed by a real file on disk', () => {
    const { w } = bootWithAudio();
    const map = JSON.parse(w.eval('JSON.stringify(MUSIC_FILES)'));
    expect(Object.keys(map).sort()).toEqual(['battle', 'boss', 'menu', 'tourney']);
    for (const rel of Object.values(map)) {
      expect(existsSync(`${PUB}/${rel}`), `${rel} is missing`).toBe(true);
    }
  });

  it('constructs no audio element at boot', () => {
    const { events, w } = bootWithAudio();
    expect(events).toEqual([]);
    expect(w.eval('SND.gesture')).toBe(false);
  });

  it('never autoplays before a user gesture — it parks the request instead', () => {
    const { w, events } = bootWithAudio();
    w.eval("startMusic('menu')");
    expect(events).toEqual([]);                       // nothing constructed, nothing played
    expect(w.eval('SND._pendingKind')).toBe('menu');
  });

  it('starts the parked bed on the first gesture', () => {
    const { w, plays, gesture, state } = bootWithAudio();
    w.eval("startMusic('menu')");
    gesture();
    expect(state.constructedEarly).toBe(0);
    expect(plays()).toHaveLength(1);
    expect(plays()[0]).toContain('menu.mp3');
    expect(w.eval('SND._el.loop')).toBe(true);
    const vol = w.eval('SND._el.volume');
    expect(vol).toBeGreaterThan(0);
    expect(vol).toBeLessThan(0.6);                    // sits under the SFX, not over them
  });

  it('starts the menu bed on a cold load, where nothing ever called go()', () => {
    // The title screen carries class="active" in the HTML, so a fresh load never routes through
    // go('title') and nothing requests music. Found live: the front page sat silent until the
    // player navigated somewhere. The gesture unlock has to fall back to the active screen.
    const { w, plays, gesture } = bootWithAudio();
    expect(w.eval("document.querySelector('.screen.active').id")).toBe('title');
    gesture();                                        // first click anywhere, no navigation
    expect(plays()).toHaveLength(1);
    expect(plays()[0]).toContain('menu.mp3');
  });

  it('does not restart the loop when moving between screens that share a bed', () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture();
    w.eval("go('title')");
    const n = plays().length;
    expect(n).toBe(1);
    w.eval("go('select')");
    w.eval("go('controls')");
    w.eval("go('title')");
    expect(plays()).toHaveLength(n);                  // one continuous menu loop, not four restarts
  });

  it('gives each context its own track', () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture();
    for (const [kind, file] of [['menu', 'menu.mp3'], ['battle', 'battle.mp3'],
      ['boss', 'boss.mp3'], ['tourney', 'tourney.mp3']]) {
      w.eval(`startMusic('${kind}')`);
      expect(plays().at(-1), `${kind} should play ${file}`).toContain(file);
    }
  });

  it('routes the tournament hub to the anthem and a real match to the battle bed', () => {
    const { w, plays, gesture } = bootWithAudio();
    gesture();
    w.eval("go('tourneyHub')");
    expect(plays().at(-1)).toContain('tourney.mp3');
    w.eval('startMatch()');
    expect(plays().at(-1)).toContain('battle.mp3');
    w.eval("SETTINGS.mode='boss'; beginMatchNow()");
    expect(plays().at(-1)).toContain('boss.mp3');
  });
});

describe('background music — the sound toggle still owns everything', () => {
  it('silences the file layer when sound is turned off, and restores it', () => {
    const { w, events, plays, gesture } = bootWithAudio();
    gesture();
    w.eval("go('tourneyHub')");
    w.eval('toggleSound()');
    expect(w.eval('SND.on')).toBe(false);
    expect(events.at(-1)[0]).toBe('pause');
    expect(w.eval('SND._kind')).toBe(null);           // nothing left armed while muted
    const n = plays().length;
    w.eval("startMusic('battle')");
    expect(plays()).toHaveLength(n);                  // muted means muted, whoever asks
    w.eval('toggleSound()');
    expect(w.eval('SND.on')).toBe(true);
    expect(plays().at(-1)).toContain('tourney.mp3');  // resumes the bed the screen wants
  });
});

describe('background music — a broken file degrades, it does not break', () => {
  it('falls back to the synth loop when a track cannot be used', () => {
    const { w, gesture } = bootWithAudio();
    gesture();
    w.eval("SND._fileBad['boss']=true; startMusic('boss')");
    expect(w.eval('!!SND._musicTimer')).toBe(true);   // the original synth bed took over
    expect(w.eval('SND._kind')).toBe('boss');
    w.eval('stopMusic()');
    expect(w.eval('!!SND._musicTimer')).toBe(false);
  });

  it('boots and plays nothing at all on a platform with no media support', () => {
    // The real jsdom harness: no AudioContext, no usable Audio. Nothing may throw.
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
    expect(() => w.dispatchEvent(new w.Event('pointerdown'))).not.toThrow();
    expect(() => w.eval("go('title'); startMusic('menu'); startMusic('boss'); stopMusic()")).not.toThrow();
    expect(w.eval('SND._el')).toBe(null);             // no element was ever built
  });
});

describe('background music — credits', () => {
  let credits;
  beforeAll(() => { credits = readFileSync(`${PUB}/assets/music/CREDITS.md`, 'utf8'); });

  it('names an author, a source and a licence for every shipped track', () => {
    for (const f of ['menu.mp3', 'battle.mp3', 'boss.mp3', 'tourney.mp3']) {
      expect(credits).toContain(f);
    }
    expect(credits.match(/\*\*Author\*\*/g) || []).toHaveLength(4);
    expect(credits.match(/\*\*Source\*\*/g) || []).toHaveLength(4);
    expect(credits.match(/\*\*Licence\*\*/g) || []).toHaveLength(4);
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
});
