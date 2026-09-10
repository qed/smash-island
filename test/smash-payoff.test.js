import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { mulberry32 } from './helpers/prng.js';

// Twenty-eight of the fifty-nine smashes are mechanically the same move — fourteen are "spawn one
// projectile", fourteen are "apply one direct hit". They differ in name, colour and numbers and in
// nothing you can play differently. A PAYOFF is the fix: the move asks something of you, and pays
// when you deliver, so it has a good version and an ordinary one and which you get is your doing.
//
// Puffball's Meteor Puff is the first: a plunge that connects from real HEIGHT grants five seconds
// of Momentum (move speed and shot speed). The same move from level ground is just a hit.

function boot(seed = 5) {
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

// Stage Puffball above a target at `drop` px of height and fire her smash.
const plunge = (w, drop, sameSpot = true) => w.eval(`
  (function(){
    SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
    fighters=[ makeFighter(ROSTER.find(function(r){return r.name==='Puffball';}), 400, groundY()-60, 0),
               makeFighter(ROSTER.find(function(r){return r.name==='Firey';}), 400, groundY()-60, 1) ];
    fighters[0].team=0; fighters[1].team=1;
    fighters.forEach(function(f){ f.controller='still'; f.stocks=9; f.invuln=0; });
    summons=[]; projectiles=[];
    fighters[1].x = ${sameSpot ? 400 : 900};
    fighters[0].y = fighters[1].y - ${drop};
    doSmash(fighters[0], 1.0);
    // The plunge resolves over the FALL, so let it fall. It self-clears on contact or on landing.
    for (var i=0;i<90 && fighters[0]._plunge; i++) step();
    return { haste: fighters[0]._hasteT, bullet: fighters[0]._bulletT,
             hurt: Math.round(fighters[1].pct), height: ${drop} };
  })()`);

describe('Meteor Puff pays for height', () => {
  it('a plunge from height grants five seconds of Momentum', async () => {
    const w = boot(); await settle(w);
    const r = plunge(w, 120);
    expect(r.hurt, 'the plunge did not connect at all').toBeGreaterThan(0);
    expect(r.haste, 'no haste from a committed plunge').toBe(300);
    expect(r.bullet, 'no bullet speed from a committed plunge').toBe(300);
  });

  it('the same move from level ground is just a hit', async () => {
    const w = boot(); await settle(w);
    const r = plunge(w, 0);
    expect(r.hurt, 'the move should still connect').toBeGreaterThan(0);
    expect(r.haste, 'a free payoff for no commitment').toBe(0);
    expect(r.bullet).toBe(0);
  });

  it('height alone is not enough — it has to connect', async () => {
    const w = boot(); await settle(w);
    const r = plunge(w, 200, false);   // dropped from height, but nobody underneath
    expect(r.haste, 'paid out on a whiff').toBe(0);
    expect(r.bullet).toBe(0);
  });
});

describe('the payoff machinery', () => {
  it('hitCircle reports whether it connected', async () => {
    const w = boot(); await settle(w);
    const r = w.eval(`
      (function(){
        SETTINGS.mode='ffa'; SETTINGS.count=2; running=true;
        fighters=[ makeFighter(ROSTER.filter(function(r){return r.play;})[0], 400, groundY()-60, 0),
                   makeFighter(ROSTER.filter(function(r){return r.play;})[1], 400, groundY()-60, 1) ];
        fighters[0].team=0; fighters[1].team=1; fighters[1].invuln=0;
        summons=[];
        var hit = hitCircle(fighters[0], 400, groundY()-60, 60, 5, 5, 0, 0);
        fighters[1].x = 4000;
        var miss = hitCircle(fighters[0], 400, groundY()-60, 60, 5, 5, 0, 0);
        return { hit: hit, miss: miss };
      })()`);
    expect(r.hit).toBe(1);
    expect(r.miss).toBe(0);
  });

  it('Momentum speeds shots up without touching their damage', async () => {
    const w = boot(); await settle(w);
    const r = w.eval(`
      (function(){
        SETTINGS.mode='ffa'; SETTINGS.count=2; running=true;
        fighters=[ makeFighter(ROSTER.find(function(r){return r.name==='Puffball';}), 400, groundY()-60, 0),
                   makeFighter(ROSTER.find(function(r){return r.name==='Firey';}), 900, groundY()-60, 1) ];
        fighters[0].team=0; fighters[1].team=1;
        projectiles=[];
        spawnProj(fighters[0], {vx:10, vy:-4, dmg:9, kb:5, r:8, color:'#fff', life:60});
        var plain = { vx: projectiles[0].vx, dmg: projectiles[0].dmg };
        projectiles=[];
        grantMomentum(fighters[0], 300);
        spawnProj(fighters[0], {vx:10, vy:-4, dmg:9, kb:5, r:8, color:'#fff', life:60});
        var fast = { vx: projectiles[0].vx, dmg: projectiles[0].dmg };
        return { plain: plain, fast: fast };
      })()`);
    expect(r.fast.vx, 'the shot did not speed up').toBeGreaterThan(r.plain.vx);
    expect(r.fast.dmg, 'a speed buff must not become a damage buff').toBe(r.plain.dmg);
  });

  it('the buff expires — five seconds, not forever', async () => {
    const w = boot(); await settle(w);
    const left = w.eval(`
      (function(){
        SETTINGS.mode='ffa'; SETTINGS.count=2; SETTINGS.items=false; running=true;
        fighters=[ makeFighter(ROSTER.find(function(r){return r.name==='Puffball';}), 400, groundY()-60, 0),
                   makeFighter(ROSTER.find(function(r){return r.name==='Firey';}), 700, groundY()-60, 1) ];
        fighters[0].team=0; fighters[1].team=1;
        fighters.forEach(function(f){ f.controller='still'; f.stocks=9; });
        summons=[]; projectiles=[];
        grantMomentum(fighters[0], 300);
        for (var i=0;i<320;i++) step();
        return fighters[0]._bulletT;
      })()`);
    expect(left).toBe(0);
  });
});
