import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// Wave 3.5 — the remaining four presentation features.

describe('Cake at Stake', () => {
  it('fires only on the LAST stock, not on every KO', () => {
    const { window: w } = loadMonolith();
    const out = w.eval(`
      (function(){
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.stocks=3; beginMatchNow();
        var f = fighters[0];
        CAKE_FX = null;
        f.stocks = 3; eliminate(f);
        var afterFirst = CAKE_FX;
        f.stocks = 1; f.dead = false; f.alive = true; eliminate(f);
        return [!!afterFirst, !!CAKE_FX, CAKE_FX && CAKE_FX.name];
      })()`);
    expect(out[0], 'a mid-match KO is not a ceremony').toBe(false);
    expect(out[1], 'losing the last stock is').toBe(true);
    expect(out[2]).toBeTruthy();
  });

  it('decays on its own and never draws forever', () => {
    const { window: w } = loadMonolith();
    const gone = w.eval(`
      (function(){
        CAKE_FX = { name:'X', color:'#fff', t:78 };
        for (var i=0;i<200;i++) drawCakeAtStake();
        return CAKE_FX;
      })()`);
    expect(gone, 'the stinger cleans itself up').toBe(null);
  });

  it('is safe to draw when nothing is happening', () => {
    const { window: w } = loadMonolith();
    expect(() => w.eval(`CAKE_FX = null; for (var i=0;i<10;i++) drawCakeAtStake();`)).not.toThrow();
  });
});

