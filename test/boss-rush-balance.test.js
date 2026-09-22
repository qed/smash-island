import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// "check stuff for boss rush, to see if its too hard/easy/unbalanced/short" (2026-09-21). Fifteen solo AI runs, one
// fighter each: 12 died inside 55 s, half the runs that reached Boss 2 ended there, the Dragon's grab threw people into
// the blast zone at 59% taken, the comeback bonus carried Gelatin through 14 bosses in 85 s, and beating Four only looped
// the gauntlet with double damage, so every run ended in a defeat. The owner's calls: lower every boss hit, a weaker
// grab, varied boss attacks, cap the comeback bonus high (Fries excepted), and a victory after Four with an optional loop.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

describe('Boss Rush balance', () => {
  it('the comeback bonus is capped at 3 points in Boss Rush, Fries excepted, and untouched elsewhere', () => {
    const r = W.eval(`(function(){
      var mk = function(n){ var f = makeFighter(ROSTER.find(function(r){ return r.name===n; }), 100, 100, 0); f.deaths = 9; return f; };
      var prev = SETTINGS.mode, out = {};
      SETTINGS.mode = 'boss'; out.bossGelatin = comebackPoints(mk('Gelatin')); out.bossFries = comebackPoints(mk('Fries'));
      SETTINGS.mode = 'ffa'; out.ffaGelatin = comebackPoints(mk('Gelatin'));
      SETTINGS.mode = prev; return out;
    })()`);
    expect(r).toEqual({ bossGelatin: 3, bossFries: 5, ffaGelatin: 5 });
  });

  it('a stock comes every third boss, not every boss, and the heal comes every time', () => {
    // "you only gain 1 stock per 3 bosses" (2026-09-22). A stock a boss refilled the bar as fast as the gauntlet
    // emptied it, so a healthy run never got harder. The heal stays every time.
    const r = W.eval(`(function(){
      var prevMode = SETTINGS.mode, prevStocks = SETTINGS.stocks;
      SETTINGS.mode='boss'; SETTINGS.stocks=99; running=true;
      BOSSRUSH.active=true; BOSSRUSH.cleared=0; BOSSRUSH.bossIdx=0; BOSSRUSH.loop=0; BOSSRUSH.dmgMult=1;
      var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 400, groundY()-24, 0);
      f.stocks=3; f.pct=80; f.controller='still'; f.team=0; f.dead=false; fighters=[f];
      var stocks=[], pcts=[];
      for (var i=0;i<6;i++){
        f.pct = 80;
        summons=[{type:'boss', name:'Bot', color:'#fff', hp:0, maxHp:100, x:400, y:300, r:40, _bossRush:true, team:-1}];
        bossRushCheck();
        stocks.push(f.stocks); pcts.push(f.pct);
      }
      BOSSRUSH.active=false; running=false; SETTINGS.mode=prevMode; SETTINGS.stocks=prevStocks; summons=[];
      return { every: BOSS_STOCK_EVERY, stocks: stocks, healedEvery: pcts.every(function(p){ return p < 80; }) };
    })()`);
    expect(r.every).toBe(3);
    expect(r.stocks, 'a stock on the third, the sixth, and nowhere else').toEqual([3, 3, 4, 4, 4, 5]);
    expect(r.healedEvery, 'but every boss heals').toBe(true);
  });

  it('boss hits are 22 (were 30) and the Dragon grab throws at 14 (was 22)', () => {
    expect(W.eval('BOSS_DMG_BASE')).toBe(22);
    expect(W.eval('String(fireBossAttack)')).toMatch(/away\*14, -9/);
  });

  it('every boss has second moves, and its attacks take turns: signature, second move, signature', () => {
    const r = W.eval(`(function(){
      var missing = BOSS_ROSTER.filter(function(b){ var e = BOSS_EXTRA[b.name]; return !e || !e.length || e.some(function(k){ return !BOSS_MOVES[k]; }); }).map(function(b){ return b.name; });
      var s = { name:'Purple Dragon', attack:'dragon', x:500, y:300, r:60, hp:100, maxHp:100, _phase:1, _atkTimer:1, _tel:0, color:'#6a3a9a' };
      var kinds = [];
      for (var i=0;i<3;i++){ s._atkTimer = 1; s._tel = 0; updateBossAttack(s, null); kinds.push(s._telKind); }
      return { missing: missing, kinds: kinds };
    })()`);
    expect(r.missing).toEqual([]);
    expect(r.kinds).toEqual(['dragon', 'slam', 'dragon']);
  });

  it('a second move fires real boss shots', () => {
    const n = W.eval(`(function(){ projectiles = []; var s = { name:'Two', attack:'two', x:500, y:300, r:60, color:'#c8a020' };
      BOSS_MOVES.ring(s, null); return projectiles.filter(function(p){ return p.owner === -2; }).length; })()`);
    expect(n).toBe(12);
  });

  it("Four's SCREECHY is slower and has more, wider gaps", () => {
    const r = W.eval(`(function(){ projectiles = [];
      var s = { name:'Four', attack:'four', x:550, y:300, r:80, color:'#3a6ad0', _phase:1, _fourAlt:true };
      fireBossAttack(s, { x:300, y:400 });
      var ring = projectiles.filter(function(p){ return p.owner === -2; });
      return { n: ring.length, spd: Math.max.apply(null, ring.map(function(p){ return Math.hypot(p.vx, p.vy); })) };
    })()`);
    expect(r.spd, 'phase 1 speed').toBeLessThanOrEqual(6.01);
    expect(r.n, 'five gaps of about 28 degrees leave well under 360 shots').toBeLessThan(360 - 5 * 24);
  });

  it('beating Four shows a victory card over a paused match; Keep Going resumes, Finish ends it as a win', () => {
    const r = W.eval(`(function(){
      BOSSRUSH = { active:true, bossIdx:8, cleared:9, loop:0, dmgMult:1, frames: 3600*2 + 60*5 };
      running = true; paused = false;
      showRushVictory();
      var shown = document.getElementById('rushVictory').style.display, wasPaused = paused, sub = document.getElementById('rushVicSub').textContent;
      rushKeepGoing(); var resumed = !paused && document.getElementById('rushVictory').style.display === 'none';
      showRushVictory(); rushFinish();
      return { shown: shown, wasPaused: wasPaused, sub: sub, resumed: resumed, running: running, title: document.getElementById('resultTitle').textContent };
    })()`);
    expect(r.shown).toBe('flex');
    expect(r.wasPaused).toBe(true);
    expect(r.sub).toMatch(/All nine bosses beaten in 2:05/);
    expect(r.resumed).toBe(true);
    expect(r.running).toBe(false);
    expect(r.title).toBe('Victory!');
  });
});
