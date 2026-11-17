// Batch 3, review round: the changed moves' hooks, measured (offline, one page, a still dummy). Run from the worktree root: node hooks3.mjs
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/updsm3/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/updsm3/scripts/helpers/match-setup.js';
process.on('uncaughtException', () => {});
const { window: w } = loadMonolith(0xABCD);
const errs = []; w.addEventListener('error', e => errs.push(String(e.message).slice(0, 120)));
w.eval(SETUP_SRC);
const run = (n, dir, dx, dy, pct, pre, each) => JSON.parse(w.eval(`(function(){
  window.__setupCustomMatch([${JSON.stringify(n)}, 'Coiny'], 99, 2, 0); for (const f of fighters){ f.controller = 'still'; f.invuln = 0; } for (let i = 0; i < 30; i++) step();
  var a = fighters[0], d = fighters[1]; for (const f of fighters){ f.invuln = 0; f.x = WW*0.5; f.y = groundY() - f.r; f.vx = 0; f.vy = 0; f.onground = true; f.face = 1; f.smCd = 0; f.atkCd = 0; f.pct = 0; f._mv = null; }
  d.x = a.x + (${dx}); d.y = groundY() - d.r + (${dy}); d.pct = ${pct};
  ${pre || ''}
  const p0 = d.pct, hx = d.x, hy = d.y, y0 = a.y; dirSmash(a, ${dir});
  let vx = 0, vy = 0, hitT = -1, hits = 0, last = p0, stunMax = 0, rootMax = 0, slow = 0, freeAt = -1, aFreeAt = -1, rise = 0, aLand = -1, armAfter = null, refAfter = null, cntAfter = null;
  for (let t = 0; t < 110; t++){
    if(d.pct === p0){ d.x = hx; d.vx = 0; if(${dy} < 0){ d.y = hy; d.vy = 0; d.onground = false; } }
    ${each || ''}
    step();
    if(d.pct !== last){ hits++; last = d.pct; if(hitT < 0){ hitT = t; vx = d.vx; vy = d.vy; armAfter = d.armor || 0; refAfter = d.reflecting || 0; cntAfter = d.countering || 0; } }
    if(hitT >= 0){ stunMax = Math.max(stunMax, d.hitstun || 0); rootMax = Math.max(rootMax, d.rooted || 0); slow = Math.max(slow, d.slowed || 0); if(freeAt < 0 && !(d.hitstun > 0) && !(d.rooted > 0)) freeAt = t; }
    rise = Math.max(rise, y0 - a.y); if(aLand < 0 && t > 8 && a.onground) aLand = t; if(aFreeAt < 0 && !a._mv) aFreeAt = t;
  }
  return JSON.stringify({ took: Math.round((d.pct - p0)*10)/10, hits, firstHitFrame: hitT, vx: Math.round(vx*10)/10, vy: Math.round(vy*10)/10, stun: stunMax, root: rootMax, slow, foeFreeAtFrame: freeAt, attackerFreeAtFrame: aFreeAt,
    attackerRose: Math.round(rise), attackerOnFloorAtFrame: aLand, attackerEndsAt: Math.round(a.x - WW*0.5), foeEndsAt: Math.round(d.x - WW*0.5), foeStocks: d.stocks, foeArmourAfter: armAfter, foeReflectAfter: refAfter, foeCounterAfter: cntAfter });
})()`));
const P = (l, o) => console.log(l, JSON.stringify(o));
P('Donut down, foe standing on the diary (dx 50):', run('Donut', -1, 50, 0, 60));
P('Donut down, foe behind him (dx -50):', run('Donut', -1, -50, 0, 60));
P('Donut down, foe put on the diary on frame 10:', run('Donut', -1, 160, 0, 60, 'window.__t = 0;', 'if(window.__t++ === 10 && d.pct === p0){ d.x = a.x + 50; } if(window.__t > 10 && d.pct === p0){ d.x = a.x + 50; }'));
P('Dora up, nobody near (how far she goes):', run('Dora', 1, 400, 0, 60));
P('Dora up, foe 70 over her:', run('Dora', 1, 0, -70, 60));
P('Dora up, foe 130 over her:', run('Dora', 1, 0, -130, 60));
P('Dora down, foe behind (dx -80):', run('Dora', -1, -80, 0, 60));
P('Dora down, foe in front (dx 80):', run('Dora', -1, 80, 0, 60));
P('Loser up, foe with armour 40, reflect 40 and counter 40 up:', run('Loser', 1, 24, -90, 60, 'd.armor = 40; d.reflecting = 40; d.countering = 40;'));
P('Lollipop up, candy:', run('Lollipop', 1, -8, -100, 60));
P('Lollipop down:', run('Lollipop', -1, 48, 0, 60));
P('Barf Bag down, foe standing still:', run('Barf Bag', -1, 44, 0, 60));
P('Barf Bag down, foe in the middle of a swing (_atkAnim 20):', run('Barf Bag', -1, 44, 0, 60, 'd._atkAnim = 20;'));
P('Barf Bag down, foe charging a smash (smashHold 10):', run('Barf Bag', -1, 44, 0, 60, 'd.smashHold = 10;'));
P('Bell down, foe standing beside him (dx 50):', run('Bell', -1, 50, 0, 60));
P('Bell down, foe in the air beside him (dx 50, 50 up):', run('Bell', -1, 50, -50, 60));
P('Gaty down, foe in front (dx 50) at 60%:', run('Gaty', -1, 50, 0, 60));
P('Gaty down, foe in front (dx 50) at 0%:', run('Gaty', -1, 50, 0, 0));
P('Gaty down, foe in front (dx 50) at 120%:', run('Gaty', -1, 50, 0, 120));
P('Gaty down, foe behind (dx -50):', run('Gaty', -1, -50, 0, 60));
console.log('errors', errs.length ? errs.slice(0, 3) : 0);
try { w.close(); } catch {}
