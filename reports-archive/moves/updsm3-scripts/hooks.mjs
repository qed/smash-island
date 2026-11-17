// Batch 3 hook measurements (offline, one page, a still dummy). Run from the worktree root: node hooks.mjs
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/updsm3/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/updsm3/scripts/helpers/match-setup.js';
process.on('uncaughtException', () => {});
const { window: w } = loadMonolith(0xABCD);
const errs = []; w.addEventListener('error', e => errs.push(String(e.message).slice(0, 120)));
w.eval(SETUP_SRC);
// one throw: attacker n, direction dir, dummy at (dx, dy) with pct, extra code `pre` run before the throw (a, d in scope); the dummy is held until hit unless free
const run = (n, dir, dx, dy, pct, pre, free) => JSON.parse(w.eval(`(function(){
  window.__setupCustomMatch([${JSON.stringify(n)}, 'Coiny'], 99, 2, 0); for (const f of fighters){ f.controller = 'still'; f.invuln = 0; } for (let i = 0; i < 30; i++) step();
  var a = fighters[0], d = fighters[1]; for (const f of fighters){ f.invuln = 0; f.x = WW*0.5; f.y = groundY() - f.r; f.vx = 0; f.vy = 0; f.onground = true; f.face = 1; f.smCd = 0; f.atkCd = 0; f.pct = 0; f._mv = null; }
  d.x = a.x + (${dx}); d.y = groundY() - d.r + (${dy}); d.pct = ${pct}; a.pct = 20;
  ${pre || ''}
  const p0 = d.pct, hx = d.x, hy = d.y, hvx = d.vx, hvy = d.vy, ap0 = a.pct; let ok = dirSmash(a, ${dir}); const arm0 = a.armor || 0;
  let vx = 0, vy = 0, hitT = -1, stunMax = 0, rootMax = 0, weak = 0, slow = 0, rev = 0, yMaxAfter = -1e9, landedT = -1;
  for (let t = 0; t < 90; t++){
    if(d.pct === p0 && !${free ? 1 : 0}){ d.x = hx; d.vx = hvx; if(${dy} < 0){ d.y = hy; d.vy = hvy; d.onground = false; } }
    step();
    if(d.pct !== p0 && hitT < 0){ hitT = t; vx = d.vx; vy = d.vy; }
    if(hitT >= 0){ stunMax = Math.max(stunMax, d.hitstun || 0); rootMax = Math.max(rootMax, d.rooted || 0); weak = Math.max(weak, d.weakened || 0); slow = Math.max(slow, d.slowed || 0); rev = Math.max(rev, d.ctrlRev || 0);
      if(landedT < 0 && t > hitT + 2 && d.onground) landedT = t; }
  }
  return JSON.stringify({ thrown: ok, took: Math.round((d.pct - p0)*10)/10, hitT, vx: Math.round(vx*10)/10, vy: Math.round(vy*10)/10, stun: stunMax, root: rootMax, weak, slow, rev, healed: Math.round((ap0 - a.pct)*10)/10, armorAtStart: arm0,
    dEndX: Math.round(d.x - hx), dEndY: Math.round(d.y - hy), dLandedAt: landedT, dStocks: d.stocks, aEndX: Math.round(a.x - WW*0.5) });
})()`));
const P = (label, o) => console.log(label, JSON.stringify(o));
P('Yellow Face up, foe at 20%:', run('Yellow Face', 1, 20, -70, 20));
P('Yellow Face up, foe at 49%:', run('Yellow Face', 1, 20, -70, 49));
P('Yellow Face up, foe at 50%:', run('Yellow Face', 1, 20, -70, 50));
P('Yellow Face down, foe in front:', run('Yellow Face', -1, 54, 0, 60));
P('Yellow Face down, foe behind:', run('Yellow Face', -1, -54, 0, 60));
P('Donut up, foe at the tip (dy -110):', run('Donut', 1, -6, -110, 60));
P('Donut up, foe low on the bolt (dy -50):', run('Donut', 1, 0, -50, 60));
P('Donut down, foe against him (dx 20):', run('Donut', -1, 20, 0, 60));
P('Donut down, foe at dx 40:', run('Donut', -1, 40, 0, 60));
P('Donut down, foe at dx 70:', run('Donut', -1, 70, 0, 60));
P('David up, armour at start:', run('David', 1, 0, -80, 60));
P('David down, foe facing him:', run('David', -1, 70, 0, 60, 'd.face = -1;'));
P('David down, foe facing away:', run('David', -1, 70, 0, 60, 'd.face = 1;'));
P('Taco up (she is at 20%):', run('Taco', 1, 0, -80, 60));
P('Taco down, where she ends:', run('Taco', -1, 40, 0, 60));
P('Barf Bag up:', run('Barf Bag', 1, 0, -80, 60));
P('Barf Bag down, foe beside her:', run('Barf Bag', -1, 46, 0, 60));
P('Tree up:', run('Tree', 1, 0, -90, 60));
P('Tree down, foe on his right, stage middle on the left (he stands 300 px right of the middle):', run('Tree', -1, 60, 0, 60, 'a.x += 300; d.x += 300;'));
P('Tree down, foe on his left, same place:', run('Tree', -1, -60, 0, 60, 'a.x += 300; d.x += 300;'));
P('Gaty up, still foe:', run('Gaty', 1, 0, -70, 60));
P('Gaty up, foe falling straight down at 6:', run('Gaty', 1, 0, -70, 60, 'd.vy = 6;'));
P('Gaty up, foe coming in from the right at 5 and falling at 3:', run('Gaty', 1, 30, -70, 60, 'd.vx = -5; d.vy = 3;'));
P('Gaty up, foe rising at -6 (must not be thrown down):', run('Gaty', 1, 0, -70, 60, 'd.vy = -6;'));
P('Lollipop up, candy:', run('Lollipop', 1, -8, -100, 60));
P('Bell down, foe in front:', run('Bell', -1, 44, 0, 60));
P('Loser down, a foe in the air over him (dy -80):', run('Loser', -1, 10, -80, 60));
P('Nickel down, a foe who walks in on frame 12 (held 100 px away, then put at 55):', run('Nickel', -1, 100, 0, 60, 'window.__n = 0;'));
// Turbulence at a ledge: Barf Bag at the right end of the floor, the foe just past the edge at foot height (held until hit, then free)
P('Barf Bag down at a ledge, foe beyond the edge:', (function(){ return JSON.parse(w.eval(`(function(){
  window.__setupCustomMatch(['Barf Bag', 'Coiny'], 99, 2, 0); for (const f of fighters){ f.controller = 'still'; f.invuln = 0; } for (let i = 0; i < 30; i++) step();
  var a = fighters[0], d = fighters[1]; let edge = null;
  for (const f of fighters){ f.invuln = 0; f.vx = 0; f.vy = 0; f.face = 1; f.smCd = 0; f.atkCd = 0; f.pct = 0; f._mv = null; }
  // walk the attacker right until the floor ends
  a.x = WW*0.5; a.y = groundY() - a.r; a.onground = true; const gy = a.y;
  for (let x = WW*0.5; x < WW; x += 4){ a.x = x; a.vx = 0; a.vy = 0; a.y = gy; a.onground = true; step(); if(!a.onground || Math.abs(a.y - gy) > 3){ edge = x - 4; break; } }
  if(edge == null) return JSON.stringify({ edge: null });
  a.x = edge - 6; a.y = gy; a.vx = 0; a.vy = 0; a.onground = true; step(); const onFloor = a.onground;
  d.x = a.x + 46; d.y = gy; d.pct = 60; d.vx = 0; d.vy = 0; const st0 = d.stocks, p0 = d.pct, hx = d.x, hy = d.y;
  dirSmash(a, -1); let lostAt = -1, minVy = 0;
  for (let t = 0; t < 400; t++){ if(d.pct === p0){ d.x = hx; d.y = hy; d.vx = 0; d.vy = 0; } step(); if(d.pct !== p0) minVy = Math.max(minVy, d.vy); if(lostAt < 0 && d.stocks < st0) lostAt = t; }
  return JSON.stringify({ edgeX: Math.round(edge), attackerOnFloor: onFloor, took: Math.round((d.pct - p0)*10)/10, fastestFall: Math.round(minVy*10)/10, foeLostAStockAtFrame: lostAt, foeStocks: d.stocks + ' of ' + st0 });
})()`)); })());
console.log('errors', errs.length ? errs.slice(0, 3) : 0);
try { w.close(); } catch {}