// The result screen plays the last couple of seconds back in slow motion. It reuses the share-clip
// ring the GIF export already fills, so it adds no capture cost — and it has to stay a bystander:
// it may not block a button, may not outlive the screen, and may not hold onto a match's pixels.
describe('KO instant replay', () => {
  // jsdom's rAF is stubbed out by the harness, so install a hand-cranked one: `__pump(n)` runs n
  // display frames, which is the only way to assert on playback SPEED rather than on wiring.
  function manualRaf(w) {
    w.eval(`
      window.__raf = { next:1, cbs:{} };
      window.requestAnimationFrame = function(f){ var id=window.__raf.next++; window.__raf.cbs[id]=f; return id; };
      window.cancelAnimationFrame = function(id){ delete window.__raf.cbs[id]; };
      window.__pump = function(n){
        for(var i=0;i<n;i++){
          var cbs = window.__raf.cbs; window.__raf.cbs = {};
          var ks = Object.keys(cbs);
          if(!ks.length) return i;
          for(var j=0;j<ks.length;j++) cbs[ks[j]](0);
        }
        return n;
      };`);
  }
  // Fill the share-clip ring the way a real match does: clipCapture only keeps every CLIP.EVERY'th
  // call, so this is n rendered frames, not n stored ones.
  const fillRing = (w, n) => w.eval(`clipReset(); for(var i=0;i<${n};i++) clipCapture(); clipFrames().length`);

  function replayHost(w) {
    return w.eval(`
      (function(){
        var host = document.getElementById('rrReplay');
        if(!host){ host = document.createElement('div'); host.id='rrReplay'; host.className='rr-replay-box';
                   document.getElementById('runReview').appendChild(host); }
        return true;
      })()`);
  }

  it('declines to play when there is no footage', () => {
    const { window: w } = loadMonolith();
    const ok = w.eval(`
      (function(){
        clipReset();
        var host = document.createElement('div');
        return startReplay(host);
      })()`);
    expect(ok, 'no frames means no replay, not a broken canvas').toBe(false);
  });

  it('stops cleanly, and leaving the result screen stops it', () => {
    const { window: w } = loadMonolith();
    expect(() => w.eval(`stopReplay(); stopReplay();`)).not.toThrow();
    const src = w.eval(`String(go)`);
    expect(src, 'a looping replay must not survive a screen change').toContain('stopReplay');
  });

  it('plays the tail of the ring, labelled, in its own container', () => {
    const { window: w } = loadMonolith();
    manualRaf(w);
    expect(fillRing(w, 48 * w.eval('CLIP.EVERY'))).toBe(w.eval('CLIP.MAX'));
    replayHost(w);
    expect(w.eval(`startReplay(document.getElementById('rrReplay'))`)).toBe(true);
    const host = w.document.getElementById('rrReplay');
    expect(host.classList.contains('on')).toBe(true);
    expect(host.querySelectorAll('canvas.rr-replay')).toHaveLength(1);
    expect(host.textContent, 'a tasteful label, not a mystery box').toContain('REPLAY');
    // The tail, not the whole ring: ~2s of match out of the ring's ~4.
    expect(w.eval('REPLAY.frames.length')).toBe(w.eval('REPLAY_TAIL'));
    expect(w.eval('REPLAY_TAIL')).toBeLessThan(w.eval('CLIP.MAX'));
  });

  it('runs in slow motion — one captured frame per several display frames', () => {
    const { window: w } = loadMonolith();
    manualRaf(w);
    fillRing(w, 48 * w.eval('CLIP.EVERY'));
    replayHost(w);
    w.eval(`startReplay(document.getElementById('rrReplay'))`);
    const hold = w.eval('REPLAY_HOLD');
    expect(hold, 'a capture is ~12fps; holding each one <5 display frames would be fast-forward')
      .toBeGreaterThanOrEqual(5);
    expect(w.eval('REPLAY.i')).toBe(0);
    w.eval(`__pump(${hold - 2})`);
    expect(w.eval('REPLAY.i'), 'still on the first captured frame').toBe(0);
    w.eval('__pump(2)');
    expect(w.eval('REPLAY.i'), 'and only now on the second').toBe(1);
  });

  it('loops a couple of times, then stops for good and releases the frames', () => {
    const { window: w } = loadMonolith();
    manualRaf(w);
    fillRing(w, 48 * w.eval('CLIP.EVERY'));
    replayHost(w);
    w.eval(`startReplay(document.getElementById('rrReplay'))`);
    const perPass = w.eval('(REPLAY_TAIL - 1) * REPLAY_HOLD + REPLAY_PAUSE');
    w.eval(`__pump(${perPass + 5})`);
    expect(w.eval('REPLAY.loops'), 'one pass down').toBe(1);
    expect(w.eval('REPLAY.raf'), 'still running').not.toBe(0);
    w.eval(`__pump(${perPass * 2})`);
    expect(w.eval('REPLAY.loops')).toBe(w.eval('REPLAY_LOOPS'));
    expect(w.eval('REPLAY.raf'), 'nothing left scheduled').toBe(0);
    expect(w.eval('REPLAY.frames'), 'and no match pixels pinned by the result screen').toBe(null);
    // Frozen on the KO, not blanked.
    expect(w.document.getElementById('rrReplay').querySelectorAll('canvas')).toHaveLength(1);
  });

  it('drops every frame reference when it is stopped mid-loop', () => {
    const { window: w } = loadMonolith();
    manualRaf(w);
    fillRing(w, 48 * w.eval('CLIP.EVERY'));
    replayHost(w);
    w.eval(`startReplay(document.getElementById('rrReplay'))`);
    w.eval('__pump(20)');
    expect(w.eval('!!REPLAY.frames')).toBe(true);
    w.eval('stopReplay()');
    expect(w.eval('REPLAY.frames')).toBe(null);
    expect(w.eval('REPLAY.ctx')).toBe(null);
    expect(w.eval('REPLAY.raf')).toBe(0);
    expect(w.document.getElementById('rrReplay').innerHTML, 'container emptied too').toBe('');
    w.eval('__pump(200)');
    expect(w.eval('REPLAY.i'), 'a cancelled loop does not keep advancing').toBe(0);
  });

  it('never fires on a tournament sim or a spectated fixture', () => {
    const { window: w } = loadMonolith();
    manualRaf(w);
    fillRing(w, 48 * w.eval('CLIP.EVERY'));
    replayHost(w);
    for (const guard of ['TOURNEY_MATCH_ACTIVE = true', 'TOURNEY_WATCHING = {kind:"ko"}',
      'TESTMODE.active = true', 'TUT.active = true']) {
      w.eval(`TOURNEY_MATCH_ACTIVE=false; TOURNEY_WATCHING=null; TESTMODE.active=false; TUT.active=false; ${guard}`);
      expect(w.eval(`startReplay(document.getElementById('rrReplay'))`), `${guard} must suppress it`)
        .toBe(false);
      expect(w.document.getElementById('rrReplay').innerHTML).toBe('');
    }
    w.eval('TOURNEY_MATCH_ACTIVE=false; TOURNEY_WATCHING=null; TESTMODE.active=false; TUT.active=false;');
    expect(w.eval(`startReplay(document.getElementById('rrReplay'))`), 'a real match still replays')
      .toBe(true);
  });

  it('cannot swallow a click meant for the result screen buttons', () => {
    const { window: w } = loadMonolith();
    const css = w.document.documentElement.innerHTML;
    expect(css, 'the replay box is inert to the pointer in every state')
      .toMatch(/\.rr-replay-box\{[^}]*pointer-events:none/);
    manualRaf(w);
    fillRing(w, 48 * w.eval('CLIP.EVERY'));
    w.eval(`RUN_REC.supported = true; RUN_REC.url = 'blob:fake'; showRunReview();`);
    expect(w.document.querySelectorAll('#rrReplay button, #rrReplay a')).toHaveLength(0);
    // Rematch / Change fighter / Title are siblings of the review panel, never inside it.
    expect(w.document.querySelectorAll('#result > .row .btn').length).toBeGreaterThanOrEqual(3);
    expect(w.document.querySelectorAll('#runReview #result')).toHaveLength(0);
  });

  it('survives Make GIF, which used to share its container', () => {
    const { window: w } = loadMonolith();
    manualRaf(w);
    fillRing(w, 48 * w.eval('CLIP.EVERY'));
    w.eval(`RUN_REC.supported = true; RUN_REC.url = 'blob:fake'; showRunReview();`);
    expect(w.document.querySelectorAll('#rrReplay canvas')).toHaveLength(1);
    return w.eval(`clipReset(); shareMakeGif()`).then(() => {
      expect(w.document.getElementById('rrShare').innerHTML).toContain('No clip captured');
      expect(w.document.querySelectorAll('#rrReplay canvas'), 'the replay is still there')
        .toHaveLength(1);
    });
  });

  it('leaves the result screen exactly as it was when recording is unavailable', () => {
    const { window: w } = loadMonolith();
    manualRaf(w);
    fillRing(w, 48 * w.eval('CLIP.EVERY'));
    w.eval(`RUN_REC.supported = false; RUN_REC.url = null; showRunReview();`);
    const html = w.document.getElementById('runReview').innerHTML;
    expect(html).toContain("isn't supported");
    expect(w.document.getElementById('rrReplay'), 'no replay container at all').toBe(null);
    expect(w.eval('REPLAY.raf')).toBe(0);
    expect(w.eval('REPLAY.frames')).toBe(null);
  });
});

