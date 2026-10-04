import { describe, it, expect, beforeAll } from 'vitest';
import { bootMonolith } from './helpers/smash-golden.js';

// WIND-UP PACE. The owner, 2026-10-03, asked how Two should be nerfed: "more delay between when an attack is called and when it happens. apply this to the
// last 3 bosses. make the opposite happen for the 1st 3 bosses." A Boss Rush boss's wind-up runs BOSS_TEL_PACE times as long as its own length: Two, Springy
// and Four longer (Two the most: it is the one being nerfed), the Announcer, Puffball Speaker Box and Firey Speaker Box quicker, everyone between as before.

let W;
beforeAll(async () => { W = bootMonolith(); await W.eval('profileReady'); });

describe('the wind-up pace: longer for the last three bosses, quicker for the first three', () => {
  it('the first three wind up 0.8 as long, the last three longer (Two 1.5, Springy and Four 1.25), the six between them and the bosses outside the gauntlet as before', () => {
    const r = JSON.parse(W.eval(`JSON.stringify({
      roster: BOSS_ROSTER.map(function(b){ return [b.name, Math.round(1/bossTelStep({ attack:b.attack })*100)/100]; }),
      one: bossTelStep({ attack:'one' }), cobs: bossTelStep({ attack:'cobsfight' }), item: bossTelStep({ attack:undefined }) })`));
    expect(r.roster).toEqual([
      ['Announcer', 0.8], ['Puffball Speaker Box', 0.8], ['Firey Speaker Box', 0.8],
      ['The Bug Swarm', 1], ['Purple Face', 1], ['MePhone4', 1], ['Evil Leafy', 1], ['MePhone4S', 1], ['Purple Dragon', 1],
      ['Two', 1.5], ['Springy', 1.25], ['Four', 1.25],
    ]);
    expect([r.one, r.cobs, r.item], 'One and Steve Cobs run their own wind-ups; an item boss is not paced').toEqual([1, 1, 1]);
  });

  it('in a fight: Springy\'s 40-unit slam wind-up takes 50 frames, Firey Speaker Box\'s quicker, and the Dragon\'s as it was', () => {
    const frames = (name) => W.eval(`(function(){
      SETTINGS.mode='boss'; SETTINGS.items=false; SETTINGS.itemRate=0; SETTINGS.stocks=99; running=true;
      BOSSRUSH = { active:false, bossIdx:BOSS_ROSTER.findIndex(function(b){ return b.name===${JSON.stringify(name)}; }), cleared:0, defeated:false, loop:0, dmgMult:1 };
      worldPlats=platRectsSmall(); summons=[]; projectiles=[]; beams=[]; tendrils=[]; items=[]; particles=[]; hazardT=0;
      var f = makeFighter(ROSTER.find(function(r){ return r.name==='Firey'; }), 300, groundY()-24, 0); f.team=0; f.controller='still'; f.stocks=99; fighters=[f];
      spawnBossRushBoss();
      var b = summons.find(function(s){ return s.type==='boss'; });
      b._atkLive = null; b._atkTimer = 1; var n = 0, len = 0;
      for (var i=0;i<400;i++){ var pre = b._tel; f.invuln = 1e9; step(); if (!(pre > 0) && b._tel > 0){ len = b._tel; n = 0; } else if (pre > 0) n++; if (pre > 0 && !(b._tel > 0)) break; }
      summons = []; projectiles = []; return JSON.stringify({ len: len, frames: n });
    })()`);
    const sp = JSON.parse(frames('Springy')), fsb = JSON.parse(frames('Firey Speaker Box')), dr = JSON.parse(frames('Purple Dragon'));
    expect(sp.frames, `Springy: ${sp.len} units`).toBe(Math.ceil(sp.len*1.25));
    expect(fsb.frames, `Firey Speaker Box: ${fsb.len} units`).toBe(Math.ceil(fsb.len*0.8));
    expect(dr.frames, `the Dragon: ${dr.len} units`).toBe(dr.len);
  });
});
