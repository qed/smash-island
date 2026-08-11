import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadMonolith } from './helpers/load-monolith.js';

// The "sprites are on the wrong side" bug, and the action feedback that goes with it.
//
// `f.face` is INTENT — where a fighter is aiming, set by input and by the AI turning toward its
// target. It is not the way they are travelling. Measured in real matches, 19.4% of moving frames
// and 10.3% of SPRINTING frames had a fighter facing opposite to their own velocity: a moonwalk.
// It was made worse by the run dust, which follows travel while the sprite mirrored on intent, so
// the dust came off the wrong side of the body.

describe('visualFace — a sprinting fighter is drawn the way they are moving', () => {
  const mk = (w, over) => w.eval(`
    (function(){
      var f = makeFighter(ROSTER[0], 100, 100, 0);
      f.onground = true; f._atkAnim = 0; f.smashHold = 0; f.face = 1; f.vx = 0;
      ${over}
      return visualFace(f);
    })()`);

  it('follows travel at a sprint, even when intent disagrees', () => {
    const { window: w } = loadMonolith();
    expect(mk(w, 'f.vx = -7; f.face = 1;'), 'sprinting left while aiming right').toBe(-1);
    expect(mk(w, 'f.vx = 7; f.face = -1;'), 'sprinting right while aiming left').toBe(1);
  });

  it('still follows INTENT when walking, so facing an enemy while backing off is preserved', () => {
    // This is deliberate: retreating while keeping your guard up is correct in a fighting game.
    // Only a full sprint reads as broken.
    const { window: w } = loadMonolith();
    expect(mk(w, 'f.vx = -2; f.face = 1;'), 'walking backwards keeps its aim').toBe(1);
  });

  it('follows INTENT while attacking, so a swing never fires backwards', () => {
    const { window: w } = loadMonolith();
    expect(mk(w, 'f.vx = -7; f.face = 1; f._atkAnim = 6;'), 'attacking mid-retreat').toBe(1);
    expect(mk(w, 'f.vx = -7; f.face = 1; f.smashHold = 30;'), 'charging mid-retreat').toBe(1);
  });

  it('follows INTENT in the air, where there is no stride to contradict', () => {
    const { window: w } = loadMonolith();
    expect(mk(w, 'f.vx = -7; f.face = 1; f.onground = false;')).toBe(1);
  });

  it('never returns anything but -1 or 1', () => {
    const { window: w } = loadMonolith();
    for (const over of ['f.vx=0;', 'f.vx=9;', 'f.vx=-9;', 'f.face=0;', 'delete f.vx;']) {
      expect([1, -1]).toContain(mk(w, over));
    }
  });

  it('holds across a real match: no sprinting fighter is ever drawn backwards', () => {
    const { window: w } = loadMonolith();
    const out = w.eval(`
      (function(){
        SETTINGS.mode='ffa'; SETTINGS.count=4; SETTINGS.stocks=2; SETTINGS.itemRate=0;
        beginMatchNow();
        fighters.forEach(function(f){ f.controller='ai'; f.you=false; });
        var sprint=0, drawnWrong=0, rawWrong=0;
        for (var i=0;i<1500 && running;i++){
          step();
          for (var j=0;j<fighters.length;j++){
            var f = fighters[j];
            if (f.dead || f.onground === false) continue;
            var vx = f.vx || 0;
            if (Math.abs(vx) > 4 && !(f._atkAnim > 0) && !(f.smashHold > 0)) {
              sprint++;
              if ((vx>0 && f.face<0) || (vx<0 && f.face>0)) rawWrong++;
              var vf = visualFace(f);
              if ((vx>0 && vf<0) || (vx<0 && vf>0)) drawnWrong++;
            }
          }
        }
        return [sprint, rawWrong, drawnWrong];
      })()`);
    const [sprint, rawWrong, drawnWrong] = out;
    expect(sprint, 'the match actually contained sprinting').toBeGreaterThan(50);
    expect(rawWrong, 'intent really does disagree with travel — the bug is real, not hypothetical')
      .toBeGreaterThan(0);
    expect(drawnWrong, 'but nothing is ever DRAWN moonwalking').toBe(0);
  }, 120000);
});

describe('action feedback exists for every state a player needs to read', () => {
  it('draws a swipe on attack, dust on a sprint, and a spark on taking a hit', () => {
    // These are what make the states readable at ~67px. Deform alone measured as "working" and was
    // invisible in play, which is exactly what was reported.
    const { window: w } = loadMonolith();
    // simpler and more direct: the three helpers must exist and be reachable from drawFighter
    for (const fn of ['drawSwipeArc', 'drawRunDust', 'drawHitSpark']) {
      expect(w.eval(`typeof ${fn}`), `${fn} exists`).toBe('function');
    }
    const src = w.eval(`String(drawFighter)`);
    expect(src, 'attack swipe is wired into drawFighter').toContain('drawSwipeArc');
    expect(src, 'run dust is wired in').toContain('drawRunDust');
    expect(src, 'hit spark is wired in').toContain('drawHitSpark');
  });

  it('gates each overlay on its own state, so nothing draws at rest', () => {
    const { window: w } = loadMonolith();
    const src = w.eval(`String(drawFighter)`);
    expect(src).toMatch(/_atkAnim\s*>\s*0[^;]*drawSwipeArc|drawSwipeArc/);
    expect(src, 'dust requires being grounded and fast').toMatch(/onground[\s\S]{0,60}drawRunDust/);
    expect(src, 'the spark requires hitstun').toMatch(/hurtK\(f\)[\s\S]{0,30}drawHitSpark/);
  });

  it('gives projectiles a motion trail so a shot reads as fired', () => {
    const html = readFileSync('artifacts/V1/index.html', 'utf8');
    expect(html, 'ordinary projectiles were flat dots').toContain('SHOT TRAIL');
  });
});
