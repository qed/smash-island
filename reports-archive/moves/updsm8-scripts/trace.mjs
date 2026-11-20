import os from 'node:os'; try { os.setPriority(0, os.constants.priority.PRIORITY_LOW); } catch(e) {}
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island-work/scripts/helpers/load-monolith.js';
import { SETUP_SRC } from 'file:///C:/Users/carad/Aardvark/smash-island-work/scripts/helpers/match-setup.js';
process.on('uncaughtException', () => {});
const { window: w } = loadMonolith(0xBEEF);
w.eval(SETUP_SRC);
const [name, dir, dx, dy] = [process.argv[2], +process.argv[3], +process.argv[4], +process.argv[5]];
console.log(w.eval(`(function(){ __setupCustomMatch([${JSON.stringify(name)}, 'Coiny'], 99, 2, 0); for (const f of fighters){ f.controller = 'still'; f.invuln = 0; } for (let i = 0; i < 30; i++) step();
  const a = fighters[0], d = fighters[1];
  for (const f of fighters){ f.invuln = 0; f.x = WW*0.5; f.y = groundY() - f.r; f.vx = 0; f.vy = 0; f.onground = true; f.face = 1; f.smCd = 0; f.atkCd = 0; f.pct = 0; f._mv = null; }
  d.x = a.x + ${dx}; d.y = groundY() - d.r + ${dy}; d.pct = 60; const S = dirSmashSpec(a, ${dir}); dirSmash(a, ${dir}); const out = [];
  for (let t = 0; t < S.st + S.act + 4; t++){ const p = d.pct; step(); out.push((a._mv ? a._mv.t - 1 : 'x') + ':' + Math.round(d.x - a.x) + ',' + Math.round(d.y - a.y) + (d.pct !== p ? ' HIT' + Math.round((d.pct - p)*10)/10 : '') + ' inv' + d.invuln + ' hs' + d.hitstun); }
  return out.join(' | '); })()`));
process.exit(0);
