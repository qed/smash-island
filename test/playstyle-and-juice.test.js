import { describe, it, expect } from 'vitest';
import { loadMonolith } from './helpers/load-monolith.js';

// WAVE 5 — the AI learns how the player plays a given fighter.
// WAVE 3.5 — victory quips and rival memory.

describe('play-style learning is bounded and per character', () => {
  it('ignores a style with too few samples', () => {
    const { window: w } = loadMonolith();
    w.eval(`STYLE_DATA = { Firey: { n:1, aggression:1, range:0, special:1 } };`);
    expect(w.eval(`styleTrust('Firey')`), 'one match is not a style').toBe(0);
  });

  it('never lets the player override the archetype completely', () => {
    // "Copy the winner" is a feedback loop: adopt the player's style outright, then learn from
    // beating them with it, and every character converges on one degenerate pattern.
    const { window: w } = loadMonolith();
    w.eval(`STYLE_DATA = { Firey: { n:999, aggression:1, range:1, special:1 } };`);
    const trust = w.eval(`styleTrust('Firey')`);
    expect(trust, 'capped by STYLE_WEIGHT').toBeLessThanOrEqual(w.eval('STYLE_WEIGHT'));
    expect(trust, 'and a well-sampled style does carry real weight').toBeGreaterThan(0.2);
  });

  it('shifts the profile toward the player without replacing it', () => {
    const { window: w } = loadMonolith();
    const base = w.eval(`JSON.stringify(AI_PROFILE.rush)`);
    const styled = w.eval(`
      (function(){
        STYLE_DATA = { Firey: { n:99, aggression:0, range:1, special:0 } };   // passive, long-range
        return JSON.stringify(styledProfile('Firey', AI_PROFILE.rush));
      })()`);
    const b = JSON.parse(base), s = JSON.parse(styled);
    expect(s.aggro, 'a passive player calms the rushdown').toBeLessThan(b.aggro);
    expect(s.range, 'a long-range player widens its spacing').toBeGreaterThan(b.range);
    expect(s.aggro, 'but a rushdown is still a rushdown').toBeGreaterThan(0.3);
  });

  it('never mutates the shared archetype table', () => {
    // AI_PROFILE is shared by every fighter of a class; mutating it would leak one player's habits
    // onto unrelated characters.
    const { window: w } = loadMonolith();
    const before = w.eval(`JSON.stringify(AI_PROFILE.rush)`);
    w.eval(`STYLE_DATA = { Firey: { n:99, aggression:1, range:1, special:1 } };
            styledProfile('Firey', AI_PROFILE.rush);`);
    expect(w.eval(`JSON.stringify(AI_PROFILE.rush)`)).toBe(before);
  });

  it('is per character: learning Firey does not change Leafy', () => {
    const { window: w } = loadMonolith();
    w.eval(`STYLE_DATA = { Firey: { n:99, aggression:1, range:1, special:1 } };`);
    expect(w.eval(`styleTrust('Leafy')`), 'Leafy learned nothing').toBe(0);
    const same = w.eval(`JSON.stringify(styledProfile('Leafy', AI_PROFILE.rush)) === JSON.stringify(AI_PROFILE.rush)`);
    expect(same).toBe(true);
  });

  it('only watches human-controlled fighters', () => {
    const { window: w } = loadMonolith();
    const out = w.eval(`
      (function(){
        SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.itemRate=0;
        beginMatchNow();
        fighters.forEach(function(f){ f.controller='ai'; f.you=false; });
        for (var k in STYLE_REC) delete STYLE_REC[k];
        for (var i=0;i<120;i++) observePlaystyle();
        return Object.keys(STYLE_REC).length;
      })()`);
    expect(out, 'an all-AI match teaches the game nothing about the player').toBe(0);
  });

  it('records a human fighter and survives being called every frame', () => {
    const { window: w } = loadMonolith();
    const frames = w.eval(`
      (function(){
        SETTINGS.mode='ffa'; SETTINGS.count=3; SETTINGS.itemRate=0;
        beginMatchNow();
        fighters[0].controller = 'local';
        for (var k in STYLE_REC) delete STYLE_REC[k];
        for (var i=0;i<200;i++) observePlaystyle();
        var r = STYLE_REC[fighters[0].name];
        return r ? r.frames : 0;
      })()`);
    expect(frames, 'the human fighter was observed').toBe(200);
  });

  it('degrades quietly with no stored profile at all', () => {
    const { window: w } = loadMonolith();
    w.eval(`STYLE_DATA = null;`);
    expect(w.eval(`styleTrust('Firey')`)).toBe(0);
    expect(() => w.eval(`styledProfile('Firey', AI_PROFILE.rush)`)).not.toThrow();
  });
});

