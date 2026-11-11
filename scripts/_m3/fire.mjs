import { loadMonolith } from '../helpers/load-monolith.js';
import { SETUP_SRC } from '../helpers/match-setup.js';
const T = [['Leafy','smash'],['Basketball','smash'],['Knife','smash'],['Cheesy','up'],['Cheesy','smash'],['Soap','up'],['Soap','smash'],['Gaty','smash'],['Sidewalky','up'],['Sidewalky','smash'],['Paintbrush','up'],['Trophy','up'],['Trophy','smash'],['Blueberry','up']];
const out = [];
for (const [n, slot] of T) {
  const errs = [];
  let res = {};
  try {
    for (const dist of [60, 140, 230]) {
      const { window: w } = loadMonolith(0xC0FFEE);
      w.addEventListener('error', e => errs.push(String(e.message)));
      w.eval(SETUP_SRC);
      w.eval(`__setupCustomMatch([${JSON.stringify(n)},'Pen'], 99, 2, 0); fighters.forEach(function(f){ f.controller='still'; f.invuln=0; }); for(let i=0;i<30;i++) step();
        var a=fighters[0], b=fighters[1]; a.x=WW*0.5; a.face=1; a.y=groundY()-a.r; a.vy=0; a.vx=0; a.onground=true; b.x=a.x+${dist}; b.y=a.y; b.onground=true; b.vx=0;b.vy=0; b.pct=0; b.invuln=0; a.spCd=0;a.smCd=0;a.atkCd=0; a.pct=0; window.__p0=a.pct; window.__x0=a.x; window.__y0=a.y;`);
      w.eval(slot === 'up' ? 'doUpSpecial(a)' : 'doSmash(a)');
      let maxdx = 0, miny = 0, mp = 0;
      for (let i = 0; i < 120; i++) { w.eval('step()'); maxdx = Math.max(maxdx, Math.abs(w.eval('a.x - window.__x0'))); miny = Math.min(miny, w.eval('a.y - window.__y0')); mp = Math.max(mp, w.eval('b.pct')); }
      res['pct@' + dist] = Math.round(mp * 10) / 10;
      res['carry'] = Math.round(maxdx); res['rise'] = Math.round(-miny);
      res['selfpct'] = Math.round(w.eval('a.pct'));
    }
  } catch (e) { errs.push(e.message.slice(0, 120)); }
  out.push(n + ' ' + slot + ' ' + JSON.stringify(res) + ' errors=' + (errs.length ? errs.slice(0, 2) : 0));
}
console.log(out.join('\n'));
