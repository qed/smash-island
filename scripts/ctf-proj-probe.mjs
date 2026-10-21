// Reads every fighter's PROJECTILES out of the game's own code, for the Capture the Flag CPUs (aiProjInfo in index.html): each playable kit throws its attack (X) and its special (C) in a bare arena
// and what they put into `projectiles` is summed up: speed, how long it lives, whether gravity bends it, whether it bounces, stops at a surface, pierces, homes, is a trap or a boomerang, how far it goes.
// Nothing is typed in by hand: a kit that changes, or a new one, is picked up by running this again (the table is artifacts/V1/assets/ctf/proj-info.json, keyed by the kit's special).
//
//   node scripts/ctf-proj-probe.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadMonolith } from './helpers/load-monolith.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
const { window: w } = loadMonolith(1);
w.eval(`SETTINGS.mode = 'stock'; SETTINGS.count = 2; SETTINGS.itemRate = 0; beginMatchNow(); fighters.forEach(function(f){ f.controller = 'still'; f.you = false; });`);
const out = {};
const names = JSON.parse(w.eval(`JSON.stringify(ROSTER.filter(function(r){ return r.play && r.kit && r.kit.special; }).map(function(r){ return r.name; }))`));
const sum = (p) => ({
  speed: Math.round(Math.hypot(p.vx || 0, p.vy || 0)*10)/10, vx: Math.round((p.vx || 0)*10)/10, vy: Math.round((p.vy || 0)*10)/10, life: p.life | 0, r: p.r || 0, dmg: Math.round((p.dmg || 0)*10)/10, kb: Math.round((p.kb || 0)*10)/10,
  grav: !!p.grav, bounce: !!p.bounce, pierce: !!p.pierce, breaks: !!p.breaksOnSurface, trap: !!p.trap || !!p.landsTrap, boomerang: !!p.boomerang, homing: !!(p.home || p.homing || p.seek || p.seeks || p.track),
  orbit: !!p.orbit, delay: p.delay | 0, warn: !!(p.warnX != null),
});
let n = 0;
for (const name of names) {
  const r = JSON.parse(w.eval(`(function(){
    var rr = ROSTER.find(function(q){ return q.name === ${JSON.stringify(name)}; });
    var res = { kit: rr.kit.special, atk: [], sp: [], err: null };
    function reset(){ projectiles.length = 0; var f = fighters[0], o = fighters[1]; Object.assign(f, makeFighter(rr, 900, 600, 0)); f.controller = 'still'; f.you = false; f.face = 1; f.onground = true; f.team = 0;
      Object.assign(o, makeFighter(ROSTER.find(function(q){ return q.play && q.name !== rr.name; }), 1300, 600, 1)); o.controller = 'still'; o.you = false; o.onground = true; o.team = 1; f.aiTarget = o; return f; }
    function shoot(kind){ var f = reset(); f.atkCd = 0; f.spCd = 0; f.smCd = 0; var before = projectiles.length;
      try{ if(kind === 'atk') doAttack(f); else doSpecial(f); }catch(e){ res.err = (res.err || '') + kind + ':' + String(e.message).slice(0, 60) + ' '; }
      var made = projectiles.slice(before).filter(function(p){ return p && p.ownerObj === f; }); return made; }
    try{ res.atkRaw = shoot('atk').slice(0, 4); res.spRaw = shoot('sp').slice(0, 6); }catch(e){ res.err = String(e.message).slice(0, 80); }
    var keep = function(a){ return a.map(function(p){ return { vx:p.vx, vy:p.vy, life:p.life, r:p.r, dmg:p.dmg, kb:p.kb, grav:p.grav, bounce:p.bounce, pierce:p.pierce, breaksOnSurface:p.breaksOnSurface, trap:p.trap, landsTrap:p.landsTrap, boomerang:p.boomerang, home:p.home, homing:p.homing, seek:p.seek, orbit:p.orbit, delay:p.delay, warnX:p.warnX }; }); };
    res.atk = keep(res.atkRaw || []); res.sp = keep(res.spRaw || []); delete res.atkRaw; delete res.spRaw; projectiles.length = 0; return JSON.stringify(res); })()`));
  const key = r.kit;
  out[key] = out[key] || { atk: (r.atk || []).map(sum), sp: (r.sp || []).map(sum), kits: [] };
  out[key].kits.push(name);
  if (r.err) out[key].err = r.err;
  n++;
}
const dir = resolve(root, 'artifacts/V1/assets/ctf');
mkdirSync(dir, { recursive: true });
writeFileSync(resolve(dir, 'proj-info.json'), JSON.stringify(out));
const withAtk = Object.values(out).filter(o => o.atk.length).length, withSp = Object.values(out).filter(o => o.sp.length).length;
console.log('kits', n, 'specials', Object.keys(out).length, 'with a thrown attack', withAtk, 'with a thrown special', withSp);
process.exit(0);