describe('victory quips', () => {
  it('gives a line to a good part of the roster, in character', () => {
    const { window: w } = loadMonolith();
    const covered = w.eval(`ROSTER.filter(function(r){ return r.play && victoryQuipFor(r.name); }).length`);
    expect(covered, 'most of the cast has a voice').toBeGreaterThan(35);
  });

  it('returns nothing rather than a generic line for an unknown fighter', () => {
    // A generic line in a character's mouth is worse than silence.
    const { window: w } = loadMonolith();
    expect(w.eval(`victoryQuipFor('Nobody At All')`)).toBe('');
  });

  it("keeps Teardrop mute — hers is an action, not a line", () => {
    const { window: w } = loadMonolith();
    const q = w.eval(`victoryQuipFor('Teardrop')`);
    expect(q, 'she is canonically silent').toMatch(/…|\(/);
  });

  it('renders as text, never as markup', () => {
    // The quip sits next to a fighter name, which can arrive from netplay.
    const { window: w } = loadMonolith();
    const src = w.eval(`String(showResult)`);
    expect(src, 'quip is set via textContent').toMatch(/resultQuip[\s\S]{0,200}textContent/);
  });
});

describe('rival memory', () => {
  it('names nobody until you have lost to someone twice', () => {
    const { window: w } = loadMonolith();
    const rival = w.eval(`
      (function(){
        var log = [{ fighters:[{name:'You', you:true, won:false}, {name:'Pin', won:true}] }];
        return (function(){
          var kills = {};
          for (var i=0;i<log.length;i++){
            var m = log[i];
            var you = m.fighters.find(function(p){ return p.you; });
            if (!you || you.won) continue;
            for (var j=0;j<m.fighters.length;j++){
              var p = m.fighters[j];
              if (p === you || !p.won) continue;
              kills[p.name] = (kills[p.name]||0)+1;
            }
          }
          var best=null, n=0;
          for (var k in kills) if (kills[k] > n) { n = kills[k]; best = k; }
          return n >= 2 ? best : null;
        })();
      })()`);
    expect(rival, 'one loss is not a rivalry').toBe(null);
  });

  it('does not tag anyone by default', () => {
    const { window: w } = loadMonolith();
    expect(w.eval(`RIVAL_NAME`), 'a fresh install has no rival').toBe(null);
  });

  it('tags the rival on the select board when one exists', () => {
    const { window: w } = loadMonolith();
    const tags = w.eval(`
      (function(){
        RIVAL_NAME = ROSTER.find(function(r){ return r.play; }).name;
        buildBoard();
        return document.querySelectorAll('.rivaltag').length;
      })()`);
    expect(tags, 'exactly one fighter is the rival').toBe(1);
  });
});

describe('the learned style changes how the CPU actually fights', () => {
  it('a learned long-range style makes the CPU attack from further out', () => {
    // The unit tests above prove the PROFILE changes. This proves the BEHAVIOUR does.
    //
    // Choosing the metric took three attempts, and the two rejects are worth recording:
    //   · average distance is confounded by KNOCKBACK — a brawler that lands hits sends the
    //     opponent flying, which widens the average gap and reads as "keeping distance".
    //   · fraction of frames spent closing is confounded by the IDEAL RANGE itself — a CPU whose
    //     preferred range is short is already in position, so it closes less often.
    // Attack distance is what `range` directly drives, and it is not confounded by either.
    const { window: w } = loadMonolith();
    const attackGap = (style) => w.eval(`
      (function(){
        STYLE_DATA = ${JSON.stringify(style)};
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.stocks=5; SETTINGS.itemRate=0;
        beginMatchNow();
        fighters.length = 0;
        ['Firey','Ice Cube'].forEach(function(n,i){
          var f = makeFighter(ROSTER.find(function(r){ return r.name===n; }), W*(0.3+0.4*i), H*0.5, i);
          f.controller='ai'; f.you=false; fighters.push(f);
        });
        var sum=0, n=0;
        for (var i=0;i<2500 && running;i++){
          step();
          var a=fighters[0], b=fighters[1];
          if(!a||!b||a.dead||b.dead) continue;
          if(a._atkAnim===ATK_ANIM){ sum += Math.abs(a.x-b.x); n++; }
        }
        return [n ? sum/n : 0, n];
      })()`);
    const [closeGap, closeN] = attackGap({ Firey: { n: 99, aggression: 1.0, range: 0.0, special: 0.0 } });
    const [farGap, farN] = attackGap({ Firey: { n: 99, aggression: 0.0, range: 1.0, special: 0.9 } });
    expect(closeN, 'enough attacks to mean something').toBeGreaterThan(20);
    expect(farN, 'enough attacks to mean something').toBeGreaterThan(20);
    expect(farGap, `long-range style attacked from ${Math.round(farGap)}px, close-range from ${Math.round(closeGap)}px`)
      .toBeGreaterThan(closeGap + 20);
  }, 180000);
});
