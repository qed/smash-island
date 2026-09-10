import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from './helpers/prng.js';

// The MECHANICS of the 59 smashes were already per-character — every playable fighter resolves to
// its own SMASHES entry and genericSmash() is unreachable for the roster. What was shared was
// everything the player can actually perceive: SFX.smash() was written and never called from
// anywhere (so every smash in the game was silent), the move names existed only as source comments,
// and the charge ring was hardcoded '#ffd23f' for all 59. SMASH_ID supplies the three.

function boot(seed = 4) {
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
      window.Math.random = mulberry32(seed);
      window.requestAnimationFrame = () => 0;
      window.cancelAnimationFrame = () => {};
    },
  });
  return dom.window;
}
const settle = (w) => w.eval('profileReady');

describe('every fighter has a smash identity', () => {
  it('covers all 59 playable fighters, and invents nobody', async () => {
    const w = await boot(); await settle(w);
    const r = w.eval(`
      (function(){
        var keys = ROSTER.filter(function(r){return r.play;}).map(function(r){return r.kit.special;});
        var missing = keys.filter(function(k){ return !SMASH_ID[k]; });
        var orphan  = Object.keys(SMASH_ID).filter(function(k){ return keys.indexOf(k) < 0; });
        return { fighters: keys.length, missing: missing, orphan: orphan };
      })()`);
    expect(r.fighters).toBe(59);
    expect(r.missing, 'fighters with no smash identity').toEqual([]);
    expect(r.orphan, 'identities for a fighter that does not exist').toEqual([]);
  });

  it('every move name is distinct — a shared name is not an identity', async () => {
    const w = await boot(); await settle(w);
    const names = w.eval('Object.keys(SMASH_ID).map(function(k){return SMASH_ID[k].name;})');
    expect(new Set(names).size, `duplicate move names: ${names.filter((n, i) => names.indexOf(n) !== i)}`).toBe(names.length);
    for (const n of names) expect(n.trim(), 'an empty move name').not.toBe('');
  });

  it('the author-written names survived — those are not ours to change', async () => {
    const w = await boot(); await settle(w);
    // These were in the SMASHES source comments before any of this existed.
    const authored = {
      serve: 'Grand Slam', beam: 'Prism Burst', gust: 'Cyclone', fly: 'Meteor Puff',
      dash: 'Shadow Blitz', counter: 'Riposte Stance', reflect: 'Mirror Field', ring: 'Resonance',
      define: 'Hardcover Slam', dribble: 'Slam Dunk', buynow: 'Flash Sale', sign: 'Cheer Boomerang',
    };
    const got = w.eval(`(function(){var o={}; ${JSON.stringify(Object.keys(authored))}.forEach(function(k){o[k]=SMASH_ID[k]&&SMASH_ID[k].name;}); return o;})()`);
    expect(got).toEqual(authored);
  });

  it('every sound is short enough to fire on every smash', async () => {
    const w = await boot(); await settle(w);
    const over = w.eval(`
      (function(){
        var bad=[];
        Object.keys(SMASH_ID).forEach(function(k){
          var s=SMASH_ID[k], end=0;
          (s.tones||[]).forEach(function(t){ end=Math.max(end,(t.t||0)+(t.d||0)); if(t.g>0.32) bad.push(k+' gain '+t.g); });
          if(s.noise){ end=Math.max(end,(s.noise.t||0)+(s.noise.d||0)); if(s.noise.g>0.32) bad.push(k+' noise gain '+s.noise.g); }
          if(end>0.45) bad.push(k+' runs '+end.toFixed(2)+'s');
          if(!(s.tones||[]).length && !s.noise) bad.push(k+' is silent');
        });
        return bad;
      })()`);
    expect(over, 'sounds that are too long or too loud to fire every smash').toEqual([]);
  });

  it('every colour is a readable hex, and the ring uses it', async () => {
    const w = await boot(); await settle(w);
    const r = w.eval(`
      (function(){
        var bad = Object.keys(SMASH_ID).filter(function(k){ return !/^#[0-9a-fA-F]{6}$/.test(SMASH_ID[k].color); });
        // smashColorOf must read the table, not the old hardcoded yellow.
        var f = makeFighter(ROSTER.find(function(r){return r.name==='Ruby';}), 0, 0, 0);
        return { bad: bad, ruby: smashColorOf(f), unknown: smashColorOf({}) };
      })()`);
    expect(r.bad, 'malformed colours').toEqual([]);
    expect(r.ruby).toBe('#ff2a4a');
    expect(r.unknown, 'a fighter with no identity should fall back, not throw').toBe('#ffd23f');
  });
});

describe('a smash announces itself', () => {
  it('doSmash plays the fighter\'s own sound, not the generic one', async () => {
    const w = await boot(); await settle(w);
    const r = w.eval(`
      (function(){
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
        fighters=[ makeFighter(ROSTER.find(function(r){return r.name==='Bell';}), 300, groundY()-60, 0),
                   makeFighter(ROSTER.filter(function(r){return r.play;})[1], 360, groundY()-60, 1) ];
        fighters[0].team=0; fighters[1].team=1;
        fighters.forEach(function(f){ f.controller='still'; f.stocks=9; });
        fighters[0].you = true;
        summons=[]; projectiles=[];
        // Capture what reaches the audio layer. SND.on is false headless, so drive the table directly.
        var played=[], generic=0;
        var _tone=tone, _noise=noise, _sfx=SFX.smash;
        SND.on = true;
        tone = function(f,d,t,g,w,to){ played.push({f:f,d:d,t:t}); };
        noise = function(){ played.push({noise:true}); };
        SFX.smash = function(){ generic++; };
        doSmash(fighters[0], 1.0);
        var banner = window.__lastBanner && window.__lastBanner.text;
        tone=_tone; noise=_noise; SFX.smash=_sfx; SND.on=false;
        return { layers: played.length, generic: generic, banner: banner,
                 firstFreq: played[0] && played[0].f, expect: SMASH_ID.ring.tones[0].f };
      })()`);
    expect(r.generic, 'fell back to the generic smash sound').toBe(0);
    expect(r.layers, 'the smash made no sound at all').toBeGreaterThan(0);
    expect(r.firstFreq, 'played someone else\'s sound').toBe(r.expect);
    expect(r.banner, 'the move did not announce its name').toBe('Resonance');
  });

  it('an AI smash is heard but does not spam the banner', async () => {
    const w = await boot(); await settle(w);
    const r = w.eval(`
      (function(){
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
        fighters=[ makeFighter(ROSTER.find(function(r){return r.name==='Bell';}), 300, groundY()-60, 0),
                   makeFighter(ROSTER.filter(function(r){return r.play;})[1], 360, groundY()-60, 1) ];
        fighters[0].team=0; fighters[1].team=1;
        fighters.forEach(function(f){ f.controller='ai'; f.stocks=9; f.you=false; f.you2=false; });
        summons=[]; projectiles=[];
        window.__lastBanner = null;
        var heard=0, _tone=tone; SND.on=true; tone=function(){ heard++; };
        doSmash(fighters[0], 1.0);
        tone=_tone; SND.on=false;
        return { heard: heard, banner: window.__lastBanner };
      })()`);
    expect(r.heard, 'an AI smash should still be audible').toBeGreaterThan(0);
    expect(r.banner, 'an AI smash banner would flood the screen in a 5-way FFA').toBe(null);
  });
});
