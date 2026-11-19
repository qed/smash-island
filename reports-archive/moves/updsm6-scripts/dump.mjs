// Dumps every move row plus the generated up/down smash of every fighter without an own row, and a roster listing. Run from the worktree root: node dump.mjs out.json
import fs from 'node:fs';
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island-work/scripts/helpers/load-monolith.js';
const OLD = "const msFx = (name, n) => (f, t) => { if(SM_FX[name]) SM_FX[name](t, f, n); };";
const OLD2 = "const msBurn = (n) => (f, t) => { t.burn = Math.max(t.burn || 0, n); };";
let patched = 0;
const { window: w } = loadMonolith(0xC0FFEE, (raw) => { if (raw.indexOf(OLD) < 0 || raw.indexOf(OLD2) < 0) return raw; patched = 1;
  return raw.replace(OLD, "const msFx = (name, n) => Object.assign((f, t) => { if(SM_FX[name]) SM_FX[name](t, f, n); }, { fxName:name, fxN:n });")
            .replace(OLD2, "const msBurn = (n) => Object.assign((f, t) => { t.burn = Math.max(t.burn || 0, n); }, { fxName:'burn', fxN:n });"); });
if (!patched) { console.log('fx lines not found'); process.exit(1); }
const out = w.eval(`(function(){
  const rep = (k, v) => typeof v === 'function' ? (v.fxName ? { fx:v.fxName, n:v.fxN } : 'FN') : v;
  const kitName = {}; for (const c of ROSTER) { if (c && c.kit && c.kit.special) kitName[c.kit.special] = kitName[c.kit.special] || c.name; }
  const rows = [];
  for (const k in MOVESETS) for (const s in MOVESETS[k]) { const S = MOVESETS[k][s]; if (S && S.boxes) rows.push({ who:kitName[k] || k, slot:s, S:S }); }
  for (const n in DSM_OWN) for (const s of ['up','down']) if (DSM_OWN[n][s]) rows.push({ who:n, slot:s + 'smash', S:DSM_OWN[n][s] });
  for (const n in NSM_MV) rows.push({ who:n, slot:'nsmash', S:NSM_MV[n] });
  for (const k in NSM_FIN) rows.push({ who:kitName[k] || k, slot:'finisher', S:NSM_FIN[k] });
  const roster = [], gen = [];
  for (const c of ROSTER) { if(!c) continue;
    const keys = Object.keys(c).filter(k => typeof c[k] !== 'object' && typeof c[k] !== 'function');
    const o = {}; for (const k of keys) o[k] = c[k]; o.special = c.kit && c.kit.special; o.own = !!DSM_OWN[c.name];
    try { o.smashPat = (SMASH_SPEC[o.special] || {}).pat; o.stats = statsFor(c.name); } catch(e){}
    roster.push(o);
    if (c.kit && c.play !== false && !DSM_OWN[c.name]) { try {
      const f = { name:c.name, kit:c.kit, r:c.r || 24 };
      const u = dirSmashSpec(f, 1), d = dirSmashSpec(f, -1);
      gen.push({ who:c.name, slot:'usmash', S:u, gen:true }); gen.push({ who:c.name, slot:'dsmash', S:d, gen:true });
    } catch(e){ o.genErr = String(e.message); } }
  }
  return JSON.stringify({ rows, gen, roster }, rep);
})()`);
fs.writeFileSync(process.argv[2], out);
const J = JSON.parse(out); console.log('rows', J.rows.length, 'gen', J.gen.length, 'roster', J.roster.length);
try { w.close(); } catch {}
