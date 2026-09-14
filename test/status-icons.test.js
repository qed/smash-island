import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "add buff/debuff icons."
//
// A row of small glyphs above the fighter's head, one per active status, drawn from STATUS_ICONS so
// adding a status is one row. Render-only: nothing here is read by the simulation, and it spends no
// randomness, so a seeded replay is identical whether or not the icons are drawn.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

// every status the fighter update ticks, and the field that carries it
const STATUSES = {
  burn: 'burn', bleed: 'bleed', frozen: 'frozen', slowed: 'slowed', rooted: 'rooted', ctrlRev: 'ctrlRev',
  weakened: 'weakened', curse: 'curseStacks', define: 'defineStacks', infected: '_infected', cloud: 'cloud',
  armor: 'armor', empower: '_empowerT', haste: '_hasteT', bullet: '_bulletT', star: '_starT', yoyle: '_yoyleT',
  healing: 'healing', reflect: 'reflecting', counter: 'countering',
};

const countingCtx = `new Proxy({}, { get:function(_t,p){
  if(p==='canvas') return {width:1100,height:720};
  if(p==='measureText') return function(){ return {width:0}; };
  return function(){ if(p==='fill'||p==='stroke'||p==='fillRect'||p==='fillText') n++; }; }, set:function(){ return true; } })`;

describe('the table', () => {
  it('has an icon for every status a fighter can carry', () => {
    const keys = W.eval('STATUS_ICONS.map(function(s){ return s.key; })');
    for (const k of Object.keys(STATUSES)) expect(keys, `no icon for ${k}`).toContain(k);
  });
});

describe('drawing', () => {
  it('draws nothing for a clean fighter, and one glyph per active status without throwing', () => {
    const r = W.eval(`(function(){
      var f = makeFighter(ROSTER.find(function(x){ return x.play; }), 100, 100, 0);
      var n = 0, c = ${countingCtx};
      var clean = drawStatusIcons(f, c), cleanDraws = n;
      var bad = [], each = {};
      var fields = ${JSON.stringify(STATUSES)};
      Object.keys(fields).forEach(function(k){
        var g = makeFighter(ROSTER.find(function(x){ return x.play; }), 100, 100, 0);
        g[fields[k]] = 3; n = 0;
        try { each[k] = drawStatusIcons(g, c); if (n === 0) bad.push(k + ': drew nothing'); }
        catch(e){ bad.push(k + ': ' + e.message); }
      });
      return { clean: clean, cleanDraws: cleanDraws, each: each, bad: bad };
    })()`);
    expect(r.clean).toBe(0);
    expect(r.cleanDraws).toBe(0);
    expect(r.bad).toEqual([]);
    for (const k of Object.keys(STATUSES)) expect(r.each[k], k).toBe(1);
  });

  it('shows several at once, in a row, and a count for stacks', () => {
    const r = W.eval(`(function(){
      var f = makeFighter(ROSTER.find(function(x){ return x.play; }), 100, 100, 0);
      f.burn = 10; f.frozen = 5; f.curseStacks = 3; var n = 0, texts = [];
      var c = new Proxy({}, { get:function(_t,p){
        if(p==='canvas') return {width:1100,height:720};
        if(p==='measureText') return function(){ return {width:0}; };
        return function(){ if(p==='fillText') texts.push(arguments[0]); }; }, set:function(){ return true; } });
      return { drawn: drawStatusIcons(f, c), texts: texts };
    })()`);
    expect(r.drawn).toBe(3);
    expect(r.texts).toContain('3');
  });

  it('spends no randomness', () => {
    const err = W.eval(`(function(){
      var f = makeFighter(ROSTER.find(function(x){ return x.play; }), 100, 100, 0);
      var fields = ${JSON.stringify(STATUSES)}; Object.keys(fields).forEach(function(k){ f[fields[k]] = 3; });
      var c = ${countingCtx.replace('var n', 'var n')}, n = 0;
      var _r = Math.random; Math.random = function(){ throw new Error('randomness spent by a render'); };
      try { drawStatusIcons(f, c); return null; } catch(e){ return e.message; } finally { Math.random = _r; }
    })()`);
    expect(err).toBe(null);
  });

  it('is part of drawing a fighter', () => {
    const n = W.eval(`(function(){
      SETTINGS.mode='ffa'; SETTINGS.count=2; beginMatchNow();
      var f = fighters[0]; f.burn = 10; var calls = 0;
      var _d = drawStatusIcons; drawStatusIcons = function(){ calls++; return _d.apply(null, arguments); };
      try { drawFighter(f); } finally { drawStatusIcons = _d; }
      return calls;
    })()`);
    expect(n).toBe(1);
  });
});
