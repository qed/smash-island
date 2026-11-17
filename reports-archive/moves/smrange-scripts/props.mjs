// Every own up/down prop drawn through the RANGE PASS stretch (DSM_GROW, as drawDsmProps does), frames 0..40, both facings; exceptions counted.
import { loadMonolith } from 'file:///C:/Users/carad/Aardvark/smash-island-work/.worktrees/smrange/scripts/helpers/load-monolith.js';
process.on('uncaughtException', () => {});
const { window: w } = loadMonolith(0xBEEF);
console.log(w.eval(`(function(){ let n = 0, calls = 0, grown = 0; const exc = [];
  const c = new Proxy({}, { get:(t, p) => (p === 'measureText' ? () => ({ width:0 }) : () => { calls++; }), set:() => true });
  for (const who in DSM_OWN) for (const d of ['up', 'down']) { const fn = DSM_PROPS[who + '.' + d]; if(!fn){ exc.push('NO PROP ' + who + '.' + d); continue; } n++;
    const gw = DSM_GROW[who + '.' + d]; if(gw) grown++;
    for (const face of [1, -1]) for (let t = 0; t <= 40; t++){ try { fn(c, function(x){ return 500 + (gw ? dsmGx(x, gw[0]) : x)*face; }, function(y){ return 400 + (gw ? dsmGy(y, gw[1]) : y); }, gw ? gw[2] : 1, t); } catch(e){ exc.push(who + '.' + d + ' t' + t + ': ' + String(e.message).slice(0, 80)); } } }
  return 'props ' + n + ' stretched ' + grown + ' canvas calls ' + calls + ' exceptions ' + exc.length + ' ' + exc.slice(0, 5).join(' | '); })()`));
try { w.close(); } catch {}
