// STEVE COBS, MEASURED: how far he keeps from the fighter, and how his story fight goes. scripts/boss-solo.mjs measures the Boss Rush
// bosses only (he is not one), so this is his. THE OWNER, 2026-10-18: "he should be within dashing range. I have to chase him too hard"
// ("Dash range, but fair") and "cobs should have higher knockback and damage things." ("+25%").
//
//   MODE=ai     node scripts/cobs-reach.mjs     the CPU (today's legacy bot, bootMonolith) plays Knife: fight results and distances
//   MODE=human  node scripts/cobs-reach.mjs     a human-like chaser: sees him 12 frames late, walks in only while he is out of reach,
//                                               steps away through his wind-ups, jumps at him when he is above and near, swings in reach
//   MODE=still  node scripts/cobs-reach.mjs     a fighter who never moves: how far he sits from someone who does not chase at all
//   SEEDS='[1,2,3]' FRAMES=28800 DASH=180 FIGHTER=Knife STORY=1 TWEAK='COBS_BACK.t=60'   (TWEAK runs in each game after it boots)
//
// THE GAP is from the fighter's middle (hurtCY) to his body's edge (centre distance less his radius), every frame both are in the fight.
// DASH RANGE, measured on his floor: Knife's Blade Rush carries him 155 px and reaches 26 past it; a running jump covers 179 px; Leafy's
// Sprint 365 -- so 180 px (DASH). `beyond` is the share of frames past it; `high` the share with his underside out of a jump's reach
// (more than 146 px over your middle). `kos` counts every stock lost (his tier lines hand one back, so it can pass 3); `hp` is his bar left.
// Each run boots its own game and seeds its own dice (mulberry32 of the seed). Run from the repo root.
import os from 'node:os';
import { bootMonolith } from '../test/helpers/smash-golden.js';
import { mulberry32 } from '../test/helpers/prng.js';
try { os.setPriority(os.constants.priority.PRIORITY_LOWEST); } catch (e) {}
const MODE = process.env.MODE || 'ai', SEEDS = JSON.parse(process.env.SEEDS || '[1,2,3,4]'), FIGHTER = process.env.FIGHTER || 'Knife';
const STORY = process.env.STORY !== '0', FRAMES = Number(process.env.FRAMES || 28800), DASH = Number(process.env.DASH || 180);
const results = [];
for (const seed of SEEDS) {
  const W = bootMonolith(7);
  await W.eval('profileReady');
  if (process.env.TWEAK) W.eval(process.env.TWEAK);
  W.Math.random = mulberry32(seed);
  const r = JSON.parse(W.eval(`(function(){
    SETTINGS.itemRate=0; SETTINGS.stocks=3; LOCAL_PLAYERS=1;
    var ended = null;
    startCobsFight([${JSON.stringify(FIGHTER)}], { story:${STORY}, onEnd:function(won){ ended = won; return true; } });
    var f = fighters[0], s = null, hist = [], d = [], high = 0, fr = 0;
    f.controller = ${JSON.stringify(MODE === 'ai' ? 'ai' : MODE === 'still' ? 'still' : 'local')};
    for (var k in down) down[k] = false;
    for (; fr < ${FRAMES}; fr++){
      s = summons.find(function(o){ return o._cobsFight; });
      if (!s || s.life <= 0) break;
      ${MODE === 'human' ? `
      hist.push({ x: s.x, y: s.y, r: s.r, tel: s._tel > 0 }); if (hist.length > 12) hist.shift();
      var seen = hist[0];
      for (var k2 in down) down[k2] = false;
      if (!f.dead && !s._hop && !(s._dying > 0)){
        var ex = Math.abs(seen.x - f.x) - seen.r, up = hurtCY(f) - (seen.y + seen.r), dir = seen.x > f.x ? 1 : -1;
        if (seen.tel && ex < 260) down[dir > 0 ? KEYS.left : KEYS.right] = true;
        else if (ex > 40 || f.face !== dir) down[dir > 0 ? KEYS.right : KEYS.left] = true;
        if (!seen.tel && up > 30 && ex < 140 && f.onground) down[KEYS.jump] = true;
        if (Math.hypot(seen.x - f.x, seen.y - hurtCY(f)) - seen.r < 60) down[KEYS.attack] = (fr % 8 < 3);
      }` : ''}
      step();
      s = summons.find(function(o){ return o._cobsFight; });
      if (!s) break;
      if (!f.dead && !(s._dying > 0) && s.hp > 0){
        d.push(Math.hypot(s.x - f.x, s.y - hurtCY(f)) - s.r);
        if (hurtCY(f) - (s.y + s.r) > 146) high++;
      }
      if (ended !== null || COBSFIGHT.won || fighters.every(function(q){ return q.dead; })) break;
    }
    var srt = d.slice().sort(function(a, b){ return a - b; }), q = function(p){ return Math.round(srt[Math.min(srt.length - 1, Math.floor(p*srt.length))]); };
    return JSON.stringify({ won: !!COBSFIGHT.won || !!(s && s.hp <= 0), kos: f._falls || 0, hp: s ? Math.round(s.hp) : 0, s: +(fr/60).toFixed(1),
      med: q(0.5), p75: q(0.75), p90: q(0.9), beyond: +(100*d.filter(function(v){ return v > ${DASH}; }).length/Math.max(1, d.length)).toFixed(1), high: +(100*high/Math.max(1, d.length)).toFixed(1) });
  })()`));
  r.seed = seed; results.push(r);
  console.log(JSON.stringify(r));
  W.close();
}
const n = results.length, avg = (k) => +(results.reduce((a, r) => a + r[k], 0)/n).toFixed(1);
console.log('SUMMARY', JSON.stringify({ mode: MODE, fighter: FIGHTER, runs: n, won: results.filter((r) => r.won).length, kos: avg('kos'), hp: avg('hp'), s: avg('s'),
  med: avg('med'), p75: avg('p75'), p90: avg('p90'), beyond: avg('beyond'), high: avg('high') }));
