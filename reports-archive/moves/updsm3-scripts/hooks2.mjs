// Batch 3, second hook run: (1) Barf Bag's down smash at a ledge, a foe just past the edge, OLD build against NEW, at 0 / 30 / 60%; (2) a few re-measurements on the new build.
import fs from 'node:fs';
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/updsm3/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/updsm3/scripts/helpers/match-setup.js';
process.on('uncaughtException', () => {});
const OLD = fs.readFileSync('C:/Users/carad/AppData/Local/Temp/claude/f6b4fec287bd4976/82251bbe-13a2-473f-9c20-558b0b86c2bf/scratchpad/updsm3/before.html', 'utf8');
const ledge = (w, n, dir, dx, pct) => JSON.parse(w.eval(`(function(){
  window.__setupCustomMatch([${JSON.stringify(n)}, 'Coiny'], 99, 2, 0); for (const f of fighters){ f.controller = 'still'; f.invuln = 0; } for (let i = 0; i < 30; i++) step();
  var a = fighters[0], d = fighters[1]; let edge = null;
  for (const f of fighters){ f.invuln = 0; f.vx = 0; f.vy = 0; f.face = 1; f.smCd = 0; f.atkCd = 0; f.pct = 0; f._mv = null; }
  a.x = WW*0.5; a.y = groundY() - a.r; a.onground = true; const gy = a.y;
  for (let x = WW*0.5; x < WW; x += 4){ a.x = x; a.vx = 0; a.vy = 0; a.y = gy; a.onground = true; step(); if(!a.onground || Math.abs(a.y - gy) > 3){ edge = x - 4; break; } }
  if(edge == null) return JSON.stringify({ edge: null });
  a.x = edge - 6; a.y = gy; a.vx = 0; a.vy = 0; a.onground = true; step();
  d.x = a.x + (${dx}); d.y = gy; d.pct = ${pct}; d.vx = 0; d.vy = 0; const st0 = d.stocks, p0 = d.pct, hx = d.x, hy = d.y;
  dirSmash(a, ${dir}); let lostAt = -1;
  for (let t = 0; t < 500; t++){ if(d.pct === p0){ d.x = hx; d.y = hy; d.vx = 0; d.vy = 0; } step(); if(lostAt < 0 && d.stocks < st0) lostAt = t; }
  return JSON.stringify({ pct: ${pct}, hit: d.pct !== p0 || d.stocks < st0, foeLostAStock: d.stocks < st0, atFrame: lostAt });
})()`));
for (const ver of ['old', 'new']) {
  const { window: w } = loadMonolith(0xABCD, ver === 'old' ? () => OLD : undefined); w.eval(SETUP_SRC);
  for (const pct of [0, 30, 60]) console.log(ver, 'Barf Bag down smash at the ledge, a still foe 46 px past her, off the edge:', JSON.stringify(ledge(w, 'Barf Bag', -1, 46, pct)));
  for (const pct of [0, 30, 60]) console.log(ver, 'Bell up smash at the ledge, a still foe over him (dx 0, 70 up):', JSON.stringify(JSON.parse(w.eval(`(function(){
    window.__setupCustomMatch(['Bell', 'Coiny'], 99, 2, 0); for (const f of fighters){ f.controller = 'still'; f.invuln = 0; } for (let i = 0; i < 30; i++) step();
    var a = fighters[0], d = fighters[1]; let edge = null;
    for (const f of fighters){ f.invuln = 0; f.vx = 0; f.vy = 0; f.face = 1; f.smCd = 0; f.atkCd = 0; f.pct = 0; f._mv = null; }
    a.x = WW*0.5; a.y = groundY() - a.r; a.onground = true; const gy = a.y;
    for (let x = WW*0.5; x < WW; x += 4){ a.x = x; a.vx = 0; a.vy = 0; a.y = gy; a.onground = true; step(); if(!a.onground || Math.abs(a.y - gy) > 3){ edge = x - 4; break; } }
    a.x = edge - 6; a.y = gy; a.vx = 0; a.vy = 0; a.onground = true; a.face = 1; step();
    d.x = a.x; d.y = gy - 70; d.pct = ${pct}; const st0 = d.stocks, p0 = d.pct, hx = d.x, hy = d.y;
    dirSmash(a, 1); let lostAt = -1;
    for (let t = 0; t < 500; t++){ if(d.pct === p0){ d.x = hx; d.y = hy; d.vx = 0; d.vy = 0; d.onground = false; } step(); if(lostAt < 0 && d.stocks < st0) lostAt = t; }
    return JSON.stringify({ pct: ${pct}, hit: d.pct !== p0 || d.stocks < st0, foeLostAStock: d.stocks < st0, atFrame: lostAt });
  })()`))));
  if (ver === 'new') {
    const run = (n, dir, dx, dy, pct, pre, moveAt) => JSON.parse(w.eval(`(function(){
      window.__setupCustomMatch([${JSON.stringify(n)}, 'Coiny'], 99, 2, 0); for (const f of fighters){ f.controller = 'still'; f.invuln = 0; } for (let i = 0; i < 30; i++) step();
      var a = fighters[0], d = fighters[1]; for (const f of fighters){ f.invuln = 0; f.x = WW*0.5; f.y = groundY() - f.r; f.vx = 0; f.vy = 0; f.onground = true; f.face = 1; f.smCd = 0; f.atkCd = 0; f.pct = 0; f._mv = null; }
      d.x = a.x + (${dx}); d.y = groundY() - d.r + (${dy}); d.pct = ${pct};
      ${pre || ''}
      const p0 = d.pct; let hx = d.x; const hy = d.y, hvx = d.vx, hvy = d.vy; dirSmash(a, ${dir});
      let vx = 0, vy = 0, hitT = -1, stunMax = 0, freeAt = -1, aFreeAt = -1;
      for (let t = 0; t < 90; t++){
        if(${moveAt == null ? -1 : moveAt} === t) hx = a.x + 55;
        if(d.pct === p0){ d.x = hx; d.vx = hvx; if(${dy} < 0){ d.y = hy; d.vy = hvy; d.onground = false; } }
        step();
        if(d.pct !== p0 && hitT < 0){ hitT = t; vx = d.vx; vy = d.vy; }
        if(hitT >= 0){ stunMax = Math.max(stunMax, d.hitstun || 0); if(freeAt < 0 && !(d.hitstun > 0)) freeAt = t; }
        if(aFreeAt < 0 && !a._mv) aFreeAt = t;
      }
      return JSON.stringify({ took: Math.round((d.pct - p0)*10)/10, hitAtFrame: hitT, vx: Math.round(vx*10)/10, vy: Math.round(vy*10)/10, stun: stunMax, foeFreeAtFrame: freeAt, attackerFreeAtFrame: aFreeAt });
    })()`));
    const P = (l, o) => console.log(l, JSON.stringify(o));
    P('Nickel down, foe held 100 px away, moved to 55 px on frame 12:', run('Nickel', -1, 100, 0, 60, '', 12));
    P('Nickel down, the same but moved in on frame 20 (the field is gone):', run('Nickel', -1, 100, 0, 60, '', 20));
    P('David down, foe facing him:', run('David', -1, 70, 0, 60, 'd.face = -1;'));
    P('David down, foe facing away:', run('David', -1, 70, 0, 60, 'd.face = 1;'));
    P('David up, a foe over his shoulder (dx 50, 40 up):', run('David', 1, 50, -40, 60));
    P('Donut up, foe at the tip:', run('Donut', 1, -6, -110, 60));
    P('Donut up, foe low on the bolt:', run('Donut', 1, 0, -50, 60));
    P('Tree up:', run('Tree', 1, 0, -90, 60));
    P('Gaty up, foe falling straight down at 6:', run('Gaty', 1, 0, -70, 60, 'd.vy = 6;'));
    P('Gaty up, foe coming in from the right at 5 and falling at 3:', run('Gaty', 1, 30, -70, 60, 'd.vx = -5; d.vy = 3;'));
    P('Gaty up, foe rising at 6:', run('Gaty', 1, 0, -70, 60, 'd.vy = -6;'));
    P('Bell up:', run('Bell', 1, 0, -70, 60));
  }
  try { w.close(); } catch {}
}
