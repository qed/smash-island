// Two pages joined by FAKE sockets (scripts/helpers/net-pair.js; nothing real, NEVER the relay): the guest's human plays each of the twelve and presses
// up + V, then down + V. For each: did the host throw that move, and do the guest and the host agree on both fighters' place, % and stocks afterwards?
// Run from the worktree root: node net.mjs out.json
import fs from 'node:fs';
import { makePair } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/updsm3/scripts/helpers/net-pair.js';
let LATE = 0; process.on('uncaughtException', () => { LATE++; });
const NAMES = ['Nickel', 'Yellow Face', 'Donut', 'Dora', 'David', 'Loser', 'Lollipop', 'Taco', 'Barf Bag', 'Bell', 'Tree', 'Gaty'];
const res = []; let okN = 0;
for (const n of NAMES) {
  const P = await makePair({ hostFighter: 'Tree', cliFighter: n, latency: 40, jitter: 10 });
  const { Hh, Cc, frame } = P; const errs = [];
  Cc.addEventListener('error', e => errs.push('guest ' + String(e.message).slice(0, 100))); Hh.addEventListener('error', e => errs.push('host ' + String(e.message).slice(0, 100)));
  for (let i = 0; i < 60; i++) frame();
  for (const [dir, keys, slot] of [[1, ['jump', 'smash'], 'usmash'], [-1, ['down', 'smash'], 'dsmash']]) {
    // the host's own fighter (a still Tree) is put beside the guest's, a little above for the up smash
    Hh.eval(`(function(){ var g = fighters.find(function(f){ return f.name === ${JSON.stringify(n)}; }), h = fighters.find(function(f){ return f !== g; });
      fighters.forEach(function(f){ f.invuln = 0; f.vx = 0; f.vy = 0; f.smCd = 0; f.atkCd = 0; f.hitstun = 0; });
      g.x = WW*0.5; g.y = groundY() - g.r; g.onground = true; g.face = 1; h.x = g.x + 30; h.y = groundY() - h.r; window.__u0 = (g._used || {})[${JSON.stringify(slot)}] || 0; window.__p0 = h.pct; })()`);
    for (let i = 0; i < 4; i++) frame();
    let propDrawn = 0;
    for (let i = 0; i < 70; i++) { frame(i < 50 ? keys : []); if (Cc.eval(`(function(){ var g = fighters.find(function(f){ return f.name === ${JSON.stringify(n)}; }); return !!(g && g._atkAnim > 0 && g._atkMove && g._atkMove.endsWith(${JSON.stringify('.' + slot)})); })()`)) propDrawn++; }
    for (let i = 0; i < 50; i++) frame([]);
    const h = JSON.parse(Hh.eval(`(function(){ var g = fighters.find(function(f){ return f.name === ${JSON.stringify(n)}; }), h = fighters.find(function(f){ return f !== g; });
      return JSON.stringify({ thrown: ((g._used || {})[${JSON.stringify(slot)}] || 0) - window.__u0, took: Math.round((h.pct - window.__p0)*10)/10, f: fighters.map(function(f){ return { n:f.name, x:f.x, y:f.y, pct:f.pct, st:f.stocks }; }) }); })()`));
    const c = JSON.parse(Cc.eval(`JSON.stringify(fighters.map(function(f){ return { n:f.name, x:f.x, y:f.y, pct:f.pct, st:f.stocks }; }))`));
    let dx = 0, dp = 0, st = true;
    for (const a of h.f) { const b = c.find(q => q.n === a.n); if (!b) { st = false; continue; } dx = Math.max(dx, Math.abs(a.x - b.x), Math.abs(a.y - b.y)); dp = Math.max(dp, Math.abs(a.pct - b.pct)); if (a.st !== b.st) st = false; }
    const ok = h.thrown >= 1 && dx <= 3 && dp <= 0.01 && st && !errs.length;
    if (ok) okN++;
    res.push({ n, slot, thrown: h.thrown, took: h.took, guestSawMoveFrames: propDrawn, maxPosGap: Math.round(dx*100)/100, maxPctGap: dp, stocksAgree: st, errs: errs.slice(0, 3), ok });
    console.log(n, slot, 'thrown on host', h.thrown, '| the Tree took', h.took, '| guest saw the move on', propDrawn, 'frames | max place gap', Math.round(dx*100)/100, 'px, max % gap', dp, '| stocks agree', st, '| errors', errs.length ? errs.slice(0, 2) : 0, ok ? 'OK' : 'NOT OK');
  }
  fs.writeFileSync(process.argv[2], JSON.stringify(res));
  try { Hh.close(); Cc.close(); } catch {}
}
console.log('ok', okN, 'of', res.length, '| late exceptions', LATE);
process.exit(0);
