import { loadMonolith } from '../helpers/load-monolith.js';
import { SETUP_SRC } from '../helpers/match-setup.js';
for (const n of ['Leafy','Basketball','Knife','Cheesy','Soap','Gaty','Sidewalky','Trophy']) {
  const { window: w } = loadMonolith(0xC0FFEE); w.eval(SETUP_SRC);
  w.eval(`__setupCustomMatch([${JSON.stringify(n)},'Pen'], 99, 2, 0); fighters.forEach(function(f){ f.controller='still'; f.invuln=0; }); for(let i=0;i<30;i++) step();
   var a=fighters[0], b=fighters[1]; a.x=WW*0.4; a.face=1; a.y=groundY()-a.r; a.vy=0;a.vx=0;a.onground=true; b.x=a.x+900; b.y=a.y; b.onground=true; a.spCd=0;a.smCd=0;a.atkCd=0; window.__x0=a.x;`);
  w.eval('doSmash(a)'); let mx = 0, sgn = 0;
  for (let i = 0; i < 100; i++) { w.eval('step()'); const d = w.eval('a.x - window.__x0'); if (Math.abs(d) > Math.abs(mx)) mx = d; }
  console.log(n, Math.round(mx));
}