describe('Daily Match', () => {
  it('gives everyone the same pairing on the same day', () => {
    const { window: w } = loadMonolith();
    const a = w.eval(`JSON.stringify(dailyMatchup(dailySeed(new Date(Date.UTC(2026,7,11)))))`);
    const b = w.eval(`JSON.stringify(dailyMatchup(dailySeed(new Date(Date.UTC(2026,7,11)))))`);
    expect(a).toBe(b);
  });

  it('changes from day to day', () => {
    const { window: w } = loadMonolith();
    const pairs = new Set();
    for (const d of [11, 12, 13, 14, 15]) {
      pairs.add(w.eval(`
        (function(){
          var m = dailyMatchup(dailySeed(new Date(Date.UTC(2026,7,${d}))));
          return m.you.name + '|' + m.foe.name;
        })()`));
    }
    expect(pairs.size, 'five days should not all be the same matchup').toBeGreaterThan(2);
  });

  it('never pits a fighter against themselves', () => {
    const { window: w } = loadMonolith();
    const same = w.eval(`
      (function(){
        var bad = 0;
        for (var i=0;i<400;i++){
          var m = dailyMatchup(i*7919);
          if (m.you === m.foe) bad++;
        }
        return bad;
      })()`);
    expect(same).toBe(0);
  });

  it('only counts an attempt from the same day', () => {
    // Yesterday's attempt must not lock today out.
    const { window: w } = loadMonolith();
    const stale = w.eval(`
      (function(){
        return dailySeed(new Date(Date.UTC(2026,7,11))) !== dailySeed(new Date(Date.UTC(2026,7,12)));
      })()`);
    expect(stale, 'the seed rolls over daily').toBe(true);
  });

  it('renders the card as text, never as markup', () => {
    const { window: w } = loadMonolith();
    const src = w.eval(`String(refreshDailyCard)`);
    expect(src, 'roster names go in via textContent').toContain('textContent');
    expect(src, 'and never via innerHTML assignment of names').not.toMatch(/innerHTML\s*=\s*[^'"]*\+/);
  });
});

describe('crowd cameos', () => {
  it('draws without touching the simulation', () => {
    const { window: w } = loadMonolith();
    const out = w.eval(`
      (function(){
        SETTINGS.mode='ffa'; SETTINGS.count=3; beginMatchNow();
        var before = [fighters.length, particles.length, projectiles.length];
        for (var i=0;i<30;i++) drawCrowd();
        return [before, [fighters.length, particles.length, projectiles.length]];
      })()`);
    expect(out[1], 'the crowd is decoration and must not spawn anything').toEqual(out[0]);
  });

  it('is safe before a match has ever started', () => {
    const { window: w } = loadMonolith();
    expect(() => w.eval(`drawCrowd()`)).not.toThrow();
  });

  it('reacts to a KO rather than idling identically forever', () => {
    // The crowd hops for a moment after any elimination; that reaction is keyed off lastKoFrame.
    const { window: w } = loadMonolith();
    const src = w.eval(`String(drawCrowd)`);
    expect(src, 'the reaction is driven by the last KO').toContain('lastKoFrame');
  });
});
